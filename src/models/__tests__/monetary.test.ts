/**
 * ATLAS Monetary Model — Unit Tests
 *
 * Tests the Fisher equation implementation, net neutral zone calculations,
 * and baseline state as defined in src/models/monetary.ts.
 *
 * Mathematical invariants under test:
 *   M(t) x V(t) = P(t) x Y(t)
 *   max_neutral_transfers = (ai_deflation_rate * Y) / V
 *   inflation_from_transfers = (deltaM * V) / Y - ai_deflation_rate
 */

import { describe, it, expect } from 'vitest';
import {
  computeMonetaryState,
  computeMaxNeutralTransferPerCapita,
  getBaselineMonetaryState,
} from '@/models/monetary';
import {
  BASELINE_MONEY_SUPPLY,
  BASELINE_VELOCITY_OF_MONEY,
  BASELINE_PRICE_LEVEL,
  BASELINE_GDP_REAL_2025,
} from '@/models/constants';
import type { MonetaryState } from '@/types';

// ============================================================
// Standard test values
// ============================================================

const PRICE_LEVEL = 1.0;
const REAL_GDP = 23_000_000_000_000; // $23T
const AI_DEFLATION_RATE = 0.02;
const TOTAL_TRANSFERS = 500_000_000_000; // $500B
const POPULATION = 340_000_000;
const PREVIOUS_MONEY_SUPPLY = 21_000_000_000_000; // $21T
const VELOCITY = BASELINE_VELOCITY_OF_MONEY; // 1.2

// ============================================================
// computeMonetaryState — money creation share (Phase 5g Step 13)
// ============================================================

describe('computeMonetaryState', () => {
  it('increases money supply when moneyCreationShare = 1.0 (full money creation)', () => {
    const state = computeMonetaryState(
      PRICE_LEVEL, REAL_GDP, AI_DEFLATION_RATE, TOTAL_TRANSFERS,
      POPULATION, 1.0, PREVIOUS_MONEY_SUPPLY, VELOCITY,
    );

    // deltaM = totalTransfers * 1.0
    expect(state.moneySupply).toBe(PREVIOUS_MONEY_SUPPLY + TOTAL_TRANSFERS);
    expect(state.moneySupply).toBeGreaterThan(PREVIOUS_MONEY_SUPPLY);
  });

  it('does not increase money supply when moneyCreationShare = 0 (full taxation)', () => {
    const state = computeMonetaryState(
      PRICE_LEVEL, REAL_GDP, AI_DEFLATION_RATE, TOTAL_TRANSFERS,
      POPULATION, 0, PREVIOUS_MONEY_SUPPLY, VELOCITY,
    );

    // deltaM = totalTransfers * 0 = 0
    expect(state.moneySupply).toBe(PREVIOUS_MONEY_SUPPLY);
  });

  it('increases money supply by half of transfers when moneyCreationShare = 0.5', () => {
    const state = computeMonetaryState(
      PRICE_LEVEL, REAL_GDP, AI_DEFLATION_RATE, TOTAL_TRANSFERS,
      POPULATION, 0.5, PREVIOUS_MONEY_SUPPLY, VELOCITY,
    );

    // deltaM = totalTransfers * 0.5
    const expectedMoneySupply = PREVIOUS_MONEY_SUPPLY + TOTAL_TRANSFERS * 0.5;
    expect(state.moneySupply).toBe(expectedMoneySupply);
  });

  it('computes maxNeutralTransfers as (aiDeflation * GDP) / V', () => {
    const state = computeMonetaryState(
      PRICE_LEVEL, REAL_GDP, AI_DEFLATION_RATE, TOTAL_TRANSFERS,
      POPULATION, 1.0, PREVIOUS_MONEY_SUPPLY, VELOCITY,
    );

    // max_neutral_transfers = (0.02 * 23T) / 1.2 = 460B / 1.2 = ~383.33B
    const expected = (AI_DEFLATION_RATE * REAL_GDP) / VELOCITY;
    expect(state.maxNeutralTransfers).toBeCloseTo(expected, 0);
  });

  it('sets isWithinNeutralZone to true when transfers <= maxNeutralTransfers', () => {
    const maxNeutral = (AI_DEFLATION_RATE * REAL_GDP) / VELOCITY;
    // Use transfers below the neutral maximum
    const smallTransfers = maxNeutral * 0.5;

    const state = computeMonetaryState(
      PRICE_LEVEL, REAL_GDP, AI_DEFLATION_RATE, smallTransfers,
      POPULATION, 1.0, PREVIOUS_MONEY_SUPPLY, VELOCITY,
    );

    expect(state.isWithinNeutralZone).toBe(true);
  });

  it('sets isWithinNeutralZone to false when transfers > maxNeutralTransfers', () => {
    const maxNeutral = (AI_DEFLATION_RATE * REAL_GDP) / VELOCITY;
    // Use transfers well above the neutral maximum
    const largeTransfers = maxNeutral * 3;

    const state = computeMonetaryState(
      PRICE_LEVEL, REAL_GDP, AI_DEFLATION_RATE, largeTransfers,
      POPULATION, 1.0, PREVIOUS_MONEY_SUPPLY, VELOCITY,
    );

    expect(state.isWithinNeutralZone).toBe(false);
  });

  it('returns zero maxNeutralTransfers when GDP is zero', () => {
    const state = computeMonetaryState(
      PRICE_LEVEL, 0, AI_DEFLATION_RATE, TOTAL_TRANSFERS,
      POPULATION, 1.0, PREVIOUS_MONEY_SUPPLY, VELOCITY,
    );

    expect(state.maxNeutralTransfers).toBe(0);
  });

  it('preserves passthrough fields in the returned MonetaryState', () => {
    const state = computeMonetaryState(
      PRICE_LEVEL, REAL_GDP, AI_DEFLATION_RATE, TOTAL_TRANSFERS,
      POPULATION, 0.5, PREVIOUS_MONEY_SUPPLY, VELOCITY,
    );

    expect(state.priceLevel).toBe(PRICE_LEVEL);
    expect(state.realGDP).toBe(REAL_GDP);
    expect(state.velocityOfMoney).toBe(VELOCITY);
    expect(state.moneyCreationShare).toBe(0.5);
  });

  it('clamps actualInflationFromTransfers to non-negative', () => {
    // With moneyCreationShare=0, deltaM = 0, so inflation_from_transfers = 0 - aiDeflation < 0
    // The function applies Math.max(0, ...) so it should be 0
    const state = computeMonetaryState(
      PRICE_LEVEL, REAL_GDP, AI_DEFLATION_RATE, TOTAL_TRANSFERS,
      POPULATION, 0, PREVIOUS_MONEY_SUPPLY, VELOCITY,
    );

    expect(state.actualInflationFromTransfers).toBeGreaterThanOrEqual(0);
  });

  it('supports fractional moneyCreationShare values between 0 and 1', () => {
    const state = computeMonetaryState(
      PRICE_LEVEL, REAL_GDP, AI_DEFLATION_RATE, TOTAL_TRANSFERS,
      POPULATION, 0.75, PREVIOUS_MONEY_SUPPLY, VELOCITY,
    );

    // deltaM = totalTransfers * 0.75
    expect(state.moneySupply).toBe(PREVIOUS_MONEY_SUPPLY + TOTAL_TRANSFERS * 0.75);
    expect(state.moneyCreationShare).toBe(0.75);
  });
});

