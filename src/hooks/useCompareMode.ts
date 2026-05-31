/**
 * ATLAS Compare Mode Hooks (Phase 5)
 *
 * Runs runSimulation() independently for each comparison config slot.
 * Uses useMemo with tight dependency arrays — only the comparison policy
 * configs, not the entire store — to avoid re-running on unrelated changes.
 *
 * At ~5-10ms per simulation, 2-3 slots is ~15-30ms total per slider move.
 */

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSimulationStore } from '@/stores/simulationStore';
import { getBLSBaselines } from '@/stores/simulationStore';
import { runSimulation } from '@/models/simulation';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import type { SimulationTimeline, PolicyConfig } from '@/types';

// ============================================================
// useComparisonTimelines
// ============================================================

export interface ComparisonSlot {
  label: string;
  config: PolicyConfig;
  timeline: SimulationTimeline;
}

/**
 * Returns the current simulation timeline plus one timeline per
 * comparison slot, each run with a different policy config.
 */
export function useComparisonTimelines(): ComparisonSlot[] {
  const currentTimeline = useSimulationStore((s) => s.timeline);
  const currentConfig = useSimulationStore((s) => s.config);
  const comparisonConfigs = useSimulationStore(
    useShallow((s) => s.comparisonPolicyConfigs),
  );

  const comparisonTimelines = useMemo(() => {
    const baselines = getBLSBaselines();
    return comparisonConfigs.map((slot) => {
      const config = {
        ...currentConfig,
        policyConfig: slot.config,
      };
      return {
        label: slot.label,
        config: slot.config,
        timeline: runSimulation(config, OCCUPATION_CLUSTERS, baselines),
      };
    });
  }, [currentConfig, comparisonConfigs]);

  return useMemo(
    () => [
      {
        label: 'Current Config',
        config: currentConfig.policyConfig,
        timeline: currentTimeline,
      },
      ...comparisonTimelines,
    ],
    [currentTimeline, currentConfig.policyConfig, comparisonTimelines],
  );
}

// ============================================================
// useComparisonMetrics
// ============================================================

export interface ComparisonMetrics {
  label: string;
  cycleStartYear: number | null;
  depressionOnsetYear: number | null;
  maxUnemploymentRate: number;
  maxUnemploymentYear: number;
  minCWI: number;
  minCWIYear: number;
  peakFiscalCostGDP: number;
  policyPreventsDepression: boolean;
}

/**
 * Extracts key summary metrics from each comparison timeline
 * for the diff table.
 */
export function useComparisonMetrics(): ComparisonMetrics[] {
  const slots = useComparisonTimelines();

  return useMemo(
    () =>
      slots.map((slot) => {
        const { summary } = slot.timeline;

        // Find peak fiscal cost as % GDP
        let peakFiscalCostGDP = 0;
        for (const year of slot.timeline.years) {
          if (year.policyEffects.fiscalCostAsPercentGDP > peakFiscalCostGDP) {
            peakFiscalCostGDP = year.policyEffects.fiscalCostAsPercentGDP;
          }
        }

        // Find minimum CWI (consumer welfare index)
        let minCWI = Infinity;
        let minCWIYear = slot.timeline.years[0]?.year ?? 0;
        for (const year of slot.timeline.years) {
          if (year.macro.consumerWelfareIndex < minCWI) {
            minCWI = year.macro.consumerWelfareIndex;
            minCWIYear = year.year;
          }
        }

        return {
          label: slot.label,
          cycleStartYear: summary.cycleStartYear,
          depressionOnsetYear: summary.depressionOnsetYear,
          maxUnemploymentRate: summary.maxUnemploymentRate.value,
          maxUnemploymentYear: summary.maxUnemploymentRate.year,
          minCWI,
          minCWIYear,
          peakFiscalCostGDP,
          policyPreventsDepression: summary.policyPreventsDepression,
        };
      }),
    [slots],
  );
}
