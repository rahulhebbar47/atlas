/**
 * THE WORLDVIEW SIDEBAR (R3a′ — the redesign ruling's re-host; tier 2 IS the sidebar).
 *
 * Three zones teaching the species law without naming it: WHAT DO YOU BELIEVE?
 * (fourteen axes, six accordion groups, SHORT forms — the full question one hover/tap
 * away), WHAT HAPPENS? (events with anchor-year steppers; the conflict banner),
 * WHAT DO WE CHOOSE? (true packages only — the fiscal/Fed selectors are axis chips in
 * The Government per the R2b species correction). Persistent Advanced footer.
 *
 * THE EXPLICIT-SELECTION SEMANTICS (ruled at R2b acceptance, addition 1):
 * quiet-preselected Consensus is DISPLAY STATE (records NOTHING — the empty composition
 * compiles to zero); explicitly tapping Consensus RECORDS the selection (the badge tells
 * the truth; the identity battery guarantees the values cannot differ).
 *
 * Tokens per docs/Design/DESIGN_PHILOSOPHY.md; density earned — nothing renders by
 * default except short forms, chips, and group summaries.
 */
import { useMemo, useState, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSimulationStore, computeCompositionProvenance } from '@/stores/simulationStore';
import type { CompositionState } from '@/stores/simulationStore';
import {
  ALL_VARIANT_MANIFESTS, AXIS_GROUPS, AXIS_QUESTIONS, AXIS_SHORT_FORMS, CONSENSUS_VARIANT,
  CONSENSUS_FINDING_LINE,
} from '@/data/manifests/axes';
import { EVENT_MANIFESTS } from '@/data/manifests/events';
import { POLICY_MANIFESTS, HIDDEN_POLICY_IDS } from '@/data/manifests/policies';
import { togglePolicyExclusive, readPolicyParams } from '@/models/manifestCompiler';
import { getLastEffectiveConfig } from '@/stores/simulationStore';
import type { PolicyManifest } from '@/types/manifests';
import { Reveal } from '@/components/shared/Reveal';
import { ModelBoundariesOverlay } from '@/components/shared/ModelBoundaries';
import { AnimatedRange } from '@/components/shared/AnimatedRange';
import { SegmentedControl } from '@/components/shared/SegmentedControl';
import { DIAL_BY_KEY } from '@/data/dialTable';

/** The believe-zone scroll anchor — the chip's "Test My Own" call scrolls here. */
export const BELIEVE_ZONE_ID = 'zone-what-do-you-believe';

// HIDDEN_POLICY_IDS moved to data/manifests/policies.ts (the per-field rebuild —
// shared with AxisBoardView; the full package joins the hidden set there).

/** Card-param display formatting by the spec's unit hint. */
function formatParamValue(value: number, unit?: string): string {
  switch (unit) {
    case '$': return `$${value.toLocaleString()}`;
    case '$B': return `$${value}B`;
    case '%': return `${Math.round(value * 1000) / 10}%`;
    case 'wk': return `${value} wk`;
    default: return `${value}`;
  }
}

const LABEL_COLORS: Record<string, string> = {
  cited: 'text-emerald-400 border-emerald-400/30',
  episode: 'text-sky-400 border-sky-400/30',
  'honest-uncertainty': 'text-amber-400 border-amber-400/30',
};

/** THE SLIDER-ROW GRAMMAR (owner order, UI/UX pass; root-caused rebuild): ONE row
 *  form for BOTH card families — the parameter's name LEFT-ALIGNED, the slider
 *  filling the middle, the value RIGHT-ALIGNED. The rows of a card share ONE GRID
 *  (max-content | 1fr | max-content): the panel is 280px wide, so FIXED label/value
 *  reservations starved the 1fr track to a stub (the root cause — 80px label + 56px
 *  value + gaps left ~68px of a ~220px row); natural-width columns give the track
 *  everything the text does not actually need, and the grid keeps the columns
 *  aligned across a card's rows. The input carries min-w-0/w-full so its intrinsic
 *  ~129px minimum can never inflate or starve the middle column. */
function SliderGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,max-content)_minmax(0,1fr)_max-content] items-center gap-x-2 gap-y-1">
      {children}
    </div>
  );
}
function SliderRow({ label, value, accent, trailing, children }: {
  label: string;
  value: string;
  accent: string;
  /** Optional control rendered after the value (e.g., the permanent toggle). */
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="contents">
      <span className="text-[8px] font-mono text-[#8A96AD] max-w-[88px] truncate text-left">{label}</span>
      <div className="min-w-0 flex items-center">{children}</div>
      <span className={`text-[10px] font-mono text-right justify-self-end flex items-center gap-1 ${accent}`}>
        {value}
        {trailing}
      </span>
    </div>
  );
}

