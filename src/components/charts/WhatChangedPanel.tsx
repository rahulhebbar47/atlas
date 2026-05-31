/**
 * ATLAS Phase 8d: What Changed Panel
 *
 * Shows the impact of user parameter overrides compared to the
 * pure autopilot baseline. Displayed in FiscalView when overrides exist.
 *
 * Sections:
 *   1. Override List — each override with autopilot comparison
 *   2. Impact Table — final-year macro metrics vs baseline
 *   3. Auto-generated narrative summary
 */

import { useMemo } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { PARAM_LABELS, formatParamValue } from '@/utils/parameterFormatter';
import { Card } from '@/components/shared/Card';

// ============================================================
// Types
// ============================================================

interface OverrideEntry {
  paramKey: string;
  paramLabel: string;
  year: number;
  overrideValue: number;
  autopilotValue: number;
  formattedOverride: string;
  formattedAutopilot: string;
}

interface ImpactMetric {
  label: string;
  withOverrides: number;
  withoutOverrides: number;
  delta: number;
  pctChange: number;
  format: (v: number) => string;
  higherIsBetter: boolean;
}

// ============================================================
// Component
// ============================================================

export function WhatChangedPanel() {
  const parameterOverrides = useSimulationStore((s) => s.parameterOverrides);
  const timeline = useSimulationStore((s) => s.timeline);
  const baselineTimeline = useSimulationStore((s) => s.baselineTimeline);
  const showBaselineComparison = useSimulationStore((s) => s.showBaselineComparison);
  const toggleBaselineComparison = useSimulationStore((s) => s.toggleBaselineComparison);

  // Parse override entries
  const overrideEntries = useMemo((): OverrideEntry[] => {
    const entries: OverrideEntry[] = [];
    const paramTimeline = timeline.parameterTimeline;

    for (const [key, value] of Object.entries(parameterOverrides)) {
      const colonIdx = key.lastIndexOf(':');
      if (colonIdx < 0) continue;

      const paramKey = key.slice(0, colonIdx);
      const year = parseInt(key.slice(colonIdx + 1), 10);
      if (isNaN(year)) continue;

      const label = PARAM_LABELS[paramKey] ?? paramKey;

      // Get autopilot value from baseline timeline (without overrides)
      let autopilotValue = value; // fallback to same if no baseline
      if (baselineTimeline?.parameterTimeline) {
        const baseYearParams = baselineTimeline.parameterTimeline.get(year);
        if (baseYearParams) {
          const pv = (baseYearParams as unknown as Record<string, { autopilot: number }>)[paramKey];
          if (pv && typeof pv.autopilot === 'number') {
            autopilotValue = pv.autopilot;
          }
        }
      }

      entries.push({
        paramKey,
        paramLabel: label,
        year,
        overrideValue: value,
        autopilotValue,
        formattedOverride: formatParamValue(value, paramKey),
        formattedAutopilot: formatParamValue(autopilotValue, paramKey),
      });
    }

    // Sort by year, then by param key
    entries.sort((a, b) => a.year - b.year || a.paramKey.localeCompare(b.paramKey));
    return entries;
  }, [parameterOverrides, timeline.parameterTimeline, baselineTimeline]);

  // Compute impact metrics (final year comparison)
  const impactMetrics = useMemo((): ImpactMetric[] => {
    if (!baselineTimeline) return [];

    const lastWith = timeline.years[timeline.years.length - 1];
    const lastWithout = baselineTimeline.years[baselineTimeline.years.length - 1];
    if (!lastWith || !lastWithout) return [];

    const metrics: ImpactMetric[] = [
      {
        label: 'Consumer Welfare Index',
        withOverrides: lastWith.macro.consumerWelfareIndex,
        withoutOverrides: lastWithout.macro.consumerWelfareIndex,
        delta: 0,
        pctChange: 0,
        format: (v) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        higherIsBetter: true,
      },
      {
        label: 'Unemployment Rate',
        withOverrides: lastWith.macro.unemploymentRate,
        withoutOverrides: lastWithout.macro.unemploymentRate,
        delta: 0,
        pctChange: 0,
        format: (v) => `${(v * 100).toFixed(1)}%`,
        higherIsBetter: false,
      },
      {
        label: 'Price Level',
        withOverrides: lastWith.macro.priceLevel,
        withoutOverrides: lastWithout.macro.priceLevel,
        delta: 0,
        pctChange: 0,
        format: (v) => `${v.toFixed(2)}\u00D7`,
        higherIsBetter: false,
      },
      {
        label: 'Debt / GDP',
        withOverrides: lastWith.fiscalMonetary?.fiscal.debtGDPRatio ?? 0,
        withoutOverrides: lastWithout.fiscalMonetary?.fiscal.debtGDPRatio ?? 0,
        delta: 0,
        pctChange: 0,
        format: (v) => `${v.toFixed(2)}\u00D7`,
        higherIsBetter: false,
      },
    ];

    // Compute deltas
    for (const m of metrics) {
      m.delta = m.withOverrides - m.withoutOverrides;
      m.pctChange = m.withoutOverrides !== 0
        ? (m.delta / Math.abs(m.withoutOverrides)) * 100
        : 0;
    }

    return metrics;
  }, [timeline, baselineTimeline]);

  // Auto-generate narrative
  const narrative = useMemo((): string | null => {
    if (impactMetrics.length === 0) return null;

    const cwiMetric = impactMetrics.find((m) => m.label === 'Consumer Welfare Index');
    const unempMetric = impactMetrics.find((m) => m.label === 'Unemployment Rate');

    if (!cwiMetric || !unempMetric) return null;

    const parts: string[] = [];

    if (Math.abs(cwiMetric.pctChange) >= 1) {
      const dir = cwiMetric.pctChange > 0 ? 'increases' : 'decreases';
      parts.push(`Your overrides ${dir} the Consumer Welfare Index by ${Math.abs(cwiMetric.pctChange).toFixed(1)}%`);
    }

    if (Math.abs(unempMetric.delta) >= 0.005) {
      const dir = unempMetric.delta > 0 ? 'raises' : 'lowers';
      parts.push(`${parts.length > 0 ? 'and ' : 'Your overrides '}${dir} unemployment by ${Math.abs(unempMetric.delta * 100).toFixed(1)}pp`);
    }

    if (parts.length === 0) {
      return 'Your overrides have minimal impact on final-year macro outcomes.';
    }

    return parts.join(' ') + ' compared to pure autopilot.';
  }, [impactMetrics]);

  const overrideCount = Object.keys(parameterOverrides).length;
  if (overrideCount === 0) return null;

  // Auto-enable baseline comparison if not already on
  if (!showBaselineComparison) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
              What Changed
            </h3>
            <p className="text-[12px] text-text-secondary mt-1">
              {overrideCount} override{overrideCount !== 1 ? 's' : ''} active.
              Enable baseline comparison to see impact.
            </p>
          </div>
          <button
            onClick={toggleBaselineComparison}
            className="px-3 py-1.5 rounded-[8px] font-mono text-[11px] bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
          >
            Enable Comparison
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted mb-3">
        What Changed ({overrideCount} Override{overrideCount !== 1 ? 's' : ''})
      </h3>

      {/* Override list */}
      <div className="space-y-1.5 mb-4">
        {overrideEntries.map((entry) => (
          <div
            key={`${entry.paramKey}:${entry.year}`}
            className="flex items-center justify-between text-[11px] bg-bg-elevated rounded-[6px] px-3 py-1.5"
          >
            <div>
              <span className="text-text-primary font-medium">{entry.paramLabel}</span>
              <span className="text-text-muted ml-1.5">({entry.year})</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-text-muted">{entry.formattedAutopilot}</span>
              <span className="text-text-muted">{'\u2192'}</span>
              <span className="text-gold">{entry.formattedOverride}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Impact table */}
      {impactMetrics.length > 0 && (
        <div className="mb-4">
          <h4 className="font-mono text-[10px] text-text-muted uppercase tracking-[0.08em] mb-2">
            Final Year Impact vs. Pure Autopilot
          </h4>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left font-mono text-text-muted py-1">Metric</th>
                <th className="text-right font-mono text-text-muted py-1">Autopilot</th>
                <th className="text-right font-mono text-text-muted py-1">With Overrides</th>
                <th className="text-right font-mono text-text-muted py-1">{'\u0394'}</th>
              </tr>
            </thead>
            <tbody>
              {impactMetrics.map((m) => {
                const isBetter = m.higherIsBetter ? m.delta > 0 : m.delta < 0;
                const deltaColor = Math.abs(m.pctChange) < 1
                  ? 'text-text-muted'
                  : isBetter
                    ? 'text-green-400'
                    : 'text-red-400';

                return (
                  <tr key={m.label} className="border-b border-border/30">
                    <td className="text-text-secondary py-1.5">{m.label}</td>
                    <td className="text-right font-mono text-text-primary py-1.5">
                      {m.format(m.withoutOverrides)}
                    </td>
                    <td className="text-right font-mono text-text-primary py-1.5">
                      {m.format(m.withOverrides)}
                    </td>
                    <td className={`text-right font-mono py-1.5 ${deltaColor}`}>
                      {Math.abs(m.pctChange) < 1
                        ? '\u2014'
                        : `${m.pctChange > 0 ? '+' : ''}${m.pctChange.toFixed(0)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Narrative summary */}
      {narrative && (
        <p className="text-[11px] text-text-secondary italic">
          {narrative}
        </p>
      )}
    </Card>
  );
}
