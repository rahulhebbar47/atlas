/**
 * ATLAS Monetary Dashboard View
 *
 * Container for 8 fiscal-monetary charts in a single-column layout.
 * Sections:
 *   1. Fiscal Health — debt dynamics, revenue composition
 *   2. Interest Rates — Taylor Rule, yield decomposition
 *   3. Money & Inflation — monetization, foreign demand
 *   4. Equity Markets — market cap, P/E ratios
 */

import { useMemo } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Card } from '@/components/shared/Card';
import {
  DebtGDPChart,
  DeficitCompositionChart,
  InterestRatesChart,
  YieldDecompositionChart,
  MonetizationInflationChart,
  EquityMarketChart,
  RevenueCompositionChart,
  ForeignDemandChart,
} from '@/components/charts/monetary';

/** Section header matching the mono/uppercase style used across ATLAS views. */
function SectionHeader({ label }: { label: string }) {
  return (
    <h2 className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-text-muted mt-2 first:mt-0">
      {label}
    </h2>
  );
}

export function MonetaryView() {
  const timeline = useSimulationStore((s) => s.timeline);
  const firstYear = timeline.years[0] as typeof timeline.years[number] | undefined;
  const hasFiscalMonetary = firstYear != null && firstYear.fiscalMonetary != null;

  // Map timeline data to chart-specific data shapes
  const chartData = useMemo(() => {
    if (!hasFiscalMonetary) return null;

    const years = timeline.years.filter((y) => y.fiscalMonetary != null);

    return {
      debtGDP: years.map((y) => ({
        year: y.year,
        debtGDPRatio: y.fiscalMonetary!.fiscal.debtGDPRatio,
      })),
      deficit: years.map((y) => ({
        year: y.year,
        primaryDeficit: y.fiscalMonetary!.fiscal.primaryDeficit,
        interestExpense: y.fiscalMonetary!.fiscal.interestExpense,
      })),
      interestRates: years.map((y) => ({
        year: y.year,
        taylorPrescribedRate: y.fiscalMonetary!.federalReserve.taylorPrescribedRate,
        policyRate: y.fiscalMonetary!.federalReserve.policyRate,
        tenYearYield: y.fiscalMonetary!.bondMarket.tenYearYield,
      })),
      yieldDecomp: years.map((y) => ({
        year: y.year,
        expectedAveragePolicyRate: y.fiscalMonetary!.bondMarket.expectedAveragePolicyRate,
        termPremium: y.fiscalMonetary!.bondMarket.termPremium,
        fiscalRiskPremium: y.fiscalMonetary!.bondMarket.fiscalRiskPremium,
        supplyPressurePremium: y.fiscalMonetary!.bondMarket.supplyPressurePremium,
      })),
      monetization: years.map((y) => ({
        year: y.year,
        monetizationRate: y.fiscalMonetary!.monetization.monetizationRate,
        inflationFromMonetization: y.fiscalMonetary!.monetization.inflationFromMonetization,
      })),
      equity: years.map((y) => ({
        year: y.year,
        aggregateMarketCap: y.fiscalMonetary!.equityMarket.aggregateMarketCap,
        peRatio: y.fiscalMonetary!.equityMarket.peRatio,
      })),
      revenue: years.map((y) => ({
        year: y.year,
        laborTaxRevenue: y.fiscalMonetary!.fiscal.laborTaxRevenue,
        corporateTaxRevenue: y.fiscalMonetary!.fiscal.corporateTaxRevenue,
        otherRevenue:
          y.fiscalMonetary!.fiscal.bookedRevenueT1 -
          y.fiscalMonetary!.fiscal.laborTaxRevenue -
          y.fiscalMonetary!.fiscal.corporateTaxRevenue,
      })),
      foreignDemand: years.map((y) => ({
        year: y.year,
        foreignDemandRatio: y.fiscalMonetary!.bondMarket.foreignDemandRatio,
      })),
    };
  }, [timeline, hasFiscalMonetary]);

  if (!hasFiscalMonetary || !chartData) {
    return (
      <Card title="Monetary Dashboard">
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="font-mono text-[13px] text-text-muted">
            Fiscal-monetary model data not available.
          </span>
          <span className="text-[11px] text-text-muted/60 max-w-[420px] text-center leading-relaxed">
            The fiscal-monetary layer computes after the core simulation loop.
            If you are seeing this, the simulation may still be initializing.
          </span>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Section 1: Fiscal Health ── */}
      <SectionHeader label="Fiscal Health" />
      <DebtGDPChart data={chartData.debtGDP} />
      <DeficitCompositionChart data={chartData.deficit} />
      <RevenueCompositionChart data={chartData.revenue} />

      {/* ── Section 2: Interest Rates ── */}
      <SectionHeader label="Interest Rates" />
      <InterestRatesChart data={chartData.interestRates} />
      <YieldDecompositionChart data={chartData.yieldDecomp} />

      {/* ── Section 3: Money & Inflation ── */}
      <SectionHeader label="Money & Inflation" />
      <MonetizationInflationChart data={chartData.monetization} />
      <ForeignDemandChart data={chartData.foreignDemand} />

      {/* ── Section 4: Equity Markets ── */}
      <SectionHeader label="Equity Markets" />
      <EquityMarketChart data={chartData.equity} />
    </div>
  );
}
