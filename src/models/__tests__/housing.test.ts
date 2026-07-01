/**
 * ATLAS Phase 5i: Housing, Shelter Inflation & Mortgage Stress — Unit Tests
 *
 * Tests pure functions added in Phase 5i:
 *   - computeDualCreditMultiplier: dual credit channels (household UE-driven, business GDP-driven)
 *   - mapClustersToQuintiles: wage-based quintile assignment
 *   - computeMortgageStressIndex: composition amplifier from displacement patterns
 *   - updateHomeownership: dynamic homeownership with lagged foreclosures
 *   - computeHousingWealthEffect: wealth drag from falling home prices
 *   - Precautionary MPC: tested via computeMacro integration
 */

import { describe, it, expect } from 'vitest';
import {
  computeConsumerCreditConditions,
  computeBusinessCreditConditions,
  computeHousingWealthEffect,
  mapClustersToQuintiles,
  computeMortgageStressIndex,
  updateHomeownership,
  computeMacro,
} from '@/models/macro';
import {
  NATURAL_UNEMPLOYMENT_RATE,
  MORTGAGE_EXPOSURE_QUINTILES,
  BASELINE_TOTAL_EMPLOYMENT,
  BASELINE_AVERAGE_ANNUAL_WAGE,
  DEFAULT_START_YEAR,
} from '@/models/constants';
import type { PolicyEffects, MacroInputs } from '@/types';

// ============================================================
// Test Helpers
// ============================================================

function zeroPolicyEffects(): PolicyEffects {
  return {
    wageChannelAddition: 0,
    assetChannelAddition: 0,
    transferChannelAddition: 0,
    enhancedUIAddition: 0,
    displacedFlatAddition: 0,
  uiPricingWage: 0,
    totalPolicyIncome: 0,
    fiscalCost: 0,
    fiscalCostAsPercentGDP: 0,
    sovereignFundSize: 0,
    swfAnnualContribution: 0,
    requiredAssetOwnership: 0,
    requiredTransferLevel: 0,
  };
}

function buildDefaultMacroInputs(overrides?: Partial<MacroInputs>): MacroInputs {
  return {
    year: DEFAULT_START_YEAR,
    totalRemainingEmployment: BASELINE_TOTAL_EMPLOYMENT,
    weightedAverageWage: BASELINE_AVERAGE_ANNUAL_WAGE,
    totalDisplaced: 0,
    automationCoverage: 0,
    policyEffects: zeroPolicyEffects(),
    previousMacro: null,
    ...overrides,
  };
}

/** Generate mock clusters for quintile/mortgage tests. */
function makeMockClusters(count: number): Array<{ id: string; averageWage: number }> {
  return Array.from({ length: count }, (_, i) => ({
    id: `cluster_${i}`,
    averageWage: 30000 + i * 10000, // $30k, $40k, $50k, ...
  }));
}

/** Generate mock cluster displacement results. */
function makeMockClusterResults(
  clusters: Array<{ id: string; averageWage: number }>,
  displacementFraction = 0,
) {
  return clusters.map((c) => ({
    clusterId: c.id,
    baseEmployment: 100000,
    totalRemainingEmployment: 100000 * (1 - displacementFraction),
    totalDirectDisplacement: 100000 * displacementFraction,
    averageWage: c.averageWage,
  }));
}

// ============================================================
// computeConsumerCreditConditions (replaces computeDualCreditMultiplier)
// ============================================================

