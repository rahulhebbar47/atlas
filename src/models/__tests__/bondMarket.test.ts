/**
 * ATLAS Bond Market Module — Unit Tests
 *
 * Tests bond market pricing: fiscal risk premium (sigmoid), foreign demand
 * decay, expected policy rates, 10-year yield composition, rate transmission,
 * and baseline state initialization.
 *
 * Key relationships:
 *   10Y yield = max(policyRate, expectedAvgRate + termPremium + fiscalRisk + supplyPressure)
 *   mortgageRate = 10Y + mortgageSpread
 *   corporateBorrowingRate = 10Y + baseCorpSpread × stressFactor
 *   consumerCreditRate = policyRate + 10%
 */

import { describe, it, expect } from 'vitest';
import {
  computeFiscalRiskPremium,
  computeForeignDemand,
  computeExpectedPolicyRates,
  computeTenYearYield,
  computeRateTransmission,
  computeAbsorptionCapacity,
  getBaselineBondMarketState,
} from '@/models/bondMarket';
import {
  INITIAL_10Y_YIELD,
  INITIAL_POLICY_RATE,
  BASELINE_MORTGAGE_SPREAD,
  BASE_CORPORATE_SPREAD,
  TERM_PREMIUM,
  NEUTRAL_REAL_RATE,
  SIGMOID_STEEPNESS,
  FOREIGN_DEMAND_INITIAL,
} from '@/models/constants';

// ============================================================
// computeFiscalRiskPremium — composite model (trajectory, sustainability, level)
// ============================================================

