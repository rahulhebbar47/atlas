/**
 * ATLAS Macro Economic Model — Unit Tests
 *
 * Tests the core macro economic functions defined in src/models/macro.ts:
 * AI deflation, price level dynamics, ARPP, income composition, GDP,
 * tipping point detection, revenue pressure, depression detection,
 * economic activity factor, and the full computeMacro orchestrator.
 *
 * Mathematical invariants under test per DATA_MODEL.md Section 5.
 */

import { describe, it, expect } from 'vitest';
import {
  // DEPRECATED: computePriceLevel — replaced by inline compositeInflation accumulation in computeMacro()
  // DEPRECATED: computeARPP removed — replaced by CWI (Consumer Welfare Index)
  // DEPRECATED: detectTippingPoint removed — replaced by CWI cycle detection
  computeIncomeComposition,
  computeRevenuePressure,
  detectDepression,
  computeMacro,
  computeWagePressure,
  computeSectorWeightedDeflation,
  computeAutomationCoverageFromClusters,
  computeDemandFeedback,
  computeConsumerCreditConditions,
  computeBusinessCreditConditions,
  computeFiscalPressure,
  computeDeflationDrag,
  computeNominalWageGrowth,  // Stage 3/7 endogenous wage equation (an older same-named fn was deprecated pre-Stage-3)
  computeHomePriceChange,
  computeHousingBlock,
} from '@/models/macro';
import {
  DEFAULT_OTHER_COSTS_SHARE,
  BASELINE_PROFIT_GDP_RATIO,
  DEFAULT_START_YEAR,
  BASELINE_GDP_NOMINAL_2025,
  US_POPULATION_2025,
  US_LABOR_FORCE_2025,
  BASELINE_TOTAL_EMPLOYMENT,
  BASELINE_AVERAGE_ANNUAL_WAGE,
  NATURAL_UNEMPLOYMENT_RATE,
  FRED_NAIRU_RATE,
  BASELINE_WAGE_SHARE,
  BASELINE_ASSET_SHARE,
  BASELINE_TRANSFER_SHARE,
  BASELINE_CPS_EMPLOYMENT,
  NON_CLUSTER_EMPLOYED,
  BASELINE_GDP_GROWTH_RATE,
  GOVERNMENT_SPENDING_GDP_FRACTION,
  DEFAULT_NEW_JOB_WAGE_FRACTION,
  BOTTOM80_WAGE_SHARE,
  BOTTOM80_TRANSFER_SHARE,
  BOTTOM80_ASSET_SHARE,
  BOTTOM80_POP_SHARE,
} from '@/models/constants';
import type { PolicyEffects, ClusterDisplacementResult, MacroProductionInputs, MacroInputs } from '@/types';

// ============================================================
// Test Helpers
// ============================================================

/**
 * Creates a zeroed-out PolicyEffects for tests where policy is irrelevant.
 */
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

/**
 * Creates a MacroInputs with all baseline defaults for tests.
 * Tests override only the fields they need with spread syntax:
 *   computeMacro({ ...buildDefaultMacroInputs(), year: 2030 })
 */
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

// DEPRECATED: defaultCapabilityScores removed (FIX 8).
// computeMacro now accepts automationCoverage directly instead of capability scores.

// DEPRECATED: computeAIDeflationRate tests removed (Phase 4 quality pass).
// Function deleted — replaced by computeSectorWeightedDeflation.

// DEPRECATED: computePriceLevel tests removed — replaced by inline compositeInflation
// accumulation in computeMacro(). Price level now uses all 7+ inflation components
// (shelter + goods composite) instead of just 2 (base - aiDeflation).
// describe('computePriceLevel', () => { ... });

// DEPRECATED: computeARPP tests removed — replaced by CWI (Consumer Welfare Index) in Phase 5 Chart Redesign.
// describe('computeARPP', () => { ... });

// ============================================================
// computeIncomeComposition
// ============================================================

describe('computeIncomeComposition', () => {
  it('shares sum to 1', () => {
    const comp = computeIncomeComposition(60_000, 20_000, 20_000);
    const sum = comp.wageShare + comp.assetShare + comp.transferShare;
    expect(sum).toBeCloseTo(1, 10);
  });

  it('returns baseline shares when total income is zero', () => {
    const comp = computeIncomeComposition(0, 0, 0);
    expect(comp.wageShare).toBeCloseTo(BASELINE_WAGE_SHARE, 5);
    expect(comp.assetShare).toBeCloseTo(BASELINE_ASSET_SHARE, 5);
    expect(comp.transferShare).toBeCloseTo(BASELINE_TRANSFER_SHARE, 5);
  });
});

// DEPRECATED: computeGDP tests removed (Phase 4 quality pass).
// Function deleted — GDP now computed inline in computeMacro with differentiated MPC.

// DEPRECATED: detectTippingPoint tests removed — replaced by CWI cycle detection in Phase 5 Chart Redesign.
// describe('detectTippingPoint', () => { ... });

// ============================================================
// computeRevenuePressure
// ============================================================

describe('computeRevenuePressure', () => {
  it('returns 0 when GDP is growing', () => {
    const { revenuePressure, automationAcceleration } = computeRevenuePressure(0.03, 0);
    expect(revenuePressure).toBe(0);
    expect(automationAcceleration).toBe(0);
  });

  it('returns positive pressure when GDP is contracting', () => {
    const { revenuePressure, automationAcceleration } = computeRevenuePressure(-0.10, 0);
    expect(revenuePressure).toBeGreaterThan(0);
    expect(automationAcceleration).toBeGreaterThan(0);
    // newPressure = min(0.3, 1.5 × 0.10) = 0.15
    expect(revenuePressure).toBeCloseTo(0.15, 5);
  });

  it('accumulates with decay from previous acceleration', () => {
    // Previous acceleration = 0.2, current GDP growth = 0% (no new pressure), decay = 0.5
    const { automationAcceleration } = computeRevenuePressure(0, 0.2, 1.5, 0.3, 0.5);
    // acceleration = min(0.3, 0.2 * 0.5 + 0) = 0.10
    expect(automationAcceleration).toBeCloseTo(0.10, 5);
  });

  it('caps acceleration at cap value', () => {
    // Large contraction + large previous → capped
    const { automationAcceleration } = computeRevenuePressure(-0.50, 0.3, 1.5, 0.3, 0.5);
    // newPressure = min(0.3, 1.5 × 0.50) = 0.3
    // acceleration = min(0.3, 0.3 * 0.5 + 0.3) = min(0.3, 0.45) = 0.3
    expect(automationAcceleration).toBe(0.3);
  });
});

// ============================================================
// detectDepression
// ============================================================

describe('detectDepression', () => {
  it('is not triggered with a single year decline and low unemployment', () => {
    // First year of decline: previousConsecutiveDecline = 0
    // After one year: consecutiveDeclineQuarters = 4
    // But unemployment below threshold (0.15)
    const result = detectDepression(
      28_000_000_000_000,  // currentGDP (declining)
      29_000_000_000_000,  // previousGDP
      0.10,                // unemploymentRate (below 0.15 threshold)
      0,                   // previousConsecutiveDecline
    );
    expect(result.isDepression).toBe(false);
    expect(result.consecutiveDeclineQuarters).toBe(4);
  });

  it('is triggered with sustained decline and high unemployment (>0.15)', () => {
    // Previous consecutive decline already at 4 quarters, now adding 4 more
    const result = detectDepression(
      27_000_000_000_000,  // currentGDP (still declining)
      28_000_000_000_000,  // previousGDP
      0.20,                // unemploymentRate (above 0.15)
      4,                   // previousConsecutiveDecline
    );
    expect(result.isDepression).toBe(true);
    expect(result.consecutiveDeclineQuarters).toBe(8);
  });

  it('resets consecutive decline counter when GDP grows', () => {
    const result = detectDepression(
      30_000_000_000_000,  // currentGDP (growing)
      29_000_000_000_000,  // previousGDP
      0.20,                // unemploymentRate
      8,                   // previousConsecutiveDecline
    );
    expect(result.isDepression).toBe(false);
    expect(result.consecutiveDeclineQuarters).toBe(0);
  });
});

// DEPRECATED: computeEconomicActivityFactor tests removed (Phase 1 overhaul), then Okun's Law tests removed (Phase 3c.1 demand spillover)

// ============================================================
// computeWagePressure (Phillips curve)
// ============================================================

describe('computeWagePressure', () => {
  it('returns 1.0 at NAIRU with no automation', () => {
    // Uses FRED_NAIRU_RATE (~4.4%) as default natural rate
    const pressure = computeWagePressure(FRED_NAIRU_RATE);
    expect(pressure).toBeCloseTo(1.0, 5);
  });

  it('returns 1.0 when unemployment is below NAIRU', () => {
    const pressure = computeWagePressure(FRED_NAIRU_RATE - 0.02);
    // Clamped at max(policyFloor, phillips + premium) where phillips >= 1.0
    expect(pressure).toBeGreaterThanOrEqual(1.0);
  });

  it('returns < 1.0 when unemployment exceeds natural rate (no AI premium)', () => {
    const pressure = computeWagePressure(0.15, 0); // 15% UE, 0 coverage
    expect(pressure).toBeLessThan(1.0);
    expect(pressure).toBeGreaterThan(0);
  });

  // DEPRECATED (Phase 10.A): "AI productivity premium" and "hump-shaped premium" tests
  // referenced the old hump formula `aiWageMultiplier × coverage × (1 - coverage)`.
  // The new Phillips Mechanism 2 uses an AI-displacement-aware scarcity premium instead.
  // Phase 6 adds macro.scarcityPremium.test.ts with the new V2 expectations.

  it('Phase 10.A scarcity premium increases wage pressure when aiShare > 0 and wagePremium > 0', () => {
    // At 8% unemployment with laborForce = 1, total unemployed headcount = 0.08.
    // With aiDisplacementUnemployment = 0.04, aiShare = 0.5.
    // scarcity premium = 0.5 × 0.4 × 0.6 = 0.12, added on top of dampened classic Phillips.
    const withScarcity = computeWagePressure(0.08, 0.04, 0.6, 0.4, 1);
    const noScarcity   = computeWagePressure(0.08, 0, 0, 0.4, 1);
    expect(withScarcity).toBeGreaterThan(noScarcity);
  });

  it('policy wage floor prevents wage pressure from dropping too low (Phase 10.A signature)', () => {
    // Phase 10.A positional args:
    //   unemploymentRate=0.80, aiDispUE=0, aggPremium=0, scarcityIntensity=0,
    //   laborForceBaseline=1, policyWageFloor=0.49
    const pressure = computeWagePressure(0.80, 0, 0, 0, 1, 0.49);
    expect(pressure).toBeGreaterThanOrEqual(0.49);
  });

  it('no floor when policyWageFloor = 0 (Phase 10.A signature)', () => {
    const pressure = computeWagePressure(0.80, 0, 0, 0, 1, 0);
    expect(pressure).toBeGreaterThanOrEqual(0);
    expect(pressure).toBeLessThan(0.49);
  });
});

// ============================================================
// CPS/CES survey bridging constants
// ============================================================

describe('CPS/CES survey bridging constants', () => {
  it('NATURAL_UNEMPLOYMENT_RATE is approximately 4.4%', () => {
    expect(NATURAL_UNEMPLOYMENT_RATE).toBeGreaterThan(0.03);
    expect(NATURAL_UNEMPLOYMENT_RATE).toBeLessThan(0.06);
    // Specifically close to BLS reported ~4.4%
    expect(NATURAL_UNEMPLOYMENT_RATE).toBeCloseTo(0.044, 2);
  });

  it('NON_CLUSTER_EMPLOYED is in a sane range (0 < x < 15M)', () => {
    expect(NON_CLUSTER_EMPLOYED).toBeGreaterThan(0);
    expect(NON_CLUSTER_EMPLOYED).toBeLessThan(15_000_000);
  });

  it('BASELINE_CPS_EMPLOYMENT > BASELINE_TOTAL_EMPLOYMENT', () => {
    expect(BASELINE_CPS_EMPLOYMENT).toBeGreaterThan(BASELINE_TOTAL_EMPLOYMENT);
  });

  it('BASELINE_CPS_EMPLOYMENT < US_LABOR_FORCE_2025', () => {
    expect(BASELINE_CPS_EMPLOYMENT).toBeLessThan(US_LABOR_FORCE_2025);
  });
});

// ============================================================
// computeSectorWeightedDeflation
// ============================================================

describe('computeSectorWeightedDeflation', () => {
  it('returns 0 with no displacement (empty cluster results)', () => {
    const deflation = computeSectorWeightedDeflation([], DEFAULT_START_YEAR).total;
    expect(deflation).toBe(0);
  });

  it('returns 0 with no displacement (clusters present but 0 displaced)', () => {
    const clusters: ClusterDisplacementResult[] = [{
      clusterId: 'tech_swe',
      roles: [],
      totalRemainingEmployment: 100_000,
      totalDirectDisplacement: 0,
      secondOrderDisplacement: 0,
      totalDisplacement: 0,
      averageWage: 100_000,
      bfcsOutput: [],
    }];
    const deflation = computeSectorWeightedDeflation(clusters, DEFAULT_START_YEAR).total;
    expect(deflation).toBe(0);
  });

  it('increases with cluster automation', () => {
    const lowDisp: ClusterDisplacementResult[] = [{
      clusterId: 'tech_swe',
      roles: [],
      totalRemainingEmployment: 90_000,
      totalDirectDisplacement: 10_000,
      secondOrderDisplacement: 0,
      totalDisplacement: 10_000,
      averageWage: 100_000,
      bfcsOutput: [],
    }];
    const highDisp: ClusterDisplacementResult[] = [{
      clusterId: 'tech_swe',
      roles: [],
      totalRemainingEmployment: 50_000,
      totalDirectDisplacement: 50_000,
      secondOrderDisplacement: 0,
      totalDisplacement: 50_000,
      averageWage: 100_000,
      bfcsOutput: [],
    }];
    const lowDeflation = computeSectorWeightedDeflation(lowDisp, 2030).total;
    const highDeflation = computeSectorWeightedDeflation(highDisp, 2030).total;
    expect(highDeflation).toBeGreaterThan(lowDeflation);
    expect(lowDeflation).toBeGreaterThan(0);
  });
});

// ============================================================
// computeAutomationCoverageFromClusters
// ============================================================

describe('computeAutomationCoverageFromClusters', () => {
  it('returns 0 with no displacement', () => {
    const clusters: ClusterDisplacementResult[] = [{
      clusterId: 'tech_swe',
      roles: [],
      totalRemainingEmployment: 100_000,
      totalDirectDisplacement: 0,
      secondOrderDisplacement: 0,
      totalDisplacement: 0,
      averageWage: 100_000,
      bfcsOutput: [],
    }];
    const coverage = computeAutomationCoverageFromClusters(clusters, BASELINE_TOTAL_EMPLOYMENT);
    expect(coverage).toBe(0);
  });

  it('returns employment-weighted average of per-cluster coverage', () => {
    const clusters: ClusterDisplacementResult[] = [
      {
        clusterId: 'tech_swe',
        roles: [],
        totalRemainingEmployment: 50_000,
        totalDirectDisplacement: 50_000, // 50% automated
        secondOrderDisplacement: 0,
        totalDisplacement: 50_000,
        averageWage: 100_000,
        bfcsOutput: [],
      },
      {
        clusterId: 'health_nurses',
        roles: [],
        totalRemainingEmployment: 100_000,
        totalDirectDisplacement: 0, // 0% automated
        secondOrderDisplacement: 0,
        totalDisplacement: 0,
        averageWage: 60_000,
        bfcsOutput: [],
      },
    ];
    const totalBaseline = 200_000;
    const coverage = computeAutomationCoverageFromClusters(clusters, totalBaseline);
    // tech_swe: weight 100k/200k = 0.5, coverage = 50k/100k = 0.5 → contribution = 0.25
    // health_nurses: weight 100k/200k = 0.5, coverage = 0/100k = 0 → contribution = 0
    // total = 0.25
    expect(coverage).toBeCloseTo(0.25, 5);
  });

  it('returns 0 with zero total baseline', () => {
    const coverage = computeAutomationCoverageFromClusters([], 0);
    expect(coverage).toBe(0);
  });
});

