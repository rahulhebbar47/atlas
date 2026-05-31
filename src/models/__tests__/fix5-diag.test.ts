import { describe, it } from 'vitest';
import { runSimulation, getDefaultSimulationConfig } from '../simulation';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import {
  BASELINE_WAGE_SHARE,
  DEFAULT_POPULATION_GROWTH_RATE,
  BASELINE_GDP_GROWTH_RATE,
  BASELINE_GDP_NOMINAL_2025,
} from '../constants';
import { FISCAL_POLICY_PRESETS, FEDERAL_RESERVE_PRESETS } from '../fiscalResponseProfiles';
import type { SimulationConfig } from '@/types';

// ─── Shared helpers ───

function computeMetrics(tl: ReturnType<typeof runSimulation>) {
  let sumRealGrowth = 0;
  let countRealGrowth = 0;
  let maxUE = 0;
  let maxCredT = 0;
  let minIncAdq = 1.0;
  let maxInflation = 0;
  let collapseYear = 'none';

  for (let i = 0; i < tl.years.length; i++) {
    const yr = tl.years[i]!;
    const m = yr.macro;

    if (i > 0) {
      const prevGDP = tl.years[i - 1]!.macro.gdpNominal;
      const nomGrowth = (m.gdpNominal / prevGDP - 1) * 100;
      const realGrowth = nomGrowth - m.compositeInflation * 100;
      sumRealGrowth += realGrowth;
      countRealGrowth++;
    }

    maxUE = Math.max(maxUE, m.unemploymentRate);
    maxCredT = Math.max(maxCredT, m.consumerCreditTightening);
    minIncAdq = Math.min(minIncAdq, m.incomeAdequacyRatio);
    maxInflation = Math.max(maxInflation, m.compositeInflation);

    if (i > 0 && collapseYear === 'none') {
      const prevGDP = tl.years[i - 1]!.macro.gdpNominal;
      const gdpChange = (m.gdpNominal / prevGDP - 1) * 100;
      if (gdpChange < -5) {
        collapseYear = `${yr.year}`;
      }
    }
  }

  const lastYear = tl.years[tl.years.length - 1]!;
  const avgRealGrowth = countRealGrowth > 0 ? sumRealGrowth / countRealGrowth : 0;
  const debtGDP = lastYear.fiscalMonetary?.fiscal.debtGDPRatio ?? 0;

  // Find values at specific years
  const at2040 = tl.years.find(y => y.year === 2040);
  const at2050 = tl.years.find(y => y.year === 2050);

  return { sumRealGrowth, avgRealGrowth, maxUE, maxCredT, minIncAdq, maxInflation, collapseYear, debtGDP, lastYear, at2040, at2050 };
}

