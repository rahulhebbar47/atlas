/**
 * ATLAS Simulation Orchestrator
 *
 * Master time loop that chains all models together per DATA_MODEL.md Section 10.
 * Iterates year by year from startYear to endYear, computing all outputs.
 *
 * Time loop order (DATA_MODEL.md §10.1):
 *   1. Update capability scores
 *   2. Compute BFCS scores for all occupation-roles
 *   3. Check adoption triggers
 *   4. Compute adoption rates (with competitive + revenue pressure feedback)
 *   5. Compute task erosion, headcount reduction, wage depression
 *   6. Compute new job creation and survivability
 *   7. Aggregate to total employment, average wages
 *   8. Compute CWI (Consumer Welfare Index), price level, GDP
 *   9. Compute AI GDP contribution and cycle phase
 *   10. Apply policy effects
 *   11. Store all outputs
 *
 * All functions are PURE — no side effects, no state mutation.
 */

import type {
  SimulationConfig,
  SimulationTimeline,
  SimulationYearOutput,
  SimulationSummary,
  ClusterDisplacementResult,
  OccupationCluster,
  OccupationBaseline,
  CapabilityVectorId,
  MacroOutput,
  MacroInputs,
  MacroProductionInputs,
  PolicyEffects,
  RoleBFCSOutput,
  StateData,
  StateCode,
  SecondOrderEffectParams,
  YearParameters,
  YearSnapshot,
  UserOverrideMap,
  SupplyChainInputs,
  SupplyChainEffects,
  AdoptionState,
} from '@/types';
import {
  DEFAULT_START_YEAR,
  DEFAULT_END_YEAR,
  US_POPULATION_2025,
  US_LABOR_FORCE_2025,
  BASELINE_TOTAL_EMPLOYMENT,
  BASELINE_CPS_EMPLOYMENT,
  BASELINE_AVERAGE_ANNUAL_WAGE,
  BASELINE_GDP_NOMINAL_2025,
  BASELINE_CONSUMPTION_2025,
  BASELINE_GOVT_SPENDING_2025,
  BASELINE_INVESTMENT_2025,
  BASELINE_MONEY_SUPPLY,
  BASELINE_VELOCITY_OF_MONEY,
  DEFAULT_CAPABILITY_TRAJECTORIES,
  DEFAULT_ADOPTION_PARAMS,
  DEFAULT_POLICY_CONFIG,
  DEFAULT_INNOVATION_RATE,
  DEFAULT_RD_MULTIPLIER,
  DEFAULT_JOB_PERSISTENCE_FACTOR,
  BASE_INFLATION_RATE,
  // DEPRECATED: MPC_WAGE, MPC_ASSET, MPC_TRANSFER, PROFIT_REALIZATION_SENSITIVITY no longer imported
  BASELINE_GDP_GROWTH_RATE,
  NON_CLUSTER_EMPLOYED,
  DEMAND_FEEDBACK_SENSITIVITY,
  CREDIT_UE_SENSITIVITY,
  MAX_CREDIT_TIGHTENING,
  CREDIT_INVESTMENT_SENSITIVITY,
  CREDIT_CONSUMPTION_SENSITIVITY,
  BASELINE_GOVT_TRANSFERS,
  BASELINE_DEBT_INTEREST,
  TRANSFER_GROWTH_PER_UE_POINT,
  DISCRETIONARY_SHARE_OF_G,
  DEFERRABLE_CONSUMPTION_SHARE,
  DEFLATION_MIDPOINT,
  DEFLATION_STEEPNESS,
  PHILLIPS_CURVE_SENSITIVITY,
  NATURAL_UNEMPLOYMENT_RATE,
  REVENUE_PRESSURE_SENSITIVITY_DEFAULT,
  REVENUE_PRESSURE_CAP,
  REVENUE_PRESSURE_DECAY,
  AI_WAGE_PRODUCTIVITY_MULTIPLIER,
  AI_PRODUCTIVITY_MULTIPLIER_BY_DEPLOYMENT,
  DEFAULT_AI_PRODUCTION_INVESTMENT_FRACTION,
  DEFAULT_AI_PRODUCTION_ONSHORING_FRACTION,
  DEFAULT_NEW_JOB_WAGE_FRACTION,
  DEFAULT_AUGMENTATION_MULTIPLIER,
  PREP_WINDOW_UE_RISE_THRESHOLD,
  // DEPRECATED: Fiscal window now uses GDP growth rate, not AI GDP threshold / GDP decline threshold
  // FISCAL_WINDOW_AI_GDP_THRESHOLD,
  // FISCAL_WINDOW_GDP_DECLINE_THRESHOLD,
  EMPLOYMENT_MULTIPLIERS,
  SIMPLE_AVG_EMPLOYMENT_MULTIPLIER,
  DEFAULT_POPULATION_GROWTH_RATE,
  DEFAULT_VELOCITY_SENSITIVITY,
  VELOCITY_FLOOR_RATIO,
  DEFAULT_AI_PROFIT_MARGIN,
  DEFAULT_TRADITIONAL_PROFIT_MARGIN,
  DEFAULT_INFERENCE_ANNUAL_CHANGE,
  DEFAULT_MANUFACTURING_ANNUAL_CHANGE,
  DEFAULT_ENERGY_ANNUAL_CHANGE,
  AI_COST_COMPOSITION,
  DEFAULT_WAGE_PASS_THROUGH,
  DEFAULT_WAGE_AUTOMATION_SENSITIVITY,
  DEFAULT_CREDIT_DEFLATION_SENSITIVITY,
  DEFAULT_SCARCITY_PASS_THROUGH,
  DEFAULT_PARTICIPATION_ELASTICITY,
  DEFAULT_PARTICIPATION_THRESHOLD,
  MORTGAGE_EXPOSURE_QUINTILES,
  DEFAULT_FORECLOSURE_LAG,
  DEFAULT_HOMEOWNERSHIP_RECOVERY_RATE,
  DEFAULT_MORTGAGE_STRESS_AMPLIFIER,
  DEFAULT_CREDIT_ADOPTION_SENSITIVITY,
  // Phase 5-tax imports
  BASELINE_WAGE_SHARE,
  BASELINE_PAYROLL_RATE,
  EMPLOYER_EMPLOYEE_SPLIT,
  BASELINE_INCOME_TAX_RATE,
  BASELINE_CORPORATE_TAX_RATE,
  BASELINE_CAPITAL_GAINS_RATE,
  BASELINE_CORPORATE_RETENTION_RATE,
  DEFAULT_AI_PROFIT_GROWTH_RATE,
  DEFAULT_POST_TAX_MPC_WAGE,
  DEFAULT_POST_TAX_MPC_ASSET,
  DEFAULT_POST_TAX_MPC_TRANSFER,
  STATE_LOCAL_TAX_RATE,
  TRANSFER_TAX_RATE,
  DEFAULT_TRANSFER_RELIABILITY_WEIGHT,
  ASSET_INCOME_UNDERWRITING_WEIGHT,
  // Phase 7: Fiscal-Monetary constants
  INITIAL_FEDERAL_DEBT,
  INITIAL_10Y_YIELD,
  INITIAL_WEIGHTED_AVG_DEBT_RATE,
  BASELINE_PRIMARY_DEFICIT_GDP_RATIO,
  BASELINE_DEFICIT_GDP_RATIO,
  BASELINE_MORTGAGE_SPREAD,
  BASE_CORPORATE_SPREAD,
  BASELINE_CORPORATE_PROFITS,
  // DEPRECATED Phase 8 Fix 4: NEUTRAL_REAL_RATE and TERM_PREMIUM now configurable via SimulationConfig
  // NEUTRAL_REAL_RATE,
  // TERM_PREMIUM,
  DEBT_ROLLOVER_RATE, // DEPRECATED Phase 8 Fix 3: replaced by computeEndogenousRolloverRate()
  EQUITY_RISK_PREMIUM,
  FRED_NAIRU_RATE,
  // DEFAULT_PHILLIPS_CURVE_WAGE_SENSITIVITY, // DEPRECATED: wage growth chain removed
  // Phase 10.A constants
  DEFAULT_COGNITIVE_ALPHA,
  DEFAULT_ALPHA_DRIVER_PARAMS,
  DEFAULT_AUGMENTATION_ADOPTION_STEEPNESS,
  DEFAULT_SCARCITY_INTENSITY,
  DEFAULT_REPLACEMENT_MULTIPLIER,
  // DEPRECATED (Phase 10.A fix #2): DEFAULT_MAX_ADOPTION_FRICTION_YEARS no longer read.
  DEFAULT_COMPETITIVE_PRESSURE_THRESHOLD,
  ALPHA_BASELINE_CORPORATE_MARGIN,
  DEFAULT_AI_COST_PARAMS,
} from './constants';
import { getAllCapabilityScores, computeWeightedCapability } from './capabilities';
import { checkAdoptionTrigger, findTriggerYear } from './bfcs';
import { computeEffectiveAlpha, computePeerAlpha, buildClusterEmploymentMap } from './alphaDrivers';
import { computeAugmentationAdoption } from './augmentationAdoption';
import { getAdoptionRate } from './adoption';
import { computeClusterDisplacement, computeSimplifiedDisplacement } from './displacement';
import { computeAggregateDisplacement } from './multipliers';
import {
  computePolicyEffects,
  computeRequiredAssetOwnership,
  computeRequiredTransferLevel,
  getEffectiveUBI,
} from './policy';
import { computeMonetaryState, getBaselineMonetaryState, computeDynamicVelocity, computeEndogenousFundingSplit } from './monetary';
// Phase 7: Fiscal-Monetary System imports
import { computeEndogenousRevenue, computeGovernmentSpending, computeDebtAccumulation, computeWeightedAverageDebtRate, computeEndogenousRolloverRate, getBaselineFiscalState } from './fiscal';
// DEPRECATED Phase 8 Fix 4: resolveFiscalProfile and DEFAULT_FISCAL_RESPONSE_PROFILE replaced by split presets
// import { resolveFiscalProfile, DEFAULT_FISCAL_RESPONSE_PROFILE } from './fiscalResponseProfiles';
import { resolveCombinedProfile, DEFAULT_FISCAL_POLICY_PRESET, DEFAULT_FEDERAL_RESERVE_PRESET } from './fiscalResponseProfiles';
import { computeFullEmploymentGDP, computeTaylorRule, computeFiscalDominance, getBaselineFederalReserveState } from './federalReserve';
import { computeMonetizationRate, computeMoneyCreation, getBaselineMonetizationState } from './monetization';
import { computeFiscalRiskPremium, computeForeignDemand, computeExpectedPolicyRates, computeAbsorptionCapacity, computeTenYearYield, computeRateTransmission, getBaselineBondMarketState } from './bondMarket';
import { computeGrowthMomentum, computeEquityValuation, getBaselineEquityMarketState } from './equityMarket';
import type { FiscalMonetaryOutput } from '@/types';
import { computeNewJobMetrics } from './newJobs';
import {
  computeMacro,
  // computeNominalWageGrowth, // DEPRECATED: wage growth chain removed
  computeSectorWeightedDeflation,
  computeAutomationCoverageFromClusters,
  mapClustersToQuintiles,
  computeMortgageStressIndex,
  updateHomeownership,
} from './macro';
// SecondOrderEffectParams now imported from @/types (Phase 5g Step 0)
import { computeStateOutputs } from './stateSimulation';
import { interpolatePolicy } from '@/utils/policyInterpolation';
// Phase 8b: Autopilot + parameter resolution
import { computeAutopilotParameters, getBaselineAutopilot, getBaselineTaxRates } from './autopilot';
import { resolveAllParameters, resolveParameter, defaultTokenUsageMultiplier } from './parameterResolution';
// Phase 9: Supply chain
import {
  computeSupplyChainEffects,
  applyPropagationLags,
  computeFasterMultiplier,
  computeSaferMultiplier,
  computeAdoptionDrag,
  computeHysteresisWidth,
  computeStatefulAdoptionRate,
} from './supplyChain';

/**
 * Get default simulation configuration.
 */
export function getDefaultSimulationConfig(): SimulationConfig {
  return {
    startYear: DEFAULT_START_YEAR,
    endYear: DEFAULT_END_YEAR,
    capabilities: { ...DEFAULT_CAPABILITY_TRAJECTORIES },
    adoptionParams: { ...DEFAULT_ADOPTION_PARAMS },
    policyConfig: { ...DEFAULT_POLICY_CONFIG },
    baseInflationRate: BASE_INFLATION_RATE,
    // DEPRECATED: pre-tax MPCs no longer set — consumption uses postTaxMPCs (Phase 5-tax)
    baselineGDPGrowth: BASELINE_GDP_GROWTH_RATE,
    totalPopulation: US_POPULATION_2025,
    laborForce: US_LABOR_FORCE_2025,
    innovationRate: DEFAULT_INNOVATION_RATE,
    rdMultiplier: DEFAULT_RD_MULTIPLIER,
    jobPersistenceFactor: DEFAULT_JOB_PERSISTENCE_FACTOR,
    bfcsOverrides: {},
    stateOverrides: {},
    // Phase 7: Fiscal-Monetary defaults
    // DEPRECATED Phase 8 Fix 4: taylorInflationCoeff and taylorOutputGapCoeff moved to FederalReserveProfile
    // taylorInflationCoeff: 1.5,
    // taylorOutputGapCoeff: 0.5,
    inflationTarget: 0.02,
    effectiveLowerBound: -0.005,
    fiscalDominanceThreshold: 0.25,
    fiscalDominanceDampening: 0.5,
    // DEPRECATED Phase 8 Fix 4: fiscalRiskPremiumMidpoint replaced by fiscalRiskLevelMidpoint
    // fiscalRiskPremiumMidpoint: 1.20,
    fiscalRiskPremiumMax: 0.06, // Phase 8 Fix 4: increased from 0.04 — composite model distributes across 3 components
    corporateTaxEffectiveness: 0.65,
    foreignTreasuryDemand: 0.30,
    aiPEMultiplier: 1.0,
    qeMonetizationRate: 0.40,
    consolidationCreditMax: 0.40,
    // Phase 8 Fix 3: Bond market absorption capacity
    supplyPressureSensitivity: 1.0,
    safetyFlightSensitivity: 1.5,
    yieldAttractionMidpoint: 0.06,
    inflationDeterrentSensitivity: 1.0,
    sovereignConfidenceDecayRate: 2.0,
    // Phase 8 Fix 3: Endogenous debt maturity
    baseWeightedAverageMaturity: 6.0,
    minWeightedAverageMaturity: 2.5,
    maxWeightedAverageMaturity: 8.0,
    maturityStressSensitivity: 1.0,
    // Phase 8 Fix 3: Monetization transmission
    monetizationTransmissionSensitivity: 1.0,
    // Phase 8a: Fiscal Response Profile
    // DEPRECATED Phase 8 Fix 4: fiscalResponseProfile replaced by independent presets
    // fiscalResponseProfile: DEFAULT_FISCAL_RESPONSE_PROFILE,
    // Phase 8 Fix 4: Independent fiscal + Fed presets
    fiscalPolicyPreset: DEFAULT_FISCAL_POLICY_PRESET,
    federalReservePreset: DEFAULT_FEDERAL_RESERVE_PRESET,
    // Phase 8 Fix 4: Yield calibration
    neutralRealRate: 0.007,
    termPremium: 0.003,
    inflationConvergenceYears: 5,
    // Phase 8 Fix 4: Fiscal risk premium weights
    fiscalRiskTrajectoryWeight: 0.50,
    fiscalRiskSustainabilityWeight: 0.35,
    fiscalRiskLevelWeight: 0.15,
    fiscalRiskLevelMidpoint: 2.0,
    augmentationMultiplier: DEFAULT_AUGMENTATION_MULTIPLIER,
    aiCostParams: { ...DEFAULT_AI_COST_PARAMS },
    // Phase 10.A: alpha drivers, augmentation, scarcity, inference curve, friction
    alphaDriverParams: { ...DEFAULT_ALPHA_DRIVER_PARAMS },
    augmentationAdoptionSteepness: DEFAULT_AUGMENTATION_ADOPTION_STEEPNESS,
    scarcityIntensity: DEFAULT_SCARCITY_INTENSITY,
    competitivePressureThreshold: DEFAULT_COMPETITIVE_PRESSURE_THRESHOLD,
    replacementMultiplier: DEFAULT_REPLACEMENT_MULTIPLIER,
    // DEPRECATED (Phase 10.A fix #2): maxAdoptionFrictionYears no longer in the config interface.
  };
}

// DEPRECATED: Phase 1 placeholder baseline estimation.
// Replaced in Phase 3 by real BLS data via the blsBaselines parameter to runSimulation().
// Kept as fallback for clusters without BLS data (gov_federal, gov_state_local).
function estimateBaselineForCluster(
  cluster: OccupationCluster,
  totalClusters: number,
): {
  employments: Record<string, number>;
  wages: Record<string, number>;
} {
  // Rough equal distribution across clusters, adjusted by multiplier importance
  const clusterShare = 1 / totalClusters;
  const clusterEmployment = BASELINE_TOTAL_EMPLOYMENT * clusterShare;

  const employments: Record<string, number> = {};
  const wages: Record<string, number> = {};

  for (const role of cluster.roles) {
    employments[role.id] = clusterEmployment * role.employmentShareEstimate;
    // Wage scales with seniority
    wages[role.id] = BASELINE_AVERAGE_ANNUAL_WAGE * (0.5 + role.seniorityLevel);
  }

  return { employments, wages };
}

/**
 * Build baseline employment and wages from BLS OccupationBaseline data.
 * Falls back to the deprecated estimator if no BLS data for this cluster.
 */
function getBaselineFromBLS(
  cluster: OccupationCluster,
  blsBaseline: OccupationBaseline,
): {
  employments: Record<string, number>;
  wages: Record<string, number>;
} {
  const employments: Record<string, number> = {};
  const wages: Record<string, number> = {};

  for (const role of cluster.roles) {
    const roleData = blsBaseline.roles[role.id];
    if (roleData && roleData.estimatedEmployment > 0) {
      employments[role.id] = roleData.estimatedEmployment;
      wages[role.id] = roleData.medianWage;
    } else {
      // Role not in BLS data — use 0 (will show as no employment for this role)
      employments[role.id] = 0;
      wages[role.id] = 0;
    }
  }

  return { employments, wages };
}

/**
 * Build a merged deflation intensity override map from clusterOverrides and legacy deflationIntensityOverrides.
 * clusterOverrides.deflationIntensity takes precedence over legacy deflationIntensityOverrides.
 */
