/**
 * ATLAS Economics Data Hooks (Phase 5)
 *
 * Hooks that extract economics-screen-specific time series from
 * the simulation store. Powers the 6 charts on the Economics screen:
 *   1. Decoupling (GDP vs Employment as indexed from baseline)
 *   2. Income Composition (wage/asset/transfer shares over time)
 *   3. Consumption Decomposition (wage/asset/transfer consumption $)
 *   4. AI Production (ai output, goods absorbed, unrealized)
 *   5. Deflation (ai deflation rate, net inflation, velocity multiplier)
 *   6. Credit (credit tightening, investment multiplier, consumption multiplier)
 *
 * Follows existing patterns: useShallow for objects, useMemo for derived arrays.
 */

import { useMemo } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';

// ============================================================
// 1. Decoupling — GDP vs Employment (indexed to 100)
// ============================================================

export interface DecouplingPoint {
  year: number;
  gdpIndex: number;        // real GDP indexed to 100 at baseline
  employmentIndex: number;  // total employment indexed to 100 at baseline
  aiGDPContributionPct: number;
}

export function useDecouplingData(): DecouplingPoint[] {
  const years = useSimulationStore((s) => s.timeline.years);
  return useMemo(() => {
    if (years.length === 0) return [];
    const baseGDP = years[0]!.macro.gdpReal;
    const baseEmp = years[0]!.macro.totalEmployment;
    return years.map((y) => ({
      year: y.year,
      gdpIndex: baseGDP > 0 ? (y.macro.gdpReal / baseGDP) * 100 : 100,
      employmentIndex: baseEmp > 0 ? (y.macro.totalEmployment / baseEmp) * 100 : 100,
      aiGDPContributionPct: y.macro.aiGDPContributionPct,
    }));
  }, [years]);
}

// ============================================================
// 2. Income Composition (reuses MacroTimeSeriesPoint shares)
// Already available via useMacroTimeSeries() — no new hook needed
// ============================================================

// ============================================================
// 3. Consumption Decomposition — absolute $ values
// ============================================================

export interface ConsumptionDecompositionPoint {
  year: number;
  wageConsumption: number;
  assetConsumption: number;
  transferConsumption: number;
  totalConsumption: number;
}

export function useConsumptionDecomposition(): ConsumptionDecompositionPoint[] {
  const years = useSimulationStore((s) => s.timeline.years);
  return useMemo(() =>
    years.map((y) => ({
      year: y.year,
      wageConsumption: y.macro.wageConsumption,
      assetConsumption: y.macro.assetConsumption,
      transferConsumption: y.macro.transferConsumption,
      totalConsumption: y.macro.wageConsumption + y.macro.assetConsumption + y.macro.transferConsumption,
    })),
    [years],
  );
}

// ============================================================
// 4. AI Production — output, absorption, unrealized
// ============================================================

export interface AIProductionPoint {
  year: number;
  aiAdditionalOutput: number;
  aiGoodsAbsorbed: number;
  unrealizedAIOutput: number;
  capacityUtilization: number;
  potentialGDP: number;
}

export function useAIProductionData(): AIProductionPoint[] {
  const years = useSimulationStore((s) => s.timeline.years);
  return useMemo(() =>
    years.map((y) => ({
      year: y.year,
      aiAdditionalOutput: y.macro.aiConsumerGoodsPotential ?? 0,
      aiGoodsAbsorbed: y.macro.aiGoodsAbsorbed,
      unrealizedAIOutput: y.macro.unrealizedAIOutput,
      capacityUtilization: y.macro.capacityUtilization,
      potentialGDP: y.macro.potentialGDP,
    })),
    [years],
  );
}

// ============================================================
// 5. Deflation — AI deflation, net inflation, velocity
// ============================================================

export interface DeflationPoint {
  year: number;
  aiDeflationRate: number;
  inflationRate: number;
  netInflation: number;
  velocityMultiplier: number;
  deflationDragPct: number;
}

export function useDeflationData(): DeflationPoint[] {
  const years = useSimulationStore((s) => s.timeline.years);
  return useMemo(() =>
    years.map((y) => ({
      year: y.year,
      aiDeflationRate: y.macro.aiDeflationRate,
      inflationRate: y.macro.inflationRate,
      netInflation: y.macro.netInflation,
      velocityMultiplier: y.macro.velocityMultiplier,
      deflationDragPct: y.macro.deflationDragPct,
    })),
    [years],
  );
}

