/**
 * ATLAS Phase 8d: Parameter Mini Chart (Sparkline Card)
 *
 * Compact sparkline card for the parameter dashboard grid.
 * Shows a tiny area chart with the effective value trajectory,
 * parameter label, start→end summary, and source color indicator.
 *
 * Click to expand to full-size ParameterTrajectoryChart.
 */

import { memo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { ParameterTrajectory } from '@/hooks/useParameterTrajectory';
import { formatParamValue } from '@/utils/parameterFormatter';

// ============================================================
// Constants
// ============================================================

const GOLD = '#D4A03C';
const BLUE = '#60A5FA';
const AMBER = '#F59E0B';
const GRAY = '#4E5D75';

// ============================================================
// Props
// ============================================================

interface ParameterMiniChartProps {
  trajectory: ParameterTrajectory;
  /** Whether this card is currently selected (highlighted border). */
  selected?: boolean;
  /** Click handler to expand this parameter. */
  onClick?: () => void;
}

// ============================================================
// Component
// ============================================================

export const ParameterMiniChart = memo(function ParameterMiniChart({
  trajectory,
  selected = false,
  onClick,
}: ParameterMiniChartProps) {
  const { paramKey, label, points, hasAutopilotAdjustment, hasUserOverride, categoryColor } = trajectory;

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  if (!firstPoint || !lastPoint) return null;

  const startValue = formatParamValue(firstPoint.effective, paramKey);
  const endValue = formatParamValue(lastPoint.effective, paramKey);

  // Determine source dot color based on last point's source
  const sourceColor =
    lastPoint.source === 'override'
      ? AMBER
      : lastPoint.source === 'autopilot'
        ? BLUE
        : GRAY;

  // Determine chart line color
  const lineColor = hasUserOverride ? AMBER : hasAutopilotAdjustment ? BLUE : GOLD;

  // Direction indicator
  const delta = lastPoint.effective - firstPoint.effective;
  const direction = Math.abs(delta) < 1e-9 ? '' : delta > 0 ? '\u2191' : '\u2193';

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left bg-bg-card border rounded-[12px] p-3
        transition-all duration-200 cursor-pointer
        hover:bg-bg-elevated hover:border-text-muted/30
        ${selected ? 'border-gold ring-1 ring-gold/30' : 'border-border'}
      `}
      style={{ borderLeftColor: categoryColor, borderLeftWidth: 3 }}
    >
      {/* Header: label + source dot */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-mono text-text-secondary truncate pr-2">
          {label}
        </span>
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: sourceColor }}
          title={lastPoint.source}
        />
      </div>

      {/* Sparkline */}
      <div className="h-[40px] -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
            <Area
              type="monotone"
              dataKey="effective"
              stroke={lineColor}
              strokeWidth={1.5}
              fill={lineColor}
              fillOpacity={0.08}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer: start → end values */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] font-mono text-text-muted">
          {startValue}
        </span>
        <span className="text-[10px] font-mono text-text-muted">
          {direction}
        </span>
        <span className="text-[10px] font-mono text-text-primary">
          {endValue}
        </span>
      </div>
    </button>
  );
});
