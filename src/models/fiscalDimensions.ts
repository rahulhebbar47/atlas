/**
 * ATLAS Phase 8c → Phase 8 Fix 4: Fiscal + Federal Reserve Dimension Mapping
 *
 * Phase 8 Fix 4: Split the old 5-dimension model into two independent groups:
 *   Fiscal Policy (4 dimensions): spendingRevenue, safetyNet, reactionTiming, adjustmentSpeed
 *   Federal Reserve (2 dimensions): inflationVsEmployment, bondMarketOperations
 *
 * Maps dimension slider positions to concrete profile field values.
 * Sources for slider values: Phase 8a preset calibration + Phase 8 Fix 4 prompt.
 *
 * PURE DATA + PURE FUNCTIONS — no side effects.
 */

import type {
  FiscalDimensionKey,
  FiscalDimensionPositions,
  FedDimensionKey,
  FedDimensionPositions,
  DimensionConfig,
} from '@/types/fiscalDimensions';
import type { FiscalResponseProfile, FiscalPolicyProfile, FederalReserveProfile } from '@/models/fiscalResponseProfiles';
import {
  FISCAL_POLICY_PRESETS,
  FEDERAL_RESERVE_PRESETS,
  DEFAULT_FISCAL_POLICY_PRESET,
  DEFAULT_FEDERAL_RESERVE_PRESET,
} from '@/models/fiscalResponseProfiles';

// ============================================================
// Fiscal Policy Dimensions (4 dimensions — what Congress does)
// ============================================================

export const FISCAL_DIMENSIONS: DimensionConfig[] = [
  // ── Dimension 1: Spending vs Revenue ──
  {
    key: 'spendingRevenue',
    label: 'Spending vs Revenue',
    description: 'How is fiscal adjustment split between spending cuts and revenue increases?',
    color: '#F97316', // orange-500
    options: [
      {
        position: 0,
        label: 'All Cuts',
        fields: { maxDiscretionaryCut: 0.30, maxObligationCut: 0.10, maxRevenueIncrease: 0.00 },
      },
      {
        position: 1,
        label: 'Mostly Cuts',
        fields: { maxDiscretionaryCut: 0.20, maxObligationCut: 0.06, maxRevenueIncrease: 0.05 },
      },
      {
        position: 2,
        label: 'Balanced',
        fields: { maxDiscretionaryCut: 0.15, maxObligationCut: 0.05, maxRevenueIncrease: 0.08 },
      },
      {
        position: 3,
        label: 'Mostly Revenue',
        fields: { maxDiscretionaryCut: 0.08, maxObligationCut: 0.03, maxRevenueIncrease: 0.15 },
      },
      {
        position: 4,
        label: 'All Revenue',
        fields: { maxDiscretionaryCut: 0.02, maxObligationCut: 0.01, maxRevenueIncrease: 0.25 },
      },
    ],
  },

  // DEPRECATED Phase 8 Fix 4: monetaryStance dimension moved to FED_DIMENSIONS
  // (split into inflationVsEmployment + bondMarketOperations)
  // {
  //   key: 'monetaryStance',
  //   label: 'Monetary Stance',
  //   description: 'How much does the central bank accommodate fiscal stress?',
  //   color: '#6366F1', // indigo-500
  //   options: [ ... ],
  // },

  // ── Dimension 2: Safety Net Protection ──
  {
    key: 'safetyNet',
    label: 'Safety Net Protection',
    description: 'Are transfer payments protected from inflation erosion?',
    color: '#10B981', // emerald-500
    options: [
      {
        position: 0,
        label: 'Full Protection',
        fields: { colaDampeningRate: 0.00, colaDampeningThreshold: 5.0, colaDampeningMaxCIF: 10.0 },
      },
      {
        position: 1,
        label: 'Partial Erosion',
        fields: { colaDampeningRate: 0.20, colaDampeningThreshold: 2.0, colaDampeningMaxCIF: 5.0 },
      },
      {
        position: 2,
        label: 'Budget Priority',
        fields: { colaDampeningRate: 0.40, colaDampeningThreshold: 1.5, colaDampeningMaxCIF: 3.5 },
      },
    ],
  },

  // ── Dimension 3: Reaction Timing ──
  {
    key: 'reactionTiming',
    label: 'Reaction Timing',
    description: 'At what debt/GDP level does fiscal adjustment activate?',
    color: '#EAB308', // yellow-500
    options: [
      {
        position: 0,
        label: 'Early Response',
        fields: { consolidationThreshold: 1.0, consolidationMaxThreshold: 2.0 },
      },
      {
        position: 1,
        label: 'Standard',
        fields: { consolidationThreshold: 1.5, consolidationMaxThreshold: 3.0 },
      },
      {
        position: 2,
        label: 'Late Response',
        fields: { consolidationThreshold: 2.5, consolidationMaxThreshold: 5.0 },
      },
    ],
  },

  // ── Dimension 4: Adjustment Speed ──
  {
    key: 'adjustmentSpeed',
    label: 'Adjustment Speed',
    description: 'How many years of political delay before response?',
    color: '#EC4899', // pink-500
    options: [
      {
        position: 0,
        label: 'Immediate',
        fields: { consolidationLag: 0 },
      },
      {
        position: 1,
        label: '1-Year Lag',
        fields: { consolidationLag: 1 },
      },
      {
        position: 2,
        label: '2-Year Lag',
        fields: { consolidationLag: 2 },
      },
      {
        position: 3,
        label: 'Gridlock',
        fields: { consolidationLag: 4 },
      },
    ],
  },
];

