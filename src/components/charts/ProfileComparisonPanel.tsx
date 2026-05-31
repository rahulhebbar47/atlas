/**
 * ATLAS Phase 8d: Profile Comparison Panel
 *
 * Side-by-side comparison of two fiscal response profiles.
 * Shows overlaid macro charts + summary metrics table + narrative.
 *
 * Activated by the "Compare Profiles" button in FiscalView.
 */

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useProfileComparison } from '@/hooks/useProfileComparison';
import { useCurrentYear } from '@/hooks/useSimulation';
import { useSimulationStore } from '@/stores/simulationStore';
import { generateComparisonData, type ComparisonMetricRow } from '@/utils/comparisonNarrative';
import { FISCAL_POLICY_PRESETS } from '@/models/fiscalResponseProfiles';
import { Card } from '@/components/shared/Card';

// ============================================================
// Constants
// ============================================================

const AXIS_TICK = { fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" };
const GRID_STYLE = { strokeDasharray: '2 6', stroke: 'rgba(138, 150, 173, 0.06)' };
const PROFILE_A_COLOR = '#60A5FA';  // blue
const PROFILE_B_COLOR = '#F59E0B';  // amber

const PROFILE_DISPLAY_NAMES: Record<string, string> = {
  austerity: 'Austerity',
  tax_the_winners: 'Tax the Winners',
  balanced_reduction: 'Balanced Reduction',
  gridlock: 'Gridlock',
  no_fiscal_response: 'No Fiscal Response',
  custom: 'Custom',
};

// ============================================================
// Component
// ============================================================

export function ProfileComparisonPanel({ onClose }: { onClose: () => void }) {
  const comparisonProfileName = useSimulationStore((s) => s.fiscalComparisonProfile);
  const setFiscalComparisonProfile = useSimulationStore((s) => s.setFiscalComparisonProfile);
  const currentProfileName = useSimulationStore((s) => s.config.fiscalPolicyPreset ?? 'balanced_reduction');

  const comparison = useProfileComparison(comparisonProfileName);
  const comparisonData = useMemo(() => {
    if (!comparison) return null;
    return generateComparisonData(comparison.profileA, comparison.profileB);
  }, [comparison]);

  const presetOptions = useMemo(() => {
    return Object.keys(FISCAL_POLICY_PRESETS).filter(
      (name) => name !== currentProfileName,
    );
  }, [currentProfileName]);

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
          Compare Fiscal Response Profiles
        </h3>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary text-[18px] leading-none transition-colors"
        >
          {'\u00D7'}
        </button>
      </div>

      {/* Profile selectors */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-[10px] font-mono text-text-muted mb-1">Profile A (Current)</div>
          <div className="bg-bg-elevated rounded-[8px] px-3 py-2 text-[12px] font-semibold text-text-primary" style={{ borderLeft: `3px solid ${PROFILE_A_COLOR}` }}>
            {PROFILE_DISPLAY_NAMES[currentProfileName] ?? currentProfileName}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono text-text-muted mb-1">Profile B (Compare)</div>
          <select
            value={comparisonProfileName ?? ''}
            onChange={(e) => setFiscalComparisonProfile(e.target.value || null)}
            className="w-full bg-bg-elevated border border-border rounded-[8px] px-3 py-2 text-[12px] font-mono text-text-primary focus:outline-none focus:border-gold"
            style={{ borderLeft: `3px solid ${PROFILE_B_COLOR}` }}
          >
            <option value="">Select a profile...</option>
            {presetOptions.map((name) => (
              <option key={name} value={name}>
                {PROFILE_DISPLAY_NAMES[name] ?? name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison results */}
      {comparison && comparisonData && (
        <div className="space-y-4">
          {/* Macro overlay charts */}
          <ComparisonLineChart
            profileATimeline={comparison.profileA.timeline.years}
            profileBTimeline={comparison.profileB.timeline.years}
            dataKeyFn={(y) => y.macro.consumerWelfareIndex}
            label="Consumer Welfare Index"
            formatter={(v: number) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          />

          <ComparisonLineChart
            profileATimeline={comparison.profileA.timeline.years}
            profileBTimeline={comparison.profileB.timeline.years}
            dataKeyFn={(y) => y.macro.unemploymentRate}
            label="Unemployment Rate"
            formatter={(v: number) => `${(v * 100).toFixed(1)}%`}
          />

          <ComparisonLineChart
            profileATimeline={comparison.profileA.timeline.years}
            profileBTimeline={comparison.profileB.timeline.years}
            dataKeyFn={(y) => y.macro.priceLevel}
            label="Price Level"
            formatter={(v: number) => `${v.toFixed(2)}\u00D7`}
          />

          <ComparisonLineChart
            profileATimeline={comparison.profileA.timeline.years}
            profileBTimeline={comparison.profileB.timeline.years}
            dataKeyFn={(y) => y.fiscalMonetary?.fiscal.debtGDPRatio ?? 0}
            label="Debt / GDP Ratio"
            formatter={(v: number) => `${v.toFixed(2)}\u00D7`}
          />

          {/* Summary metrics table */}
          <div className="bg-bg-elevated rounded-[12px] p-4">
            <h4 className="font-mono text-[11px] text-text-muted uppercase tracking-[0.12em] mb-3">
              Final Year Metrics
            </h4>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left font-mono text-text-muted py-1">Metric</th>
                  <th className="text-right font-mono py-1" style={{ color: PROFILE_A_COLOR }}>
                    {comparisonData.profileAName}
                  </th>
                  <th className="text-right font-mono py-1" style={{ color: PROFILE_B_COLOR }}>
                    {comparisonData.profileBName}
                  </th>
                  <th className="text-right font-mono text-text-muted py-1">{'\u0394'}</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.metrics.map((m) => (
                  <MetricTableRow key={m.label} metric={m} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Narrative bullets */}
          {comparisonData.narrative.length > 0 && (
            <div className="bg-bg-elevated rounded-[12px] p-4">
              <h4 className="font-mono text-[11px] text-text-muted uppercase tracking-[0.12em] mb-2">
                Key Differences
              </h4>
              <ul className="space-y-1">
                {comparisonData.narrative.map((bullet, i) => (
                  <li key={i} className="text-[12px] text-text-secondary flex gap-2">
                    <span className="text-text-muted flex-shrink-0">{'\u2022'}</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!comparisonProfileName && (
        <p className="text-[12px] text-text-muted text-center py-8">
          Select a comparison profile above to see how different fiscal philosophies lead to different outcomes.
        </p>
      )}
    </Card>
  );
}

// ============================================================
// Comparison Line Chart
// ============================================================

interface SimulationYearOutput {
  year: number;
  macro: {
    consumerWelfareIndex: number;
    unemploymentRate: number;
    priceLevel: number;
    gdpReal: number;
  };
  fiscalMonetary?: {
    fiscal: {
      debtGDPRatio: number;
    };
  };
}

function ComparisonLineChart({
  profileATimeline,
  profileBTimeline,
  dataKeyFn,
  label,
  formatter,
}: {
  profileATimeline: SimulationYearOutput[];
  profileBTimeline: SimulationYearOutput[];
  dataKeyFn: (year: SimulationYearOutput) => number;
  label: string;
  formatter: (v: number) => string;
}) {
  const currentYear = useCurrentYear();

  const data = useMemo(() => {
    const aMap = new Map(profileATimeline.map((y) => [y.year, dataKeyFn(y)]));
    const bMap = new Map(profileBTimeline.map((y) => [y.year, dataKeyFn(y)]));

    const allYears = new Set([...aMap.keys(), ...bMap.keys()]);
    return Array.from(allYears)
      .sort((a, b) => a - b)
      .map((year) => ({
        year,
        profileA: aMap.get(year) ?? null,
        profileB: bMap.get(year) ?? null,
      }));
  }, [profileATimeline, profileBTimeline, dataKeyFn]);

  return (
    <div>
      <div className="font-mono text-[10px] text-text-muted uppercase tracking-[0.08em] mb-1">
        {label}
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 4, right: 40, left: 4, bottom: 0 }}>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis
            dataKey="year"
            tick={AXIS_TICK}
            axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }}
            tickLine={false}
            ticks={[2025, 2035, 2045]}
          />
          <YAxis
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={formatter}
          />
          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.2)" strokeWidth={1} />
          <Line
            type="monotone"
            dataKey="profileA"
            stroke={PROFILE_A_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: PROFILE_A_COLOR }}
          />
          <Line
            type="monotone"
            dataKey="profileB"
            stroke={PROFILE_B_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: PROFILE_B_COLOR }}
          />
          <Tooltip
            content={({ active, payload, label: tooltipLabel }) => {
              if (!active || !payload) return null;
              return (
                <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
                  <div className="font-mono text-[11px] text-text-muted mb-1">{tooltipLabel}</div>
                  {payload.map((p) => (
                    <div key={p.dataKey as string} className="flex items-center gap-2 text-[11px]">
                      <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                      <span className="font-mono text-text-primary">
                        {typeof p.value === 'number' ? formatter(p.value) : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================
// Metric Table Row
// ============================================================

function MetricTableRow({ metric }: { metric: ComparisonMetricRow }) {
  const delta = metric.valueB - metric.valueA;
  const pctChange = metric.valueA !== 0
    ? (delta / Math.abs(metric.valueA)) * 100
    : 0;

  const isBetter = metric.higherIsBetter ? delta > 0 : delta < 0;
  const deltaColor = Math.abs(pctChange) < 1
    ? 'text-text-muted'
    : isBetter
      ? 'text-green-400'
      : 'text-red-400';

  return (
    <tr className="border-b border-border/30">
      <td className="text-text-secondary py-1.5">{metric.label}</td>
      <td className="text-right font-mono text-text-primary py-1.5">
        {metric.format(metric.valueA)}
      </td>
      <td className="text-right font-mono text-text-primary py-1.5">
        {metric.format(metric.valueB)}
      </td>
      <td className={`text-right font-mono py-1.5 ${deltaColor}`}>
        {Math.abs(pctChange) < 1
          ? '\u2014'
          : `${pctChange > 0 ? '+' : ''}${pctChange.toFixed(0)}%`
        }
      </td>
    </tr>
  );
}
