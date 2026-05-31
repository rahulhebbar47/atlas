/**
 * ATLAS Phase 8b: Per-Year Parameter Storage with Profile-Aware Resolution
 *
 * Three-layer parameter resolution:
 *   baseline: From SimulationConfig (user's slider values)
 *   autopilot: Computed by endogenous rules based on FiscalResponseProfile
 *   userOverride: Explicitly set by user for a specific year (sticky forward)
 *
 * Resolution: effective = userOverride ?? autopilot ?? baseline
 *
 * All types are PURE DATA — no computation logic here.
 */

import type { MacroOutput, FiscalMonetaryOutput, CapabilityVectorId, SupplyChainInputs, SupplyChainResilience, AdoptionState } from '@/types';

// ============================================================
// Parameter Value & Provenance
// ============================================================

/**
 * A single parameter value with full provenance tracking.
 *
 * Three layers:
 *   baseline: The config-level default (user's slider value or constant)
 *   autopilot: Computed by endogenous rules (fiscal consolidation, COLA dampening)
 *   userOverride: Explicitly set by user for this year (sticky forward from set year)
 *
 * Resolution: effective = userOverride ?? autopilot (when differs from baseline) ?? baseline
 */
export interface ParameterValue {
  /** Value from SimulationConfig (the starting-point, slider-driven value). */
  baseline: number;
  /** Value computed by autopilot (profile-driven endogenous rules). */
  autopilot: number;
  /** User-set override for this year, if any. Sticky: applies to this year and forward. */
  userOverride?: number;
  /** The resolved value actually used in computation. */
  effective: number;
  /** Which layer determined the effective value. */
  source: 'baseline' | 'autopilot' | 'override';
  /** Human-readable explanation for why autopilot adjusted this parameter. */
  explanation?: string;
}

// ============================================================
// Year Parameters — All Tracked Parameters for One Year
// ============================================================

/**
 * All tracked parameters for a single simulation year.
 *
 * 23 parameters across 6 categories:
 * - Fiscal consolidation (5)
 * - Effective tax rates (4)
 * - Monetary (2)
 * - Federal Reserve reaction function (3) — Phase 8 Fix 4
 * - Policy programs (6)
 * - Technology (3)
 */
export interface YearParameters {
  year: number;
  /** Which FiscalResponseProfile preset is active. */
  profileName: string;

  // === Fiscal consolidation outputs (autopilot-driven) ===

  /** Multiplier applied to discretionary government spending. [0.5, 1.0]. */
  fiscalDiscretionaryMultiplier: ParameterValue;
  /** Multiplier applied to mandatory (obligation) government spending. [0.8, 1.0]. */
  fiscalObligationMultiplier: ParameterValue;
  /** Multiplier applied to effective tax rates. [1.0, 1.3]. */
  fiscalRevenueMultiplier: ParameterValue;
  /** COLA dampening factor applied to transfer income growth. [0, 1.0]. */
  effectiveColaDampeningFactor: ParameterValue;
  /** How strongly fiscal consolidation is engaged. [0, 1]. */
  consolidationIntensity: ParameterValue;

  // === Effective tax rates (baseline × revenue multiplier when consolidation active) ===

  /** Federal income tax rate (effective, after revenue multiplier). */
  effectiveIncomeTaxRate: ParameterValue;
  /** Federal payroll tax rate (effective, after revenue multiplier). */
  effectivePayrollTaxRate: ParameterValue;
  /** Corporate income tax rate (effective, after revenue multiplier). */
  effectiveCorporateTaxRate: ParameterValue;
  /** Capital gains tax rate (effective, after revenue multiplier). */
  effectiveCapitalGainsTaxRate: ParameterValue;

  // === Monetary parameters (from profile, overridable) ===

  /** Fraction of deficit monetized during QE. */
  qeMonetizationRate: ParameterValue;
  /** Cap on monetization under financial stress. */
  maxFinancialRepressionRate: ParameterValue;

  // === Federal Reserve reaction function (Phase 8 Fix 4) ===

