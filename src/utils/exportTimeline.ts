/**
 * ATLAS Phase 8d: Parameter Timeline Export Utilities
 *
 * Pure functions for exporting parameter timeline data as CSV,
 * generating comparison markdown reports, and encoding/decoding
 * compact fiscal configuration URLs.
 *
 * CSV format: Long format — one row per year × parameter.
 * URL format: ?fiscal=<lz-compressed JSON of { profile, overrides }>
 */

import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { YearParameters, ParameterValue, SimulationTimeline } from '@/types';
import { PARAM_LABELS, PARAM_CATEGORIES, formatParamValue } from '@/utils/parameterFormatter';

// ============================================================
// Parameter Timeline CSV
// ============================================================

/** All param keys in category order. */
const ALL_PARAM_KEYS: string[] = PARAM_CATEGORIES.flatMap((cat) => cat.params);

/** Lookup: paramKey → category label. */
const PARAM_TO_CATEGORY_LABEL: Map<string, string> = new Map();
for (const cat of PARAM_CATEGORIES) {
  for (const key of cat.params) {
    PARAM_TO_CATEGORY_LABEL.set(key, cat.label);
  }
}

/**
 * Get a ParameterValue from YearParameters by key name.
 */
function getParamValue(yearParams: YearParameters, key: string): ParameterValue | undefined {
  return (yearParams as unknown as Record<string, ParameterValue>)[key];
}

/**
 * Generate CSV in long format for the parameter timeline.
 *
 * One row per (year × parameter), with columns:
 *   year, profile, category, param_key, param_label, baseline, autopilot, override, effective, source, explanation
 *
 * This format is analysis-friendly (e.g. pivot tables, R/Python).
 */
export function generateParameterTimelineCSV(
  parameterTimeline: Map<number, YearParameters>,
  profileName: string,
): string {
  const headers = [
    'year',
    'profile',
    'category',
    'param_key',
    'param_label',
    'baseline',
    'autopilot',
    'override',
    'effective',
    'source',
    'explanation',
  ];

  const rows: string[] = [headers.join(',')];
  const sortedYears = Array.from(parameterTimeline.keys()).sort((a, b) => a - b);

  for (const year of sortedYears) {
    const yearParams = parameterTimeline.get(year)!;

    for (const paramKey of ALL_PARAM_KEYS) {
      const pv = getParamValue(yearParams, paramKey);
      if (!pv) continue;

      const category = PARAM_TO_CATEGORY_LABEL.get(paramKey) ?? '';
      const label = PARAM_LABELS[paramKey] ?? paramKey;
      const overrideStr = pv.userOverride !== undefined ? String(pv.userOverride) : '';
      const explanation = pv.explanation ? csvEscape(pv.explanation) : '';

      rows.push([
        year,
        csvEscape(profileName),
        csvEscape(category),
        paramKey,
        csvEscape(label),
        pv.baseline,
        pv.autopilot,
        overrideStr,
        pv.effective,
        pv.source,
        explanation,
      ].join(','));
    }
  }

  return rows.join('\n');
}

/**
 * Escape a CSV field value — wrap in double quotes if it contains commas, quotes, or newlines.
 */
function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// ============================================================
// Comparison Markdown Report
// ============================================================

/**
 * Generate a markdown report comparing two fiscal response profile simulations.
 */
