/**
 * ATLAS New Jobs Chart
 *
 * Visualizes new job creation vs. displacement per DATA_MODEL.md Section 6.
 * Shows durable new jobs (green), displaced jobs (red, negative),
 * net job creation (gold line crossing zero), and automation coverage (cyan, right axis).
 *
 * Crossover year (where net jobs become permanently negative) annotated.
 * Follows EmploymentChart.tsx patterns exactly.
 */

import { useMemo } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { useMacroTimeSeries, useCurrentYear } from '@/hooks/useSimulation';
import { findNetJobCrossoverYear } from '@/models/newJobs';
import { formatNumber, formatPercent } from '@/utils/format';

interface NewJobsDataPoint {
  year: number;
  durableNewJobs: number;
  displacedJobsNeg: number; // negative for below-zero display
  netJobCreation: number;
  automationCoverage: number;
}

export function NewJobsChart() {
  const rawData = useMacroTimeSeries();
  const currentYear = useCurrentYear();

  // Transform data: displaced jobs shown as negative
  const data: NewJobsDataPoint[] = useMemo(
    () =>
      rawData.map((d) => ({
        year: d.year,
        durableNewJobs: d.durableNewJobs,
        displacedJobsNeg: -d.totalDisplacedJobs,
        netJobCreation: d.netJobCreation,
        automationCoverage: d.automationCoverage,
      })),
    [rawData],
  );

  // Find crossover year where net jobs become permanently negative
  const crossoverYear = useMemo(
    () =>
      findNetJobCrossoverYear(
        rawData.map((d) => ({ year: d.year, netJobCreation: d.netJobCreation })),
      ),
    [rawData],
  );

  return (
    <Card title="New Job Creation vs. Displacement">
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 48, left: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="durableJobsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#22C55E" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="displacedJobsFill" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
            </linearGradient>
          </defs>

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

          {/* Left Y-axis: Jobs count */}
          <YAxis
            yAxisId="jobs"
            tick={{ fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatNumber(v, { compact: true })}
            width={56}
          />

          {/* Right Y-axis: Automation coverage [0, 1] */}
          <YAxis
            yAxisId="coverage"
            orientation="right"
            tick={{ fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatPercent(v, 0)}
            domain={[0, 1]}
            width={48}
          />

          {/* Breakeven line at y=0 */}
          <ReferenceLine
            y={0}
            yAxisId="jobs"
            stroke="rgba(138, 150, 173, 0.2)"
            strokeWidth={1}
          />

          {/* Crossover year — where net jobs go permanently negative */}
          {crossoverYear !== null && (
            <ReferenceLine
              x={crossoverYear}
              yAxisId="jobs"
              stroke="#F97316"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: 'Net Job Loss',
                position: 'insideTopLeft',
                fill: '#F97316',
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          )}

          {/* Current year indicator */}
          <ReferenceLine
            x={currentYear}
            yAxisId="jobs"
            stroke="rgba(232, 236, 244, 0.3)"
            strokeWidth={1}
          />

          {/* Durable new jobs (positive, green) */}
          <Area
            yAxisId="jobs"
            type="monotone"
            dataKey="durableNewJobs"
            stroke="#22C55E"
            strokeWidth={1.5}
            fill="url(#durableJobsFill)"
            dot={false}
            activeDot={{
              r: 3,
              fill: '#22C55E',
              stroke: '#080D18',
              strokeWidth: 2,
            }}
          />

          {/* Displaced jobs (negative, red) */}
          <Area
            yAxisId="jobs"
            type="monotone"
            dataKey="displacedJobsNeg"
            stroke="#EF4444"
            strokeWidth={1.5}
            fill="url(#displacedJobsFill)"
            dot={false}
            activeDot={{
              r: 3,
              fill: '#EF4444',
              stroke: '#080D18',
              strokeWidth: 2,
            }}
          />

          {/* Net job creation (gold line) */}
          <Line
            yAxisId="jobs"
            type="monotone"
            dataKey="netJobCreation"
            stroke="#D4A03C"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: '#D4A03C',
              stroke: '#080D18',
              strokeWidth: 2,
            }}
          />

          {/* Automation coverage (cyan dashed, right axis) */}
          <Line
            yAxisId="coverage"
            type="monotone"
            dataKey="automationCoverage"
            stroke="#06B6D4"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={false}
            activeDot={{
              r: 3,
              fill: '#06B6D4',
              stroke: '#080D18',
              strokeWidth: 2,
            }}
          />

          <Tooltip content={<NewJobsTooltip />} />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3 pl-16 flex-wrap">
        <LegendItem color="#22C55E" label="Durable New Jobs" />
        <LegendItem color="#EF4444" label="Displaced Jobs" />
        <LegendItem color="#D4A03C" label="Net Job Creation" />
        <LegendItem color="#06B6D4" label="AI Coverage" dashed />
      </div>
    </Card>
  );
}

function NewJobsTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const durableNew = payload.find((p) => p.dataKey === 'durableNewJobs');
  const displaced = payload.find((p) => p.dataKey === 'displacedJobsNeg');
  const net = payload.find((p) => p.dataKey === 'netJobCreation');
  const coverage = payload.find((p) => p.dataKey === 'automationCoverage');

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">
        {label}
      </div>
      {durableNew && (
        <TooltipRow color="#22C55E" label="New Jobs" value={formatNumber(durableNew.value, { compact: true })} />
      )}
      {displaced && (
        <TooltipRow color="#EF4444" label="Displaced" value={formatNumber(Math.abs(displaced.value), { compact: true })} />
      )}
      {net && (
        <TooltipRow
          color="#D4A03C"
          label="Net"
          value={(net.value >= 0 ? '+' : '') + formatNumber(net.value, { compact: true })}
        />
      )}
      {coverage && (
        <TooltipRow color="#06B6D4" label="AI Coverage" value={formatPercent(coverage.value)} />
      )}
    </div>
  );
}

function TooltipRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px] mt-1">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-text-secondary">{label}</span>
      <span className="font-mono text-text-primary ml-auto">{value}</span>
    </div>
  );
}

function LegendItem({
  color,
  label,
  dashed = false,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-0 relative">
        <div
          className="absolute inset-x-0 top-1/2 h-[2px]"
          style={{
            background: dashed ? 'none' : color,
            borderTop: dashed ? `2px dashed ${color}` : 'none',
          }}
        />
      </div>
      <span className="text-text-muted text-[10px] font-mono">{label}</span>
    </div>
  );
}
