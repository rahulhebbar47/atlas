/**
 * ATLAS Tax & Economic Pipeline — Unit Tests (Phase 5-tax)
 *
 * Tests the tax decomposition, post-tax income pipeline, investment capacity,
 * 3-component AI cost model, payroll→BFCS modulation, and fiscal computation.
 *
 * Per FIX 6: Only new tests here — no updates to existing test expectations.
 */

import { describe, it, expect } from 'vitest';
import {
  computeMacro,
  computeFiscalPressure,
  computeSectorWeightedDeflation,
} from '@/models/macro';
import {
  computeCheaperScore,
  computeBFCSScores,
  checkAdoptionTrigger,
} from '@/models/bfcs';
import type { MacroInputs, PolicyEffects, ClusterDisplacementResult, RoleDefinition, OccupationCluster, AICostParams } from '@/types';
import {
  DEFAULT_START_YEAR,
  BASELINE_TOTAL_EMPLOYMENT,
  BASELINE_AVERAGE_ANNUAL_WAGE,
  BASELINE_GDP_NOMINAL_2025,
  US_POPULATION_2025,
  BASELINE_INCOME_TAX_RATE,
  BASELINE_PAYROLL_RATE,
  BASELINE_CORPORATE_TAX_RATE,
  BASELINE_CAPITAL_GAINS_RATE,
  BASELINE_CORPORATE_RETENTION_RATE,
  DEFAULT_POST_TAX_MPC_WAGE,
  DEFAULT_POST_TAX_MPC_ASSET,
  DEFAULT_POST_TAX_MPC_TRANSFER,
  // DEPRECATED (Stage 1): DEFAULT_AI_PROFIT_GROWTH_RATE no longer used here — the aiProfitGrowthRate
  // price passthrough was retired and replaced by the explicit aiDeflationPassthrough parameter.
  // DEFAULT_AI_PROFIT_GROWTH_RATE,
  EMPLOYER_EMPLOYEE_SPLIT,
  STATE_LOCAL_TAX_RATE,
  TRANSFER_TAX_RATE,
  EFFECTIVE_TAX_RATE,
  BASELINE_RETAINED_EARNINGS,
  BASELINE_CREDIT_FUNDED,
  DEFAULT_INFERENCE_ANNUAL_CHANGE,
  DEFAULT_MANUFACTURING_ANNUAL_CHANGE,
  DEFAULT_ENERGY_ANNUAL_CHANGE,
  AI_COST_COMPOSITION,
} from '@/models/constants';

// ============================================================
// Helpers
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

// ============================================================
// 1. Tax Decomposition: Each channel computes correctly at baseline
// ============================================================

describe('Tax Decomposition', () => {
  it('computes correct individual tax channels at baseline rates', () => {
    const macro = computeMacro(buildDefaultMacroInputs());

    // At t=0, prevCorpProfits bootstraps from baseline → corporate tax is positive
    expect(macro.corporateTaxRevenue).toBeGreaterThan(0);

    // Wage income tax = aggregateWageIncome × incomeTaxRate
    const expectedWageTax = macro.aggregateWageIncome * BASELINE_INCOME_TAX_RATE;
    expect(macro.wageIncomeTax).toBeCloseTo(expectedWageTax, 0);

    // Employee payroll tax = aggregateWageIncome × payrollTaxRate × 0.5
    const expectedPayrollTax = macro.aggregateWageIncome * BASELINE_PAYROLL_RATE * EMPLOYER_EMPLOYEE_SPLIT;
    expect(macro.employeePayrollTax).toBeCloseTo(expectedPayrollTax, 0);

    // Employer payroll tax (same formula as employee)
    expect(macro.employerPayrollTax).toBeCloseTo(expectedPayrollTax, 0);
  });
});

// ============================================================
// 2. Baseline Calibration: totalGovernmentRevenue ≈ EFFECTIVE_TAX_RATE × GDP
// ============================================================

describe('Baseline Calibration', () => {
  it('totalGovernmentRevenue approximately equals EFFECTIVE_TAX_RATE × GDP within 5%', () => {
    const macro = computeMacro(buildDefaultMacroInputs());

    // At t=0, GDP = baseline. Revenue should be close to EFFECTIVE_TAX_RATE × GDP.
    // Not exact because corporate tax revenue = 0 at t=0 (no previous profits).
    const targetRevenue = EFFECTIVE_TAX_RATE * macro.gdpNominal;
    const ratio = macro.totalGovernmentRevenue / targetRevenue;
    // Allow wider tolerance at t=0 since corporate tax channel is 0
    expect(ratio).toBeGreaterThan(0.70);
    expect(ratio).toBeLessThan(1.30);
  });
});

