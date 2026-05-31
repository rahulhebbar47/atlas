/**
 * ATLAS Phase 9: Supply Chain Uncertainty Tests
 *
 * Covers:
 * 1. No-op invariant (all defaults = zero effect)
 * 2. Dynamic training composition evolution
 * 3. Capability delay computation
 * 4. Cascade backlog + effective compute decline
 * 5. Deployment cost multipliers
 * 6. Pass-through mechanics
 * 7. Faster/Safer multipliers
 * 8. Hysteresis width
 * 9. Stateful adoption (freeze/decline/resume)
 * 10. Lab profit adjustment + cost push
 * 11. Resilience evolution
 * 12. Propagation lags
 * 13. Sensitivity blend
 * 14. Full simulation no-op invariant
 */

import { describe, it, expect } from 'vitest';
import {
  getDefaultSupplyChainConfig,
  computeAutopilotResilience,
  interpolatePassThrough,
  applyPropagationLags,
  computeDynamicTrainingComposition,
  computeCapabilityDelay,
  computeCascadeBacklog,
  computeEffectiveComputeDecline,
  computeDeploymentCostMultipliers,
  applyPassThrough,
  computeFasterMultiplier,
  computeSaferMultiplier,
  computeAdoptionDrag,
  computeHysteresisWidth,
  computeStatefulAdoptionRate,
  computeLabProfitAdjustment,
  computeSupplyChainCostPush,
  computeSensitivityBlend,
  computeSupplyChainEffects,
} from '@/models/supplyChain';
import {
  DEFAULT_SUPPLY_CHAIN_INPUTS,
  DEFAULT_RESILIENCE,
  DEFAULT_INFERENCE_ANNUAL_CHANGE,
} from '@/models/constants';
import { runSimulation, getDefaultSimulationConfig } from '@/models/simulation';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import type { SupplyChainInputs, SupplyChainResilience } from '@/types';

// Small cluster subset for simulation tests (same as simulation.test.ts)
const SMALL_CLUSTER_SUBSET = OCCUPATION_CLUSTERS.slice(0, 3);

// ============================================================
// Helper: default inputs at 100 (no constraint)
// ============================================================
const DEFAULT_INPUTS: SupplyChainInputs = { ...DEFAULT_SUPPLY_CHAIN_INPUTS };

// Default shock history: two prior years at 100 (no shocks)
const NO_SHOCK_HISTORY: [SupplyChainInputs, SupplyChainInputs] = [
  { ...DEFAULT_INPUTS },
  { ...DEFAULT_INPUTS },
];

// Default lagged inputs (all inputs at 100, all dimensions at 100)
function defaultLaggedInputs() {
  return applyPropagationLags(DEFAULT_INPUTS, DEFAULT_INPUTS, DEFAULT_INPUTS);
}

