/**
 * Tests for Phase 8c: Parameter Formatter
 *
 * Verifies formatting rules for each parameter type:
 * - Boolean toggles → "On" / "Off"
 * - Tax rates → percentage
 * - Multipliers → ×
 * - Rates/fractions → percentage
 * - Dollar amounts → $/mo
 */

import { describe, it, expect } from 'vitest';
import {
  formatParamValue,
  isReadOnlyParam,
  isBooleanParam,
  PARAM_LABELS,
  PARAM_CATEGORIES,
} from '../parameterFormatter';

// ============================================================
// Format Tests
// ============================================================

describe('formatParamValue', () => {
  describe('boolean params', () => {
    it('formats 1 as "On"', () => {
      expect(formatParamValue(1, 'ubiEnabled')).toBe('On');
    });

    it('formats 0 as "Off"', () => {
      expect(formatParamValue(0, 'ubiEnabled')).toBe('Off');
    });

    it('formats 0.7 as "On" (threshold >= 0.5)', () => {
      expect(formatParamValue(0.7, 'wageSubsidyEnabled')).toBe('On');
    });

    it('formats 0.3 as "Off" (threshold < 0.5)', () => {
      expect(formatParamValue(0.3, 'swfEnabled')).toBe('Off');
    });

    it('formats equityEnabled as boolean', () => {
      expect(formatParamValue(1, 'equityEnabled')).toBe('On');
      expect(formatParamValue(0, 'equityEnabled')).toBe('Off');
    });
  });

  describe('tax rate params', () => {
    it('formats income tax as percentage', () => {
      expect(formatParamValue(0.124, 'effectiveIncomeTaxRate')).toBe('12.4%');
    });

    it('formats payroll tax as percentage', () => {
      expect(formatParamValue(0.0765, 'effectivePayrollTaxRate')).toBe('7.6%');
    });

    it('formats corporate tax as percentage', () => {
      expect(formatParamValue(0.21, 'effectiveCorporateTaxRate')).toBe('21.0%');
    });

    it('formats capital gains as percentage', () => {
      expect(formatParamValue(0.15, 'effectiveCapitalGainsTaxRate')).toBe('15.0%');
    });
  });

  describe('multiplier params', () => {
    it('formats fiscal discretionary multiplier', () => {
      expect(formatParamValue(0.95, 'fiscalDiscretionaryMultiplier')).toBe('0.95\u00D7');
    });

    it('formats fiscal obligation multiplier', () => {
      expect(formatParamValue(1.0, 'fiscalObligationMultiplier')).toBe('1.00\u00D7');
    });

    it('formats fiscal revenue multiplier', () => {
      expect(formatParamValue(1.05, 'fiscalRevenueMultiplier')).toBe('1.05\u00D7');
    });

    it('formats COLA dampening factor', () => {
      expect(formatParamValue(0.80, 'effectiveColaDampeningFactor')).toBe('0.80\u00D7');
    });
  });

  describe('rate params', () => {
    it('formats consolidation intensity', () => {
      expect(formatParamValue(0.42, 'consolidationIntensity')).toBe('42%');
    });

    it('formats QE monetization rate', () => {
      expect(formatParamValue(0.15, 'qeMonetizationRate')).toBe('15%');
    });

    it('formats financial repression rate', () => {
      expect(formatParamValue(0.50, 'maxFinancialRepressionRate')).toBe('50%');
    });

    it('formats wage subsidy percentage', () => {
      expect(formatParamValue(0.20, 'wageSubsidyPercentage')).toBe('20%');
    });

    it('formats capability levels as percentage', () => {
      expect(formatParamValue(0.85, 'generativeCapabilityLevel')).toBe('85%');
      expect(formatParamValue(0.42, 'agenticCapabilityLevel')).toBe('42%');
      expect(formatParamValue(0.10, 'embodiedCapabilityLevel')).toBe('10%');
    });
  });

  describe('dollar amount params', () => {
    it('formats UBI monthly amount', () => {
      const result = formatParamValue(1500, 'ubiMonthlyAmount');
      expect(result).toContain('$');
      expect(result).toContain('/mo');
      expect(result).toContain('1,500');
    });

    it('formats zero UBI', () => {
      const result = formatParamValue(0, 'ubiMonthlyAmount');
      expect(result).toBe('$0/mo');
    });
  });

  describe('default formatting', () => {
    it('formats unknown param with 2 decimal places', () => {
      expect(formatParamValue(3.14159, 'unknownParam')).toBe('3.14');
    });
  });
});

// ============================================================
// Read-Only & Boolean Detection Tests
// ============================================================

describe('isReadOnlyParam', () => {
  it('technology params are read-only', () => {
    expect(isReadOnlyParam('generativeCapabilityLevel')).toBe(true);
    expect(isReadOnlyParam('agenticCapabilityLevel')).toBe(true);
    expect(isReadOnlyParam('embodiedCapabilityLevel')).toBe(true);
  });

  it('non-tech params are not read-only', () => {
    expect(isReadOnlyParam('effectiveIncomeTaxRate')).toBe(false);
    expect(isReadOnlyParam('ubiMonthlyAmount')).toBe(false);
    expect(isReadOnlyParam('consolidationIntensity')).toBe(false);
  });
});

describe('isBooleanParam', () => {
  it('toggle params are boolean', () => {
    expect(isBooleanParam('ubiEnabled')).toBe(true);
    expect(isBooleanParam('wageSubsidyEnabled')).toBe(true);
    expect(isBooleanParam('swfEnabled')).toBe(true);
    expect(isBooleanParam('equityEnabled')).toBe(true);
  });

  it('non-toggle params are not boolean', () => {
    expect(isBooleanParam('effectiveIncomeTaxRate')).toBe(false);
    expect(isBooleanParam('ubiMonthlyAmount')).toBe(false);
  });
});

// ============================================================
// Labels & Categories Tests
// ============================================================

describe('PARAM_LABELS', () => {
  it('has labels for all YearParameters fields', () => {
    expect(Object.keys(PARAM_LABELS).length).toBe(46);
  });

  it('all labels are non-empty strings', () => {
    for (const [key, label] of Object.entries(PARAM_LABELS)) {
      expect(label).toBeTruthy();
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

describe('PARAM_CATEGORIES', () => {
  it('has 10 categories', () => {
    expect(PARAM_CATEGORIES).toHaveLength(10);
  });

  it('categories cover all parameter keys', () => {
    const allParams = PARAM_CATEGORIES.flatMap((c) => c.params);
    expect(allParams).toHaveLength(46);

    // All params should have a label
    for (const key of allParams) {
      expect(PARAM_LABELS[key]).toBeDefined();
    }
  });

  it('each category has a color', () => {
    for (const cat of PARAM_CATEGORIES) {
      expect(cat.color).toBeTruthy();
      expect(cat.color).toMatch(/^#/);
    }
  });
});
