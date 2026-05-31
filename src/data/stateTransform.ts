/**
 * ATLAS State Data Transformer
 *
 * Derives state-level cluster employment distributions from state OEWS
 * (major SOC group employment) and LAUS (unemployment/labor force) data.
 *
 * Strategy (Phase 6 Architecture Decision #1):
 * Instead of fetching detailed per-occupation state data (which would exceed
 * BLS API limits), we fetch state employment by 22 major SOC groups and
 * derive cluster shares proportionally:
 *
 *   stateClusterEmployment(s, cluster) =
 *     stateSOCGroup(s, majorSOC) × (nationalCluster / nationalSOCGroup)
 *
 * This gives us a reasonable approximation of state-level occupational
 * composition using only ~1,200 series instead of ~7,000.
 *
 * All functions are PURE — no side effects, no state mutation.
 */

import type {
  StateCode,
  StateData,
  OccupationBaseline,
  OccupationClusterId,
} from '@/types';
import type { RawStateOEWSData, RawStateLAUSData, RawBLSDataPoint } from '@/services/dataLoader';
import {
  CLUSTER_TO_SOC_MAJOR_GROUP,
  STATE_NAMES,
  STATE_POPULATIONS,
  STATE_MINIMUM_WAGES_2024,
  DEFAULT_STATE_AV_REGULATORY,
} from './stateData';

// ============================================================
// Core transform function
// ============================================================

/**
 * Derive state-level occupation distributions from BLS state data.
 *
 * @param stateOEWS - State OEWS data: stateCode → majorSOC → data points
 * @param stateLAUS - State LAUS data: stateCode → measure → data points
 * @param nationalBaselines - National cluster baselines (for proportional derivation)
 * @returns Map of stateCode → StateData, plus warnings
 */
export function deriveStateOccupationDistributions(
  stateOEWS: RawStateOEWSData,
  stateLAUS: RawStateLAUSData,
  nationalBaselines: Map<string, OccupationBaseline>,
): { stateDataMap: Map<StateCode, StateData>; warnings: string[] } {
  const stateDataMap = new Map<StateCode, StateData>();
  const warnings: string[] = [];

  // Step 1: Compute national SOC group totals from national baselines
  // Sum all cluster employment within each major SOC group
  const nationalSOCGroupTotals = computeNationalSOCGroupTotals(nationalBaselines);

  // Step 2: For each state, derive per-cluster employment
  for (const [stateCode, socGroupData] of Object.entries(stateOEWS)) {
    const stateWarnings: string[] = [];

    // Parse state-level SOC group employment
    const stateSOCGroupEmployment = new Map<string, number>();
    for (const [majorSOC, dataPoints] of Object.entries(socGroupData)) {
      const value = extractLatestAnnualValue(dataPoints as RawBLSDataPoint[]);
      if (value !== null && value > 0) {
        stateSOCGroupEmployment.set(majorSOC, value);
      } else {
        // Suppressed or missing data — use 0
        stateSOCGroupEmployment.set(majorSOC, 0);
        if (value === null) {
          stateWarnings.push(`State ${stateCode}: suppressed employment for SOC group ${majorSOC}`);
        }
      }
    }

    // Derive per-cluster employment using proportional distribution
    const occupationDistribution: Record<OccupationClusterId, number> = {};

    for (const [clusterId, majorSOC] of Object.entries(CLUSTER_TO_SOC_MAJOR_GROUP)) {
      const nationalClusterEmployment = nationalBaselines.get(clusterId)?.totalEmployment ?? 0;
      const nationalSOCTotal = nationalSOCGroupTotals.get(majorSOC) ?? 0;
      const stateSOCTotal = stateSOCGroupEmployment.get(majorSOC) ?? 0;

      if (nationalSOCTotal > 0 && nationalClusterEmployment > 0) {
        // Proportional derivation:
        // state's share of this cluster = state SOC group × (national cluster / national SOC group)
        const clusterShareWithinGroup = nationalClusterEmployment / nationalSOCTotal;
        occupationDistribution[clusterId] = Math.round(stateSOCTotal * clusterShareWithinGroup);
      } else {
        occupationDistribution[clusterId] = 0;
      }
    }

    // Parse LAUS data (unemployment rate + labor force)
    const lausData = stateLAUS[stateCode];
    const unemploymentRate = lausData
      ? extractLatestAnnualValue(lausData['03'] as RawBLSDataPoint[] | undefined)
      : null;
    const laborForce = lausData
      ? extractLatestAnnualValue(lausData['06'] as RawBLSDataPoint[] | undefined)
      : null;

    if (unemploymentRate === null) {
      stateWarnings.push(`State ${stateCode}: missing LAUS unemployment rate`);
    }
    if (laborForce === null) {
      stateWarnings.push(`State ${stateCode}: missing LAUS labor force`);
    }

    const stateData: StateData = {
      code: stateCode,
      name: STATE_NAMES[stateCode] ?? stateCode,
      population: STATE_POPULATIONS[stateCode] ?? 0,
      laborForce: laborForce ?? 0,
      // LAUS unemployment rate is in percent (e.g., 3.5), convert to decimal
      baselineUnemploymentRate: unemploymentRate !== null ? unemploymentRate / 100 : 0.04,
      occupationDistribution,
      policyOverrides: {
        minimumWage: STATE_MINIMUM_WAGES_2024[stateCode],
        avRegulatoryEnvironment: DEFAULT_STATE_AV_REGULATORY[stateCode],
        roboticsRegulatoryEnvironment: DEFAULT_STATE_AV_REGULATORY[stateCode], // same default
      },
    };

    stateDataMap.set(stateCode, stateData);
    warnings.push(...stateWarnings);
  }

  return { stateDataMap, warnings };
}

