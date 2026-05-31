/**
 * ATLAS Core Type Definitions
 * 
 * These types define the complete data model for the AI Transformation
 * Labor & Automation Simulator. They serve as both the implementation
 * contract and the documentation of the model's structure.
 * 
 * RULE: If you need to change the model, change these types FIRST.
 */

// ============================================================
// Phase 8b: Parameter Timeline Types (re-exported)
// ============================================================
export type {
  ParameterValue,
  YearParameters,
  UserOverrideMap,
  YearSnapshot,
  AutopilotResult,
  ParameterTimelineResult,
} from './parameterTimeline';
// Local import for use within this file (re-exports don't create local bindings)
import type { YearParameters, YearSnapshot } from './parameterTimeline';

// ============================================================
// Phase 9: Supply Chain Types (re-exported)
// ============================================================
export type {
  SupplyChainInputs,
  SupplyChainResilience,
  TrainingComposition,
  TrainingCostDynamics,
  DeploymentCostComposition,
  SupplyChainConfig,
  SupplyChainEffects,
  AdoptionState,
  SupplyInputKey,
  BFCSDimension,
  SensitivityMatrix,
} from './supplyChain';

// ============================================================
// Phase 8c: Fiscal Dimension Types (re-exported)
// ============================================================
export type {
  FiscalDimensionKey,
  FiscalDimensionPositions,
  FedDimensionKey,
  FedDimensionPositions,
  DimensionOption,
  DimensionConfig,
} from './fiscalDimensions';

// ============================================================
// 1. AI Capability Vectors
// ============================================================

// DEPRECATED: Old 8-vector capability system
// type OldCapabilityVectorId = 'lang' | 'code' | 'agent' | 'decide' | 'robot' | 'auto' | 'gen' | 'sci';

export type CapabilityVectorId = 'generative' | 'agentic' | 'embodied';

export interface CapabilityTrajectoryParams {
  /** Current capability floor (where it is today) [0, 1] */
  floor: number;
  /** Maximum achievable capability [0, 1] */
  ceiling: number;
  /** Steepness of improvement (higher = faster) */
  steepness: number;
  /** Year when capability hits midpoint of its range */
  midpointYear: number;
}

export interface CapabilityVector {
  id: CapabilityVectorId;
  name: string;
  description: string;
  color: string; // hex color for consistent visualization
  trajectory: CapabilityTrajectoryParams;
}

// ============================================================
// 2. Occupation Clusters & Roles
// ============================================================

export type OccupationClusterId = string; // e.g., 'tech_swe', 'finance_banking', 'transport_trucking'

export type DeploymentType = 'software' | 'robotics' | 'autonomous_vehicle' | 'hybrid';

export interface RoleDefinition {
  id: string;                    // e.g., 'junior', 'mid', 'senior', 'principal'
  label: string;                 // e.g., 'Junior Developer'
  seniorityLevel: number;        // [0, 1] — how senior this role is (used for wage scaling)
  // DEPRECATED (Phase 10.A): split into aiReplacementDifficultyFriction + aiReplacementDifficultyWagePremium.
  // Retained for diagnostic continuity — auto-populated as the average of the two new fields during cluster init.
  aiReplacementDifficulty: number; // [0, 1] — 0 = routine/easily automated, 1 = expert/very hard
  employmentShareEstimate: number; // estimated % of cluster employment
  bfcsThresholds: BFCSThresholds;

  // Per-role α override [0,1]. If undefined, inherits cluster.automationShare.
  automationShareOverride?: number;

  /** Expected years of regulatory/cultural/licensure friction delay before AI replacement can begin,
   *  after BFCS thresholds are met. Captures non-BFCS forces: legal approval, licensure updates,
   *  cultural acceptance, union negotiations. User-adjustable per role. Unit: years, ≥ 0, no upper bound.
   *  Surgeons may be 4–5; software engineers near 0.
   *  Populated by initializeClusterAlphaDefaults() at module load (from role-defaults tables);
   *  optional at the type level to keep OCCUPATION_CLUSTERS inline literals readable. */
  aiReplacementFrictionYears?: number;

  /** Residual human share at automation tail [0,1].
   *  Two readers:
   *    1. Adoption S-curve tail drag: exponent on standard approach formula, slowing tail.
   *    2. Phillips scarcity premium weight.
   *  Populated by initializeClusterAlphaDefaults() at module load; optional at the type level. */
  aiReplacementDifficultyWagePremium?: number;
}

export interface BFCSThresholds {
  better: number;   // B* — minimum quality threshold [0, 1]
  faster: number;   // F* — minimum speed threshold [0, 1]
  cheaper: number;  // C* — minimum cost advantage threshold [0, 1]
  safer: number;    // S* — minimum safety threshold [0, 1]
}

export interface BFCSScores {
  better: number;
  faster: number;
  cheaper: number;
  safer: number;

  // Phase 10.A — optional diagnostic fields populated by simulation.ts callers
  alpha?: number;
  alphaDecomposition?: AlphaDecomposition;
  augAdoptionRate?: number;
  effectiveTriggerYearShift?: number;
}

export interface CapabilityRelevance {
  /** How much each capability vector matters for this occupation [0, 1] */
  weights: Record<CapabilityVectorId, number>;
}

export interface OccupationCluster {
  id: OccupationClusterId;
  name: string;
  category: string;              // e.g., 'Technology', 'Healthcare', 'Transportation'
  socCodes: string[];            // BLS Standard Occupational Classification codes
  roles: RoleDefinition[];
  capabilityRelevance: CapabilityRelevance;
  deploymentType: DeploymentType;
  employmentMultiplier: number;  // second-order effects multiplier
  adoptionLag: number;           // additional years of lag before adoption begins
  geopoliticalRiskExposure: number; // [0, 1] how much geopolitical risk slows deployment
  notes: string;                 // special handling notes
  
  // Special flags
  protectedByPolicy: boolean;    // e.g., teachers
  policyDisplacementTarget: boolean; // e.g., education/healthcare admin
  // DEPRECATED: productivityToHeadcountRatio — replaced by dynamic quadratic displacement formula
  productivityToHeadcountRatio?: number;
  wageElasticity: number;        // how much automation depresses wages [0, 1]
  // DEPRECATED: taskAutomatableFraction — replaced by weightedCapability² formula
  taskAutomatableFraction?: Record<string, number>;

  // Per-cluster adoption parameters (Phase 8 consolidation)
  adoptionSteepness: number;   // Per-cluster S-curve steepness (overrides deployment-type default)
  adoptionCeiling: number;     // Maximum adoption rate [0, 1] (default 1.0)

  // Per-cluster demand spillover (Phase 3c.1)
  // Source: BEA Input-Output Use Tables cross-referenced with BLS OES occupation-by-industry distribution
  consumerDemandShare: number; // [0, 1] fraction of jobs driven by consumer spending (PCE)
  govDemandShare: number;      // [0, 1] fraction of jobs driven by government spending (G)
  // businessDemandShare = 1 - consumerDemandShare - govDemandShare (derived, not stored)

  /** Automation share (α) [0,1] — Phase 10.A.
   *  1.0 = all AI adoption in this cluster is worker replacement.
   *  0.0 = all AI adoption is augmentation.
   *  Seeded by initializeClusterAlphaDefaults() from EMBODIED_CLUSTER_ALPHA_DEFAULTS or DEFAULT_COGNITIVE_ALPHA.
   *  Runtime overrides via config.clusterAutomationShareOverrides[clusterId].
   *  Optional at the type level because it's populated by init at module load; readers use
   *  `?? DEFAULT_COGNITIVE_ALPHA` for safety. */
  automationShare?: number;
}

// ============================================================
// 3. Adoption Dynamics
// ============================================================

export interface AdoptionParams {
  /** S-curve steepness by deployment type */
  steepnessByDeployment: Record<DeploymentType, number>;
  /** Competitive pressure multiplier */
  competitivePressureMultiplier: number;
  /** Competitive pressure kicks in at this adoption rate */
  competitivePressureThreshold: number;
  /** Geopolitical risk factor for robotics/AV supply chains [0, 0.5] */
  geopoliticalRiskFactor: number;
}

export interface AdoptionResult {
  triggered: boolean;
  triggerYear: number | null;
  adoptionRate: number;          // [0, 1] at current year
  adjustedAdoptionRate: number;  // after competitive + revenue pressure
}

// ============================================================
// 3a. Alpha Drivers & Augmentation (Phase 10.A)
// ============================================================

/** User-adjustable weights and activation parameters for the 5 α drivers.
 *  α = baseline + capabilityW × capabilityContribution + trustW × trustContribution
 *      + competitiveW × competitiveContribution + marginW × marginContribution
 *      - slackW × slackContribution, then clamped to [0, 1]. */
export interface AlphaDriverParams {
  capabilityWeight: number;
  trustWeight: number;
  competitiveWeight: number;
  marginWeight: number;
  slackWeight: number;
  /** Weighted-capability midpoint for the capability-driver sigmoid. */
  capabilityActivationThreshold: number;
  /** Half-life years for the trust ramp (1 - exp(-yearsSinceTrigger / halfLife)). */
  trustHalfLifeYears: number;
}

/** Decomposition of a computed α into its driver contributions.
 *  Sum of baseline + 5 contributions equals the pre-clamp α. */
export interface AlphaDecomposition {
  baseline: number;
  capabilityContribution: number;
  trustContribution: number;
  competitiveContribution: number;
  marginContribution: number;
  slackContribution: number;
}

/** Token-cost decay curve parameters (cost per token of AI work).
 *  Shape: floor + (1 - floor) × exp(-k × t^decayExponent).
 *  Strictly non-increasing — represents the declining cost of a single token of AI compute.
 *  Total inference cost combines this with the year-resolved `tokenUsageMultiplier`
 *  to allow rising total cost when token usage outpaces cost decline. */
export interface TokenCostCurveParams {
  /** Asymptotic floor relative to 2025 = 1.0. */
  floor: number;
  /** Initial decay rate. */
  k: number;
  /** Sub-linear time exponent (< 1 produces diminishing-decay shape). */
  decayExponent: number;
}

/** Result of augmentation adoption S-curve for one role at one year. */
export interface AugmentationAdoptionResult {
  /** Fraction of remaining workers using AI as a tool [0, 1]. */
  augAdoptionRate: number;
  triggered: boolean;
  triggerYear: number | null;
}

// ============================================================
// 3b. Tax & Economic Pipeline Types (Phase 5-tax)
// ============================================================

