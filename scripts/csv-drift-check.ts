/**
 * ATLAS CSV Drift Detection
 *
 * Compares the current SimulationConfig, MacroOutput, PolicyEffects, and MonetaryState
 * types against what csvImport.ts, csvExport.ts, and validateConfig.ts actually handle.
 *
 * Writes a GAPS.md report to the project root.
 *
 * Run: npx tsx scripts/csv-drift-check.ts
 */

import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getDefaultSimulationConfig, runSimulation } from '../src/models/simulation';
import { OCCUPATION_CLUSTERS } from '../src/data/occupationClusters';
import { exportConfigToParameterCSV } from '../src/utils/csvImport';
import { exportSimulationResultsCSV } from '../src/utils/csvExport';
import type { SimulationConfig } from '../src/types';

// ============================================================
// Helpers
// ============================================================

/** Convert camelCase to snake_case */
function camelToSnake(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

/** Recursively collect all leaf paths from an object. */
function collectLeafPaths(
  obj: Record<string, unknown>,
  prefix: string,
  result: Map<string, unknown>,
  skipKeys: Set<string>,
): void {
  for (const [key, value] of Object.entries(obj)) {
    if (skipKeys.has(prefix ? `${prefix}.${key}` : key)) continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      collectLeafPaths(value as Record<string, unknown>, path, result, skipKeys);
    } else {
      result.set(path, value);
    }
  }
}

/** Parse a CSV line (simple — handles no quoting needed for parameter_path column). */
function parseCsvFirstColumn(csvString: string): Set<string> {
  const paths = new Set<string>();
  const lines = csvString.split('\n');
  for (let i = 1; i < lines.length; i++) { // skip header
    const line = lines[i]!.trim();
    if (!line) continue;
    const commaIdx = line.indexOf(',');
    if (commaIdx > 0) {
      paths.add(line.slice(0, commaIdx));
    }
  }
  return paths;
}

// ============================================================
// A. SimulationConfig Drift Detection
// ============================================================

/**
 * Build a config with ALL optional fields set (so they appear in introspection/export).
 */
