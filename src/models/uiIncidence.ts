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
  /** H2 (the CWI audit finding-5 ruled build): per quintile, the fraction of the BASELINE
   *  (year-0) quintile wage mass that survives displacement — 1 − displacedMass_q/baselineMass_q,
   *  clamped at 0; all 1 when nothing is displaced. Wage masses are year-0 vintage on both
   *  sides (the same basis as wageMassShares). Consumed by the quintile welfare layer to
   *  re-shape the baseline CBO wage shares each year (quintileCWI.ts dynamicWageShares). */
  wageMassSurvival: number[];
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
  // H2: the baseline (year-0) wage mass per quintile — the survival denominators. Same atom
  // walk that defines the quintiles themselves, so the five masses share the shares' basis.
  const baselineQuintileWageMass = [0, 0, 0, 0, 0];
  for (const a of atoms) {
    for (let q = 0; q < 5; q++) baselineQuintileWageMass[q]! += a.quintileMass[q]! * a.wage;
  }

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
      wageMassSurvival: baselineQuintileWageMass.map((b, q) =>
        b > 0 ? Math.max(0, 1 - mass[q]! / b) : 1),
      avgDisplacedWage: totalDisplaced > 0 ? displacedWageSum / totalDisplaced : 0,
      avgBaselineWage,
    });
  }
  return out;
}

// ============================================================
// THE DURATION-STRUCTURED DISPLACED POOL (the coupled design checkpoint §5, mini-stage 3)
// ============================================================

/**
 * Plain English: displaced workers are not an undifferentiated stock. Time out of work
 * drives three things the aggregate cannot express: DISCOURAGEMENT (leaving the measured
 * labor force — the U-3 vs broad-joblessness gap), ATROPHY (employability decays, so
 * re-hiring draws the recently displaced first), and WAGE SCARRING (re-entry wages sit
 * below the pre-displacement vintage). The pool object gains annual duration cohorts —
 * the SAME object the UI-pricing fix put on the simulation path and the MS2 gear reads
 * (the ruled pool-object resolution: one object gaining resolution, no basis change).
 *
 * Anchors (dials honest-flagged until their tables commit): exit hazard — CPS U→N flows;
 * employability decay — Kroft-Lange-Notowidigdo callback-rate decay; wage scarring —
 * Jacobson-LaLonde-Sullivan / Davis-von Wachter displaced-worker earnings losses.
 */

/** Annual duration cohorts: index = years since displacement (0..9, index 10 = 10+ terminal). */
export const POOL_COHORT_COUNT = 11;

export interface PoolCohort {
  count: number;
  /** Composition-weighted wage at displacement (the vintage — scarring applies on top). */
  avgWageVintage: number;
  /** Enhanced-UI entitlement weeks remaining (drawn down 52/yr; see policy.ts). */
  entitlementWeeksRemaining: number;
}

export interface DisplacedPoolState {
  /** The SEARCHING pool by duration (still in the measured labor force). */
  cohorts: PoolCohort[];
  /** Discouraged exits: left the measured labor force, still jobless (the BROAD measure
   *  counts them; U-3 does not). MS-registered: exits do not re-enter. */
  exitedStock: number;
}

export interface PoolDials {
  exitBase: number;
  exitDurationSlope: number;
  atrophyRate: number;
  wageScarringRate: number;
}

export function emptyDisplacedPoolState(): DisplacedPoolState {
  return {
    cohorts: Array.from({ length: POOL_COHORT_COUNT }, () => ({ count: 0, avgWageVintage: 0, entitlementWeeksRemaining: 0 })),
    exitedStock: 0,
  };
}

/** Employability after d jobless years: (1 − atrophyRate)^d (the KLN callback-decay shape). */
export function poolEmployability(d: number, dials: PoolDials): number {
  return Math.pow(1 - dials.atrophyRate, d);
}

/** Re-entry wage factor after d jobless years: 1 − min(0.25, wageScarringRate × d). */
export function poolScarringFactor(d: number, dials: PoolDials): number {
  return 1 - Math.min(0.25, dials.wageScarringRate * d);
}

/** The gear's fill budget: the effectiveness-weighted searching pool (Amendment 1,
 *  this stage's refinement of the MS2 raw-count budget). */
export function poolFillBudget(state: DisplacedPoolState, dials: PoolDials): number {
  return state.cohorts.reduce((s, c, d) => s + c.count * poolEmployability(d, dials), 0);
}

