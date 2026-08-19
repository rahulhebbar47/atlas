/**
 * THE MANIFEST COMPILER  — pure functions compiling a scenario composition into the
 * layers the resolution consumes. NOTHING at runtime calls this until the composition layer (the integration gate:
 * pins bit-zero; the compiler is exercised in tests only).
 *
 * Two compilation targets (a recorded design decision):
 *  (a) CONFIG-FIELD assignments (axis variants are overwhelmingly config scalars) with
 *      provenance and the design decision-2 asBaseline flag for trajectory-evolved keys — the
 *      variant sets the BASELINE the autopilot evolves from; the baselineOrigin sub-tag
 *      carries "baseline set by [axis · variant]" to the badge's detail surface;
 *  (b) PER-YEAR entries for events (sticky-forward with explicit recovery; the
 *      RESTORE-AXIS sentinel resolves to the composed axis/default value).
 *
 * Conflicts SURFACE — never last-write-wins: two events on one
 * parameter-year; two packages writing the same preset slot or config key.
 */
import type {
  ScenarioManifest, VariantManifest, EventManifest, PolicyManifest, PolicyWrite, CompiledComposition,
  DataCalibrationManifest, ComposedPolicyRef,
} from '@/types/manifests';
import { DIAL_BY_KEY } from '@/data/dialTable';
import { SEVERITY_K_STEPS, SUPPLY_INPUT_CLASS } from '@/models/constants';
import { getDefaultSupplyChainConfig } from './supplyChain';
import type { SimulationConfig, PolicySchedule } from '@/types';

/** Deep-set a dotted path immutably. */
function setDeepPath(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const [head, ...rest] = path.split('.');
  if (!head) return obj;
  if (rest.length === 0) return { ...obj, [head]: value };
  return { ...obj, [head]: setDeepPath((obj[head] ?? {}) as Record<string, unknown>, rest.join('.'), value) };
}

/** Deep-read a dotted path (the projection side of the per-field policy rebuild). */
function getDeepPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
}

/**
 * Apply compiled config assignments over a config — THE OPTIONAL-PARENT RULE (found by
 * the consensus-identity test's first run, recorded per the honesty discipline): a nested assignment whose
 * optional parent block is ABSENT must not create a partial object. A default-equal
 * value under an absent parent is a NO-OP (the absent-parent ?? fallback already yields
 * it — materializing would wrongly activate the dormant block and break the Consensus
 * identity); a non-default value materializes the parent's default structure first.
 * skipKeys: keys the caller excludes (the store's user-shadowed keys).
 */
export function applyAssignments(
  config: SimulationConfig,
  assignments: CompiledComposition['configAssignments'],
  skipKeys?: ReadonlySet<string>,
): SimulationConfig {
  let eff = config as unknown as Record<string, unknown>;
  for (const a of assignments) {
    if (skipKeys?.has(a.key)) continue;
    if (a.key.startsWith('supplyChainConfig.') && eff['supplyChainConfig'] === undefined) {
      const d = DIAL_BY_KEY.get(a.key)?.default;
      const equal = typeof a.value === 'number' && typeof d === 'number'
        ? Math.abs(a.value - d) < 1e-12 : a.value === d;
      if (equal) continue;
      eff = { ...eff, supplyChainConfig: getDefaultSupplyChainConfig() as unknown };
    }
    eff = setDeepPath(eff, a.key, a.value);
  }
  return eff as unknown as SimulationConfig;
}

/** THE EVENT-KEY CENSUS (the event-binding design decision): every per-year
 *  key a shipped event manifest can write (shock, recovery, or resilience-bypass
 *  rows), mapped to the config path whose grid row it governs. Consumed by (a) the
 *  restore-axis resolution below (the original single entry, unchanged) and (b) the
 *  Advanced grid's governed-row chip (the reverse map). Completeness is
 *  test-asserted: a new event key without a census row fails the suite. */