// ============================================================
// Helpers
// ============================================================

/**
 * Compute total national employment per SOC major group by summing
 * all clusters that map to that group.
 */
function computeNationalSOCGroupTotals(
  nationalBaselines: Map<string, OccupationBaseline>,
): Map<string, number> {
  const totals = new Map<string, number>();

  for (const [clusterId, majorSOC] of Object.entries(CLUSTER_TO_SOC_MAJOR_GROUP)) {
    const baseline = nationalBaselines.get(clusterId);
    if (baseline) {
      const current = totals.get(majorSOC) ?? 0;
      totals.set(majorSOC, current + baseline.totalEmployment);
    }
  }

  return totals;
}

/**
 * Extract the latest annual value from BLS data points.
 * Looks for annual period ("A01") first, falls back to latest data point.
 */
function extractLatestAnnualValue(
  dataPoints: RawBLSDataPoint[] | undefined,
): number | null {
  if (!dataPoints || dataPoints.length === 0) {
    return null;
  }

  // Try annual average first
  const annualPoint = dataPoints.find(p => p.period === 'A01');
  if (annualPoint) {
    return parseBLSValue(annualPoint.value);
  }

  // LAUS data uses M13 for annual average
  const m13Point = dataPoints.find(p => p.period === 'M13');
  if (m13Point) {
    return parseBLSValue(m13Point.value);
  }

  // Fallback: use first (latest) data point
  return parseBLSValue(dataPoints[0]?.value ?? '');
}

/**
 * Parse a BLS value string. Returns null for suppressed/missing data.
 */
function parseBLSValue(value: string): number | null {
  if (!value || value === '-' || value === '**' || value === '#' || value === 'N') {
    return null;
  }
  const cleaned = value.replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Populate stateDistribution on national baselines from state data.
 * This fills the currently-empty `stateDistribution: {}` field on each
 * OccupationBaseline with the proportion of national employment in each state.
 *
 * @param baselines - National baselines (will be mutated — called once at init)
 * @param stateDataMap - State data with per-cluster employment
 */
export function populateStateDistributions(
  baselines: Map<string, OccupationBaseline>,
  stateDataMap: Map<StateCode, StateData>,
): void {
  for (const [clusterId, baseline] of baselines) {
    if (baseline.totalEmployment <= 0) continue;

    const distribution: Record<StateCode, number> = {};

    for (const [stateCode, stateData] of stateDataMap) {
      const stateClusterEmployment = stateData.occupationDistribution[clusterId] ?? 0;
      if (stateClusterEmployment > 0) {
        // Store as fraction of national total
        distribution[stateCode] = stateClusterEmployment / baseline.totalEmployment;
      }
    }

    baseline.stateDistribution = distribution;
  }
}
