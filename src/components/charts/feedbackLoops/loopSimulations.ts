/**
 * @file loopSimulations.ts
 * @description Pedagogical mini-simulations for the ATLAS Methodology screen.
 *
 * These functions approximate the ATLAS production model for interactive teaching.
 * They use real 2025 baseline constants and the same core equation functions as
 * production (computeWagePressure, computeRevenuePressure, applyRevenuePressure,
 * computeSimplifiedDisplacement are imported directly).
 *
 * INTENTIONAL SIMPLIFICATIONS (documented, not bugs):
 *
 * 1. Aggregate employment — Production uses 51 occupation clusters. Mini-sim uses
 *    total displacement ratio. Direction is correct; magnitude is approximate.
 *
 * 2. Inflation model — Production uses a 6-component Composite Inflation Formula
 *    (base + cost-push + demand-pull + monetary excess + import price + excess demand).
 *    Loop 2 uses (wagePressure - 1) × 0.3 as a simplified cost-push proxy.
 *    Direction is correct for the wage-pressure teaching purpose of Loop 2.
 *
 * 3. Mortgage stress — Uses a quintile-skewed approximation with 2 burden weights
 *    (0.38 early-phase, 0.15 late-phase) derived from production's Q1–Q5 burden table.
 *    Full production uses per-quintile foreclosure rates with multi-year lag.
 *
 * 4. Home price model — Production uses 5 channels (mortgage rates, income growth,
 *    foreclosure supply, demographics, affordability reversion). Mini-sim uses a
 *    2-factor approximation (foreclosure pressure + wage growth). No mortgage rate
 *    channel. Ad-hoc coefficients calibrated to produce correct directional magnitude.
 *
 * 5. Monetization — Production has 5 cases (QE at ELB, financial repression, fiscal
 *    dominance, yield response, LOLR). Mini-sim implements Cases 1 and 2 only.
 *    Cases 3, 5, 6 activate at extreme fiscal conditions (fiscal dominance threshold,
 *    10yr yield spike, structural backstop) not modeled at this level of abstraction.
 *
 * 6. Consumer credit — Production has 3 channels (income adequacy, collateral, systemic
 *    risk). Mini-sim implements income adequacy + simplified collateral channel.
 *    Systemic risk channel (CWI trajectory over multiple years) requires multi-year
 *    state not tracked in the mini-sim.
 *
 * 7. Single-year horizon — Mini-sim shows steady-state effects, not multi-year
 *    accumulation. Production tracks cumulative inflation, homeownership decay,
 *    debt compounding, etc. across the full simulation period.
 *
 * DO NOT use these functions in production simulation runs.
 * DO NOT remove these simplifications without also adding the required state tracking.
 */

import { computeRevenuePressure, computeWagePressure } from '@/models/macro';
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
  BASELINE_HOMEOWNERSHIP,
  PHILLIPS_CURVE_SENSITIVITY,
  NATURAL_UNEMPLOYMENT_RATE,
  AI_WAGE_PRODUCTIVITY_MULTIPLIER,
  DEFAULT_COLLATERAL_SENSITIVITY,
} from '@/models/constants';

// Effective individual tax burden: income tax + employee payroll tax
// Production: macro.ts lines 1763-1772
const INDIVIDUAL_TAX_RATE = BASELINE_INCOME_TAX_RATE + BASELINE_PAYROLL_RATE * EMPLOYER_EMPLOYEE_SPLIT;

// Max financial repression rate: production default = 1.0 (monetization.ts:91 parameter default)
// Not exported as a named constant from constants.ts; profile-dependent in production.
const MAX_FINANCIAL_REPRESSION_RATE = 1.0;

// Baseline net exports (used in GDP identity across multiple loops)
const BASELINE_NET_EXPORTS = BASELINE_GDP_NOMINAL_2025 * NET_EXPORTS_GDP_FRACTION;

// ---------------------------------------------------------------------------
// Shared helper: 3-channel consumption (Fix 9)
// Production: macro.ts income decomposition → post-tax × MPC per channel
// Takes pre-tax asset and transfer income, applies appropriate tax rates,
// then multiplies by respective MPCs. Wage income is passed already post-tax.
// ---------------------------------------------------------------------------

