/**
 * ATLAS Fiscal Accounting Module — Unit Tests
 *
 * Tests the 5 pure functions in src/models/fiscal.ts:
 *   1. computeEndogenousRevenue  — 3-bucket revenue decomposition
 *   2. computeGovernmentSpending — existing obligations + policy costs + interest
 *   3. computeDebtAccumulation   — primary/total deficit, debt stock, debt/GDP
 *   4. computeWeightedAverageDebtRate — rollover + new issuance blended rate
 *   5. getBaselineFiscalState    — initial calibrated state
 *
 * Mathematical invariants under test:
 *   totalRevenue = laborTax + corporateTax + otherRevenue
 *   totalDeficit = primaryDeficit + interestExpense
 *   debtStock(t) = max(0, debtStock(t-1) + totalDeficit(t))
 *   weightedAvgRate = (retained * oldRate + (rolledOver + newDeficit) * marketRate) / currentDebt
 */

import { describe, it, expect } from 'vitest';
import {
  computeEndogenousRevenue,
  computeGovernmentSpending,
  computeDebtAccumulation,
  computeWeightedAverageDebtRate,
  computeEndogenousRolloverRate,
  getBaselineFiscalState,
} from '@/models/fiscal';
import {
  INITIAL_FEDERAL_DEBT,
  INITIAL_10Y_YIELD,
  INITIAL_WEIGHTED_AVG_DEBT_RATE,
  BASELINE_GDP_NOMINAL_2025,
  FEDERAL_REVENUE_GDP_RATIO,
  FISCAL_MONETARY_SAFETY_CAP,
} from '@/models/constants';
import type { FiscalState } from '@/types';

// ============================================================
// Standard test values
// ============================================================

const NOMINAL_GDP = 30_000_000_000_000; // $30T
const WAGE_INCOME_TAX = 1_200_000_000_000; // $1.2T
const EMPLOYEE_PAYROLL = 800_000_000_000; // $800B
const EMPLOYER_PAYROLL = 800_000_000_000; // $800B
const CORPORATE_TAX = 400_000_000_000; // $400B
const CAP_GAINS_TAX = 200_000_000_000; // $200B
const STATE_LOCAL_REV = 500_000_000_000; // $500B
const TRANSFER_TAX = 50_000_000_000; // $50B
const NON_CORP_ASSET_TAX = 150_000_000_000; // $150B

const TOTAL_LABOR = WAGE_INCOME_TAX + EMPLOYEE_PAYROLL + EMPLOYER_PAYROLL; // $2.8T
const TOTAL_OTHER = CAP_GAINS_TAX + STATE_LOCAL_REV + TRANSFER_TAX + NON_CORP_ASSET_TAX; // $900B
const TOTAL_REVENUE = TOTAL_LABOR + CORPORATE_TAX + TOTAL_OTHER; // $4.1T

// ============================================================
// 1. computeEndogenousRevenue
// ============================================================

