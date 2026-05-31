/**
 * ATLAS Phase 8b: Centralized Autopilot Computation
 *
 * Takes previous year's economic state + the active FiscalResponseProfile
 * and returns all adjusted parameter values WITH human-readable explanations.
 *
 * PURE FUNCTION — no side effects, no state mutation.
 *
 * This centralizes logic that was previously inline in simulation.ts:
 * - Fiscal consolidation (from computeFiscalConsolidation in fiscal.ts)
 * - COLA dampening (from macro.ts / simulation.ts)
 * - Revenue multiplier → effective tax rates (NEW in Phase 8b)
 */

import type { AutopilotResult } from '@/types/parameterTimeline';
import type { FiscalResponseProfile } from '@/models/fiscalResponseProfiles';
import type { SimulationConfig, SupplyChainConfig } from '@/types';
import { computeFiscalConsolidation } from '@/models/fiscal';
import {
  BASELINE_INCOME_TAX_RATE,
  BASELINE_PAYROLL_RATE,
  BASELINE_CORPORATE_TAX_RATE,
  BASELINE_CAPITAL_GAINS_RATE,
} from '@/models/constants';
import {
  computeAutopilotResilience,
  interpolatePassThrough,
  computeDynamicTrainingComposition,
} from './supplyChain';

// ============================================================
// Baseline Tax Rates Helper
// ============================================================

export interface BaselineTaxRates {
  income: number;
  payroll: number;
  corporate: number;
  capitalGains: number;
}

/**
 * Extract baseline tax rates from config, falling back to module constants.
 */
export function getBaselineTaxRates(config: SimulationConfig): BaselineTaxRates {
  return {
    income: config.taxConfig?.incomeTaxRate ?? BASELINE_INCOME_TAX_RATE,
    payroll: config.taxConfig?.payrollTaxRate ?? BASELINE_PAYROLL_RATE,
    corporate: config.taxConfig?.corporateTaxRate ?? BASELINE_CORPORATE_TAX_RATE,
    capitalGains: config.taxConfig?.capitalGainsTaxRate ?? BASELINE_CAPITAL_GAINS_RATE,
  };
}

// ============================================================
// Baseline Autopilot (Year 0 / No Previous State)
// ============================================================

/**
 * Returns identity autopilot values for the first simulation year
 * when there's no previous state to react to.
 *
 * All multipliers = 1.0, no dampening, baseline tax rates unchanged.
 */
export function getBaselineAutopilot(
  config: SimulationConfig,
  profile: FiscalResponseProfile,
): AutopilotResult {
  const rates = getBaselineTaxRates(config);
  return {
    discretionaryMultiplier: 1.0,
    obligationMultiplier: 1.0,
    revenueMultiplier: 1.0,
    consolidationIntensity: 0,
    colaDampeningFactor: 1.0,
    effectiveIncomeTaxRate: rates.income,
    effectivePayrollTaxRate: rates.payroll,
    effectiveCorporateTaxRate: rates.corporate,
    effectiveCapitalGainsTaxRate: rates.capitalGains,
    qeMonetizationRate: profile.qeMonetizationRate,
    maxFinancialRepressionRate: profile.maxFinancialRepressionRate,
    // Phase 8 Fix 4: Taylor coefficients (identity pass-through from profile)
    taylorInflationCoeff: profile.taylorInflationCoeff,
    taylorOutputGapCoeff: profile.taylorOutputGapCoeff,
    taylorEmploymentGapCoeff: profile.taylorEmploymentGapCoeff,
    // Phase 9: Supply chain defaults (year 0 = identity values)
    scResilienceAiChips: 0.05,
    scResilienceEnergy: 0.85,
    scResilienceTrainingDC: 0.90,
    scResilienceInferenceDC: 0.90,
    scResilienceRoboticsHW: 0.05,
    scDynamicCompChips: 0.55,
    scDynamicCompEnergy: 0.25,
    scDynamicCompDC: 0.20,
    scCostPassThroughRate: 0,
  };
}

// ============================================================
// Full Autopilot Computation
// ============================================================

/**
 * Compute all autopilot-driven parameter values for a given year.
 *
 * Takes the previous year's economic state and the active fiscal response
 * profile, and returns adjusted values WITH human-readable explanations.
 *
 * @param laggedDebtGDPRatio - Debt/GDP ratio from consolidationLag years ago
 * @param prevCumulativeInflationFactor - CIF from previous year's macro output
 * @param profile - The active FiscalResponseProfile
 * @param baselineTaxRates - Baseline tax rates from config
 * @returns AutopilotResult with all adjusted values and explanations
 */
