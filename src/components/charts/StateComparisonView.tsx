/**
 * ATLAS State Comparison View (Phase 6)
 *
 * Compare up to 3 states side-by-side:
 * 1. State selector dropdowns
 * 2. Displacement timeline overlay (Recharts LineChart)
 * 3. Metric comparison table
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
  Legend,
} from 'recharts';
import { useSimulationStore } from '@/stores/simulationStore';
import { useStateComparison, useStateDataLoaded } from '@/hooks/useStateData';
import { STATE_NAMES, ALL_STATE_CODES } from '@/data/stateData';
import { STATE_COMPARISON_COLORS } from '@/models/constants';
import { Card } from '@/components/shared/Card';
import { formatPercent, formatCurrency } from '@/utils/format';
import type { StateCode } from '@/types';

// ============================================================
// Constants
// ============================================================

const COLORS = [
  STATE_COMPARISON_COLORS.state1,
  STATE_COMPARISON_COLORS.state2,
  STATE_COMPARISON_COLORS.state3,
];

// ============================================================
// Component
// ============================================================

export function StateComparisonView() {
  const stateDataLoaded = useStateDataLoaded();
  const comparisonCodes = useSimulationStore((s) => s.comparisonStateCodes);
  const addComparisonState = useSimulationStore((s) => s.addComparisonState);
  const removeComparisonState = useSimulationStore((s) => s.removeComparisonState);
  const clearComparisonStates = useSimulationStore((s) => s.clearComparisonStates);

  const comparison = useStateComparison();

  // Merge time series for overlay chart
  const overlayData = useMemo(() => {
    if (comparison.states.length === 0) return [];

    const yearMap = new Map<number, Record<string, number>>();
    for (const state of comparison.states) {
      for (const point of state.timeSeries) {
        const existing = yearMap.get(point.year) ?? { year: point.year };
        existing[`${state.code}_displacement`] = point.displacement;
        existing[`${state.code}_unemployment`] = point.unemploymentRate;
        yearMap.set(point.year, existing);
      }
    }

    return Array.from(yearMap.values()).sort(
      (a, b) => (a.year as number) - (b.year as number),
    );
  }, [comparison]);

  if (!stateDataLoaded) {
    return (
      <div className="border border-border rounded-2xl bg-bg-surface p-8 text-center">
        <p className="text-text-muted text-[13px]">
          State data not available. Run fetch script with <code className="font-mono text-gold">--include-states</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* State selectors */}
      <div className="flex items-center gap-2 flex-wrap">
        {[0, 1, 2].map((slot) => {
          const code = comparisonCodes[slot];
          return (
            <StateSelector
              key={slot}
              slotIndex={slot}
              selectedCode={code ?? null}
              color={COLORS[slot] ?? '#D4A03C'}
              existingCodes={comparisonCodes}
              onSelect={(c) => addComparisonState(c)}
              onRemove={() => code && removeComparisonState(code)}
            />
          );
        })}

        {comparisonCodes.length > 0 && (
          <button
            onClick={clearComparisonStates}
            className="font-mono text-[9px] text-text-muted hover:text-gold transition-colors ml-2"
          >
            Clear all
          </button>
        )}
      </div>

      {comparison.states.length === 0 && (
        <div className="border border-border rounded-2xl bg-bg-surface p-8 text-center">
          <p className="text-text-muted text-[13px]">
            Select up to 3 states to compare.
          </p>
        </div>
      )}

      {/* Displacement timeline overlay */}
      {overlayData.length > 0 && (
        <Card title="Displacement Comparison">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={overlayData}
              margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="2 6"
                stroke="rgba(138, 150, 173, 0.06)"
                vertical={false}
              />

              <XAxis
                dataKey="year"
                tick={{ fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }}
                tickLine={false}
                ticks={[2025, 2030, 2035, 2040, 2045, 2050]}
              />

              <YAxis
                tick={{ fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatPercent(v, 0)}
                width={48}
              />

              {comparison.states.map((state, i) => (
                <Line
                  key={state.code}
                  type="monotone"
                  dataKey={`${state.code}_displacement`}
                  name={state.name}
                  stroke={COLORS[i]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: COLORS[i],
                    stroke: '#080D18',
                    strokeWidth: 2,
                  }}
                />
              ))}

              <Tooltip content={<ComparisonTooltip states={comparison.states} />} />
              <Legend
                wrapperStyle={{
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Metric comparison table */}
      {comparison.states.length > 0 && (
        <Card title="Current Year Metrics">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="text-text-muted border-b border-border">
                  <th className="text-left py-2 pr-4">Metric</th>
                  {comparison.states.map((state, i) => (
                    <th key={state.code} className="text-right py-2 px-2">
                      <span style={{ color: COLORS[i] }}>{state.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-text-primary">
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 text-text-secondary">Displacement</td>
                  {comparison.states.map((state) => (
                    <td key={state.code} className="text-right py-2 px-2">
                      {formatPercent(state.currentMetrics.displacement)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 text-text-secondary">Unemployment</td>
                  {comparison.states.map((state) => (
                    <td key={state.code} className="text-right py-2 px-2">
                      {formatPercent(state.currentMetrics.unemploymentRate)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 text-text-secondary">CWI</td>
                  {comparison.states.map((state) => (
                    <td key={state.code} className="text-right py-2 px-2">
                      {formatCurrency(state.currentMetrics.consumerWelfareIndex, { compact: true })}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-text-secondary">Policy Effect.</td>
                  {comparison.states.map((state) => (
                    <td key={state.code} className="text-right py-2 px-2">
                      {formatPercent(state.currentMetrics.policyEffectiveness)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function StateSelector({
  slotIndex,
  selectedCode,
  color,
  existingCodes,
  onSelect,
  onRemove,
}: {
  slotIndex: number;
  selectedCode: StateCode | null;
  color: string;
  existingCodes: StateCode[];
  onSelect: (code: StateCode) => void;
  onRemove: () => void;
}) {
  if (selectedCode) {
    return (
      <div
        className="flex items-center gap-1.5 bg-bg-elevated border border-border rounded-md px-2.5 py-1.5"
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: color }}
        />
        <span className="font-mono text-[11px] text-text-primary">
          {STATE_NAMES[selectedCode] ?? selectedCode}
        </span>
        <button
          onClick={onRemove}
          className="text-text-muted hover:text-critical ml-1 transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <select
      value=""
      onChange={(e) => {
        if (e.target.value) onSelect(e.target.value as StateCode);
      }}
      className="bg-bg-elevated border border-border rounded-md px-2 py-1.5 font-mono text-[11px] text-text-muted"
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <option value="">+ State {slotIndex + 1}</option>
      {ALL_STATE_CODES
        .filter((c) => !existingCodes.includes(c))
        .map((code) => (
          <option key={code} value={code}>
            {STATE_NAMES[code]}
          </option>
        ))}
    </select>
  );
}

function ComparisonTooltip({
  active,
  payload,
  label,
  states,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string; name: string }>;
  label?: number;
  states: Array<{ code: StateCode; name: string }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-[11px]">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: p.color }}
          />
          <span className="text-text-secondary">{p.name}</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatPercent(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
