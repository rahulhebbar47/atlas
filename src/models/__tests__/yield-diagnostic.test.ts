/**
 * Yield Diagnostic Test — investigates why 10Y yield at 2026 is 6.42% instead of ~4.3%.
 *
 * Runs a zero-AI + no_fiscal_response simulation and extracts all yield components
 * for years 2025 (index 0) and 2026 (index 1) to identify the source of the elevated yield.
 */
import { describe, it } from 'vitest';
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

function logYearDetails(y: SimulationYearOutput, label: string) {
  const fm = y.fiscalMonetary;
  const m = y.macro;

  console.log(`\n${'='.repeat(70)}`);
  console.log(`  ${label} — Year ${y.year}`);
  console.log(`${'='.repeat(70)}`);

  // Bond Market Components
  if (fm) {
    const bm = fm.bondMarket;
    console.log('\n--- Bond Market ---');
    console.log(`  tenYearYield:                    ${(bm.tenYearYield * 100).toFixed(4)}%`);
    console.log(`  expectedAveragePolicyRate:        ${(bm.expectedAveragePolicyRate * 100).toFixed(4)}%`);
    console.log(`  termPremium:                     ${(bm.termPremium * 100).toFixed(4)}%`);
    console.log(`  fiscalRiskPremium (composite):   ${(bm.fiscalRiskPremium * 100).toFixed(4)}%`);
    console.log(`    -> trajectoryComponent:        ${(bm.fiscalRiskTrajectoryComponent * 100).toFixed(4)}%`);
    console.log(`    -> sustainabilityComponent:    ${(bm.fiscalRiskSustainabilityComponent * 100).toFixed(4)}%`);
    console.log(`    -> levelComponent:             ${(bm.fiscalRiskLevelComponent * 100).toFixed(4)}%`);
    console.log(`  supplyPressurePremium:           ${(bm.supplyPressurePremium * 100).toFixed(4)}%`);
    console.log(`  absorptionCapacity:              ${bm.absorptionCapacity.toFixed(4)}`);
    console.log(`  foreignDemandRatio:              ${bm.foreignDemandRatio.toFixed(4)}`);
    console.log(`  consolidationCredibility:        ${bm.consolidationCredibility.toFixed(4)}`);
    console.log(`  mortgageRate:                    ${(bm.mortgageRate * 100).toFixed(4)}%`);
    console.log(`  corporateBorrowingRate:          ${(bm.corporateBorrowingRate * 100).toFixed(4)}%`);

    // Federal Reserve
    const fr = fm.federalReserve;
    console.log('\n--- Federal Reserve ---');
    console.log(`  taylorPrescribedRate:            ${(fr.taylorPrescribedRate * 100).toFixed(4)}%`);
    console.log(`  policyRate:                      ${(fr.policyRate * 100).toFixed(4)}%`);
    console.log(`  fiscalDominanceActive:           ${fr.fiscalDominanceActive}`);
    console.log(`  fiscalDominanceGap:              ${(fr.fiscalDominanceGap * 100).toFixed(4)}%`);
    console.log(`  dominanceFactor:                 ${fr.dominanceFactor.toFixed(4)}`);
    console.log(`  outputGap:                       ${(fr.outputGap * 100).toFixed(4)}%`);

    // Fiscal
    const fi = fm.fiscal;
    console.log('\n--- Fiscal ---');
    console.log(`  debtGDPRatio:                    ${fi.debtGDPRatio.toFixed(4)}`);
    console.log(`  totalDeficit:                    $${(fi.totalDeficit / 1e12).toFixed(4)}T`);
    console.log(`  primaryDeficit:                  $${(fi.primaryDeficit / 1e12).toFixed(4)}T`);
    console.log(`  interestExpense:                 $${(fi.interestExpense / 1e12).toFixed(4)}T`);
    console.log(`  federalDebtStock:                $${(fi.federalDebtStock / 1e12).toFixed(4)}T`);
    console.log(`  bookedRevenueT1:        $${(fi.bookedRevenueT1 / 1e12).toFixed(4)}T`);
    console.log(`  revenueGDPRatio:                 ${fi.revenueGDPRatio.toFixed(4)}`);
    console.log(`  debtServiceRevenueRatio:         ${fi.debtServiceRevenueRatio.toFixed(4)}`);
    console.log(`  weightedAverageDebtRate:         ${(fi.weightedAverageDebtRate * 100).toFixed(4)}%`);
    console.log(`  weightedAverageMaturity:         ${fi.weightedAverageMaturity.toFixed(2)} years`);
    console.log(`  effectiveRolloverRate:           ${fi.effectiveRolloverRate.toFixed(4)}`);
    console.log(`  consolidationIntensity:          ${fi.consolidationIntensity.toFixed(4)}`);

    // Monetization
    const mo = fm.monetization;
    console.log('\n--- Monetization ---');
    console.log(`  monetizationRate:                ${(mo.monetizationRate * 100).toFixed(4)}%`);
    console.log(`  moneyCreated:                    $${(mo.moneyCreated / 1e12).toFixed(4)}T`);
    console.log(`  bondFinancedDeficit:             $${(mo.bondFinancedDeficit / 1e12).toFixed(4)}T`);
    console.log(`  inflationFromMonetization:       ${(mo.inflationFromMonetization * 100).toFixed(4)}%`);
    console.log(`  yieldResponseActive:             ${mo.yieldResponseActive}`);
    console.log(`  yieldResponseMonetization:       ${(mo.yieldResponseMonetization * 100).toFixed(4)}%`);
    console.log(`  lolrActive:                      ${mo.lolrActive}`);
    console.log(`  lolrMonetization:                ${(mo.lolrMonetization * 100).toFixed(4)}%`);
    console.log(`  transmissionEfficiency:          ${mo.transmissionEfficiency.toFixed(4)}`);
    console.log(`  taperApplied:                    ${mo.taperApplied}`);
  }

  // Macro
  console.log('\n--- Macro ---');
  console.log(`  gdpNominal:                      $${(m.gdpNominal / 1e12).toFixed(4)}T`);
  console.log(`  gdpReal:                         $${(m.gdpReal / 1e12).toFixed(4)}T`);
  console.log(`  compositeInflation:              ${(m.compositeInflation * 100).toFixed(4)}%`);
  console.log(`  priceLevel:                      ${m.priceLevel.toFixed(6)}`);
  console.log(`  unemploymentRate:                ${(m.unemploymentRate * 100).toFixed(4)}%`);
  console.log(`  totalEmployment:                 ${(m.totalEmployment / 1e6).toFixed(2)}M`);
}

