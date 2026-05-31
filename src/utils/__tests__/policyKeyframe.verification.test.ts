/**
 * Phase 5e Verification Tests: Leak Test + Ramp Test
 *
 * LEAK TEST: UBI schedule with single keyframe at 2035 ($2000/mo).
 * Years 2025-2034 must produce IDENTICAL output to no-policy baseline.
 *
 * RAMP TEST: UBI schedule with two keyframes (2032: $500, 2040: $3000).
 * Verify interpolation at 2036 = $1500, and transfer income reflects it.
 */

import { describe, it, expect } from 'vitest';
import { runSimulation, getDefaultSimulationConfig } from '@/models/simulation';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { loadBLSData } from '@/services/dataLoader';
import { transformOEWSToBaselines, createOtherClusterBaseline } from '@/services/dataTransform';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
import { deriveStateOccupationDistributions, populateStateDistributions } from '@/data/stateTransform';
import { interpolatePolicy } from '@/utils/policyInterpolation';
import type { OccupationBaseline, StateCode, StateData } from '@/types';

// Load BLS data (same as store)
let blsBaselines: Map<string, OccupationBaseline> | undefined;
let stateDataMap: Map<StateCode, StateData> | undefined;

const blsResult = loadBLSData();
if (blsResult.isLoaded) {
  const transformed = transformOEWSToBaselines(blsResult.oews, OCCUPATION_CLUSTERS, DEFAULT_ROLE_ESTIMATION_CONFIG);
  blsBaselines = transformed.baselines;
  const otherCluster = OCCUPATION_CLUSTERS.find(c => c.id === 'other_uncategorized');
  if (otherCluster && !blsBaselines.has('other_uncategorized')) {
    blsBaselines.set('other_uncategorized', createOtherClusterBaseline(blsBaselines, otherCluster));
  }
  if (blsResult.stateOEWS && blsResult.stateLAUS && blsBaselines) {
    const stateResult = deriveStateOccupationDistributions(blsResult.stateOEWS, blsResult.stateLAUS, blsBaselines);
    stateDataMap = stateResult.stateDataMap;
    populateStateDistributions(blsBaselines, stateDataMap);
  }
}

