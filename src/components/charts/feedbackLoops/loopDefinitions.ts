/**
 * Feedback Loop Definitions
 *
 * Declarative configuration for all 6 feedback loops in the ATLAS model.
 * Each definition specifies nodes (variables), edges (causal relationships),
 * and adjustable parameters for the interactive mini-simulation.
 *
 * These definitions are consumed by FeedbackLoopDiagram (circular SVG renderer)
 * and SystemInterconnectionDiagram (master view).
 */

import type { FeedbackLoopDefinition, SharedNode } from './types';

// ---------------------------------------------------------------------------
// Loop 1: Revenue Pressure (Displacement-Demand Feedback)
// ---------------------------------------------------------------------------

export const DISPLACEMENT_DEMAND: FeedbackLoopDefinition = {
  id: 'displacement_demand',
  name: 'Revenue Pressure',
  shortName: 'Revenue Pressure',
  color: '#EF4444',
  description:
    'GDP growth rates influence the pace of automation adoption. When firms face revenue ' +
    'pressure, they accelerate AI investment; when revenues are strong, adoption follows ' +
    'normal S-curves. Changes in automation affect employment, wages, and consumption, ' +
    'which feed back into GDP — a self-reinforcing loop in either direction.',
  nodes: [
    {
      id: 'dl_gdp_growth',
      label: 'GDP\nGrowth',
      shortLabel: 'GDP',
      equationRef: '5.6',
      codeRef: 'macro.ts:computeMacro()',
      format: 'percent',
      shared: true,
    },
    {
      id: 'dl_revenue_pressure',
      label: 'Revenue\nPressure',
      shortLabel: 'Rev Press.',
      equationRef: '1.5',
      codeRef: 'macro.ts:computeRevenuePressure()',
      format: 'percent',
    },
    {
      id: 'dl_auto_accel',
      label: 'Automation\nAccel.',
      shortLabel: 'Auto Accel',
      equationRef: '1.5',
      codeRef: 'adoption.ts:applyRevenuePressure()',
      format: 'multiplier',
    },
    {
      id: 'dl_displacement',
      label: 'Displacement\nRate',
      shortLabel: 'Displace',
      equationRef: '2.1',
      codeRef: 'displacement.ts:computeSimplifiedDisplacement()',
      format: 'percent',
    },
    {
      id: 'dl_unemployment',
      label: 'Unemp.\nRate',
      shortLabel: 'Unemp',
      equationRef: '2.2',
      codeRef: 'macro.ts:computeMacro()',
      format: 'percent',
      shared: true,
    },
    {
      id: 'dl_wage_income',
      label: 'Wage\nIncome',
      shortLabel: 'Wages',
      equationRef: '3.1',
      codeRef: 'macro.ts:computeMacro()',
      format: 'compact',
      shared: true,
    },
    {
      id: 'dl_consumption',
      label: 'Consumer\nSpending',
      shortLabel: 'Consump.',
      equationRef: '3.4',
      codeRef: 'macro.ts:computeMacro()',
      format: 'compact',
      shared: true,
    },
  ],
  edges: [
    { from: 'dl_gdp_growth', to: 'dl_revenue_pressure', label: 'GDP growth drives pressure', polarity: '-', equation: 'newPressure = min(cap, sensitivity × max(0, -gdpGrowthRate))' },
    { from: 'dl_revenue_pressure', to: 'dl_auto_accel', label: 'pressure accumulates', polarity: '+', equation: 'accel = min(cap, prev × decay + newPressure)' },
    { from: 'dl_auto_accel', to: 'dl_displacement', label: 'adoption rate shifts', polarity: '+', equation: 'adoption × (1 + acceleration) → displacement' },
    { from: 'dl_displacement', to: 'dl_unemployment', label: 'employment adjusts', polarity: '+', equation: 'displaced = baseEmployment × displacement%' },
    { from: 'dl_unemployment', to: 'dl_wage_income', label: 'wage income responds', polarity: '-', equation: 'wageIncome = GDP × wageShare × employmentRatio' },
    { from: 'dl_wage_income', to: 'dl_consumption', label: 'spending adjusts', polarity: '+', equation: 'C = postTaxWageIncome × MPC_wage (0.80)' },
    { from: 'dl_consumption', to: 'dl_gdp_growth', label: 'demand feeds back to GDP', polarity: '+', equation: 'GDP = C + I + G + NX' },
  ],
  params: [
    { id: 'gdpGrowthRate', label: 'GDP Growth Shock', min: -0.15, max: 0.05, step: 0.005, defaultValue: -0.02, unit: '%', sourceConstant: '(scenario input)' },
    { id: 'sensitivity', label: 'Revenue Pressure Sensitivity', min: 0.5, max: 3.0, step: 0.1, defaultValue: 1.5, unit: 'x', sourceConstant: 'REVENUE_PRESSURE_SENSITIVITY_DEFAULT' },
    { id: 'cap', label: 'Revenue Pressure Cap', min: 0.10, max: 0.50, step: 0.05, defaultValue: 0.30, unit: '%', sourceConstant: 'REVENUE_PRESSURE_CAP' },
    { id: 'decay', label: 'Revenue Pressure Decay', min: 0.30, max: 0.70, step: 0.05, defaultValue: 0.50, unit: 'x', sourceConstant: 'REVENUE_PRESSURE_DECAY' },
  ],
};

