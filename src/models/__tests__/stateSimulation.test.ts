/**
 * ATLAS State-Level Simulation — Unit Tests
 *
 * Tests the state simulation model defined in src/models/stateSimulation.ts.
 * Verifies state displacement, unemployment, ARPP, and policy effectiveness
 * computations.
 *
 * Strategy:
 *   - Unit tests for each pure function
 *   - Integration test with mock state data through runSimulation
 *   - Edge cases: 100% one cluster, 0% displacement, all displaced
 *   - Backward compatibility: no state data = states: undefined
 */

import { describe, it, expect } from 'vitest';
import {
  computeStateSingleDisplacement,
  computeStateCWI,
  computeStateUnemploymentRate,
  computeStatePolicyEffectiveness,
  applyStatePolicyModifiers,
  computeStateOutputs,
} from '@/models/stateSimulation';
import { getDefaultSimulationConfig, runSimulation } from '@/models/simulation';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import type {
  StateData,
  ClusterDisplacementResult,
  MacroOutput,
  PolicyEffects,
  StatePolicyOverride,
} from '@/types';
import { DISPLACEMENT_TO_UNEMPLOYMENT_FACTOR } from '@/models/constants';

// ============================================================
// Test Helpers
// ============================================================

function makeStateData(overrides?: Partial<StateData>): StateData {
  return {
    code: 'TX',
    name: 'Texas',
    population: 30_000_000,
    laborForce: 15_000_000,
    baselineUnemploymentRate: 0.04,
    occupationDistribution: {
      tech_swe: 200_000,
      transport_trucking: 300_000,
      health_nurses: 250_000,
    },
    policyOverrides: {},
    ...overrides,
  };
}

function makeClusterDisplacementRates(): Map<string, number> {
  const rates = new Map<string, number>();
  rates.set('tech_swe', 0.3);           // 30% displaced
  rates.set('transport_trucking', 0.5);  // 50% displaced
  rates.set('health_nurses', 0.1);       // 10% displaced
  return rates;
}

function makeMockClusterResults(): ClusterDisplacementResult[] {
  return [
    {
      clusterId: 'tech_swe',
      roles: [],
      totalRemainingEmployment: 700_000,
      totalDirectDisplacement: 300_000,
      secondOrderDisplacement: 50_000,
      totalDisplacement: 350_000,
      averageWage: 120_000,
      bfcsOutput: [],
    },
    {
      clusterId: 'transport_trucking',
      roles: [],
      totalRemainingEmployment: 500_000,
      totalDirectDisplacement: 500_000,
      secondOrderDisplacement: 100_000,
      totalDisplacement: 600_000,
      averageWage: 55_000,
      bfcsOutput: [],
    },
    {
      clusterId: 'health_nurses',
      roles: [],
      totalRemainingEmployment: 900_000,
      totalDirectDisplacement: 100_000,
      secondOrderDisplacement: 20_000,
      totalDisplacement: 120_000,
      averageWage: 75_000,
      bfcsOutput: [],
    },
  ];
}

