/**
 * ATLAS Consumer Welfare — the quintile view (the default CWI display).
 *
 * Five lines, one per income quintile: real dollars per person within each population
 * fifth, deflated by that fifth's OWN cost of living. Households experience different
 * inflation because they buy different baskets — the aggregate price level belongs to no
 * one, which is why the previous aggregate-deflated lines retired from this view (they
 * read ~29% below the honest objects in deep-deflation scenarios; kept behind the
 * "legacy" toggle under their true labels).
 *
 * Design (per the ratified spec, amended by the quintile view redesign): the DEFAULT view
 * is TWO LINES — "Top 20%" (Q5) and "Bottom 80% (average)", the simple mean of the four
 * lower fifths' per-person values (equal population fifths make the simple mean the
 * population-weighted truth; the "(average)" label prevents the household misreading).
 * The shared segmented control ("Top vs rest" | "All quintiles") switches to the full
 * five-quintile display — Q3 (median household) emphasized there; no Q1–Q5 ribbon
 * (distribution is not uncertainty). Lines, legend, and tooltip all render from ONE
 * descriptor array (quintileView.ts) — the legend invariant is structural. A scenario
 * badge renders on every view; phase annotations carry their one-line cited mechanisms
 * and are anchored to the default trajectory's attribution record
 * (docs/FABLE_AUDIT_SUMMARY.md holds the decision record).
 */
import {
  ComposedChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, /* ReferenceArea — DEPRECATED: phase bands commented out, owner request 2026-08-06 */
  ResponsiveContainer,
} from 'recharts';
import { useMemo, useState } from 'react';
import { Card } from '@/components/shared/Card';
import { SegmentedControl } from '@/components/shared/SegmentedControl';
import { useQuintileSeries, useAnyPolicyEnabled } from '@/hooks/useQuintileCWI';
import { useCurrentYear } from '@/hooks/useSimulation';
import { useSimulationStore } from '@/stores/simulationStore';
import { formatCurrency } from '@/utils/format';
import {
  QUINTILE_COLORS, QUINTILE_LABELS, QUINTILE_VIEW_OPTIONS,
  quintileLineDescriptors, cwiChartRow, type QuintileLineDescriptor,
} from './quintileView';

