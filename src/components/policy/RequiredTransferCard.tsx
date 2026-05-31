/**
 * ATLAS Required Transfer Card (Phase 5)
 *
 * MetricCard showing the required monthly transfer level per
 * unemployed person to maintain baseline ARPP.
 */

import { MetricCard } from '@/components/shared/MetricCard';
import { usePolicyMetrics } from '@/hooks/usePolicyData';
import { formatCurrency } from '@/utils/format';

export function RequiredTransferCard() {
  const metrics = usePolicyMetrics();

  if (!metrics) return null;

  // Convert annual per-person to monthly
  const monthlyTransfer = metrics.requiredTransfer / 12;

  return (
    <MetricCard
      label="Required Transfer Level"
      value={`${formatCurrency(monthlyTransfer, { compact: true })}/mo`}
      delta="per unemployed person for baseline ARPP"
      deltaType="neutral"
    />
  );
}
