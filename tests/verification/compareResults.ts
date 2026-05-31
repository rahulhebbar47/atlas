/**
 * ATLAS Verification Audit — Comparison Engine
 *
 * Compares ATLAS SimulationYearOutput fields against independent VerificationYear fields.
 * Uses FIELD_MAPPINGS to extract values and tolerance-based PASS/WARN/FAIL classification.
 */

import type { SimulationYearOutput } from '@/types';
import type { VerificationYear, ComparisonResult } from './types';
import { FIELD_MAPPINGS, getComparisonStatus } from './types';

// ============================================================
// Field value extraction
// ============================================================

/**
 * Extract a value from a nested object using a dot-separated path.
 * E.g., getNestedValue(obj, 'macro.gdpNominal') → obj.macro.gdpNominal
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

// ============================================================
// Single year comparison
// ============================================================

/**
 * Compare a single VerificationYear against the corresponding ATLAS SimulationYearOutput.
 * Returns one ComparisonResult per mapped numeric field.
 */
export function compareYear(
  scenarioId: string,
  expected: VerificationYear,
  actual: SimulationYearOutput,
): ComparisonResult[] {
  const results: ComparisonResult[] = [];

  for (const mapping of FIELD_MAPPINGS) {
    const expectedValue = expected[mapping.verifyField];
    const actualValue = getNestedValue(actual as unknown as Record<string, unknown>, mapping.atlasPath);

    // Skip non-numeric fields (booleans, strings, etc.)
    if (typeof expectedValue !== 'number') continue;
    if (typeof actualValue !== 'number') {
      // Missing field in ATLAS output — treat as FAIL
      results.push({
        scenario: scenarioId,
        year: expected.year,
        field: mapping.verifyField,
        expected: expectedValue,
        actual: NaN,
        difference: NaN,
        percentError: Infinity,
        status: 'FAIL',
      });
      continue;
    }

    const difference = actualValue - expectedValue;
    const percentError = Math.abs(expectedValue) > 0
      ? Math.abs(difference) / Math.abs(expectedValue)
      : (actualValue === 0 ? 0 : 1);

    const status = getComparisonStatus(expectedValue, actualValue);

    results.push({
      scenario: scenarioId,
      year: expected.year,
      field: mapping.verifyField,
      expected: expectedValue,
      actual: actualValue,
      difference,
      percentError,
      status,
    });
  }

  return results;
}

// ============================================================
// Full scenario comparison
// ============================================================

/**
 * Compare all years of a scenario. Returns the full ComparisonResult array.
 *
 * @param scenarioId - Scenario identifier for labeling results
 * @param expectedYears - Independent verification output (one per year)
 * @param actualYears - ATLAS simulation output (one per year)
 */
export function compareScenario(
  scenarioId: string,
  expectedYears: VerificationYear[],
  actualYears: SimulationYearOutput[],
): ComparisonResult[] {
  const results: ComparisonResult[] = [];

  // Build lookup by year
  const actualByYear = new Map<number, SimulationYearOutput>();
  for (const yr of actualYears) {
    actualByYear.set(yr.year, yr);
  }

  for (const expected of expectedYears) {
    const actual = actualByYear.get(expected.year);
    if (!actual) {
      // Year missing from ATLAS output — skip with warning
      console.warn(`[compareScenario] Missing ATLAS year ${expected.year} for scenario ${scenarioId}`);
      continue;
    }
    results.push(...compareYear(scenarioId, expected, actual));
  }

  return results;
}

// ============================================================
// Multi-scenario comparison
// ============================================================

/**
 * Compare multiple scenarios at once. Returns all ComparisonResults combined.
 */
export function compareAllScenarios(
  scenarios: Array<{
    id: string;
    expectedYears: VerificationYear[];
    actualYears: SimulationYearOutput[];
  }>,
): ComparisonResult[] {
  const allResults: ComparisonResult[] = [];

  for (const scenario of scenarios) {
    allResults.push(
      ...compareScenario(scenario.id, scenario.expectedYears, scenario.actualYears),
    );
  }

  return allResults;
}
