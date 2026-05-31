/**
 * ATLAS BFCS Threshold Model — Unit Tests
 *
 * Tests the Better / Faster / Cheaper / Safer four-dimensional threshold model
 * defined in src/models/bfcs.ts.
 *
 * Core invariant: adoption is triggered IFF all four BFCS scores >= their
 * respective thresholds simultaneously.
 */

import { describe, it, expect } from 'vitest';
import {
  computeBetterScore,
  computeFasterScore,
  computeCheaperScore,
  computeSaferScore,
  computeBFCSScores,
  checkThresholdsMet,
  checkAdoptionTrigger,
  findTriggerYear,
} from '@/models/bfcs';
import type {
  CapabilityVectorId,
  OccupationCluster,
  RoleDefinition,
  BFCSScores,
  BFCSThresholds,
} from '@/types';

// ============================================================
// Test fixtures
// ============================================================

const ALL_VECTOR_IDS: CapabilityVectorId[] = [
  'generative', 'agentic', 'embodied',
];

/** A software-deployment cluster for testing (e.g., tech SWE). */
function createMockCluster(overrides?: Partial<OccupationCluster>): OccupationCluster {
  return {
    id: 'tech_swe',
    name: 'Software Engineers',
    category: 'Technology',
    socCodes: ['15-1252'],
    roles: [],
    capabilityRelevance: {
      weights: {
        generative: 0.8,
        agentic: 0.7,
        embodied: 0.0,
      },
    },
    deploymentType: 'software',
    employmentMultiplier: 4.3,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0.05,
    notes: 'Test cluster',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    productivityToHeadcountRatio: 0.7,
    wageElasticity: 0.6,
    taskAutomatableFraction: { junior: 0.8, mid: 0.6, senior: 0.4 },
    adoptionSteepness: 1.0,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.20,
    govDemandShare: 0.10,
    ...overrides,
  };
}

/** A robotics-deployment cluster for comparing deployment types. */
function createRoboticsCluster(): OccupationCluster {
  return createMockCluster({
    id: 'mfg_assembly',
    name: 'Assembly Workers',
    category: 'Manufacturing',
    deploymentType: 'robotics',
    capabilityRelevance: {
      weights: {
        generative: 0.1,
        agentic: 0.2,
        embodied: 0.9,
      },
    },
  });
}

function createMockRole(overrides?: Partial<RoleDefinition>): RoleDefinition {
  return {
    id: 'junior',
    label: 'Junior Developer',
    seniorityLevel: 0.3,
    aiReplacementDifficulty: 0.3,
    employmentShareEstimate: 0.35,
    bfcsThresholds: {
      better: 0.6,
      faster: 0.5,
      cheaper: 0.4,
      safer: 0.5,
    },
    ...overrides,
  };
}

function createSeniorRole(): RoleDefinition {
  return createMockRole({
    id: 'senior',
    label: 'Senior Developer',
    seniorityLevel: 0.9,
    aiReplacementDifficulty: 0.9,
    employmentShareEstimate: 0.25,
    bfcsThresholds: {
      better: 0.85,
      faster: 0.7,
      cheaper: 0.6,
      safer: 0.7,
    },
  });
}

/** Create capability scores where every vector has the same value. */
function uniformScores(value: number): Record<CapabilityVectorId, number> {
  const scores = {} as Record<CapabilityVectorId, number>;
  for (const id of ALL_VECTOR_IDS) {
    scores[id] = value;
  }
  return scores;
}

const DEFAULT_START_YEAR = 2025;

// ============================================================
// Better Score
// ============================================================

describe('computeBetterScore', () => {
  const cluster = createMockCluster();
  const juniorRole = createMockRole();
  const seniorRole = createSeniorRole();

  it('increases with higher capability scores', () => {
    const lowScores = uniformScores(0.3);
    const highScores = uniformScores(0.8);

    const scoreLow = computeBetterScore(lowScores, cluster, juniorRole);
    const scoreHigh = computeBetterScore(highScores, cluster, juniorRole);

    expect(scoreHigh).toBeGreaterThan(scoreLow);
  });

  // DEPRECATED (Phase 10.A): quality multiplier removed from computeBetterScore.
  // Role difficulty gating moved to aiReplacementDifficultyFriction (adoption-delay inside findTriggerYear).
  // Under the new formula, junior and senior roles in the SAME cluster have the SAME Better
  // score (same weighted-sum of capability scores); differentiation moves to the friction term.
  // Phase 6 adds bfcs.betterScore.cleanup.test.ts asserting this exact property.
  it('is identical for junior and senior in the same cluster (Phase 10.A: quality multiplier removed)', () => {
    const capScores = uniformScores(0.6);
    const juniorBetter = computeBetterScore(capScores, cluster, juniorRole);
    const seniorBetter = computeBetterScore(capScores, cluster, seniorRole);
    expect(juniorBetter).toBeCloseTo(seniorBetter, 10);
  });
});

