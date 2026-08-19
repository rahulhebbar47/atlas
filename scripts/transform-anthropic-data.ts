/**
 * ATLAS — AEI (Anthropic Economic Index) Transform
 *
 * Reads the verified raw cache (.anthropic-cache/, written by fetch-anthropic-data.ts),
 * runs the pure transform (src/data/anthropic/transform.ts), validates the result, and
 * writes the committed artifacts:
 *
 *   src/data/anthropic/aei-v6-2026-06/processed.json   (first-party API population ONLY)
 *   src/data/anthropic/aei-v6-2026-06/metadata.json    (provenance: revision, sha256s, license)
 *
 * The consumer population exists behind a flag whose output goes to the gitignored
 * cache, never to src/ (the committed artifact carries API-derived values only — the
 * adopted population design decision):
 *
 *   npm run transform-anthropic                          # 1p_api → committed artifacts
 *   npm run transform-anthropic -- --population=claude_ai  # → .anthropic-cache/diagnostics/
 *
 * Every consumed file is re-hashed against the pinned manifest before parsing; every
 * schema assumption is enforced inside the transform (throw-on-mismatch).
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';
import {
  AEI_CACHE_DIR,
  AEI_LICENSE,
  AEI_DATASET_REPO,
  AEI_RELEASE_ID,
  AEI_SOURCE_COMMIT_SHA,
  AEI_SOURCE_FILES,
  cachePath,
} from './anthropic-manifest.js';
import { transformDataCalibration, AEI_EXPECTED_COLUMNS } from '../src/data/anthropic/transform';
import {
  validateDataCalibrationPayload,
  validateDataCalibrationMetadata,
} from '../src/data/anthropic/validate';
import type {
  AeiCsvRow,
  ClusterJoinSpec,
  DataCalibrationMetadata,
} from '../src/data/anthropic/types';
import { OCCUPATION_CLUSTERS } from '../src/data/occupationClusters';
import { EMBODIED_CLUSTER_ALPHA_DEFAULTS } from '../src/models/constants';
// WITHDRAWN with the threshold-anchor leg (Finding-3 design decision, 2026-08-03):
// import { getDefaultCapabilityScores } from '../src/models/capabilities';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// WITHDRAWN with the threshold-anchor leg (Finding-3 design decision, 2026-08-03) — the anchor
// evaluation year has no remaining consumer:
// const CALIBRATION_START_YEAR = 2025;

/** Observed-exposure anchors carried into the validation block (reported-only, per the
 *  adopted exposure design decision): the three headline occupations from the survey. */
const EXPOSURE_ANCHOR_SOCS: readonly string[] = ['43-4051', '43-9021', '29-2072'];

const COMMITTED_DIR = path.resolve(__dirname, '../src/data/anthropic/aei-v6-2026-06');

const POPULATION_FILES: Record<'1p_api' | 'claude_ai', string> = {
  '1p_api': 'release_2026_06_26/data/aei_1p_api_2026-06-26.csv',
  'claude_ai': 'release_2026_06_26/data/aei_claude_ai_2026-06-26.csv',
};

const POPULATION_NOTES: Record<'1p_api' | 'claude_ai', string> = {
  '1p_api': 'First-party Anthropic API usage, excluding Claude Code; global grain; shares measure conversations, not hours or economic value.',
  'claude_ai': 'Claude chat and Cowork (Free, Pro, Max); global grain only used here; shares measure conversations, not hours or economic value. DIAGNOSTIC OUTPUT — never committed.',
};

function verifyCachedFile(repoPath: string): void {
  const spec = AEI_SOURCE_FILES.find((f) => f.path === repoPath);
  if (!spec) throw new Error(`file not in the pinned manifest: ${repoPath}`);
  const target = cachePath(repoPath);
  if (!fs.existsSync(target)) {
    throw new Error(`missing cache file ${target} — run "npm run fetch-anthropic" first`);
  }
  const actual = crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');
  if (actual !== spec.sha256) {
    throw new Error(`cache file hash mismatch for ${repoPath} — re-run "npm run fetch-anthropic"`);
  }
  console.log(`  ✓ verified: ${repoPath}`);
}

/** Stream-parse the population CSV, keeping only the global-grain rows the transform
 *  consumes (overall + soc_occupation). Header is asserted against the documented set. */
function parsePopulationCsv(repoPath: string): Promise<AeiCsvRow[]> {
  return new Promise((resolve, reject) => {
    const rows: AeiCsvRow[] = [];
    let headerChecked = false;
    const stream = fs.createReadStream(cachePath(repoPath), 'utf8');
    Papa.parse<Record<string, string>>(stream, {
      header: true,
      skipEmptyLines: true,
      step: (result) => {
        if (!headerChecked) {
          const fields = result.meta.fields ?? [];
          if (JSON.stringify(fields) !== JSON.stringify(AEI_EXPECTED_COLUMNS)) {
            reject(new Error(`CSV columns diverge from the documented schema: [${fields.join(', ')}]`));
            return;
          }
          headerChecked = true;
        }
        const r = result.data;
        if (r.geo_level === 'global'
          && (r.category_name === 'overall' || r.category_name === 'soc_occupation')) {
          rows.push({
            date_start: r.date_start ?? '',
            date_end: r.date_end ?? '',
            geo_id: r.geo_id ?? '',
            geo_level: r.geo_level,
            category_name: r.category_name,
            hierarchy_level: r.hierarchy_level ?? '',
            metric_id: r.metric_id ?? '',
            value: Number(r.value),
            node_name: r.node_name ?? '',
            node_external_id: r.node_external_id ?? '',
          });
        }
      },
      complete: () => resolve(rows),
      error: (err: Error) => reject(err),
    });
  });
}

