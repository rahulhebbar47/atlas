/**
 * MANIFEST CI VALIDATION  — the adopted §4 rules + the live-cap amendment.
 * A cosmetic manifest is structurally impossible: every key live, every value in-range
 * AND ≤ its MEASURED live cap, belief manifests complete over the owned set with zero
 * foreign keys and per-axis ordering constraints, events with explicit recovery or
 * declared permanence (belief-owned keys registered), policy manifests accurately
 * labeled with referents where a real system is claimed. Pure functions; exercised over
 * every shipped manifest in r2-manifest-tests.test.ts.
 */
import { DIAL_BY_KEY, DIAL_TABLE } from '@/data/dialTable';
import type { VariantManifest, EventManifest, PolicyManifest, DataCalibrationManifest } from '@/types/manifests';
import { validateDataCalibrationPayload } from '@/data/anthropic/validate';
import { POLICY_PRESETS } from '@/models/constants';
import { FISCAL_POLICY_PRESETS, FEDERAL_RESERVE_PRESETS } from '@/models/fiscalResponseProfiles';
import { QUANTITY_ROW_TO_RESILIENCE, PRICE_ROWS } from '@/models/manifestCompiler';

export interface ValidationError { manifest: string; rule: string; detail: string }

const ownedSetOf = (axis: string): Set<string> =>
  new Set(DIAL_TABLE.filter((r) => r.axis === axis && r.species === 'BELIEF').map((r) => r.key));

function checkRangeAndCap(errors: ValidationError[], who: string, key: string, value: number | string | boolean): void {
  const row = DIAL_BY_KEY.get(key);
  if (!row) { errors.push({ manifest: who, rule: 'key-live', detail: `${key} is not a live dial-table key` }); return; }
  if (typeof value === 'number') {
    if (row.min !== null && value < row.min) errors.push({ manifest: who, rule: 'range', detail: `${key}=${value} < min ${row.min}` });
    if (row.max !== null && value > row.max) errors.push({ manifest: who, rule: 'range', detail: `${key}=${value} > max ${row.max}` });
    // THE CAP RULE (the mechanized Part-A lesson): in-range is not enough — a value above
    // a measured computation clamp is cosmetic; the validator refuses it.
    if (row.liveCap && value > row.liveCap.cap) {
      errors.push({ manifest: who, rule: 'live-cap', detail: `${key}=${value} exceeds the measured cap ${row.liveCap.cap} (${row.liveCap.site})` });
    }
  }
}

/** Per-axis ordering constraints (authoring rule (b)) — the variant-table rules. */
function checkOrdering(errors: ValidationError[], m: VariantManifest): void {
  const v = new Map(m.values.map((e) => [e.key, e.value as number]));
  const who = `${m.axis}·${m.variant}`;
  if (m.axis === 'A1') {
    for (const vec of ['generative', 'agentic', 'embodied']) {
      const fl = v.get(`capabilities.${vec}.floor`)!; const ce = v.get(`capabilities.${vec}.ceiling`)!;
      if (ce < fl) errors.push({ manifest: who, rule: 'A1-ordering', detail: `${vec} ceiling ${ce} < floor ${fl}` });
      const mid = v.get(`capabilities.${vec}.midpointYear`)!;
      if (mid < 2025 || mid > 2045) errors.push({ manifest: who, rule: 'A1-ordering', detail: `${vec} midpoint ${mid} outside 2025-2045` });
    }
    if (m.variant === 'Embodied-lag') {
      const gap = v.get('capabilities.embodied.midpointYear')! - Math.max(v.get('capabilities.generative.midpointYear')!, v.get('capabilities.agentic.midpointYear')!);
      if (gap < 10) errors.push({ manifest: who, rule: 'A1-ordering', detail: `Embodied-lag defining constraint: embodied midpoint must lag cognitive by >= 10 (got ${gap})` });
    }
  }
  // (the A4 weight-sum rule is checked in validateVariantManifest below)
}

