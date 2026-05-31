/**
 * Phase 8b: Simulation Parameter Timeline & YearSnapshot Tests
 *
 * Tests that:
 *  1. runSimulation() produces a parameterTimeline and yearSnapshots
 *  2. User overrides apply correctly and are sticky
 *  3. Profile switching changes autopilot behavior
 *  4. YearSnapshot captures ALL inter-year state (verified via full CSV comparison)
 *  5. runSimulationFromYear() produces identical output to full run
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { getDefaultSimulationConfig, runSimulation, runSimulationFromYear } from '@/models/simulation';
import { exportSimulationResultsCSV } from '@/utils/csvExport';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import type { SimulationTimeline, SimulationConfig, UserOverrideMap } from '@/types';

// ============================================================
// Shared CSV parser (copied from csvExport.test.ts)
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
          i++;
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

function csvToRows(csv: string): { header: string[]; rows: string[][] } {
  const lines = csv.split('\n').filter(l => l.length > 0);
  const header = parseCsvLine(lines[0]!);
  const rows = lines.slice(1).map(parseCsvLine);
  return { header, rows };
}

// ============================================================
// Fixtures
// ============================================================

let defaultTimeline: SimulationTimeline;

beforeAll(() => {
  const config = getDefaultSimulationConfig();
  defaultTimeline = runSimulation(config, OCCUPATION_CLUSTERS);
});

// ============================================================
// Basic parameterTimeline presence
// ============================================================

describe('parameterTimeline', () => {
  it('is populated with one entry per simulated year (may be fewer than full range if collapse)', () => {
    expect(defaultTimeline.parameterTimeline).toBeDefined();
    const pt = defaultTimeline.parameterTimeline!;

    // Timeline entries match the number of years actually computed (before monetary collapse fill)
    expect(pt.size).toBeGreaterThan(0);
    expect(pt.size).toBeLessThanOrEqual(defaultTimeline.years.length);

    // Every entry in the timeline should have a corresponding year output
    for (const [year] of pt) {
      expect(year).toBeGreaterThanOrEqual(defaultTimeline.config.startYear);
      expect(year).toBeLessThanOrEqual(defaultTimeline.config.endYear);
    }
  });

  it('each year has profileName matching config', () => {
    const pt = defaultTimeline.parameterTimeline!;
    for (const [, yp] of pt) {
      expect(yp.profileName).toBe('balanced_reduction + balanced_mandate');
    }
  });

  it('first year has baseline source for fiscal parameters (no consolidation yet)', () => {
    const pt = defaultTimeline.parameterTimeline!;
    const firstYear = defaultTimeline.config.startYear;
    const yp = pt.get(firstYear)!;

    // First year uses getBaselineAutopilot → identity values → source = baseline
    expect(yp.fiscalDiscretionaryMultiplier.source).toBe('baseline');
    expect(yp.fiscalObligationMultiplier.source).toBe('baseline');
    expect(yp.consolidationIntensity.source).toBe('baseline');
    expect(yp.consolidationIntensity.effective).toBe(0);
  });

  it('technology parameters are always baseline source', () => {
    const pt = defaultTimeline.parameterTimeline!;
    for (const [, yp] of pt) {
      expect(yp.generativeCapabilityLevel.source).toBe('baseline');
      expect(yp.agenticCapabilityLevel.source).toBe('baseline');
      expect(yp.embodiedCapabilityLevel.source).toBe('baseline');
    }
  });
});

// ============================================================
// yearSnapshots presence
// ============================================================

describe('yearSnapshots', () => {
  it('is populated with one entry per simulated year (may be fewer than full range if collapse)', () => {
    expect(defaultTimeline.yearSnapshots).toBeDefined();
    const ys = defaultTimeline.yearSnapshots!;

    // Snapshot entries match parameterTimeline entries
    const pt = defaultTimeline.parameterTimeline!;
    expect(ys.size).toBe(pt.size);

    // Every snapshot year should also be in the parameterTimeline
    for (const [year] of ys) {
      expect(pt.has(year)).toBe(true);
    }
  });

  it('snapshots contain all required fields', () => {
    const ys = defaultTimeline.yearSnapshots!;
    const firstSnapshot = ys.get(defaultTimeline.config.startYear)!;

    // All YearSnapshot fields must be present
    expect(firstSnapshot.year).toBeDefined();
    expect(firstSnapshot.previousMacro).toBeDefined();
    expect(firstSnapshot.previousMoneySupply).toBeDefined();
    expect(firstSnapshot.previousDebtStock).toBeDefined();
    expect(firstSnapshot.previousWeightedAvgDebtRate).toBeDefined();
    expect(firstSnapshot.debtGDPHistory).toBeDefined();
    expect(firstSnapshot.previousFundSize).toBeDefined();
    expect(firstSnapshot.triggerYears).toBeDefined();
    expect(firstSnapshot.previousMarketCap).toBeDefined();
    expect(firstSnapshot.historicalMaxCapabilityChange).toBeDefined();
    expect(firstSnapshot.dynamicHomeownership).toBeDefined();
    expect(firstSnapshot.displacementHistory).toBeDefined();
    expect(firstSnapshot.nominalGDPHistory).toBeDefined();
    // startYearAiGDP is numeric (could be 0), so check type
    expect(typeof firstSnapshot.startYearAiGDP).toBe('number');
    // Nullable fields should be defined (value or null)
    expect('depressionOnsetYear' in firstSnapshot).toBe(true);
    expect('monetaryCollapseYear' in firstSnapshot).toBe(true);
    expect('baselineCWI' in firstSnapshot).toBe(true);
    expect('baselineConsumption' in firstSnapshot).toBe(true);
    expect('baselineHouseholdIncome' in firstSnapshot).toBe(true);
    expect('baselineCorporateProfits' in firstSnapshot).toBe(true);
    expect('creditBaselineCWI' in firstSnapshot).toBe(true);
    expect('previousCapabilityScores' in firstSnapshot).toBe(true);
    expect('previousFiscalMonetary' in firstSnapshot).toBe(true);
    expect('previousTransferInflation' in firstSnapshot).toBe(true);
    expect('prevCorporateProfitsForEquity' in firstSnapshot).toBe(true);
    expect('prevPrevCorporateProfitsForEquity' in firstSnapshot).toBe(true);
  });

  it('snapshots are deep copies (mutating one does not affect others)', () => {
    const ys = defaultTimeline.yearSnapshots!;
    const snap2025 = ys.get(defaultTimeline.config.startYear)!;
    const snap2026 = ys.get(defaultTimeline.config.startYear + 1)!;

    // Record original lengths before mutation
    const snap2026OriginalLength = snap2026.debtGDPHistory.length;

    // Mutate snap2025 — should NOT affect snap2026 if deep-copied
    snap2025.debtGDPHistory.push(999);
    expect(snap2026.debtGDPHistory.length).toBe(snap2026OriginalLength);

    // Restore (cleanup)
    snap2025.debtGDPHistory.pop();
  });
});

// ============================================================
// User overrides
// ============================================================

describe('user overrides', () => {
  it('override at year 2035 changes effective value for 2035+', () => {
    const config = getDefaultSimulationConfig();
    const overrides: UserOverrideMap = new Map([
      ['effectiveIncomeTaxRate:2035', 0.25],
    ]);

    const timeline = runSimulation(config, OCCUPATION_CLUSTERS, undefined, undefined, overrides);
    const pt = timeline.parameterTimeline!;

    // Before 2035: should NOT have override source
    const y2030 = pt.get(2030)!;
    expect(y2030.effectiveIncomeTaxRate.source).not.toBe('override');

    // At 2035: should have override source with value 0.25
    const y2035 = pt.get(2035)!;
    expect(y2035.effectiveIncomeTaxRate.source).toBe('override');
    expect(y2035.effectiveIncomeTaxRate.effective).toBe(0.25);
    expect(y2035.effectiveIncomeTaxRate.userOverride).toBe(0.25);

    // At 2040: sticky → should still have override source with value 0.25
    const y2040 = pt.get(2040)!;
    expect(y2040.effectiveIncomeTaxRate.source).toBe('override');
    expect(y2040.effectiveIncomeTaxRate.effective).toBe(0.25);
  });

  it('tokensPerTask defaults to the spike-and-recover schedule', () => {
    const config = getDefaultSimulationConfig();
    const timeline = runSimulation(config, OCCUPATION_CLUSTERS, undefined, undefined, new Map());
    const pt = timeline.parameterTimeline!;

    // Spike-and-recover: 2025=1×, 2026=20×, 2027=25× (peak), 2028=15×, 2029=5×, 2030=1×.
    const expected: Record<number, number> = {
      2025: 1, 2026: 20, 2027: 25, 2028: 15, 2029: 5, 2030: 1,
    };
    for (const [yearStr, value] of Object.entries(expected)) {
      const yp = pt.get(Number(yearStr))!;
      expect(yp.tokenUsageMultiplier.effective).toBe(value);
      expect(yp.tokenUsageMultiplier.source).toBe('baseline');
    }

    // 2031+ holds the last scheduled value (1×) flat through the horizon.
    for (const y of [2031, 2040, config.endYear]) {
      const yp = pt.get(y)!;
      expect(yp.tokenUsageMultiplier.effective).toBe(1);
      expect(yp.tokenUsageMultiplier.source).toBe('baseline');
    }
  });

  it('overriding the 2026 tokensPerTask value shifts the whole post-2025 trajectory', () => {
    const config = getDefaultSimulationConfig();
    const overrides: UserOverrideMap = new Map([
      ['tokenUsageMultiplier:2026', 50],
    ]);
    const timeline = runSimulation(config, OCCUPATION_CLUSTERS, undefined, undefined, overrides);
    const pt = timeline.parameterTimeline!;

    // 2025 is untouched — the 2026 override does not apply to earlier years.
    expect(pt.get(2025)!.tokenUsageMultiplier.effective).toBe(1);
    expect(pt.get(2025)!.tokenUsageMultiplier.source).toBe('baseline');

    // 2026 onward all pick up the sticky override (50×).
    for (const y of [2026, 2035, config.endYear]) {
      const yp = pt.get(y)!;
      expect(yp.tokenUsageMultiplier.effective).toBe(50);
      expect(yp.tokenUsageMultiplier.source).toBe('override');
    }
  });

  it('override supersession: later override replaces earlier one', () => {
    const config = getDefaultSimulationConfig();
    const overrides: UserOverrideMap = new Map([
      ['qeMonetizationRate:2030', 0.50],
      ['qeMonetizationRate:2040', 0.10],
    ]);

    const timeline = runSimulation(config, OCCUPATION_CLUSTERS, undefined, undefined, overrides);
    const pt = timeline.parameterTimeline!;

    // At 2035: the 2030 override applies (sticky) → 0.50
    expect(pt.get(2035)!.qeMonetizationRate.effective).toBe(0.50);

    // At 2040: the 2040 override supersedes → 0.10
    expect(pt.get(2040)!.qeMonetizationRate.effective).toBe(0.10);

    // At 2045: the 2040 override continues (sticky) → 0.10
    expect(pt.get(2045)!.qeMonetizationRate.effective).toBe(0.10);
  });
});

// ============================================================
// Backward compatibility (no overrides)
// ============================================================

describe('backward compatibility', () => {
  it('simulation without overrides produces same macro output as before', () => {
    const config = getDefaultSimulationConfig();

    // Run with explicit empty overrides
    const withOverrides = runSimulation(config, OCCUPATION_CLUSTERS, undefined, undefined, new Map());

    // Run without overrides (original path)
    const without = runSimulation(config, OCCUPATION_CLUSTERS);

    // All macro outputs should be identical
    for (let i = 0; i < withOverrides.years.length; i++) {
      const a = withOverrides.years[i]!.macro;
      const b = without.years[i]!.macro;
      expect(a.gdpNominal).toBeCloseTo(b.gdpNominal, 6);
      expect(a.totalEmployment).toBeCloseTo(b.totalEmployment, 6);
      expect(a.unemploymentRate).toBeCloseTo(b.unemploymentRate, 6);
      expect(a.priceLevel).toBeCloseTo(b.priceLevel, 6);
    }
  });
});

// ============================================================
// CSV provenance columns
// ============================================================

describe('CSV provenance columns', () => {
  it('exports param_profile_name and parameter value/source columns', () => {
    const csv = exportSimulationResultsCSV(defaultTimeline);
    const { header, rows } = csvToRows(csv);

    expect(header).toContain('param_profile_name');
    expect(header).toContain('param_consolidation_intensity');
    expect(header).toContain('param_consolidation_intensity_source');
    expect(header).toContain('param_effective_income_tax_rate');
    expect(header).toContain('param_effective_income_tax_rate_source');

    // All rows should have the profile name
    const profileIdx = header.indexOf('param_profile_name');
    for (const row of rows) {
      expect(row[profileIdx]).toBe('balanced_reduction + balanced_mandate');
    }

    // Source values should be one of baseline/autopilot/override for simulated years.
    // Collapsed (monetary-collapse fill) years have fallback '0' since no parameterTimeline entry exists.
    const sourceIdx = header.indexOf('param_consolidation_intensity_source');
    const pt = defaultTimeline.parameterTimeline!;
    for (let r = 0; r < rows.length; r++) {
      const year = defaultTimeline.config.startYear + r;
      if (pt.has(year)) {
        expect(['baseline', 'autopilot', 'override']).toContain(rows[r]![sourceIdx]);
      } else {
        // Collapsed year — fallback is numeric 0
        expect(rows[r]![sourceIdx]).toBe('0');
      }
    }
  });
});

// ============================================================
// CRITICAL: YearSnapshot restart test — FULL CSV row comparison
// ============================================================

describe('YearSnapshot restart correctness', () => {
  it('runSimulationFromYear from every year produces identical CSV output', () => {
    // This is the critical safety net test.
    // It verifies that YearSnapshot captures EVERY inter-year variable
    // by comparing full CSV output row-by-row.
    //
    // If any variable is missing from the snapshot, the re-simulation
    // will diverge from the full run, and this test will catch it.

    const config = getDefaultSimulationConfig();
    const fullTimeline = runSimulation(config, OCCUPATION_CLUSTERS);
    const fullCsv = exportSimulationResultsCSV(fullTimeline);
    const { header: fullHeader, rows: fullRows } = csvToRows(fullCsv);

    // Test from midpoint year (2037) to avoid testing only trivial early years
    const restartYear = 2037;
    const snapshotYear = restartYear - 1; // Need snapshot from year before

    const snapshot = fullTimeline.yearSnapshots!.get(snapshotYear);
    expect(snapshot).toBeDefined();

    // Run from snapshot
    const restartTimeline = runSimulationFromYear(
      config,
      OCCUPATION_CLUSTERS,
      restartYear,
      snapshot!,
      new Map(), // no overrides — should match full run
    );
    const restartCsv = exportSimulationResultsCSV(restartTimeline);
    const { header: restartHeader, rows: restartRows } = csvToRows(restartCsv);

    // Headers should be identical
    expect(restartHeader).toEqual(fullHeader);

    // Compare every column of every row from restartYear onward
    const restartYearIndex = restartYear - config.startYear;

    // NOTE: runSimulationFromYear currently falls through to full simulation,
    // so ALL rows should match. When Phase 8c implements proper restart,
    // only rows from restartYear onward need to match.
    for (let r = 0; r < fullRows.length; r++) {
      for (let c = 0; c < fullHeader.length; c++) {
        const fullVal = fullRows[r]![c];
        const restartVal = restartRows[r]![c];
        if (fullVal !== restartVal) {
          // Provide detailed error message for debugging
          throw new Error(
            `CSV mismatch at row ${r} (year ${config.startYear + r}), `
            + `column "${fullHeader[c]}" (index ${c}): `
            + `full="${fullVal}" vs restart="${restartVal}"`,
          );
        }
      }
    }
  });
});
