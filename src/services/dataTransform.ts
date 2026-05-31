/**
 * ATLAS BLS Data Transformer
 *
 * Transforms raw BLS OEWS JSON data into the model's OccupationBaseline format.
 * Runs once at app initialization (called from simulationStore.ts).
 *
 * Key operations:
 *   1. Reconcile OEWS JSON cluster IDs with canonical cluster IDs (via socMapping.ts)
 *   2. Aggregate SOC codes within each cluster (sum employment, weighted-average wages)
 *   3. Estimate role-level breakdown from cluster-level data
 *   4. Estimate wage percentiles from mean/median spread
 *   5. Transform CPI and total employment data
 *
 * All functions are PURE — no side effects, no state mutation.
 */

import type { OccupationBaseline, OccupationCluster } from '@/types';
import type { RawOEWSClusterData, RawCPIData, RawTotalEmploymentData, RawBLSDataPoint } from './dataLoader';
import { resolveCanonicalClusterId, resolveOEWSKey, CLUSTERS_WITHOUT_BLS_DATA } from '@/data/socMapping';
import type { RoleEstimationConfig } from '@/data/roleEstimation';
import { BASELINE_TOTAL_EMPLOYMENT, BASELINE_AVERAGE_ANNUAL_WAGE } from '@/models/constants';

// ============================================================
// Intermediate types
// ============================================================

/** Per-SOC aggregated data (intermediate format) */
interface SOCAggregation {
  socCode: string;
  employment: number;
  meanWage: number;
  medianWage: number;
  dataYear: string;
  warnings: string[];
}

/** Cluster-level aggregation before role breakdown */
interface ClusterAggregation {
  canonicalClusterId: string;
  totalEmployment: number;
  weightedMeanWage: number;
  weightedMedianWage: number;
  dataYear: string;
  socDetails: SOCAggregation[];
  warnings: string[];
}

// ============================================================
// Core transform functions
// ============================================================

/**
 * Transform all OEWS data into OccupationBaseline records.
 *
 * @param oewsData - Raw OEWS JSON (keyed by fetch-script cluster IDs)
 * @param clusters - The canonical occupation cluster definitions
 * @param roleParams - Parameters for role-level breakdown estimation
 * @returns Map of canonical cluster ID → OccupationBaseline, plus warnings
 */
export function transformOEWSToBaselines(
  oewsData: Record<string, RawOEWSClusterData>,
  clusters: OccupationCluster[],
  roleParams: RoleEstimationConfig,
): { baselines: Map<string, OccupationBaseline>; warnings: string[] } {
  const baselines = new Map<string, OccupationBaseline>();
  const allWarnings: string[] = [];

  // Build a lookup: canonical ID → OEWS key
  // The OEWS data is keyed by the fetch script's cluster IDs
  const oewsByCanonicalId = new Map<string, RawOEWSClusterData>();

  for (const [oewsKey, clusterData] of Object.entries(oewsData)) {
    const canonicalId = resolveCanonicalClusterId(oewsKey);
    oewsByCanonicalId.set(canonicalId, clusterData);
  }

  // Process each canonical cluster
  for (const cluster of clusters) {
    // Skip clusters with no BLS data
    if (CLUSTERS_WITHOUT_BLS_DATA.includes(cluster.id)) {
      allWarnings.push(`Cluster "${cluster.id}" (${cluster.name}): no BLS data available (cross-cutting SOC codes)`);
      continue;
    }

    const oewsCluster = oewsByCanonicalId.get(cluster.id);
    if (!oewsCluster) {
      allWarnings.push(`Cluster "${cluster.id}" (${cluster.name}): no OEWS data found`);
      continue;
    }

    // Aggregate SOC codes for this cluster
    const aggregation = aggregateSOCCodes(oewsCluster, cluster.id);
    allWarnings.push(...aggregation.warnings);

    if (aggregation.totalEmployment === 0) {
      allWarnings.push(`Cluster "${cluster.id}": zero total employment after aggregation — skipping`);
      continue;
    }

    // Estimate role-level breakdown
    const baseline = estimateRoleBreakdown(aggregation, cluster, roleParams);
    baselines.set(cluster.id, baseline);
  }

  return { baselines, warnings: allWarnings };
}

