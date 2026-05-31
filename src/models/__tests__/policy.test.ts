/**
 * ATLAS Policy Simulation Model — Unit Tests
 *
 * Tests the three income channels (Wages, Assets, Transfers) and their
 * aggregation via computePolicyEffects, as defined in src/models/policy.ts.
 *
 * Mathematical invariants under test:
 *   wage_policy_effect(t) = min_wage_boost(t) + wage_subsidy_per_worker(t)
 *   asset_policy_effect(t) = sovereign_fund_dividend(t) + equity_stake_income(t) + profit_share_income(t)
 *   transfer_policy_effect(t) = ubi_amount(t) + enhanced_ui(t) + retraining_stipend(t)
 *   fiscal_cost = wage_channel + transfer_channel (assets self-funded)
 */

import { describe, it, expect } from 'vitest';
import {
  computeWagePolicyEffect,
  computeAssetPolicyEffect,
  computeTransferPolicyEffect,
  computePolicyEffects,
} from '@/models/policy';
import { DEFAULT_START_YEAR } from '@/models/constants';
import type { PolicyConfig } from '@/types';

// ============================================================
// Helpers
// ============================================================

/**
 * A fully-disabled policy config for isolated testing.
 * Every policy channel is disabled and zeroed out so that individual
 * tests can enable only the policy they're testing.
 */
/** Helper: wrap a flat value as a constant PolicySchedule at year 2025. */
function sched(value: number): import('@/types').PolicySchedule {
  if (value === 0) return { keyframes: [] };
  return { keyframes: [{ year: 2025, value }] };
}

function createDisabledConfig(): PolicyConfig {
  return {
    minimumWage: {
      enabled: false,
      federalMinimum: sched(7.25),
      stateOverrides: {},
      indexedToInflation: false,
      indexedToProductivity: false,
    },
    wageSubsidy: {
      enabled: false,
      subsidyPercentage: sched(0),
      maxSubsidyPerWorker: 0,
      phaseOutThreshold: 0,
    },
    workWeekReduction: {
      enabled: false,
      standardHours: sched(40),
      overtimeMultiplier: 1.5,
    },
    sovereignWealthFund: {
      enabled: false,
      initialFundSize: 0,
      annualContribution: sched(0),
      annualReturnRate: 0.07,
      distributionRate: 0.04,
      distribution: 'universal',
      // Merged from universalEquity (Phase 5g SWF consolidation)
      ownershipFraction: sched(0),
      totalAICompanyProfits: 500,
      profitGrowthRate: 0.15,
      distributionMethod: 'equal',
    },
    profitSharing: {
      enabled: false,
      mandatorySharePercentage: sched(0),
      companyRevenueThreshold: 1_000_000_000,
      distributionScope: 'national',
    },
    ubi: {
      enabled: false,
      monthlyAmount: sched(0),
      ageThreshold: 18,
      phaseOut: {
        enabled: false,
        incomeThreshold: 75_000,
        phaseOutRate: 0.2,
      },
      indexedToInflation: true,
      indexedToProductivity: false,
      mode: 'manual',
    },
    enhancedUI: {
      enabled: false,
      replacementRate: sched(0.45),
      durationWeeks: 26,
      retrainingBonus: 0,
      stateOverrides: {},
    },
    retraining: {
      enabled: false,
      stipendMonthly: sched(0),
      durationMonths: 6,
      effectivenessRate: 0.3,
      participationRate: 0.30,
      targetClusters: [],
    },
  };
}

/** Standard test values for economic state variables. */
const YEAR = DEFAULT_START_YEAR;
const AVERAGE_WAGE = 65_470;
const TOTAL_EMPLOYMENT = 157_000_000;
const PRICE_LEVEL = 1.0;
const POPULATION = 340_000_000;
const TOTAL_UNEMPLOYMENT = 6_000_000;
const GDP = 23_000_000_000_000;
const PREVIOUS_FUND_SIZE = 0;
const DISPLACED_WORKERS = 500_000;

// ============================================================
// computeWagePolicyEffect
// ============================================================

