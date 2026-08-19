/**
 * THE DATA-CALIBRATION ZONE (the AEI program; COMPACT form per the owner's
 * amendment) — the sidebar's TOPMOST section: what grounds the numbers, before
 * beliefs, happenings, and choices. The zone is one more question with two answers:
 * axis-style radio CHIPS under the verbatim question header, matching the belief
 * zones' chip grammar (quiet styling for the default state, gold for a recorded
 * selection).
 *
 * THE DISCLOSURE RELOCATED, NEVER DELETED: the full measured honesty surface — the
 * population lines, the compression character, the measured effect numbers, the
 * coverage note, the license and non-affiliation — lives in the expanded-details
 * card on the established tap pattern (the details button; chip hover carries the
 * one-line summaries). The acronym expands in full at the details level ("Anthropic
 * Economic Index · V6") — the first-use rule satisfied there.
 *
 * The strut rule: type size + line-height live on the BUTTONS (the line-box owners).
 */
import { useState } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import {
  DATA_CALIBRATION_PRESETS,
  DATA_CALIBRATION_ZONE_QUESTION,
  DATA_CALIBRATION_NULL_CARD,
  DATA_CALIBRATION_NOTICE_TEMPLATE,
  withDataCalibration,
} from '@/data/manifests/dataCalibration';
import { countDataCalibrationShadowedCells } from '@/models/simulation';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { Reveal } from '@/components/shared/Reveal';

/** Import-identity pin surface (DC-B6.3): the zone's notice count IS the producer the
 *  record≡execution battery proved — never a re-derivation. */
export const NOTICE_COUNT_PRODUCER = countDataCalibrationShadowedCells;

function clusterDisplayName(id: string): string {
  return OCCUPATION_CLUSTERS.find((c) => c.id === id)?.name ?? id;
}

const CHIP_ACTIVE = 'bg-[#D4A03C]/15 border-[#D4A03C]/60 text-[#D4A03C]';
const CHIP_QUIET_DEFAULT = 'bg-white/[0.03] border-[#D4A03C]/25 text-[#B9A26D]';
const CHIP_INACTIVE = 'bg-transparent border-white/10 text-[#8A96AD] hover:border-white/25 hover:text-[#E8ECF4]';

export function DataCalibrationZone() {
  const composition = useSimulationStore((s) => s.composition);
  const setComposition = useSimulationStore((s) => s.setComposition);
  const config = useSimulationStore((s) => s.config);
  const setAdvancedFocus = useSimulationStore((s) => s.setAdvancedFocus);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const activeId = composition.dataCalibration ?? null;
  const select = (id: string | null) => setComposition(withDataCalibration(composition, id));

  return (
    <div className="flex flex-col">
      {/* items-end + matching pb-1 on the button: the side affordance bottom-aligns with
          the question text (owner order, pre-flight polish — was items-center, which left
          the button floating mid-height beside the taller heading) */}
      <div className="flex items-end justify-between gap-2">
        <h3 className="font-serif text-[13px] tracking-wide uppercase text-[#E8ECF4] pb-1">
          {DATA_CALIBRATION_ZONE_QUESTION}
        </h3>
        <button onClick={() => setDetailsOpen(!detailsOpen)}
          className="text-[9px] font-mono text-[#8A96AD] hover:text-[#E8ECF4] pb-1">
          {detailsOpen ? 'less' : 'details'}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {/* the honest null chip — the default answer; quiet-default grammar when it
            merely stands (null ≡ never-set), matching the belief chips */}
        <button
          onClick={() => select(null)}
          title={DATA_CALIBRATION_NULL_CARD.subtitle}
          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${
            activeId === null ? CHIP_QUIET_DEFAULT : CHIP_INACTIVE
          }`}
        >
          {DATA_CALIBRATION_NULL_CARD.chipLabel}
        </button>
        {DATA_CALIBRATION_PRESETS.map((d) => {
          const active = activeId === d.id;
          return (
            <button
              key={d.id}
              onClick={() => select(active ? null : d.id)}
              title={d.disclosure.subtitle}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${
                active ? CHIP_ACTIVE : CHIP_INACTIVE
              }`}
            >
              {d.chipLabel}
            </button>
          );
        })}
      </div>

      {/* the QUIET NOTICE (standing precedence semantics, not part of the relocated
          disclosure): renders ONLY in the overlap case — user overrides masking
          calibrated values while the preset is active — so the compact zone stays
          compact everywhere else; the details card names the clusters */}
      {(() => {
        const activePreset = DATA_CALIBRATION_PRESETS.find((d) => d.id === activeId);
        if (!activePreset) return null;
        const n = NOTICE_COUNT_PRODUCER(config, activePreset.clusterPayload).count;
        return n > 0 ? (
          <p className="text-[10px] leading-relaxed text-[#D4A03C]/80 mt-1">
            {DATA_CALIBRATION_NOTICE_TEMPLATE(n)}
          </p>
        ) : null;
      })()}

      {/* THE RELOCATED HONESTY SURFACE — the full disclosure, one tap away */}
      <Reveal open={detailsOpen}>
        <div className="mt-2 rounded border border-white/5 bg-[#0C1424] p-2 flex flex-col gap-1.5">
          <p className="text-[10px] leading-relaxed text-[#8A96AD]">
            <span className={activeId === null ? 'text-[#D4A03C]' : 'text-[#E8ECF4]'}>
              {DATA_CALIBRATION_NULL_CARD.title}.
            </span>{' '}
            {DATA_CALIBRATION_NULL_CARD.subtitle}
          </p>
          {DATA_CALIBRATION_PRESETS.map((d) => {
            const active = activeId === d.id;
            const shadows = active
              ? NOTICE_COUNT_PRODUCER(config, d.clusterPayload)
              : { count: 0, clusterIds: [] as string[] };
            return (
              <div key={d.id} className="flex flex-col gap-1">
                {/* the acronym expanded in full — the first-use rule at details level */}
                <p className="font-serif text-[12px]/[1.35] text-[#E8ECF4]">
                  <span className={active ? 'text-[#D4A03C]' : undefined}>{d.fullSourceName}</span>
                </p>
                <p className="text-[10px] leading-relaxed text-[#8A96AD]">{d.disclosure.subtitle}</p>
                {d.disclosure.expanded.map((line, i) => (
                  <p key={i} className="text-[10px] leading-relaxed text-[#8A96AD]">{line}</p>
                ))}
                {active && shadows.count > 0 && (
                  <>
                    <p className="text-[10px] leading-relaxed text-[#D4A03C]/80">
                      {DATA_CALIBRATION_NOTICE_TEMPLATE(shadows.count)}
                    </p>
                    <p className="text-[9px] leading-relaxed text-[#8A96AD]">
                      Overridden by your adjustments: {shadows.clusterIds.map(clusterDisplayName).join(', ')}.
                    </p>
                  </>
                )}
              </div>
            );
          })}
          <button
            onClick={() => setAdvancedFocus({ kind: 'axis', axis: 'A4' })}
            className="self-start text-[9px] font-mono text-[#D4A03C] hover:underline">
            Adjust the automation dials in Advanced →
          </button>
        </div>
      </Reveal>
    </div>
  );
}

// The pre-amendment CARD form (two large radio cards with the subtitle disclosure on
// the face) was superseded by the owner's compact-chip amendment — the full card
// markup is recoverable from the stage-3 commit; the disclosure content itself moved
// verbatim into the details card above (relocated, never deleted).
