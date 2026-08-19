/**
 * THE ONE-WAY MIGRATION IMPORTER (R2; the adopted §6 mapping).
 *
 * Old saves (scenario JSON / share-URL payloads / CSV-derived configs) import ONCE into
 * the composition format: every recognized key becomes an override with 'imported'
 * provenance (the resolver's importedKeys set drives the tag); the unrecognized
 * remainder is REPORTED BY NAME — loss becomes loud (the old CSV round-trip lost 81 keys
 * silently). No axis selection is inferred: axes default to Consensus; the import is
 * overrides-on-consensus. A pre-D-19 save's durationWeeks 52 stays a badged override —
 * never silently upgraded (the provenance system protecting users from our own
 * improvements). No dual formats are maintained (Amendment 2's law).
 */
import { DIAL_BY_KEY } from '@/data/dialTable';
import type { OverrideEntry } from '@/types/manifests';

export interface LegacyImportResult {
  overrides: OverrideEntry[];
  /** keys for the resolver's importedKeys set (per-year keys keep their base name) */
  importedKeys: Set<string>;
  /** the loud remainder: every unrecognized key, BY NAME */
  unrecognized: string[];
}

/** Flatten a legacy config object to dotted leaves. */
function flatten(obj: Record<string, unknown>, prefix = ''): Array<[string, unknown]> {
  const out: Array<[string, unknown]> = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v) && !('keyframes' in (v as object))) {
      out.push(...flatten(v as Record<string, unknown>, path));
    } else {
      out.push([path, v]);
    }
  }
  return out;
}

export function importLegacyScenario(legacy: {
  config?: Record<string, unknown>;
  parameterOverrides?: Record<string, number>;
}): LegacyImportResult {
  const overrides: OverrideEntry[] = [];
  const importedKeys = new Set<string>();
  const unrecognized: string[] = [];

  if (legacy.config) {
    for (const [path, value] of flatten(legacy.config)) {
      if (DIAL_BY_KEY.has(path)) {
        if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
          overrides.push({ key: path, value, provenance: 'imported' });
          importedKeys.add(path);
        }
      } else {
        unrecognized.push(path);   // LOUD: reported by name at import time
      }
    }
  }
  if (legacy.parameterOverrides) {
    for (const [k, v] of Object.entries(legacy.parameterOverrides)) {
      const base = k.slice(0, k.lastIndexOf(':'));
      if (DIAL_BY_KEY.has(`parameterOverrides.${base}`)) {
        overrides.push({ key: k, value: v, provenance: 'imported' });
        importedKeys.add(base);
      } else {
        unrecognized.push(k);
      }
    }
  }
  return { overrides, importedKeys, unrecognized };
}
