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
  // DEPRECATED (Stage H): dead on the simulation path (superseded by tokenCostCurve; economic trace inert, Audit B-5); UI control removed; guarded by stageH-honesty.test.ts.
  inferenceAnnualChange: number;      // default -0.45, range -0.80 to +0.50
  manufacturingAnnualChange: number;  // default -0.10, range -0.50 to +0.50
  energyAnnualChange: number;         // default -0.03, range -0.50 to +0.50
  composition?: Record<DeploymentType, AICostComposition>;
  /** Floored decay curve for the cost-per-token of AI work. */
  tokenCostCurve?: TokenCostCurveParams;
  /** RETIRED (coupled design checkpoint, mini-stage 1; Amendment 2 — no legacy toggles):
   *  the global tokens-per-task multiplier/schedule is replaced by the frontier-intensity
   *  layer below; the aggregate tokens-per-task path is an emergent OUTPUT
   *  (MacroOutput.impliedAggregateTokensPerTask). No path reads this field (probe-guarded);
   *  kept per the no-delete rule. */
  tokenUsageMultiplier?: number;
  /** Frontier tokens-per-task multiple at the 2026 anchor. Default 20 (the observed
   *  reasoning-class jump; cited table with the data refresh). Range 1-100. */
  frontierIntensityLevel?: number;
  /** Annual frontier-intensity growth post-anchor. Default +0.05/yr (owner-ruled middle
   *  path, honest-flagged). Range −0.15 to +0.40; absolute frontier per-task cost climbs
   *  only when this exceeds the per-token decline (~26%/yr early). */
  frontierIntensityGrowth?: number;
  /** σ: capability surplus at which frontier reliance halves (w = 2^(−s/σ)). Default 0.15.
   *  Range 0.02-1.0. Uncited structural dial; per-band batteries bound it. */
  sigmaMigration?: number;
  /** Always-frontier task residue (floor on w). Default 0. Range 0-0.5. Uncited. */
  wMinFrontierFloor?: number;
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
  /** Mini-stage 1: first year Better ≥ B* (the frontier reaching the role's requirement) —
   *  the anchor of the role's fixed-capability cost curve. Distinct from triggerYear. */
  betterArrivalYear?: number | null;
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
  /** Production Program Stage 2 (Channel 2): the VA-anchored potential CEILING —
   *  Σ_c VA_c × BFCSClearance_c × EmbodimentGate_c (the checkpoint §2 formula; the
   *  emitted legs above track REALIZED automation and are asserted ≤ this). */
  aiPotentialCeiling?: number;
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
  // DEPRECATED (Stage 5 / H3): transferGrowthPerUEPoint retired — incremental transfer spending is
  // now derived from the per-person CASH + IN-KIND constants × incremental unemployed headcount.
  // transferGrowthPerUEPoint: number;
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
/** PRODUCTION PROGRAM STAGE 1 — the buildout's per-year telemetry (the checkpoint §0
 *  contract: the user sees WHICH sink throttled the believed trajectory and WHEN).
 *  Computed by computeBuildoutPlan (buildout.ts); echoed onto MacroOutput. */
export interface BuildoutTelemetry {
  /** DC capacity requirement, 2025-required units (K_required). */
  dcRequired: number;
  /** Fleet requirement, units. Stage 2: DERIVED from cleared embodied cluster work
   *  (t−1 ledger state × unitsPerEmbodiedWorker), no longer the retired [hu] scale. */
  fleetRequired: number;
  /** Stage 2 (the embodiment gate's §0 surface); STAGE 4 MS4 (the per-cluster
   *  supersession, the ratified design §3): now the REQUIREMENT-WEIGHTED MEAN of
   *  the per-cluster coverages; 1 when no cluster carries a requirement. */
  fleetCoverage?: number;
  /** Stage 4 MS4 (the ratified design §3's telemetry): per-cluster fleet coverage
   *  min(1, allocated / required) over clusters with a live requirement — the ONE
   *  series both the displacement gate and the ledger gate consume. */
  fleetCoverageByCluster?: Record<string, number>;
  /** Stage 2 (T-A): the derived time-varying training share of compute demand this
   *  year (RL rollout inside the slice — TRAINING_SHARE_DERIVATION.md). */
  trainingShare?: number;
  /** Stage 3 (MS3 — ruling v): the equity-issuance financing leg this year, nominal $
   *  (ι × the t−1 implied AI market cap × the t−1 issuance window). */
  equityIssuance?: number;
  /** Stage 3 (MS3): the issuance window [0, 1] (1 = open; closes on the crisis
   *  equity premium — the episode-anchored shutdown). */
  issuanceWindow?: number;
  /** Stage 3 (MS2 — the import-content fix, owner ruling vi): the allocation-weighted
   *  import-content share of this year's buildout spend. */
  importShare?: number;
  /** Stage 3 (MS2): the import leakage subtracted from net exports, nominal $ —
   *  importShare × the machine's realized spend above the baseline-embedded path
   *  (0 when the delta is ≤ 0; identically 0 on the zero-AI path). */
  importLeakage?: number;
  /** Post-shock effective DC capacity. STAGE 5A (A2): the INTEGRATED capacity —
   *  min(chips, energy × FLOPs/W, dc) + the orbital stock. */
  capacityDc: number;
  /** Stage 5A (A2): the terrestrial min alone (the opex line's capacity basis —
   *  orbital carries its own power). Present when the machine is live. */
  capacityTerrestrial?: number;
  /** Stage 5A (A2): the orbital capacity stock, 2025-required units. Present when
   *  nonzero (arrival-event content; absent on the default and zero-AI paths). */
  orbitalStock?: number;
  // ═══ STAGE 5A (A1 + E1) — the energy queue's per-year state (present when the
  //     machine is live; UNDEFINED on the zero-AI path — trace hygiene, EB-8) ═══
  /** Pending grid-lane units (pipeline + carryover) at the start of the year. */
  energyPending?: number;
  /** Pending express-lane (behind-the-meter) units at the start of the year. */
  energyBtmPending?: number;
  /** The annual additions ceiling, units/yr, at the start of the year. */
  energyCeiling?: number;
  /** Grid-lane units delivered at this year's advance (ceiling-gated). */
  energyDelivered?: number;
  /** Express-lane units delivered at this year's advance (bypasses the ceiling). */
  energyBtmDelivered?: number;
  /** Matured-but-ceiling-blocked units carried forward after this year's advance. */
  energyCarryover?: number;
  /** Stage 5A (A3): the AI sector's energy operating cost this year, nominal $ —
   *  seamRate × utilizedCompute(t−1 utilization × terrestrial capacity) ×
   *  (1/FLOPs-per-watt norm) × the p_energy index. Enters the AI profit identity. */
  energyOpex?: number;
  /** min(1, capacityDc / dcRequired); 1 at zero requirement. The flywheel's u_supply. */
  supplyRatio: number;
  /** Buildout demand spend (required spend), nominal $. */
  demandSpend: number;
  /** Financeable buildout budget, nominal $. */
  financeable: number;
  /** I_AI pre-gate = min(demand, financeable), nominal $. */
  investmentPregate: number;
  /** I_AI as it entered GDP (post the unified credit/capacity/rate gates), nominal $. */
  investmentRealized: number;
  /** F = financed/required; ≡ 1 at zero required spend (ratification A3). */
  fundingRatio: number;
  /** The binding sink this year ('none' when every requirement is met). */
  bindingSink: 'chips' | 'energy' | 'dc' | 'fleet' | 'none';
  /** Stocks at the START of the year (pre-build), capacity units / units. */
  stockChips: number;
  stockEnergy: number;
  stockDc: number;
  fleetUnits: number;
  /** Units added to the fleet this year (the A5 triple-min outcome). */
  fleetAdd: number;
  /** The manufacturing ramp ceiling, units/yr. */
  mfgRampCapacity: number;
  /** The smoothed allocation shares used this year (sum 1). */
  allocChips: number;
  allocEnergy: number;
  allocDc: number;
  allocFleet: number;
}

export interface MacroInputs {
  /** Current simulation year */
  year: number;
  /** Ruling 2 (D1): the one discount-rate producer's crisis excess (the F1a dynamic
   *  ERP component, read off the same-year equity state) — the sector valuation legs'
   *  discount term. 0 in calm regimes and identically 0 on the zero-AI path. */
  erpCrisisComponent?: number;
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

  // ═══ PRODUCTION PROGRAM STAGE 1 — Channel 1 (the buildout) ═══
  /** The buildout machine's PRE-GATE investment demand this year, nominal $
   *  (I_AI = min(BuildoutDemand, Financeable), computed in the simulation loop).
   *  UNDEFINED ⇒ the machine is not live for this run and the baseline capex
   *  partition's delta is exactly 0 (bit-identity — PB-1 Leg A). 0 on the zero-AI
   *  twin ⇒ the delta is −(the baseline-embedded AI capex path): the ruled level
   *  shift of "a world in which the AI buildout never happened" (ratification A2;
   *  PB-1 Leg B). */
  aiBuildoutInvestmentDemand?: number;
  /** The buildout plan's telemetry, echoed onto MacroOutput (the §0 gate-telemetry
   *  contract: per-year per-sink binding attribution on the output surface). */
  buildoutTelemetry?: BuildoutTelemetry;
  /** The baseline-embedded AI capex share of GDP the partition subtracts (default:
   *  AI_CAPEX_BASELINE_SHARE). Overridden coherently with config.aiBuildoutSeamAnchor
   *  so the PB-1 sensitivity moves seam and partition together. */
  aiBuildoutBaselineShare?: number;

