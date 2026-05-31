/**
 * ATLAS Income Composition Chart
 *
 * Horizontal stacked bar showing the current year's income composition:
 * Wages / Assets / Transfers split.
 * SVG-based for precise control in the 320px insights panel.
 */

import { useCurrentYearData } from '@/hooks/useSimulation';
import { formatPercent } from '@/utils/format';

const CHANNELS = [
  { key: 'wageShare' as const, label: 'Wages', color: '#3B82F6' },
  { key: 'assetShare' as const, label: 'Assets', color: '#10B981' },
  { key: 'transferShare' as const, label: 'Transfers', color: '#F59E0B' },
];

export function IncomeCompositionChart() {
  const yearData = useCurrentYearData();

  if (!yearData) {
    return (
      <div className="bg-bg-card border border-border rounded-[12px] px-4 py-3">
        <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted">
          Income Composition
        </div>
        <p className="text-text-muted text-[11px] mt-2">No data for selected year</p>
      </div>
    );
  }

  const { incomeComposition } = yearData.macro;
  const shares = {
    wageShare: incomeComposition.wageShare,
    assetShare: incomeComposition.assetShare,
    transferShare: incomeComposition.transferShare,
  };

  return (
    <div className="bg-bg-card border border-border rounded-[12px] px-4 py-3">
      <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted mb-3">
        Income Composition
      </div>

      {/* Stacked horizontal bar */}
      <div className="flex h-[10px] rounded-full overflow-hidden bg-bg-elevated">
        {CHANNELS.map((channel) => {
          const share = shares[channel.key];
          if (share <= 0) return null;
          return (
            <div
              key={channel.key}
              className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${share * 100}%`,
                background: channel.color,
              }}
            />
          );
        })}
      </div>

      {/* Legend with values */}
      <div className="flex flex-col gap-1.5 mt-3">
        {CHANNELS.map((channel) => {
          const share = shares[channel.key];
          return (
            <div key={channel.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: channel.color }}
                />
                <span className="text-text-secondary text-[11px]">
                  {channel.label}
                </span>
              </div>
              <span className="font-mono text-[11px] text-text-accent">
                {formatPercent(share, 1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
