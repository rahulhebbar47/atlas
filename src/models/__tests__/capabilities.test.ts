/**
 * ATLAS Capability Model — Unit Tests
 *
 * Tests the sigmoid capability trajectory functions, automation coverage
 * computation, and weighted capability computation defined in src/models/capabilities.ts.
 *
 * Phase 8 Consolidation: 3 capability vectors (generative, agentic, embodied)
 * replace the original 8 vectors.
 *
 * Mathematical invariant under test:
 *   S_c(t) = floor + (ceiling - floor) / (1 + exp(-steepness * (t - midpointYear)))
 */

import { describe, it, expect } from 'vitest';
import {
  getCapabilityScore,
  getAllCapabilityScores,
  getDefaultCapabilityScores,
  computeAutomationCoverage,
  computeWeightedCapability,
} from '@/models/capabilities';
import { DEFAULT_CAPABILITY_TRAJECTORIES } from '@/models/constants';
import type { CapabilityVectorId, CapabilityTrajectoryParams } from '@/types';

const ALL_VECTOR_IDS: CapabilityVectorId[] = [
  'generative', 'agentic', 'embodied',
];

/**
 * Standard test trajectory with well-separated floor/ceiling for clear assertions.
 */
const TEST_PARAMS: CapabilityTrajectoryParams = {
  floor: 0.2,
  ceiling: 0.9,
  steepness: 1.0,
  midpointYear: 2035,
};

describe('getCapabilityScore', () => {
  it('returns approximately the floor when year is far before the midpoint', () => {
    // 50 years before midpoint: sigmoid exponent is -1 * (1985 - 2035) = +50
    // exp(50) is enormous, so sigmoid -> 0, score -> floor
    const score = getCapabilityScore('generative', 1985, TEST_PARAMS);
    expect(score).toBeCloseTo(TEST_PARAMS.floor, 2);
  });

  it('returns approximately the ceiling when year is far after the midpoint', () => {
    // 50 years after midpoint: sigmoid exponent is -1 * (2085 - 2035) = -50
    // exp(-50) -> 0, so sigmoid -> 1, score -> ceiling
    const score = getCapabilityScore('generative', 2085, TEST_PARAMS);
    expect(score).toBeCloseTo(TEST_PARAMS.ceiling, 2);
  });

  it('returns the midpoint value (floor + (ceiling - floor) / 2) at the midpoint year', () => {
    // At midpoint: exponent = 0, exp(0) = 1, sigmoid = 1/2
    // score = floor + (ceiling - floor) * 0.5
    const expectedMidpoint = TEST_PARAMS.floor + (TEST_PARAMS.ceiling - TEST_PARAMS.floor) / 2;
    const score = getCapabilityScore('generative', TEST_PARAMS.midpointYear, TEST_PARAMS);
    expect(score).toBeCloseTo(expectedMidpoint, 10);
  });

  it('clamps score to [0, 1] even with extreme floor/ceiling values', () => {
    // A trajectory with ceiling > 1 should be clamped
    const paramsAboveOne: CapabilityTrajectoryParams = {
      floor: 0.8,
      ceiling: 1.5,
      steepness: 1.0,
      midpointYear: 2030,
    };
    const scoreFarFuture = getCapabilityScore('agentic', 2080, paramsAboveOne);
    expect(scoreFarFuture).toBeLessThanOrEqual(1);
    expect(scoreFarFuture).toBeGreaterThanOrEqual(0);

    // A trajectory with floor < 0 should be clamped
    const paramsBelowZero: CapabilityTrajectoryParams = {
      floor: -0.2,
      ceiling: 0.5,
      steepness: 1.0,
      midpointYear: 2030,
    };
    const scoreFarPast = getCapabilityScore('agentic', 1950, paramsBelowZero);
    expect(scoreFarPast).toBeGreaterThanOrEqual(0);
    expect(scoreFarPast).toBeLessThanOrEqual(1);
  });

  it('transitions faster with higher steepness', () => {
    const yearBeforeMidpoint = TEST_PARAMS.midpointYear - 3;

    // Low steepness: gradual curve, score closer to midpoint value
    const lowSteepness: CapabilityTrajectoryParams = { ...TEST_PARAMS, steepness: 0.3 };
    const scoreLow = getCapabilityScore('embodied', yearBeforeMidpoint, lowSteepness);

    // High steepness: sharp curve, score closer to floor
    const highSteepness: CapabilityTrajectoryParams = { ...TEST_PARAMS, steepness: 3.0 };
    const scoreHigh = getCapabilityScore('embodied', yearBeforeMidpoint, highSteepness);

    // Before the midpoint, a steeper curve should yield a LOWER score
    // (it transitions more sharply around midpoint, staying closer to floor before it)
    expect(scoreHigh).toBeLessThan(scoreLow);

    // After the midpoint, the relationship reverses
    const yearAfterMidpoint = TEST_PARAMS.midpointYear + 3;
    const scoreLowAfter = getCapabilityScore('embodied', yearAfterMidpoint, lowSteepness);
    const scoreHighAfter = getCapabilityScore('embodied', yearAfterMidpoint, highSteepness);
    expect(scoreHighAfter).toBeGreaterThan(scoreLowAfter);
  });
});

