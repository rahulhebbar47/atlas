import { describe, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { runSimulation, getDefaultSimulationConfig } from '../simulation';
import { assertKnownConfigKeys } from '@/utils/validateConfig';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { loadBLSData } from '@/services/dataLoader';
import { transformOEWSToBaselines, createOtherClusterBaseline } from '@/services/dataTransform';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
import type { CapabilityVectorId } from '@/types';
describe('LLAG diagnostic', () => {
  it('spot-P counterfactual', () => {
    const bls = loadBLSData(); if (!bls.isLoaded) throw new Error('no bls');
    const { baselines } = transformOEWSToBaselines(bls.oews, OCCUPATION_CLUSTERS, DEFAULT_ROLE_ESTIMATION_CONFIG);
    const o = OCCUPATION_CLUSTERS.find(c => c.id === 'other_uncategorized');
    if (o && !baselines.has('other_uncategorized')) baselines.set('other_uncategorized', createOtherClusterBaseline(baselines, o));
    const cfg = getDefaultSimulationConfig();
    const flat = { floor: 0, ceiling: 0, steepness: 1.0, midpointYear: 2035 };
    cfg.capabilities = { generative: flat, agentic: flat, embodied: flat } as Record<CapabilityVectorId, typeof flat>;
    cfg.diagSpotBuilderPrice = true;
    assertKnownConfigKeys(cfg, 'harness');
    const tl = runSimulation(cfg, OCCUPATION_CLUSTERS, baselines);
    const rows = tl.years.map(y => { const m = y.macro as unknown as Record<string, number>;
      return { yr: y.year, occ: m.occupancyRate, starts: m.housingStarts, shel: m.shelterInflation,
        comp: m.compositeInflation, tenY: y.fiscalMonetary?.bondMarket.tenYearYield ?? 0,
        svc: m.debtServiceRevenueRatio ?? (y.fiscalMonetary?.fiscal as unknown as Record<string,number>)?.debtServiceRevenueRatio ?? 0,
        mon: y.fiscalMonetary?.monetization.monetizationRate ?? 0 }; });
    writeFileSync('/tmp/llag-spotP.json', JSON.stringify(rows));
  });
});