describe('computeFiscalRiskPremium', () => {
  // E-8b: these tests exercise the PRESERVED legacy logistic path (useLegacyLogistic = true).
  const legacyPremium = (...args: Parameters<typeof computeFiscalRiskPremium> extends [infer A, infer B, infer C, infer D, ...unknown[]] ? [A, B, C, D, number?, number?, number?, number?, number?, number?] : never) =>
    computeFiscalRiskPremium(args[0] as number, args[1] as number, args[2] as number, args[3] as number,
      (args[4] as number) ?? 0.5, (args[5] as number) ?? 0.35, (args[6] as number) ?? 0.15, (args[7] as number) ?? 0.06,
      (args[8] as number) ?? 2.0, (args[9] as number) ?? 0.15, 0, true);
  it('returns near-zero premium when debt is stable and low', () => {
    // Stable debt at 60% (current=prev), low rate (3%), moderate growth (4%)
    // Trajectory: 0 change, but sigmoid centered at +10pp → baseline ~27% of max → ~16bp trajectory
    // Sustainability: r=0.03 < g=0.04 → zero (r-g < 0)
    // Level: 0.60 << 2.0 midpoint → very low level risk
    // Total: weighted sum with default weights (0.50/0.35/0.15)
    const result = legacyPremium(
      0.60,  // current debt/GDP
      0.60,  // prev debt/GDP (stable)
      0.03,  // weighted avg debt rate
      0.04,  // nominal GDP growth rate
    );
    expect(result.fiscalRiskPremium).toBeLessThan(0.015); // <150bp (mostly trajectory baseline)
    expect(result.fiscalRiskPremium).toBeGreaterThanOrEqual(0);
    expect(result.sustainabilityRisk).toBe(0); // r < g
    expect(result.levelRisk).toBeLessThan(0.001); // very low at 60%
  });

  it('returns positive trajectory risk when debt is rising', () => {
    // Debt rising from 1.2 to 1.3 (10pp increase)
    // Phase 8 Fix 5: Trajectory sigmoid centered at 0.15 (was 0.10).
    // At 10pp change, sigmoid ≈ 10.9% → modest trajectory risk.
    const result = legacyPremium(
      1.30,  // current debt/GDP
      1.20,  // prev debt/GDP (rising by 10pp)
      0.03,  // low rate
      0.04,  // moderate growth
    );
    expect(result.trajectoryRisk).toBeGreaterThan(0.005); // >50bp trajectory component (midpoint now 0.15)
    expect(result.fiscalRiskPremium).toBeGreaterThan(0);
    // Trajectory should dominate (weight=0.50), others minimal
    expect(result.trajectoryRisk).toBeGreaterThan(result.sustainabilityRisk);
  });

  it('returns positive sustainability risk when r > g', () => {
    // Stable debt, but high rates (6%) vs low growth (1%)
    // r - g = 0.05 (500bp unsustainability gap) → max sustainability risk (60bp with default max=0.06)
    const result = legacyPremium(
      1.20,  // current debt/GDP
      1.20,  // prev debt/GDP (stable)
      0.06,  // high weighted avg debt rate
      0.01,  // low nominal GDP growth
    );
    expect(result.sustainabilityRisk).toBeGreaterThan(0.05); // >500bp sustainability component (at max)
    // Trajectory baseline is near-zero with steep sigmoid (steepness ~42, centered at +10pp)
    // At zero debt/GDP change: sigmoid(-42 × -0.10) = 1/(1+exp(4.2)) ≈ 0.015 → ~0.9bp
    expect(result.trajectoryRisk).toBeGreaterThan(0); // always positive (sigmoid never reaches 0)
    expect(result.trajectoryRisk).toBeLessThan(0.005); // but very small at zero change
    // Sustainability should dominate
    expect(result.sustainabilityRisk).toBeGreaterThan(result.trajectoryRisk);
  });

  it('returns positive level risk at high debt/GDP', () => {
    // Stable at 2.5x (well above 2.0 midpoint)
    // Level sigmoid centered at 2.0 with transition over 60pp → 2.5 is 50pp above → very high level risk
    const result = legacyPremium(
      2.50,  // current debt/GDP (very high)
      2.50,  // prev debt/GDP (stable)
      0.03,  // moderate rate
      0.04,  // moderate growth
    );
    expect(result.levelRisk).toBeGreaterThan(0.05); // very high level risk (near max)
    // Trajectory baseline is near-zero with steep sigmoid (steepness ~42)
    expect(result.trajectoryRisk).toBeGreaterThan(0); // always positive
    expect(result.trajectoryRisk).toBeLessThan(0.005); // very small at zero change
    expect(result.sustainabilityRisk).toBe(0); // r < g
  });

  it('caps total at maxPremium', () => {
    // Extreme scenario: debt rising rapidly (3.0→3.5), very high rates (10%), negative growth (-5%)
    // All three components should be maxed out
    const result = legacyPremium(
      3.50,  // current debt/GDP
      3.00,  // prev debt/GDP (rising by 50pp)
      0.10,  // very high rate
      -0.05, // negative growth (recession)
    );
    // Each component can individually reach maxPremium (default 0.06)
    // But weighted sum should respect the composite formula
    expect(result.fiscalRiskPremium).toBeGreaterThan(0.05); // very high premium
    expect(result.fiscalRiskPremium).toBeLessThanOrEqual(0.06); // capped at default maxPremium
    expect(result.trajectoryRisk).toBeGreaterThan(0.05); // trajectory maxed
    expect(result.sustainabilityRisk).toBeGreaterThan(0.05); // sustainability maxed
    expect(result.levelRisk).toBeGreaterThan(0.05); // level maxed
  });

  it('respects custom weights', () => {
    // Same inputs, different weight configurations
    const defaultWeights = legacyPremium(
      1.30, 1.20, 0.06, 0.01,
      // defaults: trajectory=0.50, sustainability=0.35, level=0.15
    );
    const trajectoryHeavy = legacyPremium(
      1.30, 1.20, 0.06, 0.01,
      0.90, 0.05, 0.05, // emphasize trajectory
    );
    const sustainabilityHeavy = legacyPremium(
      1.30, 1.20, 0.06, 0.01,
      0.05, 0.90, 0.05, // emphasize sustainability
    );
    // Different weights should produce different total premiums
    expect(trajectoryHeavy.fiscalRiskPremium).not.toBe(defaultWeights.fiscalRiskPremium);
    expect(sustainabilityHeavy.fiscalRiskPremium).not.toBe(defaultWeights.fiscalRiskPremium);
    expect(trajectoryHeavy.fiscalRiskPremium).not.toBe(sustainabilityHeavy.fiscalRiskPremium);
  });

  it('returns minimal premium when debt is stable, r<g, and level is low', () => {
    // Good conditions: stable at 80%, r=2% < g=3%, well below level midpoint
    // Trajectory sigmoid baseline still applies (change=0, centered at +10pp)
    const result = legacyPremium(
      0.80,  // current debt/GDP
      0.80,  // prev debt/GDP (stable)
      0.02,  // low rate
      0.03,  // moderate growth
    );
    // Total premium dominated by trajectory baseline (~27% of max → ~16bp)
    expect(result.fiscalRiskPremium).toBeLessThan(0.015); // <150bp
    expect(result.fiscalRiskPremium).toBeGreaterThan(0); // trajectory baseline always positive
    expect(result.sustainabilityRisk).toBe(0); // r < g
    expect(result.levelRisk).toBeLessThan(0.001); // very low at 80%
  });
});

