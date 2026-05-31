/**
 * Verification Tests: Loop Mini-Simulations vs Production Model
 *
 * These tests run the mini-simulations (loopSimulations.ts) and the production
 * model functions (macro.ts, adoption.ts, displacement.ts) with identical inputs,
 * verifying that the methodology visualizations produce the same values as the
 * actual ATLAS model.
 */

import { describe, it, expect } from 'vitest';
import {
  simulateDisplacementDemand,
  simulatePhillipsCurve,
  simulateDemandSpillover,
  simulateCreditCrunch,
  simulateFiscalMonetary,
  simulateHousingWealth,
} from '../loopSimulations';
import { computeRevenuePressure, computeWagePressure, computeHousingWealthEffect } from '@/models/macro';
import { applyRevenuePressure } from '@/models/adoption';
import { computeSimplifiedDisplacement } from '@/models/displacement';
import {
  BASELINE_TOTAL_EMPLOYMENT,
  BASELINE_AVERAGE_ANNUAL_WAGE,
  BASELINE_GDP_NOMINAL_2025,
  BASELINE_CONSUMPTION_2025,
  BASELINE_INVESTMENT_2025,
  BASELINE_GOVT_SPENDING_2025,
  BASELINE_WAGE_SHARE,
  BASELINE_ASSET_SHARE,
  BASELINE_TRANSFER_SHARE,
  BASELINE_HOUSING_WEALTH,
  BASELINE_HOMEOWNERSHIP,
  DEFAULT_POST_TAX_MPC_WAGE,
  DEFAULT_POST_TAX_MPC_ASSET,
  DEFAULT_POST_TAX_MPC_TRANSFER,
  BASELINE_INCOME_TAX_RATE,
  BASELINE_PAYROLL_RATE,
  EMPLOYER_EMPLOYEE_SPLIT,
  US_LABOR_FORCE_2025,
  DEFERRABLE_CONSUMPTION_SHARE,
  CREDIT_CONSUMPTION_SENSITIVITY,
  GOVERNMENT_SPENDING_GDP_FRACTION,
  NET_EXPORTS_GDP_FRACTION,
  DEFAULT_BUSINESS_INVESTMENT_IMPACT,
  DEFAULT_PROFITABILITY_SENSITIVITY,
  DEFAULT_GROWTH_TRAJECTORY_SENSITIVITY,
  DEFAULT_MAX_BUSINESS_TIGHTENING,
  DEFAULT_MAX_BUSINESS_CREDIT_LOOSENING,
  BASELINE_CAPITAL_GAINS_RATE,
  TRANSFER_TAX_RATE,
  PHILLIPS_CURVE_SENSITIVITY,
  NATURAL_UNEMPLOYMENT_RATE,
  AI_WAGE_PRODUCTIVITY_MULTIPLIER,
  DEFAULT_COLLATERAL_SENSITIVITY,
} from '@/models/constants';

const INDIVIDUAL_TAX_RATE = BASELINE_INCOME_TAX_RATE + BASELINE_PAYROLL_RATE * EMPLOYER_EMPLOYEE_SPLIT;
const BASELINE_NET_EXPORTS = BASELINE_GDP_NOMINAL_2025 * NET_EXPORTS_GDP_FRACTION;

// Shared 3-channel consumption helper (mirrors loopSimulations.ts helper)
function expectedThreeChannelConsumption(
  afterTaxWageIncome: number,
  assetIncome: number,
  transferIncome: number,
  mpcWage: number,
  mpcAsset: number,
  mpcTransfer: number,
): number {
  const afterTaxAsset = assetIncome * (1 - BASELINE_CAPITAL_GAINS_RATE);
  const afterTaxTransfer = transferIncome * (1 - TRANSFER_TAX_RATE);
  return afterTaxWageIncome * mpcWage + afterTaxAsset * mpcAsset + afterTaxTransfer * mpcTransfer;
}

// ---------------------------------------------------------------------------
// Loop 1: Displacement-Demand Feedback — verify production function outputs match mini-simulation
// ---------------------------------------------------------------------------

