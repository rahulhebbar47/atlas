/**
 * ATLAS Equity Market Module — Unit Tests
 *
 * Tests growth momentum from AI capability S-curves, Gordon Growth Model
 * equity valuation with AI P/E multiplier, and baseline state initialization.
 *
 * Key relationships:
 *   basePE = (1 + g) / (r - g)     Gordon Growth Model
 *   effectivePE = basePE × (1 + (aiMult - 1) × momentum)
 *   marketCap = profits × effectivePE × basePE   [profits × peRatio]
 *   marketReturn = (cap(t) - cap(t-1)) / cap(t-1)
 */

import { describe, it, expect } from 'vitest';
import {
  computeGrowthMomentum,
  computeEquityValuation,
  getBaselineEquityMarketState,
} from '@/models/equityMarket';
import {
  EQUITY_RISK_PREMIUM,
  BASELINE_SP500_LEVEL,
  BASELINE_CORPORATE_PROFITS,
} from '@/models/constants';

// ============================================================
// computeGrowthMomentum
// ============================================================

describe('computeGrowthMomentum', () => {
  it('returns 0 momentum when no previous scores (year 0)', () => {
    const result = computeGrowthMomentum([0.5, 0.3, 0.1], null, 0);
    expect(result.growthMomentum).toBe(0);
    expect(result.currentChange).toBe(0);
    expect(result.newHistoricalMax).toBe(0);
  });

  it('returns 0 momentum when previous scores array is empty', () => {
    const result = computeGrowthMomentum([0.5, 0.3, 0.1], [], 0);
    expect(result.growthMomentum).toBe(0);
    expect(result.currentChange).toBe(0);
  });

  it('computes momentum = 1.0 when current change equals historical max', () => {
    const current = [0.6, 0.4, 0.2];
    const previous = [0.5, 0.3, 0.1];
    // change = |0.1| + |0.1| + |0.1| = 0.3
    const result = computeGrowthMomentum(current, previous, 0.3);
    expect(result.currentChange).toBeCloseTo(0.3, 10);
    expect(result.growthMomentum).toBeCloseTo(1.0, 10);
    expect(result.newHistoricalMax).toBeCloseTo(0.3, 10);
  });

  it('computes momentum = 1.0 when current change exceeds historical max (new record)', () => {
    const current = [0.7, 0.5, 0.3];
    const previous = [0.5, 0.3, 0.1];
    // change = |0.2| + |0.2| + |0.2| = 0.6
    const result = computeGrowthMomentum(current, previous, 0.3); // old max = 0.3
    expect(result.currentChange).toBeCloseTo(0.6, 10);
    expect(result.newHistoricalMax).toBeCloseTo(0.6, 10);
    // momentum = 0.6 / 0.6 = 1.0 (new max is always current)
    expect(result.growthMomentum).toBeCloseTo(1.0, 10);
  });

  it('approaches 0 as S-curves flatten (small change vs large historical max)', () => {
    const current = [0.94, 0.89, 0.84];
    const previous = [0.93, 0.88, 0.83]; // tiny change: 0.01 × 3 = 0.03
    const historicalMax = 0.30;            // peak change from steep part of S-curve
    const result = computeGrowthMomentum(current, previous, historicalMax);
    expect(result.currentChange).toBeCloseTo(0.03, 10);
    expect(result.growthMomentum).toBeCloseTo(0.03 / 0.30, 10); // 0.10
    expect(result.growthMomentum).toBeLessThan(0.15);
  });

  it('returns 0 momentum when scores are unchanged', () => {
    const scores = [0.5, 0.3, 0.1];
    const result = computeGrowthMomentum(scores, scores, 0.3);
    expect(result.currentChange).toBe(0);
    expect(result.growthMomentum).toBe(0);
    expect(result.newHistoricalMax).toBe(0.3); // historical max preserved
  });

  it('handles different-length arrays (uses minimum length)', () => {
    const current = [0.6, 0.4, 0.2];
    const previous = [0.5, 0.3]; // only 2 elements
    const result = computeGrowthMomentum(current, previous, 0);
    // Only compares first 2 elements: |0.1| + |0.1| = 0.2
    expect(result.currentChange).toBeCloseTo(0.2, 10);
  });

  it('returns 0 momentum when historicalMaxChange is 0 and no change', () => {
    const result = computeGrowthMomentum([0.5, 0.3, 0.1], [0.5, 0.3, 0.1], 0);
    expect(result.growthMomentum).toBe(0);
  });
});

