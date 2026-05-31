/**
 * ATLAS Verification Audit — Main Runner
 *
 * Usage: npx tsx tests/verification/runAudit.ts
 *
 * 1. Loads clusters + BLS baselines (direct JSON read — no Vite required)
 * 2. Runs 8 scenarios through ATLAS runSimulation()
 * 3. Runs 8 scenarios through independent runVerification()
 * 4. Compares all outputs → ComparisonResult[]
 * 5. Runs invariant checks on ATLAS outputs
 * 6. Runs extreme value sweep
 * 7. Generates AUDIT_REPORT.md
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { transformOEWSToBaselines, createOtherClusterBaseline } from '@/services/dataTransform';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
import { runSimulation } from '@/models/simulation';
import type { RawOEWSClusterData } from '@/services/dataLoader';
import type { OccupationBaseline, SimulationTimeline } from '@/types';

import { getAllScenarios } from './scenarios';
import { runVerification } from './verifyModel';
import { compareAllScenarios } from './compareResults';
import { runInvariantChecks, type InvariantCheckInput } from './invariantChecks';
import { runExtremeValueSweep } from './extremeValueSweep';
import { computeSummary, generateReport, generateIndividualReports } from './reportGenerator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..', '..');

// ============================================================
// Node-compatible Data Loading (bypasses Vite-only import.meta.glob)
// ============================================================

function loadData(): { clusters: typeof OCCUPATION_CLUSTERS; baselines: Map<string, OccupationBaseline> } {
  console.log('Loading BLS data from JSON files...');

  const oewsPath = resolve(PROJECT_ROOT, 'src/data/bls/oews-data.json');
  const oewsRaw = JSON.parse(readFileSync(oewsPath, 'utf-8'));
  const oews = oewsRaw as Record<string, RawOEWSClusterData>;

  console.log('Transforming OEWS data to baselines...');
  const transformed = transformOEWSToBaselines(
    oews,
    OCCUPATION_CLUSTERS,
    DEFAULT_ROLE_ESTIMATION_CONFIG,
  );
  const baselines = transformed.baselines;

  // Create other_uncategorized baseline if missing
  const otherCluster = OCCUPATION_CLUSTERS.find(c => c.id === 'other_uncategorized');
  if (otherCluster && !baselines.has('other_uncategorized')) {
    baselines.set('other_uncategorized', createOtherClusterBaseline(baselines, otherCluster));
  }

  if (transformed.warnings.length > 0) {
    console.log(`  BLS warnings: ${transformed.warnings.length}`);
  }

  console.log(`  Loaded ${baselines.size} cluster baselines`);
  return { clusters: OCCUPATION_CLUSTERS, baselines };
}

// ============================================================
// Main
// ============================================================

function main(): void {
  const startTime = Date.now();
  console.log('=== ATLAS Verification Audit ===\n');

  // 1. Load data
  const { clusters, baselines } = loadData();
  console.log('');

  // 2. Get all 8 scenarios
  const scenarios = getAllScenarios();
  console.log(`Running ${scenarios.length} scenarios...\n`);

  // 3. Run each scenario through ATLAS and independent verification
  const atlasResults = new Map<string, SimulationTimeline>();
  const verifyResults = new Map<string, ReturnType<typeof runVerification>>();

  for (const scenario of scenarios) {
    const t0 = Date.now();

    // ATLAS simulation
    const timeline = runSimulation(scenario.config, clusters, baselines);
    atlasResults.set(scenario.id, timeline);

    // Independent verification
    const verifiedYears = runVerification(scenario.config, clusters, baselines);
    verifyResults.set(scenario.id, verifiedYears);

    const elapsed = Date.now() - t0;
    console.log(`  ${scenario.name}: ${elapsed}ms (${timeline.years.length} years)`);
  }
  console.log('');

  // 4. Compare ATLAS vs verification
  console.log('Comparing results...');
  const comparisonInputs = scenarios.map(s => ({
    id: s.id,
    expectedYears: verifyResults.get(s.id)!,
    actualYears: atlasResults.get(s.id)!.years,
  }));
  const comparisons = compareAllScenarios(comparisonInputs);

  const passCount = comparisons.filter(c => c.status === 'PASS').length;
  const warnCount = comparisons.filter(c => c.status === 'WARN').length;
  const failCount = comparisons.filter(c => c.status === 'FAIL').length;
  console.log(`  Comparisons: ${comparisons.length} total — ${passCount} PASS, ${warnCount} WARN, ${failCount} FAIL`);
  console.log('');

  // 5. Run invariant checks
  console.log('Running invariant checks...');
  const invariantInputs: InvariantCheckInput[] = scenarios.map(s => ({
    scenarioId: s.id,
    timeline: atlasResults.get(s.id)!,
    years: atlasResults.get(s.id)!.years,
  }));
  const invariants = runInvariantChecks(invariantInputs);

  const invPass = invariants.filter(i => i.passed).length;
  const invFail = invariants.filter(i => !i.passed).length;
  console.log(`  Invariant checks: ${invariants.length} total — ${invPass} PASS, ${invFail} FAIL`);
  console.log('');

  // 6. Run extreme value sweep
  console.log('Running extreme value sweep...');
  const extremes = runExtremeValueSweep(clusters, baselines);

  const extPass = extremes.filter(e => e.passed).length;
  const extFail = extremes.filter(e => !e.passed).length;
  console.log(`  Extreme value checks: ${extremes.length} total — ${extPass} PASS, ${extFail} FAIL`);
  console.log('');

  // 7. Generate reports
  console.log('Generating reports...');
  const summary = computeSummary(comparisons, invariants, extremes);

  // Combined report
  const report = generateReport(comparisons, invariants, extremes, summary);
  const reportPath = resolve(__dirname, 'AUDIT_REPORT.md');
  writeFileSync(reportPath, report, 'utf-8');

  // Individual per-test files in results/
  const resultsDir = resolve(__dirname, 'results');
  if (!existsSync(resultsDir)) {
    mkdirSync(resultsDir, { recursive: true });
  }
  const individualReports = generateIndividualReports(
    scenarios,
    comparisons,
    invariants,
    extremes,
    summary,
  );
  for (const [filename, content] of individualReports.files) {
    writeFileSync(resolve(resultsDir, filename), content, 'utf-8');
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nReport written to: ${reportPath}`);
  console.log(`Individual reports written to: ${resultsDir}/ (${individualReports.files.size} files)`);
  console.log(`Total time: ${elapsed}s`);

  // Print headline
  const totalFails = failCount + invFail + extFail;
  if (totalFails === 0 && warnCount === 0) {
    console.log('\n*** ALL CHECKS PASSED ***');
  } else if (totalFails === 0) {
    console.log(`\n*** PASSED with ${warnCount} warnings ***`);
  } else {
    console.log(`\n*** ${totalFails} FAILURES DETECTED — see AUDIT_REPORT.md ***`);
  }

  // Exit with non-zero if failures
  if (totalFails > 0) {
    process.exit(1);
  }
}

main();