describe('Yield Diagnostic — 10Y yield decomposition', () => {
  it('Zero AI + No Fiscal Response: yield components at 2025 and 2026', () => {
    const config = makeZeroAIConfig({
      fiscalPolicyPreset: 'no_fiscal_response' as string,
    });
    const { years: timeline } = run(config);

    const y2025 = timeline[0]!;
    const y2026 = timeline[1]!;

    logYearDetails(y2025, 'BASELINE (index 0)');
    logYearDetails(y2026, 'YEAR 2026 (index 1)');

    // Yield decomposition summary
    console.log('\n' + '='.repeat(70));
    console.log('  YIELD DECOMPOSITION SUMMARY');
    console.log('='.repeat(70));

    if (y2026.fiscalMonetary) {
      const bm = y2026.fiscalMonetary.bondMarket;
      const sum = bm.expectedAveragePolicyRate + bm.termPremium + bm.fiscalRiskPremium + bm.supplyPressurePremium;
      console.log(`\n  Expected policy rate:   ${(bm.expectedAveragePolicyRate * 100).toFixed(4)}%`);
      console.log(`  + Term premium:        ${(bm.termPremium * 100).toFixed(4)}%`);
      console.log(`  + Fiscal risk premium: ${(bm.fiscalRiskPremium * 100).toFixed(4)}%`);
      console.log(`  + Supply pressure:     ${(bm.supplyPressurePremium * 100).toFixed(4)}%`);
      console.log(`  ─────────────────────────────`);
      console.log(`  = Sum of components:   ${(sum * 100).toFixed(4)}%`);
      console.log(`  Actual 10Y yield:      ${(bm.tenYearYield * 100).toFixed(4)}%`);
      console.log(`  Difference (rounding): ${((bm.tenYearYield - sum) * 100).toFixed(4)}%`);
    }

    // Debt/GDP change
    if (y2025.fiscalMonetary && y2026.fiscalMonetary) {
      const debtGDP0 = y2025.fiscalMonetary.fiscal.debtGDPRatio;
      const debtGDP1 = y2026.fiscalMonetary.fiscal.debtGDPRatio;
      console.log(`\n  Debt/GDP at 2025:      ${debtGDP0.toFixed(4)}`);
      console.log(`  Debt/GDP at 2026:      ${debtGDP1.toFixed(4)}`);
      console.log(`  Change:                ${(debtGDP1 - debtGDP0).toFixed(4)}`);
    }

    // GDP nominal change
    console.log(`\n  GDP nominal 2025:      $${(y2025.macro.gdpNominal / 1e12).toFixed(4)}T`);
    console.log(`  GDP nominal 2026:      $${(y2026.macro.gdpNominal / 1e12).toFixed(4)}T`);
    console.log(`  Growth:                ${(((y2026.macro.gdpNominal / y2025.macro.gdpNominal) - 1) * 100).toFixed(4)}%`);
  });
});
