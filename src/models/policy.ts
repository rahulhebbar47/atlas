/**
 * ATLAS Policy Simulation Model
 *
 * Implements the three income channels (Wages, Assets, Transfers)
 * per DATA_MODEL.md Section 8 and POLICY_MODEL.md.
 *
 * All functions are PURE — no side effects, no state mutation.
 */

import type {
  PolicyConfig,
  PolicyEffects,
  UBIPolicy,
} from '@/types';
import {
  US_POPULATION_2025,
  BASELINE_AVERAGE_ANNUAL_WAGE,
  BASELINE_TRANSFER_PER_UNEMPLOYED,
  DEFAULT_START_YEAR,
  AGE_THRESHOLD_FRACTIONS,
} from './constants';
import { interpolatePolicy } from '@/utils/policyInterpolation';

/**
 * Compute wage policy effects at time t.
 *
 * Formula (DATA_MODEL.md §8.1):
 *   wage_policy_effect(t) = min_wage_boost(t) + wage_subsidy_per_worker(t) + hours_redistribution_effect(t)
 *
 * @param config - Policy configuration
 * @param year - Current year
 * @param averageWage - Current average wage
 * @param totalEmployment - Current total employment
 * @param priceLevel - Current price level (for inflation indexing)
 * @returns Annual wage channel addition (aggregate dollars)
 */
export function computeWagePolicyEffect(
  config: PolicyConfig,
  year: number,
  averageWage: number,
  totalEmployment: number,
  priceLevel: number,
): number {
  let wageAddition = 0;
  const yearsSinceStart = year - DEFAULT_START_YEAR;

  // Minimum wage boost
  if (config.minimumWage.enabled) {
    let effectiveMinWage = interpolatePolicy(config.minimumWage.federalMinimum, year);

    // Inflation indexing
    if (config.minimumWage.indexedToInflation) {
      effectiveMinWage *= priceLevel;
    }

    // Convert hourly to annual (2080 hours = 40hr * 52 weeks)
    const annualMinWage = effectiveMinWage * 2080;

    // DEPRECATED: Direct wage addition from minimum wage removed in Phase 1 overhaul.
    // Minimum wage is now enforced through the Phillips curve wage floor in computeWagePressure().
    // The floor = annualMinWage / BASELINE_AVERAGE_ANNUAL_WAGE, which prevents wage pressure
    // from dropping below the ratio implied by the minimum wage.
  }

  // Wage subsidy
  const subsidyPct = interpolatePolicy(config.wageSubsidy.subsidyPercentage, year);
  if (config.wageSubsidy.enabled && subsidyPct > 0) {
    const subsidyPerWorker = Math.min(
      averageWage * subsidyPct,
      config.wageSubsidy.maxSubsidyPerWorker,
    );
    wageAddition += subsidyPerWorker * totalEmployment;
  }

  // DEPRECATED (Phase 5h Fix 6): Work week reduction — type/config exist but NO
  // computation logic was ever implemented. The theory is that reducing hours
  // redistributes work across more employees, but a proper hours-to-employment
  // model was never built. Hidden from UI; kept in config for structural compat.

  return wageAddition;
}

/**
 * Compute asset policy effects at time t.
 *
 * Formula (DATA_MODEL.md §8.1):
 *   asset_policy_effect(t) = sovereign_fund_dividend(t) + equity_stake_income(t) + profit_share_income(t)
 *
 * @param config - Policy configuration
 * @param year - Current year
 * @param previousFundSize - Previous year's sovereign wealth fund size (billions)
 * @param population - Total population
 * @returns Object with aggregate asset income and updated fund size
 */
