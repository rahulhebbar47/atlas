/**
 * ATLAS BFCS Threshold Model (Better, Faster, Cheaper, Safer)
 *
 * Implements the four-dimensional threshold check per DATA_MODEL.md Section 2.
 * Automation of a specific occupation-role is NOT triggered by capability alone —
 * ALL FOUR thresholds must be met simultaneously.
 *
 * All functions are PURE — no side effects, no state mutation.
 */

import type {
  AICostParams,
  CapabilityVectorId,
  DeploymentType,
  BFCSScores,
  BFCSThresholds,
  TokenCostCurveParams,
  OccupationCluster,
  RoleDefinition,
} from '@/types';
import {
  BASELINE_INFERENCE_SPEED,
  INFERENCE_SPEED_YEARS_SCALE,
  INFERENCE_SPEED_IMPROVEMENT_RATE,
  TASK_PARALLELISM,
  BASELINE_SAFETY_RECORD,
  SAFETY_IMPROVEMENT_RATE,
  DOMAIN_RISK_FACTORS,
  type ClusterCategory,
  DEFAULT_START_YEAR,
  // RETIRED (mini-stage 1): the inference-cost assembly moved to aiCost.ts (the one-assembly
  // rule). The mfg/energy/composition constants are consumed there now.
  // DEFAULT_MANUFACTURING_ANNUAL_CHANGE,
  // DEFAULT_ENERGY_ANNUAL_CHANGE,
  // DEFAULT_TOKEN_COST_CURVE,
  // START_YEAR_TOKEN_USAGE_MULTIPLIER,
  // DEPRECATED: DEFAULT_TOKEN_USAGE_MULTIPLIER (20×) was the bare fallback for
  // computeInferenceCostFactor; replaced by the neutral START_YEAR value (1×) so an
  // unparameterized call assumes no usage spike. Kept exported in constants.ts.
  // DEFAULT_TOKEN_USAGE_MULTIPLIER,
  // AI_COST_COMPOSITION,
} from './constants';
import { computeAiCostFraction, type CostClock } from './aiCost';

/** The cited per-token curve lives in aiCost.ts (the one-assembly rule); re-exported here
 *  for existing callers (InferenceCostControls' preview chart). */
export { computeTokenCostFactor } from './aiCost';

// RETIRED (the coupled design checkpoint, mini-stage 1; Amendment 2 — no legacy toggles):
// computeInferenceCostFactor was the global tokens-per-task path — tokenCostFactor(t) ×
// year-resolved usageMultiplier (the spike-and-recover schedule). Replaced by the
// frontier-intensity layer in aiCost.ts: work at the frontier pays a persistent intensity
// premium M_f(t); arrived roles migrate onto the arrival-anchored fixed-capability curve;
// the aggregate tokens-per-task path is an emergent OUTPUT (impliedAggregateTokensPerTask),
// never an input. Kept per the no-delete rule; the which-change pole is the recorded
// predecessor-commit run (6c831b7).
// export function computeInferenceCostFactor(
//   t: number,
//   tokenParams: TokenCostCurveParams = DEFAULT_TOKEN_COST_CURVE,
//   usageMultiplier: number = START_YEAR_TOKEN_USAGE_MULTIPLIER,
// ): number {
//   if (t <= 0) return usageMultiplier;
//   return computeTokenCostFactor(t, tokenParams) * usageMultiplier;
// }

/**
 * Compute the Better (B) score for an occupation-role at time t.
 *
 * Formula (DATA_MODEL.md §2.2):
 *   B(c, o, r) = weighted_sum(S_c(t) * relevance(c, o)) * quality_multiplier(r)
 *
 * quality_multiplier(r): junior (r=0.7) needs less capability than senior (r=0.95).
 * We invert seniority to get a multiplier: lower seniority → higher multiplier
 * (easier to match), higher seniority → lower multiplier (harder to match).
 *   quality_multiplier = 1 / r  (clamped to [0.5, 2.0])
 *
 * @param capabilityScores - Current capability scores per vector
 * @param cluster - The occupation cluster
 * @param role - The role within the cluster
 * @returns Better score in [0, 1]
 */
