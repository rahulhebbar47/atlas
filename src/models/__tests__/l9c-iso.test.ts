import { describe, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { runSimulation, getDefaultSimulationConfig } from '@/models/simulation';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { loadBLSData } from '@/services/dataLoader';
import { transformOEWSToBaselines, createOtherClusterBaseline } from '@/services/dataTransform';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
import type { CapabilityVectorId } from '@/types';
describe('l9c iso', () => {
  it('modes', () => {
    const bls = loadBLSData(); if (!bls.isLoaded) throw new Error('x');
    const { baselines } = transformOEWSToBaselines(bls.oews, OCCUPATION_CLUSTERS, DEFAULT_ROLE_ESTIMATION_CONFIG);
    const o = OCCUPATION_CLUSTERS.find(c => c.id === 'other_uncategorized');
    if (o && !baselines.has('other_uncategorized')) baselines.set('other_uncategorized', createOtherClusterBaseline(baselines, o));
    const flat = { floor: 0, ceiling: 0, steepness: 1.0, midpointYear: 2035 };
    for (const [name, mode] of [['adaptive','adaptive'],['spot','spot']] as const) {
      const cfg = getDefaultSimulationConfig();
      cfg.capabilities = { generative: flat, agentic: flat, embodied: flat } as Record<CapabilityVectorId, typeof flat>;
      cfg.builderPriceMode = mode;
      const tl = runSimulation(cfg, OCCUPATION_CLUSTERS, baselines);
      const rows = tl.years.map(y => { const m = y.macro as unknown as Record<string, number>;
        return { yr: y.year, shel: m.shelterInflation, occ: m.occupancyRate, starts: m.housingStarts }; });
      writeFileSync(`/tmp/l9c-${name}.json`, JSON.stringify(rows));
    }
  });
});
