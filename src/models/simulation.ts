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
  AICostParams,
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
// The data-calibration side channel's payload contract (type-only — the VALUES arrive
// through the composition argument; the store resolves them from the manifest registry).
import type { DataCalibrationPayload } from '@/data/anthropic/types';
import {
  DEFAULT_START_YEAR,
  DEFAULT_SWF_START_YEAR,
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
  // DEPRECATED (Stage 5 / H3): TRANSFER_GROWTH_PER_UE_POINT retired from the loop
  // TRANSFER_GROWTH_PER_UE_POINT,
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
  DEFAULT_RESILIENCE_ONSET_YEARS,
  MIN_REGULATORY_FRICTION,
  DEFAULT_NEW_JOB_WAGE_FRACTION,
  DEFAULT_AUGMENTATION_MULTIPLIER,
  PREP_WINDOW_UE_RISE_THRESHOLD,
  // DEPRECATED: Fiscal window now uses GDP growth rate, not AI GDP threshold / GDP decline threshold
  // FISCAL_WINDOW_AI_GDP_THRESHOLD,
  // FISCAL_WINDOW_GDP_DECLINE_THRESHOLD,
  EMPLOYMENT_MULTIPLIERS,
  SIMPLE_AVG_EMPLOYMENT_MULTIPLIER,
  DEFAULT_POPULATION_GROWTH_RATE,
  DEFAULT_PRODUCTIVITY_PASSTHROUGH,
  DEFAULT_CREDIBILITY_HORIZON_YEARS,
  DEFAULT_FISCAL_CREDIBILITY_TRIGGER,
  PCE_CPI_WEDGE,
  TERM_PREMIUM,
  DEFAULT_FISCAL_RISK_PREMIUM_MAX,
  DEFAULT_INFLATION_CONVERGENCE_YEARS,
  DEBT_ROLLOVER_COUPON_RATE,
  DEFAULT_TAYLOR_SMOOTHING,
  DEFAULT_FISCAL_DOMINANCE_THRESHOLD,
  INITIAL_POLICY_RATE,
  ANCHOR_INIT_2025,
  BASELINE_DEBT_SERVICE_REVENUE_RATIO,
  DEFAULT_LAUBACH_LEVEL_BETA,
  DEFAULT_LAUBACH_DEFICIT_BETA,
  DEFAULT_MONETIZATION_DOMINANCE_THRESHOLD,
  DEFAULT_MONETIZATION_PREMIUM_COCONDITION,
  DEFAULT_FISCAL_ADJUSTMENT_HORIZON_YEARS,
  DEFAULT_VELOCITY_SENSITIVITY,
  VELOCITY_FLOOR_RATIO,
  DEFAULT_AI_PROFIT_MARGIN,
  DEFAULT_TRADITIONAL_PROFIT_MARGIN,
  DEFAULT_INFERENCE_ANNUAL_CHANGE,
  DEFAULT_TRAINING_SCALE_GROWTH_RATE,
  DEFAULT_FLYWHEEL_STARVATION_THRESHOLD,
  DEFAULT_FRONTIER_COST_ELASTICITY,
  DEFAULT_CREDIT_DEFLATION_IMPULSE_SENSITIVITY,
  DEFAULT_CREDIT_DEFLATION_PERSISTENCE,
  DEFAULT_CREDIT_DEFLATION_NOISE_FLOOR,
  DEFAULT_ERP_CRISIS_SENSITIVITY,
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
  // ═══ Production Program Stage 2 — Channel 2 (the ledger re-anchor) ═══
  CLUSTER_VA_PER_WORKER,
  DEFAULT_UNITS_PER_EMBODIED_WORKER,
  // DEPRECATED (Phase 10.A fix #2): DEFAULT_MAX_ADOPTION_FRICTION_YEARS no longer read.
  DEFAULT_COMPETITIVE_PRESSURE_THRESHOLD,
  // Mini-stage 2: the reverse gear's speed-dial defaults
  ADOPTION_DECLINE_RATE_COGNITIVE,
  ADOPTION_DECLINE_RATE_EMBODIED,
  DEFAULT_RE_ADOPTION_RATE_FRACTION,
  DEFAULT_POOL_EXIT_BASE,
  DEFAULT_POOL_EXIT_DURATION_SLOPE,
  DEFAULT_POOL_ATROPHY_RATE,
  DEFAULT_POOL_WAGE_SCARRING_RATE,
  CURRENT_LAW_UI_DURATION_WEEKS,
  ALPHA_BASELINE_CORPORATE_MARGIN,
  DEFAULT_AI_COST_PARAMS,
  BUILDOUT_LEG_COST_TREND, // Stage 4 MS3: the energy bend's standing-trend base
  AI_ENERGY_OPEX_SEAM_RATE, // Stage 5A (A3): the opex line's seam anchor
  // Stage 4 MS4 (the adoption-gating build): the priority's friction surface +
  // the one new [e] smoothing constant.
  ROLE_AI_REPLACEMENT_FRICTION_YEARS_DEFAULTS,
  FALLBACK_REPLACEMENT_FRICTION_YEARS,
  DEFAULT_FLEET_ALLOC_SMOOTHING,
} from './constants';
import { getAllCapabilityScores, computeWeightedCapability } from './capabilities';
import { checkAdoptionTrigger, findTriggerYear, deriveSeamCheaperThreshold, computeBetterScore, computeCheaperScore } from './bfcs';
// Mini-stage 1: the ONE realized-cost object (frontier-intensity layer + arrival-anchored
// fixed-capability pricing) — the only inference-cost assembly in the model.
import { computeAiCostFraction, computeTokenCostFactor, computeFrontierCost, resolveFrontierDials, coupledTokenCostCurve, type RoleCostBreakdown } from './aiCost';
import { computeEffectiveAlpha, computePeerAlpha, buildClusterEmploymentMap } from './alphaDrivers';
import { computeAugmentationAdoption } from './augmentationAdoption';
import { getAdoptionRate, computeUnifiedAdoptionState } from './adoption';
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
import { computeFullEmploymentGDP, computeTaylorRule, computeFiscalDominance, getBaselineFederalReserveState,
  computePluckingPotential, AI_PRODUCTIVITY_BOOST_AT_FULL_COVERAGE,
} from './federalReserve';
import { computeMonetizationRate, computeMoneyCreation, getBaselineMonetizationState } from './monetization';
import { computeFiscalRiskPremium, computeForeignDemand, computeExpectedPolicyRates, computeAbsorptionCapacity, computeTenYearYield, computeRateTransmission, getBaselineBondMarketState } from './bondMarket';
import { computeGrowthMomentum, computeEquityValuation, getBaselineEquityMarketState, computeCrisisAdjustedERP } from './equityMarket';
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
import { computeDisplacedPool } from './uiIncidence';
// Mini-stage 3: the duration-structured pool (checkpoint §5)
import {
  advanceDisplacedPool, emptyDisplacedPoolState, poolFillBudget, poolRehireWage,
  poolDurationShares, type DisplacedPoolState, type PoolDials,
} from './uiIncidence';
import { interpolatePolicy } from '@/utils/policyInterpolation';
// Phase 8b: Autopilot + parameter resolution
import { computeAutopilotParameters, getBaselineAutopilot, getBaselineTaxRates } from './autopilot';
// Mini-stage 1: defaultTokenUsageMultiplier + the per-year tokenUsage resolveParameter call
// RETIRED with the global schedule (Amendment 2 — no legacy toggles).
// R1 (the axes program): resolveParameter retired FROM THIS FILE with the rsc block —
// simulation consumes only the ONE producer (resolveAllParameters) + the mirror attach;
// the single-producer guard (R1-B6) enforces this. Import commented, not stripped.
import { resolveAllParameters, attachCapabilityMirrors, stickyLayerValue /* , resolveParameter */ } from './parameterResolution';
// Phase 9: Supply chain
import {
  computeSupplyChainEffects,
  applyPropagationLags,
  computeFasterMultiplier,
  computeSaferMultiplier,
  computeAdoptionDrag,
  computeHysteresisWidth,
  // RETIRED (mini-stage 2): computeStatefulAdoptionRate — superseded by the unified machine
  // (adoption.ts computeUnifiedAdoptionState); kept in supplyChain.ts as the deprecated record.
  // computeStatefulAdoptionRate,
  // R1: the C-1/C-2 direct calls retired with the rsc block — both now reach execution
  // through the autopilot inside the one producer. Imports commented, not stripped.
  // computeAutopilotResilience,
  // interpolatePassThrough,
  getDefaultSupplyChainConfig,
  SUPPLY_CHAIN_PARAM_KEYS,
  // MS1 (the frontier stock): the delivered-resilience lookup for the ruled onset
  // dead time. FLYWHEEL MS (the hoist): the stock update runs HERE in the loop now
  // (always-on; demand-side input) — the update function and dial resolver import.
  lookupDeliveredResilience,
  computeFrontierStockUpdate,
  resolveFrontierStockDials,
} from './supplyChain';
import type { SupplyChainConfig, SupplyChainResilience } from '@/types/supplyChain';
// Production Program Stage 1 — Channel 1 (the buildout machine)
import {
  getInitialBuildoutState, computeBuildoutPlan, applyBuildout, trainingShare,
  flopsPerWattFactor, // Stage 5A (A3): the opex line's efficiency normalization
  type BuildoutPlan,
} from './buildout';
// Stage 2 (T-A): the static share import retired — u_supply consumes the derived
// trainingShare(year) (buildout.ts). Kept per the no-delete rule:
// import { FLEET_DEPRECIATION, BUILDOUT_TRAINING_SHARE_2025 } from './constants';
import {
  FLEET_DEPRECIATION, BUILDOUT_IMPORT_CONTENT_SHARE,
  DEFAULT_EQUITY_ISSUANCE_RATE, EQUITY_ISSUANCE_WINDOW_SENSITIVITY,
  DEFAULT_AI_RD_INTENSITY, DEFAULT_RD_TFP_ELASTICITY, DEFAULT_RD_DEPRECIATION,
  BASELINE_BUSINESS_RD_STOCK,
} from './constants'; // DEFAULT_ERP_CRISIS_SENSITIVITY already imported above (the main constants block)

/**
 * Get default simulation configuration.
 */
