/**
 * ATLAS Policy Snapshot (Phase 5)
 *
 * View-dependent sidebar for the Policy screen.
 * Shows: Fiscal Cost, Net Neutral status, Deficit, GDP/CWI impact,
 * UBI per capita, AI Ownership required, Unemployment reduction.
 */

import { MetricCard } from '@/components/shared/MetricCard';
import { useCurrentYearData } from '@/hooks/useSimulation';
import { usePolicyMetrics, usePolicyWindow } from '@/hooks/usePolicyData';
import { useSimulationStore } from '@/stores/simulationStore';
import { formatCurrency, formatPercent } from '@/utils/format';

export function PolicySnapshot() {
  const yearData = useCurrentYearData();
  const metrics = usePolicyMetrics();
  const policyWindow = usePolicyWindow();
  const population = useSimulationStore((s) => s.config.totalPopulation);

  if (!yearData || !metrics) return null;

  const { macro, monetary, policyEffects } = yearData;

  // UBI per capita (if transfers are active)
  const ubiPerCapita = population > 0 ? policyEffects.transferChannelAddition / population : 0;

  // Policy CWI impact: approximate
  const policyCWIImpact = macro.priceLevel > 0 && population > 0
    ? (policyEffects.totalPolicyIncome * 0.90) / (macro.priceLevel * population)
    : 0;

  // Policy GDP impact
  const policyGDPImpact = policyEffects.totalPolicyIncome * 0.90;

  return (
    <div className="space-y-3">
      <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted">
        Policy Impact
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="Fiscal Cost"
          value={formatCurrency(metrics.fiscalCost, { compact: true })}
          delta={formatPercent(metrics.fiscalCostGDP) + ' of GDP'}
          deltaType="neutral"
        />
        <MetricCard
          label="Net Neutral"
          value={monetary.isWithinNeutralZone ? 'Yes' : 'No'}
          deltaType={monetary.isWithinNeutralZone ? 'positive' : 'negative'}
        />
        <MetricCard
          label="Deficit / GDP"
          value={formatPercent(macro.fiscalDeficitGDPRatio)}
          deltaType={macro.fiscalDeficitGDPRatio > 0.05 ? 'negative' : 'neutral'}
        />
        <MetricCard
          label="Policy GDP +"
          value={formatCurrency(policyGDPImpact, { compact: true })}
          deltaType={policyGDPImpact > 0 ? 'positive' : 'neutral'}
        />
        <MetricCard
          label="Policy CWI +"
          value={formatCurrency(policyCWIImpact, { compact: true })}
          deltaType={policyCWIImpact > 0 ? 'positive' : 'neutral'}
        />
        <MetricCard
          label="UBI / Capita"
          value={formatCurrency(ubiPerCapita, { compact: true })}
        />
        <MetricCard
          label="AI Ownership Req."
          value={formatPercent(policyEffects.requiredAssetOwnership)}
        />
        <MetricCard
          label="Window Status"
          value={policyWindow.status.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          deltaType={policyWindow.status === 'both-open' || policyWindow.status === 'fiscal-only' ? 'positive' : policyWindow.status === 'post-window' ? 'negative' : 'neutral'}
        />
      </div>
    </div>
  );
}