export function computeBetterScore(
  capabilityScores: Record<CapabilityVectorId, number>,
  cluster: OccupationCluster,
  role: RoleDefinition,
): number {
  const weights = cluster.capabilityRelevance.weights;

  // Weighted sum of capability scores by relevance
  let weightedSum = 0;
  let totalWeight = 0;
  // DEPRECATED: Old 8-vector iteration
  // const vectorIds: CapabilityVectorId[] = ['lang', 'code', 'agent', 'decide', 'robot', 'auto', 'gen', 'sci'];
  const vectorIds: CapabilityVectorId[] = ['generative', 'agentic', 'embodied'];

  for (const id of vectorIds) {
    const weight = weights[id];
    if (weight > 0) {
      weightedSum += capabilityScores[id] * weight;
      totalWeight += weight;
    }
  }

  // Normalize by total weight to get [0, 1]
  const normalizedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Phase 10.A: quality multiplier REMOVED. Role-difficulty gating moves to
  // aiReplacementDifficultyFriction (adoption delay inside findTriggerYear) and
  // aiReplacementDifficultyWagePremium (tail drag + Phillips scarcity premium).
  // Previously Better score was normalizedScore × (2.0 - aiReplacementDifficulty × 1.5).
  // Removing it means senior/specialist roles have higher raw Better scores, and
  // their BFCS thresholds (B*) + friction-delay continue to gate trigger timing appropriately.
  return Math.min(1, normalizedScore);
}

/**
 * Compute the Faster (F) score for an occupation-role at time t.
 *
 * Formula (DATA_MODEL.md §2.2):
 *   F(c, o, r) = inference_speed(c, t) * task_parallelism(o)
 *
 * Inference speed improves over time as hardware improves.
 *
 * @param year - Current year
 * @param cluster - The occupation cluster
 * @returns Faster score in [0, 1]
 */
export function computeFasterScore(
  year: number,
  cluster: OccupationCluster,
  supplyChainFasterMultiplier?: number,
): number {
  const yearsSinceStart = year - DEFAULT_START_YEAR;
  const effectiveRate = INFERENCE_SPEED_IMPROVEMENT_RATE * (supplyChainFasterMultiplier ?? 1.0);

  // Inference speed improves each year but caps at 1.0
  const inferenceSpeed = Math.min(
    1.0,
    BASELINE_INFERENCE_SPEED + effectiveRate * yearsSinceStart * INFERENCE_SPEED_YEARS_SCALE,
  );

  const parallelism = TASK_PARALLELISM[cluster.deploymentType];

  return Math.min(1, inferenceSpeed * parallelism);
}

/**
 * Compute the Cheaper (C) score for an occupation-role at time t.
 *
 * Formula (DATA_MODEL.md §2.2):
 *   C(c, o, r) = (human_cost(o, r) - ai_cost(c, t)) / human_cost(o, r)
 *
 * AI cost declines exponentially. Human cost represented by seniority level
 * (higher seniority = higher wages = easier to be cheaper than).
 *
 * @param year - Current year
 * @param role - The role (seniority determines human cost proxy)
 * @param cluster - The occupation cluster
 * @returns Cheaper score in [0, 1], 0 if AI is still more expensive
 */
