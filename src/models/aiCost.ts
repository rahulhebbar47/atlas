/**
 * ATLAS — THE ONE REALIZED-COST OBJECT (the coupled the design specification-§2, an earlier build step).
 *
 * Plain English: the cost of AI work has two regimes. Work AT the capability frontier pays
 * a large, persistent token-intensity premium (reasoning chains, agentic retries, long
 * context — the 2023-26 observed record). Once the frontier passes a role's requirement,
 * that role's work migrates onto the fixed-capability curve: the price of the capability
 * level it needs, which collapses fast after arrival. A role's realized cost is the
 * migration-weighted blend of the two, where the weight falls with the role's capability
 * surplus (how far the frontier has passed its requirement).
 *
 * THIS MODULE IS THE ONLY INFERENCE-COST ASSEMBLY IN THE MODEL (the design specification; enforced by
 * the one-assembly probe). Every consumer — the Cheaper score, the consumer-price deflation
 * channel, the deployer-savings diagnostic, and (an earlier build step) the reverse gear's continuing
 * comparison — reads this object. The retired assemblies: the global tokens-per-task
 * schedule (bfcs.computeInferenceCostFactor), the deflation channel's inline costIndex, and
 * the deprecated exp(inferenceAnnualChange·t) diagnostics.
 *
 * All functions are PURE.
 */

import type { AICostParams, TokenCostCurveParams, DeploymentType } from '@/types';
import {
  DEFAULT_START_YEAR,
  DEFAULT_TOKEN_COST_CURVE,
  DEFAULT_FRONTIER_INTENSITY_LEVEL,
  DEFAULT_FRONTIER_INTENSITY_GROWTH,
  DEFAULT_SIGMA_MIGRATION,
  DEFAULT_W_MIN_FRONTIER_FLOOR,
  DEFAULT_MANUFACTURING_ANNUAL_CHANGE,
  DEFAULT_ENERGY_ANNUAL_CHANGE,
  AI_COST_COMPOSITION,
  BUILDOUT_LEG_COST_TREND,
} from './constants';

/**
 * THE DERIVED N1→TOKEN COUPLING (the recorded design decision
 * surgery (c)): the token-cost curve's decay re-derives from N1's capacity-cost
 * trend, so a cheap-capacity world can no longer compose with an expensive-token
 * belief (and an expensive-capacity world cannot compose with collapsing tokens).
 *
 * Form: k′ = k × s^decayExponent, with
 *   s = max(0, ln(1 + chipsCostTrend) / ln(1 + BUILDOUT_LEG_COST_TREND.chips))
 * — algebraically EXACTLY the time-rescaling t → s·t of the cited curve
 * (k·(s·t)^d = k·s^d·t^d): token prices approach their floor at the pace capacity
 * cost actually declines RELATIVE TO the consensus cited pace. DERIVED — the only
 * inputs are the selected and consensus cited decline rates; no authored constant.
 * s = 1 (consensus/absent) returns the ORIGINAL curve object (reference identity —
 * bit-exact defaults); s = 0 freezes the curve at 1; the s ≥ 0 clamp holds tokens
 * flat in a rising-capacity-cost world (the curve is documented non-increasing).
 * A2's service-pricing levers (frontier premium, migration, always-frontier floor)
 * are untouched — the demand-side belief survives as specified.
 */
export function coupledTokenCostCurve(
  curve: TokenCostCurveParams | undefined,
  chipsCostTrend: number | undefined,
): TokenCostCurveParams | undefined {
  if (chipsCostTrend === undefined) return curve;
  const consensus = Math.log(1 + BUILDOUT_LEG_COST_TREND.chips);
  const s = Math.max(0, Math.log(1 + chipsCostTrend) / consensus);
  if (s === 1) return curve;
  const base = curve ?? DEFAULT_TOKEN_COST_CURVE;
  return { ...base, k: base.k * Math.pow(s, base.decayExponent) };
}

/**
 * Cost per token of AI work at the frontier's own capability level, as a fraction of the
 * 2025 baseline. Shape: floor + (1 − floor) × exp(−k × t^decayExponent). Strictly
 * non-increasing. t = year − 2025; t ≤ 0 → 1.0 by definition (the anchor).
 * (Moved here from bfcs.ts — the one-assembly rule; bfcs re-exports for existing callers.)
 */
