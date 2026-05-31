/**
 * Tests for Phase 8c → Phase 8 Fix 4: Fiscal + Federal Reserve Dimension Mapping
 *
 * Verifies that:
 * - presetToDimensionPositions maps fiscal presets to correct positions (4 dimensions)
 * - fedPresetToDimensionPositions maps Fed presets to correct positions (2 dimensions)
 * - dimensionPositionsToProfileFields round-trips correctly
 * - Each dimension position produces valid field values
 */

import { describe, it, expect } from 'vitest';
import {
  FISCAL_DIMENSIONS,
  FED_DIMENSIONS,
  presetToDimensionPositions,
  dimensionPositionsToProfileFields,
  getDefaultDimensionPositions,
  fedPresetToDimensionPositions,
  fedDimensionPositionsToProfileFields,
  getDefaultFedDimensionPositions,
} from '../fiscalDimensions';
import {
  FISCAL_POLICY_PRESETS,
  FEDERAL_RESERVE_PRESETS,
  DEFAULT_FISCAL_POLICY_PRESET,
  DEFAULT_FEDERAL_RESERVE_PRESET,
  resolveCombinedProfile,
  type FiscalPolicyProfile,
  type FederalReserveProfile,
} from '../fiscalResponseProfiles';
import type { FiscalDimensionPositions, FedDimensionPositions } from '@/types/fiscalDimensions';

// ============================================================
// Dimension Structure Tests
// ============================================================