export function computeCheaperScore(
  year: number,
  role: RoleDefinition,
  cluster: OccupationCluster,
  costParams?: AICostParams,
  supplyChainMultipliers?: { inference: number; manufacturing: number; energy: number },
  /** Phase 10.A: scarcity-driven wage inflation from prior year — multiplies humanCostFactor by (1 + wageAdjustment). */
  wageAdjustment: number = 0,
  /** FS-3 (ratified): the OEWS basis — the role's loaded mean wage relative to the economy mean.
   *  undefined = the retired proxy (the which-change basis row). */
  roleWageRelative?: number,
  /** FS-3 (ratified): the G1 connection — the economy-wide NOMINAL wageIndex (t−1). The PRICE
   *  channel lives here, once (the G4 partition: labor-availability/organizational caution stays
   *  in the α slack driver — see alphaDrivers). 1.0 = disconnected (the which-change row). */
  economyWageIndex: number = 1.0,
  /** Mini-stage 1 (the frontier-intensity cost layer): the role's Better-arrival year
   *  (first year Better ≥ B*; null = not arrived → frontier-priced) and its CURRENT-year
   *  capability surplus s = Better − B*. Legacy callers' defaults (null, 0) price at the
   *  frontier — the conservative pole. */
  arrivalYear: number | null = null,
  betterSurplus: number = 0,
  /** Flywheel MS: the cost clock (τ). Absent ⇒ calendar time (legacy/fixture identity). */
  costClock?: CostClock,
): number {
  // Mini-stage 1: THE ONE ASSEMBLY — the realized-cost object (aiCost.ts) owns the
  // 3-leg composition (frontier/fixed-capability inference blend + mfg/energy exponentials
  // + supply-chain multipliers). The retired inline assembly is preserved in git history
  // and the predecessor-commit record (6c831b7).
  const scm = supplyChainMultipliers ?? { inference: 1, manufacturing: 1, energy: 1 };
  const aiCostFraction = computeAiCostFraction(
    year, cluster.deploymentType, arrivalYear, betterSurplus, costParams, scm, costClock,
  ).fraction;

  // FS-3 (ratified): the OEWS basis — humanCost = (roleWage/econMean) × wageIndex(t−1) × (1+scarcity).
  // NOMINAL-ON-NOMINAL declared: aiCostFraction is nominal-anchored-2025; the wage leg is the
  // nominal wageIndex. The RETIRED proxy (kept as the basis-row fallback, with its why-note):
  // (0.3 + 0.7×seniority) compressed the loaded 8×+ OEWS wage distribution ≈2.4× — understating
  // Cheaper for high-wage roles, overstating for low-wage; the distributional correction
  // re-targets displacement incidence toward high-wage cognitive roles (FS3_CHECKPOINT §1).
  const basisFactor = roleWageRelative ?? (0.3 + role.seniorityLevel * 0.7);
  const humanCostFactor = basisFactor * economyWageIndex * (1 + wageAdjustment);

  return Math.max(0, Math.min(1, 1 - (aiCostFraction / humanCostFactor)));
}

/**
 * Compute the Safer (S) score for an occupation-role at time t.
 *
 * Formula (DATA_MODEL.md §2.2):
 *   S(c, o, r) = safety_record(c, t) * domain_risk_factor(o)
 *
 * Safety improves over time but is scaled by how demanding the domain is.
 *
 * @param year - Current year
 * @param cluster - The occupation cluster
 * @returns Safer score in [0, 1]
 */
export function computeSaferScore(
  year: number,
  cluster: OccupationCluster,
  supplyChainSaferMultiplier?: number,
): number {
  const yearsSinceStart = year - DEFAULT_START_YEAR;
  const effectiveRate = SAFETY_IMPROVEMENT_RATE * (supplyChainSaferMultiplier ?? 1.0);

  // Safety record improves with a sigmoid-like trajectory
  // Starts at baseline and asymptotically approaches 1.0
  const safetyRecord = 1 - (1 - BASELINE_SAFETY_RECORD) * Math.exp(-effectiveRate * yearsSinceStart);

  // Domain risk factor: from constants, keyed by category
  // FS-1b F6: the map is tsc-exhaustive over ClusterCategory — the silent 0.8 fallback DELETED.
  const domainFactor = DOMAIN_RISK_FACTORS[cluster.category as ClusterCategory]; // reason: cluster.category is string-typed in legacy data; the exhaustiveness test guards the key set

  return Math.min(1, safetyRecord * domainFactor);
}

/**
 * Compute all four BFCS scores for a given occupation-role at time t.
 *
 * @param capabilityScores - Capability scores per vector at year t
 * @param cluster - The occupation cluster
 * @param role - The role within the cluster
 * @param year - The current year
 * @returns BFCSScores object with better, faster, cheaper, safer values
 */
