/**
 * ATLAS CSV Parameter Import/Export
 *
 * Parses two-column CSV files (parameter_path, value) into a SimulationConfig,
 * and exports a SimulationConfig back to the same CSV format.
 *
 * This enables rigorous formula verification: export slider settings as CSV,
 * edit in Excel/Sheets, re-import, and compare simulation results.
 *
 * Uses Papa Parse for robust CSV parsing (handles BOM, line endings, quoting).
 */

import Papa from 'papaparse';
import type {
  SimulationConfig,
  CapabilityVectorId,
  CapabilityTrajectoryParams,
  BFCSThresholds,
  PolicyConfig,
  PolicySchedule,
  StateCode,
  DeploymentType,
} from '@/types';
import { getDefaultSimulationConfig } from '@/models/simulation';
import { getDefaultSupplyChainConfig } from '@/models/supplyChain';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { flatToSchedule } from '@/utils/policyInterpolation';
import { ALL_STATE_CODES } from '@/data/stateData';
import { validateConfig } from '@/utils/validateConfig';
import {
  BASELINE_INCOME_TAX_RATE,
  BASELINE_PAYROLL_RATE,
  BASELINE_CORPORATE_TAX_RATE,
  BASELINE_CAPITAL_GAINS_RATE,
  DEFAULT_POST_TAX_MPC_WAGE,
  DEFAULT_POST_TAX_MPC_ASSET,
  DEFAULT_POST_TAX_MPC_TRANSFER,
  DEFAULT_INFERENCE_ANNUAL_CHANGE,
  DEFAULT_MANUFACTURING_ANNUAL_CHANGE,
  DEFAULT_ENERGY_ANNUAL_CHANGE,
  FALLBACK_CORPORATE_RETENTION_RATE,
  DEFAULT_AI_PROFIT_GROWTH_RATE,
  DEFAULT_TRANSFER_RELIABILITY_WEIGHT,
  DEFAULT_INCOME_ADEQUACY_SENSITIVITY,
  DEFAULT_COLLATERAL_SENSITIVITY,
  DEFAULT_SYSTEMIC_RISK_SENSITIVITY,
  DEFAULT_INFLATION_RISK_SENSITIVITY,
  DEFAULT_MAX_CONSUMER_TIGHTENING,
  DEFAULT_CONSUMER_CREDIT_IMPACT,
  DEFAULT_PROFITABILITY_SENSITIVITY,
  DEFAULT_GROWTH_TRAJECTORY_SENSITIVITY,
  DEFAULT_MAX_BUSINESS_TIGHTENING,
  DEFAULT_BUSINESS_INVESTMENT_IMPACT,
} from '@/models/constants';

// ============================================================
// Constants
// ============================================================

const CAPABILITY_VECTOR_IDS: CapabilityVectorId[] = ['generative', 'agentic', 'embodied'];

const BFCS_DIMENSIONS: (keyof BFCSThresholds)[] = [
  'better', 'faster', 'cheaper', 'safer',
];

const DEPLOYMENT_TYPES: DeploymentType[] = [
  'software', 'robotics', 'autonomous_vehicle', 'hybrid',
];

const REGULATORY_ENVS = ['permissive', 'moderate', 'restrictive'] as const;

const SWF_DISTRIBUTIONS = ['universal', 'means_tested'] as const;
const EQUITY_DISTRIBUTIONS = ['equal', 'progressive'] as const;
const PROFIT_SHARING_SCOPES = ['employees_only', 'community', 'national'] as const;

// Build a lookup map: clusterId → Map<roleId, BFCSThresholds>
function buildClusterRoleLookup(): Map<string, Map<string, BFCSThresholds>> {
  const lookup = new Map<string, Map<string, BFCSThresholds>>();
  for (const cluster of OCCUPATION_CLUSTERS) {
    const roles = new Map<string, BFCSThresholds>();
    for (const role of cluster.roles) {
      roles.set(role.id, { ...role.bfcsThresholds });
    }
    lookup.set(cluster.id, roles);
  }
  return lookup;
}

const CLUSTER_ROLE_LOOKUP = buildClusterRoleLookup();

const ALL_STATE_CODES_SET = new Set<string>(ALL_STATE_CODES);

// ============================================================
// PolicySchedule CSV Helpers
// ============================================================

/**
 * Serialize a PolicySchedule to a CSV-safe string.
 * Uses JSON for the keyframes array.
 */
function serializeSchedule(schedule: PolicySchedule): string {
  return JSON.stringify(schedule.keyframes);
}

/**
 * Serialize a PolicySchedule as a properly CSV-quoted field.
 * Doubles internal quotes so Papa Parse can round-trip the JSON.
 */
function csvQuoteSchedule(schedule: PolicySchedule): string {
  const json = serializeSchedule(schedule);
  // CSV spec: wrap in double quotes, double any internal double quotes
  return `"${json.replace(/"/g, '""')}"`;
}

/**
 * Parse a CSV value into a PolicySchedule.
 * Accepts:
 * - JSON keyframes string e.g. '[{"year":2025,"value":7.25}]'
 * - Flat number shorthand e.g. '7.25' → single-keyframe schedule at startYear
 */
function parseSchedule(rawValue: string): PolicySchedule | null {
  const trimmed = rawValue.trim();

  // Try JSON parse first (new format)
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return { keyframes: parsed };
      }
    } catch {
      // Fall through to flat number parse
    }
  }

  // Flat number shorthand: '7.25' → flatToSchedule(7.25)
  const num = Number(trimmed);
  if (!isNaN(num)) {
    return flatToSchedule(num);
  }

  return null;
}

// ============================================================
// Parsing Helpers
// ============================================================

function parseBoolean(value: string): boolean | null {
  const v = value.trim().toLowerCase();
  if (v === 'true' || v === '1' || v === 'yes') return true;
  if (v === 'false' || v === '0' || v === 'no') return false;
  return null;
}

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const n = Number(trimmed);
  if (Number.isNaN(n) || !Number.isFinite(n)) return null;
  return n;
}

// ============================================================
// parseParameterCSV
// ============================================================

export interface CSVParseResult {
  params: Map<string, string>;
  warnings: string[];
}

/**
 * Parse a two-column CSV string into a parameter map.
 * Tolerates optional header row, comment lines (#), and empty lines.
 */
export function parseParameterCSV(csvString: string): CSVParseResult {
  const warnings: string[] = [];
  const params = new Map<string, string>();

  const result = Papa.parse<string[]>(csvString, {
    header: false,
    skipEmptyLines: true,
    comments: '#',
  });

  if (result.errors.length > 0) {
    for (const err of result.errors) {
      warnings.push(`CSV parse error at row ${err.row}: ${err.message}`);
    }
  }

  for (let i = 0; i < result.data.length; i++) {
    const row = result.data[i];
    if (!row || row.length < 2) {
      if (row && row.length === 1 && (row[0] ?? '').trim() === '') continue; // empty line
      warnings.push(`Row ${i + 1}: expected 2 columns, got ${row?.length ?? 0}`);
      continue;
    }

    const path = (row[0] ?? '').trim();
    const value = row.slice(1).join(',').trim(); // rejoin in case value contained commas

    // Skip header row
    if (i === 0 && path === 'parameter_path' && value === 'value') continue;
    if (path === '') continue;

    params.set(path, value);
  }

  return { params, warnings };
}

// ============================================================
// buildConfigFromCSV
// ============================================================

export interface ConfigBuildResult {
  config: SimulationConfig;
  warnings: string[];
}

/**
 * Build a complete SimulationConfig from a parameter map.
 * Unrecognized paths produce warnings. Missing paths use defaults.
 */
export function buildConfigFromCSV(params: Map<string, string>): ConfigBuildResult {
  const warnings: string[] = [];
  const config = getDefaultSimulationConfig();

  // Deep-clone nested objects to avoid shared references
  config.capabilities = JSON.parse(JSON.stringify(config.capabilities));
  config.adoptionParams = JSON.parse(JSON.stringify(config.adoptionParams));
  config.policyConfig = JSON.parse(JSON.stringify(config.policyConfig));
  config.bfcsOverrides = {};
  config.stateOverrides = {};

  for (const [rawPath, rawValue] of params) {
    const path = rawPath;
    const handled = applyParameter(config, path, rawValue, warnings);
    if (!handled) {
      warnings.push(`Unrecognized parameter path: "${rawPath}"`);
    }
  }

  // Cross-field validation
  if (config.endYear <= config.startYear) {
    warnings.push(
      `end_year (${config.endYear}) must be greater than start_year (${config.startYear}). Using defaults.`
    );
    const defaults = getDefaultSimulationConfig();
    config.startYear = defaults.startYear;
    config.endYear = defaults.endYear;
  }

  // Validate capability floor <= ceiling
  for (const vecId of CAPABILITY_VECTOR_IDS) {
    const cap = config.capabilities[vecId];
    if (cap.floor > cap.ceiling) {
      warnings.push(
        `capability.${vecId}.floor (${cap.floor}) > ceiling (${cap.ceiling}). Values swapped.`
      );
      const tmp = cap.floor;
      cap.floor = cap.ceiling;
      cap.ceiling = tmp;
    }
  }

  // Finalize BFCS overrides: ensure every partial override has all 4 dimensions
  finalizeBFCSOverrides(config);

  // Phase 5g Step 14: Validate and clamp all config values
  const validation = validateConfig(config);
  warnings.push(...validation.warnings);

  return { config: validation.config, warnings };
}

/**
 * Apply a single parameter path to the config.
 * Returns true if the path was recognized.
 */
