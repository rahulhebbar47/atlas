/**
 * ATLAS Monetary Snapshot (Phase 7)
 *
 * View-dependent sidebar for the Monetary screen.
 * Shows fiscal, Federal Reserve, bond market, equity market metrics
 * from the FiscalMonetaryOutput of the current simulation year.
 *
 * Tier 1 (Fiscal, Fed) uses normal styling.
 * Tier 2 (Bond Market, Equity Market) uses muted styling.
 * Regime alerts (fiscal dominance, monetization) appear at the top.
 */

import { MetricCard } from '@/components/shared/MetricCard';
import { useCurrentYearData } from '@/hooks/useSimulation';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/format';
import type { FiscalMonetaryOutput } from '@/types/index';

/**
 * Format a value as $X.XT (trillions) for large dollar amounts.
 * Uses formatCurrency with compact notation.
 */
function formatTrillion(value: number): string {
  return formatCurrency(value, { compact: true });
}

/**
 * Format a decimal as percentage with 1 decimal place.
 * Multiplies by 100 internally (Intl.NumberFormat style: 'percent' does this).
 */
function fmtPct(value: number): string {
  return formatPercent(value);
}

/**
 * Format a number with 1 decimal place (no currency/percent).
 */
function fmtNum(value: number, decimals: number = 1): string {
  if (Math.abs(value) >= 1000) {
    return formatNumber(value, { compact: true, decimals });
  }
  return formatNumber(value, { decimals });
}