  /** Stage 3 (MS2 — the import-content fix): the allocation-weighted import-content
   *  share of the buildout's spend this year (from the plan's allocUsed × the cited
   *  per-sink shares). Default: the seam-composition constant. */
  aiBuildoutImportShare?: number;

  /** STAGE 5A (A3 + E2): the AI sector's energy operating cost this year, nominal $
   *  (computed in the loop: seam rate × t−1 utilization × terrestrial capacity ×
   *  (1/FLOPs-per-watt norm) × the p_energy index, which carries the N1 energy
   *  trend, the supply-chain energy-PRICE shock, and the event cost bends — the E2
   *  wire). Subtracted in the AI profit identity with the wedge carve-out (the
   *  no-double-count residual). UNDEFINED/0 ⇒ inert (zero-AI, unit tests). */
  aiEnergyOpex?: number;

  // ═══ PRODUCTION PROGRAM STAGE 3 — MS4 Channel 3 (corporate R&D) ═══
  /** The AI-era R&D investment demand this year, nominal $ (intensity × the t−1
   *  realized AI revenue; computed in the loop). Rides the ONE investment pipeline. */
  aiRdSpendDemand?: number;
  /** The R&D productivity flow this year (Δln(RD_stock) × the cited elasticity,
   *  SIGNED — de-accumulation reflates), entering the non-shelter sector inflations
   *  through the existing pass-through assembly. */
  aiRdDeflationFlow?: number;

  // ═══ PRODUCTION PROGRAM STAGE 2 — elasticity-based absorption (order item 4) ═══
  /** Own-price elasticity magnitudes per consumption sector (defaults: the cited
   *  constants). Shelter is excluded by declared boundary (its AI price channel is
   *  the housing supply response). */
  absorptionElasticityAiExposed?: number;
  absorptionElasticityLaborServices?: number;
  absorptionElasticityFoodEnergy?: number;

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
  /** Pass-through: impulse sensitivity (above-floor Δ-tightening; [e]-derived, A8-laddered). */
  creditDeflationImpulseSensitivity?: number;
  /** Pass-through: impulse persistence κ ([e], GR episode-anchored). */
  creditDeflationPersistence?: number;
  /** Pass-through: the credit noise floor ([e]-measured band boundary). */
  creditDeflationNoiseFloor?: number;
  /** D1 fix F1a: ERP crisis sensitivity ([e]-derived, Damodaran 2008-09 step over the banded tightening signal). */
  erpCrisisSensitivity?: number;
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
  /** Stage 1: sectoral price architecture params (forwarded from SimulationConfig). */
  aiExposedCPIWeight?: number;
  laborServicesCPIWeight?: number;
  foodEnergyCPIWeight?: number;
  /** Fraction of AI cost savings passed to consumer prices in AI-exposed sectors. */
  aiDeflationPassthrough?: number;
  /** Labor cost share for the labor-intensive-services Baumol channel. */
  laborCostShare?: number;
  /** Stage 1.5: per-consumption-sector AI deflation RATES, routed from clusters (R10 mapping). */
  sectorDeflationByConsumption?: { aiExposed: number; laborServices: number; foodEnergy: number; shelter: number };
  /** Pass-through (ruling 4): the per-leg savings levels for the traced decomposition. */
  aiSavingsLevelReplacement?: number;
  aiSavingsLevelAugmentation?: number;
  /** Stage 1.5: embodied-AI passthrough per sector (fraction reaching prices, net of regulation). */
  laborServicesPassthrough?: number;
  foodEnergyPassthrough?: number;
  shelterPassthrough?: number;
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
  /** Aggregate equity market return for capital gains. The simulation loop passes the
   *  equity module's return unconditionally; the old profit-growth-proxy fallback arm was
   *  retired LOUD (H3 rider F6b) — absent input throws when the blend is consulted. */
  marketReturn?: number;
  /** H3 ruling 2: the same-year ZERO-AI COUNTERFACTUAL real consumption (the engine's twin
   *  run — same config, capabilities zeroed). The demand-health benchmark for AI consumer
   *  goods absorption. Absent on the twin itself and zero-capability runs (no AI production
   *  exists there); computeMacro throws if AI consumer potential > 0 and this is missing. */
  counterfactualRealConsumption?: number;
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
  /** Mini-stage 1: carries totalDeployerRealizedSavings (the one realized-cost object's
   *  diagnostic; the retired automation dividend's honest successor). Voided in macro's
   *  profit math (Stage-7 residual profits), recorded into MacroOutput.deployerRealizedSavings. */
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
  /** Stage 3: endogenous wage equation params (forwarded from SimulationConfig). */
  inflationIndexation?: number;
  productivityPassthrough?: number;
  phillipsSlope?: number;
  downwardWageRigidity?: number;
  /** Stage 5 (H3/OD-4): CASH support per incremental unemployed ($/person/yr → transfer income). */
  cashTransferPerUnemployed?: number;
  /** Stage 5 (H3/OD-4): IN-KIND support per incremental unemployed ($/person/yr → PCE directly). */
  inKindTransferPerUnemployed?: number;
  // Stage 6.5: stock-flow housing parameters (cited defaults in constants.ts)
  formationSensitivity?: number;
  headshipRecoveryRate?: number;
  housingSupplyElasticity?: number;
  embodiedCapacityGain?: number;
  housingDepreciationRate?: number;
  landShare?: number;
  constructionLaborShare?: number;
  landIncomeBeta?: number;
  landScarcityElasticity?: number;
  rentOccupancyElasticity?: number;
  rentCostAnchorWeight?: number;
  baselineCapRate?: number;
  capRateMortgageBeta?: number;
  capRateInvestorCompression?: number;
  fireSaleElasticity?: number;
  investorDemandIntensity?: number;
  /** E-6: land rate-sensitivity (%/yr per pp mortgage deviation). Default 0.75 (USDA ERS 1981-86; capitalization). 0 = rate-blind. */
  landRateSensitivity?: number;
  /** Stage 6.5: year-0 asset-income share (investor land bid baseline, OD-9b). */
  baselineAssetIncomeShare?: number;
  // Stage 7: residual corporate profits (Phase 10.B)
  otherCostsShare?: number;
  aiSectorLaborShare?: number;
  rentSharingElasticity?: number;
  secularProfitDriftRate?: number;
  // E-10: builder dynamics
  builderAdjustmentLambda?: number;
  housingPipelineDuration?: number;
  // E-11: the land residual closure
  landClosureKappa?: number;
  /** E-12: capRate reference override. Default = the derived same-date chain (~0.065); 0.06 = the legacy phantom (isolation toggle). */
  mortgageRateReference?: number;
  /** L9: landlord opex passthrough (NAA/IREM accounting share). Default 0.40; 0 = off (toggle). */
  opexPassthrough?: number;
  /** L9: one-sided nominal rent rigidity (Genesove; 2008-12-derived). Default 0.85; 0 = flexible (toggle). */
  rentDownwardRigidity?: number;
  /** L9b: the rent income/WTP elasticity θ. Default 0.47 (citation-first, 40-yr decomposition). 0 = off (toggle). Range 0.3-0.7. */
  rentIncomeElasticity?: number;
  /** LLAG diagnostic only. */
  // RETIRED (CO-D2, R3b): diagSpotBuilderPrice — builderPriceMode 'spot' is the dial.
  // diagSpotBuilderPrice?: boolean;
  /** L9c-3/4. */
  builderPriceMode?: 'spot' | 'trend-aware' | 'adaptive';
  /** L9c-1. */
  constructionCreditSensitivity?: number;
  // E-9: F-D anchor override + [α] formula effect
  nonShelterBaseInflation?: number;
  pceFormulaEffect?: number;
  // F4/OD-8 examination (E-1/E-2): expectation-family parameters
  creditExpectationTurnover?: number;
  creditBarRealTrend?: number;
  assetShareDriftRate?: number;
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
  realGDPGrowthRate: number;    // Phase 8a: real GDP growth (deflated by full composite; reporting)
  nonAIRealGDPGrowthRate: number; // Stage 2: nominal deflated by NON-AI prices — Loop 1 firewall input
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

  // AI revenue basis (H3: RETIRED FROM DISPLAY — the internal profit/UBI-indexing basis only.
  // Composition unchanged: raw investment leg + absorbed consumer goods + raw net-export leg.
  // It is NOT "AI's addition to GDP": the raw legs enter GDP only post-realization and the
  // absorbed leg reaches GDP only through the profits channel. Display consumers use the
  // split metrics below.)
  aiGDPContribution: number;      // AI revenue basis ($): raw investment + absorbed goods + raw net exports
  aiGDPContributionPct: number;   // aiGDPContribution / gdpNominal (DEPRECATED for display — basis-mixed)