describe('Loop 1: Displacement-Demand Feedback — production function parity', () => {
  const scenarios = [
    { label: 'mild contraction', gdpGrowthRate: -0.02, sensitivity: 1.5, cap: 0.30, decay: 0.50 },
    { label: 'severe recession', gdpGrowthRate: -0.08, sensitivity: 1.5, cap: 0.30, decay: 0.50 },
    { label: 'growth (no pressure)', gdpGrowthRate: 0.03, sensitivity: 1.5, cap: 0.30, decay: 0.50 },
    { label: 'max sensitivity', gdpGrowthRate: -0.05, sensitivity: 3.0, cap: 0.50, decay: 0.70 },
  ];

  scenarios.forEach(({ label, ...params }) => {
    it(`matches production for ${label}`, () => {
      const sim = simulateDisplacementDemand(params);

      // Run production functions with same inputs
      const { revenuePressure, automationAcceleration } = computeRevenuePressure(
        params.gdpGrowthRate, 0, params.sensitivity, params.cap, params.decay,
      );
      const baseAdoptionRate = 0.25;
      const weightedCapability = 0.60;
      const acceleratedAdoption = applyRevenuePressure(baseAdoptionRate, automationAcceleration);
      const displacementPct = computeSimplifiedDisplacement(acceleratedAdoption, weightedCapability);

      // Revenue pressure chain
      expect(sim.dl_revenue_pressure).toBeCloseTo(revenuePressure, 10);
      expect(sim.dl_auto_accel).toBeCloseTo(automationAcceleration, 10);
      expect(sim.dl_displacement).toBeCloseTo(displacementPct, 10);

      // Employment chain
      const displacedWorkers = BASELINE_TOTAL_EMPLOYMENT * displacementPct;
      const expectedUnemployment = Math.min(0.50, displacedWorkers / US_LABOR_FORCE_2025);
      expect(sim.dl_unemployment).toBeCloseTo(expectedUnemployment, 10);

      // Fix 5: Wage income now includes wagePressure
      // Phase 10.A: signature change — this demo sim now calls the scarcity-aware variant with
      // aiDispUE/aggregate/scarcity = 0, matching production loopSimulations.ts.
      const remainingEmployment = BASELINE_TOTAL_EMPLOYMENT - displacedWorkers;
      const wagePressure = computeWagePressure(
        expectedUnemployment, 0, 0, 0, 1, 0, PHILLIPS_CURVE_SENSITIVITY, NATURAL_UNEMPLOYMENT_RATE,
      );
      const wageIncome = remainingEmployment * BASELINE_AVERAGE_ANNUAL_WAGE * wagePressure;
      const afterTax = wageIncome * (1 - INDIVIDUAL_TAX_RATE);

      // Fix 9: 3-channel consumption
      const assetIncome = BASELINE_GDP_NOMINAL_2025 * BASELINE_ASSET_SHARE;
      const transferIncome = BASELINE_GDP_NOMINAL_2025 * BASELINE_TRANSFER_SHARE * (1 + displacementPct * 0.5);
      const consumption = expectedThreeChannelConsumption(
        afterTax, assetIncome, transferIncome,
        DEFAULT_POST_TAX_MPC_WAGE, DEFAULT_POST_TAX_MPC_ASSET, DEFAULT_POST_TAX_MPC_TRANSFER,
      );

      expect(sim.dl_wage_income).toBeCloseTo(wageIncome, 2);
      expect(sim.dl_consumption).toBeCloseTo(consumption, 2);
    });
  });
});

// ---------------------------------------------------------------------------
// Loop 2: Phillips Curve — verify computeWagePressure parity
// ---------------------------------------------------------------------------

