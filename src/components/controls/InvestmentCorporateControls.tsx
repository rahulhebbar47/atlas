/**
 * ATLAS Investment & Corporate Controls (Category 3)
 *
 * Subcategories:
 * - Investment Demand: profit realization, baseline GDP growth, AI utilization sensitivity,
 *   consumer demand/credit/traditional investment sensitivities, traditional investment GDP fraction
 * - Corporate & Profits: AI profit margin, traditional profit margin, corporate retention, AI market power
 * - AI Production: investment fraction, onshoring fraction, new job wage fraction
 *
 * Relocated from: DemandModelControls (profit realization), TaxPolicyControls (corporate retention,
 *   AI market power), AIProductionControls (3 sliders).
 * New sliders: 6 investment demand + 2 corporate.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import {
  BASELINE_GDP_GROWTH_RATE,
  TRADITIONAL_INVESTMENT_GDP_FRACTION,
  DEFAULT_AI_PROFIT_MARGIN,
  DEFAULT_TRADITIONAL_PROFIT_MARGIN,
  BASELINE_CORPORATE_RETENTION_RATE,
  DEFAULT_AI_PROFIT_GROWTH_RATE,
  DEFAULT_AI_PRODUCTION_INVESTMENT_FRACTION,
  DEFAULT_AI_PRODUCTION_ONSHORING_FRACTION,
  DEFAULT_NEW_JOB_WAGE_FRACTION,
  DEFAULT_AI_PE_SENSITIVITY,
  DEFAULT_TRADITIONAL_PE_SENSITIVITY,
  DEFAULT_AUGMENTATION_MULTIPLIER,
} from '@/models/constants';

/** Blue accent for investment & corporate controls */
const CONTROL_COLOR = '#3B82F6';

/** AI profit growth rate slider mapping: slider position → internal value */
const PROFIT_GROWTH_MAP = [0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 6.5, 8.0, 10.0];

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