  // H3 ruling 1 — THE SPLIT (one producer each, macro.ts):
  /** REALIZED AI SHARE OF GDP: strictly the AI dollars that entered GDP this year
   *  (investment leg × realization × credit × capacity × rate dampening; net-export leg ×
   *  realization; consumer leg only as absorbed-AND-added = zero direct entry under the
   *  ruled architecture), over nominal GDP. Commensurable by construction. */
  aiRealizedShareOfGDP: number;
  /** The realized numerator in nominal dollars (the exact GDP entries). */
  aiRealizedGDPContribution: number;
  /** AI OUTPUT POTENTIAL: total AI production expansion (real 2025$, trigger-time vintage
   *  valuation) over REAL GDP — the honest name for what the retired headline measured. */
  aiOutputPotentialShare: number;
  /** Production Program Stage 2 (Channel 2): the VA-anchored potential CEILING —
   *  Σ_c VA_c × BFCSClearance_c × EmbodimentGate_c, real 2025$-class (economy-indexed).
   *  The emitted expansion (aiAdditionalOutput) is asserted ≤ this (QB-1). */
  aiPotentialCeiling: number;
  /** Stage 3 MS3 (ruling v): the model-implied AI-sector market cap (the D1-guarded
   *  sector P/E × the realized AI profit base) — the equity-issuance leg's t−1
   *  pricing basis. Identically 0 on the zero-AI path. */
  aiMarketCapImplied: number;
  /** Stage 3 MS3: the ONE crisis-ERP producer's component, echoed (the issuance
   *  window reads it at t−1; no second producer — the echo pattern). */
  erpCrisisComponent: number;
  /** Stage 3 MS4 (Channel 3): the realized AI-era R&D spend this year, nominal $
   *  (the demand through the same unified gate chain — stamped by computeMacro). */
  aiRdSpend?: number;
  /** Stage 3 MS4: the corporate AI-era R&D stock, nominal $ (perpetual inventory;
   *  set by the loop post-advance). 0 on the zero-AI path. */
  aiRdStock?: number;
  /** Stage 3 MS4: the R&D productivity flow consumed this year (the input, echoed). */
  aiRdDeflationFlow?: number;
  
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
  /** Stage 2 (elasticity-based absorption): the SIGNED quantity called forth by the
   *  AI-attributable sector price flows at the cited elasticities (Σ_s C_s × ε_s ×
   *  deflationFlow_s, real 2025$) — joins the twin-benchmark absorption; negative
   *  under reflation (de-adoption legitimately shrinks absorption). */
  aiElasticityAbsorbed: number;
  aiGoodsAbsorbed: number;           // AI goods absorbed by demand = supply × demandHealthRatio
  // Worker augmentation channel
  totalAugmentationOutput: number;   // Total additional output from AI-augmented remaining workers
  augmentationWageBoost: number;     // Workers' share of augmentation → wage income
  augmentationProfitBoost: number;   // Firms' share of augmentation → corporate profits
  aiCapacityUtilization: number;     // AI capacity utilization = absorbed / supply [0, 1]

  // ═══ PRODUCTION PROGRAM STAGE 1 — the buildout telemetry surface (checkpoint §0) ═══
  /** Present when the buildout machine is live for this run; the per-year per-sink
   *  gate-binding attribution the user-facing surfaces read. */
  buildout?: BuildoutTelemetry;

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
  sectorPEClampEngaged: boolean;        // D1 F2: a sector P/E hit its constants' cited ceiling (reported)
  sectorEarningsFloorEngaged: boolean;  // D1 F3: a negative sector-profit input was floored for valuation (reported)
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
  unclippedConsumerTightening: number;    // Stage 6 (R18): channel sum BEFORE the ceiling clip (binding diagnostics)
  pceProxyInflation: number;              // E-9: the Fed's mandate variable (PCE-reweighted, − formula effect)
  housingPipeline: number;                // E-10: units under construction (init = observed UNDCONTSA)
  housingCompletions: number;             // E-10: the pipeline maturing at the length-biased duration
  builderPriceIndex: number;              // E-10: the builder's λ-smoothed planning-horizon price
  landResidualTarget: number;             // E-11: L* = (P − structureValue)/landShare (value-consistent)
  afterTaxIncomeGrowth: number;           // L9b: the after-tax aggregate income growth (the rent WTP basis)
  builderTrendGrowth: number;             // L9c-4: the builder's H=10 EMA trend estimator (state)
  creditBarLevel: number;                 // E-1: the adaptive credit income-adequacy bar (recursive state)
  creditBarInflationExpectation: number;  // E-1: the bar's debt-turnover-blended inflation expectation
  incomeAdequacyRatio: number;            // underwritable income / baseline (diagnostic)
  underwritableIncome: number;            // real $ that banks count toward debt servicing
  businessCreditMultiplier: number;       // [0.01, ~1.15] → multiplies investment (can loosen above 1.0)
  businessCreditTightening: number;       // raw level (negative = loosening)
  profitCoverageRatio: number;            // corporate profits / baseline (diagnostic)

  // Phase 5i: Housing & Shelter
  goodsInflation: number;                // Non-shelter inflation rate (= AI-exposed sector, back-compat)
  shelterInflation: number;              // Shelter-specific inflation rate
  compositeInflation: number;            // weighted across the 4 consumption sectors
  // Stage 1: sectoral price architecture — per-sector inflation rates + non-AI deflator
  aiExposedInflation: number;            // base + broad pressures − AI deflation × passthrough
  laborServicesInflation: number;        // base + broad pressures + Baumol wage term
  foodEnergyInflation: number;           // base + broad pressures (exogenous, no AI deflation)
  nonAICompositeInflation: number;       // composite EXCLUDING AI supply deflation (Stage 2 firewall input)
  nonAIPriceLevel: number;               // cumulative price index excluding AI supply deflation
  laborServicesPriceLevel: number;       // Stage 5b (F2): cumulative labor-services sector price index (in-kind deflator)
  // Stage 6.5: stock-flow housing state (OD-9a separate, linked rent/price indices)
  housingStock: number;                  // units (init Census ~146.6M)
  households: number;                    // init Census ~131.5M
  headshipRate: number;                  // HH/population (formation state)
  rentIndex: number;                     // 1.0 = 2025; shelter CPI = its growth rate
  constructionCostIndex: number;         // 1.0 = 2025; absorbs FULL embodied construction deflation
  landCostIndex: number;                 // 1.0 = 2025; the non-producible residual (terminal constraint)
  occupancyRate: number;                 // HH/H (natural ≈ 0.897)
  housingStarts: number;                 // units/yr (equilibrium baseline ≈ 0.95M)
  monetaryInflation: number;             // Stage 4: signed monetary-inflation component of composite (Fisher ΔM·V/PY)
  // Stage 5 (H3): unified incremental-UE transfer flows — single source of truth, read by household
  // income (cash), consumption (in-kind → PCE directly), and the load-bearing budget (sum, at t+1).
  incrementalCashTransfers: number;      // $ cash support (UI+SNAP) to incremental unemployed → transfer income
  inKindConsumption: number;             // $ in-kind support (Medicaid etc.) → enters C directly, NOT income
  incrementalTransferSpending: number;   // = cash + in-kind; booked as budget outlay (fiscal block, t+1)
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
  nominalWageGrowth: number;             // Stage 3: endogenous nominal wage growth (indexation + productivity − Phillips + Δscarcity)
  // Stage 3: endogenous wage path
  wageIndex: number;                     // compounded per-worker nominal wage (1.0 = 2025)
  trendWageIndex: number;                // wage index with NO Phillips/scarcity (policy-floor reference)
  scarcityPremiumLevel: number;          // hump LEVEL = scarcityIntensity × cov × (1−cov)
  obligationGCOLAIndex: number;          // COLA-floored wage index for obligation-G (R2)
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
  /** FS-6f: exposed so the fiscal-block bridge passes it directly (the residual derivation
   * retired) and the 8-channel completeness assertion can reconstruct the total. */
  transferTax: number;
  /** CURRENT-YEAR 8-channel revenue total. The budget books this value at t−1 as
   * FiscalState.bookedRevenueT1 (the fiscal block's uniform one-year booking convention) —
   * same dollar object, one-year offset. */
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

