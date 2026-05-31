/**
 * ATLAS Federal Reserve Module — Unit Tests
 *
 * Tests the four core functions in src/models/federalReserve.ts:
 *   1. computeFullEmploymentGDP — baseline GDP x growth x labor ratio x AI productivity
 *   2. computeTaylorRule — r* + pi + alpha(pi - pi*) + beta(y), no floor/ceiling
 *   3. computeFiscalDominance — constrains policy rate when debt service > threshold
 *   4. getBaselineFederalReserveState — initial state at simulation start
 *
 * Mathematical invariants under test per the Taylor (1993) formulation and
 * fiscal dominance constraint.
 */

import { describe, it, expect } from 'vitest';
import {
  computeFullEmploymentGDP,
  computeTaylorRule,
  computeFiscalDominance,
  getBaselineFederalReserveState,
} from '@/models/federalReserve';
import {
  INITIAL_POLICY_RATE,
  BASELINE_GDP_NOMINAL_2025,
  BASELINE_TOTAL_EMPLOYMENT,
  NATURAL_UNEMPLOYMENT_RATE,
} from '@/models/constants';

// ============================================================
// Standard test values
// ============================================================

const BASELINE_GDP = 29_000_000_000_000;    // $29T (approximate)
const GROWTH_RATE = 0.02;                    // 2% trend growth
const LABOR_FORCE = 168_000_000;             // ~168M
const BASELINE_EMPLOYMENT = 158_000_000;     // ~158M
const NATURAL_UNEMP = 0.044;                // 4.4%
const NEUTRAL_REAL_RATE = 0.01;              // 1% r*
const INFLATION_TARGET = 0.02;               // 2% target

// ============================================================
// 1. computeFullEmploymentGDP
// ============================================================

describe('computeFullEmploymentGDP', () => {
  it('returns baseline GDP at year 0 with no automation and matching labor', () => {
    // At year 0, no automation, and labor ratio = naturalEmployment / baselineEmployment
    const naturalEmployment = LABOR_FORCE * (1 - NATURAL_UNEMP);
    const expectedRatio = naturalEmployment / BASELINE_EMPLOYMENT;
    const result = computeFullEmploymentGDP(
      BASELINE_GDP, GROWTH_RATE, 0,
      LABOR_FORCE, BASELINE_EMPLOYMENT, NATURAL_UNEMP, 0,
    );
    // trendGDP at year 0 = baselineGDP * (1.02)^0 = baselineGDP
    // fullEmploymentGDP = baselineGDP * (naturalEmployment / baselineEmployment) * 1.0
    expect(result).toBeCloseTo(BASELINE_GDP * expectedRatio, -2);
  });

  it('grows with time due to compounded baseline growth', () => {
    const year0 = computeFullEmploymentGDP(
      BASELINE_GDP, GROWTH_RATE, 0,
      LABOR_FORCE, BASELINE_EMPLOYMENT, NATURAL_UNEMP, 0,
    );
    const year5 = computeFullEmploymentGDP(
      BASELINE_GDP, GROWTH_RATE, 5,
      LABOR_FORCE, BASELINE_EMPLOYMENT, NATURAL_UNEMP, 0,
    );
    const year10 = computeFullEmploymentGDP(
      BASELINE_GDP, GROWTH_RATE, 10,
      LABOR_FORCE, BASELINE_EMPLOYMENT, NATURAL_UNEMP, 0,
    );

    expect(year5).toBeGreaterThan(year0);
    expect(year10).toBeGreaterThan(year5);

    // After 5 years at 2%, should be ~1.02^5 = ~1.104 times year 0
    expect(year5 / year0).toBeCloseTo(Math.pow(1.02, 5), 4);
    // After 10 years at 2%, should be ~1.02^10 = ~1.219 times year 0
    expect(year10 / year0).toBeCloseTo(Math.pow(1.02, 10), 4);
  });

  it('scales with labor force size', () => {
    const smallLabor = computeFullEmploymentGDP(
      BASELINE_GDP, GROWTH_RATE, 5,
      150_000_000, BASELINE_EMPLOYMENT, NATURAL_UNEMP, 0,
    );
    const largeLabor = computeFullEmploymentGDP(
      BASELINE_GDP, GROWTH_RATE, 5,
      200_000_000, BASELINE_EMPLOYMENT, NATURAL_UNEMP, 0,
    );

    expect(largeLabor).toBeGreaterThan(smallLabor);

    // Ratio should match the labor ratio exactly
    const smallNatural = 150_000_000 * (1 - NATURAL_UNEMP);
    const largeNatural = 200_000_000 * (1 - NATURAL_UNEMP);
    expect(largeLabor / smallLabor).toBeCloseTo(largeNatural / smallNatural, 6);
  });

  it('applies AI productivity boost at full automation coverage', () => {
    const noAutomation = computeFullEmploymentGDP(
      BASELINE_GDP, GROWTH_RATE, 5,
      LABOR_FORCE, BASELINE_EMPLOYMENT, NATURAL_UNEMP, 0,
    );
    const fullAutomation = computeFullEmploymentGDP(
      BASELINE_GDP, GROWTH_RATE, 5,
      LABOR_FORCE, BASELINE_EMPLOYMENT, NATURAL_UNEMP, 1.0,
    );

    // AI_PRODUCTIVITY_BOOST_AT_FULL_COVERAGE = 0.5
    // At full coverage: productivityBoost = 1 + 1.0 * 0.5 = 1.5
    expect(fullAutomation / noAutomation).toBeCloseTo(1.5, 6);
  });

  it('applies proportional AI productivity boost at partial coverage', () => {
    const noAutomation = computeFullEmploymentGDP(
      BASELINE_GDP, GROWTH_RATE, 5,
      LABOR_FORCE, BASELINE_EMPLOYMENT, NATURAL_UNEMP, 0,
    );
    const halfAutomation = computeFullEmploymentGDP(
      BASELINE_GDP, GROWTH_RATE, 5,
      LABOR_FORCE, BASELINE_EMPLOYMENT, NATURAL_UNEMP, 0.5,
    );

    // At 50% coverage: productivityBoost = 1 + 0.5 * 0.5 = 1.25
    expect(halfAutomation / noAutomation).toBeCloseTo(1.25, 6);
  });

  it('returns zero when labor force is zero', () => {
    const result = computeFullEmploymentGDP(
      BASELINE_GDP, GROWTH_RATE, 5,
      0, BASELINE_EMPLOYMENT, NATURAL_UNEMP, 0.3,
    );
    expect(result).toBe(0);
  });

  it('handles zero baseline growth rate', () => {
    const year0 = computeFullEmploymentGDP(
      BASELINE_GDP, 0, 0,
      LABOR_FORCE, BASELINE_EMPLOYMENT, NATURAL_UNEMP, 0,
    );
    const year10 = computeFullEmploymentGDP(
      BASELINE_GDP, 0, 10,
      LABOR_FORCE, BASELINE_EMPLOYMENT, NATURAL_UNEMP, 0,
    );

    // With zero growth, GDP should not change over time
    expect(year0).toBeCloseTo(year10, -2);
  });
});

