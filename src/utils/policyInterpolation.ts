/**
 * ATLAS Policy Keyframe Interpolation (Phase 5e)
 *
 * Interpolates policy schedules to get time-varying policy values.
 * Each policy lever has a PolicySchedule with (year, value) keyframes.
 * Between keyframes, values are linearly interpolated.
 *
 * Rules:
 * - Empty keyframes → 0 for all years (policy inactive)
 * - Before first keyframe → 0 (policy not yet active)
 * - After last keyframe → last keyframe value (holds steady)
 * - Between two keyframes → linear interpolation
 * - Exactly on a keyframe → that keyframe's value
 */

import type { PolicySchedule } from '@/types';

/**
 * Interpolate a policy schedule to get the value at a given year.
 */
export function interpolatePolicy(schedule: PolicySchedule, year: number): number {
  // Defensive: handle undefined/null schedule or missing keyframes (e.g., stale persisted data)
  if (!schedule || !schedule.keyframes) return 0;
  const kf = schedule.keyframes;
  if (kf.length === 0) return 0;

  // Before first keyframe → 0
  if (year < kf[0]!.year) return 0;

  // At or after last keyframe → last value
  if (year >= kf[kf.length - 1]!.year) return kf[kf.length - 1]!.value;

  // Find surrounding keyframes and interpolate
  for (let i = 0; i < kf.length - 1; i++) {
    const curr = kf[i]!;
    const next = kf[i + 1]!;
    if (year >= curr.year && year <= next.year) {
      if (next.year === curr.year) return next.value; // same year → take later
      const t = (year - curr.year) / (next.year - curr.year);
      return curr.value + t * (next.value - curr.value);
    }
  }

  // Fallback (shouldn't reach here)
  return kf[kf.length - 1]!.value;
}

/**
 * Convert a flat value to a single-keyframe schedule.
 * Used for backward compatibility when importing old configs.
 * @param value - The flat policy value
 * @param startYear - Year to place the keyframe (default: 2025)
 */
export function flatToSchedule(value: number, startYear: number = 2025): PolicySchedule {
  if (value === 0) return { keyframes: [] };
  return { keyframes: [{ year: startYear, value }] };
}

/**
 * Create an empty (inactive) policy schedule.
 */
export function emptySchedule(): PolicySchedule {
  return { keyframes: [] };
}

/**
 * Create a constant schedule (same value from startYear onward).
 */
export function constantSchedule(value: number, startYear: number = 2025): PolicySchedule {
  return { keyframes: [{ year: startYear, value }] };
}

/**
 * Get the effective start year of a policy (first keyframe year, or null if inactive).
 */
export function getPolicyStartYear(schedule: PolicySchedule): number | null {
  if (schedule.keyframes.length === 0) return null;
  return schedule.keyframes[0]!.year;
}

/**
 * Check if a schedule is active (has any keyframes with non-zero values).
 */
export function isScheduleActive(schedule: PolicySchedule): boolean {
  return schedule.keyframes.length > 0 && schedule.keyframes.some(kf => kf.value !== 0);
}

/**
 * Sort keyframes by year (ascending) and deduplicate same-year entries (keep last).
 */
export function normalizeSchedule(schedule: PolicySchedule): PolicySchedule {
  if (schedule.keyframes.length <= 1) return schedule;

  // Sort by year
  const sorted = [...schedule.keyframes].sort((a, b) => a.year - b.year);

  // Deduplicate: for same year, keep last value
  const deduped: typeof sorted = [];
  for (const kf of sorted) {
    if (deduped.length > 0 && deduped[deduped.length - 1]!.year === kf.year) {
      deduped[deduped.length - 1] = kf; // replace with later value
    } else {
      deduped.push(kf);
    }
  }

  return { keyframes: deduped };
}
