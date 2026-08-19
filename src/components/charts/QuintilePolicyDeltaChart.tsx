/**
 * ATLAS Policy Delta — what the policy package buys, for whom (the quintile companion view).
 *
 * Each quintile's real welfare measure under the CURRENT policy configuration versus the
 * same economy with every policy lever off, in percent. The counterfactual is a true
 * simulation run (the no-policy twin), not an income-subtraction approximation. The same
 * grammar as the main quintile view — the SAME shared segmented control ("Top vs rest"
 * default | "All quintiles"), the same one-source descriptor array driving lines, legend,
 * and tooltip (the legend invariant), the same Bottom-80% simple average (of the four
 * rendered per-fifth deltas — each fifth's percent change counts equally by population).
 * Renders only when a policy is active.
 */
import {
  ComposedChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { useMemo } from 'react';
import { Card } from '@/components/shared/Card';
import { SegmentedControl } from '@/components/shared/SegmentedControl';
import { useQuintileSeries, useNoPolicyQuintileSeries } from '@/hooks/useQuintileCWI';
import { useCurrentYear } from '@/hooks/useSimulation';
import { useSimulationStore } from '@/stores/simulationStore';
import {
  QUINTILE_VIEW_OPTIONS, quintileLineDescriptors, policyDeltaRow,
  type QuintileLineDescriptor,
} from './quintileView';
// DEPRECATED (quintile view redesign): colors/labels now flow through the descriptor
// array from quintileView.ts — the direct imports retired.
// import { QUINTILE_COLORS, QUINTILE_LABELS } from './QuintileCWIChart';

const AXIS_TICK = { fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" };
const GRID_STYLE = { strokeDasharray: '2 6', stroke: 'rgba(138, 150, 173, 0.06)' };

export function QuintilePolicyDeltaChart() {
  const withPolicy = useQuintileSeries();
  const noPolicy = useNoPolicyQuintileSeries();
  const currentYear = useCurrentYear();
  const view = useSimulationStore((s) => s.quintileView);
  const setQuintileView = useSimulationStore((s) => s.setQuintileView);

  // the same one-source rendered-line set as the main quintile chart (no legacy lines here)
  const descriptors = useMemo(() => quintileLineDescriptors(view), [view]);

  const data = useMemo(() => {
    if (!noPolicy) return [];
    const base = new Map(noPolicy.map((r) => [r.year, r]));
    return withPolicy.map((r) => policyDeltaRow(r, base.get(r.year)));
  }, [withPolicy, noPolicy]);

  if (!noPolicy) return null;

  return (
    <Card title="Policy Delta — each fifth vs the no-policy counterfactual">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <p className="text-text-muted text-[11px] max-w-xl">
          Percent difference in each fifth's real welfare measure against the same economy with
          every policy lever off (a full counterfactual run, deflated by each fifth's own basket).
        </p>
        {/* the shared quintile-view control — identical deployment on every quintile chart */}
        <SegmentedControl
          options={QUINTILE_VIEW_OPTIONS}
          value={view}
          onChange={setQuintileView}
          ariaLabel="Quintile view"
        />
      </div>
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
          {/* the rendered lines — the same descriptor array as the legend and tooltip */}
          {descriptors.map((d) => (
            <Line key={d.key} type="monotone" dataKey={d.key}
              stroke={d.color} strokeWidth={d.strokeWidth} dot={false}
              activeDot={{ r: 4, fill: d.color, stroke: '#080D18', strokeWidth: 2 }} />
          ))}
          <Tooltip content={<DeltaTooltip descriptors={descriptors} />} />
        </ComposedChart>
      </ResponsiveContainer>
      {/* the legend — the same descriptor array as the lines (legend ≡ rendered) */}
      <div className="flex items-center gap-4 mt-3 pl-16 flex-wrap">
        {descriptors.map((d) => (
          <div key={d.key} className="flex items-center gap-2">
            <div className="w-4" style={{ background: d.color, height: d.strokeWidth >= 3 ? 3 : 2 }} />
            <span className="text-[10px] font-mono text-text-muted">{d.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** The tooltip rows come from the SAME descriptor array as the lines and the legend. */
function DeltaTooltip({ active, payload, label, descriptors }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
  descriptors: QuintileLineDescriptor[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const byKey = new Map(payload.map((p) => [p.dataKey, p.value]));
  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {descriptors.map((d) => {
        const v = byKey.get(d.key);
        if (v === undefined) return null;
        return (
          <div key={d.key} className="flex items-center gap-2 text-[12px]">
            <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            <span className="text-text-secondary">{d.shortLabel}</span>
            <span className="font-mono text-text-primary ml-auto">
              {(v >= 0 ? '+' : '') + v.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
