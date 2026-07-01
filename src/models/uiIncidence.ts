/**
 * THE DISPLACED-WORKER INCIDENCE OBJECT (FS-6b).
 *
 * Builds, per simulation year, the distribution of displaced workers across the baseline
 * wage quintiles, from the cluster×role outputs the simulation already produces. The
 * INCIDENCE machinery (quintile shares) is pure post-processing on the finished timeline.
 * The DISPLACED-POOL PRICE (computeDisplacedPool) is additionally consumed ON the simulation
 * path since the close-out §9 item-3 ruled fix: it prices enhanced-UI dollars at the
 * displaced pool's prior wage (zero displacement → the pool is empty and pricing reduces to
 * the economy average — the Gate-A identity).
 *
 * THE NORMALIZATION THIS BUILD READS (the binding prophylactic, stated):
 * - Role-level DIRECT displacement = role employment at year 0 minus role remaining
 *   employment at year t — both from `RoleDisplacementResult.remainingEmployment`, in the
 *   simulation's own normalized employment units. Year 0 carries no displacement in any
 *   scenario (the trigger map is dormant at the start year by construction), so the year-0
 *   remaining employment IS the baseline.
 * - Cluster-level SECOND-ORDER displacement (`ClusterDisplacementResult.secondOrderDisplacement`,
 *   already bounded per cluster by min(direct × (multiplier − 1), remaining)) is not
 *   role-resolved by the model; it is allocated across the cluster's roles in proportion to
 *   their year-0 employment (stated v1 allocation).
 * - This module reads NOTHING from computeAggregateDisplacement — in particular not its
 *   weightedAverageWage, whose wage/population pairing differs from its bounded remaining
 *   when the per-cluster bound binds. Shares here are built from role-level data only and
 *   are invariant to the level of the model's average wage.
 * - Wages are the role's year-0 remainingWage (the simulation's own per-role wage, OEWS-derived
 *   for clusters with loaded data). UI-dollar routing is wage-PROPORTIONAL and uncapped (v1:
 *   real-world UI benefit caps would compress the top quintiles' dollar shares; uncapped is
 *   the upper bound on top-quintile incidence and is stated wherever the shares are used).
 *
 * The wage quintiles are the BASELINE (year-0) worker-weighted wage distribution: boundaries
 * cut the cumulative year-0 employment at 20/40/60/80%; a role whose employment mass straddles
 * a boundary is split pro-rata, so the five baseline masses are exactly equal.
 */
import type { ClusterDisplacementResult, SimulationYearOutput } from '@/types';

export interface DisplacedIncidenceYear {
  year: number;
  /** total displaced (direct + allocated second-order), simulation employment units */
  totalDisplaced: number;
  /** displaced HEADCOUNT shares per baseline wage quintile (sum 1; all 0 when none displaced) */
  headcountShares: number[];
  /** displaced WAGE-MASS shares per quintile (the wage-proportional UI routing; sum 1 or 0) */
  wageMassShares: number[];
  /** employment-weighted mean wage of the displaced vs the baseline economy (display) */
  avgDisplacedWage: number;
  avgBaselineWage: number;
}

interface RoleAtom {
  clusterId: string;
  roleId: string;
  baselineEmployment: number;
  wage: number;
  /** the atom's baseline-mass allocation across the five quintiles (sums to baselineEmployment) */
  quintileMass: number[];
}

/** Build the baseline atoms and their quintile allocations from the year-0 cluster results. */
function buildAtoms(year0Clusters: ClusterDisplacementResult[]): RoleAtom[] {
  const atoms: RoleAtom[] = [];
  for (const c of year0Clusters) {
    for (const r of c.roles) {
      if (r.remainingEmployment > 0) {
        atoms.push({
          clusterId: c.clusterId,
          roleId: r.roleId,
          baselineEmployment: r.remainingEmployment,
          wage: r.remainingWage,
          quintileMass: [0, 0, 0, 0, 0],
        });
      }
    }
  }
  atoms.sort((a, b) => a.wage - b.wage);
  const total = atoms.reduce((s, a) => s + a.baselineEmployment, 0);
  // walk the cumulative distribution; split straddling atoms pro-rata across boundaries
  let cum = 0;
  for (const a of atoms) {
    let remaining = a.baselineEmployment;
    while (remaining > 0) {
      const q = Math.min(4, Math.floor((cum / total) * 5));
      const quintileEnd = ((q + 1) * total) / 5;
      const take = Math.min(remaining, quintileEnd - cum);
      a.quintileMass[q]! += take;
      cum += take;
      remaining -= take;
      if (take <= 0) { a.quintileMass[q]! += remaining; cum += remaining; break; } // guard: fp edge
    }
  }
  return atoms;
}