export function computeTokenCostFactor(
  t: number,
  params: TokenCostCurveParams = DEFAULT_TOKEN_COST_CURVE,
): number {
  if (t <= 0) return 1.0;
  const decay = Math.exp(-params.k * Math.pow(t, params.decayExponent));
  return params.floor + (1 - params.floor) * decay;
}

/** The four frontier-layer dials, resolved from AICostParams with the specified defaults. */
export interface FrontierDials {
  level: number;
  growth: number;
  sigma: number;
  wMin: number;
}

export function resolveFrontierDials(params?: AICostParams): FrontierDials {
  return {
    level: params?.frontierIntensityLevel ?? DEFAULT_FRONTIER_INTENSITY_LEVEL,
    growth: params?.frontierIntensityGrowth ?? DEFAULT_FRONTIER_INTENSITY_GROWTH,
    sigma: params?.sigmaMigration ?? DEFAULT_SIGMA_MIGRATION,
    wMin: params?.wMinFrontierFloor ?? DEFAULT_W_MIN_FRONTIER_FLOOR,
  };
}

/**
 * Frontier token-intensity multiple M_f(t): 1 at the 2025 anchor (t ≤ 0, definitional);
 * level × (1+growth)^(t−1) from t = 1 (the 2026 calibration anchor). The 1 → level step at
 * t = 1 is the reduced form of the observed 2025-26 reasoning-model arrival (design record
 * open-item (a), specified: accepted; smoothing would be an uncited invention).
 */
export function computeFrontierIntensity(t: number, dials: FrontierDials): number {
  if (t <= 0) return 1.0;
  return dials.level * Math.pow(1 + dials.growth, t - 1);
}

/** Frontier per-task cost vs the 2025 baseline: perToken(t) × M_f(t). */
export function computeFrontierCost(
  t: number,
  curve: TokenCostCurveParams | undefined,
  dials: FrontierDials,
): number {
  return computeTokenCostFactor(t, curve ?? DEFAULT_TOKEN_COST_CURVE) * computeFrontierIntensity(t, dials);
}

/**
 * The migration weight w(s): the fraction of a role's work still frontier-priced at
 * capability surplus s = Better − B*. 1 at s ≤ 0 (at/below the margin — the marginal
 * adoption decision is frontier-priced by construction); halves every σ of surplus;
 * floored at w_min (always-frontier residue, default 0).
 */
export function computeMigrationWeight(surplus: number, dials: FrontierDials): number {
  if (surplus <= 0) return 1.0;
  return Math.max(dials.wMin, Math.pow(2, -surplus / dials.sigma));
}

/**
 * The inference leg: the migration-weighted blend of the frontier cost and the
 * arrival-anchored fixed-capability cost.
 *
 *   fixedCap(t) = frontierCost(t*) × perTokenDecay(t − t*)
 *
 * — the capability level's arrival price (INCLUDING its intensity component: distillation
 * compresses reasoning chains along with per-token price) decaying along the SAME cited
 * curve re-anchored at arrival. No new subjective trajectory (the design specification).
 *
 * FP-exactness at the anchor (test B-2's pre-registered requirement): the blend is coded
 * as fixedCap + w × (frontier − fixedCap), which returns EXACTLY fixedCap when the two
 * curves coincide (t = t* and t = 0) — the year-0 re-anchor's identity is bit-exact.
 *
 * @param t        years since 2025 (year − DEFAULT_START_YEAR)
 * @param arrivalT years since 2025 of the role's Better-arrival (null = not yet arrived;
 *                 pre-2025 arrivals clamp to 0 — the anchor cannot see earlier history)
 * @param surplus  s = Better − B* this year (≤ 0 pre-arrival)
 */
export function computeInferenceLeg(
  t: number,
  arrivalT: number | null,
  surplus: number,
  curve: TokenCostCurveParams | undefined,
  dials: FrontierDials,
): { leg: number; frontierCost: number; fixedCapCost: number; frontierWeight: number } {
  const frontier = computeFrontierCost(t, curve, dials);
  if (arrivalT === null) {
    return { leg: frontier, frontierCost: frontier, fixedCapCost: frontier, frontierWeight: 1.0 };
  }
  const anchoredT = Math.max(0, arrivalT);
  const fixedCap = computeFrontierCost(anchoredT, curve, dials)
    * computeTokenCostFactor(t - anchoredT, curve ?? DEFAULT_TOKEN_COST_CURVE);
  const w = computeMigrationWeight(surplus, dials);
  const leg = fixedCap + w * (frontier - fixedCap);
  return { leg, frontierCost: frontier, fixedCapCost: fixedCap, frontierWeight: w };
}

