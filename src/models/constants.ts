/**
 * ATLAS Economic Model Constants
 *
 * Every constant used in the model is defined here with a source citation.
 * No magic numbers anywhere else in src/models/.
 *
 * Source abbreviations:
 *   BLS  = Bureau of Labor Statistics
 *   BEA  = Bureau of Economic Analysis
 *   FRED = Federal Reserve Economic Data
 *   CBO  = Congressional Budget Office
 *   ATA  = American Trucking Associations
 */

import type {
  CapabilityVectorId,
  CapabilityTrajectoryParams,
  DeploymentType,
  AdoptionParams,
  AlphaDriverParams,
  TokenCostCurveParams,
  PolicyConfig,
  SupplyChainInputs,
  SupplyChainResilience,
  TrainingComposition,
  DeploymentCostComposition,
  SupplyInputKey,
  BFCSDimension,
} from '@/types';
import { govData, validateGovernmentData, buildSectorCPIWeights } from '@/data/loadGovernmentData';

// ============================================================
// 1. Simulation Defaults
// ============================================================

/** Default simulation start year */
export const DEFAULT_START_YEAR = 2025;

/** Default simulation end year */
export const DEFAULT_END_YEAR = 2050;

// ============================================================
// 2. Population & Labor Force
// ============================================================

/**
 * US total population estimate for 2025.
 * Source: US Census Bureau Population Projections (2023 release)
 */
export const US_POPULATION_2025 = 340_000_000;

/**
 * US civilian labor force.
 * Source: BLS Current Population Survey (CPS), series LNS11000000, via src/data/bls/labor-force.json
 * DEPRECATED: was 168_000_000
 */
export const US_LABOR_FORCE_2025 = govData.laborForce;

/**
 * Default annual population growth rate.
 * Source: US Census Bureau Population Projections (2023 release), middle series
 */
export const DEFAULT_POPULATION_GROWTH_RATE = 0.004;

/**
 * Fraction of US population at or above given age thresholds.
 * Used for more accurate UBI eligibility calculation.
 * Source: US Census Bureau 2024 Population Estimates by Single Year of Age.
 * Key values: age 18 → 78.4%, age 21 → 74.9%, age 25 → 69.3%
 */
export const AGE_THRESHOLD_FRACTIONS: Record<number, number> = {
  0: 1.000,
  16: 0.810,
  17: 0.797,
  18: 0.784,
  19: 0.771,
  20: 0.758,
  21: 0.749,
  22: 0.739,
  23: 0.726,
  24: 0.713,
  25: 0.693,
};

/**
 * Baseline total nonfarm employment (CES establishment survey).
 * Source: BLS CES Total Nonfarm Employment, series CES0000000001, via src/data/bls/total-employment.json
 * In Phase 3+, per-cluster employment comes from src/data/bls/oews-data.json.
 * This constant serves as the normalization anchor for cluster employment.
 * NOTE: CES excludes self-employed, agricultural workers. For labor market aggregates
 * (unemployment rate), use BASELINE_CPS_EMPLOYMENT instead.
 * DEPRECATED: was 158_316_000
 */
export const BASELINE_TOTAL_EMPLOYMENT = govData.totalEmployment;

/**
 * Baseline CPS (household survey) employment.
 * DIFFERENT from BASELINE_TOTAL_EMPLOYMENT (CES nonfarm payrolls).
 * CPS includes self-employed, agricultural, private household workers.
 * Used for unemployment calculations to match BLS published unemployment rate.
 * Source: FRED LNS12000000 (Civilian Employment Level), via src/data/fred/cps-employment.json
 */
export const BASELINE_CPS_EMPLOYMENT = govData.cpsEmployment;

/**
 * Survey bridging constant: CPS household employment minus CES nonfarm payrolls.
 * Accounts for the methodological gap between the two BLS surveys.
 * CPS counts ALL civilian workers; CES counts only nonfarm payroll jobs.
 * This constant ensures unemployment = LaborForce - (ClusterEmployment + offset)
 * produces a rate consistent with BLS published figures (~4.4%).
 * Source: Derived as BASELINE_CPS_EMPLOYMENT - BASELINE_TOTAL_EMPLOYMENT
 */
export const NON_CLUSTER_EMPLOYED = BASELINE_CPS_EMPLOYMENT - BASELINE_TOTAL_EMPLOYMENT;

/**
 * Baseline CPI value (2024 annual average, CPI-U All Items).
 * Source: BLS CPI series CUUR0000SA0, period M13 (Annual), 2024 = 313.689
 * Used to normalize the price level baseline (2025 = 1.0 in the model).
 * In Phase 3+, historical CPI comes from src/data/bls/cpi-data.json.
 */
// DEPRECATED (Phase 5h): Exported but never imported anywhere. Historical CPI comes from cpi-data.json.
// export const BASELINE_CPI_2024 = 313.689;

// ============================================================
// 3. Capability Trajectory Defaults
// ============================================================

/**
 * Default capability trajectory parameters per vector.
 * Sources:
 *   - Language/Code/Agent: Derived from SWE-bench, MMLU, GPQA benchmarks (2024-2025)
 *   - Robotics: Tesla Optimus production milestones, unstructured task completion rates
 *   - AV: Tesla FSD safety multiples, Cybercab/Semi deployment timelines
 *   - Generative: Human indistinguishability rates across modalities
 *   - Scientific: AlphaFold-level breakthrough frequency, drug candidate success rates
 */
// DEPRECATED: Old 8-vector capability trajectories
// export const OLD_DEFAULT_CAPABILITY_TRAJECTORIES = {
//   lang: { floor: 0.75, ceiling: 0.98, steepness: 0.8, midpointYear: 2028 },
//   code: { floor: 0.70, ceiling: 0.97, steepness: 0.9, midpointYear: 2028 },
//   agent: { floor: 0.40, ceiling: 0.95, steepness: 0.7, midpointYear: 2029 },
//   decide: { floor: 0.50, ceiling: 0.95, steepness: 0.6, midpointYear: 2030 },
//   robot: { floor: 0.20, ceiling: 0.90, steepness: 0.4, midpointYear: 2033 },
//   auto: { floor: 0.35, ceiling: 0.95, steepness: 0.5, midpointYear: 2031 },
//   gen: { floor: 0.65, ceiling: 0.98, steepness: 0.85, midpointYear: 2027 },
//   sci: { floor: 0.45, ceiling: 0.95, steepness: 0.5, midpointYear: 2032 },
// };

/**
 * Default capability trajectory parameters per vector (3-vector consolidated system).
 * Sources:
 *   - Generative: Composite of lang/code/gen/sci benchmarks (2024-2025)
 *   - Agentic: Composite of agent/decide benchmarks (2024-2025)
 *   - Embodied: Composite of robot/auto benchmarks (Tesla Optimus, FSD)
 */
export const DEFAULT_CAPABILITY_TRAJECTORIES: Record<CapabilityVectorId, CapabilityTrajectoryParams> = {
  generative: {
    floor: 0.10,       // Language, code, creative, scientific (merges lang/code/gen/sci)
    ceiling: 0.95,
    steepness: 1.0,    // Fast — software-only scaling, rapid saturation around the midpoint
    midpointYear: 2029,
  },
  agentic: {
    floor: 0.05,       // Multi-step workflows, decisions (merges agent/decide)
    ceiling: 0.90,
    steepness: 1.0,    // Fast — follows generative once reliable tool-use generalizes
    midpointYear: 2031,
  },
  embodied: {
    floor: 0.02,       // Robotics, autonomous vehicles (merges robot/auto)
    ceiling: 0.85,     // Physical world harder — may not reach 1.0
    steepness: 0.3,    // Gradual — manufacturing throughput + regulatory gating spread the ramp
    midpointYear: 2035,
  },
};

// ============================================================
// 4. Capability Vector Metadata
// ============================================================

/**
 * Display metadata for each capability vector.
 * Colors from DESIGN_PHILOSOPHY.md capability vector palette.
 */
// DEPRECATED: Old 8-vector metadata — see above for old vector IDs
export const CAPABILITY_VECTOR_METADATA: Record<CapabilityVectorId, {
  name: string;
  description: string;
  color: string;
}> = {
  generative: {
    name: 'Generative AI',
    description: 'Language, code, creative, scientific (merges lang/code/gen/sci)',
    color: '#3B82F6', // Electric Blue
  },
  agentic: {
    name: 'Agentic AI',
    description: 'Multi-step workflows, decisions (merges agent/decide)',
    color: '#F59E0B', // Amber
  },
  embodied: {
    name: 'Embodied AI',
    description: 'Robotics, autonomous vehicles (merges robot/auto)',
    color: '#EF4444', // Red/Coral
  },
};

// ============================================================
// 5. Adoption Dynamics Constants
// ============================================================

/**
 * Default S-curve steepness by deployment type.
 * Source: DATA_MODEL.md Section 3.2
 *   Software: 2.0-4.0 → default 3.0
 *   Robotics: 0.5-1.0 → default 0.75
 *   AV: 0.3-1.5 → default 0.8
 *   Hybrid: average of software and most-relevant physical → default 1.5
 */
export const DEFAULT_ADOPTION_STEEPNESS: Record<DeploymentType, number> = {
  software: 3.0,
  robotics: 0.75,
  autonomous_vehicle: 0.8,
  hybrid: 1.5,
};

/**
 * Default competitive pressure multiplier.
 * Source: DATA_MODEL.md Section 3.3
 * Models: once adoption > 20%, holdouts face accelerating cost disadvantage.
 */
export const DEFAULT_COMPETITIVE_PRESSURE_MULTIPLIER = 2.0;

/**
 * Adoption rate threshold at which competitive pressure kicks in.
 * Source: DATA_MODEL.md Section 3.3
 */
export const DEFAULT_COMPETITIVE_PRESSURE_THRESHOLD = 0.2;

/**
 * Default geopolitical risk factor for robotics/AV supply chains.
 * Source: DATA_MODEL.md Section 3.2 — range [0, 0.5], default moderate risk
 */
export const DEFAULT_GEOPOLITICAL_RISK_FACTOR = 0.1;

/**
 * Bundled default adoption params.
 */
export const DEFAULT_ADOPTION_PARAMS: AdoptionParams = {
  steepnessByDeployment: DEFAULT_ADOPTION_STEEPNESS,
  competitivePressureMultiplier: DEFAULT_COMPETITIVE_PRESSURE_MULTIPLIER,
  competitivePressureThreshold: DEFAULT_COMPETITIVE_PRESSURE_THRESHOLD,
  geopoliticalRiskFactor: DEFAULT_GEOPOLITICAL_RISK_FACTOR,
};

// ============================================================
// 6. Displacement Constants
// ============================================================

// DEPRECATED: Old displacement constants — replaced by dynamic quadratic formula (Phase 8 consolidation)
// productivityToHeadcountRatio is now optional on OccupationCluster, kept for reference only.
// Displacement is now: displacementPct = adoptionRate × weightedCapability²
// export const DEFAULT_PRODUCTIVITY_TO_HEADCOUNT_RATIO = 0.7;
// export const TEACHERS_HEADCOUNT_RATIO = 0.1;
// export const ADMIN_DISPLACEMENT_HEADCOUNT_RATIO = 1.0;

/**
 * Default wage elasticity — how much automation depresses wages.
 * High for easily substitutable (data entry: 0.9), low for licensed/union (electricians: 0.3).
 * Source: DATA_MODEL.md Section 4.2
 */
export const DEFAULT_WAGE_ELASTICITY = 0.6;

// ============================================================
// 7. Macro Model Constants
// ============================================================

/**
 * Baseline income composition.
 * Source: BEA NIPA Table 2.1, via src/data/bea/personal-income.json
 * DEPRECATED: was 0.60 / 0.20 / 0.20
 */
export const BASELINE_WAGE_SHARE = govData.wageShare;
export const BASELINE_ASSET_SHARE = govData.assetShare;
export const BASELINE_TRANSFER_SHARE = govData.transferShare;

// === Income Distribution: Bottom 80% Shares ===
// What fraction of each aggregate income channel reaches the bottom 80% of households.
// Source: CBO "Distribution of Household Income, 2022" (January 2026)
//   + CRS Report R44705 citing CBO capital income data by quintile.
//   Labor: bottom 4 quintiles receive ~45% of aggregate labor income.
//   Transfers: bottom 4 quintiles receive ~78% (means-tested concentrated in Q1-Q2).
//   Capital: bottom 4 quintiles receive ~12% (CBO: 2-3% per quintile vs 17% for Q5).
// These values change slowly — asset concentration stable for decades.
export const BOTTOM80_WAGE_SHARE = 0.45;
export const BOTTOM80_TRANSFER_SHARE = 0.78;
export const BOTTOM80_ASSET_SHARE = 0.12;
export const BOTTOM80_POP_SHARE = 0.80;

// ═══ STAGE 8 (ratified): the quintile measurement layer ═══
/** Quintile income-source shares — CBO "The Distribution of Household Income" (2021 data, 2024
 *  release) + CRS R44705, CONSISTENT with the cited BOTTOM80_* constants above (single source of
 *  truth: each row's bottom-4 sum equals the standing bottom-80 share). S8-R2(a): provenance at
 *  the slot; vintage stated. */
export const QUINTILE_WAGE_SHARES = [0.04, 0.09, 0.13, 0.19, 0.55];      // Σ=1; bottom-4 = 0.45 = BOTTOM80_WAGE_SHARE
export const QUINTILE_TRANSFER_SHARES = [0.32, 0.21, 0.15, 0.10, 0.22];  // Σ=1; bottom-4 = 0.78 = BOTTOM80_TRANSFER_SHARE
export const QUINTILE_ASSET_SHARES = [0.01, 0.02, 0.03, 0.06, 0.88];     // Σ=1; bottom-4 = 0.12 = BOTTOM80_ASSET_SHARE
/** S8-R1 (ratified): CEX quintile expenditure shares on the CONSUMPTION base — BLS CEX Table 1101
 *  (2023), EXCLUDING personal insurance & pensions (~9-15% of totals, Q5-heavy: SS contributions +
 *  retirement saving = saving, not consumption) and cash contributions, per CPI-weight practice;
 *  renormalized. The financial/insurance→aiExposed mapping includes only CONSUMED financial
 *  services and insurance, never pensions. Pre-registration honored: Q5 aiExposed ≈ 0.37 on the
 *  consumption base (vs 0.45 indicative on the totals base). Rows sum to 1. Sector mapping per
 *  the R10 style (shelter incl. lodging; foodEnergy = food + utilities + gasoline; laborServices =
 *  health/education/personal services; aiExposed = goods, vehicles, transport ex-fuel,
 *  entertainment, consumed financial services). */
export const CEX_QUINTILE_SECTOR_SHARES: ReadonlyArray<{ shelter: number; foodEnergy: number; laborServices: number; aiExposed: number }> = [
  { shelter: 0.28, foodEnergy: 0.26, laborServices: 0.21, aiExposed: 0.25 },  // Q1
  { shelter: 0.24, foodEnergy: 0.24, laborServices: 0.22, aiExposed: 0.30 },  // Q2
  { shelter: 0.22, foodEnergy: 0.22, laborServices: 0.22, aiExposed: 0.34 },  // Q3
  { shelter: 0.21, foodEnergy: 0.20, laborServices: 0.22, aiExposed: 0.37 },  // Q4
  { shelter: 0.20, foodEnergy: 0.17, laborServices: 0.26, aiExposed: 0.37 },  // Q5
];
/** S8-R3 (ratified): the stock-vintage rent kernel's MEAN LAG (yrs) — the kernel DERIVES from
 *  this dial (linear-interpolated taps with mean lag exactly = the dial). Default 1.0 = the cited
 *  NTRR 4-quarter lead of market over CPI-stock rents (BLS New-Tenant Rent Research). S8-R4:
 *  Q5's shelter exposure uses the rent index as the OER proxy per BLS methodology (OER is
 *  measured from rent samples). Display-only; zero model feedback. Range 0-2; 0 = marginal. */
export const DEFAULT_RENT_VINTAGE_LAG_YEARS = 1.0;

/**
 * Base inflation rate (actual CPI-U annual change).
 * Source: BLS CPI-U All Items (series CUUR0000SA0), via src/data/bls/cpi-sector-indices.json
 * Loaded dynamically by src/data/loadGovernmentData.ts at module init.
 * NOT hardcoded — reflects actual measured inflation from most recent BLS data.
 * Previously was 0.02 (Fed target); updated to data-driven in Phase 8.
 */
export const BASE_INFLATION_RATE = govData.baseInflationRate;
/** E-9 item 1 (F-D, ratified): the NON-SHELTER sector anchor — the coherent complement of the
 *  all-items series. BASE_INFLATION_RATE is CPI-U ALL ITEMS (CUUR0000SA0), which already CONTAINS
 *  shelter running ≈3.3%/yr (BLS CPI shelter, 2000-2024 average); applying the all-items number to
 *  the non-shelter sectors while shelter is computed structurally on top double-counted shelter's
 *  premium (the F-D finding). Derivation, from the constant's own citations:
 *    (allItems − w_shelter × shelterTrend)/(1 − w_shelter) = (0.0261 − 0.36×0.033)/0.64 ≈ 0.0222.
 *  PROVENANCE (ledger entry 2): the all-items value was CORRECT in the pre-Stage-1 single-bucket
 *  architecture and became incoherent when Stage 1 repartitioned the basket without re-deriving it —
 *  a remediation-era omission; the basis-sweep (MONETARY_AUDIT §1) is the standing control. */
export const HISTORICAL_SHELTER_CPI_TREND = 0.033;
// reason: mirrors BASELINE_SHELTER_CPI_WEIGHT (defined below, TDZ) — same BLS relative-importance source.
const BASELINE_SHELTER_CPI_WEIGHT_FOR_ANCHOR = 0.36;
export const NON_SHELTER_BASE_INFLATION = (() => {
  return (govData.baseInflationRate - BASELINE_SHELTER_CPI_WEIGHT_FOR_ANCHOR * HISTORICAL_SHELTER_CPI_TREND)
    / (1 - BASELINE_SHELTER_CPI_WEIGHT_FOR_ANCHOR);
})();

// DEPRECATED (Phase 5h): Superseded by MPC_WAGE / MPC_ASSET / MPC_TRANSFER in Phase 3 demand model.
// Was: Marginal propensity to consume for US economy (consumption-to-GDP ratio C/Y).
// Source: BEA NIPA Table 1.1.5, via src/data/bea/gdp-components.json
// export const MARGINAL_PROPENSITY_TO_CONSUME = govData.consumptionRatio;

/**
 * Marginal propensity to consume out of WAGE income.
 * Workers spend most of their income on necessities.
 * Source: Jappelli & Pistaferri (2014) "Fiscal Policy and MPC Heterogeneity";
 *         BLS Consumer Expenditure Survey 2023
 * Range: 0 to 1
 */
// DEPRECATED (Phase 5-tax): pre-tax MPC, replaced by DEFAULT_POST_TAX_MPC_WAGE (0.95).
export const MPC_WAGE = 0.80;

/**
 * Marginal propensity to consume out of ASSET income.
 * Capital owners have higher savings rates; most asset income is reinvested.
 * Source: Carroll et al (2017) "Distribution of Wealth and MPC";
 *         Federal Reserve Survey of Consumer Finances
 * Range: 0 to 1
 */
// DEPRECATED (Phase 5-tax): pre-tax MPC, replaced by DEFAULT_POST_TAX_MPC_ASSET (0.42).
export const MPC_ASSET = 0.35;

/**
 * Marginal propensity to consume out of TRANSFER income.
 * Recipients spend nearly all transfer income (means-tested, low-income).
 * Source: Parker et al (2013) "Consumer Spending and the Economic Stimulus Payments";
 *         Sahm et al (2010) "Household Response to the 2008 Tax Rebates"
 * Range: 0 to 1
 */
// DEPRECATED (Phase 5-tax): pre-tax MPC, replaced by DEFAULT_POST_TAX_MPC_TRANSFER (0.95).
export const MPC_TRANSFER = 0.90;

/**
 * Profit realization sensitivity exponent.
 * Controls how strongly capacity utilization constrains AI profit growth.
 * profitRealizationRate = prevCapacityUtilization ^ sensitivity
 * At 1.0: linear (80% utilization → 80% profits)
 * At 0.5: soft (80% utilization → 89% profits)
 * At 2.0: harsh (80% utilization → 64% profits)
 * Source: Calibrated from corporate earnings cyclicality vs. capacity utilization (Fed G.17)
 * Range: 0 to 2
 */
// DEPRECATED: profitRealizationSensitivity replaced by endogenous capital gains realization rate
// export const PROFIT_REALIZATION_SENSITIVITY = 1.0;

/**
 * Baseline real GDP growth rate. Represents long-run
 * productivity trend WITHOUT AI effects. AI productivity
 * gains flow through deflation (cheaper output) and profit
 * boost (asset income), not through this rate.
 *
 * Increase this to model AI-driven output EXPANSION beyond
 * cost reduction (new products, new services, new industries
 * that don't exist today).
 *
 * User-adjustable via SimulationConfig.baselineGDPGrowth.
 * CSV parameter: baseline_gdp_growth
 *
 * Source: CBO Long-Term Budget Outlook 2024 (~2% trend)
 * Range: 0.01 to 0.05
 */
export const BASELINE_GDP_GROWTH_RATE = 0.02;

// REMOVED in Phase 3c: BASELINE_NOMINAL_GDP_GROWTH_RATE was only used to derive the fictional
// cumulativeNominalGrowthFactor. Income now derives from actual prevNomGDP × share.

/**
 * Baseline nominal GDP for 2025.
 * Source: BEA NIPA Table 1.1.5, via src/data/bea/gdp-components.json
 * DEPRECATED: was 29_000_000_000_000
 */
export const BASELINE_GDP_NOMINAL_2025 = govData.gdpNominal;

/**
 * Baseline real GDP for 2025 (2017 chained dollars, trillions).
 * Source: BEA
 */
export const BASELINE_GDP_REAL_2025 = 23_000_000_000_000; // $23T

// DEPRECATED: Old ARPP-based revenue pressure sensitivity (replaced by GDP-based in Phase 1 overhaul)
// export const REVENUE_PRESSURE_SENSITIVITY = 1.5;

/**
 * Revenue pressure sensitivity — how much GDP contraction accelerates automation.
 * McKinsey (2020) found COVID caused 3-4 years of digital acceleration in ~1 year for ~10% revenue shock.
 * Sensitivity 1.5 matches this: 10% contraction → 15% acceleration.
 * Range: 0 (disabled) to 3.0
 */
export const REVENUE_PRESSURE_SENSITIVITY_DEFAULT = 1.5;

/**
 * Revenue pressure cap — maximum automation acceleration from economic pressure.
 * Large enterprises have procurement/integration timelines limiting adoption speed.
 * Range: 0 to 1.0
 */
export const REVENUE_PRESSURE_CAP = 0.3;

/**
 * Revenue pressure decay — how quickly pressure fades when conditions improve.
 * Half-life ~1 year (0.5 decay factor). Prevents infinite compounding.
 * Range: 0 (instant decay) to 1.0 (no decay)
 */
export const REVENUE_PRESSURE_DECAY = 0.5;

/**
 * AI wage productivity multiplier — wage boost for workers augmented by AI.
 * Peaks at 50% automation coverage (hump-shaped: coverage × multiplier × (1 - coverage)).
 * Source: Goldman Sachs, McKinsey (2023-2024) — firms laying off junior staff while
 * raising compensation for AI-proficient senior staff.
 * Range: 0 (disabled) to 1.0
 *
 * DEPRECATED (Phase 10.A): Replaced by DEFAULT_SCARCITY_INTENSITY.
 * The Phase 10.A Phillips Mechanism 2 rewrites the wage-scarcity term as an AI-displacement-aware
 * scarcity premium scaled by aggregateReplacementDifficultyWagePremium. Retained for legacy scenarios.
 */
