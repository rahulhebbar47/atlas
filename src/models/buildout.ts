/**
 * CHANNEL 1 — THE BUILDOUT .
 *
 * The buildout-finance and three-leg-plus-fleet capacity machine of the adopted
 * the design specification + the two-mode scaling design: the economy FINANCES AI capacity (retained
 * builder/AI profits + debt via the existing business-credit machinery), BUILDS it as
 * three complementary datacenter legs (chips, energy × efficiency, DC shells) plus a
 * dedicated embodied FLEET stock, and the believed capability trajectory is a CEILING
 * that realized capability meets only when the capacity is actually there
 * (the program's constitutional semantics: "the user belief is all about theory and
 * the model then grounds it in reality").
 *
 * THE ZERO-AI TWIN SEMANTICS (the recorded design decision — stated in SOURCE CODE and records
 * ONLY, never in UI/UX strings): the zero-AI reference is "a world in which the AI
 * buildout never happened" — its investment path EXCLUDES the observed 2025 AI capex
 * that the BEA-calibrated baseline investment ratio carries (the baseline capex
 * partition's delta form: the twin's buildout demand is 0, so the partition delta is
 * −(the baseline-embedded AI capex path) — the specified level shift, the regression suite).
 *
 * Units: DC-side stocks are in 2025-REQUIRED-CAPACITY units (K_required(2025) ≡ 1;
 * each leg's 2025 stock ≡ 1 — the seam convention: the observed 2025 system delivers
 * the 2025 requirement with every leg just-sufficient; slack and binding emerge from
 * differential growth). The energy stock is powered capacity; multiplying by the
 * derived FLOPs-per-watt factor (normalized 1 at 2025) converts watts to compute so
 * the three-leg min is dimensionally exact. The fleet stock is in UNITS (vehicles/
 * robots), not capacity units.
 *
 * Every function is PURE. All state is threaded by the simulation loop.
 */
import type { CapabilityVectorId, CapabilityTrajectoryParams } from '@/types';
import { getAllCapabilityScores } from './capabilities';
import {
  DEFAULT_START_YEAR,
  BUILDOUT_TRAINING_SHARE_2025,
  BUILDOUT_TRAINING_SHARE_CAP,
  BUILDOUT_TRAINING_SHARE_CONVERGENCE,
  I_AI_OBSERVED_2025,
  BUILDOUT_LEG_COST_2025,
  BUILDOUT_LEG_COST_TREND,
  BUILDOUT_LEG_DEPRECIATION,
  FLOPS_PER_WATT_DOUBLING_YEARS,
  DEFAULT_AI_RETENTION_SHARE,
  BUILDER_PROFIT_BASE_2025,
  BUILDOUT_DEBT_FINANCE_RATIO,
  DEFAULT_BUILDOUT_ALLOC_SMOOTHING,
  BASELINE_GDP_NOMINAL_2025,
  FLEET_CHIPS_PER_UNIT,
  FLEET_SOC_COST_2025,
  FLEET_UNIT_COST_2025,
  FLEET_UNIT_COST_TREND,
  FLEET_DEPRECIATION,
  // DEPRECATED (an earlier build step): FLEET_UNITS_AT_FULL_EMBODIMENT — the fleet requirement now
  // derives from cleared cluster work (see computeBuildoutRequirement); import retained
  // commented per the no-delete rule.
  // FLEET_UNITS_AT_FULL_EMBODIMENT,
  FLEET_RAMP_SEED_UNITS,
  FLEET_RAMP_GROWTH,
  ENERGY_QUEUE_CEILING_SEED,
  ENERGY_QUEUE_INFLIGHT_YEARS,
  DEFAULT_ENERGY_QUEUE_LEAD_YEARS,
  DEFAULT_ENERGY_QUEUE_CEILING_GROWTH,
  DEFAULT_ENERGY_BTM_SHARE,
  ENERGY_BTM_LEAD_YEARS,
  ENERGY_BTM_COST_PREMIUM,
  ORBITAL_DEPRECIATION,
} from './constants';

export type BuildoutLeg = 'chips' | 'energy' | 'dc';
export type BuildoutSink = BuildoutLeg | 'fleet';

/** The energy delivery queue: the energy leg's delivery QUEUE.
 *  Financed energy build no longer enters the stock directly — it enters a PIPELINE
 *  with a per-worldview lead time and delivers through an ANNUAL ADDITIONS CEILING
 *  that grows only in binding years (a queue, not a fence). Money buys a place in
 *  the line; the line is time, not price: the spend enters GDP when spent, the
 *  capacity arrives L years later, and no dollar shortens L or jumps the line —
 *  heavier financing accelerates the ceiling's growth only by binding it. The
 *  behind-the-meter EXPRESS LANE (a recorded design decision, the Colossus-class episode)
 *  bypasses the grid queue at a capital-cost premium. */