// ============================================================
// computeForeignDemand
// ============================================================

describe('computeForeignDemand', () => {
  const initialDebtGDP = 1.20;

  it('returns initial level when debt/GDP is below threshold (initial + 10pp)', () => {
    const demand = computeForeignDemand(1.25, initialDebtGDP);
    // 1.25 < 1.30 (threshold = 1.20 + 0.10), so no decay
    expect(demand).toBe(FOREIGN_DEMAND_INITIAL);
  });

  it('returns initial level when debt/GDP equals threshold exactly', () => {
    const demand = computeForeignDemand(initialDebtGDP + 0.10, initialDebtGDP);
    expect(demand).toBe(FOREIGN_DEMAND_INITIAL);
  });

  it('begins decaying once debt/GDP exceeds threshold', () => {
    const demand = computeForeignDemand(1.40, initialDebtGDP);
    // 1.40 > 1.30 (threshold), so some decay occurs
    expect(demand).toBeLessThan(FOREIGN_DEMAND_INITIAL);
    expect(demand).toBeGreaterThan(0);
  });

  it('halves at threshold + 50pp (half-life property)', () => {
    const threshold = initialDebtGDP + 0.10; // 1.30
    const halfLifePoint = threshold + 0.50;  // 1.80
    const demand = computeForeignDemand(halfLifePoint, initialDebtGDP);
    // At exactly one half-life: demand = initial × 0.5
    expect(demand).toBeCloseTo(FOREIGN_DEMAND_INITIAL * 0.5, 4);
  });

  it('never returns negative', () => {
    // Even at extreme debt/GDP, exponential decay stays positive
    const demand = computeForeignDemand(10.0, initialDebtGDP);
    expect(demand).toBeGreaterThan(0);
    expect(demand).toBeLessThan(FOREIGN_DEMAND_INITIAL * 0.01);
  });

  it('uses custom initial foreign demand if provided', () => {
    const customInitial = 0.50;
    const demand = computeForeignDemand(initialDebtGDP, initialDebtGDP, customInitial);
    expect(demand).toBe(customInitial);
  });

  it('decays monotonically as debt/GDP increases', () => {
    const ratios = [1.35, 1.50, 1.80, 2.50, 4.00];
    const demands = ratios.map(r => computeForeignDemand(r, initialDebtGDP));
    for (let i = 1; i < demands.length; i++) {
      expect(demands[i]).toBeLessThan(demands[i - 1]!);
    }
  });
});

// ============================================================
// computeExpectedPolicyRates
// ============================================================

