/**
 * ATLAS Monetary Model
 *
 * Implements Fisher equation and net neutral zone calculations
 * per DATA_MODEL.md Section 7 and POLICY_MODEL.md Section 5.
 *
 * Key equation: M(t) x V(t) = P(t) x Y(t)
 *
 * All functions are PURE -- no side effects, no state mutation.
 */

import type { MonetaryState } from '@/types';
import {
  BASELINE_MONEY_SUPPLY,
  BASELINE_VELOCITY_OF_MONEY,
  BASELINE_PRICE_LEVEL,
  BASELINE_GDP_REAL_2025,
  BASELINE_GDP_NOMINAL_2025,
  FEDERAL_REVENUE_GDP_RATIO,
  MAX_PRICE_LEVEL,
} from './constants';

/**
 * Compute dynamic money velocity based on economic conditions.
 * Velocity falls during recessions (high unemployment) and when consumption drops.
 *
 * @param baselineVelocity - FRED M2V baseline
 * @param unemploymentRate - Current unemployment rate [0, 1]
 * @param naturalUnemploymentRate - Natural rate (e.g., 0.044)
 * @param totalConsumption - Current aggregate consumption
 * @param baselineConsumption - First-year consumption (stored from t=0)
 * @param sensitivity - How much velocity drops per pp excess UE (default 0.03)
 * @param floorRatio - Minimum velocity as fraction of baseline (default 0.5)
 * @returns Dynamic velocity of money
 */
export function computeDynamicVelocity(
  baselineVelocity: number,
  unemploymentRate: number,
  naturalUnemploymentRate: number,
  totalConsumption: number,
  baselineConsumption: number,
  sensitivity: number,
  floorRatio: number,
): number {
  // Excess unemployment in percentage points (e.g., 0.10 - 0.044 = 0.056 -> 5.6pp)
  const excessUE = Math.max(0, unemploymentRate - naturalUnemploymentRate);
  const excessUEpp = excessUE * 100; // Convert to percentage points

  // Unemployment effect: velocity drops with excess unemployment
  const unemploymentEffect = 1 - sensitivity * excessUEpp;

  // Demand effect: velocity drops when consumption falls below baseline
  const demandEffect = baselineConsumption > 0
    ? Math.max(0.5, totalConsumption / baselineConsumption)
    : 1.0;

  // Combined multiplier with floor
  const velocityMultiplier = Math.max(floorRatio, unemploymentEffect * demandEffect);

  return baselineVelocity * velocityMultiplier;
}

/**
 * DEPRECATED Phase 8a: This function is superseded by computeMonetizationRate()
 * in monetization.ts. The old logic returned moneyCreatedFraction ≈ 1.0 whenever
 * fiscalDeficitGDPRatio > 0 (which is always), causing hyperinflation.
 * Phase 7+ uses deficit-monetization (monetization.ts) where the default is 0
 * (deficits are bond-financed, not monetized). Kept for backward compatibility
 * with any test code that references it directly.
 *
 * @param nominalGDP - Current nominal GDP
 * @param totalPolicyCost - Total cost of all active policies
 * @param fiscalDeficitGDPRatio - Current deficit / GDP ratio
 * @param revenueGDPRatio - Government revenue / GDP ratio
 * @returns Funding split fractions
 */
export function computeEndogenousFundingSplit(
  nominalGDP: number,
  totalPolicyCost: number,
  fiscalDeficitGDPRatio: number,
  revenueGDPRatio: number = FEDERAL_REVENUE_GDP_RATIO,
): { taxFundedFraction: number; moneyCreatedFraction: number } {
  if (totalPolicyCost <= 0) {
    return { taxFundedFraction: 1, moneyCreatedFraction: 0 };
  }

  const govRevenue = nominalGDP * revenueGDPRatio;
  // Existing obligations ~ revenue x (1 + deficit ratio) -- the deficit is already committed spending
  const existingObligations = govRevenue * (1 + Math.max(0, fiscalDeficitGDPRatio));
  const surplusForNewPolicy = Math.max(0, govRevenue - existingObligations);

  const taxFundedFraction = Math.min(1, surplusForNewPolicy / Math.max(1, totalPolicyCost));
  const moneyCreatedFraction = 1 - taxFundedFraction;

  return { taxFundedFraction, moneyCreatedFraction };
}

