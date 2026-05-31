/**
 * ATLAS Alpha Controls — Phase 10.A
 *
 * Five α-driver weight sliders + capability activation threshold + trust half-life.
 * Per-cluster α override via an expandable cluster selector.
 *
 * Accent color: Indigo #6366F1 (approved; non-colliding with capability vector and panel reservations).
 */

import { useCallback, useMemo, useState } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import { InfoTooltip } from '@/components/shared/InfoTooltip';
import { DEFAULT_ALPHA_DRIVER_PARAMS, DEFAULT_COGNITIVE_ALPHA, EMBODIED_CLUSTER_ALPHA_DEFAULTS } from '@/models/constants';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import type { AlphaDriverParams } from '@/types';

const CONTROL_COLOR = '#6366F1';

// Stable module-level empty-object reference. Returning a fresh `{}` literal from a Zustand
// selector triggers Maximum-update-depth-exceeded because each render sees a new reference.
const EMPTY_CLUSTER_ALPHA_OVERRIDES: Record<string, number> = {};

export function AlphaControls() {
  const params = useSimulationStore(
    (s) => s.config.alphaDriverParams ?? DEFAULT_ALPHA_DRIVER_PARAMS,
  );
  const clusterOverrides = useSimulationStore(
    (s) => s.config.clusterAutomationShareOverrides ?? EMPTY_CLUSTER_ALPHA_OVERRIDES,
  );
  const setAlphaDriverParams = useSimulationStore((s) => s.setAlphaDriverParams);
  const setClusterAlpha = useSimulationStore((s) => s.setClusterAlpha);

  const handleDriverChange = useCallback(
    (key: keyof AlphaDriverParams) => (value: number) => {
      setAlphaDriverParams({ ...params, [key]: value });
    },
    [params, setAlphaDriverParams],
  );

  const [selectedClusterId, setSelectedClusterId] = useState<string>('tech_swe');

  const clusterGroups = useMemo(() => {
    const groups: Record<string, typeof OCCUPATION_CLUSTERS> = {};
    for (const c of OCCUPATION_CLUSTERS) {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category]!.push(c);
    }
    return groups;
  }, []);

  const selectedCluster = OCCUPATION_CLUSTERS.find((c) => c.id === selectedClusterId);
  const clusterDefaultAlpha =
    EMBODIED_CLUSTER_ALPHA_DEFAULTS[selectedClusterId] ?? DEFAULT_COGNITIVE_ALPHA;
  const currentClusterAlpha =
    clusterOverrides[selectedClusterId] ?? clusterDefaultAlpha;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1">
        <label className="text-text-muted text-[10px] uppercase tracking-wider">
          Driver Weights
        </label>
        <InfoTooltip text="Driver weights are independent contribution magnitudes, not shares. Each weight is the maximum amount that driver can push α up (or down, for slack). Weights that sum above 1.0 will routinely cause α to peg at full automation. α is clamped to [0, 1] regardless of weight total." />
      </div>
      <Slider
        label="Capability Weight"
        value={params.capabilityWeight}
        min={0} max={0.5} step={0.01}
        color={CONTROL_COLOR}
        onChange={handleDriverChange('capabilityWeight')}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Trust Weight"
        value={params.trustWeight}
        min={0} max={0.5} step={0.01}
        color={CONTROL_COLOR}
        onChange={handleDriverChange('trustWeight')}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Competitive Weight"
        value={params.competitiveWeight}
        min={0} max={0.5} step={0.01}
        color={CONTROL_COLOR}
        onChange={handleDriverChange('competitiveWeight')}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Margin Weight"
        value={params.marginWeight}
        min={0} max={0.5} step={0.01}
        color={CONTROL_COLOR}
        onChange={handleDriverChange('marginWeight')}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Slack Weight"
        value={params.slackWeight}
        min={0} max={0.5} step={0.01}
        color={CONTROL_COLOR}
        onChange={handleDriverChange('slackWeight')}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Capability Activation Threshold"
        value={params.capabilityActivationThreshold}
        min={0.2} max={0.95} step={0.01}
        color={CONTROL_COLOR}
        onChange={handleDriverChange('capabilityActivationThreshold')}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Trust Half-Life (years)"
        value={params.trustHalfLifeYears}
        min={1} max={20} step={1}
        color={CONTROL_COLOR}
        onChange={handleDriverChange('trustHalfLifeYears')}
        formatValue={(v) => v.toFixed(0)}
      />

      <div className="mt-4 pt-3 border-t border-border">
        <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-2">
          Per-Cluster α Override
        </label>
        <select
          className="w-full bg-surface-elevated text-text-primary text-xs px-2 py-1 rounded border border-border"
          value={selectedClusterId}
          onChange={(e) => setSelectedClusterId(e.target.value)}
        >
          {Object.entries(clusterGroups).map(([category, clusters]) => (
            <optgroup label={category} key={category}>
              {clusters.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
        {selectedCluster && (
          <div className="mt-2">
            <Slider
              label={`α — ${selectedCluster.name}`}
              value={currentClusterAlpha}
              min={0} max={1} step={0.01}
              color={CONTROL_COLOR}
              onChange={(v) => setClusterAlpha(selectedClusterId, v)}
              formatValue={(v) => v.toFixed(2)}
            />
            <p className="text-text-muted text-[10px] mt-1">
              Default: {clusterDefaultAlpha.toFixed(2)} ·
              {' '}Current: {currentClusterAlpha.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <p className="text-text-muted text-[10px] leading-relaxed">
        α (automation share) determines the split between replacement and augmentation adoption
        paths. Drivers compose: capability, trust, competitive peer signal, margin compression,
        and labor slack. Clamped to [0, 1].
      </p>
    </div>
  );
}
