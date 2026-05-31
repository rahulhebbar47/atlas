/**
 * ATLAS Demographics Controls
 *
 * Sliders for population and labor supply parameters:
 * - Population Growth Rate (annual % growth)
 * - Participation Elasticity (voluntary withdrawal sensitivity to UBI)
 * - Participation Threshold (UBI replacement rate threshold before withdrawal starts)
 *
 * Violet accent (#8B5CF6) to distinguish from other control groups.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import {
  DEFAULT_POPULATION_GROWTH_RATE,
  DEFAULT_PARTICIPATION_ELASTICITY,
  DEFAULT_PARTICIPATION_THRESHOLD,
} from '@/models/constants';

/** Violet accent for demographics controls */
const CONTROL_COLOR = '#8B5CF6';

export function DemographicsControls() {
  const popGrowth = useSimulationStore((s) => s.config.populationGrowthRate ?? DEFAULT_POPULATION_GROWTH_RATE);
  const participElasticity = useSimulationStore((s) => s.config.participationElasticity ?? DEFAULT_PARTICIPATION_ELASTICITY);
  const participThreshold = useSimulationStore((s) => s.config.participationThreshold ?? DEFAULT_PARTICIPATION_THRESHOLD);
  const updateConfig = useSimulationStore((s) => s.updateConfig);

  const handlePopGrowth = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, populationGrowthRate: value }));
    },
    [updateConfig],
  );

  const handleParticipElasticity = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, participationElasticity: value }));
    },
    [updateConfig],
  );

  const handleParticipThreshold = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, participationThreshold: value }));
    },
    [updateConfig],
  );

  return (
    <div className="space-y-3">
      <Slider
        label="Population Growth"
        value={popGrowth}
        min={-0.01}
        max={0.03}
        step={0.001}
        color={CONTROL_COLOR}
        onChange={handlePopGrowth}
        formatValue={(v) => `${(v * 100).toFixed(1)}%`}
      />
      <Slider
        label="UBI Withdrawal Elasticity"
        value={participElasticity}
        min={0}
        max={0.5}
        step={0.01}
        color={CONTROL_COLOR}
        onChange={handleParticipElasticity}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="UBI Withdrawal Threshold"
        value={participThreshold}
        min={0.1}
        max={1.0}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleParticipThreshold}
        formatValue={(v) => `${(v * 100).toFixed(0)}%`}
      />
      <p className="text-text-muted text-[10px] leading-relaxed">
        Workers voluntarily leave the labor force when UBI replaces
        more than the threshold fraction of their wage income.
      </p>
    </div>
  );
}
