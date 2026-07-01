/**
 * ATLAS Monetization Module (Phase 7)
 *
 * Replaces the broken computeEndogenousFundingSplit() which returned
 * moneyCreatedFraction = 1.0 in normal times, causing hyperinflation.
 *
 * Key insight: Government deficits are bond-financed by default (no inflation).
 * Money creation only occurs at the zero lower bound (QE) or during
 * fiscal dominance (Fed forced to partially monetize).
 *
 * Three cases:
 *   1. Zero lower bound → Fed doing QE → monetize at qeMonetizationRate
 *   2. Fiscal dominance → forced partial monetization proportional to rate gap
 *   3. Normal times → deficit fully bond-financed → monetization rate = 0
 *
 * THIS IS THE CRITICAL HYPERINFLATION FIX. Default is 0 (no monetization),
 * not 1.0 as in the old computeEndogenousFundingSplit().
 *
 * All functions are PURE — no side effects, no state mutation.
 */

import type { MonetizationState } from '@/types';
import { FISCAL_MONETARY_SAFETY_CAP } from './constants';

/**
 * Result of monetization rate computation.
 * Phase 8 fix: Returns a result object instead of a bare number to provide
 * yield response and LOLR diagnostics without duplicating the formula.
 */
export interface MonetizationRateResult {
  /** The effective monetization rate (max of all applicable cases). */
  rate: number;
  /** Whether yield-responsive monetization (Case 5) fired this year. */
  yieldResponseActive: boolean;
  /** Monetization rate from yield response case (before max-of-all). */
  yieldResponseMonetization: number;
  /** Whether lender-of-last-resort (Case 6) fired this year. */
  lolrActive: boolean;
  /** Monetization rate from LOLR case (before max-of-all). */
  lolrMonetization: number;
  /** Phase 8 Fix 3: Whether monetization taper floor raised the rate. */
  taperApplied: boolean;
}

/**
 * Compute the monetization rate — the fraction of the fiscal deficit
 * that the central bank finances via money creation.
 *
 * Phase 8 fix: Restructured from sequential if/return to compute ALL
 * applicable cases and return the MAXIMUM. This fixes the bug where
 * Case 1 (ZLB) blocked Case 2 (financial repression) — an economy can
 * be at ZLB AND have unsustainable debt service simultaneously.
 *
 * Six regimes (all evaluated independently, max wins):
 *   Case 1: Zero lower bound (ZLB) — Fed doing QE at qeMonetizationRate.
 *   Case 2: Financial repression — debt service exceeds revenue, Fed must
 *           absorb bonds the market won't buy.
 *   Case 3: Fiscal dominance — Fed suppressing rates below Taylor Rule.
 *   Case 4: Normal times — deficit fully bond-financed (rate = 0).
 *   Case 5: Yield-responsive monetization — central bank increases purchases
 *           when bond yields spike (yield curve control).
 *   Case 6: Lender of last resort — structural backstop when yields reach
 *           crisis levels (>12%). NOT a policy choice; models the central
 *           bank's involuntary role in preventing financial system collapse.
 *
 * Source: Reinhart & Sbrancia (2015) "The Liquidation of Government Debt";
 *         BOJ Yield Curve Control (2016-present); Fed Treasury purchases (2020-2022).
 *
 * @param policyRate - Current Federal Reserve policy rate
 * @param effectiveLowerBound - Config: rate below which QE triggers (default -0.005)
 * @param fiscalDominanceActive - Whether fiscal dominance regime is active
 * @param taylorPrescribed - Taylor Rule's prescribed rate (what the Fed "should" set)
 * @param actualPolicyRate - What the Fed actually set (may be below Taylor under fiscal dominance)
 * @param qeMonetizationRate - Config: fraction of deficit monetized during QE (default 0.40)
 * @param debtServiceRatio - Interest expense / total government revenue (0 if unavailable)
 * @param maxFinancialRepressionRate - Phase 8a: cap on monetization under fiscal stress (default 1.0)
 * @param prevTenYearYield - Phase 8 fix: Previous year's 10Y yield (for yield-responsive monetization)
 * @param yieldResponseThreshold - Phase 8 fix: 10Y yield above which central bank increases purchases
 * @param maxYieldResponseRate - Phase 8 fix: Maximum monetization rate under yield stress
 * @param prevMonetizationRate - Phase 8 Fix 3: Previous year's monetization rate (for asymmetric taper)
 * @returns MonetizationRateResult with effective rate, yield response, LOLR, and taper diagnostics
 */
