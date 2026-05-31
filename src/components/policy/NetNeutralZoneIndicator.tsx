/**
 * ATLAS Net Neutral Zone Indicator (Phase 5)
 *
 * Status badge: WITHIN or EXCEEDS net neutral zone.
 * Shows current transfers vs max neutral transfers as a ratio
 * with a progress-bar style visualization.
 */

import { usePolicyMetrics } from '@/hooks/usePolicyData';
import { useCurrentYearData } from '@/hooks/useSimulation';
import { formatCurrency } from '@/utils/format';

export function NetNeutralZoneIndicator() {
  const metrics = usePolicyMetrics();
  const yearData = useCurrentYearData();

  if (!metrics || !yearData) return null;

  const { monetary } = yearData;
  const ratio = monetary.maxNeutralTransfers > 0
    ? metrics.transferAddition / monetary.maxNeutralTransfers
    : 0;
  const clampedRatio = Math.min(ratio, 1);
  const isWithin = monetary.isWithinNeutralZone;

  return (
    <div
      className={`border rounded-[12px] px-4 py-3 ${
        isWithin
          ? 'border-growth/20 bg-growth/[0.04]'
          : 'border-critical/30 bg-critical/[0.06]'
      }`}
    >
      <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted mb-1">
        Net Neutral Zone
      </div>
      <div className={`font-mono text-sm mb-2 ${isWithin ? 'text-growth' : 'text-critical'}`}>
        {isWithin ? 'Within' : 'Exceeds'} Net Neutral Zone
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden mb-1.5">
        <div
          className={`h-full rounded-full transition-all ${
            ratio > 0.9 ? 'bg-critical' : ratio > 0.7 ? 'bg-caution' : 'bg-growth'
          }`}
          style={{ width: `${clampedRatio * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] text-text-muted">
          {formatCurrency(metrics.transferAddition, { compact: true })}
        </span>
        <span className="font-mono text-[9px] text-text-muted">
          {formatCurrency(monetary.maxNeutralTransfers, { compact: true })}
        </span>
      </div>
    </div>
  );
}