// ============================================================
// 2. computeTaylorRule
// ============================================================

describe('computeTaylorRule', () => {
  it('returns neutral rate + target when inflation is at target and output gap is zero', () => {
    // i = r* + pi + alpha*(pi - pi*) + beta*y
    // i = 0.01 + 0.02 + 1.5*(0.02 - 0.02) + 0.5*0 = 0.03
    const rate = computeTaylorRule(
      NEUTRAL_REAL_RATE, INFLATION_TARGET, INFLATION_TARGET, 0, 1.5, 0.5,
    );
    expect(rate).toBeCloseTo(NEUTRAL_REAL_RATE + INFLATION_TARGET, 10);
  });

  it('responds to inflation above target by raising rate', () => {
    const atTarget = computeTaylorRule(
      NEUTRAL_REAL_RATE, INFLATION_TARGET, INFLATION_TARGET, 0, 1.5, 0.5,
    );
    const aboveTarget = computeTaylorRule(
      NEUTRAL_REAL_RATE, 0.05, INFLATION_TARGET, 0, 1.5, 0.5,
    );

    expect(aboveTarget).toBeGreaterThan(atTarget);

    // Exact: r* + 0.05 + 1.5*(0.05 - 0.02) + 0 = 0.01 + 0.05 + 0.045 = 0.105
    expect(aboveTarget).toBeCloseTo(0.105, 10);
  });

  it('responds to inflation below target by lowering rate', () => {
    const atTarget = computeTaylorRule(
      NEUTRAL_REAL_RATE, INFLATION_TARGET, INFLATION_TARGET, 0, 1.5, 0.5,
    );
    const belowTarget = computeTaylorRule(
      NEUTRAL_REAL_RATE, 0.01, INFLATION_TARGET, 0, 1.5, 0.5,
    );

    expect(belowTarget).toBeLessThan(atTarget);

    // Exact: 0.01 + 0.01 + 1.5*(0.01 - 0.02) + 0 = 0.01 + 0.01 - 0.015 = 0.005
    expect(belowTarget).toBeCloseTo(0.005, 10);
  });

  it('responds to positive output gap by raising rate', () => {
    const zeroGap = computeTaylorRule(
      NEUTRAL_REAL_RATE, INFLATION_TARGET, INFLATION_TARGET, 0, 1.5, 0.5,
    );
    const positiveGap = computeTaylorRule(
      NEUTRAL_REAL_RATE, INFLATION_TARGET, INFLATION_TARGET, 0.05, 1.5, 0.5,
    );

    expect(positiveGap).toBeGreaterThan(zeroGap);
    // Difference should be exactly beta * gap = 0.5 * 0.05 = 0.025
    expect(positiveGap - zeroGap).toBeCloseTo(0.025, 10);
  });

  it('responds to negative output gap by lowering rate', () => {
    const zeroGap = computeTaylorRule(
      NEUTRAL_REAL_RATE, INFLATION_TARGET, INFLATION_TARGET, 0, 1.5, 0.5,
    );
    const negativeGap = computeTaylorRule(
      NEUTRAL_REAL_RATE, INFLATION_TARGET, INFLATION_TARGET, -0.10, 1.5, 0.5,
    );

    expect(negativeGap).toBeLessThan(zeroGap);
    // Difference should be exactly beta * gap = 0.5 * (-0.10) = -0.05
    expect(negativeGap - zeroGap).toBeCloseTo(-0.05, 10);
  });

  it('can produce negative rates (prescription for unconventional policy)', () => {
    // Deep deflation + deep recession
    const rate = computeTaylorRule(
      NEUTRAL_REAL_RATE, -0.03, INFLATION_TARGET, -0.15, 1.5, 0.5,
    );
    // i = 0.01 + (-0.03) + 1.5*(-0.03 - 0.02) + 0.5*(-0.15)
    // i = 0.01 - 0.03 - 0.075 - 0.075 = -0.17
    expect(rate).toBeCloseTo(-0.17, 10);
    expect(rate).toBeLessThan(0);
  });

  it('ignores output gap when beta = 0 (Fed ignores unemployment)', () => {
    const withGap = computeTaylorRule(
      NEUTRAL_REAL_RATE, 0.04, INFLATION_TARGET, -0.10, 1.5, 0,
    );
    const withoutGap = computeTaylorRule(
      NEUTRAL_REAL_RATE, 0.04, INFLATION_TARGET, 0, 1.5, 0,
    );

    // With beta=0, output gap term vanishes
    expect(withGap).toBeCloseTo(withoutGap, 10);
  });

  it('scales inflation response with alpha coefficient', () => {
    const alpha1 = computeTaylorRule(
      NEUTRAL_REAL_RATE, 0.05, INFLATION_TARGET, 0, 1.0, 0.5,
    );
    const alpha2 = computeTaylorRule(
      NEUTRAL_REAL_RATE, 0.05, INFLATION_TARGET, 0, 2.0, 0.5,
    );

    // Inflation deviation = 0.05 - 0.02 = 0.03
    // Difference should be (2.0 - 1.0) * 0.03 = 0.03
    expect(alpha2 - alpha1).toBeCloseTo(0.03, 10);
  });
});