// ---------------------------------------------------------------------------
// Loop 2: Phillips Curve (Wage-Price)
// ---------------------------------------------------------------------------

export const PHILLIPS_CURVE: FeedbackLoopDefinition = {
  id: 'phillips_curve',
  name: 'Phillips Curve (Wage-Price)',
  shortName: 'Phillips',
  color: '#F59E0B',
  description:
    'The Phillips curve links unemployment to wage pressure — tight labor markets push ' +
    'wages up, while slack suppresses them. AI augmentation adds a hump-shaped wage premium ' +
    'that peaks at moderate automation coverage, where human-AI complementarity is highest. ' +
    'Both effects combine to determine real wage dynamics.',
  nodes: [
    {
      id: 'pc_unemployment',
      label: 'Unemp.\nRate',
      shortLabel: 'Unemp',
      equationRef: '2.2',
      codeRef: 'macro.ts:computeMacro()',
      format: 'percent',
      shared: true,
    },
    {
      id: 'pc_excess_ue',
      label: 'Excess\nUnemp.',
      shortLabel: 'Excess UE',
      equationRef: '2.3',
      codeRef: 'macro.ts:computeWagePressure()',
      format: 'percent',
    },
    {
      id: 'pc_phillips',
      label: 'Phillips\nPressure',
      shortLabel: 'Phillips',
      equationRef: '2.3',
      codeRef: 'macro.ts:computeWagePressure()',
      format: 'multiplier',
    },
    {
      id: 'pc_ai_premium',
      label: 'AI Wage\nPremium',
      shortLabel: 'AI Prem.',
      equationRef: '2.3',
      codeRef: 'macro.ts:computeWagePressure()',
      format: 'multiplier',
    },
    {
      id: 'pc_wage_pressure',
      label: 'Wage\nPressure',
      shortLabel: 'Wage P.',
      equationRef: '2.3',
      codeRef: 'macro.ts:computeWagePressure()',
      format: 'multiplier',
      shared: true,
    },
    {
      id: 'pc_nominal_wages',
      label: 'Nominal\nWages',
      shortLabel: 'Nom Wage',
      equationRef: '3.1',
      codeRef: 'macro.ts:computeMacro()',
      format: 'compact',
    },
    {
      id: 'pc_consumption',
      label: 'Consumer\nSpending',
      shortLabel: 'Consump.',
      equationRef: '3.4',
      codeRef: 'macro.ts:computeMacro()',
      format: 'compact',
      shared: true,
    },
  ],
  edges: [
    { from: 'pc_unemployment', to: 'pc_excess_ue', label: 'above natural rate', polarity: '+', equation: 'excessUE = max(0, UE - naturalRate)' },
    { from: 'pc_excess_ue', to: 'pc_phillips', label: 'exponential decay', polarity: '-', equation: 'phillips = exp(-sensitivity × excessUE)' },
    { from: 'pc_phillips', to: 'pc_wage_pressure', label: 'base wage pressure', polarity: '+', equation: 'wagePressure = max(floor, phillips + aiPremium)' },
    { from: 'pc_ai_premium', to: 'pc_wage_pressure', label: 'AI augmentation premium', polarity: '+', equation: 'premium = coverage × multiplier × (1 - coverage)' },
    { from: 'pc_wage_pressure', to: 'pc_nominal_wages', label: 'scales wages', polarity: '+', equation: 'wages = wageBase × wagePressure' },
    { from: 'pc_nominal_wages', to: 'pc_consumption', label: 'income drives spending', polarity: '+', equation: 'C = postTaxWages × MPC_wage' },
    { from: 'pc_consumption', to: 'pc_unemployment', label: 'via GDP & demand', polarity: '-', equation: 'C → GDP → employment → UE (inverse)' },
  ],
  params: [
    { id: 'unemploymentRate', label: 'Unemployment Rate', min: 0.03, max: 0.30, step: 0.005, defaultValue: 0.044, unit: '%', sourceConstant: '(scenario input)' },
    { id: 'phillipsSensitivity', label: 'Phillips Sensitivity', min: 0.05, max: 0.30, step: 0.01, defaultValue: 0.15, unit: 'x', sourceConstant: 'PHILLIPS_CURVE_SENSITIVITY' },
    { id: 'naturalRate', label: 'Natural UE Rate', min: 0.03, max: 0.06, step: 0.002, defaultValue: 0.044, unit: '%', sourceConstant: 'FRED_NAIRU_RATE' },
    { id: 'automationCoverage', label: 'Automation Coverage', min: 0.0, max: 1.0, step: 0.05, defaultValue: 0.10, unit: '%', sourceConstant: '(scenario input)' },
    { id: 'aiWageMultiplier', label: 'AI Wage Multiplier', min: 0.0, max: 1.5, step: 0.05, defaultValue: 0.50, unit: 'x', sourceConstant: 'AI_WAGE_PRODUCTIVITY_MULTIPLIER' },
  ],
};

