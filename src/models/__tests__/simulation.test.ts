/**
 * ATLAS Simulation Orchestrator — Unit Tests
 *
 * Tests the full simulation pipeline defined in src/models/simulation.ts:
 * default configuration, timeline generation, employment trajectories,
 * macro outputs, monetary state, and summary statistics.
 *
 * Strategy:
 *   - Most tests use a small subset of clusters (first 3) for speed.
 *   - One integration-level test uses all clusters.
 *   - Time range shortened to 2025-2035 (11 years) for faster execution.
 *
 * Mathematical invariants under test per DATA_MODEL.md Section 10.
 */

import { describe, it, expect } from 'vitest';
import { getDefaultSimulationConfig, runSimulation } from '@/models/simulation';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import type { SimulationConfig, OccupationCluster } from '@/types';

// ============================================================
// Test Helpers
// ============================================================

/** Use only the first 3 clusters for fast unit tests. */
const SMALL_CLUSTER_SUBSET: OccupationCluster[] = OCCUPATION_CLUSTERS.slice(0, 3);

/** Create a config with a shorter time range for faster tests. */
function shortConfig(overrides?: Partial<SimulationConfig>): SimulationConfig {
  const base = getDefaultSimulationConfig();
  return {
    ...base,
    startYear: 2025,
    endYear: 2035,
    ...overrides,
  };
}

// ============================================================
// getDefaultSimulationConfig
// ============================================================

describe('getDefaultSimulationConfig', () => {
  it('returns valid config with all required fields', () => {
    const config = getDefaultSimulationConfig();

    // Time range
    expect(config.startYear).toBe(2025);
    expect(config.endYear).toBe(2050);
    expect(config.endYear).toBeGreaterThan(config.startYear);

    // Capabilities: all 3 vectors present
    const capIds = Object.keys(config.capabilities);
    expect(capIds).toHaveLength(3);
    expect(capIds).toContain('generative');
    expect(capIds).toContain('agentic');
    expect(capIds).toContain('embodied');

    // Each capability has trajectory params
    for (const id of capIds) {
      const params = config.capabilities[id as keyof typeof config.capabilities];
      expect(params).toBeDefined();
      expect(params.floor).toBeGreaterThanOrEqual(0);
      expect(params.ceiling).toBeLessThanOrEqual(1.5); // some headroom
      expect(params.steepness).toBeGreaterThan(0);
      expect(params.midpointYear).toBeGreaterThanOrEqual(2025);
    }

    // Adoption params
    expect(config.adoptionParams).toBeDefined();
    expect(config.adoptionParams.steepnessByDeployment).toBeDefined();
    expect(config.adoptionParams.competitivePressureMultiplier).toBeGreaterThan(0);

    // Policy config
    expect(config.policyConfig).toBeDefined();
    expect(config.policyConfig.minimumWage).toBeDefined();
    expect(config.policyConfig.ubi).toBeDefined();
    expect(config.policyConfig.sovereignWealthFund).toBeDefined();

    // Macro parameters
    expect(config.baseInflationRate).toBeGreaterThan(0);
    // DEPRECATED: pre-tax mpcWage/mpcAsset/mpcTransfer no longer set by getDefaultSimulationConfig()
    // Post-tax MPCs are now the canonical path (postTaxMPCs.wage/asset/transfer)

    // Population
    expect(config.totalPopulation).toBeGreaterThan(0);
    expect(config.laborForce).toBeGreaterThan(0);
    expect(config.laborForce).toBeLessThan(config.totalPopulation);

    // New job creation
    expect(config.innovationRate).toBeGreaterThan(0);
    expect(config.rdMultiplier).toBeGreaterThan(0);
    expect(config.jobPersistenceFactor).toBeGreaterThan(0);
  });
});

// ============================================================
// runSimulation — Timeline Structure
// ============================================================