function applyParameter(
  config: SimulationConfig,
  path: string,
  rawValue: string,
  warnings: string[],
): boolean {
  // --- Global / Timeline ---
  if (path === 'start_year') {
    const v = parseNumber(rawValue);
    if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; }
    config.startYear = Math.round(v);
    return true;
  }
  if (path === 'end_year') {
    const v = parseNumber(rawValue);
    if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; }
    config.endYear = Math.round(v);
    return true;
  }

  // --- Macro Parameters ---
  if (path === 'base_inflation_rate') return applyFloat(config, 'baseInflationRate', rawValue, path, warnings);
  if (path === 'baseline_gdp_growth') return applyFloat(config, 'baselineGDPGrowth', rawValue, path, warnings);

  // --- Population ---
  if (path === 'total_population') return applyInt(config, 'totalPopulation', rawValue, path, warnings);
  if (path === 'labor_force') return applyInt(config, 'laborForce', rawValue, path, warnings);
  if (path === 'population_growth_rate') return applyFloat(config, 'populationGrowthRate', rawValue, path, warnings);

  // --- New Job Creation ---
  if (path === 'innovation_rate') return applyFloat(config, 'innovationRate', rawValue, path, warnings);
  if (path === 'rd_multiplier') return applyFloat(config, 'rdMultiplier', rawValue, path, warnings);
  if (path === 'job_persistence_factor') return applyFloat(config, 'jobPersistenceFactor', rawValue, path, warnings);

  // --- Second-Order Effect Parameters ---
  if (path === 'demand_feedback_sensitivity') return applyFloat(config, 'demandFeedbackSensitivity', rawValue, path, warnings);
  if (path === 'credit_ue_sensitivity') return applyFloat(config, 'creditUESensitivity', rawValue, path, warnings);
  if (path === 'credit_investment_sensitivity') return applyFloat(config, 'creditInvestmentSensitivity', rawValue, path, warnings);
  if (path === 'credit_consumption_sensitivity') return applyFloat(config, 'creditConsumptionSensitivity', rawValue, path, warnings);

  // --- AI Production Parameters (Phase 2) ---
  if (path === 'ai_production_investment_fraction') return applyFloat(config, 'aiProductionInvestmentFraction', rawValue, path, warnings);
  if (path === 'ai_production_onshoring_fraction') return applyFloat(config, 'aiProductionOnshoringFraction', rawValue, path, warnings);
  if (path === 'new_job_wage_fraction') return applyFloat(config, 'newJobWageFraction', rawValue, path, warnings);

  // --- Feedback Loop Parameters (Phase 1 overhaul) ---
  if (path === 'revenue_pressure_sensitivity') return applyFloat(config, 'revenuePressureSensitivity', rawValue, path, warnings);
  if (path === 'revenue_pressure_cap') return applyFloat(config, 'revenuePressureCap', rawValue, path, warnings);
  if (path === 'revenue_pressure_decay') return applyFloat(config, 'revenuePressureDecay', rawValue, path, warnings);
  if (path === 'ai_wage_productivity_multiplier') return applyFloat(config, 'aiWageProductivityMultiplier', rawValue, path, warnings);

  // --- Labor Supply Response Parameters (Phase 5g Step 12) ---
  if (path === 'participation_elasticity') return applyFloat(config, 'participationElasticity', rawValue, path, warnings);
  if (path === 'participation_threshold') return applyFloat(config, 'participationThreshold', rawValue, path, warnings);

  // --- Dynamic Money Velocity Parameters (Phase 5g) ---
  if (path === 'velocity_sensitivity') return applyFloat(config, 'velocitySensitivity', rawValue, path, warnings);

  // --- Phase 5h: other_uncategorized multiplier override ---
  if (path === 'other_uncategorized_multiplier_override') return applyFloat(config, 'otherUncategorizedMultiplierOverride', rawValue, path, warnings);

  // --- Phase 5g Corporate Profits & Financial Markets ---
  if (path === 'ai_profit_margin') return applyFloat(config, 'aiProfitMargin', rawValue, path, warnings);
  if (path === 'traditional_profit_margin') return applyFloat(config, 'traditionalProfitMargin', rawValue, path, warnings);
  // --- Asset Income Decomposition: P/E sensitivity ---
  if (path === 'ai_pe_sensitivity') return applyFloat(config, 'aiPESensitivity', rawValue, path, warnings);
  if (path === 'traditional_pe_sensitivity') return applyFloat(config, 'traditionalPESensitivity', rawValue, path, warnings);

  // --- Phase 5g Minimum Wage Feedback ---
  if (path === 'wage_pass_through') return applyFloat(config, 'wagePassThrough', rawValue, path, warnings);
  if (path === 'wage_automation_sensitivity') return applyFloat(config, 'wageAutomationSensitivity', rawValue, path, warnings);

  // --- Phase 5g Credit Deflation ---
  if (path === 'credit_deflation_sensitivity') return applyFloat(config, 'creditDeflationSensitivity', rawValue, path, warnings);

  // --- Demand Spillover ---
  if (path === 'demand_spillover_tolerance') return applyFloat(config, 'demandSpilloverTolerance', rawValue, path, warnings);

  // --- Phase 5g Sector Scarcity Inflation ---
  if (path === 'scarcity_pass_through') return applyFloat(config, 'scarcityPassThrough', rawValue, path, warnings);

  // --- Phase 5i Housing & Mortgage ---
  if (path === 'business_credit_gdp_sensitivity') return applyFloat(config, 'businessCreditGDPSensitivity', rawValue, path, warnings);
  if (path === 'max_business_credit_loosening') return applyFloat(config, 'maxBusinessCreditLoosening', rawValue, path, warnings);
  if (path === 'shelter_cpi_weight') return applyFloat(config, 'shelterCPIWeight', rawValue, path, warnings);
  if (path === 'shelter_inflation_stickiness') return applyFloat(config, 'shelterInflationStickiness', rawValue, path, warnings);
  if (path === 'mortgage_stress_amplifier') return applyFloat(config, 'mortgageStressAmplifier', rawValue, path, warnings);
  if (path === 'foreclosure_lag') return applyFloat(config, 'foreclosureLag', rawValue, path, warnings);
  if (path === 'homeownership_recovery_rate') return applyFloat(config, 'homeownershipRecoveryRate', rawValue, path, warnings);
  if (path === 'housing_wealth_mpc') return applyFloat(config, 'housingWealthMPC', rawValue, path, warnings);
  if (path === 'mpc_wage_ue_sensitivity') return applyFloat(config, 'mpcWageUESensitivity', rawValue, path, warnings);
  if (path === 'credit_adoption_sensitivity') return applyFloat(config, 'creditAdoptionSensitivity', rawValue, path, warnings);

  // --- Housing Market Stabilization ---
  if (path === 'institutional_buyer_rate') return applyFloat(config, 'institutionalBuyerRate', rawValue, path, warnings);
  if (path === 'rental_demand_sensitivity') return applyFloat(config, 'rentalDemandSensitivity', rawValue, path, warnings);
  if (path === 'shelter_inflation_floor') return applyFloat(config, 'shelterInflationFloor', rawValue, path, warnings);

  // --- Investment Demand Constraint ---
  if (path === 'ai_utilization_sensitivity') return applyFloat(config, 'aiUtilizationSensitivity', rawValue, path, warnings);
  if (path === 'consumer_demand_investment_sensitivity') return applyFloat(config, 'consumerDemandInvestmentSensitivity', rawValue, path, warnings);
  if (path === 'credit_investment_response_sensitivity') return applyFloat(config, 'creditInvestmentResponseSensitivity', rawValue, path, warnings);
  if (path === 'traditional_investment_demand_sensitivity') return applyFloat(config, 'traditionalInvestmentDemandSensitivity', rawValue, path, warnings);
  if (path === 'traditional_investment_gdp_fraction') return applyFloat(config, 'traditionalInvestmentGDPFraction', rawValue, path, warnings);

  // --- Income Distribution / Median CWI ---
  if (path === 'bottom_80_wage_share') return applyFloat(config, 'bottom80WageShare', rawValue, path, warnings);
  if (path === 'bottom_80_transfer_share') return applyFloat(config, 'bottom80TransferShare', rawValue, path, warnings);
  if (path === 'bottom_80_asset_share') return applyFloat(config, 'bottom80AssetShare', rawValue, path, warnings);

  // --- Phase 4 Quality Pass Parameters ---
  if (path === 'phillips_curve_sensitivity') return applyFloat(config, 'phillipsCurveSensitivity', rawValue, path, warnings);
  if (path === 'max_credit_tightening') return applyFloat(config, 'maxCreditTightening', rawValue, path, warnings);
  if (path === 'deferrable_consumption_share') return applyFloat(config, 'deferrableConsumptionShare', rawValue, path, warnings);
  if (path === 'deflation_midpoint') return applyFloat(config, 'deflationMidpoint', rawValue, path, warnings);
  if (path === 'deflation_steepness') return applyFloat(config, 'deflationSteepness', rawValue, path, warnings);

  // --- Tax & Economic Pipeline (Phase 5-tax) ---
  if (path === 'corporate_retention_rate') return applyFloat(config, 'corporateRetentionRate', rawValue, path, warnings);
  if (path === 'ai_profit_growth_rate') return applyFloat(config, 'aiProfitGrowthRate', rawValue, path, warnings);

  // --- Phase 6: Separated Consumer & Business Credit ---
  if (path === 'transfer_reliability_weight') return applyFloat(config, 'transferReliabilityWeight', rawValue, path, warnings);
  if (path === 'income_adequacy_sensitivity') return applyFloat(config, 'incomeAdequacySensitivity', rawValue, path, warnings);
  if (path === 'collateral_sensitivity') return applyFloat(config, 'collateralSensitivity', rawValue, path, warnings);
  if (path === 'systemic_risk_sensitivity') return applyFloat(config, 'systemicRiskSensitivity', rawValue, path, warnings);
  if (path === 'inflation_risk_sensitivity') return applyFloat(config, 'inflationRiskSensitivity', rawValue, path, warnings);
  if (path === 'max_consumer_tightening') return applyFloat(config, 'maxConsumerTightening', rawValue, path, warnings);
  if (path === 'consumer_credit_impact') return applyFloat(config, 'consumerCreditImpact', rawValue, path, warnings);
  if (path === 'profitability_sensitivity') return applyFloat(config, 'profitabilitySensitivity', rawValue, path, warnings);
  if (path === 'growth_trajectory_sensitivity') return applyFloat(config, 'growthTrajectorySensitivity', rawValue, path, warnings);
  if (path === 'max_business_tightening') return applyFloat(config, 'maxBusinessTightening', rawValue, path, warnings);
  if (path === 'business_investment_impact') return applyFloat(config, 'businessInvestmentImpact', rawValue, path, warnings);

  // --- Phase 8a: Fiscal Response Profile ---
  // DEPRECATED Phase 8 Fix 4: fiscal_response_profile replaced by split presets
  // if (path === 'fiscal_response_profile') {
  //   config.fiscalResponseProfile = rawValue.trim();
  //   return true;
  // }
  // Phase 8 Fix 4: Independent fiscal + Fed presets
  if (path === 'fiscal_policy_preset') {
    config.fiscalPolicyPreset = rawValue.trim();
    return true;
  }
  if (path === 'federal_reserve_preset') {
    config.federalReservePreset = rawValue.trim();
    return true;
  }
  if (path.startsWith('fiscal_response.')) {
    return applyFiscalResponseParam(config, path, rawValue, warnings);
  }

  // --- Phase 8b: Per-Year Parameter Overrides ---
  // Format: override.{paramKey}.{year} = value
  // Example: override.effectiveIncomeTaxRate.2035 = 0.22
  if (path.startsWith('override.')) {
    const rest = path.slice('override.'.length);
    const lastDot = rest.lastIndexOf('.');
    if (lastDot === -1) {
      warnings.push(`Invalid override path "${path}": expected override.paramKey.year`);
      return false;
    }
    const paramKey = rest.substring(0, lastDot);
    const yearStr = rest.substring(lastDot + 1);
    const yearNum = parseInt(yearStr, 10);
    if (isNaN(yearNum) || yearNum < 2025 || yearNum > 2100) {
      warnings.push(`Invalid override year "${yearStr}" in "${path}"`);
      return false;
    }
    const val = parseFloat(rawValue);
    if (isNaN(val)) {
      warnings.push(`Non-numeric override value "${rawValue}" for "${path}"`);
      return false;
    }
    if (!config.parameterOverrides) config.parameterOverrides = {};
    config.parameterOverrides[`${paramKey}:${yearNum}`] = val;
    return true;
  }

  // --- Phase 7: Fiscal-Monetary Parameters ---
  // DEPRECATED Phase 8 Fix 4: taylorInflationCoeff, taylorOutputGapCoeff moved to FederalReserveProfile
  // if (path === 'taylor_inflation_coeff') return applyFloat(config, 'taylorInflationCoeff', rawValue, path, warnings);
  // if (path === 'taylor_output_gap_coeff') return applyFloat(config, 'taylorOutputGapCoeff', rawValue, path, warnings);
  if (path === 'inflation_target') return applyFloat(config, 'inflationTarget', rawValue, path, warnings);
  if (path === 'effective_lower_bound') return applyFloat(config, 'effectiveLowerBound', rawValue, path, warnings);
  if (path === 'fiscal_dominance_threshold') return applyFloat(config, 'fiscalDominanceThreshold', rawValue, path, warnings);
  if (path === 'fiscal_dominance_dampening') return applyFloat(config, 'fiscalDominanceDampening', rawValue, path, warnings);
  // DEPRECATED Phase 8 Fix 4: fiscalRiskPremiumMidpoint replaced by fiscalRiskLevelMidpoint
  // if (path === 'fiscal_risk_premium_midpoint') return applyFloat(config, 'fiscalRiskPremiumMidpoint', rawValue, path, warnings);
  if (path === 'fiscal_risk_premium_max') return applyFloat(config, 'fiscalRiskPremiumMax', rawValue, path, warnings);
  // Phase 8 Fix 4: Yield calibration parameters
  if (path === 'neutral_real_rate') return applyFloat(config, 'neutralRealRate', rawValue, path, warnings);
  if (path === 'term_premium') return applyFloat(config, 'termPremium', rawValue, path, warnings);
  if (path === 'inflation_convergence_years') return applyFloat(config, 'inflationConvergenceYears', rawValue, path, warnings);
  // Phase 8 Fix 4: Fiscal risk premium weights
  if (path === 'fiscal_risk_trajectory_weight') return applyFloat(config, 'fiscalRiskTrajectoryWeight', rawValue, path, warnings);
  if (path === 'fiscal_risk_sustainability_weight') return applyFloat(config, 'fiscalRiskSustainabilityWeight', rawValue, path, warnings);
  if (path === 'fiscal_risk_level_weight') return applyFloat(config, 'fiscalRiskLevelWeight', rawValue, path, warnings);
  if (path === 'fiscal_risk_level_midpoint') return applyFloat(config, 'fiscalRiskLevelMidpoint', rawValue, path, warnings);
  if (path === 'fiscal_risk_trajectory_midpoint') return applyFloat(config, 'fiscalRiskTrajectoryMidpoint', rawValue, path, warnings);
  // Phase 8 Fix 5: Housing model (phillipsCurveWageSensitivity DEPRECATED — wage growth chain removed)
  // if (path === 'phillips_curve_wage_sensitivity') return applyFloat(config, 'phillipsCurveWageSensitivity', rawValue, path, warnings);
  if (path === 'affordability_price_sensitivity') return applyFloat(config, 'affordabilityPriceSensitivity', rawValue, path, warnings);
  if (path === 'income_housing_elasticity') return applyFloat(config, 'incomeHousingElasticity', rawValue, path, warnings);
  if (path === 'affordability_reversion_sensitivity') return applyFloat(config, 'affordabilityReversionSensitivity', rawValue, path, warnings);
  if (path === 'downward_stickiness_ratio') return applyFloat(config, 'downwardStickinessRatio', rawValue, path, warnings);
  if (path === 'demographic_housing_elasticity') return applyFloat(config, 'demographicHousingElasticity', rawValue, path, warnings);
  if (path === 'corporate_tax_effectiveness') return applyFloat(config, 'corporateTaxEffectiveness', rawValue, path, warnings);
  if (path === 'foreign_treasury_demand') return applyFloat(config, 'foreignTreasuryDemand', rawValue, path, warnings);
  if (path === 'ai_pe_multiplier') return applyFloat(config, 'aiPEMultiplier', rawValue, path, warnings);
  if (path === 'qe_monetization_rate') return applyFloat(config, 'qeMonetizationRate', rawValue, path, warnings);
  if (path === 'consolidation_credit_max') return applyFloat(config, 'consolidationCreditMax', rawValue, path, warnings);
  // Phase 8 Fix 3: Bond market absorption capacity
  if (path === 'supply_pressure_sensitivity') return applyFloat(config, 'supplyPressureSensitivity', rawValue, path, warnings);
  if (path === 'safety_flight_sensitivity') return applyFloat(config, 'safetyFlightSensitivity', rawValue, path, warnings);
  if (path === 'yield_attraction_midpoint') return applyFloat(config, 'yieldAttractionMidpoint', rawValue, path, warnings);
  if (path === 'inflation_deterrent_sensitivity') return applyFloat(config, 'inflationDeterrentSensitivity', rawValue, path, warnings);
  if (path === 'sovereign_confidence_decay_rate') return applyFloat(config, 'sovereignConfidenceDecayRate', rawValue, path, warnings);
  // Phase 8 Fix 3: Endogenous debt maturity
  if (path === 'base_weighted_average_maturity') return applyFloat(config, 'baseWeightedAverageMaturity', rawValue, path, warnings);
  if (path === 'min_weighted_average_maturity') return applyFloat(config, 'minWeightedAverageMaturity', rawValue, path, warnings);
  if (path === 'max_weighted_average_maturity') return applyFloat(config, 'maxWeightedAverageMaturity', rawValue, path, warnings);
  if (path === 'maturity_stress_sensitivity') return applyFloat(config, 'maturityStressSensitivity', rawValue, path, warnings);
  // Phase 8 Fix 3: Monetization transmission
  if (path === 'monetization_transmission_sensitivity') return applyFloat(config, 'monetizationTransmissionSensitivity', rawValue, path, warnings);
  if (path === 'policy_rate_schedule') { const s = parseSchedule(rawValue); if (s === null) { warnings.push(`Invalid schedule for ${path}: "${rawValue}"`); return true; } config.policyRateSchedule = s; return true; }

  // --- Tax Config sub-fields (Phase 5-tax) ---
  if (path.startsWith('tax_config.')) {
    return applyTaxConfigParam(config, path, rawValue, warnings);
  }

  // --- Post-Tax MPCs sub-fields (Phase 5-tax) ---
  if (path.startsWith('post_tax_mpc.')) {
    return applyPostTaxMPCParam(config, path, rawValue, warnings);
  }

  // --- AI Cost Params sub-fields (Phase 5-tax) ---
  if (path.startsWith('ai_cost.')) {
    return applyAICostParam(config, path, rawValue, warnings);
  }

  // --- Adoption Parameters ---
  if (path.startsWith('adoption.')) {
    return applyAdoptionParam(config, path, rawValue, warnings);
  }

  // --- Capability Trajectories ---
  if (path.startsWith('capability.')) {
    return applyCapabilityParam(config, path, rawValue, warnings);
  }

  // --- Policy Configuration ---
  if (path.startsWith('policy.')) {
    return applyPolicyParam(config, path, rawValue, warnings);
  }

  // --- BFCS Threshold Overrides ---
  if (path.startsWith('bfcs.')) {
    return applyBFCSOverride(config, path, rawValue, warnings);
  }

  // --- Supply Chain Config (Phase 9) ---
  if (path.startsWith('supply_chain.')) {
    return applySupplyChainParam(config, path, rawValue, warnings);
  }

  // --- Per-Cluster Parameter Overrides ---
  if (path.startsWith('cluster_override.')) {
    return applyClusterOverrideFromPath(config, path, rawValue, warnings);
  }

  // --- State Policy Overrides ---
  if (path.startsWith('state_override.')) {
    return applyStateOverride(config, path, rawValue, warnings);
  }

  return false;
}

