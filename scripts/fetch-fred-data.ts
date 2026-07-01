/**
 * ATLAS — FRED Data Fetch Script
 *
 * Fetches monetary and macroeconomic data from the Federal Reserve
 * Economic Data (FRED) API and saves it as static JSON files.
 *
 * Supports two API versions:
 *   V1 — Series observations (query param auth) — used by default
 *   V2 — Release observations (Bearer token auth) — used with --phase2
 *
 * Usage:
 *   npx tsx scripts/fetch-fred-data.ts --key YOUR_FRED_API_KEY
 *   FRED_API_KEY=YOUR_KEY npx tsx scripts/fetch-fred-data.ts
 *   npx tsx scripts/fetch-fred-data.ts --key YOUR_KEY --phase2
 *
 * Output files:
 *   src/data/fred/m2-velocity.json       — M2 money velocity (quarterly)
 *   src/data/fred/nairu.json             — Natural rate of unemployment (CBO)
 *   src/data/fred/fed-funds-rate.json    — Federal funds effective rate (monthly)
 *   src/data/fred/mortgage-delinquency.json — Mortgage delinquency rate (quarterly, Phase 5i)
 *   src/data/fred/mortgage-rate-30yr.json — 30-year fixed mortgage rate (weekly→annual, Phase 5i)
 *   src/data/fred/case-shiller-national.json — Case-Shiller national home price index (monthly, Phase 5i)
 *   src/data/fred/housing-starts.json    — New housing units started (monthly→annual, Phase 5i)
 *   src/data/fred/cpi-shelter.json       — CPI shelter component (monthly, Phase 5i)
 *   src/data/fred/sloos-household-tightening.json — SLOOS household loan tightening (quarterly, Phase 5i)
 *   src/data/fred/sloos-business-tightening.json  — SLOOS business loan tightening (quarterly, Phase 5i)
 *   src/data/fred/federal-debt.json      — Federal debt total public (quarterly, Phase 7)
 *   src/data/fred/treasury-10yr.json     — 10-year Treasury yield (daily, Phase 7)
 *   src/data/fred/federal-receipts-gdp.json — Federal receipts % GDP (annual, Phase 7)
 *   src/data/fred/federal-deficit-gdp.json  — Federal surplus/deficit % GDP (annual, Phase 7)
 *   src/data/fred/bbb-corporate-spread.json — BBB corporate bond spread (daily, Phase 7)
 *   src/data/fred/federal-interest-outlays.json — Federal interest payments (annual, Phase 7)
 *   src/data/fred/corporate-profits.json — Corporate profits after tax (quarterly, Phase 7)
 *   src/data/fred/corporate-tax-receipts.json — Federal corporate tax receipts (annual, Phase 7)
 *   src/data/fred/sp500.json             — S&P 500 index (daily, Phase 7)
 *   src/data/fred/money-stock.json       — H.6 Money Stock release (--phase2 only)
 *   src/data/fred/wealth-distribution.json — DFA release (--phase2 only)
 *
 * The app imports these JSON files directly — no runtime API calls needed.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { sleep, RATE_LIMIT_DELAY_MS, parseNumericValue, writeJSON, parseCliArgs } from './fetch-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, '../src/data/fred');

// ============================================================
// FRED API V1 — Series Observations
// ============================================================

const FRED_V1_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

interface FREDObservation {
  realtime_start: string;
  realtime_end: string;
  date: string;
  value: string;
}

/**
 * Fetch observations for a single FRED series (V1 API).
 * Uses query parameter authentication.
 */
async function fetchFRED(
  seriesId: string,
  apiKey: string,
  params?: Record<string, string>,
): Promise<FREDObservation[]> {
  const url = new URL(FRED_V1_BASE_URL);
  url.searchParams.set('series_id', seriesId);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('file_type', 'json');
  url.searchParams.set('sort_order', 'desc'); // Most recent first
  url.searchParams.set('limit', '20');        // Last 20 observations

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`FRED V1 API returned ${response.status}: ${response.statusText} for ${seriesId}`);
  }

  const data = await response.json();
  return data.observations as FREDObservation[];
}

// ============================================================
// FRED API V2 — Release Observations
// ============================================================

const FRED_V2_BASE_URL = 'https://api.stlouisfed.org/fred/v2/release/observations';

interface FREDReleaseData {
  count: number;
  offset: number;
  limit: number;
  order_by: string;
  sort_order: string;
  observation_date: string;
  observations: Array<{
    [key: string]: string;
  }>;
}

/**
 * Fetch release observations from FRED V2 API.
 * Uses Bearer token authentication via Authorization header.
 *
 * @param releaseId - FRED release ID (e.g., 21 for H.6 Money Stock)
 * @param apiKey - FRED API key (used as Bearer token)
 */
async function fetchFREDRelease(
  releaseId: number,
  apiKey: string,
): Promise<FREDReleaseData> {
  const url = new URL(FRED_V2_BASE_URL);
  url.searchParams.set('release_id', releaseId.toString());
  url.searchParams.set('format', 'json');

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`FRED V2 API returned ${response.status}: ${response.statusText} for release ${releaseId}`);
  }

  return response.json() as Promise<FREDReleaseData>;
}

// ============================================================
// Fetch 2A: M2 Velocity
// ============================================================