export const AI_WAGE_PRODUCTIVITY_MULTIPLIER = 0.5;

/**
 * Number of consecutive GDP decline quarters to flag depression.
 * Source: DATA_MODEL.md Section 5.7
 */
export const DEPRESSION_CONSECUTIVE_DECLINE_QUARTERS = 4;

/**
 * Unemployment rate threshold for depression flag.
 * Source: DATA_MODEL.md Section 5.7
 */
export const DEPRESSION_UNEMPLOYMENT_THRESHOLD = 0.15;

/**
 * Baseline average annual wage (derived from BLS CES hourly earnings × weekly hours × 52).
 * Source: BLS CES series CES0500000003 (earnings) + CES0500000002 (hours), via src/data/bls/labor-market.json
 * In Phase 3+, per-cluster wages come from src/data/bls/oews-data.json.
 * This constant serves as a fallback for clusters without BLS data.
 * DEPRECATED: was 65_470
 */
export const BASELINE_AVERAGE_ANNUAL_WAGE = Math.round(govData.avgHourlyEarnings * govData.avgWeeklyHours * 52);

// ============================================================
// Stage 5 (H3 / OD-4): Unified incremental-UE transfer support
// ============================================================
// Support per incremental unemployed person, split into CASH (→ household transfer income → MPC →
// consumption) and IN-KIND (→ PCE consumption directly + fiscal cost). Single source of truth: the
// income statement, the consumption identity, and the federal budget all read these two constants.
// Both user-adjustable (config.cashTransferPerUnemployed / config.inKindTransferPerUnemployed).
//
// FORWARD DERIVATION — stock-average, current-law automatic stabilizers. The model multiplies these
// by the incremental unemployed STOCK every year, so each component must be a point-in-time stock
// average with recipiency and exhaustion baked in — NOT a first-year flow at full take-up:
//   UI ≈ $6,260/yr — DOL ETA UI Data Summary (CY2024): avg weekly benefit ≈ $430; stock recipiency
//        (insured unemployed ÷ total unemployed) ≈ 28% → 0.28 × $430 × 52 ≈ $6,261. Exhaustion and
//        eligibility live inside the 28%; current-law EB extensions partially offset at high IUR.
//   SNAP ≈ $1,700/yr — USDA FNS SNAP data tables (FY2024): avg household benefit ≈ $345/mo; SNAP
//        receipt among unemployed-worker households ≈ 40% → 0.40 × $345 × 12 ≈ $1,656.
//   CASH = $6,260 + $1,700 ≈ $7,960 → 8,000
//   Medicaid ≈ $4,500/yr — KFF Medicaid spending per enrollee (FY2021: full-benefit adult ≈ $7,100,
//        child ≈ $3,200) × Great-Recession enrollment elasticity ≈ 0.75 enrollee-equivalents per
//        additional unemployed (enrollment +6M vs unemployment +8M, 2007–2012) × ~$6,000 blended.
//   Other in-kind ≈ $500/yr — ACA marketplace premium tax credits for the UI-income tier (KFF APTC).
//   IN-KIND = $4,500 + $500 = 5,000
export const DEFAULT_CASH_TRANSFER_PER_UNEMPLOYED = 8_000;
export const DEFAULT_IN_KIND_TRANSFER_PER_UNEMPLOYED = 5_000;
/**
 * DEPRECATED (Stage 5 / H3): legacy all-in constant, retired from the model loop. The $19,200
 * ("~$1,600/month, DOL UI data") implied 100% UI recipiency with no exhaustion — ~1.5× the
 * recipiency-adjusted stock average derived above ($13,000). New code must read the CASH/IN-KIND
 * split constants; this is kept only as a historical reference (no-delete rule).
 */
export const BASELINE_TRANSFER_PER_UNEMPLOYED = 19_200;

/**
 * Stage 5: current-law UI statutory generosity — the ZERO-INCREMENT anchor for the enhanced-UI
 * policy lever. The default config runs enhancedUI at exactly these settings (its representation of
 * current law), so the lever must cost $0 there and charge only generosity ABOVE statute. This is a
 * different basis from the stock-average cash support above: the $8,000 is current law's REALIZED
 * per-stock-person cost (~28% recipiency); the policy increment is statutory generosity at the
 * policy's own (full) take-up. Netting the lever against the realized average would charge the
 * recipiency gap as if it were new policy.
 * Source: DOL — average UI replacement ~45% of prior wage; standard state duration 26 weeks.
 */
export const CURRENT_LAW_UI_REPLACEMENT_RATE = 0.45;
export const CURRENT_LAW_UI_DURATION_WEEKS = 26;

// ═══ FS-6f hygiene: unit conversions + indexed-UBI defaults (the named-constant rule) ═══
/** Hours in a standard full-time work year: 40 hours × 52 weeks (the BLS full-time convention). */
export const HOURS_PER_WORK_YEAR = 2080;
/** Unit conversion. */
export const MONTHS_PER_YEAR = 12;
/** Unit conversion. */
export const WEEKS_PER_YEAR = 52;
/** Unit conversion for config fields denominated in billions of dollars. */
export const DOLLARS_PER_BILLION = 1_000_000_000;
/** Indexed-UBI defaults used when the config omits the fields. Uncited design defaults
 * (honest status) — user-adjustable via UBIPolicy.indexedBaseAmount / indexedStartYear /
 * productivityIndexRate. */
export const DEFAULT_INDEXED_UBI_BASE_MONTHLY = 1000;
export const DEFAULT_INDEXED_UBI_START_YEAR = 2032;
export const DEFAULT_UBI_PRODUCTIVITY_INDEX_RATE = 1.0;
/** Floor on both AI-GDP legs of the indexed-UBI growth ratio. reason: a numerical guard
 * against division by near-zero in pre-takeoff years, not an economic parameter. */
export const INDEXED_UBI_AI_GDP_FLOOR = 1_000_000_000;

// DEPRECATED (Phase 5h): Imported in macro.ts but never referenced in any function body.
// Asset income is computed from shares × total income, not from a per-capita constant.
// Was: Baseline asset income per capita (annual, dividends + interest + capital gains).
// Source: BEA Personal Income, property income component / population
// export const BASELINE_ASSET_INCOME_PER_CAPITA = 12_000;

/**
 * Baseline price level index (2025 = 1.0).
 * All future price levels are relative to this.
 */
export const BASELINE_PRICE_LEVEL = 1.0;

/**
 * Baseline national income (GDP ≈ National Income at t=0).
 * Used to derive 60/20/20 income channel baselines.
 * Source: BEA GDP estimate 2025 ≈ $29T; GDP used as proxy for gross national income
 */
export const BASELINE_NATIONAL_INCOME = BASELINE_GDP_NOMINAL_2025;

/**
 * Baseline wage income (60% of national income).
 * Includes wages, salaries, and employer compensation — broader than
 * E × OEWS_mean_wage ($10.4T), which captures direct wages only.
 * Source: BEA Personal Income tables; CBO Distribution of Household Income
 */
export const BASELINE_WAGE_INCOME = BASELINE_WAGE_SHARE * BASELINE_NATIONAL_INCOME;

/**
 * Baseline asset income (20% of national income).
 * Dividends, interest, capital gains, rental income.
 * Source: BEA Personal Income tables — property income component
 */
export const BASELINE_ASSET_INCOME = BASELINE_ASSET_SHARE * BASELINE_NATIONAL_INCOME;

/**
 * Non-corporate asset income as share of GDP.
 * Includes: personal interest income, rental income, capital portion of proprietor's income.
 * CALIBRATED AS RESIDUAL from BEA data to ensure t=0 asset income matches exactly:
 *   NON_CORPORATE_ASSET_SHARE = (BASELINE_ASSET_INCOME - baseline_dividends) / BASELINE_GDP_NOMINAL_2025
 * Source: BEA NIPA Table 2.1 (personal interest, rental, proprietor's income).
 */
export const NON_CORPORATE_ASSET_SHARE = (() => {
  const corpProfitsBT = govData.baselineProfitGDPRatio * BASELINE_GDP_NOMINAL_2025;
  const afterTaxProfits = corpProfitsBT * (1 - govData.effectiveCorporateTaxRate);
  const baselineDividends = afterTaxProfits * (1 - govData.corporateRetentionRate);
  return (BASELINE_ASSET_INCOME - baselineDividends) / BASELINE_GDP_NOMINAL_2025;
})();

/**
 * Baseline transfer income (20% of national income).
 * Existing government transfers: Social Security (~$1.3T), Medicare (~$900B),
 * Medicaid (~$800B), UI, SNAP, disability, etc. These exist regardless of
 * ATLAS policy toggles. Policy channels ADD to this baseline, not replace it.
 * Source: BEA Personal Income tables — government social benefits to persons
 */
export const BASELINE_TRANSFER_INCOME = BASELINE_TRANSFER_SHARE * BASELINE_NATIONAL_INCOME;

/**
 * Baseline unemployment (labor force − CPS employment).
 * Uses CPS employment (not CES) so that all labor market aggregates
 * come from the same survey (Current Population Survey).
 * Used to compute incremental UI transfers above baseline.
 */
export const BASELINE_UNEMPLOYMENT = US_LABOR_FORCE_2025 - BASELINE_CPS_EMPLOYMENT;

// ============================================================
// 8. Sector Deflation & CPI Weights
// ============================================================

/**
 * Sector deflation intensity — how much full automation in a sector reduces consumer prices.
 * Higher = more labor-cost-intensive (automation removes more cost).
 * Values are BEA-calibrated labor cost shares by NAICS industry.
 * Source: BEA GDPbyIndustry Table 7 (Compensation as % of Value Added), 2024
 * DEPRECATED values (pre-calibration) preserved in comments.
 */
export const SECTOR_DEFLATION_INTENSITY: Record<string, number> = {
  // Tech (NAICS 51/54): Software marginal cost IS labor
  tech_swe: 0.75,        // was 0.8 — software: marginal cost is labor
  tech_data_ml: 0.70,    // was 0.8 — data work: mostly labor
  tech_it_support: 0.65, // was 0.8 — IT: labor + hardware
  tech_qa: 0.65,         // was 0.8 — QA: labor-intensive testing
  // Finance (NAICS 52/54): Capital-intensive except accounting
  finance_trading: 0.40,    // was 0.6 — trading: heavy capital
  finance_banking: 0.35,    // was 0.6 — banking: capital-intensive
  finance_accounting: 0.60, // was 0.6 — accounting: labor-intensive
  finance_insurance: 0.35,  // was 0.6 — insurance: capital-intensive
  // Health (NAICS 62): Equipment + labor mix
  health_physicians: 0.55,  // was 0.4 — clinical: equipment + labor
  health_nurses: 0.55,      // was 0.4 — nursing: labor + equipment
  health_technicians: 0.55, // was 0.4 — tech: equipment + labor
  health_home_health: 0.55, // was 0.4 — home health: labor-heavy
  health_admin: 0.60,       // was 0.4 — admin: mostly labor
  // Education (NAICS 61): Very labor-intensive
  edu_teachers: 0.70, // was 0.3 — education: very labor-intensive
  edu_admin: 0.65,    // was 0.3 — ed admin: labor + facilities
  edu_support: 0.65,  // was 0.3 — ed support: labor
  // Legal (NAICS 54/56): Labor-intensive
  legal_attorneys: 0.65,  // was 0.7 — legal: very labor-intensive
  legal_paralegals: 0.60, // was 0.7 — legal support: labor
  // Transport (NAICS 48-49): Vehicles + fuel dominate
  transport_trucking: 0.40,  // was 0.7 — transport: vehicles + fuel
  transport_delivery: 0.45,  // was 0.7 — delivery: vehicles + labor
  transport_taxi: 0.40,      // was 0.7 — taxi: vehicles + fuel
  transport_warehouse: 0.45, // was 0.7 — warehouse: infrastructure
  // Manufacturing (NAICS 31-33): Materials + equipment
  mfg_assembly: 0.35,    // was 0.5 — assembly: materials + equip
  mfg_machinists: 0.40,  // was 0.5 — machining: equip + labor
  mfg_qc: 0.40,          // was 0.5 — QC: instruments + labor
  // Construction (NAICS 23): Materials + labor
  construction_electricians: 0.45, // was 0.3 — trades: materials + labor
  construction_plumbers: 0.45,     // was 0.3 — trades: materials + labor
  construction_general: 0.50,      // was 0.3 — mgmt: labor-heavy
  construction_hvac: 0.45,         // was 0.3 — HVAC: equipment + labor
  // Retail (NAICS 44-45): Rent + inventory
  retail_cashiers: 0.45,    // was 0.5 — retail: rent + inventory
  retail_management: 0.45,  // was 0.5 — retail mgmt: labor
  retail_ecommerce: 0.50,   // was 0.5 — e-commerce: tech + labor
  // Food (NAICS 72/31-33): Ingredients + labor
  food_fast_food: 0.40,   // was 0.4 — fast food: ingredients + labor
  food_restaurant: 0.40,  // was 0.4 — restaurant: same
  food_industrial: 0.30,  // was 0.4 — food prod: raw materials
  // Creative (NAICS 51/54): Cost IS labor
  creative_design: 0.70,    // was 0.8 — design: mostly labor
  creative_writing: 0.75,   // was 0.8 — writing: cost IS labor
  creative_marketing: 0.60, // was 0.8 — marketing: labor + media
  creative_media: 0.65,     // was 0.8 — media: labor + distribution
  // Professional (NAICS 54/56/53): Mixed
  prof_consulting: 0.60,   // was 0.7 — consulting: labor-intensive
  prof_hr: 0.55,           // was 0.7 — HR: labor-intensive
  prof_real_estate: 0.15,  // was 0.7 — real estate: very capital-heavy
  prof_admin: 0.55,        // was 0.7 — admin: labor + overhead
  // Government (NAICS 92): Labor-intensive
  gov_federal: 0.60,     // was 0.3 — government: labor
  gov_state_local: 0.60, // was 0.3 — government: labor
  gov_postal: 0.45,      // was 0.3 — postal: labor + vehicles
  // Agriculture (NAICS 11/31-33): Land + inputs
  ag_farm_labor: 0.25, // was 0.4 — agriculture: land + inputs
  ag_equipment: 0.35,  // was 0.4 — ag equipment: materials
  // Science (NAICS 54): Equipment + labor
  sci_lab_research: 0.50, // was 0.5 — labs: equipment + labor
  sci_engineering: 0.55,  // was 0.5 — engineering: labor
  // Other
  other_uncategorized: 0.45, // was 0.4 — weighted average
};

/**
 * CPI weights by sector group — maps cluster prefixes to consumer price basket weight.
 * Multiple clusters within a group share the group's weight proportionally.
 * Sum = 1.0.
 * Source: BLS CPI Relative Importance weights (Dec 2024), via src/data/bls/cpi-sector-weights.json
 * DEPRECATED: was hardcoded (health: 0.085, food: 0.100, etc.)
 */
export const SECTOR_CPI_WEIGHTS: Record<string, number> = buildSectorCPIWeights(govData.cpiSectorWeights);

// ============================================================
// 8a0. Labor Supply Response Constants (Phase 5g Step 12)
// ============================================================

/**
 * Elasticity of labor force participation to UBI replacement rate.
 * Workers voluntarily withdraw when UBI + transfers exceed threshold fraction of wages.
 * Source: CBO (2012) — labor supply elasticity estimates, central value.
 * Range: 0 to 1.
 */
export const DEFAULT_PARTICIPATION_ELASTICITY = 0.15;

/**
 * Replacement rate threshold above which voluntary withdrawal begins.
 * Workers start reducing participation when UBI covers > 60% of their wages.
 * Source: Calibrated from Finnish Basic Income Experiment (2017-2018) + Stockton SEED.
 * Range: 0 to 1.
 */
export const DEFAULT_PARTICIPATION_THRESHOLD = 0.60;

// ============================================================
// 8a1. Minimum Wage Feedback Constants (Phase 5g Step 9)
// ============================================================

/**
 * Fraction of minimum wage increase passed through to prices.
 * Source: Harasztosi & Lindner (2019) — Hungarian MW study: 40% pass-through.
 * Meta-analysis: Leung (2021) — 30-50% range across 50+ studies.
 * Range: 0 to 1.
 */
export const DEFAULT_WAGE_PASS_THROUGH = 0.40;

/**
 * Sensitivity of automation adoption to minimum wage cost pressure.
 * Higher values = low-wage clusters automate faster when min wage exceeds their average wage.
 * Source: Lordan & Neumark (2018) — automatable low-skill jobs, calibrated.
 * Range: 0 to 1.
 */
export const DEFAULT_WAGE_AUTOMATION_SENSITIVITY = 0.50;

/**
 * Sensitivity of price level to credit contraction.
 * Credit tightening reduces money circulation, creating deflationary pressure.
 * Source: 2008 crisis calibration — credit contraction of ~40% produced ~2% deflation.
 * Range: 0 to 1.
 */
export const DEFAULT_CREDIT_DEFLATION_SENSITIVITY = 0.04;

/**
 * Fraction of sector-level labor scarcity passed through to prices.
 * When demand for workers exceeds supply in a sector, prices rise.
 * Source: Calibrated to match 2021-2022 post-COVID labor shortage price pressures.
 * Range: 0 to 1.
 */
export const DEFAULT_SCARCITY_PASS_THROUGH = 0.30;

/**
 * Maximum price level / cumulative inflation factor before numerical overflow.
 * 1e15 ≈ Zimbabwe peak hyperinflation (10^14% cumulative).
 * Any scenario reaching this is already showing "complete monetary collapse."
 * This is NOT an economic constraint — it's a floating-point safety rail.
 * Source: IEEE 754 double-precision overflow prevention; calibrated to allow
 * extreme hyperinflation modeling while preventing Infinity/NaN propagation.
 */
export const MAX_PRICE_LEVEL = 1e15;

/**
 * Fraction of MAX_PRICE_LEVEL at which monetary collapse is declared.
 * At 99% of the cap, the price level denominator is effectively frozen while
 * nominal values continue growing, making all real-terms computations meaningless.
 * Source: Model architecture — prevents silent meaningless output when the price cap binds.
 */
export const MONETARY_COLLAPSE_THRESHOLD_FRACTION = 0.99;

// ============================================================
// 8b. Phillips Curve Constants
// ============================================================

/**
 * Phillips curve sensitivity β — exponential wage decay with excess unemployment.
 * Formula: wagePressure = exp(-β × excessUE)
 * At default 2.5: 10% excess UE → ~22% wage reduction (exp(-0.25) ≈ 0.78).
 * Empirical slope estimates 0.1–0.5 for normal UE range (3–10%).
 * Source: Blanchard (2016), IMF WEO Chapter 3 (2017); Blanchard & Katz (1997)
 */
export const PHILLIPS_CURVE_SENSITIVITY = 2.5;

// ============================================================
// Stage 3: Endogenous wage equation (replaces the computeWagePressure level-multiplier)
// ============================================================
/** Fraction of (lagged) composite inflation passed into nominal wage growth (full COLA). Gate-A-consistent. */
export const DEFAULT_INFLATION_INDEXATION = 1.0;
/** Stage 7 (D-1 ruling): fraction of per-worker productivity growth passed into nominal wage growth.
 *  0.90 calibrated to the OBSERVED aggregate labor-share drift: zero-AI wage growth 2.9% + 0.9×1.6%
 *  = 4.34%; wage bill 4.74% vs nominal GDP ≈4.9% → labor share drifts ≈ −0.10pp/yr — matching the
 *  genuinely labor-vs-capital component of the productivity-pay gap (aggregate labor share fell only
 *  ~5-6pp over 1980-2020; Stansbury & Summers 2017, Lawrence, EPI decomposition). The ~0.3-class
 *  defaults are EXPLICITLY REJECTED: the famous "decoupling" is predominantly median/composition/
 *  deflator (mean-vs-median inequality, wages-vs-compensation, consumption-vs-output deflators) —
 *  not a labor-vs-capital split, which is what this parameter controls once profits are residual. */
export const DEFAULT_PRODUCTIVITY_PASSTHROUGH = 0.90;

// ============================================================
// Stage 7: Residual corporate profits (Phase 10.B core; OD-5 checkpoint ratified)
// ============================================================
/** Model-frame "other costs" share of GDP (Q-1 ruling, option ii): proxies NIPA consumption of fixed
 *  capital (≈17% of GDP) + taxes on production & imports less subsidies (≈6.6%, NIPA Table 1.10),
 *  NET of the PI-frame wedge — the model's BASELINE_WAGE_SHARE (0.604) is wages/personal-income
 *  applied to GDP, vs NIPA compensation/GDP ≈0.53, so the raw 0.235 cannot be imported (it would
 *  zero baseline profits). Init-derived so the year-0 residual identity reproduces the BEA profit
 *  ratio EXACTLY: otherCosts = 1 − wageShare − nonCorpShare − BEA profits/GDP. This by-construction
 *  closure dissolves the 0.13-vs-0.11 bootstrap and closes the 2026 capacityGate transient.
 *  (Registered deferred: NIPA production-frame re-basing of the income architecture — right in
 *  principle, wrong in sequencing.) */
export const DEFAULT_OTHER_COSTS_SHARE =
  1 - BASELINE_WAGE_SHARE - NON_CORPORATE_ASSET_SHARE - govData.baselineProfitGDPRatio;
/** AI-sector labor share (Phase 10.B): big-tech labor intensity — the AI sector is capital-intensive
 *  in aggregate even though individual workers capture via equity (a Stage-8 distribution matter).
 *  AI profits = aiGDP × (1 − this) × (1 − otherCostsShare) — proportionate otherCosts per Q-3
 *  (conservative on AI profits: AI-sector CFC plausibly EXCEEDS the average — GPU/accelerator 3-5yr
 *  cycles; a per-sector multiplier is a registered future refinement). */
export const DEFAULT_AI_SECTOR_LABOR_SHARE = 0.15;
/** Rent-sharing elasticity (Stage 7, Part 3): wage-growth response per unit profit-share deviation
 *  from the secular baseline. TWO-SIDED (recessions compress rent-sharing — stabilizing; contrast
 *  R24's one-sided land bid). Source: Card, Cardoso, Heining & Kline (2018 JOLE); surveyed
 *  elasticities ≈0.05-0.15. */
export const DEFAULT_RENT_SHARING_ELASTICITY = 0.10;
/** Secular profit-share drift (Q-2 ruling, option B): the rent-sharing baseline drifts at the SAME
 *  observed labor-share-drift rate D-1 calibrates to (+0.10pp/yr ⇒ 0.001/yr) — no new free constant.
 *  THE WORLDVIEW FORK AS A SINGLE DIAL: at 0, the baseline is constant and rent-sharing makes the
 *  D-1 drift self-limiting (asymptote ≈ −1.6pp — the post-2015 labor-share-stabilization reading);
 *  at 0.001, the 1980-2020 trend continues. Both readings documented in USER_PARAMETERS.md. */
export const DEFAULT_SECULAR_PROFIT_DRIFT_RATE = 0.001;

// ============================================================
// F4/OD-8 EXAMINATION (charter, post-Stage-7): the expectation-constant family
// ============================================================
/** E-1 — debt-turnover blend: the consumer credit bar's inflation expectation converges from its
 *  origination value toward LAGGED REALIZED inflation at this rate (= 1 / effective household-debt
 *  duration). Derivation: mortgages ≈ 70% of household debt (Fed Z.1) at ~9y effective duration
 *  (amortization/refi/turnover), consumer credit ≈ 30% (Fed G.19) at ~2.5y → blended ≈ 7y → 0.143/yr.
 *  Fisher debt-deflation is PRESERVED for the existing stock (the bar stays high for years into a
 *  deflation — borrowers genuinely crushed) and only its IMMORTALITY is removed (stocks turn over;
 *  new originations re-price). 0 = the legacy fixed expectation (classification: FIXED, rejected —
 *  no contract is immortal). */
