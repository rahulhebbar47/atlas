/**
 * ATLAS Simulation Hooks
 *
 * Convenience hooks that select slices from the simulation store.
 * Each hook uses a selector for efficient re-renders — components
 * only re-render when their specific slice changes.
 *
 * IMPORTANT: Zustand uses reference equality by default. Selectors
 * must NOT create new objects/arrays on every call, or they cause
 * infinite re-render loops. Solutions used here:
 *   - Select stable references (existing store objects) directly
 *   - Use useShallow for object selectors
 *   - Use useMemo for derived arrays outside the selector
 */

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSimulationStore } from '@/stores/simulationStore';
import type {
  SimulationTimeline,
  SimulationYearOutput,
  CapabilityVectorId,
  CapabilityTrajectoryParams,
  SimulationSummary,
  CyclePhase,
} from '@/types';

/**
 * Full simulation timeline.
 * Stable reference — the timeline object itself is replaced only on recompute.
 */
export function useSimulationTimeline(): SimulationTimeline {
  return useSimulationStore((state) => state.timeline);
}

/**
 * Data for the currently selected year.
 * Returns a stable reference from the years array (same object if year hasn't changed).
 */
export function useCurrentYearData(): SimulationYearOutput | undefined {
  const years = useSimulationStore((state) => state.timeline.years);
  const currentYear = useSimulationStore((state) => state.currentYear);
  return useMemo(
    () => years.find((y) => y.year === currentYear),
    [years, currentYear],
  );
}

/**
 * Macro data flattened into an array for Recharts.
 * Each entry has the fields needed by charts across all screens.
 *
 * Derived via useMemo from the stable years array reference —
 * only recomputes when the timeline itself changes.
 */
export interface MacroTimeSeriesPoint {
  year: number;
  totalEmployment: number;
  unemploymentRate: number;
  gdpNominal: number;
  gdpReal: number;
  consumerWelfareIndex: number;
  cwiWithoutPolicy: number;
  cyclePhase: CyclePhase;
  aiGDPContribution: number;
  aiGDPContributionPct: number;
  incomeWageShare: number;
  incomeAssetShare: number;
  incomeTransferShare: number;
  automationCoverage: number;
  // No-AI counterfactual: GDP minus AI production contribution
  gdpNoAI: number;
  // New Jobs fields (Phase 7)
  newJobCreationRate: number;
  durableNewJobs: number;
  netJobCreation: number;
  totalDisplacedJobs: number;
}

export function useMacroTimeSeries(): MacroTimeSeriesPoint[] {
  const years = useSimulationStore((state) => state.timeline.years);
  const population = useSimulationStore((state) => state.config.totalPopulation);
  return useMemo(
    () =>
      years.map((y) => {
        // CWI without policy: approximate by subtracting policy-driven consumption per capita.
        // Policy income flows through MPC channels, so the consumption impact is:
        //   policyConsumption ≈ totalPolicyIncome × blended_MPC / priceLevel / population
        // As a first approximation we use MPC_TRANSFER (0.90) since most policy is transfers.
        const policyRealConsumptionPerCapita = y.macro.priceLevel > 0 && population > 0
          ? (y.policyEffects.totalPolicyIncome * 0.90) / (y.macro.priceLevel * population)
          : 0;
        return {
          year: y.year,
          totalEmployment: y.macro.totalEmployment,
          unemploymentRate: y.macro.unemploymentRate,
          gdpNominal: y.macro.gdpNominal,
          gdpReal: y.macro.gdpReal,
          consumerWelfareIndex: y.macro.consumerWelfareIndex,
          cwiWithoutPolicy: y.macro.consumerWelfareIndex - policyRealConsumptionPerCapita,
          cyclePhase: y.macro.cyclePhase,
          aiGDPContribution: y.macro.aiGDPContribution,
          aiGDPContributionPct: y.macro.aiGDPContributionPct,
          incomeWageShare: y.macro.incomeComposition.wageShare,
          incomeAssetShare: y.macro.incomeComposition.assetShare,
          incomeTransferShare: y.macro.incomeComposition.transferShare,
          automationCoverage: y.macro.automationCoverage,
          // No-AI counterfactual: traditional economy without AI production
          gdpNoAI: y.macro.gdpNominal - y.macro.aiGDPContribution,
          // New Jobs fields (Phase 7)
          newJobCreationRate: y.macro.newJobCreationRate,
          durableNewJobs: y.macro.durableNewJobs,
          netJobCreation: y.macro.netJobCreation,
          totalDisplacedJobs: y.clusters.reduce(
            (sum, c) => sum + c.totalDirectDisplacement,
            0,
          ),
        };
      }),
    [years, population],
  );
}

/**
 * Current capability trajectory parameters (for the controls panel).
 * Stable reference — points to the existing config.capabilities object.
 */
export function useCapabilityParams(): Record<CapabilityVectorId, CapabilityTrajectoryParams> {
  return useSimulationStore((state) => state.config.capabilities);
}

