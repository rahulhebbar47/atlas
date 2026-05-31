/**
 * Tests for policy keyframe interpolation (Phase 5e).
 */
import { describe, it, expect } from 'vitest';
import {
  interpolatePolicy,
  flatToSchedule,
  emptySchedule,
  constantSchedule,
  getPolicyStartYear,
  isScheduleActive,
  normalizeSchedule,
} from '../policyInterpolation';
import type { PolicySchedule } from '@/types';

describe('interpolatePolicy', () => {
  it('returns 0 for empty schedule at any year', () => {
    const schedule: PolicySchedule = { keyframes: [] };
    expect(interpolatePolicy(schedule, 2025)).toBe(0);
    expect(interpolatePolicy(schedule, 2030)).toBe(0);
    expect(interpolatePolicy(schedule, 2050)).toBe(0);
  });

  it('returns 0 before first keyframe', () => {
    const schedule: PolicySchedule = { keyframes: [{ year: 2030, value: 1000 }] };
    expect(interpolatePolicy(schedule, 2025)).toBe(0);
    expect(interpolatePolicy(schedule, 2029)).toBe(0);
  });

  it('returns first keyframe value exactly at first keyframe year', () => {
    const schedule: PolicySchedule = { keyframes: [{ year: 2030, value: 1000 }] };
    expect(interpolatePolicy(schedule, 2030)).toBe(1000);
  });

  it('returns last keyframe value after last keyframe (holds steady)', () => {
    const schedule: PolicySchedule = { keyframes: [{ year: 2030, value: 1000 }] };
    expect(interpolatePolicy(schedule, 2031)).toBe(1000);
    expect(interpolatePolicy(schedule, 2050)).toBe(1000);
  });

  it('linearly interpolates between two keyframes', () => {
    const schedule: PolicySchedule = {
      keyframes: [
        { year: 2030, value: 500 },
        { year: 2040, value: 3000 },
      ],
    };
    // Midpoint: 2035 → 1750
    expect(interpolatePolicy(schedule, 2035)).toBe(1750);
    // Quarter: 2032.5 → 1125
    expect(interpolatePolicy(schedule, 2032.5)).toBe(1125);
    // Start
    expect(interpolatePolicy(schedule, 2030)).toBe(500);
    // End
    expect(interpolatePolicy(schedule, 2040)).toBe(3000);
  });

  it('interpolates across multiple keyframes', () => {
    const schedule: PolicySchedule = {
      keyframes: [
        { year: 2030, value: 0 },
        { year: 2035, value: 1000 },
        { year: 2040, value: 3000 },
      ],
    };
    // Before all → 0
    expect(interpolatePolicy(schedule, 2025)).toBe(0);
    // Between first and second: 2032.5 → 500
    expect(interpolatePolicy(schedule, 2032.5)).toBe(500);
    // At second keyframe
    expect(interpolatePolicy(schedule, 2035)).toBe(1000);
    // Between second and third: 2037.5 → 2000
    expect(interpolatePolicy(schedule, 2037.5)).toBe(2000);
    // After all
    expect(interpolatePolicy(schedule, 2045)).toBe(3000);
  });

  it('handles negative values', () => {
    const schedule: PolicySchedule = {
      keyframes: [
        { year: 2030, value: -100 },
        { year: 2040, value: -500 },
      ],
    };
    expect(interpolatePolicy(schedule, 2035)).toBe(-300);
  });

  it('handles same-year keyframes (takes later value)', () => {
    const schedule: PolicySchedule = {
      keyframes: [
        { year: 2030, value: 100 },
        { year: 2030, value: 200 },
      ],
    };
    // When two keyframes have same year, interpolation with t=0/0 should take later
    expect(interpolatePolicy(schedule, 2030)).toBe(200);
  });

  it('handles single keyframe at year 2025', () => {
    const schedule: PolicySchedule = { keyframes: [{ year: 2025, value: 7.25 }] };
    expect(interpolatePolicy(schedule, 2024)).toBe(0);
    expect(interpolatePolicy(schedule, 2025)).toBe(7.25);
    expect(interpolatePolicy(schedule, 2050)).toBe(7.25);
  });

  it('handles schedule with decreasing values', () => {
    const schedule: PolicySchedule = {
      keyframes: [
        { year: 2030, value: 1000 },
        { year: 2040, value: 500 },
      ],
    };
    expect(interpolatePolicy(schedule, 2035)).toBe(750);
  });
});

describe('flatToSchedule', () => {
  it('returns empty schedule for value 0', () => {
    expect(flatToSchedule(0)).toEqual({ keyframes: [] });
  });

  it('returns single keyframe at default start year', () => {
    expect(flatToSchedule(1000)).toEqual({
      keyframes: [{ year: 2025, value: 1000 }],
    });
  });

  it('respects custom start year', () => {
    expect(flatToSchedule(500, 2030)).toEqual({
      keyframes: [{ year: 2030, value: 500 }],
    });
  });
});

describe('emptySchedule', () => {
  it('returns schedule with no keyframes', () => {
    expect(emptySchedule()).toEqual({ keyframes: [] });
  });
});

describe('constantSchedule', () => {
  it('creates a single-keyframe schedule', () => {
    expect(constantSchedule(42, 2030)).toEqual({
      keyframes: [{ year: 2030, value: 42 }],
    });
  });

  it('defaults to 2025', () => {
    expect(constantSchedule(100)).toEqual({
      keyframes: [{ year: 2025, value: 100 }],
    });
  });
});

describe('getPolicyStartYear', () => {
  it('returns null for empty schedule', () => {
    expect(getPolicyStartYear({ keyframes: [] })).toBeNull();
  });

  it('returns first keyframe year', () => {
    expect(getPolicyStartYear({
      keyframes: [{ year: 2030, value: 100 }, { year: 2040, value: 200 }],
    })).toBe(2030);
  });
});

describe('isScheduleActive', () => {
  it('returns false for empty schedule', () => {
    expect(isScheduleActive({ keyframes: [] })).toBe(false);
  });

  it('returns false for schedule with all zero values', () => {
    expect(isScheduleActive({ keyframes: [{ year: 2030, value: 0 }] })).toBe(false);
  });

  it('returns true for schedule with non-zero values', () => {
    expect(isScheduleActive({ keyframes: [{ year: 2030, value: 100 }] })).toBe(true);
  });
});

describe('normalizeSchedule', () => {
  it('returns empty schedule as-is', () => {
    expect(normalizeSchedule({ keyframes: [] })).toEqual({ keyframes: [] });
  });

  it('returns single keyframe as-is', () => {
    const schedule: PolicySchedule = { keyframes: [{ year: 2030, value: 100 }] };
    expect(normalizeSchedule(schedule)).toEqual(schedule);
  });

  it('sorts keyframes by year', () => {
    const schedule: PolicySchedule = {
      keyframes: [
        { year: 2040, value: 300 },
        { year: 2030, value: 100 },
        { year: 2035, value: 200 },
      ],
    };
    expect(normalizeSchedule(schedule)).toEqual({
      keyframes: [
        { year: 2030, value: 100 },
        { year: 2035, value: 200 },
        { year: 2040, value: 300 },
      ],
    });
  });

  it('deduplicates same-year keyframes keeping last value', () => {
    const schedule: PolicySchedule = {
      keyframes: [
        { year: 2030, value: 100 },
        { year: 2030, value: 200 },
        { year: 2040, value: 300 },
      ],
    };
    expect(normalizeSchedule(schedule)).toEqual({
      keyframes: [
        { year: 2030, value: 200 },
        { year: 2040, value: 300 },
      ],
    });
  });
});
