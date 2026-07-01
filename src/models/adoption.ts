/**
 * ATLAS Adoption Dynamics Model
 *
 * Implements S-curve adoption dynamics per DATA_MODEL.md Section 3.
 * Once BFCS thresholds are met, adoption follows a logistic S-curve
 * modified by competitive pressure, geopolitical risk, and revenue pressure.
 *
 * Phase 8 Consolidation: Added per-cluster adoptionSteepness and adoptionCeiling.
 *
 * All functions are PURE — no side effects, no state mutation.
 */

import type { AdoptionParams, AdoptionResult, DeploymentType } from '@/types';
import { DEFAULT_ADOPTION_PARAMS, DEFAULT_COMPETITIVE_PRESSURE_THRESHOLD, ADOPTION_TAIL_ASYMMETRY_SCALE } from './constants';

/**
 * Compute the base adoption rate at time t for an occupation-role
 * whose BFCS thresholds were met at triggerYear.
 *
 * Formula (DATA_MODEL.md §3.1):
 *   adoption_rate(o, r, t) = ceiling / (1 + exp(-steepness * (t - t_trigger(o,r) - lag(o))))
 *
 * @param year - Current year
 * @param triggerYear - Year when BFCS thresholds were first met
 * @param deploymentType - Determines S-curve steepness (used as fallback)
 * @param adoptionLag - Additional deployment lag in years
 * @param adoptionParams - Adjustable adoption parameters
 * @param clusterSteepness - Per-cluster steepness override (if set)
 * @param clusterCeiling - Per-cluster adoption ceiling [0, 1] (default 1.0)
 * @returns Base adoption rate in [0, ceiling]
 */
export function computeBaseAdoptionRate(
  year: number,
  triggerYear: number,
  deploymentType: DeploymentType,
  adoptionLag: number,
  adoptionParams: AdoptionParams = DEFAULT_ADOPTION_PARAMS,
  clusterSteepness?: number,
  clusterCeiling?: number,
  /** Phase 10.A: role.aiReplacementDifficultyWagePremium [0,1] — tail-drag exponent source.
   *  wagePremium=0 → standard exponential approach (asymmetry=1).
   *  wagePremium=1 → severe tail drag (asymmetry=6), asymptotically approaches 1.0 but never ceilinged. */
  wagePremium: number = 0,
): number {
  if (year < triggerYear) {
    return 0;
  }

  const steepness = clusterSteepness ?? adoptionParams.steepnessByDeployment[deploymentType];
  const ceiling = clusterCeiling ?? 1.0;
  const timeSinceTrigger = year - triggerYear - adoptionLag;

  if (timeSinceTrigger <= 0) {
    return 0;
  }

  // Phase 10.A — asymmetric S-curve: (1 - exp(-k × t))^(1 + wagePremium × 5)
  // Note: this replaces the prior logistic `ceiling/(1+exp(-kt))` which started at 0.5 at t=0.
  // The new curve starts at 0 at t=0 and asymptotically approaches `ceiling`. Intentional — realistic
  // early-stage adoption dynamics (per Phase 10.A plan; see Part 10 for verification points).
  const asymmetry = 1 + wagePremium * ADOPTION_TAIL_ASYMMETRY_SCALE;
  const standardApproach = 1 - Math.exp(-steepness * timeSinceTrigger);
  const rate = Math.pow(Math.max(0, standardApproach), asymmetry);

  return Math.max(0, Math.min(ceiling, rate * ceiling));
}

/**
 * Apply geopolitical risk modifier to steepness for robotics/AV deployments.
 *
 * Formula (DATA_MODEL.md §3.2):
 *   a_effective = a * (1 - geopolitical_risk_factor)
 *
 * @param baseSteepness - Original steepness parameter
 * @param geopoliticalRiskExposure - Cluster-specific exposure [0, 1]
 * @param geopoliticalRiskFactor - Global risk level [0, 0.5]
 * @returns Adjusted steepness
 */
export function applyGeopoliticalRisk(
  baseSteepness: number,
  geopoliticalRiskExposure: number,
  geopoliticalRiskFactor: number,
): number {
  // Only applies to clusters with geopolitical risk exposure
  const effectiveRisk = geopoliticalRiskFactor * geopoliticalRiskExposure;
  return baseSteepness * (1 - effectiveRisk);
}

/**
 * Compute competitive pressure accelerant.
 *
 * Formula (DATA_MODEL.md §3.3):
 *   competitive_pressure(o, t) = max(0, adoption_rate(o, t) - 0.2) * pressure_multiplier
 *   adoption_rate_adjusted(o, t) = adoption_rate(o, t) * (1 + competitive_pressure(o, t))
 *
 * Once >20% of a sector adopts, holdouts face increasing cost disadvantage.
 *
 * @param baseAdoptionRate - Raw adoption rate before competitive pressure
 * @param adoptionParams - Contains threshold and multiplier
 * @returns Adjusted adoption rate after competitive pressure
 */