/** AI Cost parameters — 3-component decomposition */
export interface AICostParams {
  // DEPRECATED (Phase 10.A): inferenceAnnualChange is superseded by tokenCostCurve + tokenUsageMultiplier.
  inferenceAnnualChange: number;      // default -0.45, range -0.80 to +0.50
  manufacturingAnnualChange: number;  // default -0.10, range -0.50 to +0.50
  energyAnnualChange: number;         // default -0.03, range -0.50 to +0.50
  composition?: Record<DeploymentType, AICostComposition>;
  /** Floored decay curve for the cost-per-token of AI work. */
  tokenCostCurve?: TokenCostCurveParams;
  /** Optional FLAT multiplier for tokens-consumed-per-task vs. the 2025 baseline.
   *  Leave unset (the default) to use the spike-and-recover DEFAULT_TOKEN_USAGE_SCHEDULE
   *  (2025=1× → 2026=20× → 2027=25× → 2028=15× → 2029=5× → 2030+=1×). Set it to force a
   *  flat post-2025 trajectory (start year stays 1×, every later year takes this value).
   *  Either way it is year-overridable via parameterOverrides (sticky-forward) — see the
   *  Year Parameters section. Combined with `tokenCostCurve` to produce inference cost:
   *    inferenceCostFactor(t) = tokenCostFactor(t) × tokenUsageMultiplier(year). */
  tokenUsageMultiplier?: number;
}

export interface AICostComposition {
  inference: number;       // weight, sums to 1.0 with manufacturing+energy
  manufacturing: number;
  energy: number;
}

/** Tax configuration — 4 decomposed federal tax channels */
export interface TaxConfig {
  incomeTaxRate: number;          // 0-1, default from BEA (~0.124)
  payrollTaxRate: number;         // 0-1, default from BEA (~0.140)
  corporateTaxRate: number;       // 0-1, default from BEA (~0.164)
  capitalGainsTaxRate: number;    // 0-1, default ~0.165 (CBO)
}

/** Post-tax marginal propensities to consume */
export interface PostTaxMPCs {
  wage: number;      // default 0.95
  asset: number;     // default 0.42
  transfer: number;  // default 0.95
}

// ============================================================
// 4. Displacement Results
// ============================================================

export interface RoleDisplacementResult {
  roleId: string;
  displacementPct: number;       // [0, 1] fraction of jobs displaced (quadratic model, was: taskErosion)
  headcountMultiplier: number;   // 1 = no change, 0 = full displacement
  wageMultiplier: number;        // 1 = no change, 0 = wages eliminated
  remainingEmployment: number;   // absolute number
  remainingWage: number;         // absolute dollars
}

export interface ClusterDisplacementResult {
  clusterId: OccupationClusterId;
  roles: RoleDisplacementResult[];
  totalRemainingEmployment: number;
  totalDirectDisplacement: number;
  secondOrderDisplacement: number; // from multiplier
  totalDisplacement: number;       // direct + second-order
  averageWage: number;
  bfcsOutput: RoleBFCSOutput[];    // Phase 4: per-role BFCS scores and trigger data

  // Phase 10.A — α + scarcity diagnostics (optional; populated when V2 pipeline runs)
  /** Employment-weighted mean α applied to this cluster's roles this year. */
  effectiveAlpha?: number;
  /** Cluster's contribution to the aggregate Phillips scarcity premium. */
  scarcityPremiumContribution?: number;
  /** Employment-weighted mean of role.aiReplacementDifficultyWagePremium across roles. */
  aggregateReplacementDifficultyWagePremium?: number;
  /** Scarcity-driven wage adjustment for this cluster; feeds next year's Cheaper score with a one-year lag. */
  wageAdjustmentFromScarcity?: number;
}

/**
 * Per-role BFCS score data at a given simulation year.
 * Populated by runSimulation() for each cluster-role at each timestep.
 */
export interface RoleBFCSOutput {
  roleId: string;
  scores: BFCSScores;              // current AI BFCS scores at this year
  thresholds: BFCSThresholds;      // effective thresholds (with overrides applied)
  triggered: boolean;              // all 4 thresholds met?
  triggerYear: number | null;      // first year all thresholds met
  adoptionRate: number;            // adjusted adoption rate at this year
}

// ============================================================
// 4b. AI Production Expansion (Phase 2)
// ============================================================

/**
 * Bundles all Phase 2 AI production data passed to computeMacro().
 * Computed in simulation.ts, consumed by macro.ts.
 */
export interface MacroProductionInputs {
  aiInvestmentBoost: number;        // Pre-computed in simulation loop
  aiNetExportBoost: number;         // Pre-computed in simulation loop
  aiConsumerGoodsPotential: number; // Tracked, NOT added to C
  aiAdditionalOutput: number;       // Total across clusters
  totalDurableNewJobs: number;      // From computeNewJobMetrics()
  newJobWageFraction: number;       // Config param, default 0.70
  augmentationWageBoost?: number;   // Workers' share of augmentation output → wage income
  augmentationProfitBoost?: number; // Firms' share of augmentation output → corporate profits
}

// ============================================================
// 4b.1 Second-Order Effect Parameters (moved from macro.ts for type cohesion)
// ============================================================

/**
 * Parameters for second-order macro effects.
 * All fields have module-level constant defaults in macro.ts (DEFAULT_SECOND_ORDER_PARAMS).
 */
export interface SecondOrderEffectParams {
  demandFeedbackSensitivity: number;
  // DEPRECATED Phase 6: credit sensitivity now in separate consumer/business credit functions
  // creditUESensitivity: number;
  // maxCreditTightening: number;
  // creditInvestmentSensitivity: number;
  // creditConsumptionSensitivity: number;
  baselineGovtTransfers: number;
  baselineDebtInterest: number;
  transferGrowthPerUEPoint: number;
  discretionaryShareOfG: number;
  // DEPRECATED (Phase 5h): deflationVelocitySensitivity removed — never read in computation.
  // Replaced by S-curve params below.
  // Phase 4 quality pass: S-curve deflation velocity
  deferrableConsumptionShare: number;
  deflationMidpoint: number;
  deflationSteepness: number;
  // Phase 4 quality pass: exponential Phillips curve
  phillipsCurveSensitivity: number;
  // Phase 1 feedback loop overhaul
  revenuePressureSensitivity: number;
  revenuePressureCap: number;
  revenuePressureDecay: number;
  aiWageProductivityMultiplier: number;
}

// ============================================================
// 4c. MacroInputs — computeMacro() parameter interface (Phase 5g Step 0)
// ============================================================

/**
 * All inputs to computeMacro(), bundled into a named interface.
 * Replaces the previous 21-positional-parameter signature.
 *
 * Required fields (no defaults — must always be provided):
 *   year, totalRemainingEmployment, weightedAverageWage,
 *   totalDisplaced, automationCoverage, policyEffects, previousMacro
 *
 * Optional fields (fall back to module constants if omitted).
 */
export interface MacroInputs {
  /** Current simulation year */
  year: number;
  /** Sum of employment across all clusters (demand-constrained, before new jobs) */
  totalRemainingEmployment: number;
  /** Employment-weighted average wage across all clusters */
  weightedAverageWage: number;
  /** Total jobs displaced (direct AI-only, for new jobs calc) */
  totalDisplaced: number;
  /** Fraction of economy actually automated [0, 1] (displacement-based) */
  automationCoverage: number;
  /** Policy income additions from all channels */
  policyEffects: PolicyEffects;
  /** Previous year's macro output (null for first year) */
  previousMacro: MacroOutput | null;

  // --- Optional fields with module-constant defaults ---

  /** Labor force growth factor = dynamicPopulation / baselinePopulation (default: 1.0).
   *  Scales baseline employment denominators so the no-AI economy naturally absorbs
   *  its growing labor force. Without this, frozen 2025 baselines create rising
   *  structural unemployment as population grows. */
  laborForceGrowthFactor?: number;
  /** Total population (default: US_POPULATION_2025) */
  population?: number;
  /** Total labor force (default: US_LABOR_FORCE_2025) */
  laborForce?: number;
  /** Baseline average annual wage for wageRatio denominator (default: BASELINE_AVERAGE_ANNUAL_WAGE) */
  baselineAverageWage?: number;
  /** Sector-weighted AI deflation rate from computeSectorWeightedDeflation (default: 0) */
  sectorWeightedDeflationRate?: number;
  /** Underlying base inflation rate (default: BASE_INFLATION_RATE) */
  baseInflationRate?: number;
  /** Baseline GDP growth rate (default: BASELINE_GDP_GROWTH_RATE) */
  baselineGDPGrowth?: number;
  // Asset Income Decomposition (dynamic P/E + endogenous capital gains)
  /** AI sector P/E sensitivity to earnings growth. P/E points per 100% growth. Default 100. */
  aiPESensitivity?: number;
  /** Traditional sector P/E sensitivity to earnings growth. P/E points per 100% growth. Default 60. */
  traditionalPESensitivity?: number;
  /** Second-order macro effect parameters (default: DEFAULT_SECOND_ORDER_PARAMS) */
  secondOrderParams?: SecondOrderEffectParams;
  /** Nominal GDP history for rolling average demand feedback (default: []) */
  nominalGDPHistory?: number[];
  /** Policy-derived minimum wage floor as fraction of baseline wage (default: 0) */
  policyWageFloor?: number;
  /** AI production expansion inputs (default: undefined) */
  productionInputs?: MacroProductionInputs;
  /** AI profit margin for corporate profits model (default: DEFAULT_AI_PROFIT_MARGIN) */
  aiProfitMargin?: number;
  /** Traditional profit margin (default: DEFAULT_TRADITIONAL_PROFIT_MARGIN) */
  traditionalProfitMargin?: number;

  // Phase 5g Batch C: Price level decomposition inputs
  /** Cost-push inflation from minimum wage (computed in simulation.ts). Default 0. */
  minWageCostPush?: number;
  /** Credit deflation sensitivity (default: DEFAULT_CREDIT_DEFLATION_SENSITIVITY) */
  creditDeflationSensitivity?: number;
  /** Sector scarcity inflation (computed in simulation.ts). Default 0. */
  scarcityInflation?: number;

  // Phase 5g design: additional inflation components (default 0 until wired in simulation.ts)
  /** Transfer-driven inflation from money creation funding. Default 0. */
  transferInflation?: number;
  /** Demand-side inflationary/deflationary effects. Default 0. */
  demandEffects?: number;