// ============================================================
// Parameter Application Helpers
// ============================================================

function applyFloat(
  obj: Record<string, unknown> | SimulationConfig,
  key: string,
  rawValue: string,
  path: string,
  warnings: string[],
): boolean {
  const v = parseNumber(rawValue);
  if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; }
  (obj as Record<string, unknown>)[key] = v;
  return true;
}

function applyInt(
  obj: Record<string, unknown> | SimulationConfig,
  key: string,
  rawValue: string,
  path: string,
  warnings: string[],
): boolean {
  const v = parseNumber(rawValue);
  if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; }
  (obj as Record<string, unknown>)[key] = Math.round(v);
  return true;
}

function applyAdoptionParam(
  config: SimulationConfig,
  path: string,
  rawValue: string,
  warnings: string[],
): boolean {
  const parts = path.split('.');
  if (parts.length < 2) return false;

  if (parts[1] === 'steepness' && parts.length === 3) {
    const deployType = parts[2] as DeploymentType;
    if (!DEPLOYMENT_TYPES.includes(deployType)) {
      warnings.push(`Unknown deployment type in ${path}: "${deployType}"`);
      return true;
    }
    const v = parseNumber(rawValue);
    if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; }
    config.adoptionParams.steepnessByDeployment[deployType] = v;
    return true;
  }

  if (parts[1] === 'competitive_pressure_multiplier') {
    return applyFloat(config.adoptionParams as unknown as Record<string, unknown>, 'competitivePressureMultiplier', rawValue, path, warnings);
  }
  if (parts[1] === 'competitive_pressure_threshold') {
    return applyFloat(config.adoptionParams as unknown as Record<string, unknown>, 'competitivePressureThreshold', rawValue, path, warnings);
  }
  if (parts[1] === 'geopolitical_risk_factor') {
    return applyFloat(config.adoptionParams as unknown as Record<string, unknown>, 'geopoliticalRiskFactor', rawValue, path, warnings);
  }

  return false;
}

function applyCapabilityParam(
  config: SimulationConfig,
  path: string,
  rawValue: string,
  warnings: string[],
): boolean {
  // capability.{vectorId}.{param}
  const parts = path.split('.');
  if (parts.length !== 3) return false;

  const vecId = parts[1] as CapabilityVectorId;
  if (!CAPABILITY_VECTOR_IDS.includes(vecId)) {
    warnings.push(`Unknown capability vector in ${path}: "${vecId}"`);
    return true;
  }

  const param = parts[2];
  const v = parseNumber(rawValue);
  if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; }

  const cap = config.capabilities[vecId];
  switch (param) {
    case 'floor': cap.floor = v; break;
    case 'ceiling': cap.ceiling = v; break;
    case 'steepness': cap.steepness = v; break;
    case 'midpoint': cap.midpointYear = v; break;
    default:
      warnings.push(`Unknown capability param in ${path}: "${param}"`);
  }
  return true;
}

function applyPolicyParam(
  config: SimulationConfig,
  path: string,
  rawValue: string,
  warnings: string[],
): boolean {
  const parts = path.split('.');
  if (parts.length < 3) return false;

  const policyKey = parts[1]; // e.g., 'minimum_wage', 'ubi', etc.
  const field = parts.slice(2).join('.'); // remaining path

  switch (policyKey) {
    case 'minimum_wage': return applyMinimumWage(config.policyConfig, field, rawValue, path, warnings);
    case 'wage_subsidy': return applyWageSubsidy(config.policyConfig, field, rawValue, path, warnings);
    case 'swf': return applySWF(config.policyConfig, field, rawValue, path, warnings);
    case 'equity': return applyEquity(config.policyConfig, field, rawValue, path, warnings);
    case 'profit_sharing': return applyProfitSharing(config.policyConfig, field, rawValue, path, warnings);
    case 'ubi': return applyUBI(config.policyConfig, field, rawValue, path, warnings);
    case 'enhanced_ui': return applyEnhancedUI(config.policyConfig, field, rawValue, path, warnings);
    case 'retraining': return applyRetraining(config.policyConfig, field, rawValue, path, warnings);
    default: return false;
  }
}

// --- Individual policy applicators ---

function applyMinimumWage(pc: PolicyConfig, field: string, rawValue: string, path: string, warnings: string[]): boolean {
  const mw = pc.minimumWage;
  if (field === 'enabled') { const b = parseBoolean(rawValue); if (b === null) { warnings.push(`Invalid boolean for ${path}: "${rawValue}"`); return true; } mw.enabled = b; return true; }
  if (field === 'federal_minimum') { const s = parseSchedule(rawValue); if (s === null) { warnings.push(`Invalid schedule for ${path}: "${rawValue}"`); return true; } mw.federalMinimum = s; return true; }
  if (field === 'indexed_to_inflation') { const b = parseBoolean(rawValue); if (b === null) { warnings.push(`Invalid boolean for ${path}: "${rawValue}"`); return true; } mw.indexedToInflation = b; return true; }
  if (field === 'indexed_to_productivity') { const b = parseBoolean(rawValue); if (b === null) { warnings.push(`Invalid boolean for ${path}: "${rawValue}"`); return true; } mw.indexedToProductivity = b; return true; }
  // state_override.{StateCode}
  if (field.startsWith('state_override.')) {
    const stateCode = field.split('.')[1];
    if (!stateCode || !ALL_STATE_CODES_SET.has(stateCode)) { warnings.push(`Unknown state code in ${path}: "${stateCode}"`); return true; }
    const v = parseNumber(rawValue);
    if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; }
    mw.stateOverrides[stateCode] = v;
    return true;
  }
  return false;
}

function applyWageSubsidy(pc: PolicyConfig, field: string, rawValue: string, path: string, warnings: string[]): boolean {
  const ws = pc.wageSubsidy;
  if (field === 'enabled') { const b = parseBoolean(rawValue); if (b === null) { warnings.push(`Invalid boolean for ${path}: "${rawValue}"`); return true; } ws.enabled = b; return true; }
  if (field === 'subsidy_percentage') { const s = parseSchedule(rawValue); if (s === null) { warnings.push(`Invalid schedule for ${path}: "${rawValue}"`); return true; } ws.subsidyPercentage = s; return true; }
  if (field === 'max_per_worker') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } ws.maxSubsidyPerWorker = v; return true; }
  if (field === 'phase_out_threshold') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } ws.phaseOutThreshold = v; return true; }
  return false;
}