export interface EnergyQueueState {
  /** Grid-lane vintages by AVAILABLE year (delivery joins the stock USED in that
   *  year); ceiling-gated on delivery. */
  pipeline: Record<number, number>;
  /** Express-lane vintages by available year; NOT ceiling-gated (E1). */
  btmPipeline: Record<number, number>;
  /** Matured-but-ceiling-blocked units spilling forward (grid lane). */
  carryover: number;
  /** The annual additions ceiling, capacity units/yr (grid lane). */
  additionsCeiling: number;
}

/** The buildout's year-over-year state, threaded by the simulation loop. */
export interface BuildoutState {
  /** DC-leg stocks in 2025-required-capacity units. */
  chips: number;
  energy: number;
  dc: number;
  /** Embodied fleet, units. */
  fleetUnits: number;
  /** Manufacturing ramp: units/yr currently producible (the queue ceiling). */
  mfgRampCapacity: number;
  /** The R3-smoothed allocation shares over the four sinks (sums to 1 when active). */
  alloc: Record<BuildoutSink, number>;
  /** the energy delivery queue (A1 + E1). */
  energyQueue: EnergyQueueState;
  /** Telemetry echo: last advance's grid-lane / express-lane deliveries
   *  (the loop surfaces them on macro.buildout — the alloc-echo pattern). */
  lastEnergyDelivered: number;
  lastEnergyBtmDelivered: number;
  /** the ORBITAL capacity stock, 2025-required-capacity units — an
   *  ADDITIVE integrated-capacity term past the terrestrial min (orbital platforms
   *  deliver compute with their OWN embedded power; they bypass the terrestrial
   *  energy queue entirely). Additions arrive exogenously from arrival events
   *  (the orbitalCapacity registered row). */
  orbital: number;
}

/** The seam state (2025): every DC leg exactly sufficient; no AI fleet at scale.
 *  The energy pipeline seeds with the IN-FLIGHT delivery book (measured fact,
 *  citation row 48: 549 GW executed-IA not yet operating — the 2025 base has years
 *  of orders already in flight, delivering at its demonstrated additions rate).
 *  E3: year-0 stocks and spending are seam-identical; the queue governs additions
 *  from 2026 forward, never retroactively (the machine's first advance produces the
 *  2027 stock; stale vintages sweep forward ceiling-gated). Deliveries gate on a
 *  LIVE requirement, so the zero-AI twin — a world in which the buildout never
 *  happened — receives nothing from the book (regression-tested). */
export function getInitialBuildoutState(): BuildoutState {
  const pipeline: Record<number, number> = {};
  for (let i = 1; i <= ENERGY_QUEUE_INFLIGHT_YEARS; i++) {
    pipeline[DEFAULT_START_YEAR + i] = ENERGY_QUEUE_CEILING_SEED;
  }
  return {
    chips: 1, energy: 1, dc: 1,
    fleetUnits: 0,
    mfgRampCapacity: FLEET_RAMP_SEED_UNITS,
    alloc: { chips: 0.25, energy: 0.25, dc: 0.25, fleet: 0.25 },
    energyQueue: {
      pipeline, btmPipeline: {},
      carryover: 0,
      additionsCeiling: ENERGY_QUEUE_CEILING_SEED,
    },
    lastEnergyDelivered: 0,
    lastEnergyBtmDelivered: 0,
    orbital: 0,
  };
}

/** Derived FLOPs-per-watt factor, normalized 1 at the start year
 *  (docs/Reference/FLOPS_PER_WATT_DERIVATION.md; T_double 2.5yr). NOT a dial. */
export function flopsPerWattFactor(year: number): number {
  return Math.pow(2, (year - DEFAULT_START_YEAR) / FLOPS_PER_WATT_DOUBLING_YEARS);
}

/** the DERIVED time-varying training share of
 *  AI compute demand — the slice capability advance rides (pretraining + RL,
 *  INCLUDING RL rollout compute by specified definition). Seam-exact at the 2025 anchor;
 *  strictly increasing along the RL-era growth path; saturates below 1
 *  (docs/Reference/TRAINING_SHARE_DERIVATION.md — derivation, anchors, band).
 *  NOT a dial (the flopsPerWattFactor precedent; band recorded for any future
 *  surfacing). */
export function trainingShare(year: number): number {
  return BUILDOUT_TRAINING_SHARE_CAP
    - (BUILDOUT_TRAINING_SHARE_CAP - BUILDOUT_TRAINING_SHARE_2025)
      * Math.exp(-BUILDOUT_TRAINING_SHARE_CONVERGENCE * (year - DEFAULT_START_YEAR));
}

/** Per-leg unit cost, $ per 2025-required-capacity unit. an earlier build step: the trend is
 *  N1-OWNED belief content (config.buildout*CostTrend; the constants are the
 *  consensus defaults — the N1-consensus variant assigns exactly these literals,
 *  which is the identity proof). `priceIndex` is the supply-chain PRICE row
 *  (100 = baseline) shocking the leg's cost multiplicatively (chipPrice → chips,
 *  energyPrice → energy). */
