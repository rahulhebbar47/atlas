/**
 * ATLAS Bond Market Module (Phase 7)
 *
 * Implements bond market pricing with an expectations channel, fiscal risk
 * premium (sigmoid), foreign demand decay, supply pressure, and rate
 * transmission to mortgages, corporate borrowing, and consumer credit.
 *
 * The 10-year Treasury yield is the anchor: it determines the cost of new
 * government debt issuance and cascades through rate transmission to the
 * real economy (housing, investment, consumer spending).
 *
 * Key relationships:
 *   10Y yield = max(policyRate, expectedAvgRate + termPremium + fiscalRisk + supplyPressure)
 *   mortgageRate = 10Y + mortgageSpread
 *   corporateBorrowingRate = 10Y + baseCorpSpread × stressFactor
 *   consumerCreditRate = policyRate + consumerSpread
 *
 * All functions are PURE — no side effects, no state mutation.
 */

import type { BondMarketState } from '@/types';
import {
  INITIAL_10Y_YIELD,
  INITIAL_POLICY_RATE,
  BASELINE_MORTGAGE_SPREAD,
  BASE_CORPORATE_SPREAD,
  TERM_PREMIUM,
  // DEPRECATED Phase 8 Fix 4: NEUTRAL_REAL_RATE now configurable via SimulationConfig.neutralRealRate
  // NEUTRAL_REAL_RATE,
  // DEPRECATED Phase 8 Fix 4: SIGMOID_STEEPNESS replaced by trajectory-based model
  // SIGMOID_STEEPNESS,
  FOREIGN_DEMAND_INITIAL,
} from './constants';

// ============================================================
// 1. Fiscal Risk Premium (Composite: Trajectory + Sustainability + Level)
// Phase 8 Fix 4: Replaces old sigmoid-on-level model
// ============================================================

// DEPRECATED Phase 8 Fix 4: Old sigmoid-on-level fiscal risk premium.
// Replaced by composite model below. The old model produced ~140bp at US
// initial conditions (114% debt/GDP), when reality shows ~0bp.
//
// export function computeFiscalRiskPremium(
//   debtGDPRatio: number,
//   sigmoidMidpoint: number,
//   maxPremium: number,
//   steepness: number = SIGMOID_STEEPNESS,
// ): number {
//   return maxPremium / (1 + Math.exp(-steepness * (debtGDPRatio - sigmoidMidpoint)));
// }

/**
 * Compute the fiscal risk premium using a composite of trajectory, sustainability,
 * and level factors.
 *
 * Empirical evidence (Japan, US, eurozone crisis) shows that absolute debt/GDP
 * level is a poor predictor of sovereign risk. Markets react to:
 *   1. Trajectory: Is debt/GDP stable, rising, or accelerating?
 *   2. Sustainability: Can the government service its debt? (r vs g)
 *   3. Level: Background risk at extreme debt levels (200%+)
 *
 * This replaces the previous sigmoid-on-level approach which produced ~140bp
 * at US current conditions (114% debt/GDP), when reality shows ~0bp.
 *
 * Source: Mauro et al. (2015) "Sovereign Risk: A World Without Risk-Free Assets?"
 *         Laubach (2009) for level effects; Baldacci & Kumar (2010) for trajectory;
 *         Blanchard (2019) "Public Debt and Low Interest Rates" for r-g framework.
 *
 * @param debtGDPRatio - Current debt/GDP ratio
 * @param prevDebtGDPRatio - Previous year's debt/GDP ratio
 * @param weightedAvgDebtRate - Government's weighted average interest rate on debt
 * @param nominalGDPGrowthRate - Current year's nominal GDP growth rate
 * @param trajectoryWeight - Weight on trajectory component (config, default 0.5)
 * @param sustainabilityWeight - Weight on sustainability component (config, default 0.35)
 * @param levelWeight - Weight on level component (config, default 0.15)
 * @param maxPremium - Maximum total fiscal risk premium (config, default 0.06 = 600bp)
 * @param levelMidpoint - Debt/GDP midpoint for level sigmoid (config, default 2.0)
 * @returns { fiscalRiskPremium, trajectoryRisk, sustainabilityRisk, levelRisk }
 */