// ============================================================
// 3. computeFiscalDominance
// ============================================================

describe('computeFiscalDominance', () => {
  const THRESHOLD = 0.25;
  const DAMPENING = 0.5;

  it('passes through Taylor rate when debt service ratio is below threshold', () => {
    const result = computeFiscalDominance(
      0.05,   // taylorPrescribed
      0.03,   // prevPolicyRate
      200e9,  // interestExpense $200B
      4_000e9, // revenue $4T → ratio = 0.05, well below 0.25
      THRESHOLD,
      DAMPENING,
      null,
    );

    expect(result.fiscalDominanceActive).toBe(false);
    expect(result.policyRate).toBe(0.05);
    expect(result.fiscalDominanceGap).toBe(0);
  });

  it('activates fiscal dominance when debt service ratio exceeds threshold', () => {
    const result = computeFiscalDominance(
      0.08,    // taylorPrescribed
      0.03,    // prevPolicyRate
      1_200e9, // interestExpense $1.2T
      4_000e9, // revenue $4T → ratio = 0.30, above 0.25
      THRESHOLD,
      DAMPENING,
      null,
    );

    expect(result.fiscalDominanceActive).toBe(true);
    expect(result.policyRate).toBeLessThan(0.08); // Cannot fully reach Taylor
    expect(result.policyRate).toBeGreaterThan(0.03); // Still moves toward Taylor
    expect(result.fiscalDominanceGap).toBeGreaterThan(0);
  });

  it('computes correct dampening factor interpolation', () => {
    // ratio = 1200/4000 = 0.30, threshold = 0.25
    // dominancePressure = (0.30 - 0.25) / 0.25 = 0.20
    // dominanceFactor = min(1, 0.20) * 0.5 = 0.10
    // uncappedRate = 0.03 + (1 - 0.10) * (0.08 - 0.03) = 0.03 + 0.90 * 0.05 = 0.075
    const result = computeFiscalDominance(
      0.08, 0.03, 1_200e9, 4_000e9, THRESHOLD, DAMPENING, null,
    );

    expect(result.policyRate).toBeCloseTo(0.075, 10);
    expect(result.fiscalDominanceGap).toBeCloseTo(0.08 - 0.075, 10);
  });

  it('increases dominance as debt service ratio grows', () => {
    const moderate = computeFiscalDominance(
      0.10, 0.03, 1_200e9, 4_000e9, THRESHOLD, DAMPENING, null,
    );
    const severe = computeFiscalDominance(
      0.10, 0.03, 2_000e9, 4_000e9, THRESHOLD, DAMPENING, null,
    );

    // More debt service → more dominance → rate closer to prev
    expect(severe.policyRate).toBeLessThan(moderate.policyRate);
    expect(severe.fiscalDominanceGap).toBeGreaterThan(moderate.fiscalDominanceGap);
  });

  it('passes through Taylor rate without cap when no fiscal dominance', () => {
    // Taylor prescribes a very high rate (hyperinflation scenario) — no arbitrary cap
    const result = computeFiscalDominance(
      0.50,   // Taylor says 50%
      0.15,   // prev rate
      100e9,  // low debt service
      4_000e9, // ratio = 0.025, far below threshold
      THRESHOLD,
      DAMPENING,
      null,
    );

    expect(result.fiscalDominanceActive).toBe(false);
    expect(result.policyRate).toBe(0.50); // No cap — Taylor rate passes through
    expect(result.fiscalDominanceGap).toBe(0);
  });

  it('computes dampened rate without cap under fiscal dominance', () => {
    const result = computeFiscalDominance(
      0.50,    // Taylor says 50%
      0.19,    // prev rate
      1_200e9, // moderate dominance
      4_000e9,
      THRESHOLD,
      DAMPENING,
      null,
    );

    // dominancePressure = (0.30 - 0.25) / 0.25 = 0.20
    // dominanceFactor = 0.20 * 0.5 = 0.10
    // rate = 0.19 + 0.90 * (0.50 - 0.19) = 0.19 + 0.279 = 0.469
    expect(result.policyRate).toBeCloseTo(0.469, 10);
    expect(result.fiscalDominanceActive).toBe(true);
  });

  it('returns full dominance (stuck at prev rate) when revenue is zero', () => {
    const result = computeFiscalDominance(
      0.08, 0.03, 500e9, 0, THRESHOLD, DAMPENING, null,
    );

    expect(result.fiscalDominanceActive).toBe(true);
    expect(result.policyRate).toBe(0.03); // Stuck at prev
    expect(result.fiscalDominanceGap).toBeCloseTo(0.08 - 0.03, 10);
  });

  it('returns full dominance when revenue is negative', () => {
    const result = computeFiscalDominance(
      0.08, 0.04, 500e9, -100e9, THRESHOLD, DAMPENING, null,
    );

    expect(result.fiscalDominanceActive).toBe(true);
    expect(result.policyRate).toBe(0.04); // Stuck at prev
  });

  it('bypasses Taylor Rule entirely when policyRateOverride is set', () => {
    const result = computeFiscalDominance(
      0.08,    // Taylor says 8%
      0.03,    // prev rate
      2_000e9, // severe dominance
      4_000e9,
      THRESHOLD,
      DAMPENING,
      0.025,   // User override: 2.5%
    );

    expect(result.policyRate).toBe(0.025);
    expect(result.fiscalDominanceActive).toBe(false);
    expect(result.fiscalDominanceGap).toBe(0);
  });

  it('policyRateOverride of zero is respected (not treated as null)', () => {
    const result = computeFiscalDominance(
      0.08, 0.03, 500e9, 4_000e9, THRESHOLD, DAMPENING, 0,
    );

    expect(result.policyRate).toBe(0);
    expect(result.fiscalDominanceActive).toBe(false);
    expect(result.fiscalDominanceGap).toBe(0);
  });

  it('policyRateOverride is respected exactly as provided', () => {
    const result = computeFiscalDominance(
      0.08, 0.03, 500e9, 4_000e9, THRESHOLD, DAMPENING, 0.30,
    );

    expect(result.policyRate).toBe(0.30);
  });

  it('with dominanceFactor at 1.0 (max dampening), rate stays at prev', () => {
    // Need: dominancePressure >= 1.0 → (ratio - threshold) / threshold >= 1
    //   → ratio >= 2 * threshold = 0.50
    // AND dampening = 1.0 so dominanceFactor = 1.0 * 1.0 = 1.0
    const result = computeFiscalDominance(
      0.10,    // Taylor
      0.03,    // prev
      2_500e9, // ratio = 2500/4000 = 0.625 → pressure = (0.625 - 0.25)/0.25 = 1.5 → clamped to 1
      4_000e9,
      THRESHOLD,
      1.0,     // Full dampening
      null,
    );

    // dominanceFactor = min(1, 1.5) * 1.0 = 1.0
    // rate = 0.03 + (1 - 1.0) * (0.10 - 0.03) = 0.03
    expect(result.policyRate).toBe(0.03);
    expect(result.fiscalDominanceActive).toBe(true);
    expect(result.fiscalDominanceGap).toBeCloseTo(0.10 - 0.03, 10);
  });

  it('with dampening = 0 (no fiscal constraint), rate reaches Taylor even under dominance', () => {
    const result = computeFiscalDominance(
      0.08,
      0.03,
      2_000e9, // ratio = 0.50, above threshold
      4_000e9,
      THRESHOLD,
      0,       // No dampening
      null,
    );

    // dominanceFactor = pressure * 0 = 0
    // rate = 0.03 + (1 - 0) * (0.08 - 0.03) = 0.08
    expect(result.policyRate).toBe(0.08);
    expect(result.fiscalDominanceActive).toBe(true); // Active but not constraining
    expect(result.fiscalDominanceGap).toBe(0);
  });

  it('handles debt service exactly at threshold — no dominance', () => {
    // ratio = 1000/4000 = 0.25, exactly at threshold (not above)
    const result = computeFiscalDominance(
      0.06, 0.03, 1_000e9, 4_000e9, THRESHOLD, DAMPENING, null,
    );

    expect(result.fiscalDominanceActive).toBe(false);
    expect(result.policyRate).toBeCloseTo(0.06, 10);
  });

  it('handles Taylor rate below previous rate (rate cuts) under dominance', () => {
    // Taylor wants to cut, but dominance dampens the cut too
    const result = computeFiscalDominance(
      0.01,    // Taylor wants low rate
      0.05,    // prev is higher
      1_200e9, // dominance active (ratio = 0.30)
      4_000e9,
      THRESHOLD,
      DAMPENING,
      null,
    );

    // dominancePressure = 0.20, dominanceFactor = 0.10
    // rate = 0.05 + 0.90 * (0.01 - 0.05) = 0.05 - 0.036 = 0.014
    expect(result.policyRate).toBeCloseTo(0.014, 10);
    expect(result.fiscalDominanceActive).toBe(true);
    // Gap is negative because Taylor is below the constrained rate
    expect(result.fiscalDominanceGap).toBeCloseTo(0.01 - 0.014, 10);
  });
});