describe('computeEndogenousRevenue', () => {
  it('computes laborTaxRevenue as sum of wage income tax + employee + employer payroll', () => {
    const result = computeEndogenousRevenue(
      WAGE_INCOME_TAX, EMPLOYEE_PAYROLL, EMPLOYER_PAYROLL,
      CORPORATE_TAX, CAP_GAINS_TAX, STATE_LOCAL_REV,
      TRANSFER_TAX, NON_CORP_ASSET_TAX, NOMINAL_GDP,
    );

    expect(result.laborTaxRevenue).toBe(TOTAL_LABOR);
  });

  it('passes through corporateTaxRevenue unchanged', () => {
    const result = computeEndogenousRevenue(
      WAGE_INCOME_TAX, EMPLOYEE_PAYROLL, EMPLOYER_PAYROLL,
      CORPORATE_TAX, CAP_GAINS_TAX, STATE_LOCAL_REV,
      TRANSFER_TAX, NON_CORP_ASSET_TAX, NOMINAL_GDP,
    );

    expect(result.corporateTaxRevenue).toBe(CORPORATE_TAX);
  });

  it('computes otherRevenue as sum of capGains + stateLocal + transfer + nonCorpAsset', () => {
    const result = computeEndogenousRevenue(
      WAGE_INCOME_TAX, EMPLOYEE_PAYROLL, EMPLOYER_PAYROLL,
      CORPORATE_TAX, CAP_GAINS_TAX, STATE_LOCAL_REV,
      TRANSFER_TAX, NON_CORP_ASSET_TAX, NOMINAL_GDP,
    );

    expect(result.otherRevenue).toBe(TOTAL_OTHER);
  });

  it('ensures totalGovernmentRevenue = labor + corporate + other', () => {
    const result = computeEndogenousRevenue(
      WAGE_INCOME_TAX, EMPLOYEE_PAYROLL, EMPLOYER_PAYROLL,
      CORPORATE_TAX, CAP_GAINS_TAX, STATE_LOCAL_REV,
      TRANSFER_TAX, NON_CORP_ASSET_TAX, NOMINAL_GDP,
    );

    expect(result.bookedRevenueT1).toBe(TOTAL_REVENUE);
    expect(result.bookedRevenueT1).toBe(
      result.laborTaxRevenue + result.corporateTaxRevenue + result.otherRevenue,
    );
  });

  it('computes revenueGDPRatio correctly', () => {
    const result = computeEndogenousRevenue(
      WAGE_INCOME_TAX, EMPLOYEE_PAYROLL, EMPLOYER_PAYROLL,
      CORPORATE_TAX, CAP_GAINS_TAX, STATE_LOCAL_REV,
      TRANSFER_TAX, NON_CORP_ASSET_TAX, NOMINAL_GDP,
    );

    const expectedRatio = TOTAL_REVENUE / NOMINAL_GDP;
    expect(result.revenueGDPRatio).toBeCloseTo(expectedRatio, 10);
  });

  it('returns revenueGDPRatio of 0 when GDP is zero (zero-GDP guard)', () => {
    const result = computeEndogenousRevenue(
      WAGE_INCOME_TAX, EMPLOYEE_PAYROLL, EMPLOYER_PAYROLL,
      CORPORATE_TAX, CAP_GAINS_TAX, STATE_LOCAL_REV,
      TRANSFER_TAX, NON_CORP_ASSET_TAX, 0,
    );

    expect(result.revenueGDPRatio).toBe(0);
    // Revenue totals should still be computed correctly even with zero GDP
    expect(result.bookedRevenueT1).toBe(TOTAL_REVENUE);
  });

  it('handles all-zero tax inputs', () => {
    const result = computeEndogenousRevenue(0, 0, 0, 0, 0, 0, 0, 0, NOMINAL_GDP);

    expect(result.laborTaxRevenue).toBe(0);
    expect(result.corporateTaxRevenue).toBe(0);
    expect(result.otherRevenue).toBe(0);
    expect(result.bookedRevenueT1).toBe(0);
    expect(result.revenueGDPRatio).toBe(0);
  });
});

// ============================================================
// 2. computeGovernmentSpending
// ============================================================

