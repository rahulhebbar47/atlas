/**
 * ATLAS AEI Data-Calibration Loader — the committed-artifact entry point.
 *
 * STATIC imports only (the loadGovernmentData doctrine: globs were retired after they
 * silently referenced nonexistent filenames). Each snapshot is imported by name;
 * adding a future snapshot = one import + one registry entry.
 *
 * Validation runs AT MODULE LOAD (the validateGovernmentData pattern): malformed or
 * missing committed data throws a developer-facing error immediately — never a
 * user-facing condition, never estimated around.
 *
 * NOTE (pipeline stage): nothing on the simulation path imports this module yet — the
 * composition stage wires the payload into the recompute side channel. Importing here
 * is exercised by the test suite (dc-tests.test.ts).
 */

import type { DataCalibrationMetadata, DataCalibrationPayload } from './types';
import { validateDataCalibrationPayload, validateDataCalibrationMetadata } from './validate';
import processedRaw from './aei-v6-2026-06/processed.json';
import metadataRaw from './aei-v6-2026-06/metadata.json';

// reason: JSON modules type as the file's literal shape; the contract is enforced by
// the load-time validators below (throw-on-mismatch), which is the actual guarantee.
const payload = processedRaw as unknown as DataCalibrationPayload;
// reason: same contract-by-validation pattern as the payload import above.
const metadata = metadataRaw as unknown as DataCalibrationMetadata;

validateDataCalibrationPayload(payload);
validateDataCalibrationMetadata(metadata);

/** The V6 first-party-API snapshot — the data-calibration species' first member. */
export const AEI_V6_PAYLOAD: DataCalibrationPayload = payload;
export const AEI_V6_METADATA: DataCalibrationMetadata = metadata;

/** Snapshot registry keyed by preset id (the composition stage's lookup surface). */
export const DATA_CALIBRATION_SNAPSHOTS: Readonly<Record<string, {
  payload: DataCalibrationPayload;
  metadata: DataCalibrationMetadata;
}>> = {
  'aei-v6-2026-06': { payload: AEI_V6_PAYLOAD, metadata: AEI_V6_METADATA },
};
