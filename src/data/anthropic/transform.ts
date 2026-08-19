/**
 * ATLAS AEI Transform — pure functions turning V6 release rows into a
 * DataCalibrationPayload.
 *
 * PURE — no I/O, no state. The script driver (scripts/transform-anthropic-data.ts)
 * parses the cached CSVs and calls transformDataCalibration(); tests call it on
 * fixtures. Every schema assumption is ENFORCED here as a thrown TransformInvariantError
 * (the enforcement law: reading verifies what data claims, only execution verifies what
 * it is).
 *
 * Pipeline (basis: each value is a monthly-window value or the usage-weighted pool of
 * the release's monthly windows):
 *   V6 global soc_occupation L0 rows (O*NET-SOC 8-digit keyed)
 *     → node-month records                      [invariants 1-4]
 *     → 6-digit SOC per month                   (usage-pct-weighted over sub-occupations)
 *     → cluster per month                       (usage-pct-weighted over the canonical SOC list)
 *     → pooled across months                    (usage-weighted)
 *   + collaboration-mode mix aggregated identically
 *   + capability-weight renormalization (embodied preserved verbatim)
 *   (Better-threshold anchors WITHDRAWN — Finding-3 design decision 2026-08-03; see the
 *    constants block below. The payload carries α + capability weights only.)
 *   + coverage partition: applied / informational / missing (identity: sums to 51)
 *
 * Missing cells stay missing — never zero, never estimated. A usage share published as
 * 0.00 is a rounding zero (below 0.005%), not suppression: excluded from weighted
 * aggregation and counted separately.
 */

import type {
  AeiCsvRow,
  CalibratedCluster,
  ClusterJoinSpec,
  DataCalibrationPayload,
  InformationalCluster,
} from './types';

// ============================================================
// Named constants (sources cited)
// ============================================================

/** The V6 column set, verbatim from release_2026_06_26/data_documentation.md. */
export const AEI_EXPECTED_COLUMNS: readonly string[] = [
  'date_start', 'date_end', 'geo_id', 'geo_level', 'category_name',
  'hierarchy_level', 'metric_id', 'value', 'node_name', 'node_external_id',
];

/** V6 L0 soc_occupation nodes are O*NET-SOC 8-digit codes (empirical survey finding). */
const ONET_SOC_DETAIL_PATTERN = /^\d{2}-\d{4}\.\d{2}$/;

/** An O*NET-SOC code's first 7 characters are its 6-digit SOC code (NN-NNNN). */
const SOC_PREFIX_LENGTH = 7;

/** The five collaboration patterns plus 'none', per the V6 documentation. */
export const COLLABORATION_MODES: readonly string[] = [
  'directive', 'feedback_loop', 'task_iteration', 'learning', 'validation', 'none',
];

/** Mode → bucket mapping (V6 documentation; verified empirically):
 *  automation = directive + feedback_loop; augmentation = task_iteration + learning
 *  + validation; 'none' excluded and renormalized. */
const AUTOMATION_MODES: readonly string[] = ['directive', 'feedback_loop'];
const AUGMENTATION_MODES: readonly string[] = ['task_iteration', 'learning', 'validation'];

/** Tolerance for automation + augmentation = 100 (values published at 2 decimals). */
const COMPLEMENT_TOLERANCE_PP = 0.02;

/** Tolerance for the bucket≡modes identity
 *  automation = (directive + feedback_loop) / (1 − none/100):
 *  bound for 2-decimal published inputs; measured max on the full V6 file is 0.0195. */
const BUCKET_IDENTITY_TOLERANCE_PP = 0.06;

// WITHDRAWN (Finding-3 design decision, 2026-08-03 — the clamp-fabrication genus): the
// Better-threshold anchor leg. At observed API automation levels (α 0.75–0.98) the
// step-5 back-derivation B* = B0 × (1 − α) saturated the 0.1 clamp floor for every
// applied cluster — the clamp produced the value, not the data. The leg defers to the
// register for FORMULA VALIDITY (the derivation degenerates as α → 1); the payload
// carries α + capability weights only.
// const BETTER_THRESHOLD_MIN = 0.1;
// const BETTER_THRESHOLD_MAX = 0.95;

