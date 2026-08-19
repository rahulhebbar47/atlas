/**
 * MANIFEST TYPES — the axes program's adopted §4 schema .
 *
 * PRESETS ARE DATA (charter §3): every variant/event/package/scenario is a declarative
 * manifest mapping to EXACT ABSOLUTE VALUES — never multipliers or deltas. Manifests are
 * CI-validated against the dial table (src/data/dialTable.ts): every key live, every
 * value in-range AND within its measured live cap — a cosmetic manifest is structurally
 * impossible (r2-manifest-tests.test.ts runs the validators over every shipped
 * manifest).
 *
 * Nothing consumes manifests at runtime until the composition layer — the compiler runs pure in tests only
 * (the integration gate: pins bit-zero).
 */

/** Belief-manifest value labels (authoring rule (c)); policy manifests use designLabel
 *  instead (rule (i): proposals need accurate labels, not evidence). */
export type ValueLabel = 'cited' | 'episode' | 'honest-uncertainty';

export interface ValueEntry {
  key: string;                       // a dialTable key (validated live)
  value: number | string | boolean;  // ABSOLUTE — never a multiplier or delta
  label: ValueLabel;
  rationale?: string;
}

export type AxisId =
  | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6'
  | 'A7' | 'A8' | 'A9' | 'A10' | 'A11' | 'A12'
  | 'A13' | 'A14' // R2b species correction: Washington + the Fed are environment actors
  | 'N2'  // Production Program innovation amplification (the design specification)
  | 'N1'; // Production Program the buildout-cost worldview (the design specification + the recorded design decision)

/** One axis variant: a COMPLETE absolute assignment of the axis's owned set
 *  (authoring rule (a)); ordering constraints validated per axis (rule (b)). */
export interface VariantManifest {
  species: 'belief';
  axis: AxisId;
  variant: string;
  /** R3c (P0-2, human names): what the UI renders for this variant when the internal
   *  name is an id (the A13/A14 subsumed presets). Absent ⇒ `variant` is already the
   *  display form. */
  displayName?: string;
  ordinal: number;                   // position within the axis's variant set
  values: ValueEntry[];              // the complete owned set, materialized
  rationaleText: string;             // rules (c),(f),(g) — school names orientation-only
  /** R2b (variants by subsumption): this variant IS a live profile preset — the
   *  compiler emits ONE selector write (fiscalPolicyPreset / federalReservePreset);
   *  the machinery (resolveCombinedProfile, the statute guard, the custom-overlay
   *  clamp) keeps living where it lives; `values` are MATERIALIZED from the preset at
   *  module load (by reference — the the consensus-identity test lesson) for CI validation only. */
  subsumes?: { kind: 'fiscalPreset' | 'fedPreset'; presetId: string };
}

/** THE ORIGIN CHANNEL (the supply-chain shock design decision, Finding 2): which channel a
 *  shock arrives through decides whether resilience insures against it. Resilience
 *  rows model domestic substitution capacity — they absorb FOREIGN-origin quantity
 *  constraints only. A domestic-regulatory event attacks exactly that domestic
 *  capacity, so its targeted quantity rows BYPASS resilience while the leg is active.
 *  Price legs already bypass (direct ratios on the deployment-cost path). */
export type EventOrigin = 'foreign-supply' | 'domestic-regulatory' | 'price';

/** Per-year event entry: yearOffset is relative to the event's user-set anchor year. */
/** THE SEVERITY SCALING CLASS (specified, the per-leg class table): severity scales each
 *  leg's DISTANCE FROM NORMAL under the declared rule — never the raw value, never
 *  inferred. quantity-gap: 100 − k×(100−v), floored 0; price-spike: 100 + k×(v−100);
 *  multiplier-gap: 1 + k×(v−1); direct: k×v capped at the key's range (the geopolitical
 *  drag caps at 1). The compiler THROWS on a shock entry without a class when
 *  severity ≠ medium (enforcement-over-reading). */
