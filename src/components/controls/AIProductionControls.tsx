/**
 * ATLAS AI Production Controls
 *
 * Sliders for the 3 AI production expansion parameters (Phase 2):
 * - Investment Fraction: share of AI surplus → capital goods/infrastructure
 * - Onshoring Fraction: share of AI surplus → domestic production (net exports)
 * - New Job Wage Fraction: new job wages as fraction of average cluster wage
 *
 * These feed into computeAIProductionExpansion() and computeMacro()
 * via MacroProductionInputs.
 * Follows FeedbackLoopControls.tsx slider patterns.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import {
  DEFAULT_AI_PRODUCTION_INVESTMENT_FRACTION,
  DEFAULT_AI_PRODUCTION_ONSHORING_FRACTION,
  DEFAULT_NEW_JOB_WAGE_FRACTION,
  DEFAULT_AUGMENTATION_MULTIPLIER,
} from '@/models/constants';

/** Violet accent for AI production controls (distinct from gold/teal) */
const CONTROL_COLOR = '#8B5CF6';

export function AIProductionControls() {
  const investFrac = useSimulationStore(
    (s) => s.config.aiProductionInvestmentFraction ?? DEFAULT_AI_PRODUCTION_INVESTMENT_FRACTION,
  );
  const onshoreFrac = useSimulationStore(
    (s) => s.config.aiProductionOnshoringFraction ?? DEFAULT_AI_PRODUCTION_ONSHORING_FRACTION,
  );
  const wageFrac = useSimulationStore(
    (s) => s.config.newJobWageFraction ?? DEFAULT_NEW_JOB_WAGE_FRACTION,
  );
  const augMultiplier = useSimulationStore(
    (s) => s.config.augmentationMultiplier ?? DEFAULT_AUGMENTATION_MULTIPLIER,
  );
  const updateConfig = useSimulationStore((s) => s.updateConfig);

  const handleInvest = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, aiProductionInvestmentFraction: value }));
    },
    [updateConfig],
  );

  const handleOnshore = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, aiProductionOnshoringFraction: value }));
    },
    [updateConfig],
  );

  const handleWage = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, newJobWageFraction: value }));
    },
    [updateConfig],
  );

  const handleAugmentation = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, augmentationMultiplier: value }));
    },
    [updateConfig],
  );

  const fractionSum = investFrac + onshoreFrac;

  return (
    <div className="space-y-3">
      <Slider
        label="AI Augmentation Multiplier"
        value={augMultiplier}
        min={0}
        max={5}
        step={0.1}
        color={CONTROL_COLOR}
        onChange={handleAugmentation}
        formatValue={(v) => `${v.toFixed(1)}×`}
      />
      <Slider
        label="Investment Fraction"
        value={investFrac}
        min={0}
        max={1}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleInvest}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Onshoring Fraction"
        value={onshoreFrac}
        min={0}
        max={1}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleOnshore}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="New Job Wage Fraction"
        value={wageFrac}
        min={0}
        max={2}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleWage}
        formatValue={(v) => v.toFixed(2)}
      />
      {fractionSum > 1.0 && (
        <p className="text-amber-400 text-[10px] leading-relaxed">
          Investment + Onshoring fractions sum to {fractionSum.toFixed(2)} (&gt;1.0) — consumer goods potential clamped to 0.
        </p>
      )}
      <p className="text-text-muted text-[10px] leading-relaxed">
        AI produces more output than displaced humans. Investment flows to GDP
        regardless of demand. Consumer goods require income to purchase — the
        policy argument.
      </p>
    </div>
  );
}
