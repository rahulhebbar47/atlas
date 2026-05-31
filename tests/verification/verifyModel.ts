/**
 * ATLAS Verification Audit — Independent Model Reimplementation
 *
 * This file reimplements ALL computation formulas from scratch using only:
 * - Types and interfaces from src/types/
 * - Constants from src/models/constants.ts
 * - Data structures (clusters, baselines)
 * - interpolatePolicy utility
 *
 * NO computation functions from src/models/ are imported.
 * The formulas are transcribed from FORMULA_REFERENCE.md.
 */

import type {
  SimulationConfig,
  OccupationCluster,
  OccupationBaseline,
  CapabilityVectorId,
  BFCSScores,
  BFCSThresholds,
  DeploymentType,
  CyclePhase,
  MacroProductionInputs,
  PolicyEffects,
  PolicyConfig,
} from '@/types';

import {
  DEFAULT_START_YEAR,
  BASELINE_TOTAL_EMPLOYMENT,
  BASELINE_CPS_EMPLOYMENT,
  NON_CLUSTER_EMPLOYED,
  US_POPULATION_2025,
  US_LABOR_FORCE_2025,
  DEFAULT_POPULATION_GROWTH_RATE,
  BASELINE_WAGE_SHARE,
  BASELINE_ASSET_SHARE,
  BASELINE_TRANSFER_SHARE,
  BASELINE_TRANSFER_INCOME,
  BASELINE_TRANSFER_PER_UNEMPLOYED,
  BASELINE_UNEMPLOYMENT,
  BASELINE_AVERAGE_ANNUAL_WAGE,
  BASELINE_GDP_NOMINAL_2025,
  BASELINE_GDP_REAL_2025,
  BASELINE_PRICE_LEVEL,
  BASELINE_GDP_GROWTH_RATE,
  BASE_INFLATION_RATE,
  BASELINE_CONSUMPTION_2025,
  BASELINE_GOVT_SPENDING_2025,
  BASELINE_INVESTMENT_2025,
  TRADITIONAL_INVESTMENT_GDP_FRACTION,
  GOVERNMENT_SPENDING_GDP_FRACTION,
  NET_EXPORTS_GDP_FRACTION,
  G_OBLIGATION_SHARE,
  G_REVENUE_SENSITIVE_SHARE,
  BASELINE_INFERENCE_SPEED,
  INFERENCE_SPEED_IMPROVEMENT_RATE,
  TASK_PARALLELISM,
  BASELINE_SAFETY_RECORD,
  SAFETY_IMPROVEMENT_RATE,
  DOMAIN_RISK_FACTORS,
  SECTOR_DEFLATION_INTENSITY,
  SECTOR_CPI_WEIGHTS,
  PHILLIPS_CURVE_SENSITIVITY,
  NATURAL_UNEMPLOYMENT_RATE,
  AI_WAGE_PRODUCTIVITY_MULTIPLIER,
  DEFAULT_AI_PROFIT_GROWTH_RATE,
  AI_PRODUCTIVITY_MULTIPLIER_BY_DEPLOYMENT,
  DEFAULT_AI_PRODUCTION_INVESTMENT_FRACTION,
  DEFAULT_AI_PRODUCTION_ONSHORING_FRACTION,
  DEFAULT_NEW_JOB_WAGE_FRACTION,
  REVENUE_PRESSURE_SENSITIVITY_DEFAULT,
  REVENUE_PRESSURE_CAP,
  REVENUE_PRESSURE_DECAY,
  DEMAND_FEEDBACK_SENSITIVITY,
  CREDIT_UE_SENSITIVITY,
  MAX_CREDIT_TIGHTENING,
  CREDIT_INVESTMENT_SENSITIVITY,
  CREDIT_CONSUMPTION_SENSITIVITY,
  DEFERRABLE_CONSUMPTION_SHARE,
  DEFLATION_MIDPOINT,
  DEFLATION_STEEPNESS,
  BASELINE_GOVT_TRANSFERS,
  BASELINE_DEBT_INTEREST,
  EFFECTIVE_TAX_RATE,
  TRANSFER_GROWTH_PER_UE_POINT,
  DISCRETIONARY_SHARE_OF_G,
  BASELINE_MONEY_SUPPLY,
  BASELINE_VELOCITY_OF_MONEY,
  DEFAULT_VELOCITY_SENSITIVITY,
  VELOCITY_FLOOR_RATIO,
  DEFAULT_WAGE_ELASTICITY,
  MPC_WAGE,
  MPC_ASSET,
  MPC_TRANSFER,
  // DEPRECATED: PROFIT_REALIZATION_SENSITIVITY — replaced by endogenous capital gains realization rate
  DEFAULT_AI_PROFIT_MARGIN,
  DEFAULT_TRADITIONAL_PROFIT_MARGIN,
  EMPLOYMENT_MULTIPLIERS,
  SIMPLE_AVG_EMPLOYMENT_MULTIPLIER,
  BOTTOM80_WAGE_SHARE,
  BOTTOM80_TRANSFER_SHARE,
  BOTTOM80_ASSET_SHARE,
  BOTTOM80_POP_SHARE,
  AGE_THRESHOLD_FRACTIONS,
  DEFAULT_WAGE_PASS_THROUGH,
  DEFAULT_WAGE_AUTOMATION_SENSITIVITY,
  DEFAULT_CREDIT_DEFLATION_SENSITIVITY,
  DEFAULT_SCARCITY_PASS_THROUGH,
  DEFAULT_PARTICIPATION_ELASTICITY,
  DEFAULT_PARTICIPATION_THRESHOLD,
  DEFAULT_BUSINESS_CREDIT_GDP_SENSITIVITY,
  DEFAULT_MAX_BUSINESS_CREDIT_LOOSENING,
  BASELINE_SHELTER_CPI_WEIGHT,
  DEFAULT_SHELTER_INFLATION_STICKINESS,
  BASELINE_SHELTER_INFLATION,
  DEFAULT_MORTGAGE_STRESS_AMPLIFIER,
  DEFAULT_FORECLOSURE_LAG,
  DEFAULT_HOMEOWNERSHIP_RECOVERY_RATE,
  DEFAULT_HOUSING_WEALTH_MPC,
  BASELINE_HOUSING_WEALTH,
  DEFAULT_MPC_WAGE_UE_SENSITIVITY,
  DEFAULT_CREDIT_ADOPTION_SENSITIVITY,
  MORTGAGE_EXPOSURE_QUINTILES,
  DEPRESSION_CONSECUTIVE_DECLINE_QUARTERS,
  DEPRESSION_UNEMPLOYMENT_THRESHOLD,
  FEDERAL_REVENUE_GDP_RATIO,
} from '@/models/constants';

import { interpolatePolicy } from '@/utils/policyInterpolation';
import type { VerificationYear } from './types';

// Legacy constants — removed from constants.ts in Phase 5-tax cleanup.
// Kept here as local values to preserve this verification script's historical formulas.
const AI_COST_DECLINE_RATE = 0.25;         // was constants.ts, replaced by 3-component decomposition
const INFERENCE_COST_DECLINE_RATE = 0.5;   // was constants.ts, replaced by 3-component decomposition
const AI_INVESTMENT_RATE = 0.10;           // was constants.ts, removed in Investment Demand Constraint fix
const AI_PROFIT_GROWTH_RATE = DEFAULT_AI_PROFIT_GROWTH_RATE; // alias for readability

// ============================================================
// 1. Capability S-Curves (FORMULA_REFERENCE §2)
// ============================================================

function capabilityScore(
  year: number,
  floor: number,
  ceiling: number,
  steepness: number,
  midpointYear: number,
): number {
  const raw = floor + (ceiling - floor) / (1 + Math.exp(-steepness * (year - midpointYear)));
  return Math.max(0, Math.min(1, raw));
}

function allCapabilityScores(
  year: number,
  config: SimulationConfig,
): Record<CapabilityVectorId, number> {
  const result: Record<string, number> = {};
  for (const [id, params] of Object.entries(config.capabilities)) {
    result[id] = capabilityScore(year, params.floor, params.ceiling, params.steepness, params.midpointYear);
  }
  return result as Record<CapabilityVectorId, number>;
}

function weightedCapability(
  scores: Record<CapabilityVectorId, number>,
  weights: Record<CapabilityVectorId, number>,
): number {
  let sum = 0;
  for (const id of Object.keys(weights) as CapabilityVectorId[]) {
    sum += (scores[id] ?? 0) * (weights[id] ?? 0);
  }
  return sum;
}

// ============================================================
// 2. BFCS Scoring (FORMULA_REFERENCE §3)
// ============================================================