export function computeAssetPolicyEffect(
  config: PolicyConfig,
  year: number,
  previousFundSize: number,
  population: number,
): { assetAddition: number; updatedFundSize: number; swfAnnualContribution: number } {
  let assetAddition = 0;
  let updatedFundSize = previousFundSize;
  let swfContribution = 0; // billions — government outlay to the fund
  const yearsSinceStart = year - DEFAULT_START_YEAR;

  // Sovereign wealth fund (POLICY_MODEL.md §3.1)
  if (config.sovereignWealthFund.enabled) {
    const swf = config.sovereignWealthFund;
    const fundSize = yearsSinceStart === 0
      ? swf.initialFundSize
      : previousFundSize;

    // Fund grows: size * (1 + return) + contribution - distribution
    const returns = fundSize * swf.annualReturnRate;
    const distribution = fundSize * swf.distributionRate;
    const annualContrib = interpolatePolicy(swf.annualContribution, year);
    swfContribution = annualContrib; // Phase 5h (Fix 5): Track for fiscal cost
    updatedFundSize = fundSize + returns + annualContrib - distribution;

    // Dividend per capita (billions → dollars: * 1e9 / population)
    const dividendPerCapita = (distribution * 1_000_000_000) / population;
    assetAddition += dividendPerCapita * population;
  }

  // Universal equity stakes (now part of SWF policy — Phase 5g consolidation)
  const swf = config.sovereignWealthFund;
  if (swf.enabled && interpolatePolicy(swf.ownershipFraction, year) > 0) {
    // AI company profits grow over time
    const totalProfits = swf.totalAICompanyProfits * Math.pow(1 + swf.profitGrowthRate, yearsSinceStart);
    // Equity income: ownership_fraction * total_profits
    const ownershipFrac = interpolatePolicy(swf.ownershipFraction, year);
    const equityIncome = ownershipFrac * totalProfits * 1_000_000_000; // billions → dollars
    assetAddition += equityIncome;
  }

  // Profit sharing mandates (POLICY_MODEL.md §3.3)
  // Phase 5g: Now reads from sovereignWealthFund (merged from universalEquity).
  // A future refactor could compute profits from aiGDPContribution directly.
  if (config.profitSharing.enabled) {
    const ps = config.profitSharing;
    // Simplified: a fraction of total AI company profits is shared
    const aiProfits = config.sovereignWealthFund.totalAICompanyProfits *
      Math.pow(1 + config.sovereignWealthFund.profitGrowthRate, yearsSinceStart);
    const sharePct = interpolatePolicy(ps.mandatorySharePercentage, year);
    const sharedProfits = aiProfits * sharePct * 1_000_000_000;
    assetAddition += sharedProfits;
  }

  return { assetAddition, updatedFundSize, swfAnnualContribution: swfContribution };
}

/**
 * Get the fraction of population eligible for UBI at a given age threshold.
 * Uses Census Bureau data with linear interpolation between table entries.
 * Replaces the crude `1 - (age / 80)` formula.
 */
function getEligibleFraction(ageThreshold: number): number {
  const entries = Object.entries(AGE_THRESHOLD_FRACTIONS)
    .map(([k, v]) => [Number(k), v] as [number, number])
    .sort((a, b) => a[0] - b[0]);

  // Below minimum age in table
  if (ageThreshold <= entries[0]![0]) return entries[0]![1];
  // Above maximum age in table
  if (ageThreshold >= entries[entries.length - 1]![0]) return entries[entries.length - 1]![1];

  // Linear interpolation between nearest table entries
  for (let i = 0; i < entries.length - 1; i++) {
    const [age0, frac0] = entries[i]!;
    const [age1, frac1] = entries[i + 1]!;
    if (ageThreshold >= age0 && ageThreshold <= age1) {
      const t = (ageThreshold - age0) / (age1 - age0);
      return frac0 + t * (frac1 - frac0);
    }
  }

  return 0.75; // fallback
}

/**
 * Get the effective monthly UBI amount.
 * In 'manual' mode, uses the PolicySchedule keyframes.
 * In 'indexed' mode, scales base amount with AI GDP growth.
 *
 * @param config - UBI policy configuration
 * @param year - Current simulation year
 * @param aiGDPContribution - Current year's AI GDP contribution ($)
 * @param startYearAiGDP - AI GDP at the index start year ($)
 * @returns Effective monthly UBI amount ($)
 */