  // RETIRED (mini-stage 1): the Phase-5-tax AI cost indices — rode the DEPRECATED
  // exp(inferenceAnnualChange·t) leg, publishing a dead basis beside the live economics
  // (Audit B-5's third diagnostic site). Successors below. Kept per the no-delete rule.
  // blendedAiCostIndex: number;
  // inferenceCostIndex: number;
  // manufacturingCostIndex: number;
  // energyCostIndex: number;
  /** Mini-stage 1: deployer cost savings on displaced labor, priced from the ONE
   *  realized-cost object (aiCost.ts) against the LIVE human-cost basis (the honest
   *  successor to the retired automationDividend; Audit B-4). Dollars; negative under
   *  supply-shock cost compression. Diagnostic — not consumed by model math. */
  deployerRealizedSavings: number;
  /** Mini-stage 1: the EMERGENT economy-wide tokens-per-task path — employment-weighted
   *  realized inference cost ÷ per-token cost. An OUTPUT the model reports (validation
   *  diagnostic vs the observed intensity record), never an input; replaces the retired
   *  global tokens-per-task schedule. */
  impliedAggregateTokensPerTask: number;
  /** Mini-stage 1: employment-weighted frontier-reliance weight w(s) — how much of the
   *  economy's AI work is still frontier-priced. Diagnostic. */
  aggregateFrontierWeight: number;
  // ═══ Mini-stage 3: the two honest jobless measures + policymaker displays ═══
  /** Discouraged exits: left the measured labor force, still jobless (in BROAD, not U-3). */
  laborForceExitedStock: number;
  /** U-3-consistent unemployment: searchers only; exits removed from numerator AND
   *  denominator. The headline unemploymentRate is the BROAD-consistent measure. */
  u3UnemploymentRate: number;
  /** Employment ÷ total population (the policymaker display). */
  employmentToPopulation: number;
  /** Share of the searching pool jobless ≥ 1 year. */
  longTermJoblessShare: number;
  /** Mean jobless duration of the searching pool (years). */
  meanJoblessDurationYears: number;

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
  /** The frontier stock (MS1; flywheel MS: always-on, loop-hosted): training capacity
   *  relative to the default path. Exactly 1 on every funded, unshocked path; drains
   *  under supply famines AND funding starvation, rebuilds at fab speed. */
  frontierStock: number;
  /** The cost clock (flywheel MS): effective innovation time τ. Advances at
   *  stock^frontierCostElasticity per year; τ = year − startYear exactly on every
   *  funded path. Every realized-cost leg evaluates at τ. */
  effectiveCostTime: number;
  // ── THE PASS-THROUGH LAW: the AI-savings LEVEL objects (state — the emitted
  // deflation flows are their first differences; the pass-through law: flows derive
  // from CHANGES in their causes) + the per-leg split (replacement / augmentation,
  // ruling 4's traced decomposition) + the credit impulse kernel state J. ──
  aiSavingsLevelTotal: number;
  aiSavingsLevelAiExposed: number;
  aiSavingsLevelLaborServices: number;
  aiSavingsLevelFoodEnergy: number;
  aiSavingsLevelShelter: number;
  aiSavingsLevelReplacement: number;
  aiSavingsLevelAugmentation: number;
  creditDeflationImpulseState: number;
  /** DIAGNOSTIC ONLY (ruling 4's loudness condition; was `effectiveComputeDeclineRate`):
   *  the counterfactual inference-cost decline rate a backlogged chip fleet implies.
   *  NOT consumed by any economic path — proven by strict-equality execution
   *  (flywheel session 1, probe leg A). The realized cost trend lives on the τ clock
   *  (`effectiveCostTime`), its honest successor. */
  cascadeDeclineRateDiagnostic: number;
  deploymentMultiplierCompute: number;
  deploymentMultiplierPhysical: number;
  deploymentMultiplierEnergy: number;
  // RETIRED (mini-stage 1): automationDividend — the doubly-stale diagnostic (deprecated
  // exp leg + retired seniority proxy; Audit B-4). Successor: deployerRealizedSavings.
  // automationDividend: number;

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
  /** FS-6f (ruled rename; was totalGovernmentRevenue): the revenue the budget BOOKS this
   * fiscal year = the previous year's MacroOutput.totalGovernmentRevenue, exactly (the t−1
   * booking convention, like every fiscal input). The name carries the offset so a reader
   * comparing this against the macro field of the same year sees the convention, not a bug. */
  bookedRevenueT1: number;
  revenueGDPRatio: number;
  laborTaxRevenue: number;
  corporateTaxRevenue: number;
  primaryDeficit: number;
  totalDeficit: number;
  /** Stage 5 (H3): incremental-UE stabilizer transfers booked in the budget this year
   *  (= previous year's incrementalCashTransfers + inKindConsumption — fiscal block's t−1 convention). */
  stabilizerTransfers: number;
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
  /** E-7: the market's long-run inflation anchor (SPF/5y5y analog) — converges to realized composite at 1/credibilityHorizonYears. */
  marketInflationAnchor: number;
  /** E-8: markets' priced expectation of fiscal consolidation [0,1] — ramps/decays at 1/fiscalAdjustmentHorizonYears once debtService/revenue crosses the trigger. */
  adjustmentExpectation: number;
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
  /** D1 fix F1b: the Gordon form ran out of domain (r − g below the cited spread
   *  floor) and the valuation capped at the record-valuation class — reported. */
  gordonDomainGuardEngaged: boolean;
  /** D1 fix F1a: the crisis component inside the equity risk premium (0 below the
   *  tightening noise floor — identically 0 on the zero-AI reference path). */
  erpCrisisComponent: number;
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
  /** Stage 4: FLOORED dynamic velocity actually used in the Fisher money-creation term (surfacing fix). */
  velocity?: number;
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
  /** The fund's creation year: initialFundSize seeds at THIS year and the fund is
   *  inert before it (no returns, no dividends, no contributions consumed). Absent ⇒
   *  DEFAULT_SWF_START_YEAR (simulation start) — byte-identical prior behavior. Also
   *  closes the prior seed-loss class: enabling the fund after the start year used to
   *  lose initialFundSize entirely (the seed fired only at yearsSinceStart === 0). */
  startYear?: number;
  initialFundSize: number;                    // billions (one-time init, stays flat)
  annualContribution: PolicySchedule;         // billions/year, was: number
  annualReturnRate: number;
  distributionRate: number;
  distribution: 'universal' | 'means_tested';
  // Merged from UniversalEquityPolicy (Phase 5g SWF consolidation)
  ownershipFraction: PolicySchedule;   // fraction 0-0.50
  // DEPRECATED (Stage H addendum, A-6 — previously cited-dead/uncited-live): these two fields
  // WERE the live payout base for equity stakes and profit sharing (500 × 1.15^t $B — claiming
  // ≈$1.0T of AI profits in 2030 when the endogenous residual was ≈$0). The payouts are now
  // priced from prior-year realized ENDOGENOUS AI corporate profits (MacroOutput.
  // aiCorporateProfits at t−1); these fields are UNREAD on every path, kept per the no-delete
  // rule, and their deadness is enforced by stageH-honesty.test.ts probes.
  totalAICompanyProfits: number;       // billions/year baseline (retired)
  profitGrowthRate: number;            // (retired)
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
  /** DEPRECATED (Stage H): dead on the simulation path (never read by the policy engine); UI control removed; guarded by stageH-honesty.test.ts. */
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
  /** DEPRECATED (Stage H): dead on the simulation path (written but never read by computeStateOutputs); UI control removed; guarded by stageH-honesty.test.ts. */
  minimumWage: number;
  additionalUBI: number;
  uiReplacementRate: number;
  /** DEPRECATED (Stage H): dead on the simulation path (lagModifier computed and discarded — only `.additions` is consumed by computeStateOutputs); UI control removed; guarded by stageH-honesty.test.ts. */
  avRegulatoryEnvironment: 'permissive' | 'moderate' | 'restrictive';
  /** DEPRECATED (Stage H): dead on the simulation path (lagModifier computed and discarded — only `.additions` is consumed by computeStateOutputs); UI control removed; guarded by stageH-honesty.test.ts. */
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
  // default: BASE_INFLATION_RATE — data-derived from fetched BLS CPI data via govData (≈0.0263
  // at last fetch), NOT a fixed 0.02; the constant is the single source of truth (audit H679)
  baseInflationRate: number;
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
  /** DEPRECATED (Stage H): dead on the simulation path (old credit system; consumers block-commented); UI control removed; guarded by stageH-honesty.test.ts. */
  creditUESensitivity?: number;           // 0-20, default 8.0
  /** DEPRECATED (Stage H): dead on the simulation path (old credit system; consumers block-commented); UI control removed; guarded by stageH-honesty.test.ts. */
  creditInvestmentSensitivity?: number;   // 0-1.0, default 0.35 (was 0.15 — 2008 investment fell 23%)
  /** DEPRECATED (Stage H): dead on the simulation path (old credit system; consumers block-commented); UI control removed; guarded by stageH-honesty.test.ts. */
  creditConsumptionSensitivity?: number;  // 0-1.0, default 0.06

  // Feedback Loop Parameters (Phase 1 overhaul)
  revenuePressureSensitivity?: number;    // 0-3, default 1.5
  revenuePressureCap?: number;            // 0-1, default 0.3
  revenuePressureDecay?: number;          // 0-1, default 0.5
  /** DEPRECATED (Stage H): dead on the simulation path (written to secondOrderParams, never read); UI control removed; guarded by stageH-honesty.test.ts. */
  aiWageProductivityMultiplier?: number;  // 0-1, default 0.5

  // Phillips Curve Parameters (Phase 4 quality pass)
  /** Exponential Phillips curve sensitivity. Higher = wages fall faster with excess unemployment.
   *  Default 2.5. At 10% excess UE → ~22% wage reduction. Source: Blanchard (2016), IMF WEO Ch3 (2017).
   *  DEPRECATED (Stage H): dead on the simulation path (computeWagePressure retired at Stage 3; zero live call sites); UI control removed; guarded by stageH-honesty.test.ts. */
  phillipsCurveSensitivity?: number;       // 0-5, default 2.5

