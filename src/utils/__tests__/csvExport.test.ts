/**
 * ATLAS CSV Export — Unit Tests
 *
 * Tests the full simulation results CSV export defined in
 * src/utils/csvExport.ts.  Validates column count, data types,
 * value ranges, per-cluster columns, and correctness under
 * default and non-default simulation configurations.
 *
 * All 12 test cases per docs/Import-Export-CSV-Plan.md.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { exportSimulationResultsCSV, getExpectedColumnCount } from '@/utils/csvExport';
import { getDefaultSimulationConfig, runSimulation } from '@/models/simulation';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import type { SimulationTimeline, SimulationConfig } from '@/types';

// ============================================================
// Shared fixtures — run default simulation once for most tests
// ============================================================

let defaultTimeline: SimulationTimeline;
let csvString: string;
let headerRow: string[];
let dataRows: string[][];

beforeAll(() => {
  const config = getDefaultSimulationConfig();
  defaultTimeline = runSimulation(config, OCCUPATION_CLUSTERS);
  csvString = exportSimulationResultsCSV(defaultTimeline);

  const lines = csvString.split('\n').filter((l) => l.length > 0);
  headerRow = parseCsvLine(lines[0]!);
  dataRows = lines.slice(1).map(parseCsvLine);
});

// ============================================================
// CSV line parser (handles quoted fields)
// ============================================================

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

// ============================================================
// Helper: column index lookup
// ============================================================

function colIndex(name: string): number {
  const idx = headerRow.indexOf(name);
  if (idx === -1) throw new Error(`Column "${name}" not found in header`);
  return idx;
}

function colValues(name: string): string[] {
  const idx = colIndex(name);
  return dataRows.map((row) => row[idx]!);
}

// ============================================================
// Known string-enum and potentially-empty columns
// ============================================================

/** Column names that contain string enum values (not numeric). */
const STRING_ENUM_COLUMNS = new Set([
  'cycle_phase',
  'fiscal_response_profile',
  // Phase 8b: parameter provenance columns
  'param_profile_name',
  'param_consolidation_intensity_source',
  'param_discretionary_multiplier_source',
  'param_obligation_multiplier_source',
  'param_revenue_multiplier_source',
  'param_effective_cola_factor_source',
  'param_effective_income_tax_rate_source',
  'param_effective_payroll_tax_rate_source',
  'param_effective_corporate_tax_rate_source',
  'param_effective_capital_gains_tax_rate_source',
  'param_qe_monetization_rate_source',
  'param_max_financial_repression_rate_source',
]);

/**
 * Column names that may be empty strings (e.g., trigger year when
 * no role has triggered, or timeline year fields when null).
 */
function isOptionallyEmptyColumn(name: string): boolean {
  if (name === 'timeline_depression_onset_year') return true;
  if (name === 'timeline_prep_window_open') return true;
  if (name === 'timeline_prep_window_close') return true;
  if (name === 'timeline_prep_window_duration') return true;
  if (name === 'timeline_fiscal_window_open') return true;
  if (name === 'timeline_fiscal_window_close') return true;
  if (name === 'timeline_fiscal_window_duration') return true;
  if (name === 'timeline_gdp_peak_year') return true;
  if (name === 'timeline_cycle_start_year') return true;
  if (name === 'timeline_valley_floor_year') return true;
  if (name === 'timeline_recovery_year') return true;
  if (name === 'timeline_monetary_collapse_year') return true;
  if (name.endsWith('_trigger_year')) return true;
  return false;
}

// ============================================================
// Tests
// ============================================================