function makeMockMacro(): MacroOutput {
  return {
    year: 2030,
    totalEmployment: 150_000_000,
    totalUnemployment: 18_000_000,
    unemploymentRate: 0.107,
    laborForceParticipation: 0.62,
    dynamicPopulation: 340_000_000,
    dynamicLaborForce: 168_000_000,
    aggregateWageIncome: 8_000_000_000_000,
    aggregateAssetIncome: 2_000_000_000_000,
    aggregateTransferIncome: 1_500_000_000_000,
    totalIncome: 11_500_000_000_000,
    incomeComposition: { wageShare: 0.55, assetShare: 0.2, transferShare: 0.25 },
    priceLevel: 1.1,
    inflationRate: 0.02,
    aiDeflationRate: 0.01,
    netInflation: 0.01,
    gdpNominal: 28_000_000_000_000,
    gdpReal: 22_000_000_000_000,
    gdpGrowthRate: 0.01,
    realGDPGrowthRate: 0.01,
    consumption: 18_000_000_000_000,
    investment: 4_000_000_000_000,
    governmentSpending: 9_000_000_000_000,
    potentialGDP: 29_000_000_000_000,
    capacityUtilization: 1.0,
    dividendIncome: 500_000_000_000,
    aiCapitalGains: 0,
    traditionalCapitalGains: 0,
    nonCorporateAssetIncome: 1_500_000_000_000,
    nonCorporateAssetTax: 0,
    capitalGainsRealizationRate: 0.07,
    aiSectorPE: 10,
    traditionalSectorPE: 10,
    prevAICorporateProfits: 0,
    prevTraditionalCorporateProfits: 0,
    wageConsumption: 14_000_000_000_000,
    assetConsumption: 2_000_000_000_000,
    transferConsumption: 5_000_000_000_000,
    consumerWelfareIndex: 30_000,
    cwiGrowthRate: -0.02,
    cwiAcceleration: 0,
    cyclePhase: 'STABLE' as const,
    aiGDPContribution: 0,
    aiGDPContributionPct: 0,
    revenuePressure: 0.1,
    automationAcceleration: 0.05,
    isDepression: false,
    consecutiveDeclineQuarters: 0,
    wagePressure: 0.92,
    sectorWeightedDeflationRate: 0.01,
    newJobCreationRate: 0.01,
    automationCoverage: 0.3,
    durableNewJobs: 500_000,
    netJobCreation: -2_000_000,
    demandRatio: 0.95,
    demandPenalty: 0.93,
    consumerDemandRatio: 0.95,
    govDemandRatio: 0.90,
    businessDemandRatio: 0.85,
    aggregateDemandSurvival: 0.92,
    totalDemandSpilloverLoss: 5_000_000,
    consumerCreditMultiplier: 0.98,
    consumerCreditTightening: 0.20,
    incomeAdequacyRatio: 0.85,
    underwritableIncome: 55000,
    businessCreditMultiplier: 0.96,
    businessCreditTightening: 0.04,
    profitCoverageRatio: 0.95,
    fiscalDeficitGDPRatio: 0.11,
    discretionarySpending: 2_500_000_000_000,
    velocityMultiplier: 1.0,
    deflationDragPct: 0,
    cumulativeInflationFactor: 1.23,
    baselineTransferIncome: 5_950_000_000_000 * 1.23,
    effectiveInflationRate: 0.01,
    aiAdditionalOutput: 0,
    aiInvestmentBoost: 0,
    aiNetExportBoost: 0,
    aiConsumerGoodsPotential: 0,
    unrealizedAIOutput: 0,
    aiGoodsAbsorbed: 0,
    aiCapacityUtilization: 1.0,
    totalAugmentationOutput: 0,
    augmentationWageBoost: 0,
    augmentationProfitBoost: 0,
    investmentRealization: 1.0,
    aiInvestmentRealized: 0,
    aiExportsRealized: 0,
    newJobEmployment: 0,
    newJobWageIncome: 0,
    corporateProfits: 3_500_000_000_000,
    aiCorporateProfits: 500_000_000_000,
    traditionalCorporateProfits: 3_000_000_000_000,
    profitGDPRatio: 0.125,
    // Phase 5g Batch C: Price level decomposition
    minWageCostPush: 0,
    creditDeflationContribution: 0,
    scarcityInflation: 0,
    // Phase 5g Step 12: Labor supply response
    voluntaryWithdrawalRate: 0,
    effectiveLaborSupply: 150_000_000,
    // Phase 5i: Housing & Credit
    // DEPRECATED Phase 6: householdCreditTightening, businessCreditSignal removed
    goodsInflation: 0.01,
    shelterInflation: 0.035,
    compositeInflation: 0.019,
    shelterDeflationFromAI: 0,
    foreclosureSupplyEffect: 0,
    rentalDemandPressure: 0,
    institutionalAbsorption: 0,
    mortgageStressIndex: 1.0,
    // DEPRECATED Phase 6: adjustedCreditTightening removed
    foreclosureRateAggregate: 0,
    homeownershipQ1: 0.47,
    homeownershipQ2: 0.55,
    homeownershipQ3: 0.63,
    homeownershipQ4: 0.75,
    homeownershipQ5: 0.81,
    avgHomeownership: 0.642,
    homePriceChangeRate: 0.01,
    housingWealthDrag: 0,
    effectiveMpcWage: 0.80,
    precautionaryMpcReduction: 0,
    creditAdoptionAcceleration: 0,
    medianCWI: 0,
    medianCWIGrowthRate: 0,
    // Phase 5-tax fields
    wageIncomeTax: 0,
    employeePayrollTax: 0,
    employerPayrollTax: 0,
    capitalGainsTax: 0,
    corporateTaxRevenue: 0,
    stateLocalRevenue: 0,
    totalGovernmentRevenue: 0,
    afterTaxWageIncome: 8_000_000_000_000,
    afterTaxAssetIncome: 2_000_000_000_000,
    afterTaxTransferIncome: 1_500_000_000_000,
    totalPostTaxIncome: 11_500_000_000_000,
    afterTaxCorporateProfits: 2_800_000_000_000,
    retainedEarnings: 1_400_000_000_000,
    creditCapacity: 5_000_000_000_000,
    investmentCapacity: 6_400_000_000_000,
    capacityGate: 1.0,
    profitFundedRatio: 0.5,
    creditFundedRatio: 0.5,
    corporateCashAccumulation: 0,
    blendedAiCostIndex: 1.0,
    inferenceCostIndex: 1.0,
    manufacturingCostIndex: 1.0,
    energyCostIndex: 1.0,
    importDependence: 0.3,
    // Phase 8 Fix 5: Housing model + wage growth outputs
    homePriceIndex: 1.0,
    affordabilityDeviation: 0,
    realIncomeGrowthRate: 0,
    mortgageRateChange: 0,
    nominalWageGrowth: 0,
    // Phase 9: Supply chain fields
    aggregateResilience: 0,
    cumulativeDelayGenerative: 0,
    cumulativeDelayAgentic: 0,
    cumulativeDelayEmbodied: 0,
    supplyChainCostPush: 0,
    cascadeBacklog: 0,
    costPassThroughRate: 0,
    adoptionDragMultiplier: 1,
    dynamicTrainingCompChips: 0,
    dynamicTrainingCompEnergy: 0,
    dynamicTrainingCompDC: 0,
    effectiveComputeDeclineRate: -0.45,
    deploymentMultiplierCompute: 1,
    deploymentMultiplierPhysical: 1,
    deploymentMultiplierEnergy: 1,
    automationDividend: 0,
    // Phase 10.A stub fields — not exercised by this state-sim test
    corporateMarginRatio: 0.12,
    aiDisplacementUnemployment: 0,
  };
}