// ============================================================
// 4. getBaselineFederalReserveState
// ============================================================

describe('getBaselineFederalReserveState', () => {
  it('returns initial policy rate from constants', () => {
    const state = getBaselineFederalReserveState();
    expect(state.policyRate).toBe(INITIAL_POLICY_RATE);
    expect(state.taylorPrescribedRate).toBe(INITIAL_POLICY_RATE);
  });

  it('starts with zero output gap', () => {
    const state = getBaselineFederalReserveState();
    expect(state.outputGap).toBe(0);
  });

  it('starts with no fiscal dominance', () => {
    const state = getBaselineFederalReserveState();
    expect(state.fiscalDominanceActive).toBe(false);
    expect(state.fiscalDominanceGap).toBe(0);
  });

  it('sets full employment GDP to baseline GDP', () => {
    const state = getBaselineFederalReserveState();
    expect(state.fullEmploymentGDP).toBe(BASELINE_GDP_NOMINAL_2025);
  });

  it('returns all required FederalReserveState fields', () => {
    const state = getBaselineFederalReserveState();
    expect(state).toHaveProperty('taylorPrescribedRate');
    expect(state).toHaveProperty('policyRate');
    expect(state).toHaveProperty('fiscalDominanceActive');
    expect(state).toHaveProperty('fiscalDominanceGap');
    expect(state).toHaveProperty('outputGap');
    expect(state).toHaveProperty('fullEmploymentGDP');
  });
});