describe('computeExpectedPolicyRates', () => {
  const inflationTarget = 0.02;
  const taylorInflCoeff = 1.5;
  const taylorOutputCoeff = 0.5;

  it('converges to neutral + target when inflation is at target and output gap is zero', () => {
    const avgRate = computeExpectedPolicyRates(
      inflationTarget,     // at target
      inflationTarget,
      0,                   // zero output gap
      NEUTRAL_REAL_RATE,
      taylorInflCoeff,
      taylorOutputCoeff,
      10,
    );
    // Taylor at target with zero gap: r* + π* + α(π* - π*) + β(0) = 0.01 + 0.02 = 0.03
    expect(avgRate).toBeCloseTo(NEUTRAL_REAL_RATE + inflationTarget, 10);
  });

  it('returns higher rate when inflation is above target', () => {
    const atTarget = computeExpectedPolicyRates(
      inflationTarget,
      inflationTarget,
      0,
      NEUTRAL_REAL_RATE,
      taylorInflCoeff,
      taylorOutputCoeff,
      10,
    );
    const aboveTarget = computeExpectedPolicyRates(
      0.05,                // 5% inflation, above 2% target
      inflationTarget,
      0,
      NEUTRAL_REAL_RATE,
      taylorInflCoeff,
      taylorOutputCoeff,
      10,
    );
    expect(aboveTarget).toBeGreaterThan(atTarget);
  });

  it('accounts for positive output gap (overheating economy)', () => {
    const noGap = computeExpectedPolicyRates(
      inflationTarget,
      inflationTarget,
      0,
      NEUTRAL_REAL_RATE,
      taylorInflCoeff,
      taylorOutputCoeff,
      10,
    );
    const positiveGap = computeExpectedPolicyRates(
      inflationTarget,
      inflationTarget,
      0.03,                // 3% positive output gap
      NEUTRAL_REAL_RATE,
      taylorInflCoeff,
      taylorOutputCoeff,
      10,
    );
    expect(positiveGap).toBeGreaterThan(noGap);
  });

  it('uses min(10, yearsRemaining) as projection horizon', () => {
    // With only 3 years remaining, horizon = 3
    const short = computeExpectedPolicyRates(
      0.04,
      inflationTarget,
      -0.02,
      NEUTRAL_REAL_RATE,
      taylorInflCoeff,
      taylorOutputCoeff,
      3,                   // only 3 years remaining
    );
    // With 20 years remaining, horizon = 10 (capped)
    const long = computeExpectedPolicyRates(
      0.04,
      inflationTarget,
      -0.02,
      NEUTRAL_REAL_RATE,
      taylorInflCoeff,
      taylorOutputCoeff,
      20,
    );
    // Both produce numbers (different horizons, same convergence targets)
    expect(typeof short).toBe('number');
    expect(typeof long).toBe('number');
    expect(short).not.toBe(long); // Different horizons → different averages
  });

  it('clamps horizon to at least 1', () => {
    // yearsRemaining = 0 should use horizon = 1
    const rate = computeExpectedPolicyRates(
      0.03,                // current inflation = 3%
      inflationTarget,     // target = 2%
      0,
      NEUTRAL_REAL_RATE,
      taylorInflCoeff,
      taylorOutputCoeff,
      0,                   // edge case: 0 years → horizon=1
    );
    // With horizon=1, k=1:
    // - convergeFraction = 1/5 = 0.2 (inflationConvergenceYears=5)
    // - projectedInflation = 0.03 + 0.2*(0.02-0.03) = 0.028
    // - projectedRate = 0.01 + 0.028 + 1.5*(0.028-0.02) + 0 = 0.05
    expect(rate).toBeCloseTo(0.05, 10);
  });

  it('fiscal dominance dampens projected rates', () => {
    const withoutDominance = computeExpectedPolicyRates(
      0.05,
      inflationTarget,
      -0.02,
      NEUTRAL_REAL_RATE,
      taylorInflCoeff,
      taylorOutputCoeff,
      10,
    );
    const withDominance = computeExpectedPolicyRates(
      0.05,
      inflationTarget,
      -0.02,
      NEUTRAL_REAL_RATE,
      taylorInflCoeff,
      taylorOutputCoeff,
      10,
      true,                // fiscal dominance active
      0.60,                // 60% stuck
    );
    // With fiscal dominance, projected rates are dampened → lower expected avg
    expect(withDominance).toBeLessThan(withoutDominance);
  });

  it('expectations unchanged when dominance is inactive (backward compat)', () => {
    const explicit = computeExpectedPolicyRates(
      0.04,
      inflationTarget,
      0,
      NEUTRAL_REAL_RATE,
      taylorInflCoeff,
      taylorOutputCoeff,
      10,
      false,               // explicitly inactive
      0,                   // zero factor
    );
    const defaulted = computeExpectedPolicyRates(
      0.04,
      inflationTarget,
      0,
      NEUTRAL_REAL_RATE,
      taylorInflCoeff,
      taylorOutputCoeff,
      10,
      // defaults: false, 0
    );
    expect(explicit).toBeCloseTo(defaulted, 10);
  });
});

// ============================================================
// computeTenYearYield
// ============================================================