// ---------------------------------------------------------------------------
// Loop 3: Demand Spillover
// ---------------------------------------------------------------------------

export const DEMAND_SPILLOVER: FeedbackLoopDefinition = {
  id: 'demand_spillover',
  name: 'Demand Spillover',
  shortName: 'Demand',
  color: '#6366F1',
  description:
    'Aggregate demand — consumption, investment, and government spending — determines a ' +
    'demand ratio relative to baseline. When demand exceeds baseline, employment expands; ' +
    'when it falls short, employment contracts beyond automation effects alone. Employment ' +
    'changes feed back into income and spending, reinforcing the direction of the shift.',
  nodes: [
    {
      id: 'ds_income',
      label: 'Total\nIncome',
      shortLabel: 'Income',
      equationRef: '3.1',
      codeRef: 'macro.ts:computeMacro()',
      format: 'compact',
      shared: true,
    },
    {
      id: 'ds_consumption',
      label: 'Consumer\nSpending',
      shortLabel: 'Consump.',
      equationRef: '3.4',
      codeRef: 'macro.ts:computeMacro()',
      format: 'compact',
      shared: true,
    },
    {
      id: 'ds_investment',
      label: 'Business\nInvestment',
      shortLabel: 'Invest.',
      equationRef: '5.3',
      codeRef: 'macro.ts:computeMacro()',
      format: 'compact',
      shared: true,
      lagged: true,
    },
    {
      id: 'ds_gov_spending',
      label: 'Gov\'t\nSpending',
      shortLabel: 'Gov',
      equationRef: '5.4',
      codeRef: 'fiscal.ts:computeGovernmentSpending()',
      format: 'compact',
    },
    {
      id: 'ds_gdp',
      label: 'Real\nGDP',
      shortLabel: 'GDP',
      equationRef: '5.6',
      codeRef: 'macro.ts:computeMacro()',
      format: 'compact',
      shared: true,
    },
    {
      id: 'ds_demand_ratios',
      label: 'Demand\nRatios',
      shortLabel: 'Ratios',
      equationRef: '5.7',
      codeRef: 'simulation.ts:demand spillover',
      format: 'multiplier',
    },
    {
      id: 'ds_employment',
      label: 'Cluster\nEmployment',
      shortLabel: 'Employ.',
      equationRef: '2.2',
      codeRef: 'simulation.ts:demand spillover',
      format: 'compact',
      shared: true,
    },
  ],
  edges: [
    { from: 'ds_income', to: 'ds_consumption', label: 'MPC-differentiated', polarity: '+', equation: 'C = wage×MPC_w + asset×MPC_a + transfer×MPC_t' },
    { from: 'ds_consumption', to: 'ds_gdp', label: 'largest GDP component', polarity: '+', equation: 'GDP = C + I + G + NX' },
    { from: 'ds_investment', to: 'ds_gdp', label: 'adds to GDP', polarity: '+', equation: 'I = trad_invest + AI_invest × demand_ratio' },
    { from: 'ds_gov_spending', to: 'ds_gdp', label: 'fiscal component', polarity: '+', equation: 'G = obligations + discretionary + interest' },
    { from: 'ds_gdp', to: 'ds_demand_ratios', label: 'actual vs baseline', polarity: '+', equation: 'ratio = C_share×(C/C₀) + G_share×(G/G₀) + B_share×(I/I₀)' },
    { from: 'ds_demand_ratios', to: 'ds_employment', label: 'scales employment', polarity: '+', equation: 'employment × min(1, max(tolerance, demand_ratio))' },
    { from: 'ds_employment', to: 'ds_income', label: 'employment drives income', polarity: '+', equation: 'wageIncome = employment × avgWage × wagePressure' },
  ],
  params: [
    { id: 'mpcWage', label: 'MPC (Wages)', min: 0.60, max: 1.00, step: 0.05, defaultValue: 0.95, unit: 'x', sourceConstant: 'DEFAULT_POST_TAX_MPC_WAGE' },
    { id: 'mpcAsset', label: 'MPC (Assets)', min: 0.15, max: 0.50, step: 0.05, defaultValue: 0.35, unit: 'x', sourceConstant: 'DEFAULT_POST_TAX_MPC_ASSET' },
    { id: 'mpcTransfer', label: 'MPC (Transfers)', min: 0.70, max: 1.00, step: 0.05, defaultValue: 0.90, unit: 'x', sourceConstant: 'DEFAULT_POST_TAX_MPC_TRANSFER' },
    { id: 'displacementPct', label: 'Displacement Level', min: 0.0, max: 0.50, step: 0.02, defaultValue: 0.10, unit: '%', sourceConstant: '(scenario input)' },
  ],
};

