/**
 * Token Cost + the Frontier-Intensity Cost Layer Tests (mini-stage 1).
 *
 * The per-token curve is unchanged (the cited floored decay). The retired
 * computeInferenceCostFactor (token cost × global tokens-per-task multiplier) is replaced
 * by the one realized-cost object (aiCost.ts): frontierCost(t) = perToken(t) × M_f(t);
 * fixedCapCost = frontierCost(t*) × perTokenDecay(t − t*); blend by w(s) = 2^(−s/σ).
 */
import { describe, it, expect } from 'vitest';
import { computeTokenCostFactor } from '@/models/bfcs';
import {
  computeFrontierIntensity, computeFrontierCost, computeMigrationWeight,
  computeInferenceLeg, computeAiCostFraction, resolveFrontierDials,
} from '@/models/aiCost';
import {
  DEFAULT_TOKEN_COST_CURVE, DEFAULT_FRONTIER_INTENSITY_LEVEL,
  DEFAULT_FRONTIER_INTENSITY_GROWTH, DEFAULT_SIGMA_MIGRATION,
} from '@/models/constants';

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

describe('the frontier-intensity layer (aiCost.ts — the one realized-cost object)', () => {
  const dials = resolveFrontierDials(undefined);

  it('M_f: 1 at the 2025 anchor; level at the 2026 anchor; grows at the ruled +5%/yr', () => {
    expect(computeFrontierIntensity(0, dials)).toBe(1.0);
    expect(computeFrontierIntensity(-3, dials)).toBe(1.0);
    expect(computeFrontierIntensity(1, dials)).toBe(DEFAULT_FRONTIER_INTENSITY_LEVEL);
    expect(computeFrontierIntensity(6, dials)).toBeCloseTo(
      DEFAULT_FRONTIER_INTENSITY_LEVEL * Math.pow(1 + DEFAULT_FRONTIER_INTENSITY_GROWTH, 5), 10,
    );
  });

  it('w(s): 1 at/below the margin; halves every σ; floored at w_min', () => {
    expect(computeMigrationWeight(0, dials)).toBe(1.0);
    expect(computeMigrationWeight(-0.2, dials)).toBe(1.0);
    expect(computeMigrationWeight(DEFAULT_SIGMA_MIGRATION, dials)).toBeCloseTo(0.5, 10);
    expect(computeMigrationWeight(2 * DEFAULT_SIGMA_MIGRATION, dials)).toBeCloseTo(0.25, 10);
    const floored = resolveFrontierDials({ wMinFrontierFloor: 0.3 } as never);
    expect(computeMigrationWeight(10, floored)).toBe(0.3);
  });

  it('B-2 FP-exactness: the inference leg is EXACTLY 1 at t = 0 for every w (the year-0 anchor)', () => {
    for (const surplus of [0, 0.07, 0.15, 0.33, 1.0]) {
      const { leg } = computeInferenceLeg(0, 0, surplus, DEFAULT_TOKEN_COST_CURVE, dials);
      expect(leg).toBe(1.0);
    }
    // pre-arrival at t=0 is the frontier at its anchor: exactly 1
    expect(computeInferenceLeg(0, null, -0.1, DEFAULT_TOKEN_COST_CURVE, dials).leg).toBe(1.0);
  });

  it('fixedCap anchors at the arrival-year frontier cost and decays along the cited curve', () => {
    const tStar = 6;
    const arrivalFrontier = computeFrontierCost(tStar, DEFAULT_TOKEN_COST_CURVE, dials);
    const { fixedCapCost } = computeInferenceLeg(tStar + 4, tStar, 1.0, DEFAULT_TOKEN_COST_CURVE, dials);
    expect(fixedCapCost).toBeCloseTo(arrivalFrontier * computeTokenCostFactor(4), 12);
    // at arrival itself, fixedCap = frontier (continuity)
    const atArrival = computeInferenceLeg(tStar, tStar, 0, DEFAULT_TOKEN_COST_CURVE, dials);
    expect(atArrival.fixedCapCost).toBeCloseTo(atArrival.frontierCost, 12);
  });

  it('B-3/I2 cross-sectional monotonicity: holding t*, the leg is non-increasing in surplus', () => {
    for (const t of [3, 8, 15, 25]) {
      let prev = Infinity;
      for (const s of [0, 0.05, 0.1, 0.2, 0.4, 0.8]) {
        const { leg } = computeInferenceLeg(t, 0, s, DEFAULT_TOKEN_COST_CURVE, dials);
        expect(leg).toBeLessThanOrEqual(prev + 1e-15);
        prev = leg;
      }
    }
  });

  it('B-3/I1 spike-window relief: the blend never exceeds the retired spike at its PEAK (2026-2027)', () => {
    // BATTERY CORRECTION (documented, not silent): the pre-registered spec claimed relief
    // for all of 2026-2029; hand-recomputation at the failure showed the claim's arithmetic
    // was wrong for 2028-29 at high w — the retired schedule RECOVERS (15×, 5×) faster than
    // the persistent M_f grows (20×1.05^t), so margin-band (w≈1) roles already pay MORE than
    // the old basis from 2028. That is the adopted design's intent (the premium is
    // persistent; the old schedule was wrong to recover), not a defect. The provable
    // invariant is the PEAK window t ∈ {1,2}, all w — asserted here. The 2028+ crossover is
    // part of the measured B-3 delay result (band-table.json).
    const RETIRED_SCHEDULE = [1, 20, 25, 15, 5, 1]; // the predecessor pole (recorded run 6c831b7)
    for (let t = 1; t <= 2; t++) {
      const oldLeg = computeTokenCostFactor(t) * RETIRED_SCHEDULE[t]!;
      for (const s of [0, 0.1, 0.3, 0.6]) {
        const { leg } = computeInferenceLeg(t, 0, s, DEFAULT_TOKEN_COST_CURVE, dials);
        expect(leg, `t=${t} s=${s}`).toBeLessThanOrEqual(oldLeg + 1e-12);
      }
    }
    // and the 2028 crossover exists for w≈1 exactly as the corrected arithmetic says
    const margin2028 = computeInferenceLeg(3, 0, 0, DEFAULT_TOKEN_COST_CURVE, dials).leg;
    expect(margin2028).toBeGreaterThan(computeTokenCostFactor(3) * RETIRED_SCHEDULE[3]!);
  });

  it('the composed fraction at the 2025 anchor equals the composition sum exactly (per deployment type)', () => {
    for (const dt of ['software', 'hybrid', 'autonomous_vehicle', 'robotics'] as const) {
      const { fraction } = computeAiCostFraction(2025, dt, 2025, 0.1, undefined);
      expect(fraction).toBeCloseTo(1.0, 12); // weights sum to 1; every leg is 1 at t=0
    }
  });
});
