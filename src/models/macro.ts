/**
 * ATLAS Macro Economic Model
 *
 *
 * All functions are PURE — no side effects, no state mutation.
 */

import type {
  MacroOutput,
  MacroInputs,
  MacroProductionInputs,
  IncomeComposition,
  PolicyEffects,
  ClusterDisplacementResult,
  SecondOrderEffectParams,
  CyclePhase,
  AICostParams,
  DeploymentType,
} from '@/types';
import {
  US_POPULATION_2025,
  US_LABOR_FORCE_2025,
  BASELINE_TOTAL_EMPLOYMENT,
  BASELINE_AVERAGE_ANNUAL_WAGE,
  // DEPRECATED (Stage 5): BASELINE_TRANSFER_PER_UNEMPLOYED replaced by the CASH/IN-KIND split below
  // BASELINE_TRANSFER_PER_UNEMPLOYED,
  DEFAULT_CASH_TRANSFER_PER_UNEMPLOYED,
  DEFAULT_IN_KIND_TRANSFER_PER_UNEMPLOYED,
  BASELINE_PRICE_LEVEL,
  BASELINE_GDP_NOMINAL_2025,
  BASELINE_GDP_REAL_2025,
  BASE_INFLATION_RATE,
  BASELINE_GDP_GROWTH_RATE,
  AI_INVESTMENT_GROWTH_RATE,
  TRADITIONAL_INVESTMENT_GDP_FRACTION,
  GOVERNMENT_SPENDING_GDP_FRACTION,
  NET_EXPORTS_GDP_FRACTION,
  DEPRESSION_CONSECUTIVE_DECLINE_QUARTERS,
  DEPRESSION_UNEMPLOYMENT_THRESHOLD,
  BASELINE_WAGE_SHARE,
  BASELINE_ASSET_SHARE,
  BASELINE_TRANSFER_SHARE,
  DEFAULT_START_YEAR,
  BASELINE_WAGE_INCOME,
  BASELINE_ASSET_INCOME,
  BASELINE_TRANSFER_INCOME,
  BASELINE_UNEMPLOYMENT,
  SECTOR_DEFLATION_INTENSITY,
  SECTOR_CPI_WEIGHTS,
  PHILLIPS_CURVE_SENSITIVITY,
  // Stage 3: endogenous wage equation
  DEFAULT_INFLATION_INDEXATION,
  DEFAULT_PRODUCTIVITY_PASSTHROUGH,
  DEFAULT_PHILLIPS_SLOPE,
  DEFAULT_DOWNWARD_WAGE_RIGIDITY,
  NATURAL_UNEMPLOYMENT_RATE,
  FRED_NAIRU_RATE,
  NON_CLUSTER_EMPLOYED,
  DEMAND_FEEDBACK_SENSITIVITY,
  CREDIT_UE_SENSITIVITY,
  MAX_CREDIT_TIGHTENING,
  CREDIT_INVESTMENT_SENSITIVITY,
  BOTTOM80_WAGE_SHARE,
  BOTTOM80_TRANSFER_SHARE,
  BOTTOM80_ASSET_SHARE,
  BOTTOM80_POP_SHARE,
  CREDIT_CONSUMPTION_SENSITIVITY,
  BASELINE_GOVT_TRANSFERS,
  BASELINE_DEBT_INTEREST,
  EFFECTIVE_TAX_RATE,
  // DEPRECATED (Stage 5 / H3): retired from the loop — see constants.ts
  // TRANSFER_GROWTH_PER_UE_POINT,
  DISCRETIONARY_SHARE_OF_G,
  REVENUE_PRESSURE_SENSITIVITY_DEFAULT,
  REVENUE_PRESSURE_CAP,
  REVENUE_PRESSURE_DECAY,
  AI_WAGE_PRODUCTIVITY_MULTIPLIER,
  DEFAULT_NEW_JOB_WAGE_FRACTION,
  // DEPRECATED: MPC_WAGE, MPC_ASSET, MPC_TRANSFER no longer imported — replaced by DEFAULT_POST_TAX_MPC_*
  // DEPRECATED: PROFIT_REALIZATION_SENSITIVITY no longer imported — replaced by endogenous capital gains realization rate
  G_OBLIGATION_SHARE,
  G_REVENUE_SENSITIVE_SHARE,
  BASELINE_GOVT_SPENDING_2025,
  BASELINE_CONSUMPTION_2025,
  DEFERRABLE_CONSUMPTION_SHARE,
  DEFLATION_MIDPOINT,
  DEFLATION_STEEPNESS,
  DEFAULT_AI_PROFIT_MARGIN,
  DEFAULT_TRADITIONAL_PROFIT_MARGIN,
  DEFAULT_CREDIT_DEFLATION_SENSITIVITY,
  DEFAULT_BUSINESS_CREDIT_GDP_SENSITIVITY,
  DEFAULT_MAX_BUSINESS_CREDIT_LOOSENING,
  BASELINE_SHELTER_CPI_WEIGHT,
  // Stage 1: sectoral price architecture
  AI_EXPOSED_CPI_WEIGHT,
  LABOR_SERVICES_CPI_WEIGHT,
  FOOD_ENERGY_CPI_WEIGHT,
  DEFAULT_AI_DEFLATION_PASSTHROUGH,
  DEFAULT_LABOR_COST_SHARE,
  // Stage 1.5: embodied-AI sector routing + per-sector passthrough
  clusterConsumptionSector,
  type ConsumptionSector,
  DEFAULT_LABOR_SERVICES_PASSTHROUGH,
  DEFAULT_FOOD_ENERGY_PASSTHROUGH,
  DEFAULT_SHELTER_PASSTHROUGH,
  // DEPRECATED (Stage 1.5): DEFAULT_SHELTER_INFLATION_STICKINESS — ad-hoc embodied shelter term retired
  // (replaced by routed construction deflation × shelterPassthrough). Retained for Stage 6.5 housing rework.
  // DEFAULT_SHELTER_INFLATION_STICKINESS,
  DEFAULT_POPULATION_GROWTH_RATE,
  BASELINE_SHELTER_INFLATION,
  DEFAULT_MORTGAGE_STRESS_AMPLIFIER,
  DEFAULT_FORECLOSURE_LAG,
  DEFAULT_HOMEOWNERSHIP_RECOVERY_RATE,
  DEFAULT_HOUSING_WEALTH_MPC,
  BASELINE_HOUSING_WEALTH,
  BASELINE_HOMEOWNERSHIP,
  DEFAULT_MPC_WAGE_UE_SENSITIVITY,
  DEFAULT_CREDIT_ADOPTION_SENSITIVITY,
  MORTGAGE_EXPOSURE_QUINTILES,
  // Phase 5-tax imports
  EMPLOYER_EMPLOYEE_SPLIT,
  BASELINE_INCOME_TAX_RATE,
  BASELINE_PAYROLL_RATE,
  BASELINE_CORPORATE_TAX_RATE,
  BASELINE_CAPITAL_GAINS_RATE,
  DEFAULT_POST_TAX_MPC_WAGE,
  DEFAULT_POST_TAX_MPC_ASSET,
  DEFAULT_POST_TAX_MPC_TRANSFER,
  STATE_LOCAL_TAX_RATE,
  TRANSFER_TAX_RATE,
  // DEPRECATED (Stage 1): DEFAULT_AI_PROFIT_GROWTH_RATE — old market-power passthrough retired.
  // DEFAULT_AI_PROFIT_GROWTH_RATE,
  BASELINE_CORPORATE_RETENTION_RATE,
  BASELINE_PROFIT_GDP_RATIO,
  BASELINE_RETAINED_EARNINGS,
  BASELINE_CREDIT_FUNDED,
  CAPACITY_GATE_SENSITIVITY,
  AI_COST_COMPOSITION,
  DEFAULT_INFERENCE_ANNUAL_CHANGE,
  DEFAULT_MANUFACTURING_ANNUAL_CHANGE,
  DEFAULT_ENERGY_ANNUAL_CHANGE,
  // Asset Income Decomposition constants
  BASE_PE_ZERO_GROWTH,
  MIN_PE,
  DEFAULT_AI_PE_SENSITIVITY,
  DEFAULT_TRADITIONAL_PE_SENSITIVITY,
  BASE_REALIZATION_RATE,
  REALIZATION_SENSITIVITY,
  MIN_REALIZATION_RATE,
  MAX_REALIZATION_RATE,
  NON_CORPORATE_ASSET_SHARE,
  MAX_PRICE_LEVEL,
  MONETARY_COLLAPSE_THRESHOLD_FRACTION,
  // Phase 6: Consumer & Business Credit
  DEFAULT_TRANSFER_RELIABILITY_WEIGHT,
  DEFAULT_INCOME_ADEQUACY_SENSITIVITY,
  DEFAULT_COLLATERAL_SENSITIVITY,
  DEFAULT_SYSTEMIC_RISK_SENSITIVITY,
  DEFAULT_INFLATION_RISK_SENSITIVITY,
  DEFAULT_MAX_CONSUMER_TIGHTENING,
  CONSUMER_TIGHTENING_GR_PEAK,
  // E-9: F-D complement + the PCE proxy
  NON_SHELTER_BASE_INFLATION,
  DEFAULT_BUILDER_ADJUSTMENT_LAMBDA,
  DEFAULT_LAND_CLOSURE_KAPPA,
  DEFAULT_OPEX_PASSTHROUGH,
  DEFAULT_RENT_DOWNWARD_RIGIDITY,
  DEFAULT_RENT_INCOME_ELASTICITY,
  DEFAULT_CONSTRUCTION_CREDIT_SENSITIVITY,
  BUILDER_TREND_HORIZON_YEARS,
  BUILDER_TREND_GROWTH_INIT_2025,
  OBSERVED_2025_HOME_PRICE_GROWTH,
  HOUSING_PIPELINE_DURATION_YEARS,
  INITIAL_HOUSING_PIPELINE,
  PCE_WEIGHT_SHELTER,
  PCE_WEIGHT_AI_EXPOSED,
  PCE_WEIGHT_LABOR_SERVICES,
  PCE_WEIGHT_FOOD_ENERGY,
  PCE_FORMULA_EFFECT,
  // F4/OD-8 examination
  DEFAULT_CREDIT_EXPECTATION_TURNOVER,
  DEFAULT_ASSET_SHARE_DRIFT_RATE,
  // Stage 7: residual corporate profits
  DEFAULT_OTHER_COSTS_SHARE,
  DEFAULT_AI_SECTOR_LABOR_SHARE,
  DEFAULT_RENT_SHARING_ELASTICITY,
  DEFAULT_SECULAR_PROFIT_DRIFT_RATE,
  // Stage 6.5: stock-flow housing
  BASELINE_HOUSING_STOCK_2025,
  BASELINE_HOUSEHOLDS_2025,
  BASELINE_STARTS_CAPACITY_RATIO,
  BASELINE_MORTGAGE_RATE_2025,
  DEFAULT_FORMATION_SENSITIVITY,
  DEFAULT_HEADSHIP_RECOVERY_RATE,
  DEFAULT_HOUSING_SUPPLY_ELASTICITY,
  DEFAULT_EMBODIED_CAPACITY_GAIN,
  DEFAULT_HOUSING_DEPRECIATION_RATE,
  DEFAULT_LAND_SHARE,
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
  DEFAULT_CONSUMER_CREDIT_IMPACT,
  ASSET_INCOME_UNDERWRITING_WEIGHT,
  COLLATERAL_LOOSENING_ASYMMETRY,
  DEFAULT_PROFITABILITY_SENSITIVITY,
  DEFAULT_GROWTH_TRAJECTORY_SENSITIVITY,
  DEFAULT_MAX_BUSINESS_TIGHTENING,
  DEFAULT_BUSINESS_INVESTMENT_IMPACT,
  DEFAULT_MAX_GROWTH_TIGHTENING,
  // Phase 8 Fix 5: Housing model (wage growth constants DEPRECATED — see computeNominalWageGrowth)
  // INFLATION_PASS_THROUGH_RATE,
  // DEFAULT_PHILLIPS_CURVE_WAGE_SENSITIVITY,
  DEFAULT_AFFORDABILITY_PRICE_SENSITIVITY,
  DEFAULT_INCOME_HOUSING_ELASTICITY,
  DEFAULT_AFFORDABILITY_REVERSION_SENSITIVITY,
  DEFAULT_DOWNWARD_STICKINESS_RATIO,
  DEFAULT_DEMOGRAPHIC_HOUSING_ELASTICITY,
} from './constants';
// Phase 10.A Bug #B fix: floored inference cost curve (shared with computeCheaperScore).
import { computeInferenceCostFactor } from './bfcs';
// Local constants for deprecated functions (removed from constants.ts in Phase 5h)
const AI_DEFLATION_COEFFICIENT = 0.03;
const MARGINAL_PROPENSITY_TO_CONSUME = 0.73;

// DEPRECATED: computeAutomationCoverage import removed (FIX 8).
// automationCoverage is now passed in as a parameter, computed from actual
// adoption-driven displacement rather than raw capability scores.

/**
 * Get the CPI sector prefix for a cluster ID.
 * E.g., "tech_swe" → "tech", "health_home_health" → "health"
 * Falls back to "other" if no prefix matches.
 */
function getSectorPrefix(clusterId: string): string {
  const prefixes = Object.keys(SECTOR_CPI_WEIGHTS);
  for (const prefix of prefixes) {
    if (clusterId.startsWith(prefix)) return prefix;
  }
  return 'other';
}

/**
 * Compute sector-weighted AI deflation rate (DATA_MODEL.md §5.3).
 *
 * Each occupation cluster maps to a CPI sector with a specific weight.
 * Deflation is computed per-cluster then aggregated with CPI weights.
 *
 * Formula:
 *   ai_deflation_rate(t) = Σ_o [ cpi_weight(o) × cluster_automation(o) × intensity(o) × cost_savings(t) ]
 *
 * @param clusterResults - Displacement results for all clusters
 * @param year - Current year
 * @param intensityOverrides - Optional per-cluster deflation intensity overrides [0, 1]
 * @returns Sector-weighted AI deflation rate (positive number)
 */
export function computeSectorWeightedDeflation(
  clusterResults: ClusterDisplacementResult[],
  year: number,
  intensityOverrides?: Record<string, number>,
  clusterDeploymentTypes?: Map<string, DeploymentType>,
  aiCostParams?: AICostParams,
  augmentationByCluster?: Map<string, number>,
  effectiveProductivityByCluster?: Map<string, number>,
  augmentedHeadcountByCluster?: Map<string, number>,
  /** Phase 10.A Bug #A fix: per-cluster employment-weighted avg of BFCS better score. */
  clusterBetterByCluster?: Map<string, number>,
  /** Phase 10.A Bug #A fix: per-cluster employment-weighted avg of BFCS cheaper score. */
  clusterCheaperByCluster?: Map<string, number>,
  /** Phase 10.A Bug #A fix: augmentationMultiplier from config (for perWorkerBoost). */
  augmentationMultiplierInput?: number,
): { total: number; byConsumption: Record<ConsumptionSector, number> } {
  // Stage 1.5: returns the economy-wide scalar (back-compat: monetization + the aiDeflationRate output)
  // AND the per-consumption-sector deflation RATE (each = CPI-weighted avg of its clusters' deflation,
  // normalized within sector). The macro composite routes each sector's rate × that sector's passthrough.
  const yearsSinceStart = year - DEFAULT_START_YEAR;
  const augMultiplier = augmentationMultiplierInput ?? 2.0;

  // Count clusters per sector prefix for CPI weight splitting
  const prefixCounts = new Map<string, number>();
  for (const c of clusterResults) {
    const prefix = getSectorPrefix(c.clusterId);
    prefixCounts.set(prefix, (prefixCounts.get(prefix) ?? 0) + 1);
  }

  let totalDeflation = 0;
  // Stage 1.5: accumulate per-consumption-sector contributions + weights for within-sector normalization.
  const secContribution: Record<ConsumptionSector, number> = { aiExposed: 0, laborServices: 0, foodEnergy: 0, shelter: 0 };
  const secWeight: Record<ConsumptionSector, number> = { aiExposed: 0, laborServices: 0, foodEnergy: 0, shelter: 0 };

  for (const result of clusterResults) {
    const baseline = result.totalRemainingEmployment + result.totalDirectDisplacement;
    if (baseline <= 0) continue;

    // Replacement coverage = displacement fraction
    const clusterAutoCoverage = result.totalDirectDisplacement / baseline;

    // Augmentation coverage: head-count fraction if provided, else legacy output-dollar fallback
    const headcountFrac = augmentedHeadcountByCluster?.get(result.clusterId);
    let augmentationCoverage: number;
    if (headcountFrac !== undefined) {
      augmentationCoverage = Math.max(0, Math.min(1, headcountFrac));
    } else {
      const augOutput = augmentationByCluster?.get(result.clusterId) ?? 0;
      augmentationCoverage = (result.averageWage > 0)
        ? augOutput / (baseline * result.averageWage) : 0;
    }

    // 3-component cost index (inference via FLOORED CURVE — Phase 10.A Bug #B fix;
    // manufacturing/energy retain exponential decay, out of scope for this rework).
    const deployType = clusterDeploymentTypes?.get(result.clusterId) ?? 'software';
    const comp = (aiCostParams?.composition?.[deployType]
      ?? AI_COST_COMPOSITION[deployType] ?? AI_COST_COMPOSITION['software'])!;
    const mfgChange = aiCostParams?.manufacturingAnnualChange ?? DEFAULT_MANUFACTURING_ANNUAL_CHANGE;
    const engChange = aiCostParams?.energyAnnualChange ?? DEFAULT_ENERGY_ANNUAL_CHANGE;

    const inferenceFactor = computeInferenceCostFactor(yearsSinceStart, aiCostParams?.tokenCostCurve, aiCostParams?.tokenUsageMultiplier);
    const costIndex = comp.inference * inferenceFactor
      + comp.manufacturing * Math.exp(mfgChange * yearsSinceStart)
      + comp.energy * Math.exp(engChange * yearsSinceStart);

    // Phase 10.A Bug #A fix — two-channel deflation:
    //
    //   Replacement channel: AI is DOING the work at AI-inference-level cost.
    //     per-unit cost savings = 1 - costIndex / effectiveProductivity
    //
    //   Augmentation channel: Human is still doing the work at HUMAN-wage cost, but now with
    //     per-worker output boost. Cost per unit output drops in proportion to the boost.
    //     per-worker boost = clusterBetter × clusterCheaper × augMultiplier
    //     augmented worker produces (1 + perWorkerBoost) × baseline output at same cost
    //     → per-unit cost savings = perWorkerBoost / (1 + perWorkerBoost)
    //
    // Each channel contributes its own coverage × its own savings, summed, then scaled by
    // deflation intensity. Option (a) taper (1 - clusterAutoCoverage) continues to apply to
    // augmentation: augmentation fills unreplaced workers.
    const clusterEffectiveProductivity = effectiveProductivityByCluster?.get(result.clusterId) ?? 1.0;
    const replacementPerUnitCostSavings = Math.max(0, 1 - (costIndex / Math.max(0.01, clusterEffectiveProductivity)));

    const clusterBetter = clusterBetterByCluster?.get(result.clusterId) ?? 0;
    const clusterCheaper = clusterCheaperByCluster?.get(result.clusterId) ?? 0;
    const perWorkerBoost = clusterBetter * clusterCheaper * augMultiplier;
    const augmentationPerUnitCostSavings = perWorkerBoost / Math.max(0.01, 1 + perWorkerBoost);

    const replacementDeflation = clusterAutoCoverage * replacementPerUnitCostSavings;
    const augmentationDeflation = augmentationCoverage * (1 - clusterAutoCoverage) * augmentationPerUnitCostSavings;

    const deflationIntensity = intensityOverrides?.[result.clusterId]
      ?? SECTOR_DEFLATION_INTENSITY[result.clusterId] ?? 0.4;
    const sectorDeflation = (replacementDeflation + augmentationDeflation) * deflationIntensity;

    // CPI weight for this cluster's sector group, split among clusters in group
    const prefix = getSectorPrefix(result.clusterId);
    const clustersInGroup = prefixCounts.get(prefix) ?? 1;
    const clusterCPIWeight = (SECTOR_CPI_WEIGHTS[prefix] ?? 0.01) / clustersInGroup;

    totalDeflation += clusterCPIWeight * sectorDeflation;

    // Stage 1.5: route this cluster's CPI-weighted deflation to its consumption sector.
    const cs = clusterConsumptionSector(result.clusterId);
    secContribution[cs] += clusterCPIWeight * sectorDeflation;
    secWeight[cs] += clusterCPIWeight;
  }

  // Per-sector deflation RATE = CPI-weighted average of that sector's clusters (normalized within sector).
  const byConsumption: Record<ConsumptionSector, number> = {
    aiExposed: secWeight.aiExposed > 0 ? Math.max(0, secContribution.aiExposed / secWeight.aiExposed) : 0,
    laborServices: secWeight.laborServices > 0 ? Math.max(0, secContribution.laborServices / secWeight.laborServices) : 0,
    foodEnergy: secWeight.foodEnergy > 0 ? Math.max(0, secContribution.foodEnergy / secWeight.foodEnergy) : 0,
    shelter: secWeight.shelter > 0 ? Math.max(0, secContribution.shelter / secWeight.shelter) : 0,
  };

  return { total: Math.max(0, totalDeflation), byConsumption };
}

/**
 * Compute automation coverage from cluster-level displacement results.
 * Employment-weighted average of per-cluster automation coverage.
 *
 * Formula (DATA_MODEL.md §5.3.5):
 *   automation_coverage(t) = Σ_o [ employment_weight(o) × cluster_auto_coverage(o, t) ]
 *
 * @param clusterResults - Displacement results for all clusters
 * @param totalBaselineEmployment - Total baseline employment across all clusters
 * @returns Employment-weighted automation coverage [0, 1]
 */
export function computeAutomationCoverageFromClusters(
  clusterResults: ClusterDisplacementResult[],
  totalBaselineEmployment: number,
): number {
  if (totalBaselineEmployment <= 0) return 0;

  let weightedSum = 0;
  for (const result of clusterResults) {
    const clusterBaseline = result.totalRemainingEmployment + result.totalDirectDisplacement;
    if (clusterBaseline <= 0) continue;

    const clusterAutoCoverage = result.totalDirectDisplacement / clusterBaseline;
    weightedSum += (clusterBaseline / totalBaselineEmployment) * clusterAutoCoverage;
  }
  return weightedSum;
}

/**
 * Compute Phillips curve wage pressure with AI productivity premium.
 *
 * Phillips pressure: unemployment above natural rate pushes wages down.
 * AI productivity premium: remaining workers are scarce and AI-augmented,
 * commanding wage premiums. Hump-shaped — peaks at 50% automation coverage.
 * Floor: policy-derived minimum wage floor (annualMinWage / baselineAvgWage).
 *
 * Four phases:
 *   Phase 1 (UE 4-10%): Premium offsets Phillips → wages flat/rise
 *   Phase 2 (UE 10-25%): Phillips grows, premium peaks → wages flat
 *   Phase 3 (UE 25%+): Phillips dominates, premium fading → wages fall
 *   Phase 4 (UE 40%+): Premium ≈ 0 → wages collapse to min wage floor
 *
 * @param unemploymentRate - Current unemployment rate [0, 1]
 * @param automationCoverage - Fraction of economy automated [0, 1]
 * @param aiWageMultiplier - AI wage productivity multiplier (default 0.5)
 * @param policyWageFloor - Minimum wage floor as fraction of baseline wage (0 = no floor)
 * @returns Wage pressure factor [policyWageFloor, 1.0+]
 */
// DEPRECATED (Stage 3): computeWagePressure (a level multiplier with the (1−aiShare) gate) is replaced
// by computeNominalWageGrowth below — an endogenous nominal wage-GROWTH equation. Kept (not deleted) for
// reference and any direct unit tests; no longer called by computeMacro.
export function computeWagePressure(
  unemploymentRate: number,
  /** Phase 10.A: cumulative AI-displacement unemployment count (headcount, not rate). */
  aiDisplacementUnemployment: number = 0,
  /** Phase 10.A: economy-wide employment-weighted mean of role.aiReplacementDifficultyWagePremium. */
  aggregateReplacementDifficultyWagePremium: number = 0,
  /** Phase 10.A: scarcity-premium intensity knob (config.scarcityIntensity). */
  scarcityIntensity: number = 0,
  /** Baseline labor force (e.g., config.laborForce) — used to convert rate × force → headcount. */
  laborForceBaseline: number = 1,
  policyWageFloor: number = 0,
  phillipsCurveSensitivity: number = PHILLIPS_CURVE_SENSITIVITY,
  naturalRate: number = FRED_NAIRU_RATE,
): number {
  // Phase 10.A rewrite — Phillips Mechanism 2:
  //   classic Phillips exp decay is scaled by (1 - aiShare), so pure macro slack dominates when
  //   unemployment is NOT driven by AI, and is dampened when most of the unemployment IS from AI.
  //   AI-driven scarcity premium kicks in via aiShare × scarcityIntensity × aggregatePremium.
  const excessUnemployment = Math.max(0, unemploymentRate - naturalRate);
  const totalUnemployedHeadcount = Math.max(unemploymentRate * laborForceBaseline, 1);
  const aiShare = Math.min(1, aiDisplacementUnemployment / totalUnemployedHeadcount);

  const classicPhillips = Math.exp(-phillipsCurveSensitivity * excessUnemployment * (1 - aiShare));
  const scarcityPremium = aiShare * scarcityIntensity * aggregateReplacementDifficultyWagePremium;

  return Math.max(policyWageFloor, classicPhillips + scarcityPremium);
}

