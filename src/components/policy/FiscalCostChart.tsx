/**
 * ATLAS Fiscal Cost Chart (Phase 5)
 *
 * Single area chart showing fiscal cost as % of GDP over time.
 * Gold fill with gradient, pattern matching EmploymentChart.
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
import { usePolicyTimeSeries } from '@/hooks/usePolicyData';
import { useCurrentYear } from '@/hooks/useSimulation';
import { formatPercent } from '@/utils/format';

export function FiscalCostChart() {
  const data = usePolicyTimeSeries();
  const currentYear = useCurrentYear();

  return (
    <Card title="Fiscal Cost as % of GDP">
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="fiscalCostFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4A03C" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#D4A03C" stopOpacity={0.02} />
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
            tickFormatter={(v: number) => formatPercent(v, 1)}
            width={48}
          />

          <ReferenceLine
            x={currentYear}
            stroke="rgba(232, 236, 244, 0.3)"
            strokeWidth={1}
          />

          <Area
            type="monotone"
            dataKey="fiscalCostGDP"
            stroke="#D4A03C"
            strokeWidth={2}
            fill="url(#fiscalCostFill)"
            dot={false}
            activeDot={{
              r: 4,
              fill: '#D4A03C',
              stroke: '#080D18',
              strokeWidth: 2,
            }}
          />

          <Tooltip content={<FiscalTooltip />} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

function FiscalTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const cost = payload.find((p) => p.dataKey === 'fiscalCostGDP');

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {cost && (
        <div className="flex items-center gap-2 text-[12px]">
          <div className="w-2 h-2 rounded-full bg-gold" />
          <span className="text-text-secondary">Fiscal Cost</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatPercent(cost.value)}
          </span>
        </div>
      )}
    </div>
  );
}