function betterScore(
  scores: Record<CapabilityVectorId, number>,
  weights: Record<CapabilityVectorId, number>,
  aiReplacementDifficulty: number,
): number {
  let totalWeighted = 0;
  let totalWeight = 0;
  for (const id of Object.keys(weights) as CapabilityVectorId[]) {
    const w = weights[id] ?? 0;
    if (w > 0) {
      totalWeighted += (scores[id] ?? 0) * w;
      totalWeight += w;
    }
  }
  const normalizedScore = totalWeight > 0 ? totalWeighted / totalWeight : 0;
  const qualityMultiplier = 2.0 - aiReplacementDifficulty * 1.5;
  return Math.min(1, normalizedScore * qualityMultiplier);
}

function fasterScore(year: number, deploymentType: DeploymentType): number {
  const yearsSinceStart = year - DEFAULT_START_YEAR;
  const inferenceSpeed = Math.min(1.0, BASELINE_INFERENCE_SPEED + INFERENCE_SPEED_IMPROVEMENT_RATE * yearsSinceStart * 0.1);
  const parallelism = TASK_PARALLELISM[deploymentType];
  return Math.min(1, inferenceSpeed * parallelism);
}

function cheaperScore(year: number, seniorityLevel: number, deploymentType: DeploymentType): number {
  const yearsSinceStart = year - DEFAULT_START_YEAR;
  const physicalCostMultiplier: Record<DeploymentType, number> = {
    robotics: 0.5, autonomous_vehicle: 0.6, hybrid: 0.7, software: 1.0,
  };
  const effectiveDeclineRate = AI_COST_DECLINE_RATE * physicalCostMultiplier[deploymentType];
  const aiCostFraction = Math.exp(-effectiveDeclineRate * yearsSinceStart);
  const humanCostFactor = 0.3 + seniorityLevel * 0.7;
  return Math.max(0, Math.min(1, 1 - aiCostFraction / humanCostFactor));
}

function saferScore(year: number, category: string): number {
  const yearsSinceStart = year - DEFAULT_START_YEAR;
  const safetyRecord = 1 - (1 - BASELINE_SAFETY_RECORD) * Math.exp(-SAFETY_IMPROVEMENT_RATE * yearsSinceStart);
  const domainFactor = DOMAIN_RISK_FACTORS[category] ?? 0.8;
  return Math.min(1, safetyRecord * domainFactor);
}

function checkTrigger(scores: BFCSScores, thresholds: BFCSThresholds): boolean {
  return scores.better >= thresholds.better
    && scores.faster >= thresholds.faster
    && scores.cheaper >= thresholds.cheaper
    && scores.safer >= thresholds.safer;
}

// ============================================================
// 3. Adoption Dynamics (FORMULA_REFERENCE §4)
// ============================================================

function baseAdoptionRate(
  year: number,
  triggerYear: number | null,
  lag: number,
  steepness: number,
  ceiling: number,
): number {
  if (triggerYear === null || year < triggerYear) return 0;
  const t = year - triggerYear - lag;
  const raw = ceiling / (1 + Math.exp(-steepness * t));
  return Math.max(0, Math.min(ceiling, raw));
}

function applyGeopoliticalRisk(baseSteepness: number, geoExposure: number, riskFactor: number): number {
  return baseSteepness * (1 - riskFactor * geoExposure);
}

function applyCompetitivePressure(rate: number, threshold: number, multiplier: number): number {
  const pressure = Math.max(0, rate - threshold) * multiplier;
  return Math.min(1, rate * (1 + pressure));
}

function applyRevenuePressure(rate: number, acceleration: number): number {
  return Math.min(1, rate * (1 + acceleration));
}

function fullAdoptionRate(
  year: number,
  triggerYear: number | null,
  deploymentType: DeploymentType,
  clusterLag: number,
  geoExposure: number,
  config: SimulationConfig,
  automationAccel: number,
  clusterSteepness: number,
  clusterCeiling: number,
): number {
  if (triggerYear === null || year < triggerYear) return 0;

  const effectiveSteepness = applyGeopoliticalRisk(
    clusterSteepness,
    geoExposure,
    config.adoptionParams.geopoliticalRiskFactor,
  );

  let rate = baseAdoptionRate(year, triggerYear, clusterLag, effectiveSteepness, clusterCeiling);
  rate = applyCompetitivePressure(
    rate,
    config.adoptionParams.competitivePressureThreshold,
    config.adoptionParams.competitivePressureMultiplier,
  );
  rate = applyRevenuePressure(rate, automationAccel);
  return Math.min(clusterCeiling, rate);
}

// ============================================================
// 4. Displacement (FORMULA_REFERENCE §5)
// ============================================================

function simplifiedDisplacement(adoptionRate: number, weightedCap: number): number {
  return Math.max(0, Math.min(1, adoptionRate * weightedCap * weightedCap));
}

function wageMultiplier(displacementPct: number, elasticity: number): number {
  return Math.max(0, Math.min(1, 1 - displacementPct * elasticity));
}

// ============================================================
// 5. Policy Effects (FORMULA_REFERENCE §17)
// ============================================================

function computeVerificationPolicyEffects(
  policyConfig: PolicyConfig,
  year: number,
  totalEmployment: number,
  totalUnemployment: number,
  averageWage: number,
  population: number,
  priceLevel: number,
  prevGDP: number,
  previousFundSize: number,
  totalDisplaced: number,
  prevAiGDPContribution: number,
  startYearAiGDP: number,
): PolicyEffects {
  let wageChannelAddition = 0;
  let assetChannelAddition = 0;
  let transferChannelAddition = 0;
  let sovereignFundSize = previousFundSize;
  let swfAnnualContribution = 0;

  // Wage subsidy
  if (policyConfig.wageSubsidy.enabled) {
    const subsidyPct = interpolatePolicy(policyConfig.wageSubsidy.subsidyPercentage, year);
    const subsidyPerWorker = Math.min(averageWage * subsidyPct, policyConfig.wageSubsidy.maxSubsidyPerWorker);
    wageChannelAddition += subsidyPerWorker * totalEmployment;
  }

  // Sovereign Wealth Fund
  if (policyConfig.sovereignWealthFund.enabled) {
    const swf = policyConfig.sovereignWealthFund;
    const returns = sovereignFundSize * swf.annualReturnRate;
    const distribution = sovereignFundSize * swf.distributionRate;
    const annualContrib = interpolatePolicy(swf.annualContribution, year);
    sovereignFundSize = sovereignFundSize + returns + annualContrib - distribution;
    swfAnnualContribution = annualContrib;

    const dividendPerCapita = population > 0 ? (distribution * 1e9) / population : 0;
    assetChannelAddition += dividendPerCapita * population;

    // Universal equity
    const yearsSinceStart = year - DEFAULT_START_YEAR;
    const totalProfits = swf.totalAICompanyProfits * Math.pow(1 + swf.profitGrowthRate, yearsSinceStart);
    const ownershipFrac = interpolatePolicy(swf.ownershipFraction, year);
    assetChannelAddition += ownershipFrac * totalProfits * 1e9;
  }

  // Profit sharing
  if (policyConfig.profitSharing.enabled) {
    const ps = policyConfig.profitSharing;
    const yearsSinceStart = year - DEFAULT_START_YEAR;
    const swf = policyConfig.sovereignWealthFund;
    const aiProfits = swf.totalAICompanyProfits * Math.pow(1 + swf.profitGrowthRate, yearsSinceStart);
    const sharePct = interpolatePolicy(ps.mandatorySharePercentage, year);
    assetChannelAddition += aiProfits * sharePct * 1e9;
  }

  // UBI
  if (policyConfig.ubi.enabled) {
    const ubi = policyConfig.ubi;
    let monthlyAmount: number;
    if (ubi.mode === 'indexed') {
      const baseAmount = ubi.indexedBaseAmount ?? 1000;
      const startYear = ubi.indexedStartYear ?? 2032;
      const indexRate = ubi.productivityIndexRate ?? 1.0;
      if (year < startYear || startYearAiGDP <= 0) {
        monthlyAmount = 0;
      } else {
        const growthFactor = prevAiGDPContribution > 0 ? prevAiGDPContribution / startYearAiGDP : 1;
        monthlyAmount = baseAmount * Math.pow(growthFactor, indexRate);
      }
    } else {
      monthlyAmount = interpolatePolicy(ubi.monthlyAmount, year);
    }

    if (ubi.indexedToInflation) {
      monthlyAmount *= priceLevel;
    }

    const annualUBI = monthlyAmount * 12;
    const ageThresh = ubi.ageThreshold ?? 18;
    const eligibleFraction = AGE_THRESHOLD_FRACTIONS[ageThresh] ?? Math.max(0.5, 1 - ageThresh / 80);
    transferChannelAddition += annualUBI * population * eligibleFraction;
  }

  // Enhanced UI
  if (policyConfig.enhancedUI.enabled) {
    const ui = policyConfig.enhancedUI;
    const replacementRate = interpolatePolicy(ui.replacementRate, year);
    const weeklyBenefit = (averageWage / 52) * replacementRate;
    const annualBenefit = weeklyBenefit * Math.min(52, ui.durationWeeks);
    const incrementalBenefit = Math.max(0, annualBenefit - BASELINE_TRANSFER_PER_UNEMPLOYED);
    transferChannelAddition += incrementalBenefit * totalUnemployment;

    if (ui.retrainingBonus > 0) {
      transferChannelAddition += ui.retrainingBonus * totalUnemployment;
    }
  }

  // Retraining
  if (policyConfig.retraining.enabled) {
    const rt = policyConfig.retraining;
    const stipend = interpolatePolicy(rt.stipendMonthly, year);
    const annualStipend = stipend * Math.min(12, rt.durationMonths);
    const inRetraining = totalDisplaced * (rt.participationRate ?? 0.30);
    transferChannelAddition += annualStipend * inRetraining;
  }

  const totalPolicyIncome = wageChannelAddition + assetChannelAddition + transferChannelAddition;
  const fiscalCost = wageChannelAddition + transferChannelAddition + swfAnnualContribution * 1e9;
  const fiscalCostAsPercentGDP = prevGDP > 0 ? fiscalCost / prevGDP : 0;

  return {
    wageChannelAddition,
    assetChannelAddition,
    transferChannelAddition,
    totalPolicyIncome,
    fiscalCost,
    fiscalCostAsPercentGDP,
    sovereignFundSize,
    swfAnnualContribution,
    requiredAssetOwnership: 0,
    requiredTransferLevel: 0,
  };
}