export function legUnitCost(leg: BuildoutLeg, year: number, priceIndex = 100, trendOverride?: number): number {
  const t = year - DEFAULT_START_YEAR;
  return BUILDOUT_LEG_COST_2025[leg]
    * Math.pow(1 + (trendOverride ?? BUILDOUT_LEG_COST_TREND[leg]), t)
    * (priceIndex / 100);
}

/** Fleet unit cost, $/unit; the trend is N1-owned (an earlier build step). */
export function fleetUnitCost(year: number, trendOverride?: number): number {
  return FLEET_UNIT_COST_2025 * Math.pow(1 + (trendOverride ?? FLEET_UNIT_COST_TREND), year - DEFAULT_START_YEAR);
}

/** The BELIEVED capability aggregate (the ceiling path — the exogenous S-curves with
 *  NO delay): the sum over the three vectors. The buildout REQUIREMENT follows the
 *  belief, per the constitutional ceilings-of-possibility semantics. */
export function believedCapabilityAggregate(
  year: number,
  capabilities: Record<CapabilityVectorId, CapabilityTrajectoryParams>,
): number {
  const s = getAllCapabilityScores(year, capabilities);
  return s.generative + s.agentic + s.embodied;
}

/** The capacity REQUIREMENT (K_required), dial-free by construction (the regression suite: bound to
 *  the believed capability trajectory, the unit costs, and δ — no new tunable):
 *  DC requirement = (believed capability aggregate / its 2025 value) × the economy
 *  scale (prev-year real GDP over the 2025 real base).
 *  FLEET requirement (the re-derivation, a recorded design decision): the t−1
 *  CLEARED-WORK requirement threaded from the ledger — Σ_c clearedEmployment_c ×
 *  w_embodied,c × unitsPerEmbodiedWorker, computed in computeAIProductionExpansion
 *  from live cluster data. DELIBERATE ASYMMETRY (a stated design choice): the DC
 *  requirement stays BELIEVED-trajectory-driven (the constitutional ceilings
 *  semantics); the fleet requirement is CLEARED-work-driven (the order's own form).
 *  The retired [hu] scale form, kept per the no-delete rule:
 *    fleetRequired: FLEET_UNITS_AT_FULL_EMBODIMENT × embodied score × econIdx
 *  Zero-AI guard: a zero-capability belief (aggregate 2025 ≈ 0) demands NOTHING —
 *  the buildout never happens (the twin semantics above; cleared work is 0 there
 *  too — doubly silent). */
export function computeBuildoutRequirement(args: {
  year: number;
  capabilities: Record<CapabilityVectorId, CapabilityTrajectoryParams>;
  prevRealGDP: number;
  realGDP2025: number;
  /** The t−1 cleared-embodied-work fleet requirement (units), from the ledger. */
  prevClearedFleetRequirement?: number;
}): { dcRequired: number; fleetRequired: number } {
  const { year, capabilities, prevRealGDP, realGDP2025 } = args;
  const agg0 = believedCapabilityAggregate(DEFAULT_START_YEAR, capabilities);
  if (agg0 <= 1e-9) return { dcRequired: 0, fleetRequired: 0 };
  const capIdx = believedCapabilityAggregate(year, capabilities) / agg0;
  const econIdx = realGDP2025 > 0 ? Math.max(0, prevRealGDP) / realGDP2025 : 1;
  return {
    dcRequired: capIdx * econIdx,
    fleetRequired: Math.max(0, args.prevClearedFleetRequirement ?? 0),
  };
}

/** The finance block (the design specification): Financeable(t) = retention × the profit base
 *  + the debt leg through the EXISTING business-credit multiplier (no parallel credit
 *  state). The profit base is max(builder base, realized nominal AI profits at t−1):
 *  the observed buildout is funded from the AI-BUILDING firms' balance sheets while
 *  in-model AI-sector profits are still small; AI profits govern once they overtake
 *  (the original implementation form, ACCEPTED at the Stage-1 review with the dynamics
 *  DOCKET executed here).
 *
 *  the
 *  builder base indexes to the EXISTING corporate-profits state (the residual
 *  identity's output), not to nominal GDP — non-AI profit pools die in a crisis and
 *  the floor dies with them; a fixed GDP-indexed floor was not honest dynamics.
 *  builderBase(t) = BUILDER_PROFIT_BASE_2025 × max(0, corporateProfits(t−1) /
 *  corporateProfits(seam)). The retired GDP-index form, kept per the no-delete rule:
 *    const builderBase = BUILDER_PROFIT_BASE_2025
 *      * (args.prevNominalGDP > 0 ? args.prevNominalGDP / BASELINE_GDP_NOMINAL_2025 : 1); */
