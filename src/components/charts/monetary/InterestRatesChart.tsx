/**
 * ATLAS Interest Rates Chart
 *
 * Multi-line chart showing three key interest rate series:
 * - Taylor-prescribed rate (what the Fed "should" set per the Taylor Rule)
 * - Policy rate (what the Fed actually sets, potentially constrained by fiscal dominance)
 * - 10-year Treasury yield (market-determined long rate)
 *
 * A shaded area between Taylor and policy rates highlights the fiscal dominance gap --
 * when the Fed cannot raise rates as fast as the Taylor Rule prescribes because doing
 * so would detonate the fiscal position.
 */

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { formatPercent } from '@/utils/format';

interface InterestRatesDataPoint {
  year: number;
  taylorPrescribedRate: number;
  policyRate: number;
  tenYearYield: number;
}

interface InterestRatesChartProps {
  data: InterestRatesDataPoint[];
}

function InterestRatesTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const taylor = payload.find((p) => p.dataKey === 'taylorPrescribedRate');
  const policy = payload.find((p) => p.dataKey === 'policyRate');
  const tenY = payload.find((p) => p.dataKey === 'tenYearYield');

  const gap = taylor && policy ? taylor.value - policy.value : 0;

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {taylor && (
        <div className="flex items-center gap-2 text-[12px] mt-1">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#94A3B8' }} />
          <span className="text-text-secondary">Taylor Rule</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatPercent(taylor.value)}
          </span>
        </div>
      )}
      {policy && (
        <div className="flex items-center gap-2 text-[12px] mt-1">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#3B82F6' }} />
          <span className="text-text-secondary">Policy Rate</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatPercent(policy.value)}
          </span>
        </div>
      )}
      {tenY && (
        <div className="flex items-center gap-2 text-[12px] mt-1">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#D4A03C' }} />
          <span className="text-text-secondary">10Y Yield</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatPercent(tenY.value)}
          </span>
        </div>
      )}
      {gap > 0.001 && (
        <div className="flex items-center gap-2 text-[11px] mt-1.5 pt-1.5 border-t border-border">
          <span className="text-caution">Fiscal Dominance Gap</span>
          <span className="font-mono text-caution ml-auto">
            {formatPercent(gap)}
          </span>
        </div>
      )}
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

export default function InterestRatesChart({ data }: InterestRatesChartProps) {
  return (
    <Card title="Interest Rates & Fiscal Dominance">
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="fiscalDominanceGap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.03} />
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
            tickFormatter={(v: number) => formatPercent(v, 0)}
            width={48}
          />

          {/* Fiscal dominance gap shading: area between Taylor and Policy rate */}
          <Area
            type="monotone"
            dataKey="taylorPrescribedRate"
            stroke="none"
            fill="url(#fiscalDominanceGap)"
            dot={false}
            activeDot={false}
          />
          <Area
            type="monotone"
            dataKey="policyRate"
            stroke="none"
            fill="#0C1424"
            dot={false}
            activeDot={false}
          />

          {/* Taylor-prescribed rate (dashed gray) */}
          <Line
            type="monotone"
            dataKey="taylorPrescribedRate"
            stroke="#94A3B8"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            activeDot={{
              r: 3,
              fill: '#94A3B8',
              stroke: '#080D18',
              strokeWidth: 2,
            }}
          />

          {/* Policy rate (blue) */}
          <Line
            type="monotone"
            dataKey="policyRate"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: '#3B82F6',
              stroke: '#080D18',
              strokeWidth: 2,
            }}
          />

          {/* 10Y yield (gold) */}
          <Line
            type="monotone"
            dataKey="tenYearYield"
            stroke="#D4A03C"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: '#D4A03C',
              stroke: '#080D18',
              strokeWidth: 2,
            }}
          />

          <Tooltip content={<InterestRatesTooltip />} />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-5 mt-3 pl-16 flex-wrap">
        <LegendItem color="#94A3B8" label="Taylor Rule" dashed />
        <LegendItem color="#3B82F6" label="Policy Rate" />
        <LegendItem color="#D4A03C" label="10Y Yield" />
      </div>
    </Card>
  );
}