  // Phase 5i: Housing & Credit inputs (computed in simulation.ts, passed to computeMacro)
  /** Embodied capability score for shelter deflation computation. Default 0. */
  embodiedCapability?: number;
  /** Aggregate foreclosure rate from dynamic homeownership. Default 0. */
  foreclosureRateAggregate?: number;
  /** Mortgage stress index from displaced worker composition. Default 1.0. */
  mortgageStressIndex?: number;
  /** Per-quintile dynamic homeownership rates [5 values]. Default: MORTGAGE_EXPOSURE_QUINTILES. */
  dynamicHomeownership?: number[];
  /** Shelter CPI weight (forwarded from SimulationConfig). */
  shelterCPIWeight?: number;
  /** Shelter inflation stickiness (forwarded from SimulationConfig). */
  shelterInflationStickiness?: number;
  /** Housing wealth MPC (forwarded from SimulationConfig). */
  housingWealthMPC?: number;
  /** MPC wage UE sensitivity (forwarded from SimulationConfig). */
  mpcWageUESensitivity?: number;
  // DEPRECATED Phase 6: replaced by growthTrajectorySensitivity in new credit inputs
  // businessCreditGDPSensitivity?: number;
  /** Max business credit loosening (forwarded from SimulationConfig). */
  maxBusinessCreditLoosening?: number;
  /** Credit adoption acceleration (computed in simulation.ts). Default 0. */
  creditAdoptionAcceleration?: number;

  // Housing Market Stabilization (forwarded from SimulationConfig)
  /** Institutional buyer absorption rate. Default 0.40. */
  institutionalBuyerRate?: number;
  /** Rental demand sensitivity from displaced homeowners. Default 0.50. */
  rentalDemandSensitivity?: number;
  /** Shelter inflation floor (land scarcity). Default -0.05. */
  shelterInflationFloor?: number;

  // Income Distribution — forwarded from SimulationConfig for Median CWI computation
  /** Share of wage income reaching bottom 80%. Default BOTTOM80_WAGE_SHARE (0.45). */
  bottom80WageShare?: number;
  /** Share of transfer income reaching bottom 80%. Default BOTTOM80_TRANSFER_SHARE (0.78). */
  bottom80TransferShare?: number;
  /** Share of asset income reaching bottom 80%. Default BOTTOM80_ASSET_SHARE (0.12). */
  bottom80AssetShare?: number;

  // Investment Demand Constraint — market signals that gate AI investment realization
  /** AI capacity utilization [0, 1] from previous year's macro output. Default 1.0. */
  prevAiCapacityUtilization?: number;
  /** Consumer demand ratio — prevConsumption / baseline. Default 1.0. */
  consumerDemandRatio?: number;
  // DEPRECATED Phase 6: replaced by businessCreditTightening in new credit system
  // businessCreditSignal?: number;
  /** How much low AI utilization discourages new AI investment. 0-100 slider → exponent 0-3.0. Default 50. */
  aiUtilizationSensitivity?: number;
  /** How much weak consumer demand discourages AI investment. 0-100 slider → exponent 0-3.0. Default 50. */
  consumerDemandInvestmentSensitivity?: number;
  // DEPRECATED Phase 6: replaced by businessInvestmentImpact in new credit system
  // creditInvestmentResponseSensitivity?: number;
  /** How much consumer demand affects traditional investment. 0-100 slider → exponent 0-3.0. Default 30. */
  traditionalInvestmentDemandSensitivity?: number;
  /** Traditional private fixed investment as fraction of GDP. Default TRADITIONAL_INVESTMENT_GDP_FRACTION (0.175). */
  traditionalInvestmentGDPFraction?: number;
  /** Captured year-0 credit-funded investment baseline, computed from endogenous profits.
   *  BASELINE_CREDIT_FUNDED uses BASELINE_PROFIT_GDP_RATIO (0.13, BEA) for retained earnings,
   *  but the model's endogenous profit computation uses DEFAULT_TRADITIONAL_PROFIT_MARGIN (0.11).
   *  This mismatch causes a 15.6% step-down in retainedEarnings from t=0→t=1, triggering
   *  the capacityGate and reducing investment by ~$73B. Using the captured value from year 0's
   *  actual endogenous profits eliminates the discontinuity. Default: BASELINE_CREDIT_FUNDED. */
  baselineCreditFunded?: number;

  // ═══ Phase 6: Consumer Credit Inputs (from previous year — bank underwriting lag) ═══
  /** Previous year's real (inflation-adjusted) wage income. */
  prevRealWageIncome?: number;
  /** Previous year's real transfer income. */
  prevRealTransferIncome?: number;
  /** Previous year's real asset income. */
  prevRealAssetIncome?: number;
  /** Previous year's home price change rate. */
  prevHomePriceChangeRate?: number;
  /** Previous year's Consumer Welfare Index. */
  prevCWI?: number;
  /** Year-0 CWI — denominator for systemic risk ratio. */
  baselineCWI?: number;
  /** Previous year's composite inflation rate. */
  prevCompositeInflation?: number;
  /** Year-0 real household income — denominator for income adequacy ratio. */
  baselineRealHouseholdIncome?: number;
  // ═══ Phase 6: Business Credit Inputs (from previous year) ═══
  /** Previous year's after-tax corporate profits. */
  prevAfterTaxCorporateProfits?: number;
  /** Year-0 corporate profits — denominator for profit coverage ratio. */
  baselineCorporateProfits?: number;
  // ═══ Phase 6: Credit Sensitivities (forwarded from SimulationConfig) ═══
  transferReliabilityWeight?: number;
  incomeAdequacySensitivity?: number;
  collateralSensitivity?: number;
  systemicRiskSensitivity?: number;
  inflationRiskSensitivity?: number;
  maxConsumerTightening?: number;
  consumerCreditImpact?: number;
  profitabilitySensitivity?: number;
  growthTrajectorySensitivity?: number;
  maxBusinessTightening?: number;
  businessInvestmentImpact?: number;

  // ═══ Tax & Economic Pipeline (Phase 5-tax) ═══

  // User-adjustable tax rates
  incomeTaxRate?: number;
  payrollTaxRate?: number;
  corporateTaxRate?: number;
  capitalGainsTaxRate?: number;

  // Corporate/investment
  corporateRetentionRate?: number;
  aiProfitGrowthRate?: number;

  // Post-tax MPCs (separate from old pre-tax mpcWage/mpcAsset/mpcTransfer)
  postTaxMPC_Wage?: number;
  postTaxMPC_Asset?: number;
  postTaxMPC_Transfer?: number;

  // AI cost params
  aiCostParams?: AICostParams;

  // Baseline rates (structural, for delta computation — from govData)
  baselineIncomeTaxRate?: number;
  baselinePayrollRate?: number;
  baselineCorporateTaxRate?: number;
  baselineCapGainsRate?: number;
  stateLocalTaxRate?: number;
  transferTaxRate?: number;   // ~0.05, structural

  // ═══ Phase 7: Fiscal-Monetary Inputs ═══
  /** Inflation from deficit monetization (replaces transfer inflation flow). Default 0. */
  inflationFromMonetization?: number;
  /** Mortgage rate from bond market for shelter inflation. Default: baseline mortgage rate. */
  mortgageRate?: number;
  /** Corporate borrowing rate for investment dampening. Default: baseline corporate rate. */
  corporateBorrowingRate?: number;
  /** Aggregate equity market return for capital gains. Default 0. */
  marketReturn?: number;
  /** Federal Reserve policy rate for velocity effect. Default: initial policy rate. */
  fiscalMonetaryPolicyRate?: number;

  // ═══ Phase 8a: Fiscal Response Profile Inputs ═══
  /** Resolved fiscal response profile (for COLA dampening in macro). */
  fiscalProfile?: import('@/models/fiscalResponseProfiles').FiscalResponseProfile;
  /** Fiscal consolidation multiplier for mandatory G. Default 1.0. */
  consolidationObligationMult?: number;
  /** Fiscal consolidation multiplier for discretionary G. Default 1.0. */
  consolidationDiscretionaryMult?: number;

  // ═══ Phase 9: Supply Chain Inputs ═══
  /** Supply chain cost-push inflation component. Default 0. */
  supplyChainCostPush?: number;
  /** Lab profit margin reduction from absorbed supply chain costs. Default 0 (negative when absorbing). */
  labProfitMarginAdjustment?: number;
  /** Aggregate cost savings from replacing human labor with AI (dollars). Can be negative under supply shocks. */
  automationDividend?: number;
  /** Firms' share of worker augmentation output → corporate profits. Default 0. */
  augmentationProfitBoost?: number;

  // ═══ Phase 8 Fix 5: Housing Model Inputs ═══
  /** Cumulative home price index (1.0 at baseline). Tracked in simulation.ts. */
  homePriceIndex?: number;
  /** Previous year's mortgage rate for computing YoY change. Default: current mortgageRate (no change). */
  prevMortgageRate?: number;
  /** Population growth rate for demographic housing demand. Default: DEFAULT_POPULATION_GROWTH_RATE. */
  populationGrowthRate?: number;
  /** Mortgage rate → home price elasticity. Default 4.0. */
  affordabilityPriceSensitivity?: number;
  /** Real income growth → home price elasticity. Default 0.5. */
  incomeHousingElasticity?: number;
  /** How fast prices revert to affordability equilibrium. Default 0.15. */
  affordabilityReversionSensitivity?: number;
  /** How much weaker downward price reversion is vs upward. Default 0.5. */
  downwardStickinessRatio?: number;
  /** Population growth → home price demand elasticity. Default 1.0. */
  demographicHousingElasticity?: number;

  // Phase 10.A: Phillips Mechanism 2 inputs (populated by simulation.ts).
  /** Cumulative AI-displacement unemployment headcount (not rate) across all years. Default 0. */
  aiDisplacementUnemployment?: number;
  /** Economy-wide employment-weighted mean of role.aiReplacementDifficultyWagePremium. Default 0. */
  aggregateReplacementDifficultyWagePremium?: number;
  /** Scarcity premium intensity (config.scarcityIntensity). Default 0. */
  scarcityIntensity?: number;
  /** Baseline labor force for converting rate × force → unemployed headcount. Default from laborForce. */
  laborForceBaseline?: number;
}

// ============================================================
// 5. Macro Economic Model
// ============================================================

export type CyclePhase =
  | 'STABLE'
  | 'ACCELERATING_DECLINE'
  | 'LINEAR_DECLINE'
  | 'DECELERATING_DECLINE'
  | 'RECOVERY'
  | 'MONETARY_COLLAPSE';

export interface MacroOutput {
  year: number;
  
  // Employment
  totalEmployment: number;
  totalUnemployment: number;
  unemploymentRate: number;
  laborForceParticipation: number;

  // Dynamic demographics (Phase 5g)
  dynamicPopulation: number;
  dynamicLaborForce: number;
  
  // Income
  aggregateWageIncome: number;
  aggregateAssetIncome: number;
  aggregateTransferIncome: number;
  totalIncome: number;
  incomeComposition: IncomeComposition;
  
  // Prices
  priceLevel: number;
  inflationRate: number;
  aiDeflationRate: number;
  netInflation: number;
  