// ============================================================
// Federal Reserve Dimensions (2 dimensions — what the Fed does)
// Phase 8 Fix 4: Split from old monetaryStance dimension
// ============================================================

/**
 * Two dimensions controlling Fed behavior:
 * 1. Inflation vs Employment — Taylor Rule reaction function coefficients
 * 2. Bond Market Operations — QE, financial repression, yield response
 *
 * Sources: Taylor (1993), Yellen (2012) balanced approach, Evans Rule (2012)
 */
export const FED_DIMENSIONS: DimensionConfig[] = [
  // ── Fed Dimension 1: Inflation vs Employment Response ──
  {
    key: 'inflationVsEmployment',
    label: 'Inflation vs Employment',
    description: 'How does the Fed weight price stability vs. maximum employment?',
    color: '#6366F1', // indigo-500
    options: [
      {
        position: 0,
        label: 'Price Stability',
        fields: { taylorInflationCoeff: 2.0, taylorOutputGapCoeff: 0.5, taylorEmploymentGapCoeff: 0.0 },
      },
      {
        position: 1,
        label: 'Balanced',
        fields: { taylorInflationCoeff: 1.5, taylorOutputGapCoeff: 0.5, taylorEmploymentGapCoeff: 0.5 },
      },
      {
        position: 2,
        label: 'Employment-Leaning',
        fields: { taylorInflationCoeff: 1.0, taylorOutputGapCoeff: 0.3, taylorEmploymentGapCoeff: 0.8 },
      },
      {
        position: 3,
        label: 'Employment-First',
        fields: { taylorInflationCoeff: 0.8, taylorOutputGapCoeff: 0.2, taylorEmploymentGapCoeff: 1.2 },
      },
    ],
  },

  // ── Fed Dimension 2: Bond Market Operations ──
  {
    key: 'bondMarketOperations',
    label: 'Bond Market Operations',
    description: 'How aggressively does the Fed intervene in bond markets?',
    color: '#8B5CF6', // violet-500
    options: [
      {
        position: 0,
        label: 'Minimal Intervention',
        fields: { qeMonetizationRate: 0.10, maxFinancialRepressionRate: 0.30, yieldResponseThreshold: 0.10, maxYieldResponseRate: 0.45 },
      },
      {
        position: 1,
        label: 'Standard Operations',
        fields: { qeMonetizationRate: 0.15, maxFinancialRepressionRate: 0.50, yieldResponseThreshold: 0.08, maxYieldResponseRate: 0.65 },
      },
      {
        position: 2,
        label: 'Active Purchases',
        fields: { qeMonetizationRate: 0.30, maxFinancialRepressionRate: 0.60, yieldResponseThreshold: 0.07, maxYieldResponseRate: 0.70 },
      },
      {
        position: 3,
        label: 'Aggressive QE',
        fields: { qeMonetizationRate: 0.40, maxFinancialRepressionRate: 0.80, yieldResponseThreshold: 0.05, maxYieldResponseRate: 0.85 },
      },
    ],
  },
];

// ============================================================
// Field-to-Dimension Mapping (for reverse lookup)
// ============================================================

/** Which fields belong to which fiscal dimension. */
const DIMENSION_FIELD_KEYS: Record<FiscalDimensionKey, string[]> = {
  spendingRevenue: ['maxDiscretionaryCut', 'maxObligationCut', 'maxRevenueIncrease'],
  // DEPRECATED Phase 8 Fix 4: monetaryStance moved to FED_DIMENSION_FIELD_KEYS
  // monetaryStance: ['qeMonetizationRate', 'maxFinancialRepressionRate', 'yieldResponseThreshold', 'maxYieldResponseRate'],
  safetyNet: ['colaDampeningRate', 'colaDampeningThreshold', 'colaDampeningMaxCIF'],
  reactionTiming: ['consolidationThreshold', 'consolidationMaxThreshold'],
  adjustmentSpeed: ['consolidationLag'],
};

/** Which fields belong to which Fed dimension. */
const FED_DIMENSION_FIELD_KEYS: Record<FedDimensionKey, string[]> = {
  inflationVsEmployment: ['taylorInflationCoeff', 'taylorOutputGapCoeff', 'taylorEmploymentGapCoeff'],
  bondMarketOperations: ['qeMonetizationRate', 'maxFinancialRepressionRate', 'yieldResponseThreshold', 'maxYieldResponseRate'],
};