export function getEffectiveUBI(
  config: UBIPolicy,
  year: number,
  aiGDPContribution: number,
  startYearAiGDP: number,
): number {
  if (config.mode === 'indexed') {
    const baseAmount = config.indexedBaseAmount ?? 1000;
    const startYear = config.indexedStartYear ?? 2032;
    const indexRate = config.productivityIndexRate ?? 1.0;

    if (year < startYear) return 0;

    // Floor AI GDP at $1B to avoid division by near-zero
    const baseAiGDP = Math.max(1_000_000_000, startYearAiGDP);
    const currentAiGDP = Math.max(1_000_000_000, aiGDPContribution);
    const growthRatio = currentAiGDP / baseAiGDP;

    return baseAmount * Math.max(1, Math.pow(growthRatio, indexRate));
  }

  // Manual mode: use keyframe schedule
  return interpolatePolicy(config.monthlyAmount, year);
}

/**
 * Compute transfer policy effects at time t.
 *
 * Formula (DATA_MODEL.md §8.1):
 *   transfer_policy_effect(t) = ubi_amount(t) + enhanced_ui(t) + retraining_stipend(t)
 *
 * @param config - Policy configuration
 * @param year - Current year
 * @param population - Total population
 * @param totalUnemployment - Total unemployed
 * @param averageWage - Current average wage (for UI replacement rate)
 * @param priceLevel - Current price level (for indexing)
 * @param displacedWorkers - Number of displaced workers eligible for retraining
 * @returns Aggregate transfer income (dollars)
 */
export function computeTransferPolicyEffect(
  config: PolicyConfig,
  year: number,
  population: number,
  totalUnemployment: number,
  averageWage: number,
  priceLevel: number,
  displacedWorkers: number,
  aiGDPContribution?: number,     // Phase 5g: for UBI productivity indexing
  startYearAiGDP?: number,        // Phase 5g: AI GDP at index start year
): number {
  let transferAddition = 0;

  // UBI (POLICY_MODEL.md §4.1)
  const ubiAmount = getEffectiveUBI(
    config.ubi, year,
    aiGDPContribution ?? 0,
    startYearAiGDP ?? 0,
  );
  if (config.ubi.enabled && ubiAmount > 0) {
    let monthlyAmount = ubiAmount;

    // Inflation indexing
    if (config.ubi.indexedToInflation) {
      monthlyAmount *= priceLevel;
    }

    const annualUBI = monthlyAmount * 12;

    // Eligible population (above age threshold — Census Bureau data)
    const eligibleFraction = getEligibleFraction(config.ubi.ageThreshold);
    const eligiblePopulation = population * eligibleFraction;

    transferAddition += annualUBI * eligiblePopulation;
  }
  // TODO (Phase 5h Fix 7): config.ubi.phaseOut is defined in the type/config but
  // NOT applied here. A proper implementation would reduce UBI for recipients above
  // phaseOut.incomeThreshold at phaseOut.phaseOutRate. This requires per-capita income
  // distribution data that the model doesn't currently track. phaseOut is marked
  // @deprecated and hidden from UI until this can be modeled correctly.

  // Enhanced unemployment insurance (POLICY_MODEL.md §4.2)
  // FIX: The baseline transfer per unemployed ($19,200/yr from
  // BASELINE_TRANSFER_PER_UNEMPLOYED) already models standard UI payments at the
  // default 45% replacement rate. The enhanced UI policy should only add the
  // INCREMENTAL benefit above baseline — otherwise the income composition at
  // year 2025 is skewed because standard UI gets double-counted (once in the
  // baseline transfer calculation and again here).
  if (config.enhancedUI.enabled) {
    const ui = config.enhancedUI;
    const replRate = interpolatePolicy(ui.replacementRate, year);
    const weeklyBenefit = (averageWage / 52) * replRate;
    const annualBenefit = weeklyBenefit * Math.min(52, ui.durationWeeks);

    // Only add the amount ABOVE the baseline transfer per unemployed.
    // At default settings (45% replacement, 26 weeks), this should be ~$0
    // since that's already captured in BASELINE_TRANSFER_PER_UNEMPLOYED.
    const incrementalBenefit = Math.max(0, annualBenefit - BASELINE_TRANSFER_PER_UNEMPLOYED);
    transferAddition += incrementalBenefit * totalUnemployment;

    // Retraining bonus (always incremental — not part of baseline)
    if (ui.retrainingBonus > 0) {
      transferAddition += ui.retrainingBonus * totalUnemployment;
    }
  }

  // Retraining programs (POLICY_MODEL.md §4.3)
  if (config.retraining.enabled) {
    const rt = config.retraining;
    const stipend = interpolatePolicy(rt.stipendMonthly, year);
    const annualStipend = stipend * Math.min(12, rt.durationMonths);
    // Only a fraction of displaced workers are in retraining at any given time
    const inRetraining = displacedWorkers * config.retraining.participationRate;
    transferAddition += annualStipend * inRetraining;
  }

  return transferAddition;
}

