/**
 * ATLAS Price Level Decomposition Chart (Overview)
 *
 * Three price indices diverging over time, telling the story of AI
 * deflating goods while shelter remains sticky (until housing crisis).
 * All indexed to 1.0 at 2025 baseline.
 */

import { useMemo } from 'react';
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { usePriceLevelDecomposition } from '@/hooks/useEconomicsData';
import { useCurrentYear } from '@/hooks/useSimulation';
import { useSimulationStore } from '@/stores/simulationStore';

const AXIS_TICK = { fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" };
const GRID_STYLE = { strokeDasharray: '2 6', stroke: 'rgba(138, 150, 173, 0.06)' };

const GOODS_COLOR = '#60A5FA';    // blue
const SHELTER_COLOR = '#F59E0B';  // amber/orange
const COMPOSITE_COLOR = '#34D399'; // green

export function PriceLevelChart() {
  const rawData = usePriceLevelDecomposition();
  const currentYear = useCurrentYear();
  const baselineTimeline = useSimulationStore((s) => s.baselineTimeline);

  // Merge baseline composite price level into chart data
  const data = useMemo(() => {
    if (!baselineTimeline) return rawData;
    const blMap = new Map(
      baselineTimeline.years.map((y) => [y.year, y.macro.priceLevel]),
    );
    return rawData.map((d) => ({
      ...d,
      baseline_compositePriceLevel: blMap.get(d.year),
    }));
  }, [rawData, baselineTimeline]);

  return (
    <Card title="Price Level Decomposition">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 0 }}>
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
            tickFormatter={(v: number) => v.toFixed(2)}
            width={48}
          />

          <ReferenceLine y={1.0} stroke="rgba(232, 236, 244, 0.15)" strokeWidth={1} strokeDasharray="4 4" />
          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} />

          <Line
            type="monotone"
            dataKey="goodsPriceLevel"
            stroke={GOODS_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: GOODS_COLOR, stroke: '#080D18', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="shelterPriceLevel"
            stroke={SHELTER_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: SHELTER_COLOR, stroke: '#080D18', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="compositePriceLevel"
            stroke={COMPOSITE_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: COMPOSITE_COLOR, stroke: '#080D18', strokeWidth: 2 }}
          />

          {/* Baseline ghost line — autopilot composite price level */}
          {baselineTimeline && (
            <Line
              type="monotone"
              dataKey="baseline_compositePriceLevel"
              stroke="#6B7280"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              strokeOpacity={0.5}
              dot={false}
              activeDot={false}
            />
          )}

          <Tooltip content={<PriceLevelTooltip />} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 mt-3 pl-16 flex-wrap">
        <LegendItem color={GOODS_COLOR} label="Goods" />
        <LegendItem color={SHELTER_COLOR} label="Shelter" />
        <LegendItem color={COMPOSITE_COLOR} label="Composite" />
        {baselineTimeline && <LegendItem color="#6B7280" label="Autopilot baseline" dashed />}
      </div>
    </Card>
  );
}

function PriceLevelTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload: Record<string, number> }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  const goods = row['goodsPriceLevel'] ?? 1;
  const shelter = row['shelterPriceLevel'] ?? 1;
  const composite = row['compositePriceLevel'] ?? 1;

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      <TooltipRow color={GOODS_COLOR} label="Goods" value={goods} />
      <TooltipRow color={SHELTER_COLOR} label="Shelter" value={shelter} />
      <TooltipRow color={COMPOSITE_COLOR} label="Composite" value={composite} />
    </div>
  );
}

function TooltipRow({ color, label, value }: { color: string; label: string; value: number }) {
  const pct = ((value - 1) * 100).toFixed(1);
  const sign = value >= 1 ? '+' : '';
  return (
    <div className="flex items-center gap-2 text-[12px] mt-0.5">
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="text-text-secondary">{label}</span>
      <span className="font-mono text-text-primary ml-auto">
        {value.toFixed(3)} <span className="text-text-muted">({sign}{pct}%)</span>
      </span>
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
            opacity: dashed ? 0.5 : 1,
          }}
        />
      </div>
      <span className="text-text-muted text-[10px] font-mono">{label}</span>
    </div>
  );
}
