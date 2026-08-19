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
  DEFAULT_FRONTIER_DRAIN_SCALE,
  DEFAULT_FRONTIER_REBUILD_YEARS,
  DEFAULT_FRONTIER_RATE_ELASTICITY,
  DEFAULT_FRONTIER_INNOVATION_ELASTICITY,
  DEFAULT_RESILIENCE_ONSET_YEARS,
  SUPPLY_INPUT_CLASS,
  SUPPLY_INPUT_KIND,
} from '@/models/constants';

// ============================================================
// 0b. computeInputConstraint — THE ONE constraint-semantics producer
// (Production Program Stage 4 MS1: the adoption-drag root fix + surplus semantics)
// ============================================================

/**
 * Per-cell supply constraint, SIGNED, keyed by the input's declared kind
 * (SUPPLY_INPUT_KIND — tsc-exhaustive):
 *
 *   PRICE rows:    max(0, 1 − 100/v) × (1 − resilience)
 *     — a spike (v > 100) constrains; at/below 100 the constraint is EXACTLY 0
 *       (price declines flow through the direct cost-multiplier channels; a drag
 *       relief here would double-count). The reciprocal form is the model's own
 *       precedent (computeCapabilityDelay's energy price leg) and keeps the
 *       constraint in [0, 1), commensurable with quantity constraints.
 *       The retired shortage-form treatment of price rows INVERTED the semantics
 *       (cheap energy at 70 dragged adoption 0.966; a 130 spike dragged zero —
 *       both execution-measured at Stage 0; ruled a defect, fixed here).
 *   QUANTITY rows: (1 − v/100) × (1 − resilience)   — SIGNED
 *     — shortage (v < 100) constrains; surplus (v > 100) RELIEVES symmetrically
 *       (the Stage-4 arrival-event semantics; the retired max(0, ·) clamp made
 *       above-100 rows silently inert — the A.7 probe's verdict). Resilience
 *       damps both directions symmetrically (the ruled "resilience/origin
 *       semantics carry").
 *
 * Composition clamps live at the CONSUMERS' ends (never per cell): drag/faster/
 * safer multipliers never exceed 1 and capability delay never goes negative —
 * the believed trajectory is a CEILING (the program's constitutional semantics);
 * surplus relieves shortage but never accelerates beyond belief.
 */
export function computeInputConstraint(
  key: SupplyInputKey,
  value: number,
  resilience: number,
): number {
  if (SUPPLY_INPUT_KIND[key] === 'price') {
    return value > 100 ? Math.max(0, 1 - 100 / value) * (1 - resilience) : 0;
  }
  return (1 - value / 100) * (1 - resilience);
}

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
    frontierDrainScale: DEFAULT_FRONTIER_DRAIN_SCALE,
    frontierRebuildYears: DEFAULT_FRONTIER_REBUILD_YEARS,
    frontierRateElasticity: DEFAULT_FRONTIER_RATE_ELASTICITY,
    frontierInnovationElasticity: DEFAULT_FRONTIER_INNOVATION_ELASTICITY,
    resilienceOnsetYears: DEFAULT_RESILIENCE_ONSET_YEARS,
  };
}

/**
 * The parameter-row keys the engine consumes ONLY inside its supply-chain block
 * (simulation.ts gates that block on config.supplyChainConfig). A per-year layer entry
 * (an event's shock, a user's per-year override) on any of these keys DEMANDS the
 * subsystem: when the block is dormant (undefined at defaults), the engine materializes
 * the full default config — the same rule an Advanced-grid write under the absent
 * parent applies (R3C-F2) — so the shocked row is actually consumed. Wiring audit
 * 2026-08-01: without this, every sidebar event's supply-chain shock resolved into
 * yearParams and moved nothing (the cited-dead/uncited-live genus, fifth sighting).
 */
