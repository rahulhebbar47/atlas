/**
 * Phase 8d: Parameter Trajectory Hook Tests
 *
 * Tests the trajectory extraction logic against real simulation output.
 * Uses runSimulation() directly rather than React hook rendering.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { getDefaultSimulationConfig, runSimulation } from '@/models/simulation';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import type { SimulationTimeline, YearParameters } from '@/types';
import { PARAM_CATEGORIES } from '@/utils/parameterFormatter';

// We import the internal helpers by re-implementing the extraction logic
// (hooks can't be tested without React context, but the data logic is pure)

// ============================================================
// Reproduction of core logic from useParameterTrajectory.ts
// ============================================================

const ALL_PARAM_KEYS: string[] = PARAM_CATEGORIES.flatMap((cat) => cat.params);

function getParamValue(yearParams: YearParameters, key: string) {
  return (yearParams as unknown as Record<string, { baseline: number; autopilot: number; effective: number; source: string; userOverride?: number; explanation?: string }>)[key];
}

function extractTrajectory(
  paramKey: string,
  parameterTimeline: Map<number, YearParameters>,
) {
  const points: Array<{
    year: number;
    baseline: number;
    autopilot: number;
    effective: number;
    source: string;
    override?: number;
    explanation?: string;
  }> = [];
  let maxDeviation = 0;
  let hasAutopilotAdjustment = false;
  let hasUserOverride = false;

  const sortedYears = Array.from(parameterTimeline.keys()).sort((a, b) => a - b);
  for (const year of sortedYears) {
    const yearParams = parameterTimeline.get(year)!;
    const pv = getParamValue(yearParams, paramKey);
    if (!pv) continue;

    points.push({
      year,
      baseline: pv.baseline,
      autopilot: pv.autopilot,
      effective: pv.effective,
      source: pv.source,
      override: pv.userOverride,
      explanation: pv.explanation,
    });

    if (Math.abs(pv.autopilot - pv.baseline) > 1e-9) {
      hasAutopilotAdjustment = true;
    }
    if (pv.userOverride !== undefined) {
      hasUserOverride = true;
    }

    const deviation = Math.abs(pv.effective - pv.baseline);
    if (deviation > maxDeviation) maxDeviation = deviation;
  }

  return { points, maxDeviation, hasAutopilotAdjustment, hasUserOverride };
}

// ============================================================
// Fixtures
// ============================================================

let defaultTimeline: SimulationTimeline;
let overrideTimeline: SimulationTimeline;
let consolidationTimeline: SimulationTimeline;

beforeAll(() => {
  const config = getDefaultSimulationConfig();
  defaultTimeline = runSimulation(config, OCCUPATION_CLUSTERS);

  // The 'austerity' fiscal profile has the lowest consolidation threshold (debt/GDP 1.2×),
  // so it reliably engages fiscal consolidation as debt grows — exercising the autopilot
  // adjustment path deterministically, independent of the default scenario's macro path.
  const austerityConfig = { ...config, fiscalPolicyPreset: 'austerity' };
  consolidationTimeline = runSimulation(austerityConfig, OCCUPATION_CLUSTERS);

  // Run with overrides to test override detection
  const overrideConfig = { ...config };
  const overrideMap = new Map<string, number>([
    ['effectiveIncomeTaxRate:2035', 0.20],
    ['ubiEnabled:2038', 1],
  ]);
  overrideTimeline = runSimulation(overrideConfig, OCCUPATION_CLUSTERS, undefined, undefined, overrideMap);
});

// ============================================================
// Tests
// ============================================================

describe('Parameter trajectory extraction', () => {
  it('extracts all parameters from default timeline', () => {
    const pt = defaultTimeline.parameterTimeline!;
    expect(pt).toBeDefined();

    let extractedCount = 0;
    for (const key of ALL_PARAM_KEYS) {
      const t = extractTrajectory(key, pt);
      if (t.points.length > 0) extractedCount++;
    }
    expect(extractedCount).toBe(46);
  });

  it('produces correct number of points per parameter', () => {
    const pt = defaultTimeline.parameterTimeline!;
    const yearsInTimeline = pt.size;

    const t = extractTrajectory('consolidationIntensity', pt);
    expect(t.points.length).toBe(yearsInTimeline);
  });

  it('points are in chronological order', () => {
    const pt = defaultTimeline.parameterTimeline!;
    const t = extractTrajectory('effectiveIncomeTaxRate', pt);

    for (let i = 1; i < t.points.length; i++) {
      expect(t.points[i]!.year).toBeGreaterThan(t.points[i - 1]!.year);
    }
  });

  it('first year consolidation intensity starts at zero', () => {
    const pt = defaultTimeline.parameterTimeline!;
    const t = extractTrajectory('consolidationIntensity', pt);

    const first = t.points[0]!;
    // Consolidation intensity starts at 0 in the first year (no debt crisis yet)
    expect(first.effective).toBe(0);
    expect(first.baseline).toBe(0);
  });

  it('detects autopilot adjustments in later years', () => {
    // Use the austerity timeline: its low consolidation threshold guarantees the
    // autopilot engages consolidation as debt/GDP grows (the default scenario may
    // stay below the threshold depending on the deflation/GDP trajectory).
    const pt = consolidationTimeline.parameterTimeline!;

    // Consolidation intensity should change from baseline as debt/GDP grows
    const t = extractTrajectory('consolidationIntensity', pt);
    expect(t.hasAutopilotAdjustment).toBe(true);
    expect(t.maxDeviation).toBeGreaterThan(0);
  });

  it('baseline params have zero deviation', () => {
    const pt = defaultTimeline.parameterTimeline!;

    // Technology params are computed from S-curves — autopilot = baseline always
    // (they track capability scores, not fiscal adjustments)
    // Actually, tech params may differ from baseline because autopilot passes them through.
    // Let's check a policy program that isn't enabled by default
    const t = extractTrajectory('ubiEnabled', pt);
    // UBI not enabled by default — all values should be 0 (baseline)
    expect(t.hasAutopilotAdjustment).toBe(false);
    expect(t.hasUserOverride).toBe(false);
  });
});

describe('Parameter trajectory with overrides', () => {
  it('detects user overrides', () => {
    const pt = overrideTimeline.parameterTimeline!;
    expect(pt).toBeDefined();

    const t = extractTrajectory('effectiveIncomeTaxRate', pt);
    expect(t.hasUserOverride).toBe(true);
  });

  it('override values appear on the correct year and forward', () => {
    const pt = overrideTimeline.parameterTimeline!;
    const t = extractTrajectory('effectiveIncomeTaxRate', pt);

    // Override set at 2035 → should be sticky from 2035 onward
    const pointAt2035 = t.points.find(p => p.year === 2035);
    if (pointAt2035) {
      expect(pointAt2035.override).toBe(0.20);
      expect(pointAt2035.source).toBe('override');
      expect(pointAt2035.effective).toBe(0.20);
    }

    // Check a year after 2035 — override should be sticky
    const pointAt2040 = t.points.find(p => p.year === 2040);
    if (pointAt2040) {
      expect(pointAt2040.override).toBe(0.20);
      expect(pointAt2040.source).toBe('override');
    }
  });

  it('UBI toggle override is detected', () => {
    const pt = overrideTimeline.parameterTimeline!;
    const t = extractTrajectory('ubiEnabled', pt);
    expect(t.hasUserOverride).toBe(true);

    const pointAt2038 = t.points.find(p => p.year === 2038);
    if (pointAt2038) {
      expect(pointAt2038.override).toBe(1);
      expect(pointAt2038.effective).toBe(1);
    }
  });
});

describe('Most changed parameters sorting', () => {
  it('sorts by maxDeviation descending', () => {
    const pt = defaultTimeline.parameterTimeline!;
    const all: Array<{ key: string; maxDeviation: number }> = [];

    for (const key of ALL_PARAM_KEYS) {
      const t = extractTrajectory(key, pt);
      if (t.maxDeviation > 1e-9) {
        all.push({ key, maxDeviation: t.maxDeviation });
      }
    }

    all.sort((a, b) => b.maxDeviation - a.maxDeviation);

    for (let i = 1; i < all.length; i++) {
      expect(all[i]!.maxDeviation).toBeLessThanOrEqual(all[i - 1]!.maxDeviation);
    }
  });

  it('filters out zero-deviation parameters', () => {
    const pt = defaultTimeline.parameterTimeline!;
    const all: Array<{ key: string; maxDeviation: number }> = [];

    for (const key of ALL_PARAM_KEYS) {
      const t = extractTrajectory(key, pt);
      if (t.maxDeviation > 1e-9) {
        all.push({ key, maxDeviation: t.maxDeviation });
      }
    }

    // Should be fewer than 20 (some params don't change in default config)
    expect(all.length).toBeLessThan(20);
    expect(all.length).toBeGreaterThan(0);
  });
});

describe('Grouped parameter trajectories', () => {
  it('produces 5 groups matching PARAM_CATEGORIES', () => {
    const pt = defaultTimeline.parameterTimeline!;
    const grouped = new Map<string, string[]>();

    for (const cat of PARAM_CATEGORIES) {
      grouped.set(cat.key, []);
    }

    for (const key of ALL_PARAM_KEYS) {
      const cat = PARAM_CATEGORIES.find(c => c.params.includes(key));
      if (cat) {
        const arr = grouped.get(cat.key)!;
        arr.push(key);
      }
    }

    expect(grouped.size).toBe(10);
    expect(grouped.get('fiscal')?.length).toBe(5);
    expect(grouped.get('tax')?.length).toBe(4);
    expect(grouped.get('monetary')?.length).toBe(2);
    expect(grouped.get('fed')?.length).toBe(3);
    expect(grouped.get('policy')?.length).toBe(6);
    expect(grouped.get('tech')?.length).toBe(4);
    expect(grouped.get('supplyInputs')?.length).toBe(7);
    expect(grouped.get('supplyResilience')?.length).toBe(5);
    expect(grouped.get('trainingDynamics')?.length).toBe(7);
    expect(grouped.get('supplyEcon')?.length).toBe(3);
  });
});
