/**
 * ATLAS Demand Model Controls
 *
 * Sliders for Phase 3 demand-constrained GDP parameters:
 * - MPC Wage: marginal propensity to consume from wage income
 * - MPC Asset: marginal propensity to consume from asset/capital income
 * - MPC Transfer: marginal propensity to consume from transfer income
 *
 * These feed into computeMacro() for differentiated MPC consumption.
 * Follows AIProductionControls.tsx slider patterns.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import {
  DEFAULT_MPC_WAGE_UE_SENSITIVITY,
  DEFAULT_POST_TAX_MPC_WAGE,
  DEFAULT_POST_TAX_MPC_ASSET,
  DEFAULT_POST_TAX_MPC_TRANSFER,
} from '@/models/constants';

/** Rose accent for demand model controls (distinct from gold/teal/violet) */
const CONTROL_COLOR = '#F43F5E';

export function DemandModelControls() {
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
  const updateConfig = useSimulationStore((s) => s.updateConfig);

  const handleMpcWage = useCallback(
    (value: number) => {
      updateConfig((config) => ({
        ...config,
        postTaxMPCs: {
          wage: value,
          asset: config.postTaxMPCs?.asset ?? DEFAULT_POST_TAX_MPC_ASSET,
          transfer: config.postTaxMPCs?.transfer ?? DEFAULT_POST_TAX_MPC_TRANSFER,
        },
      }));
    },
    [updateConfig],
  );

  const handleMpcAsset = useCallback(
    (value: number) => {
      updateConfig((config) => ({
        ...config,
        postTaxMPCs: {
          wage: config.postTaxMPCs?.wage ?? DEFAULT_POST_TAX_MPC_WAGE,
          asset: value,
          transfer: config.postTaxMPCs?.transfer ?? DEFAULT_POST_TAX_MPC_TRANSFER,
        },
      }));
    },
    [updateConfig],
  );

  const handleMpcTransfer = useCallback(
    (value: number) => {
      updateConfig((config) => ({
        ...config,
        postTaxMPCs: {
          wage: config.postTaxMPCs?.wage ?? DEFAULT_POST_TAX_MPC_WAGE,
          asset: config.postTaxMPCs?.asset ?? DEFAULT_POST_TAX_MPC_ASSET,
          transfer: value,
        },
      }));
    },
    [updateConfig],
  );

  const handleMpcWageUESens = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, mpcWageUESensitivity: value }));
    },
    [updateConfig],
  );

  return (
    <div className="space-y-3">
      <Slider
        label="MPC Wage"
        value={mpcWage}
        min={0}
        max={1}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleMpcWage}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="MPC Asset"
        value={mpcAsset}
        min={0}
        max={1}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleMpcAsset}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="MPC Transfer"
        value={mpcTransfer}
        min={0}
        max={1}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleMpcTransfer}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="MPC Wage UE Sensitivity"
        value={mpcWageUESens}
        min={0}
        max={0.05}
        step={0.001}
        color={CONTROL_COLOR}
        onChange={handleMpcWageUESens}
        formatValue={(v) => v.toFixed(3)}
      />
      <div className="flex justify-between text-text-muted text-[10px] mt-1">
        <span>Effective MPC Wage: {effectiveMpcWage.toFixed(3)}</span>
      </div>
      <p className="text-text-muted text-[10px] leading-relaxed">
        Post-tax MPCs: workers spend ~95% of after-tax wages, investors ~42%
        of after-tax capital income, transfer recipients ~95%. When income
        shifts from wages to assets, consumption drops.
      </p>
    </div>
  );
}