// ---------------------------------------------------------------------------
// Loop 4: Credit Crunch
// ---------------------------------------------------------------------------

export const CREDIT_CRUNCH: FeedbackLoopDefinition = {
  id: 'credit_crunch',
  name: 'Credit Crunch',
  shortName: 'Credit',
  color: '#D97706',
  description:
    'Unemployment levels affect bank lending standards through income adequacy and collateral ' +
    'channels. When credit conditions tighten, consumption and investment contract; when they ' +
    'loosen, both expand. Changes in spending and investment feed back through GDP to ' +
    'employment, completing the loop.',
  nodes: [
    {
      id: 'cc_unemployment',
      label: 'Unemp.\nRate',
      shortLabel: 'Unemp',
      equationRef: '2.2',
      codeRef: 'macro.ts:computeMacro()',
      format: 'percent',
      shared: true,
    },
    {
      id: 'cc_consumer_credit',
      label: 'Consumer\nCredit',
      shortLabel: 'Cons Cred',
      equationRef: '6.1',
      codeRef: 'macro.ts:computeConsumerCreditConditions()',
      format: 'multiplier',
    },
    {
      id: 'cc_consumption_mult',
      label: 'Spending\nMultiplier',
      shortLabel: 'C Mult.',
      equationRef: '6.1',
      codeRef: 'macro.ts:computeConsumerCreditConditions()',
      format: 'multiplier',
    },
    {
      id: 'cc_consumption',
      label: 'Consumer\nSpending',
      shortLabel: 'Consump.',
      equationRef: '3.4',
      codeRef: 'macro.ts:computeMacro()',
      format: 'compact',
      shared: true,
    },
    {
      id: 'cc_gdp_gap',
      label: 'GDP\nGap',
      shortLabel: 'GDP Gap',
      equationRef: '5.6',
      codeRef: 'macro.ts:computeMacro()',
      format: 'percent',
      shared: true,
    },
    {
      id: 'cc_business_credit',
      label: 'Business\nCredit',
      shortLabel: 'Biz Cred',
      equationRef: '6.2',
      codeRef: 'macro.ts:computeBusinessCreditConditions()',
      format: 'multiplier',
      lagged: true,
    },
    {
      id: 'cc_investment',
      label: 'Business\nInvestment',
      shortLabel: 'Invest.',
      equationRef: '5.3',
      codeRef: 'macro.ts:computeMacro()',
      format: 'compact',
      shared: true,
      lagged: true,
    },
  ],
  edges: [
    { from: 'cc_unemployment', to: 'cc_consumer_credit', label: 'banks assess risk', polarity: '+', equation: 'tightening = min(max, creditSensitivity × excessUE)' },
    { from: 'cc_consumer_credit', to: 'cc_consumption_mult', label: 'credit availability', polarity: '+', equation: 'multiplier = 1 - tightening × consumptionSensitivity' },
    { from: 'cc_consumption_mult', to: 'cc_consumption', label: 'scales spending', polarity: '+', equation: 'C = baseC × creditMultiplier × (1 - deferrable)' },
    { from: 'cc_consumption', to: 'cc_gdp_gap', label: 'demand gap shifts', polarity: '+', equation: 'gap = (actualGDP - potentialGDP) / potentialGDP' },
    { from: 'cc_gdp_gap', to: 'cc_business_credit', label: 'revenue trajectory', polarity: '+', equation: 'bizTightening = growthSensitivity × gdpGrowthRate' },
    { from: 'cc_business_credit', to: 'cc_investment', label: 'funding availability', polarity: '+', equation: 'I = baseI × businessCreditMultiplier' },
    { from: 'cc_investment', to: 'cc_unemployment', label: 'investment → employment', polarity: '-', equation: 'I → GDP → employment → UE (inverse)' },
  ],
  params: [
    { id: 'unemploymentRate', label: 'Unemployment Rate', min: 0.03, max: 0.30, step: 0.005, defaultValue: 0.044, unit: '%', sourceConstant: '(scenario input)' },
    { id: 'incomeAdequacySensitivity', label: 'Income Adequacy Sens.', min: 2.0, max: 15.0, step: 0.5, defaultValue: 8.0, unit: 'x', sourceConstant: 'CREDIT_UE_SENSITIVITY' },
    { id: 'maxCreditTightening', label: 'Max Credit Tightening', min: 0.30, max: 0.90, step: 0.05, defaultValue: 0.70, unit: '%', sourceConstant: 'MAX_CREDIT_TIGHTENING' },
    { id: 'businessCreditGDPSensitivity', label: 'Biz Credit GDP Sens.', min: 2.0, max: 8.0, step: 0.5, defaultValue: 5.0, unit: 'x', sourceConstant: 'DEFAULT_BUSINESS_CREDIT_GDP_SENSITIVITY' },
  ],
};

