/**
 * Phase 8b: Autopilot Computation Tests
 *
 * Tests the centralized autopilot module that computes
 * fiscal consolidation, COLA dampening, and effective tax rates.
 */

import { describe, it, expect } from 'vitest';
import {
  getBaselineTaxRates,
  getBaselineAutopilot,
  computeAutopilotParameters,
} from '@/models/autopilot';
import type { BaselineTaxRates } from '@/models/autopilot';
import { getDefaultSimulationConfig } from '@/models/simulation';
import {
  resolveCombinedProfile,
  FISCAL_POLICY_PRESETS,
  DEFAULT_FISCAL_POLICY_PRESET,
  DEFAULT_FEDERAL_RESERVE_PRESET,
} from '@/models/fiscalResponseProfiles';

// ============================================================
// getBaselineTaxRates
// ============================================================

describe('getBaselineTaxRates', () => {
  it('extracts rates from config.taxConfig when present', () => {
    const config = getDefaultSimulationConfig();
    const rates = getBaselineTaxRates(config);
    // Should return values from config (which default to constants)
    expect(rates.income).toBeGreaterThan(0);
    expect(rates.payroll).toBeGreaterThan(0);
    expect(rates.corporate).toBeGreaterThan(0);
    expect(rates.capitalGains).toBeGreaterThan(0);
  });

  it('uses constant fallbacks when taxConfig is undefined', () => {
    const config = { ...getDefaultSimulationConfig(), taxConfig: undefined };
    const rates = getBaselineTaxRates(config);
    // Falls back to BASELINE_* constants — should still be positive
    expect(rates.income).toBeGreaterThan(0);
    expect(rates.payroll).toBeGreaterThan(0);
    expect(rates.corporate).toBeGreaterThan(0);
    expect(rates.capitalGains).toBeGreaterThan(0);
  });
});

// ============================================================
// getBaselineAutopilot
// ============================================================

describe('getBaselineAutopilot', () => {
  const config = getDefaultSimulationConfig();
  const profile = resolveCombinedProfile('balanced_reduction', DEFAULT_FEDERAL_RESERVE_PRESET);

  it('returns identity multipliers (1.0)', () => {
    const result = getBaselineAutopilot(config, profile);
    expect(result.discretionaryMultiplier).toBe(1.0);
    expect(result.obligationMultiplier).toBe(1.0);
    expect(result.revenueMultiplier).toBe(1.0);
  });

  it('has zero consolidation intensity', () => {
    const result = getBaselineAutopilot(config, profile);
    expect(result.consolidationIntensity).toBe(0);
  });

  it('has no COLA dampening (factor = 1.0)', () => {
    const result = getBaselineAutopilot(config, profile);
    expect(result.colaDampeningFactor).toBe(1.0);
  });

  it('effective tax rates equal baseline config rates', () => {
    const result = getBaselineAutopilot(config, profile);
    const rates = getBaselineTaxRates(config);
    expect(result.effectiveIncomeTaxRate).toBe(rates.income);
    expect(result.effectivePayrollTaxRate).toBe(rates.payroll);
    expect(result.effectiveCorporateTaxRate).toBe(rates.corporate);
    expect(result.effectiveCapitalGainsTaxRate).toBe(rates.capitalGains);
  });

  it('monetary parameters come from profile', () => {
    const result = getBaselineAutopilot(config, profile);
    expect(result.qeMonetizationRate).toBe(profile.qeMonetizationRate);
    expect(result.maxFinancialRepressionRate).toBe(profile.maxFinancialRepressionRate);
  });
});

// ============================================================
// computeAutopilotParameters
// ============================================================

