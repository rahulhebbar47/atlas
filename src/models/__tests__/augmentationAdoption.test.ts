/**
 * ATLAS Augmentation Adoption Tests — Phase 10.A Part 7
 */
import { describe, it, expect } from 'vitest';
import { computeAugmentationAdoption } from '@/models/augmentationAdoption';

describe('computeAugmentationAdoption', () => {
  it('below viability threshold (better × cheaper ≤ 0.1) → not triggered', () => {
    const r = computeAugmentationAdoption({
      year: 2025, betterScore: 0.2, cheaperScore: 0.3, augTriggerYear: null, steepness: 0.8,
    });
    expect(r.triggered).toBe(false);
    expect(r.augAdoptionRate).toBe(0);
    expect(r.triggerYear).toBe(null);
  });

  it('just above threshold → triggered, rate = 0 at trigger year (FS-1b F1: the sibling form starts at 0)', () => {
    // better=0.4, cheaper=0.3 → product=0.12 > 0.1
    const r = computeAugmentationAdoption({
      year: 2026, betterScore: 0.4, cheaperScore: 0.3, augTriggerYear: null, steepness: 0.8,
    });
    expect(r.triggered).toBe(true);
    expect(r.triggerYear).toBe(2026);
    // FS-1b F1: the sibling form — 1 − e^0 = 0 at the trigger year (the 0.5 jump retired)
    expect(r.augAdoptionRate).toBe(0);
  });

  it('5 years post-trigger at steepness 0.8 → rate ≈ 0.98', () => {
    const r = computeAugmentationAdoption({
      year: 2031, betterScore: 0.5, cheaperScore: 0.5, augTriggerYear: 2026, steepness: 0.8,
    });
    // 1 / (1 + exp(-0.8 * 5)) = 1 / (1 + e^-4) ≈ 0.982
    expect(r.augAdoptionRate).toBeGreaterThan(0.97);
    expect(r.augAdoptionRate).toBeLessThan(0.99);
  });

  it('trigger year persists: once armed, a temporary dip in scores does not reset', () => {
    // Already triggered in 2025; in 2026 scores drop below threshold but trigger stays
    const r = computeAugmentationAdoption({
      year: 2026, betterScore: 0.1, cheaperScore: 0.1, augTriggerYear: 2025, steepness: 0.8,
    });
    expect(r.triggered).toBe(true);
    expect(r.triggerYear).toBe(2025);
  });
});