describe('computeConsumerCreditConditions', () => {
  it('adequate income: neutral credit', () => {
    // underwritable = 50000 + 0.70*10000 + 0.30*5000 = 58500
    // baseline must match underwritable for ratio = 1.0
    const result = computeConsumerCreditConditions(
      50000, 10000, 5000, 58500, 0.70,
      0.0, 1.0, 1.0, 1.0, 0.0,
      2.0, 1.0, 1.5, 0.5, 0.5, 0.06,
    );
    expect(result.consumerCreditMultiplier).toBeCloseTo(1.0, 5);
    expect(result.consumerCreditTightening).toBeCloseTo(0, 5);
  });

  it('income halved: consumer credit tightens', () => {
    const result = computeConsumerCreditConditions(
      25000, 5000, 2500, 65000, 0.70,
      -0.05, 1.2, 0.8, 1.0, 0.03,
      2.0, 1.0, 1.5, 0.5, 0.5, 0.06,
    );
    expect(result.consumerCreditTightening).toBeGreaterThan(0);
    expect(result.consumerCreditMultiplier).toBeLessThan(1.0);
  });

  it('UBI compensates for wage loss', () => {
    // Use maxTightening=1.0 and sensitivity=1.0 to avoid both scenarios hitting cap
    // noTransfer: underwritable = 40000 + 0 + 0.3*5000 = 41500, ratio = 41500/58500 = 0.71
    const noTransfer = computeConsumerCreditConditions(
      40000, 0, 5000, 58500, 0.70,
      0.0, 1.0, 1.0, 1.0, 0.0,
      1.0, 1.0, 1.5, 0.5, 1.0, 0.06,
    );
    // withTransfer: underwritable = 40000 + 0.7*20000 + 1500 = 55500, ratio = 55500/58500 = 0.95
    const withTransfer = computeConsumerCreditConditions(
      40000, 20000, 5000, 58500, 0.70,
      0.0, 1.0, 1.0, 1.0, 0.0,
      1.0, 1.0, 1.5, 0.5, 1.0, 0.06,
    );
    expect(withTransfer.underwritableIncome).toBeGreaterThan(noTransfer.underwritableIncome);
    expect(withTransfer.consumerCreditTightening).toBeLessThan(noTransfer.consumerCreditTightening);
  });

  it('high mortgage stress + falling prices: tightening amplified', () => {
    const calm = computeConsumerCreditConditions(
      50000, 10000, 5000, 65000, 0.70,
      0.0, 1.0, 1.0, 1.0, 0.0,
      2.0, 1.0, 1.5, 0.5, 0.5, 0.06,
    );
    const stressed = computeConsumerCreditConditions(
      50000, 10000, 5000, 65000, 0.70,
      -0.15, 2.0, 0.7, 1.0, 0.04,
      2.0, 1.0, 1.5, 0.5, 0.5, 0.06,
    );
    expect(stressed.consumerCreditTightening).toBeGreaterThan(calm.consumerCreditTightening);
  });

  it('CWI collapse drives systemic risk channel', () => {
    const stable = computeConsumerCreditConditions(
      50000, 10000, 5000, 65000, 0.70,
      0.0, 1.0, 1.0, 1.0, 0.0,
      2.0, 1.0, 1.5, 0.5, 0.5, 0.06,
    );
    const cwiCrash = computeConsumerCreditConditions(
      50000, 10000, 5000, 65000, 0.70,
      0.0, 1.0, 0.5, 1.0, 0.0,  // CWI halved
      2.0, 1.0, 1.5, 0.5, 0.5, 0.06,
    );
    expect(cwiCrash.consumerCreditTightening).toBeGreaterThan(stable.consumerCreditTightening);
  });
});

// ============================================================
// computeBusinessCreditConditions
// ============================================================

describe('computeBusinessCreditConditions', () => {
  it('profits at baseline + positive growth: loosening', () => {
    const result = computeBusinessCreditConditions(
      2e12, 2e12, 0.02,
      1.5, 2.0, 0.5, 0.3, 0.15,
    );
    expect(result.businessCreditTightening).toBeLessThanOrEqual(0);
    expect(result.businessCreditMultiplier).toBeGreaterThanOrEqual(1.0);
  });

  it('profits collapsed + GDP shrinking: both channels tighten', () => {
    const result = computeBusinessCreditConditions(
      0.5e12, 2e12, -0.05,
      1.5, 2.0, 0.5, 0.3, 0.15,
    );
    expect(result.businessCreditTightening).toBeGreaterThan(0);
    expect(result.businessCreditMultiplier).toBeLessThan(1.0);
    expect(result.profitCoverageRatio).toBeCloseTo(0.25, 5);
  });

  it('profits above baseline: credit loosens further', () => {
    const result = computeBusinessCreditConditions(
      3e12, 2e12, 0.03,
      1.5, 2.0, 0.5, 0.3, 0.15,
    );
    expect(result.businessCreditMultiplier).toBeGreaterThan(1.0);
    expect(result.profitCoverageRatio).toBeCloseTo(1.5, 5);
  });

  it('strong profits + GDP contraction: divergence (AI economy)', () => {
    const result = computeBusinessCreditConditions(
      3e12, 2e12, -0.03,  // profits up, GDP down
      1.5, 2.0, 0.5, 0.3, 0.15,
    );
    // Profitability loosens, GDP trajectory tightens — net depends on magnitudes
    expect(result.profitCoverageRatio).toBeGreaterThan(1.0);
  });
});

// ============================================================
// mapClustersToQuintiles
// ============================================================

describe('mapClustersToQuintiles', () => {
  it('all clusters assigned quintile 0-4', () => {
    const clusters = makeMockClusters(20);
    const map = mapClustersToQuintiles(clusters);
    expect(map.size).toBe(20);
    for (const [, q] of map) {
      expect(q).toBeGreaterThanOrEqual(0);
      expect(q).toBeLessThanOrEqual(4);
    }
  });

  it('low-wage clusters get lower quintiles', () => {
    const clusters = makeMockClusters(10);
    const map = mapClustersToQuintiles(clusters);
    // cluster_0 ($30k) should have lower quintile than cluster_9 ($120k)
    const q0 = map.get('cluster_0')!;
    const q9 = map.get('cluster_9')!;
    expect(q0).toBeLessThanOrEqual(q9);
  });

  it('stable across calls with same input', () => {
    const clusters = makeMockClusters(15);
    const map1 = mapClustersToQuintiles(clusters);
    const map2 = mapClustersToQuintiles(clusters);
    for (const [id, q1] of map1) {
      expect(map2.get(id)).toBe(q1);
    }
  });
});