describe('computeGovernmentSpending', () => {
  const REVENUE = 4_000_000_000_000; // $4T
  const PRIMARY_DEFICIT_RATIO = 0.027; // ~2.7% of GDP
  const POLICY_TRANSFERS = 500_000_000_000; // $500B (UBI etc.)
  const RETRAINING = 50_000_000_000; // $50B
  const OTHER_POLICY = 10_000_000_000; // $10B
  const PREV_DEBT = 36_000_000_000_000; // $36T
  const AVG_RATE = 0.029; // 2.9%

  it('computes existingObligations = revenue + primaryDeficitRatio * GDP', () => {
    const result = computeGovernmentSpending(
      REVENUE, PRIMARY_DEFICIT_RATIO, NOMINAL_GDP,
      POLICY_TRANSFERS, RETRAINING, OTHER_POLICY,
      PREV_DEBT, AVG_RATE,
    );

    const expected = REVENUE + PRIMARY_DEFICIT_RATIO * NOMINAL_GDP;
    expect(result.existingObligations).toBeCloseTo(expected, 0);
  });

  it('computes policyCosts as sum of transfers + retraining + other', () => {
    const result = computeGovernmentSpending(
      REVENUE, PRIMARY_DEFICIT_RATIO, NOMINAL_GDP,
      POLICY_TRANSFERS, RETRAINING, OTHER_POLICY,
      PREV_DEBT, AVG_RATE,
    );

    expect(result.policyCosts).toBe(POLICY_TRANSFERS + RETRAINING + OTHER_POLICY);
  });

  it('computes interestExpense = prevDebt * weightedAverageRate', () => {
    const result = computeGovernmentSpending(
      REVENUE, PRIMARY_DEFICIT_RATIO, NOMINAL_GDP,
      POLICY_TRANSFERS, RETRAINING, OTHER_POLICY,
      PREV_DEBT, AVG_RATE,
    );

    const expected = PREV_DEBT * AVG_RATE;
    expect(result.interestExpense).toBeCloseTo(expected, 0);
  });

  it('computes totalSpending = existingObligations + policyCosts + interest', () => {
    const result = computeGovernmentSpending(
      REVENUE, PRIMARY_DEFICIT_RATIO, NOMINAL_GDP,
      POLICY_TRANSFERS, RETRAINING, OTHER_POLICY,
      PREV_DEBT, AVG_RATE,
    );

    expect(result.totalGovernmentSpending).toBeCloseTo(
      result.existingObligations + result.policyCosts + result.interestExpense, 0,
    );
  });

  it('policy costs are additive — increasing any component increases total spending', () => {
    const base = computeGovernmentSpending(
      REVENUE, PRIMARY_DEFICIT_RATIO, NOMINAL_GDP,
      0, 0, 0,
      PREV_DEBT, AVG_RATE,
    );

    const withPolicy = computeGovernmentSpending(
      REVENUE, PRIMARY_DEFICIT_RATIO, NOMINAL_GDP,
      POLICY_TRANSFERS, RETRAINING, OTHER_POLICY,
      PREV_DEBT, AVG_RATE,
    );

    expect(withPolicy.totalGovernmentSpending).toBeGreaterThan(base.totalGovernmentSpending);
    expect(withPolicy.totalGovernmentSpending - base.totalGovernmentSpending).toBeCloseTo(
      POLICY_TRANSFERS + RETRAINING + OTHER_POLICY, 0,
    );
  });

  it('caps interestExpense at FISCAL_MONETARY_SAFETY_CAP for extreme debt', () => {
    // Debt so large that debt * rate exceeds the safety cap
    const extremeDebt = FISCAL_MONETARY_SAFETY_CAP * 100;
    const result = computeGovernmentSpending(
      REVENUE, PRIMARY_DEFICIT_RATIO, NOMINAL_GDP,
      0, 0, 0,
      extremeDebt, AVG_RATE,
    );

    expect(result.interestExpense).toBe(FISCAL_MONETARY_SAFETY_CAP);
  });

  it('returns zero policyCosts when no policy costs are provided', () => {
    const result = computeGovernmentSpending(
      REVENUE, PRIMARY_DEFICIT_RATIO, NOMINAL_GDP,
      0, 0, 0,
      PREV_DEBT, AVG_RATE,
    );

    expect(result.policyCosts).toBe(0);
  });

  it('returns zero interestExpense when prevDebt is zero', () => {
    const result = computeGovernmentSpending(
      REVENUE, PRIMARY_DEFICIT_RATIO, NOMINAL_GDP,
      0, 0, 0,
      0, AVG_RATE,
    );

    expect(result.interestExpense).toBe(0);
  });
});

// ============================================================
// 3. computeDebtAccumulation
// ============================================================