export const DEFAULT_CREDIT_EXPECTATION_TURNOVER = 1 / 7;
/** E-2 — drifting secular baseline for the investor land bid (Q-2(B) symmetry, ruled). Derived from
 *  ratified constants ONLY (one source, no new free constant): the dividend channel of the secular
 *  profit drift — payout × (1 − corp tax) × secularProfitDriftRate ≈ 0.60 × 0.79 × 0.001 ≈
 *  +0.047pp/yr. (Capital-gains and nonCorp channels omitted — conservative; measured zero-AI
 *  asset-share drift ≈ +0.064pp/yr; the residual deviation by 2050 keeps the bid near-invisible.)
 *  0 = frozen 2025 baseline (the pre-examination behavior that activated the bid in zero-AI). */
export const DEFAULT_ASSET_SHARE_DRIFT_RATE = (() => {
  return (1 - govData.corporateRetentionRate) * (1 - govData.effectiveCorporateTaxRate)
    * DEFAULT_SECULAR_PROFIT_DRIFT_RATE;
})();
/** E-6 (ratified): land rate-sensitivity — %/yr land-price flow per pp of mortgage-rate deviation
 *  from baseline (LEVEL-deviation, symmetric with the structures' capRate channel; a Δ-form cannot
 *  anchor the land LEVEL against persistently elevated rates). Land is the residual-claimant,
 *  longest-duration asset → sensitivity exceeds the structures' capRateMortgageBeta (0.4).
 *  Calibration: 1981-86 farmland episode — real values −27% over 5 yrs against ~+8pp sustained
 *  tightening ≈ 0.75 %/yr per pp (USDA ERS farmland series); capitalization logic V=R/r at 4-5%
 *  land cap rates; Davis-Heathcote land-share cyclicality (land, not structures, carries the cycle).
 *  0 = the pre-E-6 rate-blind land (isolation toggle). Range 0-2. */
export const DEFAULT_LAND_RATE_SENSITIVITY = 0.75;
/** E-7 (ratified): central-bank credibility horizon τ_cred — the market inflation ANCHOR converges
 *  from the Fed target toward LAGGED REALIZED composite at 1/τ. A genuine worldview dial: default 10
 *  (post-Volcker anchoring; 2021-23: ~5pp of realized misses moved 5y5y breakevens <0.3pp → τ ≳ 8-12);
 *  τ ≈ 5-8 = the 1965-1980 de-anchoring regime (long rates ratcheted through a decade of misses —
 *  how tight policy historically reached land). Mathematical legacy limit is τ → ∞ (1/τ → 0);
 *  0 is a SPECIAL-CASED SENTINEL meaning never-de-anchor (anchor frozen at init). Range 3-30 (+0). */
export const DEFAULT_CREDIBILITY_HORIZON_YEARS = 10;
/** E-8 (ratified): debt-service/revenue level at which markets begin pricing fiscal consolidation.
 *  Source: net interest ≈ 18%+ of federal revenue 1991-95 — the level at which the 1992-1998
 *  consolidation episode mobilized (deficit 4.5% of GDP → surplus over six years). Trigger → ∞
 *  = the never-credible world (reproduces the E-7 finding as a scenario). Range 0.10-0.40. */
export const DEFAULT_FISCAL_CREDIBILITY_TRIGGER = 0.18;
/** E-8: years over which markets expect the primary-balance glide once triggered. Default 8
 *  (within the episode range: 1992-1998 = six years; 2011-14 BCA ≈ four for ~2pp; the post-WWII
 *  workdown as the long pole). The adjustmentExpectation ramps AND decays at 1/horizon —
 *  SYMMETRIC DECAY chosen (item 2): markets re-price both directions at comparable speed
 *  (the 2001-02 surplus-expectation unwind); one rate, no hysteresis constant. Range 3-20. */
export const DEFAULT_FISCAL_ADJUSTMENT_HORIZON_YEARS = 8;
/** E-8b item 1 (ratified, units correction): the Fed targets 2% PCE; the model composite is
 *  CPI-basis (BLS CPI relative-importance weights — shelter 0.36 vs PCE ~0.15). Long-run CPI−PCE
 *  differential ≈ 0.45pp (BLS/Cleveland Fed, 2000-2024: weighting + formula + scope). Every
 *  comparison of the composite against the target uses target + this wedge. User-adjustable;
 *  0 = the pre-E-8b structurally-hawkish comparison (isolation toggle). */
export const PCE_CPI_WEDGE = 0.005;
/** E-8b item 2 (ratified): fiscal-risk premium per unit of debt/GDP ABOVE the 2025 anchor —
 *  3.5bp per pp (Laubach 2009: 3-4bp/pp of projected debt/GDP; Engen-Hubbard 2004: ≈3bp/pp).
 *  Replaces the logistic extrapolation (local slope ~70× this evidence — the doom-pricing source). */
export const DEFAULT_LAUBACH_LEVEL_BETA = 0.035;
/** E-8b item 2: premium per unit of deficit/GDP above the 2025 anchor — 25bp per pp
 *  (Laubach 2009: 20-29bp per pp of projected deficit/GDP). */
export const DEFAULT_LAUBACH_DEFICIT_BETA = 0.25;
/** E-8c F-B (ratified): monetization-as-yield-response is a FISCAL-DOMINANCE event (Sargent &
 *  Wallace 1981), not a yield-level event. Fires only when debtService/revenue exceeds this gate.
 *  Episode poles: UK 1920s — service ≈ 40%+ of revenue, chose orthodox deflation, NO monetization
 *  (0.40 alone does not force printing); France 1926 — ≈ 0.45-0.50, monetized/devalued (the onset
 *  zone); Weimar — ≫ 0.50 with lost market access. Range 0.25-0.80 (the regime worldview dial). */
export const DEFAULT_MONETIZATION_DOMINANCE_THRESHOLD = 0.50;
/** E-8c F-B: the co-condition — markets must be pricing FISCAL stress (the Laubach premium ≥ ~1pp
 *  ≈ debt ~30pp above the 2025 anchor). High yields from inflation repricing alone (premium ≈ 0,
 *  the Volcker 1981 case: 15% yields, zero monetization) never qualify. Range 0.002-0.05. */
export const DEFAULT_MONETIZATION_PREMIUM_COCONDITION = 0.01;
/** E-9 item 2 (ratified): the PCE-proxy weight vector — the model's four sector inflations
 *  reweighted to PCE shares (BEA NIPA Table 2.3.5; FRED-served components DPCERC/DHUTRC/DHLCRC/
 *  DFXARC/DNRGRC). Mapping judgment calls (R10 style, see DATA_MODEL): food services split into
 *  foodEnergy; financial-services-furnished-without-payment (PCE-only scope) → aiExposed;
 *  healthcare third-party payments (the PCE-vs-CPI scope driver) → laborServices (the single
 *  largest reweight: healthcare ≈16.6% of PCE vs ≈8% of CPI). Weights sum to 1. */
export const PCE_WEIGHT_SHELTER = 0.155;
export const PCE_WEIGHT_FOOD_ENERGY = 0.15;
export const PCE_WEIGHT_LABOR_SERVICES = 0.35;
export const PCE_WEIGHT_AI_EXPOSED = 0.345;
/** E-9 flag [α] (ratified): the formula/scope component of the CPI−PCE differential — chained
 *  Fisher vs Laspeyres + scope (BEA-BLS CPI-PCE reconciliation decompositions: the historical
 *  ≈0.45pp differential ≈ weight component ~0.25 + formula/scope ~0.20). A reweighting proxy
 *  reproduces only the weight component; this constant supplies the remainder so the Fed's
 *  variable honestly targets PCE. KNOWN LIMITATION (documented per the ratification): the formula
 *  effect is NOT constant in reality — it GROWS when relative prices diverge (substitution rises),
 *  so in Scenario C true PCE would read LOWER than proxy − α. Direction documented; an endogenous/
 *  chained treatment is registered under the OD-6 chained-index entry. User-adjustable. */
export const PCE_FORMULA_EFFECT = 0.002;
/**
 * Wage-Phillips semi-elasticity: pp reduction in annual nominal wage growth per pp of excess unemployment
 * (equivalently, fraction-per-fraction). Default 0.30 (mid-range). Linear; at extreme UE the resulting
 * cut is damped by downwardWageRigidity (a saturating form is the registered fallback if Gate D shows a
 * collapse faster than the 1930-33 ~20-25% cumulative nominal-wage decline).
 * Source: Blanchard (2016); Galí (2011) — wage Phillips slope 0.2–0.5.
 */
export const DEFAULT_PHILLIPS_SLOPE = 0.30;
/**
 * Asymmetric downward NOMINAL wage rigidity [0,1]: when nominal wage growth would be negative, only
 * (1 − rigidity) of the cut passes through. 1.0 = wages never cut nominally; 0 = fully flexible.
 * Default 0.60: nominal wages are sticky (Daly & Hobijn 2014, "Downward Nominal Wage Rigidities Bend the
 * Phillips Curve" — pronounced spike at 0% wage change) yet fell ~20-25% in 1930-33, so a single value
 * cannot be 1.0; 0.60 lets wages fall materially in a 40%-UE collapse while staying sticky in mild downturns.
 */
export const DEFAULT_DOWNWARD_WAGE_RIGIDITY = 0.60;

/**
 * Natural unemployment rate (baseline unemployment / labor force).
 * Derived from CPS-based baselines so that wagePressure = 1.0 at t=0 (no wage distortion).
 * NOT from FRED NAIRU — see FRED_NAIRU_RATE below for the CBO estimate.
 * Source: Derived from BASELINE_UNEMPLOYMENT / US_LABOR_FORCE_2025
 */
export const NATURAL_UNEMPLOYMENT_RATE = BASELINE_UNEMPLOYMENT / US_LABOR_FORCE_2025;

/**
 * CBO Natural Rate of Unemployment (NAIRU) — reference only, NOT used in Phillips curve.
 * The model's NATURAL_UNEMPLOYMENT_RATE is derived from baseline employment/labor force gap
 * to ensure wagePressure = 1.0 at baseline. This CBO estimate is exported for display.
 * Source: FRED NROU series (CBO Long-Term Natural Rate), via src/data/fred/nairu.json
 */
export const FRED_NAIRU_RATE = govData.fredNairuRate;

// ============================================================
// 8b1b. DEPRECATED: Wage Growth Baseline Constants (Phase 8 Fix 5)
// Removed: computeNominalWageGrowth caused wage-price spiral hyperinflation.
// ============================================================
// export const INFLATION_PASS_THROUGH_RATE = 0.80;
// export const DEFAULT_PHILLIPS_CURVE_WAGE_SENSITIVITY = 0.5;

// ============================================================
// 8b1b2. Housing Price Model Constants (Phase 8 Fix 5)
// ============================================================

/**
 * Mortgage rate change → home price elasticity.
 * -100bp rate change × 4.0 = +4% price increase.
 * Source: Glaeser et al. (2012) "Can Cheap Credit Explain the Housing Boom?"
 * Range: 1.0 to 8.0
 */
export const DEFAULT_AFFORDABILITY_PRICE_SENSITIVITY = 4.0;

/**
 * Real income growth → home price elasticity.
 * +3% income growth × 0.5 = +1.5% price increase.
 * Source: Mian & Sufi (2009) "The Consequences of Mortgage Credit Expansion."
 * Range: 0.1 to 1.5
 */
export const DEFAULT_INCOME_HOUSING_ELASTICITY = 0.5;

/**
 * How fast home prices revert to price-to-income equilibrium.
 * When homes are 20% overvalued: 0.20 × 0.15 = 3% annual headwind.
 * Source: Case & Shiller (1989) "The Efficiency of the Market for Single-Family Homes."
 * Range: 0.05 to 0.40
 */
export const DEFAULT_AFFORDABILITY_REVERSION_SENSITIVITY = 0.15;

/**
 * Downward price reversion relative to upward (1.0 = symmetric).
 * Sellers resist price cuts (sticky downward); homes taken off market rather than sold at loss.
 * 0.5 means downward reversion is half as fast as upward (recovery is stronger than correction).
 * Source: Glaeser & Gyourko (2005) "Urban Decline and Durable Housing."
 * Range: 0.2 to 1.0
 */
export const DEFAULT_DOWNWARD_STICKINESS_RATIO = 0.5;

/**
 * Population growth → home price demand elasticity.
 * 0.4% population growth × 1.0 = 0.4% baseline price support.
 * Source: Mankiw & Weil (1989) "The Baby Boom, the Baby Bust, and the Housing Market."
 * Range: 0.3 to 2.0
 */
export const DEFAULT_DEMOGRAPHIC_HOUSING_ELASTICITY = 1.0;

// ============================================================
// 8b1c. Two-Part Policy Window Thresholds
// ============================================================

/**
 * Preparation window: UE rate must rise this many percentage points
 * above baseline to trigger the window. 1pp rise above NAIRU is the
 * Sahm Rule threshold for detecting early recession onset.
 * Source: Sahm (2019), "Direct Stimulus Payments to Individuals",
 *   Brookings: Hamilton Project. Federal Reserve Board.
 */
export const PREP_WINDOW_UE_RISE_THRESHOLD = 0.01; // 1 percentage point

// DEPRECATED: Fiscal window now uses GDP growth rate instead of these thresholds.
// Fiscal window opens when GDP is still growing AND displacement has started (prep window open).
// Fiscal window closes when GDP growth turns negative (no fiscal room for new commitments).
//
// /**
//  * Fiscal window opens when AI GDP contribution exceeds $500B.
//  * Source: CBO Budget Options 2024, scaled to GDP share.
//  */
// export const FISCAL_WINDOW_AI_GDP_THRESHOLD = 500e9;
//
// /**
//  * Fiscal window closes when nominal GDP has declined more than 20% from peak.
//  * Source: Great Depression peak-to-trough precedent (BEA NIPA historical).
//  */
// export const FISCAL_WINDOW_GDP_DECLINE_THRESHOLD = 0.20;

// ============================================================
// 8b2. Deflation Velocity Drag (S-Curve Model)
// ============================================================
// Logistic deferral curve grounded in BEA PCE breakdown of spending elasticity.
// Source: BEA NIPA Table 2.3.5 (Personal Consumption Expenditures by Major Type)
//   Non-discretionary (food at home, housing, utilities, basic healthcare): ~45-50% of PCE
//   Semi-elastic (transportation, clothing, food away from home, education): ~20-25% of PCE
//   Deferrable (durables, recreation, luxury goods, elective services): ~25-30% of PCE

/**
 * Maximum fraction of consumption that can be deferred due to deflation expectations.
 * Source: BEA PCE Tables — deferrable consumption share (~25-30% of PCE)
 */
export const DEFERRABLE_CONSUMPTION_SHARE = 0.30;

/**
 * Deflation rate at which half of deferrable spending is actually deferred.
 * Below ~2% deflation, consumers barely notice. At 5%, behavioral change is significant.
 */
export const DEFLATION_MIDPOINT = 0.05;

/**
 * Steepness of the deferral response curve.
 * Calibrated so that: ~0% deferral at 0-1% deflation, ~15% at 5%, ~28% at 10%
 */
export const DEFLATION_STEEPNESS = 40;

// DEPRECATED (Phase 5h): Replaced by S-curve deflation velocity model (Phase 4):
// - DEFERRABLE_CONSUMPTION_SHARE (share of spending that can be deferred)
// - DEFLATION_MIDPOINT (deflation rate at 50% deferral response)
// - DEFLATION_STEEPNESS (logistic curve steepness)
// Linear model was: deflation = coverage × sensitivity
// S-curve model is: deferral = share × sigmoid(deflationRate, midpoint, steepness)
// Was stored in SecondOrderEffectParams but never read by any computation.
// export const DEFLATION_VELOCITY_SENSITIVITY = 1.5;

// ============================================================
// 8c0. Corporate Profits Model (Phase 5g)
// ============================================================

/** Blended AI sector profit margin (software + infrastructure).
 * Source: S&P 500 tech sector margins 2020-2024 average. */
export const DEFAULT_AI_PROFIT_MARGIN = 0.25;

/** Traditional (non-AI) corporate profit margin.
 * Source: BEA NIPA Table 1.12 — corporate profits as share of GDP, 2015-2024 average. */
export const DEFAULT_TRADITIONAL_PROFIT_MARGIN = 0.11;

// DEPRECATED: replaced by exact asset income decomposition (dynamic P/E + endogenous capital gains)
// export const DEFAULT_BASELINE_DIVIDEND_YIELD = 0.025;
// export const DEFAULT_BASELINE_MARKET_RETURN = 0.07;
// export const DEFAULT_AI_GROWTH_PREMIUM = 0.5;

// ============================================================
// 8b2. Asset Income Decomposition Constants
// ============================================================

/**
 * P/E at zero earnings growth — company valued as a perpetuity.
 * Source: Historical S&P 500 forward P/E during zero-growth periods
 * (2001 post-dot-com, 2008 financial crisis troughs averaged ~8-12×).
 * Using 10× as the equilibrium perpetuity valuation (≈ 10% discount rate).
 */
export const BASE_PE_ZERO_GROWTH = 10;

/**
 * Minimum P/E floor during extreme distress.
 * Source: Even 2008 S&P 500 bottomed at ~8× forward earnings.
 * Companies below 5× are priced for bankruptcy/liquidation.
 */
export const MIN_PE = 5;

/**
 * Default AI sector P/E sensitivity to earnings growth.
 * Units: P/E points per 100% earnings growth rate.
 * At default (100) with 20% AI earnings growth: P/E = 10 + 100 × 0.20 = 30.
 * This matches current Mag 7 weighted-average forward P/E (~28-32).
 * Source: Calibrated to 2024-2025 AI sector valuations.
 * Range: 25 (fearful/skeptical) to 250 (dot-com euphoria).
 */
export const DEFAULT_AI_PE_SENSITIVITY = 100;

/**
 * Default traditional (S&P ex-tech) P/E sensitivity to earnings growth.
 * At default (60) with 5% traditional earnings growth: P/E = 10 + 60 × 0.05 = 13.
 * At 10% growth: P/E = 10 + 60 × 0.10 = 16. Matches S&P 500 ex-tech historical.
 * Source: S&P 500 equal-weight ex-tech forward P/E average 2015-2024.
 * Range: 15 (deep value) to 150 (broad euphoria).
 */
export const DEFAULT_TRADITIONAL_PE_SENSITIVITY = 60;

/**
 * Baseline capital gains realization rate (fraction of unrealized gains realized per year).
 * Source: IRS Statistics of Income, 20-year average of realized gains / estimated unrealized.
 * Historical range: 4% (2008-09 crash) to 12% (2021 boom). Mean ~7%.
 */
export const BASE_REALIZATION_RATE = 0.07;

/**
 * How strongly realization rate responds to market performance.
 * realizationRate = BASE × (1 + SENSITIVITY × blendedMarketPerformance)
 * At default (1.0) with 30% profit growth: 0.07 × 1.30 = 9.1% (matches 2021 data).
 * At -30% contraction: 0.07 × 0.70 = 4.9% (matches 2008-09 data).
 */
export const REALIZATION_SENSITIVITY = 1.0;

/** IRS historical floor for capital gains realization. */
export const MIN_REALIZATION_RATE = 0.04;

/** IRS historical ceiling for capital gains realization. */
export const MAX_REALIZATION_RATE = 0.12;

// ============================================================
// 8c. AI Profit & Investment Constants
// ============================================================

// DEPRECATED: AI_INVESTMENT_RATE and bell curve removed in Investment Demand Constraint fix.
// AI investment now flows through investmentRealization factor gated by
// utilization, demand, and credit signals. The hump-shaped coverage-based
// boost is replaced by market-responsive investment allocation.
// export const AI_INVESTMENT_RATE = 0.10;

// DEPRECATED: export const BASE_INVESTMENT_RATE = 0.15;
// Replaced by TRADITIONAL_INVESTMENT_GDP_FRACTION (data-driven from BEA).
// The 0.15 hardcoded value caused a ~2.5% gap vs BEA's 0.175, producing a
// spurious GDP dip from year 0→1 in simulations.

// DEPRECATED: export const BASELINE_REAL_GDP_GROWTH = 0.02;
// Duplicates BASELINE_GDP_GROWTH_RATE (line ~298). Was imported in macro.ts
// but never used in any function body.

// ============================================================
// 9. Inference Cost & AI Deflation Constants
// ============================================================


// DEPRECATED (Phase 5h): Imported in macro.ts but never used in computation.
// Replaced by sector-weighted deflation model (computeSectorWeightedDeflation).
// Was: Maximum AI deflation rate as a fraction of aggregate automation level.
// Source: Calibrated — as automation coverage rises, deflation contribution increases
// export const AI_DEFLATION_COEFFICIENT = 0.03;

// ============================================================
// 9. Investment Constants
// ============================================================

// DEPRECATED (Phase 5h): Imported in macro.ts but only appears in a code comment, not computation.
// AI investment is already included in TRADITIONAL_INVESTMENT_GDP_FRACTION (0.175).
// Was: Baseline AI investment as fraction of GDP (2025).
// Source: McKinsey Global AI Survey 2024; CapEx announcements from major tech firms
// export const BASELINE_AI_INVESTMENT_GDP_FRACTION = 0.02;

/**
 * AI investment growth rate (declines over time as market matures).
 * Source: Estimated from venture capital + corporate CapEx trends
 */
export const AI_INVESTMENT_GROWTH_RATE = 0.15;

/**
 * Traditional (non-AI) investment as fraction of GDP.
 * Source: BEA NIPA Table 1.1.5, via src/data/bea/gdp-components.json
 * DEPRECATED: was 0.15
 */
export const TRADITIONAL_INVESTMENT_GDP_FRACTION = govData.investmentRatio;

/**
 * Government consumption and gross investment as fraction of GDP.
 * This is the "G" in GDP = C + I + G + NX. It does NOT include government
 * transfer payments (Social Security, Medicare, etc.) — those flow through
 * personal income and count as C when recipients spend them.
 * Source: BEA NIPA Table 1.1.5, via src/data/bea/gdp-components.json
 * DEPRECATED: was 0.18
 */
export const GOVERNMENT_SPENDING_GDP_FRACTION = govData.governmentRatio;

/**
 * Net exports as fraction of GDP (typically negative for US).
 * Source: BEA NIPA Table 1.1.5, via src/data/bea/gdp-components.json
 * DEPRECATED: was -0.03
 */
export const NET_EXPORTS_GDP_FRACTION = govData.netExportRatio;

/**
 * Baseline GDP component levels for demand spillover (Phase 3c.1).
 * Derived from BASELINE_GDP_NOMINAL_2025 and BEA GDP share fractions
 * so they're internally consistent with the model's Year 0 output.
 * At t=0, priceLevel=1.0 so real=nominal — these work for real comparisons.
 * Source: BEA NIPA Table 1.1.5, via src/data/bea/gdp-components.json
 */
export const BASELINE_CONSUMPTION_2025 = BASELINE_GDP_NOMINAL_2025
  * (1 - GOVERNMENT_SPENDING_GDP_FRACTION - TRADITIONAL_INVESTMENT_GDP_FRACTION - NET_EXPORTS_GDP_FRACTION);
