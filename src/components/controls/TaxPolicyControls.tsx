/**
 * ATLAS Tax & Fiscal Policy Controls (Phase 5-tax)
 *
 * 4 sections:
 * 1. Tax Rates: income, payroll, corporate, capital gains
 * 2. Corporate/Investment: retention rate, AI market power
 * 3. AI Cost Structure: inference/manufacturing/energy annual change
 * 4. Post-Tax MPCs: wage, asset, transfer
 *
 * Feeds into macro.ts tax pipeline and bfcs.ts cost model.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import {
  BASELINE_INCOME_TAX_RATE,
  BASELINE_PAYROLL_RATE,
  BASELINE_CORPORATE_TAX_RATE,
  BASELINE_CAPITAL_GAINS_RATE,
  BASELINE_CORPORATE_RETENTION_RATE,
  DEFAULT_AI_PROFIT_GROWTH_RATE,
  DEFAULT_INFERENCE_ANNUAL_CHANGE,
  DEFAULT_MANUFACTURING_ANNUAL_CHANGE,
  DEFAULT_ENERGY_ANNUAL_CHANGE,
} from '@/models/constants';

/** Amber accent for fiscal policy controls */
const CONTROL_COLOR = '#F59E0B';

/** AI profit growth rate slider mapping: slider position → internal value */
const PROFIT_GROWTH_MAP = [0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 6.5, 8.0, 10.0];
const DEFAULT_PROFIT_SLIDER = 4; // maps to 2.0

function profitGrowthToSlider(internal: number): number {
  let closest = 1;
  let minDist = Math.abs(PROFIT_GROWTH_MAP[0]! - internal);
  for (let i = 1; i < PROFIT_GROWTH_MAP.length; i++) {
    const dist = Math.abs(PROFIT_GROWTH_MAP[i]! - internal);
    if (dist < minDist) {
      minDist = dist;
      closest = i + 1;
    }
  }
  return closest;
}

function sliderToProfitGrowth(slider: number): number {
  const idx = Math.max(0, Math.min(PROFIT_GROWTH_MAP.length - 1, slider - 1));
  return PROFIT_GROWTH_MAP[idx]!;
}

