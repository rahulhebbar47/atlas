/**
 * ATLAS Augmentation + Scarcity Controls — Phase 10.A
 *
 * Four top-level sliders:
 *   - augmentationAdoptionSteepness (0.1-2.0)
 *   - competitivePressureThreshold (0.05-0.5)
 *   - scarcityIntensity (0-1.0) — replaces the deprecated AI Wage Premium knob
 *   - replacementMultiplier (0.5-10.0) — first-principles productivity input
 *
 * Phase 10.A fix #2: maxAdoptionFrictionYears slider removed. Friction is now expressed directly
 * in years per role via the per-role "AI Replacement Friction (years)" slider in BFCSEditor.
 *
 * Accent color: Indigo #6366F1 (shares α-panel identity — same conceptual family).
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import {
  DEFAULT_AUGMENTATION_ADOPTION_STEEPNESS,
  DEFAULT_COMPETITIVE_PRESSURE_THRESHOLD,
  DEFAULT_SCARCITY_INTENSITY,
  DEFAULT_REPLACEMENT_MULTIPLIER,
} from '@/models/constants';

const CONTROL_COLOR = '#6366F1';

export function AugmentationAndScarcityControls() {
  const augSteepness = useSimulationStore(
    (s) => s.config.augmentationAdoptionSteepness ?? DEFAULT_AUGMENTATION_ADOPTION_STEEPNESS,
  );
  const compThreshold = useSimulationStore(
    (s) => s.config.competitivePressureThreshold ?? DEFAULT_COMPETITIVE_PRESSURE_THRESHOLD,
  );
  const scarcity = useSimulationStore(
    (s) => s.config.scarcityIntensity ?? DEFAULT_SCARCITY_INTENSITY,
  );
  const replacement = useSimulationStore(
    (s) => s.config.replacementMultiplier ?? DEFAULT_REPLACEMENT_MULTIPLIER,
  );

  const setAugSteepness = useSimulationStore((s) => s.setAugmentationAdoptionSteepness);
  const setCompThreshold = useSimulationStore((s) => s.setCompetitivePressureThreshold);
  const setScarcity = useSimulationStore((s) => s.setScarcityIntensity);
  const setReplacement = useSimulationStore((s) => s.setReplacementMultiplier);

  return (
    <div className="space-y-3">
      <Slider
        label="Augmentation Adoption Steepness"
        value={augSteepness}
        min={0.1} max={2.0} step={0.05}
        color={CONTROL_COLOR}
        onChange={useCallback((v: number) => setAugSteepness(v), [setAugSteepness])}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Competitive Pressure Threshold"
        value={compThreshold}
        min={0.05} max={0.5} step={0.01}
        color={CONTROL_COLOR}
        onChange={useCallback((v: number) => setCompThreshold(v), [setCompThreshold])}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Scarcity Intensity (Phillips Mechanism 2)"
        value={scarcity}
        min={0} max={1.0} step={0.02}
        color={CONTROL_COLOR}
        onChange={useCallback((v: number) => setScarcity(v), [setScarcity])}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Replacement Multiplier"
        value={replacement}
        min={0.5} max={10.0} step={0.1}
        color={CONTROL_COLOR}
        onChange={useCallback((v: number) => setReplacement(v), [setReplacement])}
        formatValue={(v) => v.toFixed(1)}
      />

      <p className="text-text-muted text-[10px] leading-relaxed">
        Phase 10.A knobs: augmentation ramp speed, competitive-pressure kick-in, Phillips scarcity
        premium intensity, and the AI-replacement productivity multiplier. Per-role regulatory/cultural
        friction is set directly in years on each role (see BFCSEditor).
      </p>
    </div>
  );
}