export function computeFiscalRiskPremium(
  debtGDPRatio: number,
  prevDebtGDPRatio: number,
  weightedAvgDebtRate: number,
  nominalGDPGrowthRate: number,
  trajectoryWeight: number = 0.50,
  sustainabilityWeight: number = 0.35,
  levelWeight: number = 0.15,
  maxPremium: number = 0.06,
  levelMidpoint: number = 2.0,
  trajectoryMidpoint: number = 0.15,
): {
  fiscalRiskPremium: number;
  trajectoryRisk: number;
  sustainabilityRisk: number;
  levelRisk: number;
} {
  // === Component 1: Trajectory Risk ===
  // How fast is debt/GDP changing? Markets panic when the ratio accelerates.
  // Phase 8 Fix 5: Center moved from 0.10 to configurable (default 0.15) to match
  // empirical evidence — US has sustained +6pp/year for a decade with ~0bp trajectory premium.
  // At midpoint 0.15: +6pp/year → ~2% of max (~0.7bp), +15pp/year → 50%, +20pp/year → ~89%.
  const debtGDPChange = debtGDPRatio - prevDebtGDPRatio;
  // Steepness of ~42 ensures sharp transition around midpoint.
  // Derivation: solve 0.05 = 1/(1+exp(-s*0.07)) → s = ln(19)/0.07 ≈ 42
  const TRAJECTORY_STEEPNESS = Math.log(19) / 0.07; // ≈ 42.06
  const trajectoryRaw = 1.0 / (1.0 + Math.exp(-TRAJECTORY_STEEPNESS * (debtGDPChange - trajectoryMidpoint)));
  const trajectoryRisk = trajectoryRaw * maxPremium;

  // === Component 2: Sustainability Risk (r - g) ===
  // When interest rate on debt exceeds nominal GDP growth, debt compounds faster
  // than the economy grows — mathematically unsustainable without primary surpluses.
  // r - g > 0: unsustainable -> risk rises
  // r - g < 0: sustainable -> risk near zero (the government is "growing out" of debt)
  // US post-war: g > r for most of the period -> zero sustainability premium
  const rMinusG = weightedAvgDebtRate - nominalGDPGrowthRate;
  // Ramp from 0 at r=g to full at r-g = 0.05 (500bp unsustainability gap)
  const sustainabilityRaw = rMinusG > 0
    ? Math.min(1.0, rMinusG / 0.05)
    : 0;
  const sustainabilityRisk = sustainabilityRaw * maxPremium;

  // === Component 3: Level Risk (background) ===
  // Sigmoid on absolute level, but with HIGH midpoint (2.0 = 200%) and LOW weight.
  // This only bites at extreme levels — not relevant for US at 114%.
  // Even Japan at 250% has barely triggered this in practice.
  const levelSteepness = Math.log(9) / 0.30; // 10%-90% transition over 60pp centered on midpoint
  const levelRaw = 1.0 / (1.0 + Math.exp(-levelSteepness * (debtGDPRatio - levelMidpoint)));
  const levelRisk = levelRaw * maxPremium;

  // === Composite premium ===
  const fiscalRiskPremium = Math.max(0,
    trajectoryWeight * trajectoryRisk +
    sustainabilityWeight * sustainabilityRisk +
    levelWeight * levelRisk
  );

  return {
    fiscalRiskPremium,
    trajectoryRisk,
    sustainabilityRisk,
    levelRisk,
  };
}

// ============================================================
// 2. Foreign Demand
// ============================================================

