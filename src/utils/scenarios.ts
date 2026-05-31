/**
 * ATLAS Scenario Save/Load Utilities
 *
 * Manages named simulation configurations via localStorage,
 * JSON export/import, and compressed URL parameter sharing.
 *
 * Uses lz-string for URL compression (~80-90% reduction vs raw JSON).
 */

import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { SimulationConfig, SavedScenario } from '@/types';

const STORAGE_KEY = 'atlas_saved_scenarios';
const URL_PARAM_KEY = 'scenario';

// ============================================================
// localStorage Operations
// ============================================================

/**
 * Load all saved scenarios from localStorage.
 */
export function loadScenarios(): SavedScenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SavedScenario[];
  } catch {
    console.error('[ATLAS] Failed to load saved scenarios');
    return [];
  }
}

/**
 * Save a new scenario to localStorage.
 * @returns The created scenario with generated ID.
 */
export function saveScenario(
  name: string,
  description: string,
  config: SimulationConfig,
): SavedScenario {
  const scenario: SavedScenario = {
    id: generateId(),
    name,
    description,
    createdAt: new Date().toISOString(),
    config,
  };

  const existing = loadScenarios();
  existing.push(scenario);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

  return scenario;
}

/**
 * Delete a scenario by ID from localStorage.
 */
export function deleteScenario(id: string): void {
  const scenarios = loadScenarios().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

// ============================================================
// JSON Export/Import
// ============================================================

/**
 * Export a scenario as a JSON file download.
 */
export function exportScenarioJSON(scenario: SavedScenario): void {
  const json = JSON.stringify(scenario, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `atlas-scenario-${sanitizeFilename(scenario.name)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import a scenario from a JSON file.
 * Validates the structure before returning.
 * @returns The parsed scenario or null if invalid.
 */
export function importScenarioJSON(file: File): Promise<SavedScenario | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (isValidScenario(parsed)) {
          // Assign a new ID to avoid collisions
          parsed.id = generateId();
          resolve(parsed as SavedScenario);
        } else {
          console.error('[ATLAS] Invalid scenario file format');
          resolve(null);
        }
      } catch {
        console.error('[ATLAS] Failed to parse scenario JSON');
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}

/**
 * Export current config as a JSON download (without scenario metadata).
 */
export function exportConfigJSON(config: SimulationConfig, name: string): void {
  const scenario: SavedScenario = {
    id: generateId(),
    name,
    description: 'Exported configuration',
    createdAt: new Date().toISOString(),
    config,
  };
  exportScenarioJSON(scenario);
}

// ============================================================
// URL Parameter Encoding/Decoding
// ============================================================

/**
 * Encode a SimulationConfig into a compressed URL parameter string.
 * Uses lz-string for ~80-90% compression vs raw JSON.
 */
export function encodeScenarioURL(config: SimulationConfig): string {
  const json = JSON.stringify(config);
  const compressed = compressToEncodedURIComponent(json);
  return `${window.location.origin}${window.location.pathname}?${URL_PARAM_KEY}=${compressed}`;
}

/**
 * Decode a SimulationConfig from the current URL's query parameters.
 * @returns The decoded config or null if no scenario param found / invalid.
 */
export function decodeScenarioFromURL(): SimulationConfig | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const compressed = params.get(URL_PARAM_KEY);
    if (!compressed) return null;

    const json = decompressFromEncodedURIComponent(compressed);
    if (!json) return null;

    const parsed = JSON.parse(json);
    if (isValidConfig(parsed)) {
      return parsed as SimulationConfig;
    }
    return null;
  } catch {
    console.error('[ATLAS] Failed to decode scenario from URL');
    return null;
  }
}

/**
 * Copy a scenario share link to clipboard.
 * @returns true if successful.
 */
export async function copyShareLink(config: SimulationConfig): Promise<boolean> {
  try {
    const url = encodeScenarioURL(config);
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    console.error('[ATLAS] Failed to copy share link');
    return false;
  }
}

// ============================================================
// Scenario Config Passthrough (no migration needed — 3-vector format only)
// ============================================================

/**
 * Identity passthrough for scenario configs.
 * No migration needed — only current 3-vector format is supported.
 * @deprecated Callers can remove this passthrough; kept for API compatibility.
 */
export function migrateScenarioConfig(config: SimulationConfig): SimulationConfig {
  return config;
}

// ============================================================
// Internal Helpers
// ============================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeFilename(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Basic structural validation for a SavedScenario object.
 */
function isValidScenario(obj: unknown): boolean {
  if (typeof obj !== 'object' || obj === null) return false;
  const s = obj as Record<string, unknown>;
  return (
    typeof s.name === 'string' &&
    typeof s.config === 'object' &&
    s.config !== null &&
    isValidConfig(s.config)
  );
}

/**
 * Basic structural validation for a SimulationConfig.
 * Checks key fields exist with correct types.
 */
function isValidConfig(obj: unknown): boolean {
  if (typeof obj !== 'object' || obj === null) return false;
  const c = obj as Record<string, unknown>;
  return (
    typeof c.startYear === 'number' &&
    typeof c.endYear === 'number' &&
    typeof c.capabilities === 'object' &&
    typeof c.policyConfig === 'object' &&
    typeof c.totalPopulation === 'number' &&
    typeof c.laborForce === 'number'
  );
}
