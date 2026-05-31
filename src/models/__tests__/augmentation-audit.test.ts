/**
 * Augmentation Audit — traces AI augmentation vs displacement year-by-year
 * for the default simulation run.
 *
 * Tests 1–6: BFCS triggering, augmentation flow, GDP decomposition,
 * displacement-without-trigger bug check, taper transition, and user-visible GDP.
 */
import { describe, it, expect } from 'vitest';
import { runSimulation, getDefaultSimulationConfig } from '@/models/simulation';
import { DEFAULT_CAPABILITY_TRAJECTORIES, BASELINE_GDP_GROWTH_RATE, DEFAULT_AUGMENTATION_MULTIPLIER } from '@/models/constants';
import type { SimulationConfig, SimulationYearOutput, ClusterDisplacementResult } from '@/types';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function makeConfig(overrides: Partial<SimulationConfig> = {}): SimulationConfig {
  return { ...getDefaultSimulationConfig(), ...overrides };
}

function makeZeroAIConfig(): SimulationConfig {
  const zeroCaps = { ...DEFAULT_CAPABILITY_TRAJECTORIES };
  for (const key of Object.keys(zeroCaps) as Array<keyof typeof zeroCaps>) {
    zeroCaps[key] = { ...zeroCaps[key], ceiling: 0, floor: 0 };
  }
  return makeConfig({ capabilities: zeroCaps });
}

function run(config: SimulationConfig) {
  return runSimulation(config, OCCUPATION_CLUSTERS);
}

function yearOf(timeline: SimulationYearOutput[], y: number) {
  return timeline.find(t => t.year === y)!;
}