// ============================================================
// 1. No-Op Invariant
// ============================================================
describe('Supply Chain No-Op Invariant', () => {
  it('getDefaultSupplyChainConfig returns valid config', () => {
    const config = getDefaultSupplyChainConfig();
    expect(config.inputs.aiChips).toBe(100);
    expect(config.inputs.energyPrice).toBe(100);
    expect(config.resilience.aiChips).toBe(0.05);
    expect(config.resilience.energy).toBe(0.85);
    expect(config.trainingComposition.aiChips + config.trainingComposition.energy + config.trainingComposition.datacenter).toBeCloseTo(1.0);
    expect(config.chipCascadeLag).toBe(2.5);
    expect(config.costPassThroughRate).toBe(0);
    expect(config.consumerPassThroughRate).toBe(0.50);
    expect(config.hysteresisMaxCognitive).toBe(0.25);
    expect(config.hysteresisMaxEmbodied).toBe(0.35);
  });

  it('all defaults produce zero deployment cost multipliers', () => {
    const mult = computeDeploymentCostMultipliers(DEFAULT_INPUTS, DEFAULT_RESILIENCE, 100);
    expect(mult.compute).toBeCloseTo(1.0);
    expect(mult.physicalHardware).toBeCloseTo(1.0);
    expect(mult.energy).toBeCloseTo(1.0);
  });

  it('all defaults produce zero capability delay', () => {
    const lagged = defaultLaggedInputs();
    const delay = computeCapabilityDelay(lagged, DEFAULT_RESILIENCE, { aiChips: 0.55, energy: 0.25, datacenter: 0.20 }, 100);
    expect(delay.generative).toBeCloseTo(0);
    expect(delay.agentic).toBeCloseTo(0);
    expect(delay.embodied).toBeCloseTo(0);
  });

  it('pass-through at 0% produces unit multipliers', () => {
    const result = applyPassThrough({ compute: 1.5, physicalHardware: 1.3, energy: 2.0 }, 0);
    expect(result.inference).toBeCloseTo(1.0);
    expect(result.manufacturing).toBeCloseTo(1.0);
    expect(result.energy).toBeCloseTo(1.0);
  });

  it('simulation with SC defaults produces zero SC effects in MacroOutput', () => {
    const config = { ...getDefaultSimulationConfig(), supplyChainConfig: getDefaultSupplyChainConfig() };
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);

    expect(timeline.years.length).toBeGreaterThan(0);

    // SC effects should be zero/no-op for all years
    for (const year of timeline.years) {
      expect(year.macro.cumulativeDelayGenerative).toBeCloseTo(0);
      expect(year.macro.cumulativeDelayAgentic).toBeCloseTo(0);
      expect(year.macro.cumulativeDelayEmbodied).toBeCloseTo(0);
      expect(year.macro.supplyChainCostPush).toBeCloseTo(0);
      expect(year.macro.deploymentMultiplierCompute).toBeCloseTo(1.0);
      expect(year.macro.deploymentMultiplierPhysical).toBeCloseTo(1.0);
      expect(year.macro.deploymentMultiplierEnergy).toBeCloseTo(1.0);
      expect(year.macro.cascadeBacklog).toBeCloseTo(0);
    }
  });

  it('simulation without SC config still runs correctly', () => {
    const config = getDefaultSimulationConfig();
    expect(config.supplyChainConfig).toBeUndefined();
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);
    expect(timeline.years.length).toBeGreaterThan(0);
    // SC diagnostic fields should be zeroed
    for (const year of timeline.years) {
      expect(year.macro.cumulativeDelayGenerative).toBe(0);
      expect(year.macro.supplyChainCostPush).toBe(0);
    }
  });
});

// ============================================================
// 2. Dynamic Training Composition
// ============================================================
describe('Dynamic Training Composition', () => {
  const config = getDefaultSupplyChainConfig();

  it('sums to 1.0 at year 0', () => {
    const comp = computeDynamicTrainingComposition(2025, config);
    expect(comp.aiChips + comp.energy + comp.datacenter).toBeCloseTo(1.0);
    // At t=0 with blend=0.50: chips = 0.5*0.55 + 0.5*0.45 = 0.50
    //                         energy = 0.5*0.25 + 0.5*0.35 = 0.30
    //                         dc     = 0.5*0.20 + 0.5*0.20 = 0.20
    expect(comp.aiChips).toBeCloseTo(0.50, 2);
    expect(comp.energy).toBeCloseTo(0.30, 2);
    expect(comp.datacenter).toBeCloseTo(0.20, 2);
  });

  it('sums to 1.0 at year 10', () => {
    const comp = computeDynamicTrainingComposition(2035, config);
    expect(comp.aiChips + comp.energy + comp.datacenter).toBeCloseTo(1.0);
  });

  it('chips share falls, energy and DC rise over time', () => {
    const early = computeDynamicTrainingComposition(2025, config);
    const late = computeDynamicTrainingComposition(2035, config);
    expect(late.aiChips).toBeLessThan(early.aiChips);
    expect(late.energy).toBeGreaterThan(early.energy);
    expect(late.datacenter).toBeGreaterThan(early.datacenter);
  });

  it('year 10: chips stays visible due to procurement blend', () => {
    // With blend=0.50: chips ≈ 0.5*0.004 + 0.5*0.45 ≈ 0.227 (23%)
    // Without blend (pure cost): chips would be ~0.4% — invisible
    // Procurement share keeps chips relevant even as per-unit cost plummets
    const comp = computeDynamicTrainingComposition(2035, config);
    expect(comp.aiChips).toBeGreaterThan(0.15); // ~22.7% (procurement floor)
    expect(comp.aiChips).toBeLessThan(0.35);     // but lower than initial 50%
    expect(comp.energy).toBeGreaterThan(0.25);    // ~36.6%
    expect(comp.datacenter).toBeGreaterThan(0.25); // ~40.7%
    expect(comp.aiChips + comp.energy + comp.datacenter).toBeCloseTo(1.0);
  });
});

