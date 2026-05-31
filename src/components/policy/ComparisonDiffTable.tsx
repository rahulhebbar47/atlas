/**
 * ATLAS Comparison Diff Table (Phase 5)
 *
 * Table comparing key metrics across policy configurations.
 * Rows: Tipping Point Year, Max Unemployment Rate, Min ARPP/Capita,
 *        Peak Fiscal Cost, Depression Onset, Policy Prevents Depression
 * Cells color-coded: green for improvements, red for degradations.
 */

import { Card } from '@/components/shared/Card';
import { useComparisonMetrics } from '@/hooks/useCompareMode';
import { formatPercent, formatCurrency } from '@/utils/format';

const SLOT_COLORS = ['#D4A03C', '#3B82F6', '#10B981'];

export function ComparisonDiffTable() {
  const metrics = useComparisonMetrics();

  if (metrics.length === 0) return null;

  const base = metrics[0]; // Current config is always slot 0

  return (
    <Card title="Scenario Comparison">
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] font-mono">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-text-muted font-medium uppercase tracking-wider py-2 pr-4">
                Metric
              </th>
              {metrics.map((m, idx) => (
                <th
                  key={idx}
                  className="text-right text-text-muted font-medium uppercase tracking-wider py-2 px-2"
                  style={{ color: SLOT_COLORS[idx] ?? '#6B7280' }}
                >
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <DiffRow
              label="Cycle Start"
              values={metrics.map((m) => m.cycleStartYear !== null ? String(m.cycleStartYear) : 'None')}
              betterFn={(val, baseVal) => {
                if (val === 'None') return 'positive';
                if (baseVal === 'None') return 'negative';
                return Number(val) > Number(baseVal) ? 'positive' : Number(val) < Number(baseVal) ? 'negative' : 'neutral';
              }}
              baseIdx={0}
            />
            <DiffRow
              label="Max Unemployment"
              values={metrics.map((m) => formatPercent(m.maxUnemploymentRate))}
              betterFn={(val, baseVal) => {
                const v = parseFloat(val);
                const b = parseFloat(baseVal);
                return v < b ? 'positive' : v > b ? 'negative' : 'neutral';
              }}
              baseIdx={0}
            />
            <DiffRow
              label="Min CWI"
              values={metrics.map((m) => formatCurrency(m.minCWI, { compact: true }))}
              betterFn={(_val, _baseVal, idx) => {
                if (idx === 0) return 'neutral';
                return metrics[idx]!.minCWI > base!.minCWI ? 'positive'
                  : metrics[idx]!.minCWI < base!.minCWI ? 'negative' : 'neutral';
              }}
              baseIdx={0}
            />
            <DiffRow
              label="Peak Fiscal Cost"
              values={metrics.map((m) => formatPercent(m.peakFiscalCostGDP))}
              betterFn={(val, baseVal) => {
                const v = parseFloat(val);
                const b = parseFloat(baseVal);
                return v < b ? 'positive' : v > b ? 'negative' : 'neutral';
              }}
              baseIdx={0}
            />
            <DiffRow
              label="Depression Onset"
              values={metrics.map((m) => m.depressionOnsetYear !== null ? String(m.depressionOnsetYear) : 'None')}
              betterFn={(val, baseVal) => {
                if (val === 'None') return 'positive';
                if (baseVal === 'None') return 'negative';
                return Number(val) > Number(baseVal) ? 'positive' : Number(val) < Number(baseVal) ? 'negative' : 'neutral';
              }}
              baseIdx={0}
            />
            <DiffRow
              label="Prevents Depression"
              values={metrics.map((m) => m.policyPreventsDepression ? 'Yes' : 'No')}
              betterFn={(val) => val === 'Yes' ? 'positive' : 'negative'}
              baseIdx={0}
            />
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function DiffRow({
  label,
  values,
  betterFn,
  baseIdx,
}: {
  label: string;
  values: string[];
  betterFn: (val: string, baseVal: string, idx: number) => 'positive' | 'negative' | 'neutral';
  baseIdx: number;
}) {
  const baseVal = values[baseIdx] ?? '';

  return (
    <tr className="border-b border-border/30">
      <td className="text-text-secondary py-2 pr-4 whitespace-nowrap">
        {label}
      </td>
      {values.map((val, idx) => {
        const quality = idx === baseIdx ? 'neutral' : betterFn(val, baseVal, idx);
        return (
          <td
            key={idx}
            className={`text-right py-2 px-2 whitespace-nowrap ${
              quality === 'positive' ? 'text-growth' :
              quality === 'negative' ? 'text-critical' :
              'text-text-primary'
            }`}
          >
            {val}
          </td>
        );
      })}
    </tr>
  );
}
