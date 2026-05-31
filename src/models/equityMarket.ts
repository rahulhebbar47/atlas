/**
 * ATLAS Equity Market Module (Phase 7)
 *
 * Implements aggregate equity market valuation using the Gordon Growth Model
 * with an AI-driven P/E momentum premium that naturally fades as AI capability
 * S-curves flatten.
 *
 * Key relationships:
 *   basePE = (1 + g) / (r - g)           Gordon Growth
 *   effectivePE = basePE × (1 + (aiMult - 1) × momentum)
 *   marketCap = corporateProfits × effectivePE
 *   marketReturn = (marketCap(t) - marketCap(t-1)) / marketCap(t-1)
 *
 * All functions are PURE — no side effects, no state mutation.
 */

import type { EquityMarketState } from '@/types';
import {
  EQUITY_RISK_PREMIUM,
  BASELINE_SP500_LEVEL,
  BASELINE_CORPORATE_PROFITS,
} from './constants';

// ============================================================
// 1. Growth Momentum
// ============================================================

/**
 * Compute the AI growth momentum factor from capability score changes.
 *
 * This tracks the velocity of AI capability improvement across the 3 vectors
 * (generative, agentic, embodied). When S-curves are accelerating, momentum
 * is high → AI P/E premium applies. When S-curves flatten, momentum naturally
 * fades → premium disappears without any hardcoded reversion.
 *
 * The momentum is relative to the historical maximum change, so it naturally
 * peaks during the steepest part of the S-curve and decays afterward.
 *
 * @param currentCapabilityScores - Current year's [generative, agentic, embodied] scores
 * @param previousCapabilityScores - Previous year's scores (null for year 0)
 * @param historicalMaxChange - Running maximum of total capability change across all prior years
 * @returns { growthMomentum, currentChange, newHistoricalMax }
 */
export function computeGrowthMomentum(
  currentCapabilityScores: readonly number[],
  previousCapabilityScores: readonly number[] | null,
  historicalMaxChange: number,
): {
  growthMomentum: number;
  currentChange: number;
  newHistoricalMax: number;
} {
  // Year 0 or no previous data: no momentum
  if (!previousCapabilityScores || previousCapabilityScores.length === 0) {
    return {
      growthMomentum: 0,
      currentChange: 0,
      newHistoricalMax: historicalMaxChange,
    };
  }

  // Sum of absolute changes across all capability vectors
  let currentChange = 0;
  const numVectors = Math.min(currentCapabilityScores.length, previousCapabilityScores.length);
  for (let i = 0; i < numVectors; i++) {
    currentChange += Math.abs((currentCapabilityScores[i] ?? 0) - (previousCapabilityScores[i] ?? 0));
  }

  // Update running maximum
  const newHistoricalMax = Math.max(historicalMaxChange, currentChange);

  // Momentum = current velocity / peak velocity
  // When S-curves are at their steepest: momentum ≈ 1
  // When S-curves flatten: momentum → 0 (no hardcoded decay needed)
  const growthMomentum = newHistoricalMax > 0
    ? currentChange / newHistoricalMax
    : 0;

  return {
    growthMomentum,
    currentChange,
    newHistoricalMax,
  };
}

// ============================================================
// 2. Equity Valuation (Gordon Growth Model)
// ============================================================

/**
 * Compute aggregate equity market valuation using the Gordon Growth Model.
 *
 * The Gordon Growth Model (Gordon & Shapiro, 1956) values equities as:
 *   P = D / (r - g)  →  P/E = (1 + g) / (r - g)
 * where:
 *   r = discount rate (10Y yield + equity risk premium)
 *   g = expected earnings growth rate (2-year average of actual profit growth)
 *
 * The AI P/E multiplier scales the base P/E by growth momentum:
 *   effectivePE = basePE × (1 + (aiPEMultiplier - 1) × growthMomentum)
 * When aiPEMultiplier = 1.0 (default, rational pricing): no premium regardless of momentum.
 * When aiPEMultiplier > 1.0 (hype): premium scales with AI progress velocity.
 *
 * Source: Gordon (1962) "The Investment, Financing, and Valuation of the Corporation";
 *         Shiller CAPE methodology for historical P/E bounds;
 *         Damodaran (2024) implied equity risk premium.
 *
 * @param tenYearYield - Current 10-year Treasury yield (from bond market module)
 * @param equityRiskPremium - ERP (EQUITY_RISK_PREMIUM, 0.045)
 * @param currentCorporateProfits - Current year's after-tax corporate profits
 * @param prevCorporateProfits - Previous year's after-tax corporate profits
 * @param prevPrevCorporateProfits - Two years ago corporate profits (for 2-year avg growth)
 * @param previousMarketCap - Previous year's aggregate market capitalization
 * @param growthMomentum - AI capability growth momentum [0, 1] (from computeGrowthMomentum)
 * @param aiPEMultiplier - User-configurable AI hype multiplier (config, 1.0 = rational)
 * @returns EquityMarketState with market cap, P/E, return, etc.
 */