/** Committed-payload precision: automation shares and usage at 4 decimals (matches the
 *  adopted survey prototype), mode percentages at 2 (the source's own precision). */
const round4 = (x: number): number => Math.round(x * 1e4) / 1e4;
const round2 = (x: number): number => Math.round(x * 1e2) / 1e2;
/** Capability-weight precision: generative rounded to 6 decimals; agentic derived as
 *  the exact remainder so generative + agentic + embodied = 1 by construction. */
const round6 = (x: number): number => Math.round(x * 1e6) / 1e6;

export class TransformInvariantError extends Error {
  constructor(message: string) {
    super(`AEI transform invariant violation: ${message}`);
    this.name = 'TransformInvariantError';
  }
}

// ============================================================
// Internal aggregation shapes
// ============================================================

interface NodeMonthRecord {
  metrics: Map<string, number>;
  name: string;
}

interface SocMonthAggregate {
  weight: number;                 // Σ pct over contributing sub-occupation nodes
  automationWeighted: number;     // Σ pct × automation_pct
  modesWeighted: Map<string, number>;  // per mode: Σ pct × mode_pct (present metrics only)
  nodeCount: number;
}

interface MonthlyClusterAggregate {
  automationShare: number;        // fraction, 4dp
  usagePct: number;               // 4dp
  socMatched: string[];
  modesPct: Map<string, number>;  // 2dp, percent
}

export interface TransformInputs {
  rows: readonly AeiCsvRow[];
  specs: readonly ClusterJoinSpec[];
  population: '1p_api' | 'claude_ai';
  releaseId: string;
  // WITHDRAWN with the threshold-anchor leg (Finding-3 design decision, 2026-08-03) — the
  // start-year capability scores were the B0 basis and have no other consumer:
  // capabilityScoresAtStart: { generative: number; agentic: number; embodied: number };
  /** Observed-exposure anchors carried into the validation block (reported-only). */
  validationAnchors: Record<string, number>;
  observedExposureSource: string;
  populationNote: string;
  sourceName: string;
}

// ============================================================
// The transform
// ============================================================

