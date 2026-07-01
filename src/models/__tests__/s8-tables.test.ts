import { it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { computeQuintileSeries } from '@/models/quintileCWI';
import { runSimulation, getDefaultSimulationConfig } from '@/models/simulation';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { loadBLSData } from '@/services/dataLoader';
import { transformOEWSToBaselines, createOtherClusterBaseline } from '@/services/dataTransform';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
import type { CapabilityVectorId, SimulationConfig } from '@/types';
it('tables', () => {
  const bls = loadBLSData(); if (!bls.isLoaded) throw new Error('x');
  const { baselines } = transformOEWSToBaselines(bls.oews, OCCUPATION_CLUSTERS, DEFAULT_ROLE_ESTIMATION_CONFIG);
  const o = OCCUPATION_CLUSTERS.find(c => c.id === 'other_uncategorized');
  if (o && !baselines.has('other_uncategorized')) baselines.set('other_uncategorized', createOtherClusterBaseline(baselines, o));
  const flat = { floor: 0, ceiling: 0, steepness: 1.0, midpointYear: 2035 };
  const res: Record<string, unknown> = {};
  const mk = (n: string, f: (c: SimulationConfig) => void) => {
    const c = getDefaultSimulationConfig(); f(c);
    const tl = runSimulation(c, OCCUPATION_CLUSTERS, baselines);
    const q = computeQuintileSeries(tl.years);
    res[n] = [2035, 2050].map(y => { const r = q.find(x => x.year === y)!;
      return { y, idx: r.indices.map(v => +v.toFixed(3)), cwiAbs: r.cwi.map(v => +v.toFixed(0)),
        stockShel: +(r.stockShelter * 100).toFixed(1), margShel: +(r.marginalShelter * 100).toFixed(1),
        lived: +(r.livedComposite * 100).toFixed(1), fed: +(r.fedProxy * 100).toFixed(1) }; });
  };
  mk('A', c => { c.capabilities = { generative: flat, agentic: flat, embodied: flat } as Record<CapabilityVectorId, typeof flat>; });
  mk('C', () => {});
  mk('D', c => { c.policyConfig = { ...c.policyConfig,
    ubi: { ...c.policyConfig.ubi, enabled: true, monthlyAmount: { keyframes: [{ year: 2025, value: 1000 }] } },
    enhancedUI: { ...c.policyConfig.enhancedUI, enabled: true, replacementRate: { keyframes: [{ year: 2025, value: 0.70 }] } } }; });
  writeFileSync('/tmp/s8-tables.json', JSON.stringify(res, null, 1));
});
