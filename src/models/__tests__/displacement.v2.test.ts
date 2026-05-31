/**
 * ATLAS Displacement V2 Tests — Phase 10.A Part 5
 */
import { describe, it, expect } from 'vitest';
import { computeDisplacementV2, computeSimplifiedDisplacement } from '@/models/displacement';

describe('computeDisplacementV2', () => {
  it('α = 0 → displacement = 0 regardless of adoption and capability', () => {
    expect(computeDisplacementV2(0.5, 0.7, 0)).toBe(0);
    expect(computeDisplacementV2(1.0, 1.0, 0)).toBe(0);
  });

  it('canonical case: α=1, capability=0.7, adoption=0.6 → 0.42', () => {
    expect(computeDisplacementV2(0.6, 0.7, 1.0)).toBeCloseTo(0.42, 10);
  });

  it('clamps to [0, 1]', () => {
    expect(computeDisplacementV2(2.0, 1.0, 1.0)).toBeLessThanOrEqual(1);
    expect(computeDisplacementV2(-0.5, 1.0, 1.0)).toBeGreaterThanOrEqual(0);
  });

  it('ratio to deprecated squared formula ≈ α / weightedCapability', () => {
    // V2 = a × c × α;  old = a × c²
    // Ratio = α / c
    const a = 0.5, c = 0.7, alpha = 0.5;
    const v2 = computeDisplacementV2(a, c, alpha);
    const oldForm = computeSimplifiedDisplacement(a, c);
    expect(v2 / oldForm).toBeCloseTo(alpha / c, 5);
  });
});
