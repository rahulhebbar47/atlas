/**
 * ATLAS Transfer Headroom Card (Phase 5 Cleanup)
 *
 * Status card showing whether transfer inflation exceeds AI deflation headroom.
 *
 * Four values displayed:
 *   - AI Deflation: negative rate from AI productivity gains
 *   - Transfer Inflation: positive rate from transfer spending
 *   - Transfer Net: computed sum of above two (always consistent)
 *   - Overall Price Change: full macro.netInflation (includes all effects)
 *
 * Status is based on Transfer Net, not Overall Price Change.
 */

import { useCurrentYearData } from '@/hooks/useSimulation';
import { formatPercent } from '@/utils/format';

export function TransferHeadroomCard() {
  const yearData = useCurrentYearData();

  if (!yearData) return null;

  const { macro, monetary } = yearData;
  const aiDeflation = -Math.abs(macro.aiDeflationRate); // always negative
  const transferInflation = monetary.actualInflationFromTransfers; // always positive
  const transferNet = aiDeflation + transferInflation; // the sum users expect
  const overallPriceChange = macro.netInflation; // full picture

  let statusLabel: string;
  let statusContext: string;
  let statusColor: string;
  let borderColor: string;
  let bgColor: string;

  if (transferNet <= 0) {
    statusLabel = 'WITHIN HEADROOM';
    statusContext = 'AI deflation fully absorbs transfer-driven inflation.';
    statusColor = 'text-growth';
    borderColor = 'border-growth/20';
    bgColor = 'bg-growth/[0.04]';
  } else if (transferNet <= 0.05) {
    statusLabel = 'EXCEEDS HEADROOM';
    statusContext = `Transfers cause +${formatPercent(transferNet, 1)} inflation beyond AI deflation headroom.`;
    statusColor = 'text-caution';
    borderColor = 'border-caution/25';
    bgColor = 'bg-caution/[0.04]';
  } else {
    statusLabel = 'SIGNIFICANTLY EXCEEDS';
    statusContext = `Transfers cause +${formatPercent(transferNet, 1)} net inflation. Consider phasing in with AI growth.`;
    statusColor = 'text-critical';
    borderColor = 'border-critical/30';
    bgColor = 'bg-critical/[0.06]';
  }

  return (
    <div className={`border rounded-[12px] px-4 py-3 ${borderColor} ${bgColor}`}>
      <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted mb-2">
        Transfer Headroom
      </div>

      <div className={`font-mono text-sm font-medium ${statusColor}`}>
        {statusLabel}
      </div>
      <div className="font-mono text-[9px] text-text-muted mt-0.5 mb-3">
        {statusContext}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <div className="font-mono text-[10px] text-text-muted">AI Deflation</div>
          <div className="font-mono text-sm text-[#14B8A6]">
            {formatPercent(aiDeflation, 2)}
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-text-muted">Transfer Infl.</div>
          <div className="font-mono text-sm text-[#F97316]">
            +{formatPercent(transferInflation, 2)}
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-text-muted">Transfer Net</div>
          <div className={`font-mono text-sm ${transferNet > 0 ? 'text-[#F97316]' : 'text-[#14B8A6]'}`}>
            {transferNet > 0 ? '+' : ''}{formatPercent(transferNet, 2)}
          </div>
        </div>
      </div>

      <div className="border-t border-text-muted/20 pt-2">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] text-text-muted">Overall Price Change</span>
          <span className={`font-mono text-xs ${overallPriceChange > 0 ? 'text-[#F97316]' : 'text-[#14B8A6]'}`}>
            {overallPriceChange > 0 ? '+' : ''}{formatPercent(overallPriceChange, 2)}
          </span>
        </div>
        <div className="font-mono text-[8px] text-text-muted mt-0.5">
          Includes demand effects beyond AI and transfers
        </div>
      </div>
    </div>
  );
}
