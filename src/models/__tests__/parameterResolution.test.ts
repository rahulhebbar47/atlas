/**
 * Phase 8b: Parameter Resolution Tests
 *
 * Tests the three-layer resolution system:
 *   baseline → autopilot → user override
 */

import { describe, it, expect } from 'vitest';
import { resolveParameter, resolveAllParameters, defaultTokenUsageMultiplier } from '@/models/parameterResolution';
import { DEFAULT_TOKEN_USAGE_SCHEDULE } from '@/models/constants';
import type { UserOverrideMap, AutopilotResult } from '@/types/parameterTimeline';
import type { SimulationConfig } from '@/types';
import { getDefaultSimulationConfig } from '@/models/simulation';

// ============================================================
// resolveParameter
// ============================================================

describe('resolveParameter', () => {
  const emptyOverrides: UserOverrideMap = new Map();

  it('returns baseline when autopilot equals baseline', () => {
    const result = resolveParameter('testParam', 2030, 0.10, 0.10, emptyOverrides);
    expect(result.effective).toBe(0.10);
    expect(result.source).toBe('baseline');
    expect(result.userOverride).toBeUndefined();
  });

  it('returns autopilot when it differs from baseline', () => {
    const result = resolveParameter('testParam', 2030, 0.10, 0.15, emptyOverrides, 'Tax increase');
    expect(result.effective).toBe(0.15);
    expect(result.source).toBe('autopilot');
    expect(result.baseline).toBe(0.10);
    expect(result.autopilot).toBe(0.15);
    expect(result.explanation).toBe('Tax increase');
  });

  it('returns override when present at exact year', () => {
    const overrides: UserOverrideMap = new Map([
      ['testParam:2030', 0.22],
    ]);
    const result = resolveParameter('testParam', 2030, 0.10, 0.15, overrides);
    expect(result.effective).toBe(0.22);
    expect(result.source).toBe('override');
    expect(result.userOverride).toBe(0.22);
  });

  it('sticky override: applies to years after the set year', () => {
    const overrides: UserOverrideMap = new Map([
      ['testParam:2035', 0.22],
    ]);
    // Year 2040 should use the 2035 override (sticky forward)
    const result = resolveParameter('testParam', 2040, 0.10, 0.15, overrides);
    expect(result.effective).toBe(0.22);
    expect(result.source).toBe('override');
  });

  it('sticky override: does NOT apply to years before the set year', () => {
    const overrides: UserOverrideMap = new Map([
      ['testParam:2035', 0.22],
    ]);
    // Year 2030 should NOT use the 2035 override
    const result = resolveParameter('testParam', 2030, 0.10, 0.15, overrides);
    expect(result.effective).toBe(0.15);
    expect(result.source).toBe('autopilot');
  });

  it('later override supersedes earlier override', () => {
    const overrides: UserOverrideMap = new Map([
      ['testParam:2035', 0.22],
      ['testParam:2040', 0.30],
    ]);
    // At 2037, the 2035 override applies
    expect(resolveParameter('testParam', 2037, 0.10, 0.15, overrides).effective).toBe(0.22);
    // At 2040, the 2040 override supersedes
    expect(resolveParameter('testParam', 2040, 0.10, 0.15, overrides).effective).toBe(0.30);
    // At 2045, the 2040 override still applies (sticky)
    expect(resolveParameter('testParam', 2045, 0.10, 0.15, overrides).effective).toBe(0.30);
  });

  it('override for different param key does not affect this param', () => {
    const overrides: UserOverrideMap = new Map([
      ['otherParam:2030', 0.99],
    ]);
    const result = resolveParameter('testParam', 2030, 0.10, 0.15, overrides);
    expect(result.effective).toBe(0.15);
    expect(result.source).toBe('autopilot');
  });

  it('handles floating point near-equality for baseline vs autopilot', () => {
    // Difference smaller than 1e-10 should be treated as equal
    const result = resolveParameter('testParam', 2030, 0.10, 0.10 + 1e-12, emptyOverrides);
    expect(result.source).toBe('baseline');
  });
});

// ============================================================
// defaultTokenUsageMultiplier
// ============================================================

describe('defaultTokenUsageMultiplier', () => {
  const startYear = 2025;

  it('follows the spike-and-recover schedule by default', () => {
    // Schedule [1, 20, 25, 15, 5, 1] indexed by offset from the start year.
    expect(defaultTokenUsageMultiplier(2025, startYear)).toBe(1);
    expect(defaultTokenUsageMultiplier(2026, startYear)).toBe(20);
    expect(defaultTokenUsageMultiplier(2027, startYear)).toBe(25);
    expect(defaultTokenUsageMultiplier(2028, startYear)).toBe(15);
    expect(defaultTokenUsageMultiplier(2029, startYear)).toBe(5);
    expect(defaultTokenUsageMultiplier(2030, startYear)).toBe(1);
  });

  it('holds the last scheduled value for years past the schedule (2031+)', () => {
    const last = DEFAULT_TOKEN_USAGE_SCHEDULE[DEFAULT_TOKEN_USAGE_SCHEDULE.length - 1];
    expect(defaultTokenUsageMultiplier(2031, startYear)).toBe(last);
    expect(defaultTokenUsageMultiplier(2040, startYear)).toBe(last);
    expect(defaultTokenUsageMultiplier(2050, startYear)).toBe(1);
  });

  it('bypasses the schedule with a flat override (start year stays 1×)', () => {
    expect(defaultTokenUsageMultiplier(2025, startYear, 50)).toBe(1);
    expect(defaultTokenUsageMultiplier(2026, startYear, 50)).toBe(50);
    expect(defaultTokenUsageMultiplier(2030, startYear, 50)).toBe(50);
  });

  it('clamps years before the start to the start-year value', () => {
    expect(defaultTokenUsageMultiplier(2024, startYear)).toBe(1);
  });
});

