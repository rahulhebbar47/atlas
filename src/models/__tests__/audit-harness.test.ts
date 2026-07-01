/**
 * AUDIT HARNESS — Feedback-loop root-cause audit (diagnostic, additive-only).
 *
 * Headless runSimulation() under vitest (the import.meta.glob chain forbids tsx).
 * Does NOT modify the model — golden master bit-identical. Inventories the 648
 * output columns and the per-year macro/monetary/fiscal key sets.
 *
 * Run: npx vitest run src/models/__tests__/audit-harness.test.ts
 */
import { describe, it } from 'vitest';
import { writeFileSync } from 'fs';
import { runSimulation, getDefaultSimulationConfig } from '@/models/simulation';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { loadBLSData } from '@/services/dataLoader';
import { transformOEWSToBaselines, createOtherClusterBaseline } from '@/services/dataTransform';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
import { exportSimulationResultsCSV } from '@/utils/csvExport';

function loadBaselines() {
  const bls = loadBLSData();
  if (!bls.isLoaded) throw new Error(bls.errorMessage);
  const { baselines } = transformOEWSToBaselines(
    bls.oews, OCCUPATION_CLUSTERS, DEFAULT_ROLE_ESTIMATION_CONFIG,
  );
  const other = OCCUPATION_CLUSTERS.find((c) => c.id === 'other_uncategorized');
  if (other && !baselines.has('other_uncategorized')) {
    baselines.set('other_uncategorized', createOtherClusterBaseline(baselines, other));
  }
  return baselines;
}

describe('audit harness — inventory', () => {
  it('default run + column/key inventory', () => {
    const baselines = loadBaselines();
    const config = getDefaultSimulationConfig();
    const timeline = runSimulation(config, OCCUPATION_CLUSTERS, baselines);

    const csv = exportSimulationResultsCSV(timeline);
    writeFileSync('/tmp/atlas-default.csv', csv, 'utf-8');
    const header = csv.split('\n')[0] ?? '';
    writeFileSync('/tmp/atlas-columns.txt', header.split(',').join('\n'), 'utf-8');

    const y = timeline.years[timeline.years.length - 1];
    if (!y) throw new Error('empty timeline');
    writeFileSync(
      '/tmp/atlas-macro-keys.json',
      JSON.stringify(
        {
          yearKeys: Object.keys(y),
          macro: Object.keys(y.macro),
          monetary: y.monetary ? Object.keys(y.monetary) : null,
          fiscalMonetary: y.fiscalMonetary ? Object.keys(y.fiscalMonetary) : null,
          policyEffects: y.policyEffects ? Object.keys(y.policyEffects) : null,
        },
        null,
        2,
      ),
      'utf-8',
    );

    const macroAny = (yr: typeof y) => yr.macro as unknown as Record<string, number>;
    const rows = timeline.years.map((yr) => ({
      year: yr.year,
      ueRate: macroAny(yr).unemploymentRate,
      employment: macroAny(yr).totalEmployment,
      gdpReal: macroAny(yr).gdpReal,
      gdpNominal: macroAny(yr).gdpNominal,
      gdpGrowth: macroAny(yr).gdpGrowthRate,
      cwi: macroAny(yr).consumerWelfareIndex,
      priceLevel: macroAny(yr).priceLevel,
      wagePressure: macroAny(yr).wagePressure,
    }));
    writeFileSync('/tmp/atlas-default-traj.json', JSON.stringify(rows, null, 2), 'utf-8');
    console.log('COLUMN COUNT:', header.split(',').length);
    console.log('YEARS:', timeline.years.length);
    console.log('FINAL UE RATE:', macroAny(y).unemploymentRate);
  });
});