  /** Taylor Rule inflation coefficient alpha. Higher = more hawkish. */
  taylorInflationCoeff: ParameterValue;
  /** Taylor Rule output gap coefficient beta_output. */
  taylorOutputGapCoeff: ParameterValue;
  /** Taylor Rule employment gap coefficient beta_employment. Higher = more responsive to unemployment. */
  taylorEmploymentGapCoeff: ParameterValue;

  // === Policy programs (override-only; autopilot doesn't change these) ===

  /** UBI program enabled (0=off, 1=on). */
  ubiEnabled: ParameterValue;
  /** UBI monthly amount per person (dollars). */
  ubiMonthlyAmount: ParameterValue;
  /** Wage subsidy program enabled (0=off, 1=on). */
  wageSubsidyEnabled: ParameterValue;
  /** Wage subsidy percentage (fraction 0-0.30). */
  wageSubsidyPercentage: ParameterValue;
  /** Sovereign Wealth Fund enabled (0=off, 1=on). */
  swfEnabled: ParameterValue;
  /** Mandatory equity sharing enabled (0=off, 1=on). */
  equityEnabled: ParameterValue;

  // === Technology (read-only per year — computed from S-curves) ===

  /** Generative AI capability score [0, 1]. */
  generativeCapabilityLevel: ParameterValue;
  /** Agentic AI capability score [0, 1]. */
  agenticCapabilityLevel: ParameterValue;
  /** Embodied AI capability score [0, 1]. */
  embodiedCapabilityLevel: ParameterValue;
  /** Tokens-per-task multiplier vs. 2025 baseline. Default spike-and-recover trajectory:
   *  2025=1×, 2026=20×, 2027=25×, 2028=15×, 2029=5×, 2030+=1×. Year-overridable
   *  (sticky-forward). Combined with the token cost curve to produce inference cost. */
  tokenUsageMultiplier: ParameterValue;

  // === Supply Chain (Phase 9) ===

  // Supply inputs (baseline-only, autopilot = baseline)
  /** Combined GPU/TPU/ASIC + HBM supply index. 0-200. */
  supplyChainAiChips: ParameterValue;
  /** Energy price index. 50-500. */
  supplyChainEnergyPrice: ParameterValue;
  /** Grid capacity for AI workloads. 0-200. */
  supplyChainEnergyCapacity: ParameterValue;
  /** Training datacenter build capacity. 0-200. */
  supplyChainTrainingDC: ParameterValue;
  /** Inference datacenter capacity. 0-200. */
  supplyChainInferenceDC: ParameterValue;
  /** Robotics hardware composite index. 0-200. */
  supplyChainRoboticsHW: ParameterValue;
  /** Algorithmic efficiency multiplier. 50-300. */
  supplyChainSoftwareEfficiency: ParameterValue;

  // Resilience (autopilot-computed, user-overridable)
  /** AI chips resilience [0, 0.85]. */
  resilienceAiChips: ParameterValue;
  /** Energy resilience [0, 0.95]. */
  resilienceEnergy: ParameterValue;
  /** Training DC resilience [0, 0.95]. */
  resilienceTrainingDC: ParameterValue;
  /** Inference DC resilience [0, 0.95]. */
  resilienceInferenceDC: ParameterValue;
  /** Robotics hardware resilience [0, 0.85]. */
  resilienceRoboticsHW: ParameterValue;

  // Training dynamics (autopilot defaults, user-overridable)
  /** AI chips training cost tech decline rate. */
  trainingChipsTechDecline: ParameterValue;
  /** Energy training cost tech decline rate. */
  trainingEnergyTechDecline: ParameterValue;
  /** Datacenter training cost tech decline rate. */
  trainingDCTechDecline: ParameterValue;
  /** AI chips training scale pressure. */
  trainingChipsScalePressure: ParameterValue;
  /** Energy training scale pressure. */
  trainingEnergyScalePressure: ParameterValue;
  /** Datacenter training scale pressure. */
  trainingDCScalePressure: ParameterValue;
  /** Multiplier on DC scale pressure from permitting/regulatory environment. */
  regulatoryFriction: ParameterValue;

