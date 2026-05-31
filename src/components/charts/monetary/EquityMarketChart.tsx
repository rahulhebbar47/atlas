/**
 * ATLAS Equity Market Chart
 *
 * Dual-axis composed chart:
 * - Left Y-axis (area): aggregate market capitalization in dollars
 * - Right Y-axis (line): price/earnings ratio
 *
 * AI-driven productivity can balloon corporate profits and market cap, but
 * if demand collapses the P/E ratio tells the valuation story. This chart
 * shows whether markets are pricing in a genuine productivity miracle or
 * a speculative bubble detached from real purchasing power.
 */

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { formatCurrency } from '@/utils/format';

interface EquityDataPoint {
  year: number;
  aggregateMarketCap: number;
  peRatio: number;
}

interface EquityMarketChartProps {
  data: EquityDataPoint[];
}

function EquityTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const cap = payload.find((p) => p.dataKey === 'aggregateMarketCap');
  const pe = payload.find((p) => p.dataKey === 'peRatio');

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {cap && (
        <div className="flex items-center gap-2 text-[12px] mt-1">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#22C55E' }} />
          <span className="text-text-secondary">Market Cap</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatCurrency(cap.value, { compact: true })}
          </span>
        </div>
      )}
      {pe && (
        <div className="flex items-center gap-2 text-[12px] mt-1">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#D4A03C' }} />
          <span className="text-text-secondary">P/E Ratio</span>
          <span className="font-mono text-text-primary ml-auto">
            {pe.value.toFixed(1)}x
          </span>
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label, type = 'line' }: { color: string; label: string; type?: 'line' | 'area' }) {
  return (
    <div className="flex items-center gap-2">
      {type === 'area' ? (
        <div className="w-3 h-2 rounded-[2px]" style={{ background: color, opacity: 0.5 }} />
      ) : (
        <div className="w-4 h-0 relative">
          <div className="absolute inset-x-0 top-1/2 h-[2px]" style={{ background: color }} />
        </div>
      )}
      <span className="text-text-muted text-[10px] font-mono">{label}</span>
    </div>
  );
}

export default function EquityMarketChart({ data }: EquityMarketChartProps) {
  return (
    <Card title="Equity Market">
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="marketCapFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#22C55E" stopOpacity={0.02} />
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

          {/* Left Y-axis: Market Cap */}
          <YAxis
            yAxisId="cap"
            tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatCurrency(v, { compact: true })}
            width={64}
          />

          {/* Right Y-axis: P/E Ratio */}
          <YAxis
            yAxisId="pe"
            orientation="right"
            tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v.toFixed(0)}x`}
            width={48}
            label={{
              value: 'P/E Ratio',
              angle: 90,
              position: 'insideRight',
              fill: '#94A3B8',
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              offset: -2,
            }}
          />

          {/* Market capitalization area (green) */}
          <Area
            yAxisId="cap"
            type="monotone"
            dataKey="aggregateMarketCap"
            stroke="#22C55E"
            strokeWidth={2}
            fill="url(#marketCapFill)"
            dot={false}
            activeDot={{
              r: 4,
              fill: '#22C55E',
              stroke: '#080D18',
              strokeWidth: 2,
            }}
          />

          {/* P/E ratio line (gold) */}
          <Line
            yAxisId="pe"
            type="monotone"
            dataKey="peRatio"
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

          <Tooltip content={<EquityTooltip />} />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-5 mt-3 pl-16 flex-wrap">
        <LegendItem color="#22C55E" label="Market Cap" type="area" />
        <LegendItem color="#D4A03C" label="P/E Ratio" />
      </div>
    </Card>
  );
}
