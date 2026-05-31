/**
 * DEPRECATED: Replaced by CWIComparisonChart.tsx in Phase 5 redesign.
 * This file is no longer imported — use CWIComparisonChart instead.
 *
 * Original: ARPP Comparison Chart — dual-line ARPP with/without policy.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { useNoPolicyCWIApproximation } from '@/hooks/usePolicyData';
import { usePolicyWindowInfo, useCurrentYear } from '@/hooks/useSimulation';
import { useSimulationStore } from '@/stores/simulationStore';
import { formatCurrency } from '@/utils/format';

export function ARPPComparisonChart() {
  const data = useNoPolicyCWIApproximation();
  const { fiscalWindowClose: tippingPointYear } = usePolicyWindowInfo();
  const currentYear = useCurrentYear();
  const endYear = useSimulationStore((s) => s.config.endYear);

  return (
    <Card title="CWI: With vs Without Policy">
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

          <YAxis
            tick={{ fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatCurrency(v, { compact: true })}
            width={64}
          />

          {/* Post-tipping point red zone */}
          {tippingPointYear !== null && (
            <ReferenceArea
              x1={tippingPointYear}
              x2={endYear}
              fill="#EF4444"
              fillOpacity={0.04}
            />
          )}

          {/* Tipping point marker */}
          {tippingPointYear !== null && (
            <ReferenceLine
              x={tippingPointYear}
              stroke="#EF4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: 'Tipping Point',
                position: 'insideTopRight',
                fill: '#EF4444',
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          )}

          {/* Current year indicator */}
          <ReferenceLine
            x={currentYear}
            stroke="rgba(232, 236, 244, 0.3)"
            strokeWidth={1}
          />

          {/* CWI Without Policy — dashed gray */}
          <Line
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

          {/* CWI With Policy — solid gold */}
          <Line
            type="monotone"
            dataKey="cwiWithPolicy"
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

          <Tooltip content={<ARPPTooltip />} />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-3 pl-16">
        <LegendItem color="#D4A03C" label="CWI (With Policy)" />
        <LegendItem color="#6B7280" label="CWI (No Policy)" dashed />
      </div>
    </Card>
  );
}

function ARPPTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const withPolicy = payload.find((p) => p.dataKey === 'cwiWithPolicy');
  const withoutPolicy = payload.find((p) => p.dataKey === 'cwiWithoutPolicy');
  const gap = withPolicy && withoutPolicy ? withPolicy.value - withoutPolicy.value : 0;

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {withPolicy && (
        <div className="flex items-center gap-2 text-[12px]">
          <div className="w-2 h-2 rounded-full" style={{ background: '#D4A03C' }} />
          <span className="text-text-secondary">With Policy</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatCurrency(withPolicy.value, { compact: true })}
          </span>
        </div>
      )}
      {withoutPolicy && (
        <div className="flex items-center gap-2 text-[12px] mt-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: '#6B7280' }} />
          <span className="text-text-secondary">No Policy</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatCurrency(withoutPolicy.value, { compact: true })}
          </span>
        </div>
      )}
      {gap > 0 && (
        <div className="flex items-center gap-2 text-[12px] mt-1 pt-1 border-t border-border/50">
          <span className="text-growth text-[11px] font-mono">
            Policy Impact: +{formatCurrency(gap, { compact: true })}
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
