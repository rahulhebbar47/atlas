/**
 * ATLAS BLS Data Loader
 *
 * Imports static JSON files from src/data/bls/ and validates their structure.
 * These files are pre-fetched by scripts/fetch-bls-data.ts and shipped as
 * part of the build — there are NO runtime BLS API calls.
 *
 * This module runs once at app initialization (module-level in simulationStore.ts).
 *
 * If the JSON files are missing, the Vite build will fail with a clear
 * "module not found" error pointing the developer to run the fetch script.
 * Runtime validation catches malformed data.
 */

import type { BLSMetadata } from '@/types';

// ============================================================
// Raw data types — shapes of the actual JSON files
// ============================================================

/** A single data point in BLS time series data */
export interface RawBLSDataPoint {
  year: string;
  period: string;
  periodName: string;
  latest?: string;
  value: string;
  footnotes: Array<Record<string, unknown>>;
  calculations?: {
    net_changes?: Record<string, string>;
    pct_changes?: Record<string, string>;
  };
}

/** Shape of each cluster entry in oews-data.json */
export interface RawOEWSClusterData {
  clusterId: string;
  clusterName: string;
  /** SOC code → data type → data points. Data types: "01"=employment, "04"=mean wage, "13"=median wage */
  socCodes: Record<string, Record<string, RawBLSDataPoint[]>>;
}

/** Shape of cpi-data.json */
export interface RawCPIData {
  seriesID: string;
  catalog?: Record<string, string>;
  data: RawBLSDataPoint[];
}

/** Shape of total-employment.json */
export interface RawTotalEmploymentData {
  seriesID: string;
  catalog?: Record<string, string>;
  data: RawBLSDataPoint[];
}

// ============================================================
// Result types
// ============================================================

/** Raw state OEWS data: stateCode → majorSOC → data points */
export type RawStateOEWSData = Record<string, Record<string, RawBLSDataPoint[]>>;

/** Raw state LAUS data: stateCode → measure ("03"=unemployment rate, "06"=labor force) → data points */
export type RawStateLAUSData = Record<string, Record<string, RawBLSDataPoint[]>>;

export interface LoadedBLSData {
  isLoaded: true;
  oews: Record<string, RawOEWSClusterData>;
  cpi: RawCPIData;
  totalEmployment: RawTotalEmploymentData;
  metadata: BLSMetadata;
  warnings: string[];
  /** State-level data — only present if fetched with --include-states */
  stateOEWS?: RawStateOEWSData;
  stateLAUS?: RawStateLAUSData;
}

export interface BLSDataError {
  isLoaded: false;
  errorMessage: string;
}

export type BLSDataResult = LoadedBLSData | BLSDataError;

// ============================================================
// Static JSON imports (Vite resolves these at build time)
// ============================================================

import oewsRaw from '@/data/bls/oews-data.json';
import cpiRaw from '@/data/bls/cpi-data.json';
import totalEmploymentRaw from '@/data/bls/total-employment.json';
import metadataRaw from '@/data/bls/metadata.json';

// State data files are optional — may not exist if fetched without --include-states.
// We use eager glob imports so Vite doesn't fail at build time when files are missing.
const stateOEWSModules = import.meta.glob('@/data/bls/state-oews-data.json', { eager: true });
const stateLAUSModules = import.meta.glob('@/data/bls/state-laus-data.json', { eager: true });

// ============================================================
// Loader function
// ============================================================

/**
 * Load and validate all BLS data files.
 * Returns typed data if successful, or an error with developer-facing message.
 *
 * Call this once at app initialization (module-level in the store).
 */
export function loadBLSData(): BLSDataResult {
  const warnings: string[] = [];

  // Cast raw imports to expected types (Vite imports JSON as unknown shape)
  const oews = oewsRaw as unknown as Record<string, RawOEWSClusterData>;
  const cpi = cpiRaw as unknown as RawCPIData;
  const totalEmployment = totalEmploymentRaw as unknown as RawTotalEmploymentData;
  const metadata = metadataRaw as unknown as BLSMetadata;

  // Validate OEWS data structure
  if (!oews || typeof oews !== 'object') {
    return {
      isLoaded: false,
      errorMessage: 'BLS OEWS data file is invalid. Re-run: npx tsx scripts/fetch-bls-data.ts --key YOUR_KEY',
    };
  }

  const oewsKeys = Object.keys(oews);
  if (oewsKeys.length === 0) {
    return {
      isLoaded: false,
      errorMessage: 'BLS OEWS data file is empty. Re-run the fetch script.',
    };
  }

  // Check each cluster entry has expected structure
  for (const key of oewsKeys) {
    const cluster = oews[key];
    if (!cluster?.socCodes || typeof cluster.socCodes !== 'object') {
      warnings.push(`OEWS cluster "${key}" has invalid socCodes structure`);
      continue;
    }
    const socKeys = Object.keys(cluster.socCodes);
    if (socKeys.length === 0) {
      warnings.push(`OEWS cluster "${key}" has no SOC codes`);
    }
  }

  // Validate CPI data has data points
  if (!cpi?.data || !Array.isArray(cpi.data) || cpi.data.length === 0) {
    warnings.push('CPI data has no data points');
  }

  // Validate total employment data
  if (!totalEmployment?.data || !Array.isArray(totalEmployment.data) || totalEmployment.data.length === 0) {
    warnings.push('Total employment data has no data points');
  }

  // Validate metadata
  if (!metadata?.fetchedAt) {
    warnings.push('Metadata is missing fetchedAt timestamp');
  }

  // Load optional state data
  let stateOEWS: RawStateOEWSData | undefined;
  let stateLAUS: RawStateLAUSData | undefined;

  const stateOEWSModule = Object.values(stateOEWSModules)[0] as { default: unknown } | undefined;
  const stateLAUSModule = Object.values(stateLAUSModules)[0] as { default: unknown } | undefined;

  if (stateOEWSModule) {
    stateOEWS = (stateOEWSModule.default ?? stateOEWSModule) as RawStateOEWSData;
  }
  if (stateLAUSModule) {
    stateLAUS = (stateLAUSModule.default ?? stateLAUSModule) as RawStateLAUSData;
  }

  const hasStateData = !!stateOEWS && !!stateLAUS;

  console.log(
    `[ATLAS] BLS data loaded: ${oewsKeys.length} clusters, ` +
    `${metadata?.totalSeriesFetched ?? '?'} series, ` +
    `state data: ${hasStateData ? 'yes' : 'no'}, ` +
    `fetched ${metadata?.fetchedAt ?? 'unknown'}`
  );

  if (warnings.length > 0) {
    console.warn(`[ATLAS] BLS data warnings:\n  - ${warnings.join('\n  - ')}`);
  }

  return {
    isLoaded: true,
    oews,
    cpi,
    totalEmployment,
    metadata,
    warnings,
    stateOEWS,
    stateLAUS,
  };
}