async function fetchM2Velocity(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('💰 Fetching M2 velocity (FRED M2V)...');

  try {
    const observations = await fetchFRED('M2V', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  M2V returned no observations — skipping.');
      return;
    }

    // Filter out "." values (FRED uses "." for missing data)
    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  M2V has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] M2V — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    M2V | ${o.date} = ${o.value}`);
      }
      console.log('');
    }

    const latestVelocity = parseNumericValue(validObs[0].value);

    const output = {
      source: 'FRED M2V (Velocity of M2 Money Stock)',
      seriesOrTable: 'M2V',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      velocity: latestVelocity,
      recentValues: validObs.slice(0, 20).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value),
      })),
      notes: 'Quarterly. Velocity = GDP / M2. Used in Fisher equation (MV=PY). Declining trend since 2000.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'm2-velocity.json'), output);
    console.log(`  Latest M2V: ${latestVelocity} (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ M2V fetch error:', error);
  }
}

// ============================================================
// Fetch 2B: NAIRU (Natural Rate of Unemployment)
// ============================================================

async function fetchNAIRU(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('📉 Fetching NAIRU (FRED NROU)...');

  try {
    // Use observation_end to exclude CBO forward-looking projections.
    // NROU includes quarterly forecasts out to ~2035 — we want only current/past values.
    const today = new Date().toISOString().slice(0, 10);
    const observations = await fetchFRED('NROU', apiKey, {
      observation_end: today,
    });

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  NROU returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  NROU has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] NROU — 5 most recent observations (filtered to dates <= today):');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    NROU | ${o.date} = ${o.value}%`);
      }
      console.log('');
    }

    // NROU comes as percent (e.g., 4.41) — convert to decimal
    const nairuPercent = parseNumericValue(validObs[0].value);
    const nairu = nairuPercent / 100;

    const output = {
      source: 'FRED NROU (CBO Natural Rate of Unemployment, Long-Term)',
      seriesOrTable: 'NROU',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      naturalUnemploymentRate: nairu,
      naturalUnemploymentRatePercent: nairuPercent,
      recentValues: validObs.slice(0, 20).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value) / 100,
      })),
      notes: 'Quarterly from CBO. Long-term natural rate estimate. observation_end filter excludes projections. Used as Phillips curve baseline.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'nairu.json'), output);
    console.log(`  Latest NAIRU: ${nairuPercent}% = ${nairu.toFixed(4)} (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ NAIRU fetch error:', error);
  }
}

// ============================================================
// Fetch 2C: Federal Funds Rate
// ============================================================

async function fetchFedFundsRate(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('🏦 Fetching federal funds rate (FRED FEDFUNDS)...');

  try {
    const observations = await fetchFRED('FEDFUNDS', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  FEDFUNDS returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  FEDFUNDS has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] FEDFUNDS — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    FEDFUNDS | ${o.date} = ${o.value}%`);
      }
      console.log('');
    }

    // FEDFUNDS comes as percent — convert to decimal
    const ratePercent = parseNumericValue(validObs[0].value);
    const rate = ratePercent / 100;

    const output = {
      source: 'FRED FEDFUNDS (Federal Funds Effective Rate)',
      seriesOrTable: 'FEDFUNDS',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      federalFundsRate: rate,
      federalFundsRatePercent: ratePercent,
      recentValues: validObs.slice(0, 12).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value) / 100,
      })),
      notes: 'Monthly. Used in monetary model for interest rate environment.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'fed-funds-rate.json'), output);
    console.log(`  Latest Fed Funds Rate: ${ratePercent}% = ${rate.toFixed(4)} (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ Fed Funds Rate fetch error:', error);
  }
}

// ============================================================
// Fetch 2D: CPS Employment Level (Household Survey)
// ============================================================

async function fetchCPSEmployment(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('👷 Fetching CPS Employment Level (FRED LNS12000000)...');

  try {
    const observations = await fetchFRED('LNS12000000', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  LNS12000000 returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  LNS12000000 has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] LNS12000000 — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    LNS12000000 | ${o.date} = ${o.value} (thousands)`);
      }
      console.log('');
    }

    // LNS12000000 is in thousands (e.g., 163949 = 163,949,000)
    const cpsEmploymentThousands = parseNumericValue(validObs[0].value);
    const cpsEmploymentAbsolute = Math.round(cpsEmploymentThousands * 1000);

    const output = {
      source: 'FRED LNS12000000 (Civilian Employment Level, CPS Household Survey)',
      seriesOrTable: 'LNS12000000',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      cpsEmployment: Math.round(cpsEmploymentThousands),
      cpsEmploymentAbsolute,
      recentValues: validObs.slice(0, 12).map(o => ({
        date: o.date,
        value: Math.round(parseNumericValue(o.value)),
      })),
      notes: 'CPS civilian employment level (thousands, SA). Includes self-employed, agricultural, private household workers — all civilians. Different from CES nonfarm payrolls.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'cps-employment.json'), output);
    console.log(`  Latest CPS Employment: ${cpsEmploymentThousands.toLocaleString()} thousands = ${cpsEmploymentAbsolute.toLocaleString()} (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ CPS Employment fetch error:', error);
  }
}

// ============================================================
// Fetch 2E: CPS Unemployment Level (for validation)
// ============================================================

async function fetchCPSUnemployment(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('📊 Fetching CPS Unemployment Level (FRED LNS13000000)...');

  try {
    const observations = await fetchFRED('LNS13000000', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  LNS13000000 returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  LNS13000000 has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] LNS13000000 — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    LNS13000000 | ${o.date} = ${o.value} (thousands)`);
      }
      console.log('');
    }

    const cpsUnemploymentThousands = parseNumericValue(validObs[0].value);

    const output = {
      source: 'FRED LNS13000000 (Civilian Unemployment Level, CPS)',
      seriesOrTable: 'LNS13000000',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      cpsUnemployment: Math.round(cpsUnemploymentThousands),
      cpsUnemploymentAbsolute: Math.round(cpsUnemploymentThousands * 1000),
      recentValues: validObs.slice(0, 12).map(o => ({
        date: o.date,
        value: Math.round(parseNumericValue(o.value)),
      })),
      notes: 'CPS civilian unemployment level (thousands, SA). Validation series — should equal LaborForce - CPSEmployment.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'cps-unemployment.json'), output);
    console.log(`  Latest CPS Unemployment: ${cpsUnemploymentThousands.toLocaleString()} thousands (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ CPS Unemployment fetch error:', error);
  }
}

// ============================================================
// Fetch 2F: UNRATE (Official Unemployment Rate, for validation)
// ============================================================

async function fetchUNRATE(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('📉 Fetching UNRATE (FRED UNRATE)...');

  try {
    const observations = await fetchFRED('UNRATE', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  UNRATE returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  UNRATE has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] UNRATE — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    UNRATE | ${o.date} = ${o.value}%`);
      }
      console.log('');
    }

    const ratePercent = parseNumericValue(validObs[0].value);
    const rate = ratePercent / 100;

    const output = {
      source: 'FRED UNRATE (Civilian Unemployment Rate)',
      seriesOrTable: 'UNRATE',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      unemploymentRate: rate,
      unemploymentRatePercent: ratePercent,
      recentValues: validObs.slice(0, 12).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value) / 100,
      })),
      notes: 'Monthly. Official BLS unemployment rate from CPS. Used for cross-validation of CPS employment + labor force.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'unrate.json'), output);
    console.log(`  Latest UNRATE: ${ratePercent}% = ${rate.toFixed(4)} (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ UNRATE fetch error:', error);
  }
}

// ============================================================
// Fetch 2G: Mortgage Delinquency Rate (for Phase 5i housing stress)
// ============================================================

async function fetchMortgageDelinquency(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('🏠 Fetching Mortgage Delinquency Rate (FRED DRSFRMACBS)...');

  try {
    const observations = await fetchFRED('DRSFRMACBS', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  DRSFRMACBS returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  DRSFRMACBS has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] DRSFRMACBS — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    DRSFRMACBS | ${o.date} = ${o.value}%`);
      }
      console.log('');
    }

    // DRSFRMACBS comes as percent (e.g., 2.53) — convert to decimal
    const ratePercent = parseNumericValue(validObs[0].value);
    const rate = ratePercent / 100;

    const output = {
      source: 'FRED DRSFRMACBS (Delinquency Rate on Single-Family Residential Mortgages, All Commercial Banks)',
      seriesOrTable: 'DRSFRMACBS',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      mortgageDelinquencyRate: rate,
      mortgageDelinquencyRatePercent: ratePercent,
      recentValues: validObs.slice(0, 20).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value) / 100,
      })),
      notes: 'Quarterly. Delinquency rate on single-family residential mortgages booked in domestic offices. Pre-2008 baseline ~2%, peak 2010 ~11.5%. Used in Phase 5i mortgage stress amplifier to calibrate relationship between unemployment and mortgage defaults. Historical: ~1.8pp delinquency rise per 1pp unemployment rise (Great Recession, but subprime-weighted).',
    };

    writeJSON(path.join(OUTPUT_DIR, 'mortgage-delinquency.json'), output);
    console.log(`  Latest Mortgage Delinquency: ${ratePercent}% = ${rate.toFixed(4)} (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ Mortgage Delinquency fetch error:', error);
  }
}

// ============================================================
// Fetch 2H: 30-Year Fixed Mortgage Rate (for Phase 5i housing)
// ============================================================


// ============================================================
// Fetch E9: PCE weight vector + CPI-PCE differential (E-9 item 2 / Stage-8 deferred bundle)
// ============================================================

async function fetchPCEWeights(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('📐 Fetching PCE component shares + CPI-PCE differential (E-9)...');
  // E-9: nominal PCE components (annual, $B) for the proxy weight vector + the price indices
  // for the data-derived wedge fallback. BEA NIPA via FRED.
  const ids = ['DPCERC1A027NBEA', 'DHUTRC1A027NBEA', 'DHLCRC1A027NBEA', 'DFXARC1A027NBEA', 'DNRGRC1A027NBEA', 'PCEPI', 'CPIAUCSL'];
  const out: Record<string, { latestDate: string; latestValue: number; observations?: Array<{date: string; value: number}> }> = {};
  for (const id of ids) {
    try {
      const obs = await fetchFRED(id, apiKey);
      const valid = (obs ?? []).filter(o => o.value !== '.');
      if (valid.length === 0) { console.error(`  ⚠️  ${id} empty — skipping.`); continue; }
      out[id] = {
        latestDate: valid[0].date,
        latestValue: parseNumericValue(valid[0].value),
        // keep 30 years of the two price indices for the long-run differential
        ...(id === 'PCEPI' || id === 'CPIAUCSL'
          ? { observations: valid.slice(0, 400).map(o => ({ date: o.date, value: parseNumericValue(o.value) })) }
          : {}),
      };
      if (debug) console.log(`  [DEBUG] ${id}: ${valid[0].date} = ${valid[0].value}`);
    } catch (e) { console.error(`  ❌ ${id} fetch error:`, e); }
  }
  writeJSON(path.join(OUTPUT_DIR, 'pce-weights.json'), {
    source: 'BEA NIPA via FRED (nominal PCE components) + PCEPI/CPIAUCSL price indices',
    fetchedAt: new Date().toISOString(),
    series: out,
  });
  console.log('  ✅ pce-weights.json written');
}

async function fetchMortgageRate30yr(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('🏦 Fetching 30-Year Mortgage Rate (FRED MORTGAGE30US)...');

  try {
    const observations = await fetchFRED('MORTGAGE30US', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  MORTGAGE30US returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  MORTGAGE30US has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] MORTGAGE30US — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    MORTGAGE30US | ${o.date} = ${o.value}%`);
      }
      console.log('');
    }

    // MORTGAGE30US is weekly, percent. Compute annual average from last 52 weeks.
    const last52 = validObs.slice(0, 52);
    const annualAvg = last52.reduce((s, o) => s + parseNumericValue(o.value), 0) / last52.length;
    const latestRate = parseNumericValue(validObs[0].value);

    const output = {
      source: 'FRED MORTGAGE30US (Freddie Mac 30-Year Fixed Rate Mortgage Average)',
      seriesOrTable: 'MORTGAGE30US',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      latestValue: latestRate / 100,
      latestValuePercent: latestRate,
      annualAverage: annualAvg / 100,
      annualAveragePercent: annualAvg,
      recentValues: validObs.slice(0, 52).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value) / 100,
      })),
      notes: 'Weekly. Freddie Mac 30-year fixed rate mortgage average. Used in Phase 5i to calibrate credit tightening → mortgage affordability path. Baseline ~6-7% (2024). Higher rates reduce housing demand.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'mortgage-rate-30yr.json'), output);
    console.log(`  Latest 30-Yr Mortgage: ${latestRate}% | Annual Avg: ${annualAvg.toFixed(2)}% (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ 30-Year Mortgage Rate fetch error:', error);
  }
}

// ============================================================
// Fetch 2I: Case-Shiller National Home Price Index (for Phase 5i)
// ============================================================

async function fetchCaseShillerNational(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('🏠 Fetching Case-Shiller National Home Price Index (FRED CSUSHPINSA)...');

  try {
    const observations = await fetchFRED('CSUSHPINSA', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  CSUSHPINSA returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  CSUSHPINSA has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] CSUSHPINSA — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    CSUSHPINSA | ${o.date} = ${o.value}`);
      }
      console.log('');
    }

    const latestValue = parseNumericValue(validObs[0].value);

    // Compute YoY change from 12 months ago
    const twelveMonthsAgo = validObs.length >= 12 ? parseNumericValue(validObs[11].value) : latestValue;
    const yoyChangeRate = (latestValue - twelveMonthsAgo) / twelveMonthsAgo;

    const output = {
      source: 'FRED CSUSHPINSA (S&P Cotality Case-Shiller U.S. National Home Price Index, NSA)',
      seriesOrTable: 'CSUSHPINSA',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      latestValue: latestValue,
      yoyChangeRate: yoyChangeRate,
      yoyChangePercent: yoyChangeRate * 100,
      recentValues: validObs.slice(0, 24).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value),
      })),
      notes: 'Monthly, NSA. National composite home price index (Jan 2000 = 100). Used in Phase 5i as baseline reference for home price modeling. YoY change calibrates normal appreciation rate.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'case-shiller-national.json'), output);
    console.log(`  Latest Case-Shiller: ${latestValue.toFixed(1)} | YoY: ${(yoyChangeRate * 100).toFixed(1)}% (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ Case-Shiller fetch error:', error);
  }
}

// ============================================================
// Fetch 2J: Housing Starts (for Phase 5i construction baseline)
// ============================================================

async function fetchHousingStarts(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('🏗️  Fetching Housing Starts (FRED HOUST)...');

  try {
    const observations = await fetchFRED('HOUST', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  HOUST returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  HOUST has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] HOUST — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    HOUST | ${o.date} = ${o.value} thousands`);
      }
      console.log('');
    }

    // HOUST is thousands of units, SAAR (seasonally adjusted annual rate)
    const latestValue = parseNumericValue(validObs[0].value);

    // Annual average from last 12 months
    const last12 = validObs.slice(0, 12);
    const annualAvg = last12.reduce((s, o) => s + parseNumericValue(o.value), 0) / last12.length;

    const output = {
      source: 'FRED HOUST (New Privately-Owned Housing Units Started, Total)',
      seriesOrTable: 'HOUST',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      latestValue: latestValue,
      latestValueAbsolute: latestValue * 1000,
      annualAverage: annualAvg,
      annualAverageAbsolute: annualAvg * 1000,
      recentValues: validObs.slice(0, 24).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value),
      })),
      notes: 'Monthly, SAAR (thousands of units). Baseline ~1.3-1.5M units/year. Used in Phase 5i as construction sector health indicator. Pre-2008: ~2M, trough 2009: ~0.5M, recovery 2020+: ~1.4M.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'housing-starts.json'), output);
    console.log(`  Latest Housing Starts: ${latestValue.toFixed(0)}K SAAR | Avg: ${annualAvg.toFixed(0)}K (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ Housing Starts fetch error:', error);
  }
}

// ============================================================
// Fetch 2K: CPI Shelter Component (for Phase 5i shelter stickiness)
// ============================================================

async function fetchCPIShelter(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('🏘️  Fetching CPI Shelter (FRED CUSR0000SAH1)...');

  try {
    const observations = await fetchFRED('CUSR0000SAH1', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  CUSR0000SAH1 returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  CUSR0000SAH1 has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] CUSR0000SAH1 — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    CUSR0000SAH1 | ${o.date} = ${o.value}`);
      }
      console.log('');
    }

    const latestValue = parseNumericValue(validObs[0].value);

    // Compute YoY shelter inflation from 12 months ago
    const twelveMonthsAgo = validObs.length >= 12 ? parseNumericValue(validObs[11].value) : latestValue;
    const yoyShelterInflation = (latestValue - twelveMonthsAgo) / twelveMonthsAgo;

    // Compute 5-year average shelter inflation for baseline
    const sixtyMonthsAgo = validObs.length >= 60 ? parseNumericValue(validObs[59].value) : latestValue;
    const fiveYearAvgAnnual = Math.pow(latestValue / sixtyMonthsAgo, 1/5) - 1;

    const output = {
      source: 'FRED CUSR0000SAH1 (CPI-U: Shelter, U.S. City Average, SA)',
      seriesOrTable: 'CUSR0000SAH1',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      latestIndex: latestValue,
      yoyShelterInflation: yoyShelterInflation,
      yoyShelterInflationPercent: yoyShelterInflation * 100,
      fiveYearAvgAnnualInflation: fiveYearAvgAnnual,
      fiveYearAvgAnnualInflationPercent: fiveYearAvgAnnual * 100,
      recentValues: validObs.slice(0, 24).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value),
      })),
      notes: 'Monthly, SA. CPI shelter component (1982-84 = 100). ~36% of CPI-U weight. Used in Phase 5i to calibrate baseline shelter inflation and validate shelter stickiness parameter. 5-year average captures structural shelter inflation rate.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'cpi-shelter.json'), output);
    console.log(`  Latest CPI Shelter: ${latestValue.toFixed(1)} | YoY: ${(yoyShelterInflation * 100).toFixed(1)}% | 5yr avg: ${(fiveYearAvgAnnual * 100).toFixed(1)}% (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ CPI Shelter fetch error:', error);
  }
}

// ============================================================
// Fetch 2L: SLOOS Household Loan Tightening (for Phase 5i dual credit channel)
// ============================================================

async function fetchSLOOSHouseholdTightening(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('🏠 Fetching SLOOS Household Tightening (FRED SUBLPDMHSXWBNQ)...');

  try {
    const observations = await fetchFRED('SUBLPDMHSXWBNQ', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  SUBLPDMHSXWBNQ returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  SUBLPDMHSXWBNQ has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] SUBLPDMHSXWBNQ — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    SUBLPDMHSXWBNQ | ${o.date} = ${o.value}%`);
      }
      console.log('');
    }

    const latestValue = parseNumericValue(validObs[0].value);

    const output = {
      source: 'FRED SUBLPDMHSXWBNQ (SLOOS: Household Loan Tightening, Weighted by Balance)',
      seriesOrTable: 'SUBLPDMHSXWBNQ',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      latestValue: latestValue,
      recentValues: validObs.slice(0, 20).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value),
      })),
      notes: 'Quarterly. Net % of banks tightening household loan standards, weighted by outstanding balances. Positive = tightening, negative = easing. Used in Phase 5i to calibrate and validate household credit channel (UE-driven consumer/mortgage tightening).',
    };

    writeJSON(path.join(OUTPUT_DIR, 'sloos-household-tightening.json'), output);
    console.log(`  Latest SLOOS Household: ${latestValue.toFixed(1)}% (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ SLOOS Household Tightening fetch error:', error);
  }
}

// ============================================================
// Fetch 2M: SLOOS Business Loan Tightening (for Phase 5i dual credit channel)
// ============================================================

async function fetchSLOOSBusinessTightening(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('🏢 Fetching SLOOS Business Tightening (FRED SUBLPDMBSXWBNQ)...');

  try {
    const observations = await fetchFRED('SUBLPDMBSXWBNQ', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  SUBLPDMBSXWBNQ returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  SUBLPDMBSXWBNQ has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] SUBLPDMBSXWBNQ — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    SUBLPDMBSXWBNQ | ${o.date} = ${o.value}%`);
      }
      console.log('');
    }

    const latestValue = parseNumericValue(validObs[0].value);

    const output = {
      source: 'FRED SUBLPDMBSXWBNQ (SLOOS: Business Loan Tightening, Weighted by Balance)',
      seriesOrTable: 'SUBLPDMBSXWBNQ',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      latestValue: latestValue,
      recentValues: validObs.slice(0, 20).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value),
      })),
      notes: 'Quarterly. Net % of banks tightening business loan standards, weighted by outstanding balances. Positive = tightening, negative = easing. Used in Phase 5i to calibrate business credit channel (GDP-driven). In AI scenarios, this may diverge from household tightening.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'sloos-business-tightening.json'), output);
    console.log(`  Latest SLOOS Business: ${latestValue.toFixed(1)}% (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ SLOOS Business Tightening fetch error:', error);
  }
}

async function fetchPhase2Data(apiKey: string): Promise<void> {
  console.log('\n📦 Phase 2: Fetching FRED release data (V2 API)...\n');

  // Release 21: H.6 Money Stock
  console.log('💵 Fetching H.6 Money Stock (Release 21)...');
  try {
    const data = await fetchFREDRelease(21, apiKey);
    const output = {
      source: 'FRED Release 21 (H.6 Money Stock Measures)',
      releaseId: 21,
      fetchedAt: new Date().toISOString(),
      observationCount: data.count,
      data: data.observations?.slice(0, 50) ?? [],
      notes: 'H.6 release includes M1, M2, and components. V2 API with Bearer token auth.',
    };
    writeJSON(path.join(OUTPUT_DIR, 'money-stock.json'), output);
    console.log(`  ✅ Money stock data: ${data.count} observations\n`);
  } catch (error) {
    console.error('  ❌ H.6 Money Stock fetch error:', error);
  }

  await sleep(RATE_LIMIT_DELAY_MS);

  // Release 175: Distributional Financial Accounts
  console.log('📊 Fetching Distributional Financial Accounts (Release 175)...');
  try {
    const data = await fetchFREDRelease(175, apiKey);
    const output = {
      source: 'FRED Release 175 (Distributional Financial Accounts)',
      releaseId: 175,
      fetchedAt: new Date().toISOString(),
      observationCount: data.count,
      data: data.observations?.slice(0, 50) ?? [],
      notes: 'DFA includes wealth distribution by percentile. V2 API with Bearer token auth.',
    };
    writeJSON(path.join(OUTPUT_DIR, 'wealth-distribution.json'), output);
    console.log(`  ✅ Wealth distribution data: ${data.count} observations\n`);
  } catch (error) {
    console.error('  ❌ DFA fetch error:', error);
  }
}

// ============================================================
// Phase 7: Federal Debt (GFDEBTN)
// ============================================================

async function fetchFederalDebt(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('🏛️  Fetching Federal Debt (FRED GFDEBTN)...');

  try {
    const observations = await fetchFRED('GFDEBTN', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  GFDEBTN returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  GFDEBTN has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] GFDEBTN — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    GFDEBTN | ${o.date} = ${o.value}`);
      }
      console.log('');
    }

    // GFDEBTN is in millions of dollars
    const latestMillions = parseNumericValue(validObs[0].value);

    const output = {
      source: 'FRED GFDEBTN (Federal Debt: Total Public Debt)',
      seriesOrTable: 'GFDEBTN',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      debtMillions: latestMillions,
      debtDollars: latestMillions * 1_000_000,
      recentValues: validObs.slice(0, 20).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value),
      })),
      notes: 'Quarterly. Total public debt in millions of dollars. Used as initial federal debt stock for Phase 7 fiscal module.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'federal-debt.json'), output);
    console.log(`  Latest Federal Debt: $${(latestMillions / 1_000_000).toFixed(2)}T (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ GFDEBTN fetch error:', error);
  }
}

// ============================================================
// Phase 7: 10-Year Treasury Yield (DGS10)
// ============================================================

async function fetchTreasury10Yr(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('📊 Fetching 10-Year Treasury Yield (FRED DGS10)...');

  try {
    const observations = await fetchFRED('DGS10', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  DGS10 returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  DGS10 has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] DGS10 — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    DGS10 | ${o.date} = ${o.value}`);
      }
      console.log('');
    }

    const latestYield = parseNumericValue(validObs[0].value);

    const output = {
      source: 'FRED DGS10 (10-Year Treasury Constant Maturity Rate)',
      seriesOrTable: 'DGS10',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      yieldPercent: latestYield,
      yieldDecimal: latestYield / 100,
      recentValues: validObs.slice(0, 20).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value),
      })),
      notes: 'Daily (business days). 10-year constant maturity Treasury yield in percent. Used as initial 10Y yield for Phase 7 bond market module.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'treasury-10yr.json'), output);
    console.log(`  Latest 10Y Yield: ${latestYield}% (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ DGS10 fetch error:', error);
  }
}

// ============================================================
// Phase 7: Federal Receipts % GDP (FYFRGDA188S)
// ============================================================

async function fetchFederalReceiptsGDP(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('📈 Fetching Federal Receipts % GDP (FRED FYFRGDA188S)...');

  try {
    const observations = await fetchFRED('FYFRGDA188S', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  FYFRGDA188S returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  FYFRGDA188S has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] FYFRGDA188S — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    FYFRGDA188S | ${o.date} = ${o.value}`);
      }
      console.log('');
    }

    const latestPct = parseNumericValue(validObs[0].value);

    const output = {
      source: 'FRED FYFRGDA188S (Federal Receipts as Percent of GDP)',
      seriesOrTable: 'FYFRGDA188S',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      receiptsGDPPercent: latestPct,
      receiptsGDPDecimal: latestPct / 100,
      recentValues: validObs.slice(0, 20).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value),
      })),
      notes: 'Annual. Federal receipts as percent of GDP. Used to validate endogenous revenue computation in Phase 7.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'federal-receipts-gdp.json'), output);
    console.log(`  Latest Receipts/GDP: ${latestPct}% (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ FYFRGDA188S fetch error:', error);
  }
}

// ============================================================
// Phase 7: Federal Surplus/Deficit % GDP (FYFSGDA188S)
// ============================================================

async function fetchFederalDeficitGDP(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('📉 Fetching Federal Deficit % GDP (FRED FYFSGDA188S)...');

  try {
    const observations = await fetchFRED('FYFSGDA188S', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  FYFSGDA188S returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  FYFSGDA188S has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] FYFSGDA188S — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    FYFSGDA188S | ${o.date} = ${o.value}`);
      }
      console.log('');
    }

    // Negative = deficit, positive = surplus. Store as positive deficit ratio.
    const latestPct = parseNumericValue(validObs[0].value);

    const output = {
      source: 'FRED FYFSGDA188S (Federal Surplus or Deficit as Percent of GDP)',
      seriesOrTable: 'FYFSGDA188S',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      surplusDeficitGDPPercent: latestPct,
      deficitGDPRatioPositive: Math.abs(latestPct) / 100,
      recentValues: validObs.slice(0, 20).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value),
      })),
      notes: 'Annual. Federal surplus (+) or deficit (-) as percent of GDP. Stored as positive deficit ratio for Phase 7 fiscal module.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'federal-deficit-gdp.json'), output);
    console.log(`  Latest Deficit/GDP: ${latestPct}% → deficit ratio ${(Math.abs(latestPct) / 100).toFixed(3)} (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ FYFSGDA188S fetch error:', error);
  }
}

// ============================================================
// Phase 7: BBB Corporate Bond Spread (BAMLC0A4CBBB)
// ============================================================

async function fetchBBBCorporateSpread(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('💼 Fetching BBB Corporate Bond Spread (FRED BAMLC0A4CBBB)...');

  try {
    const observations = await fetchFRED('BAMLC0A4CBBB', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  BAMLC0A4CBBB returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  BAMLC0A4CBBB has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] BAMLC0A4CBBB — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    BAMLC0A4CBBB | ${o.date} = ${o.value}`);
      }
      console.log('');
    }

    const latestSpread = parseNumericValue(validObs[0].value);

    const output = {
      source: 'FRED BAMLC0A4CBBB (ICE BofA BBB US Corporate Index Option-Adjusted Spread)',
      seriesOrTable: 'BAMLC0A4CBBB',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      spreadPercent: latestSpread,
      spreadDecimal: latestSpread / 100,
      recentValues: validObs.slice(0, 20).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value),
      })),
      notes: 'Daily. BBB corporate bond option-adjusted spread in percent. Used as base corporate credit spread for Phase 7 bond market.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'bbb-corporate-spread.json'), output);
    console.log(`  Latest BBB Spread: ${latestSpread}% (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ BAMLC0A4CBBB fetch error:', error);
  }
}

// ============================================================
// Phase 7: Federal Interest Outlays (FYOINT)
// ============================================================

async function fetchFederalInterestOutlays(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('💰 Fetching Federal Interest Outlays (FRED FYOINT)...');

  try {
    const observations = await fetchFRED('FYOINT', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  FYOINT returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  FYOINT has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] FYOINT — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    FYOINT | ${o.date} = ${o.value}`);
      }
      console.log('');
    }

    // FYOINT is in millions of dollars
    const latestMillions = parseNumericValue(validObs[0].value);

    const output = {
      source: 'FRED FYOINT (Federal Government Current Expenditures: Interest Payments)',
      seriesOrTable: 'FYOINT',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      interestOutlaysMillions: latestMillions,
      interestOutlaysDollars: latestMillions * 1_000_000,
      recentValues: validObs.slice(0, 20).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value),
      })),
      notes: 'Annual. Federal interest payments in millions. Used to validate Phase 7 interest expense computation.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'federal-interest-outlays.json'), output);
    console.log(`  Latest Interest Outlays: $${(latestMillions / 1_000_000).toFixed(2)}T (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ FYOINT fetch error:', error);
  }
}

// ============================================================
// Phase 7: Corporate Profits After Tax (CP)
// ============================================================

async function fetchCorporateProfits(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('🏢 Fetching Corporate Profits (FRED CP)...');

  try {
    const observations = await fetchFRED('CP', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  CP returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  CP has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] CP — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    CP | ${o.date} = ${o.value}`);
      }
      console.log('');
    }

    // CP is quarterly, in billions of dollars (SAAR — seasonally adjusted annual rate)
    const latestBillions = parseNumericValue(validObs[0].value);

    const output = {
      source: 'FRED CP (Corporate Profits After Tax)',
      seriesOrTable: 'CP',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      profitsBillions: latestBillions,
      profitsDollars: latestBillions * 1_000_000_000,
      recentValues: validObs.slice(0, 20).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value),
      })),
      notes: 'Quarterly (SAAR). Corporate profits after tax in billions. Used as baseline corporate profits for Phase 7 equity module.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'corporate-profits.json'), output);
    console.log(`  Latest Corporate Profits: $${latestBillions.toFixed(1)}B (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ CP fetch error:', error);
  }
}

// ============================================================
// Phase 7: Federal Corporate Tax Receipts (FCTAX)
// ============================================================

async function fetchCorporateTaxReceipts(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('🧾 Fetching Corporate Tax Receipts (FRED FCTAX)...');

  try {
    const observations = await fetchFRED('FCTAX', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  FCTAX returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  FCTAX has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] FCTAX — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    FCTAX | ${o.date} = ${o.value}`);
      }
      console.log('');
    }

    // FS-6f UNIT CORRECTION: FRED FCTAX is denominated in BILLIONS of dollars (the prior
    // label said millions and the derived dollars field was 1000× too small — found when
    // the loader's silent fallbacks were retired). The raw value is kept verbatim under
    // the corrected name; the loader reads billions.
    const latestBillions = parseNumericValue(validObs[0].value);

    const output = {
      source: 'FRED FCTAX (Federal Government Tax Receipts on Corporate Income)',
      seriesOrTable: 'FCTAX',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      receiptsBillions: latestBillions,
      receiptsDollars: latestBillions * 1_000_000_000,
      recentValues: validObs.slice(0, 20).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value),
      })),
      notes: 'Annual. Federal corporate tax receipts in BILLIONS (FRED FCTAX native units). Used to validate effective corporate tax rate in Phase 7.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'corporate-tax-receipts.json'), output);
    console.log(`  Latest Corporate Tax: $${latestBillions.toFixed(1)}B (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ FCTAX fetch error:', error);
  }
}

// ============================================================
// Phase 7: S&P 500 (SP500)
// ============================================================

async function fetchSP500(apiKey: string, debug: boolean = false): Promise<void> {
  console.log('📈 Fetching S&P 500 (FRED SP500)...');

  try {
    const observations = await fetchFRED('SP500', apiKey);

    if (!observations || observations.length === 0) {
      console.error('  ⚠️  SP500 returned no observations — skipping.');
      return;
    }

    const validObs = observations.filter(o => o.value !== '.');
    if (validObs.length === 0) {
      console.error('  ⚠️  SP500 has no valid observations — skipping.');
      return;
    }

    if (debug) {
      console.log('  [DEBUG] SP500 — 5 most recent observations:');
      for (const o of validObs.slice(0, 5)) {
        console.log(`    SP500 | ${o.date} = ${o.value}`);
      }
      console.log('');
    }

    const latestLevel = parseNumericValue(validObs[0].value);

    const output = {
      source: 'FRED SP500 (S&P 500 Index)',
      seriesOrTable: 'SP500',
      fetchedAt: new Date().toISOString(),
      latestDate: validObs[0].date,
      sp500Level: latestLevel,
      recentValues: validObs.slice(0, 20).map(o => ({
        date: o.date,
        value: parseNumericValue(o.value),
      })),
      notes: 'Daily (business days). S&P 500 index level. Used as baseline market validation for Phase 7 equity module.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'sp500.json'), output);
    console.log(`  Latest S&P 500: ${latestLevel.toFixed(2)} (${validObs[0].date})\n`);
  } catch (error) {
    console.error('  ❌ SP500 fetch error:', error);
  }
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('🚀 ATLAS FRED Data Fetch');
  console.log('========================\n');

  const { apiKey, flags } = parseCliArgs('FRED_API_KEY');
  const phase2 = flags.has('--phase2');
  const debug = flags.has('--debug');

  if (!apiKey) {
    console.error('❌ No FRED API key provided.');
    console.error('   Usage: npx tsx scripts/fetch-fred-data.ts --key YOUR_API_KEY');
    console.error('   Or:    FRED_API_KEY=YOUR_KEY npx tsx scripts/fetch-fred-data.ts');
    console.error('   Flags: --phase2  Also fetch V2 release data (Money Stock, Wealth Distribution)');
    console.error('          --debug   Print raw API data for verification');
    console.error('\n   Get a free key at: https://fred.stlouisfed.org/docs/api/api_key.html');
    process.exit(1);
  }

  // ---- Phase 1: V1 series observations ----
  await fetchM2Velocity(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  await fetchNAIRU(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  await fetchFedFundsRate(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  // ---- CPS Labor Market Series (for CPS/CES survey bridging) ----
  await fetchCPSEmployment(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  await fetchCPSUnemployment(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  await fetchUNRATE(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  await fetchMortgageDelinquency(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  // ---- Phase 5i: Housing & Shelter Data ----
  await fetchMortgageRate30yr(apiKey, debug);
  await fetchPCEWeights(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  await fetchCaseShillerNational(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  await fetchHousingStarts(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  await fetchCPIShelter(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  // ---- Phase 5i: SLOOS Dual Credit Channel Data ----
  await fetchSLOOSHouseholdTightening(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  await fetchSLOOSBusinessTightening(apiKey, debug);

  // ---- Phase 7: Fiscal-Monetary Data ----
  await sleep(RATE_LIMIT_DELAY_MS);
  await fetchFederalDebt(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  await fetchTreasury10Yr(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  await fetchFederalReceiptsGDP(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  await fetchFederalDeficitGDP(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  await fetchBBBCorporateSpread(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  await fetchFederalInterestOutlays(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  await fetchCorporateProfits(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  await fetchCorporateTaxReceipts(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  await fetchSP500(apiKey, debug);

  // Cross-validate CPS series consistency
  try {
    const cpsEmpData = JSON.parse(
      (await import('fs')).readFileSync(path.join(OUTPUT_DIR, 'cps-employment.json'), 'utf-8'),
    );
    const unrateData = JSON.parse(
      (await import('fs')).readFileSync(path.join(OUTPUT_DIR, 'unrate.json'), 'utf-8'),
    );
    const lfData = JSON.parse(
      (await import('fs')).readFileSync(path.join(OUTPUT_DIR, '../bls/labor-force.json'), 'utf-8'),
    );

    const cpsEmp = cpsEmpData.cpsEmployment; // thousands
    const lf = lfData.latestMonthly?.value;   // thousands
    const unrate = unrateData.unemploymentRate; // decimal

    if (cpsEmp && lf && unrate) {
      const derivedUERate = 1 - (cpsEmp / lf);
      const gap = Math.abs(derivedUERate - unrate);
      console.log('\n  [VALIDATION] CPS cross-check:');
      console.log(`    CPS Employment: ${cpsEmp.toLocaleString()} thousands`);
      console.log(`    Labor Force:    ${lf.toLocaleString()} thousands`);
      console.log(`    Derived UE:     ${(derivedUERate * 100).toFixed(2)}%`);
      console.log(`    UNRATE:         ${(unrate * 100).toFixed(2)}%`);
      console.log(`    Gap:            ${(gap * 100).toFixed(3)}pp`);
      if (gap < 0.005) {
        console.log('    ✅ CPS series are internally consistent.\n');
      } else {
        console.log('    ⚠️  Gap exceeds 0.5pp — check data freshness.\n');
      }
    }
  } catch {
    // Cross-validation is best-effort; skip if files not available
  }

  // ---- Phase 2: V2 release observations (optional) ----
  if (phase2) {
    await sleep(RATE_LIMIT_DELAY_MS);
    await fetchPhase2Data(apiKey);
  }

  console.log('========================');
  console.log('🎉 FRED data fetch complete!');
  console.log(`   Output directory: ${OUTPUT_DIR}`);
  if (phase2) {
    console.log('   Phase 2 data also fetched.');
  }
  console.log('');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});