// ============================================================
// 3. Capability Delay
// ============================================================
describe('Capability Delay', () => {
  it('chip shortage at 50 creates positive delay', () => {
    const shockedInputs = { ...DEFAULT_INPUTS, aiChips: 50 };
    const lagged = applyPropagationLags(shockedInputs, shockedInputs, shockedInputs);
    const delay = computeCapabilityDelay(lagged, DEFAULT_RESILIENCE, { aiChips: 0.55, energy: 0.25, datacenter: 0.20 }, 100);
    // All three vectors should be delayed (training constraint)
    expect(delay.generative).toBeGreaterThan(0);
    expect(delay.agentic).toBeGreaterThan(0);
    expect(delay.embodied).toBeGreaterThan(0);
  });

  it('software efficiency at 200 halves delay', () => {
    const shockedInputs = { ...DEFAULT_INPUTS, aiChips: 50 };
    const lagged = applyPropagationLags(shockedInputs, shockedInputs, shockedInputs);
    const delay100 = computeCapabilityDelay(lagged, DEFAULT_RESILIENCE, { aiChips: 0.55, energy: 0.25, datacenter: 0.20 }, 100);
    const delay200 = computeCapabilityDelay(lagged, DEFAULT_RESILIENCE, { aiChips: 0.55, energy: 0.25, datacenter: 0.20 }, 200);
    // At 200% software efficiency, delay should be halved
    expect(delay200.generative).toBeCloseTo(delay100.generative * 0.5, 4);
  });

  it('high resilience reduces delay', () => {
    const shockedInputs = { ...DEFAULT_INPUTS, aiChips: 50 };
    const lagged = applyPropagationLags(shockedInputs, shockedInputs, shockedInputs);
    const lowRes: SupplyChainResilience = { ...DEFAULT_RESILIENCE, aiChips: 0.05 };
    const highRes: SupplyChainResilience = { ...DEFAULT_RESILIENCE, aiChips: 0.50 };
    const delayLow = computeCapabilityDelay(lagged, lowRes, { aiChips: 0.55, energy: 0.25, datacenter: 0.20 }, 100);
    const delayHigh = computeCapabilityDelay(lagged, highRes, { aiChips: 0.55, energy: 0.25, datacenter: 0.20 }, 100);
    expect(delayHigh.generative).toBeLessThan(delayLow.generative);
  });
});

// ============================================================
// 4. Cascade Backlog + Effective Compute Decline
// ============================================================
describe('Cascade Backlog', () => {
  it('returns 0 with no chip shortages', () => {
    const history = [100, 100, 100];
    expect(computeCascadeBacklog(history, 2.5)).toBe(0);
  });

  it('returns positive backlog with chip shortage', () => {
    const history = [50, 50, 100]; // shortage in first two years
    const backlog = computeCascadeBacklog(history, 2.5);
    expect(backlog).toBeGreaterThan(0);
  });

  it('empty history returns 0', () => {
    expect(computeCascadeBacklog([], 2.5)).toBe(0);
  });
});