/**
 * Stage 3: Endogenous nominal wage GROWTH rate (replaces computeWagePressure).
 *   nominalWageGrowth = inflationIndexation × prevCompositeInflation        [R7: LAGGED]
 *                     + productivityPassthrough × perWorkerProductivityGrowth [R1: per-worker only]
 *                     − phillipsSlope × max(0, UE − NAIRU)                     [R3: one-sided slack]
 *                     + Δ(scarcityPremiumLevel)                               [LEVEL hump → YoY change]
 *   then if negative: × (1 − downwardWageRigidity)                            [R20: total-growth rigidity]
 * Returns trendWageGrowth (no Phillips/scarcity) for the policy-floor reference (R19) and the Baumol term.
 * Pure function. (1−aiShare) gate deleted.
 */
export function computeNominalWageGrowth(args: {
  prevCompositeInflation: number;
  perWorkerProductivityGrowth: number;
  unemploymentRate: number;
  naturalRate: number;
  automationCoverage: number;
  prevScarcityPremiumLevel: number;
  scarcityIntensity: number;
  inflationIndexation: number;
  productivityPassthrough: number;
  phillipsSlope: number;
  downwardWageRigidity: number;
  /** Stage 7 (Part 3): rent-sharing — prev-year profit share (t−1 lag) vs the DRIFTING secular
   *  baseline (Q-2 B). TWO-SIDED: profits above baseline → workers claw back (bargaining/retention/
   *  equity comp); below → wage growth drags (recessions compress rent-sharing — stabilizing).
   *  NOT the scarcity premium: scarcity = f(coverage) — who is hard to replace; rent-sharing =
   *  f(profit share) — how much there is to bargain over. */
  prevProfitShare: number;
  baselineProfitShare: number;
  rentSharingElasticity: number;
}): { nominalWageGrowth: number; trendWageGrowth: number; scarcityPremiumLevel: number; rentSharingContribution: number } {
  const excessUE = Math.max(0, args.unemploymentRate - args.naturalRate);
  const cov = Math.max(0, Math.min(1, args.automationCoverage));
  const scarcityPremiumLevel = args.scarcityIntensity * cov * (1 - cov);            // documented hump LEVEL
  const scarcityGrowthContribution = scarcityPremiumLevel - args.prevScarcityPremiumLevel;

  // Trend (full-employment) wage growth: indexation + productivity, NO Phillips/scarcity. Used as the
  // reference for the policy min-wage LEVEL floor (R19) and the labor-services Baumol deviation.
  const trendWageGrowth = args.inflationIndexation * args.prevCompositeInflation
    + args.productivityPassthrough * args.perWorkerProductivityGrowth;

  // Stage 7 (Part 3): two-sided rent-sharing on the profit-share deviation (t−1)
  const rentSharingContribution = args.rentSharingElasticity
    * (args.prevProfitShare - args.baselineProfitShare);

  let nominalWageGrowth = trendWageGrowth
    - args.phillipsSlope * excessUE
    + scarcityGrowthContribution
    + rentSharingContribution;

  // R20: asymmetric downward nominal rigidity applies to TOTAL growth, whatever drove it negative.
  if (nominalWageGrowth < 0) {
    nominalWageGrowth *= (1 - args.downwardWageRigidity);
  }
  return { nominalWageGrowth, trendWageGrowth, scarcityPremiumLevel, rentSharingContribution };
}

/**
 * Phase 10.A — per-cluster scarcity premium helper.
 * Feeds the macro aggregate AND next-year Cheaper-score feedback (via priorYearWageAdjustmentByCluster).
 *
 * @param clusterAiDisplacementShare         Fraction of cluster employment displaced by AI this year [0, 1]
 * @param clusterReplacementDifficultyWagePremium  Employment-weighted mean of role.aiReplacementDifficultyWagePremium
 * @param scarcityIntensity                  config.scarcityIntensity (default DEFAULT_SCARCITY_INTENSITY)
 */
export function computeClusterScarcityPremium(inputs: {
  clusterAiDisplacementShare: number;
  clusterReplacementDifficultyWagePremium: number;
  scarcityIntensity: number;
}): { premium: number; wageAdjustment: number } {
  const premium = inputs.clusterAiDisplacementShare
    * inputs.scarcityIntensity
    * inputs.clusterReplacementDifficultyWagePremium;
  // wageAdjustment = premium directly (one-year lag via simulation.ts is the damping)
  return { premium, wageAdjustment: premium };
}

// DEPRECATED: computeNominalWageGrowth — Phase 8 Fix 5 wage growth chain removed.
// Root cause of zero-AI hyperinflation: created a wage-price spiral
// (inflation → 80% pass-through to wages → higher nominal GDP → higher wageBase → more inflation).
// Also double-counted Phillips curve (linear here + exponential in computeWagePressure())
// and double-counted productivity (here + via prevNominalGDP growth in wageBase).
// The existing wageBase × wagePressure path in computeMacro() already provides:
//   - Nominal growth via prevNominalGDP (tracks GDP growth including inflation)
//   - Productivity via structuralProductivityGrowth multiplier on wageBase
//   - Phillips curve via computeWagePressure() exponential decay
//   - AI premium via hump-shaped aiProductivityPremium in computeWagePressure()
//
// export function computeNominalWageGrowth(
//   prevInflation: number,
//   productivityGrowthRate: number,
//   unemploymentRate: number,
//   naturalUnemploymentRate: number,
//   phillipsCurveWageSensitivity: number = DEFAULT_PHILLIPS_CURVE_WAGE_SENSITIVITY,
// ): number {
//   const inflationPassThrough = Math.max(0, prevInflation) * INFLATION_PASS_THROUGH_RATE;
//   const productivityContribution = productivityGrowthRate;
//   const unemploymentGap = unemploymentRate - naturalUnemploymentRate;
//   const phillipsPressure = -unemploymentGap * phillipsCurveWageSensitivity;
//   return inflationPassThrough + productivityContribution + phillipsPressure;
// }

// DEPRECATED: computePriceLevel — only used 2 of 7+ inflation components (base - aiDeflation).
// Replaced by inline compositeInflation accumulation in computeMacro() which correctly weights
// shelter (36%) + goods (64%) with all 7 goods components. This fixes a 65% real GDP distortion
// by 2050 caused by ignoring shelter inflation, credit deflation, and other Phase 5i components.
//
// export function computePriceLevel(
//   previousPriceLevel: number,
//   aiDeflationRate: number,
//   baseInflation: number = BASE_INFLATION_RATE,
// ): number {
//   const netInflation = baseInflation - aiDeflationRate;
//   return Math.max(0.01, previousPriceLevel * (1 + netInflation));
// }

// DEPRECATED: computeARPP replaced by CWI (consumerWelfareIndex = consumption / population).
// CWI is a direct measure of per-capita real consumption, which is more economically
// meaningful than ARPP's nominal-income-divided-by-price-level approach.
// Kept commented for reference.
/*
export function computeARPP(
  totalNominalIncome: number,
  population: number,
  priceLevel: number,
): number {
  // Per capita: divide by population × price level
  const denominator = population * priceLevel;
  return denominator > 0 ? totalNominalIncome / denominator : 0;
}
*/

/**
 * Compute income composition shares.
 *
 * @param wageIncome - Total wage income
 * @param assetIncome - Total asset income (including policy)
 * @param transferIncome - Total transfer income (including policy)
 * @returns IncomeComposition with shares summing to 1
 */
export function computeIncomeComposition(
  wageIncome: number,
  assetIncome: number,
  transferIncome: number,
): IncomeComposition {
  const total = wageIncome + assetIncome + transferIncome;

  if (total <= 0) {
    return { wageShare: BASELINE_WAGE_SHARE, assetShare: BASELINE_ASSET_SHARE, transferShare: BASELINE_TRANSFER_SHARE };
  }

  return {
    wageShare: wageIncome / total,
    assetShare: assetIncome / total,
    transferShare: transferIncome / total,
  };
}

// DEPRECATED: Standalone computeGDP() — replaced by inline GDP computation in computeMacro().
// The inline version uses differentiated MPCs (wage/asset/transfer), obligation-based G
// decomposition, credit multipliers, and velocity drag. This standalone version used
// ARPP-based single-MPC consumption and procyclical G — both superseded.
/*
export function computeGDP(
  arpp: number,
  population: number,
  year: number,
  previousGDPReal: number,
  automationCoverage: number = 0,
  mpc: number = MARGINAL_PROPENSITY_TO_CONSUME,
): {
  consumption: number;
  investment: number;
  governmentSpending: number;
  netExports: number;
  gdpReal: number;
} {
  const consumption = arpp * population * mpc;
  const aiInvestmentBoost = AI_INVESTMENT_RATE * automationCoverage * (1 - automationCoverage);
  const investment = previousGDPReal * (TRADITIONAL_INVESTMENT_GDP_FRACTION + aiInvestmentBoost);
  const governmentSpending = previousGDPReal * GOVERNMENT_SPENDING_GDP_FRACTION;
  const netExports = previousGDPReal * NET_EXPORTS_GDP_FRACTION;
  const gdpReal = consumption + investment + governmentSpending + netExports;
  return {
    consumption,
    investment,
    governmentSpending,
    netExports,
    gdpReal: Math.max(0, gdpReal),
  };
}
*/

// DEPRECATED: detectTippingPoint replaced by CWI cycle phase classification.
// CWI detects ACCELERATING_DECLINE, LINEAR_DECLINE, DECELERATING_DECLINE, RECOVERY
// phases using growth rate and acceleration — more granular than binary tipping point.
// Kept commented for reference.
/*
export function detectTippingPoint(
  currentARPP: number,
  previousARPP: number,
  previouslyPastTipping: boolean,
  consecutiveDeclineYears: number = 0,
): { isPastTippingPoint: boolean; arppDeclineYears: number } {
  if (previouslyPastTipping) {
    return { isPastTippingPoint: true, arppDeclineYears: consecutiveDeclineYears + 1 };
  }
  const isDeclining = currentARPP < previousARPP * 0.999;
  const updatedDeclineYears = isDeclining ? consecutiveDeclineYears + 1 : 0;
  return {
    isPastTippingPoint: updatedDeclineYears >= 2,
    arppDeclineYears: updatedDeclineYears,
  };
}
*/

// DEPRECATED: Old ARPP-based revenue pressure (replaced by GDP-based in Phase 1 overhaul)
// export function computeRevenuePressure(currentARPP, previousARPP) { ... }

/**
 * Compute revenue pressure — how GDP contraction accelerates automation.
 *
 * Revenue pressure is the cyclical "economy is shrinking, cut costs now" force.
 * Separate from competitive pressure (adoption.ts), which handles "my competitor
 * automated so I must too" — a persistent structural force.
 *
 * McKinsey (2020) found COVID caused 3-4 years of digital acceleration in ~1 year
 * for ~10% revenue shock. Sensitivity 1.5 matches this: 10% contraction → 15% accel.
 *
 * Cap: Large enterprises have procurement/integration timelines limiting adoption speed.
 * Decay: Pressure fades as conditions stabilize. Half-life ~1 year (0.5 decay factor).
 *
 * @param gdpGrowthRate - Current GDP growth rate (negative = contraction)
 * @param previousAcceleration - Previous year's automation acceleration
 * @param sensitivity - How much contraction accelerates automation (default 1.5)
 * @param cap - Maximum automation acceleration (default 0.3)
 * @param decay - How quickly pressure fades (default 0.5)
 * @returns Object with revenuePressure and automationAcceleration
 */
export function computeRevenuePressure(
  gdpGrowthRate: number,
  previousAcceleration: number,
  sensitivity: number = REVENUE_PRESSURE_SENSITIVITY_DEFAULT,
  cap: number = REVENUE_PRESSURE_CAP,
  decay: number = REVENUE_PRESSURE_DECAY,
): { revenuePressure: number; automationAcceleration: number } {
  // FS-2b: the PRODUCER of the revenue-pressure acceleration (macro state, t-1 consumed); the
  // COMPOSER (simulation.ts effectiveAutomationAcceleration) adds the credit channel under the
  // SAME cap -- the cap-shadowing note lives there.
  const gdpContraction = Math.max(0, -gdpGrowthRate);
  const newPressure = Math.min(cap, sensitivity * gdpContraction);
  const automationAcceleration = Math.min(
    cap,
    previousAcceleration * decay + newPressure,
  );

  return { revenuePressure: newPressure, automationAcceleration };
}

/**
 * Detect depression conditions.
 *
 * Formula (DATA_MODEL.md §5.7):
 *   Depression when: GDP(t) < GDP(t-1) for 4+ consecutive quarters
 *   AND unemployment_rate(t) > 15%
 *
 * Since we model annually, we use consecutive years of decline.
 * 4 quarters ≈ 1 year of decline, so we trigger after 1 year.
 *
 * @param currentGDP - GDP at time t
 * @param previousGDP - GDP at time t-1
 * @param unemploymentRate - Current unemployment rate
 * @param previousConsecutiveDecline - Previous count of consecutive decline periods
 * @returns Object with depression status
 */
export function detectDepression(
  currentGDP: number,
  previousGDP: number,
  unemploymentRate: number,
  previousConsecutiveDecline: number,
): { isDepression: boolean; consecutiveDeclineQuarters: number } {
  // GDP declining?
  const isDecline = currentGDP < previousGDP;

  // Track consecutive decline (multiply by 4 to approximate quarters from years)
  const consecutiveDeclineQuarters = isDecline
    ? previousConsecutiveDecline + 4  // Each year = ~4 quarters
    : 0; // Reset on growth

  const isDepression =
    consecutiveDeclineQuarters >= DEPRESSION_CONSECUTIVE_DECLINE_QUARTERS &&
    unemploymentRate > DEPRESSION_UNEMPLOYMENT_THRESHOLD;

  return { isDepression, consecutiveDeclineQuarters };
}

// DEPRECATED: _auditConfig removed in Phase 1 feedback loop overhaul
// export const _auditConfig = { eafFloor: 0.5 };

// DEPRECATED: computeEconomicActivityFactor removed in Phase 1 feedback loop overhaul.
// Then Okun's Law (Phase 1 overhaul) removed in Phase 3c.1, replaced by per-cluster demand spillover.
// Demand spillover is level-based (not rate-of-change), per-cluster, and computed in simulation.ts.
// export function computeEconomicActivityFactor(gdpGrowthRate, isPastTippingPoint) { ... }

// ============================================================
// Second-Order Macro Effect Functions (Phase 8)
// ============================================================

// DEPRECATED (Phase 5g Step 0): SecondOrderEffectParams moved to @/types/index.ts
// export interface SecondOrderEffectParams {
//   demandFeedbackSensitivity: number;
//   creditUESensitivity: number;
//   maxCreditTightening: number;
//   creditInvestmentSensitivity: number;
//   creditConsumptionSensitivity: number;
//   baselineGovtTransfers: number;
//   baselineDebtInterest: number;
//   effectiveTaxRate: number;
//   transferGrowthPerUEPoint: number;
//   discretionaryShareOfG: number;
//   deflationVelocitySensitivity: number;
//   // Phase 1 feedback loop overhaul
//   revenuePressureSensitivity: number;
//   revenuePressureCap: number;
//   revenuePressureDecay: number;
//   aiWageProductivityMultiplier: number;
// }

// Re-export for backward compatibility (anything importing from './macro')
export type { SecondOrderEffectParams } from '@/types';

/** Default second-order parameters from module constants. */
export const DEFAULT_SECOND_ORDER_PARAMS: SecondOrderEffectParams = {
  demandFeedbackSensitivity: DEMAND_FEEDBACK_SENSITIVITY,
  // DEPRECATED Phase 6: credit sensitivity now in separate consumer/business functions
  // creditUESensitivity: CREDIT_UE_SENSITIVITY,
  // maxCreditTightening: MAX_CREDIT_TIGHTENING,
  // creditInvestmentSensitivity: CREDIT_INVESTMENT_SENSITIVITY,
  // creditConsumptionSensitivity: CREDIT_CONSUMPTION_SENSITIVITY,
  baselineGovtTransfers: BASELINE_GOVT_TRANSFERS,
  baselineDebtInterest: BASELINE_DEBT_INTEREST,
  // DEPRECATED (Stage 5 / H3): retired — incremental transfer spending now derives from the
  // per-person CASH + IN-KIND constants (single source of truth with the income side).
  // transferGrowthPerUEPoint: TRANSFER_GROWTH_PER_UE_POINT,
  discretionaryShareOfG: DISCRETIONARY_SHARE_OF_G,
  // Phase 4 quality pass: S-curve deflation velocity (replaces linear sensitivity)
  deferrableConsumptionShare: DEFERRABLE_CONSUMPTION_SHARE,
  deflationMidpoint: DEFLATION_MIDPOINT,
  deflationSteepness: DEFLATION_STEEPNESS,
  // Phase 4 quality pass: exponential Phillips curve
  phillipsCurveSensitivity: PHILLIPS_CURVE_SENSITIVITY,
  // Phase 1 feedback loop overhaul
  revenuePressureSensitivity: REVENUE_PRESSURE_SENSITIVITY_DEFAULT,
  revenuePressureCap: REVENUE_PRESSURE_CAP,
  revenuePressureDecay: REVENUE_PRESSURE_DECAY,
  aiWageProductivityMultiplier: AI_WAGE_PRODUCTIVITY_MULTIPLIER,
};

/**
 * Compute demand feedback — how a GDP shortfall reduces corporate profit boosts.
 *
 * When actual GDP falls below the baseline trend, demand has contracted,
 * reducing the customer base for AI-augmented firms. This dampens the
 * AI profit boost (operating leverage effect).
 *
 * IMPORTANT: Uses NOMINAL GDP, not real GDP. Deflation inflates real GDP
 * via the accounting identity (real = nominal / price level), which made
 * the old real-GDP-based ratio always >= 1.0 from ~2037 onward, permanently
 * disabling the demand feedback mechanism. Firms earn nominal revenue,
 * so nominal GDP is the correct measure of actual demand.
 *
 * Formula:
 *   baselineTrendGDP = baselineGDP × (1 + baselineNominalGDPGrowthRate)^yearsSinceStart
 *   demandRatio = min(1.0, prevNominalGDP / baselineTrendGDP)
 *   demandPenalty = demandRatio^sensitivity
 *
 * @param prevNominalGDP - Previous year's nominal GDP
 * @param baselineGDP - Baseline nominal GDP at t=0
 * @param baselineNominalGDPGrowthRate - Nominal GDP growth rate (real + inflation, e.g. ~0.046)
 * @param yearsSinceStart - Years since simulation start
 * @param sensitivity - Operating leverage exponent (default 1.5)
 * @returns { demandRatio, demandPenalty }
 */
/**
 * Compute demand feedback — corporate profits decline when GDP underperforms recent history.
 *
 * Rolling average adapts to the "new normal" — if GDP stabilizes at a lower level,
 * the penalty fades as firms right-size. Prevents the diverging baseline problem
 * where comparing to a trend growing at 4.6%/year made the ratio meaningless at
 * long horizons (the old baseline diverged to ~$90T by 2050).
 *
 * @param currentNominalGDP - Current year's nominal GDP
 * @param nominalGDPHistory - Array of past years' nominal GDP values
 * @param sensitivity - Operating leverage exponent (default 1.5)
 * @param lookbackYears - Number of years to average (default 5)
 * @returns { demandRatio, demandPenalty }
 */
export function computeDemandFeedback(
  currentNominalGDP: number,
  nominalGDPHistory: number[],
  sensitivity: number = DEMAND_FEEDBACK_SENSITIVITY,
  lookbackYears: number = 5,
): { demandRatio: number; demandPenalty: number } {
  const available = nominalGDPHistory.slice(-lookbackYears);
  const rollingAvgGDP = available.length > 0
    ? available.reduce((a, b) => a + b, 0) / available.length
    : currentNominalGDP;

  if (rollingAvgGDP <= 0) {
    return { demandRatio: 1.0, demandPenalty: 1.0 };
  }

  const demandRatio = Math.min(1.0, currentNominalGDP / rollingAvgGDP);
  const demandPenalty = Math.pow(demandRatio, sensitivity);

  return { demandRatio, demandPenalty };
}

// DEPRECATED: computeHousingWealthEffect removed in Phase 1 feedback loop overhaul.
// Housing markets in an AI future are unpredictable — land may appreciate as everything
// else deflates. Feature capped at 5pp excess UE and maxed at ~$413B impact in a $30T
// economy (1.4%). Not worth the complexity and unprovable assumptions.
// export function computeHousingWealthEffect(...) { ... }

// DEPRECATED Phase 6: computeCreditMultiplier and computeDualCreditMultiplier replaced
// by computeConsumerCreditConditions + computeBusinessCreditConditions.
// Old functions derived everything from unemployment rate.
// New functions use income adequacy (consumer) and profitability (business).
/*
export function computeCreditMultiplier(
  unemploymentRate: number,
  naturalUE: number = NATURAL_UNEMPLOYMENT_RATE,
  creditSensitivity: number = CREDIT_UE_SENSITIVITY,
  maxTightening: number = MAX_CREDIT_TIGHTENING,
  investSens: number = CREDIT_INVESTMENT_SENSITIVITY,
  consSens: number = CREDIT_CONSUMPTION_SENSITIVITY,
): { creditTightening: number; investmentMultiplier: number; consumptionMultiplier: number } {
  const excessUE = Math.max(0, unemploymentRate - naturalUE);
  const rawTightening = creditSensitivity * excessUE;
  const creditTightening = Math.min(maxTightening, rawTightening);
  const ratio = maxTightening > 0 ? creditTightening / maxTightening : 0;
  const investmentMultiplier = 1.0 - investSens * ratio;
  const consumptionMultiplier = 1.0 - consSens * ratio;

  return { creditTightening, investmentMultiplier, consumptionMultiplier };
}

export function computeDualCreditMultiplier(
  unemploymentRate: number,
  prevGDPGrowthRate: number,
  naturalUE: number,
  creditUESensitivity: number,
  maxCreditTightening: number,
  creditConsumptionSensitivity: number,
  creditInvestmentSensitivity: number,
  businessCreditGDPSensitivity: number,
  maxBusinessCreditLoosening: number,
): {
  householdCreditTightening: number;
  businessCreditSignal: number;
  investmentMultiplier: number;
  consumptionMultiplier: number;
} {
  const excessUE = Math.max(0, unemploymentRate - naturalUE);
  const rawHousehold = creditUESensitivity * excessUE;
  const householdCreditTightening = Math.min(maxCreditTightening, rawHousehold);
  const hRatio = maxCreditTightening > 0 ? householdCreditTightening / maxCreditTightening : 0;
  const consumptionMultiplier = 1.0 - creditConsumptionSensitivity * hRatio;

  const rawBusiness = prevGDPGrowthRate * businessCreditGDPSensitivity;
  const clampedBusiness = Math.max(-maxCreditTightening,
    Math.min(maxBusinessCreditLoosening, rawBusiness));
  const bDenom = Math.max(0.01, maxCreditTightening);
  const investmentMultiplier = 1.0 + (creditInvestmentSensitivity / bDenom) * clampedBusiness;

  return { householdCreditTightening, businessCreditSignal: clampedBusiness,
    investmentMultiplier, consumptionMultiplier };
}
*/

/**
 * Phase 6: Consumer credit conditions — based on income adequacy, collateral values,
 * and systemic risk (CWI-based).
 *
 * Banks underwrite against INCOME, not employment. Unemployment affects credit only
 * indirectly through: (1) lower wage income → lower underwritable income, and
 * (2) lower CWI → higher systemic default risk. With UBI providing reliable income,
 * credit can remain accessible despite high unemployment.
 *
 * All inputs use PREVIOUS YEAR's values (one-year lag) — banks set lending standards
 * based on last year's financial statements and regulatory data.
 *
 * Three independent channels:
 *   Channel 1: Income Adequacy — real underwritable income vs baseline
 *   Channel 2: Collateral Values — asymmetric home price response
 *   Channel 3: Systemic Risk — CWI trajectory + inflation expectations
 *
 * Source: Fed SLOOS, OCC Comptroller's Handbook, Fannie Mae Selling Guide
 */