/**
 * Aggregate multiple SOC codes within a single cluster.
 * Sums employment, computes employment-weighted average wages.
 */
export function aggregateSOCCodes(
  clusterData: RawOEWSClusterData,
  canonicalId: string,
): ClusterAggregation {
  const socDetails: SOCAggregation[] = [];
  const warnings: string[] = [];
  let latestDataYear = '0';

  for (const [socCode, dataTypes] of Object.entries(clusterData.socCodes)) {
    const socWarnings: string[] = [];

    // Extract latest annual data for each data type
    const employmentValue = extractLatestAnnualValue(dataTypes['01'], socCode, '01');
    const meanWageValue = extractLatestAnnualValue(dataTypes['04'], socCode, '04');
    const medianWageValue = extractLatestAnnualValue(dataTypes['13'], socCode, '13');

    if (employmentValue === null) {
      socWarnings.push(`SOC ${socCode}: missing employment data (type 01)`);
    }
    if (meanWageValue === null) {
      socWarnings.push(`SOC ${socCode}: missing mean wage data (type 04)`);
    }
    if (medianWageValue === null) {
      socWarnings.push(`SOC ${socCode}: missing median wage data (type 13)`);
    }

    // Get data year from whichever data point exists
    const dataYear = getDataYear(dataTypes['01'] ?? dataTypes['04'] ?? dataTypes['13']);
    if (dataYear && dataYear > latestDataYear) {
      latestDataYear = dataYear;
    }

    const employment = employmentValue ?? 0;
    const meanWage = meanWageValue ?? 0;
    const medianWage = medianWageValue ?? 0;

    // Only add if we have at least employment data
    if (employment > 0) {
      socDetails.push({
        socCode,
        employment,
        meanWage,
        medianWage,
        dataYear: dataYear ?? 'unknown',
        warnings: socWarnings,
      });
    }

    warnings.push(...socWarnings.map(w => `Cluster "${canonicalId}": ${w}`));
  }

  // Compute cluster-level totals
  const totalEmployment = socDetails.reduce((sum, s) => sum + s.employment, 0);

  // Employment-weighted average wages
  const weightedMeanWage = totalEmployment > 0
    ? socDetails.reduce((sum, s) => sum + s.meanWage * s.employment, 0) / totalEmployment
    : 0;
  const weightedMedianWage = totalEmployment > 0
    ? socDetails.reduce((sum, s) => sum + s.medianWage * s.employment, 0) / totalEmployment
    : 0;

  return {
    canonicalClusterId: canonicalId,
    totalEmployment,
    weightedMeanWage,
    weightedMedianWage,
    dataYear: latestDataYear === '0' ? 'unknown' : latestDataYear,
    socDetails,
    warnings,
  };
}

/**
 * Break down cluster-level data into role-level estimates.
 * Uses employmentShareEstimate from role definitions and seniority-scaled wages.
 */
export function estimateRoleBreakdown(
  clusterAgg: ClusterAggregation,
  cluster: OccupationCluster,
  params: RoleEstimationConfig,
): OccupationBaseline {
  const roles: OccupationBaseline['roles'] = {};

  for (const role of cluster.roles) {
    // Employment per role
    const employmentShare = params.useClusterRoleShares
      ? role.employmentShareEstimate
      : 1 / cluster.roles.length;
    const estimatedEmployment = Math.round(clusterAgg.totalEmployment * employmentShare);

    // Wage per role
    let roleMedianWage: number;
    let roleMeanWage: number;

    if (params.wageScalingMethod === 'seniority_scaled') {
      // Scale wages by seniority: junior (0.5) → 100% of median, senior (0.85) → 135%
      const wageScale = 0.5 + role.seniorityLevel;
      roleMedianWage = Math.round(clusterAgg.weightedMedianWage * wageScale);
      roleMeanWage = Math.round(clusterAgg.weightedMeanWage * wageScale);
    } else {
      roleMedianWage = Math.round(clusterAgg.weightedMedianWage);
      roleMeanWage = Math.round(clusterAgg.weightedMeanWage);
    }

    // Estimate wage percentiles from mean/median spread
    const percentiles = estimateWagePercentiles(roleMedianWage, roleMeanWage, params.skewFactorScale);

    roles[role.id] = {
      estimatedEmployment,
      medianWage: roleMedianWage,
      meanWage: roleMeanWage,
      wagePercentiles: percentiles,
    };
  }

  return {
    clusterId: cluster.id,
    totalEmployment: clusterAgg.totalEmployment,
    roles,
    stateDistribution: {}, // State distribution requires state-level OEWS data (Phase 6)
    blsDataYear: clusterAgg.dataYear,
  };
}