  // GDP
  gdpNominal: number;
  gdpReal: number;
  gdpGrowthRate: number;
  realGDPGrowthRate: number;    // Phase 8a: real GDP growth (deflated, for revenue pressure)
  consumption: number;
  investment: number;
  governmentSpending: number;
  
  // Consumer Welfare Index — per-capita real income (purchasing power measure)
  consumerWelfareIndex: number;   // = totalIncome / (population × priceLevel) (System CWI)
  cwiGrowthRate: number;          // YoY change rate
  cwiAcceleration: number;        // 2nd derivative: change in growth rate
  cyclePhase: CyclePhase;         // Vicious cycle phase classification

  // Median CWI — bottom 80% real income per capita
  medianCWI: number;              // Real income per capita for bottom 80% of households
  medianCWIGrowthRate: number;    // YoY growth rate

  // AI GDP Contribution
  aiGDPContribution: number;      // Total AI addition to GDP ($): investment + absorbed goods + net exports
  aiGDPContributionPct: number;   // AI GDP contribution as fraction of nominal GDP
  
  // Revenue Pressure
  revenuePressure: number;
  automationAcceleration: number;
  
  // Depression Indicator
  isDepression: boolean;
  consecutiveDeclineQuarters: number;
  
  // Phillips Curve & Sector Deflation
  wagePressure: number;           // Phillips curve factor [policyWageFloor, 1.0+]
  sectorWeightedDeflationRate: number; // Sector-weighted AI deflation rate

  // Demand Spillover (Phase 3c.1 — replaces Okun's Law)
  consumerDemandRatio: number;        // prevConsumption / baseline [0, inf)
  govDemandRatio: number;             // prevGovSpending / baseline [0, inf)
  businessDemandRatio: number;        // prevInvestment / baseline [0, inf)
  aggregateDemandSurvival: number;    // employment-weighted avg survival rate [0, 1]
  totalDemandSpilloverLoss: number;   // workers lost to demand shortfall

  // New Jobs
  newJobCreationRate: number;
  automationCoverage: number;     // Employment-weighted, not raw capability
  durableNewJobs: number;
  netJobCreation: number;

  // Second-Order Effects (Phase 8 + Phase 1 overhaul)
  demandRatio: number;            // currentNomGDP / rollingAvg [0, 1]
  demandPenalty: number;          // demandRatio ^ sensitivity [0, 1]
  // DEPRECATED Phase 6: replaced by separated consumer & business credit
  // creditTightening: number;
  // investmentMultiplier: number;
  // consumptionMultiplier: number;
  fiscalDeficitGDPRatio: number;  // Full budget deficit / GDP
  discretionarySpending: number;  // Government discretionary spending (no austerity cuts)

  // Deflation Velocity Drag (Phase 8)
  velocityMultiplier: number;     // Deflation velocity drag factor [0.70, 1.0]
  deflationDragPct: number;       // Velocity decline percentage [0, 0.30]

  // Income Derivation (Phase 3c)
  cumulativeInflationFactor: number;       // Inflation-only cumulative factor for transfer COLA (starts at 1.0)
  baselineTransferIncome: number;          // BASELINE_TRANSFER_INCOME × cumulativeInflationFactor
  effectiveInflationRate: number;          // max(0, compositeInflation) — transfer COLA rate

  // AI Production Expansion (Phase 2)
  aiAdditionalOutput: number;        // Total AI-produced surplus across all clusters
  aiInvestmentBoost: number;         // Fraction of AI output → capital goods/infrastructure
  aiNetExportBoost: number;          // Fraction of AI output → domestic production (onshoring)
  aiConsumerGoodsPotential: number;  // Fraction of AI output → consumer goods (NOT added to C)
  unrealizedAIOutput: number;        // AI supply capacity minus demand-absorbed goods (Phase 3b)
  aiGoodsAbsorbed: number;           // AI goods absorbed by demand = supply × demandHealthRatio
  // Worker augmentation channel
  totalAugmentationOutput: number;   // Total additional output from AI-augmented remaining workers
  augmentationWageBoost: number;     // Workers' share of augmentation → wage income
  augmentationProfitBoost: number;   // Firms' share of augmentation → corporate profits
  aiCapacityUtilization: number;     // AI capacity utilization = absorbed / supply [0, 1]

  // Investment Demand Constraint
  investmentRealization: number;     // Combined market gate [0, ~2+]: utilization × demand × credit factors
  aiInvestmentRealized: number;      // AI investment $ after realization factor
  aiExportsRealized: number;         // AI exports $ after realization factor

  // New Job Integration (Phase 2)
  newJobEmployment: number;          // Raw durable new jobs
  newJobWageIncome: number;          // Wage income from new jobs (after wage pressure)

  // Demand-Constrained GDP (Phase 3)
  potentialGDP: number;              // gdpReal + aiConsumerGoodsPotential (supply-side potential)
  capacityUtilization: number;       // gdpReal / potentialGDP [0, 1]
  wageConsumption: number;           // afterTaxWageIncome * effectiveMpcWage (nominal)
  assetConsumption: number;          // afterTaxAssetIncome * mpcAsset (nominal)
  transferConsumption: number;       // afterTaxTransferIncome * mpcTransfer (nominal)

  // Asset Income Decomposition
  dividendIncome: number;               // After-corporate-tax, after-retention distributed profits
  aiCapitalGains: number;               // AI sector: profit growth × P/E × realization rate
  traditionalCapitalGains: number;      // Traditional sector: same formula
  nonCorporateAssetIncome: number;      // Non-corporate: proprietors, rental, interest
  nonCorporateAssetTax: number;         // Ordinary income tax on non-corporate asset income
  capitalGainsRealizationRate: number;  // Endogenous realization rate (IRS 4%-12% range)
  aiSectorPE: number;                   // Dynamic AI sector P/E ratio
  traditionalSectorPE: number;          // Dynamic traditional sector P/E ratio
  /** Previous year's AI corporate profits — used for t-2 lookback in capital gains */
  prevAICorporateProfits: number;
  /** Previous year's traditional corporate profits — used for t-2 lookback */
  prevTraditionalCorporateProfits: number;

  // Corporate Profits (Phase 5g)
  corporateProfits: number;             // Total corporate profits ($)
  aiCorporateProfits: number;           // AI sector profits ($)
  traditionalCorporateProfits: number;  // Non-AI sector profits ($)
  profitGDPRatio: number;              // Total profits / GDP [0, 1]

  // Price Level Decomposition (Phase 5g Batch C)
  minWageCostPush: number;              // Cost-push inflation from min wage > cluster wages
  creditDeflationContribution: number;  // Deflationary effect from credit tightening [<= 0]
  scarcityInflation: number;            // Labor scarcity -> price pressure across sectors

  // ═══ Phase 6: Separated Credit Outputs ═══
  consumerCreditMultiplier: number;       // [0.01, 1.0] → multiplies consumption
  consumerCreditTightening: number;       // raw tightening level for diagnostics
  incomeAdequacyRatio: number;            // underwritable income / baseline (diagnostic)
  underwritableIncome: number;            // real $ that banks count toward debt servicing
  businessCreditMultiplier: number;       // [0.01, ~1.15] → multiplies investment (can loosen above 1.0)
  businessCreditTightening: number;       // raw level (negative = loosening)
  profitCoverageRatio: number;            // corporate profits / baseline (diagnostic)

  // Phase 5i: Housing & Shelter
  goodsInflation: number;                // Non-shelter inflation rate
  shelterInflation: number;              // Shelter-specific inflation rate
  compositeInflation: number;            // shelterWeight × shelter + (1-w) × goods
  shelterDeflationFromAI: number;        // Embodied AI impact on construction costs
  foreclosureSupplyEffect: number;       // Foreclosure supply impact on shelter (net of institutional absorption)
  rentalDemandPressure: number;          // Upward shelter pressure from displaced-to-renter conversion
  institutionalAbsorption: number;       // Foreclosure supply absorbed by institutional investors
  mortgageStressIndex: number;           // Composition amplifier [>= 1.0 typically]
  // DEPRECATED Phase 6: adjustedCreditTightening — mortgage stress now inside consumer credit function
  // adjustedCreditTightening: number;
  foreclosureRateAggregate: number;      // Overall foreclosure rate
  homeownershipQ1: number;              // Dynamic homeownership quintile 1
  homeownershipQ2: number;
  homeownershipQ3: number;
  homeownershipQ4: number;
  homeownershipQ5: number;
  avgHomeownership: number;              // Mean across quintiles
  homePriceChangeRate: number;           // YoY home price change
  homePriceIndex: number;                // Cumulative home price index (1.0 at baseline)
  affordabilityDeviation: number;        // Price-to-income vs baseline (positive=cheap, negative=expensive)
  realIncomeGrowthRate: number;          // YoY real household income growth rate
  mortgageRateChange: number;            // YoY change in mortgage rate (bp)
  nominalWageGrowth: number;             // Natural nominal wage growth rate (inflation + productivity + Phillips)
  housingWealthDrag: number;             // $ consumption drag from falling home values
  effectiveMpcWage: number;              // After precautionary saving adjustment
  precautionaryMpcReduction: number;     // MPC reduction amount
  creditAdoptionAcceleration: number;    // Adoption boost from business credit loosening

  // Labor Supply Response (Phase 5g Step 12)
  voluntaryWithdrawalRate: number;      // Aggregate voluntary withdrawal rate [0, 1]
  effectiveLaborSupply: number;         // Total effective labor supply after withdrawal

  // ═══ Tax Revenue Breakdown (Phase 5-tax) ═══
  wageIncomeTax: number;
  employeePayrollTax: number;
  employerPayrollTax: number;
  capitalGainsTax: number;
  corporateTaxRevenue: number;
  stateLocalRevenue: number;
  totalGovernmentRevenue: number;

  // After-Tax Income
  afterTaxWageIncome: number;
  afterTaxAssetIncome: number;
  afterTaxTransferIncome: number;
  totalPostTaxIncome: number;

  // Investment Capacity
  afterTaxCorporateProfits: number;
  retainedEarnings: number;
  creditCapacity: number;
  investmentCapacity: number;
  capacityGate: number;
  profitFundedRatio: number;
  creditFundedRatio: number;
  corporateCashAccumulation: number;

  // AI Cost Indices
  blendedAiCostIndex: number;
  inferenceCostIndex: number;
  manufacturingCostIndex: number;
  energyCostIndex: number;

  // Supply Chain
  // DEPRECATED: importDependence — kept for backward compat, now populated as 1 - aggregateResilience
  importDependence: number;