/** The gear's rehire wage basis: effectiveness-AND-scarring-weighted (what re-hiring
 *  actually costs, weighted by who would actually be hired). Empty pool → 0 (caller
 *  degrades to the incumbent basis). */
export function poolRehireWage(state: DisplacedPoolState, dials: PoolDials): number {
  let wSum = 0, w = 0;
  state.cohorts.forEach((c, d) => {
    const eff = c.count * poolEmployability(d, dials);
    wSum += eff * c.avgWageVintage * poolScarringFactor(d, dials);
    w += eff;
  });
  return w > 0 ? wSum / w : 0;
}

/** Duration shares of the searching pool (for the entitlement-aware UI pricing). */
export function poolDurationShares(state: DisplacedPoolState): number[] {
  const total = state.cohorts.reduce((s, c) => s + c.count, 0);
  return state.cohorts.map((c) => (total > 0 ? c.count / total : 0));
}

/**
 * Advance the pool one year. Order: AGE (cohorts shift; entitlements draw 52) → EXIT
 * (per-cohort discouragement hazard exitBase × (1 + slope × d), into exitedStock) →
 * RECONCILE against the current displaced STOCK (inflow at current wages into cohort 0
 * when the stock grew; re-hire draws effectiveness-weighted, recent-first, when it shrank).
 * CONSERVATION (battery B3-2): searching + exited ≡ displacedStock, every year.
 */
export function advanceDisplacedPool(
  prev: DisplacedPoolState,
  displacedStockCount: number,
  displacedStockAvgWage: number,
  entitlementWeeksForNewCohort: number,
  dials: PoolDials,
): DisplacedPoolState {
  // 1. AGE
  const aged: PoolCohort[] = Array.from({ length: POOL_COHORT_COUNT }, () => ({ count: 0, avgWageVintage: 0, entitlementWeeksRemaining: 0 }));
  for (let d = 0; d < POOL_COHORT_COUNT; d++) {
    const target = Math.min(POOL_COHORT_COUNT - 1, d + 1);
    const src = prev.cohorts[d]!;
    if (src.count <= 0) continue;
    const t = aged[target]!;
    const merged = t.count + src.count;
    t.avgWageVintage = merged > 0 ? (t.avgWageVintage * t.count + src.avgWageVintage * src.count) / merged : 0;
    t.entitlementWeeksRemaining = merged > 0
      ? (t.entitlementWeeksRemaining * t.count + Math.max(0, src.entitlementWeeksRemaining - 52) * src.count) / merged
      : 0;
    t.count = merged;
  }
  // 2. EXIT (discouragement)
  let exited = prev.exitedStock;
  for (let d = 0; d < POOL_COHORT_COUNT; d++) {
    const c = aged[d]!;
    if (c.count <= 0) continue;
    const hazard = Math.min(1, Math.max(0, dials.exitBase * (1 + dials.exitDurationSlope * d)));
    const leaving = c.count * hazard;
    c.count -= leaving;
    exited += leaving;
  }
  // 3. RECONCILE vs the displaced stock
  const searchingTarget = Math.max(0, displacedStockCount - exited);
  const searchingNow = aged.reduce((s, c) => s + c.count, 0);
  if (searchingTarget > searchingNow) {
    // inflow: newly displaced at current wages, fresh entitlement
    const inflow = searchingTarget - searchingNow;
    const c0 = aged[0]!;
    const merged = c0.count + inflow;
    c0.avgWageVintage = merged > 0 ? (c0.avgWageVintage * c0.count + displacedStockAvgWage * inflow) / merged : 0;
    c0.entitlementWeeksRemaining = merged > 0
      ? (c0.entitlementWeeksRemaining * c0.count + entitlementWeeksForNewCohort * inflow) / merged
      : 0;
    c0.count = merged;
  } else if (searchingTarget < searchingNow) {
    // re-hire: effectiveness-weighted draw, recent-first (Amendment 1)
    let draw = searchingNow - searchingTarget;
    for (let d = 0; d < POOL_COHORT_COUNT && draw > 0; d++) {
      const c = aged[d]!;
      const take = Math.min(c.count, draw);
      c.count -= take;
      draw -= take;
    }
  }
  return { cohorts: aged, exitedStock: exited };
}
