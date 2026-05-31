/**
 * ATLAS Yield Decomposition Chart
 *
 * Stacked area chart decomposing the 10-year Treasury yield into its
 * constituent components:
 * - Expected average policy rate (blue) — the core rate expectation
 * - Term premium (slate) — compensation for duration risk
 * - Fiscal risk premium (amber) — debt sustainability risk
 * - Supply pressure premium (red) — excess issuance without enough buyers
 *
 * As AI-driven displacement erodes the tax base and deficits balloon,
 * the fiscal and supply premia can dominate the yield stack.
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
import { formatPercent } from '@/utils/format';

interface YieldDataPoint {
  year: number;
  expectedAveragePolicyRate: number;
  termPremium: number;
  fiscalRiskPremium: number;
  supplyPressurePremium: number;
}

interface YieldDecompositionChartProps {
  data: YieldDataPoint[];
}

const COMPONENTS: Array<{
  key: keyof Omit<YieldDataPoint, 'year'>;
  label: string;
  color: string;
}> = [
  { key: 'expectedAveragePolicyRate', label: 'Expected Policy Rate', color: '#3B82F6' },
  { key: 'termPremium', label: 'Term Premium', color: '#94A3B8' },
  { key: 'fiscalRiskPremium', label: 'Fiscal Risk Premium', color: '#F59E0B' },
  { key: 'supplyPressurePremium', label: 'Supply Pressure Premium', color: '#EF4444' },
];

function YieldTooltip({
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
            {formatPercent(row.value)}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-2 text-[11px] mt-1.5 pt-1.5 border-t border-border">
        <span className="text-text-muted">10Y Yield</span>
        <span className="font-mono text-text-primary ml-auto">
          {formatPercent(total)}
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

export default function YieldDecompositionChart({ data }: YieldDecompositionChartProps) {
  return (
    <Card title="10Y Yield Decomposition">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <defs>
            {COMPONENTS.map((c) => (
              <linearGradient key={c.key} id={`yieldFill-${c.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={c.color} stopOpacity={0.08} />
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
            tickFormatter={(v: number) => formatPercent(v, 0)}
            width={48}
          />

          {COMPONENTS.map((c) => (
            <Area
              key={c.key}
              type="monotone"
              dataKey={c.key}
              stackId="yield"
              stroke={c.color}
              strokeWidth={1}
              fill={`url(#yieldFill-${c.key})`}
              dot={false}
              activeDot={{
                r: 3,
                fill: c.color,
                stroke: '#080D18',
                strokeWidth: 2,
              }}
            />
          ))}

          <Tooltip content={<YieldTooltip />} />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-4 mt-3 pl-16 flex-wrap">
        {COMPONENTS.map((c) => (
          <LegendItem key={c.key} color={c.color} label={c.label} />
        ))}
      </div>
    </Card>
  );
}
