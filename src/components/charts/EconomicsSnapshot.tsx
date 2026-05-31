/**
 * ATLAS Economics Snapshot (Phase 5)
 *
 * View-dependent sidebar for the Economics screen.
 * Shows: Income splits (W/A/T), Capacity Utilization, Price Level,
 * Deflation Rate, Credit Tightening, AI Coverage.
 */

import { MetricCard } from '@/components/shared/MetricCard';
import { useCurrentYearData } from '@/hooks/useSimulation';
import { formatPercent, formatNumber } from '@/utils/format';

export function EconomicsSnapshot() {
  const yearData = useCurrentYearData();

  if (!yearData) return null;

  const { macro } = yearData;

  return (
    <div className="space-y-3">
      <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted">
        Economics
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="Wage Share"
          value={formatPercent(macro.incomeComposition.wageShare)}
        />
        <MetricCard
          label="Asset Share"
          value={formatPercent(macro.incomeComposition.assetShare)}
        />
        <MetricCard
          label="Transfer Share"
          value={formatPercent(macro.incomeComposition.transferShare)}
        />
        <MetricCard
          label="AI Coverage"
          value={formatPercent(macro.automationCoverage)}
        />
        <MetricCard
          label="Capacity Util."
          value={formatPercent(macro.capacityUtilization)}
          deltaType={macro.capacityUtilization < 0.7 ? 'negative' : 'positive'}
        />
        <MetricCard
          label="Price Level"
          value={macro.priceLevel >= 10 ? formatNumber(macro.priceLevel, { compact: true }) : macro.priceLevel.toFixed(3)}
          deltaType={macro.netInflation < 0 ? 'negative' : 'neutral'}
        />
        <MetricCard
          label="Net Inflation"
          value={formatPercent(macro.netInflation)}
          deltaType={macro.netInflation < -0.02 ? 'negative' : macro.netInflation > 0.05 ? 'negative' : 'neutral'}
        />
        <MetricCard
          label="Credit Tight."
          value={formatPercent(macro.consumerCreditTightening)}
          deltaType={macro.consumerCreditTightening > 0.3 ? 'negative' : 'neutral'}
        />
      </div>
    </div>
  );
}