describe('runSimulation — timeline structure', () => {
  it('produces timeline with correct number of years', () => {
    const config = shortConfig();
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);

    const expectedYears = config.endYear - config.startYear + 1;
    expect(timeline.years).toHaveLength(expectedYears);
  });

  it('first year of simulation has baseline employment', () => {
    const config = shortConfig();
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);

    const firstYear = timeline.years[0]!;
    expect(firstYear.year).toBe(config.startYear);
    // Employment should be close to baseline distributed across the subset
    expect(firstYear.macro.totalEmployment).toBeGreaterThan(0);
  });

  it('output includes macro data for each year', () => {
    const config = shortConfig();
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);

    for (const yearOutput of timeline.years) {
      expect(yearOutput.macro).toBeDefined();
      expect(yearOutput.macro.year).toBe(yearOutput.year);
      expect(yearOutput.macro.totalEmployment).toBeGreaterThanOrEqual(0);
      expect(yearOutput.macro.gdpNominal).toBeGreaterThanOrEqual(0);
      expect(yearOutput.macro.priceLevel).toBeGreaterThan(0);
      expect(yearOutput.macro.consumerWelfareIndex).toBeGreaterThan(0);
      expect(typeof yearOutput.macro.cyclePhase).toBe('string');
      expect(typeof yearOutput.macro.isDepression).toBe('boolean');
    }
  });

  it('output includes monetary state for each year', () => {
    const config = shortConfig();
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);

    for (const yearOutput of timeline.years) {
      expect(yearOutput.monetary).toBeDefined();
      expect(yearOutput.monetary.moneySupply).toBeGreaterThan(0);
      expect(yearOutput.monetary.velocityOfMoney).toBeGreaterThan(0);
      expect(yearOutput.monetary.priceLevel).toBeGreaterThan(0);
      expect(yearOutput.monetary.realGDP).toBeGreaterThanOrEqual(0);
      expect(typeof yearOutput.monetary.isWithinNeutralZone).toBe('boolean');
    }
  });

  it('output includes cluster results for each year', () => {
    const config = shortConfig();
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);

    for (const yearOutput of timeline.years) {
      expect(yearOutput.clusters).toBeDefined();
      expect(yearOutput.clusters.length).toBe(SMALL_CLUSTER_SUBSET.length);

      for (const cluster of yearOutput.clusters) {
        expect(cluster.clusterId).toBeDefined();
        expect(cluster.totalRemainingEmployment).toBeGreaterThanOrEqual(0);
        expect(cluster.totalDirectDisplacement).toBeGreaterThanOrEqual(0);
        expect(cluster.totalDisplacement).toBeGreaterThanOrEqual(0);
        expect(cluster.averageWage).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

// ============================================================
// runSimulation — Employment Dynamics
// ============================================================

describe('runSimulation — employment dynamics', () => {
  it('total employment should decrease relative to growing baseline with default params', () => {
    const config = shortConfig();
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);

    const firstYear = timeline.years[0]!;
    const lastYear = timeline.years[timeline.years.length - 1]!;

    // Over 2025-2035 with default AI capability trajectories, AI displacement should pull
    // the employment-to-population ratio below its starting level. With the generative
    // (midpoint 2029) and agentic (midpoint 2031) S-curves both past their midpoints by
    // 2035, capabilities are high enough to displace meaningfully within the window, so the
    // ratio declines rather than tracking the growing baseline.
    const firstRatio = firstYear.macro.totalEmployment / firstYear.macro.dynamicPopulation;
    const lastRatio = lastYear.macro.totalEmployment / lastYear.macro.dynamicPopulation;
    expect(lastRatio).toBeLessThan(firstRatio);
  });
});

// ============================================================
// runSimulation — Tipping Point
// ============================================================

describe('runSimulation — cycle detection', () => {
  it('cycle start year or policy window should be detected', () => {
    // Use a longer time range and all clusters to give the model time to detect cycles
    const config = shortConfig({ endYear: 2045 });
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);

    // The cycleStartYear may or may not occur within our range,
    // but the field should be present
    expect('cycleStartYear' in timeline).toBe(true);

    // If detected, it should be within the simulation range
    if (timeline.cycleStartYear !== null) {
      expect(timeline.cycleStartYear).toBeGreaterThanOrEqual(config.startYear);
      expect(timeline.cycleStartYear).toBeLessThanOrEqual(config.endYear);
    }

    // fiscalWindowClose should also be present
    expect('fiscalWindowClose' in timeline).toBe(true);
    if (timeline.fiscalWindowClose !== null) {
      expect(timeline.fiscalWindowClose).toBeGreaterThanOrEqual(config.startYear);
      expect(timeline.fiscalWindowClose).toBeLessThanOrEqual(config.endYear);
    }
  });
});

// ============================================================
// runSimulation — GDP
// ============================================================

describe('runSimulation — GDP', () => {
  it('GDP should initially be positive', () => {
    const config = shortConfig();
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);

    const firstYear = timeline.years[0]!;
    expect(firstYear.macro.gdpNominal).toBeGreaterThan(0);
    expect(firstYear.macro.gdpReal).toBeGreaterThan(0);
  });
});