describe('Effective Compute Decline', () => {
  it('no backlog returns baseline decline', () => {
    const result = computeEffectiveComputeDecline(-0.45, 0, 0.30);
    expect(result).toBe(-0.45);
  });

  it('max backlog slows decline rate', () => {
    const result = computeEffectiveComputeDecline(-0.45, 1.0, 0.30);
    // At max backlog with 0.30 premium: -0.45 * 0.70 = -0.315
    expect(result).toBeCloseTo(-0.315, 4);
  });

  it('partial backlog partially slows decline', () => {
    const result = computeEffectiveComputeDecline(-0.45, 0.5, 0.30);
    expect(result).toBeGreaterThan(-0.45);
    expect(result).toBeLessThan(-0.315);
  });
});

// ============================================================
// 5. Deployment Cost Multipliers
// ============================================================
describe('Deployment Cost Multipliers', () => {
  it('chip shortage increases compute multiplier', () => {
    const inputs = { ...DEFAULT_INPUTS, aiChips: 50 };
    const mult = computeDeploymentCostMultipliers(inputs, DEFAULT_RESILIENCE, 100);
    expect(mult.compute).toBeGreaterThan(1.0);
    expect(mult.physicalHardware).toBeCloseTo(1.0); // robotics not affected
    expect(mult.energy).toBeCloseTo(1.0); // energy price at 100
  });

  it('energy price increase raises energy multiplier', () => {
    const inputs = { ...DEFAULT_INPUTS, energyPrice: 200 };
    const mult = computeDeploymentCostMultipliers(inputs, DEFAULT_RESILIENCE, 100);
    expect(mult.energy).toBeCloseTo(2.0);
    expect(mult.compute).toBeCloseTo(1.0); // chips not affected
  });

  it('robotics shortage increases physical HW multiplier', () => {
    const inputs = { ...DEFAULT_INPUTS, roboticsHardware: 50 };
    const mult = computeDeploymentCostMultipliers(inputs, DEFAULT_RESILIENCE, 100);
    expect(mult.physicalHardware).toBeGreaterThan(1.0);
  });

  it('software efficiency offsets compute constraint', () => {
    const inputs = { ...DEFAULT_INPUTS, aiChips: 50 };
    const mult100 = computeDeploymentCostMultipliers(inputs, DEFAULT_RESILIENCE, 100);
    const mult200 = computeDeploymentCostMultipliers(inputs, DEFAULT_RESILIENCE, 200);
    expect(mult200.compute).toBeLessThan(mult100.compute);
  });
});

// ============================================================
// 6. Pass-Through
// ============================================================
describe('Pass-Through', () => {
  it('0% pass-through = unit multipliers', () => {
    const raw = { compute: 2.0, physicalHardware: 1.5, energy: 3.0 };
    const result = applyPassThrough(raw, 0);
    expect(result.inference).toBeCloseTo(1.0);
    expect(result.manufacturing).toBeCloseTo(1.0);
    expect(result.energy).toBeCloseTo(1.0);
  });

  it('100% pass-through = full multipliers (field name mapped)', () => {
    const raw = { compute: 2.0, physicalHardware: 1.5, energy: 3.0 };
    const result = applyPassThrough(raw, 1.0);
    expect(result.inference).toBeCloseTo(2.0);
    expect(result.manufacturing).toBeCloseTo(1.5);
    expect(result.energy).toBeCloseTo(3.0);
  });

  it('50% pass-through = halfway', () => {
    const raw = { compute: 2.0, physicalHardware: 1.0, energy: 1.0 };
    const result = applyPassThrough(raw, 0.5);
    expect(result.inference).toBeCloseTo(1.5);
  });

  it('interpolatePassThrough returns 0 at 2025', () => {
    expect(interpolatePassThrough(2025)).toBeCloseTo(0);
  });

  it('interpolatePassThrough returns 0.30 at 2035', () => {
    expect(interpolatePassThrough(2035)).toBeCloseTo(0.30);
  });

  it('interpolatePassThrough returns 0.75 at 2045', () => {
    expect(interpolatePassThrough(2045)).toBeCloseTo(0.75);
  });

  it('interpolatePassThrough interpolates between anchors', () => {
    const at2030 = interpolatePassThrough(2030);
    expect(at2030).toBeCloseTo(0.15); // midpoint between 0 and 0.30
  });
});

