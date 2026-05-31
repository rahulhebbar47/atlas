/**
 * ATLAS Displacement Model
 *
 * Phase 8 Consolidation: Simplified displacement formula.
 *
 * Old formula:
 *   task_erosion = adoption_rate × task_automatable_fraction
 *   headcount_multiplier = 1 - (task_erosion × productivity_to_headcount_ratio)
 *
 * New formula:
 *   displacement_pct = adoption_rate × weighted_capability²
 *   headcount_multiplier = 1 - displacement_pct
 *   wage_multiplier = 1 - (displacement_pct × wage_elasticity)
 *
 * NOTE (FIX 7): economic_activity_factor is applied at the macro level only,
 * NOT at the cluster level. Cluster displacement reflects AI-driven displacement only.
 *
 * All functions are PURE — no side effects, no state mutation.
 */

import type {
  OccupationCluster,
  RoleDefinition,
  RoleDisplacementResult,
  ClusterDisplacementResult,
} from '@/types';
import { EMPLOYMENT_MULTIPLIERS } from './constants';

// DEPRECATED: Old displacement functions — replaced by computeSimplifiedDisplacement()
// export function computeTaskErosion(adoptionRate: number, taskAutomatableFraction: number): number {
//   return Math.max(0, Math.min(1, adoptionRate * taskAutomatableFraction));
// }
// export function computeHeadcountMultiplier(taskErosion: number, productivityToHeadcountRatio: number): number {
//   const multiplier = 1 - (taskErosion * productivityToHeadcountRatio);
//   return Math.max(0, Math.min(1, multiplier));
// }

/**
 * DEPRECATED (Phase 10.A): Replaced by computeDisplacementV2.
 * The `× weightedCapability²` squaring was an ad-hoc proxy for automation share; α is now explicit.
 * Retained for tests and audit comparisons.
 */
export function computeSimplifiedDisplacement(
  adoptionRate: number,
  weightedCapability: number,
): number {
  const raw = adoptionRate * weightedCapability * weightedCapability;
  return Math.max(0, Math.min(1, raw));
}

/**
 * Phase 10.A — V2 displacement formula.
 *
 * displacement_pct = adoption × weightedCapability × α
 *
 * Replaces the prior `× weightedCapability²` squaring with an explicit automation share (α).
 * α captures "what fraction of adoption takes the replacement path (vs augmentation)", driven
 * by the 5-driver model in alphaDrivers.ts.
 *
 * @param adoptionRate        Current adoption rate [0, 1]
 * @param weightedCapability  Cluster-specific weighted capability [0, 1]
 * @param alpha               Effective automation share [0, 1]
 */
export function computeDisplacementV2(
  adoptionRate: number,
  weightedCapability: number,
  alpha: number,
): number {
  const raw = adoptionRate * weightedCapability * alpha;
  return Math.max(0, Math.min(1, raw));
}

/**
 * Compute wage multiplier — how much wages are depressed by automation.
 *
 * Formula (DATA_MODEL.md §4.2):
 *   wage_multiplier = 1 - (displacement_pct × wage_elasticity)
 *
 * @param displacementPct - Displacement percentage [0, 1]
 * @param wageElasticity - How much bargaining power workers lose [0, 1]
 * @returns Wage multiplier in [0, 1], where 1 = no change, 0 = wages eliminated
 */
export function computeWageMultiplier(
  displacementPct: number,
  wageElasticity: number,
): number {
  const multiplier = 1 - (displacementPct * wageElasticity);
  return Math.max(0, Math.min(1, multiplier));
}

/**
 * Compute displacement for a single role within a cluster.
 *
 * FIX 7: Removed economicActivityFactor from cluster-level displacement.
 * Cluster displacement reflects AI-driven displacement ONLY.
 * Economic contraction (eaf < 1) is applied at the macro level in simulation.ts.
 *
 * Phase 8 Consolidation: Uses weightedCapability² instead of taskAutomatableFraction × productivityToHeadcountRatio.
 *
 * @param role - The role definition
 * @param cluster - The occupation cluster
 * @param adoptionRate - Current adjusted adoption rate [0, 1]
 * @param baselineEmployment - Baseline employment for this role
 * @param baselineWage - Baseline annual wage for this role
 * @param weightedCapability - Cluster-specific weighted capability [0, 1]
 * @returns RoleDisplacementResult
 */
export function computeRoleDisplacement(
  role: RoleDefinition,
  cluster: OccupationCluster,
  adoptionRate: number,
  baselineEmployment: number,
  baselineWage: number,
  weightedCapability: number,
  /** Phase 10.A — effective α for this role this year (replaces the squared capability proxy). */
  alpha: number,
  wageElasticityOverride?: number,
): RoleDisplacementResult {
  // Phase 10.A V2 displacement: adoption × weightedCapability × α
  const displacementPct = computeDisplacementV2(adoptionRate, weightedCapability, alpha);

  // Headcount multiplier: 1 - displacement_pct
  const headcountMultiplier = Math.max(0, Math.min(1, 1 - displacementPct));

  // Wage depression: use override if provided, else cluster default
  const effectiveWageElasticity = wageElasticityOverride ?? cluster.wageElasticity;
  const wageMultiplier = computeWageMultiplier(displacementPct, effectiveWageElasticity);

  // Final employment: baseline * headcount_multiplier (AI-only, no eaf)
  const remainingEmployment = Math.max(0,
    baselineEmployment * headcountMultiplier,
  );

  const remainingWage = Math.max(0, baselineWage * wageMultiplier);

  return {
    roleId: role.id,
    displacementPct,
    headcountMultiplier,
    wageMultiplier,
    remainingEmployment,
    remainingWage,
  };
}

