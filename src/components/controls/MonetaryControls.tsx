/**
 * ATLAS Monetary Controls
 *
 * Sliders for monetary model parameters:
 * - Velocity Sensitivity (how much excess unemployment reduces money velocity)
 * - Base Inflation Rate (annual baseline inflation before AI effects)
 *
 * Cyan accent (#06B6D4) to distinguish from other control groups.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import {
  DEFAULT_VELOCITY_SENSITIVITY,
  BASE_INFLATION_RATE,
} from '@/models/constants';

/** Cyan accent for monetary controls */
const CONTROL_COLOR = '#06B6D4';

export function MonetaryControls() {
  const velocitySens = useSimulationStore((s) => s.config.velocitySensitivity ?? DEFAULT_VELOCITY_SENSITIVITY);
  const baseInflation = useSimulationStore((s) => s.config.baseInflationRate);
  const updateConfig = useSimulationStore((s) => s.updateConfig);

  const handleVelocitySens = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, velocitySensitivity: value }));
    },
    [updateConfig],
  );

  const handleBaseInflation = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, baseInflationRate: value }));
    },
    [updateConfig],
  );

  return (
    <div className="space-y-3">
      <Slider
        label="Velocity Sensitivity"
        value={velocitySens}
        min={0}
        max={0.10}
        step={0.005}
        color={CONTROL_COLOR}
        onChange={handleVelocitySens}
        formatValue={(v) => v.toFixed(3)}
      />
      <Slider
        label="Base Inflation Rate"
        value={baseInflation}
        min={0}
        max={0.10}
        step={0.005}
        color={CONTROL_COLOR}
        onChange={handleBaseInflation}
        formatValue={(v) => `${(v * 100).toFixed(1)}%`}
      />
      <p className="text-text-muted text-[10px] leading-relaxed">
        Money velocity falls with unemployment. Funding split between
        taxation and money creation is computed endogenously from
        fiscal capacity.
      </p>
    </div>
  );
}
