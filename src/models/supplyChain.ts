/**
 * ATLAS Phase 9: Supply Chain Uncertainty Module
 *
 * Models how constraints on AI infrastructure (chip shortages, energy costs,
 * datacenter bottleneck, rare earth disruptions) affect the AI automation
 * timeline through the BFCS framework.
 *
 * Two channels:
 *   1. Training channel → delays AI capability S-curves (monotonic, never recovers)
 *   2. Deployment channel → raises AI costs and slows speed (modifies BFCS)
 *
 * All functions are PURE — no side effects, no state mutation, fully testable.
 *
 * Source: docs/Prompts/Pending/atlas-phase9-supply-chain.md (v5.0 specification)
 */

import type {
  CapabilityVectorId,
  DeploymentType,
  SupplyChainInputs,
  SupplyChainResilience,
  SupplyChainConfig,
  SupplyChainEffects,
  TrainingComposition,
  SupplyInputKey,
  BFCSDimension,
  SensitivityMatrix,
} from '@/types';

import {
  DEFAULT_SUPPLY_CHAIN_INPUTS,
  DEFAULT_RESILIENCE,
  RESILIENCE_IMPROVEMENT_RATES,
  MAX_RESILIENCE,
  MAX_RESILIENCE_DC,
  DEFAULT_TRAINING_COMPOSITION,
  DEFAULT_PROCUREMENT_SHARES,
  DEFAULT_COST_VS_PROCUREMENT_BLEND,
  DEFAULT_TRAINING_SCALE_GROWTH_RATE,
  DEFAULT_TRAINING_DYNAMICS,
  DEFAULT_REGULATORY_FRICTION,
  DEFAULT_CASCADE_LAG,
  DEFAULT_CASCADE_COST_PREMIUM,
  DEFAULT_COST_PASS_THROUGH,
  DEFAULT_CONSUMER_PASS_THROUGH,
  DEFAULT_HYSTERESIS_MAX_COGNITIVE,
  DEFAULT_HYSTERESIS_MAX_EMBODIED,
  PASS_THROUGH_TRAJECTORY,
  COGNITIVE_SENSITIVITY,
  EMBODIED_SENSITIVITY,
  PROPAGATION_LAGS,
  DEPLOYMENT_COST_COMPOSITION,
  HYSTERESIS_BASE_COGNITIVE,
  HYSTERESIS_BASE_EMBODIED,
  HYSTERESIS_CAP_YEARS_COGNITIVE,
  HYSTERESIS_CAP_YEARS_EMBODIED,
  ADOPTION_DECLINE_RATE_COGNITIVE,
  ADOPTION_DECLINE_RATE_EMBODIED,
  DEFAULT_START_YEAR,
  DEFAULT_INFERENCE_ANNUAL_CHANGE,
} from '@/models/constants';

// ============================================================
// 1. getDefaultSupplyChainConfig
// ============================================================

/** Returns a full default supply chain config (all inputs at 100 = no-op). */
export function getDefaultSupplyChainConfig(): SupplyChainConfig {
  return {
    inputs: { ...DEFAULT_SUPPLY_CHAIN_INPUTS },
    resilience: { ...DEFAULT_RESILIENCE },
    trainingComposition: { ...DEFAULT_TRAINING_COMPOSITION },
    trainingScaleGrowthRate: DEFAULT_TRAINING_SCALE_GROWTH_RATE,
    trainingDynamics: {
      aiChips: { ...DEFAULT_TRAINING_DYNAMICS.aiChips },
      energy: { ...DEFAULT_TRAINING_DYNAMICS.energy },
      datacenter: { ...DEFAULT_TRAINING_DYNAMICS.datacenter },
    },
    regulatoryFriction: DEFAULT_REGULATORY_FRICTION,
    procurementShares: { ...DEFAULT_PROCUREMENT_SHARES },
    costVsProcurementBlend: DEFAULT_COST_VS_PROCUREMENT_BLEND,
    chipCascadeLag: DEFAULT_CASCADE_LAG,
    chipCascadeCostPremium: DEFAULT_CASCADE_COST_PREMIUM,
    costPassThroughRate: DEFAULT_COST_PASS_THROUGH,
    consumerPassThroughRate: DEFAULT_CONSUMER_PASS_THROUGH,
    hysteresisMaxCognitive: DEFAULT_HYSTERESIS_MAX_COGNITIVE,
    hysteresisMaxEmbodied: DEFAULT_HYSTERESIS_MAX_EMBODIED,
    sensitivityBlendCognitive: -1,
    sensitivityBlendEmbodied: -1,
  };
}

// ============================================================
// 2. computeAutopilotResilience
// ============================================================