export function applyCompetitivePressure(
  baseAdoptionRate: number,
  adoptionParams: AdoptionParams = DEFAULT_ADOPTION_PARAMS,
  /** Phase 10.A: prior-year peer α [0,1]. Routes (1 - peerAlpha) of pressure to adoption rate;
   *  the peerAlpha portion is captured by computeEffectiveAlpha's competitive term. Avoids double-counting. */
  peerAlpha: number = 0.5,
  /** Phase 10.A: user-adjustable threshold override (config.competitivePressureThreshold). */
  thresholdOverride?: number,
  /** FS-1b F4 (ruled): the cluster's declared adoption ceiling — pressure may not push adoption
   *  past the ceiling computeBaseAdoptionRate enforced (the 1.0 literal retires). */
  clusterCeiling: number = 1.0,
): number {
  const threshold = thresholdOverride
    ?? adoptionParams.competitivePressureThreshold
    ?? DEFAULT_COMPETITIVE_PRESSURE_THRESHOLD;
  const { competitivePressureMultiplier } = adoptionParams;

  const pressure = Math.max(0, baseAdoptionRate - threshold) * competitivePressureMultiplier;
  // Split: (1 - peerAlpha) of the pressure flows to the ADOPTION RATE channel.
  // The complementary peerAlpha × pressure is applied to α in computeEffectiveAlpha (competitive driver).
  const adjusted = baseAdoptionRate * (1 + pressure * (1 - peerAlpha));

  return Math.min(clusterCeiling, adjusted);
}

/**
 * Apply revenue pressure feedback from the displacement-demand feedback cycle.
 *
 * Formula (DATA_MODEL.md §5.6):
 *   adoption_rate_final(o, r, t) = adoption_rate_adjusted(o, r, t) * (1 + automation_acceleration(t))
 *
 * @param adjustedAdoptionRate - Adoption rate after competitive pressure
 * @param automationAcceleration - From macro model's revenue pressure feedback
 * @returns Final adoption rate
 */
export function applyRevenuePressure(
  adjustedAdoptionRate: number,
  automationAcceleration: number,
): number {
  const final = adjustedAdoptionRate * (1 + automationAcceleration);
  return Math.min(1, final);
}

/**
 * Compute the full adoption result for an occupation-role at time t.
 * Chains: base S-curve → geopolitical risk → competitive pressure → revenue pressure.
 *
 * @param year - Current year
 * @param triggerYear - Year BFCS thresholds met (null if never)
 * @param deploymentType - Determines S-curve steepness (fallback)
 * @param adoptionLag - Additional deployment lag in years
 * @param geopoliticalRiskExposure - Cluster-specific geo risk exposure [0, 1]
 * @param adoptionParams - Adjustable adoption parameters
 * @param automationAcceleration - Revenue pressure feedback from macro model
 * @param clusterSteepness - Per-cluster steepness override
 * @param clusterCeiling - Per-cluster adoption ceiling [0, 1]
 * @returns Full AdoptionResult
 */
export function getAdoptionRate(
  year: number,
  triggerYear: number | null,
  deploymentType: DeploymentType,
  adoptionLag: number,
  geopoliticalRiskExposure: number,
  adoptionParams: AdoptionParams = DEFAULT_ADOPTION_PARAMS,
  automationAcceleration: number = 0,
  clusterSteepness?: number,
  clusterCeiling?: number,
  /** Phase 10.A: role.aiReplacementDifficultyWagePremium [0,1] — tail-drag for base S-curve. */
  wagePremium: number = 0,
  /** Phase 10.A: prior-year peer α for competitive-pressure split. */
  peerAlpha: number = 0.5,
  /** Phase 10.A: user override for competitive-pressure threshold. */
  competitivePressureThreshold?: number,
): AdoptionResult {
  // Not triggered yet
  if (triggerYear === null || year < triggerYear) {
    return {
      triggered: triggerYear !== null,
      triggerYear,
      adoptionRate: 0,
      adjustedAdoptionRate: 0,
    };
  }

  // Apply geopolitical risk to steepness for affected deployment types
  const baseSteepness = clusterSteepness ?? adoptionParams.steepnessByDeployment[deploymentType];
  const adjustedSteepness = applyGeopoliticalRisk(
    baseSteepness,
    geopoliticalRiskExposure,
    adoptionParams.geopoliticalRiskFactor,
  );

  // Create modified params with adjusted steepness
  const effectiveParams: AdoptionParams = {
    ...adoptionParams,
    steepnessByDeployment: {
      ...adoptionParams.steepnessByDeployment,
      [deploymentType]: adjustedSteepness,
    },
  };

  // Step 1: Base S-curve (with per-cluster steepness, ceiling, and wagePremium tail drag)
  const baseRate = computeBaseAdoptionRate(
    year,
    triggerYear,
    deploymentType,
    adoptionLag,
    effectiveParams,
    clusterSteepness ? adjustedSteepness : undefined,
    clusterCeiling,
    wagePremium,
  );

  // Step 2: Competitive pressure (peer-α aware split)
  const afterCompetitive = applyCompetitivePressure(
    baseRate, adoptionParams, peerAlpha, competitivePressureThreshold,
    clusterCeiling ?? 1.0,  // FS-1b F4: the inner clamp matches the composer's (defense in depth)
  );

  // Step 3: Revenue pressure (displacement-demand feedback)
  const finalRate = applyRevenuePressure(afterCompetitive, automationAcceleration);

  // Cap at ceiling if set
  const ceiling = clusterCeiling ?? 1.0;
  const cappedRate = Math.min(ceiling, finalRate);

  return {
    triggered: true,
    triggerYear,
    adoptionRate: baseRate,
    adjustedAdoptionRate: cappedRate,
  };
}