// ============================================================
// 6. Credit — tightening, multipliers
// ============================================================

export interface CreditPoint {
  year: number;
  consumerCreditTightening: number;
  businessCreditMultiplier: number;
  consumerCreditMultiplier: number;
  fiscalDeficitGDP: number;
}

export function useCreditData(): CreditPoint[] {
  const years = useSimulationStore((s) => s.timeline.years);
  return useMemo(() =>
    years.map((y) => ({
      year: y.year,
      consumerCreditTightening: y.macro.consumerCreditTightening,
      businessCreditMultiplier: y.macro.businessCreditMultiplier,
      consumerCreditMultiplier: y.macro.consumerCreditMultiplier,
      fiscalDeficitGDP: y.macro.fiscalDeficitGDPRatio,
    })),
    [years],
  );
}

// ============================================================
// 7. Price Decomposition — shelter vs goods inflation components
// ============================================================

export interface PriceDecompositionPoint {
  year: number;
  baseInflation: number;
  aiDeflation: number;       // negative
  minWageCostPush: number;
  creditDeflation: number;   // negative
  scarcityInflation: number;
  shelterInflation: number;
  goodsInflation: number;
  compositeInflation: number;
}

export function usePriceDecompositionData(): PriceDecompositionPoint[] {
  const years = useSimulationStore((s) => s.timeline.years);
  return useMemo(() => years.map((y) => ({
    year: y.year,
    baseInflation: y.macro.inflationRate,
    aiDeflation: -y.macro.aiDeflationRate,
    minWageCostPush: y.macro.minWageCostPush,
    creditDeflation: y.macro.creditDeflationContribution,
    scarcityInflation: y.macro.scarcityInflation,
    shelterInflation: y.macro.shelterInflation,
    goodsInflation: y.macro.goodsInflation,
    compositeInflation: y.macro.compositeInflation,
  })), [years]);
}

// ============================================================
// 8. CWI — System vs Median, real 2025 dollars per capita
// ============================================================

import { BOTTOM80_TRANSFER_SHARE, BOTTOM80_POP_SHARE } from '@/models/constants';

export interface CWIDataPoint {
  year: number;
  systemDollars: number;            // real 2025 $ per capita (macro average)
  medianDollars: number;            // real 2025 $ per capita (bottom 80%)
  systemNoPolicyDollars: number;    // no-policy counterfactual
  medianNoPolicyDollars: number;    // no-policy counterfactual
}

export function useCWIData(): CWIDataPoint[] {
  const years = useSimulationStore((s) => s.timeline.years);
  const population = useSimulationStore((s) => s.config.totalPopulation);
  const b80TransferShare = useSimulationStore(
    (s) => s.config.bottom80TransferShare ?? BOTTOM80_TRANSFER_SHARE,
  );
  return useMemo(() => {
    if (years.length === 0) return [];
    const bottom80Pop = BOTTOM80_POP_SHARE * population;
    return years.map((y) => {
      const { macro, policyEffects } = y;
      // No-policy approximation: subtract policy income per capita (CWI is income-based)
      const policyRealPerCapita = macro.priceLevel > 0 && population > 0
        ? policyEffects.totalPolicyIncome / (macro.priceLevel * population)
        : 0;
      const systemNoPolicy = macro.consumerWelfareIndex - policyRealPerCapita;

      // For median: policy income reaches bottom 80% at transferShare rate
      const policyMedianPerCapita = macro.priceLevel > 0 && bottom80Pop > 0
        ? (policyEffects.totalPolicyIncome * b80TransferShare) / (macro.priceLevel * bottom80Pop)
        : 0;
      const medianNoPolicy = macro.medianCWI - policyMedianPerCapita;

      return {
        year: y.year,
        systemDollars: macro.consumerWelfareIndex,
        medianDollars: macro.medianCWI,
        systemNoPolicyDollars: systemNoPolicy,
        medianNoPolicyDollars: medianNoPolicy,
      };
    });
  }, [years, population, b80TransferShare]);
}

// ============================================================
// 9. Income Composition Absolute — $ stacked area
// ============================================================

export interface IncomeCompositionAbsolutePoint {
  year: number;
  wages: number;        // aggregateWageIncome
  transfers: number;    // aggregateTransferIncome
  assets: number;       // aggregateAssetIncome
  total: number;
  wagesPct: number;
  transfersPct: number;
  assetsPct: number;
}

