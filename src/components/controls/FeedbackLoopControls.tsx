/**
 * ATLAS Feedback Loop Controls
 *
 * Sliders for the feedback loop parameters:
 * - Revenue Pressure Sensitivity (GDP contraction -> automation acceleration)
 * - Revenue Pressure Cap (max automation acceleration)
 * - Revenue Pressure Decay (how quickly pressure fades)
 * - AI Wage Premium (wage boost for AI-augmented workers)
 *
 * These feed into computeMacro() via SecondOrderEffectParams.
 * Follows NewJobsControls.tsx slider patterns.
 *
 * Phase 3c.1: Removed Okun's Law slider (replaced by per-cluster demand spillover).
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import {
  REVENUE_PRESSURE_SENSITIVITY_DEFAULT,
  REVENUE_PRESSURE_CAP,
  REVENUE_PRESSURE_DECAY,
  // DEPRECATED (Phase 10.A): AI_WAGE_PRODUCTIVITY_MULTIPLIER replaced by scarcityIntensity
  // in the new AugmentationAndScarcityControls panel.
  // AI_WAGE_PRODUCTIVITY_MULTIPLIER,
  PHILLIPS_CURVE_SENSITIVITY,
  MAX_CREDIT_TIGHTENING,
  DEFERRABLE_CONSUMPTION_SHARE,
} from '@/models/constants';

/** Teal accent for feedback loop controls (distinct from gold) */
const CONTROL_COLOR = '#4ECDC4';

export function FeedbackLoopControls() {
  const revPressureSens = useSimulationStore((s) => s.config.revenuePressureSensitivity ?? REVENUE_PRESSURE_SENSITIVITY_DEFAULT);
  const revPressureCap = useSimulationStore((s) => s.config.revenuePressureCap ?? REVENUE_PRESSURE_CAP);
  const revPressureDecay = useSimulationStore((s) => s.config.revenuePressureDecay ?? REVENUE_PRESSURE_DECAY);
  // Phase 10.A: aiWagePremium removed — scarcity premium now lives in AugmentationAndScarcityControls.
  const phillipsSens = useSimulationStore((s) => s.config.phillipsCurveSensitivity ?? PHILLIPS_CURVE_SENSITIVITY);
  const maxCredit = useSimulationStore((s) => s.config.maxCreditTightening ?? MAX_CREDIT_TIGHTENING);
  const deferrableShare = useSimulationStore((s) => s.config.deferrableConsumptionShare ?? DEFERRABLE_CONSUMPTION_SHARE);
  const updateConfig = useSimulationStore((s) => s.updateConfig);

  const handleRevSens = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, revenuePressureSensitivity: value }));
    },
    [updateConfig],
  );

  const handleRevCap = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, revenuePressureCap: value }));
    },
    [updateConfig],
  );

  const handleRevDecay = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, revenuePressureDecay: value }));
    },
    [updateConfig],
  );

  // DEPRECATED (Phase 10.A): handleAiWage removed — scarcity premium via AugmentationAndScarcityControls.
  // const handleAiWage = useCallback(
  //   (value: number) => {
  //     updateConfig((config) => ({ ...config, aiWageProductivityMultiplier: value }));
  //   },
  //   [updateConfig],
  // );

  const handlePhillips = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, phillipsCurveSensitivity: value }));
    },
    [updateConfig],
  );

  const handleMaxCredit = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, maxCreditTightening: value }));
    },
    [updateConfig],
  );

  const handleDeferrable = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, deferrableConsumptionShare: value }));
    },
    [updateConfig],
  );

  return (
    <div className="space-y-3">
      <Slider
        label="Rev. Pressure Sensitivity"
        value={revPressureSens}
        min={0}
        max={3}
        step={0.1}
        color={CONTROL_COLOR}
        onChange={handleRevSens}
        formatValue={(v) => v.toFixed(1)}
      />
      <Slider
        label="Rev. Pressure Cap"
        value={revPressureCap}
        min={0}
        max={1}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleRevCap}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Rev. Pressure Decay"
        value={revPressureDecay}
        min={0}
        max={1}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleRevDecay}
        formatValue={(v) => v.toFixed(2)}
      />
      {/* DEPRECATED (Phase 10.A): AI Wage Premium slider moved to AugmentationAndScarcityControls
          as "Scarcity Intensity". The Phillips Mechanism 2 scarcity premium replaces the old
          hump-shaped AI productivity premium. */}
      <Slider
        label="Wage-UE Sensitivity"
        value={phillipsSens}
        min={0}
        max={5}
        step={0.1}
        color={CONTROL_COLOR}
        onChange={handlePhillips}
        formatValue={(v) => v.toFixed(1)}
      />
      <Slider
        label="Max Credit Contraction"
        value={maxCredit}
        min={0.3}
        max={1}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleMaxCredit}
        formatValue={(v) => `${(v * 100).toFixed(0)}%`}
      />
      <Slider
        label="Deferrable Spending"
        value={deferrableShare}
        min={0.1}
        max={0.5}
        step={0.01}
        color={CONTROL_COLOR}
        onChange={handleDeferrable}
        formatValue={(v) => `${(v * 100).toFixed(0)}%`}
      />
      <p className="text-text-muted text-[10px] leading-relaxed">
        Revenue pressure accelerates automation during GDP contractions.
        Phase 10.A: scarcity-driven wage premium is now configured under
        "Augmentation &amp; Scarcity".
      </p>
    </div>
  );
}