export const BASELINE_GOVT_SPENDING_2025 = BASELINE_GDP_NOMINAL_2025 * GOVERNMENT_SPENDING_GDP_FRACTION;
export const BASELINE_INVESTMENT_2025 = BASELINE_GDP_NOMINAL_2025 * TRADITIONAL_INVESTMENT_GDP_FRACTION;

/**
 * Government spending obligation-based decomposition shares.
 *
 * ~80% of government direct purchases are obligation-driven:
 *   - Federal mandatory spending on services (Medicare hospital payments,
 *     Medicaid provider payments, VA healthcare): ~55% of total G
 *   - Federal discretionary (defense procurement, NASA, R&D, infrastructure): ~25% of total G
 *   These are set by law/appropriation, grow with inflation/demographics, NOT with GDP.
 *
 * ~20% is state/local revenue-sensitive:
 *   - Education, police, fire, local infrastructure
 *   - Funded by property tax, sales tax, state income tax — these track GDP/employment
 *   - When people lose jobs, state tax revenue falls
 *
 * NOTE: Transfer payments (Social Security checks, UI, UBI) are NOT part of G.
 * They flow through personal income → MPC → C. The "obligation" here is the
 * government BUYING things (paying federal employees, purchasing equipment),
 * not mailing checks to citizens.
 *
 * Source: CBO mandatory/discretionary split (Budget and Economic Outlook 2024) +
 * Census Bureau Annual Survey of State and Local Government Finances
 */
export const G_OBLIGATION_SHARE = 0.80;
export const G_REVENUE_SENSITIVE_SHARE = 0.20;

// ============================================================
// 9b. Fiscal Funding Constants (Phase 5g Step 13)
// ============================================================

/**
 * Historical average federal revenue as fraction of GDP.
 * Source: CBO Historical Budget Data (1970-2024 average).
 */
// Phase 7 NOTE: still used as fallback; primary revenue path is now endogenous
// via computeMacro() 8-component tax model.
export const FEDERAL_REVENUE_GDP_RATIO = 0.175;

// ============================================================
// 9c. Fiscal Accounting Constants (Phase 7)
// ============================================================

/**
 * Total federal debt held by the public + intragovernmental.
 * Source: FRED GFDEBTN (via src/data/fred/federal-debt.json), converted from millions to dollars.
 * Fallback: ~$36T (Q4 2024 estimate).
 */
export const INITIAL_FEDERAL_DEBT = govData.federalDebtTotal * 1_000_000; // FRED GFDEBTN is in millions

/**
 * 10-Year Treasury yield, used as the initial cost of new debt issuance.
 * Source: FRED DGS10 (via src/data/fred/treasury-yield-10y.json), decimal form (e.g., 0.043 = 4.3%).
 * Fallback: 4.3%.
 */
export const INITIAL_10Y_YIELD = govData.treasuryYield10Y;

/**
 * Baseline deficit-to-GDP ratio (positive = deficit).
 * Source: FRED FYFSGDA188S (via src/data/fred/deficit-gdp-ratio.json).
 * Fallback: 6% (~$1.7T deficit on ~$29T GDP).
 */
export const BASELINE_DEFICIT_GDP_RATIO = govData.baselineDeficitGDPRatio;

/**
 * Alias for BASELINE_DEFICIT_GDP_RATIO.
 * Used by fiscal.ts for consistency with the fiscal model's naming convention.
 */
export const FEDERAL_DEFICIT_GDP_RATIO = BASELINE_DEFICIT_GDP_RATIO;

/**
 * Initial weighted-average interest rate on existing federal debt.
 * NOT the same as INITIAL_10Y_YIELD (market rate for NEW issuance).
 * The existing portfolio was issued at various historical rates, many lower.
 * Derived: BASELINE_DEBT_INTEREST / INITIAL_FEDERAL_DEBT ≈ $1.05T / $36T ≈ 2.9%.
 * Source: CBO "Interest on the Public Debt" (2024); derived from FRED FYOINT / GFDEBTN.
 */
export const INITIAL_WEIGHTED_AVG_DEBT_RATE = 0.029;

/**
 * Baseline PRIMARY deficit/GDP ratio (excludes interest on debt).
 * The primary deficit = total deficit - interest expense.
 * Used in fiscal.ts so that interest can be computed dynamically from debt × rate
 * without double-counting the interest already embedded in the total deficit ratio.
 *
 * Derived: BASELINE_DEFICIT_GDP_RATIO - (INITIAL_WEIGHTED_AVG_DEBT_RATE × INITIAL_FEDERAL_DEBT / BASELINE_GDP_NOMINAL_2025)
 * ≈ 0.06 - (0.029 × 36e12 / 31.49e12) ≈ 0.06 - 0.033 ≈ 0.027
 * Source: CBO "The Budget and Economic Outlook" (2024); derived from total deficit minus net interest.
 */
export const BASELINE_PRIMARY_DEFICIT_GDP_RATIO =
  BASELINE_DEFICIT_GDP_RATIO - (INITIAL_WEIGHTED_AVG_DEBT_RATE * INITIAL_FEDERAL_DEBT / BASELINE_GDP_NOMINAL_2025);

/**
 * BBB corporate bond spread over Treasuries, as decimal.
 * Source: FRED BAMLC0A4CBBB (ICE BofA BBB US Corporate Index Option-Adjusted Spread),
 *         via src/data/fred/bbb-corporate-spread.json.
 * Fallback: 1.5% (150bp).
 */
export const BASE_CORPORATE_SPREAD = govData.bbbCorporateSpread;

/**
 * Baseline corporate profits after tax (SAAR), in dollars.
 * Source: FRED CP (Corporate Profits After Tax with IVA and CCAdj),
 *         quarterly SAAR in billions → converted to dollars.
 *         Via src/data/fred/corporate-profits-after-tax.json.
 * Fallback: $3T.
 */
export const BASELINE_CORPORATE_PROFITS = govData.corporateProfitsAfterTax;

/**
 * Baseline mortgage spread (30-year fixed rate minus 10-year Treasury yield), as decimal.
 * Source: Derived from FRED MORTGAGE30US − FRED DGS10.
 * Fallback: 1.7% (170bp).
 */
export const BASELINE_MORTGAGE_SPREAD = govData.mortgageSpread;

/**
 * Baseline S&P 500 index level.
 * Source: FRED SP500 (S&P 500 index), via src/data/fred/sp500.json.
 * Fallback: 5800.
 */
export const BASELINE_SP500_LEVEL = govData.sp500Level;

/**
 * Statutory federal corporate tax rate.
 * Source: Tax Cuts and Jobs Act of 2017 (TCJA), IRC §11(b).
 * Effective rate = STATUTORY_CORPORATE_RATE × corporateTaxEffectiveness.
 * At default effectiveness ~0.65: 0.21 × 0.65 ≈ 0.137, matching existing ~0.14 effective rate.
 */
export const STATUTORY_CORPORATE_RATE = 0.21;

/**
 * DEPRECATED Phase 8 Fix 3: Replaced by endogenous rollover rate from
 * computeEndogenousRolloverRate() in fiscal.ts. Kept for test backward compatibility.
 *
 * Fraction of outstanding federal debt that rolls over (matures and is reissued) annually.
 * The weighted-average maturity of US federal debt is ~6 years, implying ~1/6 ≈ 17%.
 * However, Treasury also issues short-term bills that roll frequently, raising effective
 * rollover to ~30%.
 * Source: Treasury Debt Management quarterly refunding statements (2024);
 *         CBO "Federal Debt and the Statutory Limit" (2024), weighted-average maturity analysis.
 */
export const DEBT_ROLLOVER_RATE = 0.30;
/** E-9 item 4 (ratified): the coupon-stock share of annual rollover — ~6y WAM → 1/6 ≈ 17%/yr
 *  repricing at the 10Y-based rate; the remainder of the 30% (the bills layer, ~13%/yr) rolls at
 *  the POLICY rate (bills price off the short end, not the 10Y — the audit §1 row-5 finding).
 *  Same citation as DEBT_ROLLOVER_RATE (Treasury refunding / CBO WAM analysis). */
export const DEBT_ROLLOVER_COUPON_RATE = 0.17;
/** E-9b (ratified): policy-rate inertia — i(t) = ρ·i(t−1) + (1−ρ)·Taylor(t). The quarterly
 *  partial-adjustment literature: ρ_q ≈ 0.79-0.92 (Clarida-Galí-Gertler 2000 Table II;
 *  Coibion-Gorodnichenko 2012 — genuine INERTIA, not serially-correlated shocks, which is what
 *  justifies the expected path projecting the inertial rule). Annualized: 0.79⁴ ≈ 0.39,
 *  0.85⁴ ≈ 0.52 → default 0.5 (the literature center). Range 0-0.9; 0 = the legacy
 *  instantaneous toggle. Initialized at the OBSERVED INITIAL_POLICY_RATE (the 2025 restriction
 *  is data; the model inherits it — the same logic as the E-9b shelter-transient ruling). */
export const DEFAULT_TAYLOR_SMOOTHING = 0.5;
/** E-9c row 1 (ratified): the market inflation anchor's YEAR-0 INHERITANCE — the observed 2025
 *  expectations state, NOT an idealization (the inheritance principle, third application).
 *  Dual derivation: backward — observed 10Y (4.3, the window guard's own anchor) − ACM term (0.7)
 *  − the expected real path (≈0.9-1.1 from r* + the inertial policy path) ⇒ ≈ 2.6-2.8 CPI-basis;
 *  forward — 2025 5y5y breakevens (2.3-2.4, TIPS basis) + the CPI-TIPS swap basis (≈0.25-0.35)
 *  ⇒ ≈ 2.6-2.75. Unifies the DUAL INIT found by the sweep (the state field said 0.02, the
 *  simulation fallback said 0.025 — a §2-class divergence pair, logged). User-visible beside τ_cred. */
export const ANCHOR_INIT_2025 = 0.027;
/** E-9c row 2 (ratified): the observed 2025 debt-service/revenue ratio — the year-0 init for the
 *  E-8 adjustment-expectation's lagged service reading (was `?? 0`, a non-inheriting init: inert at
 *  the R-C default, but consolidation-profile users' year-0 ramp started a year late from a false
 *  sub-trigger reading). Derived from the same observed components the E-8 trigger citation uses:
 *  interest $1.05T / federal revenue ≈ $5.8T ≈ 0.18. */
export const BASELINE_DEBT_SERVICE_REVENUE_RATIO = 0.18;
/** E-10 (ratified): the builder adjustment speed — starts move PARTIALLY toward the gap-implied
 *  level AND builders mark to a λ-smoothed price (one agent, one cadence; [RATIFY-parsimony]
 *  approved; the decoupled form is registered with the (b)-test trigger). Calibrated to the
 *  HOUST 2022-23 episode: starts −21% over ~18 months against a static gap-implied ~−45%
 *  (the 4pp shock); λ=0.6 closes 52% of the implied fall at 18mo ≈ the observed 47% — derived,
 *  not fit. Range 0-0.9; 0 (with duration ≤ 0) = the instantaneous legacy (toggle #7). */
export const DEFAULT_BUILDER_ADJUSTMENT_LAMBDA = 0.6;
/** E-10 (ratified, owner-supplied derivation): the construction-pipeline turnover duration is
 *  LENGTH-BIASED — units occupy the pipeline in proportion to their duration, so the stock
 *  over-weights multifamily relative to the 68/32 starts mix: the stock-weighted (duration²-
 *  weighted) figure is (0.68×0.69² + 0.32×1.63²)/0.99 ≈ 1.19y ≈ 1.2. Census SOC durations
 *  (SF ≈ 8.3mo, MF 5+ ≈ 19.5mo); the observed UNDCONTSA stock/flow ratio (~1.45M / ~1.45M/yr)
 *  is the empirical confirmation — and the length bias is WHY the stock check exceeds the
 *  flow-weighted blend (0.99y). ≤ 0 = the legacy 1-yr start-to-completion lag. */
export const HOUSING_PIPELINE_DURATION_YEARS = 1.2;
/** E-10 (the inheritance principle): the OBSERVED 2025 under-construction stock (Census
 *  UNDCONTSA ≈ 1.45M units) — the pipeline's year-0 init, not a derived equilibrium. */
export const INITIAL_HOUSING_PIPELINE = 1_450_000;
/** E-11 (ratified): the land residual closure — the error-correction speed κ pulling L toward its
 *  residual-consistent value L* = (P_value − structureValue)/landShare (the Davis-Heathcote
 *  construction itself — the same source as λ_land, now used for the dynamics as well as the level).
 *  Episode calibration (2022-23): observed residential site values fell ≈15-25% over ~18 months vs
 *  the residual-implied ≈30-40% ⇒ 50-60% closure at 18mo; 1 − 0.55^1.5 ≈ 0.59 brackets it →
 *  κ = 0.45 is the derived center. Range 0.1-1.0; 0 = the pre-E-11 legacy land block (toggle #8).
 *  THE WEDGE FORMALIZATION (owner-supplied, the retirements' precise justification): a surviving
 *  direct flow term f creates a PERMANENT LEVEL WEDGE of f/κ above the residual (1%/yr at κ=0.45 →
 *  land parked 2.2% above its residual value indefinitely) — a standing offset with no economic
 *  justification. Hence β_direct → 0 and landRateSensitivity → 0 (each deprecated-in-place):
 *  income reaches land through what buyers pay for finished housing; rates reach residential land
 *  through the asset's capitalization (farmland re-read: directly capitalized land income, no
 *  structure; residential land receives capitalization RESIDUALLY).
 *  L8b (docs): the internal P→L*→repl→rent→P feedback gains ≈0.24/pass ⇒ total multiplier ≈1.32 —
 *  damped, stated at checkpoint (the standing rule's first validation). */
export const DEFAULT_LAND_CLOSURE_KAPPA = 0.45;

// DEPRECATED: Phase 7 monetization overhaul — was a GDP-fraction rate cap (0.15) for maximum
// monetization per year. Replaced by an absolute money supply safety cap below.
// The monetization rate is now governed by computeMonetizationRate() in monetization.ts
// which returns 0 in normal times (bond-financed deficits), not a fraction of GDP.
// export const FISCAL_MONETARY_MONETIZATION_RATE_CAP = 0.15;

// ============================================================
// 10. Monetary Model Constants
// ============================================================

/**
 * Baseline money supply M2 (trillions, 2025).
 * Source: FRED series M2SL
 */
export const BASELINE_MONEY_SUPPLY = 21_000_000_000_000; // $21T

/**
 * Baseline velocity of money (M2).
 * Source: FRED series M2V, via src/data/fred/m2-velocity.json
 * DEPRECATED: was 1.2
 */
export const BASELINE_VELOCITY_OF_MONEY = govData.m2Velocity;

/**
 * Default sensitivity of money velocity to excess unemployment.
 * Each percentage point of excess unemployment reduces velocity by this fraction.
 * Source: FRED M2V analysis (2000-2023) — velocity dropped ~3% per pp during recessions.
 */
export const DEFAULT_VELOCITY_SENSITIVITY = 0.03;

/**
 * Minimum velocity as fraction of baseline.
 * Prevents velocity from collapsing to zero in extreme scenarios.
 * Source: Great Depression floor — velocity fell ~50% from peak.
 */
export const VELOCITY_FLOOR_RATIO = 0.5;

/**
 * Maximum money supply safety cap for the monetization module.
 * Prevents the money supply from exceeding a physically meaningful upper bound.
 * Derived from MAX_PRICE_LEVEL × BASELINE_GDP_NOMINAL_2025 — the product of
 * maximum tolerable hyperinflation and the economy's nominal output.
 * Well within IEEE 754 double-precision range (~3e22).
 * Source: Model architecture — floating-point safety rail matching monetary.ts cap.
 */
export const FISCAL_MONETARY_SAFETY_CAP = MAX_PRICE_LEVEL * BASELINE_GDP_NOMINAL_2025;

/**
 * Federal funds effective rate — reference for monetary model.
 * Source: FRED FEDFUNDS series, via src/data/fred/fed-funds-rate.json
 */
export const FEDERAL_FUNDS_RATE = govData.fedFundsRate;

/**
 * Initial Federal Reserve policy rate at simulation start.
 * Set to the latest FRED FEDFUNDS observation.
 * Source: FRED FEDFUNDS series, via src/data/fred/fed-funds-rate.json
 */
export const INITIAL_POLICY_RATE = FEDERAL_FUNDS_RATE;

/**
 * Neutral (long-run equilibrium) real interest rate (r*).
 * The rate consistent with full employment and stable inflation.
 * Source: FRED DFEDTARU (Longer-run FOMC dot plot median), Holston-Laubach-Williams (2023)
 *         estimate 0.5%-1.5%. We use 1.0% as a central estimate.
 * Range: -0.02 to 0.05
 *
 * DEPRECATED Phase 8 Fix 4: Now configurable via SimulationConfig.neutralRealRate (default 0.007).
 * Kept for backward compat in functions that don't yet accept the config value.
 */
export const NEUTRAL_REAL_RATE = 0.01;

// ============================================================
// 10c. Phase 7: Fiscal-Monetary Derived Constants
// ============================================================

/**
 * 10-year term premium.
 * Source: NY Fed ACM (Adrian-Crump-Moench) model 10-year term premium, 2024-2025 range: -0.1% to 0.8%.
 * Using 0.5% (50bp) as stable estimate.
 * https://www.newyorkfed.org/research/data_indicators/term_premia
 *
 * DEPRECATED Phase 8 Fix 4: Now configurable via SimulationConfig.termPremium (default 0.003).
 * Kept for backward compat in functions that don't yet accept the config value.
 */
// E-8c F-C (ratified): the 10Y term premium from PUBLISHED estimates — NY Fed ACM (ACMTP10),
// 2024-2025 average ≈ +0.6-0.8pp (Adrian-Crump-Moench; Kim-Wright concordant at +0.4-0.7).
// Replaces the 0.005 implicitly backed out under the pre-E-8b hawkish expected path (the
// two-errors-canceling pattern: the hawkish comparison × the low premium reproduced the
// observed 4.3% 10Y at the 2025 anchor for the wrong reasons).
export const TERM_PREMIUM = 0.007;

/**
 * Equity risk premium (implied, forward-looking).
 * Source: Damodaran (NYU Stern) annual implied ERP computation, Jan 2025: ~4.4-4.6%.
 * Using 4.5% as central estimate.
 * http://pages.stern.nyu.edu/~adamodar/
 */
export const EQUITY_RISK_PREMIUM = 0.045;

/**
 * Initial share of Treasury debt held by foreign investors.
 * Source: Treasury International Capital (TIC) System.
 * ~$7.8T foreign holdings / ~$26T total public debt ≈ 30%.
 */
export const FOREIGN_DEMAND_INITIAL = 0.30;

/**
 * Corporate payout ratio (complement of retention rate).
 * Source: Derived from BEA NIPA corporate retention rate (BASELINE_CORPORATE_RETENTION_RATE).
 * NOTE: Uses late-binding IIFE because BASELINE_CORPORATE_RETENTION_RATE is defined later
 * in the file (line ~1700). This constant is evaluated at module load time after all
 * govData-derived constants have been initialized.
 */
export const CORPORATE_PAYOUT_RATIO = (() => {
  // BASELINE_CORPORATE_RETENTION_RATE ~ 0.40 (BEA NIPA) → payout ~ 0.60
  return 1 - govData.corporateRetentionRate;
})();

/**
 * Share of equities owned by the top 10% of households.
 * Source: Federal Reserve Distributional Financial Accounts (DFA), Q4 2024.
 * Top 10% owns ~88% of equities by market value.
 */
export const EQUITY_CONCENTRATION_TOP10 = 0.88;

/**
 * Sigmoid steepness for fiscal risk premium function.
 * Derived so fiscal risk premium transitions from 10% to 90% of max
 * over a 40 percentage-point range of debt/GDP centered on the sigmoid midpoint.
 * Math: log(9) / 0.20 ≈ 10.99. This is a mathematical derivation, NOT an empirical parameter.
 *
 * DEPRECATED Phase 8 Fix 4: Old sigmoid-on-level model replaced by trajectory-based
 * composite model in bondMarket.ts. Level component uses its own steepness (log(9)/0.30).
 * Kept for backward compat in any code still referencing this constant.
 */
export const SIGMOID_STEEPNESS = Math.log(9) / 0.20;

// ============================================================
// 11. New Job Creation Constants
// ============================================================

/**
 * Innovation rate — new jobs created per dollar of GDP from R&D and new industries.
 * Source: Calibrated from historical data — Autor (2015) AER, BLS employment projections
 */
// FS-2b CITATION-FLAGGED (no value change): the 1.5e-8 basis is unstated -- awaiting a named
// source (BLS BDM firm-births class). Same flag: DEFAULT_RD_MULTIPLIER, DEFAULT_JOB_PERSISTENCE_FACTOR.
export const DEFAULT_INNOVATION_RATE = 0.000000015; // jobs per dollar of GDP

/**
 * R&D multiplier — how much AI-driven R&D amplifies job creation.
 * Source: NSF R&D statistics; calibrated
 */
export const DEFAULT_RD_MULTIPLIER = 1.5;

/**
 * Job persistence factor — how vulnerable new jobs are to automation.
 * >1 = more vulnerable (AI-adjacent fields), <1 = more durable.
 * Source: DATA_MODEL.md Section 6.1 — default assumes AI-adjacent vulnerability
 */
export const DEFAULT_JOB_PERSISTENCE_FACTOR = 1.5;

// ============================================================
// 11b. AI Production Expansion Constants (Phase 2)
// ============================================================

/**
 * AI Productivity Multiplier by deployment type.
 * Represents output ratio: AI output / human output at full capability.
 * Source: McKinsey (2023) AI productivity estimates; BCG GenAI Study (2024)
 *
 * DEPRECATED (Phase 10.A): Replaced by a first-principles productivity formula in
 * simulation.ts computeAIProductionExpansion:
 *   effectiveProductivity = 1 + weightedCapability × betterScore × replacementMultiplier × (1 + cheaperScore)
 * Retained only because clusterParameterOverride.maxProductivityMultiplier has not yet been reworked.
 */
export const AI_PRODUCTIVITY_MULTIPLIER_BY_DEPLOYMENT: Record<DeploymentType, number> = {
  software: 5.0,
  robotics: 2.5,
  autonomous_vehicle: 2.5,
  hybrid: 2.0,
};

/**
 * Fraction of AI additional output → Investment (capital goods, AI infra).
 * Source: BEA Private Fixed Investment breakdown
 */
export const DEFAULT_AI_PRODUCTION_INVESTMENT_FRACTION = 0.30;

/**
 * Fraction of AI additional output → Net Exports (onshoring).
 * Source: Reshoring Initiative; BCG nearshoring projections
 */
export const DEFAULT_AI_PRODUCTION_ONSHORING_FRACTION = 0.10;

/**
 * New job wages as fraction of average cluster wage.
 * Source: Autor (2015) AER; Dorn & Hanson job polarization
 */
export const DEFAULT_NEW_JOB_WAGE_FRACTION = 0.70;

/**
 * Maximum per-worker output boost from AI augmentation at full capability (betterScore=1.0).
 * The effective boost at any given time is betterScore × this multiplier.
 * At 2.0: a cluster with betterScore=0.35 (2025 knowledge work) gets a 70% boost.
 *         a cluster with betterScore=0.90 (near-AGI) gets a 180% boost.
 * Varies by cluster via betterScore's capabilityRelevance weighting.
 * Source: McKinsey (2023) estimates 15-70% gains for generative AI in knowledge work;
 * individual reports of 100-300% gains in software, writing, analysis (2024-2025).
 * User-adjustable via config.augmentationMultiplier.
 * Range: 0 to 5.0
 */