export function transformDataCalibration(inputs: TransformInputs): DataCalibrationPayload {
  const { rows, specs, population, releaseId } = inputs;

  if (specs.length !== 51) {
    throw new TransformInvariantError(`expected 51 cluster specs, got ${specs.length}`);
  }

  // ── Pass 1: rows → node-month records + overall block, invariants 1–4 ──
  const nodes = new Map<string, NodeMonthRecord>();          // "onetId|month"
  const overallByMonth = new Map<string, Map<string, number>>();
  for (const row of rows) {
    if (row.geo_level !== 'global') {
      throw new TransformInvariantError(`non-global row reached the transform (geo_level=${row.geo_level})`);
    }
    const value = row.value;
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new TransformInvariantError(`non-numeric value at ${row.category_name}/${row.node_external_id}/${row.metric_id}`);
    }
    // The usage-share metric is named 'pct' exactly (no underscore) — the endsWith
    // guard alone missed it; found by test B4.5's fixture.
    if ((row.metric_id === 'pct' || row.metric_id.endsWith('_pct')) && (value < 0 || value > 100)) {
      throw new TransformInvariantError(`percentage out of [0,100]: ${row.metric_id}=${value} at ${row.node_external_id}`);
    }
    const month = row.date_start.slice(0, 7);
    if (row.category_name === 'overall') {
      const m = overallByMonth.get(month) ?? new Map<string, number>();
      m.set(row.metric_id, value);
      overallByMonth.set(month, m);
    } else if (row.category_name === 'soc_occupation' && row.hierarchy_level === '0') {
      const id = row.node_external_id;
      if (!ONET_SOC_DETAIL_PATTERN.test(id)) {
        throw new TransformInvariantError(`level-0 soc node id is not O*NET-SOC 8-digit form: "${id}"`);
      }
      const key = `${id}|${month}`;
      const rec = nodes.get(key) ?? { metrics: new Map<string, number>(), name: row.node_name };
      rec.metrics.set(row.metric_id, value);
      nodes.set(key, rec);
    }
    // soc_occupation L1 (major groups) and other categories: not consumed by this transform.
  }

  const months = [...new Set([...nodes.keys()].map((k) => k.split('|')[1]!))].sort();
  if (months.length === 0) {
    throw new TransformInvariantError('no soc_occupation level-0 rows found');
  }

  // ── Invariants 5–6 per node-month: complement + bucket≡modes identity ──
  const diagnostics = {
    nodeMonthsTotal: nodes.size,
    nodeMonthsMissingCollaboration: 0,
    zeroWeightNodeMonths: 0,
    bucketIdentityChecked: 0,
    bucketIdentityMaxAbsErrorPp: 0,
  };
  const checkBucketIdentity = (metrics: Map<string, number>, where: string): void => {
    const automation = metrics.get('collaboration_bucket_automation_pct');
    const augmentation = metrics.get('collaboration_bucket_augmentation_pct');
    if (automation !== undefined && augmentation !== undefined
      && Math.abs(automation + augmentation - 100) > COMPLEMENT_TOLERANCE_PP) {
      throw new TransformInvariantError(
        `automation + augmentation != 100 at ${where}: ${automation} + ${augmentation}`);
    }
    const modeValues = COLLABORATION_MODES.map((m) => metrics.get(`collaboration_${m}_pct`));
    if (automation === undefined || modeValues.some((v) => v === undefined)) return;
    const none = metrics.get('collaboration_none_pct')!;
    if (none >= 100) return;
    const directiveSum = AUTOMATION_MODES
      .reduce((s, m) => s + metrics.get(`collaboration_${m}_pct`)!, 0);
    const derived = directiveSum / (1 - none / 100);
    const err = Math.abs(derived - automation);
    diagnostics.bucketIdentityChecked += 1;
    diagnostics.bucketIdentityMaxAbsErrorPp = Math.max(diagnostics.bucketIdentityMaxAbsErrorPp, err);
    if (err > BUCKET_IDENTITY_TOLERANCE_PP) {
      throw new TransformInvariantError(
        `bucket≡modes identity broken at ${where}: derived ${derived.toFixed(4)} vs published ${automation}`);
    }
  };
  for (const [key, rec] of nodes) checkBucketIdentity(rec.metrics, key);
  for (const [month, metrics] of overallByMonth) checkBucketIdentity(metrics, `overall|${month}`);

  // ── O*NET sub-occupations → 6-digit SOC per month (usage-pct-weighted) ──
  const socMonth = new Map<string, SocMonthAggregate>();     // "soc|month"
  for (const [key, rec] of nodes) {
    const keyParts = key.split('|');
    const onetId = keyParts[0]!;
    const month = keyParts[1]!;
    const automation = rec.metrics.get('collaboration_bucket_automation_pct');
    if (automation === undefined) {
      diagnostics.nodeMonthsMissingCollaboration += 1;
      continue;
    }
    const weight = rec.metrics.get('pct');
    if (weight === undefined || weight <= 0) {
      diagnostics.zeroWeightNodeMonths += 1;
      continue;
    }
    const soc = onetId.slice(0, SOC_PREFIX_LENGTH);
    const aggKey = `${soc}|${month}`;
    const agg = socMonth.get(aggKey)
      ?? { weight: 0, automationWeighted: 0, modesWeighted: new Map<string, number>(), nodeCount: 0 };
    agg.weight += weight;
    agg.automationWeighted += weight * automation;
    agg.nodeCount += 1;
    for (const mode of COLLABORATION_MODES) {
      const v = rec.metrics.get(`collaboration_${mode}_pct`);
      if (v !== undefined) {
        agg.modesWeighted.set(mode, (agg.modesWeighted.get(mode) ?? 0) + weight * v);
      }
    }
    socMonth.set(aggKey, agg);
  }

  // ── SOC → cluster per month, then pooled across months ──
  const sortedSpecs = [...specs].sort((a, b) => a.id.localeCompare(b.id));
  const applied: Record<string, CalibratedCluster> = {};
  const informational: Record<string, InformationalCluster> = {};
  const missing: string[] = [];

  for (const spec of sortedSpecs) {
    const perMonth = new Map<string, MonthlyClusterAggregate>();
    for (const month of months) {
      let weightSum = 0;
      let automationSum = 0;
      const modesSum = new Map<string, number>();
      const matched: string[] = [];
      for (const soc of spec.socCodes) {
        const agg = socMonth.get(`${soc}|${month}`);
        if (!agg) continue;
        matched.push(soc);
        weightSum += agg.weight;
        automationSum += agg.automationWeighted;
        for (const mode of COLLABORATION_MODES) {
          modesSum.set(mode, (modesSum.get(mode) ?? 0) + (agg.modesWeighted.get(mode) ?? 0));
        }
      }
      if (weightSum > 0) {
        const modesPct = new Map<string, number>();
        for (const mode of COLLABORATION_MODES) {
          modesPct.set(mode, round2((modesSum.get(mode) ?? 0) / weightSum));
        }
        perMonth.set(month, {
          automationShare: round4(automationSum / weightSum / 100),
          usagePct: round4(weightSum),
          socMatched: matched,
          modesPct,
        });
      }
    }
    if (perMonth.size === 0) {
      missing.push(spec.id);
      continue;
    }

    // Pool across months, weighting each month by its usage share (adopted D3).
    const totalUsage = [...perMonth.values()].reduce((s, m) => s + m.usagePct, 0);
    const pooledAlphaRaw = [...perMonth.values()]
      .reduce((s, m) => s + m.automationShare * m.usagePct, 0) / totalUsage;
    const pooledAlpha = round4(pooledAlphaRaw);
    if (pooledAlpha < 0 || pooledAlpha > 1 || Number.isNaN(pooledAlpha)) {
      throw new TransformInvariantError(`pooled automation share out of [0,1] for ${spec.id}: ${pooledAlpha}`);
    }
    const pooledModes: Record<string, number> = {};
    for (const mode of COLLABORATION_MODES) {
      pooledModes[mode] = round2([...perMonth.values()]
        .reduce((s, m) => s + (m.modesPct.get(mode) ?? 0) * m.usagePct, 0) / totalUsage);
    }
    const base = {
      automationShare: pooledAlpha,
      collaborationModesPct: pooledModes,
      usagePctMean: round4(totalUsage / perMonth.size),
      socCodesMatched: [...new Set([...perMonth.values()].flatMap((m) => m.socMatched))].sort(),
      socCodesTotal: spec.socCodes.length,
      byMonth: Object.fromEntries([...perMonth.entries()].map(([month, m]) => [
        month, { automationShare: m.automationShare, usagePct: m.usagePct },
      ])),
    };

    if (spec.isEmbodied) {
      informational[spec.id] = base;
      continue;
    }

    // ── Capability-weight renormalization (embodied preserved verbatim) ──
    const agenticSignal = AUTOMATION_MODES.reduce((s, m) => s + (pooledModes[m] ?? 0), 0);
    const generativeSignal = AUGMENTATION_MODES.reduce((s, m) => s + (pooledModes[m] ?? 0), 0);
    const cluster: CalibratedCluster = { ...base };
    if (agenticSignal + generativeSignal > 0) {
      const agenticShare = agenticSignal / (agenticSignal + generativeSignal);
      const softwareBudget = 1 - spec.embodiedWeight;
      const generativeWeight = round6(softwareBudget * (1 - agenticShare));
      // Exact remainder: generative + agentic + embodied = 1 by construction.
      const agenticWeight = 1 - spec.embodiedWeight - generativeWeight;
      cluster.weights = { generative: generativeWeight, agentic: agenticWeight };

      // WITHDRAWN (Finding-3 design decision, 2026-08-03): the Better-threshold anchor
      // derivation B* = clamp(B0 × (1 − α)). All 25 applied clusters saturated the
      // 0.1 clamp floor at observed API automation levels — the clamp produced the
      // value, not the data (the clamp-fabrication genus). Deferred to the register
      // for FORMULA VALIDITY (the derivation degenerates as α → 1). Retained per the
      // no-delete rule; any revival needs a formula whose output at observed
      // automation levels is not the clamp:
      // const scores = inputs.capabilityScoresAtStart;
      // const weightEntries: Array<[number, number]> = [
      //   [generativeWeight, scores.generative],
      //   [agenticWeight, scores.agentic],
      //   [spec.embodiedWeight, scores.embodied],
      // ];
      // let weightedSum = 0;
      // let totalWeight = 0;
      // for (const [w, score] of weightEntries) {
      //   if (w > 0) { weightedSum += score * w; totalWeight += w; }
      // }
      // const betterBasis = totalWeight > 0 ? Math.min(1, weightedSum / totalWeight) : 0;
      // const anchor = round4(Math.max(BETTER_THRESHOLD_MIN,
      //   Math.min(BETTER_THRESHOLD_MAX, betterBasis * (1 - pooledAlpha))));
      // cluster.betterThresholdByRole = Object.fromEntries(spec.roleIds.map((r) => [r, anchor]));
    }
    applied[spec.id] = cluster;
  }

  // ── Coverage identity (invariant 7) ──
  const appliedCount = Object.keys(applied).length;
  const informationalCount = Object.keys(informational).length;
  const withData = appliedCount + informationalCount;
  if (withData + missing.length !== 51) {
    throw new TransformInvariantError(
      `coverage identity broken: ${appliedCount} applied + ${informationalCount} informational + ${missing.length} missing != 51`);
  }

  // ── Usage capture per month (share of the geography's usage inside any cluster list) ──
  const allClusterSocs = new Set(sortedSpecs.flatMap((s) => [...s.socCodes]));
  const socUniverseMatchedUsagePct: Record<string, number> = {};
  for (const month of months) {
    let matchedUsage = 0;
    for (const [key, agg] of socMonth) {
      const keyParts = key.split('|');
      if (keyParts[1] === month && allClusterSocs.has(keyParts[0]!)) matchedUsage += agg.weight;
    }
    socUniverseMatchedUsagePct[month] = round2(matchedUsage);
  }

  // ── Overall block ──
  const overallMonths = [...overallByMonth.keys()].sort();
  const overallAutomation = overallMonths
    .map((m) => overallByMonth.get(m)!.get('collaboration_bucket_automation_pct'))
    .filter((v): v is number => v !== undefined);
  if (overallAutomation.length !== overallMonths.length) {
    throw new TransformInvariantError('overall collaboration_bucket_automation_pct missing for a window');
  }

  return {
    source: 'aei',
    sourceName: inputs.sourceName,
    releaseId,
    population,
    populationNote: inputs.populationNote,
    windows: months,
    overall: {
      automationSharePooled: round4(
        overallAutomation.reduce((s, v) => s + v, 0) / overallAutomation.length / 100),
      byMonth: Object.fromEntries(overallMonths.map((m) => [
        m,
        Object.fromEntries([...overallByMonth.get(m)!.entries()]
          .filter(([k]) => k.startsWith('collaboration'))
          .sort(([a], [b]) => a.localeCompare(b))),
      ])),
    },
    clusters: applied,
    clustersInformational: informational,
    coverage: {
      clustersWithData: withData,
      clustersApplied: appliedCount,
      clustersInformationalCount: informationalCount,
      clustersMissing: missing,
      socUniverseMatchedUsagePct,
      missingCellPolicy: 'absent cells stay absent — never zero, never estimated',
    },
    diagnostics,
    validation: {
      observedExposureSource: inputs.observedExposureSource,
      anchors: inputs.validationAnchors,
    },
  };
}