describe('computeWagePolicyEffect', () => {
  it('returns 0 wage addition when all policies are disabled', () => {
    const config = createDisabledConfig();
    const result = computeWagePolicyEffect(
      config, YEAR, AVERAGE_WAGE, TOTAL_EMPLOYMENT, PRICE_LEVEL,
    );
    expect(result).toBe(0);
  });

  it('returns positive wage addition when minimum wage is enabled', () => {
    const config = createDisabledConfig();
    config.minimumWage.enabled = true;
    config.minimumWage.federalMinimum = sched(15.00); // $15/hr

    const result = computeWagePolicyEffect(
      config, YEAR, AVERAGE_WAGE, TOTAL_EMPLOYMENT, PRICE_LEVEL,
    );

    // DEPRECATED: Direct minimum wage boost removed in Phase 1 overhaul.
    // Minimum wage is now enforced through the Phillips curve wage floor.
    // With no affectedFraction calculation, min wage alone produces 0 wage addition.
    expect(result).toBe(0);
  });

  it('returns wage subsidy proportional to employment when wage subsidy is enabled', () => {
    const config = createDisabledConfig();
    config.wageSubsidy.enabled = true;
    config.wageSubsidy.subsidyPercentage = sched(0.10); // 10% of average wage
    config.wageSubsidy.maxSubsidyPerWorker = 10_000;

    const result = computeWagePolicyEffect(
      config, YEAR, AVERAGE_WAGE, TOTAL_EMPLOYMENT, PRICE_LEVEL,
    );

    // subsidyPerWorker = min(65470 * 0.10, 10000) = min(6547, 10000) = 6547
    // total = 6547 * 157_000_000
    const expectedSubsidy = Math.min(AVERAGE_WAGE * 0.10, 10_000);
    const expectedTotal = expectedSubsidy * TOTAL_EMPLOYMENT;
    expect(result).toBeCloseTo(expectedTotal, 0);
    expect(result).toBeGreaterThan(0);

    // Doubling employment should double the wage subsidy addition
    const resultDouble = computeWagePolicyEffect(
      config, YEAR, AVERAGE_WAGE, TOTAL_EMPLOYMENT * 2, PRICE_LEVEL,
    );
    expect(resultDouble).toBeCloseTo(result * 2, 0);
  });
});

// ============================================================
// computeAssetPolicyEffect
// ============================================================

describe('computeAssetPolicyEffect', () => {
  it('returns zero asset addition and unchanged fund when all policies are disabled', () => {
    const config = createDisabledConfig();
    const { assetAddition, updatedFundSize } = computeAssetPolicyEffect(
      config, YEAR, PREVIOUS_FUND_SIZE, POPULATION,
    );
    expect(assetAddition).toBe(0);
    expect(updatedFundSize).toBe(0);
  });

  it('grows the sovereign wealth fund and produces dividends when SWF is enabled', () => {
    const config = createDisabledConfig();
    config.sovereignWealthFund.enabled = true;
    config.sovereignWealthFund.initialFundSize = 1000; // $1T in billions
    config.sovereignWealthFund.annualContribution = sched(50);  // $50B/year
    config.sovereignWealthFund.annualReturnRate = 0.07;
    config.sovereignWealthFund.distributionRate = 0.04;

    const { assetAddition, updatedFundSize } = computeAssetPolicyEffect(
      config, YEAR, 0, POPULATION,
    );

    // At year = DEFAULT_START_YEAR, yearsSinceStart = 0, so fundSize = initialFundSize = 1000
    // returns = 1000 * 0.07 = 70
    // distribution = 1000 * 0.04 = 40
    // updatedFundSize = 1000 + 70 + 50 - 40 = 1080
    expect(updatedFundSize).toBeCloseTo(1080, 0);

    // assetAddition = dividendPerCapita * population
    // dividendPerCapita = (40 * 1e9) / 340_000_000 = ~117.65
    // assetAddition = 117.65 * 340_000_000 = 40 * 1e9 = 40_000_000_000
    expect(assetAddition).toBeCloseTo(40_000_000_000, -3);
    expect(assetAddition).toBeGreaterThan(0);
  });

  it('produces income from ownership fraction when SWF equity stake is enabled', () => {
    const config = createDisabledConfig();
    config.sovereignWealthFund.enabled = true;
    config.sovereignWealthFund.ownershipFraction = sched(0.05); // 5% ownership
    config.sovereignWealthFund.totalAICompanyProfits = 500; // $500B baseline
    config.sovereignWealthFund.profitGrowthRate = 0.15;

    const { assetAddition } = computeAssetPolicyEffect(
      config, YEAR, 0, POPULATION,
    );

    // yearsSinceStart = 0, so totalProfits = 500 * (1.15)^0 = 500
    // equityIncome = 0.05 * 500 * 1e9 = 25_000_000_000
    expect(assetAddition).toBeCloseTo(25_000_000_000, -3);
    expect(assetAddition).toBeGreaterThan(0);

    // In year DEFAULT_START_YEAR + 1, profits grow by 15%
    const { assetAddition: year2Addition } = computeAssetPolicyEffect(
      config, YEAR + 1, 0, POPULATION,
    );
    expect(year2Addition).toBeGreaterThan(assetAddition);
  });

  it('produces income from profit sharing when profit sharing is enabled', () => {
    const config = createDisabledConfig();
    config.profitSharing.enabled = true;
    config.profitSharing.mandatorySharePercentage = sched(0.10); // 10% mandatory share
    // Profit sharing references sovereignWealthFund.totalAICompanyProfits
    config.sovereignWealthFund.totalAICompanyProfits = 500;
    config.sovereignWealthFund.profitGrowthRate = 0.15;

    const { assetAddition } = computeAssetPolicyEffect(
      config, YEAR, 0, POPULATION,
    );

    // yearsSinceStart = 0, aiProfits = 500
    // sharedProfits = 500 * 0.10 * 1e9 = 50_000_000_000
    expect(assetAddition).toBeCloseTo(50_000_000_000, -3);
    expect(assetAddition).toBeGreaterThan(0);
  });
});

