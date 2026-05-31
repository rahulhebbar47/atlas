/**
 * ATLAS Phase 8b: Three-Layer Parameter Resolution
 *
 * Resolves effective parameter values from three layers:
 *   baseline: From SimulationConfig (user's slider values)
 *   autopilot: Computed by endogenous rules (FiscalResponseProfile-driven)
 *   userOverride: Explicitly set by user for a specific year (sticky forward)
 *
 * Resolution: effective = userOverride ?? autopilot ?? baseline
 *
 * PURE FUNCTIONS — no side effects, no state mutation.
 */

import type {
  ParameterValue,
  YearParameters,
  UserOverrideMap,
  AutopilotResult,
} from '@/types/parameterTimeline';
import type { SimulationConfig } from '@/types';
import { interpolatePolicy } from '@/utils/policyInterpolation';
import {
  START_YEAR_TOKEN_USAGE_MULTIPLIER,
  DEFAULT_TOKEN_USAGE_SCHEDULE,
} from './constants';

// ============================================================
// Single Parameter Resolution
// ============================================================

/**
 * Resolve a single parameter value from three layers.
 *
 * User overrides are STICKY: if set in year 2035, applies to 2035-2050
 * unless another override is set for a later year.
 *
 * @param paramKey - The parameter name (e.g., "effectiveIncomeTaxRate")
 * @param year - The simulation year being resolved
 * @param baseline - The config-level default value
 * @param autopilot - The autopilot-computed value
 * @param overrides - The sparse user override map
 * @param explanation - Optional human-readable reason for autopilot adjustment
 * @returns Fully resolved ParameterValue with provenance
 */
export function resolveParameter(
  paramKey: string,
  year: number,
  baseline: number,
  autopilot: number,
  overrides: UserOverrideMap,
  explanation?: string,
): ParameterValue {
  // Find the most recent override at or before this year
  const effectiveOverride = findStickyOverride(paramKey, year, overrides);

  if (effectiveOverride !== undefined) {
    return {
      baseline,
      autopilot,
      userOverride: effectiveOverride,
      effective: effectiveOverride,
      source: 'override',
      explanation,
    };
  }

  if (Math.abs(autopilot - baseline) > 1e-10) {
    return {
      baseline,
      autopilot,
      effective: autopilot,
      source: 'autopilot',
      explanation,
    };
  }

  return {
    baseline,
    autopilot,
    effective: baseline,
    source: 'baseline',
  };
}

/**
 * Find the most recent user override at or before the given year.
 * Returns undefined if no override exists.
 */
function findStickyOverride(
  paramKey: string,
  year: number,
  overrides: UserOverrideMap,
): number | undefined {
  let effectiveOverride: number | undefined;
  let latestOverrideYear = -1;

  for (const [key, value] of overrides) {
    const colonIdx = key.lastIndexOf(':');
    if (colonIdx === -1) continue;
    const name = key.substring(0, colonIdx);
    const overrideYear = parseInt(key.substring(colonIdx + 1), 10);
    if (
      name === paramKey
      && !isNaN(overrideYear)
      && overrideYear <= year
      && overrideYear > latestOverrideYear
    ) {
      latestOverrideYear = overrideYear;
      effectiveOverride = value;
    }
  }

  return effectiveOverride;
}

// ============================================================
// Tokens-per-task default trajectory
// ============================================================

/**
 * Default tokens-per-task multiplier for a given year, before user overrides.
 *
 * Tokens/task is defined relative to the start-year (2025) baseline, so the start year
 * is 1× by definition. By default the trajectory follows DEFAULT_TOKEN_USAGE_SCHEDULE —
 * a spike-and-recover curve (1× → 20× → 25× → 15× → 5× → 1×, holding 1× thereafter) —
 * indexed by offset from the start year, with values past the end holding the last entry.
 *
 * If `flatOverride` is provided (a scenario-set AICostParams.tokenUsageMultiplier), the
 * schedule is bypassed: the start year stays at 1× and every later year takes the flat
 * value. Either way, the sticky-forward override mechanism lets a user pin any year's
 * value forward via the Year Parameters UI.
 *
 * @param year - The simulation year being resolved
 * @param startYear - The simulation start year (2025)
 * @param flatOverride - Optional flat multiplier for all post-start years (bypasses schedule)
 */