export function validateVariantManifest(m: VariantManifest): ValidationError[] {
  const errors: ValidationError[] = [];
  const who = `${m.axis}·${m.variant}`;
  const owned = ownedSetOf(m.axis);
  const present = new Set(m.values.map((e) => e.key));
  for (const k of owned) if (!present.has(k)) errors.push({ manifest: who, rule: 'completeness', detail: `owned key ${k} missing (rule (a): complete absolute assignment)` });
  for (const e of m.values) {
    if (!owned.has(e.key)) errors.push({ manifest: who, rule: 'foreign-key', detail: `${e.key} is not ${m.axis}-owned` });
    checkRangeAndCap(errors, who, e.key, e.value);
    if (!e.label) errors.push({ manifest: who, rule: 'label', detail: `${e.key} unlabeled (rule (c))` });
  }
  checkOrdering(errors, m);
  if (m.axis === 'A4') {
    const v = new Map(m.values.map((x) => [x.key, x.value as number]));
    const sum = (v.get('alphaDriverParams.capabilityWeight') ?? 0) + (v.get('alphaDriverParams.trustWeight') ?? 0)
      + (v.get('alphaDriverParams.competitiveWeight') ?? 0) + (v.get('alphaDriverParams.marginWeight') ?? 0);
    if (sum > 1 + 1e-9) errors.push({ manifest: who, rule: 'A4-weight-sum', detail: `driver weight sum ${sum.toFixed(2)} > 1 (the census peg warning as a table rule)` });
  }
  return errors;
}

/** Event keys are the per-year vehicle names; live iff the parameterOverrides row exists,
 *  OR the key is covered by an axis-override registration against a belief-owned config
 *  key (the axis-override registration pattern — engine wiring for such keys is R3 work, recorded). */
const REGISTERED_EVENT_KEY_TO_CONFIG: Record<string, string> = {
  geopoliticalRiskFactor: 'adoptionParams.geopoliticalRiskFactor',
  // the energy cost-curve bend key (belief-owned, N1 — axis-override-registered applies).
  buildoutEnergyCostTrend: 'buildoutEnergyCostTrend',
};

export function validateEventManifest(m: EventManifest): ValidationError[] {
  const errors: ValidationError[] = [];
  const entryKeys = new Set(m.entries.map((e) => e.key));
  // THE ORIGIN CHANNEL (the supply-chain shock design decision): every shipped event declares
  // its origin; price-row legs must be price-origin; quantity-row legs must declare
  // which supply channel they arrive through (that decides resilience absorption).
  const ORIGINS = new Set(['foreign-supply', 'domestic-regulatory', 'price']);
  if (!ORIGINS.has(m.origin)) {
    errors.push({ manifest: m.id, rule: 'origin-declared', detail: `origin "${m.origin}" is not a valid channel` });
  }
  if (!m.directionLine || m.directionLine.trim().length < 20) {
    errors.push({ manifest: m.id, rule: 'direction-line', detail: 'the card\'s expected-direction line is required (cites the measured impact table)' });
  }
  for (const e of m.entries) {
    const effOrigin = e.origin ?? m.origin;
    if (PRICE_ROWS.has(e.key) && effOrigin !== 'price') {
      errors.push({ manifest: m.id, rule: 'origin-price-leg', detail: `${e.key} is a price row — its leg must declare origin 'price' (got '${effOrigin}')` });
    }
    if (QUANTITY_ROW_TO_RESILIENCE[e.key] && effOrigin === 'price') {
      errors.push({ manifest: m.id, rule: 'origin-quantity-leg', detail: `${e.key} is a quantity row — its leg must declare 'foreign-supply' or 'domestic-regulatory'` });
    }
  }
  for (const e of m.entries) {
    const vehicle = DIAL_BY_KEY.get(`parameterOverrides.${e.key}`);
    const registeredConfig = REGISTERED_EVENT_KEY_TO_CONFIG[e.key];
    if (!vehicle && !registeredConfig) {
      errors.push({ manifest: m.id, rule: 'event-key', detail: `${e.key}: no live per-year vehicle and no axis-override registration` });
      continue;
    }
    if (registeredConfig) {
      const row = DIAL_BY_KEY.get(registeredConfig);
      if (row?.species === 'BELIEF' && !m.axisOverrideRegistrations.includes(registeredConfig)) {
        errors.push({ manifest: m.id, rule: 'case-16', detail: `${e.key} touches belief-owned ${registeredConfig} without the axis-override registration` });
      }
      if (row) checkRangeAndCap(errors, m.id, registeredConfig, e.value);
    }
  }
  if (m.recovery !== 'permanent') {
    const maxEntry = Math.max(...m.entries.map((e) => e.yearOffset));
    for (const k of entryKeys) {
      if (!m.recovery.some((r) => r.key === k)) errors.push({ manifest: m.id, rule: 'recovery-explicit', detail: `${k} has no recovery entry and permanence is not declared` });
    }
    for (const r of m.recovery) {
      if (r.yearOffset <= maxEntry) errors.push({ manifest: m.id, rule: 'recovery-explicit', detail: `${r.key} recovery offset ${r.yearOffset} does not follow the shock window` });
      if (r.value === -1 && !REGISTERED_EVENT_KEY_TO_CONFIG[r.key]) {
        errors.push({ manifest: m.id, rule: 'restore-axis-sentinel', detail: `${r.key}: the RESTORE-AXIS sentinel is only valid on registered axis-override keys` });
      }
    }
  }
  return errors;
}