  // ═══ Phase 9: Supply Chain Diagnostics ═══
  aggregateResilience: number;
  cumulativeDelayGenerative: number;
  cumulativeDelayAgentic: number;
  cumulativeDelayEmbodied: number;
  supplyChainCostPush: number;
  cascadeBacklog: number;
  costPassThroughRate: number;
  adoptionDragMultiplier: number;
  dynamicTrainingCompChips: number;
  dynamicTrainingCompEnergy: number;
  dynamicTrainingCompDC: number;
  effectiveComputeDeclineRate: number;
  deploymentMultiplierCompute: number;
  deploymentMultiplierPhysical: number;
  deploymentMultiplierEnergy: number;
  /** Aggregate cost savings from deployers replacing human labor with AI (dollars). Negative under severe supply shocks. */
  automationDividend: number;

  // ═══ Phase 10.A: Alpha Drivers Inputs + Cumulative AI Displacement ═══
  /** corporateProfits / gdpNominal with safe fallback to baseline if gdpNominal ≤ 0.
   *  Read by computeEffectiveAlpha as an α-driver input (margin compression). */
  corporateMarginRatio: number;
  /** Current-year AI-displacement headcount stock (NOT cumulative; reset each year).
   *  Derived from sum of clusters' totalDirectDisplacement = baseline − remaining, which is itself
   *  a stock measure. Summing this across years would multi-count the same workers and produce
   *  meaningless totals (prior bug: 2050 value reached ~3× the labor force).
   *  Used by computeWagePressure to derive aiShare of total unemployment for the scarcity premium. */
  aiDisplacementUnemployment: number;
}

export interface IncomeComposition {
  wageShare: number;     // [0, 1]
  assetShare: number;    // [0, 1]
  transferShare: number; // [0, 1]
}

// ============================================================
// 6. Monetary Model
// ============================================================

export interface MonetaryState {
  moneySupply: number;           // M
  velocityOfMoney: number;       // V
  priceLevel: number;            // P
  realGDP: number;               // Y

  // Transfer funding (Phase 5g Step 13: endogenous fiscal funding split)
  moneyCreationShare: number;    // [0, 1] — fraction funded by money creation
  maxNeutralTransfers: number;   // max transfer level with 0 net inflation
  actualInflationFromTransfers: number;
  isWithinNeutralZone: boolean;
  dynamicVelocity: number;       // Adjusted velocity after unemployment/demand effects (Phase 5g)
}

// ============================================================
// 6a. Phase 7: Fiscal-Monetary System
// ============================================================

export interface FiscalState {
  federalDebtStock: number;
  debtGDPRatio: number;
  interestExpense: number;
  debtServiceRevenueRatio: number;
  weightedAverageDebtRate: number;
  totalGovernmentRevenue: number;
  revenueGDPRatio: number;
  laborTaxRevenue: number;
  corporateTaxRevenue: number;
  primaryDeficit: number;
  totalDeficit: number;
  // Phase 8a: Fiscal consolidation fields
  consolidationIntensity: number;       // 0-1 scale
  discretionaryMultiplier: number;      // Applied to discretionary G
  obligationMultiplier: number;         // Applied to mandatory G
  revenueMultiplier: number;            // Applied to tax rates
  effectiveCOLAFactor: number;          // Dampened CIF used for transfers
  // Phase 8 Fix 3: Endogenous debt maturity
  weightedAverageMaturity: number;       // Computed WAM in years
  effectiveRolloverRate: number;         // 1/WAM — fraction of debt rolling over annually
}

export interface FederalReserveState {
  taylorPrescribedRate: number;
  policyRate: number;
  fiscalDominanceActive: boolean;
  fiscalDominanceGap: number;
  /** Phase 8 fix: How stuck the Fed is under fiscal dominance (0 = free, 1 = fully stuck). */
  dominanceFactor: number;
  outputGap: number;
  fullEmploymentGDP: number;    // GDP at natural unemployment rate with AI productivity
}                                // Distinct from existing potentialGDP (which means "AI production potential")

export interface BondMarketState {
  tenYearYield: number;
  expectedAveragePolicyRate: number;
  termPremium: number;
  fiscalRiskPremium: number;
  supplyPressurePremium: number;
  mortgageRate: number;
  corporateBorrowingRate: number;
  foreignDemandRatio: number;
  /** Phase 8 fix: Credibility discount on risk premium from fiscal consolidation (1.0 = no credit). */
  consolidationCredibility: number;
  /** Phase 8 fix 3: Private market bond demand multiplier (>1 = strong demand). */
  absorptionCapacity: number;
  /** Phase 8 Fix 4: Trajectory component of composite fiscal risk premium. */
  fiscalRiskTrajectoryComponent: number;
  /** Phase 8 Fix 4: Sustainability (r-g) component of composite fiscal risk premium. */
  fiscalRiskSustainabilityComponent: number;
  /** Phase 8 Fix 4: Level component of composite fiscal risk premium. */
  fiscalRiskLevelComponent: number;
}

export interface EquityMarketState {
  aggregateMarketCap: number;
  peRatio: number;
  effectivePEMultiplier: number;
  growthMomentum: number;
  equityDiscountRate: number;
  marketReturn: number;
}

export interface MonetizationState {
  monetizationRate: number;
  moneyCreated: number;
  bondFinancedDeficit: number;
  inflationFromMonetization: number;
  /** Phase 8 fix: Whether yield-responsive monetization (Case 5) fired this year. */
  yieldResponseActive: boolean;
  /** Phase 8 fix: Monetization rate from yield response case (before max-of-all). */
  yieldResponseMonetization: number;
  /** Phase 8 fix 2: Whether lender-of-last-resort (Case 6) fired this year. */
  lolrActive: boolean;
  /** Phase 8 fix 2: Monetization rate from LOLR case (before max-of-all). */
  lolrMonetization: number;
  /** Phase 8 fix 3: Composition-weighted transmission efficiency [0, 1]. */
  transmissionEfficiency: number;
  /** Phase 8 fix 3: Whether monetization taper floor raised the rate above computed level. */
  taperApplied: boolean;
}

export interface FiscalMonetaryOutput {
  fiscal: FiscalState;
  federalReserve: FederalReserveState;
  bondMarket: BondMarketState;
  equityMarket: EquityMarketState;
  monetization: MonetizationState;
}

// ============================================================
// 7a. Policy Keyframe Schedule
// ============================================================

export interface PolicyKeyframe {
  year: number;   // 2025-2050
  value: number;  // the policy value at that year
}

export interface PolicySchedule {
  keyframes: PolicyKeyframe[];  // sorted by year ascending, can be empty
  // Empty keyframes = policy inactive (value 0 for all years)
}

// ============================================================
// 7. Policy Configuration
// ============================================================

export interface PolicyConfig {
  // Wage Channel
  minimumWage: MinimumWagePolicy;
  wageSubsidy: WageSubsidyPolicy;
  workWeekReduction: WorkWeekPolicy;

  // Asset Channel
  sovereignWealthFund: SovereignWealthFundPolicy;  // now includes equity stake fields (Phase 5g)
  profitSharing: ProfitSharingPolicy;

  // Transfer Channel
  ubi: UBIPolicy;
  enhancedUI: EnhancedUIPolicy;
  retraining: RetrainingPolicy;
}

export interface MinimumWagePolicy {
  enabled: boolean;
  federalMinimum: PolicySchedule;      // hourly rate, was: number
  stateOverrides: Record<string, number>;
  indexedToInflation: boolean;
  indexedToProductivity: boolean;
}

export interface WageSubsidyPolicy {
  enabled: boolean;
  subsidyPercentage: PolicySchedule;   // fraction 0-0.30, was: number
  maxSubsidyPerWorker: number;
  phaseOutThreshold: number;
}

/**
 * @deprecated Phase 5h Fix 6: Type/config/UI exist but no computation logic
 * was ever implemented in policy.ts. Kept for structural compatibility;
 * hidden from UI. Do not add new features to this policy until a proper
 * hours-to-employment model is built.
 */
export interface WorkWeekPolicy {
  enabled: boolean;
  standardHours: PolicySchedule;       // hours/week 20-40, was: number
  overtimeMultiplier: number;
}

export interface SovereignWealthFundPolicy {
  enabled: boolean;
  initialFundSize: number;                    // billions (one-time init, stays flat)
  annualContribution: PolicySchedule;         // billions/year, was: number
  annualReturnRate: number;
  distributionRate: number;
  distribution: 'universal' | 'means_tested';
  // Merged from UniversalEquityPolicy (Phase 5g SWF consolidation)
  ownershipFraction: PolicySchedule;   // fraction 0-0.50
  // DEPRECATED: totalAICompanyProfits and profitGrowthRate — replaced by computeCorporateProfits
  // Kept as fallback defaults for the equity stake computation when corporate profits model unavailable
  totalAICompanyProfits: number;       // billions/year baseline
  profitGrowthRate: number;
  distributionMethod: 'equal' | 'progressive';
}

// DEPRECATED (Phase 5g): Merged into SovereignWealthFundPolicy
// export interface UniversalEquityPolicy {
//   enabled: boolean;
//   ownershipFraction: PolicySchedule;   // fraction 0-0.50, was: number
//   totalAICompanyProfits: number;       // billions/year baseline
//   profitGrowthRate: number;
//   distributionMethod: 'equal' | 'progressive';
// }

export interface ProfitSharingPolicy {
  enabled: boolean;
  mandatorySharePercentage: PolicySchedule;  // fraction 0-0.30, was: number
  companyRevenueThreshold: number;
  distributionScope: 'employees_only' | 'community' | 'national';
}

export interface UBIPolicy {
  enabled: boolean;
  monthlyAmount: PolicySchedule;       // $/month, was: number
  ageThreshold: number;
  /**
   * @deprecated Phase 5h Fix 7: phaseOut fields exist in type/config but are NOT
   * used in any computation in policy.ts. The UBI computation treats all eligible
   * citizens identically regardless of income. Kept as optional for structural compat.
   */
  phaseOut?: {
    enabled: boolean;
    incomeThreshold: number;
    phaseOutRate: number;
  };
  indexedToInflation: boolean;
  indexedToProductivity: boolean;
  /** UBI amount mode: 'manual' = use monthlyAmount schedule, 'indexed' = auto-scale with AI GDP */
  mode: 'manual' | 'indexed';
  /** Base monthly amount for indexed mode (default $1000) */
  indexedBaseAmount?: number;
  /** Year to start indexing from (default 2032) */
  indexedStartYear?: number;
  /** Productivity index rate exponent (default 1.0, range 0-2) */
  productivityIndexRate?: number;
}

export interface EnhancedUIPolicy {
  enabled: boolean;
  replacementRate: PolicySchedule;     // fraction 0-1.0, was: number
  durationWeeks: number;
  retrainingBonus: number;
  stateOverrides: Record<string, Partial<EnhancedUIPolicy>>;
}

