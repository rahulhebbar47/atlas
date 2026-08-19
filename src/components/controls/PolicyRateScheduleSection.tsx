/**
 * Policy rate schedule — the OWNER surface for the policyRateSchedule editor-class key
 * (R3c duplicate retirement: FiscalMonetaryControls' sliders retired in favor of the
 * Advanced grid; the keyframe editor it hosted moves here so the editor-class key
 * keeps a mounted owner).
 */
import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { useCurrentYear } from '@/hooks/useSimulation';
import { PolicyKeyframeEditor } from './PolicyKeyframeEditor';
import { PolicyToggleCard } from './PolicyToggleCard';
import { interpolatePolicy } from '@/utils/policyInterpolation';
import type { PolicySchedule } from '@/types';

const EMPTY_SCHEDULE: PolicySchedule = { keyframes: [] };
const CONTROL_COLOR = '#6366F1';

export function PolicyRateScheduleSection() {
  const policyRateSchedule = useSimulationStore((s) => s.config.policyRateSchedule ?? EMPTY_SCHEDULE);
  const updateConfig = useSimulationStore((s) => s.updateConfig);
  const currentYear = useCurrentYear();

  const handlePolicyRateSchedule = useCallback(
    (schedule: PolicySchedule) => {
      updateConfig((config) => ({ ...config, policyRateSchedule: schedule }));
    },
    [updateConfig],
  );

  return (
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
  );
}
