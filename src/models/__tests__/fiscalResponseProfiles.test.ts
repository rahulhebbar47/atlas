/**
 * Tests for Phase 8a → Phase 8 Fix 4: Split Fiscal Response Profiles
 *
 * Tests the independent FiscalPolicyProfile and FederalReserveProfile systems,
 * plus the combined FiscalResponseProfile resolution and fiscal consolidation.
 */

import { describe, it, expect } from 'vitest';
import {
  FISCAL_POLICY_PRESETS,
  FEDERAL_RESERVE_PRESETS,
  DEFAULT_FISCAL_POLICY_PRESET,
  DEFAULT_FEDERAL_RESERVE_PRESET,
  resolveCombinedProfile,
  type FiscalPolicyProfile,
  type FederalReserveProfile,
  type FiscalResponseProfile,
} from '../fiscalResponseProfiles';
import { computeFiscalConsolidation } from '../fiscal';

// ============================================================
// 1. Fiscal Policy Preset Tests
// ============================================================

describe('FiscalPolicyProfile presets', () => {
  const presetNames = Object.keys(FISCAL_POLICY_PRESETS);
  const REQUIRED_FIELDS: (keyof FiscalPolicyProfile)[] = [
    'name', 'description',
    'maxDiscretionaryCut', 'maxObligationCut', 'maxRevenueIncrease',
    'colaDampeningRate', 'colaDampeningThreshold', 'colaDampeningMaxCIF',
    'consolidationThreshold', 'consolidationMaxThreshold', 'consolidationLag',
  ];

  it('has exactly 5 presets', () => {
    expect(presetNames.length).toBe(5);
  });

  it('includes all expected preset names', () => {
    const expected = [
      'austerity', 'tax_the_winners', 'balanced_reduction',
      'gridlock', 'no_fiscal_response',
    ];
    for (const name of expected) {
      expect(presetNames).toContain(name);
    }
  });

  it('default preset is balanced_reduction', () => {
    expect(DEFAULT_FISCAL_POLICY_PRESET).toBe('balanced_reduction');
  });

  it.each(presetNames)('preset "%s" has all 11 required fields', (name) => {
    const preset = FISCAL_POLICY_PRESETS[name]!;
    for (const field of REQUIRED_FIELDS) {
      expect(preset[field]).toBeDefined();
    }
  });

  it.each(presetNames)('preset "%s" has valid numeric ranges', (name) => {
    const p = FISCAL_POLICY_PRESETS[name]!;
    expect(p.maxDiscretionaryCut).toBeGreaterThanOrEqual(0);
    expect(p.maxDiscretionaryCut).toBeLessThanOrEqual(0.50);
    expect(p.maxObligationCut).toBeGreaterThanOrEqual(0);
    expect(p.maxObligationCut).toBeLessThanOrEqual(0.20);
    expect(p.maxRevenueIncrease).toBeGreaterThanOrEqual(0);
    expect(p.maxRevenueIncrease).toBeLessThanOrEqual(0.30);
    expect(p.colaDampeningRate).toBeGreaterThanOrEqual(0);
    expect(p.colaDampeningRate).toBeLessThanOrEqual(1.0);
    expect(p.consolidationThreshold).toBeGreaterThan(0);
    expect(p.consolidationMaxThreshold).toBeGreaterThanOrEqual(p.consolidationThreshold);
    expect(p.consolidationLag).toBeGreaterThanOrEqual(0);
    expect(p.consolidationLag).toBeLessThanOrEqual(5);
  });

  it('austerity preset emphasizes spending cuts over taxes', () => {
    const austerity = FISCAL_POLICY_PRESETS.austerity!;
    expect(austerity.maxDiscretionaryCut).toBeGreaterThan(austerity.maxRevenueIncrease);
    expect(austerity.maxDiscretionaryCut).toBe(0.25);
    expect(austerity.maxRevenueIncrease).toBe(0.03);
  });

  it('tax_the_winners preset emphasizes revenue increases', () => {
    const tax = FISCAL_POLICY_PRESETS.tax_the_winners!;
    expect(tax.maxRevenueIncrease).toBeGreaterThan(tax.maxDiscretionaryCut);
    expect(tax.maxRevenueIncrease).toBe(0.18);
    expect(tax.colaDampeningRate).toBe(0.0); // protects safety net
  });

  it('no_fiscal_response has impossible thresholds', () => {
    const none = FISCAL_POLICY_PRESETS.no_fiscal_response!;
    expect(none.maxDiscretionaryCut).toBe(0);
    expect(none.maxObligationCut).toBe(0);
    expect(none.maxRevenueIncrease).toBe(0);
    expect(none.consolidationThreshold).toBeGreaterThan(100); // never triggers
  });
});

