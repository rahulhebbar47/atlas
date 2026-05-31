/**
 * ATLAS Phase 8c: Parameter Timeline Hooks
 *
 * Zustand selector hooks for the per-year parameter editing UI.
 * All hooks use efficient selectors to minimize re-renders.
 */

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSimulationStore } from '@/stores/simulationStore';
import type { YearParameters, FiscalDimensionPositions, FedDimensionPositions } from '@/types';
import { presetToDimensionPositions, fedPresetToDimensionPositions } from '@/models/fiscalDimensions';
import {
  resolveCombinedProfile,
  DEFAULT_FISCAL_POLICY_PRESET,
  DEFAULT_FEDERAL_RESERVE_PRESET,
} from '@/models/fiscalResponseProfiles';

// ============================================================
// Year Parameters Hook
// ============================================================

/**
 * Get YearParameters for the current year.
 *
 * Reads from the simulation timeline's parameterTimeline map.
 * Returns undefined if parameterTimeline is not populated.
 */
export function useCurrentYearParameters(): YearParameters | undefined {
  const currentYear = useSimulationStore((s) => s.currentYear);
  const parameterTimeline = useSimulationStore((s) => s.timeline.parameterTimeline);

  return useMemo(
    () => parameterTimeline?.get(currentYear),
    [parameterTimeline, currentYear],
  );
}

/**
 * Get YearParameters for a specific year.
 */
export function useYearParameters(year: number): YearParameters | undefined {
  const parameterTimeline = useSimulationStore((s) => s.timeline.parameterTimeline);
  return useMemo(
    () => parameterTimeline?.get(year),
    [parameterTimeline, year],
  );
}

// ============================================================
// Override Count Hook
// ============================================================

export interface OverrideCountInfo {
  /** Total number of per-year overrides. */
  total: number;
  /** Set of years that have at least one override. */
  years: Set<number>;
  /** Count of overrides for a specific year. */
  forYear: (year: number) => number;
}

/**
 * Get override count information for the badge display.
 */
export function useOverrideCount(): OverrideCountInfo {
  const parameterOverrides = useSimulationStore(
    useShallow((s) => s.parameterOverrides),
  );

  return useMemo(() => {
    const entries = Object.keys(parameterOverrides);
    const yearSet = new Set<number>();
    const yearCounts = new Map<number, number>();

    for (const key of entries) {
      const colonIdx = key.lastIndexOf(':');
      if (colonIdx >= 0) {
        const yearStr = key.slice(colonIdx + 1);
        const year = parseInt(yearStr, 10);
        if (!isNaN(year)) {
          yearSet.add(year);
          yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
        }
      }
    }

    return {
      total: entries.length,
      years: yearSet,
      forYear: (y: number) => yearCounts.get(y) ?? 0,
    };
  }, [parameterOverrides]);
}

// ============================================================
// Fiscal Dimension Positions Hook
// ============================================================

export interface FiscalDimensionInfo {
  /** Current slider positions for each dimension. */
  positions: FiscalDimensionPositions;
  /** Name of the active preset (or 'custom'). */
  activePreset: string;
}

/**
 * Get the current fiscal dimension slider positions and active preset.
 *
 * Derives positions from the resolved fiscal profile. When a named
 * preset is active, positions are exact. When custom, positions are
 * the closest match.
 */
export function useFiscalDimensions(): FiscalDimensionInfo {
  const fiscalPolicyPreset = useSimulationStore(
    (s) => s.config.fiscalPolicyPreset,
  );
  const fiscalPolicyCustom = useSimulationStore(
    useShallow((s) => s.config.fiscalPolicyCustom),
  );

  return useMemo(() => {
    const activePreset = fiscalPolicyPreset ?? DEFAULT_FISCAL_POLICY_PRESET;
    const resolved = resolveCombinedProfile(
      activePreset,
      DEFAULT_FEDERAL_RESERVE_PRESET,
      fiscalPolicyCustom,
    );
    const positions = presetToDimensionPositions(resolved);
    return { positions, activePreset };
  }, [fiscalPolicyPreset, fiscalPolicyCustom]);
}

// ============================================================
// Federal Reserve Dimension Positions Hook
// ============================================================

export interface FedDimensionInfo {
  /** Current slider positions for each Fed dimension. */
  positions: FedDimensionPositions;
  /** Name of the active Fed preset (or 'custom'). */
  activePreset: string;
}

/**
 * Get the current Fed dimension slider positions and active preset.
 */
export function useFedDimensions(): FedDimensionInfo {
  const federalReservePreset = useSimulationStore(
    (s) => s.config.federalReservePreset,
  );
  const federalReserveCustom = useSimulationStore(
    useShallow((s) => s.config.federalReserveCustom),
  );

  return useMemo(() => {
    const activePreset = federalReservePreset ?? DEFAULT_FEDERAL_RESERVE_PRESET;
    const resolved = resolveCombinedProfile(
      DEFAULT_FISCAL_POLICY_PRESET,
      activePreset,
      undefined,
      federalReserveCustom,
    );
    const positions = fedPresetToDimensionPositions(resolved);
    return { positions, activePreset };
  }, [federalReservePreset, federalReserveCustom]);
}

// ============================================================
// Autopilot Year Detection Hook
// ============================================================

/**
 * Get the set of years where autopilot made significant adjustments.
 *
 * "Significant" = consolidation intensity > 0.05 or COLA dampening active.
 * Used for blue dot indicators on the timeline.
 */
export function useAutopilotYears(): Set<number> {
  const parameterTimeline = useSimulationStore((s) => s.timeline.parameterTimeline);

  return useMemo(() => {
    const years = new Set<number>();
    if (!parameterTimeline) return years;

    parameterTimeline.forEach((yearParams, year) => {
      const intensity = yearParams.consolidationIntensity.effective;
      const colaDampening = yearParams.effectiveColaDampeningFactor.effective;
      if (intensity > 0.05 || colaDampening < 0.99) {
        years.add(year);
      }
    });

    return years;
  }, [parameterTimeline]);
}
