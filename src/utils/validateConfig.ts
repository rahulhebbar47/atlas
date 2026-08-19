/**
 * ATLAS Config Validation Utility
 *
 * Validates and clamps SimulationConfig fields to prevent NaN propagation,
 * out-of-range values, and other configuration errors.
 *
 * Used by:
 * - CSV import (buildConfigFromCSV) for imported parameter validation
 * - Scenario load (loadScenario) for deserialized scenario configs
 *
 * All functions are PURE -- no side effects, no state mutation.
 */

import type { SimulationConfig } from '@/types';
// audit H679 (by-reference rule, single-source-of-truth — the stale-fallback-family finding):
// every NaN/undefined clamp fallback below references the LIVE default constant instead of
// carrying its own literal copy. ~14 of the old literals had silently drifted from the live
// defaults (e.g. demandFeedbackSensitivity 0.50 vs live 1.5, laborForce 168M vs the
// data-derived 171.5M); this import list is the fix. Fallbacks fire only on
// NaN/undefined/malformed input — never at defaults.
import {
  DEFAULT_START_YEAR,
  DEFAULT_END_YEAR,
  US_POPULATION_2025,
  US_LABOR_FORCE_2025,
  DEFAULT_POPULATION_GROWTH_RATE,
  BASE_INFLATION_RATE,
  BASELINE_GDP_GROWTH_RATE,
  DEFAULT_INNOVATION_RATE,
  DEFAULT_RD_MULTIPLIER,
  DEFAULT_JOB_PERSISTENCE_FACTOR,
  REVENUE_PRESSURE_SENSITIVITY_DEFAULT,
  REVENUE_PRESSURE_CAP,
  REVENUE_PRESSURE_DECAY,
  AI_WAGE_PRODUCTIVITY_MULTIPLIER,
  PHILLIPS_CURVE_SENSITIVITY,
  MAX_CREDIT_TIGHTENING,
  DEFERRABLE_CONSUMPTION_SHARE,
  DEFAULT_VELOCITY_SENSITIVITY,
  DEMAND_FEEDBACK_SENSITIVITY,
  CREDIT_UE_SENSITIVITY,
  CREDIT_INVESTMENT_SENSITIVITY,
  CREDIT_CONSUMPTION_SENSITIVITY,
  DEFAULT_AI_PROFIT_MARGIN,
  DEFAULT_TRADITIONAL_PROFIT_MARGIN,
  DEFAULT_AI_PE_SENSITIVITY,
  DEFAULT_TRADITIONAL_PE_SENSITIVITY,
  DEFAULT_WAGE_PASS_THROUGH,
  DEFAULT_WAGE_AUTOMATION_SENSITIVITY,
  DEFAULT_SCARCITY_PASS_THROUGH,
  DEFLATION_MIDPOINT,
  DEFLATION_STEEPNESS,
  DEFAULT_PARTICIPATION_ELASTICITY,
  DEFAULT_PARTICIPATION_THRESHOLD,
  DEFAULT_BUSINESS_CREDIT_GDP_SENSITIVITY,
  DEFAULT_MAX_BUSINESS_CREDIT_LOOSENING,
  BASELINE_SHELTER_CPI_WEIGHT,
  DEFAULT_SHELTER_INFLATION_STICKINESS,
  DEFAULT_MORTGAGE_STRESS_AMPLIFIER,
  DEFAULT_FORECLOSURE_LAG,
  DEFAULT_HOMEOWNERSHIP_RECOVERY_RATE,
  DEFAULT_HOUSING_WEALTH_MPC,
  DEFAULT_MPC_WAGE_UE_SENSITIVITY,
  DEFAULT_CREDIT_ADOPTION_SENSITIVITY,
  DEFAULT_INSTITUTIONAL_BUYER_RATE,
  TRADITIONAL_INVESTMENT_GDP_FRACTION,
  DEFAULT_CREDIT_DEFLATION_SENSITIVITY,
  BASELINE_CORPORATE_RETENTION_RATE,
  DEFAULT_AI_PROFIT_GROWTH_RATE,
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
  DEFAULT_FRONTIER_INTENSITY_LEVEL,
  DEFAULT_FRONTIER_INTENSITY_GROWTH,
  DEFAULT_SIGMA_MIGRATION,
  DEFAULT_W_MIN_FRONTIER_FLOOR,
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
  BOTTOM80_WAGE_SHARE,
  BOTTOM80_TRANSFER_SHARE,
  BOTTOM80_ASSET_SHARE,
  DEFAULT_AI_PRODUCTION_INVESTMENT_FRACTION,
  DEFAULT_AI_PRODUCTION_ONSHORING_FRACTION,
  DEFAULT_NEW_JOB_WAGE_FRACTION,
  DEFAULT_FISCAL_RISK_PREMIUM_MAX,
  DEFAULT_INFLATION_CONVERGENCE_YEARS,
  // Stage 6.5 stock-flow housing family (audit H679: clamps added — these fields previously
  // reached the model with NO range enforcement at all; landShare = 0 divided by zero)
  DEFAULT_FORMATION_SENSITIVITY,
  DEFAULT_HEADSHIP_RECOVERY_RATE,
  DEFAULT_HOUSING_SUPPLY_ELASTICITY,
  DEFAULT_EMBODIED_CAPACITY_GAIN,
  DEFAULT_HOUSING_DEPRECIATION_RATE,
  DEFAULT_LAND_SHARE,
  LAND_SHARE_DIVISION_FLOOR,
  DEFAULT_CONSTRUCTION_LABOR_SHARE,
  DEFAULT_LAND_INCOME_BETA,
  DEFAULT_LAND_SCARCITY_ELASTICITY,
  DEFAULT_RENT_OCCUPANCY_ELASTICITY,
  DEFAULT_RENT_COST_ANCHOR_WEIGHT,
  DEFAULT_BASELINE_CAP_RATE,
  DEFAULT_CAP_RATE_MORTGAGE_BETA,
  DEFAULT_CAP_RATE_INVESTOR_COMPRESSION,
  DEFAULT_FIRE_SALE_ELASTICITY,
  DEFAULT_INVESTOR_DEMAND_INTENSITY,
  DEFAULT_LAND_RATE_SENSITIVITY,
  DEFAULT_LAND_CLOSURE_KAPPA,
  BASELINE_MORTGAGE_RATE_2025,
  DEFAULT_OPEX_PASSTHROUGH,
  DEFAULT_RENT_DOWNWARD_RIGIDITY,
  DEFAULT_RENT_INCOME_ELASTICITY,
  DEFAULT_BUILDER_ADJUSTMENT_LAMBDA,
  HOUSING_PIPELINE_DURATION_YEARS,
  DEFAULT_CONSTRUCTION_CREDIT_SENSITIVITY,
} from '@/models/constants';

/**
 * Clamp a value to a range, replacing NaN/undefined with a default.
 */
function clamp(value: number | undefined, min: number, max: number, fallback: number): number {
  if (value === undefined || value === null || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, value));
}

/**
 * Ensure a value is a finite number, replacing NaN/undefined with a default.
 */
function ensureFinite(value: number | undefined, fallback: number): number {
  if (value === undefined || value === null || !Number.isFinite(value)) {
    return fallback;
  }
  return value;
}

export interface ValidationResult {
  config: SimulationConfig;
  warnings: string[];
}

/**
 * Validate and clamp a SimulationConfig.
 * Returns a cleaned config and any warnings generated.
 *
 * This does NOT modify the input -- it returns a new config object.
 */
