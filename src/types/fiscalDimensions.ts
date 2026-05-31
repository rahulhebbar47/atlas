/**
 * ATLAS Phase 8c: Fiscal Response Dimension Types
 *
 * Five dimensions that parameterize the government's fiscal response:
 *   1. Spending vs Revenue balance
 *   2. Monetary stance
 *   3. Safety net protection
 *   4. Reaction timing
 *   5. Adjustment speed
 *
 * Each dimension has 3-5 discrete positions mapping to specific
 * FiscalResponseProfile field values.
 */

// ============================================================
// Dimension Keys & Positions
// ============================================================

export type FiscalDimensionKey =
  | 'spendingRevenue'
  // DEPRECATED Phase 8 Fix 4: monetaryStance split into FedDimensionKey (inflationVsEmployment + bondMarketOperations)
  // | 'monetaryStance'
  | 'safetyNet'
  | 'reactionTiming'
  | 'adjustmentSpeed';

/** Position index for each fiscal dimension's segmented control. */
export interface FiscalDimensionPositions {
  spendingRevenue: number;    // 0-4
  // DEPRECATED Phase 8 Fix 4: monetaryStance moved to FedDimensionPositions
  // monetaryStance: number;
  safetyNet: number;          // 0-2
  reactionTiming: number;     // 0-2
  adjustmentSpeed: number;    // 0-3
}

// ============================================================
// Phase 8 Fix 4: Federal Reserve Dimension Types
// ============================================================

/** Federal Reserve policy dimension keys. */
export type FedDimensionKey = 'inflationVsEmployment' | 'bondMarketOperations';

/** Position index for each Fed dimension's segmented control. */
export interface FedDimensionPositions {
  inflationVsEmployment: number;  // 0-3
  bondMarketOperations: number;   // 0-3
}

// ============================================================
// Dimension Option & Config
// ============================================================

/** A single discrete position in a dimension slider. */
export interface DimensionOption {
  /** Position index (0-based). */
  position: number;
  /** Human-readable label for this position. */
  label: string;
  /** FiscalResponseProfile field values this position maps to. */
  fields: Record<string, number>;
}

/** Full configuration for one dimension (fiscal or Fed). */
export interface DimensionConfig {
  /** Unique key identifying this dimension. */
  key: FiscalDimensionKey | FedDimensionKey;
  /** Display label (e.g., "Spending vs Revenue"). */
  label: string;
  /** Short description of what this dimension controls. */
  description: string;
  /** Accent color for the segmented control (hex string). */
  color: string;
  /** Discrete options from least to most accommodative/expansionary. */
  options: DimensionOption[];
}
