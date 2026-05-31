/**
 * ATLAS Capability Model
 *
 * Implements AI capability trajectory functions per DATA_MODEL.md Section 1.
 * Phase 8 Consolidation: 3 capability vectors (generative, agentic, embodied)
 * replace the original 8 vectors (lang, code, agent, decide, robot, auto, gen, sci).
 *
 * All functions are PURE — no side effects, no state mutation.
 */

import type { CapabilityVectorId, CapabilityTrajectoryParams } from '@/types';
import { DEFAULT_CAPABILITY_TRAJECTORIES } from './constants';

// DEPRECATED: Old 8-vector IDs
// const OLD_VECTOR_IDS = ['lang', 'code', 'agent', 'decide', 'robot', 'auto', 'gen', 'sci'];

const VECTOR_IDS: CapabilityVectorId[] = ['generative', 'agentic', 'embodied'];

/**
 * Compute the capability score S_c(t) for a given vector at a given year.
 *
 * Formula (DATA_MODEL.md §1.3):
 *   S_c(t) = floor + (ceiling - floor) / (1 + exp(-steepness * (t - midpointYear)))
 *
 * @param vectorId - Which capability vector
 * @param year - The year to evaluate
 * @param params - Trajectory parameters (floor, ceiling, steepness, midpointYear)
 * @returns Capability score in [0, 1]
 */
export function getCapabilityScore(
  _vectorId: CapabilityVectorId,
  year: number,
  params: CapabilityTrajectoryParams,
): number {
  const { floor, ceiling, steepness, midpointYear } = params;

  // Logistic sigmoid: floor + (ceiling - floor) / (1 + exp(-k * (t - t_mid)))
  const exponent = -steepness * (year - midpointYear);
  const sigmoid = 1 / (1 + Math.exp(exponent));

  const score = floor + (ceiling - floor) * sigmoid;

  // Clamp to [0, 1] for safety
  return Math.max(0, Math.min(1, score));
}

/**
 * Compute capability scores for ALL vectors at a given year.
 *
 * @param year - The year to evaluate
 * @param capabilityParams - Trajectory params per vector (user-adjustable)
 * @returns Record mapping each vector ID to its score at the given year
 */
export function getAllCapabilityScores(
  year: number,
  capabilityParams: Record<CapabilityVectorId, CapabilityTrajectoryParams>,
  capabilityDelays?: Record<CapabilityVectorId, number>,
): Record<CapabilityVectorId, number> {
  const scores = {} as Record<CapabilityVectorId, number>;
  for (const id of VECTOR_IDS) {
    const params = capabilityParams[id];
    const effectiveYear = year - (capabilityDelays?.[id] ?? 0);
    scores[id] = getCapabilityScore(id, effectiveYear, params);
  }

  return scores;
}

/**
 * Get the default capability scores for a given year using baseline trajectories.
 */
export function getDefaultCapabilityScores(
  year: number,
): Record<CapabilityVectorId, number> {
  return getAllCapabilityScores(year, DEFAULT_CAPABILITY_TRAJECTORIES);
}

/**
 * Compute automation coverage A(t) — the weighted average of all capability scores.
 * Represents the fraction of all possible human tasks that AI can perform.
 *
 * Formula (DATA_MODEL.md §6.1):
 *   A(t) = weighted_average(S_c(t) for all capability vectors c)
 *
 * Uses equal weights by default (each vector equally important to aggregate task coverage).
 *
 * @param capabilityScores - Score per vector at time t
 * @returns A(t) in [0, 1]
 */
export function computeAutomationCoverage(
  capabilityScores: Record<CapabilityVectorId, number>,
): number {
  let sum = 0;
  for (const id of VECTOR_IDS) {
    sum += capabilityScores[id];
  }

  return sum / VECTOR_IDS.length;
}

/**
 * Compute the weighted capability for a specific occupation cluster.
 * This is the cluster-specific "how capable is AI for THIS cluster?" metric.
 *
 * Formula: weightedCap = sum(weight_i * score_i) for i in {generative, agentic, embodied}
 *
 * Since per-cluster weights sum to 1.0, this produces a value in [0, 1].
 *
 * @param capabilityScores - Global capability scores at time t
 * @param weights - Per-cluster capability relevance weights (sum to 1.0)
 * @returns Weighted capability in [0, 1]
 */
export function computeWeightedCapability(
  capabilityScores: Record<CapabilityVectorId, number>,
  weights: Record<CapabilityVectorId, number>,
): number {
  return weights.generative * capabilityScores.generative
       + weights.agentic   * capabilityScores.agentic
       + weights.embodied  * capabilityScores.embodied;
}