export function computeMonetizationRate(
  policyRate: number,
  effectiveLowerBound: number,
  fiscalDominanceActive: boolean,
  taylorPrescribed: number,
  actualPolicyRate: number,
  qeMonetizationRate: number,
  debtServiceRatio: number = 0,
  maxFinancialRepressionRate: number = 1.0,
  prevTenYearYield: number = 0,
  yieldResponseThreshold: number = 0.08,  // DEPRECATED (E-8c F-B): the level trigger retired; kept in place per the no-delete rule
  maxYieldResponseRate: number = 0.70,
  prevMonetizationRate: number = 0,
  // E-8c F-B (ratified): the fiscal-dominance co-conditions (Sargent-Wallace 1981)
  prevFiscalRiskPremium: number = 0,
  dominanceThreshold: number = 0.50,
  premiumCoCondition: number = 0.01,
): MonetizationRateResult {
  // Phase 8 fix: Compute ALL applicable cases and return the MAXIMUM.
  // Previously used sequential if/return which made cases mutually exclusive.
  let rate = 0; // Case 4 default: normal times, no monetization

  // Case 1: At zero lower bound — Fed doing QE
  if (policyRate <= effectiveLowerBound) {
    rate = Math.max(rate, qeMonetizationRate);
  }

  // Case 2: Financial repression — when interest expense exceeds revenue,
  // the government literally cannot service its debt without money creation.
  // The central bank must absorb Treasury issuance that the market won't.
  // This kicks in gradually above debtServiceRatio = 0.50 (50% of revenue goes to interest),
  // reaching full stress at debtServiceRatio = 1.0 (100% of revenue = interest).
  // Phase 8 fix: No longer blocked by Case 1 — both can fire simultaneously.
  // Source: Reinhart & Sbrancia (2015) "The Liquidation of Government Debt"
  if (debtServiceRatio > 0.50) {
    const stressIntensity = Math.min(1, (debtServiceRatio - 0.50) / 0.50);
    const repressionRate = qeMonetizationRate + stressIntensity * (maxFinancialRepressionRate - qeMonetizationRate);
    rate = Math.max(rate, repressionRate);
  }

  // Case 3: Fiscal dominance — forced partial monetization
  if (fiscalDominanceActive && taylorPrescribed > 0) {
    const rateGap = taylorPrescribed - actualPolicyRate;
    const dominanceRate = Math.min(qeMonetizationRate, Math.max(0, rateGap / taylorPrescribed));
    rate = Math.max(rate, dominanceRate);
  }

  // Case 5: Yield-responsive monetization — central bank increases bond
  // purchases when yields spike, modeling yield curve control.
  // Uses PREVIOUS year's yield (lagged) to avoid circular dependency and
  // model the real-world delay between market stress and central bank response.
  // Source: BOJ YCC (2016+), Fed Treasury purchases (2020-2022), RBA (2020-2021)
  // E-8c F-B (ratified): re-conditioned as a FISCAL-DOMINANCE event (Sargent-Wallace 1981).
  // The old form fired on the 10Y LEVEL regardless of cause — it could not distinguish a bond
  // market repricing inflation expectations (Volcker 1981: 15% yields, ZERO monetization) from
  // fiscal-distress dysfunction. Now: BOTH the service ratio must exceed the dominance gate
  // (UK-1920s/France-1926/Weimar poles, see constants) AND markets must be pricing fiscal stress
  // (the Laubach premium co-condition). Intensity = the service-ratio excess, normalized (the
  // same form the old yieldStress used, re-based to the dominance gate).
  let yieldResponseActive = false;
  let yieldResponseMonetization = 0;
  void prevTenYearYield; void yieldResponseThreshold;  // DEPRECATED inputs (E-8c F-B), retained per the no-delete rule
  if (debtServiceRatio > dominanceThreshold && prevFiscalRiskPremium > premiumCoCondition) {
    yieldResponseActive = true;
    const dominanceStress = Math.min(1, (debtServiceRatio - dominanceThreshold) / dominanceThreshold);
    yieldResponseMonetization = qeMonetizationRate + dominanceStress * (maxYieldResponseRate - qeMonetizationRate);
    rate = Math.max(rate, yieldResponseMonetization);
  }

  // Case 6: Lender of last resort — structural backstop of sovereign currency systems.
  //
  // When bond yields reach crisis levels, the central bank MUST absorb bonds to
  // prevent financial system collapse. Banks hold Treasuries as tier-1 capital;
  // pension funds and money markets hold them as "safe" assets; the repo market
  // uses them as collateral for ~$4T in daily transactions. A yield crisis
  // triggers cascading insolvency, collateral chain failure, and payment system
  // breakdown.
  //
  // No sovereign central bank with its own currency has ever let 10Y yields
  // sustain above ~15-20%. The Volcker Fed (most hawkish modern CB) let Fed
  // Funds hit 20% but 10Y Treasuries never breached ~16%. The ECB's "whatever
  // it takes" in 2012 broke the eurozone yield spiral when southern European
  // yields hit 7-8%.
  //
  // This is NOT a policy choice and does NOT vary by preset. It models a
  // structural feature: the central bank's involuntary role as lender of last
  // resort for sovereign debt markets.
  //
  // Source: Bagehot (1873) "Lombard Street"; Draghi (2012) ECB OMT program;
  //         Fed emergency Treasury purchases March 2020 ($1.6T in 3 weeks).
  //
  // Ramps monetization from the profile's maxYieldResponseRate up to
  // LOLR_MAX_MONETIZATION as yields go from LOLR_YIELD_THRESHOLD to
  // LOLR_YIELD_CEILING.
  const LOLR_YIELD_THRESHOLD = 0.12;  // 12%: crisis territory — banks face mark-to-market losses
  const LOLR_YIELD_CEILING = 0.25;    // 25%: full intervention — no sovereign CB has tolerated this
  const LOLR_MAX_MONETIZATION = 0.95; // CB absorbs nearly everything; thin bond market still trades

  let lolrActive = false;
  let lolrMonetization = 0;
  if (prevTenYearYield > LOLR_YIELD_THRESHOLD) {
    lolrActive = true;
    const crisisIntensity = Math.min(1,
      (prevTenYearYield - LOLR_YIELD_THRESHOLD) / (LOLR_YIELD_CEILING - LOLR_YIELD_THRESHOLD),
    );
    // Ramp from the profile's voluntary cap to the structural maximum
    lolrMonetization = maxYieldResponseRate + crisisIntensity * (LOLR_MAX_MONETIZATION - maxYieldResponseRate);
    rate = Math.max(rate, lolrMonetization);
  }

  // Phase 8 Fix 3: Asymmetric smoothing — central banks ramp up fast but taper gradually.
  // No central bank drops monetization by 45-65pp in one year. The Fed's COVID QE ramped
  // in weeks but tapered over 20 months. ECB APP ran ~4 years, wind-down over ~1 year.
  // BOJ YCC: 8+ years of gradual adjustment.
  //
  // At 0.25/year max decrease:
  //   0.95 → 0.70 (year 1) → 0.50 (year 2) → base rate takes over
  // This matches real-world 2-3 year tapering timelines.
  //
  // Source: Fed QE3 taper (Dec 2013 - Oct 2014); Fed COVID QE taper (Nov 2021 - Mar 2022);
  //         ECB APP wind-down (2018-2019).
  const MONETIZATION_TAPER_RATE = 0.25;
  let taperApplied = false;
  if (prevMonetizationRate > 0) {
    const taperFloor = prevMonetizationRate - MONETIZATION_TAPER_RATE;
    if (taperFloor > rate) {
      rate = taperFloor;
      taperApplied = true;
    }
  }

  return { rate, yieldResponseActive, yieldResponseMonetization, lolrActive, lolrMonetization, taperApplied };
}

