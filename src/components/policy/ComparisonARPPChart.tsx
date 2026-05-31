/**
 * DEPRECATED: Renamed to ComparisonCWIChart.tsx in Phase 5 Cleanup.
 * This file is no longer imported — use ComparisonCWIChart instead.
 *
 * Original: Multi-line CWI chart with one line per comparison slot.
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
import { useMemo } from 'react';
import { Card } from '@/components/shared/Card';
import { useComparisonTimelines } from '@/hooks/useCompareMode';
import { useCurrentYear } from '@/hooks/useSimulation';
import { formatCurrency } from '@/utils/format';

const SLOT_COLORS = ['#D4A03C', '#3B82F6', '#10B981'];
const SLOT_WIDTHS = [2, 1.5, 1.5];
const SLOT_DASHES = ['', '6 3', '4 4'];

export function ComparisonARPPChart() {
  const slots = useComparisonTimelines();
  const currentYear = useCurrentYear();

  // Build unified data array keyed by year
  const data = useMemo(() => {
    if (slots.length === 0) return [];

    const yearMap = new Map<number, Record<string, number>>();
    slots.forEach((slot, idx) => {
      for (const yearOutput of slot.timeline.years) {
        const existing = yearMap.get(yearOutput.year) ?? { year: yearOutput.year };
        existing[`cwi_${idx}`] = yearOutput.macro.consumerWelfareIndex;
        yearMap.set(yearOutput.year, existing);
      }
    });

    return Array.from(yearMap.values()).sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
  }, [slots]);

  // Collect unique policy window close years
  const tippingPoints = useMemo(
    () => [...new Set(slots.map((s) => s.timeline.fiscalWindowClose).filter((y): y is number => y !== null))],
    [slots],
  );

  return (
    <Card title="CWI Comparison Across Scenarios">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 0 }}>
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

          {/* Tipping point markers */}
          {tippingPoints.map((tp) => (
            <ReferenceLine
              key={tp}
              x={tp}
              stroke="#EF4444"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          ))}

          <ReferenceLine
            x={currentYear}
            stroke="rgba(232, 236, 244, 0.3)"
            strokeWidth={1}
          />

          {/* One line per slot */}
          {slots.map((slot, idx) => (
            <Line
              key={idx}
              type="monotone"
              dataKey={`cwi_${idx}`}
              stroke={SLOT_COLORS[idx] ?? '#6B7280'}
              strokeWidth={SLOT_WIDTHS[idx] ?? 1.5}
              strokeDasharray={SLOT_DASHES[idx] ?? ''}
              dot={false}
              activeDot={{
                r: idx === 0 ? 4 : 3,
                fill: SLOT_COLORS[idx] ?? '#6B7280',
                stroke: '#080D18',
                strokeWidth: 2,
              }}
              name={slot.label}
            />
          ))}

          <Tooltip content={<ComparisonTooltip slots={slots} />} />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-3 pl-16">
        {slots.map((slot, idx) => (
          <LegendItem
            key={idx}
            color={SLOT_COLORS[idx] ?? '#6B7280'}
            label={slot.label}
            dashed={idx > 0}
          />
        ))}
      </div>
    </Card>
  );
}

function ComparisonTooltip({ active, payload, label, slots }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
  slots: Array<{ label: string }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {payload.map((p, idx) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-[12px] mt-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: SLOT_COLORS[idx] ?? '#6B7280' }} />
          <span className="text-text-secondary">{slots[idx]?.label ?? `Slot ${idx}`}</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatCurrency(p.value, { compact: true })}
          </span>
        </div>
      ))}
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