/**
 * Time-evolved resilience values.
 * Onshoring fraction boosts aiChips resilience faster (CHIPS Act effect).
 * All values capped at MAX_RESILIENCE / MAX_RESILIENCE_DC.
 */
export function computeAutopilotResilience(
  year: number,
  baseResilience: SupplyChainResilience,
  onshoringFraction: number,
): SupplyChainResilience {
  const t = year - DEFAULT_START_YEAR;
  const clampRes = (base: number, rate: number, cap: number): number =>
    Math.min(cap, base + rate * t);

  // Onshoring fraction accelerates AI chip resilience improvement
  const chipRate = RESILIENCE_IMPROVEMENT_RATES.aiChips * (1 + onshoringFraction);

  return {
    aiChips: clampRes(baseResilience.aiChips, chipRate, MAX_RESILIENCE),
    energy: clampRes(baseResilience.energy, RESILIENCE_IMPROVEMENT_RATES.energy, MAX_RESILIENCE_DC),
    trainingDC: clampRes(baseResilience.trainingDC, RESILIENCE_IMPROVEMENT_RATES.trainingDC, MAX_RESILIENCE_DC),
    inferenceDC: clampRes(baseResilience.inferenceDC, RESILIENCE_IMPROVEMENT_RATES.inferenceDC, MAX_RESILIENCE_DC),
    roboticsHardware: clampRes(baseResilience.roboticsHardware, RESILIENCE_IMPROVEMENT_RATES.roboticsHardware, MAX_RESILIENCE),
  };
}

// ============================================================
// 3. interpolatePassThrough
// ============================================================

/** Linear interpolation along the pass-through trajectory. */
export function interpolatePassThrough(
  year: number,
  trajectory: Array<{ year: number; value: number }> = PASS_THROUGH_TRAJECTORY,
): number {
  if (trajectory.length === 0) return 0;
  const first = trajectory[0]!;
  const last = trajectory[trajectory.length - 1]!;
  if (year <= first.year) return first.value;
  if (year >= last.year) return last.value;

  for (let i = 0; i < trajectory.length - 1; i++) {
    const a = trajectory[i]!;
    const b = trajectory[i + 1]!;
    if (year >= a.year && year <= b.year) {
      const span = b.year - a.year;
      if (span === 0) return a.value;
      const frac = (year - a.year) / span;
      return a.value + frac * (b.value - a.value);
    }
  }
  return last.value;
}

// ============================================================
// 4. applyPropagationLags
// ============================================================

// SupplyInputKey, BFCSDimension, SensitivityMatrix imported from @/types

/** Maps SupplyChainInputs field to the SupplyInputKey used in lag/sensitivity matrices. */
const INPUT_TO_KEY: Array<[keyof SupplyChainInputs, SupplyInputKey | null]> = [
  ['aiChips', 'aiChips'],
  ['energyPrice', 'energyPrice'],
  ['energyCapacity', 'energyCapacity'],
  ['trainingDCCapacity', 'trainingDCCapacity'],
  ['inferenceDCCapacity', 'inferenceDCCapacity'],
  ['roboticsHardware', 'roboticsHardware'],
  ['softwareEfficiency', null], // Not in lag/sensitivity matrices
];

/**
 * Returns effective lagged supply values per input per BFCS dimension.
 * Lag formulas:
 *   lag = 0: effective = current
 *   lag < 12mo: effective = current × (1 - lag/12) + previous × (lag/12)
 *   lag >= 12mo: effective = previous × min(1, 12/lag) + twoPrior × max(0, 1 - 12/lag)
 */
export function applyPropagationLags(
  current: SupplyChainInputs,
  previous: SupplyChainInputs,
  twoPrior: SupplyChainInputs,
): Record<SupplyInputKey, Record<BFCSDimension, number>> {
  const result = {} as Record<SupplyInputKey, Record<BFCSDimension, number>>;
  const dimensions: BFCSDimension[] = ['better', 'faster', 'cheaper', 'safer'];

  for (const [field, key] of INPUT_TO_KEY) {
    if (key === null) continue;
    const cur = current[field];
    const prev = previous[field];
    const prior = twoPrior[field];
    const lags = PROPAGATION_LAGS[key];

    const dimValues = {} as Record<BFCSDimension, number>;
    for (const dim of dimensions) {
      const lagMonths = lags[dim];
      if (lagMonths === 0) {
        dimValues[dim] = cur;
      } else if (lagMonths < 12) {
        dimValues[dim] = cur * (1 - lagMonths / 12) + prev * (lagMonths / 12);
      } else {
        dimValues[dim] = prev * Math.min(1, 12 / lagMonths) + prior * Math.max(0, 1 - 12 / lagMonths);
      }
    }
    result[key] = dimValues;
  }

  return result;
}

// ============================================================
// 5. computeDynamicTrainingComposition
// ============================================================

