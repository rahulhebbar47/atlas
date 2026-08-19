/**
 * ComposedNotice — the LOUD divergence badge for editor surfaces whose keys a
 * worldview or package sets (the ruled exemption for editor-class surfaces).
 *
 * The per-field rebuild (owner ruling 2026-08-08): policy packages write PER-FIELD
 * keys — there is no whole-slot 'policyConfig' provenance entry anymore, so this
 * surface matches by PREFIX (a dialKey ending in '.') as well as by exact key. The
 * editor now renders the EFFECTIVE values (what the run consumed), and a user's
 * write touches its key so the user's value wins from then on — the text states
 * exactly that. Renders nothing when no matching key is composed, or when every
 * matching key is already user-shadowed.
 */
import { useMemo } from 'react';
import { useSimulationStore, computeCompositionProvenance } from '@/stores/simulationStore';

export function ComposedNotice({ dialKey, what }: { dialKey: string; what: string }) {
  const config = useSimulationStore((s) => s.config);
  const composition = useSimulationStore((s) => s.composition);
  const origins = useMemo(() => {
    const prov = computeCompositionProvenance(config);
    const isPrefix = dialKey.endsWith('.');
    const matches = Object.entries(prov).filter(([key, p]) =>
      (isPrefix ? key.startsWith(dialKey) : key === dialKey) && !p.shadowed);
    return [...new Set(matches.map(([, p]) => p.origin))];
  }, [config, composition, dialKey]);
  if (origins.length === 0) return null;
  return (
    <p className="text-[9px] leading-relaxed text-cyan-400 border border-cyan-400/30 rounded px-1.5 py-1">
      Your worldview sets {what} ({origins.join(', ')}) — these controls show the
      values the run uses. Any control you change is yours from then on; the sidebar
      card and this editor stay in step.
    </p>
  );
}