export interface RetrainingPolicy {
  enabled: boolean;
  stipendMonthly: PolicySchedule;      // $/month, was: number
  durationMonths: number;
  effectivenessRate: number;
  participationRate: number;           // fraction 0-1, default 0.30
  targetClusters: OccupationClusterId[];
}

// ============================================================
// 8. State-Level Model
// ============================================================

export type StateCode = string; // 2-letter state code

export interface StateData {
  code: StateCode;
  name: string;
  population: number;
  laborForce: number;
  baselineUnemploymentRate: number; // LAUS baseline [0, 1]
  occupationDistribution: Record<OccupationClusterId, number>; // employment per cluster
  policyOverrides: Partial<StatePolicyOverride>;
}

export interface StatePolicyOverride {
  minimumWage: number;
  additionalUBI: number;
  uiReplacementRate: number;
  avRegulatoryEnvironment: 'permissive' | 'moderate' | 'restrictive';
  roboticsRegulatoryEnvironment: 'permissive' | 'moderate' | 'restrictive';
}

export interface StateOutput {
  code: StateCode;
  year: number;
  displacement: number;
  unemploymentRate: number;
  consumerWelfareIndex: number;
  policyEffectiveness: number;   // [0, 1] how well policy prevents displacement-demand feedback cycle
}

// ============================================================
// 9. Simulation Configuration & Output
// ============================================================

export interface SimulationConfig {
  startYear: number;             // default: 2025
  endYear: number;               // default: 2050
  capabilities: Record<CapabilityVectorId, CapabilityTrajectoryParams>;
  adoptionParams: AdoptionParams;
  policyConfig: PolicyConfig;
  
  // Macro parameters
  baseInflationRate: number;     // default: 0.02
  baselineGDPGrowth: number;
  
  // Population
  totalPopulation: number;
  laborForce: number;
  /** Annual population growth rate. Default 0.004 (0.4%). Range: -0.05 to 0.05. */
  populationGrowthRate?: number;
  
  // New job creation
  innovationRate: number;
  rdMultiplier: number;
  jobPersistenceFactor: number;  // >1 = new jobs more vulnerable

  // BFCS threshold overrides (Phase 4)
  // Keyed by clusterId → roleId → thresholds.
  // Empty object = use all defaults from occupationClusters.ts.
  bfcsOverrides: Record<string, Record<string, BFCSThresholds>>;

  // State policy overrides (Phase 6)
  // Keyed by 2-letter state code → partial override.
  stateOverrides: Record<StateCode, Partial<StatePolicyOverride>>;

  // Second-Order Effect Parameters (Phase 8 + Phase 1 overhaul)
  // All optional — fall back to module constants if not set.
  demandFeedbackSensitivity?: number;     // 0-3, default 1.5
  creditUESensitivity?: number;           // 0-20, default 8.0
  creditInvestmentSensitivity?: number;   // 0-1.0, default 0.35 (was 0.15 — 2008 investment fell 23%)
  creditConsumptionSensitivity?: number;  // 0-1.0, default 0.06

  // Feedback Loop Parameters (Phase 1 overhaul)
  revenuePressureSensitivity?: number;    // 0-3, default 1.5
  revenuePressureCap?: number;            // 0-1, default 0.3
  revenuePressureDecay?: number;          // 0-1, default 0.5
  aiWageProductivityMultiplier?: number;  // 0-1, default 0.5

  // Phillips Curve Parameters (Phase 4 quality pass)
  /** Exponential Phillips curve sensitivity. Higher = wages fall faster with excess unemployment.
   *  Default 2.5. At 10% excess UE → ~22% wage reduction. Source: Blanchard (2016), IMF WEO Ch3 (2017). */
  phillipsCurveSensitivity?: number;       // 0-5, default 2.5

  // Credit Parameters (Phase 4 quality pass)
  /** Maximum fraction of credit that can contract during crisis.
   *  Empirical: 2008 ~40% bank lending decline, Great Depression ~50% total credit contraction.
   *  Default 0.70 allows worse-than-historical outcomes. */
  maxCreditTightening?: number;            // 0.3-1.0, default 0.70

  // Deflation Fix Parameters (Phase 8 + Phase 4 quality pass)
  /** Per-cluster deflation intensity overrides [0, 1]. Falls back to SECTOR_DEFLATION_INTENSITY. */
  deflationIntensityOverrides?: Record<string, number>;
  // DEPRECATED (Phase 5h): deflationVelocitySensitivity removed — never read in computation.
  // Replaced by deferrableConsumptionShare / deflationMidpoint / deflationSteepness below.
  /** Fraction of consumption that can be deferred during deflation (BEA PCE deferrable share). Default 0.30. */
  deferrableConsumptionShare?: number;     // 0.1-0.5, default 0.30
  /** Deflation rate at which half of deferrable spending is actually deferred. Default 0.05 (5%). */
  deflationMidpoint?: number;              // 0.01-0.15, default 0.05
  /** Steepness of deferral response curve. Higher = sharper transition. Default 40. */
  deflationSteepness?: number;             // 10-80, default 40

  // Dynamic Money Velocity Parameters (Phase 5g)
  /** Sensitivity of money velocity to excess unemployment. Default 0.03. Range: 0-1. */
  velocitySensitivity?: number;

  // AI Production Expansion Parameters (Phase 2)
  aiProductionInvestmentFraction?: number;  // 0-1, default 0.30
  aiProductionOnshoringFraction?: number;   // 0-1, default 0.10
  newJobWageFraction?: number;              // 0-2, default 0.70

  // Worker Augmentation
  /** Per-worker output boost from AI tools at full capability. Default 0.20 (20%).
   *  At betterScore=1.0, each remaining worker produces (1 + multiplier) × baseline.
   *  Source: McKinsey/Goldman Sachs (2023) — 15-40% knowledge worker productivity gains. */
  augmentationMultiplier?: number;          // 0-5, default 2.0

  // Employment multiplier override for other_uncategorized cluster (Phase 5h Fix 2)
  // undefined = auto (employment-weighted average of all other clusters)
  // number = custom user value (0.0–5.0 via slider)
  otherUncategorizedMultiplierOverride?: number;

  // Per-cluster parameter overrides (Phase 8 consolidation)
  clusterOverrides?: Record<string, Partial<ClusterParameterOverride>>;

  // Corporate Profits & Financial Markets (Phase 5g)
  aiProfitMargin?: number;              // 0-0.999, default 0.25
  traditionalProfitMargin?: number;     // 0-0.30, default 0.11
  // Asset Income Decomposition — dynamic P/E + endogenous capital gains
  /** AI sector P/E sensitivity to earnings growth. P/E points per 100% growth. Default 100. Range: 25-250. */
  aiPESensitivity?: number;
  /** Traditional sector P/E sensitivity to earnings growth. Default 60. Range: 15-150. */
  traditionalPESensitivity?: number;

  // Minimum Wage Feedback (Phase 5g Step 9)
  /** Fraction of min wage increase passed through to prices. Default 0.40. Range: 0-1. */
  wagePassThrough?: number;
  /** Sensitivity of automation adoption to min wage cost pressure. Default 0.50. Range: 0-1. */
  wageAutomationSensitivity?: number;

  // Demand Spillover (Phase 3c.1 fix)
  /** Tolerance band for demand shortfalls before employment is reduced. Default 0.03 (3%).
   *  Businesses absorb small demand dips (labor hoarding) before laying off workers.
   *  Source: Biddle (2014), Faberman & Lazear (2022) — labor hoarding literature. Range: 0-0.10. */
  demandSpilloverTolerance?: number;

  // Credit Deflation (Phase 5g Step 10)
  /** Sensitivity of price level to credit contraction. Default 0.04. Range: 0-1. */
  creditDeflationSensitivity?: number;

  // Sector Scarcity Inflation (Phase 5g Step 11)
  /** Fraction of sector labor scarcity passed through to prices. Default 0.30. Range: 0-1. */
  scarcityPassThrough?: number;

  // Labor Supply Response (Phase 5g Step 12)
  /** Elasticity of participation to UBI replacement rate. Default 0.15. Range: 0-1. */
  participationElasticity?: number;
  /** Replacement rate threshold for voluntary withdrawal. Default 0.60. Range: 0-1. */
  participationThreshold?: number;

  // Phase 5i: Housing, Shelter Inflation & Mortgage Stress
  /** Business credit GDP sensitivity. Default 5.0. Range: 0-15. */
  businessCreditGDPSensitivity?: number;
  /** Max business credit loosening cap. Default 0.30. Range: 0-1.0. */
  maxBusinessCreditLoosening?: number;
  /** Shelter CPI weight. Default 0.36. Range: 0.20-0.50. */
  shelterCPIWeight?: number;
  /** Shelter inflation stickiness. Default 0.80. Range: 0-1.0. */
  shelterInflationStickiness?: number;
  /** Mortgage stress amplifier. Default 0.40. Range: 0-2.0. */
  mortgageStressAmplifier?: number;
  /** Foreclosure lag in years. Default 0.75. Range: 0-3.0. */
  foreclosureLag?: number;
  /** Homeownership recovery rate (annual). Default 0.02. Range: 0-0.10. */
  homeownershipRecoveryRate?: number;
  /** Housing wealth MPC. Default 0.05. Range: 0-0.15. */
  housingWealthMPC?: number;
  /** MPC wage UE sensitivity (precautionary saving). Default 0.005. Range: 0-0.05. */
  mpcWageUESensitivity?: number;
  /** Credit adoption sensitivity. Default 0.15. Range: 0-0.5. */
  creditAdoptionSensitivity?: number;

  // Housing Market Stabilization
  /** Fraction of foreclosed homes purchased by institutional investors. Default 0.40. Range: 0-1.0.
   *  Source: CoreLogic, Amherst Capital (2012-2015): institutional purchases 20-40% of foreclosed inventory. */
  institutionalBuyerRate?: number;
  /** How much rental demand from displaced homeowners pushes up shelter costs. Default 0.50. Range: 0-1.0.
   *  Source: Glaeser & Gyourko (2018): housing tenure switch literature. */
  rentalDemandSensitivity?: number;
  /** Maximum annual shelter deflation rate (land scarcity floor). Default -0.05. Range: -0.15 to 0.
   *  Represents land scarcity + construction cost floor. -5%/yr ≈ 60% of value after 10yr max deflation. */
  shelterInflationFloor?: number;