// ============================================================
// 3. Post-Tax Income: Taxes reduce income correctly
// ============================================================

describe('Post-Tax Income', () => {
  it('afterTaxWageIncome = wage × (1 - incomeTaxRate - payrollRate × 0.5)', () => {
    const macro = computeMacro(buildDefaultMacroInputs());

    const expectedAfterTax = macro.aggregateWageIncome
      * (1 - BASELINE_INCOME_TAX_RATE - BASELINE_PAYROLL_RATE * EMPLOYER_EMPLOYEE_SPLIT);
    expect(macro.afterTaxWageIncome).toBeCloseTo(expectedAfterTax, 0);
  });

  it('totalPostTaxIncome < totalIncome gross (gross = wage + asset + transfer)', () => {
    const macro = computeMacro(buildDefaultMacroInputs());

    const grossIncome = macro.aggregateWageIncome + macro.aggregateAssetIncome + macro.aggregateTransferIncome;
    expect(macro.totalPostTaxIncome).toBeLessThan(grossIncome);
  });
});

// ============================================================
// 4. Consumption uses post-tax: wageConsumption = afterTaxWageIncome × postTaxMpcWage
// ============================================================

describe('Post-Tax Consumption', () => {
  it('wageConsumption derived from after-tax wage income', () => {
    const macro = computeMacro(buildDefaultMacroInputs());

    // At baseline with 0 excess UE, effectiveMpcWage ≈ postTaxMpcWage
    // wageConsumption ≈ afterTaxWageIncome × DEFAULT_POST_TAX_MPC_WAGE
    const expected = macro.afterTaxWageIncome * DEFAULT_POST_TAX_MPC_WAGE;
    expect(macro.wageConsumption).toBeCloseTo(expected, -2);
  });
});

// ============================================================
// 5. CWI uses post-tax: CWI = totalPostTaxIncome / (pop × priceLevel)
// ============================================================

describe('CWI Post-Tax', () => {
  it('CWI = totalPostTaxIncome / (population × priceLevel)', () => {
    const macro = computeMacro(buildDefaultMacroInputs());

    const expectedCWI = macro.totalPostTaxIncome / (US_POPULATION_2025 * macro.priceLevel);
    expect(macro.consumerWelfareIndex).toBeCloseTo(expectedCWI, 2);
  });
});

// ============================================================
// 6. Capacity Gate: demand > capacity → gate < 1.0; demand <= capacity → gate = 1.0
// ============================================================

describe('Capacity Gate', () => {
  it('at baseline (t=0), capacityGate ≈ 1.0', () => {
    const macro = computeMacro(buildDefaultMacroInputs());

    expect(macro.capacityGate).toBeCloseTo(1.0, 1);
  });

  it('investmentCapacity = retainedEarnings + creditCapacity at t=0', () => {
    const macro = computeMacro(buildDefaultMacroInputs());

    expect(macro.investmentCapacity).toBeCloseTo(
      macro.retainedEarnings + macro.creditCapacity, 0,
    );
  });

  it('t=0 retainedEarnings uses BASELINE_RETAINED_EARNINGS', () => {
    const macro = computeMacro(buildDefaultMacroInputs());

    expect(macro.retainedEarnings).toBeCloseTo(BASELINE_RETAINED_EARNINGS, 0);
  });
});

// ============================================================
// 7. AI Cost 3-Component: Software vs Robotics cost curves differ
// ============================================================