function buildDeflationIntensityOverrides(
  config: SimulationConfig,
): Record<string, number> | undefined {
  const legacy = config.deflationIntensityOverrides;
  const clusterOvs = config.clusterOverrides;

  // Collect any deflationIntensity entries from clusterOverrides
  const fromCluster: Record<string, number> = {};
  let hasCluster = false;
  if (clusterOvs) {
    for (const [clusterId, ov] of Object.entries(clusterOvs)) {
      if (ov.deflationIntensity !== undefined) {
        fromCluster[clusterId] = ov.deflationIntensity;
        hasCluster = true;
      }
    }
  }

  if (!legacy && !hasCluster) return undefined;

  // Merge: legacy first, then clusterOverrides on top (takes precedence)
  return { ...legacy, ...fromCluster };
}

/**
 * Compute AI production expansion — how much MORE output AI produces
 * vs. the displaced human workers.
 *
 * Per-cluster: additionalOutput = displacedWorkers × avgWage × (effectiveProductivity - 1.0)
 * Aggregate: split into investment (I), net exports (NX), and consumer goods (tracked, not added to C).
 *
 * @param clusterResults - Displacement results for all clusters
 * @param clusters - Occupation clusters (for deployment type)
 * @param capabilityScores - Current capability scores per vector
 * @param config - Simulation config (for overrides and fractions)
 * @returns AI production expansion components
 */
export function computeAIProductionExpansion(
  clusterResults: ClusterDisplacementResult[],
  clusters: OccupationCluster[],
  capabilityScores: Record<CapabilityVectorId, number>,
  config: SimulationConfig,
  triggerBetterScores?: Record<string, Record<string, number | null>>,
): {
  aiInvestmentBoost: number;
  aiNetExportBoost: number;
  aiConsumerGoodsPotential: number;
  totalAdditionalOutput: number;
} {
  // Build cluster lookup for deployment type
  const clusterLookup = new Map<string, OccupationCluster>();
  for (const c of clusters) {
    clusterLookup.set(c.id, c);
  }

  const augMultiplier = config.augmentationMultiplier ?? DEFAULT_AUGMENTATION_MULTIPLIER;
  let totalAdditionalOutput = 0;

  for (const result of clusterResults) {
    const cluster = clusterLookup.get(result.clusterId);
    if (!cluster || result.totalDirectDisplacement <= 0) continue;

    // Compute weighted capability for this cluster
    const clusterOverride = config.clusterOverrides?.[result.clusterId];
    const effectiveWeights = clusterOverride
      ? {
          generative: clusterOverride.generativeWeight ?? cluster.capabilityRelevance.weights.generative,
          agentic: clusterOverride.agenticWeight ?? cluster.capabilityRelevance.weights.agentic,
          embodied: clusterOverride.embodiedWeight ?? cluster.capabilityRelevance.weights.embodied,
        }
      : cluster.capabilityRelevance.weights;
    const weightedCapability = computeWeightedCapability(capabilityScores, effectiveWeights);

    // DEPRECATED (Phase 10.A): deployment-type max-multiplier → capability-linear scaling.
    // const maxMult = clusterOverride?.maxProductivityMultiplier
    //   ?? AI_PRODUCTIVITY_MULTIPLIER_BY_DEPLOYMENT[cluster.deploymentType];
    // const effectiveProductivity = 1.0 + (maxMult - 1.0) * weightedCapability;
    //
    // Phase 10.A first-principles productivity formula:
    //   effectiveProductivity = 1 + weightedCapability × betterScore × replacementMultiplier × (1 + cheaperScore)
    // betterScore scales quality; cheaperScore scales throughput (AI at scale cheaper than human).
    // No arbitrary cap — extreme inputs produce extreme but coherent outputs (per Phase 10.A no-cap rule).
    // Uses employment-weighted averages across the cluster's roles.
    let clusterBetterSum = 0;
    let clusterCheaperSum = 0;
    let clusterBetterWeight = 0;
    for (const roleResult of result.roles) {
      const bfcs = result.bfcsOutput.find(b => b.roleId === roleResult.roleId);
      if (!bfcs) continue;
      const weight = roleResult.remainingEmployment + (clusterOverride ? 0 : 0);
      // Use direct-displacement weight + remaining weight — whole cluster sums, proxies role size.
      const roleWeight = Math.max(1, roleResult.remainingEmployment);
      clusterBetterSum += bfcs.scores.better * roleWeight;
      clusterCheaperSum += bfcs.scores.cheaper * roleWeight;
      clusterBetterWeight += roleWeight;
    }
    const betterScore = clusterBetterWeight > 0 ? clusterBetterSum / clusterBetterWeight : 0;
    const cheaperScore = clusterBetterWeight > 0 ? clusterCheaperSum / clusterBetterWeight : 0;
    const replacementMultiplier = config.replacementMultiplier ?? DEFAULT_REPLACEMENT_MULTIPLIER;
    const effectiveProductivity = 1
      + weightedCapability * betterScore * replacementMultiplier * (1 + cheaperScore);

    // Production continuity floor: AI output must at least match the augmented worker output.
    // Otherwise firms are making irrational decisions (replacing a human+AI combo
    // that produced more than AI alone). Uses weighted-average better score at trigger.
    let augFloor = 1.0;
    if (augMultiplier > 0 && triggerBetterScores?.[result.clusterId]) {
      const roleScores = triggerBetterScores[result.clusterId]!;
      let totalWeight = 0;
      let weightedBetter = 0;
      for (const role of cluster.roles) {
        const bs = roleScores[role.id];
        if (bs !== null && bs !== undefined) {
          const w = result.roles.find(r => r.roleId === role.id)?.displacementPct ?? 0;
          weightedBetter += bs * w;
          totalWeight += w;
        }
      }
      if (totalWeight > 0) {
        augFloor = 1.0 + (weightedBetter / totalWeight) * augMultiplier;
      }
    }
    const flooredProductivity = Math.max(effectiveProductivity, augFloor);

    // Additional output from AI doing the displaced workers' jobs more productively
    const additionalOutput = result.totalDirectDisplacement * result.averageWage * (flooredProductivity - 1.0);
    totalAdditionalOutput += additionalOutput;
  }

  // Split into GDP components
  const investFrac = config.aiProductionInvestmentFraction ?? DEFAULT_AI_PRODUCTION_INVESTMENT_FRACTION;
  const onshoreFrac = config.aiProductionOnshoringFraction ?? DEFAULT_AI_PRODUCTION_ONSHORING_FRACTION;
  const consumerFrac = Math.max(0, 1.0 - investFrac - onshoreFrac);

  return {
    aiInvestmentBoost: totalAdditionalOutput * investFrac,
    aiNetExportBoost: totalAdditionalOutput * onshoreFrac,
    aiConsumerGoodsPotential: totalAdditionalOutput * consumerFrac,
    totalAdditionalOutput,
  };
}

/**
 * Run the complete ATLAS simulation.
 *
 * @param config - Full simulation configuration
 * @param clusters - All occupation clusters
 * @param blsBaselines - Optional real BLS employment/wage baselines per cluster (Phase 3+)
 * @param stateDataMap - Optional state-level baseline data (Phase 6)
 * @returns Complete SimulationTimeline with all yearly outputs
 */