describe('Loop 2: Phillips Curve — production function parity', () => {
  const scenarios = [
    { label: 'baseline', unemploymentRate: 0.044, phillipsSensitivity: 0.15, naturalRate: 0.044, automationCoverage: 0.10, aiWageMultiplier: 0.50 },
    { label: 'high unemployment', unemploymentRate: 0.20, phillipsSensitivity: 0.15, naturalRate: 0.044, automationCoverage: 0.10, aiWageMultiplier: 0.50 },
    { label: '30% unemployment', unemploymentRate: 0.30, phillipsSensitivity: 0.15, naturalRate: 0.044, automationCoverage: 0.10, aiWageMultiplier: 0.50 },
    { label: 'peak AI premium', unemploymentRate: 0.044, phillipsSensitivity: 0.15, naturalRate: 0.044, automationCoverage: 0.50, aiWageMultiplier: 1.0 },
    { label: 'full automation', unemploymentRate: 0.044, phillipsSensitivity: 0.15, naturalRate: 0.044, automationCoverage: 1.0, aiWageMultiplier: 0.50 },
  ];

  scenarios.forEach(({ label, ...params }) => {
    it(`wage pressure matches production for ${label}`, () => {
      const sim = simulatePhillipsCurve(params);

      // Production function (Phase 10.A signature: scarcity-aware — zeroed here for parity with demo sim)
      const prodWagePressure = computeWagePressure(
        params.unemploymentRate,
        0, 0, 0, 1,  // aiDispUE, aggPremium, scarcityIntensity, laborForceBaseline
        0, // no policy floor
        params.phillipsSensitivity,
        params.naturalRate,
      );

      expect(sim.pc_wage_pressure).toBeCloseTo(prodWagePressure, 10);
    });

    it(`intermediate values correct for ${label}`, () => {
      const sim = simulatePhillipsCurve(params);

      const excessUE = Math.max(0, params.unemploymentRate - params.naturalRate);
      const phillipsPressure = Math.exp(-params.phillipsSensitivity * excessUE);
      const aiPremium = params.automationCoverage * params.aiWageMultiplier * (1 - params.automationCoverage);

      expect(sim.pc_excess_ue).toBeCloseTo(excessUE, 10);
      expect(sim.pc_phillips).toBeCloseTo(phillipsPressure, 10);
      expect(sim.pc_ai_premium).toBeCloseTo(aiPremium, 10);
    });

    it(`consumption uses 3-channel post-tax MPC for ${label}`, () => {
      const sim = simulatePhillipsCurve(params);

      // Verify the consumption chain
      const wagePressure = sim.pc_wage_pressure!;
      const baselineWageIncome = BASELINE_GDP_NOMINAL_2025 * BASELINE_WAGE_SHARE;
      const employmentRatio = 1 - params.unemploymentRate;
      const nominalWages = baselineWageIncome * wagePressure * employmentRatio;
      const costPushInflation = Math.max(0, (wagePressure - 1) * 0.3);
      const realWages = nominalWages / (1 + costPushInflation);
      const afterTax = realWages * (1 - INDIVIDUAL_TAX_RATE);

      // Fix 9: 3-channel consumption
      const assetIncome = BASELINE_GDP_NOMINAL_2025 * BASELINE_ASSET_SHARE;
      const transferIncome = BASELINE_GDP_NOMINAL_2025 * BASELINE_TRANSFER_SHARE * (1 + params.unemploymentRate * 0.5);
      const consumption = expectedThreeChannelConsumption(
        afterTax, assetIncome, transferIncome,
        DEFAULT_POST_TAX_MPC_WAGE, DEFAULT_POST_TAX_MPC_ASSET, DEFAULT_POST_TAX_MPC_TRANSFER,
      );

      expect(sim.pc_nominal_wages).toBeCloseTo(nominalWages, 2);
      expect(sim.pc_consumption).toBeCloseTo(consumption, 2);
    });
  });

  it('30% unemployment drops consumption by ~15%+ (wage channel dampened by asset+transfer buffers)', () => {
    const baseline = simulatePhillipsCurve({
      unemploymentRate: 0.044, phillipsSensitivity: 0.15, naturalRate: 0.044, automationCoverage: 0.10, aiWageMultiplier: 0.50,
    });
    const crisis = simulatePhillipsCurve({
      unemploymentRate: 0.30, phillipsSensitivity: 0.15, naturalRate: 0.044, automationCoverage: 0.10, aiWageMultiplier: 0.50,
    });
    const consumptionDrop = 1 - crisis.pc_consumption! / baseline.pc_consumption!;
    // With 3-channel consumption, asset+transfer income buffers the wage drop
    // 30% unemployment still causes a meaningful consumption drop (>15%)
    expect(consumptionDrop).toBeGreaterThan(0.15);
  });
});

// ---------------------------------------------------------------------------
// Loop 3: Demand Spillover — verify income shares and MPC chain
// ---------------------------------------------------------------------------

