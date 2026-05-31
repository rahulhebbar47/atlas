/**
 * ATLAS Verification Audit — Invariant Checks
 *
 * Self-contained checks on ATLAS output only (no verification script dependency).
 * Validates accounting identities, bounds, monotonicity, policy isolation,
 * median CWI, fiscal window sanity, and general sanity checks.
 */

import type { SimulationTimeline, SimulationYearOutput, MacroOutput, CapabilityVectorId } from '@/types';
import {
  BASELINE_GDP_NOMINAL_2025,
  BASELINE_GDP_GROWTH_RATE,
  US_POPULATION_2025,
} from '@/models/constants';
import type { InvariantCheckResult } from './types';

// ============================================================
// Helper
// ============================================================

function check(
  scenario: string,
  year: number,
  checkName: string,
  passed: boolean,
  message: string,
  expected?: string,
  actual?: string,
): InvariantCheckResult {
  return { scenario, year, check: checkName, passed, message, expected, actual };
}

const REL_TOL = 0.001; // 0.1% tolerance for accounting identities

function relClose(a: number, b: number, tol = REL_TOL): boolean {
  if (a === 0 && b === 0) return true;
  const denom = Math.max(Math.abs(a), Math.abs(b));
  return Math.abs(a - b) / denom < tol;
}

// ============================================================
// 1. Accounting Identity Checks
// ============================================================

function checkAccountingIdentities(
  scenario: string,
  yr: SimulationYearOutput,
): InvariantCheckResult[] {
  const results: InvariantCheckResult[] = [];
  const m = yr.macro;
  const year = yr.year;

  // totalIncome = wageIncome + assetIncome + transferIncome
  const incomeSum = m.aggregateWageIncome + m.aggregateAssetIncome + m.aggregateTransferIncome;
  results.push(check(
    scenario, year, 'income_sum',
    relClose(m.totalIncome, incomeSum),
    `totalIncome=${fmt(m.totalIncome)} vs sum=${fmt(incomeSum)}`,
    fmt(incomeSum), fmt(m.totalIncome),
  ));

  // gdpReal = gdpNominal / priceLevel
  const expectedReal = m.gdpNominal / m.priceLevel;
  results.push(check(
    scenario, year, 'gdp_real_identity',
    relClose(m.gdpReal, expectedReal),
    `gdpReal=${fmt(m.gdpReal)} vs gdpNominal/priceLevel=${fmt(expectedReal)}`,
    fmt(expectedReal), fmt(m.gdpReal),
  ));

  // CWI = totalIncome / (population × priceLevel)
  const pop = m.dynamicPopulation || US_POPULATION_2025;
  const totalIncomeForCWI = m.aggregateWageIncome + m.aggregateAssetIncome + m.aggregateTransferIncome;
  const expectedCWI = totalIncomeForCWI / (pop * m.priceLevel);
  results.push(check(
    scenario, year, 'cwi_identity',
    relClose(m.consumerWelfareIndex, expectedCWI),
    `CWI=${m.consumerWelfareIndex.toFixed(6)} vs totalIncome/(pop×P)=${expectedCWI.toFixed(6)}`,
    expectedCWI.toFixed(6), m.consumerWelfareIndex.toFixed(6),
  ));

  return results;
}

// ============================================================
// 2. Bounds Checks
// ============================================================