/**
 * Compute all policy effects for a given year.
 *
 * @param config - Full policy configuration
 * @param year - Current year
 * @param totalEmployment - Current total employment
 * @param totalUnemployment - Current total unemployment
 * @param averageWage - Current average wage
 * @param population - Total population
 * @param priceLevel - Current price level
 * @param gdp - Current GDP
 * @param previousFundSize - Previous year's sovereign wealth fund size
 * @param displacedWorkers - Displaced workers eligible for retraining
 * @returns PolicyEffects object
 */
export function computePolicyEffects(
  config: PolicyConfig,
  year: number,
  totalEmployment: number,
  totalUnemployment: number,
  averageWage: number,
  population: number,
  priceLevel: number,
  gdp: number,
  previousFundSize: number,
  displacedWorkers: number,
  aiGDPContribution?: number,     // Phase 5g: for UBI productivity indexing
  startYearAiGDP?: number,        // Phase 5g: AI GDP at index start year
): PolicyEffects {
  // Wage channel
  const wageChannelAddition = computeWagePolicyEffect(
    config, year, averageWage, totalEmployment, priceLevel,
  );

  // Asset channel
  const { assetAddition: assetChannelAddition, updatedFundSize, swfAnnualContribution } = computeAssetPolicyEffect(
    config, year, previousFundSize, population,
  );

  // Transfer channel
  const transferChannelAddition = computeTransferPolicyEffect(
    config, year, population, totalUnemployment, averageWage, priceLevel, displacedWorkers,
    aiGDPContribution, startYearAiGDP,
  );

  const totalPolicyIncome = wageChannelAddition + assetChannelAddition + transferChannelAddition;

  // Fiscal cost = wage subsidies + transfers + SWF government contribution
  // Phase 5h (Fix 5): SWF annual contribution is a government outlay — include in fiscal cost.
  // swfAnnualContribution is in billions, wage/transfer channels are in dollars → ×1e9 conversion.
  const fiscalCost = wageChannelAddition + transferChannelAddition + (swfAnnualContribution * 1_000_000_000);
  const fiscalCostAsPercentGDP = gdp > 0 ? fiscalCost / gdp : 0;

  // Required asset ownership and transfer levels are computed in simulation.ts
  // after computeMacro() runs, since they need the baseline ARPP from year 0.
  // Initialized to 0 here; patched in the simulation loop.
  const requiredAssetOwnership = 0;
  const requiredTransferLevel = 0;

  return {
    wageChannelAddition,
    assetChannelAddition,
    transferChannelAddition,
    totalPolicyIncome,
    fiscalCost,
    fiscalCostAsPercentGDP,
    sovereignFundSize: updatedFundSize,
    swfAnnualContribution, // billions — for downstream display/CSV
    requiredAssetOwnership,
    requiredTransferLevel,
  };
}

