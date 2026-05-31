/**
 * ATLAS State Data Hooks (Phase 6)
 *
 * Hooks that extract state-level data from the simulation store.
 * Follows the same patterns as usePolicyData.ts:
 *   - useShallow for object selectors (avoids infinite re-render)
 *   - useMemo for derived arrays (recalculates only when source changes)
 *
 * These hooks power the StateMap, StateDetailView, StateComparisonView,
 * and state ranking cards in the InsightsPanel.
 */

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSimulationStore } from '@/stores/simulationStore';
import { STATE_NAMES } from '@/data/stateData';
import type { StateCode, StateOutput, StatePolicyOverride } from '@/types';

// ============================================================
// Types
// ============================================================

export interface StateMapDataPoint {
  code: StateCode;
  name: string;
  displacement: number;
  unemploymentRate: number;
  policyEffectiveness: number;
  consumerWelfareIndex: number;
}

export interface StateTimeSeriesPoint {
  year: number;
  displacement: number;
  unemploymentRate: number;
  consumerWelfareIndex: number;
  policyEffectiveness: number;
}

export interface StateComparisonData {
  states: Array<{
    code: StateCode;
    name: string;
    timeSeries: StateTimeSeriesPoint[];
    currentMetrics: StateMapDataPoint;
  }>;
}

// ============================================================
// useStateDataLoaded
// ============================================================

/**
 * Whether state data is loaded and available.
 */
export function useStateDataLoaded(): boolean {
  return useSimulationStore((s) => s.stateDataLoaded);
}

// ============================================================
// useStateMapData — choropleth data at currentYear
// ============================================================

/**
 * State-level data at the current year for the choropleth map.
 * One entry per state with displacement, unemployment, and policy effectiveness.
 */
export function useStateMapData(): StateMapDataPoint[] {
  const years = useSimulationStore((s) => s.timeline.years);
  const currentYear = useSimulationStore((s) => s.currentYear);

  return useMemo(() => {
    const yearData = years.find((y) => y.year === currentYear);
    if (!yearData?.states) return [];

    return yearData.states.map((s) => ({
      code: s.code,
      name: STATE_NAMES[s.code] ?? s.code,
      displacement: s.displacement,
      unemploymentRate: s.unemploymentRate,
      consumerWelfareIndex: s.consumerWelfareIndex,
      policyEffectiveness: s.policyEffectiveness,
    }));
  }, [years, currentYear]);
}

// ============================================================
// useStateTimeSeries — per-state timeline
// ============================================================

/**
 * Time series data for a specific state across all simulation years.
 */
export function useStateTimeSeries(stateCode: StateCode | null): StateTimeSeriesPoint[] {
  const years = useSimulationStore((s) => s.timeline.years);

  return useMemo(() => {
    if (!stateCode) return [];

    return years
      .map((y) => {
        const stateOutput = y.states?.find((s) => s.code === stateCode);
        if (!stateOutput) return null;
        return {
          year: y.year,
          displacement: stateOutput.displacement,
          unemploymentRate: stateOutput.unemploymentRate,
          consumerWelfareIndex: stateOutput.consumerWelfareIndex,
          policyEffectiveness: stateOutput.policyEffectiveness,
        };
      })
      .filter((p): p is StateTimeSeriesPoint => p !== null);
  }, [years, stateCode]);
}

// ============================================================
// useStateComparison — 2-3 state comparison
// ============================================================

/**
 * Comparison data for up to 3 selected states.
 * Returns time series + current metrics for each.
 */
export function useStateComparison(): StateComparisonData {
  const years = useSimulationStore((s) => s.timeline.years);
  const currentYear = useSimulationStore((s) => s.currentYear);
  const comparisonCodes = useSimulationStore(
    useShallow((s) => s.comparisonStateCodes),
  );

  return useMemo(() => {
    if (comparisonCodes.length === 0) return { states: [] };

    const currentYearData = years.find((y) => y.year === currentYear);

    const states = comparisonCodes.map((code) => {
      const timeSeries: StateTimeSeriesPoint[] = years
        .map((y) => {
          const stateOutput = y.states?.find((s) => s.code === code);
          if (!stateOutput) return null;
          return {
            year: y.year,
            displacement: stateOutput.displacement,
            unemploymentRate: stateOutput.unemploymentRate,
            consumerWelfareIndex: stateOutput.consumerWelfareIndex,
            policyEffectiveness: stateOutput.policyEffectiveness,
          };
        })
        .filter((p): p is StateTimeSeriesPoint => p !== null);

      const currentState = currentYearData?.states?.find((s) => s.code === code);
      const currentMetrics: StateMapDataPoint = {
        code,
        name: STATE_NAMES[code] ?? code,
        displacement: currentState?.displacement ?? 0,
        unemploymentRate: currentState?.unemploymentRate ?? 0,
        consumerWelfareIndex: currentState?.consumerWelfareIndex ?? 0,
        policyEffectiveness: currentState?.policyEffectiveness ?? 0,
      };

      return {
        code,
        name: STATE_NAMES[code] ?? code,
        timeSeries,
        currentMetrics,
      };
    });

    return { states };
  }, [years, currentYear, comparisonCodes]);
}

// ============================================================
// useStatePolicyOverride — per-state policy override
// ============================================================

/**
 * Get the current policy override for a specific state.
 */
export function useStatePolicyOverride(
  stateCode: StateCode | null,
): Partial<StatePolicyOverride> {
  const stateOverrides = useSimulationStore(
    useShallow((s) => s.config.stateOverrides),
  );

  return useMemo(() => {
    if (!stateCode) return {};
    return stateOverrides[stateCode] ?? {};
  }, [stateOverrides, stateCode]);
}

// ============================================================
// useStateRanking — sorted states by metric
// ============================================================

/**
 * Get top N states ranked by a metric.
 * direction: 'desc' = highest first (most impacted), 'asc' = lowest first
 */
export function useStateRanking(
  metric: keyof Pick<StateMapDataPoint, 'displacement' | 'unemploymentRate' | 'policyEffectiveness'>,
  direction: 'asc' | 'desc',
  limit: number = 5,
): StateMapDataPoint[] {
  const mapData = useStateMapData();

  return useMemo(() => {
    if (mapData.length === 0) return [];

    const sorted = [...mapData].sort((a, b) => {
      return direction === 'desc'
        ? b[metric] - a[metric]
        : a[metric] - b[metric];
    });

    return sorted.slice(0, limit);
  }, [mapData, metric, direction, limit]);
}