export const SUPPLY_CHAIN_PARAM_KEYS: ReadonlySet<string> = new Set([
  // Supply inputs
  'supplyChainAiChips', 'supplyChainChipPrice', 'supplyChainEnergyPrice',
  'supplyChainEnergyCapacity', 'supplyChainTrainingDC', 'supplyChainInferenceDC',
  'supplyChainRoboticsHW', 'supplyChainSoftwareEfficiency',
  // Resilience
  'resilienceAiChips', 'resilienceEnergy', 'resilienceTrainingDC',
  'resilienceInferenceDC', 'resilienceRoboticsHW',
  // Training dynamics
  'trainingChipsTechDecline', 'trainingEnergyTechDecline', 'trainingDCTechDecline',
  'trainingChipsScalePressure', 'trainingEnergyScalePressure', 'trainingDCScalePressure',
  // Regulatory + economics
  'regulatoryFriction', 'costPassThroughRate', 'consumerPassThroughRate',
  'costVsProcurementBlend',
]);

// ============================================================
// 2. computeAutopilotResilience
// ============================================================

/**
 * Time-evolved resilience values.
 * Onshoring fraction boosts aiChips resilience faster (CHIPS Act effect).
 * All values capped at MAX_RESILIENCE / MAX_RESILIENCE_DC.
 *
 * THE regulatoryFriction CONSUMER (the supply-chain shock ruling, Finding 3): the
 * DATACENTER rows (trainingDC, inferenceDC) advance by EFFECTIVE permitting time when
 * the caller supplies it — dcEffectiveYears = Σ 1/friction(τ) over elapsed years,
 * accumulated in the simulation loop from the per-year RESOLVED friction. Permitting
 * delay is a rate effect on capacity additions: at friction f, additions that took one
 * year take f. At friction ≡ 1 the sum is the exact float t, so the expression is
 * arithmetic-identical to the calendar form (the bit-identity guarantee). Absent
 * (unit fixtures, the non-loop fallback), calendar time is used as before. The chip,
 * energy, and robotics rows are not permitting-gated by this dial.
 */
