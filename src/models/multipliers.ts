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
 *
 * DISPLAY/TEST-ONLY (FS-5 ruled, FS-5b marked — the F-C genus; liveness re-verified at
 * FS-5b: callers = tests only). NOT on the simulation path — simulation.ts builds effective
 * clusters from EMPLOYMENT_MULTIPLIERS with the documented config-override precedence
 * (FS-5: end-to-end checked, 0 divergent).
 *
 * @param clusterId - The cluster identifier
 * @returns Employment multiplier (e.g., 3.4 for trucking)
 */
export function getEmploymentMultiplier(clusterId: OccupationClusterId): number {
  // FS-2b (the F6 genus): the ?? 1.5 fallback was DEAD CODE (51/51 coverage verified at FS-2;
  // the exhaustiveness test guards). Old line per the no-delete rule:
  // return EMPLOYMENT_MULTIPLIERS[clusterId] ?? 1.5;
  return EMPLOYMENT_MULTIPLIERS[clusterId]!; // reason: test-enforced exhaustiveness; a missing key fails the suite, never a silent 1.5
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
 * DEPRECATED — REGISTERED-INACTIVE; DO NOT WIRE (FS-5 ruled doc-correct, FS-5b marked).
 * This matrix has NEVER been on the simulation path (liveness-proven at FS-5: no simulation
 * caller), and its weights were never cited. Kept, not deleted, because: (1) the standing
 * no-delete rule; (2) MultiplierFlowDiagram.tsx renders it as a display-only illustration
 * (found at FS-5b — its flows are NOT simulation output); (3) it is the reference object for
 * the REGISTERED adjacency-cascade enrichment (DATA_MODEL §9.2): activation requires a BEA
 * input-output–cited matrix + a design round + the full-graph loop re-derivation. Wiring this
 * into displacement without that round would double-count §9.1's scalar per-cluster
 * multiplier, which already carries the I-O-cited second-order effect.
 *
 * Formula (DATA_MODEL.md §9.2, registered-inactive):
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
 *
 * DEPRECATED — REGISTERED-INACTIVE; DO NOT WIRE (FS-5 ruled, FS-5b marked — see the
 * ADJACENCY_WEIGHTS banner above; same row). No simulation caller (liveness-proven at FS-5);
 * guarded by tests as inactive structure only.
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
