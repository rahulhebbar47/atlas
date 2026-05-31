/**
 * ATLAS Fiscal & Monetary Controls
 *
 * Sliders for fiscal-monetary config parameters:
 * - Yield calibration (neutral real rate, term premium, inflation convergence)
 * - Inflation target, effective lower bound
 * - Fiscal dominance (threshold, dampening)
 * - Fiscal risk premium (max, trajectory/sustainability/level weights, level midpoint)
 * - Corporate tax effectiveness, foreign Treasury demand
 * - AI P/E multiplier
 *
 * Plus a PolicyKeyframeEditor for policyRateSchedule (year-by-year policy rate override).
 *
 * Follows FeedbackLoopControls.tsx slider patterns.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import { PolicyKeyframeEditor } from './PolicyKeyframeEditor';
import { PolicyToggleCard } from './PolicyToggleCard';
import { interpolatePolicy } from '@/utils/policyInterpolation';
import type { PolicySchedule } from '@/types';

/** Indigo accent for fiscal-monetary controls */
const CONTROL_COLOR = '#6366F1';

/** Empty schedule constant for when policyRateSchedule is undefined */
const EMPTY_SCHEDULE: PolicySchedule = { keyframes: [] };

export function FiscalMonetaryControls() {
  const neutralRealRate = useSimulationStore((s) => s.config.neutralRealRate ?? 0.007);
  const termPremium = useSimulationStore((s) => s.config.termPremium ?? 0.003);
  const inflationConvergenceYears = useSimulationStore((s) => s.config.inflationConvergenceYears ?? 5);
  const inflationTarget = useSimulationStore((s) => s.config.inflationTarget ?? 0.02);
  const effectiveLowerBound = useSimulationStore((s) => s.config.effectiveLowerBound ?? -0.005);
  const fiscalDominanceThreshold = useSimulationStore((s) => s.config.fiscalDominanceThreshold ?? 0.25);
  const fiscalDominanceDampening = useSimulationStore((s) => s.config.fiscalDominanceDampening ?? 0.5);
  const fiscalRiskPremiumMax = useSimulationStore((s) => s.config.fiscalRiskPremiumMax ?? 0.06);
  const fiscalRiskTrajectoryWeight = useSimulationStore((s) => s.config.fiscalRiskTrajectoryWeight ?? 0.50);
  const fiscalRiskSustainabilityWeight = useSimulationStore((s) => s.config.fiscalRiskSustainabilityWeight ?? 0.35);
  const fiscalRiskLevelWeight = useSimulationStore((s) => s.config.fiscalRiskLevelWeight ?? 0.15);
  const fiscalRiskLevelMidpoint = useSimulationStore((s) => s.config.fiscalRiskLevelMidpoint ?? 2.0);
  const corporateTaxEffectiveness = useSimulationStore((s) => s.config.corporateTaxEffectiveness ?? 0.65);
  const foreignTreasuryDemand = useSimulationStore((s) => s.config.foreignTreasuryDemand ?? 0.30);
  const aiPEMultiplier = useSimulationStore((s) => s.config.aiPEMultiplier ?? 1.0);
  const policyRateSchedule = useSimulationStore((s) => s.config.policyRateSchedule ?? EMPTY_SCHEDULE);
  const currentYear = useSimulationStore((s) => s.currentYear);
  const updateConfig = useSimulationStore((s) => s.updateConfig);

  const handleNeutralRealRate = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, neutralRealRate: value }));
    },
    [updateConfig],
  );

  const handleTermPremium = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, termPremium: value }));
    },
    [updateConfig],
  );

  const handleInflationConvergenceYears = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, inflationConvergenceYears: value }));
    },
    [updateConfig],
  );

  const handleInflationTarget = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, inflationTarget: value }));
    },
    [updateConfig],
  );

  const handleEffectiveLowerBound = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, effectiveLowerBound: value }));
    },
    [updateConfig],
  );

  const handleFiscalDomThreshold = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, fiscalDominanceThreshold: value }));
    },
    [updateConfig],
  );

  const handleFiscalDomDampening = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, fiscalDominanceDampening: value }));
    },
    [updateConfig],
  );

  const handleRiskPremiumMax = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, fiscalRiskPremiumMax: value }));
    },
    [updateConfig],
  );

  const handleRiskTrajectoryWeight = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, fiscalRiskTrajectoryWeight: value }));
    },
    [updateConfig],
  );

  const handleRiskSustainabilityWeight = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, fiscalRiskSustainabilityWeight: value }));
    },
    [updateConfig],
  );

  const handleRiskLevelWeight = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, fiscalRiskLevelWeight: value }));
    },
    [updateConfig],
  );

  const handleRiskLevelMidpoint = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, fiscalRiskLevelMidpoint: value }));
    },
    [updateConfig],
  );

  const handleCorpTaxEffectiveness = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, corporateTaxEffectiveness: value }));
    },
    [updateConfig],
  );

  const handleForeignTreasuryDemand = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, foreignTreasuryDemand: value }));
    },
    [updateConfig],
  );

  const handleAiPEMultiplier = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, aiPEMultiplier: value }));
    },
    [updateConfig],
  );

  const handlePolicyRateSchedule = useCallback(
    (schedule: PolicySchedule) => {
      updateConfig((config) => ({ ...config, policyRateSchedule: schedule }));
    },
    [updateConfig],
  );

  return (
    <div className="space-y-3">
      {/* ── Yield Calibration ── */}
      <Slider
        label="Neutral Real Rate (r*)"
        value={neutralRealRate}
        min={-0.01}
        max={0.03}
        step={0.001}
        color={CONTROL_COLOR}
        onChange={handleNeutralRealRate}
        formatValue={(v) => `${(v * 100).toFixed(1)}%`}
      />
      <Slider
        label="Term Premium"
        value={termPremium}
        min={0}
        max={0.02}
        step={0.001}
        color={CONTROL_COLOR}
        onChange={handleTermPremium}
        formatValue={(v) => `${(v * 100).toFixed(1)}%`}
      />
      <Slider
        label="Inflation Convergence (yrs)"
        value={inflationConvergenceYears}
        min={1}
        max={15}
        step={1}
        color={CONTROL_COLOR}
        onChange={handleInflationConvergenceYears}
        formatValue={(v) => `${v}`}
      />
      <Slider
        label="Inflation Target"
        value={inflationTarget}
        min={-0.02}
        max={0.10}
        step={0.005}
        color={CONTROL_COLOR}
        onChange={handleInflationTarget}
        formatValue={(v) => `${(v * 100).toFixed(1)}%`}
      />
      <Slider
        label="Effective Lower Bound"
        value={effectiveLowerBound}
        min={-0.05}
        max={0.01}
        step={0.005}
        color={CONTROL_COLOR}
        onChange={handleEffectiveLowerBound}
        formatValue={(v) => `${(v * 100).toFixed(1)}%`}
      />

      {/* ── Fiscal Dominance ── */}
      <Slider
        label="Fiscal Dom. Threshold"
        value={fiscalDominanceThreshold}
        min={0.05}
        max={0.60}
        step={0.01}
        color={CONTROL_COLOR}
        onChange={handleFiscalDomThreshold}
        formatValue={(v) => `${(v * 100).toFixed(0)}%`}
      />
      <Slider
        label="Fiscal Dom. Dampening"
        value={fiscalDominanceDampening}
        min={0}
        max={1}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleFiscalDomDampening}
        formatValue={(v) => v.toFixed(2)}
      />

      {/* ── Fiscal Risk Premium ── */}
      <Slider
        label="Risk Premium Max"
        value={fiscalRiskPremiumMax}
        min={0.01}
        max={0.15}
        step={0.005}
        color={CONTROL_COLOR}
        onChange={handleRiskPremiumMax}
        formatValue={(v) => `${(v * 100).toFixed(1)}%`}
      />
      <Slider
        label="Trajectory Weight"
        value={fiscalRiskTrajectoryWeight}
        min={0}
        max={1}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleRiskTrajectoryWeight}
        formatValue={(v) => `${(v * 100).toFixed(0)}%`}
      />
      <Slider
        label="Sustainability Weight"
        value={fiscalRiskSustainabilityWeight}
        min={0}
        max={1}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleRiskSustainabilityWeight}
        formatValue={(v) => `${(v * 100).toFixed(0)}%`}
      />
      <Slider
        label="Level Weight"
        value={fiscalRiskLevelWeight}
        min={0}
        max={1}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleRiskLevelWeight}
        formatValue={(v) => `${(v * 100).toFixed(0)}%`}
      />
      <Slider
        label="Level Midpoint (Debt/GDP)"
        value={fiscalRiskLevelMidpoint}
        min={1.0}
        max={4.0}
        step={0.1}
        color={CONTROL_COLOR}
        onChange={handleRiskLevelMidpoint}
        formatValue={(v) => `${v.toFixed(1)}x`}
      />

      {/* ── Tax & Market ── */}
      <Slider
        label="Corp. Tax Effectiveness"
        value={corporateTaxEffectiveness}
        min={0.10}
        max={1.00}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleCorpTaxEffectiveness}
        formatValue={(v) => `${(v * 100).toFixed(0)}%`}
      />
      <Slider
        label="Foreign Treasury Demand"
        value={foreignTreasuryDemand}
        min={0.05}
        max={0.60}
        step={0.01}
        color={CONTROL_COLOR}
        onChange={handleForeignTreasuryDemand}
        formatValue={(v) => `${(v * 100).toFixed(0)}%`}
      />
      <Slider
        label="AI P/E Multiplier"
        value={aiPEMultiplier}
        min={0.5}
        max={3.0}
        step={0.1}
        color={CONTROL_COLOR}
        onChange={handleAiPEMultiplier}
        formatValue={(v) => `${v.toFixed(1)}x`}
      />

      {/* ── Policy Rate Schedule (Keyframe Editor) ── */}
      <PolicyToggleCard
        label="Fed Funds Rate Override"
        summary={policyRateSchedule.keyframes.length > 0
          ? `${(interpolatePolicy(policyRateSchedule, currentYear) * 100).toFixed(2)}%`
          : 'Off'}
        enabled={policyRateSchedule.keyframes.length > 0}
        onToggle={(enabled) => {
          if (!enabled) {
            handlePolicyRateSchedule(EMPTY_SCHEDULE);
          }
        }}
        accentColor={CONTROL_COLOR}
      >
        <PolicyKeyframeEditor
          label="Policy Rate"
          schedule={policyRateSchedule}
          onChange={handlePolicyRateSchedule}
          currentYear={currentYear}
          min={-0.05}
          max={0.15}
          step={0.0025}
          color={CONTROL_COLOR}
          formatValue={(v) => `${(v * 100).toFixed(2)}%`}
        />
      </PolicyToggleCard>

      <p className="text-text-muted text-[10px] leading-relaxed">
        Yield calibration sets base bond market conditions. Fiscal dominance
        constrains rate hikes when debt service exceeds threshold. Risk premium
        uses trajectory + sustainability + level composite model.
      </p>
    </div>
  );
}