function applySWF(pc: PolicyConfig, field: string, rawValue: string, path: string, warnings: string[]): boolean {
  const swf = pc.sovereignWealthFund;
  if (field === 'enabled') { const b = parseBoolean(rawValue); if (b === null) { warnings.push(`Invalid boolean for ${path}: "${rawValue}"`); return true; } swf.enabled = b; return true; }
  if (field === 'initial_fund_size') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } swf.initialFundSize = v; return true; }
  if (field === 'annual_contribution') { const s = parseSchedule(rawValue); if (s === null) { warnings.push(`Invalid schedule for ${path}: "${rawValue}"`); return true; } swf.annualContribution = s; return true; }
  if (field === 'expected_return') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } swf.annualReturnRate = v; return true; }
  if (field === 'distribution_rate') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } swf.distributionRate = v; return true; }
  if (field === 'distribution') {
    const v = rawValue.trim();
    if (!SWF_DISTRIBUTIONS.includes(v as typeof SWF_DISTRIBUTIONS[number])) { warnings.push(`Invalid enum for ${path}: "${v}". Expected: universal, means_tested`); return true; }
    swf.distribution = v as 'universal' | 'means_tested';
    return true;
  }
  return false;
}

// Phase 5g: equity fields merged into SWF — applyEquity redirects to sovereignWealthFund
function applyEquity(pc: PolicyConfig, field: string, rawValue: string, path: string, warnings: string[]): boolean {
  const swf = pc.sovereignWealthFund;
  if (field === 'enabled') { const b = parseBoolean(rawValue); if (b === null) { warnings.push(`Invalid boolean for ${path}: "${rawValue}"`); return true; } swf.enabled = b; return true; }
  if (field === 'ownership_fraction') { const s = parseSchedule(rawValue); if (s === null) { warnings.push(`Invalid schedule for ${path}: "${rawValue}"`); return true; } swf.ownershipFraction = s; return true; }
  if (field === 'total_ai_profits') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } swf.totalAICompanyProfits = v; return true; }
  if (field === 'profit_growth_rate') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } swf.profitGrowthRate = v; return true; }
  if (field === 'distribution_method') {
    const v = rawValue.trim();
    if (!EQUITY_DISTRIBUTIONS.includes(v as typeof EQUITY_DISTRIBUTIONS[number])) { warnings.push(`Invalid enum for ${path}: "${v}". Expected: equal, progressive`); return true; }
    swf.distributionMethod = v as 'equal' | 'progressive';
    return true;
  }
  return false;
}

function applyProfitSharing(pc: PolicyConfig, field: string, rawValue: string, path: string, warnings: string[]): boolean {
  const ps = pc.profitSharing;
  if (field === 'enabled') { const b = parseBoolean(rawValue); if (b === null) { warnings.push(`Invalid boolean for ${path}: "${rawValue}"`); return true; } ps.enabled = b; return true; }
  if (field === 'mandatory_percentage') { const s = parseSchedule(rawValue); if (s === null) { warnings.push(`Invalid schedule for ${path}: "${rawValue}"`); return true; } ps.mandatorySharePercentage = s; return true; }
  if (field === 'revenue_threshold') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } ps.companyRevenueThreshold = v; return true; }
  if (field === 'distribution_scope') {
    const v = rawValue.trim();
    if (!PROFIT_SHARING_SCOPES.includes(v as typeof PROFIT_SHARING_SCOPES[number])) { warnings.push(`Invalid enum for ${path}: "${v}". Expected: employees_only, community, national`); return true; }
    ps.distributionScope = v as 'employees_only' | 'community' | 'national';
    return true;
  }
  return false;
}

function applyUBI(pc: PolicyConfig, field: string, rawValue: string, path: string, warnings: string[]): boolean {
  const ubi = pc.ubi;
  if (field === 'enabled') { const b = parseBoolean(rawValue); if (b === null) { warnings.push(`Invalid boolean for ${path}: "${rawValue}"`); return true; } ubi.enabled = b; return true; }
  if (field === 'monthly_amount') { const s = parseSchedule(rawValue); if (s === null) { warnings.push(`Invalid schedule for ${path}: "${rawValue}"`); return true; } ubi.monthlyAmount = s; return true; }
  if (field === 'age_threshold') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } ubi.ageThreshold = Math.round(v); return true; }
  // Phase 5g UBI mode fields
  if (field === 'mode') {
    const v = rawValue.trim();
    if (v !== 'manual' && v !== 'indexed') { warnings.push(`Invalid UBI mode for ${path}: "${v}". Expected: manual, indexed`); return true; }
    ubi.mode = v;
    return true;
  }
  if (field === 'indexed_base_amount') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } ubi.indexedBaseAmount = v; return true; }
  if (field === 'indexed_start_year') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } ubi.indexedStartYear = Math.round(v); return true; }
  if (field === 'productivity_index_rate') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } ubi.productivityIndexRate = v; return true; }
  if (field === 'indexed_to_inflation') { const b = parseBoolean(rawValue); if (b === null) { warnings.push(`Invalid boolean for ${path}: "${rawValue}"`); return true; } ubi.indexedToInflation = b; return true; }
  if (field === 'indexed_to_productivity') { const b = parseBoolean(rawValue); if (b === null) { warnings.push(`Invalid boolean for ${path}: "${rawValue}"`); return true; } ubi.indexedToProductivity = b; return true; }
  return false;
}

function applyEnhancedUI(pc: PolicyConfig, field: string, rawValue: string, path: string, warnings: string[]): boolean {
  const ui = pc.enhancedUI;
  if (field === 'enabled') { const b = parseBoolean(rawValue); if (b === null) { warnings.push(`Invalid boolean for ${path}: "${rawValue}"`); return true; } ui.enabled = b; return true; }
  if (field === 'replacement_rate') { const s = parseSchedule(rawValue); if (s === null) { warnings.push(`Invalid schedule for ${path}: "${rawValue}"`); return true; } ui.replacementRate = s; return true; }
  if (field === 'duration_weeks') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } ui.durationWeeks = Math.round(v); return true; }
  if (field === 'retraining_bonus') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } ui.retrainingBonus = v; return true; }
  // state_override.{StateCode}.{field}
  if (field.startsWith('state_override.')) {
    const subParts = field.split('.');
    if (subParts.length < 3) return false;
    const stateCode = subParts[1]!;
    const subField = subParts[2]!;
    if (!ALL_STATE_CODES_SET.has(stateCode)) { warnings.push(`Unknown state code in ${path}: "${stateCode}"`); return true; }
    if (!ui.stateOverrides[stateCode]) {
      ui.stateOverrides[stateCode] = {};
    }
    const stateOv = ui.stateOverrides[stateCode]!;
    if (subField === 'replacement_rate') { const s = parseSchedule(rawValue); if (s === null) { warnings.push(`Invalid schedule for ${path}: "${rawValue}"`); return true; } stateOv.replacementRate = s; return true; }
    if (subField === 'duration_weeks') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } stateOv.durationWeeks = Math.round(v); return true; }
    if (subField === 'retraining_bonus') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } stateOv.retrainingBonus = v; return true; }
    warnings.push(`Unknown enhanced UI state override field in ${path}: "${subField}"`);
    return true;
  }
  return false;
}

function applyRetraining(pc: PolicyConfig, field: string, rawValue: string, path: string, warnings: string[]): boolean {
  const rt = pc.retraining;
  if (field === 'enabled') { const b = parseBoolean(rawValue); if (b === null) { warnings.push(`Invalid boolean for ${path}: "${rawValue}"`); return true; } rt.enabled = b; return true; }
  if (field === 'stipend_monthly') { const s = parseSchedule(rawValue); if (s === null) { warnings.push(`Invalid schedule for ${path}: "${rawValue}"`); return true; } rt.stipendMonthly = s; return true; }
  if (field === 'duration_months') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } rt.durationMonths = Math.round(v); return true; }
  if (field === 'effectiveness_rate') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } rt.effectivenessRate = v; return true; }
  if (field === 'participation_rate') { const v = parseNumber(rawValue); if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; } rt.participationRate = v; return true; }
  if (field === 'target_clusters') {
    const clusters = rawValue.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const validClusters: string[] = [];
    for (const c of clusters) {
      if (CLUSTER_ROLE_LOOKUP.has(c)) {
        validClusters.push(c);
      } else {
        warnings.push(`Unknown cluster ID in ${path}: "${c}"`);
      }
    }
    rt.targetClusters = validClusters;
    return true;
  }
  return false;
}

// --- Tax Config sub-handler (Phase 5-tax) ---

function applyTaxConfigParam(
  config: SimulationConfig,
  path: string,
  rawValue: string,
  warnings: string[],
): boolean {
  const field = path.slice('tax_config.'.length);
  if (!config.taxConfig) {
    config.taxConfig = {
      incomeTaxRate: BASELINE_INCOME_TAX_RATE,
      payrollTaxRate: BASELINE_PAYROLL_RATE,
      corporateTaxRate: BASELINE_CORPORATE_TAX_RATE,
      capitalGainsTaxRate: BASELINE_CAPITAL_GAINS_RATE,
    };
  }
  const tc = config.taxConfig as unknown as Record<string, unknown>;
  if (field === 'income_tax_rate') return applyFloat(tc, 'incomeTaxRate', rawValue, path, warnings);
  if (field === 'payroll_tax_rate') return applyFloat(tc, 'payrollTaxRate', rawValue, path, warnings);
  if (field === 'corporate_tax_rate') return applyFloat(tc, 'corporateTaxRate', rawValue, path, warnings);
  if (field === 'capital_gains_tax_rate') return applyFloat(tc, 'capitalGainsTaxRate', rawValue, path, warnings);
  return false;
}

// --- Post-Tax MPCs sub-handler (Phase 5-tax) ---

function applyPostTaxMPCParam(
  config: SimulationConfig,
  path: string,
  rawValue: string,
  warnings: string[],
): boolean {
  const field = path.slice('post_tax_mpc.'.length);
  if (!config.postTaxMPCs) {
    config.postTaxMPCs = {
      wage: DEFAULT_POST_TAX_MPC_WAGE,
      asset: DEFAULT_POST_TAX_MPC_ASSET,
      transfer: DEFAULT_POST_TAX_MPC_TRANSFER,
    };
  }
  const mpc = config.postTaxMPCs as unknown as Record<string, unknown>;
  if (field === 'wage') return applyFloat(mpc, 'wage', rawValue, path, warnings);
  if (field === 'asset') return applyFloat(mpc, 'asset', rawValue, path, warnings);
  if (field === 'transfer') return applyFloat(mpc, 'transfer', rawValue, path, warnings);
  return false;
}

// --- AI Cost Params sub-handler (Phase 5-tax) ---

function applyAICostParam(
  config: SimulationConfig,
  path: string,
  rawValue: string,
  warnings: string[],
): boolean {
  const field = path.slice('ai_cost.'.length);
  if (!config.aiCostParams) {
    config.aiCostParams = {
      inferenceAnnualChange: DEFAULT_INFERENCE_ANNUAL_CHANGE,
      manufacturingAnnualChange: DEFAULT_MANUFACTURING_ANNUAL_CHANGE,
      energyAnnualChange: DEFAULT_ENERGY_ANNUAL_CHANGE,
    };
  }
  const ac = config.aiCostParams as unknown as Record<string, unknown>;
  if (field === 'inference_annual_change') return applyFloat(ac, 'inferenceAnnualChange', rawValue, path, warnings);
  if (field === 'manufacturing_annual_change') return applyFloat(ac, 'manufacturingAnnualChange', rawValue, path, warnings);
  if (field === 'energy_annual_change') return applyFloat(ac, 'energyAnnualChange', rawValue, path, warnings);
  return false;
}