function buildFullConfig(): SimulationConfig {
  const config = getDefaultSimulationConfig();

  // Set all optional numeric fields to a sentinel value
  const optionalFields: Array<[keyof SimulationConfig, number]> = [
    ['populationGrowthRate', 0.006],
    ['revenuePressureSensitivity', 1.0],
    ['revenuePressureCap', 0.30],
    ['revenuePressureDecay', 0.10],
    ['aiWageProductivityMultiplier', 0.30],
    ['phillipsCurveSensitivity', 1.2],
    ['maxCreditTightening', 0.60],
    ['deferrableConsumptionShare', 0.30],
    ['deflationMidpoint', 0.05],
    ['deflationSteepness', 40],
    ['velocitySensitivity', 0.03],
    // DEPRECATED: profitRealizationSensitivity removed — replaced by endogenous capital gains realization rate
    ['demandFeedbackSensitivity', 0.50],
    ['creditUESensitivity', 2.0],
    ['creditInvestmentSensitivity', 0.80],
    ['creditConsumptionSensitivity', 0.40],
    ['aiProductionInvestmentFraction', 0.40],
    ['aiProductionOnshoringFraction', 0.15],
    ['newJobWageFraction', 0.80],
    ['otherUncategorizedMultiplierOverride', 1.0],
    ['aiProfitMargin', 0.25],
    ['traditionalProfitMargin', 0.11],
    // DEPRECATED: baselineDividendYield, baselineMarketReturn, aiGrowthPremium removed — replaced by dynamic P/E model
    ['wagePassThrough', 0.40],
    ['wageAutomationSensitivity', 0.50],
    ['creditDeflationSensitivity', 0.04],
    ['scarcityPassThrough', 0.30],
    ['participationElasticity', 0.15],
    ['participationThreshold', 0.60],
    ['businessCreditGDPSensitivity', 5.0],
    ['maxBusinessCreditLoosening', 0.30],
    ['shelterCPIWeight', 0.36],
    ['shelterInflationStickiness', 0.80],
    ['mortgageStressAmplifier', 0.40],
    ['foreclosureLag', 0.75],
    ['homeownershipRecoveryRate', 0.02],
    ['housingWealthMPC', 0.05],
    ['mpcWageUESensitivity', 0.005],
    ['creditAdoptionSensitivity', 0.15],
    ['bottom80WageShare', 0.45],
    ['bottom80TransferShare', 0.78],
    ['bottom80AssetShare', 0.12],
    // Investment Demand Constraint
    ['aiUtilizationSensitivity', 50],
    ['consumerDemandInvestmentSensitivity', 50],
    ['creditInvestmentResponseSensitivity', 50],
    ['traditionalInvestmentDemandSensitivity', 30],
    ['traditionalInvestmentGDPFraction', 0.175],
    // Tax & Economic Pipeline (Phase 5-tax)
    ['corporateRetentionRate', 0.40],
    ['aiProfitGrowthRate', 2.0],
    // Phase 6: Separated Consumer & Business Credit
    ['transferReliabilityWeight', 0.70],
    ['incomeAdequacySensitivity', 2.0],
    ['collateralSensitivity', 1.0],
    ['systemicRiskSensitivity', 1.5],
    ['inflationRiskSensitivity', 0.5],
    ['maxConsumerTightening', 0.5],
    ['consumerCreditImpact', 0.06],
    ['profitabilitySensitivity', 1.5],
    ['growthTrajectorySensitivity', 2.0],
    ['maxBusinessTightening', 0.5],
    ['businessInvestmentImpact', 0.15],
  ];

  for (const [key, val] of optionalFields) {
    (config as Record<string, unknown>)[key] = val;
  }

  // Set UBI indexed mode fields
  config.policyConfig.ubi.mode = 'manual';
  config.policyConfig.ubi.indexedBaseAmount = 1000;
  config.policyConfig.ubi.indexedStartYear = 2032;
  config.policyConfig.ubi.productivityIndexRate = 1.0;

  // Set nested optional objects (Phase 5-tax)
  config.taxConfig = {
    incomeTaxRate: 0.124,
    payrollTaxRate: 0.140,
    corporateTaxRate: 0.164,
    capitalGainsTaxRate: 0.165,
  };
  config.postTaxMPCs = {
    wage: 0.95,
    asset: 0.42,
    transfer: 0.95,
  };
  config.aiCostParams = {
    inferenceAnnualChange: -0.45,
    manufacturingAnnualChange: -0.10,
    energyAnnualChange: -0.03,
  };

  return config;
}

/**
 * Collect all flat config field names that should have CSV import/export/validate handlers.
 * Returns a map of camelCase field name → value.
 */
function collectConfigFields(config: SimulationConfig): Map<string, unknown> {
  const result = new Map<string, unknown>();

  // Skip container objects — their children are handled by specialized sub-handlers
  const skipRoots = new Set([
    'capabilities', 'adoptionParams', 'policyConfig',
    'bfcsOverrides', 'stateOverrides', 'clusterOverrides',
    'deflationIntensityOverrides',
  ]);

  for (const [key, value] of Object.entries(config)) {
    if (skipRoots.has(key)) continue;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      collectLeafPaths(value as Record<string, unknown>, key, result, new Set());
    } else {
      result.set(key, value);
    }
  }

  return result;
}

/**
 * Extract CSV paths handled by applyParameter() in csvImport.ts.
 * Looks for patterns like: path === 'xxx' and applyFloat(config, 'xxx'
 */