/**
 * Dynamic training composition blending cost share + procurement constraint share.
 *
 * Factor 1 — Cost share (dynamic): what fraction of the budget goes to each resource.
 *   Chips decline fast here because cost-per-FLOP drops exponentially.
 *   Net rate = techDecline + scalePressure × ln(growthRate).
 *   Regulatory friction multiplies DC scale pressure.
 *
 * Factor 2 — Procurement constraint share (stable): what fraction of the difficulty
 *   of physically scaling up comes from each resource.
 *   Reflects fab throughput, grid interconnection, construction timelines.
 *
 * Blend: effective = w × costShare + (1 - w) × procurementShare
 *   where w = costVsProcurementBlend (1.0 = pure cost, 0.0 = pure procurement).
 *
 * At year 0 with defaults: identical to initial trainingComposition.
 * At year 10 with blend 0.50: chips ~23% (vs 0.4% pure cost), keeping chip
 *   shortages visible even when per-unit cost has dropped dramatically.
 */
export function computeDynamicTrainingComposition(
  year: number,
  config: SupplyChainConfig,
): TrainingComposition {
  const t = year - DEFAULT_START_YEAR;
  const lnGrowth = Math.log(config.trainingScaleGrowthRate);
  const effectiveDCScalePressure = config.trainingDynamics.datacenter.scalePressure * config.regulatoryFriction;

  // Scale pressure OFFSETS cost decline (pushes costs up as demand scales).
  // Net rate = techDecline + scalePressure × ln(growth)
  // Spec example: chips = -0.35 + 0.05*ln(3) = -0.295, energy = -0.04 + 0.15*ln(3) = +0.125
  const netRates = {
    aiChips: config.trainingDynamics.aiChips.techDeclineRate + config.trainingDynamics.aiChips.scalePressure * lnGrowth,
    energy: config.trainingDynamics.energy.techDeclineRate + config.trainingDynamics.energy.scalePressure * lnGrowth,
    datacenter: config.trainingDynamics.datacenter.techDeclineRate + effectiveDCScalePressure * lnGrowth,
  };

  // Factor 1: Cost share (dynamic — chips decline fast)
  const relativeCost = {
    aiChips: config.trainingComposition.aiChips * Math.exp(netRates.aiChips * t),
    energy: config.trainingComposition.energy * Math.exp(netRates.energy * t),
    datacenter: config.trainingComposition.datacenter * Math.exp(netRates.datacenter * t),
  };
  const costTotal = relativeCost.aiChips + relativeCost.energy + relativeCost.datacenter;
  const costShare = costTotal === 0
    ? { aiChips: 1 / 3, energy: 1 / 3, datacenter: 1 / 3 }
    : {
      aiChips: relativeCost.aiChips / costTotal,
      energy: relativeCost.energy / costTotal,
      datacenter: relativeCost.datacenter / costTotal,
    };

  // Factor 2: Procurement constraint share (stable — physical throughput limits)
  const proc = config.procurementShares;

  // Blend: w = 1.0 → pure cost, w = 0.0 → pure procurement
  const w = config.costVsProcurementBlend;

  return {
    aiChips: w * costShare.aiChips + (1 - w) * proc.aiChips,
    energy: w * costShare.energy + (1 - w) * proc.energy,
    datacenter: w * costShare.datacenter + (1 - w) * proc.datacenter,
  };
}

// ============================================================
// 6. computeCapabilityDelay
// ============================================================

/**
 * Computes annual capability delay per vector from supply constraints.
 * Uses DYNAMIC (time-varying) training composition.
 *
 * Energy constraint uses WORSE of energyPrice and energyCapacity:
 *   energyCapacity < 100 → hard power constraint
 *   energyPrice > 100 → some runs uneconomical (0.5× weight)
 *
 * Software efficiency offsets training constraints as a divisor.
 * Delay is MONOTONICALLY INCREASING (accumulated by caller).
 */
