/**
 * ATLAS GDP & ARPP Chart
 *
 * Dual-line chart showing GDP and ARPP trajectories with tipping point
 * annotation. Post-tipping region has a subtle red background tint.
 * Uses Recharts.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { useMacroTimeSeries, useCurrentYear } from '@/hooks/useSimulation';
import { usePolicyActive } from '@/hooks/usePolicyData';
import { formatCurrency } from '@/utils/format';

export function GDPChart() {
  const data = useMacroTimeSeries();
  const currentYear = useCurrentYear();
  const policyActive = usePolicyActive();

  return (
    <Card title="GDP & Consumer Welfare Index">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 48, left: 8, bottom: 0 }}
        >
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

          {/* Left Y-axis: GDP — use 'dataMin' to show meaningful
              variation instead of starting from 0, which would compress $29T of data
              into a near-flat line */}
          <YAxis
            yAxisId="gdp"
            tick={{ fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatCurrency(v, { compact: true })}
            width={64}
            domain={['dataMin', 'auto']}
          />

          {/* Right Y-axis: CWI — same domain fix */}
          <YAxis
            yAxisId="cwi"
            orientation="right"
            tick={{ fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatCurrency(v, { compact: true })}
            width={64}
            domain={['dataMin', 'auto']}
          />

          {/* Current year indicator */}
          <ReferenceLine
            x={currentYear}
            yAxisId="gdp"
            stroke="rgba(232, 236, 244, 0.3)"
            strokeWidth={1}
          />

          {/* GDP line */}
          <Line
            yAxisId="gdp"
            type="monotone"
            dataKey="gdpNominal"
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

          {/* CWI line */}
          <Line
            yAxisId="cwi"
            type="monotone"
            dataKey="consumerWelfareIndex"
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

          {/* CWI Without Policy — only shown when policy is active */}
          {policyActive && (
            <Line
              yAxisId="cwi"
              type="monotone"
              dataKey="cwiWithoutPolicy"
              stroke="#6B7280"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{
                r: 3,
                fill: '#6B7280',
                stroke: '#080D18',
                strokeWidth: 2,
              }}
            />
          )}

          <Tooltip content={<GDPTooltip policyActive={policyActive} />} />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-3 pl-16">
        <LegendItem color="#3B82F6" label="GDP (Nominal)" />
        <LegendItem color="#D4A03C" label="CWI" />
        {policyActive && <LegendItem color="#6B7280" label="CWI (No Policy)" dashed />}
      </div>
    </Card>
  );
}

function GDPTooltip({ active, payload, label, policyActive }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
  policyActive?: boolean;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const gdp = payload.find((p) => p.dataKey === 'gdpNominal');
  const cwi = payload.find((p) => p.dataKey === 'consumerWelfareIndex');
  const cwiNoPolicy = payload.find((p) => p.dataKey === 'cwiWithoutPolicy');

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">
        {label}
      </div>
      {gdp && (
        <div className="flex items-center gap-2 text-[12px]">
          <div className="w-2 h-2 rounded-full" style={{ background: '#3B82F6' }} />
          <span className="text-text-secondary">GDP</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatCurrency(gdp.value, { compact: true })}
          </span>
        </div>
      )}
      {cwi && (
        <div className="flex items-center gap-2 text-[12px] mt-1">
          <div className="w-2 h-2 rounded-full" style={{ background: '#D4A03C' }} />
          <span className="text-text-secondary">CWI</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatCurrency(cwi.value, { compact: true })}
          </span>
        </div>
      )}
      {policyActive && cwiNoPolicy && (
        <div className="flex items-center gap-2 text-[12px] mt-1">
          <div className="w-2 h-2 rounded-full" style={{ background: '#6B7280' }} />
          <span className="text-text-secondary">No Policy</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatCurrency(cwiNoPolicy.value, { compact: true })}
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
