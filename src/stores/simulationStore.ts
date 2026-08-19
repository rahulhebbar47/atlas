/**
 * ATLAS Simulation Store
 *
 * Central state management for the entire application.
 * Holds all model parameters and computed simulation output.
 *
 * On every config mutation, re-runs runSimulation() and stores the result.
 * The simulation is fast (~5-10ms for 26 years x 51 clusters) so no
 * debouncing is needed.
 *
 * Phase 3: Loads real BLS data at module initialization and passes it
 * to the simulation engine for real employment/wage baselines.
 *
 * Uses Zustand v5 with subscribeWithSelector for efficient re-renders.
 */

import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import type {
  SimulationConfig,
  SimulationTimeline,
  CapabilityVectorId,
  CapabilityTrajectoryParams,
  OccupationBaseline,
  BLSMetadata,
  BFCSThresholds,
  DashboardView,
  QuintileViewMode,
  PolicyConfig,
  StateData,
  StateCode,
  PolicySchedule,
} from '@/types';
import { runSimulation, getDefaultSimulationConfig } from '@/models/simulation';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { loadBLSData } from '@/services/dataLoader';
import { transformOEWSToBaselines, createOtherClusterBaseline } from '@/services/dataTransform';
import { deriveStateOccupationDistributions, populateStateDistributions } from '@/data/stateTransform';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
import { DEFAULT_POLICY_CONFIG, POLICY_PRESETS, DEFAULT_AI_COST_PARAMS } from '@/models/constants';
import { parseParameterCSV, buildConfigFromCSV } from '@/utils/csvImport';
import { flatToSchedule } from '@/utils/policyInterpolation';
// R3a (the axes program): the composition surface
import { compileComposition, applyAssignments, normalizePolicyRefs } from '@/models/manifestCompiler';
import { ALL_VARIANT_MANIFESTS } from '@/data/manifests/axes';
import { EVENT_MANIFESTS } from '@/data/manifests/events';
import { POLICY_MANIFESTS } from '@/data/manifests/policies';
// The data-calibration slot (the AEI program): the preset registry + the payload type
// for the side channel into runSimulation.
import { DATA_CALIBRATION_PRESETS } from '@/data/manifests/dataCalibration';
import type { DataCalibrationPayload } from '@/data/anthropic/types';
import { DIAL_BY_KEY, DIAL_TABLE } from '@/data/dialTable';
import type { ScenarioManifest, CompiledComposition } from '@/types/manifests';
// (FISCAL_POLICY_PRESETS / FEDERAL_RESERVE_PRESETS already imported above)
import { validateConfig } from '@/utils/validateConfig';
import type { FiscalDimensionKey, FedDimensionKey } from '@/types/fiscalDimensions';
import {
  dimensionPositionsToProfileFields, presetToDimensionPositions,
  fedDimensionPositionsToProfileFields, fedPresetToDimensionPositions,
} from '@/models/fiscalDimensions';
// DEPRECATED Phase 8 Fix 4: FISCAL_RESPONSE_PRESETS and resolveFiscalProfile replaced by split presets
// import { FISCAL_RESPONSE_PRESETS, resolveFiscalProfile } from '@/models/fiscalResponseProfiles';
import {
  resolveCombinedProfile,
  DEFAULT_FISCAL_POLICY_PRESET,
  DEFAULT_FEDERAL_RESERVE_PRESET,
  FISCAL_POLICY_PRESETS,
  FEDERAL_RESERVE_PRESETS,
} from '@/models/fiscalResponseProfiles';

// ============================================================
// BLS Data Initialization (runs once at module load)
// ============================================================

let blsBaselines: Map<string, OccupationBaseline> | null = null;
let blsMetadataResult: BLSMetadata | null = null;
let blsWarningsResult: string[] = [];
let blsErrorResult: string | null = null;
let stateDataMapResult: Map<StateCode, StateData> | null = null;

const blsResult = loadBLSData();
if (blsResult.isLoaded) {
  const transformed = transformOEWSToBaselines(
    blsResult.oews,
    OCCUPATION_CLUSTERS,
    DEFAULT_ROLE_ESTIMATION_CONFIG,
  );
  blsBaselines = transformed.baselines;
  blsMetadataResult = blsResult.metadata;
  blsWarningsResult = [...blsResult.warnings, ...transformed.warnings];

  // FIX: Create synthetic baseline for "Other / Uncategorized" cluster.
  // OEWS data covers ~74M of ~158M CES total nonfarm employment. The Other cluster
  // fills the gap so macro calculations use the full CES employment as the denominator.
  const otherCluster = OCCUPATION_CLUSTERS.find(c => c.id === 'other_uncategorized');
  if (otherCluster && !blsBaselines.has('other_uncategorized')) {
    const otherBaseline = createOtherClusterBaseline(blsBaselines, otherCluster);
    blsBaselines.set('other_uncategorized', otherBaseline);
    console.log(`[ATLAS] Other/Uncategorized cluster: ${otherBaseline.totalEmployment.toLocaleString()} workers (CES gap fill)`);
  }

  // Phase 6: Load state data if available
  if (blsResult.stateOEWS && blsResult.stateLAUS && blsBaselines) {
    const stateResult = deriveStateOccupationDistributions(
      blsResult.stateOEWS,
      blsResult.stateLAUS,
      blsBaselines,
    );
    stateDataMapResult = stateResult.stateDataMap;
    blsWarningsResult.push(...stateResult.warnings);

    // Populate stateDistribution on national baselines
    populateStateDistributions(blsBaselines, stateDataMapResult);

    console.log(`[ATLAS] State data loaded: ${stateDataMapResult.size} states`);
  }
} else {
  blsErrorResult = blsResult.errorMessage;
  console.error(`[ATLAS] ${blsResult.errorMessage}`);
}

// ============================================================
// Migration: Phase 5e — convert flat policy numbers to PolicySchedule
// ============================================================

/** The 9 policy fields that changed from number to PolicySchedule in Phase 5e. */
const SCHEDULE_FIELDS: Array<{ policyKey: keyof SimulationConfig['policyConfig']; field: string }> = [
  { policyKey: 'minimumWage', field: 'federalMinimum' },
  { policyKey: 'wageSubsidy', field: 'subsidyPercentage' },
  { policyKey: 'workWeekReduction', field: 'standardHours' },
  { policyKey: 'sovereignWealthFund', field: 'annualContribution' },
  { policyKey: 'sovereignWealthFund', field: 'ownershipFraction' },
  { policyKey: 'profitSharing', field: 'mandatorySharePercentage' },
  { policyKey: 'ubi', field: 'monthlyAmount' },
  { policyKey: 'enhancedUI', field: 'replacementRate' },
  { policyKey: 'retraining', field: 'stipendMonthly' },
];

function migratePolicySchedules(config: SimulationConfig): void {
  for (const { policyKey, field } of SCHEDULE_FIELDS) {
    const policy = config.policyConfig[policyKey] as unknown as Record<string, unknown>;
    const val = policy[field];
    // If it's a raw number (old format), convert to PolicySchedule
    if (typeof val === 'number') {
      policy[field] = flatToSchedule(val) as unknown as PolicySchedule;
    }
    // If it's null/undefined, set to empty schedule
    if (val == null || (typeof val === 'object' && !(val as PolicySchedule).keyframes)) {
      policy[field] = { keyframes: [] };
    }
  }
}

// ============================================================
// Helper: run simulation and return fresh timeline
// ============================================================

// Phase 8b: Module-level override state for recompute.
// Updated by store actions that modify overrides. This avoids
// threading parameterOverrides through every existing recompute() call.
let currentParameterOverrides: Record<string, number> = {};

// ═══ R3a (the axes program): THE COMPOSITION — module-level compiled state, applied at
// the ONE recompute choke point. `config` stays the USER's config (composition never
// writes into it — variant switches re-derive; shadows stay honest); the effective
// config is composed here. EMPTY composition ⇒ identity (bit-zero at defaults, R3A-B3).
export interface CompositionState {
  axes: Partial<Record<string, string>>;      // AxisId -> variant name
  /** The composed events — anchor plus the ruled duration/severity knobs (both optional;
   *  absent ⇒ the authored manifest behavior, byte-identical). */
  events: Array<{ id: string; anchorYear: number; durationYears?: number; severity?: 'mild' | 'medium' | 'severe' }>;
  /** The composed policy packages — id plus optional card params (the per-field
   *  rebuild; absent params ⇒ the authored manifest defaults, byte-identical). Load
   *  boundaries normalize the legacy bare-string form via normalizePolicyRefs. */
  policies: Array<{ id: string; params?: Record<string, number> }>;
  /** The data-calibration slot (the AEI program): a preset id from
   *  DATA_CALIBRATION_PRESETS, or null/absent ⇒ none (the authored defaults). */
  dataCalibration?: string | null;
}
let currentCompiled: import('@/types/manifests').CompiledComposition | null = null;
let currentEventLayer: Map<string, number> | undefined;
// THE ORIGIN CHANNEL (the supply-chain shock ruling): the compiler-emitted resilience
// bypass flags (sticky 1/0 on resilience row keys, domestic-regulatory legs only).
let currentScBypassLayer: Map<string, number> | undefined;
// THE DATA-CALIBRATION SIDE CHANNEL (the AEI program): the active preset's
// per-cluster payload, installed by compileAndInstall beside the event layer and
// threaded through recompute into runSimulation. Null ⇒ no preset (the default).
let currentDataCalibration: DataCalibrationPayload | null = null;
let currentImportedKeys: Set<string> | undefined;
// R3c (S2): EXPLICIT TOUCH-TRACKING — the WRITE is the touch. Replaces the
// value≠default shadow proxy (its documented limitation: manually returning a value
// to its default silently lifted the shadow). A config subscriber diffs scalar dial
// keys on every change; reset/load paths manage the set explicitly.
let currentTouched = new Set<string>();
let suppressTouchDiff = false;
// The last effective config the simulation consumed (set at the recompute choke
// point, the same object passed to runSimulation).
let currentEffectiveConfig: SimulationConfig | null = null;

