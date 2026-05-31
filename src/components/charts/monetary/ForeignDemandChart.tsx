/**
 * ATLAS Foreign Demand Chart
 *
 * Line chart tracking the foreign demand ratio for US Treasury securities.
 * As fiscal conditions deteriorate, foreign central banks and sovereign
 * wealth funds reduce their Treasury allocations, forcing more domestic
 * absorption (or monetization).
 *
 * This is a leading indicator: when foreign demand drops below ~40%,
 * the Fed is increasingly the "buyer of last resort."
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { formatPercent } from '@/utils/format';

interface ForeignDemandDataPoint {
  year: number;
  foreignDemandRatio: number;
}

interface ForeignDemandChartProps {
  data: ForeignDemandDataPoint[];
}

function ForeignDemandTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const demand = payload.find((p) => p.dataKey === 'foreignDemandRatio');
  if (!demand) return null;

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      <div className="flex items-center gap-2 text-[12px]">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#06B6D4' }} />
        <span className="text-text-secondary">Foreign Demand</span>
        <span className="font-mono text-text-primary ml-auto">
          {formatPercent(demand.value)}
        </span>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-0 relative">
        <div className="absolute inset-x-0 top-1/2 h-[2px]" style={{ background: color }} />
      </div>
      <span className="text-text-muted text-[10px] font-mono">{label}</span>
    </div>
  );
}

export default function ForeignDemandChart({ data }: ForeignDemandChartProps) {
  return (
    <Card title="Foreign Treasury Demand">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="foreignDemandFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.02} />
            </linearGradient>
          </defs>

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

          <YAxis
            tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatPercent(v, 0)}
            domain={[0, 1]}
            width={48}
          />

          <Line
            type="monotone"
            dataKey="foreignDemandRatio"
            stroke="#06B6D4"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: '#06B6D4',
              stroke: '#080D18',
              strokeWidth: 2,
            }}
          />

          <Tooltip content={<ForeignDemandTooltip />} />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-5 mt-3 pl-16 flex-wrap">
        <LegendItem color="#06B6D4" label="Foreign Demand Ratio" />
      </div>
    </Card>
  );
}