// ============================================================
// Fiscal Dimension Utilities
// ============================================================

/**
 * Find the closest slider position for a single dimension given a profile.
 * Uses sum-of-squared-differences on fields to find the best match.
 */
function findClosestPosition(
  dim: DimensionConfig,
  profile: Record<string, number>,
  fieldKeys: string[],
): number {
  let bestPos = 0;
  let bestDist = Infinity;

  for (const option of dim.options) {
    let dist = 0;
    for (const fieldKey of fieldKeys) {
      const profileVal = profile[fieldKey] ?? 0;
      const optionVal = option.fields[fieldKey] ?? 0;
      dist += (profileVal - optionVal) ** 2;
    }
    if (dist < bestDist) {
      bestDist = dist;
      bestPos = option.position;
    }
  }

  return bestPos;
}

/**
 * Convert a FiscalPolicyProfile (or combined FiscalResponseProfile) to fiscal
 * dimension slider positions.
 */
export function presetToDimensionPositions(
  profile: FiscalPolicyProfile | FiscalResponseProfile,
): FiscalDimensionPositions {
  const positions: Record<string, number> = {};
  const profileRecord = profile as unknown as Record<string, number>;

  for (const dim of FISCAL_DIMENSIONS) {
    const fieldKeys = DIMENSION_FIELD_KEYS[dim.key as FiscalDimensionKey];
    positions[dim.key] = findClosestPosition(dim, profileRecord, fieldKeys);
  }

  return positions as unknown as FiscalDimensionPositions;
}

/**
 * Convert fiscal dimension slider positions to concrete FiscalPolicyProfile field values.
 * Returns a partial profile containing only the fields controlled by fiscal dimensions.
 */
export function dimensionPositionsToProfileFields(
  positions: FiscalDimensionPositions,
): Partial<FiscalPolicyProfile> {
  const fields: Record<string, number> = {};

  for (const dim of FISCAL_DIMENSIONS) {
    const posIndex = positions[dim.key as FiscalDimensionKey];
    const option = dim.options.find((o) => o.position === posIndex);
    if (option) {
      Object.assign(fields, option.fields);
    }
  }

  return fields as Partial<FiscalPolicyProfile>;
}

/**
 * Get the default fiscal dimension positions (for balanced_reduction).
 */
export function getDefaultDimensionPositions(): FiscalDimensionPositions {
  const defaultProfile = FISCAL_POLICY_PRESETS[DEFAULT_FISCAL_POLICY_PRESET]!;
  return presetToDimensionPositions(defaultProfile);
}

// ============================================================
// Federal Reserve Dimension Utilities
// ============================================================

/**
 * Convert a FederalReserveProfile (or combined FiscalResponseProfile) to Fed
 * dimension slider positions.
 */
export function fedPresetToDimensionPositions(
  profile: FederalReserveProfile | FiscalResponseProfile,
): FedDimensionPositions {
  const positions: Record<string, number> = {};
  const profileRecord = profile as unknown as Record<string, number>;

  for (const dim of FED_DIMENSIONS) {
    const fieldKeys = FED_DIMENSION_FIELD_KEYS[dim.key as FedDimensionKey];
    positions[dim.key] = findClosestPosition(dim, profileRecord, fieldKeys);
  }

  return positions as unknown as FedDimensionPositions;
}

/**
 * Convert Fed dimension slider positions to concrete FederalReserveProfile field values.
 * Returns a partial profile containing only the fields controlled by Fed dimensions.
 */
export function fedDimensionPositionsToProfileFields(
  positions: FedDimensionPositions,
): Partial<FederalReserveProfile> {
  const fields: Record<string, number> = {};

  for (const dim of FED_DIMENSIONS) {
    const posIndex = positions[dim.key as FedDimensionKey];
    const option = dim.options.find((o) => o.position === posIndex);
    if (option) {
      Object.assign(fields, option.fields);
    }
  }

  return fields as Partial<FederalReserveProfile>;
}

/**
 * Get the default Fed dimension positions (for balanced_mandate).
 */
export function getDefaultFedDimensionPositions(): FedDimensionPositions {
  const defaultProfile = FEDERAL_RESERVE_PRESETS[DEFAULT_FEDERAL_RESERVE_PRESET]!;
  return fedPresetToDimensionPositions(defaultProfile);
}

// ============================================================
// DEPRECATED Phase 8 Fix 4: Old imports + old 5-dimension model
// ============================================================

// import { FISCAL_RESPONSE_PRESETS, DEFAULT_FISCAL_RESPONSE_PROFILE } from '@/models/fiscalResponseProfiles';

// Old DIMENSION_FIELD_KEYS included monetaryStance:
// monetaryStance: ['qeMonetizationRate', 'maxFinancialRepressionRate', 'yieldResponseThreshold', 'maxYieldResponseRate'],

// Old getDefaultDimensionPositions used FISCAL_RESPONSE_PRESETS[DEFAULT_FISCAL_RESPONSE_PROFILE]
