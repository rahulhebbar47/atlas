/**
 * ATLAS Feedback Loop Controls (slimmed — relocated sliders to other categories)
 *
 * Remaining sliders after reorganization:
 * - Revenue Pressure Sensitivity/Cap/Decay
 * - AI Wage Premium
 * - Wage-UE Sensitivity (Phillips curve)
 *
 * Relocated OUT:
 * - Max Credit Contraction → Credit & Financial (Category 6)
 * - Deferrable Spending → Consumer Demand (Category 4)
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import {
  REVENUE_PRESSURE_SENSITIVITY_DEFAULT,
  REVENUE_PRESSURE_CAP,
  REVENUE_PRESSURE_DECAY,
  AI_WAGE_PRODUCTIVITY_MULTIPLIER,
  PHILLIPS_CURVE_SENSITIVITY,
} from '@/models/constants';

/** Teal accent for feedback loop controls */
const CONTROL_COLOR = '#4ECDC4';

export function FeedbackControls() {
  const revPressureSens = useSimulationStore((s) => s.config.revenuePressureSensitivity ?? REVENUE_PRESSURE_SENSITIVITY_DEFAULT);
  const revPressureCap = useSimulationStore((s) => s.config.revenuePressureCap ?? REVENUE_PRESSURE_CAP);
  const revPressureDecay = useSimulationStore((s) => s.config.revenuePressureDecay ?? REVENUE_PRESSURE_DECAY);
  const aiWagePremium = useSimulationStore((s) => s.config.aiWageProductivityMultiplier ?? AI_WAGE_PRODUCTIVITY_MULTIPLIER);
  const phillipsSens = useSimulationStore((s) => s.config.phillipsCurveSensitivity ?? PHILLIPS_CURVE_SENSITIVITY);
  const updateConfig = useSimulationStore((s) => s.updateConfig);

  const handleRevSens = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, revenuePressureSensitivity: value })),
    [updateConfig],
  );
  const handleRevCap = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, revenuePressureCap: value })),
    [updateConfig],
  );
  const handleRevDecay = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, revenuePressureDecay: value })),
    [updateConfig],
  );
  const handleAiWage = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, aiWageProductivityMultiplier: value })),
    [updateConfig],
  );
  const handlePhillips = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, phillipsCurveSensitivity: value })),
    [updateConfig],
  );

  return (
    <div className="space-y-3">
      <Slider label="Rev. Pressure Sensitivity" value={revPressureSens} min={0} max={3} step={0.1} color={CONTROL_COLOR} onChange={handleRevSens} formatValue={(v) => v.toFixed(1)} />
      <Slider label="Rev. Pressure Cap" value={revPressureCap} min={0} max={1} step={0.05} color={CONTROL_COLOR} onChange={handleRevCap} formatValue={(v) => v.toFixed(2)} />
      <Slider label="Rev. Pressure Decay" value={revPressureDecay} min={0} max={1} step={0.05} color={CONTROL_COLOR} onChange={handleRevDecay} formatValue={(v) => v.toFixed(2)} />
      <Slider label="AI Wage Premium" value={aiWagePremium} min={0} max={1} step={0.05} color={CONTROL_COLOR} onChange={handleAiWage} formatValue={(v) => v.toFixed(2)} />
      <Slider label="Wage-UE Sensitivity" value={phillipsSens} min={0} max={5} step={0.1} color={CONTROL_COLOR} onChange={handlePhillips} formatValue={(v) => v.toFixed(1)} />
      <p className="text-text-muted text-[10px] leading-relaxed">
        Revenue pressure accelerates automation during GDP contractions.
        AI wage premium peaks at 50% automation coverage.
      </p>
    </div>
  );
}