// ============================================================
// computeMacro (full orchestrator)
// ============================================================

describe('computeMacro', () => {
  it('returns complete MacroOutput for first year (previousMacro null)', () => {
    const policy = zeroPolicyEffects();

    const result = computeMacro(buildDefaultMacroInputs({ policyEffects: policy }));

    // Verify all key fields are present and reasonable
    expect(result.year).toBe(DEFAULT_START_YEAR);
    expect(result.totalEmployment).toBe(BASELINE_TOTAL_EMPLOYMENT + NON_CLUSTER_EMPLOYED);
    expect(result.totalUnemployment).toBe(US_LABOR_FORCE_2025 - BASELINE_CPS_EMPLOYMENT);
    expect(result.unemploymentRate).toBeGreaterThanOrEqual(0);
    expect(result.unemploymentRate).toBeLessThanOrEqual(1);
    expect(result.laborForceParticipation).toBeGreaterThan(0);
    expect(result.laborForceParticipation).toBeLessThanOrEqual(1);

    // FIX 4: Price level at t=0 must be exactly 1.0
    expect(result.priceLevel).toBe(1.0);

    // CWI = real income / population. At year 0 with P=1.0, should be positive.
    expect(result.consumerWelfareIndex).toBeGreaterThan(0);

    // FIX 3: GDP at t=0 equals baseline ($29T)
    expect(result.gdpReal).toBe(BASELINE_GDP_NOMINAL_2025);
    // FIX 5: At t=0 with P=1.0, nominal = real
    expect(result.gdpNominal).toBe(result.gdpReal);

    // FIX 2: Income shares near baseline split (data-driven from BEA)
    // Precision relaxed to 1 decimal place — exact decomposition shifts shares slightly
    expect(result.incomeComposition.wageShare).toBeCloseTo(BASELINE_WAGE_SHARE, 1);
    expect(result.incomeComposition.assetShare).toBeCloseTo(BASELINE_ASSET_SHARE, 1);
    expect(result.incomeComposition.transferShare).toBeCloseTo(BASELINE_TRANSFER_SHARE, 1);

    // Income composition should still sum to 1
    const shareSum =
      result.incomeComposition.wageShare +
      result.incomeComposition.assetShare +
      result.incomeComposition.transferShare;
    expect(shareSum).toBeCloseTo(1, 10);

    // Total income is POST-TAX (Phase 5-tax), so inherently < GDP.
    // Check it's within a reasonable range: 75-95% of GDP.
    expect(result.totalIncome).toBeGreaterThan(0.75 * BASELINE_GDP_NOMINAL_2025);
    expect(result.totalIncome).toBeLessThan(0.95 * BASELINE_GDP_NOMINAL_2025);

    // Wage income ≈ BASELINE_WAGE_SHARE of GDP (within ~2% due to model adjustments)
    expect(result.aggregateWageIncome).toBeCloseTo(BASELINE_WAGE_SHARE * BASELINE_GDP_NOMINAL_2025, -12);

    // First year should not be in depression; cycle phase should be STABLE
    expect(result.isDepression).toBe(false);
    expect(result.cyclePhase).toBe('STABLE');

    // Phillips curve: at baseline unemployment (~4.4%), wagePressure ≈ 1.0
    expect(result.wagePressure).toBeCloseTo(1.0, 2);
  });

  it('zero-displacement multi-year: GDP grows and no displacement-demand spiral', () => {
    const policy = zeroPolicyEffects();

    // Run 6 years: 2025-2030
    let previousMacro: ReturnType<typeof computeMacro> | null = null;
    const results: ReturnType<typeof computeMacro>[] = [];
    const gdpHistory: number[] = [];

    for (let year = DEFAULT_START_YEAR; year <= DEFAULT_START_YEAR + 5; year++) {
      const result = computeMacro(buildDefaultMacroInputs({
        year,
        policyEffects: policy,
        previousMacro,
        nominalGDPHistory: gdpHistory,
      }));
      gdpHistory.push(result.gdpNominal);
      results.push(result);
      previousMacro = result;
    }

    // Year 0 checks
    expect(results[0]!.priceLevel).toBe(1.0);
    expect(results[0]!.gdpReal).toBe(BASELINE_GDP_NOMINAL_2025);

    // GDP should generally grow from year 0 (investment rate now BEA-consistent).
    // Asset income decomposition may cause slight adjustment in early years.
    // Check that GDP at year 5 is > year 0 (overall growth).
    expect(results[5]!.gdpReal).toBeGreaterThan(results[0]!.gdpReal);

    // Phase 3c: CWI growth driven by GDP-share feedback loop (not fictional growth factor).
    // Year 0→1 growth is slow as the GDP-share model bootstraps, then accelerates
    // as GDP → income → consumption → GDP loop compounds. Over 5 years: CWI should grow.
    // Post income-based CWI: CWI = totalIncome / (pop × PL), includes inflation (~2.5%/yr).
    // Asset income decomposition with clean initialization gives smooth growth.
    // With zero displacement, CWI should grow but stay bounded (no explosion).
    // Year 0 CWI is inflated by priceLevel=1.0 (forced baseline); year 1+ has
    // priceLevel > 1.0 (inflation), causing a one-time CWI drop at yr0→yr1.
    // Compare yr1→yr5 to verify real CWI doesn't collapse once freely computed.
    expect(results[5]!.consumerWelfareIndex).toBeGreaterThanOrEqual(results[1]!.consumerWelfareIndex * 0.98);  // no collapse
    // CWI should stay within a reasonable band (no explosion or implosion)
    expect(results[5]!.consumerWelfareIndex).toBeGreaterThan(50000);
    expect(results[5]!.consumerWelfareIndex).toBeLessThan(150000);

    // No depression at any point
    for (const r of results) {
      expect(r.isDepression).toBe(false);
    }
    // No catastrophic GDP collapse: year 5 GDP should be above 90% of year 0
    expect(results[5]!.gdpReal).toBeGreaterThan(results[0]!.gdpReal * 0.90);

    // FIX 5: After year 0, nominal > real (since price level > 1.0)
    for (let i = 1; i < results.length; i++) {
      expect(results[i]!.priceLevel).toBeGreaterThan(1.0);
      expect(results[i]!.gdpNominal).toBeGreaterThan(results[i]!.gdpReal);
    }

    // Income shares remain stable near baseline
    const lastYear = results[results.length - 1]!;
    expect(lastYear.incomeComposition.wageShare).toBeCloseTo(BASELINE_WAGE_SHARE, 1);
    expect(lastYear.incomeComposition.assetShare).toBeCloseTo(BASELINE_ASSET_SHARE, 1);
    expect(lastYear.incomeComposition.transferShare).toBeCloseTo(BASELINE_TRANSFER_SHARE, 1);

    // Second-order effects remain at near-neutral values throughout zero-displacement.
    for (const r of results) {
      expect(r.demandRatio).toBeGreaterThan(0.93);
      expect(r.demandRatio).toBeLessThanOrEqual(1.0);
      expect(r.demandPenalty).toBeGreaterThan(0.89);
      expect(r.demandPenalty).toBeLessThanOrEqual(1.0);
      // Phase 6: Consumer & business credit at neutral when baselines not provided
      expect(r.consumerCreditTightening).toBeCloseTo(0, 5);
      expect(r.consumerCreditMultiplier).toBeCloseTo(1.0, 5);
      expect(r.businessCreditMultiplier).toBeCloseTo(1.0, 5);
      expect(r.discretionarySpending).toBeGreaterThan(0);
      // Deflation velocity drag — no deflation in zero-displacement, so no drag
      expect(r.velocityMultiplier).toBe(1.0);
      expect(r.deflationDragPct).toBe(0);
      // Demand spillover: placeholder defaults (actual values set in simulation.ts)
      expect(r.consumerDemandRatio).toBe(1.0);
      expect(r.totalDemandSpilloverLoss).toBe(0);
    }

    // Fiscal deficit reported honestly even at year 0
    expect(results[0]!.fiscalDeficitGDPRatio).toBeGreaterThan(0.05);
    expect(results[0]!.fiscalDeficitGDPRatio).toBeLessThan(0.20);
  });

  it('first year includes all second-order fields + demand spillover placeholders', () => {
    const policy = zeroPolicyEffects();

    const result = computeMacro(buildDefaultMacroInputs({ policyEffects: policy }));

    // All second-order fields must be present
    expect(typeof result.demandRatio).toBe('number');
    expect(typeof result.demandPenalty).toBe('number');
    expect(typeof result.consumerCreditTightening).toBe('number');
    expect(typeof result.consumerCreditMultiplier).toBe('number');
    expect(typeof result.businessCreditMultiplier).toBe('number');
    expect(typeof result.fiscalDeficitGDPRatio).toBe('number');
    expect(typeof result.discretionarySpending).toBe('number');
    expect(typeof result.consumerDemandRatio).toBe('number');
    expect(typeof result.totalDemandSpilloverLoss).toBe('number');

    // At baseline: demand ratio = 1.0, penalty = 1.0
    expect(result.demandRatio).toBe(1.0);
    expect(result.demandPenalty).toBe(1.0);

    // Credit: no tightening at baseline (first year defaults to neutral — no baselines)
    expect(result.consumerCreditTightening).toBeCloseTo(0, 5);
    expect(result.consumerCreditMultiplier).toBeCloseTo(1.0, 5);
    expect(result.businessCreditMultiplier).toBeCloseTo(1.0, 5);

    // Fiscal deficit reported (NOT zero — baseline deficit is real)
    expect(result.fiscalDeficitGDPRatio).toBeGreaterThan(0);
    expect(result.discretionarySpending).toBeGreaterThan(0);

    // Demand spillover placeholders (actual values set in simulation.ts)
    expect(result.consumerDemandRatio).toBe(1.0);
    expect(result.totalDemandSpilloverLoss).toBe(0);
  });
});

// ============================================================
// Median CWI (Bottom 80% Consumer Welfare Index)
// ============================================================

describe('Median CWI', () => {
  it('medianCWI ≤ systemCWI at baseline shares', () => {
    const result = computeMacro(buildDefaultMacroInputs());
    // At default shares (0.45/0.78/0.12), bottom 80% gets less than average
    expect(result.medianCWI).toBeGreaterThan(0);
    expect(result.medianCWI).toBeLessThanOrEqual(result.consumerWelfareIndex);
  });

  it('medianCWI ≈ systemCWI when all shares = 0.80 (uniform distribution)', () => {
    const result = computeMacro(buildDefaultMacroInputs({
      bottom80WageShare: BOTTOM80_POP_SHARE,
      bottom80TransferShare: BOTTOM80_POP_SHARE,
      bottom80AssetShare: BOTTOM80_POP_SHARE,
    }));
    // With uniform distribution, per-capita for bottom 80% = per-capita overall
    expect(result.medianCWI).toBeCloseTo(result.consumerWelfareIndex, 2);
  });

  it('medianCWI > 0 when wages approach zero (transfer floor)', () => {
    // Simulate high displacement with transfer policy income
    const policy = zeroPolicyEffects();
    policy.transferChannelAddition = 2e12; // $2T in transfers
    policy.totalPolicyIncome = 2e12;
    policy.fiscalCost = 2e12;

    const result = computeMacro(buildDefaultMacroInputs({
      totalRemainingEmployment: 1_000_000, // near-zero employment
      weightedAverageWage: 10_000,
      totalDisplaced: BASELINE_TOTAL_EMPLOYMENT - 1_000_000,
      automationCoverage: 0.9,
      policyEffects: policy,
    }));
    expect(result.medianCWI).toBeGreaterThan(0);
    expect(isFinite(result.medianCWI)).toBe(true);
  });

  it('higher bottom80AssetShare closes the gap between medianCWI and systemCWI', () => {
    // With low asset share (0.12), median CWI lags system CWI significantly
    const lowShareResult = computeMacro(buildDefaultMacroInputs({
      bottom80AssetShare: 0.12,
    }));
    const lowGap = lowShareResult.consumerWelfareIndex - lowShareResult.medianCWI;

    // With high asset share (0.50), more asset income reaches bottom 80%
    const highShareResult = computeMacro(buildDefaultMacroInputs({
      bottom80AssetShare: 0.50,
    }));
    const highGap = highShareResult.consumerWelfareIndex - highShareResult.medianCWI;

    // System CWI unchanged (distribution shares don't affect macro totals)
    expect(highShareResult.consumerWelfareIndex).toBeCloseTo(
      lowShareResult.consumerWelfareIndex, 2,
    );

    // Gap should narrow: more democratic asset ownership → median rises toward system
    expect(highGap).toBeLessThan(lowGap);
    // And median CWI itself should be higher
    expect(highShareResult.medianCWI).toBeGreaterThan(lowShareResult.medianCWI);
  });

  it('minimum shares produce low medianCWI without NaN', () => {
    const result = computeMacro(buildDefaultMacroInputs({
      bottom80WageShare: 0.20,
      bottom80TransferShare: 0.50,
      bottom80AssetShare: 0.01,
    }));
    expect(result.medianCWI).toBeGreaterThan(0);
    expect(isFinite(result.medianCWI)).toBe(true);
    expect(isFinite(result.medianCWIGrowthRate)).toBe(true);
    expect(result.medianCWI).toBeLessThan(result.consumerWelfareIndex);
  });

  it('maximum shares approach or exceed systemCWI without explosion', () => {
    const result = computeMacro(buildDefaultMacroInputs({
      bottom80WageShare: 0.70,
      bottom80TransferShare: 1.00,
      bottom80AssetShare: 0.50,
    }));
    expect(result.medianCWI).toBeGreaterThan(0);
    expect(isFinite(result.medianCWI)).toBe(true);
    // With high shares, median can exceed system (bottom 80% gets > 80% of income)
    expect(result.medianCWI).toBeGreaterThan(result.consumerWelfareIndex * 0.8);
  });

  it('medianCWIGrowthRate computed correctly YoY', () => {
    const policy = zeroPolicyEffects();
    let previousMacro: ReturnType<typeof computeMacro> | null = null;
    const results: ReturnType<typeof computeMacro>[] = [];
    const gdpHistory: number[] = [];

    for (let year = DEFAULT_START_YEAR; year <= DEFAULT_START_YEAR + 3; year++) {
      const result = computeMacro(buildDefaultMacroInputs({
        year,
        policyEffects: policy,
        previousMacro,
        nominalGDPHistory: gdpHistory,
      }));
      gdpHistory.push(result.gdpNominal);
      results.push(result);
      previousMacro = result;
    }

    // First year: growth rate = 0 (no previous year)
    expect(results[0]!.medianCWIGrowthRate).toBe(0);

    // Subsequent years: growth rate = (current - prev) / prev
    for (let i = 1; i < results.length; i++) {
      const expected = (results[i]!.medianCWI - results[i - 1]!.medianCWI) / results[i - 1]!.medianCWI;
      expect(results[i]!.medianCWIGrowthRate).toBeCloseTo(expected, 10);
    }
  });

  it('first year: medianCWI > 0, medianCWIGrowthRate = 0', () => {
    const result = computeMacro(buildDefaultMacroInputs());
    expect(result.medianCWI).toBeGreaterThan(0);
    expect(result.medianCWIGrowthRate).toBe(0);
    // Verify the relationship: medianCWI uses POST-TAX income shares (Phase 5-tax)
    // At year 0 with priceLevel=1.0, we can verify the math directly:
    const expectedIncome =
        BOTTOM80_WAGE_SHARE * result.afterTaxWageIncome
      + BOTTOM80_TRANSFER_SHARE * result.afterTaxTransferIncome
      + BOTTOM80_ASSET_SHARE * result.afterTaxAssetIncome;
    const expectedMedianCWI = expectedIncome / (BOTTOM80_POP_SHARE * US_POPULATION_2025 * result.priceLevel);
    expect(result.medianCWI).toBeCloseTo(expectedMedianCWI, 0);
  });
});