export function computeConsumerCreditConditions(
  prevRealWageIncome: number,
  prevRealTransferIncome: number,
  prevRealAssetIncome: number,
  baselineHouseholdIncome: number,
  transferReliabilityWeight: number,
  prevHomePriceChangeRate: number,
  mortgageStressIndex: number,
  prevCWI: number,
  baselineCWI: number,
  prevCompositeInflation: number,
  incomeAdequacySensitivity: number,
  collateralSensitivity: number,
  systemicRiskSensitivity: number,
  inflationRiskSensitivity: number,
  maxConsumerTightening: number,
  consumerCreditImpact: number,
  // Phase 8 Fix 5: Growing credit baseline — income adequacy compares against expected trend,
  // not frozen year-0 values. This prevents credit tightening in a healthy growing economy.
  yearsSinceBaseline: number = 0,
  trendRealIncomeGrowthRate: number = 0,
): {
  consumerCreditMultiplier: number;
  consumerCreditTightening: number;
  /** Stage 6 (R18): channel sum BEFORE the maxConsumerTightening clip (binding diagnostics). */
  unclippedConsumerTightening: number;
  incomeAdequacyRatio: number;
  underwritableIncome: number;
} {
  // Channel 1: Income Adequacy
  // Banks assess each income stream by perceived stability for debt servicing:
  //   Wages: fully counted (steady paycheck, employer-verified)
  //   Transfers: partially counted (depends on program maturity — new UBI ~0.5, established ~0.9)
  //   Asset income: heavily discounted (volatile, unreliable for monthly payments)
  const underwritableIncome =
    prevRealWageIncome * 1.0
    + prevRealTransferIncome * transferReliabilityWeight
    + prevRealAssetIncome * ASSET_INCOME_UNDERWRITING_WEIGHT;

  // Phase 8 Fix 5: Grow the baseline with expected real income trend.
  // Banks don't compare your 2027 income to your 2025 income — they compare to
  // what they'd expect given normal economic growth. Income only appears "deficient"
  // when it falls BELOW the expected trend, not merely staying flat in real terms.
  // trendRealIncomeGrowthRate ≈ structuralProductivityGrowth (~1.6%)
  const expectedGrowth = Math.pow(1 + trendRealIncomeGrowthRate, yearsSinceBaseline);
  const adjustedBaseline = baselineHouseholdIncome * expectedGrowth;

  const incomeAdequacyRatio = adjustedBaseline > 0
    ? Math.min(2.0, underwritableIncome / adjustedBaseline)
    : 1.0;
  const incomeDeficiency = Math.max(0, 1.0 - incomeAdequacyRatio);
  const incomeTightening = incomeAdequacySensitivity * incomeDeficiency;

  // Channel 2: Collateral Values (asymmetric)
  // Falling home prices → aggressive tightening (banks fear catching a falling knife)
  // Rising home prices → mild loosening (institutional memory, 3:1 asymmetry)
  // mortgageStressIndex amplifies tightening in high-foreclosure areas
  let collateralTightening: number;
  if (prevHomePriceChangeRate < 0) {
    collateralTightening = collateralSensitivity * mortgageStressIndex
      * Math.abs(prevHomePriceChangeRate);
  } else {
    collateralTightening = -collateralSensitivity * COLLATERAL_LOOSENING_ASYMMETRY
      * prevHomePriceChangeRate;
  }

  // Channel 3: Systemic Portfolio Risk
  // CWI decline → rising default probability → banks tighten for ALL borrowers
  const cwiDecline = baselineCWI > 0
    ? Math.max(0, 1.0 - (prevCWI / baselineCWI))
    : 0;
  const systemicTightening = systemicRiskSensitivity * cwiDecline;

  // Forward-looking: inflation above 3% erodes future repayment ability
  const inflationRiskPremium = Math.max(0,
    prevCompositeInflation - 0.03) * inflationRiskSensitivity;

  const totalSystemicTightening = systemicTightening + inflationRiskPremium;

  // Combined: all three channels compound during crises
  // Stage 6 (R18): surface the UNCLIPPED channel sum so binding analysis can judge whether the
  // ceiling or the demand for tightening is the constraint.
  const unclippedConsumerTightening = Math.max(0,
    incomeTightening + collateralTightening + totalSystemicTightening);
  const totalConsumerTightening = Math.min(maxConsumerTightening, unclippedConsumerTightening);

  const consumerCreditRatio = maxConsumerTightening > 0
    ? totalConsumerTightening / maxConsumerTightening : 0;
  const consumerCreditMultiplier = Math.max(0.01,
    1.0 - consumerCreditImpact * consumerCreditRatio);

  return {
    consumerCreditMultiplier,
    consumerCreditTightening: totalConsumerTightening,
    unclippedConsumerTightening,
    incomeAdequacyRatio,
    underwritableIncome,
  };
}

/**
 * Phase 6: Business credit conditions — based on profitability and revenue trajectory.
 *
 * Completely independent of consumer conditions. A company with strong AI-driven
 * profits should have easy access to credit even if consumer unemployment is 25%.
 *
 * Two channels:
 *   Channel 1: Profitability — can the business service debt from current earnings?
 *   Channel 2: Revenue Trajectory — is the economy growing or shrinking?
 *
 * Source: Fed SLOOS (SUBLPDMBSXWBNQ), BEA NIPA Table 5.3
 */
export function computeBusinessCreditConditions(
  prevAfterTaxCorporateProfits: number,
  baselineCorporateProfits: number,
  prevGDPGrowthRate: number,
  profitabilitySensitivity: number,
  growthTrajectorySensitivity: number,
  maxBusinessTightening: number,
  maxBusinessLoosening: number,
  businessInvestmentImpact: number,
  // Stage 0 (item 1): trend nominal growth for the growth signal (default 0 = legacy absolute behavior).
  // The profit-coverage baseline (arg #2) is GDP-proportional, pre-scaled by the caller (Stage 0 item 2).
  trendNominalGrowthRate: number = 0,
): {
  businessCreditMultiplier: number;
  businessCreditTightening: number;
  profitCoverageRatio: number;
} {
  // Channel 1: Profitability
  // Below baseline: tightening. Above baseline: loosening signal (capped at 2x).
  // Stage 0 (item 2): the caller passes a GDP-proportional baseline (year-0 endogenous profits scaled
  // by lagged nominal GDP), so a healthy economy with a stable profit SHARE yields profitCoverageRatio
  // ≈ 1.0. The ratio moves only when the profit share of GDP changes — the meaningful credit signal.
  const profitCoverageRatio = baselineCorporateProfits > 0
    ? Math.min(2.0, prevAfterTaxCorporateProfits / baselineCorporateProfits)
    : 1.0;
  const profitSignal = 1.0 - profitCoverageRatio;
  // profitCoverageRatio = 1.5 → profitSignal = -0.5 → loosening
  // profitCoverageRatio = 0.6 → profitSignal = 0.4 → tightening
  const profitTightening = profitabilitySensitivity * profitSignal;

  // Channel 2: Revenue Trajectory
  // Positive GDP growth → loosening (banks confident in lending)
  // Negative GDP growth → tightening (revenue declining)
  // Stage 0 (item 1): growth signal is relative to TREND nominal growth — at-trend growth is neutral
  // (no loosening). Absolute positive growth previously made a healthy steady-state economy perpetually
  // "loosen" business credit, inflating investment demand above capacity → capacity-gate false-positive.
  const growthSignal = -growthTrajectorySensitivity * (prevGDPGrowthRate - trendNominalGrowthRate);
  const cappedGrowthEffect = Math.max(-DEFAULT_MAX_GROWTH_TIGHTENING,
    Math.min(maxBusinessLoosening, growthSignal));

  // Combined: growth can offset profit weakness
  const rawBusinessTightening = profitTightening + cappedGrowthEffect;
  const totalBusinessTightening = Math.max(-maxBusinessLoosening,
    Math.min(maxBusinessTightening, rawBusinessTightening));

  // businessCreditRatio can be negative → multiplier > 1.0 (loosening)
  const businessCreditRatio = maxBusinessTightening > 0
    ? totalBusinessTightening / maxBusinessTightening : 0;
  const businessCreditMultiplier = Math.max(0.01,
    1.0 - businessInvestmentImpact * businessCreditRatio);

  return {
    businessCreditMultiplier,
    businessCreditTightening: totalBusinessTightening,
    profitCoverageRatio,
  };
}

/**
 * Phase 5i: Housing wealth effect — falling home prices reduce homeowner spending.
 *
 * When foreclosures rise and credit tightens, home prices fall. Homeowners feel
 * poorer (negative wealth effect) and reduce consumption. This was the primary
 * transmission mechanism in the 2008 crisis.
 *
 * Source: Carroll, Otsuka, Slacalek (2006): MPC out of housing wealth 0.02-0.09
 *         Case, Quigley, Shiller (2005): MPC ~0.06
 *         Fed Z.1 Financial Accounts: household real estate ~$45T (2024 Q3)
 */
// FS-4b (the premise CORRECTED in FS4B_REPORT): this function is DEAD IN THE SIMULATION PATH —
// the live else-branch routes the wealth drag, the collateral rate, and the builder trendG to the
// STRUCTURAL housing block (homePriceChangeRate = housing.homePriceGrowth). The FS-4 memo's
// headline claim (a live dual-role seam) was WRONG: the producer's liveness was never
// slot-verified. Retained ONLY for its two test callers, marked per the F-C dead-code genus;
// its five inline numbers are NOT live model behavior. DO NOT wire this into the simulation.
// FS-4b (the premise CORRECTED in FS4B_REPORT): this function is DEAD IN THE SIMULATION PATH —
// the live else-branch routes the wealth drag, the collateral rate, and the builder trendG to the
// STRUCTURAL housing block (homePriceChangeRate = housing.homePriceGrowth). The FS-4 memo's
// headline claim (a live dual-role seam) was WRONG: the producer's liveness was never
// slot-verified. Retained ONLY for its test callers, marked per the F-C dead-code genus;
// its five inline numbers are NOT live model behavior. DO NOT wire this into the simulation.
export function computeHousingWealthEffect(
  avgHomeownership: number,
  foreclosureRateAggregate: number,
  adjustedCreditTighteningRatio: number,
  housingWealthMPC: number,
  institutionalBuyerRate: number = 0.40,
  rentalDemandSensitivity: number = 0.50,
): { housingWealthDrag: number; homePriceChangeRate: number } {
  // A2. Institutional demand absorbs some foreclosure supply
  const rawForeclosurePressure = -foreclosureRateAggregate * 3.0;
  const institutionalDemand = foreclosureRateAggregate * institutionalBuyerRate * 3.0;
  const foreclosureSupplyPressure = rawForeclosurePressure + institutionalDemand;

  // Demand: credit tightening reduces mortgage origination → fewer buyers
  const creditDemandPressure = -adjustedCreditTighteningRatio * 0.5;
  // Baseline appreciation from population growth + land scarcity
  const populationDemandPressure = 0.01;

  // Rental demand stabilizes home prices (investors see rental yield)
  const rentersCreated = Math.max(0, BASELINE_HOMEOWNERSHIP - avgHomeownership);
  const rentalPricePressure = rentersCreated * rentalDemandSensitivity * 0.5;

  const homePriceChangeRate = foreclosureSupplyPressure + creditDemandPressure
    + populationDemandPressure + rentalPricePressure;

  // Wealth change applied to ALL housing ($45T), scaled by homeownership fraction
  const wealthChange = BASELINE_HOUSING_WEALTH * homePriceChangeRate;
  const housingWealthDrag = wealthChange * housingWealthMPC * avgHomeownership;

  return { housingWealthDrag, homePriceChangeRate };
}

/**
 * Phase 8 Fix 5: Compute year-over-year home price change rate.
 *
 * Home prices are driven by five factors, in order of empirical importance:
 *
 * 1. Mortgage affordability (DOMINANT): When rates drop 100bp, affordability
 *    improves ~12%, prices rise ~6%. This is why 2020 saw a housing boom
 *    during a recession (rates dropped to 2.65%).
 *    Source: Glaeser et al. (2012) "Can Cheap Credit Explain the Housing Boom?"
 *
 * 2. Income growth (medium-term anchor): Year-over-year real income change.
 *    Measured as GROWTH, not level vs static baseline.
 *    Source: Mian & Sufi (2009) "The Consequences of Mortgage Credit Expansion"
 *
 * 3. Foreclosure supply pressure: Foreclosures add inventory, depressing prices.
 *    Institutional buyers absorb some of this supply.
 *    Source: Campbell et al. (2011) "Forced Sales and House Prices"
 *
 * 4. Demographic demand: Population growth creates housing demand.
 *    Source: Mankiw & Weil (1989) "The Baby Boom, the Baby Bust, and the Housing Market"
 *
 * 5. Affordability reversion: Gravitational pull toward equilibrium price-to-income
 *    ratio. When prices outrun incomes, headwinds build. When prices are depressed
 *    relative to income, tailwinds support recovery. This naturally bounds price
 *    dynamics without artificial caps — affordability is the gravity for home prices.
 *    Asymmetric: downward reversion is weaker (sellers resist price cuts, homes
 *    taken off market rather than sold at a loss → 2008 decline took 5 years).
 *    Source: Case & Shiller (1989) "The Efficiency of the Market for Single-Family Homes";
 *            Glaeser & Gyourko (2005) "Urban Decline and Durable Housing."
 *
 * GDP is NOT a direct input. It affects prices through the channels above:
 *   GDP decline → income decline (channel 2), job losses → foreclosures (channel 3),
 *   Fed response → rate changes (channel 1). Including GDP directly double-counts.
 *
 * @param mortgageRateChange - Change in mortgage rate from previous year (e.g., -0.01 = -100bp)
 * @param realIncomeGrowthRate - Year-over-year change in real household income
 * @param foreclosureSupplyPressure - Net foreclosure effect (already computed in model)
 * @param populationGrowthRate - Annual population growth rate
 * @param affordabilityDeviation - Positive = homes cheap (tailwind), negative = homes expensive (headwind)
 * @param affordabilityPriceSensitivity - Config: mortgage rate → price elasticity (default 4.0)
 * @param incomeHousingElasticity - Config: income growth → price elasticity (default 0.5)
 * @param affordabilityReversionSensitivity - Config: how fast prices revert to affordability mean (default 0.15)
 * @param demographicHousingElasticity - Config: population growth → price elasticity (default 1.0)
 * @param downwardStickinessRatio - Config: how much weaker downward reversion is vs upward (default 0.5)
 * @returns Home price change rate (e.g., 0.03 = 3% appreciation, -0.05 = 5% decline)
 */
export function computeHomePriceChange(
  mortgageRateChange: number,
  realIncomeGrowthRate: number,
  foreclosureSupplyPressure: number,
  populationGrowthRate: number,
  affordabilityDeviation: number,
  affordabilityPriceSensitivity: number = DEFAULT_AFFORDABILITY_PRICE_SENSITIVITY,
  incomeHousingElasticity: number = DEFAULT_INCOME_HOUSING_ELASTICITY,
  affordabilityReversionSensitivity: number = DEFAULT_AFFORDABILITY_REVERSION_SENSITIVITY,
  demographicHousingElasticity: number = DEFAULT_DEMOGRAPHIC_HOUSING_ELASTICITY,
  downwardStickinessRatio: number = DEFAULT_DOWNWARD_STICKINESS_RATIO,
): number {
  // Channel 1: Mortgage affordability (dominant short-term driver)
  // Negative rate change (rates falling) → positive price effect
  // -100bp rate change × 4.0 sensitivity = +4% price increase
  // +200bp rate change × 4.0 = -8% price decline
  const affordabilityEffect = -mortgageRateChange * affordabilityPriceSensitivity;

  // Channel 2: Real income growth
  // +3% income growth × 0.5 elasticity = +1.5% price increase
  // -5% income decline × 0.5 = -2.5% price decline
  const incomeEffect = realIncomeGrowthRate * incomeHousingElasticity;

  // Channel 3: Supply pressure from foreclosures (already computed upstream)
  const supplyEffect = foreclosureSupplyPressure;

  // Channel 4: Demographic demand
  // 0.4% population growth × 1.0 = +0.4% baseline price support
  const demographicEffect = populationGrowthRate * demographicHousingElasticity;

  // Channel 5: Affordability reversion (replaces momentum — naturally bounded)
  // When homes are cheap relative to income (positive deviation): pull prices UP
  // When homes are expensive (negative deviation): pull prices DOWN (but weaker — sticky)
  //
  // Example: prices rose 20% with flat income → affordabilityDeviation ≈ -0.17
  // Reversion = -0.17 × 0.15 = -2.5% headwind (homes expensive, demand weakening)
  //
  // Example: robotics doubles supply, prices drop 30% → deviation ≈ +0.43
  // Reversion = +0.43 × 0.15 = +6.4% tailwind (homes cheap, buyers flood in)
  const effectiveReversion = affordabilityDeviation >= 0
    ? affordabilityDeviation * affordabilityReversionSensitivity
    : affordabilityDeviation * affordabilityReversionSensitivity * downwardStickinessRatio;

  return affordabilityEffect + incomeEffect + supplyEffect
    + demographicEffect + effectiveReversion;
}

/**
 * STAGE 6.5: Stock-flow housing model (owner spec OD-9a–e; checkpoint ratified).
 * Pure function — one annual step of the six-block system:
 *   1. DEMAND: households via headship (formation collapses one-sided with income deviations, R24-class
 *      asymmetry; reverts toward baseline as conditions normalize).
 *   2. SUPPLY: starts respond to the profitability gap (P vs replacement cost) through the Saiz
 *      regulatory-friction dial, capped by construction capacity (embodied AI builds FASTER);
 *      completions lag 1 yr; stock depreciates (HUD ~0.25%/yr).
 *   3. REPLACEMENT COST: (1−λ)·CC + λ·L. CC absorbs the FULL construction-cluster embodied deflation
 *      (the 0.05 CPI hook is retired — cost savings reach shelter only through the supply response).
 *      L tracks nominal income (Knoll-Schularick-Steger) + scarcity + the investor land bid
 *      (R24: ONE-SIDED — land ratchets up, is held not dumped). As CC→0, λ_eff→1: land is the
 *      terminal constraint (replaces the fake −0.05 "land scarcity floor").
 *   4. RENT (= shelter CPI): cost anchor (Glaeser-Gyourko production-cost view; RATIFIED) +
 *      occupancy gap (Rosen-Smith natural-vacancy literature). BASELINE_SHELTER_INFLATION is now
 *      EMERGENT (zero-AI ≈ 3.95%/yr — see STAGE6_5_CHECKPOINT.md Gate A arithmetic).
 *   5. PRICE: ΔP = ΔR − Δcap/cap + fire-sale (Mian-Sufi-Trebbi 1.75, replaces the hand-set ×3.0).
 *      capRate = base + β·(mortgage − baseline) — rate rises sink prices with stable rents (GR pattern).
 *   6. CONSERVATION: foreclosed units STAY in the stock; institutional conversions house renters —
 *      tenure shifts can no longer manufacture rental inflation (kills the +17.3pp artifact).
 * Growth RATES are computed every year (incl. year 0, for emergent year-0 shelter inflation);
 * LEVEL indices compound from year 1 (isFirstYear holds them at 1.0 / baselines).
 */
export function computeHousingBlock(args: {
  isFirstYear: boolean;
  // prev states (1.0 / baselines at first year)
  prevHousingStock: number; prevHouseholds: number; prevHeadship: number;
  prevRentIndex: number; prevConstructionCost: number; prevLandCost: number;
  prevHomePriceIndex: number; prevHousingStarts: number;
  // current-year drivers
  population: number;
  nominalWageGrowth: number;
  baseInflationRate: number;
  broadGoodsPressure: number;
  secDeflShelter: number;            // construction-cluster embodied deflation (R10 routing), full strength
  embodiedCapability: number;        // [0,1] embodied capability curve (capacity channel)
  prevRealIncomeGrowthRate: number;  // t−1 (0 at year 0 = sentinel)
  prevCompositeInflation: number;    // t−1
  trendRealIncomeGrowth: number;     // ≈ baselineGDPGrowth
  foreclosureRateAggregate: number;
  institutionalBuyerRate: number;
  mortgageRate: number; prevMortgageRate: number;
  prevAssetIncomeShare: number; baselineAssetIncomeShare: number;
  /** Examination (config-consistency, Stage-6 precedent): realized population growth — equilibrium
   *  baseline starts must track the CONFIGURED demography, not the default constant (zero-pop-growth
   *  configs otherwise build into a glut → housing deflation spiral; the Test-B residual driver). */
  realizedPopulationGrowth: number;
  // parameters (user-adjustable; cited defaults in constants.ts)
  formationSensitivity: number; headshipRecoveryRate: number;
  supplyElasticity: number; embodiedCapacityGain: number; depreciationRate: number;
  landShare: number; constructionLaborShare: number;
  landIncomeBeta: number; landScarcityElasticity: number;
  rentOccupancyElasticity: number; rentCostAnchorWeight: number;
  opexPassthrough: number; rentDownwardRigidity: number;
  rentIncomeElasticity: number; prevAfterTaxIncomeGrowth: number;
  diagSpotBuilderPrice?: boolean;
  // L9c
  builderPriceMode?: 'spot' | 'trend-aware' | 'adaptive';
  prevBuilderTrendGrowth: number; prevHomePriceChangeRate: number;
  constructionCreditSensitivity: number; prevBusinessCreditTightening: number;
  baselineCapRate: number; capRateMortgageBeta: number; capRateInvestorCompression: number;
  fireSaleElasticity: number; investorDemandIntensity: number;
  /** E-6 (ratified): the land discount-rate channel — the Fed now reaches every asset. */
  landRateSensitivity: number;
  // E-10 (ratified): pipeline + gradual builders
  prevHousingPipeline: number; prevBuilderPriceIndex: number;
  builderAdjustmentLambda: number; housingPipelineDuration: number;
  // E-11 (ratified): the land residual closure
  landClosureKappa: number; prevLandResidualTarget: number;
  // E-12: the same-date capRate reference (legacy 0.06 via config.mortgageRateReference)
  mortgageRateReference?: number;
}): {
  headshipRate: number; households: number; housingStock: number; housingStarts: number;
  housingPipeline: number; housingCompletions: number; builderPriceIndex: number;
  landResidualTarget: number;
  builderTrendGrowth: number;
  occupancyRate: number; occupancyGap: number;
  rentGrowth: number; rentIndex: number;
  constructionCostGrowth: number; constructionCostIndex: number;
  landGrowth: number; landCostIndex: number;
  replacementCostIndex: number; profitabilityGap: number;
  capRate: number; homePriceGrowth: number; homePriceIndex: number;
  lambdaEffPrev: number;             // value-weighted land share at t−1 (nonAI add-back weighting)
  investorLandBid: number; fireSalePressure: number;
} {
  const a = args;
  const baselineHeadship = BASELINE_HOUSEHOLDS_2025 / US_POPULATION_2025;
  const naturalOccupancy = BASELINE_HOUSEHOLDS_2025 / BASELINE_HOUSING_STOCK_2025;
  // Equilibrium baseline starts: hold occupancy at natural given the model's own demography
  // (0.95M/yr — HOUST 1.36M is the documented empirical cross-check; the gap is household-size
  // decline + immigration the 0.4%/yr demography does not carry. Ruled 6.5 item 3.)
  const baselineStarts = a.depreciationRate * BASELINE_HOUSING_STOCK_2025
    + (Math.max(0, a.realizedPopulationGrowth) * BASELINE_HOUSEHOLDS_2025) / naturalOccupancy;

  let landResidualTargetOut = 1.0;  // E-11 state (set in the land section)
  const capRateReference = a.mortgageRateReference ?? BASELINE_MORTGAGE_RATE_2025;  // E-12

  // ── 1. DEMAND: headship + households ──
  const incomeDev = a.prevRealIncomeGrowthRate - a.trendRealIncomeGrowth;
  const headshipGrowth = a.formationSensitivity * Math.min(0, incomeDev)
    + a.headshipRecoveryRate * Math.log(baselineHeadship / a.prevHeadship);
  const headshipRate = a.isFirstYear ? baselineHeadship : a.prevHeadship * (1 + headshipGrowth);
  const households = a.population * headshipRate;

  // ── 2. SUPPLY (E-10): the pipeline stock + gradual builders — the last instantaneous agents
  // join the gradual-adjustment family. Completions = the pipeline maturing at the length-biased
  // duration (supply keeps arriving through rate spikes — the 2023-24 evidence); the stock
  // inherits COMPLETIONS. Duration ≤ 0 = the legacy 1-yr lag (bit-equivalent with λ=0).
  const pipeD = a.housingPipelineDuration;
  const completions = pipeD > 0 ? a.prevHousingPipeline / pipeD : a.prevHousingStarts;
  const housingStock = a.isFirstYear
    ? BASELINE_HOUSING_STOCK_2025
    : a.prevHousingStock + completions - a.depreciationRate * a.prevHousingStock;
  const occupancyRate = households / housingStock;
  const occupancyGap = occupancyRate - naturalOccupancy;

  const prevReplacement = (1 - a.landShare) * a.prevConstructionCost + a.landShare * a.prevLandCost;
  // E-10: builders mark to their λ-smoothed planning-horizon price, not the spot capRate-crushed value
  const profitabilityGap = (a.prevBuilderPriceIndex - prevReplacement) / prevReplacement;
  const startsCapacity = BASELINE_STARTS_CAPACITY_RATIO * baselineStarts
    * (1 + a.embodiedCapacityGain * a.embodiedCapability);
  const gapImpliedStarts = Math.min(
    baselineStarts * Math.max(0, 1 + a.supplyElasticity * profitabilityGap),
    startsCapacity,
  );
  // L9c-1 (ratified, R1 residually calibrated): the construction-credit gate — entry reads the
  // Loop-4 business-credit conditions (the most credit-sensitive lending class; ADC −75% 2008-12).
  // Gate-A-neutral by construction (tightening ≡ 0 at trend → gate ≡ 1).
  // One-sided on the TIGHTENING side (the ratified choke semantics + the checkpoint's stated
  // Gate-A-neutrality): business credit EASING (negative tightening, the healthy baseline) is not
  // an entry subsidy — the boom-side credit channel is a separate, unruled edge (registered).
  const creditGate = Math.max(0, 1 - a.constructionCreditSensitivity * Math.max(0, a.prevBusinessCreditTightening));
  const gatedGapImpliedStarts = gapImpliedStarts * creditGate;
  // E-10: gradual start decisions — starts(t) = λ·starts(t−1) + (1−λ)·gapImplied (HOUST-calibrated)
  const housingStarts = a.builderAdjustmentLambda * a.prevHousingStarts
    + (1 - a.builderAdjustmentLambda) * gatedGapImpliedStarts;
  const housingPipeline = pipeD > 0
    ? Math.max(0, a.prevHousingPipeline + housingStarts - completions)
    : 0;

  // ── 3. REPLACEMENT COST: construction + land ──
  const constructionCostGrowth = a.constructionLaborShare * a.nominalWageGrowth
    + (1 - a.constructionLaborShare) * (a.baseInflationRate + a.broadGoodsPressure)  // E-9: receives the F-D complement via the caller (materials = non-shelter goods)
    - a.secDeflShelter;
  const constructionCostIndex = a.isFirstYear
    ? 1.0 : a.prevConstructionCost * (1 + constructionCostGrowth);

  // year-0 sentinel: realIncomeGrowthRate is 0 before the first full year — use the nominal trend
  const prevNominalIncomeGrowth = a.prevRealIncomeGrowthRate !== 0
    ? a.prevRealIncomeGrowthRate + a.prevCompositeInflation
    : a.trendRealIncomeGrowth + a.baseInflationRate;
  // R24: ONE-SIDED investor bid — land ratchets up with the asset-income share and does not
  // surrender gains when the share recedes (land is held, not dumped). Stated design choice.
  const investorLandBid = a.investorDemandIntensity
    * Math.max(0, a.prevAssetIncomeShare - a.baselineAssetIncomeShare);
  // E-6 (ratified): the rate term — LEVEL-deviation on the mortgage rate (capRate symmetry; land is
  // the longest-duration asset and must feel persistent rate levels, not just changes). Closes the
  // income→land→rent→indexation loop against the Taylor anchor (the §0 stability finding: without
  // it the zero-AI composite diverges to 9.6% by 2050). Distinct from the investor bid (E-2): the
  // bid is an asset-share-driven DEMAND flow; this is the DISCOUNT-RATE channel — no double-count.
  // E-11 (ratified): THE LAND RESIDUAL CLOSURE. L* computed in VALUE-CONSISTENT terms (precision
  // item 1): structureValue = CC index × the base structure quantity ((1−s₀) at base prices), so
  // the residual leverage declines (~2.5 → ~2.3) as land's value share drifts — exact, not frozen.
  // ECM form: feedforward g_L*(t) carries the cointegrating trend (EC ≡ 0 at equilibrium);
  // κ corrects level divergences. κ=0 → the literal pre-E-11 block (toggle #8, bit-equivalent).
  const kappa = a.landClosureKappa;
  let landGrowth: number;
  if (kappa > 0) {
    // L9 disposition 4: the 0.05 floor RETIRED — any path leaning on it was ruled a finding,
    // and the free-disposal guard (P ≥ (1−s)·CC) is the standing detector of infeasible paths.
    const residualTarget =
      (a.prevHomePriceIndex - (1 - a.landShare) * a.prevConstructionCost) / a.landShare;
    const gLstar = a.prevLandResidualTarget > 0
      ? residualTarget / a.prevLandResidualTarget - 1
      : 0;
    landGrowth = a.landScarcityElasticity * occupancyGap
      + investorLandBid
      + gLstar
      + kappa * (residualTarget / a.prevLandCost - 1);
    // the retired terms (β_direct, landRateSensitivity) are carried structurally by the closure;
    // see the wedge formalization at DEFAULT_LAND_CLOSURE_KAPPA.
    landResidualTargetOut = residualTarget;
  } else {
    landGrowth = a.landIncomeBeta * prevNominalIncomeGrowth
      + a.landScarcityElasticity * occupancyGap
      + investorLandBid
      - a.landRateSensitivity * (a.mortgageRate - capRateReference);  // legacy branch (toggle #8)
    landResidualTargetOut = a.prevLandResidualTarget;
  }
  const landCostIndex = a.isFirstYear ? 1.0 : a.prevLandCost * (1 + landGrowth);

  const replacementCostIndex = (1 - a.landShare) * constructionCostIndex + a.landShare * landCostIndex;
  const lambdaEffPrev = (a.landShare * a.prevLandCost) / prevReplacement;
  // Value-weighted component growth — algebraically identical to replacementIndex/prev − 1 when the
  // levels compound, AND yields the correct growth RATE at year 0 while the levels are held at 1.0
  // (level ratios would read 0 there, which zeroed year-0 shelter inflation — caught in Gate A).
  const replacementGrowth = (1 - lambdaEffPrev) * constructionCostGrowth + lambdaEffPrev * landGrowth;

  // ── 4. RENT = shelter CPI (cost anchor + occupancy cycle) ──
  // L9 (ratified): rents re-routed off the unit-gain circle. PRIMARY = the occupancy gap (the
  // original 6.5 design restored); + the LAND-FREE landlord opex term; one-sided nominal rigidity
  // on the total change (Genesove; 2008-12-derived). rentCostAnchorWeight > 0 = the pre-L9 legacy.
  let rentGrowth: number;
  if (a.rentCostAnchorWeight > 0) {
    rentGrowth = a.rentCostAnchorWeight * replacementGrowth
      + a.rentOccupancyElasticity * occupancyGap;
  } else {
    // L9b: the intensive margin — tenants' WTP tracks nominal disposable income per household
    const incomePerHouseholdGrowth = a.prevAfterTaxIncomeGrowth
      - (a.prevHouseholds > 0 ? households / a.prevHouseholds - 1 : 0);
    const rentGrowthRaw = a.rentOccupancyElasticity * occupancyGap
      + a.opexPassthrough * constructionCostGrowth
      + a.rentIncomeElasticity * incomePerHouseholdGrowth;
    rentGrowth = rentGrowthRaw >= 0
      ? rentGrowthRaw
      : (1 - a.rentDownwardRigidity) * rentGrowthRaw;
  }
  const rentIndex = a.isFirstYear ? 1.0 : a.prevRentIndex * (1 + rentGrowth);

  // ── 5. PRICE: rents capitalized at the rate-sensitive cap rate, plus fire sales ──
  const investorPressure = Math.max(0, a.prevAssetIncomeShare - a.baselineAssetIncomeShare);
    const capRate = a.baselineCapRate
    + a.capRateMortgageBeta * (a.mortgageRate - capRateReference)  // E-12: the same-date-derived reference
    - a.capRateInvestorCompression * investorPressure;
  const prevCapRate = a.baselineCapRate
    + a.capRateMortgageBeta * (a.prevMortgageRate - BASELINE_MORTGAGE_RATE_2025);
  const capRateDrag = prevCapRate > 0 ? (capRate - prevCapRate) / prevCapRate : 0;
  // CONSERVATION: foreclosed units stay in the stock; only the UNABSORBED share pressures prices
  const fireSalePressure = -a.fireSaleElasticity
    * (1 - a.institutionalBuyerRate) * a.foreclosureRateAggregate;
  const homePriceGrowth = rentGrowth - capRateDrag + fireSalePressure;
  const homePriceIndex = a.isFirstYear ? 1.0 : a.prevHomePriceIndex * (1 + homePriceGrowth);
  // E-10: the builder's planning-horizon price (same λ — one agent, one cadence)
  // L9c-3/4 (ratified): the TREND-AWARE builder — perceived = λ·prev·(1+trendG) + (1−λ)·P.
  // At constant growth, perceived ≡ P exactly (secular bias ZERO — the λ-lag row superseded);
  // deviations from trend decay at the same λ (the 2022-23 cadence calibration preserved).
  // trendG = an H=10 EMA of realized ΔP (H reuses the standing expectations horizon).
  // Modes: 'spot' (perceived = P) / 'trend-aware' (default) / 'adaptive' (the pre-L9c smoother —
  // the chronic-under-build world stays representable). diagSpotBuilderPrice ≡ legacy 'spot'.
  const builderMode = a.diagSpotBuilderPrice ? 'spot' : (a.builderPriceMode ?? 'trend-aware');
  const builderTrendGrowth = a.isFirstYear
    ? a.prevBuilderTrendGrowth
    : (1 - 1 / BUILDER_TREND_HORIZON_YEARS) * a.prevBuilderTrendGrowth
      + (1 / BUILDER_TREND_HORIZON_YEARS) * a.prevHomePriceChangeRate;
  const builderPriceIndex = a.isFirstYear ? 1.0
    : builderMode === 'spot'
      ? homePriceIndex
      : builderMode === 'adaptive'
        ? a.builderAdjustmentLambda * a.prevBuilderPriceIndex
          + (1 - a.builderAdjustmentLambda) * homePriceIndex
        : a.builderAdjustmentLambda * a.prevBuilderPriceIndex * (1 + builderTrendGrowth)
          + (1 - a.builderAdjustmentLambda) * homePriceIndex;

  return {
    headshipRate, households, housingStock, housingStarts, occupancyRate, occupancyGap,
    housingPipeline, housingCompletions: completions, builderPriceIndex,
    builderTrendGrowth,
    landResidualTarget: landResidualTargetOut,
    rentGrowth, rentIndex, constructionCostGrowth, constructionCostIndex,
    landGrowth, landCostIndex, replacementCostIndex, profitabilityGap,
    capRate, homePriceGrowth, homePriceIndex, lambdaEffPrev, investorLandBid, fireSalePressure,
  };
}