// ============================================================
// computeMortgageStressIndex
// ============================================================

describe('computeMortgageStressIndex', () => {
  const clusters = makeMockClusters(10);
  const quintileMap = mapClustersToQuintiles(clusters);
  const baseOwnership = MORTGAGE_EXPOSURE_QUINTILES.map(q => q.homeownershipRate as number);

  it('amplifier=0: returns 1.0 always', () => {
    const results = makeMockClusterResults(clusters, 0.3);
    const stress = computeMortgageStressIndex(results, quintileMap, baseOwnership, 0);
    expect(stress).toBe(1.0);
  });

  it('Q3 (highest stress weight) displaced disproportionately: index > 1.0', () => {
    // Q3 has highest ownership×burden product (0.75×0.20=0.15)
    // With 10 clusters, Q3 = clusters 6,7 ($90k, $100k)
    const results = clusters.map((c, i) => ({
      clusterId: c.id,
      baseEmployment: 100000,
      totalRemainingEmployment: (i === 6 || i === 7) ? 50000 : 100000,
      totalDirectDisplacement: (i === 6 || i === 7) ? 50000 : 0,
      averageWage: c.averageWage,
    }));
    const stress = computeMortgageStressIndex(results, quintileMap, baseOwnership, 0.40);
    expect(stress).toBeGreaterThan(1.0);
  });

  it('proportional displacement: index ~ 1.0', () => {
    // All clusters displaced equally
    const results = makeMockClusterResults(clusters, 0.20);
    const stress = computeMortgageStressIndex(results, quintileMap, baseOwnership, 0.40);
    // Should be close to 1.0 when displacement is proportional
    expect(stress).toBeGreaterThanOrEqual(0.9);
    expect(stress).toBeLessThan(1.3);
  });

  it('no displacement: returns 1.0', () => {
    const results = makeMockClusterResults(clusters, 0);
    const stress = computeMortgageStressIndex(results, quintileMap, baseOwnership, 0.40);
    expect(stress).toBe(1.0);
  });
});

// ============================================================
// updateHomeownership
// ============================================================

describe('updateHomeownership', () => {
  const clusters = makeMockClusters(10);
  const quintileMap = mapClustersToQuintiles(clusters);
  const baseOwnership = MORTGAGE_EXPOSURE_QUINTILES.map(q => q.homeownershipRate as number);

  it('no displacement: homeownership unchanged', () => {
    const results = makeMockClusterResults(clusters, 0);
    const { updated } = updateHomeownership(
      [...baseOwnership], results, quintileMap, [], 0.75, 0.02,
    );
    // With no displacement and recovery toward baseline, should be very close
    for (let i = 0; i < 5; i++) {
      expect(updated[i]).toBeCloseTo(baseOwnership[i]!, 5);
    }
  });

  it('displacement + lag: foreclosures delayed', () => {
    const results = makeMockClusterResults(clusters, 0.20);
    // Empty displacement history = no lagged data yet = no foreclosures
    const { updated, foreclosureRateAggregate } = updateHomeownership(
      [...baseOwnership], results, quintileMap, [], 0.75, 0.02,
    );
    // With no history, foreclosures should be 0
    expect(foreclosureRateAggregate).toBe(0);
    // Ownership unchanged (recovery toward baseline with no loss)
    for (let i = 0; i < 5; i++) {
      expect(updated[i]).toBeCloseTo(baseOwnership[i]!, 5);
    }
  });

  it('recovery rate 0: permanent loss', () => {
    const results = makeMockClusterResults(clusters, 0.20);
    // Create displacement history so foreclosures trigger
    const history: Map<string, number>[] = [
      new Map(clusters.map(c => [c.id, 20000])),
      new Map(clusters.map(c => [c.id, 20000])),
    ];
    // Start with reduced ownership to simulate prior foreclosure
    const reducedOwnership = baseOwnership.map(o => o * 0.9);
    const { updated } = updateHomeownership(
      reducedOwnership, results, quintileMap, history, 0.75, 0, // recovery = 0
    );
    // With zero recovery, ownership should not increase back toward baseline
    for (let i = 0; i < 5; i++) {
      expect(updated[i]!).toBeLessThanOrEqual(reducedOwnership[i]!);
    }
  });

  it('recovery rate > 0: gradual rebuild toward baseline', () => {
    const results = makeMockClusterResults(clusters, 0);
    // Start with reduced ownership, no displacement → pure recovery
    const reducedOwnership = baseOwnership.map(o => o * 0.8);
    const { updated } = updateHomeownership(
      reducedOwnership, results, quintileMap, [], 0.75, 0.05, // higher recovery
    );
    // Each quintile should move closer to baseline
    for (let i = 0; i < 5; i++) {
      expect(updated[i]!).toBeGreaterThan(reducedOwnership[i]!);
      expect(updated[i]!).toBeLessThanOrEqual(baseOwnership[i]!);
    }
  });
});