const CLAIMS_REAL_SYSTEM = /nordic|danish|denmark|kurzarbeit|yang|flexicurity|alaska|norway/i;

export function validatePolicyManifest(m: PolicyManifest): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!m.designLabel || m.designLabel.length < 20) errors.push({ manifest: m.id, rule: 'design-label', detail: 'rule (i): a policy proposal needs an accurate design label' });
  if (CLAIMS_REAL_SYSTEM.test(m.title + ' ' + m.designLabel) && !m.referent) {
    errors.push({ manifest: m.id, rule: 'referent', detail: 'rule (i): the package claims a real system — referent citation required (the nordic class)' });
  }
  // ── THE PARAM DECLARATION (the per-field rebuild): declared both directions —
  // every write-referenced param declared; every declared param referenced by some
  // write; bounds sane. A param's range must sit INSIDE the dial row's range for
  // every key it feeds (otherwise the sidebar card could write out-of-range values
  // the validator never sees). ──
  const declared = new Map((m.params ?? []).map((s) => [s.id, s]));
  const referenced = new Set<string>();
  const checkParamBounds = (who: string, paramId: string | undefined, key: string): void => {
    if (paramId === undefined) return;
    referenced.add(paramId);
    const spec = declared.get(paramId);
    if (!spec) { errors.push({ manifest: m.id, rule: 'param-declared', detail: `${who}: param '${paramId}' is not declared` }); return; }
    const row = DIAL_BY_KEY.get(key);
    if (!row) return; // key-live errors reported by the write checks below
    if (row.min !== null && spec.min < row.min) errors.push({ manifest: m.id, rule: 'param-bounds', detail: `param '${paramId}' min ${spec.min} < dial min ${row.min} for ${key}` });
    if (row.max !== null && spec.max > row.max) errors.push({ manifest: m.id, rule: 'param-bounds', detail: `param '${paramId}' max ${spec.max} > dial max ${row.max} for ${key}` });
  };
  for (const s of m.params ?? []) {
    if (!(s.min < s.max) || s.step <= 0 || s.default < s.min || s.default > s.max) {
      errors.push({ manifest: m.id, rule: 'param-sane', detail: `param '${s.id}': bounds/step/default incoherent (min ${s.min}, max ${s.max}, step ${s.step}, default ${s.default})` });
    }
  }
  for (const w of m.writes) {
    if (w.kind === 'policyPreset' && !POLICY_PRESETS.some((p) => p.id === w.presetId)) errors.push({ manifest: m.id, rule: 'preset-exists', detail: `POLICY_PRESETS has no ${w.presetId}` });
    if (w.kind === 'fiscalPreset' && !(w.presetId in FISCAL_POLICY_PRESETS)) errors.push({ manifest: m.id, rule: 'preset-exists', detail: `FISCAL_POLICY_PRESETS has no ${w.presetId}` });
    if (w.kind === 'fedPreset' && !(w.presetId in FEDERAL_RESERVE_PRESETS)) errors.push({ manifest: m.id, rule: 'preset-exists', detail: `FEDERAL_RESERVE_PRESETS has no ${w.presetId}` });
    if (w.kind === 'configField') {
      const row = DIAL_BY_KEY.get(w.key);
      if (!row) errors.push({ manifest: m.id, rule: 'key-live', detail: `${w.key} not live` });
      else if (row.species !== 'POLICY') errors.push({ manifest: m.id, rule: 'species-namespace', detail: `${w.key} is ${row.species}, not POLICY — packages write policy keys only (§3.1)` });
      else checkRangeAndCap(errors, m.id, w.key, w.value);
      checkParamBounds(`configField ${w.key}`, w.param, w.key);
    }
    if (w.kind === 'scheduleField') {
      // checkRangeAndCap takes scalars: the schedule's default magnitude is validated
      // against the dial row explicitly; the onset year needs only sanity (the dial
      // rows for schedule keys bound the MAGNITUDE, not the year).
      const row = DIAL_BY_KEY.get(w.key);
      if (!row) errors.push({ manifest: m.id, rule: 'key-live', detail: `${w.key} not live` });
      else if (row.species !== 'POLICY') errors.push({ manifest: m.id, rule: 'species-namespace', detail: `${w.key} is ${row.species}, not POLICY — packages write policy keys only (§3.1)` });
      else checkRangeAndCap(errors, m.id, w.key, w.defaultValue);
      if (w.defaultYear < 2025 || w.defaultYear > 2050) {
        errors.push({ manifest: m.id, rule: 'schedule-year', detail: `${w.key}: defaultYear ${w.defaultYear} outside 2025-2050` });
      }
      checkParamBounds(`scheduleField ${w.key} (value)`, w.valueParam, w.key);
      // The year param binds a YEAR, not the key's magnitude — sanity only.
      if (w.yearParam !== undefined) {
        referenced.add(w.yearParam);
        const spec = declared.get(w.yearParam);
        if (!spec) errors.push({ manifest: m.id, rule: 'param-declared', detail: `scheduleField ${w.key}: param '${w.yearParam}' is not declared` });
        else if (spec.min < 2025 || spec.max > 2050) errors.push({ manifest: m.id, rule: 'param-bounds', detail: `param '${w.yearParam}' range ${spec.min}-${spec.max} outside 2025-2050` });
      }
    }
  }
  for (const id of declared.keys()) {
    if (!referenced.has(id)) errors.push({ manifest: m.id, rule: 'param-referenced', detail: `declared param '${id}' is referenced by no write` });
  }
  return errors;
}