function fmt$(v: number): string {
  if (Math.abs(v) >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${v.toFixed(0)}`;
}

function fmtPct(v: number): string {
  return `${(v * 100).toFixed(3)}%`;
}

function fmtN(v: number): string {
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toFixed(0);
}

/* ------------------------------------------------------------------ */
/*  TEST 1: BFCS trigger timing per cluster                          */
/* ------------------------------------------------------------------ */
describe('Test 1: BFCS Trigger Timing', () => {
  it('reports earliest trigger years for all clusters', () => {
    const config = makeConfig();
    const result = run(config);
    const lastYear = result.years[result.years.length - 1]!;

    // For each cluster, find earliest role trigger year
    type TriggerInfo = {
      clusterId: string;
      deploymentType: string;
      earliestTriggerYear: number | null;
      betterScoreAtTrigger: number;
      roleName: string;
    };

    const triggers: TriggerInfo[] = [];

    for (const cluster of OCCUPATION_CLUSTERS) {
      const clusterResult = lastYear.clusters.find(c => c.clusterId === cluster.id);
      if (!clusterResult) continue;

      let earliest: number | null = null;
      let bestBetter = 0;
      let bestRole = '';

      for (const bfcs of clusterResult.bfcsOutput) {
        if (bfcs.triggerYear !== null) {
          if (earliest === null || bfcs.triggerYear < earliest) {
            earliest = bfcs.triggerYear;
            bestRole = bfcs.roleId;
            // Find the betterScore at the trigger year
            const triggerYearData = yearOf(result.years, bfcs.triggerYear);
            if (triggerYearData) {
              const triggerCluster = triggerYearData.clusters.find(c => c.clusterId === cluster.id);
              const triggerBfcs = triggerCluster?.bfcsOutput.find(r => r.roleId === bfcs.roleId);
              bestBetter = triggerBfcs?.scores.better ?? 0;
            }
          }
        }
      }

      triggers.push({
        clusterId: cluster.id,
        deploymentType: cluster.deploymentType,
        earliestTriggerYear: earliest,
        betterScoreAtTrigger: bestBetter,
        roleName: bestRole,
      });
    }

    // Sort by trigger year ascending (nulls last)
    triggers.sort((a, b) => {
      if (a.earliestTriggerYear === null) return 1;
      if (b.earliestTriggerYear === null) return -1;
      return a.earliestTriggerYear - b.earliestTriggerYear;
    });

    // Print the first 15
    console.log('\n=== TEST 1: First 15 Clusters to Trigger ===');
    console.log('Cluster ID                        | Deploy Type | Earliest Trigger | betterScore | Role');
    console.log('----------------------------------+-------------+------------------+-------------+------------------');
    for (const t of triggers.slice(0, 15)) {
      console.log(
        `${t.clusterId.padEnd(34)}| ${t.deploymentType.padEnd(12)}| ${
          t.earliestTriggerYear?.toString().padEnd(17) ?? 'NEVER'.padEnd(17)
        }| ${t.betterScoreAtTrigger.toFixed(4).padEnd(12)}| ${t.roleName}`
      );
    }

    // Count by year thresholds
    const by2030 = triggers.filter(t => t.earliestTriggerYear !== null && t.earliestTriggerYear <= 2030).length;
    const by2035 = triggers.filter(t => t.earliestTriggerYear !== null && t.earliestTriggerYear <= 2035).length;
    const by2040 = triggers.filter(t => t.earliestTriggerYear !== null && t.earliestTriggerYear <= 2040).length;
    const never = triggers.filter(t => t.earliestTriggerYear === null).length;

    console.log(`\nTriggered by 2030: ${by2030} / 51`);
    console.log(`Triggered by 2035: ${by2035} / 51`);
    console.log(`Triggered by 2040: ${by2040} / 51`);
    console.log(`Never triggered:   ${never} / 51`);

    // Also report clusters that never trigger
    if (never > 0) {
      console.log('\nClusters that NEVER trigger:');
      for (const t of triggers.filter(t => t.earliestTriggerYear === null)) {
        console.log(`  ${t.clusterId} (${t.deploymentType})`);
      }
    }

    expect(triggers.length).toBeGreaterThan(0);
  });
});

/* ------------------------------------------------------------------ */
/*  TEST 2: Augmentation vs displacement year by year                */
/* ------------------------------------------------------------------ */
describe('Test 2: Augmentation vs Displacement — Year by Year', () => {
  it('reports augmentation and displacement at key years', () => {
    const config = makeConfig();
    const result = run(config);
    const years = [2026, 2027, 2028, 2029, 2030, 2032, 2035, 2040, 2045, 2050];

    console.log('\n=== TEST 2: Augmentation vs Displacement ===');
    console.log(
      'Year | totalAugOut      | augWageBoost     | augProfitBoost   | displacedWorkers | remainNonTrigg | remainTrigg    | augNonTrigg      | augTrigg'
    );
    console.log('-'.repeat(160));

    for (const y of years) {
      const yr = yearOf(result.years, y);
      if (!yr) continue;

      const m = yr.macro;
      const totalDisplaced = OCCUPATION_CLUSTERS.reduce((sum, cluster) => {
        const cr = yr.clusters.find(c => c.clusterId === cluster.id);
        return sum + (cr?.totalDirectDisplacement ?? 0);
      }, 0);

      // Split clusters by triggered/not-triggered status
      let remainNonTriggered = 0;
      let remainTriggered = 0;
      let augNonTriggered = 0;
      let augTriggered = 0;

      for (const cluster of OCCUPATION_CLUSTERS) {
        const cr = yr.clusters.find(c => c.clusterId === cluster.id);
        if (!cr) continue;

        const anyTriggered = cr.bfcsOutput.some(b => b.triggered);
        if (anyTriggered) {
          remainTriggered += cr.totalRemainingEmployment;
          // Estimate augmentation for triggered clusters
          // (actual augmentation is inside totalAugmentationOutput, but we can check)
        } else {
          remainNonTriggered += cr.totalRemainingEmployment;
        }
      }

      // We can't split augmentation directly from output, but we have the total
      // Let's compute it manually for the split
      augNonTriggered = 0;
      augTriggered = 0;
      for (const cluster of OCCUPATION_CLUSTERS) {
        const cr = yr.clusters.find(c => c.clusterId === cluster.id);
        if (!cr) continue;
        const anyTriggered = cr.bfcsOutput.some(b => b.triggered);
        // We don't have per-cluster augmentation in the output, but we have bfcsOutput
        // Approximate: sum betterScore * remainingEmployment * avgWage * augMultiplier * taper
        let clusterAug = 0;
        for (const bfcs of cr.bfcsOutput) {
          const roleResult = cr.roles.find(r => r.roleId === bfcs.roleId);
          if (!roleResult) continue;
          const taper = bfcs.triggered ? (1 - bfcs.adoptionRate) : 1.0;
          clusterAug += roleResult.remainingEmployment * roleResult.remainingWage / (roleResult.remainingEmployment || 1) * bfcs.scores.better * DEFAULT_AUGMENTATION_MULTIPLIER * taper;
        }
        // Actually, remainingWage is total for the role, not per-worker. Let's use avgWage
        // Recompute properly:
        clusterAug = 0;
        for (const bfcs of cr.bfcsOutput) {
          const roleResult = cr.roles.find(r => r.roleId === bfcs.roleId);
          if (!roleResult) continue;
          const taper = bfcs.triggered ? (1 - bfcs.adoptionRate) : 1.0;
          const avgRoleWage = roleResult.remainingEmployment > 0 ? roleResult.remainingWage / roleResult.remainingEmployment : 0;
          clusterAug += roleResult.remainingEmployment * avgRoleWage * bfcs.scores.better * DEFAULT_AUGMENTATION_MULTIPLIER * taper;
        }

        if (anyTriggered) {
          augTriggered += clusterAug;
        } else {
          augNonTriggered += clusterAug;
        }
      }

      console.log(
        `${y} | ${fmt$(m.totalAugmentationOutput).padEnd(17)}| ${fmt$(m.augmentationWageBoost).padEnd(17)}| ${fmt$(m.augmentationProfitBoost).padEnd(17)}| ${fmtN(totalDisplaced).padEnd(17)}| ${fmtN(remainNonTriggered).padEnd(15)}| ${fmtN(remainTriggered).padEnd(15)}| ${fmt$(augNonTriggered).padEnd(17)}| ${fmt$(augTriggered)}`
      );
    }

    expect(true).toBe(true); // diagnostic only
  });
});

/* ------------------------------------------------------------------ */
/*  TEST 3: GDP decomposition in the augmentation window             */
/* ------------------------------------------------------------------ */
describe('Test 3: GDP Decomposition (2025-2032)', () => {
  it('reports GDP components during the augmentation window', () => {
    const config = makeConfig();
    const defaultResult = run(config);
    const zeroResult = run(makeZeroAIConfig());

    console.log('\n=== TEST 3: GDP Decomposition (Augmentation Window) ===');
    console.log(
      'Year | gdpNominal       | gdpReal          | priceLevel | totalAugOut      | displaced  | consumption      | aiDeflRate | sectorDefl | velocMult | netInflation | composInfl | zeroAI gdpReal   | Δ realGDP'
    );
    console.log('-'.repeat(210));

    for (let y = 2025; y <= 2032; y++) {
      const yr = yearOf(defaultResult.years, y);
      const zr = yearOf(zeroResult.years, y);
      if (!yr) continue;

      const m = yr.macro;
      const totalDisplaced = yr.clusters.reduce((sum, c) => sum + c.totalDirectDisplacement, 0);
      const zeroGdpReal = zr?.macro.gdpReal ?? 0;
      const deltaGdp = m.gdpReal - zeroGdpReal;

      console.log(
        `${y} | ${fmt$(m.gdpNominal).padEnd(17)}| ${fmt$(m.gdpReal).padEnd(17)}| ${m.priceLevel.toFixed(4).padEnd(11)}| ${fmt$(m.totalAugmentationOutput).padEnd(17)}| ${fmtN(totalDisplaced).padEnd(11)}| ${fmt$(m.consumption).padEnd(17)}| ${fmtPct(m.aiDeflationRate).padEnd(11)}| ${fmtPct(m.sectorWeightedDeflationRate).padEnd(11)}| ${m.velocityMultiplier.toFixed(4).padEnd(10)}| ${fmtPct(m.netInflation).padEnd(13)}| ${fmtPct(m.compositeInflation).padEnd(11)}| ${fmt$(zeroGdpReal).padEnd(17)}| ${fmt$(deltaGdp)}`
      );
    }

    // Also report growth rates
    console.log('\n--- Growth rate comparison ---');
    console.log('Year | Default realGDP growth | Zero-AI realGDP growth | Difference');
    console.log('-----+------------------------+------------------------+-----------');
    for (let y = 2026; y <= 2032; y++) {
      const yr = yearOf(defaultResult.years, y);
      const prevYr = yearOf(defaultResult.years, y - 1);
      const zr = yearOf(zeroResult.years, y);
      const prevZr = yearOf(zeroResult.years, y - 1);
      if (!yr || !prevYr || !zr || !prevZr) continue;

      const defaultGrowth = (yr.macro.gdpReal - prevYr.macro.gdpReal) / prevYr.macro.gdpReal;
      const zeroGrowth = (zr.macro.gdpReal - prevZr.macro.gdpReal) / prevZr.macro.gdpReal;

      console.log(
        `${y} | ${fmtPct(defaultGrowth).padEnd(23)}| ${fmtPct(zeroGrowth).padEnd(23)}| ${fmtPct(defaultGrowth - zeroGrowth)}`
      );
    }

    expect(true).toBe(true); // diagnostic only
  });
});

/* ------------------------------------------------------------------ */
/*  TEST 4: Displacement without BFCS trigger — bug check            */
/* ------------------------------------------------------------------ */
describe('Test 4: No Displacement Without BFCS Trigger', () => {
  it('verifies zero displacement for late-triggering clusters before their trigger year', () => {
    const config = makeConfig();
    const result = run(config);
    const lastYear = result.years[result.years.length - 1]!;

    // Find a cluster that triggers very late (2040+) or never
    const lateCluster = OCCUPATION_CLUSTERS.find(cluster => {
      const cr = lastYear.clusters.find(c => c.clusterId === cluster.id);
      if (!cr) return false;
      const earliestTrigger = cr.bfcsOutput.reduce((min, b) => {
        if (b.triggerYear === null) return min;
        return min === null ? b.triggerYear : Math.min(min, b.triggerYear);
      }, null as number | null);
      return earliestTrigger === null || earliestTrigger >= 2040;
    });

    if (!lateCluster) {
      console.log('\nTest 4: No cluster found that triggers at 2040+ — all trigger earlier.');
      console.log('Listing latest-triggering clusters:');
      const sorted = OCCUPATION_CLUSTERS.map(cluster => {
        const cr = lastYear.clusters.find(c => c.clusterId === cluster.id);
        const earliestTrigger = cr?.bfcsOutput.reduce((min, b) => {
          if (b.triggerYear === null) return min;
          return min === null ? b.triggerYear : Math.min(min, b.triggerYear);
        }, null as number | null) ?? null;
        return { id: cluster.id, trigger: earliestTrigger };
      }).sort((a, b) => (b.trigger ?? 9999) - (a.trigger ?? 9999));
      for (const s of sorted.slice(0, 5)) {
        console.log(`  ${s.id}: earliest trigger = ${s.trigger ?? 'NEVER'}`);
      }
      expect(true).toBe(true);
      return;
    }

    console.log(`\n=== TEST 4: Bug Check — Cluster "${lateCluster.id}" (${lateCluster.deploymentType}) ===`);

    // Check year 2035
    const yr2035 = yearOf(result.years, 2035);
    const cr2035 = yr2035.clusters.find(c => c.clusterId === lateCluster.id)!;

    console.log(`\nAt year 2035:`);
    console.log(`Cluster: ${lateCluster.id}`);

    // Report adoption rates per role
    console.log('\nRole adoption rates:');
    for (const bfcs of cr2035.bfcsOutput) {
      console.log(`  ${bfcs.roleId}: triggered=${bfcs.triggered}, triggerYear=${bfcs.triggerYear}, adoptionRate=${bfcs.adoptionRate.toFixed(6)}, betterScore=${bfcs.scores.better.toFixed(4)}`);
    }

    console.log(`\ntotalDirectDisplacement: ${cr2035.totalDirectDisplacement.toFixed(2)}`);
    console.log(`totalRemainingEmployment: ${fmtN(cr2035.totalRemainingEmployment)}`);

    // Check per-role displacement
    console.log('\nRole displacement:');
    for (const role of cr2035.roles) {
      console.log(`  ${role.roleId}: displacementPct=${role.displacementPct.toFixed(6)}, remaining=${fmtN(role.remainingEmployment)}`);
    }

    // Flag if any non-triggered role has displacement
    let bugFound = false;
    for (const bfcs of cr2035.bfcsOutput) {
      if (!bfcs.triggered && bfcs.adoptionRate > 0) {
        console.log(`\n** BUG: Role ${bfcs.roleId} has adoptionRate=${bfcs.adoptionRate} but triggered=false! **`);
        bugFound = true;
      }
    }
    for (const role of cr2035.roles) {
      const bfcs = cr2035.bfcsOutput.find(b => b.roleId === role.roleId);
      if (bfcs && !bfcs.triggered && role.displacementPct > 0) {
        console.log(`\n** BUG: Role ${role.roleId} has displacementPct=${role.displacementPct} but BFCS not triggered! **`);
        bugFound = true;
      }
    }

    if (!bugFound) {
      console.log('\nNo displacement-without-trigger bugs found. ✓');
    }

    // Report augmentation for this cluster
    // Augmentation should be positive if betterScore > 0
    const anyBetter = cr2035.bfcsOutput.some(b => b.scores.better > 0);
    console.log(`\nAny betterScore > 0? ${anyBetter}`);
    console.log(`totalAugmentationOutput (macro): ${fmt$(yr2035.macro.totalAugmentationOutput)}`);

    expect(bugFound).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  TEST 5: Taper transition for an early-triggering software cluster */
/* ------------------------------------------------------------------ */
describe('Test 5: Taper Transition', () => {
  it('traces augmentation taper for an early-triggering cluster', () => {
    const config = makeConfig();
    const result = run(config);
    const lastYear = result.years[result.years.length - 1]!;

    // Find a software cluster that triggers between 2028-2030
    let targetCluster: typeof OCCUPATION_CLUSTERS[0] | null = null;
    let targetTriggerYear = 0;
    let targetRoleId = '';

    for (const cluster of OCCUPATION_CLUSTERS) {
      if (cluster.deploymentType !== 'software') continue;
      const cr = lastYear.clusters.find(c => c.clusterId === cluster.id);
      if (!cr) continue;

      for (const bfcs of cr.bfcsOutput) {
        if (bfcs.triggerYear !== null && bfcs.triggerYear >= 2028 && bfcs.triggerYear <= 2032) {
          if (!targetCluster || bfcs.triggerYear < targetTriggerYear) {
            targetCluster = cluster;
            targetTriggerYear = bfcs.triggerYear;
            targetRoleId = bfcs.roleId;
          }
        }
      }
    }

    if (!targetCluster) {
      console.log('\nTest 5: No software cluster triggers between 2028-2032.');
      // Find the earliest triggering software cluster instead
      for (const cluster of OCCUPATION_CLUSTERS) {
        if (cluster.deploymentType !== 'software') continue;
        const cr = lastYear.clusters.find(c => c.clusterId === cluster.id);
        if (!cr) continue;
        for (const bfcs of cr.bfcsOutput) {
          if (bfcs.triggerYear !== null) {
            if (!targetCluster || bfcs.triggerYear < targetTriggerYear) {
              targetCluster = cluster;
              targetTriggerYear = bfcs.triggerYear;
              targetRoleId = bfcs.roleId;
            }
          }
        }
      }
      if (targetCluster) {
        console.log(`Using earliest software trigger: ${targetCluster.id} at ${targetTriggerYear}`);
      } else {
        console.log('No software clusters trigger at all!');
        expect(true).toBe(true);
        return;
      }
    }

    console.log(`\n=== TEST 5: Taper Transition — "${targetCluster!.id}" (trigger=${targetTriggerYear}, role=${targetRoleId}) ===`);
    console.log(
      'Year | betterScore | triggered | adoptionRate | displacePct | clusterAugEst    | taper'
    );
    console.log('-'.repeat(100));

    const startTraceYear = Math.max(2026, targetTriggerYear - 3);
    const endTraceYear = Math.min(2050, targetTriggerYear + 7);

    for (let y = startTraceYear; y <= endTraceYear; y++) {
      const yr = yearOf(result.years, y);
      if (!yr) continue;
      const cr = yr.clusters.find(c => c.clusterId === targetCluster!.id);
      if (!cr) continue;

      const bfcs = cr.bfcsOutput.find(b => b.roleId === targetRoleId);
      const roleResult = cr.roles.find(r => r.roleId === targetRoleId);
      if (!bfcs || !roleResult) continue;

      const taper = bfcs.triggered ? (1 - bfcs.adoptionRate) : 1.0;
      const avgWage = roleResult.remainingEmployment > 0 ? roleResult.remainingWage / roleResult.remainingEmployment : 0;
      const roleAug = roleResult.remainingEmployment * avgWage * bfcs.scores.better * DEFAULT_AUGMENTATION_MULTIPLIER * taper;

      console.log(
        `${y} | ${bfcs.scores.better.toFixed(4).padEnd(12)}| ${String(bfcs.triggered).padEnd(10)}| ${bfcs.adoptionRate.toFixed(6).padEnd(13)}| ${roleResult.displacementPct.toFixed(6).padEnd(12)}| ${fmt$(roleAug).padEnd(17)}| ${taper.toFixed(4)}`
      );
    }

    // Check: before trigger, displacement should be 0
    for (let y = startTraceYear; y < targetTriggerYear; y++) {
      const yr = yearOf(result.years, y);
      if (!yr) continue;
      const cr = yr.clusters.find(c => c.clusterId === targetCluster!.id);
      const bfcs = cr?.bfcsOutput.find(b => b.roleId === targetRoleId);
      const roleResult = cr?.roles.find(r => r.roleId === targetRoleId);
      if (bfcs && !bfcs.triggered) {
        expect(bfcs.adoptionRate).toBe(0);
      }
    }

    expect(true).toBe(true); // diagnostic
  });
});

/* ------------------------------------------------------------------ */
/*  TEST 6: What the user actually sees — GDP comparison             */
/* ------------------------------------------------------------------ */
describe('Test 6: User-Visible GDP Impact', () => {
  it('compares default-AI vs zero-AI real GDP', () => {
    const defaultResult = run(makeConfig());
    const zeroResult = run(makeZeroAIConfig());

    console.log('\n=== TEST 6: Real GDP — Default AI vs Zero AI ===');
    console.log(
      'Year | Default realGDP   | Zero-AI realGDP   | Δ absolute       | Δ pct     | Default growth | Zero-AI growth | augOutput'
    );
    console.log('-'.repeat(150));

    let prevDefault: SimulationYearOutput | null = null;
    let prevZero: SimulationYearOutput | null = null;

    for (let y = 2025; y <= 2035; y++) {
      const dyr = yearOf(defaultResult.years, y);
      const zyr = yearOf(zeroResult.years, y);
      if (!dyr || !zyr) continue;

      const delta = dyr.macro.gdpReal - zyr.macro.gdpReal;
      const deltaPct = zyr.macro.gdpReal > 0 ? delta / zyr.macro.gdpReal : 0;
      const defaultGrowth = prevDefault ? (dyr.macro.gdpReal - prevDefault.macro.gdpReal) / prevDefault.macro.gdpReal : 0;
      const zeroGrowth = prevZero ? (zyr.macro.gdpReal - prevZero.macro.gdpReal) / prevZero.macro.gdpReal : 0;

      console.log(
        `${y} | ${fmt$(dyr.macro.gdpReal).padEnd(18)}| ${fmt$(zyr.macro.gdpReal).padEnd(18)}| ${fmt$(delta).padEnd(17)}| ${fmtPct(deltaPct).padEnd(10)}| ${fmtPct(defaultGrowth).padEnd(15)}| ${fmtPct(zeroGrowth).padEnd(15)}| ${fmt$(dyr.macro.totalAugmentationOutput)}`
      );

      prevDefault = dyr;
      prevZero = zyr;
    }

    // Extended view to 2050
    console.log('\n--- Extended to 2050 ---');
    for (const y of [2035, 2040, 2045, 2050]) {
      const dyr = yearOf(defaultResult.years, y);
      const zyr = yearOf(zeroResult.years, y);
      if (!dyr || !zyr) continue;

      const delta = dyr.macro.gdpReal - zyr.macro.gdpReal;
      console.log(
        `${y} | Default: ${fmt$(dyr.macro.gdpReal)} | Zero-AI: ${fmt$(zyr.macro.gdpReal)} | Δ: ${fmt$(delta)} | Aug: ${fmt$(dyr.macro.totalAugmentationOutput)} | Displaced: ${fmtN(dyr.clusters.reduce((s, c) => s + c.totalDirectDisplacement, 0))}`
      );
    }

    // Verdict
    const yr2030d = yearOf(defaultResult.years, 2030);
    const yr2030z = yearOf(zeroResult.years, 2030);
    if (yr2030d && yr2030z) {
      const delta2030 = yr2030d.macro.gdpReal - yr2030z.macro.gdpReal;
      const pct2030 = delta2030 / yr2030z.macro.gdpReal;
      console.log(`\n=== VERDICT ===`);
      console.log(`At 2030, default-AI real GDP vs zero-AI: ${fmt$(delta2030)} (${fmtPct(pct2030)})`);
      console.log(`Augmentation output at 2030: ${fmt$(yr2030d.macro.totalAugmentationOutput)}`);
      if (Math.abs(pct2030) < 0.005) {
        console.log(`STATUS: Augmentation is effectively INVISIBLE on a GDP chart (<0.5% difference).`);
        if (yr2030d.macro.totalAugmentationOutput > 0) {
          console.log(`DIAGNOSIS: Augmentation IS being computed but too small to visually distinguish.`);
        } else {
          console.log(`DIAGNOSIS: Augmentation output is ZERO — something is absorbing it entirely.`);
        }
      } else if (pct2030 > 0) {
        console.log(`STATUS: Augmentation is WORKING and visible (${fmtPct(pct2030)} GDP uplift).`);
      } else {
        console.log(`STATUS: Default-AI GDP is LOWER than zero-AI — displacement outweighs augmentation already by 2030.`);
      }
    }

    expect(true).toBe(true); // diagnostic
  });
});
