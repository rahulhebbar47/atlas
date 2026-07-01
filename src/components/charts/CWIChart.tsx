/**
 * DEPRECATED (close-out K.3) — retired from the default view; QuintileCWIChart replaces it.
 *
 * Why it retired: both lines deflate by the AGGREGATE price level, which belongs to no
 * household — in deep-deflation scenarios they read far below the honest own-basket
 * measures. And the "Median CWI (Bottom 80%)" line was never a median: it is the MEAN of
 * the bottom-80 income share. If this component is ever re-mounted, the labels below have
 * been corrected to the true definitions; the honest display is the quintile chart.
 * Decision record: docs/FABLE_AUDIT_SUMMARY.md.
 */

import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { useMemo } from 'react';
import { Card } from '@/components/shared/Card';
import { useCWIData } from '@/hooks/useEconomicsData';
import { usePolicyActive } from '@/hooks/usePolicyData';
import { useCurrentYear, useBaselineMacroTimeSeries } from '@/hooks/useSimulation';
import { formatCurrency } from '@/utils/format';

const AXIS_TICK = { fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" };
const GRID_STYLE = { strokeDasharray: '2 6', stroke: 'rgba(138, 150, 173, 0.06)' };
const GOLD = '#D4A03C';
const TEAL = '#4ECDC4';

export function CWIChart() {
  const rawData = useCWIData();
  const currentYear = useCurrentYear();
  const policyActive = usePolicyActive();
  const baselineMacro = useBaselineMacroTimeSeries();

  // Merge baseline CWI into chart data
  const data = useMemo(() => {
    if (!baselineMacro) return rawData;
    const blMap = new Map(baselineMacro.map((d) => [d.year, d.consumerWelfareIndex]));
    return rawData.map((d) => ({
      ...d,
      baseline_systemCWI: blMap.get(d.year),
    }));
  }, [rawData, baselineMacro]);

  return (
    <Card
      title="Consumer Welfare Index"
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 0 }}>
          <CartesianGrid {...GRID_STYLE} vertical={false} />

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
            width={56}
            tickFormatter={(v: number) => formatCurrency(v, { compact: true })}
            domain={[0, 'auto']}
          />

          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} />

          {/* No-policy counterfactuals — only when policy active (behind primary lines) */}
          {policyActive && (
            <Line
              type="monotone"
              dataKey="systemNoPolicyDollars"
              stroke={GOLD}
              strokeWidth={1}
              strokeDasharray="4 4"
              strokeOpacity={0.4}
              dot={false}
              activeDot={false}
            />
          )}
          {policyActive && (
            <Line
              type="monotone"
              dataKey="medianNoPolicyDollars"
              stroke={TEAL}
              strokeWidth={1}
              strokeDasharray="4 4"
              strokeOpacity={0.4}
              dot={false}
              activeDot={false}
            />
          )}

          {/* Baseline ghost line — autopilot system CWI */}
          {baselineMacro && (
            <Line
              type="monotone"
              dataKey="baseline_systemCWI"
              stroke="#6B7280"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              strokeOpacity={0.5}
              dot={false}
              activeDot={false}
            />
          )}

          {/* Median CWI — teal solid (bottom 80%) */}
          <Line
            type="monotone"
            dataKey="medianDollars"
            stroke={TEAL}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: TEAL, stroke: '#080D18', strokeWidth: 2 }}
          />

          {/* System CWI — gold solid (macro average, primary) */}
          <Line
            type="monotone"
            dataKey="systemDollars"
            stroke={GOLD}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: GOLD, stroke: '#080D18', strokeWidth: 2 }}
          />

          <Tooltip content={<CWITooltip policyActive={policyActive} />} />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-6 mt-3 pl-16 flex-wrap">
        <LegendItem color={GOLD} label="Aggregate-deflated mean (all households)" />
        <LegendItem color={TEAL} label="Aggregate-deflated mean, bottom-80 income share (not a median)" />
        {policyActive && <LegendItem color={GOLD} label="System (No Policy)" dashed />}
        {policyActive && <LegendItem color={TEAL} label="Median (No Policy)" dashed />}
        {baselineMacro && <LegendItem color="#6B7280" label="Autopilot baseline" dashed />}
      </div>
    </Card>
  );
}

function CWITooltip({ active, payload, label, policyActive }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload: Record<string, number> }>;
  label?: number;
  policyActive?: boolean;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      <div className="flex items-center gap-2 text-[12px]">
        <div className="w-2 h-2 rounded-full" style={{ background: GOLD }} />
        <span className="text-text-secondary">System CWI</span>
        <span className="font-mono text-text-primary ml-auto">
          {formatCurrency(row['systemDollars'] ?? 0, { compact: true })}/person
        </span>
      </div>
      <div className="flex items-center gap-2 text-[12px] mt-0.5">
        <div className="w-2 h-2 rounded-full" style={{ background: TEAL }} />
        <span className="text-text-secondary">Median CWI</span>
        <span className="font-mono text-text-primary ml-auto">
          {formatCurrency(row['medianDollars'] ?? 0, { compact: true })}/person
        </span>
      </div>
      {policyActive && (
        <div className="flex items-center gap-2 text-[12px] mt-1 pt-1 border-t border-border/50">
          <span className="text-text-muted text-[10px] font-mono">
            No Policy: System {formatCurrency(row['systemNoPolicyDollars'] ?? 0, { compact: true })} / Median {formatCurrency(row['medianNoPolicyDollars'] ?? 0, { compact: true })}
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
            opacity: dashed ? 0.4 : 1,
          }}
        />
      </div>
      <span className="text-text-muted text-[10px] font-mono">{label}</span>
    </div>
  );
}