// ============================================================
// 2. Federal Reserve Preset Tests
// ============================================================

describe('FederalReserveProfile presets', () => {
  const presetNames = Object.keys(FEDERAL_RESERVE_PRESETS);
  const REQUIRED_FIELDS: (keyof FederalReserveProfile)[] = [
    'name', 'description',
    'taylorInflationCoeff', 'taylorOutputGapCoeff', 'taylorEmploymentGapCoeff',
    'qeMonetizationRate', 'maxFinancialRepressionRate',
    'yieldResponseThreshold', 'maxYieldResponseRate',
  ];

  it('has exactly 4 presets', () => {
    expect(presetNames.length).toBe(4);
  });

  it('includes all expected preset names', () => {
    const expected = [
      'price_stability', 'balanced_mandate',
      'employment_focused', 'maximum_accommodation',
    ];
    for (const name of expected) {
      expect(presetNames).toContain(name);
    }
  });

  it('default preset is balanced_mandate', () => {
    expect(DEFAULT_FEDERAL_RESERVE_PRESET).toBe('balanced_mandate');
  });

  it.each(presetNames)('preset "%s" has all 9 required fields', (name) => {
    const preset = FEDERAL_RESERVE_PRESETS[name]!;
    for (const field of REQUIRED_FIELDS) {
      expect(preset[field]).toBeDefined();
    }
  });

  it.each(presetNames)('preset "%s" has valid numeric ranges', (name) => {
    const p = FEDERAL_RESERVE_PRESETS[name]!;
    expect(p.taylorInflationCoeff).toBeGreaterThanOrEqual(0.5);
    expect(p.taylorInflationCoeff).toBeLessThanOrEqual(2.5);
    expect(p.taylorOutputGapCoeff).toBeGreaterThanOrEqual(0);
    expect(p.taylorOutputGapCoeff).toBeLessThanOrEqual(1.0);
    expect(p.taylorEmploymentGapCoeff).toBeGreaterThanOrEqual(0);
    expect(p.taylorEmploymentGapCoeff).toBeLessThanOrEqual(1.5);
    expect(p.qeMonetizationRate).toBeGreaterThanOrEqual(0);
    expect(p.qeMonetizationRate).toBeLessThanOrEqual(0.80);
    expect(p.maxFinancialRepressionRate).toBeGreaterThanOrEqual(0);
    expect(p.maxFinancialRepressionRate).toBeLessThanOrEqual(1.0);
    expect(p.yieldResponseThreshold).toBeGreaterThanOrEqual(0.04);
    expect(p.yieldResponseThreshold).toBeLessThanOrEqual(0.15);
    expect(p.maxYieldResponseRate).toBeGreaterThanOrEqual(0.40);
    expect(p.maxYieldResponseRate).toBeLessThanOrEqual(0.90);
  });

  it('price_stability is most hawkish on inflation', () => {
    const hawk = FEDERAL_RESERVE_PRESETS.price_stability!;
    const balanced = FEDERAL_RESERVE_PRESETS.balanced_mandate!;
    expect(hawk.taylorInflationCoeff).toBeGreaterThan(balanced.taylorInflationCoeff);
    expect(hawk.taylorEmploymentGapCoeff).toBe(0); // ignores employment
    expect(hawk.qeMonetizationRate).toBeLessThan(balanced.qeMonetizationRate);
  });

  it('maximum_accommodation is most dovish', () => {
    const dove = FEDERAL_RESERVE_PRESETS.maximum_accommodation!;
    const balanced = FEDERAL_RESERVE_PRESETS.balanced_mandate!;
    expect(dove.taylorEmploymentGapCoeff).toBeGreaterThan(balanced.taylorEmploymentGapCoeff);
    expect(dove.qeMonetizationRate).toBeGreaterThan(balanced.qeMonetizationRate);
    expect(dove.maxFinancialRepressionRate).toBeGreaterThan(balanced.maxFinancialRepressionRate);
  });

  it('balanced_mandate has standard Taylor Rule coefficients', () => {
    const balanced = FEDERAL_RESERVE_PRESETS.balanced_mandate!;
    expect(balanced.taylorInflationCoeff).toBe(1.5); // Taylor (1993)
    expect(balanced.taylorOutputGapCoeff).toBe(0.5);
    expect(balanced.taylorEmploymentGapCoeff).toBe(0.5);
  });
});