describe('Fix 5b Diagnostic — Full timeline audit', () => {
  it('zero-AI: full 2025-2050 trace to find post-2035 collapse trigger', () => {
    const config = getDefaultSimulationConfig();
    for (const vecId of Object.keys(config.capabilities) as Array<keyof typeof config.capabilities>) {
      config.capabilities[vecId] = { ...config.capabilities[vecId], floor: 0, ceiling: 0 };
    }
    config.populationGrowthRate = 0;

    const tl = runSimulation(config, OCCUPATION_CLUSTERS);

    const structuralProductivityGrowth = Math.max(0, BASELINE_GDP_GROWTH_RATE - DEFAULT_POPULATION_GROWTH_RATE);

    // === TABLE 1: Core macro variables ===
    console.log('');
    console.log('=== TABLE 1: Core Macro (2025-2050) ===');
    console.log(
      'Year'.padEnd(6)
      + '| cDemR'.padStart(8)
      + '| bDemR'.padStart(8)
      + '| demSurv'.padStart(9)
      + '| UE%'.padStart(7)
      + '| wagePr'.padStart(8)
      + '| nomGDP$T'.padStart(10)
      + '| realGDP%'.padStart(10)
      + '| compI%'.padStart(8)
      + '| pxLvl'.padStart(8)
      + '| inv$T'.padStart(8)
      + '| capGate'.padStart(9)
    );
    console.log('-'.repeat(110));

    for (let i = 0; i < tl.years.length; i++) {
      const yr = tl.years[i]!;
      const m = yr.macro;
      const prevGDP = i > 0 ? tl.years[i - 1]!.macro.gdpNominal : BASELINE_GDP_NOMINAL_2025;
      const nomGrowth = (m.gdpNominal / prevGDP - 1) * 100;
      const realGrowth = nomGrowth - m.compositeInflation * 100;

      console.log(
        `${yr.year}`.padEnd(6)
        + `| ${m.consumerDemandRatio.toFixed(3)}`.padStart(8)
        + `| ${m.businessDemandRatio.toFixed(3)}`.padStart(8)
        + `| ${m.aggregateDemandSurvival.toFixed(4)}`.padStart(9)
        + `| ${(m.unemploymentRate * 100).toFixed(1)}`.padStart(7)
        + `| ${m.wagePressure.toFixed(3)}`.padStart(8)
        + `| ${(m.gdpNominal / 1e12).toFixed(3)}`.padStart(10)
        + `| ${realGrowth.toFixed(1)}`.padStart(10)
        + `| ${(m.compositeInflation * 100).toFixed(1)}`.padStart(8)
        + `| ${m.priceLevel.toFixed(3)}`.padStart(8)
        + `| ${(m.investment / 1e12).toFixed(3)}`.padStart(8)
        + `| ${m.capacityGate.toFixed(4)}`.padStart(9)
      );
    }

    // === TABLE 2: Credit, housing, and income channels ===
    console.log('');
    console.log('=== TABLE 2: Credit / Housing / Income (2025-2050) ===');
    console.log(
      'Year'.padEnd(6)
      + '| credTight'.padStart(11)
      + '| credMult'.padStart(10)
      + '| incAdq'.padStart(8)
      + '| CWI'.padStart(6)
      + '| homePx%'.padStart(9)
      + '| HPI'.padStart(6)
      + '| wageInc$T'.padStart(11)
      + '| C$T'.padStart(8)
      + '| G$T'.padStart(8)
      + '| corpProf$T'.padStart(12)
      + '| retEarn$T'.padStart(11)
    );
    console.log('-'.repeat(125));

    for (let i = 0; i < tl.years.length; i++) {
      const yr = tl.years[i]!;
      const m = yr.macro;

      console.log(
        `${yr.year}`.padEnd(6)
        + `| ${m.consumerCreditTightening.toFixed(3)}`.padStart(11)
        + `| ${m.consumerCreditMultiplier.toFixed(3)}`.padStart(10)
        + `| ${m.incomeAdequacyRatio.toFixed(3)}`.padStart(8)
        + `| ${m.consumerWelfareIndex.toFixed(2)}`.padStart(6)
        + `| ${(m.homePriceChangeRate * 100).toFixed(1)}`.padStart(9)
        + `| ${m.homePriceIndex.toFixed(3)}`.padStart(6)
        + `| ${(m.aggregateWageIncome / 1e12).toFixed(3)}`.padStart(11)
        + `| ${(m.consumption / 1e12).toFixed(3)}`.padStart(8)
        + `| ${(m.governmentSpending / 1e12).toFixed(3)}`.padStart(8)
        + `| ${(m.corporateProfits / 1e12).toFixed(3)}`.padStart(12)
        + `| ${(m.retainedEarnings / 1e12).toFixed(3)}`.padStart(11)
      );
    }

    // === FIRST DEVIATION FINDER ===
    console.log('');
    console.log('=== FIRST DEVIATION FINDER ===');
    console.log('Looking for first year where any key variable breaks threshold...');
    for (let i = 1; i < tl.years.length; i++) {
      const yr = tl.years[i]!;
      const m = yr.macro;
      const prev = tl.years[i - 1]!.macro;
      const flags: string[] = [];

      if (m.consumerDemandRatio < 0.95) flags.push(`cDemR=${m.consumerDemandRatio.toFixed(3)}<0.95`);
      if (m.businessDemandRatio < 0.90) flags.push(`bDemR=${m.businessDemandRatio.toFixed(3)}<0.90`);
      if (m.aggregateDemandSurvival < 0.99) flags.push(`demSurv=${m.aggregateDemandSurvival.toFixed(4)}<0.99`);
      if (m.unemploymentRate > 0.06) flags.push(`UE=${(m.unemploymentRate*100).toFixed(1)}%>6%`);
      if (m.wagePressure < 0.95) flags.push(`wagePr=${m.wagePressure.toFixed(3)}<0.95`);
      if (m.consumerCreditTightening > 0.30) flags.push(`credT=${m.consumerCreditTightening.toFixed(3)}>0.30`);
      if (m.homePriceIndex < 0.90) flags.push(`HPI=${m.homePriceIndex.toFixed(3)}<0.90`);
      if (m.incomeAdequacyRatio < 0.80) flags.push(`incAdq=${m.incomeAdequacyRatio.toFixed(3)}<0.80`);
      if (m.capacityGate < 0.95) flags.push(`capGate=${m.capacityGate.toFixed(4)}<0.95`);
      if (m.consumerCreditMultiplier < 0.90) flags.push(`credMult=${m.consumerCreditMultiplier.toFixed(3)}<0.90`);
      // GDP decline
      const gdpChange = (m.gdpNominal / prev.gdpNominal - 1) * 100;
      if (gdpChange < -2) flags.push(`GDP_Δ=${gdpChange.toFixed(1)}%<-2%`);

      if (flags.length > 0) {
        console.log(`  ${yr.year}: ${flags.join(', ')}`);
      }
    }
  });

  it('default AI: all fiscal/Fed preset combinations', () => {
    const fiscalKeys = Object.keys(FISCAL_POLICY_PRESETS);
    const fedKeys = Object.keys(FEDERAL_RESERVE_PRESETS);

    console.log('');
    console.log('=== DEFAULT AI: Fiscal × Fed Preset Matrix (2025-2050) ===');
    console.log(
      'Fiscal'.padEnd(22)
      + '| Fed'.padEnd(24)
      + '| GDP 2050$T'.padStart(12)
      + '| AvgRealGDP%'.padStart(13)
      + '| MaxUE%'.padStart(8)
      + '| 2050UE%'.padStart(9)
      + '| MaxCredT'.padStart(10)
      + '| MinIncAdq'.padStart(11)
      + '| Debt/GDP50'.padStart(12)
      + '| MaxInfl%'.padStart(10)
      + '| CollapseYr'.padStart(12)
    );
    console.log('-'.repeat(145));

    for (const fiscalKey of fiscalKeys) {
      for (const fedKey of fedKeys) {
        const config = getDefaultSimulationConfig();
        config.populationGrowthRate = 0;
        config.fiscalPolicyPreset = fiscalKey;
        config.federalReservePreset = fedKey;

        const tl = runSimulation(config, OCCUPATION_CLUSTERS);
        const m = computeMetrics(tl);

        console.log(
          fiscalKey.padEnd(22)
          + `| ${fedKey}`.padEnd(24)
          + `| ${(m.lastYear.macro.gdpNominal / 1e12).toFixed(1)}`.padStart(12)
          + `| ${m.avgRealGrowth.toFixed(1)}`.padStart(13)
          + `| ${(m.maxUE * 100).toFixed(1)}`.padStart(8)
          + `| ${(m.lastYear.macro.unemploymentRate * 100).toFixed(1)}`.padStart(9)
          + `| ${m.maxCredT.toFixed(3)}`.padStart(10)
          + `| ${m.minIncAdq.toFixed(3)}`.padStart(11)
          + `| ${(m.debtGDP * 100).toFixed(0)}`.padStart(12)
          + `| ${(m.maxInflation * 100).toFixed(1)}`.padStart(10)
          + `| ${m.collapseYear}`.padStart(12)
        );
      }
    }
  });

  // ════════════════════════════════════════════════════════════════
  // TEST 1: Policy lever differentiation
  // ════════════════════════════════════════════════════════════════
  it('TEST 1: Policy lever differentiation — no policy vs UBI vs wage subsidy', () => {
    // Helper: create a fully deep-cloned config to avoid shared reference mutation
    function freshConfig(): SimulationConfig {
      return structuredClone(getDefaultSimulationConfig());
    }

    const scenarios: Array<{ name: string; configure: (c: SimulationConfig) => void }> = [
      {
        name: '(a) No interventions',
        configure: (_c) => {
          // Default: UBI disabled, wage subsidy disabled — nothing to change
        },
      },
      {
        name: '(b) UBI $1500/mo @2030',
        configure: (c) => {
          c.policyConfig.ubi.enabled = true;
          c.policyConfig.ubi.monthlyAmount = {
            keyframes: [
              { year: 2025, value: 0 },
              { year: 2030, value: 1500 },
            ],
          };
          c.policyConfig.ubi.mode = 'manual';
          c.policyConfig.ubi.indexedToInflation = true;
        },
      },
      {
        name: '(c) Wage subsidy 50% @2028',
        configure: (c) => {
          c.policyConfig.wageSubsidy.enabled = true;
          c.policyConfig.wageSubsidy.subsidyPercentage = {
            keyframes: [
              { year: 2025, value: 0 },
              { year: 2028, value: 0.50 },
            ],
          };
          c.policyConfig.wageSubsidy.maxSubsidyPerWorker = 60000;
          c.policyConfig.wageSubsidy.phaseOutThreshold = 100000;
        },
      },
    ];

    console.log('');
    console.log('=== TEST 1: Policy Lever Differentiation (Balanced Reduction + Balanced Mandate) ===');
    console.log(
      'Scenario'.padEnd(28)
      + '| GDP 2040$T'.padStart(12)
      + '| GDP 2050$T'.padStart(12)
      + '| UE 2040%'.padStart(10)
      + '| UE 2050%'.padStart(10)
      + '| CWI 2040'.padStart(10)
      + '| CWI 2050'.padStart(10)
      + '| AvgReal%'.padStart(10)
      + '| Collapse'.padStart(10)
    );
    console.log('-'.repeat(120));

    for (const scenario of scenarios) {
      const config = freshConfig();
      config.populationGrowthRate = 0;
      config.fiscalPolicyPreset = 'balanced_reduction';
      config.federalReservePreset = 'balanced_mandate';
      scenario.configure(config);

      const tl = runSimulation(config, OCCUPATION_CLUSTERS);
      const m = computeMetrics(tl);

      const gdp40 = m.at2040 ? (m.at2040.macro.gdpNominal / 1e12).toFixed(1) : 'N/A';
      const gdp50 = m.at2050 ? (m.at2050.macro.gdpNominal / 1e12).toFixed(1) : 'N/A';
      const ue40 = m.at2040 ? (m.at2040.macro.unemploymentRate * 100).toFixed(1) : 'N/A';
      const ue50 = m.at2050 ? (m.at2050.macro.unemploymentRate * 100).toFixed(1) : 'N/A';
      const cwi40 = m.at2040 ? m.at2040.macro.consumerWelfareIndex.toFixed(0) : 'N/A';
      const cwi50 = m.at2050 ? m.at2050.macro.consumerWelfareIndex.toFixed(0) : 'N/A';

      console.log(
        scenario.name.padEnd(28)
        + `| ${gdp40}`.padStart(12)
        + `| ${gdp50}`.padStart(12)
        + `| ${ue40}`.padStart(10)
        + `| ${ue50}`.padStart(10)
        + `| ${cwi40}`.padStart(10)
        + `| ${cwi50}`.padStart(10)
        + `| ${m.avgRealGrowth.toFixed(1)}`.padStart(10)
        + `| ${m.collapseYear}`.padStart(10)
      );
    }

    // Print full year-by-year for each scenario to see trajectories
    for (const scenario of scenarios) {
      const config = freshConfig();
      config.populationGrowthRate = 0;
      config.fiscalPolicyPreset = 'balanced_reduction';
      config.federalReservePreset = 'balanced_mandate';
      scenario.configure(config);

      const tl = runSimulation(config, OCCUPATION_CLUSTERS);

      console.log('');
      console.log(`--- ${scenario.name}: Year-by-year ---`);
      console.log(
        'Year'.padEnd(6)
        + '| GDP$T'.padStart(8)
        + '| Real%'.padStart(8)
        + '| UE%'.padStart(7)
        + '| CWI'.padStart(8)
        + '| WageInc$T'.padStart(11)
        + '| TransInc$T'.padStart(12)
        + '| C$T'.padStart(8)
      );
      console.log('-'.repeat(78));

      for (let i = 0; i < tl.years.length; i++) {
        const yr = tl.years[i]!;
        const m = yr.macro;
        const prevGDP = i > 0 ? tl.years[i - 1]!.macro.gdpNominal : BASELINE_GDP_NOMINAL_2025;
        const nomGrowth = (m.gdpNominal / prevGDP - 1) * 100;
        const realGrowth = nomGrowth - m.compositeInflation * 100;

        console.log(
          `${yr.year}`.padEnd(6)
          + `| ${(m.gdpNominal / 1e12).toFixed(1)}`.padStart(8)
          + `| ${realGrowth.toFixed(1)}`.padStart(8)
          + `| ${(m.unemploymentRate * 100).toFixed(1)}`.padStart(7)
          + `| ${m.consumerWelfareIndex.toFixed(0)}`.padStart(8)
          + `| ${(m.aggregateWageIncome / 1e12).toFixed(2)}`.padStart(11)
          + `| ${(m.aggregateTransferIncome / 1e12).toFixed(2)}`.padStart(12)
          + `| ${(m.consumption / 1e12).toFixed(1)}`.padStart(8)
        );
      }
    }
  });

  // ════════════════════════════════════════════════════════════════
  // TEST 1b: UBI spiral diagnostic — Balanced Reduction + Balanced Mandate
  // ════════════════════════════════════════════════════════════════
  it('TEST 1b: UBI $1500/mo + Balanced Reduction + Balanced Mandate — spiral or converge?', () => {
    const config = structuredClone(getDefaultSimulationConfig());
    config.populationGrowthRate = 0;
    config.fiscalPolicyPreset = 'balanced_reduction';
    config.federalReservePreset = 'balanced_mandate';
    config.policyConfig.ubi.enabled = true;
    config.policyConfig.ubi.monthlyAmount = {
      keyframes: [
        { year: 2025, value: 0 },
        { year: 2030, value: 1500 },
      ],
    };
    config.policyConfig.ubi.mode = 'manual';
    config.policyConfig.ubi.indexedToInflation = true;

    const tl = runSimulation(config, OCCUPATION_CLUSTERS);

    console.log('');
    console.log('=== TEST 1b: UBI $1500/mo + Balanced Reduction + Balanced Mandate ===');
    console.log(
      'Year'.padEnd(6)
      + '| NomGDP$T'.padStart(10)
      + '| RealGDP$T'.padStart(11)
      + '| PriceLvl'.padStart(10)
      + '| Infl%'.padStart(8)
      + '| Trans$T'.padStart(9)
      + '| Wages$T'.padStart(9)
      + '| UE%'.padStart(7)
      + '| CredT'.padStart(8)
      + '| IncAdq'.padStart(8)
      + '| CWI'.padStart(7)
    );
    console.log('-'.repeat(103));

    let cumulativeRealGDP = 0;
    for (let i = 0; i < tl.years.length; i++) {
      const yr = tl.years[i]!;
      const m = yr.macro;
      const prevGDP = i > 0 ? tl.years[i - 1]!.macro.gdpNominal : BASELINE_GDP_NOMINAL_2025;
      const nomGrowth = (m.gdpNominal / prevGDP - 1) * 100;
      const realGrowth = nomGrowth - m.compositeInflation * 100;
      const realGDP = m.gdpNominal / m.priceLevel;

      console.log(
        `${yr.year}`.padEnd(6)
        + `| ${(m.gdpNominal / 1e12).toFixed(1)}`.padStart(10)
        + `| ${(realGDP / 1e12).toFixed(1)}`.padStart(11)
        + `| ${m.priceLevel.toFixed(3)}`.padStart(10)
        + `| ${(m.compositeInflation * 100).toFixed(1)}`.padStart(8)
        + `| ${(m.aggregateTransferIncome / 1e12).toFixed(2)}`.padStart(9)
        + `| ${(m.aggregateWageIncome / 1e12).toFixed(2)}`.padStart(9)
        + `| ${(m.unemploymentRate * 100).toFixed(1)}`.padStart(7)
        + `| ${m.consumerCreditTightening.toFixed(3)}`.padStart(8)
        + `| ${m.incomeAdequacyRatio.toFixed(3)}`.padStart(8)
        + `| ${m.consumerWelfareIndex.toFixed(0)}`.padStart(7)
      );
    }

    // Summary at key years
    console.log('');
    console.log('--- Summary at key years ---');
    for (const targetYear of [2035, 2040, 2045, 2050]) {
      const yr = tl.years.find(y => y.year === targetYear);
      if (yr) {
        const m = yr.macro;
        const realGDP = m.gdpNominal / m.priceLevel;
        console.log(`  ${targetYear}: NomGDP=${(m.gdpNominal/1e12).toFixed(1)}T, RealGDP=${(realGDP/1e12).toFixed(1)}T, PriceLevel=${m.priceLevel.toFixed(3)}, Inflation=${(m.compositeInflation*100).toFixed(1)}%, Transfers=${(m.aggregateTransferIncome/1e12).toFixed(2)}T, UE=${(m.unemploymentRate*100).toFixed(1)}%`);
      }
    }

    // Check: does price level exceed 10x (spiral) or stay under 3x (converge)?
    const finalPriceLevel = tl.years[tl.years.length - 1]!.macro.priceLevel;
    const maxInflation = Math.max(...tl.years.map(y => y.macro.compositeInflation));
    console.log(`\n  Final price level: ${finalPriceLevel.toFixed(3)}, Max inflation: ${(maxInflation*100).toFixed(1)}%`);
    console.log(`  Verdict: ${finalPriceLevel > 10 ? 'SPIRAL' : finalPriceLevel > 3 ? 'ELEVATED BUT BOUNDED' : 'CONVERGES'}`);
  });

  // ════════════════════════════════════════════════════════════════
  // TEST 1c: UBI + Tax the Winners — tax-financed vs deficit-financed
  // ════════════════════════════════════════════════════════════════
  it('TEST 1c: UBI $1500/mo + Tax the Winners + Balanced Mandate — tax-financed UBI', () => {
    const config = structuredClone(getDefaultSimulationConfig());
    config.populationGrowthRate = 0;
    config.fiscalPolicyPreset = 'tax_the_winners';
    config.federalReservePreset = 'balanced_mandate';
    config.policyConfig.ubi.enabled = true;
    config.policyConfig.ubi.monthlyAmount = {
      keyframes: [
        { year: 2025, value: 0 },
        { year: 2030, value: 1500 },
      ],
    };
    config.policyConfig.ubi.mode = 'manual';
    config.policyConfig.ubi.indexedToInflation = true;

    const tl = runSimulation(config, OCCUPATION_CLUSTERS);

    console.log('');
    console.log('=== TEST 1c: UBI $1500/mo + Tax the Winners + Balanced Mandate ===');
    console.log(
      'Year'.padEnd(6)
      + '| NomGDP$T'.padStart(10)
      + '| RealGDP$T'.padStart(11)
      + '| PriceLvl'.padStart(10)
      + '| Infl%'.padStart(8)
      + '| Trans$T'.padStart(9)
      + '| Wages$T'.padStart(9)
      + '| UE%'.padStart(7)
      + '| CredT'.padStart(8)
      + '| IncAdq'.padStart(8)
      + '| CWI'.padStart(7)
    );
    console.log('-'.repeat(103));

    for (let i = 0; i < tl.years.length; i++) {
      const yr = tl.years[i]!;
      const m = yr.macro;
      const prevGDP = i > 0 ? tl.years[i - 1]!.macro.gdpNominal : BASELINE_GDP_NOMINAL_2025;
      const realGDP = m.gdpNominal / m.priceLevel;

      console.log(
        `${yr.year}`.padEnd(6)
        + `| ${(m.gdpNominal / 1e12).toFixed(1)}`.padStart(10)
        + `| ${(realGDP / 1e12).toFixed(1)}`.padStart(11)
        + `| ${m.priceLevel.toFixed(3)}`.padStart(10)
        + `| ${(m.compositeInflation * 100).toFixed(1)}`.padStart(8)
        + `| ${(m.aggregateTransferIncome / 1e12).toFixed(2)}`.padStart(9)
        + `| ${(m.aggregateWageIncome / 1e12).toFixed(2)}`.padStart(9)
        + `| ${(m.unemploymentRate * 100).toFixed(1)}`.padStart(7)
        + `| ${m.consumerCreditTightening.toFixed(3)}`.padStart(8)
        + `| ${m.incomeAdequacyRatio.toFixed(3)}`.padStart(8)
        + `| ${m.consumerWelfareIndex.toFixed(0)}`.padStart(7)
      );
    }

    // Summary at key years
    console.log('');
    console.log('--- Summary at key years ---');
    for (const targetYear of [2035, 2040, 2045, 2050]) {
      const yr = tl.years.find(y => y.year === targetYear);
      if (yr) {
        const m = yr.macro;
        const realGDP = m.gdpNominal / m.priceLevel;
        console.log(`  ${targetYear}: NomGDP=${(m.gdpNominal/1e12).toFixed(1)}T, RealGDP=${(realGDP/1e12).toFixed(1)}T, PriceLevel=${m.priceLevel.toFixed(3)}, Inflation=${(m.compositeInflation*100).toFixed(1)}%, Transfers=${(m.aggregateTransferIncome/1e12).toFixed(2)}T, UE=${(m.unemploymentRate*100).toFixed(1)}%`);
      }
    }

    const finalPriceLevel = tl.years[tl.years.length - 1]!.macro.priceLevel;
    const maxInflation = Math.max(...tl.years.map(y => y.macro.compositeInflation));
    console.log(`\n  Final price level: ${finalPriceLevel.toFixed(3)}, Max inflation: ${(maxInflation*100).toFixed(1)}%`);
    console.log(`  Verdict: ${finalPriceLevel > 10 ? 'SPIRAL' : finalPriceLevel > 3 ? 'ELEVATED BUT BOUNDED' : 'CONVERGES'}`);

    // Compare with Test 1b
    console.log('');
    console.log('--- Comparison: Tax the Winners vs Balanced Reduction ---');
    console.log('  Balanced Reduction: Peak inflation 59.1%, final price level 12.129 → SPIRAL');
    console.log(`  Tax the Winners:    Peak inflation ${(maxInflation*100).toFixed(1)}%, final price level ${finalPriceLevel.toFixed(3)} → ${finalPriceLevel > 10 ? 'SPIRAL' : finalPriceLevel > 3 ? 'ELEVATED BUT BOUNDED' : 'CONVERGES'}`);
  });

  // ════════════════════════════════════════════════════════════════
  // TEST 2: Mild AI — halved ceilings, all 20 preset combinations
  // ════════════════════════════════════════════════════════════════
  it('TEST 2: Mild AI (halved ceilings) — all fiscal/Fed preset combinations', () => {
    const fiscalKeys = Object.keys(FISCAL_POLICY_PRESETS);
    const fedKeys = Object.keys(FEDERAL_RESERVE_PRESETS);

    console.log('');
    console.log('=== TEST 2: MILD AI (50% ceilings) — Fiscal × Fed Preset Matrix ===');
    console.log(
      'Fiscal'.padEnd(22)
      + '| Fed'.padEnd(24)
      + '| GDP 2050$T'.padStart(12)
      + '| AvgRealGDP%'.padStart(13)
      + '| MaxUE%'.padStart(8)
      + '| 2050UE%'.padStart(9)
      + '| MaxCredT'.padStart(10)
      + '| MinIncAdq'.padStart(11)
      + '| Debt/GDP50'.padStart(12)
      + '| MaxInfl%'.padStart(10)
      + '| CollapseYr'.padStart(12)
    );
    console.log('-'.repeat(145));

    for (const fiscalKey of fiscalKeys) {
      for (const fedKey of fedKeys) {
        const config = getDefaultSimulationConfig();
        config.populationGrowthRate = 0;
        config.fiscalPolicyPreset = fiscalKey;
        config.federalReservePreset = fedKey;

        // Halve all capability ceilings
        for (const vecId of Object.keys(config.capabilities) as Array<keyof typeof config.capabilities>) {
          config.capabilities[vecId] = {
            ...config.capabilities[vecId],
            ceiling: config.capabilities[vecId].ceiling * 0.5,
          };
        }

        const tl = runSimulation(config, OCCUPATION_CLUSTERS);
        const m = computeMetrics(tl);

        console.log(
          fiscalKey.padEnd(22)
          + `| ${fedKey}`.padEnd(24)
          + `| ${(m.lastYear.macro.gdpNominal / 1e12).toFixed(1)}`.padStart(12)
          + `| ${m.avgRealGrowth.toFixed(1)}`.padStart(13)
          + `| ${(m.maxUE * 100).toFixed(1)}`.padStart(8)
          + `| ${(m.lastYear.macro.unemploymentRate * 100).toFixed(1)}`.padStart(9)
          + `| ${m.maxCredT.toFixed(3)}`.padStart(10)
          + `| ${m.minIncAdq.toFixed(3)}`.padStart(11)
          + `| ${(m.debtGDP * 100).toFixed(0)}`.padStart(12)
          + `| ${(m.maxInflation * 100).toFixed(1)}`.padStart(10)
          + `| ${m.collapseYear}`.padStart(12)
        );
      }
    }
  });
});
