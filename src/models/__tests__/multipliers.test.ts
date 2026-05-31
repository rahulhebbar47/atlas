/**
 * ATLAS Second-Order Employment Multipliers — Unit Tests
 *
 * Tests the multiplier lookup, aggregate displacement computation,
 * and adjacency-based cascading displacement effects defined in
 * src/models/multipliers.ts.
 *
 * Mathematical invariants under test per DATA_MODEL.md Section 9.
 */

import { describe, it, expect } from 'vitest';
import {
  getEmploymentMultiplier,
  computeAggregateDisplacement,
  computeAdjacentDisplacement,
  ADJACENCY_WEIGHTS,
} from '@/models/multipliers';
import type { ClusterDisplacementResult, OccupationClusterId } from '@/types';

// ============================================================
// Test Helpers
// ============================================================

/**
 * Creates a minimal ClusterDisplacementResult for testing.
 */
function makeClusterResult(
  clusterId: string,
  overrides: Partial<ClusterDisplacementResult> = {},
): ClusterDisplacementResult {
  return {
    clusterId,
    roles: [],
    totalRemainingEmployment: 100_000,
    totalDirectDisplacement: 10_000,
    secondOrderDisplacement: 5_000,
    totalDisplacement: 15_000,
    averageWage: 55_000,
    bfcsOutput: [],
    ...overrides,
  };
}

// ============================================================
// getEmploymentMultiplier
// ============================================================

describe('getEmploymentMultiplier', () => {
  it('returns known value for trucking (transport_trucking)', () => {
    const multiplier = getEmploymentMultiplier('transport_trucking' as OccupationClusterId);
    expect(multiplier).toBe(3.4);
  });

  it('returns 1.5 for unknown cluster', () => {
    const multiplier = getEmploymentMultiplier('nonexistent_cluster_xyz' as OccupationClusterId);
    expect(multiplier).toBe(1.5);
  });

  it('returns known value for tech_swe', () => {
    const multiplier = getEmploymentMultiplier('tech_swe' as OccupationClusterId);
    expect(multiplier).toBe(4.3);
  });
});

// ============================================================
// computeAggregateDisplacement
// ============================================================

describe('computeAggregateDisplacement', () => {
  it('sums direct displacement across clusters', () => {
    const clusters = [
      makeClusterResult('tech_swe', { totalDirectDisplacement: 5_000 }),
      makeClusterResult('finance_banking', { totalDirectDisplacement: 3_000 }),
      makeClusterResult('transport_trucking', { totalDirectDisplacement: 8_000 }),
    ];

    const result = computeAggregateDisplacement(clusters);
    expect(result.totalDirectDisplacement).toBe(16_000);
  });

  it('computes weighted average wage correctly', () => {
    const clusters = [
      makeClusterResult('tech_swe', {
        totalRemainingEmployment: 100_000,
        averageWage: 120_000,
      }),
      makeClusterResult('food_fast_food', {
        totalRemainingEmployment: 200_000,
        averageWage: 30_000,
      }),
    ];

    const result = computeAggregateDisplacement(clusters);

    // Weighted average: (100k * 120k + 200k * 30k) / 300k = (12B + 6B) / 300k = 60k
    const expectedWeightedWage =
      (100_000 * 120_000 + 200_000 * 30_000) / (100_000 + 200_000);
    expect(result.weightedAverageWage).toBeCloseTo(expectedWeightedWage, 2);
  });

  it('returns zeroes for empty array', () => {
    const result = computeAggregateDisplacement([]);

    expect(result.totalDirectDisplacement).toBe(0);
    expect(result.totalSecondOrderDisplacement).toBe(0);
    expect(result.totalDisplacement).toBe(0);
    expect(result.totalRemainingEmployment).toBe(0);
    expect(result.weightedAverageWage).toBe(0);
  });

  it('sums second-order displacement correctly', () => {
    const clusters = [
      makeClusterResult('tech_swe', {
        secondOrderDisplacement: 2_000,
        totalDirectDisplacement: 5_000,
      }),
      makeClusterResult('finance_banking', {
        secondOrderDisplacement: 1_500,
        totalDirectDisplacement: 3_000,
      }),
    ];

    const result = computeAggregateDisplacement(clusters);
    expect(result.totalSecondOrderDisplacement).toBe(3_500);
    expect(result.totalDisplacement).toBe(
      result.totalDirectDisplacement + result.totalSecondOrderDisplacement,
    );
  });
});

// ============================================================
// computeAdjacentDisplacement
// ============================================================

describe('computeAdjacentDisplacement', () => {
  it('from trucking affects food/retail clusters', () => {
    const clusters = [
      makeClusterResult('transport_trucking', {
        totalDirectDisplacement: 100_000,
      }),
    ];

    const adjacent = computeAdjacentDisplacement(clusters);

    // transport_trucking has adjacency weights to:
    //   food_restaurant: 0.15, food_fast_food: 0.10, retail_cashiers: 0.05, transport_warehouse: 0.10
    expect(adjacent['food_restaurant']).toBeCloseTo(100_000 * 0.15, 2);
    expect(adjacent['food_fast_food']).toBeCloseTo(100_000 * 0.10, 2);
    expect(adjacent['retail_cashiers']).toBeCloseTo(100_000 * 0.05, 2);
    expect(adjacent['transport_warehouse']).toBeCloseTo(100_000 * 0.10, 2);
  });

  it('returns empty for unknown clusters with no adjacency weights', () => {
    const clusters = [
      makeClusterResult('nonexistent_cluster_xyz', {
        totalDirectDisplacement: 50_000,
      }),
    ];

    const adjacent = computeAdjacentDisplacement(clusters);
    expect(Object.keys(adjacent)).toHaveLength(0);
  });

  it('accumulates effects from multiple source clusters', () => {
    const clusters = [
      makeClusterResult('transport_trucking', {
        totalDirectDisplacement: 100_000,
      }),
      makeClusterResult('mfg_assembly', {
        totalDirectDisplacement: 50_000,
      }),
    ];

    const adjacent = computeAdjacentDisplacement(clusters);

    // food_restaurant gets contributions from both:
    //   trucking: 100_000 * 0.15 = 15_000
    //   mfg_assembly: 50_000 * 0.05 = 2_500
    const expectedFoodRestaurant =
      100_000 * ADJACENCY_WEIGHTS['transport_trucking']!['food_restaurant']! +
      50_000 * ADJACENCY_WEIGHTS['mfg_assembly']!['food_restaurant']!;
    expect(adjacent['food_restaurant']).toBeCloseTo(expectedFoodRestaurant, 2);

    // retail_cashiers gets contributions from both:
    //   trucking: 100_000 * 0.05 = 5_000
    //   mfg_assembly: 50_000 * 0.10 = 5_000
    const expectedRetailCashiers =
      100_000 * ADJACENCY_WEIGHTS['transport_trucking']!['retail_cashiers']! +
      50_000 * ADJACENCY_WEIGHTS['mfg_assembly']!['retail_cashiers']!;
    expect(adjacent['retail_cashiers']).toBeCloseTo(expectedRetailCashiers, 2);
  });
});