/** The EXACT effective config the last simulation run consumed. The Advanced grid's
 *  read side binds to this (rendered value ≡ executed value); writes still go to the
 *  user's config. Null only before the first recompute (module init runs one). */
export function getLastEffectiveConfig(): SimulationConfig | null {
  return currentEffectiveConfig;
}
/** Run a state write with the touch subscriber suppressed (subscribers fire
 *  synchronously inside the call, so the flag lifts safely in finally). */
function withTouchSuppressed(fn: () => void): void {
  suppressTouchDiff = true;
  try { fn(); } finally { suppressTouchDiff = false; }
}

/** Explicit touch registration for the policy editor's write paths (the per-field
 *  rebuild): unconditional — no value diff consulted (see the togglePolicy comment).
 *  Only live dial keys register (shadowing is defined over dial rows). */
function registerPolicyTouches(keys: readonly string[]): void {
  for (const k of keys) {
    if (DIAL_BY_KEY.has(k)) currentTouched.add(k);
  }
}

/** R3c (S3): compile a composition and INSTALL the module-level compiled state —
 *  shared by setComposition and session rehydration (one path, no drift). Returns the
 *  conflicts; on conflict nothing installs. */
function compileAndInstall(next: CompositionState): CompiledComposition['conflicts'] {
  const scenario: ScenarioManifest = {
    species: 'scenario', id: 'board', title: 'board',
    axes: next.axes, events: next.events, policies: next.policies,
    dataCalibration: next.dataCalibration ?? null, overrides: [],
  };
  const compiled = compileComposition(
    scenario, ALL_VARIANT_MANIFESTS, EVENT_MANIFESTS, POLICY_MANIFESTS, DATA_CALIBRATION_PRESETS);
  if (compiled.conflicts.length > 0) return compiled.conflicts;
  currentCompiled = compiled;
  currentEventLayer = compiled.perYearEntries.length > 0
    ? new Map(compiled.perYearEntries.map((e) => [`${e.key}:${e.year}`, e.value]))
    : undefined;
  currentScBypassLayer = compiled.resilienceBypassEntries.length > 0
    ? new Map(compiled.resilienceBypassEntries.map((e) => [`${e.key}:${e.year}`, e.value]))
    : undefined;
  // The data-calibration side channel: resolve the composed preset's payload from the
  // registry (the compiler already validated the id — unknown ids throw there).
  currentDataCalibration = compiled.dataCalibrationId !== null
    ? DATA_CALIBRATION_PRESETS.find((d) => d.id === compiled.dataCalibrationId)?.clusterPayload ?? null
    : null;
  currentImportedKeys = undefined; // the importer sets this on load (R3a scope: board)
  // R2b: derive the profile tags from WHAT SELECTED each profile
  const fiscalPkg = next.policies.some((e) =>
    POLICY_MANIFESTS.find((p) => p.id === e.id)?.writes.some((w) => w.kind === 'fiscalPreset'));
  const fedPkg = next.policies.some((e) =>
    POLICY_MANIFESTS.find((p) => p.id === e.id)?.writes.some((w) => w.kind === 'fedPreset'));
  currentProfileTags = {
    fiscal: next.axes['A13'] ? 'axis-variant' : fiscalPkg ? 'policy' : 'default',
    fed: next.axes['A14'] ? 'axis-variant' : fedPkg ? 'policy' : 'default',
  };
  return [];
}
// R2b retag: the species of what selected each profile (axis-variant / policy / default)
let currentProfileTags: { fiscal?: 'default' | 'axis-variant' | 'policy'; fed?: 'default' | 'axis-variant' | 'policy' } | undefined;

/** Deep-set a dotted config path immutably (capabilities.generative.ceiling etc.). */
function setDeep(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const [head, ...rest] = path.split('.');
  if (!head) return obj;
  if (rest.length === 0) return { ...obj, [head]: value };
  const child = (obj[head] ?? {}) as Record<string, unknown>;
  return { ...obj, [head]: setDeep(child, rest.join('.'), value) };
}
function getDeep(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
}

/** Scalar dial keys whose value differs between two configs (objects skipped —
 *  containers are owned surfaces, not touch targets). */
function scalarDiffKeys(a: SimulationConfig, b: SimulationConfig): string[] {
  const out: string[] = [];
  const ar = a as unknown as Record<string, unknown>;
  const br = b as unknown as Record<string, unknown>;
  const scalar = (x: unknown) => x === undefined || typeof x === 'number' || typeof x === 'boolean' || typeof x === 'string';
  for (const row of DIAL_TABLE) {
    const va = getDeep(ar, row.key);
    const vb = getDeep(br, row.key);
    if (va === vb) continue;
    if (scalar(va) && scalar(vb)) out.push(row.key);
  }
  return out;
}

/** Apply the compiled composition's config assignments over the user config.
 *  SHADOWING (§3.2, touch-based since R3c/S2): a composed key the user has TOUCHED is
 *  USER-SHADOWED — the user's value wins and badges "shadowing [axis · variant]";
 *  one-tap reset clears the touch and restores the dial default so the variant
 *  resumes. The old value≠default proxy is retired: returning a value to its default
 *  by hand no longer lifts the shadow (the write is the touch). */
function applyCompositionToConfig(config: SimulationConfig): {
  effective: SimulationConfig;
  provenance: Record<string, { source: 'axis-variant' | 'policy' | 'data-calibration'; origin: string; shadowed: boolean }>;
} {
  if (!currentCompiled
    || (currentCompiled.configAssignments.length === 0 && currentCompiled.presetWrites.length === 0)) {
    return { effective: config, provenance: {} };
  }
  const provenance: Record<string, { source: 'axis-variant' | 'policy' | 'data-calibration'; origin: string; shadowed: boolean }> = {};
  const shadowedKeys = new Set<string>();
  for (const a of currentCompiled.configAssignments) {
    const dial = DIAL_BY_KEY.get(a.key);
    const shadowed = dial !== undefined && currentTouched.has(a.key);
    provenance[a.key] = { source: a.source, origin: a.origin, shadowed };
    if (shadowed) shadowedKeys.add(a.key);
  }
  // applyAssignments carries the optional-parent rule (no partial supplyChainConfig)
  let effective = applyAssignments(config, currentCompiled.configAssignments, shadowedKeys);
  // R3c (composition purity, P0-1): object-valued preset writes land on the EFFECTIVE
  // config only. Shadowing for an object slot is whole-slot (per-field shadowing of an
  // object preset is out of scope, stated in the stage report).
  for (const w of currentCompiled.presetWrites) {
    const preset = POLICY_PRESETS.find((p) => p.id === w.presetId);
    if (preset) {
      effective = { ...effective, policyConfig: preset.config };
      provenance['policyConfig'] = { source: 'policy', origin: w.origin, shadowed: false };
    }
  }
  return { effective, provenance };
}

/** R3b: the event-origin lookup for the per-year strip — which EVENT set this key-year
 *  (sticky within the compiled window). Render-time only; the record's 'event' tag is
 *  the truth, this names its origin.
 *  F2 (recovery = RELEASE): a release entry (NaN in the event layer; flag 0 in the
 *  bypass layer) ENDS the coverage — post-recovery years name no event (the audited
 *  forever-badge honesty fix; the resolver applies the same rule to the value). */
export function eventOriginAt(key: string, year: number): string | undefined {
  if (!currentCompiled) return undefined;
  let best: { year: number; origin: string } | undefined;
  const consider = (entryYear: number, origin: string, released: boolean): void => {
    if (entryYear > year) return;
    if (!best || entryYear > best.year) best = released ? { year: entryYear, origin: '' } : { year: entryYear, origin };
  };
  for (const e of currentCompiled.perYearEntries) {
    if (e.key === key) consider(e.year, e.origin, Number.isNaN(e.value));
  }
  // The origin channel's resilience-bypass writes carry event provenance too — the
  // record's 'event' tag on a bypassed resilience row names its event here.
  for (const e of currentCompiled.resilienceBypassEntries) {
    if (e.key === key) consider(e.year, e.origin, e.value === 0);
  }
  return best && best.origin !== '' ? best.origin : undefined;
}

/** F1 (the governed-row chip): the event-coverage windows for a per-year key under the
 *  ACTIVE composition — [{title, origin, from, to?}] with `to` absent while coverage is
 *  open-ended (a permanent event). Empty with no composition (the chip renders nothing
 *  at defaults — display identity). Pure over the compiled state; windows derive from
 *  the same entries the resolver consumes (record ≡ display ≡ execution). */