describe('computeTenYearYield', () => {
  it('allows yield curve inversion: 10Y can be below policy rate', () => {
    // Fundamental yield is very low, policy rate is 5% — yield curve inverts
    // This is realistic: US had inverted curve 2022-2024 (FFR 5.25%, 10Y ~3.8-4.5%)
    const { tenYearYield } = computeTenYearYield(
      0.05,                // policy rate = 5%
      0.01,                // expected avg rate = 1% (very low)
      TERM_PREMIUM,
      0,                   // no fiscal risk
      0,                   // no bond-financed deficit
      0.30,
      29_000_000_000_000,
    );
    // Fundamental = 0.01 + TERM_PREMIUM + 0 + 0 ≈ 1.3-1.5%
    // This is well below policy rate of 5% — yield curve inversion
    expect(tenYearYield).toBeLessThan(0.05);
    expect(tenYearYield).toBeGreaterThanOrEqual(0); // zero floor only
  });

  it('yield can exceed 30% under extreme fiscal stress (no hardcoded cap)', () => {
    // The code uses max(policyRate, fundamentalYield) with NO upper cap.
    // Under extreme conditions (huge deficit, low foreign demand), yield can be very high.
    const { tenYearYield } = computeTenYearYield(
      0.10,
      0.20,                // high expected rate
      TERM_PREMIUM,
      0.04,                // max fiscal risk
      10_000_000_000_000,  // huge bond-financed deficit
      0.05,                // very low foreign demand
      29_000_000_000_000,
    );
    // fundamentalYield = 0.20 + 0.005 + 0.04 + supplyPressure ≈ high
    expect(tenYearYield).toBeGreaterThan(0.30);
    // Still finite and positive
    expect(tenYearYield).toBeLessThan(1.0);
    expect(tenYearYield).toBeGreaterThan(0);
  });

  it('supply pressure is positive when domestic market must absorb bonds', () => {
    const { supplyPressurePremium } = computeTenYearYield(
      0.05,
      0.03,
      TERM_PREMIUM,
      0.01,
      2_000_000_000_000,   // $2T bond-financed deficit
      0.30,                // 30% foreign demand
      29_000_000_000_000,
    );
    // supplyPressure = (2T × (1-0.30)) / 29T = 1.4T / 29T ≈ 0.048
    expect(supplyPressurePremium).toBeGreaterThan(0);
    expect(supplyPressurePremium).toBeCloseTo(
      (2_000_000_000_000 * 0.70) / 29_000_000_000_000,
      6,
    );
  });

  it('supply pressure is 0 when nominalGDP is 0', () => {
    const { supplyPressurePremium } = computeTenYearYield(
      0.05, 0.03, TERM_PREMIUM, 0, 2_000_000_000_000, 0.30, 0,
    );
    expect(supplyPressurePremium).toBe(0);
  });

  it('yield is sum of components when above policy rate floor', () => {
    const policyRate = 0.01;
    const expectedAvg = 0.04;
    const fiscalRisk = 0.01;
    const { tenYearYield, supplyPressurePremium } = computeTenYearYield(
      policyRate,
      expectedAvg,
      TERM_PREMIUM,
      fiscalRisk,
      0,                   // no bond supply → supplyPressure = 0
      0.30,
      29_000_000_000_000,
    );
    expect(supplyPressurePremium).toBe(0);
    const fundamental = expectedAvg + TERM_PREMIUM + fiscalRisk + supplyPressurePremium;
    expect(tenYearYield).toBeCloseTo(fundamental, 10);
  });
});

// ============================================================
// computeRateTransmission
// ============================================================

