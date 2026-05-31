/**
 * ATLAS Verification Audit — Extreme Value Sweep
 *
 * Tests ~25 user-adjustable parameters at min/max/beyond-range values
 * to verify stability (no NaN, Infinity, division by zero) and logical bounds.
 * Also includes 10 dangerous combination stress tests.
 */

import { getDefaultSimulationConfig, runSimulation } from '@/models/simulation';
import type { SimulationConfig, SimulationYearOutput, MacroOutput, OccupationCluster, OccupationBaseline } from '@/types';
import type { ExtremeValueResult } from './types';

// ============================================================
// Parameter definitions
// ============================================================

interface ParamTest {
  name: string;
  apply: (config: SimulationConfig, value: number) => void;
  testValues: Array<{ label: string; value: number }>;
}

const SINGLE_PARAM_TESTS: ParamTest[] = [
  {
    name: 'baselineGDPGrowth',
    apply: (c, v) => { c.baselineGDPGrowth = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'high_0.10', value: 0.10 },
      { label: 'negative', value: -0.05 },
    ],
  },
  {
    name: 'baseInflationRate',
    apply: (c, v) => { c.baseInflationRate = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'high_0.20', value: 0.20 },
      { label: 'deflation', value: -0.02 },
    ],
  },
  {
    name: 'mpcWage',
    apply: (c, v) => { c.mpcWage = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'max_1', value: 1.0 },
      { label: 'low_0.1', value: 0.1 },
    ],
  },
  {
    name: 'mpcAsset',
    apply: (c, v) => { c.mpcAsset = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'max_1', value: 1.0 },
      { label: 'low_0.05', value: 0.05 },
    ],
  },
  {
    name: 'mpcTransfer',
    apply: (c, v) => { c.mpcTransfer = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'max_1', value: 1.0 },
    ],
  },
  // DEPRECATED: profitRealizationSensitivity — replaced by endogenous capital gains realization rate
  // {
  //   name: 'profitRealizationSensitivity',
  //   apply: (c, v) => { c.profitRealizationSensitivity = v; },
  //   testValues: [
  //     { label: 'min_0', value: 0 },
  //     { label: 'max_2', value: 2.0 },
  //     { label: 'extreme_5', value: 5.0 },
  //   ],
  // },
  {
    name: 'okunCoefficient',
    apply: (c, v) => { c.okunCoefficient = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'high_5', value: 5.0 },
      { label: 'max_10', value: 10.0 },
    ],
  },
  {
    name: 'revenuePressureSensitivity',
    apply: (c, v) => { c.revenuePressureSensitivity = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'high_3', value: 3.0 },
    ],
  },
  {
    name: 'revenuePressureCap',
    apply: (c, v) => { c.revenuePressureCap = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'high_1', value: 1.0 },
    ],
  },
  {
    name: 'revenuePressureDecay',
    apply: (c, v) => { c.revenuePressureDecay = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'max_1', value: 1.0 },
    ],
  },
  {
    name: 'aiWageProductivityMultiplier',
    apply: (c, v) => { c.aiWageProductivityMultiplier = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'high_3', value: 3.0 },
    ],
  },
  {
    name: 'innovationRate_multiplier',
    apply: (c, v) => { c.innovationRate = 1.5e-8 * v; },
    testValues: [
      { label: '0.1x', value: 0.1 },
      { label: '10x', value: 10 },
      { label: '0x', value: 0 },
    ],
  },
  {
    name: 'rdMultiplier',
    apply: (c, v) => { c.rdMultiplier = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'max_3', value: 3.0 },
    ],
  },
  {
    name: 'newJobDurabilityFactor',
    apply: (c, v) => { c.newJobDurabilityFactor = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'max_1', value: 1.0 },
    ],
  },
  {
    name: 'aiProfitMargin',
    apply: (c, v) => { c.aiProfitMargin = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'max_0.99', value: 0.99 },
      { label: 'mid_0.5', value: 0.5 },
    ],
  },
  {
    name: 'traditionalProfitMargin',
    apply: (c, v) => { c.traditionalProfitMargin = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'max_0.5', value: 0.5 },
    ],
  },
  {
    name: 'generative_ceiling',
    apply: (c, v) => { c.capabilities.generative.ceiling = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'max_1', value: 1.0 },
    ],
  },
  {
    name: 'agentic_ceiling',
    apply: (c, v) => { c.capabilities.agentic.ceiling = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'max_1', value: 1.0 },
    ],
  },
  {
    name: 'embodied_ceiling',
    apply: (c, v) => { c.capabilities.embodied.ceiling = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'max_1', value: 1.0 },
    ],
  },
  {
    name: 'generative_steepness',
    apply: (c, v) => { c.capabilities.generative.steepness = v; },
    testValues: [
      { label: 'min_0.1', value: 0.1 },
      { label: 'max_3', value: 3.0 },
    ],
  },
  {
    name: 'creditSensitivity',
    apply: (c, v) => {
      if (!c.secondOrderParams) c.secondOrderParams = {};
      c.secondOrderParams.creditSensitivity = v;
    },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'max_1', value: 1.0 },
    ],
  },
  {
    name: 'demandSensitivity',
    apply: (c, v) => {
      if (!c.secondOrderParams) c.secondOrderParams = {};
      c.secondOrderParams.demandSensitivity = v;
    },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'max_3', value: 3.0 },
    ],
  },
  {
    name: 'populationGrowthRate',
    apply: (c, v) => { c.populationGrowthRate = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'high_0.03', value: 0.03 },
      { label: 'negative', value: -0.01 },
    ],
  },
  {
    name: 'bottom80WageShare',
    apply: (c, v) => { c.bottom80WageShare = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'max_1', value: 1.0 },
    ],
  },
  {
    name: 'bottom80TransferShare',
    apply: (c, v) => { c.bottom80TransferShare = v; },
    testValues: [
      { label: 'min_0', value: 0 },
      { label: 'max_1', value: 1.0 },
    ],
  },
];

