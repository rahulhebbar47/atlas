/**
 * WORLDVIEW BUNDLE GALLERY (R3c, tier 1 — the Scenarios slot's content): named
 * belief-only compositions a casual user picks in one tap. Applying a bundle writes
 * ONLY the belief layer (events and policies stay yours); clearing returns the world
 * exactly (composition purity).
 */
import { useState } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { WORLDVIEW_BUNDLES, type WorldviewBundleDef } from '@/data/manifests/bundles';
import { AXIS_SHORT_FORMS, ALL_VARIANT_MANIFESTS } from '@/data/manifests/axes';
import { Reveal } from '@/components/shared/Reveal';

function bundleIsActive(bundle: WorldviewBundleDef, axes: Partial<Record<string, string>>): boolean {
  const keys = Object.keys(bundle.axes);
  return keys.length === Object.keys(axes).length
    && keys.every((k) => axes[k] === bundle.axes[k as keyof typeof bundle.axes]);
}

function displayNameFor(axis: string, variant: string): string {
  const m = ALL_VARIANT_MANIFESTS.find((v) => v.axis === axis && v.variant === variant);
  return m?.displayName ?? variant;
}

export function WorldviewBundleGallery() {
  const composition = useSimulationStore((s) => s.composition);
  const setComposition = useSimulationStore((s) => s.setComposition);
  // Owner bug pass (exclusivity): the list is ONE-OR-THE-OTHER — while a saved world is
  // current, bundle radios render unfilled (the world's identity is the save, even when
  // its beliefs coincide with a bundle), and picking a bundle releases the saved world.
  const worldLoaded = useSimulationStore((s) => s.currentWorld !== null);
  const markWorldLoaded = useSimulationStore((s) => s.markWorldLoaded);
  const [openId, setOpenId] = useState<string | null>(null);

  const apply = (b: WorldviewBundleDef) => {
    markWorldLoaded(null); // exclusivity: the world is now the bundle, not the save
    setComposition({ ...composition, axes: { ...b.axes } });
  };
  // Owner ruling (the bug pass): UN-clicking an active worldview returns EVERYTHING to
  // the default world — the full safe reset, so the chip lands back on "Test My Own" —
  // not just the belief axes. NOTE: this discards unrelated edits too (the ruled
  // semantics; the Reset button is the same act). The composition-purity invariant is a
  // STORE property (R3C-B14 pins setComposition round-trips) and is untouched by this
  // handler-level choice. The retired axes-only clear, per no-delete:
  //   const clear = () => setComposition({ ...composition, axes: {} });
  const clear = () => {
    // One reset grammar (owner ruling): the data-calibration selection SURVIVES —
    // un-clicking a worldview resets beliefs and the world, not the data-trust answer.
    useSimulationStore.getState().resetWorldPreservingData();
  };

  return (
    <div className="flex flex-col gap-1.5">
      {/* Owner order (pre-flight polish): the explainer moved BELOW the bundle cards —
          the header-to-cards gap it created read as dead space. See the closing <p>. */}
      {WORLDVIEW_BUNDLES.map((b) => {
        const active = bundleIsActive(b, composition.axes) && !worldLoaded;
        const open = openId === b.id;
        return (
          <div key={b.id}
            className={`rounded-lg border px-3 py-2 ${active ? 'border-[#D4A03C]/50 bg-[#D4A03C]/5' : 'border-white/5 bg-[#0C1424] hover:border-white/20'}`}>
            {/* items-end: the small side affordance bottom-aligns with the card's main
                text (owner order, pre-flight polish — same rule as the calibration zone's
                details button). The distinction system in the folded list is GOLD =
                USER-CREATED; authored rows keep this quiet default styling. */}
            <div className="flex items-end justify-between gap-2">
              <button onClick={() => (active ? clear() : apply(b))} className="flex-1 min-w-0 text-left text-[11px]/[1.3]">
                <span className={`font-medium ${active ? 'text-[#D4A03C]' : 'text-[#E8ECF4]'}`}>
                  {active ? '● ' : '○ '}{b.name}
                </span>
              </button>
              {/* RETIRED (owner refinement): the "authored" badge — the distinction
                  system is GOLD = USER-CREATED; authored rows keep the quiet default
                  styling. Kept per no-delete:
                <span className="text-[8px] font-mono uppercase tracking-[0.08em] text-[#8A96AD]/70 border border-white/10 rounded px-1 py-px shrink-0">
                  authored
                </span> */}
              <button onClick={() => setOpenId(open ? null : b.id)}
                className="text-[9px] font-mono text-[#8A96AD] hover:text-[#E8ECF4] shrink-0">
                {open ? 'less' : 'more'}
              </button>
            </div>
            <Reveal open={open}>
              <p className="text-[10px] leading-relaxed text-[#8A96AD] mt-1">{b.rationaleText}</p>
              <div className="flex flex-col gap-0.5 mt-1.5">
                {Object.entries(b.axes).map(([axis, variant]) => (
                  <div key={axis} className="flex items-baseline justify-between gap-2">
                    <span className="text-[9px] text-[#8A96AD] truncate">{AXIS_SHORT_FORMS[axis] ?? axis}</span>
                    <span className="text-[9px] font-mono text-[#E8ECF4] shrink-0">{displayNameFor(axis, variant!)}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        );
      })}
      {/* DEPRECATED (the Scenarios redesign): the explainer paragraph retired — the
          current-world chip teaches the flow now, and the manager carries a one-line
          caption. Kept per the no-delete rule:
        <p className="text-[10px] text-[#8A96AD] mt-0.5">
          Named worldviews — each selects belief answers only; your events and policy
          choices stay. Everything a bundle claims is {`${WORLDVIEW_BUNDLES[0]!.scopeLine}`}.
        </p> */}
    </div>
  );
}