describe('computeRateTransmission', () => {
  const tenYearYield = 0.043;
  const policyRate = 0.0533;
  const baseMortgageSpread = BASELINE_MORTGAGE_SPREAD;
  const baseCorporateSpread = BASE_CORPORATE_SPREAD;
  const baselineDebtGDP = 1.20;

  it('mortgage rate = 10Y yield + spread', () => {
    const { mortgageRate } = computeRateTransmission(
      tenYearYield,
      policyRate,
      baseMortgageSpread,
      baseCorporateSpread,
      baselineDebtGDP,
      baselineDebtGDP,
    );
    expect(mortgageRate).toBeCloseTo(tenYearYield + baseMortgageSpread, 10);
  });

  it('corporate rate widens under fiscal stress', () => {
    const atBaseline = computeRateTransmission(
      tenYearYield, policyRate, baseMortgageSpread, baseCorporateSpread,
      baselineDebtGDP, baselineDebtGDP,
    );
    const underStress = computeRateTransmission(
      tenYearYield, policyRate, baseMortgageSpread, baseCorporateSpread,
      baselineDebtGDP * 2, // debt/GDP doubled
      baselineDebtGDP,
    );
    // Stress factor at 2x baseline = 1 + (2x - x) / x = 2.0
    // Corporate rate at stress = 10Y + spread × 2
    expect(underStress.corporateBorrowingRate).toBeGreaterThan(atBaseline.corporateBorrowingRate);
    expect(underStress.corporateBorrowingRate).toBeCloseTo(
      tenYearYield + baseCorporateSpread * 2,
      10,
    );
  });

  it('corporate stress factor does not go below 1 (no tightening below baseline)', () => {
    const { corporateBorrowingRate } = computeRateTransmission(
      tenYearYield, policyRate, baseMortgageSpread, baseCorporateSpread,
      baselineDebtGDP * 0.5, // debt/GDP halved — below baseline
      baselineDebtGDP,
    );
    // stressFactor = 1 + max(0, (0.5x - x) / x) = 1 + max(0, -0.5) = 1.0
    expect(corporateBorrowingRate).toBeCloseTo(tenYearYield + baseCorporateSpread, 10);
  });

  it('consumer credit rate = policy rate + 10% spread', () => {
    const { consumerCreditRate } = computeRateTransmission(
      tenYearYield, policyRate, baseMortgageSpread, baseCorporateSpread,
      baselineDebtGDP, baselineDebtGDP,
    );
    expect(consumerCreditRate).toBeCloseTo(policyRate + 0.10, 10);
  });

  it('consumer credit rate tracks policy rate changes', () => {
    const lowRate = computeRateTransmission(
      tenYearYield, 0.01, baseMortgageSpread, baseCorporateSpread,
      baselineDebtGDP, baselineDebtGDP,
    );
    const highRate = computeRateTransmission(
      tenYearYield, 0.08, baseMortgageSpread, baseCorporateSpread,
      baselineDebtGDP, baselineDebtGDP,
    );
    expect(highRate.consumerCreditRate - lowRate.consumerCreditRate).toBeCloseTo(0.07, 10);
  });
});

// ============================================================
// getBaselineBondMarketState
// ============================================================

describe('getBaselineBondMarketState', () => {
  it('returns all fields populated with initial constants', () => {
    const state = getBaselineBondMarketState();

    expect(state.tenYearYield).toBe(INITIAL_10Y_YIELD);
    expect(state.expectedAveragePolicyRate).toBe(INITIAL_POLICY_RATE);
    expect(state.termPremium).toBe(TERM_PREMIUM);
    expect(state.fiscalRiskPremium).toBe(0);
    expect(state.supplyPressurePremium).toBe(0);
    expect(state.mortgageRate).toBeCloseTo(INITIAL_10Y_YIELD + BASELINE_MORTGAGE_SPREAD, 10);
    expect(state.corporateBorrowingRate).toBeCloseTo(INITIAL_10Y_YIELD + BASE_CORPORATE_SPREAD, 10);
    expect(state.foreignDemandRatio).toBe(FOREIGN_DEMAND_INITIAL);
  });

  it('has consolidationCredibility set to 1.0 (no credit)', () => {
    const state = getBaselineBondMarketState();
    expect(state.consolidationCredibility).toBe(1.0);
  });

  it('has absorptionCapacity set to 1.0', () => {
    const state = getBaselineBondMarketState();
    expect(state.absorptionCapacity).toBe(1.0);
  });

  it('has all BondMarketState interface fields', () => {
    const state = getBaselineBondMarketState();
    expect(state).toHaveProperty('tenYearYield');
    expect(state).toHaveProperty('expectedAveragePolicyRate');
    expect(state).toHaveProperty('termPremium');
    expect(state).toHaveProperty('fiscalRiskPremium');
    expect(state).toHaveProperty('supplyPressurePremium');
    expect(state).toHaveProperty('mortgageRate');
    expect(state).toHaveProperty('corporateBorrowingRate');
    expect(state).toHaveProperty('foreignDemandRatio');
    expect(state).toHaveProperty('consolidationCredibility');
    expect(state).toHaveProperty('absorptionCapacity');
  });
});

// ============================================================
// Phase 8 Fix 3: computeAbsorptionCapacity
// ============================================================