describe('Phase 5e: Policy Keyframe Verification', () => {
  it('LEAK TEST: UBI at 2035 produces identical output for 2025-2034 vs no-policy', () => {
    // No-policy baseline
    const configNP = getDefaultSimulationConfig();
    const timelineNP = runSimulation(configNP, OCCUPATION_CLUSTERS, blsBaselines, stateDataMap);

    // UBI with single keyframe at 2035
    const configUBI = getDefaultSimulationConfig();
    configUBI.policyConfig.ubi.enabled = true;
    configUBI.policyConfig.ubi.monthlyAmount = { keyframes: [{ year: 2035, value: 2000 }] };
    const timelineUBI = runSimulation(configUBI, OCCUPATION_CLUSTERS, blsBaselines, stateDataMap);

    console.log('\n=== LEAK TEST: UBI starts at 2035, $2000/mo ===');
    console.log('Year | NP GDP($T)  | UBI GDP($T) | NP CWI   | UBI CWI  | MATCH?');

    for (let y = 2025; y <= 2050; y++) {
      const npYear = timelineNP.years.find(yr => yr.year === y)!;
      const ubiYear = timelineUBI.years.find(yr => yr.year === y)!;

      if (y % 5 === 0 || y === 2034 || y === 2035) {
        const match = y < 2035
          ? npYear.macro.gdpNominal === ubiYear.macro.gdpNominal ? 'OK' : '** LEAK **'
          : 'N/A';
        console.log(
          `${y} | $${(npYear.macro.gdpNominal / 1e12).toFixed(3).padStart(8)} | $${(ubiYear.macro.gdpNominal / 1e12).toFixed(3).padStart(8)} | ${npYear.macro.consumerWelfareIndex.toFixed(0).padStart(8)} | ${ubiYear.macro.consumerWelfareIndex.toFixed(0).padStart(8)} | ${match}`
        );
      }

      // Before first keyframe year, ALL macro values must be identical
      if (y < 2035) {
        expect(ubiYear.macro.gdpNominal).toBe(npYear.macro.gdpNominal);
        expect(ubiYear.macro.consumerWelfareIndex).toBe(npYear.macro.consumerWelfareIndex);
        expect(ubiYear.macro.aggregateTransferIncome).toBe(npYear.macro.aggregateTransferIncome);
        expect(ubiYear.macro.aggregateWageIncome).toBe(npYear.macro.aggregateWageIncome);
        expect(ubiYear.macro.effectiveInflationRate).toBe(npYear.macro.effectiveInflationRate);
      }
    }

    // After 2035, UBI should add transfer income
    const y2036NP = timelineNP.years.find(yr => yr.year === 2036)!;
    const y2036UBI = timelineUBI.years.find(yr => yr.year === 2036)!;
    expect(y2036UBI.macro.aggregateTransferIncome).toBeGreaterThan(y2036NP.macro.aggregateTransferIncome);
  });

  it('RAMP TEST: UBI $500 at 2032, $3000 at 2040 — verify interpolation', () => {
    const schedule = { keyframes: [{ year: 2032, value: 500 }, { year: 2040, value: 3000 }] };

    // Verify interpolation values
    expect(interpolatePolicy(schedule, 2025)).toBe(0);    // before first keyframe
    expect(interpolatePolicy(schedule, 2031)).toBe(0);    // still before
    expect(interpolatePolicy(schedule, 2032)).toBe(500);  // at first keyframe
    expect(interpolatePolicy(schedule, 2036)).toBe(1750); // midpoint: 500 + (4/8)*(3000-500)
    expect(interpolatePolicy(schedule, 2040)).toBe(3000); // at second keyframe
    expect(interpolatePolicy(schedule, 2050)).toBe(3000); // after last — holds steady

    // Run simulation with ramp schedule
    const config = getDefaultSimulationConfig();
    config.policyConfig.ubi.enabled = true;
    config.policyConfig.ubi.monthlyAmount = schedule;
    const timeline = runSimulation(config, OCCUPATION_CLUSTERS, blsBaselines, stateDataMap);

    console.log('\n=== RAMP TEST: UBI $500 at 2032, $3000 at 2040 ===');
    console.log('Year | Interpolated UBI | Transfer Inc ($T) | GDP ($T)');

    for (const yr of timeline.years) {
      const y = yr.year;
      const ubiVal = interpolatePolicy(schedule, y);
      if (y >= 2030 && y <= 2042) {
        console.log(
          `${y} | $${ubiVal.toFixed(0).padStart(14)}/mo | $${(yr.macro.aggregateTransferIncome / 1e12).toFixed(4).padStart(12)} | $${(yr.macro.gdpNominal / 1e12).toFixed(3).padStart(8)}`
        );
      }
    }

    // Transfer income at 2036 should be higher than at 2032 (ramp-up)
    const y2032 = timeline.years.find(yr => yr.year === 2032)!;
    const y2036 = timeline.years.find(yr => yr.year === 2036)!;
    expect(y2036.macro.aggregateTransferIncome).toBeGreaterThan(y2032.macro.aggregateTransferIncome);

    // Transfer income at 2040 should be higher than at 2036
    const y2040 = timeline.years.find(yr => yr.year === 2040)!;
    expect(y2040.macro.aggregateTransferIncome).toBeGreaterThan(y2036.macro.aggregateTransferIncome);

    // Verify no-policy years (2025-2031) are unaffected
    const configNP = getDefaultSimulationConfig();
    const timelineNP = runSimulation(configNP, OCCUPATION_CLUSTERS, blsBaselines, stateDataMap);
    for (let y = 2025; y <= 2031; y++) {
      const npYear = timelineNP.years.find(yr => yr.year === y)!;
      const rampYear = timeline.years.find(yr => yr.year === y)!;
      expect(rampYear.macro.gdpNominal).toBe(npYear.macro.gdpNominal);
    }
  });
});
