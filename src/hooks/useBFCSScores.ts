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
import { computeBFCSScores, checkThresholdsMet, findTriggerYear, computeBetterScore } from '@/models/bfcs';
import { getAllCapabilityScores } from '@/models/capabilities';
// RETIRED (mini-stage 1; Amendment 2): the year-resolved tokens-per-task injection left
// with the global schedule — the preview prices from the frontier-intensity layer directly.
// import { useCurrentYearParameters } from '@/hooks/useParameterTimeline';
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
  // Flywheel MS: the preview prices on the RECORD's cost clock (the one producer —
  // MacroOutput.effectiveCostTime), so the displayed Cheaper matches the engine on
  // starved paths too. On funded paths τ = calendar and this is an identity.
  const timeline = useSimulationStore((s) => s.timeline);
  // Mini-stage 1: the config-level cost params ARE the effective params (the retired
  // per-year tokens-per-task injection is gone; the frontier dials live in aiCostParams).
  const effectiveAiCostParams = aiCostParams;

  return useMemo(() => {
    const cluster = OCCUPATION_CLUSTERS.find((c) => c.id === clusterId);
    if (!cluster) return [];

    const capScores = getAllCapabilityScores(currentYear, capabilities);
    const getScoresForYear = (y: number) => getAllCapabilityScores(y, capabilities);

    return cluster.roles.map((role) => {
      const effectiveThresholds =
        bfcsOverrides[clusterId]?.[role.id] ?? role.bfcsThresholds;

      // Mini-stage 1: the preview replays the loop's Better-arrival latch chronologically
      // up to the current year, so the displayed Cheaper prices the same frontier/fixed-
      // capability blend the simulation path does.
      let arrivalYear: number | null = null;
      for (let y = startYear; y <= currentYear; y++) {
        if (computeBetterScore(getScoresForYear(y), cluster, role) >= effectiveThresholds.better) {
          arrivalYear = y;
          break;
        }
      }
      const betterNow = computeBetterScore(capScores, cluster, role);

      // The record's τ for the current year and the role's arrival year (calendar
      // fallback = the funded-path identity, also covering years outside the record).
      const tauOf = (y: number): number =>
        timeline.years.find((r) => r.year === y)?.macro.effectiveCostTime ?? Math.max(0, y - startYear);
      const previewCostClock = {
        tEff: tauOf(currentYear),
        tauAtArrival: arrivalYear !== null ? tauOf(arrivalYear) : null,
      };
      const scores = computeBFCSScores(
        capScores, cluster, role, currentYear, effectiveAiCostParams, undefined, 0, undefined, 1.0,
        arrivalYear, betterNow - effectiveThresholds.better,
        previewCostClock,
      );
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
  }, [clusterId, currentYear, capabilities, bfcsOverrides, startYear, endYear, effectiveAiCostParams, timeline]);
}
