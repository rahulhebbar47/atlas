/**
 * ATLAS Phase 8d: Parameter Trajectory Chart
 *
 * Full-size chart showing a single parameter's evolution 2025-2050.
 * Three visual layers:
 *   - Gray dashed line: baseline (starting value, constant)
 *   - Blue line: autopilot-computed values
 *   - Gold bold line: effective (actual value used)
 *   - Orange dots: user override values (where overrides exist)
 *   - Optional dashed line: comparison profile overlay
 */

import { useMemo, useCallback } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { useParameterTrajectory, type ParameterTrajectoryPoint } from '@/hooks/useParameterTrajectory';
import { useCurrentYear } from '@/hooks/useSimulation';
import { formatParamValue, PARAM_LABELS } from '@/utils/parameterFormatter';

// ============================================================
// Constants
// ============================================================

const AXIS_TICK = { fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" };
const GRID_STYLE = { strokeDasharray: '2 6', stroke: 'rgba(138, 150, 173, 0.06)' };
const GOLD = '#D4A03C';
const BLUE = '#60A5FA';
const GRAY = '#6B7280';
const AMBER = '#F59E0B';
const COMPARISON_COLOR = '#F97316';

// ============================================================
// Props
// ============================================================

interface ParameterTrajectoryChartProps {
  paramKey: string;
  /** Optional comparison data to overlay (from profile comparison). */
  comparisonPoints?: ParameterTrajectoryPoint[];
  comparisonLabel?: string;
  /** Chart height in px (default 200). */
  height?: number;
  /** Whether to show legend (default true). */
  showLegend?: boolean;
  /** Callback when a year is clicked on the chart. */
  onYearClick?: (year: number) => void;
}

// ============================================================
// Component
// ============================================================

export function ParameterTrajectoryChart({
  paramKey,
  comparisonPoints,
  comparisonLabel,
  height = 200,
  showLegend = true,
  onYearClick,
}: ParameterTrajectoryChartProps) {
  const trajectory = useParameterTrajectory(paramKey);
  const currentYear = useCurrentYear();

  // Merge comparison data into chart data
  const data = useMemo(() => {
    if (!trajectory) return [];

    const comparisonMap = comparisonPoints
      ? new Map(comparisonPoints.map((p) => [p.year, p.effective]))
      : null;

    return trajectory.points.map((p) => ({
      year: p.year,
      baseline: p.baseline,
      autopilot: p.autopilot,
      effective: p.effective,
      override: p.override,
      source: p.source,
      explanation: p.explanation,
      comparison: comparisonMap?.get(p.year),
      // For scatter: only render dot where there's an actual override
      overrideDot: p.override !== undefined ? p.override : null,
    }));
  }, [trajectory, comparisonPoints]);

  const handleChartClick = useCallback(
    (chartData: { activeLabel?: string }) => {
      if (chartData.activeLabel && onYearClick) {
        const year = parseInt(chartData.activeLabel, 10);
        if (!isNaN(year)) onYearClick(year);
      }
    },
    [onYearClick],
  );

  if (!trajectory || data.length === 0) return null;

  const label = PARAM_LABELS[paramKey] ?? paramKey;
  const formatter = (v: number) => formatParamValue(v, paramKey);

  return (
    <Card title={label}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 48, left: 8, bottom: 0 }}
          onClick={handleChartClick}
        >
          <CartesianGrid {...GRID_STYLE} vertical={false} />

          <XAxis
            dataKey="year"
            tick={AXIS_TICK}
            axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }}
            tickLine={false}
            ticks={[2025, 2030, 2035, 2040, 2045, 2050]}
          />

          <YAxis
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={formatter}
          />

          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} />

          {/* Baseline — gray dashed line */}
          <Line
            type="monotone"
            dataKey="baseline"
            stroke={GRAY}
            strokeWidth={1.5}
            strokeDasharray="6 4"
            strokeOpacity={0.5}
            dot={false}
            activeDot={false}
          />

          {/* Autopilot — blue area fill (shows divergence from baseline) */}
          {trajectory.hasAutopilotAdjustment && (
            <Area
              type="monotone"
              dataKey="autopilot"
              stroke={BLUE}
              strokeWidth={1.5}
              fill={BLUE}
              fillOpacity={0.08}
              dot={false}
              activeDot={false}
            />
          )}

          {/* Comparison profile overlay — orange dashed */}
          {comparisonPoints && (
            <Line
              type="monotone"
              dataKey="comparison"
              stroke={COMPARISON_COLOR}
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              activeDot={false}
            />
          )}

          {/* Effective — gold bold line (the actual value used) */}
          <Line
            type="monotone"
            dataKey="effective"
            stroke={GOLD}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: GOLD, stroke: '#080D18', strokeWidth: 2 }}
          />

          {/* Override dots — amber scatter where overrides exist */}
          {trajectory.hasUserOverride && (
            <Scatter
              dataKey="overrideDot"
              fill={AMBER}
              stroke="#080D18"
              strokeWidth={1}
              r={4}
            />
          )}

          <Tooltip content={<TrajectoryTooltip paramKey={paramKey} comparisonLabel={comparisonLabel} />} />
        </ComposedChart>
      </ResponsiveContainer>

      {showLegend && (
        <div className="flex items-center gap-4 mt-3 pl-16 flex-wrap">
          <LegendItem color={GRAY} label="Baseline" dashed />
          {trajectory.hasAutopilotAdjustment && (
            <LegendItem color={BLUE} label="Autopilot" />
          )}
          <LegendItem color={GOLD} label="Effective" />
          {trajectory.hasUserOverride && (
            <LegendItem color={AMBER} label="Override" dot />
          )}
          {comparisonLabel && (
            <LegendItem color={COMPARISON_COLOR} label={comparisonLabel} dashed />
          )}
        </div>
      )}
    </Card>
  );
}