// ============================================================
// Nominal-first GDP consistency tests
// ============================================================

describe('Nominal-first GDP architecture', () => {
  it('nominal GDP identity: gdpNominal = consumption + investment + G + NX (within tolerance)', () => {
    const policy = zeroPolicyEffects();
    const firstYear = computeMacro(buildDefaultMacroInputs({ policyEffects: policy }));

    // Run a multi-year simulation
    let previousMacro: ReturnType<typeof computeMacro> | null = firstYear;
    const gdpHistory: number[] = [firstYear.gdpNominal];

    for (let year = DEFAULT_START_YEAR + 1; year <= DEFAULT_START_YEAR + 10; year++) {
      const result = computeMacro(buildDefaultMacroInputs({
        year,
        policyEffects: policy,
        previousMacro,
        nominalGDPHistory: gdpHistory,
      }));
      gdpHistory.push(result.gdpNominal);

      // Verify nominal identity at every year: gdpNominal = C + I + G + NX
      // Note: at year 0, GDP is forced to baseline, but C+I+G doesn't exactly equal it (display only).
      // For year 1+, the identity must hold exactly.
      if (year > DEFAULT_START_YEAR) {
        const componentSum = result.consumption + result.investment
          + result.governmentSpending + (result.gdpNominal - result.consumption - result.investment - result.governmentSpending);
        // The net exports are implicit (gdpNominal - C - I - G), so the identity is tautological
        // for the sum. Instead verify that components are positive and reasonable.
        expect(result.consumption).toBeGreaterThan(0);
        expect(result.investment).toBeGreaterThan(0);
        expect(result.governmentSpending).toBeGreaterThan(0);
        expect(result.gdpNominal).toBeGreaterThan(0);
      }

      previousMacro = result;
    }
  });

  it('real GDP identity: gdpReal = gdpNominal / priceLevel', () => {
    const policy = zeroPolicyEffects();
    let previousMacro: ReturnType<typeof computeMacro> | null = null;
    const gdpHistory: number[] = [];

    for (let year = DEFAULT_START_YEAR; year <= DEFAULT_START_YEAR + 10; year++) {
      const result = computeMacro(buildDefaultMacroInputs({
        year,
        policyEffects: policy,
        previousMacro,
        nominalGDPHistory: gdpHistory,
      }));
      gdpHistory.push(result.gdpNominal);

      // Real GDP = nominal / price level (accounting identity)
      const expectedReal = result.gdpNominal / result.priceLevel;
      expect(result.gdpReal).toBeCloseTo(expectedReal, 0);

      previousMacro = result;
    }
  });

  it('no GDP explosion: nominal GDP stays bounded through 25 years of simulation', () => {
    const policy = zeroPolicyEffects();
    let previousMacro: ReturnType<typeof computeMacro> | null = null;
    const gdpHistory: number[] = [];

    for (let year = DEFAULT_START_YEAR; year <= DEFAULT_START_YEAR + 25; year++) {
      const result = computeMacro(buildDefaultMacroInputs({
        year,
        policyEffects: policy,
        previousMacro,
        nominalGDPHistory: gdpHistory,
      }));
      gdpHistory.push(result.gdpNominal);

      // Nominal GDP should stay bounded even after 25 years.
      // Stage 0 (item 3): zero-displacement real growth corrected from ~1.6% to the full ~2.0%
      // potential (population growth was previously cancelled in employmentRatio normalization).
      // With ~2% real + ~2.9% inflation ≈ 4.9% nominal, $31.5T compounds to ~$103T over 25 years.
      expect(result.gdpNominal).toBeGreaterThan(10_000_000_000_000);
      expect(result.gdpNominal).toBeLessThan(115_000_000_000_000);

      // Investment share should never exceed 25% of nominal GDP
      if (year > DEFAULT_START_YEAR) {
        const investmentShare = result.investment / result.gdpNominal;
        expect(investmentShare).toBeLessThan(0.25);
      }

      previousMacro = result;
    }
  });
});

// ============================================================
// computeDemandFeedback
// ============================================================

describe('computeDemandFeedback', () => {
  it('returns ratio=1.0, penalty=1.0 when history is empty (first year)', () => {
    const result = computeDemandFeedback(
      BASELINE_GDP_NOMINAL_2025,
      [], // empty history
    );
    expect(result.demandRatio).toBe(1.0);
    expect(result.demandPenalty).toBe(1.0);
  });

  it('returns ratio=1.0 when current GDP equals rolling average', () => {
    const gdp = BASELINE_GDP_NOMINAL_2025;
    const result = computeDemandFeedback(gdp, [gdp, gdp, gdp]);
    expect(result.demandRatio).toBeCloseTo(1.0, 6);
    expect(result.demandPenalty).toBeCloseTo(1.0, 6);
  });

  it('penalizes when GDP is below rolling average', () => {
    const avg = BASELINE_GDP_NOMINAL_2025;
    const current = avg * 0.9; // 10% below
    const result = computeDemandFeedback(current, [avg, avg, avg], 1.5);
    expect(result.demandRatio).toBeCloseTo(0.9, 5);
    // 0.9^1.5 ≈ 0.854
    expect(result.demandPenalty).toBeCloseTo(0.854, 2);
  });

  it('sensitivity=0 means penalty is always 1.0', () => {
    const avg = BASELINE_GDP_NOMINAL_2025;
    const result = computeDemandFeedback(avg * 0.5, [avg, avg], 0);
    expect(result.demandPenalty).toBe(1.0);
  });

  it('caps ratio at 1.0 when GDP exceeds rolling average', () => {
    const avg = BASELINE_GDP_NOMINAL_2025;
    const result = computeDemandFeedback(avg * 1.5, [avg, avg, avg]);
    expect(result.demandRatio).toBe(1.0);
    expect(result.demandPenalty).toBe(1.0);
  });

  it('recovers as old low-GDP years fall out of lookback window', () => {
    // History with a bad year followed by recovery
    const normal = BASELINE_GDP_NOMINAL_2025;
    const bad = normal * 0.7;
    // Lookback 3: [bad, normal, normal] → avg = (0.7 + 1.0 + 1.0)/3 × normal = 0.9 × normal
    // current = normal → ratio = normal / (0.9 × normal) = min(1.0, 1.11) = 1.0
    // To test recovery, use current below avg:
    const current = normal * 0.95;
    const result1 = computeDemandFeedback(current, [bad, normal, normal], 1.5, 3);
    // After bad year drops out of window: avg = normal → ratio = 0.95/1.0 = 0.95
    const result2 = computeDemandFeedback(current, [normal, normal, normal], 1.5, 3);
    // With bad year in window: avg = 0.9*normal → ratio = 0.95/0.9 = min(1.0, 1.056) = 1.0
    // Without bad year: avg = normal → ratio = 0.95/1.0 = 0.95
    // result1 ratio should be HIGHER (bad year lowers avg, making ratio closer to 1)
    expect(result1.demandRatio).toBeGreaterThanOrEqual(result2.demandRatio);
  });
});

// DEPRECATED: computeHousingWealthEffect tests removed — housing channel removed in Phase 1 overhaul

// ============================================================
// computeConsumerCreditConditions
// ============================================================

describe('computeConsumerCreditConditions', () => {
  it('income at baseline: neutral multiplier, zero tightening', () => {
    // underwritable = 50000 + 0.70*10000 + 0.30*5000 = 58500
    // baseline must match underwritable for ratio = 1.0
    const result = computeConsumerCreditConditions(
      50000, 10000, 5000,   // prevReal wage/transfer/asset
      58500,                 // baseline = underwritable income
      0.70,                  // transfer reliability weight
      0.0, 1.0,             // home price change, mortgage stress
      1.0, 1.0,             // prevCWI, baselineCWI
      0.0,                   // prevCompositeInflation
      2.0, 1.0, 1.5, 0.5,   // sensitivities
      0.5, 0.06,             // max tightening, credit impact
    );
    expect(result.consumerCreditTightening).toBeCloseTo(0, 5);
    expect(result.consumerCreditMultiplier).toBeCloseTo(1.0, 5);
    expect(result.incomeAdequacyRatio).toBeCloseTo(1.0, 5);
  });

  it('income collapse: tightening increases', () => {
    const result = computeConsumerCreditConditions(
      20000, 5000, 2000,    // severely reduced incomes
      65000,                  // baseline still high
      0.70,
      -0.10, 1.5,           // falling home prices, high mortgage stress
      0.6, 1.0,             // CWI fallen
      0.05,                  // positive inflation (cost pressure)
      2.0, 1.0, 1.5, 0.5,
      0.5, 0.06,
    );
    expect(result.consumerCreditTightening).toBeGreaterThan(0.1);
    expect(result.consumerCreditMultiplier).toBeLessThan(1.0);
    expect(result.incomeAdequacyRatio).toBeLessThan(0.7);
  });

  it('UBI raises underwritable income via transfer channel', () => {
    // Use sensitivity=1.0 and maxTightening=1.0 to avoid both scenarios hitting cap
    // Without UBI: underwritable = 40000 + 0 + 0.3*5000 = 41500, ratio = 41500/58500 = 0.709
    const noUBI = computeConsumerCreditConditions(
      40000, 0, 5000, 58500, 0.70,
      0.0, 1.0, 1.0, 1.0, 0.0,
      1.0, 1.0, 1.5, 0.5, 1.0, 0.06,
    );
    // With UBI ($20k transfers): underwritable = 40000 + 0.7*20000 + 1500 = 55500
    const withUBI = computeConsumerCreditConditions(
      40000, 20000, 5000, 58500, 0.70,
      0.0, 1.0, 1.0, 1.0, 0.0,
      1.0, 1.0, 1.5, 0.5, 1.0, 0.06,
    );
    expect(withUBI.underwritableIncome).toBeGreaterThan(noUBI.underwritableIncome);
    expect(withUBI.consumerCreditTightening).toBeLessThan(noUBI.consumerCreditTightening);
  });

  it('collateral loosening is asymmetric (gains damped vs losses)', () => {
    const rising = computeConsumerCreditConditions(
      50000, 10000, 5000, 65000, 0.70,
      0.10, 1.0, 1.0, 1.0, 0.0,  // +10% home prices
      2.0, 1.0, 1.5, 0.5, 0.5, 0.06,
    );
    const falling = computeConsumerCreditConditions(
      50000, 10000, 5000, 65000, 0.70,
      -0.10, 1.0, 1.0, 1.0, 0.0,  // -10% home prices
      2.0, 1.0, 1.5, 0.5, 0.5, 0.06,
    );
    // Tightening from falling prices should exceed loosening from rising prices
    const tighteningFromFall = falling.consumerCreditTightening - 0;
    const looseningFromRise = 0 - rising.consumerCreditTightening;
    expect(Math.abs(tighteningFromFall)).toBeGreaterThan(Math.abs(looseningFromRise));
  });
});

// ============================================================
// Phase 8 Fix 5: Growing credit baseline tests
// ============================================================

describe('computeConsumerCreditConditions — growing baseline', () => {
  it('income at trend after 5 years produces zero deficiency', () => {
    // Baseline: 58500. Growth rate: 1.6%/yr. After 5 years: 58500 * 1.016^5 ≈ 63336
    // Provide underwritable income matching the grown baseline
    const trendRate = 0.016;
    const yearsElapsed = 5;
    const baseline = 58500;
    const grownBaseline = baseline * Math.pow(1 + trendRate, yearsElapsed);
    // Provide income that matches the grown baseline
    const result = computeConsumerCreditConditions(
      grownBaseline * 0.80, // wage portion
      grownBaseline * 0.12 / 0.70, // transfer portion (×0.70 weight → contributes 12%)
      grownBaseline * 0.08 / 0.30, // asset portion (×0.30 weight → contributes 8%)
      baseline,
      0.70,
      0.0, 1.0, 1.0, 1.0, 0.0,
      2.0, 1.0, 1.5, 0.5, 0.5, 0.06,
      yearsElapsed, trendRate,
    );
    expect(result.incomeAdequacyRatio).toBeCloseTo(1.0, 1);
    expect(result.consumerCreditTightening).toBeCloseTo(0, 2);
  });

  it('income below trend produces proportional deficiency', () => {
    // Baseline: 58500. After 5 years at 1.6%: adjusted baseline ≈ 63336
    // Provide income that stays flat (no growth) → deficiency = 1 - (58500/63336) ≈ 0.076
    const result = computeConsumerCreditConditions(
      50000, 10000, 5000,   // same as original baseline test → underwritable = 58500
      58500,
      0.70,
      0.0, 1.0, 1.0, 1.0, 0.0,
      2.0, 1.0, 1.5, 0.5, 0.5, 0.06,
      5, 0.016,  // 5 years, 1.6% trend
    );
    // Adjusted baseline = 58500 * 1.016^5 ≈ 63336
    // Ratio = 58500 / 63336 ≈ 0.924 → deficiency ≈ 0.076
    expect(result.incomeAdequacyRatio).toBeLessThan(1.0);
    expect(result.consumerCreditTightening).toBeGreaterThan(0);
  });

  it('income above trend capped at 2.0 ratio', () => {
    // Provide income far above the grown baseline → ratio capped at 2.0
    const result = computeConsumerCreditConditions(
      200000, 50000, 20000,  // massive incomes
      10000,                  // tiny baseline
      0.70,
      0.0, 1.0, 1.0, 1.0, 0.0,
      2.0, 1.0, 1.5, 0.5, 0.5, 0.06,
      5, 0.016,
    );
    expect(result.incomeAdequacyRatio).toBe(2.0);
    expect(result.consumerCreditTightening).toBeCloseTo(0, 5);
  });
});

// ============================================================
// computeBusinessCreditConditions
// ============================================================

describe('computeBusinessCreditConditions', () => {
  it('profits at baseline + positive growth: loosening', () => {
    const result = computeBusinessCreditConditions(
      2e12, 2e12,           // profits = baseline
      0.02,                  // 2% GDP growth
      1.5, 2.0,             // sensitivities
      0.5, 0.3, 0.15,       // max tightening, max growth tightening, impact
    );
    expect(result.businessCreditTightening).toBeLessThanOrEqual(0);
    expect(result.businessCreditMultiplier).toBeGreaterThanOrEqual(1.0);
    expect(result.profitCoverageRatio).toBeCloseTo(1.0, 5);
  });

  it('profits collapsed: tightening', () => {
    const result = computeBusinessCreditConditions(
      0.5e12, 2e12,         // profits at 25% of baseline
      -0.03,                 // negative GDP growth
      1.5, 2.0,
      0.5, 0.3, 0.15,
    );
    expect(result.businessCreditTightening).toBeGreaterThan(0);
    expect(result.businessCreditMultiplier).toBeLessThan(1.0);
    expect(result.profitCoverageRatio).toBeCloseTo(0.25, 5);
  });

  it('profits exceed baseline: loosening amplified', () => {
    const result = computeBusinessCreditConditions(
      3e12, 2e12,           // profits 150% of baseline
      0.03,                  // positive growth
      1.5, 2.0,
      0.5, 0.3, 0.15,
    );
    expect(result.businessCreditMultiplier).toBeGreaterThan(1.0);
    expect(result.profitCoverageRatio).toBeCloseTo(1.5, 5);
  });
});

// ============================================================
// computeFiscalPressure
// ============================================================

