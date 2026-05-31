/**
 * ATLAS Displacement Model Tests
 *
 * Tests simplified displacement, wage depression, and full
 * role/cluster displacement computations from src/models/displacement.ts.
 *
 * Phase 8 Consolidation: Old computeTaskErosion and computeHeadcountMultiplier
 * tests replaced with computeSimplifiedDisplacement tests.
 *
 * Reference: DATA_MODEL.md Section 4
 */

import { describe, it, expect } from 'vitest';
import {
  computeSimplifiedDisplacement,
  computeWageMultiplier,
  computeRoleDisplacement,
  computeClusterDisplacement,
} from '@/models/displacement';
import type { OccupationCluster, RoleDefinition } from '@/types';

// ---------------------------------------------------------------------------
// Shared mock cluster for role and cluster displacement tests
// ---------------------------------------------------------------------------

const juniorRole: RoleDefinition = {
  id: 'junior',
  label: 'Junior',
  seniorityLevel: 0.3,
  aiReplacementDifficulty: 0.3,
  employmentShareEstimate: 0.6,
  bfcsThresholds: {
    better: 0.3,
    faster: 0.3,
    cheaper: 0.3,
    safer: 0.3,
  },
};

const seniorRole: RoleDefinition = {
  id: 'senior',
  label: 'Senior',
  seniorityLevel: 0.8,
  aiReplacementDifficulty: 0.8,
  employmentShareEstimate: 0.4,
  bfcsThresholds: {
    better: 0.3,
    faster: 0.3,
    cheaper: 0.3,
    safer: 0.3,
  },
};

const testCluster: OccupationCluster = {
  id: 'test_cluster',
  name: 'Test Cluster',
  category: 'Technology',
  socCodes: [],
  roles: [juniorRole, seniorRole],
  capabilityRelevance: {
    weights: {
      generative: 0.5,
      agentic: 0.3,
      embodied: 0.2,
    },
  },
  deploymentType: 'software',
  employmentMultiplier: 1.5,
  adoptionLag: 0,
  geopoliticalRiskExposure: 0,
  notes: 'Test cluster for unit tests',
  protectedByPolicy: false,
  policyDisplacementTarget: false,
  wageElasticity: 0.5,
  adoptionSteepness: 1.0,
  adoptionCeiling: 1.0,
  consumerDemandShare: 0.20,
  govDemandShare: 0.10,
};

