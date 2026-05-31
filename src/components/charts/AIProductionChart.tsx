/**
 * ATLAS AI Production & Absorption Chart
 *
 * Extracted from EconomicsView for reuse in Overview.
 * Shows AI output potential (bars) vs demand absorption (lines).
 * The gap between potential and absorbed is the "demand gap" —
 * AI produces more than the economy can consume.
 */

import {
  ComposedChart, Line, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { useAIProductionData } from '@/hooks/useEconomicsData';
import { useCurrentYear } from '@/hooks/useSimulation';
import { formatCurrency } from '@/utils/format';

const AXIS_TICK = { fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" };
const GRID_STYLE = { strokeDasharray: '2 6', stroke: 'rgba(138, 150, 173, 0.06)' };

export function AIProductionChart() {
  const data = useAIProductionData();
  const currentYear = useCurrentYear();

  return (
    <Card title="AI Production & Absorption">
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 0 }}>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="year" tick={AXIS_TICK} axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }} tickLine={false} ticks={[2025, 2030, 2035, 2040, 2045, 2050]} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCurrency(v, { compact: true })} width={64} />
          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} />

          <Bar dataKey="aiAdditionalOutput" fill="rgba(212, 160, 60, 0.15)" stroke="#D4A03C" strokeWidth={0.5} name="AI Output Potential" />
          <Line type="monotone" dataKey="aiGoodsAbsorbed" stroke="#22C55E" strokeWidth={2} dot={false} name="Goods Absorbed" />
          <Line type="monotone" dataKey="unrealizedAIOutput" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Unrealized Output" />

          <Tooltip content={<AIProductionTooltip />} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 mt-3 pl-16">
        <LegendItem color="#D4A03C" label="AI Output Potential" />
        <LegendItem color="#22C55E" label="Absorbed by Demand" />
        <LegendItem color="#EF4444" label="Unrealized" dashed />
      </div>
    </Card>
  );
}

function AIProductionTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload) return null;
  const meta: Record<string, { name: string; color: string }> = {
    aiAdditionalOutput: { name: 'AI Output', color: '#D4A03C' },
    aiGoodsAbsorbed: { name: 'Absorbed', color: '#22C55E' },
    unrealizedAIOutput: { name: 'Unrealized', color: '#EF4444' },
  };
  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {payload.map((p) => {
        const m = meta[p.dataKey];
        if (!m) return null;
        return (
          <div key={p.dataKey} className="flex items-center gap-2 text-[12px] mt-0.5">
            <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
            <span className="text-text-secondary">{m.name}</span>
            <span className="font-mono text-text-primary ml-auto">{formatCurrency(p.value, { compact: true })}</span>
          </div>
        );
      })}
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