  // Investment Demand Constraint — market-signal gating of AI investment
  /** How much low AI utilization discourages new AI investment. 0=ignored, 50=moderate, 100=aggressive.
   *  Maps to exponent: val/100 × 3.0. Default 50. Source: Novel — no historical AI precedent. */
  aiUtilizationSensitivity?: number;           // 0-100, default 50
  /** How much weak consumer demand discourages AI investment. 0=ignored, 50=moderate, 100=aggressive.
   *  Maps to exponent: val/100 × 3.0. Default 50. Source: Accelerator principle (Samuelson 1939). */
  consumerDemandInvestmentSensitivity?: number; // 0-100, default 50
  /** How much credit conditions affect AI investment. 0=ignored, 50=moderate, 100=aggressive.
   *  Maps to exponent: val/100 × 3.0. Default 50. Source: Fed SLOOS lending conditions surveys. */
  creditInvestmentResponseSensitivity?: number; // 0-100, default 50
  /** How much consumer demand affects traditional (non-AI) business investment.
   *  Maps to exponent: val/100 × 3.0. Default 30. Source: BEA investment-output ratio cyclicality. */
  traditionalInvestmentDemandSensitivity?: number; // 0-100, default 30
  /** Traditional private fixed investment as fraction of GDP.
   *  Default 0.175 (from BEA NIPA Table 1.1.5). Range: 0.05-0.40. */
  traditionalInvestmentGDPFraction?: number;    // 0.05-0.40, default 0.175

  // ═══ Phase 6: Separated Consumer & Business Credit ═══
  /** Bank trust in transfer income for underwriting. 0.50=new UBI, 0.95=established. Default 0.70. */
  transferReliabilityWeight?: number;       // 0.30-0.95
  /** Income deficiency → consumer credit tightening. Default 2.0. */
  incomeAdequacySensitivity?: number;       // 0.5-5.0
  /** Falling home prices → mortgage credit tightening. Default 1.0. */
  collateralSensitivity?: number;           // 0.0-3.0
  /** CWI decline → systemic portfolio risk tightening. Default 1.5. */
  systemicRiskSensitivity?: number;         // 0.5-4.0
  /** Inflation above 3% → preemptive credit tightening. Default 0.5. */
  inflationRiskSensitivity?: number;        // 0.0-2.0
  /** Maximum consumer credit restriction. Default 0.5. */
  maxConsumerTightening?: number;           // 0.2-1.0
  /** Consumer credit tightening → consumption reduction. Default 0.06. */
  consumerCreditImpact?: number;            // 0.02-0.15
  /** Profit decline → business credit tightening. Default 1.5. */
  profitabilitySensitivity?: number;        // 0.5-4.0
  /** GDP growth → business credit loosening. Default 2.0. */
  growthTrajectorySensitivity?: number;     // 0.5-5.0
  /** Maximum business credit restriction. Default 0.5. */
  maxBusinessTightening?: number;           // 0.2-1.0
  /** Business credit tightening → investment reduction. Default 0.15. */
  businessInvestmentImpact?: number;        // 0.05-0.30

  // Income Distribution (Median CWI reporting metric)
  /** Share of aggregate wage income reaching bottom 80% of households. Default 0.45. Range: 0.20-0.70. */
  bottom80WageShare?: number;
  /** Share of transfer income reaching bottom 80% of households. Default 0.78. Range: 0.50-1.00. */
  bottom80TransferShare?: number;
  /** Share of capital/asset income reaching bottom 80% of households. Default 0.12. Range: 0.01-0.50. */
  bottom80AssetShare?: number;

  // ═══ Tax & Economic Pipeline (Phase 5-tax) ═══

  /** Tax configuration — 4 decomposed federal channels. Default: from BEA data. */
  taxConfig?: TaxConfig;
  /** Post-tax MPCs. Default: { wage: 0.95, asset: 0.42, transfer: 0.95 }. */
  postTaxMPCs?: PostTaxMPCs;
  /** AI cost decomposition params. Default: inference=-0.45, mfg=-0.10, energy=-0.03. */
  aiCostParams?: AICostParams;
  /** Corporate retention rate (fraction of after-tax profits retained). Default ~0.40 from BEA. Range 0-1. */
  corporateRetentionRate?: number;
  /** AI market power / profit growth rate. Default 2.0. Range 0.5-10.0. */
  aiProfitGrowthRate?: number;

  // ═══ Phase 7: Fiscal-Monetary Parameters ═══
  // DEPRECATED Phase 8 Fix 4: Taylor coefficients moved to FederalReserveProfile (per-year overridable via YearParameters).
  // taylorInflationCoeff?: number;
  // taylorOutputGapCoeff?: number;
  /** Fed's inflation target. Default 0.02 (2%). Range: -0.02 to 0.10. */
  inflationTarget?: number;
  /** Effective lower bound for policy rate before QE triggers. Default -0.005 (-0.5%). Range: -0.05 to 0.01. */
  effectiveLowerBound?: number;
  /** Debt service/revenue ratio that triggers fiscal dominance. Default 0.25. Range: 0.05-0.60. */
  fiscalDominanceThreshold?: number;
  /** How paralyzed Fed becomes under fiscal dominance (0=none, 1=fully stuck). Default 0.5. Range: 0-1. */
  fiscalDominanceDampening?: number;
  // DEPRECATED Phase 8 Fix 4: Replaced by fiscalRiskLevelMidpoint (trajectory-based composite model).
  // fiscalRiskPremiumMidpoint?: number;
  /** Maximum fiscal risk premium in decimal. Default 0.06 (600bp). Range: 0.01-0.10. */
  fiscalRiskPremiumMax?: number;
  /** Share of corporate profits actually taxed (statutory × effectiveness). Default 0.65. Range: 0.10-1.00. */
  corporateTaxEffectiveness?: number;
  /** Foreign buyers' share of US Treasuries. Default 0.30. Range: 0.05-0.60. */
  foreignTreasuryDemand?: number;
  /** Market premium for AI earnings at peak hype. 1.0 = rational. Default 1.0. Range: 0.5-3.0. */
  aiPEMultiplier?: number;
  /** How much deficit Fed monetizes during QE. Default 0.40. Range: 0-0.80. */
  qeMonetizationRate?: number;
  /** Phase 8 fix: Max risk premium reduction from fiscal consolidation effort. Default 0.40. Range: 0-0.80. */
  consolidationCreditMax?: number;
  // ═══ Phase 8 Fix 3: Bond market absorption capacity ═══
  /** Overall scaling of bond supply pressure. Default 1.0. Range: 0.3-3.0. */
  supplyPressureSensitivity?: number;
  /** How strongly equity drops boost Treasury demand (flight to safety). Default 1.5. Range: 0.0-3.0. */
  safetyFlightSensitivity?: number;
  /** Yield level for half-strength buyer self-correction. Default 0.06. Range: 0.03-0.15. */
  yieldAttractionMidpoint?: number;
  /** How strongly inflation deters bond buyers. Default 1.0. Range: 0.0-2.0. */
  inflationDeterrentSensitivity?: number;
  /** How fast sovereign confidence erodes with deteriorating fiscal trajectory. Default 2.0. Range: 0.5-5.0. */
  sovereignConfidenceDecayRate?: number;
  // ═══ Phase 8 Fix 3: Endogenous debt maturity ═══
  /** Baseline Treasury debt maturity in years. Default 6.0. Range: 3.0-10.0. */
  baseWeightedAverageMaturity?: number;
  /** Minimum maturity under extreme stress. Default 2.5. Range: 1.5-4.0. */
  minWeightedAverageMaturity?: number;
  /** Maximum maturity under favorable conditions. Default 8.0. Range: 6.0-12.0. */
  maxWeightedAverageMaturity?: number;
  /** How aggressively fiscal stress shortens maturity. Default 1.0. Range: 0.3-3.0. */
  maturityStressSensitivity?: number;
  // ═══ Phase 8 Fix 3: Monetization transmission ═══
  /** Scales the composition-weighted transmission to inflation. Default 1.0. Range: 0.3-2.0. */
  monetizationTransmissionSensitivity?: number;
  /** Year-by-year policy rate override using existing PolicySchedule type. */
  policyRateSchedule?: PolicySchedule;

  // ═══ Phase 8 Fix 4: Yield calibration ═══
  /** Neutral real interest rate (r*). Default 0.007 (0.7%). Source: NY Fed Laubach-Williams. Range: -0.01-0.03. */
  neutralRealRate?: number;
  /** Term premium for 10Y yield. Default 0.003 (30bp). Source: NY Fed ACM model. Range: -0.01-0.02. */
  termPremium?: number;
  /** Years for inflation expectations to converge to target. Default 5. Range: 2-15. */
  inflationConvergenceYears?: number;

  // ═══ Phase 8 Fix 4: Fiscal risk premium weights (trajectory-based composite) ═══
  /** Weight on debt/GDP rate-of-change component. Default 0.50. Range: 0-1. */
  fiscalRiskTrajectoryWeight?: number;
  /** Weight on r-vs-g sustainability component. Default 0.35. Range: 0-1. */
  fiscalRiskSustainabilityWeight?: number;
  /** Weight on absolute debt/GDP level component. Default 0.15. Range: 0-1. */
  fiscalRiskLevelWeight?: number;
  /** Debt/GDP midpoint for level sigmoid. Default 2.0. Range: 1.0-3.0. */
  fiscalRiskLevelMidpoint?: number;
  /** Debt/GDP change rate where trajectory risk hits 50% of max. Default 0.15. Range: 0.05-0.25.
   *  Source: Empirical — US has sustained +6pp/year for a decade with ~0bp trajectory premium. */
  fiscalRiskTrajectoryMidpoint?: number;

  // DEPRECATED: phillipsCurveWageSensitivity — wage growth chain removed (caused hyperinflation).
  // Phillips curve effect handled by computeWagePressure() with config.phillipsCurveSensitivity.
  // phillipsCurveWageSensitivity?: number;

  // ═══ Phase 8 Fix 5: Housing Price Model ═══
  /** Mortgage rate change → home price elasticity. Default 4.0. Range: 1.0-8.0.
   *  Source: Glaeser et al. (2012) "Can Cheap Credit Explain the Housing Boom?" */
  affordabilityPriceSensitivity?: number;
  /** Real income growth → home price elasticity. Default 0.5. Range: 0.1-1.5.
   *  Source: Mian & Sufi (2009) "The Consequences of Mortgage Credit Expansion." */
  incomeHousingElasticity?: number;
  /** How fast prices revert to affordability equilibrium. Default 0.15. Range: 0.05-0.40.
   *  Source: Case & Shiller (1989) "The Efficiency of the Market for Single-Family Homes." */
  affordabilityReversionSensitivity?: number;
  /** How much weaker downward price reversion is vs upward (1.0 = symmetric). Default 0.5. Range: 0.2-1.0.
   *  Source: Glaeser & Gyourko (2005) "Urban Decline and Durable Housing." */
  downwardStickinessRatio?: number;
  /** Population growth → home price demand elasticity. Default 1.0. Range: 0.3-2.0.
   *  Source: Mankiw & Weil (1989) "The Baby Boom, the Baby Bust, and the Housing Market." */
  demographicHousingElasticity?: number;

