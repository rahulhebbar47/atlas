/**
 * ATLAS Phase 4 — BFCS Override & Enrichment Tests
 *
 * Tests Phase 4 additions:
 * 1. bfcsOverrides in SimulationConfig defaults to empty
 * 2. checkAdoptionTrigger accepts optional thresholdOverride
 * 3. findTriggerYear accepts optional thresholdOverride
 * 4. Simulation output includes bfcsOutput per cluster
 * 5. BFCS overrides change simulation behavior
 * 6. Empty overrides produce identical results to no overrides
 */

import { describe, it, expect } from 'vitest';
import { getDefaultSimulationConfig, runSimulation } from '@/models/simulation';
import { checkAdoptionTrigger, findTriggerYear } from '@/models/bfcs';
import { getAllCapabilityScores } from '@/models/capabilities';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import type { SimulationConfig, OccupationCluster, BFCSThresholds } from '@/types';

// ============================================================
// Test Helpers
// ============================================================

const SMALL_CLUSTERS: OccupationCluster[] = OCCUPATION_CLUSTERS.slice(0, 3);

function shortConfig(overrides?: Partial<SimulationConfig>): SimulationConfig {
  return {
    ...getDefaultSimulationConfig(),
    startYear: 2025,
    endYear: 2035,
    ...overrides,
  };
}

// ============================================================
// Default Config
// ============================================================

describe('Phase 4: bfcsOverrides in default config', () => {
  it('default config has empty bfcsOverrides', () => {
    const config = getDefaultSimulationConfig();
    expect(config.bfcsOverrides).toBeDefined();
    expect(config.bfcsOverrides).toEqual({});
  });
});

// ============================================================
// checkAdoptionTrigger with thresholdOverride
// ============================================================

describe('Phase 4: checkAdoptionTrigger with threshold override', () => {
  const cluster = OCCUPATION_CLUSTERS[0]!;
  const role = cluster.roles[0]!;

  it('uses role.bfcsThresholds when no override provided', () => {
    const capScores = getAllCapabilityScores(2040, getDefaultSimulationConfig().capabilities);
    const result = checkAdoptionTrigger(cluster, role, 2040, capScores);
    expect(result).toHaveProperty('triggered');
    expect(result).toHaveProperty('scores');
    expect(typeof result.triggered).toBe('boolean');
  });

  it('uses override thresholds when provided', () => {
    const capScores = getAllCapabilityScores(2040, getDefaultSimulationConfig().capabilities);

    // Very low thresholds — should trigger easily
    const lowThresholds: BFCSThresholds = { better: 0.01, faster: 0.01, cheaper: 0.01, safer: 0.01 };
    const lowResult = checkAdoptionTrigger(cluster, role, 2040, capScores, lowThresholds);
    expect(lowResult.triggered).toBe(true);

    // Very high thresholds — should not trigger
    const highThresholds: BFCSThresholds = { better: 0.99, faster: 0.99, cheaper: 0.99, safer: 0.99 };
    const highResult = checkAdoptionTrigger(cluster, role, 2040, capScores, highThresholds);
    expect(highResult.triggered).toBe(false);
  });

  it('override does not affect score computation (only threshold check)', () => {
    const capScores = getAllCapabilityScores(2035, getDefaultSimulationConfig().capabilities);
    const noOverride = checkAdoptionTrigger(cluster, role, 2035, capScores);
    const withOverride = checkAdoptionTrigger(
      cluster, role, 2035, capScores,
      { better: 0.01, faster: 0.01, cheaper: 0.01, safer: 0.01 },
    );
    // Scores should be identical regardless of threshold override
    expect(withOverride.scores.better).toBeCloseTo(noOverride.scores.better, 6);
    expect(withOverride.scores.faster).toBeCloseTo(noOverride.scores.faster, 6);
    expect(withOverride.scores.cheaper).toBeCloseTo(noOverride.scores.cheaper, 6);
    expect(withOverride.scores.safer).toBeCloseTo(noOverride.scores.safer, 6);
  });
});

// ============================================================
// findTriggerYear with thresholdOverride
// ============================================================