export type SeverityScalingClass = 'quantity-gap' | 'price-spike' | 'multiplier-gap' | 'direct';

export interface PerYearEntry {
  key: string;
  yearOffset: number;
  value: number;
  /** Per-leg origin override (the energy-crisis pattern: price legs price-origin,
   *  capacity legs declared per-leg). Absent ⇒ the manifest's origin applies. */
  origin?: EventOrigin;
  /** The declared severity class (shock entries; recovery entries are restore targets
   *  and never scale). */
  scaling?: SeverityScalingClass;
}

export interface EventManifest {
  species: 'event';
  id: string;
  title: string;
  /** The event's default origin channel (validated; every shipped event declares).
   *  Per-leg entries may override via PerYearEntry.origin. */
  origin: EventOrigin;
  /** One quiet line on the card stating the event's expected direction, citing the
   *  measured impact table in the event documentation (user-visible; passes the
   *  vocabulary ban). */
  directionLine: string;
  /** R3b rider: the toggle-on anchor. A hardcoded 2031 anchored the chip shortage in a
   *  near-zero-adoption world at defaults (first triggers 2037+) — the user would see
   *  nothing move and conclude the mechanism broken; the adopted an earlier build step model-relative
   *  mapping places that episode where deployed stock exists. */
  defaultAnchorYear: number;
  /** Belief-owned keys this event may override from activation (the axis-override registration pattern —
   *  the axis-override registration; validated non-empty for any belief-owned key). */
  axisOverrideRegistrations: string[];
  entries: PerYearEntry[];
  /** RECOVERY IS EXPLICIT (the resolver's standing convention): recovery entries restore
   *  values at their offsets, or the manifest declares permanence. */
  recovery: PerYearEntry[] | 'permanent';
  /** THE FREEZE FINITE MODE (specified): a permanent-recovery event MAY declare per-leg
   *  finite-recovery targets — emitted at anchor + durationYears when the user sets a
   *  duration. DECLARED, never inferred; a permanent event with a user duration but no
   *  declaration throws at compile. */
  finiteRecovery?: Array<{ key: string; value: number }>;
  /** The user-selectable duration range (specified 1–15). permanentDefault marks the freeze
   *  grammar: the toggle defaults to permanent, years apply only when finite. */
  durationBounds?: { min: number; max: number; permanentDefault?: boolean };
  rationaleText: string;
}

/** Policy packages SUBSUME the existing machinery (charter §1) — they point at the
 *  live preset/profile/keyframe systems rather than duplicating values.
 *
 *  THE PER-FIELD REBUILD (a recorded design decision-08-08, the sidebar↔Advanced binding):
 *  the sidebar support programs write PER-FIELD config assignments — the channel with
 *  per-key provenance and touch-based shadowing — so the Advanced editor shows what
 *  the sidebar chose and a user's Advanced edit wins per key. configField gains an
 *  optional param binding; scheduleField materializes a single-keyframe schedule from
 *  two params (the start-year semantics: interpolatePolicy is 0 before the first
 *  keyframe). The policyPreset object-slot channel REMAINS for pkg-full-package
 *  (hidden from the sidebar; import/persisted paths). */
export type PolicyWrite =
  | { kind: 'policyPreset'; presetId: string }                     // POLICY_PRESETS
  | { kind: 'fiscalPreset'; presetId: string }                     // FISCAL_POLICY_PRESETS
  | { kind: 'fedPreset'; presetId: string }                        // FEDERAL_RESERVE_PRESETS
  | {
      kind: 'configField'; key: string; value: number | string | boolean;
      /** A declared param id: when the composed entry carries it, the entry's value
       *  replaces the literal `value`. DECLARED, never inferred (validated). */
      param?: string;
    }
  | {
      kind: 'scheduleField'; key: string;
      /** The declared param ids feeding the single keyframe (either may be absent —
       *  a fixed magnitude with a param-bound onset year is common); defaults apply
       *  when the binding is absent or the composed entry omits the param
       *  (DEFAULT-IDENTITY: absent params ⇒ the authored package, byte-identical). */
      valueParam?: string; defaultValue: number;
      yearParam?: string; defaultYear: number;
    };

