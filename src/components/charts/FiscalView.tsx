/**
 * ATLAS Phase 8d: Fiscal Dashboard View
 *
 * Main container for the fiscal response visualization tab.
 *
 * Layout:
 *   1. Header with active profile name + Compare button
 *   2. Profile Comparison Panel (when active)
 *   3. Parameter Dashboard Grid — mini sparkline cards ranked by change magnitude
 *   4. Selected Parameter Detail — full-size ParameterTrajectoryChart
 *   5. Autopilot Activity Log — chronological list of adjustments
 */

import { useState, useMemo } from 'react';
import {
  useMostChangedParameters,
  useUnchangedParameters,
  useAllParameterTrajectories,
} from '@/hooks/useParameterTrajectory';
import { useFiscalDimensions } from '@/hooks/useParameterTimeline';
import { useSimulationStore } from '@/stores/simulationStore';
import { ParameterTrajectoryChart } from '@/components/charts/ParameterTrajectoryChart';
import { ParameterMiniChart } from '@/components/charts/ParameterMiniChart';
import { AutopilotLog } from '@/components/charts/AutopilotLog';
import { ProfileComparisonPanel } from '@/components/charts/ProfileComparisonPanel';
import { WhatChangedPanel } from '@/components/charts/WhatChangedPanel';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { FiscalOnboarding } from '@/components/shared/FiscalOnboarding';

// ============================================================
// Constants
// ============================================================

const PROFILE_DISPLAY_NAMES: Record<string, string> = {
  austerity_first: 'Austerity First',
  tax_the_winners: 'Tax the Winners',
  fed_backstop: 'Fed Backstop',
  gridlock: 'Gridlock',
  balanced_pragmatism: 'Balanced Pragmatism',
  no_adjustment: 'No Adjustment',
  custom: 'Custom',
};

// ============================================================
// Component
// ============================================================

export function FiscalView() {
  const [selectedParamKey, setSelectedParamKey] = useState<string | null>(null);
  const [showAllParams, setShowAllParams] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const { activePreset } = useFiscalDimensions();

  const setCurrentYear = useSimulationStore((s) => s.setCurrentYear);
  const setFiscalComparisonProfile = useSimulationStore((s) => s.setFiscalComparisonProfile);

  const mostChanged = useMostChangedParameters(6);
  const unchangedParams = useUnchangedParameters();
  const allTrajectories = useAllParameterTrajectories();

  // Display trajectories: top 6 most changed, or all if expanded
  const displayTrajectories = useMemo(() => {
    if (showAllParams) {
      return allTrajectories;
    }
    return mostChanged;
  }, [showAllParams, mostChanged, allTrajectories]);

  const profileLabel = PROFILE_DISPLAY_NAMES[activePreset] ?? activePreset;

  const handleCloseComparison = () => {
    setShowComparison(false);
    setFiscalComparisonProfile(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between" data-tour-id="fiscal-header">
        <div>
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
            Fiscal Response Dashboard
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Profile: <span className="text-text-primary font-semibold">{profileLabel}</span>
          </p>
        </div>
        <button
          onClick={() => setShowComparison(!showComparison)}
          className={`
            px-3 py-1.5 rounded-[8px] font-mono text-[11px] transition-colors
            ${showComparison
              ? 'bg-gold/20 text-gold border border-gold/30'
              : 'bg-bg-elevated text-text-secondary hover:text-text-primary border border-border hover:border-text-muted/30'
            }
          `}
          data-tour-id="profile-compare-button"
        >
          {showComparison ? 'Close Compare' : 'Compare Profiles'}
        </button>
      </div>

      {/* Profile Comparison Panel */}
      {showComparison && (
        <ErrorBoundary section="Profile Comparison">
          <ProfileComparisonPanel onClose={handleCloseComparison} />
        </ErrorBoundary>
      )}

      {/* Parameter Dashboard Grid */}
      <ErrorBoundary section="Parameter Dashboard">
        <div data-tour-id="parameter-grid">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
              {showAllParams ? 'All Parameters' : 'Most Changed Parameters'}
            </h3>
            <button
              onClick={() => setShowAllParams(!showAllParams)}
              className="text-[11px] font-mono text-gold hover:text-gold-bright transition-colors"
            >
              {showAllParams
                ? `Show Top 6`
                : `Show All (${allTrajectories.length})`
              }
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {displayTrajectories.map((trajectory) => (
              <ParameterMiniChart
                key={trajectory.paramKey}
                trajectory={trajectory}
                selected={selectedParamKey === trajectory.paramKey}
                onClick={() =>
                  setSelectedParamKey(
                    selectedParamKey === trajectory.paramKey ? null : trajectory.paramKey,
                  )
                }
              />
            ))}
          </div>

          {/* Unchanged parameters summary */}
          {!showAllParams && unchangedParams.length > 0 && (
            <p className="text-[11px] text-text-muted font-mono mt-2">
              {unchangedParams.length} parameter{unchangedParams.length !== 1 ? 's' : ''} unchanged from baseline
            </p>
          )}
        </div>
      </ErrorBoundary>

      {/* Selected Parameter Detail */}
      {selectedParamKey && (
        <ErrorBoundary section="Parameter Trajectory">
          <div data-tour-id="trajectory-chart">
            <ParameterTrajectoryChart
              paramKey={selectedParamKey}
              height={260}
              onYearClick={(year) => setCurrentYear(year)}
            />
          </div>
        </ErrorBoundary>
      )}

      {/* What Changed Panel (only when overrides exist) */}
      <ErrorBoundary section="What Changed">
        <WhatChangedPanel />
      </ErrorBoundary>

      {/* Autopilot Activity Log */}
      <ErrorBoundary section="Autopilot Log">
        <AutopilotLog />
      </ErrorBoundary>

      {/* Fiscal Onboarding Tour */}
      <FiscalOnboarding />
    </div>
  );
}
