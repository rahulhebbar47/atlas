/**
 * THE ADVANCED GRID (R3b) — every live model parameter rendered from the dial table:
 * control (per the registry's mechanical class) + REAL TITLE + plain-English
 * explanation (tranche-authored; honest-stop — unauthored keys render without filler)
 * + citation badge + provenance badge + one-tap shadow reset. Values arrive
 * pre-populated by the sidebar's composition; edits shadow the variant (§3.2).
 */
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  useSimulationStore, computeCompositionProvenance, computeEffectiveConfig, getLastEffectiveConfig,
  eventWindowsForKey,
} from '@/stores/simulationStore';
import {
  ADVANCED_GRID_REGISTRY, GRID_GROUP_NAMES, NO_OWNER_LEDGER, writeConfigValue,
  gridRowMatches, filterIsActive, EMPTY_FILTER, diffAgainstDefaults,
  NUMBER_RANGE_HINTS, effectiveRowValue, subgroupCells, axisAnswerState, breadcrumbFor, ownerFor,
  PER_YEAR_KEY_FOR_ROW,
  type GridEntry, type GridFilter,
} from './advancedGridRegistry';
import { Reveal } from '@/components/shared/Reveal';
import { AnimatedRange } from '@/components/shared/AnimatedRange';
// The policy editors render EMBEDDED inside their grid groups (owner ruling: the
// policy changes live within the Policies tab itself, not in separate sections).
import { PolicyControls } from '@/components/controls/PolicyControls';
import { TaxRateControls } from '@/components/controls/TaxRateControls';
import { PolicyRateScheduleSection } from '@/components/controls/PolicyRateScheduleSection';
import { AXIS_GROUPS, AXIS_SHORT_FORMS } from '@/data/manifests/axes';
import { DIAL_EXPLANATIONS } from '@/data/dialExplanations';
import type { SimulationConfig } from '@/types';

const CITE_COLORS: Record<string, string> = {
  cited: 'text-emerald-400 border-emerald-400/30',
  episode: 'text-sky-400 border-sky-400/30',
  'honest-uncertainty': 'text-amber-400 border-amber-400/30',
};
const SPECIES_TABS = ['BELIEF', 'POLICY', 'EVENT', 'INFRA'] as const;

function getDeep(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
}
function setDeep(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const [head, ...rest] = path.split('.');
  if (!head) return obj;
  if (rest.length === 0) return { ...obj, [head]: value };
  return { ...obj, [head]: setDeep((obj[head] ?? {}) as Record<string, unknown>, rest.join('.'), value) };
}

