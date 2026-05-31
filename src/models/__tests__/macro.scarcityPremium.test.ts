/**
 * ATLAS Phillips Mechanism 2 Tests — Phase 10.A Part 12
 *
 * computeWagePressure now returns classic Phillips × (1 - aiShare) + scarcity premium.
 * aiShare = aiDisplacementUnemployment / (unemploymentRate × laborForceBaseline).
 */
import { describe, it, expect } from 'vitest';
import { computeWagePressure, computeClusterScarcityPremium } from '@/models/macro';

describe('computeWagePressure — Phase 10.A Phillips Mechanism 2', () => {
  it('aiShare = 0 reduces to classic Phillips (no scarcity premium)', () => {
    // aiDisplacementUnemployment = 0 → aiShare = 0 → premium = 0
    // Classic exp(-2.5 × 0.10 × 1) = e^-0.25 = 0.779
    const pressure = computeWagePressure(0.144, 0, 0, 0, 1, 0);
    expect(pressure).toBeLessThan(1.0);
    expect(pressure).toBeGreaterThan(0);
  });

  it('aiShare = 1 with high difficulty → pressure = classic_at_exp(0) + premium = 1.0 + premium', () => {
    // Use realistic laborForceBaseline (100M) so totalUnemployedHeadcount isn't floored at 1.
    // unemploymentRate=0.1, laborForceBaseline=100M, aiDispUE=10M → aiShare=1.0
    // classicPhillips = exp(-2.5 × 0.056 × (1-1)) = exp(0) = 1.0 (no slack drag when aiShare=1)
    // scarcityPremium = 1 × 0.5 × 0.8 = 0.4
    // pressure = 1.0 + 0.4 = 1.4
    const pressure = computeWagePressure(0.1, 10_000_000, 0.8, 0.5, 100_000_000, 0);
    expect(pressure).toBeCloseTo(1.4, 3);
  });

  it('aiShare = 1 with zero difficulty → scarcity premium = 0, but Phillips exp(0) = 1.0 (no drag)', () => {
    // classicPhillips = exp(0) = 1.0; scarcity = 0; pressure = 1.0
    // Policy floor 0.3 is superseded because 1.0 > 0.3.
    const pressure = computeWagePressure(0.1, 10_000_000, 0, 0.5, 100_000_000, 0.3);
    expect(pressure).toBeCloseTo(1.0, 3);
  });

  it('policy wage floor enforced even when Phillips and scarcity both drop', () => {
    const pressure = computeWagePressure(0.8, 0, 0, 0, 1, 0.49);
    expect(pressure).toBeGreaterThanOrEqual(0.49);
  });
});

describe('computeClusterScarcityPremium', () => {
  it('zero displacement share → zero premium', () => {
    const r = computeClusterScarcityPremium({
      clusterAiDisplacementShare: 0,
      clusterReplacementDifficultyWagePremium: 0.5,
      scarcityIntensity: 0.4,
    });
    expect(r.premium).toBe(0);
    expect(r.wageAdjustment).toBe(0);
  });

  it('zero difficulty → zero premium', () => {
    const r = computeClusterScarcityPremium({
      clusterAiDisplacementShare: 0.5,
      clusterReplacementDifficultyWagePremium: 0,
      scarcityIntensity: 0.4,
    });
    expect(r.premium).toBe(0);
  });

  it('wageAdjustment equals premium (no smoothing at this layer)', () => {
    const r = computeClusterScarcityPremium({
      clusterAiDisplacementShare: 0.3,
      clusterReplacementDifficultyWagePremium: 0.6,
      scarcityIntensity: 0.4,
    });
    // 0.3 × 0.4 × 0.6 = 0.072
    expect(r.premium).toBeCloseTo(0.072, 5);
    expect(r.wageAdjustment).toBe(r.premium);
  });
});