// ============================================================
// 7. Faster & Safer Multipliers
// ============================================================
describe('Faster Multiplier', () => {
  it('returns ~1.0 with no constraints', () => {
    const lagged = defaultLaggedInputs();
    const result = computeFasterMultiplier(lagged, DEFAULT_RESILIENCE, 'software', 100);
    expect(result).toBeCloseTo(1.0, 2);
  });

  it('chip shortage reduces faster for software deployment', () => {
    const shockedInputs = { ...DEFAULT_INPUTS, aiChips: 50 };
    const lagged = applyPropagationLags(shockedInputs, shockedInputs, shockedInputs);
    const result = computeFasterMultiplier(lagged, DEFAULT_RESILIENCE, 'software', 100);
    expect(result).toBeLessThan(1.0);
  });
});

describe('Safer Multiplier', () => {
  it('returns ~1.0 with no constraints', () => {
    const lagged = defaultLaggedInputs();
    const result = computeSaferMultiplier(lagged, DEFAULT_RESILIENCE, 'robotics');
    expect(result).toBeCloseTo(1.0, 2);
  });

  it('robotics HW shortage reduces safer for robotics deployment', () => {
    const shockedInputs = { ...DEFAULT_INPUTS, roboticsHardware: 50 };
    const lagged = applyPropagationLags(shockedInputs, shockedInputs, shockedInputs);
    const result = computeSaferMultiplier(lagged, DEFAULT_RESILIENCE, 'robotics');
    expect(result).toBeLessThan(1.0);
  });

  it('chip shortage has no effect on safer for software', () => {
    const shockedInputs = { ...DEFAULT_INPUTS, aiChips: 50 };
    const lagged = applyPropagationLags(shockedInputs, shockedInputs, shockedInputs);
    const result = computeSaferMultiplier(lagged, DEFAULT_RESILIENCE, 'software');
    // COGNITIVE_SENSITIVITY has safer = 0 for all non-robotics inputs
    expect(result).toBeCloseTo(1.0, 2);
  });
});

// ============================================================
// 8. Hysteresis Width
// ============================================================
describe('Hysteresis Width', () => {
  it('starts at base width for cognitive', () => {
    const config = getDefaultSupplyChainConfig();
    const width = computeHysteresisWidth(0, 'software', config);
    expect(width).toBeCloseTo(0.05); // HYSTERESIS_BASE_COGNITIVE
  });

  it('grows with years since adoption (cognitive)', () => {
    const config = getDefaultSupplyChainConfig();
    const width0 = computeHysteresisWidth(0, 'software', config);
    const width5 = computeHysteresisWidth(5, 'software', config);
    expect(width5).toBeGreaterThan(width0);
    expect(width5).toBeLessThanOrEqual(config.hysteresisMaxCognitive);
  });

  it('caps at max width', () => {
    const config = getDefaultSupplyChainConfig();
    const width = computeHysteresisWidth(100, 'software', config);
    expect(width).toBeLessThanOrEqual(config.hysteresisMaxCognitive);
  });

  it('embodied starts at higher base', () => {
    const config = getDefaultSupplyChainConfig();
    const cognitive = computeHysteresisWidth(0, 'software', config);
    const embodied = computeHysteresisWidth(0, 'robotics', config);
    expect(embodied).toBeGreaterThan(cognitive);
  });
});