// ---------------------------------------------------------------------------
// Loop 5: Fiscal-Monetary
// ---------------------------------------------------------------------------

export const FISCAL_MONETARY: FeedbackLoopDefinition = {
  id: 'fiscal_monetary',
  name: 'Fiscal-Monetary',
  shortName: 'Fiscal',
  color: '#22C55E',
  description:
    'Tax revenue tracks nominal GDP — when GDP rises, revenue grows; when it falls, ' +
    'deficits widen and debt accumulates. If debt service costs exceed 50% of revenue, ' +
    'the central bank may monetize debt, creating inflation that raises nominal GDP and ' +
    'tax receipts. This loop can be self-correcting or self-reinforcing depending on the ' +
    'balance between real growth and inflation.',
  nodes: [
    {
      id: 'fm_revenue',
      label: 'Tax\nRevenue',
      shortLabel: 'Revenue',
      equationRef: '5.8',
      codeRef: 'fiscal.ts:computeEndogenousRevenue()',
      format: 'compact',
    },
    {
      id: 'fm_deficit',
      label: 'Fiscal\nDeficit',
      shortLabel: 'Deficit',
      equationRef: '5.9',
      codeRef: 'fiscal.ts:computeGovernmentSpending()',
      format: 'compact',
    },
    {
      id: 'fm_debt_gdp',
      label: 'Debt /\nGDP',
      shortLabel: 'Debt',
      equationRef: '5.10',
      codeRef: 'fiscal.ts:computeDebtAccumulation()',
      format: 'percent',
    },
    {
      id: 'fm_interest',
      label: 'Interest\nExpense',
      shortLabel: 'Interest',
      equationRef: '5.10',
      codeRef: 'fiscal.ts:computeDebtAccumulation()',
      format: 'compact',
    },
    {
      id: 'fm_debt_service',
      label: 'Debt Svc.\nRatio',
      shortLabel: 'DSR',
      equationRef: '6.5',
      codeRef: 'monetization.ts:computeMonetizationRate()',
      format: 'percent',
    },
    {
      id: 'fm_monetization',
      label: 'Monetization\nRate',
      shortLabel: 'Monetize',
      equationRef: '6.5',
      codeRef: 'monetization.ts:computeMonetizationRate()',
      format: 'percent',
    },
    {
      id: 'fm_inflation',
      label: 'Inflation\nRate',
      shortLabel: 'Inflation',
      equationRef: '4.1',
      codeRef: 'macro.ts:computeMacro()',
      format: 'percent',
      shared: true,
    },
    {
      id: 'fm_nominal_gdp',
      label: 'Nominal\nGDP',
      shortLabel: 'Nom GDP',
      equationRef: '5.6',
      codeRef: 'macro.ts:computeMacro()',
      format: 'compact',
      shared: true,
    },
  ],
  edges: [
    { from: 'fm_revenue', to: 'fm_deficit', label: 'revenue-spending gap', polarity: '-', equation: 'deficit = spending - revenue' },
    { from: 'fm_deficit', to: 'fm_debt_gdp', label: 'debt accumulates', polarity: '+', equation: 'debt = prevDebt + deficit' },
    { from: 'fm_debt_gdp', to: 'fm_interest', label: 'servicing cost', polarity: '+', equation: 'interest = debt × weightedAvgRate' },
    { from: 'fm_interest', to: 'fm_debt_service', label: 'share of revenue', polarity: '+', equation: 'DSR = interest / revenue' },
    { from: 'fm_debt_service', to: 'fm_monetization', label: 'financial repression', polarity: '+', equation: 'if DSR > 0.50: monetize = QE + repression ramp' },
    { from: 'fm_monetization', to: 'fm_inflation', label: 'money creation', polarity: '+', equation: 'ΔM → ΔP via Fisher (MV = PY)' },
    { from: 'fm_inflation', to: 'fm_nominal_gdp', label: 'inflates nominal', polarity: '+', equation: 'nomGDP = realGDP × priceLevel' },
    { from: 'fm_nominal_gdp', to: 'fm_revenue', label: 'tax base grows', polarity: '+', equation: 'revenue = taxRate × nominalGDP' },
  ],
  params: [
    { id: 'taxRate', label: 'Effective Tax Rate', min: 0.15, max: 0.35, step: 0.005, defaultValue: 0.25, unit: '%', sourceConstant: 'EFFECTIVE_TAX_RATE' },
    { id: 'gdpGrowthRate', label: 'Real GDP Growth', min: -0.10, max: 0.05, step: 0.005, defaultValue: 0.02, unit: '%', sourceConstant: '(scenario input)' },
    { id: 'interestRate', label: 'Avg Debt Rate', min: 0.01, max: 0.10, step: 0.005, defaultValue: 0.035, unit: '%', sourceConstant: '(endogenous)' },
    { id: 'qeMonetizationRate', label: 'QE Monetization Rate', min: 0.0, max: 0.80, step: 0.05, defaultValue: 0.40, unit: '%', sourceConstant: '(Fed preset)' },
  ],
};

