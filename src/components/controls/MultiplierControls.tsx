/**
 * ATLAS Multiplier Controls (Phase 5h)
 *
 * Controls for the other_uncategorized cluster employment multiplier.
 * Two modes:
 * - Auto: Uses employment-weighted average of all other clusters (computed at runtime)
 * - Custom: User-adjustable slider (0.0–5.0, step 0.1)
 *
 * This controls how second-order employment effects (supplier/support jobs)
 * ripple through the ~84M workers in uncategorized occupations.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import { SIMPLE_AVG_EMPLOYMENT_MULTIPLIER } from '@/models/constants';

/** Neutral slate accent for advanced controls */
const CONTROL_COLOR = '#94A3B8';

export function MultiplierControls() {
  const override = useSimulationStore((s) => s.config.otherUncategorizedMultiplierOverride);
  const updateConfig = useSimulationStore((s) => s.updateConfig);

  const isAutoMode = override === undefined;

  const handleToggle = useCallback(() => {
    updateConfig((config) => ({
      ...config,
      otherUncategorizedMultiplierOverride: isAutoMode
        ? SIMPLE_AVG_EMPLOYMENT_MULTIPLIER // switch to custom with current average as starting point
        : undefined, // switch back to auto
    }));
  }, [isAutoMode, updateConfig]);

  const handleSlider = useCallback(
    (value: number) => {
      updateConfig((config) => ({
        ...config,
        otherUncategorizedMultiplierOverride: value,
      }));
    },
    [updateConfig],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-[11px]">
          Uncategorized Multiplier
        </span>
        <button
          onClick={handleToggle}
          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
            isAutoMode
              ? 'bg-[#94A3B8]/20 text-[#94A3B8]'
              : 'bg-[#D4A03C]/20 text-[#D4A03C]'
          }`}
        >
          {isAutoMode ? 'Auto (Avg)' : 'Custom'}
        </button>
      </div>

      {isAutoMode ? (
        <p className="text-text-muted text-[10px] leading-relaxed">
          Using employment-weighted average of all cluster multipliers
          (fallback: {SIMPLE_AVG_EMPLOYMENT_MULTIPLIER.toFixed(2)}x).
        </p>
      ) : (
        <Slider
          label="Multiplier"
          value={override}
          min={0.0}
          max={5.0}
          step={0.1}
          color={CONTROL_COLOR}
          onChange={handleSlider}
          formatValue={(v) => `${v.toFixed(1)}x`}
        />
      )}

      <p className="text-text-muted text-[10px] leading-relaxed">
        Employment multiplier for ~84M uncategorized workers.
        Higher = more supplier/support job losses per direct displacement.
      </p>
    </div>
  );
}
