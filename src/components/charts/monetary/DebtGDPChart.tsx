/**
 * ATLAS Debt/GDP Ratio Chart
 *
 * Line chart showing federal debt as a fraction of GDP over time.
 * Reference lines at 0.90 (Maastricht treaty threshold) and
 * 1.20 (fiscal risk midpoint) provide context for severity.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';

interface DebtGDPDataPoint {
  year: number;
  debtGDPRatio: number;
}

interface DebtGDPChartProps {
  data: DebtGDPDataPoint[];
}

function DebtGDPTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const ratio = payload.find((p) => p.dataKey === 'debtGDPRatio');
  if (!ratio) return null;

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      <div className="flex items-center gap-2 text-[12px]">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#EF4444' }} />
        <span className="text-text-secondary">Debt/GDP</span>
        <span className="font-mono text-text-primary ml-auto">
          {(ratio.value * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function LegendItem({ color, label, dashed = false }: { color: string; label: string; dashed?: boolean }) {
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

export default function DebtGDPChart({ data }: DebtGDPChartProps) {
  return (
    <Card title="Debt / GDP Ratio">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="debtGdpFill" x1="0" y1="0" x2="0" y2="1">
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
            tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={{ stroke: '#1E293B' }}
            tickLine={false}
            ticks={[2025, 2030, 2035, 2040, 2045, 2050]}
          />

          <YAxis
            tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
            width={56}
            label={{
              value: 'Debt/GDP Ratio',
              angle: -90,
              position: 'insideLeft',
              fill: '#94A3B8',
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              offset: -2,
            }}
          />

          {/* Maastricht threshold: 90% */}
          <ReferenceLine
            y={0.9}
            stroke="#F59E0B"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: '90% Maastricht',
              position: 'insideTopRight',
              fill: '#F59E0B',
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />

          {/* Fiscal risk midpoint: 120% */}
          <ReferenceLine
            y={1.2}
            stroke="#EF4444"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: '120% Fiscal Risk',
              position: 'insideTopRight',
              fill: '#EF4444',
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />

          <Line
            type="monotone"
            dataKey="debtGDPRatio"
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

          <Tooltip content={<DebtGDPTooltip />} />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-5 mt-3 pl-16 flex-wrap">
        <LegendItem color="#EF4444" label="Debt/GDP" />
        <LegendItem color="#F59E0B" label="90% Maastricht" dashed />
        <LegendItem color="#EF4444" label="120% Fiscal Risk" dashed />
      </div>
    </Card>
  );
}