export function computeCapabilityDelay(
  laggedInputs: Record<SupplyInputKey, Record<BFCSDimension, number>>,
  resilience: SupplyChainResilience,
  dynamicComposition: TrainingComposition,
  softwareEfficiency: number,
): Record<CapabilityVectorId, number> {
  // Compute effective constraint per training resource component
  // Using "better" dimension lags for training channel
  const chipConstraint = Math.max(0, 1 - laggedInputs.aiChips.better / 100) * (1 - resilience.aiChips);
  const dcConstraint = Math.max(0, 1 - laggedInputs.trainingDCCapacity.better / 100) * (1 - resilience.trainingDC);

  // Energy: WORSE of capacity constraint and price constraint
  const energyCapLag = laggedInputs.energyCapacity.better;
  const energyPriceLag = laggedInputs.energyPrice.better;
  const energyCapConstraint = Math.max(0, 1 - energyCapLag / 100) * (1 - resilience.energy);
  const energyPriceConstraint = energyPriceLag > 100
    ? Math.max(0, 1 - 100 / energyPriceLag) * 0.5 * (1 - resilience.energy)
    : 0;
  const energyConstraint = Math.max(energyCapConstraint, energyPriceConstraint);

  // Training constraint weighted by DYNAMIC composition
  const trainingConstraint =
    dynamicComposition.aiChips * chipConstraint +
    dynamicComposition.energy * energyConstraint +
    dynamicComposition.datacenter * dcConstraint;

  // Software efficiency offsets training constraints
  const softwareOffset = softwareEfficiency / 100; // 100 → 1.0, 150 → 1.5
  const annualDelay = trainingConstraint * (1 / softwareOffset);

  // All capability vectors share the same training pipeline delay
  return {
    generative: annualDelay,
    agentic: annualDelay,
    embodied: annualDelay,
  };
}

// ============================================================
// 7. computeCascadeBacklog
// ============================================================

/**
 * How many "generation-years" behind the inference fleet is.
 * Normalized to [0, 1] by dividing by window years.
 */
export function computeCascadeBacklog(
  chipSupplyHistory: number[],
  cascadeLag: number,
): number {
  const windowYears = Math.max(1, Math.ceil(cascadeLag));
  const startIdx = Math.max(0, chipSupplyHistory.length - windowYears);
  let sumDeficit = 0;
  let count = 0;
  for (let i = startIdx; i < chipSupplyHistory.length; i++) {
    sumDeficit += Math.max(0, 1 - (chipSupplyHistory[i] ?? 100) / 100);
    count++;
  }
  if (count === 0) return 0;
  return sumDeficit / windowYears;
}

// ============================================================
// 8. computeEffectiveComputeDecline
// ============================================================

/**
 * Inference compute cost decline rate after cascade effect.
 * At max backlog with 0.30 premium: -0.45 × 0.70 = -0.315
 */
export function computeEffectiveComputeDecline(
  baselineDecline: number,
  cascadeBacklog: number,
  cascadePremium: number,
): number {
  return baselineDecline * (1 - cascadePremium * Math.min(1, cascadeBacklog));
}

// ============================================================
// 9. computeDeploymentCostMultipliers
// ============================================================

/**
 * Supply chain multipliers on each deployment cost component.
 * At all inputs = 100: compute=1.0, physical=1.0, energy=1.0 (no-op).
 */
export function computeDeploymentCostMultipliers(
  effectiveInputs: SupplyChainInputs,
  resilience: SupplyChainResilience,
  softwareEfficiency: number,
): { compute: number; physicalHardware: number; energy: number } {
  // AI Chips scarcity → compute (primary driver)
  const chipConstraint = Math.max(0, 1 - effectiveInputs.aiChips / 100) * (1 - resilience.aiChips);
  // Inference DC scarcity → compute (scarcity pricing, additive)
  const infDCConstraint = Math.max(0, 1 - effectiveInputs.inferenceDCCapacity / 100) * (1 - resilience.inferenceDC);
  // Software efficiency → compute (divisor, reduces effective constraint)
  const softwareOffset = softwareEfficiency / 100; // 150 → 1.5
  const computeMultiplier = 1.0 + (chipConstraint + infDCConstraint * 0.5) / softwareOffset;

  // Energy price → energy (direct pass-through)
  const energyMultiplier = effectiveInputs.energyPrice / 100;

  // Robotics HW → physical hardware
  const roboticsConstraint = Math.max(0, 1 - effectiveInputs.roboticsHardware / 100) * (1 - resilience.roboticsHardware);
  const physicalMultiplier = 1.0 + roboticsConstraint;

  return {
    compute: Math.max(0.1, computeMultiplier),
    physicalHardware: Math.max(0.1, physicalMultiplier),
    energy: Math.max(0.1, energyMultiplier),
  };
}

// ============================================================
// 10. applyPassThrough
// ============================================================

/**
 * Applies pass-through rate to raw deployment cost multipliers.
 * Returns multipliers in BFCS field names (compute→inference, physicalHardware→manufacturing).
 * At pass-through 0%: all = 1.0 (deployers see baseline cost).
 * At pass-through 100%: deployers see full supply-chain-modified cost.
 */
export function applyPassThrough(
  rawMultipliers: { compute: number; physicalHardware: number; energy: number },
  passThrough: number,
): { inference: number; manufacturing: number; energy: number } {
  return {
    inference: 1.0 + passThrough * (rawMultipliers.compute - 1.0),
    manufacturing: 1.0 + passThrough * (rawMultipliers.physicalHardware - 1.0),
    energy: 1.0 + passThrough * (rawMultipliers.energy - 1.0),
  };
}