export const REGISTERED_EVENT_KEY_TO_CONFIG: Record<string, string> = {
  geopoliticalRiskFactor: 'adoptionParams.geopoliticalRiskFactor',
  supplyChainAiChips: 'supplyChainConfig.inputs.aiChips',
  supplyChainChipPrice: 'supplyChainConfig.inputs.chipPrice',
  supplyChainEnergyPrice: 'supplyChainConfig.inputs.energyPrice',
  supplyChainEnergyCapacity: 'supplyChainConfig.inputs.energyCapacity',
  supplyChainTrainingDC: 'supplyChainConfig.inputs.trainingDCCapacity',
  supplyChainInferenceDC: 'supplyChainConfig.inputs.inferenceDCCapacity',
  supplyChainRoboticsHW: 'supplyChainConfig.inputs.roboticsHardware',
  supplyChainSoftwareEfficiency: 'supplyChainConfig.inputs.softwareEfficiency',
  resilienceAiChips: 'supplyChainConfig.resilience.aiChips',
  resilienceEnergy: 'supplyChainConfig.resilience.energy',
  resilienceTrainingDC: 'supplyChainConfig.resilience.trainingDC',
  resilienceInferenceDC: 'supplyChainConfig.resilience.inferenceDC',
  resilienceRoboticsHW: 'supplyChainConfig.resilience.roboticsHardware',
  regulatoryFriction: 'supplyChainConfig.regulatoryFriction',
  // the energy leg's cost-curve BEND key — an event
  // may bend the N1-owned trend under the axis-override registration; the
  // loop compounds the bend factor from the event layer (simulation.ts).
  buildoutEnergyCostTrend: 'buildoutEnergyCostTrend',
  // the orbital additions row (the fleet-ramp vehicle precedent —
  // the upgraded orbital-datacenters arrival writes it; the loop's sticky read).
  orbitalCapacity: 'parameterOverrides.orbitalCapacity',
};

/** RECOVERY = RELEASE (the adopted fix): the sentinel a recovery entry carries in
 *  the event layer. A released key-year is NOT event-covered — resolution falls
 *  through to the layers below (user baseline, axis, autopilot, default), so a user's
 *  baseline edit survives the event ending instead of being masked by an authored
 *  restore constant forever (a previously-found composition bug). NaN is unreachable as a
 *  real row value and flows through the Map<string, number> layers untouched; every
 *  consumer guards with Number.isNaN. The restore-axis (−1) mechanism keeps its
 *  compile-time semantics (the geopolitical drag; unification is a register item). */
export const EVENT_RECOVERY_RELEASE = Number.NaN;

/** THE ORIGIN CHANNEL (the supply-chain shock design decision): quantity input row → the
 *  resilience row that insures it. Price rows and softwareEfficiency are never bypass
 *  targets (price legs already bypass on the deployment-cost path). */
export const QUANTITY_ROW_TO_RESILIENCE: Readonly<Record<string, string>> = {
  supplyChainAiChips: 'resilienceAiChips',
  supplyChainEnergyCapacity: 'resilienceEnergy',
  supplyChainTrainingDC: 'resilienceTrainingDC',
  supplyChainInferenceDC: 'resilienceInferenceDC',
  supplyChainRoboticsHW: 'resilienceRoboticsHW',
};

/** The price rows: legs on these must declare origin 'price' (validated). */
export const PRICE_ROWS: ReadonlySet<string> = new Set([
  'supplyChainChipPrice', 'supplyChainEnergyPrice',
]);

/** The slot one policy write occupies — THE naming the conflict detector uses (one basis). */
function writeSlot(w: PolicyWrite): string {
  return w.kind === 'configField' || w.kind === 'scheduleField'
    ? `config:${w.key}` : `slot:${w.kind}`;
}