export function runSimulation(
  config: SimulationConfig,
  clusters: OccupationCluster[],
  blsBaselines?: Map<string, OccupationBaseline>,
  stateDataMap?: Map<StateCode, StateData>,
  userOverrides?: UserOverrideMap,
): SimulationTimeline {
  const years: SimulationYearOutput[] = [];
  let previousMacro: MacroOutput | null = null;
  let previousFundSize = config.policyConfig.sovereignWealthFund.initialFundSize;
  let previousMoneySupply = BASELINE_MONEY_SUPPLY;
  let previousTransferInflation = 0; // One-year lag: monetary module's actualInflationFromTransfers feeds into next year's price computation

  // Phase 8 Fix 4: Resolve combined fiscal + Fed profile from independent presets
  // DEPRECATED: const fiscalProfile = resolveFiscalProfile(config.fiscalResponseProfile, ...)
  const fiscalProfile = resolveCombinedProfile(
    config.fiscalPolicyPreset ?? DEFAULT_FISCAL_POLICY_PRESET,
    config.federalReservePreset ?? DEFAULT_FEDERAL_RESERVE_PRESET,
    config.fiscalPolicyCustom,
    config.federalReserveCustom,
  );

  // Phase 8a: Track debt/GDP history for consolidation lag
  const debtGDPHistory: number[] = [];

  // Phase 8b: Parameter timeline and snapshot storage
  const overrides: UserOverrideMap = userOverrides ?? new Map();
  const parameterTimeline = new Map<number, YearParameters>();
  const yearSnapshots = new Map<number, YearSnapshot>();
  // Phase 8 Fix 4: Profile name from split presets
  const profileName = `${config.fiscalPolicyPreset ?? DEFAULT_FISCAL_POLICY_PRESET} + ${config.federalReservePreset ?? DEFAULT_FEDERAL_RESERVE_PRESET}`;
  const baselineTaxRates = getBaselineTaxRates(config);

  // Track trigger years per cluster-role (persists across years)
  const triggerYears: Record<string, Record<string, number | null>> = {};
  // Track better score at trigger time (for augmentation → displacement production floor)
  const triggerBetterScores: Record<string, Record<string, number | null>> = {};
  // Phase 10.A — augmentation trigger years per cluster-role (persists across years)
  const augTriggerYears: Record<string, Record<string, number | null>> = {};
  // Phase 10.A — prior-year α by cluster (for peer-α competitive driver) and by role (for diagnostics)
  const priorYearAlphaByCluster = new Map<string, number>();
  const priorYearAlphaByRole: Record<string, Record<string, number>> = {};
  // Phase 10.A — prior-year per-cluster scarcity wage adjustment (one-year lag into next year's Cheaper)
  const priorYearWageAdjustmentByCluster = new Map<string, number>();
  // Phase 10.A — current-year AI-displacement stock (NOT cumulative; reset each year).
  // totalDirectDisplacement on each cluster is already `baseline - remaining`, i.e. a stock measure.
  // Summing stocks across years would give a meaningless multi-counted flow total.
  // This variable is assigned fresh each year from yearNewDisplacedHeadcount (no `+=`).
  let currentYearAiDisplacementStock = 0;

  for (const cluster of clusters) {
    triggerYears[cluster.id] = {};
    triggerBetterScores[cluster.id] = {};
    augTriggerYears[cluster.id] = {};
    priorYearAlphaByRole[cluster.id] = {};
    for (const role of cluster.roles) {
      triggerYears[cluster.id]![role.id] = null;
      triggerBetterScores[cluster.id]![role.id] = null;
      augTriggerYears[cluster.id]![role.id] = null;
      priorYearAlphaByRole[cluster.id]![role.id] =
        role.automationShareOverride ?? cluster.automationShare ?? DEFAULT_COGNITIVE_ALPHA;
    }
    priorYearAlphaByCluster.set(
      cluster.id,
      cluster.automationShare ?? DEFAULT_COGNITIVE_ALPHA,
    );
    priorYearWageAdjustmentByCluster.set(cluster.id, 0);
  }

  // Pre-compute baseline employments and wages per cluster.
  // Phase 3+: uses real BLS data when available, falls back to Phase 1 estimator.
  const baselines = new Map<string, { employments: Record<string, number>; wages: Record<string, number> }>();
  for (const cluster of clusters) {
    const blsBaseline = blsBaselines?.get(cluster.id);
    if (blsBaseline) {
      baselines.set(cluster.id, getBaselineFromBLS(cluster, blsBaseline));
    } else {
      // DEPRECATED fallback: equal distribution (Phase 1 estimator)
      baselines.set(cluster.id, estimateBaselineForCluster(cluster, clusters.length));
    }
  }

  // FIX 6: Normalize baseline employment so sum equals BASELINE_TOTAL_EMPLOYMENT (158.3M).
  // BLS OEWS data sums to ~168M (close to labor force), but total nonfarm employment is 158.3M.
  // The gap (labor_force - employment ≈ 9.7M) represents baseline unemployment.
  let rawTotalBaselineEmployment = 0;
  for (const [, bl] of baselines) {
    for (const roleId of Object.keys(bl.employments)) {
      rawTotalBaselineEmployment += bl.employments[roleId] ?? 0;
    }
  }

  if (rawTotalBaselineEmployment > 0) {
    const scaleFactor = BASELINE_TOTAL_EMPLOYMENT / rawTotalBaselineEmployment;
    if (Math.abs(scaleFactor - 1.0) > 0.001) {
      for (const [, bl] of baselines) {
        for (const roleId of Object.keys(bl.employments)) {
          bl.employments[roleId] = (bl.employments[roleId] ?? 0) * scaleFactor;
        }
      }
    }
  }

  // FIX C: Compute actual baseline weighted-average wage from (possibly normalized) BLS data.
  // This ensures wageRatio = 1.0 at t=0, maintaining the exact 60/20/20 income split.
  // Without this, the BLS per-cluster median wages (~$66.6K) differ from the OEWS national
  // mean ($65,470), inflating wageIncome by ~$319B and skewing shares to 60.4/19.8/19.8.
  let baselineWageWeightedSum = 0;
  let baselineTotalEmp = 0;
  for (const [, bl] of baselines) {
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

  // Phase 10.A — cluster employment map for peer-α weighted mean.
  // Computed once from baselines; simulation.ts treats baseline employment as the weighting
  // universe for cross-cluster peer signals (stable across years; year-over-year changes in
  // actual employment are driven by AI displacement which is already captured in the α itself).
  const phaseABaselinesForEmployment = new Map<string, { totalEmployment: number }>();
  for (const cluster of clusters) {
    const bl = baselines.get(cluster.id);
    if (!bl) continue;
    let total = 0;
    for (const k of Object.keys(bl.employments)) total += bl.employments[k] ?? 0;
    phaseABaselinesForEmployment.set(cluster.id, { totalEmployment: total });
  }
  const clusterEmploymentByCluster = buildClusterEmploymentMap(
    clusters,
    phaseABaselinesForEmployment as Map<string, OccupationBaseline>,
  );

  // Build second-order effect params from config (optional fields → constant fallbacks)
  const secondOrderParams: SecondOrderEffectParams = {
    demandFeedbackSensitivity: config.demandFeedbackSensitivity ?? DEMAND_FEEDBACK_SENSITIVITY,
    // DEPRECATED Phase 6: credit sensitivity now in separate consumer/business credit functions
    // creditUESensitivity: config.creditUESensitivity ?? CREDIT_UE_SENSITIVITY,
    // maxCreditTightening: config.maxCreditTightening ?? MAX_CREDIT_TIGHTENING,
    // creditInvestmentSensitivity: config.creditInvestmentSensitivity ?? CREDIT_INVESTMENT_SENSITIVITY,
    // creditConsumptionSensitivity: config.creditConsumptionSensitivity ?? CREDIT_CONSUMPTION_SENSITIVITY,
    baselineGovtTransfers: BASELINE_GOVT_TRANSFERS,
    baselineDebtInterest: BASELINE_DEBT_INTEREST,
    transferGrowthPerUEPoint: TRANSFER_GROWTH_PER_UE_POINT,
    discretionaryShareOfG: DISCRETIONARY_SHARE_OF_G,
    // Phase 4 quality pass: S-curve deflation velocity
    deferrableConsumptionShare: config.deferrableConsumptionShare ?? DEFERRABLE_CONSUMPTION_SHARE,
    deflationMidpoint: config.deflationMidpoint ?? DEFLATION_MIDPOINT,
    deflationSteepness: config.deflationSteepness ?? DEFLATION_STEEPNESS,
    // Phase 4 quality pass: exponential Phillips curve
    phillipsCurveSensitivity: config.phillipsCurveSensitivity ?? PHILLIPS_CURVE_SENSITIVITY,
    revenuePressureSensitivity: config.revenuePressureSensitivity ?? REVENUE_PRESSURE_SENSITIVITY_DEFAULT,
    revenuePressureCap: config.revenuePressureCap ?? REVENUE_PRESSURE_CAP,
    revenuePressureDecay: config.revenuePressureDecay ?? REVENUE_PRESSURE_DECAY,
    aiWageProductivityMultiplier: config.aiWageProductivityMultiplier ?? AI_WAGE_PRODUCTIVITY_MULTIPLIER,
  };

  // Accumulate depression info
  let depressionOnsetYear: number | null = null;
  let monetaryCollapseYear: number | null = null;

  // Baseline CWI from year 0 — used as the target for required ownership/transfer calculations.
  // IMPORTANT: This is the CWI before any displacement, so the required levels reflect what's
  // needed to maintain the original living standard, not the declining one.
  let baselineCWI: number | null = null;

  // Phase 5h (Fix 2 + Fix 9): effectiveClusters — single source of truth for employment multipliers.
  // Overrides cluster.employmentMultiplier with the authoritative value from EMPLOYMENT_MULTIPLIERS constant.
  // For other_uncategorized: uses employment-weighted average of all other clusters (or user override).
  // Also applies Fix 12: demand share normalization on the copies (not original clusters).

  // Compute employment-weighted average multiplier for other_uncategorized
  const multiplierEntries = Object.entries(EMPLOYMENT_MULTIPLIERS)
    .filter(([id]) => id !== 'other_uncategorized');
  let totalBaselineEmpForMult = 0;
  for (const [id] of multiplierEntries) {
    const bl = baselines.get(id);
    if (bl) {
      for (const emp of Object.values(bl.employments)) {
        totalBaselineEmpForMult += emp;
      }
    }
  }
  const weightedAvgMultiplier = totalBaselineEmpForMult > 0
    ? multiplierEntries.reduce((sum, [id, mult]) => {
        const bl = baselines.get(id);
        if (!bl) return sum;
        let clusterEmp = 0;
        for (const emp of Object.values(bl.employments)) {
          clusterEmp += emp;
        }
        return sum + mult * (clusterEmp / totalBaselineEmpForMult);
      }, 0)
    : SIMPLE_AVG_EMPLOYMENT_MULTIPLIER; // fallback if no BLS data

  const otherMultiplier = config.otherUncategorizedMultiplierOverride ?? weightedAvgMultiplier;

  const effectiveClusters = clusters.map(c => {
    // Fix 9: Authoritative multiplier from EMPLOYMENT_MULTIPLIERS constant
    const mult = c.id === 'other_uncategorized'
      ? otherMultiplier
      : (EMPLOYMENT_MULTIPLIERS[c.id] ?? c.employmentMultiplier);

    // Fix 12: Normalize demand shares if consumer + gov > 1.0
    let cShare = c.consumerDemandShare;
    let gShare = c.govDemandShare;
    const shareSum = cShare + gShare;
    if (shareSum > 1.0 + 0.001) {
      console.warn(
        `[ATLAS] Demand shares for ${c.id}: consumer(${cShare}) + ` +
        `gov(${gShare}) = ${shareSum.toFixed(4)} > 1.0. Normalizing.`,
      );
      cShare = cShare / shareSum;
      gShare = gShare / shareSum;
    }

    // Phase 10.A — apply user overrides from config before downstream reads.
    const clusterAlphaOverride = config.clusterAutomationShareOverrides?.[c.id];
    const roleAlphaOverrides = config.roleAutomationShareOverrides?.[c.id];
    const roleFrictionYearsOverrides = config.roleReplacementFrictionYearsOverrides?.[c.id];
    const roleWagePremiumOverrides = config.roleReplacementDifficultyWagePremiumOverrides?.[c.id];

    const effectiveRoles = c.roles.map(r => ({
      ...r,
      automationShareOverride: roleAlphaOverrides?.[r.id] ?? r.automationShareOverride,
      aiReplacementFrictionYears:
        roleFrictionYearsOverrides?.[r.id] ?? r.aiReplacementFrictionYears,
      aiReplacementDifficultyWagePremium:
        roleWagePremiumOverrides?.[r.id] ?? r.aiReplacementDifficultyWagePremium,
    }));

    return {
      ...c,
      employmentMultiplier: mult,
      consumerDemandShare: cShare,
      govDemandShare: gShare,
      automationShare: clusterAlphaOverride ?? c.automationShare,
      roles: effectiveRoles,
    };
  });

  // Track nominal GDP history for rolling average demand feedback (Phase 1 overhaul)
  const nominalGDPHistory: number[] = [];

  // Phase 5g Step 3: Track baseline consumption for dynamic velocity
  let baselineConsumption: number | null = null;

  // Demand spillover: capture year-0 real C/G/I as baselines for demand ratios.
  // BEA constants (BASELINE_CONSUMPTION_2025 etc.) don't match the model's year-0 output
  // exactly (due to credit dampening, capacity gates, etc.), creating a persistent gap
  // that triggers false demand spillover. Using year-0 output ensures ratios start at 1.0.
  let demandBaselineRealC: number | null = null;
  let demandBaselineRealG: number | null = null;
  let demandBaselineRealI: number | null = null;

  // Capacity gate baseline: capture year-0 credit-funded investment from endogenous profits.
  // BASELINE_CREDIT_FUNDED = BASELINE_INVESTMENT - BASELINE_RETAINED_EARNINGS, where
  // BASELINE_RETAINED_EARNINGS uses BASELINE_PROFIT_GDP_RATIO (0.13, BEA). But the model's
  // endogenous corporateProfits uses DEFAULT_TRADITIONAL_PROFIT_MARGIN (0.11), producing
  // lower profits → lower retainedEarnings at t=1. The hardcoded creditCapacity baseline
  // doesn't absorb this difference, so investmentCapacity drops below investmentDemand,
  // triggering the capacityGate and reducing investment ~$73B in a healthy economy.
  // Fix: capture actual credit-funded portion from year 0's endogenous profits.
  let capturedBaselineCreditFunded: number | null = null;

  // Phase 6: Baseline captures for consumer & business credit
  let baselineHouseholdIncome: number | null = null;
  let baselineCorporateProfits: number | null = null;
  // Separate credit-adjusted CWI baseline (grows with real GDP to avoid artificial systemic tightening)
  let creditBaselineCWI: number | null = null;

  // Phase 5g Step 7: Track AI GDP at UBI index start year for productivity indexing
  let startYearAiGDP: number = 0;

  // Phase 7: Fiscal-Monetary state variables (carried forward across years)
  let previousFiscalMonetary: FiscalMonetaryOutput | null = null;
  let previousDebtStock = INITIAL_FEDERAL_DEBT;
  let previousWeightedAvgDebtRate = INITIAL_WEIGHTED_AVG_DEBT_RATE;
  let previousMarketCap = 0; // Initialized in year 0 from baseline
  let historicalMaxCapabilityChange = 0;
  let prevCorporateProfitsForEquity = BASELINE_CORPORATE_PROFITS;
  let prevPrevCorporateProfitsForEquity = BASELINE_CORPORATE_PROFITS;
  let previousCapabilityScores: number[] | null = null;

  // DEPRECATED: cumulativeWageGrowthFactor removed — wage growth chain caused hyperinflation.
  // Wage nominal growth now handled by wageBase = prevNomGDP × BASELINE_WAGE_SHARE × (1 + productivity).
  // Phase 8 Fix 5: Cumulative home price index — starts at 1.0, multiplied by (1 + changeRate) each year.
  // Passed to computeMacro() so housing affordability deviation can be computed.
  let homePriceIndex = 1.0;
  // Phase 8 Fix 5: Previous mortgage rate for YoY change computation in housing model.
  let previousMortgageRate: number | undefined = undefined;

  // Phase 9: Supply chain state
  let adoptionState: AdoptionState = { rates: {}, frozenSince: {} };
  let chipSupplyHistory: number[] = [];
  let cumulativeCapabilityDelay: Record<CapabilityVectorId, number> = { generative: 0, agentic: 0, embodied: 0 };
  let supplyChainShockHistory: [SupplyChainInputs, SupplyChainInputs] = [
    { aiChips: 100, energyPrice: 100, energyCapacity: 100, trainingDCCapacity: 100, inferenceDCCapacity: 100, roboticsHardware: 100, softwareEfficiency: 100 },
    { aiChips: 100, energyPrice: 100, energyCapacity: 100, trainingDCCapacity: 100, inferenceDCCapacity: 100, roboticsHardware: 100, softwareEfficiency: 100 },
  ];
  let cognitiveProgress = 0;
  let embodiedProgress = 0;

  // Phase 5i: Housing state tracking
  let dynamicHomeownership: number[] = MORTGAGE_EXPOSURE_QUINTILES.map(q => q.homeownershipRate as number);
  const displacementHistory: Array<Map<string, number>> = [];
  // Quintile mapping (stable across years — computed once from baseline wages)
  const clusterWageData = effectiveClusters.map(c => {
    const bl = baselines.get(c.id);
    let avgWage = 50000; // fallback
    if (bl) {
      let totalEmp = 0;
      let totalWageEmp = 0;
      for (const roleId of Object.keys(bl.wages)) {
        const emp = bl.employments[roleId] ?? 0;
        const wage = bl.wages[roleId] ?? 0;
        totalEmp += emp;
        totalWageEmp += wage * emp;
      }
      if (totalEmp > 0) avgWage = totalWageEmp / totalEmp;
    }
    return { id: c.id, averageWage: avgWage };
  });
  const clusterQuintileMap = mapClustersToQuintiles(clusterWageData);

  // === MAIN TIME LOOP (DATA_MODEL.md §10.1) ===
  for (let year = config.startYear; year <= config.endYear; year++) {

    // Resolve year-overridable token usage multiplier (sticky-forward).
    // Default trajectory: the spike-and-recover schedule (1× → 20× → 25× → 15× → 5× →
    // 1×, holding 1× thereafter), unless a scenario set a flat tokenUsageMultiplier.
    // Used downstream by BFCS Cheaper score + sector-weighted deflation.
    const baselineTokenUsage = defaultTokenUsageMultiplier(
      year, config.startYear,
      config.aiCostParams?.tokenUsageMultiplier,
    );
    const resolvedTokenUsage = resolveParameter(
      'tokenUsageMultiplier', year, baselineTokenUsage, baselineTokenUsage, overrides,
    ).effective;
    const effectiveAiCostParams = config.aiCostParams
      ? { ...config.aiCostParams, tokenUsageMultiplier: resolvedTokenUsage }
      : undefined;

    // Phase 5g Step 1: Dynamic population growth
    const popGrowthRate = config.populationGrowthRate ?? DEFAULT_POPULATION_GROWTH_RATE;
    const yearsSinceStartForPop = year - config.startYear;
    const dynamicPopulation = config.totalPopulation * Math.pow(1 + popGrowthRate, yearsSinceStartForPop);
    const dynamicLaborForce = config.laborForce * (dynamicPopulation / config.totalPopulation);

    // Baseline employment growth: scale all baseline references so the no-AI economy
    // naturally absorbs its growing labor force. Without this, frozen 2025 baselines
    // create rising structural unemployment as population grows → demand penalty death spiral.
    const laborForceGrowthFactor = dynamicPopulation / config.totalPopulation;

    // Phase 9: Compute supply chain effects (before capabilities so delays are ready)
    const scConfig = config.supplyChainConfig;
    let scEffects: SupplyChainEffects | null = null;
    let scLaggedInputs: ReturnType<typeof applyPropagationLags> | null = null;

    if (scConfig) {
      scEffects = computeSupplyChainEffects({
        year,
        config: scConfig,
        shockHistory: supplyChainShockHistory,
        chipSupplyHistory,
        prevCumulativeDelay: cumulativeCapabilityDelay,
        onshoringFraction: config.aiProductionOnshoringFraction ?? DEFAULT_AI_PRODUCTION_ONSHORING_FRACTION,
        automationCoverage: previousMacro?.automationCoverage ?? 0,
        baseComputeDeclineRate: config.aiCostParams?.inferenceAnnualChange ?? DEFAULT_INFERENCE_ANNUAL_CHANGE,
        cognitiveProgress,
        embodiedProgress,
      });
      cumulativeCapabilityDelay = scEffects.cumulativeCapabilityDelay;
      scLaggedInputs = applyPropagationLags(scConfig.inputs, supplyChainShockHistory[0], supplyChainShockHistory[1]);
    }

    // 1. Update capability scores S_c(t) for all vectors
    const capabilityScores = getAllCapabilityScores(
      year, config.capabilities,
      scEffects ? scEffects.cumulativeCapabilityDelay : undefined,
    );

    // Get automation acceleration from previous year (displacement-demand feedback)
    const baseAutomationAcceleration = previousMacro?.automationAcceleration ?? 0;

    // Phase 5i Change 7: Business credit → AI adoption acceleration
    // Phase 6: businessCreditTightening is negative when loose, so negate to get loosening
    const creditAdoptionSens = config.creditAdoptionSensitivity ?? DEFAULT_CREDIT_ADOPTION_SENSITIVITY;
    const prevBusinessTightening = previousMacro?.businessCreditTightening ?? 0;
    const businessCreditLoosening = Math.max(0, -prevBusinessTightening);
    const creditAdoptionAcceleration = Math.min(
      secondOrderParams.revenuePressureCap,
      businessCreditLoosening * creditAdoptionSens,
    );
    // Total automation acceleration = revenue pressure + credit adoption (still capped)
    const automationAcceleration = Math.min(
      secondOrderParams.revenuePressureCap,
      baseAutomationAcceleration + creditAdoptionAcceleration,
    );

    // Phase 5g Step 9: Compute min wage BEFORE cluster loop (needed for adoption acceleration)
    const minWageHourlyEarly = interpolatePolicy(config.policyConfig.minimumWage.federalMinimum, year);
    const effectiveMinWageEarly = minWageHourlyEarly
      * (config.policyConfig.minimumWage.indexedToInflation ? (previousMacro?.priceLevel ?? 1.0) : 1.0);
    const annualMinWage = effectiveMinWageEarly * 2080; // 40hr/week × 52 weeks
    const policyWageFloor = annualMinWage / BASELINE_AVERAGE_ANNUAL_WAGE;
    const wageAutoSens = config.wageAutomationSensitivity ?? DEFAULT_WAGE_AUTOMATION_SENSITIVITY;

    // DEPRECATED: computeNominalWageGrowth + cumulativeWageGrowthFactor removed.
    // Wage nominal growth is handled by wageBase = prevNomGDP × BASELINE_WAGE_SHARE × (1 + productivity)
    // in computeMacro(). The explicit wage growth chain double-counted with that mechanism.

    // 2-5. For each cluster: BFCS → adoption → displacement
    const clusterResults: ClusterDisplacementResult[] = [];
    let totalAutomationDividend = 0;
    let totalAugmentationOutput = 0;
    const augmentationByCluster = new Map<string, number>();
    // Phase 10.A fix #1 — head-count augmentation fraction for the deflation pipeline.
    // Parallel to augmentationByCluster (output $), this Map holds the pure [0,1] fraction of
    // remaining cluster workers currently using AI as a tool. Separates "coverage" from "output"
    // so the deflation term doesn't double-count cheaperScore (which is already in perUnitCostSavings).
    const augmentedHeadcountByCluster = new Map<string, number>();
    // Phase 10.A Bug #A fix — per-cluster employment-weighted better / cheaper scores for the
    // two-channel deflation formula. Augmentation's per-unit cost savings derives from
    // perWorkerBoost = clusterBetter × clusterCheaper × augMultiplier, which requires the
    // cluster-level averages. Populated alongside effectiveProductivityByCluster.
    const clusterBetterByCluster = new Map<string, number>();
    const clusterCheaperByCluster = new Map<string, number>();
    const effectiveProductivityByCluster = new Map<string, number>();
    const augMultiplier = config.augmentationMultiplier ?? DEFAULT_AUGMENTATION_MULTIPLIER;

    // Phase 10.A — snapshot prior-year α maps so mutation during the cluster loop doesn't
    // change cross-cluster peer reads mid-iteration (order-independent).
    const priorYearAlphaSnapshot = new Map(priorYearAlphaByCluster);
    const priorYearWageAdjSnapshot = new Map(priorYearWageAdjustmentByCluster);

    // Phase 10.A — α-driver inputs read from prior-year macro (one-year lag).
    const alphaMarginRatio = previousMacro?.corporateMarginRatio ?? ALPHA_BASELINE_CORPORATE_MARGIN;
    const alphaUnemploymentRate = previousMacro?.unemploymentRate ?? FRED_NAIRU_RATE;
    const alphaDriverParams = config.alphaDriverParams ?? DEFAULT_ALPHA_DRIVER_PARAMS;
    const alphaBaselineMargin = ALPHA_BASELINE_CORPORATE_MARGIN;

    // Phase 10.A — staged next-year maps (committed after cluster loop).
    const nextAlphaByCluster = new Map<string, number>();
    const nextAlphaByRole: Record<string, Record<string, number>> = {};
    const nextWageAdjByCluster = new Map<string, number>();

    // Phase 10.A — cumulative aggregates for computeMacro
    let yearAggregatePremiumSum = 0;
    let yearAggregatePremiumWeight = 0;
    let yearNewDisplacedHeadcount = 0;

    for (const cluster of effectiveClusters) {
      const baseline = baselines.get(cluster.id);
      if (!baseline) continue;

      // Compute weighted capability for this cluster (Phase 8 consolidation)
      const clusterOverride = config.clusterOverrides?.[cluster.id];
      const effectiveWeights = clusterOverride
        ? {
            generative: clusterOverride.generativeWeight ?? cluster.capabilityRelevance.weights.generative,
            agentic: clusterOverride.agenticWeight ?? cluster.capabilityRelevance.weights.agentic,
            embodied: clusterOverride.embodiedWeight ?? cluster.capabilityRelevance.weights.embodied,
          }
        : cluster.capabilityRelevance.weights;
      const weightedCapability = computeWeightedCapability(capabilityScores, effectiveWeights);

      // Phase 10.A — peer α from prior year (employment-weighted, excludes self).
      const peerAlpha = computePeerAlpha(
        cluster.category,
        cluster.id,
        priorYearAlphaSnapshot,
        clusterEmploymentByCluster,
        clusters,
      );

      // Phase 10.A — prior-year cluster scarcity wage adjustment → this-year Cheaper score.
      const clusterWageAdjustment = priorYearWageAdjSnapshot.get(cluster.id) ?? 0;

      // Staged α map for THIS cluster's roles (keyed by role.id)
      const roleAlphas: Record<string, number> = {};
      nextAlphaByRole[cluster.id] = {};

      // DEPRECATED (Phase 10.A): Old deployment-type multiplier for cluster effective productivity.
      // Replaced by first-principles formula AFTER the role loop where BFCS scores are available.
      // {
      //   const maxMult = clusterOverride?.maxProductivityMultiplier
      //     ?? AI_PRODUCTIVITY_MULTIPLIER_BY_DEPLOYMENT[cluster.deploymentType];
      //   effectiveProductivityByCluster.set(cluster.id, 1.0 + (maxMult - 1.0) * weightedCapability);
      // }

      // Per-cluster adoption parameters (Phase 8 consolidation)
      const clusterSteepness = clusterOverride?.adoptionSteepness ?? cluster.adoptionSteepness;
      const clusterCeiling = clusterOverride?.adoptionCeiling ?? cluster.adoptionCeiling;
      const clusterLag = clusterOverride?.deploymentLag ?? cluster.adoptionLag;
      const clusterWageElasticity = clusterOverride?.wageElasticity ?? cluster.wageElasticity;

      const adoptionRates: Record<string, number> = {};
      const roleBFCSOutputs: RoleBFCSOutput[] = [];

      // Phase 5g Step 9B: Cluster average wage for min wage adoption bonus
      const clusterBaselineWages = Object.values(baseline.wages);
      const clusterAvgWage = clusterBaselineWages.length > 0
        ? clusterBaselineWages.reduce((a, b) => a + b, 0) / clusterBaselineWages.length
        : BASELINE_AVERAGE_ANNUAL_WAGE;
      let minWageAdoptionBonus = 0;
      if (annualMinWage > 0 && wageAutoSens > 0 && clusterAvgWage > 0 && annualMinWage > clusterAvgWage) {
        minWageAdoptionBonus = wageAutoSens * (annualMinWage - clusterAvgWage) / clusterAvgWage;
      }

      // ═══ Payroll Tax → BFCS Cheaper Modulation (Phase 5-tax) ═══
      const currentPayroll = config.taxConfig?.payrollTaxRate ?? BASELINE_PAYROLL_RATE;
      const payrollDelta = currentPayroll - BASELINE_PAYROLL_RATE;
      const payrollCostShift = payrollDelta * EMPLOYER_EMPLOYEE_SPLIT;

      for (const role of cluster.roles) {
        // 2-3. Resolve effective thresholds (user override or cluster default)
        const baseThresholds = config.bfcsOverrides[cluster.id]?.[role.id] ?? role.bfcsThresholds;
        const effectiveThresholds = {
          ...baseThresholds,
          cheaper: Math.max(0, Math.min(1, baseThresholds.cheaper - payrollCostShift)),
        };

        // Compute BFCS scores and check adoption trigger
        // Phase 9: Pass supply chain BFCS multipliers when active
        // Select blend-scaled sensitivity matrix matching this cluster's AI type
        const scSensitivity = (cluster.deploymentType === 'software' || cluster.deploymentType === 'hybrid')
          ? scEffects?.scaledCognitiveSensitivity : scEffects?.scaledEmbodiedSensitivity;
        const scBFCSParams = (scConfig && scEffects && scLaggedInputs) ? {
          fasterMultiplier: computeFasterMultiplier(
            scLaggedInputs, scEffects.effectiveResilience, cluster.deploymentType, scConfig.inputs.softwareEfficiency,
            scSensitivity,
          ),
          saferMultiplier: computeSaferMultiplier(
            scLaggedInputs, scEffects.effectiveResilience, cluster.deploymentType,
            scSensitivity,
          ),
          costMultipliers: scEffects.bfcsCostMultipliers,
        } : undefined;

        const { triggered, scores } = checkAdoptionTrigger(
          cluster, role, year, capabilityScores, effectiveThresholds, effectiveAiCostParams,
          scBFCSParams,
          clusterWageAdjustment,  // Phase 10.A — propagates into Cheaper via computeCheaperScore
        );

        // Phase 10.A fix #2 — effective trigger year shifts forward by role.aiReplacementFrictionYears
        // (direct years, no global scaling). We record the EFFECTIVE trigger year rather than the raw
        // BFCS-met year. If the shifted year falls outside the simulation window, the role never triggers.
        if (triggered && triggerYears[cluster.id]![role.id] === null) {
          const frictionYears = role.aiReplacementFrictionYears ?? 0;
          const effectiveTriggerYear = Math.ceil(year + Math.max(0, frictionYears));
          if (effectiveTriggerYear <= config.endYear) {
            triggerYears[cluster.id]![role.id] = effectiveTriggerYear;
            triggerBetterScores[cluster.id]![role.id] = scores.better;
          }
          // If effectiveTriggerYear > endYear: leave triggerYears null (never triggers)
        }

        const roleTriggerYear = triggerYears[cluster.id]![role.id] ?? null;

        // Phase 10.A — compute effective α for this role using the 5-driver model.
        const alphaResult = computeEffectiveAlpha({
          cluster,
          role,
          year,
          weightedCapability,
          triggerYear: roleTriggerYear,
          previousYearPeerAlpha: peerAlpha,
          currentCorporateMargin: alphaMarginRatio,
          baselineCorporateMargin: alphaBaselineMargin,
          unemploymentRate: alphaUnemploymentRate,
          naturalRate: FRED_NAIRU_RATE,
          params: alphaDriverParams,
        });
        roleAlphas[role.id] = alphaResult.alpha;
        nextAlphaByRole[cluster.id]![role.id] = alphaResult.alpha;
        // Attach α + decomposition diagnostics to the BFCS scores emitted for this role
        scores.alpha = alphaResult.alpha;
        scores.alphaDecomposition = alphaResult.decomposition;
        scores.effectiveTriggerYearShift = role.aiReplacementFrictionYears ?? 0;

        // 4. Compute adoption rate
        if (scConfig && scEffects && scLaggedInputs) {
          // Phase 9: Stateful adoption with hysteresis
          const prevRate = adoptionState.rates[cluster.id]?.[role.id] ?? 0;
          const frozenSince = adoptionState.frozenSince[cluster.id]?.[role.id] ?? null;
          const yearsSince = roleTriggerYear !== null ? year - roleTriggerYear : 0;
          const hysteresisWidth = computeHysteresisWidth(yearsSince, cluster.deploymentType, scConfig);
          const clusterDrag = computeAdoptionDrag(
            scLaggedInputs, scEffects.effectiveResilience, cluster.deploymentType, scEffects.costPassThroughRate,
            scSensitivity,
          );
          const statefulResult = computeStatefulAdoptionRate(
            year, prevRate, roleTriggerYear, triggered, scores, effectiveThresholds,
            hysteresisWidth, cluster.deploymentType, clusterLag,
            clusterSteepness, clusterCeiling, clusterDrag, frozenSince,
          );
          adoptionRates[role.id] = statefulResult.adoptionRate;
          // Update adoption state
          if (!adoptionState.rates[cluster.id]) adoptionState.rates[cluster.id] = {};
          if (!adoptionState.frozenSince[cluster.id]) adoptionState.frozenSince[cluster.id] = {};
          adoptionState.rates[cluster.id]![role.id] = statefulResult.adoptionRate;
          adoptionState.frozenSince[cluster.id]![role.id] = statefulResult.frozenSince;
        } else {
          // No supply chain: existing adoption model
          // Phase 5g Step 9B: Add min wage cost pressure to automation acceleration
          // Phase 10.A: pass role wagePremium (tail drag), peerAlpha (competitive split), threshold override
          const adoptionResult = getAdoptionRate(
            year, roleTriggerYear, cluster.deploymentType, clusterLag,
            cluster.geopoliticalRiskExposure, config.adoptionParams,
            automationAcceleration + minWageAdoptionBonus, clusterSteepness, clusterCeiling,
            role.aiReplacementDifficultyWagePremium ?? 0,
            peerAlpha,
            config.competitivePressureThreshold ?? DEFAULT_COMPETITIVE_PRESSURE_THRESHOLD,
          );
          adoptionRates[role.id] = adoptionResult.adjustedAdoptionRate;
        }

        // Collect BFCS output for Phase 4 visualization
        roleBFCSOutputs.push({
          roleId: role.id,
          scores,
          thresholds: effectiveThresholds,
          triggered,
          triggerYear: roleTriggerYear,
          adoptionRate: adoptionRates[role.id]!,
        });
      }

      // 5. Compute displacement for the cluster (FIX 7: no eaf — AI displacement only)
      // Phase 10.A V2: Uses `adoption × weightedCapability × α` (drops squared proxy).
      // Scale baseline employment to reflect natural economic absorption of population growth.
      const scaledEmployments: Record<string, number> = {};
      for (const [roleId, headcount] of Object.entries(baseline.employments)) {
        scaledEmployments[roleId] = headcount * laborForceGrowthFactor;
      }

      // Phase 10.A — cluster effective productivity from first-principles formula.
      //   effectiveProductivity = 1 + weightedCapability × betterScore × replacementMultiplier × (1 + cheaperScore)
      // Computed AFTER the role loop because it needs per-role BFCS scores.
      // Also stores cluster-level better/cheaper for the two-channel deflation formula (Bug #A fix).
      {
        let clusterBetterWeightedSum = 0;
        let clusterCheaperWeightedSum = 0;
        let clusterProductivityWeight = 0;
        for (const out of roleBFCSOutputs) {
          const w = Math.max(1, scaledEmployments[out.roleId] ?? 0);
          clusterBetterWeightedSum += out.scores.better * w;
          clusterCheaperWeightedSum += out.scores.cheaper * w;
          clusterProductivityWeight += w;
        }
        const clusterBetter = clusterProductivityWeight > 0
          ? clusterBetterWeightedSum / clusterProductivityWeight
          : 0;
        const clusterCheaper = clusterProductivityWeight > 0
          ? clusterCheaperWeightedSum / clusterProductivityWeight
          : 0;
        const replacementMultiplier = config.replacementMultiplier ?? DEFAULT_REPLACEMENT_MULTIPLIER;
        const effProd = 1 + weightedCapability * clusterBetter * replacementMultiplier * (1 + clusterCheaper);
        effectiveProductivityByCluster.set(cluster.id, effProd);
        clusterBetterByCluster.set(cluster.id, clusterBetter);
        clusterCheaperByCluster.set(cluster.id, clusterCheaper);
      }

      // Phase 10.A — use computed effective α per role (5-driver model)
      const clusterDisplacement = computeClusterDisplacement(
        cluster,
        adoptionRates,
        scaledEmployments,
        baseline.wages,
        weightedCapability,
        roleAlphas,
        clusterOverride?.wageElasticity,
        config.scarcityIntensity ?? DEFAULT_SCARCITY_INTENSITY,
      );

      // Phase 10.A — cluster-level α for next-year peer reads (employment-weighted across roles)
      let clusterAlphaWeightedSum = 0;
      let clusterAlphaWeightTotal = 0;
      for (const role of cluster.roles) {
        const emp = scaledEmployments[role.id] ?? 0;
        clusterAlphaWeightedSum += (roleAlphas[role.id] ?? 0) * emp;
        clusterAlphaWeightTotal += emp;
      }
      const clusterEffectiveAlpha = clusterAlphaWeightTotal > 0
        ? clusterAlphaWeightedSum / clusterAlphaWeightTotal
        : (cluster.automationShare ?? DEFAULT_COGNITIVE_ALPHA);
      nextAlphaByCluster.set(cluster.id, clusterEffectiveAlpha);
      nextWageAdjByCluster.set(cluster.id, clusterDisplacement.wageAdjustmentFromScarcity ?? 0);

      // Accumulate for macro aggregate (weight by baseline employment)
      const clusterBaselineEmpSum = clusterAlphaWeightTotal / Math.max(laborForceGrowthFactor, 1e-9);
      yearAggregatePremiumSum += (clusterDisplacement.aggregateReplacementDifficultyWagePremium ?? 0)
        * clusterBaselineEmpSum;
      yearAggregatePremiumWeight += clusterBaselineEmpSum;
      yearNewDisplacedHeadcount += clusterDisplacement.totalDirectDisplacement ?? 0;

      // Attach BFCS output to cluster result
      clusterDisplacement.bfcsOutput = roleBFCSOutputs;

      // Phase 9 Fix: Accumulate automation dividend — deployer cost savings from AI replacing labor
      // Uses UNCLAMPED cheaper score: positive = savings, negative = loss (supply shock + hysteresis)
      const t_div = year - config.startYear;
      const divComp = (config.aiCostParams?.composition?.[cluster.deploymentType]
        ?? AI_COST_COMPOSITION[cluster.deploymentType]
        ?? AI_COST_COMPOSITION['software'])!;
      const divInfChange = config.aiCostParams?.inferenceAnnualChange ?? DEFAULT_INFERENCE_ANNUAL_CHANGE;
      const divMfgChange = config.aiCostParams?.manufacturingAnnualChange ?? DEFAULT_MANUFACTURING_ANNUAL_CHANGE;
      const divEngChange = config.aiCostParams?.energyAnnualChange ?? DEFAULT_ENERGY_ANNUAL_CHANGE;
      // Supply chain multipliers: use pass-through-applied BFCS cost multipliers (1.0 when no SC)
      const divScm = scEffects?.bfcsCostMultipliers ?? { inference: 1, manufacturing: 1, energy: 1 };
      const divAiCostFraction =
          divComp.inference * Math.exp(divInfChange * t_div) * divScm.inference
        + divComp.manufacturing * Math.exp(divMfgChange * t_div) * divScm.manufacturing
        + divComp.energy * Math.exp(divEngChange * t_div) * divScm.energy;

      for (const roleResult of clusterDisplacement.roles) {
        if (roleResult.displacementPct <= 0) continue;
        const role = cluster.roles.find(r => r.id === roleResult.roleId);
        if (!role) continue;
        const roleWage = baseline.wages[role.id] ?? 0;
        const displacedCount = roleResult.displacementPct * (scaledEmployments[role.id] ?? 0);
        if (displacedCount <= 0 || roleWage <= 0) continue;
        const humanCostFactor = 0.3 + role.seniorityLevel * 0.7;
        // Unclamped: negative when AI costs MORE than human (supply shock margin compression)
        const costSavingsRatio = 1 - (divAiCostFraction / humanCostFactor);
        totalAutomationDividend += displacedCount * roleWage * costSavingsRatio;
      }

      clusterResults.push(clusterDisplacement);

      // Phase 10.A augmentation output V2:
      //   per-worker boost = betterScore × cheaperScore × augMultiplier (multiplicative, human-rate-limited)
      //   augmentedRemaining = roleRemaining × augAdoptionRate  (fraction of remaining workers using AI as tool)
      // Augmentation trigger = betterScore × cheaperScore > AUGMENTATION_VIABILITY_THRESHOLD (internal 0.1).
      // augTriggerYears persist across years, so dips in score don't reset the S-curve.
      let clusterAugmentationOutput = 0;
      // Phase 10.A fix #1: track head-count fraction parallel to output-dollar total.
      let clusterAugmentedHeadcount = 0;
      let clusterTotalBaselineForAug = 0;
      if (augMultiplier > 0) {
        const augSteepness = config.augmentationAdoptionSteepness ?? DEFAULT_AUGMENTATION_ADOPTION_STEEPNESS;
        for (const role of cluster.roles) {
          const roleBaseline = scaledEmployments[role.id] ?? 0;
          const roleWage = baseline.wages[role.id] ?? 0;
          const roleBFCS = roleBFCSOutputs.find(r => r.roleId === role.id);
          const betterScore = roleBFCS?.scores.better ?? 0;
          const cheaperScore = roleBFCS?.scores.cheaper ?? 0;

          const augResult = computeAugmentationAdoption({
            year,
            betterScore,
            cheaperScore,
            augTriggerYear: augTriggerYears[cluster.id]![role.id] ?? null,
            steepness: augSteepness,
          });
          if (augResult.triggered && augTriggerYears[cluster.id]![role.id] === null) {
            augTriggerYears[cluster.id]![role.id] = augResult.triggerYear;
          }

          // Remaining workers after V2 displacement
          const roleAlpha = roleAlphas[role.id] ?? (cluster.automationShare ?? DEFAULT_COGNITIVE_ALPHA);
          const roleAdoption = adoptionRates[role.id] ?? 0;
          const roleDisplacement = Math.max(0, Math.min(1, roleAdoption * weightedCapability * roleAlpha));
          const roleRemaining = roleBaseline * (1 - roleDisplacement);

          const perWorkerBoost = betterScore * cheaperScore * augMultiplier;
          const augmentedRemaining = roleRemaining * augResult.augAdoptionRate;
          clusterAugmentationOutput += augmentedRemaining * roleWage * perWorkerBoost;

          // Phase 10.A fix #1: head-count accumulation for deflation pipeline (pure [0,1] fraction).
          clusterAugmentedHeadcount += augmentedRemaining;
          clusterTotalBaselineForAug += roleBaseline;

          // Attach augAdoptionRate diagnostic to BFCS output
          if (roleBFCS) {
            roleBFCS.scores.augAdoptionRate = augResult.augAdoptionRate;
          }
        }
        totalAugmentationOutput += clusterAugmentationOutput;
        augmentationByCluster.set(cluster.id, clusterAugmentationOutput);
        // Record the head-count fraction — pure [0,1], independent of wage / score amplification.
        const headcountFrac = clusterTotalBaselineForAug > 0
          ? clusterAugmentedHeadcount / clusterTotalBaselineForAug
          : 0;
        augmentedHeadcountByCluster.set(cluster.id, Math.max(0, Math.min(1, headcountFrac)));
      }
    }

    // 7. Aggregate to total employment, average wages (AI-only, no eaf)
    const aggregate = computeAggregateDisplacement(clusterResults);

    // Phase 10.A — post-cluster-loop aggregation:
    //   currentYearAiDisplacementStock = this year's total AI-displaced headcount across clusters
    //     (not cumulative — totalDirectDisplacement is already a stock measure of baseline − remaining).
    //   aggregateReplacementDifficultyWagePremium = employment-weighted mean across clusters.
    currentYearAiDisplacementStock = Math.max(0, yearNewDisplacedHeadcount);
    const aggregateReplacementDifficultyWagePremium = yearAggregatePremiumWeight > 0
      ? yearAggregatePremiumSum / yearAggregatePremiumWeight
      : 0;

    // FIX 8: Compute automation coverage from actual adoption-driven displacement
    // Uses employment-weighted average of per-cluster automation coverage
    const scaledBaselineEmployment = BASELINE_TOTAL_EMPLOYMENT * laborForceGrowthFactor;
    const automationCoverage = computeAutomationCoverageFromClusters(
      clusterResults, scaledBaselineEmployment,
    );

    // === Phase 3c.1: Per-cluster demand spillover ===
    // Computes demand ratios from PREVIOUS year's C, G, I vs GROWING baselines.
    // Each cluster's remaining employment is reduced by its weighted demand ratio.
    // This replaces Okun's Law (rate-of-change based) with a level-based mechanism.
    const prevConsumption = previousMacro?.consumption ?? BASELINE_CONSUMPTION_2025;
    const prevGovSpending = previousMacro?.governmentSpending ?? BASELINE_GOVT_SPENDING_2025;
    const prevInvestment = previousMacro?.investment ?? BASELINE_INVESTMENT_2025;
    // Phase 8a: Use REAL values for demand ratios to prevent inflation from inflating demand.
    // Without this, nominal C/G/I grow with price level, making demand ratios > 1 even when
    // real consumption is collapsing — preventing the demand feedback from firing.
    const prevPriceLevel = previousMacro?.priceLevel ?? 1.0;
    const realPrevConsumption = prevConsumption / prevPriceLevel;
    const realPrevGovSpending = prevGovSpending / prevPriceLevel;
    const realPrevInvestment = prevInvestment / prevPriceLevel;

    // Fix A (revised): Static demand baselines from year-0 model output.
    // Original Fix A grew baselines at ~2%/yr real, but consumption structurally lags GDP by one year
    // (wageBase uses prevNomGDP), so real consumption can't keep pace with growing baselines.
    // In a zero-AI economy with 2.9% inflation and 0.45% nominal consumption growth, the growing
    // baselines create a 4% gap by year 2 that triggers the displacement-demand feedback cycle.
    // Static baselines + tolerance band (Fix B) is correct: demand spillover fires when real C/G/I
    // fall BELOW the starting level (from AI-driven wage erosion), not when they fail to meet a growth target.
    // Falls back to BEA constants for year 0 (before baselines are captured).
    const effectiveBaseC = demandBaselineRealC ?? BASELINE_CONSUMPTION_2025;
    const effectiveBaseG = demandBaselineRealG ?? BASELINE_GOVT_SPENDING_2025;
    const effectiveBaseI = demandBaselineRealI ?? BASELINE_INVESTMENT_2025;
    const consumerDemandRatio = realPrevConsumption / effectiveBaseC;
    const govDemandRatio = realPrevGovSpending / effectiveBaseG;
    const businessDemandRatio = realPrevInvestment / effectiveBaseI;

    // Fix B: Demand tolerance band. Minor demand fluctuations (1-3%) shouldn't trigger mass layoffs.
    // Businesses absorb small demand dips before firing workers (labor hoarding).
    const demandSpilloverTolerance = config.demandSpilloverTolerance ?? 0.03;

    // Fix C: Dampen the demand ratio sent to the investment pipeline by the same tolerance.
    // Without this, a 2.4% demand shortfall (within tolerance for employment) still reduces
    // investment by ~2% via tradDemandFactor, creating a slow-burning feedback loop:
    //   investment falls → real investment drops below baseline → business demand ratio worsens
    //   → exceeds tolerance → employment cut → wages fall → displacement-demand feedback cycle
    // Applying tolerance: within-band shortfalls are treated as normal demand for investment too.
    const dampedDemandRatioForInvestment = Math.min(1.0, consumerDemandRatio + demandSpilloverTolerance);

    let totalAfterSpillover = 0;
    let totalDemandSpilloverLoss = 0;
    let totalPreSpilloverEmployment = 0;

    // Phase 5g Step 12: Store per-cluster demand survival rates for scarcity (computed after policy effects)
    const clusterDemandSurvivalMap = new Map<string, number>();

    for (const cr of clusterResults) {
      const cluster = effectiveClusters.find(c => c.id === cr.clusterId)!;
      const cShare = cluster.consumerDemandShare;
      const gShare = cluster.govDemandShare;
      // Phase 5h (Fix 12): Clamp business share to non-negative (safety after normalization)
      const bShare = Math.max(0, 1 - cShare - gShare);

      const clusterDemandRatio =
        cShare * consumerDemandRatio
        + gShare * govDemandRatio
        + bShare * businessDemandRatio;

      // Fix B: Apply tolerance band — only shortfalls beyond the tolerance reduce employment
      const demandShortfall = Math.max(0, 1.0 - clusterDemandRatio);
      const excessShortfall = Math.max(0, demandShortfall - demandSpilloverTolerance);
      const demandSurvivalRate = Math.min(1.0, 1.0 - excessShortfall);
      const constrainedEmployment = cr.totalRemainingEmployment * demandSurvivalRate;
      const spilloverLoss = cr.totalRemainingEmployment - constrainedEmployment;

      totalAfterSpillover += constrainedEmployment;
      totalDemandSpilloverLoss += spilloverLoss;
      totalPreSpilloverEmployment += cr.totalRemainingEmployment;

      // Store demand survival for scarcity + labor supply pass (after policy effects)
      clusterDemandSurvivalMap.set(cr.clusterId, demandSurvivalRate);
    }

    const aggregateDemandSurvival = totalPreSpilloverEmployment > 0
      ? totalAfterSpillover / totalPreSpilloverEmployment
      : 1.0;

    // Employment for policy effects uses demand-constrained employment
    // Scale non-cluster workers (self-employed, agricultural) with population growth
    const scaledNonClusterEmployed = NON_CLUSTER_EMPLOYED * laborForceGrowthFactor;
    const effectiveUnemployment = Math.max(0, dynamicLaborForce - totalAfterSpillover - scaledNonClusterEmployed);

    // Phase 5g Step 7: Track AI GDP at UBI index start year for productivity indexing
    const ubiStartYear = config.policyConfig.ubi.indexedStartYear ?? 2032;
    if (year >= ubiStartYear && startYearAiGDP === 0 && previousMacro) {
      startYearAiGDP = previousMacro.aiGDPContribution;
    }

    // 10. Policy effects
    const policyEffects = computePolicyEffects(
      config.policyConfig,
      year,
      totalAfterSpillover,
      effectiveUnemployment,
      aggregate.weightedAverageWage,
      dynamicPopulation,
      previousMacro?.priceLevel ?? 1.0,
      previousMacro?.gdpNominal ?? BASELINE_GDP_NOMINAL_2025,
      previousFundSize,
      aggregate.totalDirectDisplacement,
      previousMacro?.aiGDPContribution ?? 0,  // Phase 5g: for UBI productivity indexing
      startYearAiGDP,                          // Phase 5g: AI GDP at index start year
    );

    previousFundSize = policyEffects.sovereignFundSize;

    // === Phase 5g Steps 11+12: Scarcity inflation with labor supply response ===
    // Scarcity runs AFTER policy effects because labor supply response needs UBI amount.
    // Labor supply withdrawal reduces available workers, which can increase scarcity.
    const scarcityPassThroughVal = config.scarcityPassThrough ?? DEFAULT_SCARCITY_PASS_THROUGH;
    const participElasticity = config.participationElasticity ?? DEFAULT_PARTICIPATION_ELASTICITY;
    const participThreshold = config.participationThreshold ?? DEFAULT_PARTICIPATION_THRESHOLD;

    let scarcityInflation = 0;
    let totalEffectiveLaborSupply = 0;
    let totalVoluntaryWithdrawal = 0;

    // Get effective UBI for replacement rate calculation
    const effectiveUBIMonthly = getEffectiveUBI(
      config.policyConfig.ubi,
      year,
      previousMacro?.aiGDPContribution ?? 0,
      startYearAiGDP,
    );
    const annualUBI = config.policyConfig.ubi.enabled ? effectiveUBIMonthly * 12 : 0;

    for (const cr of clusterResults) {
      // Step 12: Labor supply response — per-cluster voluntary withdrawal
      const clusterWage = cr.averageWage > 0 ? cr.averageWage : BASELINE_AVERAGE_ANNUAL_WAGE;
      const replacementRate = clusterWage > 0 ? annualUBI / clusterWage : 0;

      let withdrawal = 0;
      if (participElasticity > 0 && replacementRate > participThreshold) {
        const excessReplacement = replacementRate - participThreshold;
        const maxExcessRange = Math.max(0.01, 1.0 - participThreshold);
        withdrawal = participElasticity * Math.min(1, excessReplacement / maxExcessRange);
        withdrawal = Math.max(0, Math.min(1, withdrawal));
      }

      const effectiveLaborSupply = cr.totalRemainingEmployment * (1 - withdrawal);
      totalEffectiveLaborSupply += effectiveLaborSupply;
      totalVoluntaryWithdrawal += cr.totalRemainingEmployment * withdrawal;

      // Step 11: Scarcity inflation using effectiveLaborSupply (not remainingEmployment)
      const scarcityBaseline = baselines.get(cr.clusterId);
      const demandSurvivalRate = clusterDemandSurvivalMap.get(cr.clusterId) ?? 1.0;
      if (scarcityBaseline && scarcityPassThroughVal > 0) {
        // Scale baseline employment with population growth — a growing economy needs proportionally more workers
        const baselineEmp = Object.values(scarcityBaseline.employments).reduce((a, b) => a + b, 0) * laborForceGrowthFactor;
        // Total output demand in worker-equivalents
        const totalOutputDemand = baselineEmp * demandSurvivalRate;
        // AI capacity = displaced workers (AI is doing their work)
        const aiCapacity = Math.max(0, baselineEmp - cr.totalRemainingEmployment);
        // Demand for HUMAN workers = output demand minus what AI handles
        const demandForWorkers = Math.max(0, totalOutputDemand - aiCapacity);
        // KEY: Use effectiveLaborSupply, NOT remainingEmployment
        const availableWorkers = effectiveLaborSupply;

        if (demandForWorkers > 0) {
          const laborScarcity = Math.max(0, (demandForWorkers - availableWorkers) / demandForWorkers);
          const employmentShare = scaledBaselineEmployment > 0 ? baselineEmp / scaledBaselineEmployment : 0;
          scarcityInflation += laborScarcity * employmentShare * scarcityPassThroughVal;
        }
      }
    }

    const voluntaryWithdrawalRate = totalPreSpilloverEmployment > 0
      ? totalVoluntaryWithdrawal / totalPreSpilloverEmployment
      : 0;

    // Compute sector-weighted deflation from per-cluster displacement
    // Merge deflation intensity from clusterOverrides (takes precedence) and legacy deflationIntensityOverrides
    const mergedDeflationOverrides = buildDeflationIntensityOverrides(config);
    // Phase 5-tax: Pass deployment types and AI cost params for per-cluster 3-component deflation
    const clusterDeploymentMap = new Map(effectiveClusters.map(c => [c.id, c.deploymentType]));
    const sectorWeightedDeflationRate = computeSectorWeightedDeflation(
      clusterResults, year, mergedDeflationOverrides,
      clusterDeploymentMap, effectiveAiCostParams,
      augmentationByCluster, effectiveProductivityByCluster,
      augmentedHeadcountByCluster,
      clusterBetterByCluster, clusterCheaperByCluster,
      config.augmentationMultiplier ?? DEFAULT_AUGMENTATION_MULTIPLIER,
    );

    // DEPRECATED: Duplicate min wage computation moved before cluster loop (Phase 5g Step 9).
    // policyWageFloor and annualMinWage are now computed at the top of the year loop.

    // Phase 5g Step 9: Minimum wage cost-push inflation
    // Per cluster: if min wage > cluster avg wage, compute cost-push contribution
    const wagePassThroughVal = config.wagePassThrough ?? DEFAULT_WAGE_PASS_THROUGH;
    let minWageCostPush = 0;
    if (annualMinWage > 0 && wagePassThroughVal > 0) {
      for (const cr of clusterResults) {
        if (cr.averageWage > 0 && annualMinWage > cr.averageWage) {
          const baselineForCostPush = baselines.get(cr.clusterId);
          if (!baselineForCostPush) continue;
          const baselineEmp = Object.values(baselineForCostPush.employments).reduce((a, b) => a + b, 0) * laborForceGrowthFactor;
          const employmentShare = scaledBaselineEmployment > 0 ? baselineEmp / scaledBaselineEmployment : 0;
          const wageOvershoot = (annualMinWage - cr.averageWage) / cr.averageWage;
          minWageCostPush += wageOvershoot * employmentShare * wagePassThroughVal;
        }
      }
    }

    // 6. New job creation and survivability (Phase 2: BEFORE computeMacro)
    // Uses PREVIOUS year's GDP -- economically correct: last year's investment creates this year's jobs.
    // FIX 8: Pass displacement-based automationCoverage
    const prevGDPForJobs = previousMacro?.gdpReal ?? BASELINE_GDP_NOMINAL_2025;
    const newJobMetrics = computeNewJobMetrics(
      prevGDPForJobs,
      automationCoverage,
      aggregate.totalDirectDisplacement,
      config.innovationRate,
      config.rdMultiplier,
      config.jobPersistenceFactor,
    );

    // Phase 2: AI production expansion
    const aiProduction = computeAIProductionExpansion(
      clusterResults, effectiveClusters, capabilityScores, config,
      triggerBetterScores,
    );

    // Build production inputs for computeMacro
    const augWageShare = BASELINE_WAGE_SHARE;
    const productionInputs: MacroProductionInputs = {
      aiInvestmentBoost: aiProduction.aiInvestmentBoost,
      aiNetExportBoost: aiProduction.aiNetExportBoost,
      aiConsumerGoodsPotential: aiProduction.aiConsumerGoodsPotential,
      aiAdditionalOutput: aiProduction.totalAdditionalOutput,
      totalDurableNewJobs: newJobMetrics.durableNewJobs,
      newJobWageFraction: config.newJobWageFraction ?? DEFAULT_NEW_JOB_WAGE_FRACTION,
      augmentationWageBoost: totalAugmentationOutput * augWageShare,
      augmentationProfitBoost: totalAugmentationOutput * (1 - augWageShare),
    };

    // Phase 5i: Track displacement history and update housing state
    // Adapt clusterResults to include baseEmployment (remaining + displaced)
    const clusterResultsWithBase = clusterResults.map(cr => ({
      clusterId: cr.clusterId,
      baseEmployment: cr.totalRemainingEmployment + cr.totalDirectDisplacement,
      totalRemainingEmployment: cr.totalRemainingEmployment,
      totalDirectDisplacement: cr.totalDirectDisplacement,
      averageWage: cr.averageWage,
    }));
    const yearDisp = new Map<string, number>();
    for (const cr of clusterResults) {
      yearDisp.set(cr.clusterId, cr.totalDirectDisplacement);
    }
    displacementHistory.push(yearDisp);

    // Phase 5i Change 4: Dynamic homeownership (uses lagged displacement → foreclosures)
    const hoResult = updateHomeownership(
      dynamicHomeownership, clusterResultsWithBase, clusterQuintileMap, displacementHistory,
      config.foreclosureLag ?? DEFAULT_FORECLOSURE_LAG,
      config.homeownershipRecoveryRate ?? DEFAULT_HOMEOWNERSHIP_RECOVERY_RATE,
    );
    dynamicHomeownership = hoResult.updated;

    // Phase 5i Change 3: Mortgage stress index
    const mortgageStressIndex = computeMortgageStressIndex(
      clusterResultsWithBase, clusterQuintileMap, dynamicHomeownership,
      config.mortgageStressAmplifier ?? DEFAULT_MORTGAGE_STRESS_AMPLIFIER,
    );

    // ═══════════════════════════════════════════════════════════
    // Phase 7: Fiscal-Monetary Block (steps 14a-14m)
    // Inserted between housing/mortgage stress and computeMacro.
    // Uses PREVIOUS year's macro output for backward-looking inputs.
    // ═══════════════════════════════════════════════════════════
    const yearsSinceStartFM = year - config.startYear;
    const isFirstFiscalYear = yearsSinceStartFM === 0;

    // Assemble baseline fiscal-monetary output for year 0
    const baselineFiscalMonetary: FiscalMonetaryOutput = {
      fiscal: getBaselineFiscalState(),
      federalReserve: getBaselineFederalReserveState(),
      bondMarket: getBaselineBondMarketState(),
      equityMarket: getBaselineEquityMarketState(),
      monetization: getBaselineMonetizationState(),
    };

    // Initialize previousMarketCap from baseline if not yet set
    if (previousMarketCap === 0) {
      previousMarketCap = baselineFiscalMonetary.equityMarket.aggregateMarketCap;
    }

    let fiscalMonetaryOutput: FiscalMonetaryOutput;

    // Phase 8b: Compute autopilot + resolve effective parameters for this year
    const prevCIF = previousMacro?.cumulativeInflationFactor ?? 1.0;
    const laggedIndex = Math.max(0, debtGDPHistory.length - 1 - fiscalProfile.consolidationLag);
    const laggedDebtGDP = debtGDPHistory.length > 0
      ? debtGDPHistory[laggedIndex]!
      : (INITIAL_FEDERAL_DEBT / BASELINE_GDP_NOMINAL_2025);

    const autopilotResult = isFirstFiscalYear
      ? getBaselineAutopilot(config, fiscalProfile)
      : computeAutopilotParameters(
          laggedDebtGDP, prevCIF, fiscalProfile, baselineTaxRates,
          year, config.supplyChainConfig,
          config.aiProductionOnshoringFraction ?? DEFAULT_AI_PRODUCTION_ONSHORING_FRACTION,
        );

    const yearParams = resolveAllParameters(
      year, config, autopilotResult, overrides, profileName,
      {
        generative: capabilityScores.generative ?? 0,
        agentic: capabilityScores.agentic ?? 0,
        embodied: capabilityScores.embodied ?? 0,
      },
    );
    parameterTimeline.set(year, yearParams);

    // Phase 8a compat: consolidation struct for fiscal state reporting
    const consolidation = {
      discretionaryMultiplier: yearParams.fiscalDiscretionaryMultiplier.effective,
      obligationMultiplier: yearParams.fiscalObligationMultiplier.effective,
      revenueMultiplier: yearParams.fiscalRevenueMultiplier.effective,
      consolidationIntensity: yearParams.consolidationIntensity.effective,
    };

    if (isFirstFiscalYear) {
      // Year 0: use baseline (no previous macro data to compute from)
      fiscalMonetaryOutput = baselineFiscalMonetary;
    } else {
      // 14a: Revenue from previous year's 8-component tax model
      const prevMacroForFiscal = previousMacro!;
      // Note: MacroOutput exposes 6 of the 8 tax components directly.
      // transferTax and nonCorporateAssetTax are local to computeMacro() but
      // their sum can be derived: other = totalRevenue - labor - corporate.
      // We pass the 6 available + derive the rest from totalGovernmentRevenue.
      const revenue = computeEndogenousRevenue(
        prevMacroForFiscal.wageIncomeTax,
        prevMacroForFiscal.employeePayrollTax,
        prevMacroForFiscal.employerPayrollTax,
        prevMacroForFiscal.corporateTaxRevenue,
        prevMacroForFiscal.capitalGainsTax,
        prevMacroForFiscal.stateLocalRevenue,
        // transferTax + nonCorporateAssetTax derived from total - other known components
        prevMacroForFiscal.totalGovernmentRevenue
          - prevMacroForFiscal.wageIncomeTax
          - prevMacroForFiscal.employeePayrollTax
          - prevMacroForFiscal.employerPayrollTax
          - prevMacroForFiscal.corporateTaxRevenue
          - prevMacroForFiscal.capitalGainsTax
          - prevMacroForFiscal.stateLocalRevenue
          - prevMacroForFiscal.nonCorporateAssetTax,
        prevMacroForFiscal.nonCorporateAssetTax,
        prevMacroForFiscal.gdpNominal,
      );

      // 14b: Government spending (with Phase 8b effective consolidation multipliers)
      const spending = computeGovernmentSpending(
        revenue.totalGovernmentRevenue,
        BASELINE_PRIMARY_DEFICIT_GDP_RATIO,
        prevMacroForFiscal.gdpNominal,
        policyEffects.transferChannelAddition,
        0, // retrainingCosts — already included in transferChannelAddition
        0, // otherPolicyCosts — reserved for future use
        previousDebtStock,
        previousWeightedAvgDebtRate,
        consolidation.discretionaryMultiplier,
        consolidation.obligationMultiplier,
      );

      // 14c: Deficit and debt accumulation
      const debtResult = computeDebtAccumulation(
        spending.totalGovernmentSpending,
        revenue.totalGovernmentRevenue,
        spending.interestExpense,
        previousDebtStock,
        prevMacroForFiscal.gdpNominal,
      );

      const debtServiceRevenueRatio = revenue.totalGovernmentRevenue > 0
        ? spending.interestExpense / revenue.totalGovernmentRevenue
        : 0;

      // 14d: Full employment GDP and output gap
      // NOTE: Use BASELINE_GDP_NOMINAL_2025, NOT BASELINE_GDP_REAL_2025.
      // Model's gdpReal uses priceLevel=1.0 as base year → at t=0, gdpReal = gdpNominal ≈ $31.5T.
      // BASELINE_GDP_REAL_2025 = $23T (BEA chained 2017 dollars) — different deflator basis.
      // FIX 1: Use BASELINE_CPS_EMPLOYMENT (163.9M, household survey) instead of
      // BASELINE_TOTAL_EMPLOYMENT (158.5M, CES nonfarm payrolls) as denominator.
      // naturalEmployment is CPS-based (LF × (1 - NUR)), so the denominator must also
      // be CPS-based. The CES/CPS mismatch (5.5M gap from self-employed/agricultural
      // workers) inflated fullEmploymentGDP by 3.44%.
      // FIX 2: Use yearsSinceStartFM - 1 (previous year) for fullEmploymentGDP because
      // the output gap compares prevMacroForFiscal.gdpReal (year t-1) against potential.
      // Using year t's potential against year t-1's GDP created a structural -2.35% gap
      // (the economy hadn't had a chance to grow yet). Both sides of the ratio must be
      // for the same period.
      // Previous year's labor force for same-period consistency
      const prevYearLFGrowth = Math.pow(1 + (config.populationGrowthRate ?? DEFAULT_POPULATION_GROWTH_RATE), yearsSinceStartFM - 1);
      const prevDynamicLaborForce = config.laborForce * prevYearLFGrowth;
      const fullEmploymentGDP = computeFullEmploymentGDP(
        BASELINE_GDP_NOMINAL_2025,
        config.baselineGDPGrowth,
        yearsSinceStartFM - 1,
        prevDynamicLaborForce,
        BASELINE_CPS_EMPLOYMENT,
        NATURAL_UNEMPLOYMENT_RATE,
        automationCoverage,
      );
      const outputGap = fullEmploymentGDP > 0
        ? (prevMacroForFiscal.gdpReal - fullEmploymentGDP) / fullEmploymentGDP
        : 0;

      // 14e: Taylor Rule with dual mandate (Phase 8 Fix 4)
      const prevCompositeInflation = prevMacroForFiscal.compositeInflation ?? 0;
      const prevUnemploymentRate = prevMacroForFiscal.unemploymentRate ?? NATURAL_UNEMPLOYMENT_RATE;
      const taylorPrescribed = computeTaylorRule(
        config.neutralRealRate ?? 0.007,                        // Fix 4: configurable r*, default 0.7%
        prevCompositeInflation,
        config.inflationTarget ?? 0.02,
        outputGap,
        yearParams.taylorInflationCoeff.effective,               // Fix 4: per-year overridable via sidebar
        yearParams.taylorOutputGapCoeff.effective,                // Fix 4: per-year overridable via sidebar
        prevUnemploymentRate,                                    // NEW: employment gap
        NATURAL_UNEMPLOYMENT_RATE,                               // NEW: natural rate baseline
        yearParams.taylorEmploymentGapCoeff.effective,            // NEW: per-year overridable via sidebar
      );

      // 14f: Fiscal dominance check + policy rate override
      const policyRateOverride = config.policyRateSchedule
        ? interpolatePolicy(config.policyRateSchedule, year)
        : null;
      const prevPolicyRate = previousFiscalMonetary?.federalReserve.policyRate ?? INITIAL_10Y_YIELD;
      const fedResult = computeFiscalDominance(
        taylorPrescribed,
        prevPolicyRate,
        spending.interestExpense,
        revenue.totalGovernmentRevenue,
        config.fiscalDominanceThreshold ?? 0.25,
        config.fiscalDominanceDampening ?? 0.5,
        policyRateOverride,
      );

      // 14g: Monetization rate (Phase 8b: use effective parameters from three-layer resolution)
      // Phase 8 fix: restructured to max-of-all-cases + yield-responsive monetization
      const monetizationResult = computeMonetizationRate(
        fedResult.policyRate,
        config.effectiveLowerBound ?? -0.005,
        fedResult.fiscalDominanceActive,
        taylorPrescribed,
        fedResult.policyRate,
        yearParams.qeMonetizationRate.effective,
        debtServiceRevenueRatio,
        yearParams.maxFinancialRepressionRate.effective,
        // Phase 8 fix: yield-responsive monetization (uses previous year's 10Y yield)
        previousFiscalMonetary?.bondMarket.tenYearYield ?? INITIAL_10Y_YIELD,
        fiscalProfile.yieldResponseThreshold,
        fiscalProfile.maxYieldResponseRate,
        // Phase 8 Fix 3: previous monetization rate for asymmetric taper
        previousFiscalMonetary?.monetization.monetizationRate ?? 0,
      );
      const monetizationRateVal = monetizationResult.rate;

      // 14h: Money creation
      const prevMoneySupplyForMonetization = previousMoneySupply;
      const dynamicVelocityForMonetization = computeDynamicVelocity(
        BASELINE_VELOCITY_OF_MONEY,
        prevMacroForFiscal.unemploymentRate,
        NATURAL_UNEMPLOYMENT_RATE,
        prevMacroForFiscal.consumption,
        baselineConsumption ?? prevMacroForFiscal.consumption,
        config.velocitySensitivity ?? DEFAULT_VELOCITY_SENSITIVITY,
        VELOCITY_FLOOR_RATIO,
      );
      // Phase 8 Fix 3: Deficit composition for endogenous monetization transmission
      // Transfer-like spending has high MPC (85%), discretionary has medium (70%),
      // interest expense goes to bondholders/institutions with low MPC (20%).
      // When interest expense dominates (debt crisis), monetization produces much less CPI inflation.
      const totalGovSpending = spending.totalGovernmentSpending;
      const transferSpendingEst = policyEffects.transferChannelAddition
        + (BASELINE_GOVT_TRANSFERS * (previousMacro?.cumulativeInflationFactor ?? 1.0));
      const interestExpenseEst = spending.interestExpense;
      const discretionarySpendingEst = Math.max(0, totalGovSpending - transferSpendingEst - interestExpenseEst);

      let transferShareVal = totalGovSpending > 0 ? transferSpendingEst / totalGovSpending : 0.50;
      let discretionaryShareVal = totalGovSpending > 0 ? discretionarySpendingEst / totalGovSpending : 0.30;
      let interestShareVal = totalGovSpending > 0 ? interestExpenseEst / totalGovSpending : 0.20;

      // Normalize: shares must sum to 1.0 (transferSpendingEst + interestExpenseEst can exceed
      // totalGovSpending if COLA-adjusted transfers grew faster than the spending function accounts for)
      const shareSum = transferShareVal + discretionaryShareVal + interestShareVal;
      if (shareSum > 0) {
        transferShareVal /= shareSum;
        discretionaryShareVal /= shareSum;
        interestShareVal /= shareSum;
      }

      const moneyResult = computeMoneyCreation(
        debtResult.totalDeficit,
        monetizationRateVal,
        prevMoneySupplyForMonetization,
        dynamicVelocityForMonetization,
        prevMacroForFiscal.gdpNominal, // Use nominal GDP for correct Fisher equation: ΔP/P = ΔM×V / PY
        sectorWeightedDeflationRate,
        // Phase 8 Fix 3: deficit composition for transmission efficiency
        transferShareVal,
        discretionaryShareVal,
        interestShareVal,
        config.monetizationTransmissionSensitivity ?? 1.0,
      );

      // 14i: Expected policy rates (10-year forward projection)
      // Phase 8 Fix 4: employment gap projection + configurable convergence speed
      const yearsRemaining = config.endYear - year;
      const expectedAvgPolicyRate = computeExpectedPolicyRates(
        prevCompositeInflation,
        config.inflationTarget ?? 0.02,
        outputGap,
        config.neutralRealRate ?? 0.007,
        yearParams.taylorInflationCoeff.effective,       // per-year overridable
        yearParams.taylorOutputGapCoeff.effective,        // per-year overridable
        yearsRemaining,
        // Phase 8 fix: expectations incorporate fiscal dominance
        fedResult.fiscalDominanceActive,
        fedResult.dominanceFactor,
        // Phase 8 Fix 4: employment gap + convergence speed
        prevUnemploymentRate,
        NATURAL_UNEMPLOYMENT_RATE,
        yearParams.taylorEmploymentGapCoeff.effective,    // per-year overridable
        config.inflationConvergenceYears ?? 5,
      );

      // 14j: Fiscal risk premium (Phase 8 Fix 4: trajectory-based composite model)
      const initialDebtGDPRatio = INITIAL_FEDERAL_DEBT / BASELINE_GDP_NOMINAL_2025;
      const prevDebtGDPForRisk = debtGDPHistory.length >= 2
        ? debtGDPHistory[debtGDPHistory.length - 2]!
        : (INITIAL_FEDERAL_DEBT / BASELINE_GDP_NOMINAL_2025);
      // Nominal GDP growth rate from nominalGDPHistory (NOT prevMacroForFiscal vs previousMacro — same object!)
      // Phase 8 Fix 4: Fallback uses NOMINAL growth (real + inflation target) for r-g sustainability check.
      // BASELINE_GDP_GROWTH_RATE is REAL growth (~2%). At initial conditions with ~2% inflation,
      // nominal growth is ~4%. Using real growth as nominal makes r > g at baseline (2.9% > 2%),
      // producing a spurious sustainability premium that triggers a displacement-demand feedback cycle.
      const baselineNominalGrowth = (config.baselineGDPGrowth ?? BASELINE_GDP_GROWTH_RATE) + (config.inflationTarget ?? 0.02);
      const nominalGDPGrowthRate = nominalGDPHistory.length >= 2
        ? (nominalGDPHistory[nominalGDPHistory.length - 1]! - nominalGDPHistory[nominalGDPHistory.length - 2]!) / nominalGDPHistory[nominalGDPHistory.length - 2]!
        : baselineNominalGrowth;
      const fiscalRiskResult = computeFiscalRiskPremium(
        debtResult.debtGDPRatio,
        prevDebtGDPForRisk,
        previousWeightedAvgDebtRate,
        nominalGDPGrowthRate,
        config.fiscalRiskTrajectoryWeight ?? 0.50,
        config.fiscalRiskSustainabilityWeight ?? 0.35,
        config.fiscalRiskLevelWeight ?? 0.15,
        config.fiscalRiskPremiumMax ?? 0.06,
        config.fiscalRiskLevelMidpoint ?? 2.0,
        config.fiscalRiskTrajectoryMidpoint ?? 0.15,
      );
      const rawFiscalRiskPremium = fiscalRiskResult.fiscalRiskPremium;
      // Phase 8 fix: Consolidation credibility — markets reward fiscal effort
      // with lower risk premiums (up to consolidationCreditMax reduction).
      // Source: IMF Fiscal Monitor (2023) — consolidation episodes dataset
      const consolidationCreditMax = config.consolidationCreditMax ?? 0.40;
      const credibilityDiscount = 1.0 - (consolidation.consolidationIntensity * consolidationCreditMax);
      const fiscalRiskPremium = rawFiscalRiskPremium * credibilityDiscount;

      const foreignDemandRatio = computeForeignDemand(
        debtResult.debtGDPRatio,
        initialDebtGDPRatio,
        config.foreignTreasuryDemand ?? 0.30,
      );
      // Phase 8 Fix 3: Demand-adjusted supply pressure via absorption capacity
      const prevEquityReturn = previousFiscalMonetary?.equityMarket.marketReturn ?? 0;
      const prevConsumptionForAbsorption = prevMacroForFiscal.consumption;
      const prevAfterTaxTotal = (prevMacroForFiscal.afterTaxWageIncome ?? 0)
        + (prevMacroForFiscal.afterTaxAssetIncome ?? 0)
        + (prevMacroForFiscal.afterTaxTransferIncome ?? 0);
      const consumptionToIncomeRatio = prevAfterTaxTotal > 0
        ? Math.min(1.0, prevConsumptionForAbsorption / prevAfterTaxTotal)
        : 0.92;

      // Debt/GDP change rate: how fast is the fiscal trajectory deteriorating?
      const prevDebtGDP = debtGDPHistory.length >= 2
        ? debtGDPHistory[debtGDPHistory.length - 2]!
        : (INITIAL_FEDERAL_DEBT / BASELINE_GDP_NOMINAL_2025);
      const debtGDPChangeRate = debtResult.debtGDPRatio - prevDebtGDP;

      const absorptionCapacity = computeAbsorptionCapacity(
        prevEquityReturn,
        previousFiscalMonetary?.bondMarket.tenYearYield ?? INITIAL_10Y_YIELD,
        prevCompositeInflation,
        consumptionToIncomeRatio,
        debtGDPChangeRate,
        config.safetyFlightSensitivity ?? 1.5,
        config.yieldAttractionMidpoint ?? 0.06,
        config.inflationDeterrentSensitivity ?? 1.0,
        config.sovereignConfidenceDecayRate ?? 2.0,
      );

      // Phase 8 fix: removed monetizationRateVal arg (was double-counting)
      const yieldResult = computeTenYearYield(
        fedResult.policyRate,
        expectedAvgPolicyRate,
        config.termPremium ?? 0.003,  // Phase 8 Fix 4: configurable, down from 0.005
        fiscalRiskPremium,
        moneyResult.bondFinancedDeficit,
        foreignDemandRatio,
        prevMacroForFiscal.gdpNominal,
        // Phase 8 Fix 3: absorption capacity for demand-adjusted supply pressure
        absorptionCapacity,
        config.supplyPressureSensitivity ?? 1.0,
        // Phase 8 Fix 4: relative supply pressure — steady-state deficit already priced in
        BASELINE_DEFICIT_GDP_RATIO,
      );

      // 14k: Rate transmission
      const rates = computeRateTransmission(
        yieldResult.tenYearYield,
        fedResult.policyRate,
        BASELINE_MORTGAGE_SPREAD,
        BASE_CORPORATE_SPREAD,
        debtResult.debtGDPRatio,
        initialDebtGDPRatio,
      );

      // 14l: Equity market
      const currentCapScores = [
        capabilityScores.generative ?? 0,
        capabilityScores.agentic ?? 0,
        capabilityScores.embodied ?? 0,
      ];
      const momentumResult = computeGrowthMomentum(
        currentCapScores,
        previousCapabilityScores,
        historicalMaxCapabilityChange,
      );
      historicalMaxCapabilityChange = momentumResult.newHistoricalMax;
      previousCapabilityScores = [...currentCapScores];

      const currentCorporateProfits = prevMacroForFiscal.afterTaxCorporateProfits ?? BASELINE_CORPORATE_PROFITS;
      const equityResult = computeEquityValuation(
        yieldResult.tenYearYield,
        EQUITY_RISK_PREMIUM,
        currentCorporateProfits,
        prevCorporateProfitsForEquity,
        prevPrevCorporateProfitsForEquity,
        previousMarketCap,
        momentumResult.growthMomentum,
        config.aiPEMultiplier ?? 1.0,
      );

      // 14m: Update weighted average debt rate for next year's interest calculation
      // Phase 8 Fix 3: Endogenous debt maturity — rollover rate responds to fiscal stress.
      // Treasury shortens maturity (more bills/short notes) when long-term yields are expensive.
      // rawFiscalRiskPremium (line 1255) is in scope here — it's the pre-credibility-discount premium.
      // Treasury's maturity decision uses raw market perception, not the model's credibility adjustment.
      const rolloverResult = computeEndogenousRolloverRate(
        rawFiscalRiskPremium,
        config.fiscalRiskPremiumMax ?? 0.06,  // Phase 8 Fix 4: increased from 0.04
        yieldResult.tenYearYield,
        fedResult.policyRate,
        config.baseWeightedAverageMaturity ?? 6.0,
        config.minWeightedAverageMaturity ?? 2.5,
        config.maxWeightedAverageMaturity ?? 8.0,
        config.maturityStressSensitivity ?? 1.0,
      );

      const newWeightedAvgRate = computeWeightedAverageDebtRate(
        previousDebtStock,
        previousWeightedAvgDebtRate,
        rolloverResult.effectiveRolloverRate, // Phase 8 Fix 3: was DEBT_ROLLOVER_RATE (hardcoded 0.30)
        yieldResult.tenYearYield,
        debtResult.totalDeficit,
        debtResult.debtStock,
      );

      // Assemble FiscalMonetaryOutput
      fiscalMonetaryOutput = {
        fiscal: {
          federalDebtStock: debtResult.debtStock,
          debtGDPRatio: debtResult.debtGDPRatio,
          interestExpense: spending.interestExpense,
          debtServiceRevenueRatio,
          weightedAverageDebtRate: newWeightedAvgRate,
          totalGovernmentRevenue: revenue.totalGovernmentRevenue,
          revenueGDPRatio: revenue.revenueGDPRatio,
          laborTaxRevenue: revenue.laborTaxRevenue,
          corporateTaxRevenue: revenue.corporateTaxRevenue,
          primaryDeficit: debtResult.primaryDeficit,
          totalDeficit: debtResult.totalDeficit,
          // Phase 8a: Fiscal consolidation
          consolidationIntensity: consolidation.consolidationIntensity,
          discretionaryMultiplier: consolidation.discretionaryMultiplier,
          obligationMultiplier: consolidation.obligationMultiplier,
          revenueMultiplier: consolidation.revenueMultiplier,
          effectiveCOLAFactor: previousMacro?.cumulativeInflationFactor ?? 1.0, // Updated after macro call below
          // Phase 8 Fix 3: Endogenous debt maturity diagnostics
          weightedAverageMaturity: rolloverResult.weightedAverageMaturity,
          effectiveRolloverRate: rolloverResult.effectiveRolloverRate,
        },
        federalReserve: {
          taylorPrescribedRate: taylorPrescribed,
          policyRate: fedResult.policyRate,
          fiscalDominanceActive: fedResult.fiscalDominanceActive,
          fiscalDominanceGap: fedResult.fiscalDominanceGap,
          dominanceFactor: fedResult.dominanceFactor,
          outputGap,
          fullEmploymentGDP,
        },
        bondMarket: {
          tenYearYield: yieldResult.tenYearYield,
          expectedAveragePolicyRate: expectedAvgPolicyRate,
          termPremium: config.termPremium ?? 0.003,  // Phase 8 Fix 4: configurable
          fiscalRiskPremium,
          supplyPressurePremium: yieldResult.supplyPressurePremium,
          mortgageRate: rates.mortgageRate,
          corporateBorrowingRate: rates.corporateBorrowingRate,
          foreignDemandRatio,
          consolidationCredibility: credibilityDiscount,
          // Phase 8 Fix 3: Bond market absorption capacity
          absorptionCapacity,
          // Phase 8 Fix 4: Fiscal risk sub-components for diagnostics
          fiscalRiskTrajectoryComponent: fiscalRiskResult.trajectoryRisk,
          fiscalRiskSustainabilityComponent: fiscalRiskResult.sustainabilityRisk,
          fiscalRiskLevelComponent: fiscalRiskResult.levelRisk,
        },
        equityMarket: equityResult,
        monetization: {
          monetizationRate: monetizationRateVal,
          moneyCreated: moneyResult.moneyCreated,
          bondFinancedDeficit: moneyResult.bondFinancedDeficit,
          inflationFromMonetization: moneyResult.inflationFromMonetization,
          yieldResponseActive: monetizationResult.yieldResponseActive,
          yieldResponseMonetization: monetizationResult.yieldResponseMonetization,
          lolrActive: monetizationResult.lolrActive,
          lolrMonetization: monetizationResult.lolrMonetization,
          // Phase 8 Fix 3: Monetization transmission and taper diagnostics
          transmissionEfficiency: moneyResult.transmissionEfficiency,
          taperApplied: monetizationResult.taperApplied,
        },
      };

      // Update carry-forward state
      previousDebtStock = debtResult.debtStock;
      previousWeightedAvgDebtRate = newWeightedAvgRate;
      previousMarketCap = equityResult.aggregateMarketCap;
      prevPrevCorporateProfitsForEquity = prevCorporateProfitsForEquity;
      prevCorporateProfitsForEquity = currentCorporateProfits;
    }

    // Extract Phase 7 values for macroInputs injection
    const fm = fiscalMonetaryOutput;

    // 8-9. Compute ARPP, price level, GDP, tipping point, revenue pressure
    // FIX 8: Pass displacement-based automationCoverage
    // FIX C: Pass actual BLS baseline wage so wageRatio = 1.0 at t=0
    const macroInputs: MacroInputs = {
      year,
      laborForceGrowthFactor,
      totalRemainingEmployment: totalAfterSpillover,
      weightedAverageWage: aggregate.weightedAverageWage,
      totalDisplaced: aggregate.totalDirectDisplacement,
      automationCoverage,
      policyEffects,
      previousMacro,
      population: dynamicPopulation,
      laborForce: dynamicLaborForce,
      baselineAverageWage: actualBaselineAverageWage,
      sectorWeightedDeflationRate,
      baseInflationRate: config.baseInflationRate,
      baselineGDPGrowth: config.baselineGDPGrowth,
      // DEPRECATED: profitRealizationSensitivity — replaced by endogenous capital gains realization rate
      secondOrderParams,
      nominalGDPHistory,
      policyWageFloor,
      productionInputs,
      aiProfitMargin: config.aiProfitMargin ?? DEFAULT_AI_PROFIT_MARGIN,
      traditionalProfitMargin: config.traditionalProfitMargin ?? DEFAULT_TRADITIONAL_PROFIT_MARGIN,
      // Phase 5g Batch C: Price level decomposition
      // Phase 7: Use monetization inflation when available (replaces transfer inflation path)
      transferInflation: isFirstFiscalYear
        ? previousTransferInflation
        : fm.monetization.inflationFromMonetization,
      // Phase 7: Inject fiscal-monetary outputs into macro
      inflationFromMonetization: fm.monetization.inflationFromMonetization,
      mortgageRate: fm.bondMarket.mortgageRate,
      corporateBorrowingRate: fm.bondMarket.corporateBorrowingRate,
      marketReturn: fm.equityMarket.marketReturn,
      fiscalMonetaryPolicyRate: fm.federalReserve.policyRate,
      // TODO: demandEffects — no demand-pull inflation computation exists yet; leave at default 0
      minWageCostPush,
      // Phase 9: Supply chain macro inputs
      supplyChainCostPush: scEffects?.supplyChainCostPush,
      labProfitMarginAdjustment: scEffects?.labProfitMarginAdjustment,
      automationDividend: totalAutomationDividend,
      augmentationProfitBoost: totalAugmentationOutput * (1 - BASELINE_WAGE_SHARE),
      creditDeflationSensitivity: config.creditDeflationSensitivity ?? DEFAULT_CREDIT_DEFLATION_SENSITIVITY,
      scarcityInflation,
      // Phase 5i: Housing & Credit inputs
      embodiedCapability: capabilityScores.embodied ?? 0,
      foreclosureRateAggregate: hoResult.foreclosureRateAggregate,
      mortgageStressIndex,
      dynamicHomeownership,
      shelterCPIWeight: config.shelterCPIWeight,
      shelterInflationStickiness: config.shelterInflationStickiness,
      housingWealthMPC: config.housingWealthMPC,
      mpcWageUESensitivity: config.mpcWageUESensitivity,
      // DEPRECATED Phase 6: businessCreditGDPSensitivity replaced by growthTrajectorySensitivity
      // businessCreditGDPSensitivity: config.businessCreditGDPSensitivity,
      maxBusinessCreditLoosening: config.maxBusinessCreditLoosening,
      creditAdoptionAcceleration,
      // Housing Market Stabilization
      institutionalBuyerRate: config.institutionalBuyerRate,
      rentalDemandSensitivity: config.rentalDemandSensitivity,
      shelterInflationFloor: config.shelterInflationFloor,
      // Income distribution for Median CWI
      bottom80WageShare: config.bottom80WageShare,
      bottom80TransferShare: config.bottom80TransferShare,
      bottom80AssetShare: config.bottom80AssetShare,
      // Investment Demand Constraint — market signals (use previous year's values)
      prevAiCapacityUtilization: previousMacro?.aiCapacityUtilization ?? 1.0,
      consumerDemandRatio: dampedDemandRatioForInvestment,
      // DEPRECATED Phase 6: businessCreditSignal replaced by businessCreditTightening
      // businessCreditSignal: previousMacro?.businessCreditSignal ?? 0.0,
      aiUtilizationSensitivity: config.aiUtilizationSensitivity,
      consumerDemandInvestmentSensitivity: config.consumerDemandInvestmentSensitivity,
      // DEPRECATED Phase 6: creditInvestmentResponseSensitivity replaced by businessInvestmentImpact
      // creditInvestmentResponseSensitivity: config.creditInvestmentResponseSensitivity,
      traditionalInvestmentDemandSensitivity: config.traditionalInvestmentDemandSensitivity,
      traditionalInvestmentGDPFraction: config.traditionalInvestmentGDPFraction,
      baselineCreditFunded: capturedBaselineCreditFunded ?? undefined,
      // ═══ Phase 6: Consumer Credit Inputs (previous year — bank underwriting lag) ═══
      prevRealWageIncome: previousMacro
        ? previousMacro.afterTaxWageIncome / previousMacro.priceLevel
        : baselineHouseholdIncome ?? 0,
      prevRealTransferIncome: previousMacro
        ? previousMacro.afterTaxTransferIncome / previousMacro.priceLevel
        : 0,
      prevRealAssetIncome: previousMacro
        ? previousMacro.afterTaxAssetIncome / previousMacro.priceLevel
        : 0,
      prevHomePriceChangeRate: previousMacro?.homePriceChangeRate ?? 0,
      prevCWI: previousMacro?.consumerWelfareIndex ?? creditBaselineCWI ?? 100,
      baselineCWI: creditBaselineCWI ?? 100,
      prevCompositeInflation: previousMacro?.compositeInflation ?? 0,
      baselineRealHouseholdIncome: baselineHouseholdIncome ?? 0,
      // ═══ Phase 6: Business Credit Inputs ═══
      prevAfterTaxCorporateProfits: previousMacro?.afterTaxCorporateProfits
        ?? baselineCorporateProfits ?? 0,
      baselineCorporateProfits: baselineCorporateProfits ?? 0,
      // ═══ Phase 6: Credit Sensitivities (forwarded from config) ═══
      transferReliabilityWeight: config.transferReliabilityWeight,
      incomeAdequacySensitivity: config.incomeAdequacySensitivity,
      collateralSensitivity: config.collateralSensitivity,
      systemicRiskSensitivity: config.systemicRiskSensitivity,
      inflationRiskSensitivity: config.inflationRiskSensitivity,
      maxConsumerTightening: config.maxConsumerTightening,
      consumerCreditImpact: config.consumerCreditImpact,
      profitabilitySensitivity: config.profitabilitySensitivity,
      growthTrajectorySensitivity: config.growthTrajectorySensitivity,
      maxBusinessTightening: config.maxBusinessTightening,
      businessInvestmentImpact: config.businessInvestmentImpact,
      // ═══ Tax & Economic Pipeline (Phase 8b: effective rates from three-layer resolution) ═══
      incomeTaxRate: yearParams.effectiveIncomeTaxRate.effective,
      payrollTaxRate: yearParams.effectivePayrollTaxRate.effective,
      corporateTaxRate: yearParams.effectiveCorporateTaxRate.effective,
      capitalGainsTaxRate: yearParams.effectiveCapitalGainsTaxRate.effective,
      corporateRetentionRate: config.corporateRetentionRate ?? BASELINE_CORPORATE_RETENTION_RATE,
      aiProfitGrowthRate: config.aiProfitGrowthRate ?? DEFAULT_AI_PROFIT_GROWTH_RATE,
      postTaxMPC_Wage: config.postTaxMPCs?.wage ?? DEFAULT_POST_TAX_MPC_WAGE,
      postTaxMPC_Asset: config.postTaxMPCs?.asset ?? DEFAULT_POST_TAX_MPC_ASSET,
      postTaxMPC_Transfer: config.postTaxMPCs?.transfer ?? DEFAULT_POST_TAX_MPC_TRANSFER,
      aiCostParams: effectiveAiCostParams,
      // Baseline rates (structural, for delta computation)
      baselineIncomeTaxRate: BASELINE_INCOME_TAX_RATE,
      baselinePayrollRate: BASELINE_PAYROLL_RATE,
      baselineCorporateTaxRate: BASELINE_CORPORATE_TAX_RATE,
      baselineCapGainsRate: BASELINE_CAPITAL_GAINS_RATE,
      stateLocalTaxRate: STATE_LOCAL_TAX_RATE,
      transferTaxRate: TRANSFER_TAX_RATE,
      // Asset Income Decomposition — dynamic P/E
      aiPESensitivity: config.aiPESensitivity,
      traditionalPESensitivity: config.traditionalPESensitivity,
      // ═══ Phase 8a: Fiscal Response Profile ═══
      fiscalProfile,
      consolidationObligationMult: consolidation.obligationMultiplier,
      consolidationDiscretionaryMult: consolidation.discretionaryMultiplier,
      // ═══ Phase 8 Fix 5: Housing Model Inputs ═══
      homePriceIndex,
      prevMortgageRate: previousMortgageRate ?? fm.bondMarket.mortgageRate,
      populationGrowthRate: popGrowthRate,
      affordabilityPriceSensitivity: config.affordabilityPriceSensitivity,
      incomeHousingElasticity: config.incomeHousingElasticity,
      affordabilityReversionSensitivity: config.affordabilityReversionSensitivity,
      downwardStickinessRatio: config.downwardStickinessRatio,
      demographicHousingElasticity: config.demographicHousingElasticity,
      // Phase 10.A — Phillips Mechanism 2 inputs
      aiDisplacementUnemployment: currentYearAiDisplacementStock,
      aggregateReplacementDifficultyWagePremium,
      scarcityIntensity: config.scarcityIntensity ?? DEFAULT_SCARCITY_INTENSITY,
      laborForceBaseline: config.laborForce ?? US_LABOR_FORCE_2025,
    };
    const macro = computeMacro(macroInputs);

    // Track GDP history for rolling average demand feedback (Phase 1 overhaul)
    nominalGDPHistory.push(macro.gdpNominal);

    // Phase 8 Fix 5: Update cumulative home price index from macro's computed value
    homePriceIndex = macro.homePriceIndex;

    // Merge new job display metrics into macro output
    const macroWithJobs: MacroOutput = {
      ...macro,
      dynamicPopulation,
      dynamicLaborForce,
      automationCoverage: newJobMetrics.automationCoverage,
      newJobCreationRate: newJobMetrics.newJobCreationRate,
      durableNewJobs: newJobMetrics.durableNewJobs,
      netJobCreation: newJobMetrics.netJobCreation,
      // Phase 3c.1: Demand spillover metrics
      consumerDemandRatio,
      govDemandRatio,
      businessDemandRatio,
      aggregateDemandSurvival,
      totalDemandSpilloverLoss,
      // Phase 5g Step 12: Labor supply response
      voluntaryWithdrawalRate,
      effectiveLaborSupply: totalEffectiveLaborSupply,
      // Phase 5i: Homeownership quintile overrides from simulation loop state
      homeownershipQ1: dynamicHomeownership[0] ?? 0.47,
      homeownershipQ2: dynamicHomeownership[1] ?? 0.55,
      homeownershipQ3: dynamicHomeownership[2] ?? 0.63,
      homeownershipQ4: dynamicHomeownership[3] ?? 0.75,
      homeownershipQ5: dynamicHomeownership[4] ?? 0.81,
      avgHomeownership: dynamicHomeownership.reduce((a, b) => a + b, 0) / 5,
      // Phase 8 Fix 5: nominalWageGrowth kept on MacroOutput but zeroed (wage growth chain deprecated)
      nominalWageGrowth: 0,
      // Phase 10.A — cumulative AI-displacement unemployment override (simulation.ts authoritative)
      aiDisplacementUnemployment: currentYearAiDisplacementStock,
      // Phase 9: Supply chain diagnostics
      aggregateResilience: scEffects?.aggregateResilience ?? 0,
      cumulativeDelayGenerative: cumulativeCapabilityDelay.generative,
      cumulativeDelayAgentic: cumulativeCapabilityDelay.agentic,
      cumulativeDelayEmbodied: cumulativeCapabilityDelay.embodied,
      supplyChainCostPush: scEffects?.supplyChainCostPush ?? 0,
      cascadeBacklog: scEffects?.cascadeBacklog ?? 0,
      costPassThroughRate: scEffects?.costPassThroughRate ?? 0,
      adoptionDragMultiplier: scEffects?.adoptionDragMultiplier ?? 1,
      dynamicTrainingCompChips: scEffects?.dynamicTrainingComposition.aiChips ?? 0,
      dynamicTrainingCompEnergy: scEffects?.dynamicTrainingComposition.energy ?? 0,
      dynamicTrainingCompDC: scEffects?.dynamicTrainingComposition.datacenter ?? 0,
      effectiveComputeDeclineRate: scEffects?.effectiveComputeDeclineRate ?? DEFAULT_INFERENCE_ANNUAL_CHANGE,
      deploymentMultiplierCompute: scEffects?.deploymentCostMultipliers.compute ?? 1,
      deploymentMultiplierPhysical: scEffects?.deploymentCostMultipliers.physicalHardware ?? 1,
      deploymentMultiplierEnergy: scEffects?.deploymentCostMultipliers.energy ?? 1,
      automationDividend: totalAutomationDividend,
    };

    // Phase 5g Step 3: Dynamic money velocity
    if (baselineConsumption === null) {
      baselineConsumption = macro.consumption;
    }
    // Demand spillover baselines: capture year-0 real C/G/I
    if (demandBaselineRealC === null) {
      demandBaselineRealC = macro.consumption / macro.priceLevel;
      demandBaselineRealG = macro.governmentSpending / macro.priceLevel;
      demandBaselineRealI = macro.investment / macro.priceLevel;
    }
    // Phase 6: Capture baseline household income & corporate profits for credit functions
    if (baselineHouseholdIncome === null) {
      // Baseline underwritable income: uses same discount weights as computeConsumerCreditConditions
      // so that income adequacy ratio starts at 1.0 at baseline (no artificial tightening)
      const trw = config.transferReliabilityWeight ?? DEFAULT_TRANSFER_RELIABILITY_WEIGHT;
      baselineHouseholdIncome = (
        macro.afterTaxWageIncome * 1.0
        + macro.afterTaxTransferIncome * trw
        + macro.afterTaxAssetIncome * ASSET_INCOME_UNDERWRITING_WEIGHT
      ) / macro.priceLevel;
    }
    if (baselineCorporateProfits === null) {
      baselineCorporateProfits = macro.afterTaxCorporateProfits;
      creditBaselineCWI = macro.consumerWelfareIndex;
    }
    // Capacity gate baseline: capture credit-funded investment from year 0's ENDOGENOUS profits.
    // At t=0, retainedEarnings is overridden to BASELINE_RETAINED_EARNINGS (from BEA profit/GDP
    // ratio ~0.13), but corporateProfits output uses DEFAULT_TRADITIONAL_PROFIT_MARGIN (0.11).
    // When t=1 computes retainedEarnings from the OUTPUT profits, it's 15.6% lower, causing
    // investmentCapacity < investmentDemand → capacityGate < 1.0 → investment decline.
    // Fix: compute what retainedEarnings WOULD be from the actual endogenous profits, and use
    // the implied credit-funded portion as the baseline for creditCapacity scaling.
    if (capturedBaselineCreditFunded === null) {
      const corpTaxRate = BASELINE_CORPORATE_TAX_RATE;
      const corpRetentionRate = config.corporateRetentionRate ?? BASELINE_CORPORATE_RETENTION_RATE;
      const actualRetainedFromEndogenousProfits =
        macro.corporateProfits * (1 - corpTaxRate) * corpRetentionRate;
      capturedBaselineCreditFunded = macro.investment - actualRetainedFromEndogenousProfits;
    }
    // Baselines are intentionally FIXED at year-0 values.
    // Credit measures current conditions against pre-disruption starting point.
    // Do NOT adjust baselines for growth — that destroys the signal.
    let dynamicVelocity = computeDynamicVelocity(
      BASELINE_VELOCITY_OF_MONEY,
      macro.unemploymentRate,
      NATURAL_UNEMPLOYMENT_RATE,
      macro.consumption,
      baselineConsumption,
      config.velocitySensitivity ?? DEFAULT_VELOCITY_SENSITIVITY,
      VELOCITY_FLOOR_RATIO,
    );

    // Phase 7: Rate effect on velocity — higher policy rates reduce velocity
    // Higher rates → more saving, less spending → lower velocity
    const fmPolicyRate = fm.federalReserve.policyRate;
    const velocityRateEffect = Math.max(0.7, 1 - 0.02 * Math.max(0, fmPolicyRate - (config.neutralRealRate ?? 0.007)));
    dynamicVelocity *= velocityRateEffect;

    // DEPRECATED Phase 7: computeEndogenousFundingSplit() replaced by computeMonetizationRate()
    // in monetization.ts. The old function returned moneyCreatedFraction = 1.0 whenever
    // fiscalDeficitGDPRatio > 0 (always), causing hyperinflation. Phase 7's monetization
    // defaults to 0 in normal times (deficits are bond-financed, not monetized).
    // const fundingSplit = computeEndogenousFundingSplit(
    //   macro.gdpNominal,
    //   policyEffects.fiscalCost,
    //   macro.fiscalDeficitGDPRatio,
    // );

    // deltaM from deficit monetization (not transfers).
    // In normal times, monetizationRate = 0 → no money creation → no transfer inflation.
    // At ZLB or fiscal dominance, partial monetization occurs.
    const monetizedDeltaM = fm.monetization.moneyCreated;

    // Monetary state — deltaM now comes from deficit monetization, not old funding split
    const monetaryStateBase = computeMonetaryState(
      macro.priceLevel,
      macro.gdpReal,
      macro.aiDeflationRate,
      monetizedDeltaM, // deficit-monetized money creation (replaces totalTransfers path)
      dynamicPopulation,
      0,  // Phase 8a: moneyCreationShare = 0 — inflation handled by monetization module, not old monetary pathway
      previousMoneySupply,
      dynamicVelocity,
    );
    const monetaryState: import('@/types').MonetaryState = { ...monetaryStateBase, dynamicVelocity };

    previousMoneySupply = monetaryState.moneySupply;
    previousTransferInflation = monetaryState.actualInflationFromTransfers;

    // Capture baseline CWI from the first year of the simulation.
    // This is used as the target for "required ownership/transfer" calculations.
    if (baselineCWI === null) {
      baselineCWI = macroWithJobs.consumerWelfareIndex;
    }

    // Compute required asset ownership and transfer level (DATA_MODEL.md §8.4)
    // These answer: "How much ownership/transfer is needed to maintain year-0 CWI?"
    // Use CPS-consistent unemployment (non-cluster workers are employed, not unemployed)
    const totalUnemployment = Math.max(0, dynamicLaborForce - aggregate.totalRemainingEmployment - scaledNonClusterEmployed);
    const yearsSinceStart = year - config.startYear;
    const totalAIProfitsPerCapita =
      (config.policyConfig.sovereignWealthFund.totalAICompanyProfits *
        1_000_000_000 *
        Math.pow(1 + config.policyConfig.sovereignWealthFund.profitGrowthRate, yearsSinceStart)) /
      dynamicPopulation;

    // CWI = real income per capita (totalIncome / population / priceLevel).
    // Required ownership: what fraction of AI profits must be publicly
    // owned to maintain year-0 per-capita purchasing power.
    // Required transfer: what per-person transfer is needed to maintain
    // year-0 per-capita purchasing power.
    policyEffects.requiredAssetOwnership = computeRequiredAssetOwnership(
      baselineCWI,
      macroWithJobs.priceLevel,
      aggregate.totalRemainingEmployment,
      aggregate.weightedAverageWage,
      macroWithJobs.aggregateTransferIncome,
      dynamicPopulation,
      totalAIProfitsPerCapita,
    );

    policyEffects.requiredTransferLevel = computeRequiredTransferLevel(
      baselineCWI,
      macroWithJobs.priceLevel,
      aggregate.totalRemainingEmployment,
      aggregate.weightedAverageWage,
      macroWithJobs.aggregateAssetIncome,
      dynamicPopulation,
      totalUnemployment,
    );

    // Track key milestones
    if (depressionOnsetYear === null && macroWithJobs.isDepression) {
      depressionOnsetYear = year;
    }

    // 11. Compute state-level outputs (Phase 6)
    let stateOutputs: SimulationYearOutput['states'];
    if (stateDataMap && stateDataMap.size > 0) {
      stateOutputs = computeStateOutputs(
        year,
        stateDataMap,
        clusterResults,
        macroWithJobs,
        policyEffects,
        config.stateOverrides ?? {},
        config,
      );
    }

    // Phase 8a: Update effectiveCOLAFactor in fiscalMonetary after macro computes it.
    // The COLA dampening happens inside computeMacro() but the fiscal state is assembled before macro.
    // The effectiveCIF is encoded in macro's cumulativeInflationFactor output vs the dampened version.
    // We track it via the macro output's cumulativeInflationFactor — if no dampening, it equals CIF.
    if (fiscalMonetaryOutput.fiscal && fiscalProfile) {
      // effectiveCIF is the dampened factor used for transfers inside computeMacro.
      // Since macro applies dampening internally, we can derive it:
      // if colaDampening is active, macro.baselineTransferIncome = BASELINE_TRANSFER_INCOME × effectiveCIF.
      // For simplicity, store the CIF from macro output (which is always the raw undampened CIF).
      // The actual dampened CIF is only used internally in macro. We report it for CSV transparency.
      const cif = macroWithJobs.cumulativeInflationFactor;
      let effectiveCIF = cif;
      if (cif > fiscalProfile.colaDampeningThreshold) {
        const dampenRange = fiscalProfile.colaDampeningMaxCIF - fiscalProfile.colaDampeningThreshold;
        const dampenIntensity = dampenRange > 0
          ? Math.min(1, (cif - fiscalProfile.colaDampeningThreshold) / dampenRange) : 1.0;
        const dampenFactor = 1.0 - dampenIntensity * fiscalProfile.colaDampeningRate;
        effectiveCIF = 1.0 + (cif - 1.0) * dampenFactor;
      }
      fiscalMonetaryOutput.fiscal.effectiveCOLAFactor = effectiveCIF;
    }

    // Phase 8a: Track debt/GDP history for consolidation lag
    if (fiscalMonetaryOutput.fiscal) {
      debtGDPHistory.push(fiscalMonetaryOutput.fiscal.debtGDPRatio);
    }

    // 12. Store outputs
    const yearOutput: SimulationYearOutput = {
      year,
      capabilities: capabilityScores,
      clusters: clusterResults,
      macro: macroWithJobs,
      monetary: monetaryState,
      policyEffects,
      states: stateOutputs,
      fiscalMonetary: fiscalMonetaryOutput, // Phase 7
      // Phase 8a: Real demand ratios
      realConsumerDemandRatio: consumerDemandRatio,
      realGovDemandRatio: govDemandRatio,
      realBusinessDemandRatio: businessDemandRatio,
    };

    years.push(yearOutput);
    previousMacro = macroWithJobs;
    previousFiscalMonetary = fiscalMonetaryOutput; // Phase 7
    previousMortgageRate = fm.bondMarket.mortgageRate; // Phase 8 Fix 5: Track for housing YoY

    // Phase 10.A — commit staged next-year α + scarcity wage-adjustment maps. No smoothing.
    for (const [clusterId, alpha] of nextAlphaByCluster) {
      priorYearAlphaByCluster.set(clusterId, alpha);
    }
    for (const clusterId of Object.keys(nextAlphaByRole)) {
      priorYearAlphaByRole[clusterId] = { ...nextAlphaByRole[clusterId]! };
    }
    for (const [clusterId, adj] of nextWageAdjByCluster) {
      priorYearWageAdjustmentByCluster.set(clusterId, adj);
    }

    // Phase 9: Update supply chain carry-forward state
    if (scConfig) {
      chipSupplyHistory.push(scConfig.inputs.aiChips);
      supplyChainShockHistory = [scConfig.inputs, supplyChainShockHistory[0]];
    }
    // Phase 9: Update cognitive/embodied progress for next year's sensitivity blend
    let totalCogEmp = 0, totalCogDisp = 0;
    let totalEmbEmp = 0, totalEmbDisp = 0;
    for (const cr of clusterResults) {
      const cl = effectiveClusters.find(c => c.id === cr.clusterId);
      if (!cl) continue;
      const baseEmp = cr.totalRemainingEmployment + cr.totalDirectDisplacement;
      if (cl.deploymentType === 'software' || cl.deploymentType === 'hybrid') {
        totalCogEmp += baseEmp;
        totalCogDisp += cr.totalDirectDisplacement;
      } else {
        totalEmbEmp += baseEmp;
        totalEmbDisp += cr.totalDirectDisplacement;
      }
    }
    cognitiveProgress = totalCogEmp > 0 ? totalCogDisp / totalCogEmp : 0;
    embodiedProgress = totalEmbEmp > 0 ? totalEmbDisp / totalEmbEmp : 0;

    // Phase 8b: Capture complete inter-year state for restart-from-year.
    // CRITICAL: every variable carried across the loop boundary must be here.
    yearSnapshots.set(year, {
      year,
      previousMacro: macroWithJobs,
      previousFiscalMonetary: fiscalMonetaryOutput,
      previousMoneySupply,
      previousTransferInflation,
      previousDebtStock,
      previousWeightedAvgDebtRate,
      debtGDPHistory: [...debtGDPHistory],
      previousFundSize,
      triggerYears: JSON.parse(JSON.stringify(triggerYears)),
      previousMarketCap,
      historicalMaxCapabilityChange,
      prevCorporateProfitsForEquity,
      prevPrevCorporateProfitsForEquity,
      previousCapabilityScores: previousCapabilityScores ? [...previousCapabilityScores] : null,
      baselineCWI,
      baselineConsumption,
      baselineHouseholdIncome,
      baselineCorporateProfits,
      creditBaselineCWI,
      startYearAiGDP,
      dynamicHomeownership: [...dynamicHomeownership],
      displacementHistory: displacementHistory.map(m => new Map(m)),
      depressionOnsetYear,
      monetaryCollapseYear,
      nominalGDPHistory: [...nominalGDPHistory],
      // Supply chain state (Phase 9)
      supplyChainShockHistory: [{ ...supplyChainShockHistory[0] }, { ...supplyChainShockHistory[1] }] as [SupplyChainInputs, SupplyChainInputs],
      cumulativeCapabilityDelay: { ...cumulativeCapabilityDelay },
      adoptionState: JSON.parse(JSON.stringify(adoptionState)) as AdoptionState,
      supplyChainResilience: scEffects?.effectiveResilience
        ?? { aiChips: 0.05, energy: 0.85, trainingDC: 0.90, inferenceDC: 0.90, roboticsHardware: 0.05 },
      cascadeBacklog: scEffects?.cascadeBacklog ?? 0,
      chipSupplyHistory: [...chipSupplyHistory],
    });

    // Monetary collapse: if priceLevel hit the cap, record this year and fill remaining
    // years with frozen data (the simulation is no longer producing meaningful output).
    if (macroWithJobs.cyclePhase === 'MONETARY_COLLAPSE') {
      monetaryCollapseYear = year;
      for (let fillYear = year + 1; fillYear <= config.endYear; fillYear++) {
        years.push({
          ...yearOutput,
          year: fillYear,
          macro: { ...macroWithJobs, year: fillYear },
        });
      }
      break;
    }
  }

  // Compute summary
  const summary = computeSummary(years, config.policyConfig);

  return {
    config,
    years,
    depressionOnsetYear,
    prepWindowOpen: summary.prepWindowOpen,
    prepWindowClose: summary.prepWindowClose,
    prepWindowDuration: summary.prepWindowDuration,
    fiscalWindowOpen: summary.fiscalWindowOpen,
    fiscalWindowClose: summary.fiscalWindowClose,
    fiscalWindowDuration: summary.fiscalWindowDuration,
    gdpPeakYear: summary.gdpPeakYear,
    gdpPeakValue: summary.gdpPeakValue,
    cycleStartYear: summary.cycleStartYear,
    valleyFloorYear: summary.valleyFloorYear,
    valleyFloorCWI: summary.valleyFloorCWI,
    valleyDepthPct: summary.valleyDepthPct,
    recoveryYear: summary.recoveryYear,
    monetaryCollapseYear,
    summary,
    // Phase 8b: Parameter provenance timeline + year snapshots
    parameterTimeline,
    yearSnapshots,
  };
}

// ============================================================
// Phase 8b: Restart-from-Year
// ============================================================

/**
 * Run simulation starting from a snapshot (for efficient re-simulation
 * when user changes per-year overrides).
 *
 * Initializes all loop variables from the snapshot and runs from
 * startFromYear to config.endYear. Returns a full SimulationTimeline
 * but only the re-simulated years are populated.
 *
 * The snapshot must be from (startFromYear - 1) — i.e., the end-of-year
 * state just before the year we want to start from.
 *
 * @param config - Full simulation configuration
 * @param clusters - All occupation clusters
 * @param startFromYear - The year to begin re-simulation (inclusive)
 * @param snapshot - YearSnapshot from (startFromYear - 1)
 * @param userOverrides - User per-year parameter overrides
 * @param blsBaselines - Optional BLS employment/wage baselines
 * @param stateDataMap - Optional state-level data
 * @returns SimulationTimeline with re-simulated years only
 */
export function runSimulationFromYear(
  config: SimulationConfig,
  clusters: OccupationCluster[],
  startFromYear: number,
  snapshot: YearSnapshot,
  userOverrides: UserOverrideMap,
  blsBaselines?: Map<string, OccupationBaseline>,
  stateDataMap?: Map<StateCode, StateData>,
): SimulationTimeline {
  // For Phase 8c: this will be implemented to initialize all loop variables
  // from the snapshot and run from startFromYear onward.
  // For now, fall through to full simulation (correctness over performance).
  return runSimulation(config, clusters, blsBaselines, stateDataMap, userOverrides);
}

/**
 * Compute simulation summary statistics.
 */
function computeSummary(
  years: SimulationYearOutput[],
  _policyConfig: SimulationConfig['policyConfig'],
): SimulationSummary {
  let peakEmployment = { year: 0, value: 0 };
  let minimumEmployment = { year: 0, value: Infinity };
  let peakGDP = { year: 0, value: 0 };
  let minimumGDP = { year: 0, value: Infinity };
  let maxUnemploymentRate = { year: 0, value: 0 };
  let depressionOnsetYear: number | null = null;

  for (const yearData of years) {
    const { macro } = yearData;

    if (macro.totalEmployment > peakEmployment.value) {
      peakEmployment = { year: macro.year, value: macro.totalEmployment };
    }
    if (macro.totalEmployment < minimumEmployment.value) {
      minimumEmployment = { year: macro.year, value: macro.totalEmployment };
    }
    if (macro.gdpNominal > peakGDP.value) {
      peakGDP = { year: macro.year, value: macro.gdpNominal };
    }
    if (macro.gdpNominal < minimumGDP.value) {
      minimumGDP = { year: macro.year, value: macro.gdpNominal };
    }
    if (macro.unemploymentRate > maxUnemploymentRate.value) {
      maxUnemploymentRate = { year: macro.year, value: macro.unemploymentRate };
    }
    if (depressionOnsetYear === null && macro.isDepression) {
      depressionOnsetYear = macro.year;
    }
  }

  // Determine if policy prevents depression
  const policyPreventsDepression = depressionOnsetYear === null;

  // === Two-Part Policy Window (Phase 5 Cleanup) ===

  // Preparation Window
  // Opens: first year where unemployment rate >= baseline + 1pp (Sahm Rule analog)
  // Closes: first year after open where cycle phase hits ACCELERATING_DECLINE
  const baselineUE = years[0]?.macro.unemploymentRate ?? 0;
  let prepWindowOpen: number | null = null;
  let prepWindowClose: number | null = null;
  for (const yearData of years) {
    if (prepWindowOpen === null) {
      if (yearData.macro.unemploymentRate >= baselineUE + PREP_WINDOW_UE_RISE_THRESHOLD) {
        prepWindowOpen = yearData.year;
      }
    } else if (prepWindowClose === null) {
      if (yearData.macro.cyclePhase === 'ACCELERATING_DECLINE'
        || yearData.macro.cyclePhase === 'MONETARY_COLLAPSE') {
        prepWindowClose = yearData.year;
      }
    }
  }
  const prepWindowDuration = (prepWindowOpen !== null && prepWindowClose !== null)
    ? prepWindowClose - prepWindowOpen
    : null;

  // Fiscal Window
  // Opens: first year where GDP still growing AND we're at or past the prep trigger
  //   (economy healthy enough to fund programs AND displacement has started)
  // Closes: first year after open where GDP growth turns negative
  //   (contracting economy = no fiscal room for new commitments)
  let fiscalWindowOpen: number | null = null;
  let fiscalWindowClose: number | null = null;
  for (const yearData of years) {
    if (fiscalWindowOpen === null) {
      if (prepWindowOpen !== null
        && yearData.year >= prepWindowOpen
        && yearData.macro.gdpGrowthRate > 0) {
        fiscalWindowOpen = yearData.year;
      }
    } else if (fiscalWindowClose === null) {
      if (yearData.macro.gdpGrowthRate <= 0) {
        fiscalWindowClose = yearData.year;
      }
    }
  }
  const fiscalWindowDuration = (fiscalWindowOpen !== null && fiscalWindowClose !== null)
    ? fiscalWindowClose - fiscalWindowOpen
    : null;

  // GDP peak tracking (already computed above as peakGDP)
  const gdpPeakYear = peakGDP.value > 0 ? peakGDP.year : null;
  const gdpPeakValue = peakGDP.value;

  // === Vicious Cycle Detection (Phase 5 Chart Redesign) ===
  // Detect 3+ consecutive years of negative CWI growth
  let cycleStartYear: number | null = null;
  let consecutiveDecline = 0;
  for (const yearData of years) {
    if (yearData.macro.cwiGrowthRate < 0) {
      consecutiveDecline++;
      if (consecutiveDecline >= 3 && cycleStartYear === null) {
        cycleStartYear = yearData.year - consecutiveDecline + 1;
      }
    } else {
      consecutiveDecline = 0;
    }
  }

  // Valley floor: minimum CWI value
  let peakCWI = 0;
  let valleyFloorYear: number | null = null;
  let valleyFloorCWI = Infinity;
  for (const yearData of years) {
    const cwi = yearData.macro.consumerWelfareIndex;
    if (cwi > peakCWI) peakCWI = cwi;
    if (cwi < valleyFloorCWI) {
      valleyFloorCWI = cwi;
      valleyFloorYear = yearData.year;
    }
  }
  // If CWI never drops below its initial value, there's no valley
  if (valleyFloorCWI >= peakCWI) {
    valleyFloorYear = null;
    valleyFloorCWI = 0;
  }

  const valleyDepthPct = peakCWI > 0 && valleyFloorYear !== null
    ? (peakCWI - valleyFloorCWI) / peakCWI
    : 0;

  // Recovery year: first year CWI grows after the valley
  let recoveryYear: number | null = null;
  if (valleyFloorYear !== null) {
    for (const yearData of years) {
      if (yearData.year > valleyFloorYear && yearData.macro.cwiGrowthRate > 0) {
        recoveryYear = yearData.year;
        break;
      }
    }
  }

  return {
    peakEmployment,
    minimumEmployment,
    depressionOnsetYear,
    peakGDP,
    minimumGDP,
    maxUnemploymentRate,
    policyPreventsDepression,
    prepWindowOpen,
    prepWindowClose,
    prepWindowDuration,
    fiscalWindowOpen,
    fiscalWindowClose,
    fiscalWindowDuration,
    gdpPeakYear,
    gdpPeakValue,
    cycleStartYear,
    valleyFloorYear,
    valleyFloorCWI,
    valleyDepthPct,
    recoveryYear,
  };
}
