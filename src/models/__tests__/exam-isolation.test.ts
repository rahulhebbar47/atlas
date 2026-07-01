/**
 * F4/OD-8 EXAMINATION — isolation runs (charter methodology).
 * Runs Scenarios A and C under: LEGACY7 (E-1/E-2/E-3 all disabled — must reproduce the Stage-7
 * snapshot), E1-only, E2-only, E3-only. The standard harness (defaults) is the COMBINED run.
 * Writes slim traces to /tmp/atlas-audit-exam/ for per-constant attribution.
 */
import { describe, it } from 'vitest';
import { writeFileSync, mkdirSync } from 'node:fs';
import { runSimulation, getDefaultSimulationConfig } from '../simulation';
import { assertKnownConfigKeys } from '@/utils/validateConfig';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { loadBLSData } from '@/services/dataLoader';
import { transformOEWSToBaselines, createOtherClusterBaseline } from '@/services/dataTransform';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
import type { SimulationConfig, CapabilityVectorId } from '@/types';

const OUT = '/tmp/atlas-audit-exam';
mkdirSync(OUT, { recursive: true });

function loadBaselines() {
  const bls = loadBLSData();
  if (!bls.isLoaded) throw new Error(bls.errorMessage);
  const { baselines } = transformOEWSToBaselines(bls.oews, OCCUPATION_CLUSTERS, DEFAULT_ROLE_ESTIMATION_CONFIG);
  const other = OCCUPATION_CLUSTERS.find((c) => c.id === 'other_uncategorized');
  if (other && !baselines.has('other_uncategorized')) {
    baselines.set('other_uncategorized', createOtherClusterBaseline(baselines, other));
  }
  return baselines;
}
const baselines = loadBaselines();

const flatCap = (floor: number) => ({ floor, ceiling: floor, steepness: 1.0, midpointYear: 2035 });
function scenarioConfig(name: 'A' | 'C'): SimulationConfig {
  const cfg = getDefaultSimulationConfig();
  if (name === 'A') {
    cfg.capabilities = {
      generative: flatCap(0), agentic: flatCap(0), embodied: flatCap(0),
    } as Record<CapabilityVectorId, typeof cfg.capabilities.generative>;
  }
  return cfg;
}

// E-toggles: LEGACY values disable each examination change.
const LEGACY: Partial<SimulationConfig> = {
  creditExpectationTurnover: 0, creditBarRealTrend: 0.02,
  assetShareDriftRate: 0, demandTrendGrowth: 0.02,
};
const VARIANTS: Record<string, Partial<SimulationConfig>> = {
  LEGACY7: { ...LEGACY },
  E1: { ...LEGACY, creditExpectationTurnover: undefined },             // E-1 on (default turnover)
  E2: { ...LEGACY, assetShareDriftRate: undefined },                   // E-2 on (derived drift)
  E3: { ...LEGACY, creditBarRealTrend: undefined, demandTrendGrowth: undefined },  // E-3 on (closed forms)
};

function slim(tl: ReturnType<typeof runSimulation>) {
  return tl.years.map((y) => {
    const m = y.macro as unknown as Record<string, number>;
    const fm = y.fiscalMonetary;
    const n = (x: unknown) => (typeof x === 'number' && isFinite(x) ? x : NaN);
    return {
      year: y.year, ueRate: n(m.unemploymentRate),
      shelterInflation: n(m.shelterInflation), compositeInflation: n(m.compositeInflation),
      priceLevel: n(m.priceLevel), gdpReal: n(m.gdpReal), gdpNominal: n(m.gdpNominal),
      demandSurvival: n(m.aggregateDemandSurvival), creditMult: n(m.consumerCreditMultiplier),
      revenuePressure: n(m.revenuePressure),
      profitShare: n(m.corporateProfits) / n(m.gdpNominal),
      landCostIndex: n(m.landCostIndex), homePriceIndex: n(m.homePriceIndex),
      afterTaxWageIncome: n(m.afterTaxWageIncome), afterTaxAssetIncome: n(m.afterTaxAssetIncome),
      afterTaxTransferIncome: n(m.afterTaxTransferIncome),
      creditBarExpectation: n(m.creditBarInflationExpectation),
      aggregateTransferIncome: n(m.aggregateTransferIncome),
      totalDeficit: n(fm?.fiscal.totalDeficit), monetizationRate: n(fm?.monetization.monetizationRate),
    };
  });
}

describe('F4/OD-8 examination — isolation runs', () => {
  for (const scen of ['A', 'C'] as const) {
    for (const [variant, overrides] of Object.entries(VARIANTS)) {
      it(`${scen} × ${variant}`, () => {
        const cfg = { ...scenarioConfig(scen) };
        for (const [k, v] of Object.entries(overrides)) {
          if (v === undefined) delete (cfg as Record<string, unknown>)[k];
          else (cfg as Record<string, unknown>)[k] = v;
        }
        assertKnownConfigKeys(cfg, 'harness');
    const tl = runSimulation(cfg, OCCUPATION_CLUSTERS, baselines);
        writeFileSync(`${OUT}/${scen}_${variant}.json`, JSON.stringify(slim(tl), null, 1));
      });
    }
  }
});