function checkBounds(
  scenario: string,
  yr: SimulationYearOutput,
): InvariantCheckResult[] {
  const results: InvariantCheckResult[] = [];
  const m = yr.macro;
  const year = yr.year;

  // Unemployment rate [0, 1]
  results.push(check(
    scenario, year, 'unemployment_rate_bounds',
    m.unemploymentRate >= 0 && m.unemploymentRate <= 1,
    `unemploymentRate=${m.unemploymentRate}`,
    '[0, 1]', m.unemploymentRate.toFixed(6),
  ));

  // Capabilities in [0, ceiling]
  const caps = yr.capabilities;
  for (const vec of ['generative', 'agentic', 'embodied'] as CapabilityVectorId[]) {
    const val = caps[vec];
    results.push(check(
      scenario, year, `capability_${vec}_bounds`,
      val >= 0 && val <= 1.01, // slight margin for floating point
      `capability.${vec}=${val}`,
      '[0, ~1]', val.toFixed(6),
    ));
  }

  // totalEmployment ≥ 0
  results.push(check(
    scenario, year, 'employment_nonneg',
    m.totalEmployment >= 0,
    `totalEmployment=${fmt(m.totalEmployment)}`,
    '≥ 0', fmt(m.totalEmployment),
  ));

  // gdpNominal ≥ 0
  results.push(check(
    scenario, year, 'gdp_nominal_nonneg',
    m.gdpNominal >= 0,
    `gdpNominal=${fmt(m.gdpNominal)}`,
    '≥ 0', fmt(m.gdpNominal),
  ));

  // CWI ≥ 0
  results.push(check(
    scenario, year, 'cwi_nonneg',
    m.consumerWelfareIndex >= 0,
    `CWI=${m.consumerWelfareIndex.toFixed(6)}`,
    '≥ 0', m.consumerWelfareIndex.toFixed(6),
  ));

  // priceLevel > 0
  results.push(check(
    scenario, year, 'price_level_positive',
    m.priceLevel > 0,
    `priceLevel=${m.priceLevel}`,
    '> 0', m.priceLevel.toFixed(6),
  ));

  // No NaN or Infinity in key numeric fields
  const criticalFields: Array<[string, number]> = [
    ['totalEmployment', m.totalEmployment],
    ['gdpNominal', m.gdpNominal],
    ['gdpReal', m.gdpReal],
    ['priceLevel', m.priceLevel],
    ['consumerWelfareIndex', m.consumerWelfareIndex],
    ['consumption', m.consumption],
    ['investment', m.investment],
    ['governmentSpending', m.governmentSpending],
    ['aggregateWageIncome', m.aggregateWageIncome],
    ['aggregateAssetIncome', m.aggregateAssetIncome],
    ['aggregateTransferIncome', m.aggregateTransferIncome],
    ['totalIncome', m.totalIncome],
    ['inflationRate', m.inflationRate],
    ['unemploymentRate', m.unemploymentRate],
    ['revenuePressure', m.revenuePressure],
    ['corporateProfits', m.corporateProfits],
    ['medianCWI', m.medianCWI],
  ];
  for (const [name, val] of criticalFields) {
    results.push(check(
      scenario, year, `no_nan_inf_${name}`,
      Number.isFinite(val),
      `${name}=${val}`,
      'finite', String(val),
    ));
  }

  // Monetary fields
  const mon = yr.monetary;
  results.push(check(
    scenario, year, 'money_supply_positive',
    Number.isFinite(mon.moneySupply) && mon.moneySupply > 0,
    `moneySupply=${mon.moneySupply}`,
    '> 0, finite', String(mon.moneySupply),
  ));

  return results;
}

// ============================================================
// 3. Monotonicity Checks
// ============================================================