/**
 * Compute the foreign demand ratio for US Treasuries.
 *
 * Foreign demand decays exponentially as debt/GDP rises above the initial
 * level + 10pp. This models the erosion of US fiscal credibility in
 * international markets (reserve currency status pressure).
 *
 * Half-life: 50 percentage points of debt/GDP increase → foreign demand halves.
 *
 * Source: TIC (Treasury International Capital) data trends;
 *         IMF WP/23/18 "Reserve Currency Status and Fiscal Sustainability."
 *
 * @param debtGDPRatio - Current debt/GDP ratio
 * @param initialDebtGDPRatio - Debt/GDP at simulation start (from baseline fiscal state)
 * @param initialForeignDemand - Starting foreign share of Treasury holdings (FOREIGN_DEMAND_INITIAL, 0.30)
 * @returns Foreign demand ratio [0, initialForeignDemand]
 */
export function computeForeignDemand(
  debtGDPRatio: number,
  initialDebtGDPRatio: number,
  initialForeignDemand: number = FOREIGN_DEMAND_INITIAL,
): number {
  // Buffer: foreign demand doesn't decay for first 10pp of debt increase
  const THRESHOLD_BUFFER = 0.10;
  const threshold = initialDebtGDPRatio + THRESHOLD_BUFFER;

  if (debtGDPRatio <= threshold) {
    return initialForeignDemand;
  }

  // Exponential decay with half-life of 50 percentage points
  const HALF_LIFE_PP = 0.50; // 50 percentage points of debt/GDP
  const decayRate = Math.LN2 / HALF_LIFE_PP;
  const excess = debtGDPRatio - threshold;
  const decayFactor = Math.exp(-decayRate * excess);

  return initialForeignDemand * decayFactor;
}

// ============================================================
// 3. Expected Policy Rates (Expectations Channel)
// ============================================================

/**
 * Project the Taylor Rule forward 10 years to compute the expected
 * average policy rate. This is the expectations channel of the term
 * structure — the bond market prices based on where it thinks the Fed
 * will set rates in the future.
 *
 * Assumptions:
 *   - Inflation converges to target over inflationConvergenceYears (default 5)
 *   - Output gap closes linearly to zero over the projection horizon
 *   - Employment gap closes linearly (unemployment converges to natural rate)
 *   - Fed follows dual-mandate Taylor Rule throughout
 *
 * Phase 8 Fix 4: Added employment gap projection and configurable inflation
 * convergence speed. Convergence of 5 years (instead of full 10-year horizon)
 * matches market breakeven inflation expectations more closely.
 *
 * Source: Expectations Hypothesis of the term structure (Fama 1984);
 *         Survey of Professional Forecasters term premium decomposition.
 *
 * @param currentInflation - Current composite inflation rate
 * @param inflationTarget - Fed's inflation target (config, 0.02)
 * @param currentOutputGap - Current output gap
 * @param neutralRealRate - Long-run equilibrium real rate (config, 0.007)
 * @param taylorInflationCoeff - Inflation coefficient α (config, 1.5)
 * @param taylorOutputGapCoeff - Output gap coefficient β_output (config, 0.5)
 * @param yearsRemaining - Years remaining in simulation (for shorter horizons)
 * @param fiscalDominanceActive - Phase 8 fix: Whether fiscal dominance is currently constraining the Fed
 * @param dominanceFactor - Phase 8 fix: How stuck the Fed is (0-1). Dampens projected rates when active.
 * @param currentUnemploymentRate - Phase 8 Fix 4: Current unemployment rate (0-1)
 * @param naturalUnemploymentRate - Phase 8 Fix 4: Natural/NAIRU rate (0-1)
 * @param taylorEmploymentGapCoeff - Phase 8 Fix 4: Employment gap coefficient β_employment (config, 0.3)
 * @param inflationConvergenceYears - Phase 8 Fix 4: Years for inflation to converge to target (config, 5)
 * @returns Average expected policy rate over the projection horizon
 */