export function getDefaultSimulationConfig(): SimulationConfig {
  return {
    startYear: DEFAULT_START_YEAR,
    endYear: DEFAULT_END_YEAR,
    capabilities: { ...DEFAULT_CAPABILITY_TRAJECTORIES },
    adoptionParams: { ...DEFAULT_ADOPTION_PARAMS },
    // The latent-hazard fix (the policy-wiring review): DEEP clone — the shallow
    // spread shared the nested policy blocks (ubi, wageSubsidy, …) as module-level
    // references across every call, so one in-place nested mutation anywhere
    // would contaminate the module default and every later config.
    policyConfig: structuredClone(DEFAULT_POLICY_CONFIG),
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
    // by-reference (audit H679, single-source-of-truth rule — the stale-fallback-family finding):
    // Phase 8 Fix 4 raised this from 0.04; the value now lives ONLY in constants.ts.
    fiscalRiskPremiumMax: DEFAULT_FISCAL_RISK_PREMIUM_MAX,
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
    termPremium: TERM_PREMIUM,  // E-8c F-C: 0.007 per NY Fed ACM (ACMTP10) — see constants.ts; was 0.003 (the hawkish-path backout era)
    inflationConvergenceYears: DEFAULT_INFLATION_CONVERGENCE_YEARS, // by-reference (audit H679, single-source-of-truth rule)
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
    // DEPRECATED (Production Program Stage 2, order item 5): the replacementMultiplier
    // dial retired with the ledger re-anchor (config influence removed; the deflation
    // channel consumes the frozen constant). Kept per the no-delete rule:
    // replacementMultiplier: DEFAULT_REPLACEMENT_MULTIPLIER,
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
  // CITATION STATUS (FS-6f, honest): the equal-share employment estimate (1/totalClusters)
  // and the (0.5 + seniority) wage scaling carry NO empirical source — this is the
  // DEPRECATED last-resort estimator for clusters with no OEWS series. Post-FS-6f it serves
  // ONLY gov_federal and gov_state_local (cross-cutting SOC codes, no OEWS cluster series;
  // scoped to government ADMINISTRATIVE functions). The magnitudes are unsourced, not
  // contradicted by record; the FIX-6 renormalization bounds the aggregate.
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
 * Compute AI production expansion — PRODUCTION PROGRAM STAGE 2 (Channel 2): the ledger
 * RE-ANCHORED to cluster VALUE ADDED (ratification R1-A1; checkpoint §2).
 *
 * THE CEILING/EMISSION SPLIT (STAGE2_BATTERIES.md, pre-registered interpretation 1):
 *   potentialCeiling_c(t) = VA_c × BFCSClearance_c(t) × EmbodimentGate_c(t)
 *     — the checkpoint formula verbatim: the market value of the cluster's work whose
 *       roles clear all four BFCS bars, embodiment-gated. Surfaced; never emitted raw.
 *   emitted_c(t) = max(0, VA_c × Gate_c(t) − W0_c) × automatedShare_c(t)
 *     — the EMISSION tracks REALIZED automation (the adoption S-curve), not clearance:
 *       a clearance-driven emission would claim output for work whose humans are still
 *       employed and augmentation-boosted (fails the ratified no-double-count battery).
 *       The − W0_c continuation-netting keeps this an EXPANSION ledger: the automated
 *       work's former labor input is not new output. The uncited ×2.0
 *       replacementMultiplier is REPLACED BY THE MEASURED PER-CLUSTER MULTIPLE
 *       (VA_c/W0_c − 1, BEA-anchored); clusters whose anchored VA sits below their
 *       wage mass emit 0 (reported, the education-class floors).
 *   VA_c = CLUSTER_VA_PER_WORKER × year-0 cluster employment × econIdx (the
 *       basis-commensurability step — loader doc; econIdx = the real economy index,
 *       the market grows with the economy it serves).
 *   automatedShare_c = displaced vintage wage mass / W0_c — the H3 trigger-time
 *       vintage basis UNCHANGED (year-0 role wages; cascade-invariant; full
 *       displacement ⇒ full share — battery H3-B3).
 *
 * THE EMBODIMENT GATE (A5′ §1, R4 continuous; Stage-2 order item 2):
 *   Gate_c = 1 − w_embodied,c × (1 − fleetCoverage);
 *   fleetCoverage = min(1, Fleet / clearedFleetRequirement), ≡ 1 at zero requirement.
 *   clearedFleetRequirement = Σ_c clearedEmployment_c × w_embodied,c ×
 *   unitsPerEmbodiedWorker (the fleet-scale re-derivation, order item 3 — the retired
 *   [hu] FLEET_UNITS_AT_FULL_EMBODIMENT scale's replacement).
 *
 * Aggregate: split into investment (I), net exports (NX), and consumer goods
 * (tracked, not added to C) — the entry routing is UNCHANGED (checkpoint §2: Channel 2
 * changes the SIZE and SHAPE of potential, not its entry paths).
 *
 * @param clusterResults - Displacement results for all clusters
 * @param clusters - Occupation clusters (resolved capability weights — the ONE producer)
 * @param capabilityScores - Current capability scores per vector (retained; the retired
 *   multiplier form consumed them — the live emission does not scale with them directly)
 * @param config - Simulation config (for split fractions + unitsPerEmbodiedWorker)
 * @param triggerBetterScores - RETIRED input (the augmentation floor belonged to the
 *   multiplier form); kept positionally per the no-delete rule, unread
 * @param year0ClusterResults - The year-0 cluster results (the wage-vintage basis)
 * @param channel2 - Stage-2 state: the fleet stock (start-of-year) and the real economy
 *   index; absent ⇒ coverage 1 / index 1 (unit-test convenience — the loop always passes them)
 * @returns AI production expansion components + the Channel-2 surfaces
 */
export function computeAIProductionExpansion(
  clusterResults: ClusterDisplacementResult[],
  clusters: OccupationCluster[],
  capabilityScores: Record<CapabilityVectorId, number>,
  config: SimulationConfig,
  triggerBetterScores: Record<string, Record<string, number | null>> | undefined,
  year0ClusterResults: ClusterDisplacementResult[],
  channel2?: {
    fleetUnits?: number; econIdx?: number;
    /** Stage 4 MS4 (the ratified design §3): the per-cluster coverage series the
     *  allocation produced this year — the ONE producer feeding both the ledger
     *  gate (here) and the displacement gate (the cluster loop). Absent (unit
     *  fixtures, Stage-2 batteries) ⇒ the retired one-ratio fallback below. */
    perClusterCoverage?: Record<string, number>;
    /** Stage 4 MS4: the simulation year + the resolved trust half-life — the
     *  trust-maturity ramp's inputs (the alphaDrivers ramp, same formula, same
     *  resolved parameter). */
    year?: number;
    trustHalfLifeYears?: number;
  },
): {
  aiInvestmentBoost: number;
  aiNetExportBoost: number;
  aiConsumerGoodsPotential: number;
  totalAdditionalOutput: number;
  /** Σ_c VA_c × clearance_c × gate_c — the checkpoint §2 potential ceiling. */
  potentialCeiling: number;
  /** Σ_c clearedEmployment_c × w_embodied,c × unitsPerEmbodiedWorker (units). */
  clearedFleetRequirement: number;
  /** Stage 4 MS4: the requirement-weighted mean of the per-cluster coverages
   *  (1 when no requirement); the retired one-ratio form survives only as the
   *  unit-fixture fallback. */
  fleetCoverage: number;
  /** Stage 4 MS4: per-cluster cleared-work fleet requirement (units) — threaded
   *  to next year's allocation. */
  perClusterFleetRequirement: Record<string, number>;
  /** Stage 4 MS4: the DERIVED allocation priority per cluster (valueDensity ×
   *  trustMaturity × saferMargin × frictionFactor — the ratified design §3;
   *  every factor read from the audited live surfaces). Threaded to next year. */
  perClusterPriority: Record<string, number>;
} {
  // Build cluster lookup (resolved capability weights ride the cluster objects)
  const clusterLookup = new Map<string, OccupationCluster>();
  for (const c of clusters) {
    clusterLookup.set(c.id, c);
  }
  void capabilityScores; void triggerBetterScores; // retired inputs of the multiplier form (kept per no-delete)

  const econIdx = channel2?.econIdx ?? 1;
  const unitsPerWorker = config.unitsPerEmbodiedWorker ?? DEFAULT_UNITS_PER_EMBODIED_WORKER;

  // H3 ruling 3: the year-0 role lookup — employment and wage at the vintage the displaced
  // work carried when displaced (year 0 is displacement- and cascade-free by construction,
  // so year-0 remainingEmployment/remainingWage ARE the baseline).
  const year0Roles = new Map<string, Map<string, { employment: number; wage: number }>>();
  for (const c0 of year0ClusterResults) {
    const roles = new Map<string, { employment: number; wage: number }>();
    for (const r0 of c0.roles) roles.set(r0.roleId, { employment: r0.remainingEmployment, wage: r0.remainingWage });
    year0Roles.set(c0.clusterId, roles);
  }

  // ── PASS 1: per-cluster year-0 bases + BFCS clearance + the cleared fleet requirement ──
  // clearance_c = year-0-wage-mass share of roles whose BFCS output is triggered (all
  // four bars met) at t; clearedEmployment_c = year-0 employment of those roles.
  interface ClusterBases {
    e0: number; w0: number; clearedWageShare: number; clearedEmployment: number;
    displacedVintageWageMass: number; wEmbodied: number;
  }
  const bases = new Map<string, ClusterBases>();
  let clearedFleetRequirement = 0;
  const perClusterFleetRequirement: Record<string, number> = {};
  const perClusterPriority: Record<string, number> = {};
  for (const result of clusterResults) {
    const cluster = clusterLookup.get(result.clusterId);
    const roles0 = year0Roles.get(result.clusterId);
    if (!cluster || !roles0) continue;
    let e0 = 0, w0 = 0, clearedWageMass = 0, clearedEmployment = 0, displacedVintageWageMass = 0;
    // Stage 4 MS4 — the priority factors (the ratified design §3, every factor
    // READ from the audited live surfaces on this function's inputs):
    let minTriggerYear: number | null = null;
    let saferMarginWeighted = 0, saferWeight = 0;
    let frictionWeighted = 0, frictionWeight = 0;
    for (const roleResult of result.roles) {
      const r0 = roles0.get(roleResult.roleId);
      if (!r0) continue;
      e0 += r0.employment;
      w0 += r0.employment * r0.wage;
      const bfcs = result.bfcsOutput.find(b => b.roleId === roleResult.roleId);
      if (bfcs?.triggered) {
        clearedWageMass += r0.employment * r0.wage;
        clearedEmployment += r0.employment;
        // saferMargin: how far above its Safer bar the cleared role sits
        // (clamped [0,1]; a threshold at/above 1 degenerates to the pass/fail
        // indicator), year-0-employment-weighted over CLEARED roles.
        const th = bfcs.thresholds.safer;
        const margin = th < 1
          ? Math.max(0, Math.min(1, (bfcs.scores.safer - th) / (1 - th)))
          : (bfcs.scores.safer >= th ? 1 : 0);
        saferMarginWeighted += margin * r0.employment;
        saferWeight += r0.employment;
      }
      if (bfcs?.triggerYear !== null && bfcs?.triggerYear !== undefined) {
        minTriggerYear = minTriggerYear === null ? bfcs.triggerYear : Math.min(minTriggerYear, bfcs.triggerYear);
      }
      // frictionFactor: the authored per-role replacement-friction years
      // (integration/practical friction), year-0-employment-weighted over the
      // cluster's roles; the standing 1.25-year fallback where unauthored.
      const fy = ROLE_AI_REPLACEMENT_FRICTION_YEARS_DEFAULTS[result.clusterId]?.[roleResult.roleId]
        ?? FALLBACK_REPLACEMENT_FRICTION_YEARS;
      frictionWeighted += fy * r0.employment;
      frictionWeight += r0.employment;
      displacedVintageWageMass += Math.max(0, r0.employment - roleResult.remainingEmployment) * r0.wage;
    }
    const wEmbodied = cluster.capabilityRelevance.weights.embodied;
    bases.set(result.clusterId, {
      e0, w0,
      clearedWageShare: w0 > 0 ? clearedWageMass / w0 : 0,
      clearedEmployment,
      displacedVintageWageMass,
      wEmbodied,
    });
    // The fleet-scale re-derivation (order item 3): units for the CLEARED embodied work.
    const reqUnits = clearedEmployment * wEmbodied * unitsPerWorker;
    clearedFleetRequirement += reqUnits;
    perClusterFleetRequirement[result.clusterId] = reqUnits;
    // priority_c = valueDensity × trustMaturity × saferMargin × frictionFactor
    // (the ratified derived priority — NO new per-industry variable; the only new
    // authored number is the allocation smoothing step).
    const vaPerWorkerP = CLUSTER_VA_PER_WORKER[result.clusterId] ?? 0;
    const trustMaturity = minTriggerYear !== null && channel2?.year !== undefined
      ? 1 - Math.exp(-Math.max(0, channel2.year - minTriggerYear)
          / Math.max(1e-9, channel2.trustHalfLifeYears ?? 5))
      : 0;
    const saferMargin = saferWeight > 0 ? saferMarginWeighted / saferWeight : 0;
    const frictionFactor = frictionWeight > 0
      ? 1 / (1 + frictionWeighted / frictionWeight)
      : 1 / (1 + FALLBACK_REPLACEMENT_FRICTION_YEARS);
    perClusterPriority[result.clusterId] = Math.max(0, vaPerWorkerP * trustMaturity * saferMargin * frictionFactor);
  }

  // STAGE 4 MS4 (the per-cluster supersession, the ratified design §3): the
  // aggregate coverage surface is the REQUIREMENT-WEIGHTED MEAN of the per-cluster
  // coverages when the allocation supplies them. The retired ONE-RATIO form
  // survives ONLY as the unit-fixture fallback (Stage-2 batteries; no live path):
  //   min(1, fleetUnits / clearedFleetRequirement)
  let fleetCoverage: number;
  const cov = channel2?.perClusterCoverage;
  if (cov) {
    let covWeighted = 0, covWeight = 0;
    for (const [cid, req] of Object.entries(perClusterFleetRequirement)) {
      if (req <= 0) continue;
      covWeighted += (cov[cid] ?? 0) * req;
      covWeight += req;
    }
    fleetCoverage = covWeight > 0 ? covWeighted / covWeight : 1;
  } else {
    fleetCoverage = channel2?.fleetUnits !== undefined && clearedFleetRequirement > 0
      ? Math.min(1, Math.max(0, channel2.fleetUnits) / clearedFleetRequirement)
      : 1;
  }

  // ── PASS 2: the gate, the ceiling, the emission ──
  // MS4: the gate reads the PER-CLUSTER coverage (the same series the displacement
  // gate consumed this year — one producer); coverage 1 where no requirement.
  let totalAdditionalOutput = 0;
  let potentialCeiling = 0;
  for (const result of clusterResults) {
    const b = bases.get(result.clusterId);
    if (!b) continue;
    const vaPerWorker = CLUSTER_VA_PER_WORKER[result.clusterId] ?? 0;
    const va = vaPerWorker * b.e0 * econIdx;
    const clusterCoverage = cov ? (cov[result.clusterId] ?? 1) : fleetCoverage;
    const gate = 1 - b.wEmbodied * (1 - clusterCoverage);
    potentialCeiling += va * b.clearedWageShare * gate;
    if (b.w0 <= 0 || b.displacedVintageWageMass <= 0) continue;
    const automatedShare = Math.min(1, b.displacedVintageWageMass / b.w0);
    totalAdditionalOutput += Math.max(0, va * gate - b.w0) * automatedShare;
  }

  // DEPRECATED (Stage 2 — the ledger re-anchor): the wage-mass × multiplier emission
  // form, retired with the uncited replacementMultiplier's ledger role (its OTHER
  // consumer, the deflation channel's effProd term, is handled at the ledger-transition
  // mini-stage). Kept per the no-delete rule:
  //   const replacementMultiplier = config.replacementMultiplier ?? DEFAULT_REPLACEMENT_MULTIPLIER;
  //   const effectiveProductivity = 1
  //     + weightedCapability * betterScore * replacementMultiplier * (1 + cheaperScore);
  //   ... augFloor = 1 + (weightedBetter / totalWeight) * augMultiplier (the production
  //   continuity floor — its semantics belonged to the multiplier form and retire with it);
  //   const flooredProductivity = Math.max(effectiveProductivity, augFloor);
  //   const additionalOutput = displacedVintageWageMass * (flooredProductivity - 1.0);
  // (The still-earlier remaining-average basis is recorded in git history at this site.)

  // Split into GDP components — the entry routing UNCHANGED (checkpoint §2)
  const investFrac = config.aiProductionInvestmentFraction ?? DEFAULT_AI_PRODUCTION_INVESTMENT_FRACTION;
  const onshoreFrac = config.aiProductionOnshoringFraction ?? DEFAULT_AI_PRODUCTION_ONSHORING_FRACTION;
  const consumerFrac = Math.max(0, 1.0 - investFrac - onshoreFrac);

  return {
    aiInvestmentBoost: totalAdditionalOutput * investFrac,
    aiNetExportBoost: totalAdditionalOutput * onshoreFrac,
    aiConsumerGoodsPotential: totalAdditionalOutput * consumerFrac,
    totalAdditionalOutput,
    potentialCeiling,
    clearedFleetRequirement,
    fleetCoverage,
    perClusterFleetRequirement,
    perClusterPriority,
  };
}

/**
 * STAGE 4 MS4 — THE PER-CLUSTER FLEET ALLOCATION (the ratified design §3).
 * The one fleet stock allocates across clearance-holding clusters by the DERIVED
 * priority, with bounded partial adjustment toward priority-proportional target
 * shares (the R3 smoothing philosophy — no bang-bang reallocation). Pure.
 *
 * Inputs are the t−1 threaded maps (requirement + priority, produced by
 * computeAIProductionExpansion) and the start-of-year fleet stock; the output
 * coverage series is THE ONE PRODUCER both the displacement gate (the cluster
 * loop) and the ledger gate consume this year. coverage ≡ 1 at zero requirement
 * (the A3 identity pattern). If every eligible priority is 0, equal shares (the
 * degenerate guard — flagged in the battery record).
 */
export function computeFleetAllocation(
  prevRequirement: Record<string, number>,
  prevPriority: Record<string, number>,
  prevShares: Record<string, number>,
  fleetUnits: number,
  smoothing: number,
): { coverage: Record<string, number>; shares: Record<string, number> } {
  const eligible = Object.keys(prevRequirement).filter((id) => (prevRequirement[id] ?? 0) > 0);
  const coverage: Record<string, number> = {};
  if (eligible.length === 0) return { coverage, shares: {} };
  let prioritySum = 0;
  for (const id of eligible) prioritySum += Math.max(0, prevPriority[id] ?? 0);
  const shares: Record<string, number> = {};
  let shareSum = 0;
  for (const id of eligible) {
    const target = prioritySum > 0 ? Math.max(0, prevPriority[id] ?? 0) / prioritySum : 1 / eligible.length;
    const prev = prevShares[id] ?? 0;
    const s = prev + smoothing * (target - prev);
    shares[id] = s;
    shareSum += s;
  }
  for (const id of eligible) {
    shares[id] = shareSum > 0 ? shares[id]! / shareSum : 1 / eligible.length;
    coverage[id] = Math.min(1, Math.max(0, shares[id]! * Math.max(0, fleetUnits) / prevRequirement[id]!));
  }
  return { coverage, shares };
}

/** Does a per-year layer ("key:year" sticky entries) touch any supply-chain row?
 *  Pure predicate for the event-demanded materialization in runSimulation. */
function layerDemandsSupplyChain(layer?: UserOverrideMap): boolean {
  if (!layer) return false;
  for (const entry of layer.keys()) {
    const colonIdx = entry.lastIndexOf(':');
    if (colonIdx !== -1 && SUPPLY_CHAIN_PARAM_KEYS.has(entry.substring(0, colonIdx))) return true;
  }
  return false;
}

/**
 * THE DATA-CALIBRATION NOTICE COUNT (record ≡ execution): the cells where a user
 * container entry masks a present preset value, counted by the SAME accessors the
 * effectiveClusters build consumes (clusterAutomationShareOverrides for α;
 * clusterOverrides.generativeWeight/agenticWeight for the weight cells — the
 * consumer-site chains). The zone renders this count as the quiet notice ("your
 * adjustments override N calibrated values"); the battery asserts it equals the
 * engine-side count derived from resolved values. Pure — no store, no state.
 */
export function countDataCalibrationShadowedCells(
  config: SimulationConfig,
  payload: DataCalibrationPayload,
): { count: number; clusterIds: string[] } {
  const ids = new Set<string>();
  let count = 0;
  for (const [id, entry] of Object.entries(payload.clusters)) {
    if (config.clusterAutomationShareOverrides?.[id] !== undefined) { count += 1; ids.add(id); }
    if (entry.weights) {
      const o = config.clusterOverrides?.[id];
      if (o?.generativeWeight !== undefined) { count += 1; ids.add(id); }
      if (o?.agenticWeight !== undefined) { count += 1; ids.add(id); }
    }
  }
  return { count, clusterIds: [...ids].sort() };
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
  // R3a (the axes program): the compiled composition's per-year layers — the event
  // layer (sticky "key:year" entries with explicit recovery) and the imported-key set
  // (migration provenance). R2b adds profileTags (the species of what selected each
  // profile — the retag). ABSENT at defaults: bit-zero by construction (R3A-B3).
  composition?: {
    eventLayer?: UserOverrideMap;
    importedKeys?: ReadonlySet<string>;
    profileTags?: { fiscal?: 'default' | 'axis-variant' | 'policy'; fed?: 'default' | 'axis-variant' | 'policy' };
    /** THE ORIGIN CHANNEL (the supply-chain shock ruling): compiler-emitted sticky
     *  1/0 flags on resilience row keys — domestic-regulatory quantity legs bypass
     *  the rows' resilience while active (resolution injects event-provenance 0). */
    scResilienceBypassLayer?: UserOverrideMap;
    /** THE DATA-CALIBRATION SIDE CHANNEL (the AEI program, Shape A): the active
     *  preset's per-cluster payload — automation share (α) + capability weights for
     *  the calibrated cognitive clusters ONLY (the applied block; embodied clusters
     *  are structurally absent). Consumed ONCE at the effectiveClusters build below
     *  user overrides and above authored defaults; absent ⇒ the chains short past it
     *  (bit-zero at defaults by construction). */
    dataCalibration?: DataCalibrationPayload;
  },
  internalRun?: {
    /** H3 ruling 2: set on the engine's own zero-AI counterfactual twin run — the recursion
     *  guard. Never set by external callers. */
    counterfactualTwin?: boolean;
  },
): SimulationTimeline {
  // Stage H item 8 (the audit's startYear-desync finding): the cost/safety decay clocks are
  // anchored at DEFAULT_START_YEAR inside bfcs.ts (computeFasterScore/computeCheaperScore/
  // computeSaferScore) and macro.ts (the Phase-5-tax indices), NOT at config.startYear — a
  // non-2025 start silently desyncs those clocks from the simulation calendar. Loud until
  // the clocks are threaded (registered to the successor design checkpoint's docket).
  if (config.startYear !== DEFAULT_START_YEAR) {
    throw new Error(
      `Unsupported startYear ${config.startYear}: the BFCS cost/safety decay clocks are `
      + `anchored at ${DEFAULT_START_YEAR} (bfcs.ts, macro.ts) and do not follow config.startYear. `
      + `Non-2025 starts are rejected loudly rather than silently desynced; clock-threading is `
      + `registered to the successor program's design docket.`,
    );
  }
  // THE EVENT-DEMANDED MATERIALIZATION (wiring audit 2026-08-01): the supply-chain
  // block below gates on config.supplyChainConfig, which is dormant (undefined) at
  // defaults — so a per-year layer shocking a supply-chain row (every sidebar event;
  // a per-year user override) resolved into yearParams and was never consumed. A
  // demanded row materializes the FULL default block up front — the R3C-F2 rule
  // (grid write under absent parent) extended to the per-year layers. With no
  // supply-chain rows demanded, undefined stands: bit-zero at defaults preserved.
  if (config.supplyChainConfig === undefined
    && (layerDemandsSupplyChain(composition?.eventLayer) || layerDemandsSupplyChain(userOverrides))) {
    config = { ...config, supplyChainConfig: getDefaultSupplyChainConfig() };
  }
  const years: SimulationYearOutput[] = [];
  let previousMacro: MacroOutput | null = null;
  // The SWF creation year (the per-field policy rebuild): a fund created AFTER the
  // simulation's first year starts at 0 — the seed fires in computeAssetPolicyEffect
  // at the creation year itself. A startYear at/before the first sim year reproduces
  // the prior unconditional init exactly (absent ⇒ DEFAULT_SWF_START_YEAR = start).
  let previousFundSize =
    (config.policyConfig.sovereignWealthFund.startYear ?? DEFAULT_SWF_START_YEAR) > config.startYear
      ? 0
      : config.policyConfig.sovereignWealthFund.initialFundSize;
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

  // ═══ H3 RULING 2 — THE ZERO-AI COUNTERFACTUAL TWIN (absorption re-benchmarked) ═══
  // The demand-health benchmark is the SAME-YEAR ZERO-AI COUNTERFACTUAL real consumption:
  // this exact configuration (policies, events, overrides unchanged) with all three
  // capability trajectories zeroed — the engine's own No-AI machinery, run once per
  // simulation. The derived trend proxy (BASELINE_CONSUMPTION_2025 × (1+g)^t) FAILED its
  // pre-registered ±5% fidelity gate against this twin (worst-year +8.04%, battery H3-B2.1),
  // so the second full run IS taken — stated per the ruling's either-way clause.
  // Zero-capability configs are their own counterfactual and skip the twin (no AI
  // production exists there, so the benchmark is never consulted); the twin flag guards
  // recursion. Events/overrides never write capability keys (manifest-verified), so the
  // twin's capabilities stay identically zero.
  const zeroTrajectory = { floor: 0, ceiling: 0, steepness: 1.0, midpointYear: 2035 };
  const isZeroAIConfig = Object.values(config.capabilities)
    .every((c) => c.floor === 0 && c.ceiling === 0);
  let counterfactualRealConsumptionByYear: Map<number, number> | undefined;
  if (!internalRun?.counterfactualTwin && !isZeroAIConfig) {
    const twinConfig: SimulationConfig = {
      ...config,
      capabilities: {
        generative: { ...zeroTrajectory },
        agentic: { ...zeroTrajectory },
        embodied: { ...zeroTrajectory },
      } as SimulationConfig['capabilities'],
    };
    const twin = runSimulation(
      twinConfig, clusters, blsBaselines, stateDataMap, userOverrides, composition,
      { counterfactualTwin: true },
    );
    counterfactualRealConsumptionByYear = new Map(twin.years.map((y) => [
      y.year,
      y.macro.priceLevel > 0 ? y.macro.consumption / y.macro.priceLevel : 0,
    ]));
  }

  // Track trigger years per cluster-role (persists across years)
  const triggerYears: Record<string, Record<string, number | null>> = {};
  // Mini-stage 1 (the frontier-intensity cost layer): the Better-ARRIVAL year per
  // cluster-role — the first year Better ≥ B* (the capability frontier reaching the role's
  // requirement; distinct from the TRIGGER year, which needs all four gates). Latched once:
  // the price of a once-reached capability level does not un-collapse. Anchors the role's
  // fixed-capability cost curve in aiCost.ts.
  const betterArrivalYears: Record<string, Record<string, number | null>> = {};
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
    betterArrivalYears[cluster.id] = {};
    triggerBetterScores[cluster.id] = {};
    augTriggerYears[cluster.id] = {};
    priorYearAlphaByRole[cluster.id] = {};
    for (const role of cluster.roles) {
      triggerYears[cluster.id]![role.id] = null;
      betterArrivalYears[cluster.id]![role.id] = null;
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
    // DEPRECATED (Stage 5 / H3): retired — derived from per-person CASH + IN-KIND constants now.
    // transferGrowthPerUEPoint: TRANSFER_GROWTH_PER_UE_POINT,
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

    // THE DATA-CALIBRATION RUNGS (the AEI program; precedence: user > preset >
    // authored). Applied ONCE here, on the effective cluster objects, because THREE
    // downstream consumers read these fields (the year-loop weighted capability, the
    // production-expansion weighted capability, and computeBetterScore's raw weights
    // read) — a rung at any single consumer would leave the preset partially live.
    // The applied block is cognitive-only by construction (embodied clusters live in
    // clustersInformational, which nothing here reads), and the embodied WEIGHT is
    // never calibrated — preserved verbatim (a USER embodied override still wins).
    //
    // RIDER 2 (mini-stage 3): the USER weight overrides moved here too — the ONE
    // producer for the whole chain user > data-calibration > authored. The old
    // consumer-site rungs read user weight overrides at two of the three consumers
    // and never at computeBetterScore (measured: a full user mask still leaked the
    // preset's weights into Better scores). The consumer-site chains are retired;
    // every consumer now reads the uniform weights from the cluster object. Preset
    // absent and no user weight override ⇒ the authored object passes through
    // untouched (bit-zero at defaults).
    const dataCalCluster = composition?.dataCalibration?.clusters[c.id];
    const userWeights = config.clusterOverrides?.[c.id];
    const hasWeightWrite = dataCalCluster?.weights !== undefined
      || userWeights?.generativeWeight !== undefined
      || userWeights?.agenticWeight !== undefined
      || userWeights?.embodiedWeight !== undefined;

    return {
      ...c,
      employmentMultiplier: mult,
      consumerDemandShare: cShare,
      govDemandShare: gShare,
      automationShare: clusterAlphaOverride ?? dataCalCluster?.automationShare ?? c.automationShare,
      capabilityRelevance: hasWeightWrite
        ? {
            ...c.capabilityRelevance,
            weights: {
              generative: userWeights?.generativeWeight
                ?? dataCalCluster?.weights?.generative
                ?? c.capabilityRelevance.weights.generative,
              agentic: userWeights?.agenticWeight
                ?? dataCalCluster?.weights?.agentic
                ?? c.capabilityRelevance.weights.agentic,
              embodied: userWeights?.embodiedWeight
                ?? c.capabilityRelevance.weights.embodied,
            },
          }
        : c.capabilityRelevance,
      roles: effectiveRoles,
    };
  });

  // Track nominal GDP history for rolling average demand feedback (Phase 1 overhaul)
  const nominalGDPHistory: number[] = [];
  // ═══ FS-3 (ratified): THE SEAM — the OEWS basis map + the margin-preserving threshold bridge ═══
  // roleWageRelative = the role's loaded OEWS mean wage / the economy mean (the basis citation IS
  // the committed data); the transform preserves each role's OBSERVED 2025 margin exactly (the
  // load-time bridge — no data rewrite; FS3_CHECKPOINT §1/§3). seamMargins feeds the report table.
  const seamWageRelative = new Map<string, number>();
  const seamCheaperThreshold = new Map<string, number>();
  const seamMargins: Array<{ key: string; c2025Old: number; c2025New: number; marginOld: number; thresholdNew: number; outOfRange: boolean }> = [];
  // RETIRED (CO-D2 conversion, R3b; Amendment 2): legacyCheaperProxy — the FS-3
  // which-change toggle (the retired seniority-proxy Cheaper basis). Pole at
  // ~/.atlas-referents/co-d2/legacyCheaperProxy/ (recorded pole-first). The seam-map
  // build is single-path (roles without loaded wages keep the proxy basis regardless —
  // the data-gated inner fallback, unchanged).
  // if (!(config.legacyCheaperProxy ?? false)) {
  {
    for (const cluster of clusters) {
      const bl = blsBaselines?.get(cluster.id);
      for (const role of cluster.roles) {
        const w = bl?.roles?.[role.id]?.meanWage;
        if (w && w > 0) {
          const rel = w / BASELINE_AVERAGE_ANNUAL_WAGE;
          const key = `${cluster.id}:${role.id}`;
          seamWageRelative.set(key, rel);
          const d = deriveSeamCheaperThreshold(cluster, role, config.startYear, rel, config.aiCostParams);
          seamCheaperThreshold.set(key, d.cheaperThresholdNew);
          seamMargins.push({ key, c2025Old: d.c2025Old, c2025New: d.c2025New, marginOld: d.marginOld, thresholdNew: d.cheaperThresholdNew, outOfRange: d.outOfRange });
        }
        // roles without loaded wages keep the proxy basis (stated; the margins table marks them)
      }
    }
  }
  // E-8c F-A: the plucking-potential state (Friedman ceiling; see computePluckingPotential)
  let pluckingPotentialGDP: number | null = null;
  let prevPluckingBoost = 1.0;

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
  // Stage 6.5: year-0 asset-income share (investor land bid baseline, OD-9b)
  let baselineAssetIncomeShare: number | null = null;
  let baselineCorporateProfits: number | null = null;
  // Separate credit-adjusted CWI baseline (grows with real GDP to avoid artificial systemic tightening)
  let creditBaselineCWI: number | null = null;

  // Phase 5g Step 7: Track AI GDP at UBI index start year for productivity indexing
  let startYearAiGDP: number = 0;
  // The policy indexation factor: a PRICE-ONLY, one-way cost-of-living index
  // (compounds max(composite inflation, 0) — nominal amounts are never cut on
  // deflation), with the fiscal-response profile's cost-of-living dampening
  // applied, threaded one year lagged (1.0 at the start year). Both indexed
  // policy instruments consume it: statutory minimum-wage indexation is
  // CPI-based in real-world practice (the CPI-indexed state statutes; benefit
  // adjustments are likewise CPI-measured and never negative), and the UBI
  // card's own text says "inflation-indexed" — a price index, not a wage
  // index. Consuming the budget's wage-or-price benefit-adequacy index here
  // would feed a wage floor's own wage push back into the floor (a
  // self-referential loop, measured divergent); the wage-branch form remains
  // available as a possible future, honestly-labeled advanced mode.
  let policyPriceIndexRaw = 1.0;
  let prevPolicyIndexationFactor = 1.0;

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
  let adoptionState: AdoptionState = { rates: {}, frozenSince: {}, hasDeclined: {} };
  // Mini-stage 2 (Amendment 1): the reverse gear's rehire basis + fill throttle read the
  // PREVIOUS year's displaced pool (the pool the firm would actually hire from; year 0 has
  // no pool). Mini-stage 3 refines the SAME object's internals (cohorts, scarring,
  // effectiveness weighting) — the gear's reads sharpen with NO basis change (the ruled
  // pool-object resolution).
  let previousDisplacedPool: { count: number; avgWage: number } = { count: 0, avgWage: 0 };
  // Mini-stage 3: the duration-structured pool (the SAME object gaining resolution — the
  // ruled pool-object resolution; cohorts/scarring/effectiveness refine the gear's reads
  // with no basis change).
  let poolState: DisplacedPoolState = emptyDisplacedPoolState();
  const poolDials: PoolDials = {
    exitBase: config.exitBase ?? DEFAULT_POOL_EXIT_BASE,
    exitDurationSlope: config.exitDurationSlope ?? DEFAULT_POOL_EXIT_DURATION_SLOPE,
    atrophyRate: config.atrophyRate ?? DEFAULT_POOL_ATROPHY_RATE,
    wageScarringRate: config.wageScarringRate ?? DEFAULT_POOL_WAGE_SCARRING_RATE,
  };
  let chipSupplyHistory: number[] = [];
  let cumulativeCapabilityDelay: Record<CapabilityVectorId, number> = { generative: 0, agentic: 0, embodied: 0 };
  // MS1 (the frontier stock); FLYWHEEL MS (the hoist): training capacity relative to
  // the default path — 1 at the seam (2025 = observed economy, on-path). ALWAYS-ON and
  // LOOP-HOSTED now: it drains under supply famines (u_supply from the SC block) AND
  // funding starvation (u_demand from the t−1 macro funding gate), composed by
  // u = min(u_s, u_d) — Leontief, the ratified structural form. The capability clock
  // advances at stock^rateElasticity; the COST CLOCK τ at stock^costElasticity.
  let frontierStock = 1;
  // The flywheel's cost clock: effective innovation time τ. Seam-pinned at 0 for the
  // start year (the cost curves' anchor, like t = 0 today); advances by S^φ_cost per
  // subsequent year — exactly +1.0 on every funded path (integer-exact identity).
  let effectiveCostTime = 0;
  // τ history for the fixed-capability arrival re-anchor (τ at the role's arrival year).
  const tauByYear = new Map<number, number>();
  // The innovation-channel multiplier m_inn = S^φ_inn (loop-produced since the hoist).
  let innovationStockMultiplier = 1;
  // ═══ PRODUCTION PROGRAM STAGE 1 — Channel 1 state (the buildout machine) ═══
  // Stocks in 2025-required-capacity units (seam: every DC leg exactly 1); the fleet
  // in units; the R3-smoothed allocation vector. Year 0 is the SEAM (no demand passed
  // — PB-1 Leg A byte-identity); the machine is live from the second year.
  let buildoutState = getInitialBuildoutState();
  // Stage 4 MS3 (arrival events): the accumulated energy cost-curve BEND — an
  // event's trend entry compounds this factor from its anchor year
  // ((1 + eventTrend)/(1 + standingTrend) per covered year); on release the
  // accumulated factor persists (durable capacity). 1 with no event — bit-zero.
  let energyCostBendFactor = 1;
  // The per-year arrival reads (event layer; 100/undefined = no arrival).
  let fleetRampIdxForYear = 100;
  // Stage 5A (A2): the orbital arrival row (the fleet-ramp admission precedent) —
  // a per-year ADDITIONS index: (v − 100)/100 capacity units join S_orbital.
  let orbitalAddIdxForYear = 100;
  // Stage 5A (A3 + E2): the energy opex line for the year (undefined ⇒ inert —
  // the seam year and the zero-AI path; the carve-out travels with it in macro.ts).
  let aiEnergyOpexForYear: number | undefined;
  // ═══ STAGE 4 MS4 — THE ADOPTION-GATING STATE (the ratified design §2–§3) ═══
  // The t−1 per-cluster cleared-work fleet requirement + derived priority
  // (produced by the ledger pass) and the smoothed allocation shares. Empty at
  // the seam: no clearance ⇒ no requirement ⇒ every coverage 1 ⇒ the gate is
  // structurally silent (zero-AI bit-silence by construction).
  let prevPerClusterFleetReq: Record<string, number> = {};
  let prevPerClusterPriority: Record<string, number> = {};
  let fleetAllocShares: Record<string, number> = {};
  let buildoutPlanForYear: BuildoutPlan | null = null;
  let buildoutRealGDP2025: number | null = null;
  // ═══ PRODUCTION PROGRAM STAGE 2 — Channel 2 loop state ═══
  // The cleared-embodied-work fleet requirement (units), computed by the ledger each
  // year and consumed by the NEXT year's buildout plan (the t−1 finance-basis pattern;
  // the fleet-scale re-derivation, order item 3). 0 at the seam and on zero-AI paths.
  let prevClearedFleetRequirement = 0;
  // The builderBase dynamics fix (order item 7): the seam-year corporate profits
  // (captured at year 0, the buildoutRealGDP2025 pattern) — the finance block's
  // builder base indexes to the LIVE corporate-profits state against this seam.
  let buildoutCorporateProfitsSeam: number | null = null;
  // Stage 3 MS3: the issuance leg + window for the year (telemetry stamps them).
  let buildoutIssuanceForYear = 0;
  let buildoutIssuanceWindowForYear = 1;
  // ═══ STAGE 3 MS4 — Channel 3 loop state (the corporate AI-era R&D stock) ═══
  // Perpetual-inventory dollars (nominal), advanced post-macro from the REALIZED
  // spend (the same gate chain all investment rides — no bypass). DISTINCT from the
  // FRONTIER's capability-side stock by the two-stocks partition (RB-4 Leg A).
  let aiRdStockState = 0;
  let aiRdStockPrevStart = 0; // the stock at the START of the prior year (the Δln base)
  let aiRdDemandForYear = 0;
  let aiRdFlowForYear = 0;
  // MS1 (the ruled onset dead time): the per-year RESOLVED resilience series, in year
  // order — the training channel damps by the entry onsetYears back (delivered
  // capacity), while rows/display keep the as-built series.
  const resolvedResilienceHistory: SupplyChainResilience[] = [];
  let supplyChainShockHistory: [SupplyChainInputs, SupplyChainInputs] = [
    { aiChips: 100, chipPrice: 100, energyPrice: 100, energyCapacity: 100, trainingDCCapacity: 100, inferenceDCCapacity: 100, roboticsHardware: 100, softwareEfficiency: 100 },
    { aiChips: 100, chipPrice: 100, energyPrice: 100, energyCapacity: 100, trainingDCCapacity: 100, inferenceDCCapacity: 100, roboticsHardware: 100, softwareEfficiency: 100 },
  ];
  let cognitiveProgress = 0;
  let embodiedProgress = 0;

  // THE regulatoryFriction CONSUMER (the supply-chain shock ruling, Finding 3;
  // design note .archive/supply-chain-fix/DESIGN_NOTE.md): friction is the
  // permitting-delay multiplier on datacenter capacity additions. The accumulator
  // holds Σ 1/friction(τ) over elapsed years — the EFFECTIVE permitting time the
  // datacenter resilience trajectory advances by (year τ's regime governs additions
  // coming online in τ+1, the loop's year-start convention). At friction ≡ 1 each
  // year adds exactly 1.0, so the sum is the exact float t and the trajectory is
  // arithmetic-identical to the prior closed form (the bit-identity guarantee).
  // No retroactivity: a freeze slows additions from its year forward only.
  let dcPermittingEffectiveYears = 0;

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

  // Close-out §9 item 3: the year-0 cluster results, captured on the first iteration —
  // the baseline the displaced-pool price object reads (year 0 is displacement-free).
  let year0ClusterResults: ClusterDisplacementResult[] | null = null;

  // ═══ STAGE 4 MS2 — THE DERIVED N1→TOKEN COUPLING (one producer, run-constant):
  // the token-cost curve re-derives from N1's capacity-cost trend (ratification
  // R2's surgery (c) — aiCost.ts coupledTokenCostCurve carries the form and its
  // derivation). At the consensus trend (or absent) the coupling returns the
  // ORIGINAL objects by reference — bit-exact identity on the default path. Every
  // cost consumer below reads costParamsForRun; config.aiCostParams is never read
  // for cost evaluation past this point. ═══
  const coupledCurveForRun = coupledTokenCostCurve(
    config.aiCostParams?.tokenCostCurve, config.buildoutChipsCostTrend,
  );
  const costParamsForRun: AICostParams | undefined =
    coupledCurveForRun === config.aiCostParams?.tokenCostCurve
      ? config.aiCostParams
      // reason: spreading a possibly-undefined params object is runtime-safe ({}),
      // and every downstream consumer resolves absent fields via `?? DEFAULT_*`;
      // the cast keeps the coupled object on the AICostParams contract.
      : { ...(config.aiCostParams as AICostParams), tokenCostCurve: coupledCurveForRun };

  // === MAIN TIME LOOP (DATA_MODEL.md §10.1) ===
  for (let year = config.startYear; year <= config.endYear; year++) {

    // RETIRED (mini-stage 1; Amendment 2 — no legacy toggles): the per-year tokens-per-task
    // resolution (spike-and-recover schedule + sticky-forward overrides). The frontier-
    // intensity cost layer (aiCost.ts) replaces it: intensity is a persistent property of
    // frontier work, per-role migration off the frontier is priced by the arrival-anchored
    // fixed-capability curve, and the AGGREGATE tokens-per-task path is an emergent OUTPUT
    // (MacroOutput.impliedAggregateTokensPerTask). Which-change pole: the 6c831b7 run.
    // const baselineTokenUsage = defaultTokenUsageMultiplier(
    //   year, config.startYear,
    //   config.aiCostParams?.tokenUsageMultiplier,
    // );
    // const resolvedTokenUsage = resolveParameter(
    //   'tokenUsageMultiplier', year, baselineTokenUsage, baselineTokenUsage, overrides,
    // ).effective;
    // STAGE 4 MS2: the N1-coupled params (identity-by-reference at consensus).
    const effectiveAiCostParams = costParamsForRun;

    // Phase 5g Step 1: Dynamic population growth
    const popGrowthRate = config.populationGrowthRate ?? DEFAULT_POPULATION_GROWTH_RATE;
    const yearsSinceStartForPop = year - config.startYear;
    const dynamicPopulation = config.totalPopulation * Math.pow(1 + popGrowthRate, yearsSinceStartForPop);
    const dynamicLaborForce = config.laborForce * (dynamicPopulation / config.totalPopulation);

    // Baseline employment growth: scale all baseline references so the no-AI economy
    // naturally absorbs its growing labor force. Without this, frozen 2025 baselines
    // create rising structural unemployment as population grows → demand penalty death spiral.
    const laborForceGrowthFactor = dynamicPopulation / config.totalPopulation;

    // ═══ R1 (the axes program): THE ONE RESOLUTION — the unified per-year producer. ═══
    // Moved here from the fiscal-monetary block so the engine's supply-chain consumption
    // below reads the SAME object the record stores. This retires D-18's duplicate
    // resolution (ruling 8: UNIFY; ratify-with-battery rejected as a two-basis genus at
    // the provenance layer) — provenance holds by construction; B2-3 re-specs to the
    // internal-consistency form. All inputs are year-start state: t−1 macro (CIF), the
    // lagged debt/GDP history, the pre-loop profile/tax baselines.
    const prevCIF = previousMacro?.cumulativeInflationFactor ?? 1.0;
    const laggedDebtIdx = Math.max(0, debtGDPHistory.length - 1 - fiscalProfile.consolidationLag);
    const laggedDebtGDP = debtGDPHistory.length > 0
      ? debtGDPHistory[laggedDebtIdx]!
      : (INITIAL_FEDERAL_DEBT / BASELINE_GDP_NOMINAL_2025);
    const autopilotResult = (year - config.startYear) === 0
      ? getBaselineAutopilot(config, fiscalProfile)
      : computeAutopilotParameters(
          laggedDebtGDP, prevCIF, fiscalProfile, baselineTaxRates,
          year, config.supplyChainConfig,
          config.aiProductionOnshoringFraction ?? DEFAULT_AI_PRODUCTION_ONSHORING_FRACTION,
          dcPermittingEffectiveYears,
        );
    const yearParams = resolveAllParameters(year, config, autopilotResult, overrides, profileName, composition);
    // The permitting clock advances by this year's resolved regime (one producer —
    // events and per-year overrides included). The guard floor matches the standing
    // validator clamp; per-year vehicles carry no range, so the divisor is floored
    // rather than trusted.
    dcPermittingEffectiveYears += 1 / Math.max(MIN_REGULATORY_FRICTION, yearParams.regulatoryFriction.effective);

    // R3a (case 16 live): the geopolitical event layer overrides the axis-owned standing
    // value per-year — ONE site; the config value stands when no event entry covers the
    // year (bit-zero at defaults; the RESTORE-AXIS recovery entry returns the composed
    // axis value by construction at the compiler).
    const geoEventRaw = composition?.eventLayer
      ? stickyLayerValue('geopoliticalRiskFactor', year, composition.eventLayer)
      : undefined;
    // F2 guard: a release-sentinel recovery (NaN) means NOT event-covered — the
    // composed config's own value resumes. (The shipped geopolitical drag recovers
    // via restore-axis, a real value; this guard covers any future released leg.)
    const geoEventValue = geoEventRaw !== undefined && Number.isNaN(geoEventRaw) ? undefined : geoEventRaw;
    const effectiveAdoptionParams = geoEventValue !== undefined
      ? { ...config.adoptionParams, geopoliticalRiskFactor: geoEventValue }
      : config.adoptionParams;

    // Phase 9: Compute supply chain effects (before capabilities so delays are ready)
    const scConfig = config.supplyChainConfig;
    let scEffects: SupplyChainEffects | null = null;
    let scLaggedInputs: ReturnType<typeof applyPropagationLags> | null = null;
    // Mini-stage 2 (C-1): the per-year RESOLVED supply-chain config consumed by execution
    // this year — held loop-scope so the shock history pushes the same resolved values.
    let effectiveScConfig: SupplyChainConfig | null = null;

    if (scConfig) {
      // ── C-1: THE TIMED-SHOCK SURFACE (execution reads the ONE resolved object). ──
      // Every row resolves per-year through the three-layer machinery (baseline = config
      // value; autopilot = trajectory/profile evolution; user overrides sticky-forward
      // with EXPLICIT recovery entries). R1 RETIRED the duplicate inline resolution that
      // lived here (the rsc helper + its own computeAutopilotResilience call): the engine
      // now reads yearParams — the SAME object the sidebar records. The autopilot layers
      // (resilience evolution, the pass-through anchor) come through autopilotResult
      // inside the one producer.
      // RETIRED (R1; comment-and-record — the second resolution path, dead by the
      // single-producer guard R1-B6):
      // const rsc = (key: string, baseline: number, autopilot?: number) =>
      //   resolveParameter(key, year, baseline, autopilot ?? baseline, overrides).effective;
      // const autoResilience = computeAutopilotResilience(
      //   year, scConfig.resilience,
      //   config.aiProductionOnshoringFraction ?? DEFAULT_AI_PRODUCTION_ONSHORING_FRACTION,
      // );
      const resolvedResilience: SupplyChainResilience = {
        aiChips: yearParams.resilienceAiChips.effective,
        energy: yearParams.resilienceEnergy.effective,
        trainingDC: yearParams.resilienceTrainingDC.effective,
        inferenceDC: yearParams.resilienceInferenceDC.effective,
        roboticsHardware: yearParams.resilienceRoboticsHW.effective,
      };
      // MS1 (the ruled onset dead time): the history carries the SAME resolved series
      // the sidebar records (user overrides included — display and execution stay one
      // object); the training channel consumes the entry onsetYears back. At onset 0
      // the lookup returns this year's entry exactly (the prior behavior).
      resolvedResilienceHistory.push(resolvedResilience);
      const deliveredResilience = lookupDeliveredResilience(
        resolvedResilienceHistory,
        scConfig.resilienceOnsetYears ?? DEFAULT_RESILIENCE_ONSET_YEARS,
      );
      effectiveScConfig = {
        ...scConfig,
        inputs: {
          aiChips: yearParams.supplyChainAiChips.effective,
          chipPrice: yearParams.supplyChainChipPrice.effective,
          energyPrice: yearParams.supplyChainEnergyPrice.effective,
          energyCapacity: yearParams.supplyChainEnergyCapacity.effective,
          trainingDCCapacity: yearParams.supplyChainTrainingDC.effective,
          inferenceDCCapacity: yearParams.supplyChainInferenceDC.effective,
          roboticsHardware: yearParams.supplyChainRoboticsHW.effective,
          softwareEfficiency: yearParams.supplyChainSoftwareEfficiency.effective,
        },
        trainingDynamics: {
          aiChips: { techDeclineRate: yearParams.trainingChipsTechDecline.effective, scalePressure: yearParams.trainingChipsScalePressure.effective },
          energy: { techDeclineRate: yearParams.trainingEnergyTechDecline.effective, scalePressure: yearParams.trainingEnergyScalePressure.effective },
          datacenter: { techDeclineRate: yearParams.trainingDCTechDecline.effective, scalePressure: yearParams.trainingDCScalePressure.effective },
        },
        regulatoryFriction: yearParams.regulatoryFriction.effective,
        // C-2: the autopilot layer IS the ramp — live at execution (via the one producer).
        costPassThroughRate: yearParams.costPassThroughRate.effective,
        consumerPassThroughRate: yearParams.consumerPassThroughRate.effective,
        costVsProcurementBlend: yearParams.costVsProcurementBlend.effective,
      };
      // The cascade re-base (the MS1 registered deferral, due now): the base compute-cost
      // decline the cascade modifies is the ONE object's frontier trajectory — the
      // year-over-year log decline of frontierCost(t) — not the retired exp leg.
      const frontierDials = resolveFrontierDials(costParamsForRun);
      const tNow = year - config.startYear;
      const frontierDeclineRate = tNow > 0
        ? Math.log(
            computeFrontierCost(tNow, costParamsForRun?.tokenCostCurve, frontierDials)
            / computeFrontierCost(tNow - 1, costParamsForRun?.tokenCostCurve, frontierDials),
          )
        : 0;
      scEffects = computeSupplyChainEffects({
        year,
        config: effectiveScConfig,
        shockHistory: supplyChainShockHistory,
        chipSupplyHistory,
        prevCumulativeDelay: cumulativeCapabilityDelay,
        onshoringFraction: config.aiProductionOnshoringFraction ?? DEFAULT_AI_PRODUCTION_ONSHORING_FRACTION,
        automationCoverage: previousMacro?.automationCoverage ?? 0,
        baseComputeDeclineRate: frontierDeclineRate,
        cognitiveProgress,
        embodiedProgress,
        resolvedResilience,
        prevFrontierStock: frontierStock, // reason: deprecated input (the hoist) — retained for signature stability, unread
        deliveredResilience,
      });
      scLaggedInputs = applyPropagationLags(effectiveScConfig.inputs, supplyChainShockHistory[0], supplyChainShockHistory[1]);
    }

    // ═══ PRODUCTION PROGRAM STAGE 1 — THE BUILDOUT STEP (Channel 1) ═══
    // The plan for the year: requirement from the BELIEVED capability path (the
    // ceilings-of-possibility semantics), finance from t−1 profits/credit, gaps at
    // current unit costs, the R3 smoothed binding-sink allocation, and the funding
    // ratio F = financed/required (≡ 1 at zero required spend — ratification A3).
    // Supply-chain quantity/price indices act as SHOCKS ON THE STOCKS/COSTS (the
    // one-machine rule). Zero-AI beliefs demand nothing (the twin semantics — the
    // partition delta then subtracts the baseline-embedded AI capex path).
    buildoutPlanForYear = null;
    buildoutIssuanceForYear = 0;
    buildoutIssuanceWindowForYear = 1;
    aiEnergyOpexForYear = undefined; // Stage 5A: inert unless the live machine sets it
    // ═══ STAGE 4 MS3 — THE ARRIVAL ROWS (signed, leg-targeted happenings) ═══
    // The fleet-ramp row (per-year vehicle; the geopolitical case-16 read pattern):
    // 100/undefined/released ⇒ no arrival — bit-zero at defaults by construction.
    {
      const rampRaw = composition?.eventLayer
        ? stickyLayerValue('fleetRampCapacity', year, composition.eventLayer)
        : undefined;
      fleetRampIdxForYear = rampRaw !== undefined && !Number.isNaN(rampRaw) ? rampRaw : 100;
      // The energy cost-curve BEND: an event's trend entry compounds the factor
      // for each covered year (continuous level, changed slope — never a cliff).
      const bendRaw = composition?.eventLayer
        ? stickyLayerValue('buildoutEnergyCostTrend', year, composition.eventLayer)
        : undefined;
      if (bendRaw !== undefined && !Number.isNaN(bendRaw)) {
        const standing = config.buildoutEnergyCostTrend ?? BUILDOUT_LEG_COST_TREND.energy;
        energyCostBendFactor *= (1 + bendRaw) / (1 + standing);
      }
      // Stage 5A (A2): the orbital arrival row — per-year additions declaration
      // ((v − 100)/100 units/yr while covered; the upgraded orbital-datacenters
      // event writes it; 100/undefined/released ⇒ no arrival, bit-zero).
      const orbRaw = composition?.eventLayer
        ? stickyLayerValue('orbitalCapacity', year, composition.eventLayer)
        : undefined;
      orbitalAddIdxForYear = orbRaw !== undefined && !Number.isNaN(orbRaw) ? orbRaw : 100;
    }
    // ═══ STAGE 4 MS4 — THE PER-CLUSTER FLEET ALLOCATION (the ratified design §3):
    // the ONE coverage producer for the year, from the t−1 requirement/priority
    // maps and the START-of-year fleet stock. Both the displacement gate (the
    // cluster loop below) and the ledger gate (computeAIProductionExpansion)
    // consume THIS series. ═══
    const fleetAllocation = computeFleetAllocation(
      prevPerClusterFleetReq, prevPerClusterPriority, fleetAllocShares,
      buildoutState.fleetUnits,
      config.fleetAllocSmoothing ?? DEFAULT_FLEET_ALLOC_SMOOTHING,
    );
    fleetAllocShares = fleetAllocation.shares;
    const perClusterCoverage = fleetAllocation.coverage;
    if (previousMacro && buildoutRealGDP2025 !== null) {
      const scIn = effectiveScConfig?.inputs;
      // ═══ STAGE 3 MS3 — EQUITY ISSUANCE (owner ruling v; the ratified design) ═══
      // ι × the t−1 implied AI market cap (the D1-guarded sector valuation surface)
      // × the t−1 issuance window (closes on the ONE crisis-ERP producer's component
      // at the episode-anchored sensitivity — 2008-class shutdowns). Zero-AI: the
      // implied cap is 0 ⇒ issuance 0 (bit-silence, RB-3 Leg E).
      buildoutIssuanceWindowForYear = Math.max(0, Math.min(1,
        1 - EQUITY_ISSUANCE_WINDOW_SENSITIVITY
          * (previousMacro.erpCrisisComponent ?? 0) / DEFAULT_ERP_CRISIS_SENSITIVITY));
      buildoutIssuanceForYear = (config.equityIssuanceRate ?? DEFAULT_EQUITY_ISSUANCE_RATE)
        * Math.max(0, previousMacro.aiMarketCapImplied ?? 0)
        * buildoutIssuanceWindowForYear;
      // ═══ STAGE 3 MS4 — CHANNEL 3: the AI-era R&D demand + the TFP flow ═══
      // Demand = intensity × the t−1 REALIZED nominal AI revenue (the honest basis:
      // realized GDP entries + absorbed × price level — the same construction the
      // profits re-base uses); the flow = Δln(stock) × the cited elasticity, from the
      // stock as of the START of this year vs last (the Δ-form; both-positive guard).
      {
        const prevRevenue = Math.max(0, previousMacro.aiRealizedGDPContribution
          + previousMacro.aiGoodsAbsorbed * previousMacro.priceLevel);
        aiRdDemandForYear = (config.aiRdIntensity ?? DEFAULT_AI_RD_INTENSITY) * prevRevenue;
        // Δln over successive START-of-year stocks, measured against the WHOLE
        // research stock (baseline base + the AI-era increment — the checkpoint §3
        // incremental-to-baseline honesty; an increment-only Δln fabricates
        // double-digit deflation from the first dollars — the small-base artifact,
        // measured at build and refused; BASELINE_BUSINESS_RD_STOCK's comment).
        aiRdFlowForYear = (config.rdTfpElasticity ?? DEFAULT_RD_TFP_ELASTICITY)
          * Math.log((BASELINE_BUSINESS_RD_STOCK + aiRdStockState)
            / (BASELINE_BUSINESS_RD_STOCK + aiRdStockPrevStart));
      }
      buildoutPlanForYear = computeBuildoutPlan({
        year,
        state: buildoutState,
        capabilities: config.capabilities,
        prevRealGDP: previousMacro.gdpReal,
        realGDP2025: buildoutRealGDP2025,
        prevAiProfitsNominal: previousMacro.aiCorporateProfits,
        prevNominalGDP: previousMacro.gdpNominal,
        prevBusinessCreditMultiplier: previousMacro.businessCreditMultiplier,
        retentionShare: config.aiRetentionShare,
        allocSmoothing: config.buildoutAllocSmoothing,
        prevClearedFleetRequirement, // Stage 2: the t−1 cleared-work fleet requirement
        // Stage 2 (order item 7): the builder base rides the LIVE profits state.
        prevCorporateProfits: previousMacro.corporateProfits,
        corporateProfitsSeam: buildoutCorporateProfitsSeam ?? undefined,
        equityIssuance: buildoutIssuanceForYear, // Stage 3 MS3 (ruling v)
        // Stage 5A (E2): the t−1 power bill nets against the builder-base floor
        // (the wire the integration battery found dead — computeFinanceable).
        prevEnergyOpex: previousMacro.buildout?.energyOpex,
        shocks: {
          chipsQty: scIn?.aiChips,
          energyQty: scIn?.energyCapacity,
          dcQty: scIn ? Math.min(scIn.trainingDCCapacity, scIn.inferenceDCCapacity) : undefined,
          chipPrice: scIn?.chipPrice,
          energyPrice: scIn?.energyPrice,
          fleetRamp: fleetRampIdxForYear, // Stage 4 MS3: the arrival row
        },
        // Stage 4 MS2 (N1): the leg-cost trend beliefs (absent ⇒ consensus constants).
        costTrends: {
          chips: config.buildoutChipsCostTrend,
          energy: config.buildoutEnergyCostTrend,
          dc: config.buildoutDcCostTrend,
          fleetUnit: config.buildoutFleetCostTrend,
        },
        // Stage 4 MS3: the arrival cost-curve bend (1 with no event — bit-zero).
        costBend: { energy: energyCostBendFactor },
        // Stage 5A (A1 + E1): the N1-owned queue beliefs (absent ⇒ consensus
        // constants — the identity proof).
        energyQueue: {
          leadYears: config.energyQueueLeadYears,
          ceilingGrowth: config.energyQueueCeilingGrowth,
          btmShare: config.energyBtmShare,
        },
      });
      // ═══ STAGE 5A (A3 + E2) — THE ENERGY OPEX LINE ═══
      // energyOpex = seam rate × utilizedCompute × (1/FLOPs-per-watt norm) ×
      // p_energy, where p_energy carries the N1 energy trend, the supply-chain
      // energy-PRICE shock (the E2 wire — a war-class spike squeezes AI margins →
      // Financeable(t+1) → I_AI), and the event cost bends. utilizedCompute =
      // t−1 utilization × the TERRESTRIAL capacity (orbital carries its own
      // power); GATED on a live requirement — the surfaced utilization is 1.0 at
      // zero supply (the no-glut convention), so an ungated read would fabricate
      // a zero-AI power bill (a stated implementation choice). The seam
      // year never computes it (E3: year-0 spending seam-identical).
      if (buildoutPlanForYear.dcRequired > 0) {
        const pEnergyIndex =
          Math.pow(1 + (config.buildoutEnergyCostTrend ?? BUILDOUT_LEG_COST_TREND.energy), year - DEFAULT_START_YEAR)
          * ((scIn?.energyPrice ?? 100) / 100)
          * energyCostBendFactor;
        const utilizedCompute = Math.max(0, Math.min(1, previousMacro.aiCapacityUtilization))
          * buildoutPlanForYear.capacityTerrestrial;
        const fpwNorm = flopsPerWattFactor(year) / flopsPerWattFactor(DEFAULT_START_YEAR);
        aiEnergyOpexForYear = AI_ENERGY_OPEX_SEAM_RATE * utilizedCompute * pEnergyIndex / fpwNorm;
      } else {
        aiEnergyOpexForYear = undefined;
      }
    }

    // ── THE FLYWHEEL (the hoist; the ratified checkpoint §2.2/§2.6) — ALWAYS-ON. ──
    // u_supply: the SC block's annual delay (1 − delay), or 1 when the block is dormant
    // (no supply constraint exists on a dormant path — the definitional extension).
    // u_demand: the DEAD-ZONED funding throughput from the t−1 macro funding gate
    // F = min(investmentRealization, aiCapacityUtilization) — exactly 1 at F ≥ θ (the
    // identity condition; the loop's gain is zero on every funded path), F/θ below.
    // Composition u = min(u_s, u_d) — Leontief (owner-ratified): capacity building is
    // bottlenecked by the scarcer of parts and funding; the drain law and κ_G carry
    // over verbatim (a year funded at u builds u of the planned increment, whether the
    // missing factor is chips or dollars — no new drain constant).
    {
      // ═══ PRODUCTION PROGRAM STAGE 1 (MS4+MS5) — THE FLYWHEEL RE-POINTS ═══
      // MS4 (u_supply): capacity feeds u_supply (checkpoint §1.2 consumer 1). The
      // frontier's pipeline is the TRAINING SLICE of the shared capacity (frontier labs
      // preempt; inference shortfall does not starve training until capacity falls
      // below the training share of the requirement) — the training-slice reading is a
      // FLAGGED executor interpretation within the ratified "Capacity_dc → u_supply",
      // reasoned in the Stage-1 report. Supply-chain famines now transmit THROUGH the
      // shocked stocks (shocks-on-stocks, the one-machine rule); the SC block's
      // annualCapabilityDelay keeps its capability-curve transmission role but no
      // longer feeds the flywheel (derived-dead here; kept computed per no-delete).
      // MS5 (F): F = financed-spend / required-spend (the honest funding ratio,
      // replacing the demand-proxy min(investmentRealization, aiCapacityUtilization));
      // F ≡ 1 at zero required spend (ratification A3). The t−1 timing stands (the
      // ratified flywheel law). The retired proxy form, kept per the no-delete rule:
      //   const F = previousMacro
      //     ? Math.min(previousMacro.investmentRealization, previousMacro.aiCapacityUtilization)
      //     : 1;
      const dSupplyShock = scEffects ? scEffects.annualCapabilityDelay.generative : 0;
      // STAGE 2 (T-A, post-verdict ruling 1): the training slice is the DERIVED
      // time-varying share (RL rollout compute inside the slice; the RL-era growth
      // path — buildout.ts trainingShare(), TRAINING_SHARE_DERIVATION.md). The
      // retired static read, kept per the no-delete rule:
      //   ... / (BUILDOUT_TRAINING_SHARE_2025 * buildoutPlanForYear.dcRequired)
      const uSupplyCapacity = buildoutPlanForYear
        ? (buildoutPlanForYear.dcRequired > 0
            ? Math.min(1, buildoutPlanForYear.capacityDc
                / (trainingShare(year) * buildoutPlanForYear.dcRequired))
            : 1)
        : (1 - dSupplyShock); // the machine's seam year rides the legacy shock path
      const F = previousMacro?.buildout
        ? previousMacro.buildout.fundingRatio
        : 1; // seam years: funded (the observed 2025 buildout was financed in fact)
      const theta = config.flywheelStarvationThreshold ?? DEFAULT_FLYWHEEL_STARVATION_THRESHOLD;
      const uDemand = theta > 0 && F < theta ? F / theta : 1;
      const combinedDelay = Math.max(1 - uSupplyCapacity, 1 - uDemand);
      const fwDials = resolveFrontierStockDials(effectiveScConfig ?? undefined);
      const frontier = computeFrontierStockUpdate(
        frontierStock,
        combinedDelay,
        effectiveScConfig?.trainingScaleGrowthRate ?? DEFAULT_TRAINING_SCALE_GROWTH_RATE,
        fwDials,
      );
      frontierStock = frontier.stock;
      cumulativeCapabilityDelay = {
        generative: cumulativeCapabilityDelay.generative + frontier.delayIncrement,
        agentic: cumulativeCapabilityDelay.agentic + frontier.delayIncrement,
        embodied: cumulativeCapabilityDelay.embodied + frontier.delayIncrement,
      };
      innovationStockMultiplier = frontier.innovationMultiplier;
      // The cost clock: τ seam-pinned at 0 for the start year (the curves' anchor),
      // then advances at S^φ_cost — exactly +1.0 per funded year (pow(1, φ) = 1;
      // integer accumulation is exact, so τ === t bit-zero on funded paths).
      if (year > config.startYear) {
        const phiCost = config.frontierCostElasticity ?? DEFAULT_FRONTIER_COST_ELASTICITY;
        effectiveCostTime += Math.pow(frontier.stock, phiCost);
      }
      tauByYear.set(year, effectiveCostTime);
    }

    // 1. Update capability scores S_c(t) for all vectors — the delay is loop state now
    // (always defined; {0,0,0} on funded unshocked paths ⇒ year − 0 = year, bit-exact).
    const capabilityScores = getAllCapabilityScores(
      year, config.capabilities,
      cumulativeCapabilityDelay,
    );

    // R1: attach the capability display mirrors (they depend on the SC delay above, so
    // they cannot resolve in the one producer) and write THE record — the same object
    // the engine consumes, mirrors included (battery R1-B4: mirror ≡ computed score).
    parameterTimeline.set(year, attachCapabilityMirrors(yearParams, {
      generative: capabilityScores.generative ?? 0,
      agentic: capabilityScores.agentic ?? 0,
      embodied: capabilityScores.embodied ?? 0,
    }));

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
    // FS-2b: the COMPOSED consumable (renamed from `automationAcceleration` — the naming hazard:
    // same name as the macro-state PRODUCER at macro.ts computeRevenuePressure). CAP-SHADOWING
    // SEMANTICS (documented per the ruling): one shared cap = a TOTAL acceleration bound; the
    // credit channel fills headroom only and dies silently at saturation. Currently dormant in
    // every standing scenario (C revPress <= 0.124 vs the 0.30 cap).
    const effectiveAutomationAcceleration = Math.min(
      secondOrderParams.revenuePressureCap,
      baseAutomationAcceleration + creditAdoptionAcceleration,
    );
    const automationAcceleration = effectiveAutomationAcceleration; // reason: downstream call sites read this name; the alias keeps the rename docs-true with zero blast radius

    // Phase 5g Step 9: Compute min wage BEFORE cluster loop (needed for adoption acceleration)
    // Stage H item 4 (the audit's placebo-flag finding): all three min-wage channels — the
    // Phillips LEVEL floor (policyWageFloor → macro), the adoption bonus, and the cost-push —
    // key off annualMinWage, so the program's `enabled` flag gates them HERE, at the single
    // source. The default config has enabled: true at the DOL $7.25 baseline, so default
    // behavior is bit-identical by construction; enabled: false now actually turns the
    // program off (previously a disabled program's schedule kept firing — the placebo).
    const minWageEnabled = config.policyConfig.minimumWage.enabled;
    const minWageHourlyEarly = minWageEnabled
      ? interpolatePolicy(config.policyConfig.minimumWage.federalMinimum, year)
      : 0;
    // Statutory-minimum indexation rides the price-only dampened cost-of-living
    // factor (one year lagged) — the instrument's real-world definition
    // (CPI-based state indexation practice), not the raw price level and not a
    // wage-carrying index. The retired raw basis, kept per the no-delete rule:
    //   * (indexedToInflation ? (previousMacro?.priceLevel ?? 1.0) : 1.0)
    const effectiveMinWageEarly = minWageHourlyEarly
      * (config.policyConfig.minimumWage.indexedToInflation ? prevPolicyIndexationFactor : 1.0);
    const annualMinWage = effectiveMinWageEarly * 2080; // 40hr/week × 52 weeks
    const policyWageFloor = annualMinWage / BASELINE_AVERAGE_ANNUAL_WAGE;
    const wageAutoSens = config.wageAutomationSensitivity ?? DEFAULT_WAGE_AUTOMATION_SENSITIVITY;

    // DEPRECATED: computeNominalWageGrowth + cumulativeWageGrowthFactor removed.
    // Wage nominal growth is handled by wageBase = prevNomGDP × BASELINE_WAGE_SHARE × (1 + productivity)
    // in computeMacro(). The explicit wage growth chain double-counted with that mechanism.

    // 2-5. For each cluster: BFCS → adoption → displacement
    const clusterResults: ClusterDisplacementResult[] = [];
    // Mini-stage 1: the deployer-savings diagnostic (replaces totalAutomationDividend —
    // the retired doubly-stale dividend, Audit B-4), the per-cluster realized-cost index
    // for the deflation channel, and the emergent tokens-per-task accumulators.
    let totalDeployerRealizedSavings = 0;
    // Mini-stage 2 (Amendment 1): the year's re-hiring budget — cost-triggered de-adoption
    // across all roles cannot draw more workers than the (t−1) pool holds.
    // Mini-stage 3 refinement: the budget is EFFECTIVENESS-WEIGHTED (Σ cohort ×
    // employability(d)) and the rehire wage basis is effectiveness-AND-scarring-weighted —
    // the pre-registered which-change directions: budget ≤ raw count (tighter throttle);
    // rehire wage ≤ vintage (cost-exit marginally more likely).
    let rehirePoolBudget = poolFillBudget(poolState, poolDials);
    const poolRehireWageValue = poolRehireWage(poolState, poolDials);
    const clusterAiCostIndex = new Map<string, number>();
    let aggInferenceLegSum = 0;
    let aggFrontierWeightSum = 0;
    let aggCostEmpWeight = 0;
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
      // RIDER 2: the consumer-site weight rung RETIRED — the effectiveClusters build
      // is the ONE producer (user > data-calibration > authored); this cluster object
      // already carries the resolved weights, uniformly with computeBetterScore and
      // the production expansion. The retired chain, kept per no-delete:
      // const effectiveWeights = clusterOverride
      //   ? {
      //       generative: clusterOverride.generativeWeight ?? cluster.capabilityRelevance.weights.generative,
      //       agentic: clusterOverride.agenticWeight ?? cluster.capabilityRelevance.weights.agentic,
      //       embodied: clusterOverride.embodiedWeight ?? cluster.capabilityRelevance.weights.embodied,
      //     }
      //   : cluster.capabilityRelevance.weights;
      const effectiveWeights = cluster.capabilityRelevance.weights;
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
      // Mini-stage 1: per-role realized-cost breakdowns (the one assembly), collected for
      // the deployer-savings diagnostic, the cluster cost index, and the emergent diagnostic.
      const roleCostBkByRole: Record<string, RoleCostBreakdown> = {};

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
        // FS-3: the margin-preserving bridge replaces the stored Cheaper threshold when the seam
        // basis is active AND no user override exists (a user override is the user's number).
        const seamKey = `${cluster.id}:${role.id}`;
        const bridgedCheaper = (config.bfcsOverrides[cluster.id]?.[role.id])
          ? baseThresholds.cheaper
          : (seamCheaperThreshold.get(seamKey) ?? baseThresholds.cheaper);
        const effectiveThresholds = {
          ...baseThresholds,
          cheaper: Math.max(0, Math.min(1, bridgedCheaper - payrollCostShift)),
        };

        // Compute BFCS scores and check adoption trigger
        // Phase 9: Pass supply chain BFCS multipliers when active
        // Select blend-scaled sensitivity matrix matching this cluster's AI type
        const scSensitivity = (cluster.deploymentType === 'software' || cluster.deploymentType === 'hybrid')
          ? scEffects?.scaledCognitiveSensitivity : scEffects?.scaledEmbodiedSensitivity;
        const scBFCSParams = (scConfig && scEffects && scLaggedInputs) ? {
          fasterMultiplier: computeFasterMultiplier(
            scLaggedInputs, scEffects.effectiveResilience, cluster.deploymentType, (effectiveScConfig ?? scConfig).inputs.softwareEfficiency,
            scSensitivity,
          ),
          saferMultiplier: computeSaferMultiplier(
            scLaggedInputs, scEffects.effectiveResilience, cluster.deploymentType,
            scSensitivity,
          ),
          costMultipliers: scEffects.bfcsCostMultipliers,
        } : undefined;

        // Mini-stage 1: the Better-ARRIVAL latch — the first year the frontier meets this
        // role's requirement anchors its fixed-capability cost curve; the CURRENT-year
        // surplus s = Better − B* sets the migration weight w(s) off the frontier.
        const roleBetter = computeBetterScore(capabilityScores, cluster, role);
        if (betterArrivalYears[cluster.id]![role.id] === null && roleBetter >= effectiveThresholds.better) {
          betterArrivalYears[cluster.id]![role.id] = year;
        }
        const roleArrivalYear = betterArrivalYears[cluster.id]![role.id] ?? null;
        const roleBetterSurplus = roleBetter - effectiveThresholds.better;

        // Flywheel MS: the cost clock for this role — τ now, τ at the role's arrival
        // (the fixed-capability re-anchor). On funded paths τ === calendar bit-exactly.
        const roleCostClock = {
          tEff: effectiveCostTime,
          tauAtArrival: roleArrivalYear !== null
            ? (tauByYear.get(roleArrivalYear) ?? Math.max(0, roleArrivalYear - config.startYear))
            : null,
        };
        const { triggered, scores } = checkAdoptionTrigger(
          cluster, role, year, capabilityScores, effectiveThresholds, effectiveAiCostParams,
          scBFCSParams,
          clusterWageAdjustment,  // Phase 10.A — propagates into Cheaper via computeCheaperScore
          seamWageRelative.get(seamKey),                       // FS-3: the OEWS basis
          previousMacro?.wageIndex ?? 1.0,  // FS-3 G1 (t−1). RETIRED (CO-D2, R3b): seamBasisOnly held 1.0 here — pole at ~/.atlas-referents/co-d2/seamBasisOnly/
          roleArrivalYear, roleBetterSurplus,                  // mini-stage 1: the cost layer's anchors
          roleCostClock,                                       // flywheel MS: the τ clock
        );

        // Mini-stage 1: the per-role realized-cost breakdown (ONE assembly, aiCost.ts) —
        // consumed below by the deployer-savings diagnostic, the cluster cost index for the
        // consumer-price deflation channel, and the emergent tokens-per-task diagnostic.
        const roleCostBk = computeAiCostFraction(
          year, cluster.deploymentType, roleArrivalYear, roleBetterSurplus,
          effectiveAiCostParams, scEffects?.bfcsCostMultipliers ?? { inference: 1, manufacturing: 1, energy: 1 },
          roleCostClock, // flywheel MS: the τ clock (the one assembly's substitution point)
        );
        roleCostBkByRole[role.id] = roleCostBk;

        // Phase 10.A fix #2 — effective trigger year shifts forward by role.aiReplacementFrictionYears
        // (direct years, no global scaling). We record the EFFECTIVE trigger year rather than the raw
        // BFCS-met year. If the shifted year falls outside the simulation window, the role never triggers.
        // THE TRIGGER-YEAR RECORD (rewritten at the program close-out — the one-way latch
        // description retired): the trigger year is set once as the role's ARRIVAL record
        // (the anchor the cost layer and the state machine both key from). Adoption itself
        // is NOT one-way — the unified state machine below (computeUnifiedAdoptionState)
        // grows, freezes, declines (availability-forced or cost-triggered against the
        // displaced pool's rehire basis), and recovers slowly, on EVERY path.
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

        // 4. Compute adoption rate — THE UNIFIED STATE MACHINE (mini-stage 2, §4 as amended).
        // ONE path (Amendment 2 — the latch and the SC-only stateful branch retire outright):
        // the machine wraps the RAW rich curve (getAdoptionRate, every modifier intact, no
        // ratchet) so the no-shock world reproduces the predecessor EXACTLY (the pre-
        // registered bit-identity row), and adds freeze / availability-forced decline /
        // cost-triggered decline against the REHIRE basis with the pool-size fill throttle
        // (Amendment 1's capacity coupling at this stage's resolution).
        {
          const isCognitive = cluster.deploymentType === 'software' || cluster.deploymentType === 'hybrid';
          const classDeAdoptionRate = isCognitive
            ? (config.deAdoptionRateCognitive ?? ADOPTION_DECLINE_RATE_COGNITIVE)
            : (config.deAdoptionRateEmbodied ?? ADOPTION_DECLINE_RATE_EMBODIED);
          const reRate = (config.reAdoptionRate ?? DEFAULT_RE_ADOPTION_RATE_FRACTION) * classDeAdoptionRate;
          const prevRate = adoptionState.rates[cluster.id]?.[role.id] ?? 0;
          const frozenSince = adoptionState.frozenSince[cluster.id]?.[role.id] ?? null;
          const prevHasDeclined = adoptionState.hasDeclined[cluster.id]?.[role.id] ?? false;
          const yearsSince = roleTriggerYear !== null ? Math.max(0, year - roleTriggerYear) : 0;
          const hysteresisWidth = computeHysteresisWidth(yearsSince, cluster.deploymentType, effectiveScConfig ?? undefined);
          const clusterDrag = (scConfig && scEffects && scLaggedInputs)
            ? computeAdoptionDrag(
                scLaggedInputs, scEffects.effectiveResilience, cluster.deploymentType, scEffects.costPassThroughRate,
                scSensitivity,
              )
            : 1.0;
          const growthResult = getAdoptionRate(
            year, roleTriggerYear, cluster.deploymentType, clusterLag,
            cluster.geopoliticalRiskExposure, effectiveAdoptionParams,
            automationAcceleration + minWageAdoptionBonus,
            scEffects ? clusterSteepness * clusterDrag : clusterSteepness,  // drag folds into steepness (×1 exact at defaults)
            clusterCeiling,
            role.aiReplacementDifficultyWagePremium ?? 0,
            peerAlpha,
            config.competitivePressureThreshold ?? DEFAULT_COMPETITIVE_PRESSURE_THRESHOLD,
          );
          // The REHIRE basis (Amendment 1): the displaced pool's composition-weighted wage
          // (t−1 — the pool the firm would actually hire from), degrading to the incumbent
          // basis when the pool is empty. Same scoring machinery as Cheaper.
          const rehireRel = poolRehireWageValue > 0
            ? poolRehireWageValue / BASELINE_AVERAGE_ANNUAL_WAGE
            : seamWageRelative.get(seamKey);
          const cheaperRehire = computeCheaperScore(
            year, role, cluster, effectiveAiCostParams,
            scEffects?.bfcsCostMultipliers ?? { inference: 1, manufacturing: 1, energy: 1 },
            clusterWageAdjustment, rehireRel,
            previousMacro?.wageIndex ?? 1.0,  // RETIRED (CO-D2): the seamBasisOnly 1.0-hold branch
            roleArrivalYear, roleBetterSurplus,
            roleCostClock, // flywheel MS: the τ clock (same realized-cost object as the trigger)
          );
          // The pool-size fill throttle (this stage's capacity resolution; MS3 refines to
          // effectiveness-weighted): cost-triggered re-hiring cannot draw more workers than
          // the pool holds, budgeted deterministically across roles within the year.
          const roleEmployment = (baseline.employments[role.id] ?? 0) * laborForceGrowthFactor;
          const requested = classDeAdoptionRate * roleEmployment;
          const fillCapFactor = requested > 0 ? Math.min(1, rehirePoolBudget / requested) : 1;
          const unified = computeUnifiedAdoptionState({
            year, previousRate: prevRate, previousFrozenSince: frozenSince,
            previousHasDeclined: prevHasDeclined, triggerYear: roleTriggerYear,
            growthRate: growthResult.adjustedAdoptionRate,
            bfcsCurrentlyMet: triggered,
            scores: { better: scores.better, faster: scores.faster, safer: scores.safer },
            thresholds: effectiveThresholds,
            cheaperRehire, hysteresisWidth,
            deAdoptionRate: classDeAdoptionRate, reAdoptionRate: reRate,
            fillCapFactor,
          });
          rehirePoolBudget = Math.max(0, rehirePoolBudget - unified.costRehireFraction * roleEmployment);
          adoptionRates[role.id] = unified.adoptionRate;
          if (!adoptionState.rates[cluster.id]) adoptionState.rates[cluster.id] = {};
          if (!adoptionState.frozenSince[cluster.id]) adoptionState.frozenSince[cluster.id] = {};
          if (!adoptionState.hasDeclined[cluster.id]) adoptionState.hasDeclined[cluster.id] = {};
          adoptionState.rates[cluster.id]![role.id] = unified.adoptionRate;
          adoptionState.frozenSince[cluster.id]![role.id] = unified.frozenSince;
          adoptionState.hasDeclined[cluster.id]![role.id] = unified.hasDeclined;
        }

        // Collect BFCS output for Phase 4 visualization
        roleBFCSOutputs.push({
          roleId: role.id,
          scores,
          thresholds: effectiveThresholds,
          triggered,
          triggerYear: roleTriggerYear,
          adoptionRate: adoptionRates[role.id]!,
          betterArrivalYear: roleArrivalYear,  // mini-stage 1: the fixed-capability anchor
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
        // STAGE 2 (order item 5 — the ledger transition): the replacementMultiplier DIAL
        // retires with the VA re-anchor (the ledger no longer consumes it at all). This
        // deflation-channel formula is the ONE surviving consumer and reads the FROZEN
        // constant — config influence retired so no unreachable parameter survives (the
        // every-parameter-reachable law). DOCKETED, not silently changed: re-deriving
        // this term's productivity factor from the measured per-cluster VA/wage multiple
        // (the ledger's new basis) is REGISTERED for its own ruling — the deflation
        // channel's savings arithmetic is out of the Stage-2 order's scope.
        // The retired config read, kept per the no-delete rule:
        //   const replacementMultiplier = config.replacementMultiplier ?? DEFAULT_REPLACEMENT_MULTIPLIER;
        const replacementMultiplier = DEFAULT_REPLACEMENT_MULTIPLIER;
        const effProd = 1 + weightedCapability * clusterBetter * replacementMultiplier * (1 + clusterCheaper);
        effectiveProductivityByCluster.set(cluster.id, effProd);
        clusterBetterByCluster.set(cluster.id, clusterBetter);
        clusterCheaperByCluster.set(cluster.id, clusterCheaper);
      }

      // Phase 10.A — use computed effective α per role (5-driver model)
      // STAGE 4 MS4 — THE DISPLACEMENT GATE (the ratified design §2):
      // g_c = (1 − w_embodied,c) + w_embodied,c × fleetCoverage_c. The software
      // path never gates; coverage 1 where the cluster carries no t−1 cleared
      // requirement (the A3 identity — pre-clearance and zero-AI paths are
      // bit-silent by construction).
      const wEmbGate = cluster.capabilityRelevance.weights.embodied;
      const clusterFleetCoverage = perClusterCoverage[cluster.id]
        ?? ((prevPerClusterFleetReq[cluster.id] ?? 0) > 0 ? 0 : 1);
      const displacementGate = (1 - wEmbGate) + wEmbGate * clusterFleetCoverage;
      const clusterDisplacement = computeClusterDisplacement(
        cluster,
        adoptionRates,
        scaledEmployments,
        baseline.wages,
        weightedCapability,
        roleAlphas,
        clusterOverride?.wageElasticity,
        config.scarcityIntensity ?? DEFAULT_SCARCITY_INTENSITY,
        displacementGate,
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
      // FS-2b (the cut edge marked for the seam): this is the ONLY wage signal the adoption
      // stack ever sees -- the WITHIN-CLUSTER scarcity premium. The economy-wide wage LEVEL
      // (COLA/indexation, scenario-differentiating) enters Cheaper NOWHERE (FS2_MEMO, the
      // pinning mechanism). The FS-3 seam package owns the connection decision.
      nextWageAdjByCluster.set(cluster.id, clusterDisplacement.wageAdjustmentFromScarcity ?? 0);

      // Accumulate for macro aggregate (weight by baseline employment)
      const clusterBaselineEmpSum = clusterAlphaWeightTotal / Math.max(laborForceGrowthFactor, 1e-9);
      yearAggregatePremiumSum += (clusterDisplacement.aggregateReplacementDifficultyWagePremium ?? 0)
        * clusterBaselineEmpSum;
      yearAggregatePremiumWeight += clusterBaselineEmpSum;
      yearNewDisplacedHeadcount += clusterDisplacement.totalDirectDisplacement ?? 0;

      // Attach BFCS output to cluster result
      clusterDisplacement.bfcsOutput = roleBFCSOutputs;

      // Mini-stage 1: DEPLOYER REALIZED SAVINGS — the diagnostic rebuilt on the ONE
      // realized-cost object with the LIVE human-cost basis (the FS-3 OEWS basis × the
      // nominal wageIndex × scarcity — the same denominator the Cheaper score uses).
      // Replaces the retired automation dividend, which rode the DEPRECATED exp leg
      // (exp(inferenceAnnualChange·t) — ÷78,000 by 2050 vs the live ÷104) AND the retired
      // seniority proxy (Audit B-4, the doubly-stale diagnostic). Unclamped: negative when
      // AI costs MORE than the displaced labor it replaced (supply-shock compression).
      const divEconIndex = previousMacro?.wageIndex ?? 1.0;  // RETIRED (CO-D2): the seamBasisOnly 1.0-hold branch
      for (const roleResult of clusterDisplacement.roles) {
        if (roleResult.displacementPct <= 0) continue;
        const role = cluster.roles.find(r => r.id === roleResult.roleId);
        if (!role) continue;
        const roleWage = baseline.wages[role.id] ?? 0;
        const displacedCount = roleResult.displacementPct * (scaledEmployments[role.id] ?? 0);
        if (displacedCount <= 0 || roleWage <= 0) continue;
        const bk = roleCostBkByRole[role.id];
        if (!bk) continue;
        const basisFactor = seamWageRelative.get(`${cluster.id}:${role.id}`) ?? (0.3 + role.seniorityLevel * 0.7);
        const humanCostFactor = basisFactor * divEconIndex * (1 + clusterWageAdjustment);
        if (humanCostFactor <= 0) continue;
        const costSavingsRatio = 1 - (bk.fraction / humanCostFactor);
        totalDeployerRealizedSavings += displacedCount * roleWage * costSavingsRatio;
      }

      // Mini-stage 1: the cluster's employment-weighted realized cost index (for the
      // consumer-price deflation channel — the SAME object the Cheaper score prices from,
      // INCLUDING supply-chain multipliers; resolves the audit's B-3/C-5 basis divergence)
      // + the economy-wide emergent-diagnostic accumulators.
      {
        let idxSum = 0; let idxWeight = 0;
        for (const role of cluster.roles) {
          const bk = roleCostBkByRole[role.id];
          const emp = scaledEmployments[role.id] ?? 0;
          if (!bk || emp <= 0) continue;
          idxSum += bk.fraction * emp;
          idxWeight += emp;
          aggInferenceLegSum += bk.inferenceLeg * emp;
          aggFrontierWeightSum += bk.frontierWeight * emp;
          aggCostEmpWeight += emp;
        }
        clusterAiCostIndex.set(cluster.id, idxWeight > 0 ? idxSum / idxWeight : 1.0);
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

    // Stage 2 (firewall): demand baselines grow at the real structural TREND (potential growth),
    // matched to the t-1 prev-year real C/G/I. Spillover fires only when real demand falls BELOW trend
    // (minus the tolerance band) — not when it merely fails to exceed a frozen year-0 level. This KEEPS
    // real-quantity ratios (employment follows the QUANTITY of demand; AI's per-unit labor reduction is
    // already captured in the displacement channel, so a nominal ratio would double-count). The original
    // "static baseline" was chosen because Stage-0's broken ~1.6% growth let real C lag a 2% baseline and
    // false-fire; Stage 0 fixed realized zero-AI growth to ~2.1%, so a 2% trend baseline now sits ≈1.0
    // (ratios ≈1 within tolerance ⇒ zero demand layoffs in zero-AI). Falls back to BEA constants for year 0.
    // E-3 (examination, EMERGENT-CONSISTENT closed form): the demand-trend growth is the post-D-1
    // potential real income growth — perWorkerProductivity × productivityPassthrough + population
    // growth (≈ 1.6 × 0.90 + 0.4 = 1.84%/yr) — derived from ratified parameters, deterministic
    // (charter-preferred over a moving average). The fixed 2.0% ignored the D-1 passthrough; the
    // ~0.16pp/yr wedge compounded into the parked demand-survival tail (0.9981/0.9984). Resolves it
    // to exact dormancy (the 3% tolerance absorbs the small emergent residual).
    // config.demandTrendGrowth overrides for isolation runs (legacy = 0.02).
    const demandTrendGrowthRate = config.demandTrendGrowth
      ?? (((config.baselineGDPGrowth ?? BASELINE_GDP_GROWTH_RATE) - DEFAULT_POPULATION_GROWTH_RATE)
        * (config.productivityPassthrough ?? DEFAULT_PRODUCTIVITY_PASSTHROUGH)
        + (config.populationGrowthRate ?? DEFAULT_POPULATION_GROWTH_RATE));
    const demandTrendFactor = Math.pow(
      1 + demandTrendGrowthRate,
      Math.max(0, (year - config.startYear) - 1),
    );
    const effectiveBaseC = (demandBaselineRealC ?? BASELINE_CONSUMPTION_2025) * demandTrendFactor;
    const effectiveBaseG = (demandBaselineRealG ?? BASELINE_GOVT_SPENDING_2025) * demandTrendFactor;
    const effectiveBaseI = (demandBaselineRealI ?? BASELINE_INVESTMENT_2025) * demandTrendFactor;
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

    // Phase 5g Step 7 + the policy-wiring review's basis fix: the indexed-UBI base tracks
    // REALIZED nominal AI revenue at the index start year — the honest earnings
    // basis the profits machinery and the research channel use — replacing the raw
    // internal composition (aiGDPContribution), which collapses in the crisis while
    // realized revenue is in the trillions (the audited stale basis). The variable
    // keeps its name (persisted-state shape untouched); the captured quantity is
    // the realized-revenue series. The retired capture, kept per the no-delete rule:
    //   startYearAiGDP = previousMacro.aiGDPContribution;
    // The basis is REAL (deflated by the price level): the index answers "how
    // much more AI output is really being sold," so a nominal basis would ride
    // its own inflation back into the transfer (measured on the first battery
    // execution: the nominal form re-created the spiral). Executor
    // interpretation, flagged in the pre-registration record.
    const prevRealizedAiRevenue = previousMacro && previousMacro.priceLevel > 0
      ? Math.max(0, previousMacro.aiRealizedGDPContribution / previousMacro.priceLevel
        + previousMacro.aiGoodsAbsorbed)
      : 0;
    const ubiStartYear = config.policyConfig.ubi.indexedStartYear ?? 2032;
    if (year >= ubiStartYear && startYearAiGDP === 0 && previousMacro) {
      startYearAiGDP = prevRealizedAiRevenue;
    }

    // 10. Policy effects
    // Close-out §9 item 3 (ruled fix): the enhanced-UI benefit is priced at the displaced
    // pool's prior wage, not the remaining-workers average — the pool object comes from the
    // same math as the incidence layer (year-0 cluster results captured on the first
    // iteration; year 0 is displacement-free by construction, so the pool is empty there
    // and pricing reduces to the average wage — bit-identical to the pre-fix path).
    if (year0ClusterResults === null) year0ClusterResults = clusterResults;
    const displacedPool = computeDisplacedPool(year0ClusterResults, clusterResults);
    // Mini-stage 2: next year's rehire basis / fill budget (this year's adoption block
    // already consumed the prior value — the t−1 discipline).
    previousDisplacedPool = displacedPool;
    // Mini-stage 3: advance the duration cohorts (age → discouragement exits → reconcile
    // against the displaced stock; conservation asserted at battery B3-2). New cohorts
    // carry the CURRENT enhanced-UI entitlement (or current-law when the program is off).
    poolState = advanceDisplacedPool(
      poolState, displacedPool.count, displacedPool.avgWage,
      config.policyConfig.enhancedUI.enabled ? config.policyConfig.enhancedUI.durationWeeks : CURRENT_LAW_UI_DURATION_WEEKS,
      poolDials,
    );
    const poolSearchingCount = poolState.cohorts.reduce((a, c) => a + c.count, 0);
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
      displacedPool.count,
      displacedPool.avgWage,
      prevRealizedAiRevenue,                   // the realized-revenue index basis (t−1)
      startYearAiGDP,                          // the index base at the start year (same basis)
      // Stage H addendum (A-6): the equity/profit-sharing payout base — prior-year realized
      // ENDOGENOUS AI corporate profits (the t−1 basis the loop ordering forces; year 0 = 0,
      // the 2025 anchor's initialization — no automation profits exist at the anchor).
      previousMacro?.aiCorporateProfits ?? 0,
      // Mini-stage 3: the entitlement-weeks pricing input (this year's pool, post-advance).
      poolDurationShares(poolState),
      // The price-only dampened indexation factor (one year lagged) for the
      // UBI's inflation indexation.
      prevPolicyIndexationFactor,
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

    // Get effective UBI for replacement rate calculation (the same
    // realized-revenue index basis the policy-effects call consumes).
    const effectiveUBIMonthly = getEffectiveUBI(
      config.policyConfig.ubi,
      year,
      prevRealizedAiRevenue,
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
    const sectorDeflationResult = computeSectorWeightedDeflation(
      clusterResults, year, mergedDeflationOverrides,
      clusterDeploymentMap, effectiveAiCostParams,
      augmentationByCluster, effectiveProductivityByCluster,
      augmentedHeadcountByCluster,
      clusterBetterByCluster, clusterCheaperByCluster,
      config.augmentationMultiplier ?? DEFAULT_AUGMENTATION_MULTIPLIER,
      clusterAiCostIndex,  // mini-stage 1: the ONE realized-cost assembly (aiCost.ts)
    );
    // Stage 1.5: scalar total (back-compat: monetization + aiDeflationRate output) + per-sector routing.
    const sectorWeightedDeflationRate = sectorDeflationResult.total;
    const sectorDeflationByConsumption = sectorDeflationResult.byConsumption;

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
    // MS1 (the frontier stock, the checkpoint's one-machine coupling): the innovation
    // channel consumes the stock — creation = innovationRate × GDP × rdMultiplier ×
    // stock^elasticity, at THIS single site. Gated on the SC block existing (dormant
    // configs never touch the multiplicand); on an unshocked path the multiplier is
    // exactly 1 (pow(1, e) = 1), so only famines drag new-job creation.
    // FLYWHEEL MS (the hoist): the multiplier is loop-produced and ALWAYS-ON — on a
    // funded, unshocked path it is exactly pow(1, φ_inn) = 1 and x × 1 = x bit-exactly
    // (the identity); a demand famine now drags new-job creation like a supply famine.
    const effectiveInnovationRate = config.innovationRate * innovationStockMultiplier;
    const newJobMetrics = computeNewJobMetrics(
      prevGDPForJobs,
      automationCoverage,
      aggregate.totalDirectDisplacement,
      effectiveInnovationRate,
      config.rdMultiplier,
      config.jobPersistenceFactor,
    );

    // Phase 2: AI production expansion (H3 ruling 3: valued at the year-0 wage vintage —
    // year0ClusterResults was captured above; at year 0 it IS this year's results).
    // STAGE 2 (Channel 2): the VA re-anchor consumes the start-of-year FLEET stock (the
    // embodiment gate) and the real economy index (the market grows with the economy);
    // it returns the cleared-work fleet requirement the NEXT year's plan consumes.
    const aiProduction = computeAIProductionExpansion(
      clusterResults, effectiveClusters, capabilityScores, config,
      triggerBetterScores, year0ClusterResults ?? clusterResults,
      {
        fleetUnits: buildoutState.fleetUnits,
        econIdx: previousMacro && buildoutRealGDP2025 && buildoutRealGDP2025 > 0
          ? Math.max(0, previousMacro.gdpReal) / buildoutRealGDP2025
          : 1,
        // Stage 4 MS4: the ONE coverage series (the ledger gate re-points to the
        // same per-cluster coverage the displacement gate consumed this year) +
        // the trust-maturity ramp's inputs for next year's priority.
        perClusterCoverage,
        year,
        trustHalfLifeYears: (config.alphaDriverParams ?? DEFAULT_ALPHA_DRIVER_PARAMS).trustHalfLifeYears,
      },
    );
    prevClearedFleetRequirement = aiProduction.clearedFleetRequirement;
    // Stage 4 MS4: thread the per-cluster requirement + priority to next year.
    prevPerClusterFleetReq = aiProduction.perClusterFleetRequirement;
    prevPerClusterPriority = aiProduction.perClusterPriority;

    // Build production inputs for computeMacro
    const augWageShare = BASELINE_WAGE_SHARE;
    const productionInputs: MacroProductionInputs = {
      aiInvestmentBoost: aiProduction.aiInvestmentBoost,
      aiNetExportBoost: aiProduction.aiNetExportBoost,
      aiConsumerGoodsPotential: aiProduction.aiConsumerGoodsPotential,
      aiAdditionalOutput: aiProduction.totalAdditionalOutput,
      aiPotentialCeiling: aiProduction.potentialCeiling,
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

    // R1 (the axes program): the autopilot + resolution block MOVED to the top of the
    // year loop (before the supply-chain consumption) — the ONE producer; the engine and
    // the record consume the same object. isFirstFiscalYear ≡ (year − startYear) === 0,
    // the expression the moved block uses. The record is written after the capability
    // mirrors attach (attachCapabilityMirrors, post-scores).

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
      // FS-6f (ruled): THE 8-CHANNEL COMPLETENESS ASSERTION. All eight components are now
      // exposed on MacroOutput and passed DIRECTLY (the routing-blind residual derivation is
      // retired). The booked total must reconstruct from the exposed components exactly — a
      // future 9th revenue channel added to the macro total without being exposed here fails
      // LOUD instead of landing silently in transferTax. (Same addition order as macro.ts.)
      const reconstructedRevenue =
        prevMacroForFiscal.wageIncomeTax
        + prevMacroForFiscal.employeePayrollTax
        + prevMacroForFiscal.employerPayrollTax
        + prevMacroForFiscal.capitalGainsTax
        + prevMacroForFiscal.nonCorporateAssetTax
        + prevMacroForFiscal.transferTax
        + prevMacroForFiscal.corporateTaxRevenue
        + prevMacroForFiscal.stateLocalRevenue;
      if (Math.abs(reconstructedRevenue - prevMacroForFiscal.totalGovernmentRevenue) > 0.5) {
        throw new Error(
          `[ATLAS fiscal] Revenue completeness violated at year ${year}: the 8 exposed tax `
          + `components sum to ${reconstructedRevenue} but totalGovernmentRevenue(t−1) is `
          + `${prevMacroForFiscal.totalGovernmentRevenue}. A revenue channel was added to the `
          + `macro total without being exposed on MacroOutput — expose it and pass it through `
          + `computeEndogenousRevenue explicitly.`,
        );
      }
      const revenue = computeEndogenousRevenue(
        prevMacroForFiscal.wageIncomeTax,
        prevMacroForFiscal.employeePayrollTax,
        prevMacroForFiscal.employerPayrollTax,
        prevMacroForFiscal.corporateTaxRevenue,
        prevMacroForFiscal.capitalGainsTax,
        prevMacroForFiscal.stateLocalRevenue,
        prevMacroForFiscal.transferTax,
        prevMacroForFiscal.nonCorporateAssetTax,
        prevMacroForFiscal.gdpNominal,
      );

      // 14b: Government spending (with Phase 8b effective consolidation multipliers)
      const spending = computeGovernmentSpending(
        revenue.bookedRevenueT1,
        BASELINE_PRIMARY_DEFICIT_GDP_RATIO,
        prevMacroForFiscal.gdpNominal,
        policyEffects.transferChannelAddition,
        0, // retrainingCosts — already included in transferChannelAddition
        // Stage 5b (F1): wage-subsidy + SWF-contribution costs — previously these reached the
        // reporting deficit (policyEffects.fiscalCost → computeFiscalPressure) but NEVER the debt
        // path. Book the full policy fiscal cost: fiscalCost = wage + transfer + SWF, so the
        // non-transfer remainder goes here. Dormant when only transfer policies are enabled.
        policyEffects.fiscalCost - policyEffects.transferChannelAddition,
        previousDebtStock,
        previousWeightedAvgDebtRate,
        consolidation.discretionaryMultiplier,
        consolidation.obligationMultiplier,
        // Stage 5 (H3): book the incremental-UE stabilizer transfers (cash + in-kind) the income
        // side paid — SAME dollar flow, t−1 per the fiscal block's uniform convention (like revenue).
        // Previously this spending never reached the debt path (households got unbooked income).
        prevMacroForFiscal.incrementalTransferSpending,
      );

      // 14c: Deficit and debt accumulation
      const debtResult = computeDebtAccumulation(
        spending.totalGovernmentSpending,
        revenue.bookedRevenueT1,
        spending.interestExpense,
        previousDebtStock,
        prevMacroForFiscal.gdpNominal,
      );

      const debtServiceRevenueRatio = revenue.bookedRevenueT1 > 0
        ? spending.interestExpense / revenue.bookedRevenueT1
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
      void prevDynamicLaborForce;  // DEPRECATED input of computeFullEmploymentGDP (E-8c F-A); kept per the no-delete rule
      // E-8c F-A (ratified): the plucking potential replaces the BASELINE×(1+g)^t line (the F-A
      // finding: +6.0% year-0 offset + the capacity-gated bootstrap fed +2.1pp into the Taylor
      // gap terms). gPotential = perWorker productivity + population (PRODUCTION side — no D-1
      // passthrough); the AI boost multiplies the COUNTERFACTUAL line (ratified composition
      // order) so realized AI-era production is never absorbed into the counterfactual.
      const gPotential = (config.baselineGDPGrowth - DEFAULT_POPULATION_GROWTH_RATE)
        + (config.populationGrowthRate ?? DEFAULT_POPULATION_GROWTH_RATE);
      const pluckingBoost = 1 + AI_PRODUCTIVITY_BOOST_AT_FULL_COVERAGE * automationCoverage;
      const boostAdjust = prevPluckingBoost > 0 ? pluckingBoost / prevPluckingBoost : 1.0;
      pluckingPotentialGDP = computePluckingPotential(
        pluckingPotentialGDP,
        prevMacroForFiscal.gdpReal,
        gPotential,
        boostAdjust,
      );
      prevPluckingBoost = pluckingBoost;
      const outputGap = pluckingPotentialGDP > 0
        ? (prevMacroForFiscal.gdpReal - pluckingPotentialGDP) / pluckingPotentialGDP
        : 0;

      // 14e: Taylor Rule with dual mandate (Phase 8 Fix 4)
      // E-8b item 1 (ratified, units correction): config.inflationTarget is the Fed's 2% PCE; the
      // composite is CPI-basis — every comparison uses target + PCE_CPI_WEDGE (the pre-E-8b form
      // compared CPI inflation to a PCE target: ~0.5pp structurally hawkish, ~0.75pp on policy).
      const effectiveCPITarget = (config.inflationTarget ?? 0.02) + (config.pceCpiWedge ?? PCE_CPI_WEDGE);
      const prevCompositeInflation = prevMacroForFiscal.compositeInflation ?? 0;
      // E-9 item 2 (ratified): the Fed's mandate variable is the endogenous PCE PROXY read against
      // the 2% PCE target DIRECTLY (no wedge) — resolves the audit's row-3 mixed basis at the root.
      // usePceProxy:false = the E-8b fixed-wedge fallback (CPI composite vs target+wedge).
      const usePceProxy = config.usePceProxy ?? true;
      const fedInflationInput = usePceProxy
        ? (prevMacroForFiscal.pceProxyInflation ?? (prevCompositeInflation - (config.pceCpiWedge ?? PCE_CPI_WEDGE)))
        : prevCompositeInflation;
      const fedTarget = usePceProxy ? (config.inflationTarget ?? 0.02) : effectiveCPITarget;
      // E-9 item 3 (ratified): NAIRU unified on the cited FRED/CBO value everywhere (the Phillips
      // side already used it). Year-0 employment gap ≈ FRED_NAIRU − realized-2025 UE (disclosed in
      // the Gate A attribution). legacyNairu = the pre-E-9 split (Taylor on realized-2025).
      // RETIRED (CO-D2 conversion, the axes program R3b; Amendment 2): legacyNairu —
      // the E-9 isolation toggle (Taylor on the realized-2025 basis). The comparison
      // capability lives on as the RECORDED POLE (~/.atlas-referents/co-d2/legacyNairu/,
      // recorded pole-first at this commit); the key is out of types and the registry.
      // const fedNairu = (config.legacyNairu ?? false) ? NATURAL_UNEMPLOYMENT_RATE : FRED_NAIRU_RATE;
      const fedNairu = FRED_NAIRU_RATE;
      const prevUnemploymentRate = prevMacroForFiscal.unemploymentRate ?? fedNairu;
      const taylorPrescribed = computeTaylorRule(
        config.neutralRealRate ?? 0.007,                        // Fix 4: configurable r*, default 0.7%
        fedInflationInput,                                      // E-9 item 2
        fedTarget,                                              // E-9 item 2
        outputGap,
        yearParams.taylorInflationCoeff.effective,               // Fix 4: per-year overridable via sidebar
        yearParams.taylorOutputGapCoeff.effective,                // Fix 4: per-year overridable via sidebar
        prevUnemploymentRate,                                    // NEW: employment gap
        fedNairu,                                                // E-9 item 3: unified FRED NAIRU
        yearParams.taylorEmploymentGapCoeff.effective,            // NEW: per-year overridable via sidebar
      );

      // 14f: Fiscal dominance check + policy rate override
      // E-9b (ratified): policy-rate INERTIA — the smoothed prescription replaces the instantaneous
      // one everywhere downstream (the last instantaneous agent joins the gradual-adjustment family).
      // Init at the OBSERVED policy rate (was INITIAL_10Y_YIELD — a wrong-constant pair, §2-class).
      const policyRateOverride = config.policyRateSchedule
        ? interpolatePolicy(config.policyRateSchedule, year)
        : null;
      const prevPolicyRate = previousFiscalMonetary?.federalReserve.policyRate ?? INITIAL_POLICY_RATE;
      const taylorRho = config.taylorSmoothing ?? DEFAULT_TAYLOR_SMOOTHING;
      const smoothedPrescription = taylorRho * prevPolicyRate + (1 - taylorRho) * taylorPrescribed;
      const fedResult = computeFiscalDominance(
        smoothedPrescription,
        prevPolicyRate,
        spending.interestExpense,
        revenue.bookedRevenueT1,
        config.fiscalDominanceThreshold ?? DEFAULT_FISCAL_DOMINANCE_THRESHOLD,  // L9c-5: cited (IMF DSA-class)
        config.fiscalDominanceDampening ?? 0.5,
        policyRateOverride,
      );

      // 14g: Monetization rate (Phase 8b: use effective parameters from three-layer resolution)
      // Phase 8 fix: restructured to max-of-all-cases + yield-responsive monetization
      const monetizationResult = computeMonetizationRate(
        fedResult.policyRate,
        config.effectiveLowerBound ?? -0.005,
        fedResult.fiscalDominanceActive,
        smoothedPrescription,  // E-9b: the Fed's desired path is the inertial one
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
        // E-8c F-B: the fiscal-dominance co-conditions (lagged premium, like the lagged yield)
        previousFiscalMonetary?.bondMarket.fiscalRiskPremium ?? 0,
        config.monetizationDominanceThreshold ?? DEFAULT_MONETIZATION_DOMINANCE_THRESHOLD,
        config.monetizationPremiumCoCondition ?? DEFAULT_MONETIZATION_PREMIUM_COCONDITION,
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
      // Stage 5: stabilizer transfers are transfer-like spending (high-MPC recipients) — include
      // them in the transfer share for monetization transmission composition.
      const transferSpendingEst = policyEffects.transferChannelAddition
        + spending.stabilizerTransfers
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
      // E-7 (ratified): the market inflation anchor de-anchors toward LAGGED REALIZED composite at
      // 1/τ_cred. τ = 0 is the special-cased never-de-anchor SENTINEL (the mathematical legacy limit
      // is τ → ∞; 0 is a convenience toggle — anchor frozen at its init value, the Fed target).
      const tauCred = config.credibilityHorizonYears ?? DEFAULT_CREDIBILITY_HORIZON_YEARS;
      const prevAnchor = previousFiscalMonetary?.bondMarket.marketInflationAnchor
        ?? (config.marketAnchorInit ?? ANCHOR_INIT_2025);  // E-9c row 1: inherit the OBSERVED 2025 expectations state (unified with the bondMarket state field)
      const marketInflationAnchor = tauCred === 0
        ? prevAnchor
        : prevAnchor + (1 / tauCred) * (prevCompositeInflation - prevAnchor);
      // Phase 8 Fix 4: employment gap projection + configurable convergence speed
      const yearsRemaining = config.endYear - year;
      // E-9 flag [β] (ratified): the projection runs in PROXY space — current proxy converging
      // toward (the CPI-basis market anchor − the CURRENT proxy gap): markets expect the basis gap
      // to persist (exact in zero-AI where the gap is stationary). Materiality of the gap term in
      // C is reported per the ratification; the mean-reverting-gap form is a REGISTERED refinement.
      const currentProxyGap = usePceProxy
        ? (prevCompositeInflation - fedInflationInput)
        : (config.pceCpiWedge ?? PCE_CPI_WEDGE);
      const expectedAvgPolicyRate = computeExpectedPolicyRates(
        fedInflationInput,                                      // E-9: proxy-space projection
        fedTarget,
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
        fedNairu,                                         // E-9 item 3
        yearParams.taylorEmploymentGapCoeff.effective,    // per-year overridable
        config.inflationConvergenceYears ?? 5,
        marketInflationAnchor - currentProxyGap,          // E-7 anchor translated to proxy space ([β])
        prevPolicyRate,                                   // E-9b: the inherited rate
        taylorRho,                                        // E-9b: markets project the inertial rule
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
      // E-8 (ratified): the market consolidation expectation — ramps toward 1 while LAGGED
      // debtService/revenue exceeds the credibility trigger, decays SYMMETRICALLY at the same
      // rate below it (item 2 choice: markets re-price both directions; one rate, no hysteresis).
      // E-8b item 4 (R-B relocation): the expectation prices the SELECTED profile. For the R-C
      // default (observed political economy) and other non-committal profiles it stays 0 — the
      // Laubach evidence slope ALREADY embeds the observed regime's average adjustment pricing;
      // ramping it too would double-count. It ramps only for profiles that announce consolidation
      // (marketPricesConsolidation: true), compressing premia below the evidence slope.
      const credTrigger = config.fiscalCredibilityTrigger ?? DEFAULT_FISCAL_CREDIBILITY_TRIGGER;
      const adjHorizon = config.fiscalAdjustmentHorizonYears ?? DEFAULT_FISCAL_ADJUSTMENT_HORIZON_YEARS;
      const prevAdjExp = previousFiscalMonetary?.bondMarket.adjustmentExpectation ?? 0;
      const prevServiceRatio = previousFiscalMonetary?.fiscal.debtServiceRevenueRatio ?? BASELINE_DEBT_SERVICE_REVENUE_RATIO;  // E-9c row 2: the observed 2025 ratio (was ?? 0)
      const adjustmentExpectation = !(fiscalProfile.marketPricesConsolidation ?? false)
        ? 0
        : prevServiceRatio > credTrigger
          ? Math.min(1, prevAdjExp + 1 / adjHorizon)
          : Math.max(0, prevAdjExp - 1 / adjHorizon);

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
        adjustmentExpectation,  // E-8 (profile-gated per E-8b item 4)
        false,                                                  // RETIRED toggle slot (close-out; recorded pole e8b-legacy-pole)
        initialDebtGDPRatio,                                    // E-8b: the 2025 debt anchor
        // D-fix: the anchor matches the slot's basis — PRIMARY baseline with the primary slot
        // RETIRED (CO-D2 conversion, R3b): legacyTotalDeficitPremium — the self-referencing
        // total-deficit basis. Pole at ~/.atlas-referents/co-d2/legacyTotalDeficitPremium/.
        // (config.legacyTotalDeficitPremium ?? false) ? BASELINE_DEFICIT_GDP_RATIO :
        BASELINE_PRIMARY_DEFICIT_GDP_RATIO,
        config.laubachLevelBeta ?? DEFAULT_LAUBACH_LEVEL_BETA,
        config.laubachDeficitBeta ?? DEFAULT_LAUBACH_DEFICIT_BETA,
        nominalGDPHistory.length >= 1 && nominalGDPHistory[nominalGDPHistory.length - 1]! > 0
          ? (debtResult.totalDeficit - spending.interestExpense)  // D-fix: the PRIMARY deficit (the legacy total-deficit branch retired with the key, CO-D2)
            / nominalGDPHistory[nominalGDPHistory.length - 1]!
          : undefined,
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
        config.termPremium ?? TERM_PREMIUM,  // E-8c F-C: single source — the ACM-cited constant
        fiscalRiskPremium,
        // D-fix (ruled, retire-or-recite → RETIRED): the supply-pressure premium was a SECOND
        // reader of the deficit the Laubach reduced-form already prices (the E-11 double-count
        // class). The Greenwood-Vayanos recite was considered and not taken: its issuance basis
        // (primary deficit + rollover volume) is dominated by the rollover of the existing stock,
        // which is proportional to the debt that β_level already prices — a third read of the
        // same integrator through a different window.
        // RETIRED (CO-D2 conversion, R3b; Amendment 2): legacySupplyPressure — the D-fix
        // second deficit reader. Pole at ~/.atlas-referents/co-d2/legacySupplyPressure/
        // (recorded pole-first). CASCADE (named in the battery specs): the six gated
        // diagnostics (foreignTreasuryDemand + the absorption family) are DEAD with the
        // gate — re-specied in the census/annex/dial table at this commit.
        // (config.legacySupplyPressure ?? false) ? moneyResult.bondFinancedDeficit : 0,
        0,
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
      // D1 fix F1a: the ERP re-anchored to its own series' crisis behavior — the
      // banded consumer-tightening signal at t-1 (below the measured noise floor the
      // ERP is exactly the base, which keeps the zero-AI reference byte-identical).
      const erpResult = computeCrisisAdjustedERP(
        EQUITY_RISK_PREMIUM,
        prevMacroForFiscal.consumerCreditTightening ?? 0,
        config.erpCrisisSensitivity ?? DEFAULT_ERP_CRISIS_SENSITIVITY,
        config.creditDeflationNoiseFloor ?? DEFAULT_CREDIT_DEFLATION_NOISE_FLOOR,
      );
      const equityResult = computeEquityValuation(
        yieldResult.tenYearYield,
        erpResult.equityRiskPremium,
        currentCorporateProfits,
        prevCorporateProfitsForEquity,
        prevPrevCorporateProfitsForEquity,
        previousMarketCap,
        momentumResult.growthMomentum,
        config.aiPEMultiplier ?? 1.0,
        erpResult.erpCrisisComponent,
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

      // E-9 item 4 (ratified): SPLIT rollover per the constant's own WAM citation — the coupon
      // stock (~17%/yr, 1/6 WAM) reprices at the 10Y-based rate; the bills layer (~13%/yr of the
      // total 30%) rolls at the POLICY-based rate. legacySingleRollover = the pre-E-9 single bucket.
      // Residual approximation documented: two buckets vs the true maturity ladder.
      // RETIRED (CO-D2 conversion, R3b; Amendment 2): legacySingleRollover — the pre-E-9
      // single-bucket rollover. Pole at ~/.atlas-referents/co-d2/legacySingleRollover/
      // (recorded pole-first). The split rollover is single-path.
      // const billsShare = (config.legacySingleRollover ?? false) ? 0
      //   : Math.max(0, rolloverResult.effectiveRolloverRate - DEBT_ROLLOVER_COUPON_RATE);
      const billsShare = Math.max(0, rolloverResult.effectiveRolloverRate - DEBT_ROLLOVER_COUPON_RATE);
      const couponShare = rolloverResult.effectiveRolloverRate - billsShare;
      const blendedNewIssueRate = rolloverResult.effectiveRolloverRate > 0
        ? (couponShare * yieldResult.tenYearYield + billsShare * fedResult.policyRate)
          / rolloverResult.effectiveRolloverRate
        : yieldResult.tenYearYield;
      const newWeightedAvgRate = computeWeightedAverageDebtRate(
        previousDebtStock,
        previousWeightedAvgDebtRate,
        rolloverResult.effectiveRolloverRate, // Phase 8 Fix 3: was DEBT_ROLLOVER_RATE (hardcoded 0.30)
        blendedNewIssueRate,                  // E-9 item 4: 17/13 blend
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
          bookedRevenueT1: revenue.bookedRevenueT1,
          revenueGDPRatio: revenue.revenueGDPRatio,
          laborTaxRevenue: revenue.laborTaxRevenue,
          corporateTaxRevenue: revenue.corporateTaxRevenue,
          primaryDeficit: debtResult.primaryDeficit,
          totalDeficit: debtResult.totalDeficit,
          // Stage 5 (H3): stabilizer outlay booked this year (= prev year's income-side flow)
          stabilizerTransfers: spending.stabilizerTransfers,
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
          fullEmploymentGDP: pluckingPotentialGDP,  // E-8c F-A: the plucking ceiling
        },
        bondMarket: {
          tenYearYield: yieldResult.tenYearYield,
          expectedAveragePolicyRate: expectedAvgPolicyRate,
          marketInflationAnchor,  // E-7 state
          adjustmentExpectation,  // E-8 state
          termPremium: config.termPremium ?? TERM_PREMIUM,  // E-8c F-C: single source
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
          // Stage 4: surface the FLOORED dynamic velocity used in the Fisher term (was previously
          // only visible as the un-floored baseline on MonetaryState).
          velocity: dynamicVelocityForMonetization,
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
      // Ruling 2 (the sector discount term): the ONE discount-rate producer's crisis
      // excess, read off the equity state (same-year fm block; baseline 0 at year 0)
      // — the sector legs and the aggregate valuation share one producer.
      erpCrisisComponent: fm.equityMarket.erpCrisisComponent,
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
      // H3 ruling 2: the same-year zero-AI counterfactual real consumption (the twin run
      // above; undefined on the twin itself and on zero-capability configs, where no AI
      // production exists and the benchmark is never consulted — loud-guarded in macro.ts)
      counterfactualRealConsumption: counterfactualRealConsumptionByYear?.get(year),
      // DEPRECATED: profitRealizationSensitivity — replaced by endogenous capital gains realization rate
      secondOrderParams,
      nominalGDPHistory,
      policyWageFloor,
      productionInputs,
      // ═══ Production Program Stage 1 — Channel 1 (the buildout) ═══
      aiBuildoutInvestmentDemand: buildoutPlanForYear ? buildoutPlanForYear.iAiPregate : undefined,
      // Stage 3 MS2 (ruling vi): the allocation-weighted import-content share of this
      // year's buildout spend (the cited per-sink shares × the plan's smoothed
      // allocation — one composition, no second allocator).
      // Stage 3 MS4 (Channel 3): the R&D demand + the TFP flow.
      aiRdSpendDemand: aiRdDemandForYear,
      aiRdDeflationFlow: aiRdFlowForYear,
      aiBuildoutImportShare: buildoutPlanForYear
        ? buildoutPlanForYear.allocUsed.chips * BUILDOUT_IMPORT_CONTENT_SHARE.chips
          + buildoutPlanForYear.allocUsed.energy * BUILDOUT_IMPORT_CONTENT_SHARE.energy
          + buildoutPlanForYear.allocUsed.dc * BUILDOUT_IMPORT_CONTENT_SHARE.dc
          + buildoutPlanForYear.allocUsed.fleet * BUILDOUT_IMPORT_CONTENT_SHARE.fleet
        : undefined,
      aiBuildoutBaselineShare: config.aiBuildoutSeamAnchor !== undefined
        ? config.aiBuildoutSeamAnchor / BASELINE_GDP_NOMINAL_2025
        : undefined,
      // Stage 5A (A3 + E2): the energy opex line (undefined ⇒ the identity keeps
      // the retired arithmetic — the seam year and zero-AI stay bit-identical).
      aiEnergyOpex: aiEnergyOpexForYear,
      buildoutTelemetry: buildoutPlanForYear ? {
        dcRequired: buildoutPlanForYear.dcRequired,
        fleetRequired: buildoutPlanForYear.fleetRequired,
        // Stage 2 (the embodiment gate's §0 surface): same-year coverage of the
        // cleared embodied work by the start-of-year fleet stock.
        fleetCoverage: aiProduction.fleetCoverage,
        // Stage 4 MS4 (the ratified design §3's telemetry): the per-cluster
        // coverage table — the one series both gates consumed this year.
        fleetCoverageByCluster: perClusterCoverage,
        // Stage 2 (T-A): the derived training share consumed by u_supply this year.
        trainingShare: trainingShare(year),
        // Stage 3 MS3 (ruling v): the issuance leg surfaced (the §0 contract).
        equityIssuance: buildoutIssuanceForYear,
        issuanceWindow: buildoutIssuanceWindowForYear,
        capacityDc: buildoutPlanForYear.capacityDc,
        // Stage 5A: the queue/orbital/opex surfaces — present ONLY when the
        // machine is live (dcRequired > 0); ABSENT on the zero-AI path (trace
        // hygiene, EB-8: the twin's bytes carry no new fields).
        ...(buildoutPlanForYear.dcRequired > 0 ? {
          capacityTerrestrial: buildoutPlanForYear.capacityTerrestrial,
          energyPending: buildoutPlanForYear.energyPending,
          energyBtmPending: buildoutPlanForYear.energyBtmPending,
          energyCeiling: buildoutPlanForYear.energyCeiling,
          energyOpex: aiEnergyOpexForYear,
        } : {}),
        ...(buildoutPlanForYear.orbitalStock > 0 ? {
          orbitalStock: buildoutPlanForYear.orbitalStock,
        } : {}),
        supplyRatio: buildoutPlanForYear.supplyRatio,
        demandSpend: buildoutPlanForYear.buildoutDemandSpend,
        financeable: buildoutPlanForYear.financeable,
        investmentPregate: buildoutPlanForYear.iAiPregate,
        investmentRealized: 0, // stamped by computeMacro (the same gate chain all I rides)
        fundingRatio: buildoutPlanForYear.fundingRatio,
        bindingSink: buildoutPlanForYear.bindingSink,
        stockChips: buildoutState.chips,
        stockEnergy: buildoutState.energy,
        stockDc: buildoutState.dc,
        fleetUnits: buildoutState.fleetUnits,
        fleetAdd: 0, // stamped after the post-gate stock advance below
        mfgRampCapacity: buildoutState.mfgRampCapacity,
        allocChips: buildoutPlanForYear.allocUsed.chips,
        allocEnergy: buildoutPlanForYear.allocUsed.energy,
        allocDc: buildoutPlanForYear.allocUsed.dc,
        allocFleet: buildoutPlanForYear.allocUsed.fleet,
      } : undefined,
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
      // Mini-stage 1: the honest-basis diagnostic (macro voids-and-records it, Stage-7 pattern)
      automationDividend: totalDeployerRealizedSavings,
      augmentationProfitBoost: totalAugmentationOutput * (1 - BASELINE_WAGE_SHARE),
      creditDeflationSensitivity: config.creditDeflationSensitivity ?? DEFAULT_CREDIT_DEFLATION_SENSITIVITY,
      creditDeflationImpulseSensitivity: config.creditDeflationImpulseSensitivity ?? DEFAULT_CREDIT_DEFLATION_IMPULSE_SENSITIVITY,
      creditDeflationPersistence: config.creditDeflationPersistence ?? DEFAULT_CREDIT_DEFLATION_PERSISTENCE,
      creditDeflationNoiseFloor: config.creditDeflationNoiseFloor ?? DEFAULT_CREDIT_DEFLATION_NOISE_FLOOR,
      scarcityInflation,
      // Phase 5i: Housing & Credit inputs
      embodiedCapability: capabilityScores.embodied ?? 0,
      foreclosureRateAggregate: hoResult.foreclosureRateAggregate,
      mortgageStressIndex,
      dynamicHomeownership,
      shelterCPIWeight: config.shelterCPIWeight,
      // Stage 1: sectoral price architecture params
      aiExposedCPIWeight: config.aiExposedCPIWeight,
      laborServicesCPIWeight: config.laborServicesCPIWeight,
      foodEnergyCPIWeight: config.foodEnergyCPIWeight,
      aiDeflationPassthrough: config.aiDeflationPassthrough,
      laborCostShare: config.laborCostShare,
      // Stage 1.5: per-consumption-sector deflation routing + embodied passthroughs
      sectorDeflationByConsumption,
      aiSavingsLevelReplacement: sectorDeflationResult.levelReplacement,
      aiSavingsLevelAugmentation: sectorDeflationResult.levelAugmentation,
      laborServicesPassthrough: config.laborServicesPassthrough,
      foodEnergyPassthrough: config.foodEnergyPassthrough,
      shelterPassthrough: config.shelterPassthrough,
      // Stage 2 — elasticity-based absorption (order item 4)
      absorptionElasticityAiExposed: config.absorptionElasticityAiExposed,
      absorptionElasticityLaborServices: config.absorptionElasticityLaborServices,
      absorptionElasticityFoodEnergy: config.absorptionElasticityFoodEnergy,
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
      // ═══ Phase 6 / Stage 2: Consumer Credit Inputs (previous year — bank underwriting lag) ═══
      // Stage 2 firewall: underwrite NOMINAL income (debt service is nominal — Fisher 1933). Previously
      // these were deflated by priceLevel, so AI cost-deflation inflated "real" income and made 43%-UE
      // borrowers read as abundantly creditworthy. Now compared to a nominal trend-grown baseline below.
      prevRealWageIncome: previousMacro
        ? previousMacro.afterTaxWageIncome
        : baselineHouseholdIncome ?? 0,
      prevRealTransferIncome: previousMacro
        ? previousMacro.afterTaxTransferIncome
        : 0,
      prevRealAssetIncome: previousMacro
        ? previousMacro.afterTaxAssetIncome
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
      // Stage 3: endogenous wage equation params
      inflationIndexation: config.inflationIndexation,
      productivityPassthrough: config.productivityPassthrough,
      phillipsSlope: config.phillipsSlope,
      downwardWageRigidity: config.downwardWageRigidity,
      // Stage 5 (H3): unified incremental-UE transfer support
      // Stage 6.5: stock-flow housing params + baseline
      formationSensitivity: config.formationSensitivity,
      headshipRecoveryRate: config.headshipRecoveryRate,
      housingSupplyElasticity: config.housingSupplyElasticity,
      embodiedCapacityGain: config.embodiedCapacityGain,
      housingDepreciationRate: config.housingDepreciationRate,
      landShare: config.landShare,
      constructionLaborShare: config.constructionLaborShare,
      landIncomeBeta: config.landIncomeBeta,
      landScarcityElasticity: config.landScarcityElasticity,
      rentOccupancyElasticity: config.rentOccupancyElasticity,
      rentCostAnchorWeight: config.rentCostAnchorWeight,
      baselineCapRate: config.baselineCapRate,
      capRateMortgageBeta: config.capRateMortgageBeta,
      capRateInvestorCompression: config.capRateInvestorCompression,
      fireSaleElasticity: config.fireSaleElasticity,
      investorDemandIntensity: config.investorDemandIntensity,
      baselineAssetIncomeShare: baselineAssetIncomeShare ?? undefined,
      // Stage 7: residual profits
      otherCostsShare: config.otherCostsShare,
      aiSectorLaborShare: config.aiSectorLaborShare,
      rentSharingElasticity: config.rentSharingElasticity,
      secularProfitDriftRate: config.secularProfitDriftRate,
      // E-10
      builderAdjustmentLambda: config.builderAdjustmentLambda,
      housingPipelineDuration: config.housingPipelineDuration,
      landClosureKappa: config.landClosureKappa,
      mortgageRateReference: config.mortgageRateReference,
      opexPassthrough: config.opexPassthrough,
      rentDownwardRigidity: config.rentDownwardRigidity,
      rentIncomeElasticity: config.rentIncomeElasticity,
      // RETIRED (CO-D2, R3b): diagSpotBuilderPrice threading — builderPriceMode carries the mode.
      builderPriceMode: config.builderPriceMode,
      constructionCreditSensitivity: config.constructionCreditSensitivity,
      // F4/OD-8 examination
      creditExpectationTurnover: config.creditExpectationTurnover,
      creditBarRealTrend: config.creditBarRealTrend,
      assetShareDriftRate: config.assetShareDriftRate,
      landRateSensitivity: config.landRateSensitivity,
      cashTransferPerUnemployed: config.cashTransferPerUnemployed,
      inKindTransferPerUnemployed: config.inKindTransferPerUnemployed,
      laborForceBaseline: config.laborForce ?? US_LABOR_FORCE_2025,
    };
    const macro = computeMacro(macroInputs);

    // ═══ Production Program Stage 1 — advance the buildout stocks (post-gate) ═══
    // The stocks build from the spend that ACTUALLY entered GDP (the unified
    // credit/capacity/rate chain — no bypass); year 0 captures the real base the
    // requirement index divides by.
    if (year === config.startYear) buildoutRealGDP2025 = macro.gdpReal;
    // Stage 2 (order item 7): the corporate-profits seam for the builder-base index.
    if (year === config.startYear) buildoutCorporateProfitsSeam = macro.corporateProfits;
    if (buildoutPlanForYear && macro.buildout) {
      const chipsQtyIdx = effectiveScConfig?.inputs.aiChips ?? 100;
      const survivingFleet = buildoutState.fleetUnits * (1 - FLEET_DEPRECIATION);
      buildoutState = applyBuildout(
        buildoutState, buildoutPlanForYear, macro.buildout.investmentRealized, chipsQtyIdx,
        config.buildoutFleetRampGrowth, // Stage 4 MS2 (N1): the fleet-production worldview
        fleetRampIdxForYear,            // Stage 4 MS3: the arrival row
        orbitalAddIdxForYear,           // Stage 5A (A2): the orbital arrival row
      );
      macro.buildout.fleetAdd = Math.max(0, buildoutState.fleetUnits - survivingFleet);
      // Stage 5A (EB-8): the queue's advance stamps — live-machine years only
      // (the twin's bytes carry no new fields).
      if (buildoutPlanForYear.dcRequired > 0) {
        macro.buildout.energyDelivered = buildoutState.lastEnergyDelivered;
        macro.buildout.energyBtmDelivered = buildoutState.lastEnergyBtmDelivered;
        macro.buildout.energyCarryover = buildoutState.energyQueue.carryover;
      }
    }
    // ═══ Stage 3 MS4 — advance the Channel-3 R&D stock (post-gate; the same
    // realized-spend honesty as the buildout: only dollars that entered GDP
    // accumulate). The Δln base for NEXT year is this year's start-of-year stock. ═══
    {
      const stockStartOfYear = aiRdStockState;
      aiRdStockState = stockStartOfYear * (1 - DEFAULT_RD_DEPRECIATION) + (macro.aiRdSpend ?? 0);
      aiRdStockPrevStart = stockStartOfYear;
      macro.aiRdStock = aiRdStockState; // the post-advance stock, surfaced
    }

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
      // Stage 3: nominalWageGrowth is the endogenous wage path computed in computeMacro — keep it (was zeroed).
      nominalWageGrowth: macro.nominalWageGrowth,
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
      frontierStock, // flywheel MS: loop-produced (always-on; the hoist)
      effectiveCostTime, // flywheel MS: the cost clock τ (= year − startYear on funded paths)
      cascadeDeclineRateDiagnostic: scEffects?.cascadeDeclineRateDiagnostic ?? DEFAULT_INFERENCE_ANNUAL_CHANGE,
      deploymentMultiplierCompute: scEffects?.deploymentCostMultipliers.compute ?? 1,
      deploymentMultiplierPhysical: scEffects?.deploymentCostMultipliers.physicalHardware ?? 1,
      deploymentMultiplierEnergy: scEffects?.deploymentCostMultipliers.energy ?? 1,
      // Mini-stage 1: the deployer-savings diagnostic (the one realized-cost object; the
      // retired automation dividend's honest successor — Audit B-4 resolved).
      deployerRealizedSavings: totalDeployerRealizedSavings,
      // Mini-stage 1: the EMERGENT tokens-per-task diagnostics — the aggregate path is an
      // output the model reports, never an input (the retired global schedule's successor).
      // impliedAggregateTokensPerTask = employment-weighted inference leg ÷ per-token cost.
      impliedAggregateTokensPerTask: aggCostEmpWeight > 0
        ? (aggInferenceLegSum / aggCostEmpWeight) / computeTokenCostFactor(effectiveCostTime, effectiveAiCostParams?.tokenCostCurve)
        : 1,
      aggregateFrontierWeight: aggCostEmpWeight > 0 ? aggFrontierWeightSum / aggCostEmpWeight : 1,
      // Mini-stage 3: the two honest jobless measures + the policymaker displays
      // (report-basis: all are POINT-IN-TIME stocks/rates for the stated year).
      // The headline unemploymentRate keeps its construction — documented as the
      // BROAD-consistent measure (all working-age jobless in the exogenous labor force);
      // U-3 excludes discouragement exits from both numerator and denominator.
      laborForceExitedStock: poolState.exitedStock,
      u3UnemploymentRate: (dynamicLaborForce - poolState.exitedStock) > 0
        ? Math.max(0, macro.totalUnemployment - poolState.exitedStock) / (dynamicLaborForce - poolState.exitedStock)
        : 0,
      employmentToPopulation: dynamicPopulation > 0 ? macro.totalEmployment / dynamicPopulation : 0,
      longTermJoblessShare: poolSearchingCount > 0
        ? poolState.cohorts.reduce((a, c, d) => a + (d >= 1 ? c.count : 0), 0) / poolSearchingCount
        : 0,
      meanJoblessDurationYears: poolSearchingCount > 0
        ? poolState.cohorts.reduce((a, c, d) => a + c.count * d, 0) / poolSearchingCount
        : 0,
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
      // Stage 2: NOMINAL baseline (priceLevel = 1.0 at year 0, so this is year-0 nominal dollars).
      baselineHouseholdIncome = (
        macro.afterTaxWageIncome * 1.0
        + macro.afterTaxTransferIncome * trw
        + macro.afterTaxAssetIncome * ASSET_INCOME_UNDERWRITING_WEIGHT
      );
    }
    // Stage 6.5 (OD-9b): capture the year-0 asset-income share — the investor land bid's baseline
    if (baselineAssetIncomeShare === null && macro.totalIncome > 0) {
      baselineAssetIncomeShare = macro.aggregateAssetIncome / macro.totalIncome;
    }
    if (baselineCorporateProfits === null) {
      // Stage 0 (item 2): capture the profit-coverage baseline from the model's ENDOGENOUS profits
      // (corporateProfits × (1−corpTax)), NOT afterTaxCorporateProfits — which at year 0 reflects the
      // 0.13 BEA profit/GDP bootstrap rather than the 0.11-margin trajectory the model actually follows
      // from t≥2. Capturing from endogenous profits makes profitCoverageRatio start and stay ≈ 1.0.
      const corpTaxRate0 = yearParams.effectiveCorporateTaxRate.effective;
      baselineCorporateProfits = macro.corporateProfits * (1 - corpTaxRate0);
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
    // Stage H addendum (A-6): the required-ownership display metric is priced from the
    // CURRENT year's realized endogenous AI profits (this block runs after macro, so the
    // same-year value exists — no lag needed for a "what would be required" metric).
    // RETIRED exogenous basis (the deprecation record, never executed):
    //   const yearsSinceStart = year - config.startYear;
    //   totalAIProfitsPerCapita = swf.totalAICompanyProfits × 1e9 × (1+swf.profitGrowthRate)^t / N
    const totalAIProfitsPerCapita = macroWithJobs.aiCorporateProfits / dynamicPopulation;

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
        // Mini-stage 3: the DERIVED retention factor (searching/stock; 1 when no stock) —
        // the 0.7 constant retired; national and state measurement bases reconciled.
        displacedPool.count > 0 ? Math.min(1, poolSearchingCount / displacedPool.count) : 1,
      );
    }

    // Phase 8a: Update effectiveCOLAFactor in fiscalMonetary after macro computes it.
    // The COLA dampening happens inside computeMacro() but the fiscal state is assembled before macro.
    // The effectiveCIF is encoded in macro's cumulativeInflationFactor output vs the dampened version.
    // We track it via the macro output's cumulativeInflationFactor — if no dampening, it equals CIF.
    if (fiscalMonetaryOutput.fiscal && fiscalProfile) {
      // Stage 5b (Pass 2): the COLA-dampening lever now operates on the COLA-floored obligation
      // index (macro's obligationGCOLAIndex), not the CIF. Mirror macro's internal computation
      // exactly for CSV transparency.
      const colaIdx = macroWithJobs.obligationGCOLAIndex;
      let effectiveCOLA = colaIdx;
      if (colaIdx > fiscalProfile.colaDampeningThreshold) {
        const dampenRange = fiscalProfile.colaDampeningMaxCIF - fiscalProfile.colaDampeningThreshold;
        const dampenIntensity = dampenRange > 0
          ? Math.min(1, (colaIdx - fiscalProfile.colaDampeningThreshold) / dampenRange) : 1.0;
        const dampenFactor = 1.0 - dampenIntensity * fiscalProfile.colaDampeningRate;
        effectiveCOLA = 1.0 + (colaIdx - 1.0) * dampenFactor;
      }
      fiscalMonetaryOutput.fiscal.effectiveCOLAFactor = effectiveCOLA;
      // The policy indexation factor's advance (consumed next year — the lagged
      // wire): the raw index compounds this year's composite inflation, floored
      // at zero (nominal policy amounts are never cut on deflation — the CPI
      // indexation practice), and the SAME profile dampening the budget applies
      // to its own obligations applies to the policy index's level.
      policyPriceIndexRaw *= (1 + Math.max(0, macroWithJobs.compositeInflation));
      let dampedPolicyIndex = policyPriceIndexRaw;
      if (policyPriceIndexRaw > fiscalProfile.colaDampeningThreshold) {
        const dr = fiscalProfile.colaDampeningMaxCIF - fiscalProfile.colaDampeningThreshold;
        const di = dr > 0
          ? Math.min(1, (policyPriceIndexRaw - fiscalProfile.colaDampeningThreshold) / dr) : 1.0;
        dampedPolicyIndex = 1.0 + (policyPriceIndexRaw - 1.0) * (1.0 - di * fiscalProfile.colaDampeningRate);
      }
      prevPolicyIndexationFactor = dampedPolicyIndex;
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
    // Mini-stage 2 (C-1): the history carries the RESOLVED per-year inputs — the lag and
    // cascade machinery see real timelines for the first time (drop-then-recover works).
    if (scConfig && effectiveScConfig) {
      chipSupplyHistory.push(effectiveScConfig.inputs.aiChips);
      supplyChainShockHistory = [effectiveScConfig.inputs, supplyChainShockHistory[0]];
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
