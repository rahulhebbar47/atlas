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
  config.startYear = Math.round(ensureFinite(config.startYear, 2025));
  config.endYear = Math.round(ensureFinite(config.endYear, 2050));
  if (config.endYear <= config.startYear) {
    warnings.push(`endYear (${config.endYear}) must be > startYear (${config.startYear}). Reset to defaults.`);
    config.startYear = 2025;
    config.endYear = 2050;
  }

  // --- Population ---
  config.totalPopulation = Math.max(1, Math.round(ensureFinite(config.totalPopulation, 340_000_000)));
  config.laborForce = Math.max(1, Math.round(ensureFinite(config.laborForce, 168_000_000)));
  if (config.populationGrowthRate !== undefined) {
    config.populationGrowthRate = clamp(config.populationGrowthRate, -0.05, 0.10, 0.006);
  }

  // --- Macro Parameters ---
  config.baseInflationRate = clamp(config.baseInflationRate, 0, 0.50, 0.025);
  config.baselineGDPGrowth = clamp(config.baselineGDPGrowth, -0.10, 0.20, 0.022);

  // --- New Job Creation ---
  config.innovationRate = ensureFinite(config.innovationRate, 1.5e-8);
  config.rdMultiplier = clamp(config.rdMultiplier, 0, 100, 1.5);
  config.jobPersistenceFactor = clamp(config.jobPersistenceFactor, 0, 5, 1.5);

  // --- Optional parameters (only validate if defined) ---
  if (config.revenuePressureSensitivity !== undefined) {
    config.revenuePressureSensitivity = clamp(config.revenuePressureSensitivity, 0, 10, 1.0);
  }
  if (config.revenuePressureCap !== undefined) {
    config.revenuePressureCap = clamp(config.revenuePressureCap, 0, 1, 0.30);
  }
  if (config.revenuePressureDecay !== undefined) {
    config.revenuePressureDecay = clamp(config.revenuePressureDecay, 0, 1, 0.10);
  }
  if (config.aiWageProductivityMultiplier !== undefined) {
    config.aiWageProductivityMultiplier = clamp(config.aiWageProductivityMultiplier, 0, 2, 0.30);
  }
  if (config.phillipsCurveSensitivity !== undefined) {
    config.phillipsCurveSensitivity = clamp(config.phillipsCurveSensitivity, 0, 10, 1.2);
  }
  if (config.maxCreditTightening !== undefined) {
    config.maxCreditTightening = clamp(config.maxCreditTightening, 0.1, 1, 0.60);
  }
  if (config.deferrableConsumptionShare !== undefined) {
    config.deferrableConsumptionShare = clamp(config.deferrableConsumptionShare, 0, 1, 0.30);
  }
  if (config.velocitySensitivity !== undefined) {
    config.velocitySensitivity = clamp(config.velocitySensitivity, 0, 0.50, 0.03);
  }
  if (config.demandFeedbackSensitivity !== undefined) {
    config.demandFeedbackSensitivity = clamp(config.demandFeedbackSensitivity, 0, 5, 0.50);
  }
  if (config.creditUESensitivity !== undefined) {
    config.creditUESensitivity = clamp(config.creditUESensitivity, 0, 10, 2.0);
  }
  if (config.creditInvestmentSensitivity !== undefined) {
    config.creditInvestmentSensitivity = clamp(config.creditInvestmentSensitivity, 0, 1.0, 0.35);
  }
  if (config.creditConsumptionSensitivity !== undefined) {
    config.creditConsumptionSensitivity = clamp(config.creditConsumptionSensitivity, 0, 1.0, 0.06);
  }

  // --- Phase 5g Corporate Profits & Financial Markets ---
  if (config.aiProfitMargin !== undefined) {
    config.aiProfitMargin = clamp(config.aiProfitMargin, 0, 0.999, 0.25);
  }
  if (config.traditionalProfitMargin !== undefined) {
    config.traditionalProfitMargin = clamp(config.traditionalProfitMargin, 0, 0.30, 0.11);
  }
  // --- Asset Income Decomposition: P/E sensitivity ---
  if (config.aiPESensitivity !== undefined) {
    config.aiPESensitivity = clamp(config.aiPESensitivity, 25, 250, 100);
  }
  if (config.traditionalPESensitivity !== undefined) {
    config.traditionalPESensitivity = clamp(config.traditionalPESensitivity, 15, 150, 60);
  }

  // --- Phase 5g Minimum Wage Feedback ---
  if (config.wagePassThrough !== undefined) {
    config.wagePassThrough = clamp(config.wagePassThrough, 0, 1, 0.40);
  }
  if (config.wageAutomationSensitivity !== undefined) {
    config.wageAutomationSensitivity = clamp(config.wageAutomationSensitivity, 0, 1, 0.50);
  }

  // --- Phase 5g Sector Scarcity Inflation ---
  if (config.scarcityPassThrough !== undefined) {
    config.scarcityPassThrough = clamp(config.scarcityPassThrough, 0, 1, 0.30);
  }

  // --- Phase 4 Quality Pass: Deflation curve params ---
  if (config.deflationMidpoint !== undefined) {
    config.deflationMidpoint = clamp(config.deflationMidpoint, 0.01, 0.15, 0.05);
  }
  if (config.deflationSteepness !== undefined) {
    config.deflationSteepness = clamp(config.deflationSteepness, 10, 80, 40);
  }

  // --- Phase 5g Step 12: Labor supply response ---
  if (config.participationElasticity !== undefined) {
    config.participationElasticity = clamp(config.participationElasticity, 0, 1, 0.15);
  }
  if (config.participationThreshold !== undefined) {
    config.participationThreshold = clamp(config.participationThreshold, 0, 1, 0.60);
  }

  // --- Phase 5i: Housing, Shelter Inflation & Mortgage Stress ---
  if (config.businessCreditGDPSensitivity !== undefined) {
    config.businessCreditGDPSensitivity = clamp(config.businessCreditGDPSensitivity, 0, 15, 5.0);
  }
  if (config.maxBusinessCreditLoosening !== undefined) {
    config.maxBusinessCreditLoosening = clamp(config.maxBusinessCreditLoosening, 0, 1, 0.30);
  }
  if (config.shelterCPIWeight !== undefined) {
    config.shelterCPIWeight = clamp(config.shelterCPIWeight, 0.20, 0.50, 0.36);
  }
  if (config.shelterInflationStickiness !== undefined) {
    config.shelterInflationStickiness = clamp(config.shelterInflationStickiness, 0, 1, 0.80);
  }
  if (config.mortgageStressAmplifier !== undefined) {
    config.mortgageStressAmplifier = clamp(config.mortgageStressAmplifier, 0, 2, 0.40);
  }
  if (config.foreclosureLag !== undefined) {
    config.foreclosureLag = clamp(config.foreclosureLag, 0, 3, 0.75);
  }
  if (config.homeownershipRecoveryRate !== undefined) {
    config.homeownershipRecoveryRate = clamp(config.homeownershipRecoveryRate, 0, 0.10, 0.02);
  }
  if (config.housingWealthMPC !== undefined) {
    config.housingWealthMPC = clamp(config.housingWealthMPC, 0, 0.15, 0.05);
  }
  if (config.mpcWageUESensitivity !== undefined) {
    config.mpcWageUESensitivity = clamp(config.mpcWageUESensitivity, 0, 0.05, 0.005);
  }
  if (config.creditAdoptionSensitivity !== undefined) {
    config.creditAdoptionSensitivity = clamp(config.creditAdoptionSensitivity, 0, 0.5, 0.15);
  }

  // --- Housing Market Stabilization ---
  if (config.institutionalBuyerRate !== undefined) {
    config.institutionalBuyerRate = clamp(config.institutionalBuyerRate, 0, 1, 0.40);
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
    config.traditionalInvestmentGDPFraction = clamp(config.traditionalInvestmentGDPFraction, 0.05, 0.40, 0.175);
  }

  // --- Credit & Deflation ---
  if (config.creditDeflationSensitivity !== undefined) {
    config.creditDeflationSensitivity = clamp(config.creditDeflationSensitivity, 0, 0.50, 0.04);
  }

  // --- Tax & Economic Pipeline (Phase 5-tax) ---
  if (config.corporateRetentionRate !== undefined) {
    config.corporateRetentionRate = clamp(config.corporateRetentionRate, 0, 1, 0.40);
  }
  if (config.aiProfitGrowthRate !== undefined) {
    config.aiProfitGrowthRate = clamp(config.aiProfitGrowthRate, 0.5, 10, 2.0);
  }
  if (config.taxConfig) {
    const tc = { ...config.taxConfig };
    tc.incomeTaxRate = clamp(tc.incomeTaxRate, 0, 1, 0.124);
    tc.payrollTaxRate = clamp(tc.payrollTaxRate, 0, 1, 0.140);
    tc.corporateTaxRate = clamp(tc.corporateTaxRate, 0, 1, 0.164);
    if (tc.capitalGainsTaxRate !== undefined) {
      tc.capitalGainsTaxRate = clamp(tc.capitalGainsTaxRate, 0, 1, 0.165);
    }
    config.taxConfig = tc;
  }
  if (config.postTaxMPCs) {
    const mpc = { ...config.postTaxMPCs };
    mpc.wage = clamp(mpc.wage, 0, 1, 0.95);
    mpc.asset = clamp(mpc.asset, 0, 1, 0.42);
    mpc.transfer = clamp(mpc.transfer, 0, 1, 0.95);
    config.postTaxMPCs = mpc;
  }
  if (config.aiCostParams) {
    const ac = { ...config.aiCostParams };
    ac.inferenceAnnualChange = clamp(ac.inferenceAnnualChange, -0.80, 0.50, -0.45);
    ac.manufacturingAnnualChange = clamp(ac.manufacturingAnnualChange, -0.50, 0.50, -0.10);
    ac.energyAnnualChange = clamp(ac.energyAnnualChange, -0.50, 0.50, -0.03);
    config.aiCostParams = ac;
  }

  // --- Phase 6: Separated Consumer & Business Credit ---
  if (config.transferReliabilityWeight !== undefined) {
    config.transferReliabilityWeight = clamp(config.transferReliabilityWeight, 0.30, 0.95, 0.70);
  }
  if (config.incomeAdequacySensitivity !== undefined) {
    config.incomeAdequacySensitivity = clamp(config.incomeAdequacySensitivity, 0.5, 5.0, 2.0);
  }
  if (config.collateralSensitivity !== undefined) {
    config.collateralSensitivity = clamp(config.collateralSensitivity, 0.0, 3.0, 1.0);
  }
  if (config.systemicRiskSensitivity !== undefined) {
    config.systemicRiskSensitivity = clamp(config.systemicRiskSensitivity, 0.5, 4.0, 1.5);
  }
  if (config.inflationRiskSensitivity !== undefined) {
    config.inflationRiskSensitivity = clamp(config.inflationRiskSensitivity, 0.0, 2.0, 0.5);
  }
  if (config.maxConsumerTightening !== undefined) {
    config.maxConsumerTightening = clamp(config.maxConsumerTightening, 0.2, 1.0, 0.5);
  }
  if (config.consumerCreditImpact !== undefined) {
    config.consumerCreditImpact = clamp(config.consumerCreditImpact, 0.02, 0.15, 0.06);
  }
  if (config.profitabilitySensitivity !== undefined) {
    config.profitabilitySensitivity = clamp(config.profitabilitySensitivity, 0.5, 4.0, 1.5);
  }
  if (config.growthTrajectorySensitivity !== undefined) {
    config.growthTrajectorySensitivity = clamp(config.growthTrajectorySensitivity, 0.5, 5.0, 2.0);
  }
  if (config.maxBusinessTightening !== undefined) {
    config.maxBusinessTightening = clamp(config.maxBusinessTightening, 0.2, 1.0, 0.5);
  }
  if (config.businessInvestmentImpact !== undefined) {
    config.businessInvestmentImpact = clamp(config.businessInvestmentImpact, 0.05, 0.30, 0.15);
  }

  // --- Other Uncategorized Override ---
  if (config.otherUncategorizedMultiplierOverride !== undefined) {
    config.otherUncategorizedMultiplierOverride = clamp(config.otherUncategorizedMultiplierOverride, 0, 5, 1.0);
  }

  // --- Income Distribution ---
  if (config.bottom80WageShare !== undefined) {
    config.bottom80WageShare = clamp(config.bottom80WageShare, 0, 1, 0.45);
  }
  if (config.bottom80TransferShare !== undefined) {
    config.bottom80TransferShare = clamp(config.bottom80TransferShare, 0, 1, 0.78);
  }
  if (config.bottom80AssetShare !== undefined) {
    config.bottom80AssetShare = clamp(config.bottom80AssetShare, 0, 1, 0.12);
  }

  // --- AI Production Parameters ---
  if (config.aiProductionInvestmentFraction !== undefined) {
    config.aiProductionInvestmentFraction = clamp(config.aiProductionInvestmentFraction, 0, 1, 0.40);
  }
  if (config.aiProductionOnshoringFraction !== undefined) {
    config.aiProductionOnshoringFraction = clamp(config.aiProductionOnshoringFraction, 0, 1, 0.15);
  }
  if (config.newJobWageFraction !== undefined) {
    config.newJobWageFraction = clamp(config.newJobWageFraction, 0, 1, 0.80);
  }

  // --- Phase 9: Supply Chain Validation ---
  if (config.supplyChainConfig) {
    const sc = { ...config.supplyChainConfig };
    const inp = { ...sc.inputs };
    inp.aiChips = clamp(inp.aiChips, 0, 100, 100);
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

    const td = {
      aiChips: { ...sc.trainingDynamics.aiChips },
      energy: { ...sc.trainingDynamics.energy },
      datacenter: { ...sc.trainingDynamics.datacenter },
    };
    td.aiChips.techDeclineRate = clamp(td.aiChips.techDeclineRate, -0.80, 0.30, -0.35);
    td.aiChips.scalePressure = clamp(td.aiChips.scalePressure, 0, 0.50, 0.05);
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

  return { config, warnings };
}