// ============================================================
// runSimulation — Edge Cases
// ============================================================

describe('runSimulation — edge cases', () => {
  it('single year simulation works', () => {
    const config = shortConfig({ startYear: 2025, endYear: 2025 });
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);

    expect(timeline.years).toHaveLength(1);
    expect(timeline.years[0]!.year).toBe(2025);
    expect(timeline.years[0]!.macro.totalEmployment).toBeGreaterThan(0);
    expect(timeline.years[0]!.macro.gdpNominal).toBeGreaterThan(0);
  });
});

// ============================================================
// runSimulation — Summary
// ============================================================

describe('runSimulation — summary', () => {
  it('contains peakEmployment and minimumEmployment', () => {
    const config = shortConfig();
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);

    expect(timeline.summary).toBeDefined();

    // Peak employment
    expect(timeline.summary.peakEmployment).toBeDefined();
    expect(timeline.summary.peakEmployment.year).toBeGreaterThanOrEqual(config.startYear);
    expect(timeline.summary.peakEmployment.year).toBeLessThanOrEqual(config.endYear);
    expect(timeline.summary.peakEmployment.value).toBeGreaterThan(0);

    // Minimum employment
    expect(timeline.summary.minimumEmployment).toBeDefined();
    expect(timeline.summary.minimumEmployment.year).toBeGreaterThanOrEqual(config.startYear);
    expect(timeline.summary.minimumEmployment.year).toBeLessThanOrEqual(config.endYear);
    expect(timeline.summary.minimumEmployment.value).toBeGreaterThanOrEqual(0);

    // Peak >= minimum
    expect(timeline.summary.peakEmployment.value).toBeGreaterThanOrEqual(
      timeline.summary.minimumEmployment.value,
    );

    // Other summary fields
    expect(timeline.summary.peakGDP).toBeDefined();
    expect(timeline.summary.minimumGDP).toBeDefined();
    expect(timeline.summary.maxUnemploymentRate).toBeDefined();
    expect(typeof timeline.summary.policyPreventsDepression).toBe('boolean');
  });
});

// ============================================================
// Integration: Full cluster set (slower test)
// ============================================================

// ============================================================
// Scarcity Inflation — Corrected Demand for Human Workers
// ============================================================

