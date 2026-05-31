/**
 * ATLAS Income Composition Over Time (Phase 5)
 *
 * Stacked area chart showing wage/asset/transfer shares over time.
 * Pattern: EmploymentChart.tsx — Card wrapper, ResponsiveContainer h=300,
 * dark theme tooltip, tipping point + current year reference lines.
 * Colors per POLICY_CHANNEL_COLORS.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { POLICY_CHANNEL_COLORS } from '@/models/constants';
import { useMacroTimeSeries, useCurrentYear } from '@/hooks/useSimulation';
import { formatPercent } from '@/utils/format';

export function IncomeCompositionTimeChart() {
  const data = useMacroTimeSeries();
  const currentYear = useCurrentYear();

  return (
    <Card title="Income Composition Over Time">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          stackOffset="expand"
          margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="wageFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={POLICY_CHANNEL_COLORS.wage} stopOpacity={0.3} />
              <stop offset="100%" stopColor={POLICY_CHANNEL_COLORS.wage} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="assetFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={POLICY_CHANNEL_COLORS.asset} stopOpacity={0.3} />
              <stop offset="100%" stopColor={POLICY_CHANNEL_COLORS.asset} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="transferFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={POLICY_CHANNEL_COLORS.transfer} stopOpacity={0.3} />
              <stop offset="100%" stopColor={POLICY_CHANNEL_COLORS.transfer} stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="2 6"
            stroke="rgba(138, 150, 173, 0.06)"
            vertical={false}
          />

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
            tickFormatter={(v: number) => formatPercent(v, 0)}
            domain={[0, 1]}
            width={48}
          />

          <ReferenceLine
            x={currentYear}
            stroke="rgba(232, 236, 244, 0.3)"
            strokeWidth={1}
          />

          <Area
            type="monotone"
            dataKey="incomeWageShare"
            stackId="income"
            stroke={POLICY_CHANNEL_COLORS.wage}
            strokeWidth={1}
            fill="url(#wageFill)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="incomeAssetShare"
            stackId="income"
            stroke={POLICY_CHANNEL_COLORS.asset}
            strokeWidth={1}
            fill="url(#assetFill)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="incomeTransferShare"
            stackId="income"
            stroke={POLICY_CHANNEL_COLORS.transfer}
            strokeWidth={1}
            fill="url(#transferFill)"
            dot={false}
          />

          <Tooltip content={<IncomeTooltip />} />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-3 pl-14">
        <LegendItem color={POLICY_CHANNEL_COLORS.wage} label="Wages" />
        <LegendItem color={POLICY_CHANNEL_COLORS.asset} label="Assets" />
        <LegendItem color={POLICY_CHANNEL_COLORS.transfer} label="Transfers" />
      </div>
    </Card>
  );
}

function IncomeTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const wage = payload.find((p) => p.dataKey === 'incomeWageShare');
  const asset = payload.find((p) => p.dataKey === 'incomeAssetShare');
  const transfer = payload.find((p) => p.dataKey === 'incomeTransferShare');

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {wage && <TooltipRow color={POLICY_CHANNEL_COLORS.wage} label="Wages" value={wage.value} />}
      {asset && <TooltipRow color={POLICY_CHANNEL_COLORS.asset} label="Assets" value={asset.value} />}
      {transfer && <TooltipRow color={POLICY_CHANNEL_COLORS.transfer} label="Transfers" value={transfer.value} />}
    </div>
  );
}

function TooltipRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-[12px] mt-0.5">
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="text-text-secondary">{label}</span>
      <span className="font-mono text-text-primary ml-auto">{formatPercent(value)}</span>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-[2px] rounded-full" style={{ background: color }} />
      <span className="text-text-muted text-[10px] font-mono">{label}</span>
    </div>
  );
}