// ============================================================
// 10b. scaleSensitivity — apply early/mature blend to a matrix
// ============================================================

/**
 * Scale a sensitivity matrix by the early/mature blend multipliers.
 * Better and Cheaper columns are scaled; Faster and Safer are unaffected
 * (they don't shift between early and mature stages).
 */
export function scaleSensitivity(
  matrix: SensitivityMatrix,
  blendResult: { betterMult: number; cheaperMult: number },
): SensitivityMatrix {
  const scaled = {} as SensitivityMatrix;
  for (const input of Object.keys(matrix) as SupplyInputKey[]) {
    const dims = matrix[input];
    scaled[input] = {
      better: dims.better * blendResult.betterMult,
      faster: dims.faster,
      cheaper: dims.cheaper * blendResult.cheaperMult,
      safer: dims.safer,
    };
  }
  return scaled;
}

// ============================================================
// 11. computeFasterMultiplier
// ============================================================

/**
 * Multiplier on INFERENCE_SPEED_IMPROVEMENT_RATE for BFCS Faster score.
 * Uses sensitivity matrix weighted by supply constraints.
 */
export function computeFasterMultiplier(
  laggedInputs: Record<SupplyInputKey, Record<BFCSDimension, number>>,
  resilience: SupplyChainResilience,
  deploymentType: DeploymentType,
  softwareEfficiency: number,
  sensitivityOverride?: SensitivityMatrix,
): number {
  const matrix = sensitivityOverride
    ?? ((deploymentType === 'software' || deploymentType === 'hybrid')
      ? COGNITIVE_SENSITIVITY : EMBODIED_SENSITIVITY);

  let totalDrag = 0;
  const resMap: Record<SupplyInputKey, number> = {
    aiChips: resilience.aiChips,
    energyPrice: resilience.energy,
    energyCapacity: resilience.energy,
    trainingDCCapacity: resilience.trainingDC,
    inferenceDCCapacity: resilience.inferenceDC,
    roboticsHardware: resilience.roboticsHardware,
  };

  for (const key of Object.keys(matrix) as SupplyInputKey[]) {
    const sensitivity = matrix[key].faster;
    if (sensitivity === 0) continue;
    const laggedValue = laggedInputs[key].faster;
    const constraint = Math.max(0, 1 - laggedValue / 100) * (1 - resMap[key]);
    totalDrag += sensitivity * constraint;
  }

  // Software efficiency partially offsets faster drag
  const softwareOffset = softwareEfficiency / 100;
  totalDrag = totalDrag / softwareOffset;

  return Math.max(0, 1 - totalDrag);
}

// ============================================================
// 12. computeSaferMultiplier
// ============================================================

/**
 * Multiplier on SAFETY_IMPROVEMENT_RATE for BFCS Safer score.
 * Uses sensitivity matrix weighted by supply constraints.
 */
export function computeSaferMultiplier(
  laggedInputs: Record<SupplyInputKey, Record<BFCSDimension, number>>,
  resilience: SupplyChainResilience,
  deploymentType: DeploymentType,
  sensitivityOverride?: SensitivityMatrix,
): number {
  const matrix = sensitivityOverride
    ?? ((deploymentType === 'software' || deploymentType === 'hybrid')
      ? COGNITIVE_SENSITIVITY : EMBODIED_SENSITIVITY);

  let totalDrag = 0;
  const resMap: Record<SupplyInputKey, number> = {
    aiChips: resilience.aiChips,
    energyPrice: resilience.energy,
    energyCapacity: resilience.energy,
    trainingDCCapacity: resilience.trainingDC,
    inferenceDCCapacity: resilience.inferenceDC,
    roboticsHardware: resilience.roboticsHardware,
  };

  for (const key of Object.keys(matrix) as SupplyInputKey[]) {
    const sensitivity = matrix[key].safer;
    if (sensitivity === 0) continue;
    const laggedValue = laggedInputs[key].safer;
    const constraint = Math.max(0, 1 - laggedValue / 100) * (1 - resMap[key]);
    totalDrag += sensitivity * constraint;
  }

  return Math.max(0, 1 - totalDrag);
}

// ============================================================
// 13. computeAdoptionDrag
// ============================================================

/**
 * Adoption steepness multiplier [0, 1].
 * Higher supply constraints → slower adoption S-curve.
 */