// ============================================================
// 3. Combined Profile Resolution Tests
// ============================================================

describe('resolveCombinedProfile', () => {
  it('returns default combination for no arguments', () => {
    const profile = resolveCombinedProfile(
      DEFAULT_FISCAL_POLICY_PRESET,
      DEFAULT_FEDERAL_RESERVE_PRESET,
    );
    expect(profile.name).toBe('Balanced Deficit Reduction + Balanced Mandate');
    expect(profile.maxDiscretionaryCut).toBe(0.15); // from balanced_reduction
    expect(profile.taylorInflationCoeff).toBe(1.5); // from balanced_mandate
  });

  it('combines austerity + price_stability correctly', () => {
    const profile = resolveCombinedProfile('austerity', 'price_stability');
    expect(profile.name).toBe('Austerity + Price Stability First');
    // Fiscal fields
    expect(profile.maxDiscretionaryCut).toBe(0.25);
    expect(profile.maxRevenueIncrease).toBe(0.03);
    expect(profile.consolidationThreshold).toBe(1.2);
    // Fed fields
    expect(profile.taylorInflationCoeff).toBe(2.0);
    expect(profile.qeMonetizationRate).toBe(0.10);
    expect(profile.taylorEmploymentGapCoeff).toBe(0.0);
  });

  it('combines tax_the_winners + maximum_accommodation correctly', () => {
    const profile = resolveCombinedProfile('tax_the_winners', 'maximum_accommodation');
    expect(profile.name).toBe('Tax the Winners + Maximum Accommodation');
    // Fiscal fields
    expect(profile.maxRevenueIncrease).toBe(0.18);
    expect(profile.colaDampeningRate).toBe(0.0);
    // Fed fields
    expect(profile.taylorEmploymentGapCoeff).toBe(1.2);
    expect(profile.qeMonetizationRate).toBe(0.40);
  });

  it('falls back to defaults for unknown preset names', () => {
    const profile = resolveCombinedProfile('nonexistent_fiscal', 'nonexistent_fed');
    expect(profile.name).toBe('Balanced Deficit Reduction + Balanced Mandate');
    expect(profile.maxDiscretionaryCut).toBe(0.15);
    expect(profile.taylorInflationCoeff).toBe(1.5);
  });

  it('merges fiscal custom overrides correctly', () => {
    const profile = resolveCombinedProfile(
      'austerity',
      'balanced_mandate',
      { maxDiscretionaryCut: 0.30, consolidationLag: 0 },
    );
    expect(profile.maxDiscretionaryCut).toBe(0.30); // overridden
    expect(profile.maxObligationCut).toBe(0.08); // unchanged from austerity
    expect(profile.consolidationLag).toBe(0); // overridden
    expect(profile.taylorInflationCoeff).toBe(1.5); // unchanged from balanced_mandate
  });

  it('merges Fed custom overrides correctly', () => {
    const profile = resolveCombinedProfile(
      'balanced_reduction',
      'price_stability',
      undefined,
      { taylorInflationCoeff: 2.5, qeMonetizationRate: 0.05 },
    );
    expect(profile.taylorInflationCoeff).toBe(2.5); // overridden
    expect(profile.taylorEmploymentGapCoeff).toBe(0.0); // unchanged from price_stability
    expect(profile.qeMonetizationRate).toBe(0.05); // overridden
    expect(profile.maxDiscretionaryCut).toBe(0.15); // unchanged from balanced_reduction
  });

  it('merges both fiscal and Fed custom overrides', () => {
    const profile = resolveCombinedProfile(
      'gridlock',
      'employment_focused',
      { maxDiscretionaryCut: 0.10, consolidationThreshold: 2.0 },
      { taylorEmploymentGapCoeff: 1.0, maxFinancialRepressionRate: 0.70 },
    );
    expect(profile.maxDiscretionaryCut).toBe(0.10); // fiscal override
    expect(profile.consolidationThreshold).toBe(2.0); // fiscal override
    expect(profile.maxObligationCut).toBe(0.01); // unchanged from gridlock
    expect(profile.taylorEmploymentGapCoeff).toBe(1.0); // Fed override
    expect(profile.maxFinancialRepressionRate).toBe(0.70); // Fed override
    expect(profile.taylorInflationCoeff).toBe(1.0); // unchanged from employment_focused
  });

  it('returns a copy, not a reference to the presets', () => {
    const profile = resolveCombinedProfile('balanced_reduction', 'balanced_mandate');
    profile.maxDiscretionaryCut = 999;
    profile.taylorInflationCoeff = 999;
    const fresh = resolveCombinedProfile('balanced_reduction', 'balanced_mandate');
    expect(fresh.maxDiscretionaryCut).toBe(0.15);
    expect(fresh.taylorInflationCoeff).toBe(1.5);
  });

  it('combined profile has all fields from both sub-interfaces', () => {
    const profile = resolveCombinedProfile('balanced_reduction', 'balanced_mandate');
    // Fiscal fields
    expect(profile.maxDiscretionaryCut).toBeDefined();
    expect(profile.maxObligationCut).toBeDefined();
    expect(profile.maxRevenueIncrease).toBeDefined();
    expect(profile.colaDampeningRate).toBeDefined();
    expect(profile.consolidationThreshold).toBeDefined();
    // Fed fields
    expect(profile.taylorInflationCoeff).toBeDefined();
    expect(profile.taylorOutputGapCoeff).toBeDefined();
    expect(profile.taylorEmploymentGapCoeff).toBeDefined();
    expect(profile.qeMonetizationRate).toBeDefined();
    expect(profile.maxFinancialRepressionRate).toBeDefined();
    expect(profile.yieldResponseThreshold).toBeDefined();
    expect(profile.maxYieldResponseRate).toBeDefined();
  });
});