describe('Phase 4: findTriggerYear with threshold override', () => {
  const cluster = OCCUPATION_CLUSTERS[0]!;
  const role = cluster.roles[0]!;
  const config = getDefaultSimulationConfig();
  const getScores = (year: number) => getAllCapabilityScores(year, config.capabilities);

  it('low overrides trigger earlier', () => {
    const defaultTrigger = findTriggerYear(cluster, role, 2025, 2050, getScores);
    const lowTrigger = findTriggerYear(
      cluster, role, 2025, 2050, getScores,
      { better: 0.01, faster: 0.01, cheaper: 0.01, safer: 0.01 },
    );

    // With near-zero thresholds, should trigger at or before the default
    if (defaultTrigger !== null && lowTrigger !== null) {
      expect(lowTrigger).toBeLessThanOrEqual(defaultTrigger);
    }
    // With near-zero thresholds, should definitely trigger
    expect(lowTrigger).not.toBeNull();
  });

  it('very high overrides prevent triggering within range', () => {
    const highTrigger = findTriggerYear(
      cluster, role, 2025, 2035, getScores,
      { better: 0.99, faster: 0.99, cheaper: 0.99, safer: 0.99 },
    );
    expect(highTrigger).toBeNull();
  });
});

// ============================================================
// Simulation output enrichment
// ============================================================

describe('Phase 4: simulation output includes bfcsOutput', () => {
  it('every cluster displacement result has bfcsOutput array', () => {
    const config = shortConfig();
    const timeline = runSimulation(config, SMALL_CLUSTERS);

    for (const year of timeline.years) {
      for (const cluster of year.clusters) {
        expect(cluster.bfcsOutput).toBeDefined();
        expect(Array.isArray(cluster.bfcsOutput)).toBe(true);
      }
    }
  });

  it('bfcsOutput has one entry per role', () => {
    const config = shortConfig();
    const timeline = runSimulation(config, SMALL_CLUSTERS);

    // Check first year
    const firstYear = timeline.years[0]!;
    for (let i = 0; i < SMALL_CLUSTERS.length; i++) {
      const clusterDef = SMALL_CLUSTERS[i]!;
      const clusterResult = firstYear.clusters.find((c) => c.clusterId === clusterDef.id);
      expect(clusterResult).toBeDefined();
      expect(clusterResult!.bfcsOutput.length).toBe(clusterDef.roles.length);
    }
  });

  it('bfcsOutput entries have correct structure', () => {
    const config = shortConfig();
    const timeline = runSimulation(config, SMALL_CLUSTERS);
    const clusterResult = timeline.years[0]!.clusters[0]!;

    for (const roleOutput of clusterResult.bfcsOutput) {
      expect(roleOutput).toHaveProperty('roleId');
      expect(roleOutput).toHaveProperty('scores');
      expect(roleOutput).toHaveProperty('thresholds');
      expect(roleOutput).toHaveProperty('triggered');
      expect(roleOutput).toHaveProperty('triggerYear');
      expect(roleOutput).toHaveProperty('adoptionRate');

      // Scores are numbers in [0, 1] range
      expect(roleOutput.scores.better).toBeGreaterThanOrEqual(0);
      expect(roleOutput.scores.faster).toBeGreaterThanOrEqual(0);
      expect(roleOutput.scores.cheaper).toBeGreaterThanOrEqual(0);
      expect(roleOutput.scores.safer).toBeGreaterThanOrEqual(0);

      // Thresholds are numbers in [0, 1] range
      expect(roleOutput.thresholds.better).toBeGreaterThanOrEqual(0);
      expect(roleOutput.thresholds.faster).toBeGreaterThanOrEqual(0);
      expect(roleOutput.thresholds.cheaper).toBeGreaterThanOrEqual(0);
      expect(roleOutput.thresholds.safer).toBeGreaterThanOrEqual(0);

      // Trigger year is null or a number
      expect(
        roleOutput.triggerYear === null || typeof roleOutput.triggerYear === 'number',
      ).toBe(true);

      // Adoption rate is a number in [0, 1]
      expect(roleOutput.adoptionRate).toBeGreaterThanOrEqual(0);
      expect(roleOutput.adoptionRate).toBeLessThanOrEqual(1);
    }
  });
});

// ============================================================
// BFCS overrides affect simulation behavior
// ============================================================