export function computeFinanceable(args: {
  prevAiProfitsNominal: number;
  prevNominalGDP: number;
  prevBusinessCreditMultiplier: number;
  retentionShare?: number;
  /** t−1 economy-wide corporate profits (nominal $, the residual identity). */
  prevCorporateProfits?: number;
  /** the seam-year corporate profits (nominal $, captured at year 0). */
  corporateProfitsSeam?: number;
  /** the equity-issuance leg, nominal $ — ι × the t−1
   *  implied AI market cap × the t−1 issuance window (computed in the loop from the
   *  domain-guarded valuation surface). THE NO-FLOW-OF-FUNDS BOUNDARY (the design decision's
   *  addition, stated): the financing legs measure CAPACITY — no household portfolio
   *  is debited when issuance funds the buildout (consistent with the debt leg's
   *  treatment); the demand side sees the spending only through the one investment
   *  pipeline. */
  equityIssuance?: number;
  /** the
   *  t−1 energy opex. The builder-base floor proxies the AI-BUILDING firms'
   *  internal funds, and those firms PAY the AI power bill out of the same
   *  balance sheet — so the opex nets against the floor. No double-count:
   *  prevAiProfitsNominal already carries −opex inside the profit identity, so
   *  the bill counts exactly once in either regime of the max(). Absent/0 ⇒
   *  the prior arithmetic (unit tests, zero-AI, the seam). NOTED executor
   *  interpretation (a stated implementation choice). */
  prevEnergyOpex?: number;
}): number {
  const retention = args.retentionShare ?? DEFAULT_AI_RETENTION_SHARE;
  const profitsIdx = args.prevCorporateProfits !== undefined
    && args.corporateProfitsSeam !== undefined && args.corporateProfitsSeam > 0
    ? Math.max(0, args.prevCorporateProfits) / args.corporateProfitsSeam
    : (args.prevNominalGDP > 0 ? args.prevNominalGDP / BASELINE_GDP_NOMINAL_2025 : 1); // unit-test fallback: the retired GDP index
  const builderBase = BUILDER_PROFIT_BASE_2025 * profitsIdx
    - Math.max(0, args.prevEnergyOpex ?? 0); // E2: the power bill bites the floor too
  const profitBase = Math.max(builderBase, Math.max(0, args.prevAiProfitsNominal));
  const retained = retention * profitBase;
  const debt = retained * BUILDOUT_DEBT_FINANCE_RATIO
    * Math.max(0, Math.min(1, args.prevBusinessCreditMultiplier));
  // The builderBase seam boundary carries (the adopted design §5): the seam is
  // internally funded; issuance grows the expectations-financed share endogenously.
  return retained + debt + Math.max(0, args.equityIssuance ?? 0);
}

/** One year's buildout plan: gaps, demand, finance min, funding ratio F, allocation
 *  target (R3 binding-sink logic), and the DC capacity/supply ratio consumed by the
 *  flywheel. Quantity shock indices (100 = baseline) act multiplicatively ON the
 *  stocks (shocks-on-stocks — the one-machine rule; the index rows are disturbances,
 *  not a parallel capacity state). */
export interface BuildoutPlan {
  /** The plan's year (the queue's order/maturation clock in applyBuildout). */
  year: number;
  dcRequired: number;
  fleetRequired: number;
  /** Post-shock effective leg capacities (capacity units). */
  effective: Record<BuildoutLeg, number>;
  /** the TERRESTRIAL min alone — the opex line's capacity basis
   *  (orbital carries its own power and pays no grid bill; boundary stated). */
  capacityTerrestrial: number;
  /** the orbital stock echoed (start-of-year). */
  orbitalStock: number;
  /** min(terrestrial legs) + S_orbital — the integrated capacity (A2). */
  capacityDc: number;
  /** the resolved queue beliefs (N1-owned) + queue telemetry,
   *  consumed by applyBuildout (one resolution, one consumer chain). */
  energyQueueLeadYears: number;
  energyQueueCeilingGrowth: number;
  energyBtmShare: number;
  /** Pending grid-lane units (pipeline + carryover) at the start of the year. */
  energyPending: number;
  /** Pending express-lane units at the start of the year. */
  energyBtmPending: number;
  /** The additions ceiling at the start of the year, units/yr. */
  energyCeiling: number;
  /** min(1, capacity/required); 1 when required = 0. Feeds FLYWHEEL u_supply. */
  supplyRatio: number;
  /** Per-sink dollar gaps at current unit costs. */
  gapSpend: Record<BuildoutSink, number>;
  buildoutDemandSpend: number;
  financeable: number;
  /** I_AI pre-gate = min(demand, financeable). */
  iAiPregate: number;
  /** F = financed/required; ≡ 1 when required spend is 0 (a recorded design decision). */
  fundingRatio: number;
  /** The binding sink (lowest coverage ratio) — 'none' when nothing binds. */
  bindingSink: BuildoutSink | 'none';
  /** R3 target allocation (greedy binding-first gap fill, normalized). */
  allocTarget: Record<BuildoutSink, number>;
  /** Smoothed allocation actually used this year. */
  allocUsed: Record<BuildoutSink, number>;
  /** Unit costs used (post price-shock). */
  unitCosts: Record<BuildoutLeg, number> & { fleetUnit: number };
}