// ============================================================
// computeTransferPolicyEffect
// ============================================================

describe('computeTransferPolicyEffect', () => {
  it('returns zero when all transfer policies are disabled', () => {
    const config = createDisabledConfig();
    const result = computeTransferPolicyEffect(
      config, YEAR, POPULATION, TOTAL_UNEMPLOYMENT,
      AVERAGE_WAGE, PRICE_LEVEL, DISPLACED_WORKERS,
    );
    expect(result).toBe(0);
  });

  it('returns per-capita UBI transfer when UBI is enabled', () => {
    const config = createDisabledConfig();
    config.ubi.enabled = true;
    config.ubi.monthlyAmount = sched(1000); // $1000/month
    config.ubi.ageThreshold = 18;
    config.ubi.indexedToInflation = false;

    const result = computeTransferPolicyEffect(
      config, YEAR, POPULATION, TOTAL_UNEMPLOYMENT,
      AVERAGE_WAGE, PRICE_LEVEL, DISPLACED_WORKERS,
    );

    // annualUBI = 1000 * 12 = 12000
    // eligibleFraction = 0.784 (Census Bureau age 18 threshold)
    // eligiblePopulation = 340_000_000 * 0.784 = 266_560_000
    // transferAddition = 12000 * 266_560_000 = 3_198_720_000_000
    const annualUBI = 1000 * 12;
    const eligibleFraction = 0.784; // Census Bureau data for age 18
    const eligiblePopulation = POPULATION * eligibleFraction;
    const expected = annualUBI * eligiblePopulation;

    expect(result).toBeCloseTo(expected, -3);
    expect(result).toBeGreaterThan(0);
  });

  it('returns unemployment-proportional transfer when enhanced UI is enabled', () => {
    const config = createDisabledConfig();
    config.enhancedUI.enabled = true;
    config.enhancedUI.replacementRate = sched(0.60);
    config.enhancedUI.durationWeeks = 52;
    config.enhancedUI.retrainingBonus = 2000;

    const result = computeTransferPolicyEffect(
      config, YEAR, POPULATION, TOTAL_UNEMPLOYMENT,
      AVERAGE_WAGE, PRICE_LEVEL, DISPLACED_WORKERS,
    );

    // Enhanced UI now only adds the INCREMENTAL amount
    // above BASELINE_TRANSFER_PER_UNEMPLOYED ($19,200/yr), since the baseline
    // already captures standard UI payments.
    // weeklyBenefit = (65470 / 52) * 0.60 = 755.42
    // annualBenefit = 755.42 * min(52, 52) = 39,282.12
    // incrementalBenefit = max(0, 39282.12 - 19200) = 20,082.12
    // ui portion = 20082.12 * 6_000_000
    // retraining bonus = 2000 * 6_000_000
    const weeklyBenefit = (AVERAGE_WAGE / 52) * 0.60;
    const annualBenefit = weeklyBenefit * Math.min(52, 52);
    const incrementalBenefit = Math.max(0, annualBenefit - 19_200);
    const uiPortion = incrementalBenefit * TOTAL_UNEMPLOYMENT;
    const bonusPortion = 2000 * TOTAL_UNEMPLOYMENT;
    const expected = uiPortion + bonusPortion;

    expect(result).toBeCloseTo(expected, -3);
    expect(result).toBeGreaterThan(0);

    // More unemployment should produce more transfers
    const resultHigherUnemployment = computeTransferPolicyEffect(
      config, YEAR, POPULATION, TOTAL_UNEMPLOYMENT * 2,
      AVERAGE_WAGE, PRICE_LEVEL, DISPLACED_WORKERS,
    );
    expect(resultHigherUnemployment).toBeGreaterThan(result);
  });

  it('returns retraining stipend when retraining policy is enabled', () => {
    const config = createDisabledConfig();
    config.retraining.enabled = true;
    config.retraining.stipendMonthly = sched(2000);
    config.retraining.durationMonths = 6;
    config.retraining.effectivenessRate = 0.3;

    const result = computeTransferPolicyEffect(
      config, YEAR, POPULATION, TOTAL_UNEMPLOYMENT,
      AVERAGE_WAGE, PRICE_LEVEL, DISPLACED_WORKERS,
    );

    // annualStipend = 2000 * min(12, 6) = 12000
    // inRetraining = 500_000 * 0.3 = 150_000
    // transferAddition = 12000 * 150_000 = 1_800_000_000
    const annualStipend = 2000 * Math.min(12, 6);
    const inRetraining = DISPLACED_WORKERS * 0.3;
    const expected = annualStipend * inRetraining;

    expect(result).toBeCloseTo(expected, -3);
    expect(result).toBeGreaterThan(0);
  });
});