/** The data-calibration species (the AEI program): payload validity re-enforced at the
 *  manifest layer, disclosure strings present (the card is the transparency surface —
 *  a preset without its disclosure is refused), scalar values live/in-range/capped —
 *  and EMPTY in v1 (a shipped scalar write is a design change, refused until the
 *  species' scalar channel is deliberately opened). Id uniqueness is checked across
 *  the registry by the caller (it is a property of the set, not of one manifest). */
export function validateDataCalibrationManifest(m: DataCalibrationManifest): ValidationError[] {
  const errors: ValidationError[] = [];
  if (m.species !== 'data-calibration') errors.push({ manifest: m.id, rule: 'species', detail: `species "${m.species}"` });
  if (!m.id) errors.push({ manifest: m.id, rule: 'id', detail: 'empty id' });
  if (!m.title || !m.sourceShortName) errors.push({ manifest: m.id, rule: 'card-face', detail: 'title and sourceShortName required' });
  if (!m.chipLabel || m.chipLabel.length > 16) {
    errors.push({ manifest: m.id, rule: 'chip-label', detail: 'the compact chip label is required and must stay chip-short (≤16 chars)' });
  }
  if (!m.fullSourceName || m.fullSourceName.length <= m.sourceShortName.length) {
    errors.push({ manifest: m.id, rule: 'full-name', detail: 'the details-level full source name (the acronym expanded) is required' });
  }
  if (!m.disclosure.subtitle || m.disclosure.subtitle.length < 80) {
    errors.push({ manifest: m.id, rule: 'disclosure', detail: 'the subtitle-level disclosure is required (population, conversations-not-value, absence handling, license, unaffiliated)' });
  }
  if (m.disclosure.expanded.length === 0) {
    errors.push({ manifest: m.id, rule: 'disclosure', detail: 'the expanded disclosure lines are required (scope, coverage, signal character)' });
  }
  if (!m.rationaleText) errors.push({ manifest: m.id, rule: 'rationale', detail: 'rationaleText required' });
  if (m.values.length > 0) {
    errors.push({ manifest: m.id, rule: 'v1-scalar-channel-empty', detail: `v1 ships zero scalar values; got ${m.values.length}` });
  }
  for (const e of m.values) checkRangeAndCap(errors, m.id, e.key, e.value);
  try {
    validateDataCalibrationPayload(m.clusterPayload);
  } catch (err) {
    errors.push({ manifest: m.id, rule: 'payload', detail: err instanceof Error ? err.message : String(err) });
  }
  return errors;
}
