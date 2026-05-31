/**
 * Token Cost + Inference Cost Tests
 *
 * Inference cost is decomposed into:
 *   - tokenCostFactor: a floored decay curve (cost per token)
 *   - tokenUsageMultiplier: a per-year value (tokens per task vs. 2025 baseline)
 *
 * Total: inferenceCostFactor(t) = tokenCostFactor(t) × tokenUsageMultiplier
 */
import { describe, it, expect } from 'vitest';
import { computeTokenCostFactor, computeInferenceCostFactor } from '@/models/bfcs';
import { DEFAULT_TOKEN_COST_CURVE } from '@/models/constants';

describe('computeTokenCostFactor (default curve: floor=0.001, k=0.5, decayExponent=0.7)', () => {
  it('t = 0 returns 1.0 exactly', () => {
    expect(computeTokenCostFactor(0)).toBe(1.0);
  });

  it('t = 1 → ~0.61 (±0.02)', () => {
    const v = computeTokenCostFactor(1);
    expect(v).toBeGreaterThan(0.59);
    expect(v).toBeLessThan(0.63);
  });

  it('t = 10 → ~0.082', () => {
    const v = computeTokenCostFactor(10);
    expect(v).toBeGreaterThan(0.07);
    expect(v).toBeLessThan(0.10);
  });

  it('t = 25 monotonically smaller than t=10', () => {
    const v10 = computeTokenCostFactor(10);
    const v25 = computeTokenCostFactor(25);
    expect(v25).toBeLessThan(v10);
    expect(v25).toBeGreaterThan(0.001);
    expect(v25).toBeLessThan(0.02);
  });

  it('large t asymptotes to the floor', () => {
    const v = computeTokenCostFactor(500);
    expect(v).toBeCloseTo(DEFAULT_TOKEN_COST_CURVE.floor, 5);
  });

  it('negative t treated as t=0', () => {
    expect(computeTokenCostFactor(-5)).toBe(1.0);
  });
});

describe('computeInferenceCostFactor (= token cost × tokens per task multiplier)', () => {
  it('reduces to token cost when multiplier = 1', () => {
    for (const t of [1, 5, 10, 25]) {
      expect(computeInferenceCostFactor(t, DEFAULT_TOKEN_COST_CURVE, 1)).toBeCloseTo(
        computeTokenCostFactor(t, DEFAULT_TOKEN_COST_CURVE), 10,
      );
    }
  });

  it('scales linearly with the multiplier', () => {
    const base = computeInferenceCostFactor(5, DEFAULT_TOKEN_COST_CURVE, 1);
    const tenX = computeInferenceCostFactor(5, DEFAULT_TOKEN_COST_CURVE, 10);
    expect(tenX).toBeCloseTo(base * 10, 10);
  });

  it('multiplier > 1 can keep inference cost above the token cost alone', () => {
    const tokenOnly = computeTokenCostFactor(5);
    const withUsage = computeInferenceCostFactor(5, DEFAULT_TOKEN_COST_CURVE, 5);
    expect(withUsage).toBeGreaterThan(tokenOnly);
  });

  it('high multiplier at late t can push total inference cost above 2025 baseline', () => {
    // At t = 25: tokenCost ≈ 0.01. With multiplier = 100, combined ≈ 1.0.
    // With multiplier = 200, combined ≈ 2.0 (above baseline).
    const combined = computeInferenceCostFactor(25, DEFAULT_TOKEN_COST_CURVE, 200);
    expect(combined).toBeGreaterThan(1.0);
  });
});