function checkMonotonicity(
  scenario: string,
  years: SimulationYearOutput[],
  isZeroDisplacement: boolean,
): InvariantCheckResult[] {
  const results: InvariantCheckResult[] = [];

  // S-curves: capability non-decreasing over time
  for (const vec of ['generative', 'agentic', 'embodied'] as CapabilityVectorId[]) {
    for (let i = 1; i < years.length; i++) {
      const prev = years[i - 1].capabilities[vec];
      const curr = years[i].capabilities[vec];
      if (curr < prev - 0.0001) { // small tolerance for floating point
        results.push(check(
          scenario, years[i].year, `capability_${vec}_monotonic`,
          false,
          `${vec} decreased: ${prev.toFixed(6)} → ${curr.toFixed(6)}`,
          `≥ ${prev.toFixed(6)}`, curr.toFixed(6),
        ));
      }
    }
  }

  // Population increasing
  for (let i = 1; i < years.length; i++) {
    const prevPop = years[i - 1].macro.dynamicPopulation;
    const currPop = years[i].macro.dynamicPopulation;
    if (currPop < prevPop - 1) { // allow tiny float rounding
      results.push(check(
        scenario, years[i].year, 'population_increasing',
        false,
        `Population decreased: ${prevPop} → ${currPop}`,
        `≥ ${prevPop}`, String(currPop),
      ));
    }
  }

  // Zero displacement: employment/population ratio constant (±0.1%), GDP monotonically rising
  // Employment grows with population (baseline growth fix), so check the ratio, not absolute level.
  if (isZeroDisplacement) {
    const baseEmp = years[0].macro.totalEmployment;
    const basePop = years[0].macro.dynamicPopulation;
    const baseRatio = baseEmp / basePop;
    for (let i = 1; i < years.length; i++) {
      const emp = years[i].macro.totalEmployment;
      const pop = years[i].macro.dynamicPopulation;
      const ratio = emp / pop;
      const relDiff = Math.abs(ratio - baseRatio) / baseRatio;
      results.push(check(
        scenario, years[i].year, 'zero_disp_employment_ratio_constant',
        relDiff < 0.001, // ±0.1%
        `Employment/population ratio drift: ${relDiff.toFixed(6)} (base=${baseRatio.toFixed(6)}, current=${ratio.toFixed(6)})`,
        `±0.1% of ${baseRatio.toFixed(6)}`, ratio.toFixed(6),
      ));
    }

    // GDP monotonically rising
    for (let i = 1; i < years.length; i++) {
      const prevGDP = years[i - 1].macro.gdpNominal;
      const currGDP = years[i].macro.gdpNominal;
      results.push(check(
        scenario, years[i].year, 'zero_disp_gdp_rising',
        currGDP >= prevGDP * 0.999, // allow tiny tolerance
        `GDP: ${fmt(prevGDP)} → ${fmt(currGDP)}`,
        `≥ ${fmt(prevGDP)}`, fmt(currGDP),
      ));
    }
  }

  return results;
}

// ============================================================
// 4. Policy Isolation Checks
// ============================================================

/**
 * Verify that policy scenarios produce IDENTICAL results to the no-policy scenario
 * in years BEFORE the policy activates.
 */
function checkPolicyIsolation(
  noPolicy: SimulationYearOutput[],
  policyYears: SimulationYearOutput[],
  scenarioId: string,
  beforeYear: number,
): InvariantCheckResult[] {
  const results: InvariantCheckResult[] = [];

  const noPolicyByYear = new Map<number, SimulationYearOutput>();
  for (const yr of noPolicy) noPolicyByYear.set(yr.year, yr);

  for (const yr of policyYears) {
    if (yr.year >= beforeYear) break;
    const baseline = noPolicyByYear.get(yr.year);
    if (!baseline) continue;

    // Check key macro fields that should be identical
    const fieldsToCheck: Array<[string, number, number]> = [
      ['gdpNominal', baseline.macro.gdpNominal, yr.macro.gdpNominal],
      ['totalEmployment', baseline.macro.totalEmployment, yr.macro.totalEmployment],
      ['consumption', baseline.macro.consumption, yr.macro.consumption],
      ['consumerWelfareIndex', baseline.macro.consumerWelfareIndex, yr.macro.consumerWelfareIndex],
      ['totalIncome', baseline.macro.totalIncome, yr.macro.totalIncome],
      ['priceLevel', baseline.macro.priceLevel, yr.macro.priceLevel],
    ];

    for (const [field, expected, actual] of fieldsToCheck) {
      const identical = relClose(expected, actual, 0.0001); // very tight tolerance
      results.push(check(
        scenarioId, yr.year, `policy_isolation_${field}`,
        identical,
        `Before policy active: ${field} baseline=${fmt(expected)} vs policy=${fmt(actual)}`,
        fmt(expected), fmt(actual),
      ));
    }
  }

  return results;
}