export function eventWindowsForKey(key: string): Array<{ origin: string; title: string; from: number; to?: number }> {
  if (!currentCompiled) return [];
  const marks: Array<{ year: number; origin: string; released: boolean }> = [];
  for (const e of currentCompiled.perYearEntries) {
    if (e.key === key) marks.push({ year: e.year, origin: e.origin, released: Number.isNaN(e.value) });
  }
  for (const e of currentCompiled.resilienceBypassEntries) {
    if (e.key === key) marks.push({ year: e.year, origin: e.origin, released: e.value === 0 });
  }
  marks.sort((a, b) => a.year - b.year);
  const windows: Array<{ origin: string; title: string; from: number; to?: number }> = [];
  let open: { origin: string; title: string; from: number; to?: number } | undefined;
  for (const mk of marks) {
    if (mk.released) {
      if (open) { open.to = mk.year - 1; windows.push(open); open = undefined; }
    } else if (!open) {
      const title = EVENT_MANIFESTS.find((m) => m.id === mk.origin)?.title ?? mk.origin;
      open = { origin: mk.origin, title, from: mk.year };
    }
  }
  if (open) windows.push(open);
  return windows;
}

/** R3a: badge-fresh provenance — derived PURE from the current config + the applied
 *  composition (never stored, so ordinary slider writes cannot stale it). */
export function computeCompositionProvenance(config: SimulationConfig):
  Record<string, { source: 'axis-variant' | 'policy' | 'data-calibration'; origin: string; shadowed: boolean }> {
  return applyCompositionToConfig(config).provenance;
}

/** R3c (P1-8): the EFFECTIVE config the run consumes (user config + the applied
 *  composition), exposed pure for the diff-from-default view. */
export function computeEffectiveConfig(config: SimulationConfig): SimulationConfig {
  return applyCompositionToConfig(config).effective;
}

// ═══ THE CURRENT-WORLD CHIP (the Scenarios redesign — the document model) ═══
// One producer for the chip's four states, derived from the SAME composition/touch
// machinery the badges use. The battery (world-chip-batteries) asserts chip-state ≡
// composition-state across fresh / edited / loaded / modified.

/** Deterministic JSON with recursively sorted object keys — a config loaded from a file
 *  and the same config built live must produce the SAME signature (plain stringify is
 *  insertion-ordered and would manufacture false "modified" reads). */
