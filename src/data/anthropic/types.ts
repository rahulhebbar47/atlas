/**
 * ATLAS Data-Calibration Payload Types — Anthropic Economic Index (AEI) pipeline.
 *
 * The committed artifact contract for a data-calibration snapshot: the transform script
 * (scripts/transform-anthropic-data.ts) emits `processed.json` + `metadata.json`
 * conforming to these shapes; the loader (src/data/anthropic/index.ts) validates them
 * at module load (throw-on-mismatch — schema assumptions are enforced, never documented).
 *
 * Population: the committed payload carries FIRST-PARTY API values only. The consumer
 * (claude_ai) transform exists as a script flag whose output is never committed.
 *
 * Cluster partition (three disjoint blocks, identity validated at load):
 *   clusters (applied)        — cognitive clusters with published data; the values the
 *                               data-calibration preset supplies to the simulation.
 *   clustersInformational     — embodied clusters with published data; carried for
 *                               transparency, NEVER applied (conversation data measures
 *                               what people ask, not what can be physically automated).
 *   coverage.clustersMissing  — clusters with no published cell; they keep their
 *                               ATLAS-authored defaults (absent is absent — never zero,
 *                               never estimated).
 */

/** One V6 CSV row after numeric parsing (schema: release data_documentation.md). */
export interface AeiCsvRow {
  date_start: string;
  date_end: string;
  geo_id: string;
  geo_level: string;
  category_name: string;
  hierarchy_level: string;
  metric_id: string;
  value: number;
  node_name: string;
  node_external_id: string;
}

/** The join spec for one occupation cluster (derived from occupationClusters.ts). */
export interface ClusterJoinSpec {
  id: string;
  /** Canonical 6-digit SOC codes (occupationClusters.ts — the authoritative list). */
  socCodes: readonly string[];
  /** Member of EMBODIED_CLUSTER_ALPHA_DEFAULTS → informational block, never applied. */
  isEmbodied: boolean;
  /** Hand-authored embodied capability weight — preserved verbatim in renormalization. */
  embodiedWeight: number;
  /** Role ids. (The threshold-anchor consumer was withdrawn with the Finding-3 design decision;
   *  the field stays on the spec — the join's role census is provenance worth carrying.) */
  roleIds: readonly string[];
}

/** Per-cluster calibration values (applied block). */
export interface CalibratedCluster {
  /** α — automation share of the cluster's observed AI usage, [0,1].
   *  Basis: usage-weighted pool of the release's monthly windows. */
  automationShare: number;
  /** Collaboration-mode mix, percent (directive, feedback_loop, task_iteration,
   *  learning, validation, none). Basis: same pool. */
  collaborationModesPct: Record<string, number>;
  /** Renormalized capability weights: generative + agentic + (hand-authored embodied)
   *  = 1 exactly (agentic derived as the remainder). Absent if mode data suppressed. */
  weights?: { generative: number; agentic: number };
  // WITHDRAWN (Finding-3 design decision, 2026-08-03 — the clamp-fabrication genus): the
  // Better-threshold anchor field. The back-derivation saturated the clamp floor for
  // every applied cluster at observed API automation levels; deferred to the register
  // for FORMULA VALIDITY. The payload carries α + capability weights only; the
  // validator REJECTS committed data carrying this field.
  // betterThresholdByRole?: Record<string, number>;
  /** Mean of the monthly usage shares this cluster's matched SOC codes carried. */
  usagePctMean: number;
  socCodesMatched: string[];
  socCodesTotal: number;
  /** The audit trail: per-window α and usage. */
  byMonth: Record<string, { automationShare: number; usagePct: number }>;
}

/** Informational block entry (embodied clusters): observed, never applied. */
export interface InformationalCluster {
  automationShare: number;
  collaborationModesPct: Record<string, number>;
  usagePctMean: number;
  socCodesMatched: string[];
  socCodesTotal: number;
  byMonth: Record<string, { automationShare: number; usagePct: number }>;
}

export interface DataCalibrationPayload {
  source: 'aei';
  sourceName: string;
  releaseId: string;
  population: '1p_api' | 'claude_ai';
  populationNote: string;
  /** Monthly windows, e.g. ['2026-04', '2026-05']. */
  windows: string[];
  overall: {
    /** Fraction [0,1]; basis: mean of the monthly overall automation shares. */
    automationSharePooled: number;
    /** The published collaboration metrics per window, percent — the audit trail. */
    byMonth: Record<string, Record<string, number>>;
  };
  clusters: Record<string, CalibratedCluster>;
  clustersInformational: Record<string, InformationalCluster>;
  coverage: {
    /** applied + informational (identity: = clustersApplied + clustersInformationalCount). */
    clustersWithData: number;
    clustersApplied: number;
    clustersInformationalCount: number;
    /** Identity: clustersWithData + clustersMissing.length === 51. */
    clustersMissing: string[];
    /** Share of the geography's usage matched into any cluster's SOC list, per window. */
    socUniverseMatchedUsagePct: Record<string, number>;
    missingCellPolicy: string;
  };
  diagnostics: {
    nodeMonthsTotal: number;
    /** Node-months carrying usage but no collaboration bucket metrics (true suppression). */
    nodeMonthsMissingCollaboration: number;
    /** Node-months whose usage share is published as 0.00 (rounding, not suppression) —
     *  excluded from weighted aggregation. */
    zeroWeightNodeMonths: number;
    bucketIdentityChecked: number;
    bucketIdentityMaxAbsErrorPp: number;
  };
  validation: {
    observedExposureSource: string;
    anchors: Record<string, number>;
  };
}

export interface DataCalibrationMetadata {
  releaseId: string;
  datasetRepo: string;
  sourceCommitSha: string;
  fetchedAt: string;
  license: string;
  files: Array<{ path: string; bytes: number; sha256: string }>;
}
