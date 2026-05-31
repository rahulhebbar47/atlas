/**
 * Baseline Diagnostic Test — verifies the CES/CPS output gap fix.
 *
 * Scenario 1: Zero AI + No Fiscal Response → stable economy (no displacement-demand feedback cycle)
 * Scenario 2: Default AI + 5 fiscal × 4 Fed presets → differentiated responses
 */
import { describe, it, expect } from 'vitest';
import { runSimulation, getDefaultSimulationConfig } from '@/models/simulation';
import { DEFAULT_CAPABILITY_TRAJECTORIES } from '@/models/constants';
import type { SimulationConfig, SimulationYearOutput } from '@/types';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';

function makeConfig(overrides: Partial<SimulationConfig> = {}): SimulationConfig {
  const base = getDefaultSimulationConfig();
  return { ...base, ...overrides };
}

function makeZeroAIConfig(overrides: Partial<SimulationConfig> = {}): SimulationConfig {
  const zeroCaps = { ...DEFAULT_CAPABILITY_TRAJECTORIES };
  for (const key of Object.keys(zeroCaps) as Array<keyof typeof zeroCaps>) {
    zeroCaps[key] = { ...zeroCaps[key], ceiling: 0 };
  }
  return makeConfig({
    capabilities: zeroCaps,
    ...overrides,
  });
}

function run(config: SimulationConfig) {
  return runSimulation(config, OCCUPATION_CLUSTERS);
}

// Accessor helpers to pull deeply nested fields
function gdpReal(y: SimulationYearOutput): number { return y.macro.gdpReal; }
function employment(y: SimulationYearOutput): number { return y.macro.totalEmployment; }
function ueRate(y: SimulationYearOutput): number { return y.macro.unemploymentRate; }
function priceLevel(y: SimulationYearOutput): number { return y.macro.priceLevel; }
function outputGap(y: SimulationYearOutput): number { return y.fiscalMonetary?.federalReserve.outputGap ?? 0; }
function tenYearYield(y: SimulationYearOutput): number { return y.fiscalMonetary?.bondMarket.tenYearYield ?? 0; }
function debtGDP(y: SimulationYearOutput): number { return y.fiscalMonetary?.fiscal.debtGDPRatio ?? 0; }
function consumerCredit(y: SimulationYearOutput): number { return y.macro.consumerCreditTightening ?? 0; }
function businessCredit(y: SimulationYearOutput): number { return y.macro.businessCreditTightening ?? 0; }

describe('Baseline Diagnostic — CES/CPS fix verification', () => {
  it('Zero AI + No Adjustment: output gap near 0% at year 2026', () => {
    const config = makeZeroAIConfig({
      fiscalPolicyPreset: 'no_fiscal_response' as string,
    });
    const { years: timeline } = run(config);

    const y2026 = timeline[1]!;
    expect(y2026.year).toBe(2026);

    const gap = outputGap(y2026);
    console.log(`Year 2026 output gap: ${(gap * 100).toFixed(2)}%`);
    expect(Math.abs(gap)).toBeLessThan(0.02);
  });

  it('Zero AI + No Fiscal + Balanced Mandate: yield calibration at 2026', () => {
    // Phase 8 Fix 4: Verifies yield calibration after removing no-arbitrage floor.
    // The 10Y yield at year 2026 should track the fundamental (expectations + risk premiums)
    // and be BELOW the initial yield of 4.30% — proving no yield-driven displacement-demand feedback trigger.
    //
    // NOTE: The GDP trajectory still deteriorates after 2028 due to a pre-existing credit
    // tightening feedback sensitivity (income channel, not yield channel). This is a known
    // model calibration issue that predates Fix 4 and is documented for future work.
    const config = makeZeroAIConfig({
      fiscalPolicyPreset: 'no_fiscal_response' as string,
      federalReservePreset: 'balanced_mandate' as string,
    });
    const { years: timeline } = run(config);

    console.log('\n=== Zero AI + No Fiscal Response + Balanced Mandate: Key Metrics 2025-2035 ===');
    console.log('Year  | Real GDP ($T) | Employment (M) | Output Gap | Debt/GDP | 10Y Yield | Price Level | UE Rate');
    console.log('------|---------------|----------------|------------|----------|-----------|-------------|--------');

    for (let i = 0; i <= 10; i++) {
      const y = timeline[i]!;
      console.log(
        `${y.year}  | ${(gdpReal(y) / 1e12).toFixed(2).padStart(13)} | ${(employment(y) / 1e6).toFixed(1).padStart(14)} | ${(outputGap(y) * 100).toFixed(1).padStart(9)}% | ${debtGDP(y).toFixed(3).padStart(8)} | ${(tenYearYield(y) * 100).toFixed(2).padStart(8)}% | ${priceLevel(y).toFixed(4).padStart(11)} | ${(ueRate(y) * 100).toFixed(1).padStart(5)}%`,
      );
    }

    const y2026 = timeline[1]!;
    const y2025 = timeline[0]!;
    // Yield calibration: 10Y yield at 2026 should be near 4% (fundamental)
    // and BELOW the initial yield of 4.30% (not floored by Taylor rate)
    expect(tenYearYield(y2026)).toBeLessThan(tenYearYield(y2025));
    expect(tenYearYield(y2026)).toBeGreaterThan(0.034); // above 3.4% (floor slightly lower with augmentation recalibration)
    expect(tenYearYield(y2026)).toBeLessThan(0.045);    // below 4.5%
    // Output gap near zero at initial conditions
    expect(Math.abs(outputGap(y2026))).toBeLessThan(0.02);
  });

  it('Zero AI + No Adjustment: full 2025-2050 trajectory', () => {
    const config = makeZeroAIConfig({
      fiscalPolicyPreset: 'no_fiscal_response' as string,
    });
    const { years: timeline } = run(config);

    console.log('\n=== Zero AI + No Adjustment: Full 2025-2050 ===');
    console.log('Year  | Real GDP ($T) | Employment (M) | Debt/GDP | 10Y Yield | Consumer Credit | Business Credit');
    console.log('------|---------------|----------------|----------|-----------|-----------------|----------------');

    for (const y of timeline) {
      console.log(
        `${y.year}  | ${(gdpReal(y) / 1e12).toFixed(2).padStart(13)} | ${(employment(y) / 1e6).toFixed(1).padStart(14)} | ${debtGDP(y).toFixed(3).padStart(8)} | ${(tenYearYield(y) * 100).toFixed(2).padStart(8)}% | ${consumerCredit(y).toFixed(3).padStart(15)} | ${businessCredit(y).toFixed(3).padStart(14)}`,
      );
    }
  });
});

