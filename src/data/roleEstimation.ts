/**
 * ATLAS Role-Level Estimation Configuration
 *
 * BLS OEWS data provides cluster-level (occupation-level) employment and wages,
 * but not per-seniority breakdowns. These parameters control how cluster-level
 * data is disaggregated into role-level estimates.
 *
 * Source: docs/BLS_API.md "Role-Level Estimation" section
 *
 * These parameters are user-adjustable in the UI (Phase 4+).
 */

export interface RoleEstimationConfig {
  /**
   * Whether to use cluster role definitions for employment share.
   * true = use occupationClusters.ts employmentShareEstimate per role
   * false = flat/equal distribution across roles
   */
  useClusterRoleShares: boolean;

  /**
   * Wage scaling method for role-level wage estimation.
   * 'seniority_scaled' = multiply cluster median by (0.5 + seniorityLevel)
   *   - Junior at 0.5 seniority → 100% of median
   *   - Senior at 0.85 seniority → 135% of median
   *   - Principal at 0.95 seniority → 145% of median
   * 'uniform' = same wage for all roles (just use cluster median)
   */
  wageScalingMethod: 'seniority_scaled' | 'uniform';

  /**
   * Skew factor scaling for wage percentile estimation.
   * Controls how strongly the mean-median gap influences estimated percentiles.
   * Higher values produce wider percentile spreads.
   * Range: [0.5, 2.0], default 1.0
   */
  skewFactorScale: number;
}

/**
 * Default role estimation parameters.
 * These produce reasonable role-level estimates from BLS cluster data.
 */
export const DEFAULT_ROLE_ESTIMATION_CONFIG: RoleEstimationConfig = {
  useClusterRoleShares: true,
  wageScalingMethod: 'seniority_scaled',
  skewFactorScale: 1.0,
};