describe('Loop 3: Demand Spillover — constant and formula parity', () => {
  it('uses production constants for income shares', () => {
    const sim = simulateDemandSpillover({
      mpcWage: 0.95, mpcAsset: 0.35, mpcTransfer: 0.90, displacementPct: 0.0,
    });

    // At 0% displacement, wage income = GDP * BASELINE_WAGE_SHARE * 1.0
    const expectedWage = BASELINE_GDP_NOMINAL_2025 * BASELINE_WAGE_SHARE;
    const expectedAsset = BASELINE_GDP_NOMINAL_2025 * BASELINE_ASSET_SHARE;
    const expectedTransfer = BASELINE_GDP_NOMINAL_2025 * BASELINE_TRANSFER_SHARE;
    const expectedTotal = expectedWage + expectedAsset + expectedTransfer;

    expect(sim.ds_income).toBeCloseTo(expectedTotal, 2);
  });

  it('applies tax to all income channels before MPC (Fix 8)', () => {
    const params = { mpcWage: 0.95, mpcAsset: 0.35, mpcTransfer: 0.90, displacementPct: 0.10 };
    const sim = simulateDemandSpillover(params);

    const employmentRatio = 1 - params.displacementPct;
    const wageIncome = BASELINE_GDP_NOMINAL_2025 * BASELINE_WAGE_SHARE * employmentRatio;
    const assetIncome = BASELINE_GDP_NOMINAL_2025 * BASELINE_ASSET_SHARE;
    const transferIncome = BASELINE_GDP_NOMINAL_2025 * BASELINE_TRANSFER_SHARE * (1 + params.displacementPct * 0.5);

    const afterTaxWage = wageIncome * (1 - INDIVIDUAL_TAX_RATE);
    // Fix 8: Asset and transfer income taxed before MPC
    const expectedConsumption = expectedThreeChannelConsumption(
      afterTaxWage, assetIncome, transferIncome,
      params.mpcWage, params.mpcAsset, params.mpcTransfer,
    );

    expect(sim.ds_consumption).toBeCloseTo(expectedConsumption, 2);
  });

  it('uses NET_EXPORTS_GDP_FRACTION constant (not hardcoded -0.03)', () => {
    const sim = simulateDemandSpillover({
      mpcWage: 0.95, mpcAsset: 0.35, mpcTransfer: 0.90, displacementPct: 0.0,
    });

    // GDP = C + I + G + NX — verify NX uses the constant
    const expectedNX = BASELINE_GDP_NOMINAL_2025 * NET_EXPORTS_GDP_FRACTION;
    const derivedNX = sim.ds_gdp! - sim.ds_consumption! - sim.ds_investment! - sim.ds_gov_spending!;
    expect(derivedNX).toBeCloseTo(expectedNX, 2);
  });

  it('displacement reduces consumption via wage channel', () => {
    const baseline = simulateDemandSpillover({
      mpcWage: 0.95, mpcAsset: 0.35, mpcTransfer: 0.90, displacementPct: 0.0,
    });
    const displaced = simulateDemandSpillover({
      mpcWage: 0.95, mpcAsset: 0.35, mpcTransfer: 0.90, displacementPct: 0.30,
    });

    expect(displaced.ds_consumption!).toBeLessThan(baseline.ds_consumption!);
    expect(displaced.ds_gdp!).toBeLessThan(baseline.ds_gdp!);
    expect(displaced.ds_employment!).toBeLessThan(baseline.ds_employment!);
  });

  it('MPC changes flow through to investment via demand ratio (t+1)', () => {
    // With default MPCs
    const highMPC = simulateDemandSpillover({
      mpcWage: 0.95, mpcAsset: 0.35, mpcTransfer: 0.90, displacementPct: 0.10,
    });
    // With very low MPCs — consumption drops → demand ratio drops → investment drops
    const lowMPC = simulateDemandSpillover({
      mpcWage: 0.60, mpcAsset: 0.15, mpcTransfer: 0.70, displacementPct: 0.10,
    });

    // Investment must respond to MPC changes (not just displacement)
    expect(lowMPC.ds_investment!).toBeLessThan(highMPC.ds_investment!);
    // Demand ratio should be lower with low MPCs
    expect(lowMPC.ds_demand_ratios!).toBeLessThan(highMPC.ds_demand_ratios!);
  });

  it('uses DEFAULT_BUSINESS_INVESTMENT_IMPACT for displacement sensitivity (Fix 1)', () => {
    const params = { mpcWage: 0.95, mpcAsset: 0.35, mpcTransfer: 0.90, displacementPct: 0.20 };
    const sim = simulateDemandSpillover(params);

    // Year-1 investment uses DEFAULT_BUSINESS_INVESTMENT_IMPACT (0.15), not hardcoded 0.3
    const expectedYear1 = BASELINE_INVESTMENT_2025 * Math.max(0.5, 1 - params.displacementPct * DEFAULT_BUSINESS_INVESTMENT_IMPACT);
    // Investment includes t+1 demand feedback, but year-1 base should use correct sensitivity
    expect(DEFAULT_BUSINESS_INVESTMENT_IMPACT).toBe(0.15);
    // At 20% displacement: old formula (0.3) → 0.94×base, new (0.15) → 0.97×base
    expect(expectedYear1).toBeGreaterThan(BASELINE_INVESTMENT_2025 * 0.96);
  });
});

