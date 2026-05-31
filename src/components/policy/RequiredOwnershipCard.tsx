/**
 * ATLAS Required Ownership Card (Phase 5)
 *
 * MetricCard showing the required AI economy ownership percentage
 * to maintain baseline living standards.
 */

import { MetricCard } from '@/components/shared/MetricCard';
import { usePolicyMetrics } from '@/hooks/usePolicyData';
import { formatPercent } from '@/utils/format';

export function RequiredOwnershipCard() {
  const metrics = usePolicyMetrics();

  if (!metrics) return null;

  return (
    <MetricCard
      label="Required AI Ownership"
      value={formatPercent(metrics.requiredOwnership)}
      delta="of AI economy to maintain baseline"
      deltaType={metrics.requiredOwnership > 0.5 ? 'negative' : 'neutral'}
    />
  );
}