function computeThreeChannelConsumption(
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
// Loop 1: Displacement-Demand Feedback Simulation
// Source: macro.ts:480 (computeRevenuePressure), adoption.ts:112 (applyRevenuePressure),
//         displacement.ts:53 (computeSimplifiedDisplacement)
// ---------------------------------------------------------------------------

export interface DisplacementDemandParams {
  gdpGrowthRate: number;
  sensitivity: number;
  cap: number;
  decay: number;
}

export function simulateDisplacementDemand(params: DisplacementDemandParams): Record<string, number> {
  // Step 1: Revenue pressure — exact production function (macro.ts:480-495)
  const { revenuePressure, automationAcceleration } = computeRevenuePressure(
    params.gdpGrowthRate,
    0, // previousAcceleration starts at 0 for single-step demo
    params.sensitivity,
    params.cap,
    params.decay,
  );

  // Step 2: Adoption acceleration → displacement
  // Production: adoption.ts:112-118 (applyRevenuePressure) + displacement.ts:53-59
  const baseAdoptionRate = 0.25; // Moderate baseline adoption for demo
  const weightedCapability = 0.60; // Moderate AI capability
  const acceleratedAdoption = applyRevenuePressure(baseAdoptionRate, automationAcceleration);
  const displacementPct = computeSimplifiedDisplacement(acceleratedAdoption, weightedCapability);

  // Step 3: Employment → wage → consumption chain
  // Production: macro.ts computeMacro() income composition + GDP synthesis
  const displacedWorkers = BASELINE_TOTAL_EMPLOYMENT * displacementPct;
  const unemploymentRate = Math.min(0.50, displacedWorkers / US_LABOR_FORCE_2025);
  const remainingEmployment = BASELINE_TOTAL_EMPLOYMENT - displacedWorkers;

  // Phase 10.A: computeWagePressure signature changed (classic Phillips × (1 - aiShare) + scarcity premium).
  // This demo sim doesn't have aiDisplacementUnemployment or the aggregate difficulty metric handy,
  // so we pass 0 for those — result reduces to the classic Phillips exponential decay (aiShare = 0).
  // Full Phase 10.A semantics are exercised by the production simulation.ts pipeline, not this demo.
  const wagePressure = computeWagePressure(
    unemploymentRate,
    0, // aiDisplacementUnemployment — not modeled in this demo loop
    0, // aggregateReplacementDifficultyWagePremium — not modeled
    0, // scarcityIntensity — not modeled
    1, // laborForceBaseline — value moot when aiDispUE = 0
    0, // policy wage floor
    PHILLIPS_CURVE_SENSITIVITY,
    NATURAL_UNEMPLOYMENT_RATE,
  );
  const wageIncome = remainingEmployment * BASELINE_AVERAGE_ANNUAL_WAGE * wagePressure;

  // Production: macro.ts lines 1763-1772 — subtract income tax + payroll before MPC
  const afterTaxWageIncome = wageIncome * (1 - INDIVIDUAL_TAX_RATE);

  // Fix 9: 3-channel consumption (wage + asset + transfer with taxes)
  const assetIncome = BASELINE_GDP_NOMINAL_2025 * BASELINE_ASSET_SHARE;
  const transferIncome = BASELINE_GDP_NOMINAL_2025 * BASELINE_TRANSFER_SHARE * (1 + displacementPct * 0.5);
  const consumption = computeThreeChannelConsumption(
    afterTaxWageIncome, assetIncome, transferIncome,
    DEFAULT_POST_TAX_MPC_WAGE, DEFAULT_POST_TAX_MPC_ASSET, DEFAULT_POST_TAX_MPC_TRANSFER,
  );

  const gdpImpact = params.gdpGrowthRate; // The input shock itself

  return {
    dl_gdp_growth: gdpImpact,
    dl_revenue_pressure: revenuePressure,
    dl_auto_accel: automationAcceleration,
    dl_displacement: displacementPct,
    dl_unemployment: unemploymentRate,
    dl_wage_income: wageIncome,
    dl_consumption: consumption,
  };
}

// ---------------------------------------------------------------------------
// Loop 2: Phillips Curve Simulation
// Source: macro.ts:298-316 (computeWagePressure)
// ---------------------------------------------------------------------------

export interface PhillipsCurveParams {
  unemploymentRate: number;
  phillipsSensitivity: number;
  naturalRate: number;
  automationCoverage: number;
  aiWageMultiplier: number;
}

export function simulatePhillipsCurve(params: PhillipsCurveParams): Record<string, number> {
  // Step 1: Excess unemployment — macro.ts:306
  const excessUE = Math.max(0, params.unemploymentRate - params.naturalRate);

  // Step 2: Phillips pressure — macro.ts:307 (exponential decay form)
  const phillipsPressure = Math.exp(-params.phillipsSensitivity * excessUE);

  // Step 3: AI productivity premium — macro.ts:313 (hump-shaped)
  const aiPremium = params.automationCoverage * params.aiWageMultiplier * (1 - params.automationCoverage);

  // Phase 10.A: demo wagePressure — old positional args were
  // (ue, automationCoverage, aiWageMultiplier, floor, phillipsSensitivity, naturalRate).
  // New semantics: scarcity-premium Phillips. This demo keeps hump-shaped AI premium as
  // display-only via `aiPremium` above; the actual `wagePressure` here reduces to classic Phillips
  // (aiShare=0) so the demo graph still reflects the user-controlled unemployment/sensitivity sliders.
  const wagePressure = computeWagePressure(
    params.unemploymentRate,
    0, // aiDisplacementUnemployment — not tracked in this demo
    0, // aggregateReplacementDifficultyWagePremium — not modeled
    0, // scarcityIntensity
    1, // laborForceBaseline — moot when aiDispUE = 0
    0, // no policy wage floor
    params.phillipsSensitivity,
    params.naturalRate,
  );

  // Step 5: Derived effects
  // Total wage income depends on BOTH per-worker wage pressure AND employment ratio.
  // At 30% unemployment, only ~70% of workers earn wages — this is the primary
  // income channel, not the per-worker wage cut.
  // Production model: macro.ts computeMacro() → wageBase × employmentRatio × wagePressure
  const baselineWageIncome = BASELINE_GDP_NOMINAL_2025 * BASELINE_WAGE_SHARE;
  const employmentRatio = 1 - params.unemploymentRate;
  const nominalWages = baselineWageIncome * wagePressure * employmentRatio;
  const costPushInflation = Math.max(0, (wagePressure - 1) * 0.3); // ~30% pass-through
  const realWages = nominalWages / (1 + costPushInflation);
  // Production: macro.ts lines 1763-1772 — subtract income tax + payroll before MPC
  const afterTaxRealWages = realWages * (1 - INDIVIDUAL_TAX_RATE);

  // Fix 9: 3-channel consumption (wage + asset + transfer with taxes)
  const assetIncome = BASELINE_GDP_NOMINAL_2025 * BASELINE_ASSET_SHARE;
  const transferIncome = BASELINE_GDP_NOMINAL_2025 * BASELINE_TRANSFER_SHARE * (1 + params.unemploymentRate * 0.5);
  const consumption = computeThreeChannelConsumption(
    afterTaxRealWages, assetIncome, transferIncome,
    DEFAULT_POST_TAX_MPC_WAGE, DEFAULT_POST_TAX_MPC_ASSET, DEFAULT_POST_TAX_MPC_TRANSFER,
  );

  return {
    pc_unemployment: params.unemploymentRate,
    pc_excess_ue: excessUE,
    pc_phillips: phillipsPressure,
    pc_ai_premium: aiPremium,
    pc_wage_pressure: wagePressure,
    pc_nominal_wages: nominalWages,
    pc_consumption: consumption,
  };
}

// ---------------------------------------------------------------------------
// Loop 3: Demand Spillover Simulation
// Source: simulation.ts demand spillover (~line 840), macro.ts MPC differentiation
// ---------------------------------------------------------------------------

export interface DemandSpilloverParams {
  mpcWage: number;
  mpcAsset: number;
  mpcTransfer: number;
  displacementPct: number;
}

export function simulateDemandSpillover(params: DemandSpilloverParams): Record<string, number> {
  // Step 1: Income composition based on displacement
  // Production: macro.ts endogenous income computation
  const employmentRatio = 1 - params.displacementPct;
  const wageIncome = BASELINE_GDP_NOMINAL_2025 * BASELINE_WAGE_SHARE * employmentRatio;
  const assetIncome = BASELINE_GDP_NOMINAL_2025 * BASELINE_ASSET_SHARE; // asset income less affected by displacement
  const transferIncome = BASELINE_GDP_NOMINAL_2025 * BASELINE_TRANSFER_SHARE * (1 + params.displacementPct * 0.5); // auto-stabilizers
  const totalIncome = wageIncome + assetIncome + transferIncome;

  // Step 2: Consumption via differentiated MPCs — macro.ts demand-constrained model
  // Production: macro.ts lines 1763-1772 — subtract tax before MPC (post-tax MPCs)
  const afterTaxWage = wageIncome * (1 - INDIVIDUAL_TAX_RATE);
  // Fix 8: Tax all income channels before MPC application
  const consumption = computeThreeChannelConsumption(
    afterTaxWage, assetIncome, transferIncome,
    params.mpcWage, params.mpcAsset, params.mpcTransfer,
  );

  // Step 3: Year-1 investment (direct displacement effect)
  // Fix 1: Use production constant for investment displacement sensitivity
  const year1Investment = BASELINE_INVESTMENT_2025 * Math.max(0.5, 1 - params.displacementPct * DEFAULT_BUSINESS_INVESTMENT_IMPACT);
  const govSpending = BASELINE_GOVT_SPENDING_2025 * (1 + params.displacementPct * 0.1); // auto-stabilizers

  // Step 4: Year-1 demand ratios
  const consumerRatio = consumption / BASELINE_CONSUMPTION_2025;
  const year1InvestmentRatio = year1Investment / BASELINE_INVESTMENT_2025;
  const govRatio = govSpending / BASELINE_GOVT_SPENDING_2025;
  const year1DemandRatio = 0.60 * consumerRatio + 0.20 * govRatio + 0.20 * year1InvestmentRatio;

  // Step 5 (t+1): Investment responds to year-1 demand conditions.
  // In the production model, businesses adjust investment based on revenue trajectory
  // (prevGDPGrowthRate feeds computeBusinessCreditConditions). When demand falls,
  // investment contracts the following year. We show this compound effect here.
  const demandFeedbackOnInvestment = Math.max(0.5, Math.min(1.2, year1DemandRatio));
  const investment = year1Investment * demandFeedbackOnInvestment;

  // Step 6: GDP uses t+1 investment
  const gdp = consumption + investment + govSpending + BASELINE_NET_EXPORTS;

  // Step 7: Demand ratios with t+1 investment
  const investmentRatio = investment / BASELINE_INVESTMENT_2025;
  const demandRatio = 0.60 * consumerRatio + 0.20 * govRatio + 0.20 * investmentRatio;

  // Step 8: Demand-constrained employment
  const demandTolerance = 0.03;
  const demandSurvival = Math.min(1.0, Math.max(demandTolerance, demandRatio));
  const clusterEmployment = BASELINE_TOTAL_EMPLOYMENT * employmentRatio * demandSurvival;

  return {
    ds_income: totalIncome,
    ds_consumption: consumption,
    ds_investment: investment,
    ds_gov_spending: govSpending,
    ds_gdp: gdp,
    ds_demand_ratios: demandRatio,
    ds_employment: clusterEmployment,
  };
}

// ---------------------------------------------------------------------------
// Loop 4: Credit Crunch Simulation
// Source: macro.ts:735 (computeConsumerCreditConditions),
//         macro.ts:841 (computeBusinessCreditConditions)
// ---------------------------------------------------------------------------

export interface CreditCrunchParams {
  unemploymentRate: number;
  incomeAdequacySensitivity: number;
  maxCreditTightening: number;
  businessCreditGDPSensitivity: number;
}

export function simulateCreditCrunch(params: CreditCrunchParams): Record<string, number> {
  // ═══ YEAR 1 (immediate effects): consumer credit chain ═══

  // Step 1: Income adequacy channel — macro.ts:762-784
  // Consumer credit tightening based on how much income falls below baseline
  const employmentRatio = 1 - (params.unemploymentRate - 0.044) / (1 - 0.044); // excess UE effect
  const underwritableIncome = Math.max(0.1, Math.min(1.0, employmentRatio));
  const incomeDeficiency = Math.max(0, 1.0 - underwritableIncome);
  const incomeAdequacyTightening = params.incomeAdequacySensitivity * incomeDeficiency;

  // Fix 11: Collateral channel — home price decline tightens lending standards
  // Use excess unemployment as displacement proxy → foreclosure → price decline
  const excessUE = Math.max(0, params.unemploymentRate - 0.044);
  const homePriceDecline = excessUE * 0.12; // ~12% price drop per 100% excess unemployment
  const collateralTightening = DEFAULT_COLLATERAL_SENSITIVITY * homePriceDecline;

  // Step 2: Total consumer tightening — income adequacy + collateral channels
  const consumerTightening = Math.min(
    params.maxCreditTightening,
    Math.max(0, incomeAdequacyTightening + collateralTightening),
  );

  // Step 3: Consumer credit multiplier — macro.ts:816-819
  const creditRatio = params.maxCreditTightening > 0
    ? consumerTightening / params.maxCreditTightening : 0;
  const consumerMultiplier = Math.max(0.01,
    1.0 - CREDIT_CONSUMPTION_SENSITIVITY * creditRatio);

  // Step 4: Consumption impact
  const baseConsumption = BASELINE_CONSUMPTION_2025;
  // Only deferrable portion affected by credit: macro.ts consumption credit adjustment
  const consumption = baseConsumption * (1 - DEFERRABLE_CONSUMPTION_SHARE * (1 - consumerMultiplier));

  // Step 5: Year-1 GDP from reduced consumption
  const consumptionGDPGap = (consumption - baseConsumption) / BASELINE_GDP_NOMINAL_2025;

  // ═══ YEAR 2 (t+1 compound effects): business credit responds to accumulated GDP decline ═══
  // In the production model, computeBusinessCreditConditions uses prevGDPGrowthRate
  // and prevAfterTaxCorporateProfits — both lagged by one year. We run a second
  // iteration so users see how year-1 consumption decline compounds into business
  // credit tightening and investment contraction.

  // Fix 7: Compute GDP growth rate (not level gap) for growth signal
  // Year-1 GDP: consumption changed, other components at baseline
  const year1GDP = consumption + BASELINE_INVESTMENT_2025 + BASELINE_GOVT_SPENDING_2025 + BASELINE_NET_EXPORTS;
  const gdpGrowthRate = (year1GDP - BASELINE_GDP_NOMINAL_2025) / BASELINE_GDP_NOMINAL_2025;

  // Profitability channel: profits decline ~2x GDP sensitivity
  const profitDeclineRatio = Math.max(0.2, 1.0 + consumptionGDPGap * 2.0);
  const profitSignal = 1.0 - profitDeclineRatio;

  // Business credit combines profitability + GDP trajectory channels
  // Production: macro.ts:841-881 — profitability + growth trajectory
  // Fix 2: Use production constant for profitability sensitivity
  const profitTightening = DEFAULT_PROFITABILITY_SENSITIVITY * profitSignal;
  // Fix 7: Growth signal uses GDP growth rate (production: prevGDPGrowthRate)
  const growthSignal = -params.businessCreditGDPSensitivity * gdpGrowthRate;
  // Fix 6: Allow loosening — negative tightening = cheaper capital
  // Production: max(-maxLoosening, min(maxTightening, combined))
  const rawBizTightening = profitTightening + growthSignal;
  const bizTightening = Math.max(
    -DEFAULT_MAX_BUSINESS_CREDIT_LOOSENING,
    Math.min(DEFAULT_MAX_BUSINESS_TIGHTENING, rawBizTightening),
  );
  // Production: macro.ts:880-881 — floor 0.01, sensitivity = businessInvestmentImpact (0.15)
  const bizCreditRatio = DEFAULT_MAX_BUSINESS_TIGHTENING > 0
    ? bizTightening / DEFAULT_MAX_BUSINESS_TIGHTENING : 0;
  const businessMultiplier = Math.max(0.01, 1.0 - DEFAULT_BUSINESS_INVESTMENT_IMPACT * bizCreditRatio);

  // Year-2 investment
  const investment = BASELINE_INVESTMENT_2025 * businessMultiplier;

  // Compound GDP gap includes both consumption and investment shortfalls
  const investmentGDPGap = (investment - BASELINE_INVESTMENT_2025) / BASELINE_GDP_NOMINAL_2025;
  const compoundGDPGap = consumptionGDPGap + investmentGDPGap;

  return {
    cc_unemployment: params.unemploymentRate,
    cc_consumer_credit: consumerTightening,
    cc_consumption_mult: consumerMultiplier,
    cc_consumption: consumption,
    cc_gdp_gap: compoundGDPGap,
    cc_business_credit: bizTightening,
    cc_investment: investment,
  };
}

// ---------------------------------------------------------------------------
// Loop 5: Fiscal-Monetary Simulation
// Source: fiscal.ts:56 (computeEndogenousRevenue), fiscal.ts (debt),
//         monetization.ts:83 (computeMonetizationRate)
// ---------------------------------------------------------------------------

export interface FiscalMonetaryParams {
  taxRate: number;
  gdpGrowthRate: number;
  interestRate: number;
  qeMonetizationRate: number;
}

export function simulateFiscalMonetary(params: FiscalMonetaryParams): Record<string, number> {
  const nominalGDP = BASELINE_GDP_NOMINAL_2025 * (1 + params.gdpGrowthRate);

  // Step 1: Revenue — fiscal.ts:56-85 simplified to effective rate
  const revenue = params.taxRate * nominalGDP;

  // Step 2: Spending (obligations + interest on existing debt)
  // Government spending is ~22% of GDP baseline
  const baseSpending = GOVERNMENT_SPENDING_GDP_FRACTION * nominalGDP;
  const existingDebt = BASELINE_GDP_NOMINAL_2025 * 1.20; // ~120% debt/GDP baseline
  const interestExpense = existingDebt * params.interestRate;
  const totalSpending = baseSpending + interestExpense;

  // Step 3: Deficit — fiscal.ts spending - revenue
  const deficit = totalSpending - revenue;

  // Step 4: Debt/GDP — fiscal.ts:computeDebtAccumulation
  const newDebt = existingDebt + deficit;
  const debtGDP = newDebt / nominalGDP;

  // Step 5: Debt service ratio — monetization.ts:113 trigger
  const debtServiceRatio = revenue > 0 ? interestExpense / revenue : 0;

  // Step 6: Monetization — monetization.ts:83-96 logic
  // Case 2: Financial repression when DSR > 0.50
  let monetizationRate = 0;
  if (params.gdpGrowthRate < -0.005) {
    // At effective lower bound → QE (Case 1)
    monetizationRate = Math.max(monetizationRate, params.qeMonetizationRate);
  }
  if (debtServiceRatio > 0.50) {
    // Fix 3: Financial repression ramps to MAX_FINANCIAL_REPRESSION_RATE (production default 1.0)
    const repressionStress = Math.min(1.0, (debtServiceRatio - 0.50) / 0.50);
    const repressionRate = params.qeMonetizationRate + repressionStress * (MAX_FINANCIAL_REPRESSION_RATE - params.qeMonetizationRate);
    monetizationRate = Math.max(monetizationRate, repressionRate);
  }

  // Step 7: Money creation → inflation
  const moneyCreation = deficit > 0 ? deficit * monetizationRate : 0;
  // Fisher-equation-based inflation contribution
  const inflationFromMonetization = moneyCreation / nominalGDP * 0.5; // dampened pass-through

  return {
    fm_revenue: revenue,
    fm_deficit: deficit,
    fm_debt_gdp: debtGDP,
    fm_interest: interestExpense,
    fm_debt_service: debtServiceRatio,
    fm_monetization: monetizationRate,
    fm_inflation: inflationFromMonetization,
    fm_nominal_gdp: nominalGDP,
  };
}

// ---------------------------------------------------------------------------
// Loop 6: Housing Wealth Simulation
// Source: macro.ts:1064 (computeMortgageStressIndex), macro.ts housing wealth MPC
// ---------------------------------------------------------------------------

export interface HousingWealthParams {
  wageGrowthRate: number;
  mortgageStressAmplifier: number;
  housingWealthMPC: number;
  displacementPct: number;
}

// Fix 10: Quintile-skewed mortgage burden weights
// Q1-Q3 workers (routine/service) displace first → high mortgage burden
// Derived from production's quintile burden table: Q1=0.45, Q2=0.38, Q3=0.32, Q4=0.22, Q5=0.12
const QUINTILE_BURDEN_HIGH = 0.38; // avg burden for early-displacement workers (Q1-Q3 weighted)
const QUINTILE_BURDEN_LOW = 0.15;  // avg burden for later-displacement workers (Q4-Q5 weighted)

export function simulateHousingWealth(params: HousingWealthParams): Record<string, number> {
  // Step 1: Affordability — wage growth vs housing cost growth
  // Production: macro.ts affordability deviation
  const housingCostGrowth = 0.03; // baseline shelter inflation ~3%
  const affordability = 1.0 + (params.wageGrowthRate - housingCostGrowth);

  // Step 2: Mortgage stress — macro.ts:1064 computeMortgageStressIndex
  // Fix 10: Quintile-skewed approximation — low-income workers displace first
  // with higher mortgage burden, transitioning to lower burden as displacement broadens
  const displacementPhase = Math.min(1, params.displacementPct / 0.5); // 0→1 as displacement 0→50%
  const weightedBurden = QUINTILE_BURDEN_HIGH
    - (QUINTILE_BURDEN_HIGH - QUINTILE_BURDEN_LOW) * displacementPhase;
  const mortgageStress = 1.0 + params.mortgageStressAmplifier * params.displacementPct * weightedBurden;

  // Step 3: Foreclosure rate — macro.ts updateHomeownership
  // Foreclosures increase when stress is high and wages are declining
  const foreclosureRate = Math.max(0, (mortgageStress - 1.0) * 0.15); // ~15% of stressed become foreclosures

  // Step 4: Housing wealth — home price index change
  // Production: simulation.ts homePriceIndex tracking
  const homePriceChange = -foreclosureRate * 2.0 + Math.max(0, params.wageGrowthRate) * 0.5;
  const housingWealth = BASELINE_HOUSING_WEALTH * (1 + homePriceChange);

  // Step 5: Wealth-effect consumption — macro.ts:928 housing wealth MPC
  // Production: wealthChange * housingWealthMPC * avgHomeownership
  const wealthChange = housingWealth - BASELINE_HOUSING_WEALTH;
  const wealthConsumptionEffect = wealthChange * params.housingWealthMPC * BASELINE_HOMEOWNERSHIP;
  const consumption = BASELINE_CONSUMPTION_2025 + wealthConsumptionEffect;

  // Fix 4: GDP = C + I + G + NX (proper identity, not GDP = consumption)
  // Investment and gov spending unaffected in this loop's scope
  const gdp = consumption + BASELINE_INVESTMENT_2025 + BASELINE_GOVT_SPENDING_2025 + BASELINE_NET_EXPORTS;

  return {
    hw_wage_growth: params.wageGrowthRate,
    hw_affordability: affordability,
    hw_mortgage_stress: mortgageStress,
    hw_foreclosures: foreclosureRate,
    hw_housing_wealth: housingWealth,
    hw_consumption: consumption,
    hw_gdp: gdp,
  };
}

// ---------------------------------------------------------------------------
// Master dispatch: run any loop's simulation by loop ID
// ---------------------------------------------------------------------------

export function simulateLoop(
  loopId: string,
  params: Record<string, number>,
): Record<string, number> {
  switch (loopId) {
    case 'displacement_demand':
      return simulateDisplacementDemand(params as unknown as DisplacementDemandParams);
    case 'phillips_curve':
      return simulatePhillipsCurve(params as unknown as PhillipsCurveParams);
    case 'demand_spillover':
      return simulateDemandSpillover(params as unknown as DemandSpilloverParams);
    case 'credit_crunch':
      return simulateCreditCrunch(params as unknown as CreditCrunchParams);
    case 'fiscal_monetary':
      return simulateFiscalMonetary(params as unknown as FiscalMonetaryParams);
    case 'housing_wealth':
      return simulateHousingWealth(params as unknown as HousingWealthParams);
    default:
      return {};
  }
}