export function MonetarySnapshot() {
  const yearData = useCurrentYearData();

  if (!yearData) return null;

  const fm: FiscalMonetaryOutput | undefined = yearData.fiscalMonetary;

  // If fiscalMonetary data is not available, show N/A state
  if (!fm) {
    return (
      <div className="space-y-3">
        <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted">
          Fiscal & Monetary
        </h3>
        <div className="bg-bg-card border border-border rounded-[12px] px-4 py-3">
          <div className="font-mono text-[11px] text-text-muted">
            Fiscal-monetary data not available for this year.
          </div>
        </div>
      </div>
    );
  }

  const { fiscal, federalReserve, bondMarket, equityMarket, monetization } = fm;

  return (
    <div className="space-y-4">
      {/* ═══ Regime Alerts ═══ */}
      {(federalReserve.fiscalDominanceActive || monetization.monetizationRate > 0) && (
        <div className="space-y-2">
          {federalReserve.fiscalDominanceActive && (
            <div className="bg-amber-900/30 border border-amber-600/40 rounded-[12px] px-4 py-2">
              <div className="font-mono text-[11px] font-medium text-amber-400 uppercase tracking-[0.08em]">
                Fiscal Dominance Active
              </div>
            </div>
          )}
          {monetization.monetizationRate > 0 && (
            <div className="bg-amber-900/20 border border-amber-700/30 rounded-[12px] px-4 py-2">
              <div className="font-mono text-[11px] font-medium text-amber-500 uppercase tracking-[0.08em]">
                Monetization Active ({fmtPct(monetization.monetizationRate)})
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Section 1: Fiscal (Tier 1) ═══ */}
      <div className="space-y-3">
        <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted">
          Fiscal
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            label="Federal Debt"
            value={formatTrillion(fiscal.federalDebtStock)}
          />
          <MetricCard
            label="Debt / GDP"
            value={fmtPct(fiscal.debtGDPRatio)}
            deltaType={fiscal.debtGDPRatio > 1.5 ? 'negative' : fiscal.debtGDPRatio > 1.0 ? 'neutral' : 'positive'}
          />
          <MetricCard
            label="Interest Expense"
            value={formatTrillion(fiscal.interestExpense)}
          />
          <MetricCard
            label="Debt Svc / Rev"
            value={fmtPct(fiscal.debtServiceRevenueRatio)}
            deltaType={fiscal.debtServiceRevenueRatio > 0.25 ? 'negative' : 'neutral'}
          />
          <MetricCard
            label="Wtd Avg Rate"
            value={fmtPct(fiscal.weightedAverageDebtRate)}
          />
          <MetricCard
            label="Revenue / GDP"
            value={fmtPct(fiscal.revenueGDPRatio)}
          />
          <MetricCard
            label="Primary Deficit"
            value={formatTrillion(fiscal.primaryDeficit)}
            deltaType={fiscal.primaryDeficit > 0 ? 'negative' : 'positive'}
          />
          <MetricCard
            label="Total Deficit"
            value={formatTrillion(fiscal.totalDeficit)}
            deltaType={fiscal.totalDeficit > 0 ? 'negative' : 'positive'}
          />
        </div>
      </div>

      {/* ═══ Section 2: Federal Reserve (Tier 1) ═══ */}
      <div className="space-y-3">
        <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted">
          Federal Reserve
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            label="Taylor Prescribed"
            value={fmtPct(federalReserve.taylorPrescribedRate)}
          />
          <MetricCard
            label="Policy Rate"
            value={fmtPct(federalReserve.policyRate)}
          />
          <MetricCard
            label="Fiscal Dominance"
            value={federalReserve.fiscalDominanceActive ? 'Active' : 'Inactive'}
            deltaType={federalReserve.fiscalDominanceActive ? 'negative' : 'positive'}
          />
          <MetricCard
            label="Dominance Gap"
            value={fmtPct(federalReserve.fiscalDominanceGap)}
          />
          <MetricCard
            label="Output Gap"
            value={fmtPct(federalReserve.outputGap)}
            deltaType={federalReserve.outputGap < -0.05 ? 'negative' : 'neutral'}
          />
          <MetricCard
            label="Full Emp. GDP"
            value={formatTrillion(federalReserve.fullEmploymentGDP)}
          />
        </div>
      </div>

      {/* ═══ Section 3: Bond Market (Tier 2 — muted) ═══ */}
      <div className="space-y-3">
        <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
          Bond Market
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            label="10Y Yield"
            value={fmtPct(bondMarket.tenYearYield)}
            className="opacity-75"
          />
          <MetricCard
            label="Exp. Avg Rate"
            value={fmtPct(bondMarket.expectedAveragePolicyRate)}
            className="opacity-75"
          />
          <MetricCard
            label="Term Premium"
            value={fmtPct(bondMarket.termPremium)}
            className="opacity-75"
          />
          <MetricCard
            label="Fiscal Risk Prem."
            value={fmtPct(bondMarket.fiscalRiskPremium)}
            className="opacity-75"
          />
          <MetricCard
            label="Supply Pressure"
            value={fmtPct(bondMarket.supplyPressurePremium)}
            className="opacity-75"
          />
          <MetricCard
            label="Mortgage Rate"
            value={fmtPct(bondMarket.mortgageRate)}
            className="opacity-75"
          />
          <MetricCard
            label="Corp. Borrow Rate"
            value={fmtPct(bondMarket.corporateBorrowingRate)}
            className="opacity-75"
          />
        </div>
      </div>

      {/* ═══ Section 4: Equity Market (Tier 2 — muted) ═══ */}
      <div className="space-y-3">
        <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
          Equity Market
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            label="Market Cap"
            value={formatTrillion(equityMarket.aggregateMarketCap)}
            className="opacity-75"
          />
          <MetricCard
            label="P/E Ratio"
            value={fmtNum(equityMarket.peRatio)}
            className="opacity-75"
          />
          <MetricCard
            label="P/E Multiplier"
            value={fmtNum(equityMarket.effectivePEMultiplier)}
            className="opacity-75"
          />
          <MetricCard
            label="Growth Momentum"
            value={fmtPct(equityMarket.growthMomentum)}
            className="opacity-75"
          />
          <MetricCard
            label="Market Return"
            value={fmtPct(equityMarket.marketReturn)}
            deltaType={equityMarket.marketReturn > 0 ? 'positive' : equityMarket.marketReturn < -0.05 ? 'negative' : 'neutral'}
            className="opacity-75"
          />
        </div>
      </div>
    </div>
  );
}