// ============================================================
// Dangerous combination tests
// ============================================================

interface ComboTest {
  name: string;
  apply: (config: SimulationConfig) => void;
}

const COMBO_TESTS: ComboTest[] = [
  {
    name: 'ai_profit_99pct_full_automation',
    apply: (c) => {
      c.aiProfitMargin = 0.99;
      c.capabilities.generative.ceiling = 1.0;
      c.capabilities.agentic.ceiling = 1.0;
      c.capabilities.embodied.ceiling = 1.0;
      c.capabilities.generative.steepness = 1.5;
      c.capabilities.agentic.steepness = 1.2;
      c.capabilities.embodied.steepness = 1.0;
    },
  },
  {
    name: 'credit_sensitivity_1_high_ue',
    apply: (c) => {
      if (!c.secondOrderParams) c.secondOrderParams = {};
      c.secondOrderParams.creditSensitivity = 1.0;
      c.capabilities.generative.ceiling = 1.0;
      c.capabilities.generative.steepness = 1.5;
      c.capabilities.generative.midpointYear = 2028;
    },
  },
  {
    name: 'zero_mpc_all',
    apply: (c) => {
      c.mpcWage = 0;
      c.mpcAsset = 0;
      c.mpcTransfer = 0;
    },
  },
  {
    name: 'max_mpc_all',
    apply: (c) => {
      c.mpcWage = 1.0;
      c.mpcAsset = 1.0;
      c.mpcTransfer = 1.0;
    },
  },
  {
    name: 'negative_gdp_growth_high_inflation',
    apply: (c) => {
      c.baselineGDPGrowth = -0.03;
      c.baseInflationRate = 0.15;
    },
  },
  {
    name: 'extreme_revenue_pressure',
    apply: (c) => {
      c.revenuePressureSensitivity = 5.0;
      c.revenuePressureCap = 1.0;
      c.revenuePressureDecay = 0;
    },
  },
  {
    name: 'zero_innovation_full_automation',
    apply: (c) => {
      c.innovationRate = 0;
      c.capabilities.generative.ceiling = 1.0;
      c.capabilities.agentic.ceiling = 1.0;
      c.capabilities.embodied.ceiling = 1.0;
    },
  },
  {
    name: 'max_ubi_no_funding',
    apply: (c) => {
      c.policyConfig.ubi.enabled = true;
      c.policyConfig.ubi.monthlyAmount = { keyframes: [{ year: 2025, value: 5000 }] };
      c.policyConfig.sovereignWealthFund.enabled = false;
    },
  },
  {
    name: 'all_ceilings_zero_with_policies',
    apply: (c) => {
      c.capabilities.generative.ceiling = 0;
      c.capabilities.agentic.ceiling = 0;
      c.capabilities.embodied.ceiling = 0;
      c.policyConfig.ubi.enabled = true;
      c.policyConfig.ubi.monthlyAmount = { keyframes: [{ year: 2025, value: 2000 }] };
      c.policyConfig.minimumWage.enabled = true;
    },
  },
  {
    name: 'extreme_deflation_sensitivity',
    apply: (c) => {
      c.creditDeflationSensitivity = 0.05;
      if (!c.secondOrderParams) c.secondOrderParams = {};
      c.secondOrderParams.demandSensitivity = 3.0;
      c.capabilities.generative.ceiling = 1.0;
    },
  },
];

