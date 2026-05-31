/**
 * ATLAS Adoption Tail-Drag Tests — Phase 10.A Part 10
 *
 * computeBaseAdoptionRate now uses an asymmetric S-curve:
 *   rate = ((1 - exp(-k × t)) ^ (1 + wagePremium × 5)) × ceiling
 *
 * Verifies tail-drag behavior and asymptotic approach to ceiling.
 */
import { describe, it, expect } from 'vitest';
import { computeBaseAdoptionRate } from '@/models/adoption';

describe('computeBaseAdoptionRate — Phase 10.A asymmetric S-curve with tail drag', () => {
  const PARAMS = {
    steepnessByDeployment: { software: 1.0, robotics: 1.0, autonomous_vehicle: 1.0, hybrid: 1.0 },
    competitivePressureMultiplier: 2.0,
    competitivePressureThreshold: 0.2,
    geopoliticalRiskFactor: 0,
  };

  it('wagePremium = 0 → standard approach (asymmetry = 1); t=5, k=1 → ≈ 0.993', () => {
    const r = computeBaseAdoptionRate(2030, 2025, 'software', 0, PARAMS, undefined, 1.0, 0);
    // (1 - e^-5)^1 = 0.993
    expect(r).toBeGreaterThan(0.99);
    expect(r).toBeLessThan(0.995);
  });

  it('wagePremium = 0.5 → asymmetry = 3.5; t=5, k=1 → ≈ 0.975', () => {
    const r = computeBaseAdoptionRate(2030, 2025, 'software', 0, PARAMS, undefined, 1.0, 0.5);
    expect(r).toBeGreaterThan(0.96);
    expect(r).toBeLessThan(0.99);
  });

  it('wagePremium = 1.0 → asymmetry = 6; t=5, k=1 → ≈ 0.96 (still climbing)', () => {
    const r = computeBaseAdoptionRate(2030, 2025, 'software', 0, PARAMS, undefined, 1.0, 1.0);
    expect(r).toBeGreaterThan(0.94);
    expect(r).toBeLessThan(0.98);
  });

  it('wagePremium = 1.0, t = 50 → asymptotically approaches 1.0 (nothing ceilinged)', () => {
    const r = computeBaseAdoptionRate(2075, 2025, 'software', 0, PARAMS, undefined, 1.0, 1.0);
    expect(r).toBeGreaterThan(0.999);
    expect(r).toBeLessThanOrEqual(1.0);
  });

  it('rate never exceeds 1.0 at any parameter combination', () => {
    for (const wp of [0, 0.3, 0.7, 1.0]) {
      for (const t of [1, 5, 10, 50, 100]) {
        const r = computeBaseAdoptionRate(2025 + t, 2025, 'software', 0, PARAMS, undefined, 1.0, wp);
        expect(r).toBeLessThanOrEqual(1.0);
      }
    }
  });

  it('rate is monotonically non-decreasing across years', () => {
    let prev = 0;
    for (let t = 0; t <= 20; t++) {
      const r = computeBaseAdoptionRate(2025 + t, 2025, 'software', 0, PARAMS, undefined, 1.0, 0.5);
      expect(r).toBeGreaterThanOrEqual(prev - 1e-10);
      prev = r;
    }
  });

  it('rate at triggerYear (t = 0) is exactly 0 (Phase 10.A: new curve starts at 0, not 0.5)', () => {
    const r = computeBaseAdoptionRate(2025, 2025, 'software', 0, PARAMS, undefined, 1.0, 0);
    expect(r).toBe(0);
  });
});