  // Credit Parameters (Phase 4 quality pass)
  /** Maximum fraction of credit that can contract during crisis.
   *  Empirical: 2008 ~40% bank lending decline, Great Depression ~50% total credit contraction.
   *  Default 0.70 allows worse-than-historical outcomes.
   *  DEPRECATED (Stage H): dead on the simulation path (old credit system; consumers block-commented); UI control removed; guarded by stageH-honesty.test.ts. */
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
  /** Per-worker output boost from AI tools at full capability. Default 2.0 (200%), per
   *  DEFAULT_AUGMENTATION_MULTIPLIER — single source of truth (the "0.20" previously stated
   *  here was a stale copy; audit H679 doc correction).
   *  At betterScore=1.0, each remaining worker produces (1 + multiplier) × baseline.
   *  Source: McKinsey (2023) — 15-70% generative-AI gains in knowledge work; individual
   *  reports of 100-300% gains in software/writing/analysis (2024-2025). */
  augmentationMultiplier?: number;          // 0-5, default 2.0

  // Employment multiplier override for other_uncategorized cluster (Phase 5h Fix 2)
  // undefined = auto (employment-weighted average of all other clusters)
  // number = custom user value (0.0–5.0 via slider)
  otherUncategorizedMultiplierOverride?: number;

  // Per-cluster parameter overrides (Phase 8 consolidation)
  clusterOverrides?: Record<string, Partial<ClusterParameterOverride>>;

  // Corporate Profits & Financial Markets (Phase 5g)
  /** DEPRECATED (Stage H): dead on the simulation path (voided at macro.ts:3096-3097); UI control removed; guarded by stageH-honesty.test.ts. */
  aiProfitMargin?: number;              // 0-0.999, default 0.25
  /** DEPRECATED (Stage H): dead on the simulation path (voided at macro.ts:3096-3097); UI control removed; guarded by stageH-honesty.test.ts. */
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

  // ═══ PRODUCTION PROGRAM STAGE 1 — Channel 1 (the buildout) ═══
  /** AI-sector retention share for buildout finance. Default 0.30 — the MEASURED NIPA
   *  net-dividends-basis anchor 0.283–0.331 (2023–25; buybacks excluded from that
   *  basis, stated). Range: 0.1–0.6. */
  aiRetentionShare?: number;
  /** R3 smoothed binding-leg allocation: the bounded partial-adjustment step per year.
   *  Default 0.5 [e]. Range: 0.1–1 (1 = unsmoothed shadow-price chasing). */
  buildoutAllocSmoothing?: number;
  /** PB-1 sensitivity override of the seam anchor I_AI_OBSERVED_2025 (the measured
   *  $130–155B bracket). Default: the constant ($140B pick). Moves the machine seam
   *  AND the baseline-partition share coherently. */
  aiBuildoutSeamAnchor?: number;

  // ═══ PRODUCTION PROGRAM STAGE 2 — Channel 2 (the ledger re-anchor) ═══
  /** Embodied-capital units per fully-automated embodied worker (the derived fleet
   *  requirement's per-worker factor). Default 1.0; range = the cited-anchored honest
   *  band [0.5, 1.5] (IFR robot-density-class basis — constants.ts). */
  unitsPerEmbodiedWorker?: number;
  /** Own-price demand elasticity magnitude, AI-exposed consumption (elasticity-based
   *  absorption). Default 0.75 (EPA NCEE 21-05 T12); range [0.3, 1.0]. */
  absorptionElasticityAiExposed?: number;
  /** Own-price demand elasticity magnitude, labor services. Default 0.20 (RAND HIE
   *  arc elasticity, healthcare-dominant declared); range [0.1, 0.5]. */
  absorptionElasticityLaborServices?: number;
  /** Own-price demand elasticity magnitude, food & energy. Default 0.40 (declared
   *  food-dominant blend — Andreyeva et al. 2010 + Hughes modern-era fuel);
   *  range [0.05, 0.8]. */
  absorptionElasticityFoodEnergy?: number;

  // ═══ PRODUCTION PROGRAM STAGE 3 — MS3 equity issuance (owner ruling v) ═══
  /** Issuance rate ι: gross issuance as a share of the implied AI market cap per
   *  year. Default 0.015 (cited-class); range [0.005, 0.03]. */
  equityIssuanceRate?: number;

  // ═══ PRODUCTION PROGRAM STAGE 3 — MS4 Channel 3 + N2 ═══
  /** AI-sector R&D intensity on the realized revenue base (sales basis). Default
   *  0.12 (NCSES software/information class 10–15%); range [0.02, 0.20]. */
  aiRdIntensity?: number;
  /** The R&D→TFP returns elasticity (the N2 axis's ONE lever). Default 0.08
   *  (Hall–Mairesse–Mohnen 0.01–0.25 centered ≈0.08); range = the cited range. */
  rdTfpElasticity?: number;

  // ═══ PRODUCTION PROGRAM STAGE 4 — MS2: N1, the buildout-cost worldview ═══
  // (checkpoint §4 + ratification R2's surgery: ONE owner of every leg-level
  //  input-cost trend. Defaults = the Stage-1 derived-default constants; the
  //  N1-consensus variant assigns exactly these literals — the identity proof.)
  /** Chips leg unit-cost annual trend ($/FLOP class). Default −0.26 (Epoch
   *  FLOP/$ doubling 2.1–2.5yr); range [−0.5, 0.05]. Also drives the DERIVED
   *  tokenCostCurve coupling (aiCost.ts coupledTokenCostCurve). */
  buildoutChipsCostTrend?: number;
  /** Energy leg unit-cost annual trend. Default 0.0 (Lazard v18 blend); range
   *  [−0.10, 0.10]. */
  buildoutEnergyCostTrend?: number;
  /** Datacenter leg unit-cost annual trend. Default 0.0 (level citable, learning
   *  rate honest-uncertainty as ratified); range [−0.10, 0.10]. */
  buildoutDcCostTrend?: number;
  /** Fleet unit-cost annual trend. Default −0.05 [hu]; range [−0.25, 0.05]. */
  buildoutFleetCostTrend?: number;
  /** Fleet manufacturing-ramp growth per binding year (the queue-not-fence rate;
   *  the ratified adoption-gating design §4's fleet-production row). Default
   *  0.35 [episode: automotive ramps]; range [0.05, 1.0]. */
  buildoutFleetRampGrowth?: number;

  // ═══ STAGE 5A — the energy queue (the ratified ENERGY_PROGRAM_DESIGN.md A1 +
  //     owner ruling E1; N1-owned belief content — the queue machine OWNS energy
  //     availability; the scale-pressure rows own frontier cost-composition drift;
  //     the supplyChainEnergyCapacity row stays the shock surface) ═══
  /** Grid-lane effective lead, order → available, years. Default 4 (LBNL Queued Up
   *  >4→>5yr record); range [1, 8]. Fractional values split delivery between the
   *  bracketing years. */
  energyQueueLeadYears?: number;
  /** Additions-ceiling growth per BINDING year (queue-not-fence). Default 0.20
   *  (the observed 48.6→63 GW additions jump, DC-claim-discounted); range [0, 1]. */
  energyQueueCeilingGrowth?: number;
  /** E1: behind-the-meter share of the financed energy build bypassing the grid
   *  queue at the express lead + cost premium (Colossus-class episode). Default
   *  0.25 [episode/hu]; range [0, 0.8]. */
  energyBtmShare?: number;

  // ═══ PRODUCTION PROGRAM STAGE 4 — MS4: the adoption-gating build ═══
  /** The per-cluster fleet allocation's partial-adjustment step per year (the
   *  ratified design §3's one new [e] constant, the R3 smoothing class).
   *  Default 0.5; range [0.1, 1.0]. */
  fleetAllocSmoothing?: number;

  // Credit Deflation (Phase 5g Step 10)
  /** Sensitivity of price level to credit contraction. Default 0.04. Range: 0-1. */
  creditDeflationSensitivity?: number;
  /** Pass-through: impulse sensitivity (above-floor Δ-tightening; [e]-derived, A8-laddered). */
  creditDeflationImpulseSensitivity?: number;
  /** Pass-through: impulse persistence κ ([e], GR episode-anchored). */
  creditDeflationPersistence?: number;
  /** Pass-through: the credit noise floor ([e]-measured band boundary). */
  creditDeflationNoiseFloor?: number;
  /** D1 fix F1a: ERP crisis sensitivity ([e]-derived, Damodaran 2008-09 step over the banded tightening signal). */
  erpCrisisSensitivity?: number;

  // Sector Scarcity Inflation (Phase 5g Step 11)
  /** Fraction of sector labor scarcity passed through to prices. Default 0.30. Range: 0-1. */
  scarcityPassThrough?: number;

  // Labor Supply Response (Phase 5g Step 12)
  /** Elasticity of participation to UBI replacement rate. Default 0.15. Range: 0-1. */
  participationElasticity?: number;
  /** Replacement rate threshold for voluntary withdrawal. Default 0.60. Range: 0-1. */
  participationThreshold?: number;

