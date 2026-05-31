/**
 * ATLAS BFCS Score Hooks (Phase 4)
 *
 * Computes BFCS score snapshots for the BFCS Threshold Editor.
 * Each snapshot includes current AI scores, effective thresholds,
 * trigger status, and override detection.
 *
 * Re-render safety: uses useMemo keyed on stable store slices.
 */

import { useMemo } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { computeBFCSScores, checkThresholdsMet, findTriggerYear } from '@/models/bfcs';
import { getAllCapabilityScores } from '@/models/capabilities';
import { useCurrentYearParameters } from '@/hooks/useParameterTimeline';
import type { BFCSRoleScoreSnapshot } from '@/types';

/**
 * Compute BFCS score snapshots for all roles in a given cluster at the current year.
 * Returns an array of BFCSRoleScoreSnapshot with scores, thresholds, trigger data,
 * and override status.
 *
 * Performance: findTriggerYear scans up to 25 years per role (2-4 roles per cluster).
 * Each iteration is trivially cheap (weighted sums + exponentials). Total < 1ms.
 */
export function useBFCSScoresForCluster(clusterId: string): BFCSRoleScoreSnapshot[] {
  const currentYear = useSimulationStore((s) => s.currentYear);
  const capabilities = useSimulationStore((s) => s.config.capabilities);
  const bfcsOverrides = useSimulationStore((s) => s.config.bfcsOverrides);
  const startYear = useSimulationStore((s) => s.config.startYear);
  const endYear = useSimulationStore((s) => s.config.endYear);
  const aiCostParams = useSimulationStore((s) => s.config.aiCostParams);
  const yearParams = useCurrentYearParameters();

  // Inject the year-resolved tokenUsageMultiplier so the BFCS preview reflects user overrides.
  const effectiveAiCostParams = useMemo(() => {
    const resolvedMultiplier = yearParams?.tokenUsageMultiplier.effective
      ?? aiCostParams?.tokenUsageMultiplier
      ?? 1.0;
    return aiCostParams
      ? { ...aiCostParams, tokenUsageMultiplier: resolvedMultiplier }
      : undefined;
  }, [aiCostParams, yearParams]);

  return useMemo(() => {
    const cluster = OCCUPATION_CLUSTERS.find((c) => c.id === clusterId);
    if (!cluster) return [];

    const capScores = getAllCapabilityScores(currentYear, capabilities);
    const getScoresForYear = (y: number) => getAllCapabilityScores(y, capabilities);

    return cluster.roles.map((role) => {
      const effectiveThresholds =
        bfcsOverrides[clusterId]?.[role.id] ?? role.bfcsThresholds;

      const scores = computeBFCSScores(capScores, cluster, role, currentYear, effectiveAiCostParams);
      const triggered = checkThresholdsMet(scores, effectiveThresholds);

      const triggerYear = findTriggerYear(
        cluster, role, startYear, endYear, getScoresForYear, effectiveThresholds, effectiveAiCostParams,
      );

      const isOverridden = bfcsOverrides[clusterId]?.[role.id] !== undefined;

      return {
        clusterId,
        roleId: role.id,
        roleLabel: role.label,
        scores,
        thresholds: effectiveThresholds,
        defaultThresholds: role.bfcsThresholds,
        triggered,
        triggerYear,
        isOverridden,
      };
    });
  }, [clusterId, currentYear, capabilities, bfcsOverrides, startYear, endYear, effectiveAiCostParams]);
}
