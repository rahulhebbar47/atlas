/**
 * ATLAS Productivity Formula Tests — Phase 10.A Part 8
 *
 * New first-principles productivity formula:
 *   effectiveProductivity = 1 + weightedCapability × betterScore × replacementMultiplier × (1 + cheaperScore)
 *
 * Replaces the deprecated deployment-type max-multiplier linear formula.
 */
import { describe, it, expect } from 'vitest';

// Pure formula — inlined from simulation.ts for isolated testing
function computeProductivity(
  weightedCapability: number,
  betterScore: number,
  cheaperScore: number,
  replacementMultiplier: number,
): number {
  return 1 + weightedCapability * betterScore * replacementMultiplier * (1 + cheaperScore);
}

describe('Phase 10.A productivity formula', () => {
  it('zero capability → productivity = 1.0 regardless of other inputs', () => {
    expect(computeProductivity(0, 0.5, 0.5, 2.0)).toBe(1.0);
    expect(computeProductivity(0, 1.0, 1.0, 10)).toBe(1.0);
  });

  it('zero betterScore → productivity = 1.0', () => {
    expect(computeProductivity(0.8, 0, 0.5, 2.0)).toBe(1.0);
  });

  it('cheaper boost is multiplicative on the capability-gated base', () => {
    // With cheaper=0: 1 + 0.5 × 0.5 × 2 × 1 = 1.5
    // With cheaper=1: 1 + 0.5 × 0.5 × 2 × 2 = 2.0
    // Delta = 0.5 (scales linearly with cheaper)
    const atZero = computeProductivity(0.5, 0.5, 0, 2.0);
    const atOne = computeProductivity(0.5, 0.5, 1.0, 2.0);
    expect(atZero).toBeCloseTo(1.5, 5);
    expect(atOne).toBeCloseTo(2.0, 5);
  });

  it('full capability + full scores at replacementMultiplier 2.0 → 5.0', () => {
    const p = computeProductivity(1.0, 1.0, 1.0, 2.0);
    // 1 + 1 × 1 × 2 × 2 = 5.0
    expect(p).toBe(5.0);
  });

  describe('boundary: replacementMultiplier = 0', () => {
    it('replacementMultiplier = 0 → productivity = 1.0 for any other inputs (AI contributes nothing)', () => {
      expect(computeProductivity(0.7, 0.5, 0.5, 0)).toBe(1.0);
      expect(computeProductivity(1.0, 1.0, 1.0, 0)).toBe(1.0);
    });
  });

  describe('boundary: negative cheaperScore', () => {
    it('cheaperScore = -0.5 with canonical inputs → productivity = 1.49', () => {
      // 1 + 0.7 × 0.7 × 2.0 × (1 + (-0.5)) = 1 + 0.49 × 0.5 = 1.245... wait let me recompute
      // 0.7 × 0.7 × 2.0 × 0.5 = 0.49; 1 + 0.49 = 1.49 ✓
      const p = computeProductivity(0.7, 0.7, -0.5, 2.0);
      expect(p).toBeCloseTo(1.49, 10);
    });

    it('negative cheaperScore reduces productivity vs the cheaperScore = 0 comparison case', () => {
      const atNeg = computeProductivity(0.7, 0.7, -0.5, 2.0);
      const atZero = computeProductivity(0.7, 0.7, 0, 2.0);
      expect(atNeg).toBeLessThan(atZero);
      // Flag in review: computeCheaperScore currently clamps to [0, 1], so negative values
      // are NOT reachable through the normal BFCS pipeline. This test exercises the formula
      // directly across its full conceptual range to confirm mathematical correctness.
    });
  });
});
