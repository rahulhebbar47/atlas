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
// RETIRED (mini-stage 1; Amendment 2 — no legacy toggles): the tokens-per-task schedule
// constants left with the retired resolution path below.
// import {
//   START_YEAR_TOKEN_USAGE_MULTIPLIER,
//   DEFAULT_TOKEN_USAGE_SCHEDULE,
// } from './constants';

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
/**
 * R1 (the axes program): the optional manifest layers and per-key tag class.
 * axisValue/eventValue are produced by R2's manifest compiler — absent until then
 * (dormant by construction). importedKeys marks override keys that arrived through the
 * one-way save migration (provenance 'imported' instead of 'user-override').
 * autopilotTag declares whether this key's autopilot layer is the POLICY system's
 * execution arm ('policy' — fiscal/monetary/Fed profile-driven keys) or the model's own
 * baseline trajectory evolving ('default' — supply-chain evolution, the pass-through
 * anchor).
 */
export interface ResolutionLayers {
  axisValue?: number;
  eventValue?: number;
  /** The data-calibration preset's scalar layer (the AEI program): slots BELOW the
   *  axis check and ABOVE the autopilot check — the data baseline calibrates what
   *  the user did not choose. DORMANT in v1 (the shipped preset carries zero scalar
   *  values; no producer sets this) — specified for the species, battery-proven on
   *  synthetic layers. */
  dataCalibrationValue?: number;
  importedKeys?: ReadonlySet<string>;
  autopilotTag?: 'policy' | 'default' | 'axis-variant'; // R2b: the species of what SELECTED the profile
  /** Ruling 2: the axis·variant that set this key's BASELINE (trajectory-evolved keys —
   *  axis-sets-baseline; the sub-tag rides every return path verbatim). */
  baselineOrigin?: { axis: string; variant: string };
}

export function resolveParameter(
  paramKey: string,
  year: number,
  baseline: number,
  autopilot: number,
  overrides: UserOverrideMap,
  explanation?: string,
  layers?: ResolutionLayers,
): ParameterValue {
  // Find the most recent override at or before this year
  const effectiveOverride = findStickyOverride(paramKey, year, overrides);
  const common = {
    baseline,
    autopilot,
    ...(layers?.axisValue !== undefined ? { axisValue: layers.axisValue } : {}),
    ...(layers?.eventValue !== undefined ? { eventValue: layers.eventValue } : {}),
    ...(layers?.dataCalibrationValue !== undefined
      ? { dataCalibrationValue: layers.dataCalibrationValue } : {}),
    ...(layers?.baselineOrigin !== undefined ? { baselineOrigin: layers.baselineOrigin } : {}),
    ...(explanation !== undefined ? { explanation } : {}),
  };

  // Precedence (the ratified law, §3.1 + the R1 autopilot slot + the data-calibration
  // slot below axis, above autopilot):
  // user-override/imported > event > axis-variant > data-calibration > autopilot > baseline-default
  if (effectiveOverride !== undefined) {
    return {
      ...common,
      userOverride: effectiveOverride,
      effective: effectiveOverride,
      source: layers?.importedKeys?.has(paramKey) ? 'imported' : 'user-override',
    };
  }

  if (layers?.eventValue !== undefined) {
    return { ...common, effective: layers.eventValue, source: 'event' };
  }

  if (layers?.axisValue !== undefined) {
    return { ...common, effective: layers.axisValue, source: 'axis-variant' };
  }

  if (layers?.dataCalibrationValue !== undefined) {
    return { ...common, effective: layers.dataCalibrationValue, source: 'data-calibration' };
  }

  if (Math.abs(autopilot - baseline) > 1e-10) {
    return { ...common, effective: autopilot, source: layers?.autopilotTag ?? 'policy' };
  }

  return { ...common, effective: baseline, source: 'default' };
}

/**
 * R3a: sticky lookup into a composition layer (the event layer uses the same
 * "key:year" sticky-forward convention as user overrides). Exported for the ONE
 * simulation site that consumes a per-year event value outside the 49-key record
 * (the geopolitical axis-override, case 16).
 */