/**
 * RADIO-WITHIN-SLOT SELECTION (a recorded design decision): toggling an active package
 * removes it; activating a package REPLACES any selected package writing one of the
 * same slots — same-slot double-selection (the only sidebar path to the old
 * "selections conflict, nothing was applied" refusal) is unreachable by construction.
 * Packages on DIFFERENT slots still compose. THE PER-FIELD REBUILD (recorded design decision
 * 2026-08-08): the three support programs write disjoint policyConfig.* key sets, so
 * they compose with each other by construction — radio replacement now binds only
 * genuinely same-slot pairs. Entries carry optional user params (ComposedPolicyRef);
 * activation appends a bare {id} (params are written only on user interaction —
 * DEFAULT-IDENTITY). The compiler's conflict surface stays as the backstop for
 * compositions arriving by other paths (import, persisted sessions).
 */
export function togglePolicyExclusive(
  selected: readonly ComposedPolicyRef[],
  id: string,
  manifests: readonly PolicyManifest[],
): ComposedPolicyRef[] {
  if (selected.some((e) => e.id === id)) return selected.filter((e) => e.id !== id);
  const target = manifests.find((p) => p.id === id);
  const targetWrites = target?.writes ?? [];
  const targetSlots = new Set(targetWrites.map(writeSlot));
  // The cross-channel radio (mirror of the compile backstop): a policyPreset package
  // occupies the WHOLE policyConfig block, so it overlaps every per-field
  // policyConfig.* writer — the pair must radio-replace, never co-select (the
  // refusal stays unreachable from every surface using this helper).
  const writesPolicyBlock = (ws: readonly PolicyWrite[]): boolean =>
    ws.some((w) => w.kind === 'policyPreset'
      || ((w.kind === 'configField' || w.kind === 'scheduleField') && w.key.startsWith('policyConfig.')));
  const targetHasPreset = targetWrites.some((w) => w.kind === 'policyPreset');
  const targetHasFields = writesPolicyBlock(targetWrites) && !targetHasPreset;
  const kept = selected.filter((e) => {
    const m = manifests.find((p) => p.id === e.id);
    const ws = m?.writes ?? [];
    if (ws.some((w) => targetSlots.has(writeSlot(w)))) return false;
    if (targetHasPreset && writesPolicyBlock(ws)) return false;
    if (targetHasFields && ws.some((w) => w.kind === 'policyPreset')) return false;
    return true;
  });
  return [...kept, { id }];
}

/** THE LOAD-BOUNDARY NORMALIZER (the per-field rebuild): applied wherever a
 *  composition enters from OUTSIDE the running store — session rehydration,
 *  saved-scenario load, file import. Legacy entries are bare id strings (pre-rebuild
 *  saves/exports live forever in localStorage and .json files); they become {id}
 *  with the authored defaults. Unknown package ids and undeclared params drop
 *  LOUDLY (the data-calibration loud-loss pattern) — compileComposition throws on
 *  both, and a throw inside a load path bricks the load. */
export function normalizePolicyRefs(
  entries: unknown,
  manifests: readonly PolicyManifest[],
): ComposedPolicyRef[] {
  if (!Array.isArray(entries)) return [];
  const out: ComposedPolicyRef[] = [];
  for (const raw of entries) {
    const ref = typeof raw === 'string' ? { id: raw } : raw as { id?: unknown; params?: unknown };
    if (typeof ref.id !== 'string') continue;
    const manifest = manifests.find((p) => p.id === ref.id);
    if (!manifest) {
      console.warn(`[ATLAS] Unknown policy package "${String(ref.id)}" in the loaded composition — dropped; the rest of the composition applies.`);
      continue;
    }
    const declared = new Set((manifest.params ?? []).map((s) => s.id));
    const params: Record<string, number> = {};
    for (const [k, v] of Object.entries((ref.params ?? {}) as Record<string, unknown>)) {
      if (declared.has(k) && typeof v === 'number' && Number.isFinite(v)) { params[k] = v; continue; }
      console.warn(`[ATLAS] Policy package "${manifest.id}": loaded param "${k}" is not declared (or not a number) — dropped; the package's default applies.`);
    }
    out.push(Object.keys(params).length > 0 ? { id: manifest.id, params } : { id: manifest.id });
  }
  return out;
}