export const DEFAULT_AUGMENTATION_MULTIPLIER = 2.0;

// ============================================================
// 12. Employment Multipliers (Second-Order Effects)
// ============================================================

/**
 * Industry-specific employment multipliers (direct + indirect + induced).
 * The multiplier represents total jobs affected per direct job displaced.
 *
 * THIS IS THE SINGLE SOURCE OF TRUTH for employment multipliers.
 * Values in occupationClusters.ts are fallbacks; at simulation start,
 * cluster.employmentMultiplier is overridden from this constant (Phase 5h Fix 9).
 *
 * Sources:
 *   Trucking 3.4x — American Trucking Associations (ATA) economic impact report
 *   Manufacturing 1.6x — Moretti (2010) "Local Multipliers" AER
 *   Tech/Software 4.3x — Moretti (2010) high local spending multiplier for innovation sector
 *   Retail 1.2x — BEA input-output tables (lower — already local service)
 *   Healthcare 2.1x — BEA; significant local economic anchor
 *   Construction 2.4x — BEA; materials + subcontractor supply chains
 *   Finance 3.2x — BEA input-output; high-income spending multiplier
 *   Legal 3.0x — BEA; professional services cluster effect
 *   Agriculture 1.8x — USDA Economic Research Service
 *   Food Service 1.3x — BEA; low-wage, high-local
 *   Government 1.8x — CBO fiscal multiplier estimates
 *   Creative 2.0x — BEA; arts & entertainment satellite account
 *   Education 1.5x — BEA; local anchor but lower spending multiplier
 *   Scientific R&D 3.0x — NSF; high innovation spillover
 */
export const EMPLOYMENT_MULTIPLIERS: Record<string, number> = {
  // Technology
  tech_swe: 4.3,
  tech_data_ml: 4.0,
  tech_it_support: 3.0,
  tech_qa: 3.5,
  // Finance
  finance_trading: 3.8,
  finance_banking: 3.2,
  finance_accounting: 2.5,
  finance_insurance: 2.3,
  // Healthcare
  health_physicians: 2.1,
  health_nurses: 2.0,
  health_technicians: 1.8,
  health_home_health: 1.5,
  health_admin: 1.5,
  // Education
  edu_teachers: 1.8,
  edu_admin: 1.3,
  edu_support: 1.3,
  // Legal
  legal_attorneys: 3.0,
  legal_paralegals: 2.5,
  // Transportation
  transport_trucking: 3.4,
  transport_delivery: 2.0,
  transport_taxi: 2.2,
  transport_warehouse: 2.5,
  // Manufacturing
  mfg_assembly: 1.6,
  mfg_machinists: 1.8,
  mfg_qc: 1.5,
  // Construction
  construction_electricians: 2.4,
  construction_plumbers: 2.2,
  construction_general: 2.4,
  construction_hvac: 2.0,
  // Retail
  retail_cashiers: 1.2,
  retail_management: 1.5,
  retail_ecommerce: 1.8,
  // Food Service
  food_fast_food: 1.3,
  food_restaurant: 1.4,
  food_industrial: 1.5,
  // Creative
  creative_design: 2.5,
  creative_writing: 2.0,
  creative_marketing: 2.3,
  creative_media: 2.0,
  // Professional Services
  prof_consulting: 3.5,
  prof_hr: 1.5,
  prof_real_estate: 2.0,
  prof_admin: 1.3,
  // Government
  gov_federal: 1.8,
  gov_state_local: 1.8,
  gov_postal: 1.5,
  // Agriculture
  ag_farm_labor: 1.8,
  ag_equipment: 1.6,
  // Scientific R&D
  sci_lab_research: 3.0,
  sci_engineering: 2.8,
  // Other / Uncategorized — catch-all for ~84M workers not in OEWS SOC mapping.
  // Uses simple average as a compile-time placeholder. At runtime, simulation.ts
  // computes the employment-weighted average using actual BLS baseline data.
  // Can be overridden by the user via otherUncategorizedMultiplierOverride in config.
  other_uncategorized: 0, // placeholder — computed below
};

// Simple average of all cluster multipliers (excluding other_uncategorized).
// Used as compile-time fallback. At runtime, the employment-weighted average is preferred.
const _multiplierEntries = Object.entries(EMPLOYMENT_MULTIPLIERS).filter(([k]) => k !== 'other_uncategorized');
const _multiplierSum = _multiplierEntries.reduce((sum, [, v]) => sum + v, 0);
export const SIMPLE_AVG_EMPLOYMENT_MULTIPLIER = _multiplierSum / _multiplierEntries.length;
EMPLOYMENT_MULTIPLIERS['other_uncategorized'] = SIMPLE_AVG_EMPLOYMENT_MULTIPLIER;

// ============================================================
// 13. BFCS Computation Constants
// ============================================================

/**
 * Inference speed factor — how fast AI processes tasks relative to humans.
 * Increases over time with hardware improvements.
 * Source: Calibrated from inference latency benchmarks
 */
export const BASELINE_INFERENCE_SPEED = 0.7;

/**
 * Inference speed improvement rate per year.
 * Source: NVIDIA GPU throughput improvements, ~30% per year
 */
export const INFERENCE_SPEED_IMPROVEMENT_RATE = 0.3;
// FS-1b F3 (hygiene; NO value change): the formerly-inline ×0.1 in the Faster score, named at its
// observed value. CITATION-FLAGGED (FS-1 F10 set): the 0.7/0.3/0.1 trio is citation-thin — the
// Faster dimension's slope constants await a named latency/throughput benchmark source.
export const INFERENCE_SPEED_YEARS_SCALE = 0.1;
// FS-1b F5 (hygiene; NO value change): the formerly-inline ×5 adoption tail-drag asymmetry scale.
// CITATION-FLAGGED: awaiting a named diffusion-asymmetry source (Phase 10.A set it by design intent).
export const ADOPTION_TAIL_ASYMMETRY_SCALE = 5;

/**
 * Task parallelism factor by deployment type — software tasks are highly parallelizable.
 * Source: Calibrated
 */
export const TASK_PARALLELISM: Record<DeploymentType, number> = {
  software: 0.9,
  robotics: 0.5,
  autonomous_vehicle: 0.6,
  hybrid: 0.7,
};

/**
 * Baseline safety record for AI systems (domain-independent starting point).
 * Adjusted per domain via domain_risk_factor.
 * Source: Calibrated from published AI safety benchmarks
 */
export const BASELINE_SAFETY_RECORD = 0.6;

/**
 * Safety improvement rate per year.
 * Source: Calibrated from autonomous driving disengagement rate improvements
 */
export const SAFETY_IMPROVEMENT_RATE = 0.1;

/**
 * Domain risk factors — higher means the domain demands more safety.
 * Normalizes raw safety scores against domain expectations.
 * Source: Calibrated from OCCUPATION_CLUSTERS.md threshold values
 */
// FS-1b F6 (ruled): tsc-enforced exhaustive over the data's REAL category set; the silent 0.8
// fallback is DELETED. THE LIVE DEFECT the exhaustiveness exposed: the data's category is
// 'Construction / Trades' but the map's key was 'Construction' — the cited 0.70 was DEAD and the
// uncited fallback 0.8 was live. Key fixed (a key fix, not a value change). 'Other' is now NAMED
// (0.80, the neutral default for the explicitly-uncategorized bucket, stated rather than silent).
export type ClusterCategory =
  | 'Agriculture' | 'Construction / Trades' | 'Creative' | 'Education' | 'Finance'
  | 'Food Service' | 'Government' | 'Healthcare' | 'Legal' | 'Manufacturing' | 'Other'
  | 'Professional Services' | 'Retail' | 'Scientific R&D' | 'Technology' | 'Transportation';
export const DOMAIN_RISK_FACTORS: Record<ClusterCategory, number> = {
  Technology: 0.85,
  Finance: 0.80,
  Healthcare: 0.60,    // Very demanding — high S* thresholds
  Education: 0.75,
  Legal: 0.80,
  Transportation: 0.55, // Extremely demanding for safety-critical transport
  Manufacturing: 0.75,
  'Construction / Trades': 0.70,  // FS-1b: the key now matches the data (the cited value goes LIVE)
  Retail: 0.90,         // Low stakes
  'Food Service': 0.85,
  Creative: 0.95,       // Very low safety stakes
  'Professional Services': 0.85,
  Government: 0.80,
  Agriculture: 0.80,
  'Scientific R&D': 0.75,
  Other: 0.80,             // FS-1b: the former silent fallback, now NAMED for the uncategorized bucket
};

// ============================================================
// 14. Default Policy Configuration
// ============================================================

/**
 * Default (status quo) policy configuration — all policies disabled.
 * Source: Current US federal policy baseline
 */
export const DEFAULT_POLICY_CONFIG: PolicyConfig = {
  minimumWage: {
    enabled: true,
    federalMinimum: { keyframes: [{ year: 2025, value: 7.25 }] }, // Source: DOL — current federal minimum wage
    stateOverrides: {},
    indexedToInflation: false,
    indexedToProductivity: false,
  },
  wageSubsidy: {
    enabled: false,
    subsidyPercentage: { keyframes: [] },
    maxSubsidyPerWorker: 0,
    phaseOutThreshold: 0,
  },
  // DEPRECATED (Phase 5h Fix 6): No computation logic exists for work week reduction.
  // Kept for structural compatibility. Hidden from UI.
  workWeekReduction: {
    enabled: false,
    standardHours: { keyframes: [{ year: 2025, value: 40 }] },
    overtimeMultiplier: 1.5,
  },
  sovereignWealthFund: {
    enabled: false,
    initialFundSize: 0,
    annualContribution: { keyframes: [] },
    annualReturnRate: 0.07,     // Source: S&P 500 long-term average ~7% real
    distributionRate: 0.04,     // Source: Standard endowment spending rule
    distribution: 'universal',
    // Merged from universalEquity (Phase 5g SWF consolidation)
    ownershipFraction: { keyframes: [] },
    totalAICompanyProfits: 500, // billions/year — FAANG+ 2024 combined profits baseline
    profitGrowthRate: 0.15,
    distributionMethod: 'equal',
  },
  profitSharing: {
    enabled: false,
    mandatorySharePercentage: { keyframes: [] },
    companyRevenueThreshold: 1_000_000_000,
    distributionScope: 'national',
  },
  ubi: {
    enabled: false,
    monthlyAmount: { keyframes: [] },
    ageThreshold: 18,
    // DEPRECATED (Phase 5h Fix 7): phaseOut defined but NOT used in computation.
    // UBI computation in policy.ts treats all eligible citizens identically.
    phaseOut: {
      enabled: false,
      incomeThreshold: 75_000,
      phaseOutRate: 0.2,
    },
    indexedToInflation: true,
    indexedToProductivity: false,
    mode: 'manual',
    indexedBaseAmount: 1000,
    indexedStartYear: 2032,
    productivityIndexRate: 1.0,
  },
  enhancedUI: {
    enabled: true,
    replacementRate: { keyframes: [{ year: 2025, value: 0.45 }] },   // Source: DOL — average UI replacement rate ~45%
    durationWeeks: 26,       // Source: Standard UI duration
    retrainingBonus: 0,
    stateOverrides: {},
  },
  retraining: {
    enabled: false,
    stipendMonthly: { keyframes: [] },
    durationMonths: 6,
    effectivenessRate: 0.3,  // Source: DOL WIOA evaluations — historically ~30% re-employment
    participationRate: 0.30, // Source: DOL WIOA evaluations — ~30% of displaced workers enter retraining
    targetClusters: [],
  },
};

// ============================================================
// BFCS Dimension Display (Phase 4)
// ============================================================

/** Color for each BFCS dimension in the editor and heatmap */
export const BFCS_DIMENSION_COLORS = {
  better: '#3B82F6',   // Blue — quality/capability
  faster: '#06B6D4',   // Cyan — speed
  cheaper: '#10B981',  // Emerald — cost
  safer: '#F59E0B',    // Amber — safety/caution
} as const;

/** Display labels for BFCS dimensions */
export const BFCS_DIMENSION_LABELS = {
  better: 'Better (B*)',
  faster: 'Faster (F*)',
  cheaper: 'Cheaper (C*)',
  safer: 'Safer (S*)',
} as const;

// ============================================================
// 14b. Second-Order Macro Effect Constants (Phase 8)
// ============================================================

/**
 * Profit-Demand Feedback Sensitivity.
 * How much a demand shortfall reduces the AI profit boost.
 * Modeled as operating leverage: demandPenalty = demandRatio^sensitivity
 * At 1.0: linear (10% demand loss → 10% profit reduction)
 * At 1.5: amplified (10% demand loss → 14.6% profit reduction)
 * The 1.5 default corresponds to ~40% fixed costs in the average firm,
 * which is the conservative end of the empirical 40-60% range.
 * Source: Corporate operating leverage (S&P 500 average)
 * Range: 0 (disabled) to 3.0 (highly leveraged economy)
 */
export const DEMAND_FEEDBACK_SENSITIVITY = 1.5;

// DEPRECATED: Housing wealth effect removed in Phase 1 feedback loop overhaul.
// Housing markets in an AI future are unpredictable — land may appreciate as
// everything else deflates. The feature capped at ~$413B impact in a $30T economy (1.4%).
// export const BASELINE_HOUSING_EQUITY = 34_394_219_000_000;
// export const HOUSING_WEALTH_MPC = 0.03;
// export const HOUSING_PRICE_UE_SENSITIVITY = 0.02;
// export const MAX_HOUSING_PRICE_DECLINE = 0.40;

// --- Credit Channel ---

/**
 * SLOOS-equivalent credit tightening per 1pp of excess unemployment.
 * Calibrated to Fed SLOOS data (DRTSCLCC, DRTSCILM) across recessions:
 *   2001: ~2pp excess UE → ~30-40% SLOOS (15-20 per pp)
 *   2008: ~5pp excess UE → ~60-65% SLOOS (12-13 per pp)
 *   2020: ~10pp excess UE → ~70% SLOOS (7 per pp)
 * The relationship is nonlinear (saturates at high UE).
 * 8.0 with a cap at 70% approximates this nonlinearity.
 * Range: 0 (disabled) to 20 (credit crunch)
 */
export const CREDIT_UE_SENSITIVITY = 8.0;

/**
 * Maximum fraction of credit that can contract.
 * Empirical reference: 2008 financial crisis ~40% bank lending decline,
 * Great Depression ~50% total credit contraction (pre-modern central banking).
 * Default 0.70 is conservative — allows worse-than-historical outcomes
 * for unprecedented scenarios (50%+ unemployment).
 * Government bonds, Fed facilities, retained earnings always flow (~30%+ of credit).
 * User-adjustable: lower values = more resilient financial system.
 * Historical peak: ~65-70% net tightening on SLOOS (2008, 2020)
 */
export const MAX_CREDIT_TIGHTENING = 0.70;

/**
 * Maximum investment decline at peak credit tightening.
 * 2008: real private investment fell ~23% (BEA NIPA)
 * 2020: real private investment fell ~12%
 * 0.35 (35%) is calibrated to 2008 actual decline magnitude.
 * Range: 0 (disabled) to 1.0 (severe credit freeze)
 * Source: Fed SLOOS; BEA NIPA Table 5.3 (private fixed investment)
 */
export const CREDIT_INVESTMENT_SENSITIVITY = 0.35;

/**
 * Maximum consumption decline at peak credit tightening.
 * Durable goods ≈ 10% of PCE (BEA NIPA Table 1.1.5)
 * Credit finances ≈ 60% of durable purchases (Fed SCF)
 * Max impact: 10% × 60% = 6% of total consumption
 * This is conservative — excludes credit card and HELOC effects
 * Range: 0 (disabled) to 0.15 (broad credit effects)
 */
export const CREDIT_CONSUMPTION_SENSITIVITY = 0.06;

// ============================================================
// Phase 5i: Housing, Shelter Inflation & Mortgage Stress
// ============================================================

/**
 * Sensitivity of business credit to nominal GDP growth rate.
 * Calibration: 2008 GDP fell ~4.3%, SLOOS business tightening peaked ~60%.
 * 5.0 × 0.043 = 0.215 → ~4.6% investment drop at default sensitivity.
 * Source: Fed SLOOS (SUBLPDMBSXWBNQ), BEA NIPA Table 5.3
 */
export const DEFAULT_BUSINESS_CREDIT_GDP_SENSITIVITY = 5.0;

/**
 * Maximum business credit loosening above baseline.
 * Prevents unbounded investment boost during sustained GDP growth.
 * Source: Historical SLOOS loosening peaks at ~25-30% net easing
 */
export const DEFAULT_MAX_BUSINESS_CREDIT_LOOSENING = 0.30;

/**
 * Baseline shelter CPI weight — fraction of consumer spending on shelter.
 * Source: BLS CPI-U relative importance, December 2023
 */
export const BASELINE_SHELTER_CPI_WEIGHT = 0.36;

/**
 * Default shelter inflation stickiness.
 * 0 = shelter deflates as fast as goods. 1.0 = shelter never deflates from AI.
 * Default 0.80: construction is among last sectors to automate.
 * Source: BLS CPI Shelter historical trend
 */
export const DEFAULT_SHELTER_INFLATION_STICKINESS = 0.80;

/**
 * Baseline shelter inflation rate (annual).
 * Source: BLS CPI Shelter (CUSR0000SAH1) — YoY ~3.0% as of 2026-01, 10-year avg ~3.5%
 */
export const BASELINE_SHELTER_INFLATION = 0.035;

// ============================================================
// Stage 1: Sectoral price architecture (consumption-side CPI partition)
// ============================================================

/**
 * Consumption-side CPI weights for the 4-sector price model. Shelter uses
 * BASELINE_SHELTER_CPI_WEIGHT (0.36). The remaining ~0.64 is partitioned so AI cost deflation
 * reaches ONLY the AI-exposed sector (× passthrough); labor-intensive services track wages (Baumol)
 * and resist AI deflation; food & energy are exogenous. Weights are normalized to sum to 1.0 with
 * shelter at runtime, so changing one re-scales the rest.
 * Source: BLS CPI-U relative importance, December 2023 —
 *   food 13.4% + energy 6.9% ≈ 20% (food & energy);
 *   medical care, education, transportation & recreation services, personal care ≈ 22% (labor-intensive);
 *   durables, apparel, vehicles, information & communication, financial & professional services ≈ 22% (AI-exposed).
 */
export const AI_EXPOSED_CPI_WEIGHT = 0.22;
export const LABOR_SERVICES_CPI_WEIGHT = 0.22;
export const FOOD_ENERGY_CPI_WEIGHT = 0.20;

/**
 * Fraction of AI cost savings passed through to CONSUMER PRICES in AI-exposed sectors.
 * The retained fraction (1 − passthrough) accrues to producer margins/profits — made explicit in
 * Stage 7's residual profit formation. Replaces the prior aiProfitGrowthRate-derived passthrough.
 * User-adjustable, direct semantics: 1.0 = perfectly competitive (all savings to consumers),
 * 0 = full market-power retention (all to margins). Default 0.70 — AI-exposed sectors are largely
 * competitive, so most cost savings reach prices. Range: 0–1.0.
 */
export const DEFAULT_AI_DEFLATION_PASSTHROUGH = 0.70;

/**
 * Labor cost share of labor-intensive service production (Baumol channel). Service prices move with
 * the nominal wage rate scaled by this share. Default 0.60.
 * Source: BEA/BLS — labor compensation share of service-sector gross output ≈ 0.55–0.65. Range: 0–1.0.
 */
export const DEFAULT_LABOR_COST_SHARE = 0.60;

// ============================================================
// Stage 1.5: Embodied-AI sector deflation — per-sector passthrough + cluster routing (R10)
// ============================================================

/**
 * Per-consumption-sector AI-cost-savings passthrough — "fraction of AI cost savings reaching
 * consumer prices in this sector, net of regulatory friction and government policy." This single
 * knob per sector deliberately absorbs regulation, permitting, and supply-management policy.
 * AI-exposed uses DEFAULT_AI_DEFLATION_PASSTHROUGH (0.70). The embodied sectors are LOW because the
 * embodied capability curve is late (midpoint 2035) and slow (steepness 0.3) AND heavily gated by
 * sector regulation. Source: directional calibration (see USER_PARAMETERS.md); user-adjustable.
 */
export const DEFAULT_LABOR_SERVICES_PASSTHROUGH = 0.15; // service robotics moderate-low; licensing friction
export const DEFAULT_FOOD_ENERGY_PASSTHROUGH = 0.10;    // ag automation real but supply-managed
export const DEFAULT_SHELTER_PASSTHROUGH = 0.05;        // housing/land-use regulation → near-zero

/** The four consumption-side price sectors (Stage 1 / 1.5). */
export type ConsumptionSector = 'aiExposed' | 'laborServices' | 'foodEnergy' | 'shelter';

/**
 * R10 — cluster → consumption-sector mapping (Stage 1.5). LOAD-BEARING economic structure, NOT
 * plumbing: it routes each occupation cluster's AI cost deflation to the consumer-price sector its
 * output feeds. Documented constant (NOT user-adjustable). Judgment calls are annotated; the full
 * table is mirrored in DATA_MODEL.md.
 *   Shelter        ← construction trades (housing/shelter costs).
 *   Food & energy  ← agriculture + food production/service (CPI food category; "food away from home"
 *                    folds restaurant/fast-food labor here rather than labor-services).
 *   Labor services ← health (incl. admin), education, legal, professional/business, government,
 *                    AND transport-of-PEOPLE (transport_taxi) — a personal service split from freight.
 *   AI-exposed     ← (default) tech, finance (info-intensive: trading/banking/accounting/insurance),
 *                    manufacturing, retail (retail price = goods price), creative, science/engineering,
 *                    transport of GOODS (trucking/delivery/warehouse — input to goods prices), and
 *                    uncategorized.
 */
export function clusterConsumptionSector(clusterId: string): ConsumptionSector {
  if (clusterId.startsWith('construction')) return 'shelter';
  if (clusterId.startsWith('ag') || clusterId.startsWith('food')) return 'foodEnergy';
  if (clusterId === 'transport_taxi') return 'laborServices'; // transport-of-people (judgment call)
  if (clusterId.startsWith('health') || clusterId.startsWith('edu')
    || clusterId.startsWith('legal') || clusterId.startsWith('prof')
    || clusterId.startsWith('gov')) return 'laborServices';
  return 'aiExposed';
}

/**
 * Default mortgage stress amplifier.
 * Scales the composition effect: how much displaced worker mortgage
 * exposure amplifies credit tightening above a proportional baseline.
 * 0 = all unemployment equal. 1.0 = full pass-through. 2.0 = doubled.
 * Source: Fed Survey of Consumer Finances (SCF) 2022 income-quintile mortgage data
 */
export const DEFAULT_MORTGAGE_STRESS_AMPLIFIER = 0.40;

/**
 * Default foreclosure lag in years.
 * Time between job loss and mortgage default. Typical savings buffer ~9 months.
 * Source: MBA National Delinquency Survey, Elul et al. (2010)
 */
export const DEFAULT_FORECLOSURE_LAG = 0.75;

/**
 * Default homeownership recovery rate (annual).
 * Rate at which homeownership rebuilds after foreclosures.
 * 0 = permanent loss. 0.02 = gradual (post-2008 recovery took ~10 years).
 * Source: Census Housing Vacancy Survey
 */
export const DEFAULT_HOMEOWNERSHIP_RECOVERY_RATE = 0.02;