function GridRow({ entry }: { entry: GridEntry }) {
  const { row, control, scale } = entry;
  const config = useSimulationStore((s) => s.config);
  const updateConfig = useSimulationStore((s) => s.updateConfig);
  const resetShadow = useSimulationStore((s) => s.resetShadow);
  const setAdvancedFocus = useSimulationStore((s) => s.setAdvancedFocus);
  const setActiveView = useSimulationStore((s) => s.setActiveView);
  const composition = useSimulationStore((s) => s.composition);
  const prov = useMemo(() => computeCompositionProvenance(config)[row.key], [config, composition, row.key]);
  // F1 (the sc-events-advanced-binding ruling): a row whose per-year key an ACTIVE
  // event governs badges the coverage — this slider is the BASELINE layer, and the
  // event's per-year values rule the badged window. Clicking scrubs into the window
  // (when outside it) and opens the per-year strip, where the year-by-year values
  // live and further per-year edits beat the event.
  const currentYear = useSimulationStore((s) => s.currentYear);
  const setCurrentYear = useSimulationStore((s) => s.setCurrentYear);
  const perYearKey = PER_YEAR_KEY_FOR_ROW[row.key];
  const eventWindows = useMemo(
    () => (perYearKey ? eventWindowsForKey(perYearKey) : []),
    [perYearKey, composition],
  );
  const jumpToWindow = (w: { from: number; to?: number }) => {
    if (currentYear < w.from || (w.to !== undefined && currentYear > w.to)) setCurrentYear(w.from);
    setAdvancedFocus({ kind: 'per-year' });
  };
  // THE BINDING FIX: the rendered value is the one the simulation consumed (the
  // captured effective config) — never the user config the composition cannot write.
  // The timeline subscription keeps the read fresh across every recompute, including
  // the touch subscriber's shadow-flip recompute.
  const timeline = useSimulationStore((s) => s.timeline);
  const effective = useMemo(() => getLastEffectiveConfig() ?? config, [timeline, config]);
  const { raw, value } = effectiveRowValue(effective, row);
  // R3c F2: all grid writes route through the registry's guarded write path
  // (the optional-parent rule on the user-config side).
  const writeAt = (c: SimulationConfig, v: unknown): SimulationConfig => writeConfigValue(c, row.key, v);
  const write = (display: number) => updateConfig((c) => writeAt(c, scale.toConfig(display)));
  const explanation = DIAL_EXPLANATIONS[row.key];
  // R3c (P2, tooltip accessibility): the full citation status is one TAP away, not
  // hover-only — the badge toggles a detail line.
  const [citeOpen, setCiteOpen] = useState(false);
  const rangeHint = NUMBER_RANGE_HINTS[row.key];

  return (
    <div className="py-2 border-b border-white/5 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-[#E8ECF4] truncate" title={row.key}>
          {row.title || row.key.split('.').pop()}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setCiteOpen(!citeOpen)}
            className={`px-1 rounded border text-[8px] font-mono ${CITE_COLORS[row.citationClass]}`}
            title={row.citationStatus}>{row.citationClass === 'honest-uncertainty' ? 'uncertain' : row.citationClass}</button>
          {prov && (
            <span className={`px-1 rounded border text-[8px] font-mono ${prov.shadowed ? 'text-amber-400 border-amber-400/40' : 'text-cyan-400 border-cyan-400/30'}`}
              title={prov.shadowed ? `your value shadows [${prov.origin}]` : `set by ${prov.origin}`}>
              {prov.shadowed ? 'shadow' : prov.source === 'axis-variant' ? 'axis' : 'policy'}
            </span>
          )}
          {prov?.shadowed && (
            <button onClick={() => resetShadow(row.key)}
              className="text-[8px] font-mono border border-amber-400/40 text-amber-400 rounded px-1">reset</button>
          )}
        </div>
      </div>
      {citeOpen && (
        <p className="text-[9px] font-mono leading-relaxed text-[#8A96AD] mt-0.5 border-l border-white/10 pl-1.5">
          {row.citationStatus}
        </p>
      )}
      {eventWindows.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 mt-0.5">
          {eventWindows.map((w) => (
            <button
              key={`${w.origin}:${w.from}`}
              onClick={() => jumpToWindow(w)}
              className="text-[8px] font-mono text-orange-400 border border-orange-400/30 rounded px-1 truncate max-w-[220px] hover:bg-orange-400/10 transition-colors"
              title={`The ${w.title} event sets this value for ${w.from}${w.to !== undefined ? `–${w.to}` : ' onward (while the event is active)'}. This control is the baseline outside that window; the year-by-year values live in the per-year timeline — open it to see or edit them.`}
            >
              {w.title} · {w.from}–{w.to ?? '…'} → per-year
            </button>
          ))}
        </div>
      )}
      {explanation && (
        <p className="text-[10px] leading-relaxed text-[#8A96AD] mt-0.5">{explanation}</p>
      )}
      <div className="mt-1 flex items-center gap-2">
        {control === 'slider' && (
          <>
            <AnimatedRange className="flex-1"
              min={scale.toDisplay(row.min!)} max={scale.toDisplay(row.max!)}
              step={row.step !== null ? scale.toDisplay(row.step) || row.step : (scale.toDisplay(row.max!) - scale.toDisplay(row.min!)) / 100}
              value={scale.toDisplay(value)} onChange={write} />
            <span className="text-[10px] font-mono text-[#D4A03C] w-16 text-right">
              {scale.toDisplay(value).toPrecision(4)}{scale.kind === 'percent' ? '%' : scale.kind === 'multiplier-of-innovation' ? '×' : ''}
            </span>
          </>
        )}
        {control === 'number' && (
          <>
            <input type="number" className="w-28 bg-[#080D18] border border-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-[#E8ECF4]"
              value={scale.toDisplay(value)} onChange={(e) => write(Number(e.target.value))} />
            {rangeHint && (
              /* soft bounds where the validator clamps (values outside clamp on load) */
              <span className="text-[8px] font-mono text-[#8A96AD]">
                {scale.toDisplay(rangeHint[0]).toPrecision(3)}–{scale.toDisplay(rangeHint[1]).toPrecision(3)}{scale.kind === 'percent' ? '%' : ''}
              </span>
            )}
          </>
        )}
        {control === 'toggle' && (
          /* the flip acts on what the user SEES (the effective value) and writes the
             user config — a flip of a composed toggle becomes a shadow, badged */
          <button onClick={() => updateConfig((c) => writeAt(c, !raw))}
            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${raw ? 'text-[#22C55E] border-[#22C55E]/40' : 'text-[#8A96AD] border-white/10'}`}>
            {raw ? 'on' : 'off'}
          </button>
        )}
        {control === 'editor' && (() => {
          if (NO_OWNER_LEDGER[row.key]) {
            return <span className="text-[9px] font-mono text-[#8A96AD]">{NO_OWNER_LEDGER[row.key]}</span>;
          }
          const owner = ownerFor(row.key);
          if (owner?.embedded) {
            /* the owning editor renders INSIDE this same group card */
            return <span className="text-[9px] font-mono text-[#8A96AD]">edited in the panel above</span>;
          }
          if (owner?.view === 'occupations') {
            /* the owner lives with the cluster on the Occupations page */
            return (
              <button onClick={() => setActiveView('occupations')}
                className="text-[9px] font-mono text-[#D4A03C] hover:underline">
                → open in Occupations (pick a cluster)
              </button>
            );
          }
          return (
            /* R3c (P1-7): pointer rows are LINKS — open + scroll the owning editor */
            <button
              onClick={() => {
                if (owner?.anchor) setAdvancedFocus({ kind: 'anchor', anchor: owner.anchor });
              }}
              className="text-[9px] font-mono text-[#D4A03C] hover:underline"
            >
              → open its editor
            </button>
          );
        })()}
        {control === 'per-year' && (
          <span className="text-[9px] font-mono text-[#8A96AD]">→ the per-year strip above</span>
        )}
        {control === 'display' && (
          <span className="text-[9px] font-mono text-[#8A96AD]">display row</span>
        )}
      </div>
    </div>
  );
}

/** The editors that render INSIDE their grid group (controls first, the informational
 *  rows with citations and explanations below). */
const EMBEDDED_EDITORS: Record<string, () => React.ReactNode> = {
  'Support programs': () => <PolicyControls />,
  'Taxation': () => <TaxRateControls />,
  'Policy rate schedule': () => <PolicyRateScheduleSection />,
};

/** One collapsible group card: human name (+ optional axis-id chip) + the current
 *  answer chip (IA-2) + amber shadow count + row count. */
function GroupCard({ id, name, chip, entries, open, onToggle, answer, embed }: {
  id: string; name: string; chip?: string; entries: GridEntry[];
  open: boolean; onToggle: () => void;
  answer?: { label: string; explicit: boolean; shadows: number };
  embed?: React.ReactNode;
}) {
  return (
    <div id={`grid-axis-${id}`} className="rounded border border-white/5 px-3 py-1.5">
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-2 py-1">
        <span className="text-[11px] font-medium text-[#E8ECF4] text-left leading-snug min-w-0">
          {open ? '▾' : '▸'} {name}
          {chip && (
            <span className="ml-1.5 px-1 rounded border border-white/10 text-[8px] font-mono text-[#8A96AD] align-middle">{chip}</span>
          )}
        </span>
        <span className="flex items-center gap-1.5 shrink-0">
          {answer && (
            <span className={`px-1.5 py-0.5 rounded-full border text-[9px] font-mono ${
              answer.explicit
                ? 'text-[#D4A03C] border-[#D4A03C]/50 bg-[#D4A03C]/10'
                : 'text-[#B9A26D] border-[#D4A03C]/20'}`}>
              {answer.label}
            </span>
          )}
          {answer && answer.shadows > 0 && (
            <span className="text-[9px] font-mono text-amber-400" title={`${answer.shadows} of this question's dials carry your edits`}>
              {answer.shadows}●
            </span>
          )}
          <span className="text-[9px] font-mono text-[#8A96AD]">{entries.length}</span>
        </span>
      </button>
      <Reveal open={open}>
        {embed && (
          /* the owning editor leads; the informational rows follow */
          <div className="pt-2 pb-1">{embed}</div>
        )}
        {/* IA-3 Option B: rows flow two-across on wide screens (grid auto-placement —
            left, right, then down); sub-headers span both columns. */}
        <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-x-6 items-start">
          {subgroupCells(id, entries).map((cell) => (
            <Fragment key={cell.name ?? '(all)'}>
              {cell.name && (
                <div className="xl:col-span-2 pt-2 pb-0.5 text-[9px] font-mono uppercase tracking-wider text-[#8A96AD]">
                  {cell.name}
                </div>
              )}
              {cell.entries.map((e) => <GridRow key={e.row.key} entry={e} />)}
            </Fragment>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

const SPECIES_LABEL: Record<string, string> = {
  BELIEF: 'Beliefs', POLICY: 'Policies', EVENT: 'Events',
  INFRA: 'Infrastructure', 'OVERRIDE-VEHICLE': 'Infrastructure',
};
const FILTER_RESULT_CAP = 60;

/** Chip button for the filter bar. */
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-2 py-0.5 rounded-full text-[9px] font-mono border transition-colors ${
        active ? 'text-[#D4A03C] border-[#D4A03C]/50 bg-[#D4A03C]/10'
          : 'text-[#8A96AD] border-white/10 hover:border-white/25'}`}>
      {label}
    </button>
  );
}

export function AdvancedGrid() {
  const [tab, setTab] = useState<(typeof SPECIES_TABS)[number]>('BELIEF');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (g: string) => setOpen({ ...open, [g]: !open[g] });
  const [filter, setFilter] = useState<GridFilter>(EMPTY_FILTER);
  const config = useSimulationStore((s) => s.config);
  const composition = useSimulationStore((s) => s.composition);
  const provenance = useMemo(() => computeCompositionProvenance(config), [config, composition]);
  const filterActive = filterIsActive(filter);
  const results = useMemo(() => {
    if (!filterActive) return [];
    return [...ADVANCED_GRID_REGISTRY.values()]
      .filter((e) => gridRowMatches(e, filter, provenance, DIAL_EXPLANATIONS[e.row.key]));
  }, [filterActive, filter, provenance]);
  // R3c (P1-8): diff-from-default — the scenario-summary table. Reads the SAME
  // captured effective object the rows render (the one-producer rule).
  const [diffMode, setDiffMode] = useState(false);
  const gridTimeline = useSimulationStore((s) => s.timeline);
  const diff = useMemo(() => (diffMode ? diffAgainstDefaults(getLastEffectiveConfig() ?? computeEffectiveConfig(config)) : []),
    [diffMode, config, composition, gridTimeline]);
  // R3c (P1-7): consume an axis deep link — Beliefs tab, group opened, scrolled.
  const focus = useSimulationStore((s) => s.advancedFocus);
  const clearAdvancedFocus = useSimulationStore((s) => s.clearAdvancedFocus);
  useEffect(() => {
    if (focus?.kind !== 'axis') return;
    const axis = focus.axis;
    setFilter(EMPTY_FILTER);
    setDiffMode(false);
    setTab('BELIEF');
    setOpen((o) => ({ ...o, [axis]: true }));
    setTimeout(() => document.getElementById(`grid-axis-${axis}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    clearAdvancedFocus();
  }, [focus, clearAdvancedFocus]);

  // R3c (P0-2, human names): the Beliefs tab renders the SIDEBAR'S six groups with the
  // axis short-form questions as headers (the id as a small mono chip) — one mental
  // map across both surfaces. The other tabs render authored thematic group names
  // (GRID_GROUP_NAMES; singleton scalars coalesce), never raw config prefixes.
  const byAxis = useMemo(() => {
    const m = new Map<string, GridEntry[]>();
    for (const e of ADVANCED_GRID_REGISTRY.values()) {
      if (e.row.species !== 'BELIEF' || !e.row.axis) continue;
      m.set(e.row.axis, [...(m.get(e.row.axis) ?? []), e]);
    }
    return m;
  }, []);
  const namedGroups = useMemo(() => {
    if (tab === 'BELIEF') return [];
    const bySpecies = [...ADVANCED_GRID_REGISTRY.values()].filter((e) =>
      tab === 'INFRA' ? (e.row.species === 'INFRA' || e.row.species === 'OVERRIDE-VEHICLE') : e.row.species === tab);
    const m = new Map<string, GridEntry[]>();
    for (const e of bySpecies) {
      const gkey = e.row.axis ?? e.row.key.split('.')[0] ?? 'other';
      const name = GRID_GROUP_NAMES[gkey] ?? gkey;
      m.set(name, [...(m.get(name) ?? []), e]);
    }
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [tab]);

  return (
    <div className="rounded-lg border border-white/5 bg-[#0C1424] p-4">
      {/* IA-3: the orientation bars stay stuck while long groups scroll */}
      <div className="sticky top-0 z-10 bg-[#0C1424] pt-1 -mt-1 pb-1">
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {SPECIES_TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-2.5 py-1 rounded text-[10px] font-mono border ${!filterActive && tab === t ? 'text-[#D4A03C] border-[#D4A03C]/50 bg-[#D4A03C]/10' : 'text-[#8A96AD] border-white/10'}`}>
            {t === 'BELIEF' ? 'Beliefs' : t === 'POLICY' ? 'Policies' : t === 'EVENT' ? 'Events' : 'Infrastructure'}
          </button>
        ))}
      </div>
      {/* R3c (P1-5): the filter bar — search spans ALL species; chips compose. */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <input
          type="search"
          value={filter.query}
          onChange={(e) => setFilter({ ...filter, query: e.target.value })}
          placeholder="Search parameters…"
          className="w-44 bg-[#080D18] border border-white/10 rounded px-2 py-1 text-[10px] font-mono text-[#E8ECF4] placeholder:text-[#8A96AD]/60 focus:outline-none focus:border-[#D4A03C]/50"
        />
        <FilterChip label="cited" active={filter.cite === 'cited'}
          onClick={() => setFilter({ ...filter, cite: filter.cite === 'cited' ? null : 'cited' })} />
        <FilterChip label="episode" active={filter.cite === 'episode'}
          onClick={() => setFilter({ ...filter, cite: filter.cite === 'episode' ? null : 'episode' })} />
        <FilterChip label="uncertain" active={filter.cite === 'honest-uncertainty'}
          onClick={() => setFilter({ ...filter, cite: filter.cite === 'honest-uncertainty' ? null : 'honest-uncertainty' })} />
        <FilterChip label="my worldview" active={filter.worldview}
          onClick={() => setFilter({ ...filter, worldview: !filter.worldview })} />
        <FilterChip label="shadowed" active={filter.shadowed}
          onClick={() => setFilter({ ...filter, shadowed: !filter.shadowed })} />
        <FilterChip label="explained" active={filter.explained}
          onClick={() => setFilter({ ...filter, explained: !filter.explained })} />
        <FilterChip label="changed from default" active={diffMode}
          onClick={() => setDiffMode(!diffMode)} />
        {filterActive && (
          <button onClick={() => setFilter(EMPTY_FILTER)}
            className="text-[9px] font-mono text-[#8A96AD] underline">clear</button>
        )}
        {filterActive && (
          <span className="text-[9px] font-mono text-[#D4A03C] ml-auto">{results.length} match{results.length === 1 ? '' : 'es'}</span>
        )}
      </div>
      </div>
      {diffMode ? (
        <div className="flex flex-col">
          <p className="text-[10px] text-[#8A96AD] pb-2">
            Every parameter your worldview, packages, or edits moved off its default —
            with the value the run uses, the default it replaced, and who set it.
          </p>
          {diff.length === 0 && (
            <p className="text-[10px] font-mono text-[#8A96AD]">Nothing differs from the defaults.</p>
          )}
          {diff.map(({ entry: e, value, defaultValue }) => {
            const p = provenance[e.row.key];
            const origin = p
              ? (p.shadowed ? `you · shadows ${p.origin}` : p.origin)
              : 'you';
            const show = (x: number | string | boolean | null) =>
              x === null ? '(derived)' : typeof x === 'number' ? String(e.scale.toDisplay(x).toPrecision(4)) : String(x);
            return (
              <div key={e.row.key} className="py-1 border-b border-white/5 last:border-b-0">
              {/* amendment 1: the breadcrumb rides the diff rows too */}
              <div className="text-[8px] font-mono text-[#8A96AD]">{breadcrumbFor(e.row.key)}</div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#E8ECF4] truncate" title={e.row.key}>
                  {e.row.title || e.row.key.split('.').pop()}
                </span>
                <span className="text-[10px] font-mono shrink-0">
                  <span className="text-[#D4A03C]">{show(value)}</span>
                  <span className="text-[#8A96AD]"> ← {show(defaultValue)}</span>
                </span>
                <span className={`px-1 rounded border text-[8px] font-mono shrink-0 ${
                  p ? (p.shadowed ? 'text-amber-400 border-amber-400/40' : 'text-cyan-400 border-cyan-400/30')
                    : 'text-[#D4A03C] border-[#D4A03C]/40'}`}>
                  {origin}
                </span>
              </div>
              </div>
            );
          })}
        </div>
      ) : filterActive ? (
        <div className="flex flex-col">
          {results.slice(0, FILTER_RESULT_CAP).map((e) => (
            <div key={e.row.key}>
              {/* amendment 1: the full breadcrumb — disambiguation survives flattening */}
              <div className="pt-1.5 text-[8px] font-mono text-[#8A96AD]">
                {SPECIES_LABEL[e.row.species]} · {breadcrumbFor(e.row.key)}
              </div>
              <GridRow entry={e} />
            </div>
          ))}
          {results.length > FILTER_RESULT_CAP && (
            <p className="pt-2 text-[9px] font-mono text-[#8A96AD]">
              +{results.length - FILTER_RESULT_CAP} more — narrow the search to see the rest (nothing hidden is unmatched; the count above is complete).
            </p>
          )}
          {results.length === 0 && (
            <p className="pt-2 text-[10px] text-[#8A96AD]">No parameters match.</p>
          )}
        </div>
      ) : tab === 'BELIEF' ? (
        <div className="flex flex-col gap-1">
          {AXIS_GROUPS.map((g) => (
            <div key={g.title}>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A96AD] pt-2 pb-1">{g.title}</div>
              <div className="flex flex-col gap-2">
                {g.axes.filter((a) => byAxis.has(a)).map((axis) => (
                  <GroupCard key={axis} id={axis} name={AXIS_SHORT_FORMS[axis] ?? axis} chip={axis}
                    entries={byAxis.get(axis)!} open={!!open[axis]} onToggle={() => toggle(axis)}
                    answer={axisAnswerState(axis, composition.axes, provenance)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {namedGroups.map(([name, entries]) => (
            <GroupCard key={name} id={name} name={name}
              entries={entries} open={!!open[name]} onToggle={() => toggle(name)}
              embed={EMBEDDED_EDITORS[name]?.()} />
          ))}
        </div>
      )}
    </div>
  );
}
