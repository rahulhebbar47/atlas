/**
 * THE SHIPPED EVENT MANIFESTS (the design specification + the an earlier design session
 * design decision 6 event set). Time-anchored happenings: yearOffset is relative to the
 * user-set anchor year; RECOVERY IS EXPLICIT or permanence declared (the resolver's
 * standing convention — a drop-then-recover episode is entries + recovery entries).
 * Belief-owned keys carry the axis-override registration (the axis-override registration pattern).
 * Every event declares its ORIGIN channel (foreign-supply / domestic-regulatory /
 * price) — the channel decides whether resilience absorbs it (see types/manifests.ts).
 *
 * THE MEASURED IMPACT TABLE (the supply-chain fix stage, measured 2026-08-02 on the
 * fixed machinery at default settings; regenerated on every suite run by
 * sc-origin-friction-batteries.test.ts -> /tmp/atlas-scfix/impact-table.json; the
 * working snapshot is the maintainer's working records). Columns:
 * max |real-GDP delta| / max |unemployment delta| over the run vs the no-event
 * baseline, at each anchor. Every defaultAnchorYear and rationale below cites this
 * table — anchors are set by measurement, not adjectives.
 *
 *   event                    @2027            @2031            @2040            @default anchor
 *   chip-shortage-2021       0.39% / 0.18pp   1.06% / 0.19pp   4.42% / 4.22pp   4.42% / 4.22pp (2040)
 *   energy-crisis            0.02% / 0.15pp   0.42% / 0.35pp   2.20% / 2.35pp   1.23% / 0.28pp (2033)
 *   dc-regulatory-freeze     6.13% / 13.18pp  6.27% / 12.12pp  2.42% / 1.45pp   6.06% / 12.08pp (2032)
 *   geopolitical-escalation  0.70% / 0.16pp   0.94% / 0.18pp   0.81% / 0.40pp   0.94% / 0.18pp (2031)
 *
 * Direction, measured: every event slows AI — unemployment runs BELOW the baseline in
 * the binding years (less displacement), and real output can run above it where the
 * baseline's displacement-driven demand losses dominate. The cards state this in one
 * line (directionLine); the model prices AI's inputs only (see the boundaries surface).
 *
 * NOTE (an earlier build step): the table above is the earlier fix record
 * (2026-08-02 machinery). The flywheel's cost clock and the complementarity rider
 * (hard-complement aggregation) both move shocked-path magnitudes; the re-measured
 * table lives in the flywheel claims record (the maintainer's working records) and the regenerated
 * /tmp/atlas-scfix/impact-table.json. Anchors and rationales below keep their
 * earlier-fix basis (dated), unchanged pending an anchors re-design decision.
 */
import type { EventManifest } from '@/types/manifests';
import { EPISODE_SHOCK_MAPPING } from '@/data/episodes/chipShortage2021';

