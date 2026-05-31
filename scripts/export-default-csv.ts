/**
 * Export default config simulation results to CSV.
 */

import { writeFileSync } from 'fs';
import { runSimulation, getDefaultSimulationConfig } from '../src/models/simulation';
import { OCCUPATION_CLUSTERS } from '../src/data/occupationClusters';
import { exportSimulationResultsCSV } from '../src/utils/csvExport';

const clusters = Object.values(OCCUPATION_CLUSTERS);
const config = getDefaultSimulationConfig();
const timeline = runSimulation(config, clusters);
const csv = exportSimulationResultsCSV(timeline);

const outPath = '/tmp/atlas-phase1-results.csv';
writeFileSync(outPath, csv, 'utf-8');
console.log(`CSV exported to: ${outPath}`);