describe('computeAbsorptionCapacity', () => {
  it('increases with flight to safety (negative equity return)', () => {
    const baseline = computeAbsorptionCapacity(0, 0.04, 0.02, 0.92, 0);
    const flightToSafety = computeAbsorptionCapacity(-0.30, 0.04, 0.02, 0.92, 0);
    expect(flightToSafety).toBeGreaterThan(baseline);
  });

  it('decreases with high inflation', () => {
    const lowInflation = computeAbsorptionCapacity(0, 0.04, 0.02, 0.92, 0);
    const highInflation = computeAbsorptionCapacity(0, 0.04, 0.10, 0.92, 0);
    expect(highInflation).toBeLessThan(lowInflation);
  });

  it('yield attraction dampened by sovereign stress', () => {
    // High yield with stable debt → attracts buyers
    const stableDebt = computeAbsorptionCapacity(0, 0.08, 0.02, 0.92, 0);
    // High yield with rapid debt deterioration → dampened attraction
    const deteriorating = computeAbsorptionCapacity(0, 0.08, 0.02, 0.92, 0.10);
    expect(stableDebt).toBeGreaterThan(deteriorating);
  });

  it('floor at 0.20 in worst case', () => {
    // Extreme inputs: high inflation, rapid debt growth, no flight to safety
    const worstCase = computeAbsorptionCapacity(0.20, 0.04, 0.20, 0.99, 0.30);
    expect(worstCase).toBeGreaterThanOrEqual(0.20);
  });

  it('baseline conditions return reasonable multiplier', () => {
    // Neutral: positive equity, 4% yield, 2% inflation, 92% c/y, stable debt
    const baseline = computeAbsorptionCapacity(0.05, 0.04, 0.02, 0.92, 0);
    expect(baseline).toBeGreaterThan(0.85);
    expect(baseline).toBeLessThan(2.0);
  });
});

// ============================================================
// Phase 8 Fix 3: computeTenYearYield — absorption capacity
// ============================================================

describe('computeTenYearYield — absorption capacity', () => {
  const POLICY_RATE = 0.04;
  const EXPECTED_AVG = 0.04;
  const FISCAL_RISK = 0.01;
  const BOND_FINANCED = 1_000_000_000_000; // $1T
  const FOREIGN_DEMAND = 0.30;
  const NOMINAL_GDP = 30_000_000_000_000; // $30T

  it('supply pressure reduced by high absorption capacity', () => {
    const baseline = computeTenYearYield(
      POLICY_RATE, EXPECTED_AVG, TERM_PREMIUM, FISCAL_RISK, BOND_FINANCED, FOREIGN_DEMAND, NOMINAL_GDP,
      1.0, 1.0, // absorptionCapacity=1, sensitivity=1
    );
    const highAbsorption = computeTenYearYield(
      POLICY_RATE, EXPECTED_AVG, TERM_PREMIUM, FISCAL_RISK, BOND_FINANCED, FOREIGN_DEMAND, NOMINAL_GDP,
      2.0, 1.0, // absorptionCapacity=2
    );
    // Higher absorption → lower supply pressure → lower yield
    expect(highAbsorption.tenYearYield).toBeLessThanOrEqual(baseline.tenYearYield);
  });

  it('supply pressure sensitivity scales correctly', () => {
    const baseline = computeTenYearYield(
      POLICY_RATE, EXPECTED_AVG, TERM_PREMIUM, FISCAL_RISK, BOND_FINANCED, FOREIGN_DEMAND, NOMINAL_GDP,
      1.0, 1.0,
    );
    const lowSensitivity = computeTenYearYield(
      POLICY_RATE, EXPECTED_AVG, TERM_PREMIUM, FISCAL_RISK, BOND_FINANCED, FOREIGN_DEMAND, NOMINAL_GDP,
      1.0, 2.0, // sensitivity=2 → divides pressure by 2
    );
    expect(lowSensitivity.tenYearYield).toBeLessThanOrEqual(baseline.tenYearYield);
  });

  it('backward compatible with default params', () => {
    const withDefaults = computeTenYearYield(
      POLICY_RATE, EXPECTED_AVG, TERM_PREMIUM, FISCAL_RISK, BOND_FINANCED, FOREIGN_DEMAND, NOMINAL_GDP,
    );
    const explicit = computeTenYearYield(
      POLICY_RATE, EXPECTED_AVG, TERM_PREMIUM, FISCAL_RISK, BOND_FINANCED, FOREIGN_DEMAND, NOMINAL_GDP,
      1.0, 1.0,
    );
    expect(withDefaults.tenYearYield).toBe(explicit.tenYearYield);
  });
});