export function computeAutopilotParameters(
  laggedDebtGDPRatio: number,
  prevCumulativeInflationFactor: number,
  profile: FiscalResponseProfile,
  baselineTaxRates: BaselineTaxRates,
  year?: number,
  supplyChainConfig?: SupplyChainConfig,
  onshoringFraction?: number,
): AutopilotResult {
  // ── Fiscal Consolidation ──
  const consolidation = computeFiscalConsolidation(laggedDebtGDPRatio, profile);

  let consolidationExplanation: string | undefined;
  if (consolidation.consolidationIntensity > 0) {
    const cutPct = ((1 - consolidation.discretionaryMultiplier) * 100).toFixed(0);
    const revPct = ((consolidation.revenueMultiplier - 1) * 100).toFixed(0);
    consolidationExplanation =
      `Fiscal consolidation active: debt/GDP is ${laggedDebtGDPRatio.toFixed(2)}× `
      + `(threshold: ${profile.consolidationThreshold}×). `
      + `Discretionary spending cut ${cutPct}%, effective tax rates up ${revPct}%.`;
  }

  // ── COLA Dampening ──
  // Mirrors the logic in simulation.ts lines 1597-1606 and macro.ts lines 1557-1568
  let colaDampeningFactor = 1.0;
  let colaExplanation: string | undefined;
  if (prevCumulativeInflationFactor > profile.colaDampeningThreshold) {
    const dampenRange = profile.colaDampeningMaxCIF - profile.colaDampeningThreshold;
    const dampenIntensity = dampenRange > 0
      ? Math.min(1, (prevCumulativeInflationFactor - profile.colaDampeningThreshold) / dampenRange)
      : 1.0;
    colaDampeningFactor = 1.0 - dampenIntensity * profile.colaDampeningRate;
    colaExplanation =
      `COLA dampened: cumulative inflation factor is ${prevCumulativeInflationFactor.toFixed(2)}× `
      + `(threshold: ${profile.colaDampeningThreshold}×). `
      + `Transfers grow at ${(colaDampeningFactor * 100).toFixed(0)}% of inflation rate.`;
  }

  // ── Effective Tax Rates ──
  // Phase 8b: Revenue multiplier now actually applied to tax rates.
  // Previously stored but unused in Phase 8a.
  const rm = consolidation.revenueMultiplier;

  return {
    discretionaryMultiplier: consolidation.discretionaryMultiplier,
    obligationMultiplier: consolidation.obligationMultiplier,
    revenueMultiplier: consolidation.revenueMultiplier,
    consolidationIntensity: consolidation.consolidationIntensity,
    consolidationExplanation,
    colaDampeningFactor,
    colaExplanation,
    effectiveIncomeTaxRate: baselineTaxRates.income * rm,
    effectivePayrollTaxRate: baselineTaxRates.payroll * rm,
    effectiveCorporateTaxRate: baselineTaxRates.corporate * rm,
    effectiveCapitalGainsTaxRate: baselineTaxRates.capitalGains * rm,
    qeMonetizationRate: profile.qeMonetizationRate,
    maxFinancialRepressionRate: profile.maxFinancialRepressionRate,
    // Phase 8 Fix 4: Taylor coefficients (identity pass-through — no autopilot adjustment)
    taylorInflationCoeff: profile.taylorInflationCoeff,
    taylorOutputGapCoeff: profile.taylorOutputGapCoeff,
    taylorEmploymentGapCoeff: profile.taylorEmploymentGapCoeff,
    // Phase 9: Supply chain autopilot values (time-evolved when SC config present)
    ...computeSupplyChainAutopilot(year, supplyChainConfig, onshoringFraction),
  };
}

/**
 * Compute supply chain autopilot values.
 * When SC config is present, computes time-evolved resilience, pass-through, and dynamic composition.
 * Otherwise returns static defaults.
 */
function computeSupplyChainAutopilot(
  year?: number,
  scConfig?: SupplyChainConfig,
  onshoringFraction?: number,
): Pick<AutopilotResult, 'scResilienceAiChips' | 'scResilienceEnergy' | 'scResilienceTrainingDC' | 'scResilienceInferenceDC' | 'scResilienceRoboticsHW' | 'scDynamicCompChips' | 'scDynamicCompEnergy' | 'scDynamicCompDC' | 'scCostPassThroughRate'> {
  if (!scConfig || year === undefined) {
    return {
      scResilienceAiChips: 0.05,
      scResilienceEnergy: 0.85,
      scResilienceTrainingDC: 0.90,
      scResilienceInferenceDC: 0.90,
      scResilienceRoboticsHW: 0.05,
      scDynamicCompChips: 0.55,
      scDynamicCompEnergy: 0.25,
      scDynamicCompDC: 0.20,
      scCostPassThroughRate: 0,
    };
  }

  const resilience = computeAutopilotResilience(year, scConfig.resilience, onshoringFraction ?? 0);
  const passThrough = interpolatePassThrough(year);
  const comp = computeDynamicTrainingComposition(year, scConfig);

  return {
    scResilienceAiChips: resilience.aiChips,
    scResilienceEnergy: resilience.energy,
    scResilienceTrainingDC: resilience.trainingDC,
    scResilienceInferenceDC: resilience.inferenceDC,
    scResilienceRoboticsHW: resilience.roboticsHardware,
    scDynamicCompChips: comp.aiChips,
    scDynamicCompEnergy: comp.energy,
    scDynamicCompDC: comp.datacenter,
    scCostPassThroughRate: passThrough,
  };
}