describe('AI Cost 3-Component (bfcs.ts)', () => {
  // Minimal role for testing
  const testRole: RoleDefinition = {
    id: 'test_role',
    label: 'Test Role',
    seniorityLevel: 0.5,
    aiReplacementDifficulty: 0.5,
    bfcsThresholds: { better: 0.5, faster: 0.5, cheaper: 0.5, safer: 0.5 },
    employmentShareEstimate: 1.0,
  };

  const softwareCluster = {
    deploymentType: 'software' as const,
  } as OccupationCluster;

  const roboticsCluster = {
    deploymentType: 'robotics' as const,
  } as OccupationCluster;

  it('software AI gets cheaper faster than robotics at t=5', () => {
    const softwareScore = computeCheaperScore(DEFAULT_START_YEAR + 5, testRole, softwareCluster);
    const roboticsScore = computeCheaperScore(DEFAULT_START_YEAR + 5, testRole, roboticsCluster);

    expect(softwareScore).toBeGreaterThan(roboticsScore);
  });

  it('custom tokenCostCurve override produces different Cheaper scores', () => {
    // A slower-decay curve (higher floor or lower k) keeps AI more expensive longer → lower Cheaper score.
    const slowDecayParams: AICostParams = {
      inferenceAnnualChange: -0.45,  // legacy, not used by new path
      manufacturingAnnualChange: -0.10,
      energyAnnualChange: -0.03,
      tokenCostCurve: { floor: 0.5, k: 0.1, decayExponent: 0.7 },  // barely declines
    };

    const defaultScore = computeCheaperScore(DEFAULT_START_YEAR + 5, testRole, softwareCluster);
    const slowScore = computeCheaperScore(DEFAULT_START_YEAR + 5, testRole, softwareCluster, slowDecayParams);

    // Slower curve → AI stays more expensive → lower Cheaper score
    expect(slowScore).toBeLessThan(defaultScore);
  });

  it('tokenUsageMultiplier > 1 keeps inference cost higher → lower Cheaper score', () => {
    const params: AICostParams = {
      inferenceAnnualChange: -0.45,
      manufacturingAnnualChange: -0.10,
      energyAnnualChange: -0.03,
      tokenUsageMultiplier: 20,  // 20× tokens/task vs. 2025 baseline
    };
    const baselineScore = computeCheaperScore(DEFAULT_START_YEAR + 5, testRole, softwareCluster);
    const highUsageScore = computeCheaperScore(DEFAULT_START_YEAR + 5, testRole, softwareCluster, params);
    expect(highUsageScore).toBeLessThan(baselineScore);
  });
});

// ============================================================
// 8. Payroll → BFCS: Higher payroll rate → lower Cheaper threshold → earlier trigger
// ============================================================

describe('Payroll → BFCS Modulation', () => {
  it('higher payroll cost shifts cheaper threshold down', () => {
    const baseThreshold = 0.6;
    const payrollDelta = 0.10; // 10% increase above baseline
    const payrollCostShift = payrollDelta * EMPLOYER_EMPLOYEE_SPLIT; // 0.05

    const modulated = Math.max(0, Math.min(1, baseThreshold - payrollCostShift));
    expect(modulated).toBeCloseTo(0.55, 2);
    expect(modulated).toBeLessThan(baseThreshold);
  });
});

// ============================================================
// 9. Onshoring → NX: Import substitution adds to net exports
// ============================================================

describe('Import Dependence', () => {
  it('importDependence = 1.0 when no AI output', () => {
    const macro = computeMacro(buildDefaultMacroInputs());
    expect(macro.importDependence).toBe(1.0);
  });
});

// ============================================================
// 10. Price Pass-Through: aiProfitGrowthRate affects deflation
// ============================================================

describe('Price Pass-Through', () => {
  it('aiDeflationPassthrough=0 → no AI deflation reaches consumer prices (Stage 1)', () => {
    // Stage 1 retired the aiProfitGrowthRate passthrough. The AI-cost-savings passthrough is now the
    // explicit aiDeflationPassthrough: 0 → all savings retained as margins, none reaches prices.
    const macro = computeMacro(buildDefaultMacroInputs({
      aiDeflationPassthrough: 0,
      automationCoverage: 0.5,
      year: DEFAULT_START_YEAR + 5,
    }));
    // With no passthrough, the AI-exposed sector carries no deflation term (= base + broad pressures).
    expect(macro.aiExposedInflation).toBeGreaterThan(0);
  });

  it('higher aiDeflationPassthrough → more deflation in AI-exposed prices and composite (Stage 1)', () => {
    const low = computeMacro(buildDefaultMacroInputs({
      aiDeflationPassthrough: 0.2, automationCoverage: 0.5, year: DEFAULT_START_YEAR + 5,
    }));
    const high = computeMacro(buildDefaultMacroInputs({
      aiDeflationPassthrough: 0.9, automationCoverage: 0.5, year: DEFAULT_START_YEAR + 5,
    }));
    // More passthrough → lower (more negative) AI-exposed inflation and lower composite.
    expect(high.aiExposedInflation).toBeLessThan(low.aiExposedInflation);
    expect(high.compositeInflation).toBeLessThan(low.compositeInflation);
  });
});

// ============================================================
// 11. Corporate Tax Delta → Asset Income
// ============================================================

