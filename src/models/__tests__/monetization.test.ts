/**
 * ATLAS Monetization Module — Unit Tests
 *
 * Tests the monetization rate computation (the critical hyperinflation fix),
 * money creation from deficit monetization, and baseline state initialization.
 *
 * Key invariant: In normal times, monetizationRate = 0 (deficits are bond-financed).
 * The old computeEndogenousFundingSplit() returned 1.0 by default — that was the bug.
 */

import { describe, it, expect } from 'vitest';
import {
  computeMonetizationRate,
  computeMoneyCreation,
  getBaselineMonetizationState,
} from '@/models/monetization';
import { FISCAL_MONETARY_SAFETY_CAP } from '@/models/constants';

// ============================================================
// Standard test values
// ============================================================

const QE_MONETIZATION_RATE = 0.40;
const EFFECTIVE_LOWER_BOUND = -0.005;
const NOMINAL_GDP = 29_000_000_000_000; // $29T
const PREV_MONEY_SUPPLY = 21_000_000_000_000; // $21T
const VELOCITY = 1.2;
const AI_DEFLATION = 0.01;

// ============================================================
// computeMonetizationRate — the critical hyperinflation fix
// ============================================================

describe('computeMonetizationRate', () => {
  describe('Case 4: Normal times — THE critical hyperinflation fix', () => {
    it('returns 0 when policy rate is above ELB and no fiscal dominance', () => {
      const { rate } = computeMonetizationRate(
        0.05,                // policyRate: 5% — well above ELB
        EFFECTIVE_LOWER_BOUND,
        false,               // no fiscal dominance
        0.05,                // taylorPrescribed
        0.05,                // actualPolicyRate
        QE_MONETIZATION_RATE,
        0.20,                // debtServiceRatio: healthy
      );
      expect(rate).toBe(0);
    });

    it('returns 0 for moderate policy rates with no stress', () => {
      const { rate } = computeMonetizationRate(
        0.025,               // 2.5% policy rate
        EFFECTIVE_LOWER_BOUND,
        false,
        0.03,
        0.025,
        QE_MONETIZATION_RATE,
        0.30,                // debtServiceRatio: below 0.50 threshold
      );
      expect(rate).toBe(0);
    });

    it('returns 0 even with fiscal dominance flag if taylorPrescribed is 0', () => {
      // Edge case: fiscal dominance active but Taylor says 0 → no gap to monetize
      const { rate } = computeMonetizationRate(
        0.01,
        EFFECTIVE_LOWER_BOUND,
        true,                // fiscal dominance active
        0,                   // taylorPrescribed = 0
        0.01,
        QE_MONETIZATION_RATE,
        0.10,
      );
      expect(rate).toBe(0);
    });
  });

  describe('Case 1: Zero lower bound — Fed doing QE', () => {
    it('returns qeMonetizationRate when policy rate is at ELB', () => {
      const { rate } = computeMonetizationRate(
        EFFECTIVE_LOWER_BOUND, // exactly at ELB
        EFFECTIVE_LOWER_BOUND,
        false,
        0.03,
        EFFECTIVE_LOWER_BOUND,
        QE_MONETIZATION_RATE,
      );
      expect(rate).toBe(QE_MONETIZATION_RATE);
    });

    it('returns qeMonetizationRate when policy rate is below ELB', () => {
      const { rate } = computeMonetizationRate(
        -0.01,               // below ELB
        EFFECTIVE_LOWER_BOUND,
        false,
        0.02,
        -0.01,
        QE_MONETIZATION_RATE,
      );
      expect(rate).toBe(QE_MONETIZATION_RATE);
    });

    it('ZLB and fiscal dominance both fire, max wins', () => {
      // Both ZLB (Case 1) and fiscal dominance (Case 3) evaluate independently.
      // ZLB returns qeMonetizationRate=0.60, fiscal dominance returns less → max wins.
      const { rate } = computeMonetizationRate(
        -0.01,
        EFFECTIVE_LOWER_BOUND,
        true,                // fiscal dominance also active
        0.05,
        -0.01,
        0.60,                // QE rate
      );
      expect(rate).toBe(0.60);
    });
  });

  describe('Case 2: Financial repression — debtServiceRatio > 0.50', () => {
    it('begins ramping monetization just above 0.50 threshold', () => {
      const { rate } = computeMonetizationRate(
        0.03,                // above ELB
        EFFECTIVE_LOWER_BOUND,
        false,
        0.03,
        0.03,
        QE_MONETIZATION_RATE,
        0.55,                // debtServiceRatio slightly above 0.50
      );
      // stressIntensity = (0.55 - 0.50) / 0.50 = 0.10
      // rate = min(1.0, 0.40 + 0.10 × (1.0 - 0.40)) = 0.40 + 0.06 = 0.46
      expect(rate).toBeCloseTo(0.46, 10);
    });

    it('reaches full monetization at debtServiceRatio = 1.0', () => {
      const { rate } = computeMonetizationRate(
        0.03,
        EFFECTIVE_LOWER_BOUND,
        false,
        0.03,
        0.03,
        QE_MONETIZATION_RATE,
        1.0,                 // 100% of revenue goes to interest
      );
      // stressIntensity = (1.0 - 0.50) / 0.50 = 1.0
      // rate = min(1.0, 0.40 + 1.0 × (1.0 - 0.40)) = 0.40 + 0.60 = 1.0
      expect(rate).toBe(1.0);
    });

    it('caps at 1.0 for extreme debtServiceRatio above 1.0', () => {
      const { rate } = computeMonetizationRate(
        0.03,
        EFFECTIVE_LOWER_BOUND,
        false,
        0.03,
        0.03,
        QE_MONETIZATION_RATE,
        1.5,                 // debtServiceRatio > 1.0 (interest exceeds revenue)
      );
      // stressIntensity = min(1, (1.5 - 0.50) / 0.50) = min(1, 2.0) = 1.0
      // rate = min(1.0, 0.40 + 1.0 × 0.60) = 1.0
      expect(rate).toBe(1.0);
    });

    it('at midpoint (0.75) monetization is between QE rate and full', () => {
      const { rate } = computeMonetizationRate(
        0.03,
        EFFECTIVE_LOWER_BOUND,
        false,
        0.03,
        0.03,
        QE_MONETIZATION_RATE,
        0.75,
      );
      // stressIntensity = (0.75 - 0.50) / 0.50 = 0.50
      // rate = 0.40 + 0.50 × 0.60 = 0.70
      expect(rate).toBeCloseTo(0.70, 10);
    });

    it('financial repression exceeds fiscal dominance rate (max wins)', () => {
      // Both cases evaluate independently; financial repression produces higher rate
      const { rate } = computeMonetizationRate(
        0.03,
        EFFECTIVE_LOWER_BOUND,
        true,                // fiscal dominance also active
        0.10,                // large Taylor gap
        0.01,
        QE_MONETIZATION_RATE,
        0.60,                // above financial repression threshold
      );
      // stressIntensity = (0.60 - 0.50) / 0.50 = 0.20
      // rate = 0.40 + 0.20 × 0.60 = 0.52
      expect(rate).toBeCloseTo(0.52, 10);
    });

    it('Phase 8a: maxFinancialRepressionRate caps monetization below 1.0', () => {
      const { rate } = computeMonetizationRate(
        0.03,
        EFFECTIVE_LOWER_BOUND,
        false,
        0.03,
        0.03,
        QE_MONETIZATION_RATE,
        1.0,                 // extreme stress
        0.50,                // cap at 50%
      );
      // stressIntensity = 1.0
      // rate = min(0.50, 0.40 + 1.0 × (0.50 - 0.40)) = min(0.50, 0.50) = 0.50
      expect(rate).toBeCloseTo(0.50, 10);
    });

    it('Phase 8a: default maxFinancialRepressionRate=1.0 preserves existing behavior', () => {
      const { rate } = computeMonetizationRate(
        0.03,
        EFFECTIVE_LOWER_BOUND,
        false,
        0.03,
        0.03,
        QE_MONETIZATION_RATE,
        1.0,
        // No 8th arg → defaults to 1.0
      );
      // Same as existing test: rate = 1.0
      expect(rate).toBe(1.0);
    });

    it('Phase 8a: low maxFinancialRepressionRate limits mid-range stress', () => {
      const { rate } = computeMonetizationRate(
        0.03,
        EFFECTIVE_LOWER_BOUND,
        false,
        0.03,
        0.03,
        0.15,                // low QE rate
        0.75,                // mid-range stress
        0.30,                // tight cap
      );
      // stressIntensity = (0.75 - 0.50) / 0.50 = 0.50
      // rate = min(0.30, 0.15 + 0.50 × (0.30 - 0.15)) = min(0.30, 0.15 + 0.075) = 0.225
      expect(rate).toBeCloseTo(0.225, 10);
    });
  });

  describe('Case 3: Fiscal dominance — partial monetization proportional to rate gap', () => {
    it('monetizes proportional to the gap between Taylor and actual', () => {
      const { rate } = computeMonetizationRate(
        0.03,                // above ELB
        EFFECTIVE_LOWER_BOUND,
        true,                // fiscal dominance active
        0.08,                // Taylor says 8%
        0.03,                // actual is 3%
        QE_MONETIZATION_RATE,
        0.30,                // debtServiceRatio below 0.50
      );
      // rateGap = 0.08 - 0.03 = 0.05
      // ratio = 0.05 / 0.08 = 0.625
      // rate = min(0.40, max(0, 0.625)) = 0.40  (capped at QE rate)
      expect(rate).toBe(QE_MONETIZATION_RATE);
    });

    it('returns less than qeMonetizationRate for small gap', () => {
      const { rate } = computeMonetizationRate(
        0.03,
        EFFECTIVE_LOWER_BOUND,
        true,
        0.05,                // Taylor says 5%
        0.04,                // actual is 4%
        QE_MONETIZATION_RATE,
        0.30,
      );
      // rateGap = 0.05 - 0.04 = 0.01
      // ratio = 0.01 / 0.05 = 0.20
      // rate = min(0.40, max(0, 0.20)) = 0.20
      expect(rate).toBeCloseTo(0.20, 10);
    });

    it('returns 0 when actual rate meets or exceeds Taylor', () => {
      const { rate } = computeMonetizationRate(
        0.05,
        EFFECTIVE_LOWER_BOUND,
        true,
        0.05,                // Taylor says 5%
        0.05,                // actual matches Taylor
        QE_MONETIZATION_RATE,
        0.30,
      );
      // rateGap = 0.05 - 0.05 = 0
      // max(0, 0 / 0.05) = 0
      expect(rate).toBe(0);
    });

    it('returns 0 when actual exceeds Taylor (negative gap clamped)', () => {
      const { rate } = computeMonetizationRate(
        0.06,
        EFFECTIVE_LOWER_BOUND,
        true,
        0.04,                // Taylor says 4%
        0.06,                // actual is 6% (above Taylor)
        QE_MONETIZATION_RATE,
        0.20,
      );
      // rateGap = 0.04 - 0.06 = -0.02
      // max(0, -0.02 / 0.04) = max(0, -0.50) = 0
      expect(rate).toBe(0);
    });
  });

  describe('debtServiceRatio default parameter', () => {
    it('defaults to 0 when not provided (normal times path)', () => {
      const { rate } = computeMonetizationRate(
        0.03,
        EFFECTIVE_LOWER_BOUND,
        false,
        0.03,
        0.03,
        QE_MONETIZATION_RATE,
        // debtServiceRatio omitted — defaults to 0
      );
      expect(rate).toBe(0);
    });
  });

  describe('Case 5: Yield-responsive monetization', () => {
    it('fires when 10Y yield exceeds threshold', () => {
      const result = computeMonetizationRate(
        0.05,                // above ELB
        EFFECTIVE_LOWER_BOUND,
        false,               // no fiscal dominance
        0.05,
        0.05,
        QE_MONETIZATION_RATE,
        0.20,                // healthy debt service
        1.0,                 // default repression cap
        0.12,                // prevTenYearYield: 12% (above 8% threshold)
        0.08,                // yieldResponseThreshold
        0.70,                // maxYieldResponseRate
      );
      expect(result.yieldResponseActive).toBe(true);
      expect(result.yieldResponseMonetization).toBeGreaterThan(0);
      // yieldStress = min(1, (0.12 - 0.08) / 0.08) = min(1, 0.50) = 0.50
      // yieldResponseMonetization = 0.40 + 0.50 × (0.70 - 0.40) = 0.55
      expect(result.yieldResponseMonetization).toBeCloseTo(0.55, 10);
      expect(result.rate).toBeCloseTo(0.55, 10);
    });

    it('returns inactive when yield is below threshold', () => {
      const result = computeMonetizationRate(
        0.05,
        EFFECTIVE_LOWER_BOUND,
        false,
        0.05,
        0.05,
        QE_MONETIZATION_RATE,
        0.20,
        1.0,
        0.06,                // prevTenYearYield: 6% (below 8% threshold)
        0.08,                // yieldResponseThreshold
        0.70,
      );
      expect(result.yieldResponseActive).toBe(false);
      expect(result.yieldResponseMonetization).toBe(0);
      expect(result.rate).toBe(0); // no other case fires either
    });

    it('caps yieldStress at 1.0 for extreme yields', () => {
      const result = computeMonetizationRate(
        0.05,
        EFFECTIVE_LOWER_BOUND,
        false,
        0.05,
        0.05,
        QE_MONETIZATION_RATE,
        0.20,
        1.0,
        0.20,                // prevTenYearYield: 20% (way above threshold)
        0.08,                // yieldResponseThreshold
        0.70,
      );
      // Case 5: yieldStress = min(1, (0.20 - 0.08) / 0.08) = min(1, 1.50) = 1.0
      // yieldResponseMonetization = 0.40 + 1.0 × (0.70 - 0.40) = 0.70
      expect(result.yieldResponseMonetization).toBeCloseTo(0.70, 10);
      // Case 6 also fires (20% > 12%): crisisIntensity ≈ 0.6154
      // lolrRate = 0.70 + 0.6154 × (0.95 - 0.70) ≈ 0.854 → LOLR wins over Case 5
      expect(result.lolrActive).toBe(true);
      expect(result.rate).toBeCloseTo(0.854, 2);
    });
  });

  describe('Case 6: Lender of last resort', () => {
    it('fires when yield exceeds 12%', () => {
      const result = computeMonetizationRate(
        0.05,
        EFFECTIVE_LOWER_BOUND,
        false,
        0.05,
        0.05,
        QE_MONETIZATION_RATE,
        0.20,
        1.0,
        0.15,                // prevTenYearYield: 15% (above 12% LOLR threshold)
        0.08,                // yieldResponseThreshold
        0.50,                // maxYieldResponseRate (low — hawk profile)
      );
      expect(result.lolrActive).toBe(true);
      expect(result.lolrMonetization).toBeGreaterThan(0.50);
      // crisisIntensity = (0.15 - 0.12) / (0.25 - 0.12) = 0.03 / 0.13 ≈ 0.2308
      // lolrRate = 0.50 + 0.2308 × (0.95 - 0.50) = 0.50 + 0.1038 ≈ 0.6038
      expect(result.lolrMonetization).toBeCloseTo(0.6038, 3);
      expect(result.rate).toBeCloseTo(0.6038, 3);
    });

    it('does not fire below 12%', () => {
      const result = computeMonetizationRate(
        0.05,
        EFFECTIVE_LOWER_BOUND,
        false,
        0.05,
        0.05,
        QE_MONETIZATION_RATE,
        0.20,
        1.0,
        0.10,                // prevTenYearYield: 10% (below 12% threshold)
        0.08,
        0.70,
      );
      expect(result.lolrActive).toBe(false);
      expect(result.lolrMonetization).toBe(0);
    });

    it('ramps to 0.95 at 25% yield', () => {
      const result = computeMonetizationRate(
        0.05,
        EFFECTIVE_LOWER_BOUND,
        false,
        0.05,
        0.05,
        QE_MONETIZATION_RATE,
        0.20,
        1.0,
        0.25,                // prevTenYearYield: 25% (at LOLR ceiling)
        0.08,
        0.50,                // maxYieldResponseRate
      );
      expect(result.lolrActive).toBe(true);
      // crisisIntensity = (0.25 - 0.12) / (0.25 - 0.12) = 1.0
      // lolrRate = 0.50 + 1.0 × (0.95 - 0.50) = 0.95
      expect(result.lolrMonetization).toBeCloseTo(0.95, 10);
      expect(result.rate).toBeCloseTo(0.95, 10);
    });

    it('overrides lower Case 5 cap', () => {
      const result = computeMonetizationRate(
        0.05,
        EFFECTIVE_LOWER_BOUND,
        false,
        0.05,
        0.05,
        QE_MONETIZATION_RATE,
        0.20,
        1.0,
        0.20,                // prevTenYearYield: 20% (triggers both Case 5 and Case 6)
        0.08,                // yieldResponseThreshold
        0.50,                // maxYieldResponseRate (Case 5 caps here)
      );
      // Case 5: yieldStress = min(1, (0.20 - 0.08) / 0.08) = 1.0 → rate = 0.50
      // Case 6: crisisIntensity = (0.20 - 0.12) / 0.13 ≈ 0.6154 → lolrRate ≈ 0.777
      // max(0.50, 0.777) → LOLR wins
      expect(result.rate).toBeGreaterThan(0.50);
      expect(result.lolrActive).toBe(true);
      expect(result.lolrMonetization).toBeGreaterThan(result.yieldResponseMonetization);
    });

    it('is redundant when Case 5 cap is high', () => {
      const result = computeMonetizationRate(
        0.05,
        EFFECTIVE_LOWER_BOUND,
        false,
        0.05,
        0.05,
        QE_MONETIZATION_RATE,
        0.20,
        1.0,
        0.15,                // prevTenYearYield: 15%
        0.08,
        0.90,                // maxYieldResponseRate (very high — dovish profile)
      );
      // Case 5: yieldStress = min(1, (0.15 - 0.08) / 0.08) = 0.875
      //         yieldRate = 0.40 + 0.875 × (0.90 - 0.40) = 0.4 + 0.4375 = 0.8375
      // Case 6: crisisIntensity ≈ 0.2308 → lolrRate = 0.90 + 0.2308 × 0.05 ≈ 0.9115
      // LOLR is higher but both are above profile cap; LOLR fires but marginal
      expect(result.lolrActive).toBe(true);
      // The final rate is LOLR (0.9115) which is only slightly above Case 5 (0.8375)
      expect(result.rate).toBeCloseTo(0.9115, 3);
    });

    it('caps crisisIntensity at 1.0 for extreme yields', () => {
      const result = computeMonetizationRate(
        0.05,
        EFFECTIVE_LOWER_BOUND,
        false,
        0.05,
        0.05,
        QE_MONETIZATION_RATE,
        0.20,
        1.0,
        0.50,                // prevTenYearYield: 50% (extreme, above ceiling)
        0.08,
        0.50,
      );
      // crisisIntensity = min(1, (0.50 - 0.12) / 0.13) = min(1, 2.92) = 1.0
      // lolrRate = 0.50 + 1.0 × 0.45 = 0.95
      expect(result.lolrMonetization).toBeCloseTo(0.95, 10);
      expect(result.rate).toBeCloseTo(0.95, 10);
    });
  });

  describe('Max-of-all-cases behavior', () => {
    it('ZLB + financial repression: max of both wins', () => {
      const result = computeMonetizationRate(
        -0.01,               // at ZLB (Case 1 fires: rate = 0.15)
        EFFECTIVE_LOWER_BOUND,
        false,
        0.03,
        -0.01,
        0.15,                // low QE rate
        0.80,                // high debt service (Case 2 fires)
        0.60,                // repression cap
      );
      // Case 1: qeRate = 0.15
      // Case 2: stressIntensity = (0.80 - 0.50) / 0.50 = 0.60
      //         repressionRate = 0.15 + 0.60 × (0.60 - 0.15) = 0.15 + 0.27 = 0.42
      // max(0.15, 0.42) = 0.42
      expect(result.rate).toBeCloseTo(0.42, 10);
    });

    it('all cases computed including LOLR, maximum wins', () => {
      const result = computeMonetizationRate(
        -0.01,               // at ZLB (Case 1: rate = 0.15)
        EFFECTIVE_LOWER_BOUND,
        true,                // fiscal dominance (Case 3)
        0.10,
        -0.01,
        0.15,                // QE rate
        0.80,                // debt service > 0.50 (Case 2)
        0.60,                // repression cap
        0.20,                // yield above LOLR threshold (Case 5 + Case 6)
        0.08,
        0.50,                // maxYieldResponseRate
      );
      // Case 1: 0.15
      // Case 2: stressIntensity = 0.60, repressionRate = 0.15 + 0.60 × 0.45 = 0.42
      // Case 3: rateGap = 0.11, ratio capped at 0.15
      // Case 5: yieldStress = 1.0, yieldRate = 0.15 + 1.0 × 0.35 = 0.50
      // Case 6: crisisIntensity = (0.20 - 0.12) / 0.13 ≈ 0.6154
      //         lolrRate = 0.50 + 0.6154 × 0.45 ≈ 0.777
      // max(0.15, 0.42, 0.15, 0.50, 0.777) = 0.777
      expect(result.rate).toBeCloseTo(0.777, 2);
      expect(result.lolrActive).toBe(true);
    });
  });
});