/**
 * Compute displacement for an entire occupation cluster.
 *
 * FIX 7: Removed economicActivityFactor. Cluster displacement reflects
 * AI-driven displacement ONLY. Economic contraction is handled at the macro level.
 *
 * @param cluster - The occupation cluster
 * @param adoptionRates - Adoption rate per role (keyed by role ID)
 * @param baselineEmployments - Baseline employment per role (keyed by role ID)
 * @param baselineWages - Baseline wage per role (keyed by role ID)
 * @param weightedCapability - Cluster-specific weighted capability [0, 1]
 * @returns ClusterDisplacementResult
 */
export function computeClusterDisplacement(
  cluster: OccupationCluster,
  adoptionRates: Record<string, number>,
  baselineEmployments: Record<string, number>,
  baselineWages: Record<string, number>,
  weightedCapability: number,
  /** Phase 10.A — per-role α computed this year. Keyed by role.id. */
  alphaByRole: Record<string, number>,
  wageElasticityOverride?: number,
  /** Phase 10.A — scarcity-intensity for this-year cluster premium (used when propagating to macro). */
  scarcityIntensity?: number,
): ClusterDisplacementResult {
  const roleResults: RoleDisplacementResult[] = [];
  let totalRemainingEmployment = 0;
  let totalBaselineEmployment = 0;
  let totalWageWeightedSum = 0;

  // Phase 10.A — cluster aggregates for scarcity + α diagnostics
  let alphaWeightedSum = 0;
  let premiumWeightedSum = 0;
  let alphaWeightTotal = 0;

  for (const role of cluster.roles) {
    const adoptionRate = adoptionRates[role.id] ?? 0;
    const baselineEmpl = baselineEmployments[role.id] ?? 0;
    const baselineWage = baselineWages[role.id] ?? 0;
    const alpha = alphaByRole[role.id] ?? cluster.automationShare ?? 0.5;
    const rolePremium = role.aiReplacementDifficultyWagePremium ?? 0;

    const result = computeRoleDisplacement(
      role,
      cluster,
      adoptionRate,
      baselineEmpl,
      baselineWage,
      weightedCapability,
      alpha,
      wageElasticityOverride,
    );

    roleResults.push(result);
    totalRemainingEmployment += result.remainingEmployment;
    totalBaselineEmployment += baselineEmpl;
    totalWageWeightedSum += result.remainingWage * result.remainingEmployment;

    // Aggregate α + wagePremium weighted by baseline employment (role employment share within cluster).
    alphaWeightedSum += alpha * baselineEmpl;
    premiumWeightedSum += rolePremium * baselineEmpl;
    alphaWeightTotal += baselineEmpl;
  }

  const totalDirectDisplacement = Math.max(0, totalBaselineEmployment - totalRemainingEmployment);

  // Second-order displacement from employment multiplier (DATA_MODEL.md §9.1)
  // Phase 5h (Fix 4): Bound second-order displacement to not exceed remaining employment
  // (cannot displace more workers than actually remain in the cluster)
  const multiplier = cluster.employmentMultiplier;
  const secondOrderDisplacement = Math.min(
    totalDirectDisplacement * (multiplier - 1),
    totalRemainingEmployment,
  );

  const averageWage = totalRemainingEmployment > 0
    ? totalWageWeightedSum / totalRemainingEmployment
    : 0;

  // Phase 10.A — employment-weighted aggregates
  const effectiveAlpha = alphaWeightTotal > 0 ? alphaWeightedSum / alphaWeightTotal : 0;
  const aggregateReplacementDifficultyWagePremium = alphaWeightTotal > 0
    ? premiumWeightedSum / alphaWeightTotal
    : 0;

  // Cluster scarcity premium: aiDisplacementShare × scarcityIntensity × aggregatePremium.
  // aiDisplacementShare here is the cluster's displacement rate (direct + second-order, bounded).
  // Caller (simulation.ts) may also compute a more refined macro-aggregate separately.
  const totalCluster = totalBaselineEmployment > 0 ? totalBaselineEmployment : 1;
  const aiDisplacementShare = Math.min(1, (totalDirectDisplacement + secondOrderDisplacement) / totalCluster);
  const scarcityPremiumContribution = scarcityIntensity !== undefined
    ? aiDisplacementShare * scarcityIntensity * aggregateReplacementDifficultyWagePremium
    : 0;
  // wageAdjustmentFromScarcity feeds next year's Cheaper score via priorYearWageAdjustmentByCluster
  // (direct pass-through with one-year lag — no smoothing; see plan).
  const wageAdjustmentFromScarcity = scarcityPremiumContribution;

  return {
    clusterId: cluster.id,
    roles: roleResults,
    totalRemainingEmployment,
    totalDirectDisplacement,
    secondOrderDisplacement,
    totalDisplacement: totalDirectDisplacement + secondOrderDisplacement,
    averageWage,
    bfcsOutput: [], // Populated by runSimulation() after displacement computation
    effectiveAlpha,
    aggregateReplacementDifficultyWagePremium,
    scarcityPremiumContribution,
    wageAdjustmentFromScarcity,
  };
}