export function stickyLayerValue(
  key: string,
  year: number,
  layer: UserOverrideMap,
): number | undefined {
  return findStickyOverride(key, year, layer);
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

// RETIRED (the coupled design checkpoint, mini-stage 1; Amendment 2 — no legacy toggles):
// defaultTokenUsageMultiplier — the global tokens-per-task default trajectory (the
// spike-and-recover schedule / flat override). Replaced by the frontier-intensity cost
// layer (aiCost.ts): the aggregate tokens-per-task path is an emergent OUTPUT
// (MacroOutput.impliedAggregateTokensPerTask), never an input. Kept per the no-delete
// rule; the which-change pole is the recorded predecessor-commit run (6c831b7).
// export function defaultTokenUsageMultiplier(
//   year: number,
//   startYear: number,
//   flatOverride?: number,
// ): number {
//   const offset = Math.max(0, year - startYear);
//   if (flatOverride !== undefined) {
//     return offset === 0 ? START_YEAR_TOKEN_USAGE_MULTIPLIER : flatOverride;
//   }
//   const sched = DEFAULT_TOKEN_USAGE_SCHEDULE;
//   return sched[Math.min(offset, sched.length - 1)]!;
// }

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
 * Resolve ALL tracked parameters for a given year — THE ONE PRODUCER (R1, the axes
 * program's unified resolution): the engine and the record both consume the object this
 * returns; the duplicate inline resolution (the old rsc block) is retired at its site.
 *
 * Combines autopilot computation results with user overrides and
 * config baseline values into a complete YearParameters record (49 keys).
 *
 * The three capability display mirrors are NOT precedence-resolved (readOnly by design)
 * and depend on the supply-chain capability delay computed mid-year — they are attached
 * via attachCapabilityMirrors() after scores compute, before the record is written.
 *
 * @param year - The simulation year
 * @param config - Full simulation configuration (for baseline values)
 * @param autopilotResult - Autopilot-computed values for this year
 * @param overrides - User per-year overrides
 * @param profileName - Active fiscal response profile name
 * @returns Complete YearParameters (capability mirrors placeholder-0 until attached)
 */
export function resolveAllParameters(
  year: number,
  config: SimulationConfig,
  autopilotResult: AutopilotResult,
  overrides: UserOverrideMap,
  profileName: string,
  // R3a: the composition's per-year layers — EMPTY at defaults (bit-zero by
  // construction). eventLayer entries use the same "key:year" sticky convention as
  // user overrides (the compiler emits start + explicit-recovery entries);
  // importedKeys marks override keys carrying 'imported' provenance (the migration).
  composition?: {
    eventLayer?: UserOverrideMap;
    importedKeys?: ReadonlySet<string>;
    /** R2b retag: the tag reflects the SPECIES OF WHAT SELECTED the profile —
     *  'axis-variant' when an A13/A14 variant selected it; 'policy' only where a true
     *  package wrote the preset slot; 'default' when nobody selected (the unselected
     *  environment belief executing is the model's default world). */
    profileTags?: { fiscal?: 'default' | 'axis-variant' | 'policy'; fed?: 'default' | 'axis-variant' | 'policy' };
    /** THE ORIGIN CHANNEL (the supply-chain shock ruling): sticky 1/0 flags on
     *  resilience row keys, compiler-emitted for domestic-regulatory quantity legs.
     *  An active flag injects eventValue 0 for the row — resilience cannot absorb a
     *  shock aimed at the resilience measures themselves. User overrides still win
     *  (standing precedence); the autopilot trajectory resumes when the flag ends. */
    scResilienceBypassLayer?: UserOverrideMap;
  },
): YearParameters {
  const eventAt = (key: string): number | undefined => {
    if (!composition?.eventLayer) return undefined;
    const v = findStickyOverride(key, year, composition.eventLayer);
    // F2 (recovery = RELEASE): a NaN entry is the compiler's release sentinel — from
    // its year forward the key is NOT event-covered; the layers below resume.
    return v !== undefined && Number.isNaN(v) ? undefined : v;
  };
  // Resilience rows: a domestic-regulatory bypass flag active this year reads the row
  // to event-provenance 0 (the one producer carries it; record ≡ execution).
  const resilienceEventAt = (key: string): number | undefined => {
    const flag = composition?.scResilienceBypassLayer
      ? findStickyOverride(key, year, composition.scResilienceBypassLayer)
      : undefined;
    if (flag === 1) return 0;
    return eventAt(key);
  };
  const imported = composition?.importedKeys;
  const fiscalTag = composition?.profileTags?.fiscal ?? 'default';
  const fedTag = composition?.profileTags?.fed ?? 'default';
  // Helper: resolve one param whose autopilot layer is the FISCAL profile executing —
  // Washington-under-stress, an ENVIRONMENT ACTOR (R2b species correction): the tag is
  // the species of what SELECTED the profile, not the wiring.
  const r = (key: string, baseline: number, autopilot: number, explanation?: string) =>
    resolveParameter(key, year, baseline, autopilot, overrides, explanation,
      { autopilotTag: fiscalTag, eventValue: eventAt(key), importedKeys: imported });
  // Helper: the FED profile's keys (Taylor coefficients, monetization) — same rule.
  const rfed = (key: string, baseline: number, autopilot: number, explanation?: string) =>
    resolveParameter(key, year, baseline, autopilot, overrides, explanation,
      { autopilotTag: fedTag, eventValue: eventAt(key), importedKeys: imported });
  // Helper: resolve one param whose autopilot layer is the model's own baseline
  // trajectory evolving (supply-chain resilience evolution, the pass-through anchor) —
  // tag class 'default', per the R1 battery spec.
  const rd = (key: string, baseline: number, autopilot: number, explanation?: string) =>
    resolveParameter(key, year, baseline, autopilot, overrides, explanation,
      { autopilotTag: 'default', eventValue: eventAt(key), importedKeys: imported });
  // Helper: the RESILIENCE rows — same tag class as rd, with the origin-channel bypass
  // injected as the event layer (domestic-regulatory legs zero the row's insurance).
  const rdRes = (key: string, baseline: number, autopilot: number, explanation?: string) =>
    resolveParameter(key, year, baseline, autopilot, overrides, explanation,
      { autopilotTag: 'default', eventValue: resilienceEventAt(key), importedKeys: imported });

  // Phase 9: Supply chain config extraction with defaults
  const scCfg = config.supplyChainConfig;
  const sc = {
    // Supply inputs
    aiChips: scCfg?.inputs.aiChips ?? 100,
    chipPrice: scCfg?.inputs.chipPrice ?? 100,
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
    source: 'default',
    explanation: 'display mirror — not precedence-resolved (readOnly by design)',
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

  // RETIRED (mini-stage 1; Amendment 2): the tokens-per-task per-year row — the schedule
  // and its sticky-forward override surface left with the frontier-intensity layer.
  // const tokenUsageBaseline = defaultTokenUsageMultiplier(
  //   year,
  //   config.startYear,
  //   config.aiCostParams?.tokenUsageMultiplier,
  // );

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
    qeMonetizationRate: rfed(
      'qeMonetizationRate',
      autopilotResult.qeMonetizationRate,
      autopilotResult.qeMonetizationRate,
    ),
    maxFinancialRepressionRate: rfed(
      'maxFinancialRepressionRate',
      autopilotResult.maxFinancialRepressionRate,
      autopilotResult.maxFinancialRepressionRate,
    ),

    // ── Federal Reserve reaction function (Phase 8 Fix 4) ──
    // Identity autopilot: baseline = autopilot (no endogenous adjustment).
    // Users can override per year to model Fed chair changes.
    taylorInflationCoeff: rfed(
      'taylorInflationCoeff',
      autopilotResult.taylorInflationCoeff,
      autopilotResult.taylorInflationCoeff,
    ),
    taylorOutputGapCoeff: rfed(
      'taylorOutputGapCoeff',
      autopilotResult.taylorOutputGapCoeff,
      autopilotResult.taylorOutputGapCoeff,
    ),
    taylorEmploymentGapCoeff: rfed(
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
    // R1: placeholder-0 at resolution time — the scores depend on the supply-chain
    // capability delay computed mid-year; attachCapabilityMirrors() replaces these
    // before the record is written (asserted by battery R1-B4).
    generativeCapabilityLevel: readOnly(0),
    agenticCapabilityLevel: readOnly(0),
    embodiedCapabilityLevel: readOnly(0),
    // RETIRED (mini-stage 1; Amendment 2): the tokens-per-task row — the aggregate path is
    // an emergent OUTPUT (MacroOutput.impliedAggregateTokensPerTask), never an input.
    // tokenUsageMultiplier: r(
    //   'tokenUsageMultiplier',
    //   tokenUsageBaseline,
    //   tokenUsageBaseline,
    // ),

    // === Supply Chain (Phase 9) ===
    // Supply inputs: baseline-only (autopilot = baseline, user sets via SC config)
    supplyChainAiChips: r('supplyChainAiChips', sc.aiChips, sc.aiChips),
    supplyChainChipPrice: r('supplyChainChipPrice', sc.chipPrice, sc.chipPrice),
    supplyChainEnergyPrice: r('supplyChainEnergyPrice', sc.energyPrice, sc.energyPrice),
    supplyChainEnergyCapacity: r('supplyChainEnergyCapacity', sc.energyCapacity, sc.energyCapacity),
    supplyChainTrainingDC: r('supplyChainTrainingDC', sc.trainingDC, sc.trainingDC),
    supplyChainInferenceDC: r('supplyChainInferenceDC', sc.inferenceDC, sc.inferenceDC),
    supplyChainRoboticsHW: r('supplyChainRoboticsHW', sc.roboticsHW, sc.roboticsHW),
    supplyChainSoftwareEfficiency: r('supplyChainSoftwareEfficiency', sc.softwareEfficiency, sc.softwareEfficiency),

    // Resilience: autopilot-computed (time-evolved), user-overridable — the autopilot
    // layer is trajectory evolution, tag class 'default' (rdRes), not the policy
    // system. The origin-channel bypass rides the event slot (domestic-regulatory
    // legs read the row to 0 while active).
    resilienceAiChips: rdRes('resilienceAiChips', sc.resAiChips, scAuto.scResilienceAiChips),
    resilienceEnergy: rdRes('resilienceEnergy', sc.resEnergy, scAuto.scResilienceEnergy),
    resilienceTrainingDC: rdRes('resilienceTrainingDC', sc.resTrainingDC, scAuto.scResilienceTrainingDC),
    resilienceInferenceDC: rdRes('resilienceInferenceDC', sc.resInferenceDC, scAuto.scResilienceInferenceDC),
    resilienceRoboticsHW: rdRes('resilienceRoboticsHW', sc.resRoboticsHW, scAuto.scResilienceRoboticsHW),

    // Training dynamics: autopilot defaults, user-overridable
    trainingChipsTechDecline: r('trainingChipsTechDecline', sc.chipsTechDecline, sc.chipsTechDecline),
    trainingEnergyTechDecline: r('trainingEnergyTechDecline', sc.energyTechDecline, sc.energyTechDecline),
    trainingDCTechDecline: r('trainingDCTechDecline', sc.dcTechDecline, sc.dcTechDecline),
    trainingChipsScalePressure: r('trainingChipsScalePressure', sc.chipsScale, sc.chipsScale),
    trainingEnergyScalePressure: r('trainingEnergyScalePressure', sc.energyScale, sc.energyScale),
    trainingDCScalePressure: r('trainingDCScalePressure', sc.dcScale, sc.dcScale),
    regulatoryFriction: r('regulatoryFriction', sc.regFriction, sc.regFriction),

    // Economics: autopilot trajectory (the episode-anchored pass-through), user-overridable
    costPassThroughRate: rd('costPassThroughRate', sc.costPassThrough, scAuto.scCostPassThroughRate),
    consumerPassThroughRate: r('consumerPassThroughRate', sc.consumerPassThrough, sc.consumerPassThrough),
    costVsProcurementBlend: r('costVsProcurementBlend', sc.costVsProcurementBlend, sc.costVsProcurementBlend),

    // Read-only diagnostics (computed, not overridable)
    dynamicTrainingCompChips: readOnly(scAuto.scDynamicCompChips),
    dynamicTrainingCompEnergy: readOnly(scAuto.scDynamicCompEnergy),
    dynamicTrainingCompDC: readOnly(scAuto.scDynamicCompDC),
  };
}

/**
 * R1 (the axes program): attach the three capability display mirrors to a resolved year.
 *
 * The mirrors are not precedence-resolved (readOnly by design — overrides are never
 * consulted) and their values depend on the supply-chain capability delay computed
 * mid-year, AFTER the one resolution pass. This pure function returns a new
 * YearParameters with the mirrors set; the simulation records the attached object, so
 * the record still equals the display (battery R1-B4 asserts mirror ≡ computed score).
 */
export function attachCapabilityMirrors(
  yearParams: YearParameters,
  levels: CapabilityLevels,
): YearParameters {
  const mirror = (value: number): ParameterValue => ({
    baseline: value,
    autopilot: value,
    effective: value,
    source: 'default',
    explanation: 'display mirror — not precedence-resolved (readOnly by design)',
  });
  return {
    ...yearParams,
    generativeCapabilityLevel: mirror(levels.generative),
    agenticCapabilityLevel: mirror(levels.agentic),
    embodiedCapabilityLevel: mirror(levels.embodied),
  };
}