/**
 * THE COST CLOCK (the flywheel MS): the effective innovation time the assembly
 * evaluates at. `tEff` replaces `year − startYear`; `tauAtArrival` replaces the
 * calendar arrival offset for the fixed-capability re-anchor (the arrival price is
 * whatever the REALIZED frontier cost was when the role's capability arrived, and its
 * distillation decay runs on realized innovation time). Absent (legacy callers, unit
 * fixtures) ⇒ calendar time — bit-identical to the pre-clock behavior; on every funded
 * path the loop passes τ = t exactly, so the substitution is an identity there too.
 */
export interface CostClock {
  tEff: number;
  tauAtArrival: number | null;
}

/** The full realized-cost breakdown for one role-year. */
export interface RoleCostBreakdown {
  /** The composition-weighted 3-leg AI cost vs the 2025 economy-mean task cost (the
   *  Cheaper score's numerator; includes supply-chain multipliers). */
  fraction: number;
  inferenceLeg: number;
  frontierCost: number;
  fixedCapCost: number;
  frontierWeight: number;
}

/**
 * THE ONE ASSEMBLY: composition-weighted inference + manufacturing + energy legs, each
 * scaled by its supply-chain multiplier. Manufacturing/energy keep their existing cited
 * exponential decays (out of this rework's scope, per the adopted design record).
 *
 * @param arrivalYear calendar year of Better-arrival (null = not arrived)
 * @param scm         supply-chain BFCS cost multipliers (1.0 outside SC scenarios)
 */
export function computeAiCostFraction(
  year: number,
  deploymentType: DeploymentType | string,
  arrivalYear: number | null,
  betterSurplus: number,
  costParams?: AICostParams,
  scm: { inference: number; manufacturing: number; energy: number } = { inference: 1, manufacturing: 1, energy: 1 },
  /** Flywheel MS: the cost clock. Absent ⇒ calendar time (legacy/fixture identity). */
  costClock?: CostClock,
): RoleCostBreakdown {
  // The ONE substitution point (the adopted coupling): every leg evaluates at the
  // effective innovation time. costClock absent ⇒ t = year − 2025 (the shipped basis).
  const t = costClock?.tEff ?? (year - DEFAULT_START_YEAR);
  const dials = resolveFrontierDials(costParams);
  // Non-null assertion safe: AI_COST_COMPOSITION has all DeploymentType keys (exhaustiveness-tested)
  const comp = (costParams?.composition?.[deploymentType as DeploymentType]
    ?? AI_COST_COMPOSITION[deploymentType]
    ?? AI_COST_COMPOSITION['software'])!;
  const mfgChange = costParams?.manufacturingAnnualChange ?? DEFAULT_MANUFACTURING_ANNUAL_CHANGE;
  const energyChange = costParams?.energyAnnualChange ?? DEFAULT_ENERGY_ANNUAL_CHANGE;

  // The arrival anchor on the clock: with a clock, the fixed-capability curve
  // re-anchors at τ(arrivalYear) — the realized frontier position at arrival; without
  // one, at the calendar offset (the shipped basis, bit-identical).
  const arrivalT = costClock !== undefined
    ? costClock.tauAtArrival
    : (arrivalYear === null ? null : arrivalYear - DEFAULT_START_YEAR);
  const inf = computeInferenceLeg(t, arrivalT, betterSurplus, costParams?.tokenCostCurve, dials);

  const fraction =
      comp.inference * inf.leg * scm.inference
    + comp.manufacturing * Math.exp(mfgChange * t) * scm.manufacturing
    + comp.energy * Math.exp(energyChange * t) * scm.energy;

  return {
    fraction,
    inferenceLeg: inf.leg,
    frontierCost: inf.frontierCost,
    fixedCapCost: inf.fixedCapCost,
    frontierWeight: inf.frontierWeight,
  };
}
