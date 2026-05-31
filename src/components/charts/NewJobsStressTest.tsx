/**
 * ATLAS New Jobs Stress Test Card
 *
 * Answers DATA_MODEL.md Section 6.2:
 * "How large would J_new need to be to offset displacement?"
 *
 * Shows the required innovation rate multiplier vs. current,
 * and the year when it becomes mathematically impossible.
 */

import { useMemo } from 'react';
import { useCurrentYearData } from '@/hooks/useSimulation';
import { useSimulationStore } from '@/stores/simulationStore';
import { useMacroTimeSeries } from '@/hooks/useSimulation';
import { computeRequiredInnovationRate, findNetJobCrossoverYear } from '@/models/newJobs';
import { DEFAULT_INNOVATION_RATE } from '@/models/constants';
import { formatNumber, formatYear } from '@/utils/format';

export function NewJobsStressTest() {
  const yearData = useCurrentYearData();
  const rawData = useMacroTimeSeries();
  const innovationRate = useSimulationStore((s) => s.config.innovationRate);

  const crossoverYear = useMemo(
    () =>
      findNetJobCrossoverYear(
        rawData.map((d) => ({ year: d.year, netJobCreation: d.netJobCreation })),
      ),
    [rawData],
  );

  if (!yearData) return null;

  const { macro } = yearData;
  const totalDisplaced = yearData.clusters.reduce(
    (sum, c) => sum + c.totalDirectDisplacement,
    0,
  );

  const requiredRate = computeRequiredInnovationRate(
    totalDisplaced,
    macro.gdpReal,
    macro.automationCoverage,
    useSimulationStore.getState().config.rdMultiplier,
    useSimulationStore.getState().config.jobPersistenceFactor,
  );

  const currentMultiplier = innovationRate / DEFAULT_INNOVATION_RATE;
  const requiredMultiplier = requiredRate / DEFAULT_INNOVATION_RATE;
  const gapMultiplier = requiredRate > 0 && isFinite(requiredRate)
    ? requiredRate / innovationRate
    : Infinity;

  const isImpossible = !isFinite(requiredRate) || requiredMultiplier > 1000;

  return (
    <div className="bg-bg-card border border-border rounded-[12px] px-4 py-3 space-y-3">
      <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted">
        New Jobs Stress Test
      </div>

      {/* Current vs Required Innovation Rate */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-[11px]">Current Rate</span>
          <span className="font-mono text-[12px] text-text-primary">
            {currentMultiplier.toFixed(1)}x
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-[11px]">Required Rate</span>
          <span className={`font-mono text-[12px] ${isImpossible ? 'text-critical' : 'text-warning'}`}>
            {isImpossible ? '\u221E' : requiredMultiplier.toFixed(1) + 'x'}
          </span>
        </div>
      </div>

      {/* Gap indicator */}
      <div className={`text-[11px] font-mono leading-relaxed ${isImpossible ? 'text-critical' : 'text-warning'}`}>
        {isImpossible ? (
          <>At {Math.round(macro.automationCoverage * 100)}% AI coverage, no innovation rate can produce enough durable jobs to offset displacement.</>
        ) : gapMultiplier > 1 ? (
          <>Innovation rate would need to be <span className="text-text-primary font-semibold">{gapMultiplier >= 100 ? formatNumber(gapMultiplier, { compact: true }) : gapMultiplier.toFixed(1)}x higher</span> to maintain net positive jobs.</>
        ) : (
          <span className="text-growth">Current innovation rate is sufficient.</span>
        )}
      </div>

      {/* Crossover year */}
      {crossoverYear !== null && (
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <span className="text-text-secondary text-[11px]">Net Job Loss Begins</span>
          <span className="font-mono text-[12px] text-critical font-semibold">
            {formatYear(crossoverYear)}
          </span>
        </div>
      )}

      {/* Current year displaced */}
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-[10px]">Displaced This Year</span>
        <span className="font-mono text-[11px] text-text-secondary">
          {formatNumber(totalDisplaced, { compact: true })}
        </span>
      </div>
    </div>
  );
}