export function computeBuildoutPlan(args: {
  year: number;
  state: BuildoutState;
  capabilities: Record<CapabilityVectorId, CapabilityTrajectoryParams>;
  prevRealGDP: number;
  realGDP2025: number;
  prevAiProfitsNominal: number;
  prevNominalGDP: number;
  prevBusinessCreditMultiplier: number;
  retentionShare?: number;
  allocSmoothing?: number;
  /** the t−1 cleared-work fleet requirement
   *  (units) from the ledger. Absent/0 ⇒ no fleet demand (the seam and unit tests). */
  prevClearedFleetRequirement?: number;
  /** t−1 corporate profits + the seam capture
   *  (absent ⇒ the retired GDP-index fallback — unit tests only; the loop passes both). */
  prevCorporateProfits?: number;
  corporateProfitsSeam?: number;
  /** the equity-issuance leg (see computeFinanceable). */
  equityIssuance?: number;
  /** the t−1 energy opex — nets against the builder-base floor
   *  (see computeFinanceable). */
  prevEnergyOpex?: number;
  /** Supply-chain shock indices, 100 = baseline (quantity rows on stocks; price rows on costs).
   *  fleetRamp is the ARRIVAL row (100 = baseline) disturbing the
   *  EFFECTIVE manufacturing ramp (shock-on-stock — a factory arrival multiplies
   *  producible units/yr; the underlying state keeps its own growth law). */
  shocks?: { chipsQty?: number; energyQty?: number; dcQty?: number; chipPrice?: number; energyPrice?: number; fleetRamp?: number };
  /** the leg-cost trend beliefs. Absent ⇒ the consensus constants. */
  costTrends?: { chips?: number; energy?: number; dc?: number; fleetUnit?: number };
  /** the accumulated cost-curve BEND factors —
   *  multiplicative on the leg's unit cost, compounded by the loop from an event's
   *  trend entry ((1 + eventTrend)/(1 + standingTrend) per covered year). A bend,
   *  never a level cliff. */
  costBend?: { energy?: number };
  /** the N1-owned queue beliefs. Absent ⇒ consensus constants
   *  (the identity proof: the consensus variant assigns exactly these literals). */
  energyQueue?: { leadYears?: number; ceilingGrowth?: number; btmShare?: number };
}): BuildoutPlan {
  const { year, state } = args;
  const smoothing = args.allocSmoothing ?? DEFAULT_BUILDOUT_ALLOC_SMOOTHING;
  const req = computeBuildoutRequirement(args);

  const qty = {
    chips: (args.shocks?.chipsQty ?? 100) / 100,
    energy: (args.shocks?.energyQty ?? 100) / 100,
    dc: (args.shocks?.dcQty ?? 100) / 100,
  };
  const effective: Record<BuildoutLeg, number> = {
    chips: state.chips * qty.chips,
    energy: state.energy * qty.energy * (flopsPerWattFactor(year) / flopsPerWattFactor(DEFAULT_START_YEAR)),
    dc: state.dc * qty.dc,
  };
  // INTEGRATED capacity — the additive orbital term enters PAST the
  // terrestrial min (matched-leg addition refused as false physics: an orbital
  // platform ships chips + solar together and bypasses the terrestrial grid; it
  // relieves nothing for other terrestrial builds). The orbital stock is its own
  // state in the same 2025-required-capacity units; no registered shock row targets
  // it (a future orbital-targeted disturbance needs its own row).
  const capacityTerrestrial = Math.min(effective.chips, effective.energy, effective.dc);
  const capacityDc = capacityTerrestrial + state.orbital;
  const supplyRatio = req.dcRequired > 0 ? Math.min(1, capacityDc / req.dcRequired) : 1;

  const unitCosts = {
    chips: legUnitCost('chips', year, args.shocks?.chipPrice ?? 100, args.costTrends?.chips),
    energy: legUnitCost('energy', year, args.shocks?.energyPrice ?? 100, args.costTrends?.energy)
      * (args.costBend?.energy ?? 1), // the arrival bend (1 when no event)
    dc: legUnitCost('dc', year, 100, args.costTrends?.dc),
    fleetUnit: fleetUnitCost(year, args.costTrends?.fleetUnit),
  };

  // the resolved queue beliefs (one resolution; applyBuildout consumes
  // these off the plan — one value per year across the whole chain).
  const energyQueueLeadYears = args.energyQueue?.leadYears ?? DEFAULT_ENERGY_QUEUE_LEAD_YEARS;
  const energyQueueCeilingGrowth = args.energyQueue?.ceilingGrowth ?? DEFAULT_ENERGY_QUEUE_CEILING_GROWTH;
  const energyBtmShare = Math.max(0, Math.min(1, args.energyQueue?.btmShare ?? DEFAULT_ENERGY_BTM_SHARE));
  const energyPending = Object.values(state.energyQueue.pipeline).reduce((a, b) => a + b, 0)
    + state.energyQueue.carryover;
  const energyBtmPending = Object.values(state.energyQueue.btmPipeline).reduce((a, b) => a + b, 0);

  // The requirement each TERRESTRIAL leg must cover nets the orbital stock (A2
  // exhaustion honesty: capacity the satellites already provide is not re-built on
  // the ground). a stated implementation choice.
  const reqTerrestrial = Math.max(0, req.dcRequired - state.orbital);
  // Per-leg SURVIVING stock next year absent building; the gap closes requirement + wear.
  // the ENERGY gap additionally nets
  // the pending pipeline (grid + express + carryover) — capacity already ordered is
  // never re-ordered; demand derives from the un-ordered gap, never a level.
  const legGapUnits = (leg: BuildoutLeg) => {
    const pending = leg === 'energy' ? energyPending + energyBtmPending : 0;
    return Math.max(0, reqTerrestrial - state[leg] * (1 - BUILDOUT_LEG_DEPRECIATION[leg]) - pending);
  };
  // Fleet: demand at most what the ramp can deliver (a queue, not a fence — the ramp
  // itself grows when it binds; see applyBuildout). an earlier build step: an arrival row disturbs the
  // EFFECTIVE ramp (a factory online multiplies producible units/yr).
  const effectiveRamp = state.mfgRampCapacity * Math.max(0, (args.shocks?.fleetRamp ?? 100) / 100);
  const fleetGapUnits = Math.max(0, req.fleetRequired - state.fleetUnits * (1 - FLEET_DEPRECIATION));
  const fleetDeliverable = Math.min(fleetGapUnits, effectiveRamp);

  // the energy gap prices at the BLENDED unit cost of the declared
  // lane split — a btmShare of the spend rides the express lane at the capital-cost
  // premium (Lazard gas-class vs the grid industrial rate), so ordering g units
  // takes g × c / ((1 − b) + b/premium) dollars. The premium prices the LANE'S
  // units only; the operating price stays one series (interpretation 6).
  // The divisor is provably ≥ 1/ENERGY_BTM_COST_PREMIUM > 0.5 for btmShare ∈
  // [0, 1] (clamped above), so no numerical guard is needed (the S-C census law:
  // no unreachable 1e-x backstops).
  const energyBlendDivisor = (1 - energyBtmShare) + energyBtmShare / ENERGY_BTM_COST_PREMIUM;
  const energyGapCost = unitCosts.energy / energyBlendDivisor;
  const gapSpend: Record<BuildoutSink, number> = {
    chips: legGapUnits('chips') * unitCosts.chips,
    energy: legGapUnits('energy') * energyGapCost,
    dc: legGapUnits('dc') * unitCosts.dc,
    fleet: fleetDeliverable * (unitCosts.fleetUnit + FLEET_CHIPS_PER_UNIT * FLEET_SOC_COST_2025),
  };
  const buildoutDemandSpend = gapSpend.chips + gapSpend.energy + gapSpend.dc + gapSpend.fleet;

  const financeable = computeFinanceable(args);
  const iAiPregate = Math.min(buildoutDemandSpend, financeable);
  // Ratification A3: a plateaued belief (zero required spend) is NOT "unfunded".
  const fundingRatio = buildoutDemandSpend > 0 ? iAiPregate / buildoutDemandSpend : 1;

  // R3: binding-sink identification by coverage ratio (effective/required); the fleet's
  // ratio uses units. 'none' when every requirement is met.
  // the terrestrial legs' coverage ratios read the orbital-netted
  // requirement (the same basis as the gaps — interpretation above).
  const ratios: Array<[BuildoutSink, number]> = [
    ['chips', reqTerrestrial > 0 ? effective.chips / reqTerrestrial : Infinity],
    ['energy', reqTerrestrial > 0 ? effective.energy / reqTerrestrial : Infinity],
    ['dc', reqTerrestrial > 0 ? effective.dc / reqTerrestrial : Infinity],
    ['fleet', req.fleetRequired > 0 ? state.fleetUnits / req.fleetRequired : Infinity],
  ];
  ratios.sort((a, b) => a[1] - b[1]);
  const bindingSink: BuildoutSink | 'none' = ratios[0]![1] < 1 ? ratios[0]![0] : 'none';

  // Greedy binding-first target: fill gaps in ascending-coverage order from the
  // pre-gate budget; normalize to shares. Falls back to equal shares when no gaps.
  const allocTarget: Record<BuildoutSink, number> = { chips: 0, energy: 0, dc: 0, fleet: 0 };
  {
    let budget = iAiPregate;
    for (const [sink] of ratios) {
      const want = gapSpend[sink];
      const take = Math.min(want, budget);
      allocTarget[sink] = take;
      budget -= take;
      if (budget <= 0) break;
    }
    const tot = allocTarget.chips + allocTarget.energy + allocTarget.dc + allocTarget.fleet;
    if (tot > 0) {
      for (const s of ['chips', 'energy', 'dc', 'fleet'] as BuildoutSink[]) allocTarget[s] /= tot;
    } else {
      for (const s of ['chips', 'energy', 'dc', 'fleet'] as BuildoutSink[]) allocTarget[s] = 0.25;
    }
  }
  // The R3 SMOOTHED form: bounded partial adjustment toward the target.
  const allocUsed: Record<BuildoutSink, number> = { chips: 0, energy: 0, dc: 0, fleet: 0 };
  {
    let tot = 0;
    for (const s of ['chips', 'energy', 'dc', 'fleet'] as BuildoutSink[]) {
      allocUsed[s] = state.alloc[s] + smoothing * (allocTarget[s] - state.alloc[s]);
      tot += allocUsed[s];
    }
    for (const s of ['chips', 'energy', 'dc', 'fleet'] as BuildoutSink[]) allocUsed[s] /= tot;
  }

  return {
    year,
    dcRequired: req.dcRequired, fleetRequired: req.fleetRequired,
    effective, capacityTerrestrial, orbitalStock: state.orbital, capacityDc, supplyRatio,
    energyQueueLeadYears, energyQueueCeilingGrowth, energyBtmShare,
    energyPending, energyBtmPending, energyCeiling: state.energyQueue.additionsCeiling,
    gapSpend, buildoutDemandSpend, financeable, iAiPregate, fundingRatio,
    bindingSink, allocTarget, allocUsed, unitCosts,
  };
}

