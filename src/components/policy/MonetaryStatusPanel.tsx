/**
 * ATLAS Monetary Status Panel (Phase 5)
 *
 * Card showing Fisher equation balance and net neutral zone status.
 * Displays: net neutral zone badge, max neutral transfers, current
 * transfer level vs max, inflation from transfers.
 */

import { Card } from '@/components/shared/Card';
import { usePolicyMetrics } from '@/hooks/usePolicyData';
import { useCurrentYearData } from '@/hooks/useSimulation';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/format';

export function MonetaryStatusPanel() {
  const metrics = usePolicyMetrics();
  const yearData = useCurrentYearData();

  if (!metrics || !yearData) {
    return (
      <Card title="Monetary Policy">
        <div className="text-text-muted text-[11px] font-mono">
          No monetary data available
        </div>
      </Card>
    );
  }

  const { monetary } = yearData;
  const transferRatio = monetary.maxNeutralTransfers > 0
    ? metrics.transferAddition / monetary.maxNeutralTransfers
    : 0;
  const clampedRatio = Math.min(transferRatio, 1);

  return (
    <Card title="Monetary Policy & Fisher Equation">
      <div className="space-y-4">
        {/* Net Neutral Zone Status */}
        <div className="flex items-center gap-3">
          <div
            className={`px-2 py-1 rounded font-mono text-[10px] font-medium uppercase tracking-wider ${
              monetary.isWithinNeutralZone
                ? 'bg-growth/10 text-growth border border-growth/20'
                : 'bg-critical/10 text-critical border border-critical/20'
            }`}
          >
            {monetary.isWithinNeutralZone ? 'Within Neutral' : 'Exceeds Neutral'}
          </div>
        </div>

        {/* Fisher Equation Visualization */}
        <div className="space-y-2">
          <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
            Fisher Equation: M × V = P × Y
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FisherSide
              label="M × V"
              value={monetary.moneySupply * monetary.velocityOfMoney}
              items={[
                { label: 'M (Supply)', value: formatCurrency(monetary.moneySupply, { compact: true }) },
                { label: 'V (Velocity)', value: monetary.velocityOfMoney >= 100 ? formatNumber(monetary.velocityOfMoney, { compact: true }) : monetary.velocityOfMoney.toFixed(2) },
              ]}
            />
            <FisherSide
              label="P × Y"
              value={monetary.priceLevel * monetary.realGDP}
              items={[
                { label: 'P (Price)', value: monetary.priceLevel >= 10 ? formatNumber(monetary.priceLevel, { compact: true }) : monetary.priceLevel.toFixed(3) },
                { label: 'Y (Real GDP)', value: formatCurrency(monetary.realGDP, { compact: true }) },
              ]}
            />
          </div>
        </div>

        {/* Transfer Capacity Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-text-muted">Transfer Utilization</span>
            <span className="font-mono text-[10px] text-text-secondary">
              {formatPercent(clampedRatio, 0)}
            </span>
          </div>
          <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                clampedRatio > 0.9 ? 'bg-critical' : clampedRatio > 0.7 ? 'bg-caution' : 'bg-growth'
              }`}
              style={{ width: `${clampedRatio * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] text-text-muted">
              Current: {formatCurrency(metrics.transferAddition, { compact: true })}
            </span>
            <span className="font-mono text-[9px] text-text-muted">
              Max neutral: {formatCurrency(monetary.maxNeutralTransfers, { compact: true })}
            </span>
          </div>
        </div>

        {/* Inflation Impact */}
        <div className="flex items-center justify-between border-t border-border/50 pt-2">
          <span className="font-mono text-[10px] text-text-muted">Inflation from Transfers</span>
          <span className={`font-mono text-[11px] font-medium ${
            monetary.actualInflationFromTransfers > 0.001 ? 'text-caution' :
            monetary.actualInflationFromTransfers < -0.001 ? 'text-growth' : 'text-text-secondary'
          }`}>
            {monetary.actualInflationFromTransfers >= 0 ? '+' : ''}
            {formatPercent(monetary.actualInflationFromTransfers)}
          </span>
        </div>
      </div>
    </Card>
  );
}

function FisherSide({ label, value, items }: {
  label: string;
  value: number;
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="border border-border/50 rounded-lg px-3 py-2">
      <div className="font-mono text-[11px] font-medium text-text-primary mb-1.5 truncate">
        {label} = {formatCurrency(value, { compact: true })}
      </div>
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between">
          <span className="font-mono text-[9px] text-text-muted">{item.label}</span>
          <span className="font-mono text-[9px] text-text-secondary truncate ml-1">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