describe('scarcity inflation — AI-adjusted demand', () => {
  it('high displacement cluster produces zero scarcity even with high demand survival', () => {
    // Software cluster: 90%+ displaced by 2045 — AI fills the gap
    const config = shortConfig({ endYear: 2050 });
    const timeline = runSimulation(config, OCCUPATION_CLUSTERS);

    // Find a late year with high displacement
    const year2045 = timeline.years.find(y => y.year === 2045);
    expect(year2045).toBeDefined();

    // Scarcity inflation should be very small (< 2%) even at high unemployment
    expect(year2045!.macro.scarcityInflation).toBeLessThan(0.02);
  });

  it('low displacement + high demand still produces near-zero scarcity', () => {
    // Early years: most clusters have low displacement, demand survival near 1.0
    // With enough humans remaining, scarcity should be near zero
    const config = shortConfig({ endYear: 2035 });
    const timeline = runSimulation(config, OCCUPATION_CLUSTERS);

    for (const yearOutput of timeline.years) {
      // In early years (2025-2035), scarcity should be minimal
      expect(yearOutput.macro.scarcityInflation).toBeLessThan(0.01);
    }
  });

  it('UBI voluntary withdrawal creates slightly higher scarcity than no-policy', () => {
    // With UBI, some workers voluntarily withdraw → genuine scarcity in low-displacement sectors
    const baseConfig = shortConfig({ endYear: 2045 });
    const baseTimeline = runSimulation(baseConfig, OCCUPATION_CLUSTERS);

    const ubiConfig = shortConfig({
      endYear: 2045,
      policyConfig: {
        ...baseConfig.policyConfig,
        ubi: {
          ...baseConfig.policyConfig.ubi,
          enabled: true,
          monthlyAmount: { keyframes: [{ year: 2025, value: 1000 }] },
        },
      },
    });
    const ubiTimeline = runSimulation(ubiConfig, OCCUPATION_CLUSTERS);

    // At 2040, UBI scarcity should be >= no-policy scarcity (withdrawal creates tightness)
    const baseYear2040 = baseTimeline.years.find(y => y.year === 2040);
    const ubiYear2040 = ubiTimeline.years.find(y => y.year === 2040);
    expect(baseYear2040).toBeDefined();
    expect(ubiYear2040).toBeDefined();
    expect(ubiYear2040!.macro.scarcityInflation).toBeGreaterThanOrEqual(
      baseYear2040!.macro.scarcityInflation,
    );
  });

  it('full simulation to 2050: scarcity inflation < 2% at 2040+', () => {
    const config = shortConfig({ endYear: 2050 });
    const timeline = runSimulation(config, OCCUPATION_CLUSTERS);

    for (const yearOutput of timeline.years) {
      if (yearOutput.year >= 2040) {
        expect(yearOutput.macro.scarcityInflation).toBeLessThan(0.02);
      }
    }
  });

  it('net inflation is finite for all years including 2045+', () => {
    const config = shortConfig({ endYear: 2050 });
    const timeline = runSimulation(config, OCCUPATION_CLUSTERS);

    // Phase 7: Fiscal-monetary dynamics produce persistent inflation from debt spiral.
    // AI deflation no longer dominates in late years because fiscal deficits generate
    // monetization-driven inflation. Verify all values are finite (no NaN/Infinity).
    const lateYears = timeline.years.filter(y => y.year >= 2045);
    expect(lateYears.length).toBeGreaterThan(0);
    for (const yearOutput of lateYears) {
      expect(Number.isFinite(yearOutput.macro.netInflation)).toBe(true);
      expect(Number.isFinite(yearOutput.macro.priceLevel)).toBe(true);
      expect(Number.isFinite(yearOutput.macro.gdpNominal)).toBe(true);
    }
  });
});

// ============================================================
// Integration: Full cluster set (slower test)
// ============================================================

describe('runSimulation — integration with all clusters', () => {
  it('runs successfully with all occupation clusters', () => {
    const config = shortConfig({ endYear: 2030 }); // Short range for speed
    const timeline = runSimulation(config, OCCUPATION_CLUSTERS);

    expect(timeline.years).toHaveLength(6); // 2025-2030
    expect(timeline.summary).toBeDefined();
    expect(timeline.summary.peakEmployment.value).toBeGreaterThan(0);

    // Each year should have results for all clusters
    for (const yearOutput of timeline.years) {
      expect(yearOutput.clusters.length).toBe(OCCUPATION_CLUSTERS.length);
    }
  });
});

// ============================================================
// Phase 5i: Housing, Shelter Inflation & Mortgage Stress Integration
// ============================================================

