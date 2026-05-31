/**
 * ATLAS Comparison CWI Chart (Phase 5 Cleanup)
 *
 * Multi-line CWI chart with System + Median CWI per comparison slot.
 * System CWI uses slot color (solid for slot 0, dashed for 1-2).
 * Median CWI uses teal for all slots, differentiated by dash pattern per slot.
 *
 * Colors: System = slot color (gold/blue/emerald), Median = teal (#4ECDC4).
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
const TEAL = '#4ECDC4';
const MEDIAN_DASHES = ['3 3', '8 3 3 3', '2 4'];
const AXIS_TICK = { fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" };

export function ComparisonCWIChart() {
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
        existing[`median_${idx}`] = yearOutput.macro.medianCWI;
        yearMap.set(yearOutput.year, existing);
      }
    });

    return Array.from(yearMap.values()).sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
  }, [slots]);

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
            tick={AXIS_TICK}
            axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }}
            tickLine={false}
            ticks={[2025, 2030, 2035, 2040, 2045, 2050]}
          />

          <YAxis
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatCurrency(v, { compact: true })}
            width={64}
            domain={[0, 'auto']}
          />

          <ReferenceLine
            x={currentYear}
            stroke="rgba(232, 236, 244, 0.3)"
            strokeWidth={1}
          />

          {/* Median CWI lines — teal, thinner, behind system lines */}
          {slots.map((_, idx) => (
            <Line
              key={`median_${idx}`}
              type="monotone"
              dataKey={`median_${idx}`}
              stroke={TEAL}
              strokeWidth={idx === 0 ? 1.5 : 1}
              strokeDasharray={MEDIAN_DASHES[idx] ?? '3 3'}
              strokeOpacity={idx === 0 ? 0.8 : 0.5}
              dot={false}
              activeDot={{
                r: 3,
                fill: TEAL,
                stroke: '#080D18',
                strokeWidth: 2,
              }}
            />
          ))}

          {/* System CWI lines — slot color, primary */}
          {slots.map((slot, idx) => (
            <Line
              key={`cwi_${idx}`}
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
      <div className="flex items-center gap-x-6 gap-y-1 mt-3 pl-16 flex-wrap">
        {slots.map((slot, idx) => (
          <LegendItem
            key={`sys_${idx}`}
            color={SLOT_COLORS[idx] ?? '#6B7280'}
            label={`${slot.label} (System)`}
            dashed={idx > 0}
          />
        ))}
        <LegendItem color={TEAL} label="Median CWI (Bottom 80%)" dashed />
      </div>
    </Card>
  );
}

function ComparisonTooltip({ active, payload, label, slots }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload: Record<string, number> }>;
  label?: number;
  slots: Array<{ label: string }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {slots.map((slot, idx) => {
        const systemVal = row[`cwi_${idx}`] ?? 0;
        const medianVal = row[`median_${idx}`] ?? 0;
        return (
          <div key={idx} className={idx > 0 ? 'mt-1.5 pt-1.5 border-t border-border/30' : ''}>
            <div className="flex items-center gap-2 text-[12px]">
              <div className="w-2 h-2 rounded-full" style={{ background: SLOT_COLORS[idx] ?? '#6B7280' }} />
              <span className="text-text-secondary">{slot.label}</span>
              <span className="font-mono text-text-primary ml-auto">
                {formatCurrency(systemVal, { compact: true })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[12px] mt-0.5">
              <div className="w-2 h-2 rounded-full" style={{ background: TEAL }} />
              <span className="text-text-muted text-[11px]">Median</span>
              <span className="font-mono text-text-primary ml-auto">
                {formatCurrency(medianVal, { compact: true })}
              </span>
            </div>
          </div>
        );
      })}
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
            opacity: dashed ? 0.5 : 1,
          }}
        />
      </div>
      <span className="text-text-muted text-[10px] font-mono">{label}</span>
    </div>
  );
}