/** One user-adjustable package parameter (mirrors EventManifest.durationBounds):
 *  the sidebar card renders these; the compiler validates entry params against them. */
export interface PolicyParamSpec {
  id: string;
  title: string;                       // the card's label, user-visible
  min: number;
  max: number;
  step: number;
  default: number;
  /** Display formatting hint for the card ('$', '%', 'yr', 'wk', '$B'). */
  unit?: string;
}

export interface PolicyManifest {
  species: 'policy';
  id: string;
  title: string;
  /** Rule (i): accurate design labeling of what is modeled — a proposal's honesty. */
  designLabel: string;
  /** Rule (i): cited wherever the package claims to represent a real system. */
  referent?: string;
  writes: PolicyWrite[];
  /** The package's user-adjustable parameters (absent ⇒ the package has no card
   *  controls). Every param referenced by a write; every write param declared here
   *  (validated both directions). Param bounds must sit inside the dial row's bounds. */
  params?: PolicyParamSpec[];
}

/** A composed policy-package reference — the user's knobs (the ComposedEventRef
 *  pattern). params OPTIONAL: absent ⇒ the authored manifest defaults, byte-identical
 *  (the DEFAULT-IDENTITY test). Keys are PolicyParamSpec ids. */
export interface ComposedPolicyRef {
  id: string;
  params?: Record<string, number>;
}

/** THE DATA-CALIBRATION SPECIES (the AEI integration program, Shape A — generic,
 *  built once): a source-attributed calibration overlay occupying the composition's
 *  fourth slot. AEI is the first member; a future source (lab, academic, the consumer
 *  population) joins as one manifest + card — zero new machinery. Scalars ride
 *  configAssignments under source 'data-calibration' (v1 ships ZERO scalar values —
 *  the empty array is asserted by the manifest validator); the per-cluster payload
 *  rides the recompute side channel into runSimulation (the event-layer precedent),
 *  below user overrides and above authored defaults in the ??-chains. */
export interface DataCalibrationManifest {
  species: 'data-calibration';
  id: string;                        // 'aei-v6-2026-06'
  title: string;                     // the details-surface face
  /** The compact radio-chip label (the model author's compact-zone amendment), e.g. "AEI". */
  chipLabel: string;
  /** The acronym expanded in full at the details level (first-use rule), e.g.
   *  "Anthropic Economic Index · V6 (June 2026)". */
  fullSourceName: string;
  /** What the provenance badge renders, e.g. "AEI · V6". */
  sourceShortName: string;
  /** Scalar dial-key writes (ordinary configAssignments; v1: EMPTY — asserted). */
  values: ValueEntry[];
  /** The per-cluster object payload — the committed processed.json, statically
   *  imported through the loader (validated at module load). */
  clusterPayload: import('@/data/anthropic/types').DataCalibrationPayload;
  /** Verbatim card copy: the subtitle-level disclosure + the expanded lines. */
  disclosure: { subtitle: string; expanded: string[] };
  rationaleText: string;
}

export interface OverrideEntry {
  key: string;                        // config field or per-year "key:year"
  value: number | string | boolean;
  provenance: 'user-override' | 'imported';
}

/** The severity selection (the supply-shock design decision): gap-scaling steps 0.5/1.0/1.5;
 *  medium ≡ the authored magnitudes VERBATIM (the identity gate). */
export type EventSeverity = 'mild' | 'medium' | 'severe';

/** A composed event reference — the user's knobs. Both new fields OPTIONAL: absent ⇒
 *  the authored manifest behavior, byte-identical (the DEFAULT-IDENTITY test). */
export interface ComposedEventRef {
  id: string;
  anchorYear: number;
  /** Years from anchor to recovery (specified range 1–15). Absent ⇒ the authored recovery
   *  offsets; on a permanent-recovery event, PRESENT switches it to the finite mode. */
  durationYears?: number;
  /** Absent ⇒ 'medium' ≡ authored verbatim. */
  severity?: EventSeverity;
}

