/**
 * Credit Tightening Diagnostic — traces the consumer credit chain
 * in a zero-AI baseline to find why tightening activates.
 *
 * Reports:
 * 1. Exact inputs to computeConsumerCreditConditions at each year
 * 2. Each channel's contribution (income, collateral, systemic, inflation)
 * 3. Baseline vs current comparison
 * 4. GDP impact chain
 */
import { describe, it } from 'vitest';
import { runSimulation, getDefaultSimulationConfig } from '@/models/simulation';
import { DEFAULT_CAPABILITY_TRAJECTORIES } from '@/models/constants';
import type { SimulationConfig, SimulationYearOutput } from '@/types';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { computeConsumerCreditConditions } from '@/models/macro';
import {
  DEFAULT_TRANSFER_RELIABILITY_WEIGHT,
  DEFAULT_INCOME_ADEQUACY_SENSITIVITY,
  DEFAULT_COLLATERAL_SENSITIVITY,
  DEFAULT_SYSTEMIC_RISK_SENSITIVITY,
  DEFAULT_INFLATION_RISK_SENSITIVITY,
  DEFAULT_MAX_CONSUMER_TIGHTENING,
  DEFAULT_CONSUMER_CREDIT_IMPACT,
  ASSET_INCOME_UNDERWRITING_WEIGHT,
} from '@/models/constants';

function makeZeroAIConfig(overrides: Partial<SimulationConfig> = {}): SimulationConfig {
  const base = getDefaultSimulationConfig();
  const zeroCaps = { ...DEFAULT_CAPABILITY_TRAJECTORIES };
  for (const key of Object.keys(zeroCaps) as Array<keyof typeof zeroCaps>) {
    zeroCaps[key] = { ...zeroCaps[key], ceiling: 0 };
  }
  return { ...base, capabilities: zeroCaps, ...overrides };
}

