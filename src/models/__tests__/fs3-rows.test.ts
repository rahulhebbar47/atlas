import { it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { runSimulation, getDefaultSimulationConfig } from '@/models/simulation';
import { deriveSeamCheaperThreshold } from '@/models/bfcs';
import { BASELINE_AVERAGE_ANNUAL_WAGE } from '@/models/constants';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { loadBLSData } from '@/services/dataLoader';
import { transformOEWSToBaselines, createOtherClusterBaseline } from '@/services/dataTransform';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
it('fs3 rows + margins', async () => {
  const bls = loadBLSData(); if (!bls.isLoaded) throw new Error('x');
  const { baselines } = transformOEWSToBaselines(bls.oews, OCCUPATION_CLUSTERS, DEFAULT_ROLE_ESTIMATION_CONFIG);
  const o = OCCUPATION_CLUSTERS.find(c => c.id === 'other_uncategorized');
  if (o && !baselines.has('other_uncategorized')) baselines.set('other_uncategorized', createOtherClusterBaseline(baselines, o));
  // the margins table (R1)
  const margins: Array<Record<string, unknown>> = [];
  for (const c of OCCUPATION_CLUSTERS) {
    const bl = baselines.get(c.id);
    for (const r of c.roles) {
      const w = bl?.roles?.[r.id]?.meanWage;
      if (w && w > 0) {
        const d = deriveSeamCheaperThreshold(c, r, 2025, w / BASELINE_AVERAGE_ANNUAL_WAGE);
        margins.push({ key: `${c.id}:${r.id}`, rel: +(w / BASELINE_AVERAGE_ANNUAL_WAGE).toFixed(2), ...Object.fromEntries(Object.entries(d).map(([k,v])=>[k, typeof v==='number'? +v.toFixed(3):v])) });
      } else margins.push({ key: `${c.id}:${r.id}`, proxyKept: true });
    }
  }
  writeFileSync('/tmp/fs3-margins.json', JSON.stringify(margins));
  // the rows — RE-SPECCED (CO-D2 conversions 5-6, R3b): the toggle rows come from the
  // RECORDED POLES (~/.atlas-referents/co-d2/<key>/pole.json, recorded pole-first at the
  // conversion commits), not live toggles — the keys are retired; the artifact rows keep
  // their meaning (yr/ue comparison basis vs the live run).
  const { readFileSync } = await import('node:fs');
  const { homedir } = await import('node:os');
  for (const [n, poleKey] of [['basisOnly', 'seamBasisOnly'], ['connOnly', 'legacyCheaperProxy']] as const) {
    const pole = JSON.parse(readFileSync(`${homedir()}/.atlas-referents/co-d2/${poleKey}/pole.json`, 'utf8')) as
      { rows: Array<{ year: number; unemploymentRate: number }> };
    writeFileSync(`/tmp/fs3-${n}.json`, JSON.stringify(pole.rows.map(r => ({ yr: r.year, ue: r.unemploymentRate }))));
  }
});