/** place an order into a delivery pipeline. Annual resolution: an
 *  order in year t with lead L becomes available in year t + max(1, L); fractional
 *  L splits linearly between the bracketing integer offsets (deregulation L = 1.5
 *  ⇒ half at +1, half at +2; the BTM lane's sub-year lead lands at the +1 floor —
 *  the pre-queue spend-to-available speed, which IS the express-lane semantics).
 *  Local mutation of a fresh copy only (applyBuildout stays pure). */
function placeEnergyOrder(
  pipe: Record<number, number>, orderYear: number, leadYears: number, units: number,
): void {
  if (units <= 0) return;
  const lo = Math.max(1, Math.floor(leadYears));
  const hi = Math.max(1, Math.ceil(leadYears));
  const wHi = hi > lo ? leadYears - Math.floor(leadYears) : 0;
  pipe[orderYear + lo] = (pipe[orderYear + lo] ?? 0) + units * (1 - wHi);
  if (wHi > 0) pipe[orderYear + hi] = (pipe[orderYear + hi] ?? 0) + units * wHi;
}

/** Advance the stocks with the REALIZED spend (post the unified investment gates —
 *  the same credit/capacity/rate chain all investment rides; no bypass). The fleet
 *  add is the designed triple minimum: financed units, chip-constrained units (the shared-chip
 *  sink at automotive-SoC cost), and the manufacturing ramp; the ramp GROWS at the
 *  episode-anchored rate only in years it binds (queue exhaustion honesty). */
