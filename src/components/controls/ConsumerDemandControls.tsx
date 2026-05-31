/**
 * ATLAS Consumer Demand Controls (Category 4)
 *
 * Subcategories:
 * - Marginal Propensity to Consume: MPC Wage/Asset/Transfer (post-tax, rewired from DemandModelControls)
 * - Demand Sensitivity: MPC Wage UE Sensitivity, Demand Feedback Sensitivity
 * - Income Distribution: Bottom 80% wage/transfer/asset shares
 * - Deflation Response: Deferrable Consumption Share, Deflation Midpoint, Deflation Steepness
 *
 * Relocated from: DemandModelControls (MPCs, MPC UE Sens), FinancialMarketsControls (demand feedback),
 *   FeedbackLoopControls (deferrable spending), IncomeDistributionControls (3 shares).
 * New sliders: Deflation Deferral Midpoint, Deflation Deferral Steepness.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import {
  DEFAULT_POST_TAX_MPC_WAGE,
  DEFAULT_POST_TAX_MPC_ASSET,
  DEFAULT_POST_TAX_MPC_TRANSFER,
  DEFAULT_MPC_WAGE_UE_SENSITIVITY,
  DEMAND_FEEDBACK_SENSITIVITY,
  BOTTOM80_WAGE_SHARE,
  BOTTOM80_TRANSFER_SHARE,
  BOTTOM80_ASSET_SHARE,
  DEFERRABLE_CONSUMPTION_SHARE,
  DEFLATION_MIDPOINT,
  DEFLATION_STEEPNESS,
} from '@/models/constants';

/** Rose accent for consumer demand controls */
const CONTROL_COLOR = '#F43F5E';