export function computeBFCSScores(
  capabilityScores: Record<CapabilityVectorId, number>,
  cluster: OccupationCluster,
  role: RoleDefinition,
  year: number,
  costParams?: AICostParams,
  supplyChainParams?: {
    fasterMultiplier?: number;
    saferMultiplier?: number;
    costMultipliers?: { inference: number; manufacturing: number; energy: number };
  },
  /** Phase 10.A: scarcity-driven wage adjustment from prior year, propagated into Cheaper. */
  wageAdjustment: number = 0,
  /** FS-3: the OEWS basis + the G1 connection (see computeCheaperScore). */
  roleWageRelative?: number,
  economyWageIndex: number = 1.0,
  /** Mini-stage 1: Better-arrival year + current surplus (see computeCheaperScore). */
  arrivalYear: number | null = null,
  betterSurplus: number = 0,
  /** Flywheel MS: the cost clock (τ). Absent ⇒ calendar time (legacy/fixture identity). */
  costClock?: CostClock,
): BFCSScores {
  return {
    better: computeBetterScore(capabilityScores, cluster, role),
    faster: computeFasterScore(year, cluster, supplyChainParams?.fasterMultiplier),
    cheaper: computeCheaperScore(
      year, role, cluster, costParams, supplyChainParams?.costMultipliers, wageAdjustment,
      roleWageRelative, economyWageIndex, arrivalYear, betterSurplus, costClock,
    ),
    safer: computeSaferScore(year, cluster, supplyChainParams?.saferMultiplier),
  };
}

/**
 * Check whether all BFCS thresholds are met for an occupation-role.
 *
 * Formula (DATA_MODEL.md §2.1):
 *   adoption_triggered = B >= B* AND F >= F* AND C >= C* AND S >= S*
 *
 * @param scores - Current BFCS scores
 * @param thresholds - Required BFCS thresholds for the role
 * @returns true if ALL four thresholds are met
 */
export function checkThresholdsMet(
  scores: BFCSScores,
  thresholds: BFCSThresholds,
): boolean {
  return (
    scores.better >= thresholds.better &&
    scores.faster >= thresholds.faster &&
    scores.cheaper >= thresholds.cheaper &&
    scores.safer >= thresholds.safer
  );
}

/**
 * Check adoption trigger for a specific occupation-role.
 * Returns trigger status and current BFCS scores.
 *
 * @param cluster - The occupation cluster
 * @param role - The role within the cluster
 * @param year - The current year
 * @param capabilityScores - Capability scores per vector at year t
 * @returns Object with triggered status and current scores
 */
export function checkAdoptionTrigger(
  cluster: OccupationCluster,
  role: RoleDefinition,
  year: number,
  capabilityScores: Record<CapabilityVectorId, number>,
  thresholdOverride?: BFCSThresholds,
  costParams?: AICostParams,
  supplyChainParams?: {
    fasterMultiplier?: number;
    saferMultiplier?: number;
    costMultipliers?: { inference: number; manufacturing: number; energy: number };
  },
  /** Phase 10.A: scarcity wage adjustment from prior year (propagated into Cheaper). */
  wageAdjustment: number = 0,
  /** FS-3: the OEWS basis + the G1 connection. */
  roleWageRelative?: number,
  economyWageIndex: number = 1.0,
  /** Mini-stage 1: Better-arrival year + current surplus (see computeCheaperScore). */
  arrivalYear: number | null = null,
  betterSurplus: number = 0,
  /** Flywheel MS: the cost clock (τ). Absent ⇒ calendar time (legacy/fixture identity). */
  costClock?: CostClock,
): { triggered: boolean; scores: BFCSScores } {
  const scores = computeBFCSScores(
    capabilityScores, cluster, role, year, costParams, supplyChainParams, wageAdjustment,
    roleWageRelative, economyWageIndex, arrivalYear, betterSurplus, costClock,
  );
  const effectiveThresholds = thresholdOverride ?? role.bfcsThresholds;
  const triggered = checkThresholdsMet(scores, effectiveThresholds);

  return { triggered, scores };
}

/**
 * Find the trigger year for a given occupation-role by scanning years.
 * Returns null if never triggered within the range.
 *
 * @param cluster - The occupation cluster
 * @param role - The role within the cluster
 * @param startYear - Start of scan range
 * @param endYear - End of scan range
 * @param capabilityParams - Capability trajectory params
 * @param getScoresForYear - Function to get capability scores at a given year
 * @returns The first year when BFCS thresholds are met, or null
 */