export interface ScenarioManifest {
  species: 'scenario';
  id: string;
  title: string;
  axes: Partial<Record<AxisId, string>>;   // axis -> variant name (unset = Consensus)
  events: Array<ComposedEventRef>;
  /** Composed policy packages with optional user params (the per-field rebuild;
   *  formerly bare PolicyManifest ids — load boundaries normalize the legacy form). */
  policies: Array<ComposedPolicyRef>;
  /** The data-calibration slot: a DataCalibrationManifest id, or null/absent ⇒ none
   *  (the ATLAS-authored defaults — the honest null). */
  dataCalibration?: string | null;
  overrides: OverrideEntry[];
  worldviewBundle?: {
    name: string;
    scopeLine: "as expressible within ATLAS's mechanisms";
  };
}

/** The compiler's output (R2: produced pure in tests; consumed by the store at R3). */
export interface CompiledComposition {
  /** Config-field assignments with provenance (axis variants + policy configField
   *  writes + data-calibration scalar values, emitted FIRST so higher-precedence
   *  writes land on top in apply order). */
  configAssignments: Array<{
    key: string;
    /** Scalars, plus PolicySchedule objects for the per-field policy rebuild's
     *  scheduleField writes (materialized frozen single-keyframe schedules). */
    value: number | string | boolean | import('@/types').PolicySchedule;
    source: 'axis-variant' | 'policy' | 'data-calibration';
    origin: string;                        // "A3 · Sticky" / policy id / preset sourceShortName
    /** Ruling 2: trajectory-evolved keys set the BASELINE the autopilot evolves from;
     *  the origin surfaces via the baselineOrigin sub-tag, not the value tag. */
    asBaseline: boolean;
  }>;
  /** Per-year layer entries (events; sticky-forward with explicit recovery). */
  perYearEntries: Array<{
    key: string; year: number; value: number;
    source: 'event'; origin: string;
  }>;
  /** THE RESILIENCE-BYPASS LAYER (the origin channel): sticky 1/0 flags on RESILIENCE
   *  row keys, emitted for every domestic-regulatory quantity leg (1 at the leg's
   *  start, 0 at its explicit recovery; permanence ⇒ no closing flag). At resolution
   *  an active flag injects event-provenance 0 for the row — resilience cannot absorb
   *  a shock aimed at the resilience measures themselves. Restores to the autopilot
   *  trajectory by construction when the flag ends. */
  resilienceBypassEntries: Array<{
    key: string; year: number; value: 0 | 1; origin: string;
  }>;
  /** R3c (composition purity, P0-1): OBJECT-valued preset-slot writes (policyPreset).
   *  Applied at the store's compile choke point onto the EFFECTIVE config only — never
   *  the user's config, so deactivation reverts (on-off ≡ never-on). Fiscal/fed slots
   *  ride configAssignments as selector strings (the A13/A14 subsumption mechanism). */
  presetWrites: Array<{ kind: 'policyPreset'; presetId: string; origin: string }>;
  /** Surfaced composition conflicts — NEVER last-write-wins. */
  conflicts: Array<{ key: string; between: [string, string]; years?: number[] }>;
  /** THE NOTICE SURFACE (data-calibration precedence): a scalar key both the
   *  data-calibration preset and a higher layer write is a NOTICE, never a conflict —
   *  the data baseline calibrates what the user did not choose; explicit beliefs
   *  override observed data. Nothing refuses. (v1's shipped preset carries zero
   *  scalar values, so shipped compositions produce no notices; the mechanism is
   *  test-proven on synthetic manifests.) */
  notices: Array<{ key: string; winner: 'axis-variant' | 'policy'; loser: 'data-calibration'; origin: string }>;
  /** The composed data-calibration preset id (null ⇒ none) — the store resolves the
   *  payload for the side channel from this. */
  dataCalibrationId: string | null;
}