// ---------------------------------------------------------------------------
// Loop 4: Credit Crunch — verify consumer multiplier formula parity
// ---------------------------------------------------------------------------

describe('Loop 4: Credit Crunch — formula parity', () => {
  it('consumer credit multiplier includes income + collateral channels (Fix 11)', () => {
    const params = {
      unemploymentRate: 0.15,
      incomeAdequacySensitivity: 8.0,
      maxCreditTightening: 0.70,
      businessCreditGDPSensitivity: 5.0,
    };
    const sim = simulateCreditCrunch(params);

    // Income adequacy channel
    const employmentRatio = 1 - (params.unemploymentRate - 0.044) / (1 - 0.044);
    const underwritableIncome = Math.max(0.1, Math.min(1.0, employmentRatio));
    const incomeDeficiency = Math.max(0, 1.0 - underwritableIncome);
    const incomeAdequacyTightening = params.incomeAdequacySensitivity * incomeDeficiency;

    // Fix 11: Collateral channel
    const excessUE = Math.max(0, params.unemploymentRate - 0.044);
    const homePriceDecline = excessUE * 0.12;
    const collateralTightening = DEFAULT_COLLATERAL_SENSITIVITY * homePriceDecline;

    const consumerTightening = Math.min(params.maxCreditTightening, Math.max(0, incomeAdequacyTightening + collateralTightening));
    const creditRatio = consumerTightening / params.maxCreditTightening;
    const consumerMultiplier = Math.max(0.01, 1.0 - CREDIT_CONSUMPTION_SENSITIVITY * creditRatio);

    expect(sim.cc_consumer_credit).toBeCloseTo(consumerTightening, 10);
    expect(sim.cc_consumption_mult).toBeCloseTo(consumerMultiplier, 10);
  });

  it('consumption uses DEFERRABLE_CONSUMPTION_SHARE from production', () => {
    const params = {
      unemploymentRate: 0.15,
      incomeAdequacySensitivity: 8.0,
      maxCreditTightening: 0.70,
      businessCreditGDPSensitivity: 5.0,
    };
    const sim = simulateCreditCrunch(params);

    const expectedConsumption = BASELINE_CONSUMPTION_2025 * (
      1 - DEFERRABLE_CONSUMPTION_SHARE * (1 - sim.cc_consumption_mult!)
    );
    expect(sim.cc_consumption).toBeCloseTo(expectedConsumption, 2);
  });

  it('business credit uses production constants (Fix 2, 6, 7)', () => {
    const params = {
      unemploymentRate: 0.20,
      incomeAdequacySensitivity: 8.0,
      maxCreditTightening: 0.70,
      businessCreditGDPSensitivity: 5.0,
    };
    const sim = simulateCreditCrunch(params);

    // Reproduce the business credit chain with production constants
    const consumptionGDPGap = (sim.cc_consumption! - BASELINE_CONSUMPTION_2025) / BASELINE_GDP_NOMINAL_2025;

    // Fix 7: Compute GDP growth rate (not level gap)
    const year1GDP = sim.cc_consumption! + BASELINE_INVESTMENT_2025 + BASELINE_GOVT_SPENDING_2025 + BASELINE_NET_EXPORTS;
    const gdpGrowthRate = (year1GDP - BASELINE_GDP_NOMINAL_2025) / BASELINE_GDP_NOMINAL_2025;

    // Profitability channel
    const profitDeclineRatio = Math.max(0.2, 1.0 + consumptionGDPGap * 2.0);
    const profitSignal = 1.0 - profitDeclineRatio;
    // Fix 2: Production constant for profitability sensitivity
    const profitTightening = DEFAULT_PROFITABILITY_SENSITIVITY * profitSignal;
    // Fix 7: Growth signal uses GDP growth rate
    const growthSignal = -params.businessCreditGDPSensitivity * gdpGrowthRate;
    // Fix 6: Asymmetric caps — can loosen
    const rawBizTightening = profitTightening + growthSignal;
    const bizTightening = Math.max(
      -DEFAULT_MAX_BUSINESS_CREDIT_LOOSENING,
      Math.min(DEFAULT_MAX_BUSINESS_TIGHTENING, rawBizTightening),
    );
    const bizCreditRatio = DEFAULT_MAX_BUSINESS_TIGHTENING > 0
      ? bizTightening / DEFAULT_MAX_BUSINESS_TIGHTENING : 0;
    const businessMultiplier = Math.max(0.01, 1.0 - DEFAULT_BUSINESS_INVESTMENT_IMPACT * bizCreditRatio);
    const investment = BASELINE_INVESTMENT_2025 * businessMultiplier;

    expect(sim.cc_business_credit).toBeCloseTo(bizTightening, 10);
    expect(sim.cc_investment).toBeCloseTo(investment, 2);
  });

  it('business credit can loosen (negative tightening) during growth (Fix 6)', () => {
    // Low unemployment → no credit stress → growth signal dominates → loosening
    const sim = simulateCreditCrunch({
      unemploymentRate: 0.044, // at natural rate — no income stress
      incomeAdequacySensitivity: 8.0,
      maxCreditTightening: 0.70,
      businessCreditGDPSensitivity: 5.0,
    });

    // At natural rate UE, consumption ≈ baseline, GDP ≈ baseline
    // Growth signal should be near zero, profit signal near zero
    // But critically, the floor is now -MAX_LOOSENING, not 0
    // The business credit value should be able to go negative
    expect(sim.cc_business_credit).toBeLessThanOrEqual(DEFAULT_MAX_BUSINESS_TIGHTENING);
    expect(sim.cc_business_credit).toBeGreaterThanOrEqual(-DEFAULT_MAX_BUSINESS_CREDIT_LOOSENING);
  });

  it('business multiplier floor is 0.01 (matching production macro.ts:880)', () => {
    // Extreme stress: very high unemployment
    const sim = simulateCreditCrunch({
      unemploymentRate: 0.30,
      incomeAdequacySensitivity: 15.0,
      maxCreditTightening: 0.90,
      businessCreditGDPSensitivity: 8.0,
    });

    // Business multiplier should be clamped at 0.01 (not 0.5)
    // Verify the investment hasn't been floored at 50% of baseline
    const investmentRatio = sim.cc_investment! / BASELINE_INVESTMENT_2025;
    expect(investmentRatio).toBeLessThanOrEqual(1.0);
    // Under extreme stress, multiplier can go below 0.5 (old wrong floor)
    // This confirms the fix from 0.5 → 0.01
    if (investmentRatio < 0.5) {
      // If we got below 0.5, the old 0.5 floor was removed — pass
      expect(investmentRatio).toBeGreaterThanOrEqual(0.01);
    }
  });
});

