/**
 * ATLAS Phase 8c: Parameter Formatting & Labels
 *
 * Provides human-readable formatting for the 23 YearParameters fields,
 * organized by category for the per-year parameter editor UI.
 *
 * PURE FUNCTIONS — no side effects.
 */

// ============================================================
// Parameter Labels
// ============================================================

/** Human-readable label for each YearParameters field. */
export const PARAM_LABELS: Record<string, string> = {
  // Fiscal consolidation
  fiscalDiscretionaryMultiplier: 'Discretionary Spending',
  fiscalObligationMultiplier: 'Mandatory Spending',
  fiscalRevenueMultiplier: 'Tax Rate Multiplier',
  consolidationIntensity: 'Consolidation Intensity',
  effectiveColaDampeningFactor: 'COLA Dampening',

  // Tax rates
  effectiveIncomeTaxRate: 'Income Tax Rate',
  effectivePayrollTaxRate: 'Payroll Tax Rate',
  effectiveCorporateTaxRate: 'Corporate Tax Rate',
  effectiveCapitalGainsTaxRate: 'Capital Gains Rate',

  // Monetary
  qeMonetizationRate: 'QE Monetization',
  maxFinancialRepressionRate: 'Financial Repression Cap',

  // Federal Reserve reaction function
  taylorInflationCoeff: 'Inflation Response (\u03B1)',
  taylorOutputGapCoeff: 'Output Gap Response (\u03B2)',
  taylorEmploymentGapCoeff: 'Employment Response (\u03B3)',

  // Policy programs
  ubiEnabled: 'UBI Program',
  ubiMonthlyAmount: 'UBI Monthly Amount',
  wageSubsidyEnabled: 'Wage Subsidy',
  wageSubsidyPercentage: 'Wage Subsidy Rate',
  swfEnabled: 'Sovereign Wealth Fund',
  equityEnabled: 'Equity Sharing',

  // Technology
  generativeCapabilityLevel: 'Generative AI',
  agenticCapabilityLevel: 'Agentic AI',
  embodiedCapabilityLevel: 'Embodied AI',
  tokenUsageMultiplier: 'Tokens / Task',

  // Supply Chain — Supply Shock Scenarios
  supplyChainAiChips: 'AI Chip Availability',
  supplyChainEnergyPrice: 'Energy Price Level',
  supplyChainEnergyCapacity: 'Grid Capacity for AI',
  supplyChainTrainingDC: 'Training DC Capacity',
  supplyChainInferenceDC: 'Inference DC Capacity',
  supplyChainRoboticsHW: 'Robotics HW Availability',
  supplyChainSoftwareEfficiency: 'Software Efficiency',

  // Supply Chain — Resilience
  resilienceAiChips: 'Chip Fab Resilience',
  resilienceEnergy: 'Energy Grid Resilience',
  resilienceTrainingDC: 'Training DC Resilience',
  resilienceInferenceDC: 'Inference DC Resilience',
  resilienceRoboticsHW: 'Rare Earth Resilience',

  // Supply Chain — Training Dynamics
  trainingChipsTechDecline: 'Chip Cost Decline',
  trainingEnergyTechDecline: 'Energy Cost Decline',
  trainingDCTechDecline: 'DC Cost Decline',
  trainingChipsScalePressure: 'Chip Scale Pressure',
  trainingEnergyScalePressure: 'Energy Scale Pressure',
  trainingDCScalePressure: 'DC Scale Pressure',
  regulatoryFriction: 'DC Regulatory Friction',

  // Supply Chain — Economics
  costPassThroughRate: 'Lab → Deployer Rate',
  consumerPassThroughRate: 'Deployer → Consumer Rate',
  costVsProcurementBlend: 'Cost vs Procurement Blend',
};

// ============================================================
// Parameter Categories
// ============================================================

export interface ParamCategoryConfig {
  key: string;
  label: string;
  color: string;
  params: string[];
}

export const PARAM_CATEGORIES: ParamCategoryConfig[] = [
  {
    key: 'fiscal',
    label: 'Fiscal Consolidation',
    color: '#F97316',
    params: [
      'fiscalDiscretionaryMultiplier',
      'fiscalObligationMultiplier',
      'fiscalRevenueMultiplier',
      'consolidationIntensity',
      'effectiveColaDampeningFactor',
    ],
  },
  {
    key: 'tax',
    label: 'Effective Tax Rates',
    color: '#EAB308',
    params: [
      'effectiveIncomeTaxRate',
      'effectivePayrollTaxRate',
      'effectiveCorporateTaxRate',
      'effectiveCapitalGainsTaxRate',
    ],
  },
  {
    key: 'monetary',
    label: 'Monetary Policy',
    color: '#6366F1',
    params: [
      'qeMonetizationRate',
      'maxFinancialRepressionRate',
    ],
  },
  {
    key: 'fed',
    label: 'Federal Reserve',
    color: '#818CF8',
    params: [
      'taylorInflationCoeff',
      'taylorOutputGapCoeff',
      'taylorEmploymentGapCoeff',
    ],
  },
  {
    key: 'policy',
    label: 'Policy Programs',
    color: '#10B981',
    params: [
      'ubiEnabled',
      'ubiMonthlyAmount',
      'wageSubsidyEnabled',
      'wageSubsidyPercentage',
      'swfEnabled',
      'equityEnabled',
    ],
  },
  {
    key: 'tech',
    label: 'Technology',
    color: '#22D3EE',
    params: [
      'generativeCapabilityLevel',
      'agenticCapabilityLevel',
      'embodiedCapabilityLevel',
      'tokenUsageMultiplier',
    ],
  },
  {
    key: 'supplyInputs',
    label: 'Supply Shock Scenarios',
    color: '#F97316',
    params: [
      'supplyChainAiChips',
      'supplyChainEnergyPrice',
      'supplyChainEnergyCapacity',
      'supplyChainTrainingDC',
      'supplyChainInferenceDC',
      'supplyChainRoboticsHW',
      'supplyChainSoftwareEfficiency',
    ],
  },
  {
    key: 'supplyResilience',
    label: 'Supply Resilience',
    color: '#FB923C',
    params: [
      'resilienceAiChips',
      'resilienceEnergy',
      'resilienceTrainingDC',
      'resilienceInferenceDC',
      'resilienceRoboticsHW',
    ],
  },
  {
    key: 'trainingDynamics',
    label: 'Training Cost Dynamics',
    color: '#FDBA74',
    params: [
      'trainingChipsTechDecline',
      'trainingEnergyTechDecline',
      'trainingDCTechDecline',
      'trainingChipsScalePressure',
      'trainingEnergyScalePressure',
      'trainingDCScalePressure',
      'regulatoryFriction',
    ],
  },
  {
    key: 'supplyEcon',
    label: 'Supply Chain Economics',
    color: '#EA580C',
    params: [
      'costPassThroughRate',
      'consumerPassThroughRate',
      'costVsProcurementBlend',
    ],
  },
];