/**
 * Default housing wealth MPC (marginal propensity to consume from housing wealth).
 * Consensus range 0.02-0.09. Default 0.05 (midpoint).
 * Source: Carroll, Otsuka, Slacalek (2006): immediate $0.02, long-run $0.09.
 *         Case, Quigley, Shiller (2005, 2011): 0.06.
 *         Benjamin, Chinloy, Jud (2004): 0.08.
 *         Fed FEDS 2010-32: overall MPC 3.5%, permanent 3.4-9.1%.
 */
export const DEFAULT_HOUSING_WEALTH_MPC = 0.05;

/**
 * Baseline US residential real estate wealth ($).
 * Source: Fed Z.1 Financial Accounts, 2024 Q3
 */
export const BASELINE_HOUSING_WEALTH = 45e12;

/**
 * Baseline U.S. homeownership rate.
 * Source: Census Housing Vacancy Survey, Q4 2024
 */
export const BASELINE_HOMEOWNERSHIP = 0.642;

/**
 * Default MPC wage UE sensitivity (precautionary saving).
 * Each percentage point of excess unemployment reduces wage MPC by this amount.
 * 0.005 = Great Recession calibration (~3% spending reduction at 5pp excess UE).
 * Source: Carroll (1992), Carroll & Samwick (1997), Challe & Ragot (2010), IMF WP/12/42
 */
export const DEFAULT_MPC_WAGE_UE_SENSITIVITY = 0.005;

/**
 * Default credit adoption sensitivity.
 * How much business credit loosening accelerates AI adoption.
 * Source: COVID-era AI investment patterns, NVIDIA capex correlation with lending availability
 */
export const DEFAULT_CREDIT_ADOPTION_SENSITIVITY = 0.15;

// ═══ Consumer Credit Constants (Phase 6: Income-Based Credit) ═══

/** How much banks trust transfer income for underwriting.
 *  0.50 = new/uncertain UBI, 0.95 = established program like Social Security.
 *  Source: OCC Comptroller's Handbook — Income Analysis for Consumer Lending (2023).
 *  Default 0.70. Range: 0.30-0.95. */
export const DEFAULT_TRANSFER_RELIABILITY_WEIGHT = 0.70;

/** How much income deficiency tightens consumer credit.
 *  Source: Fed SLOOS, FRB Senior Loan Officer Survey — underwriting standards tighten
 *  2-3x for every 10% income decline below baseline.
 *  Default 2.0. Range: 0.5-5.0. */
export const DEFAULT_INCOME_ADEQUACY_SENSITIVITY = 2.0;

/** How much falling home prices tighten mortgage credit.
 *  Source: Case-Shiller HPI vs SLOOS mortgage tightening correlation (2006-2012).
 *  Default 1.0. Range: 0.0-3.0. */
export const DEFAULT_COLLATERAL_SENSITIVITY = 1.0;

/** How much CWI decline triggers systemic credit tightening.
 *  Banks monitor portfolio health via aggregate purchasing power.
 *  Source: Fed Financial Stability Report — systemic risk indicators.
 *  Default 1.5. Range: 0.5-4.0. */
export const DEFAULT_SYSTEMIC_RISK_SENSITIVITY = 1.5;

/** How much inflation above 3% triggers preemptive credit tightening.
 *  Source: Bernanke & Gertler (1995) — financial accelerator mechanism.
 *  Default 0.5. Range: 0.0-2.0. */
export const DEFAULT_INFLATION_RISK_SENSITIVITY = 0.5;

/** Stage 6 (R18): Saturation scale for consumer credit tightening.
 *  The channel-sum level at which the consumption haircut saturates. Re-anchored from 0.5 to 1.0:
 *  0.5 ≈ the GREAT-RECESSION peak (2008-09: mortgage originations −50%, card limits cut ~25-28%
 *  [$1.25T of $4.7T], Fed SLOOS net consumer tightening ~65%) — a severe but NOT total credit stop.
 *  1.0 ≈ DEPRESSION-scale intermediation collapse (1930-33: consumer credit outstanding fell ~50%
 *  [Olney 1999, "Avoiding Default"]; ~9,000 bank suspensions halted intermediation [Bernanke 1983
 *  AER, "Nonmonetary Effects of the Financial Crisis"]). The old 0.5 cap pinned a 50%-UE scenario
 *  AT the GR peak by construction — a hard severity ceiling (audit R18/H6).
 *  Default 1.0. Range: 0.2-1.0. */
export const DEFAULT_MAX_CONSUMER_TIGHTENING = 1.0;

// ============================================================
// Stage 6.5: Stock-flow housing model (owner spec, OD-9a–e; checkpoint ratified)
// ============================================================
/** Housing stock, total units. Source: Census Housing Vacancy Survey (FRED ETOTALUSQ176N), 2025. */
export const BASELINE_HOUSING_STOCK_2025 = 146_600_000;
/** Households. Source: Census (FRED TTLHH), 2025. naturalOccupancy = HH/H ≈ 0.897 (derived at init). */
export const BASELINE_HOUSEHOLDS_2025 = 131_500_000;
/** Δln(headship)/yr per unit (negative) real-income-growth deviation. Calibrated: GR formation collapse
 *  −60% (1.2-1.3M→0.5M/yr, Census HVS; JCHS) at ≈−4pp deviation → 0.06. 0 disables (OD-9c). */
export const DEFAULT_FORMATION_SENSITIVITY = 0.06;
/** /yr proportional headship reversion to baseline. JCHS: post-GR formation recovery ~5-7 yrs. */
export const DEFAULT_HEADSHIP_RECOVERY_RATE = 0.12;
/** % starts per % profitability gap — THE REGULATORY-FRICTION DIAL (default = current land-use reality;
 *  lower = more restrictive, higher = abundance reform). Source: Saiz (2010 QJE) population-weighted
 *  supply elasticity ≈1.5; Topel & Rosen (1988) starts elasticities 1-3. */
export const DEFAULT_HOUSING_SUPPLY_ELASTICITY = 1.5;
/** Fractional construction-capacity gain at full embodied capability (robots build FASTER, not just
 *  cheaper). ATLAS judgment param (explicitly uncertain): 1.0 = 2× capacity at full capability. */
export const DEFAULT_EMBODIED_CAPACITY_GAIN = 1.0;
/** Starts capacity ÷ equilibrium baseline starts. 2005 peak 2.07M ≈ 2.2× the 2025-equilibrium scale. */
export const BASELINE_STARTS_CAPACITY_RATIO = 2.2;
/** /yr permanent stock losses. Source: HUD Components of Inventory Change ~0.2-0.3%/yr. */
export const DEFAULT_HOUSING_DEPRECIATION_RATE = 0.0025;
/** Land share of replacement cost (2025 snapshot). RESEARCH-SOURCED — no government API serves land
 *  prices (HOUSING_STATE_INVENTORY §3). Source: Davis & Heathcote (2007) ~36% avg 1975-2006; Lincoln
 *  Institute land-share estimates ~40%+. */
export const DEFAULT_LAND_SHARE = 0.40;
/** Labor share of construction-cost growth. Source: Census/RSMeans cost composition ~30-40%. */
export const DEFAULT_CONSTRUCTION_LABOR_SHARE = 0.35;
/** Land-price growth per unit nominal household income growth. Source: Knoll, Schularick & Steger
 *  (2017 AER, "No Price Like Home"): land prices track income long-run. Ruled to stay 1.0 — lowering
 *  a literature-cited structural param to move an emergent output is forbidden tuning (6.5 ruling 4). */
export const DEFAULT_LAND_INCOME_BETA = 1.0;
/** Land-price growth per unit occupancy gap. ATLAS JUDGMENT PARAM (flagged, accepted at checkpoint):
 *  land is the residual claimant on scarcity; proportional to the rent elasticity. */
export const DEFAULT_LAND_SCARCITY_ELASTICITY = 2.0;
/** Rent growth per unit occupancy gap. Source: natural-vacancy-rate literature (Rosen & Smith 1983;
 *  modern multifamily: ~1.5-2.5pp rent growth per 1pp vacancy gap). */
export const DEFAULT_RENT_OCCUPANCY_ELASTICITY = 2.0;
/** Weight on replacement-cost growth in rent growth (cost-anchored form, RATIFIED 6.5 ruling 1 —
 *  Glaeser-Gyourko production-cost view; 0 recovers the literal occupancy-only spec form). */
// L9 (ratified): THE ANCHOR RETIRES — the unit-gain circle's edge deleted (gain ≡ this weight = 0).
// Land is sunk for the incumbent landlord: it prices ENTRY, not operation (Tobin's q for housing).
// Full replacement cost (land included) reaches rents ONLY through the entry margin:
// gap → starts → pipeline → completions → occupancy — the INTEGRAL tether (gap* = 0 ⇒ P* = repl*
// ⇒ R* = cap*·repl*), structurally stronger than the proportional anchor it replaces.
// 1.0 = the pre-L9 legacy (the which-change toggle).
export const DEFAULT_RENT_COST_ANCHOR_WEIGHT = 0;
/** L9 (ratified): the landlord P&L cost term — operating expenses ≈ 38-45% of gross rents
 *  (NAA Survey of Operating Income & Expenses; IREM income-expense reports; NOI margins 55-62%).
 *  An ACCOUNTING share, not a supply-elasticity regression (the horizon-mismatch trap satisfied by
 *  construction). ΔCC_operating proxied by construction-cost growth (wages+materials, LAND-FREE);
 *  the value-linked property-tax component deliberately EXCLUDED (would re-import P onto the
 *  retired circle — documented simplification). Range 0-0.6. */
export const DEFAULT_OPEX_PASSTHROUGH = 0.40;
/** L9 (ratified): one-sided nominal rent rigidity — Genesove (2003) "The Nominal Rigidity of
 *  Apartment Rents" (~29% zero nominal change/yr; cuts rare). Episode-derived from 2008-12:
 *  vacancy peaked 10.6% (2009) ⇒ unsticky Δrent ≈ 2.0×(−3pp) + 0.4×(+2) ≈ −5.2%/yr vs observed
 *  CPI rent ≈ flat ⇒ (1−r)×(−5.2) ≈ −0.8 ⇒ r ≈ 0.85 (the conservative pole; r = 1.0 supportable).
 *  Gates the TOTAL downward change (R20-consistent). Range 0-1; one-sided BY CITATION (R24 standard). */
export const DEFAULT_RENT_DOWNWARD_RIGIDITY = 0.85;
// L9b-R3 (registered): 0.85 is the MILD-REGIME value (Genesove; 2008-12). The 1930s record shows
// substantially larger nominal rent declines in deep depressions — this constant will OVERSTATE
// rent stickiness in Scenario C relative to the deepest precedent, by construction of the citation.
// Known regime approximation (the OD-2 treatment); the flexible pole (0) spans it; no
// state-dependent rigidity without a citable functional form.
/** L9b (ratified): the income/willingness-to-pay term in market rents — the trend carrier.
 *  CITATION-FIRST derivation (the 40-year decomposition identity): CPI rent ≈ 3.4%/yr (BLS,
 *  1985-2024) = θ × nominal disposable income per household (≈4.5%/yr, BEA) + 0.40 × construction
 *  cost (≈3.2%/yr, ENR/RSMeans) + occupancy (trendless) ⇒ θ = (3.4 − 1.28)/4.5 ≈ 0.47.
 *  Cross-check (CORROBORATING the same long-run series, per L9b-R4 — not independent): the
 *  rent-burden literature (Albouy-Ehrlich-Liu: stable-to-rising renter burden ⇒ θ 0.47-0.7;
 *  the time-series value is the conservative end). BASIS (the trap discharged): this is a
 *  rent-PRICE-on-income relationship; the housing-demand QUANTITY elasticity (~0.8) was
 *  explicitly rejected as a basis. TWO MARGINS: formation = extensive (households formed; reads
 *  real income deviations); this term = intensive (what each pays; reads nominal growth) —
 *  different equations, not a double-route. Range 0.3-0.7; 0 = off (the toggle). */
export const DEFAULT_RENT_INCOME_ELASTICITY = 0.47;
/** L9c-1 (ratified, R1 residually calibrated): the construction-credit gate sensitivity —
 *  gate = 1 − S × businessCreditTightening. SOLVED through the model's OWN equations on the
 *  observed 2006-12 inputs (the trend-aware perception on the observed CS price path; the E-11
 *  land closure on replacement; ε = 1.5; tightening peaking at the 0.5 GR anchor): S = 2.0 lands
 *  the starts trough at 0.425×baseline vs the observed 0.41 (HOUST 0.55M / ≈1.35M).
 *  ⚠ PRE-REGISTRATION DEVIATION, the why shown (L9C_REPORT §2): the rider expected S < 1.5 on
 *  spot-gap arithmetic (−15/−25%), but the RATIFIED machinery holds the gap POSITIVE (+0.3)
 *  through the GR — the trend-holding perception + the land collapse restoring margins (the
 *  documented real-2010s pattern) — so the gap channel carries none of the collapse and credit
 *  carries it all. ADC −75% (FDIC) remains the capacity-ceiling citation. Range 0-3; 0 = no gate. */
export const DEFAULT_CONSTRUCTION_CREDIT_SENSITIVITY = 2.0;
/** L9c-4: the builder trend-estimator horizon — REUSES the model's standing 10-year expectations
 *  horizon (PROJECTION_HORIZON, bondMarket.ts) rather than introducing a free constant. */
export const BUILDER_TREND_HORIZON_YEARS = 10;
/** L9c-R2 (the inheritance principle): the trend estimator's OWN value on observed data — the
 *  10-year EMA of realized Case-Shiller national growth through 2025 (FRED CSUSHPINSA, annual:
 *  6.6,4.5,5.1,5.8,5.8,3.4,6.0,17.1,14.8,2.5,5.1,2.2 → EMA(1/10) = 6.12%). EMBEDS the 2020-22
 *  spike: actual 2025 builders' trend beliefs ARE elevated — the early entry tilt is real and
 *  pre-registered as such; no spike-trimming without a citation. */
export const BUILDER_TREND_GROWTH_INIT_2025 = 0.0612;
/** FS-4b (the inheritance principle): the observed 2025 home-price growth — FRED CSUSHPINSA
 *  annual (2025/2024 ≈ +2.2%, the same committed series as the R2 init). The year-0
 *  homePriceChangeRate output (one EMA tap of the builder trendG at year 1) was a hardcoded 0.01. */
export const OBSERVED_2025_HOME_PRICE_GROWTH = 0.022;
/** L9c-5 (cited): the fiscal-dominance flag threshold reads interest/REVENUE (slot semantics
 *  verified) — the IMF DSA-class interest/revenue stress band ≈ 20-25%; 0.25 = its top. US 2025
 *  observed ≈ 18% (under: the flag correctly OFF at year 0). Downstream when firing without
 *  monetization: (i) dampens the realized policy prescription toward the inherited rate; (ii)
 *  feeds the expected path's dominance-fade. NOTE (owner): the baseline's 2040s interest/revenue
 *  (28-34%) is a defensible cited divergence from CBO's no-premium convention — the model prices
 *  β_level on the growing stock; CBO does not. Dial 0.15-0.40. */
export const DEFAULT_FISCAL_DOMINANCE_THRESHOLD = 0.25;
/** Rent-price ratio anchor. Source: Davis-Lehnert-Martin rent-price series ~5%; 2024-25 multifamily
 *  cap rates ~5.3-5.7%. */
export const DEFAULT_BASELINE_CAP_RATE = 0.052;
/** Δcap-rate per Δmortgage rate. Source: empirical cap-rate beta to long rates ≈0.3-0.5 (NCREIF/CBRE). */
export const DEFAULT_CAP_RATE_MORTGAGE_BETA = 0.4;
/** Baseline mortgage rate anchor (10Y ~4.3% + spread ~1.7%). Promoted from the inline 0.06 (Stage 6.5). */
// E-12 (ratified, the interface audit row 1): the capRate reference DERIVED same-date from the
// model's own observed chain — INITIAL_10Y_YIELD (FRED DGS10, 4.53) + the same-date spread
// (MORTGAGE30US − DGS10 ≈ 1.99) ≈ 6.52%. The old hand-set 0.06 disagreed with the model's own
// 2025 mortgage by ~0.5pp (the phantom-6.0 forensic: a reference derived from a stale long-run
// spread assumption — two internally-defensible constants, jointly wrong; the third two-wrongs
// variant, controlled by the fourth sweep class). DEFAULT_BASELINE_CAP_RATE 0.052 is documented
// as measured AT this snapshot → capRate(2025) = 0.052 by construction. Deriving (not hand-setting)
// makes the chain move together — it cannot silently diverge again.
// The 2022-25 spread elevation is plausibly transient (QT/MBS duration): the mean-reverting-spread
// refinement (decay toward ~1.7, MBS-spread literature, dial mortgageSpreadConvergence) is
// REGISTERED, default off — no machinery now (ruled).
export const BASELINE_MORTGAGE_RATE_2025 = (() => {
  return govData.treasuryYield10Y + govData.mortgageSpread;
})();
// DEPRECATED (E-12): the hand-set 0.06 reference — kept for the which-change toggle via
// config.mortgageRateReference. reason: the legacy pair for isolation runs only.
export const LEGACY_MORTGAGE_RATE_REFERENCE = 0.06;
/** Home-price impact per unit UNABSORBED foreclosure flow (replaces the hand-set ×3.0). Source:
 *  Mian, Sufi & Trebbi (2015): foreclosures ≈20-30% of the GR price decline; Campbell, Giglio &
 *  Pathak (2011): ~27% forced-sale discounts. */
export const DEFAULT_FIRE_SALE_ELASTICITY = 1.75;
/** OD-9b: land-price bid per unit asset-income-share deviation from 2025 — the owner's land/store-of-
 *  value thesis dial. Default modest; 0 = capital ignores land. R24: ONE-SIDED (max(0, dev)) — land
 *  ratchets up and does not surrender gains when the asset share recedes (held, not dumped). */
export const DEFAULT_INVESTOR_DEMAND_INTENSITY = 0.10;
/** Optional direct cap-rate compression per unit investor pressure (default OFF per 6.5 ruling 2). */
export const DEFAULT_CAP_RATE_INVESTOR_COMPRESSION = 0;

/** Stage 6 (R18): the GREAT-RECESSION-peak channel-sum anchor (= the old ceiling). Used as the
 *  normalizer for the credit-DEFLATION contribution so that re-scaling the consumption ceiling
 *  does not silently halve sub-saturation deflation pressure: a GR-level tightening (0.5) produces
 *  the same deflation contribution it always did (rate 1.0 = "one GR-unit"); Depression-scale
 *  tightening can now reach rate 2.0. Source: Fed SLOOS 2008-09 peak ~65% net tightening;
 *  mortgage originations −50%; card limits −25-28%. */
export const CONSUMER_TIGHTENING_GR_PEAK = 0.5;

/** Stage 6 (R18): consumption haircut at SATURATED credit tightening.
 *  Derivation (literature-anchored, not scenario-tuned):
 *  GR anchor — Mian, Rao & Sufi (2013 QJE): MPC out of housing net worth 0.054-0.072; the ~$6T
 *  net-worth shock ≈ $350-450B PCE hit ≈ 3.5-4.5% of PCE; + non-housing consumer credit channel
 *  (SLOOS card/auto tightening) ≈ 1-2% → GR credit-channel consumption hit ≈ 5-7% of PCE, at
 *  GR-peak tightening (ratio ≈ 0.5 on the new scale). Linear pass-through ⇒ saturated haircut
 *  = ~6% / 0.5 = 12%. Upper-bound check: 1929-33 real consumption fell ~19% with roughly half
 *  attributable to credit/intermediation collapse (Bernanke 1983; Olney 1999) — ~9-10% directly
 *  credit-attributable, consistent with a 12% saturation point and well below the ~25-30% of PCE
 *  that is credit-financed (durables + financed services, BEA NIPA 2.3.5).
 *  At GR-scale shocks this reproduces the old behavior exactly (0.12 × 0.5 = 6%); Depression-scale
 *  shocks can now reach 12% instead of being clipped at the GR value.
 *  Default 0.12. Range: 0.02-0.15. */
export const DEFAULT_CONSUMER_CREDIT_IMPACT = 0.12;

/** Banks heavily discount volatile asset income for underwriting.
 *  Source: Fannie Mae Selling Guide B3-3.1 — non-employment income documentation.
 *  Dividends/capital gains require 2-year history and are discounted 50-70%. */
export const ASSET_INCOME_UNDERWRITING_WEIGHT = 0.3;

/** Rising home prices loosen credit 3x slower than falling prices tighten.
 *  Banks are more fear-driven (2008 memory) than greed-driven.
 *  Source: Adelino, Schoar, Severino (2016) — asymmetric lending response. */
export const COLLATERAL_LOOSENING_ASYMMETRY = 0.3;

// ═══ Business Credit Constants (Phase 6: Profit-Based Credit) ═══

/** How much profit decline tightens business credit.
 *  Source: Fed SLOOS (SUBLPDMBSXWBNQ) — C&I loan tightening correlates 1.5x
 *  with profit coverage ratio decline.
 *  Default 1.5. Range: 0.5-4.0. */
export const DEFAULT_PROFITABILITY_SENSITIVITY = 1.5;

/** How much GDP growth loosens business credit.
 *  Source: Fed SLOOS (SUBLPDMBSXWBNQ) — 2% GDP growth → ~10% net easing.
 *  Default 2.0. Range: 0.5-5.0. */
export const DEFAULT_GROWTH_TRAJECTORY_SENSITIVITY = 2.0;

/** Maximum business credit restriction level.
 *  Source: 2008 peak: C&I lending fell ~25%, but total business credit tightened ~50%.
 *  Default 0.5. Range: 0.2-1.0. */
export const DEFAULT_MAX_BUSINESS_TIGHTENING = 0.5;

/** How much business credit tightening reduces investment.
 *  Source: BEA NIPA Table 5.3 — 2008 real private investment fell ~23%.
 *  Default 0.15. Range: 0.05-0.30. */
export const DEFAULT_BUSINESS_INVESTMENT_IMPACT = 0.15;

/** Growth channel alone can't tighten more than this.
 *  Prevents GDP decline from dominating profitability signal.
 *  Default 0.3. */
export const DEFAULT_MAX_GROWTH_TIGHTENING = 0.3;

/**
 * Mortgage exposure by income quintile.
 * Source: Federal Reserve Survey of Consumer Finances (SCF) 2022,
 *         Census Housing Vacancy Survey 2023.
 * Used to compute how displacement composition affects banking stress.
 */
export const MORTGAGE_EXPOSURE_QUINTILES = [
  { label: 'Q1 (bottom 20%)', homeownershipRate: 0.47, mortgageBurdenPct: 0.28 },
  { label: 'Q2',              homeownershipRate: 0.55, mortgageBurdenPct: 0.25 },
  { label: 'Q3',              homeownershipRate: 0.63, mortgageBurdenPct: 0.22 },
  { label: 'Q4',              homeownershipRate: 0.75, mortgageBurdenPct: 0.20 },
  { label: 'Q5 (top 20%)',    homeownershipRate: 0.81, mortgageBurdenPct: 0.17 },
] as const;

// --- Fiscal Pressure ---

/**
 * Baseline government transfer payments (all levels of government).
 * Source: FRED W068RCQ027SBEA (Government Social Benefits to Persons)
 * Fetched from FRED API; fallback below
 */
export const BASELINE_GOVT_TRANSFERS = 4_500_000_000_000; // $4.5T

/**
 * Baseline government net interest payments.
 * Source: FRED A091RC1Q027SBEA
 */
// DEPRECATED Phase 7: replaced by dynamic interestExpense = debtStock × weightedAverageRate in fiscal.ts
export const BASELINE_DEBT_INTEREST = 1_050_000_000_000; // $1.05T

/**
 * Effective combined tax rate (federal + state/local).
 * Source: computed from FRED FGRECPT + SLEXPND / GDP
 */