function makeMockPolicyEffects(): PolicyEffects {
  return {
    wageChannelAddition: 500_000_000_000,
    assetChannelAddition: 200_000_000_000,
    transferChannelAddition: 300_000_000_000,
    totalPolicyIncome: 1_000_000_000_000,
    fiscalCost: 800_000_000_000,
    fiscalCostAsPercentGDP: 0.03,
    sovereignFundSize: 500,
    swfAnnualContribution: 0,
    requiredAssetOwnership: 0.1,
    requiredTransferLevel: 1_000,
  };
}

// ============================================================
// computeStateSingleDisplacement
// ============================================================

describe('computeStateSingleDisplacement', () => {
  it('computes weighted displacement from cluster rates', () => {
    const stateData = makeStateData();
    const rates = makeClusterDisplacementRates();

    const displacement = computeStateSingleDisplacement(stateData, rates);

    // Expected: (0.3*200k + 0.5*300k + 0.1*250k) / (200k + 300k + 250k)
    // = (60k + 150k + 25k) / 750k = 235k / 750k ≈ 0.3133
    expect(displacement).toBeCloseTo(0.3133, 3);
  });

  it('returns 0 for state with no employment', () => {
    const stateData = makeStateData({ occupationDistribution: {} });
    const rates = makeClusterDisplacementRates();

    const displacement = computeStateSingleDisplacement(stateData, rates);
    expect(displacement).toBe(0);
  });

  it('returns 0 when all cluster displacement rates are 0', () => {
    const stateData = makeStateData();
    const rates = new Map<string, number>();
    rates.set('tech_swe', 0);
    rates.set('transport_trucking', 0);
    rates.set('health_nurses', 0);

    const displacement = computeStateSingleDisplacement(stateData, rates);
    expect(displacement).toBe(0);
  });

  it('trucking-heavy state shows higher displacement', () => {
    const truckingHeavy = makeStateData({
      code: 'WY',
      occupationDistribution: {
        transport_trucking: 500_000,
        tech_swe: 10_000,
        health_nurses: 10_000,
      },
    });
    const techHeavy = makeStateData({
      code: 'CA',
      occupationDistribution: {
        tech_swe: 500_000,
        transport_trucking: 10_000,
        health_nurses: 10_000,
      },
    });
    const rates = makeClusterDisplacementRates();

    const truckingDisp = computeStateSingleDisplacement(truckingHeavy, rates);
    const techDisp = computeStateSingleDisplacement(techHeavy, rates);

    // Trucking has 50% displacement rate vs tech's 30%
    expect(truckingDisp).toBeGreaterThan(techDisp);
    expect(truckingDisp).toBeGreaterThan(0.45); // Close to trucking rate
    expect(techDisp).toBeGreaterThan(0.25);     // Close to tech rate
  });

  it('100% single cluster state gets that cluster rate exactly', () => {
    const singleCluster = makeStateData({
      occupationDistribution: { transport_trucking: 1_000_000 },
    });
    const rates = makeClusterDisplacementRates();

    const displacement = computeStateSingleDisplacement(singleCluster, rates);
    expect(displacement).toBeCloseTo(0.5, 5);
  });
});