// ============================================================
// 5. Median CWI Checks
// ============================================================

function checkMedianCWI(
  scenario: string,
  years: SimulationYearOutput[],
): InvariantCheckResult[] {
  const results: InvariantCheckResult[] = [];

  for (const yr of years) {
    const m = yr.macro;

    // medianCWI ≤ consumerWelfareIndex (at default distribution shares 0.45/0.78/0.12)
    results.push(check(
      scenario, yr.year, 'median_cwi_le_system_cwi',
      m.medianCWI <= m.consumerWelfareIndex * 1.001, // tiny tolerance
      `medianCWI=${m.medianCWI.toFixed(4)} ≤ systemCWI=${m.consumerWelfareIndex.toFixed(4)}`,
      `≤ ${m.consumerWelfareIndex.toFixed(4)}`, m.medianCWI.toFixed(4),
    ));

    // medianCWI > 0 when transferConsumption > 0
    if (m.transferConsumption > 0) {
      results.push(check(
        scenario, yr.year, 'median_cwi_positive_with_transfers',
        m.medianCWI > 0,
        `medianCWI=${m.medianCWI.toFixed(4)} with transferConsumption=${fmt(m.transferConsumption)}`,
        '> 0', m.medianCWI.toFixed(4),
      ));
    }

    // No NaN/Infinity in medianCWI or medianCWIGrowthRate
    results.push(check(
      scenario, yr.year, 'median_cwi_finite',
      Number.isFinite(m.medianCWI),
      `medianCWI=${m.medianCWI}`,
      'finite', String(m.medianCWI),
    ));
    results.push(check(
      scenario, yr.year, 'median_cwi_growth_finite',
      Number.isFinite(m.medianCWIGrowthRate),
      `medianCWIGrowthRate=${m.medianCWIGrowthRate}`,
      'finite', String(m.medianCWIGrowthRate),
    ));
  }

  return results;
}

// ============================================================
// 6. Fiscal Window Sanity Checks
// ============================================================

function checkFiscalWindow(
  scenario: string,
  timeline: SimulationTimeline,
  isZeroDisplacement: boolean,
): InvariantCheckResult[] {
  const results: InvariantCheckResult[] = [];

  if (isZeroDisplacement) {
    // Both windows should be empty (null) in zero displacement
    results.push(check(
      scenario, 0, 'fiscal_window_null_zero_disp',
      timeline.fiscalWindowOpen === null,
      `fiscalWindowOpen should be null in zero displacement, got ${timeline.fiscalWindowOpen}`,
      'null', String(timeline.fiscalWindowOpen),
    ));
    results.push(check(
      scenario, 0, 'prep_window_null_zero_disp',
      timeline.prepWindowOpen === null,
      `prepWindowOpen should be null in zero displacement, got ${timeline.prepWindowOpen}`,
      'null', String(timeline.prepWindowOpen),
    ));
  } else {
    // fiscalWindowOpen ≥ prepWindowOpen (fiscal never opens before prep)
    if (timeline.fiscalWindowOpen !== null && timeline.prepWindowOpen !== null) {
      results.push(check(
        scenario, 0, 'fiscal_after_prep',
        timeline.fiscalWindowOpen >= timeline.prepWindowOpen,
        `fiscalWindowOpen=${timeline.fiscalWindowOpen} ≥ prepWindowOpen=${timeline.prepWindowOpen}`,
        `≥ ${timeline.prepWindowOpen}`, String(timeline.fiscalWindowOpen),
      ));
    }

    // fiscalWindowClose triggered when gdpGrowthRate ≤ 0
    if (timeline.fiscalWindowClose !== null) {
      const closeYear = timeline.years.find(y => y.year === timeline.fiscalWindowClose);
      if (closeYear) {
        results.push(check(
          scenario, timeline.fiscalWindowClose, 'fiscal_window_close_gdp_contract',
          closeYear.macro.gdpGrowthRate <= 0,
          `At fiscal close: gdpGrowthRate=${(closeYear.macro.gdpGrowthRate * 100).toFixed(4)}% (should be ≤ 0)`,
          '≤ 0%', `${(closeYear.macro.gdpGrowthRate * 100).toFixed(4)}%`,
        ));
      }
    }
  }

  return results;
}

