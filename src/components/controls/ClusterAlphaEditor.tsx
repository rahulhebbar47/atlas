/**
 * ClusterAlphaEditor — the per-cluster automation-share (α) override, scoped to ONE
 * cluster (the Occupations detail page hosts it; the cluster is the page, so no
 * selector). The global driver-weight sliders live in the Advanced grid's
 * replace-vs-augment group; this is the cluster-level lever only.
 *
 * THE BINDING (the DB-extension row, mini-stage 3): the slider renders the EFFECTIVE
 * α — the value the engine consumes — through the ONE producer
 * (resolveEffectiveClusterAlpha: user override ?? active data-calibration value ??
 * the authored seeded value). When the data-calibration preset supplies the value,
 * the provenance badge names its source; when a user override shadows a supplied
 * value, the shadow is stated. Writes still go to the user's config.
 */
import { useSimulationStore } from '@/stores/simulationStore';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { DEFAULT_COGNITIVE_ALPHA } from '@/models/constants';
import {
  DATA_CALIBRATION_PRESETS,
  resolveEffectiveClusterAlpha,
} from '@/data/manifests/dataCalibration';
import { Slider } from '@/components/shared/Slider';

const CONTROL_COLOR = '#22D3EE';

export function ClusterAlphaEditor({ clusterId }: { clusterId: string }) {
  const config = useSimulationStore((s) => s.config);
  const dataCalibrationId = useSimulationStore((s) => s.composition.dataCalibration ?? null);
  const setClusterAlpha = useSimulationStore((s) => s.setClusterAlpha);
  const cluster = OCCUPATION_CLUSTERS.find((c) => c.id === clusterId);
  if (!cluster) return null;

  const authoredAlpha = cluster.automationShare ?? DEFAULT_COGNITIVE_ALPHA;
  const resolved = resolveEffectiveClusterAlpha(config, dataCalibrationId, clusterId);
  const sourceShortName = dataCalibrationId !== null
    ? DATA_CALIBRATION_PRESETS.find((d) => d.id === dataCalibrationId)?.sourceShortName
    : undefined;

  return (
    <div className="space-y-1">
      <Slider
        label="Automation share (α)"
        value={resolved.value}
        min={0} max={1} step={0.01}
        color={CONTROL_COLOR}
        onChange={(v) => setClusterAlpha(clusterId, v)}
        formatValue={(v) => v.toFixed(2)}
      />
      <p className="text-text-muted text-[10px] leading-relaxed">
        The split between replacing workers and augmenting them for this cluster.
        Authored default {authoredAlpha.toFixed(2)} · current {resolved.value.toFixed(2)}.
      </p>
      {resolved.source === 'data-calibration' && sourceShortName !== undefined && (
        <p className="text-[10px] leading-relaxed text-[#D4A03C]/90">
          Calibrated by {sourceShortName}.
        </p>
      )}
      {resolved.source === 'user' && resolved.presetValue !== undefined && sourceShortName !== undefined && (
        <p className="text-[10px] leading-relaxed text-text-muted">
          Your value overrides the {sourceShortName} calibration ({resolved.presetValue.toFixed(2)}).
        </p>
      )}
    </div>
  );
}

// The pre-binding form, retired with the DB-extension (kept per no-delete): it
// rendered `clusterOverrides[clusterId] ?? EMBODIED_CLUSTER_ALPHA_DEFAULTS[clusterId]
// ?? DEFAULT_COGNITIVE_ALPHA` — a constant-derived default that ignored both the
// seeded authored α on the cluster object and any active data-calibration value, so
// the rendered number could differ from the engine-consumed one whenever the preset
// was active.