// ---------------------------------------------------------------------------
// Loop 6: Housing Wealth
// ---------------------------------------------------------------------------

export const HOUSING_WEALTH: FeedbackLoopDefinition = {
  id: 'housing_wealth',
  name: 'Housing Wealth',
  shortName: 'Housing',
  color: '#EC4899',
  description:
    'Wage growth and employment levels affect housing affordability and mortgage stress. ' +
    'Changes in home prices shift household wealth, which influences consumption through ' +
    'the wealth effect (MPC on housing). This consumption change feeds back into GDP ' +
    'and employment, creating a reinforcing cycle in either direction.',
  nodes: [
    {
      id: 'hw_wage_growth',
      label: 'Wage\nGrowth',
      shortLabel: 'Wages',
      equationRef: '3.1',
      codeRef: 'macro.ts:computeMacro()',
      format: 'percent',
      shared: true,
    },
    {
      id: 'hw_affordability',
      label: 'Housing\nAfford.',
      shortLabel: 'Afford.',
      equationRef: '6.3',
      codeRef: 'macro.ts:computeMortgageStressIndex()',
      format: 'multiplier',
    },
    {
      id: 'hw_mortgage_stress',
      label: 'Mortgage\nStress',
      shortLabel: 'Stress',
      equationRef: '6.2',
      codeRef: 'macro.ts:computeMortgageStressIndex()',
      format: 'multiplier',
    },
    {
      id: 'hw_foreclosures',
      label: 'Foreclosure\nRate',
      shortLabel: 'Forecl.',
      equationRef: '6.3',
      codeRef: 'macro.ts:updateHomeownership()',
      format: 'percent',
    },
    {
      id: 'hw_housing_wealth',
      label: 'Housing\nWealth',
      shortLabel: 'H Wealth',
      equationRef: '6.4',
      codeRef: 'simulation.ts:homePriceIndex',
      format: 'compact',
    },
    {
      id: 'hw_consumption',
      label: 'Wealth-Effect\nSpending',
      shortLabel: 'W Spend',
      equationRef: '6.4',
      codeRef: 'macro.ts:housing wealth MPC',
      format: 'compact',
      shared: true,
    },
    {
      id: 'hw_gdp',
      label: 'Real\nGDP',
      shortLabel: 'GDP',
      equationRef: '5.6',
      codeRef: 'macro.ts:computeMacro()',
      format: 'compact',
      shared: true,
    },
  ],
  edges: [
    { from: 'hw_wage_growth', to: 'hw_affordability', label: 'income vs costs', polarity: '+', equation: 'affordability = wageGrowth / housingCostGrowth' },
    { from: 'hw_affordability', to: 'hw_mortgage_stress', label: 'payment burden', polarity: '-', equation: 'stress = amplifier × quintile-weighted displacement × homeownership' },
    { from: 'hw_mortgage_stress', to: 'hw_foreclosures', label: 'default risk shifts', polarity: '+', equation: 'foreclosure ∝ stress × (1 - recovery) with lag' },
    { from: 'hw_foreclosures', to: 'hw_housing_wealth', label: 'prices adjust', polarity: '-', equation: 'homePriceIndex × (1 + supplyDemandBalance)' },
    { from: 'hw_housing_wealth', to: 'hw_consumption', label: 'wealth effect', polarity: '+', equation: 'ΔC = housingWealthMPC × ΔhousingWealth' },
    { from: 'hw_consumption', to: 'hw_gdp', label: 'demand channel', polarity: '+', equation: 'GDP = C + I + G + NX' },
    { from: 'hw_gdp', to: 'hw_wage_growth', label: 'GDP drives wages', polarity: '+', equation: 'GDP → employment → wage growth' },
  ],
  params: [
    { id: 'wageGrowthRate', label: 'Wage Growth Rate', min: -0.15, max: 0.05, step: 0.01, defaultValue: 0.0, unit: '%', sourceConstant: '(scenario input)' },
    { id: 'mortgageStressAmplifier', label: 'Mortgage Stress Amplifier', min: 0.1, max: 1.0, step: 0.05, defaultValue: 0.40, unit: 'x', sourceConstant: 'DEFAULT_MORTGAGE_STRESS_AMPLIFIER' },
    { id: 'housingWealthMPC', label: 'Housing Wealth MPC', min: 0.01, max: 0.10, step: 0.005, defaultValue: 0.05, unit: 'x', sourceConstant: 'DEFAULT_HOUSING_WEALTH_MPC' },
    { id: 'displacementPct', label: 'Displacement Level', min: 0.0, max: 0.50, step: 0.02, defaultValue: 0.10, unit: '%', sourceConstant: '(scenario input)' },
  ],
};

