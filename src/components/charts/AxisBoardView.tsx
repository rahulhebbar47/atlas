/**
 * DEPRECATED (R3a' — the redesign ruling): the worldview surface re-hosted into the
 * LEFT SIDEBAR (src/components/controls/WorldviewSidebar.tsx); this view is UNMOUNTED
 * (kept per the no-delete rule; its store semantics live on — the sidebar drives the
 * same composition actions, asserted by the sidebar-parity battery).
 *
 * THE AXIS BOARD (R3a, tier 2 of the ratified three-tier UX).
 *
 * Twelve axes as labeled ordinal selectors: the one-sentence QUESTION is each card's
 * header (Instrument Serif — the design system's display face); variant chips carry the
 * variant name; the selected chip exposes the manifest's rationale and citation labels.
 * The Buildout group frames A11/A12 side by side. The events strip anchors happenings
 * to years; the conflict surface renders the composer's REFUSALS by name — never
 * silent. The policy list renders designLabels over the subsumed preset machinery.
 * Provenance badges render on every composed surface; shadowed keys badge with the
 * one-tap reset (§3.2).
 *
 * Design tokens per docs/Design/DESIGN_PHILOSOPHY.md: surfaces #0C1424/#13203A, text
 * #E8ECF4/#8A96AD, gold accent #D4A03C; 4-level hierarchy; density earned.
 */
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useSimulationStore, computeCompositionProvenance } from '@/stores/simulationStore';
import type { CompositionState } from '@/stores/simulationStore';
import { ALL_VARIANT_MANIFESTS, AXIS_QUESTIONS } from '@/data/manifests/axes';
import { EVENT_MANIFESTS } from '@/data/manifests/events';
import { POLICY_MANIFESTS, HIDDEN_POLICY_IDS } from '@/data/manifests/policies';
import { togglePolicyExclusive } from '@/models/manifestCompiler';

const AXIS_ORDER = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10'] as const;
const GOVERNMENT = ['A13', 'A14'] as const; // R2b: environment actors as beliefs
const BUILDOUT = ['A11', 'A12'] as const;

const LABEL_COLORS: Record<string, string> = {
  cited: 'text-emerald-400 border-emerald-400/30',
  episode: 'text-sky-400 border-sky-400/30',
  'honest-uncertainty': 'text-amber-400 border-amber-400/30',
};

