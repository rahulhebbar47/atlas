/**
 * ATLAS Cluster Employment Chart (Phase 4)
 *
 * Per-cluster employment area chart showing:
 * - Baseline employment (gray dashed reference line)
 * - Actual employment over time (colored fill)
 * - Tipping point annotation if applicable
 *
 * Follows EmploymentChart.tsx pattern: Card wrapper, Recharts AreaChart.
 */

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { useClusterDetailData } from '@/hooks/useOccupationData';
import { getCategoryColor } from '@/utils/colors';
import { formatNumber } from '@/utils/format';

interface ClusterEmploymentChartProps {
  clusterId: string;
}

interface ChartPoint {
  year: number;
  employment: number;
  baseline: number;
}

export function ClusterEmploymentChart({ clusterId }: ClusterEmploymentChartProps) {
  const detail = useClusterDetailData(clusterId);

  const { data, color } = useMemo(() => {
    if (!detail || detail.yearlyData.length === 0) {
      return { data: [] as ChartPoint[], color: '#D4A03C' };
    }

    const baseline = detail.baselineEmployment;
    const chartColor = getCategoryColor(detail.category);

    const chartData: ChartPoint[] = detail.yearlyData.map(({ year, cluster }) => ({
      year,
      employment: cluster.totalRemainingEmployment,
      baseline,
    }));

    return { data: chartData, color: chartColor };
  }, [detail]);

  if (!detail || data.length === 0) return null;

  // Find the year where employment drops significantly (>5% below baseline)
  const triggerAnnotation = data.find(
    (d) => d.baseline > 0 && (d.baseline - d.employment) / d.baseline > 0.05,
  );

  return (
    <Card title="Cluster Employment Over Time">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`clusterFill-${clusterId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
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

          <YAxis
            tick={{ fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatNumber(v, { compact: true })}
            width={56}
          />

          {/* Baseline reference line */}
          <ReferenceLine
            y={detail.baselineEmployment}
            stroke="#6B7280"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: 'Baseline',
              position: 'insideTopRight',
              fill: '#6B7280',
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />

          {/* Displacement onset marker */}
          {triggerAnnotation && (
            <ReferenceLine
              x={triggerAnnotation.year}
              stroke="#F97316"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: 'Displacement >5%',
                position: 'insideTopLeft',
                fill: '#F97316',
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          )}

          {/* Employment area */}
          <Area
            type="monotone"
            dataKey="employment"
            stroke={color}
            strokeWidth={2}
            fill={`url(#clusterFill-${clusterId})`}
            dot={false}
            activeDot={{
              r: 4,
              fill: color,
              stroke: '#080D18',
              strokeWidth: 2,
            }}
          />

          <Tooltip content={<ClusterTooltip baseline={detail.baselineEmployment} />} />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-[2px] rounded-full" style={{ background: color }} />
          <span className="text-text-muted text-[10px] font-mono">Employment</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0 border-t border-dashed border-neutral" />
          <span className="text-text-muted text-[10px] font-mono">Baseline</span>
        </div>
      </div>
    </Card>
  );
}

function ClusterTooltip({
  active,
  payload,
  label,
  baseline,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
  baseline: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const employment = payload.find((p) => p.dataKey === 'employment');
  if (!employment) return null;

  const change = baseline > 0
    ? ((employment.value - baseline) / baseline) * 100
    : 0;

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">
        {label}
      </div>
      <div className="flex items-center gap-2 text-[12px]">
        <span className="text-text-secondary">Employment</span>
        <span className="font-mono text-text-primary ml-auto">
          {formatNumber(employment.value, { compact: true })}
        </span>
      </div>
      <div className="flex items-center gap-2 text-[11px] mt-1">
        <span className="text-text-muted">vs Baseline</span>
        <span
          className={`font-mono ml-auto ${
            change < -5 ? 'text-critical' : change < 0 ? 'text-caution' : 'text-text-secondary'
          }`}
        >
          {change > 0 ? '+' : ''}{change.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
