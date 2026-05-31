/**
 * ATLAS Phase 8d: Fiscal Snapshot (Insights Panel)
 *
 * Shows key fiscal response metrics for the current simulation:
 * - Active profile name
 * - Override count
 * - First consolidation trigger year
 * - Peak consolidation intensity
 * - COLA dampening active year
 */

import { useMemo } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import type { YearParameters, ParameterValue } from '@/types';
import { useFiscalDimensions, useOverrideCount } from '@/hooks/useParameterTimeline';

// ============================================================
// Helpers
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

function getParamValue(yearParams: YearParameters, key: string): ParameterValue | undefined {
  return (yearParams as unknown as Record<string, ParameterValue>)[key];
}

// ============================================================
// Component
// ============================================================

export function FiscalSnapshot() {
  const parameterTimeline = useSimulationStore((s) => s.timeline.parameterTimeline);
  const { activePreset } = useFiscalDimensions();
  const overrideCount = useOverrideCount();

  const metrics = useMemo(() => {
    if (!parameterTimeline) return null;

    let firstConsolidationYear: number | null = null;
    let peakIntensity = 0;
    let peakIntensityYear: number | null = null;
    let firstColaYear: number | null = null;

    const sortedYears = Array.from(parameterTimeline.keys()).sort((a, b) => a - b);

    for (const year of sortedYears) {
      const yearParams = parameterTimeline.get(year)!;

      const intensity = getParamValue(yearParams, 'consolidationIntensity');
      if (intensity && intensity.effective > 0.05) {
        if (firstConsolidationYear === null) {
          firstConsolidationYear = year;
        }
        if (intensity.effective > peakIntensity) {
          peakIntensity = intensity.effective;
          peakIntensityYear = year;
        }
      }

      const cola = getParamValue(yearParams, 'effectiveColaDampeningFactor');
      if (cola && cola.effective < 0.99 && firstColaYear === null) {
        firstColaYear = year;
      }
    }

    return {
      firstConsolidationYear,
      peakIntensity,
      peakIntensityYear,
      firstColaYear,
    };
  }, [parameterTimeline]);

  const profileLabel = PROFILE_DISPLAY_NAMES[activePreset] ?? activePreset;

  return (
    <div className="space-y-3">
      <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
        Fiscal Response
      </h3>

      {/* Profile badge */}
      <div className="bg-bg-elevated rounded-[8px] px-3 py-2">
        <div className="text-[10px] font-mono text-text-muted mb-0.5">Active Profile</div>
        <div className="text-[13px] font-semibold text-text-primary">{profileLabel}</div>
      </div>

      {/* Override count */}
      {overrideCount.total > 0 && (
        <div className="bg-bg-elevated rounded-[8px] px-3 py-2">
          <div className="text-[10px] font-mono text-text-muted mb-0.5">Per-Year Overrides</div>
          <div className="text-[13px] font-mono text-amber-400">
            {overrideCount.total} override{overrideCount.total !== 1 ? 's' : ''} across {overrideCount.years.size} year{overrideCount.years.size !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Fiscal metrics */}
      {metrics && (
        <div className="grid grid-cols-2 gap-2">
          <MetricCell
            label="Consolidation Trigger"
            value={metrics.firstConsolidationYear ? `${metrics.firstConsolidationYear}` : 'Not triggered'}
            color={metrics.firstConsolidationYear ? '#F97316' : '#6B7280'}
          />
          <MetricCell
            label="Peak Intensity"
            value={metrics.peakIntensity > 0 ? `${(metrics.peakIntensity * 100).toFixed(0)}%` : '0%'}
            detail={metrics.peakIntensityYear ? `in ${metrics.peakIntensityYear}` : ''}
            color={metrics.peakIntensity > 0.5 ? '#EF4444' : metrics.peakIntensity > 0 ? '#F97316' : '#6B7280'}
          />
          <MetricCell
            label="COLA Dampening"
            value={metrics.firstColaYear ? `${metrics.firstColaYear}` : 'Not active'}
            color={metrics.firstColaYear ? '#EAB308' : '#6B7280'}
          />
          <MetricCell
            label="Autopilot Years"
            value={
              metrics.firstConsolidationYear
                ? `${metrics.firstConsolidationYear}+`
                : 'None'
            }
            color={metrics.firstConsolidationYear ? '#60A5FA' : '#6B7280'}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================
// Metric Cell
// ============================================================

function MetricCell({
  label,
  value,
  detail,
  color,
}: {
  label: string;
  value: string;
  detail?: string;
  color: string;
}) {
  return (
    <div className="bg-bg-elevated rounded-[8px] px-2.5 py-2">
      <div className="text-[10px] font-mono text-text-muted mb-0.5">{label}</div>
      <div className="text-[13px] font-mono font-semibold" style={{ color }}>
        {value}
      </div>
      {detail && (
        <div className="text-[10px] font-mono text-text-muted">{detail}</div>
      )}
    </div>
  );
}