/**
 * Find the effective trigger year (raw BFCS-met year + friction-delay).
 *
 * Phase 10.A fix #2: the raw BFCS-met year is shifted forward by `ceil(role.aiReplacementFrictionYears)`
 * to model pre-adoption regulatory/cultural friction (licensure, liability, union resistance).
 * If the shifted year falls outside [startYear, endYear], returns null.
 *
 * @param frictionYears  Role's aiReplacementFrictionYears (≥ 0, direct years — no scaling).
 */
/**
 * FS-3 (ratified): THE MARGIN-PRESERVING THRESHOLD TRANSFORM (the load-time bridge).
 *   C*_new = C_2025,new − (C_2025,old − C*_old)
 * The observed 2025 margin (distance-to-threshold) is preserved EXACTLY in absolute score units —
 * the 2025 trigger map and every role's proximity reproduce by construction (the year-0 anchor is
 * observed, not an outcome target; post-2025 timing moves only through the new basis's honest
 * dynamics). No data rewrite: the stored thresholds remain the citation objects; this is the
 * documented bridge. FS3-R1: the result is clamped-REPORTED — values outside (0,1) are flagged
 * in the margins table (expected none; shown, not assumed), never silently clamped.
 */
export function deriveSeamCheaperThreshold(
  cluster: OccupationCluster,
  role: RoleDefinition,
  startYear: number,
  roleWageRelative: number,
  costParams?: AICostParams,
): { cheaperThresholdNew: number; c2025Old: number; c2025New: number; marginOld: number; outOfRange: boolean } {
  const c2025Old = computeCheaperScore(startYear, role, cluster, costParams, undefined, 0);
  const c2025New = computeCheaperScore(startYear, role, cluster, costParams, undefined, 0, roleWageRelative, 1.0);
  const marginOld = c2025Old - role.bfcsThresholds.cheaper;
  // FS-3 R1 RULING (headroom-proportional, UNIFORM): proximity-to-threshold only has stable
  // cross-basis meaning as a FRACTION OF REMAINING SCORE-SPACE (score velocity varies with basis);
  // the absolute rule was weaker everywhere and failed exactly where levels moved most (the
  // proxy's zero-clamp had fabricated the stored margins for the high-wage class — raw ≈ −0.96
  // clamped to 0). frac = (C*_old − C_2025,old)/(1 − C_2025,old); C*_new = C_new + frac×(1 − C_new):
  // always in (C_new, 1) for frac ∈ (0,1); year-0 dormancy by construction; the clamp artifact
  // never enters (fractions of clamped space remain well-defined). Applied to ALL rows, not a patch.
  const headroomOld = 1 - c2025Old;
  const frac = headroomOld > 0 ? (role.bfcsThresholds.cheaper - c2025Old) / headroomOld : 0;
  const cheaperThresholdNew = c2025New + frac * (1 - c2025New);
  return {
    cheaperThresholdNew, c2025Old, c2025New, marginOld,
    outOfRange: cheaperThresholdNew <= 0 || cheaperThresholdNew >= 1,
  };
}

export function findTriggerYear(
  cluster: OccupationCluster,
  role: RoleDefinition,
  startYear: number,
  endYear: number,
  getScoresForYear: (year: number) => Record<CapabilityVectorId, number>,
  thresholdOverride?: BFCSThresholds,
  costParams?: AICostParams,
  frictionYears: number = 0,
): number | null {
  // Mini-stage 1: the scan tracks the Better-arrival year chronologically (the same latch
  // the simulation loop keeps), so the Cheaper leg prices the frontier/fixed-capability
  // blend exactly as the live path does.
  const bStar = (thresholdOverride ?? role.bfcsThresholds).better;
  let arrivalYear: number | null = null;
  for (let year = startYear; year <= endYear; year++) {
    const capScores = getScoresForYear(year);
    const better = computeBetterScore(capScores, cluster, role);
    if (arrivalYear === null && better >= bStar) arrivalYear = year;
    const { triggered } = checkAdoptionTrigger(
      cluster, role, year, capScores, thresholdOverride, costParams,
      undefined, 0, undefined, 1.0, arrivalYear, better - bStar,
    );
    if (triggered) {
      const effectiveTriggerYear = Math.ceil(year + Math.max(0, frictionYears));
      if (effectiveTriggerYear > endYear) return null;
      return effectiveTriggerYear;
    }
  }
  return null;
}