describe('runSimulation — Phase 5i housing integration', () => {
  it('shelterCPIWeight=0: compositeInflation = goodsInflation', () => {
    const config = shortConfig({ shelterCPIWeight: 0 });
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);
    for (const y of timeline.years) {
      // When shelter weight is 0, composite = 0*shelter + 1*goods = goods
      expect(y.macro.compositeInflation).toBeCloseTo(y.macro.goodsInflation, 10);
    }
  });

  it('mortgageStressAmplifier=0: stress index = 1.0', () => {
    const config = shortConfig({ mortgageStressAmplifier: 0 });
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);
    for (const y of timeline.years) {
      expect(y.macro.mortgageStressIndex).toBe(1.0);
    }
  });

  it('housingWealthMPC=0: no wealth effect', () => {
    const config = shortConfig({ housingWealthMPC: 0 });
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);
    for (const y of timeline.years) {
      expect(y.macro.housingWealthDrag).toBeCloseTo(0, 10);
    }
  });

  it('mpcWageUESensitivity=0: effectiveMPC = post-tax MPC wage', () => {
    const config = shortConfig({ mpcWageUESensitivity: 0 });
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);
    const expectedMpc = config.postTaxMPCs?.wage ?? 0.95;
    for (const y of timeline.years) {
      expect(y.macro.effectiveMpcWage).toBeCloseTo(expectedMpc, 5);
      expect(y.macro.precautionaryMpcReduction).toBeCloseTo(0, 5);
    }
  });

  it('creditAdoptionSensitivity=0: no credit adoption acceleration', () => {
    const config = shortConfig({ creditAdoptionSensitivity: 0 });
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);
    for (const y of timeline.years) {
      expect(y.macro.creditAdoptionAcceleration).toBe(0);
    }
  });

  it('compositeInflation = weight * shelter + (1-weight) * goods every year', () => {
    const config = shortConfig({ shelterCPIWeight: 0.36 });
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);
    for (const y of timeline.years) {
      const expected = 0.36 * y.macro.shelterInflation + 0.64 * y.macro.goodsInflation;
      expect(y.macro.compositeInflation).toBeCloseTo(expected, 10);
    }
  });

  it('zero displacement baseline: housing outputs neutral', () => {
    // With no displacement, first year should have baseline/neutral housing outputs
    const config = shortConfig();
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);
    const firstYear = timeline.years[0]!;

    // Mortgage stress = 1.0 at baseline (no disproportionate displacement)
    expect(firstYear.macro.mortgageStressIndex).toBeCloseTo(1.0, 2);
    // Homeownership near baseline
    expect(firstYear.macro.avgHomeownership).toBeGreaterThan(0.4);
    expect(firstYear.macro.avgHomeownership).toBeLessThan(0.9);
    // Foreclosure rate should be 0 or very small at start
    expect(firstYear.macro.foreclosureRateAggregate).toBeGreaterThanOrEqual(0);
    expect(firstYear.macro.foreclosureRateAggregate).toBeLessThan(0.01);
  });

  it('all Phase 5i MacroOutput fields are finite numbers', () => {
    const config = shortConfig({ endYear: 2040 });
    const timeline = runSimulation(config, SMALL_CLUSTER_SUBSET);
    for (const y of timeline.years) {
      expect(Number.isFinite(y.macro.consumerCreditTightening)).toBe(true);
      expect(Number.isFinite(y.macro.businessCreditTightening)).toBe(true);
      expect(Number.isFinite(y.macro.goodsInflation)).toBe(true);
      expect(Number.isFinite(y.macro.shelterInflation)).toBe(true);
      expect(Number.isFinite(y.macro.compositeInflation)).toBe(true);
      expect(Number.isFinite(y.macro.mortgageStressIndex)).toBe(true);
      expect(Number.isFinite(y.macro.homePriceChangeRate)).toBe(true);
      expect(Number.isFinite(y.macro.housingWealthDrag)).toBe(true);
      expect(Number.isFinite(y.macro.effectiveMpcWage)).toBe(true);
      expect(Number.isFinite(y.macro.creditAdoptionAcceleration)).toBe(true);
      expect(Number.isFinite(y.macro.homeownershipQ1)).toBe(true);
      expect(Number.isFinite(y.macro.avgHomeownership)).toBe(true);
    }
  });

  // ----------------------------------------------------------
  // Monetary Collapse — early exit + fill
  // ----------------------------------------------------------
  describe('Monetary Collapse', () => {
    it('baseline simulation does not trigger monetary collapse (LOLR prevents yield spiral)', () => {
      const config = getDefaultSimulationConfig();
      const timeline = runSimulation(config, OCCUPATION_CLUSTERS);
      // Phase 8 fix 2: The lender-of-last-resort mechanism (Case 6) prevents
      // the yield spiral that previously caused monetary collapse under balanced
      // pragmatism. The central bank absorbs bonds when yields hit crisis levels,
      // producing elevated but bounded inflation instead of hyperinflation.
      expect(timeline.monetaryCollapseYear).toBeNull();
    });

    it('years array has full length even with collapse (filled with frozen data)', () => {
      const config = getDefaultSimulationConfig();
      const timeline = runSimulation(config, OCCUPATION_CLUSTERS);
      const expectedLength = config.endYear - config.startYear + 1;
      expect(timeline.years.length).toBe(expectedLength);
    });
  });

  // ----------------------------------------------------------
  // Phase 8a: Fiscal Response Profiles Integration
  // ----------------------------------------------------------
  describe('Phase 8a: Fiscal Response Profiles', () => {
    it('realGDPGrowthRate appears in macro output', () => {
      const config = getDefaultSimulationConfig();
      const timeline = runSimulation(config, OCCUPATION_CLUSTERS);
      for (const y of timeline.years) {
        expect(y.macro.realGDPGrowthRate).toBeDefined();
        expect(typeof y.macro.realGDPGrowthRate).toBe('number');
      }
    });

    it('fiscal consolidation fields appear in fiscal state', () => {
      const config = getDefaultSimulationConfig();
      const timeline = runSimulation(config, OCCUPATION_CLUSTERS);
      // Check a later year where consolidation might be active
      const lastYear = timeline.years[timeline.years.length - 1]!;
      const fiscal = lastYear.fiscalMonetary?.fiscal;
      expect(fiscal).toBeDefined();
      expect(typeof fiscal!.consolidationIntensity).toBe('number');
      expect(typeof fiscal!.discretionaryMultiplier).toBe('number');
      expect(typeof fiscal!.obligationMultiplier).toBe('number');
      expect(typeof fiscal!.revenueMultiplier).toBe('number');
      expect(typeof fiscal!.effectiveCOLAFactor).toBe('number');
    });

    it('real demand ratios appear in year output', () => {
      const config = getDefaultSimulationConfig();
      const timeline = runSimulation(config, OCCUPATION_CLUSTERS);
      const y = timeline.years[5]!;
      expect(typeof y.realConsumerDemandRatio).toBe('number');
      expect(typeof y.realGovDemandRatio).toBe('number');
      expect(typeof y.realBusinessDemandRatio).toBe('number');
    });

    it('no_fiscal_response profile avoids austerity-driven collapse (Keynesian paradox)', () => {
      const config = getDefaultSimulationConfig();
      config.fiscalPolicyPreset = 'no_fiscal_response';
      const timeline = runSimulation(config, OCCUPATION_CLUSTERS);
      // Counter-intuitively, no_fiscal_response avoids collapse because it maintains
      // government spending (no consolidation cuts). The balanced_reduction
      // profile's spending cuts depress GDP further, triggering the fiscal
      // death spiral. This demonstrates the Keynesian austerity paradox.
      expect(timeline.monetaryCollapseYear).toBeNull();
    });

    it('default fiscalPolicyPreset is balanced_reduction', () => {
      const config = getDefaultSimulationConfig();
      expect(config.fiscalPolicyPreset).toBe('balanced_reduction');
    });
  });
});