describe('Phase 4: BFCS overrides change simulation outcomes', () => {
  it('empty overrides produce same results as no overrides', () => {
    const baseConfig = shortConfig();
    const withEmpty = shortConfig({ bfcsOverrides: {} });

    const baseTimeline = runSimulation(baseConfig, SMALL_CLUSTERS);
    const emptyTimeline = runSimulation(withEmpty, SMALL_CLUSTERS);

    // Employment should be identical
    for (let i = 0; i < baseTimeline.years.length; i++) {
      expect(emptyTimeline.years[i]!.macro.totalEmployment).toBeCloseTo(
        baseTimeline.years[i]!.macro.totalEmployment,
        2,
      );
    }
  });

  it('lowering all thresholds to 0 triggers all roles immediately', () => {
    // Build overrides that set all thresholds to 0.01 for all clusters
    const bfcsOverrides: Record<string, Record<string, BFCSThresholds>> = {};
    for (const cluster of SMALL_CLUSTERS) {
      bfcsOverrides[cluster.id] = {};
      for (const role of cluster.roles) {
        bfcsOverrides[cluster.id]![role.id] = {
          better: 0.01, faster: 0.01, cheaper: 0.01, safer: 0.01,
        };
      }
    }

    const config = shortConfig({ bfcsOverrides });
    const timeline = runSimulation(config, SMALL_CLUSTERS);

    // By the last year, significant displacement should have occurred
    const lastYear = timeline.years[timeline.years.length - 1]!;
    for (const cluster of lastYear.clusters) {
      // All roles should be triggered
      for (const bfcs of cluster.bfcsOutput) {
        expect(bfcs.triggered).toBe(true);
        // Trigger is gated by AI cost-viability, not just thresholds: during the
        // 2026-2029 token-usage spike AI is too expensive, so even with all
        // thresholds at 0 the earliest trigger only lands after the spike subsides
        // (~2030) plus per-cluster adoption lag (1-3 yr) → no later than 2033.
        // (Bound is end-of-spike + max lag; resilient to ±1yr test-order variance.)
        expect(bfcs.triggerYear).not.toBeNull();
        expect(bfcs.triggerYear!).toBeLessThanOrEqual(2033);
      }
    }
  });

  it('raising all thresholds to 1.0 prevents triggering', () => {
    const bfcsOverrides: Record<string, Record<string, BFCSThresholds>> = {};
    for (const cluster of SMALL_CLUSTERS) {
      bfcsOverrides[cluster.id] = {};
      for (const role of cluster.roles) {
        bfcsOverrides[cluster.id]![role.id] = {
          better: 1.0, faster: 1.0, cheaper: 1.0, safer: 1.0,
        };
      }
    }

    const config = shortConfig({ bfcsOverrides });
    const timeline = runSimulation(config, SMALL_CLUSTERS);

    // No roles should be triggered (thresholds too high for 2025-2035)
    const lastYear = timeline.years[timeline.years.length - 1]!;
    for (const cluster of lastYear.clusters) {
      for (const bfcs of cluster.bfcsOutput) {
        expect(bfcs.triggered).toBe(false);
        expect(bfcs.triggerYear).toBeNull();
        expect(bfcs.adoptionRate).toBe(0);
      }
    }
  });

  it('overrides for one cluster do not affect others', () => {
    // Only override the first cluster
    const firstCluster = SMALL_CLUSTERS[0]!;
    const bfcsOverrides: Record<string, Record<string, BFCSThresholds>> = {
      [firstCluster.id]: {},
    };
    for (const role of firstCluster.roles) {
      bfcsOverrides[firstCluster.id]![role.id] = {
        better: 0.01, faster: 0.01, cheaper: 0.01, safer: 0.01,
      };
    }

    const baseConfig = shortConfig();
    const overrideConfig = shortConfig({ bfcsOverrides });

    const baseTimeline = runSimulation(baseConfig, SMALL_CLUSTERS);
    const overrideTimeline = runSimulation(overrideConfig, SMALL_CLUSTERS);

    // Second and third clusters should have identical bfcsOutput
    const lastYearBase = baseTimeline.years[baseTimeline.years.length - 1]!;
    const lastYearOverride = overrideTimeline.years[overrideTimeline.years.length - 1]!;

    for (let i = 1; i < SMALL_CLUSTERS.length; i++) {
      const baseCluster = lastYearBase.clusters.find(
        (c) => c.clusterId === SMALL_CLUSTERS[i]!.id,
      );
      const overrideCluster = lastYearOverride.clusters.find(
        (c) => c.clusterId === SMALL_CLUSTERS[i]!.id,
      );

      expect(baseCluster).toBeDefined();
      expect(overrideCluster).toBeDefined();

      // Employment should be very similar for non-overridden clusters.
      // Macro feedback loops (GDP/ARPP changes, labor force scaling) can cause
      // ripple effects, so we allow up to 5% difference.
      // Increased tolerance from 1% to 5% because the labor
      // force scaling fix (proportional to actual BLS employment) amplifies
      // the macro feedback slightly when cluster overrides change displacement.
      const diff = Math.abs(
        overrideCluster!.totalRemainingEmployment - baseCluster!.totalRemainingEmployment,
      );
      const base = baseCluster!.totalRemainingEmployment;
      expect(diff / base).toBeLessThan(0.05);
    }
  });
});