export function computeAutopilotResilience(
  year: number,
  baseResilience: SupplyChainResilience,
  onshoringFraction: number,
  dcEffectiveYears?: number,
): SupplyChainResilience {
  const t = year - DEFAULT_START_YEAR;
  const dcT = dcEffectiveYears ?? t;
  const clampRes = (base: number, rate: number, cap: number): number =>
    Math.min(cap, base + rate * t);
  const clampResDC = (base: number, rate: number, cap: number): number =>
    Math.min(cap, base + rate * dcT);

  // Onshoring fraction accelerates AI chip resilience improvement
  const chipRate = RESILIENCE_IMPROVEMENT_RATES.aiChips * (1 + onshoringFraction);

  return {
    aiChips: clampRes(baseResilience.aiChips, chipRate, MAX_RESILIENCE),
    energy: clampRes(baseResilience.energy, RESILIENCE_IMPROVEMENT_RATES.energy, MAX_RESILIENCE_DC),
    trainingDC: clampResDC(baseResilience.trainingDC, RESILIENCE_IMPROVEMENT_RATES.trainingDC, MAX_RESILIENCE_DC),
    inferenceDC: clampResDC(baseResilience.inferenceDC, RESILIENCE_IMPROVEMENT_RATES.inferenceDC, MAX_RESILIENCE_DC),
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
  ['chipPrice', 'chipPrice'], // C-3: price shocks lag like energyPrice
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
  // Using "better" dimension lags for training channel.
  // MS1 (Stage 4): quantity constraints are SIGNED (surplus relieves) via the one
  // constraint producer; the composed training constraint clamps at ≥ 0 below.
  const chipConstraint = computeInputConstraint('aiChips', laggedInputs.aiChips.better, resilience.aiChips);
  const dcConstraint = computeInputConstraint('trainingDCCapacity', laggedInputs.trainingDCCapacity.better, resilience.trainingDC);

  // Energy: WORSE of capacity constraint and price constraint when a price spike
  // is live; the signed capacity constraint passes through when no spike (a
  // capacity surplus relieves — MS1). The 0.5 down-weight on the price leg is
  // this function's standing composition (price makes some runs uneconomical,
  // a partial constraint vs a hard capacity shortfall).
  const energyCapConstraint = computeInputConstraint('energyCapacity', laggedInputs.energyCapacity.better, resilience.energy);
  const energyPriceConstraint = computeInputConstraint('energyPrice', laggedInputs.energyPrice.better, resilience.energy) * 0.5;
  const energyConstraint = energyPriceConstraint > 0
    ? Math.max(energyCapConstraint, energyPriceConstraint)
    : energyCapConstraint;

  // Training constraint weighted by DYNAMIC composition; clamped at ≥ 0 — the
  // believed trajectory is a CEILING: surplus capacity offsets shortage in the
  // weighted budget composition but never advances capability beyond belief.
  const trainingConstraint = Math.max(0,
    dynamicComposition.aiChips * chipConstraint +
    dynamicComposition.energy * energyConstraint +
    dynamicComposition.datacenter * dcConstraint);

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
// 6b. The frontier stock (the endogenous-frontier program, MS1)
// ============================================================

/** The frontier-stock dials resolved from config (absent fields ⇒ the constants). */
export interface FrontierStockDials {
  drainScale: number;
  rebuildYears: number;
  rateElasticity: number;
  innovationElasticity: number;
}

export function resolveFrontierStockDials(config?: SupplyChainConfig): FrontierStockDials {
  // Flywheel MS: config optional — the stock is ALWAYS-ON (loop-hosted); on SC-dormant
  // paths the dials resolve to the constants (identical values, one source).
  return {
    drainScale: config?.frontierDrainScale ?? DEFAULT_FRONTIER_DRAIN_SCALE,
    rebuildYears: config?.frontierRebuildYears ?? DEFAULT_FRONTIER_REBUILD_YEARS,
    rateElasticity: config?.frontierRateElasticity ?? DEFAULT_FRONTIER_RATE_ELASTICITY,
    innovationElasticity: config?.frontierInnovationElasticity ?? DEFAULT_FRONTIER_INNOVATION_ELASTICITY,
  };
}

/**
 * One year of frontier-stock dynamics (the ratified checkpoint §2.2, order normative):
 *
 *   u        = clamp(1 − annualDelay, 0, 1)          — the year's training throughput
 *   drained  = S_prev × max(0, 1 − (1−u)·κ_G·drainScale),  κ_G = (G−1)/G
 *   S        = drained + (1/rebuildYears)·max(0, u − drained)
 *   rate     = S^rateElasticity                       — the capability-clock speed
 *   m_inn    = S^innovationElasticity                 — the innovation-channel multiplier
 *
 * The drain law is DERIVED from the cited growth dial G (capacity tracks demand on the
 * default path; a starved year builds only fraction u of the planned increment); the
 * right-hand algebraic form `1 − (1−u)·κ` is normative — at u = 1 it is exactly 1.0 in
 * IEEE arithmetic for any float G, so an unshocked year is bit-exactly inert
 * (S = S_prev × 1; rebuild adds λ·max(0, 0); pow(1, y) = 1). Since u ≤ 1 and rebuild
 * targets u, S stays in (0, 1]; hence rate ≤ 1 and the cumulative delay the caller
 * accumulates as (1 − rate) is monotone — the clock never runs backward, and every
 * finite famine heals toward the SAME exogenous ceiling (rate → 1 as S → 1).
 */
export function computeFrontierStockUpdate(
  prevStock: number,
  annualDelay: number,
  trainingScaleGrowthRate: number,
  dials: FrontierStockDials,
): { stock: number; rate: number; delayIncrement: number; innovationMultiplier: number } {
  const u = Math.min(1, Math.max(0, 1 - annualDelay));
  const kappaG = (trainingScaleGrowthRate - 1) / trainingScaleGrowthRate;
  const drainFactor = Math.max(0, 1 - (1 - u) * kappaG * dials.drainScale);
  const drained = prevStock * drainFactor;
  const rebuildRate = dials.rebuildYears > 0 ? 1 / dials.rebuildYears : 1;
  const stock = drained + rebuildRate * Math.max(0, u - drained);
  const rate = Math.pow(stock, dials.rateElasticity);
  return {
    stock,
    rate,
    delayIncrement: 1 - rate,
    innovationMultiplier: Math.pow(stock, dials.innovationElasticity),
  };
}

/**
 * DELIVERED resilience (the ruled onset re-anchor): the resolved resilience series
 * evaluated `onsetYears` back — the capacity that damps this year's constraint is what
 * was ordered onsetYears ago, not what today's as-built trajectory shows. Fractional
 * onsets interpolate componentwise between the bracketing entries; lookups before the
 * series start clamp to the first entry (the seam's resolved values). The display rows
 * are NEVER shifted — this feeds the training-channel damping only.
 *
 * `history` is the per-year RESOLVED resilience in year order, INCLUDING the current
 * year as its last entry; onset 0 therefore returns the current entry exactly (the
 * prior no-dead-time behavior, bit-identical).
 */
export function lookupDeliveredResilience(
  history: readonly SupplyChainResilience[],
  onsetYears: number,
): SupplyChainResilience {
  const last = history.length - 1;
  const target = last - Math.max(0, onsetYears);
  const lo = Math.max(0, Math.floor(target));
  const hi = Math.max(0, Math.ceil(target));
  const loEntry = history[lo] ?? history[0]!;
  const hiEntry = history[hi] ?? history[0]!;
  if (lo === hi || target <= 0) {
    return target <= 0 ? { ...history[0]! } : { ...loEntry };
  }
  const frac = target - lo;
  const mix = (a: number, b: number): number => a + frac * (b - a);
  return {
    aiChips: mix(loEntry.aiChips, hiEntry.aiChips),
    energy: mix(loEntry.energy, hiEntry.energy),
    trainingDC: mix(loEntry.trainingDC, hiEntry.trainingDC),
    inferenceDC: mix(loEntry.inferenceDC, hiEntry.inferenceDC),
    roboticsHardware: mix(loEntry.roboticsHardware, hiEntry.roboticsHardware),
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
  // MS1 (Stage 4): a surplus year offsets deficit years WITHIN the window (more
  // chips flow down the cascade), signed per year; the window total floors at 0
  // (a surplus never puts the inference fleet AHEAD of the cascade). Diagnostic
  // path only (cascadeDeclineRateDiagnostic).
  let sumDeficit = 0;
  let count = 0;
  for (let i = startIdx; i < chipSupplyHistory.length; i++) {
    sumDeficit += 1 - (chipSupplyHistory[i] ?? 100) / 100;
    count++;
  }
  if (count === 0) return 0;
  return Math.max(0, sumDeficit) / windowYears;
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
  // MS1 (Stage 4): quantity constraints SIGNED via the one producer — a surplus
  // (row > 100) lowers the scarcity-pricing term below baseline (glut pricing,
  // the 2015-class GPU-surplus direction); the 0.1 floor below stands.
  // AI Chips scarcity → compute (primary driver)
  const chipConstraint = computeInputConstraint('aiChips', effectiveInputs.aiChips, resilience.aiChips);
  // Inference DC scarcity → compute (scarcity pricing)
  const infDCConstraint = computeInputConstraint('inferenceDCCapacity', effectiveInputs.inferenceDCCapacity, resilience.inferenceDC);
  // Software efficiency → compute (divisor, reduces effective constraint)
  const softwareOffset = softwareEfficiency / 100; // 150 → 1.5
  // Mini-stage 2 (C-3): the chip PRICE channel multiplies compute directly (the
  // energyPrice template) — price and quantity compose; the quantity channel's ×1.95
  // scarcity ceiling no longer caps price shocks. `?? 100` guards legacy configs
  // predating the field (validateConfig heals persisted ones).
  const chipPriceMultiplier = (effectiveInputs.chipPrice ?? 100) / 100;
  // THE COMPLEMENTARITY RIDER (owner-ruled): chips and inference datacenters are
  // hard complements for compute — the scarcity term binds at the WORST input's own
  // constraint (Leontief), never a diluted blend. An inference-DC shortage now binds
  // at 1.0× its severity (was 0.5×); a chips-only shortage is unchanged (max(c,0)=c).
  // DEPRECATED (the pre-rider additive blend, kept per the no-delete rule):
  //   const computeMultiplier = (1.0 + (chipConstraint + infDCConstraint * 0.5) / softwareOffset) * chipPriceMultiplier;
  const computeMultiplier = (1.0 + Math.max(chipConstraint, infDCConstraint) / softwareOffset) * chipPriceMultiplier;

  // Energy price → energy (direct pass-through)
  const energyMultiplier = effectiveInputs.energyPrice / 100;

  // Robotics HW → physical hardware (signed — MS1)
  const roboticsConstraint = computeInputConstraint('roboticsHardware', effectiveInputs.roboticsHardware, resilience.roboticsHardware);
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
    chipPrice: resilience.aiChips, // C-3: chip-price exposure shares the chip-supply resilience
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
    // MS1 (Stage 4): kind-aware signed constraint via the one producer.
    const constraint = computeInputConstraint(key, laggedValue, resMap[key]);
    totalDrag += sensitivity * constraint;
  }

  // Software efficiency partially offsets faster drag
  const softwareOffset = softwareEfficiency / 100;
  // MS1: composed drag clamps at ≥ 0 — surplus relieves shortage but never
  // pushes the improvement rate above the believed baseline (ceilings semantics).
  totalDrag = Math.max(0, totalDrag) / softwareOffset;

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
    chipPrice: resilience.aiChips, // C-3: chip-price exposure shares the chip-supply resilience
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
    // MS1 (Stage 4): kind-aware signed constraint via the one producer.
    const constraint = computeInputConstraint(key, laggedValue, resMap[key]);
    totalDrag += sensitivity * constraint;
  }

  // MS1: composed drag clamps at ≥ 0 (ceilings semantics — see computeFasterMultiplier).
  return Math.max(0, 1 - Math.max(0, totalDrag));
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
    chipPrice: resilience.aiChips, // C-3: chip-price exposure shares the chip-supply resilience
    energyPrice: resilience.energy,
    energyCapacity: resilience.energy,
    trainingDCCapacity: resilience.trainingDC,
    inferenceDCCapacity: resilience.inferenceDC,
    roboticsHardware: resilience.roboticsHardware,
  };

  // THE COMPLEMENTARITY RIDER (owner-ruled): hard-complement inputs (chips, energy,
  // datacenters — SUPPLY_INPUT_CLASS) bind at their OWN severity: the worst hard cell's
  // sensitivity × constraint is a FLOOR under the averaged aggregation, so a hard
  // shortage is never diluted by healthy peers. Soft inputs (logistics-class) remain
  // averaged exactly as before: with no hard cell binding, max(0, avg) = avg — the
  // pre-rider value bit-exactly (the rider's identity battery).
  //
  // MS1 (Stage 4, the ruled root fix): the per-cell constraint comes from the ONE
  // kind-aware producer — price rows drag when ABOVE 100 and relieve nothing below
  // (the retired shortage-form treatment INVERTED price semantics: cheap energy at
  // 70 dragged 0.966, a 130 spike dragged zero — both Stage-0-measured); quantity
  // rows are SIGNED (surplus relieves the averaged channel). The hardBind floor
  // (init 0) keeps a hard shortage undiluted by surplus elsewhere, and because
  // binding = max(hardBind ≥ 0, avg), the composed constraint is automatically
  // ≥ 0 — surplus can never push the drag multiplier above 1 (ceilings semantics).
  // The retired per-cell form, kept per the no-delete rule:
  //   const constraint = Math.max(0, 1 - laggedValue / 100) * (1 - resMap[key]);
  let hardBind = 0;
  for (const key of Object.keys(matrix) as SupplyInputKey[]) {
    for (const dim of ['better', 'faster', 'cheaper', 'safer'] as BFCSDimension[]) {
      const sensitivity = matrix[key][dim];
      if (sensitivity === 0) continue;
      const laggedValue = laggedInputs[key][dim];
      const constraint = computeInputConstraint(key, laggedValue, resMap[key]);
      totalConstraint += sensitivity * constraint;
      count++;
      if (SUPPLY_INPUT_CLASS[key] === 'hard-complement') {
        hardBind = Math.max(hardBind, sensitivity * constraint);
      }
    }
  }

  const avgConstraint = count > 0 ? totalConstraint / count : 0;
  const bindingConstraint = Math.max(hardBind, avgConstraint);
  // Pass-through modulates how much deployment cost affects adoption
  const effectiveConstraint = bindingConstraint * (0.5 + 0.5 * passThrough);

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
  // Mini-stage 2 (path unification): the band runs on the DEFAULT path too — the config is
  // optional; the maxima fall back to the ruled default dials when no SC config exists.
  config?: Pick<SupplyChainConfig, 'hysteresisMaxCognitive' | 'hysteresisMaxEmbodied'>,
): number {
  const isCognitive = deploymentType === 'software' || deploymentType === 'hybrid';
  const base = isCognitive ? HYSTERESIS_BASE_COGNITIVE : HYSTERESIS_BASE_EMBODIED;
  const max = isCognitive
    ? (config?.hysteresisMaxCognitive ?? DEFAULT_HYSTERESIS_MAX_COGNITIVE)
    : (config?.hysteresisMaxEmbodied ?? DEFAULT_HYSTERESIS_MAX_EMBODIED);
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
 * RETIRED (the coupled design checkpoint, mini-stage 2; Amendment 2 — no legacy toggles):
 * the SC-scenario stateful machine is superseded by computeUnifiedAdoptionState
 * (adoption.ts) — ONE machine on the ONE rich growth curve (getAdoptionRate, raw), with the
 * cost-triggered exit evaluated against the REHIRE basis and throttled by the pool's fill
 * capacity (Amendment 1), replacing this machine's score-regression-only trigger, its
 * simple-logistic + ratchet growth, and its instant-symmetric labor consequence. No live
 * callers (the one-assembly-genus probe pattern applies); kept per the no-delete rule as
 * the deprecated record. Which-change pole: the recorded commit-A episode run
 * (~/.atlas-referents/ms2/instant-rehire-pole.json).
 *
 * Original spec:
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
  /** Mini-stage 2 (C-1): the per-year RESOLVED resilience (autopilot-evolved, user-
   *  overridable via the sidebar rows). When provided, step 1 consumes it directly —
   *  record/display and execution read the same resolved series (battery B2-3). Absent
   *  (unit fixtures), the block evolves from config.resilience as before. */
  resolvedResilience?: SupplyChainResilience;
  /** MS1 (the frontier stock): previous year's stock. Absent (unit fixtures) ⇒ 1
   *  (on-path). The loop threads it like prevCumulativeDelay. */
  prevFrontierStock?: number;
  /** MS1 (the ruled onset re-anchor): the DELIVERED resilience for the TRAINING
   *  channel — the resolved series onsetYears back, computed by the loop from its
   *  resilience history. Absent (unit fixtures) ⇒ the effective resilience (the prior
   *  no-dead-time behavior). Deployment/cost legs always use the effective series. */
  deliveredResilience?: SupplyChainResilience;
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

  // 1. Compute effective resilience (C-1: the resolved per-year series when supplied)
  const effectiveResilience = inputs.resolvedResilience
    ?? computeAutopilotResilience(year, config.resilience, onshoringFraction);

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

  // 5. Capability delays — MS1: the TRAINING channel damps by DELIVERED resilience
  // (the ruled onset dead time; absent in unit fixtures ⇒ effective, the prior
  // behavior). FLYWHEEL MS (the hoist): the frontier-stock update and the cumulative
  // accumulation MOVED to the simulation loop — the stock is always-on and its
  // demand-side input (the funding gate) reads macro state this block cannot see.
  // This function's output is the year's SUPPLY-side annual delay; the loop composes
  // u = min(u_supply, u_demand) and calls computeFrontierStockUpdate itself.
  const annualDelay = computeCapabilityDelay(
    laggedInputs, inputs.deliveredResilience ?? effectiveResilience,
    dynamicTrainingComposition, config.inputs.softwareEfficiency,
  );
  // DEPRECATED (the hoist) — the retired in-block update, kept per the no-delete rule:
  //   const frontier = computeFrontierStockUpdate(
  //     inputs.prevFrontierStock ?? 1, annualDelay.generative,
  //     config.trainingScaleGrowthRate, resolveFrontierStockDials(config));
  //   const cumulativeCapabilityDelay = { generative/agentic/embodied:
  //     prevCumulativeDelay.* + frontier.delayIncrement };
  void prevCumulativeDelay; // reason: params retained for signature stability (deprecated inputs; the loop owns the state)

  // 6. Cascade backlog & the DIAGNOSTIC decline rate (ruling 4's loudness: renamed from
  // effectiveComputeDeclineRate — not consumed by any economic path, proven by
  // strict-equality execution; the realized cost trend lives on the τ clock).
  const cascadeBacklog = computeCascadeBacklog(chipSupplyHistory, config.chipCascadeLag);
  const cascadeDeclineRateDiagnostic = computeEffectiveComputeDecline(
    baseComputeDeclineRate, cascadeBacklog, config.chipCascadeCostPremium,
  );

  // 7. Deployment cost multipliers
  // Mini-stage 2 (C-7): cost multipliers read the LAGGED inputs — aligned with
  // faster/safer/drag (the audit's internal timing inconsistency resolved; a shock's
  // cost incidence phases in with the propagation lags instead of instantly). The
  // CHEAPER-dimension lagged view is flattened back to the inputs shape; software
  // efficiency is unlagged by design (INPUT_TO_KEY maps it to null).
  const cheaperLaggedInputs: SupplyChainInputs = {
    aiChips: laggedInputs.aiChips.cheaper,
    chipPrice: laggedInputs.chipPrice.cheaper,
    energyPrice: laggedInputs.energyPrice.cheaper,
    energyCapacity: laggedInputs.energyCapacity.cheaper,
    trainingDCCapacity: laggedInputs.trainingDCCapacity.cheaper,
    inferenceDCCapacity: laggedInputs.inferenceDCCapacity.cheaper,
    roboticsHardware: laggedInputs.roboticsHardware.cheaper,
    softwareEfficiency: config.inputs.softwareEfficiency,
  };
  const deploymentCostMultipliers = computeDeploymentCostMultipliers(
    cheaperLaggedInputs, effectiveResilience, config.inputs.softwareEfficiency,
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
    // cumulativeCapabilityDelay / frontierStock / frontierRate / innovationStockMultiplier:
    // DEPRECATED, no longer populated — the loop produces them (the hoist; one producer).
    dynamicTrainingComposition,
    deploymentCostMultipliers,
    bfcsCostMultipliers,
    cascadeDeclineRateDiagnostic,
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