// ============================================================
// computeMoneyCreation
// ============================================================

describe('computeMoneyCreation', () => {
  describe('money creation from positive deficit', () => {
    it('creates money proportional to deficit and monetization rate', () => {
      const deficit = 2_000_000_000_000; // $2T deficit
      const monetizationRate = 0.40;
      const result = computeMoneyCreation(
        deficit,
        monetizationRate,
        PREV_MONEY_SUPPLY,
        VELOCITY,
        NOMINAL_GDP,
        AI_DEFLATION,
      );

      expect(result.moneyCreated).toBe(deficit * monetizationRate); // $800B
      expect(result.bondFinancedDeficit).toBe(deficit * (1 - monetizationRate)); // $1.2T
      expect(result.moneySupply).toBe(PREV_MONEY_SUPPLY + result.moneyCreated);
    });

    it('creates zero money when monetization rate is 0 (normal times)', () => {
      const result = computeMoneyCreation(
        2_000_000_000_000,
        0,                   // no monetization
        PREV_MONEY_SUPPLY,
        VELOCITY,
        NOMINAL_GDP,
        AI_DEFLATION,
      );

      expect(result.moneyCreated).toBe(0);
      expect(result.bondFinancedDeficit).toBe(2_000_000_000_000);
      expect(result.moneySupply).toBe(PREV_MONEY_SUPPLY);
      expect(result.inflationFromMonetization).toBe(0);
    });
  });

  describe('surplus (negative deficit) — no money created', () => {
    it('treats negative deficit as zero effective deficit', () => {
      const result = computeMoneyCreation(
        -500_000_000_000,    // $500B surplus
        0.40,
        PREV_MONEY_SUPPLY,
        VELOCITY,
        NOMINAL_GDP,
        AI_DEFLATION,
      );

      expect(result.moneyCreated).toBe(0);
      expect(result.bondFinancedDeficit).toBe(0);
      expect(result.moneySupply).toBe(PREV_MONEY_SUPPLY);
      expect(result.inflationFromMonetization).toBe(0);
    });
  });

  describe('safety cap on money supply', () => {
    it('caps money supply at FISCAL_MONETARY_SAFETY_CAP', () => {
      const hugeDeficit = 1e20; // absurdly large deficit
      const result = computeMoneyCreation(
        hugeDeficit,
        1.0,                 // full monetization
        PREV_MONEY_SUPPLY,
        VELOCITY,
        NOMINAL_GDP,
        AI_DEFLATION,
      );

      expect(result.moneySupply).toBeLessThanOrEqual(FISCAL_MONETARY_SAFETY_CAP);
    });

    it('caps money supply even when prev supply is near cap', () => {
      const result = computeMoneyCreation(
        1_000_000_000_000,   // $1T deficit
        1.0,
        FISCAL_MONETARY_SAFETY_CAP - 100, // near cap
        VELOCITY,
        NOMINAL_GDP,
        AI_DEFLATION,
      );

      expect(result.moneySupply).toBe(FISCAL_MONETARY_SAFETY_CAP);
    });
  });

  describe('Fisher equation: inflationFromMonetization', () => {
    it('computes inflation as (moneyCreated * transmissionEfficiency * velocity / nominalGDP) - aiDeflation', () => {
      const deficit = 2_000_000_000_000; // $2T
      const monetizationRate = 0.50;
      const moneyCreated = deficit * monetizationRate; // $1T

      const result = computeMoneyCreation(
        deficit,
        monetizationRate,
        PREV_MONEY_SUPPLY,
        VELOCITY,
        NOMINAL_GDP,
        AI_DEFLATION,
      );

      // Phase 8 Fix 3: Fisher equation now uses effectiveMoneyCreated = moneyCreated × transmissionEfficiency
      // Default composition: transferShare=0.50, discretionary=0.30, interest=0.20
      // Transmission: 0.50*0.85 + 0.30*0.70 + 0.20*0.20 = 0.675
      const expectedTransmission = 0.675;
      const effectiveMoneyCreated = moneyCreated * expectedTransmission;
      const expectedInflation = (effectiveMoneyCreated * VELOCITY) / NOMINAL_GDP - AI_DEFLATION;
      expect(result.inflationFromMonetization).toBeCloseTo(expectedInflation, 10);
      expect(result.inflationFromMonetization).toBeGreaterThan(0);
    });

    it('floors inflation at 0 when AI deflation exceeds monetization inflation', () => {
      const result = computeMoneyCreation(
        100_000_000_000,     // $100B — small deficit
        0.10,                // low monetization
        PREV_MONEY_SUPPLY,
        VELOCITY,
        NOMINAL_GDP,
        0.10,                // 10% AI deflation — larger than monetization effect
      );

      expect(result.inflationFromMonetization).toBe(0);
    });

    it('returns 0 inflation when nominalGDP is 0 (degenerate case)', () => {
      const result = computeMoneyCreation(
        1_000_000_000_000,
        0.50,
        PREV_MONEY_SUPPLY,
        VELOCITY,
        0,                   // zero GDP
        AI_DEFLATION,
      );

      expect(result.inflationFromMonetization).toBe(0);
    });

    it('uses nominalGDP (not realGDP) in the Fisher equation denominator', () => {
      const deficit = 1_000_000_000_000;
      const rate = 1.0;
      const nomGDP = 30_000_000_000_000;

      const result = computeMoneyCreation(
        deficit,
        rate,
        PREV_MONEY_SUPPLY,
        VELOCITY,
        nomGDP,
        0, // no deflation for clarity
      );

      // Phase 8 Fix 3: inflation = moneyCreated × transmissionEfficiency × velocity / nominalGDP
      // Default transmission = 0.675
      const expectedTransmission = 0.675;
      const expected = (deficit * expectedTransmission * VELOCITY) / nomGDP;
      expect(result.inflationFromMonetization).toBeCloseTo(expected, 10);
    });
  });
});