function AxisCard({ axis, composition, onSelect }: {
  axis: string;
  composition: CompositionState;
  onSelect: (axis: string, variant: string | null) => void;
}) {
  const [showRationale, setShowRationale] = useState(false);
  const variants = useMemo(
    () => ALL_VARIANT_MANIFESTS.filter((v) => v.axis === axis).sort((a, b) => a.ordinal - b.ordinal),
    [axis],
  );
  const selected = composition.axes[axis];
  const selectedManifest = variants.find((v) => v.variant === selected);
  return (
    <div className="rounded-lg border border-white/5 bg-[#0C1424] p-4 flex flex-col gap-3">
      {/* Level 2 header: the axis QUESTION — the card's identity */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-serif text-[15px] leading-snug text-[#E8ECF4]">{AXIS_QUESTIONS[axis]}</h3>
        <span className="font-mono text-[10px] text-[#8A96AD] shrink-0 pt-0.5">{axis}</span>
      </div>
      {/* variant chips: an ordinal selector — one may be active (beliefs exclude) */}
      <div className="flex flex-wrap gap-1.5">
        {variants.map((v) => {
          const active = v.variant === selected;
          return (
            <button
              key={v.variant}
              onClick={() => onSelect(axis, active ? null : v.variant)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border ${
                active
                  ? 'bg-[#D4A03C]/15 border-[#D4A03C]/60 text-[#D4A03C]'
                  : 'bg-transparent border-white/10 text-[#8A96AD] hover:border-white/25 hover:text-[#E8ECF4]'
              }`}
              title={v.rationaleText}
            >
              {v.variant}
            </button>
          );
        })}
      </div>
      {/* the rationale affordance: labels + text for the selected variant */}
      {selectedManifest && (
        <div className="border-t border-white/5 pt-2">
          <button
            onClick={() => setShowRationale(!showRationale)}
            className="text-[10px] font-mono text-[#8A96AD] hover:text-[#D4A03C]"
          >
            {showRationale ? '▾ rationale & citations' : '▸ rationale & citations'}
          </button>
          {showRationale && (
            <div className="mt-2 flex flex-col gap-2">
              <p className="text-[11px] leading-relaxed text-[#8A96AD]">{selectedManifest.rationaleText}</p>
              <div className="flex flex-wrap gap-1">
                {selectedManifest.values.map((e) => (
                  <span key={e.key}
                    className={`px-1.5 py-0.5 rounded border text-[9px] font-mono ${LABEL_COLORS[e.label]}`}
                    title={`${e.key} = ${e.value} [${e.label}]${e.rationale ? ` — ${e.rationale}` : ''}`}
                  >
                    {e.key.split('.').pop()} <span className="opacity-70">{String(e.value)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AxisBoardView() {
  const { composition, compositionConflicts, config } = useSimulationStore(useShallow((s) => ({
    composition: s.composition,
    compositionConflicts: s.compositionConflicts,
    config: s.config,
  })));
  const setComposition = useSimulationStore((s) => s.setComposition);
  const resetShadow = useSimulationStore((s) => s.resetShadow);
  const clearComposition = useSimulationStore((s) => s.clearComposition);
  const provenance = useMemo(() => computeCompositionProvenance(config), [config, composition]);
  const shadows = Object.entries(provenance).filter(([, p]) => p.shadowed);

  const selectVariant = (axis: string, variant: string | null) => {
    const axes = { ...composition.axes };
    if (variant === null) delete axes[axis]; else axes[axis] = variant;
    setComposition({ ...composition, axes });
  };
  const toggleEvent = (id: string, anchorYear: number) => {
    const has = composition.events.some((e) => e.id === id);
    setComposition({
      ...composition,
      events: has ? composition.events.filter((e) => e.id !== id) : [...composition.events, { id, anchorYear }],
    });
  };
  const setAnchor = (id: string, anchorYear: number) =>
    setComposition({
      ...composition,
      events: composition.events.map((e) => (e.id === id ? { ...e, anchorYear } : e)),
    });
  // Radio-within-slot (owner ruling 2026-08-01): a second package on the same slot
  // REPLACES the first — the conflict refusal is unreachable from this surface.
  // Retired form, kept per no-delete:
  //   policies: composition.policies.includes(id)
  //     ? composition.policies.filter((p) => p !== id)
  //     : [...composition.policies, id],
  const togglePolicy = (id: string) =>
    setComposition({
      ...composition,
      policies: togglePolicyExclusive(composition.policies, id, POLICY_MANIFESTS),
    });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
      {/* Level 1: view title */}
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="font-serif text-2xl text-[#E8ECF4]">Worldviews</h2>
          <p className="text-[12px] text-[#8A96AD] mt-1 max-w-2xl">
            Twelve empirical questions. Each variant is a complete, cited assignment of the
            question&apos;s parameters — beliefs exclude; events happen; policies compose.
          </p>
        </div>
        {(Object.keys(composition.axes).length > 0 || composition.events.length > 0 || composition.policies.length > 0) && (
          <button onClick={clearComposition}
            className="text-[11px] font-mono text-[#8A96AD] hover:text-red-400 border border-white/10 rounded px-2 py-1">
            clear composition
          </button>
        )}
      </div>

      {/* THE CONFLICT SURFACE: the composer's refusals, by name — never silent */}
      {compositionConflicts.length > 0 && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-3">
          <div className="text-[12px] font-mono text-red-400 mb-1">composition refused — resolve to apply:</div>
          {compositionConflicts.map((c, i) => (
            <div key={i} className="text-[11px] text-[#E8ECF4] font-mono">
              {c.between[0]} ∩ {c.between[1]} on {c.key}{c.years ? ` (years ${c.years.slice(0, 4).join(', ')}${c.years.length > 4 ? '…' : ''})` : ''}
            </div>
          ))}
        </div>
      )}

      {/* shadow badges (§3.2): user values shadowing composed variants, one-tap reset */}
      {shadows.length > 0 && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-3 flex flex-col gap-1">
          {shadows.map(([key, p]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-amber-400">
                {key} — your value shadows [{p.origin}]
              </span>
              <button onClick={() => resetShadow(key)}
                className="text-[10px] font-mono border border-amber-400/40 text-amber-400 rounded px-1.5 py-0.5 hover:bg-amber-400/10">
                reset to variant
              </button>
            </div>
          ))}
        </div>
      )}

      {/* the ten measured axes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {AXIS_ORDER.map((axis) => (
          <AxisCard key={axis} axis={axis} composition={composition} onSelect={selectVariant} />
        ))}
      </div>

      {/* THE GOVERNMENT group (R2b): Washington + the Fed as environment-actor beliefs */}
      <div>
        <h3 className="font-serif text-lg text-[#E8ECF4] mb-2">The Government</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {GOVERNMENT.map((axis) => (
            <AxisCard key={axis} axis={axis} composition={composition} onSelect={selectVariant} />
          ))}
        </div>
      </div>

      {/* THE BUILDOUT group: two one-dial detented axes, side by side under the heading */}
      <div>
        <h3 className="font-serif text-lg text-[#E8ECF4] mb-2">The Buildout</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {BUILDOUT.map((axis) => (
            <AxisCard key={axis} axis={axis} composition={composition} onSelect={selectVariant} />
          ))}
        </div>
      </div>

      {/* the events strip: year-anchored happenings */}
      <div>
        <h3 className="font-serif text-lg text-[#E8ECF4] mb-2">Events</h3>
        <div className="flex flex-wrap gap-3">
          {EVENT_MANIFESTS.map((ev) => {
            const active = composition.events.find((e) => e.id === ev.id);
            return (
              <div key={ev.id}
                className={`rounded-lg border p-3 w-64 ${active ? 'border-orange-400/50 bg-orange-400/5' : 'border-white/10 bg-[#0C1424]'}`}>
                <button onClick={() => toggleEvent(ev.id, 2031)} className="text-left w-full">
                  <div className={`text-[13px] font-medium ${active ? 'text-orange-400' : 'text-[#E8ECF4]'}`}>{ev.title}</div>
                  <div className="text-[10px] text-[#8A96AD] mt-1 line-clamp-2" title={ev.rationaleText}>{ev.rationaleText}</div>
                </button>
                {active && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#8A96AD]">anchor</span>
                    <input type="range" min={2026} max={2045} step={1} value={active.anchorYear}
                      onChange={(e) => setAnchor(ev.id, Number(e.target.value))} className="flex-1 accent-[#D4A03C]" />
                    <span className="text-[11px] font-mono text-[#D4A03C]">{active.anchorYear}</span>
                    <span className="text-[9px] font-mono text-[#8A96AD]">
                      {ev.recovery === 'permanent' ? 'permanent' : 'recovers'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* the policy list: packages on the subsumed machinery, designLabels visible */}
      <div>
        <h3 className="font-serif text-lg text-[#E8ECF4] mb-2">Policy packages</h3>
        <div className="flex flex-col gap-2">
          {/* the per-field rebuild: the hidden set applies here too (the legacy board
              had no filter — the retired packages kept rendering) */}
          {POLICY_MANIFESTS.filter((p) => !HIDDEN_POLICY_IDS.has(p.id)).map((p) => {
            const active = composition.policies.some((e) => e.id === p.id);
            return (
              <button key={p.id} onClick={() => togglePolicy(p.id)}
                className={`text-left rounded-lg border p-3 ${active ? 'border-[#3B82F6]/50 bg-[#3B82F6]/5' : 'border-white/10 bg-[#0C1424] hover:border-white/25'}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className={`text-[13px] font-medium ${active ? 'text-[#3B82F6]' : 'text-[#E8ECF4]'}`}>{p.title}</span>
                  {/* referent line unrendered (owner directive 2026-08-01 — the citation
                      stays in the manifest record, not the card):
                  {p.referent && <span className="text-[9px] font-mono text-emerald-400 shrink-0">referent: {p.referent.split('(')[0]?.trim()}</span>} */}
                </div>
                <p className="text-[11px] text-[#8A96AD] mt-1">{p.designLabel}</p>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