export const EVENT_MANIFESTS: readonly EventManifest[] = [
  {
    species: 'event',
    id: 'chip-shortage-2021',
    title: 'Chip shortage (2021-22 class)',
    // The adopted an earlier build step model-relative placement: shock where the model holds adoption stock.
    defaultAnchorYear: 2040,
    // Foreign-supply origin (the control assignment): the 2021-22 shortage was a foreign
    // fab-capacity shock — domestic resilience (onshoring, stockpiles) genuinely insures
    // against it, so absorption semantics are unchanged.
    origin: 'foreign-supply',
    directionLine: 'Slows AI adoption while it lasts — typically less displacement and lower AI-driven output, not a wider recession.',
    axisOverrideRegistrations: [],
    // ON the committed evidence tables (src/data/episodes/chipShortage2021.ts): the
    // quantity dip and the price spike are DISTINCT (price and quantity are distinct phenomena).
    // MODEL-RELATIVE mapping stands (an adopted design decision): anchor the event where the model
    // holds adoption stock — a calendar-2021 replay would shock zero deployed stock.
    entries: [
      { key: 'supplyChainAiChips', yearOffset: 0, value: EPISODE_SHOCK_MAPPING.aiChipsDip, scaling: 'quantity-gap' },
      { key: 'supplyChainRoboticsHW', yearOffset: 0, value: EPISODE_SHOCK_MAPPING.roboticsHardwareDip, scaling: 'quantity-gap' },
      { key: 'supplyChainChipPrice', yearOffset: 0, value: EPISODE_SHOCK_MAPPING.chipPriceSpike, origin: 'price', scaling: 'price-spike' },
    ],
    recovery: [
      { key: 'supplyChainAiChips', yearOffset: 2, value: 100 },
      { key: 'supplyChainRoboticsHW', yearOffset: 2, value: 100 },
      { key: 'supplyChainChipPrice', yearOffset: 2, value: 100 },
    ],
    durationBounds: { min: 1, max: 15 },
    rationaleText: 'The 2021-22 semiconductor shortage as a reusable shock: two-year quantity dip with a price spike, explicit recovery (magnitudes from the documented 2021-22 episode tables). The default year is set by measurement — the shock needs deployed AI to bite (about four percent of output at its peak there, a tenth of that in the late 2020s). Mild and severe halve or grow the documented magnitudes by half again (editorial steps around the cited anchor); very short durations bite less than proportionally because supply inputs act with a lag.',
  },
  {
    species: 'event',
    id: 'energy-crisis',
    title: 'Energy crisis',
    // Mid-transition: energy demand from AI buildout is material but the grid hasn't adapted.
    defaultAnchorYear: 2033,
    // Per-leg origins (the specified energy assignment): the price leg is price-origin; the
    // capacity leg is foreign-supply — the orientation episode (2022 European crisis) is
    // a foreign fuel-supply cutoff, and domestic grid buildout (what the energy
    // resilience row measures) genuinely insures against it.
    origin: 'foreign-supply',
    directionLine: 'Raises AI operating costs and slows adoption — typically less displacement and lower AI-driven output.',
    axisOverrideRegistrations: [],
    // The worse-of coupling (supplyChain.ts:308): price and capacity shocks bind jointly.
    entries: [
      { key: 'supplyChainEnergyPrice', yearOffset: 0, value: 250, origin: 'price', scaling: 'price-spike' },
      { key: 'supplyChainEnergyCapacity', yearOffset: 0, value: 70, origin: 'foreign-supply', scaling: 'quantity-gap' },
    ],
    recovery: [
      { key: 'supplyChainEnergyPrice', yearOffset: 3, value: 100 },
      { key: 'supplyChainEnergyCapacity', yearOffset: 3, value: 100 },
    ],
    durationBounds: { min: 1, max: 15 },
    rationaleText: 'A three-year energy price spike with constrained grid capacity for AI (magnitudes flagged uncertain: no committed episode table yet — the 2022 European energy crisis is the orientation). At the default year the bite is mostly the price channel, about one percent of output at its peak; anchored late (2040) it roughly doubles. Mild and severe halve or grow the flagged magnitudes by half again (editorial steps); very short durations bite less than proportionally because supply inputs act with a lag.',
  },
  {
    species: 'event',
    id: 'dc-regulatory-freeze',
    title: 'Datacenter regulatory freeze',
    // RE-TRUED (the earlier fix measurement — the impact table above): at 2032 the freeze
    // shapes the EMBODIED capability path (max delta 0.078; generative is largely built
    // by then) and delays the adoption wave — 6.06% peak output swing, 12.08pp peak
    // unemployment swing. Anchored at 2040 the capability stock already exists and the
    // bite falls to 2.42%. The prior claim ("shapes the capability path visibly") was
    // written before the origin channel existed and was empirically false then.
    defaultAnchorYear: 2032,
    // Domestic-regulatory origin (the specified assignment): a permitting freeze attacks the
    // domestic construction capacity the datacenter resilience rows measure — the one
    // shock class that insurance cannot cover. The targeted quantity rows bypass
    // resilience while the freeze holds.
    origin: 'domestic-regulatory',
    directionLine: 'Constrains AI capability growth — typically delayed adoption, less displacement, and lower AI-driven output.',
    axisOverrideRegistrations: [],
    entries: [
      { key: 'regulatoryFriction', yearOffset: 0, value: 3.0, scaling: 'multiplier-gap' },
      { key: 'supplyChainTrainingDC', yearOffset: 0, value: 60, scaling: 'quantity-gap' },
      { key: 'supplyChainInferenceDC', yearOffset: 0, value: 75, scaling: 'quantity-gap' },
    ],
    // PERMANENCE DECLARED: a regulatory regime persists until policy reverses it —
    // the user removes the event to end it (no silent decay).
    recovery: 'permanent',
    // THE FINITE MODE (specified): a user duration lifts the freeze at anchor + duration,
    // restoring these DECLARED targets — friction to 1.0 (the no-friction default the
    // dial documents), the quantity rows to 100 (normal).
    finiteRecovery: [
      { key: 'regulatoryFriction', value: 1.0 },
      { key: 'supplyChainTrainingDC', value: 100 },
      { key: 'supplyChainInferenceDC', value: 100 },
    ],
    durationBounds: { min: 1, max: 15, permanentDefault: true },
    rationaleText: 'A permitting freeze: datacenter buildout halts — the freeze disables the domestic construction capacity that would otherwise absorb it, slows further capacity additions, and amplifies scale pressure on the existing stock. Measured at the default year: about a six percent output swing and a twelve point unemployment swing at peak. Persists until you remove the event, or set a duration to have it lift on schedule; shock magnitudes flagged uncertain. Mild and severe halve or grow those magnitudes by half again (editorial steps).',
  },
  {
    species: 'event',
    id: 'geopolitical-escalation',
    title: 'Geopolitical escalation',
    // The §3.4 worked example's anchor.
    defaultAnchorYear: 2031,
    // Foreign-supply origin (the specified assignment): the chip cut is a foreign cut;
    // domestic resilience insures. The adoption-drag leg is not a supply row.
    origin: 'foreign-supply',
    directionLine: 'Slows AI adoption, cuts chip supply, and spikes energy prices — typically less displacement and lower AI-driven output.',
    // THE §3.4 WORKED EXAMPLE'S MANIFEST FORM (the adopted precedence example):
    // geopoliticalRiskFactor is A3-OWNED — the registration records the axis override
    // (an event may override an axis-owned trajectory from activation; the badge shows
    // event provenance; explicit recovery returns the axis value).
    axisOverrideRegistrations: ['adoptionParams.geopoliticalRiskFactor'],
    entries: [
      { key: 'geopoliticalRiskFactor', yearOffset: 0, value: 0.45, scaling: 'direct' },
      { key: 'supplyChainAiChips', yearOffset: 0, value: 70, scaling: 'quantity-gap' },
      // a
      // war-class escalation spikes energy prices; the row transmits through the
      // adoption-drag price form, the buildout's energy build cost, AND the AI
      // sector's operating power bill (energyOpex → AI margins → Financeable →
      // I_AI — the end-to-end wire the E2 integration test measures).
      // Magnitude 150 [episode-class band stated: US industrial electricity +13%
      // (2022 realized) … European industrial ~2× (the exposed-grid extreme);
      // the middle stated, flagged uncertain].
      { key: 'supplyChainEnergyPrice', yearOffset: 0, value: 150, origin: 'price', scaling: 'price-spike' },
    ],
    recovery: [
      { key: 'geopoliticalRiskFactor', yearOffset: 5, value: -1 }, // -1 = RESTORE-AXIS sentinel (compiler resolves to the composed axis/default value)
      { key: 'supplyChainAiChips', yearOffset: 5, value: 100 },
      { key: 'supplyChainEnergyPrice', yearOffset: 5, value: 100 },
    ],
    durationBounds: { min: 1, max: 15 },
    rationaleText: 'An escalation raising geopolitical adoption drag, cutting chip availability, and spiking energy prices for five years; on recovery the standing worldview values return. The energy-price spike raises the cost of building and of running AI capacity — it squeezes AI margins and, through them, the financeable buildout. Magnitudes flagged uncertain (the energy spike is the 2022 episode class: between the realized US industrial rise and the exposed-grid European extreme). Mild and severe halve or grow the flagged magnitudes by half again (editorial steps); very short durations bite less than proportionally because supply inputs act with a lag.',
  },
  // ═══ the AI production system  — SIGNED, LEG-TARGETED ARRIVALS
  //     (the design specification + the adopted adoption-gating design §4): the event species
  //     extends from negative shocks to arrivals — quantity rows ABOVE 100 are
  //     LIVE surplus (the an earlier build step semantics: relief in the constraint math; added
  //     capacity on the buildout stocks). Permanence declared for durable
  //     capacity; a user duration lifts the effect via the declared targets. ═══
  {
    species: 'event',
    id: 'terafab-online',
    title: 'Terafab online',
    // The the design specification worked example's year: a fab complex announced late-2020s
    // reaches volume production early-2030s (leading-edge fab construction runs
    // three to five years).
    defaultAnchorYear: 2031,
    // Domestic capacity arrival — the domestic channel (the design specification's own
    // assignment). The domestic-channel resilience bypass means the arrival's
    // relief is NOT damped by the domestic-substitution insurance term — exact for
    // capacity that IS domestic.
    origin: 'domestic-regulatory',
    directionLine: 'Adds domestic chip supply — typically somewhat faster AI adoption and buildout from its arrival year.',
    axisOverrideRegistrations: [],
    // Magnitude: a completed multi-fab leading-edge complex adds on the order of
    // five to ten percent of world leading-edge capacity (the announced
    // Arizona-class complexes against world leading-edge output — the named-fab
    // share class; band stated, flagged uncertain at the top).
    entries: [
      { key: 'supplyChainAiChips', yearOffset: 0, value: 110, scaling: 'quantity-gap' },
    ],
    // PERMANENCE DECLARED: a completed fab is durable capacity.
    recovery: 'permanent',
    // The finite mode (declared, never inferred): a user duration retires the
    // added share on schedule.
    finiteRecovery: [
      { key: 'supplyChainAiChips', value: 100 },
    ],
    durationBounds: { min: 1, max: 15, permanentDefault: true },
    rationaleText: 'A very large domestic chip-fabrication complex comes online: chip supply rises about ten percent above baseline from the arrival year and stays (a completed fab is durable capacity). The magnitude is the named-fab share class — a multi-fab leading-edge complex against world leading-edge output — with the band five to ten percent, flagged uncertain at the top. Where chip supply was constrained, the arrival relieves it; where nothing binds, the surplus lowers scarcity pricing and feeds the buildout directly. Mild and severe halve or grow the added share by half again (editorial steps).',
  },
  {
    species: 'event',
    id: 'orbital-datacenters',
    title: 'Orbital datacenters',
    // The the design specification worked example's year.
    defaultAnchorYear: 2033,
    // an orbital
    // platform delivers compute with its OWN embedded power (chips + solar ship
    // together — the design decision's words); it bypasses the terrestrial energy queue
    // entirely and relieves NOTHING for other terrestrial builds. The event now
    // writes the orbitalCapacity ADDITIONS row (an additive stock past the
    // terrestrial min), not terrestrial-energy relief. Domestic channel.
    origin: 'domestic-regulatory',
    directionLine: 'Adds orbital computing capacity carrying its own power and bends terrestrial energy costs downward — typically somewhat faster AI adoption and buildout.',
    // The bend key is belief-owned (the buildout-cost worldview axis) — the
    // axis-override-registered axis-override registration.
    axisOverrideRegistrations: ['buildoutEnergyCostTrend'],
    entries: [
      // RETIRED (the integrated-capacity upgrade, a recorded design decision): the terrestrial-relief
      // entry was the best available pre-design decision reading (energy availability
      // +30%); it is SUPERSEDED, not wrong — orbital power never touches the
      // terrestrial grid, so the relief form claimed physics the platform does
      // not have. Kept per the no-delete rule:
      //   { key: 'supplyChainEnergyCapacity', yearOffset: 0, value: 130, scaling: 'quantity-gap' },
      // The additions declaration: each covered year ships payloads adding ten
      // percent of the 2025 required capacity as orbital stock ((v − 100)/100
      // units/yr; own service life ~5–7yr LEO class). [honest-uncertainty —
      // the founding-aspiration honesty carried below.]
      { key: 'orbitalCapacity', yearOffset: 0, value: 110, scaling: 'quantity-gap' },
      // The declared cost-curve bend stays, RE-RATIONALIZED: orbital
      // competition bends terrestrial energy pricing — the bend also enters the
      // operating price p_energy (the A3 "+ event bends" declaration).
      { key: 'buildoutEnergyCostTrend', yearOffset: 0, value: -0.05, scaling: 'direct' },
    ],
    // PERMANENCE DECLARED: orbital capacity, once operating, persists (the stock
    // then decays at its own service life unless payloads keep flying).
    recovery: 'permanent',
    finiteRecovery: [
      { key: 'orbitalCapacity', value: 100 },
      // Documented restore target only — the finite lift is a RELEASE (F2): the
      // composed worldview's own trend resumes by construction.
      { key: 'buildoutEnergyCostTrend', value: 0.0 },
    ],
    durationBounds: { min: 1, max: 15, permanentDefault: true },
    rationaleText: 'Orbital datacenters begin operating: each year the program ships payloads adding about ten percent of the 2025 AI capacity requirement as orbital computing stock — capacity that carries its own solar power, bypasses the grid interconnection queue entirely, and adds past the terrestrial bottleneck. Terrestrial energy costs bend downward about five percent a year from the arrival (orbital competition). Magnitudes are speculative and flagged uncertain — no deployment record exists; the scenario states a founding aspiration honestly rather than a citation. Mild and severe halve or grow the magnitudes by half again (editorial steps).',
  },
];