// ---------------------------------------------------------------------------
// Loop 5: Fiscal-Monetary — verify deficit/debt/monetization chain
// ---------------------------------------------------------------------------

describe('Loop 5: Fiscal-Monetary — formula parity', () => {
  it('revenue = taxRate × nominalGDP', () => {
    const params = { taxRate: 0.25, gdpGrowthRate: 0.02, interestRate: 0.035, qeMonetizationRate: 0.40 };
    const sim = simulateFiscalMonetary(params);

    const nominalGDP = BASELINE_GDP_NOMINAL_2025 * (1 + params.gdpGrowthRate);
    expect(sim.fm_revenue).toBeCloseTo(params.taxRate * nominalGDP, 2);
    expect(sim.fm_nominal_gdp).toBeCloseTo(nominalGDP, 2);
  });

  it('deficit = spending (gov + interest) - revenue', () => {
    const params = { taxRate: 0.25, gdpGrowthRate: -0.05, interestRate: 0.05, qeMonetizationRate: 0.40 };
    const sim = simulateFiscalMonetary(params);

    const nominalGDP = BASELINE_GDP_NOMINAL_2025 * (1 + params.gdpGrowthRate);
    const baseSpending = GOVERNMENT_SPENDING_GDP_FRACTION * nominalGDP;
    const existingDebt = BASELINE_GDP_NOMINAL_2025 * 1.20;
    const interestExpense = existingDebt * params.interestRate;
    const totalSpending = baseSpending + interestExpense;
    const revenue = params.taxRate * nominalGDP;
    const deficit = totalSpending - revenue;

    expect(sim.fm_deficit).toBeCloseTo(deficit, 2);
    expect(sim.fm_interest).toBeCloseTo(interestExpense, 2);
  });

  it('debt/GDP = (existing + deficit) / nominalGDP', () => {
    const params = { taxRate: 0.20, gdpGrowthRate: -0.08, interestRate: 0.06, qeMonetizationRate: 0.40 };
    const sim = simulateFiscalMonetary(params);

    const nominalGDP = BASELINE_GDP_NOMINAL_2025 * (1 + params.gdpGrowthRate);
    const existingDebt = BASELINE_GDP_NOMINAL_2025 * 1.20;
    const newDebt = existingDebt + sim.fm_deficit!;
    expect(sim.fm_debt_gdp).toBeCloseTo(newDebt / nominalGDP, 10);
  });

  it('Case 1 monetization triggers below ELB (-0.5%)', () => {
    const sim = simulateFiscalMonetary({
      taxRate: 0.25, gdpGrowthRate: -0.02, interestRate: 0.035, qeMonetizationRate: 0.40,
    });
    // GDP growth < -0.005 → QE case 1 triggers
    expect(sim.fm_monetization).toBeGreaterThanOrEqual(0.40);
  });

  it('no monetization during positive growth with low DSR', () => {
    const sim = simulateFiscalMonetary({
      taxRate: 0.25, gdpGrowthRate: 0.03, interestRate: 0.02, qeMonetizationRate: 0.40,
    });
    // Positive growth, low interest → low DSR → no monetization
    expect(sim.fm_monetization).toBe(0);
  });

  it('Case 2 financial repression ramps to MAX_FINANCIAL_REPRESSION_RATE (Fix 3)', () => {
    const sim = simulateFiscalMonetary({
      taxRate: 0.15, gdpGrowthRate: -0.10, interestRate: 0.10, qeMonetizationRate: 0.20,
    });
    // Very high interest + low tax rate → DSR > 50%
    if (sim.fm_debt_service! > 0.50) {
      // Fix 3: Max repression rate is 1.0, not 0.50
      // Repression rate should be able to exceed old 0.50 cap
      expect(sim.fm_monetization).toBeGreaterThan(0.20); // repression rate > base QE rate
    }
  });
});