// ============================================================
// Faster Score
// ============================================================

describe('computeFasterScore', () => {
  const cluster = createMockCluster();

  it('increases over time as inference speed improves', () => {
    const scoreEarly = computeFasterScore(DEFAULT_START_YEAR, cluster);
    const scoreLater = computeFasterScore(DEFAULT_START_YEAR + 10, cluster);

    expect(scoreLater).toBeGreaterThan(scoreEarly);
  });
});

// ============================================================
// Cheaper Score
// ============================================================

describe('computeCheaperScore', () => {
  const softwareCluster = createMockCluster();
  const roboticsCluster = createRoboticsCluster();
  const role = createMockRole();

  it('increases over time as AI costs decline', () => {
    const scoreEarly = computeCheaperScore(DEFAULT_START_YEAR, role, softwareCluster);
    const scoreLater = computeCheaperScore(DEFAULT_START_YEAR + 10, role, softwareCluster);

    expect(scoreLater).toBeGreaterThan(scoreEarly);
  });

  it('increases faster for software deployment than robotics deployment', () => {
    // At the same future year, software should have a higher cheaper score
    // because physicalCostMultiplier for software is 1.0 vs 0.5 for robotics
    const futureYear = DEFAULT_START_YEAR + 5;

    const softwareCheaper = computeCheaperScore(futureYear, role, softwareCluster);
    const roboticsCheaper = computeCheaperScore(futureYear, role, roboticsCluster);

    expect(softwareCheaper).toBeGreaterThan(roboticsCheaper);
  });
});

// ============================================================
// Safer Score
// ============================================================

describe('computeSaferScore', () => {
  const cluster = createMockCluster();

  it('increases over time as safety records improve', () => {
    const scoreEarly = computeSaferScore(DEFAULT_START_YEAR, cluster);
    const scoreLater = computeSaferScore(DEFAULT_START_YEAR + 10, cluster);

    expect(scoreLater).toBeGreaterThan(scoreEarly);
  });
});

// ============================================================
// computeBFCSScores (composite)
// ============================================================

describe('computeBFCSScores', () => {
  it('returns all four BFCS scores as an object', () => {
    const cluster = createMockCluster();
    const role = createMockRole();
    const capScores = uniformScores(0.7);

    const bfcs = computeBFCSScores(capScores, cluster, role, DEFAULT_START_YEAR + 5);

    expect(bfcs).toHaveProperty('better');
    expect(bfcs).toHaveProperty('faster');
    expect(bfcs).toHaveProperty('cheaper');
    expect(bfcs).toHaveProperty('safer');

    expect(typeof bfcs.better).toBe('number');
    expect(typeof bfcs.faster).toBe('number');
    expect(typeof bfcs.cheaper).toBe('number');
    expect(typeof bfcs.safer).toBe('number');

    // All scores should be in [0, 1]
    for (const key of ['better', 'faster', 'cheaper', 'safer'] as const) {
      expect(bfcs[key]).toBeGreaterThanOrEqual(0);
      expect(bfcs[key]).toBeLessThanOrEqual(1);
    }
  });
});

// ============================================================
// checkThresholdsMet
// ============================================================

describe('checkThresholdsMet', () => {
  const thresholds: BFCSThresholds = {
    better: 0.6,
    faster: 0.5,
    cheaper: 0.4,
    safer: 0.5,
  };

  it('returns true when ALL four scores meet or exceed their thresholds', () => {
    const scores: BFCSScores = {
      better: 0.7,
      faster: 0.6,
      cheaper: 0.5,
      safer: 0.6,
    };
    expect(checkThresholdsMet(scores, thresholds)).toBe(true);
  });

  it('returns true when scores are exactly at thresholds', () => {
    const scores: BFCSScores = {
      better: 0.6,
      faster: 0.5,
      cheaper: 0.4,
      safer: 0.5,
    };
    expect(checkThresholdsMet(scores, thresholds)).toBe(true);
  });

  it('returns false when Better is below threshold', () => {
    const scores: BFCSScores = {
      better: 0.5,  // below 0.6
      faster: 0.8,
      cheaper: 0.8,
      safer: 0.8,
    };
    expect(checkThresholdsMet(scores, thresholds)).toBe(false);
  });

  it('returns false when Faster is below threshold', () => {
    const scores: BFCSScores = {
      better: 0.8,
      faster: 0.4,  // below 0.5
      cheaper: 0.8,
      safer: 0.8,
    };
    expect(checkThresholdsMet(scores, thresholds)).toBe(false);
  });

  it('returns false when Cheaper is below threshold', () => {
    const scores: BFCSScores = {
      better: 0.8,
      faster: 0.8,
      cheaper: 0.3,  // below 0.4
      safer: 0.8,
    };
    expect(checkThresholdsMet(scores, thresholds)).toBe(false);
  });

  it('returns false when Safer is below threshold', () => {
    const scores: BFCSScores = {
      better: 0.8,
      faster: 0.8,
      cheaper: 0.8,
      safer: 0.4,  // below 0.5
    };
    expect(checkThresholdsMet(scores, thresholds)).toBe(false);
  });
});