// --- Supply Chain Config sub-handler (Phase 9) ---

function applySupplyChainParam(
  config: SimulationConfig,
  path: string,
  rawValue: string,
  warnings: string[],
): boolean {
  const field = path.slice('supply_chain.'.length);
  if (!config.supplyChainConfig) {
    config.supplyChainConfig = getDefaultSupplyChainConfig();
  }
  const sc = config.supplyChainConfig;

  // --- Supply inputs ---
  if (field === 'ai_chips') { const v = parseNumber(rawValue); if (v !== null) sc.inputs.aiChips = v; return true; }
  if (field === 'energy_price') { const v = parseNumber(rawValue); if (v !== null) sc.inputs.energyPrice = v; return true; }
  if (field === 'energy_capacity') { const v = parseNumber(rawValue); if (v !== null) sc.inputs.energyCapacity = v; return true; }
  if (field === 'training_dc_capacity') { const v = parseNumber(rawValue); if (v !== null) sc.inputs.trainingDCCapacity = v; return true; }
  if (field === 'inference_dc_capacity') { const v = parseNumber(rawValue); if (v !== null) sc.inputs.inferenceDCCapacity = v; return true; }
  if (field === 'robotics_hardware') { const v = parseNumber(rawValue); if (v !== null) sc.inputs.roboticsHardware = v; return true; }
  if (field === 'software_efficiency') { const v = parseNumber(rawValue); if (v !== null) sc.inputs.softwareEfficiency = v; return true; }

  // --- Economics ---
  if (field === 'cost_pass_through') { const v = parseNumber(rawValue); if (v !== null) sc.costPassThroughRate = v; return true; }
  if (field === 'consumer_pass_through') { const v = parseNumber(rawValue); if (v !== null) sc.consumerPassThroughRate = v; return true; }

  // --- Resilience ---
  if (field === 'resilience_chips') { const v = parseNumber(rawValue); if (v !== null) sc.resilience.aiChips = v; return true; }
  if (field === 'resilience_energy') { const v = parseNumber(rawValue); if (v !== null) sc.resilience.energy = v; return true; }
  if (field === 'resilience_training_dc') { const v = parseNumber(rawValue); if (v !== null) sc.resilience.trainingDC = v; return true; }
  if (field === 'resilience_inference_dc') { const v = parseNumber(rawValue); if (v !== null) sc.resilience.inferenceDC = v; return true; }
  if (field === 'resilience_robotics') { const v = parseNumber(rawValue); if (v !== null) sc.resilience.roboticsHardware = v; return true; }

  // --- Training composition ---
  if (field === 'training_comp_chips') { const v = parseNumber(rawValue); if (v !== null) sc.trainingComposition.aiChips = v; return true; }
  if (field === 'training_comp_energy') { const v = parseNumber(rawValue); if (v !== null) sc.trainingComposition.energy = v; return true; }
  if (field === 'training_comp_dc') { const v = parseNumber(rawValue); if (v !== null) sc.trainingComposition.datacenter = v; return true; }
  if (field === 'training_scale_growth') { const v = parseNumber(rawValue); if (v !== null) sc.trainingScaleGrowthRate = v; return true; }

  // --- Cascade ---
  if (field === 'cascade_lag') { const v = parseNumber(rawValue); if (v !== null) sc.chipCascadeLag = v; return true; }
  if (field === 'cascade_premium') { const v = parseNumber(rawValue); if (v !== null) sc.chipCascadeCostPremium = v; return true; }

  // --- Hysteresis ---
  if (field === 'hysteresis_cognitive') { const v = parseNumber(rawValue); if (v !== null) sc.hysteresisMaxCognitive = v; return true; }
  if (field === 'hysteresis_embodied') { const v = parseNumber(rawValue); if (v !== null) sc.hysteresisMaxEmbodied = v; return true; }

  // --- Regulatory friction ---
  if (field === 'regulatory_friction') { const v = parseNumber(rawValue); if (v !== null) sc.regulatoryFriction = v; return true; }

  // --- Training dynamics ---
  if (field === 'chip_tech_decline') { const v = parseNumber(rawValue); if (v !== null) sc.trainingDynamics.aiChips.techDeclineRate = v; return true; }
  if (field === 'energy_tech_decline') { const v = parseNumber(rawValue); if (v !== null) sc.trainingDynamics.energy.techDeclineRate = v; return true; }
  if (field === 'dc_tech_decline') { const v = parseNumber(rawValue); if (v !== null) sc.trainingDynamics.datacenter.techDeclineRate = v; return true; }
  if (field === 'chip_scale_pressure') { const v = parseNumber(rawValue); if (v !== null) sc.trainingDynamics.aiChips.scalePressure = v; return true; }
  if (field === 'energy_scale_pressure') { const v = parseNumber(rawValue); if (v !== null) sc.trainingDynamics.energy.scalePressure = v; return true; }
  if (field === 'dc_scale_pressure') { const v = parseNumber(rawValue); if (v !== null) sc.trainingDynamics.datacenter.scalePressure = v; return true; }

  // --- Procurement shares ---
  if (field === 'procurement_chips') { const v = parseNumber(rawValue); if (v !== null) sc.procurementShares.aiChips = v; return true; }
  if (field === 'procurement_energy') { const v = parseNumber(rawValue); if (v !== null) sc.procurementShares.energy = v; return true; }
  if (field === 'procurement_dc') { const v = parseNumber(rawValue); if (v !== null) sc.procurementShares.datacenter = v; return true; }

  // --- Cost vs procurement blend ---
  if (field === 'cost_procurement_blend') { const v = parseNumber(rawValue); if (v !== null) sc.costVsProcurementBlend = v; return true; }

  // --- Sensitivity blend ---
  if (field === 'sensitivity_blend_cognitive') { const v = parseNumber(rawValue); if (v !== null) sc.sensitivityBlendCognitive = v; return true; }
  if (field === 'sensitivity_blend_embodied') { const v = parseNumber(rawValue); if (v !== null) sc.sensitivityBlendEmbodied = v; return true; }

  warnings.push(`Unknown supply_chain field: ${field}`);
  return true;
}

// --- Fiscal Response Profile custom overrides (Phase 8a) ---

function applyFiscalResponseParam(
  config: SimulationConfig,
  path: string,
  rawValue: string,
  warnings: string[],
): boolean {
  const field = path.slice('fiscal_response.'.length);
  if (!config.fiscalPolicyCustom) config.fiscalPolicyCustom = {};
  const custom = config.fiscalPolicyCustom as Record<string, unknown>;
  const mapping: Record<string, string> = {
    max_discretionary_cut: 'maxDiscretionaryCut',
    max_obligation_cut: 'maxObligationCut',
    max_revenue_increase: 'maxRevenueIncrease',
    qe_monetization_rate: 'qeMonetizationRate',
    max_financial_repression_rate: 'maxFinancialRepressionRate',
    cola_dampening_rate: 'colaDampeningRate',
    cola_dampening_threshold: 'colaDampeningThreshold',
    cola_dampening_max_cif: 'colaDampeningMaxCIF',
    consolidation_threshold: 'consolidationThreshold',
    consolidation_max_threshold: 'consolidationMaxThreshold',
    consolidation_lag: 'consolidationLag',
    yield_response_threshold: 'yieldResponseThreshold',
    max_yield_response_rate: 'maxYieldResponseRate',
  };
  const key = mapping[field];
  if (!key) { warnings.push(`Unknown fiscal response field: "${field}"`); return true; }
  const v = parseNumber(rawValue);
  if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; }
  custom[key] = v;
  return true;
}

// --- Per-Cluster Parameter Overrides ---

/** Valid cluster override field names and their validation rules. */
const CLUSTER_OVERRIDE_FIELDS: Record<string, {
  key: keyof import('@/types').ClusterParameterOverride;
  validate: (v: number) => boolean;
  error: string;
}> = {
  generative_weight: { key: 'generativeWeight', validate: v => v >= 0 && v <= 1, error: 'must be 0-1' },
  agentic_weight: { key: 'agenticWeight', validate: v => v >= 0 && v <= 1, error: 'must be 0-1' },
  embodied_weight: { key: 'embodiedWeight', validate: v => v >= 0 && v <= 1, error: 'must be 0-1' },
  adoption_steepness: { key: 'adoptionSteepness', validate: v => v > 0, error: 'must be > 0' },
  adoption_ceiling: { key: 'adoptionCeiling', validate: v => v >= 0 && v <= 1, error: 'must be 0-1' },
  deployment_lag: { key: 'deploymentLag', validate: v => v >= 0, error: 'must be >= 0' },
  wage_elasticity: { key: 'wageElasticity', validate: v => v >= 0 && v <= 1, error: 'must be 0-1' },
  deflation_intensity: { key: 'deflationIntensity', validate: v => v >= 0 && v <= 1, error: 'must be 0-1' },
  max_productivity_multiplier: { key: 'maxProductivityMultiplier', validate: v => v >= 1.0, error: 'must be >= 1.0' },
};

/**
 * Parse a cluster_override.{clusterId}.{field} path and apply it.
 */
function applyClusterOverrideFromPath(
  config: SimulationConfig,
  path: string,
  rawValue: string,
  warnings: string[],
): boolean {
  // cluster_override.{clusterId}.{field}
  const parts = path.split('.');
  if (parts.length !== 3) {
    warnings.push(`Invalid cluster_override path format: "${path}". Expected: cluster_override.{clusterId}.{field}`);
    return true;
  }

  const clusterId = parts[1]!;
  const field = parts[2]!;
  return applyClusterOverride(config, clusterId, field, rawValue, path, warnings);
}

/**
 * Apply a single cluster override field (shared by cluster_override.* and deflation_intensity.* alias).
 */
function applyClusterOverride(
  config: SimulationConfig,
  clusterId: string,
  field: string,
  rawValue: string,
  path: string,
  warnings: string[],
): boolean {
  // Validate cluster exists
  if (!CLUSTER_ROLE_LOOKUP.has(clusterId)) {
    warnings.push(`Unrecognized cluster in ${path}: "${clusterId}"`);
    return true;
  }

  // Validate field
  const fieldSpec = CLUSTER_OVERRIDE_FIELDS[field];
  if (!fieldSpec) {
    warnings.push(`Unknown cluster override field in ${path}: "${field}". Valid fields: ${Object.keys(CLUSTER_OVERRIDE_FIELDS).join(', ')}`);
    return true;
  }

  // Parse value
  const v = parseNumber(rawValue);
  if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; }

  // Validate range
  if (!fieldSpec.validate(v)) {
    warnings.push(`Value for ${path} ${fieldSpec.error}, got ${v}`);
    return true;
  }

  // Initialize clusterOverrides if needed
  if (!config.clusterOverrides) config.clusterOverrides = {};
  if (!config.clusterOverrides[clusterId]) config.clusterOverrides[clusterId] = {};
  config.clusterOverrides[clusterId][fieldSpec.key] = v;

  return true;
}

// --- BFCS Overrides ---