// ============================================================
// computeStateUnemploymentRate
// ============================================================

describe('computeStateUnemploymentRate', () => {
  it('adds displacement contribution to baseline', () => {
    const rate = computeStateUnemploymentRate(0.04, 0.3);
    // 0.04 + 0.3 * 0.7 = 0.04 + 0.21 = 0.25
    expect(rate).toBeCloseTo(0.04 + 0.3 * DISPLACEMENT_TO_UNEMPLOYMENT_FACTOR, 5);
  });

  it('returns baseline when displacement is 0', () => {
    const rate = computeStateUnemploymentRate(0.04, 0);
    expect(rate).toBe(0.04);
  });

  it('clamps to maximum 0.80', () => {
    const rate = computeStateUnemploymentRate(0.3, 0.8);
    expect(rate).toBeLessThanOrEqual(0.80);
  });

  it('clamps to minimum 0', () => {
    const rate = computeStateUnemploymentRate(0, 0);
    expect(rate).toBe(0);
  });
});

// ============================================================
// computeStateCWI
// ============================================================

describe('computeStateCWI', () => {
  it('reduces CWI proportional to displacement', () => {
    const cwi = computeStateCWI(30_000, 0.2, 0, 10_000_000);
    // 30000 * (1 - 0.2 * 0.5) = 30000 * 0.9 = 27000
    expect(cwi).toBeCloseTo(27_000, 0);
  });

  it('returns full CWI when displacement is 0', () => {
    const cwi = computeStateCWI(30_000, 0, 0, 10_000_000);
    expect(cwi).toBe(30_000);
  });

  it('adds policy additions per capita', () => {
    const population = 10_000_000;
    const policyAddition = 5_000_000_000; // $5B total
    const cwi = computeStateCWI(30_000, 0, policyAddition, population);
    // 30000 + 5B/10M = 30000 + 500 = 30500
    expect(cwi).toBeCloseTo(30_500, 0);
  });
});

// ============================================================
// computeStatePolicyEffectiveness
// ============================================================

describe('computeStatePolicyEffectiveness', () => {
  it('returns 1.0 when ARPP equals baseline', () => {
    expect(computeStatePolicyEffectiveness(30_000, 30_000)).toBe(1.0);
  });

  it('returns 0.5 when ARPP is half of baseline', () => {
    expect(computeStatePolicyEffectiveness(15_000, 30_000)).toBeCloseTo(0.5);
  });

  it('clamps to 0 when ARPP is negative', () => {
    expect(computeStatePolicyEffectiveness(-5_000, 30_000)).toBe(0);
  });

  it('clamps to 1 when ARPP exceeds baseline', () => {
    expect(computeStatePolicyEffectiveness(35_000, 30_000)).toBe(1);
  });

  it('returns 1.0 when baseline is 0', () => {
    expect(computeStatePolicyEffectiveness(0, 0)).toBe(1.0);
  });
});

// ============================================================
// applyStatePolicyModifiers
// ============================================================