function extractImportPaths(source: string): Set<string> {
  const paths = new Set<string>();

  // Pattern 1: if (path === 'xxx')
  const pathMatches = source.matchAll(/path\s*===\s*'([^']+)'/g);
  for (const m of pathMatches) {
    paths.add(m[1]!);
  }

  // Pattern 2: applyFloat(config, 'xxx' — maps to camelCase field names
  // We need the CSV path, not the camelCase field. But the CSV path is in pattern 1.
  // Also capture paths from applyFloat/applyInt that use field === 'xxx' patterns (policy sub-handlers)
  const fieldMatches = source.matchAll(/field\s*===\s*'([^']+)'/g);
  for (const m of fieldMatches) {
    // These are sub-fields within policy handlers (e.g., 'enabled', 'monthly_amount')
    // They're handled via the policy prefix, so we don't need to track them separately
    paths.add(`_policy_field_:${m[1]!}`);
  }

  // Pattern 3: path.startsWith('xxx') — prefix-based handlers
  const prefixMatches = source.matchAll(/path\.startsWith\('([^']+)'\)/g);
  for (const m of prefixMatches) {
    paths.add(`_prefix_:${m[1]!}`);
  }

  return paths;
}

/**
 * Extract field names that have validation rules in validateConfig.ts.
 * Looks for: config.xxx = clamp( and config.xxx = Math.round(ensureFinite(
 */
