/**
 * ATLAS Overview Snapshot (Phase 5)
 *
 * View-dependent sidebar for the Overview screen.
 * Shows: CWI, GDP growth, Unemployment, AI GDP %, Policy Window status, Employment.
 */

import { MetricCard } from '@/components/shared/MetricCard';
import { useCurrentYearData } from '@/hooks/useSimulation';
import { usePolicyWindow } from '@/hooks/usePolicyData';
import { formatNumber, formatCurrency, formatPercent, formatDelta } from '@/utils/format';
import { useSimulationStore } from '@/stores/simulationStore';

const STATUS_LABELS: Record<string, string> = {
  'pre-impact': 'Pre-Impact',
  'prep-only': 'Preparation',
  'both-open': 'Both Open',
  'fiscal-only': 'Fiscal Open',
  'post-window': 'Closed',
  'recovery': 'Recovery',
};

const STATUS_COLORS: Record<string, string> = {
  'pre-impact': 'text-text-muted',
  'prep-only': 'text-caution',
  'both-open': 'text-growth',
  'fiscal-only': 'text-growth',
  'post-window': 'text-critical',
  'recovery': 'text-caution',
};

export function OverviewSnapshot() {
  const yearData = useCurrentYearData();
  const currentYear = useSimulationStore((s) => s.currentYear);
  const timeline = useSimulationStore((s) => s.timeline);
  const policyWindow = usePolicyWindow();

  if (!yearData) return null;

  const { macro } = yearData;
  const prevYearData = timeline.years.find((y) => y.year === currentYear - 1);
  const prevMacro = prevYearData?.macro;

  const gdpDelta = prevMacro ? formatDelta(macro.gdpGrowthRate, 'percent') : undefined;
  const cwiDelta = prevMacro ? formatDelta(macro.cwiGrowthRate, 'percent') : undefined;

  return (
    <div className="space-y-3">
      <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted">
        Overview
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="CWI"
          value={formatCurrency(macro.consumerWelfareIndex, { compact: true })}
          delta={cwiDelta?.text}
          deltaType={cwiDelta?.sign}
        />
        <MetricCard
          label="GDP Growth"
          value={formatPercent(macro.gdpGrowthRate)}
          delta={gdpDelta?.text}
          deltaType={gdpDelta?.sign}
        />
        <MetricCard
          label="Unemployment"
          value={formatPercent(macro.unemploymentRate)}
          deltaType={macro.unemploymentRate > 0.08 ? 'negative' : 'neutral'}
        />
        <MetricCard
          label="AI GDP %"
          value={formatPercent(macro.aiGDPContributionPct)}
        />
        <MetricCard
          label="Employment"
          value={formatNumber(macro.totalEmployment, { compact: true })}
        />
        <MetricCard
          label="Cycle Phase"
          value={macro.cyclePhase.replace(/_/g, ' ')}
          deltaType={macro.cyclePhase === 'STABLE' ? 'positive' : macro.cyclePhase === 'RECOVERY' ? 'positive' : 'negative'}
        />
      </div>

      {/* Two-Window Status */}
      <div className="bg-bg-card border border-border rounded-[12px] px-4 py-3 space-y-2">
        <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted mb-1">
          Policy Windows
        </div>
        <div className={`font-mono text-lg leading-tight ${STATUS_COLORS[policyWindow.status]}`}>
          {STATUS_LABELS[policyWindow.status]}
        </div>
        {policyWindow.prepYearsRemaining !== null && policyWindow.prepYearsRemaining > 0 && (
          <div className="font-mono text-[11px] text-caution">
            Prep: {policyWindow.prepYearsRemaining}y remaining
          </div>
        )}
        {policyWindow.fiscalYearsRemaining !== null && policyWindow.fiscalYearsRemaining > 0 && (
          <div className="font-mono text-[11px] text-growth">
            Fiscal: {policyWindow.fiscalYearsRemaining}y remaining
          </div>
        )}
      </div>
    </div>
  );
}