const AXIS_TICK = { fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" };
const GRID_STYLE = { strokeDasharray: '2 6', stroke: 'rgba(138, 150, 173, 0.06)' };

/** Source of truth moved to quintileView.ts (the one-source rule); re-exported here for
 *  standing importers. */
export { QUINTILE_COLORS, QUINTILE_LABELS };

/** The phase annotations: named spans from the default trajectory's attribution record,
 *  each with its cited one-line mechanism (rendered in the footnote). */
const PHASES = [
  { from: 2038, to: 2041, label: 'displacement wave', mechanism: 'automation triggers cascade through mid-wage cognitive work' },
  { from: 2040, to: 2042, label: 'asset-income boom', mechanism: 'the wage-bill collapse lands in residual profits → lagged dividends, riding accelerating deflation — not scarcity wages' },
  { from: 2043, to: 2045, label: 'demand-crash echo', mechanism: 'the credit/housing cascade bottoms ~4 years after the displacement wave and claws the boom back' },
  { from: 2046, to: 2050, label: 'stabilization', mechanism: 'coverage saturates; pressure decays geometrically' },
];

export function QuintileCWIChart() {
  const series = useQuintileSeries();
  const currentYear = useCurrentYear();
  const policyActive = useAnyPolicyEnabled();
  const years = useSimulationStore((s) => s.timeline.years);
  const view = useSimulationStore((s) => s.quintileView);
  const setQuintileView = useSimulationStore((s) => s.setQuintileView);
  // DEPRECATED (quintile view redesign, duplicate policy): the mean-of-quintile-measures
  // toggle retired — the two-line default IS the inequality exhibit (the Top-20%-vs-
  // Bottom-80% gap); the dashed mean line and its checkbox are commented out below.
  // const [showMean, setShowMean] = useState(false);
  const [showLegacy, setShowLegacy] = useState(false);
  const [selectedQ, setSelectedQ] = useState<number | null>(null);

  // The rendered-line set — ONE array drives the lines, the legend, and the tooltip
  // (the legend invariant, structural). Legacy lines are an "All quintiles" affordance.
  const descriptors = useMemo(
    () => quintileLineDescriptors(view, { legacyLines: showLegacy }),
    [view, showLegacy],
  );

  const data = useMemo(() => {
    const legacyByYear = new Map(years.map((y) => [y.year, y.macro]));
    return series.map((r) => {
      const legacy = legacyByYear.get(r.year);
      return {
        ...cwiChartRow(r), // q0..q4 + the Bottom-80% average from the SAME record (one source)
        legacyAvg: legacy?.consumerWelfareIndex,
        legacyB80: legacy?.medianCWI,
      };
    });
  }, [series, years]);

  return (
    <Card title="Consumer Welfare — each population fifth at its own cost of living">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <p className="text-text-muted text-[11px] max-w-xl">
          Real dollars per person within each population fifth, deflated by that fifth's own
          basket. Households experience different inflation because they buy different things.
          {view === 'top-vs-rest' && (
            <> Bottom 80% is the simple average of the four lower fifths — equal population
            fifths, so the simple mean is the population-weighted truth.</>
          )}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {/* the shared quintile-view control (one component, one behavior, every quintile chart) */}
          <SegmentedControl
            options={QUINTILE_VIEW_OPTIONS}
            value={view}
            onChange={setQuintileView}
            ariaLabel="Quintile view"
          />
          {/* the scenario badge */}
          <span className="font-mono text-[10px] px-2 py-1 rounded border border-border text-text-secondary whitespace-nowrap">
            {policyActive ? 'POLICY ACTIVE' : 'NO POLICY'} · current parameters
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 14, right: 48, left: 8, bottom: 0 }}>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis
            dataKey="year" tick={AXIS_TICK} tickLine={false}
            axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }}
            ticks={[2025, 2030, 2035, 2040, 2045, 2050]}
          />
          <YAxis
            tick={AXIS_TICK} axisLine={false} tickLine={false} width={56}
            tickFormatter={(v: number) => formatCurrency(v, { compact: true })}
            domain={[0, 'auto']}
          />

          {/* DEPRECATED: owner request 2026-08-06 — the phase background bands cluttered the
              chart (overlapping labels, ambiguous shading); the phases stay listed in the
              mechanisms footnote below.
          {PHASES.map((p, i) => (
            <ReferenceArea
              key={p.label} x1={p.from} x2={p.to}
              fill="#8A96AD" fillOpacity={0.03 + (i % 2) * 0.02}
              label={{ value: p.label, position: 'insideTop', fill: '#4E5D75', fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}
            />
          ))} */}

          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} />

          {/* DEPRECATED (quintile view redesign, duplicate policy): the mean-of-quintile-
              measures line retired — the two-line default is the inequality exhibit.
          {showMean && (
            <Line type="monotone" dataKey="mean" stroke="#E8ECF4" strokeWidth={1.5}
              strokeDasharray="5 5" strokeOpacity={0.7} dot={false} activeDot={false} />
          )} */}

          {/* THE RENDERED LINES — the same descriptor array the legend and tooltip render
              (legend ≡ rendered, structural). In the two-line default: Top 20% (Q5's
              established purple) and the emphasized gold Bottom-80% average. In the
              five-line view: Q3 (median household) emphasized; the legacy aggregate-
              deflated lines join behind their toggle under their true labels. */}
          {descriptors.map((d) => (
            <Line
              key={d.key} type="monotone" dataKey={d.key}
              stroke={d.color}
              strokeWidth={d.strokeWidth}
              strokeDasharray={d.dash}
              strokeOpacity={
                view === 'all' && d.qIndex !== null && selectedQ !== null && selectedQ !== d.qIndex
                  ? 0.35
                  : (d.opacity ?? 1)
              }
              dot={false}
              activeDot={d.dash ? false : { r: 4, fill: d.color, stroke: '#080D18', strokeWidth: 2 }}
              onClick={view === 'all' && d.qIndex !== null
                ? () => setSelectedQ(selectedQ === d.qIndex ? null : d.qIndex)
                : undefined}
              style={view === 'all' && d.qIndex !== null ? { cursor: 'pointer' } : undefined}
            />
          ))}

          <Tooltip content={<QuintileTooltip descriptors={descriptors} />} />
        </ComposedChart>
      </ResponsiveContainer>

      {/* THE LEGEND — the same descriptor array as the lines (legend ≡ rendered). In the
          five-line view each quintile entry doubles as the decomposition button. */}
      <div className="flex items-center gap-4 mt-3 pl-16 flex-wrap">
        {descriptors.map((d) => (
          view === 'all' && d.qIndex !== null ? (
            <button
              key={d.key}
              onClick={() => setSelectedQ(selectedQ === d.qIndex ? null : d.qIndex)}
              className="flex items-center gap-2 group"
              title="Click to decompose this quintile"
            >
              <div className="w-4" style={{ background: d.color, height: d.strokeWidth >= 3 ? 3 : 2 }} />
              <span className={`text-[10px] font-mono ${selectedQ === d.qIndex ? 'text-text-primary' : 'text-text-muted'} group-hover:text-text-secondary`}>
                {d.label}
              </span>
            </button>
          ) : (
            <div key={d.key} className="flex items-center gap-2">
              <div className="w-4" style={{ background: d.color, height: d.strokeWidth >= 3 ? 3 : 2, opacity: d.opacity ?? 1 }} />
              <span className="text-[10px] font-mono text-text-muted">{d.label}</span>
            </div>
          )
        ))}
        {/* DEPRECATED (quintile view redesign, duplicate policy): the checkbox pile is
            replaced by the shared segmented control; the mean checkbox retired with its line.
        <label className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted cursor-pointer ml-auto">
          <input type="checkbox" checked={showMean} onChange={(e) => setShowMean(e.target.checked)} />
          mean of quintile measures
        </label> */}
        {/* the legacy toggle survives as an "All quintiles" affordance (the close-out K.3
            ruling: legacy lines stay behind their toggle under true labels) */}
        {view === 'all' && (
          <label className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted cursor-pointer ml-auto">
            <input type="checkbox" checked={showLegacy} onChange={(e) => setShowLegacy(e.target.checked)} />
            legacy aggregate-deflated lines
          </label>
        )}
      </div>

      {view === 'all' && showLegacy && (
        <p className="text-text-muted text-[10px] mt-2 pl-16 font-mono">
          Legacy lines (gray): an aggregate-deflated MEAN and an aggregate-deflated bottom-80
          MEAN-OF-SUBSET — not quintile measures, and not a median. They understate lived
          outcomes wherever a quintile's own basket deflates faster than the aggregate.
        </p>
      )}

      <details className="mt-2 pl-16">
        <summary className="text-[10px] font-mono text-text-muted cursor-pointer">
          phase annotations — mechanisms (anchored to the default trajectory)
        </summary>
        <ul className="text-[10px] text-text-muted mt-1 space-y-0.5">
          {PHASES.map((p) => (
            <li key={p.label}>
              <span className="font-mono">{p.from}–{p.to} {p.label}:</span> {p.mechanism}
            </li>
          ))}
        </ul>
      </details>

      {/* the decomposition is a five-line-view affordance (its target is ONE quintile);
          the selection is PRESERVED across view switches so the round-trip is exact */}
      {view === 'all' && selectedQ !== null && <QuintileDecomposition q={selectedQ} />}
    </Card>
  );
}

