/**
 * DEPRECATED: Replaced by PolicySnapshot.tsx in Phase 5 sidebar redesign.
 * This file is no longer imported — use PolicySnapshot instead.
 *
 * Original: Policy Metrics Summary — vertical MetricCards in PolicyDashboard.
 */

import { MetricCard } from '@/components/shared/MetricCard';
import { usePolicyMetrics, usePolicyWindow } from '@/hooks/usePolicyData';
import { usePolicyConfig } from '@/hooks/usePolicyData';
import { formatCurrency, formatPercent } from '@/utils/format';

export function PolicyMetricsSummary() {
  const metrics = usePolicyMetrics();
  const window = usePolicyWindow();
  const config = usePolicyConfig();

  if (!metrics) {
    return (
      <div className="text-text-muted text-[11px] font-mono">
        No policy data available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <MetricCard
        label="Fiscal Cost"
        value={formatCurrency(metrics.fiscalCost, { compact: true }) + '/yr'}
        delta={formatPercent(metrics.fiscalCostGDP) + ' of GDP'}
        deltaType={metrics.fiscalCostGDP > 0.05 ? 'negative' : 'neutral'}
      />

      {/* Net Neutral Zone */}
      <div
        className={`border rounded-[12px] px-4 py-3 ${
          metrics.isWithinNeutralZone
            ? 'border-growth/20 bg-growth/[0.04]'
            : 'border-critical/30 bg-critical/[0.06]'
        }`}
      >
        <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted mb-1">
          Net Neutral Zone
        </div>
        <div className={`font-mono text-sm ${metrics.isWithinNeutralZone ? 'text-growth' : 'text-critical'}`}>
          {metrics.isWithinNeutralZone ? 'Within' : 'Exceeds'}
        </div>
        <div className="font-mono text-[10px] text-text-muted mt-0.5">
          Max: {formatCurrency(metrics.maxNeutralTransfers, { compact: true })}/cap
        </div>
      </div>

      <MetricCard
        label="Required AI Ownership"
        value={formatPercent(metrics.requiredOwnership)}
        delta="of AI economy to maintain baseline"
        deltaType="neutral"
      />

      <MetricCard
        label="Required Transfer Level"
        value={`${formatCurrency(metrics.requiredTransfer / 12, { compact: true })}/mo`}
        delta="per unemployed person"
        deltaType="neutral"
      />

      {/* Policy Window — deprecated, uses new status values */}
      <div
        className={`border rounded-[12px] px-4 py-3 ${
          window.status === 'pre-impact'
            ? 'border-text-muted/20 bg-text-muted/[0.04]'
            : window.status === 'both-open' || window.status === 'fiscal-only'
              ? 'border-growth/20 bg-growth/[0.04]'
              : window.status === 'post-window'
                ? 'border-critical/30 bg-critical/[0.06]'
                : 'border-caution/25 bg-caution/[0.04]'
        }`}
      >
        <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted mb-1">
          Policy Window
        </div>
        <div className={`font-mono text-sm ${
          window.status === 'both-open' || window.status === 'fiscal-only' ? 'text-growth' :
          window.status === 'post-window' ? 'text-critical' :
          window.status === 'recovery' ? 'text-caution' : 'text-text-muted'
        }`}>
          {window.status}
        </div>
        {window.fiscalYearsRemaining !== null && window.fiscalYearsRemaining > 0 && (
          <div className="font-mono text-[10px] text-text-muted mt-0.5">
            {window.fiscalYearsRemaining} {window.fiscalYearsRemaining === 1 ? 'year' : 'years'} remaining
          </div>
        )}
      </div>

      {/* SWF Balance — only when fund is enabled */}
      {config.sovereignWealthFund.enabled && (
        <MetricCard
          label="SWF Balance"
          value={formatCurrency(metrics.fundSize * 1_000_000_000, { compact: true })}
          deltaType="neutral"
        />
      )}

      <MetricCard
        label="Policy Income"
        value={formatCurrency(metrics.totalPolicyIncome, { compact: true }) + '/yr'}
        deltaType="neutral"
      />
    </div>
  );
}