export function computeEquityValuation(
  tenYearYield: number,
  equityRiskPremium: number,
  currentCorporateProfits: number,
  prevCorporateProfits: number,
  prevPrevCorporateProfits: number,
  previousMarketCap: number,
  growthMomentum: number,
  aiPEMultiplier: number,
): EquityMarketState {
  // Discount rate = 10Y yield + equity risk premium
  const equityDiscountRate = tenYearYield + equityRiskPremium;

  // Expected growth rate: 2-year average of actual profit growth
  let expectedGrowth: number;
  if (prevCorporateProfits > 0 && prevPrevCorporateProfits > 0) {
    const growth1 = (currentCorporateProfits - prevCorporateProfits) / prevCorporateProfits;
    const growth2 = (prevCorporateProfits - prevPrevCorporateProfits) / prevPrevCorporateProfits;
    expectedGrowth = (growth1 + growth2) / 2;
  } else if (prevCorporateProfits > 0) {
    expectedGrowth = (currentCorporateProfits - prevCorporateProfits) / prevCorporateProfits;
  } else {
    expectedGrowth = 0.02; // Fallback: 2% nominal growth
  }

  // Gordon Growth: P/E = (1 + g) / (r - g)
  // Singularity guard: when r ≤ g, denominator is zero or negative.
  // Use minimum denominator gap (1e-6) to prevent IEEE 754 division-by-zero/infinity.
  const denominator = Math.max(1e-6, equityDiscountRate - expectedGrowth);
  const basePE = (1 + expectedGrowth) / denominator;

  // AI P/E premium: scales with growth momentum
  // aiPEMultiplier = 1.0 → no premium (rational pricing)
  // aiPEMultiplier = 2.0 + momentum = 1.0 → 2x base P/E at peak hype
  const effectivePEMultiplier = 1 + (aiPEMultiplier - 1) * growthMomentum;
  const peRatio = basePE * effectivePEMultiplier;

  // Market capitalization = profits × P/E
  const profits = Math.max(0, currentCorporateProfits);
  const aggregateMarketCap = profits * peRatio;

  // Market return: year-over-year change in market cap
  const marketReturn = previousMarketCap > 0
    ? (aggregateMarketCap - previousMarketCap) / previousMarketCap
    : 0;

  return {
    aggregateMarketCap,
    peRatio,
    effectivePEMultiplier,
    growthMomentum,
    equityDiscountRate,
    marketReturn,
  };
}

// ============================================================
// 3. Baseline Equity Market State
// ============================================================

/**
 * Returns the initial EquityMarketState at simulation start (year 0).
 *
 * Market cap is derived from baseline S&P 500 level and total market to
 * S&P 500 ratio (~1.7x for Wilshire 5000 / S&P 500).
 *
 * Source: FRED SP500, Wilshire 5000 total market index.
 */
export function getBaselineEquityMarketState(): EquityMarketState {
  // Estimate total market cap from S&P 500 level
  // S&P 500 represents ~80% of total market cap
  // At ~5800 index: S&P 500 market cap ≈ $50T → total market ≈ $62T
  // But we use profits × implied P/E for consistency
  const impliedPE = BASELINE_CORPORATE_PROFITS > 0
    ? BASELINE_SP500_LEVEL * 10_000_000_000 / BASELINE_CORPORATE_PROFITS // rough SP500-to-earnings
    : 20;
  const baselinePE = impliedPE > 0 ? impliedPE : 20;

  return {
    aggregateMarketCap: BASELINE_CORPORATE_PROFITS * baselinePE,
    peRatio: baselinePE,
    effectivePEMultiplier: 1.0,
    growthMomentum: 0,
    equityDiscountRate: EQUITY_RISK_PREMIUM + 0.043, // Baseline: ERP + initial 10Y
    marketReturn: 0,
  };
}
