/**
 * ATLAS Financial Markets Controls
 *
 * Sliders for credit/financial market parameters:
 * - Credit UE Sensitivity (how much unemployment tightens credit)
 * - Credit Investment Sensitivity (credit tightening impact on investment)
 * - Credit Consumption Sensitivity (credit tightening impact on consumption)
 * - Demand Feedback Sensitivity (consumption-employment loop strength)
 *
 * Amber accent (#F59E0B) to distinguish from other control groups.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import {
  CREDIT_UE_SENSITIVITY,
  CREDIT_INVESTMENT_SENSITIVITY,
  CREDIT_CONSUMPTION_SENSITIVITY,
  DEMAND_FEEDBACK_SENSITIVITY,
} from '@/models/constants';

/** Amber accent for financial markets controls */
const CONTROL_COLOR = '#F59E0B';

export function FinancialMarketsControls() {
  const creditUE = useSimulationStore((s) => s.config.creditUESensitivity ?? CREDIT_UE_SENSITIVITY);
  const creditInvest = useSimulationStore((s) => s.config.creditInvestmentSensitivity ?? CREDIT_INVESTMENT_SENSITIVITY);
  const creditConsump = useSimulationStore((s) => s.config.creditConsumptionSensitivity ?? CREDIT_CONSUMPTION_SENSITIVITY);
  const demandFeedback = useSimulationStore((s) => s.config.demandFeedbackSensitivity ?? DEMAND_FEEDBACK_SENSITIVITY);
  const updateConfig = useSimulationStore((s) => s.updateConfig);

  const handleCreditUE = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, creditUESensitivity: value }));
    },
    [updateConfig],
  );

  const handleCreditInvest = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, creditInvestmentSensitivity: value }));
    },
    [updateConfig],
  );

  const handleCreditConsump = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, creditConsumptionSensitivity: value }));
    },
    [updateConfig],
  );

  const handleDemandFeedback = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, demandFeedbackSensitivity: value }));
    },
    [updateConfig],
  );

  return (
    <div className="space-y-3">
      <Slider
        label="Credit UE Sensitivity"
        value={creditUE}
        min={0}
        max={5}
        step={0.1}
        color={CONTROL_COLOR}
        onChange={handleCreditUE}
        formatValue={(v) => v.toFixed(1)}
      />
      <Slider
        label="Credit → Investment"
        value={creditInvest}
        min={0}
        max={2}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleCreditInvest}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Credit → Consumption"
        value={creditConsump}
        min={0}
        max={2}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleCreditConsump}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Demand Feedback"
        value={demandFeedback}
        min={0}
        max={2}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleDemandFeedback}
        formatValue={(v) => v.toFixed(2)}
      />
      <p className="text-text-muted text-[10px] leading-relaxed">
        Credit markets tighten as unemployment rises, reducing
        investment and consumption. Demand feedback links
        consumption drops to further employment loss.
      </p>
    </div>
  );
}