// ============================================================
// 6. Macro Helpers (FORMULA_REFERENCE §10-14)
// ============================================================

function computeWagePressure(
  unemploymentRate: number,
  automationCoverage: number,
  policyWageFloor: number,
  phillipsSensitivity: number,
  aiWageMultiplier: number,
): number {
  const excessUE = Math.max(0, unemploymentRate - NATURAL_UNEMPLOYMENT_RATE);
  const phillipsPressure = Math.exp(-phillipsSensitivity * excessUE);
  const aiProductivityPremium = automationCoverage * aiWageMultiplier * (1 - automationCoverage);
  return Math.max(policyWageFloor, phillipsPressure + aiProductivityPremium);
}

function computeSectorWeightedDeflation(
  clusterResults: Array<{ clusterId: string; totalDirectDisplacement: number; totalRemainingEmployment: number }>,
  year: number,
  overrides?: Record<string, number>,
): number {
  const yearsSinceStart = year - DEFAULT_START_YEAR;
  const inferenceCostSavings = 1 - Math.exp(-INFERENCE_COST_DECLINE_RATE * yearsSinceStart);

  // Count clusters per CPI group for proportional weight
  const groupCounts: Record<string, number> = {};
  for (const cr of clusterResults) {
    const prefix = cr.clusterId.split('_')[0];
    groupCounts[prefix] = (groupCounts[prefix] ?? 0) + 1;
  }

  let totalDeflation = 0;
  for (const cr of clusterResults) {
    const baseEmp = cr.totalRemainingEmployment + cr.totalDirectDisplacement;
    const autoCoverage = baseEmp > 0 ? cr.totalDirectDisplacement / baseEmp : 0;
    const intensity = overrides?.[cr.clusterId] ?? SECTOR_DEFLATION_INTENSITY[cr.clusterId] ?? 0.4;
    const sectorDeflation = autoCoverage * intensity * inferenceCostSavings;

    const prefix = cr.clusterId.split('_')[0];
    const groupWeight = SECTOR_CPI_WEIGHTS[prefix] ?? 0;
    const count = groupCounts[prefix] ?? 1;
    const clusterCPIWeight = groupWeight / count;

    totalDeflation += clusterCPIWeight * sectorDeflation;
  }
  return totalDeflation;
}

function computeRevenuePressureV(
  gdpGrowthRate: number,
  previousAcceleration: number,
  sensitivity: number,
  cap: number,
  decay: number,
): { revenuePressure: number; automationAcceleration: number } {
  const gdpContraction = Math.max(0, -gdpGrowthRate);
  const newPressure = Math.min(cap, sensitivity * gdpContraction);
  const automationAcceleration = Math.min(cap, previousAcceleration * decay + newPressure);
  return { revenuePressure: newPressure, automationAcceleration };
}

function computeDemandFeedback(
  currentNominalGDP: number,
  history: number[],
  sensitivity: number,
): { demandRatio: number; demandPenalty: number } {
  if (history.length === 0) return { demandRatio: 1, demandPenalty: 1 };
  const lookback = history.slice(-5);
  const avg = lookback.reduce((a, b) => a + b, 0) / lookback.length;
  const demandRatio = avg > 0 ? Math.min(1.0, currentNominalGDP / avg) : 1;
  const demandPenalty = Math.pow(demandRatio, sensitivity);
  return { demandRatio, demandPenalty };
}

function computeDualCredit(
  unemploymentRate: number,
  prevGDPGrowthRate: number,
  creditUESens: number,
  maxTightening: number,
  creditInvSens: number,
  creditConsSens: number,
  businessCreditGDPSens: number,
  maxBusinessLoosening: number,
): {
  householdCreditTightening: number;
  businessCreditSignal: number;
  consumptionMultiplier: number;
  investmentMultiplier: number;
} {
  // Household channel (UE-driven)
  const excessUE = Math.max(0, unemploymentRate - NATURAL_UNEMPLOYMENT_RATE);
  const rawHousehold = creditUESens * excessUE;
  const householdCreditTightening = Math.min(maxTightening, rawHousehold);
  const hRatio = maxTightening > 0 ? householdCreditTightening / maxTightening : 0;
  const consumptionMultiplier = 1.0 - creditConsSens * hRatio;

  // Business channel (GDP-driven)
  const rawBusiness = prevGDPGrowthRate * businessCreditGDPSens;
  const clampedBusiness = Math.max(-maxTightening, Math.min(maxBusinessLoosening, rawBusiness));
  const investmentMultiplier = 1.0 + (creditInvSens / maxTightening) * clampedBusiness;

  return { householdCreditTightening, businessCreditSignal: clampedBusiness, consumptionMultiplier, investmentMultiplier };
}

function computeDeflationDrag(
  netInflation: number,
  deferrableShare: number,
  midpoint: number,
  steepness: number,
): { velocityMultiplier: number; deflationDragPct: number } {
  if (netInflation >= 0) return { velocityMultiplier: 1.0, deflationDragPct: 0 };
  const deflationRate = Math.max(0, -netInflation);
  const deferralRate = deferrableShare / (1 + Math.exp(-steepness * (deflationRate - midpoint)));
  return { velocityMultiplier: 1.0 - deferralRate, deflationDragPct: deferralRate };
}

function computeFiscalPressure(
  unemploymentRate: number,
  nominalGDP: number,
  baselineG: number,
  policyFiscalCost: number,
): { fiscalDeficitGDPRatio: number; discretionarySpending: number } {
  const excessUE = Math.max(0, unemploymentRate - NATURAL_UNEMPLOYMENT_RATE);
  const additionalTransfers = TRANSFER_GROWTH_PER_UE_POINT * excessUE * 100;
  const totalTransfers = BASELINE_GOVT_TRANSFERS + additionalTransfers;
  const totalSpending = baselineG + totalTransfers + BASELINE_DEBT_INTEREST + policyFiscalCost;
  const revenue = EFFECTIVE_TAX_RATE * nominalGDP;
  const deficit = totalSpending - revenue;
  const fiscalDeficitGDPRatio = nominalGDP > 0 ? deficit / nominalGDP : 0;
  const discretionarySpending = baselineG * DISCRETIONARY_SHARE_OF_G;
  return { fiscalDeficitGDPRatio, discretionarySpending };
}

function detectDepression(
  currentGDP: number,
  previousGDP: number,
  unemploymentRate: number,
  prevConsecutiveDecline: number,
): { isDepression: boolean; consecutiveDeclineQuarters: number } {
  const isDecline = currentGDP < previousGDP;
  const quarters = isDecline ? prevConsecutiveDecline + 4 : 0;
  const isDep = quarters >= DEPRESSION_CONSECUTIVE_DECLINE_QUARTERS && unemploymentRate > DEPRESSION_UNEMPLOYMENT_THRESHOLD;
  return { isDepression: isDep, consecutiveDeclineQuarters: quarters };
}

