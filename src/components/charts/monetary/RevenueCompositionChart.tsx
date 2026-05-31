/**
 * ATLAS Revenue Composition Chart
 *
 * Stacked area chart showing the three components of total government revenue:
 * - Labor tax revenue (income + payroll) — erodes as employment drops
 * - Corporate tax revenue — may grow if AI boosts profits, but subject to profit realization
 * - Other revenue (excise, customs, fees) — derived as total minus labor minus corporate
 *
 * This chart tells the fiscal story: as AI displaces workers, the labor tax base
 * shrinks. If corporate taxes cannot compensate, deficits accelerate.
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

interface RevenueDataPoint {
  year: number;
  laborTaxRevenue: number;
  corporateTaxRevenue: number;
  otherRevenue: number;
}

interface RevenueCompositionChartProps {
  data: RevenueDataPoint[];
}

const COMPONENTS: Array<{
  key: keyof Omit<RevenueDataPoint, 'year'>;
  label: string;
  color: string;
}> = [
  { key: 'laborTaxRevenue', label: 'Labor Tax', color: '#3B82F6' },
  { key: 'corporateTaxRevenue', label: 'Corporate Tax', color: '#F59E0B' },
  { key: 'otherRevenue', label: 'Other Revenue', color: '#94A3B8' },
];

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  let total = 0;
  const rows = COMPONENTS.map((c) => {
    const entry = payload.find((p) => p.dataKey === c.key);
    const value = entry?.value ?? 0;
    total += value;
    return { ...c, value };
  });

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {rows.map((row) => (
        <div key={row.key} className="flex items-center gap-2 text-[12px] mt-1">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.color }} />
          <span className="text-text-secondary">{row.label}</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatCurrency(row.value, { compact: true })}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-2 text-[11px] mt-1.5 pt-1.5 border-t border-border">
        <span className="text-text-muted">Total Revenue</span>
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

export default function RevenueCompositionChart({ data }: RevenueCompositionChartProps) {
  return (
    <Card title="Government Revenue Composition">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <defs>
            {COMPONENTS.map((c) => (
              <linearGradient key={c.key} id={`revFill-${c.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={c.color} stopOpacity={0.05} />
              </linearGradient>
            ))}
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

          {COMPONENTS.map((c) => (
            <Area
              key={c.key}
              type="monotone"
              dataKey={c.key}
              stackId="revenue"
              stroke={c.color}
              strokeWidth={1}
              fill={`url(#revFill-${c.key})`}
              dot={false}
              activeDot={{
                r: 3,
                fill: c.color,
                stroke: '#080D18',
                strokeWidth: 2,
              }}
            />
          ))}

          <Tooltip content={<RevenueTooltip />} />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-5 mt-3 pl-16 flex-wrap">
        {COMPONENTS.map((c) => (
          <LegendItem key={c.key} color={c.color} label={c.label} />
        ))}
      </div>
    </Card>
  );
}