/** The click-through: the why behind one quintile's line — its income stack (wage / asset /
 *  transfer, real at the quintile's own deflator) and its price index against the aggregate. */
function QuintileDecomposition({ q }: { q: number }) {
  const series = useQuintileSeries();
  const years = useSimulationStore((s) => s.timeline.years);
  const currentYear = useCurrentYear();

  const data = useMemo(() => {
    const pl = new Map(years.map((y) => [y.year, y.macro.priceLevel]));
    return series.map((r) => {
      const comp = r.incomeComponents[q]!;
      const idx = r.indices[q]!;
      return {
        year: r.year,
        wage: comp.wage / idx / 1e12,
        asset: comp.asset / idx / 1e12,
        transfer: comp.transfer / idx / 1e12,
        ownIndex: idx,
        aggregateIndex: pl.get(r.year),
      };
    });
  }, [series, years, q]);

  const at = data.find((d) => d.year === currentYear) ?? data[data.length - 1]!;

  return (
    <div className="mt-4 pt-3 border-t border-border/50">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <span className="text-[11px] font-mono" style={{ color: QUINTILE_COLORS[q] }}>
          {QUINTILE_LABELS[q]} — the why: income legs (real, own deflator) and the lived price index
        </span>
        <span className="text-[10px] font-mono text-text-muted">
          {at.year}: wage ${at.wage.toFixed(2)}T · asset ${at.asset.toFixed(2)}T · transfer ${at.transfer.toFixed(2)}T ·
          own index {at.ownIndex.toFixed(3)} vs aggregate {at.aggregateIndex?.toFixed(3) ?? '—'}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={data} margin={{ top: 4, right: 48, left: 8, bottom: 0 }}>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false}
            axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }}
            ticks={[2025, 2030, 2035, 2040, 2045, 2050]} />
          <YAxis yAxisId="t" tick={AXIS_TICK} axisLine={false} tickLine={false} width={56}
            tickFormatter={(v: number) => `$${v.toFixed(1)}T`} />
          <YAxis yAxisId="idx" orientation="right" tick={AXIS_TICK} axisLine={false} tickLine={false} width={44}
            tickFormatter={(v: number) => v.toFixed(2)} />
          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} yAxisId="t" />
          <Line yAxisId="t" type="monotone" dataKey="wage" stroke="#5B8DB8" strokeWidth={1.5} dot={false} />
          <Line yAxisId="t" type="monotone" dataKey="asset" stroke="#9B7ED9" strokeWidth={1.5} dot={false} />
          <Line yAxisId="t" type="monotone" dataKey="transfer" stroke="#4ECDC4" strokeWidth={1.5} dot={false} />
          <Line yAxisId="idx" type="monotone" dataKey="ownIndex" stroke={QUINTILE_COLORS[q]} strokeWidth={1} strokeDasharray="4 4" dot={false} />
          <Line yAxisId="idx" type="monotone" dataKey="aggregateIndex" stroke="#6B7280" strokeWidth={1} strokeDasharray="2 4" dot={false} />
          <Tooltip content={<DecompTooltip />} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2 pl-16 flex-wrap text-[10px] font-mono text-text-muted">
        <span style={{ color: '#5B8DB8' }}>— wage</span>
        <span style={{ color: '#9B7ED9' }}>— asset</span>
        <span style={{ color: '#4ECDC4' }}>— transfer</span>
        <span>-- own price index (right)</span>
        <span className="text-text-muted/70">-- aggregate price level (right)</span>
      </div>
    </div>
  );
}