/**
 * Two-part policy window information (Phase 5 Cleanup).
 *
 * Preparation Window: UE-triggered (displacement detectable, build programs)
 * Fiscal Window: AI GDP-triggered (tax revenue available, deploy at scale)
 *
 * Status logic:
 *   recovery → post-window → fiscal-only → both-open → prep-only → pre-impact
 */
export function usePolicyWindowInfo(): {
  prepWindowOpen: number | null;
  prepWindowClose: number | null;
  fiscalWindowOpen: number | null;
  fiscalWindowClose: number | null;
  cycleStartYear: number | null;
  status: 'pre-impact' | 'prep-only' | 'both-open' | 'fiscal-only' | 'post-window' | 'recovery';
} {
  return useSimulationStore(
    useShallow((state) => {
      const {
        prepWindowOpen, prepWindowClose,
        fiscalWindowOpen, fiscalWindowClose,
        cycleStartYear, recoveryYear,
      } = state.timeline;
      const currentYear = state.currentYear;

      const prepOpen = prepWindowOpen !== null && currentYear >= prepWindowOpen
        && (prepWindowClose === null || currentYear < prepWindowClose);
      const fiscalOpen = fiscalWindowOpen !== null && currentYear >= fiscalWindowOpen
        && (fiscalWindowClose === null || currentYear < fiscalWindowClose);

      let status: 'pre-impact' | 'prep-only' | 'both-open' | 'fiscal-only' | 'post-window' | 'recovery';
      if (recoveryYear !== null && currentYear >= recoveryYear) {
        status = 'recovery';
      } else if (fiscalWindowClose !== null && currentYear >= fiscalWindowClose) {
        status = 'post-window';
      } else if (prepOpen && fiscalOpen) {
        status = 'both-open';
      } else if (fiscalOpen) {
        status = 'fiscal-only';
      } else if (prepOpen) {
        status = 'prep-only';
      } else {
        status = 'pre-impact';
      }

      return {
        prepWindowOpen, prepWindowClose,
        fiscalWindowOpen, fiscalWindowClose,
        cycleStartYear, status,
      };
    }),
  );
}

/**
 * Simulation summary statistics.
 * Stable reference — points to the existing summary object.
 */
export function useSimulationSummary(): SimulationSummary {
  return useSimulationStore((state) => state.timeline.summary);
}

/**
 * Current year number (primitive — no reference equality issue).
 */
export function useCurrentYear(): number {
  return useSimulationStore((state) => state.currentYear);
}

/**
 * Count of overridden BFCS roles (Phase 4).
 * Useful for showing a "Modified" badge on the BFCS editor section.
 */
export function useBFCSOverrideCount(): number {
  const bfcsOverrides = useSimulationStore((state) => state.config.bfcsOverrides);
  return useMemo(() => {
    let count = 0;
    for (const clusterOverrides of Object.values(bfcsOverrides)) {
      count += Object.keys(clusterOverrides).length;
    }
    return count;
  }, [bfcsOverrides]);
}

/**
 * Baseline macro time series for comparison ghost lines.
 *
 * Returns the same format as useMacroTimeSeries() but from the
 * baseline timeline (simulation run without per-year overrides).
 * Returns null when baseline comparison mode is off.
 *
 * Phase 8c: Used by charts to render dashed "autopilot baseline" lines.
 */
export function useBaselineMacroTimeSeries(): MacroTimeSeriesPoint[] | null {
  const baselineTimeline = useSimulationStore((s) => s.baselineTimeline);
  const population = useSimulationStore((s) => s.config.totalPopulation);

  return useMemo(() => {
    if (!baselineTimeline) return null;

    return baselineTimeline.years.map((y) => {
      const policyRealConsumptionPerCapita = y.macro.priceLevel > 0 && population > 0
        ? (y.policyEffects.totalPolicyIncome * 0.90) / (y.macro.priceLevel * population)
        : 0;
      return {
        year: y.year,
        totalEmployment: y.macro.totalEmployment,
        unemploymentRate: y.macro.unemploymentRate,
        gdpNominal: y.macro.gdpNominal,
        gdpReal: y.macro.gdpReal,
        consumerWelfareIndex: y.macro.consumerWelfareIndex,
        cwiWithoutPolicy: y.macro.consumerWelfareIndex - policyRealConsumptionPerCapita,
        cyclePhase: y.macro.cyclePhase,
        aiGDPContribution: y.macro.aiGDPContribution,
        aiGDPContributionPct: y.macro.aiGDPContributionPct,
        incomeWageShare: y.macro.incomeComposition.wageShare,
        incomeAssetShare: y.macro.incomeComposition.assetShare,
        incomeTransferShare: y.macro.incomeComposition.transferShare,
        automationCoverage: y.macro.automationCoverage,
        gdpNoAI: y.macro.gdpNominal - y.macro.aiGDPContribution,
        newJobCreationRate: y.macro.newJobCreationRate,
        durableNewJobs: y.macro.durableNewJobs,
        netJobCreation: y.macro.netJobCreation,
        totalDisplacedJobs: y.clusters.reduce(
          (sum, c) => sum + c.totalDirectDisplacement,
          0,
        ),
      };
    });
  }, [baselineTimeline, population]);
}