// ============================================================
// computeEquityValuation — Gordon Growth Model
// ============================================================

describe('computeEquityValuation', () => {
  // Standard test values
  const tenYearYield = 0.043;
  const erp = EQUITY_RISK_PREMIUM; // 0.045
  const profits = 3_000_000_000_000;     // $3T
  const prevProfits = 2_900_000_000_000;  // $2.9T
  const prevPrevProfits = 2_800_000_000_000; // $2.8T
  const prevMarketCap = 50_000_000_000_000; // $50T

  describe('P/E behavior at extremes', () => {
    it('produces small P/E with very high discount rate', () => {
      // Very high discount rate → very low P/E (Gordon Growth: (1+g)/(r-g))
      const state = computeEquityValuation(
        0.50,              // 50% yield
        0.50,              // 50% ERP → discount rate = 1.0
        profits,
        prevProfits,
        prevPrevProfits,
        prevMarketCap,
        0,
        1.0,
      );
      // growth ≈ 3.5%, discount = 1.0 → basePE ≈ 1.035/0.965 ≈ 1.07
      expect(state.peRatio).toBeGreaterThan(0);
      expect(state.peRatio).toBeLessThan(5);
    });

    it('produces large P/E with very low discount rate', () => {
      // Very low discount rate, moderate growth → very high P/E
      const state = computeEquityValuation(
        0.001,             // very low yield
        0.001,             // very low ERP → discount = 0.002
        profits,
        prevProfits,
        prevPrevProfits,
        prevMarketCap,
        0,
        1.0,
      );
      // growth ≈ 3.5%, discount = 0.002 → r < g → denominator = 1e-6 → PE ≈ 1M
      expect(state.peRatio).toBeGreaterThan(100);
      expect(Number.isFinite(state.peRatio)).toBe(true);
    });
  });

  describe('higher discount rate → lower P/E', () => {
    it('P/E decreases as discount rate increases', () => {
      const lowDiscount = computeEquityValuation(
        0.03, erp, profits, prevProfits, prevPrevProfits, prevMarketCap, 0, 1.0,
      );
      const highDiscount = computeEquityValuation(
        0.08, erp, profits, prevProfits, prevPrevProfits, prevMarketCap, 0, 1.0,
      );
      expect(highDiscount.peRatio).toBeLessThan(lowDiscount.peRatio);
    });
  });

  describe('aiPEMultiplier = 1.0 → no premium', () => {
    it('effectivePEMultiplier is 1.0 regardless of momentum', () => {
      const state = computeEquityValuation(
        tenYearYield, erp, profits, prevProfits, prevPrevProfits,
        prevMarketCap,
        1.0,               // full momentum
        1.0,               // rational pricing: no AI premium
      );
      expect(state.effectivePEMultiplier).toBe(1.0);
    });

    it('P/E is unchanged with different momentum values', () => {
      const noMomentum = computeEquityValuation(
        tenYearYield, erp, profits, prevProfits, prevPrevProfits,
        prevMarketCap, 0, 1.0,
      );
      const fullMomentum = computeEquityValuation(
        tenYearYield, erp, profits, prevProfits, prevPrevProfits,
        prevMarketCap, 1.0, 1.0,
      );
      expect(noMomentum.peRatio).toBeCloseTo(fullMomentum.peRatio, 10);
    });
  });

  describe('AI P/E premium with aiPEMultiplier > 1.0', () => {
    it('premium increases with momentum when multiplier > 1', () => {
      const lowMomentum = computeEquityValuation(
        tenYearYield, erp, profits, prevProfits, prevPrevProfits,
        prevMarketCap, 0.2, 2.0,
      );
      const highMomentum = computeEquityValuation(
        tenYearYield, erp, profits, prevProfits, prevPrevProfits,
        prevMarketCap, 0.8, 2.0,
      );
      expect(highMomentum.peRatio).toBeGreaterThan(lowMomentum.peRatio);
    });

    it('at full momentum + multiplier=2.0, effectivePEMultiplier = 2.0', () => {
      const state = computeEquityValuation(
        tenYearYield, erp, profits, prevProfits, prevPrevProfits,
        prevMarketCap,
        1.0,               // full momentum
        2.0,               // 2x AI hype
      );
      expect(state.effectivePEMultiplier).toBeCloseTo(2.0, 10);
    });
  });

  describe('market cap and return', () => {
    it('marketCap = profits × peRatio', () => {
      const state = computeEquityValuation(
        tenYearYield, erp, profits, prevProfits, prevPrevProfits,
        prevMarketCap, 0, 1.0,
      );
      expect(state.aggregateMarketCap).toBeCloseTo(profits * state.peRatio, 0);
    });

    it('marketReturn computed correctly from year-over-year market cap change', () => {
      const state = computeEquityValuation(
        tenYearYield, erp, profits, prevProfits, prevPrevProfits,
        prevMarketCap, 0, 1.0,
      );
      const expectedReturn = (state.aggregateMarketCap - prevMarketCap) / prevMarketCap;
      expect(state.marketReturn).toBeCloseTo(expectedReturn, 10);
    });

    it('marketReturn is 0 when previousMarketCap is 0 (year 0)', () => {
      const state = computeEquityValuation(
        tenYearYield, erp, profits, prevProfits, prevPrevProfits,
        0,                 // no previous market cap
        0, 1.0,
      );
      expect(state.marketReturn).toBe(0);
    });

    it('uses max(0, profits) for market cap (negative profits → 0 cap)', () => {
      const state = computeEquityValuation(
        tenYearYield, erp,
        -500_000_000_000,  // negative profits
        prevProfits, prevPrevProfits,
        prevMarketCap, 0, 1.0,
      );
      expect(state.aggregateMarketCap).toBe(0);
    });
  });

  describe('discount rate <= growth → singularity guard', () => {
    it('produces very large PE when discount rate <= growth rate', () => {
      // Make growth >> discount rate → Gordon Growth denominator approaches 0
      // Singularity guard: denominator clamped to 1e-6 → PE = (1+g)/1e-6 ≈ 1e6
      const hugeProfits = 10_000_000_000_000;
      const tinyPrevProfits = 100_000_000_000;
      const tinyPrevPrev = 100_000_000_000;

      const state = computeEquityValuation(
        0.001,             // very low yield
        0.001,             // very low ERP → discount = 0.002
        hugeProfits,
        tinyPrevProfits,
        tinyPrevPrev,
        prevMarketCap,
        0,
        1.0,
      );
      // Growth >> discount → denominator = 1e-6 → very large PE
      expect(state.peRatio).toBeGreaterThan(1000);
      expect(Number.isFinite(state.peRatio)).toBe(true);
    });

    it('stays finite when growth significantly exceeds discount rate', () => {
      const state = computeEquityValuation(
        0.01,              // 1% yield
        0.01,              // 1% ERP → discount = 2%
        5_000_000_000_000, // $5T — 67% growth from prev
        3_000_000_000_000, // $3T — 50% growth from prev-prev
        2_000_000_000_000, // $2T
        prevMarketCap,
        0,
        1.0,
      );
      // growth = 0.583, discount = 0.02 → denominator = 1e-6
      // PE = (1 + 0.583) / 1e-6 ≈ 1.58M
      expect(state.peRatio).toBeGreaterThan(1000);
      expect(Number.isFinite(state.peRatio)).toBe(true);
    });
  });

  describe('expected growth calculation', () => {
    it('uses 2-year average of profit growth when both previous values available', () => {
      const state = computeEquityValuation(
        tenYearYield, erp,
        3_000_000_000_000,   // current: $3T
        2_800_000_000_000,   // prev: $2.8T
        2_600_000_000_000,   // prevPrev: $2.6T
        prevMarketCap,
        0,
        1.0,
      );
      // growth1 = (3T - 2.8T) / 2.8T ≈ 0.0714
      // growth2 = (2.8T - 2.6T) / 2.6T ≈ 0.0769
      // avg ≈ 0.0742
      // discount = 0.043 + 0.045 = 0.088
      // basePE = (1 + 0.0742) / (0.088 - 0.0742) ≈ 1.0742 / 0.0138 ≈ 77.8
      expect(state.equityDiscountRate).toBeCloseTo(tenYearYield + erp, 10);
      expect(state.peRatio).toBeGreaterThan(0);
      expect(Number.isFinite(state.peRatio)).toBe(true);
    });

    it('uses single-year growth when only one previous value available', () => {
      const state = computeEquityValuation(
        tenYearYield, erp,
        3_000_000_000_000,
        2_800_000_000_000,
        0,                   // prevPrevProfits = 0 → single-year path
        prevMarketCap,
        0,
        1.0,
      );
      // growth = (3T - 2.8T) / 2.8T ≈ 0.0714
      expect(state.peRatio).toBeGreaterThan(0);
    });

    it('falls back to 2% growth when no previous profit data', () => {
      const state = computeEquityValuation(
        tenYearYield, erp,
        3_000_000_000_000,
        0,                   // no prev profits
        0,                   // no prevPrev profits
        prevMarketCap,
        0,
        1.0,
      );
      // expectedGrowth = 0.02 (fallback)
      // discount = 0.088, basePE = 1.02 / (0.088 - 0.02) = 1.02 / 0.068 ≈ 15.0
      expect(state.peRatio).toBeCloseTo(15.0, 0);
    });
  });

  describe('equityDiscountRate computation', () => {
    it('equals tenYearYield + equityRiskPremium', () => {
      const state = computeEquityValuation(
        0.05, 0.04, profits, prevProfits, prevPrevProfits,
        prevMarketCap, 0, 1.0,
      );
      expect(state.equityDiscountRate).toBeCloseTo(0.05 + 0.04, 10);
    });
  });
});

