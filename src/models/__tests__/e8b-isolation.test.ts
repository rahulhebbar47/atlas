import { describe, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { runSimulation, getDefaultSimulationConfig } from '@/models/simulation';
import { assertKnownConfigKeys } from '@/utils/validateConfig';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { loadBLSData } from '@/services/dataLoader';
import { transformOEWSToBaselines, createOtherClusterBaseline } from '@/services/dataTransform';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
import type { CapabilityVectorId } from '@/types';

const bls = loadBLSData();
if (!bls.isLoaded) throw new Error(bls.errorMessage);
const { baselines } = transformOEWSToBaselines(bls.oews, OCCUPATION_CLUSTERS, DEFAULT_ROLE_ESTIMATION_CONFIG);
const other = OCCUPATION_CLUSTERS.find((c) => c.id === 'other_uncategorized');
if (other && !baselines.has('other_uncategorized')) baselines.set('other_uncategorized', createOtherClusterBaseline(baselines, other));

const VARIANTS: Record<string, object> = {
  E7LIKE: { legacyFiscalPremium: true, pceCpiWedge: 0 },
  UNITS:  { legacyFiscalPremium: true },
  PREMIUM:{ pceCpiWedge: 0 },
  BOTH:   {},
};
describe('E-8b which-change isolation (zero-AI)', () => {
  for (const [name, ov] of Object.entries(VARIANTS)) {
    it(name, () => {
      const cfg = { ...getDefaultSimulationConfig(), ...ov };
      const flat = { floor: 0, ceiling: 0, steepness: 1.0, midpointYear: 2035 };
      cfg.capabilities = { generative: flat, agentic: flat, embodied: flat } as Record<CapabilityVectorId, typeof flat>;
      assertKnownConfigKeys(cfg, 'harness');
    const tl = runSimulation(cfg, OCCUPATION_CLUSTERS, baselines);
      const rows = tl.years.map((y) => ({ year: y.year,
        tenY: y.fiscalMonetary?.bondMarket.tenYearYield ?? 0,
        monet: y.fiscalMonetary?.monetization.monetizationRate ?? 0,
        debt: y.fiscalMonetary?.fiscal.debtGDPRatio ?? 0,
        gdpReal: y.macro.gdpReal }));
      writeFileSync(`/tmp/e8b-iso-${name}.json`, JSON.stringify(rows));
    });
  }
});