export function computeExpectedPolicyRates(
  currentInflation: number,
  inflationTarget: number,
  currentOutputGap: number,
  neutralRealRate: number,
  taylorInflationCoeff: number,
  taylorOutputGapCoeff: number,
  yearsRemaining: number,
  fiscalDominanceActive: boolean = false,
  dominanceFactor: number = 0,
  currentUnemploymentRate: number = 0.044,
  naturalUnemploymentRate: number = 0.044,
  taylorEmploymentGapCoeff: number = 0.3,
  inflationConvergenceYears: number = 5,
): number {
  const PROJECTION_HORIZON = 10;
  const horizon = Math.min(PROJECTION_HORIZON, Math.max(1, yearsRemaining));

  let totalRate = 0;

  for (let k = 1; k <= horizon; k++) {
    // Inflation converges to target over inflationConvergenceYears (not full horizon)
    // Phase 8 Fix 4: Faster convergence (5yr default) matches market breakevens
    const convergeFraction = Math.min(1.0, k / inflationConvergenceYears);
    const projectedInflation =
      currentInflation + convergeFraction * (inflationTarget - currentInflation);

    // Output gap closes linearly to zero
    const projectedOutputGap = currentOutputGap * (1 - k / horizon);

    // Phase 8 Fix 4: Employment gap closes linearly (unemployment converges to natural rate)
    const projectedUnemployment = currentUnemploymentRate
      + (k / horizon) * (naturalUnemploymentRate - currentUnemploymentRate);
    const projectedEmploymentGap = naturalUnemploymentRate - projectedUnemployment;

    // Dual-mandate Taylor Rule applied to projected conditions
    let projectedRate =
      neutralRealRate +
      projectedInflation +
      taylorInflationCoeff * (projectedInflation - inflationTarget) +
      taylorOutputGapCoeff * projectedOutputGap +
      taylorEmploymentGapCoeff * projectedEmploymentGap;

    // Phase 8 fix: When fiscal dominance is active, markets expect the Fed
    // to remain constrained in the near term but gradually regain independence.
    // Dominance fades linearly over the projection horizon.
    // Source: Market pricing under fiscal dominance (Cochrane 2023)
    if (fiscalDominanceActive && dominanceFactor > 0) {
      const fadingDominance = dominanceFactor * Math.max(0, 1 - k / horizon);
      projectedRate = projectedRate * (1 - fadingDominance);
    }

    totalRate += projectedRate;
  }

  return totalRate / horizon;
}

// ============================================================
// 3b. Bond Market Absorption Capacity (Phase 8 Fix 3)
// ============================================================

/**
 * Compute the private market's capacity to absorb Treasury bond issuance.
 *
 * In healthy conditions with strong savings and flight-to-safety demand,
 * capacity is high and the same bond issuance produces less yield pressure.
 * In crisis conditions with depleted savings and sovereign confidence erosion,
 * capacity is low and yield pressure is amplified.
 *
 * Five factors:
 *   1. Flight to safety: negative equity returns → investors flee to bonds
 *   2. Yield self-correction: higher yields attract buyers (dampened by sovereign stress)
 *   3. Savings capacity: higher private savings → more money to buy bonds
 *   4. Inflation deterrent: high inflation → bonds less attractive (negative real return)
 *   5. Sovereign confidence: rapid debt/GDP deterioration → even high yields don't attract
 *
 * Source: Krishnamurthy & Vissing-Jorgensen (2012) "The Aggregate Demand for
 *         Treasury Debt"; Greenwood & Vayanos (2014) "Bond Supply and Excess
 *         Bond Returns"; Caballero et al. (2017) "The Safe Assets Shortage."
 *
 * @param equityMarketReturn - Previous year's equity market return (from equity module)
 * @param tenYearYield - Current 10Y yield level
 * @param compositeInflation - Current composite inflation rate
 * @param consumptionToIncomeRatio - Consumption / disposable income (1 - savings rate)
 * @param debtGDPChangeRate - Year-over-year change in debt/GDP ratio (positive = deteriorating)
 * @param safetyFlightSensitivity - How strongly negative equity returns boost bond demand (default 1.5)
 * @param yieldAttractionMidpoint - Yield level at which self-correction is half-strength (default 0.06)
 * @param inflationDeterrentSensitivity - How strongly inflation deters bond buyers (default 1.0)
 * @param sovereignConfidenceDecayRate - How fast sovereign confidence erodes (default 2.0)
 * @returns absorptionCapacity multiplier (>1 = strong demand, <1 = weak demand). Floor at 0.20.
 */
