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
  BASELINE_TRANSFER_PER_UNEMPLOYED,
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
  TRANSFER_GROWTH_PER_UE_POINT,
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
  DEFAULT_SHELTER_INFLATION_STICKINESS,
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
  DEFAULT_AI_PROFIT_GROWTH_RATE,
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
): number {
  const yearsSinceStart = year - DEFAULT_START_YEAR;
  const augMultiplier = augmentationMultiplierInput ?? 2.0;

  // Count clusters per sector prefix for CPI weight splitting
  const prefixCounts = new Map<string, number>();
  for (const c of clusterResults) {
    const prefix = getSectorPrefix(c.clusterId);
    prefixCounts.set(prefix, (prefixCounts.get(prefix) ?? 0) + 1);
  }

  let totalDeflation = 0;

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
  }

  return Math.max(0, totalDeflation);
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
  transferGrowthPerUEPoint: TRANSFER_GROWTH_PER_UE_POINT,
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
  const totalConsumerTightening = Math.min(maxConsumerTightening,
    Math.max(0, incomeTightening + collateralTightening + totalSystemicTightening));

  const consumerCreditRatio = maxConsumerTightening > 0
    ? totalConsumerTightening / maxConsumerTightening : 0;
  const consumerCreditMultiplier = Math.max(0.01,
    1.0 - consumerCreditImpact * consumerCreditRatio);

  return {
    consumerCreditMultiplier,
    consumerCreditTightening: totalConsumerTightening,
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
): {
  businessCreditMultiplier: number;
  businessCreditTightening: number;
  profitCoverageRatio: number;
} {
  // Channel 1: Profitability
  // Below baseline: tightening. Above baseline: loosening signal (capped at 2x).
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
  const growthSignal = -growthTrajectorySensitivity * prevGDPGrowthRate;
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
 * @param transferGrowthPerPP - Additional transfers per 1pp excess UE
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
  transferGrowthPerPP: number = TRANSFER_GROWTH_PER_UE_POINT,
  policyFiscalCost: number = 0,
): { adjustedG: number; fiscalDeficitGDPRatio: number; discretionarySpending: number } {
  const excessUE = Math.max(0, unemploymentRate - naturalUE);
  // excessUE is fraction; multiply by 100 for percentage points
  const additionalTransfers = transferGrowthPerPP * excessUE * 100;
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
  const aiProfitGrowthRateParam = inputs.aiProfitGrowthRate ?? DEFAULT_AI_PROFIT_GROWTH_RATE;
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
  let consumerCredit: { consumerCreditMultiplier: number; consumerCreditTightening: number; incomeAdequacyRatio: number; underwritableIncome: number };
  let businessCredit: { businessCreditMultiplier: number; businessCreditTightening: number; profitCoverageRatio: number };
  let creditTighteningRate: number;
  let creditDeflationContribution: number;

  const hasBaselineCaptures = (inputs.baselineRealHouseholdIncome ?? 0) > 0
    && (inputs.baselineCorporateProfits ?? 0) > 0;

  if (isFirstYear || !hasBaselineCaptures) {
    // First year or missing baselines → neutral credit (no tightening, no loosening)
    consumerCredit = { consumerCreditMultiplier: 1.0, consumerCreditTightening: 0, incomeAdequacyRatio: 1.0, underwritableIncome: 0 };
    businessCredit = { businessCreditMultiplier: 1.0, businessCreditTightening: 0, profitCoverageRatio: 1.0 };
    creditTighteningRate = 0;
    creditDeflationContribution = 0;
  } else {
    // Phase 8 Fix 5: Compute structural productivity growth for credit baseline growth.
    // This approximates ~1.6%/year (GDP growth minus population growth) — the rate the
    // real economy SHOULD be growing. The credit baseline grows at this rate so only
    // genuine deterioration (income falling below trend) triggers tightening.
    const creditBaselineGrowth = Math.max(0,
      (inputs.baselineGDPGrowth ?? BASELINE_GDP_GROWTH_RATE) - (inputs.populationGrowthRate ?? DEFAULT_POPULATION_GROWTH_RATE));

    consumerCredit = computeConsumerCreditConditions(
      inputs.prevRealWageIncome ?? 0,
      inputs.prevRealTransferIncome ?? 0,
      inputs.prevRealAssetIncome ?? 0,
      inputs.baselineRealHouseholdIncome!,
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
      Math.max(0, yearsSinceStart - 1),  // Phase 8 Fix 5: years since baseline for growing credit baseline
                                         // -1 because prevRealIncome is from PREVIOUS year; year-0 income
                                         // IS the baseline, so comparing it to baseline×(1+g)^1 creates
                                         // a false 1.6% deficiency in the very first year.
      creditBaselineGrowth,              // Phase 8 Fix 5: structural productivity growth rate (~1.6%)
    );

    const prevGDPGrowthRate = previousMacro?.gdpGrowthRate ?? (inputs.baselineGDPGrowth ?? BASELINE_GDP_GROWTH_RATE);
    const maxBusinessLoosening = inputs.maxBusinessCreditLoosening ?? DEFAULT_MAX_BUSINESS_CREDIT_LOOSENING;

    businessCredit = computeBusinessCreditConditions(
      inputs.prevAfterTaxCorporateProfits ?? 0,
      inputs.baselineCorporateProfits ?? 0,
      prevGDPGrowthRate,
      inputs.profitabilitySensitivity ?? DEFAULT_PROFITABILITY_SENSITIVITY,
      inputs.growthTrajectorySensitivity ?? DEFAULT_GROWTH_TRAJECTORY_SENSITIVITY,
      inputs.maxBusinessTightening ?? DEFAULT_MAX_BUSINESS_TIGHTENING,
      maxBusinessLoosening,
      inputs.businessInvestmentImpact ?? DEFAULT_BUSINESS_INVESTMENT_IMPACT,
    );

    // Credit deflation contribution: consumer credit tightening causes deflationary pressure
    // (less consumer borrowing → less money creation → deflationary)
    const maxConsTightening = inputs.maxConsumerTightening ?? DEFAULT_MAX_CONSUMER_TIGHTENING;
    creditTighteningRate = maxConsTightening > 0
      ? consumerCredit.consumerCreditTightening / maxConsTightening
      : 0;
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

  // ═══ AI PROFIT GROWTH RATE → DEFLATION (Phase 5-tax) ═══
  // Higher aiProfitGrowthRate = more market power = firms retain more savings as profit
  // Lower rate = more competition = savings pass through to consumers as lower prices
  const marketPowerRetention = Math.min(1.0, aiProfitGrowthRateParam / 10.0);
  const pricePassThrough = 1.0 - marketPowerRetention;
  const aiDeflationRate = aiDeflationRate_raw * pricePassThrough;
  // MOVED: priceLevel now computed after compositeInflation — see below

  // Phase 5g: 7-component net inflation (matches design spec)
  // Components: base + AI deflation + transfer inflation + demand effects
  //           + min wage cost-push + credit deflation + labor scarcity
  // transferInflation: wired from previous year's monetary.actualInflationFromTransfers (one-year lag)
  // demandEffects: TODO — no demand-pull inflation computation yet; defaults to 0
  // Phase 7: Prefer monetization-based inflation when available.
  // inflationFromMonetization comes from Phase 7 monetization module (deficit × monetizationRate)
  // and replaces the old transferInflation path (which used totalTransfers × moneyCreationShare ≈ 1.0).
  const effectiveTransferInflation = inputInflationFromMonetization !== undefined
    ? inputInflationFromMonetization
    : inputTransferInflation;
  const netInflation = baseInflationRate
    - aiDeflationRate
    + effectiveTransferInflation
    + inputDemandEffects
    + inputMinWageCostPush
    + creditDeflationContribution
    + inputScarcityInflation
    + inputSupplyChainCostPush;  // Phase 9

  // Phase 5i Change 1: Shelter vs Goods price decomposition
  // AI deflates goods (software, manufacturing) but shelter (~36% of CPI) barely deflates
  // until embodied AI automates construction. Consumers experience composite inflation.
  const shelterWeight = inputs.shelterCPIWeight ?? BASELINE_SHELTER_CPI_WEIGHT;
  const shelterStickiness = inputs.shelterInflationStickiness ?? DEFAULT_SHELTER_INFLATION_STICKINESS;
  const embodiedCap = inputs.embodiedCapability ?? 0;
  const inputForeclosureRate = inputs.foreclosureRateAggregate ?? 0;

  // Housing Market Stabilization — extract once, use in shelter + housing wealth
  const instBuyerRate = inputs.institutionalBuyerRate ?? 0.40;
  const rentalSens = inputs.rentalDemandSensitivity ?? 0.50;
  const shelterFloor = inputs.shelterInflationFloor ?? -0.05;
  const avgHomeownership = inputs.dynamicHomeownership
    ? inputs.dynamicHomeownership.reduce((a, b) => a + b, 0) / inputs.dynamicHomeownership.length
    : BASELINE_HOMEOWNERSHIP;

  // Goods inflation = all existing 7-component netInflation (non-shelter)
  const goodsInflation = netInflation;

  // Shelter: sticky, responds to construction automation, foreclosures, credit
  const shelterDeflationFromAI = -embodiedCap * shelterStickiness * 0.10;

  // A1. Institutional absorption reduces foreclosure supply effect
  const rawForeclosureSupply = -inputForeclosureRate * 0.5;
  const institutionalAbsorption = inputForeclosureRate * instBuyerRate * 0.5;
  const foreclosureSupplyEffect = rawForeclosureSupply + institutionalAbsorption;

  // B. Rental demand from displaced homeowners
  const rentersCreated = Math.max(0, BASELINE_HOMEOWNERSHIP - avgHomeownership);
  const rentalDemandPressure = rentersCreated * rentalSens;

  // Phase 7: Use actual mortgage rate from bond market when available
  // Higher rates → tighter credit → lower home prices → deflationary for shelter
  // Baseline mortgage rate ≈ 10Y yield (4.3%) + spread (1.7%) ≈ 6.0%
  const BASELINE_MORTGAGE_RATE_APPROX = 0.06;
  const mortgageRateEffect = inputMortgageRate !== undefined
    ? -0.5 * Math.max(0, inputMortgageRate - BASELINE_MORTGAGE_RATE_APPROX)
    : -(creditTighteningRate) * 0.02;

  // Shelter inflation with stabilization forces
  let shelterInflation = BASELINE_SHELTER_INFLATION + shelterDeflationFromAI
    + foreclosureSupplyEffect + mortgageRateEffect + rentalDemandPressure;

  // C. Land scarcity floor
  shelterInflation = Math.max(shelterFloor, shelterInflation);

  // Composite = what consumers experience
  const compositeInflation = shelterWeight * shelterInflation
    + (1 - shelterWeight) * goodsInflation;

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

  // Phase 5h: S-curve logistic deferral (replaces linear sensitivity)
  // Supply-driven deflation (AI making goods cheaper) historically INCREASES
  // consumption — consumers buy more when things are affordable (electronics,
  // computing, streaming all show this pattern). Only demand-driven deflation
  // (credit contraction, demand collapse) causes purchase deferral.
  // aiDeflationRate is the supply-driven component. Adding it back to
  // netInflation isolates the demand-driven remainder.
  const demandSideInflation = netInflation + aiDeflationRate;
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

  // Phillips curve wage pressure (Phase 10.A rewrite: classic decay × (1 - aiShare) + scarcity premium).
  // aiDisplacementUnemployment + aggregateReplacementDifficultyWagePremium come from simulation.ts
  // as part of MacroInputs; when absent (e.g., legacy callers), the scarcity premium term is 0 and
  // the Phillips side collapses to the classic exponential (since aiShare = 0).
  const wagePressure = computeWagePressure(
    unemploymentRate,
    inputs.aiDisplacementUnemployment ?? 0,
    inputs.aggregateReplacementDifficultyWagePremium ?? 0,
    inputs.scarcityIntensity ?? 0,
    inputs.laborForceBaseline ?? laborForce,
    policyWageFloor,
    secondOrderParams.phillipsCurveSensitivity,
  );

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
  const structuralProductivityGrowth = Math.max(0, baselineGDPGrowth - DEFAULT_POPULATION_GROWTH_RATE);
  // Cumulative productivity factor: compounds at ~1.6%/year from a static 2025 baseline.
  // Used by wages, transfers, and non-corporate asset income so ALL income channels grow
  // at productivity + inflation, breaking the GDP circularity that otherwise limits real
  // GDP growth to ~1.0% even in a zero-AI economy.
  const cumulativeProductivityFactor = Math.pow(1 + structuralProductivityGrowth, yearsSinceStart);
  // Wage base: static 2025 baseline × cumulative inflation × cumulative productivity.
  // Previous approach (prevNominalGDP × share × (1+structProd)) was circular: wages derived
  // from GDP, GDP derived from consumption, consumption from wages. The (1+structProd) factor
  // was a constant level shift that didn't compound — real wage growth tracked GDP (~1.0%),
  // not productivity (~1.6%). Static baseline with cumulative compounding makes wages exogenous:
  // wage growth = inflation + productivity ≈ 2.3% + 1.6% = 3.9% nominal per year.
  // Displacement multipliers (employmentRatio, wageRatio, wagePressure) still modulate on top.
  const baselineAggregateWages = BASELINE_GDP_NOMINAL_2025 * BASELINE_WAGE_SHARE;
  const wageBase = baselineAggregateWages * cumulativeInflationFactor * cumulativeProductivityFactor;
  // Scale baseline employment with population growth so employmentRatio stays ~1.0 at zero displacement
  const growingBaselineEmployment = BASELINE_TOTAL_EMPLOYMENT * lfGrowth;
  const employmentRatio = totalRemainingEmployment / growingBaselineEmployment;
  // FIX C: Use actual baseline wage (from BLS data) as denominator so wageRatio = 1.0 at t=0
  const wageRatio = weightedAverageWage / baselineAverageWage;
  const adjustedWageRatio = wageRatio * wagePressure;
  const existingWageIncome = wageBase * employmentRatio * adjustedWageRatio
    + policyEffects.wageChannelAddition;

  // New job wage income: pays current nominal average wage (not frozen 2025 dollars)
  const newJobWageFrac = productionInputs?.newJobWageFraction ?? DEFAULT_NEW_JOB_WAGE_FRACTION;
  const currentAvgWage = wageBase / growingBaselineEmployment;
  const newJobWageIncome = totalHumanNewJobs * currentAvgWage * newJobWageFrac * wagePressure;

  // Augmentation: workers capture their share of productivity gains from AI tools.
  // Flows through existing pipeline: → afterTaxWageIncome → wageConsumption (× MPC 0.95) → GDP.
  const augWageBoost = productionInputs?.augmentationWageBoost ?? 0;
  const aggregateWageIncome = existingWageIncome + newJobWageIncome + augWageBoost;

  // ═══ CORPORATE TAX (on previous year profits) — Phase 5-tax ═══
  // Must come BEFORE asset income: dividends depend on after-tax corporate profits.
  // At t=0, bootstrap from BEA baseline corporate profits.
  const baselineCorporateProfits = BASELINE_PROFIT_GDP_RATIO * BASELINE_GDP_NOMINAL_2025;
  const prevCorpProfits = previousMacro?.corporateProfits ?? baselineCorporateProfits;
  const corporateTaxRevenue = prevCorpProfits * corporateTaxRate;
  const afterTaxCorporateProfits = prevCorpProfits * (1 - corporateTaxRate);
  let retainedEarnings = afterTaxCorporateProfits * corporateRetentionRate;

  // ═══ ASSET INCOME — Exact Decomposition (dynamic P/E + endogenous capital gains) ═══
  //
  // aggregateAssetIncome = dividends + aiCapitalGains + tradCapitalGains + nonCorporateIncome
  //
  // All inputs use PREVIOUS year values to avoid circularity.
  // Corporate profits are computed later in this function for THIS year,
  // but feed into NEXT year's asset income through previousMacro.

  // ── Component 1: Dividends ──
  // After-tax corporate profits distributed to shareholders.
  // Dividends = after-tax profits × payout ratio. No extra productivity factor needed:
  // profits derive from GDP, and GDP now grows at ~1.6% real because wages and transfers
  // are exogenous (static baseline × cumulative inflation × cumulative productivity).
  // Adding a productivity factor here would double-count.
  const dividendIncome = afterTaxCorporateProfits * (1 - corporateRetentionRate);

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
  // Interest, rental, proprietor's income — static 2025 baseline × cumulative factors.
  // Same pattern as wages: static baseline breaks the GDP circularity and ensures
  // non-corporate asset income grows at productivity + inflation from the 2025 base.
  const baselineNonCorporateIncome = BASELINE_GDP_NOMINAL_2025 * NON_CORPORATE_ASSET_SHARE;
  const nonCorporateAssetIncome = baselineNonCorporateIncome * cumulativeInflationFactor * cumulativeProductivityFactor;

  // ── Total Asset Income ──
  const aggregateAssetIncome = dividendIncome + aiCapitalGains + traditionalCapitalGains
    + nonCorporateAssetIncome + policyEffects.assetChannelAddition;

  // Phase 3c (revised): Transfers grow with inflation (COLA) AND structural productivity.
  // Social Security initial benefits are wage-indexed (grow with average wages, not just prices).
  // Medicare/Medicaid expand with healthcare spending (tracks GDP). The aggregate transfer pool
  // as a fraction of GDP is roughly constant — it grows with the tax base, not just inflation.
  // CIF compounds inflation. cumulativeProductivityFactor compounds real productivity growth.
  // Together: nominal transfer growth ≈ inflation + productivity ≈ nominal GDP growth.
  // Phase 8a: Apply COLA dampening from fiscal response profile when CIF exceeds threshold.
  // Dampening reduces the GROWTH portion only — base stays intact.
  let effectiveCIF = cumulativeInflationFactor;
  if (fiscalProfile && cumulativeInflationFactor > fiscalProfile.colaDampeningThreshold) {
    const dampenRange = fiscalProfile.colaDampeningMaxCIF - fiscalProfile.colaDampeningThreshold;
    const dampenIntensity = dampenRange > 0
      ? Math.min(1, (cumulativeInflationFactor - fiscalProfile.colaDampeningThreshold) / dampenRange)
      : 1.0;
    const dampenFactor = 1.0 - dampenIntensity * fiscalProfile.colaDampeningRate;
    const growth = cumulativeInflationFactor - 1.0;
    effectiveCIF = 1.0 + growth * dampenFactor;
  }
  const baselineTransfers = BASELINE_TRANSFER_INCOME * effectiveCIF * cumulativeProductivityFactor;
  const incrementalUnemployment = Math.max(0, totalUnemployment - BASELINE_UNEMPLOYMENT);
  const aggregateTransferIncome = baselineTransfers
    + incrementalUnemployment * BASELINE_TRANSFER_PER_UNEMPLOYED
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
    previousMacro?.realGDPGrowthRate ?? (previousMacro?.gdpGrowthRate ?? baselineGDPGrowth),
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
  let housingWealthResult: { housingWealthDrag: number; homePriceChangeRate: number } = {
    housingWealthDrag: 0, homePriceChangeRate: 0.01,
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
    consumption = wageConsumption + assetConsumption + transferConsumption;
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

    // Phase 8 Fix 5: New 5-channel housing model replaces computeHousingWealthEffect().
    // GDP is NOT a direct input — it affects prices through income, foreclosures, and rates.
    const housingWealthMPCParam = inputs.housingWealthMPC ?? DEFAULT_HOUSING_WEALTH_MPC;

    // Foreclosure supply pressure: reuse the same formula from the old function
    const rawForeclosurePressure = -inputForeclosureRate * 3.0;
    const institutionalDemand = inputForeclosureRate * instBuyerRate * 3.0;
    const housingForeclosureSupply = rawForeclosurePressure + institutionalDemand;

    // Mortgage rate change (YoY) — primary housing driver
    // Previous mortgage rate is passed from simulation.ts (from last year's bond market)
    const prevMortgageRate = inputs.prevMortgageRate ?? inputMortgageRate;
    computedMortgageRateChange = (inputMortgageRate ?? 0) - (prevMortgageRate ?? 0);

    // Real income growth (YoY) — current real household income vs previous
    const currentRealHouseholdIncome = (afterTaxWageIncome + afterTaxTransferIncome + afterTaxAssetIncome) / priceLevel;
    const prevRealHouseholdIncome = previousMacro
      ? (previousMacro.afterTaxWageIncome + previousMacro.afterTaxTransferIncome + previousMacro.afterTaxAssetIncome) / previousMacro.priceLevel
      : currentRealHouseholdIncome;
    computedRealIncomeGrowthRate = prevRealHouseholdIncome > 0
      ? (currentRealHouseholdIncome - prevRealHouseholdIncome) / prevRealHouseholdIncome
      : 0;

    // Affordability deviation: normalized price-to-income vs baseline
    // baselineRatio = 1.0 / baselineRealIncome (at year 0, homePriceIndex = 1.0)
    // currentRatio = homePriceIndex / currentNormalizedIncome
    // deviation = 1.0 - currentRatio (positive = cheap, negative = expensive)
    const baselineRealIncome = inputs.baselineRealHouseholdIncome ?? currentRealHouseholdIncome;
    const normalizedIncome = baselineRealIncome > 0
      ? currentRealHouseholdIncome / baselineRealIncome
      : 1.0;
    computedAffordabilityDeviation = normalizedIncome > 0
      ? 1.0 - (computedHomePriceIndex / normalizedIncome)
      : 0;

    // Population growth rate for demographic demand
    const popGrowthRate = inputs.populationGrowthRate ?? DEFAULT_POPULATION_GROWTH_RATE;

    // Call the new 5-channel housing model
    const homePriceChangeRate = computeHomePriceChange(
      computedMortgageRateChange,
      computedRealIncomeGrowthRate,
      housingForeclosureSupply,
      popGrowthRate,
      computedAffordabilityDeviation,
      inputs.affordabilityPriceSensitivity ?? DEFAULT_AFFORDABILITY_PRICE_SENSITIVITY,
      inputs.incomeHousingElasticity ?? DEFAULT_INCOME_HOUSING_ELASTICITY,
      inputs.affordabilityReversionSensitivity ?? DEFAULT_AFFORDABILITY_REVERSION_SENSITIVITY,
      inputs.demographicHousingElasticity ?? DEFAULT_DEMOGRAPHIC_HOUSING_ELASTICITY,
      inputs.downwardStickinessRatio ?? DEFAULT_DOWNWARD_STICKINESS_RATIO,
    );

    // Update cumulative home price index
    computedHomePriceIndex *= (1 + homePriceChangeRate);

    // Compute wealth drag from price change (same as old function)
    const wealthChange = BASELINE_HOUSING_WEALTH * homePriceChangeRate;
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
    const obligationG = G_OBLIGATION_SHARE * BASELINE_GOVT_SPENDING_2025 * effectiveCIF * consolidationObligationMult;
    const revenueSensitiveG = G_REVENUE_SENSITIVE_SHARE * prevNominalGDP * GOVERNMENT_SPENDING_GDP_FRACTION * consolidationDiscretionaryMult;
    governmentSpending = obligationG + revenueSensitiveG;

    consumption = Math.max(0, adjustedConsumption);
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
    secondOrderParams.transferGrowthPerUEPoint,
    policyEffects.fiscalCost,
  );

  const gdpGrowthRate = prevNominalGDP > 0 && !isFirstYear
    ? (gdpNominal - prevNominalGDP) / prevNominalGDP
    : baselineGDPGrowth;

  // Phase 8a: Real GDP growth rate — deflated, for revenue pressure and reporting
  const prevRealGDP = previousMacro?.gdpReal ?? gdpReal;
  const realGDPGrowthRate = prevRealGDP > 0 && !isFirstYear
    ? (gdpReal - prevRealGDP) / prevRealGDP
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

  // === Phase 5g Change 6: Corporate Profits (bottom-up) ===
  // AI profits = AI GDP × AI margin. Traditional = (GDP - AI GDP) × traditional margin.
  // Soft cap: profits ≤ GDP - total wage bill (accounting identity).
  // When cap bites, re-proportion: AI keeps its share, traditional gets remainder.
  // Phase 9: Labs absorb supply chain costs not passed through → margin reduction
  const aiProfitMargin = Math.max(0, inputAiProfitMargin + inputLabProfitMarginAdjustment);
  const rawAiProfits = aiGDPContribution * aiProfitMargin;
  const traditionalGDP = Math.max(0, gdpNominal - aiGDPContribution);
  // Phase 9 Fix: Automation dividend — deployers' cost savings from replacing labor with AI.
  // Positive when AI is cheaper than humans, negative under supply shocks (margin compression).
  // Augmentation profit boost: firms' share of output gains from AI-augmented remaining workers.
  const rawTraditionalProfits = traditionalGDP * traditionalProfitMargin
    + inputAutomationDividend + inputAugmentationProfitBoost;
  const rawTotalProfits = rawAiProfits + rawTraditionalProfits;
  const totalWageBill = aggregateWageIncome;
  const maxProfits = Math.max(0, gdpNominal - totalWageBill);
  const corporateProfits = Math.min(rawTotalProfits, maxProfits);
  // Re-proportion: AI takes up to its raw value (capped at total), traditional gets remainder
  const aiCorporateProfits = Math.min(rawAiProfits, corporateProfits);
  const traditionalCorporateProfits = Math.max(0, corporateProfits - aiCorporateProfits);
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
    wagePressure,
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
    nominalWageGrowth: 0,  // Overridden in simulation.ts macroWithJobs
    // Phase 10.A: α driver inputs + cumulative AI displacement
    corporateMarginRatio: gdpNominal > 0 ? corporateProfits / gdpNominal : 0,
    aiDisplacementUnemployment: 0,  // Overridden in simulation.ts (cumulative across years)
  };
}
