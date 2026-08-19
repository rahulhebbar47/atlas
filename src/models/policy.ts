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
  // DEPRECATED (Stage 5): netting switched to the current-law statutory UI equivalent
  // BASELINE_TRANSFER_PER_UNEMPLOYED,
  CURRENT_LAW_UI_REPLACEMENT_RATE,
  CURRENT_LAW_UI_DURATION_WEEKS,
  DEFAULT_START_YEAR,
  DEFAULT_SWF_START_YEAR,
  AGE_THRESHOLD_FRACTIONS,
  HOURS_PER_WORK_YEAR,
  MONTHS_PER_YEAR,
  WEEKS_PER_YEAR,
  DOLLARS_PER_BILLION,
  DEFAULT_INDEXED_UBI_BASE_MONTHLY,
  DEFAULT_INDEXED_UBI_START_YEAR,
  DEFAULT_UBI_PRODUCTIVITY_INDEX_RATE,
  INDEXED_UBI_AI_GDP_FLOOR,
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

    const annualMinWage = effectiveMinWage * HOURS_PER_WORK_YEAR;

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
  /** Stage H addendum (A-6): prior-year realized ENDOGENOUS AI corporate profits, dollars
   *  (MacroOutput.aiCorporateProfits at t−1; 0 at year 0 — the 2025 anchor's initialization).
   *  The equity-stakes and profit-sharing payout base. */
  laggedAiProfits: number = 0,
): { assetAddition: number; updatedFundSize: number; swfAnnualContribution: number } {
  let assetAddition = 0;
  let updatedFundSize = previousFundSize;
  let swfContribution = 0; // billions — government outlay to the fund
  // DEPRECATED (the per-field policy rebuild): the seed condition now keys off the
  // fund's own startYear, not the simulation offset.
  // const yearsSinceStart = year - DEFAULT_START_YEAR;

  // Sovereign wealth fund (POLICY_MODEL.md §3.1). The creation year (the per-field
  // policy rebuild): initialFundSize seeds AT swf.startYear and the fund is inert
  // before it — no returns, no dividends, no contributions consumed, no fiscal cost.
  // Absent startYear ⇒ DEFAULT_SWF_START_YEAR = DEFAULT_START_YEAR, and the sim loop
  // never runs years before the start year, so the prior seed condition
  // (yearsSinceStart === 0) is reproduced exactly. This also closes the prior
  // seed-loss class: a fund enabled after the start year used to skip its seed forever.
  if (config.sovereignWealthFund.enabled) {
    const swf = config.sovereignWealthFund;
    const fundStartYear = swf.startYear ?? DEFAULT_SWF_START_YEAR;
    if (year >= fundStartYear) {
      const fundSize = year === fundStartYear
        ? swf.initialFundSize
        : previousFundSize;

      // Fund grows: size * (1 + return) + contribution - distribution
      const returns = fundSize * swf.annualReturnRate;
      const distribution = fundSize * swf.distributionRate;
      const annualContrib = interpolatePolicy(swf.annualContribution, year);
      swfContribution = annualContrib; // Phase 5h (Fix 5): Track for fiscal cost
      updatedFundSize = fundSize + returns + annualContrib - distribution;

      // Dividend per capita (billions → dollars: * 1e9 / population)
      const dividendPerCapita = (distribution * DOLLARS_PER_BILLION) / population;
      assetAddition += dividendPerCapita * population;
    }
  }

  // Universal equity stakes (now part of SWF policy — Phase 5g consolidation)
  // Stage H addendum (A-6, measure-then-decide): the payout base is the model's ENDOGENOUS
  // AI corporate profits, lagged one year (t−1 realized — the basis the loop ordering forces:
  // policy runs before macro each year — and the one profit-distribution economics prescribes:
  // this year's distributions come from last year's realized earnings). Year 0 reads the
  // year-0 initialization (0 — the 2025 anchor carries no automation profits by construction).
  // The RETIRED exogenous path (kept as the deprecation record, never executed):
  //   totalProfits = swf.totalAICompanyProfits × (1 + swf.profitGrowthRate)^t   [500 × 1.15^t $B]
  // claimed ≈$1.0T of AI profits in 2030 when the endogenous residual was ≈$0, and ≈2× the
  // endogenous base by 2050 — payouts priced off profits the model never recorded.
  const swf = config.sovereignWealthFund;
  // THE NON-NEGATIVE PAYOUT BASE (the policy-wiring review's fix): distributions
  // are non-negative by the model's own dividend definition — a loss year pays
  // zero; the loss itself flows through the AI sector's retained earnings, never
  // as a charge on households (the unfloored form billed households the AI
  // sector's pre-revenue operating losses). The RAW lagged series stays exposed
  // as aiProfitPayoutBase (the standing attribution assertion); only the
  // application floors.
  const payoutBase = Math.max(0, laggedAiProfits);
  // The creation-year gate: the fund cannot hold equity stakes before it exists
  // (absent startYear ⇒ simulation start ⇒ the gate is always open, prior behavior).
  if (swf.enabled && year >= (swf.startYear ?? DEFAULT_SWF_START_YEAR)
    && interpolatePolicy(swf.ownershipFraction, year) > 0) {
    const ownershipFrac = interpolatePolicy(swf.ownershipFraction, year);
    const equityIncome = ownershipFrac * payoutBase;  // dollars — endogenous, t−1, floored
    assetAddition += equityIncome;
  }

  // Profit sharing mandates (POLICY_MODEL.md §3.3) — same endogenous t−1 base (A-6),
  // same non-negative floor (arithmetically the same instrument as the equity stake).
  if (config.profitSharing.enabled) {
    const ps = config.profitSharing;
    const sharePct = interpolatePolicy(ps.mandatorySharePercentage, year);
    const sharedProfits = sharePct * payoutBase;  // dollars — endogenous, t−1, floored
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
    const baseAmount = config.indexedBaseAmount ?? DEFAULT_INDEXED_UBI_BASE_MONTHLY;
    const startYear = config.indexedStartYear ?? DEFAULT_INDEXED_UBI_START_YEAR;
    const indexRate = config.productivityIndexRate ?? DEFAULT_UBI_PRODUCTIVITY_INDEX_RATE;

    if (year < startYear) return 0;

    const baseAiGDP = Math.max(INDEXED_UBI_AI_GDP_FLOOR, startYearAiGDP);
    const currentAiGDP = Math.max(INDEXED_UBI_AI_GDP_FLOOR, aiGDPContribution);
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
 * @param averageWage - Current average wage (remaining-workers average; wage subsidies etc.)
 * @param priceLevel - Current price level (for indexing)
 * @param displacedWorkers - Number of displaced workers eligible for retraining
 * @param displacedPoolCount - Size of the AI-displaced pool (direct + second-order; the
 *   incidence object's count). 0 when no displacement exists.
 * @param displacedPoolWage - The displaced pool's employment-weighted PRIOR wage (year-0
 *   vintage, from computeDisplacedPool). 0 when the pool is empty.
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
  displacedPoolCount: number,
  displacedPoolWage: number,
  aiGDPContribution?: number,     // Phase 5g: for UBI productivity indexing
  startYearAiGDP?: number,        // Phase 5g: AI GDP at index start year
  /** Mini-stage 3: the searching pool's duration shares (index = years jobless) — the
   *  entitlement-weeks pricing input. Absent (unit fixtures) = all cohort-0. */
  poolDurationSharesInput?: number[],
  /** THE COLA INDEXATION FACTOR (the policy-wiring review's fix): the fiscal
   *  autopilot's DAMPENED cost-of-living factor, lagged one year — the same index
   *  the budget applies to its own obligations. UBI's inflation indexation consumes
   *  THIS, not the raw price level, so indexed transfers ride the economy's actual
   *  cost-of-living machinery (including any profile-declared dampening) instead of
   *  re-amplifying their own monetization inflation. Absent ⇒ the retired raw
   *  price-level basis (unit-fixture compatibility; the simulation loop always
   *  passes the factor). */
  colaIndexationFactor?: number,
): { transferAddition: number; enhancedUIAddition: number; displacedFlatAddition: number; uiPricingWage: number } {
  // FS-6b: the transfer total now returns DECOMPOSED so the quintile measurement layer can
  // route each component by its honest incidence (UBI flat per-capita; the wage-proportional
  // UI increment by displaced wage mass; flat per-head support by displaced headcount). The
  // total is arithmetically unchanged — the decomposition is measurement-layer surface only.
  let transferAddition = 0;
  let enhancedUIAddition = 0;      // wage-proportional (benefit ∝ prior wage)
  let displacedFlatAddition = 0;   // flat per displaced/unemployed head

  // UBI (POLICY_MODEL.md §4.1)
  const ubiAmount = getEffectiveUBI(
    config.ubi, year,
    aiGDPContribution ?? 0,
    startYearAiGDP ?? 0,
  );
  if (config.ubi.enabled && ubiAmount > 0) {
    let monthlyAmount = ubiAmount;

    // Inflation indexing — through the dampened COLA factor (F2), falling back to
    // the raw price level only when no factor is supplied (unit fixtures).
    if (config.ubi.indexedToInflation) {
      monthlyAmount *= colaIndexationFactor ?? priceLevel;
    }

    const annualUBI = monthlyAmount * MONTHS_PER_YEAR;

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
  // FIX: current-law UI is already in the model twice over — as statutory generosity (this lever's
  // default 45%/26wk settings) and as realized stock-average cost (the Stage 5 cash support
  // constant). The lever must therefore charge only generosity ABOVE the current-law statutory
  // benefit, computed with the SAME formula at CURRENT_LAW_UI_REPLACEMENT_RATE × DURATION — exactly
  // $0 at default settings. Stage 5: do NOT net against the $8,000 stock-average (that is a
  // realized-cost figure at ~28% recipiency — a different take-up basis; netting against it would
  // charge the recipiency gap as if it were new policy). Baseline IN-KIND (Medicaid) continues
  // alongside policy UI — benefit-cliff interactions are not modeled.
  // THE UI PRICING WAGE (the close-out §9 item-3 ruled fix): UI benefits replace the
  // unemployed pool's PRIOR wages. The pool is priced by composition — the AI-displaced at
  // their own pool average (year-0 vintage; they carry ~1.2× the remaining-workers average
  // in deep scenarios because displacement skews up the wage distribution), the frictional
  // remainder at the economy average. Zero displacement → the blend IS averageWage exactly
  // (the Gate-A bit-identity leg). Exposed on PolicyEffects for the attribution assertion.
  const displacedInPool = Math.min(displacedPoolCount, totalUnemployment);
  const frictionalInPool = Math.max(0, totalUnemployment - displacedInPool);
  const uiPricingWage = totalUnemployment > 0 && displacedPoolWage > 0
    ? (displacedInPool * displacedPoolWage + frictionalInPool * averageWage) / totalUnemployment
    : averageWage;

  if (config.enhancedUI.enabled) {
    const ui = config.enhancedUI;
    const replRate = interpolatePolicy(ui.replacementRate, year);
    // Mini-stage 3 (the duration pool): ENTITLEMENT-WEEKS replace the Stage-H structural
    // annualization clamp where the pool exists. A cohort d years into joblessness has
    // consumed 52·d weeks of its entitlement: payable(dur, d) = min(52, max(0, dur − 52·d)).
    // Multi-year entitlements now pay honestly across years (nordic's 78 weeks: 52 then 26
    // then 0); the retired stock-average form paid EVERY jobless person the full annual
    // amount EVERY year — the over-payment this stage retires (the pre-registered D mover).
    // The frictional (non-pool) unemployed are short-spell: cohort-0 payables.
    const payable = (durWeeks: number, d: number) => Math.min(52, Math.max(0, durWeeks - 52 * d));
    const shares = poolDurationSharesInput;
    const poolFactorE = shares
      ? shares.reduce((a, sh, d) => a + sh * payable(ui.durationWeeks, d), 0)
      : payable(ui.durationWeeks, 0);
    const poolFactorCL = shares
      ? shares.reduce((a, sh, d) => a + sh * payable(CURRENT_LAW_UI_DURATION_WEEKS, d), 0)
      : payable(CURRENT_LAW_UI_DURATION_WEEKS, 0);
    // Per-person increment over current law (the netting discipline unchanged; $0 at
    // current-law settings for fresh cohorts, monotone in added generosity).
    const perPerson = (wage: number, fE: number, fCL: number) => Math.max(
      0,
      (wage / WEEKS_PER_YEAR) * replRate * fE - (wage / WEEKS_PER_YEAR) * CURRENT_LAW_UI_REPLACEMENT_RATE * fCL,
    );
    const poolWage = displacedPoolWage > 0 ? displacedPoolWage : averageWage;
    enhancedUIAddition =
        perPerson(poolWage, poolFactorE, poolFactorCL) * displacedInPool
      + perPerson(averageWage, payable(ui.durationWeeks, 0), payable(CURRENT_LAW_UI_DURATION_WEEKS, 0)) * frictionalInPool;
    transferAddition += enhancedUIAddition;

    // Retraining bonus (always incremental — not part of baseline)
    if (ui.retrainingBonus > 0) {
      const bonus = ui.retrainingBonus * totalUnemployment;
      displacedFlatAddition += bonus;
      transferAddition += bonus;
    }
  }

  // Retraining programs (POLICY_MODEL.md §4.3)
  if (config.retraining.enabled) {
    const rt = config.retraining;
    const stipend = interpolatePolicy(rt.stipendMonthly, year);
    // Stage H cap ruling: min(12, ·) is the same structural annualization bound as the
    // enhanced-UI 52-week cap (a year holds 12 stipend-months). See the note there.
    const annualStipend = stipend * Math.min(12, rt.durationMonths);
    // Only a fraction of displaced workers are in retraining at any given time
    const inRetraining = displacedWorkers * config.retraining.participationRate;
    const stipendTotal = annualStipend * inRetraining;
    displacedFlatAddition += stipendTotal;
    transferAddition += stipendTotal;
  }

  return { transferAddition, enhancedUIAddition, displacedFlatAddition, uiPricingWage };
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
 * @param displacedPoolCount - Size of the AI-displaced pool (see computeTransferPolicyEffect)
 * @param displacedPoolWage - The displaced pool's prior wage (see computeTransferPolicyEffect)
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
  displacedPoolCount: number,
  displacedPoolWage: number,
  aiGDPContribution?: number,     // Phase 5g: for UBI productivity indexing
  startYearAiGDP?: number,        // Phase 5g: AI GDP at index start year
  /** Stage H addendum (A-6): prior-year realized endogenous AI corporate profits (dollars);
   *  the equity/profit-sharing payout base, exposed as aiProfitPayoutBase for the attribution
   *  assertion (the uiPricingWage pattern). */
  laggedAiProfits: number = 0,
  /** Mini-stage 3: the searching pool's duration shares (index = years jobless) — the
   *  entitlement-weeks pricing input. Absent (unit fixtures) = all cohort-0. */
  poolDurationSharesInput?: number[],
  /** The indexation factor (see computeTransferPolicyEffect): the t−1 dampened COLA factor for
   *  transfer indexation. Absent ⇒ the raw price level (unit fixtures). */
  colaIndexationFactor?: number,
): PolicyEffects {
  // Wage channel
  const wageChannelAddition = computeWagePolicyEffect(
    config, year, averageWage, totalEmployment, priceLevel,
  );

  // Asset channel
  const { assetAddition: assetChannelAddition, updatedFundSize, swfAnnualContribution } = computeAssetPolicyEffect(
    config, year, previousFundSize, population, laggedAiProfits,
  );

  // Transfer channel
  const {
    transferAddition: transferChannelAddition,
    enhancedUIAddition,
    displacedFlatAddition,
    uiPricingWage,
  } = computeTransferPolicyEffect(
    config, year, population, totalUnemployment, averageWage, priceLevel, displacedWorkers,
    displacedPoolCount, displacedPoolWage,
    aiGDPContribution, startYearAiGDP,
    poolDurationSharesInput,
    colaIndexationFactor,
  );

  const totalPolicyIncome = wageChannelAddition + assetChannelAddition + transferChannelAddition;

  // Fiscal cost = wage subsidies + transfers + SWF government contribution
  // Phase 5h (Fix 5): SWF annual contribution is a government outlay — include in fiscal cost.
  // swfAnnualContribution is in billions, wage/transfer channels are in dollars → ×1e9 conversion.
  const fiscalCost = wageChannelAddition + transferChannelAddition + (swfAnnualContribution * DOLLARS_PER_BILLION);
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
    enhancedUIAddition,
    displacedFlatAddition,
    uiPricingWage,
    totalPolicyIncome,
    fiscalCost,
    fiscalCostAsPercentGDP,
    sovereignFundSize: updatedFundSize,
    swfAnnualContribution, // billions — for downstream display/CSV
    requiredAssetOwnership,
    requiredTransferLevel,
    aiProfitPayoutBase: laggedAiProfits, // A-6: the consumed payout base, exposed for the attribution assertion
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
