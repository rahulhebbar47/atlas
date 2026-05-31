/**
 * ATLAS Price Decomposition Chart (Phase 5i Step 13)
 *
 * Stacked area showing inflation/deflation components:
 *   - Shelter inflation (amber)
 *   - Scarcity inflation (yellow)
 *   - Min wage cost-push (light blue)
 *   - Baseline inflation (gray)
 * Overlay lines:
 *   - Composite inflation (gold, bold)
 *   - Goods inflation (gray, dashed)
 * Reference line at y=0 to distinguish inflation from deflation.
 */

import {
  ComposedChart, Line, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { usePriceDecompositionData } from '@/hooks/useEconomicsData';
import { useCurrentYear } from '@/hooks/useSimulation';
import { formatPercent } from '@/utils/format';

const AXIS_TICK = { fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" };
const GRID_STYLE = { strokeDasharray: '2 6', stroke: 'rgba(138, 150, 173, 0.06)' };

const COLORS = {
  shelter: '#E07C24',
  aiDeflation: '#EF4444',
  baseline: '#6B7280',
  credit: '#1E3A5F',
  scarcity: '#EAB308',
  minWage: '#38BDF8',
  composite: '#D4A03C',
  goods: '#8B92A1',
} as const;

const TOOLTIP_META: Record<string, { label: string; color: string }> = {
  baseInflation: { label: 'Baseline Inflation', color: COLORS.baseline },
  aiDeflation: { label: 'AI Deflation', color: COLORS.aiDeflation },
  minWageCostPush: { label: 'Min Wage Cost-Push', color: COLORS.minWage },
  creditDeflation: { label: 'Credit Deflation', color: COLORS.credit },
  scarcityInflation: { label: 'Scarcity Inflation', color: COLORS.scarcity },
  shelterInflation: { label: 'Shelter Inflation', color: COLORS.shelter },
  goodsInflation: { label: 'Goods Inflation', color: COLORS.goods },
  compositeInflation: { label: 'Composite Inflation', color: COLORS.composite },
};

export function PriceDecompositionChart() {
  const data = usePriceDecompositionData();
  const currentYear = useCurrentYear();

  return (
    <Card title="Price Decomposition">
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 0 }}>
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
            tickFormatter={(v: number) => formatPercent(v, 1)}
            width={56}
          />
          <ReferenceLine y={0} stroke="rgba(138, 150, 173, 0.2)" strokeWidth={1} />
          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} />

          {/* Stacked positive-component areas */}
          <Area
            type="monotone"
            dataKey="baseInflation"
            stackId="price"
            stroke={COLORS.baseline}
            strokeWidth={0.5}
            fill={COLORS.baseline}
            fillOpacity={0.15}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="minWageCostPush"
            stackId="price"
            stroke={COLORS.minWage}
            strokeWidth={0.5}
            fill={COLORS.minWage}
            fillOpacity={0.2}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="scarcityInflation"
            stackId="price"
            stroke={COLORS.scarcity}
            strokeWidth={0.5}
            fill={COLORS.scarcity}
            fillOpacity={0.2}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="shelterInflation"
            stackId="price"
            stroke={COLORS.shelter}
            strokeWidth={0.5}
            fill={COLORS.shelter}
            fillOpacity={0.2}
            dot={false}
          />

          {/* Overlay lines */}
          <Line
            type="monotone"
            dataKey="compositeInflation"
            stroke={COLORS.composite}
            strokeWidth={2.5}
            dot={false}
            name="Composite Inflation"
          />
          <Line
            type="monotone"
            dataKey="goodsInflation"
            stroke={COLORS.goods}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            name="Goods Inflation"
          />

          <Tooltip content={<PriceDecompositionTooltip />} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 pl-14">
        <LegendItem color={COLORS.baseline} label="Baseline" />
        <LegendItem color={COLORS.minWage} label="Min Wage" />
        <LegendItem color={COLORS.scarcity} label="Scarcity" />
        <LegendItem color={COLORS.shelter} label="Shelter" />
        <LegendItem color={COLORS.composite} label="Composite" />
        <LegendItem color={COLORS.goods} label="Goods" dashed />
      </div>
    </Card>
  );
}

// ============================================================
// Tooltip
// ============================================================

function PriceDecompositionTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload) return null;

  // Show all data fields in a fixed order (not just what Recharts includes)
  const orderedKeys = [
    'shelterInflation',
    'scarcityInflation',
    'minWageCostPush',
    'baseInflation',
    'aiDeflation',
    'creditDeflation',
    'goodsInflation',
    'compositeInflation',
  ];

  // Build a lookup from the payload
  const valueMap = new Map<string, number>();
  for (const p of payload) {
    valueMap.set(p.dataKey, p.value);
  }

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {orderedKeys.map((key) => {
        const meta = TOOLTIP_META[key];
        const value = valueMap.get(key);
        if (!meta || value === undefined) return null;
        return (
          <div key={key} className="flex items-center gap-2 text-[12px] mt-0.5">
            <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
            <span className="text-text-secondary">{meta.label}</span>
            <span className="font-mono text-text-primary ml-auto">{formatPercent(value)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Legend Item (matches EconomicsView pattern)
// ============================================================

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