export function ConsumerDemandControls() {
  // MPC (post-tax)
  const mpcWage = useSimulationStore((s) => s.config.postTaxMPCs?.wage ?? DEFAULT_POST_TAX_MPC_WAGE);
  const mpcAsset = useSimulationStore((s) => s.config.postTaxMPCs?.asset ?? DEFAULT_POST_TAX_MPC_ASSET);
  const mpcTransfer = useSimulationStore((s) => s.config.postTaxMPCs?.transfer ?? DEFAULT_POST_TAX_MPC_TRANSFER);
  const mpcWageUESens = useSimulationStore(
    (s) => s.config.mpcWageUESensitivity ?? DEFAULT_MPC_WAGE_UE_SENSITIVITY,
  );
  const effectiveMpcWage = useSimulationStore((s) => {
    const cy = s.currentYear;
    const yr = s.timeline.years.find(y => y.year === cy);
    return yr?.macro.effectiveMpcWage ?? (s.config.postTaxMPCs?.wage ?? DEFAULT_POST_TAX_MPC_WAGE);
  });

  // Demand Sensitivity
  const demandFeedback = useSimulationStore(
    (s) => s.config.demandFeedbackSensitivity ?? DEMAND_FEEDBACK_SENSITIVITY,
  );

  // Income Distribution
  const wageShare = useSimulationStore((s) => s.config.bottom80WageShare ?? BOTTOM80_WAGE_SHARE);
  const transferShare = useSimulationStore((s) => s.config.bottom80TransferShare ?? BOTTOM80_TRANSFER_SHARE);
  const assetShare = useSimulationStore((s) => s.config.bottom80AssetShare ?? BOTTOM80_ASSET_SHARE);

  // Deflation Response
  const deferrableShare = useSimulationStore(
    (s) => s.config.deferrableConsumptionShare ?? DEFERRABLE_CONSUMPTION_SHARE,
  );
  const deflationMidpoint = useSimulationStore(
    (s) => s.config.deflationMidpoint ?? DEFLATION_MIDPOINT,
  );
  const deflationSteepness = useSimulationStore(
    (s) => s.config.deflationSteepness ?? DEFLATION_STEEPNESS,
  );

  const updateConfig = useSimulationStore((s) => s.updateConfig);

  // MPC handlers (write to postTaxMPCs)
  const handleMpcWage = useCallback(
    (value: number) => updateConfig((c) => ({
      ...c,
      postTaxMPCs: {
        wage: value,
        asset: c.postTaxMPCs?.asset ?? DEFAULT_POST_TAX_MPC_ASSET,
        transfer: c.postTaxMPCs?.transfer ?? DEFAULT_POST_TAX_MPC_TRANSFER,
      },
    })),
    [updateConfig],
  );
  const handleMpcAsset = useCallback(
    (value: number) => updateConfig((c) => ({
      ...c,
      postTaxMPCs: {
        wage: c.postTaxMPCs?.wage ?? DEFAULT_POST_TAX_MPC_WAGE,
        asset: value,
        transfer: c.postTaxMPCs?.transfer ?? DEFAULT_POST_TAX_MPC_TRANSFER,
      },
    })),
    [updateConfig],
  );
  const handleMpcTransfer = useCallback(
    (value: number) => updateConfig((c) => ({
      ...c,
      postTaxMPCs: {
        wage: c.postTaxMPCs?.wage ?? DEFAULT_POST_TAX_MPC_WAGE,
        asset: c.postTaxMPCs?.asset ?? DEFAULT_POST_TAX_MPC_ASSET,
        transfer: value,
      },
    })),
    [updateConfig],
  );
  const handleMpcWageUESens = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, mpcWageUESensitivity: value })),
    [updateConfig],
  );
  const handleDemandFeedback = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, demandFeedbackSensitivity: value })),
    [updateConfig],
  );
  const handleWageShare = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, bottom80WageShare: value })),
    [updateConfig],
  );
  const handleTransferShare = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, bottom80TransferShare: value })),
    [updateConfig],
  );
  const handleAssetShare = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, bottom80AssetShare: value })),
    [updateConfig],
  );
  const handleDeferrable = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, deferrableConsumptionShare: value })),
    [updateConfig],
  );
  const handleDeflationMidpoint = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, deflationMidpoint: value })),
    [updateConfig],
  );
  const handleDeflationSteepness = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, deflationSteepness: value })),
    [updateConfig],
  );

  return (
    <div className="space-y-5">
      {/* Subcategory: Marginal Propensity to Consume */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Marginal Propensity to Consume</p>
        <Slider label="MPC Wage" value={mpcWage} min={0} max={1} step={0.01} color={CONTROL_COLOR} onChange={handleMpcWage} formatValue={(v) => v.toFixed(2)} />
        <Slider label="MPC Asset" value={mpcAsset} min={0} max={1} step={0.01} color={CONTROL_COLOR} onChange={handleMpcAsset} formatValue={(v) => v.toFixed(2)} />
        <Slider label="MPC Transfer" value={mpcTransfer} min={0} max={1} step={0.01} color={CONTROL_COLOR} onChange={handleMpcTransfer} formatValue={(v) => v.toFixed(2)} />
        <div className="flex justify-between text-text-muted text-[10px] mt-1">
          <span>Effective MPC Wage: {effectiveMpcWage.toFixed(3)}</span>
        </div>
      </div>

      {/* Subcategory: Demand Sensitivity */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Demand Sensitivity</p>
        <Slider label="MPC Wage UE Sensitivity" value={mpcWageUESens} min={0} max={0.05} step={0.001} color={CONTROL_COLOR} onChange={handleMpcWageUESens} formatValue={(v) => v.toFixed(3)} />
        <Slider label="Demand Feedback" value={demandFeedback} min={0} max={2} step={0.05} color={CONTROL_COLOR} onChange={handleDemandFeedback} formatValue={(v) => v.toFixed(2)} />
      </div>

      {/* Subcategory: Income Distribution */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Income Distribution</p>
        <Slider label="Wage Share (Bottom 80%)" value={wageShare} min={0.20} max={0.70} step={0.01} color={CONTROL_COLOR} onChange={handleWageShare} formatValue={(v) => v.toFixed(2)} />
        <Slider label="Transfer Share (Bottom 80%)" value={transferShare} min={0.50} max={1.00} step={0.01} color={CONTROL_COLOR} onChange={handleTransferShare} formatValue={(v) => v.toFixed(2)} />
        <Slider label="Asset Share (Bottom 80%)" value={assetShare} min={0.01} max={0.50} step={0.01} color={CONTROL_COLOR} onChange={handleAssetShare} formatValue={(v) => v.toFixed(2)} />
      </div>

      {/* Subcategory: Deflation Response */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Deflation Response</p>
        <Slider label="Deferrable Spending" value={deferrableShare} min={0.1} max={0.5} step={0.01} color={CONTROL_COLOR} onChange={handleDeferrable} formatValue={(v) => `${(v * 100).toFixed(0)}%`} />
        <Slider label="Deflation Deferral Midpoint" value={deflationMidpoint} min={0.01} max={0.15} step={0.01} color={CONTROL_COLOR} onChange={handleDeflationMidpoint} formatValue={(v) => `${(v * 100).toFixed(0)}%`} />
        <Slider label="Deflation Deferral Steepness" value={deflationSteepness} min={5} max={100} step={5} color={CONTROL_COLOR} onChange={handleDeflationSteepness} formatValue={(v) => v.toFixed(0)} />
      </div>
    </div>
  );
}