export function computeAdoptionDrag(
  laggedInputs: Record<SupplyInputKey, Record<BFCSDimension, number>>,
  resilience: SupplyChainResilience,
  deploymentType: DeploymentType,
  passThrough: number,
  sensitivityOverride?: SensitivityMatrix,
): number {
  const matrix = sensitivityOverride
    ?? ((deploymentType === 'software' || deploymentType === 'hybrid')
      ? COGNITIVE_SENSITIVITY : EMBODIED_SENSITIVITY);

  // Average constraint across all dimensions and inputs
  let totalConstraint = 0;
  let count = 0;
  const resMap: Record<SupplyInputKey, number> = {
    aiChips: resilience.aiChips,
    energyPrice: resilience.energy,
    energyCapacity: resilience.energy,
    trainingDCCapacity: resilience.trainingDC,
    inferenceDCCapacity: resilience.inferenceDC,
    roboticsHardware: resilience.roboticsHardware,
  };

  for (const key of Object.keys(matrix) as SupplyInputKey[]) {
    for (const dim of ['better', 'faster', 'cheaper', 'safer'] as BFCSDimension[]) {
      const sensitivity = matrix[key][dim];
      if (sensitivity === 0) continue;
      const laggedValue = laggedInputs[key][dim];
      const constraint = Math.max(0, 1 - laggedValue / 100) * (1 - resMap[key]);
      totalConstraint += sensitivity * constraint;
      count++;
    }
  }

  const avgConstraint = count > 0 ? totalConstraint / count : 0;
  // Pass-through modulates how much deployment cost affects adoption
  const effectiveConstraint = avgConstraint * (0.5 + 0.5 * passThrough);

  return Math.max(0, 1 - effectiveConstraint);
}

// ============================================================
// 14. computeHysteresisWidth
// ============================================================

/**
 * Hysteresis width grows logarithmically with time since adoption.
 * width = base + (max - base) × ln(1 + yearsSince) / ln(1 + capYears)
 */
export function computeHysteresisWidth(
  yearsSinceAdoption: number,
  deploymentType: DeploymentType,
  config: SupplyChainConfig,
): number {
  const isCognitive = deploymentType === 'software' || deploymentType === 'hybrid';
  const base = isCognitive ? HYSTERESIS_BASE_COGNITIVE : HYSTERESIS_BASE_EMBODIED;
  const max = isCognitive ? config.hysteresisMaxCognitive : config.hysteresisMaxEmbodied;
  const capYears = isCognitive ? HYSTERESIS_CAP_YEARS_COGNITIVE : HYSTERESIS_CAP_YEARS_EMBODIED;

  if (yearsSinceAdoption <= 0) return base;
  const progress = Math.log(1 + yearsSinceAdoption) / Math.log(1 + capYears);
  return base + (max - base) * Math.min(1, progress);
}

// ============================================================
// 15. computeStatefulAdoptionRate
// ============================================================

/** Status returned from stateful adoption computation. */
export type AdoptionStatus = 'not_triggered' | 'first_trigger' | 'growing' | 'frozen' | 'declining';

export interface StatefulAdoptionResult {
  adoptionRate: number;
  status: AdoptionStatus;
  frozenSince: number | null;
}

/**
 * Full stateful adoption with freeze/decline/resume.
 *
 * States:
 * 1. Not triggered → rate=0, status='not_triggered'
 * 2. First trigger this year → rate=0, status='first_trigger'
 * 3. BFCS met, previously triggered → S-curve with drag, MAX(S-curve, current rate), status='growing'
 * 4. BFCS not met, within hysteresis band → freeze at current, status='frozen'
 * 5. BFCS not met, below de-adoption threshold → decline, status='declining'
 */