// ============================================================
// 7. General Sanity Checks
// ============================================================

function checkGeneralSanity(
  scenarios: Map<string, SimulationYearOutput[]>,
): InvariantCheckResult[] {
  const results: InvariantCheckResult[] = [];

  // Zero displacement GDP at 2050: should grow steadily with no contraction.
  // With baseline employment growth (~0.4%/yr from population), GDP compounds faster
  // than pure (1+g)^25 because wage income scales with growing employment.
  // Check that GDP is monotonically positive and within a reasonable range.
  const zeroDisp = scenarios.get('zero_displacement');
  if (zeroDisp) {
    const year2050 = zeroDisp.find(y => y.year === 2050);
    const year2025 = zeroDisp.find(y => y.year === 2025);
    if (year2050 && year2025) {
      // GDP should at minimum grow at baseline rate (lower bound)
      const minExpectedGDP = BASELINE_GDP_NOMINAL_2025 * Math.pow(1 + BASELINE_GDP_GROWTH_RATE, 25);
      // GDP should not exceed baseline rate + amplified pop growth effect (upper bound).
      // Employment growth feeds into wage income → consumption → GDP with multiplier effects,
      // so the effective GDP impact of population growth exceeds the raw rate (~0.4%/yr → ~1.1% GDP).
      const popGrowthRate = (year2050.macro.dynamicPopulation / year2025.macro.dynamicPopulation) - 1;
      const effectiveGrowthRate = BASELINE_GDP_GROWTH_RATE + (popGrowthRate / 25) * 3; // ~3x amplification
      const maxExpectedGDP = BASELINE_GDP_NOMINAL_2025 * Math.pow(1 + effectiveGrowthRate, 25);
      const actualGDP = year2050.macro.gdpNominal;
      const inRange = actualGDP >= minExpectedGDP * 0.95 && actualGDP <= maxExpectedGDP * 1.10;
      results.push(check(
        'zero_displacement', 2050, 'zero_disp_gdp_2050_range',
        inRange,
        `GDP 2050: actual=${fmt(actualGDP)}, range=[${fmt(minExpectedGDP * 0.95)}, ${fmt(maxExpectedGDP * 1.10)}]`,
        `[${fmt(minExpectedGDP * 0.95)}, ${fmt(maxExpectedGDP * 1.10)}]`, fmt(actualGDP),
      ));
    }
  }

  // Aggressive scenario peak UE > conservative (displacement_no_policy) peak UE
  const aggressive = scenarios.get('aggressive_stress');
  const conservative = scenarios.get('displacement_no_policy');
  if (aggressive && conservative) {
    const aggrPeakUE = Math.max(...aggressive.map(y => y.macro.unemploymentRate));
    const consPeakUE = Math.max(...conservative.map(y => y.macro.unemploymentRate));
    results.push(check(
      'aggressive_vs_conservative', 0, 'aggressive_higher_peak_ue',
      aggrPeakUE > consPeakUE,
      `Aggressive peak UE ${(aggrPeakUE * 100).toFixed(2)}% > Conservative ${(consPeakUE * 100).toFixed(2)}%`,
      `> ${(consPeakUE * 100).toFixed(2)}%`, `${(aggrPeakUE * 100).toFixed(2)}%`,
    ));
  }

  // UBI scenario CWI > no-policy CWI when UBI active
  const ubiOnly = scenarios.get('ubi_only');
  const noPolicy = scenarios.get('displacement_no_policy');
  if (ubiOnly && noPolicy) {
    // UBI $2000/mo is active from 2025 — check later years where displacement is significant
    for (let yr = 2035; yr <= 2050; yr++) {
      const ubiYear = ubiOnly.find(y => y.year === yr);
      const noPolicyYear = noPolicy.find(y => y.year === yr);
      if (ubiYear && noPolicyYear) {
        results.push(check(
          'ubi_vs_no_policy', yr, 'ubi_cwi_gt_no_policy',
          ubiYear.macro.consumerWelfareIndex > noPolicyYear.macro.consumerWelfareIndex,
          `UBI CWI=${ubiYear.macro.consumerWelfareIndex.toFixed(4)} vs NoPolicy=${noPolicyYear.macro.consumerWelfareIndex.toFixed(4)}`,
          `> ${noPolicyYear.macro.consumerWelfareIndex.toFixed(4)}`,
          ubiYear.macro.consumerWelfareIndex.toFixed(4),
        ));
      }
    }
  }

  return results;
}