/** Materialize one scheduleField write into a frozen single-keyframe schedule
 *  (interpolatePolicy is 0 before the first keyframe — the start-year semantics).
 *  Frozen deep: the SAME instance is applied on every recompute; freezing makes
 *  mutation-corruption impossible rather than merely absent (design-review hardening). */
function materializeSchedule(year: number, value: number): PolicySchedule {
  const keyframe = { year, value };
  const schedule = { keyframes: [keyframe] };
  Object.freeze(keyframe);
  Object.freeze(schedule.keyframes);
  Object.freeze(schedule);
  return schedule;
}

/**
 * THE PARAM PROJECTION (the bidirectional-sync addendum, author 2026-08-08): read a
 * package's card-parameter values OFF A CONFIG — the sidebar card renders this over
 * the EFFECTIVE config (the one producer), so an Advanced edit that shadows a
 * composed key shows up on the card automatically. Per declared param, the FIRST
 * write bound to it is the canonical read site (configField → the key's value;
 * scheduleField → the first keyframe's value/year). Falls back to the spec default
 * when the site is absent or shapeless (e.g. an empty schedule).
 */
export function readPolicyParams(
  manifest: PolicyManifest,
  config: SimulationConfig,
): Record<string, number> {
  const out: Record<string, number> = {};
  const root = config as unknown as Record<string, unknown>;
  for (const spec of manifest.params ?? []) {
    let value: number | undefined;
    for (const w of manifest.writes) {
      if (w.kind === 'configField' && w.param === spec.id) {
        const raw = getDeepPath(root, w.key);
        if (typeof raw === 'number') value = raw;
        break;
      }
      if (w.kind === 'scheduleField' && (w.valueParam === spec.id || w.yearParam === spec.id)) {
        const raw = getDeepPath(root, w.key) as PolicySchedule | undefined;
        const first = raw?.keyframes?.[0];
        if (first) value = w.valueParam === spec.id ? first.value : first.year;
        break;
      }
    }
    out[spec.id] = value ?? spec.default;
  }
  return out;
}


