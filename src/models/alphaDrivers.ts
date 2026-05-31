/**
 * ATLAS Alpha Driver Model (Phase 10.A Part 6)
 *
 * Computes effective automation share (α) for a cluster/role from 5 drivers:
 *   1. Capability      — AI has to be capable enough for replacement to be worth it
 *   2. Trust           — observed reliability accumulates over years since trigger
 *   3. Competitive     — peer clusters' prior-year α creates competitive pressure
 *   4. Margin          — corporate margin compression pushes firms to replace vs augment
 *   5. Slack           — labor market slack REDUCES α (workers are cheaper, less urgency)
 *
 * α = clamp01(
 *       baseline
 *     + capabilityW × sigmoid((weightedCapability − threshold) × 6)
 *     + trustW × (1 − exp(−yearsSinceTrigger / halfLife))
 *     + competitiveW × max(0, peerAlpha − baseline)
 *     + marginW × max(0, baselineMargin − currentMargin) / baselineMargin
 *     − slackW × max(0, unemploymentRate − naturalRate) × 5
 *   )
 *
 * All functions PURE — no side effects, no state mutation.
 */

import type {
  OccupationCluster,
  RoleDefinition,
  AlphaDriverParams,
  AlphaDecomposition,
  OccupationBaseline,
} from '@/types';
import { DEFAULT_COGNITIVE_ALPHA } from './constants';

/** Logistic function used for the capability-driver activation curve. */
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Compute effective α for a cluster/role at the current year.
 * @returns { alpha: clamped [0,1] effective α, decomposition: per-driver contributions }
 */
export function computeEffectiveAlpha(inputs: {
  cluster: OccupationCluster;
  role: RoleDefinition;
  year: number;
  weightedCapability: number;
  triggerYear: number | null;
  /** Employment-weighted α across category peers from the PRIOR year (excludes self). */
  previousYearPeerAlpha: number;
  /** Current corporate profits / GDP ratio (read from prior year's macro output). */
  currentCorporateMargin: number;
  /** Anchor corporate margin — ALPHA_BASELINE_CORPORATE_MARGIN or custom. */
  baselineCorporateMargin: number;
  /** Prior year unemployment rate [0, 1]. */
  unemploymentRate: number;
  /** NAIRU / natural unemployment rate [0, 1]. */
  naturalRate: number;
  params: AlphaDriverParams;
}): { alpha: number; decomposition: AlphaDecomposition } {
  const {
    cluster, role, year, weightedCapability, triggerYear,
    previousYearPeerAlpha, currentCorporateMargin, baselineCorporateMargin,
    unemploymentRate, naturalRate, params,
  } = inputs;

  const baseline = role.automationShareOverride
    ?? cluster.automationShare
    ?? DEFAULT_COGNITIVE_ALPHA;

  // 1. Capability driver — sigmoid activation around the threshold.
  //    ×6 steepens the sigmoid so most of the range is within ±0.2 of the threshold.
  const capabilityContribution = params.capabilityWeight
    * sigmoid((weightedCapability - params.capabilityActivationThreshold) * 6);

  // 2. Trust driver — post-trigger exponential ramp toward full weight.
  let trustContribution = 0;
  if (triggerYear !== null && year >= triggerYear) {
    const yearsSinceTrigger = year - triggerYear;
    trustContribution = params.trustWeight
      * (1 - Math.exp(-yearsSinceTrigger / params.trustHalfLifeYears));
  }

  // 3. Competitive driver — only fires when peers have MOVED AHEAD of our baseline.
  //    Self-exclusion is the responsibility of the caller (computePeerAlpha filters out self).
  const competitiveContribution = params.competitiveWeight
    * Math.max(0, previousYearPeerAlpha - baseline);

  // 4. Margin driver — firms compress toward replacement when margins shrink.
  //    Uses a ratio so the response is proportional to how much margin is left.
  const marginGap = Math.max(0, baselineCorporateMargin - currentCorporateMargin);
  const marginContribution = baselineCorporateMargin > 0
    ? params.marginWeight * (marginGap / baselineCorporateMargin)
    : 0;

  // 5. Slack driver — labor is cheaper when unemployment is elevated, so α goes DOWN.
  //    ×5 calibrates so a 4pp excess unemployment (UE=9% vs NAIRU=5%) drops α by slackW.
  //    Explicit +0 when excessUnemployment = 0 to avoid JS -0 vs +0 surprises in tests.
  const excessUnemployment = Math.max(0, unemploymentRate - naturalRate);
  const slackContribution = excessUnemployment > 0
    ? -params.slackWeight * excessUnemployment * 5
    : 0;

  const raw = baseline
    + capabilityContribution
    + trustContribution
    + competitiveContribution
    + marginContribution
    + slackContribution;

  return {
    alpha: Math.max(0, Math.min(1, raw)),
    decomposition: {
      baseline,
      capabilityContribution,
      trustContribution,
      competitiveContribution,
      marginContribution,
      slackContribution,
    },
  };
}

/**
 * Employment-weighted mean α across category peers, EXCLUDING self.
 * Returns DEFAULT_COGNITIVE_ALPHA when the peer group is empty (single-cluster category).
 */
export function computePeerAlpha(
  category: string,
  selfClusterId: string,
  priorYearAlphaByCluster: Map<string, number>,
  clusterEmploymentByCluster: Map<string, number>,
  clusters: OccupationCluster[],
): number {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const cluster of clusters) {
    if (cluster.id === selfClusterId) continue;
    if (cluster.category !== category) continue;
    const alpha = priorYearAlphaByCluster.get(cluster.id);
    const emp = clusterEmploymentByCluster.get(cluster.id);
    if (alpha === undefined || emp === undefined) continue;
    weightedSum += alpha * emp;
    totalWeight += emp;
  }
  return totalWeight > 0 ? weightedSum / totalWeight : DEFAULT_COGNITIVE_ALPHA;
}

/**
 * Build a Map of cluster.id → total baseline employment, for the peer-α weighting.
 * Uses OccupationBaseline.totalEmployment directly.
 */
export function buildClusterEmploymentMap(
  clusters: OccupationCluster[],
  baselines: Map<string, OccupationBaseline>,
): Map<string, number> {
  const out = new Map<string, number>();
  for (const cluster of clusters) {
    const baseline = baselines.get(cluster.id);
    out.set(cluster.id, baseline?.totalEmployment ?? 0);
  }
  return out;
}