export function computeStatefulAdoptionRate(
  year: number,
  previousRate: number,
  triggerYear: number | null,
  bfcsCurrentlyMet: boolean,
  scores: { better: number; faster: number; cheaper: number; safer: number },
  thresholds: { better: number; faster: number; cheaper: number; safer: number },
  hysteresisWidth: number,
  deploymentType: DeploymentType,
  adoptionLag: number,
  steepness: number,
  ceiling: number,
  dragMultiplier: number,
  previousFrozenSince: number | null,
): StatefulAdoptionResult {
  const isCognitive = deploymentType === 'software' || deploymentType === 'hybrid';
  const declineRate = isCognitive ? ADOPTION_DECLINE_RATE_COGNITIVE : ADOPTION_DECLINE_RATE_EMBODIED;

  // Not triggered and not meeting thresholds
  if (triggerYear === null && !bfcsCurrentlyMet) {
    return { adoptionRate: 0, status: 'not_triggered', frozenSince: null };
  }

  // First trigger this year
  if (triggerYear === null && bfcsCurrentlyMet) {
    return { adoptionRate: 0, status: 'first_trigger', frozenSince: null };
  }

  // Previously triggered — compute S-curve rate
  const effectiveTriggerYear = triggerYear! + adoptionLag;
  const yearsSinceTrigger = year - effectiveTriggerYear;
  if (yearsSinceTrigger <= 0) {
    // Still in adoption lag
    return { adoptionRate: previousRate, status: previousRate > 0 ? 'frozen' : 'not_triggered', frozenSince: previousFrozenSince };
  }

  // Compute base S-curve rate (logistic)
  const effectiveSteepness = steepness * dragMultiplier;
  const sCurveRate = ceiling / (1 + Math.exp(-effectiveSteepness * (yearsSinceTrigger - 3)));

  if (bfcsCurrentlyMet) {
    // Growing: take MAX of S-curve and current rate (catch-up)
    const newRate = Math.min(ceiling, Math.max(sCurveRate, previousRate));
    return { adoptionRate: newRate, status: 'growing', frozenSince: null };
  }

  // BFCS not met — check de-adoption thresholds
  const dims: Array<'better' | 'faster' | 'cheaper' | 'safer'> = ['better', 'faster', 'cheaper', 'safer'];
  let belowDeAdoption = false;
  for (const dim of dims) {
    const deAdoptionThreshold = thresholds[dim] * (1 - hysteresisWidth);
    if (scores[dim] < deAdoptionThreshold && thresholds[dim] > 0) {
      belowDeAdoption = true;
      break;
    }
  }

  if (belowDeAdoption) {
    // Declining
    const newRate = Math.max(0, previousRate - declineRate);
    return { adoptionRate: newRate, status: 'declining', frozenSince: null };
  }

  // Within hysteresis band — freeze
  const frozenSince = previousFrozenSince ?? year;
  return { adoptionRate: previousRate, status: 'frozen', frozenSince };
}

// ============================================================
// 16. computeLabProfitAdjustment
// ============================================================

/**
 * AI profit margin reduction from absorbed supply chain costs.
 * Labs absorb costs not passed through.
 * Returns negative value (margin reduction) when there are excess costs.
 */
export function computeLabProfitAdjustment(
  deploymentMultipliers: { compute: number; physicalHardware: number; energy: number },
  passThrough: number,
): number {
  // Average cost increase across components
  const avgIncrease = (
    (deploymentMultipliers.compute - 1) +
    (deploymentMultipliers.physicalHardware - 1) +
    (deploymentMultipliers.energy - 1)
  ) / 3;

  if (avgIncrease <= 0) return 0;

  // Labs absorb the fraction not passed through
  const absorbedFraction = 1 - passThrough;
  return -(avgIncrease * absorbedFraction);
}

// ============================================================
// 17. computeSupplyChainCostPush
// ============================================================

/**
 * Cost-push inflation component from supply chain constraints.
 * Enters price system alongside minWageCostPush and scarcityInflation.
 */
export function computeSupplyChainCostPush(
  automationCoverage: number,
  deploymentMultipliers: { compute: number; physicalHardware: number; energy: number },
  passThrough: number,
  consumerPassThrough: number,
): number {
  const avgCostIncrease = (
    (deploymentMultipliers.compute - 1) +
    (deploymentMultipliers.physicalHardware - 1) +
    (deploymentMultipliers.energy - 1)
  ) / 3;

  if (avgCostIncrease <= 0) return 0;
  return automationCoverage * avgCostIncrease * passThrough * consumerPassThrough;
}

// ============================================================
// 18. computeSensitivityBlend
// ============================================================

/**
 * Blends early vs mature sensitivity profiles based on automation progress.
 * Early: Better at 1.5×, Cheaper at 0.5×
 * Mature: flipped (Better at 0.5×, Cheaper at 1.5×)
 *
 * Uses PREVIOUS YEAR's progress (carried forward as state).
 */
export function computeSensitivityBlend(
  cognitiveProgress: number,
  embodiedProgress: number,
  config: SupplyChainConfig,
): { cognitive: { betterMult: number; cheaperMult: number }; embodied: { betterMult: number; cheaperMult: number } } {
  const blend = (progress: number, override: number): { betterMult: number; cheaperMult: number } => {
    // -1 = auto from progress; otherwise use fixed blend
    const p = override >= 0 ? override : progress;
    return {
      betterMult: 1.5 - p * 1.0,   // 1.5 → 0.5
      cheaperMult: 0.5 + p * 1.0,   // 0.5 → 1.5
    };
  };

  return {
    cognitive: blend(cognitiveProgress, config.sensitivityBlendCognitive),
    embodied: blend(embodiedProgress, config.sensitivityBlendEmbodied),
  };
}

// ============================================================
// 19. computeSupplyChainEffects — MASTER orchestrator
// ============================================================

/** Inputs required by the master supply chain effects computation. */
export interface SupplyChainComputeInputs {
  year: number;
  config: SupplyChainConfig;
  shockHistory: [SupplyChainInputs, SupplyChainInputs]; // [previous, twoPrior]
  chipSupplyHistory: number[];
  prevCumulativeDelay: Record<CapabilityVectorId, number>;
  onshoringFraction: number;
  automationCoverage: number;
  baseComputeDeclineRate: number;
  cognitiveProgress: number;  // from previous year
  embodiedProgress: number;   // from previous year
}