// ============================================================
// 7. Automation Coverage (FORMULA_REFERENCE §2.5)
// ============================================================

function automationCoverageFromClusters(
  clusterResults: Array<{ totalDirectDisplacement: number }>,
  totalBaselineEmployment: number,
): number {
  const totalDirect = clusterResults.reduce((s, cr) => s + cr.totalDirectDisplacement, 0);
  return totalBaselineEmployment > 0 ? totalDirect / totalBaselineEmployment : 0;
}

// ============================================================
// MAIN VERIFICATION FUNCTION
// ============================================================

export function runVerification(
  config: SimulationConfig,
  clusters: OccupationCluster[],
  blsBaselines: Map<string, OccupationBaseline>,
): VerificationYear[] {
  const results: VerificationYear[] = [];

  // Pre-compute baselines per cluster
  const baselines = new Map<string, { employments: Record<string, number>; wages: Record<string, number> }>();

  // BLS normalization (FIX 6): Match ATLAS simulation.ts exactly:
  // 1. First populate ALL baselines (BLS + fallback)
  // 2. Then normalize ALL employment to sum to BASELINE_TOTAL_EMPLOYMENT
  for (const cluster of clusters) {
    const bls = blsBaselines.get(cluster.id);
    const employments: Record<string, number> = {};
    const wages: Record<string, number> = {};

    if (bls) {
      for (const role of cluster.roles) {
        const roleData = bls.roles[role.id];
        if (roleData && roleData.estimatedEmployment > 0) {
          employments[role.id] = roleData.estimatedEmployment;
          wages[role.id] = roleData.medianWage;
        } else {
          employments[role.id] = 0;
          wages[role.id] = 0;
        }
      }
    } else {
      // Fallback estimator (matches estimateBaselineForCluster in simulation.ts)
      const clusterShare = 1 / clusters.length;
      const clusterEmployment = BASELINE_TOTAL_EMPLOYMENT * clusterShare;
      for (const role of cluster.roles) {
        employments[role.id] = clusterEmployment * role.employmentShareEstimate;
        wages[role.id] = BASELINE_AVERAGE_ANNUAL_WAGE * (0.5 + role.seniorityLevel);
      }
    }
    baselines.set(cluster.id, { employments, wages });
  }

  // Step 2: Normalize ALL cluster employment to sum to BASELINE_TOTAL_EMPLOYMENT
  let rawTotalEmp = 0;
  for (const bl of baselines.values()) {
    for (const emp of Object.values(bl.employments)) {
      rawTotalEmp += emp;
    }
  }
  if (rawTotalEmp > 0) {
    const scaleFactor = BASELINE_TOTAL_EMPLOYMENT / rawTotalEmp;
    if (Math.abs(scaleFactor - 1.0) > 0.001) {
      for (const bl of baselines.values()) {
        for (const roleId of Object.keys(bl.employments)) {
          bl.employments[roleId] = (bl.employments[roleId] ?? 0) * scaleFactor;
        }
      }
    }
  }

  // Compute actual baseline average wage (FIX C)
  let baselineWageWeightedSum = 0;
  let baselineTotalEmp = 0;
  for (const bl of baselines.values()) {
    for (const roleId of Object.keys(bl.employments)) {
      const emp = bl.employments[roleId] ?? 0;
      const wage = bl.wages[roleId] ?? 0;
      baselineWageWeightedSum += emp * wage;
      baselineTotalEmp += emp;
    }
  }
  const actualBaselineAverageWage = baselineTotalEmp > 0
    ? baselineWageWeightedSum / baselineTotalEmp
    : BASELINE_AVERAGE_ANNUAL_WAGE;

  // Effective multipliers (Fix 9)
  const effectiveMultipliers: Record<string, number> = {};
  // Compute employment-weighted average for other_uncategorized
  const multEntries = Object.entries(EMPLOYMENT_MULTIPLIERS).filter(([id]) => id !== 'other_uncategorized');
  let totalEmpForMult = 0;
  for (const [id] of multEntries) {
    const bl = baselines.get(id);
    if (bl) {
      for (const emp of Object.values(bl.employments)) totalEmpForMult += emp;
    }
  }
  const weightedAvgMult = totalEmpForMult > 0
    ? multEntries.reduce((sum, [id, mult]) => {
        const bl = baselines.get(id);
        if (!bl) return sum;
        let clusterEmp = 0;
        for (const emp of Object.values(bl.employments)) clusterEmp += emp;
        return sum + mult * (clusterEmp / totalEmpForMult);
      }, 0)
    : SIMPLE_AVG_EMPLOYMENT_MULTIPLIER;

  for (const cluster of clusters) {
    effectiveMultipliers[cluster.id] = cluster.id === 'other_uncategorized'
      ? (config.otherUncategorizedMultiplierOverride ?? weightedAvgMult)
      : (EMPLOYMENT_MULTIPLIERS[cluster.id] ?? cluster.employmentMultiplier);
  }

  // Fix 12: Normalize demand shares
  const effectiveDemandShares = new Map<string, { cShare: number; gShare: number }>();
  for (const cluster of clusters) {
    let cShare = cluster.consumerDemandShare;
    let gShare = cluster.govDemandShare;
    const shareSum = cShare + gShare;
    if (shareSum > 1.001) {
      cShare = cShare / shareSum;
      gShare = gShare / shareSum;
    }
    effectiveDemandShares.set(cluster.id, { cShare, gShare });
  }

  // State tracking
  const triggerYears: Record<string, Record<string, number | null>> = {};
  for (const cluster of clusters) {
    triggerYears[cluster.id] = {};
    for (const role of cluster.roles) {
      triggerYears[cluster.id][role.id] = null;
    }
  }

  let previousMacro: VerificationYear | null = null;
  let previousFundSize = config.policyConfig.sovereignWealthFund.initialFundSize;
  let previousMoneySupply = BASELINE_MONEY_SUPPLY;
  const nominalGDPHistory: number[] = [];
  let startYearAiGDP = 0;
  let cumulativeInflationFactor = 1.0;

  // Housing state
  let dynamicHomeownership = MORTGAGE_EXPOSURE_QUINTILES.map(q => q.homeownershipRate as number);

  // === MAIN LOOP ===
  for (let year = config.startYear; year <= config.endYear; year++) {
    const isFirstYear = (previousMacro === null);
    const yearsSinceStart = year - config.startYear;

    // Dynamic population
    const popGrowthRate = config.populationGrowthRate ?? DEFAULT_POPULATION_GROWTH_RATE;
    const population = config.totalPopulation * Math.pow(1 + popGrowthRate, yearsSinceStart);
    const laborForce = config.laborForce * (population / config.totalPopulation);
    const laborForceGrowthFactor = population / config.totalPopulation;
    const scaledBaselineEmployment = BASELINE_TOTAL_EMPLOYMENT * laborForceGrowthFactor;
    const scaledNonClusterEmployed = NON_CLUSTER_EMPLOYED * laborForceGrowthFactor;

    // 1. Capability scores
    const capScores = allCapabilityScores(year, config);

    // Revenue pressure from previous year
    const prevAcceleration = previousMacro?.automationAcceleration ?? 0;

    // Credit adoption acceleration (Phase 5i)
    const creditAdoptionSens = config.creditAdoptionSensitivity ?? DEFAULT_CREDIT_ADOPTION_SENSITIVITY;
    const prevBusinessCredit = previousMacro ? (previousMacro as any).businessCreditSignal ?? 0 : 0;
    const businessCreditLoosening = Math.max(0, prevBusinessCredit);
    const creditAdoptionAcceleration = Math.min(
      config.revenuePressureCap ?? REVENUE_PRESSURE_CAP,
      businessCreditLoosening * creditAdoptionSens,
    );
    const totalAutomationAccel = Math.min(
      config.revenuePressureCap ?? REVENUE_PRESSURE_CAP,
      prevAcceleration + creditAdoptionAcceleration,
    );

    // Min wage before cluster loop (Phase 5g Step 9)
    const minWageHourly = interpolatePolicy(config.policyConfig.minimumWage.federalMinimum, year);
    const effectiveMinWage = minWageHourly
      * (config.policyConfig.minimumWage.indexedToInflation ? (previousMacro?.priceLevel ?? 1.0) : 1.0);
    const annualMinWage = effectiveMinWage * 2080;
    const policyWageFloor = annualMinWage / BASELINE_AVERAGE_ANNUAL_WAGE;
    const wageAutoSens = config.wageAutomationSensitivity ?? DEFAULT_WAGE_AUTOMATION_SENSITIVITY;

    // 2-5. Per-cluster: BFCS -> adoption -> displacement
    interface ClusterResult {
      clusterId: string;
      totalRemainingEmployment: number;
      totalDirectDisplacement: number;
      secondOrderDisplacement: number;
      totalDisplacement: number;
      averageWage: number;
    }

    const clusterResults: ClusterResult[] = [];

    for (const cluster of clusters) {
      const bl = baselines.get(cluster.id);
      if (!bl) continue;

      const clusterOverride = config.clusterOverrides?.[cluster.id];
      const effectiveWeights = clusterOverride
        ? {
            generative: clusterOverride.generativeWeight ?? cluster.capabilityRelevance.weights.generative,
            agentic: clusterOverride.agenticWeight ?? cluster.capabilityRelevance.weights.agentic,
            embodied: clusterOverride.embodiedWeight ?? cluster.capabilityRelevance.weights.embodied,
          }
        : cluster.capabilityRelevance.weights;
      const wCap = weightedCapability(capScores, effectiveWeights);

      const clusterSteepness = clusterOverride?.adoptionSteepness ?? cluster.adoptionSteepness;
      const clusterCeiling = clusterOverride?.adoptionCeiling ?? cluster.adoptionCeiling;
      const clusterLag = clusterOverride?.deploymentLag ?? cluster.adoptionLag;
      const clusterWageElast = clusterOverride?.wageElasticity ?? cluster.wageElasticity;

      // Min wage adoption bonus
      const clusterBaselineWages = Object.values(bl.wages);
      const clusterAvgWage = clusterBaselineWages.length > 0
        ? clusterBaselineWages.reduce((a, b) => a + b, 0) / clusterBaselineWages.length
        : BASELINE_AVERAGE_ANNUAL_WAGE;
      let minWageAdoptionBonus = 0;
      if (annualMinWage > 0 && wageAutoSens > 0 && clusterAvgWage > 0 && annualMinWage > clusterAvgWage) {
        minWageAdoptionBonus = wageAutoSens * (annualMinWage - clusterAvgWage) / clusterAvgWage;
      }

      let totalRemainingEmp = 0;
      let totalBaselineEmp = 0;
      let totalWageEmp = 0;

      for (const role of cluster.roles) {
        const effectiveThresholds = config.bfcsOverrides[cluster.id]?.[role.id] ?? role.bfcsThresholds;

        // BFCS scores
        const bScores: BFCSScores = {
          better: betterScore(capScores, effectiveWeights, role.aiReplacementDifficulty),
          faster: fasterScore(year, cluster.deploymentType),
          cheaper: cheaperScore(year, role.seniorityLevel, cluster.deploymentType),
          safer: saferScore(year, cluster.category),
        };

        const triggered = checkTrigger(bScores, effectiveThresholds);
        if (triggered && triggerYears[cluster.id][role.id] === null) {
          triggerYears[cluster.id][role.id] = year;
        }

        const roleTriggerYear = triggerYears[cluster.id][role.id];

        const adoptionRate = fullAdoptionRate(
          year, roleTriggerYear, cluster.deploymentType,
          clusterLag, cluster.geopoliticalRiskExposure, config,
          totalAutomationAccel + minWageAdoptionBonus,
          clusterSteepness, clusterCeiling,
        );

        const dispPct = simplifiedDisplacement(adoptionRate, wCap);
        const headcountMult = Math.max(0, Math.min(1, 1 - dispPct));
        const wageMult = wageMultiplier(dispPct, clusterWageElast);

        const baseEmp = (bl.employments[role.id] ?? 0) * laborForceGrowthFactor;
        const baseWage = bl.wages[role.id] ?? 0;
        const remaining = Math.max(0, baseEmp * headcountMult);
        const remainWage = Math.max(0, baseWage * wageMult);

        totalRemainingEmp += remaining;
        totalBaselineEmp += baseEmp;
        totalWageEmp += remainWage * remaining;
      }

      const totalDirectDisp = Math.max(0, totalBaselineEmp - totalRemainingEmp);
      const mult = effectiveMultipliers[cluster.id] ?? 1.0;
      // Second-order: bounded by remaining employment
      const secondOrderRaw = totalDirectDisp * (mult - 1);
      const secondOrder = Math.min(secondOrderRaw, totalRemainingEmp);
      const totalDisp = totalDirectDisp + secondOrder;
      const avgWage = totalRemainingEmp > 0 ? totalWageEmp / totalRemainingEmp : 0;

      clusterResults.push({
        clusterId: cluster.id,
        totalRemainingEmployment: totalRemainingEmp,
        totalDirectDisplacement: totalDirectDisp,
        secondOrderDisplacement: secondOrder,
        totalDisplacement: totalDisp,
        averageWage: avgWage,
      });
    }

    // 6. Aggregate displacement
    const totalRemaining = clusterResults.reduce((s, cr) => s + cr.totalRemainingEmployment, 0);
    const totalDirectDisp = clusterResults.reduce((s, cr) => s + cr.totalDirectDisplacement, 0);
    const totalSecondOrder = clusterResults.reduce((s, cr) => s + cr.secondOrderDisplacement, 0);
    let weightedAvgWage = 0;
    if (totalRemaining > 0) {
      for (const cr of clusterResults) {
        weightedAvgWage += cr.averageWage * cr.totalRemainingEmployment / totalRemaining;
      }
    }

    // 7. Automation coverage
    const autoCoverage = automationCoverageFromClusters(clusterResults, scaledBaselineEmployment);

    // 8. Demand spillover
    const prevConsumption = previousMacro?.consumption ?? BASELINE_CONSUMPTION_2025;
    const prevGovSpending = previousMacro?.governmentSpending ?? BASELINE_GOVT_SPENDING_2025;
    const prevInvestment = previousMacro?.investment ?? BASELINE_INVESTMENT_2025;

    const consumerDemandRatio = prevConsumption / BASELINE_CONSUMPTION_2025;
    const govDemandRatio = prevGovSpending / BASELINE_GOVT_SPENDING_2025;
    const businessDemandRatio = prevInvestment / BASELINE_INVESTMENT_2025;

    let totalAfterSpillover = 0;
    let totalDemandSpilloverLoss = 0;
    let totalPreSpillover = 0;

    for (const cr of clusterResults) {
      const ds = effectiveDemandShares.get(cr.clusterId) ?? { cShare: 0.5, gShare: 0.2 };
      const bShare = Math.max(0, 1 - ds.cShare - ds.gShare);
      const ratio = ds.cShare * consumerDemandRatio + ds.gShare * govDemandRatio + bShare * businessDemandRatio;
      const survival = Math.min(1.0, Math.max(0, ratio));
      const constrained = cr.totalRemainingEmployment * survival;
      totalAfterSpillover += constrained;
      totalDemandSpilloverLoss += cr.totalRemainingEmployment - constrained;
      totalPreSpillover += cr.totalRemainingEmployment;
    }

    const aggregateDemandSurvival = totalPreSpillover > 0 ? totalAfterSpillover / totalPreSpillover : 1.0;
    const effectiveUnemployment = Math.max(0, laborForce - totalAfterSpillover - scaledNonClusterEmployed);

    // Track AI GDP for UBI indexing
    const ubiStartYear = config.policyConfig.ubi.indexedStartYear ?? 2032;
    if (year >= ubiStartYear && startYearAiGDP === 0 && previousMacro) {
      startYearAiGDP = previousMacro.aiGDPContribution;
    }

    // 9. Policy effects
    const policyEffects = computeVerificationPolicyEffects(
      config.policyConfig, year, totalAfterSpillover, effectiveUnemployment,
      weightedAvgWage, population, previousMacro?.priceLevel ?? 1.0,
      previousMacro?.gdpNominal ?? BASELINE_GDP_NOMINAL_2025,
      previousFundSize, totalDirectDisp,
      previousMacro?.aiGDPContribution ?? 0, startYearAiGDP,
    );
    previousFundSize = policyEffects.sovereignFundSize;

    // 10. Scarcity inflation + labor supply response
    const scarcityPassThroughVal = config.scarcityPassThrough ?? DEFAULT_SCARCITY_PASS_THROUGH;
    const participElasticity = config.participationElasticity ?? DEFAULT_PARTICIPATION_ELASTICITY;
    const participThreshold = config.participationThreshold ?? DEFAULT_PARTICIPATION_THRESHOLD;

    let scarcityInflation = 0;

    // Get effective UBI for replacement rate
    let effectiveUBIMonthly = 0;
    if (config.policyConfig.ubi.enabled) {
      const ubi = config.policyConfig.ubi;
      if (ubi.mode === 'indexed') {
        const baseAmount = ubi.indexedBaseAmount ?? 1000;
        const startYr = ubi.indexedStartYear ?? 2032;
        const indexRate = ubi.productivityIndexRate ?? 1.0;
        const prevAiGDP = previousMacro?.aiGDPContribution ?? 0;
        if (year >= startYr && startYearAiGDP > 0 && prevAiGDP > 0) {
          effectiveUBIMonthly = baseAmount * Math.pow(prevAiGDP / startYearAiGDP, indexRate);
        }
      } else {
        effectiveUBIMonthly = interpolatePolicy(ubi.monthlyAmount, year);
      }
    }
    const annualUBI = config.policyConfig.ubi.enabled ? effectiveUBIMonthly * 12 : 0;

    let totalEffectiveLaborSupply = 0;
    for (const cr of clusterResults) {
      const clusterWage = cr.averageWage > 0 ? cr.averageWage : BASELINE_AVERAGE_ANNUAL_WAGE;
      const replacementRate = clusterWage > 0 ? annualUBI / clusterWage : 0;

      let withdrawal = 0;
      if (participElasticity > 0 && replacementRate > participThreshold) {
        const excessReplacement = replacementRate - participThreshold;
        const maxExcessRange = Math.max(0.01, 1.0 - participThreshold);
        withdrawal = participElasticity * Math.min(1, excessReplacement / maxExcessRange);
        withdrawal = Math.max(0, Math.min(1, withdrawal));
      }
      const effectiveLaborSup = cr.totalRemainingEmployment * (1 - withdrawal);
      totalEffectiveLaborSupply += effectiveLaborSup;

      // Scarcity
      const bl = baselines.get(cr.clusterId);
      const ds = effectiveDemandShares.get(cr.clusterId) ?? { cShare: 0.5, gShare: 0.2 };
      const bShare = Math.max(0, 1 - ds.cShare - ds.gShare);
      const ratio = ds.cShare * consumerDemandRatio + ds.gShare * govDemandRatio + bShare * businessDemandRatio;
      const demandSurvival = Math.min(1.0, Math.max(0, ratio));

      if (bl && scarcityPassThroughVal > 0) {
        const baseEmp = Object.values(bl.employments).reduce((a, b) => a + b, 0) * laborForceGrowthFactor;
        const totalOutputDemand = baseEmp * demandSurvival;
        const aiCapacity = Math.max(0, baseEmp - cr.totalRemainingEmployment);
        const demandForWorkers = Math.max(0, totalOutputDemand - aiCapacity);
        if (demandForWorkers > 0) {
          const laborScarcity = Math.max(0, (demandForWorkers - effectiveLaborSup) / demandForWorkers);
          const employmentShare = scaledBaselineEmployment > 0 ? baseEmp / scaledBaselineEmployment : 0;
          scarcityInflation += laborScarcity * employmentShare * scarcityPassThroughVal;
        }
      }
    }

    // 11. Sector-weighted deflation
    const sectorWeightedDeflation = computeSectorWeightedDeflation(
      clusterResults, year, config.deflationIntensityOverrides,
    );

    // Min wage cost-push
    const wagePassThroughVal = config.wagePassThrough ?? DEFAULT_WAGE_PASS_THROUGH;
    let minWageCostPush = 0;
    if (annualMinWage > 0 && wagePassThroughVal > 0) {
      for (const cr of clusterResults) {
        if (cr.averageWage > 0 && annualMinWage > cr.averageWage) {
          const bl = baselines.get(cr.clusterId);
          if (!bl) continue;
          const baseEmp = Object.values(bl.employments).reduce((a, b) => a + b, 0) * laborForceGrowthFactor;
          const employmentShare = scaledBaselineEmployment > 0 ? baseEmp / scaledBaselineEmployment : 0;
          const wageOvershoot = (annualMinWage - cr.averageWage) / cr.averageWage;
          minWageCostPush += wageOvershoot * employmentShare * wagePassThroughVal;
        }
      }
    }

    // 12. New job metrics
    const prevGDPForJobs = previousMacro?.gdpReal ?? BASELINE_GDP_NOMINAL_2025;
    const rawNewJobs = Math.max(0, config.innovationRate * prevGDPForJobs * config.rdMultiplier);
    const survivability = Math.pow(Math.max(0, 1 - autoCoverage), config.jobPersistenceFactor);
    const durableNewJobs = Math.max(0, rawNewJobs * survivability);

    // 13. AI production expansion
    let totalAdditionalOutput = 0;
    for (const cr of clusterResults) {
      const cluster = clusters.find(c => c.id === cr.clusterId);
      if (!cluster) continue;
      const clusterOverride = config.clusterOverrides?.[cluster.id];
      const maxMult = clusterOverride?.maxProductivityMultiplier
        ?? AI_PRODUCTIVITY_MULTIPLIER_BY_DEPLOYMENT[cluster.deploymentType];

      const effectiveWeights = clusterOverride
        ? {
            generative: clusterOverride.generativeWeight ?? cluster.capabilityRelevance.weights.generative,
            agentic: clusterOverride.agenticWeight ?? cluster.capabilityRelevance.weights.agentic,
            embodied: clusterOverride.embodiedWeight ?? cluster.capabilityRelevance.weights.embodied,
          }
        : cluster.capabilityRelevance.weights;
      const wCap = weightedCapability(capScores, effectiveWeights);

      const effectiveProductivity = 1.0 + (maxMult - 1.0) * wCap;
      const additionalOutput = cr.totalDirectDisplacement * cr.averageWage * (effectiveProductivity - 1.0);
      totalAdditionalOutput += Math.max(0, additionalOutput);
    }

    const investFrac = config.aiProductionInvestmentFraction ?? DEFAULT_AI_PRODUCTION_INVESTMENT_FRACTION;
    const onshoreFrac = config.aiProductionOnshoringFraction ?? DEFAULT_AI_PRODUCTION_ONSHORING_FRACTION;
    const consumerFrac = Math.max(0, 1.0 - investFrac - onshoreFrac);
    const aiInvestmentBoost = totalAdditionalOutput * investFrac;
    const aiNetExportBoost = totalAdditionalOutput * onshoreFrac;
    const aiConsumerGoodsPotential = totalAdditionalOutput * consumerFrac;

    // === MACRO COMPUTATION ===
    const prevNominalGDP = previousMacro?.gdpNominal ?? BASELINE_GDP_NOMINAL_2025;
    const prevPriceLevel = previousMacro?.priceLevel ?? BASELINE_PRICE_LEVEL;
    const baseInflation = config.baseInflationRate;
    const baselineGDPGrowth = config.baselineGDPGrowth;
    const mpcWage = config.mpcWage;
    const mpcAsset = config.mpcAsset;
    const mpcTransfer = config.mpcTransfer;
    // DEPRECATED: profitRealizationSensitivity — replaced by endogenous capital gains realization rate
    const profitRealSens = 1.0;
    const aiProfitMargin = config.aiProfitMargin ?? DEFAULT_AI_PROFIT_MARGIN;
    const traditionalProfitMargin = config.traditionalProfitMargin ?? DEFAULT_TRADITIONAL_PROFIT_MARGIN;

    // Second-order params
    const demandSens = config.demandFeedbackSensitivity ?? DEMAND_FEEDBACK_SENSITIVITY;
    const creditUESens = config.creditUESensitivity ?? CREDIT_UE_SENSITIVITY;
    const maxTightening = config.maxCreditTightening ?? MAX_CREDIT_TIGHTENING;
    const creditInvSens = config.creditInvestmentSensitivity ?? CREDIT_INVESTMENT_SENSITIVITY;
    const creditConsSens = config.creditConsumptionSensitivity ?? CREDIT_CONSUMPTION_SENSITIVITY;
    const deferrableShare = config.deferrableConsumptionShare ?? DEFERRABLE_CONSUMPTION_SHARE;
    const deflMidpoint = config.deflationMidpoint ?? DEFLATION_MIDPOINT;
    const deflSteepness = config.deflationSteepness ?? DEFLATION_STEEPNESS;
    const phillipsSens = config.phillipsCurveSensitivity ?? PHILLIPS_CURVE_SENSITIVITY;
    const revPressSens = config.revenuePressureSensitivity ?? REVENUE_PRESSURE_SENSITIVITY_DEFAULT;
    const revPressCap = config.revenuePressureCap ?? REVENUE_PRESSURE_CAP;
    const revPressDecay = config.revenuePressureDecay ?? REVENUE_PRESSURE_DECAY;
    const aiWageMult = config.aiWageProductivityMultiplier ?? AI_WAGE_PRODUCTIVITY_MULTIPLIER;
    const bizCreditGDPSens = config.businessCreditGDPSensitivity ?? DEFAULT_BUSINESS_CREDIT_GDP_SENSITIVITY;
    const maxBizLoosening = config.maxBusinessCreditLoosening ?? DEFAULT_MAX_BUSINESS_CREDIT_LOOSENING;
    const mpcWageUESens = config.mpcWageUESensitivity ?? DEFAULT_MPC_WAGE_UE_SENSITIVITY;
    const newJobWageFrac = config.newJobWageFraction ?? DEFAULT_NEW_JOB_WAGE_FRACTION;
    const creditDeflSens = config.creditDeflationSensitivity ?? DEFAULT_CREDIT_DEFLATION_SENSITIVITY;

    // Employment — scale non-cluster workers with population growth
    const totalEmployment = totalAfterSpillover + scaledNonClusterEmployed + durableNewJobs;
    const totalUnemployment = Math.max(0, laborForce - totalEmployment);
    const unemploymentRate = laborForce > 0 ? totalUnemployment / laborForce : 0;
    const laborForceParticipation = population > 0 ? laborForce / population : 0;

    // Revenue pressure
    const prevGDPGrowthRate = previousMacro?.gdpGrowthRate ?? baselineGDPGrowth;
    const { revenuePressure, automationAcceleration: newAutoAccel } = computeRevenuePressureV(
      prevGDPGrowthRate, previousMacro?.automationAcceleration ?? 0, revPressSens, revPressCap, revPressDecay,
    );

    // Demand feedback
    const demandResult = computeDemandFeedback(prevNominalGDP, nominalGDPHistory, demandSens);

    // Credit (dual channel)
    const creditResult = computeDualCredit(
      unemploymentRate, prevGDPGrowthRate,
      creditUESens, maxTightening, creditInvSens, creditConsSens,
      bizCreditGDPSens, maxBizLoosening,
    );

    // Mortgage stress index (simplified — not reimplemented fully)
    const mortgageStressIdx = 1.0;
    const adjustedHouseholdTightening = creditResult.householdCreditTightening * mortgageStressIdx;

    // Housing wealth effect (simplified)
    const adjustedTightRatio = maxTightening > 0 ? adjustedHouseholdTightening / maxTightening : 0;
    const foreclosureSupplyPressure = 0; // Simplified — not fully reimplementing housing
    const creditDemandPressure = -adjustedTightRatio * 0.5;
    const popDemandPressure = 0.01;
    const homePriceChangeRate = foreclosureSupplyPressure + creditDemandPressure + popDemandPressure;
    const avgHomeownership = dynamicHomeownership.reduce((a, b) => a + b, 0) / dynamicHomeownership.length;
    const housingWealthMPC = config.housingWealthMPC ?? DEFAULT_HOUSING_WEALTH_MPC;
    const housingWealthDrag = isFirstYear ? 0 : BASELINE_HOUSING_WEALTH * homePriceChangeRate * housingWealthMPC * avgHomeownership;

    // Wage pressure
    const wagePressure = computeWagePressure(unemploymentRate, autoCoverage, policyWageFloor, phillipsSens, aiWageMult);

    // 7-component net inflation
    const creditDeflationContribution = -creditDeflSens * adjustedTightRatio;
    const netInflation = baseInflation - sectorWeightedDeflation + minWageCostPush + creditDeflationContribution + scarcityInflation;

    // Shelter decomposition (simplified for verification)
    const shelterWeight = config.shelterCPIWeight ?? BASELINE_SHELTER_CPI_WEIGHT;
    const shelterStickiness = config.shelterInflationStickiness ?? DEFAULT_SHELTER_INFLATION_STICKINESS;
    const embodiedCap = capScores.embodied ?? 0;
    const shelterDeflationFromAI = -embodiedCap * shelterStickiness * 0.10;
    const shelterInflation = BASELINE_SHELTER_INFLATION + shelterDeflationFromAI;
    const goodsInflation = netInflation;
    const compositeInflation = shelterWeight * shelterInflation + (1 - shelterWeight) * goodsInflation;

    // Price level
    const priceLevel = isFirstYear ? BASELINE_PRICE_LEVEL : Math.max(0.01, prevPriceLevel * (1 + netInflation));

    // Deflation drag
    const deflDrag = computeDeflationDrag(netInflation, deferrableShare, deflMidpoint, deflSteepness);

    // Effective inflation for transfers
    const effectiveInflation = Math.max(0, netInflation);
    if (!isFirstYear) {
      cumulativeInflationFactor = cumulativeInflationFactor * (1 + effectiveInflation);
    }

    // === Income ===
    // Profit realization
    const prevCapUtil = previousMacro?.capacityUtilization ?? 1.0;
    const profitRealizationRate = Math.pow(prevCapUtil, profitRealSens);

    // Wage income
    const wageBase = prevNominalGDP * BASELINE_WAGE_SHARE;
    const employmentRatio = totalAfterSpillover / scaledBaselineEmployment;
    const wageRatio = actualBaselineAverageWage > 0 ? weightedAvgWage / actualBaselineAverageWage : 1;
    const adjustedWageRatio = wageRatio * wagePressure;
    const existingWageIncome = wageBase * employmentRatio * adjustedWageRatio + policyEffects.wageChannelAddition;
    const currentAvgWage = wageBase / scaledBaselineEmployment;
    const newJobWageIncome = durableNewJobs * currentAvgWage * newJobWageFrac * wagePressure;
    const aggregateWageIncome = existingWageIncome + newJobWageIncome;

    // Asset income
    const assetBase = prevNominalGDP * BASELINE_ASSET_SHARE;
    const effectiveAIProfitBoost = AI_PROFIT_GROWTH_RATE * autoCoverage * demandResult.demandPenalty * profitRealizationRate;
    const aggregateAssetIncome = assetBase * (1 + effectiveAIProfitBoost) + policyEffects.assetChannelAddition;

    // Transfer income
    const baselineTransfers = BASELINE_TRANSFER_INCOME * cumulativeInflationFactor;
    const incrementalUE = Math.max(0, totalUnemployment - BASELINE_UNEMPLOYMENT);
    const aggregateTransferIncome = baselineTransfers + incrementalUE * BASELINE_TRANSFER_PER_UNEMPLOYED + policyEffects.transferChannelAddition;

    const totalIncome = aggregateWageIncome + aggregateAssetIncome + aggregateTransferIncome;

    // === Consumption ===
    const excessUEpp = Math.max(0, (unemploymentRate - NATURAL_UNEMPLOYMENT_RATE)) * 100;
    const precautionaryReduction = mpcWageUESens * excessUEpp;
    const effectiveMpcWage = Math.max(0.01, mpcWage - precautionaryReduction);

    // SWF reclassification
    const policyAssetToTransfer = policyEffects.assetChannelAddition;
    const assetIncomeForMPC = aggregateAssetIncome - policyAssetToTransfer;
    const transferIncomeForMPC = aggregateTransferIncome + policyAssetToTransfer;

    const wageConsumption = aggregateWageIncome * effectiveMpcWage;
    const assetConsumption = assetIncomeForMPC * mpcAsset;
    const transferConsumption = transferIncomeForMPC * mpcTransfer;

    let consumption: number;
    let investment: number;
    let governmentSpending: number;
    let gdpNominal: number;
    let gdpReal: number;

    if (isFirstYear) {
      gdpNominal = BASELINE_GDP_NOMINAL_2025;
      gdpReal = BASELINE_GDP_NOMINAL_2025;
      consumption = wageConsumption + assetConsumption + transferConsumption;
      investment = BASELINE_GDP_NOMINAL_2025 * TRADITIONAL_INVESTMENT_GDP_FRACTION;
      governmentSpending = BASELINE_GDP_NOMINAL_2025 * GOVERNMENT_SPENDING_GDP_FRACTION;
    } else {
      const baseConsumption = wageConsumption + assetConsumption + transferConsumption;
      consumption = Math.max(0,
        baseConsumption * creditResult.consumptionMultiplier * deflDrag.velocityMultiplier + housingWealthDrag,
      );

      // Investment
      const aiInvBoost = AI_INVESTMENT_RATE * autoCoverage * (1 - autoCoverage);
      const baseInvestment = prevNominalGDP * (TRADITIONAL_INVESTMENT_GDP_FRACTION + aiInvBoost);
      investment = baseInvestment * creditResult.investmentMultiplier + aiInvestmentBoost;

      // Government spending
      const obligationG = G_OBLIGATION_SHARE * BASELINE_GOVT_SPENDING_2025 * cumulativeInflationFactor;
      const revenueSensitiveG = G_REVENUE_SENSITIVE_SHARE * prevNominalGDP * GOVERNMENT_SPENDING_GDP_FRACTION;
      governmentSpending = obligationG + revenueSensitiveG;

      // Net exports
      const netExports = prevNominalGDP * NET_EXPORTS_GDP_FRACTION + aiNetExportBoost;

      gdpNominal = Math.max(0, consumption + investment + governmentSpending + netExports);
      gdpReal = priceLevel > 0 ? gdpNominal / priceLevel : gdpNominal;
    }

    const gdpGrowthRate = !isFirstYear && prevNominalGDP > 0
      ? (gdpNominal - prevNominalGDP) / prevNominalGDP
      : baselineGDPGrowth;

    // Depression
    const { isDepression, consecutiveDeclineQuarters } = detectDepression(
      gdpNominal, prevNominalGDP, unemploymentRate, previousMacro?.consecutiveDeclineQuarters ?? 0,
    );

    // CWI
    const consumerWelfareIndex = population > 0 ? consumption / (population * priceLevel) : 0;
    const prevCWI = previousMacro?.consumerWelfareIndex ?? 0;
    const cwiGrowthRate = !isFirstYear && prevCWI > 0 ? (consumerWelfareIndex - prevCWI) / prevCWI : 0;
    const prevCWIGrowthRate = previousMacro?.cwiGrowthRate ?? 0;
    const cwiAcceleration = !isFirstYear ? cwiGrowthRate - prevCWIGrowthRate : 0;

    // Cycle phase
    const ACCEL_THRESHOLD = 0.001;
    const prevCyclePhase = previousMacro?.cyclePhase ?? 'STABLE';
    const wasInDecline = prevCyclePhase === 'ACCELERATING_DECLINE'
      || prevCyclePhase === 'LINEAR_DECLINE'
      || prevCyclePhase === 'DECELERATING_DECLINE';
    let cyclePhase: CyclePhase;
    if (cwiGrowthRate >= 0) {
      cyclePhase = wasInDecline ? 'RECOVERY' : 'STABLE';
    } else {
      if (cwiAcceleration < -ACCEL_THRESHOLD) cyclePhase = 'ACCELERATING_DECLINE';
      else if (cwiAcceleration > ACCEL_THRESHOLD) cyclePhase = 'DECELERATING_DECLINE';
      else cyclePhase = 'LINEAR_DECLINE';
    }

    // Capacity utilization
    const potentialGDP = gdpReal + aiConsumerGoodsPotential;
    const capacityUtilization = potentialGDP > 0 ? Math.min(1.0, gdpReal / potentialGDP) : 1.0;

    // Unrealized AI output
    const demandHealthRatio = Math.min(1.0, consumption / BASELINE_CONSUMPTION_2025);
    const aiGoodsAbsorbed = aiConsumerGoodsPotential * demandHealthRatio;
    const unrealizedAIOutput = Math.max(0, aiConsumerGoodsPotential - aiGoodsAbsorbed);

    // AI GDP contribution
    const aiGDPContribution = aiInvestmentBoost + aiGoodsAbsorbed + aiNetExportBoost;
    const aiGDPContributionPct = gdpNominal > 0 ? aiGDPContribution / gdpNominal : 0;

    // Corporate profits
    const rawAiProfits = aiGDPContribution * aiProfitMargin;
    const traditionalGDP = Math.max(0, gdpNominal - aiGDPContribution);
    const rawTraditionalProfits = traditionalGDP * traditionalProfitMargin;
    const rawTotalProfits = rawAiProfits + rawTraditionalProfits;
    const maxProfits = Math.max(0, gdpNominal - aggregateWageIncome);
    const corporateProfits = Math.min(rawTotalProfits, maxProfits);
    const aiCorporateProfits = Math.min(rawAiProfits, corporateProfits);
    const traditionalCorporateProfits = Math.max(0, corporateProfits - aiCorporateProfits);
    const profitGDPRatio = gdpNominal > 0 ? corporateProfits / gdpNominal : 0;

    // Fiscal pressure
    const fiscal = computeFiscalPressure(
      unemploymentRate, gdpNominal, governmentSpending, policyEffects.fiscalCost,
    );

    // === Monetary ===
    const totalTransfers = policyEffects.transferChannelAddition;
    const moneyCreationShare = 0.5; // Default mixed funding
    const deltaM = totalTransfers * moneyCreationShare;
    const moneySupply = previousMoneySupply + deltaM;
    previousMoneySupply = moneySupply;

    const velocityOfMoney = BASELINE_VELOCITY_OF_MONEY;
    const maxNeutralTransfers = velocityOfMoney > 0
      ? (sectorWeightedDeflation * gdpReal) / velocityOfMoney
      : 0;
    const inflationFromTransfers = gdpReal > 0
      ? Math.max(0, (deltaM * velocityOfMoney) / gdpReal - sectorWeightedDeflation)
      : 0;
    const isWithinNeutralZone = totalTransfers <= maxNeutralTransfers;

    // Push GDP to history
    nominalGDPHistory.push(gdpNominal);

    // Build verification year output
    const yearOutput: VerificationYear = {
      year,
      capabilityGenerative: capScores.generative,
      capabilityAgentic: capScores.agentic,
      capabilityEmbodied: capScores.embodied,

      totalRemainingEmployment: totalRemaining,
      totalDirectDisplacement: totalDirectDisp,
      totalSecondOrderDisplacement: totalSecondOrder,
      totalDisplacement: totalDirectDisp + totalSecondOrder,
      weightedAverageWage: weightedAvgWage,
      automationCoverage: autoCoverage,

      consumerDemandRatio,
      govDemandRatio,
      businessDemandRatio,
      aggregateDemandSurvival,
      totalDemandSpilloverLoss,

      totalEmployment: totalEmployment,
      totalUnemployment,
      unemploymentRate,
      laborForceParticipation,

      aggregateWageIncome,
      aggregateAssetIncome,
      aggregateTransferIncome,
      totalIncome,

      priceLevel,
      inflationRate: baseInflation,
      aiDeflationRate: sectorWeightedDeflation,
      netInflation,

      gdpNominal,
      gdpReal,
      gdpGrowthRate,
      consumption,
      investment,
      governmentSpending,

      consumerWelfareIndex,
      cwiGrowthRate,
      cwiAcceleration,
      cyclePhase,

      revenuePressure,
      automationAcceleration: newAutoAccel,

      isDepression,
      consecutiveDeclineQuarters,

      wagePressure,
      sectorWeightedDeflationRate: sectorWeightedDeflation,

      demandRatio: demandResult.demandRatio,
      demandPenalty: demandResult.demandPenalty,
      creditTightening: creditResult.householdCreditTightening,
      investmentMultiplier: creditResult.investmentMultiplier,
      consumptionMultiplier: creditResult.consumptionMultiplier,
      fiscalDeficitGDPRatio: fiscal.fiscalDeficitGDPRatio,

      velocityMultiplier: deflDrag.velocityMultiplier,
      deflationDragPct: deflDrag.deflationDragPct,

      cumulativeInflationFactor,

      aiAdditionalOutput: totalAdditionalOutput,
      aiInvestmentBoost,
      aiNetExportBoost,
      aiConsumerGoodsPotential,
      unrealizedAIOutput,
      aiGoodsAbsorbed,

      newJobEmployment: durableNewJobs,
      newJobWageIncome,

      potentialGDP,
      capacityUtilization,
      profitRealizationRate,
      wageConsumption,
      assetConsumption,
      transferConsumption,

      corporateProfits,
      aiCorporateProfits,
      traditionalCorporateProfits,
      profitGDPRatio,

      aiGDPContribution,
      aiGDPContributionPct,

      wageChannelAddition: policyEffects.wageChannelAddition,
      assetChannelAddition: policyEffects.assetChannelAddition,
      transferChannelAddition: policyEffects.transferChannelAddition,
      totalPolicyIncome: policyEffects.totalPolicyIncome,
      fiscalCost: policyEffects.fiscalCost,
      sovereignFundSize: policyEffects.sovereignFundSize,

      moneySupply,
      maxNeutralTransfers,
      actualInflationFromTransfers: inflationFromTransfers,
      isWithinNeutralZone,
    };

    results.push(yearOutput);
    previousMacro = yearOutput;
  }

  return results;
}