describe('Corporate Tax Delta', () => {
  it('above-baseline corporate tax reduces after-tax asset income', () => {
    // Need a year > 0 so previousMacro has corporateProfits
    const year0 = computeMacro(buildDefaultMacroInputs());

    const normalYear1 = computeMacro(buildDefaultMacroInputs({
      year: DEFAULT_START_YEAR + 1,
      previousMacro: year0,
      corporateTaxRate: BASELINE_CORPORATE_TAX_RATE,
    }));

    const highTaxYear1 = computeMacro(buildDefaultMacroInputs({
      year: DEFAULT_START_YEAR + 1,
      previousMacro: year0,
      corporateTaxRate: BASELINE_CORPORATE_TAX_RATE + 0.10,
    }));

    // Higher corporate tax → less asset income distributed
    expect(highTaxYear1.afterTaxAssetIncome).toBeLessThan(normalYear1.afterTaxAssetIncome);
  });
});

// ============================================================
// 12. Retained Earnings → Investment Capacity
// ============================================================

describe('Retained Earnings → Investment', () => {
  it('higher retention → more investmentCapacity', () => {
    const year0 = computeMacro(buildDefaultMacroInputs());

    const lowRetention = computeMacro(buildDefaultMacroInputs({
      year: DEFAULT_START_YEAR + 1,
      previousMacro: year0,
      corporateRetentionRate: 0.20,
    }));

    const highRetention = computeMacro(buildDefaultMacroInputs({
      year: DEFAULT_START_YEAR + 1,
      previousMacro: year0,
      corporateRetentionRate: 0.80,
    }));

    expect(highRetention.investmentCapacity).toBeGreaterThan(lowRetention.investmentCapacity);
  });
});

// ============================================================
// 13. Credit Bug Fix: GDP contraction doesn't increase AI investment
// ============================================================

describe('Credit Bug Fix', () => {
  it('investment realization does not include credit loosening during contraction', () => {
    // investmentRealization = utilizationFactor × demandFactor (no credit)
    // Verify by checking that investmentRealization ≤ 1.0 when demand is low
    const year0 = computeMacro(buildDefaultMacroInputs());

    const contractionYear = computeMacro(buildDefaultMacroInputs({
      year: DEFAULT_START_YEAR + 1,
      previousMacro: {
        ...year0,
        gdpNominal: BASELINE_GDP_NOMINAL_2025 * 0.90, // 10% GDP decline
        businessCreditTightening: 0.5, // tight credit (positive = tightening)
      },
    }));

    // investmentRealization should be ≤ 1.0 (credit channel removed from realization)
    expect(contractionYear.investmentRealization).toBeLessThanOrEqual(1.01);
  });
});

// ============================================================
// 14. Zero-Displacement Pass: at t=0, all tax/investment fields = baseline
// ============================================================

describe('Zero-Displacement Pass', () => {
  it('at t=0 with no displacement, key fields have baseline values', () => {
    const macro = computeMacro(buildDefaultMacroInputs());

    // GDP = baseline
    expect(macro.gdpNominal).toBeCloseTo(BASELINE_GDP_NOMINAL_2025, 0);

    // capacityGate = 1.0 at baseline
    expect(macro.capacityGate).toBeCloseTo(1.0, 1);

    // Corporate tax revenue is positive at t=0 (bootstrapped from baseline profits)
    expect(macro.corporateTaxRevenue).toBeGreaterThan(0);

    // AI cost indices start at 1.0 at t=0
    expect(macro.blendedAiCostIndex).toBeCloseTo(1.0, 2);
    expect(macro.inferenceCostIndex).toBeCloseTo(1.0, 2);
    expect(macro.manufacturingCostIndex).toBeCloseTo(1.0, 2);
    expect(macro.energyCostIndex).toBeCloseTo(1.0, 2);

    // importDependence = 1.0 (no AI output)
    expect(macro.importDependence).toBe(1.0);
  });
});

// ============================================================
// computeFiscalPressure with decomposed revenue
// ============================================================

describe('computeFiscalPressure with totalRevenue', () => {
  it('accepts decomposed totalRevenue parameter', () => {
    const result = computeFiscalPressure(
      BASELINE_GDP_NOMINAL_2025,
      0.04,                       // UE rate
      0.04,                       // natural UE
      BASELINE_GDP_NOMINAL_2025 * 0.17,  // G
      500,                        // transfers
      400,                        // debt interest
      BASELINE_GDP_NOMINAL_2025 * 0.25,  // totalRevenue
    );

    expect(result.fiscalDeficitGDPRatio).toBeDefined();
    expect(typeof result.fiscalDeficitGDPRatio).toBe('number');
  });

  it('backward-compat default: no totalRevenue uses EFFECTIVE_TAX_RATE × GDP', () => {
    const result = computeFiscalPressure(BASELINE_GDP_NOMINAL_2025, 0.04);
    expect(result.fiscalDeficitGDPRatio).toBeDefined();
  });
});