/**
 * Compute money creation from deficit monetization and its inflationary effect.
 *
 * Only the monetized portion of the deficit creates new money.
 * The bond-financed portion causes crowding out (higher interest rates)
 * but NOT inflation — that's handled by the bond market module.
 *
 * Fisher equation for monetization inflation:
 *   inflationFromMonetization = (moneyCreated × velocity) / realGDP - aiDeflation
 *
 * This replaces the old inflationFromTransfers which used:
 *   deltaM = totalTransfers × moneyCreationShare (share ≈ 1.0 → hyperinflation)
 * with:
 *   deltaM = totalDeficit × monetizationRate (rate ≈ 0 normally → no inflation)
 *
 * @param totalDeficit - Total fiscal deficit (positive = deficit, negative = surplus)
 * @param monetizationRate - Fraction of deficit monetized [0, 1] (from computeMonetizationRate)
 * @param prevMoneySupply - Previous year's money supply
 * @param velocityOfMoney - Current velocity of money
 * @param nominalGDP - Current nominal GDP (for Fisher equation: inflation = ΔM × V / PY)
 * @param aiDeflationRate - Sector-weighted AI deflation rate (existing sectorWeightedDeflationRate)
 * @param transferShare - Phase 8 Fix 3: Transfer spending / total government spending [0, 1]
 * @param discretionaryShare - Phase 8 Fix 3: Discretionary spending / total government spending [0, 1]
 * @param interestShare - Phase 8 Fix 3: Interest expense / total government spending [0, 1]
 * @param transmissionSensitivity - Phase 8 Fix 3: User scaling factor for transmission (default 1.0)
 * @returns Money creation results with composition-adjusted inflation and transmission diagnostic
 */
