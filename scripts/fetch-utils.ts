/**
 * ATLAS — Shared Fetch Script Utilities
 *
 * Common helpers used by fetch-bls-data.ts, fetch-bea-data.ts, and fetch-fred-data.ts.
 */

import fs from 'fs';
import path from 'path';

// ============================================================
// Rate Limiting
// ============================================================

/**
 * Delay execution for rate limiting between API requests.
 * Default: 1500ms (respectful to BLS/BEA/FRED servers).
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Standard rate limit delay (1.5 seconds) */
export const RATE_LIMIT_DELAY_MS = 1500;

// ============================================================
// Value Parsing
// ============================================================

/**
 * Parse a numeric value from BEA/BLS/FRED response strings.
 * Handles common formatting: commas, (NA), N/A, "-", parenthesized negatives.
 *
 * Examples:
 *   "1,234,567" → 1234567
 *   "(NA)" → NaN
 *   "(1,234)" → -1234  (accounting-style negative)
 *   "-" → NaN
 *   "" → NaN
 */
export function parseNumericValue(v: string | null | undefined): number {
  if (v == null || v === '' || v === '(NA)' || v === 'N/A' || v === '-' || v === '...') {
    return NaN;
  }
  // Handle parenthesized negatives: "(1,234)" → "-1234"
  let cleaned = v.trim();
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    cleaned = '-' + cleaned.slice(1, -1);
  }
  cleaned = cleaned.replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return parsed;
}

// ============================================================
// File I/O
// ============================================================

/**
 * Write a JSON file, creating parent directories as needed.
 * Logs the output path on success.
 */
export function writeJSON(filepath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`  ✅ Written: ${filepath}`);
}

// ============================================================
// Validation
// ============================================================

/**
 * Validate that a set of ratios sums to an expected value within tolerance.
 * Throws an Error if validation fails.
 *
 * @param ratios - Record of named ratios to sum
 * @param expectedSum - Expected sum (typically 1.0)
 * @param tolerance - Maximum allowed deviation from expected sum
 * @param label - Label for error messages (e.g., "GDP component ratios")
 */
export function validateRatioSum(
  ratios: Record<string, number>,
  expectedSum: number,
  tolerance: number,
  label: string,
): void {
  const sum = Object.values(ratios).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - expectedSum) > tolerance) {
    throw new Error(
      `${label}: ratios sum to ${sum.toFixed(6)}, expected ${expectedSum} (±${tolerance})`,
    );
  }
}

// ============================================================
// CLI Argument Parsing
// ============================================================

/**
 * Parse common CLI arguments for fetch scripts.
 *
 * Supports:
 *   --key VALUE    API key
 *   ENV_VAR        Fallback to environment variable
 *   --flag-name    Boolean flags (collected in flags Set)
 *
 * @param envKeyName - Environment variable name for API key fallback (e.g., "BEA_API_KEY")
 * @returns Parsed API key and set of flags
 */
export function parseCliArgs(envKeyName: string): { apiKey: string | undefined; flags: Set<string> } {
  const args = process.argv.slice(2);
  let apiKey = process.env[envKeyName];
  const flags = new Set<string>();

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--key' && args[i + 1]) {
      apiKey = args[i + 1];
      i++; // skip next arg
    } else if (args[i].startsWith('--')) {
      flags.add(args[i]);
    }
  }

  return { apiKey, flags };
}