// ============================================================
// Format helper
// ============================================================

function fmt(n: number): string {
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return n.toFixed(4);
}

// ============================================================
// Main entry: Run all invariant checks
// ============================================================

export interface InvariantCheckInput {
  scenarioId: string;
  timeline: SimulationTimeline;
  years: SimulationYearOutput[];
}

/**
 * Run all invariant checks across all scenarios.
 * Returns all InvariantCheckResult items.
 */
export function runInvariantChecks(
  inputs: InvariantCheckInput[],
): InvariantCheckResult[] {
  const allResults: InvariantCheckResult[] = [];

  // Build lookup for cross-scenario checks
  const scenarioYearsMap = new Map<string, SimulationYearOutput[]>();
  const scenarioTimelines = new Map<string, SimulationTimeline>();
  for (const input of inputs) {
    scenarioYearsMap.set(input.scenarioId, input.years);
    scenarioTimelines.set(input.scenarioId, input.timeline);
  }

  for (const input of inputs) {
    const { scenarioId, timeline, years } = input;
    const isZeroDisp = scenarioId === 'zero_displacement';

    // Per-year checks
    for (const yr of years) {
      allResults.push(...checkAccountingIdentities(scenarioId, yr));
      allResults.push(...checkBounds(scenarioId, yr));
    }

    // Multi-year checks
    allResults.push(...checkMedianCWI(scenarioId, years));
    allResults.push(...checkMonotonicity(scenarioId, years, isZeroDisp));
    allResults.push(...checkFiscalWindow(scenarioId, timeline, isZeroDisp));
  }

  // Policy isolation checks
  const noPolicy = scenarioYearsMap.get('displacement_no_policy');
  if (noPolicy) {
    // UBI Phased (scenario 4): years 2025-2031 should match no-policy (UBI starts at 2032)
    const ubiPhased = scenarioYearsMap.get('ubi_phased');
    if (ubiPhased) {
      allResults.push(...checkPolicyIsolation(noPolicy, ubiPhased, 'ubi_phased', 2032));
    }

    // AI Fund (scenario 5): years 2025-2029 should match no-policy (SWF ownership starts at 2030)
    const aiFund = scenarioYearsMap.get('ai_fund_only');
    if (aiFund) {
      allResults.push(...checkPolicyIsolation(noPolicy, aiFund, 'ai_fund_only', 2030));
    }

    // Min Wage (scenario 6): years 2025-2027 should match no-policy (min wage starts at 2028)
    const minWage = scenarioYearsMap.get('min_wage_only');
    if (minWage) {
      allResults.push(...checkPolicyIsolation(noPolicy, minWage, 'min_wage_only', 2028));
    }
  }

  // Cross-scenario general sanity
  allResults.push(...checkGeneralSanity(scenarioYearsMap));

  return allResults;
}
