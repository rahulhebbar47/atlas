/**
 * ATLAS Employment Chart
 *
 * Total employment over time as area chart with unemployment rate overlay.
 * Tipping point shown as dashed red reference line.
 * Current year shown as white reference line.
 * Uses Recharts.
 */

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
import { useMacroTimeSeries, useCurrentYear } from '@/hooks/useSimulation';
import { formatNumber, formatPercent } from '@/utils/format';

export function EmploymentChart() {
  const data = useMacroTimeSeries();
  const currentYear = useCurrentYear();

  return (
    <Card title="Total Employment">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 48, left: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="employmentFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4A03C" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#D4A03C" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="unemploymentFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={0.15} />
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

          {/* Left Y-axis: Employment */}
          <YAxis
            yAxisId="employment"
            tick={{ fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatNumber(v, { compact: true })}
            width={56}
          />

          {/* Right Y-axis: Unemployment rate */}
          <YAxis
            yAxisId="unemployment"
            orientation="right"
            tick={{ fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatPercent(v, 0)}
            domain={[0, 'auto']}
            width={48}
          />

          {/* Current year indicator */}
          <ReferenceLine
            x={currentYear}
            yAxisId="employment"
            stroke="rgba(232, 236, 244, 0.3)"
            strokeWidth={1}
          />

          {/* Employment area */}
          <Area
            yAxisId="employment"
            type="monotone"
            dataKey="totalEmployment"
            stroke="#D4A03C"
            strokeWidth={2}
            fill="url(#employmentFill)"
            dot={false}
            activeDot={{
              r: 4,
              fill: '#D4A03C',
              stroke: '#080D18',
              strokeWidth: 2,
            }}
          />

          {/* Unemployment rate overlay */}
          <Area
            yAxisId="unemployment"
            type="monotone"
            dataKey="unemploymentRate"
            stroke="#EF4444"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            fill="url(#unemploymentFill)"
            dot={false}
            activeDot={{
              r: 3,
              fill: '#EF4444',
              stroke: '#080D18',
              strokeWidth: 2,
            }}
          />

          <Tooltip content={<EmploymentTooltip />} />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-3 pl-16">
        <LegendItem color="#D4A03C" label="Total Employment" />
        <LegendItem color="#EF4444" label="Unemployment Rate" dashed />
      </div>
    </Card>
  );
}

function EmploymentTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const employment = payload.find((p) => p.dataKey === 'totalEmployment');
  const unemployment = payload.find((p) => p.dataKey === 'unemploymentRate');

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">
        {label}
      </div>
      {employment && (
        <div className="flex items-center gap-2 text-[12px]">
          <div className="w-2 h-2 rounded-full bg-gold" />
          <span className="text-text-secondary">Employment</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatNumber(employment.value, { compact: true })}
          </span>
        </div>
      )}
      {unemployment && (
        <div className="flex items-center gap-2 text-[12px] mt-1">
          <div className="w-2 h-2 rounded-full bg-critical" />
          <span className="text-text-secondary">Unemployment</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatPercent(unemployment.value)}
          </span>
        </div>
      )}
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