  // Economics (autopilot trajectory, user-overridable)
  /** Inference cost pass-through rate [0, 1]. */
  costPassThroughRate: ParameterValue;
  /** Deployer cost pass-through to consumers [0, 1]. */
  consumerPassThroughRate: ParameterValue;
  /** Cost vs procurement blend weight [0, 1]. 1=pure cost, 0=pure procurement. */
  costVsProcurementBlend: ParameterValue;

  // Read-only diagnostics (computed, not overridable — use readOnly() helper)
  /** Dynamic training composition: AI chips share. */
  dynamicTrainingCompChips: ParameterValue;
  /** Dynamic training composition: energy share. */
  dynamicTrainingCompEnergy: ParameterValue;
  /** Dynamic training composition: datacenter share. */
  dynamicTrainingCompDC: ParameterValue;
}

// ============================================================
// User Overrides
// ============================================================

/**
 * Sparse map of user per-year overrides.
 *
 * Key format: "paramName:year" e.g. "effectiveIncomeTaxRate:2035"
 * Value: the user-set value
 *
 * Overrides are STICKY: if set in year 2035, applies to 2035-2050
 * unless another override is set for a later year.
 */
export type UserOverrideMap = Map<string, number>;

// ============================================================
// Year Snapshot — Complete State for Restart-from-Year
// ============================================================

/**
 * Complete simulation state at end of a given year.
 *
 * Captures every variable that's carried across the year loop boundary
 * in runSimulation(). This is sufficient to restart simulation from
 * (year + 1) without rerunning 2025-year.
 *
 * CRITICAL: This must capture ALL inter-year state. If a variable
 * persists across loop iterations in simulation.ts, it must be here.
 * The restart test verifies this by comparing full CSV output.
 */
export interface YearSnapshot {
  year: number;

  // === Core macro state ===
  /** Full macro output from this year (used as previousMacro for next year). */
  previousMacro: MacroOutput;
  /** Full fiscal-monetary output from this year. */
  previousFiscalMonetary: FiscalMonetaryOutput | null;

  // === Monetary state ===
  /** Money supply at end of year. */
  previousMoneySupply: number;
  /** Transfer inflation from this year (one-year lag for next year's price computation). */
  previousTransferInflation: number;

  // === Fiscal state ===
  /** Federal debt stock at end of year. */
  previousDebtStock: number;
  /** Blended interest rate on outstanding debt. */
  previousWeightedAvgDebtRate: number;
  /** Full history of debt/GDP ratios for consolidation lag lookup. */
  debtGDPHistory: number[];

  // === Policy state ===
  /** Sovereign Wealth Fund size at end of year. */
  previousFundSize: number;

  // === Adoption state ===
  /** Per-cluster-role first adoption trigger year (persists once set, never unset). */
  triggerYears: Record<string, Record<string, number | null>>;

  // === Equity market state ===
  /** Aggregate market capitalization at end of year. */
  previousMarketCap: number;
  /** Peak capability change rate seen so far (for growth momentum). */
  historicalMaxCapabilityChange: number;
  /** Corporate profits from this year (for equity valuation lag). */
  prevCorporateProfitsForEquity: number;
  /** Corporate profits from year before this (for equity valuation 2-year lag). */
  prevPrevCorporateProfitsForEquity: number;
  /** Capability score vector from this year [generative, agentic, embodied]. */
  previousCapabilityScores: number[] | null;

  // === Baseline captures (set once at year 0, then frozen) ===
  /** Consumer Welfare Index at year 0 — target for required ownership/transfer. */
  baselineCWI: number | null;
  /** Consumption at year 0 — for dynamic velocity denominator. */
  baselineConsumption: number | null;
  /** Real household income at year 0 — for consumer credit adequacy ratio. */
  baselineHouseholdIncome: number | null;
  /** After-tax corporate profits at year 0 — for business credit conditions. */
  baselineCorporateProfits: number | null;
  /** CWI at year 0 — for credit CWI ratio. */
  creditBaselineCWI: number | null;