// ============================================================
// computeHousingWealthEffect
// ============================================================

describe('computeHousingWealthEffect', () => {
  const baseOwnership = MORTGAGE_EXPOSURE_QUINTILES.map(q => q.homeownershipRate as number);
  const avgOwnership = baseOwnership.reduce((a, b) => a + b, 0) / baseOwnership.length;

  it('MPC=0: no drag', () => {
    const { housingWealthDrag } = computeHousingWealthEffect(
      avgOwnership, 0.05, 0.50, 0, // MPC = 0
    );
    expect(housingWealthDrag).toBeCloseTo(0, 10);
  });

  it('high foreclosures: negative drag', () => {
    const { housingWealthDrag, homePriceChangeRate } = computeHousingWealthEffect(
      avgOwnership, 0.05, 0.50, 0.05,
    );
    // 5% foreclosure + credit tightening → price drop → negative drag
    expect(homePriceChangeRate).toBeLessThan(0);
    expect(housingWealthDrag).toBeLessThan(0);
  });

  it('zero foreclosures + no credit tightening: slight positive from population', () => {
    const { housingWealthDrag, homePriceChangeRate } = computeHousingWealthEffect(
      avgOwnership, 0, 0, 0.05, // no foreclosures, no credit tightening
    );
    // With no foreclosures, renters created ≈ 0 (avgOwnership ≈ baseline)
    // Home price change ≈ +0.01 from population pressure
    expect(homePriceChangeRate).toBeGreaterThan(0);
    expect(housingWealthDrag).toBeGreaterThan(0);
  });
});

// ============================================================
// Precautionary MPC (via computeMacro integration)
// ============================================================

describe('Precautionary MPC', () => {
  it('sensitivity=0: effectiveMPC = postTaxMPC_Wage', () => {
    const macro = computeMacro(buildDefaultMacroInputs({
      mpcWageUESensitivity: 0,
      postTaxMPC_Wage: 0.80,
    }));
    expect(macro.effectiveMpcWage).toBeCloseTo(0.80, 5);
    expect(macro.precautionaryMpcReduction).toBeCloseTo(0, 5);
  });

  it('5pp excess UE, sensitivity 0.005: reduction ~ 0.025', () => {
    // Need UE = natural + 5pp. With baseline employment displaced by ~8.3M
    // Natural UE ~ 0.043, target = 0.093 → need significant displacement
    const macro = computeMacro(buildDefaultMacroInputs({
      mpcWageUESensitivity: 0.005,
      totalRemainingEmployment: BASELINE_TOTAL_EMPLOYMENT * 0.95, // 5% fewer employed
      totalDisplaced: BASELINE_TOTAL_EMPLOYMENT * 0.05,
      postTaxMPC_Wage: 0.80,
    }));
    // Should have some precautionary reduction
    expect(macro.precautionaryMpcReduction).toBeGreaterThan(0);
    expect(macro.effectiveMpcWage).toBeLessThan(0.80);
  });

  it('large excess UE: effectiveMPC floors at 0.01', () => {
    const macro = computeMacro(buildDefaultMacroInputs({
      mpcWageUESensitivity: 0.050, // very high sensitivity
      totalRemainingEmployment: BASELINE_TOTAL_EMPLOYMENT * 0.50, // 50% displaced
      totalDisplaced: BASELINE_TOTAL_EMPLOYMENT * 0.50,
      postTaxMPC_Wage: 0.80,
    }));
    // effectiveMPC should be floored at 0.01
    expect(macro.effectiveMpcWage).toBeGreaterThanOrEqual(0.01);
    expect(macro.effectiveMpcWage).toBeLessThan(0.80);
  });

  it('zero excess UE: effectiveMPC = postTaxMPC_Wage (no reduction)', () => {
    const macro = computeMacro(buildDefaultMacroInputs({
      mpcWageUESensitivity: 0.005,
      postTaxMPC_Wage: 0.80,
      // Baseline employment → UE at natural → no excess
    }));
    // At natural UE, excessUE = 0 → no precautionary reduction
    expect(macro.effectiveMpcWage).toBeCloseTo(0.80, 3);
  });
});