function extractValidatedFields(source: string): Set<string> {
  const fields = new Set<string>();

  // Pattern: config.fieldName = clamp(config.fieldName, ...)
  const clampMatches = source.matchAll(/config\.(\w+)\s*=\s*clamp\(/g);
  for (const m of clampMatches) {
    fields.add(m[1]!);
  }

  // Pattern: config.fieldName = Math.round(ensureFinite(
  const finiteMatches = source.matchAll(/config\.(\w+)\s*=\s*(?:Math\.(?:round|max)\()?ensureFinite\(/g);
  for (const m of finiteMatches) {
    fields.add(m[1]!);
  }

  // Pattern: config.fieldName = Math.max(1, Math.round(ensureFinite(
  const maxFiniteMatches = source.matchAll(/config\.(\w+)\s*=\s*Math\.max\(\d+,\s*Math\.round\(ensureFinite/g);
  for (const m of maxFiniteMatches) {
    fields.add(m[1]!);
  }

  // Capability validation — extract from loop
  const capMatch = source.match(/for\s*\(.*vecId.*\)\s*\{[\s\S]*?cap\.(\w+)\s*=\s*clamp/g);
  if (capMatch) {
    fields.add('_cap_validated_');
  }

  // Nested object validation via local variables (e.g., tc.incomeTaxRate = clamp(...))
  // Maps known variable names back to their parent config field paths.
  const nestedVarMap: Record<string, string> = {
    'tc': 'taxConfig',
    'mpc': 'postTaxMPCs',
    'ac': 'aiCostParams',
  };
  const nestedClampMatches = source.matchAll(/(\w+)\.(\w+)\s*=\s*clamp\(/g);
  for (const m of nestedClampMatches) {
    const varName = m[1]!;
    const fieldName = m[2]!;
    const parentPath = nestedVarMap[varName];
    if (parentPath) {
      fields.add(`${parentPath}.${fieldName}`);
    }
  }

  return fields;
}

// ============================================================
// B. Output Fields Drift Detection
// ============================================================

interface OutputFieldGap {
  source: 'MacroOutput' | 'PolicyEffects' | 'MonetaryState';
  field: string;
  suggestedColumn: string;
}

/**
 * Collect output field names from a simulation year and compare against CSV headers.
 */
function checkOutputGaps(headers: Set<string>): OutputFieldGap[] {
  const config = getDefaultSimulationConfig();
  const timeline = runSimulation(config, OCCUPATION_CLUSTERS);
  const year0 = timeline.years[0]!;
  const gaps: OutputFieldGap[] = [];

  // Known mappings where camelToSnake doesn't match the CSV column
  const FIELD_ALIASES: Record<string, string> = {
    'newJobCreationRate': 'new_jobs_created',
    'newJobEmployment': 'total_human_new_jobs',
    'gdpGrowthRate': 'gdp_growth_rate',
    // MacroOutput aliases
    'fiscalDeficitGDPRatio': 'fiscal_deficit_gdp_pct',
    'realGDP': 'gdp_real',
    // PolicyEffects aliases — CSV uses policy_ prefix
    'wageChannelAddition': 'policy_wage_addition',
    'assetChannelAddition': 'policy_asset_addition',
    'transferChannelAddition': 'policy_transfer_addition',
    'totalPolicyIncome': 'policy_total_income',
    'fiscalCost': 'policy_fiscal_cost',
    'fiscalCostAsPercentGDP': 'policy_fiscal_cost_gdp_pct',
    'sovereignFundSize': 'swf_fund_size',
    // MonetaryState aliases
    'actualInflationFromTransfers': 'inflation_from_transfers',
    'isWithinNeutralZone': 'within_neutral_zone',
  };

  // Fields to skip — they're handled specially or are container objects
  const OUTPUT_SKIP = new Set([
    'incomeComposition',  // nested sub-object → wage_share, asset_share, transfer_share
    'cyclePhase',         // string enum — already exported
  ]);

  // incomeComposition sub-fields are exported as top-level columns
  const NESTED_MAPPINGS: Record<string, string> = {
    'incomeComposition.wageShare': 'wage_share',
    'incomeComposition.assetShare': 'asset_share',
    'incomeComposition.transferShare': 'transfer_share',
  };

  function checkFields(
    obj: Record<string, unknown>,
    source: OutputFieldGap['source'],
    prefix: string = '',
  ): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;

      if (OUTPUT_SKIP.has(key) || OUTPUT_SKIP.has(fullPath)) {
        // Check nested mappings
        if (key === 'incomeComposition' && typeof value === 'object' && value !== null) {
          for (const [subKey] of Object.entries(value as Record<string, unknown>)) {
            const nestedPath = `${key}.${subKey}`;
            const mappedCol = NESTED_MAPPINGS[nestedPath];
            if (mappedCol && !headers.has(mappedCol)) {
              gaps.push({ source, field: nestedPath, suggestedColumn: mappedCol });
            }
          }
        }
        continue;
      }

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        checkFields(value as Record<string, unknown>, source, fullPath);
        continue;
      }

      // Convert field name to expected CSV column
      const alias = FIELD_ALIASES[key];
      const snakeName = alias ?? camelToSnake(key);

      if (!headers.has(snakeName)) {
        gaps.push({ source, field: key, suggestedColumn: snakeName });
      }
    }
  }

  checkFields(year0.macro as unknown as Record<string, unknown>, 'MacroOutput');
  checkFields(year0.policyEffects as unknown as Record<string, unknown>, 'PolicyEffects');
  checkFields(year0.monetary as unknown as Record<string, unknown>, 'MonetaryState');

  return gaps;
}

// ============================================================
// CSV Header Extraction
// ============================================================

function extractCsvHeaders(): Set<string> {
  const config = getDefaultSimulationConfig();
  const timeline = runSimulation(config, OCCUPATION_CLUSTERS);
  const csv = exportSimulationResultsCSV(timeline);
  const firstLine = csv.split('\n')[0]!;
  const headers = firstLine.split(',').map(h => h.trim());
  return new Set(headers);
}

// ============================================================
// Config Gap Checking
// ============================================================

interface ConfigGap {
  field: string;
  csvPath: string;
  type: string;
}

/**
 * Map from camelCase config field to expected CSV import path.
 */
function configFieldToCsvPath(field: string): string {
  // Known special mappings
  const SPECIAL: Record<string, string> = {
    'startYear': 'start_year',
    'endYear': 'end_year',
    'baseInflationRate': 'base_inflation_rate',
    'mpcWage': 'mpc_wage',
    'mpcAsset': 'mpc_asset',
    'mpcTransfer': 'mpc_transfer',
    'baselineGDPGrowth': 'baseline_gdp_growth',
    'totalPopulation': 'total_population',
    'laborForce': 'labor_force',
    'populationGrowthRate': 'population_growth_rate',
    'innovationRate': 'innovation_rate',
    'rdMultiplier': 'rd_multiplier',
    'jobPersistenceFactor': 'job_persistence_factor',
    'demandFeedbackSensitivity': 'demand_feedback_sensitivity',
    'creditUESensitivity': 'credit_ue_sensitivity',
    'creditInvestmentSensitivity': 'credit_investment_sensitivity',
    'creditConsumptionSensitivity': 'credit_consumption_sensitivity',
    'revenuePressureSensitivity': 'revenue_pressure_sensitivity',
    'revenuePressureCap': 'revenue_pressure_cap',
    'revenuePressureDecay': 'revenue_pressure_decay',
    'aiWageProductivityMultiplier': 'ai_wage_productivity_multiplier',
    'phillipsCurveSensitivity': 'phillips_curve_sensitivity',
    'maxCreditTightening': 'max_credit_tightening',
    'deferrableConsumptionShare': 'deferrable_consumption_share',
    'deflationMidpoint': 'deflation_midpoint',
    'deflationSteepness': 'deflation_steepness',
    'velocitySensitivity': 'velocity_sensitivity',
    'aiProductionInvestmentFraction': 'ai_production_investment_fraction',
    'aiProductionOnshoringFraction': 'ai_production_onshoring_fraction',
    'newJobWageFraction': 'new_job_wage_fraction',
    'otherUncategorizedMultiplierOverride': 'other_uncategorized_multiplier_override',
    'aiProfitMargin': 'ai_profit_margin',
    'traditionalProfitMargin': 'traditional_profit_margin',
    'wagePassThrough': 'wage_pass_through',
    'wageAutomationSensitivity': 'wage_automation_sensitivity',
    'creditDeflationSensitivity': 'credit_deflation_sensitivity',
    'scarcityPassThrough': 'scarcity_pass_through',
    'participationElasticity': 'participation_elasticity',
    'participationThreshold': 'participation_threshold',
    'businessCreditGDPSensitivity': 'business_credit_gdp_sensitivity',
    'maxBusinessCreditLoosening': 'max_business_credit_loosening',
    'shelterCPIWeight': 'shelter_cpi_weight',
    'shelterInflationStickiness': 'shelter_inflation_stickiness',
    'mortgageStressAmplifier': 'mortgage_stress_amplifier',
    'foreclosureLag': 'foreclosure_lag',
    'homeownershipRecoveryRate': 'homeownership_recovery_rate',
    'housingWealthMPC': 'housing_wealth_mpc',
    'mpcWageUESensitivity': 'mpc_wage_ue_sensitivity',
    'creditAdoptionSensitivity': 'credit_adoption_sensitivity',
    'bottom80WageShare': 'bottom_80_wage_share',
    'bottom80TransferShare': 'bottom_80_transfer_share',
    'bottom80AssetShare': 'bottom_80_asset_share',
    // Investment Demand Constraint
    'aiUtilizationSensitivity': 'ai_utilization_sensitivity',
    'consumerDemandInvestmentSensitivity': 'consumer_demand_investment_sensitivity',
    'creditInvestmentResponseSensitivity': 'credit_investment_response_sensitivity',
    'traditionalInvestmentDemandSensitivity': 'traditional_investment_demand_sensitivity',
    'traditionalInvestmentGDPFraction': 'traditional_investment_gdp_fraction',
    // Tax & Economic Pipeline
    'corporateRetentionRate': 'corporate_retention_rate',
    'aiProfitGrowthRate': 'ai_profit_growth_rate',
    // Phase 6: Separated Consumer & Business Credit
    'transferReliabilityWeight': 'transfer_reliability_weight',
    'incomeAdequacySensitivity': 'income_adequacy_sensitivity',
    'collateralSensitivity': 'collateral_sensitivity',
    'systemicRiskSensitivity': 'systemic_risk_sensitivity',
    'inflationRiskSensitivity': 'inflation_risk_sensitivity',
    'maxConsumerTightening': 'max_consumer_tightening',
    'consumerCreditImpact': 'consumer_credit_impact',
    'profitabilitySensitivity': 'profitability_sensitivity',
    'growthTrajectorySensitivity': 'growth_trajectory_sensitivity',
    'maxBusinessTightening': 'max_business_tightening',
    'businessInvestmentImpact': 'business_investment_impact',
    // Nested object sub-fields (Phase 5-tax)
    'taxConfig.incomeTaxRate': 'tax_config.income_tax_rate',
    'taxConfig.payrollTaxRate': 'tax_config.payroll_tax_rate',
    'taxConfig.corporateTaxRate': 'tax_config.corporate_tax_rate',
    'taxConfig.capitalGainsTaxRate': 'tax_config.capital_gains_tax_rate',
    'postTaxMPCs.wage': 'post_tax_mpc.wage',
    'postTaxMPCs.asset': 'post_tax_mpc.asset',
    'postTaxMPCs.transfer': 'post_tax_mpc.transfer',
    'aiCostParams.inferenceAnnualChange': 'ai_cost.inference_annual_change',
    'aiCostParams.manufacturingAnnualChange': 'ai_cost.manufacturing_annual_change',
    'aiCostParams.energyAnnualChange': 'ai_cost.energy_annual_change',
  };

  return SPECIAL[field] ?? camelToSnake(field);
}

function checkConfigImportGaps(
  configFields: Map<string, unknown>,
  importSource: string,
): ConfigGap[] {
  const importPaths = extractImportPaths(importSource);

  // Extract prefix patterns (e.g., 'tax_config.', 'post_tax_mpc.', 'ai_cost.')
  const importPrefixes: string[] = [];
  for (const p of importPaths) {
    if (p.startsWith('_prefix_:')) {
      importPrefixes.push(p.slice('_prefix_:'.length));
    }
  }

  const gaps: ConfigGap[] = [];

  for (const [field, value] of configFields) {
    const csvPath = configFieldToCsvPath(field);
    // Check exact path match OR prefix handler coverage
    const covered = importPaths.has(csvPath) ||
      importPrefixes.some(prefix => csvPath.startsWith(prefix));
    if (!covered) {
      gaps.push({
        field,
        csvPath,
        type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : String(typeof value),
      });
    }
  }

  return gaps;
}

function checkConfigExportGaps(
  configFields: Map<string, unknown>,
  fullConfig: SimulationConfig,
): ConfigGap[] {
  const csvOutput = exportConfigToParameterCSV(fullConfig);
  const exportedPaths = parseCsvFirstColumn(csvOutput);
  const gaps: ConfigGap[] = [];

  for (const [field, value] of configFields) {
    const csvPath = configFieldToCsvPath(field);
    if (!exportedPaths.has(csvPath)) {
      gaps.push({
        field,
        csvPath,
        type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : String(typeof value),
      });
    }
  }

  return gaps;
}

function checkConfigValidationGaps(
  configFields: Map<string, unknown>,
  validateSource: string,
): ConfigGap[] {
  const validatedFields = extractValidatedFields(validateSource);
  const gaps: ConfigGap[] = [];

  // Only numeric fields need validation (booleans, strings, enums don't need clamping)
  for (const [field, value] of configFields) {
    if (typeof value !== 'number') continue;
    if (!validatedFields.has(field)) {
      gaps.push({
        field,
        csvPath: configFieldToCsvPath(field),
        type: 'number',
      });
    }
  }

  return gaps;
}

// ============================================================
// Policy Sub-Field Detection
// ============================================================

/**
 * Collect policy sub-field paths for UBI indexed mode fields.
 * These don't appear as top-level config fields but need import/export coverage.
 */
interface PolicyFieldGap {
  policyPath: string;
  description: string;
}

function checkPolicyFieldGaps(importSource: string, exportCsv: string): PolicyFieldGap[] {
  const gaps: PolicyFieldGap[] = [];
  const exportedPaths = parseCsvFirstColumn(exportCsv);

  // UBI indexed mode fields that should be handled
  const ubiFields: Array<{ path: string; importField: string; desc: string }> = [
    { path: 'policy.ubi.mode', importField: 'mode', desc: 'UBI mode (manual/indexed)' },
    { path: 'policy.ubi.indexed_base_amount', importField: 'indexed_base_amount', desc: 'UBI indexed base amount' },
    { path: 'policy.ubi.indexed_start_year', importField: 'indexed_start_year', desc: 'UBI indexed start year' },
    { path: 'policy.ubi.productivity_index_rate', importField: 'productivity_index_rate', desc: 'UBI productivity index rate' },
  ];

  for (const uf of ubiFields) {
    // Check import: look for field === 'xxx' in applyUBI function
    const importPattern = new RegExp(`field\\s*===\\s*'${uf.importField}'`);
    if (!importPattern.test(importSource)) {
      gaps.push({ policyPath: uf.path, description: `Import missing: ${uf.desc}` });
    }

    // Check export
    if (!exportedPaths.has(uf.path)) {
      gaps.push({ policyPath: uf.path, description: `Export missing: ${uf.desc}` });
    }
  }

  return gaps;
}

// ============================================================
// GAPS.md Generation
// ============================================================

function generateGapsMd(
  importGaps: ConfigGap[],
  exportGaps: ConfigGap[],
  validationGaps: ConfigGap[],
  outputGaps: OutputFieldGap[],
  policyGaps: PolicyFieldGap[],
): string {
  const timestamp = new Date().toISOString();
  const totalGaps = importGaps.length + exportGaps.length + validationGaps.length
    + outputGaps.length + policyGaps.length;

  const status = totalGaps === 0
    ? 'All synced — no action needed'
    : `${totalGaps} gap${totalGaps === 1 ? '' : 's'} found`;

  const lines: string[] = [];
  lines.push('# ATLAS CSV Sync Gaps');
  lines.push('');
  lines.push(`Generated: ${timestamp}`);
  lines.push('Script: `npx tsx scripts/csv-drift-check.ts`');
  lines.push('');
  lines.push(`## Status: ${status}`);
  lines.push('');

  // --- Config Import Gaps ---
  lines.push('### Config Import Gaps');
  lines.push('Fields in SimulationConfig with no handler in `csvImport.ts` `applyParameter()`:');
  if (importGaps.length === 0) {
    lines.push('');
    lines.push('None — all config fields have import handlers.');
  } else {
    lines.push('');
    lines.push('| # | Config Field | CSV Path (suggested) | Type |');
    lines.push('|---|-------------|---------------------|------|');
    importGaps.forEach((g, i) => {
      lines.push(`| ${i + 1} | \`${g.field}\` | \`${g.csvPath}\` | ${g.type} |`);
    });
  }
  lines.push('');

  // --- Config Export Gaps ---
  lines.push('### Config Export Gaps');
  lines.push('Fields in SimulationConfig not exported by `exportConfigToParameterCSV()`:');
  if (exportGaps.length === 0) {
    lines.push('');
    lines.push('None — all config fields are exported.');
  } else {
    lines.push('');
    lines.push('| # | Config Field | CSV Path (suggested) | Type |');
    lines.push('|---|-------------|---------------------|------|');
    exportGaps.forEach((g, i) => {
      lines.push(`| ${i + 1} | \`${g.field}\` | \`${g.csvPath}\` | ${g.type} |`);
    });
  }
  lines.push('');

  // --- Config Validation Gaps ---
  lines.push('### Config Validation Gaps');
  lines.push('Numeric config fields with no clamp rule in `validateConfig.ts`:');
  if (validationGaps.length === 0) {
    lines.push('');
    lines.push('None — all numeric config fields have validation rules.');
  } else {
    lines.push('');
    lines.push('| # | Config Field | CSV Path | Type |');
    lines.push('|---|-------------|----------|------|');
    validationGaps.forEach((g, i) => {
      lines.push(`| ${i + 1} | \`${g.field}\` | \`${g.csvPath}\` | ${g.type} |`);
    });
  }
  lines.push('');

  // --- Policy Sub-Field Gaps ---
  lines.push('### Policy Sub-Field Gaps');
  lines.push('Policy-nested fields (e.g., UBI mode) missing from import or export:');
  if (policyGaps.length === 0) {
    lines.push('');
    lines.push('None — all policy sub-fields are handled.');
  } else {
    lines.push('');
    lines.push('| # | Policy Path | Issue |');
    lines.push('|---|------------|-------|');
    policyGaps.forEach((g, i) => {
      lines.push(`| ${i + 1} | \`${g.policyPath}\` | ${g.description} |`);
    });
  }
  lines.push('');

  // --- Results Export Gaps ---
  lines.push('### Results Export Gaps');
  lines.push('Output fields not included in `csvExport.ts` `buildHeaders()`:');
  if (outputGaps.length === 0) {
    lines.push('');
    lines.push('None — all output fields are exported.');
  } else {
    lines.push('');
    lines.push('| # | Source | Field | Column (suggested) |');
    lines.push('|---|--------|-------|--------------------|');
    outputGaps.forEach((g, i) => {
      lines.push(`| ${i + 1} | ${g.source} | \`${g.field}\` | \`${g.suggestedColumn}\` |`);
    });
  }
  lines.push('');

  lines.push('---');
  lines.push('*Generated by `scripts/csv-drift-check.ts` — ATLAS CSV Drift Detection*');
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// Main
// ============================================================

function main(): void {
  console.log('ATLAS CSV Drift Detection');
  console.log('=========================\n');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const projectRoot = resolve(__dirname, '..');

  // Read source files
  const importSource = readFileSync(resolve(projectRoot, 'src/utils/csvImport.ts'), 'utf-8');
  const validateSource = readFileSync(resolve(projectRoot, 'src/utils/validateConfig.ts'), 'utf-8');

  // Build full config with all optional fields set
  const fullConfig = buildFullConfig();

  // Collect all config fields
  const configFields = collectConfigFields(fullConfig);
  console.log(`Config fields discovered: ${configFields.size}`);

  // Check config import gaps
  const importGaps = checkConfigImportGaps(configFields, importSource);
  console.log(`Config import gaps: ${importGaps.length}`);

  // Check config export gaps
  const exportGaps = checkConfigExportGaps(configFields, fullConfig);
  console.log(`Config export gaps: ${exportGaps.length}`);

  // Check config validation gaps
  const validationGaps = checkConfigValidationGaps(configFields, validateSource);
  console.log(`Config validation gaps: ${validationGaps.length}`);

  // Check policy sub-field gaps (UBI mode etc.)
  const exportCsv = exportConfigToParameterCSV(fullConfig);
  const policyGaps = checkPolicyFieldGaps(importSource, exportCsv);
  console.log(`Policy sub-field gaps: ${policyGaps.length}`);

  // Check output field gaps
  const headers = extractCsvHeaders();
  console.log(`CSV result columns: ${headers.size}`);
  const outputGaps = checkOutputGaps(headers);
  console.log(`Results export gaps: ${outputGaps.length}`);

  const totalGaps = importGaps.length + exportGaps.length + validationGaps.length
    + outputGaps.length + policyGaps.length;
  console.log(`\nTotal gaps: ${totalGaps}`);

  // Generate and write GAPS.md
  const report = generateGapsMd(importGaps, exportGaps, validationGaps, outputGaps, policyGaps);
  const gapsPath = resolve(projectRoot, 'GAPS.md');
  writeFileSync(gapsPath, report, 'utf-8');
  console.log(`\nGAPS.md written to ${gapsPath}`);

  if (totalGaps > 0) {
    console.log('\n⚠ Gaps detected — see GAPS.md for details.');
    // Don't exit with error code — this is informational
  } else {
    console.log('\n✓ All synced — no gaps found.');
  }
}

main();