// ============================================================
// resolveAllParameters
// ============================================================

describe('resolveAllParameters', () => {
  const defaultConfig = getDefaultSimulationConfig();
  const emptyOverrides: UserOverrideMap = new Map();

  const baselineAutopilot: AutopilotResult = {
    discretionaryMultiplier: 1.0,
    obligationMultiplier: 1.0,
    revenueMultiplier: 1.0,
    consolidationIntensity: 0,
    colaDampeningFactor: 1.0,
    effectiveIncomeTaxRate: defaultConfig.taxConfig?.incomeTaxRate ?? 0.12,
    effectivePayrollTaxRate: defaultConfig.taxConfig?.payrollTaxRate ?? 0.14,
    effectiveCorporateTaxRate: defaultConfig.taxConfig?.corporateTaxRate ?? 0.16,
    effectiveCapitalGainsTaxRate: defaultConfig.taxConfig?.capitalGainsTaxRate ?? 0.17,
    qeMonetizationRate: 0.15,
    maxFinancialRepressionRate: 0.50,
    taylorInflationCoeff: 1.5,
    taylorOutputGapCoeff: 0.5,
    taylorEmploymentGapCoeff: 0.3,
    // Phase 9: Supply chain fields
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

  it('resolves 23 parameters for a year', () => {
    const result = resolveAllParameters(
      2030, defaultConfig, baselineAutopilot, emptyOverrides,
      'balanced_reduction', { generative: 0.5, agentic: 0.3, embodied: 0.1 },
    );

    expect(result.year).toBe(2030);
    expect(result.profileName).toBe('balanced_reduction');

    // All 23 fields should exist
    expect(result.fiscalDiscretionaryMultiplier).toBeDefined();
    expect(result.fiscalObligationMultiplier).toBeDefined();
    expect(result.fiscalRevenueMultiplier).toBeDefined();
    expect(result.effectiveColaDampeningFactor).toBeDefined();
    expect(result.consolidationIntensity).toBeDefined();
    expect(result.effectiveIncomeTaxRate).toBeDefined();
    expect(result.effectivePayrollTaxRate).toBeDefined();
    expect(result.effectiveCorporateTaxRate).toBeDefined();
    expect(result.effectiveCapitalGainsTaxRate).toBeDefined();
    expect(result.qeMonetizationRate).toBeDefined();
    expect(result.maxFinancialRepressionRate).toBeDefined();
    expect(result.ubiEnabled).toBeDefined();
    expect(result.ubiMonthlyAmount).toBeDefined();
    expect(result.wageSubsidyEnabled).toBeDefined();
    expect(result.wageSubsidyPercentage).toBeDefined();
    expect(result.swfEnabled).toBeDefined();
    expect(result.equityEnabled).toBeDefined();
    expect(result.generativeCapabilityLevel).toBeDefined();
    expect(result.agenticCapabilityLevel).toBeDefined();
    expect(result.embodiedCapabilityLevel).toBeDefined();
    expect(result.taylorInflationCoeff).toBeDefined();
    expect(result.taylorOutputGapCoeff).toBeDefined();
    expect(result.taylorEmploymentGapCoeff).toBeDefined();
  });

  it('all parameters have baseline source when autopilot matches baseline', () => {
    const result = resolveAllParameters(
      2025, defaultConfig, baselineAutopilot, emptyOverrides,
      'balanced_reduction', { generative: 0.1, agentic: 0.05, embodied: 0.01 },
    );

    // Fiscal parameters should be baseline (no consolidation)
    expect(result.fiscalDiscretionaryMultiplier.source).toBe('baseline');
    expect(result.consolidationIntensity.source).toBe('baseline');
    expect(result.effectiveColaDampeningFactor.source).toBe('baseline');
  });

  it('technology parameters are always baseline source (read-only)', () => {
    const result = resolveAllParameters(
      2030, defaultConfig, baselineAutopilot, emptyOverrides,
      'balanced_reduction', { generative: 0.5, agentic: 0.3, embodied: 0.1 },
    );

    expect(result.generativeCapabilityLevel.effective).toBe(0.5);
    expect(result.generativeCapabilityLevel.source).toBe('baseline');
    expect(result.agenticCapabilityLevel.effective).toBe(0.3);
    expect(result.embodiedCapabilityLevel.effective).toBe(0.1);
  });
});