/**
 * Compute the monetary state for a given year.
 *
 * Fisher Equation (DATA_MODEL.md Section 7.1):
 *   M(t) x V(t) = P(t) x Y(t)
 *
 * @param priceLevel - Current price level P(t)
 * @param realGDP - Current real GDP Y(t)
 * @param aiDeflationRate - AI-driven deflation rate
 * @param totalTransfers - Total transfer payments being distributed
 * @param population - Total population
 * @param moneyCreationShare - Fraction of transfers funded by money creation [0, 1]
 * @param previousMoneySupply - Previous year's money supply
 * @param velocityOfMoney - Current velocity of money
 * @returns Full MonetaryState
 */
export function computeMonetaryState(
  priceLevel: number,
  realGDP: number,
  aiDeflationRate: number,
  totalTransfers: number,
  population: number,
  moneyCreationShare: number,
  previousMoneySupply: number,
  velocityOfMoney: number = BASELINE_VELOCITY_OF_MONEY,
): MonetaryState {
  // How much money is created to fund transfers
  const deltaM = totalTransfers * moneyCreationShare;

  // Floating-point safety: cap moneySupply to prevent Infinity propagation.
  // MAX_PRICE_LEVEL * BASELINE_GDP_NOMINAL_2025 ≈ 3e22 — well within IEEE 754 range.
  const moneySupply = Math.min(MAX_PRICE_LEVEL * BASELINE_GDP_NOMINAL_2025, previousMoneySupply + deltaM);

  // Maximum neutral transfers -- the net neutral zone
  // Formula (DATA_MODEL.md Section 7.2):
  //   max_neutral_transfers = (ai_deflation_rate * Y) / V
  // This is the amount that can be injected without exceeding inflation targets
  const maxNeutralTransfers = velocityOfMoney > 0
    ? (aiDeflationRate * realGDP) / velocityOfMoney
    : 0;

  // Actual inflation from transfers
  // Formula (POLICY_MODEL.md Section 5.1):
  //   inflation_from_transfers(t) = (deltaM * V) / Y - ai_deflation_rate
  const inflationFromTransfers = realGDP > 0
    ? (deltaM * velocityOfMoney) / realGDP - aiDeflationRate
    : 0;

  const isWithinNeutralZone = totalTransfers <= maxNeutralTransfers;

  return {
    moneySupply,
    velocityOfMoney,
    priceLevel,
    realGDP,
    moneyCreationShare,
    maxNeutralTransfers,
    actualInflationFromTransfers: Math.max(0, inflationFromTransfers),
    isWithinNeutralZone,
    dynamicVelocity: velocityOfMoney, // Default to static velocity; overridden by simulation.ts
  };
}

/**
 * Compute the maximum transfer per capita within the net neutral zone.
 *
 * Formula (DATA_MODEL.md Section 7.2):
 *   T_max_per_capita = deltaM_max / N
 *
 * @param maxNeutralTransfers - Total neutral transfers
 * @param population - Total population
 * @returns Maximum per-capita transfer in dollars
 */
export function computeMaxNeutralTransferPerCapita(
  maxNeutralTransfers: number,
  population: number,
): number {
  return population > 0 ? maxNeutralTransfers / population : 0;
}

/**
 * Get baseline monetary state for simulation start.
 */
export function getBaselineMonetaryState(): MonetaryState {
  return {
    moneySupply: BASELINE_MONEY_SUPPLY,
    velocityOfMoney: BASELINE_VELOCITY_OF_MONEY,
    priceLevel: BASELINE_PRICE_LEVEL,
    realGDP: BASELINE_GDP_REAL_2025,
    moneyCreationShare: 0.5,   // default mixed
    maxNeutralTransfers: 0,
    actualInflationFromTransfers: 0,
    isWithinNeutralZone: true,
    dynamicVelocity: BASELINE_VELOCITY_OF_MONEY,
  };
}
