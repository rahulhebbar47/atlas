/**
 * ATLAS Number/Currency/Percentage Formatting Utilities
 *
 * All pure functions using Intl.NumberFormat for locale-aware formatting.
 * Used throughout the dashboard UI for consistent number display.
 */

interface FormatNumberOptions {
  decimals?: number;
  compact?: boolean;
}

/** Quadrillion threshold: Intl compact stops at T, so we handle Q manually */
const QUADRILLION = 1e15;

/**
 * Format values >= 1 quadrillion with Q suffix (e.g., 7.4Q).
 * Returns null for values below quadrillion threshold.
 */
function formatQuadrillion(n: number, decimals: number, prefix: string = ''): string | null {
  const abs = Math.abs(n);
  if (abs < QUADRILLION) return null;
  const sign = n < 0 ? '-' : '';
  const q = abs / QUADRILLION;
  return `${sign}${prefix}${q.toFixed(decimals)}Q`;
}

/**
 * Format a number with optional compact notation (e.g., 157,000,000 → "157.0M").
 * Values >= 1 quadrillion use Q suffix (e.g., 7.4Q).
 */
export function formatNumber(n: number, opts: FormatNumberOptions = {}): string {
  const { decimals, compact = false } = opts;

  if (compact) {
    const dec = decimals ?? 1;
    // Handle quadrillion+ values that Intl can't compact nicely
    const qResult = formatQuadrillion(n, dec);
    if (qResult) return qResult;

    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    }).format(n);
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 0,
  }).format(n);
}

/**
 * Format a number as US currency (e.g., "$29.0T", "$65,470").
 * Values >= 1 quadrillion use Q suffix (e.g., $7.4Q).
 */
export function formatCurrency(n: number, opts: FormatNumberOptions = {}): string {
  const { decimals, compact = false } = opts;

  if (compact) {
    const dec = decimals ?? 1;
    // Handle quadrillion+ values that Intl can't compact nicely
    const qResult = formatQuadrillion(n, dec, '$');
    if (qResult) return qResult;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      compactDisplay: 'short',
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    }).format(n);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 0,
  }).format(n);
}

/**
 * Format a decimal as a percentage (e.g., 0.042 → "4.2%").
 * For extreme values (|n * 100| >= 1000), uses compact notation to avoid overflow.
 */
export function formatPercent(n: number, decimals: number = 1): string {
  const pct = Math.abs(n * 100);
  if (pct >= 1000) {
    // Use compact number formatting + manual % suffix for extreme values
    // e.g., 27.748 → 2774.8 → "2.8K" → "2.8K%"
    const sign = n < 0 ? '-' : '';
    return sign + formatNumber(Math.abs(n * 100), { compact: true, decimals: 0 }) + '%';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

/**
 * Format a year number as a string (e.g., 2025 → "2025").
 */
export function formatYear(n: number): string {
  return String(n);
}

/**
 * Format a delta value with a +/- prefix.
 * Returns the formatted string and a sign indicator for styling.
 */
export function formatDelta(
  n: number,
  type: 'number' | 'percent' | 'currency',
): { text: string; sign: 'positive' | 'negative' | 'neutral' } {
  const sign = n > 0.001 ? 'positive' as const : n < -0.001 ? 'negative' as const : 'neutral' as const;
  const prefix = n > 0 ? '+' : '';

  let text: string;
  switch (type) {
    case 'percent':
      text = `${prefix}${formatPercent(n)}`;
      break;
    case 'currency':
      text = n >= 0 ? `+${formatCurrency(n, { compact: true })}` : formatCurrency(n, { compact: true });
      break;
    case 'number':
    default:
      text = `${prefix}${formatNumber(n, { compact: true })}`;
      break;
  }

  return { text, sign };
}

// ════════════════════════════════════════════════════════════
// Display-hygiene guards (owner-approved rider on the flywheel mini-stage;
// DISPLAY-ONLY — the engine fields are untouched and stay raw in CSV/diagnostics).
// ════════════════════════════════════════════════════════════

/**
 * The policy-rate DISPLAY clamp: the Taylor machinery's prescription can run far
 * below any implementable rate in a collapse (observed −104% in the Acceleration
 * trace); display surfaces clamp at the effective lower bound while the raw
 * prescription remains visible as its own series/card (taylorPrescribedRate).
 */
export function clampPolicyRateForDisplay(rate: number, effectiveLowerBound: number = -0.005): number {
  return Math.max(rate, effectiveLowerBound);
}

/** P/E values above this are display-degenerate (near-zero earnings base). */
export const PE_DISPLAY_CAP = 200;

/**
 * The P/E not-meaningful guard: a price-to-earnings ratio over a collapsing or
 * near-zero earnings base (observed ~10⁶ in the Acceleration trace) carries no
 * information — display surfaces render an em-dash; the raw value stays in
 * diagnostics and the CSV export.
 */
export function isPEDisplayMeaningful(pe: number): boolean {
  return Number.isFinite(pe) && pe > 0 && pe <= PE_DISPLAY_CAP;
}