// ============================================================
// Tooltip
// ============================================================

function TrajectoryTooltip({
  active,
  payload,
  label,
  paramKey,
  comparisonLabel,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload: Record<string, unknown> }>;
  label?: number;
  paramKey: string;
  comparisonLabel?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  const format = (v: unknown) => {
    if (typeof v !== 'number') return '—';
    return formatParamValue(v, paramKey);
  };

  const source = row['source'] as string;
  const explanation = row['explanation'] as string | undefined;
  const comparison = row['comparison'] as number | undefined;

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none max-w-[280px]">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>

      <TooltipRow color={GRAY} label="Baseline" value={format(row['baseline'])} />
      <TooltipRow color={BLUE} label="Autopilot" value={format(row['autopilot'])} />
      {row['override'] !== undefined && row['override'] !== null && (
        <TooltipRow color={AMBER} label="Override" value={format(row['override'])} />
      )}
      <TooltipRow color={GOLD} label="Effective" value={format(row['effective'])} bold />

      {comparison !== undefined && comparison !== null && comparisonLabel && (
        <TooltipRow color={COMPARISON_COLOR} label={comparisonLabel} value={format(comparison)} />
      )}

      <div className="mt-1 pt-1 border-t border-border/50">
        <span className="text-[10px] font-mono text-text-muted">
          Source: {source}
        </span>
      </div>

      {explanation && (
        <div className="mt-1 text-[10px] text-text-secondary leading-tight">
          {explanation}
        </div>
      )}
    </div>
  );
}

function TooltipRow({
  color,
  label,
  value,
  bold = false,
}: {
  color: string;
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-[12px] mt-0.5">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-text-secondary">{label}</span>
      <span
        className={`font-mono text-text-primary ml-auto ${bold ? 'font-semibold' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}

// ============================================================
// Legend
// ============================================================

function LegendItem({
  color,
  label,
  dashed = false,
  dot = false,
}: {
  color: string;
  label: string;
  dashed?: boolean;
  dot?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {dot ? (
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      ) : (
        <div className="w-4 h-0 relative">
          <div
            className="absolute inset-x-0 top-1/2 h-[2px]"
            style={{
              background: dashed ? 'none' : color,
              borderTop: dashed ? `2px dashed ${color}` : 'none',
              opacity: dashed ? 0.5 : 1,
            }}
          />
        </div>
      )}
      <span className="text-text-muted text-[10px] font-mono">{label}</span>
    </div>
  );
}
