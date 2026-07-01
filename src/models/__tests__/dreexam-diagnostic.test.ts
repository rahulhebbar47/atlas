import { describe, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { runSimulation, getDefaultSimulationConfig } from '../simulation';
import { assertKnownConfigKeys } from '@/utils/validateConfig';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { loadBLSData } from '@/services/dataLoader';
import { transformOEWSToBaselines, createOtherClusterBaseline } from '@/services/dataTransform';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
import type { CapabilityVectorId, SimulationConfig } from '@/types';

describe('D re-exam diagnostic', () => {
  it('bond decomposition A/C/D + the fork pair', () => {
    const bls = loadBLSData(); if (!bls.isLoaded) throw new Error('no bls');
    const { baselines } = transformOEWSToBaselines(bls.oews, OCCUPATION_CLUSTERS, DEFAULT_ROLE_ESTIMATION_CONFIG);
    const o = OCCUPATION_CLUSTERS.find(c => c.id === 'other_uncategorized');
    if (o && !baselines.has('other_uncategorized')) baselines.set('other_uncategorized', createOtherClusterBaseline(baselines, o));
    const flat = { floor: 0, ceiling: 0, steepness: 1.0, midpointYear: 2035 };
    const mk = (name: string, mut: (c: SimulationConfig) => void) => {
      const cfg = getDefaultSimulationConfig(); mut(cfg);
      assertKnownConfigKeys(cfg, 'harness');
    const tl = runSimulation(cfg, OCCUPATION_CLUSTERS, baselines);
      const rows = tl.years.map(y => { const fm = y.fiscalMonetary; const m = y.macro as unknown as Record<string, number>;
        const mon = fm?.monetization as unknown as Record<string, unknown>;
        return { yr: y.year, tenY: fm?.bondMarket.tenYearYield, exp: fm?.bondMarket.expectedAveragePolicyRate,
          term: fm?.bondMarket.termPremium, fisc: fm?.bondMarket.fiscalRiskPremium, sup: fm?.bondMarket.supplyPressurePremium,
          pol: fm?.federalReserve.policyRate, anchor: fm?.bondMarket.marketInflationAnchor,
          mon: fm?.monetization.monetizationRate, lolr: mon?.lolrActive, yra: mon?.yieldResponseActive,
          dom: fm?.federalReserve.fiscalDominanceActive, debt: fm?.fiscal.debtGDPRatio, svc: fm?.fiscal.debtServiceRevenueRatio,
          ue: m.unemploymentRate, comp: m.compositeInflation, proxy: m.pceProxyInflation }; });
      writeFileSync(`/tmp/dreexam-${name}.json`, JSON.stringify(rows));
    };
    mk('A', c => { c.capabilities = { generative: flat, agentic: flat, embodied: flat } as Record<CapabilityVectorId, typeof flat>; });
    const mkD = (c: SimulationConfig) => {
      c.policyConfig = { ...c.policyConfig,
        ubi: { ...c.policyConfig.ubi, enabled: true, monthlyAmount: { keyframes: [{ year: 2025, value: 1000 }] } },
        enhancedUI: { ...c.policyConfig.enhancedUI, enabled: true, replacementRate: { keyframes: [{ year: 2025, value: 0.70 }] } },
      };
    };
    mk('D', mkD);
    mk('Dgrad', c => { mkD(c); c.fiscalPolicyPreset = 'gradual_stabilization'; });
  });
});
