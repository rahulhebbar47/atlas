/**
 * ATLAS Second-Order Employment Multipliers
 *
 * Implements cascading displacement effects per DATA_MODEL.md Section 9.
 * When a major employer category is automated, second-order effects
 * hit adjacent service jobs.
 *
 * All functions are PURE — no side effects, no state mutation.
 */

import type { ClusterDisplacementResult, OccupationClusterId } from '@/types';
import { EMPLOYMENT_MULTIPLIERS } from './constants';

/**
 * Get the employment multiplier for a cluster.
 * Falls back to 1.5 if no specific multiplier is defined.
 *
 * @param clusterId - The cluster identifier
 * @returns Employment multiplier (e.g., 3.4 for trucking)
 */
export function getEmploymentMultiplier(clusterId: OccupationClusterId): number {
  return EMPLOYMENT_MULTIPLIERS[clusterId] ?? 1.5;
}

/**
 * Compute total displacement including second-order effects.
 *
 * Formula (DATA_MODEL.md §9.1):
 *   total_displacement(o, t) = direct_displacement(o, t) * employment_multiplier(o)
 *
 * Note: The multiplier in the displacement model already computes second-order
 * effects per-cluster. This function provides aggregate calculations across
 * all clusters.
 *
 * @param clusterResults - Displacement results for all clusters
 * @returns Aggregate displacement metrics
 */
export function computeAggregateDisplacement(
  clusterResults: ClusterDisplacementResult[],
): {
  totalDirectDisplacement: number;
  totalSecondOrderDisplacement: number;
  totalDisplacement: number;
  totalRemainingEmployment: number;
  weightedAverageWage: number;
} {
  let totalDirect = 0;
  let totalSecondOrder = 0;
  let totalRemaining = 0;
  let wageWeightedSum = 0;

  for (const cluster of clusterResults) {
    totalDirect += cluster.totalDirectDisplacement;
    totalSecondOrder += cluster.secondOrderDisplacement;
    totalRemaining += cluster.totalRemainingEmployment;
    wageWeightedSum += cluster.averageWage * cluster.totalRemainingEmployment;
  }

  // Phase 5h (Fix 4): Bound total displacement to not exceed total baseline employment
  // Baseline = displaced + remaining (what was there before automation)
  const totalBaseline = totalDirect + totalSecondOrder + totalRemaining;
  const rawTotal = totalDirect + totalSecondOrder;
  const boundedTotal = Math.min(rawTotal, totalBaseline);
  const boundedRemaining = Math.max(0, totalBaseline - boundedTotal);

  const weightedAverageWage = boundedRemaining > 0
    ? wageWeightedSum / totalRemaining  // use original remaining for wage weighting
    : 0;

  return {
    totalDirectDisplacement: totalDirect,
    totalSecondOrderDisplacement: totalSecondOrder,
    totalDisplacement: boundedTotal,
    totalRemainingEmployment: boundedRemaining,
    weightedAverageWage,
  };
}

/**
 * Adjacency weight matrix for cascading displacement effects.
 *
 * Formula (DATA_MODEL.md §9.2):
 *   adjacent_displacement(o_adj, t) = Σ(displacement(o, t) × adjacency_weight(o, o_adj))
 *
 * This captures relationships like:
 *   Trucking → Truck stops, diners, motels, fuel stations
 *   Office workers → Downtown restaurants, dry cleaners, commercial real estate
 *   Manufacturing → Supplier towns, local retail
 *
 * Returns the adjacency weight between two cluster categories.
 */
export const ADJACENCY_WEIGHTS: Record<string, Record<string, number>> = {
  transport_trucking: {
    food_restaurant: 0.15,
    food_fast_food: 0.10,
    retail_cashiers: 0.05,
    transport_warehouse: 0.10,
  },
  transport_taxi: {
    food_restaurant: 0.05,
  },
  mfg_assembly: {
    retail_cashiers: 0.10,
    food_fast_food: 0.08,
    food_restaurant: 0.05,
    transport_delivery: 0.05,
  },
  mfg_machinists: {
    retail_cashiers: 0.05,
    food_fast_food: 0.05,
  },
  // Office-based clusters affect downtown services
  finance_trading: {
    food_restaurant: 0.08,
    retail_cashiers: 0.03,
    prof_admin: 0.05,
  },
  finance_banking: {
    food_restaurant: 0.05,
    retail_cashiers: 0.03,
    prof_admin: 0.05,
  },
  tech_swe: {
    food_restaurant: 0.06,
    retail_cashiers: 0.03,
    prof_admin: 0.04,
  },
  legal_attorneys: {
    food_restaurant: 0.05,
    prof_admin: 0.08,
  },
};

/**
 * Compute cascading displacement from adjacency effects.
 * This is an additional layer on top of the per-cluster multiplier.
 *
 * @param clusterResults - All cluster displacement results
 * @returns Additional displacement per cluster from adjacency effects
 */
export function computeAdjacentDisplacement(
  clusterResults: ClusterDisplacementResult[],
): Record<string, number> {
  const additionalDisplacement: Record<string, number> = {};

  for (const source of clusterResults) {
    const adjacencyMap = ADJACENCY_WEIGHTS[source.clusterId];
    if (!adjacencyMap) continue;

    for (const [targetClusterId, weight] of Object.entries(adjacencyMap)) {
      const additionalJobs = source.totalDirectDisplacement * weight;
      additionalDisplacement[targetClusterId] =
        (additionalDisplacement[targetClusterId] ?? 0) + additionalJobs;
    }
  }

  return additionalDisplacement;
}