function parseExposureAnchors(): Record<string, number> {
  const raw = fs.readFileSync(cachePath('labor_market_impacts/job_exposure.csv'), 'utf8');
  const parsed = Papa.parse<Record<string, string>>(raw, { header: true, skipEmptyLines: true });
  const anchors: Record<string, number> = {};
  for (const row of parsed.data) {
    const code = row.occ_code;
    if (code !== undefined && EXPOSURE_ANCHOR_SOCS.includes(code)) {
      const value = Number(row.observed_exposure);
      if (Number.isNaN(value)) throw new Error(`non-numeric observed_exposure for ${code}`);
      anchors[code] = value;
    }
  }
  for (const soc of EXPOSURE_ANCHOR_SOCS) {
    if (!(soc in anchors)) throw new Error(`exposure anchor ${soc} not found in job_exposure.csv`);
  }
  return anchors;
}

function buildClusterJoinSpecs(): ClusterJoinSpec[] {
  const embodiedIds = new Set(Object.keys(EMBODIED_CLUSTER_ALPHA_DEFAULTS));
  return OCCUPATION_CLUSTERS.map((c) => ({
    id: c.id,
    socCodes: c.socCodes,
    isEmbodied: embodiedIds.has(c.id),
    embodiedWeight: c.capabilityRelevance.weights.embodied,
    roleIds: c.roles.map((r) => r.id),
  }));
}

async function main(): Promise<void> {
  const populationArg = process.argv.find((a) => a.startsWith('--population='));
  const populationRaw = populationArg?.split('=')[1] ?? '1p_api';
  if (populationRaw !== '1p_api' && populationRaw !== 'claude_ai') {
    throw new Error(`unknown population "${populationRaw}"`);
  }
  const population = populationRaw;

  console.log(`AEI transform — ${AEI_RELEASE_ID}, population ${population}\n`);
  const csvPath = POPULATION_FILES[population];
  verifyCachedFile(csvPath);
  verifyCachedFile('labor_market_impacts/job_exposure.csv');

  const fetchManifestPath = path.join(AEI_CACHE_DIR, 'fetch-manifest.json');
  if (!fs.existsSync(fetchManifestPath)) {
    throw new Error('fetch-manifest.json missing from cache — run "npm run fetch-anthropic" first');
  }
  const fetchManifest = JSON.parse(fs.readFileSync(fetchManifestPath, 'utf8')) as { fetchedAt: string };
  // reason: shape written by fetch-anthropic-data.ts; fetchedAt presence checked below.
  if (typeof fetchManifest.fetchedAt !== 'string') {
    throw new Error('fetch-manifest.json malformed (fetchedAt missing)');
  }

  console.log('  parsing CSV (streaming, global grain only)…');
  const rows = await parsePopulationCsv(csvPath);
  console.log(`  rows consumed: ${rows.length.toLocaleString()}`);

  const payload = transformDataCalibration({
    rows,
    specs: buildClusterJoinSpecs(),
    population,
    releaseId: AEI_RELEASE_ID,
    // capabilityScoresAtStart withdrawn with the threshold-anchor leg (Finding-3).
    validationAnchors: parseExposureAnchors(),
    observedExposureSource: 'labor_market_impacts/job_exposure.csv',
    populationNote: POPULATION_NOTES[population],
    sourceName: `Anthropic Economic Index (Hugging Face: ${AEI_DATASET_REPO})`,
  });

  const c = payload.coverage;
  console.log(`\n  overall automation (pooled): ${payload.overall.automationSharePooled}`);
  console.log(`  coverage: ${c.clustersApplied} applied + ${c.clustersInformationalCount} informational + ${c.clustersMissing.length} missing = 51`);
  console.log(`  diagnostics: ${JSON.stringify(payload.diagnostics)}`);

  if (population === '1p_api') {
    validateDataCalibrationPayload(payload);
    const metadata: DataCalibrationMetadata = {
      releaseId: AEI_RELEASE_ID,
      datasetRepo: AEI_DATASET_REPO,
      sourceCommitSha: AEI_SOURCE_COMMIT_SHA,
      fetchedAt: fetchManifest.fetchedAt,
      license: AEI_LICENSE,
      files: [...AEI_SOURCE_FILES],
    };
    validateDataCalibrationMetadata(metadata);
    fs.mkdirSync(COMMITTED_DIR, { recursive: true });
    fs.writeFileSync(path.join(COMMITTED_DIR, 'processed.json'), JSON.stringify(payload, null, 1));
    fs.writeFileSync(path.join(COMMITTED_DIR, 'metadata.json'), JSON.stringify(metadata, null, 2));
    console.log(`\n  ✅ committed artifacts written to ${COMMITTED_DIR}`);
  } else {
    const diagnosticsDir = path.join(AEI_CACHE_DIR, 'diagnostics');
    fs.mkdirSync(diagnosticsDir, { recursive: true });
    const out = path.join(diagnosticsDir, 'processed.claude_ai.json');
    fs.writeFileSync(out, JSON.stringify(payload, null, 1));
    console.log(`\n  ✅ diagnostic output (never committed): ${out}`);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