  // Phase 5i: Housing, Shelter Inflation & Mortgage Stress
  /** Business credit GDP sensitivity. Default 5.0. Range: 0-15.
   *  DEPRECATED (Stage H): dead on the simulation path (no live reader); UI control removed; guarded by stageH-honesty.test.ts. */
  businessCreditGDPSensitivity?: number;
  /** Max business credit loosening cap. Default 0.30. Range: 0-1.0. */
  maxBusinessCreditLoosening?: number;
  /** Shelter CPI weight. Default 0.36. Range: 0.20-0.50. */
  shelterCPIWeight?: number;
  // Stage 1: sectoral price architecture (consumption-side CPI partition).
  /** AI-exposed-goods CPI weight. Default 0.22. Normalized with the other sector weights. */
  aiExposedCPIWeight?: number;
  /** Labor-intensive-services CPI weight (Baumol). Default 0.22. */
  laborServicesCPIWeight?: number;
  /** Food & energy CPI weight (exogenous). Default 0.20. */
  foodEnergyCPIWeight?: number;
  /** Fraction of AI cost savings passed to consumer prices (rest → margins). Default 0.70. Range: 0-1.0. */
  aiDeflationPassthrough?: number;
  /** Labor cost share for the labor-services Baumol channel. Default 0.60. Range: 0-1.0. */
  laborCostShare?: number;
  // Stage 1.5: embodied-AI passthrough per sector (fraction of AI cost savings reaching consumer
  // prices, net of regulatory friction + government policy). Embodied sectors are LOW.
  /** Labor-intensive-services embodied passthrough. Default 0.15. Range: 0-1.0. */
  laborServicesPassthrough?: number;
  /** Food & energy embodied passthrough. Default 0.10. Range: 0-1.0. */
  foodEnergyPassthrough?: number;
  /** Shelter embodied passthrough (housing/land-use regulation → near-zero). Default 0.05. Range: 0-1.0. */
  shelterPassthrough?: number;
  /** Shelter inflation stickiness. Default 0.80. Range: 0-1.0.
   *  DEPRECATED (Stage H): dead on the simulation path (retired with the Stage-6.5/L9 shelter mechanics); UI control removed; guarded by stageH-honesty.test.ts. */
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
   *  Source: Glaeser & Gyourko (2018): housing tenure switch literature.
   *  DEPRECATED (Stage H): dead on the simulation path (retired with the Stage-6.5/L9 shelter mechanics); UI control removed; guarded by stageH-honesty.test.ts. */
  rentalDemandSensitivity?: number;
  /** Maximum annual shelter deflation rate (land scarcity floor). Default -0.05. Range: -0.15 to 0.
   *  Represents land scarcity + construction cost floor. -5%/yr ≈ 60% of value after 10yr max deflation.
   *  DEPRECATED (Stage H): dead on the simulation path (retired with the Stage-6.5/L9 shelter mechanics); UI control removed; guarded by stageH-honesty.test.ts. */
  shelterInflationFloor?: number;

  // Investment Demand Constraint — market-signal gating of AI investment
  /** How much low AI utilization discourages new AI investment. 0=ignored, 50=moderate, 100=aggressive.
   *  Maps to exponent: val/100 × 3.0. Default 50. Source: Novel — no historical AI precedent. */
  aiUtilizationSensitivity?: number;           // 0-100, default 50
  /** How much weak consumer demand discourages AI investment. 0=ignored, 50=moderate, 100=aggressive.
   *  Maps to exponent: val/100 × 3.0. Default 50. Source: Accelerator principle (Samuelson 1939). */
  consumerDemandInvestmentSensitivity?: number; // 0-100, default 50
  /** How much credit conditions affect AI investment. 0=ignored, 50=moderate, 100=aggressive.
   *  Maps to exponent: val/100 × 3.0. Default 50. Source: Fed SLOOS lending conditions surveys.
   *  DEPRECATED (Stage H): dead on the simulation path (Phase-6 deprecation; readers commented out); UI control removed; guarded by stageH-honesty.test.ts. */
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
  /** Maximum consumer credit restriction. Default 1.0 per DEFAULT_MAX_CONSUMER_TIGHTENING
   *  (Stage 6 R18/H6 re-anchor: 0.5 ≈ Great-Recession peak, 1.0 ≈ Depression-scale collapse;
   *  the "0.5" previously stated here was the unpropagated pre-R18 copy — audit H679). */
  maxConsumerTightening?: number;           // 0.2-1.0
  /** Consumer credit tightening → consumption reduction. Default 0.12 per
   *  DEFAULT_CONSUMER_CREDIT_IMPACT (saturation re-anchor: 0.12 × the GR-peak ratio 0.5
   *  reproduces the old 6% haircut; the "0.06" here was a stale copy — audit H679). */
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

  // ═══ The flywheel (cost endogeneity) — ROOT-LEVEL dials: the mechanism is always-on
  // (the Acceleration class composes no supply-chain config), so its dials cannot live
  // under the optional supplyChainConfig block. ═══
  /** Starvation threshold θ on the funding gate F = min(investmentRealization,
   *  aiCapacityUtilization) at t−1. F ≥ θ ⇒ demand throughput exactly 1 (the dead zone —
   *  the identity condition); below θ it ramps F/θ. Default 0.5 [hu]; range 0–0.75, the
   *  cap MEASUREMENT-DERIVED (pinned-path minimum 0.776). 0 = demand edge off. */
  flywheelStarvationThreshold?: number;
  /** Cost-clock speed = frontierStock^elasticity: effective innovation time τ advances
   *  at S^φ_cost; every realized-cost leg evaluates at τ. The A2 dials are the POTENTIAL
   *  pace; τ is its funded realization. Default 1.0 [hu]; range 0–3; 0 = cost decoupled
   *  (the shipped calendar curves exactly). */
  frontierCostElasticity?: number;

  /** Corporate retention rate (fraction of after-tax profits retained). Default: BEA-derived at
   *  module init (BASELINE_CORPORATE_RETENTION_RATE ≈ 0.390, NIPA undistributed-profits ratio) —
   *  not the static "~0.40" previously stated here (audit H679). Range 0-1. */
  corporateRetentionRate?: number;
  /** AI market power / profit growth rate. Default 2.0. Range 0.5-10.0.
   *  DEPRECATED (Stage H): dead on the simulation path (its reader is retired); UI control removed; guarded by stageH-honesty.test.ts. */
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
  /** Maximum fiscal risk premium in decimal. Default 0.06 (600bp) per
   *  DEFAULT_FISCAL_RISK_PREMIUM_MAX. Range: 0.01-0.15 (uncited; widened from the uncited
   *  0.01-0.10 to the shipped UI envelope — audit H679 range alignment). */
  fiscalRiskPremiumMax?: number;
  /** Share of corporate profits actually taxed (statutory × effectiveness). Default 0.65. Range: 0.10-1.00.
   *  DEPRECATED (Stage H): dead on the simulation path (zero readers anywhere); UI control removed; guarded by stageH-honesty.test.ts. */
  corporateTaxEffectiveness?: number;
  /** Foreign buyers' share of US Treasuries. Default 0.30. Range: 0.05-0.60.
   *  DEPRECATED (Stage H): dead on the simulation path (inert on the default path — D-fix zero branch; revived only by the no-UI legacy toggles); UI control removed; guarded by stageH-honesty.test.ts. */
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
  /** Term premium for 10Y yield. Default 0.007 (70bp) = TERM_PREMIUM, the single source of
   *  truth ("0.003" here was one of four stale copies of the pre-E-8c value — audit H679).
   *  Source: NY Fed ACM model (ACMTP10). Range: -0.01-0.02. */
  termPremium?: number;
  /** Years for inflation expectations to converge to target. Default 5 per
   *  DEFAULT_INFLATION_CONVERGENCE_YEARS. Range: 1-15 (uncited; min widened from the uncited
   *  2 to the shipped UI envelope — audit H679 range alignment). */
  inflationConvergenceYears?: number;