describe('applyStatePolicyModifiers', () => {
  it('computes additional UBI income', () => {
    const override: Partial<StatePolicyOverride> = {
      additionalUBI: 500, // $500/month
    };
    const stateData = makeStateData();
    const { additions } = applyStatePolicyModifiers(override, makeMockPolicyEffects(), stateData);

    // 500 * 12 * (30M * 0.8) = 500 * 12 * 24M = $144B
    expect(additions).toBeCloseTo(500 * 12 * 30_000_000 * 0.8, -3);
  });

  it('returns 0 additions when no overrides', () => {
    const { additions } = applyStatePolicyModifiers({}, makeMockPolicyEffects(), makeStateData());
    expect(additions).toBe(0);
  });

  it('computes regulatory lag for restrictive AV environment', () => {
    const override: Partial<StatePolicyOverride> = {
      avRegulatoryEnvironment: 'restrictive',
    };
    const { lagModifier } = applyStatePolicyModifiers(override, makeMockPolicyEffects(), makeStateData());
    expect(lagModifier).toBe(3);
  });

  it('computes regulatory lag for permissive environment', () => {
    const override: Partial<StatePolicyOverride> = {
      avRegulatoryEnvironment: 'permissive',
      roboticsRegulatoryEnvironment: 'permissive',
    };
    const { lagModifier } = applyStatePolicyModifiers(override, makeMockPolicyEffects(), makeStateData());
    expect(lagModifier).toBe(0);
  });
});

// ============================================================
// computeStateOutputs
// ============================================================

describe('computeStateOutputs', () => {
  it('computes outputs for all states', () => {
    const stateDataMap = new Map<string, StateData>();
    stateDataMap.set('TX', makeStateData());
    stateDataMap.set('CA', makeStateData({
      code: 'CA',
      name: 'California',
      population: 39_000_000,
      laborForce: 19_500_000,
      occupationDistribution: {
        tech_swe: 500_000,
        transport_trucking: 100_000,
        health_nurses: 400_000,
      },
    }));

    const outputs = computeStateOutputs(
      2030,
      stateDataMap,
      makeMockClusterResults(),
      makeMockMacro(),
      makeMockPolicyEffects(),
      {},
      getDefaultSimulationConfig(),
    );

    expect(outputs).toHaveLength(2);
    expect(outputs[0]!.year).toBe(2030);
    expect(outputs[1]!.year).toBe(2030);

    // Both should have positive displacement
    for (const output of outputs) {
      expect(output.displacement).toBeGreaterThan(0);
      expect(output.displacement).toBeLessThanOrEqual(1);
      expect(output.unemploymentRate).toBeGreaterThan(0);
      expect(output.policyEffectiveness).toBeGreaterThanOrEqual(0);
      expect(output.policyEffectiveness).toBeLessThanOrEqual(1);
    }
  });

  it('applies state policy overrides', () => {
    const stateDataMap = new Map<string, StateData>();
    stateDataMap.set('TX', makeStateData());

    const withoutOverride = computeStateOutputs(
      2030,
      stateDataMap,
      makeMockClusterResults(),
      makeMockMacro(),
      makeMockPolicyEffects(),
      {},
      getDefaultSimulationConfig(),
    );

    const withOverride = computeStateOutputs(
      2030,
      stateDataMap,
      makeMockClusterResults(),
      makeMockMacro(),
      makeMockPolicyEffects(),
      { TX: { additionalUBI: 1000 } },
      getDefaultSimulationConfig(),
    );

    // State with additional UBI should have higher CWI
    expect(withOverride[0]!.consumerWelfareIndex).toBeGreaterThan(withoutOverride[0]!.consumerWelfareIndex);
  });
});

// ============================================================
// Backward compatibility
// ============================================================

