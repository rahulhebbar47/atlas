/**
 * THE FINAL CHANNEL ATTRIBUTION — Phase I evidence runs (display/measurement only; no
 * model behavior changes). Writes /tmp/final-attribution/*.json for
 * FINAL_ATTRIBUTION_EVIDENCE.md:
 *  - the fork display pair: D-default vs D-gradual (the named configuration class —
 *    capability ceilings 0.5–0.6, midpoints +5y) + the G6 no-rehire trigger inputs
 *  - the R23/CWI reconciliation inputs: C and D quintile series (indices + CWI) at 2050,
 *    the D−C price-level gap (the Q5-dissolution mechanism decomposition)
 */
import { it } from 'vitest';
import { writeFileSync, mkdirSync } from 'node:fs';
import { runSimulation, getDefaultSimulationConfig } from '@/models/simulation';
import { computeQuintileSeries } from '@/models/quintileCWI';
import { computeDisplacedIncidence } from '@/models/uiIncidence';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { loadBLSData } from '@/services/dataLoader';
import { transformOEWSToBaselines, createOtherClusterBaseline } from '@/services/dataTransform';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
import { assertKnownConfigKeys } from '@/utils/validateConfig';
import type { SimulationConfig, SimulationTimeline } from '@/types';

const OUT = '/tmp/final-attribution';

function dPolicy(cfg: SimulationConfig): SimulationConfig {
  return {
    ...cfg,
    policyConfig: {
      ...cfg.policyConfig,
      ubi: { ...cfg.policyConfig.ubi, enabled: true, monthlyAmount: { keyframes: [{ year: 2025, value: 1000 }] } },
      enhancedUI: { ...cfg.policyConfig.enhancedUI, enabled: true, replacementRate: { keyframes: [{ year: 2025, value: 0.70 }] } },
    },
  };
}

function pathRow(tl: SimulationTimeline) {
  return tl.years.map(y => ({
    year: y.year,
    ue: y.macro.unemploymentRate,
    realPostTaxIncomeT: y.macro.totalPostTaxIncome / y.macro.priceLevel / 1e12,
    priceLevel: y.macro.priceLevel,
    cwi: y.macro.consumerWelfareIndex,
    medianCWI: y.macro.medianCWI,
    tenYearYield: y.fiscalMonetary?.bondMarket.tenYearYield ?? null,
    debtService: y.fiscalMonetary?.fiscal.debtServiceRevenueRatio ?? null,
    coverage: y.macro.automationCoverage,
  }));
}

it('final attribution: the fork pair + the quintile reconciliation inputs', () => {
  mkdirSync(OUT, { recursive: true });
  const bls = loadBLSData();
  if (!bls.isLoaded) throw new Error(bls.errorMessage);
  const { baselines } = transformOEWSToBaselines(bls.oews, OCCUPATION_CLUSTERS, DEFAULT_ROLE_ESTIMATION_CONFIG);
  const o = OCCUPATION_CLUSTERS.find(c => c.id === 'other_uncategorized');
  if (o && !baselines.has('other_uncategorized')) baselines.set('other_uncategorized', createOtherClusterBaseline(baselines, o));

  // ── the fork pair (the named configuration class) ──
  const dDefault = dPolicy(getDefaultSimulationConfig());
  assertKnownConfigKeys(dDefault, 'final-attr D-default');
  const gradual = dPolicy(getDefaultSimulationConfig());
  gradual.capabilities = {
    generative: { floor: 0.10, ceiling: 0.60, steepness: 1.0, midpointYear: 2034 },
    agentic: { floor: 0.05, ceiling: 0.55, steepness: 1.0, midpointYear: 2036 },
    embodied: { floor: 0.02, ceiling: 0.50, steepness: 0.3, midpointYear: 2040 },
  };
  assertKnownConfigKeys(gradual, 'final-attr D-gradual');
  const tlDefault = runSimulation(dDefault, OCCUPATION_CLUSTERS, baselines);
  const tlGradual = runSimulation(gradual, OCCUPATION_CLUSTERS, baselines);
  writeFileSync(`${OUT}/fork.json`, JSON.stringify({
    note: 'D-default vs D-gradual (ceilings 0.60/0.55/0.50; midpoints +5y)',
    dDefault: pathRow(tlDefault),
    dGradual: pathRow(tlGradual),
  }));

  // ── the quintile reconciliation inputs (C and D on final machinery) ──
  const cCfg = getDefaultSimulationConfig();
  const tlC = runSimulation(cCfg, OCCUPATION_CLUSTERS, baselines);
  const tlD = tlDefault; // D-default IS scenario D
  const qC = computeQuintileSeries(tlC.years);
  const qD = computeQuintileSeries(tlD.years);
  const incD = computeDisplacedIncidence(tlD.years);
  const last = (a: { length: number }) => a.length - 1;
  writeFileSync(`${OUT}/quintile-reconciliation.json`, JSON.stringify({
    c2050: qC[last(qC)], d2050: qD[last(qD)],
    cPriceLevel2050: tlC.years[last(tlC.years)]!.macro.priceLevel,
    dPriceLevel2050: tlD.years[last(tlD.years)]!.macro.priceLevel,
    cIncome2050: {
      wage: tlC.years[last(tlC.years)]!.macro.afterTaxWageIncome,
      asset: tlC.years[last(tlC.years)]!.macro.afterTaxAssetIncome,
      transfer: tlC.years[last(tlC.years)]!.macro.afterTaxTransferIncome,
    },
    dIncome2050: {
      wage: tlD.years[last(tlD.years)]!.macro.afterTaxWageIncome,
      asset: tlD.years[last(tlD.years)]!.macro.afterTaxAssetIncome,
      transfer: tlD.years[last(tlD.years)]!.macro.afterTaxTransferIncome,
    },
    dIncidence2050: incD[last(incD)],
    cPath: pathRow(tlC),
    dPath: pathRow(tlD),
  }));
});