// ============================================================
// 4. Fiscal Consolidation Tests
// ============================================================

describe('computeFiscalConsolidation', () => {
  const profile = resolveCombinedProfile('balanced_reduction', 'balanced_mandate');
  // balanced_reduction: threshold=1.5, maxThreshold=3.0

  it('returns identity multipliers below threshold', () => {
    const result = computeFiscalConsolidation(1.0, profile);
    expect(result.consolidationIntensity).toBe(0);
    expect(result.discretionaryMultiplier).toBe(1.0);
    expect(result.obligationMultiplier).toBe(1.0);
    expect(result.revenueMultiplier).toBe(1.0);
  });

  it('returns identity at exactly the threshold', () => {
    const result = computeFiscalConsolidation(1.5, profile);
    expect(result.consolidationIntensity).toBe(0);
    expect(result.discretionaryMultiplier).toBe(1.0);
  });

  it('returns partial consolidation between threshold and max', () => {
    // midpoint: (1.5 + 3.0) / 2 = 2.25
    const result = computeFiscalConsolidation(2.25, profile);
    // intensity = (2.25 - 1.5) / (3.0 - 1.5) = 0.75/1.5 = 0.5
    expect(result.consolidationIntensity).toBeCloseTo(0.5, 5);
    // discretionary: 1 - 0.5 × 0.15 = 0.925
    expect(result.discretionaryMultiplier).toBeCloseTo(0.925, 5);
    // obligation: 1 - 0.5 × 0.05 = 0.975
    expect(result.obligationMultiplier).toBeCloseTo(0.975, 5);
    // revenue: 1 + 0.5 × 0.08 = 1.04
    expect(result.revenueMultiplier).toBeCloseTo(1.04, 5);
  });

  it('caps at full intensity above maxThreshold', () => {
    const result = computeFiscalConsolidation(5.0, profile);
    expect(result.consolidationIntensity).toBe(1);
    // discretionary: 1 - 1 × 0.15 = 0.85
    expect(result.discretionaryMultiplier).toBeCloseTo(0.85, 5);
    // obligation: 1 - 1 × 0.05 = 0.95
    expect(result.obligationMultiplier).toBeCloseTo(0.95, 5);
    // revenue: 1 + 1 × 0.08 = 1.08
    expect(result.revenueMultiplier).toBeCloseTo(1.08, 5);
  });

  it('austerity applies deeper cuts', () => {
    const austerity = resolveCombinedProfile('austerity', 'balanced_mandate');
    const result = computeFiscalConsolidation(5.0, austerity);
    expect(result.consolidationIntensity).toBe(1);
    // discretionary: 1 - 1 × 0.25 = 0.75
    expect(result.discretionaryMultiplier).toBeCloseTo(0.75, 5);
    // obligation: 1 - 1 × 0.08 = 0.92
    expect(result.obligationMultiplier).toBeCloseTo(0.92, 5);
    // revenue: 1 + 1 × 0.03 = 1.03 (minimal tax increase)
    expect(result.revenueMultiplier).toBeCloseTo(1.03, 5);
  });

  it('tax_the_winners applies deeper tax increases', () => {
    const tax = resolveCombinedProfile('tax_the_winners', 'balanced_mandate');
    const result = computeFiscalConsolidation(5.0, tax);
    expect(result.consolidationIntensity).toBe(1);
    // discretionary: 1 - 1 × 0.05 = 0.95 (minimal spending cuts)
    expect(result.discretionaryMultiplier).toBeCloseTo(0.95, 5);
    // obligation: 1 - 1 × 0.02 = 0.98 (minimal entitlement cuts)
    expect(result.obligationMultiplier).toBeCloseTo(0.98, 5);
    // revenue: 1 + 1 × 0.18 = 1.18 (aggressive tax increase)
    expect(result.revenueMultiplier).toBeCloseTo(1.18, 5);
  });

  it('no_fiscal_response returns identity at any debt level', () => {
    const noResp = resolveCombinedProfile('no_fiscal_response', 'balanced_mandate');
    const result = computeFiscalConsolidation(100, noResp);
    // threshold=999 so debtGDP=100 is below it
    expect(result.consolidationIntensity).toBe(0);
    expect(result.discretionaryMultiplier).toBe(1.0);
    expect(result.obligationMultiplier).toBe(1.0);
    expect(result.revenueMultiplier).toBe(1.0);
  });

  it('gridlock triggers consolidation at very high debt levels', () => {
    const gridlock = resolveCombinedProfile('gridlock', 'balanced_mandate');
    // gridlock: threshold=2.5, maxThreshold=5.0
    const result = computeFiscalConsolidation(3.75, gridlock); // midpoint
    // intensity = (3.75 - 2.5) / (5.0 - 2.5) = 1.25/2.5 = 0.5
    expect(result.consolidationIntensity).toBeCloseTo(0.5, 5);
    // discretionary: 1 - 0.5 × 0.05 = 0.975 (weak response)
    expect(result.discretionaryMultiplier).toBeCloseTo(0.975, 5);
  });

  it('Fed preset does not affect fiscal consolidation output', () => {
    // Same fiscal preset, different Fed presets should produce identical consolidation
    const hawkish = resolveCombinedProfile('balanced_reduction', 'price_stability');
    const dovish = resolveCombinedProfile('balanced_reduction', 'maximum_accommodation');
    const resultHawk = computeFiscalConsolidation(2.5, hawkish);
    const resultDove = computeFiscalConsolidation(2.5, dovish);
    expect(resultHawk.consolidationIntensity).toBe(resultDove.consolidationIntensity);
    expect(resultHawk.discretionaryMultiplier).toBe(resultDove.discretionaryMultiplier);
    expect(resultHawk.obligationMultiplier).toBe(resultDove.obligationMultiplier);
    expect(resultHawk.revenueMultiplier).toBe(resultDove.revenueMultiplier);
  });
});