/** THE CARD PARAMS (the per-field rebuild + the bidirectional-sync addendum): each
 *  declared param renders as a range whose VALUE is the projection of the EFFECTIVE
 *  config — an Advanced edit to the same key shows here automatically; a card write
 *  updates the composition param and RECLAIMS the key from any Advanced shadow (last
 *  writer wins, whichever surface). Nothing is written on expand — params enter the
 *  composition only on user interaction (DEFAULT-IDENTITY; the world signature). */
function PolicyParamRows({ manifest, values, onChange }: {
  manifest: PolicyManifest;
  values: Record<string, number>;
  onChange: (paramId: string, value: number) => void;
}) {
  return (
    <div className="mt-1.5">
      <SliderGrid>
        {(manifest.params ?? []).map((spec) => (
          <SliderRow key={spec.id} label={spec.title} accent="text-[#3B82F6]"
            value={formatParamValue(values[spec.id] ?? spec.default, spec.unit)}>
            <AnimatedRange min={spec.min} max={spec.max} step={spec.step}
              value={values[spec.id] ?? spec.default}
              onChange={(v) => onChange(spec.id, v)} className="w-full min-w-0" />
          </SliderRow>
        ))}
      </SliderGrid>
    </div>
  );
}

function ZoneHeader({ children }: { children: string }) {
  return (
    <h3 className="font-serif text-[13px] tracking-wide text-[#E8ECF4] pt-5 pb-2">{children}</h3>
  );
}

/** R3c (S4 polish): resolve a conflict member id to its user-facing title. */
function conflictMemberTitle(id: string): string {
  return EVENT_MANIFESTS.find((e) => e.id === id)?.title
    ?? POLICY_MANIFESTS.find((p) => p.id === id)?.title
    ?? id;
}

/** R3c (S4 polish): a readable label for a conflict target (slot or key). */
function conflictTargetLabel(key: string): string {
  if (key === 'slot:policyPreset') return 'the support-program slot';
  if (key === 'slot:fiscalPreset') return 'the fiscal-response slot';
  if (key === 'slot:fedPreset') return 'the Federal Reserve slot';
  const raw = key.startsWith('config:') ? key.slice(7) : key;
  return DIAL_BY_KEY.get(raw)?.title || raw;
}

/** R3c (P2, tooltip accessibility): a tap path for hover-only text — the small '?'
 *  toggles the card's reasoning inline (no selection side effect). */
function DetailToggle({ open, onToggle }: { open?: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} aria-label="Show reasoning"
      className={`shrink-0 w-4 h-4 rounded-full border text-[9px] font-mono leading-none ${
        open ? 'border-[#D4A03C]/50 text-[#D4A03C]' : 'border-white/15 text-[#8A96AD] hover:border-white/30'}`}>
      ?
    </button>
  );
}