// ============================================================
// computePolicyEffects (aggregate)
// ============================================================

describe('computePolicyEffects', () => {
  it('aggregates all three channels into totalPolicyIncome', () => {
    const config = createDisabledConfig();

    // Enable one policy in each channel
    config.wageSubsidy.enabled = true;
    config.wageSubsidy.subsidyPercentage = sched(0.05);
    config.wageSubsidy.maxSubsidyPerWorker = 5000;

    config.sovereignWealthFund.enabled = true;
    config.sovereignWealthFund.initialFundSize = 500;
    config.sovereignWealthFund.annualContribution = sched(25);
    config.sovereignWealthFund.annualReturnRate = 0.07;
    config.sovereignWealthFund.distributionRate = 0.04;

    config.ubi.enabled = true;
    config.ubi.monthlyAmount = sched(500);
    config.ubi.ageThreshold = 18;
    config.ubi.indexedToInflation = false;

    const result = computePolicyEffects(
      config, YEAR, TOTAL_EMPLOYMENT, TOTAL_UNEMPLOYMENT,
      AVERAGE_WAGE, POPULATION, PRICE_LEVEL, GDP, PREVIOUS_FUND_SIZE,
      DISPLACED_WORKERS,
    );

    // All three channels should be positive
    expect(result.wageChannelAddition).toBeGreaterThan(0);
    expect(result.assetChannelAddition).toBeGreaterThan(0);
    expect(result.transferChannelAddition).toBeGreaterThan(0);

    // totalPolicyIncome = sum of all three
    const expectedTotal =
      result.wageChannelAddition +
      result.assetChannelAddition +
      result.transferChannelAddition;
    expect(result.totalPolicyIncome).toBeCloseTo(expectedTotal, 0);
  });

  it('computes fiscal cost as wage + transfer additions (assets self-funded)', () => {
    const config = createDisabledConfig();

    config.wageSubsidy.enabled = true;
    config.wageSubsidy.subsidyPercentage = sched(0.05);
    config.wageSubsidy.maxSubsidyPerWorker = 5000;

    config.sovereignWealthFund.enabled = true;
    config.sovereignWealthFund.initialFundSize = 500;
    config.sovereignWealthFund.annualContribution = sched(25);
    config.sovereignWealthFund.annualReturnRate = 0.07;
    config.sovereignWealthFund.distributionRate = 0.04;

    config.ubi.enabled = true;
    config.ubi.monthlyAmount = sched(500);
    config.ubi.ageThreshold = 18;
    config.ubi.indexedToInflation = false;

    const result = computePolicyEffects(
      config, YEAR, TOTAL_EMPLOYMENT, TOTAL_UNEMPLOYMENT,
      AVERAGE_WAGE, POPULATION, PRICE_LEVEL, GDP, PREVIOUS_FUND_SIZE,
      DISPLACED_WORKERS,
    );

    // Fiscal cost = wage + transfer + SWF government contribution (Phase 5h Fix 5)
    // SWF dividends (asset channel) are self-funded, but the government's annual
    // contribution to the fund IS a fiscal outlay.
    const expectedFiscalCost = result.wageChannelAddition + result.transferChannelAddition
      + (result.swfAnnualContribution * 1_000_000_000);
    expect(result.fiscalCost).toBeCloseTo(expectedFiscalCost, 0);

    // Asset channel (dividends from SWF returns) should NOT be included in fiscal cost
    expect(result.fiscalCost).not.toBeCloseTo(result.totalPolicyIncome, 0);
  });

  it('returns all zeroes (except fund size) when all policies are disabled', () => {
    const config = createDisabledConfig();
    const result = computePolicyEffects(
      config, YEAR, TOTAL_EMPLOYMENT, TOTAL_UNEMPLOYMENT,
      AVERAGE_WAGE, POPULATION, PRICE_LEVEL, GDP, PREVIOUS_FUND_SIZE,
      DISPLACED_WORKERS,
    );

    expect(result.wageChannelAddition).toBe(0);
    expect(result.assetChannelAddition).toBe(0);
    expect(result.transferChannelAddition).toBe(0);
    expect(result.totalPolicyIncome).toBe(0);
    expect(result.fiscalCost).toBe(0);
    expect(result.fiscalCostAsPercentGDP).toBe(0);
    expect(result.requiredAssetOwnership).toBe(0);
    expect(result.requiredTransferLevel).toBe(0);
  });

  it('computes fiscalCostAsPercentGDP correctly', () => {
    const config = createDisabledConfig();

    config.wageSubsidy.enabled = true;
    config.wageSubsidy.subsidyPercentage = sched(0.05);
    config.wageSubsidy.maxSubsidyPerWorker = 5000;

    const result = computePolicyEffects(
      config, YEAR, TOTAL_EMPLOYMENT, TOTAL_UNEMPLOYMENT,
      AVERAGE_WAGE, POPULATION, PRICE_LEVEL, GDP, PREVIOUS_FUND_SIZE,
      DISPLACED_WORKERS,
    );

    const expectedPercent = result.fiscalCost / GDP;
    expect(result.fiscalCostAsPercentGDP).toBeCloseTo(expectedPercent, 10);
  });

  it('tracks updated sovereign fund size', () => {
    const config = createDisabledConfig();

    config.sovereignWealthFund.enabled = true;
    config.sovereignWealthFund.initialFundSize = 1000;
    config.sovereignWealthFund.annualContribution = sched(50);
    config.sovereignWealthFund.annualReturnRate = 0.07;
    config.sovereignWealthFund.distributionRate = 0.04;

    const result = computePolicyEffects(
      config, YEAR, TOTAL_EMPLOYMENT, TOTAL_UNEMPLOYMENT,
      AVERAGE_WAGE, POPULATION, PRICE_LEVEL, GDP, PREVIOUS_FUND_SIZE,
      DISPLACED_WORKERS,
    );

    // At year 0: fundSize = initialFundSize = 1000
    // updatedFundSize = 1000 + (1000*0.07) + 50 - (1000*0.04) = 1080
    expect(result.sovereignFundSize).toBeCloseTo(1080, 0);
  });
});