  // ═══ Phase 8 Fix 4: Fiscal risk premium weights (trajectory-based composite) ═══
  /** Weight on debt/GDP rate-of-change component. Default 0.50. Range: 0-1. */
  fiscalRiskTrajectoryWeight?: number;
  /** Weight on r-vs-g sustainability component. Default 0.35. Range: 0-1. */
  fiscalRiskSustainabilityWeight?: number;
  /** Weight on absolute debt/GDP level component. Default 0.15. Range: 0-1. */
  fiscalRiskLevelWeight?: number;
  /** Debt/GDP midpoint for level sigmoid. Default 2.0. Range: 1.0-4.0 (uncited; widened from
   *  the uncited 1.0-3.0 to the shipped UI envelope — audit H679 range alignment). */
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
  /** Fiscal policy preset name. Default 'observed_political_economy' per
   *  DEFAULT_FISCAL_POLICY_PRESET (fiscalResponseProfiles.ts), the single source of truth —
   *  'balanced_reduction' stated here was one of a five-site stale fallback family (audit H679). */
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
  /** Intensity of AI-displacement scarcity premium (now the wage-equation scarcity hump). Default 0.4. */
  scarcityIntensity?: number;
  // Stage 3: endogenous wage equation
  /** Fraction of lagged composite inflation passed into nominal wage growth (COLA). Default 1.0. Range 0–1.5. */
  inflationIndexation?: number;
  /** Fraction of per-worker productivity passed into nominal wage growth. Default 0.90 per
   *  DEFAULT_PRODUCTIVITY_PASSTHROUGH — the D-1 ratified calibration to the observed aggregate
   *  labor-share drift (the "1.0" here was a stale copy; audit H679). Range 0–1.5. */
  productivityPassthrough?: number;
  /** Wage-Phillips semi-elasticity (pp wage growth per pp excess UE). Default 0.30. Range 0–1.0. */
  phillipsSlope?: number;
  /** Asymmetric downward nominal wage rigidity [0,1]. Default 0.60. 1=never cut, 0=fully flexible. */
  downwardWageRigidity?: number;
  // Stage 5 (H3/OD-4): unified incremental-UE transfer support (single source for income + C + budget)
  /** CASH support per incremental unemployed ($/yr): UI + SNAP, stock-average. Default 8,000 (DOL ETA, USDA FNS). */
  cashTransferPerUnemployed?: number;
  /** IN-KIND support per incremental unemployed ($/yr): Medicaid + other, stock-average. Default 5,000 (KFF/CMS). */
  inKindTransferPerUnemployed?: number;
  // Stage 6.5: stock-flow housing (OD-9a–e; see STAGE6_5_CHECKPOINT.md for the cited defaults)
  /** Δln(headship)/yr per unit negative income deviation. Default 0.06 (GR formation collapse); 0 disables (OD-9c). */
  formationSensitivity?: number;
  /** /yr headship reversion to baseline. Default 0.12 (JCHS post-GR recovery). */
  headshipRecoveryRate?: number;
  /** % starts per % profitability gap — the REGULATORY-FRICTION dial. Default 1.5 (Saiz 2010); higher = abundance reform. */
  housingSupplyElasticity?: number;
  /** Construction-capacity gain at full embodied capability. Default 1.0 (= 2× capacity). */
  embodiedCapacityGain?: number;
  /** /yr housing stock losses. Default 0.0025 (HUD CINCH). */
  housingDepreciationRate?: number;
  /** Land share of replacement cost (2025 snapshot). Default 0.40 (Davis-Heathcote/Lincoln — research-sourced; no gov API). */
  landShare?: number;
  /** Labor share of construction-cost growth. Default 0.35 (Census/RSMeans). */
  constructionLaborShare?: number;
  /** Land growth per unit nominal income growth. Default 1.0 (Knoll-Schularick-Steger) — the reform/abundance lever. */
  landIncomeBeta?: number;
  /** Land growth per unit occupancy gap. Default 2.0 (ATLAS judgment param, flagged). */
  landScarcityElasticity?: number;
  /** Rent growth per unit occupancy gap. Default 2.0 (Rosen-Smith natural-vacancy literature). */
  rentOccupancyElasticity?: number;
  /** Weight on replacement-cost growth in rent growth. Default 0 per
   *  DEFAULT_RENT_COST_ANCHOR_WEIGHT — the L9 anchor retirement (rents follow the
   *  occupancy/entry-margin form); 1.0 = the pre-L9 legacy cost-anchor pole (which-change
   *  toggle). The "Default 1.0 (ratified)" previously stated here documented the RETIRED pole
   *  as the default (audit H679 doc correction). */
  rentCostAnchorWeight?: number;
  /** Rent-price ratio anchor. Default 0.052 (Davis-Lehnert-Martin; 2024-25 multifamily caps). */
  baselineCapRate?: number;
  /** Δcap per Δmortgage rate. Default 0.4 (NCREIF/CBRE beta 0.3-0.5). */
  capRateMortgageBeta?: number;
  /** Optional investor cap-rate compression. Default 0 (off, per 6.5 ruling 2). */
  capRateInvestorCompression?: number;
  /** Price impact per unit unabsorbed foreclosure flow. Default 1.75 (Mian-Sufi-Trebbi 2015). */
  fireSaleElasticity?: number;
  /** OD-9b land/store-of-value thesis dial: land bid per unit asset-share deviation. Default 0.10; 0 = off. R24: one-sided. */
  investorDemandIntensity?: number;
  // Stage 7: residual corporate profits (Phase 10.B; OD-5 checkpoint ratified)
  /** Model-frame other-costs share of GDP (Q-1 ii): init-derived ≈0.115 so year-0 residual = BEA profits/GDP exactly. */
  otherCostsShare?: number;
  /** AI-sector labor share (10.B). Default 0.15 (big-tech labor intensity). */
  aiSectorLaborShare?: number;
  /** Rent-sharing elasticity: wage growth per unit profit-share deviation. Default 0.10 (Card-Cardoso-Heining-Kline 2018). Two-sided. */
  rentSharingElasticity?: number;
  /** Secular profit-share drift for the rent-sharing baseline (Q-2 B). Default 0.001/yr (= the D-1 drift). 0 = the post-2015-stabilization worldview. */
  secularProfitDriftRate?: number;
  // F4/OD-8 EXAMINATION (charter): the expectation-constant family
  /** E-1: credit-bar inflation-expectation turnover (1/household-debt duration). Default 1/7 (Fed Z.1/G.19 blend). 0 = legacy fixed. */
  creditExpectationTurnover?: number;
  /** E-1/E-3 sibling: credit-bar REAL trend override (default = emergent closed form, perWorker×passthrough+pop ≈ 1.84%). Isolation: 0.02 = legacy. */
  creditBarRealTrend?: number;
  /** E-2: investor-bid baseline drift (default derived: payout×(1−tax)×secularProfitDrift ≈ 0.00047/yr). 0 = frozen 2025 baseline. */
  assetShareDriftRate?: number;
  /** E-3: demand-trend growth override (default = emergent closed form ≈ 1.84%). Isolation: 0.02 = legacy fixed. */
  demandTrendGrowth?: number;
  /** E-6: land rate-sensitivity (%/yr per pp mortgage-rate deviation). Default 0.75; 0 = the pre-E-6 rate-blind land. */
  landRateSensitivity?: number;
  /** E-7: credibility horizon τ (years). Default 10; 5-8 = 1970s de-anchoring; 0 = never-de-anchor sentinel (legacy). */
  credibilityHorizonYears?: number;
  /** E-8: debt-service/revenue level at which markets price consolidation. Default 0.18 (1991-95). ∞-like values = never-credible. */
  fiscalCredibilityTrigger?: number;
  /** E-8: market adjustment-expectation ramp/decay horizon (yrs, symmetric). Default 8 (1992-98 six-year episode in range). */
  fiscalAdjustmentHorizonYears?: number;
  /** E-8b item 1: the CPI−PCE target-basis wedge (the usePceProxy:false FALLBACK). Default 0.005. */
  pceCpiWedge?: number;
  /** E-9 item 2: the Fed reads the endogenous PCE proxy (default true); false = the E-8b fixed-wedge fallback. */
  usePceProxy?: boolean;
  /** E-9 [α]: the formula/scope component of CPI−PCE (default 0.002, BEA-BLS reconciliation; grows under divergence — documented limitation). */
  pceFormulaEffect?: number;
  /** E-9 item 1 (F-D): non-shelter sector anchor override. Default = the derived complement ≈0.0222; 0.0261 = the legacy all-items (isolation). */
  nonShelterBaseInflation?: number;
  /** E-9 item 3: true = the legacy split-NAIRU behavior (Taylor on realized-2025). Default false = unified FRED NAIRU. */
  // RETIRED (CO-D2 conversion, R3b): legacyNairu — pole at ~/.atlas-referents/co-d2/legacyNairu/.
  // legacyNairu?: boolean;
  /** E-9 item 4: true = single-bucket 30% rollover at the 10Y rate (legacy). Default false = split 17% @10Y + 13% @policy. */
  // RETIRED (CO-D2, R3b): legacySingleRollover — pole at ~/.atlas-referents/co-d2/legacySingleRollover/.
  // legacySingleRollover?: boolean;
  /** E-9b: policy-rate inertia ρ (annualized). Default 0.5 (CGG 2000 / Coibion-Gorodnichenko, 0.79-0.92 quarterly compounded). 0 = legacy instantaneous. */
  taylorSmoothing?: number;
  /** E-9c row 1: the anchor's year-0 init (observed 2025 expectations state). Default 0.027 (dual derivation); 0.025 ≈ the pre-E-9c idealized init (isolation). */
  marketAnchorInit?: number;
  /** E-10: builder adjustment speed λ (price smoothing + start adjustment, one cadence). Default 0.6 (HOUST 2022-23). 0 (with duration ≤ 0) = instantaneous legacy. */
  builderAdjustmentLambda?: number;
  /** E-10: pipeline turnover duration (yrs). Default 1.2 (length-biased Census blend; UNDCONTSA-confirmed). ≤ 0 = the legacy 1-yr lag. */
  housingPipelineDuration?: number;
  /** E-11: the land-residual-closure speed κ. Default 0.45 (2022-23 episode); 0 = the pre-E-11 legacy land block (toggle #8). */
  landClosureKappa?: number;
  /** E-12: capRate reference override (config). Default = derived ~0.065; 0.06 = legacy. */
  mortgageRateReference?: number;
  /** L9: landlord opex passthrough. Default 0.40. */
  opexPassthrough?: number;
  /** L9: one-sided rent rigidity. Default 0.85. */
  rentDownwardRigidity?: number;
  /** L9b: θ. Default 0.47. */
  rentIncomeElasticity?: number;
  /** LLAG diagnostic only: builder reads spot P (price channel only; starts smoothing untouched). */
  // RETIRED (CO-D2, R3b): see the housing block's retired twin above.
  // diagSpotBuilderPrice?: boolean;
  /** L9c-3/4: the builder price-perception mode. Default 'trend-aware'; 'spot' and 'adaptive' (the pre-L9c smoother) = the dial's poles. */
  builderPriceMode?: 'spot' | 'trend-aware' | 'adaptive';
  /** L9c-1: the construction-credit gate sensitivity (R1 episode-solved 2.0; the ADC capacity citation). 0 = no gate (toggle). */
  constructionCreditSensitivity?: number;
  /** FS-3 which-change: true = the retired seniority proxy + no wage-level connection (the full legacy Cheaper). */
  // RETIRED (CO-D2, R3b): legacyCheaperProxy — pole at ~/.atlas-referents/co-d2/legacyCheaperProxy/.
  // legacyCheaperProxy?: boolean;
  /** FS-3 which-change: true = the OEWS basis WITHOUT the wage-level connection (the basis-only row). */
  // RETIRED (CO-D2, R3b): seamBasisOnly — pole at ~/.atlas-referents/co-d2/seamBasisOnly/.
  // seamBasisOnly?: boolean;
  /** E-8b item 2: fiscal premium per unit debt/GDP above the 2025 anchor. Default 0.035 (Laubach 2009 / Engen-Hubbard 2004). */
  laubachLevelBeta?: number;
  /** E-8b item 2: fiscal premium per unit deficit/GDP above the 2025 anchor. Default 0.25 (Laubach 2009). */
  laubachDeficitBeta?: number;
  /** E-8b isolation toggle: true = the pre-E-8b logistic extrapolative premium (the doom-pricing source). */
  /** RETIRED (the program close-out; Amendment 2 — no legacy toggles): the E-8b isolation
   *  toggle. The legacy logistic premium survives only as the recorded pole
   *  (~/.atlas-referents/e8b-legacy-pole/) and commented arithmetic in bondMarket.ts.
   *  Persisted configs carrying the key are healed (stripped with a warning). */
  // legacyFiscalPremium?: boolean;
  /** D-fix toggle: true = the β_deficit slot reads the realized TOTAL deficit (the self-referencing legacy basis). */
  // RETIRED (CO-D2, R3b): legacyTotalDeficitPremium — pole at ~/.atlas-referents/co-d2/legacyTotalDeficitPremium/.
  // legacyTotalDeficitPremium?: boolean;
  /** D-fix toggle: true = the retired supply-pressure premium (the second deficit reader) re-enabled. */
  // RETIRED (CO-D2, R3b): legacySupplyPressure — pole at ~/.atlas-referents/co-d2/legacySupplyPressure/; the six gated diagnostics are dead with the gate.
  // legacySupplyPressure?: boolean;
  /** E-8c F-B: the fiscal-dominance service/revenue gate for yield-response monetization. Default 0.50 (UK-1920s/France-1926/Weimar poles). */
  monetizationDominanceThreshold?: number;
  /** E-8c F-B: the Laubach-premium co-condition (markets pricing FISCAL stress). Default 0.01; the Volcker guard. */
  monetizationPremiumCoCondition?: number;
  /** Adoption rate above which competitive pressure kicks in; overrides DEFAULT_COMPETITIVE_PRESSURE_THRESHOLD. */
  competitivePressureThreshold?: number;
  // ═══ Mini-stage 2: the reverse gear's speed dials (the coupled design checkpoint §4) ═══
  /** De-adoption speed for cognitive AI (rate points/yr) when the gear fires. Default 0.10
   *  (the skeleton's value, honest-uncited → episode-anchored). Range 0-0.5. */
  deAdoptionRateCognitive?: number;
  /** De-adoption speed for embodied AI (rate points/yr). Default 0.05 (same status). Range 0-0.5. */
  deAdoptionRateEmbodied?: number;
  /** Post-decline re-engagement cap as a FRACTION of the class de-adoption rate (the
   *  labor-economics asymmetry: layoffs fast, re-engagement slow). Default 0.5 — UNCITED,
   *  honest-flagged. Range 0-1. */
  reAdoptionRate?: number;
  // ═══ Mini-stage 3: the duration-structured pool's dials (checkpoint §5) ═══
  /** Discouragement hazard base (/yr). Default 0.05 (CPS U→N anchor, honest-flagged). Range 0-0.3. */
  exitBase?: number;
  /** Exit-hazard duration slope (/duration-yr). Default 0.3 (same anchor). Range 0-1. */
  exitDurationSlope?: number;
  /** Employability decay per jobless year. Default 0.10 (KLN callback decay). Range 0-0.3. */
  atrophyRate?: number;
  /** Re-entry wage scarring per jobless year, cap 0.25. Default 0.02 (JLS/DvW). Range 0-0.1. */
  wageScarringRate?: number;
  /** Productivity multiplier at full capability and full Better score (AI-replacement mode). Default 2.0. */
  /** DEPRECATED (Production Program Stage 2, order item 5): the dial retired with the
   *  ledger's VALUE-ADDED re-anchor — no engine reader remains (the deflation channel
   *  consumes the frozen constant). Key retained for persisted-config compatibility. */
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
  /** FS-6b: the wage-proportional enhanced-UI increment inside transferChannelAddition —
   * exposed so the quintile measurement layer routes it by displaced wage mass. */
  enhancedUIAddition: number;
  /** FS-6b: the flat per-head support inside transferChannelAddition (retraining bonus +
   * stipends) — routed by displaced headcount in the measurement layer. */
  displacedFlatAddition: number;
  /** Close-out §9 item 3: the wage the enhanced-UI benefit was priced at this year — the
   * unemployed pool's composition-weighted prior wage (displaced at the pool average,
   * frictional at the economy average). Equals the economy average when no displacement
   * exists. Exposed for the attribution assertion. */
  uiPricingWage: number;
  totalPolicyIncome: number;
  fiscalCost: number;            // total cost of all active policies (includes SWF contribution)
  fiscalCostAsPercentGDP: number;
  sovereignFundSize: number;
  swfAnnualContribution: number; // billions — government outlay to SWF (Phase 5h Fix 5)
  requiredAssetOwnership: number;  // to maintain baseline CWI
  requiredTransferLevel: number;   // to maintain baseline CWI
  /** Stage H addendum (A-6): the AI-profit base the equity-stakes and profit-sharing payouts
   *  were priced from this year — prior-year realized ENDOGENOUS AI corporate profits
   *  (MacroOutput.aiCorporateProfits at t−1; 0 at year 0). Exposed for the attribution
   *  assertion (the uiPricingWage pattern): the consumed base must equal the lagged
   *  endogenous series exactly; a silent regression to an exogenous path breaks the guard. */
  aiProfitPayoutBase: number;
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

export type DashboardView = 'overview' | 'economics' | 'policy' | 'fiscal' | 'occupations' | 'monetary' | 'methodology' | 'predictions' | 'advanced' | 'axes'; // R3a': 'advanced' = the power surface; 'axes' RETIRED (heals to 'advanced' — the board re-hosted into the sidebar)

/** The shared quintile-chart view (the quintile view redesign): the two-line default
 *  (Top 20% vs the Bottom-80% average) or the full five-quintile display. One store
 *  key drives EVERY quintile-rendering chart — one control, one behavior. */
export type QuintileViewMode = 'top-vs-rest' | 'all';

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
  /** The composition's data-calibration slot (the AEI program): the active preset id
   *  at save time, or null/absent ⇒ none. Provenance travels with the scenario; an
   *  import whose snapshot no longer ships follows the loud-loss pattern (named in
   *  the import status, slot cleared — never silently dropped). Retained as the legacy
   *  location; the slot now also travels inside `composition`. */
  dataCalibration?: string | null;
  /** THE COMPLETE WORLD'S SELECTIONS (the Scenarios bug pass: saves previously captured
   *  the config only — the worldview NEVER traveled, so "your saves restore the complete
   *  world" was false until this field): belief axes, scheduled events, policy packages,
   *  and the data-calibration slot. Absent on earlier saves ⇒ empty selections at load.
   *  Structurally identical to the store's CompositionState. */
  composition?: {
    axes: Partial<Record<string, string>>;
    /** Lockstep with the store's CompositionState row (the duration/severity build). */
    events: Array<{ id: string; anchorYear: number; durationYears?: number; severity?: 'mild' | 'medium' | 'severe' }>;
    /** Lockstep with the store's CompositionState row (the per-field policy rebuild);
     *  load boundaries normalize the legacy bare-string form via normalizePolicyRefs. */
    policies: Array<{ id: string; params?: Record<string, number> }>;
    dataCalibration?: string | null;
  };
  /** The user's touched (shadow-winning) dial keys at save time (the per-field policy
   *  rebuild): without carrying these, a schedule-key shadow — invisible to the scalar
   *  diff the load path rebuilds touches from — un-shadows on load and a composed
   *  package silently re-wins over the user's Advanced edit. Absent on earlier saves ⇒
   *  the scalar-diff reconstruction stands alone. */
  touchedKeys?: string[];
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