// ============================================================
// getBaselineMonetizationState
// ============================================================

describe('getBaselineMonetizationState', () => {
  it('returns all zeros and inactive yield response and LOLR', () => {
    const state = getBaselineMonetizationState();
    expect(state.monetizationRate).toBe(0);
    expect(state.moneyCreated).toBe(0);
    expect(state.bondFinancedDeficit).toBe(0);
    expect(state.inflationFromMonetization).toBe(0);
    expect(state.yieldResponseActive).toBe(false);
    expect(state.yieldResponseMonetization).toBe(0);
    expect(state.lolrActive).toBe(false);
    expect(state.lolrMonetization).toBe(0);
    expect(state.transmissionEfficiency).toBe(0.70);
    expect(state.taperApplied).toBe(false);
  });

  it('satisfies MonetizationState interface', () => {
    const state = getBaselineMonetizationState();
    expect(state).toHaveProperty('monetizationRate');
    expect(state).toHaveProperty('moneyCreated');
    expect(state).toHaveProperty('bondFinancedDeficit');
    expect(state).toHaveProperty('inflationFromMonetization');
    expect(state).toHaveProperty('yieldResponseActive');
    expect(state).toHaveProperty('yieldResponseMonetization');
    expect(state).toHaveProperty('lolrActive');
    expect(state).toHaveProperty('lolrMonetization');
    expect(state).toHaveProperty('transmissionEfficiency');
    expect(state).toHaveProperty('taperApplied');
  });
});