describe('computeDebtAccumulation', () => {
  const SPENDING = 6_000_000_000_000; // $6T total spending
  const REVENUE = 4_000_000_000_000; // $4T total revenue
  const INTEREST = 1_000_000_000_000; // $1T interest
  const PREV_DEBT = 36_000_000_000_000; // $36T

  it('computes primaryDeficit = (totalSpending - interest) - revenue', () => {
    const result = computeDebtAccumulation(
      SPENDING, REVENUE, INTEREST, PREV_DEBT, NOMINAL_GDP,
    );

    // primaryDeficit = spending - interest - revenue = 6T - 1T - 4T = 1T
    expect(result.primaryDeficit).toBe(SPENDING - INTEREST - REVENUE);
  });

  it('computes totalDeficit = primaryDeficit + interestExpense', () => {
    const result = computeDebtAccumulation(
      SPENDING, REVENUE, INTEREST, PREV_DEBT, NOMINAL_GDP,
    );

    expect(result.totalDeficit).toBe(result.primaryDeficit + INTEREST);
  });

  it('ensures totalDeficit = totalSpending - totalRevenue (accounting identity)', () => {
    const result = computeDebtAccumulation(
      SPENDING, REVENUE, INTEREST, PREV_DEBT, NOMINAL_GDP,
    );

    // totalDeficit = primaryDeficit + interest
    //              = (spending - interest - revenue) + interest
    //              = spending - revenue
    expect(result.totalDeficit).toBeCloseTo(SPENDING - REVENUE, 0);
  });

  it('accumulates debt: debtStock = prevDebt + totalDeficit', () => {
    const result = computeDebtAccumulation(
      SPENDING, REVENUE, INTEREST, PREV_DEBT, NOMINAL_GDP,
    );

    const expectedDebt = PREV_DEBT + result.totalDeficit;
    expect(result.debtStock).toBeCloseTo(expectedDebt, 0);
  });

  it('surpluses reduce debt (revenue > spending)', () => {
    // Revenue exceeds spending → negative deficit → debt decreases
    const highRevenue = 7_000_000_000_000; // $7T
    const result = computeDebtAccumulation(
      SPENDING, highRevenue, INTEREST, PREV_DEBT, NOMINAL_GDP,
    );

    expect(result.totalDeficit).toBeLessThan(0);
    expect(result.debtStock).toBeLessThan(PREV_DEBT);
  });

  it('debt cannot go below zero', () => {
    // Massive surplus with tiny prev debt
    const tinyDebt = 100_000_000; // $100M
    const hugeRevenue = 10_000_000_000_000; // $10T

    const result = computeDebtAccumulation(
      SPENDING, hugeRevenue, INTEREST, tinyDebt, NOMINAL_GDP,
    );

    // Surplus = 10T - 6T = 4T > tinyDebt, but floor is 0
    expect(result.debtStock).toBe(0);
    expect(result.debtStock).toBeGreaterThanOrEqual(0);
  });

  it('caps debtStock at FISCAL_MONETARY_SAFETY_CAP for extreme accumulation', () => {
    const extremeSpending = 1e30;
    const result = computeDebtAccumulation(
      extremeSpending, 0, 0, PREV_DEBT, NOMINAL_GDP,
    );

    expect(result.debtStock).toBe(FISCAL_MONETARY_SAFETY_CAP);
  });

  it('computes debtGDPRatio correctly', () => {
    const result = computeDebtAccumulation(
      SPENDING, REVENUE, INTEREST, PREV_DEBT, NOMINAL_GDP,
    );

    expect(result.debtGDPRatio).toBeCloseTo(result.debtStock / NOMINAL_GDP, 10);
  });

  it('returns debtGDPRatio of 0 when GDP is zero', () => {
    const result = computeDebtAccumulation(
      SPENDING, REVENUE, INTEREST, PREV_DEBT, 0,
    );

    expect(result.debtGDPRatio).toBe(0);
  });

  it('handles balanced budget (spending equals revenue) — only interest adds to debt', () => {
    // Spending = revenue + interest, so primary deficit = 0
    const balancedSpending = REVENUE + INTEREST;

    const result = computeDebtAccumulation(
      balancedSpending, REVENUE, INTEREST, PREV_DEBT, NOMINAL_GDP,
    );

    // Primary deficit should be 0 when non-interest spending = revenue
    expect(result.primaryDeficit).toBeCloseTo(0, 0);
    // Total deficit = interest only
    expect(result.totalDeficit).toBeCloseTo(INTEREST, 0);
    // Debt grows by exactly the interest expense
    expect(result.debtStock).toBeCloseTo(PREV_DEBT + INTEREST, 0);
  });
});

// ============================================================
// 4. computeWeightedAverageDebtRate
// ============================================================

