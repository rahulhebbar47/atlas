/**
 * ATLAS GDP Composition Chart (Overview)
 *
 * Stacked area of C + I + G as % of GDP, plus NX as a separate line.
 * The story: consumption was 3/4 of GDP. By 2040, investment is larger
 * than consumption. This is a "capital economy" — GDP grows by building
 * AI infrastructure, not by people buying things.
 *
 * NX is shown as a separate line because it can be negative (trade deficit).
 */

import {
  ComposedChart, Area, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { useGDPComposition } from '@/hooks/useEconomicsData';
import { useCurrentYear } from '@/hooks/useSimulation';
import { formatCurrency, formatPercent } from '@/utils/format';

const AXIS_TICK = { fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" };
const GRID_STYLE = { strokeDasharray: '2 6', stroke: 'rgba(138, 150, 173, 0.06)' };

const C_COLOR = '#D4A03C';   // gold/amber — consumption
const I_COLOR = '#6366F1';   // indigo — investment
const G_COLOR = '#14B8A6';   // teal — government
const NX_COLOR = '#8A96AD';  // muted gray — net exports

export function GDPCompositionChart() {
  const data = useGDPComposition();
  const currentYear = useCurrentYear();

  return (
    <Card title="GDP Composition">
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="gdp-cFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C_COLOR} stopOpacity={0.25} />
              <stop offset="100%" stopColor={C_COLOR} stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="gdp-iFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={I_COLOR} stopOpacity={0.25} />
              <stop offset="100%" stopColor={I_COLOR} stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="gdp-gFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={G_COLOR} stopOpacity={0.25} />
              <stop offset="100%" stopColor={G_COLOR} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="year" tick={AXIS_TICK} axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }} tickLine={false} ticks={[2025, 2030, 2035, 2040, 2045, 2050]} />
          <YAxis
            yAxisId="pct"
            tick={AXIS_TICK} axisLine={false} tickLine={false}
            tickFormatter={(v: number) => formatPercent(v, 0)}
            domain={[0, 'auto']}
            width={48}
          />
          <YAxis
            yAxisId="nxPct"
            orientation="right"
            tick={AXIS_TICK} axisLine={false} tickLine={false}
            tickFormatter={(v: number) => formatPercent(v, 0)}
            width={48}
          />
          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} yAxisId="pct" />

          {/* Stacked area: C + I + G as % of GDP */}
          <Area yAxisId="pct" type="monotone" dataKey="consumptionPct" stackId="gdp" stroke={C_COLOR} strokeWidth={1} fill="url(#gdp-cFill)" dot={false} />
          <Area yAxisId="pct" type="monotone" dataKey="investmentPct" stackId="gdp" stroke={I_COLOR} strokeWidth={1} fill="url(#gdp-iFill)" dot={false} />
          <Area yAxisId="pct" type="monotone" dataKey="governmentPct" stackId="gdp" stroke={G_COLOR} strokeWidth={1} fill="url(#gdp-gFill)" dot={false} />

          {/* NX as separate line (can be negative) */}
          <Line yAxisId="nxPct" type="monotone" dataKey="netExportsPct" stroke={NX_COLOR} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />

          <Tooltip content={<GDPCompTooltip />} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 mt-3 pl-16">
        <LegendItem color={C_COLOR} label="Consumption" area />
        <LegendItem color={I_COLOR} label="Investment" area />
        <LegendItem color={G_COLOR} label="Government" area />
        <LegendItem color={NX_COLOR} label="Net Exports" dashed />
      </div>
    </Card>
  );
}

function GDPCompTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload: Record<string, number> }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  const items = [
    { key: 'consumption', pctKey: 'consumptionPct', name: 'Consumption', color: C_COLOR },
    { key: 'investment', pctKey: 'investmentPct', name: 'Investment', color: I_COLOR },
    { key: 'government', pctKey: 'governmentPct', name: 'Government', color: G_COLOR },
    { key: 'netExports', pctKey: 'netExportsPct', name: 'Net Exports', color: NX_COLOR },
  ];

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-2 text-[12px] mt-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
          <span className="text-text-secondary">{item.name}</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatCurrency(row[item.key] ?? 0, { compact: true })}
          </span>
          <span className="font-mono text-text-muted text-[10px] w-10 text-right">
            {formatPercent(row[item.pctKey] ?? 0, 0)}
          </span>
        </div>
      ))}
    </div>
  );
}

function LegendItem({ color, label, dashed = false, area = false }: { color: string; label: string; dashed?: boolean; area?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {area ? (
        <div className="w-3 h-3 rounded-[3px]" style={{ background: color, opacity: 0.5 }} />
      ) : (
        <div className="w-4 h-0 relative">
          <div
            className="absolute inset-x-0 top-1/2 h-[2px]"
            style={{
              background: dashed ? 'none' : color,
              borderTop: dashed ? `2px dashed ${color}` : 'none',
            }}
          />
        </div>
      )}
      <span className="text-text-muted text-[10px] font-mono">{label}</span>
    </div>
  );
}