export function validateConfig(input: SimulationConfig): ValidationResult {
  const warnings: string[] = [];
  const config = { ...input };

  // --- Timeline ---
  // Fallbacks by reference to the live defaults (audit H679 single-source-of-truth rule).
  config.startYear = Math.round(ensureFinite(config.startYear, DEFAULT_START_YEAR));
  config.endYear = Math.round(ensureFinite(config.endYear, DEFAULT_END_YEAR));
  // Import-protections fix (the Scenarios audit): the engine REJECTS non-2025 start years
  // loudly (the BFCS/cost decay clocks are anchored there — runSimulation throws), so a
  // finite non-default startYear in an imported file previously sailed through this
  // validator and crashed the run. Reset it here with a warning instead — the same
  // degrade-to-default contract every other clamped field follows.
  if (config.startYear !== DEFAULT_START_YEAR) {
    warnings.push(`startYear (${config.startYear}) is not supported — the simulation is anchored at ${DEFAULT_START_YEAR}. Reset.`);
    config.startYear = DEFAULT_START_YEAR;
  }
  if (config.endYear <= config.startYear) {
    warnings.push(`endYear (${config.endYear}) must be > startYear (${config.startYear}). Reset to defaults.`);
    config.startYear = DEFAULT_START_YEAR;
    config.endYear = DEFAULT_END_YEAR;
  }

  // --- Population ---
  // laborForce fallback was a frozen 168M copy of the BLS-data-derived live default (≈171.5M);
  // it now references the same data-derived constant the live path uses (audit H679).
  config.totalPopulation = Math.max(1, Math.round(ensureFinite(config.totalPopulation, US_POPULATION_2025)));
  config.laborForce = Math.max(1, Math.round(ensureFinite(config.laborForce, US_LABOR_FORCE_2025)));
  if (config.populationGrowthRate !== undefined) {
    // audit H679 range alignment: clamp follows the documented range (-0.05..0.05, types/index.ts);
    // the old clamp max 0.10 was uncited and doubled the doc max. Fallback was a stale 0.006.
    config.populationGrowthRate = clamp(config.populationGrowthRate, -0.05, 0.05, DEFAULT_POPULATION_GROWTH_RATE);
  }

  // --- Macro Parameters ---
  // baseInflationRate fallback was a frozen 0.025 approximation of the BLS-data-derived live
  // default (≈0.0263); it now references the same source the live path uses (audit H679).
  config.baseInflationRate = clamp(config.baseInflationRate, 0, 0.50, BASE_INFLATION_RATE);
  config.baselineGDPGrowth = clamp(config.baselineGDPGrowth, -0.10, 0.20, BASELINE_GDP_GROWTH_RATE); // was stale 0.022 vs live 0.02

  // --- New Job Creation ---
  config.innovationRate = ensureFinite(config.innovationRate, DEFAULT_INNOVATION_RATE);
  config.rdMultiplier = clamp(config.rdMultiplier, 0, 100, DEFAULT_RD_MULTIPLIER);
  // Mini-stage 2: the reverse gear's speed dials (defaults = the skeleton's values, honest-uncited)
  config.deAdoptionRateCognitive = clamp(config.deAdoptionRateCognitive, 0, 0.5, 0.10);
  config.deAdoptionRateEmbodied = clamp(config.deAdoptionRateEmbodied, 0, 0.5, 0.05);
  config.reAdoptionRate = clamp(config.reAdoptionRate, 0, 1, 0.5);
  // Mini-stage 3: the duration pool's dials (honest-flagged anchors; see constants.ts)
  config.exitBase = clamp(config.exitBase, 0, 0.3, 0.05);
  config.exitDurationSlope = clamp(config.exitDurationSlope, 0, 1, 0.3);
  config.atrophyRate = clamp(config.atrophyRate, 0, 0.3, 0.10);
  config.wageScarringRate = clamp(config.wageScarringRate, 0, 0.1, 0.02);
  // audit H679 range alignment: clamp follows the shipped UI envelope (slider max 15,
  // NewJobsControls); the old 0-5 clamp was an uncited bound that silently truncated
  // UI-legitimate values on scenario/CSV round-trip. No documented range exists for this field.
  config.jobPersistenceFactor = clamp(config.jobPersistenceFactor, 0, 15, DEFAULT_JOB_PERSISTENCE_FACTOR);

  // --- Optional parameters (only validate if defined) ---
  // Fallbacks by reference to the live default constants (audit H679; the old literals here
  // were the stale-fallback family: 1.0/0.10/0.30/1.2/0.60/0.50/2.0 had all drifted).
  if (config.revenuePressureSensitivity !== undefined) {
    config.revenuePressureSensitivity = clamp(config.revenuePressureSensitivity, 0, 10, REVENUE_PRESSURE_SENSITIVITY_DEFAULT);
  }
  if (config.revenuePressureCap !== undefined) {
    config.revenuePressureCap = clamp(config.revenuePressureCap, 0, 1, REVENUE_PRESSURE_CAP);
  }
  if (config.revenuePressureDecay !== undefined) {
    config.revenuePressureDecay = clamp(config.revenuePressureDecay, 0, 1, REVENUE_PRESSURE_DECAY);
  }
  if (config.aiWageProductivityMultiplier !== undefined) {
    config.aiWageProductivityMultiplier = clamp(config.aiWageProductivityMultiplier, 0, 2, AI_WAGE_PRODUCTIVITY_MULTIPLIER);
  }
  if (config.phillipsCurveSensitivity !== undefined) {
    config.phillipsCurveSensitivity = clamp(config.phillipsCurveSensitivity, 0, 10, PHILLIPS_CURVE_SENSITIVITY);
  }
  if (config.maxCreditTightening !== undefined) {
    config.maxCreditTightening = clamp(config.maxCreditTightening, 0.1, 1, MAX_CREDIT_TIGHTENING);
  }
  if (config.deferrableConsumptionShare !== undefined) {
    config.deferrableConsumptionShare = clamp(config.deferrableConsumptionShare, 0, 1, DEFERRABLE_CONSUMPTION_SHARE);
  }
  if (config.velocitySensitivity !== undefined) {
    // audit H679 range alignment: clamp follows the documented range (0-1, types/index.ts);
    // the old 0-0.50 clamp bound was uncited.
    config.velocitySensitivity = clamp(config.velocitySensitivity, 0, 1, DEFAULT_VELOCITY_SENSITIVITY);
  }
  if (config.demandFeedbackSensitivity !== undefined) {
    // audit H679 range alignment: clamp follows the documented range (0-3, types/index.ts);
    // the old 0-5 clamp bound was uncited. Fallback was a stale 0.50 vs live 1.5.
    config.demandFeedbackSensitivity = clamp(config.demandFeedbackSensitivity, 0, 3, DEMAND_FEEDBACK_SENSITIVITY);
  }
  if (config.creditUESensitivity !== undefined) {
    // audit H679 range alignment: clamp follows the documented range (0-20, types/index.ts);
    // the old 0-10 clamp was uncited AND its fallback 2.0 disagreed with the default 8.0.
    // (Field is dead on the simulation path — mechanical alignment only.)
    config.creditUESensitivity = clamp(config.creditUESensitivity, 0, 20, CREDIT_UE_SENSITIVITY);
  }
  if (config.creditInvestmentSensitivity !== undefined) {
    config.creditInvestmentSensitivity = clamp(config.creditInvestmentSensitivity, 0, 1.0, CREDIT_INVESTMENT_SENSITIVITY);
  }
  if (config.creditConsumptionSensitivity !== undefined) {
    config.creditConsumptionSensitivity = clamp(config.creditConsumptionSensitivity, 0, 1.0, CREDIT_CONSUMPTION_SENSITIVITY);
  }

  // --- Phase 5g Corporate Profits & Financial Markets ---
  // (fallbacks by reference — audit H679; values were consistent, the copies were the hazard)
  if (config.aiProfitMargin !== undefined) {
    config.aiProfitMargin = clamp(config.aiProfitMargin, 0, 0.999, DEFAULT_AI_PROFIT_MARGIN);
  }
  if (config.traditionalProfitMargin !== undefined) {
    config.traditionalProfitMargin = clamp(config.traditionalProfitMargin, 0, 0.30, DEFAULT_TRADITIONAL_PROFIT_MARGIN);
  }
  // --- Asset Income Decomposition: P/E sensitivity ---
  if (config.aiPESensitivity !== undefined) {
    config.aiPESensitivity = clamp(config.aiPESensitivity, 25, 250, DEFAULT_AI_PE_SENSITIVITY);
  }
  if (config.traditionalPESensitivity !== undefined) {
    config.traditionalPESensitivity = clamp(config.traditionalPESensitivity, 15, 150, DEFAULT_TRADITIONAL_PE_SENSITIVITY);
  }

  // --- Phase 5g Minimum Wage Feedback ---
  if (config.wagePassThrough !== undefined) {
    config.wagePassThrough = clamp(config.wagePassThrough, 0, 1, DEFAULT_WAGE_PASS_THROUGH);
  }
  if (config.wageAutomationSensitivity !== undefined) {
    config.wageAutomationSensitivity = clamp(config.wageAutomationSensitivity, 0, 1, DEFAULT_WAGE_AUTOMATION_SENSITIVITY);
  }

  // --- Phase 5g Sector Scarcity Inflation ---
  if (config.scarcityPassThrough !== undefined) {
    config.scarcityPassThrough = clamp(config.scarcityPassThrough, 0, 1, DEFAULT_SCARCITY_PASS_THROUGH);
  }

  // --- Phase 4 Quality Pass: Deflation curve params ---
  if (config.deflationMidpoint !== undefined) {
    config.deflationMidpoint = clamp(config.deflationMidpoint, 0.01, 0.15, DEFLATION_MIDPOINT);
  }
  if (config.deflationSteepness !== undefined) {
    // audit H679 range ruling: clamp KEEPS 10-80 — the documented range (types/index.ts) and the
    // clamp agree; the UI slider (5-100) is the outlier and is handed back for narrowing.
    config.deflationSteepness = clamp(config.deflationSteepness, 10, 80, DEFLATION_STEEPNESS);
  }

  // --- Phase 5g Step 12: Labor supply response ---
  if (config.participationElasticity !== undefined) {
    config.participationElasticity = clamp(config.participationElasticity, 0, 1, DEFAULT_PARTICIPATION_ELASTICITY);
  }
  if (config.participationThreshold !== undefined) {
    config.participationThreshold = clamp(config.participationThreshold, 0, 1, DEFAULT_PARTICIPATION_THRESHOLD);
  }

  // --- Phase 5i: Housing, Shelter Inflation & Mortgage Stress ---
  if (config.businessCreditGDPSensitivity !== undefined) {
    config.businessCreditGDPSensitivity = clamp(config.businessCreditGDPSensitivity, 0, 15, DEFAULT_BUSINESS_CREDIT_GDP_SENSITIVITY);
  }
  if (config.maxBusinessCreditLoosening !== undefined) {
    config.maxBusinessCreditLoosening = clamp(config.maxBusinessCreditLoosening, 0, 1, DEFAULT_MAX_BUSINESS_CREDIT_LOOSENING);
  }
  if (config.shelterCPIWeight !== undefined) {
    config.shelterCPIWeight = clamp(config.shelterCPIWeight, 0.20, 0.50, BASELINE_SHELTER_CPI_WEIGHT);
  }
  if (config.shelterInflationStickiness !== undefined) {
    config.shelterInflationStickiness = clamp(config.shelterInflationStickiness, 0, 1, DEFAULT_SHELTER_INFLATION_STICKINESS);
  }
  if (config.mortgageStressAmplifier !== undefined) {
    config.mortgageStressAmplifier = clamp(config.mortgageStressAmplifier, 0, 2, DEFAULT_MORTGAGE_STRESS_AMPLIFIER);
  }
  if (config.foreclosureLag !== undefined) {
    config.foreclosureLag = clamp(config.foreclosureLag, 0, 3, DEFAULT_FORECLOSURE_LAG);
  }
  if (config.homeownershipRecoveryRate !== undefined) {
    config.homeownershipRecoveryRate = clamp(config.homeownershipRecoveryRate, 0, 0.10, DEFAULT_HOMEOWNERSHIP_RECOVERY_RATE);
  }
  if (config.housingWealthMPC !== undefined) {
    config.housingWealthMPC = clamp(config.housingWealthMPC, 0, 0.15, DEFAULT_HOUSING_WEALTH_MPC);
  }
  if (config.mpcWageUESensitivity !== undefined) {
    config.mpcWageUESensitivity = clamp(config.mpcWageUESensitivity, 0, 0.05, DEFAULT_MPC_WAGE_UE_SENSITIVITY);
  }
  if (config.creditAdoptionSensitivity !== undefined) {
    config.creditAdoptionSensitivity = clamp(config.creditAdoptionSensitivity, 0, 0.5, DEFAULT_CREDIT_ADOPTION_SENSITIVITY);
  }

  // --- Housing Market Stabilization ---
  if (config.institutionalBuyerRate !== undefined) {
    // audit H679: fallback references the hoisted constant (the `?? 0.40` five-site literal family)
    config.institutionalBuyerRate = clamp(config.institutionalBuyerRate, 0, 1, DEFAULT_INSTITUTIONAL_BUYER_RATE);
  }
  if (config.rentalDemandSensitivity !== undefined) {
    config.rentalDemandSensitivity = clamp(config.rentalDemandSensitivity, 0, 1, 0.50);
  }
  if (config.shelterInflationFloor !== undefined) {
    config.shelterInflationFloor = clamp(config.shelterInflationFloor, -0.15, 0, -0.05);
  }

  // --- Investment Demand Constraint ---
  if (config.aiUtilizationSensitivity !== undefined) {
    config.aiUtilizationSensitivity = clamp(config.aiUtilizationSensitivity, 0, 100, 50);
  }
  if (config.consumerDemandInvestmentSensitivity !== undefined) {
    config.consumerDemandInvestmentSensitivity = clamp(config.consumerDemandInvestmentSensitivity, 0, 100, 50);
  }
  if (config.creditInvestmentResponseSensitivity !== undefined) {
    config.creditInvestmentResponseSensitivity = clamp(config.creditInvestmentResponseSensitivity, 0, 100, 50);
  }
  if (config.traditionalInvestmentDemandSensitivity !== undefined) {
    config.traditionalInvestmentDemandSensitivity = clamp(config.traditionalInvestmentDemandSensitivity, 0, 100, 30);
  }
  if (config.traditionalInvestmentGDPFraction !== undefined) {
    // audit H679: 0.175 was a frozen approximation of the BEA-derived live value (≈0.17525)
    config.traditionalInvestmentGDPFraction = clamp(config.traditionalInvestmentGDPFraction, 0.05, 0.40, TRADITIONAL_INVESTMENT_GDP_FRACTION);
  }

  // --- Credit & Deflation ---
  if (config.creditDeflationSensitivity !== undefined) {
    // audit H679 range alignment: clamp follows the documented range (0-1, types/index.ts);
    // the old 0-0.50 clamp bound was uncited.
    config.creditDeflationSensitivity = clamp(config.creditDeflationSensitivity, 0, 1, DEFAULT_CREDIT_DEFLATION_SENSITIVITY);
  if (config.creditDeflationImpulseSensitivity !== undefined) {
    config.creditDeflationImpulseSensitivity = clamp(config.creditDeflationImpulseSensitivity, 0, 0.05, 0.007);
  }
  if (config.creditDeflationPersistence !== undefined) {
    config.creditDeflationPersistence = clamp(config.creditDeflationPersistence, 0, 0.9, 0.5);
  }
  if (config.creditDeflationNoiseFloor !== undefined) {
    config.creditDeflationNoiseFloor = clamp(config.creditDeflationNoiseFloor, 0, 0.2, 0.05);
  }
  if (config.erpCrisisSensitivity !== undefined) {
    config.erpCrisisSensitivity = clamp(config.erpCrisisSensitivity, 0, 0.15, 0.046);
  }
  }

  // --- Tax & Economic Pipeline (Phase 5-tax) ---
  // Data-derived fallbacks (audit H679): the old literals (0.40, 0.124/0.140/0.164/0.165) were
  // frozen approximations of BEA-derived values; they now reference the same govData-backed
  // constants the live path resolves through.
  if (config.corporateRetentionRate !== undefined) {
    config.corporateRetentionRate = clamp(config.corporateRetentionRate, 0, 1, BASELINE_CORPORATE_RETENTION_RATE);
  }
  if (config.aiProfitGrowthRate !== undefined) {
    config.aiProfitGrowthRate = clamp(config.aiProfitGrowthRate, 0.5, 10, DEFAULT_AI_PROFIT_GROWTH_RATE);
  }
  if (config.taxConfig) {
    const tc = { ...config.taxConfig };
    tc.incomeTaxRate = clamp(tc.incomeTaxRate, 0, 1, BASELINE_INCOME_TAX_RATE);
    tc.payrollTaxRate = clamp(tc.payrollTaxRate, 0, 1, BASELINE_PAYROLL_RATE);
    tc.corporateTaxRate = clamp(tc.corporateTaxRate, 0, 1, BASELINE_CORPORATE_TAX_RATE);
    if (tc.capitalGainsTaxRate !== undefined) {
      tc.capitalGainsTaxRate = clamp(tc.capitalGainsTaxRate, 0, 1, BASELINE_CAPITAL_GAINS_RATE);
    }
    config.taxConfig = tc;
  }
  if (config.postTaxMPCs) {
    const mpc = { ...config.postTaxMPCs };
    mpc.wage = clamp(mpc.wage, 0, 1, DEFAULT_POST_TAX_MPC_WAGE);
    mpc.asset = clamp(mpc.asset, 0, 1, DEFAULT_POST_TAX_MPC_ASSET);
    mpc.transfer = clamp(mpc.transfer, 0, 1, DEFAULT_POST_TAX_MPC_TRANSFER);
    config.postTaxMPCs = mpc;
  }
  if (config.aiCostParams) {
    const ac = { ...config.aiCostParams };
    ac.inferenceAnnualChange = clamp(ac.inferenceAnnualChange, -0.80, 0.50, DEFAULT_INFERENCE_ANNUAL_CHANGE);
    ac.manufacturingAnnualChange = clamp(ac.manufacturingAnnualChange, -0.50, 0.50, DEFAULT_MANUFACTURING_ANNUAL_CHANGE);
    ac.energyAnnualChange = clamp(ac.energyAnnualChange, -0.50, 0.50, DEFAULT_ENERGY_ANNUAL_CHANGE);
    // Mini-stage 1 (frontier-intensity cost layer): the four frontier dials, ranges
    // per types/index.ts AICostParams; optional fields clamp only when present
    // (the taxConfig.capitalGainsTaxRate convention).
    if (ac.frontierIntensityLevel !== undefined) {
      ac.frontierIntensityLevel = clamp(ac.frontierIntensityLevel, 1, 100, DEFAULT_FRONTIER_INTENSITY_LEVEL);
    }
    if (ac.frontierIntensityGrowth !== undefined) {
      ac.frontierIntensityGrowth = clamp(ac.frontierIntensityGrowth, -0.15, 0.40, DEFAULT_FRONTIER_INTENSITY_GROWTH);
    }
    if (ac.sigmaMigration !== undefined) {
      ac.sigmaMigration = clamp(ac.sigmaMigration, 0.02, 1.0, DEFAULT_SIGMA_MIGRATION);
    }
    if (ac.wMinFrontierFloor !== undefined) {
      ac.wMinFrontierFloor = clamp(ac.wMinFrontierFloor, 0, 0.5, DEFAULT_W_MIN_FRONTIER_FLOOR);
    }
    config.aiCostParams = ac;
  }

  // --- Phase 6: Separated Consumer & Business Credit ---
  // Fallbacks by reference (audit H679). Two of the old literals had drifted from the live
  // defaults: maxConsumerTightening 0.5 (vs live 1.0, the R18/H6 re-anchor) and
  // consumerCreditImpact 0.06 (vs live 0.12, the matching saturation re-anchor).
  if (config.transferReliabilityWeight !== undefined) {
    config.transferReliabilityWeight = clamp(config.transferReliabilityWeight, 0.30, 0.95, DEFAULT_TRANSFER_RELIABILITY_WEIGHT);
  }
  if (config.incomeAdequacySensitivity !== undefined) {
    config.incomeAdequacySensitivity = clamp(config.incomeAdequacySensitivity, 0.5, 5.0, DEFAULT_INCOME_ADEQUACY_SENSITIVITY);
  }
  if (config.collateralSensitivity !== undefined) {
    config.collateralSensitivity = clamp(config.collateralSensitivity, 0.0, 3.0, DEFAULT_COLLATERAL_SENSITIVITY);
  }
  if (config.systemicRiskSensitivity !== undefined) {
    config.systemicRiskSensitivity = clamp(config.systemicRiskSensitivity, 0.5, 4.0, DEFAULT_SYSTEMIC_RISK_SENSITIVITY);
  }
  if (config.inflationRiskSensitivity !== undefined) {
    config.inflationRiskSensitivity = clamp(config.inflationRiskSensitivity, 0.0, 2.0, DEFAULT_INFLATION_RISK_SENSITIVITY);
  }
  if (config.maxConsumerTightening !== undefined) {
    config.maxConsumerTightening = clamp(config.maxConsumerTightening, 0.2, 1.0, DEFAULT_MAX_CONSUMER_TIGHTENING);
  }
  if (config.consumerCreditImpact !== undefined) {
    config.consumerCreditImpact = clamp(config.consumerCreditImpact, 0.02, 0.15, DEFAULT_CONSUMER_CREDIT_IMPACT);
  }
  if (config.profitabilitySensitivity !== undefined) {
    config.profitabilitySensitivity = clamp(config.profitabilitySensitivity, 0.5, 4.0, DEFAULT_PROFITABILITY_SENSITIVITY);
  }
  if (config.growthTrajectorySensitivity !== undefined) {
    config.growthTrajectorySensitivity = clamp(config.growthTrajectorySensitivity, 0.5, 5.0, DEFAULT_GROWTH_TRAJECTORY_SENSITIVITY);
  }
  if (config.maxBusinessTightening !== undefined) {
    config.maxBusinessTightening = clamp(config.maxBusinessTightening, 0.2, 1.0, DEFAULT_MAX_BUSINESS_TIGHTENING);
  }
  if (config.businessInvestmentImpact !== undefined) {
    config.businessInvestmentImpact = clamp(config.businessInvestmentImpact, 0.05, 0.30, DEFAULT_BUSINESS_INVESTMENT_IMPACT);
  }

  // --- Other Uncategorized Override ---
  if (config.otherUncategorizedMultiplierOverride !== undefined) {
    config.otherUncategorizedMultiplierOverride = clamp(config.otherUncategorizedMultiplierOverride, 0, 5, 1.0);
  }

  // --- Income Distribution ---
  if (config.bottom80WageShare !== undefined) {
    config.bottom80WageShare = clamp(config.bottom80WageShare, 0, 1, BOTTOM80_WAGE_SHARE);
  }
  if (config.bottom80TransferShare !== undefined) {
    config.bottom80TransferShare = clamp(config.bottom80TransferShare, 0, 1, BOTTOM80_TRANSFER_SHARE);
  }
  if (config.bottom80AssetShare !== undefined) {
    config.bottom80AssetShare = clamp(config.bottom80AssetShare, 0, 1, BOTTOM80_ASSET_SHARE);
  }

  // --- AI Production Parameters ---
  // Fallbacks by reference (audit H679): the old literals 0.40/0.15/0.80 had all drifted from
  // the live defaults 0.30/0.10/0.70.
  if (config.aiProductionInvestmentFraction !== undefined) {
    config.aiProductionInvestmentFraction = clamp(config.aiProductionInvestmentFraction, 0, 1, DEFAULT_AI_PRODUCTION_INVESTMENT_FRACTION);
  }
  if (config.aiProductionOnshoringFraction !== undefined) {
    config.aiProductionOnshoringFraction = clamp(config.aiProductionOnshoringFraction, 0, 1, DEFAULT_AI_PRODUCTION_ONSHORING_FRACTION);
  }
  if (config.newJobWageFraction !== undefined) {
    // audit H679 range alignment: clamp follows the documented/UI range (0-2, types/index.ts +
    // both sliders); the old 0-1 clamp was uncited and silently truncated the documented
    // premium-jobs half of the range on scenario/CSV round-trip.
    config.newJobWageFraction = clamp(config.newJobWageFraction, 0, 2, DEFAULT_NEW_JOB_WAGE_FRACTION);
  }

  // --- Phase 8 Fix 4: Yield calibration & fiscal risk premium (audit H679: clamps added) ---
  if (config.fiscalRiskPremiumMax !== undefined) {
    // clamp follows the doc/UI envelope 0.01-0.15 (no cited bound exists on either side; the
    // types doc range was widened to the shipped UI max — see types/index.ts)
    config.fiscalRiskPremiumMax = clamp(config.fiscalRiskPremiumMax, 0.01, 0.15, DEFAULT_FISCAL_RISK_PREMIUM_MAX);
  }
  if (config.inflationConvergenceYears !== undefined) {
    // clamp follows the doc/UI envelope 1-15 (doc min 2 was uncited; UI min is 1)
    config.inflationConvergenceYears = clamp(config.inflationConvergenceYears, 1, 15, DEFAULT_INFLATION_CONVERGENCE_YEARS);
  }

  // --- Stage 6.5 stock-flow housing family (audit H679: clamps ADDED) ---
  // These fields previously reached the model with no range enforcement at all (scenario JSON
  // is the only setter; KNOWN_CONFIG_KEYS was the only guard). Fallbacks reference the live
  // consumption-site constants (macro.ts computeHousingBlock `??` resolution — by-reference
  // rule). Bounds come from the types/index.ts doc comments where stated; where no documented
  // range exists the bound is an audit-added bound, UNCITED, marked per row.
  if (config.formationSensitivity !== undefined) {
    config.formationSensitivity = clamp(config.formationSensitivity, 0, 0.5, DEFAULT_FORMATION_SENSITIVITY); // audit-added bound, uncited
  }
  if (config.headshipRecoveryRate !== undefined) {
    config.headshipRecoveryRate = clamp(config.headshipRecoveryRate, 0, 1, DEFAULT_HEADSHIP_RECOVERY_RATE); // audit-added bound, uncited (annual reversion rate)
  }
  if (config.housingSupplyElasticity !== undefined) {
    config.housingSupplyElasticity = clamp(config.housingSupplyElasticity, 0, 10, DEFAULT_HOUSING_SUPPLY_ELASTICITY); // audit-added bound, uncited (Saiz 2010 metro range ~0.6-5.5 sits inside)
  }
  if (config.embodiedCapacityGain !== undefined) {
    config.embodiedCapacityGain = clamp(config.embodiedCapacityGain, 0, 5, DEFAULT_EMBODIED_CAPACITY_GAIN); // audit-added bound, uncited
  }
  if (config.housingDepreciationRate !== undefined) {
    config.housingDepreciationRate = clamp(config.housingDepreciationRate, 0, 0.05, DEFAULT_HOUSING_DEPRECIATION_RATE); // audit-added bound, uncited
  }
  if (config.landShare !== undefined) {
    // min = LAND_SHARE_DIVISION_FLOOR: landShare DIVIDES the E-11 residual closure
    // (macro.ts computeHousingBlock) — landShare = 0 divided by zero before this clamp.
    // max 0.95: audit-added bound, uncited.
    config.landShare = clamp(config.landShare, LAND_SHARE_DIVISION_FLOOR, 0.95, DEFAULT_LAND_SHARE);
  }
  if (config.constructionLaborShare !== undefined) {
    config.constructionLaborShare = clamp(config.constructionLaborShare, 0, 1, DEFAULT_CONSTRUCTION_LABOR_SHARE); // share ∈ [0,1]
  }
  if (config.landIncomeBeta !== undefined) {
    config.landIncomeBeta = clamp(config.landIncomeBeta, 0, 3, DEFAULT_LAND_INCOME_BETA); // audit-added bound, uncited (0 = doc'd off-pole)
  }
  if (config.landScarcityElasticity !== undefined) {
    config.landScarcityElasticity = clamp(config.landScarcityElasticity, 0, 10, DEFAULT_LAND_SCARCITY_ELASTICITY); // audit-added bound, uncited
  }
  if (config.rentOccupancyElasticity !== undefined) {
    config.rentOccupancyElasticity = clamp(config.rentOccupancyElasticity, 0, 10, DEFAULT_RENT_OCCUPANCY_ELASTICITY); // audit-added bound, uncited
  }
  if (config.rentCostAnchorWeight !== undefined) {
    config.rentCostAnchorWeight = clamp(config.rentCostAnchorWeight, 0, 1, DEFAULT_RENT_COST_ANCHOR_WEIGHT); // weight; poles 0 (L9 live) / 1 (pre-L9 legacy) both preserved
  }
  if (config.baselineCapRate !== undefined) {
    config.baselineCapRate = clamp(config.baselineCapRate, 0.01, 0.20, DEFAULT_BASELINE_CAP_RATE); // audit-added bound, uncited
  }
  if (config.capRateMortgageBeta !== undefined) {
    config.capRateMortgageBeta = clamp(config.capRateMortgageBeta, 0, 2, DEFAULT_CAP_RATE_MORTGAGE_BETA); // audit-added bound, uncited (lit. beta 0.3-0.5 sits inside)
  }
  if (config.capRateInvestorCompression !== undefined) {
    config.capRateInvestorCompression = clamp(config.capRateInvestorCompression, 0, 1, DEFAULT_CAP_RATE_INVESTOR_COMPRESSION); // audit-added bound, uncited (default 0 = off)
  }
  if (config.fireSaleElasticity !== undefined) {
    config.fireSaleElasticity = clamp(config.fireSaleElasticity, 0, 10, DEFAULT_FIRE_SALE_ELASTICITY); // audit-added bound, uncited
  }
  if (config.investorDemandIntensity !== undefined) {
    config.investorDemandIntensity = clamp(config.investorDemandIntensity, 0, 1, DEFAULT_INVESTOR_DEMAND_INTENSITY); // audit-added bound, uncited (0 = doc'd off-pole)
  }
  if (config.landRateSensitivity !== undefined) {
    config.landRateSensitivity = clamp(config.landRateSensitivity, 0, 5, DEFAULT_LAND_RATE_SENSITIVITY); // audit-added bound, uncited (0 = doc'd pre-E-6 pole)
  }
  if (config.landClosureKappa !== undefined) {
    config.landClosureKappa = clamp(config.landClosureKappa, 0, 1, DEFAULT_LAND_CLOSURE_KAPPA); // closure speed; 0 = legacy-branch sentinel, preserved
  }
  if (config.mortgageRateReference !== undefined) {
    config.mortgageRateReference = clamp(config.mortgageRateReference, 0.01, 0.20, BASELINE_MORTGAGE_RATE_2025); // audit-added bound, uncited; fallback = the FRED-data-derived live anchor
  }
  if (config.opexPassthrough !== undefined) {
    config.opexPassthrough = clamp(config.opexPassthrough, 0, 1, DEFAULT_OPEX_PASSTHROUGH); // share ∈ [0,1]
  }
  if (config.rentDownwardRigidity !== undefined) {
    config.rentDownwardRigidity = clamp(config.rentDownwardRigidity, 0, 1, DEFAULT_RENT_DOWNWARD_RIGIDITY); // doc'd [0,1] (1 = never cut)
  }
  if (config.rentIncomeElasticity !== undefined) {
    config.rentIncomeElasticity = clamp(config.rentIncomeElasticity, 0, 2, DEFAULT_RENT_INCOME_ELASTICITY); // audit-added bound, uncited
  }
  if (config.builderAdjustmentLambda !== undefined) {
    config.builderAdjustmentLambda = clamp(config.builderAdjustmentLambda, 0, 1, DEFAULT_BUILDER_ADJUSTMENT_LAMBDA); // smoothing factor ∈ [0,1]; 0 = legacy sentinel, preserved
  }
  if (config.housingPipelineDuration !== undefined) {
    // 0 preserved as the documented "≤ 0 = legacy 1-yr lag" sentinel (negatives clamp to 0,
    // which selects the same legacy branch); max 10: audit-added bound, uncited
    config.housingPipelineDuration = clamp(config.housingPipelineDuration, 0, 10, HOUSING_PIPELINE_DURATION_YEARS);
  }
  if (config.constructionCreditSensitivity !== undefined) {
    config.constructionCreditSensitivity = clamp(config.constructionCreditSensitivity, 0, 10, DEFAULT_CONSTRUCTION_CREDIT_SENSITIVITY); // audit-added bound, uncited (0 = doc'd no-gate pole)
  }
  if (config.builderPriceMode !== undefined
    && !['spot', 'trend-aware', 'adaptive'].includes(config.builderPriceMode)) {
    // enum guard (audit H679): malformed scenario JSON resets to undefined → the live default
    // resolution ('trend-aware') applies
    warnings.push(`builderPriceMode '${String(config.builderPriceMode)}' is not one of spot|trend-aware|adaptive. Reset to default.`);
    config.builderPriceMode = undefined;
  }

  // --- Phase 9: Supply Chain Validation ---
  if (config.supplyChainConfig) {
    const sc = { ...config.supplyChainConfig };
    const inp = { ...sc.inputs };
    inp.aiChips = clamp(inp.aiChips, 0, 100, 100);
    // Mini-stage 2 (C-3): chip PRICE index — mirrors the energyPrice clamp [50, 500].
    // clamp() also HEALS persisted/legacy configs that predate the field (undefined → 100).
    inp.chipPrice = clamp(inp.chipPrice, 50, 500, 100);
    inp.energyPrice = clamp(inp.energyPrice, 50, 500, 100);
    inp.energyCapacity = clamp(inp.energyCapacity, 0, 100, 100);
    inp.trainingDCCapacity = clamp(inp.trainingDCCapacity, 0, 100, 100);
    inp.inferenceDCCapacity = clamp(inp.inferenceDCCapacity, 0, 100, 100);
    inp.roboticsHardware = clamp(inp.roboticsHardware, 0, 100, 100);
    inp.softwareEfficiency = clamp(inp.softwareEfficiency, 50, 300, 100);
    sc.inputs = inp;

    const res = { ...sc.resilience };
    res.aiChips = clamp(res.aiChips, 0, 0.85, 0.05);
    res.energy = clamp(res.energy, 0, 0.95, 0.85);
    res.trainingDC = clamp(res.trainingDC, 0, 0.95, 0.90);
    res.inferenceDC = clamp(res.inferenceDC, 0, 0.95, 0.90);
    res.roboticsHardware = clamp(res.roboticsHardware, 0, 0.85, 0.05);
    sc.resilience = res;

    const tc = { ...sc.trainingComposition };
    tc.aiChips = clamp(tc.aiChips, 0, 1, 0.55);
    tc.energy = clamp(tc.energy, 0, 1, 0.25);
    tc.datacenter = clamp(tc.datacenter, 0, 1, 0.20);
    const tcSum = tc.aiChips + tc.energy + tc.datacenter;
    if (tcSum > 0 && Math.abs(tcSum - 1.0) > 0.001) {
      tc.aiChips /= tcSum; tc.energy /= tcSum; tc.datacenter /= tcSum;
    }
    sc.trainingComposition = tc;

    sc.trainingScaleGrowthRate = clamp(sc.trainingScaleGrowthRate, 1.0, 10.0, 3.0);
    sc.chipCascadeLag = clamp(sc.chipCascadeLag, 1, 5, 2.5);
    sc.chipCascadeCostPremium = clamp(sc.chipCascadeCostPremium, 0, 0.50, 0.30);
    sc.costPassThroughRate = clamp(sc.costPassThroughRate, 0, 1, 0);
    sc.consumerPassThroughRate = clamp(sc.consumerPassThroughRate, 0, 1, 0.50);
    sc.hysteresisMaxCognitive = clamp(sc.hysteresisMaxCognitive, 0, 0.50, 0.25);
    sc.hysteresisMaxEmbodied = clamp(sc.hysteresisMaxEmbodied, 0, 0.60, 0.35);
    sc.regulatoryFriction = clamp(sc.regulatoryFriction, 0.1, 5.0, 1.0);

    // MS1 (the frontier stock): optional dials — clamp only when present; absent stays
    // absent (consumption sites default via the constants, the persist-compat form).
    if (sc.frontierDrainScale !== undefined) sc.frontierDrainScale = clamp(sc.frontierDrainScale, 0, 1.4, 1.0);
    if (sc.frontierRebuildYears !== undefined) sc.frontierRebuildYears = clamp(sc.frontierRebuildYears, 1, 10, 4.0);
    if (sc.frontierRateElasticity !== undefined) sc.frontierRateElasticity = clamp(sc.frontierRateElasticity, 0, 3, 1.0);
    if (sc.frontierInnovationElasticity !== undefined) sc.frontierInnovationElasticity = clamp(sc.frontierInnovationElasticity, 0, 1, 0.5);
    if (sc.resilienceOnsetYears !== undefined) sc.resilienceOnsetYears = clamp(sc.resilienceOnsetYears, 0, 8, 4.0);

    const td = {
      aiChips: { ...sc.trainingDynamics.aiChips },
      energy: { ...sc.trainingDynamics.energy },
      datacenter: { ...sc.trainingDynamics.datacenter },
    };
    td.aiChips.techDeclineRate = clamp(td.aiChips.techDeclineRate, -0.80, 0.30, -0.35);
    // MS1 re-anchor: fallback default 0.05 → 0.3186 (Epoch stable-hardware-share; the
    // constant's derivation comment is authoritative — this fallback mirrors it).
    td.aiChips.scalePressure = clamp(td.aiChips.scalePressure, 0, 0.50, 0.3186);
    td.energy.techDeclineRate = clamp(td.energy.techDeclineRate, -0.30, 0.30, -0.04);
    td.energy.scalePressure = clamp(td.energy.scalePressure, 0, 0.50, 0.15);
    td.datacenter.techDeclineRate = clamp(td.datacenter.techDeclineRate, -0.30, 0.30, -0.08);
    td.datacenter.scalePressure = clamp(td.datacenter.scalePressure, 0, 0.50, 0.25);
    sc.trainingDynamics = td;

    // Procurement shares (must sum to 1.0)
    const ps = { ...sc.procurementShares };
    ps.aiChips = clamp(ps.aiChips, 0, 1, 0.45);
    ps.energy = clamp(ps.energy, 0, 1, 0.35);
    ps.datacenter = clamp(ps.datacenter, 0, 1, 0.20);
    const psSum = ps.aiChips + ps.energy + ps.datacenter;
    if (psSum > 0 && Math.abs(psSum - 1.0) > 0.001) {
      ps.aiChips /= psSum; ps.energy /= psSum; ps.datacenter /= psSum;
    }
    sc.procurementShares = ps;

    sc.costVsProcurementBlend = clamp(sc.costVsProcurementBlend, 0, 1, 0.50);

    sc.sensitivityBlendCognitive = clamp(sc.sensitivityBlendCognitive, -1, 1, -1);
    sc.sensitivityBlendEmbodied = clamp(sc.sensitivityBlendEmbodied, -1, 1, -1);

    config.supplyChainConfig = sc;
  }

  // --- Capability Trajectory Validation ---
  for (const vecId of ['generative', 'agentic', 'embodied'] as const) {
    const cap = config.capabilities[vecId];
    if (cap) {
      cap.floor = clamp(cap.floor, 0, 1, 0);
      cap.ceiling = clamp(cap.ceiling, 0, 1, 1);
      if (cap.floor > cap.ceiling) {
        warnings.push(`capability.${vecId}: floor (${cap.floor}) > ceiling (${cap.ceiling}). Swapping.`);
        const tmp = cap.floor;
        cap.floor = cap.ceiling;
        cap.ceiling = tmp;
      }
      cap.steepness = clamp(cap.steepness, 0.01, 5, 0.5);
      cap.midpointYear = Math.round(clamp(cap.midpointYear, 2020, 2070, 2030));
    }
  }

  // THE FLYWHEEL (root-level dials — always-on, so they cannot live under the optional
  // supplyChainConfig): clamp only when present; absent stays absent (consumption-site
  // constants, the persist-compat form). θ's 0.75 cap is MEASUREMENT-DERIVED — the
  // pinned-path funding minimum is 0.776 (scenario C, 2050), so every in-range value
  // keeps the identity gate's dead zone over every pin.
  if (config.flywheelStarvationThreshold !== undefined) {
    // Stage 1 (MS5): the θ range re-derived under the NEW F (pinned minimum 0.105 −
    // margin → cap 0.10; the same protocol as the retired 0.75 under the old F).
    config.flywheelStarvationThreshold = clamp(config.flywheelStarvationThreshold, 0, 0.10, 0.10);
  }
  if (config.frontierCostElasticity !== undefined) {
    config.frontierCostElasticity = clamp(config.frontierCostElasticity, 0, 3, 1.0);
  }
  // Stage 2 (Channel 2): units per fully-automated embodied worker — the cited-anchored
  // honest band [0.5, 1.5] (IFR robot-density-class basis; constants.ts).
  if (config.unitsPerEmbodiedWorker !== undefined) {
    config.unitsPerEmbodiedWorker = clamp(config.unitsPerEmbodiedWorker, 0.5, 1.5, 1.0);
  }
  // Stage 2 (elasticity absorption): the cited ranges per sector (constants.ts rows
  // 36–38). Zero is admitted deliberately (QB-3 Leg C: ε = 0 recovers the pure
  // twin-benchmark absorption).
  if (config.absorptionElasticityAiExposed !== undefined) {
    config.absorptionElasticityAiExposed = clamp(config.absorptionElasticityAiExposed, 0, 1.0, 0.75);
  }
  if (config.absorptionElasticityLaborServices !== undefined) {
    config.absorptionElasticityLaborServices = clamp(config.absorptionElasticityLaborServices, 0, 0.5, 0.20);
  }
  if (config.absorptionElasticityFoodEnergy !== undefined) {
    config.absorptionElasticityFoodEnergy = clamp(config.absorptionElasticityFoodEnergy, 0, 0.8, 0.40);
  }
  // Stage 3 MS3: the issuance rate's cited range.
  if (config.equityIssuanceRate !== undefined) {
    config.equityIssuanceRate = clamp(config.equityIssuanceRate, 0.005, 0.03, 0.015);
  }
  // Stage 3 MS4: Channel 3's cited ranges (NCSES sales-basis intensity; the HMM
  // elasticity range — the N2 axis moves ONLY inside it, per R5's condition).
  if (config.aiRdIntensity !== undefined) {
    config.aiRdIntensity = clamp(config.aiRdIntensity, 0.02, 0.20, 0.12);
  }
  if (config.rdTfpElasticity !== undefined) {
    config.rdTfpElasticity = clamp(config.rdTfpElasticity, 0.01, 0.25, 0.08);
  }
  // Stage 4 MS2: N1's leg-cost trend beliefs (defaults = the Stage-1 constants).
  if (config.buildoutChipsCostTrend !== undefined) {
    config.buildoutChipsCostTrend = clamp(config.buildoutChipsCostTrend, -0.5, 0.05, -0.26);
  }
  if (config.buildoutEnergyCostTrend !== undefined) {
    config.buildoutEnergyCostTrend = clamp(config.buildoutEnergyCostTrend, -0.1, 0.1, 0.0);
  }
  if (config.buildoutDcCostTrend !== undefined) {
    config.buildoutDcCostTrend = clamp(config.buildoutDcCostTrend, -0.1, 0.1, 0.0);
  }
  if (config.buildoutFleetCostTrend !== undefined) {
    config.buildoutFleetCostTrend = clamp(config.buildoutFleetCostTrend, -0.25, 0.05, -0.05);
  }
  if (config.buildoutFleetRampGrowth !== undefined) {
    config.buildoutFleetRampGrowth = clamp(config.buildoutFleetRampGrowth, 0.05, 1.0, 0.35);
  }
  // Stage 4 MS4: the fleet-allocation smoothing step (the R3 class).
  if (config.fleetAllocSmoothing !== undefined) {
    config.fleetAllocSmoothing = clamp(config.fleetAllocSmoothing, 0.1, 1.0, 0.5);
  }
  // Stage 5A (A1 + E1): the energy queue's N1-owned beliefs.
  if (config.energyQueueLeadYears !== undefined) {
    config.energyQueueLeadYears = clamp(config.energyQueueLeadYears, 1, 8, 4);
  }
  if (config.energyQueueCeilingGrowth !== undefined) {
    config.energyQueueCeilingGrowth = clamp(config.energyQueueCeilingGrowth, 0, 1, 0.2);
  }
  if (config.energyBtmShare !== undefined) {
    config.energyBtmShare = clamp(config.energyBtmShare, 0, 0.8, 0.25);
  }

  return { config, warnings };
}