describe('exportSimulationResultsCSV', () => {
  // ----------------------------------------------------------
  // 1. Export produces valid CSV with correct column count (338)
  // ----------------------------------------------------------
  it('produces valid CSV with correct column count', () => {
    const expectedCount = getExpectedColumnCount();
    expect(expectedCount).toBe(648);
    expect(headerRow.length).toBe(648);

    for (let r = 0; r < dataRows.length; r++) {
      expect(dataRows[r]!.length).toBe(648);
    }
  });

  // ----------------------------------------------------------
  // 2. Year count matches simulation range (default 2025-2050)
  // ----------------------------------------------------------
  it('has correct number of data rows matching simulation range', () => {
    const config = defaultTimeline.config;
    const expectedYears = config.endYear - config.startYear + 1; // 26
    expect(expectedYears).toBe(26);
    expect(dataRows.length).toBe(expectedYears);
  });

  // ----------------------------------------------------------
  // 3. First column is year, sequential from startYear to endYear
  // ----------------------------------------------------------
  it('has year as first column with sequential values', () => {
    expect(headerRow[0]).toBe('year');

    const config = defaultTimeline.config;
    for (let i = 0; i < dataRows.length; i++) {
      const yearValue = Number(dataRows[i]![0]);
      expect(yearValue).toBe(config.startYear + i);
    }
  });

  // ----------------------------------------------------------
  // 4. Values are numbers, not NaN or undefined
  // ----------------------------------------------------------
  it('all non-enum cells are valid numbers or valid empty trigger years', () => {
    for (let c = 0; c < headerRow.length; c++) {
      const colName = headerRow[c]!;

      // Skip the known string enum column
      if (STRING_ENUM_COLUMNS.has(colName)) continue;

      for (let r = 0; r < dataRows.length; r++) {
        const cellValue = dataRows[r]![c]!;

        // Optionally-empty columns may have '' (e.g., trigger year not yet reached)
        if (isOptionallyEmptyColumn(colName) && cellValue === '') {
          continue;
        }

        const num = Number(cellValue);
        expect(
          Number.isFinite(num),
        ).toBe(true);
      }
    }
  });

  // ----------------------------------------------------------
  // 5. Boolean columns are 0 or 1
  // ----------------------------------------------------------
  it('boolean columns contain only 0 or 1', () => {
    const booleanColumns = [
      'is_depression',
      'within_neutral_zone',
      'timeline_policy_prevents_depression',
      'fm_fiscal_dominance_active',
    ];

    for (const colName of booleanColumns) {
      const values = colValues(colName);
      for (const v of values) {
        expect(v === '0' || v === '1').toBe(true);
      }
    }
  });

  // ----------------------------------------------------------
  // 6. Per-cluster columns exist for all clusters (51 x 7)
  // ----------------------------------------------------------
  it('per-cluster columns exist for all 51 clusters with key metric suffixes', () => {
    const clusterIds = OCCUPATION_CLUSTERS.map((c) => c.id);
    expect(clusterIds.length).toBe(51);

    const suffixes = [
      '_displacement_pct',
      '_remaining_employment',
      '_trigger_year',
      '_adoption_rate',
      '_deflation_intensity',
      '_weighted_capability',
      '_effective_productivity',
    ];

    for (const clusterId of clusterIds) {
      for (const suffix of suffixes) {
        const fullName = `cluster_${clusterId}${suffix}`;
        expect(headerRow).toContain(fullName);
      }
    }
  });

  // ----------------------------------------------------------
  // 7. Capability columns are in [0, 1] range
  // ----------------------------------------------------------
  it('capability columns are in [0, 1] range', () => {
    const capColumns = [
      'capability_generative',
      'capability_agentic',
      'capability_embodied',
    ];

    for (const colName of capColumns) {
      const values = colValues(colName);
      for (const v of values) {
        const num = Number(v);
        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThanOrEqual(1);
      }
    }
  });

  // ----------------------------------------------------------
  // 8. Employment numbers are non-negative
  // ----------------------------------------------------------
  it('employment numbers are non-negative', () => {
    // Check macro-level employment columns
    const macroEmploymentCols = [
      'total_employment',
      'total_unemployment',
      'total_displaced',
    ];

    for (const colName of macroEmploymentCols) {
      const values = colValues(colName);
      for (const v of values) {
        expect(Number(v)).toBeGreaterThanOrEqual(0);
      }
    }

    // Check per-cluster remaining employment
    const clusterIds = OCCUPATION_CLUSTERS.map((c) => c.id);
    for (const clusterId of clusterIds) {
      const colName = `cluster_${clusterId}_remaining_employment`;
      const values = colValues(colName);
      for (const v of values) {
        expect(Number(v)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  // ----------------------------------------------------------
  // 9. GDP values are positive
  // ----------------------------------------------------------
  it('GDP values are positive for all years', () => {
    const gdpColumns = ['gdp_nominal', 'gdp_real'];

    for (const colName of gdpColumns) {
      const values = colValues(colName);
      for (const v of values) {
        expect(Number(v)).toBeGreaterThan(0);
      }
    }
  });

  // ----------------------------------------------------------
  // 10. Timeline summary columns are constant across all rows
  // ----------------------------------------------------------
  it('timeline summary columns are constant across all rows', () => {
    const timelineCols = [
      'timeline_depression_onset_year',
      'timeline_peak_employment_year',
      'timeline_policy_prevents_depression',
      'timeline_prep_window_open',
      'timeline_prep_window_close',
      'timeline_prep_window_duration',
      'timeline_fiscal_window_open',
      'timeline_fiscal_window_close',
      'timeline_fiscal_window_duration',
      'timeline_gdp_peak_year',
      'timeline_gdp_peak_value',
      'timeline_cycle_start_year',
      'timeline_valley_floor_year',
      'timeline_valley_depth_pct',
      'timeline_recovery_year',
    ];

    for (const colName of timelineCols) {
      const values = colValues(colName);
      // All values should be identical (constant across rows)
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(1);
    }
  });

  // ----------------------------------------------------------
  // 11. Export with non-default config produces different values
  // ----------------------------------------------------------
  it('non-default config produces different exported values', () => {
    const modifiedConfig: SimulationConfig = {
      ...getDefaultSimulationConfig(),
      capabilities: (() => {
        const defaultCaps = getDefaultSimulationConfig().capabilities;
        const modified = { ...defaultCaps };
        // Set all capability floors to 0.99 — extreme acceleration
        for (const key of Object.keys(modified) as Array<keyof typeof modified>) {
          modified[key] = { ...modified[key], floor: 0.99 };
        }
        return modified;
      })(),
    };

    const modifiedTimeline = runSimulation(modifiedConfig, OCCUPATION_CLUSTERS);
    const modifiedCsv = exportSimulationResultsCSV(modifiedTimeline);
    const modifiedLines = modifiedCsv.split('\n').filter((l) => l.length > 0);
    const modifiedDataRows = modifiedLines.slice(1).map(parseCsvLine);

    // Compare capability scores at year 0 — directly affected by the floor change.
    // Default generative floor = 0.75 → score ≈ 0.76; Modified floor = 0.99 → score ≈ 0.99.
    const capGenerativeIdx = colIndex('capability_generative');
    const defaultVal = Number(dataRows[0]![capGenerativeIdx]);
    const modifiedVal = Number(modifiedDataRows[0]![capGenerativeIdx]);

    expect(modifiedVal).toBeGreaterThan(defaultVal);
  });

  // ----------------------------------------------------------
  // 12. Export with policy enabled shows non-zero policy effects
  // ----------------------------------------------------------
  it('UBI policy enabled produces non-zero policy_transfer_addition', () => {
    const configWithUBI: SimulationConfig = {
      ...getDefaultSimulationConfig(),
      policyConfig: {
        ...getDefaultSimulationConfig().policyConfig,
        ubi: {
          ...getDefaultSimulationConfig().policyConfig.ubi,
          enabled: true,
          monthlyAmount: { keyframes: [{ year: 2025, value: 1000 }] },
        },
      },
    };

    const ubiTimeline = runSimulation(configWithUBI, OCCUPATION_CLUSTERS);
    const ubiCsv = exportSimulationResultsCSV(ubiTimeline);
    const ubiLines = ubiCsv.split('\n').filter((l) => l.length > 0);
    const ubiHeader = parseCsvLine(ubiLines[0]!);
    const ubiDataRows = ubiLines.slice(1).map(parseCsvLine);

    const transferIdx = ubiHeader.indexOf('policy_transfer_addition');
    expect(transferIdx).toBeGreaterThanOrEqual(0);

    // At least some years should have non-zero transfer addition
    const hasNonZero = ubiDataRows.some(
      (row) => Number(row[transferIdx]) !== 0,
    );
    expect(hasNonZero).toBe(true);
  });

  // ----------------------------------------------------------
  // 13. Phase 2 AI production columns exist in header
  // ----------------------------------------------------------
  it('Phase 2 AI production and new job columns exist', () => {
    const phase2Columns = [
      'total_human_new_jobs',
      'new_job_wage_income',
      'ai_additional_output',
      'ai_investment_boost',
      'ai_net_export_boost',
      'ai_consumer_goods_potential',
      'unrealized_ai_output',
    ];

    for (const colName of phase2Columns) {
      expect(headerRow).toContain(colName);
    }
  });

  // ----------------------------------------------------------
  // 14. unrealized_ai_output is always >= 0
  // ----------------------------------------------------------
  it('unrealized_ai_output is non-negative for all years', () => {
    const values = colValues('unrealized_ai_output');
    for (const v of values) {
      expect(Number(v)).toBeGreaterThanOrEqual(0);
    }
  });
});
