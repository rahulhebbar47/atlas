/**
 * ATLAS Monetary & Prices Controls (Category 5)
 *
 * Subcategories:
 * - Money & Inflation: velocity sensitivity, base inflation rate
 * - AI Cost Structure: inference/manufacturing/energy annual change (relocated from TaxPolicyControls)
 * - Price Transmission: scarcity pass-through, wage pass-through, wage automation sensitivity (NEW)
 *
 * Relocated from: MonetaryControls (2 sliders), TaxPolicyControls (3 AI cost sliders).
 * New sliders: 3 price transmission parameters.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import {
  DEFAULT_VELOCITY_SENSITIVITY,
  BASE_INFLATION_RATE,
  DEFAULT_INFERENCE_ANNUAL_CHANGE,
  DEFAULT_MANUFACTURING_ANNUAL_CHANGE,
  DEFAULT_ENERGY_ANNUAL_CHANGE,
  DEFAULT_SCARCITY_PASS_THROUGH,
  DEFAULT_WAGE_PASS_THROUGH,
  DEFAULT_WAGE_AUTOMATION_SENSITIVITY,
} from '@/models/constants';

/** Cyan accent for monetary & prices controls */
const CONTROL_COLOR = '#06B6D4';

export function MonetaryPricesControls() {
  // Money & Inflation
  const velocitySens = useSimulationStore((s) => s.config.velocitySensitivity ?? DEFAULT_VELOCITY_SENSITIVITY);
  const baseInflation = useSimulationStore((s) => s.config.baseInflationRate);

  // AI Cost Structure
  const inferenceChange = useSimulationStore(
    (s) => s.config.aiCostParams?.inferenceAnnualChange ?? DEFAULT_INFERENCE_ANNUAL_CHANGE,
  );
  const mfgChange = useSimulationStore(
    (s) => s.config.aiCostParams?.manufacturingAnnualChange ?? DEFAULT_MANUFACTURING_ANNUAL_CHANGE,
  );
  const energyChange = useSimulationStore(
    (s) => s.config.aiCostParams?.energyAnnualChange ?? DEFAULT_ENERGY_ANNUAL_CHANGE,
  );

  // Price Transmission (NEW)
  const scarcityPT = useSimulationStore(
    (s) => s.config.scarcityPassThrough ?? DEFAULT_SCARCITY_PASS_THROUGH,
  );
  const wagePT = useSimulationStore(
    (s) => s.config.wagePassThrough ?? DEFAULT_WAGE_PASS_THROUGH,
  );
  const wageAutoSens = useSimulationStore(
    (s) => s.config.wageAutomationSensitivity ?? DEFAULT_WAGE_AUTOMATION_SENSITIVITY,
  );

  const updateConfig = useSimulationStore((s) => s.updateConfig);

  // Money & Inflation handlers
  const handleVelocitySens = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, velocitySensitivity: value })),
    [updateConfig],
  );
  const handleBaseInflation = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, baseInflationRate: value })),
    [updateConfig],
  );

  // AI Cost handlers
  const handleAiCost = useCallback(
    (field: 'inferenceAnnualChange' | 'manufacturingAnnualChange' | 'energyAnnualChange') =>
      (value: number) => {
        updateConfig((config) => ({
          ...config,
          aiCostParams: {
            inferenceAnnualChange: config.aiCostParams?.inferenceAnnualChange ?? DEFAULT_INFERENCE_ANNUAL_CHANGE,
            manufacturingAnnualChange: config.aiCostParams?.manufacturingAnnualChange ?? DEFAULT_MANUFACTURING_ANNUAL_CHANGE,
            energyAnnualChange: config.aiCostParams?.energyAnnualChange ?? DEFAULT_ENERGY_ANNUAL_CHANGE,
            composition: config.aiCostParams?.composition,
            [field]: value,
          },
        }));
      },
    [updateConfig],
  );

  // Price Transmission handlers (NEW)
  const handleScarcityPT = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, scarcityPassThrough: value })),
    [updateConfig],
  );
  const handleWagePT = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, wagePassThrough: value })),
    [updateConfig],
  );
  const handleWageAutoSens = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, wageAutomationSensitivity: value })),
    [updateConfig],
  );

  return (
    <div className="space-y-5">
      {/* Subcategory: Money & Inflation */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Money & Inflation</p>
        <Slider label="Velocity Sensitivity" value={velocitySens} min={0} max={0.10} step={0.005} color={CONTROL_COLOR} onChange={handleVelocitySens} formatValue={(v) => v.toFixed(3)} />
        <Slider label="Base Inflation Rate" value={baseInflation} min={0} max={0.10} step={0.005} color={CONTROL_COLOR} onChange={handleBaseInflation} formatValue={(v) => `${(v * 100).toFixed(1)}%`} />
      </div>

      {/* Subcategory: AI Cost Structure */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">AI Cost Structure</p>
        <Slider label="Inference Cost Change" value={inferenceChange} min={-0.80} max={0.50} step={0.01} color={CONTROL_COLOR} onChange={handleAiCost('inferenceAnnualChange')} formatValue={(v) => `${(v * 100).toFixed(0)}%/yr`} />
        <Slider label="Manufacturing Cost Change" value={mfgChange} min={-0.50} max={0.50} step={0.01} color={CONTROL_COLOR} onChange={handleAiCost('manufacturingAnnualChange')} formatValue={(v) => `${(v * 100).toFixed(0)}%/yr`} />
        <Slider label="Energy Cost Change" value={energyChange} min={-0.50} max={0.50} step={0.01} color={CONTROL_COLOR} onChange={handleAiCost('energyAnnualChange')} formatValue={(v) => `${(v * 100).toFixed(0)}%/yr`} />
      </div>

      {/* Subcategory: Price Transmission */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Price Transmission</p>
        <Slider label="Scarcity Pass-Through" value={scarcityPT} min={0} max={1} step={0.05} color={CONTROL_COLOR} onChange={handleScarcityPT} formatValue={(v) => v.toFixed(2)} />
        <Slider label="Wage Pass-Through" value={wagePT} min={0} max={1} step={0.05} color={CONTROL_COLOR} onChange={handleWagePT} formatValue={(v) => v.toFixed(2)} />
        <Slider label="Wage Automation Sensitivity" value={wageAutoSens} min={0} max={1} step={0.05} color={CONTROL_COLOR} onChange={handleWageAutoSens} formatValue={(v) => v.toFixed(2)} />
      </div>
    </div>
  );
}