/**
 * Phase 5i: Map occupation clusters to income quintiles by average wage.
 *
 * Sorts clusters by wage, divides into 5 equal-size groups (by count, not employment).
 * Used for mortgage stress computation — high-wage cluster displacement causes
 * disproportionate mortgage stress.
 *
 * Source: Federal Reserve SCF 2022 income-quintile analysis
 */
export function mapClustersToQuintiles(
  clusters: Array<{ id: string; averageWage: number }>,
): Map<string, number> {
  const sorted = [...clusters].sort((a, b) => a.averageWage - b.averageWage);
  const result = new Map<string, number>();
  const quintileSize = Math.max(1, Math.ceil(sorted.length / 5));

  for (let i = 0; i < sorted.length; i++) {
    const cluster = sorted[i];
    if (!cluster) continue;
    const quintile = Math.min(4, Math.floor(i / quintileSize));
    result.set(cluster.id, quintile);
  }

  return result;
}

/**
 * Phase 5i: Mortgage stress index — composition-based credit amplifier.
 *
 * When AI displaces high-wage knowledge workers first (generative AI → Q4/Q5),
 * the same aggregate unemployment rate causes MORE mortgage stress than
 * proportional displacement. High-wage workers carry bigger mortgages.
 *
 * Returns >= 1.0 when high-wage clusters displaced disproportionately.
 * Returns exactly 1.0 when amplifier=0 (backward compatible).
 *
 * Source: Fed SCF 2022 income-quintile mortgage data
 */
export function computeMortgageStressIndex(
  clusterResults: Array<{ clusterId: string; baseEmployment: number;
    totalRemainingEmployment: number; averageWage: number }>,
  clusterQuintileMap: Map<string, number>,
  dynamicHomeownership: number[],
  mortgageStressAmplifier: number,
): number {
  if (mortgageStressAmplifier === 0 || clusterResults.length === 0) return 1.0;

  // Compute weighted displacement by quintile
  const quintileDisplacement = [0, 0, 0, 0, 0];
  const quintileEmployment = [0, 0, 0, 0, 0];

  for (const cr of clusterResults) {
    const q = clusterQuintileMap.get(cr.clusterId) ?? 2; // default middle
    const displaced = Math.max(0, cr.baseEmployment - cr.totalRemainingEmployment);
    if (quintileDisplacement[q] !== undefined) quintileDisplacement[q] += displaced;
    if (quintileEmployment[q] !== undefined) quintileEmployment[q] += cr.baseEmployment;
  }

  // Compute quintile displacement rates
  const quintileRates = quintileDisplacement.map((d, i) => {
    const emp = quintileEmployment[i] ?? 0;
    return emp > 0 ? d / emp : 0;
  });

  // Overall displacement rate
  const totalEmployment = quintileEmployment.reduce((a, b) => a + b, 0);
  const totalDisplacedSum = quintileDisplacement.reduce((a, b) => a + b, 0);
  const overallRate = totalEmployment > 0 ? totalDisplacedSum / totalEmployment : 0;

  if (overallRate < 0.001) return 1.0; // No meaningful displacement

  // Stress = weighted sum of (quintile displacement × mortgage burden × homeownership)
  // normalized by what the stress would be with proportional displacement
  let actualStress = 0;
  let proportionalStress = 0;
  for (let q = 0; q < 5; q++) {
    const qData = MORTGAGE_EXPOSURE_QUINTILES[q];
    if (!qData) continue;
    const burden = qData.mortgageBurdenPct;
    const ownership = dynamicHomeownership[q] ?? qData.homeownershipRate;
    const rate = quintileRates[q] ?? 0;
    actualStress += rate * burden * ownership;
    proportionalStress += overallRate * burden * ownership;
  }

  if (proportionalStress < 0.0001) return 1.0;
  const rawIndex = actualStress / proportionalStress;
  // Amplify the deviation from 1.0
  return 1.0 + (rawIndex - 1.0) * mortgageStressAmplifier;
}

/**
 * Phase 5i: Update per-quintile homeownership based on lagged displacement + recovery.
 *
 * Displacement → foreclosure (with lag) → homeownership loss.
 * Recovery rate gradually rebuilds toward baseline rates.
 *
 * Source: MBA National Delinquency Survey, Census Housing Vacancy Survey
 */
export function updateHomeownership(
  currentHomeownership: number[],
  clusterResults: Array<{ clusterId: string; baseEmployment: number;
    totalDirectDisplacement: number }>,
  clusterQuintileMap: Map<string, number>,
  displacementHistory: Array<Map<string, number>>,
  foreclosureLag: number,
  homeownershipRecoveryRate: number,
): { updated: number[]; foreclosureRateAggregate: number } {
  const updated = [...currentHomeownership];

  // Determine which year's displacement to use (lagged)
  const lagYears = Math.floor(foreclosureLag);
  const lagFraction = foreclosureLag - lagYears;

  // Get lagged displacement by quintile
  const quintileForeclosureRate = [0, 0, 0, 0, 0];
  const quintileEmployment = [0, 0, 0, 0, 0];

  // Use current year's cluster results to get employment totals
  for (const cr of clusterResults) {
    const q = clusterQuintileMap.get(cr.clusterId) ?? 2;
    if (quintileEmployment[q] !== undefined) quintileEmployment[q] += cr.baseEmployment;
  }

  // Get lagged displacement from history (interpolate between two lag years)
  const histLen = displacementHistory.length;
  const idx1 = histLen - 1 - lagYears;
  const idx2 = idx1 - 1;

  if (idx1 >= 0) {
    const laggedDisp = displacementHistory[idx1] as Map<string, number> | undefined;
    const olderDisp = idx2 >= 0 ? displacementHistory[idx2] : undefined;

    if (laggedDisp) {
      for (const cr of clusterResults) {
        const q = clusterQuintileMap.get(cr.clusterId) ?? 2;
        const d1 = laggedDisp.get(cr.clusterId) ?? 0;
        const d2 = olderDisp?.get(cr.clusterId) ?? d1;
        const interpolatedDisp = d1 * (1 - lagFraction) + d2 * lagFraction;
        if (quintileForeclosureRate[q] !== undefined) quintileForeclosureRate[q] += interpolatedDisp;
      }
    }
  }

  // Convert displacement to foreclosure rate per quintile
  let totalForeclosures = 0;
  let totalBase = 0;
  for (let q = 0; q < 5; q++) {
    const baseEmp = quintileEmployment[q] ?? 0;
    if (baseEmp <= 0) continue;
    const qForeclosure = quintileForeclosureRate[q] ?? 0;
    const dispRate = qForeclosure / baseEmp;
    const qData = MORTGAGE_EXPOSURE_QUINTILES[q];
    if (!qData) continue;
    const baselineOwnership = qData.homeownershipRate;
    const burden = qData.mortgageBurdenPct;

    // Foreclosure impact: displacement × mortgage burden → ownership loss
    const foreclosureImpact = dispRate * burden;
    // Apply loss but recover toward baseline
    const currentOwnership = updated[q] ?? baselineOwnership;
    const lossFromForeclosure = foreclosureImpact * currentOwnership;
    const recoveryAmount = homeownershipRecoveryRate * (baselineOwnership - currentOwnership);
    updated[q] = Math.max(0, Math.min(1, currentOwnership - lossFromForeclosure + recoveryAmount));

    totalForeclosures += qForeclosure * burden;
    totalBase += baseEmp;
  }

  const foreclosureRateAggregate = totalBase > 0 ? totalForeclosures / totalBase : 0;

  return { updated, foreclosureRateAggregate };
}

/**
 * Compute fiscal pressure — deficit reporting WITHOUT austerity cuts.
 *
 * Government revenue = effectiveTaxRate × nominalGDP. Spending includes
 * baseline G, automatic stabilizer transfers (growing with unemployment),
 * and debt interest. Deficit is computed and reported so users can see the
 * fiscal consequence of their policy choices. The model does NOT assume what
 * deficit level triggers austerity — that's a political judgment.
 *
 * @param nominalGDP - Current nominal GDP
 * @param unemploymentRate - Current unemployment rate [0, 1]
 * @param naturalUE - Natural unemployment rate [0, 1]
 * @param baselineG - Government purchases (real)
 * @param govtTransfers - Baseline government transfer payments
 * @param debtInterest - Baseline net interest payments
 * @param totalRevenue - Total government revenue (decomposed tax channels, Phase 5-tax)
 * @param incrementalTransferSpending - Stage 5 (H3): incremental-UE transfer outlays (cash + in-kind),
 *        the SAME dollar flow paid on the income/consumption side — identical constants by construction.
 *        (Replaces the retired transferGrowthPerPP $65B/pp × excessUE estimate.)
 * @param policyFiscalCost - Policy costs (UBI, wage subsidies, etc.)
 * @returns { adjustedG, fiscalDeficitGDPRatio, discretionarySpending }
 */
export function computeFiscalPressure(
  nominalGDP: number,
  unemploymentRate: number,
  naturalUE: number = NATURAL_UNEMPLOYMENT_RATE,
  baselineG: number = 0,
  govtTransfers: number = BASELINE_GOVT_TRANSFERS,
  debtInterest: number = BASELINE_DEBT_INTEREST,
  totalRevenue: number = EFFECTIVE_TAX_RATE * nominalGDP,  // backward-compat default
  incrementalTransferSpending: number = 0,
  policyFiscalCost: number = 0,
): { adjustedG: number; fiscalDeficitGDPRatio: number; discretionarySpending: number } {
  // Stage 5 (H3): the reporting deficit books the unified per-person flow directly. unemploymentRate
  // and naturalUE are retained in the signature for call-site continuity (the rate-based $/pp
  // estimate is retired — the dollar amount now arrives pre-computed from the single source).
  void unemploymentRate;
  void naturalUE;
  const additionalTransfers = incrementalTransferSpending;
  const totalTransfers = govtTransfers + additionalTransfers;
  // Fix D: Include policy fiscal cost (UBI, wage subsidies, etc.) in government spending.
  const totalSpending = baselineG + totalTransfers + debtInterest + policyFiscalCost;
  const revenue = totalRevenue;  // Phase 5-tax: was taxRate * nominalGDP
  const deficit = totalSpending - revenue;
  const fiscalDeficitGDPRatio = nominalGDP > 0 ? deficit / nominalGDP : 0;

  // No austerity cuts — government spending = baseline G (political judgment, not economic law)
  const discretionaryG = baselineG * DISCRETIONARY_SHARE_OF_G;

  return { adjustedG: baselineG, fiscalDeficitGDPRatio, discretionarySpending: discretionaryG };
}

/**
 * Compute deflation velocity drag on consumption — S-curve logistic deferral model.
 *
 * When prices fall, consumers defer purchases of durable/discretionary goods.
 * The deferral follows a logistic S-curve: minimal deferral at low deflation,
 * rapid increase around the midpoint, asymptoting at deferrableConsumptionShare.
 *
 * Calibrated to: Japan's lost decade (1-2% → mild deferral), Fisher (1933)
 * debt-deflation theory (5%+ → severe deferral of discretionary spending).
 *
 * @param netInflation - base inflation minus AI deflation (negative = deflation)
 * @param deferrableConsumptionShare - fraction of consumption that CAN be deferred (default 0.30)
 * @param deflationMidpoint - deflation rate at which half of deferrable spending is deferred (default 0.05)
 * @param deflationSteepness - logistic steepness parameter (default 40)
 * @returns { velocityMultiplier, deflationDragPct }
 */
export function computeDeflationDrag(
  netInflation: number,
  deferrableConsumptionShare: number = DEFERRABLE_CONSUMPTION_SHARE,
  deflationMidpoint: number = DEFLATION_MIDPOINT,
  deflationSteepness: number = DEFLATION_STEEPNESS,
): { velocityMultiplier: number; deflationDragPct: number } {
  if (netInflation >= 0) {
    return { velocityMultiplier: 1.0, deflationDragPct: 0 };
  }
  const deflationRate = Math.abs(netInflation);
  // Logistic S-curve: half of deferrable share is deferred at the midpoint
  const deferralFraction = deferrableConsumptionShare / (1 + Math.exp(-deflationSteepness * (deflationRate - deflationMidpoint)));
  const velocityMultiplier = 1.0 - deferralFraction;
  return { velocityMultiplier, deflationDragPct: deferralFraction };
}

/**
 * Compute complete macro output for a year.
 *
 * Execution order: employment → price level → income → CWI → GDP → corporate profits → cycle phase
 *
 * @param inputs - All macro inputs bundled into MacroInputs interface (Phase 5g Step 0)
 * @returns Complete MacroOutput
 */