// ---------------------------------------------------------------------------
// All Loops Array
// ---------------------------------------------------------------------------

export const ALL_LOOPS: FeedbackLoopDefinition[] = [
  DISPLACEMENT_DEMAND,
  PHILLIPS_CURVE,
  DEMAND_SPILLOVER,
  CREDIT_CRUNCH,
  FISCAL_MONETARY,
  HOUSING_WEALTH,
];

// ---------------------------------------------------------------------------
// Shared Nodes for System Interconnection Diagram
// ---------------------------------------------------------------------------

export const SHARED_NODES: SharedNode[] = [
  {
    id: 'gdp',
    label: 'GDP',
    loopIds: ['displacement_demand', 'demand_spillover', 'credit_crunch', 'fiscal_monetary', 'housing_wealth'],
    position: { x: 450, y: 300 },
  },
  {
    id: 'unemployment',
    label: 'Unemployment',
    loopIds: ['displacement_demand', 'phillips_curve', 'credit_crunch', 'housing_wealth'],
    position: { x: 250, y: 180 },
  },
  {
    id: 'consumption',
    label: 'Consumption',
    loopIds: ['displacement_demand', 'phillips_curve', 'demand_spillover', 'credit_crunch', 'housing_wealth'],
    position: { x: 650, y: 180 },
  },
  {
    id: 'wages',
    label: 'Wages',
    loopIds: ['displacement_demand', 'phillips_curve', 'demand_spillover', 'housing_wealth'],
    position: { x: 250, y: 420 },
  },
  {
    id: 'inflation',
    label: 'Inflation',
    loopIds: ['phillips_curve', 'fiscal_monetary'],
    position: { x: 650, y: 420 },
  },
  {
    id: 'investment',
    label: 'Investment',
    loopIds: ['demand_spillover', 'credit_crunch'],
    position: { x: 450, y: 100 },
  },
];

/** Map node IDs from individual loops to the shared node they represent */
export const NODE_TO_SHARED: Record<string, string> = {
  // GDP
  dl_gdp_growth: 'gdp', ds_gdp: 'gdp', cc_gdp_gap: 'gdp', fm_nominal_gdp: 'gdp', hw_gdp: 'gdp',
  // Unemployment
  dl_unemployment: 'unemployment', pc_unemployment: 'unemployment', cc_unemployment: 'unemployment',
  // Consumption
  dl_consumption: 'consumption', pc_consumption: 'consumption', ds_consumption: 'consumption',
  cc_consumption: 'consumption', hw_consumption: 'consumption',
  // Wages
  dl_wage_income: 'wages', pc_wage_pressure: 'wages', ds_income: 'wages', hw_wage_growth: 'wages',
  // Inflation
  fm_inflation: 'inflation',
  // Investment
  ds_investment: 'investment', cc_investment: 'investment',
};