export function computeMoneyCreation(
  totalDeficit: number,
  monetizationRate: number,
  prevMoneySupply: number,
  velocityOfMoney: number,
  nominalGDP: number,
  aiDeflationRate: number,
  // Phase 8 Fix 3: deficit composition for endogenous transmission efficiency
  transferShare: number = 0.50,
  discretionaryShare: number = 0.30,
  interestShare: number = 0.20,
  transmissionSensitivity: number = 1.0,
): {
  moneyCreated: number;
  moneySupply: number;
  bondFinancedDeficit: number;
  inflationFromMonetization: number;
  transmissionEfficiency: number;
} {
  // Only positive deficits create money; surpluses (negative deficit) do not
  const effectiveDeficit = Math.max(0, totalDeficit);

  const moneyCreated = effectiveDeficit * monetizationRate;

  // Cap money supply at safety limit to prevent floating-point overflow
  // CRITICAL: Full moneyCreated amount added to M2 — transmission efficiency
  // only affects the INFLATION computation, not the money supply accounting.
  // The reserves exist at the Fed whether or not they circulate.
  const moneySupply = Math.min(
    FISCAL_MONETARY_SAFETY_CAP,
    prevMoneySupply + moneyCreated,
  );

  const bondFinancedDeficit = effectiveDeficit * (1 - monetizationRate);

  // Phase 8 Fix 3: Composition-weighted transmission efficiency
  // The inflationary impact of monetization depends on WHERE the government spending goes:
  //   Transfer payments (SS, UI, SNAP, UBI) → high-MPC recipients → ~85% transmission
  //   Discretionary spending (salaries, contracts) → workers → ~70% transmission
  //   Interest expense → bondholders/institutions → ~20% transmission
  //
  // When interest expense dominates the deficit (as in debt crisis scenarios),
  // monetization produces much less CPI inflation per dollar because the money
  // flows to financial institutions that reinvest rather than spend.
  //
  // Source: Blanchard & Leigh (2013) for transfer multipliers; Ramey (2011) for
  //         government spending multipliers; Krishnamurthy & Vissing-Jorgensen
  //         (2012) for financial sector absorption of monetary expansion.
  const TRANSFER_TRANSMISSION = 0.85;       // High MPC: UI recipients, retirees, SNAP
  const DISCRETIONARY_TRANSMISSION = 0.70;  // Medium MPC: gov workers, contractors
  const INTEREST_TRANSMISSION = 0.20;       // Low MPC: pension funds, banks, wealthy bondholders

  const rawTransmission =
    transferShare * TRANSFER_TRANSMISSION +
    discretionaryShare * DISCRETIONARY_TRANSMISSION +
    interestShare * INTEREST_TRANSMISSION;

  const transmissionEfficiency = Math.min(1.0, rawTransmission * transmissionSensitivity);

  // Fisher equation with transmission efficiency:
  // Only the portion of monetized money that reaches consumers produces CPI inflation.
  const effectiveMoneyCreated = moneyCreated * transmissionEfficiency;

  // MV = PY → ΔP/P = ΔM × V / (P × Y) = ΔM × V / nominalGDP
  // Stage 4 (R9): SIGNED monetary inflation — NO max(0,…) floor and NO netting against an economy-wide
  // aiDeflationRate. AI deflation now lives exclusively inside the per-sector price terms (Stage 1.5),
  // so subtracting it here would double-count it. The composite price level goes wherever
  // Σ(sector inflation) + monetaryInflation points. (aiDeflationRate param retained for signature/back-
  // compat but no longer used here.)
  const inflationFromMonetization = nominalGDP > 0
    ? (effectiveMoneyCreated * velocityOfMoney) / nominalGDP
    : 0;
  void aiDeflationRate;  // Stage 4: intentionally unused (see above)

  return {
    moneyCreated,      // Total money created (full monetized amount — affects money supply)
    moneySupply,       // New money supply (full amount added)
    bondFinancedDeficit,
    inflationFromMonetization,  // Inflation (composition-adjusted via transmission)
    transmissionEfficiency,     // Diagnostic: what fraction transmitted to CPI
  };
}

/**
 * Get baseline monetization state for simulation start.
 *
 * All values are zero: at t=0, no deficit has been monetized,
 * no money has been created, and there is no monetization inflation.
 *
 * @returns Initial MonetizationState with all zeros
 */
export function getBaselineMonetizationState(): MonetizationState {
  return {
    monetizationRate: 0,
    moneyCreated: 0,
    bondFinancedDeficit: 0,
    inflationFromMonetization: 0,
    yieldResponseActive: false,
    yieldResponseMonetization: 0,
    lolrActive: false,
    lolrMonetization: 0,
    transmissionEfficiency: 0.70, // Baseline: ~50% transfer + ~30% discretionary + ~20% interest
    taperApplied: false,
  };
}