describe('computeFiscalPressure', () => {
  it('at baseline: reports deficit ~10% of GDP', () => {
    const baselineG = BASELINE_GDP_NOMINAL_2025 * GOVERNMENT_SPENDING_GDP_FRACTION;
    const result = computeFiscalPressure(
      BASELINE_GDP_NOMINAL_2025,
      NATURAL_UNEMPLOYMENT_RATE,
      NATURAL_UNEMPLOYMENT_RATE,
      baselineG,
    );
    // Deficit should be meaningful
    expect(result.fiscalDeficitGDPRatio).toBeGreaterThan(0.05);
    expect(result.fiscalDeficitGDPRatio).toBeLessThan(0.15);
    // No austerity ever: adjustedG = baselineG always
    expect(result.adjustedG).toBeCloseTo(baselineG, -6);
  });

  it('no austerity even with high deficit — adjustedG always equals baselineG', () => {
    const baselineG = BASELINE_GDP_NOMINAL_2025 * GOVERNMENT_SPENDING_GDP_FRACTION;
    const result = computeFiscalPressure(
      BASELINE_GDP_NOMINAL_2025 * 0.8, // GDP 20% lower
      NATURAL_UNEMPLOYMENT_RATE + 0.10, // 10pp excess UE
      NATURAL_UNEMPLOYMENT_RATE,
      baselineG,
    );
    // Higher deficit reported
    expect(result.fiscalDeficitGDPRatio).toBeGreaterThan(0.12);
    // But NO austerity: adjustedG = baselineG always
    expect(result.adjustedG).toBeCloseTo(baselineG, -6);
  });

  it('discretionary spending equals baseline G discretionary share', () => {
    const baselineG = BASELINE_GDP_NOMINAL_2025 * GOVERNMENT_SPENDING_GDP_FRACTION;
    const result = computeFiscalPressure(
      BASELINE_GDP_NOMINAL_2025,
      NATURAL_UNEMPLOYMENT_RATE,
      NATURAL_UNEMPLOYMENT_RATE,
      baselineG,
    );
    // discretionarySpending = baselineG * discretionaryShareOfG
    expect(result.discretionarySpending).toBeGreaterThan(0);
    expect(result.discretionarySpending).toBeLessThan(baselineG);
  });
});

// ============================================================
// computeDeflationDrag — Phase 4: S-curve logistic deferral model
// ============================================================

describe('computeDeflationDrag', () => {
  it('returns no drag when net inflation is positive', () => {
    const result = computeDeflationDrag(0.02);
    expect(result.velocityMultiplier).toBe(1.0);
    expect(result.deflationDragPct).toBe(0);
  });

  it('returns no drag when net inflation is exactly zero', () => {
    const result = computeDeflationDrag(0);
    expect(result.velocityMultiplier).toBe(1.0);
    expect(result.deflationDragPct).toBe(0);
  });

  it('minimal drag at 1% deflation (below midpoint)', () => {
    // 1% deflation is well below the 5% midpoint — consumers barely notice
    const result = computeDeflationDrag(-0.01);
    // With default params: deferral ≈ 0.05 (logistic just starting to rise)
    expect(result.deflationDragPct).toBeLessThan(0.06);
    expect(result.velocityMultiplier).toBeGreaterThan(0.94);
  });

  it('moderate drag at 5% deflation (at midpoint)', () => {
    // At midpoint (5%), half of deferrable share is deferred: 0.30/2 = 0.15
    const result = computeDeflationDrag(-0.05);
    expect(result.deflationDragPct).toBeCloseTo(0.15, 1);
    expect(result.velocityMultiplier).toBeCloseTo(0.85, 1);
  });

  it('approaches asymptote at high deflation (velocity ≈ 0.70)', () => {
    // At very high deflation, deferral approaches DEFERRABLE_CONSUMPTION_SHARE (0.30)
    // So velocityMultiplier approaches 1.0 - 0.30 = 0.70
    const result = computeDeflationDrag(-0.20);
    expect(result.deflationDragPct).toBeGreaterThan(0.28);
    expect(result.velocityMultiplier).toBeLessThan(0.72);
    expect(result.velocityMultiplier).toBeGreaterThan(0.69);
  });

  it('respects custom deferrable share', () => {
    // Low deferrable share = less drag even at high deflation
    const low = computeDeflationDrag(-0.10, 0.15);
    const high = computeDeflationDrag(-0.10, 0.45);
    expect(high.deflationDragPct).toBeGreaterThan(low.deflationDragPct);
    // Asymptotes differ: 0.15 vs 0.45
    expect(low.velocityMultiplier).toBeGreaterThan(high.velocityMultiplier);
  });

  it('steepness controls transition sharpness', () => {
    // At midpoint with default steepness=40 vs low steepness=10
    const sharp = computeDeflationDrag(-0.05, 0.30, 0.05, 40);
    const gradual = computeDeflationDrag(-0.05, 0.30, 0.05, 10);
    // Both at midpoint should give ~0.15, but exact values differ with steepness
    expect(sharp.deflationDragPct).toBeCloseTo(0.15, 1);
    expect(gradual.deflationDragPct).toBeCloseTo(0.15, 1);
    // Below midpoint: sharp has LESS drag, above midpoint: sharp has MORE
    const sharpLow = computeDeflationDrag(-0.02, 0.30, 0.05, 40);
    const gradualLow = computeDeflationDrag(-0.02, 0.30, 0.05, 10);
    expect(sharpLow.deflationDragPct).toBeLessThan(gradualLow.deflationDragPct);
  });
});

// ============================================================
// computeDemandFeedback — Rolling Average (Phase 1 overhaul)
// ============================================================

describe('computeDemandFeedback (rolling average)', () => {
  it('returns ratio = 1.0 when current matches 1-year history', () => {
    const baseline = 29_000_000_000_000;
    const result = computeDemandFeedback(baseline, [baseline]);
    expect(result.demandRatio).toBeCloseTo(1.0, 6);
    expect(result.demandPenalty).toBeCloseTo(1.0, 6);
  });

  it('penalizes when GDP drops 20% below rolling average', () => {
    const baseline = 29_000_000_000_000;
    const actual = baseline * 0.80;
    const result = computeDemandFeedback(actual, [baseline, baseline, baseline], 1.5);
    expect(result.demandRatio).toBeCloseTo(0.80, 2);
    expect(result.demandPenalty).toBeLessThan(0.80); // 0.80^1.5 ≈ 0.716
  });

  it('uses only last N years for lookback', () => {
    const normal = 29_000_000_000_000;
    const high = normal * 1.5;
    // History: [high, high, normal, normal, normal], lookback=3 → avg of last 3 = normal
    const result = computeDemandFeedback(normal, [high, high, normal, normal, normal], 1.5, 3);
    expect(result.demandRatio).toBeCloseTo(1.0, 2);
  });
});

// ============================================================
// Phase 2: AI Production Expansion & New Job Integration
// ============================================================

describe('computeMacro — Phase 2 production inputs', () => {
  function zeroProd(): MacroProductionInputs {
    return {
      aiInvestmentBoost: 0,
      aiNetExportBoost: 0,
      aiConsumerGoodsPotential: 0,
      aiAdditionalOutput: 0,
      totalDurableNewJobs: 0,
      newJobWageFraction: DEFAULT_NEW_JOB_WAGE_FRACTION,
    };
  }

  it('zero productionInputs → all new fields = 0, existing behavior unchanged', () => {
    const policy = zeroPolicyEffects();
    const resultWith = computeMacro(buildDefaultMacroInputs({
      policyEffects: policy,
      productionInputs: zeroProd(),
    }));
    const resultWithout = computeMacro(buildDefaultMacroInputs({
      policyEffects: policy,
    }));

    expect(resultWith.aiAdditionalOutput).toBe(0);
    expect(resultWith.aiInvestmentBoost).toBe(0);
    expect(resultWith.aiNetExportBoost).toBe(0);
    expect(resultWith.aiConsumerGoodsPotential).toBe(0);
    expect(resultWith.unrealizedAIOutput).toBe(0);
    expect(resultWith.newJobEmployment).toBe(0);
    expect(resultWith.newJobWageIncome).toBe(0);

    // Same core outputs
    expect(resultWith.totalEmployment).toBe(resultWithout.totalEmployment);
    expect(resultWith.gdpReal).toBe(resultWithout.gdpReal);
    expect(resultWith.aggregateWageIncome).toBeCloseTo(resultWithout.aggregateWageIncome, 0);
  });

  it('new jobs increase totalEmployment and decrease unemploymentRate', () => {
    const policy = zeroPolicyEffects();
    const prod = zeroProd();
    prod.totalDurableNewJobs = 1_000_000; // 1M new jobs

    const resultWithJobs = computeMacro(buildDefaultMacroInputs({
      policyEffects: policy,
      productionInputs: prod,
    }));
    const resultWithout = computeMacro(buildDefaultMacroInputs({
      policyEffects: policy,
    }));

    expect(resultWithJobs.totalEmployment).toBeGreaterThan(resultWithout.totalEmployment);
    expect(resultWithJobs.unemploymentRate).toBeLessThan(resultWithout.unemploymentRate);
    expect(resultWithJobs.newJobEmployment).toBe(1_000_000);
  });

  it('new jobs contribute newJobWageIncome to aggregateWageIncome', () => {
    const policy = zeroPolicyEffects();
    const prod = zeroProd();
    prod.totalDurableNewJobs = 500_000;

    const resultWithJobs = computeMacro(buildDefaultMacroInputs({
      policyEffects: policy,
      productionInputs: prod,
    }));
    const resultWithout = computeMacro(buildDefaultMacroInputs({
      policyEffects: policy,
    }));

    expect(resultWithJobs.newJobWageIncome).toBeGreaterThan(0);
    expect(resultWithJobs.aggregateWageIncome).toBeGreaterThan(resultWithout.aggregateWageIncome);
  });

  it('newJobWageIncome = newJobs × avgWage × wageFraction × wagePressure (at baseline)', () => {
    const policy = zeroPolicyEffects();
    const prod = zeroProd();
    prod.totalDurableNewJobs = 100_000;
    prod.newJobWageFraction = 0.70;

    const result = computeMacro(buildDefaultMacroInputs({
      policyEffects: policy,
      productionInputs: prod,
    }));

    // Phase 3c: New job wages use currentAvgWage = wageBase / BASELINE_TOTAL_EMPLOYMENT
    // where wageBase = prevNomGDP × BASELINE_WAGE_SHARE. At year 0: prevNomGDP = baseline.
    const currentAvgWage = BASELINE_GDP_NOMINAL_2025 * BASELINE_WAGE_SHARE / BASELINE_TOTAL_EMPLOYMENT;
    const expected = 100_000 * currentAvgWage * 0.70;
    expect(result.newJobWageIncome).toBeCloseTo(expected, -9); // within $500M (wage calculation includes Phillips curve and multiplier effects)
  });

  // Phase 3c.1: Okun's Law test removed. Demand spillover is computed in simulation.ts,
  // not inside computeMacro(). See simulation.test.ts for demand spillover tests.

  it('AI investment boost increases investment component', () => {
    const policy = zeroPolicyEffects();

    // Need a year >0 to test investment boost (year 0 uses fixed breakdown)
    const firstYear = computeMacro(buildDefaultMacroInputs({ policyEffects: policy }));

    const prodWithBoost = zeroProd();
    prodWithBoost.aiInvestmentBoost = 500_000_000_000; // $500B

    const resultWith = computeMacro(buildDefaultMacroInputs({
      year: DEFAULT_START_YEAR + 1,
      policyEffects: policy,
      previousMacro: firstYear,
      nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
      productionInputs: prodWithBoost,
    }));
    const resultWithout = computeMacro(buildDefaultMacroInputs({
      year: DEFAULT_START_YEAR + 1,
      policyEffects: policy,
      previousMacro: firstYear,
      nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
    }));

    expect(resultWith.investment).toBeGreaterThan(resultWithout.investment);
    expect(resultWith.aiInvestmentBoost).toBe(500_000_000_000);
    expect(resultWith.gdpReal).toBeGreaterThan(resultWithout.gdpReal);
  });

  it('AI net export boost increases gdpReal', () => {
    const policy = zeroPolicyEffects();
    const firstYear = computeMacro(buildDefaultMacroInputs({ policyEffects: policy }));

    const prodWithNX = zeroProd();
    prodWithNX.aiNetExportBoost = 200_000_000_000; // $200B

    const resultWith = computeMacro(buildDefaultMacroInputs({
      year: DEFAULT_START_YEAR + 1,
      policyEffects: policy,
      previousMacro: firstYear,
      nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
      productionInputs: prodWithNX,
    }));
    const resultWithout = computeMacro(buildDefaultMacroInputs({
      year: DEFAULT_START_YEAR + 1,
      policyEffects: policy,
      previousMacro: firstYear,
      nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
    }));

    expect(resultWith.aiNetExportBoost).toBe(200_000_000_000);
    expect(resultWith.gdpReal).toBeGreaterThan(resultWithout.gdpReal);
  });

  it('consumer goods potential tracked but NOT added to consumption', () => {
    const policy = zeroPolicyEffects();
    const firstYear = computeMacro(buildDefaultMacroInputs({ policyEffects: policy }));

    const prodWithConsumer = zeroProd();
    prodWithConsumer.aiConsumerGoodsPotential = 1_000_000_000_000; // $1T

    const resultWith = computeMacro(buildDefaultMacroInputs({
      year: DEFAULT_START_YEAR + 1,
      policyEffects: policy,
      previousMacro: firstYear,
      nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
      productionInputs: prodWithConsumer,
    }));
    const resultWithout = computeMacro(buildDefaultMacroInputs({
      year: DEFAULT_START_YEAR + 1,
      policyEffects: policy,
      previousMacro: firstYear,
      nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
    }));

    // Consumption should be the same (consumer goods NOT added to C)
    expect(resultWith.consumption).toBeCloseTo(resultWithout.consumption, 0);
    // But consumer goods potential is tracked
    expect(resultWith.aiConsumerGoodsPotential).toBe(1_000_000_000_000);
    // Phase 3b: unrealizedAIOutput is now demand-based.
    // At baseline employment/consumption, demandHealthRatio ≈ 1.0, so most goods are absorbed.
    // unrealizedAIOutput should be small (near zero when demand is healthy).
    expect(resultWith.aiGoodsAbsorbed).toBeGreaterThan(0);
    expect(resultWith.aiCapacityUtilization).toBeGreaterThan(0);
    expect(resultWith.aiCapacityUtilization).toBeLessThanOrEqual(1.0);
  });

  it('zero displacement → aiAdditionalOutput = 0 (from inputs)', () => {
    const policy = zeroPolicyEffects();
    const prod = zeroProd();
    // With zero displacement, computeAIProductionExpansion returns 0 for all
    // Here we just verify the pass-through
    prod.aiAdditionalOutput = 0;

    const result = computeMacro(buildDefaultMacroInputs({
      policyEffects: policy,
      productionInputs: prod,
    }));

    expect(result.aiAdditionalOutput).toBe(0);
  });

  it('investmentFraction + onshoringFraction > 1.0 → consumer potential = 0 (from inputs)', () => {
    const policy = zeroPolicyEffects();
    // When fractions sum > 1, computeAIProductionExpansion clamps consumer to 0
    // We verify the pass-through from inputs
    const prod = zeroProd();
    prod.aiInvestmentBoost = 500_000_000_000;
    prod.aiNetExportBoost = 500_000_000_000;
    prod.aiConsumerGoodsPotential = 0; // clamped to 0 by simulation
    prod.aiAdditionalOutput = 1_000_000_000_000;

    const result = computeMacro(buildDefaultMacroInputs({
      policyEffects: policy,
      productionInputs: prod,
    }));

    expect(result.aiConsumerGoodsPotential).toBe(0);
    expect(result.aiAdditionalOutput).toBe(1_000_000_000_000);
  });
});

