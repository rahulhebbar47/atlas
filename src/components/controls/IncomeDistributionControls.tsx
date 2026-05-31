/**
 * ATLAS Income Distribution Controls
 *
 * Sliders for CBO bottom-80% income shares used in Median CWI computation.
 * These control what fraction of each aggregate income channel reaches
 * the bottom 80% of households. Purely affects the Median CWI reporting
 * metric — no simulation feedback.
 *
 * Source: CBO "Distribution of Household Income, 2022" (January 2026)
 *   + CRS Report R44705 citing CBO capital income data by quintile.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import {
  BOTTOM80_WAGE_SHARE,
  BOTTOM80_TRANSFER_SHARE,
  BOTTOM80_ASSET_SHARE,
} from '@/models/constants';

/** Purple accent for income distribution controls */
const CONTROL_COLOR = '#A855F7';

export function IncomeDistributionControls() {
  const wageShare = useSimulationStore(
    (s) => s.config.bottom80WageShare ?? BOTTOM80_WAGE_SHARE,
  );
  const transferShare = useSimulationStore(
    (s) => s.config.bottom80TransferShare ?? BOTTOM80_TRANSFER_SHARE,
  );
  const assetShare = useSimulationStore(
    (s) => s.config.bottom80AssetShare ?? BOTTOM80_ASSET_SHARE,
  );
  const updateConfig = useSimulationStore((s) => s.updateConfig);

  const handleWageShare = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, bottom80WageShare: value }));
    },
    [updateConfig],
  );

  const handleTransferShare = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, bottom80TransferShare: value }));
    },
    [updateConfig],
  );

  const handleAssetShare = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, bottom80AssetShare: value }));
    },
    [updateConfig],
  );

  return (
    <div className="space-y-3">
      <Slider
        label="Wage Share (Bottom 80%)"
        value={wageShare}
        min={0.20}
        max={0.70}
        step={0.01}
        color={CONTROL_COLOR}
        onChange={handleWageShare}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Transfer Share (Bottom 80%)"
        value={transferShare}
        min={0.50}
        max={1.00}
        step={0.01}
        color={CONTROL_COLOR}
        onChange={handleTransferShare}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Asset Share (Bottom 80%)"
        value={assetShare}
        min={0.01}
        max={0.50}
        step={0.01}
        color={CONTROL_COLOR}
        onChange={handleAssetShare}
        formatValue={(v) => v.toFixed(2)}
      />
      <p className="text-text-muted text-[10px] leading-relaxed">
        CBO income shares for bottom 80% of households. Higher asset share
        models more democratic ownership (pensions, 401k). Drives Median CWI
        — the gap from System CWI shows inequality.
      </p>
    </div>
  );
}