// ════════════════════════════════════════════════════════════
// D-fix (ruled, disposition 2): unknown-key rejection for scenario configs.
// The KNOWN_CONFIG_KEYS record is tsc-COMPLETENESS-ENFORCED: Record<keyof SimulationConfig, true>
// fails to compile if the interface gains a key this record lacks — the set cannot silently
// drift from the type. Born from the in-flight harness incident (a silent no-op mutation of a
// nonexistent field; vitest executes untyped) so the class cannot recur at runtime either.
// ════════════════════════════════════════════════════════════

const KNOWN_CONFIG_KEYS: Record<keyof SimulationConfig, true> = {
  adoptionParams: true,
  affordabilityPriceSensitivity: true,
  affordabilityReversionSensitivity: true,
  aiCostParams: true,
  aiDeflationPassthrough: true,
  aiExposedCPIWeight: true,
  aiPEMultiplier: true,
  aiPESensitivity: true,
  aiProductionInvestmentFraction: true,
  aiProductionOnshoringFraction: true,
  aiProfitGrowthRate: true,
  aiProfitMargin: true,
  aiSectorLaborShare: true,
  aiUtilizationSensitivity: true,
  aiWageProductivityMultiplier: true,
  alphaDriverParams: true,
  assetShareDriftRate: true,
  atrophyRate: true,
  augmentationAdoptionSteepness: true,
  augmentationMultiplier: true,
  baseInflationRate: true,
  baseWeightedAverageMaturity: true,
  baselineCapRate: true,
  baselineGDPGrowth: true,
  bfcsOverrides: true,
  bottom80AssetShare: true,
  bottom80TransferShare: true,
  bottom80WageShare: true,
  builderAdjustmentLambda: true,
  builderPriceMode: true,
  constructionCreditSensitivity: true,
  businessCreditGDPSensitivity: true,
  businessInvestmentImpact: true,
  capRateInvestorCompression: true,
  capRateMortgageBeta: true,
  capabilities: true,
  cashTransferPerUnemployed: true,
  clusterAutomationShareOverrides: true,
  clusterOverrides: true,
  collateralSensitivity: true,
  competitivePressureThreshold: true,
  consolidationCreditMax: true,
  constructionLaborShare: true,
  consumerCreditImpact: true,
  consumerDemandInvestmentSensitivity: true,
  corporateRetentionRate: true,
  corporateTaxEffectiveness: true,
  credibilityHorizonYears: true,
  creditAdoptionSensitivity: true,
  creditBarRealTrend: true,
  creditConsumptionSensitivity: true,
  creditDeflationSensitivity: true,
  creditDeflationImpulseSensitivity: true,
  creditDeflationPersistence: true,
  creditDeflationNoiseFloor: true,
  erpCrisisSensitivity: true,
  creditExpectationTurnover: true,
  creditInvestmentResponseSensitivity: true,
  creditInvestmentSensitivity: true,
  creditUESensitivity: true,
  deAdoptionRateCognitive: true,
  deAdoptionRateEmbodied: true,
  deferrableConsumptionShare: true,
  deflationIntensityOverrides: true,
  deflationMidpoint: true,
  deflationSteepness: true,
  demandFeedbackSensitivity: true,
  demandSpilloverTolerance: true,
  demandTrendGrowth: true,
  demographicHousingElasticity: true,
  // diagSpotBuilderPrice: true, // RETIRED (CO-D2, R3b)
  downwardStickinessRatio: true,
  downwardWageRigidity: true,
  effectiveLowerBound: true,
  embodiedCapacityGain: true,
  endYear: true,
  federalReserveCustom: true,
  federalReservePreset: true,
  exitBase: true,
  exitDurationSlope: true,
  fireSaleElasticity: true,
  fiscalAdjustmentHorizonYears: true,
  fiscalCredibilityTrigger: true,
  fiscalDominanceDampening: true,
  fiscalDominanceThreshold: true,
  flywheelStarvationThreshold: true,
  frontierCostElasticity: true,
  fiscalPolicyCustom: true,
  fiscalPolicyPreset: true,
  fiscalRiskLevelMidpoint: true,
  fiscalRiskLevelWeight: true,
  fiscalRiskPremiumMax: true,
  fiscalRiskSustainabilityWeight: true,
  fiscalRiskTrajectoryMidpoint: true,
  fiscalRiskTrajectoryWeight: true,
  foodEnergyCPIWeight: true,
  foodEnergyPassthrough: true,
  foreclosureLag: true,
  foreignTreasuryDemand: true,
  formationSensitivity: true,
  growthTrajectorySensitivity: true,
  headshipRecoveryRate: true,
  homeownershipRecoveryRate: true,
  housingDepreciationRate: true,
  housingPipelineDuration: true,
  housingSupplyElasticity: true,
  housingWealthMPC: true,
  inKindTransferPerUnemployed: true,
  incomeAdequacySensitivity: true,
  incomeHousingElasticity: true,
  inflationConvergenceYears: true,
  inflationDeterrentSensitivity: true,
  inflationIndexation: true,
  inflationRiskSensitivity: true,
  inflationTarget: true,
  innovationRate: true,
  institutionalBuyerRate: true,
  investorDemandIntensity: true,
  jobPersistenceFactor: true,
  laborCostShare: true,
  laborForce: true,
  laborServicesCPIWeight: true,
  laborServicesPassthrough: true,
  landClosureKappa: true,
  landIncomeBeta: true,
  landRateSensitivity: true,
  landScarcityElasticity: true,
  landShare: true,
  laubachDeficitBeta: true,
  laubachLevelBeta: true,
  // legacyCheaperProxy: true, // RETIRED (CO-D2, R3b)
  // seamBasisOnly: true, // RETIRED (CO-D2, R3b)
  // RETIRED (close-out; Amendment 2): legacyFiscalPremium — the E-8b isolation toggle;
  // unknown-key healing strips it from persisted configs.
  // legacyFiscalPremium: true,
  // legacyNairu: true, // RETIRED (CO-D2, R3b) — persisted configs heal by unknown-key stripping
  // legacySingleRollover: true, // RETIRED (CO-D2, R3b)
  // legacySupplyPressure: true, // RETIRED (CO-D2, R3b)
  // legacyTotalDeficitPremium: true, // RETIRED (CO-D2, R3b)
  marketAnchorInit: true,
  maturityStressSensitivity: true,
  maxBusinessCreditLoosening: true,
  maxBusinessTightening: true,
  maxConsumerTightening: true,
  maxCreditTightening: true,
  maxWeightedAverageMaturity: true,
  minWeightedAverageMaturity: true,
  monetizationDominanceThreshold: true,
  monetizationPremiumCoCondition: true,
  monetizationTransmissionSensitivity: true,
  mortgageRateReference: true,
  mortgageStressAmplifier: true,
  mpcWageUESensitivity: true,
  neutralRealRate: true,
  newJobWageFraction: true,
  nonShelterBaseInflation: true,
  opexPassthrough: true,
  otherCostsShare: true,
  otherUncategorizedMultiplierOverride: true,
  parameterOverrides: true,
  participationElasticity: true,
  participationThreshold: true,
  pceCpiWedge: true,
  pceFormulaEffect: true,
  phillipsCurveSensitivity: true,
  phillipsSlope: true,
  policyConfig: true,
  policyRateSchedule: true,
  populationGrowthRate: true,
  postTaxMPCs: true,
  productivityPassthrough: true,
  profitabilitySensitivity: true,
  qeMonetizationRate: true,
  rdMultiplier: true,
  reAdoptionRate: true,
  rentCostAnchorWeight: true,
  rentDownwardRigidity: true,
  rentIncomeElasticity: true,
  rentOccupancyElasticity: true,
  rentSharingElasticity: true,
  rentalDemandSensitivity: true,
  replacementMultiplier: true,
  revenuePressureCap: true,
  revenuePressureDecay: true,
  revenuePressureSensitivity: true,
  roleAutomationShareOverrides: true,
  roleReplacementDifficultyWagePremiumOverrides: true,
  roleReplacementFrictionYearsOverrides: true,
  safetyFlightSensitivity: true,
  scarcityIntensity: true,
  scarcityPassThrough: true,
  secularProfitDriftRate: true,
  shelterCPIWeight: true,
  shelterInflationFloor: true,
  shelterInflationStickiness: true,
  shelterPassthrough: true,
  sovereignConfidenceDecayRate: true,
  startYear: true,
  stateOverrides: true,
  supplyChainConfig: true,
  supplyPressureSensitivity: true,
  systemicRiskSensitivity: true,
  taxConfig: true,
  taylorSmoothing: true,
  termPremium: true,
  totalPopulation: true,
  traditionalInvestmentDemandSensitivity: true,
  traditionalInvestmentGDPFraction: true,
  traditionalPESensitivity: true,
  traditionalProfitMargin: true,
  transferReliabilityWeight: true,
  usePceProxy: true,
  velocitySensitivity: true,
  wageScarringRate: true,
  wageAutomationSensitivity: true,
  // Production Program Stage 1 — Channel 1 (the buildout)
  aiRetentionShare: true,
  buildoutAllocSmoothing: true,
  aiBuildoutSeamAnchor: true,
  // Production Program Stage 2 — Channel 2 (the ledger re-anchor)
  unitsPerEmbodiedWorker: true,
  absorptionElasticityAiExposed: true,
  absorptionElasticityLaborServices: true,
  absorptionElasticityFoodEnergy: true,
  // Production Program Stage 3 — MS3 equity issuance (owner ruling v)
  equityIssuanceRate: true,
  // Production Program Stage 3 — MS4 Channel 3 + N2
  aiRdIntensity: true,
  rdTfpElasticity: true,
  buildoutChipsCostTrend: true,
  buildoutEnergyCostTrend: true,
  buildoutDcCostTrend: true,
  buildoutFleetCostTrend: true,
  buildoutFleetRampGrowth: true,
  fleetAllocSmoothing: true,
  energyQueueLeadYears: true,
  energyQueueCeilingGrowth: true,
  energyBtmShare: true,
  wagePassThrough: true,
  yieldAttractionMidpoint: true,
};

/** Throws on any config key not present in the SimulationConfig type (harness/scenario guard). */
export function assertKnownConfigKeys(config: SimulationConfig, context: string = 'config'): void {
  const unknown = Object.keys(config).filter(
    (k) => !(k in KNOWN_CONFIG_KEYS),
  );
  if (unknown.length > 0) {
    throw new Error(`Unknown SimulationConfig key(s) in ${context}: ${unknown.join(', ')}`);
  }
}