// Temporary storage for partial BFCS overrides before finalization
function applyBFCSOverride(
  config: SimulationConfig,
  path: string,
  rawValue: string,
  warnings: string[],
): boolean {
  // bfcs.{clusterId}.{roleId}.{dimension}
  const parts = path.split('.');
  if (parts.length !== 4) {
    warnings.push(`Invalid BFCS path format: "${path}". Expected: bfcs.{clusterId}.{roleId}.{dimension}`);
    return true;
  }

  const clusterId = parts[1]!;
  const roleId = parts[2]!;
  const dimension = parts[3]! as keyof BFCSThresholds;

  // Validate cluster
  const clusterRoles = CLUSTER_ROLE_LOOKUP.get(clusterId);
  if (!clusterRoles) {
    warnings.push(`Unrecognized cluster in ${path}: "${clusterId}"`);
    return true;
  }

  // Validate role
  if (!clusterRoles.has(roleId)) {
    warnings.push(`Unrecognized role in ${path}: "${roleId}" (cluster: ${clusterId})`);
    return true;
  }

  // Validate dimension
  if (!BFCS_DIMENSIONS.includes(dimension)) {
    warnings.push(`Invalid BFCS dimension in ${path}: "${dimension}". Expected: better, faster, cheaper, safer`);
    return true;
  }

  const v = parseNumber(rawValue);
  if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; }

  // Build override structure
  if (!config.bfcsOverrides[clusterId]) {
    config.bfcsOverrides[clusterId] = {};
  }
  if (!config.bfcsOverrides[clusterId][roleId]) {
    // Initialize with null markers — will be filled from defaults in finalizeBFCSOverrides
    config.bfcsOverrides[clusterId][roleId] = {
      better: -1,
      faster: -1,
      cheaper: -1,
      safer: -1,
    };
  }
  config.bfcsOverrides[clusterId][roleId][dimension] = v;

  return true;
}

/**
 * For each partial BFCS override, fill in any unset dimensions (-1)
 * from the cluster's default thresholds in occupationClusters.ts.
 */
function finalizeBFCSOverrides(config: SimulationConfig): void {
  for (const [clusterId, roles] of Object.entries(config.bfcsOverrides)) {
    const clusterRoles = CLUSTER_ROLE_LOOKUP.get(clusterId);
    if (!clusterRoles) continue;

    for (const [roleId, thresholds] of Object.entries(roles)) {
      const defaults = clusterRoles.get(roleId);
      if (!defaults) continue;

      for (const dim of BFCS_DIMENSIONS) {
        if (thresholds[dim] === -1) {
          thresholds[dim] = defaults[dim];
        }
      }
    }
  }
}

// --- State Overrides ---

function applyStateOverride(
  config: SimulationConfig,
  path: string,
  rawValue: string,
  warnings: string[],
): boolean {
  // state_override.{StateCode}.{field}
  const parts = path.split('.');
  if (parts.length !== 3) {
    warnings.push(`Invalid state override path format: "${path}". Expected: state_override.{StateCode}.{field}`);
    return true;
  }

  const stateCode = parts[1]! as StateCode;
  const field = parts[2]!;

  if (!ALL_STATE_CODES_SET.has(stateCode)) {
    warnings.push(`Unknown state code in ${path}: "${stateCode}"`);
    return true;
  }

  if (!config.stateOverrides[stateCode]) {
    config.stateOverrides[stateCode] = {};
  }
  const so = config.stateOverrides[stateCode];

  if (field === 'minimum_wage') {
    const v = parseNumber(rawValue);
    if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; }
    so.minimumWage = v;
    return true;
  }
  if (field === 'additional_ubi') {
    const v = parseNumber(rawValue);
    if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; }
    so.additionalUBI = v;
    return true;
  }
  if (field === 'ui_replacement_rate') {
    const v = parseNumber(rawValue);
    if (v === null) { warnings.push(`Invalid number for ${path}: "${rawValue}"`); return true; }
    so.uiReplacementRate = v;
    return true;
  }
  if (field === 'av_regulatory') {
    const v = rawValue.trim() as typeof REGULATORY_ENVS[number];
    if (!REGULATORY_ENVS.includes(v)) { warnings.push(`Invalid regulatory env in ${path}: "${v}". Expected: permissive, moderate, restrictive`); return true; }
    so.avRegulatoryEnvironment = v;
    return true;
  }
  if (field === 'robotics_regulatory') {
    const v = rawValue.trim() as typeof REGULATORY_ENVS[number];
    if (!REGULATORY_ENVS.includes(v)) { warnings.push(`Invalid regulatory env in ${path}: "${v}". Expected: permissive, moderate, restrictive`); return true; }
    so.roboticsRegulatoryEnvironment = v;
    return true;
  }

  warnings.push(`Unknown state override field in ${path}: "${field}"`);
  return true;
}

// ============================================================
// exportConfigToParameterCSV
// ============================================================

/**
 * Export a SimulationConfig as a two-column CSV (parameter_path, value).
 * This is the inverse of buildConfigFromCSV.
 * Always writes all non-override params (~90 rows).
 * Only writes BFCS/state overrides that are present in the config.
 */