// ============================================================
// Phase 8 Fix 3: Monetization Taper
// ============================================================

describe('computeMonetizationRate — taper', () => {
  const NORMAL_POLICY_RATE = 0.05;
  const ELB = -0.005;
  const QE_RATE = 0.40;

  it('taper prevents sharp monetization drop', () => {
    // LOLR pushed rate to 0.95 last year, but this year computed rate is ~0.
    // Taper should limit decrease to 0.25/yr → floor at 0.70.
    const result = computeMonetizationRate(
      NORMAL_POLICY_RATE, ELB, false, 0, 0, QE_RATE,
      0, 1.0, // no financial repression
      0.05, 0.08, 0.70, // prevYield below threshold → no Case 5/6
      0.95, // prevMonetizationRate
    );
    expect(result.rate).toBeCloseTo(0.70, 2);
    expect(result.taperApplied).toBe(true);
  });

  it('taper does not prevent ramp up', () => {
    // Previous rate was low, new computed rate is high — taper should NOT apply.
    const result = computeMonetizationRate(
      NORMAL_POLICY_RATE, ELB, false, 0, 0, QE_RATE,
      0, 1.0,
      0.20, 0.08, 0.70, // prevYield above threshold → Case 5 fires
      0.30, // prevMonetizationRate
    );
    // Case 5 should produce rate > 0.30, taper floor = 0.30 - 0.25 = 0.05 (not binding)
    expect(result.rate).toBeGreaterThan(0.30);
    expect(result.taperApplied).toBe(false);
  });

  it('taper floor expires after enough years', () => {
    // Chain: 0.95 → 0.70 → 0.45 → 0.20 → base rate takes over
    const step1 = computeMonetizationRate(
      NORMAL_POLICY_RATE, ELB, false, 0, 0, QE_RATE,
      0, 1.0, 0.05, 0.08, 0.70, 0.95,
    );
    expect(step1.rate).toBeCloseTo(0.70, 2);

    const step2 = computeMonetizationRate(
      NORMAL_POLICY_RATE, ELB, false, 0, 0, QE_RATE,
      0, 1.0, 0.05, 0.08, 0.70, step1.rate,
    );
    expect(step2.rate).toBeCloseTo(0.45, 2);

    const step3 = computeMonetizationRate(
      NORMAL_POLICY_RATE, ELB, false, 0, 0, QE_RATE,
      0, 1.0, 0.05, 0.08, 0.70, step2.rate,
    );
    expect(step3.rate).toBeCloseTo(0.20, 2);

    const step4 = computeMonetizationRate(
      NORMAL_POLICY_RATE, ELB, false, 0, 0, QE_RATE,
      0, 1.0, 0.05, 0.08, 0.70, step3.rate,
    );
    // Taper floor = 0.20 - 0.25 = -0.05, base rate = 0 → base takes over
    expect(step4.rate).toBe(0);
    expect(step4.taperApplied).toBe(false);
  });

  it('taperApplied diagnostic is true when floor is binding', () => {
    const result = computeMonetizationRate(
      NORMAL_POLICY_RATE, ELB, false, 0, 0, QE_RATE,
      0, 1.0, 0.05, 0.08, 0.70, 0.80,
    );
    // Computed rate = 0 (normal times), taper floor = 0.80 - 0.25 = 0.55
    expect(result.rate).toBeCloseTo(0.55, 2);
    expect(result.taperApplied).toBe(true);
  });
});

