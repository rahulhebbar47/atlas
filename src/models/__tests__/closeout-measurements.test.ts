/**
 * THE CLOSE-OUT MEASUREMENTS (the audit close-out, item 3; docs/FABLE_AUDIT_SUMMARY.md).
 *
 * THE MEASUREMENT OF RECORD (pre-fix, 2026-07-01, artifact /tmp/closeout/waw-prefix.json):
 * enhanced-UI dollars were priced at computeAggregateDisplacement().weightedAverageWage —
 * the REMAINING-workers average — while UI replaces DISPLACED workers' prior wages. In D the
 * displaced pool's prior wage ran 17–19% above that average (displacement skews up the wage
 * distribution); the attributed dollar delta peaked at $106.4B/yr @2044, $104.2B/yr at 2050,
 * path Σ ≈ $1.01T. MATERIAL → the fix branch fired (the ruled MEASURE-THEN-DECIDE).
 *
 * THE FIX (landed with this test's assertion): the UI benefit is priced at the unemployed
 * pool's composition-weighted prior wage — displaced at computeDisplacedPool().avgWage
 * (year-0 vintage, the incidence object's math), frictional remainder at the economy
 * average. Zero displacement → the blend IS the economy average (Gate-A/C bit-identity,
 * proven by the pinned referent assertions passing untouched).
 *
 * THE STANDING ATTRIBUTION ASSERTION (the guard-design principle — conservation cannot
 * catch mis-pricing): the CONSUMED price (PolicyEffects.uiPricingWage) must track the
 * displaced pool's price when the pool dominates the unemployed. A silent regression to
 * remaining-average pricing breaks the band (the pool price sits 15–19% above it in D).
 */
import { it, expect } from 'vitest';
import { writeFileSync, mkdirSync } from 'node:fs';
import { runSimulation, getDefaultSimulationConfig } from '@/models/simulation';
import { computeAggregateDisplacement } from '@/models/multipliers';
import { computeDisplacedIncidence, computeDisplacedPool } from '@/models/uiIncidence';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { loadBLSData } from '@/services/dataLoader';
import { transformOEWSToBaselines, createOtherClusterBaseline } from '@/services/dataTransform';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
import type { SimulationConfig } from '@/types';

const OUT = '/tmp/closeout';

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

it('§9 item 3 — UI pricing tracks the displaced pool (the attribution assertion) + the measurement record', () => {
  mkdirSync(OUT, { recursive: true });
  const bls = loadBLSData();
  if (!bls.isLoaded) throw new Error(bls.errorMessage);
  const { baselines } = transformOEWSToBaselines(bls.oews, OCCUPATION_CLUSTERS, DEFAULT_ROLE_ESTIMATION_CONFIG);
  const o = OCCUPATION_CLUSTERS.find(c => c.id === 'other_uncategorized');
  if (o && !baselines.has('other_uncategorized')) baselines.set('other_uncategorized', createOtherClusterBaseline(baselines, o));

  const tlD = runSimulation(dPolicy(getDefaultSimulationConfig()), OCCUPATION_CLUSTERS, baselines);
  const inc = computeDisplacedIncidence(tlD.years);
  const year0Clusters = tlD.years[0]!.clusters;

  const rows = tlD.years.map((y, i) => {
    const wAW = computeAggregateDisplacement(y.clusters).weightedAverageWage;
    const pool = computeDisplacedPool(year0Clusters, y.clusters);
    const consumed = y.policyEffects.uiPricingWage;
    const unemployed = y.macro.unemploymentRate * y.macro.dynamicLaborForce;
    const displacedShare = unemployed > 0 ? Math.min(1, pool.count / unemployed) : 0;
    return {
      year: y.year,
      wAW,
      poolWage: pool.avgWage,
      consumed,
      displacedShare,
      uiDollarsT: y.policyEffects.enhancedUIAddition / 1e12,
      // the residual the assertion gates: consumed vs the pool price, pool-dominated years
      residual: pool.avgWage > 0 ? consumed / pool.avgWage - 1 : 0,
      avgDisplacedWageIncidence: inc[i]!.avgDisplacedWage,
    };
  });

  const last = rows[rows.length - 1]!;
  const deep = rows.filter(r => r.displacedShare > 0.9);
  console.log('═══ §9 item 3 — the UI-pricing attribution assertion (post-fix) ═══');
  console.log(`  2050: consumed $${last.consumed.toFixed(0)} vs pool $${last.poolWage.toFixed(0)} (residual ${(last.residual * 100).toFixed(2)}%) vs remaining-avg $${last.wAW.toFixed(0)}; UI pool $${last.uiDollarsT.toFixed(3)}T`);
  console.log(`  pool-dominated years (share>0.9): ${deep.length}; max |residual| ${(Math.max(...deep.map(r => Math.abs(r.residual))) * 100).toFixed(2)}%`);
  writeFileSync(`${OUT}/waw.json`, JSON.stringify({ rows }, null, 1));

  // (1) year 0: no displacement → the pool is empty and pricing IS the economy average
  expect(computeDisplacedPool(year0Clusters, year0Clusters).count).toBe(0);
  expect(rows[0]!.consumed).toBe(rows[0]!.wAW);
  // (2) the pool and the incidence object agree exactly (single source of truth)
  for (let i = 0; i < rows.length; i++) {
    expect(rows[i]!.poolWage).toBeCloseTo(rows[i]!.avgDisplacedWageIncidence, 8);
  }
  // (3) THE GATE: where the displaced dominate the unemployed pool, the consumed price
  // tracks the pool price within the frictional remainder's reach (5%). A regression to
  // remaining-average pricing (15–19% below) breaks this band.
  expect(deep.length).toBeGreaterThan(5); // the binding regime is real in D
  for (const r of deep) {
    expect(Math.abs(r.residual), `year ${r.year} consumed-vs-pool`).toBeLessThan(0.05);
  }
});