export function computeMacro(inputs: MacroInputs): MacroOutput {
  // Destructure inputs with defaults (Phase 5g Step 0)
  const {
    year,
    totalRemainingEmployment,
    weightedAverageWage,
    totalDisplaced,
    automationCoverage,
    policyEffects,
    previousMacro,
    population = US_POPULATION_2025,
    laborForce = US_LABOR_FORCE_2025,
    baselineAverageWage = BASELINE_AVERAGE_ANNUAL_WAGE,
    sectorWeightedDeflationRate,
    baseInflationRate = BASE_INFLATION_RATE,
    baselineGDPGrowth = BASELINE_GDP_GROWTH_RATE,
    // DEPRECATED: profitRealizationSensitivity — replaced by endogenous capital gains realization rate
    secondOrderParams = DEFAULT_SECOND_ORDER_PARAMS,
    nominalGDPHistory = [],
    policyWageFloor = 0,
    productionInputs,
    aiProfitMargin: inputAiProfitMargin = DEFAULT_AI_PROFIT_MARGIN,
    traditionalProfitMargin = DEFAULT_TRADITIONAL_PROFIT_MARGIN,
    minWageCostPush: inputMinWageCostPush = 0,
    // Phase 9: Supply chain macro inputs
    supplyChainCostPush: inputSupplyChainCostPush = 0,
    labProfitMarginAdjustment: inputLabProfitMarginAdjustment = 0,
    automationDividend: inputAutomationDividend = 0,
    augmentationProfitBoost: inputAugmentationProfitBoost = 0,
    creditDeflationSensitivity = DEFAULT_CREDIT_DEFLATION_SENSITIVITY,
    scarcityInflation: inputScarcityInflation = 0,
    transferInflation: inputTransferInflation = 0,
    // Phase 7: monetization-based inflation (preferred over transferInflation when available)
    inflationFromMonetization: inputInflationFromMonetization,
    demandEffects: inputDemandEffects = 0,
    laborForceGrowthFactor: lfGrowth = 1.0,
    // Investment Demand Constraint — market signals
    prevAiCapacityUtilization = 1.0,
    consumerDemandRatio: inputConsumerDemandRatio = 1.0,
    // DEPRECATED Phase 6: businessCreditSignal replaced by businessCreditTightening
    // businessCreditSignal: inputBusinessCreditSignal = 0.0,
    aiUtilizationSensitivity = 50,
    consumerDemandInvestmentSensitivity = 50,
    // DEPRECATED Phase 6: creditInvestmentResponseSensitivity replaced by businessInvestmentImpact
    // creditInvestmentResponseSensitivity = 50,
    traditionalInvestmentDemandSensitivity = 30,
    traditionalInvestmentGDPFraction = TRADITIONAL_INVESTMENT_GDP_FRACTION,
  } = inputs;

  // Tax pipeline inputs (Phase 5-tax)
  const incomeTaxRate = inputs.incomeTaxRate ?? BASELINE_INCOME_TAX_RATE;
  const payrollTaxRate = inputs.payrollTaxRate ?? BASELINE_PAYROLL_RATE;
  const corporateTaxRate = inputs.corporateTaxRate ?? BASELINE_CORPORATE_TAX_RATE;
  const capitalGainsTaxRate = inputs.capitalGainsTaxRate ?? BASELINE_CAPITAL_GAINS_RATE;
  const corporateRetentionRate = inputs.corporateRetentionRate ?? BASELINE_CORPORATE_RETENTION_RATE;
  // DEPRECATED (Stage 1): aiProfitGrowthRateParam drove the old market-power price passthrough,
  // replaced by the explicit aiDeflationPassthrough parameter. inputs.aiProfitGrowthRate is still
  // consumed elsewhere (asset-income P/E path) via previousMacro, not here.
  // const aiProfitGrowthRateParam = inputs.aiProfitGrowthRate ?? DEFAULT_AI_PROFIT_GROWTH_RATE;
  const postTaxMpcWage = inputs.postTaxMPC_Wage ?? DEFAULT_POST_TAX_MPC_WAGE;
  const postTaxMpcAsset = inputs.postTaxMPC_Asset ?? DEFAULT_POST_TAX_MPC_ASSET;
  const postTaxMpcTransfer = inputs.postTaxMPC_Transfer ?? DEFAULT_POST_TAX_MPC_TRANSFER;
  const baselineCorpTaxRate = inputs.baselineCorporateTaxRate ?? BASELINE_CORPORATE_TAX_RATE;
  const stateLocalTaxRate = inputs.stateLocalTaxRate ?? STATE_LOCAL_TAX_RATE;
  const transferTaxRate = inputs.transferTaxRate ?? TRANSFER_TAX_RATE;

  // Phase 7: Extract fiscal-monetary inputs
  const inputMortgageRate = inputs.mortgageRate;
  const inputCorporateBorrowingRate = inputs.corporateBorrowingRate;
  const inputMarketReturn = inputs.marketReturn;

  // Phase 8a: Fiscal response profile + consolidation multipliers
  const fiscalProfile = inputs.fiscalProfile;
  const consolidationObligationMult = inputs.consolidationObligationMult ?? 1.0;
  const consolidationDiscretionaryMult = inputs.consolidationDiscretionaryMult ?? 1.0;

  // Asset Income Decomposition — dynamic P/E + endogenous capital gains
  const aiPESensitivity = inputs.aiPESensitivity ?? DEFAULT_AI_PE_SENSITIVITY;
  const tradPESensitivity = inputs.traditionalPESensitivity ?? DEFAULT_TRADITIONAL_PE_SENSITIVITY;

  const isFirstYear = previousMacro === null;
  const yearsSinceStart = year - DEFAULT_START_YEAR;

  // === Phase 2: New job integration into employment pool ===
  const totalHumanNewJobs = productionInputs?.totalDurableNewJobs ?? 0;

  // === Employment metrics ===
  // totalRemainingEmployment is now demand-constrained (Phase 3c.1 demand spillover
  // applied in simulation.ts BEFORE calling computeMacro). Add non-cluster workers
  // (self-employed, agricultural, etc.) for CPS-equivalent total employment.
  // Scale non-cluster workers with labor force growth so no-AI economy stays at ~4% UE.
  const scaledNonClusterEmployed = NON_CLUSTER_EMPLOYED * lfGrowth;
  const clusterEmployment = totalRemainingEmployment + totalHumanNewJobs;
  const totalEmployment = clusterEmployment + scaledNonClusterEmployed;
  const totalUnemployment = Math.max(0, laborForce - totalEmployment);
  const unemploymentRate = laborForce > 0 ? totalUnemployment / laborForce : 0;
  const laborForceParticipation = population > 0 ? laborForce / population : 0;

  // Use previous state or baseline
  const prevPriceLevel = previousMacro?.priceLevel ?? BASELINE_PRICE_LEVEL;
  // DEPRECATED (Phase 5g): ARPP replaced by CWI
  // const prevARPP = previousMacro?.arpp ?? 0;
  // DEPRECATED: prevGDPReal — all GDP feedback uses prevNominalGDP (nominal-first architecture)
  // const prevGDPReal = previousMacro?.gdpReal ?? BASELINE_GDP_NOMINAL_2025;
  // DEPRECATED (Phase 5g): ARPP tipping point replaced by CWI cycle detection
  // const prevIsPastTipping = previousMacro?.isPastTippingPoint ?? false;
  const prevConsecutiveDecline = previousMacro?.consecutiveDeclineQuarters ?? 0;
  // DEPRECATED (Phase 5g): ARPP decline years replaced by CWI acceleration
  // const prevArppDeclineYears = previousMacro?.arppDeclineYears ?? 0;

  // FIX 8: automationCoverage is now passed in as a parameter (displacement-based)

  // === Phase 6: Separated credit conditions ===
  // Uses PREVIOUS YEAR's data — banks set lending standards from last year's financials
  const mortgageStressIdx = inputs.mortgageStressIndex ?? 1.0;

  // Credit conditions require baseline captures from simulation.ts (baselineRealHouseholdIncome,
  // baselineCorporateProfits). These are NOT available when computeMacro is called directly
  // in unit tests or for the first year. Default to neutral (no tightening) when missing.
  let consumerCredit: { consumerCreditMultiplier: number; consumerCreditTightening: number; unclippedConsumerTightening: number; incomeAdequacyRatio: number; underwritableIncome: number };
  // E-1 state (examination): the adaptive credit bar
  let creditBarLevel = inputs.baselineRealHouseholdIncome ?? 0;
  let creditBarExpectationOut = baseInflationRate;
  let businessCredit: { businessCreditMultiplier: number; businessCreditTightening: number; profitCoverageRatio: number };
  let creditTighteningRate: number;
  let creditDeflationContribution: number;

  const hasBaselineCaptures = (inputs.baselineRealHouseholdIncome ?? 0) > 0
    && (inputs.baselineCorporateProfits ?? 0) > 0;

  if (isFirstYear || !hasBaselineCaptures) {
    // First year or missing baselines → neutral credit (no tightening, no loosening)
    consumerCredit = { consumerCreditMultiplier: 1.0, consumerCreditTightening: 0, unclippedConsumerTightening: 0, incomeAdequacyRatio: 1.0, underwritableIncome: 0 };
    businessCredit = { businessCreditMultiplier: 1.0, businessCreditTightening: 0, profitCoverageRatio: 1.0 };
    creditTighteningRate = 0;
    creditDeflationContribution = 0;
  } else {
    // Phase 8 Fix 5: Compute structural productivity growth for credit baseline growth.
    // This approximates ~1.6%/year (GDP growth minus population growth) — the rate the
    // real economy SHOULD be growing. The credit baseline grows at this rate so only
    // genuine deterioration (income falling below trend) triggers tightening.
    // Stage 2 (firewall): credit underwriting is now NOMINAL, so the income-adequacy baseline grows at
    // the NOMINAL trend = potential real growth (baselineGDPGrowth ~2.0%) + base inflation. Banks expect
    // nominal income to track the nominal economy; only nominal income falling BELOW that trend signals
    // deficiency. In zero-AI nominal income grows at exactly this trend ⇒ incomeAdequacyRatio ≈ 1.0.
    // (Stage 0 used the real 2.0% rate when underwriting was real-deflated; Stage 2 makes both nominal.)
    // Stage 6 (config-consistency): the trend's population component uses the REALIZED population
    // growth, not the constant baked into baselineGDPGrowth — banks expect income to track the
    // economy that exists, including its actual demography. At the default populationGrowthRate this
    // is bit-identical (terms cancel); in synthetic zero-population-growth configs it removes a
    // manufactured ~0.4%/yr "deficiency" that the resized ceiling would otherwise amplify.
    const realizedPopGrowth = previousMacro && previousMacro.dynamicPopulation > 0
      ? population / previousMacro.dynamicPopulation - 1
      : DEFAULT_POPULATION_GROWTH_RATE;
    // ═══ F4/OD-8 EXAMINATION (E-1 + the E-3 sibling): the credit income-adequacy bar ═══
    // INFLATION part (E-1, LAGGED-REALIZED via debt turnover): converges from the origination
    // expectation (baseInflationRate) toward lagged realized composite at 1/duration ≈ 0.143/yr —
    // Fisher preserved for the existing stock (the bar stays high for years into a deflation),
    // immortality removed (stocks turn over, new originations re-price). turnover = 0 → legacy FIXED.
    // REAL part (E-3 sibling, EMERGENT-CONSISTENT closed form): the post-D-1 potential real income
    // growth = perWorkerProductivity × productivityPassthrough + realized population growth
    // (≈ 1.6 × 0.90 + 0.4 = 1.84%) — the fixed 2.0% ignored the ratified D-1 passthrough; once E-1
    // fixes the inflation part, that 0.16pp/yr wedge would manufacture tightening in zero-AI.
    // creditBarRealTrend overrides for isolation runs (legacy = 0.02-equivalent).
    const turnoverRate = inputs.creditExpectationTurnover ?? DEFAULT_CREDIT_EXPECTATION_TURNOVER;
    const prevBarExpectation = previousMacro?.creditBarInflationExpectation ?? baseInflationRate;
    const creditBarInflationExpectation = prevBarExpectation
      + turnoverRate * ((previousMacro?.compositeInflation ?? baseInflationRate) - prevBarExpectation);
    const creditBarRealTrend = inputs.creditBarRealTrend
      ?? (((inputs.baselineGDPGrowth ?? BASELINE_GDP_GROWTH_RATE) - DEFAULT_POPULATION_GROWTH_RATE)
        * (inputs.productivityPassthrough ?? DEFAULT_PRODUCTIVITY_PASSTHROUGH)
        + realizedPopGrowth);
    // Recursive bar level (replaces the internal (1+g)^years power compound — identical arithmetic
    // for constant rates, and the only form that admits an adaptive expectation):
    const prevBarLevel = previousMacro?.creditBarLevel ?? (inputs.baselineRealHouseholdIncome ?? 0);
    const creditBarLevelVal = (isFirstYear || yearsSinceStart <= 1)
      ? (inputs.baselineRealHouseholdIncome ?? 0)   // year-0/1: prevRealIncome IS the baseline (Phase 8 Fix 5 convention)
      : prevBarLevel * (1 + Math.max(0, creditBarRealTrend + creditBarInflationExpectation));
    creditBarLevel = creditBarLevelVal;
    creditBarExpectationOut = creditBarInflationExpectation;

    consumerCredit = computeConsumerCreditConditions(
      inputs.prevRealWageIncome ?? 0,
      inputs.prevRealTransferIncome ?? 0,
      inputs.prevRealAssetIncome ?? 0,
      creditBarLevelVal,                 // E-1: the recursive adaptive bar (was baselineRealHouseholdIncome)
      inputs.transferReliabilityWeight ?? DEFAULT_TRANSFER_RELIABILITY_WEIGHT,
      inputs.prevHomePriceChangeRate ?? 0,
      mortgageStressIdx,
      inputs.prevCWI ?? (inputs.baselineCWI ?? 100),
      inputs.baselineCWI ?? 100,
      inputs.prevCompositeInflation ?? 0,
      inputs.incomeAdequacySensitivity ?? DEFAULT_INCOME_ADEQUACY_SENSITIVITY,
      inputs.collateralSensitivity ?? DEFAULT_COLLATERAL_SENSITIVITY,
      inputs.systemicRiskSensitivity ?? DEFAULT_SYSTEMIC_RISK_SENSITIVITY,
      inputs.inflationRiskSensitivity ?? DEFAULT_INFLATION_RISK_SENSITIVITY,
      inputs.maxConsumerTightening ?? DEFAULT_MAX_CONSUMER_TIGHTENING,
      inputs.consumerCreditImpact ?? DEFAULT_CONSUMER_CREDIT_IMPACT,
      0,                                 // E-1: the bar is precomputed above; no internal compounding
      0,
    );

    const prevGDPGrowthRate = previousMacro?.gdpGrowthRate ?? (inputs.baselineGDPGrowth ?? BASELINE_GDP_GROWTH_RATE);
    const maxBusinessLoosening = inputs.maxBusinessCreditLoosening ?? DEFAULT_MAX_BUSINESS_CREDIT_LOOSENING;

    // Stage 0 (item 2): GDP-proportional profit-coverage baseline. prevAfterTaxCorporateProfits reflects
    // year t-2 earnings (after-tax of year t-1 uses year t-2 profits), so scale the captured year-0
    // endogenous baseline by year t-2 nominal GDP. With a stable profit share this keeps the ratio ≈ 1.0.
    const laggedNominalGDP = nominalGDPHistory.length >= 2
      ? nominalGDPHistory[nominalGDPHistory.length - 2]!
      : BASELINE_GDP_NOMINAL_2025;
    const profitBaselineScaled = (inputs.baselineCorporateProfits ?? 0)
      * (laggedNominalGDP / BASELINE_GDP_NOMINAL_2025);

    businessCredit = computeBusinessCreditConditions(
      inputs.prevAfterTaxCorporateProfits ?? 0,
      profitBaselineScaled,
      prevGDPGrowthRate,
      inputs.profitabilitySensitivity ?? DEFAULT_PROFITABILITY_SENSITIVITY,
      inputs.growthTrajectorySensitivity ?? DEFAULT_GROWTH_TRAJECTORY_SENSITIVITY,
      inputs.maxBusinessTightening ?? DEFAULT_MAX_BUSINESS_TIGHTENING,
      maxBusinessLoosening,
      inputs.businessInvestmentImpact ?? DEFAULT_BUSINESS_INVESTMENT_IMPACT,
      // Stage 0 (item 1): growth signal neutral at trend. Nominal trend = potential real growth +
      // REALIZED prior-year inflation (tracks actual price dynamics rather than a fixed constant).
      baselineGDPGrowth + (previousMacro?.compositeInflation ?? baseInflationRate), // trendNominalGrowthRate
    );

    // Credit deflation contribution: consumer credit tightening causes deflationary pressure
    // (less consumer borrowing → less money creation → deflationary)
    // Stage 6 (R18): normalize by the GR-PEAK anchor (0.5), not the resized Depression-scale
    // ceiling — a GR-level tightening produces the same deflation pressure it always did
    // (rate 1.0 = one GR-unit); Depression-scale tightening can reach rate 2.0. Normalizing by
    // the new ceiling would have silently halved sub-saturation deflation pressure.
    creditTighteningRate = consumerCredit.consumerCreditTightening / CONSUMER_TIGHTENING_GR_PEAK;
    creditDeflationContribution = -creditTighteningRate * creditDeflationSensitivity;
  }

  // Demand feedback: rolling 5-year average comparison (Phase 1 overhaul)
  // Companies compare current revenue to recent years, not 25-year-old projections.
  // Rolling average adapts to the "new normal" — prevents diverging baseline problem.
  const prevNominalGDP = previousMacro?.gdpNominal ?? BASELINE_GDP_NOMINAL_2025;
  const demandResult = computeDemandFeedback(
    prevNominalGDP,
    nominalGDPHistory,
    secondOrderParams.demandFeedbackSensitivity,
  );

  // === FIX 4: Price level — P(0) = 1.0 exactly, accumulate starting at t=1 ===
  // Use sector-weighted deflation when available (from simulation.ts cluster results),
  // fall back to blended 3-component cost model.
  const aiDeflationRate_raw = sectorWeightedDeflationRate ?? (() => {
    // Phase 10.A Bug #B fix: inference component via floored curve (matches computeCheaperScore
    // and computeSectorWeightedDeflation). Manufacturing/energy retain exponential.
    const t = year - DEFAULT_START_YEAR;
    const comp = AI_COST_COMPOSITION['software']!;
    const mfg = inputs.aiCostParams?.manufacturingAnnualChange ?? DEFAULT_MANUFACTURING_ANNUAL_CHANGE;
    const eng = inputs.aiCostParams?.energyAnnualChange ?? DEFAULT_ENERGY_ANNUAL_CHANGE;
    const inferenceFactor = computeInferenceCostFactor(t, inputs.aiCostParams?.tokenCostCurve, inputs.aiCostParams?.tokenUsageMultiplier);
    const costSavings = Math.max(0, 1 - (
      comp.inference * inferenceFactor
      + comp.manufacturing * Math.exp(mfg * t)
      + comp.energy * Math.exp(eng * t)
    ));
    return Math.max(0, AI_DEFLATION_COEFFICIENT * automationCoverage * (1 + costSavings));
  })();

  // Stage 3: endogenous nominal wage GROWTH (replaces wagePressure). Computed here — ahead of the
  // sectoral price block — so the labor-services Baumol term reads the CURRENT wage growth (R7), while
  // the inflation-indexation input is the LAGGED prev-year composite (breaks the wage-price spiral).
  const perWorkerProductivityGrowth = Math.max(0, baselineGDPGrowth - DEFAULT_POPULATION_GROWTH_RATE); // R1: genuine 1.6%
  const wageGrowth = computeNominalWageGrowth({
    prevCompositeInflation: previousMacro?.compositeInflation ?? baseInflationRate,
    perWorkerProductivityGrowth,
    unemploymentRate,
    naturalRate: FRED_NAIRU_RATE,
    automationCoverage,
    prevScarcityPremiumLevel: previousMacro?.scarcityPremiumLevel ?? 0,
    scarcityIntensity: inputs.scarcityIntensity ?? 0,
    inflationIndexation: inputs.inflationIndexation ?? DEFAULT_INFLATION_INDEXATION,
    productivityPassthrough: inputs.productivityPassthrough ?? DEFAULT_PRODUCTIVITY_PASSTHROUGH,
    phillipsSlope: inputs.phillipsSlope ?? DEFAULT_PHILLIPS_SLOPE,
    downwardWageRigidity: inputs.downwardWageRigidity ?? DEFAULT_DOWNWARD_WAGE_RIGIDITY,
    // Stage 7: rent-sharing (t−1 profit share vs the drifting secular baseline, Q-2 B — same drift
    // number D-1 calibrates to, no new free constant; at drift 0 the worldview fork flips to the
    // post-2015-stabilization reading)
    prevProfitShare: previousMacro && previousMacro.gdpNominal > 0
      ? previousMacro.corporateProfits / previousMacro.gdpNominal
      : BASELINE_PROFIT_GDP_RATIO,
    baselineProfitShare: BASELINE_PROFIT_GDP_RATIO
      + (inputs.secularProfitDriftRate ?? DEFAULT_SECULAR_PROFIT_DRIFT_RATE) * (year - DEFAULT_START_YEAR),
    rentSharingElasticity: inputs.rentSharingElasticity ?? DEFAULT_RENT_SHARING_ELASTICITY,
  });
  const nominalWageGrowth = wageGrowth.nominalWageGrowth;
  const scarcityPremiumLevel = wageGrowth.scarcityPremiumLevel;
  // Compounded per-worker wage indices (relative to 2025). trendWageIndex = no-Phillips/scarcity reference.
  const prevWageIndex = previousMacro?.wageIndex ?? 1.0;
  const prevTrendWageIndex = previousMacro?.trendWageIndex ?? 1.0;
  const trendWageIndex = isFirstYear ? 1.0 : prevTrendWageIndex * (1 + wageGrowth.trendWageGrowth);
  const wageIndexRaw = isFirstYear ? 1.0 : prevWageIndex * (1 + nominalWageGrowth);
  // R19: policy minimum-wage LEVEL floor (NOT a growth floor — they diverge under deflation). The effective
  // wage level cannot fall below policyWageFloor × the trend wage level. policyWageFloor = minWage/baselineAvgWage;
  // it never binds when wageIndex == trendWageIndex (zero-AI / no displacement) ⇒ invisible there.
  const wageIndex = Math.max(wageIndexRaw, policyWageFloor * trendWageIndex);
  // R2 + Stage 6b (F3): the COLA index — single source for obligation-G, baseline transfers, and
  // incremental cash support. Growth = max(nominalWageGrowth, compositeInflation(t−1), 0):
  //   wages lead (normal times)      → wage-indexed (AWI; new awards track wages)
  //   prices lead (STAGFLATION)      → CPI-protected (existing benefits get CPI-W COLAs — the
  //                                    Stage-5b max(0, wage) form froze benefits in D 2035-40
  //                                    while prices rose, real cuts the statute doesn't deliver)
  //   both negative (deflation)      → flat (benefits never cut nominally; 1930-33 pattern)
  // Single-index approximation of the statute's stock-weighted blend (existing stock CPI-W-indexed,
  // new awards AWI-indexed) — registered in DATA_MODEL.md. Zero-AI: wages 4.5% > CPI 2.9% → wage
  // branch always active → identical to the pre-6b form (4.9% nominal with population = 2.0% real).
  const prevObligationGCOLAIndex = previousMacro?.obligationGCOLAIndex ?? 1.0;
  const colaIndexGrowth = Math.max(
    nominalWageGrowth,
    previousMacro?.compositeInflation ?? baseInflationRate,
    0,
  );
  const obligationGCOLAIndex = isFirstYear ? 1.0 : prevObligationGCOLAIndex * (1 + colaIndexGrowth);

  // ═══ STAGE 1: Sectoral price architecture (consumption-side 4-sector CPI partition) ═══
  // AI cost deflation reaches consumer prices ONLY in AI-exposed sectors and ONLY through the
  // passthrough fraction (the retained fraction accrues to producer margins/profits — Stage 7).
  // Labor-intensive services track the nominal wage rate (Baumol) and resist AI deflation; food &
  // energy are exogenous; shelter uses its own model below. Replaces the prior single "goods" bucket
  // that applied AI deflation to ~64% of CPI. Stage 1 RETIRES the aiProfitGrowthRate-derived
  // passthrough in favor of the explicit, user-adjustable aiDeflationPassthrough.
  const aiDeflationPassthrough = inputs.aiDeflationPassthrough ?? DEFAULT_AI_DEFLATION_PASSTHROUGH;
  const laborCostShare = inputs.laborCostShare ?? DEFAULT_LABOR_COST_SHARE;
  const aiDeflationRate = aiDeflationRate_raw;  // raw AI cost deflation; passthrough applied per-sector

  // Stage 4: monetary inflation is its own SIGNED component of composite (added uniformly across the
  // nominal basket — OD-3 ratified; equivalent to adding it to every sector since the weights sum to 1).
  // It is NO LONGER inside broadGoodsPressure. The Fisher term (computeMoneyCreation) is now signed and
  // does NOT net against AI deflation (R9) — AI deflation lives only in the per-sector terms below.
  const monetaryInflation = inputInflationFromMonetization !== undefined
    ? inputInflationFromMonetization
    : inputTransferInflation;

  // Broad non-shelter cost/price pressures — everything EXCEPT AI supply deflation, shelter, and the
  // monetary term (now separate). Applied uniformly across the 3 non-shelter sectors so their combined
  // weight (≈0.64) reproduces the prior goods bucket → zero-AI composite preserved exactly.
  const broadGoodsPressure = inputDemandEffects
    + inputMinWageCostPush
    + creditDeflationContribution
    + inputScarcityInflation
    + inputSupplyChainCostPush;  // Phase 9

  // Stage 1.5: per-consumption-sector AI-supply deflation. Each sector's deflation RATE (routed from
  // its clusters via the R10 mapping) × that sector's passthrough. Cognitive deflation concentrates in
  // AI-exposed (× 0.70); embodied/physical deflation (construction→shelter, ag/food→food&energy,
  // service robotics→labor-services) reaches prices only through the LOW embodied passthroughs
  // (regulation/supply-management gated). Direct computeMacro callers (no routing) fall back to the
  // scalar in AI-exposed only — so unit tests and zero-AI match Stage 1.
  const secDefl = inputs.sectorDeflationByConsumption
    ?? { aiExposed: aiDeflationRate, laborServices: 0, foodEnergy: 0, shelter: 0 };
  const laborServicesPassthrough = inputs.laborServicesPassthrough ?? DEFAULT_LABOR_SERVICES_PASSTHROUGH;
  const foodEnergyPassthrough = inputs.foodEnergyPassthrough ?? DEFAULT_FOOD_ENERGY_PASSTHROUGH;
  const shelterPassthrough = inputs.shelterPassthrough ?? DEFAULT_SHELTER_PASSTHROUGH;

  const aiExposedDeflation = secDefl.aiExposed * aiDeflationPassthrough;     // cognitive curve × 0.70
  const foodEnergyDeflation = secDefl.foodEnergy * foodEnergyPassthrough;    // embodied (ag/food) × 0.10
  // DEPRECATED (Stage 6.5): shelterEmbodiedDeflation (= secDefl.shelter × shelterPassthrough 0.05)
  // is retired — construction-cluster embodied deflation now enters the construction COST index at
  // full strength and reaches rents through the supply response (see computeHousingBlock).
  // const shelterEmbodiedDeflation = secDefl.shelter * shelterPassthrough;
  // Baumol: embodied automation of service labor erodes the labor-cost component from INSIDE the
  // laborCostShare term (offsets wage-driven service inflation, not a free-standing subtraction).
  // STAGE 3 SEAM: when wage growth is endogenous, the automation→labor-demand→wage loop is modeled fully.
  const laborServicesEmbodiedErosion = secDefl.laborServices * laborServicesPassthrough;

  // Baumol proxy: labor-intensive service prices track the nominal wage rate. Stage 1.5 uses the
  // year-over-year deviation of wagePressure (0 in steady state); Stage 3 replaces it with the
  // endogenous nominal wage-growth rate.
  // Stage 3: Baumol pressure = wage growth ABOVE trend (= 0 in zero-AI; negative when a slump pushes
  // wages below trend → service prices ease). Reads the CURRENT-year wage growth (R7).
  const wageRateDeviation = nominalWageGrowth - wageGrowth.trendWageGrowth;

  // ── Per-sector inflation ──
  // E-9 item 1 (F-D, ratified): the NON-SHELTER sectors anchor to the coherent complement of the
  // all-items series (≈2.22%), not to all-items itself (which already contains shelter's premium).
  // All-items consumers (the credit bar, the anchor inits, nominal-trend slots) keep baseInflationRate.
  const nonShelterBase = inputs.nonShelterBaseInflation ?? NON_SHELTER_BASE_INFLATION;
  const aiExposedInflation = nonShelterBase + broadGoodsPressure - aiExposedDeflation;
  const laborServicesInflation = nonShelterBase + broadGoodsPressure
    + laborCostShare * (wageRateDeviation - laborServicesEmbodiedErosion);
  const foodEnergyInflation = nonShelterBase + broadGoodsPressure - foodEnergyDeflation;

  // netInflation kept for back-compat (= AI-exposed/goods-bucket-equivalent) and demand-drag isolation.
  const netInflation = aiExposedInflation;

  // ═══ STAGE 6.5: STOCK-FLOW HOUSING (replaces the Phase-5i additive shelter stack) ═══
  const shelterWeight = inputs.shelterCPIWeight ?? BASELINE_SHELTER_CPI_WEIGHT;
  const inputForeclosureRate = inputs.foreclosureRateAggregate ?? 0;
  const instBuyerRate = inputs.institutionalBuyerRate ?? 0.40;
  const avgHomeownership = inputs.dynamicHomeownership
    ? inputs.dynamicHomeownership.reduce((a, b) => a + b, 0) / inputs.dynamicHomeownership.length
    : BASELINE_HOMEOWNERSHIP;
  // DEPRECATED (Stage 6.5, dispositions per checkpoint): the additive shelter stack —
  //   BASELINE_SHELTER_INFLATION constant → EMERGENT from the cost anchor (zero-AI ≈ 3.95%/yr);
  //   shelterPassthrough × 0.05 hook → CC absorbs full embodied deflation; friction → supplyElasticity;
  //   rentalDemandPressure (= rentersCreated × rentalDemandSensitivity, the +17.3pp artifact) →
  //     tenure conservation + occupancy (renters and converted rental units are the same units);
  //   foreclosure × 0.5 / mortgage −0.5×(rate−0.06) hand-set terms → fire-sale (cited 1.75) + capRate;
  //   shelterInflationFloor (−0.05 "land scarcity") → real land (λ_eff → 1 limit).
  // const rentalSens = inputs.rentalDemandSensitivity ?? 0.50;
  // const shelterFloor = inputs.shelterInflationFloor ?? -0.05;

  // Goods inflation = all existing 7-component netInflation (non-shelter)
  const goodsInflation = netInflation;

  // prev-year asset-income share (investor land bid, OD-9b) — year-0 sentinel = baseline share
  const baselineAssetShare = inputs.baselineAssetIncomeShare ?? 0;
  const prevAssetShare = previousMacro && previousMacro.totalIncome > 0
    ? previousMacro.aggregateAssetIncome / previousMacro.totalIncome
    : baselineAssetShare;

  const housing = computeHousingBlock({
    isFirstYear,
    prevHousingStock: previousMacro?.housingStock ?? BASELINE_HOUSING_STOCK_2025,
    prevHouseholds: previousMacro?.households ?? BASELINE_HOUSEHOLDS_2025,
    prevHeadship: previousMacro?.headshipRate ?? (BASELINE_HOUSEHOLDS_2025 / US_POPULATION_2025),
    prevRentIndex: previousMacro?.rentIndex ?? 1.0,
    prevConstructionCost: previousMacro?.constructionCostIndex ?? 1.0,
    prevLandCost: previousMacro?.landCostIndex ?? 1.0,
    prevHomePriceIndex: previousMacro?.homePriceIndex ?? 1.0,
    prevHousingStarts: previousMacro?.housingStarts
      ?? (DEFAULT_HOUSING_DEPRECIATION_RATE * BASELINE_HOUSING_STOCK_2025
        + (inputs.populationGrowthRate ?? DEFAULT_POPULATION_GROWTH_RATE) * BASELINE_HOUSING_STOCK_2025),
    realizedPopulationGrowth: previousMacro && previousMacro.dynamicPopulation > 0
      ? population / previousMacro.dynamicPopulation - 1
      : (inputs.populationGrowthRate ?? DEFAULT_POPULATION_GROWTH_RATE),
    // E-10: pipeline (init at the OBSERVED 2025 under-construction stock — the inheritance
    // principle) + the builder's smoothed price (init = the spot price → λ=0 is bit-equivalent)
    prevHousingPipeline: previousMacro?.housingPipeline ?? INITIAL_HOUSING_PIPELINE,
    prevBuilderPriceIndex: previousMacro?.builderPriceIndex ?? (previousMacro?.homePriceIndex ?? 1.0),
    builderAdjustmentLambda: inputs.builderAdjustmentLambda ?? DEFAULT_BUILDER_ADJUSTMENT_LAMBDA,
    housingPipelineDuration: inputs.housingPipelineDuration ?? HOUSING_PIPELINE_DURATION_YEARS,
    landClosureKappa: inputs.landClosureKappa ?? DEFAULT_LAND_CLOSURE_KAPPA,
    opexPassthrough: inputs.opexPassthrough ?? DEFAULT_OPEX_PASSTHROUGH,
    rentDownwardRigidity: inputs.rentDownwardRigidity ?? DEFAULT_RENT_DOWNWARD_RIGIDITY,
    rentIncomeElasticity: inputs.rentIncomeElasticity ?? DEFAULT_RENT_INCOME_ELASTICITY,
    diagSpotBuilderPrice: inputs.diagSpotBuilderPrice,
    builderPriceMode: inputs.builderPriceMode,
    prevBuilderTrendGrowth: previousMacro?.builderTrendGrowth ?? BUILDER_TREND_GROWTH_INIT_2025,
    prevHomePriceChangeRate: inputs.prevHomePriceChangeRate ?? 0,
    constructionCreditSensitivity: inputs.constructionCreditSensitivity ?? DEFAULT_CONSTRUCTION_CREDIT_SENSITIVITY,
    prevBusinessCreditTightening: previousMacro?.businessCreditTightening ?? 0,
    prevAfterTaxIncomeGrowth: previousMacro?.afterTaxIncomeGrowth
      ?? ((inputs.baselineGDPGrowth ?? BASELINE_GDP_GROWTH_RATE) + baseInflationRate),
    prevLandResidualTarget: previousMacro?.landResidualTarget ?? 1.0,
    mortgageRateReference: inputs.mortgageRateReference,
    population,
    nominalWageGrowth,
    baseInflationRate: nonShelterBase,  // E-9 item 1: construction materials = non-shelter goods
    broadGoodsPressure,
    secDeflShelter: secDefl.shelter,
    embodiedCapability: inputs.embodiedCapability ?? 0,
    prevRealIncomeGrowthRate: previousMacro?.realIncomeGrowthRate ?? 0,
    prevCompositeInflation: previousMacro?.compositeInflation ?? baseInflationRate,
    trendRealIncomeGrowth: baselineGDPGrowth,
    foreclosureRateAggregate: inputForeclosureRate,
    institutionalBuyerRate: instBuyerRate,
    mortgageRate: inputMortgageRate ?? BASELINE_MORTGAGE_RATE_2025,
    prevMortgageRate: inputs.prevMortgageRate ?? inputMortgageRate ?? BASELINE_MORTGAGE_RATE_2025,
    prevAssetIncomeShare: prevAssetShare,
    // E-2 (examination, ruled): the investor-bid baseline DRIFTS with the secular asset-share path
    // (Q-2(B) symmetry) — derived from ratified constants only (payout × (1−tax) × secular drift);
    // 0 = the frozen baseline that activated the bid in zero-AI (the Stage-7 Gate-A finding).
    baselineAssetIncomeShare: baselineAssetShare
      + (inputs.assetShareDriftRate ?? DEFAULT_ASSET_SHARE_DRIFT_RATE) * (year - DEFAULT_START_YEAR),
    formationSensitivity: inputs.formationSensitivity ?? DEFAULT_FORMATION_SENSITIVITY,
    headshipRecoveryRate: inputs.headshipRecoveryRate ?? DEFAULT_HEADSHIP_RECOVERY_RATE,
    supplyElasticity: inputs.housingSupplyElasticity ?? DEFAULT_HOUSING_SUPPLY_ELASTICITY,
    embodiedCapacityGain: inputs.embodiedCapacityGain ?? DEFAULT_EMBODIED_CAPACITY_GAIN,
    depreciationRate: inputs.housingDepreciationRate ?? DEFAULT_HOUSING_DEPRECIATION_RATE,
    landShare: inputs.landShare ?? DEFAULT_LAND_SHARE,
    constructionLaborShare: inputs.constructionLaborShare ?? DEFAULT_CONSTRUCTION_LABOR_SHARE,
    landIncomeBeta: inputs.landIncomeBeta ?? DEFAULT_LAND_INCOME_BETA,
    landScarcityElasticity: inputs.landScarcityElasticity ?? DEFAULT_LAND_SCARCITY_ELASTICITY,
    rentOccupancyElasticity: inputs.rentOccupancyElasticity ?? DEFAULT_RENT_OCCUPANCY_ELASTICITY,
    rentCostAnchorWeight: inputs.rentCostAnchorWeight ?? DEFAULT_RENT_COST_ANCHOR_WEIGHT,
    baselineCapRate: inputs.baselineCapRate ?? DEFAULT_BASELINE_CAP_RATE,
    capRateMortgageBeta: inputs.capRateMortgageBeta ?? DEFAULT_CAP_RATE_MORTGAGE_BETA,
    capRateInvestorCompression: inputs.capRateInvestorCompression ?? DEFAULT_CAP_RATE_INVESTOR_COMPRESSION,
    fireSaleElasticity: inputs.fireSaleElasticity ?? DEFAULT_FIRE_SALE_ELASTICITY,
    investorDemandIntensity: inputs.investorDemandIntensity ?? DEFAULT_INVESTOR_DEMAND_INTENSITY,
    landRateSensitivity: inputs.landRateSensitivity ?? DEFAULT_LAND_RATE_SENSITIVITY,
  });

  // Shelter CPI = structural rent growth (OD-9a: rent index, not home prices, feeds the CPI)
  const shelterInflation = housing.rentGrowth;
  // Legacy MacroOutput diagnostics re-pointed to their structural equivalents (fields retained):
  //   shelterDeflationFromAI = the AI-supply flow actually transmitted into rents (cost-anchor ×
  //   construction value-share × embodied construction deflation) — also the nonAI add-back term.
  const rentAnchorW = inputs.rentCostAnchorWeight ?? DEFAULT_RENT_COST_ANCHOR_WEIGHT;
  const shelterDeflationFromAI = -(rentAnchorW * (1 - housing.lambdaEffPrev) * secDefl.shelter);
  const foreclosureSupplyEffect = housing.fireSalePressure;          // now a PRICE-side pressure
  const institutionalAbsorption = inputForeclosureRate * instBuyerRate;  // share absorbed to rentals
  const rentalDemandPressure = (inputs.rentOccupancyElasticity ?? DEFAULT_RENT_OCCUPANCY_ELASTICITY)
    * housing.occupancyGap;                                          // the occupancy term of ΔR

  // Composite = weighted across the 4 consumption sectors (weights normalized to sum to 1, so
  // changing one re-scales the rest). In zero-AI (all sector AI deflations=0, broadGoodsPressure≈0,
  // wageRateDeviation=0) all three non-shelter sectors equal base inflation, exactly reproducing
  // the prior shelterWeight×shelter + (1−shelterWeight)×base composite.
  const aiExposedWeight = inputs.aiExposedCPIWeight ?? AI_EXPOSED_CPI_WEIGHT;
  const laborServicesWeight = inputs.laborServicesCPIWeight ?? LABOR_SERVICES_CPI_WEIGHT;
  const foodEnergyWeight = inputs.foodEnergyCPIWeight ?? FOOD_ENERGY_CPI_WEIGHT;
  const sectorWeightSum = shelterWeight + aiExposedWeight + laborServicesWeight + foodEnergyWeight;
  const wSh = shelterWeight / sectorWeightSum;
  const wAi = aiExposedWeight / sectorWeightSum;
  const wLs = laborServicesWeight / sectorWeightSum;
  const wFe = foodEnergyWeight / sectorWeightSum;
  const compositeInflation = wSh * shelterInflation
    + wAi * aiExposedInflation
    + wLs * laborServicesInflation
    + wFe * foodEnergyInflation
    + monetaryInflation;  // Stage 4: signed monetary inflation, uniform across the basket (OD-3)

  // E-9 item 2 (ratified): the Fed's mandate variable — the SAME four sector inflations reweighted
  // to PCE shares (NIPA-cited), minus the formula/scope component [α]. The CPI composite remains the
  // price system everywhere else (the owner basis ruling: quintile CWI is CPI-concept; COLA is
  // statute CPI-W; the E-7 anchor's evidence is TIPS-linked); ONLY the Fed boundary reads this.
  const pceProxyInflation =
    PCE_WEIGHT_SHELTER * shelterInflation
    + PCE_WEIGHT_AI_EXPOSED * aiExposedInflation
    + PCE_WEIGHT_LABOR_SERVICES * laborServicesInflation
    + PCE_WEIGHT_FOOD_ENERGY * foodEnergyInflation
    + monetaryInflation
    - (inputs.pceFormulaEffect ?? PCE_FORMULA_EFFECT);

  // Stage 2 firewall input: composite EXCLUDING AI supply deflation (the "non-AI" deflator). Loops
  // that must not read AI cost-deflation as growth/abundance will deflate by this in Stage 2.
  // Stage 1.5: add back EVERY sector's AI-supply deflation (cognitive + embodied) — this is the
  // deflator Stage 2's firewall consumes (composite as if AI made nothing cheaper).
  const nonAICompositeInflation = compositeInflation
    + wAi * aiExposedDeflation
    + wLs * laborCostShare * laborServicesEmbodiedErosion
    + wFe * foodEnergyDeflation
    // Stage 6.5: the shelter add-back is the AI-supply flow actually transmitted into rents —
    // rentCostAnchorWeight × (1−λ_eff(t−1)) × secDefl.shelter (= −shelterDeflationFromAI). Exact by
    // linearity of ΔR in Δreplacement; verified numerically per R25.
    + wSh * (-shelterDeflationFromAI);

  // === Price level accumulation using COMPOSITE inflation ===
  // Previously used computePriceLevel() which only had 2 components (base - aiDeflation).
  // Now uses compositeInflation which correctly weights shelter (36%) + goods (64%)
  // including all 7 goods components (base, AI, credit, scarcity, min wage, transfer, demand).
  // This fixes a 65% real GDP distortion by 2050 caused by ignoring shelter inflation.
  // Floating-point safety: cap at MAX_PRICE_LEVEL to prevent Infinity/NaN propagation.
  // This allows modeling up to ~10^15× price increase (Zimbabwe-scale) without overflow.
  const priceLevel = isFirstYear
    ? BASELINE_PRICE_LEVEL  // = 1.0
    : Math.min(MAX_PRICE_LEVEL, Math.max(0.01, prevPriceLevel * (1 + compositeInflation)));
  // Stage 1: cumulative non-AI price index (excludes AI supply deflation) — Stage 2 deflates real
  // quantities by this so AI cost-deflation no longer reads as real growth/abundance.
  const prevNonAIPriceLevel = previousMacro?.nonAIPriceLevel ?? BASELINE_PRICE_LEVEL;
  const nonAIPriceLevel = isFirstYear
    ? BASELINE_PRICE_LEVEL
    : Math.min(MAX_PRICE_LEVEL, Math.max(0.01, prevNonAIPriceLevel * (1 + nonAICompositeInflation)));
  // Stage 5b (F2): cumulative LABOR-SERVICES price index — the deflator for in-kind (healthcare)
  // support, which is consumption of labor-intensive services. Healthcare lives in this sector, so
  // in-kind support automatically costs more when services inflate and less when the Baumol channel
  // deflates them — the correct fiscal exposure. Includes monetaryInflation: OD-3 distributes the
  // monetary term UNIFORMLY across the basket (added once at the composite for arithmetic
  // equivalence), so any individual sector PRICE LEVEL must add it back.
  const prevLaborServicesPriceLevel = previousMacro?.laborServicesPriceLevel ?? BASELINE_PRICE_LEVEL;
  const laborServicesPriceLevel = isFirstYear
    ? BASELINE_PRICE_LEVEL
    : Math.min(MAX_PRICE_LEVEL, Math.max(0.01, prevLaborServicesPriceLevel * (1 + laborServicesInflation + monetaryInflation)));

  // Phase 5h: S-curve logistic deferral (replaces linear sensitivity)
  // Supply-driven deflation (AI making goods cheaper) historically INCREASES
  // consumption — consumers buy more when things are affordable (electronics,
  // computing, streaming all show this pattern). Only demand-driven deflation
  // (credit contraction, demand collapse) causes purchase deferral.
  // aiDeflationRate is the supply-driven component. Adding it back to
  // netInflation isolates the demand-driven remainder.
  // Demand-driven deflation only (AI supply deflation removed). aiExposedDeflation is the amount
  // actually subtracted from the AI-exposed sector (= netInflation), so adding it back isolates
  // the demand-driven remainder for the consumption deflation drag.
  const demandSideInflation = netInflation + aiExposedDeflation + monetaryInflation;
  const deflationDrag = computeDeflationDrag(
    demandSideInflation,
    secondOrderParams.deferrableConsumptionShare,
    secondOrderParams.deflationMidpoint,
    secondOrderParams.deflationSteepness,
  );

  // === Phase 3c: Income derived from actual economy ===
  // Wages and assets derive from actual previous-year nominal GDP × structural share.
  // Transfers grow with inflation only (COLA behavior — max(0, CPI change)).
  //
  // effectiveInflation = max(0, compositeInflation):
  //   - When inflation is positive: transfer COLA applies (normal)
  //   - When deflation: COLA = 0%, transfers freeze (Social Security COLA identical logic)
  //
  // Phase 3c: Inflation-only cumulative factor for transfer COLA.
  // Transfers grow with inflation (Social Security COLA = max(0, CPI change)), NOT with GDP.
  // Wages and assets now derive from actual prevNomGDP × share — no cumulative factor needed.
  // BUG FIX: Was using netInflation (goods-only ~40%) but priceLevel uses compositeInflation
  // (goods+shelter blend ~27%). Mismatch caused transfers to grow faster than prices in real
  // terms, creating an explosive COLA→inflation feedback loop. Social Security COLA is based
  // on CPI-W which includes shelter, so compositeInflation is the correct rate.
  const effectiveInflation = Math.max(0, compositeInflation);
  const prevInflationFactor = previousMacro?.cumulativeInflationFactor ?? 1.0;
  const cumulativeInflationFactor = isFirstYear
    ? 1.0
    : Math.min(MAX_PRICE_LEVEL, prevInflationFactor * (1 + effectiveInflation));

  // wagePressure is computed earlier (moved before the sectoral price block so the labor-services
  // Baumol term can read it — Stage 1).

  // Phase 3c: Wages derive from actual GDP × labor's share.
  // Labor's share (57-62%) is one of the most stable relationships in macroeconomics.
  // AI disruption changes the effective share through employment loss and wage pressure,
  // NOT through the structural parameter itself.
  //
  // Structural productivity growth: real GDP trend growth minus labor force growth.
  // Labor force growth is already captured by employmentRatio (via growingBaselineEmployment),
  // but per-worker productivity growth (from capital deepening, technology, human capital)
  // was missing, causing the demand system to produce only ~0.9% real GDP growth instead of
  // the 2% assumed by fullEmploymentGDP. Without this factor, a persistent output gap
  // triggers a displacement-demand feedback cycle even with zero AI displacement.
  // Source: baselineGDPGrowth (config, ~0.02) minus DEFAULT_POPULATION_GROWTH_RATE (0.004)
  // Stage 0 (item 3) FIX: use FULL potential output growth (baselineGDPGrowth ~2.0%), not
  // "minus population growth" (~1.6%). The prior subtraction assumed employmentRatio would re-add
  // labor-force growth, but growingBaselineEmployment scales numerator AND denominator by lfGrowth,
  // so it cancels — leaving aggregate real income/GDP growing at ~1.6% instead of the ~2.0% potential
  // (fullEmploymentGDP). Restores zero-AI real growth to the 2% target (was ~1.45%).
  const structuralProductivityGrowth = Math.max(0, baselineGDPGrowth);
  // RETIRED (Stage 7): cumulativeProductivityFactor now has ZERO consumers — its lineage:
  //   wages (Stage 3 → wageIndex), baseline transfers (Stage 5b → COLA index × population),
  //   non-corporate asset income (Stage 7 D-2/Q-4 → wageIndex × employmentFactor).
  // The Stage-3 guard comment ("do not clean up the 2.0% factor") retires with it.
  // const cumulativeProductivityFactor = Math.pow(1 + structuralProductivityGrowth, yearsSinceStart);
  void structuralProductivityGrowth;
  // Wage base: static 2025 baseline × cumulative inflation × cumulative productivity.
  // Previous approach (prevNominalGDP × share × (1+structProd)) was circular: wages derived
  // from GDP, GDP derived from consumption, consumption from wages. The (1+structProd) factor
  // was a constant level shift that didn't compound — real wage growth tracked GDP (~1.0%),
  // not productivity (~1.6%). Static baseline with cumulative compounding makes wages exogenous:
  // wage growth = inflation + productivity ≈ 2.3% + 1.6% = 3.9% nominal per year.
  // Displacement multipliers (employmentRatio, wageRatio, wagePressure) still modulate on top.
  const baselineAggregateWages = BASELINE_GDP_NOMINAL_2025 * BASELINE_WAGE_SHARE;
  // Stage 3: wage LEVEL = baseline aggregate wages × endogenous wageIndex (compounded nominalWageGrowth),
  // replacing the exogenous wageBase = baseline × CIF × productivity (× wagePressure). NOTE: the
  // cumulativeProductivityFactor (2.0%) above is RETAINED for non-corporate asset income + baseline
  // transfers only — those are NOT employment-scaled, so they grow at the 2.0% economy trend; transfer
  // wage-indexing is deferred to Stage 5. Do not "clean up" the 2.0% factor there into a regression.
  // R1: employmentFactor is UN-NORMALIZED (÷ BASELINE_TOTAL_EMPLOYMENT, not × lfGrowth) so population/labor-
  // force growth enters aggregate wage income via EMPLOYMENT, while per-worker productivity (1.6%) lives in
  // the wage index. At zero displacement employmentFactor = lfGrowth (grows ~0.4%/yr).
  const employmentFactor = totalRemainingEmployment / BASELINE_TOTAL_EMPLOYMENT;
  // FIX C: BLS-derived cross-cluster wage composition (1.0 at t=0); orthogonal to the trend wage index.
  const wageRatio = weightedAverageWage / baselineAverageWage;
  const existingWageIncome = baselineAggregateWages * wageIndex * employmentFactor * wageRatio
    + policyEffects.wageChannelAddition;

  // New job wage income: pays the current per-worker nominal wage (baseline per-worker × wageIndex).
  const newJobWageFrac = productionInputs?.newJobWageFraction ?? DEFAULT_NEW_JOB_WAGE_FRACTION;
  const currentAvgWage = baselineAggregateWages * wageIndex / BASELINE_TOTAL_EMPLOYMENT;
  const newJobWageIncome = totalHumanNewJobs * currentAvgWage * newJobWageFrac;

  // Augmentation: workers capture their share of productivity gains from AI tools.
  // Flows through existing pipeline: → afterTaxWageIncome → wageConsumption (× MPC 0.95) → GDP.
  const augWageBoost = productionInputs?.augmentationWageBoost ?? 0;
  const aggregateWageIncome = existingWageIncome + newJobWageIncome + augWageBoost;

  // ═══ CORPORATE TAX (on previous year profits) — Phase 5-tax ═══
  // Must come BEFORE asset income: dividends depend on after-tax corporate profits.
  // At t=0, bootstrap from BEA baseline corporate profits.
  const baselineCorporateProfits = BASELINE_PROFIT_GDP_RATIO * BASELINE_GDP_NOMINAL_2025;
  // Stage 7: prevCorpProfits is now the t−1 RESIDUAL (the documented simultaneity breaker —
  // dividends follow earnings). Post-7 the year-0 endogenous residual EQUALS this BEA seed by the
  // Q-1(ii) calibration, so the seed and the model agree by construction (bootstrap dissolved).
  // Negative-profit treatments below are DEFINITIONS, not economic floors: tax law has no negative
  // corporate tax (loss carryforwards unmodeled) and dividends are non-negative distributions —
  // the negativity flows through retainedEarnings (cash burn → investment capacity ↓) instead.
  const prevCorpProfits = previousMacro?.corporateProfits ?? baselineCorporateProfits;
  const corporateTaxRevenue = Math.max(0, prevCorpProfits) * corporateTaxRate;
  const afterTaxCorporateProfits = prevCorpProfits - corporateTaxRevenue;
  const dividendIncomePre = Math.max(0, afterTaxCorporateProfits) * (1 - corporateRetentionRate);
  let retainedEarnings = afterTaxCorporateProfits - dividendIncomePre;

  // ═══ ASSET INCOME — Exact Decomposition (dynamic P/E + endogenous capital gains) ═══
  //
  // aggregateAssetIncome = dividends + aiCapitalGains + tradCapitalGains + nonCorporateIncome
  //
  // All inputs use PREVIOUS year values to avoid circularity.
  // Corporate profits are computed later in this function for THIS year,
  // but feed into NEXT year's asset income through previousMacro.

  // ── Component 1: Dividends ──
  // Stage 7: dividends = payout × max(0, after-tax residual profits(t−1)) — non-negative by
  // definition (firms cut to zero and burn cash; the cash burn lives in retainedEarnings above).
  const dividendIncome = dividendIncomePre;

  // ── Component 2: AI Capital Gains (dynamic P/E) ──
  // P/E = BASE_PE_ZERO_GROWTH + sensitivity × earnings growth rate (no max(0) clamp — let MIN_PE floor).
  const prevAIProfits = previousMacro?.aiCorporateProfits ?? 0;
  const twoYearsAgoAIProfits = previousMacro?.prevAICorporateProfits ?? 0;
  const aiProfitGrowthRate = prevAIProfits > 0
    ? (prevAIProfits - twoYearsAgoAIProfits) / prevAIProfits
    : 0;
  const aiSectorPE = Math.max(MIN_PE,
    BASE_PE_ZERO_GROWTH + aiPESensitivity * aiProfitGrowthRate);
  const aiProfitGrowthDollar = prevAIProfits - twoYearsAgoAIProfits;
  const aiMarketCapChange = aiProfitGrowthDollar * aiSectorPE;

  // ── Component 3: Traditional Capital Gains ──
  const prevTradProfits = previousMacro?.traditionalCorporateProfits ?? 0;
  const twoYearsAgoTradProfits = previousMacro?.prevTraditionalCorporateProfits ?? 0;
  const tradProfitGrowthRate = prevTradProfits > 0
    ? (prevTradProfits - twoYearsAgoTradProfits) / prevTradProfits
    : 0;
  const traditionalSectorPE = Math.max(MIN_PE,
    BASE_PE_ZERO_GROWTH + tradPESensitivity * tradProfitGrowthRate);
  const tradProfitGrowthDollar = prevTradProfits - twoYearsAgoTradProfits;
  const tradMarketCapChange = tradProfitGrowthDollar * traditionalSectorPE;

  // ── Endogenous Realization Rate ──
  // Responds to blended market performance. IRS historical range: 4% (2008-09) to 12% (2021 boom).
  const aiMarketWeight = previousMacro?.aiGDPContributionPct ?? 0;
  // Phase 7: Use equity module's marketReturn when available (replaces profit-growth proxy)
  const blendedMarketPerformance = inputMarketReturn !== undefined
    ? Math.max(-0.5, Math.min(0.5, inputMarketReturn))
    : Math.max(-0.5, Math.min(0.5,
        aiMarketWeight * aiProfitGrowthRate + (1 - aiMarketWeight) * tradProfitGrowthRate));
  const capitalGainsRealizationRate = Math.max(MIN_REALIZATION_RATE,
    Math.min(MAX_REALIZATION_RATE,
      BASE_REALIZATION_RATE * (1 + REALIZATION_SENSITIVITY * blendedMarketPerformance)));

  // ── Apply realization rate ──
  const aiCapitalGains = Math.max(0, aiMarketCapChange * capitalGainsRealizationRate);
  const traditionalCapitalGains = Math.max(0, tradMarketCapChange * capitalGainsRealizationRate);

  // ── Component 4: Non-Corporate Asset Income ──
  // Stage 7 (D-2, Q-4 ruling A): proprietors'/rental/interest income tracks WAGES, not productivity —
  // proprietors' income is predominantly small-business labor income (standard labor-share treatments
  // assign ~2/3+ to labor), and proprietors share labor's fate in a collapse. Indexed exactly like the
  // wage bill: baseline × wageIndex × employmentFactor. This retires the LAST consumer of
  // cumulativeProductivityFactor (and the hot CIF — the Pass-2 over-indexation finding applies here too).
  // Option B (consumption-index) documented in the checkpoint as the alternative.
  const baselineNonCorporateIncome = BASELINE_GDP_NOMINAL_2025 * NON_CORPORATE_ASSET_SHARE;
  // DEPRECATED (Stage 7): … × cumulativeInflationFactor × cumulativeProductivityFactor;
  const nonCorporateAssetIncome = baselineNonCorporateIncome * wageIndex
    * (totalRemainingEmployment / BASELINE_TOTAL_EMPLOYMENT);

  // ── Total Asset Income ──
  const aggregateAssetIncome = dividendIncome + aiCapitalGains + traditionalCapitalGains
    + nonCorporateAssetIncome + policyEffects.assetChannelAddition;

  // Stage 5b (Pass 2, ratified — R2 treatment for baseline transfers): wage-indexed via the
  // COLA-floored obligation index (SS new awards track the AWI; existing benefits are never cut
  // nominally) × beneficiary (population) growth — replacing effectiveCIF × productivity factor.
  // Zero-AI equivalence: COLA index ~4.5%/yr × population 0.4% ≈ 4.9% nominal ≡ CIF 2.9% ×
  // productivity 2.0% (to within the R7 lag) — demonstrated empirically in Gate A. In displacement,
  // transfers hold FLAT nominally when wages fall (COLA floor) instead of shrinking with a deflating
  // CIF, and stop compounding 2% real through a depression.
  // Phase 8a COLA-dampening lever: now operates on the COLA index (same dampening shape — only the
  // growth portion above 1.0 is dampened; base preserved), so austerity presets keep working.
  let effectiveObligationCOLA = obligationGCOLAIndex;
  if (fiscalProfile && obligationGCOLAIndex > fiscalProfile.colaDampeningThreshold) {
    const dampenRange = fiscalProfile.colaDampeningMaxCIF - fiscalProfile.colaDampeningThreshold;
    const dampenIntensity = dampenRange > 0
      ? Math.min(1, (obligationGCOLAIndex - fiscalProfile.colaDampeningThreshold) / dampenRange)
      : 1.0;
    const dampenFactor = 1.0 - dampenIntensity * fiscalProfile.colaDampeningRate;
    const growth = obligationGCOLAIndex - 1.0;
    effectiveObligationCOLA = 1.0 + growth * dampenFactor;
  }
  const transferPopulationFactor = population / US_POPULATION_2025;
  // DEPRECATED (Stage 5b / Pass 2): the Phase 3c/8a CIF × productivity path —
  //   let effectiveCIF = cumulativeInflationFactor; … dampening on CIF …
  //   const baselineTransfers = BASELINE_TRANSFER_INCOME * effectiveCIF * cumulativeProductivityFactor;
  const baselineTransfers = BASELINE_TRANSFER_INCOME * effectiveObligationCOLA * transferPopulationFactor;
  const incrementalUnemployment = Math.max(0, totalUnemployment - BASELINE_UNEMPLOYMENT);
  // ═══ STAGE 5 (H3): unified incremental-UE transfer support — SINGLE SOURCE OF TRUTH ═══
  // CASH (UI + SNAP) → household transfer income (taxed, MPC → consumption).
  // IN-KIND (Medicaid etc.) → consumption DIRECTLY below (NIPA: government health benefits are PCE);
  // it is NOT household cash income, is not taxed, and does not pass the transfer MPC.
  // The SUM is booked as a budget outlay in the fiscal block (t+1 per its uniform t−1 convention).
  // Replaces the split-brain: income at $19,200/person (full-take-up) + reporting deficit at $65B/pp
  // + NOTHING in the load-bearing budget.
  const cashPerUnemployed = inputs.cashTransferPerUnemployed ?? DEFAULT_CASH_TRANSFER_PER_UNEMPLOYED;
  const inKindPerUnemployed = inputs.inKindTransferPerUnemployed ?? DEFAULT_IN_KIND_TRANSFER_PER_UNEMPLOYED;
  // Stage 5b (F2): component-appropriate indexation (the $8k/$5k are 2025 dollars, no longer flat-nominal):
  //   CASH × the dampened COLA index — UI/SNAP benefit COLAs, never cut nominally, subject to the
  //     same Phase-8a austerity dampening lever as baseline transfers.
  //   IN-KIND × the cumulative labor-services price index — Medicaid support IS healthcare-services
  //     consumption; it inflates with that sector and deflates with the Baumol channel.
  const incrementalCashTransfers = incrementalUnemployment * cashPerUnemployed * effectiveObligationCOLA;
  const inKindConsumption = incrementalUnemployment * inKindPerUnemployed * laborServicesPriceLevel;
  const incrementalTransferSpending = incrementalCashTransfers + inKindConsumption;
  const aggregateTransferIncome = baselineTransfers
    + incrementalCashTransfers
    + policyEffects.transferChannelAddition;

  // ═══ INDIVIDUAL TAXES — Phase 5-tax (with decomposed asset tax) ═══
  const wageIncomeTax = aggregateWageIncome * incomeTaxRate;
  const employeePayrollTax = aggregateWageIncome * payrollTaxRate * EMPLOYER_EMPLOYEE_SPLIT;
  // Dividends + cap gains taxed at capital gains rate
  const capitalGainsTax = (dividendIncome + aiCapitalGains + traditionalCapitalGains) * capitalGainsTaxRate;
  // Non-corporate asset income (interest, rental, proprietor's) taxed as ordinary income
  const nonCorporateAssetTax = nonCorporateAssetIncome * incomeTaxRate;
  const transferTax = aggregateTransferIncome * transferTaxRate;

  // ═══ AFTER-TAX INCOME ═══
  const afterTaxWageIncome = aggregateWageIncome - wageIncomeTax - employeePayrollTax;
  const afterTaxAssetIncome = aggregateAssetIncome - capitalGainsTax - nonCorporateAssetTax;
  const afterTaxTransferIncome = aggregateTransferIncome - transferTax;
  // L9b: the after-tax aggregate's growth — the income basis for the rent WTP term (per household
  // after the housing block subtracts household growth). t−1 convention next year.
  const afterTaxIncomeTotalL9b = afterTaxWageIncome + afterTaxAssetIncome + afterTaxTransferIncome;
  const prevAfterTaxTotalL9b = previousMacro
    ? (previousMacro.afterTaxWageIncome + previousMacro.afterTaxAssetIncome + previousMacro.afterTaxTransferIncome)
    : afterTaxIncomeTotalL9b;
  const afterTaxIncomeGrowth = prevAfterTaxTotalL9b > 0
    ? afterTaxIncomeTotalL9b / prevAfterTaxTotalL9b - 1
    : 0;
  const totalPostTaxIncome = afterTaxWageIncome + afterTaxAssetIncome + afterTaxTransferIncome;

  // FIX 3 (Phase 5-tax): totalIncome and incomeComposition use POST-TAX values
  const totalIncome = totalPostTaxIncome;

  // Income composition (post-tax)
  const incomeComposition = computeIncomeComposition(
    afterTaxWageIncome,
    afterTaxAssetIncome,
    afterTaxTransferIncome,
  );

  // DEPRECATED (Phase 5g): ARPP and tipping point replaced by CWI + cycle phase
  // const arpp = computeARPP(totalIncome, population, priceLevel);
  // const arppPerCapita = arpp;
  // const arppChangeRate = prevARPP > 0 ? (arpp - prevARPP) / prevARPP : 0;
  // const comparisonARPP = isFirstYear ? arpp : prevARPP;
  // const tippingResult = detectTippingPoint(arpp, comparisonARPP, prevIsPastTipping, prevArppDeclineYears);
  // const isPastTippingPoint = tippingResult.isPastTippingPoint;
  // const arppDeclineYears = tippingResult.arppDeclineYears;
  // const tippingPointProximity = comparisonARPP > 0
  //   ? (arpp - comparisonARPP) / comparisonARPP
  //   : 0;

  // Revenue pressure: GDP contraction triggers cost-cutting automation (Phase 1 overhaul)
  // Phase 8a: Use REAL GDP growth rate (deflated) so inflation doesn't mask real contraction
  const { revenuePressure, automationAcceleration } = computeRevenuePressure(
    // Stage 2 firewall: read NON-AI real growth (nominal deflated by non-AI prices), not realGDPGrowthRate
    // (which AI cost-deflation inflates). Firms respond to contraction in nominal-relative-to-non-AI-cost
    // terms; AI making goods cheaper must NOT register as growth. = realGDPGrowthRate exactly in zero-AI.
    previousMacro?.nonAIRealGDPGrowthRate ?? (previousMacro?.gdpGrowthRate ?? baselineGDPGrowth),
    previousMacro?.automationAcceleration ?? 0,
    secondOrderParams.revenuePressureSensitivity,
    secondOrderParams.revenuePressureCap,
    secondOrderParams.revenuePressureDecay,
  );

  // === GDP — force baseline at t=0, real vs nominal ===
  // Phase 3: Differentiated MPC consumption replaces single-MPC ARPP-based consumption.
  // SWF/equity/profit-sharing distributions reclassified as transfer income for MPC purposes:
  // citizens receiving SWF dividends spend them like transfer recipients (MPC 0.90),
  // not like capital income recipients (MPC 0.35).
  // SWF/equity/profit-sharing distributions reclassified as transfer income for MPC
  // (citizens receiving SWF dividends spend them like transfer recipients)
  const policyAssetToTransfer = policyEffects.assetChannelAddition;
  const afterTaxAssetForMPC = afterTaxAssetIncome - policyAssetToTransfer;
  const afterTaxTransferForMPC = afterTaxTransferIncome + policyAssetToTransfer;

  // Phase 5i: Precautionary saving — employed workers save more when UE rises
  const mpcWageUESens = inputs.mpcWageUESensitivity ?? DEFAULT_MPC_WAGE_UE_SENSITIVITY;
  const excessUE_pp = Math.max(0, (unemploymentRate - NATURAL_UNEMPLOYMENT_RATE)) * 100;
  const precautionaryMpcReduction = mpcWageUESens * excessUE_pp;
  const effectiveMpcWage = Math.max(0.01, postTaxMpcWage - precautionaryMpcReduction);

  // ═══ CONSUMPTION (post-tax) — Phase 5-tax ═══
  const wageConsumption = afterTaxWageIncome * effectiveMpcWage;
  const assetConsumption = afterTaxAssetForMPC * postTaxMpcAsset;
  const transferConsumption = afterTaxTransferForMPC * postTaxMpcTransfer;

  let gdpNominal: number;
  let gdpReal: number;
  let consumption: number;
  let investment: number;
  let governmentSpending: number;
  // FS-4b (the inheritance principle): the year-0 homePriceChangeRate init was a hardcoded 0.01;
  // the year-1 builder trendG EMA ingests it once (1/10 weight). Now the OBSERVED 2025 value
  // (FRED CSUSHPINSA annual growth ≈ +2.2%) — the same series the R2 init derives from.
  let housingWealthResult: { housingWealthDrag: number; homePriceChangeRate: number } = {
    housingWealthDrag: 0, homePriceChangeRate: OBSERVED_2025_HOME_PRICE_GROWTH,
  };
  let housingWealthDrag = 0;
  // Phase 8 Fix 5: New housing model outputs — computed in else branch
  let computedHomePriceIndex = inputs.homePriceIndex ?? 1.0;
  let computedAffordabilityDeviation = 0;
  let computedRealIncomeGrowthRate = 0;
  let computedMortgageRateChange = 0;
  let investmentRealization = 1.0; // Investment Demand Constraint — set in else branch
  // Phase 5-tax: Investment capacity variables — declared here so accessible in return object
  let creditCapacity = BASELINE_CREDIT_FUNDED;
  let investmentCapacity = BASELINE_RETAINED_EARNINGS + BASELINE_CREDIT_FUNDED;
  let capacityGate = 1.0;
  let profitFundedRatio = 0;
  let creditFundedRatio = 0;
  let corporateCashAccumulation = 0;

  if (isFirstYear) {
    // At t=0, GDP must equal baseline exactly (no formula drift).
    // In model's price index (P=1.0 at 2025), real = nominal at t=0.
    gdpNominal = BASELINE_GDP_NOMINAL_2025;
    gdpReal = BASELINE_GDP_NOMINAL_2025;
    // Phase 3: Differentiated MPC consumption (for display — GDP is forced to baseline)
    // Stage 5: + in-kind support (≈0 at baseline since incremental unemployment ≈ 0 in year 0)
    consumption = wageConsumption + assetConsumption + transferConsumption + inKindConsumption;
    // BEA's TRADITIONAL_INVESTMENT_GDP_FRACTION (0.175) already includes 2025 AI capex.
    // No separate BASELINE_AI_INVESTMENT_GDP_FRACTION needed — that would double-count.
    investment = BASELINE_GDP_NOMINAL_2025 * TRADITIONAL_INVESTMENT_GDP_FRACTION;
    governmentSpending = BASELINE_GDP_NOMINAL_2025 * GOVERNMENT_SPENDING_GDP_FRACTION;

    // Phase 5-tax: Use baseline retained earnings at t=0 (FIX 5)
    retainedEarnings = BASELINE_RETAINED_EARNINGS;
    creditCapacity = BASELINE_CREDIT_FUNDED;
    investmentCapacity = BASELINE_RETAINED_EARNINGS + BASELINE_CREDIT_FUNDED;
    capacityGate = 1.0;
    profitFundedRatio = investment > 0 ? BASELINE_RETAINED_EARNINGS / investment : 0;
    creditFundedRatio = 1 - profitFundedRatio;
    corporateCashAccumulation = 0;
  } else {
    // Phase 3: Differentiated MPC consumption
    // Each income source has its own spending propensity:
    //   transfer (0.90) > wage (0.80) > asset (0.35)
    // When income shifts from wages to assets, consumption drops.
    const baseConsumption = wageConsumption + assetConsumption + transferConsumption;

    // STAGE 6.5: structural home prices replace the 5-channel computeHomePriceChange model.
    // DEPRECATED (Stage 6.5): the 5-channel call and its parameters (affordabilityPriceSensitivity,
    // incomeHousingElasticity, affordabilityReversionSensitivity, demographicHousingElasticity,
    // downwardStickinessRatio) — rates now act via capRate, income via formation+land, demography
    // via households, supply via starts/fire-sales, reversion via the supply equilibrium.
    const housingWealthMPCParam = inputs.housingWealthMPC ?? DEFAULT_HOUSING_WEALTH_MPC;

    // Mortgage rate change (YoY) — kept as a reported diagnostic
    const prevMortgageRate = inputs.prevMortgageRate ?? inputMortgageRate;
    computedMortgageRateChange = (inputMortgageRate ?? 0) - (prevMortgageRate ?? 0);

    // Real income growth (YoY) — feeds NEXT year's household formation (housing block, t−1 input)
    const currentRealHouseholdIncome = (afterTaxWageIncome + afterTaxTransferIncome + afterTaxAssetIncome) / priceLevel;
    const prevRealHouseholdIncome = previousMacro
      ? (previousMacro.afterTaxWageIncome + previousMacro.afterTaxTransferIncome + previousMacro.afterTaxAssetIncome) / previousMacro.priceLevel
      : currentRealHouseholdIncome;
    computedRealIncomeGrowthRate = prevRealHouseholdIncome > 0
      ? (currentRealHouseholdIncome - prevRealHouseholdIncome) / prevRealHouseholdIncome
      : 0;

    // Affordability deviation: retained as a DIAGNOSTIC only (no longer drives prices)
    const baselineRealIncome = inputs.baselineRealHouseholdIncome ?? currentRealHouseholdIncome;
    const normalizedIncome = baselineRealIncome > 0
      ? currentRealHouseholdIncome / baselineRealIncome
      : 1.0;
    computedHomePriceIndex = housing.homePriceIndex;
    computedAffordabilityDeviation = normalizedIncome > 0
      ? 1.0 - (computedHomePriceIndex / normalizedIncome)
      : 0;

    const homePriceChangeRate = housing.homePriceGrowth;

    // Housing wealth (inventory flag iii FIXED): the wealth base scales with the price index —
    // ΔW = BASELINE_HOUSING_WEALTH × (P(t) − P(t−1)), not BASELINE × rate against a frozen base.
    const prevP = previousMacro?.homePriceIndex ?? 1.0;
    const wealthChange = BASELINE_HOUSING_WEALTH * (housing.homePriceIndex - prevP);
    housingWealthDrag = wealthChange * housingWealthMPCParam * avgHomeownership;

    // Wrap in legacy result shape for downstream compatibility
    housingWealthResult = { housingWealthDrag, homePriceChangeRate };

    // Apply second-order adjustments:
    // Three independent consumption mechanisms — each addresses a different channel:
    //   1. consumerCredit.consumerCreditMultiplier: multiplicative [0.01, 1.0] — credit tightening
    //   2. deflationDrag.velocityMultiplier: multiplicative [0.70, 1.0] — deflation expectations
    //   3. housingWealthDrag: additive nominal $ — falling home values reduce spending
    const adjustedConsumption = baseConsumption
      * consumerCredit.consumerCreditMultiplier
      * deflationDrag.velocityMultiplier
      + housingWealthDrag;

    // DEPRECATED: Bell curve investment — replaced by Investment Demand Constraint
    // const aiInvestmentBoost = AI_INVESTMENT_RATE * automationCoverage * (1 - automationCoverage);
    // const aiInvBoost = productionInputs?.aiInvestmentBoost ?? 0;
    // const aiNXBoost = productionInputs?.aiNetExportBoost ?? 0;
    // const baseInvestment = prevNominalGDP * (TRADITIONAL_INVESTMENT_GDP_FRACTION + aiInvestmentBoost);
    // const adjustedInvestment = baseInvestment * creditResult.investmentMultiplier + aiInvBoost;
    // const adjustedNetExports = prevNominalGDP * NET_EXPORTS_GDP_FRACTION + aiNXBoost;

    // ═══ UNIFIED INVESTMENT PIPELINE — Phase 5-tax ═══

    // AI-specific realization: utilization × demand (no credit — applied uniformly below)
    const utilExp = (aiUtilizationSensitivity / 100) * 3.0;
    const demandExp = (consumerDemandInvestmentSensitivity / 100) * 3.0;
    const utilizationFactor = Math.pow(Math.max(0, prevAiCapacityUtilization), utilExp);
    const demandFactor = Math.pow(Math.max(0, Math.min(1, inputConsumerDemandRatio)), demandExp);
    investmentRealization = utilizationFactor * demandFactor;

    // Traditional investment demand
    const tradDemandExp = (traditionalInvestmentDemandSensitivity / 100) * 3.0;
    const tradDemandFactor = Math.pow(Math.max(0, Math.min(1, inputConsumerDemandRatio)), tradDemandExp);
    const tradInvDemand = prevNominalGDP * traditionalInvestmentGDPFraction * tradDemandFactor;

    // AI investment demand (utilization + demand gated, no credit)
    const rawAiInvBoost = productionInputs?.aiInvestmentBoost ?? 0;
    const aiInvDemand = rawAiInvBoost * investmentRealization;

    // Unified credit gate — ONE gate for ALL investment
    const totalInvestmentDemand = (tradInvDemand + aiInvDemand) * businessCredit.businessCreditMultiplier;

    // ═══ INVESTMENT CAPACITY (supply side) ═══
    // Use captured year-0 credit-funded baseline when available. BASELINE_CREDIT_FUNDED uses
    // BASELINE_PROFIT_GDP_RATIO (0.13, BEA) for retained earnings, but the model's endogenous
    // profits use DEFAULT_TRADITIONAL_PROFIT_MARGIN (0.11). This 2pp gap causes retainedEarnings
    // to drop 15.6% from t=0→t=1, triggering the capacityGate in a healthy economy.
    // The captured baseline matches the model's actual profit trajectory, eliminating the
    // discontinuity. Fallback to BASELINE_CREDIT_FUNDED for backward compatibility.
    const effectiveBaselineCreditFunded = inputs.baselineCreditFunded ?? BASELINE_CREDIT_FUNDED;
    creditCapacity = effectiveBaselineCreditFunded * (prevNominalGDP / BASELINE_GDP_NOMINAL_2025);
    investmentCapacity = retainedEarnings + creditCapacity;

    // ═══ SOFT CAPACITY GATE ═══
    capacityGate = 1.0;
    if (investmentCapacity > 0 && totalInvestmentDemand > investmentCapacity) {
      const capacityRatio = totalInvestmentDemand / investmentCapacity;
      capacityGate = 1.0 / Math.pow(capacityRatio, CAPACITY_GATE_SENSITIVITY);
    }
    let adjustedInvestment = totalInvestmentDemand * capacityGate;

    // Phase 7: Borrowing cost dampening — higher corporate rates reduce investment
    // Baseline corporate borrowing rate ≈ 10Y (4.3%) + BBB spread (1.5%) ≈ 5.8%
    if (inputCorporateBorrowingRate !== undefined) {
      const BASELINE_CORP_RATE_APPROX = 0.058;
      const rateDampening = Math.max(0.3, 1 - 0.15 * Math.max(0, inputCorporateBorrowingRate - BASELINE_CORP_RATE_APPROX));
      adjustedInvestment *= rateDampening;
    }

    // ═══ CREDIT DEPENDENCE ═══
    profitFundedRatio = investmentCapacity > 0
      ? Math.min(1, retainedEarnings / Math.max(1, adjustedInvestment))
      : 0;
    creditFundedRatio = 1 - profitFundedRatio;

    // ═══ CORPORATE CASH ACCUMULATION ═══
    const profitFundedInvestment = adjustedInvestment * profitFundedRatio;
    corporateCashAccumulation = Math.max(0, retainedEarnings - profitFundedInvestment);

    // Net exports (handled separately — see Change 9)
    const rawAiNXBoost = productionInputs?.aiNetExportBoost ?? 0;
    const aiNXBoost = rawAiNXBoost * investmentRealization;
    const adjustedNetExports = prevNominalGDP * NET_EXPORTS_GDP_FRACTION + aiNXBoost;

    // Government spending: obligation-based decomposition (Phase 3b)
    // ~80% obligation-driven (federal mandatory + discretionary): grows with inflation,
    // independent of GDP. Social Security administration, defense procurement, etc.
    // ~20% revenue-sensitive (state/local): tracks GDP via tax revenue linkage.
    // At baseline (Year 1): both terms sum to BASELINE_GOVT_SPENDING_2025 exactly.
    // During GDP decline: obligations hold steady, only revenue-sensitive portion drops.
    // Result: G drops ~8% when GDP drops 40% (vs. 40% under old procyclical formula).
    // Phase 8a: Apply COLA dampening (effectiveCIF) to obligations and fiscal consolidation multipliers.
    // Uses same multipliers as fiscal.ts computeGovernmentSpending() to prevent dual-G divergence.
    // Stage 0 (item 3): obligation spending grows with the real economy (× cumulativeProductivityFactor),
    // not inflation only. Previously obligationG grew at effectiveCIF (inflation) → 0% real growth,
    // dragging real GDP ~0.3pp below the 2% potential. Government obligations (SS beneficiaries,
    // procurement, healthcare) scale with the economy → grow at inflation + potential real growth.
    // Stage 3 (R2): obligation spending is wage-indexed (SS new awards track AWI) × beneficiary
    // (population) growth, COLA-floored via obligationGCOLAIndex (computed with the wage indices above).
    const populationFactor = population / US_POPULATION_2025;
    const obligationG = G_OBLIGATION_SHARE * BASELINE_GOVT_SPENDING_2025 * obligationGCOLAIndex * populationFactor * consolidationObligationMult;
    const revenueSensitiveG = G_REVENUE_SENSITIVE_SHARE * prevNominalGDP * GOVERNMENT_SPENDING_GDP_FRACTION * consolidationDiscretionaryMult;
    governmentSpending = obligationG + revenueSensitiveG;

    // Stage 5 (H3): in-kind transfers enter consumption DIRECTLY (NIPA PCE — government-funded
    // health benefits are household consumption). Added after the credit/velocity multipliers:
    // Medicaid-funded care is not discretionary household spending and is not credit-constrained.
    consumption = Math.max(0, adjustedConsumption) + inKindConsumption;
    investment = adjustedInvestment;
    // Nominal-first: sum of nominal components IS gdpNominal.
    // Real GDP derived as gdpNominal / priceLevel (accounting identity).
    gdpNominal = Math.max(0, consumption + investment + governmentSpending + adjustedNetExports);
    gdpReal = priceLevel > 0 ? gdpNominal / priceLevel : 0;
  }

  // Phase 3: Capacity utilization — what fraction of potential output is actually realized.
  // potentialGDP = gdpReal + aiConsumerGoodsPotential (both in real 2025-dollar terms).
  // When consumption is constrained (high MPC_ASSET income, low demand), utilization falls.
  const aiConsumerPotential = productionInputs?.aiConsumerGoodsPotential ?? 0;
  const potentialGDP = gdpReal + aiConsumerPotential;
  const capacityUtilization = potentialGDP > 0
    ? Math.min(1.0, gdpReal / potentialGDP) : 1.0;

  // Phase 3b: Unrealized AI output — demand absorption metric.
  // Measures how much AI consumer goods production goes unsold due to insufficient demand.
  // demandHealthRatio compares REAL consumption (consumption/priceLevel) to BASELINE_CONSUMPTION_2025:
  // when real consumption drops (mass unemployment → less spending), AI goods can't find buyers.
  // With UBI: consumption rises → demandHealthRatio rises → more AI goods absorbed → less unrealized.
  // This is a REPORTING metric only — does NOT feed back into GDP or other computations.
  const aiSupplyCapacity = aiConsumerPotential;
  const realConsumption = priceLevel > 0 ? consumption / priceLevel : 0;
  const demandHealthRatio = BASELINE_CONSUMPTION_2025 > 0
    ? Math.min(1.0, realConsumption / BASELINE_CONSUMPTION_2025)
    : 1.0;
  const aiGoodsAbsorbed = aiSupplyCapacity * demandHealthRatio;
  const unrealizedAIOutput = Math.max(0, aiSupplyCapacity - aiGoodsAbsorbed);
  const aiCapacityUtilization = aiSupplyCapacity > 0
    ? aiGoodsAbsorbed / aiSupplyCapacity
    : 1.0;

  // ═══ GOVERNMENT REVENUE (decomposed) — Phase 5-tax ═══
  const employerPayrollTax = aggregateWageIncome * payrollTaxRate * EMPLOYER_EMPLOYEE_SPLIT;
  const stateLocalRevenue = gdpNominal * stateLocalTaxRate;

  const totalGovernmentRevenue =
      wageIncomeTax
    + employeePayrollTax
    + employerPayrollTax
    + capitalGainsTax
    + nonCorporateAssetTax
    + transferTax
    + corporateTaxRevenue
    + stateLocalRevenue;

  const fiscalBalance = totalGovernmentRevenue - governmentSpending;

  // Compute fiscal pressure for reporting (runs at ALL years including year 0)
  // Fix D: Include policy fiscal cost so UBI/subsidy costs appear in deficit
  const fiscalReport = computeFiscalPressure(
    gdpNominal,
    unemploymentRate,
    NATURAL_UNEMPLOYMENT_RATE,
    governmentSpending,
    secondOrderParams.baselineGovtTransfers,
    secondOrderParams.baselineDebtInterest,
    totalGovernmentRevenue,  // Phase 5-tax: decomposed revenue instead of taxRate × GDP
    // Stage 5 (H3): the SAME unified flow paid on the income/consumption side (was $65B/pp × excessUE)
    incrementalTransferSpending,
    policyEffects.fiscalCost,
  );

  const gdpGrowthRate = prevNominalGDP > 0 && !isFirstYear
    ? (gdpNominal - prevNominalGDP) / prevNominalGDP
    : baselineGDPGrowth;

  // Phase 8a: Real GDP growth rate — deflated by full composite (for reporting / legacy).
  const prevRealGDP = previousMacro?.gdpReal ?? gdpReal;
  const realGDPGrowthRate = prevRealGDP > 0 && !isFirstYear
    ? (gdpReal - prevRealGDP) / prevRealGDP
    : baselineGDPGrowth;

  // Stage 2 (deflator firewall): NON-AI real GDP = nominal / nonAIPriceLevel — deflated by prices
  // EXCLUDING all AI supply deflation. Its growth rate is what Loop 1 (revenue pressure) reads, so AI
  // cost-deflation can no longer mask a nominal contraction as "growth." In a true zero-AI economy
  // nonAIPriceLevel == priceLevel ⇒ nonAIRealGDP == gdpReal ⇒ this EQUALS realGDPGrowthRate exactly
  // (firewall invisible by construction).
  const nonAIRealGDP = nonAIPriceLevel > 0 ? gdpNominal / nonAIPriceLevel : gdpReal;
  const prevNonAIRealGDP = (previousMacro?.nonAIPriceLevel ?? BASELINE_PRICE_LEVEL) > 0
    ? prevNominalGDP / (previousMacro?.nonAIPriceLevel ?? BASELINE_PRICE_LEVEL)
    : prevRealGDP;
  const nonAIRealGDPGrowthRate = prevNonAIRealGDP > 0 && !isFirstYear
    ? (nonAIRealGDP - prevNonAIRealGDP) / prevNonAIRealGDP
    : baselineGDPGrowth;

  // Depression detection (DATA_MODEL.md §5.7)
  const { isDepression, consecutiveDeclineQuarters } = detectDepression(
    gdpNominal,
    prevNominalGDP,
    unemploymentRate,
    prevConsecutiveDecline,
  );

  // New jobs (DATA_MODEL.md §6)
  // Computed separately in simulation orchestrator — placeholders here
  const newJobCreationRate = 0;
  const durableNewJobs = 0;
  const netJobCreation = 0;

  // === Phase 5g: Consumer Welfare Index (replaces ARPP as headline metric) ===
  // CWI = real income per capita (purchasing power measure)
  // Dividing by priceLevel converts nominal income to real (2025 dollars),
  // so CWI answers: "how much purchasing power does the average person command?"
  // DEPRECATED: consumption-based CWI — compressed inequality via MPC differentials
  // const consumerWelfareIndex = population > 0 ? consumption / (population * priceLevel) : 0;
  // CWI = post-tax disposable purchasing power — Phase 5-tax
  const consumerWelfareIndex = (population > 0 && priceLevel > 0) ? totalPostTaxIncome / (population * priceLevel) : 0;
  const prevCWI = previousMacro?.consumerWelfareIndex ?? 0;
  const cwiGrowthRate = (!isFirstYear && prevCWI > 0)
    ? (consumerWelfareIndex - prevCWI) / prevCWI
    : 0;
  const prevCWIGrowthRate = previousMacro?.cwiGrowthRate ?? 0;
  const cwiAcceleration = !isFirstYear
    ? cwiGrowthRate - prevCWIGrowthRate
    : 0;

  // === Median CWI: Bottom 80% real purchasing power per capita ===
  // Weights each income channel by the share reaching bottom 80% of households,
  // divides by 80% of population. Purely a reporting metric — no simulation feedback.
  const b80WageShare = inputs.bottom80WageShare ?? BOTTOM80_WAGE_SHARE;
  const b80TransferShare = inputs.bottom80TransferShare ?? BOTTOM80_TRANSFER_SHARE;
  const b80AssetShare = inputs.bottom80AssetShare ?? BOTTOM80_ASSET_SHARE;
  const bottom80Pop = BOTTOM80_POP_SHARE * population;

  // DEPRECATED: consumption-based median CWI with credit/velocity/housing adjustments
  // const bottom80Consumption =
  //     b80WageShare * wageConsumption
  //   + b80TransferShare * transferConsumption
  //   + b80AssetShare * assetConsumption;
  // let medianCWI: number;
  // if (isFirstYear) {
  //   medianCWI = bottom80Pop > 0 ? bottom80Consumption / (bottom80Pop * priceLevel) : 0;
  // } else {
  //   const bottom80Adjusted =
  //       bottom80Consumption * creditResult.consumptionMultiplier * deflationDrag.velocityMultiplier
  //     + BOTTOM80_POP_SHARE * housingWealthDrag;
  //   medianCWI = bottom80Pop > 0 ? bottom80Adjusted / (bottom80Pop * priceLevel) : 0;
  // }

  // Income-based median CWI: bottom 80% share of each income channel (post-tax — Phase 5-tax)
  const bottom80Income =
      b80WageShare * afterTaxWageIncome
    + b80TransferShare * afterTaxTransferIncome
    + b80AssetShare * afterTaxAssetIncome;

  const medianCWI = (bottom80Pop > 0 && priceLevel > 0)
    ? bottom80Income / (bottom80Pop * priceLevel) : 0;

  const prevMedianCWI = previousMacro?.medianCWI ?? 0;
  const medianCWIGrowthRate = (!isFirstYear && prevMedianCWI > 0)
    ? (medianCWI - prevMedianCWI) / prevMedianCWI
    : 0;

  // Cycle phase classification (Phase 5g)
  const ACCEL_THRESHOLD = 0.001;
  const prevCyclePhase = previousMacro?.cyclePhase ?? 'STABLE';
  const wasInDecline = prevCyclePhase === 'ACCELERATING_DECLINE'
    || prevCyclePhase === 'LINEAR_DECLINE'
    || prevCyclePhase === 'DECELERATING_DECLINE';
  let cyclePhase: CyclePhase;
  if (cwiGrowthRate >= 0) {
    cyclePhase = wasInDecline ? 'RECOVERY' : 'STABLE';
  } else {
    if (cwiAcceleration < -ACCEL_THRESHOLD) {
      cyclePhase = 'ACCELERATING_DECLINE';
    } else if (cwiAcceleration > ACCEL_THRESHOLD) {
      cyclePhase = 'DECELERATING_DECLINE';
    } else {
      cyclePhase = 'LINEAR_DECLINE';
    }
  }

  // Monetary collapse detection: when priceLevel hits the MAX_PRICE_LEVEL cap,
  // all real-terms computations become meaningless (denominator frozen).
  // Override cyclePhase to signal the simulation loop to halt.
  if (priceLevel >= MAX_PRICE_LEVEL * MONETARY_COLLAPSE_THRESHOLD_FRACTION) {
    cyclePhase = 'MONETARY_COLLAPSE';
  }

  // === Phase 5g: AI GDP Contribution ===
  // Total AI addition to GDP: investment boost + absorbed consumer goods + net export boost
  const aiGDPContribution = (productionInputs?.aiInvestmentBoost ?? 0)
    + aiGoodsAbsorbed
    + (productionInputs?.aiNetExportBoost ?? 0);
  const aiGDPContributionPct = gdpNominal > 0 ? aiGDPContribution / gdpNominal : 0;

  // ═══ STAGE 7: RESIDUAL CORPORATE PROFITS (Phase 10.B core; OD-5 checkpoint ratified) ═══
  // corporateProfits = GDP − wageBill − nonCorporateIncome − otherCosts. Margins are OUTPUTS.
  // The min(raw, GDP − wageBill) cap is DELETED — the identity replaces it. SIGNED: total and
  // traditional profits may go negative in a collapse (reported, not clamped).
  // Labor share is now a COMPUTED OUTPUT: productivity gains flow to companies first; the wage
  // equation (Phillips + passthrough + rent-sharing) determines labor's claw-back. The three-way
  // split of AI gains is CLOSED: sector price passthroughs decide the consumer share (Stage 1);
  // wage passthrough + rent-sharing decide the worker share (Stage 3/7); capital gets the residual.
  // DEPRECATED (Stage 7) — the Phase 5g bottom-up margin model and its additive terms:
  //   aiProfitMargin × aiGDP, traditionalGDP × DEFAULT_TRADITIONAL_PROFIT_MARGIN (0.11 is now a
  //   VALIDATION REFERENCE only), inputAutomationDividend (deployers' cost savings — this WAS the
  //   Stage-1 retained-margin proxy: lower wage bill at unchanged revenue lands in the residual
  //   automatically), inputAugmentationProfitBoost (output↑ without proportional wage↑ — likewise
  //   automatic). Keeping any of them would double-count.
  // const aiProfitMargin = Math.max(0, inputAiProfitMargin + inputLabProfitMarginAdjustment);
  // const rawAiProfits = aiGDPContribution * aiProfitMargin;
  // const rawTraditionalProfits = traditionalGDP * traditionalProfitMargin
  //   + inputAutomationDividend + inputAugmentationProfitBoost;
  void inputAiProfitMargin; void inputLabProfitMarginAdjustment;
  void inputAutomationDividend; void inputAugmentationProfitBoost; void traditionalProfitMargin;
  const totalWageBill = aggregateWageIncome;
  const otherCostsShare = inputs.otherCostsShare ?? DEFAULT_OTHER_COSTS_SHARE;
  const otherCosts = otherCostsShare * gdpNominal;
  const corporateProfits = gdpNominal - totalWageBill - nonCorporateAssetIncome - otherCosts;
  // AI/traditional split (Q-3: AI bears proportionate otherCosts — conservative on AI profits since
  // AI-sector CFC plausibly exceeds the average; per-sector multiplier = registered refinement):
  const aiSectorLaborShareVal = inputs.aiSectorLaborShare ?? DEFAULT_AI_SECTOR_LABOR_SHARE;
  const aiCorporateProfits = aiGDPContribution * (1 - aiSectorLaborShareVal) * (1 - otherCostsShare);
  const traditionalCorporateProfits = corporateProfits - aiCorporateProfits;  // SIGNED — no floor
  const profitGDPRatio = gdpNominal > 0 ? corporateProfits / gdpNominal : 0;

  // ═══ AI Cost Indices (Phase 5-tax) ═══
  const t_years = year - DEFAULT_START_YEAR;
  const aiCostP = inputs.aiCostParams;
  const infChange = aiCostP?.inferenceAnnualChange ?? DEFAULT_INFERENCE_ANNUAL_CHANGE;
  const mfgChange = aiCostP?.manufacturingAnnualChange ?? DEFAULT_MANUFACTURING_ANNUAL_CHANGE;
  const engChange = aiCostP?.energyAnnualChange ?? DEFAULT_ENERGY_ANNUAL_CHANGE;
  const inferenceCostIndex = Math.exp(infChange * t_years);
  const manufacturingCostIndex = Math.exp(mfgChange * t_years);
  const energyCostIndex = Math.exp(engChange * t_years);

  // Blended across deployment mix (using equal-weighted average of all deployment types)
  const deploymentTypes: DeploymentType[] = ['software', 'hybrid', 'autonomous_vehicle', 'robotics'];
  const blendedAiCostIndex = deploymentTypes.reduce((sum, dt) => {
    const c = (aiCostP?.composition?.[dt] ?? AI_COST_COMPOSITION[dt] ?? AI_COST_COMPOSITION['software'])!;
    return sum + (1 / deploymentTypes.length) * (
      c.inference * inferenceCostIndex +
      c.manufacturing * manufacturingCostIndex +
      c.energy * energyCostIndex
    );
  }, 0);

  // ═══ Import Dependence (Phase 5-tax, FIX 4) ═══
  const totalAIOutput = productionInputs?.aiAdditionalOutput ?? 0;
  const realizedOnshoring = (productionInputs?.aiNetExportBoost ?? 0) * investmentRealization;
  const importDependence = totalAIOutput > 0
    ? 1.0 - (realizedOnshoring / totalAIOutput)
    : 1.0;

  return {
    year,
    totalEmployment,
    totalUnemployment,
    unemploymentRate,
    laborForceParticipation,
    // Phase 5g: Dynamic demographics (placeholders — overridden by simulation.ts)
    dynamicPopulation: population,
    dynamicLaborForce: laborForce,
    aggregateWageIncome,
    aggregateAssetIncome,
    aggregateTransferIncome,
    totalIncome,
    incomeComposition,
    priceLevel,
    inflationRate: compositeInflation,
    aiDeflationRate,
    netInflation,
    gdpNominal,
    gdpReal,
    gdpGrowthRate,
    realGDPGrowthRate,
    nonAIRealGDPGrowthRate,
    consumption,
    investment,
    governmentSpending,
    // Phase 5g: Consumer Welfare Index (replaces ARPP)
    consumerWelfareIndex,
    cwiGrowthRate,
    cwiAcceleration,
    cyclePhase,
    // Median CWI: bottom 80% purchasing power
    medianCWI,
    medianCWIGrowthRate,
    // Phase 5g: AI GDP Contribution
    aiGDPContribution,
    aiGDPContributionPct,
    revenuePressure,
    automationAcceleration,
    isDepression,
    consecutiveDeclineQuarters,
    // Stage 3: back-compat — wagePressure now = wage level relative to trend (1.0 in zero-AI, <1 when
    // a slump pushes wages below trend). The endogenous driver is nominalWageGrowth / wageIndex.
    wagePressure: trendWageIndex > 0 ? wageIndex / trendWageIndex : 1.0,
    sectorWeightedDeflationRate: sectorWeightedDeflationRate ?? aiDeflationRate,
    // Demand spillover fields — populated by simulation.ts after computeMacro returns
    consumerDemandRatio: 1.0,
    govDemandRatio: 1.0,
    businessDemandRatio: 1.0,
    aggregateDemandSurvival: 1.0,
    totalDemandSpilloverLoss: 0,
    newJobCreationRate,
    automationCoverage,
    durableNewJobs,
    netJobCreation,
    // Second-order effect outputs
    demandRatio: demandResult.demandRatio,
    demandPenalty: demandResult.demandPenalty,
    // Phase 6: Separated credit outputs
    consumerCreditMultiplier: consumerCredit.consumerCreditMultiplier,
    consumerCreditTightening: consumerCredit.consumerCreditTightening,
    unclippedConsumerTightening: consumerCredit.unclippedConsumerTightening,  // Stage 6 (R18): binding diagnostics
    // E-1 (examination): adaptive credit-bar state
    creditBarLevel,
    creditBarInflationExpectation: creditBarExpectationOut,
    pceProxyInflation,  // E-9: the Fed's mandate variable (PCE-reweighted sector inflation − formula effect)
    incomeAdequacyRatio: consumerCredit.incomeAdequacyRatio,
    underwritableIncome: consumerCredit.underwritableIncome,
    businessCreditMultiplier: businessCredit.businessCreditMultiplier,
    businessCreditTightening: businessCredit.businessCreditTightening,
    profitCoverageRatio: businessCredit.profitCoverageRatio,
    fiscalDeficitGDPRatio: fiscalReport.fiscalDeficitGDPRatio,
    discretionarySpending: fiscalReport.discretionarySpending,
    // Deflation velocity drag outputs
    velocityMultiplier: deflationDrag.velocityMultiplier,
    deflationDragPct: deflationDrag.deflationDragPct,
    // Income derivation outputs (Phase 3c)
    cumulativeInflationFactor,
    baselineTransferIncome: baselineTransfers,
    effectiveInflationRate: effectiveInflation,
    // AI Production Expansion outputs (Phase 2)
    aiAdditionalOutput: productionInputs?.aiAdditionalOutput ?? 0,
    aiInvestmentBoost: productionInputs?.aiInvestmentBoost ?? 0,
    aiNetExportBoost: productionInputs?.aiNetExportBoost ?? 0,
    aiConsumerGoodsPotential: aiConsumerPotential,
    unrealizedAIOutput,
    aiGoodsAbsorbed,
    aiCapacityUtilization,
    // Worker augmentation channel
    totalAugmentationOutput: (productionInputs?.augmentationWageBoost ?? 0) + (productionInputs?.augmentationProfitBoost ?? 0),
    augmentationWageBoost: productionInputs?.augmentationWageBoost ?? 0,
    augmentationProfitBoost: productionInputs?.augmentationProfitBoost ?? 0,
    // Investment Demand Constraint outputs
    investmentRealization,
    aiInvestmentRealized: isFirstYear ? 0 : ((productionInputs?.aiInvestmentBoost ?? 0) * investmentRealization),
    aiExportsRealized: isFirstYear ? 0 : ((productionInputs?.aiNetExportBoost ?? 0) * investmentRealization),
    // New Job Integration outputs (Phase 2)
    newJobEmployment: totalHumanNewJobs,
    newJobWageIncome,
    // Demand-Constrained GDP outputs (Phase 3)
    potentialGDP,
    capacityUtilization,
    wageConsumption,
    assetConsumption,
    transferConsumption,
    // Asset Income Decomposition
    dividendIncome,
    aiCapitalGains,
    traditionalCapitalGains,
    nonCorporateAssetIncome,
    nonCorporateAssetTax,
    capitalGainsRealizationRate,
    aiSectorPE,
    traditionalSectorPE,
    prevAICorporateProfits: previousMacro?.aiCorporateProfits ?? aiCorporateProfits,
    prevTraditionalCorporateProfits: previousMacro?.traditionalCorporateProfits ?? traditionalCorporateProfits,
    // Phase 5g Change 6: Corporate Profits
    corporateProfits,
    aiCorporateProfits,
    traditionalCorporateProfits,
    profitGDPRatio,
    // Phase 5g Batch C: Price level decomposition
    minWageCostPush: inputMinWageCostPush,
    creditDeflationContribution,
    scarcityInflation: inputScarcityInflation,
    // Phase 5g Step 12: Labor supply response (placeholders — overridden by simulation.ts)
    voluntaryWithdrawalRate: 0,
    effectiveLaborSupply: totalRemainingEmployment,
    // Phase 5i: Housing & Shelter outputs
    goodsInflation,
    shelterInflation,
    compositeInflation,
    // Stage 1: sectoral price architecture
    aiExposedInflation,
    laborServicesInflation,
    foodEnergyInflation,
    nonAICompositeInflation,
    nonAIPriceLevel,
    laborServicesPriceLevel,  // Stage 5b (F2): in-kind support deflator
    // Stage 6.5: stock-flow housing state + diagnostics
    housingStock: housing.housingStock,
    households: housing.households,
    headshipRate: housing.headshipRate,
    rentIndex: housing.rentIndex,
    constructionCostIndex: housing.constructionCostIndex,
    landCostIndex: housing.landCostIndex,
    occupancyRate: housing.occupancyRate,
    housingStarts: housing.housingStarts,
    housingPipeline: housing.housingPipeline,
    housingCompletions: housing.housingCompletions,
    builderPriceIndex: housing.builderPriceIndex,
    landResidualTarget: housing.landResidualTarget,
    builderTrendGrowth: housing.builderTrendGrowth,
    afterTaxIncomeGrowth,
    monetaryInflation,  // Stage 4: signed monetary-inflation component of composite
    // Stage 5 (H3): unified incremental-UE transfer flows (single source of truth)
    incrementalCashTransfers,
    inKindConsumption,
    incrementalTransferSpending,
    shelterDeflationFromAI,
    foreclosureSupplyEffect,
    rentalDemandPressure,
    institutionalAbsorption,
    mortgageStressIndex: mortgageStressIdx,
    foreclosureRateAggregate: inputForeclosureRate,
    // Homeownership quintiles — placeholders overridden by simulation.ts
    homeownershipQ1: (inputs.dynamicHomeownership?.[0] ?? MORTGAGE_EXPOSURE_QUINTILES[0].homeownershipRate),
    homeownershipQ2: (inputs.dynamicHomeownership?.[1] ?? MORTGAGE_EXPOSURE_QUINTILES[1].homeownershipRate),
    homeownershipQ3: (inputs.dynamicHomeownership?.[2] ?? MORTGAGE_EXPOSURE_QUINTILES[2].homeownershipRate),
    homeownershipQ4: (inputs.dynamicHomeownership?.[3] ?? MORTGAGE_EXPOSURE_QUINTILES[3].homeownershipRate),
    homeownershipQ5: (inputs.dynamicHomeownership?.[4] ?? MORTGAGE_EXPOSURE_QUINTILES[4].homeownershipRate),
    avgHomeownership,
    homePriceChangeRate: housingWealthResult.homePriceChangeRate,
    housingWealthDrag,
    effectiveMpcWage,
    precautionaryMpcReduction,
    creditAdoptionAcceleration: inputs.creditAdoptionAcceleration ?? 0,
    // ═══ Tax Revenue Breakdown (Phase 5-tax) ═══
    wageIncomeTax,
    employeePayrollTax,
    employerPayrollTax,
    capitalGainsTax,
    corporateTaxRevenue,
    stateLocalRevenue,
    transferTax,  // FS-6f: exposed for the direct fiscal bridge + the completeness assertion
    totalGovernmentRevenue,
    // After-Tax Income
    afterTaxWageIncome,
    afterTaxAssetIncome,
    afterTaxTransferIncome,
    totalPostTaxIncome,
    // Investment Capacity
    afterTaxCorporateProfits,
    retainedEarnings,
    creditCapacity,
    investmentCapacity,
    capacityGate,
    profitFundedRatio,
    creditFundedRatio,
    corporateCashAccumulation,
    // AI Cost Indices
    blendedAiCostIndex,
    inferenceCostIndex,
    manufacturingCostIndex,
    energyCostIndex,
    // Supply Chain
    importDependence,
    // Phase 9: Supply chain resilience defaults (overridden when supply chain module active)
    aggregateResilience: 0,
    cumulativeDelayGenerative: 0,
    cumulativeDelayAgentic: 0,
    cumulativeDelayEmbodied: 0,
    supplyChainCostPush: 0,
    cascadeBacklog: 0,
    costPassThroughRate: 0,
    adoptionDragMultiplier: 1,
    dynamicTrainingCompChips: 0,
    dynamicTrainingCompEnergy: 0,
    dynamicTrainingCompDC: 0,
    effectiveComputeDeclineRate: -0.45,
    deploymentMultiplierCompute: 1,
    deploymentMultiplierPhysical: 1,
    deploymentMultiplierEnergy: 1,
    automationDividend: inputAutomationDividend,
    // Phase 8 Fix 5: Housing model and wage growth outputs
    homePriceIndex: computedHomePriceIndex,
    affordabilityDeviation: computedAffordabilityDeviation,
    realIncomeGrowthRate: computedRealIncomeGrowthRate,
    mortgageRateChange: computedMortgageRateChange,
    // Stage 3: endogenous wage path
    nominalWageGrowth,
    wageIndex,
    trendWageIndex,
    scarcityPremiumLevel,
    obligationGCOLAIndex,
    // Phase 10.A: α driver inputs + cumulative AI displacement
    corporateMarginRatio: gdpNominal > 0 ? corporateProfits / gdpNominal : 0,
    aiDisplacementUnemployment: 0,  // Overridden in simulation.ts (cumulative across years)
  };
}