export function compileComposition(
  scenario: ScenarioManifest,
  variants: readonly VariantManifest[],
  events: readonly EventManifest[],
  policies: readonly PolicyManifest[],
  dataCalibrations: readonly DataCalibrationManifest[] = [],
): CompiledComposition {
  const configAssignments: CompiledComposition['configAssignments'] = [];
  const perYearEntries: CompiledComposition['perYearEntries'] = [];
  const conflicts: CompiledComposition['conflicts'] = [];
  const presetWrites: CompiledComposition['presetWrites'] = [];
  const resilienceBypassEntries: CompiledComposition['resilienceBypassEntries'] = [];
  const notices: CompiledComposition['notices'] = [];

  // ── (0) THE DATA-CALIBRATION SLOT (the AEI program) — emitted FIRST so every
  // higher-precedence write (axis, policy) lands on top in apply order. A key both
  // layers write becomes a NOTICE, never a conflict: the data baseline calibrates
  // what the user did not choose. (v1's shipped member carries zero scalar values;
  // the mechanism is exercised by synthetic manifests in the tests.) ──
  const dataCalibrationId = scenario.dataCalibration ?? null;
  if (dataCalibrationId !== null) {
    const m = dataCalibrations.find((d) => d.id === dataCalibrationId);
    if (!m) throw new Error(`unknown data-calibration preset ${dataCalibrationId}`);
    for (const e of m.values) {
      const row = DIAL_BY_KEY.get(e.key);
      configAssignments.push({
        key: e.key, value: e.value, source: 'data-calibration',
        origin: m.sourceShortName, asBaseline: row?.trajectoryEvolved ?? false,
      });
    }
  }

  // ── (a) axis variants → config assignments ──
  for (const [axis, variantName] of Object.entries(scenario.axes)) {
    const m = variants.find((v) => v.axis === axis && v.variant === variantName);
    if (!m) throw new Error(`unknown variant ${axis}·${variantName}`);
    if (m.subsumes) {
      // R2b (variants by subsumption): ONE selector write — the preset machinery keeps
      // living where it lives; the materialized values are validation-surface only.
      configAssignments.push({
        key: m.subsumes.kind === 'fiscalPreset' ? 'fiscalPolicyPreset' : 'federalReservePreset',
        value: m.subsumes.presetId, source: 'axis-variant',
        origin: `${axis} · ${m.variant}`, asBaseline: false,
      });
      continue;
    }
    for (const e of m.values) {
      const row = DIAL_BY_KEY.get(e.key);
      configAssignments.push({
        key: e.key, value: e.value, source: 'axis-variant',
        origin: `${axis} · ${m.variant}`,
        asBaseline: row?.trajectoryEvolved ?? false,
      });
    }
  }

  // ── policies → per-field config assignments + preset-slot writes (conflict on same
  // slot/key). THE PER-FIELD REBUILD: entries are ComposedPolicyRef ({id, params?});
  // params bind through the writes' declared param ids — DECLARED, never inferred
  // (an undeclared entry param throws, the severity-class genus). ──
  const slotWriters = new Map<string, string>();
  for (const ref of scenario.policies) {
    const p = policies.find((x) => x.id === ref.id);
    if (!p) throw new Error(`unknown policy package ${ref.id}`);
    const declared = new Set((p.params ?? []).map((s) => s.id));
    for (const k of Object.keys(ref.params ?? {})) {
      if (!declared.has(k)) {
        throw new Error(`policy ${p.id}: param '${k}' is not declared by the manifest — it cannot be applied`);
      }
    }
    const paramOr = (pid: string | undefined, fallback: number): number =>
      (pid !== undefined && ref.params?.[pid] !== undefined) ? ref.params[pid]! : fallback;
    for (const w of p.writes) {
      const slot = writeSlot(w);
      const prior = slotWriters.get(slot);
      if (prior && prior !== p.id) {
        conflicts.push({ key: slot, between: [prior, p.id] });
        continue; // surfaced, not last-write-wins — neither write proceeds silently
      }
      slotWriters.set(slot, p.id);
      if (w.kind === 'configField') {
        const value = w.param !== undefined && typeof w.value === 'number'
          ? paramOr(w.param, w.value) : w.value;
        configAssignments.push({ key: w.key, value, source: 'policy', origin: p.id, asBaseline: false });
      } else if (w.kind === 'scheduleField') {
        // A single-keyframe schedule from (yearParam, valueParam) — absent params ⇒
        // the authored defaults, byte-identical (DEFAULT-IDENTITY).
        configAssignments.push({
          key: w.key,
          value: materializeSchedule(paramOr(w.yearParam, w.defaultYear), paramOr(w.valueParam, w.defaultValue)),
          source: 'policy', origin: p.id, asBaseline: false,
        });
      } else if (w.kind === 'fiscalPreset' || w.kind === 'fedPreset') {
        // R3c (composition purity, P0-1): the selector write is an ordinary assignment —
        // the same mechanism the A13/A14 subsumption writes use. It lands on the
        // EFFECTIVE config at the choke point; deactivation reverts by construction.
        configAssignments.push({
          key: w.kind === 'fiscalPreset' ? 'fiscalPolicyPreset' : 'federalReservePreset',
          value: w.presetId, source: 'policy', origin: p.id, asBaseline: false,
        });
      } else {
        // policyPreset writes an OBJECT slot — carried on the presetWrites channel,
        // applied by the store at the same choke point (effective config only).
        presetWrites.push({ kind: 'policyPreset', presetId: w.presetId, origin: p.id });
      }
    }
  }

  // ── THE CROSS-CHANNEL BACKSTOP (the per-field rebuild): an object-slot package
  // (policyPreset — pkg-full-package, import/persisted paths only) composed alongside
  // ANY per-field policy write under policyConfig.* would silently fight at the choke
  // point (the preset replaces the whole block AFTER assignments apply). The two
  // channels share no slot namespace, so the slot detector cannot see it — surfaced
  // here, never last-write-wins. ──
  for (const pw of presetWrites) {
    const fieldWriters = [...new Set(configAssignments
      .filter((a) => a.source === 'policy' && a.key.startsWith('policyConfig.') && a.origin !== pw.origin)
      .map((a) => a.origin))];
    for (const o of fieldWriters) {
      conflicts.push({ key: 'slot:policyPreset', between: [pw.origin, o] });
    }
  }

  // ── (b) events → per-year entries with explicit recovery ──
  const axisValueOf = (configKey: string): number => {
    const assigned = configAssignments.find((a) => a.key === configKey);
    if (assigned && typeof assigned.value === 'number') return assigned.value;
    const d = DIAL_BY_KEY.get(configKey)?.default;
    return typeof d === 'number' ? d : 0;
  };
  const touched = new Map<string, { origin: string; years: Set<number> }[]>();
  for (const ref of scenario.events) {
    const m = events.find((x) => x.id === ref.id);
    if (!m) throw new Error(`unknown event ${ref.id}`);
    const emit = (key: string, year: number, value: number): void => {
      perYearEntries.push({ key, year, value, source: 'event', origin: m.id });
    };
    // ── THE SEVERITY TRANSFORM (the specified per-leg class table). Medium is EXACTLY 1 and
    // BYPASSES the transform — the authored magnitudes ship verbatim (the identity gate;
    // no float round-trip). Recovery entries are restore targets and never scale. ──
    const k: number = SEVERITY_K_STEPS[ref.severity ?? 'medium'];
    const scaled = (e: (typeof m.entries)[number]): number => {
      if (k === 1.0) return e.value;
      switch (e.scaling) {
        case 'quantity-gap': return Math.max(0, 100 - k * (100 - e.value));
        case 'price-spike': return 100 + k * (e.value - 100);
        case 'multiplier-gap': return 1 + k * (e.value - 1);
        case 'direct': return Math.min(1, k * e.value); // capped at the key's range (the drag caps at 1)
        default:
          // DECLARED, never inferred (the design decision): an unclassed shock leg cannot scale.
          throw new Error(`event ${m.id}: entry ${e.key} has no declared severity scaling class — severity '${ref.severity}' cannot be applied`);
      }
    };
    // ── THE ONE recYear SITE (the specified duration): a user duration moves the sticky
    // window, the bypass close, and the conflict set TOGETHER. On a permanent-recovery
    // event a duration switches it to the finite mode (declared targets required). ──
    if (ref.durationYears !== undefined && m.recovery === 'permanent' && !m.finiteRecovery) {
      throw new Error(`event ${m.id}: a duration was set but the permanent event declares no finiteRecovery targets`);
    }
    const legRecYear = (key: string): number => {
      if (ref.durationYears !== undefined) return ref.anchorYear + ref.durationYears;
      if (m.recovery === 'permanent') return Infinity;
      return ref.anchorYear + (m.recovery.find((r) => r.key === key)?.yearOffset ?? Infinity);
    };
    const yearsByKey = new Map<string, Set<number>>();
    for (const e of m.entries) {
      // ── THE COMPLEMENTARITY-CLASS REFUSAL (author-specified rider; the severity-class
      // pattern): every supply-INPUT row an event writes must carry a declared
      // aggregation class (hard-complement | soft) in SUPPLY_INPUT_CLASS — a new input
      // family added without declaring how it aggregates is refused at compile, never
      // silently averaged. ──
      const configPath = REGISTERED_EVENT_KEY_TO_CONFIG[e.key];
      if (configPath?.startsWith('supplyChainConfig.inputs.')) {
        const inputKey = configPath.slice('supplyChainConfig.inputs.'.length);
        if (!(inputKey in SUPPLY_INPUT_CLASS)) {
          throw new Error(`event ${m.id}: supply input '${inputKey}' has no declared complementarity class — it cannot be composed`);
        }
      }
      // sticky-forward semantics: the entry holds from anchor+offset until recovery
      const start = ref.anchorYear + e.yearOffset;
      emit(e.key, start, scaled(e));
      const recYear = legRecYear(e.key);
      const ys = yearsByKey.get(e.key) ?? new Set<number>();
      for (let y = start; y < Math.min(recYear, start + 60); y++) ys.add(y);
      yearsByKey.set(e.key, ys);
      // THE ORIGIN CHANNEL: a domestic-regulatory quantity leg bypasses the row's
      // resilience — the flag opens at the leg's start and closes at its explicit
      // recovery (permanence ⇒ stays open while the event is composed). Resolution
      // injects event-provenance 0 for the flagged row; the autopilot trajectory
      // resumes by construction when the flag ends.
      const resilienceRow = QUANTITY_ROW_TO_RESILIENCE[e.key];
      if (resilienceRow && (e.origin ?? m.origin) === 'domestic-regulatory') {
        resilienceBypassEntries.push({ key: resilienceRow, year: start, value: 1, origin: m.id });
        if (recYear !== Infinity) {
          resilienceBypassEntries.push({ key: resilienceRow, year: recYear, value: 0, origin: m.id });
        }
      }
    }
    if (m.recovery !== 'permanent') {
      for (const r of m.recovery) {
        // F2 (recovery = RELEASE, specified): a plain-value recovery leg no longer writes
        // its authored constant — it emits the release sentinel, and the layers below
        // resume (a user's baseline edit survives the event ending). The authored
        // value column retires to documentation for these legs; the restore-axis (−1)
        // mechanism keeps its compile-time resolution (the geopolitical drag).
        const value = r.value === -1
          ? axisValueOf(REGISTERED_EVENT_KEY_TO_CONFIG[r.key] ?? r.key)  // RESTORE-AXIS
          : EVENT_RECOVERY_RELEASE;
        // the specified duration: all legs recover together at anchor + duration when set
        emit(r.key, ref.durationYears !== undefined ? ref.anchorYear + ref.durationYears : ref.anchorYear + r.yearOffset, value);
      }
    } else if (ref.durationYears !== undefined) {
      // THE FREEZE FINITE MODE: lift at anchor + duration. F2 supersedes the DS
      // design decision's declared-targets clause — the finiteRecovery declaration remains the
      // finite-mode CONTRACT (validated present above), but the lift is a RELEASE:
      // friction resumes the user/axis/default baseline, the datacenter rows resume
      // theirs, and the bypass close (below) already resumes the autopilot
      // resilience trajectory by construction.
      for (const r of m.finiteRecovery!) {
        emit(r.key, ref.anchorYear + ref.durationYears, EVENT_RECOVERY_RELEASE);
      }
    }
    // two-event overlap conflict (surfaced validation, §3.3)
    for (const [key, ys] of yearsByKey) {
      const others = touched.get(key) ?? [];
      for (const o of others) {
        const overlap = [...ys].filter((y) => o.years.has(y));
        if (overlap.length > 0) conflicts.push({ key, between: [o.origin, m.id], years: overlap });
      }
      others.push({ origin: m.id, years: ys });
      touched.set(key, others);
    }
  }

  // ── THE NOTICE PASS: every data-calibration scalar a higher layer overwrote is
  // recorded (record ≡ what apply order executes: the later write wins). ──
  for (const dc of configAssignments) {
    if (dc.source !== 'data-calibration') continue;
    const winner = configAssignments.find(
      (a) => a.key === dc.key && a.source !== 'data-calibration');
    if (winner && (winner.source === 'axis-variant' || winner.source === 'policy')) {
      notices.push({ key: dc.key, winner: winner.source, loser: 'data-calibration', origin: winner.origin });
    }
  }

  return {
    configAssignments, perYearEntries, conflicts, presetWrites, resilienceBypassEntries,
    notices, dataCalibrationId,
  };
}