export function stableStringify(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(',')}]`;
  const o = v as Record<string, unknown>;
  const keys = Object.keys(o).filter((k) => o[k] !== undefined).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(o[k])}`).join(',')}}`;
}

/** The complete-world signature: everything a saved scenario restores. Captured when a
 *  world is loaded or saved; the chip reads "modified" exactly when the live signature
 *  diverges from the captured one. */
export function computeWorldSignature(
  config: SimulationConfig,
  composition: CompositionState,
  parameterOverrides: Record<string, number>,
): string {
  return stableStringify({ config, composition, parameterOverrides });
}

/** The world-activity producer. `compositionCount` reproduces the sidebar's standing
 *  activity formula EXACTLY (shadows + events + axes + policies — one implementation,
 *  now consumed by both surfaces); `editCount` adds the touch machinery's plain config
 *  edits that shadow nothing; `total` is the chip's N. */
export function computeWorldActivity(
  config: SimulationConfig,
  composition: CompositionState,
  touchedKeys: readonly string[],
): { compositionCount: number; editCount: number; total: number } {
  const provenance = computeCompositionProvenance(config);
  const shadowCount = Object.values(provenance).filter((p) => p.shadowed).length;
  const compositionCount = shadowCount + composition.events.length
    + Object.keys(composition.axes).length + composition.policies.length;
  const editCount = touchedKeys.filter((k) => !provenance[k]?.shadowed).length;
  return { compositionCount, editCount, total: compositionCount + editCount };
}

export interface CurrentWorld {
  /** The saved scenario's id (Save changes overwrites it; a deleted id degrades to Save as new). */
  id: string;
  name: string;
  /** The world signature at load/save time. */
  signature: string;
}

export type WorldChipState =
  | { kind: 'baseline'; changes: 0 }
  | { kind: 'unsaved'; changes: number }
  | { kind: 'loaded'; name: string; id: string; changes: number }
  | { kind: 'modified'; name: string; id: string; changes: number };

/** THE ONE CHIP-STATE PRODUCER: fresh ⇔ no composition activity and no touched keys and
 *  no loaded world; unsaved ⇔ activity with no loaded world; loaded/modified ⇔ the live
 *  signature matches/diverges from the captured one. */
export function deriveWorldChipState(s: {
  config: SimulationConfig;
  composition: CompositionState;
  touchedKeys: readonly string[];
  parameterOverrides: Record<string, number>;
  currentWorld: CurrentWorld | null;
}): WorldChipState {
  // The chip's N: the activity producer's total plus the per-year overrides (part of the
  // world's signature, so part of its change count — the one term the sidebar formula
  // never displayed).
  const activity = computeWorldActivity(s.config, s.composition, s.touchedKeys);
  const changes = activity.total + Object.keys(s.parameterOverrides).length;
  if (s.currentWorld) {
    const live = computeWorldSignature(s.config, s.composition, s.parameterOverrides);
    return live === s.currentWorld.signature
      ? { kind: 'loaded', name: s.currentWorld.name, id: s.currentWorld.id, changes }
      : { kind: 'modified', name: s.currentWorld.name, id: s.currentWorld.id, changes };
  }
  if (changes === 0) {
    return { kind: 'baseline', changes: 0 };
  }
  return { kind: 'unsaved', changes };
}

/** R3c (P2, activity-aware strip): how many parameter keys the composed EVENTS have
 *  written at-or-before the given year (sticky semantics — recovery writes count as
 *  event-written too; the origin chip names them). */
export function countEventTouchedKeysAt(year: number): number {
  if (!currentCompiled) return 0;
  const keys = new Set(currentCompiled.perYearEntries.map((e) => e.key));
  let n = 0;
  for (const k of keys) if (eventOriginAt(k, year) !== undefined) n++;
  // Resilience rows under an ACTIVE bypass flag are event-written rows too (the flag's
  // close entry ends the write — a closed flag no longer counts).
  const bypassKeys = new Set(currentCompiled.resilienceBypassEntries.map((e) => e.key));
  for (const k of bypassKeys) {
    if (keys.has(k)) continue;
    let last: { year: number; value: number } | undefined;
    for (const e of currentCompiled.resilienceBypassEntries) {
      if (e.key === k && e.year <= year && (!last || e.year > last.year)) last = { year: e.year, value: e.value };
    }
    if (last?.value === 1) n++;
  }
  return n;
}

function recompute(config: SimulationConfig, parameterOverrides?: Record<string, number>): SimulationTimeline {
  // Phase 8b: Use explicitly passed overrides, or fall back to module-level state
  const overridesObj = parameterOverrides ?? currentParameterOverrides;
  let overrideMap: Map<string, number> | undefined;
  if (Object.keys(overridesObj).length > 0) {
    overrideMap = new Map(Object.entries(overridesObj));
  }
  const { effective } = applyCompositionToConfig(config);
  // THE ONE-PRODUCER CAPTURE (the sidebar→Advanced binding fix): the EXACT object
  // handed to the simulation is captured here so the UI's read side renders the value
  // the run actually uses — no second composition application in the UI layer.
  currentEffectiveConfig = effective;
  return runSimulation(
    effective,
    OCCUPATION_CLUSTERS,
    blsBaselines ?? undefined,
    stateDataMapResult ?? undefined,
    overrideMap,
    currentEventLayer || currentScBypassLayer || currentImportedKeys || currentProfileTags
      || currentDataCalibration
      ? {
          eventLayer: currentEventLayer,
          scResilienceBypassLayer: currentScBypassLayer,
          importedKeys: currentImportedKeys,
          profileTags: currentProfileTags,
          dataCalibration: currentDataCalibration ?? undefined,
        }
      : undefined,
  );
}

/**
 * Access the module-level BLS baselines.
 * Needed by compare mode hooks (Phase 5 Step 7) which run
 * runSimulation() independently with different policy configs.
 */
export function getBLSBaselines(): Map<string, OccupationBaseline> | undefined {
  return blsBaselines ?? undefined;
}

// ============================================================
// Store Interface
// ============================================================

export interface SimulationState {
  // === Configuration (user-adjustable) ===
  config: SimulationConfig;

  // === Timeline navigation ===
  currentYear: number;
  isPlaying: boolean;

  // === Panel visibility ===
  controlsPanelOpen: boolean;
  insightsPanelOpen: boolean;

  // === Dashboard navigation (Phase 4) ===
  activeView: DashboardView;
  selectedClusterId: string | null;

  // === The quintile chart view (the quintile view redesign) ===
  // ONE store key drives the shared segmented control on EVERY quintile-rendering
  // chart (the charts stay in sync — one control, one behavior). Deliberately NOT
  // in partialize: every session opens on the ruled two-line default.
  quintileView: QuintileViewMode;
  setQuintileView: (view: QuintileViewMode) => void;

  // === Computed simulation output ===
  timeline: SimulationTimeline;

  // === BLS Data State (Phase 3) ===
  blsDataLoaded: boolean;
  blsDataError: string | null;
  blsMetadata: BLSMetadata | null;
  blsWarnings: string[];

  // === State Data State (Phase 6) ===
  stateDataLoaded: boolean;
  selectedStateCode: StateCode | null;
  comparisonStateCodes: StateCode[];
  stateMapMetric: 'displacement' | 'unemploymentRate' | 'policyEffectiveness';

  // === Actions: State (Phase 6) ===
  setSelectedState: (code: StateCode | null) => void;
  setStateMapMetric: (metric: 'displacement' | 'unemploymentRate' | 'policyEffectiveness') => void;
  addComparisonState: (code: StateCode) => void;
  removeComparisonState: (code: StateCode) => void;
  clearComparisonStates: () => void;
  setStatePolicyOverride: (
    stateCode: StateCode,
    field: keyof import('@/types').StatePolicyOverride,
    value: number | string,
  ) => void;
  resetStatePolicyOverride: (stateCode: StateCode) => void;

  // === Actions: Capability parameters ===
  setCapabilityParam: (
    vectorId: CapabilityVectorId,
    param: keyof CapabilityTrajectoryParams,
    value: number,
  ) => void;

  // === Actions: Timeline ===
  setStartYear: (year: number) => void;
  setEndYear: (year: number) => void;
  setCurrentYear: (year: number) => void;
  togglePlay: () => void;
  stopPlay: () => void;

  // === Actions: Panel visibility ===
  setControlsPanelOpen: (open: boolean) => void;
  setInsightsPanelOpen: (open: boolean) => void;

  // === Actions: Dashboard navigation (Phase 4) ===
  setActiveView: (view: DashboardView) => void;

  // R3c (P1-7): the consumed-once navigation intent — a deep link into the Advanced
  // view (an axis group, an editor anchor, or the per-year strip). Setting it also
  // switches the view; the target surface consumes and clears it.
  advancedFocus:
    | { kind: 'axis'; axis: string }
    | { kind: 'anchor'; anchor: string }
    | { kind: 'per-year' }
    | null;
  setAdvancedFocus: (focus: NonNullable<SimulationState['advancedFocus']>) => void;
  clearAdvancedFocus: () => void;
  setSelectedCluster: (id: string | null) => void;

  // === Actions: BFCS Threshold Overrides (Phase 4) ===
  setBFCSThreshold: (
    clusterId: string,
    roleId: string,
    dimension: keyof BFCSThresholds,
    value: number,
  ) => void;
  resetClusterBFCS: (clusterId: string) => void;
  resetRoleBFCS: (clusterId: string, roleId: string) => void;

  // === Actions: Policy (Phase 5) ===
  setPolicyPreset: (presetId: string) => void;
  togglePolicy: (policyKey: keyof PolicyConfig, enabled: boolean) => void;
  updatePolicyParam: <K extends keyof PolicyConfig>(
    policyKey: K,
    update: Partial<PolicyConfig[K]>,
  ) => void;
  /** The sidebar card's param write (the per-field rebuild, bidirectional sync):
   *  updates the composed package's param and reclaims its keys from any Advanced
   *  shadow. undefined deletes the param (revert to the authored default). */
  setPolicyParam: (pkgId: string, paramId: string, value: number | undefined) => void;
  resetPolicyToDefaults: () => void;

  // === Compare Mode (Phase 5) ===
  compareMode: boolean;
  comparisonPolicyConfigs: Array<{ label: string; config: PolicyConfig }>;
  toggleCompareMode: () => void;
  setComparisonSlot: (index: number, label: string, config: PolicyConfig) => void;
  addComparisonSlot: (label: string, config: PolicyConfig) => void;
  removeComparisonSlot: (index: number) => void;

  // === Presentation Mode (Phase 7) ===
  presentationMode: boolean;
  presentationStep: number;

  // === Actions: Presentation Mode (Phase 7) ===
  togglePresentationMode: () => void;
  setPresentationStep: (step: number) => void;
  nextPresentationStep: () => void;
  prevPresentationStep: () => void;

  // === Onboarding (Phase 7) ===
  onboardingComplete: boolean;
  onboardingStep: number;
  setOnboardingComplete: (complete: boolean) => void;
  setOnboardingStep: (step: number) => void;

  // === Fiscal Onboarding (Phase 8d) ===
  fiscalOnboardingComplete: boolean;
  fiscalOnboardingStep: number;
  setFiscalOnboardingComplete: (complete: boolean) => void;
  setFiscalOnboardingStep: (step: number) => void;

  // === Actions: Scenario Save/Load (Phase 7) ===
  /** Full-replacement scenario load. savedTouchedKeys (the per-field rebuild): the
   *  save's recorded shadow-winning keys — unioned over the scalar-diff
   *  reconstruction, which cannot see schedule-key shadows. */
  loadScenario: (config: SimulationConfig, savedTouchedKeys?: readonly string[]) => void;

  // === The current-world chip (the Scenarios redesign) ===
  /** The loaded saved world, or null (fresh/unsaved). Signature captured at load/save. */
  currentWorld: CurrentWorld | null;
  /** Mark the CURRENT state as the named saved world (called AFTER a load completes,
   *  including its data-calibration slot application, so the captured signature matches
   *  the fully-applied state) — or null to mark it unsaved. */
  markWorldLoaded: (world: { id: string; name: string } | null) => void;
  /** The "Test My Own" reset (owner ruling, the bug pass): everything returns to the
   *  default world EXCEPT the data-calibration selection — the data-trust answer is a
   *  separate question and survives the belief reset. */
  resetWorldPreservingData: () => void;

  // === Actions: CSV Import ===
  importCSVConfig: (csvString: string) => { importedCount: number; warnings: string[] };

  // === Actions: Generic config update ===
  updateConfig: (updater: (config: SimulationConfig) => SimulationConfig) => void;

  // === Phase 8b: Per-Year Parameter Overrides ===
  parameterOverrides: Record<string, number>;
  setParameterOverride: (paramKey: string, year: number, value: number) => void;
  removeParameterOverride: (paramKey: string, year: number) => void;
  clearParameterOverrides: () => void;

  // === Phase 8c: Fiscal Response UI ===
  showBaselineComparison: boolean;
  baselineTimeline: SimulationTimeline | null;
  // DEPRECATED Phase 8 Fix 4: setFiscalResponsePreset replaced by split preset actions
  // setFiscalResponsePreset: (presetId: string) => void;
  setFiscalPolicyPreset: (presetId: string) => void;
  setFederalReservePreset: (presetId: string) => void;
  setFiscalDimension: (dimension: FiscalDimensionKey, position: number) => void;
  setFedDimension: (dimension: FedDimensionKey, position: number) => void;
  toggleBaselineComparison: () => void;
  resetYearOverrides: (year: number) => void;

  // === Phase 8d: Profile Comparison ===
  fiscalComparisonProfile: string | null;
  setFiscalComparisonProfile: (profileName: string | null) => void;

  // === Phase 10.A: Alpha Drivers + Augmentation + Scarcity + Inference Curve ===
  setAlphaDriverParams: (params: SimulationConfig['alphaDriverParams']) => void;
  setAugmentationAdoptionSteepness: (value: number) => void;
  setTokenCostCurve: (curve: NonNullable<SimulationConfig['aiCostParams']>['tokenCostCurve']) => void;
  /** Mini-stage 1 (frontier-intensity cost layer): partial merge into config.aiCostParams —
   *  the scalar-field sibling of setTokenCostCurve, used by the four frontier dials. */
  setAiCostParams: (partial: Partial<NonNullable<SimulationConfig['aiCostParams']>>) => void;
  setScarcityIntensity: (value: number) => void;
  setCompetitivePressureThreshold: (value: number) => void;
  setReplacementMultiplier: (value: number) => void;
  // DEPRECATED (Phase 10.A fix #2): setMaxAdoptionFrictionYears removed; friction is now direct years per role.
  setClusterAlpha: (clusterId: string, value: number) => void;
  setRoleAlphaOverride: (clusterId: string, roleId: string, value: number) => void;
  setRoleReplacementFrictionYears: (clusterId: string, roleId: string, value: number) => void;
  setRoleReplacementDifficultyWagePremium: (clusterId: string, roleId: string, value: number) => void;

  // === Actions: Reset ===
  resetToDefaults: () => void;

  // === R3a: the composition (the axis board's state) ===
  composition: CompositionState;
  compositionConflicts: CompiledComposition['conflicts'];
  setComposition: (next: CompositionState) => void;
  resetShadow: (key: string) => void;
  clearComposition: () => void;

  // === R3c (S2): explicit touch-tracking — the keys the user has WRITTEN.
  // Shadowing = composed ∧ touched; persisted so shadows survive a refresh. ===
  touchedKeys: string[];
}

// ============================================================
// Store Creation
// ============================================================

const defaultConfig = getDefaultSimulationConfig();
const initialTimeline = recompute(defaultConfig);

export const useSimulationStore = create<SimulationState>()(
  persist(
  subscribeWithSelector((set) => ({
    // Initial state
    config: defaultConfig,
    currentYear: defaultConfig.startYear,
    isPlaying: false,
    controlsPanelOpen: true,
    insightsPanelOpen: true,
    activeView: 'overview' as DashboardView,
    selectedClusterId: null,
    quintileView: 'top-vs-rest' as QuintileViewMode, // ≡ DEFAULT_QUINTILE_VIEW (battery-asserted agreement)
    timeline: initialTimeline,

    // BLS data state (Phase 3)
    blsDataLoaded: blsBaselines !== null,
    blsDataError: blsErrorResult,
    blsMetadata: blsMetadataResult,
    blsWarnings: blsWarningsResult,

    // Phase 8b: Per-year parameter overrides
    parameterOverrides: {},

    // R3a: the composition (empty ⇒ identity; bit-zero at defaults)
    composition: { axes: {}, events: [], policies: [] } as CompositionState,
    compositionConflicts: [] as CompiledComposition['conflicts'],
    // R3c (S2): the touched set (mirrored module-level for the compose choke point)
    touchedKeys: [] as string[],
    // The current-world chip (the Scenarios redesign): fresh session = no loaded world.
    currentWorld: null as CurrentWorld | null,

    // State data state (Phase 6)
    stateDataLoaded: stateDataMapResult !== null && stateDataMapResult.size > 0,
    selectedStateCode: null,
    comparisonStateCodes: [],
    stateMapMetric: 'displacement' as const,

    // State actions (Phase 6)
    setSelectedState: (code) => set(() => ({ selectedStateCode: code })),

    setStateMapMetric: (metric) => set(() => ({ stateMapMetric: metric })),

    addComparisonState: (code) =>
      set((state) => {
        if (state.comparisonStateCodes.includes(code)) return state;
        if (state.comparisonStateCodes.length >= 3) return state;
        return { comparisonStateCodes: [...state.comparisonStateCodes, code] };
      }),

    removeComparisonState: (code) =>
      set((state) => ({
        comparisonStateCodes: state.comparisonStateCodes.filter((c) => c !== code),
      })),

    clearComparisonStates: () => set(() => ({ comparisonStateCodes: [] })),

    setStatePolicyOverride: (stateCode, field, value) =>
      set((state) => {
        const currentOverrides = state.config.stateOverrides ?? {};
        const currentStateOverride = currentOverrides[stateCode] ?? {};
        const newConfig: SimulationConfig = {
          ...state.config,
          stateOverrides: {
            ...currentOverrides,
            [stateCode]: {
              ...currentStateOverride,
              [field]: value,
            },
          },
        };
        return {
          config: newConfig,
          timeline: recompute(newConfig),
        };
      }),

    resetStatePolicyOverride: (stateCode) =>
      set((state) => {
        const { [stateCode]: _removed, ...rest } = state.config.stateOverrides ?? {};
        const newConfig: SimulationConfig = {
          ...state.config,
          stateOverrides: rest,
        };
        return {
          config: newConfig,
          timeline: recompute(newConfig),
        };
      }),

    // Capability parameter setter — updates one param of one vector
    setCapabilityParam: (vectorId, param, value) =>
      set((state) => {
        const newConfig: SimulationConfig = {
          ...state.config,
          capabilities: {
            ...state.config.capabilities,
            [vectorId]: {
              ...state.config.capabilities[vectorId],
              [param]: value,
            },
          },
        };
        return {
          config: newConfig,
          timeline: recompute(newConfig),
        };
      }),

    // Timeline year setters
    setStartYear: (year) =>
      set((state) => {
        const newConfig = { ...state.config, startYear: year };
        const newCurrentYear = Math.max(state.currentYear, year);
        return {
          config: newConfig,
          currentYear: newCurrentYear,
          timeline: recompute(newConfig),
        };
      }),

    setEndYear: (year) =>
      set((state) => {
        const newConfig = { ...state.config, endYear: year };
        const newCurrentYear = Math.min(state.currentYear, year);
        return {
          config: newConfig,
          currentYear: newCurrentYear,
          timeline: recompute(newConfig),
        };
      }),

    setCurrentYear: (year) =>
      set((state) => ({
        currentYear: Math.max(
          state.config.startYear,
          Math.min(year, state.config.endYear),
        ),
      })),

    togglePlay: () =>
      set((state) => ({ isPlaying: !state.isPlaying })),

    stopPlay: () =>
      set(() => ({ isPlaying: false })),

    // Panel visibility
    setControlsPanelOpen: (open) => set(() => ({ controlsPanelOpen: open })),
    setInsightsPanelOpen: (open) => set(() => ({ insightsPanelOpen: open })),

    // Dashboard navigation (Phase 4)
    setActiveView: (view) => set(() => ({ activeView: view })),

    // The quintile chart view (the quintile view redesign): a pure value set — no
    // side effects, so the view round-trip is exact (battery-asserted).
    setQuintileView: (view) => set(() => ({ quintileView: view })),

    // R3c (P1-7): deep-link intents
    advancedFocus: null,
    setAdvancedFocus: (focus) => set(() => ({ advancedFocus: focus, activeView: 'advanced' as DashboardView })),
    clearAdvancedFocus: () => set(() => ({ advancedFocus: null })),
    setSelectedCluster: (id) => set(() => ({ selectedClusterId: id })),

    // BFCS Threshold Overrides (Phase 4)
    setBFCSThreshold: (clusterId, roleId, dimension, value) =>
      set((state) => {
        // Find default thresholds for this role
        const cluster = OCCUPATION_CLUSTERS.find((c) => c.id === clusterId);
        const role = cluster?.roles.find((r) => r.id === roleId);
        if (!role) return state;

        // Start from current override or defaults
        const currentOverrides = state.config.bfcsOverrides[clusterId]?.[roleId]
          ?? role.bfcsThresholds;

        const newConfig: SimulationConfig = {
          ...state.config,
          bfcsOverrides: {
            ...state.config.bfcsOverrides,
            [clusterId]: {
              ...state.config.bfcsOverrides[clusterId],
              [roleId]: {
                ...currentOverrides,
                [dimension]: value,
              },
            },
          },
        };
        return {
          config: newConfig,
          timeline: recompute(newConfig),
        };
      }),

    resetClusterBFCS: (clusterId) =>
      set((state) => {
        const { [clusterId]: _removed, ...rest } = state.config.bfcsOverrides;
        const newConfig: SimulationConfig = {
          ...state.config,
          bfcsOverrides: rest,
        };
        return {
          config: newConfig,
          timeline: recompute(newConfig),
        };
      }),

    resetRoleBFCS: (clusterId, roleId) =>
      set((state) => {
        const clusterOverrides = state.config.bfcsOverrides[clusterId];
        if (!clusterOverrides) return state;

        const { [roleId]: _removed, ...restRoles } = clusterOverrides;
        const newBfcsOverrides = { ...state.config.bfcsOverrides };

        if (Object.keys(restRoles).length > 0) {
          newBfcsOverrides[clusterId] = restRoles;
        } else {
          delete newBfcsOverrides[clusterId];
        }

        const newConfig: SimulationConfig = {
          ...state.config,
          bfcsOverrides: newBfcsOverrides,
        };
        return {
          config: newConfig,
          timeline: recompute(newConfig),
        };
      }),

    // Policy actions (Phase 5)
    setPolicyPreset: (presetId) =>
      set((state) => {
        const preset = POLICY_PRESETS.find((p) => p.id === presetId);
        if (!preset) return state;

        const newConfig: SimulationConfig = {
          ...state.config,
          policyConfig: preset.config,
        };
        return {
          config: newConfig,
          timeline: recompute(newConfig),
        };
      }),

    togglePolicy: (policyKey, enabled) =>
      set((state) => {
        const currentPolicy = state.config.policyConfig[policyKey];
        if (typeof currentPolicy !== 'object' || !('enabled' in currentPolicy)) return state;

        // THE WRITE IS THE TOUCH — UNCONDITIONAL (the per-field rebuild): the scalar
        // diff subscriber misses (a) writes equal to the raw value while a package
        // supplies the effective one (toggling OFF a package-enabled policy writes
        // false onto an already-false raw config — no diff, no touch, the package
        // would keep winning and this toggle would look broken) and (b) object-valued
        // schedule keys. Registered BEFORE the in-reducer recompute so the shadow is
        // seen by the run this write triggers.
        registerPolicyTouches([`policyConfig.${String(policyKey)}.enabled`]);
        const newConfig: SimulationConfig = {
          ...state.config,
          policyConfig: {
            ...state.config.policyConfig,
            [policyKey]: {
              ...currentPolicy,
              enabled,
            },
          },
        };
        return {
          config: newConfig,
          touchedKeys: [...currentTouched],
          timeline: recompute(newConfig),
        };
      }),

    updatePolicyParam: (policyKey, update) =>
      set((state) => {
        const currentPolicy = state.config.policyConfig[policyKey];
        // The write is the touch — unconditional, per written field (see togglePolicy).
        registerPolicyTouches(
          Object.keys(update as object).map((f) => `policyConfig.${String(policyKey)}.${f}`));
        const newConfig: SimulationConfig = {
          ...state.config,
          policyConfig: {
            ...state.config.policyConfig,
            [policyKey]: {
              ...currentPolicy,
              ...update,
            },
          },
        };
        return {
          config: newConfig,
          touchedKeys: [...currentTouched],
          timeline: recompute(newConfig),
        };
      }),

    // THE CARD-PARAM ACTION (the bidirectional-sync addendum, owner 2026-08-08): a
    // sidebar card write updates the composition entry's params AND RECLAIMS the keys
    // that param materializes from any Advanced shadow — last writer wins, whichever
    // surface. value === undefined deletes the param (revert to the authored default,
    // the setDuration delete-key pattern).
    setPolicyParam: (pkgId, paramId, value) =>
      set((state) => {
        const manifest = POLICY_MANIFESTS.find((p) => p.id === pkgId);
        if (!manifest || !(manifest.params ?? []).some((s) => s.id === paramId)) return state;
        for (const w of manifest.writes) {
          const bound = (w.kind === 'configField' && w.param === paramId)
            || (w.kind === 'scheduleField' && (w.valueParam === paramId || w.yearParam === paramId));
          if (bound) currentTouched.delete((w as { key: string }).key);
        }
        const policies = state.composition.policies.map((e) => {
          if (e.id !== pkgId) return e;
          const params = { ...e.params };
          if (value === undefined) delete params[paramId]; else params[paramId] = value;
          return Object.keys(params).length > 0 ? { id: e.id, params } : { id: e.id };
        });
        const next = { ...state.composition, policies };
        const conflicts = compileAndInstall(next);
        if (conflicts.length > 0) return { composition: next, compositionConflicts: conflicts };
        return {
          composition: next,
          compositionConflicts: [],
          touchedKeys: [...currentTouched],
          timeline: recompute(state.config),
        };
      }),

    resetPolicyToDefaults: () =>
      set((state) => {
        const newConfig: SimulationConfig = {
          ...state.config,
          policyConfig: DEFAULT_POLICY_CONFIG,
        };
        return {
          config: newConfig,
          timeline: recompute(newConfig),
        };
      }),

    // Compare mode (Phase 5)
    compareMode: false,
    comparisonPolicyConfigs: [],

    toggleCompareMode: () =>
      set((state) => ({ compareMode: !state.compareMode })),

    setComparisonSlot: (index, label, config) =>
      set((state) => {
        const updated = [...state.comparisonPolicyConfigs];
        updated[index] = { label, config };
        return { comparisonPolicyConfigs: updated };
      }),

    addComparisonSlot: (label, config) =>
      set((state) => ({
        comparisonPolicyConfigs: [...state.comparisonPolicyConfigs, { label, config }],
      })),

    removeComparisonSlot: (index) =>
      set((state) => ({
        comparisonPolicyConfigs: state.comparisonPolicyConfigs.filter((_, i) => i !== index),
      })),

    // Presentation mode (Phase 7)
    presentationMode: false,
    presentationStep: 0,

    togglePresentationMode: () =>
      set((state) => ({
        presentationMode: !state.presentationMode,
        presentationStep: 0,
      })),

    setPresentationStep: (step) =>
      set(() => ({ presentationStep: step })),

    nextPresentationStep: () =>
      set((state) => ({ presentationStep: state.presentationStep + 1 })),

    prevPresentationStep: () =>
      set((state) => ({ presentationStep: Math.max(0, state.presentationStep - 1) })),

    // Onboarding (Phase 7)
    onboardingComplete: (() => {
      try {
        return localStorage.getItem('atlas_onboarding_complete') === 'true';
      } catch {
        return false;
      }
    })(),
    onboardingStep: 0,

    setOnboardingComplete: (complete) => {
      try {
        localStorage.setItem('atlas_onboarding_complete', String(complete));
      } catch {
        // localStorage unavailable
      }
      set(() => ({ onboardingComplete: complete }));
    },

    setOnboardingStep: (step) =>
      set(() => ({ onboardingStep: step })),

    // Fiscal Onboarding (Phase 8d)
    fiscalOnboardingComplete: (() => {
      try {
        return localStorage.getItem('atlas_fiscal_onboarding_complete') === 'true';
      } catch {
        return false;
      }
    })(),
    fiscalOnboardingStep: 0,

    setFiscalOnboardingComplete: (complete) => {
      try {
        localStorage.setItem('atlas_fiscal_onboarding_complete', String(complete));
      } catch {
        // localStorage unavailable
      }
      set(() => ({ fiscalOnboardingComplete: complete }));
    },

    setFiscalOnboardingStep: (step) =>
      set(() => ({ fiscalOnboardingStep: step })),

    // Scenario load — replaces entire config and recomputes (Phase 7)
    // Phase 8b: Also loads overrides from config if present
    loadScenario: (config, savedTouchedKeys) => {
      const { config: validated } = validateConfig(config);
      const overrides = validated.parameterOverrides ?? {};
      currentParameterOverrides = overrides;
      // R3c (S2): a loaded scenario's divergences from the defaults ARE its recorded
      // intents — initialize the touched set from that divergence (suppressed diff)
      // so its values shadow compositions exactly as live edits would.
      // The per-field rebuild: union the save's RECORDED touches on top — the scalar
      // diff cannot see schedule-key shadows (objects skipped), and without them a
      // composed package would silently re-win over the user's saved Advanced edit.
      currentTouched = new Set([
        ...scalarDiffKeys(getDefaultSimulationConfig(), validated),
        ...(savedTouchedKeys ?? []).filter((k) => DIAL_BY_KEY.has(k)),
      ]);
      withTouchSuppressed(() => set(() => ({
        config: validated,
        currentYear: validated.startYear,
        parameterOverrides: overrides,
        touchedKeys: [...currentTouched],
        // The chip: a bare config load is UNSAVED until the caller marks the world
        // (markWorldLoaded, after the calibration slot applies) — URL/CSV loads stay null.
        currentWorld: null,
        timeline: recompute(validated, overrides),
      })));
    },

    resetWorldPreservingData: () => {
      const keep = useSimulationStore.getState().composition.dataCalibration ?? null;
      useSimulationStore.getState().resetToDefaults();
      useSimulationStore.getState().setComposition(
        keep ? { axes: {}, events: [], policies: [], dataCalibration: keep }
             : { axes: {}, events: [], policies: [] },
      );
    },

    markWorldLoaded: (world) => {
      if (world === null) { set(() => ({ currentWorld: null })); return; }
      // signature from the state as it stands NOW (the creator exposes set only; the
      // store hook's getState is the standing pattern for read-in-action here)
      const s = useSimulationStore.getState();
      set(() => ({
        currentWorld: {
          id: world.id,
          name: world.name,
          signature: computeWorldSignature(s.config, s.composition, s.parameterOverrides),
        },
      }));
    },

    // CSV Import — parses CSV parameter file and applies as new config
    // Phase 8b: Also imports parameter overrides from config
    importCSVConfig: (csvString: string) => {
      const { params, warnings: parseWarnings } = parseParameterCSV(csvString);
      const { config, warnings: buildWarnings } = buildConfigFromCSV(params);
      const allWarnings = [...parseWarnings, ...buildWarnings];

      const overrides = config.parameterOverrides ?? {};
      currentParameterOverrides = overrides;

      // R3c (S2): imported values initialize touch from divergence (same rule as load)
      currentTouched = new Set(scalarDiffKeys(getDefaultSimulationConfig(), config));
      withTouchSuppressed(() => set({
        config,
        parameterOverrides: overrides,
        touchedKeys: [...currentTouched],
        currentWorld: null, // the chip: an imported parameter file is an unsaved world
        timeline: recompute(config, overrides),
        currentYear: config.startYear,
      }));

      return { importedCount: params.size, warnings: allWarnings };
    },

    // Generic config updater for advanced parameters
    updateConfig: (updater) =>
      set((state) => {
        const newConfig = updater(state.config);
        return {
          config: newConfig,
          timeline: recompute(newConfig, state.parameterOverrides),
          baselineTimeline: state.showBaselineComparison
            ? recompute(newConfig)
            : null,
        };
      }),

    // Phase 8b: Per-Year Parameter Override Actions
    setParameterOverride: (paramKey, year, value) =>
      set((state) => {
        const newOverrides = { ...state.parameterOverrides, [`${paramKey}:${year}`]: value };
        currentParameterOverrides = newOverrides;
        return {
          parameterOverrides: newOverrides,
          timeline: recompute(state.config, newOverrides),
          // Baseline unaffected by override changes — it's the no-override run
        };
      }),

    removeParameterOverride: (paramKey, year) =>
      set((state) => {
        const newOverrides = { ...state.parameterOverrides };
        delete newOverrides[`${paramKey}:${year}`];
        currentParameterOverrides = newOverrides;
        return {
          parameterOverrides: newOverrides,
          timeline: recompute(state.config, newOverrides),
        };
      }),

    clearParameterOverrides: () =>
      set((state) => {
        currentParameterOverrides = {};
        const newTimeline = recompute(state.config);
        return {
          parameterOverrides: {},
          timeline: newTimeline,
          // When clearing overrides, baseline and main timeline become identical
          baselineTimeline: state.showBaselineComparison ? newTimeline : null,
        };
      }),

    // Phase 8c: Fiscal Response UI
    showBaselineComparison: false,
    baselineTimeline: null,

    // DEPRECATED Phase 8 Fix 4: setFiscalResponsePreset replaced by split preset actions below
    // setFiscalResponsePreset: (presetId) =>
    //   set((state) => {
    //     const newConfig = { ...state.config, fiscalResponseProfile: presetId, fiscalResponseCustom: undefined };
    //     return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
    //   }),

    setFiscalPolicyPreset: (presetId) =>
      set((state) => {
        const newConfig: SimulationConfig = {
          ...state.config,
          fiscalPolicyPreset: presetId,
          fiscalPolicyCustom: undefined,
        };
        const newTimeline = recompute(newConfig, state.parameterOverrides);
        return {
          config: newConfig,
          timeline: newTimeline,
          baselineTimeline: state.showBaselineComparison
            ? recompute(newConfig)
            : null,
        };
      }),

    setFederalReservePreset: (presetId) =>
      set((state) => {
        const newConfig: SimulationConfig = {
          ...state.config,
          federalReservePreset: presetId,
          federalReserveCustom: undefined,
        };
        const newTimeline = recompute(newConfig, state.parameterOverrides);
        return {
          config: newConfig,
          timeline: newTimeline,
          baselineTimeline: state.showBaselineComparison
            ? recompute(newConfig)
            : null,
        };
      }),

    setFiscalDimension: (dimension, position) =>
      set((state) => {
        // Phase 8 Fix 4: Read current fiscal dimension positions from the resolved profile,
        // then override just the changed dimension
        const currentProfile = resolveCombinedProfile(
          state.config.fiscalPolicyPreset ?? DEFAULT_FISCAL_POLICY_PRESET,
          state.config.federalReservePreset ?? DEFAULT_FEDERAL_RESERVE_PRESET,
          state.config.fiscalPolicyCustom,
          state.config.federalReserveCustom,
        );
        const currentPositions = presetToDimensionPositions(currentProfile);
        const newPositions = { ...currentPositions, [dimension]: position };
        const profileFields = dimensionPositionsToProfileFields(newPositions);

        const newConfig: SimulationConfig = {
          ...state.config,
          fiscalPolicyPreset: 'custom',
          fiscalPolicyCustom: profileFields,
        };
        const newTimeline = recompute(newConfig, state.parameterOverrides);
        return {
          config: newConfig,
          timeline: newTimeline,
          baselineTimeline: state.showBaselineComparison
            ? recompute(newConfig)
            : null,
        };
      }),

    setFedDimension: (dimension, position) =>
      set((state) => {
        // Phase 8 Fix 4: Read current Fed dimension positions from the resolved profile,
        // then override just the changed dimension
        const currentProfile = resolveCombinedProfile(
          state.config.fiscalPolicyPreset ?? DEFAULT_FISCAL_POLICY_PRESET,
          state.config.federalReservePreset ?? DEFAULT_FEDERAL_RESERVE_PRESET,
          state.config.fiscalPolicyCustom,
          state.config.federalReserveCustom,
        );
        const currentPositions = fedPresetToDimensionPositions(currentProfile);
        const newPositions = { ...currentPositions, [dimension]: position };
        const profileFields = fedDimensionPositionsToProfileFields(newPositions);

        const newConfig: SimulationConfig = {
          ...state.config,
          federalReservePreset: 'custom',
          federalReserveCustom: profileFields,
        };
        const newTimeline = recompute(newConfig, state.parameterOverrides);
        return {
          config: newConfig,
          timeline: newTimeline,
          baselineTimeline: state.showBaselineComparison
            ? recompute(newConfig)
            : null,
        };
      }),

    toggleBaselineComparison: () =>
      set((state) => {
        if (state.showBaselineComparison) {
          // Turning OFF
          return { showBaselineComparison: false, baselineTimeline: null };
        }
        // Turning ON: run simulation without overrides
        return {
          showBaselineComparison: true,
          baselineTimeline: recompute(state.config),
        };
      }),

    resetYearOverrides: (year) =>
      set((state) => {
        const suffix = `:${year}`;
        const newOverrides: Record<string, number> = {};
        for (const [key, value] of Object.entries(state.parameterOverrides)) {
          if (!key.endsWith(suffix)) {
            newOverrides[key] = value;
          }
        }
        currentParameterOverrides = newOverrides;
        return {
          parameterOverrides: newOverrides,
          timeline: recompute(state.config, newOverrides),
          baselineTimeline: state.showBaselineComparison
            ? state.baselineTimeline // baseline unaffected by override changes
            : null,
        };
      }),

    // Phase 8d: Profile Comparison
    fiscalComparisonProfile: null,
    setFiscalComparisonProfile: (profileName) =>
      set(() => ({ fiscalComparisonProfile: profileName })),

    // Phase 10.A: alpha drivers, augmentation, scarcity, inference curve, friction
    setAlphaDriverParams: (params) =>
      set((state) => {
        const newConfig = { ...state.config, alphaDriverParams: params };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    setAugmentationAdoptionSteepness: (value) =>
      set((state) => {
        const newConfig = { ...state.config, augmentationAdoptionSteepness: value };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    setTokenCostCurve: (curve) =>
      set((state) => {
        const base = state.config.aiCostParams ?? DEFAULT_AI_COST_PARAMS;
        const newConfig = {
          ...state.config,
          aiCostParams: { ...base, tokenCostCurve: curve },
        };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    // Mini-stage 1 (frontier-intensity cost layer): mirrors setTokenCostCurve's
    // base-then-merge pattern for the scalar aiCostParams dials.
    setAiCostParams: (partial) =>
      set((state) => {
        const base = state.config.aiCostParams ?? DEFAULT_AI_COST_PARAMS;
        const newConfig = {
          ...state.config,
          aiCostParams: { ...base, ...partial },
        };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    setScarcityIntensity: (value) =>
      set((state) => {
        const newConfig = { ...state.config, scarcityIntensity: value };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    setCompetitivePressureThreshold: (value) =>
      set((state) => {
        const newConfig = { ...state.config, competitivePressureThreshold: value };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    // DEPRECATED (Stage 2): the replacementMultiplier dial retired with the ledger
    // re-anchor; setter retained per the no-delete rule (no engine reader remains).
    setReplacementMultiplier: (value) =>
      set((state) => {
        const newConfig = { ...state.config, replacementMultiplier: value };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    // DEPRECATED (Phase 10.A fix #2): setMaxAdoptionFrictionYears removed.
    setClusterAlpha: (clusterId, value) =>
      set((state) => {
        const currentOverrides = state.config.clusterAutomationShareOverrides ?? {};
        const newConfig = {
          ...state.config,
          clusterAutomationShareOverrides: { ...currentOverrides, [clusterId]: value },
        };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    setRoleAlphaOverride: (clusterId, roleId, value) =>
      set((state) => {
        const currentOuter = state.config.roleAutomationShareOverrides ?? {};
        const currentInner = currentOuter[clusterId] ?? {};
        const newConfig = {
          ...state.config,
          roleAutomationShareOverrides: {
            ...currentOuter,
            [clusterId]: { ...currentInner, [roleId]: value },
          },
        };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    setRoleReplacementFrictionYears: (clusterId, roleId, value) =>
      set((state) => {
        const currentOuter = state.config.roleReplacementFrictionYearsOverrides ?? {};
        const currentInner = currentOuter[clusterId] ?? {};
        const newConfig = {
          ...state.config,
          roleReplacementFrictionYearsOverrides: {
            ...currentOuter,
            [clusterId]: { ...currentInner, [roleId]: value },
          },
        };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    setRoleReplacementDifficultyWagePremium: (clusterId, roleId, value) =>
      set((state) => {
        const currentOuter = state.config.roleReplacementDifficultyWagePremiumOverrides ?? {};
        const currentInner = currentOuter[clusterId] ?? {};
        const newConfig = {
          ...state.config,
          roleReplacementDifficultyWagePremiumOverrides: {
            ...currentOuter,
            [clusterId]: { ...currentInner, [roleId]: value },
          },
        };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),

    // Reset everything to defaults
    // ═══ R3a: the composition actions ═══
    setComposition: (next) =>
      set((state) => {
        const conflicts = compileAndInstall(next);
        if (conflicts.length > 0) {
          // THE CONFLICT SURFACE (§3.3): the composer REFUSES — nothing applies, nothing
          // partial; the named conflicts render and the previously applied state stands.
          return { composition: next, compositionConflicts: conflicts };
        }
        // R3c (composition purity, P0-1): the direct config writes RETIRED — package
        // activation lives entirely in the compiled composition (fiscal/fed selectors
        // ride configAssignments; policyPreset rides presetWrites), applied at the
        // recompute choke point onto the EFFECTIVE config. Toggling off removes the
        // member and the prior state returns (on-off ≡ never-on, asserted in R3C-B1).
        // The retired loop, kept per no-delete:
        // let config = state.config;
        // for (const pid of next.policies) {
        //   const pkg = POLICY_MANIFESTS.find((p) => p.id === pid);
        //   for (const w of pkg?.writes ?? []) {
        //     if (w.kind === 'policyPreset') {
        //       const preset = POLICY_PRESETS.find((p) => p.id === w.presetId);
        //       if (preset) config = { ...config, policyConfig: preset.config };
        //     } else if (w.kind === 'fiscalPreset' && w.presetId in FISCAL_POLICY_PRESETS) {
        //       config = { ...config, fiscalPolicyPreset: w.presetId, fiscalPolicyCustom: undefined };
        //     } else if (w.kind === 'fedPreset' && w.presetId in FEDERAL_RESERVE_PRESETS) {
        //       config = { ...config, federalReservePreset: w.presetId, federalReserveCustom: undefined };
        //     }
        //   }
        // }
        return {
          composition: next,
          compositionConflicts: [],
          timeline: recompute(state.config),
        };
      }),

    resetShadow: (key) =>
      withTouchSuppressed(() => set((state) => {
        // one-tap reset-to-variant (§3.2): clear the TOUCH and restore the dial
        // default so the variant value resumes at the composition layer. The restore
        // write itself must not re-touch (suppressed; the subscriber checks the flag
        // synchronously after this reducer).
        const dial = DIAL_BY_KEY.get(key);
        if (!dial) return state;
        currentTouched.delete(key);
        // THE SCHEDULE-KEY GUARD (the per-field rebuild): dial rows for schedule keys
        // carry a STRING sentinel default ('{keyframes:[]}') — writing it raw would
        // corrupt the config (latent before: schedule keys could never be composed,
        // so no reset button ever rendered for one). Object-shaped slots restore
        // from the default config itself.
        const sentinel = typeof dial.default === 'string' && dial.default.startsWith('{');
        const restored = sentinel
          ? getDeep(getDefaultSimulationConfig() as unknown as Record<string, unknown>, key)
          : dial.default;
        const config = setDeep(state.config as unknown as Record<string, unknown>, key, restored) as unknown as SimulationConfig;
        return { config, touchedKeys: [...currentTouched], timeline: recompute(config) };
      })),

    clearComposition: () =>
      set((state) => {
        // RIDER 1 (mini-stage 3): clear tears down EVERY installed module-level
        // layer. The resilience-bypass layer was missing from this list — a composed
        // domestic-regulatory event's bypass flags survived clearComposition and kept
        // injecting event-provenance zeros into the resilience rows of every
        // subsequent recompute (caught red by DC-B9 before this line landed).
        currentCompiled = null;
        currentEventLayer = undefined;
        currentScBypassLayer = undefined;
        currentImportedKeys = undefined;
        currentProfileTags = undefined;
        // The data-calibration slot clears with the rest of the composition
        // (on-off ≡ never-on holds on this path too).
        currentDataCalibration = null;
        return {
          composition: { axes: {}, events: [], policies: [] },
          compositionConflicts: [],
          timeline: recompute(state.config),
        };
      }),

    resetToDefaults: () => {
      const freshConfig = getDefaultSimulationConfig();
      currentParameterOverrides = {};
      // R3c (S2): a full reset clears the touched set (clean slate, suppressed diff)
      currentTouched = new Set();
      withTouchSuppressed(() => set(() => ({
        config: freshConfig,
        currentYear: freshConfig.startYear,
        isPlaying: false,
        timeline: recompute(freshConfig),
        touchedKeys: [],
        parameterOverrides: {},
        currentWorld: null, // the chip: a full reset is nobody's saved world
        selectedStateCode: null,
        comparisonStateCodes: [],
        stateMapMetric: 'displacement' as const,
        compareMode: false,
        comparisonPolicyConfigs: [],
        presentationMode: false,
        presentationStep: 0,
        showBaselineComparison: false,
        baselineTimeline: null,
        fiscalComparisonProfile: null,
      })));
    },
  })),
  {
    name: 'atlas-session',
    // Bump `version` whenever SimulationConfig's shape changes (add/remove/rename a field).
    // The migrate function discards any prior-version state so stale browser sessions
    // can't hydrate the current store with an incompatible config.
    // v6: the composition gains the data-calibration slot (the AEI program).
    // v7: the current-world chip (the Scenarios redesign) — currentWorld joins partialize.
    // v8: the composed-event row gains durationYears/severity (the supply-shock build).
    // v9: the composed-policy row becomes {id, params?} (the per-field rebuild).
    version: 9,
    migrate: (_persisted: unknown, version: number) => {
      if (version < 9) return undefined;
      return _persisted;
    },
    storage: {
      getItem: (name) => {
        try {
          const raw = sessionStorage.getItem(name);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      },
      setItem: (name, value) => {
        try {
          sessionStorage.setItem(name, JSON.stringify(value));
        } catch {
          // sessionStorage full or unavailable
        }
      },
      removeItem: (name) => {
        try {
          sessionStorage.removeItem(name);
        } catch {
          // sessionStorage unavailable
        }
      },
    },
    // Only persist user-adjustable state, not derived data
    partialize: (state: SimulationState) => ({
      config: state.config,
      currentYear: state.currentYear,
      activeView: state.activeView,
      selectedClusterId: state.selectedClusterId,
      selectedStateCode: state.selectedStateCode,
      comparisonStateCodes: state.comparisonStateCodes,
      stateMapMetric: state.stateMapMetric,
      compareMode: state.compareMode,
      comparisonPolicyConfigs: state.comparisonPolicyConfigs,
      parameterOverrides: state.parameterOverrides,
      fiscalComparisonProfile: state.fiscalComparisonProfile,
      touchedKeys: state.touchedKeys,
      // R3c (S3): the composition persists — a refresh keeps the worldview. It NEVER
      // reaches pinned contexts: the pin batteries run runSimulation directly on
      // constructed configs (asserted in R3C-B11).
      composition: state.composition,
      // The Scenarios redesign: the loaded-world chip survives a refresh (its signature
      // travels so modified-detection stays truthful against the rehydrated state).
      currentWorld: state.currentWorld,
    }),
    // Recompute timeline from persisted config on rehydration
    onRehydrateStorage: () => (state) => {
      if (state) {
        // Migrate: 'states' view removed in Phase 5 → redirect to 'overview'
        if ((state.activeView as string) === 'states') {
          state.activeView = 'overview';
        }
        // Owner order 2026-08-11: the Predictions tab is PARKED (Header.tsx) — a
        // session rehydrating onto the tab-less view heals to 'overview'. REMOVE
        // this block when the tab returns (the view component stays intact).
        if ((state.activeView as string) === 'predictions') {
          state.activeView = 'overview';
        }
        // Migrate Phase 5e: convert flat policy numbers to PolicySchedule objects
        migratePolicySchedules(state.config);
        // Phase 8b: Restore module-level overrides from persisted state
        currentParameterOverrides = state.parameterOverrides ?? {};
        // R3c (S2): restore the touched set before the recompute reads it
        currentTouched = new Set(state.touchedKeys ?? []);
        // R3c (S3): reinstall the persisted composition through the ONE compile path
        // (conflicts cannot arrive here — a conflicted composition never persisted
        // applied; if one does, the install refuses and the conflicts render)
        const comp = state.composition ?? { axes: {}, events: [], policies: [] };
        // The per-field rebuild: policy entries pass the load-boundary normalizer —
        // persist v9 discards old SESSIONS, but this guard also covers a malformed
        // entry arriving any other way (a compiler throw here would break rehydration).
        comp.policies = normalizePolicyRefs(comp.policies, POLICY_MANIFESTS);
        // A persisted data-calibration id whose snapshot no longer ships: the
        // loud-loss pattern (slot cleared, loss stated — never silently dropped into
        // a compiler throw that would break rehydration).
        if (comp.dataCalibration != null
          && !DATA_CALIBRATION_PRESETS.some((d) => d.id === comp.dataCalibration)) {
          console.warn(
            `[ATLAS] Persisted data-calibration snapshot "${comp.dataCalibration}" is not `
            + 'available in this build — the slot was cleared; authored defaults apply.');
          comp.dataCalibration = null;
        }
        if (Object.keys(comp.axes).length > 0 || comp.events.length > 0 || comp.policies.length > 0
          || (comp.dataCalibration ?? null) !== null) {
          state.compositionConflicts = compileAndInstall(comp);
        } else {
          // An EMPTY persisted composition must LAND too (found by the removed-snapshot
          // battery leg): without this reset, a rehydrate over a session whose module
          // layers were installed — e.g. the loud-loss clear above — would leave a
          // stale side channel feeding the recompute below.
          currentCompiled = null;
          currentEventLayer = undefined;
          currentScBypassLayer = undefined;
          currentImportedKeys = undefined;
          currentProfileTags = undefined;
          currentDataCalibration = null;
        }
        state.timeline = recompute(state.config, state.parameterOverrides);
      }
    },
  },
  ),
);

// ═══ R3c (S2): the touch subscriber — EVERY config write path marks its scalar dial
// keys touched (bespoke actions included; the write is the touch). A FIRST touch on a
// composed key changes the shadow set the effective config depends on, so the
// subscriber recomputes in that case (the user's value must win immediately).
useSimulationStore.subscribe(
  (s) => s.config,
  (next, prev) => {
    if (suppressTouchDiff || next === prev) return;
    const changed = scalarDiffKeys(prev, next).filter((k) => !currentTouched.has(k));
    if (changed.length === 0) return;
    for (const k of changed) currentTouched.add(k);
    const composedTouched = currentCompiled?.configAssignments.some((a) => changed.includes(a.key)) ?? false;
    useSimulationStore.setState((s) => ({
      touchedKeys: [...currentTouched],
      ...(composedTouched ? { timeline: recompute(s.config, s.parameterOverrides) } : {}),
    }));
  },
);