describe('getAllCapabilityScores', () => {
  it('returns scores for all 3 capability vectors', () => {
    const scores = getAllCapabilityScores(2030, DEFAULT_CAPABILITY_TRAJECTORIES);

    expect(Object.keys(scores)).toHaveLength(3);
    for (const id of ALL_VECTOR_IDS) {
      expect(scores[id]).toBeDefined();
      expect(typeof scores[id]).toBe('number');
      expect(scores[id]).toBeGreaterThanOrEqual(0);
      expect(scores[id]).toBeLessThanOrEqual(1);
    }
  });

  it('produces consistent results with getCapabilityScore for each vector', () => {
    const year = 2032;
    const scores = getAllCapabilityScores(year, DEFAULT_CAPABILITY_TRAJECTORIES);

    for (const id of ALL_VECTOR_IDS) {
      const individual = getCapabilityScore(id, year, DEFAULT_CAPABILITY_TRAJECTORIES[id]);
      expect(scores[id]).toBeCloseTo(individual, 10);
    }
  });
});

describe('getDefaultCapabilityScores', () => {
  it('returns valid scores for all 3 vectors using default trajectories', () => {
    const scores = getDefaultCapabilityScores(2030);

    expect(Object.keys(scores)).toHaveLength(3);
    for (const id of ALL_VECTOR_IDS) {
      expect(scores[id]).toBeGreaterThanOrEqual(0);
      expect(scores[id]).toBeLessThanOrEqual(1);
    }
  });

  it('produces identical results to getAllCapabilityScores with DEFAULT_CAPABILITY_TRAJECTORIES', () => {
    const year = 2028;
    const defaultScores = getDefaultCapabilityScores(year);
    const explicitScores = getAllCapabilityScores(year, DEFAULT_CAPABILITY_TRAJECTORIES);

    for (const id of ALL_VECTOR_IDS) {
      expect(defaultScores[id]).toBeCloseTo(explicitScores[id], 10);
    }
  });
});

describe('computeAutomationCoverage', () => {
  it('returns the arithmetic mean of all 3 capability scores', () => {
    const scores: Record<CapabilityVectorId, number> = {
      generative: 0.8,
      agentic: 0.5,
      embodied: 0.3,
    };

    const expected = (0.8 + 0.5 + 0.3) / 3;
    const coverage = computeAutomationCoverage(scores);
    expect(coverage).toBeCloseTo(expected, 10);
  });

  it('returns 0 when all capability scores are 0', () => {
    const zeroScores: Record<CapabilityVectorId, number> = {
      generative: 0, agentic: 0, embodied: 0,
    };

    expect(computeAutomationCoverage(zeroScores)).toBe(0);
  });

  it('returns 1 when all capability scores are 1', () => {
    const maxScores: Record<CapabilityVectorId, number> = {
      generative: 1, agentic: 1, embodied: 1,
    };

    expect(computeAutomationCoverage(maxScores)).toBe(1);
  });
});

describe('computeWeightedCapability', () => {
  it('returns the weighted sum of capability scores', () => {
    const scores: Record<CapabilityVectorId, number> = {
      generative: 0.8,
      agentic: 0.6,
      embodied: 0.3,
    };
    const weights: Record<CapabilityVectorId, number> = {
      generative: 0.5,
      agentic: 0.3,
      embodied: 0.2,
    };

    // 0.5*0.8 + 0.3*0.6 + 0.2*0.3 = 0.40 + 0.18 + 0.06 = 0.64
    const result = computeWeightedCapability(scores, weights);
    expect(result).toBeCloseTo(0.64, 10);
  });

  it('returns 0 when all scores are 0', () => {
    const scores: Record<CapabilityVectorId, number> = {
      generative: 0, agentic: 0, embodied: 0,
    };
    const weights: Record<CapabilityVectorId, number> = {
      generative: 0.5, agentic: 0.3, embodied: 0.2,
    };

    expect(computeWeightedCapability(scores, weights)).toBe(0);
  });

  it('returns the score itself when one weight is 1 and others are 0', () => {
    const scores: Record<CapabilityVectorId, number> = {
      generative: 0.75,
      agentic: 0.50,
      embodied: 0.25,
    };
    const weights: Record<CapabilityVectorId, number> = {
      generative: 0, agentic: 1, embodied: 0,
    };

    expect(computeWeightedCapability(scores, weights)).toBeCloseTo(0.50, 10);
  });

  it('equals computeAutomationCoverage when weights are equal (1/3 each)', () => {
    const scores: Record<CapabilityVectorId, number> = {
      generative: 0.9,
      agentic: 0.6,
      embodied: 0.3,
    };
    const equalWeights: Record<CapabilityVectorId, number> = {
      generative: 1 / 3,
      agentic: 1 / 3,
      embodied: 1 / 3,
    };

    const weighted = computeWeightedCapability(scores, equalWeights);
    const coverage = computeAutomationCoverage(scores);
    expect(weighted).toBeCloseTo(coverage, 10);
  });
});