/**
 * Estimate wage percentiles from mean and median wages.
 *
 * Since OEWS data only provides mean and median (not p10/p25/p75/p90),
 * we use the mean/median ratio as a skewness proxy.
 *
 * For positively skewed wage distributions (typical — mean > median):
 *   skewFactor = (mean / median) - 1, clamped to [0, 1]
 *
 * Then:
 *   p10 = median × (1 - skewFactor × 0.6)
 *   p25 = median × (1 - skewFactor × 0.3)
 *   p75 = median × (1 + skewFactor × 0.4)
 *   p90 = median × (1 + skewFactor × 0.8)
 *
 * Source: docs/BLS_API.md "Role-Level Estimation" section
 */
export function estimateWagePercentiles(
  medianWage: number,
  meanWage: number,
  skewFactorScale: number = 1.0,
): { p10: number; p25: number; p75: number; p90: number } {
  if (medianWage <= 0) {
    return { p10: 0, p25: 0, p75: 0, p90: 0 };
  }

  // Compute skew factor from mean/median ratio
  const rawSkew = meanWage > 0 ? (meanWage / medianWage) - 1 : 0;
  const skewFactor = Math.max(0, Math.min(1, rawSkew * skewFactorScale));

  return {
    p10: Math.round(medianWage * (1 - skewFactor * 0.6)),
    p25: Math.round(medianWage * (1 - skewFactor * 0.3)),
    p75: Math.round(medianWage * (1 + skewFactor * 0.4)),
    p90: Math.round(medianWage * (1 + skewFactor * 0.8)),
  };
}

/**
 * Transform CPI data into a usable annual price-level time series.
 * Extracts annual average values (period = "M13").
 */
export function transformCPIData(
  cpiData: RawCPIData,
): { annualCPI: Map<number, number>; latestCPI: { year: number; value: number } | null } {
  const annualCPI = new Map<number, number>();
  let latestCPI: { year: number; value: number } | null = null;

  for (const point of cpiData.data) {
    // M13 = Annual average
    if (point.period === 'M13') {
      const year = parseInt(point.year, 10);
      const value = parseFloat(point.value);

      if (!isNaN(year) && !isNaN(value) && value > 0) {
        annualCPI.set(year, value);
        if (latestCPI === null || year > latestCPI.year) {
          latestCPI = { year, value };
        }
      }
    }
  }

  return { annualCPI, latestCPI };
}

/**
 * Get the most recent total nonfarm employment from CES data.
 * Value is in thousands (per BLS convention).
 */
export function transformTotalEmployment(
  data: RawTotalEmploymentData,
): { latestEmployment: number; latestEmploymentThousands: number; year: number; month: string } | null {
  // Find the most recent data point (first in array — BLS returns newest first)
  for (const point of data.data) {
    const value = parseFloat(point.value);
    if (!isNaN(value) && value > 0) {
      return {
        latestEmploymentThousands: value,
        latestEmployment: value * 1000, // Convert from thousands to absolute
        year: parseInt(point.year, 10),
        month: point.periodName,
      };
    }
  }
  return null;
}

// ============================================================
// Helper functions
// ============================================================

/**
 * Extract the latest annual value from a BLS data points array.
 * Looks for period "A01" (annual) first, falls back to latest data point.
 * Parses the string value to a number, returning null for unparseable values.
 */
