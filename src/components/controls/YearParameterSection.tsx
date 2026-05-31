/**
 * ATLAS Phase 8c: Year Parameter Section
 *
 * Shows the resolved parameters for the current year, grouped by category.
 * Always visible in the sidebar, tracks currentYear from the store.
 *
 * Parameters display their three-layer provenance:
 *   baseline (gray) → autopilot (blue) → override (orange)
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { useCurrentYearParameters, useOverrideCount } from '@/hooks/useParameterTimeline';
import { useCurrentYear } from '@/hooks/useSimulation';
import { ParameterRow } from '@/components/controls/ParameterRow';
import { PARAM_LABELS, PARAM_CATEGORIES } from '@/utils/parameterFormatter';
import type { YearParameters, ParameterValue } from '@/types';

export function YearParameterSection() {
  const currentYear = useCurrentYear();
  const yearParams = useCurrentYearParameters();
  const resetYearOverrides = useSimulationStore((s) => s.resetYearOverrides);
  const { forYear } = useOverrideCount();

  const yearOverrideCount = forYear(currentYear);

  const handleResetYear = useCallback(() => {
    if (yearOverrideCount === 0) return;
    const confirmed = window.confirm(
      `Reset ${yearOverrideCount} override${yearOverrideCount > 1 ? 's' : ''} for ${currentYear}?`
    );
    if (confirmed) {
      resetYearOverrides(currentYear);
    }
  }, [currentYear, yearOverrideCount, resetYearOverrides]);

  if (!yearParams) {
    return (
      <div className="text-[10px] text-text-muted font-mono px-1 py-2">
        Parameter timeline not available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-mono font-semibold text-text-primary">
            {currentYear}
          </span>
          <span className="text-[10px] font-mono text-text-muted">
            {yearParams.profileName}
          </span>
        </div>
        {yearOverrideCount > 0 && (
          <button
            onClick={handleResetYear}
            className="text-[9px] font-mono text-amber-400 hover:text-amber-300 transition-colors"
          >
            Reset year ({yearOverrideCount})
          </button>
        )}
      </div>

      {/* Parameter groups */}
      {PARAM_CATEGORIES.map((category) => (
        <ParameterGroup
          key={category.key}
          label={category.label}
          color={category.color}
          params={category.params}
          yearParams={yearParams}
          year={currentYear}
        />
      ))}
    </div>
  );
}

interface ParameterGroupProps {
  label: string;
  color: string;
  params: string[];
  yearParams: YearParameters;
  year: number;
}

function ParameterGroup({ label, color, params, yearParams, year }: ParameterGroupProps) {
  return (
    <div>
      <div className="text-[9px] font-mono font-medium uppercase tracking-wider mb-1" style={{ color }}>
        {label}
      </div>
      <div className="space-y-0">
        {params.map((paramKey) => {
          const value = (yearParams as unknown as Record<string, ParameterValue>)[paramKey];
          if (!value || typeof value !== 'object' || !('effective' in value)) return null;

          return (
            <ParameterRow
              key={paramKey}
              label={PARAM_LABELS[paramKey] ?? paramKey}
              paramKey={paramKey}
              value={value}
              year={year}
            />
          );
        })}
      </div>
    </div>
  );
}