describe('computeWeightedAverageDebtRate', () => {
  const PREV_DEBT = 36_000_000_000_000; // $36T
  const PREV_RATE = 0.029; // 2.9%
  const ROLLOVER_RATE = 0.30; // 30% rolls over annually
  const MARKET_RATE = 0.043; // 4.3% (10Y yield)
  const DEFICIT = 2_000_000_000_000; // $2T new borrowing
  const CURRENT_DEBT = PREV_DEBT + DEFICIT; // $38T

  it('blends rollover and new issuance at market rate with retained at old rate', () => {
    const result = computeWeightedAverageDebtRate(
      PREV_DEBT, PREV_RATE, ROLLOVER_RATE, MARKET_RATE, DEFICIT, CURRENT_DEBT,
    );

    // Manual computation:
    // rolledOver = 36T * 0.30 = 10.8T
    // newDeficit = max(0, 2T) = 2T
    // retained = 36T - 10.8T = 25.2T
    // weightedAvg = (25.2T * 0.029 + (10.8T + 2T) * 0.043) / 38T
    const rolledOver = PREV_DEBT * ROLLOVER_RATE;
    const retained = PREV_DEBT - rolledOver;
    const expected = (retained * PREV_RATE + (rolledOver + DEFICIT) * MARKET_RATE) / CURRENT_DEBT;

    expect(result).toBeCloseTo(expected, 10);
  });

  it('returns market rate when no existing debt (fresh start)', () => {
    const result = computeWeightedAverageDebtRate(
      0, 0, ROLLOVER_RATE, MARKET_RATE, DEFICIT, DEFICIT,
    );

    // No retained debt, all new issuance at market rate
    expect(result).toBeCloseTo(MARKET_RATE, 10);
  });

  it('returns market rate when currentDebtStock is zero or negative', () => {
    const result = computeWeightedAverageDebtRate(
      PREV_DEBT, PREV_RATE, ROLLOVER_RATE, MARKET_RATE, -PREV_DEBT, 0,
    );

    expect(result).toBe(MARKET_RATE);
  });

  it('does not issue at new rate for surpluses (negative deficit)', () => {
    const surplus = -1_000_000_000_000; // -$1T surplus
    const debtAfterSurplus = PREV_DEBT + surplus; // $35T

    const result = computeWeightedAverageDebtRate(
      PREV_DEBT, PREV_RATE, ROLLOVER_RATE, MARKET_RATE, surplus, debtAfterSurplus,
    );

    // newDeficit = max(0, -1T) = 0, so no new issuance at market rate
    // Only rollover affects rate convergence
    const rolledOver = PREV_DEBT * ROLLOVER_RATE;
    const retained = PREV_DEBT - rolledOver;
    const expected = (retained * PREV_RATE + rolledOver * MARKET_RATE) / debtAfterSurplus;

    expect(result).toBeCloseTo(expected, 10);
  });

  it('converges toward market rate over time with repeated rollovers', () => {
    // Simulate 10 years of rollover with zero deficit
    let currentRate = PREV_RATE;
    let debt = PREV_DEBT;

    for (let i = 0; i < 10; i++) {
      currentRate = computeWeightedAverageDebtRate(
        debt, currentRate, ROLLOVER_RATE, MARKET_RATE, 0, debt,
      );
    }

    // After 10 years of 30% rollover, rate should be much closer to market rate
    expect(currentRate).toBeGreaterThan(PREV_RATE);
    expect(currentRate).toBeLessThanOrEqual(MARKET_RATE);
    // With 30% rollover per year, after 10 years: (1-0.30)^10 = 2.8% of debt retains old rate
    // So the rate should be very close to market rate
    expect(currentRate).toBeCloseTo(MARKET_RATE, 2);
  });

  it('rate is clamped to non-negative', () => {
    // Pathological case: negative rate should not persist
    const result = computeWeightedAverageDebtRate(
      PREV_DEBT, -0.05, 0.01, -0.01, 0, PREV_DEBT,
    );

    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('with 100% rollover rate, immediately jumps to market rate', () => {
    const result = computeWeightedAverageDebtRate(
      PREV_DEBT, PREV_RATE, 1.0, MARKET_RATE, 0, PREV_DEBT,
    );

    // retained = 0, all debt rolled over at market rate
    expect(result).toBeCloseTo(MARKET_RATE, 10);
  });

  it('with 0% rollover rate and no deficit, retains old rate', () => {
    const result = computeWeightedAverageDebtRate(
      PREV_DEBT, PREV_RATE, 0, MARKET_RATE, 0, PREV_DEBT,
    );

    // No rollover, no new debt — rate stays the same
    expect(result).toBeCloseTo(PREV_RATE, 10);
  });
});

// ============================================================
// 5. getBaselineFiscalState
// ============================================================

describe('getBaselineFiscalState', () => {
  it('returns a FiscalState object with all required fields', () => {
    const baseline: FiscalState = getBaselineFiscalState();

    expect(baseline).toHaveProperty('federalDebtStock');
    expect(baseline).toHaveProperty('debtGDPRatio');
    expect(baseline).toHaveProperty('interestExpense');
    expect(baseline).toHaveProperty('debtServiceRevenueRatio');
    expect(baseline).toHaveProperty('weightedAverageDebtRate');
    expect(baseline).toHaveProperty('bookedRevenueT1');
    expect(baseline).toHaveProperty('revenueGDPRatio');
    expect(baseline).toHaveProperty('laborTaxRevenue');
    expect(baseline).toHaveProperty('corporateTaxRevenue');
    expect(baseline).toHaveProperty('primaryDeficit');
    expect(baseline).toHaveProperty('totalDeficit');
  });

  it('sets federalDebtStock to INITIAL_FEDERAL_DEBT', () => {
    const baseline = getBaselineFiscalState();

    expect(baseline.federalDebtStock).toBe(INITIAL_FEDERAL_DEBT);
  });

  it('computes debtGDPRatio from constants', () => {
    const baseline = getBaselineFiscalState();

    expect(baseline.debtGDPRatio).toBeCloseTo(
      INITIAL_FEDERAL_DEBT / BASELINE_GDP_NOMINAL_2025, 10,
    );
  });

  it('computes interestExpense from debt and weighted avg rate', () => {
    const baseline = getBaselineFiscalState();

    expect(baseline.interestExpense).toBeCloseTo(
      INITIAL_FEDERAL_DEBT * INITIAL_WEIGHTED_AVG_DEBT_RATE, 0,
    );
  });

  it('sets weightedAverageDebtRate to INITIAL_WEIGHTED_AVG_DEBT_RATE', () => {
    const baseline = getBaselineFiscalState();

    expect(baseline.weightedAverageDebtRate).toBe(INITIAL_WEIGHTED_AVG_DEBT_RATE);
  });

  it('computes totalGovernmentRevenue from GDP and revenue ratio', () => {
    const baseline = getBaselineFiscalState();

    expect(baseline.bookedRevenueT1).toBeCloseTo(
      BASELINE_GDP_NOMINAL_2025 * FEDERAL_REVENUE_GDP_RATIO, 0,
    );
  });

  it('sets revenueGDPRatio to FEDERAL_REVENUE_GDP_RATIO', () => {
    const baseline = getBaselineFiscalState();

    expect(baseline.revenueGDPRatio).toBe(FEDERAL_REVENUE_GDP_RATIO);
  });

  it('initializes laborTaxRevenue and corporateTaxRevenue to 0 (decomposed in first sim year)', () => {
    const baseline = getBaselineFiscalState();

    expect(baseline.laborTaxRevenue).toBe(0);
    expect(baseline.corporateTaxRevenue).toBe(0);
  });

  it('initializes primaryDeficit and totalDeficit to 0 (computed in first sim year)', () => {
    const baseline = getBaselineFiscalState();

    expect(baseline.primaryDeficit).toBe(0);
    expect(baseline.totalDeficit).toBe(0);
  });

  it('initializes debtServiceRevenueRatio to 0', () => {
    const baseline = getBaselineFiscalState();

    expect(baseline.debtServiceRevenueRatio).toBe(0);
  });

  it('returns positive values for debt and revenue fields', () => {
    const baseline = getBaselineFiscalState();

    expect(baseline.federalDebtStock).toBeGreaterThan(0);
    expect(baseline.debtGDPRatio).toBeGreaterThan(0);
    expect(baseline.interestExpense).toBeGreaterThan(0);
    expect(baseline.bookedRevenueT1).toBeGreaterThan(0);
    expect(baseline.revenueGDPRatio).toBeGreaterThan(0);
    expect(baseline.weightedAverageDebtRate).toBeGreaterThan(0);
  });

  it('has Phase 8 Fix 3 maturity fields', () => {
    const baseline = getBaselineFiscalState();
    expect(baseline.weightedAverageMaturity).toBe(6.0);
    expect(baseline.effectiveRolloverRate).toBeCloseTo(0.17, 2);
  });
});

// ============================================================
// Phase 8 Fix 3: computeEndogenousRolloverRate
// ============================================================

describe('computeEndogenousRolloverRate', () => {
  it('baseline conditions produce ~6yr WAM, ~17% rollover', () => {
    const result = computeEndogenousRolloverRate(0, 0.04, 0.04, 0.04);
    expect(result.weightedAverageMaturity).toBeCloseTo(6.0, 0);
    expect(result.effectiveRolloverRate).toBeCloseTo(1 / 6, 1);
  });

  it('high stress shortens WAM and increases rollover', () => {
    const baseline = computeEndogenousRolloverRate(0, 0.04, 0.04, 0.04);
    const stressed = computeEndogenousRolloverRate(0.04, 0.04, 0.10, 0.03);
    expect(stressed.weightedAverageMaturity).toBeLessThan(baseline.weightedAverageMaturity);
    expect(stressed.effectiveRolloverRate).toBeGreaterThan(baseline.effectiveRolloverRate);
  });

  it('stress sensitivity scales correctly', () => {
    const normal = computeEndogenousRolloverRate(0.02, 0.04, 0.07, 0.04, 6, 2.5, 8, 1.0);
    const amplified = computeEndogenousRolloverRate(0.02, 0.04, 0.07, 0.04, 6, 2.5, 8, 2.0);
    // Higher sensitivity → more stress → shorter WAM
    expect(amplified.weightedAverageMaturity).toBeLessThan(normal.weightedAverageMaturity);
  });

  it('WAM clamped to minWAM floor', () => {
    // Extreme stress: max fiscal risk premium, huge yield spread
    const result = computeEndogenousRolloverRate(0.04, 0.04, 0.20, 0.01, 6, 2.5, 8, 5.0);
    expect(result.weightedAverageMaturity).toBeGreaterThanOrEqual(2.5);
    expect(result.effectiveRolloverRate).toBeLessThanOrEqual(1 / 2.5);
  });

  it('calm conditions keep WAM near baseline', () => {
    // Zero fiscal risk, small yield spread — minimal shortening
    const result = computeEndogenousRolloverRate(0, 0.04, 0.04, 0.03, 6, 2.5, 8, 1.0);
    // Small yield spread (0.04 - 0.03 = 0.01) causes slight shortening,
    // but WAM stays within ~10% of baseline
    expect(result.weightedAverageMaturity).toBeGreaterThan(5.0);
    expect(result.weightedAverageMaturity).toBeLessThanOrEqual(8.0);
  });
});

// ============================================================
// Stage 5 (H3) — STANDING ASSERTION: budget books transfer flows 1:1
// The load-bearing budget must book policy transfers AND incremental-UE
// stabilizer transfers dollar-for-dollar in total spending — the same
// constants the income/consumption side paid. Registered per Stage 5 brief.
// ============================================================

describe('Stage 5 standing assertion: budget two-sidedness', () => {
  it('books stabilizerTransfers dollar-for-dollar in totalGovernmentSpending', () => {
    const base = computeGovernmentSpending(
      4_000_000_000_000, 0.027, 30_000_000_000_000,
      500_000_000_000, 0, 0,
      36_000_000_000_000, 0.029,
      1.0, 1.0,
      0,
    );
    const STABILIZER = 1_234_567_890_123; // arbitrary non-round amount
    const withStabilizer = computeGovernmentSpending(
      4_000_000_000_000, 0.027, 30_000_000_000_000,
      500_000_000_000, 0, 0,
      36_000_000_000_000, 0.029,
      1.0, 1.0,
      STABILIZER,
    );
    expect(withStabilizer.stabilizerTransfers).toBe(STABILIZER);
    expect(withStabilizer.totalGovernmentSpending - base.totalGovernmentSpending).toBe(STABILIZER);
  });

  it('books policyTransferAddition dollar-for-dollar (UBI symmetry, budget side)', () => {
    const POLICY = 3_100_000_000_000; // ~$3.1T UBI
    const without = computeGovernmentSpending(
      4_000_000_000_000, 0.027, 30_000_000_000_000,
      0, 0, 0, 36_000_000_000_000, 0.029,
    );
    const withPolicy = computeGovernmentSpending(
      4_000_000_000_000, 0.027, 30_000_000_000_000,
      POLICY, 0, 0, 36_000_000_000_000, 0.029,
    );
    expect(withPolicy.totalGovernmentSpending - without.totalGovernmentSpending).toBe(POLICY);
  });
});