describe('backward compatibility', () => {
  it('runSimulation without state data produces states: undefined', () => {
    const config = {
      ...getDefaultSimulationConfig(),
      startYear: 2025,
      endYear: 2027,
    };
    const clusters = OCCUPATION_CLUSTERS.slice(0, 3);
    const timeline = runSimulation(config, clusters);

    for (const year of timeline.years) {
      expect(year.states).toBeUndefined();
    }
  });

  it('runSimulation with empty state map produces states: undefined', () => {
    const config = {
      ...getDefaultSimulationConfig(),
      startYear: 2025,
      endYear: 2027,
    };
    const clusters = OCCUPATION_CLUSTERS.slice(0, 3);
    const emptyStateMap = new Map<string, StateData>();
    const timeline = runSimulation(config, clusters, undefined, emptyStateMap);

    for (const year of timeline.years) {
      expect(year.states).toBeUndefined();
    }
  });

  it('runSimulation with state data produces states array', () => {
    const config = {
      ...getDefaultSimulationConfig(),
      startYear: 2025,
      endYear: 2027,
    };
    const clusters = OCCUPATION_CLUSTERS.slice(0, 3);

    // Create minimal state data referencing clusters we'll simulate
    const stateDataMap = new Map<string, StateData>();
    stateDataMap.set('TX', makeStateData({
      occupationDistribution: {
        [clusters[0]!.id]: 100_000,
        [clusters[1]!.id]: 80_000,
        [clusters[2]!.id]: 60_000,
      },
    }));

    const timeline = runSimulation(config, clusters, undefined, stateDataMap);

    for (const year of timeline.years) {
      expect(year.states).toBeDefined();
      expect(year.states).toHaveLength(1);
      expect(year.states![0]!.code).toBe('TX');
      expect(year.states![0]!.year).toBe(year.year);
    }
  });
});

// ============================================================
// Additional integration tests
// ============================================================

describe('state simulation — multi-state comparison', () => {
  it('tech-heavy vs trucking-heavy states diverge under different displacement', () => {
    const stateDataMap = new Map<string, StateData>();

    // CA: heavily tech
    stateDataMap.set('CA', makeStateData({
      code: 'CA',
      name: 'California',
      population: 39_000_000,
      laborForce: 19_500_000,
      baselineUnemploymentRate: 0.05,
      occupationDistribution: {
        tech_swe: 800_000,
        transport_trucking: 50_000,
        health_nurses: 100_000,
      },
    }));

    // WY: heavily trucking
    stateDataMap.set('WY', makeStateData({
      code: 'WY',
      name: 'Wyoming',
      population: 576_851,
      laborForce: 300_000,
      baselineUnemploymentRate: 0.035,
      occupationDistribution: {
        tech_swe: 5_000,
        transport_trucking: 200_000,
        health_nurses: 10_000,
      },
    }));

    const outputs = computeStateOutputs(
      2030,
      stateDataMap,
      makeMockClusterResults(),
      makeMockMacro(),
      makeMockPolicyEffects(),
      {},
      getDefaultSimulationConfig(),
    );

    expect(outputs).toHaveLength(2);
    const caOutput = outputs.find(o => o.code === 'CA')!;
    const wyOutput = outputs.find(o => o.code === 'WY')!;

    // WY should have higher displacement because trucking has 50% vs tech's 30%
    expect(wyOutput.displacement).toBeGreaterThan(caOutput.displacement);

    // Both should have valid unemployment rates
    expect(caOutput.unemploymentRate).toBeGreaterThan(caOutput.displacement * 0.5);
    expect(wyOutput.unemploymentRate).toBeGreaterThan(wyOutput.displacement * 0.5);
  });

  it('state with UBI override has higher CWI than without', () => {
    const stateDataMap = new Map<string, StateData>();
    stateDataMap.set('TX', makeStateData());
    stateDataMap.set('CA', makeStateData({
      code: 'CA',
      name: 'California',
      population: 39_000_000,
      laborForce: 19_500_000,
      baselineUnemploymentRate: 0.05,
      occupationDistribution: {
        tech_swe: 200_000,
        transport_trucking: 300_000,
        health_nurses: 250_000,
      },
    }));

    // Only CA gets additional UBI
    const outputs = computeStateOutputs(
      2030,
      stateDataMap,
      makeMockClusterResults(),
      makeMockMacro(),
      makeMockPolicyEffects(),
      { CA: { additionalUBI: 1000 } },
      getDefaultSimulationConfig(),
    );

    const txOutput = outputs.find(o => o.code === 'TX')!;
    const caOutput = outputs.find(o => o.code === 'CA')!;

    // CA should have higher CWI due to UBI
    expect(caOutput.consumerWelfareIndex).toBeGreaterThan(txOutput.consumerWelfareIndex);
  });
});

