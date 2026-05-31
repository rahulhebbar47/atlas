/**
 * ATLAS Key Metrics Grid
 *
 * 2-column grid of MetricCards showing current-year snapshot.
 * All data from useCurrentYearData() — updates reactively as
 * the timeline or simulation parameters change.
 */

import { MetricCard } from '@/components/shared/MetricCard';
import { useCurrentYearData } from '@/hooks/useSimulation';
import { usePolicyActive } from '@/hooks/usePolicyData';
import { useSimulationStore } from '@/stores/simulationStore';
import { formatNumber, formatCurrency, formatPercent, formatDelta } from '@/utils/format';

export function KeyMetrics() {
  const yearData = useCurrentYearData();
  const currentYear = useSimulationStore((s) => s.currentYear);
  const timeline = useSimulationStore((s) => s.timeline);
  const policyActive = usePolicyActive();

  if (!yearData) {
    return (
      <div className="text-text-muted text-[11px] font-mono">
        No data for year {currentYear}
      </div>
    );
  }

  const { macro } = yearData;

  // Find previous year for delta calculations
  const prevYearData = timeline.years.find((y) => y.year === currentYear - 1);
  const prevMacro = prevYearData?.macro;

  // Employment delta
  const employmentDelta = prevMacro
    ? formatDelta(
        (macro.totalEmployment - prevMacro.totalEmployment) / prevMacro.totalEmployment,
        'percent',
      )
    : undefined;

  // GDP delta
  const gdpDelta = prevMacro
    ? formatDelta(macro.gdpGrowthRate, 'percent')
    : undefined;

  // Unemployment delta
  const unemploymentDelta = prevMacro
    ? formatDelta(macro.unemploymentRate - prevMacro.unemploymentRate, 'percent')
    : undefined;

  // CWI delta
  const cwiDelta = prevMacro
    ? formatDelta(macro.cwiGrowthRate, 'percent')
    : undefined;

  return (
    <div className="grid grid-cols-2 gap-2">
      <MetricCard
        label="Employment"
        value={formatNumber(macro.totalEmployment, { compact: true })}
        delta={employmentDelta?.text}
        deltaType={employmentDelta?.sign}
      />
      <MetricCard
        label="Unemployment"
        value={formatPercent(macro.unemploymentRate)}
        delta={unemploymentDelta?.text}
        deltaType={
          unemploymentDelta
            ? unemploymentDelta.sign === 'positive'
              ? 'negative'  // rising unemployment is bad
              : unemploymentDelta.sign === 'negative'
                ? 'positive'  // falling unemployment is good
                : 'neutral'
            : undefined
        }
      />
      <MetricCard
        label="GDP"
        value={formatCurrency(macro.gdpNominal, { compact: true })}
        delta={gdpDelta?.text}
        deltaType={gdpDelta?.sign}
      />
      <MetricCard
        label="CWI"
        value={formatCurrency(macro.consumerWelfareIndex, { compact: true })}
        delta={cwiDelta?.text}
        deltaType={cwiDelta?.sign}
      />
      <MetricCard
        label="Price Level"
        value={formatPercent(macro.netInflation)}
        deltaType={macro.netInflation < 0 ? 'negative' : 'neutral'}
      />
      <MetricCard
        label="AI Coverage"
        value={formatPercent(macro.automationCoverage)}
      />
      <MetricCard
        label="Net Jobs"
        value={(macro.netJobCreation >= 0 ? '+' : '') + formatNumber(macro.netJobCreation, { compact: true })}
        deltaType={macro.netJobCreation >= 0 ? 'positive' : 'negative'}
      />
      {policyActive && yearData.policyEffects.totalPolicyIncome > 0 && (
        <MetricCard
          label="Policy Income"
          value={formatCurrency(yearData.policyEffects.totalPolicyIncome, { compact: true })}
          delta={formatPercent(yearData.policyEffects.fiscalCostAsPercentGDP) + ' of GDP'}
          deltaType="neutral"
        />
      )}
    </div>
  );
}