function AxisRow({ axis, composition, onSelect }: {
  axis: string;
  composition: CompositionState;
  onSelect: (axis: string, variant: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const setAdvancedFocus = useSimulationStore((s) => s.setAdvancedFocus);
  const variants = useMemo(
    () => ALL_VARIANT_MANIFESTS.filter((v) => v.axis === axis).sort((a, b) => a.ordinal - b.ordinal),
    [axis],
  );
  const recorded = composition.axes[axis];              // an EXPLICIT selection, or none
  const consensus = CONSENSUS_VARIANT[axis];
  const detail = variants.find((v) => v.variant === (recorded ?? consensus));
  return (
    <div className="py-2.5 border-b border-white/5 last:border-b-0">
      {/* THE STRUT RULE (owner-reported spacing, root-caused by DOM probe): the
          type size + line-height live on the BUTTON, not the span — an unstyled
          button keeps the page's 16px/24px font, and a block's own line-height sets
          the MINIMUM line box ("strut") for every line inside it, so a 12px span
          wrapped inside it sat on 24px lines no matter what the span declared. */}
      <button onClick={() => setExpanded(!expanded)}
        className="w-full text-left text-[12px]/[1.3]"
        title={AXIS_QUESTIONS[axis]} /* B-1: the full question one hover away */>
        <span className="font-medium text-[#E8ECF4]">
          {AXIS_SHORT_FORMS[axis]}
        </span>
      </button>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {variants.map((v) => {
          const isRecorded = v.variant === recorded;
          const isQuietConsensus = !recorded && v.variant === consensus;
          return (
            <button
              key={v.variant}
              onClick={() => onSelect(axis, isRecorded ? null : v.variant)}
              title={v.rationaleText}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${
                isRecorded
                  ? 'bg-[#D4A03C]/15 border-[#D4A03C]/60 text-[#D4A03C]'          // ACTIVE: recorded
                  : isQuietConsensus
                    ? 'bg-white/[0.03] border-[#D4A03C]/25 text-[#B9A26D]'         // QUIET: display default
                    : 'bg-transparent border-white/10 text-[#8A96AD] hover:border-white/25 hover:text-[#E8ECF4]'
              }`}
            >
              {v.displayName ?? v.variant}
            </button>
          );
        })}
      </div>
      <Reveal open={expanded && !!detail}>
        {detail && (
        <div className="mt-2 rounded border border-white/5 bg-[#0C1424] p-2 flex flex-col gap-1.5">
          <p className="font-serif text-[12px]/[1.35] text-[#E8ECF4]">{AXIS_QUESTIONS[axis]}</p>
          {/* R3c (P2, tooltip accessibility): EVERY variant's reasoning is tap-reachable
              here — no hover required, no selection side effect. */}
          <div className="flex flex-col gap-1">
            {variants.map((v) => (
              <p key={v.variant} className="text-[10px] leading-relaxed text-[#8A96AD]">
                <span className={v.variant === (recorded ?? consensus) ? 'text-[#D4A03C]' : 'text-[#E8ECF4]'}>
                  {v.displayName ?? v.variant}.
                </span>{' '}
                {v.rationaleText}
              </p>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {detail.values.slice(0, 8).map((e) => (
              <span key={e.key}
                className={`px-1 py-0.5 rounded border text-[8px] font-mono ${LABEL_COLORS[e.label]}`}
                title={`${e.key} = ${e.value} [${e.label}]`}>
                {e.key.split('.').pop()}
              </span>
            ))}
            {detail.values.length > 8 && (
              <span className="text-[8px] font-mono text-[#8A96AD]">+{detail.values.length - 8} in Advanced</span>
            )}
          </div>
          {/* R3c (P1-7): the per-axis deep link — opens Advanced with this axis's
              group opened and scrolled */}
          <button onClick={() => setAdvancedFocus({ kind: 'axis', axis })}
            className="self-start text-[9px] font-mono text-[#D4A03C] hover:underline">
            Tune this axis in Advanced →
          </button>
        </div>
        )}
      </Reveal>
    </div>
  );
}

export function WorldviewSidebar() {
  const { composition, compositionConflicts, config } = useSimulationStore(useShallow((s) => ({
    composition: s.composition,
    compositionConflicts: s.compositionConflicts,
    config: s.config,
  })));
  const setComposition = useSimulationStore((s) => s.setComposition);
  const setPolicyParam = useSimulationStore((s) => s.setPolicyParam);
  const resetShadow = useSimulationStore((s) => s.resetShadow);
  const setActiveView = useSimulationStore((s) => s.setActiveView);
  const setAdvancedFocus = useSimulationStore((s) => s.setAdvancedFocus);
  // The bidirectional-sync read (one producer): the card params project off the
  // EFFECTIVE config the run consumed — Advanced edits show up here automatically.
  const timeline = useSimulationStore((s) => s.timeline);
  const effective = useMemo(() => getLastEffectiveConfig() ?? config, [timeline, config]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ 'The Technology': true });
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});
  const toggleDetail = (id: string) => setOpenDetails({ ...openDetails, [id]: !openDetails[id] });
  const [boundariesOpen, setBoundariesOpen] = useState(false);
  const provenance = useMemo(() => computeCompositionProvenance(config), [config, composition]);
  const shadows = Object.entries(provenance).filter(([, p]) => p.shadowed);
  const activityCount = shadows.length + composition.events.length
    + Object.keys(composition.axes).length + composition.policies.length;

  const selectVariant = (axis: string, variant: string | null) => {
    const axes = { ...composition.axes };
    if (variant === null) delete axes[axis]; else axes[axis] = variant;
    setComposition({ ...composition, axes });
  };
  const toggleEvent = (id: string) => {
    const has = composition.events.some((e) => e.id === id);
    // R3b rider: the manifest's defaultAnchorYear, never a hardcoded year
    const manifest = EVENT_MANIFESTS.find((ev) => ev.id === id);
    setComposition({
      ...composition,
      events: has ? composition.events.filter((e) => e.id !== id)
        : [...composition.events, { id, anchorYear: manifest?.defaultAnchorYear ?? 2031 }],
    });
  };
  const setAnchor = (id: string, anchorYear: number) =>
    setComposition({ ...composition, events: composition.events.map((e) => (e.id === id ? { ...e, anchorYear } : e)) });
  // The supply-shock build (ruled): the duration and severity knobs write the composed row.
  const setDuration = (id: string, durationYears: number | undefined) =>
    setComposition({ ...composition, events: composition.events.map((e) => {
      if (e.id !== id) return e;
      if (durationYears === undefined) { const { durationYears: _drop, ...rest } = e; void _drop; return rest; }
      return { ...e, durationYears };
    }) });
  const setSeverity = (id: string, severity: 'mild' | 'medium' | 'severe') =>
    setComposition({ ...composition, events: composition.events.map((e) => (e.id === id ? { ...e, severity } : e)) });
  // Radio-within-slot (owner ruling 2026-08-01): a second package on the same slot
  // REPLACES the first — the conflict refusal is unreachable from this surface.
  // Retired form, kept per no-delete:
  //   policies: composition.policies.includes(id)
  //     ? composition.policies.filter((p) => p !== id) : [...composition.policies, id],
  const togglePolicy = (id: string) =>
    setComposition({
      ...composition,
      policies: togglePolicyExclusive(composition.policies, id, POLICY_MANIFESTS),
    });
  const groupSummary = (axes: string[]): string => {
    const set = axes.filter((a) => composition.axes[a]).length;
    return set === 0 ? 'default' : `${set} set`;
  };

  return (
    <div className="flex flex-col">
      {/* zone 1: beliefs — id: the chip's "Test My Own" scroll target (ScenarioManager) */}
      <div id={BELIEVE_ZONE_ID}>
        <ZoneHeader>WHAT DO YOU BELIEVE?</ZoneHeader>
      </div>
      {/* The consensus finding line (the default-crisis rulings, ruling 1): the quiet
          consensus lives here, so its honest projection is stated here — one producer
          (the manifest constant), verbatim-locked by battery DR-1. */}
      <p className="text-[10px] leading-relaxed text-[#8A96AD] mb-2">
        {CONSENSUS_FINDING_LINE}
      </p>
      <div className="flex flex-col gap-2">
        {AXIS_GROUPS.map((g) => (
          <div key={g.title} className="rounded-lg border border-white/5 bg-[#0C1424] px-3 py-2">
            <button onClick={() => setOpenGroups({ ...openGroups, [g.title]: !openGroups[g.title] })}
              className="w-full flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#E8ECF4]">{openGroups[g.title] ? '▾' : '▸'} {g.title}</span>
              <span className={`text-[9px] font-mono ${groupSummary(g.axes) === 'default' ? 'text-[#8A96AD]' : 'text-[#D4A03C]'}`}>
                {groupSummary(g.axes)}
              </span>
            </button>
            <Reveal open={!!openGroups[g.title]}>
              <div className="mt-1">
                {g.axes.map((axis) => (
                  <AxisRow key={axis} axis={axis} composition={composition} onSelect={selectVariant} />
                ))}
              </div>
            </Reveal>
          </div>
        ))}
      </div>

      {/* zone 2: events */}
      <ZoneHeader>WHAT HAPPENS?</ZoneHeader>
      {compositionConflicts.length > 0 && (
        /* R3c (S4 polish): the conflict surface speaks plainly — titles, not ids;
           the refusal and its resolution stated in one breath. */
        <div className="rounded border border-red-500/40 bg-red-500/5 p-2 mb-2">
          <div className="text-[10px] font-medium text-red-400">These selections conflict — nothing was applied:</div>
          {compositionConflicts.map((c, i) => (
            <div key={i} className="text-[9px] leading-relaxed text-[#E8ECF4] mt-0.5">
              {conflictMemberTitle(c.between[0])} and {conflictMemberTitle(c.between[1])} both
              set {conflictTargetLabel(c.key)}. Remove or re-time one of them.
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        {EVENT_MANIFESTS.map((ev) => {
          const active = composition.events.find((e) => e.id === ev.id);
          return (
            <div key={ev.id} className={`rounded-lg border px-3 py-2 ${active ? 'border-orange-400/50 bg-orange-400/5' : 'border-white/5 bg-[#0C1424]'}`}>
              <div className="flex items-start justify-between gap-1.5">
                <button onClick={() => toggleEvent(ev.id)} className="flex-1 text-left text-[11px]/[1.3]" title={ev.rationaleText}>
                  <span className={`font-medium ${active ? 'text-orange-400' : 'text-[#E8ECF4]'}`}>
                    {active ? '● ' : '+ '}{ev.title}
                  </span>
                </button>
                <DetailToggle open={openDetails[ev.id]} onToggle={() => toggleDetail(ev.id)} />
              </div>
              {/* The expected-direction line (the supply-chain shock ruling, item 4) —
                  owner order (pre-flight polish) SUPERSEDES its default visibility: the
                  line moves INSIDE the details reveal (first, above the rationale), so
                  the honest answer stays one tap away without crowding every card.
                  The retired default-visible placement, per no-delete:
                <p className="text-[9px] leading-snug text-[#8A96AD]/80 mt-0.5">{ev.directionLine}</p> */}
              <Reveal open={!!openDetails[ev.id]}>
                <p className="text-[9px] leading-snug text-[#8A96AD]/80 mt-1">{ev.directionLine}</p>
                <p className="text-[10px] leading-relaxed text-[#8A96AD] mt-1">{ev.rationaleText}</p>
              </Reveal>
              {/* Owner order (UI/UX pass): activation EXPANDS with the house motion —
                  the shared Reveal (Framer Motion height+opacity, 0.15s) — instead of
                  snapping in; AnimatePresence keeps the content through the collapse. */}
              <Reveal open={!!active}>
              {active && (() => {
                // The supply-shock build (ruled): anchor + DURATION + SEVERITY per event.
                const bounds = ev.durationBounds ?? { min: 1, max: 15 };
                const authoredDuration = ev.recovery === 'permanent'
                  ? undefined
                  : Math.max(...ev.recovery.map((r) => r.yearOffset));
                const isPermanentNow = ev.recovery === 'permanent' && active.durationYears === undefined;
                const shownDuration = active.durationYears ?? authoredDuration;
                return (
                  <>
                    <div className="mt-1.5">
                      <SliderGrid>
                        <SliderRow label="starts" accent="text-[#D4A03C]" value={String(active.anchorYear)}>
                          <AnimatedRange min={2026} max={2045} step={1} value={active.anchorYear}
                            onChange={(v) => setAnchor(ev.id, v)} className="w-full min-w-0" />
                        </SliderRow>
                        {isPermanentNow ? (
                          <div className="contents">
                            <span className="text-[8px] font-mono text-[#8A96AD] text-left">lasts</span>
                            <span className="min-w-0 truncate text-[9px] font-mono text-[#8A96AD]">until removed</span>
                            <button onClick={() => setDuration(ev.id, bounds.min + 4)}
                              className="justify-self-end text-[8px] font-mono text-[#D4A03C]/90 border border-[#D4A03C]/30 rounded px-1 py-px hover:bg-[#D4A03C]/10">
                              set years
                            </button>
                          </div>
                        ) : (
                          <SliderRow label="lasts" accent="text-[#D4A03C]" value={`${shownDuration} yr`}
                            trailing={ev.recovery === 'permanent' ? (
                              <button onClick={() => setDuration(ev.id, undefined)}
                                className="text-[8px] font-mono text-[#8A96AD] border border-white/15 rounded px-1 py-px hover:text-[#E8ECF4]">
                                permanent
                              </button>
                            ) : undefined}>
                            <AnimatedRange min={bounds.min} max={bounds.max} step={1}
                              value={shownDuration ?? bounds.min}
                              onChange={(v) => setDuration(ev.id, v)} className="w-full min-w-0" />
                          </SliderRow>
                        )}
                      </SliderGrid>
                    </div>
                    <div className="mt-1.5">
                      <SegmentedControl
                        ariaLabel="Shock severity"
                        options={[
                          { value: 'mild', label: 'mild' },
                          { value: 'medium', label: 'medium' },
                          { value: 'severe', label: 'severe' },
                        ] as const}
                        value={active.severity ?? 'medium'}
                        onChange={(v) => setSeverity(ev.id, v)}
                      />
                    </div>
                  </>
                );
              })()}
              {active && (
                /* R3c (P1-7): the event's per-year rows are one tap away */
                <button onClick={() => setAdvancedFocus({ kind: 'per-year' })}
                  className="mt-1 text-[9px] font-mono text-orange-400/90 hover:underline">
                  See the years it touches →
                </button>
              )}
              </Reveal>
            </div>
          );
        })}
      </div>

      {/* zone 3: TRUE packages only (B-4: the fiscal/Fed selectors are Government chips) */}
      <ZoneHeader>WHAT DO WE CHOOSE?</ZoneHeader>
      <div className="flex flex-col gap-1.5">
        {POLICY_MANIFESTS.filter((p) => !HIDDEN_POLICY_IDS.has(p.id)).map((p) => {
          const active = composition.policies.some((e) => e.id === p.id);
          return (
            <div key={p.id}
              className={`rounded-lg border px-3 py-2 ${active ? 'border-[#3B82F6]/50 bg-[#3B82F6]/5' : 'border-white/5 bg-[#0C1424] hover:border-white/20'}`}>
              <div className="flex items-start justify-between gap-1.5">
                <button onClick={() => togglePolicy(p.id)} title={p.designLabel} className="flex-1 text-left text-[11px]/[1.3]">
                  <span className={`font-medium ${active ? 'text-[#3B82F6]' : 'text-[#E8ECF4]'}`}>
                    {active ? '● ' : '○ '}{p.title}
                  </span>
                  {/* referent line unrendered (owner directive 2026-08-01 — the citation
                      stays in the manifest record, not the card):
                  {p.referent && <span className="block text-[8px] font-mono text-emerald-400/80 mt-0.5">referent: {p.referent.split('(')[0]?.trim()}</span>} */}
                </button>
                <DetailToggle open={openDetails[p.id]} onToggle={() => toggleDetail(p.id)} />
              </div>
              <Reveal open={!!openDetails[p.id]}>
                <p className="text-[10px] leading-relaxed text-[#8A96AD] mt-1">{p.designLabel}</p>
              </Reveal>
              {/* the expanded card (the per-field rebuild): the package's declared
                  params, values projected off the effective config (Advanced edits
                  mirror in); a drag writes the composition param and reclaims the key */}
              {/* Owner order (UI/UX pass): the param card expands with the house
                  motion (the shared Reveal) instead of snapping in. */}
              <Reveal open={!!active && (p.params?.length ?? 0) > 0}>
                {active && (p.params?.length ?? 0) > 0 && (
                  <PolicyParamRows manifest={p}
                    values={readPolicyParams(p, effective)}
                    onChange={(paramId, v) => setPolicyParam(p.id, paramId, v)} />
                )}
              </Reveal>
            </div>
          );
        })}
      </div>

      {/* shadows (§3.2) — R3c polish: authored titles, not key fragments */}
      {shadows.length > 0 && (
        <div className="mt-3 rounded border border-amber-400/30 bg-amber-400/5 p-2 flex flex-col gap-1">
          {shadows.map(([key, p]) => (
            <div key={key} className="flex items-center justify-between gap-1">
              <span className="text-[9px] text-amber-400 truncate" title={`${key} — your value shadows ${p.origin}`}>
                {DIAL_BY_KEY.get(key)?.title || key.split('.').pop()} — yours shadows {p.origin}
              </span>
              <button onClick={() => resetShadow(key)}
                className="text-[8px] font-mono border border-amber-400/40 text-amber-400 rounded px-1 py-0.5 shrink-0">
                reset
              </button>
            </div>
          ))}
        </div>
      )}

      {/* the persistent Advanced footer */}
      <button onClick={() => setActiveView('advanced')}
        className="mt-4 w-full rounded-lg border border-white/10 bg-[#13203A] px-3 py-2.5 flex items-center justify-between hover:border-[#D4A03C]/40 transition-colors">
        <span className="text-[12px] font-medium text-[#E8ECF4]">Advanced controls →</span>
        {activityCount > 0 && (
          <span className="text-[10px] font-mono text-[#D4A03C]">{activityCount}●</span>
        )}
      </button>

      {/* DEPRECATED: owner request 2026-08-06 — remove the model-boundaries entry point from the sidebar.
          R3c (P2): the model-boundaries surface — the honest answer to what is not here */}
      {/* <button onClick={() => setBoundariesOpen(true)}
        className="mt-1.5 mb-2 w-full text-left px-3 py-1 text-[10px] text-[#8A96AD] hover:text-[#E8ECF4] transition-colors">
        What ATLAS does not model →
      </button> */}
      <ModelBoundariesOverlay open={boundariesOpen} onClose={() => setBoundariesOpen(false)} />
    </div>
  );
}
