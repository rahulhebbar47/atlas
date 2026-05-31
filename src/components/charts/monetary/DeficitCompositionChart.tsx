/**
 * ATLAS Deficit Composition Chart
 *
 * Stacked area chart showing the two components of the total federal deficit:
 * - Primary deficit (spending minus revenue, excluding interest)
 * - Interest expense on outstanding debt
 *
 * As debt/GDP rises, interest expense can dominate — this chart makes that
 * structural shift visually obvious.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { formatCurrency } from '@/utils/format';

interface DeficitDataPoint {
  year: number;
  primaryDeficit: number;
  interestExpense: number;
}

interface DeficitCompositionChartProps {
  data: DeficitDataPoint[];
}

function DeficitTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const primary = payload.find((p) => p.dataKey === 'primaryDeficit');
  const interest = payload.find((p) => p.dataKey === 'interestExpense');
  const total = (primary?.value ?? 0) + (interest?.value ?? 0);

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {primary && (
        <div className="flex items-center gap-2 text-[12px] mt-1">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#F59E0B' }} />
          <span className="text-text-secondary">Primary Deficit</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatCurrency(primary.value, { compact: true })}
          </span>
        </div>
      )}
      {interest && (
        <div className="flex items-center gap-2 text-[12px] mt-1">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#EF4444' }} />
          <span className="text-text-secondary">Interest Expense</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatCurrency(interest.value, { compact: true })}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2 text-[11px] mt-1.5 pt-1.5 border-t border-border">
        <span className="text-text-muted">Total Deficit</span>
        <span className="font-mono text-text-primary ml-auto">
          {formatCurrency(total, { compact: true })}
        </span>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-2 rounded-[2px]" style={{ background: color, opacity: 0.7 }} />
      <span className="text-text-muted text-[10px] font-mono">{label}</span>
    </div>
  );
}

export default function DeficitCompositionChart({ data }: DeficitCompositionChartProps) {
  return (
    <Card title="Deficit Composition">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="primaryDeficitFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="interestExpenseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#EF4444" stopOpacity={0.05} />
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
            tickFormatter={(v: number) => formatCurrency(v, { compact: true })}
            width={64}
          />

          <Area
            type="monotone"
            dataKey="primaryDeficit"
            stackId="deficit"
            stroke="#F59E0B"
            strokeWidth={1.5}
            fill="url(#primaryDeficitFill)"
            dot={false}
            activeDot={{
              r: 3,
              fill: '#F59E0B',
              stroke: '#080D18',
              strokeWidth: 2,
            }}
          />

          <Area
            type="monotone"
            dataKey="interestExpense"
            stackId="deficit"
            stroke="#EF4444"
            strokeWidth={1.5}
            fill="url(#interestExpenseFill)"
            dot={false}
            activeDot={{
              r: 3,
              fill: '#EF4444',
              stroke: '#080D18',
              strokeWidth: 2,
            }}
          />

          <Tooltip content={<DeficitTooltip />} />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-5 mt-3 pl-16 flex-wrap">
        <LegendItem color="#F59E0B" label="Primary Deficit" />
        <LegendItem color="#EF4444" label="Interest Expense" />
      </div>
    </Card>
  );
}
