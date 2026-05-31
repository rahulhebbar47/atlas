/**
 * ATLAS Store Tests — Phase 8c Fiscal Response Actions
 *
 * Tests the new store actions added for Phase 8c:
 *   - setFiscalPolicyPreset (Phase 8 Fix 4: renamed from setFiscalResponsePreset)
 *   - setFiscalDimension
 *   - toggleBaselineComparison
 *   - resetYearOverrides
 *   - clearParameterOverrides
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSimulationStore } from '@/stores/simulationStore';
import { FISCAL_POLICY_PRESETS } from '@/models/fiscalResponseProfiles';

// ============================================================
// Helpers
// ============================================================

function resetStore() {
  useSimulationStore.getState().resetToDefaults();
}

function getState() {
  return useSimulationStore.getState();
}

// ============================================================
// setFiscalPolicyPreset (Phase 8 Fix 4: renamed from setFiscalResponsePreset)
// ============================================================

describe('setFiscalPolicyPreset', () => {
  beforeEach(resetStore);

  it('sets the fiscal policy preset to the given preset', () => {
    getState().setFiscalPolicyPreset('austerity');
    expect(getState().config.fiscalPolicyPreset).toBe('austerity');
  });

  it('clears custom overrides when switching to a named preset', () => {
    // First set a custom profile
    getState().setFiscalDimension('spendingRevenue', 4);
    expect(getState().config.fiscalPolicyPreset).toBe('custom');
    expect(getState().config.fiscalPolicyCustom).toBeDefined();

    // Switch to a named preset
    getState().setFiscalPolicyPreset('balanced_reduction');
    expect(getState().config.fiscalPolicyPreset).toBe('balanced_reduction');
    expect(getState().config.fiscalPolicyCustom).toBeUndefined();
  });

  it('triggers simulation recompute', () => {
    const timelineBefore = getState().timeline;
    getState().setFiscalPolicyPreset('no_fiscal_response');
    const timelineAfter = getState().timeline;
    // Timeline reference changes on recompute
    expect(timelineAfter).not.toBe(timelineBefore);
  });

  it('different presets produce different simulation results', () => {
    getState().setFiscalPolicyPreset('balanced_reduction');
    const yearsB = getState().timeline.years;
    const gdpBalanced = yearsB[yearsB.length - 1]!.macro.gdpReal;

    getState().setFiscalPolicyPreset('no_fiscal_response');
    const yearsN = getState().timeline.years;
    const gdpNoAdj = yearsN[yearsN.length - 1]!.macro.gdpReal;

    // no_fiscal_response produces different end-state GDP
    expect(gdpBalanced).not.toBe(gdpNoAdj);
  });
});

// ============================================================
// setFiscalDimension
// ============================================================

describe('setFiscalDimension', () => {
  beforeEach(resetStore);

  it('switches profile to "custom"', () => {
    getState().setFiscalDimension('spendingRevenue', 4);
    expect(getState().config.fiscalPolicyPreset).toBe('custom');
  });

  it('sets custom fiscal policy fields', () => {
    getState().setFiscalDimension('spendingRevenue', 4); // All Revenue
    const custom = getState().config.fiscalPolicyCustom;
    expect(custom).toBeDefined();
    // All Revenue: maxRevenueIncrease=0.25, maxDiscretionaryCut=0.02
    expect(custom!.maxRevenueIncrease).toBe(0.25);
    expect(custom!.maxDiscretionaryCut).toBe(0.02);
  });

  it('preserves other dimensions when changing one', () => {
    // Change spending to All Revenue
    getState().setFiscalDimension('spendingRevenue', 4);
    const custom1 = { ...getState().config.fiscalPolicyCustom! };

    // Now change safety net to Budget Priority (position 2)
    getState().setFiscalDimension('safetyNet', 2);
    const custom2 = getState().config.fiscalPolicyCustom!;

    // Spending fields should still be All Revenue values
    expect(custom2.maxRevenueIncrease).toBe(0.25);
    expect(custom2.maxDiscretionaryCut).toBe(0.02);

    // Safety net fields should be Budget Priority values (position 2)
    expect(custom2.colaDampeningRate).toBe(0.40);
    expect(custom2.colaDampeningThreshold).toBe(1.5);
  });

  it('triggers simulation recompute', () => {
    const timelineBefore = getState().timeline;
    getState().setFiscalDimension('adjustmentSpeed', 3); // Gridlock
    const timelineAfter = getState().timeline;
    expect(timelineAfter).not.toBe(timelineBefore);
  });
});

// ============================================================
// toggleBaselineComparison
// ============================================================

describe('toggleBaselineComparison', () => {
  beforeEach(resetStore);

  it('starts with comparison off', () => {
    expect(getState().showBaselineComparison).toBe(false);
    expect(getState().baselineTimeline).toBeNull();
  });

  it('toggle ON creates baseline timeline', () => {
    getState().toggleBaselineComparison();
    expect(getState().showBaselineComparison).toBe(true);
    expect(getState().baselineTimeline).not.toBeNull();
    expect(getState().baselineTimeline!.years.length).toBeGreaterThan(0);
  });

  it('toggle OFF clears baseline timeline', () => {
    getState().toggleBaselineComparison();
    expect(getState().baselineTimeline).not.toBeNull();

    getState().toggleBaselineComparison();
    expect(getState().showBaselineComparison).toBe(false);
    expect(getState().baselineTimeline).toBeNull();
  });

  it('baseline timeline has same number of years as main timeline', () => {
    getState().toggleBaselineComparison();
    const mainYears = getState().timeline.years.length;
    const baselineYears = getState().baselineTimeline!.years.length;
    expect(baselineYears).toBe(mainYears);
  });
});

// ============================================================
// resetYearOverrides
// ============================================================

describe('resetYearOverrides', () => {
  beforeEach(resetStore);

  it('removes all overrides for a specific year', () => {
    // Add overrides for 2030 and 2035
    getState().setParameterOverride('effectiveIncomeTaxRate', 2030, 0.20);
    getState().setParameterOverride('qeMonetizationRate', 2030, 0.30);
    getState().setParameterOverride('effectiveIncomeTaxRate', 2035, 0.25);

    expect(Object.keys(getState().parameterOverrides)).toHaveLength(3);

    // Reset only 2030
    getState().resetYearOverrides(2030);

    const remaining = getState().parameterOverrides;
    expect(Object.keys(remaining)).toHaveLength(1);
    expect(remaining['effectiveIncomeTaxRate:2035']).toBe(0.25);
    expect(remaining['effectiveIncomeTaxRate:2030']).toBeUndefined();
    expect(remaining['qeMonetizationRate:2030']).toBeUndefined();
  });

  it('is a no-op for years with no overrides', () => {
    getState().setParameterOverride('effectiveIncomeTaxRate', 2030, 0.20);
    const overridesBefore = { ...getState().parameterOverrides };

    getState().resetYearOverrides(2040);

    expect(getState().parameterOverrides).toEqual(overridesBefore);
  });
});

// ============================================================
// clearParameterOverrides
// ============================================================

describe('clearParameterOverrides', () => {
  beforeEach(resetStore);

  it('clears all overrides', () => {
    getState().setParameterOverride('effectiveIncomeTaxRate', 2030, 0.20);
    getState().setParameterOverride('qeMonetizationRate', 2035, 0.30);

    expect(Object.keys(getState().parameterOverrides).length).toBe(2);

    getState().clearParameterOverrides();

    expect(Object.keys(getState().parameterOverrides).length).toBe(0);
  });

  it('triggers recompute', () => {
    getState().setParameterOverride('effectiveIncomeTaxRate', 2030, 0.20);
    const timelineBefore = getState().timeline;

    getState().clearParameterOverrides();
    const timelineAfter = getState().timeline;

    expect(timelineAfter).not.toBe(timelineBefore);
  });
});

// ============================================================
// resetToDefaults clears Phase 8c state
// ============================================================

describe('resetToDefaults', () => {
  it('resets baseline comparison state', () => {
    getState().toggleBaselineComparison();
    expect(getState().showBaselineComparison).toBe(true);

    getState().resetToDefaults();
    expect(getState().showBaselineComparison).toBe(false);
    expect(getState().baselineTimeline).toBeNull();
  });

  it('resets parameter overrides', () => {
    getState().setParameterOverride('effectiveIncomeTaxRate', 2030, 0.20);
    expect(Object.keys(getState().parameterOverrides).length).toBe(1);

    getState().resetToDefaults();
    expect(Object.keys(getState().parameterOverrides).length).toBe(0);
  });
});
