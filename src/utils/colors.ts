/**
 * ATLAS Color Utilities
 *
 * Helpers for dynamic color assignment in charts and controls.
 * Reads from CAPABILITY_VECTOR_METADATA for consistency.
 */

import type { CapabilityVectorId, BFCSThresholds } from '@/types';
import { CAPABILITY_VECTOR_METADATA, BFCS_DIMENSION_COLORS } from '@/models/constants';

/**
 * Get the assigned color for a capability vector.
 */
export function getCapabilityColor(id: CapabilityVectorId): string {
  return CAPABILITY_VECTOR_METADATA[id].color;
}

/**
 * Deterministic color assignment for occupation cluster categories.
 * 15 categories, each gets a distinct color.
 */
const CATEGORY_COLORS: Record<string, string> = {
  'Technology': '#3B82F6',
  'Finance': '#8B5CF6',
  'Healthcare': '#EF4444',
  'Education': '#F59E0B',
  'Legal': '#6366F1',
  'Transportation': '#06B6D4',
  'Manufacturing': '#78716C',
  'Construction': '#EA580C',
  'Retail': '#EC4899',
  'Food Service': '#F97316',
  'Creative': '#A855F7',
  'Professional Services': '#14B8A6',
  'Government': '#64748B',
  'Agriculture': '#84CC16',
  'Scientific R&D': '#10B981',
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#6B7280';
}

/**
 * Convert a hex color to rgba with a given opacity.
 */
export function withOpacity(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Return a status color based on value and thresholds.
 */
export function getStatusColor(
  value: number,
  thresholds: { warn: number; critical: number },
): string {
  if (value >= thresholds.critical) return '#EF4444'; // critical
  if (value >= thresholds.warn) return '#F97316'; // caution
  return '#22C55E'; // growth
}

/**
 * Return a color based on how close a BFCS score is to its threshold.
 * proximity = score / threshold: <1 means not met, >=1 means triggered.
 */
export function getBFCSProximityColor(proximity: number): string {
  if (proximity >= 1.0) return '#EF4444';  // triggered — red
  if (proximity >= 0.8) return '#F97316';  // approaching — orange
  if (proximity >= 0.5) return '#F59E0B';  // moderate — amber
  return '#22C55E';                         // far — green
}

/**
 * Get the display color for a BFCS dimension.
 */
export function getBFCSDimensionColor(dimension: keyof BFCSThresholds): string {
  return BFCS_DIMENSION_COLORS[dimension];
}