// ============================================================
// Value Formatting
// ============================================================

/** Set of parameter keys that represent boolean-like toggles (0=off, 1=on). */
const BOOLEAN_PARAMS = new Set([
  'ubiEnabled',
  'wageSubsidyEnabled',
  'swfEnabled',
  'equityEnabled',
]);

/** Set of parameter keys that represent tax rates. */
const TAX_RATE_PARAMS = new Set([
  'effectiveIncomeTaxRate',
  'effectivePayrollTaxRate',
  'effectiveCorporateTaxRate',
  'effectiveCapitalGainsTaxRate',
]);

/** Set of parameter keys that represent multipliers (displayed as ×). */
const MULTIPLIER_PARAMS = new Set([
  'fiscalDiscretionaryMultiplier',
  'fiscalObligationMultiplier',
  'fiscalRevenueMultiplier',
  'effectiveColaDampeningFactor',
  'tokenUsageMultiplier',
]);

/** Set of parameter keys that represent rates/fractions (displayed as %). */
const RATE_PARAMS = new Set([
  'consolidationIntensity',
  'qeMonetizationRate',
  'maxFinancialRepressionRate',
  'wageSubsidyPercentage',
  'generativeCapabilityLevel',
  'agenticCapabilityLevel',
  'embodiedCapabilityLevel',
  // Supply Chain — resilience + pass-through + training composition
  'resilienceAiChips',
  'resilienceEnergy',
  'resilienceTrainingDC',
  'resilienceInferenceDC',
  'resilienceRoboticsHW',
  'costPassThroughRate',
  'consumerPassThroughRate',
  'costVsProcurementBlend',
]);

/** Supply chain index params (displayed as integer index, 100 = baseline). */
const INDEX_PARAMS = new Set([
  'supplyChainAiChips',
  'supplyChainEnergyPrice',
  'supplyChainEnergyCapacity',
  'supplyChainTrainingDC',
  'supplyChainInferenceDC',
  'supplyChainRoboticsHW',
  'supplyChainSoftwareEfficiency',
]);

/** Supply chain rate params (displayed as %/yr). */
const ANNUAL_RATE_PARAMS = new Set([
  'trainingChipsTechDecline',
  'trainingEnergyTechDecline',
  'trainingDCTechDecline',
]);

/**
 * Format a parameter value for display.
 *
 * Formatting rules by parameter type:
 * - Boolean toggles → "On" / "Off"
 * - Tax rates → "12.4%" (value × 100)
 * - Multipliers → "0.95×"
 * - Rates/fractions → "42%" (value × 100)
 * - Dollar amounts → "$1,500/mo"
 * - Default → fixed 2 decimal places
 */
export function formatParamValue(value: number, paramKey: string): string {
  if (BOOLEAN_PARAMS.has(paramKey)) {
    return value >= 0.5 ? 'On' : 'Off';
  }

  if (TAX_RATE_PARAMS.has(paramKey)) {
    return `${(value * 100).toFixed(1)}%`;
  }

  if (MULTIPLIER_PARAMS.has(paramKey)) {
    return `${value.toFixed(2)}\u00D7`;
  }

  if (RATE_PARAMS.has(paramKey)) {
    return `${(value * 100).toFixed(0)}%`;
  }

  if (INDEX_PARAMS.has(paramKey)) {
    return `${value.toFixed(0)}%`;
  }

  if (ANNUAL_RATE_PARAMS.has(paramKey)) {
    return `${(value * 100).toFixed(1)}%/yr`;
  }

  if (paramKey === 'ubiMonthlyAmount') {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo`;
  }

  return value.toFixed(2);
}

/**
 * Check if a parameter is read-only (technology params are computed from S-curves).
 */
export function isReadOnlyParam(paramKey: string): boolean {
  return paramKey === 'generativeCapabilityLevel'
    || paramKey === 'agenticCapabilityLevel'
    || paramKey === 'embodiedCapabilityLevel'
;
}

/**
 * Check if a parameter is a boolean toggle.
 */
export function isBooleanParam(paramKey: string): boolean {
  return BOOLEAN_PARAMS.has(paramKey);
}
