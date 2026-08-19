/**
 * ATLAS AEI Payload Validation — load-time enforcement for the committed artifacts.
 *
 * Called at module load by src/data/anthropic/index.ts (the pattern of
 * validateGovernmentData at constants.ts module load) and by the transform script
 * before writing. Throws a developer-facing Error on any violation — missing or
 * malformed committed data is a build/data defect, never a user-facing condition
 * and never something to estimate around.
 */

import type { DataCalibrationMetadata, DataCalibrationPayload } from './types';
import { COLLABORATION_MODES } from './transform';

/** The full cluster census size (occupationClusters.ts — 51 clusters). */
const TOTAL_CLUSTER_COUNT = 51;

/** Weight-sum identity tolerance (agentic is derived as the exact remainder). */
const WEIGHT_SUM_TOLERANCE = 1e-9;

// WITHDRAWN (Finding-3 design decision, 2026-08-03): the Better-threshold anchor bounds — the
// leg is out of v1; the validator now REJECTS committed data carrying the field.
// const BETTER_THRESHOLD_MIN = 0.1;
// const BETTER_THRESHOLD_MAX = 0.95;

function fail(message: string): never {
  throw new Error(
    `[ATLAS] AEI data-calibration payload invalid: ${message}. `
    + 'The committed artifact under src/data/anthropic/ is malformed — re-run '
    + '"npm run fetch-anthropic" and "npm run transform-anthropic" (developer-facing; '
    + 'this is never a user configuration problem).');
}

function assertFiniteInRange(value: unknown, min: number, max: number, label: string): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) fail(`${label} is not a finite number`);
  if (value < min || value > max) fail(`${label}=${value} outside [${min}, ${max}]`);
}

/** Deep no-NaN sweep over every numeric leaf. */
function sweepNoNaN(node: unknown, path: string): void {
  if (typeof node === 'number') {
    if (Number.isNaN(node)) fail(`NaN at ${path}`);
    return;
  }
  if (node !== null && typeof node === 'object') {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      sweepNoNaN(v, `${path}.${k}`);
    }
  }
}

export function validateDataCalibrationPayload(payload: DataCalibrationPayload): void {
  if (payload.source !== 'aei') fail(`unknown source "${payload.source}"`);
  if (payload.population !== '1p_api') {
    fail(`committed payload population must be '1p_api' (the adopted population decision), got "${payload.population}"`);
  }
  if (!Array.isArray(payload.windows) || payload.windows.length === 0) fail('windows empty');

  sweepNoNaN(payload, 'payload');
  assertFiniteInRange(payload.overall.automationSharePooled, 0, 1, 'overall.automationSharePooled');

  const { coverage } = payload;
  const appliedIds = Object.keys(payload.clusters);
  const informationalIds = Object.keys(payload.clustersInformational);
  if (coverage.clustersApplied !== appliedIds.length) {
    fail(`coverage.clustersApplied=${coverage.clustersApplied} but clusters has ${appliedIds.length} entries`);
  }
  if (coverage.clustersInformationalCount !== informationalIds.length) {
    fail(`coverage.clustersInformationalCount=${coverage.clustersInformationalCount} but clustersInformational has ${informationalIds.length} entries`);
  }
  if (coverage.clustersWithData !== coverage.clustersApplied + coverage.clustersInformationalCount) {
    fail('coverage identity broken: withData != applied + informational');
  }
  if (coverage.clustersWithData + coverage.clustersMissing.length !== TOTAL_CLUSTER_COUNT) {
    fail(`coverage identity broken: ${coverage.clustersWithData} with data + ${coverage.clustersMissing.length} missing != ${TOTAL_CLUSTER_COUNT}`);
  }
  const overlap = appliedIds.filter((id) => id in payload.clustersInformational
    || coverage.clustersMissing.includes(id));
  if (overlap.length > 0) fail(`cluster blocks overlap: ${overlap.join(', ')}`);

  for (const [id, c] of [...Object.entries(payload.clusters), ...Object.entries(payload.clustersInformational)]) {
    assertFiniteInRange(c.automationShare, 0, 1, `clusters.${id}.automationShare`);
    for (const mode of COLLABORATION_MODES) {
      const v = c.collaborationModesPct[mode];
      if (v !== undefined) assertFiniteInRange(v, 0, 100, `clusters.${id}.collaborationModesPct.${mode}`);
    }
    if (c.socCodesMatched.length === 0) fail(`clusters.${id} has data but zero matched SOC codes`);
    for (const [month, m] of Object.entries(c.byMonth)) {
      assertFiniteInRange(m.automationShare, 0, 1, `clusters.${id}.byMonth.${month}.automationShare`);
    }
  }
  for (const [id, c] of Object.entries(payload.clusters)) {
    if (c.weights) {
      assertFiniteInRange(c.weights.generative, 0, 1, `clusters.${id}.weights.generative`);
      assertFiniteInRange(c.weights.agentic, 0, 1, `clusters.${id}.weights.agentic`);
      // The embodied complement: generative + agentic must equal 1 − hand-authored
      // embodied weight — asserted against the payload's own derived sum staying < 1.
      if (c.weights.generative + c.weights.agentic > 1 + WEIGHT_SUM_TOLERANCE) {
        fail(`clusters.${id}.weights sum above 1`);
      }
    }
    // The Finding-3 withdrawal, ENFORCED (never merely documented): the committed
    // payload must not carry the withdrawn threshold-anchor field.
    if ('betterThresholdByRole' in c) {
      fail(`clusters.${id} carries betterThresholdByRole — the threshold-anchor leg `
        + 'was withdrawn (Finding-3 ruling, 2026-08-03); the payload carries automation '
        + 'share and capability weights only');
    }
  }
}

export function validateDataCalibrationMetadata(metadata: DataCalibrationMetadata): void {
  if (!metadata.releaseId) fail('metadata.releaseId missing');
  if (!/^[0-9a-f]{40}$/.test(metadata.sourceCommitSha)) {
    fail(`metadata.sourceCommitSha is not a 40-hex commit sha: "${metadata.sourceCommitSha}"`);
  }
  if (!Array.isArray(metadata.files) || metadata.files.length === 0) fail('metadata.files empty');
  for (const f of metadata.files) {
    if (!/^[0-9a-f]{64}$/.test(f.sha256)) fail(`metadata file "${f.path}" sha256 malformed`);
    if (!Number.isInteger(f.bytes) || f.bytes <= 0) fail(`metadata file "${f.path}" bytes malformed`);
  }
  if (!metadata.license.includes('CC-BY')) fail('metadata.license must state the CC-BY data license');
}