// ============================================================
// Phase 8 Fix 5: Integration Verification
// ============================================================

describe('Phase 8 Fix 5: Zero-AI Baseline Stability', () => {
  it('zero-AI: no hyperinflation or catastrophic collapse', () => {
    const config = getDefaultSimulationConfig();
    // Set all capabilities to zero — no AI displacement
    for (const vecId of Object.keys(config.capabilities) as Array<keyof typeof config.capabilities>) {
      config.capabilities[vecId] = { ...config.capabilities[vecId], floor: 0, ceiling: 0 };
    }

    const timeline = runSimulation(config, OCCUPATION_CLUSTERS);

    // GDP should stay within reasonable bounds over 25 years — no hyperinflation (>1000T)
    // and no complete collapse (<1T)
    for (const y of timeline.years) {
      expect(y.macro.gdpNominal).toBeGreaterThan(1_000_000_000_000); // > $1T
      expect(y.macro.gdpNominal).toBeLessThan(1_000_000_000_000_000); // < $1000T
      // Employment should not collapse
      expect(y.macro.totalEmployment).toBeGreaterThan(50_000_000);
    }

    // By 2035, GDP should not have hyperinflated (the main Fix 5 regression)
    const y2035 = timeline.years.find(y => y.year === 2035);
    if (y2035) {
      expect(y2035.macro.gdpNominal).toBeLessThan(1_000_000_000_000_000); // < $1000T (no hyperinflation)
      expect(y2035.macro.gdpNominal).toBeGreaterThan(5_000_000_000_000); // > $5T (not total collapse)
    }
  });

  it('zero-AI: credit tightening stays near zero through 2030', () => {
    const config = getDefaultSimulationConfig();
    for (const vecId of Object.keys(config.capabilities) as Array<keyof typeof config.capabilities>) {
      config.capabilities[vecId] = { ...config.capabilities[vecId], floor: 0, ceiling: 0 };
    }

    const timeline = runSimulation(config, OCCUPATION_CLUSTERS);

    // For years 2025-2030 (first 6 years), credit channels should not trigger badly
    for (let i = 0; i < Math.min(6, timeline.years.length); i++) {
      const y = timeline.years[i]!;
      // Consumer credit multiplier should be near 1.0 (no severe tightening)
      expect(y.macro.consumerCreditMultiplier).toBeGreaterThan(0.90);
      // Income adequacy ratio should not signal severe deficiency
      expect(y.macro.incomeAdequacyRatio).toBeGreaterThan(0.80);
    }
  });

  // DEPRECATED: nominalWageGrowth is now always 0 (wage growth chain removed)
  // Wage growth is embedded in wageBase = prevNomGDP × BASELINE_WAGE_SHARE × (1 + productivity)

  it('zero-AI: home prices are stable (no crash)', () => {
    const config = getDefaultSimulationConfig();
    for (const vecId of Object.keys(config.capabilities) as Array<keyof typeof config.capabilities>) {
      config.capabilities[vecId] = { ...config.capabilities[vecId], floor: 0, ceiling: 0 };
    }

    const timeline = runSimulation(config, OCCUPATION_CLUSTERS);

    // Home price index should not crash deeply
    for (let i = 0; i < Math.min(6, timeline.years.length); i++) {
      const y = timeline.years[i]!;
      // Home prices should not crash catastrophically — stay above 0.80
      expect(y.macro.homePriceIndex).toBeGreaterThan(0.80);
      // Price change should not be deeply negative (allow some dips from rate movements)
      expect(y.macro.homePriceChangeRate).toBeGreaterThan(-0.10);
    }
  });

  it('AI displacement: Phillips Mechanism 2 produces scarcity-aware wage pressure at high unemployment (Phase 10.A)', () => {
    // Phase 10.A: Phillips is now mechanism-aware. When unemployment is primarily AI-driven
    // (high aiShare), the classic Phillips pressure is dampened by (1 - aiShare) and the
    // scarcity premium kicks in — so wagePressure can legitimately exceed 1.0 at high UE
    // (remaining workers in high-difficulty roles command a premium).
    //
    // This test now asserts:
    //   - gap above NAIRU is large when UE > 15%
    //   - wagePressure is a NUMBER (not NaN/Inf) and reflects the mechanism — its direction
    //     depends on the AI share and aggregate replacement-difficulty premium.
    const config = getDefaultSimulationConfig();
    const timeline = runSimulation(config, OCCUPATION_CLUSTERS);
    const highUEYear = timeline.years.find(y => y.macro.unemploymentRate > 0.15);
    if (highUEYear) {
      const gap = highUEYear.macro.unemploymentRate - 0.044;
      expect(gap).toBeGreaterThan(0.10);
      expect(highUEYear.macro.wagePressure).toBeGreaterThan(0);
      expect(Number.isFinite(highUEYear.macro.wagePressure)).toBe(true);
    }
  });
});