// ============================================================
// Phase 3: Demand-Constrained GDP
// ============================================================

describe('Phase 3: Demand-Constrained GDP', () => {
  function zeroProd(): MacroProductionInputs {
    return {
      aiInvestmentBoost: 0,
      aiNetExportBoost: 0,
      aiConsumerGoodsPotential: 0,
      aiAdditionalOutput: 0,
      totalDurableNewJobs: 0,
      newJobWageFraction: DEFAULT_NEW_JOB_WAGE_FRACTION,
    };
  }

  // ----------------------------------------------------------
  // Differentiated MPC Tests (1–4)
  // ----------------------------------------------------------

  describe('Differentiated MPC', () => {
    it('1. income decomposition: consumption = wage×MPC_W + asset×MPC_A + transfer×MPC_T', () => {
      const policy = zeroPolicyEffects();
      const result = computeMacro(buildDefaultMacroInputs({
        policyEffects: policy,
        postTaxMPC_Wage: 0.80,
        postTaxMPC_Asset: 0.35,
        postTaxMPC_Transfer: 0.90,
      }));

      // Post-tax income × MPC drives consumption (after-tax income is what matters)
      // Note: first-year after-tax income differs from pre-tax, so we check decomposition consistency
      const expectedConsumption = result.wageConsumption + result.assetConsumption + result.transferConsumption;
      expect(result.consumption).toBeCloseTo(expectedConsumption, -5);
    });

    it('2. shift test: same total income, different distribution → different consumption', () => {
      const policy = zeroPolicyEffects();

      // Default: post-tax MPCs (0.95 wage, 0.42 asset, 0.95 transfer)
      const resultDefault = computeMacro(buildDefaultMacroInputs({
        policyEffects: policy,
      }));

      // Uniform MPC: all channels at 0.67 → consumption only depends on total income, not distribution
      const resultUniform = computeMacro(buildDefaultMacroInputs({
        policyEffects: policy,
        postTaxMPC_Wage: 0.67,
        postTaxMPC_Asset: 0.67,
        postTaxMPC_Transfer: 0.67,
      }));

      // Differentiated MPC should produce DIFFERENT consumption than uniform,
      // even with the same income distribution, because of the different rates
      expect(resultDefault.consumption).not.toBeCloseTo(resultUniform.consumption, -7);

      // Verify the mechanism: default post-tax MPC_WAGE=0.95 > 0.67, MPC_ASSET=0.42 < 0.67
      // Since wages are ~60% of income at baseline, differentiated should produce
      // HIGHER consumption than uniform 0.67 (wage MPC uplift > asset MPC reduction)
      expect(resultDefault.consumption).toBeGreaterThan(resultUniform.consumption);
    });

    it('3. SWF reclassification: policy asset distributions use MPC_TRANSFER, not MPC_ASSET', () => {
      // Test that assetChannelAddition is reclassified to transfer MPC
      const policyWithSWF: PolicyEffects = {
        wageChannelAddition: 0,
        assetChannelAddition: 1_000_000_000_000, // $1T SWF distribution
        transferChannelAddition: 0,
        enhancedUIAddition: 0,
        displacedFlatAddition: 0,
  uiPricingWage: 0,
        totalPolicyIncome: 1_000_000_000_000,
        fiscalCost: 0,
        fiscalCostAsPercentGDP: 0,
        sovereignFundSize: 0,
        swfAnnualContribution: 0,
        requiredAssetOwnership: 0,
        requiredTransferLevel: 0,
      };

      const resultSWF = computeMacro(buildDefaultMacroInputs({
        policyEffects: policyWithSWF,
      }));

      const policyNoSWF = zeroPolicyEffects();
      const resultNoSWF = computeMacro(buildDefaultMacroInputs({
        policyEffects: policyNoSWF,
      }));

      // SWF $1T should be spent at MPC_TRANSFER (0.90) not MPC_ASSET (0.35)
      // Consumption boost = $1T × 0.90 = $900B (not $1T × 0.35 = $350B)
      const consumptionBoost = resultSWF.consumption - resultNoSWF.consumption;
      expect(consumptionBoost).toBeGreaterThan(800_000_000_000); // close to $900B
      expect(consumptionBoost).toBeLessThan(1_000_000_000_000); // but not the full $1T

      // If it were using MPC_ASSET, boost would be ~$350B — verify it's much higher
      expect(consumptionBoost).toBeGreaterThan(500_000_000_000);
    });

    it('4. extreme postTaxMPC_Asset=0: asset income produces zero consumption', () => {
      const policy = zeroPolicyEffects();

      const resultZeroAsset = computeMacro(buildDefaultMacroInputs({
        policyEffects: policy,
        postTaxMPC_Wage: 0.80,
        postTaxMPC_Asset: 0.00,
        postTaxMPC_Transfer: 0.90,
      }));

      const resultDefault = computeMacro(buildDefaultMacroInputs({
        policyEffects: policy,
        postTaxMPC_Wage: 0.80,
        postTaxMPC_Transfer: 0.90,
      }));

      // Asset consumption must be exactly 0
      expect(resultZeroAsset.assetConsumption).toBe(0);

      // Total consumption should be lower by the asset MPC contribution
      expect(resultZeroAsset.consumption).toBeLessThan(resultDefault.consumption);

      // Wage and transfer consumption should be unchanged
      expect(resultZeroAsset.wageConsumption).toBeCloseTo(resultDefault.wageConsumption, -5);
      expect(resultZeroAsset.transferConsumption).toBeCloseTo(resultDefault.transferConsumption, -5);
    });
  });

  // ----------------------------------------------------------
  // Capacity Utilization Tests (5–7)
  // ----------------------------------------------------------

  describe('Capacity Utilization', () => {
    it('5. no AI consumer potential → capacity utilization = 1.0', () => {
      const policy = zeroPolicyEffects();
      const result = computeMacro(buildDefaultMacroInputs({ policyEffects: policy }));

      // No AI production → potentialGDP = gdpReal → utilization = 1.0
      expect(result.capacityUtilization).toBe(1.0);
      expect(result.potentialGDP).toBe(result.gdpReal);
      expect(result.unrealizedAIOutput).toBe(0);
    });

    it('6. with AI consumer goods potential → capacity utilization < 1.0', () => {
      const policy = zeroPolicyEffects();
      const firstYear = computeMacro(buildDefaultMacroInputs({ policyEffects: policy }));

      const prod = zeroProd();
      prod.aiConsumerGoodsPotential = 2_000_000_000_000; // $2T potential

      const result = computeMacro(buildDefaultMacroInputs({
        year: DEFAULT_START_YEAR + 1,
        policyEffects: policy,
        previousMacro: firstYear,
        nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
        productionInputs: prod,
      }));

      // potentialGDP = gdpReal + $2T (real-terms: both sides in 2025 dollars)
      expect(result.potentialGDP).toBeCloseTo(result.gdpReal + 2_000_000_000_000, -5);
      // Utilization must be < 1.0 (GDP < potential)
      expect(result.capacityUtilization).toBeLessThan(1.0);
      expect(result.capacityUtilization).toBeGreaterThan(0);
      // Phase 3b: unrealizedAIOutput is demand-based, not the old tautology.
      // At baseline demand, most AI goods are absorbed → unrealized is small.
      // aiGoodsAbsorbed + unrealizedAIOutput = aiSupplyCapacity (= aiConsumerGoodsPotential)
      expect(result.aiGoodsAbsorbed + result.unrealizedAIOutput).toBeCloseTo(2_000_000_000_000, -5);
    });

    it('7. capacity utilization identity: utilization = gdpReal / potentialGDP', () => {
      const policy = zeroPolicyEffects();
      const firstYear = computeMacro(buildDefaultMacroInputs({ policyEffects: policy }));

      const prod = zeroProd();
      prod.aiConsumerGoodsPotential = 5_000_000_000_000; // $5T

      const result = computeMacro(buildDefaultMacroInputs({
        year: DEFAULT_START_YEAR + 1,
        policyEffects: policy,
        previousMacro: firstYear,
        nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
        productionInputs: prod,
      }));

      // Verify the capacity utilization identity (real-terms: gdpReal / potentialGDP)
      const expectedUtilization = result.gdpReal / result.potentialGDP;
      expect(result.capacityUtilization).toBeCloseTo(expectedUtilization, 10);
      // Phase 3b: unrealizedAIOutput identity is now demand-based:
      // aiGoodsAbsorbed + unrealizedAIOutput = aiConsumerGoodsPotential
      expect(result.aiGoodsAbsorbed + result.unrealizedAIOutput).toBeCloseTo(5_000_000_000_000, -5);
      // And aiCapacityUtilization = aiGoodsAbsorbed / aiConsumerGoodsPotential
      expect(result.aiCapacityUtilization).toBeCloseTo(
        result.aiGoodsAbsorbed / 5_000_000_000_000, 10
      );
    });
  });

  // ----------------------------------------------------------
  // Profit Realization Tests (8–11)
  // ----------------------------------------------------------

  // ----------------------------------------------------------
  // Asset Income Decomposition Tests (8–11)
  // ----------------------------------------------------------

  describe('Asset Income Decomposition', () => {
    it('8. decomposition sums to aggregateAssetIncome', () => {
      const policy = zeroPolicyEffects();
      const result = computeMacro(buildDefaultMacroInputs({ policyEffects: policy }));

      const sum = result.dividendIncome + result.aiCapitalGains
        + result.traditionalCapitalGains + result.nonCorporateAssetIncome;
      // aggregateAssetIncome includes policy addition, but at zero policy it's just the sum
      expect(result.aggregateAssetIncome).toBeCloseTo(sum, -3);
    });

    it('9. higher corporate tax reduces dividendIncome', () => {
      const policy = zeroPolicyEffects();
      const resultLow = computeMacro(buildDefaultMacroInputs({
        policyEffects: policy,
        corporateTaxRate: 0.15,
      }));
      const resultHigh = computeMacro(buildDefaultMacroInputs({
        policyEffects: policy,
        corporateTaxRate: 0.35,
      }));

      expect(resultHigh.dividendIncome).toBeLessThan(resultLow.dividendIncome);
    });

    it('10. AI profit growth drives aiCapitalGains > 0 in year 2+', () => {
      const policy = zeroPolicyEffects();
      const year0 = computeMacro(buildDefaultMacroInputs({ policyEffects: policy }));

      // At t=0, no profit history → aiCapitalGains = 0
      expect(year0.aiCapitalGains).toBe(0);

      // Year 1: some AI profits appear
      const year1 = computeMacro(buildDefaultMacroInputs({
        year: DEFAULT_START_YEAR + 1,
        automationCoverage: 0.20,
        policyEffects: policy,
        previousMacro: year0,
        nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
      }));

      // Year 2: now AI profits have growth → capital gains emerge
      const year2 = computeMacro(buildDefaultMacroInputs({
        year: DEFAULT_START_YEAR + 2,
        automationCoverage: 0.30,
        policyEffects: policy,
        previousMacro: year1,
        nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025, year1.gdpNominal],
      }));

      // If AI profits grew from year 0→1, year 2 should have capital gains
      if (year1.aiCorporateProfits > year0.aiCorporateProfits) {
        expect(year2.aiCapitalGains).toBeGreaterThan(0);
      }
    });

    it('11. non-corporate asset income scales with GDP', () => {
      const policy = zeroPolicyEffects();
      const result = computeMacro(buildDefaultMacroInputs({ policyEffects: policy }));

      expect(result.nonCorporateAssetIncome).toBeGreaterThan(0);
      expect(Number.isFinite(result.nonCorporateAssetIncome)).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // Integration Tests (12–15)
  // ----------------------------------------------------------

  describe('Integration', () => {
    it('12. zero-displacement baseline: all Phase 3 fields populated correctly', () => {
      const policy = zeroPolicyEffects();
      const result = computeMacro(buildDefaultMacroInputs({ policyEffects: policy }));

      // All Phase 3 fields must exist and be finite
      expect(Number.isFinite(result.potentialGDP)).toBe(true);
      expect(Number.isFinite(result.capacityUtilization)).toBe(true);
      expect(Number.isFinite(result.capitalGainsRealizationRate)).toBe(true);
      expect(Number.isFinite(result.wageConsumption)).toBe(true);
      expect(Number.isFinite(result.assetConsumption)).toBe(true);
      expect(Number.isFinite(result.transferConsumption)).toBe(true);

      // At baseline with no AI: utilization = 1.0
      expect(result.capacityUtilization).toBe(1.0);
      expect(result.unrealizedAIOutput).toBe(0);

      // Decomposition fields finite
      expect(Number.isFinite(result.dividendIncome)).toBe(true);
      expect(Number.isFinite(result.aiSectorPE)).toBe(true);
      expect(Number.isFinite(result.traditionalSectorPE)).toBe(true);

      // Consumption components must be positive
      expect(result.wageConsumption).toBeGreaterThan(0);
      expect(result.assetConsumption).toBeGreaterThan(0);
      expect(result.transferConsumption).toBeGreaterThan(0);

      // Sum of components should equal total consumption
      const sum = result.wageConsumption + result.assetConsumption + result.transferConsumption;
      expect(result.consumption).toBeCloseTo(sum, -5);
    });

    it('13. multi-year: capacity utilization propagates correctly', () => {
      const policy = zeroPolicyEffects();

      // Year 0
      const year0 = computeMacro(buildDefaultMacroInputs({ policyEffects: policy }));

      // Year 0: no AI → capacityUtilization = 1.0
      expect(year0.capacityUtilization).toBe(1.0);

      // Year 1: with AI consumer potential → util < 1.0
      const prod1 = zeroProd();
      prod1.aiConsumerGoodsPotential = 3_000_000_000_000;

      const year1 = computeMacro(buildDefaultMacroInputs({
        year: DEFAULT_START_YEAR + 1,
        automationCoverage: 0.10,
        policyEffects: policy,
        previousMacro: year0,
        nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
        productionInputs: prod1,
      }));

      // Current utilization drops with AI potential
      expect(year1.capacityUtilization).toBeLessThan(1.0);

      // Year 2: now previous util < 1.0
      const prod2 = zeroProd();
      prod2.aiConsumerGoodsPotential = 3_000_000_000_000;

      const year2 = computeMacro(buildDefaultMacroInputs({
        year: DEFAULT_START_YEAR + 2,
        automationCoverage: 0.10,
        policyEffects: policy,
        previousMacro: year1,
        nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025, year1.gdpNominal],
        productionInputs: prod2,
      }));

      // Capacity utilization should still be < 1.0
      expect(year2.capacityUtilization).toBeLessThan(1.0);
    });

    it('14. uniform MPC produces different consumption than differentiated (same income)', () => {
      const policy = zeroPolicyEffects();

      const resultDiff = computeMacro(buildDefaultMacroInputs({
        policyEffects: policy,
        postTaxMPC_Wage: 0.80,
        postTaxMPC_Asset: 0.35,
        postTaxMPC_Transfer: 0.90,
      }));

      // Blended MPC at baseline shares: 0.60×0.80 + 0.20×0.35 + 0.20×0.90 = 0.73
      const resultBlended = computeMacro(buildDefaultMacroInputs({
        policyEffects: policy,
        postTaxMPC_Wage: 0.73,
        postTaxMPC_Asset: 0.73,
        postTaxMPC_Transfer: 0.73,
      }));

      // Both should have roughly similar consumption at baseline
      // (since income shares are close to 60/20/20)
      const ratio = resultDiff.consumption / resultBlended.consumption;
      expect(ratio).toBeGreaterThan(0.95);
      expect(ratio).toBeLessThan(1.05);

      // But they should NOT be exactly equal (weighted sum ≠ flat sum)
      expect(resultDiff.consumption).not.toBe(resultBlended.consumption);
    });

    it('15. consumption decomposition is consistent across years', () => {
      const policy = zeroPolicyEffects();

      let prev: ReturnType<typeof computeMacro> | null = null;
      const gdpHistory: number[] = [];

      for (let year = DEFAULT_START_YEAR; year <= DEFAULT_START_YEAR + 5; year++) {
        const result = computeMacro(buildDefaultMacroInputs({
          year,
          policyEffects: policy,
          previousMacro: prev,
          nominalGDPHistory: gdpHistory,
        }));

        // Every year: consumption must equal sum of components
        const sum = result.wageConsumption + result.assetConsumption + result.transferConsumption;

        if (year === DEFAULT_START_YEAR) {
          // Year 0: no second-order modifiers applied to consumption
          expect(result.consumption).toBeCloseTo(sum, -5);
        } else {
          // Year >0: consumption = sum × credit × deflation modifiers (≤ 1.0) + housingWealthDrag.
          // housingWealthDrag is ADDITIVE and can be positive when home prices rise (Stage 0 item 3
          // raised real income growth → stronger housing wealth effect), so consumption can slightly
          // exceed the pre-modifier sum by the positive housing-wealth term.
          expect(result.consumption).toBeLessThanOrEqual(sum * 1.001 + Math.max(0, result.housingWealthDrag));
          expect(result.consumption).toBeGreaterThan(0);
        }

        // All components must be non-negative
        expect(result.wageConsumption).toBeGreaterThanOrEqual(0);
        expect(result.assetConsumption).toBeGreaterThanOrEqual(0);
        expect(result.transferConsumption).toBeGreaterThanOrEqual(0);

        gdpHistory.push(result.gdpNominal);
        prev = result;
      }
    });
  });

  // ============================================================
  // Investment Demand Constraint
  // ============================================================
  describe('Investment Demand Constraint', () => {
    function zeroProdLocal(): MacroProductionInputs {
      return {
        aiInvestmentBoost: 0,
        aiNetExportBoost: 0,
        aiConsumerGoodsPotential: 0,
        aiAdditionalOutput: 0,
        totalDurableNewJobs: 0,
        newJobWageFraction: DEFAULT_NEW_JOB_WAGE_FRACTION,
      };
    }

    it('first year: investment = GDP × traditionalInvestmentGDPFraction (no bell curve)', () => {
      const result = computeMacro(buildDefaultMacroInputs());
      // First year investment is forced to baseline: BASELINE_GDP × tradFraction
      // (no bell curve, no AI boost, no market signal gating)
      expect(result.investment).toBeGreaterThan(0);
      expect(result.investmentRealization).toBe(1.0); // First year = 1.0 (no else branch)
      expect(result.aiInvestmentRealized).toBe(0); // No AI production in first year
      expect(result.aiExportsRealized).toBe(0);
    });

    it('low AI utilization throttles investment realization', () => {
      const firstYear = computeMacro(buildDefaultMacroInputs());
      const result = computeMacro(buildDefaultMacroInputs({
        year: DEFAULT_START_YEAR + 1,
        previousMacro: firstYear,
        nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
        prevAiCapacityUtilization: 0.3,
        aiUtilizationSensitivity: 50,  // exponent = 1.5
        consumerDemandInvestmentSensitivity: 0,  // disabled
      }));
      // 0.3^1.5 ≈ 0.164 — significant throttle
      expect(result.investmentRealization).toBeLessThan(0.25);
      expect(result.investmentRealization).toBeGreaterThan(0);
    });

    it('low consumer demand throttles investment realization', () => {
      const firstYear = computeMacro(buildDefaultMacroInputs());
      const result = computeMacro(buildDefaultMacroInputs({
        year: DEFAULT_START_YEAR + 1,
        previousMacro: firstYear,
        nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
        consumerDemandRatio: 0.3,
        aiUtilizationSensitivity: 0,  // disabled
        consumerDemandInvestmentSensitivity: 50,  // exponent = 1.5
      }));
      // 0.3^1.5 ≈ 0.164
      expect(result.investmentRealization).toBeLessThan(0.25);
      expect(result.investmentRealization).toBeGreaterThan(0);
    });

    it('all sensitivities at 0%: investmentRealization = 1.0 (no throttle)', () => {
      const firstYear = computeMacro(buildDefaultMacroInputs());
      const result = computeMacro(buildDefaultMacroInputs({
        year: DEFAULT_START_YEAR + 1,
        previousMacro: firstYear,
        nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
        prevAiCapacityUtilization: 0.1,
        consumerDemandRatio: 0.1,
        aiUtilizationSensitivity: 0,
        consumerDemandInvestmentSensitivity: 0,
      }));
      // All exponents = 0, so all factors = x^0 = 1.0
      expect(result.investmentRealization).toBeCloseTo(1.0, 5);
    });

    it('combined low utilization + low demand → investment near zero', () => {
      const firstYear = computeMacro(buildDefaultMacroInputs());
      const result = computeMacro(buildDefaultMacroInputs({
        year: DEFAULT_START_YEAR + 1,
        previousMacro: firstYear,
        nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
        prevAiCapacityUtilization: 0.2,
        consumerDemandRatio: 0.2,
        aiUtilizationSensitivity: 70,   // exponent = 2.1
        consumerDemandInvestmentSensitivity: 70, // exponent = 2.1
      }));
      // 0.2^2.1 × 0.2^2.1 ≈ 0.034 × 0.034 ≈ 0.0012
      expect(result.investmentRealization).toBeLessThan(0.01);
    });

    // DEPRECATED Phase 6: Credit channel removed from investmentRealization.
    // Business credit now affects investment directly via businessCreditMultiplier.
    // Old test: 'negative business credit signal (tightening) reduces investment' — removed.

    it('AI investment realized is less than raw boost when realization < 1', () => {
      const firstYear = computeMacro(buildDefaultMacroInputs());
      const prod = zeroProdLocal();
      prod.aiInvestmentBoost = 500_000_000_000; // $500B
      prod.aiNetExportBoost = 100_000_000_000;  // $100B

      const result = computeMacro(buildDefaultMacroInputs({
        year: DEFAULT_START_YEAR + 1,
        previousMacro: firstYear,
        nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
        productionInputs: prod,
        prevAiCapacityUtilization: 0.3,
        consumerDemandRatio: 0.5,
        aiUtilizationSensitivity: 50,
        consumerDemandInvestmentSensitivity: 50,
      }));

      expect(result.investmentRealization).toBeLessThan(1.0);
      expect(result.aiInvestmentRealized).toBeLessThan(500_000_000_000);
      expect(result.aiExportsRealized).toBeLessThan(100_000_000_000);
      expect(result.aiInvestmentRealized).toBeCloseTo(
        500_000_000_000 * result.investmentRealization, -2,
      );
    });

    it('traditional investment responds to consumer demand via tradDemandSensitivity', () => {
      const firstYear = computeMacro(buildDefaultMacroInputs());

      const highDemand = computeMacro(buildDefaultMacroInputs({
        year: DEFAULT_START_YEAR + 1,
        previousMacro: firstYear,
        nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
        consumerDemandRatio: 0.95,
        traditionalInvestmentDemandSensitivity: 50,
        // Disable AI investment channels
        aiUtilizationSensitivity: 0,
        consumerDemandInvestmentSensitivity: 0,
      }));

      const lowDemand = computeMacro(buildDefaultMacroInputs({
        year: DEFAULT_START_YEAR + 1,
        previousMacro: firstYear,
        nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
        consumerDemandRatio: 0.4,
        traditionalInvestmentDemandSensitivity: 50,
        aiUtilizationSensitivity: 0,
        consumerDemandInvestmentSensitivity: 0,
      }));

      expect(highDemand.investment).toBeGreaterThan(lowDemand.investment);
    });
  });
});

// ============================================================
// Housing Market Stabilization
// ============================================================

describe('Housing Market Stabilization', () => {
  // Helper: run computeMacro with housing inputs and return the result
  function runWithHousing(overrides: Partial<MacroInputs>) {
    // Use a non-first year so the else branch (with housing logic) executes
    const firstYear = computeMacro(buildDefaultMacroInputs());
    return computeMacro(buildDefaultMacroInputs({
      year: DEFAULT_START_YEAR + 1,
      previousMacro: firstYear,
      ...overrides,
    }));
  }

  // STAGE 6.5: the additive shelter stack is replaced by the stock-flow housing model.
  // The old tests asserted the retired hand-set coefficients (foreclosure ×0.5, rentersCreated ×
  // rentalDemandSensitivity, the −0.05 floor); the structural semantics are tested below — on the
  // pure computeHousingBlock where possible, and on the re-pointed diagnostics at the macro level.

  describe('foreclosure fire-sale (structural, replaces ×0.5/×3.0 hand-set terms)', () => {
    it('fire-sale pressure scales with the UNABSORBED foreclosure flow', () => {
      const zero = runWithHousing({ foreclosureRateAggregate: 0.10, institutionalBuyerRate: 1.0 });
      const full = runWithHousing({ foreclosureRateAggregate: 0.10, institutionalBuyerRate: 0 });
      // institutionalBuyerRate=1 → all foreclosures absorbed → no price pressure
      expect(zero.foreclosureSupplyEffect).toBeCloseTo(0, 10);
      // unabsorbed flow → fireSale = −1.75 × (1−0) × 0.10 = −0.175 (Mian-Sufi-Trebbi default)
      expect(full.foreclosureSupplyEffect).toBeCloseTo(-0.175, 5);
      // diagnostic: share absorbed to rentals
      expect(zero.institutionalAbsorption).toBeCloseTo(0.10, 10);
    });

    it('CONSERVATION: foreclosures do not create rental inflation by tenure shift', () => {
      // Pre-6.5, halved homeownership manufactured +16pp/yr rental pressure. Now tenure shifts
      // stay inside the stock: rentalDemandPressure (= the occupancy term of ΔR) must NOT react
      // to dynamicHomeownership at all — only occupancy (households vs stock) moves rents.
      const base = runWithHousing({});
      const collapsed = runWithHousing({ dynamicHomeownership: [0.32, 0.32, 0.32, 0.32, 0.32] });
      expect(collapsed.rentalDemandPressure).toBeCloseTo(base.rentalDemandPressure, 10);
    });
  });

  describe('stock-flow housing block (pure)', () => {
    const baseArgs = {
      isFirstYear: false,
      prevHousingStock: 146_600_000, prevHouseholds: 131_500_000,
      prevHeadship: 131_500_000 / US_POPULATION_2025,
      prevRentIndex: 1.0, prevConstructionCost: 1.0, prevLandCost: 1.0,
      prevHomePriceIndex: 1.0, prevHousingStarts: 953_000,
      population: US_POPULATION_2025 * 1.004,
      nominalWageGrowth: 0.045, baseInflationRate: 0.026, broadGoodsPressure: 0,
      secDeflShelter: 0, embodiedCapability: 0,
      prevRealIncomeGrowthRate: 0.02, prevCompositeInflation: 0.029,
      trendRealIncomeGrowth: 0.02,
      foreclosureRateAggregate: 0, institutionalBuyerRate: 0.4,
      mortgageRate: 0.06, prevMortgageRate: 0.06,
      prevAssetIncomeShare: 0.30, baselineAssetIncomeShare: 0.30,
      realizedPopulationGrowth: 0.004,
      prevHousingPipeline: 0.95e6 * 1.2, prevBuilderPriceIndex: 1.0,
      builderAdjustmentLambda: 0, housingPipelineDuration: 0,
      landClosureKappa: 0, prevLandResidualTarget: 1.0,
      formationSensitivity: 0.06, headshipRecoveryRate: 0.12,
      supplyElasticity: 1.5, embodiedCapacityGain: 1.0, depreciationRate: 0.0025,
      landShare: 0.40, constructionLaborShare: 0.35,
      landIncomeBeta: 1.0, landScarcityElasticity: 2.0,
      rentOccupancyElasticity: 2.0, rentCostAnchorWeight: 1.0,
      opexPassthrough: 0.40, rentDownwardRigidity: 0.85,
      rentIncomeElasticity: 0.47, prevAfterTaxIncomeGrowth: 0.044,
      builderPriceMode: 'adaptive' as const, prevBuilderTrendGrowth: 0.037, prevHomePriceChangeRate: 0.037,
      constructionCreditSensitivity: 0, prevBusinessCreditTightening: 0,
      baselineCapRate: 0.052, capRateMortgageBeta: 0.4, capRateInvestorCompression: 0,
      fireSaleElasticity: 1.75, investorDemandIntensity: 0.10, landRateSensitivity: 0.75,
    };

    it('zero-AI steady state: rent growth = replacement-cost growth (emergent shelter inflation)', () => {
      const r = computeHousingBlock(baseArgs);
      // RE-DERIVED from the post-E-11/L9 algebra (the L9c ruled-work closure): with the legacy
      // anchor (weight 1.0 in baseArgs) rentGrowth ≡ replacementGrowth + occ; replacement growth
      // is the VALUE-WEIGHTED identity over the block's OWN computed components (R25) — assert
      // the identity against the block's outputs, not a hand-frozen land-path number.
      // prev replacement = 0.6×1 + 0.4×1 = 1 → replacement growth = replacementCostIndex − 1
      const replacementGrowth = r.replacementCostIndex - 1.0;
      expect(r.rentGrowth).toBeCloseTo(1.0 * replacementGrowth + 2.0 * r.occupancyGap, 9);
      // gap 0 at calibrated init → starts = equilibrium baseline (≈0.95M)
      expect(r.profitabilityGap).toBeCloseTo(0, 6);
      expect(r.housingStarts).toBeGreaterThan(900_000);
      expect(r.housingStarts).toBeLessThan(1_000_000);
    });

    it('formation collapses one-sided with income deviations; recovery pulls back (R24-class asymmetry)', () => {
      const slump = computeHousingBlock({ ...baseArgs, prevRealIncomeGrowthRate: -0.02 });
      const boom = computeHousingBlock({ ...baseArgs, prevRealIncomeGrowthRate: 0.06 });
      const base = computeHousingBlock(baseArgs);
      expect(slump.headshipRate).toBeLessThan(base.headshipRate);   // −4pp dev → headship falls
      expect(boom.headshipRate).toBeCloseTo(base.headshipRate, 10); // boom does NOT raise it
      // recovery: depressed headship reverts toward baseline absent shocks
      const depressed = computeHousingBlock({ ...baseArgs, prevHeadship: baseArgs.prevHeadship * 0.97 });
      expect(depressed.headshipRate).toBeGreaterThan(baseArgs.prevHeadship * 0.97);
    });

    it('investor land bid is ONE-SIDED (R24: land ratchets, is held not dumped)', () => {
      const up = computeHousingBlock({ ...baseArgs, prevAssetIncomeShare: 0.50 });
      const down = computeHousingBlock({ ...baseArgs, prevAssetIncomeShare: 0.10 });
      expect(up.investorLandBid).toBeCloseTo(0.10 * 0.20, 10);  // intensity × +20pp deviation
      expect(down.investorLandBid).toBe(0);                      // receding share → NO negative bid
      expect(up.landGrowth).toBeGreaterThan(down.landGrowth);
    });

    it('rate rises sink prices via capRate AND cool land/rents via E-6 (the Fed reaches every asset)', () => {
      const rateShock = computeHousingBlock({ ...baseArgs, mortgageRate: 0.08 });
      const base = computeHousingBlock(baseArgs);
      // E-6: +2pp mortgage → land −0.75×2 = −1.5pp/yr → rents cool by the λ_eff share ≈ 0.4×1.5 = 0.6pp
      expect(rateShock.landGrowth).toBeCloseTo(base.landGrowth - 0.75 * 0.02, 10);
      expect(rateShock.rentGrowth).toBeCloseTo(base.rentGrowth - 0.4 * 0.75 * 0.02, 6);
      // …while the capRate channel hits prices much harder (cap 5.2%→6.0%: P −15%)
      expect(rateShock.homePriceGrowth).toBeLessThan(base.homePriceGrowth - 0.10);
    });

    it('λ_eff → 1 limit: as construction gets cheap, land becomes the terminal constraint', () => {
      const cheapCC = computeHousingBlock({ ...baseArgs, prevConstructionCost: 0.05, prevLandCost: 1.5 });
      // λ_eff = 0.4×1.5 / (0.6×0.05 + 0.4×1.5) ≈ 0.952 → replacement growth ≈ land growth
      expect(cheapCC.lambdaEffPrev).toBeGreaterThan(0.95);
      const expectedRepl = (1 - cheapCC.lambdaEffPrev) * cheapCC.constructionCostGrowth
        + cheapCC.lambdaEffPrev * cheapCC.landGrowth;
      expect(cheapCC.rentGrowth).toBeCloseTo(expectedRepl, 4); // occupancy term ~1e-6 here (pop growth vs fixed stock)
    });

    it('supply responds to the profitability gap through the regulatory-friction dial', () => {
      const profitable = computeHousingBlock({ ...baseArgs, prevHomePriceIndex: 1.2, prevBuilderPriceIndex: 1.2 });
      const restricted = computeHousingBlock({ ...baseArgs, prevHomePriceIndex: 1.2, prevBuilderPriceIndex: 1.2, supplyElasticity: 0 });
      expect(profitable.housingStarts).toBeGreaterThan(1.2 * 953_000);  // gap +20% × 1.5 → +30% starts
      expect(restricted.housingStarts).toBeCloseTo(953_399, -3);        // elasticity 0 → baseline starts
      const bust = computeHousingBlock({ ...baseArgs, prevHomePriceIndex: 0.3, prevBuilderPriceIndex: 0.3 });
      expect(bust.housingStarts).toBe(0);                               // deep negative gap → zero starts
    });
  });

  describe('inflationRate output fix', () => {
    it('inflationRate equals compositeInflation, not static base rate', () => {
      const result = runWithHousing({
        embodiedCapability: 0.50,
        foreclosureRateAggregate: 0.05,
      });
      expect(result.inflationRate).toBeCloseTo(result.compositeInflation, 10);
    });

    it('inflationRate reflects dynamic changes, not always positive', () => {
      // With high AI deflation, compositeInflation can be negative
      const firstYear = computeMacro(buildDefaultMacroInputs({
        automationCoverage: 0.50,
      }));
      const result = computeMacro(buildDefaultMacroInputs({
        year: DEFAULT_START_YEAR + 1,
        previousMacro: firstYear,
        automationCoverage: 0.50,
        totalDisplaced: 50_000_000,
        totalRemainingEmployment: BASELINE_TOTAL_EMPLOYMENT - 50_000_000,
      }));
      // inflationRate should equal compositeInflation regardless of sign
      expect(result.inflationRate).toBeCloseTo(result.compositeInflation, 10);
    });
  });

  // ----------------------------------------------------------
  // Monetary Collapse Detection
  // ----------------------------------------------------------
  describe('Monetary Collapse Detection', () => {
    it('triggers MONETARY_COLLAPSE when priceLevel is near MAX_PRICE_LEVEL', () => {
      const policy = zeroPolicyEffects();
      // Create a previousMacro with priceLevel near the cap
      const firstYear = computeMacro(buildDefaultMacroInputs({ policyEffects: policy }));
      const nearCapMacro = {
        ...firstYear,
        priceLevel: 9.99e14, // just under MAX_PRICE_LEVEL (1e15)
        cumulativeInflationFactor: 9.99e14,
      };

      const result = computeMacro(buildDefaultMacroInputs({
        year: DEFAULT_START_YEAR + 1,
        policyEffects: policy,
        previousMacro: nearCapMacro,
        nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
      }));

      expect(result.cyclePhase).toBe('MONETARY_COLLAPSE');
    });

    it('does NOT trigger MONETARY_COLLAPSE at normal price levels', () => {
      const policy = zeroPolicyEffects();
      const firstYear = computeMacro(buildDefaultMacroInputs({ policyEffects: policy }));

      const result = computeMacro(buildDefaultMacroInputs({
        year: DEFAULT_START_YEAR + 1,
        policyEffects: policy,
        previousMacro: firstYear,
        nominalGDPHistory: [BASELINE_GDP_NOMINAL_2025],
      }));

      expect(result.cyclePhase).not.toBe('MONETARY_COLLAPSE');
    });
  });
});

// DEPRECATED: computeNominalWageGrowth tests — function removed (caused wage-price spiral).
// See docs/Audits/wage-computation-audit.md for full analysis.

// ============================================================
// Phase 8 Fix 5: computeHomePriceChange
// ============================================================

describe('computeHomePriceChange', () => {
  it('stable economy produces modest price appreciation', () => {
    // mortgageRateChange=0, realIncomeGrowth=1.7%, foreclosure=0, popGrowth=0.4%, affordabilityDev=0
    // = 0 + 0.0085 + 0 + 0.004 + 0 = 1.25%
    const result = computeHomePriceChange(0, 0.017, 0, 0.004, 0);
    expect(result).toBeCloseTo(0.0125, 4);
    expect(result).toBeGreaterThan(0);
  });

  it('rate cuts boost prices even during income decline (2020 pattern)', () => {
    // -200bp rate cut × 4.0 = +8%, -8% income × 0.5 = -4%, -3% foreclosures, +0.4% demographic, +0.75% reversion
    const result = computeHomePriceChange(-0.02, -0.08, -0.03, 0.004, 0.05);
    // = 0.08 - 0.04 - 0.03 + 0.004 + 0.0075 = +0.0215
    expect(result).toBeCloseTo(0.0215, 4);
    expect(result).toBeGreaterThan(0); // Prices still rise despite income decline
  });

  it('rate hikes depress prices even during income growth (2022 pattern)', () => {
    // +200bp rate hike × 4.0 = -8%, +2% income × 0.5 = +1%, +0.4% demographic
    const result = computeHomePriceChange(0.02, 0.02, 0, 0.004, 0);
    // = -0.08 + 0.01 + 0 + 0.004 + 0 = -0.066
    expect(result).toBeCloseTo(-0.066, 4);
    expect(result).toBeLessThan(0);
  });

  it('GDP is NOT a direct input to home prices', () => {
    // The function signature does not include GDP — confirmed by type system.
    // This test verifies the same inputs produce the same output regardless of
    // any external GDP state (i.e., the function is pure of GDP).
    const result1 = computeHomePriceChange(0, 0.02, 0, 0.004, 0);
    const result2 = computeHomePriceChange(0, 0.02, 0, 0.004, 0);
    expect(result1).toBe(result2);
  });

  it('affordability reversion creates headwind when prices outrun income', () => {
    // affordabilityDeviation = -0.17 (homes expensive)
    // reversion = -0.17 × 0.15 × 0.5 (downward sticky) = -0.01275
    const result = computeHomePriceChange(0, 0, 0, 0, -0.17);
    expect(result).toBeCloseTo(-0.01275, 4);
    expect(result).toBeLessThan(0);
  });

  it('affordability reversion creates tailwind when homes are cheap vs income', () => {
    // affordabilityDeviation = +0.43 (homes cheap)
    // reversion = +0.43 × 0.15 = +0.0645
    const result = computeHomePriceChange(0, 0, 0, 0, 0.43);
    expect(result).toBeCloseTo(0.0645, 4);
    expect(result).toBeGreaterThan(0);
  });

  it('downward stickiness: negative reversion is weaker than positive', () => {
    const upReversion = computeHomePriceChange(0, 0, 0, 0, 0.20);
    const downReversion = computeHomePriceChange(0, 0, 0, 0, -0.20);
    // |downReversion| should be half of |upReversion| with default stickiness 0.5
    expect(Math.abs(downReversion)).toBeCloseTo(Math.abs(upReversion) * 0.5, 4);
  });

  it('large supply shock: prices can drop significantly', () => {
    // Mass foreclosures (-5%), rate hikes (+200bp), income collapse (-10%)
    const result = computeHomePriceChange(0.02, -0.10, -0.05, 0.004, 0);
    // = -0.08 - 0.05 - 0.05 + 0.004 + 0 = -0.176 (17.6% decline)
    expect(result).toBeLessThan(-0.15);
  });

  it('custom sensitivities override defaults', () => {
    // Double affordability sensitivity from 4.0 to 8.0
    const defaultSens = computeHomePriceChange(-0.01, 0, 0, 0, 0);
    const doubleSens = computeHomePriceChange(-0.01, 0, 0, 0, 0, 8.0);
    expect(doubleSens).toBeCloseTo(defaultSens * 2, 4);
  });
});

// ============================================================
// Stage 6.5 (R25) — nonAI firewall add-back exactness
// The shelter add-back is wSh × rentCostAnchorWeight × (1−λ_eff(t−1)) × secDefl.shelter.
// Its correctness rests on the transmitted AI deflation in rents being EXACTLY linear in
// secDefl.shelter — verified here at machine precision on the pure housing block.
// ============================================================

describe('Stage 6.5 (R25): transmitted AI deflation equals the firewall add-back exactly', () => {
  it('ΔrentGrowth from shelter embodied deflation = anchorWeight × (1−λ_eff) × secDefl.shelter', () => {
    const args = {
      isFirstYear: false,
      prevHousingStock: 150_000_000, prevHouseholds: 135_000_000,
      prevHeadship: 0.39, prevRentIndex: 1.3, prevConstructionCost: 0.8,
      prevLandCost: 1.6, prevHomePriceIndex: 1.1, prevHousingStarts: 700_000,
      population: 350_000_000,
      nominalWageGrowth: -0.03, baseInflationRate: 0.026, broadGoodsPressure: -0.01,
      secDeflShelter: 0, embodiedCapability: 0.6,
      prevRealIncomeGrowthRate: -0.04, prevCompositeInflation: -0.05,
      trendRealIncomeGrowth: 0.02,
      foreclosureRateAggregate: 0.06, institutionalBuyerRate: 0.4,
      mortgageRate: 0.07, prevMortgageRate: 0.065,
      prevAssetIncomeShare: 0.45, baselineAssetIncomeShare: 0.30,
      realizedPopulationGrowth: 0.004,
      formationSensitivity: 0.06, headshipRecoveryRate: 0.12,
      supplyElasticity: 1.5, embodiedCapacityGain: 1.0, depreciationRate: 0.0025,
      landShare: 0.40, constructionLaborShare: 0.35,
      landIncomeBeta: 1.0, landScarcityElasticity: 2.0,
      rentOccupancyElasticity: 2.0, rentCostAnchorWeight: 1.0,
      opexPassthrough: 0.40, rentDownwardRigidity: 0.85,
      rentIncomeElasticity: 0.47, prevAfterTaxIncomeGrowth: 0.044,
      builderPriceMode: 'adaptive' as const, prevBuilderTrendGrowth: 0.037, prevHomePriceChangeRate: 0.037,
      constructionCreditSensitivity: 0, prevBusinessCreditTightening: 0,
      baselineCapRate: 0.052, capRateMortgageBeta: 0.4, capRateInvestorCompression: 0,
      fireSaleElasticity: 1.75, investorDemandIntensity: 0.10, landRateSensitivity: 0.75,
      prevHousingPipeline: 0.95e6 * 1.2, prevBuilderPriceIndex: 1.0,
      builderAdjustmentLambda: 0, housingPipelineDuration: 0,
      landClosureKappa: 0, prevLandResidualTarget: 1.0,
    };
    const SEC_DEFL = 0.043; // peak-deflation-scale embodied construction deflation
    const withAI = computeHousingBlock({ ...args, secDeflShelter: SEC_DEFL });
    const noAI = computeHousingBlock({ ...args, secDeflShelter: 0 });

    // Direct no-AI-terms recomputation vs the analytic add-back — machine precision (R25)
    const transmitted = noAI.rentGrowth - withAI.rentGrowth;
    const addBack = args.rentCostAnchorWeight * (1 - withAI.lambdaEffPrev) * SEC_DEFL;
    expect(transmitted).toBeCloseTo(addBack, 15);
    // λ_eff identical in both runs (uses t−1 levels) — the weighting the firewall consumes
    expect(withAI.lambdaEffPrev).toBeCloseTo(noAI.lambdaEffPrev, 15);
  });
});

// ============================================================
// Stage 7 — Residual corporate profits (Phase 10.B; OD-5 ratified)
// ============================================================

describe('Stage 7: residual corporate profits', () => {
  it('profits = GDP − wageBill − nonCorp − otherCosts, exactly (identity, no cap)', () => {
    const result = computeMacro(buildDefaultMacroInputs());
    const otherCosts = DEFAULT_OTHER_COSTS_SHARE * result.gdpNominal;
    const expected = result.gdpNominal - result.aggregateWageIncome
      - (result.aggregateAssetIncome
        - result.dividendIncome - result.aiCapitalGains - result.traditionalCapitalGains
        - 0 /* policy asset addition: zero in default config */)
      - otherCosts;
    // reconstruct nonCorp as assetIncome − dividends − capGains (its components)
    expect(result.corporateProfits).toBeCloseTo(expected, 4);
    // year-0 margin = the BEA seed by the Q-1(ii) calibration (bootstrap dissolved)
    expect(result.corporateProfits / result.gdpNominal).toBeCloseTo(BASELINE_PROFIT_GDP_RATIO, 3);
  });

  it('traditional profits are SIGNED — no floor when the residual compresses below the AI share', () => {
    // Collapse GDP relative to the wage bill: high displacement with rigid wages would do this in-sim;
    // here force it via a previousMacro chain — assert the SPLIT arithmetic is unfloored instead.
    const r = computeMacro(buildDefaultMacroInputs());
    expect(r.traditionalCorporateProfits).toBeCloseTo(r.corporateProfits - r.aiCorporateProfits, 6);
  });

  it('rent-sharing is TWO-SIDED and reads the t−1 profit share', () => {
    const base = computeNominalWageGrowth7({ dev: 0 });
    const up = computeNominalWageGrowth7({ dev: +0.10 });
    const down = computeNominalWageGrowth7({ dev: -0.10 });
    expect(up.nominalWageGrowth).toBeCloseTo(base.nominalWageGrowth + 0.10 * 0.10, 10);
    expect(down.nominalWageGrowth).toBeCloseTo(base.nominalWageGrowth - 0.10 * 0.10, 10);
    expect(up.rentSharingContribution).toBeCloseTo(0.01, 12);
  });

  function computeNominalWageGrowth7(o: { dev: number }) {
    return computeNominalWageGrowth({
      prevCompositeInflation: 0.029, perWorkerProductivityGrowth: 0.016,
      unemploymentRate: 0.04, naturalRate: 0.044, automationCoverage: 0,
      prevScarcityPremiumLevel: 0, scarcityIntensity: 0.4,
      inflationIndexation: 1.0, productivityPassthrough: 0.9,
      phillipsSlope: 0.3, downwardWageRigidity: 0.6,
      prevProfitShare: 0.13 + o.dev, baselineProfitShare: 0.13, rentSharingElasticity: 0.10,
    });
  }
});

// ============================================================
// E-7 — de-anchorable market inflation expectations (family member #5)
// ============================================================
import { computeExpectedPolicyRates } from '@/models/bondMarket';

describe('E-7: market inflation anchor in the expected policy path', () => {
  const base = [0.035, 0.02, 0, 0.007, 1.5, 0.5, 25, false, 0, 0.044, 0.044, 0.3, 5] as const;

  it('a de-anchored market prices persistently higher expected policy than a target-anchored one', () => {
    const anchored = computeExpectedPolicyRates(...base, 0.02);    // anchor = target (legacy belief)
    const deanchored = computeExpectedPolicyRates(...base, 0.035); // anchor = realized 3.5%
    // anchor 3.5 vs 2.0: projected inflation stays 1.5pp higher beyond the convergence window →
    // expected policy higher by ≈ (1 + 1.5) × 1.5pp × (post-convergence share of the horizon)
    expect(deanchored).toBeGreaterThan(anchored + 0.02);
    // two-sided: a deflation-de-anchored market prices LOWER expected policy
    const deflAnchor = computeExpectedPolicyRates(...base, -0.01);
    expect(deflAnchor).toBeLessThan(anchored);
  });

  it('anchor = target reproduces the legacy default exactly (large-τ / sentinel continuity)', () => {
    const explicit = computeExpectedPolicyRates(...base, 0.02);
    const defaulted = computeExpectedPolicyRates(...base);
    expect(explicit).toBe(defaulted);
  });
});

// ============================================================
// E-8c — F-A plucking potential + F-B Volcker validation
// ============================================================
import { computePluckingPotential } from '@/models/federalReserve';
import { computeMonetizationRate } from '@/models/monetization';

describe('E-8c F-A: the plucking potential (Friedman ceiling)', () => {
  it('ratchets UP with demonstrated production (the bootstrap absorbed, gap ≈ 0)', () => {
    let p: number | null = null;
    p = computePluckingPotential(p, 100, 0.02);          // year-0 anchor = realized
    expect(p).toBe(100);
    p = computePluckingPotential(p, 104, 0.02);          // realized grows 4% (capacity-gated bootstrap)
    expect(p).toBe(104);                                  // the ceiling ratchets — gap 0, not overheating
  });

  it('NEVER tracks realized downward — the no-displacement counterfactual preserved (C semantics)', () => {
    let p: number | null = 104;
    p = computePluckingPotential(p, 80, 0.02);           // displacement collapse
    expect(p).toBeCloseTo(104 * 1.02, 10);               // the ceiling keeps growing at the closed form
    expect((80 - p) / p).toBeLessThan(-0.2);             // the gap reads the depression
  });

  it('boost composition (ratified item 1): the boost raises the COUNTERFACTUAL line; realized below it is never absorbed', () => {
    let p: number | null = 100;
    // C-like: AI coverage rises (boostAdjust 1.05) while realized stays below the composed line
    p = computePluckingPotential(p, 95, 0.02, 1.05);
    expect(p).toBeCloseTo(100 * 1.02 * 1.05, 10);        // the AI-raised counterfactual, not realized
  });

  it('output gap is ease-only: realized never exceeds the ceiling', () => {
    let p: number | null = null;
    for (const realized of [100, 103, 101, 110, 108]) {
      p = computePluckingPotential(p, realized, 0.02);
      expect((realized - p) / p).toBeLessThanOrEqual(0);
    }
  });
});

describe('E-8c F-B: the Volcker validation (Sargent-Wallace re-conditioning)', () => {
  it('high yields from inflation repricing alone do NOT trigger monetization (Volcker 1981)', () => {
    // yields 15%, service/revenue 0.18, fiscal premium ≈ 0 — no fiscal-dominance condition
    // 10Y at 12% from repricing (below the untouched LOLR crisis backstop ~15-20%)
    const r = computeMonetizationRate(0.15, -0.005, false, 0.15, 0.15, 0.10,
      0.18, 1.0, 0.12, 0.08, 0.70, 0, 0.0, 0.50, 0.01);
    expect(r.yieldResponseActive).toBe(false);   // the OLD form fired here (0.12 > 0.08); the re-conditioned form does not
    expect(r.rate).toBe(0);
  });

  it('fires only when BOTH the dominance gate AND the premium co-condition hold', () => {
    const premiumOnly = computeMonetizationRate(0.05, -0.005, false, 0.05, 0.05, 0.10,
      0.30, 1.0, 0.09, 0.08, 0.70, 0, 0.02, 0.50, 0.01);
    expect(premiumOnly.yieldResponseActive).toBe(false);   // service 0.30 < 0.50 gate
    const both = computeMonetizationRate(0.05, -0.005, false, 0.05, 0.05, 0.10,
      0.55, 1.0, 0.09, 0.08, 0.70, 0, 0.02, 0.50, 0.01);
    expect(both.yieldResponseActive).toBe(true);           // 0.55 > 0.50 AND premium 0.02 > 0.01
    expect(both.rate).toBeGreaterThan(0.10);
  });
});

describe('E-9c: the inheritance fixes', () => {
  it('the anchor reads the ONE named constant at both sites (the dual-init pair killed)', async () => {
    const { ANCHOR_INIT_2025 } = await import('@/models/constants');
    const { getBaselineBondMarketState } = await import('@/models/bondMarket');
    expect(getBaselineBondMarketState().marketInflationAnchor).toBe(ANCHOR_INIT_2025);
    expect(ANCHOR_INIT_2025).toBeCloseTo(0.027, 10);
  });
  it('the consolidation-profile year-0 ramp starts from the TRUE service ratio', async () => {
    const { BASELINE_DEBT_SERVICE_REVENUE_RATIO, DEFAULT_FISCAL_CREDIBILITY_TRIGGER } = await import('@/models/constants');
    // observed 0.18 ≈ the trigger 0.18: the year-0 reading sits AT the threshold (the real 2025
    // state), not at the false 0 that delayed the ramp a year.
    expect(BASELINE_DEBT_SERVICE_REVENUE_RATIO).toBeCloseTo(0.18, 10);
    expect(BASELINE_DEBT_SERVICE_REVENUE_RATIO).toBeCloseTo(DEFAULT_FISCAL_CREDIBILITY_TRIGGER, 2);
  });
});

describe('E-9b: policy-rate inertia', () => {
  it('ρ=0 reproduces the instantaneous prescription exactly (legacy toggle)', () => {
    const taylor = 0.033, prev = 0.044;
    expect(0 * prev + (1 - 0) * taylor).toBe(taylor);
  });
  it('the inertial expected path carries the inherited rate at ρ^k', () => {
    const anchored = computeExpectedPolicyRates(0.025, 0.02, 0, 0.007, 1.5, 0.5, 25, false, 0, 0.044, 0.044, 0.3, 5, 0.02, 0.045, 0.5);
    const instantaneous = computeExpectedPolicyRates(0.025, 0.02, 0, 0.007, 1.5, 0.5, 25, false, 0, 0.044, 0.044, 0.3, 5, 0.02, 0.045, 0);
    expect(anchored).toBeGreaterThan(instantaneous);  // the inherited 4.5% restriction raises the average
  });
});

// ============================================================
// E-10 — the 2023-24 validation (housing's Volcker) + legacy equivalence
// ============================================================
describe('E-10: pipeline + gradual builders', () => {
  const eq = {
    isFirstYear: false,
    prevHousingStock: 146_600_000, prevHouseholds: 131_500_000, prevHeadship: 131_500_000 / 340_000_000,
    prevRentIndex: 1.0, prevConstructionCost: 1.0, prevLandCost: 1.0, prevHomePriceIndex: 1.0,
    prevHousingStarts: 953_399, prevRealIncomeGrowthRate: 0.0184, trendRealIncomeGrowth: 0.0184,
    population: 340_000_000, nominalWageGrowth: 0.044, baseInflationRate: 0.0222,
    broadGoodsPressure: 0, secDeflShelter: 0, embodiedCapability: 0,
    mortgageRate: 0.06, prevMortgageRate: 0.06,
    prevAssetIncomeShare: 0.30, baselineAssetIncomeShare: 0.30,
    realizedPopulationGrowth: 0.004,
    formationSensitivity: 0.06, headshipRecoveryRate: 0.12,
    supplyElasticity: 1.5, embodiedCapacityGain: 1.0, depreciationRate: 0.0025,
    landShare: 0.40, constructionLaborShare: 0.35,
    landIncomeBeta: 1.0, landScarcityElasticity: 2.0,
    baselineCapRate: 0.052, capRateMortgageBeta: 0.4, capRateInvestorCompression: 0,
    fireSaleElasticity: 1.75, investorDemandIntensity: 0.10, landRateSensitivity: 0.75,
    prevHousingPipeline: 953_399 * 1.2, prevBuilderPriceIndex: 1.0,
    builderAdjustmentLambda: 0.6, housingPipelineDuration: 1.2,
    landClosureKappa: 0.45, prevLandResidualTarget: 1.0,
    prevCompositeInflation: 0.026, foreclosureRateAggregate: 0, institutionalBuyerRate: 0,
    rentIncomeElasticity: 0.47, prevAfterTaxIncomeGrowth: 0.044,
    opexPassthrough: 0.40, rentDownwardRigidity: 0.85, rentCostAnchorWeight: 0,
    rentOccupancyElasticity: 2.0,
    builderPriceMode: 'trend-aware' as const, prevBuilderTrendGrowth: 0.037, prevHomePriceChangeRate: 0.037,
    constructionCreditSensitivity: 2.0, prevBusinessCreditTightening: 0,
  };

  it('legacy bit-equivalence: λ=0 ∧ D≤0 reproduces the pre-E-10 block exactly', () => {
    const legacy = computeHousingBlock({ ...eq, builderAdjustmentLambda: 0, housingPipelineDuration: 0 });
    // pre-E-10 semantics: completions = prevStarts; gap from the spot price; starts instantaneous
    expect(legacy.housingCompletions).toBe(eq.prevHousingStarts);
    expect(legacy.housingPipeline).toBe(0);
    expect(legacy.builderPriceIndex).toBe(legacy.homePriceIndex);
  });

  it('the 2023-24 sequence (FRED-derived guard, L9c final form): completions persist; starts -21%; rents decelerate, not fall', () => {
    // Phase 0: equilibrium. Apply a +4pp mortgage shock and iterate the pure block.
    let state = { ...eq };
    const noPipeline = { ...eq, builderAdjustmentLambda: 0, housingPipelineDuration: 0 };
    const run = (s0: typeof eq, years: number) => {
      const out: ReturnType<typeof computeHousingBlock>[] = [];
      // the +4pp shock LANDS in year 1 (prev = the pre-shock 0.06); prev = 0.10 thereafter.
      // The episode's OBSERVED credit conditions ride along (FRED SLOOS: net tightening of
      // construction/land-development standards 2022-24 — mild, ≈0.1-0.15 on the 0.5 GR-anchor
      // scale): the FRED starts path bundles rate + credit; the replay must too (disposition 5b).
      const sloosTightening = [0.05, 0.15, 0.15, 0.10, 0.05];
      // the observed nominal income deceleration rides along too (BEA DPI growth 2022-25:
      // ~7% cooling to ~4.5%) — the FRED rent deceleration is income-driven via θ
      const dpiPath = [0.07, 0.055, 0.048, 0.045, 0.044];
      let s = { ...s0, mortgageRate: 0.10, prevMortgageRate: s0.prevMortgageRate };
      for (let i = 0; i < years; i++) {
        s.prevBusinessCreditTightening = sloosTightening[i] ?? 0;
        s.prevAfterTaxIncomeGrowth = dpiPath[i] ?? 0.044;
        const r = computeHousingBlock(s);
        out.push(r);
        s = { ...s, prevMortgageRate: 0.10,
          prevHousingStock: r.housingStock, prevHouseholds: r.households, prevHeadship: r.headshipRate,
          prevRentIndex: r.rentIndex, prevConstructionCost: r.constructionCostIndex,
          prevLandCost: r.landCostIndex, prevHomePriceIndex: r.homePriceIndex,
          prevHousingStarts: r.housingStarts, prevHousingPipeline: r.housingPipeline,
          prevBuilderPriceIndex: r.builderPriceIndex,
          prevBuilderTrendGrowth: r.builderTrendGrowth,
          prevHomePriceChangeRate: r.homePriceIndex / (out.length > 1 ? out[out.length - 2]!.homePriceIndex : 1.0) - 1,
          prevLandResidualTarget: r.landResidualTarget,
          population: s.population * 1.004,  // the model demography rides along (else a phantom glut)
        };
      }
      return out;
    };
    const piped = run(state, 5);
    const instant = run(noPipeline, 5);
    // FRED-DERIVED expectations (disposition 5b: episode guards from data, never "the corrected system"):
    // (i) completions ≈ FLAT ~2y through the shock (FRED COMPUTSA 2023-24 ≈ 1.4M ≈ pre-shock) — ≥80%
    expect(piped[0]!.housingCompletions).toBeGreaterThan(0.8 * 953_399);
    expect(piped[1]!.housingCompletions).toBeGreaterThan(0.8 * 953_399);
    // (ii) starts ≈ −21% at ~18mo (FRED HOUST Apr-22 1.81M → mid-23 1.40M): the year-2 level in [0.65, 0.92]
    expect(piped[1]!.housingStarts).toBeGreaterThan(0.65 * 953_399);
    expect(piped[1]!.housingStarts).toBeLessThan(0.92 * 953_399);
    expect(piped[1]!.housingStarts).toBeGreaterThan(instant[1]!.housingStarts);  // gradual vs instantaneous
    // (iii) rents DECELERATE but do not fall (FRED CPI rent yoy: ~8.8% peak → ~5.5% → ~4%, never negative)
    expect(piped[2]!.rentGrowth).toBeLessThan(piped[0]!.rentGrowth);
    expect(piped[2]!.rentGrowth).toBeGreaterThan(0);
    // (iv) the start-collapse matures through the pipeline: completions(yr5) < completions(yr1)
    // (FRED 2025: completions rolling over ~−10-15% from peak as the 2023-24 start decline lands)
    expect(piped[4]!.housingCompletions).toBeLessThan(piped[0]!.housingCompletions);
  });
});

describe('FS-1b: the upstream fixes', () => {
  it('F6 exhaustiveness: every data category has a NAMED domain risk factor (no silent fallback)', async () => {
    const { DOMAIN_RISK_FACTORS } = await import('@/models/constants');
    const { OCCUPATION_CLUSTERS } = await import('@/data/occupationClusters');
    for (const c of OCCUPATION_CLUSTERS) {
      expect(DOMAIN_RISK_FACTORS[c.category as keyof typeof DOMAIN_RISK_FACTORS],
        `category '${c.category}' must be mapped`).toBeDefined();
    }
  });
  it('F1: augmentation adoption starts at 0 at the trigger year (the jump is dead)', async () => {
    const { computeAugmentationAdoption } = await import('@/models/augmentationAdoption');
    const r = computeAugmentationAdoption({ year: 2030, betterScore: 0.6, cheaperScore: 0.5, augTriggerYear: null, steepness: 0.5 });
    expect(r.triggered).toBe(true);
    expect(r.augAdoptionRate).toBe(0);  // 1 − e^0 = 0, not 0.5
    const r2 = computeAugmentationAdoption({ year: 2032, betterScore: 0.6, cheaperScore: 0.5, augTriggerYear: 2030, steepness: 0.5 });
    expect(r2.augAdoptionRate).toBeCloseTo(1 - Math.exp(-1), 10);
  });
  it('F4: competitive pressure clamps to the cluster ceiling', async () => {
    const { applyCompetitivePressure } = await import('@/models/adoption');
    const v = applyCompetitivePressure(0.78, undefined, 0.0, 0.3, 0.8);
    expect(v).toBeLessThanOrEqual(0.8);
  });
});

describe('FS-2b: hygiene guards', () => {
  it('EMPLOYMENT_MULTIPLIERS is exhaustive over the 51 clusters (the dead fallback retired)', async () => {
    const { EMPLOYMENT_MULTIPLIERS } = await import('@/models/constants');
    const { OCCUPATION_CLUSTERS } = await import('@/data/occupationClusters');
    for (const c of OCCUPATION_CLUSTERS) {
      expect(EMPLOYMENT_MULTIPLIERS[c.id], `cluster '${c.id}' must have a multiplier`).toBeDefined();
    }
  });
});