export function InvestmentCorporateControls() {
  // Investment Demand
  const baselineGDPGrowth = useSimulationStore(
    (s) => s.config.baselineGDPGrowth,
  );
  const aiUtilSens = useSimulationStore(
    (s) => s.config.aiUtilizationSensitivity ?? 50,
  );
  const consumerDemandInvSens = useSimulationStore(
    (s) => s.config.consumerDemandInvestmentSensitivity ?? 50,
  );
  const creditInvRespSens = useSimulationStore(
    (s) => s.config.creditInvestmentResponseSensitivity ?? 50,
  );
  const tradInvDemandSens = useSimulationStore(
    (s) => s.config.traditionalInvestmentDemandSensitivity ?? 30,
  );
  const tradInvGDPFrac = useSimulationStore(
    (s) => s.config.traditionalInvestmentGDPFraction ?? TRADITIONAL_INVESTMENT_GDP_FRACTION,
  );

  // Corporate & Profits
  const aiProfitMargin = useSimulationStore(
    (s) => s.config.aiProfitMargin ?? DEFAULT_AI_PROFIT_MARGIN,
  );
  const tradProfitMargin = useSimulationStore(
    (s) => s.config.traditionalProfitMargin ?? DEFAULT_TRADITIONAL_PROFIT_MARGIN,
  );
  const corporateRetention = useSimulationStore(
    (s) => s.config.corporateRetentionRate ?? BASELINE_CORPORATE_RETENTION_RATE,
  );
  const aiProfitGrowth = useSimulationStore(
    (s) => s.config.aiProfitGrowthRate ?? DEFAULT_AI_PROFIT_GROWTH_RATE,
  );

  // AI Production
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

  // Market Valuation
  const aiPESens = useSimulationStore(
    (s) => s.config.aiPESensitivity ?? DEFAULT_AI_PE_SENSITIVITY,
  );
  const tradPESens = useSimulationStore(
    (s) => s.config.traditionalPESensitivity ?? DEFAULT_TRADITIONAL_PE_SENSITIVITY,
  );

  const updateConfig = useSimulationStore((s) => s.updateConfig);

  // Investment Demand handlers
  const handleBaselineGDP = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, baselineGDPGrowth: value })),
    [updateConfig],
  );
  const handleAiUtilSens = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, aiUtilizationSensitivity: value })),
    [updateConfig],
  );
  const handleConsumerDemandInvSens = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, consumerDemandInvestmentSensitivity: value })),
    [updateConfig],
  );
  const handleCreditInvRespSens = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, creditInvestmentResponseSensitivity: value })),
    [updateConfig],
  );
  const handleTradInvDemandSens = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, traditionalInvestmentDemandSensitivity: value })),
    [updateConfig],
  );
  const handleTradInvGDPFrac = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, traditionalInvestmentGDPFraction: value })),
    [updateConfig],
  );

  // Corporate handlers
  const handleAiProfitMargin = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, aiProfitMargin: value })),
    [updateConfig],
  );
  const handleTradProfitMargin = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, traditionalProfitMargin: value })),
    [updateConfig],
  );
  const handleRetention = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, corporateRetentionRate: value })),
    [updateConfig],
  );
  const handleProfitGrowth = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, aiProfitGrowthRate: sliderToProfitGrowth(value) })),
    [updateConfig],
  );

  // AI Production handlers
  const handleInvest = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, aiProductionInvestmentFraction: value })),
    [updateConfig],
  );
  const handleOnshore = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, aiProductionOnshoringFraction: value })),
    [updateConfig],
  );
  const handleWage = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, newJobWageFraction: value })),
    [updateConfig],
  );
  const handleAugmentation = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, augmentationMultiplier: value })),
    [updateConfig],
  );

  // Market Valuation handlers
  const handleAiPESens = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, aiPESensitivity: value })),
    [updateConfig],
  );
  const handleTradPESens = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, traditionalPESensitivity: value })),
    [updateConfig],
  );

  const fractionSum = investFrac + onshoreFrac;

  return (
    <div className="space-y-5">
      {/* Subcategory: Investment Demand */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Investment Demand</p>
        <Slider
          label="Baseline GDP Growth"
          value={baselineGDPGrowth}
          min={0}
          max={0.05}
          step={0.001}
          color={CONTROL_COLOR}
          onChange={handleBaselineGDP}
          formatValue={(v) => `${(v * 100).toFixed(1)}%`}
        />
        <Slider
          label="AI Utilization Sensitivity"
          value={aiUtilSens}
          min={0}
          max={100}
          step={1}
          color={CONTROL_COLOR}
          onChange={handleAiUtilSens}
          formatValue={(v) => v.toFixed(0)}
        />
        <Slider
          label="Consumer Demand Inv. Sens."
          value={consumerDemandInvSens}
          min={0}
          max={100}
          step={1}
          color={CONTROL_COLOR}
          onChange={handleConsumerDemandInvSens}
          formatValue={(v) => v.toFixed(0)}
        />
        <Slider
          label="Credit Inv. Response Sens."
          value={creditInvRespSens}
          min={0}
          max={100}
          step={1}
          color={CONTROL_COLOR}
          onChange={handleCreditInvRespSens}
          formatValue={(v) => v.toFixed(0)}
        />
        <Slider
          label="Trad. Inv. Demand Sens."
          value={tradInvDemandSens}
          min={0}
          max={100}
          step={1}
          color={CONTROL_COLOR}
          onChange={handleTradInvDemandSens}
          formatValue={(v) => v.toFixed(0)}
        />
        <Slider
          label="Trad. Inv. GDP Fraction"
          value={tradInvGDPFrac}
          min={0.05}
          max={0.40}
          step={0.005}
          color={CONTROL_COLOR}
          onChange={handleTradInvGDPFrac}
          formatValue={(v) => v.toFixed(3)}
        />
      </div>

      {/* Subcategory: Corporate & Profits */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Corporate & Profits</p>
        <Slider
          label="AI Profit Margin"
          value={aiProfitMargin}
          min={0.05}
          max={0.60}
          step={0.01}
          color={CONTROL_COLOR}
          onChange={handleAiProfitMargin}
          formatValue={(v) => `${(v * 100).toFixed(0)}%`}
        />
        <Slider
          label="Traditional Profit Margin"
          value={tradProfitMargin}
          min={0.02}
          max={0.30}
          step={0.01}
          color={CONTROL_COLOR}
          onChange={handleTradProfitMargin}
          formatValue={(v) => `${(v * 100).toFixed(0)}%`}
        />
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

      {/* Subcategory: AI Production */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">AI Production</p>
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
            Investment + Onshoring = {fractionSum.toFixed(2)} (&gt;1.0) — consumer goods clamped to 0.
          </p>
        )}
      </div>

      {/* Subcategory: Market Valuation */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Market Valuation</p>
        <Slider
          label="AI Valuation Sensitivity"
          value={aiPESens}
          min={25}
          max={250}
          step={5}
          color={CONTROL_COLOR}
          onChange={handleAiPESens}
          formatValue={(v) => `${v}`}
        />
        <Slider
          label="Market Valuation Sensitivity"
          value={tradPESens}
          min={15}
          max={150}
          step={5}
          color={CONTROL_COLOR}
          onChange={handleTradPESens}
          formatValue={(v) => `${v}`}
        />
      </div>
    </div>
  );
}