export function TaxPolicyControls() {
  // Tax rates
  const incomeTaxRate = useSimulationStore(
    (s) => s.config.taxConfig?.incomeTaxRate ?? BASELINE_INCOME_TAX_RATE,
  );
  const payrollTaxRate = useSimulationStore(
    (s) => s.config.taxConfig?.payrollTaxRate ?? BASELINE_PAYROLL_RATE,
  );
  const corporateTaxRate = useSimulationStore(
    (s) => s.config.taxConfig?.corporateTaxRate ?? BASELINE_CORPORATE_TAX_RATE,
  );
  const capitalGainsTaxRate = useSimulationStore(
    (s) => s.config.taxConfig?.capitalGainsTaxRate ?? BASELINE_CAPITAL_GAINS_RATE,
  );

  // Corporate/Investment
  const corporateRetention = useSimulationStore(
    (s) => s.config.corporateRetentionRate ?? BASELINE_CORPORATE_RETENTION_RATE,
  );
  const aiProfitGrowth = useSimulationStore(
    (s) => s.config.aiProfitGrowthRate ?? DEFAULT_AI_PROFIT_GROWTH_RATE,
  );

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

  const updateConfig = useSimulationStore((s) => s.updateConfig);

  // Tax rate handlers — must provide all required fields since TaxConfig has no optional fields
  const handleTaxRate = useCallback(
    (field: 'incomeTaxRate' | 'payrollTaxRate' | 'corporateTaxRate' | 'capitalGainsTaxRate') =>
      (value: number) => {
        updateConfig((config) => ({
          ...config,
          taxConfig: {
            incomeTaxRate: config.taxConfig?.incomeTaxRate ?? BASELINE_INCOME_TAX_RATE,
            payrollTaxRate: config.taxConfig?.payrollTaxRate ?? BASELINE_PAYROLL_RATE,
            corporateTaxRate: config.taxConfig?.corporateTaxRate ?? BASELINE_CORPORATE_TAX_RATE,
            capitalGainsTaxRate: config.taxConfig?.capitalGainsTaxRate ?? BASELINE_CAPITAL_GAINS_RATE,
            [field]: value,
          },
        }));
      },
    [updateConfig],
  );

  // Corporate handlers
  const handleRetention = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, corporateRetentionRate: value }));
    },
    [updateConfig],
  );

  const handleProfitGrowth = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, aiProfitGrowthRate: sliderToProfitGrowth(value) }));
    },
    [updateConfig],
  );

  // AI Cost handlers — must provide all required fields
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

  return (
    <div className="space-y-5">
      {/* Section 1: Tax Rates */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Tax Rates</p>
        <Slider
          label="Income Tax Rate"
          value={incomeTaxRate}
          min={0}
          max={0.50}
          step={0.001}
          color={CONTROL_COLOR}
          onChange={handleTaxRate('incomeTaxRate')}
          formatValue={(v) => `${(v * 100).toFixed(1)}%`}
        />
        <Slider
          label="Payroll Tax Rate"
          value={payrollTaxRate}
          min={0}
          max={0.50}
          step={0.001}
          color={CONTROL_COLOR}
          onChange={handleTaxRate('payrollTaxRate')}
          formatValue={(v) => `${(v * 100).toFixed(1)}%`}
        />
        <Slider
          label="Corporate Tax Rate"
          value={corporateTaxRate}
          min={0}
          max={0.50}
          step={0.001}
          color={CONTROL_COLOR}
          onChange={handleTaxRate('corporateTaxRate')}
          formatValue={(v) => `${(v * 100).toFixed(1)}%`}
        />
        <Slider
          label="Capital Gains Tax Rate"
          value={capitalGainsTaxRate}
          min={0}
          max={0.50}
          step={0.001}
          color={CONTROL_COLOR}
          onChange={handleTaxRate('capitalGainsTaxRate')}
          formatValue={(v) => `${(v * 100).toFixed(1)}%`}
        />
      </div>

      {/* Section 2: Corporate / Investment */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Corporate / Investment</p>
        <Slider
          label="Corporate Retention"
          value={corporateRetention}
          min={0}
          max={1}
          step={0.01}
          color={CONTROL_COLOR}
          onChange={handleRetention}
          formatValue={(v) => v.toFixed(2)}
        />
        <Slider
          label="AI Market Power"
          value={profitGrowthToSlider(aiProfitGrowth)}
          min={1}
          max={10}
          step={1}
          color={CONTROL_COLOR}
          onChange={handleProfitGrowth}
          formatValue={(v) => `${sliderToProfitGrowth(v).toFixed(1)}x`}
        />
      </div>

      {/* Section 3: AI Cost Structure */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">AI Cost Structure</p>
        <Slider
          label="Inference Cost Change"
          value={inferenceChange}
          min={-0.80}
          max={0.50}
          step={0.01}
          color={CONTROL_COLOR}
          onChange={handleAiCost('inferenceAnnualChange')}
          formatValue={(v) => `${(v * 100).toFixed(0)}%/yr`}
        />
        <Slider
          label="Manufacturing Cost Change"
          value={mfgChange}
          min={-0.50}
          max={0.50}
          step={0.01}
          color={CONTROL_COLOR}
          onChange={handleAiCost('manufacturingAnnualChange')}
          formatValue={(v) => `${(v * 100).toFixed(0)}%/yr`}
        />
        <Slider
          label="Energy Cost Change"
          value={energyChange}
          min={-0.50}
          max={0.50}
          step={0.01}
          color={CONTROL_COLOR}
          onChange={handleAiCost('energyAnnualChange')}
          formatValue={(v) => `${(v * 100).toFixed(0)}%/yr`}
        />
      </div>

      {/* DEPRECATED: Post-Tax MPC sliders moved to DemandModelControls (Phase 5-tax cleanup) */}
    </div>
  );
}