export function computeAbsorptionCapacity(
  equityMarketReturn: number,
  tenYearYield: number,
  compositeInflation: number,
  consumptionToIncomeRatio: number,
  debtGDPChangeRate: number,
  safetyFlightSensitivity: number = 1.5,
  yieldAttractionMidpoint: number = 0.06,
  inflationDeterrentSensitivity: number = 1.0,
  sovereignConfidenceDecayRate: number = 2.0,
): number {
  // Factor 1: Flight to safety
  // When equities fall, investors buy Treasuries. Stronger effect for larger drops.
  // +10% equity return → 0 flight demand; -20% equity return → +0.30 boost (at default sensitivity)
  const safetyDemand = Math.max(0, -equityMarketReturn * safetyFlightSensitivity);

  // Factor 2: Yield self-correction
  // Higher yields attract buyers — up to a point. A 6% Treasury is attractive;
  // a 12% Treasury in a collapsing economy is a warning sign.
  // Raw attraction ramps from 0 to 1 as yield approaches the midpoint.
  const rawYieldAttraction = yieldAttractionMidpoint > 0
    ? Math.min(1.0, tenYearYield / yieldAttractionMidpoint)
    : 0;

  // Factor 5: Sovereign confidence (dampens yield attraction)
  // When debt/GDP is deteriorating rapidly, high yields signal risk rather than
  // opportunity. Investors don't pile into 8% bonds if they think 12% is coming.
  // debtGDPChangeRate > 0 means trajectory is worsening.
  // At +0.30 change rate (debt/GDP rising 30pp/year): confidence factor ≈ 0.63
  // At +0.05 change rate (slow drift): confidence factor ≈ 0.91
  const sovereignStress = Math.max(0, debtGDPChangeRate * sovereignConfidenceDecayRate);
  const confidenceFactor = 1.0 / (1.0 + sovereignStress);

  // Yield attraction dampened by sovereign confidence
  const yieldAttraction = rawYieldAttraction * confidenceFactor;

  // Factor 3: Savings capacity
  // When people save more (low consumption/income ratio), more money flows to bonds.
  // consumptionToIncomeRatio near 1.0 = no savings; near 0.5 = high savings.
  const savingsRate = Math.max(0.05, 1.0 - consumptionToIncomeRatio);
  const baselineSavingsRate = 0.08; // ~8% US personal savings rate baseline
  const savingsCapacity = savingsRate / baselineSavingsRate; // >1 when savings elevated

  // Factor 4: Inflation deterrent
  // High inflation makes fixed-rate bonds unattractive (negative real return).
  // At 5% inflation: deterrent ≈ 1.05; at 15% inflation: deterrent ≈ 1.15
  const inflationDeterrent = 1.0 + Math.max(0, compositeInflation) * inflationDeterrentSensitivity;

  // Combined absorption capacity
  const capacity = (1.0 + safetyDemand + yieldAttraction) * savingsCapacity / inflationDeterrent;

  // Floor: even in worst case, some institutional demand exists (regulatory requirements)
  return Math.max(0.20, capacity);
}

// ============================================================
// 4. Ten-Year Yield
// ============================================================