describe('computeAutopilotParameters', () => {
  const config = getDefaultSimulationConfig();
  const rates = getBaselineTaxRates(config);
  const balancedProfile = resolveCombinedProfile('balanced_reduction', DEFAULT_FEDERAL_RESERVE_PRESET);

  it('returns identity values when debt/GDP is below consolidation threshold', () => {
    // balanced_reduction threshold = 1.5
    const result = computeAutopilotParameters(0.8, 1.0, balancedProfile, rates);
    expect(result.discretionaryMultiplier).toBe(1.0);
    expect(result.obligationMultiplier).toBe(1.0);
    expect(result.revenueMultiplier).toBe(1.0);
    expect(result.consolidationIntensity).toBe(0);
    expect(result.consolidationExplanation).toBeUndefined();
  });

  it('engages consolidation when debt/GDP exceeds threshold', () => {
    // balanced_reduction: threshold=1.5, maxThreshold=3.0
    // At 2.25 (midpoint): intensity should be ~0.5
    const result = computeAutopilotParameters(2.25, 1.0, balancedProfile, rates);
    expect(result.consolidationIntensity).toBeGreaterThan(0);
    expect(result.discretionaryMultiplier).toBeLessThan(1.0);
    expect(result.revenueMultiplier).toBeGreaterThan(1.0);
    expect(result.consolidationExplanation).toBeDefined();
    expect(result.consolidationExplanation).toContain('Fiscal consolidation active');
  });

  it('effective tax rates increase when consolidation raises revenue multiplier', () => {
    // High debt/GDP should produce revenueMultiplier > 1 → higher tax rates
    const result = computeAutopilotParameters(2.5, 1.0, balancedProfile, rates);
    expect(result.effectiveIncomeTaxRate).toBeGreaterThan(rates.income);
    expect(result.effectivePayrollTaxRate).toBeGreaterThan(rates.payroll);
    expect(result.effectiveCorporateTaxRate).toBeGreaterThan(rates.corporate);
    expect(result.effectiveCapitalGainsTaxRate).toBeGreaterThan(rates.capitalGains);
  });

  it('effective tax rates equal baseline × revenue multiplier', () => {
    const result = computeAutopilotParameters(2.5, 1.0, balancedProfile, rates);
    const rm = result.revenueMultiplier;
    expect(result.effectiveIncomeTaxRate).toBeCloseTo(rates.income * rm, 10);
    expect(result.effectivePayrollTaxRate).toBeCloseTo(rates.payroll * rm, 10);
    expect(result.effectiveCorporateTaxRate).toBeCloseTo(rates.corporate * rm, 10);
    expect(result.effectiveCapitalGainsTaxRate).toBeCloseTo(rates.capitalGains * rm, 10);
  });

  it('engages COLA dampening when CIF exceeds profile threshold', () => {
    // balanced_reduction: colaDampeningThreshold=2.0, colaDampeningMaxCIF=5.0, rate=0.20
    const result = computeAutopilotParameters(0.8, 3.5, balancedProfile, rates);
    expect(result.colaDampeningFactor).toBeLessThan(1.0);
    expect(result.colaExplanation).toBeDefined();
    expect(result.colaExplanation).toContain('COLA dampened');
  });

  it('no COLA dampening when CIF is below threshold', () => {
    const result = computeAutopilotParameters(0.8, 1.5, balancedProfile, rates);
    expect(result.colaDampeningFactor).toBe(1.0);
    expect(result.colaExplanation).toBeUndefined();
  });

  it('COLA dampening at max CIF produces minimum factor', () => {
    // At CIF >= colaDampeningMaxCIF, dampenIntensity=1.0 → factor = 1 - 1*rate = 1 - 0.20 = 0.80
    const result = computeAutopilotParameters(0.8, 6.0, balancedProfile, rates);
    expect(result.colaDampeningFactor).toBeCloseTo(1.0 - balancedProfile.colaDampeningRate, 10);
  });

  it('different profiles produce different consolidation thresholds', () => {
    // austerity: threshold=1.2 → should activate at 1.3
    // gridlock: threshold=2.5 → should NOT activate at 1.3
    const austerity = resolveCombinedProfile('austerity', DEFAULT_FEDERAL_RESERVE_PRESET);
    const gridlock = resolveCombinedProfile('gridlock', DEFAULT_FEDERAL_RESERVE_PRESET);

    const austerityResult = computeAutopilotParameters(1.3, 1.0, austerity, rates);
    const gridlockResult = computeAutopilotParameters(1.3, 1.0, gridlock, rates);

    expect(austerityResult.consolidationIntensity).toBeGreaterThan(0);
    expect(gridlockResult.consolidationIntensity).toBe(0);
  });
});
