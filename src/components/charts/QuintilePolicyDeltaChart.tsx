/**
 * ATLAS Policy Delta — what the policy package buys, for whom (the quintile companion view).
 *
 * Five lines: each quintile's real welfare measure under the CURRENT policy configuration
 * versus the same economy with every policy lever off, in percent. The counterfactual is a
 * true simulation run (the no-policy twin), not an income-subtraction approximation. The
 * same five-line grammar as the main quintile view; renders only when a policy is active.
 */
import {
  ComposedChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { useMemo } from 'react';
import { Card } from '@/components/shared/Card';
import { useQuintileSeries, useNoPolicyQuintileSeries } from '@/hooks/useQuintileCWI';
import { useCurrentYear } from '@/hooks/useSimulation';
import { QUINTILE_COLORS, QUINTILE_LABELS } from './QuintileCWIChart';

const AXIS_TICK = { fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" };
const GRID_STYLE = { strokeDasharray: '2 6', stroke: 'rgba(138, 150, 173, 0.06)' };

export function QuintilePolicyDeltaChart() {
  const withPolicy = useQuintileSeries();
  const noPolicy = useNoPolicyQuintileSeries();
  const currentYear = useCurrentYear();

  const data = useMemo(() => {
    if (!noPolicy) return [];
    const base = new Map(noPolicy.map((r) => [r.year, r]));
    return withPolicy.map((r) => {
      const b = base.get(r.year);
      const row: Record<string, number> = { year: r.year };
      for (let q = 0; q < 5; q++) {
        const bv = b?.cwi[q] ?? 0;
        row[`q${q}`] = bv > 0 ? (r.cwi[q]! / bv - 1) * 100 : 0;
      }
      return row;
    });
  }, [withPolicy, noPolicy]);

  if (!noPolicy) return null;

  return (
    <Card title="Policy Delta — each quintile vs the no-policy counterfactual">
      <p className="text-text-muted text-[11px] mb-2 max-w-xl">
        Percent difference in each fifth's real welfare measure against the same economy with
        every policy lever off (a full counterfactual run, deflated by each fifth's own basket).
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 0 }}>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false}
            axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }}
            ticks={[2025, 2030, 2035, 2040, 2045, 2050]} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={48}
            tickFormatter={(v: number) => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`} />
          <ReferenceLine y={0} stroke="rgba(138, 150, 173, 0.25)" strokeWidth={1} />
          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} />
          {[0, 1, 2, 3, 4].map((q) => (
            <Line key={q} type="monotone" dataKey={`q${q}`}
              stroke={QUINTILE_COLORS[q]} strokeWidth={q === 2 ? 3 : 1.5} dot={false}
              activeDot={{ r: 4, fill: QUINTILE_COLORS[q], stroke: '#080D18', strokeWidth: 2 }} />
          ))}
          <Tooltip content={<DeltaTooltip />} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-3 pl-16 flex-wrap">
        {[0, 1, 2, 3, 4].map((q) => (
          <div key={q} className="flex items-center gap-2">
            <div className="w-4" style={{ background: QUINTILE_COLORS[q], height: q === 2 ? 3 : 2 }} />
            <span className="text-[10px] font-mono text-text-muted">{QUINTILE_LABELS[q]}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DeltaTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const byKey = new Map(payload.map((p) => [p.dataKey, p.value]));
  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {[4, 3, 2, 1, 0].map((q) => {
        const v = byKey.get(`q${q}`);
        if (v === undefined) return null;
        return (
          <div key={q} className="flex items-center gap-2 text-[12px]">
            <div className="w-2 h-2 rounded-full" style={{ background: QUINTILE_COLORS[q] }} />
            <span className="text-text-secondary">Q{q + 1}</span>
            <span className="font-mono text-text-primary ml-auto">
              {(v >= 0 ? '+' : '') + v.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
