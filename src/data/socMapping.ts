/**
 * ATLAS SOC Code Mapping — Cluster ID Reconciliation
 *
 * The BLS fetch script (scripts/fetch-bls-data.ts) uses different cluster IDs
 * than the canonical definitions in src/data/occupationClusters.ts for 14 clusters.
 * This module provides the single source of truth for reconciling these IDs.
 *
 * Direction: OEWS JSON key (from fetch script) → canonical cluster ID (from occupationClusters.ts)
 *
 * The remaining 33 cluster IDs match between both files and pass through unchanged.
 */

/**
 * Maps OEWS JSON cluster IDs (from fetch script) to canonical
 * occupationClusters.ts IDs. Only mismatched IDs are listed here.
 */
export const OEWS_TO_CANONICAL_CLUSTER_ID: Record<string, string> = {
  'tech_it': 'tech_it_support',
  'health_techs': 'health_technicians',
  'health_aides': 'health_home_health',
  'trades_electrical': 'construction_electricians',
  'trades_plumbing': 'construction_plumbers',
  'trades_construction': 'construction_general',
  'trades_hvac': 'construction_hvac',
  'retail_floor': 'retail_cashiers',
  'retail_mgmt': 'retail_management',
  'retail_ecom': 'retail_ecommerce',
  'food_fast': 'food_fast_food',
  'prof_realestate': 'prof_real_estate',
  'ag_farm': 'ag_farm_labor',
  'sci_lab': 'sci_lab_research',
};

/**
 * Reverse mapping: canonical cluster ID → OEWS JSON key.
 * Built from OEWS_TO_CANONICAL_CLUSTER_ID at module load.
 */
export const CANONICAL_TO_OEWS_CLUSTER_ID: Record<string, string> = Object.fromEntries(
  Object.entries(OEWS_TO_CANONICAL_CLUSTER_ID).map(([oews, canonical]) => [canonical, oews])
);

/**
 * Canonical cluster IDs that have NO BLS data in the OEWS JSON.
 * These clusters exist in occupationClusters.ts but use cross-cutting
 * SOC codes ("Various") not captured by the OEWS fetch.
 *
 * Source: docs/OCCUPATION_CLUSTERS.md §13.1 (Federal Civilian) and §13.2 (State/Local)
 */
export const CLUSTERS_WITHOUT_BLS_DATA: readonly string[] = [
  'gov_federal',
  'gov_state_local',
  'other_uncategorized',
] as const;

/**
 * Resolve an OEWS JSON key to the canonical cluster ID.
 * Returns the canonical ID if different, or the same key if already canonical.
 */
export function resolveCanonicalClusterId(oewsKey: string): string {
  return OEWS_TO_CANONICAL_CLUSTER_ID[oewsKey] ?? oewsKey;
}

/**
 * Resolve a canonical cluster ID to the OEWS JSON key.
 * Returns the OEWS key if different, or the same key if it matches.
 * Returns null if the cluster has no BLS data.
 */
export function resolveOEWSKey(canonicalId: string): string | null {
  if (CLUSTERS_WITHOUT_BLS_DATA.includes(canonicalId)) {
    return null;
  }
  return CANONICAL_TO_OEWS_CLUSTER_ID[canonicalId] ?? canonicalId;
}