// ============================================================
// Phase 8 Fix 3: Transmission Efficiency in computeMoneyCreation
// ============================================================

describe('computeMoneyCreation — transmission efficiency', () => {
  const DEFICIT = 2_000_000_000_000;
  const MONETIZATION_RATE = 0.50;
  const PREV_MONEY_SUPPLY = 21_000_000_000_000;
  const VELOCITY = 1.1;
  const NOMINAL_GDP = 30_000_000_000_000;
  const AI_DEFLATION = 0.01;

  it('transmission efficiency responds to deficit composition — all transfers', () => {
    const result = computeMoneyCreation(
      DEFICIT, MONETIZATION_RATE, PREV_MONEY_SUPPLY, VELOCITY, NOMINAL_GDP, AI_DEFLATION,
      1.0, 0, 0, // all transfers
    );
    expect(result.transmissionEfficiency).toBeCloseTo(0.85, 2);
  });

  it('transmission efficiency responds to deficit composition — all interest', () => {
    const result = computeMoneyCreation(
      DEFICIT, MONETIZATION_RATE, PREV_MONEY_SUPPLY, VELOCITY, NOMINAL_GDP, AI_DEFLATION,
      0, 0, 1.0, // all interest expense
    );
    expect(result.transmissionEfficiency).toBeCloseTo(0.20, 2);
  });

  it('transmission sensitivity scales correctly', () => {
    const base = computeMoneyCreation(
      DEFICIT, MONETIZATION_RATE, PREV_MONEY_SUPPLY, VELOCITY, NOMINAL_GDP, AI_DEFLATION,
      0.50, 0.30, 0.20, 1.0,
    );
    const halved = computeMoneyCreation(
      DEFICIT, MONETIZATION_RATE, PREV_MONEY_SUPPLY, VELOCITY, NOMINAL_GDP, AI_DEFLATION,
      0.50, 0.30, 0.20, 0.5,
    );
    expect(halved.transmissionEfficiency).toBeCloseTo(base.transmissionEfficiency * 0.5, 4);
  });

  it('money supply uses full moneyCreated, not transmission-adjusted', () => {
    const allTransfers = computeMoneyCreation(
      DEFICIT, MONETIZATION_RATE, PREV_MONEY_SUPPLY, VELOCITY, NOMINAL_GDP, AI_DEFLATION,
      1.0, 0, 0, 1.0,
    );
    const allInterest = computeMoneyCreation(
      DEFICIT, MONETIZATION_RATE, PREV_MONEY_SUPPLY, VELOCITY, NOMINAL_GDP, AI_DEFLATION,
      0, 0, 1.0, 1.0,
    );
    // Money supply should be the same regardless of composition
    expect(allTransfers.moneySupply).toBe(allInterest.moneySupply);
    expect(allTransfers.moneyCreated).toBe(allInterest.moneyCreated);
    // But inflation should differ
    expect(allTransfers.inflationFromMonetization).toBeGreaterThan(allInterest.inflationFromMonetization);
  });

  it('transmissionEfficiency returned in result', () => {
    const result = computeMoneyCreation(
      DEFICIT, MONETIZATION_RATE, PREV_MONEY_SUPPLY, VELOCITY, NOMINAL_GDP, AI_DEFLATION,
    );
    expect(result).toHaveProperty('transmissionEfficiency');
    expect(result.transmissionEfficiency).toBeGreaterThan(0);
    expect(result.transmissionEfficiency).toBeLessThanOrEqual(1.0);
  });
});
