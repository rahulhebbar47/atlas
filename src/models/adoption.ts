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

// ============================================================
// THE UNIFIED ADOPTION STATE MACHINE (the coupled design checkpoint §4, mini-stage 2)
// ============================================================

/**
 * Plain English: adoption is no longer a one-way latch. Once triggered, a role's adoption
 * GROWS along the existing rich S-curve while its economics hold; FREEZES when its scores
 * dip inside the switching-cost band; and REVERSES when either (a) capability/availability
 * genuinely regresses (unthrottled — the firm has no choice; the gap is realized as
 * capacity loss, the 2021-22 production-cut reality), or (b) continuing automation costs
 * more than re-hiring from the displaced pool by more than the band (throttled by how fast
 * the pool can actually restaff — Amendment 1's capacity coupling). Re-engagement after a
 * decline is SLOW (the labor-economics asymmetry).
 *
 * THE UNIFICATION (Amendment 2 — no toggles): this machine is the ONLY adoption path. The
 * GROWING state returns the RAW getAdoptionRate value — every existing modifier
 * (acceleration, competitive pressure, tail asymmetry, peer split) unchanged, NO ratchet —
 * so when the machine never leaves GROWING (the no-shock default world) it reproduces the
 * predecessor arithmetic EXACTLY (the pre-registered bit-identity row). The retired paths:
 * the trigger latch's monotone-only consumption of getAdoptionRate, and the SC-scenario
 * computeStatefulAdoptionRate (supplyChain.ts — kept as the deprecated record; its simple
 * logistic + ratchet was that path's choice, superseded by the one rich curve).
 *
 * THE FRICTION ALLOCATION (Amendment 1, enforced): the hysteresis BAND carries one-time
 * switching costs; the REHIRE BASIS (cheaperRehire — the displaced pool's composition-
 * weighted wage) carries the ongoing wage truth of pool labor; FILL CAPACITY (the pool-size
 * throttle, mini-stage 3 refines to effectiveness-weighted) carries matching. Each friction
 * lives in exactly one object.
 */
export type UnifiedAdoptionStatus = 'not_triggered' | 'growing' | 'recovering' | 'frozen'
  | 'declining_availability' | 'declining_cost';

export interface UnifiedAdoptionResult {
  adoptionRate: number;
  status: UnifiedAdoptionStatus;
  frozenSince: number | null;
  hasDeclined: boolean;
  /** Fraction of role employment re-hired this year via cost-triggered de-adoption
   *  (for the caller's pool-budget bookkeeping). */
  costRehireFraction: number;
}

export function computeUnifiedAdoptionState(i: {
  year: number;
  previousRate: number;
  previousFrozenSince: number | null;
  previousHasDeclined: boolean;
  triggerYear: number | null;
  /** The RAW rich-curve rate for this year (getAdoptionRate(...).adjustedAdoptionRate). */
  growthRate: number;
  bfcsCurrentlyMet: boolean;
  scores: { better: number; faster: number; safer: number };
  thresholds: { better: number; faster: number; cheaper: number; safer: number };
  /** The REHIRE-basis Cheaper score (the pool's composition-weighted wage in the
   *  denominator; degrades to the incumbent basis when the pool is empty). */
  cheaperRehire: number;
  hysteresisWidth: number;
  /** Per-class de-adoption speed (rate points/yr) and the recovery cap (rate points/yr). */
  deAdoptionRate: number;
  reAdoptionRate: number;
  /** [0,1] — the Amendment-1 capacity throttle on COST-triggered decline only
   *  (min(deAdoptionRate, achievable restaffing) expressed as a factor). */
  fillCapFactor: number;
}): UnifiedAdoptionResult {
  const base = {
    frozenSince: null as number | null,
    hasDeclined: i.previousHasDeclined,
    costRehireFraction: 0,
  };
  if (i.triggerYear === null || i.year < i.triggerYear) {
    return { ...base, adoptionRate: 0, status: 'not_triggered' };
  }

  if (i.bfcsCurrentlyMet) {
    if (!i.previousHasDeclined) {
      // The no-shock path: RAW rich curve — bit-identical to the predecessor by construction.
      return { ...base, adoptionRate: i.growthRate, status: 'growing' };
    }
    // Post-decline re-engagement is SLOW (asymmetric speeds): upward movement is capped at
    // reAdoptionRate per year until the rich curve is caught (then the episode is over).
    const capped = Math.min(i.growthRate, i.previousRate + i.reAdoptionRate);
    if (capped >= i.growthRate) {
      return { ...base, hasDeclined: false, adoptionRate: i.growthRate, status: 'growing' };
    }
    return { ...base, adoptionRate: capped, status: 'recovering' };
  }

  // Not all gates met: classify the exit.
  // (a) AVAILABILITY-FORCED (capability regression / input rationing): any NON-cost score
  //     below the de-adoption bar — UNTHROTTLED (the firm has no choice; the restaffing gap
  //     is realized as capacity loss, not smooth substitution).
  const bar = (thr: number) => thr * (1 - i.hysteresisWidth);
  const availabilityForced =
    (i.thresholds.better > 0 && i.scores.better < bar(i.thresholds.better))
    || (i.thresholds.faster > 0 && i.scores.faster < bar(i.thresholds.faster))
    || (i.thresholds.safer > 0 && i.scores.safer < bar(i.thresholds.safer));
  if (availabilityForced) {
    const rate = Math.max(0, i.previousRate - i.deAdoptionRate);
    return { ...base, hasDeclined: true, adoptionRate: rate, status: 'declining_availability' };
  }
  // (b) COST-TRIGGERED: continuing automation loses to REHIRING from the pool by more than
  //     the band — throttled by achievable restaffing (Amendment 1).
  if (i.thresholds.cheaper > 0 && i.cheaperRehire < bar(i.thresholds.cheaper)) {
    const throttled = i.deAdoptionRate * Math.max(0, Math.min(1, i.fillCapFactor));
    const rate = Math.max(0, i.previousRate - throttled);
    return {
      ...base, hasDeclined: true, adoptionRate: rate, status: 'declining_cost',
      costRehireFraction: i.previousRate - rate,
    };
  }
  // (c) Inside the band: FROZEN (switching costs hold the position).
  return {
    ...base,
    adoptionRate: i.previousRate,
    status: 'frozen',
    frozenSince: i.previousFrozenSince ?? i.year,
  };
}