function groupByCluster(atoms: RoleAtom[]): Map<string, RoleAtom[]> {
  const byCluster = new Map<string, RoleAtom[]>();
  for (const a of atoms) {
    const list = byCluster.get(a.clusterId) ?? [];
    list.push(a);
    byCluster.set(a.clusterId, list);
  }
  return byCluster;
}

/** The single per-year displaced accumulation both consumers read (direct role-level +
 * cluster second-order allocated ∝ year-0 role mix — the stated v1 allocation). */
function accumulateDisplaced(
  byCluster: Map<string, RoleAtom[]>,
  yearClusters: ClusterDisplacementResult[],
): { totalDisplaced: number; displacedWageSum: number; head: number[]; mass: number[] } {
  const head = [0, 0, 0, 0, 0];
  const mass = [0, 0, 0, 0, 0];
  let totalDisplaced = 0;
  let displacedWageSum = 0;
  for (const c of yearClusters) {
    const clusterAtoms = byCluster.get(c.clusterId);
    if (!clusterAtoms || clusterAtoms.length === 0) continue;
    const clusterBaseline = clusterAtoms.reduce((s, a) => s + a.baselineEmployment, 0);
    const remainingByRole = new Map(c.roles.map(r => [r.roleId, r.remainingEmployment]));
    for (const a of clusterAtoms) {
      const remaining = remainingByRole.get(a.roleId) ?? 0;
      const direct = Math.max(0, a.baselineEmployment - remaining);
      // second-order allocated ∝ year-0 role mix (stated v1)
      const secondOrder = clusterBaseline > 0
        ? c.secondOrderDisplacement * (a.baselineEmployment / clusterBaseline)
        : 0;
      const displaced = direct + secondOrder;
      if (displaced <= 0) continue;
      totalDisplaced += displaced;
      displacedWageSum += displaced * a.wage;
      // distribute the atom's displaced mass across quintiles ∝ its baseline quintile split
      for (let q = 0; q < 5; q++) {
        const frac = a.quintileMass[q]! / a.baselineEmployment;
        head[q]! += displaced * frac;
        mass[q]! += displaced * a.wage * frac;
      }
    }
  }
  return { totalDisplaced, displacedWageSum, head, mass };
}

/**
 * THE DISPLACED-POOL PRICE OBJECT (the close-out §9 item-3 ruled fix). Per year: the size of
 * the displaced pool and its employment-weighted PRIOR wage (year-0 vintage, the same basis
 * as the incidence object — this IS the incidence math, exported so the simulation loop can
 * price enhanced-UI dollars at the wage the benefits actually replace). Pure; reads only the
 * cluster results the loop already produces.
 */
export function computeDisplacedPool(
  year0Clusters: ClusterDisplacementResult[],
  yearClusters: ClusterDisplacementResult[],
): { count: number; avgWage: number } {
  const byCluster = groupByCluster(buildAtoms(year0Clusters));
  const { totalDisplaced, displacedWageSum } = accumulateDisplaced(byCluster, yearClusters);
  return {
    count: totalDisplaced,
    avgWage: totalDisplaced > 0 ? displacedWageSum / totalDisplaced : 0,
  };
}

export function computeDisplacedIncidence(years: SimulationYearOutput[]): DisplacedIncidenceYear[] {
  if (years.length === 0) return [];
  const atoms = buildAtoms(years[0]!.clusters);
  const byCluster = groupByCluster(atoms);
  const baselineTotal = atoms.reduce((s, a) => s + a.baselineEmployment, 0);
  const avgBaselineWage = baselineTotal > 0
    ? atoms.reduce((s, a) => s + a.wage * a.baselineEmployment, 0) / baselineTotal
    : 0;

  const out: DisplacedIncidenceYear[] = [];
  for (const y of years) {
    const { totalDisplaced, displacedWageSum, head, mass } = accumulateDisplaced(byCluster, y.clusters);
    const headTotal = head.reduce((s, v) => s + v, 0);
    const massTotal = mass.reduce((s, v) => s + v, 0);
    out.push({
      year: y.year,
      totalDisplaced,
      headcountShares: headTotal > 0 ? head.map(v => v / headTotal) : [0, 0, 0, 0, 0],
      wageMassShares: massTotal > 0 ? mass.map(v => v / massTotal) : [0, 0, 0, 0, 0],
      avgDisplacedWage: totalDisplaced > 0 ? displacedWageSum / totalDisplaced : 0,
      avgBaselineWage,
    });
  }
  return out;
}