// ---------------------------------------------------------------------------
// computeSimplifiedDisplacement
// ---------------------------------------------------------------------------
describe('computeSimplifiedDisplacement', () => {
  it('returns 0 when adoption rate is 0', () => {
    expect(computeSimplifiedDisplacement(0, 0.8)).toBe(0);
  });

  it('returns 0 when weighted capability is 0', () => {
    expect(computeSimplifiedDisplacement(0.5, 0)).toBe(0);
  });

  it('computes adoptionRate * weightedCapability^2', () => {
    // 0.5 * 0.8^2 = 0.5 * 0.64 = 0.32
    expect(computeSimplifiedDisplacement(0.5, 0.8)).toBeCloseTo(0.32, 10);
  });

  it('returns 1.0 at full adoption and full capability', () => {
    // 1.0 * 1.0^2 = 1.0
    expect(computeSimplifiedDisplacement(1.0, 1.0)).toBeCloseTo(1.0, 10);
  });

  it('produces low displacement at low capability', () => {
    // 1.0 * 0.3^2 = 1.0 * 0.09 = 0.09
    expect(computeSimplifiedDisplacement(1.0, 0.3)).toBeCloseTo(0.09, 10);
  });

  it('produces moderate displacement at moderate capability', () => {
    // 1.0 * 0.5^2 = 1.0 * 0.25 = 0.25
    expect(computeSimplifiedDisplacement(1.0, 0.5)).toBeCloseTo(0.25, 10);
  });

  it('produces high displacement at high capability', () => {
    // 1.0 * 0.7^2 = 1.0 * 0.49 = 0.49
    expect(computeSimplifiedDisplacement(1.0, 0.7)).toBeCloseTo(0.49, 10);
  });

  it('produces near-full displacement at near-perfect capability', () => {
    // 1.0 * 0.9^2 = 1.0 * 0.81 = 0.81
    expect(computeSimplifiedDisplacement(1.0, 0.9)).toBeCloseTo(0.81, 10);
  });

  it('clamps result to [0, 1]', () => {
    // Even if given out-of-range inputs, result must be in [0, 1]
    expect(computeSimplifiedDisplacement(1.5, 0.9)).toBeLessThanOrEqual(1);
    expect(computeSimplifiedDisplacement(-0.1, 0.5)).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// computeWageMultiplier
// ---------------------------------------------------------------------------
describe('computeWageMultiplier', () => {
  it('returns 1.0 when displacement is 0 (no wage depression)', () => {
    expect(computeWageMultiplier(0, 0.5)).toBe(1);
  });

  it('returns 0.5 at full displacement with elasticity 0.5', () => {
    // 1 - (1.0 * 0.5) = 0.5
    expect(computeWageMultiplier(1.0, 0.5)).toBeCloseTo(0.5, 10);
  });
});

// ---------------------------------------------------------------------------
// computeRoleDisplacement
// ---------------------------------------------------------------------------
describe('computeRoleDisplacement', () => {
  // Phase 10.A: V2 uses `adoption × weightedCapability × alpha` (replaces squared proxy).
  // These tests preserve prior numeric expectations by passing alpha = weightedCapability,
  // which exactly reproduces the old squared formula. Phase 6 adds new V2-specific tests.
  it('preserves baseline employment when adoption rate is 0', () => {
    const baselineEmployment = 100_000;
    const baselineWage = 60_000;
    const weightedCapability = 0.7;
    const alpha = weightedCapability;

    const result = computeRoleDisplacement(
      juniorRole,
      testCluster,
      0,
      baselineEmployment,
      baselineWage,
      weightedCapability,
      alpha,
    );

    expect(result.roleId).toBe('junior');
    expect(result.displacementPct).toBe(0);
    expect(result.headcountMultiplier).toBe(1);
    expect(result.wageMultiplier).toBe(1);
    expect(result.remainingEmployment).toBe(baselineEmployment);
    expect(result.remainingWage).toBe(baselineWage);
  });

  it('preserves baseline employment when weighted capability is 0', () => {
    const baselineEmployment = 100_000;
    const baselineWage = 60_000;
    const weightedCapability = 0;
    const alpha = 0;

    const result = computeRoleDisplacement(
      juniorRole,
      testCluster,
      0.5,
      baselineEmployment,
      baselineWage,
      weightedCapability,
      alpha,
    );

    expect(result.displacementPct).toBe(0);
    expect(result.headcountMultiplier).toBe(1);
    expect(result.wageMultiplier).toBe(1);
    expect(result.remainingEmployment).toBe(baselineEmployment);
    expect(result.remainingWage).toBe(baselineWage);
  });

  it('reduces employment at 50% adoption with weightedCapability 0.8 (α=0.8)', () => {
    const baselineEmployment = 100_000;
    const baselineWage = 60_000;
    const weightedCapability = 0.8;
    const alpha = weightedCapability; // 0.8 — reproduces old × capability² numerically

    const result = computeRoleDisplacement(
      juniorRole,
      testCluster,
      0.5,
      baselineEmployment,
      baselineWage,
      weightedCapability,
      alpha,
    );

    // V2: displacementPct = 0.5 × 0.8 × 0.8 = 0.32 (same as old × capability²)
    expect(result.displacementPct).toBeCloseTo(0.32, 10);

    // headcountMultiplier = 1 - 0.32 = 0.68
    expect(result.headcountMultiplier).toBeCloseTo(0.68, 10);

    // wageMultiplier = 1 - (0.32 * 0.5) = 1 - 0.16 = 0.84
    expect(result.wageMultiplier).toBeCloseTo(0.84, 10);

    // remainingEmployment = 100_000 * 0.68 = 68_000
    expect(result.remainingEmployment).toBeCloseTo(68_000, 0);

    // remainingWage = 60_000 * 0.84 = 50_400
    expect(result.remainingWage).toBeCloseTo(50_400, 0);
  });
});

// ---------------------------------------------------------------------------
// computeClusterDisplacement
// ---------------------------------------------------------------------------
describe('computeClusterDisplacement', () => {
  it('aggregates displacement results across all roles', () => {
    const adoptionRates: Record<string, number> = {
      junior: 0.5,
      senior: 0.3,
    };
    const baselineEmployments: Record<string, number> = {
      junior: 60_000,
      senior: 40_000,
    };
    const baselineWages: Record<string, number> = {
      junior: 50_000,
      senior: 90_000,
    };
    const weightedCapability = 0.7;
    // Phase 10.A: pass alphaByRole = weightedCapability per role to reproduce old × capability² numerics
    const alphaByRole: Record<string, number> = {
      junior: weightedCapability,
      senior: weightedCapability,
    };

    const result = computeClusterDisplacement(
      testCluster,
      adoptionRates,
      baselineEmployments,
      baselineWages,
      weightedCapability,
      alphaByRole,
    );

    expect(result.clusterId).toBe('test_cluster');
    expect(result.roles).toHaveLength(2);

    // V2 with alpha=capability: displacementPct = adoption × capability × capability (same as squared)
    const capSq = weightedCapability * weightedCapability; // 0.49
    const juniorDisp = 0.5 * capSq; // 0.245
    const seniorDisp = 0.3 * capSq; // 0.147
    const expectedJuniorRemaining = 60_000 * (1 - juniorDisp);
    const expectedSeniorRemaining = 40_000 * (1 - seniorDisp);
    const expectedTotalRemaining = expectedJuniorRemaining + expectedSeniorRemaining;
    const expectedTotalBaseline = 60_000 + 40_000;
    const expectedDirectDisplacement = expectedTotalBaseline - expectedTotalRemaining;

    expect(result.totalRemainingEmployment).toBeCloseTo(expectedTotalRemaining, 0);
    expect(result.totalDirectDisplacement).toBeCloseTo(expectedDirectDisplacement, 0);
  });

  it('reports second-order displacement via employment multiplier', () => {
    const adoptionRates: Record<string, number> = {
      junior: 0.5,
      senior: 0.3,
    };
    const baselineEmployments: Record<string, number> = {
      junior: 60_000,
      senior: 40_000,
    };
    const baselineWages: Record<string, number> = {
      junior: 50_000,
      senior: 90_000,
    };
    const weightedCapability = 0.7;
    const alphaByRole: Record<string, number> = {
      junior: weightedCapability,
      senior: weightedCapability,
    };

    const result = computeClusterDisplacement(
      testCluster,
      adoptionRates,
      baselineEmployments,
      baselineWages,
      weightedCapability,
      alphaByRole,
    );

    // secondOrderDisplacement = directDisplacement * (multiplier - 1)
    // multiplier = 1.5, so second-order = direct * 0.5
    expect(result.secondOrderDisplacement).toBeCloseTo(
      result.totalDirectDisplacement * (testCluster.employmentMultiplier - 1),
      0,
    );

    // totalDisplacement = direct + second-order
    expect(result.totalDisplacement).toBeCloseTo(
      result.totalDirectDisplacement + result.secondOrderDisplacement,
      0,
    );
  });
});
