/**
 * ATLAS Income Composition Chart (Overview)
 *
 * Stacked area chart showing the three income channels over time
 * in nominal dollars. The collapse of the gold wage band is the
 * visual gut punch — by 2040, wages are a sliver.
 *
 * Stack order (bottom to top): Wages, Transfers, Assets
 */

import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { POLICY_CHANNEL_COLORS } from '@/models/constants';
import { useIncomeCompositionAbsolute } from '@/hooks/useEconomicsData';
import { useCurrentYear } from '@/hooks/useSimulation';
import { formatCurrency, formatPercent } from '@/utils/format';

const AXIS_TICK = { fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" };
const GRID_STYLE = { strokeDasharray: '2 6', stroke: 'rgba(138, 150, 173, 0.06)' };

// Use shared policy channel colors for consistency with Economics view
const WAGE_COLOR = POLICY_CHANNEL_COLORS.wage;
const TRANSFER_COLOR = POLICY_CHANNEL_COLORS.transfer;
const ASSET_COLOR = POLICY_CHANNEL_COLORS.asset;

export function IncomeCompositionOverviewChart() {
  const data = useIncomeCompositionAbsolute();
  const currentYear = useCurrentYear();

  return (
    <Card title="Income Composition">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="ovw-wageFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={WAGE_COLOR} stopOpacity={0.3} />
              <stop offset="100%" stopColor={WAGE_COLOR} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="ovw-transferFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={TRANSFER_COLOR} stopOpacity={0.3} />
              <stop offset="100%" stopColor={TRANSFER_COLOR} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="ovw-assetFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ASSET_COLOR} stopOpacity={0.3} />
              <stop offset="100%" stopColor={ASSET_COLOR} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="year" tick={AXIS_TICK} axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }} tickLine={false} ticks={[2025, 2030, 2035, 2040, 2045, 2050]} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCurrency(v, { compact: true })} width={64} />
          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} />

          {/* Stack order: wages (bottom), transfers (middle), assets (top) */}
          <Area type="monotone" dataKey="wages" stackId="income" stroke={WAGE_COLOR} strokeWidth={1} fill="url(#ovw-wageFill)" dot={false} />
          <Area type="monotone" dataKey="transfers" stackId="income" stroke={TRANSFER_COLOR} strokeWidth={1} fill="url(#ovw-transferFill)" dot={false} />
          <Area type="monotone" dataKey="assets" stackId="income" stroke={ASSET_COLOR} strokeWidth={1} fill="url(#ovw-assetFill)" dot={false} />

          <Tooltip content={<IncomeTooltip />} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 mt-3 pl-16">
        <LegendItem color={WAGE_COLOR} label="Wages" />
        <LegendItem color={TRANSFER_COLOR} label="Transfers" />
        <LegendItem color={ASSET_COLOR} label="Assets" />
      </div>
    </Card>
  );
}

function IncomeTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload: Record<string, number> }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  const items = [
    { key: 'wages', name: 'Wages', color: WAGE_COLOR, pctKey: 'wagesPct' },
    { key: 'transfers', name: 'Transfers', color: TRANSFER_COLOR, pctKey: 'transfersPct' },
    { key: 'assets', name: 'Assets', color: ASSET_COLOR, pctKey: 'assetsPct' },
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
      <div className="flex items-center gap-2 text-[12px] mt-1 pt-1 border-t border-border/50">
        <span className="text-text-secondary">Total</span>
        <span className="font-mono text-text-primary ml-auto">
          {formatCurrency(row['total'] ?? 0, { compact: true })}
        </span>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-[3px]" style={{ background: color, opacity: 0.5 }} />
      <span className="text-text-muted text-[10px] font-mono">{label}</span>
    </div>
  );
}