/**
 * MASTER function: computes all supply chain effects for a single year.
 * Called once per year in the simulation loop.
 * At all inputs = 100: returns identity/no-op effects.
 */
export function computeSupplyChainEffects(
  inputs: SupplyChainComputeInputs,
): SupplyChainEffects {
  const { year, config, shockHistory, chipSupplyHistory, prevCumulativeDelay, onshoringFraction, automationCoverage, baseComputeDeclineRate } = inputs;

  // 1. Compute effective resilience
  const effectiveResilience = computeAutopilotResilience(year, config.resilience, onshoringFraction);

  // 2. Compute aggregate resilience (weighted average)
  const aggregateResilience = (
    effectiveResilience.aiChips * 0.30 +
    effectiveResilience.energy * 0.20 +
    effectiveResilience.trainingDC * 0.15 +
    effectiveResilience.inferenceDC * 0.15 +
    effectiveResilience.roboticsHardware * 0.20
  );

  // 3. Apply propagation lags
  const laggedInputs = applyPropagationLags(config.inputs, shockHistory[0], shockHistory[1]);

  // 4. Dynamic training composition
  const dynamicTrainingComposition = computeDynamicTrainingComposition(year, config);

  // 5. Capability delays
  const annualDelay = computeCapabilityDelay(
    laggedInputs, effectiveResilience, dynamicTrainingComposition, config.inputs.softwareEfficiency,
  );
  const cumulativeCapabilityDelay: Record<CapabilityVectorId, number> = {
    generative: prevCumulativeDelay.generative + annualDelay.generative,
    agentic: prevCumulativeDelay.agentic + annualDelay.agentic,
    embodied: prevCumulativeDelay.embodied + annualDelay.embodied,
  };

  // 6. Cascade backlog & effective compute decline
  const cascadeBacklog = computeCascadeBacklog(chipSupplyHistory, config.chipCascadeLag);
  const effectiveComputeDeclineRate = computeEffectiveComputeDecline(
    baseComputeDeclineRate, cascadeBacklog, config.chipCascadeCostPremium,
  );

  // 7. Deployment cost multipliers
  const deploymentCostMultipliers = computeDeploymentCostMultipliers(
    config.inputs, effectiveResilience, config.inputs.softwareEfficiency,
  );

  // 8. Pass-through
  const costPassThroughRate = config.costPassThroughRate;
  const bfcsCostMultipliers = applyPassThrough(deploymentCostMultipliers, costPassThroughRate);

  // 8b. Sensitivity blend: scale matrices by early/mature progression
  // Early stage (low progress): Better sensitivity 1.5×, Cheaper 0.5×
  // Mature stage (high progress): Better sensitivity 0.5×, Cheaper 1.5×
  const blend = computeSensitivityBlend(inputs.cognitiveProgress, inputs.embodiedProgress, config);
  const scaledCognitive = scaleSensitivity(COGNITIVE_SENSITIVITY, blend.cognitive);
  const scaledEmbodied = scaleSensitivity(EMBODIED_SENSITIVITY, blend.embodied);

  // 9. BFCS multipliers (using software/cognitive as representative for aggregate effects)
  const fasterMultiplier = computeFasterMultiplier(laggedInputs, effectiveResilience, 'software', config.inputs.softwareEfficiency, scaledCognitive);
  const saferMultiplier = computeSaferMultiplier(laggedInputs, effectiveResilience, 'software', scaledCognitive);
  const adoptionDragMultiplier = computeAdoptionDrag(laggedInputs, effectiveResilience, 'software', costPassThroughRate, scaledCognitive);

  // 10. Macro integration
  const supplyChainCostPush = computeSupplyChainCostPush(
    automationCoverage, deploymentCostMultipliers, costPassThroughRate, config.consumerPassThroughRate,
  );
  const labProfitMarginAdjustment = computeLabProfitAdjustment(deploymentCostMultipliers, costPassThroughRate);

  return {
    annualCapabilityDelay: annualDelay,
    cumulativeCapabilityDelay,
    dynamicTrainingComposition,
    deploymentCostMultipliers,
    bfcsCostMultipliers,
    effectiveComputeDeclineRate,
    fasterMultiplier,
    saferMultiplier,
    adoptionDragMultiplier,
    supplyChainCostPush,
    labProfitMarginAdjustment,
    costPassThroughRate,
    scaledCognitiveSensitivity: scaledCognitive,
    scaledEmbodiedSensitivity: scaledEmbodied,
    effectiveResilience,
    aggregateResilience,
    cascadeBacklog,
  };
}