export function applyBuildout(
  state: BuildoutState,
  plan: BuildoutPlan,
  realizedSpend: number,
  /** Chip-supply quantity index (100 = baseline): a chip famine rations fleet SoCs
   *  alongside DC accelerators — the shared-upstream-supply constraint (the shared-chip design). */
  chipsQtyIndex = 100,
  /** the fleet-production worldview's ramp growth per binding
   *  year. Absent ⇒ the consensus constant (the adopted design §4's fleet row). */
  rampGrowthOverride?: number,
  /** the fleet-ramp arrival index (100 = baseline) — the same
   *  effective-ramp disturbance the plan used this year. */
  fleetRampIndex = 100,
  /** the orbital arrival index (100 = baseline) — a per-year
   *  ADDITIONS declaration: max(0, (v − 100)/100) capacity units join S_orbital
   *  this year (payload capacity, the design's exogenous-arrival semantics).
   *  Happenings are exogenous — the add is not gated on belief. */
  orbitalAddIndex = 100,
): BuildoutState {
  const spend = Math.max(0, realizedSpend);
  const s = (sink: BuildoutSink) => spend * plan.allocUsed[sink];

  // ═══ THE ENERGY QUEUE ═══
  // The energy leg's financed build enters the pipeline; deliveries come from
  // vintages maturing this advance, gated by the additions ceiling; the express
  // lane bypasses the ceiling; the ceiling grows only in binding years (a queue,
  // not a fence). E3: the queue governs additions from 2026 forward — the seam
  // year never runs this step (the machine's first advance is the 2026 plan's).
  // Deliveries and orders GATE on a live requirement: the zero-AI twin — a world
  // in which the buildout never happened — orders nothing and receives nothing
  // from the in-flight book (the regression suite; the twin's stock keeps pure decay, exactly the
  // retired direct-add form's zero-spend arithmetic).
  // The retired direct-add form, kept per the no-delete rule:
  //   energy: state.energy * (1 - δ.energy) + s('energy') / plan.unitCosts.energy
  const q = state.energyQueue;
  let nextQueue: EnergyQueueState = q;
  let energyDelivered = 0;
  let energyBtmDelivered = 0;
  if (plan.dcRequired > 0) {
    const c = plan.unitCosts.energy;
    const eSpend = s('energy');
    const btmSpend = eSpend * plan.energyBtmShare;
    const gridUnits = c > 0 ? (eSpend - btmSpend) / c : 0;
    // E1: the express lane's units cost MORE per unit (the premium is real).
    const btmUnits = c > 0 ? btmSpend / (c * ENERGY_BTM_COST_PREMIUM) : 0;
    const t = plan.year;
    const pipe: Record<number, number> = { ...q.pipeline };
    const btmPipe: Record<number, number> = { ...q.btmPipeline };
    placeEnergyOrder(pipe, t, plan.energyQueueLeadYears, gridUnits);
    placeEnergyOrder(btmPipe, t, ENERGY_BTM_LEAD_YEARS, btmUnits);
    // Mature every vintage available for year t+1 (stale vintages sweep forward —
    // a path whose machine starts late still receives its book, ceiling-gated).
    let matured = 0;
    let btmMatured = 0;
    for (const k of Object.keys(pipe)) {
      const yk = Number(k);
      if (yk <= t + 1) { matured += pipe[yk]!; delete pipe[yk]; }
    }
    for (const k of Object.keys(btmPipe)) {
      const yk = Number(k);
      if (yk <= t + 1) { btmMatured += btmPipe[yk]!; delete btmPipe[yk]; }
    }
    const deliverable = matured + q.carryover;
    energyDelivered = Math.min(deliverable, q.additionsCeiling);
    energyBtmDelivered = btmMatured; // E1: bypasses the ceiling
    const ceilingBound = energyDelivered >= 0.999 * q.additionsCeiling && energyDelivered > 0;
    nextQueue = {
      pipeline: pipe,
      btmPipeline: btmPipe,
      carryover: deliverable - energyDelivered,
      additionsCeiling: ceilingBound
        ? q.additionsCeiling * (1 + plan.energyQueueCeilingGrowth)
        : q.additionsCeiling, // queue-not-fence: no free growth while slack
    };
  }

  const next: BuildoutState = {
    chips: state.chips * (1 - BUILDOUT_LEG_DEPRECIATION.chips) + s('chips') / plan.unitCosts.chips,
    energy: state.energy * (1 - BUILDOUT_LEG_DEPRECIATION.energy) + energyDelivered + energyBtmDelivered,
    dc: state.dc * (1 - BUILDOUT_LEG_DEPRECIATION.dc) + s('dc') / plan.unitCosts.dc,
    fleetUnits: 0,
    mfgRampCapacity: state.mfgRampCapacity,
    alloc: plan.allocUsed,
    energyQueue: nextQueue,
    lastEnergyDelivered: energyDelivered,
    lastEnergyBtmDelivered: energyBtmDelivered,
    // A2: the orbital stock — exogenous arrival additions, own service life.
    orbital: state.orbital * (1 - ORBITAL_DEPRECIATION)
      + Math.max(0, (Math.max(0, orbitalAddIndex) - 100) / 100),
  };

  const fleetSpend = s('fleet');
  const perUnitAllIn = plan.unitCosts.fleetUnit + FLEET_CHIPS_PER_UNIT * FLEET_SOC_COST_2025;
  const financedUnits = perUnitAllIn > 0 ? fleetSpend / perUnitAllIn : 0;
  // The shared-chip constraint (the shared-chip design): chips are ONE upstream supply with two sinks —
  // a chip famine (quantity index < 100) rations the fleet's SoCs exactly as it
  // rations DC accelerators. Surplus semantics: an above-100 chip
  // surplus stops rationing symmetrically — the index passes through un-clamped;
  // financing and the ramp still cap fleetAdd (surplus chips cannot buy or build
  // units by themselves), so the triple min preserves the ceiling. The retired
  // clamp, kept per the no-delete rule:
  //   financedUnits * Math.min(1, Math.max(0, chipsQtyIndex / 100));
  const chipConstrainedUnits = financedUnits * Math.max(0, chipsQtyIndex / 100);
  // the arrival row disturbs the effective ramp (matching the plan's read).
  const effRamp = state.mfgRampCapacity * Math.max(0, fleetRampIndex / 100);
  const fleetAdd = Math.min(financedUnits, chipConstrainedUnits, effRamp);
  next.fleetUnits = state.fleetUnits * (1 - FLEET_DEPRECIATION) + fleetAdd;

  const rampBound = fleetAdd >= effRamp * 0.999 && fleetAdd > 0;
  next.mfgRampCapacity = rampBound
    ? state.mfgRampCapacity * (1 + (rampGrowthOverride ?? FLEET_RAMP_GROWTH))
    : state.mfgRampCapacity;

  return next;
}