export function generateComparisonMarkdown(
  profileA: { name: string; timeline: SimulationTimeline },
  profileB: { name: string; timeline: SimulationTimeline },
): string {
  const lastA = profileA.timeline.years[profileA.timeline.years.length - 1];
  const lastB = profileB.timeline.years[profileB.timeline.years.length - 1];

  if (!lastA || !lastB) return '# Comparison Report\n\nInsufficient data.';

  const lines: string[] = [];
  lines.push('# ATLAS Fiscal Profile Comparison Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString().slice(0, 10)}`);
  lines.push('');
  lines.push(`## Profiles Compared`);
  lines.push('');
  lines.push(`- **Profile A**: ${profileA.name}`);
  lines.push(`- **Profile B**: ${profileB.name}`);
  lines.push('');
  lines.push('## Final Year Metrics');
  lines.push('');
  lines.push('| Metric | Profile A | Profile B | Delta |');
  lines.push('|--------|-----------|-----------|-------|');

  const metrics: Array<{
    label: string;
    valueA: number;
    valueB: number;
    format: (v: number) => string;
  }> = [
    {
      label: 'Consumer Welfare Index',
      valueA: lastA.macro.consumerWelfareIndex,
      valueB: lastB.macro.consumerWelfareIndex,
      format: (v) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    },
    {
      label: 'Unemployment Rate',
      valueA: lastA.macro.unemploymentRate,
      valueB: lastB.macro.unemploymentRate,
      format: (v) => `${(v * 100).toFixed(1)}%`,
    },
    {
      label: 'Price Level',
      valueA: lastA.macro.priceLevel,
      valueB: lastB.macro.priceLevel,
      format: (v) => `${v.toFixed(2)}\u00D7`,
    },
    {
      label: 'GDP (Real)',
      valueA: lastA.macro.gdpReal,
      valueB: lastB.macro.gdpReal,
      format: (v) => `$${(v / 1e12).toFixed(2)}T`,
    },
    {
      label: 'Debt / GDP Ratio',
      valueA: lastA.fiscalMonetary?.fiscal.debtGDPRatio ?? 0,
      valueB: lastB.fiscalMonetary?.fiscal.debtGDPRatio ?? 0,
      format: (v) => `${v.toFixed(2)}\u00D7`,
    },
  ];

  for (const m of metrics) {
    const delta = m.valueB - m.valueA;
    const pct = m.valueA !== 0
      ? `${delta > 0 ? '+' : ''}${((delta / Math.abs(m.valueA)) * 100).toFixed(1)}%`
      : '—';
    lines.push(`| ${m.label} | ${m.format(m.valueA)} | ${m.format(m.valueB)} | ${pct} |`);
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*Generated by ATLAS — AI Transformation Labor & Automation Simulator*');

  return lines.join('\n');
}

// ============================================================
// Compact Fiscal URL Encoding/Decoding
// ============================================================

const FISCAL_URL_PARAM = 'fiscal';

interface FiscalURLPayload {
  profile: string;
  overrides: Record<string, number>;
}

/**
 * Encode a fiscal configuration (profile + overrides) into a compact URL.
 * Uses lz-string for compression.
 */
export function encodeFiscalURL(
  profileName: string,
  overrides: Record<string, number>,
): string {
  const payload: FiscalURLPayload = { profile: profileName, overrides };
  const json = JSON.stringify(payload);
  const compressed = compressToEncodedURIComponent(json);
  return `${window.location.origin}${window.location.pathname}?${FISCAL_URL_PARAM}=${compressed}`;
}

/**
 * Decode a fiscal configuration from the current URL's query parameters.
 * @returns The decoded payload or null if no fiscal param found / invalid.
 */
export function decodeFiscalFromURL(): FiscalURLPayload | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const compressed = params.get(FISCAL_URL_PARAM);
    if (!compressed) return null;

    const json = decompressFromEncodedURIComponent(compressed);
    if (!json) return null;

    const parsed = JSON.parse(json) as FiscalURLPayload;
    if (
      typeof parsed.profile === 'string' &&
      typeof parsed.overrides === 'object' &&
      parsed.overrides !== null
    ) {
      return parsed;
    }
    return null;
  } catch {
    console.error('[ATLAS] Failed to decode fiscal config from URL');
    return null;
  }
}

/**
 * Copy a compact fiscal share link to clipboard.
 * @returns true if successful.
 */
export async function copyFiscalShareLink(
  profileName: string,
  overrides: Record<string, number>,
): Promise<boolean> {
  try {
    const url = encodeFiscalURL(profileName, overrides);
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    console.error('[ATLAS] Failed to copy fiscal share link');
    return false;
  }
}

// ============================================================
// Download Helpers
// ============================================================

/**
 * Trigger a browser download of a text string.
 */
export function downloadText(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