// ============================================================
// Stability checks on simulation output
// ============================================================

function checkStability(
  parameter: string,
  testValue: number | string,
  years: SimulationYearOutput[],
): ExtremeValueResult[] {
  const results: ExtremeValueResult[] = [];

  for (const yr of years) {
    const m = yr.macro;

    // No NaN in key fields
    const criticalFields: Array<[string, number]> = [
      ['gdpNominal', m.gdpNominal],
      ['gdpReal', m.gdpReal],
      ['consumption', m.consumption],
      ['totalEmployment', m.totalEmployment],
      ['priceLevel', m.priceLevel],
      ['consumerWelfareIndex', m.consumerWelfareIndex],
      ['totalIncome', m.totalIncome],
      ['unemploymentRate', m.unemploymentRate],
      ['corporateProfits', m.corporateProfits],
      ['medianCWI', m.medianCWI],
    ];

    for (const [field, val] of criticalFields) {
      if (!Number.isFinite(val)) {
        results.push({
          parameter,
          testValue,
          year: yr.year,
          check: `no_nan_inf_${field}`,
          passed: false,
          message: `${field}=${val} (NaN/Infinity)`,
        });
      }
    }

    // Logical bounds
    if (m.unemploymentRate < 0 || m.unemploymentRate > 1) {
      results.push({
        parameter,
        testValue,
        year: yr.year,
        check: 'ue_rate_bounds',
        passed: false,
        message: `unemploymentRate=${m.unemploymentRate} outside [0,1]`,
      });
    }

    if (m.priceLevel <= 0) {
      results.push({
        parameter,
        testValue,
        year: yr.year,
        check: 'price_level_positive',
        passed: false,
        message: `priceLevel=${m.priceLevel} ≤ 0`,
      });
    }

    if (m.consumerWelfareIndex < 0) {
      results.push({
        parameter,
        testValue,
        year: yr.year,
        check: 'cwi_nonneg',
        passed: false,
        message: `CWI=${m.consumerWelfareIndex} < 0`,
      });
    }

    const pop = m.dynamicPopulation;
    if (pop <= 0 || !Number.isFinite(pop)) {
      results.push({
        parameter,
        testValue,
        year: yr.year,
        check: 'population_positive',
        passed: false,
        message: `dynamicPopulation=${pop}`,
      });
    }
  }

  // If no failures found for this test, add a PASS entry
  if (results.length === 0) {
    results.push({
      parameter,
      testValue,
      year: 0,
      check: 'all_stability_checks',
      passed: true,
      message: 'All years passed stability checks',
    });
  }

  return results;
}

// ============================================================
// Main entry: Run extreme value sweep
// ============================================================

/**
 * Run all extreme value parameter sweeps and combination stress tests.
 * Each test creates a fresh config, overrides one parameter (or a combo),
 * runs the simulation, and checks for stability.
 */
export function runExtremeValueSweep(
  clusters: OccupationCluster[],
  blsBaselines?: Map<string, OccupationBaseline>,
): ExtremeValueResult[] {
  const allResults: ExtremeValueResult[] = [];
  let testCount = 0;

  // Single parameter sweeps
  for (const param of SINGLE_PARAM_TESTS) {
    for (const tv of param.testValues) {
      testCount++;
      const config = getDefaultSimulationConfig();
      param.apply(config, tv.value);

      try {
        const timeline = runSimulation(config, clusters, blsBaselines);
        allResults.push(...checkStability(param.name, tv.value, timeline.years));
      } catch (err) {
        allResults.push({
          parameter: param.name,
          testValue: tv.value,
          year: 0,
          check: 'no_crash',
          passed: false,
          message: `Simulation crashed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }
  }

  // Combination stress tests
  for (const combo of COMBO_TESTS) {
    testCount++;
    const config = getDefaultSimulationConfig();
    combo.apply(config);

    try {
      const timeline = runSimulation(config, clusters, blsBaselines);
      allResults.push(...checkStability(combo.name, 'combo', timeline.years));
    } catch (err) {
      allResults.push({
        parameter: combo.name,
        testValue: 'combo',
        year: 0,
        check: 'no_crash',
        passed: false,
        message: `Simulation crashed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  console.log(`  Extreme value sweep: ${testCount} parameter configurations tested`);
  return allResults;
}