describe('Credit Tightening Diagnostic', () => {
  it('traces consumer credit inputs for years 2025-2030', () => {
    const config = makeZeroAIConfig({
      fiscalPolicyPreset: 'no_fiscal_response' as string,
      federalReservePreset: 'balanced_mandate' as string,
    });
    const { years: timeline } = runSimulation(config, OCCUPATION_CLUSTERS);

    // Capture baseline from year 0 (2025)
    const y0 = timeline[0]!;
    const trw = config.transferReliabilityWeight ?? DEFAULT_TRANSFER_RELIABILITY_WEIGHT;
    const baselineUnderwritableIncome = (
      y0.macro.afterTaxWageIncome * 1.0
      + y0.macro.afterTaxTransferIncome * trw
      + y0.macro.afterTaxAssetIncome * ASSET_INCOME_UNDERWRITING_WEIGHT
    ) / y0.macro.priceLevel;
    const baselineCWI = y0.macro.consumerWelfareIndex;

    console.log('\n' + '='.repeat(90));
    console.log('  CREDIT TIGHTENING DIAGNOSTIC — Zero AI + No Fiscal + Balanced Mandate');
    console.log('='.repeat(90));

    console.log(`\n  STATIC BASELINE (captured at year 2025, NEVER updated):`);
    console.log(`    baselineUnderwritableIncome: $${(baselineUnderwritableIncome / 1e12).toFixed(6)}T`);
    console.log(`    baselineCWI:                 ${baselineCWI.toFixed(4)}`);
    console.log(`    afterTaxWageIncome (nom):    $${(y0.macro.afterTaxWageIncome / 1e12).toFixed(6)}T`);
    console.log(`    afterTaxTransferIncome (nom):$${(y0.macro.afterTaxTransferIncome / 1e12).toFixed(6)}T`);
    console.log(`    afterTaxAssetIncome (nom):   $${(y0.macro.afterTaxAssetIncome / 1e12).toFixed(6)}T`);
    console.log(`    priceLevel:                  ${y0.macro.priceLevel.toFixed(6)}`);
    console.log(`\n  SENSITIVITY PARAMETERS:`);
    console.log(`    incomeAdequacySensitivity:    ${DEFAULT_INCOME_ADEQUACY_SENSITIVITY}`);
    console.log(`    collateralSensitivity:        ${DEFAULT_COLLATERAL_SENSITIVITY}`);
    console.log(`    systemicRiskSensitivity:      ${DEFAULT_SYSTEMIC_RISK_SENSITIVITY}`);
    console.log(`    inflationRiskSensitivity:     ${DEFAULT_INFLATION_RISK_SENSITIVITY}`);
    console.log(`    maxConsumerTightening:        ${DEFAULT_MAX_CONSUMER_TIGHTENING}`);
    console.log(`    consumerCreditImpact:         ${DEFAULT_CONSUMER_CREDIT_IMPACT}`);
    console.log(`    transferReliabilityWeight:    ${trw}`);
    console.log(`    assetIncomeUnderwritingWt:    ${ASSET_INCOME_UNDERWRITING_WEIGHT}`);

    console.log('\n  YEAR-BY-YEAR TRACE:');
    console.log('  ' + '-'.repeat(88));

    for (let i = 0; i <= 7; i++) {
      const y = timeline[i]!;
      const prev = i > 0 ? timeline[i - 1]! : null;

      if (!prev) {
        console.log(`\n  Year ${y.year} (baseline — credit not computed, neutral)`);
        console.log(`    GDP real: $${(y.macro.gdpReal / 1e12).toFixed(4)}T`);
        console.log(`    consumerCreditTightening: ${y.macro.consumerCreditTightening?.toFixed(6) ?? '0'}`);
        console.log(`    consumerCreditMultiplier: ${y.macro.consumerCreditMultiplier?.toFixed(6) ?? '1'}`);
        continue;
      }

      // Compute inputs exactly as simulation.ts does (lines 1593-1601)
      const prevRealWage = prev.macro.afterTaxWageIncome / prev.macro.priceLevel;
      const prevRealTransfer = prev.macro.afterTaxTransferIncome / prev.macro.priceLevel;
      const prevRealAsset = prev.macro.afterTaxAssetIncome / prev.macro.priceLevel;

      const currentUnderwritable =
        prevRealWage * 1.0
        + prevRealTransfer * trw
        + prevRealAsset * ASSET_INCOME_UNDERWRITING_WEIGHT;

      const incomeAdequacyRatio = Math.min(2.0, currentUnderwritable / baselineUnderwritableIncome);
      const incomeDeficiency = Math.max(0, 1.0 - incomeAdequacyRatio);
      const incomeTightening = DEFAULT_INCOME_ADEQUACY_SENSITIVITY * incomeDeficiency;

      // CWI channel
      const prevCWI = prev.macro.consumerWelfareIndex;
      const cwiDecline = Math.max(0, 1.0 - (prevCWI / baselineCWI));
      const systemicTightening = DEFAULT_SYSTEMIC_RISK_SENSITIVITY * cwiDecline;

      // Inflation channel
      const inflationRisk = Math.max(0, prev.macro.compositeInflation - 0.03) * DEFAULT_INFLATION_RISK_SENSITIVITY;

      // Collateral channel (home prices)
      const homePriceChange = prev.macro.homePriceChangeRate ?? 0;
      let collateralTightening: number;
      if (homePriceChange < 0) {
        collateralTightening = DEFAULT_COLLATERAL_SENSITIVITY * 1.0 * Math.abs(homePriceChange);
      } else {
        collateralTightening = -DEFAULT_COLLATERAL_SENSITIVITY * 0.3 * homePriceChange;
      }

      const totalTightening = Math.min(DEFAULT_MAX_CONSUMER_TIGHTENING,
        Math.max(0, incomeTightening + collateralTightening + systemicTightening + inflationRisk));

      const ratio = totalTightening / DEFAULT_MAX_CONSUMER_TIGHTENING;
      const multiplier = Math.max(0.01, 1.0 - DEFAULT_CONSUMER_CREDIT_IMPACT * ratio);

      console.log(`\n  Year ${y.year} (uses year ${prev.year} data as inputs):`);
      console.log(`    --- Previous Year Nominal ---`);
      console.log(`    afterTaxWageIncome:    $${(prev.macro.afterTaxWageIncome / 1e12).toFixed(6)}T`);
      console.log(`    afterTaxTransferIncome:$${(prev.macro.afterTaxTransferIncome / 1e12).toFixed(6)}T`);
      console.log(`    afterTaxAssetIncome:   $${(prev.macro.afterTaxAssetIncome / 1e12).toFixed(6)}T`);
      console.log(`    priceLevel:            ${prev.macro.priceLevel.toFixed(6)}`);
      console.log(`    compositeInflation:    ${(prev.macro.compositeInflation * 100).toFixed(4)}%`);
      console.log(`    CWI:                   ${prevCWI.toFixed(4)}`);
      console.log(`    homePriceChange:       ${(homePriceChange * 100).toFixed(4)}%`);
      console.log(`    --- Computed Real Inputs ---`);
      console.log(`    prevRealWage:          $${(prevRealWage / 1e12).toFixed(6)}T`);
      console.log(`    prevRealTransfer:      $${(prevRealTransfer / 1e12).toFixed(6)}T`);
      console.log(`    prevRealAsset:         $${(prevRealAsset / 1e12).toFixed(6)}T`);
      console.log(`    currentUnderwritable:  $${(currentUnderwritable / 1e12).toFixed(6)}T`);
      console.log(`    vs baselineUnderwrit:  $${(baselineUnderwritableIncome / 1e12).toFixed(6)}T`);
      console.log(`    DRIFT from baseline:   ${((currentUnderwritable / baselineUnderwritableIncome - 1) * 100).toFixed(4)}%`);
      console.log(`    --- Channel Contributions ---`);
      console.log(`    incomeAdequacyRatio:   ${incomeAdequacyRatio.toFixed(6)} (deficiency: ${incomeDeficiency.toFixed(6)})`);
      console.log(`    Ch1 incomeTightening:  ${incomeTightening.toFixed(6)} (sensitivity=${DEFAULT_INCOME_ADEQUACY_SENSITIVITY} × deficiency)`);
      console.log(`    Ch2 collateralTight:   ${collateralTightening.toFixed(6)} (homePriceΔ=${(homePriceChange * 100).toFixed(2)}%)`);
      console.log(`    Ch3 systemicTight:     ${systemicTightening.toFixed(6)} (CWI decline=${(cwiDecline * 100).toFixed(4)}%)`);
      console.log(`    Ch3b inflationRisk:    ${inflationRisk.toFixed(6)} (inflation=${(prev.macro.compositeInflation * 100).toFixed(2)}%, threshold=3%)`);
      console.log(`    --- Totals ---`);
      console.log(`    totalTightening:       ${totalTightening.toFixed(6)} (max=${DEFAULT_MAX_CONSUMER_TIGHTENING})`);
      console.log(`    creditMultiplier:      ${multiplier.toFixed(6)} (impact=${DEFAULT_CONSUMER_CREDIT_IMPACT})`);
      console.log(`    --- Actual Simulation Output ---`);
      console.log(`    sim.consumerCreditTightening: ${y.macro.consumerCreditTightening?.toFixed(6) ?? 'N/A'}`);
      console.log(`    sim.consumerCreditMultiplier: ${y.macro.consumerCreditMultiplier?.toFixed(6) ?? 'N/A'}`);
      console.log(`    GDP real:                     $${(y.macro.gdpReal / 1e12).toFixed(4)}T`);
      console.log(`    GDP change:                   ${(((y.macro.gdpReal / prev.macro.gdpReal) - 1) * 100).toFixed(4)}%`);
      console.log(`    Unemployment:                 ${(y.macro.unemploymentRate * 100).toFixed(2)}%`);
    }
  });
});