// ============================================================
// checkAdoptionTrigger
// ============================================================

describe('checkAdoptionTrigger', () => {
  const cluster = createMockCluster();

  it('combines BFCS score computation with threshold checking', () => {
    // Use a role with very low thresholds and high capability scores
    // so the trigger fires
    const easyRole = createMockRole({
      bfcsThresholds: { better: 0.1, faster: 0.1, cheaper: 0.1, safer: 0.1 },
    });
    const highScores = uniformScores(0.9);

    const result = checkAdoptionTrigger(cluster, easyRole, DEFAULT_START_YEAR + 10, highScores);

    expect(result).toHaveProperty('triggered');
    expect(result).toHaveProperty('scores');
    expect(result.triggered).toBe(true);
    expect(result.scores.better).toBeGreaterThanOrEqual(0);
    expect(result.scores.faster).toBeGreaterThanOrEqual(0);
    expect(result.scores.cheaper).toBeGreaterThanOrEqual(0);
    expect(result.scores.safer).toBeGreaterThanOrEqual(0);
  });

  it('returns triggered=false when capability scores are too low', () => {
    const hardRole = createMockRole({
      bfcsThresholds: { better: 0.99, faster: 0.99, cheaper: 0.99, safer: 0.99 },
    });
    const lowScores = uniformScores(0.1);

    const result = checkAdoptionTrigger(cluster, hardRole, DEFAULT_START_YEAR, lowScores);

    expect(result.triggered).toBe(false);
  });
});

// ============================================================
// findTriggerYear
// ============================================================

describe('findTriggerYear', () => {
  const cluster = createMockCluster();

  it('finds the correct year when thresholds are eventually met', () => {
    // Use easy thresholds that will be met once capability scores rise enough
    const easyRole = createMockRole({
      bfcsThresholds: { better: 0.1, faster: 0.1, cheaper: 0.1, safer: 0.1 },
    });

    // Capability scores that ramp up linearly from 0 to 1 over 20 years
    const getScoresForYear = (year: number): Record<CapabilityVectorId, number> => {
      const progress = Math.min(1, Math.max(0, (year - DEFAULT_START_YEAR) / 20));
      return uniformScores(progress);
    };

    const triggerYear = findTriggerYear(
      cluster,
      easyRole,
      DEFAULT_START_YEAR,
      DEFAULT_START_YEAR + 25,
      getScoresForYear,
    );

    expect(triggerYear).not.toBeNull();
    expect(triggerYear).toBeGreaterThanOrEqual(DEFAULT_START_YEAR);
    expect(triggerYear).toBeLessThanOrEqual(DEFAULT_START_YEAR + 25);

    // Verify that the year before does NOT trigger (or it is the start year)
    if (triggerYear !== null && triggerYear > DEFAULT_START_YEAR) {
      const priorScores = getScoresForYear(triggerYear - 1);
      const priorResult = checkAdoptionTrigger(cluster, easyRole, triggerYear - 1, priorScores);
      expect(priorResult.triggered).toBe(false);
    }
  });

  it('returns null when thresholds are never met within the scan range', () => {
    // Impossibly high thresholds
    const impossibleRole = createMockRole({
      bfcsThresholds: { better: 0.99, faster: 0.99, cheaper: 0.99, safer: 0.99 },
    });

    // Scores that stay very low
    const getScoresForYear = (_year: number): Record<CapabilityVectorId, number> => {
      return uniformScores(0.05);
    };

    const triggerYear = findTriggerYear(
      cluster,
      impossibleRole,
      DEFAULT_START_YEAR,
      DEFAULT_START_YEAR + 25,
      getScoresForYear,
    );

    expect(triggerYear).toBeNull();
  });
});
