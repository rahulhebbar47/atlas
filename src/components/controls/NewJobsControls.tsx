/**
 * ATLAS New Jobs Controls
 *
 * Sliders for the three user-adjustable new job creation parameters:
 * - Innovation Rate (displayed as multiplier of default, 0.1x to 10x)
 * - R&D Multiplier
 * - Job Persistence Factor
 *
 * These feed into computeNewJobMetrics() via SimulationConfig.
 * Follows CapabilityControls.tsx slider patterns.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import { DEFAULT_INNOVATION_RATE } from '@/models/constants';

/** Gold accent color matching the net job creation line */
const CONTROL_COLOR = '#D4A03C';

export function NewJobsControls() {
  const innovationRate = useSimulationStore((s) => s.config.innovationRate);
  const rdMultiplier = useSimulationStore((s) => s.config.rdMultiplier);
  const persistenceFactor = useSimulationStore((s) => s.config.jobPersistenceFactor);
  const updateConfig = useSimulationStore((s) => s.updateConfig);

  // Innovation rate displayed as multiplier of the default (1.0x = DEFAULT_INNOVATION_RATE)
  const innovationMultiplier = innovationRate / DEFAULT_INNOVATION_RATE;

  const handleInnovationMultiplier = useCallback(
    (multiplier: number) => {
      updateConfig((config) => ({
        ...config,
        innovationRate: multiplier * DEFAULT_INNOVATION_RATE,
      }));
    },
    [updateConfig],
  );

  const handleRdMultiplier = useCallback(
    (value: number) => {
      updateConfig((config) => ({
        ...config,
        rdMultiplier: value,
      }));
    },
    [updateConfig],
  );

  const handlePersistenceFactor = useCallback(
    (value: number) => {
      updateConfig((config) => ({
        ...config,
        jobPersistenceFactor: value,
      }));
    },
    [updateConfig],
  );

  return (
    <div className="space-y-3">
      <Slider
        label="Innovation Rate"
        value={innovationMultiplier}
        min={0.1}
        max={10}
        step={0.1}
        color={CONTROL_COLOR}
        onChange={handleInnovationMultiplier}
        formatValue={(v) => `${v.toFixed(1)}x`}
      />
      <Slider
        label="R&D Multiplier"
        value={rdMultiplier}
        min={0.1}
        max={15}
        step={0.1}
        color={CONTROL_COLOR}
        onChange={handleRdMultiplier}
        formatValue={(v) => v.toFixed(1)}
      />
      <Slider
        label="Job Persistence"
        value={persistenceFactor}
        min={0.1}
        max={15}
        step={0.1}
        color={CONTROL_COLOR}
        onChange={handlePersistenceFactor}
        formatValue={(v) => v.toFixed(1)}
      />
      <p className="text-text-muted text-[10px] leading-relaxed">
        Persistence &gt;1 = new jobs more vulnerable to automation.
        &lt;1 = new jobs more durable.
      </p>
    </div>
  );
}