  // ═══ Phase 8 Fix 4: Independent fiscal + Fed presets ═══
  /** Fiscal policy preset name. Default 'balanced_reduction'. */
  fiscalPolicyPreset?: string;
  /** Federal Reserve preset name. Default 'balanced_mandate'. */
  federalReservePreset?: string;
  /** Custom fiscal policy overrides (merged on top of preset). */
  fiscalPolicyCustom?: Partial<import('@/models/fiscalResponseProfiles').FiscalPolicyProfile>;
  /** Custom Federal Reserve overrides (merged on top of preset). */
  federalReserveCustom?: Partial<import('@/models/fiscalResponseProfiles').FederalReserveProfile>;

  // DEPRECATED Phase 8 Fix 4: Replaced by independent fiscalPolicyPreset + federalReservePreset.
  // ═══ Phase 8a: Fiscal Response Profile ═══
  // /** Fiscal response preset name. Default 'balanced_pragmatism'. */
  // fiscalResponseProfile?: string;
  // /** Custom fiscal response overrides (merged on top of preset). */
  // fiscalResponseCustom?: Partial<import('@/models/fiscalResponseProfiles').FiscalResponseProfile>;

  // ═══ Phase 9: Supply Chain Uncertainty ═══
  /** Supply chain configuration. undefined = no supply chain = perfect NO-OP.
   *  All inputs at 100 = baseline (no constraint). */
  supplyChainConfig?: import('./supplyChain').SupplyChainConfig;

  // ═══ Phase 8b: Per-Year Parameter Overrides ═══
  /** User per-year parameter overrides (serializable). Key format: "paramName:year". */
  parameterOverrides?: Record<string, number>;

  // ═══ Phase 10.A: Alpha, Augmentation, Scarcity, Inference Curve ═══
  /** Weights + activation parameters for the 5 α drivers. */
  alphaDriverParams?: AlphaDriverParams;
  /** Steepness of the augmentation adoption S-curve. Default 0.8. */
  augmentationAdoptionSteepness?: number;
  /** Intensity of AI-displacement scarcity premium in Phillips Mechanism 2. Default 0.4. */
  scarcityIntensity?: number;
  /** Adoption rate above which competitive pressure kicks in; overrides DEFAULT_COMPETITIVE_PRESSURE_THRESHOLD. */
  competitivePressureThreshold?: number;
  /** Productivity multiplier at full capability and full Better score (AI-replacement mode). Default 2.0. */
  replacementMultiplier?: number;
  // DEPRECATED (Phase 10.A fix #2): global maxAdoptionFrictionYears removed.
  // Friction is now expressed directly in years per role via role.aiReplacementFrictionYears,
  // eliminating the two-knob structure and the arbitrary global scaling layer.
  // maxAdoptionFrictionYears?: number;
  /** Per-cluster automationShare override (runtime user setting). Keyed by cluster.id. */
  clusterAutomationShareOverrides?: Record<string, number>;
  /** Per-role automationShare override. Keyed by cluster.id → role.id. */
  roleAutomationShareOverrides?: Record<string, Record<string, number>>;
  /** Per-role aiReplacementFrictionYears override. Keyed by cluster.id → role.id. Unit: years. */
  roleReplacementFrictionYearsOverrides?: Record<string, Record<string, number>>;
  /** Per-role aiReplacementDifficultyWagePremium override. Keyed by cluster.id → role.id. */
  roleReplacementDifficultyWagePremiumOverrides?: Record<string, Record<string, number>>;
}

export interface ClusterParameterOverride {
  generativeWeight: number;
  agenticWeight: number;
  embodiedWeight: number;
  deploymentLag: number;
  adoptionSteepness: number;
  adoptionCeiling: number;
  deflationIntensity: number;
  wageElasticity: number;
  maxProductivityMultiplier: number;  // Phase 2: AI output ratio (default by deploymentType)
}

export interface SimulationTimeline {
  config: SimulationConfig;
  years: SimulationYearOutput[];
  depressionOnsetYear: number | null;
  // Phase 8b: Per-year parameter provenance (populated when userOverrides are passed)
  parameterTimeline?: Map<number, YearParameters>;
  // Phase 8b: Snapshots for restart-from-year (Phase 8c UI efficiency)
  yearSnapshots?: Map<number, YearSnapshot>;
  // Two-part policy window (Phase 5 Cleanup)
  prepWindowOpen: number | null;       // First year UE rate > baseline + 1pp
  prepWindowClose: number | null;      // First year of ACCELERATING_DECLINE
  prepWindowDuration: number | null;
  fiscalWindowOpen: number | null;     // First year AI GDP contribution > $500B
  fiscalWindowClose: number | null;    // First year nomGDP < 80% of peak
  fiscalWindowDuration: number | null;
  gdpPeakYear: number | null;         // Year of peak nominal GDP
  gdpPeakValue: number;               // Peak nominal GDP value
  cycleStartYear: number | null;       // First year of 3+ consecutive CWI decline
  valleyFloorYear: number | null;      // Year of minimum CWI
  valleyFloorCWI: number;              // Minimum CWI value
  valleyDepthPct: number;              // % decline from peak CWI to valley
  recoveryYear: number | null;         // First year CWI grows after valley
  monetaryCollapseYear: number | null; // Year when priceLevel hit MAX_PRICE_LEVEL cap (simulation frozen)
  summary: SimulationSummary;
}

export interface SimulationYearOutput {
  year: number;
  capabilities: Record<CapabilityVectorId, number>;  // capability scores at this year
  clusters: ClusterDisplacementResult[];
  macro: MacroOutput;
  monetary: MonetaryState;
  states?: StateOutput[];        // optional — only if state data loaded
  fiscalMonetary?: FiscalMonetaryOutput;  // Phase 7: optional until simulation integration
  policyEffects: PolicyEffects;
  // Phase 8a: Real demand ratios (deflated by price level)
  realConsumerDemandRatio: number;
  realGovDemandRatio: number;
  realBusinessDemandRatio: number;
}

export interface PolicyEffects {
  wageChannelAddition: number;
  assetChannelAddition: number;
  transferChannelAddition: number;
  totalPolicyIncome: number;
  fiscalCost: number;            // total cost of all active policies (includes SWF contribution)
  fiscalCostAsPercentGDP: number;
  sovereignFundSize: number;
  swfAnnualContribution: number; // billions — government outlay to SWF (Phase 5h Fix 5)
  requiredAssetOwnership: number;  // to maintain baseline CWI
  requiredTransferLevel: number;   // to maintain baseline CWI
}

export interface SimulationSummary {
  peakEmployment: { year: number; value: number };
  minimumEmployment: { year: number; value: number };
  depressionOnsetYear: number | null;
  peakGDP: { year: number; value: number };
  minimumGDP: { year: number; value: number };
  maxUnemploymentRate: { year: number; value: number };
  policyPreventsDepression: boolean;
  // Two-part policy window (Phase 5 Cleanup)
  prepWindowOpen: number | null;
  prepWindowClose: number | null;
  prepWindowDuration: number | null;
  fiscalWindowOpen: number | null;
  fiscalWindowClose: number | null;
  fiscalWindowDuration: number | null;
  gdpPeakYear: number | null;
  gdpPeakValue: number;
  cycleStartYear: number | null;
  valleyFloorYear: number | null;
  valleyFloorCWI: number;
  valleyDepthPct: number;
  recoveryYear: number | null;
}

// ============================================================
// 10. BLS Data Types
// ============================================================

export interface BLSTimeSeries {
  seriesId: string;
  data: BLSDataPoint[];
  catalog?: BLSCatalog;
}

export interface BLSDataPoint {
  year: string;
  period: string;
  periodName: string;
  value: string;
  footnotes: Array<{ code: string; text: string }>;
}

export interface BLSCatalog {
  seriesTitle: string;
  seasonality: string;
  surveyName: string;
  measureDataType: string;
  areaName: string;
  industryName: string;
  occupationName: string;
}

export interface BLSApiResponse {
  status: 'REQUEST_SUCCEEDED' | 'REQUEST_NOT_PROCESSED';
  responseTime: number;
  message: string[];
  Results: {
    series: BLSTimeSeries[];
  };
}

export interface OccupationBaseline {
  clusterId: OccupationClusterId;
  totalEmployment: number;
  roles: Record<string, {
    estimatedEmployment: number;
    medianWage: number;
    meanWage: number;
    wagePercentiles: {
      p10: number;
      p25: number;
      p75: number;
      p90: number;
    };
  }>;
  stateDistribution: Record<StateCode, number>;
  blsDataYear: string;
}

// ============================================================
// 11. BLS Data Loading Types
// ============================================================

/**
 * Metadata from the BLS data fetch script (src/data/bls/metadata.json).
 * Tracks when data was fetched, what range it covers, and its source.
 */
export interface BLSMetadata {
  fetchedAt: string;
  startYear: string;
  endYear: string;
  clusterCount: number;
  totalSeriesFetched: number;
  source: string;
  notes: string;
}

// ============================================================
// 12. Dashboard Navigation (Phase 4)
// ============================================================

export type DashboardView = 'overview' | 'economics' | 'policy' | 'fiscal' | 'occupations' | 'monetary' | 'methodology' | 'predictions';

// ============================================================
// 13. BFCS Editor Types (Phase 4)
// ============================================================

/**
 * Per-role BFCS score snapshot for the BFCS Editor UI.
 * Includes both current scores and effective thresholds, plus metadata
 * about whether the user has overridden defaults.
 */
// ============================================================
// 14. Scenario Save/Load Types (Phase 7)
// ============================================================

/**
 * A named, saved simulation configuration.
 * Stored in localStorage and shareable via URL or JSON export.
 */
export interface SavedScenario {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  config: SimulationConfig;
}

// ============================================================
// 15. Presentation Mode Types (Phase 7)
// ============================================================

/**
 * A single presentation slide with a title, narrative annotation,
 * and the chart content identifier to render.
 */
export interface PresentationSlide {
  id: string;
  title: string;
  narrative: string;
  content: 'metrics' | 'employment' | 'gdp' | 'newJobs' | 'occupations' | 'stateMap';
}

export interface BFCSRoleScoreSnapshot {
  clusterId: string;
  roleId: string;
  roleLabel: string;
  scores: BFCSScores;                 // current AI BFCS scores at currentYear
  thresholds: BFCSThresholds;         // effective thresholds (with overrides applied)
  defaultThresholds: BFCSThresholds;  // original thresholds from occupationClusters.ts
  triggered: boolean;                 // all four met?
  triggerYear: number | null;         // when does/did it trigger?
  isOverridden: boolean;              // has user modified thresholds for this role?
}