/**
 * Compute the 10-year Treasury yield from its components.
 *
 * The yield is the maximum of the policy rate (no-arbitrage floor:
 * you wouldn't lock money up for 10 years at a lower rate than overnight)
 * and the sum of: expected average policy rate + term premium + fiscal
 * risk premium + supply pressure premium.
 *
 * Source: Kim & Wright (2005) term structure decomposition;
 *         D'Amico et al. (2012) "Flow and Stock Effects of Large-Scale
 *         Treasury Purchases."
 *
 * @param policyRate - Current Fed policy rate (retained in signature for rate transmission; NOT used as floor)
 * @param expectedAvgPolicyRate - Expected average rate over next 10 years
 * @param termPremium - Duration compensation (TERM_PREMIUM, 0.005)
 * @param fiscalRiskPremium - Debt-driven risk premium (from computeFiscalRiskPremium)
 * @param bondFinancedDeficit - Deficit amount financed by bond issuance (already net of monetization)
 * @param foreignDemandRatio - Foreign share of Treasury purchases
 * @param nominalGDP - Current nominal GDP
 * @param absorptionCapacity - Phase 8 Fix 3: Private market demand multiplier (from computeAbsorptionCapacity)
 * @param supplyPressureSensitivity - Phase 8 Fix 3: Overall scaling of supply pressure (config)
 * @param baselineDeficitGDPRatio - Phase 8 Fix 4: Steady-state deficit/GDP (from constants). Supply
 *   pressure is computed on the EXCESS above baseline. At initial conditions, the market has already
 *   absorbed the steady-state deficit and priced it into yields — only marginal changes move rates.
 *   Source: Krishnamurthy & Vissing-Jorgensen (2012) "Aggregate Demand for Treasury Debt" — market
 *   adjusts expectations to absorb anticipated supply; only surprises create yield pressure.
 * @returns Ten-year yield and supply pressure premium
 */
export function computeTenYearYield(
  policyRate: number,
  expectedAvgPolicyRate: number,
  termPremium: number,
  fiscalRiskPremium: number,
  bondFinancedDeficit: number,
  foreignDemandRatio: number,
  nominalGDP: number,
  absorptionCapacity: number = 1.0,
  supplyPressureSensitivity: number = 1.0,
  baselineDeficitGDPRatio: number = 0,
): {
  tenYearYield: number;
  supplyPressurePremium: number;
} {
  // Supply pressure: net domestic absorption of Treasury supply
  // Higher deficit, less foreign demand → more bonds for domestic market to absorb
  // Phase 8 fix: bondFinancedDeficit is already net of monetization (= totalDeficit × (1 - monetizationRate))
  // so we do NOT multiply by (1 - monetizationRate) again here. The previous code double-counted it.
  //
  // Phase 8 Fix 3: Supply pressure is divided by absorption capacity and sensitivity.
  // When private market demand is strong (capacity > 1), the same bond issuance produces
  // less yield pressure. When demand is weak (capacity < 1), pressure is amplified.
  //
  // Phase 8 Fix 4: Supply pressure is RELATIVE to baseline. At initial conditions,
  // the market has already absorbed steady-state deficits (~6% of GDP). Only EXCESS
  // deficit above baseline creates marginal yield pressure. Without this, steady-state
  // deficits produce ~130bp of spurious supply pressure at initial conditions.
  const rawDomesticAbsorption = nominalGDP > 0
    ? (bondFinancedDeficit * (1 - foreignDemandRatio)) / nominalGDP
    : 0;
  const baselineDomesticAbsorption = baselineDeficitGDPRatio * (1 - foreignDemandRatio);
  const excessAbsorption = rawDomesticAbsorption - baselineDomesticAbsorption;
  const supplyPressurePremium = Math.max(0,
    excessAbsorption / (absorptionCapacity * supplyPressureSensitivity),
  );

  // Fundamental yield = expectations + premiums
  const fundamentalYield =
    expectedAvgPolicyRate + termPremium + fiscalRiskPremium + supplyPressurePremium;

  // Floor at zero — bonds must compete with cash. Yield curve inversion
  // (10Y below policy rate) is permitted and economically meaningful.
  // The US had an inverted curve for most of 2022-2024 (Fed funds 5.25%,
  // 10Y at 3.8-4.5%). The expectations channel already captures anticipated
  // rate cuts — flooring at policyRate would throw that away.
  const tenYearYield = Math.max(0, fundamentalYield);

  return {
    tenYearYield,
    supplyPressurePremium,
  };
}