export function defaultTokenUsageMultiplier(
  year: number,
  startYear: number,
  flatOverride?: number,
): number {
  const offset = Math.max(0, year - startYear);
  if (flatOverride !== undefined) {
    return offset === 0 ? START_YEAR_TOKEN_USAGE_MULTIPLIER : flatOverride;
  }
  const sched = DEFAULT_TOKEN_USAGE_SCHEDULE;
  return sched[Math.min(offset, sched.length - 1)]!;
}

// ============================================================
// Full Year Resolution
// ============================================================

/**
 * Capability levels for the current year (computed from S-curves).
 */
export interface CapabilityLevels {
  generative: number;
  agentic: number;
  embodied: number;
}

/**
 * Resolve ALL tracked parameters for a given year.
 *
 * Combines autopilot computation results with user overrides and
 * config baseline values into a complete YearParameters record.
 *
 * @param year - The simulation year
 * @param config - Full simulation configuration (for baseline values)
 * @param autopilotResult - Autopilot-computed values for this year
 * @param overrides - User per-year overrides
 * @param profileName - Active fiscal response profile name
 * @param capabilityLevels - AI capability scores for this year
 * @returns Complete YearParameters with all 23 parameters resolved
 */
export function resolveAllParameters(
  year: number,
  config: SimulationConfig,
  autopilotResult: AutopilotResult,
  overrides: UserOverrideMap,
  profileName: string,
  capabilityLevels: CapabilityLevels,
): YearParameters {
  // Helper: resolve one param
  const r = (key: string, baseline: number, autopilot: number, explanation?: string) =>
    resolveParameter(key, year, baseline, autopilot, overrides, explanation);

  // Phase 9: Supply chain config extraction with defaults
  const scCfg = config.supplyChainConfig;
  const sc = {
    // Supply inputs
    aiChips: scCfg?.inputs.aiChips ?? 100,
    energyPrice: scCfg?.inputs.energyPrice ?? 100,
    energyCapacity: scCfg?.inputs.energyCapacity ?? 100,
    trainingDC: scCfg?.inputs.trainingDCCapacity ?? 100,
    inferenceDC: scCfg?.inputs.inferenceDCCapacity ?? 100,
    roboticsHW: scCfg?.inputs.roboticsHardware ?? 100,
    softwareEfficiency: scCfg?.inputs.softwareEfficiency ?? 100,
    // Resilience baselines
    resAiChips: scCfg?.resilience.aiChips ?? 0.05,
    resEnergy: scCfg?.resilience.energy ?? 0.85,
    resTrainingDC: scCfg?.resilience.trainingDC ?? 0.90,
    resInferenceDC: scCfg?.resilience.inferenceDC ?? 0.90,
    resRoboticsHW: scCfg?.resilience.roboticsHardware ?? 0.05,
    // Training dynamics
    chipsTechDecline: scCfg?.trainingDynamics.aiChips.techDeclineRate ?? -0.35,
    energyTechDecline: scCfg?.trainingDynamics.energy.techDeclineRate ?? -0.04,
    dcTechDecline: scCfg?.trainingDynamics.datacenter.techDeclineRate ?? -0.08,
    chipsScale: scCfg?.trainingDynamics.aiChips.scalePressure ?? 0.05,
    energyScale: scCfg?.trainingDynamics.energy.scalePressure ?? 0.15,
    dcScale: scCfg?.trainingDynamics.datacenter.scalePressure ?? 0.25,
    regFriction: scCfg?.regulatoryFriction ?? 1.0,
    // Economics
    costPassThrough: scCfg?.costPassThroughRate ?? 0,
    consumerPassThrough: scCfg?.consumerPassThroughRate ?? 0.50,
    costVsProcurementBlend: scCfg?.costVsProcurementBlend ?? 0.50,
  };
  const scAuto = autopilotResult;

  // Helper: read-only parameter (technology — not overridable via autopilot)
  const readOnly = (value: number): ParameterValue => ({
    baseline: value,
    autopilot: value,
    effective: value,
    source: 'baseline',
  });

  // Baseline tax rates from config
  const baselineIncome = config.taxConfig?.incomeTaxRate ?? 0;
  const baselinePayroll = config.taxConfig?.payrollTaxRate ?? 0;
  const baselineCorporate = config.taxConfig?.corporateTaxRate ?? 0;
  const baselineCapGains = config.taxConfig?.capitalGainsTaxRate ?? 0;

  // Policy program baselines — interpolate from keyframe schedules at this year
  const ubiMonthlyBaseline = config.policyConfig.ubi.enabled
    ? interpolatePolicy(config.policyConfig.ubi.monthlyAmount, year)
    : 0;
  const wageSubsidyPctBaseline = config.policyConfig.wageSubsidy.enabled
    ? interpolatePolicy(config.policyConfig.wageSubsidy.subsidyPercentage, year)
    : 0;

  // Tokens-per-task default: the spike-and-recover schedule (1× → 20× → 25× → 15× → 5×
  // → 1×, holding 1× thereafter), unless a scenario set a flat tokenUsageMultiplier.
  // Sticky-forward overridable per year.
  const tokenUsageBaseline = defaultTokenUsageMultiplier(
    year,
    config.startYear,
    config.aiCostParams?.tokenUsageMultiplier,
  );

  return {
    year,
    profileName,

    // ── Fiscal consolidation ──
    fiscalDiscretionaryMultiplier: r(
      'fiscalDiscretionaryMultiplier', 1.0,
      autopilotResult.discretionaryMultiplier,
      autopilotResult.consolidationExplanation,
    ),
    fiscalObligationMultiplier: r(
      'fiscalObligationMultiplier', 1.0,
      autopilotResult.obligationMultiplier,
      autopilotResult.consolidationExplanation,
    ),
    fiscalRevenueMultiplier: r(
      'fiscalRevenueMultiplier', 1.0,
      autopilotResult.revenueMultiplier,
      autopilotResult.consolidationExplanation,
    ),
    effectiveColaDampeningFactor: r(
      'effectiveColaDampeningFactor', 1.0,
      autopilotResult.colaDampeningFactor,
      autopilotResult.colaExplanation,
    ),
    consolidationIntensity: r(
      'consolidationIntensity', 0.0,
      autopilotResult.consolidationIntensity,
    ),

    // ── Effective tax rates (baseline × revenue multiplier) ──
    effectiveIncomeTaxRate: r(
      'effectiveIncomeTaxRate', baselineIncome,
      autopilotResult.effectiveIncomeTaxRate,
      autopilotResult.consolidationExplanation,
    ),
    effectivePayrollTaxRate: r(
      'effectivePayrollTaxRate', baselinePayroll,
      autopilotResult.effectivePayrollTaxRate,
      autopilotResult.consolidationExplanation,
    ),
    effectiveCorporateTaxRate: r(
      'effectiveCorporateTaxRate', baselineCorporate,
      autopilotResult.effectiveCorporateTaxRate,
      autopilotResult.consolidationExplanation,
    ),
    effectiveCapitalGainsTaxRate: r(
      'effectiveCapitalGainsTaxRate', baselineCapGains,
      autopilotResult.effectiveCapitalGainsTaxRate,
      autopilotResult.consolidationExplanation,
    ),

    // ── Monetary (from profile, overridable) ──
    qeMonetizationRate: r(
      'qeMonetizationRate',
      autopilotResult.qeMonetizationRate,
      autopilotResult.qeMonetizationRate,
    ),
    maxFinancialRepressionRate: r(
      'maxFinancialRepressionRate',
      autopilotResult.maxFinancialRepressionRate,
      autopilotResult.maxFinancialRepressionRate,
    ),

    // ── Federal Reserve reaction function (Phase 8 Fix 4) ──
    // Identity autopilot: baseline = autopilot (no endogenous adjustment).
    // Users can override per year to model Fed chair changes.
    taylorInflationCoeff: r(
      'taylorInflationCoeff',
      autopilotResult.taylorInflationCoeff,
      autopilotResult.taylorInflationCoeff,
    ),
    taylorOutputGapCoeff: r(
      'taylorOutputGapCoeff',
      autopilotResult.taylorOutputGapCoeff,
      autopilotResult.taylorOutputGapCoeff,
    ),
    taylorEmploymentGapCoeff: r(
      'taylorEmploymentGapCoeff',
      autopilotResult.taylorEmploymentGapCoeff,
      autopilotResult.taylorEmploymentGapCoeff,
    ),

    // ── Policy programs (override-only; autopilot doesn't change these) ──
    ubiEnabled: r(
      'ubiEnabled',
      config.policyConfig.ubi.enabled ? 1 : 0,
      config.policyConfig.ubi.enabled ? 1 : 0,
    ),
    ubiMonthlyAmount: r(
      'ubiMonthlyAmount', ubiMonthlyBaseline, ubiMonthlyBaseline,
    ),
    wageSubsidyEnabled: r(
      'wageSubsidyEnabled',
      config.policyConfig.wageSubsidy.enabled ? 1 : 0,
      config.policyConfig.wageSubsidy.enabled ? 1 : 0,
    ),
    wageSubsidyPercentage: r(
      'wageSubsidyPercentage', wageSubsidyPctBaseline, wageSubsidyPctBaseline,
    ),
    swfEnabled: r(
      'swfEnabled',
      config.policyConfig.sovereignWealthFund.enabled ? 1 : 0,
      config.policyConfig.sovereignWealthFund.enabled ? 1 : 0,
    ),
    equityEnabled: r(
      'equityEnabled',
      config.policyConfig.profitSharing.enabled ? 1 : 0,
      config.policyConfig.profitSharing.enabled ? 1 : 0,
    ),

    // ── Technology (computed, read-only) ──
    generativeCapabilityLevel: readOnly(capabilityLevels.generative),
    agenticCapabilityLevel: readOnly(capabilityLevels.agentic),
    embodiedCapabilityLevel: readOnly(capabilityLevels.embodied),
    // ── Tokens per task (year-conditional default, user-overridable per year) ──
    tokenUsageMultiplier: r(
      'tokenUsageMultiplier',
      tokenUsageBaseline,
      tokenUsageBaseline,
    ),

    // === Supply Chain (Phase 9) ===
    // Supply inputs: baseline-only (autopilot = baseline, user sets via SC config)
    supplyChainAiChips: r('supplyChainAiChips', sc.aiChips, sc.aiChips),
    supplyChainEnergyPrice: r('supplyChainEnergyPrice', sc.energyPrice, sc.energyPrice),
    supplyChainEnergyCapacity: r('supplyChainEnergyCapacity', sc.energyCapacity, sc.energyCapacity),
    supplyChainTrainingDC: r('supplyChainTrainingDC', sc.trainingDC, sc.trainingDC),
    supplyChainInferenceDC: r('supplyChainInferenceDC', sc.inferenceDC, sc.inferenceDC),
    supplyChainRoboticsHW: r('supplyChainRoboticsHW', sc.roboticsHW, sc.roboticsHW),
    supplyChainSoftwareEfficiency: r('supplyChainSoftwareEfficiency', sc.softwareEfficiency, sc.softwareEfficiency),

    // Resilience: autopilot-computed (time-evolved), user-overridable
    resilienceAiChips: r('resilienceAiChips', sc.resAiChips, scAuto.scResilienceAiChips),
    resilienceEnergy: r('resilienceEnergy', sc.resEnergy, scAuto.scResilienceEnergy),
    resilienceTrainingDC: r('resilienceTrainingDC', sc.resTrainingDC, scAuto.scResilienceTrainingDC),
    resilienceInferenceDC: r('resilienceInferenceDC', sc.resInferenceDC, scAuto.scResilienceInferenceDC),
    resilienceRoboticsHW: r('resilienceRoboticsHW', sc.resRoboticsHW, scAuto.scResilienceRoboticsHW),

    // Training dynamics: autopilot defaults, user-overridable
    trainingChipsTechDecline: r('trainingChipsTechDecline', sc.chipsTechDecline, sc.chipsTechDecline),
    trainingEnergyTechDecline: r('trainingEnergyTechDecline', sc.energyTechDecline, sc.energyTechDecline),
    trainingDCTechDecline: r('trainingDCTechDecline', sc.dcTechDecline, sc.dcTechDecline),
    trainingChipsScalePressure: r('trainingChipsScalePressure', sc.chipsScale, sc.chipsScale),
    trainingEnergyScalePressure: r('trainingEnergyScalePressure', sc.energyScale, sc.energyScale),
    trainingDCScalePressure: r('trainingDCScalePressure', sc.dcScale, sc.dcScale),
    regulatoryFriction: r('regulatoryFriction', sc.regFriction, sc.regFriction),

    // Economics: autopilot trajectory, user-overridable
    costPassThroughRate: r('costPassThroughRate', sc.costPassThrough, scAuto.scCostPassThroughRate),
    consumerPassThroughRate: r('consumerPassThroughRate', sc.consumerPassThrough, sc.consumerPassThrough),
    costVsProcurementBlend: r('costVsProcurementBlend', sc.costVsProcurementBlend, sc.costVsProcurementBlend),

    // Read-only diagnostics (computed, not overridable)
    dynamicTrainingCompChips: readOnly(scAuto.scDynamicCompChips),
    dynamicTrainingCompEnergy: readOnly(scAuto.scDynamicCompEnergy),
    dynamicTrainingCompDC: readOnly(scAuto.scDynamicCompDC),
  };
}
