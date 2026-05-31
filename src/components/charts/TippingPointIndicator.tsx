/**
 * ATLAS Two-Window Status Card (Phase 5 Cleanup)
 *
 * Primary status card showing the current state of both policy windows.
 * Contextual messages per status:
 *   - pre-impact (neutral): No displacement detected
 *   - prep-only (amber): Displacement rising, build infrastructure
 *   - both-open / fiscal-only (green): AI generating revenue, deploy at scale
 *   - post-window (red): Windows closed, deficit-funded only
 *   - recovery (blue): CWI rising
 */

import { usePolicyWindowInfo, useCurrentYear } from '@/hooks/useSimulation';
import { useCurrentYearData } from '@/hooks/useSimulation';
import { formatCurrency, formatPercent } from '@/utils/format';

export function TippingPointIndicator() {
  const {
    prepWindowOpen, prepWindowClose,
    fiscalWindowOpen, fiscalWindowClose,
    status,
  } = usePolicyWindowInfo();
  const currentYear = useCurrentYear();
  const yearData = useCurrentYearData();

  const macro = yearData?.macro;

  // Pre-impact — no displacement detected
  if (status === 'pre-impact') {
    return (
      <div className="border border-text-muted/20 bg-text-muted/[0.04] rounded-[12px] px-4 py-3">
        <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted/70 mb-1">
          Window Status
        </div>
        <div className="font-mono text-sm text-text-muted">
          Pre-Impact
        </div>
        <p className="text-text-muted text-[10px] mt-1 leading-relaxed">
          No significant displacement detected within the simulation range.
        </p>
      </div>
    );
  }

  // Preparation window only — displacement rising
  if (status === 'prep-only') {
    const yearsUntilCrisis = prepWindowClose !== null ? prepWindowClose - currentYear : null;
    return (
      <div className="border border-caution/25 bg-caution/[0.04] rounded-[12px] px-4 py-3">
        <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-caution/70 mb-1">
          Preparation Window
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl text-caution">
            {prepWindowOpen}&ndash;{prepWindowClose ?? '?'}
          </span>
          {yearsUntilCrisis !== null && yearsUntilCrisis > 0 && (
            <span className="font-mono text-[11px] text-caution/60">
              {yearsUntilCrisis}y to crisis
            </span>
          )}
        </div>
        <p className="text-text-muted text-[10px] mt-1 leading-relaxed">
          Displacement rising. Build response infrastructure now.
        </p>
      </div>
    );
  }

  // Fiscal window open (both-open or fiscal-only)
  if (status === 'both-open' || status === 'fiscal-only') {
    const aiGDPB = macro ? macro.aiGDPContribution / 1e9 : 0;
    const yearsUntilClose = fiscalWindowClose !== null ? fiscalWindowClose - currentYear : null;
    return (
      <div className="border border-growth/20 bg-growth/[0.04] rounded-[12px] px-4 py-3">
        <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-growth/70 mb-1">
          Fiscal Window Open
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl text-growth">
            {fiscalWindowOpen}&ndash;{fiscalWindowClose ?? '?'}
          </span>
          {yearsUntilClose !== null && yearsUntilClose > 0 && (
            <span className="font-mono text-[11px] text-growth/60">
              {yearsUntilClose}y remaining
            </span>
          )}
        </div>
        <p className="text-text-muted text-[10px] mt-1 leading-relaxed">
          AI generating {formatCurrency(aiGDPB * 1e9, { compact: true })}/yr revenue. Deploy programs at scale.
        </p>
      </div>
    );
  }

  // Post-window — windows closed
  if (status === 'post-window') {
    const gdpPeakValue = macro ? macro.gdpNominal : 0;
    const declinePct = yearData
      ? formatPercent(Math.abs(macro?.gdpGrowthRate ?? 0))
      : '?';
    return (
      <div className="border border-critical/30 bg-critical/[0.06] rounded-[12px] px-4 py-3">
        <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-critical/70 mb-1">
          Windows Closed
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl text-critical">
            {fiscalWindowClose}
          </span>
          <span className="font-mono text-[11px] text-critical/60">
            CLOSED
          </span>
        </div>
        <p className="text-critical/60 text-[10px] mt-1 leading-relaxed">
          Economy contracted. Deficit-funded response only.
        </p>
      </div>
    );
  }

  // Recovery
  const aiGDPPct = macro ? macro.aiGDPContributionPct : 0;
  return (
    <div className="border border-growth/20 bg-growth/[0.04] rounded-[12px] px-4 py-3">
      <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-growth/70 mb-1">
        Recovery
      </div>
      <div className="font-mono text-sm text-growth">
        CWI Rising
      </div>
      <p className="text-text-muted text-[10px] mt-1 leading-relaxed">
        AI share of GDP: {formatPercent(aiGDPPct)}. Continue monitoring policy effectiveness.
      </p>
    </div>
  );
}