// ============================================================
// 5. Rate Transmission
// ============================================================

/**
 * Derive real-economy interest rates from the policy rate and 10Y yield.
 *
 * These transmission rates feed into macro.ts to affect:
 *   - mortgageRate → shelter inflation (housing channel)
 *   - corporateBorrowingRate → investment dampening (crowding out channel)
 *   - consumerCreditRate → consumer spending (credit channel)
 *
 * Source: Fed H.15 Selected Interest Rates for spread calibration;
 *         Gilchrist & Zakrajsek (2012) "Credit Spreads and Business Cycle Fluctuations."
 *
 * @param tenYearYield - 10-year Treasury yield
 * @param policyRate - Federal Reserve policy rate
 * @param baseMortgageSpread - Baseline 30Y mortgage spread over 10Y (BASELINE_MORTGAGE_SPREAD, ~0.017)
 * @param baseCorporateSpread - Baseline BBB corporate spread (BASE_CORPORATE_SPREAD, ~0.015)
 * @param debtGDPRatio - Current debt/GDP (stress increases corporate spreads)
 * @param baselineDebtGDPRatio - Debt/GDP at simulation start
 * @returns Transmission rates for mortgage, corporate, and consumer credit
 */
export function computeRateTransmission(
  tenYearYield: number,
  policyRate: number,
  baseMortgageSpread: number,
  baseCorporateSpread: number,
  debtGDPRatio: number,
  baselineDebtGDPRatio: number,
): {
  mortgageRate: number;
  corporateBorrowingRate: number;
  consumerCreditRate: number;
} {
  // Mortgage rate = 10Y yield + mortgage spread (relatively stable)
  const mortgageRate = tenYearYield + baseMortgageSpread;

  // Corporate borrowing rate: spread widens under fiscal stress
  // Stress factor: increases corporate spread by up to 2x when debt/GDP doubles from baseline
  const stressFactor = 1 + Math.max(0, (debtGDPRatio - baselineDebtGDPRatio) / baselineDebtGDPRatio);
  const corporateBorrowingRate = tenYearYield + baseCorporateSpread * stressFactor;

  // Consumer credit rate: tracks policy rate with a spread
  // Source: Fed G.19 Consumer Credit data — credit card rates ≈ Fed funds + 14-18%
  // We use a compressed representation focused on rate sensitivity, not absolute level
  const CONSUMER_CREDIT_SPREAD = 0.10; // 1000bp base spread for consumer credit
  const consumerCreditRate = policyRate + CONSUMER_CREDIT_SPREAD;

  return {
    mortgageRate,
    corporateBorrowingRate,
    consumerCreditRate,
  };
}

// ============================================================
// 6. Baseline Bond Market State
// ============================================================

/**
 * Returns the initial BondMarketState at simulation start (year 0).
 *
 * All rates reflect the current market conditions from FRED data.
 * Source: FRED DGS10, MORTGAGE30US, FEDFUNDS.
 */
export function getBaselineBondMarketState(): BondMarketState {
  return {
    tenYearYield: INITIAL_10Y_YIELD,
    expectedAveragePolicyRate: INITIAL_POLICY_RATE,
    termPremium: TERM_PREMIUM,
    fiscalRiskPremium: 0,
    supplyPressurePremium: 0,
    mortgageRate: INITIAL_10Y_YIELD + BASELINE_MORTGAGE_SPREAD,
    corporateBorrowingRate: INITIAL_10Y_YIELD + BASE_CORPORATE_SPREAD,
    foreignDemandRatio: FOREIGN_DEMAND_INITIAL,
    consolidationCredibility: 1.0,
    absorptionCapacity: 1.0,
    // Phase 8 Fix 4: Fiscal risk sub-components (all zero at baseline)
    fiscalRiskTrajectoryComponent: 0,
    fiscalRiskSustainabilityComponent: 0,
    fiscalRiskLevelComponent: 0,
  };
}