// DEPRECATED (Phase 5-tax): replaced by decomposed tax channels. Kept for STATE_LOCAL_TAX_RATE calibration.
export const EFFECTIVE_TAX_RATE = 0.25;

// ═══════════════════════════════════════════
// TAX SYSTEM DEFAULTS (Phase 5-tax)
// ═══════════════════════════════════════════

// Baseline rates — computed from BEA in govData, these are fallbacks
export const FALLBACK_INCOME_TAX_RATE = 0.132;
export const FALLBACK_PAYROLL_TAX_RATE = 0.136;
export const FALLBACK_CORPORATE_TAX_RATE = 0.14;
export const FALLBACK_CAPITAL_GAINS_RATE = 0.165;
export const FALLBACK_CORPORATE_RETENTION_RATE = 0.40;

// Data-driven baseline rates (from govData)
export const BASELINE_INCOME_TAX_RATE = govData.effectiveIncomeTaxRate;
export const BASELINE_PAYROLL_RATE = govData.effectivePayrollRate;
export const BASELINE_CORPORATE_TAX_RATE = govData.effectiveCorporateTaxRate;
export const BASELINE_CAPITAL_GAINS_RATE = govData.effectiveCapGainsRate;
export const BASELINE_CORPORATE_RETENTION_RATE = govData.corporateRetentionRate;
export const BASELINE_PROFIT_GDP_RATIO = govData.baselineProfitGDPRatio;

// Structural (not user-adjustable)
/** IRC §3101/§3111 statutory employer-employee split */
export const EMPLOYER_EMPLOYEE_SPLIT = 0.50;
/** SS partially taxable — structural rate on transfer income */
export const TRANSFER_TAX_RATE = 0.05;

/**
 * State/local rate: calibration residual so baseline total matches EFFECTIVE_TAX_RATE.
 * Source: Computed — (0.25 × GDP − all federal channels) / GDP
 */
export const STATE_LOCAL_TAX_RATE = (() => {
  const gdp = BASELINE_GDP_NOMINAL_2025;
  const wages = BASELINE_WAGE_INCOME;
  const assets = BASELINE_ASSET_INCOME;
  const transfers = BASELINE_TRANSFER_INCOME;
  const corpProfits = BASELINE_PROFIT_GDP_RATIO * gdp;

  const incomeTax = wages * BASELINE_INCOME_TAX_RATE;
  const empPayroll = wages * BASELINE_PAYROLL_RATE * EMPLOYER_EMPLOYEE_SPLIT;
  const erPayroll = wages * BASELINE_PAYROLL_RATE * EMPLOYER_EMPLOYEE_SPLIT;
  const corpTax = corpProfits * BASELINE_CORPORATE_TAX_RATE;
  const capGains = assets * BASELINE_CAPITAL_GAINS_RATE;
  const transferTax = transfers * TRANSFER_TAX_RATE;

  const federalTotal = incomeTax + empPayroll + erPayroll + corpTax + capGains + transferTax;
  const targetTotal = EFFECTIVE_TAX_RATE * gdp; // 0.25 × GDP
  return Math.max(0, (targetTotal - federalTotal) / gdp);
})();

// Post-tax MPC defaults (calibrated for after-tax income)
export const DEFAULT_POST_TAX_MPC_WAGE = 0.95;
export const DEFAULT_POST_TAX_MPC_ASSET = 0.42;
export const DEFAULT_POST_TAX_MPC_TRANSFER = 0.95;

// ═══════════════════════════════════════════
// AI COST DECOMPOSITION (Phase 5-tax)
// ═══════════════════════════════════════════

/**
 * DEPRECATED (Phase 10.A): Replaced by DEFAULT_TOKEN_COST_CURVE × DEFAULT_TOKEN_USAGE_GROWTH.
 * Prior constant-rate exponential compounded to ~77,000× cheaper by 2050 — implausible.
 * Retained for legacy scenarios that explicitly pass AICostParams.inferenceAnnualChange.
 */
export const DEFAULT_INFERENCE_ANNUAL_CHANGE = -0.45;
export const DEFAULT_MANUFACTURING_ANNUAL_CHANGE = -0.10;
export const DEFAULT_ENERGY_ANNUAL_CHANGE = -0.03;

// NOTE: Keys MUST match DeploymentType: 'software' | 'robotics' | 'autonomous_vehicle' | 'hybrid'
// DEPRECATED: AI_COST_COMPOSITION — use DEPLOYMENT_COST_COMPOSITION (Phase 9 supply chain) for new code.
// Kept for backward compatibility. Same numeric values, different field names.
export const AI_COST_COMPOSITION: Record<string, { inference: number; manufacturing: number; energy: number }> = {
  software:            { inference: 0.85, manufacturing: 0.00, energy: 0.15 },
  hybrid:              { inference: 0.55, manufacturing: 0.20, energy: 0.25 },
  autonomous_vehicle:  { inference: 0.20, manufacturing: 0.55, energy: 0.25 },
  robotics:            { inference: 0.15, manufacturing: 0.60, energy: 0.25 },
};

// ═══════════════════════════════════════════
// CORPORATE / INVESTMENT (Phase 5-tax)
// ═══════════════════════════════════════════

export const DEFAULT_AI_PROFIT_GROWTH_RATE = 2.0;  // same value as existing AI_PROFIT_GROWTH_RATE

/**
 * Investment capacity gate sensitivity.
 * At capacityRatio=1.5: gate ≈ 0.82. At 3.0: gate ≈ 0.58.
 * Source: Calibrated — soft constraint on investment exceeding corporate capacity
 */
export const CAPACITY_GATE_SENSITIVITY = 0.5;

/**
 * Baseline retained earnings — calibration anchor for credit capacity.
 * = corporate profits × (1 - corporate tax rate) × retention rate
 * Source: BEA NIPA Table 1.12 / FRED B057RC1Q027SBEA
 */
export const BASELINE_RETAINED_EARNINGS = (() => {
  const corpProfits = BASELINE_PROFIT_GDP_RATIO * BASELINE_GDP_NOMINAL_2025;
  const afterTax = corpProfits * (1 - BASELINE_CORPORATE_TAX_RATE);
  return afterTax * BASELINE_CORPORATE_RETENTION_RATE;
})();

export const BASELINE_CREDIT_FUNDED = BASELINE_INVESTMENT_2025 - BASELINE_RETAINED_EARNINGS;

/**
 * DEPRECATED (Stage 5 / H3): the independent $65B/pp constant is RETIRED from all consumers. It was a
 * CBO automatic-stabilizer FIRST-YEAR-FLOW estimate ($30B UI + $15B SNAP + $20B Medicaid per pp), applied
 * as a perpetual stock cost, and it fed ONLY the reporting-side deficit (computeFiscalPressure →
 * MacroOutput.fiscalDeficitGDPRatio) — the load-bearing debt path never booked ANY incremental-UE
 * transfer cost, while households received $19,200/person of unbooked income (the H3 split-brain).
 * Incremental transfer SPENDING is now DERIVED from the same per-person constants (CASH + IN-KIND)
 * × incremental-unemployed headcount in BOTH the reporting deficit and the load-bearing budget.
 * Sanity: 1pp UE ≈ 1.68M people × $13,000 ≈ $21.8B/pp — the $65B was ~3× the consistent value.
 */
export const TRANSFER_GROWTH_PER_UE_POINT = 65_000_000_000; // DEPRECATED — see above (was $65B/pp)

/**
 * Share of G (government purchases) that is discretionary.
 * Discretionary = defense + non-defense discretionary appropriations
 * Mandatory G = government employee compensation, existing contracts
 * Source: BEA NIPA Table 3.2 (defense + non-defense / total purchases)
 */
export const DISCRETIONARY_SHARE_OF_G = 0.55; // 55%

// DEPRECATED: Fiscal austerity removed in Phase 1 feedback loop overhaul.
// 0.5pp UE impact in sensitivity analysis. Threshold and rate are both assumed
// with no defensible basis. Government fiscal response to AI-driven deficits is
// a political decision, not an economic law.
// export const FISCAL_STRESS_THRESHOLD = 0.12;
// export const FISCAL_AUSTERITY_RATE = 0.02;

// ============================================================
// State-Level Model Constants (Phase 6)
// ============================================================

/**
 * Displacement-to-unemployment conversion factor.
 * Not all displaced workers join the unemployed — some leave the labor force,
 * retire early, or transition to gig/informal work.
 * Source: DATA_MODEL.md §6.2; CBO displaced worker studies estimate 60-80% → 0.7
 */
export const DISPLACEMENT_TO_UNEMPLOYMENT_FACTOR = 0.7;

/**
 * State comparison chart colors.
 * Source: DESIGN_PHILOSOPHY.md color palette for multi-series charts
 */
export const STATE_COMPARISON_COLORS = {
  state1: '#D4A03C', // Gold (primary)
  state2: '#3B82F6', // Blue
  state3: '#10B981', // Emerald
} as const;

// ============================================================
// Policy Channel Display (Phase 5)
// ============================================================

/** Color for each income channel in policy controls and charts */
export const POLICY_CHANNEL_COLORS = {
  wage: '#3B82F6',     // Blue — wage policies
  asset: '#10B981',    // Emerald — asset policies
  transfer: '#F59E0B', // Amber — transfer policies
} as const;

// ═══════════════════════════════════════════
// SUPPLY CHAIN DEFAULTS (Phase 9)
// ═══════════════════════════════════════════

/** Default supply chain input values (100 = no constraint). */
export const DEFAULT_SUPPLY_CHAIN_INPUTS: SupplyChainInputs = {
  aiChips: 100,
  energyPrice: 100,
  energyCapacity: 100,
  trainingDCCapacity: 100,
  inferenceDCCapacity: 100,
  roboticsHardware: 100,
  softwareEfficiency: 100,
};

/**
 * Default per-input resilience values [0, 0.95].
 * Source: See docs/Prompts/Pending/atlas-phase9-supply-chain.md §3.
 */
export const DEFAULT_RESILIENCE: SupplyChainResilience = {
  aiChips: 0.05,        // TSMC 70%+ foundry share. Source: TrendForce Q2 2025.
  energy: 0.85,         // US largest producer, domestic grid. Source: EIA.
  trainingDC: 0.90,     // Domestic construction. Source: xAI Colossus 122 days.
  inferenceDC: 0.90,    // US cloud providers dominant. Source: Synergy Research.
  roboticsHardware: 0.05, // China 90%+ rare earth processing. Source: IEA 2024, CSIS Oct 2025.
};

/**
 * Annual improvement rates for resilience.
 * Source: CHIPS Act fab timelines, MP Materials DoD partnership, Lynas contract.
 */
export const RESILIENCE_IMPROVEMENT_RATES: SupplyChainResilience = {
  aiChips: 0.03,        // CHIPS Act fabs coming online 2027+
  energy: 0.01,         // Slow grid expansion
  trainingDC: 0.005,    // Already domestic
  inferenceDC: 0.005,   // Already domestic
  roboticsHardware: 0.02, // MP Materials, Lynas partnership
};

/** Maximum resilience for supply inputs. */
export const MAX_RESILIENCE = 0.85;
/** Maximum resilience for datacenter inputs (higher cap — domestic infrastructure). */
export const MAX_RESILIENCE_DC = 0.95;

/**
 * Initial training cost shares. Must sum to 1.0.
 * Source: Epoch AI (2025) — accelerators 47-67% of cluster cost.
 */
export const DEFAULT_TRAINING_COMPOSITION: TrainingComposition = {
  aiChips: 0.55,    // Accelerators + HBM + interconnect
  energy: 0.25,     // Binding operational constraint at GW-scale
  datacenter: 0.20, // Facility, cooling, networking. Most substitutable.
};

/**
 * Default procurement constraint shares. Must sum to 1.0.
 * Reflects physical throughput limits independent of per-unit cost.
 *
 * Source:
 *   aiChips 0.45 — Fabs take 3-5yr to build (TSMC Arizona: announced 2020, production 2025).
 *                   HBM expansion ~2yr cycle. Source: SIA, TSMC investor relations.
 *   energy 0.35  — Grid interconnection 2-4yr lead time, generation capacity 3-10yr.
 *                   Source: DOE Grid Deployment Office, FERC interconnection queue data.
 *   datacenter 0.20 — Fastest to scale (xAI Colossus: 122 days), but permitting-dependent.
 *                      Source: xAI Memphis facility timeline, JLL DC market report 2025.
 */
export const DEFAULT_PROCUREMENT_SHARES: TrainingComposition = {
  aiChips: 0.45,
  energy: 0.35,
  datacenter: 0.20,
};

/**
 * Default blend weight between cost-driven and procurement-driven composition.
 * 1.0 = pure cost share, 0.0 = pure procurement constraint share.
 * 0.50 = equal weight to both signals.
 */
export const DEFAULT_COST_VS_PROCUREMENT_BLEND = 0.50;

/**
 * YoY multiplier on training compute demand.
 * Source: Epoch AI 4-5x/yr; conservative 3.0x with algorithmic efficiency offsets.
 */
export const DEFAULT_TRAINING_SCALE_GROWTH_RATE = 3.0;

/** Per-component training cost dynamics (tech decline rate, scale pressure). */
export const DEFAULT_TRAINING_DYNAMICS = {
  aiChips:    { techDeclineRate: -0.35, scalePressure: 0.05 },  // Fastest tech decline; fab scaling well-understood
  energy:     { techDeclineRate: -0.04, scalePressure: 0.15 },  // GPU efficiency offset by density; grid doesn't scale
  datacenter: { techDeclineRate: -0.08, scalePressure: 0.25 },  // Modular innovation; hard phys constraints
};

/**
 * Multiplier on DC scale pressure from permitting/regulatory environment.
 * 1.0 = current; 2.0 = permitting gridlock; 0.3 = streamlined or space DCs.
 */
export const DEFAULT_REGULATORY_FRICTION = 1.0;

/** How long before training chips reach inference. Source: ~1 GPU generation cycle. */
export const DEFAULT_CASCADE_LAG = 2.5;
/** How much more expensive per-query older-gen chips are vs expected cascade. */
export const DEFAULT_CASCADE_COST_PREMIUM = 0.30;

/** Initial cost pass-through rate. Trajectory computed in autopilot. */
export const DEFAULT_COST_PASS_THROUGH = 0.0;
/** Deployer cost pass-through to consumers. */
export const DEFAULT_CONSUMER_PASS_THROUGH = 0.50;

/** Cost pass-through trajectory anchors for linear interpolation. */
export const PASS_THROUGH_TRAJECTORY = [
  { year: 2025, value: 0.00 },
  { year: 2035, value: 0.30 },
  { year: 2045, value: 0.75 },
];

/** Maximum hysteresis width for cognitive AI adoption. */
export const DEFAULT_HYSTERESIS_MAX_COGNITIVE = 0.25;
/** Maximum hysteresis width for embodied AI adoption. */
export const DEFAULT_HYSTERESIS_MAX_EMBODIED = 0.35;
/** Base hysteresis width for cognitive (immediate upon adoption). */
export const HYSTERESIS_BASE_COGNITIVE = 0.05;
/** Base hysteresis width for embodied (immediate upon adoption). */
export const HYSTERESIS_BASE_EMBODIED = 0.10;
/** Years for cognitive hysteresis to reach max width. */
export const HYSTERESIS_CAP_YEARS_COGNITIVE = 6;
/** Years for embodied hysteresis to reach max width. */
export const HYSTERESIS_CAP_YEARS_EMBODIED = 5;
/** Maximum annual adoption decline rate for cognitive AI. */
export const ADOPTION_DECLINE_RATE_COGNITIVE = 0.10;
/** Maximum annual adoption decline rate for embodied AI. */
export const ADOPTION_DECLINE_RATE_EMBODIED = 0.05;

/**
 * Deployment cost composition per deployment type.
 * Same numeric values as AI_COST_COMPOSITION but with supply-chain-aligned field names.
 * compute = inference GPU/HBM amortization
 * physicalHardware = robots, sensors, vehicles (0 for software)
 * energy = operational power
 */
export const DEPLOYMENT_COST_COMPOSITION: Record<DeploymentType, DeploymentCostComposition> = {
  software:            { compute: 0.85, physicalHardware: 0.00, energy: 0.15 },
  hybrid:              { compute: 0.55, physicalHardware: 0.20, energy: 0.25 },
  autonomous_vehicle:  { compute: 0.20, physicalHardware: 0.55, energy: 0.25 },
  robotics:            { compute: 0.15, physicalHardware: 0.60, energy: 0.25 },
};

/** Sensitivity level constants for the sensitivity matrices. */
export const SENSITIVITY_NONE = 0;
export const SENSITIVITY_LOW = 0.25;
export const SENSITIVITY_MEDIUM = 0.50;
export const SENSITIVITY_HIGH = 0.75;

// SupplyInputKey and BFCSDimension imported from @/types (defined in types/supplyChain.ts)

/**
 * Cognitive AI sensitivity matrix — how supply inputs affect BFCS dimensions.
 * Applies to software + hybrid deployment types.
 * Source: atlas-phase9-supply-chain.md §4.
 */
export const COGNITIVE_SENSITIVITY: Record<SupplyInputKey, Record<BFCSDimension, number>> = {
  aiChips:              { better: 0.75, faster: 0.50, cheaper: 0.75, safer: 0    },
  energyPrice:          { better: 0.75, faster: 0,    cheaper: 0.75, safer: 0    },
  energyCapacity:       { better: 0.75, faster: 0,    cheaper: 0,    safer: 0    },
  trainingDCCapacity:   { better: 0.75, faster: 0,    cheaper: 0.25, safer: 0    },
  inferenceDCCapacity:  { better: 0,    faster: 0.50, cheaper: 0.75, safer: 0    },
  roboticsHardware:     { better: 0,    faster: 0,    cheaper: 0,    safer: 0    },
};

/**
 * Embodied AI sensitivity matrix — how supply inputs affect BFCS dimensions.
 * Applies to robotics + autonomous_vehicle deployment types.
 * Source: atlas-phase9-supply-chain.md §4.
 */
export const EMBODIED_SENSITIVITY: Record<SupplyInputKey, Record<BFCSDimension, number>> = {
  aiChips:              { better: 0.50, faster: 0.25, cheaper: 0.50, safer: 0.25 },
  energyPrice:          { better: 0.50, faster: 0,    cheaper: 0.50, safer: 0    },
  energyCapacity:       { better: 0.50, faster: 0,    cheaper: 0,    safer: 0    },
  trainingDCCapacity:   { better: 0.50, faster: 0,    cheaper: 0.25, safer: 0    },
  inferenceDCCapacity:  { better: 0,    faster: 0.25, cheaper: 0.25, safer: 0    },
  roboticsHardware:     { better: 0.50, faster: 0.50, cheaper: 0.75, safer: 0.50 },
};

/**
 * Propagation lag table (months).
 * How long it takes for a supply shock to propagate to each BFCS dimension.
 * Source: atlas-phase9-supply-chain.md §5.
 */
export const PROPAGATION_LAGS: Record<SupplyInputKey, Record<BFCSDimension, number>> = {
  aiChips:              { better: 12, faster: 2,  cheaper: 2,  safer: 0 },
  energyPrice:          { better: 6,  faster: 0,  cheaper: 0,  safer: 0 },
  energyCapacity:       { better: 6,  faster: 0,  cheaper: 0,  safer: 0 },
  trainingDCCapacity:   { better: 24, faster: 0,  cheaper: 0,  safer: 0 },
  inferenceDCCapacity:  { better: 0,  faster: 4,  cheaper: 4,  safer: 0 },
  roboticsHardware:     { better: 6,  faster: 6,  cheaper: 6,  safer: 6 },
};

// ============================================================
// Policy Presets (Phase 5)
// Source: POLICY_MODEL.md §7 — Policy Scenario Presets
// ============================================================

export interface PolicyPreset {
  id: string;
  label: string;
  description: string;
  config: PolicyConfig;
}

/**
 * Named policy presets for one-click scenario loading.
 *
 * Sources:
 * - UBI $1,000/month: Andrew Yang 2020 Freedom Dividend proposal
 * - SWF $500B initial: comparable to Norway Government Pension Fund (~$1.4T as of 2024)
 * - 7% return rate: S&P 500 long-term real average (Shiller CAPE data)
 * - Nordic model 80% replacement: Denmark flexicurity system
 * - 50% retraining effectiveness: DOL WIOA evaluations — historically ~30%, Nordic systems ~50%
 */
// ============================================================
// Government Data Validation (runs at module load)
// ============================================================
const _govDataWarnings = validateGovernmentData();
if (_govDataWarnings.length > 0) {
  console.warn('⚠️ ATLAS Government Data Warnings:');
  for (const w of _govDataWarnings) {
    console.warn(`  • ${w}`);
  }
}

