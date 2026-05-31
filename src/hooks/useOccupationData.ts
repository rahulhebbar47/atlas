/**
 * ATLAS Occupation Data Hooks (Phase 4)
 *
 * Extracts per-cluster summary and detail data from the simulation timeline.
 * Used by OccupationBrowser, OccupationDetailView, and BFCSHeatmap.
 *
 * Re-render safety: all hooks use useMemo keyed on stable store references.
 */

import { useMemo } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { getCategoryColor } from '@/utils/colors';
import type {
  DeploymentType,
  ClusterDisplacementResult,
  RoleBFCSOutput,
} from '@/types';

// ============================================================
// Browser Row Type
// ============================================================

export interface ClusterBrowserRow {
  clusterId: string;
  clusterName: string;
  category: string;
  categoryColor: string;
  totalEmployment: number;
  baselineEmployment: number;
  displacementPercent: number;
  earliestTriggerYear: number | null;
  averageWage: number;
  wageChangePercent: number;
  deploymentType: DeploymentType;
  employmentMultiplier: number;
  /** Displacement % per year — for sparkline rendering */
  displacementTrajectory: number[];
  /** Max BFCS proximity across roles (score/threshold), [0, 1+] */
  bfcsMaxProximity: number;
}

// ============================================================
// Browser Data Hook
// ============================================================

/**
 * Extract per-cluster summary rows from the simulation timeline for the browser table.
 * Returns one row per cluster with current-year metrics and full displacement trajectory.
 */
export function useClusterBrowserData(): ClusterBrowserRow[] {
  const years = useSimulationStore((s) => s.timeline.years);
  const currentYear = useSimulationStore((s) => s.currentYear);

  return useMemo(() => {
    if (years.length === 0) return [];

    const firstYearData = years[0]!;
    const currentYearData = (years.find((y) => y.year === currentYear) ?? years[years.length - 1])!;

    return OCCUPATION_CLUSTERS.map((cluster) => {
      // Baseline (first year)
      const baselineCluster = firstYearData.clusters.find(
        (c) => c.clusterId === cluster.id,
      );
      const baselineEmployment = baselineCluster?.totalRemainingEmployment ?? 0;
      const baselineWage = baselineCluster?.averageWage ?? 0;

      // Current year
      const currentCluster = currentYearData.clusters.find(
        (c) => c.clusterId === cluster.id,
      );
      const totalEmployment = currentCluster?.totalRemainingEmployment ?? 0;
      const averageWage = currentCluster?.averageWage ?? 0;

      // Displacement %
      const displacementPercent = baselineEmployment > 0
        ? (baselineEmployment - totalEmployment) / baselineEmployment
        : 0;

      // Wage change %
      const wageChangePercent = baselineWage > 0
        ? (averageWage - baselineWage) / baselineWage
        : 0;

      // Earliest trigger year across all roles
      const earliestTriggerYear = getEarliestTriggerYear(currentCluster);

      // BFCS max proximity (how close the most-vulnerable role is to full trigger)
      const bfcsMaxProximity = getMaxBFCSProximity(currentCluster);

      // Displacement trajectory (one value per year)
      const displacementTrajectory = years.map((y) => {
        const yCluster = y.clusters.find((c) => c.clusterId === cluster.id);
        if (!yCluster || baselineEmployment === 0) return 0;
        return (baselineEmployment - yCluster.totalRemainingEmployment) / baselineEmployment;
      });

      return {
        clusterId: cluster.id,
        clusterName: cluster.name,
        category: cluster.category,
        categoryColor: getCategoryColor(cluster.category),
        totalEmployment,
        baselineEmployment,
        displacementPercent,
        earliestTriggerYear,
        averageWage,
        wageChangePercent,
        deploymentType: cluster.deploymentType,
        employmentMultiplier: cluster.employmentMultiplier,
        displacementTrajectory,
        bfcsMaxProximity,
      };
    });
  }, [years, currentYear]);
}

// ============================================================
// Detail Data Types & Hook
// ============================================================

export interface ClusterDetailData {
  clusterId: string;
  clusterName: string;
  category: string;
  deploymentType: DeploymentType;
  employmentMultiplier: number;
  /** Per-year cluster displacement results */
  yearlyData: Array<{
    year: number;
    cluster: ClusterDisplacementResult;
  }>;
  /** Current year cluster snapshot */
  currentYearCluster: ClusterDisplacementResult | undefined;
  /** Baseline (first year) employment */
  baselineEmployment: number;
}

/**
 * Extract per-year data for a single cluster from the simulation timeline.
 * Used by OccupationDetailView.
 */
export function useClusterDetailData(clusterId: string): ClusterDetailData | null {
  const years = useSimulationStore((s) => s.timeline.years);
  const currentYear = useSimulationStore((s) => s.currentYear);

  return useMemo(() => {
    const cluster = OCCUPATION_CLUSTERS.find((c) => c.id === clusterId);
    if (!cluster || years.length === 0) return null;

    const yearlyData = years.map((y) => ({
      year: y.year,
      cluster: y.clusters.find((c) => c.clusterId === clusterId)!,
    })).filter((d) => d.cluster !== undefined);

    const currentYearCluster = years
      .find((y) => y.year === currentYear)
      ?.clusters.find((c) => c.clusterId === clusterId);

    const baselineEmployment = yearlyData[0]?.cluster.totalRemainingEmployment ?? 0;

    return {
      clusterId: cluster.id,
      clusterName: cluster.name,
      category: cluster.category,
      deploymentType: cluster.deploymentType,
      employmentMultiplier: cluster.employmentMultiplier,
      yearlyData,
      currentYearCluster,
      baselineEmployment,
    };
  }, [clusterId, years, currentYear]);
}

// ============================================================
// Helpers
// ============================================================

function getEarliestTriggerYear(
  cluster: ClusterDisplacementResult | undefined,
): number | null {
  if (!cluster?.bfcsOutput?.length) return null;
  let earliest: number | null = null;
  for (const role of cluster.bfcsOutput) {
    if (role.triggerYear !== null) {
      if (earliest === null || role.triggerYear < earliest) {
        earliest = role.triggerYear;
      }
    }
  }
  return earliest;
}

function getMaxBFCSProximity(
  cluster: ClusterDisplacementResult | undefined,
): number {
  if (!cluster?.bfcsOutput?.length) return 0;
  let maxProximity = 0;
  for (const role of cluster.bfcsOutput) {
    const dims = ['better', 'faster', 'cheaper', 'safer'] as const;
    // Min proximity across dimensions (bottleneck dimension)
    let minDimProximity = Infinity;
    for (const dim of dims) {
      const threshold = role.thresholds[dim];
      if (threshold > 0) {
        const proximity = role.scores[dim] / threshold;
        if (proximity < minDimProximity) {
          minDimProximity = proximity;
        }
      }
    }
    if (minDimProximity !== Infinity && minDimProximity > maxProximity) {
      maxProximity = minDimProximity;
    }
  }
  return maxProximity;
}
