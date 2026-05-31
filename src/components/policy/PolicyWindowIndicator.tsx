/**
 * ATLAS Two-Window Policy Indicator (Phase 5 Cleanup)
 *
 * Visual badge with two sections: Prep Window (amber) and Fiscal Window (green).
 * Each shows open/close years and years remaining.
 */

import { usePolicyWindow } from '@/hooks/usePolicyData';

export function PolicyWindowIndicator() {
  const {
    prepWindowOpen, prepWindowClose,
    fiscalWindowOpen, fiscalWindowClose,
    prepYearsRemaining, fiscalYearsRemaining,
    status,
  } = usePolicyWindow();

  return (
    <div className="space-y-2">
      {/* Preparation Window */}
      <div className={`border rounded-[12px] px-4 py-3 ${
        prepWindowOpen !== null
          ? status === 'prep-only' || status === 'both-open'
            ? 'border-caution/25 bg-caution/[0.04]'
            : 'border-text-muted/20 bg-text-muted/[0.04]'
          : 'border-text-muted/20 bg-text-muted/[0.04]'
      }`}>
        <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted/70 mb-1">
          Preparation Window
        </div>
        {prepWindowOpen !== null ? (
          <>
            <div className="font-mono text-sm text-caution">
              {prepWindowOpen}&ndash;{prepWindowClose ?? '...'}
            </div>
            {prepYearsRemaining !== null && prepYearsRemaining > 0 && (
              <div className="font-mono text-[10px] text-text-muted mt-0.5">
                {prepYearsRemaining} {prepYearsRemaining === 1 ? 'year' : 'years'} remaining
              </div>
            )}
            {prepWindowClose !== null && prepYearsRemaining === null && (
              <div className="font-mono text-[10px] text-text-muted mt-0.5">
                Closed
              </div>
            )}
          </>
        ) : (
          <div className="font-mono text-sm text-text-muted">
            Not yet triggered
          </div>
        )}
      </div>

      {/* Fiscal Window */}
      <div className={`border rounded-[12px] px-4 py-3 ${
        fiscalWindowOpen !== null
          ? status === 'fiscal-only' || status === 'both-open'
            ? 'border-growth/20 bg-growth/[0.04]'
            : fiscalWindowClose !== null
              ? 'border-critical/30 bg-critical/[0.06]'
              : 'border-text-muted/20 bg-text-muted/[0.04]'
          : 'border-text-muted/20 bg-text-muted/[0.04]'
      }`}>
        <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted/70 mb-1">
          Fiscal Window
        </div>
        {fiscalWindowOpen !== null ? (
          <>
            <div className={`font-mono text-sm ${
              fiscalWindowClose !== null && fiscalYearsRemaining === null
                ? 'text-critical'
                : 'text-growth'
            }`}>
              {fiscalWindowOpen}&ndash;{fiscalWindowClose ?? '...'}
            </div>
            {fiscalYearsRemaining !== null && fiscalYearsRemaining > 0 && (
              <div className="font-mono text-[10px] text-text-muted mt-0.5">
                {fiscalYearsRemaining} {fiscalYearsRemaining === 1 ? 'year' : 'years'} remaining
              </div>
            )}
            {fiscalWindowClose !== null && fiscalYearsRemaining === null && (
              <div className="font-mono text-[10px] text-critical/60 mt-0.5">
                Closed
              </div>
            )}
          </>
        ) : (
          <div className="font-mono text-sm text-text-muted">
            Not yet triggered
          </div>
        )}
      </div>
    </div>
  );
}