// ============================================================
// getBaselineEquityMarketState
// ============================================================

describe('getBaselineEquityMarketState', () => {
  it('returns populated state with constants-derived values', () => {
    const state = getBaselineEquityMarketState();

    expect(state.aggregateMarketCap).toBeGreaterThan(0);
    expect(state.peRatio).toBeGreaterThan(0);
    expect(Number.isFinite(state.peRatio)).toBe(true);
    expect(state.effectivePEMultiplier).toBe(1.0);
    expect(state.growthMomentum).toBe(0);
    expect(state.equityDiscountRate).toBeCloseTo(EQUITY_RISK_PREMIUM + 0.043, 3);
    expect(state.marketReturn).toBe(0);
  });

  it('marketCap equals profits times P/E', () => {
    const state = getBaselineEquityMarketState();
    expect(state.aggregateMarketCap).toBeCloseTo(
      BASELINE_CORPORATE_PROFITS * state.peRatio,
      0,
    );
  });

  it('has all EquityMarketState interface fields', () => {
    const state = getBaselineEquityMarketState();
    expect(state).toHaveProperty('aggregateMarketCap');
    expect(state).toHaveProperty('peRatio');
    expect(state).toHaveProperty('effectivePEMultiplier');
    expect(state).toHaveProperty('growthMomentum');
    expect(state).toHaveProperty('equityDiscountRate');
    expect(state).toHaveProperty('marketReturn');
  });
});
