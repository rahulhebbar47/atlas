/**
 * DATA-CALIBRATION PRESET REGISTRY — the composition's fourth slot (the AEI
 * integration program, Shape A: one composition machine per phenomenon).
 *
 * Each member is a source-attributed calibration overlay: measured external data
 * grounding parameters that are otherwise authored under honest uncertainty. The
 * preset is OPT-IN and fully reversible (on-off ≡ never-on, test-proven); it
 * calibrates what the user did not choose — explicit user overrides and belief-axis
 * selections take precedence, surfaced as a quiet notice, never a refusal.
 *
 * v1 ships exactly one member: the Anthropic Economic Index V6 first-party-API
 * snapshot. Its scalar `values` channel is EMPTY (asserted by the manifest
 * validator): the calibration rides the per-cluster side channel only — automation
 * share (α) for the cognitive clusters plus recalibrated generative/agentic
 * capability weights (embodied preserved verbatim). The Better-threshold anchor leg
 * was withdrawn before shipping (the back-derivation degenerates at observed
 * automation levels — see the transform's constants block).
 *
 * Adding a future source (a lab, an academic dataset, the consumer population) is
 * one manifest + one card — zero new machinery.
 */

import type { DataCalibrationManifest } from '@/types/manifests';
import { AEI_V6_PAYLOAD } from '@/data/anthropic';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { DEFAULT_COGNITIVE_ALPHA } from '@/models/constants';
import type { SimulationConfig } from '@/types';
import type { CompositionState } from '@/stores/simulationStore';

/** The zone's header question — the model author's D5 pick, verbatim. */
export const DATA_CALIBRATION_ZONE_QUESTION = 'Whose measurements do you trust?';

/** The honest null option (the default): no external calibration applied. */
export const DATA_CALIBRATION_NULL_CARD = {
  /** The compact radio-chip label (the model author's compact-zone amendment). */
  chipLabel: 'ATLAS defaults',
  title: 'ATLAS authored defaults',
  subtitle:
    "The model's hand-authored parameter values, each documented with its source and "
    + 'uncertainty in the dial table. No external calibration applied.',
} as const;

/** The quiet-notice template (the count comes from the proven producer). */
export const DATA_CALIBRATION_NOTICE_TEMPLATE = (n: number): string =>
  `Your adjustments override ${n} calibrated value${n === 1 ? '' : 's'}`;

/** The one radio write the zone performs: the slot and nothing else. */
export function withDataCalibration(
  composition: CompositionState,
  id: string | null,
): CompositionState {
  return { ...composition, dataCalibration: id };
}

/** THE EDITOR'S ONE PRODUCER (the DB-extension binding): the effective cluster α the
 *  engine consumes — user override ?? active preset value ?? the authored seeded
 *  value — with its provenance. Mirrors the effectiveClusters build's α chain exactly
 *  (proven engine-equivalent by the channel-identity test). */
export function resolveEffectiveClusterAlpha(
  config: SimulationConfig,
  dataCalibrationId: string | null | undefined,
  clusterId: string,
): { value: number; source: 'user' | 'data-calibration' | 'authored'; presetValue?: number } {
  const preset = dataCalibrationId != null
    ? DATA_CALIBRATION_PRESETS.find((d) => d.id === dataCalibrationId)
    : undefined;
  const presetValue = preset?.clusterPayload.clusters[clusterId]?.automationShare;
  const authored = OCCUPATION_CLUSTERS.find((c) => c.id === clusterId)?.automationShare
    ?? DEFAULT_COGNITIVE_ALPHA;
  const userValue = config.clusterAutomationShareOverrides?.[clusterId];
  if (userValue !== undefined) return { value: userValue, source: 'user', ...(presetValue !== undefined ? { presetValue } : {}) };
  if (presetValue !== undefined) return { value: presetValue, source: 'data-calibration', presetValue };
  return { value: authored, source: 'authored' };
}

export const DATA_CALIBRATION_PRESETS: readonly DataCalibrationManifest[] = [
  {
    species: 'data-calibration',
    id: 'aei-v6-2026-06',
    title: 'AEI · V6 (June 2026)',
    chipLabel: 'AEI',
    fullSourceName: 'Anthropic Economic Index · V6 (June 2026)',
    sourceShortName: 'AEI · V6',
    values: [],
    clusterPayload: AEI_V6_PAYLOAD,
    disclosure: {
      subtitle:
        'Calibrated from first-party Anthropic API usage, April–May 2026 — '
        + 'enterprise-scale adoption. Consumer usage differs materially: about 49% of '
        + 'consumer conversations are classed automation versus about 94% on the API. '
        + 'Shares measure conversations, not hours or economic value. Occupations below '
        + 'publication thresholds are absent from the data — absent, never zero. Uses '
        + 'Anthropic Economic Index data (CC-BY 4.0). Not endorsed by or affiliated '
        + 'with Anthropic.',
      expanded: [
        'Sets the observed automation share for 25 cognitive occupation groups and '
        + 'recalibrates their generative and agentic capability weights from the '
        + 'observed collaboration modes. The 20 physical-work groups keep their '
        + 'hand-authored values: conversation data measures what people ask about, '
        + 'not what can be physically automated.',
        'Coverage: 25 of 51 occupation groups are calibrated; 14 more have published '
        + 'values shown for context only; 12 are below publication thresholds and keep '
        + 'the authored defaults. About 70% of occupation-classified API usage falls '
        + 'outside the occupation groups this model tracks.',
        'The character of the signal: measured automation shares on the API are high '
        + 'and relatively uniform across occupations (mean 0.911, range 0.746–0.975; '
        + 'directive-dominated traffic), so the calibration mostly raises the level '
        + 'of automation share rather than re-ranking occupations.',
        'Measured effect with every other setting at its default: effects begin at '
        + 'first adoption — about 2040 at default settings — so the first fourteen '
        + 'projection years read nearly unchanged on every chart. By 2050, '
        + 'unemployment is about 3.4 percentage points higher, and the first '
        + 'automation trigger arrives one year later than under the authored defaults.',
      ],
    },
    rationaleText:
      'Grounds the automation-share dials in measured usage instead of authored '
      + 'estimates. Opt-in and fully reversible: deselecting restores every authored '
      + 'default, and any value you have adjusted yourself stays yours.',
  },
];