describe('FISCAL_DIMENSIONS structure', () => {
  it('has exactly 4 dimensions', () => {
    expect(FISCAL_DIMENSIONS).toHaveLength(4);
  });

  it('has expected dimension keys', () => {
    const keys = FISCAL_DIMENSIONS.map((d) => d.key);
    expect(keys).toContain('spendingRevenue');
    expect(keys).toContain('safetyNet');
    expect(keys).toContain('reactionTiming');
    expect(keys).toContain('adjustmentSpeed');
    // monetaryStance removed — moved to FED_DIMENSIONS
    expect(keys).not.toContain('monetaryStance');
  });

  it('each dimension has at least 3 options', () => {
    for (const dim of FISCAL_DIMENSIONS) {
      expect(dim.options.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('each option has sequential position indices starting at 0', () => {
    for (const dim of FISCAL_DIMENSIONS) {
      for (let i = 0; i < dim.options.length; i++) {
        expect(dim.options[i]!.position).toBe(i);
      }
    }
  });

  it('spendingRevenue has 5 positions', () => {
    const dim = FISCAL_DIMENSIONS.find((d) => d.key === 'spendingRevenue');
    expect(dim!.options).toHaveLength(5);
  });

  it('safetyNet has 3 positions', () => {
    const dim = FISCAL_DIMENSIONS.find((d) => d.key === 'safetyNet');
    expect(dim!.options).toHaveLength(3);
  });

  it('reactionTiming has 3 positions', () => {
    const dim = FISCAL_DIMENSIONS.find((d) => d.key === 'reactionTiming');
    expect(dim!.options).toHaveLength(3);
  });

  it('adjustmentSpeed has 4 positions', () => {
    const dim = FISCAL_DIMENSIONS.find((d) => d.key === 'adjustmentSpeed');
    expect(dim!.options).toHaveLength(4);
  });
});

describe('FED_DIMENSIONS structure', () => {
  it('has exactly 2 dimensions', () => {
    expect(FED_DIMENSIONS).toHaveLength(2);
  });

  it('has expected dimension keys', () => {
    const keys = FED_DIMENSIONS.map((d) => d.key);
    expect(keys).toContain('inflationVsEmployment');
    expect(keys).toContain('bondMarketOperations');
  });

  it('each dimension has at least 3 options', () => {
    for (const dim of FED_DIMENSIONS) {
      expect(dim.options.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('each option has sequential position indices starting at 0', () => {
    for (const dim of FED_DIMENSIONS) {
      for (let i = 0; i < dim.options.length; i++) {
        expect(dim.options[i]!.position).toBe(i);
      }
    }
  });

  it('inflationVsEmployment has 4 positions', () => {
    const dim = FED_DIMENSIONS.find((d) => d.key === 'inflationVsEmployment');
    expect(dim!.options).toHaveLength(4);
  });

  it('bondMarketOperations has 4 positions', () => {
    const dim = FED_DIMENSIONS.find((d) => d.key === 'bondMarketOperations');
    expect(dim!.options).toHaveLength(4);
  });
});

// ============================================================
// Preset-to-Position Mapping Tests
// ============================================================

describe('presetToDimensionPositions', () => {
  const presetNames = Object.keys(FISCAL_POLICY_PRESETS);

  it.each(presetNames)('maps preset "%s" to valid positions', (name) => {
    const profile = FISCAL_POLICY_PRESETS[name]!;
    const positions = presetToDimensionPositions(profile);

    // All 4 dimension keys present
    expect(positions).toHaveProperty('spendingRevenue');
    expect(positions).toHaveProperty('safetyNet');
    expect(positions).toHaveProperty('reactionTiming');
    expect(positions).toHaveProperty('adjustmentSpeed');
    // monetaryStance removed
    expect(positions).not.toHaveProperty('monetaryStance');

    // Each position is within valid range
    const srDim = FISCAL_DIMENSIONS.find((d) => d.key === 'spendingRevenue')!;
    const snDim = FISCAL_DIMENSIONS.find((d) => d.key === 'safetyNet')!;
    const rtDim = FISCAL_DIMENSIONS.find((d) => d.key === 'reactionTiming')!;
    const asDim = FISCAL_DIMENSIONS.find((d) => d.key === 'adjustmentSpeed')!;

    expect(positions.spendingRevenue).toBeGreaterThanOrEqual(0);
    expect(positions.spendingRevenue).toBeLessThan(srDim.options.length);
    expect(positions.safetyNet).toBeGreaterThanOrEqual(0);
    expect(positions.safetyNet).toBeLessThan(snDim.options.length);
    expect(positions.reactionTiming).toBeGreaterThanOrEqual(0);
    expect(positions.reactionTiming).toBeLessThan(rtDim.options.length);
    expect(positions.adjustmentSpeed).toBeGreaterThanOrEqual(0);
    expect(positions.adjustmentSpeed).toBeLessThan(asDim.options.length);
  });

  it('balanced_reduction maps to expected positions', () => {
    const profile = FISCAL_POLICY_PRESETS['balanced_reduction']!;
    const positions = presetToDimensionPositions(profile);

    // balanced_reduction: Balanced spending (pos 2),
    // Partial Erosion safety (pos 1), Standard timing (pos 1), 1-Year Lag (pos 1)
    expect(positions.spendingRevenue).toBe(2);  // Balanced
    expect(positions.safetyNet).toBe(1);         // Partial Erosion
    expect(positions.reactionTiming).toBe(1);    // Standard
    expect(positions.adjustmentSpeed).toBe(1);   // 1-Year Lag
  });

  it('austerity maps to expected positions', () => {
    const profile = FISCAL_POLICY_PRESETS['austerity']!;
    const positions = presetToDimensionPositions(profile);

    // austerity: heavy spending cuts
    expect(positions.spendingRevenue).toBe(1);   // Mostly Cuts
    expect(positions.adjustmentSpeed).toBe(1);   // 1-Year Lag
  });

  it('tax_the_winners maps to revenue-heavy side', () => {
    const profile = FISCAL_POLICY_PRESETS['tax_the_winners']!;
    const positions = presetToDimensionPositions(profile);

    // All Revenue side
    expect(positions.spendingRevenue).toBeGreaterThanOrEqual(3);
  });

  it('no_fiscal_response maps to gridlock', () => {
    const profile = FISCAL_POLICY_PRESETS['no_fiscal_response']!;
    const positions = presetToDimensionPositions(profile);

    // Full Protection (pos 0)
    expect(positions.safetyNet).toBe(0);
    // Late Response (pos 2) — consolidation threshold = 999
    expect(positions.reactionTiming).toBe(2);
  });
});

describe('fedPresetToDimensionPositions', () => {
  const presetNames = Object.keys(FEDERAL_RESERVE_PRESETS);

  it.each(presetNames)('maps preset "%s" to valid positions', (name) => {
    const profile = FEDERAL_RESERVE_PRESETS[name]!;
    const positions = fedPresetToDimensionPositions(profile);

    // All 2 dimension keys present
    expect(positions).toHaveProperty('inflationVsEmployment');
    expect(positions).toHaveProperty('bondMarketOperations');

    // Each position is within valid range
    const iveDim = FED_DIMENSIONS.find((d) => d.key === 'inflationVsEmployment')!;
    const bmoDim = FED_DIMENSIONS.find((d) => d.key === 'bondMarketOperations')!;

    expect(positions.inflationVsEmployment).toBeGreaterThanOrEqual(0);
    expect(positions.inflationVsEmployment).toBeLessThan(iveDim.options.length);
    expect(positions.bondMarketOperations).toBeGreaterThanOrEqual(0);
    expect(positions.bondMarketOperations).toBeLessThan(bmoDim.options.length);
  });

  it('balanced_mandate maps to expected positions', () => {
    const profile = FEDERAL_RESERVE_PRESETS['balanced_mandate']!;
    const positions = fedPresetToDimensionPositions(profile);

    // balanced_mandate: Balanced (pos 1), Standard Operations (pos 1)
    expect(positions.inflationVsEmployment).toBe(1);   // Balanced
    expect(positions.bondMarketOperations).toBe(1);    // Standard Operations
  });

  it('price_stability maps to hawkish positions', () => {
    const profile = FEDERAL_RESERVE_PRESETS['price_stability']!;
    const positions = fedPresetToDimensionPositions(profile);

    // price_stability: Price Stability (pos 0), Minimal Intervention (pos 0)
    expect(positions.inflationVsEmployment).toBe(0);
    expect(positions.bondMarketOperations).toBe(0);
  });

  it('maximum_accommodation maps to dovish positions', () => {
    const profile = FEDERAL_RESERVE_PRESETS['maximum_accommodation']!;
    const positions = fedPresetToDimensionPositions(profile);

    // maximum_accommodation: Employment-First (pos 3), Aggressive QE (pos 3)
    expect(positions.inflationVsEmployment).toBe(3);
    expect(positions.bondMarketOperations).toBe(3);
  });
});

// ============================================================
// Position-to-Fields Mapping Tests
// ============================================================

describe('dimensionPositionsToProfileFields', () => {
  it('produces valid field values for all-zero positions', () => {
    const positions: FiscalDimensionPositions = {
      spendingRevenue: 0,
      safetyNet: 0,
      reactionTiming: 0,
      adjustmentSpeed: 0,
    };
    const fields = dimensionPositionsToProfileFields(positions);

    // All Cuts: maxDiscretionaryCut=0.30, maxRevenueIncrease=0.00
    expect(fields.maxDiscretionaryCut).toBe(0.30);
    expect(fields.maxRevenueIncrease).toBe(0.00);

    // Full Protection: colaDampeningRate=0.00
    expect(fields.colaDampeningRate).toBe(0.00);

    // Early Response: consolidationThreshold=1.0
    expect(fields.consolidationThreshold).toBe(1.0);

    // Immediate: consolidationLag=0
    expect(fields.consolidationLag).toBe(0);

    // qeMonetizationRate removed — now in Fed profile
    expect(fields).not.toHaveProperty('qeMonetizationRate');
  });

  it('round-trip: positions → fields → preset → positions matches', () => {
    const profile = FISCAL_POLICY_PRESETS['balanced_reduction']!;
    const positions = presetToDimensionPositions(profile);
    const fields = dimensionPositionsToProfileFields(positions);

    // Create a synthetic profile with the round-tripped fields
    const reconstructed = { ...profile, ...fields } as FiscalPolicyProfile;
    const positionsAgain = presetToDimensionPositions(reconstructed);

    expect(positionsAgain).toEqual(positions);
  });

  it('contains all expected fiscal field keys (no monetary fields)', () => {
    const positions: FiscalDimensionPositions = {
      spendingRevenue: 2,
      safetyNet: 1,
      reactionTiming: 1,
      adjustmentSpeed: 1,
    };
    const fields = dimensionPositionsToProfileFields(positions);

    // Fiscal fields present
    expect(fields).toHaveProperty('maxDiscretionaryCut');
    expect(fields).toHaveProperty('maxObligationCut');
    expect(fields).toHaveProperty('maxRevenueIncrease');
    expect(fields).toHaveProperty('colaDampeningRate');
    expect(fields).toHaveProperty('colaDampeningThreshold');
    expect(fields).toHaveProperty('colaDampeningMaxCIF');
    expect(fields).toHaveProperty('consolidationThreshold');
    expect(fields).toHaveProperty('consolidationMaxThreshold');
    expect(fields).toHaveProperty('consolidationLag');

    // Monetary fields NOT present (moved to Fed)
    expect(fields).not.toHaveProperty('qeMonetizationRate');
    expect(fields).not.toHaveProperty('maxFinancialRepressionRate');
  });
});

describe('fedDimensionPositionsToProfileFields', () => {
  it('produces valid field values for all-zero positions', () => {
    const positions: FedDimensionPositions = {
      inflationVsEmployment: 0,
      bondMarketOperations: 0,
    };
    const fields = fedDimensionPositionsToProfileFields(positions);

    // Price Stability: taylorInflationCoeff=2.0, taylorOutputGapCoeff=0.5, taylorEmploymentGapCoeff=0.0
    expect(fields.taylorInflationCoeff).toBe(2.0);
    expect(fields.taylorOutputGapCoeff).toBe(0.5);
    expect(fields.taylorEmploymentGapCoeff).toBe(0.0);

    // Minimal Intervention: qeMonetizationRate=0.10
    expect(fields.qeMonetizationRate).toBe(0.10);
    expect(fields.maxFinancialRepressionRate).toBe(0.30);
  });

  it('round-trip: positions → fields → preset → positions matches', () => {
    const profile = FEDERAL_RESERVE_PRESETS['balanced_mandate']!;
    const positions = fedPresetToDimensionPositions(profile);
    const fields = fedDimensionPositionsToProfileFields(positions);

    // Create a synthetic profile with the round-tripped fields
    const reconstructed = { ...profile, ...fields } as FederalReserveProfile;
    const positionsAgain = fedPresetToDimensionPositions(reconstructed);

    expect(positionsAgain).toEqual(positions);
  });

  it('contains all expected Fed field keys (no fiscal fields)', () => {
    const positions: FedDimensionPositions = {
      inflationVsEmployment: 1,
      bondMarketOperations: 1,
    };
    const fields = fedDimensionPositionsToProfileFields(positions);

    // Fed fields present
    expect(fields).toHaveProperty('taylorInflationCoeff');
    expect(fields).toHaveProperty('taylorOutputGapCoeff');
    expect(fields).toHaveProperty('taylorEmploymentGapCoeff');
    expect(fields).toHaveProperty('qeMonetizationRate');
    expect(fields).toHaveProperty('maxFinancialRepressionRate');
    expect(fields).toHaveProperty('yieldResponseThreshold');
    expect(fields).toHaveProperty('maxYieldResponseRate');

    // Fiscal fields NOT present
    expect(fields).not.toHaveProperty('maxDiscretionaryCut');
    expect(fields).not.toHaveProperty('consolidationThreshold');
  });
});

// ============================================================
// Default Positions
// ============================================================

describe('getDefaultDimensionPositions', () => {
  it('returns positions matching balanced_reduction preset', () => {
    const defaultPositions = getDefaultDimensionPositions();
    const profile = FISCAL_POLICY_PRESETS[DEFAULT_FISCAL_POLICY_PRESET]!;
    const expected = presetToDimensionPositions(profile);

    expect(defaultPositions).toEqual(expected);
  });
});

describe('getDefaultFedDimensionPositions', () => {
  it('returns positions matching balanced_mandate preset', () => {
    const defaultPositions = getDefaultFedDimensionPositions();
    const profile = FEDERAL_RESERVE_PRESETS[DEFAULT_FEDERAL_RESERVE_PRESET]!;
    const expected = fedPresetToDimensionPositions(profile);

    expect(defaultPositions).toEqual(expected);
  });
});
