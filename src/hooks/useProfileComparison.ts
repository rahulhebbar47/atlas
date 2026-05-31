/**
 * ATLAS Phase 8d: Profile Comparison Hook
 *
 * Runs runSimulation() with a different fiscal response profile
 * for side-by-side comparison. Follows the useComparisonTimelines()
 * pattern from useCompareMode.ts.
 *
 * Performance: ~5-10ms per simulation. Only recomputes when the
 * current config or comparison profile name changes.
 */

import { useMemo } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { getBLSBaselines } from '@/stores/simulationStore';
import { runSimulation } from '@/models/simulation';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import type { SimulationTimeline } from '@/types';

// ============================================================
// Types
// ============================================================

export interface ProfileComparisonResult {
  profileA: {
    name: string;
    timeline: SimulationTimeline;
  };
  profileB: {
    name: string;
    timeline: SimulationTimeline;
  };
}

// ============================================================
// Hook
// ============================================================

/**
 * Compare the current simulation against a different fiscal response profile.
 *
 * When profileBName is non-null, runs a second simulation with
 * that profile (no parameter overrides) and returns both timelines.
 *
 * Returns null when no comparison is active.
 */
export function useProfileComparison(
  profileBName: string | null,
): ProfileComparisonResult | null {
  const currentTimeline = useSimulationStore((s) => s.timeline);
  const currentConfig = useSimulationStore((s) => s.config);

  return useMemo(() => {
    if (!profileBName) return null;

    const baselines = getBLSBaselines();

    // Profile B: same config but with different fiscal policy preset, no parameter overrides
    const profileBConfig = {
      ...currentConfig,
      fiscalPolicyPreset: profileBName,
      fiscalPolicyCustom: undefined,
      parameterOverrides: {},
    };

    const profileBTimeline = runSimulation(
      profileBConfig,
      OCCUPATION_CLUSTERS,
      baselines,
    );

    const currentProfileName = currentConfig.fiscalPolicyPreset ?? 'balanced_reduction';

    return {
      profileA: {
        name: currentProfileName,
        timeline: currentTimeline,
      },
      profileB: {
        name: profileBName,
        timeline: profileBTimeline,
      },
    };
  }, [currentConfig, currentTimeline, profileBName]);
}