/** The tooltip rows come from the SAME descriptor array as the lines and the legend —
 *  exactly the rendered lines, in the same reading order (the legend invariant). */
function QuintileTooltip({ active, payload, label, descriptors }: {
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
            <div className="w-2 h-2 rounded-full" style={{ background: d.color, opacity: d.opacity ?? 1 }} />
            <span className="text-text-secondary">{d.shortLabel}</span>
            <span className="font-mono text-text-primary ml-auto">
              {formatCurrency(v, { compact: true })}/person
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DecompTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const byKey = new Map(payload.map((p) => [p.dataKey, p.value]));
  const rows: Array<[string, string]> = [
    ['wage', `$${(byKey.get('wage') ?? 0).toFixed(2)}T`],
    ['asset', `$${(byKey.get('asset') ?? 0).toFixed(2)}T`],
    ['transfer', `$${(byKey.get('transfer') ?? 0).toFixed(2)}T`],
    ['own index', (byKey.get('ownIndex') ?? 0).toFixed(3)],
    ['aggregate', (byKey.get('aggregateIndex') ?? 0).toFixed(3)],
  ];
  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2">
      <div className="font-mono text-[11px] text-text-muted mb-1">{label}</div>
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center gap-3 text-[11px]">
          <span className="text-text-secondary">{k}</span>
          <span className="font-mono text-text-primary ml-auto">{v}</span>
        </div>
      ))}
    </div>
  );
}