// ============================================================
// 9. Stateful Adoption
// ============================================================
describe('Stateful Adoption', () => {
  const scores = { better: 0.8, faster: 0.8, cheaper: 0.8, safer: 0.8 };
  const thresholds = { better: 0.5, faster: 0.5, cheaper: 0.5, safer: 0.5 };

  it('not triggered → first_trigger when BFCS met', () => {
    const result = computeStatefulAdoptionRate(
      2030, 0, null, true, scores, thresholds,
      0.05, 'software', 0, 0.5, 0.85, 1.0, null,
    );
    expect(result.status).toBe('first_trigger');
    expect(result.adoptionRate).toBe(0);
  });

  it('growing state produces positive adoption rate', () => {
    const result = computeStatefulAdoptionRate(
      2032, 0.1, 2030, true, scores, thresholds,
      0.05, 'software', 0, 0.5, 0.85, 1.0, null,
    );
    expect(result.status).toBe('growing');
    expect(result.adoptionRate).toBeGreaterThan(0);
  });

  it('freezes when BFCS not met but within hysteresis', () => {
    // Scores just slightly below thresholds, within hysteresis band
    const lowScores = { better: 0.48, faster: 0.48, cheaper: 0.48, safer: 0.48 };
    const result = computeStatefulAdoptionRate(
      2035, 0.3, 2030, false, lowScores, thresholds,
      0.20, 'software', 0, 0.5, 0.85, 1.0, null,
    );
    // Within hysteresis: deAdoption threshold = 0.5 * (1 - 0.20) = 0.40
    // scores 0.48 > 0.40 → should freeze
    expect(result.status).toBe('frozen');
    expect(result.adoptionRate).toBe(0.3); // frozen at previous rate
  });

  it('declines when below hysteresis band', () => {
    const veryLowScores = { better: 0.2, faster: 0.2, cheaper: 0.2, safer: 0.2 };
    const result = computeStatefulAdoptionRate(
      2035, 0.3, 2030, false, veryLowScores, thresholds,
      0.20, 'software', 0, 0.5, 0.85, 1.0, null,
    );
    expect(result.status).toBe('declining');
    expect(result.adoptionRate).toBeLessThan(0.3);
  });

  it('never goes negative', () => {
    const veryLowScores = { better: 0.1, faster: 0.1, cheaper: 0.1, safer: 0.1 };
    const result = computeStatefulAdoptionRate(
      2035, 0.01, 2030, false, veryLowScores, thresholds,
      0.20, 'software', 0, 0.5, 0.85, 1.0, null,
    );
    expect(result.adoptionRate).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================
// 10. Lab Profit Adjustment + Cost Push
// ============================================================
describe('Lab Profit & Cost Push', () => {
  it('no constraint = zero adjustment', () => {
    const adj = computeLabProfitAdjustment({ compute: 1.0, physicalHardware: 1.0, energy: 1.0 }, 0);
    expect(adj).toBeCloseTo(0);
  });

  it('cost increase absorbed by labs reduces profit margin', () => {
    const adj = computeLabProfitAdjustment({ compute: 1.5, physicalHardware: 1.0, energy: 1.0 }, 0);
    expect(adj).toBeLessThan(0); // negative = margin reduction
  });

  it('full pass-through means labs absorb nothing', () => {
    const adj = computeLabProfitAdjustment({ compute: 2.0, physicalHardware: 1.5, energy: 3.0 }, 1.0);
    expect(adj).toBeCloseTo(0);
  });

  it('cost push is zero with no automation coverage', () => {
    const push = computeSupplyChainCostPush(0, { compute: 2.0, physicalHardware: 1.5, energy: 3.0 }, 1.0, 0.50);
    expect(push).toBeCloseTo(0);
  });

  it('cost push increases with automation coverage and pass-through', () => {
    const push = computeSupplyChainCostPush(0.5, { compute: 2.0, physicalHardware: 1.0, energy: 1.0 }, 0.5, 0.50);
    expect(push).toBeGreaterThan(0);
  });
});

// ============================================================
// 11. Resilience Evolution
// ============================================================
describe('Resilience Evolution', () => {
  it('resilience improves over time from 2025 baseline', () => {
    const base = DEFAULT_RESILIENCE;
    const evolved = computeAutopilotResilience(2030, base, 0);
    expect(evolved.aiChips).toBeGreaterThan(base.aiChips);
    expect(evolved.energy).toBeGreaterThanOrEqual(base.energy);
    expect(evolved.roboticsHardware).toBeGreaterThan(base.roboticsHardware);
  });

  it('onshoring fraction boosts AI chips resilience', () => {
    const base = DEFAULT_RESILIENCE;
    const noOnshoring = computeAutopilotResilience(2030, base, 0);
    const withOnshoring = computeAutopilotResilience(2030, base, 0.50);
    expect(withOnshoring.aiChips).toBeGreaterThan(noOnshoring.aiChips);
  });

  it('caps at MAX_RESILIENCE (0.85 for chips, 0.95 for DC)', () => {
    const base = DEFAULT_RESILIENCE;
    const farFuture = computeAutopilotResilience(2100, base, 1.0);
    expect(farFuture.aiChips).toBeLessThanOrEqual(0.85);
    expect(farFuture.trainingDC).toBeLessThanOrEqual(0.95);
    expect(farFuture.inferenceDC).toBeLessThanOrEqual(0.95);
  });
});

// ============================================================
// 12. Propagation Lags
// ============================================================
describe('Propagation Lags', () => {
  it('all defaults at 100 → all lagged values at 100', () => {
    const lagged = applyPropagationLags(DEFAULT_INPUTS, DEFAULT_INPUTS, DEFAULT_INPUTS);
    for (const inputKey of Object.keys(lagged) as (keyof typeof lagged)[]) {
      for (const dim of Object.keys(lagged[inputKey]) as ('better' | 'faster' | 'cheaper' | 'safer')[]) {
        expect(lagged[inputKey][dim]).toBeCloseTo(100, 4);
      }
    }
  });

  it('sudden shock is dampened by lag', () => {
    const shocked = { ...DEFAULT_INPUTS, aiChips: 50 };
    const lagged = applyPropagationLags(shocked, DEFAULT_INPUTS, DEFAULT_INPUTS);
    // AI chips to better has 12mo lag → uses previous year value
    expect(lagged.aiChips.better).toBeCloseTo(100, 0); // fully lagged
    // AI chips to faster has 2mo lag → mostly current
    expect(lagged.aiChips.faster).toBeLessThan(100);
    expect(lagged.aiChips.faster).toBeGreaterThan(50);
  });

  it('sustained shock eventually reaches full effect', () => {
    const shocked = { ...DEFAULT_INPUTS, aiChips: 50 };
    const lagged = applyPropagationLags(shocked, shocked, shocked);
    // All values should be at 50 since shock is sustained
    expect(lagged.aiChips.better).toBeCloseTo(50, 0);
    expect(lagged.aiChips.faster).toBeCloseTo(50, 0);
    expect(lagged.aiChips.cheaper).toBeCloseTo(50, 0);
  });
});

// ============================================================
// 13. Sensitivity Blend
// ============================================================
describe('Sensitivity Blend', () => {
  it('at zero progress → early profile (better high, cheaper low)', () => {
    const config = getDefaultSupplyChainConfig();
    const blend = computeSensitivityBlend(0, 0, config);
    expect(blend.cognitive.betterMult).toBeGreaterThan(1.0);
    expect(blend.cognitive.cheaperMult).toBeLessThan(1.0);
  });

  it('at full progress → mature profile (better low, cheaper high)', () => {
    const config = getDefaultSupplyChainConfig();
    const blend = computeSensitivityBlend(1.0, 1.0, config);
    expect(blend.cognitive.betterMult).toBeLessThan(1.0);
    expect(blend.cognitive.cheaperMult).toBeGreaterThan(1.0);
  });

  it('at 50% progress → even blend', () => {
    const config = getDefaultSupplyChainConfig();
    const blend = computeSensitivityBlend(0.5, 0.5, config);
    expect(blend.cognitive.betterMult).toBeCloseTo(1.0, 1);
    expect(blend.cognitive.cheaperMult).toBeCloseTo(1.0, 1);
  });
});

// ============================================================
// 14. Master Orchestrator — computeSupplyChainEffects
// ============================================================
describe('computeSupplyChainEffects', () => {
  it('defaults produce no-op effects', () => {
    const config = getDefaultSupplyChainConfig();
    const effects = computeSupplyChainEffects({
      year: 2030,
      config,
      shockHistory: NO_SHOCK_HISTORY,
      chipSupplyHistory: [100, 100, 100, 100, 100],
      prevCumulativeDelay: { generative: 0, agentic: 0, embodied: 0 },
      onshoringFraction: 0,
      automationCoverage: 0,
      baseComputeDeclineRate: DEFAULT_INFERENCE_ANNUAL_CHANGE,
      cognitiveProgress: 0,
      embodiedProgress: 0,
    });

    // Training channel: no delay
    expect(effects.annualCapabilityDelay.generative).toBeCloseTo(0);
    expect(effects.annualCapabilityDelay.agentic).toBeCloseTo(0);
    expect(effects.annualCapabilityDelay.embodied).toBeCloseTo(0);

    // Deployment channel: unit multipliers
    expect(effects.deploymentCostMultipliers.compute).toBeCloseTo(1.0);
    expect(effects.deploymentCostMultipliers.physicalHardware).toBeCloseTo(1.0);
    expect(effects.deploymentCostMultipliers.energy).toBeCloseTo(1.0);

    // Macro: zero push
    expect(effects.supplyChainCostPush).toBeCloseTo(0);
    expect(effects.labProfitMarginAdjustment).toBeCloseTo(0);
  });

  it('chip shortage creates delay and increases compute cost', () => {
    const config = getDefaultSupplyChainConfig();
    config.inputs.aiChips = 50;
    const effects = computeSupplyChainEffects({
      year: 2030,
      config,
      shockHistory: [
        { ...DEFAULT_INPUTS, aiChips: 50 },
        { ...DEFAULT_INPUTS, aiChips: 50 },
      ],
      chipSupplyHistory: [50, 50, 50, 50, 50],
      prevCumulativeDelay: { generative: 0, agentic: 0, embodied: 0 },
      onshoringFraction: 0,
      automationCoverage: 0.3,
      baseComputeDeclineRate: DEFAULT_INFERENCE_ANNUAL_CHANGE,
      cognitiveProgress: 0.2,
      embodiedProgress: 0.1,
    });

    expect(effects.annualCapabilityDelay.generative).toBeGreaterThan(0);
    expect(effects.deploymentCostMultipliers.compute).toBeGreaterThan(1.0);
    expect(effects.cascadeBacklog).toBeGreaterThan(0);
    expect(effects.effectiveComputeDeclineRate).toBeGreaterThan(DEFAULT_INFERENCE_ANNUAL_CHANGE); // less negative = slower decline
  });
});

// ============================================================
// 15. Adoption Drag
// ============================================================
describe('Adoption Drag', () => {
  it('no constraints = drag multiplier of 1.0', () => {
    const lagged = defaultLaggedInputs();
    const drag = computeAdoptionDrag(lagged, DEFAULT_RESILIENCE, 'software', 0);
    expect(drag).toBeCloseTo(1.0);
  });

  it('constraints reduce drag below 1.0', () => {
    const shockedInputs = { ...DEFAULT_INPUTS, aiChips: 50 };
    const lagged = applyPropagationLags(shockedInputs, shockedInputs, shockedInputs);
    const drag = computeAdoptionDrag(lagged, DEFAULT_RESILIENCE, 'software', 0.5);
    expect(drag).toBeLessThan(1.0);
    expect(drag).toBeGreaterThan(0);
  });
});
