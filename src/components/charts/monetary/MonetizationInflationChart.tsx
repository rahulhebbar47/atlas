/**
 * ATLAS Monetization & Inflation Chart
 *
 * Dual-axis composed chart:
 * - Left Y-axis (bars): monetization rate — what fraction of the deficit the Fed is
 *   absorbing by creating new money
 * - Right Y-axis (line): inflation contribution from that monetization
 *
 * This is the "printing press" chart. When the monetization rate climbs, inflation
 * from monetization follows with a lag — the visual makes the causal link obvious.
 */

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { formatPercent } from '@/utils/format';

interface MonetizationDataPoint {
  year: number;
  monetizationRate: number;
  inflationFromMonetization: number;
}

interface MonetizationInflationChartProps {
  data: MonetizationDataPoint[];
}

function MonetizationTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const rate = payload.find((p) => p.dataKey === 'monetizationRate');
  const inflation = payload.find((p) => p.dataKey === 'inflationFromMonetization');

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {rate && (
        <div className="flex items-center gap-2 text-[12px] mt-1">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#6366F1' }} />
          <span className="text-text-secondary">Monetization Rate</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatPercent(rate.value)}
          </span>
        </div>
      )}
      {inflation && (
        <div className="flex items-center gap-2 text-[12px] mt-1">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#EF4444' }} />
          <span className="text-text-secondary">Inflation from Monetization</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatPercent(inflation.value)}
          </span>
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label, type = 'line' }: { color: string; label: string; type?: 'line' | 'bar' }) {
  return (
    <div className="flex items-center gap-2">
      {type === 'bar' ? (
        <div className="w-3 h-2 rounded-[2px]" style={{ background: color, opacity: 0.7 }} />
      ) : (
        <div className="w-4 h-0 relative">
          <div className="absolute inset-x-0 top-1/2 h-[2px]" style={{ background: color }} />
        </div>
      )}
      <span className="text-text-muted text-[10px] font-mono">{label}</span>
    </div>
  );
}

export default function MonetizationInflationChart({ data }: MonetizationInflationChartProps) {
  return (
    <Card title="Monetization & Inflation">
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="2 6"
            stroke="rgba(138, 150, 173, 0.06)"
            vertical={false}
          />

          <XAxis
            dataKey="year"
            tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={{ stroke: '#1E293B' }}
            tickLine={false}
            ticks={[2025, 2030, 2035, 2040, 2045, 2050]}
          />

          {/* Left Y-axis: Monetization Rate */}
          <YAxis
            yAxisId="monetization"
            tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatPercent(v, 0)}
            width={48}
            label={{
              value: 'Monetization Rate',
              angle: -90,
              position: 'insideLeft',
              fill: '#94A3B8',
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              offset: -2,
            }}
          />

          {/* Right Y-axis: Inflation from Monetization */}
          <YAxis
            yAxisId="inflation"
            orientation="right"
            tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatPercent(v, 0)}
            width={48}
            label={{
              value: 'Inflation from Monetization',
              angle: 90,
              position: 'insideRight',
              fill: '#94A3B8',
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              offset: -2,
            }}
          />

          {/* Monetization rate bars (indigo) */}
          <Bar
            yAxisId="monetization"
            dataKey="monetizationRate"
            fill="#6366F1"
            fillOpacity={0.6}
            radius={[2, 2, 0, 0]}
          />

          {/* Inflation from monetization line (red) */}
          <Line
            yAxisId="inflation"
            type="monotone"
            dataKey="inflationFromMonetization"
            stroke="#EF4444"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: '#EF4444',
              stroke: '#080D18',
              strokeWidth: 2,
            }}
          />

          <Tooltip content={<MonetizationTooltip />} />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-5 mt-3 pl-16 flex-wrap">
        <LegendItem color="#6366F1" label="Monetization Rate" type="bar" />
        <LegendItem color="#EF4444" label="Inflation from Monetization" />
      </div>
    </Card>
  );
}