describe('state simulation — regulatory lag', () => {
  it('restrictive AV regulation produces higher lag than permissive', () => {
    const restrictive = applyStatePolicyModifiers(
      { avRegulatoryEnvironment: 'restrictive', roboticsRegulatoryEnvironment: 'restrictive' },
      makeMockPolicyEffects(),
      makeStateData(),
    );
    const permissive = applyStatePolicyModifiers(
      { avRegulatoryEnvironment: 'permissive', roboticsRegulatoryEnvironment: 'permissive' },
      makeMockPolicyEffects(),
      makeStateData(),
    );

    expect(restrictive.lagModifier).toBeGreaterThan(permissive.lagModifier);
    expect(restrictive.lagModifier).toBe(3);
    expect(permissive.lagModifier).toBe(0);
  });

  it('moderate regulation produces lag of 1', () => {
    const moderate = applyStatePolicyModifiers(
      { avRegulatoryEnvironment: 'moderate', roboticsRegulatoryEnvironment: 'moderate' },
      makeMockPolicyEffects(),
      makeStateData(),
    );
    expect(moderate.lagModifier).toBe(1);
  });

  it('takes the maximum lag when AV and robotics differ', () => {
    const mixed = applyStatePolicyModifiers(
      {
        avRegulatoryEnvironment: 'permissive',
        roboticsRegulatoryEnvironment: 'restrictive',
      },
      makeMockPolicyEffects(),
      makeStateData(),
    );
    expect(mixed.lagModifier).toBe(3); // restrictive = 3
  });
});

describe('state simulation — UI replacement rate', () => {
  it('higher UI replacement rate increases policy additions', () => {
    const highUI = applyStatePolicyModifiers(
      { uiReplacementRate: 0.8 },
      makeMockPolicyEffects(),
      makeStateData(),
    );
    const lowUI = applyStatePolicyModifiers(
      { uiReplacementRate: 0.45 },
      makeMockPolicyEffects(),
      makeStateData(),
    );

    // 0.8 > 0.45, so high UI should produce more additions
    expect(highUI.additions).toBeGreaterThan(lowUI.additions);
    // 0.45 is the baseline — no additional income
    expect(lowUI.additions).toBe(0);
  });

  it('UI rate at baseline produces 0 additions', () => {
    const baseline = applyStatePolicyModifiers(
      { uiReplacementRate: 0.45 },
      makeMockPolicyEffects(),
      makeStateData(),
    );
    expect(baseline.additions).toBe(0);
  });
});

describe('state simulation — edge cases', () => {
  it('handles 100% displacement', () => {
    const rates = new Map<string, number>();
    rates.set('tech_swe', 1.0);
    rates.set('transport_trucking', 1.0);
    rates.set('health_nurses', 1.0);

    const displacement = computeStateSingleDisplacement(makeStateData(), rates);
    expect(displacement).toBeCloseTo(1.0, 5);
  });

  it('unemployment rate stays clamped at 80% even with extreme displacement', () => {
    const rate = computeStateUnemploymentRate(0.3, 1.0);
    // 0.3 + 1.0 * 0.7 = 1.0 → clamped to 0.80
    expect(rate).toBe(0.80);
  });

  it('CWI stays positive even with high displacement', () => {
    const cwi = computeStateCWI(30_000, 0.9, 0, 10_000_000);
    // 30000 * (1 - 0.9 * 0.5) = 30000 * 0.55 = 16500
    expect(cwi).toBeCloseTo(16_500, 0);
    expect(cwi).toBeGreaterThan(0);
  });

  it('policy effectiveness is 0 when ARPP collapses to 0', () => {
    const effectiveness = computeStatePolicyEffectiveness(0, 30_000);
    expect(effectiveness).toBe(0);
  });

  it('handles state with clusters not in simulation', () => {
    // State has clusters that aren't in the cluster results
    const stateData = makeStateData({
      occupationDistribution: {
        unknown_cluster_1: 100_000,
        unknown_cluster_2: 200_000,
      },
    });
    const rates = makeClusterDisplacementRates(); // only has tech_swe, transport_trucking, health_nurses

    const displacement = computeStateSingleDisplacement(stateData, rates);
    // All unknown clusters default to 0 displacement
    expect(displacement).toBe(0);
  });
});