function extractLatestAnnualValue(
  dataPoints: RawBLSDataPoint[] | undefined,
  socCode: string,
  dataType: string,
): number | null {
  if (!dataPoints || dataPoints.length === 0) {
    return null;
  }

  // First try: find annual data point (period = "A01")
  const annualPoint = dataPoints.find(p => p.period === 'A01');
  if (annualPoint) {
    return parseBLSValue(annualPoint.value);
  }

  // Fallback: use the first (latest) data point
  const latestPoint = dataPoints[0];
  if (latestPoint) {
    return parseBLSValue(latestPoint.value);
  }

  return null;
}

/**
 * Parse a BLS data value string to a number.
 * BLS uses "-" for suppressed data and other non-numeric indicators.
 * Returns null for any unparseable value (never returns NaN).
 */
function parseBLSValue(value: string): number | null {
  if (!value || value === '-' || value === '**' || value === '#') {
    return null;
  }

  // Remove commas (BLS sometimes includes them in large values)
  const cleaned = value.replace(/,/g, '');
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    return null;
  }

  return parsed;
}

/**
 * Get the data year from a BLS data points array.
 */
function getDataYear(dataPoints: RawBLSDataPoint[] | undefined): string | null {
  if (!dataPoints || dataPoints.length === 0) {
    return null;
  }
  return dataPoints[0]?.year ?? null;
}

/**
 * Create a synthetic OccupationBaseline for the "Other / Uncategorized" cluster.
 *
 * FIX: BLS OEWS data covers only ~74M of the ~158M CES total
 * nonfarm employment. The gap (~84M workers) must be accounted for or the simulation
 * produces wildly wrong macro outputs (50% unemployment, immediate tipping point).
 *
 * This function computes: employment = CES total - sum(all OEWS cluster employment)
 * and creates a baseline with two roles matching the cluster definition in
 * occupationClusters.ts (general_worker: 60%, specialized_worker: 40%).
 *
 * @param oewsBaselines - All baselines computed from OEWS data
 * @param otherCluster - The "other_uncategorized" OccupationCluster definition
 * @returns Synthetic OccupationBaseline for the Other cluster
 */
export function createOtherClusterBaseline(
  oewsBaselines: Map<string, OccupationBaseline>,
  otherCluster: OccupationCluster,
): OccupationBaseline {
  // Sum employment from all OEWS-derived baselines
  let oewsTotalEmployment = 0;
  for (const [, baseline] of oewsBaselines) {
    oewsTotalEmployment += baseline.totalEmployment;
  }

  // The "Other" cluster gets the remainder: CES total − OEWS total
  // Use BASELINE_TOTAL_EMPLOYMENT (158,316,000) as the CES anchor
  const otherEmployment = Math.max(0, BASELINE_TOTAL_EMPLOYMENT - oewsTotalEmployment);

  // Use national average wage as the base for this blended cluster
  const baseWage = BASELINE_AVERAGE_ANNUAL_WAGE;

  // Build role-level breakdown matching the cluster definition
  const roles: OccupationBaseline['roles'] = {};
  for (const role of otherCluster.roles) {
    const roleEmployment = Math.round(otherEmployment * role.employmentShareEstimate);
    const wageScale = 0.5 + role.seniorityLevel; // Same seniority scaling as estimateRoleBreakdown
    const roleWage = Math.round(baseWage * wageScale);

    roles[role.id] = {
      estimatedEmployment: roleEmployment,
      medianWage: roleWage,
      meanWage: Math.round(roleWage * 1.1), // Typical mean/median ratio ~1.1
      wagePercentiles: {
        p10: Math.round(roleWage * 0.65),
        p25: Math.round(roleWage * 0.82),
        p75: Math.round(roleWage * 1.2),
        p90: Math.round(roleWage * 1.5),
      },
    };
  }

  return {
    clusterId: 'other_uncategorized',
    totalEmployment: otherEmployment,
    roles,
    stateDistribution: {},
    blsDataYear: 'synthetic',
  };
}
