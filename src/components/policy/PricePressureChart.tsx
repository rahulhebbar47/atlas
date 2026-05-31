/**
 * ATLAS Price Pressure Chart (Phase 5 Cleanup)
 *
 * Area chart showing AI deflation (below zero, teal) vs transfer inflation
 * (above zero, coral) with net price change line (gold).
 */

import {
  ComposedChart, Area, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { usePricePressureData } from '@/hooks/usePolicyData';
import { useCurrentYear } from '@/hooks/useSimulation';
import { formatPercent } from '@/utils/format';

export function PricePressureChart() {
  const data = usePricePressureData();
  const currentYear = useCurrentYear();

  return (
    <Card title="Price Pressure Balance">
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="deflationFill" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#14B8A6" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="inflationFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F97316" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#F97316" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="2 6" stroke="rgba(138, 150, 173, 0.06)" vertical={false} />

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
            tickFormatter={(v: number) => formatPercent(v, 1)}
            width={48}
          />

          {/* Zero line */}
          <ReferenceLine y={0} stroke="rgba(138, 150, 173, 0.3)" strokeWidth={1} />

          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} />

          {/* AI Deflation — below zero (teal) */}
          <Area
            type="monotone"
            dataKey="aiDeflation"
            stroke="#14B8A6"
            strokeWidth={1.5}
            fill="url(#deflationFill)"
            dot={false}
          />

          {/* Transfer Inflation — above zero (coral) */}
          <Area
            type="monotone"
            dataKey="transferInflation"
            stroke="#F97316"
            strokeWidth={1.5}
            fill="url(#inflationFill)"
            dot={false}
          />

          {/* Net price change line (gold) */}
          <Line
            type="monotone"
            dataKey="netPriceChange"
            stroke="#D4A03C"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#D4A03C', stroke: '#080D18', strokeWidth: 2 }}
          />

          <Tooltip content={<PricePressureTooltip />} />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-6 mt-3 pl-16">
        <LegendItem color="#14B8A6" label="AI Deflation" />
        <LegendItem color="#F97316" label="Transfer Inflation" />
        <LegendItem color="#D4A03C" label="Net Price Change" />
      </div>
    </Card>
  );
}

function PricePressureTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload) return null;

  const deflation = payload.find((p) => p.dataKey === 'aiDeflation');
  const inflation = payload.find((p) => p.dataKey === 'transferInflation');
  const net = payload.find((p) => p.dataKey === 'netPriceChange');

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {deflation && (
        <div className="flex items-center gap-2 text-[12px]">
          <div className="w-2 h-2 rounded-full" style={{ background: '#14B8A6' }} />
          <span className="text-text-secondary">AI Deflation</span>
          <span className="font-mono text-text-primary ml-auto">{formatPercent(deflation.value, 2)}</span>
        </div>
      )}
      {inflation && (
        <div className="flex items-center gap-2 text-[12px] mt-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: '#F97316' }} />
          <span className="text-text-secondary">Transfer Inflation</span>
          <span className="font-mono text-text-primary ml-auto">{formatPercent(inflation.value, 2)}</span>
        </div>
      )}
      {net && (
        <div className="flex items-center gap-2 text-[12px] mt-1 pt-1 border-t border-border/50">
          <div className="w-2 h-2 rounded-full" style={{ background: '#D4A03C' }} />
          <span className="text-text-secondary">Net</span>
          <span className="font-mono text-text-primary ml-auto">{formatPercent(net.value, 2)}</span>
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="text-text-muted text-[10px] font-mono">{label}</span>
    </div>
  );
}