export function useIncomeCompositionAbsolute(): IncomeCompositionAbsolutePoint[] {
  const years = useSimulationStore((s) => s.timeline.years);
  return useMemo(() =>
    years.map((y) => {
      const wages = y.macro.aggregateWageIncome;
      const assets = y.macro.aggregateAssetIncome;
      const transfers = y.macro.aggregateTransferIncome;
      const total = wages + assets + transfers;
      return {
        year: y.year,
        wages,
        transfers,
        assets,
        total,
        wagesPct: total > 0 ? wages / total : 0,
        transfersPct: total > 0 ? transfers / total : 0,
        assetsPct: total > 0 ? assets / total : 0,
      };
    }),
    [years],
  );
}

// ============================================================
// 10. GDP Composition — C, I, G, NX as $ and %
// ============================================================

export interface GDPCompositionPoint {
  year: number;
  consumption: number;
  investment: number;
  government: number;
  netExports: number;      // gdpNominal - C - I - G
  consumptionPct: number;
  investmentPct: number;
  governmentPct: number;
  netExportsPct: number;
}

export function useGDPComposition(): GDPCompositionPoint[] {
  const years = useSimulationStore((s) => s.timeline.years);
  return useMemo(() =>
    years.map((y) => {
      const c = y.macro.consumption;
      const i = y.macro.investment;
      const g = y.macro.governmentSpending;
      const gdp = y.macro.gdpNominal;
      const nx = gdp - c - i - g;
      return {
        year: y.year,
        consumption: c,
        investment: i,
        government: g,
        netExports: nx,
        consumptionPct: gdp > 0 ? c / gdp : 0,
        investmentPct: gdp > 0 ? i / gdp : 0,
        governmentPct: gdp > 0 ? g / gdp : 0,
        netExportsPct: gdp > 0 ? nx / gdp : 0,
      };
    }),
    [years],
  );
}

// ============================================================
// 11. Profit vs Wage Bill — dual line with crossing detection
// ============================================================

export interface ProfitWagePoint {
  year: number;
  wageBill: number;         // real 2025$ aggregateWageIncome
  corporateProfits: number; // real 2025$ corporateProfits
  ratio: number;            // profits / wageBill
}

export function useProfitWageData(): { data: ProfitWagePoint[]; crossingYear: number | null } {
  const years = useSimulationStore((s) => s.timeline.years);
  return useMemo(() => {
    let crossingYear: number | null = null;
    const data = years.map((y, idx) => {
      const pl = y.macro.priceLevel > 0 ? y.macro.priceLevel : 1;
      const wageBill = y.macro.aggregateWageIncome / pl;
      const profits = y.macro.corporateProfits / pl;
      // Detect crossing: profits exceed wages for the first time
      if (crossingYear === null && idx > 0 && profits > wageBill) {
        const prevPL = years[idx - 1]!.macro.priceLevel > 0 ? years[idx - 1]!.macro.priceLevel : 1;
        const prevWage = years[idx - 1]!.macro.aggregateWageIncome / prevPL;
        const prevProfit = years[idx - 1]!.macro.corporateProfits / prevPL;
        if (prevProfit <= prevWage) {
          crossingYear = y.year;
        }
      }
      return {
        year: y.year,
        wageBill,
        corporateProfits: profits,
        ratio: wageBill > 0 ? profits / wageBill : 0,
      };
    });
    return { data, crossingYear };
  }, [years]);
}

// ============================================================
// 11. Price Level Decomposition — goods vs shelter vs composite
// ============================================================

export interface PriceLevelDecompositionPoint {
  year: number;
  goodsPriceLevel: number;
  shelterPriceLevel: number;
  compositePriceLevel: number;
}

export function usePriceLevelDecomposition(): PriceLevelDecompositionPoint[] {
  const years = useSimulationStore((s) => s.timeline.years);
  return useMemo(() => {
    if (years.length === 0) return [];
    const result: PriceLevelDecompositionPoint[] = [];
    let goodsPL = 1.0;
    let shelterPL = 1.0;
    for (const y of years) {
      result.push({
        year: y.year,
        goodsPriceLevel: goodsPL,
        shelterPriceLevel: shelterPL,
        compositePriceLevel: y.macro.priceLevel,
      });
      goodsPL *= (1 + y.macro.goodsInflation);
      shelterPL *= (1 + y.macro.shelterInflation);
    }
    return result;
  }, [years]);
}