export function exportConfigToParameterCSV(config: SimulationConfig): string {
  const lines: string[] = ['parameter_path,value'];

  // --- Global / Timeline ---
  lines.push(`start_year,${config.startYear}`);
  lines.push(`end_year,${config.endYear}`);

  // --- Macro Parameters ---
  lines.push(`base_inflation_rate,${config.baseInflationRate}`);
  lines.push(`baseline_gdp_growth,${config.baselineGDPGrowth}`);

  // --- Population ---
  lines.push(`total_population,${config.totalPopulation}`);
  lines.push(`labor_force,${config.laborForce}`);
  lines.push(`population_growth_rate,${config.populationGrowthRate ?? 0.004}`);

  // --- New Job Creation ---
  lines.push(`innovation_rate,${config.innovationRate}`);
  lines.push(`rd_multiplier,${config.rdMultiplier}`);
  lines.push(`job_persistence_factor,${config.jobPersistenceFactor}`);

  // --- Adoption Parameters ---
  for (const dt of DEPLOYMENT_TYPES) {
    lines.push(`adoption.steepness.${dt},${config.adoptionParams.steepnessByDeployment[dt]}`);
  }
  lines.push(`adoption.competitive_pressure_multiplier,${config.adoptionParams.competitivePressureMultiplier}`);
  lines.push(`adoption.competitive_pressure_threshold,${config.adoptionParams.competitivePressureThreshold}`);
  lines.push(`adoption.geopolitical_risk_factor,${config.adoptionParams.geopoliticalRiskFactor}`);

  // --- Capability Trajectories ---
  for (const vecId of CAPABILITY_VECTOR_IDS) {
    const cap = config.capabilities[vecId];
    lines.push(`capability.${vecId}.floor,${cap.floor}`);
    lines.push(`capability.${vecId}.ceiling,${cap.ceiling}`);
    lines.push(`capability.${vecId}.steepness,${cap.steepness}`);
    lines.push(`capability.${vecId}.midpoint,${cap.midpointYear}`);
  }

  // --- Policy: Minimum Wage ---
  const mw = config.policyConfig.minimumWage;
  lines.push(`policy.minimum_wage.enabled,${mw.enabled}`);
  lines.push(`policy.minimum_wage.federal_minimum,${csvQuoteSchedule(mw.federalMinimum)}`);
  lines.push(`policy.minimum_wage.indexed_to_inflation,${mw.indexedToInflation}`);
  lines.push(`policy.minimum_wage.indexed_to_productivity,${mw.indexedToProductivity}`);
  for (const [sc, val] of Object.entries(mw.stateOverrides)) {
    lines.push(`policy.minimum_wage.state_override.${sc},${val}`);
  }

  // --- Policy: Wage Subsidy ---
  const ws = config.policyConfig.wageSubsidy;
  lines.push(`policy.wage_subsidy.enabled,${ws.enabled}`);
  lines.push(`policy.wage_subsidy.subsidy_percentage,${csvQuoteSchedule(ws.subsidyPercentage)}`);
  lines.push(`policy.wage_subsidy.max_per_worker,${ws.maxSubsidyPerWorker}`);
  lines.push(`policy.wage_subsidy.phase_out_threshold,${ws.phaseOutThreshold}`);

  // --- Policy: SWF ---
  const swf = config.policyConfig.sovereignWealthFund;
  lines.push(`policy.swf.enabled,${swf.enabled}`);
  lines.push(`policy.swf.initial_fund_size,${swf.initialFundSize}`);
  lines.push(`policy.swf.annual_contribution,${csvQuoteSchedule(swf.annualContribution)}`);
  lines.push(`policy.swf.expected_return,${swf.annualReturnRate}`);
  lines.push(`policy.swf.distribution_rate,${swf.distributionRate}`);
  lines.push(`policy.swf.distribution,${swf.distribution}`);

  // --- Policy: Universal Equity (Phase 5g: fields merged into SWF) ---
  const eqSwf = config.policyConfig.sovereignWealthFund;
  lines.push(`policy.equity.enabled,${eqSwf.enabled}`);
  lines.push(`policy.equity.ownership_fraction,${csvQuoteSchedule(eqSwf.ownershipFraction)}`);
  lines.push(`policy.equity.total_ai_profits,${eqSwf.totalAICompanyProfits}`);
  lines.push(`policy.equity.profit_growth_rate,${eqSwf.profitGrowthRate}`);
  lines.push(`policy.equity.distribution_method,${eqSwf.distributionMethod}`);

  // --- Policy: Profit Sharing ---
  const ps = config.policyConfig.profitSharing;
  lines.push(`policy.profit_sharing.enabled,${ps.enabled}`);
  lines.push(`policy.profit_sharing.mandatory_percentage,${csvQuoteSchedule(ps.mandatorySharePercentage)}`);
  lines.push(`policy.profit_sharing.revenue_threshold,${ps.companyRevenueThreshold}`);
  lines.push(`policy.profit_sharing.distribution_scope,${ps.distributionScope}`);

  // --- Policy: UBI ---
  const ubi = config.policyConfig.ubi;
  lines.push(`policy.ubi.enabled,${ubi.enabled}`);
  lines.push(`policy.ubi.monthly_amount,${csvQuoteSchedule(ubi.monthlyAmount)}`);
  lines.push(`policy.ubi.age_threshold,${ubi.ageThreshold}`);
  lines.push(`policy.ubi.mode,${ubi.mode}`);
  lines.push(`policy.ubi.indexed_base_amount,${ubi.indexedBaseAmount ?? 1000}`);
  lines.push(`policy.ubi.indexed_start_year,${ubi.indexedStartYear ?? 2032}`);
  lines.push(`policy.ubi.productivity_index_rate,${ubi.productivityIndexRate ?? 1.0}`);
  lines.push(`policy.ubi.indexed_to_inflation,${ubi.indexedToInflation}`);
  lines.push(`policy.ubi.indexed_to_productivity,${ubi.indexedToProductivity}`);

  // --- Policy: Enhanced UI ---
  const eui = config.policyConfig.enhancedUI;
  lines.push(`policy.enhanced_ui.enabled,${eui.enabled}`);
  lines.push(`policy.enhanced_ui.replacement_rate,${csvQuoteSchedule(eui.replacementRate)}`);
  lines.push(`policy.enhanced_ui.duration_weeks,${eui.durationWeeks}`);
  lines.push(`policy.enhanced_ui.retraining_bonus,${eui.retrainingBonus}`);
  for (const [sc, ov] of Object.entries(eui.stateOverrides)) {
    if (ov.replacementRate !== undefined) lines.push(`policy.enhanced_ui.state_override.${sc}.replacement_rate,${csvQuoteSchedule(ov.replacementRate)}`);
    if (ov.durationWeeks !== undefined) lines.push(`policy.enhanced_ui.state_override.${sc}.duration_weeks,${ov.durationWeeks}`);
    if (ov.retrainingBonus !== undefined) lines.push(`policy.enhanced_ui.state_override.${sc}.retraining_bonus,${ov.retrainingBonus}`);
  }

  // --- Policy: Retraining ---
  const rt = config.policyConfig.retraining;
  lines.push(`policy.retraining.enabled,${rt.enabled}`);
  lines.push(`policy.retraining.stipend_monthly,${csvQuoteSchedule(rt.stipendMonthly)}`);
  lines.push(`policy.retraining.duration_months,${rt.durationMonths}`);
  lines.push(`policy.retraining.effectiveness_rate,${rt.effectivenessRate}`);
  lines.push(`policy.retraining.participation_rate,${rt.participationRate}`);
  lines.push(`policy.retraining.target_clusters,${rt.targetClusters.join(',')}`);

  // --- Second-Order Effect Parameters ---
  lines.push(`demand_feedback_sensitivity,${config.demandFeedbackSensitivity ?? 1.5}`);
  lines.push(`credit_ue_sensitivity,${config.creditUESensitivity ?? 8.0}`);
  lines.push(`credit_investment_sensitivity,${config.creditInvestmentSensitivity ?? 0.35}`);
  lines.push(`credit_consumption_sensitivity,${config.creditConsumptionSensitivity ?? 0.06}`);

  // --- Labor Supply Response Parameters (Phase 5g Step 12) ---
  lines.push(`participation_elasticity,${config.participationElasticity ?? 0.15}`);
  lines.push(`participation_threshold,${config.participationThreshold ?? 0.60}`);

  // --- Dynamic Money Velocity Parameters (Phase 5g) ---
  lines.push(`velocity_sensitivity,${config.velocitySensitivity ?? 0.03}`);

  // --- Phase 5h: other_uncategorized multiplier override ---
  // NOTE: undefined = auto mode (employment-weighted average). Only exported when explicitly set.
  if (config.otherUncategorizedMultiplierOverride !== undefined) lines.push(`other_uncategorized_multiplier_override,${config.otherUncategorizedMultiplierOverride}`);

  // --- AI Production Parameters (Phase 2) ---
  lines.push(`ai_production_investment_fraction,${config.aiProductionInvestmentFraction ?? 0.30}`);
  lines.push(`ai_production_onshoring_fraction,${config.aiProductionOnshoringFraction ?? 0.10}`);
  lines.push(`new_job_wage_fraction,${config.newJobWageFraction ?? 0.70}`);

  // --- Feedback Loop Parameters (Phase 1 overhaul) ---
  lines.push(`revenue_pressure_sensitivity,${config.revenuePressureSensitivity ?? 1.5}`);
  lines.push(`revenue_pressure_cap,${config.revenuePressureCap ?? 0.30}`);
  lines.push(`revenue_pressure_decay,${config.revenuePressureDecay ?? 0.50}`);
  lines.push(`ai_wage_productivity_multiplier,${config.aiWageProductivityMultiplier ?? 0.50}`);

  // --- Phase 5g Corporate Profits & Financial Markets ---
  lines.push(`ai_profit_margin,${config.aiProfitMargin ?? 0.25}`);
  lines.push(`traditional_profit_margin,${config.traditionalProfitMargin ?? 0.11}`);
  // --- Asset Income Decomposition: P/E sensitivity ---
  lines.push(`ai_pe_sensitivity,${config.aiPESensitivity ?? 100}`);
  lines.push(`traditional_pe_sensitivity,${config.traditionalPESensitivity ?? 60}`);

  // --- Phase 5g Minimum Wage Feedback ---
  lines.push(`wage_pass_through,${config.wagePassThrough ?? 0.40}`);
  lines.push(`wage_automation_sensitivity,${config.wageAutomationSensitivity ?? 0.50}`);

  // --- Phase 5g Credit Deflation ---
  lines.push(`credit_deflation_sensitivity,${config.creditDeflationSensitivity ?? 0.04}`);

  // --- Demand Spillover ---
  lines.push(`demand_spillover_tolerance,${config.demandSpilloverTolerance ?? 0.03}`);

  // --- Phase 5g Sector Scarcity Inflation ---
  lines.push(`scarcity_pass_through,${config.scarcityPassThrough ?? 0.30}`);

  // --- Phase 5i Housing & Mortgage ---
  lines.push(`business_credit_gdp_sensitivity,${config.businessCreditGDPSensitivity ?? 5.0}`);
  lines.push(`max_business_credit_loosening,${config.maxBusinessCreditLoosening ?? 0.30}`);
  lines.push(`shelter_cpi_weight,${config.shelterCPIWeight ?? 0.36}`);
  lines.push(`shelter_inflation_stickiness,${config.shelterInflationStickiness ?? 0.80}`);
  lines.push(`mortgage_stress_amplifier,${config.mortgageStressAmplifier ?? 0.40}`);
  lines.push(`foreclosure_lag,${config.foreclosureLag ?? 0.75}`);
  lines.push(`homeownership_recovery_rate,${config.homeownershipRecoveryRate ?? 0.02}`);
  lines.push(`housing_wealth_mpc,${config.housingWealthMPC ?? 0.05}`);
  lines.push(`mpc_wage_ue_sensitivity,${config.mpcWageUESensitivity ?? 0.005}`);
  lines.push(`credit_adoption_sensitivity,${config.creditAdoptionSensitivity ?? 0.15}`);
  // Housing Market Stabilization
  lines.push(`institutional_buyer_rate,${config.institutionalBuyerRate ?? 0.40}`);
  lines.push(`rental_demand_sensitivity,${config.rentalDemandSensitivity ?? 0.50}`);
  lines.push(`shelter_inflation_floor,${config.shelterInflationFloor ?? -0.05}`);

  // --- Income Distribution / Median CWI ---
  lines.push(`bottom_80_wage_share,${config.bottom80WageShare ?? 0.45}`);
  lines.push(`bottom_80_transfer_share,${config.bottom80TransferShare ?? 0.78}`);
  lines.push(`bottom_80_asset_share,${config.bottom80AssetShare ?? 0.12}`);

  // --- Phase 4 Quality Pass Parameters ---
  lines.push(`phillips_curve_sensitivity,${config.phillipsCurveSensitivity ?? 2.5}`);
  lines.push(`max_credit_tightening,${config.maxCreditTightening ?? 0.70}`);
  lines.push(`deferrable_consumption_share,${config.deferrableConsumptionShare ?? 0.30}`);
  lines.push(`deflation_midpoint,${config.deflationMidpoint ?? 0.05}`);
  lines.push(`deflation_steepness,${config.deflationSteepness ?? 40}`);

  // --- Investment Demand Constraint ---
  lines.push(`ai_utilization_sensitivity,${config.aiUtilizationSensitivity ?? 50}`);
  lines.push(`consumer_demand_investment_sensitivity,${config.consumerDemandInvestmentSensitivity ?? 50}`);
  lines.push(`credit_investment_response_sensitivity,${config.creditInvestmentResponseSensitivity ?? 50}`);
  lines.push(`traditional_investment_demand_sensitivity,${config.traditionalInvestmentDemandSensitivity ?? 30}`);
  lines.push(`traditional_investment_gdp_fraction,${config.traditionalInvestmentGDPFraction ?? 0.175}`);

  // --- Tax & Economic Pipeline (Phase 5-tax) ---
  lines.push(`corporate_retention_rate,${config.corporateRetentionRate ?? FALLBACK_CORPORATE_RETENTION_RATE}`);
  lines.push(`ai_profit_growth_rate,${config.aiProfitGrowthRate ?? DEFAULT_AI_PROFIT_GROWTH_RATE}`);

  // --- Tax Config sub-fields ---
  lines.push(`tax_config.income_tax_rate,${config.taxConfig?.incomeTaxRate ?? BASELINE_INCOME_TAX_RATE}`);
  lines.push(`tax_config.payroll_tax_rate,${config.taxConfig?.payrollTaxRate ?? BASELINE_PAYROLL_RATE}`);
  lines.push(`tax_config.corporate_tax_rate,${config.taxConfig?.corporateTaxRate ?? BASELINE_CORPORATE_TAX_RATE}`);
  lines.push(`tax_config.capital_gains_tax_rate,${config.taxConfig?.capitalGainsTaxRate ?? BASELINE_CAPITAL_GAINS_RATE}`);

  // --- Post-Tax MPCs ---
  lines.push(`post_tax_mpc.wage,${config.postTaxMPCs?.wage ?? DEFAULT_POST_TAX_MPC_WAGE}`);
  lines.push(`post_tax_mpc.asset,${config.postTaxMPCs?.asset ?? DEFAULT_POST_TAX_MPC_ASSET}`);
  lines.push(`post_tax_mpc.transfer,${config.postTaxMPCs?.transfer ?? DEFAULT_POST_TAX_MPC_TRANSFER}`);

  // --- AI Cost Params ---
  lines.push(`ai_cost.inference_annual_change,${config.aiCostParams?.inferenceAnnualChange ?? DEFAULT_INFERENCE_ANNUAL_CHANGE}`);
  lines.push(`ai_cost.manufacturing_annual_change,${config.aiCostParams?.manufacturingAnnualChange ?? DEFAULT_MANUFACTURING_ANNUAL_CHANGE}`);
  lines.push(`ai_cost.energy_annual_change,${config.aiCostParams?.energyAnnualChange ?? DEFAULT_ENERGY_ANNUAL_CHANGE}`);

  // --- Phase 9: Supply Chain Config ---
  if (config.supplyChainConfig) {
    const sc = config.supplyChainConfig;
    // Supply inputs
    lines.push(`supply_chain.ai_chips,${sc.inputs.aiChips}`);
    lines.push(`supply_chain.energy_price,${sc.inputs.energyPrice}`);
    lines.push(`supply_chain.energy_capacity,${sc.inputs.energyCapacity}`);
    lines.push(`supply_chain.training_dc_capacity,${sc.inputs.trainingDCCapacity}`);
    lines.push(`supply_chain.inference_dc_capacity,${sc.inputs.inferenceDCCapacity}`);
    lines.push(`supply_chain.robotics_hardware,${sc.inputs.roboticsHardware}`);
    lines.push(`supply_chain.software_efficiency,${sc.inputs.softwareEfficiency}`);
    // Economics
    lines.push(`supply_chain.cost_pass_through,${sc.costPassThroughRate}`);
    lines.push(`supply_chain.consumer_pass_through,${sc.consumerPassThroughRate}`);
    // Resilience
    lines.push(`supply_chain.resilience_chips,${sc.resilience.aiChips}`);
    lines.push(`supply_chain.resilience_energy,${sc.resilience.energy}`);
    lines.push(`supply_chain.resilience_training_dc,${sc.resilience.trainingDC}`);
    lines.push(`supply_chain.resilience_inference_dc,${sc.resilience.inferenceDC}`);
    lines.push(`supply_chain.resilience_robotics,${sc.resilience.roboticsHardware}`);
    // Training composition
    lines.push(`supply_chain.training_comp_chips,${sc.trainingComposition.aiChips}`);
    lines.push(`supply_chain.training_comp_energy,${sc.trainingComposition.energy}`);
    lines.push(`supply_chain.training_comp_dc,${sc.trainingComposition.datacenter}`);
    lines.push(`supply_chain.training_scale_growth,${sc.trainingScaleGrowthRate}`);
    // Cascade
    lines.push(`supply_chain.cascade_lag,${sc.chipCascadeLag}`);
    lines.push(`supply_chain.cascade_premium,${sc.chipCascadeCostPremium}`);
    // Hysteresis
    lines.push(`supply_chain.hysteresis_cognitive,${sc.hysteresisMaxCognitive}`);
    lines.push(`supply_chain.hysteresis_embodied,${sc.hysteresisMaxEmbodied}`);
    // Regulatory friction
    lines.push(`supply_chain.regulatory_friction,${sc.regulatoryFriction}`);
    // Training dynamics
    lines.push(`supply_chain.chip_tech_decline,${sc.trainingDynamics.aiChips.techDeclineRate}`);
    lines.push(`supply_chain.energy_tech_decline,${sc.trainingDynamics.energy.techDeclineRate}`);
    lines.push(`supply_chain.dc_tech_decline,${sc.trainingDynamics.datacenter.techDeclineRate}`);
    lines.push(`supply_chain.chip_scale_pressure,${sc.trainingDynamics.aiChips.scalePressure}`);
    lines.push(`supply_chain.energy_scale_pressure,${sc.trainingDynamics.energy.scalePressure}`);
    lines.push(`supply_chain.dc_scale_pressure,${sc.trainingDynamics.datacenter.scalePressure}`);
    // Procurement shares
    lines.push(`supply_chain.procurement_chips,${sc.procurementShares.aiChips}`);
    lines.push(`supply_chain.procurement_energy,${sc.procurementShares.energy}`);
    lines.push(`supply_chain.procurement_dc,${sc.procurementShares.datacenter}`);
    // Cost vs procurement blend
    lines.push(`supply_chain.cost_procurement_blend,${sc.costVsProcurementBlend}`);
    // Sensitivity blend
    lines.push(`supply_chain.sensitivity_blend_cognitive,${sc.sensitivityBlendCognitive}`);
    lines.push(`supply_chain.sensitivity_blend_embodied,${sc.sensitivityBlendEmbodied}`);
  }

  // --- Phase 7: Fiscal-Monetary Parameters ---
  // DEPRECATED Phase 8 Fix 4: taylorInflationCoeff, taylorOutputGapCoeff moved to FederalReserveProfile
  // lines.push(`taylor_inflation_coeff,${config.taylorInflationCoeff ?? 1.5}`);
  // lines.push(`taylor_output_gap_coeff,${config.taylorOutputGapCoeff ?? 0.5}`);
  lines.push(`inflation_target,${config.inflationTarget ?? 0.02}`);
  lines.push(`effective_lower_bound,${config.effectiveLowerBound ?? -0.005}`);
  lines.push(`fiscal_dominance_threshold,${config.fiscalDominanceThreshold ?? 0.25}`);
  lines.push(`fiscal_dominance_dampening,${config.fiscalDominanceDampening ?? 0.5}`);
  // DEPRECATED Phase 8 Fix 4: fiscalRiskPremiumMidpoint replaced by fiscalRiskLevelMidpoint
  // lines.push(`fiscal_risk_premium_midpoint,${config.fiscalRiskPremiumMidpoint ?? 1.20}`);
  lines.push(`fiscal_risk_premium_max,${config.fiscalRiskPremiumMax ?? 0.06}`);
  // Phase 8 Fix 4: Yield calibration
  lines.push(`neutral_real_rate,${config.neutralRealRate ?? 0.007}`);
  lines.push(`term_premium,${config.termPremium ?? 0.003}`);
  lines.push(`inflation_convergence_years,${config.inflationConvergenceYears ?? 5}`);
  // Phase 8 Fix 4: Fiscal risk premium weights
  lines.push(`fiscal_risk_trajectory_weight,${config.fiscalRiskTrajectoryWeight ?? 0.50}`);
  lines.push(`fiscal_risk_sustainability_weight,${config.fiscalRiskSustainabilityWeight ?? 0.35}`);
  lines.push(`fiscal_risk_level_weight,${config.fiscalRiskLevelWeight ?? 0.15}`);
  lines.push(`fiscal_risk_level_midpoint,${config.fiscalRiskLevelMidpoint ?? 2.0}`);
  lines.push(`fiscal_risk_trajectory_midpoint,${config.fiscalRiskTrajectoryMidpoint ?? 0.15}`);
  // Phase 8 Fix 5: Housing model (phillipsCurveWageSensitivity DEPRECATED — wage growth chain removed)
  // lines.push(`phillips_curve_wage_sensitivity,${config.phillipsCurveWageSensitivity ?? 0.5}`);
  lines.push(`affordability_price_sensitivity,${config.affordabilityPriceSensitivity ?? 4.0}`);
  lines.push(`income_housing_elasticity,${config.incomeHousingElasticity ?? 0.5}`);
  lines.push(`affordability_reversion_sensitivity,${config.affordabilityReversionSensitivity ?? 0.15}`);
  lines.push(`downward_stickiness_ratio,${config.downwardStickinessRatio ?? 0.5}`);
  lines.push(`demographic_housing_elasticity,${config.demographicHousingElasticity ?? 1.0}`);
  lines.push(`corporate_tax_effectiveness,${config.corporateTaxEffectiveness ?? 0.65}`);
  lines.push(`foreign_treasury_demand,${config.foreignTreasuryDemand ?? 0.30}`);
  lines.push(`ai_pe_multiplier,${config.aiPEMultiplier ?? 1.0}`);
  lines.push(`qe_monetization_rate,${config.qeMonetizationRate ?? 0.40}`);
  lines.push(`consolidation_credit_max,${config.consolidationCreditMax ?? 0.40}`);
  // Phase 8 Fix 3: Bond market absorption capacity
  lines.push(`supply_pressure_sensitivity,${config.supplyPressureSensitivity ?? 1.0}`);
  lines.push(`safety_flight_sensitivity,${config.safetyFlightSensitivity ?? 1.5}`);
  lines.push(`yield_attraction_midpoint,${config.yieldAttractionMidpoint ?? 0.06}`);
  lines.push(`inflation_deterrent_sensitivity,${config.inflationDeterrentSensitivity ?? 1.0}`);
  lines.push(`sovereign_confidence_decay_rate,${config.sovereignConfidenceDecayRate ?? 2.0}`);
  // Phase 8 Fix 3: Endogenous debt maturity
  lines.push(`base_weighted_average_maturity,${config.baseWeightedAverageMaturity ?? 6.0}`);
  lines.push(`min_weighted_average_maturity,${config.minWeightedAverageMaturity ?? 2.5}`);
  lines.push(`max_weighted_average_maturity,${config.maxWeightedAverageMaturity ?? 8.0}`);
  lines.push(`maturity_stress_sensitivity,${config.maturityStressSensitivity ?? 1.0}`);
  // Phase 8 Fix 3: Monetization transmission
  lines.push(`monetization_transmission_sensitivity,${config.monetizationTransmissionSensitivity ?? 1.0}`);
  if (config.policyRateSchedule) {
    lines.push(`policy_rate_schedule,${csvQuoteSchedule(config.policyRateSchedule)}`);
  }

  // --- Phase 8a: Fiscal Response Profile ---
  // DEPRECATED Phase 8 Fix 4: fiscal_response_profile replaced by split presets
  // lines.push(`fiscal_response_profile,${config.fiscalResponseProfile ?? 'balanced_pragmatism'}`);
  // Phase 8 Fix 4: Independent fiscal + Fed presets
  lines.push(`fiscal_policy_preset,${config.fiscalPolicyPreset ?? 'balanced_reduction'}`);
  lines.push(`federal_reserve_preset,${config.federalReservePreset ?? 'balanced_mandate'}`);
  if (config.fiscalPolicyCustom) {
    const CAMEL_TO_SNAKE: Record<string, string> = {
      maxDiscretionaryCut: 'max_discretionary_cut',
      maxObligationCut: 'max_obligation_cut',
      maxRevenueIncrease: 'max_revenue_increase',
      qeMonetizationRate: 'qe_monetization_rate',
      maxFinancialRepressionRate: 'max_financial_repression_rate',
      colaDampeningRate: 'cola_dampening_rate',
      colaDampeningThreshold: 'cola_dampening_threshold',
      colaDampeningMaxCIF: 'cola_dampening_max_cif',
      consolidationThreshold: 'consolidation_threshold',
      consolidationMaxThreshold: 'consolidation_max_threshold',
      consolidationLag: 'consolidation_lag',
      yieldResponseThreshold: 'yield_response_threshold',
      maxYieldResponseRate: 'max_yield_response_rate',
    };
    for (const [key, value] of Object.entries(config.fiscalPolicyCustom)) {
      if (value !== undefined) {
        const csvField = CAMEL_TO_SNAKE[key] ?? key;
        lines.push(`fiscal_response.${csvField},${value}`);
      }
    }
  }

  // --- Phase 8b: Per-Year Parameter Overrides ---
  if (config.parameterOverrides) {
    for (const [key, value] of Object.entries(config.parameterOverrides)) {
      // key format: "paramKey:year", convert to CSV path: "override.paramKey.year"
      const colonIdx = key.lastIndexOf(':');
      if (colonIdx !== -1) {
        const paramKey = key.substring(0, colonIdx);
        const yearStr = key.substring(colonIdx + 1);
        lines.push(`override.${paramKey}.${yearStr},${value}`);
      }
    }
  }

  // --- Phase 6: Separated Consumer & Business Credit ---
  lines.push(`transfer_reliability_weight,${config.transferReliabilityWeight ?? DEFAULT_TRANSFER_RELIABILITY_WEIGHT}`);
  lines.push(`income_adequacy_sensitivity,${config.incomeAdequacySensitivity ?? DEFAULT_INCOME_ADEQUACY_SENSITIVITY}`);
  lines.push(`collateral_sensitivity,${config.collateralSensitivity ?? DEFAULT_COLLATERAL_SENSITIVITY}`);
  lines.push(`systemic_risk_sensitivity,${config.systemicRiskSensitivity ?? DEFAULT_SYSTEMIC_RISK_SENSITIVITY}`);
  lines.push(`inflation_risk_sensitivity,${config.inflationRiskSensitivity ?? DEFAULT_INFLATION_RISK_SENSITIVITY}`);
  lines.push(`max_consumer_tightening,${config.maxConsumerTightening ?? DEFAULT_MAX_CONSUMER_TIGHTENING}`);
  lines.push(`consumer_credit_impact,${config.consumerCreditImpact ?? DEFAULT_CONSUMER_CREDIT_IMPACT}`);
  lines.push(`profitability_sensitivity,${config.profitabilitySensitivity ?? DEFAULT_PROFITABILITY_SENSITIVITY}`);
  lines.push(`growth_trajectory_sensitivity,${config.growthTrajectorySensitivity ?? DEFAULT_GROWTH_TRAJECTORY_SENSITIVITY}`);
  lines.push(`max_business_tightening,${config.maxBusinessTightening ?? DEFAULT_MAX_BUSINESS_TIGHTENING}`);
  lines.push(`business_investment_impact,${config.businessInvestmentImpact ?? DEFAULT_BUSINESS_INVESTMENT_IMPACT}`);

  // --- Per-Cluster Parameter Overrides (only existing overrides) ---
  // Maps ClusterParameterOverride keys back to CSV field names
  const CLUSTER_OVERRIDE_KEY_TO_CSV: Record<string, string> = {
    generativeWeight: 'generative_weight',
    agenticWeight: 'agentic_weight',
    embodiedWeight: 'embodied_weight',
    adoptionSteepness: 'adoption_steepness',
    adoptionCeiling: 'adoption_ceiling',
    deploymentLag: 'deployment_lag',
    wageElasticity: 'wage_elasticity',
    deflationIntensity: 'deflation_intensity',
    maxProductivityMultiplier: 'max_productivity_multiplier',
  };
  if (config.clusterOverrides) {
    for (const [clusterId, overrides] of Object.entries(config.clusterOverrides)) {
      for (const [key, value] of Object.entries(overrides)) {
        if (value !== undefined) {
          const csvField = CLUSTER_OVERRIDE_KEY_TO_CSV[key] ?? key;
          lines.push(`cluster_override.${clusterId}.${csvField},${value}`);
        }
      }
    }
  }

  // --- BFCS Overrides (only existing overrides) ---
  for (const [clusterId, roles] of Object.entries(config.bfcsOverrides)) {
    for (const [roleId, thresholds] of Object.entries(roles)) {
      for (const dim of BFCS_DIMENSIONS) {
        lines.push(`bfcs.${clusterId}.${roleId}.${dim},${thresholds[dim]}`);
      }
    }
  }

  // --- State Overrides (only existing overrides) ---
  for (const [sc, ov] of Object.entries(config.stateOverrides)) {
    if (ov.minimumWage !== undefined) lines.push(`state_override.${sc}.minimum_wage,${ov.minimumWage}`);
    if (ov.additionalUBI !== undefined) lines.push(`state_override.${sc}.additional_ubi,${ov.additionalUBI}`);
    if (ov.uiReplacementRate !== undefined) lines.push(`state_override.${sc}.ui_replacement_rate,${ov.uiReplacementRate}`);
    if (ov.avRegulatoryEnvironment !== undefined) lines.push(`state_override.${sc}.av_regulatory,${ov.avRegulatoryEnvironment}`);
    if (ov.roboticsRegulatoryEnvironment !== undefined) lines.push(`state_override.${sc}.robotics_regulatory,${ov.roboticsRegulatoryEnvironment}`);
  }

  return lines.join('\n');
}
