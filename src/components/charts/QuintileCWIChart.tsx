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
 * Design (per the ratified spec): Q3 — the median household — is emphasized; no Q1–Q5
 * ribbon (distribution is not uncertainty); the mean of the quintile measures is a dashed
 * toggle, OFF by default (mean-vs-median divergence is the inequality exhibit, on demand);
 * a scenario badge renders on every view; phase annotations carry their one-line cited
 * mechanisms and are anchored to the default trajectory's attribution record
 * (docs/FABLE_AUDIT_SUMMARY.md holds the decision record).
 */
import {
  ComposedChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import { useMemo, useState } from 'react';
import { Card } from '@/components/shared/Card';
import { useQuintileSeries, useAnyPolicyEnabled } from '@/hooks/useQuintileCWI';
import { useCurrentYear } from '@/hooks/useSimulation';
import { useSimulationStore } from '@/stores/simulationStore';
import { formatCurrency } from '@/utils/format';

const AXIS_TICK = { fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" };
const GRID_STYLE = { strokeDasharray: '2 6', stroke: 'rgba(138, 150, 173, 0.06)' };

/** Q1..Q5; Q3 (index 2) is the emphasized median household. */
export const QUINTILE_COLORS = ['#8A96AD', '#5B8DB8', '#D4A03C', '#4ECDC4', '#9B7ED9'];
export const QUINTILE_LABELS = ['Q1 (lowest fifth)', 'Q2', 'Q3 (median household)', 'Q4', 'Q5 (highest fifth)'];

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
  const [showMean, setShowMean] = useState(false);
  const [showLegacy, setShowLegacy] = useState(false);
  const [selectedQ, setSelectedQ] = useState<number | null>(null);

  const data = useMemo(() => {
    const legacyByYear = new Map(years.map((y) => [y.year, y.macro]));
    return series.map((r) => {
      const legacy = legacyByYear.get(r.year);
      return {
        year: r.year,
        q0: r.cwi[0], q1: r.cwi[1], q2: r.cwi[2], q3: r.cwi[3], q4: r.cwi[4],
        mean: r.headlineCWI,
        legacyAvg: legacy?.consumerWelfareIndex,
        legacyB80: legacy?.medianCWI,
      };
    });
  }, [series, years]);

  return (
    <Card title="Consumer Welfare — five quintiles, each at its own cost of living">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <p className="text-text-muted text-[11px] max-w-xl">
          Real dollars per person within each population fifth, deflated by that fifth's own
          basket. Households experience different inflation because they buy different things.
        </p>
        {/* the scenario badge */}
        <span className="font-mono text-[10px] px-2 py-1 rounded border border-border text-text-secondary whitespace-nowrap">
          {policyActive ? 'POLICY ACTIVE' : 'NO POLICY'} · current parameters
        </span>
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

          {/* phase annotation bands (subtle; mechanisms in the footnote) */}
          {PHASES.map((p, i) => (
            <ReferenceArea
              key={p.label} x1={p.from} x2={p.to}
              fill="#8A96AD" fillOpacity={0.03 + (i % 2) * 0.02}
              label={{ value: p.label, position: 'insideTop', fill: '#4E5D75', fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}
            />
          ))}

          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} />

          {/* legacy aggregate-deflated lines — OFF by default, honest labels (they are NOT
              quintile measures: an aggregate-deflated mean and a bottom-80 mean-of-subset) */}
          {showLegacy && (
            <Line type="monotone" dataKey="legacyAvg" stroke="#6B7280" strokeWidth={1}
              strokeDasharray="2 4" strokeOpacity={0.6} dot={false} activeDot={false} />
          )}
          {showLegacy && (
            <Line type="monotone" dataKey="legacyB80" stroke="#6B7280" strokeWidth={1}
              strokeDasharray="6 4" strokeOpacity={0.6} dot={false} activeDot={false} />
          )}

          {/* the mean of the quintile measures — dashed, toggle, OFF by default */}
          {showMean && (
            <Line type="monotone" dataKey="mean" stroke="#E8ECF4" strokeWidth={1.5}
              strokeDasharray="5 5" strokeOpacity={0.7} dot={false} activeDot={false} />
          )}

          {/* the five quintile lines; Q3 (median household) emphasized */}
          {[0, 1, 2, 3, 4].map((q) => (
            <Line
              key={q} type="monotone" dataKey={`q${q}`}
              stroke={QUINTILE_COLORS[q]}
              strokeWidth={q === 2 ? 3 : 1.5}
              strokeOpacity={selectedQ === null || selectedQ === q ? 1 : 0.35}
              dot={false}
              activeDot={{ r: 4, fill: QUINTILE_COLORS[q], stroke: '#080D18', strokeWidth: 2 }}
              onClick={() => setSelectedQ(selectedQ === q ? null : q)}
              style={{ cursor: 'pointer' }}
            />
          ))}

          <Tooltip content={<QuintileTooltip />} />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-4 mt-3 pl-16 flex-wrap">
        {[0, 1, 2, 3, 4].map((q) => (
          <button
            key={q}
            onClick={() => setSelectedQ(selectedQ === q ? null : q)}
            className="flex items-center gap-2 group"
            title="Click to decompose this quintile"
          >
            <div className="w-4 h-[2px]" style={{ background: QUINTILE_COLORS[q], height: q === 2 ? 3 : 2 }} />
            <span className={`text-[10px] font-mono ${selectedQ === q ? 'text-text-primary' : 'text-text-muted'} group-hover:text-text-secondary`}>
              {QUINTILE_LABELS[q]}
            </span>
          </button>
        ))}
        <label className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted cursor-pointer ml-auto">
          <input type="checkbox" checked={showMean} onChange={(e) => setShowMean(e.target.checked)} />
          mean of quintile measures
        </label>
        <label className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted cursor-pointer">
          <input type="checkbox" checked={showLegacy} onChange={(e) => setShowLegacy(e.target.checked)} />
          legacy aggregate-deflated lines
        </label>
      </div>

      {showLegacy && (
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

      {selectedQ !== null && <QuintileDecomposition q={selectedQ} />}
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

function QuintileTooltip({ active, payload, label }: {
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