  // === AI production tracking ===
  /** AI GDP contribution at simulation start year (for growth rate computation). */
  startYearAiGDP: number;

  // === Housing & displacement history ===
  /** Dynamic homeownership rates by quintile [Q1..Q5]. */
  dynamicHomeownership: number[];
  /** Per-cluster displacement history (for displacement smoothing). */
  displacementHistory: Array<Map<string, number>>;

  // === Milestone tracking ===
  /** Year depression was first detected (or null if not yet). */
  depressionOnsetYear: number | null;
  /** Year monetary collapse occurred (or null if not yet). */
  monetaryCollapseYear: number | null;

  // === History arrays (accumulating) ===
  /** Rolling window of nominal GDP values for demand feedback. */
  nominalGDPHistory: number[];

  // === Supply Chain State (Phase 9) ===
  /** [previous, twoPrior] supply inputs for propagation lag computation. */
  supplyChainShockHistory: [SupplyChainInputs, SupplyChainInputs];
  /** Cumulative capability delay per vector (monotonically increasing). */
  cumulativeCapabilityDelay: Record<CapabilityVectorId, number>;
  /** Stateful adoption rates and freeze timestamps per cluster-role. */
  adoptionState: AdoptionState;
  /** Current effective resilience values. */
  supplyChainResilience: SupplyChainResilience;
  /** How "behind" the inference chip cascade is [0, 1]. */
  cascadeBacklog: number;
  /** Historical chip supply values for cascade computation. */
  chipSupplyHistory: number[];
}

// ============================================================
// Autopilot Result
// ============================================================

/**
 * Result of the autopilot computation for a single year.
 *
 * Contains all values the autopilot produces, plus human-readable
 * explanations for any adjustments made.
 *
 * PURE DATA — computed by computeAutopilotParameters() in autopilot.ts.
 */
export interface AutopilotResult {
  // Fiscal consolidation
  discretionaryMultiplier: number;
  obligationMultiplier: number;
  revenueMultiplier: number;
  consolidationIntensity: number;
  consolidationExplanation?: string;

  // COLA dampening
  colaDampeningFactor: number;
  colaExplanation?: string;

  // Effective tax rates (baseline × revenue multiplier)
  effectiveIncomeTaxRate: number;
  effectivePayrollTaxRate: number;
  effectiveCorporateTaxRate: number;
  effectiveCapitalGainsTaxRate: number;

  // Monetary (pass-through from profile)
  qeMonetizationRate: number;
  maxFinancialRepressionRate: number;

  // Phase 8 Fix 4: Federal Reserve reaction function (pass-through from profile)
  taylorInflationCoeff: number;
  taylorOutputGapCoeff: number;
  taylorEmploymentGapCoeff: number;

  // Phase 9: Supply Chain autopilot values
  /** Time-evolved AI chips resilience. */
  scResilienceAiChips: number;
  /** Time-evolved energy resilience. */
  scResilienceEnergy: number;
  /** Time-evolved training DC resilience. */
  scResilienceTrainingDC: number;
  /** Time-evolved inference DC resilience. */
  scResilienceInferenceDC: number;
  /** Time-evolved robotics hardware resilience. */
  scResilienceRoboticsHW: number;
  /** Dynamic training composition: AI chips share. */
  scDynamicCompChips: number;
  /** Dynamic training composition: energy share. */
  scDynamicCompEnergy: number;
  /** Dynamic training composition: datacenter share. */
  scDynamicCompDC: number;
  /** Interpolated cost pass-through rate from trajectory. */
  scCostPassThroughRate: number;
}

// ============================================================
// Parameter Timeline Result
// ============================================================

/**
 * Complete parameter timeline for the full simulation.
 */
export interface ParameterTimelineResult {
  /** Per-year resolved parameters. */
  years: Map<number, YearParameters>;
  /** Active fiscal response profile name. */
  activeProfile: string;
  /** User overrides applied to this run. */
  overrides: UserOverrideMap;
}