export const POLICY_PRESETS: PolicyPreset[] = [
  {
    id: 'status_quo',
    label: 'Status Quo',
    description: 'Current federal baseline — no new policies',
    config: DEFAULT_POLICY_CONFIG,
  },
  {
    id: 'progressive_ubi',
    label: 'Progressive UBI',
    description: '$1,000/month UBI + enhanced unemployment insurance',
    config: {
      ...DEFAULT_POLICY_CONFIG,
      ubi: {
        enabled: true,
        monthlyAmount: { keyframes: [{ year: 2025, value: 1000 }] },          // Source: Yang 2020 Freedom Dividend
        ageThreshold: 18,
        phaseOut: {
          enabled: true,
          incomeThreshold: 75_000,    // Source: median household income ~$75k
          phaseOutRate: 0.2,
        },
        indexedToInflation: true,
        indexedToProductivity: false,
        mode: 'manual',
        indexedBaseAmount: 1000,
        indexedStartYear: 2032,
        productivityIndexRate: 1.0,
      },
      enhancedUI: {
        enabled: true,
        replacementRate: { keyframes: [{ year: 2025, value: 0.70 }] },        // Source: EU average ~60-70%
        durationWeeks: 52,            // Source: extended UI during recessions
        retrainingBonus: 5_000,
        stateOverrides: {},
      },
    },
  },
  {
    id: 'asset_democracy',
    label: 'Asset Democracy',
    description: 'Sovereign wealth fund + universal equity stakes',
    config: {
      ...DEFAULT_POLICY_CONFIG,
      sovereignWealthFund: {
        enabled: true,
        initialFundSize: 500,         // $500B — Source: comparable to Alaska PF ($80B) scaled nationally
        annualContribution: { keyframes: [{ year: 2025, value: 100 }] },      // $100B/yr — Source: federal budget feasibility (~0.4% GDP)
        annualReturnRate: 0.07,       // Source: S&P 500 long-term real average (Shiller)
        distributionRate: 0.04,       // Source: standard endowment spending rule (Yale model)
        distribution: 'universal',
        // Equity stake fields (Phase 5g SWF consolidation)
        ownershipFraction: { keyframes: [{ year: 2025, value: 0.10 }] },      // 10% public ownership of AI economy
        totalAICompanyProfits: 500,   // $500B/yr — Source: FAANG+ combined profits 2024
        profitGrowthRate: 0.15,       // Source: tech sector profit growth trend
        distributionMethod: 'equal',
      },
    },
  },
  {
    id: 'nordic_model',
    label: 'Nordic Model',
    description: 'High transfers + wage subsidies + strong retraining',
    config: {
      ...DEFAULT_POLICY_CONFIG,
      wageSubsidy: {
        enabled: true,
        subsidyPercentage: { keyframes: [{ year: 2025, value: 0.15 }] },      // 15% of wage — Source: German Kurzarbeit model
        maxSubsidyPerWorker: 15_000,  // $15k annual cap
        phaseOutThreshold: 80_000,    // Phase out above $80k income
      },
      enhancedUI: {
        enabled: true,
        replacementRate: { keyframes: [{ year: 2025, value: 0.80 }] },        // Source: Denmark flexicurity — up to 90%
        durationWeeks: 78,            // Source: Danish UI duration ~2 years
        retrainingBonus: 10_000,
        stateOverrides: {},
      },
      retraining: {
        enabled: true,
        stipendMonthly: { keyframes: [{ year: 2025, value: 3_000 }] },        // Source: Nordic active labor market programs
        durationMonths: 12,
        effectivenessRate: 0.50,      // Source: Nordic retraining outcomes ~50%
        participationRate: 0.50,      // Source: Nordic active labor market participation ~50%
        targetClusters: [],
      },
    },
  },
  {
    id: 'full_package',
    label: 'Full Package',
    description: 'All three income channels maximized',
    config: {
      minimumWage: {
        enabled: true,
        federalMinimum: { keyframes: [{ year: 2025, value: 20.00 }] },        // $20/hr — Source: Fight for $15 adjusted for inflation
        stateOverrides: {},
        indexedToInflation: true,
        indexedToProductivity: true,
      },
      wageSubsidy: {
        enabled: true,
        subsidyPercentage: { keyframes: [{ year: 2025, value: 0.20 }] },      // 20% of wage
        maxSubsidyPerWorker: 20_000,
        phaseOutThreshold: 90_000,
      },
      workWeekReduction: {
        enabled: true,
        standardHours: { keyframes: [{ year: 2025, value: 32 }] },            // 4-day work week
        overtimeMultiplier: 1.5,
      },
      sovereignWealthFund: {
        enabled: true,
        initialFundSize: 1_000,       // $1T — aggressive initial capitalization
        annualContribution: { keyframes: [{ year: 2025, value: 200 }] },      // $200B/yr
        annualReturnRate: 0.07,
        distributionRate: 0.04,
        distribution: 'universal',
        // Equity stake fields (Phase 5g SWF consolidation)
        ownershipFraction: { keyframes: [{ year: 2025, value: 0.15 }] },      // 15% public ownership
        totalAICompanyProfits: 500,
        profitGrowthRate: 0.15,
        distributionMethod: 'equal',
      },
      profitSharing: {
        enabled: true,
        mandatorySharePercentage: { keyframes: [{ year: 2025, value: 0.10 }] }, // 10% mandatory profit sharing
        companyRevenueThreshold: 1_000_000_000,
        distributionScope: 'national',
      },
      ubi: {
        enabled: true,
        monthlyAmount: { keyframes: [{ year: 2025, value: 1_500 }] },         // $1,500/month
        ageThreshold: 18,
        phaseOut: {
          enabled: true,
          incomeThreshold: 100_000,
          phaseOutRate: 0.15,
        },
        indexedToInflation: true,
        indexedToProductivity: true,
        mode: 'manual',
        indexedBaseAmount: 1000,
        indexedStartYear: 2032,
        productivityIndexRate: 1.0,
      },
      enhancedUI: {
        enabled: true,
        replacementRate: { keyframes: [{ year: 2025, value: 0.80 }] },
        durationWeeks: 104,           // 2 years
        retrainingBonus: 10_000,
        stateOverrides: {},
      },
      retraining: {
        enabled: true,
        stipendMonthly: { keyframes: [{ year: 2025, value: 4_000 }] },
        durationMonths: 18,
        effectivenessRate: 0.50,
        participationRate: 0.50,
        targetClusters: [],
      },
    },
  },
];

// ============================================================
// 40. Phase 10.A — Alpha Drivers, Augmentation, Scarcity, Inference Curve
// ============================================================

/**
 * Default automation share (α) for cognitive clusters.
 * α = fraction of AI adoption that takes the replacement path (vs augmentation path).
 * 0.5 is a neutral seed for cognitive work; embodied clusters override via EMBODIED_CLUSTER_ALPHA_DEFAULTS.
 * User-adjustable per-cluster via config.clusterAutomationShareOverrides.
 */
export const DEFAULT_COGNITIVE_ALPHA = 0.5;

/**
 * Embodied-cluster α defaults.
 * Rationale: embodied work tends toward binary outcomes (robot does it OR human does it).
 * Factors considered: binary-task outcome (+), 24/7 economics (+), dexterity requirement (−),
 * regulatory human-in-loop (−). Values are editorial — AEI data integration in a later phase.
 */
export const EMBODIED_CLUSTER_ALPHA_DEFAULTS: Record<string, number> = {
  transport_trucking: 0.85,
  transport_delivery: 0.60,
  transport_taxi: 0.55,
  transport_warehouse: 0.80,
  mfg_assembly: 0.80,
  mfg_machinists: 0.55,
  mfg_qc: 0.70,
  construction_electricians: 0.30,
  construction_plumbers: 0.30,
  construction_general: 0.45,
  construction_hvac: 0.35,
  food_fast_food: 0.65,
  food_restaurant: 0.35,
  food_industrial: 0.85,
  health_physicians: 0.20,
  health_nurses: 0.25,
  health_technicians: 0.50,
  health_home_health: 0.20,
  retail_cashiers: 0.75,
  ag_farm_labor: 0.80,
};

/**
 * Default weights and activation parameters for the 5 α drivers (Phase 10.A Part 6).
 * Sum of positive weights intentionally < 1; slack weight is subtracted. Drivers compose:
 *   Δα = capW × capSigmoid + trustW × trustRamp + compW × peerGap + mW × marginGap − sW × excessUE
 * Full range is clamped to [0,1] in computeEffectiveAlpha.
 */
export const DEFAULT_ALPHA_DRIVER_PARAMS: AlphaDriverParams = {
  capabilityWeight: 0.20,
  trustWeight: 0.15,
  competitiveWeight: 0.25,
  marginWeight: 0.15,
  slackWeight: 0.10,
  capabilityActivationThreshold: 0.60,
  trustHalfLifeYears: 5,
};

/**
 * Default floored decay curve for the cost-per-token of AI work.
 * Shape: floor + (1 - floor) × exp(-k × t^decayExponent)
 * t=1 → ~0.61, t=5 → ~0.18, t=10 → ~0.053, t=25 → ~0.006 (~167× reduction over 25 years).
 * Combined with `DEFAULT_TOKEN_USAGE_GROWTH` to produce total inference cost.
 */
export const DEFAULT_TOKEN_COST_CURVE: TokenCostCurveParams = {
  floor: 0.001,
  k: 0.50,
  decayExponent: 0.7,
};

/**
 * Tokens-per-task multiplier at the simulation start year (2025).
 *
 * Tokens/task is *defined relative to the 2025 reference baseline*, so the start
 * year is 1× by definition. This is the default for the start year only; from the
 * year after the start (2026) onward the default jumps to
 * DEFAULT_TOKEN_USAGE_MULTIPLIER and holds flat. Both are user-overridable per year
 * (sticky-forward) through the Year Parameters UI.
 */
export const START_YEAR_TOKEN_USAGE_MULTIPLIER = 1.0;

/**
 * Representative tokens-per-task multiplier (spike-onset value).
 *
 * Used as the bare fallback for computeInferenceCostFactor() when no per-year value is
 * supplied, and as the value applied when a scenario sets an explicit *flat*
 * AICostParams.tokenUsageMultiplier. The default simulation does NOT use a flat value —
 * it follows the spike-and-recover trajectory in DEFAULT_TOKEN_USAGE_SCHEDULE.
 */
export const DEFAULT_TOKEN_USAGE_MULTIPLIER = 20.0;

/**
 * Default tokens-per-task trajectory vs. the 2025 reference baseline, indexed by offset
 * from the simulation start year (offset 0 = start year, 1× by definition). Years past
 * the end of the array hold the last entry.
 *
 *   offset 0 → 2025 =  1×   reference baseline, by definition
 *   offset 1 → 2026 = 20×   ┐ spike: reasoning/agentic models explode tokens-per-task
 *   offset 2 → 2027 = 25×   ┘ (chain-of-thought, tool loops, deeper context) — peak
 *   offset 3 → 2028 = 15×   ┐ recovery: algorithmic breakthroughs (distillation,
 *   offset 4 → 2029 =  5×   │ sparsity, efficient reasoning) drive tokens-per-task back
 *   offset 5 → 2030 =  1×   ┘ to the reference baseline, holding flat thereafter (2031+).
 *
 * Encodes the default narrative: a near-term token-usage spike that is solved through
 * efficiency gains. Every entry is user-overridable per year (sticky-forward) via the
 * Year Parameters UI. A scenario can instead set a flat AICostParams.tokenUsageMultiplier
 * to bypass this schedule entirely.
 */
export const DEFAULT_TOKEN_USAGE_SCHEDULE: readonly number[] = [1, 20, 25, 15, 5, 1];

/** Default AICostParams — initializes config.aiCostParams so the UI controls have a concrete
 *  object to write into rather than falling through `undefined` to per-call fallbacks.
 *  tokenUsageMultiplier is intentionally omitted: leaving it unset selects the default
 *  spike-and-recover DEFAULT_TOKEN_USAGE_SCHEDULE. Set it explicitly only to force a flat
 *  post-2025 trajectory. */
export const DEFAULT_AI_COST_PARAMS = {
  inferenceAnnualChange: DEFAULT_INFERENCE_ANNUAL_CHANGE,
  manufacturingAnnualChange: DEFAULT_MANUFACTURING_ANNUAL_CHANGE,
  energyAnnualChange: DEFAULT_ENERGY_ANNUAL_CHANGE,
  tokenCostCurve: { ...DEFAULT_TOKEN_COST_CURVE },
};

/** Default steepness of the augmentation adoption S-curve (Phase 10.A Part 7).
 *  Logistic with yearsSinceAugTrigger: rate = 1 / (1 + exp(-steepness × yearsSince)).
 *  At 0.8, takes ~5 years post-viability to reach ≈98% augmentation adoption. */
export const DEFAULT_AUGMENTATION_ADOPTION_STEEPNESS = 0.8;

/** Default Phillips Mechanism 2 scarcity-premium intensity (Phase 10.A Part 12).
 *  premium = aiShare × scarcityIntensity × aggregateReplacementDifficultyWagePremium. */
export const DEFAULT_SCARCITY_INTENSITY = 0.4;

/** Baseline US corporate profits / GDP used as the α margin-driver anchor.
 *  Source: FRED corporate profits after tax / GDP — typical 2015-2024 range 0.10-0.14. */
// Stage 7: re-pointed to the year-0 RESIDUAL profit share (= the BEA actual via govData) so the
// α margin-compression driver reads genuine compression, not the old 0.12-vs-endogenous gap.
export const ALPHA_BASELINE_CORPORATE_MARGIN = govData.baselineProfitGDPRatio;

/** Default AI-replacement productivity multiplier (Phase 10.A Part 8 productivity formula).
 *  effectiveProductivity = 1 + weightedCapability × betterScore × replacementMultiplier × (1 + cheaperScore).
 *  At 2.0: capability 0.7, betterScore 0.5, cheaperScore 0.4 → 1.0 + 0.7×0.5×2.0×1.4 = 1.98 (~2× human). */
export const DEFAULT_REPLACEMENT_MULTIPLIER = 2.0;

/**
 * DEPRECATED (Phase 10.A fix #2): global friction-year scaling constant removed.
 *
 * Friction is now expressed directly in years per role via role.aiReplacementFrictionYears.
 * Previously: frictionYears = role.aiReplacementDifficultyFriction [0,1] × this constant.
 * Now:        frictionYears = role.aiReplacementFrictionYears (direct, no scaling).
 *
 * Retained only as a reference scale factor for mechanical migration of legacy [0,1] values
 * (i.e. old_value × 5.0 = new_value_in_years), applied once during constants-table conversion.
 * Do NOT read this constant in new code.
 */
export const DEFAULT_MAX_ADOPTION_FRICTION_YEARS = 5.0;

/**
 * Per-role defaults for aiReplacementFrictionYears (Phase 10.A fix #2).
 *
 * Years of regulatory/cultural/licensure friction delay before AI replacement can begin, after
 * BFCS thresholds are met. Captures non-BFCS forces: legal approval, licensure updates, cultural
 * acceptance, union negotiations. Unit: years ≥ 0, no upper bound.
 *
 * Values below are the prior [0,1] defaults mechanically × 5.0 (the old DEFAULT_MAX_ADOPTION_FRICTION_YEARS
 * scaling factor) to preserve equivalent adoption timing under prior defaults. Not re-judged.
 * Example conversions: surgeon 0.90 → 4.50 years; tech_swe junior_mid 0.10 → 0.50 years;
 * legal_attorneys partner 0.75 → 3.75 years.
 *
 * These are editorial ATLAS-authored defaults awaiting empirical calibration (AEI in a later phase).
 * Users override per role via config.roleReplacementFrictionYearsOverrides.
 */
export const ROLE_AI_REPLACEMENT_FRICTION_YEARS_DEFAULTS: Record<string, Record<string, number>> = {
  // Technology — low regulatory friction
  tech_swe: { junior_mid: 0.50, senior: 0.75, staff_principal: 1.25 },
  tech_data_ml: { junior_analyst: 0.50, ml_engineer: 0.75, research_scientist: 1.25 },
  tech_it_support: { tier1_support: 0.50, sysadmin: 1.00, devops_sre: 1.25 },
  tech_qa: { manual_qa: 0.25, automation_qa: 0.50 },
  // Finance — licensing, fiduciary duty
  finance_trading: { execution_trader: 1.00, quant_analyst: 1.25, portfolio_manager: 2.50 },
  finance_banking: { teller: 0.75, junior_analyst: 1.00, senior_banker: 2.25 },
  finance_accounting: { bookkeeper: 0.75, accountant: 1.50, cpa_audit: 3.00 },
  finance_insurance: { claims_processor: 1.00, underwriter: 2.00 },
  // Healthcare — heaviest regulatory friction
  health_physicians: { primary_care: 3.75, specialist: 4.00, surgeon: 4.50 },
  health_nurses: { lpn: 3.00, rn: 3.50, nurse_practitioner: 4.00 },
  health_technicians: { lab_technician: 2.00, imaging_technician: 2.25 },
  health_home_health: { home_health_aide: 3.25, personal_care_aide: 3.50 },
  health_admin: { medical_coder: 1.50, admin_staff: 1.00, hospital_admin: 2.25 },
  // Education — licensure and institutional inertia
  edu_teachers: { k12_teacher: 3.50, professor: 2.75 },
  edu_admin: { school_admin: 2.00, district_admin: 2.00 },
  edu_support: { teaching_assistant: 1.50, librarian: 1.50 },
  // Legal
  legal_attorneys: { junior_associate: 2.50, senior_attorney: 3.125, partner: 3.75 },
  legal_paralegals: { legal_secretary: 0.75, paralegal: 1.50 },
  // Transportation
  transport_trucking: { long_haul: 1.75, short_haul: 2.00 },
  transport_delivery: { delivery_driver: 1.50, courier: 1.25 },
  transport_taxi: { driver: 2.00 },
  transport_warehouse: { warehouse_worker: 0.50, equipment_operator: 1.25, logistics_coordinator: 1.00 },
  // Manufacturing
  mfg_assembly: { line_worker: 0.50, skilled_assembler: 1.00 },
  mfg_machinists: { cnc_operator: 1.00, master_machinist: 2.00 },
  mfg_qc: { inspector: 1.00 },
  // Construction — state licensure, code inspection
  construction_electricians: { apprentice: 1.75, journeyman: 2.50, master: 3.25 },
  construction_plumbers: { apprentice: 1.75, journeyman: 2.50 },
  construction_general: { laborer: 0.75, carpenter: 1.75, heavy_equipment: 1.50 },
  construction_hvac: { technician: 2.00, senior_technician: 2.75 },
  // Retail
  retail_cashiers: { cashier: 0.50, sales_associate: 0.75 },
  retail_management: { store_manager: 1.75, district_manager: 2.00 },
  retail_ecommerce: { fulfillment_worker: 0.50, ecommerce_coordinator: 0.75 },
  // Food Service
  food_fast_food: { counter: 0.75, line_cook: 1.00 },
  food_restaurant: { server: 2.00, chef: 1.75, head_chef: 2.25 },
  food_industrial: { food_processing: 1.00 },
  // Creative
  creative_design: { junior_designer: 0.75, senior_designer: 1.25, art_director: 1.75 },
  creative_writing: { content_writer: 0.75, journalist: 2.00, senior_editor: 1.375 },
  creative_marketing: { marketing_coordinator: 0.75, marketing_manager: 1.25, cmo_director: 1.75 },
  // Professional Services
  prof_consulting: { junior_consultant: 1.25, senior_consultant: 2.25, partner_director: 2.75 },
  prof_real_estate: { agent: 2.00, broker: 2.50 },
  // Government — civil service protections
  gov_federal: { clerical_admin: 3.25, analyst: 3.25, senior_management: 3.25 },
  gov_state_local: { clerical_admin: 3.00, analyst: 3.00, senior_management: 3.00 },
  // Agriculture
  ag_farm_labor: { farmworker: 1.00, skilled_ag: 1.00 },
  // Science
  sci_lab_research: { lab_technician: 1.50, research_scientist: 1.50, principal_investigator: 1.50 },
  sci_engineering: { junior_engineer: 1.00, senior_engineer: 1.75, principal_engineer: 2.50 },
  // Creative / Media (Phase 10.A hand-authored)
  creative_media: { production_assistant: 0.50, editor_producer: 1.25 },
  // Agriculture equipment
  ag_equipment: { operator: 1.00 },
  // Government — postal
  gov_postal: { mail_carrier: 1.75, sorting_processing: 1.25 },
  // Professional — HR and admin
  prof_hr: { hr_coordinator: 1.00, hr_manager: 1.75 },
  prof_admin: { receptionist: 0.75, admin_assistant: 1.00, executive_assistant: 1.50 },
  // Other
  other_uncategorized: { general_worker: 1.25, specialized_worker: 1.25 },
};

/**
 * Per-role defaults for aiReplacementDifficultyWagePremium (last-mile automation resistance).
 * Higher = more remaining workers at full automation and higher scarcity premium.
 * Factors: care element (+), relational trust (+), unstructured judgment (+),
 * binary physical outcome (−), functional output regardless of source (−).
 *
 * Editorial defaults; see DOCSTRING on FRICTION_DEFAULTS for cluster-ID rename map and the 6-cluster deferral.
 */
export const ROLE_AI_REPLACEMENT_DIFFICULTY_WAGE_PREMIUM_DEFAULTS: Record<string, Record<string, number>> = {
  tech_swe: { junior_mid: 0.20, senior: 0.45, staff_principal: 0.60 },
  tech_data_ml: { junior_analyst: 0.20, ml_engineer: 0.40, research_scientist: 0.60 },
  tech_it_support: { tier1_support: 0.20, sysadmin: 0.35, devops_sre: 0.45 },
  tech_qa: { manual_qa: 0.15, automation_qa: 0.25 },
  finance_trading: { execution_trader: 0.25, quant_analyst: 0.45, portfolio_manager: 0.65 },
  finance_banking: { teller: 0.20, junior_analyst: 0.35, senior_banker: 0.60 },
  finance_accounting: { bookkeeper: 0.20, accountant: 0.40, cpa_audit: 0.55 },
  finance_insurance: { claims_processor: 0.25, underwriter: 0.45 },
  // Healthcare — highest residual humanness
  health_physicians: { primary_care: 0.80, specialist: 0.85, surgeon: 0.90 },
  health_nurses: { lpn: 0.65, rn: 0.75, nurse_practitioner: 0.80 },
  health_technicians: { lab_technician: 0.35, imaging_technician: 0.40 },
  health_home_health: { home_health_aide: 0.80, personal_care_aide: 0.80 },
  health_admin: { medical_coder: 0.25, admin_staff: 0.20, hospital_admin: 0.50 },
  edu_teachers: { k12_teacher: 0.75, professor: 0.60 },
  edu_admin: { school_admin: 0.40, district_admin: 0.40 },
  edu_support: { teaching_assistant: 0.30, librarian: 0.30 },
  legal_attorneys: { junior_associate: 0.55, senior_attorney: 0.65, partner: 0.75 },
  legal_paralegals: { legal_secretary: 0.25, paralegal: 0.40 },
  // Transportation — low residual (binary outcomes)
  transport_trucking: { long_haul: 0.15, short_haul: 0.20 },
  transport_delivery: { delivery_driver: 0.20, courier: 0.15 },
  transport_taxi: { driver: 0.25 },
  transport_warehouse: { warehouse_worker: 0.15, equipment_operator: 0.30, logistics_coordinator: 0.30 },
  mfg_assembly: { line_worker: 0.15, skilled_assembler: 0.25 },
  mfg_machinists: { cnc_operator: 0.20, master_machinist: 0.55 },
  mfg_qc: { inspector: 0.25 },
  // Construction — unstructured environments create residual
  construction_electricians: { apprentice: 0.30, journeyman: 0.45, master: 0.60 },
  construction_plumbers: { apprentice: 0.30, journeyman: 0.50 },
  construction_general: { laborer: 0.20, carpenter: 0.45, heavy_equipment: 0.30 },
  construction_hvac: { technician: 0.40, senior_technician: 0.55 },
  retail_cashiers: { cashier: 0.10, sales_associate: 0.20 },
  retail_management: { store_manager: 0.40, district_manager: 0.50 },
  retail_ecommerce: { fulfillment_worker: 0.10, ecommerce_coordinator: 0.20 },
  food_fast_food: { counter: 0.20, line_cook: 0.25 },
  food_restaurant: { server: 0.55, chef: 0.50, head_chef: 0.65 },
  food_industrial: { food_processing: 0.15 },
  creative_design: { junior_designer: 0.25, senior_designer: 0.50, art_director: 0.65 },
  creative_writing: { content_writer: 0.25, journalist: 0.65, senior_editor: 0.45 },
  creative_marketing: { marketing_coordinator: 0.20, marketing_manager: 0.35, cmo_director: 0.50 },
  prof_consulting: { junior_consultant: 0.30, senior_consultant: 0.55, partner_director: 0.70 },
  prof_real_estate: { agent: 0.45, broker: 0.55 },
  gov_federal: { clerical_admin: 0.55, analyst: 0.55, senior_management: 0.55 },
  gov_state_local: { clerical_admin: 0.50, analyst: 0.50, senior_management: 0.50 },
  ag_farm_labor: { farmworker: 0.20, skilled_ag: 0.20 },
  sci_lab_research: { lab_technician: 0.55, research_scientist: 0.55, principal_investigator: 0.55 },
  sci_engineering: { junior_engineer: 0.30, senior_engineer: 0.55, principal_engineer: 0.70 },
  creative_media: { production_assistant: 0.20, editor_producer: 0.55 },
  ag_equipment: { operator: 0.25 },
  gov_postal: { mail_carrier: 0.30, sorting_processing: 0.15 },
  prof_hr: { hr_coordinator: 0.30, hr_manager: 0.55 },
  prof_admin: { receptionist: 0.25, admin_assistant: 0.30, executive_assistant: 0.55 },
  other_uncategorized: { general_worker: 0.30, specialized_worker: 0.30 },
};

/** Global fallback when a cluster/role is missing from ROLE_AI_REPLACEMENT_FRICTION_YEARS_DEFAULTS. Unit: years. */
export const FALLBACK_REPLACEMENT_FRICTION_YEARS = 1.25;

/** Global fallback when a cluster/role is missing from ROLE_AI_REPLACEMENT_DIFFICULTY_WAGE_PREMIUM_DEFAULTS. */
export const FALLBACK_REPLACEMENT_DIFFICULTY_WAGE_PREMIUM = 0.30;
