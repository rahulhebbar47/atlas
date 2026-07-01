/** L9 Step 1 (read-only): the year-1..3 full-circle decomposition + guard status (A/B of the charter). */
import { describe, it } from 'vitest';
import { runSimulation, getDefaultSimulationConfig } from '../simulation';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { loadBLSData } from '@/services/dataLoader';
import { transformOEWSToBaselines, createOtherClusterBaseline } from '@/services/dataTransform';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
import type { CapabilityVectorId } from '@/types';

describe('L9 diagnostic', () => {
  it('prints the crash-circle decomposition', () => {
    const bls = loadBLSData();
    if (!bls.isLoaded) throw new Error(bls.errorMessage);
    const { baselines } = transformOEWSToBaselines(bls.oews, OCCUPATION_CLUSTERS, DEFAULT_ROLE_ESTIMATION_CONFIG);
    const other = OCCUPATION_CLUSTERS.find((c) => c.id === 'other_uncategorized');
    if (other && !baselines.has('other_uncategorized')) baselines.set('other_uncategorized', createOtherClusterBaseline(baselines, other));
    const cfg = getDefaultSimulationConfig();
    const flat = { floor: 0, ceiling: 0, steepness: 1.0, midpointYear: 2035 };
    cfg.capabilities = { generative: flat, agentic: flat, embodied: flat } as Record<CapabilityVectorId, typeof flat>;
    const tl = runSimulation(cfg, OCCUPATION_CLUSTERS, baselines);
    console.log('yr | L* | land | P | CC? | rent | occ% | starts(M) | 10Y | shelter% | monetRate | yieldRespActive');
    for (const y of tl.years.slice(0, 11)) {
      const m = y.macro as unknown as Record<string, number>;
      const fm = y.fiscalMonetary;
      const n=(v: number|undefined)=>v ?? NaN;
      console.log(y.year, '|', (m.landResidualTarget ?? NaN).toFixed(3), '|', n(m.landCostIndex).toFixed(3), '|',
        n(m.homePriceIndex).toFixed(3), '|', (m.constructionCostIndex ?? NaN).toFixed?.(3), '|',
        (m.rentIndex ?? NaN).toFixed?.(3), '|', (n(m.occupancyRate) * 100).toFixed(2), '|',
        (n(m.housingStarts) / 1e6).toFixed(3), '|', ((fm?.bondMarket.tenYearYield ?? 0) * 100).toFixed(2), '|',
        (n(m.shelterInflation) * 100).toFixed(2), '|', (fm?.monetization.monetizationRate ?? 0).toFixed(3), '|',
        String((fm?.monetization as unknown as Record<string, unknown>)?.yieldResponseActive ?? '?'));
    }
    const g = tl.years.map((y) => {
      const m = y.macro as unknown as Record<string, number>;
      return { yr: y.year, freeDisposal: (m.homePriceIndex ?? 1) >= 0.6 * (m.constructionCostIndex ?? 1) ? 'OK' : 'VIOLATED',
        resGap: (((m.landCostIndex ?? 1) / Math.max(1e-9, m.landResidualTarget ?? 1)) - 1).toFixed(2) };
    });
    console.log('GUARDS: freeDisposal violations:', g.filter(x => x.freeDisposal === 'VIOLATED').map(x => x.yr).join(',') || 'none');
    console.log('|L/L*−1| by 2030/2040/2050:', g.find(x=>x.yr===2030)?.resGap, g.find(x=>x.yr===2040)?.resGap, g.find(x=>x.yr===2050)?.resGap);
  });
});