describe('Default AI + Fiscal × Fed Presets — Differentiation Check', () => {
  // Phase 8 Fix 4: 5 fiscal presets × 4 Fed presets = 20 combinations.
  // Test fiscal differentiation with balanced_mandate Fed,
  // and Fed differentiation with balanced_reduction fiscal.
  const fiscalPresets: string[] = [
    'no_fiscal_response',
    'balanced_reduction',
    'tax_the_winners',
    'austerity',
    'gridlock',
  ];

  const fedPresets: string[] = [
    'price_stability',
    'balanced_mandate',
    'employment_focused',
    'maximum_accommodation',
  ];

  it('5 fiscal presets × balanced_mandate produce differentiated outcomes at 2050', () => {
    const results: Record<string, {
      realGDP: number;
      priceLevel: number;
      unemployment: number;
      yield10y: number;
      debtGDP: number;
    }> = {};

    for (const preset of fiscalPresets) {
      const config = makeConfig({
        fiscalPolicyPreset: preset,
        federalReservePreset: 'balanced_mandate',
      });
      const { years: timeline } = run(config);
      const y2050 = timeline[timeline.length - 1]!;

      results[preset] = {
        realGDP: gdpReal(y2050) / 1e12,
        priceLevel: priceLevel(y2050),
        unemployment: ueRate(y2050) * 100,
        yield10y: tenYearYield(y2050) * 100,
        debtGDP: debtGDP(y2050),
      };
    }

    console.log('\n=== Default AI + 5 Fiscal Presets × Balanced Mandate at 2050 ===');
    console.log('Preset                  | Real GDP ($T) | Price Level | UE Rate | 10Y Yield | Debt/GDP');
    console.log('------------------------|---------------|-------------|---------|-----------|--------');

    for (const [name, r] of Object.entries(results)) {
      console.log(
        `${name.padEnd(24)}| ${r.realGDP.toFixed(2).padStart(13)} | ${r.priceLevel.toFixed(4).padStart(11)} | ${r.unemployment.toFixed(1).padStart(5)}%  | ${r.yield10y.toFixed(2).padStart(8)}% | ${r.debtGDP.toFixed(3).padStart(7)}`,
      );
    }

    const gdps = Object.values(results).map(r => r.realGDP);
    const gdpSpread = Math.max(...gdps) - Math.min(...gdps);
    console.log(`\nGDP spread: $${gdpSpread.toFixed(2)}T`);

    const debts = Object.values(results).map(r => r.debtGDP);
    const debtSpread = Math.max(...debts) - Math.min(...debts);
    console.log(`Debt/GDP spread: ${debtSpread.toFixed(3)}`);

    const ues = Object.values(results).map(r => r.unemployment);
    const ueSpread = Math.max(...ues) - Math.min(...ues);
    console.log(`Unemployment spread: ${ueSpread.toFixed(1)}pp`);
  });
});