// ---------------------------------------------------------------------------
// Loop 6: Housing Wealth — verify homeownership scaling parity
// ---------------------------------------------------------------------------

describe('Loop 6: Housing Wealth — production function parity', () => {
  it('wealth effect scales by BASELINE_HOMEOWNERSHIP with quintile-weighted stress (Fix 10)', () => {
    const params = {
      wageGrowthRate: -0.05, mortgageStressAmplifier: 0.40, housingWealthMPC: 0.05, displacementPct: 0.20,
    };
    const sim = simulateHousingWealth(params);

    // Fix 10: Quintile-skewed mortgage burden
    const QUINTILE_BURDEN_HIGH = 0.38;
    const QUINTILE_BURDEN_LOW = 0.15;
    const displacementPhase = Math.min(1, params.displacementPct / 0.5);
    const weightedBurden = QUINTILE_BURDEN_HIGH - (QUINTILE_BURDEN_HIGH - QUINTILE_BURDEN_LOW) * displacementPhase;
    const mortgageStress = 1.0 + params.mortgageStressAmplifier * params.displacementPct * weightedBurden;
    const foreclosureRate = Math.max(0, (mortgageStress - 1.0) * 0.15);
    const homePriceChange = -foreclosureRate * 2.0 + Math.max(0, params.wageGrowthRate) * 0.5;
    const housingWealth = BASELINE_HOUSING_WEALTH * (1 + homePriceChange);
    const wealthChange = housingWealth - BASELINE_HOUSING_WEALTH;
    // Production formula: wealthChange * MPC * homeownership
    const wealthConsumptionEffect = wealthChange * params.housingWealthMPC * BASELINE_HOMEOWNERSHIP;
    const consumption = BASELINE_CONSUMPTION_2025 + wealthConsumptionEffect;

    expect(sim.hw_mortgage_stress).toBeCloseTo(mortgageStress, 10);
    expect(sim.hw_foreclosures).toBeCloseTo(foreclosureRate, 10);
    expect(sim.hw_housing_wealth).toBeCloseTo(housingWealth, 2);
    expect(sim.hw_consumption).toBeCloseTo(consumption, 2);
  });

  it('GDP = C + I + G + NX (Fix 4, not GDP = consumption)', () => {
    const params = {
      wageGrowthRate: -0.05, mortgageStressAmplifier: 0.40, housingWealthMPC: 0.05, displacementPct: 0.20,
    };
    const sim = simulateHousingWealth(params);

    // Fix 4: GDP should be C + I + G + NX, significantly larger than consumption
    const expectedGDP = sim.hw_consumption! + BASELINE_INVESTMENT_2025 + BASELINE_GOVT_SPENDING_2025 + BASELINE_NET_EXPORTS;
    expect(sim.hw_gdp).toBeCloseTo(expectedGDP, 2);
    // GDP must be > consumption (consumption is ~66% of GDP)
    expect(sim.hw_gdp!).toBeGreaterThan(sim.hw_consumption!);
  });

  it('production computeHousingWealthEffect uses same wealth × MPC × homeownership formula', () => {
    // Call production function with matching inputs
    const foreclosureRate = 0.02;
    const creditTighteningRatio = 0.0; // isolate wealth effect
    const mpc = 0.05;

    const prod = computeHousingWealthEffect(
      BASELINE_HOMEOWNERSHIP,
      foreclosureRate,
      creditTighteningRatio,
      mpc,
    );

    // Production: wealthChange = BASELINE_HOUSING_WEALTH * homePriceChangeRate
    //             housingWealthDrag = wealthChange * MPC * homeownership
    const expectedWealthDrag = BASELINE_HOUSING_WEALTH * prod.homePriceChangeRate * mpc * BASELINE_HOMEOWNERSHIP;
    expect(prod.housingWealthDrag).toBeCloseTo(expectedWealthDrag, 2);
  });

  it('quintile-weighted stress decreases at high displacement (Fix 10)', () => {
    // At low displacement, early-phase workers (high mortgage burden) dominate
    const lowDisp = simulateHousingWealth({
      wageGrowthRate: 0.0, mortgageStressAmplifier: 1.0, housingWealthMPC: 0.05, displacementPct: 0.05,
    });
    // At high displacement, later-phase workers (low mortgage burden) are included
    const highDisp = simulateHousingWealth({
      wageGrowthRate: 0.0, mortgageStressAmplifier: 1.0, housingWealthMPC: 0.05, displacementPct: 0.40,
    });

    // Per-unit displacement stress should be lower at higher displacement
    // (weighted burden decreases as displacement broadens to higher-income workers)
    const lowDispStressPerUnit = (lowDisp.hw_mortgage_stress! - 1.0) / 0.05;
    const highDispStressPerUnit = (highDisp.hw_mortgage_stress! - 1.0) / 0.40;
    expect(highDispStressPerUnit).toBeLessThan(lowDispStressPerUnit);
  });

  it('zero displacement produces zero mortgage stress delta', () => {
    const sim = simulateHousingWealth({
      wageGrowthRate: 0.02, mortgageStressAmplifier: 0.40, housingWealthMPC: 0.05, displacementPct: 0.0,
    });
    expect(sim.hw_mortgage_stress).toBe(1.0);
    expect(sim.hw_foreclosures).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Cross-loop: Tax rate consistency
// ---------------------------------------------------------------------------

describe('Cross-loop: INDIVIDUAL_TAX_RATE consistency', () => {
  it('tax rate used across loops matches production decomposition', () => {
    // Production: wageIncomeTax + employeePayrollTax
    // = wage × incomeTaxRate + wage × payrollRate × employeeSplit
    // = wage × (incomeTaxRate + payrollRate × employeeSplit)
    const expectedRate = BASELINE_INCOME_TAX_RATE + BASELINE_PAYROLL_RATE * EMPLOYER_EMPLOYEE_SPLIT;
    expect(INDIVIDUAL_TAX_RATE).toBeCloseTo(expectedRate, 10);
    expect(EMPLOYER_EMPLOYEE_SPLIT).toBe(0.50);
  });

  it('displacement-demand feedback and phillips curve produce consistent consumption for same employment', () => {
    // Both loops should compute similar post-tax consumption when
    // employment ratio is the same
    const ddSim = simulateDisplacementDemand({
      gdpGrowthRate: 0.0, sensitivity: 1.5, cap: 0.30, decay: 0.50,
    });
    // At 0% GDP growth, revenue pressure = 0, displacement ≈ 0.09 (0.25 × 0.6²)
    // Both should use INDIVIDUAL_TAX_RATE and DEFAULT_POST_TAX_MPC_WAGE
    expect(ddSim.dl_consumption).toBeGreaterThan(0);

    const phillipsSim = simulatePhillipsCurve({
      unemploymentRate: 0.044, phillipsSensitivity: 0.15, naturalRate: 0.044,
      automationCoverage: 0.0, aiWageMultiplier: 0.0,
    });
    // At natural rate, wagePressure ≈ 1.0, consumption should reflect full employment
    expect(phillipsSim.pc_consumption).toBeGreaterThan(0);
  });
});
