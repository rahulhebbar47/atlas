/**
 * Audit Run — Year-by-year simulation output with zero AI progress + no fiscal response.
 *
 * Capability ceilings set to floors (generative=0.10, agentic=0.05, embodied=0.02).
 * Fiscal policy: no_fiscal_response, Federal Reserve: balanced_mandate.
 *
 * Logs detailed macro values for years 2025-2032.
 */
import { describe, it } from 'vitest';
import { runSimulation, getDefaultSimulationConfig } from '@/models/simulation';
import { DEFAULT_CAPABILITY_TRAJECTORIES } from '@/models/constants';
import type { SimulationConfig } from '@/types';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';

function makeConfig(overrides: Partial<SimulationConfig> = {}): SimulationConfig {
  const base = getDefaultSimulationConfig();
  return { ...base, ...overrides };
}

describe('Audit Run: Zero AI + No Fiscal Response', () => {
  it('logs year-by-year macro values for 2025-2032', () => {
    // Set all capability ceilings to their floors (zero AI progress)
    const zeroCaps = {
      generative: {
        ...DEFAULT_CAPABILITY_TRAJECTORIES.generative,
        ceiling: 0.10, // same as floor
      },
      agentic: {
        ...DEFAULT_CAPABILITY_TRAJECTORIES.agentic,
        ceiling: 0.05, // same as floor
      },
      embodied: {
        ...DEFAULT_CAPABILITY_TRAJECTORIES.embodied,
        ceiling: 0.02, // same as floor
      },
    };

    const config = makeConfig({
      capabilities: zeroCaps,
      fiscalPolicyPreset: 'no_fiscal_response',
      federalReservePreset: 'balanced_mandate',
    });

    const timeline = runSimulation(config, OCCUPATION_CLUSTERS);

    // Print header
    console.log('\n' + '='.repeat(200));
    console.log('ATLAS AUDIT RUN: Zero AI (ceilings=floors) + No Fiscal Response + Balanced Mandate Fed');
    console.log('='.repeat(200));

    // First table: Employment and Demand
    console.log('\n--- TABLE 1: Employment & Demand ---');
    console.log(
      'Year'.padEnd(6) +
      'TotalRemainEmp'.padEnd(20) +
      'TotalAfterSpill'.padEnd(20) +
      'ConsumerDR'.padEnd(14) +
      'GovDR'.padEnd(14) +
      'BusinessDR'.padEnd(14) +
      'DemandSurvival'.padEnd(16) +
      'UE Rate'.padEnd(12) +
      'TotalDmdSpillLoss'.padEnd(20)
    );
    console.log('-'.repeat(136));

    for (const yearOutput of timeline.years) {
      if (yearOutput.year < 2025 || yearOutput.year > 2032) continue;
      const m = yearOutput.macro;

      // totalRemainingEmployment before spillover = totalAfterSpillover + totalDemandSpilloverLoss
      const totalPreSpillover = m.totalEmployment + m.totalDemandSpilloverLoss;
      // But note: macro.totalEmployment already includes new jobs and demand spillover.
      // The actual pre-spillover is clusters sum. Let's compute it from clusters.
      let clusterRemaining = 0;
      for (const c of yearOutput.clusters) {
        clusterRemaining += c.totalRemainingEmployment;
      }

      console.log(
        String(yearOutput.year).padEnd(6) +
        clusterRemaining.toFixed(0).padStart(16).padEnd(20) +
        (clusterRemaining - m.totalDemandSpilloverLoss).toFixed(0).padStart(16).padEnd(20) +
        m.consumerDemandRatio.toFixed(6).padStart(10).padEnd(14) +
        m.govDemandRatio.toFixed(6).padStart(10).padEnd(14) +
        m.businessDemandRatio.toFixed(6).padStart(10).padEnd(14) +
        m.aggregateDemandSurvival.toFixed(6).padStart(12).padEnd(16) +
        (m.unemploymentRate * 100).toFixed(4).padStart(8).padEnd(12) +
        m.totalDemandSpilloverLoss.toFixed(0).padStart(16).padEnd(20)
      );
    }

    // Second table: Wages, Income, GDP
    console.log('\n--- TABLE 2: Wages, Income & GDP ---');
    console.log(
      'Year'.padEnd(6) +
      'WagePressure'.padEnd(14) +
      'AggWageIncome'.padEnd(22) +
      'NominalGDP'.padEnd(22) +
      'RealGDP'.padEnd(22) +
      'Consumption'.padEnd(22) +
      'Investment'.padEnd(22) +
      'GovSpending'.padEnd(22)
    );
    console.log('-'.repeat(152));

    for (const yearOutput of timeline.years) {
      if (yearOutput.year < 2025 || yearOutput.year > 2032) continue;
      const m = yearOutput.macro;

      console.log(
        String(yearOutput.year).padEnd(6) +
        m.wagePressure.toFixed(6).padStart(10).padEnd(14) +
        m.aggregateWageIncome.toFixed(0).padStart(18).padEnd(22) +
        m.gdpNominal.toFixed(0).padStart(18).padEnd(22) +
        m.gdpReal.toFixed(0).padStart(18).padEnd(22) +
        m.consumption.toFixed(0).padStart(18).padEnd(22) +
        m.investment.toFixed(0).padStart(18).padEnd(22) +
        m.governmentSpending.toFixed(0).padStart(18).padEnd(22)
      );
    }

    // Third table: Credit, Housing, Inflation
    console.log('\n--- TABLE 3: Credit, Housing & Inflation ---');
    console.log(
      'Year'.padEnd(6) +
      'ConsCredTight'.padEnd(16) +
      'BusCredTight'.padEnd(16) +
      'HomePriceChg%'.padEnd(16) +
      'CompositeInfl%'.padEnd(16) +
      'GoodsInfl%'.padEnd(14) +
      'ShelterInfl%'.padEnd(14) +
      'PriceLevel'.padEnd(14) +
      'HomePriceIdx'.padEnd(14)
    );
    console.log('-'.repeat(126));

    for (const yearOutput of timeline.years) {
      if (yearOutput.year < 2025 || yearOutput.year > 2032) continue;
      const m = yearOutput.macro;

      console.log(
        String(yearOutput.year).padEnd(6) +
        m.consumerCreditTightening.toFixed(6).padStart(12).padEnd(16) +
        m.businessCreditTightening.toFixed(6).padStart(12).padEnd(16) +
        (m.homePriceChangeRate * 100).toFixed(4).padStart(12).padEnd(16) +
        (m.compositeInflation * 100).toFixed(4).padStart(12).padEnd(16) +
        (m.goodsInflation * 100).toFixed(4).padStart(10).padEnd(14) +
        (m.shelterInflation * 100).toFixed(4).padStart(10).padEnd(14) +
        m.priceLevel.toFixed(6).padStart(10).padEnd(14) +
        m.homePriceIndex.toFixed(6).padStart(10).padEnd(14)
      );
    }

    // Fourth table: Income Composition
    console.log('\n--- TABLE 4: Income Composition ---');
    console.log(
      'Year'.padEnd(6) +
      'TotalIncome'.padEnd(22) +
      'AggWageIncome'.padEnd(22) +
      'AggAssetIncome'.padEnd(22) +
      'AggTransferIncome'.padEnd(22) +
      'WageShare%'.padEnd(12) +
      'AssetShare%'.padEnd(12) +
      'TransferShare%'.padEnd(14)
    );
    console.log('-'.repeat(132));

    for (const yearOutput of timeline.years) {
      if (yearOutput.year < 2025 || yearOutput.year > 2032) continue;
      const m = yearOutput.macro;

      console.log(
        String(yearOutput.year).padEnd(6) +
        m.totalIncome.toFixed(0).padStart(18).padEnd(22) +
        m.aggregateWageIncome.toFixed(0).padStart(18).padEnd(22) +
        m.aggregateAssetIncome.toFixed(0).padStart(18).padEnd(22) +
        m.aggregateTransferIncome.toFixed(0).padStart(18).padEnd(22) +
        (m.incomeComposition.wageShare * 100).toFixed(2).padStart(8).padEnd(12) +
        (m.incomeComposition.assetShare * 100).toFixed(2).padStart(8).padEnd(12) +
        (m.incomeComposition.transferShare * 100).toFixed(2).padStart(10).padEnd(14)
      );
    }

    // Fifth table: CWI and Cycle Phase
    console.log('\n--- TABLE 5: Welfare & Cycle ---');
    console.log(
      'Year'.padEnd(6) +
      'CWI'.padEnd(14) +
      'CWI Growth%'.padEnd(14) +
      'MedianCWI'.padEnd(14) +
      'CyclePhase'.padEnd(24) +
      'DemandRatio'.padEnd(14) +
      'DemandPenalty'.padEnd(14) +
      'RevPressure'.padEnd(14) +
      'NomWageGrowth%'.padEnd(16)
    );
    console.log('-'.repeat(130));

    for (const yearOutput of timeline.years) {
      if (yearOutput.year < 2025 || yearOutput.year > 2032) continue;
      const m = yearOutput.macro;

      console.log(
        String(yearOutput.year).padEnd(6) +
        m.consumerWelfareIndex.toFixed(4).padStart(10).padEnd(14) +
        (m.cwiGrowthRate * 100).toFixed(4).padStart(10).padEnd(14) +
        m.medianCWI.toFixed(4).padStart(10).padEnd(14) +
        m.cyclePhase.padEnd(24) +
        m.demandRatio.toFixed(6).padStart(10).padEnd(14) +
        m.demandPenalty.toFixed(6).padStart(10).padEnd(14) +
        m.revenuePressure.toFixed(6).padStart(10).padEnd(14) +
        (m.nominalWageGrowth * 100).toFixed(4).padStart(12).padEnd(16)
      );
    }

    // Sixth table: Real demand ratios and fiscal-monetary
    console.log('\n--- TABLE 6: Real Demand Ratios & Fiscal-Monetary ---');
    console.log(
      'Year'.padEnd(6) +
      'RealConsDR'.padEnd(14) +
      'RealGovDR'.padEnd(14) +
      'RealBusDR'.padEnd(14) +
      'DebtGDP%'.padEnd(14) +
      'PolicyRate%'.padEnd(14) +
      '10YYield%'.padEnd(14) +
      'MortgRate%'.padEnd(14) +
      'MonetizRate%'.padEnd(14)
    );
    console.log('-'.repeat(118));

    for (const yearOutput of timeline.years) {
      if (yearOutput.year < 2025 || yearOutput.year > 2032) continue;
      const fm = yearOutput.fiscalMonetary;

      console.log(
        String(yearOutput.year).padEnd(6) +
        yearOutput.realConsumerDemandRatio.toFixed(6).padStart(10).padEnd(14) +
        yearOutput.realGovDemandRatio.toFixed(6).padStart(10).padEnd(14) +
        yearOutput.realBusinessDemandRatio.toFixed(6).padStart(10).padEnd(14) +
        ((fm?.fiscal.debtGDPRatio ?? 0) * 100).toFixed(2).padStart(10).padEnd(14) +
        ((fm?.federalReserve.policyRate ?? 0) * 100).toFixed(3).padStart(10).padEnd(14) +
        ((fm?.bondMarket.tenYearYield ?? 0) * 100).toFixed(3).padStart(10).padEnd(14) +
        ((fm?.bondMarket.mortgageRate ?? 0) * 100).toFixed(3).padStart(10).padEnd(14) +
        ((fm?.monetization.monetizationRate ?? 0) * 100).toFixed(3).padStart(10).padEnd(14)
      );
    }

    // Seventh table: Capabilities (should be flat at floor)
    console.log('\n--- TABLE 7: Capability Scores (should be flat at floor) ---');
    console.log(
      'Year'.padEnd(6) +
      'Generative'.padEnd(14) +
      'Agentic'.padEnd(14) +
      'Embodied'.padEnd(14)
    );
    console.log('-'.repeat(48));

    for (const yearOutput of timeline.years) {
      if (yearOutput.year < 2025 || yearOutput.year > 2032) continue;

      console.log(
        String(yearOutput.year).padEnd(6) +
        yearOutput.capabilities.generative.toFixed(6).padStart(10).padEnd(14) +
        yearOutput.capabilities.agentic.toFixed(6).padStart(10).padEnd(14) +
        yearOutput.capabilities.embodied.toFixed(6).padStart(10).padEnd(14)
      );
    }

    console.log('\n' + '='.repeat(200));
    console.log('END AUDIT RUN');
    console.log('='.repeat(200) + '\n');
  });
});
