/**
 * ATLAS Phase 8d: Parameter Trajectory Hooks
 *
 * Extracts per-parameter time series data from the simulation's
 * parameterTimeline Map. Used by trajectory charts, mini-chart
 * dashboard, autopilot log, and comparison panels.
 *
 * All hooks derive data from the store's timeline.parameterTimeline.
 */

import { useMemo } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import type { YearParameters, ParameterValue } from '@/types';
import {
  PARAM_LABELS,
  PARAM_CATEGORIES,
  type ParamCategoryConfig,
} from '@/utils/parameterFormatter';

// ============================================================
// Types
// ============================================================

export interface ParameterTrajectoryPoint {
  year: number;
  baseline: number;
  autopilot: number;
  override?: number;
  effective: number;
  source: 'baseline' | 'autopilot' | 'override';
  explanation?: string;
}

export interface ParameterTrajectory {
  paramKey: string;
  label: string;
  points: ParameterTrajectoryPoint[];
  /** Maximum absolute deviation of effective from baseline across all years. */
  maxDeviation: number;
  /** Whether autopilot ever differs from baseline. */
  hasAutopilotAdjustment: boolean;
  /** Whether any year has a user override. */
  hasUserOverride: boolean;
  /** Category key (e.g. 'fiscal', 'tax'). */
  category: string;
  /** Category accent color. */
  categoryColor: string;
}

// ============================================================
// Internal helpers
// ============================================================

/** All param keys extracted from PARAM_CATEGORIES (ordered). */
const ALL_PARAM_KEYS: string[] = PARAM_CATEGORIES.flatMap((cat) => cat.params);

/** Lookup: paramKey → category config. */
const PARAM_TO_CATEGORY: Map<string, ParamCategoryConfig> = new Map();
for (const cat of PARAM_CATEGORIES) {
  for (const key of cat.params) {
    PARAM_TO_CATEGORY.set(key, cat);
  }
}

/**
 * Get a ParameterValue from YearParameters by key name.
 * YearParameters has typed fields, not a Record — we index dynamically.
 */
function getParamValue(yearParams: YearParameters, key: string): ParameterValue | undefined {
  return (yearParams as unknown as Record<string, ParameterValue>)[key];
}

/**
 * Build a ParameterTrajectory from the parameterTimeline Map for a single param.
 */
function buildTrajectory(
  paramKey: string,
  parameterTimeline: Map<number, YearParameters>,
): ParameterTrajectory | null {
  const label = PARAM_LABELS[paramKey];
  if (!label) return null;

  const cat = PARAM_TO_CATEGORY.get(paramKey);
  if (!cat) return null;

  const points: ParameterTrajectoryPoint[] = [];
  let maxDeviation = 0;
  let hasAutopilotAdjustment = false;
  let hasUserOverride = false;

  // Iterate years in order (Map insertion order preserved)
  const sortedYears = Array.from(parameterTimeline.keys()).sort((a, b) => a - b);
  for (const year of sortedYears) {
    const yearParams = parameterTimeline.get(year)!;
    const pv = getParamValue(yearParams, paramKey);
    if (!pv) continue;

    const point: ParameterTrajectoryPoint = {
      year,
      baseline: pv.baseline,
      autopilot: pv.autopilot,
      effective: pv.effective,
      source: pv.source,
    };
    if (pv.userOverride !== undefined) {
      point.override = pv.userOverride;
      hasUserOverride = true;
    }
    if (pv.explanation) {
      point.explanation = pv.explanation;
    }
    if (Math.abs(pv.autopilot - pv.baseline) > 1e-9) {
      hasAutopilotAdjustment = true;
    }

    const deviation = Math.abs(pv.effective - pv.baseline);
    if (deviation > maxDeviation) {
      maxDeviation = deviation;
    }

    points.push(point);
  }

  return {
    paramKey,
    label,
    points,
    maxDeviation,
    hasAutopilotAdjustment,
    hasUserOverride,
    category: cat.key,
    categoryColor: cat.color,
  };
}

// ============================================================
// Hooks
// ============================================================

/**
 * Get the trajectory for a single parameter.
 */
export function useParameterTrajectory(paramKey: string): ParameterTrajectory | null {
  const parameterTimeline = useSimulationStore((s) => s.timeline.parameterTimeline);

  return useMemo(() => {
    if (!parameterTimeline || parameterTimeline.size === 0) return null;
    return buildTrajectory(paramKey, parameterTimeline);
  }, [parameterTimeline, paramKey]);
}

/**
 * Get trajectories for all 20 tracked parameters.
 */
export function useAllParameterTrajectories(): ParameterTrajectory[] {
  const parameterTimeline = useSimulationStore((s) => s.timeline.parameterTimeline);

  return useMemo(() => {
    if (!parameterTimeline || parameterTimeline.size === 0) return [];
    const result: ParameterTrajectory[] = [];
    for (const key of ALL_PARAM_KEYS) {
      const t = buildTrajectory(key, parameterTimeline);
      if (t) result.push(t);
    }
    return result;
  }, [parameterTimeline]);
}

/**
 * Get trajectories grouped by PARAM_CATEGORIES.
 * Returns a Map from category key → array of trajectories.
 */
export function useGroupedParameterTrajectories(): Map<string, ParameterTrajectory[]> {
  const all = useAllParameterTrajectories();

  return useMemo(() => {
    const grouped = new Map<string, ParameterTrajectory[]>();
    for (const cat of PARAM_CATEGORIES) {
      grouped.set(cat.key, []);
    }
    for (const t of all) {
      const arr = grouped.get(t.category);
      if (arr) arr.push(t);
    }
    return grouped;
  }, [all]);
}

/**
 * Get the top N parameters sorted by maxDeviation (most changed first).
 * Parameters with zero deviation are excluded.
 */
export function useMostChangedParameters(limit: number = 6): ParameterTrajectory[] {
  const all = useAllParameterTrajectories();

  return useMemo(() => {
    return all
      .filter((t) => t.maxDeviation > 1e-9)
      .sort((a, b) => b.maxDeviation - a.maxDeviation)
      .slice(0, limit);
  }, [all, limit]);
}

/**
 * Get the set of parameters that have NO changes (baseline throughout).
 * Useful for the "Unchanged" collapsible section.
 */
export function useUnchangedParameters(): ParameterTrajectory[] {
  const all = useAllParameterTrajectories();

  return useMemo(() => {
    return all.filter((t) => t.maxDeviation <= 1e-9);
  }, [all]);
}