// ============================================================
// computeMaxNeutralTransferPerCapita
// ============================================================

describe('computeMaxNeutralTransferPerCapita', () => {
  it('divides maxNeutralTransfers by population', () => {
    const maxNeutral = 383_333_333_333; // ~$383B
    const result = computeMaxNeutralTransferPerCapita(maxNeutral, POPULATION);

    const expected = maxNeutral / POPULATION;
    expect(result).toBeCloseTo(expected, 2);
  });

  it('returns 0 when population is zero', () => {
    const result = computeMaxNeutralTransferPerCapita(1_000_000_000, 0);
    expect(result).toBe(0);
  });

  it('returns 0 when maxNeutralTransfers is zero', () => {
    const result = computeMaxNeutralTransferPerCapita(0, POPULATION);
    expect(result).toBe(0);
  });
});

// ============================================================
// getBaselineMonetaryState
// ============================================================

describe('getBaselineMonetaryState', () => {
  it('returns a MonetaryState with baseline constant values', () => {
    const baseline: MonetaryState = getBaselineMonetaryState();

    expect(baseline.moneySupply).toBe(BASELINE_MONEY_SUPPLY);
    expect(baseline.velocityOfMoney).toBe(BASELINE_VELOCITY_OF_MONEY);
    expect(baseline.priceLevel).toBe(BASELINE_PRICE_LEVEL);
    expect(baseline.realGDP).toBe(BASELINE_GDP_REAL_2025);
  });

  it('initializes transfer-related fields to safe defaults', () => {
    const baseline = getBaselineMonetaryState();

    expect(baseline.moneyCreationShare).toBe(0.5);
    expect(baseline.maxNeutralTransfers).toBe(0);
    expect(baseline.actualInflationFromTransfers).toBe(0);
    expect(baseline.isWithinNeutralZone).toBe(true);
  });
});