/**
 * Compute required asset ownership fraction to maintain baseline ARPP.
 *
 * Formula (DATA_MODEL.md §8.4):
 *   required_asset_ownership = (target_ARPP × N × P(t) - E(t) × W(t) - aggregate_transfer_income(t)) / (N × total_ai_profits(t))
 *
 * "How much of the AI economy does the average person need to own
 *  to maintain current living standards?"
 *
 * IMPORTANT: targetARPP should be the baseline ARPP from year 0 (before any
 * displacement), NOT the current-year ARPP. If we target current ARPP, the
 * required levels shrink as the economy shrinks, which defeats the purpose.
 *
 * @param targetARPP - Baseline ARPP to maintain (from simulation year 0)
 * @param priceLevel - P(t), current price level
 * @param totalEmployment - E(t), current employed population
 * @param averageWage - W(t), current average annual wage
 * @param aggregateTransferIncome - Total aggregate transfer income from macro computation
 * @param population - N, total population
 * @param totalAIProfitsPerCapita - total AI company profits in dollars divided by N
 * @returns Required ownership fraction [0, 1]
 */
export function computeRequiredAssetOwnership(
  targetARPP: number,
  priceLevel: number,
  totalEmployment: number,
  averageWage: number,
  aggregateTransferIncome: number,
  population: number,
  totalAIProfitsPerCapita: number,
): number {
  // The shortfall that must be covered by asset income:
  // target_ARPP (per capita) × N × P(t) = total aggregate nominal income needed
  // Currently have: E × W + aggregate_transfer_income
  // Need: additional asset income = (target_ARPP × N × P) - E × W - transfers
  const targetNominalIncome = targetARPP * population * priceLevel;
  const currentWageIncome = totalEmployment * averageWage;
  const shortfall = targetNominalIncome - currentWageIncome - aggregateTransferIncome;

  // Denominator: total AI profits available per capita × population
  // required_ownership = shortfall / (N × profits_per_capita)
  const totalProfits = totalAIProfitsPerCapita * population;

  if (totalProfits <= 0 || shortfall <= 0) {
    return 0; // No ownership needed — wage + transfer income already sufficient
  }

  return Math.max(0, Math.min(1, shortfall / totalProfits));
}

/**
 * Compute required transfer level per unemployed person to maintain baseline ARPP.
 *
 * Formula (DATA_MODEL.md §8.4):
 *   required_transfers = (target_ARPP × N × P(t) - E(t) × W(t) - aggregate_asset_income(t)) / U(t)
 *
 * "How much must we pay each unemployed person to maintain baseline living standards?"
 *
 * IMPORTANT: targetARPP should be the baseline ARPP from year 0 (before any
 * displacement), NOT the current-year ARPP.
 *
 * @param targetARPP - Baseline ARPP to maintain (from simulation year 0)
 * @param priceLevel - P(t), current price level
 * @param totalEmployment - E(t), current employed population
 * @param averageWage - W(t), current average annual wage
 * @param aggregateAssetIncome - Total aggregate asset income from macro computation
 * @param population - N, total population
 * @param totalUnemployment - U(t), current unemployed population
 * @returns Required annual transfer per unemployed person (dollars, >= 0)
 */
export function computeRequiredTransferLevel(
  targetARPP: number,
  priceLevel: number,
  totalEmployment: number,
  averageWage: number,
  aggregateAssetIncome: number,
  population: number,
  totalUnemployment: number,
): number {
  // target_ARPP (per capita) × N × P(t) = total aggregate nominal income needed
  const targetNominalIncome = targetARPP * population * priceLevel;
  const currentWageIncome = totalEmployment * averageWage;
  const shortfall = targetNominalIncome - currentWageIncome - aggregateAssetIncome;

  if (totalUnemployment <= 0 || shortfall <= 0) {
    return 0; // No transfers needed — wage + asset income already sufficient
  }

  return Math.max(0, shortfall / totalUnemployment);
}
