/**
 * ATLAS — BEA Data Fetch Script
 *
 * Fetches GDP, income composition, price indices, government spending,
 * industry GDP, and state-level data from the Bureau of Economic Analysis API.
 *
 * Usage:
 *   npx tsx scripts/fetch-bea-data.ts --key YOUR_BEA_API_KEY
 *   BEA_API_KEY=YOUR_KEY npx tsx scripts/fetch-bea-data.ts
 *   npx tsx scripts/fetch-bea-data.ts --key YOUR_KEY --skip-state
 *
 * Output files (src/data/bea/):
 *   gdp-components.json        — GDP nominal + C/I/G/NX ratios (NIPA Table 1.1.5)
 *   personal-income.json       — Wage/asset/transfer income shares (NIPA Table 2.1)
 *   price-indices.json         — GDP deflator (NIPA Table 1.1.4)
 *   government-spending.json   — Federal + state/local spending (NIPA Table 3.1)
 *   industry-gdp.json          — GDP by industry sector (GDPbyIndustry)
 *   input-output-multipliers.json — TODO placeholder (InputOutput API is complex)
 *   state-gdp.json             — Per-state GDP (Regional SAGDP2N) [--skip-state skips]
 *   state-income.json          — Per-state personal income (Regional SAINC1) [--skip-state skips]
 *   state-price-parities.json  — Regional price parities (Regional SARPP) [--skip-state skips]
 *
 * DATA STRATEGY:
 *   NIPA tables use quarterly SAAR (Frequency=Q, Q4 2025 preferred, Q3 fallback).
 *   SAAR values are already annualized — do NOT divide by 4.
 *   GDPbyIndustry tries quarterly 2025, falls back to annual 2024.
 *   Regional tables use Year=2024 (longer publication lag).
 *   If no data available, file is NOT written and model falls back to constants.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import {
  sleep,
  RATE_LIMIT_DELAY_MS,
  parseNumericValue,
  writeJSON,
  validateRatioSum,
  parseCliArgs,
} from './fetch-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, '../src/data/bea');

// ============================================================
// BEA API Client
// ============================================================

const BEA_BASE_URL = 'https://apps.bea.gov/api/data/';

interface BEADataRow {
  TableName: string;
  SeriesCode: string;
  LineNumber: string;
  LineDescription: string;
  TimePeriod: string;
  METRIC_NAME: string;
  CL_UNIT: string;
  UNIT_MULT: string;
  DataValue: string;
  NoteRef?: string;
  [key: string]: string | undefined;
}

interface BEAApiResponse {
  BEAAPI: {
    Request: Record<string, string>;
    Results: {
      Statistic?: string;
      UTCProductionTime?: string;
      Dimensions?: Array<{ Name: string; DataType: string; IsValue: string }>;
      Data?: BEADataRow[];
      Notes?: Array<{ NoteRef: string; NoteText: string }>;
      Error?: { APIErrorCode: string; APIErrorDescription: string };
    };
  };
}

/**
 * Fetch data from the BEA API.
 * Logs the request URL (key redacted) on errors for debugging.
 */
async function fetchBEA(
  params: Record<string, string>,
  apiKey: string,
): Promise<BEADataRow[] | null> {
  const url = new URL(BEA_BASE_URL);
  url.searchParams.set('UserID', apiKey);
  url.searchParams.set('method', 'GetData');
  url.searchParams.set('ResultFormat', 'JSON');

  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const redactedUrl = url.toString().replace(apiKey, 'REDACTED');

  const response = await fetch(url.toString());
  if (!response.ok) {
    console.error(`  Request URL: ${redactedUrl}`);
    throw new Error(`BEA API returned ${response.status}: ${response.statusText}`);
  }

  const json = await response.json() as BEAApiResponse;

  // Check for API errors
  if (json.BEAAPI?.Results?.Error) {
    const err = json.BEAAPI.Results.Error;
    console.error(`  Request URL: ${redactedUrl}`);
    throw new Error(`BEA API Error ${err.APIErrorCode}: ${err.APIErrorDescription}`);
  }

  const data = json.BEAAPI?.Results?.Data;
  if (!data || data.length === 0) {
    return null; // No data for requested params
  }

  return data;
}

/**
 * Check if data has valid 2025 entries. Returns false if all values are (NA) or missing.
 */
function has2025Data(data: BEADataRow[]): boolean {
  return data.some(row => {
    const val = parseNumericValue(row.DataValue);
    return !isNaN(val);
  });
}

/**
 * Extract rows for a specific quarter from quarterly BEA data.
 * Tries Q4 first (advance estimate), falls back to Q3 (final estimate).
 * Returns { rows, quarter, estimateType } or null if neither quarter has valid data.
 *
 * BEA quarterly TimePeriod format: '2025Q1', '2025Q2', etc.
 * SAAR values are already annualized — use directly, do NOT divide by 4.
 */
function extractQuarterRows(
  data: BEADataRow[],
  preferredQuarter: string = '2025Q4',
  fallbackQuarter: string = '2025Q3',
): { rows: BEADataRow[]; quarter: string; estimateType: string } | null {
  // Try preferred quarter (Q4 2025 = advance estimate)
  const q4Rows = data.filter(r => r.TimePeriod === preferredQuarter);
  if (q4Rows.length > 0 && q4Rows.some(r => !isNaN(parseNumericValue(r.DataValue)))) {
    console.log(`  Using ${preferredQuarter} (advance estimate). SAAR — values are annualized.`);
    return { rows: q4Rows, quarter: 'Q4', estimateType: 'advance' };
  }

  // Fall back to Q3 (final estimate)
  const q3Rows = data.filter(r => r.TimePeriod === fallbackQuarter);
  if (q3Rows.length > 0 && q3Rows.some(r => !isNaN(parseNumericValue(r.DataValue)))) {
    console.log(`  ⚠️  ${preferredQuarter} not available. Using ${fallbackQuarter} (final estimate).`);
    return { rows: q3Rows, quarter: 'Q3', estimateType: 'final' };
  }

  return null;
}

/**
 * Debug: print all rows from a BEA quarterly result for inspection.
 */
function debugDumpRows(tableName: string, rows: BEADataRow[]): void {
  console.log(`\n  [DEBUG] ${tableName} — ${rows.length} rows for selected quarter:`);
  console.log(`  ${'Line'.padStart(4)}  ${'SeriesCode'.padEnd(20)}  ${'Value'.padStart(14)}  Description`);
  console.log(`  ${'-'.repeat(80)}`);
  const sorted = [...rows].sort((a, b) => {
    const aNum = parseInt(a.LineNumber, 10) || 0;
    const bNum = parseInt(b.LineNumber, 10) || 0;
    return aNum - bNum;
  });
  for (const r of sorted) {
    console.log(`  ${(r.LineNumber ?? '?').padStart(4)}  ${(r.SeriesCode ?? '').padEnd(20)}  ${(r.DataValue ?? '').padStart(14)}  ${r.LineDescription ?? ''}`);
  }
  // Show UNIT_MULT from first row
  if (rows.length > 0) {
    console.log(`\n  UNIT_MULT: ${rows[0]!.UNIT_MULT ?? '?'} (10^N = values are in that unit)`);
    console.log(`  CL_UNIT: ${rows[0]!.CL_UNIT ?? '?'}`);
    console.log(`  METRIC_NAME: ${rows[0]!.METRIC_NAME ?? '?'}`);
  }
  console.log('');
}

/**
 * Get the value multiplier from BEA UNIT_MULT field.
 * UNIT_MULT=6 means values are in millions (10^6).
 * UNIT_MULT=9 means values are in billions (10^9).
 * Returns the multiplier to convert values to absolute dollars.
 */
function getUnitMultiplier(rows: BEADataRow[]): number {
  const unitMult = parseInt(rows[0]?.UNIT_MULT ?? '6', 10);
  return Math.pow(10, unitMult);
}

// ============================================================
// Fetch 1A: GDP Components (NIPA Table 1.1.5)
// ============================================================

async function fetchGDPComponents(apiKey: string, debug: boolean): Promise<void> {
  console.log('📊 Fetching GDP Components (NIPA Table 1.1.5, Quarterly SAAR)...');

  try {
    const data = await fetchBEA({
      DataSetName: 'NIPA',
      TableName: 'T10105',
      Frequency: 'Q',
      Year: '2025',
    }, apiKey);

    if (!data || !has2025Data(data)) {
      console.log('  ⚠️  NIPA Table 1.1.5 has no 2025 quarterly data — skipping. Hardcoded fallback will be used.');
      return;
    }

    // Extract the best available quarter (Q4 preferred, Q3 fallback)
    const quarter = extractQuarterRows(data);
    if (!quarter) {
      console.log('  ⚠️  No Q4 or Q3 2025 data available — skipping. Hardcoded fallback will be used.');
      return;
    }

    if (debug) debugDumpRows('T10105 (GDP Components)', quarter.rows);

    // SAAR values are already annualized — do NOT divide by 4.
    // UNIT_MULT tells us the unit: 6 = millions, 9 = billions.
    const unitMultiplier = getUnitMultiplier(quarter.rows);
    const toBillions = unitMultiplier / 1e9; // Convert raw value to billions

    const lineMap = new Map<string, { description: string; value: number }>();
    for (const row of quarter.rows) {
      const val = parseNumericValue(row.DataValue);
      if (!isNaN(val)) {
        lineMap.set(row.LineNumber, {
          description: row.LineDescription,
          value: val,
        });
      }
    }

    const gdpLine = lineMap.get('1');
    if (!gdpLine) {
      console.log('  ⚠️  GDP line (Line 1) not found — skipping.');
      return;
    }

    // Convert from raw units to billions and absolute dollars
    const gdpRaw = gdpLine.value;
    const gdpBillions = gdpRaw * toBillions;
    const gdpNominal = gdpRaw * unitMultiplier;

    // Quarterly line numbers (verified against BEA API Q3 2025):
    //   Line 1  = Gross domestic product (GDP total)
    //   Line 2  = Personal consumption expenditures (C)
    //   Line 7  = Gross private domestic investment (I)
    //   Line 15 = Net exports of goods and services (NX)
    //   Line 22 = Government consumption expenditures and gross investment (G)
    // NOTE: Line 24 = "National defense" (a sub-item of G), NOT net exports!
    const consumption = lineMap.get('2')?.value ?? 0;
    const investment = lineMap.get('7')?.value ?? 0;
    const netExports = lineMap.get('15')?.value ?? 0;
    const government = lineMap.get('22')?.value ?? 0;

    const ratios: Record<string, number> = {
      consumptionRatio: consumption / gdpRaw,
      investmentRatio: investment / gdpRaw,
      governmentRatio: government / gdpRaw,
      netExportRatio: netExports / gdpRaw,
    };

    // Validate ratios sum to ~1.0 (BEA identity: GDP = C + I + G + NX)
    try {
      validateRatioSum(ratios, 1.0, 0.02, 'GDP component ratios (C+I+G+NX)');
    } catch (err) {
      console.error(`  ❌ ${(err as Error).message} — skipping file write.`);
      return;
    }

    const output = {
      source: 'BEA NIPA Table 1.1.5 (Gross Domestic Product)',
      seriesOrTable: 'NIPA T10105',
      fetchedAt: new Date().toISOString(),
      dataYear: 2025,
      dataQuarter: quarter.quarter,
      estimateType: quarter.estimateType,
      gdpNominal,
      gdpBillions,
      ...ratios,
      components: Object.fromEntries(
        [...lineMap.entries()].map(([line, { description, value }]) => [
          line, { description, valueBillions: value * toBillions }
        ])
      ),
      notes: `${quarter.quarter} 2025 ${quarter.estimateType} SAAR. Values in billions of current dollars. Ratios computed as component/GDP. Will be revised in subsequent BEA releases. Replace with annual data when available (~mid-2026).`,
    };

    writeJSON(path.join(OUTPUT_DIR, 'gdp-components.json'), output);
    console.log(`  GDP: $${(gdpNominal / 1e12).toFixed(1)}T | C: ${(ratios.consumptionRatio * 100).toFixed(1)}% I: ${(ratios.investmentRatio * 100).toFixed(1)}% G: ${(ratios.governmentRatio * 100).toFixed(1)}% NX: ${(ratios.netExportRatio * 100).toFixed(1)}%\n`);
  } catch (error) {
    console.error('  ❌ GDP Components fetch error:', error);
  }
}

// ============================================================
// Fetch 1B: Personal Income Composition (NIPA Table 2.1)
// ============================================================

async function fetchPersonalIncome(apiKey: string, debug: boolean): Promise<void> {
  console.log('💵 Fetching Personal Income Composition (NIPA Table 2.1, Quarterly SAAR)...');

  try {
    const data = await fetchBEA({
      DataSetName: 'NIPA',
      TableName: 'T20100',
      Frequency: 'Q',
      Year: '2025',
    }, apiKey);

    if (!data || !has2025Data(data)) {
      console.log('  ⚠️  NIPA Table 2.1 has no 2025 quarterly data — skipping. Hardcoded fallback will be used.');
      return;
    }

    const quarter = extractQuarterRows(data);
    if (!quarter) {
      console.log('  ⚠️  No Q4 or Q3 2025 data available — skipping. Hardcoded fallback will be used.');
      return;
    }

    if (debug) debugDumpRows('T20100 (Personal Income)', quarter.rows);

    const unitMultiplier = getUnitMultiplier(quarter.rows);
    const toBillions = unitMultiplier / 1e9;

    const lineMap = new Map<string, { description: string; value: number }>();
    for (const row of quarter.rows) {
      const val = parseNumericValue(row.DataValue);
      if (!isNaN(val)) {
        lineMap.set(row.LineNumber, {
          description: row.LineDescription,
          value: val,
        });
      }
    }

    // Quarterly line numbers (verified against BEA API Q3 2025):
    //   Line 1  = Personal income (total)
    //   Line 2  = Compensation of employees (wages + supplements)
    //   Line 16 = Personal current transfer receipts (full category)
    // NOTE: Line 3 = "Wages and salaries" (sub-item of Line 2, missing supplements)
    // NOTE: Line 17 = "Gov social benefits to persons" (sub-item of Line 16)
    //
    // Asset share is computed as residual: PI - Compensation - Transfers.
    // This guarantees shares sum to 1.0 and includes proprietors' income,
    // rental income, interest, dividends, minus social insurance contributions.
    const totalIncome = lineMap.get('1')?.value;
    const compensation = lineMap.get('2')?.value;
    const transferReceipts = lineMap.get('16')?.value;

    if (!totalIncome || !compensation) {
      console.log('  ⚠️  Key income lines (1, 2) not found — skipping.');
      return;
    }

    const transfers = transferReceipts ?? 0;
    const assetResidual = totalIncome - compensation - transfers;

    const shares: Record<string, number> = {
      wageShare: compensation / totalIncome,
      assetShare: assetResidual / totalIncome,
      transferShare: transfers / totalIncome,
    };

    // Validate shares sum to ~1.0 (guaranteed by residual construction, but verify)
    try {
      validateRatioSum(shares, 1.0, 0.01, 'Income shares (wage+asset+transfer)');
    } catch (err) {
      console.error(`  ❌ ${(err as Error).message} — skipping file write.`);
      return;
    }

    const totalBillions = totalIncome * toBillions;

    const output = {
      source: 'BEA NIPA Table 2.1 (Personal Income and Its Disposition)',
      seriesOrTable: 'NIPA T20100',
      fetchedAt: new Date().toISOString(),
      dataYear: 2025,
      dataQuarter: quarter.quarter,
      estimateType: quarter.estimateType,
      personalIncomeBillions: totalBillions,
      ...shares,
      componentsBillions: {
        compensation: compensation * toBillions,
        assetIncome: assetResidual * toBillions,
        transferReceipts: transfers * toBillions,
      },
      allLines: Object.fromEntries(
        [...lineMap.entries()].map(([line, { description, value }]) => [
          line, { description, valueBillions: value * toBillions }
        ])
      ),
      notes: `${quarter.quarter} 2025 ${quarter.estimateType} SAAR. Shares: wageShare=Compensation(L2)/PI, transferShare=Transfers(L16)/PI, assetShare=residual (includes proprietors', rental, interest, dividends, net of contributions). Will be revised. Replace with annual data when available (~mid-2026).`,
    };

    writeJSON(path.join(OUTPUT_DIR, 'personal-income.json'), output);
    console.log(`  Personal Income: $${(totalBillions / 1000).toFixed(1)}T | Wage: ${(shares.wageShare * 100).toFixed(1)}% Asset: ${(shares.assetShare * 100).toFixed(1)}% Transfer: ${(shares.transferShare * 100).toFixed(1)}%\n`);
  } catch (error) {
    console.error('  ❌ Personal Income fetch error:', error);
  }
}

// ============================================================
// Fetch 1C: Price Indices / GDP Deflator (NIPA Table 1.1.4)
// ============================================================

async function fetchPriceIndices(apiKey: string, debug: boolean): Promise<void> {
  console.log('📈 Fetching GDP Price Indices (NIPA Table 1.1.4, Quarterly SAAR)...');

  try {
    const data = await fetchBEA({
      DataSetName: 'NIPA',
      TableName: 'T10104',
      Frequency: 'Q',
      Year: '2025',
    }, apiKey);

    if (!data || !has2025Data(data)) {
      console.log('  ⚠️  NIPA Table 1.1.4 has no 2025 quarterly data — skipping. Hardcoded fallback will be used.');
      return;
    }

    const quarter = extractQuarterRows(data);
    if (!quarter) {
      console.log('  ⚠️  No Q4 or Q3 2025 data available — skipping. Hardcoded fallback will be used.');
      return;
    }

    if (debug) debugDumpRows('T10104 (Price Indices)', quarter.rows);

    const lineMap = new Map<string, { description: string; value: number }>();
    for (const row of quarter.rows) {
      const val = parseNumericValue(row.DataValue);
      if (!isNaN(val)) {
        lineMap.set(row.LineNumber, {
          description: row.LineDescription,
          value: val,
        });
      }
    }

    // Line 1 = GDP implicit price deflator (2017=100)
    const deflator = lineMap.get('1');
    if (!deflator) {
      console.log('  ⚠️  GDP deflator (Line 1) not found — skipping.');
      return;
    }

    const output = {
      source: 'BEA NIPA Table 1.1.4 (Price Indexes for Gross Domestic Product)',
      seriesOrTable: 'NIPA T10104',
      fetchedAt: new Date().toISOString(),
      dataYear: 2025,
      dataQuarter: quarter.quarter,
      estimateType: quarter.estimateType,
      gdpDeflator: deflator.value,
      baseYear: 2017,
      allIndices: Object.fromEntries(
        [...lineMap.entries()].map(([line, { description, value }]) => [
          line, { description, index: value }
        ])
      ),
      notes: `${quarter.quarter} 2025 ${quarter.estimateType} SAAR. Price index with base year 2017=100. Used for nominal→real conversion. Will be revised in subsequent BEA releases.`,
    };

    writeJSON(path.join(OUTPUT_DIR, 'price-indices.json'), output);
    console.log(`  GDP Deflator: ${deflator.value} (2017=100)\n`);
  } catch (error) {
    console.error('  ❌ Price Indices fetch error:', error);
  }
}

// ============================================================
// Fetch 1D: Government Spending (NIPA Table 3.1)
// ============================================================

async function fetchGovernmentSpending(apiKey: string, debug: boolean): Promise<void> {
  console.log('🏛️  Fetching Government Spending (NIPA Table 3.1, Quarterly SAAR)...');

  try {
    const data = await fetchBEA({
      DataSetName: 'NIPA',
      TableName: 'T30100',
      Frequency: 'Q',
      Year: '2025',
    }, apiKey);

    if (!data || !has2025Data(data)) {
      console.log('  ⚠️  NIPA Table 3.1 has no 2025 quarterly data — skipping. Hardcoded fallback will be used.');
      return;
    }

    const quarter = extractQuarterRows(data);
    if (!quarter) {
      console.log('  ⚠️  No Q4 or Q3 2025 data available — skipping. Hardcoded fallback will be used.');
      return;
    }

    if (debug) debugDumpRows('T30100 (Government Spending)', quarter.rows);

    const unitMultiplier = getUnitMultiplier(quarter.rows);
    const toBillions = unitMultiplier / 1e9;

    const lineMap = new Map<string, { description: string; value: number }>();
    for (const row of quarter.rows) {
      const val = parseNumericValue(row.DataValue);
      if (!isNaN(val)) {
        lineMap.set(row.LineNumber, {
          description: row.LineDescription,
          value: val,
        });
      }
    }

    // Quarterly Table 3.1 line numbers (verified against BEA API Q3 2025):
    //   Line 1  = Current receipts (NOT spending!)
    //   Line 20 = Current expenditures (includes transfers + interest — NOT G-in-GDP)
    //   Line 21 = Consumption expenditures (part of G-in-GDP)
    //   Line 39 = Gross government investment (part of G-in-GDP)
    // G-in-GDP = Line 21 + Line 39 (matches T10105 Line 22)
    // NOTE: Line 22 = "Current transfer payments" in quarterly T30100, NOT state/local!
    const consumptionExp = lineMap.get('21')?.value ?? 0;
    const grossInvestment = lineMap.get('39')?.value ?? 0;
    const totalG = consumptionExp + grossInvestment;
    const totalExpenditure = lineMap.get('37')?.value ?? lineMap.get('20')?.value ?? 0;

    const output = {
      source: 'BEA NIPA Table 3.1 (Government Current Receipts and Expenditures)',
      seriesOrTable: 'NIPA T30100',
      fetchedAt: new Date().toISOString(),
      dataYear: 2025,
      dataQuarter: quarter.quarter,
      estimateType: quarter.estimateType,
      totalGInGDP_Billions: totalG * toBillions,
      consumptionExpendituresBillions: consumptionExp * toBillions,
      grossInvestmentBillions: grossInvestment * toBillions,
      totalExpendituresBillions: totalExpenditure * toBillions,
      allLines: Object.fromEntries(
        [...lineMap.entries()].map(([line, { description, value }]) => [
          line, { description, valueBillions: value * toBillions }
        ])
      ),
      notes: `${quarter.quarter} 2025 ${quarter.estimateType} SAAR. G-in-GDP = consumption expenditures (L21) + gross investment (L39). Total expenditures (L37) includes transfers and interest payments. Will be revised.`,
    };

    writeJSON(path.join(OUTPUT_DIR, 'government-spending.json'), output);
    console.log(`  G-in-GDP: $${(totalG * toBillions / 1000).toFixed(1)}T (Consumption: $${(consumptionExp * toBillions / 1000).toFixed(1)}T + Investment: $${(grossInvestment * toBillions / 1000).toFixed(1)}T)\n`);
  } catch (error) {
    console.error('  ❌ Government Spending fetch error:', error);
  }
}

// ============================================================
// Fetch 1E: Industry GDP (GDPbyIndustry)
// ============================================================

async function fetchIndustryGDP(apiKey: string): Promise<void> {
  console.log('🏭 Fetching Industry GDP (GDPbyIndustry)...');

  // Try quarterly 2025 first, then annual 2024 fallback
  let rows: BEADataRow[] | null = null;
  let dataYear = 2025;
  let dataQuarter: string | undefined;
  let estimateType: string | undefined;
  let noteSuffix = '';

  try {
    // Attempt 1: Quarterly 2025 SAAR
    console.log('  Trying quarterly 2025...');
    const qData = await fetchBEA({
      DataSetName: 'GDPbyIndustry',
      TableID: '1',
      Frequency: 'Q',
      Year: '2025',
      Industry: 'ALL',
    }, apiKey);

    if (qData && has2025Data(qData)) {
      const quarter = extractQuarterRows(qData);
      if (quarter) {
        rows = quarter.rows;
        dataQuarter = quarter.quarter;
        estimateType = quarter.estimateType;
        noteSuffix = `${quarter.quarter} 2025 ${quarter.estimateType} SAAR. Will be revised.`;
      }
    }

    // Attempt 2: Annual 2024 (industry shares change slowly)
    if (!rows) {
      console.log('  ⚠️  No quarterly 2025 data. Trying annual 2024...');
      await sleep(RATE_LIMIT_DELAY_MS);
      const aData = await fetchBEA({
        DataSetName: 'GDPbyIndustry',
        TableID: '1',
        Frequency: 'A',
        Year: '2024',
        Industry: 'ALL',
      }, apiKey);

      if (aData && aData.some(r => !isNaN(parseNumericValue(r.DataValue)))) {
        rows = aData;
        dataYear = 2024;
        noteSuffix = '2025 not yet available. Using 2024 annual data. Industry labor shares change slowly year-to-year.';
        console.log('  Using annual 2024 data.');
      }
    }

    if (!rows) {
      console.log('  ⚠️  GDPbyIndustry has no 2025 quarterly or 2024 annual data — skipping. Hardcoded fallback will be used.');
      return;
    }

    // Build industry breakdown
    const industries: Record<string, { description: string; valueBillions: number }> = {};
    let totalGDP = 0;

    for (const row of rows) {
      const val = parseNumericValue(row.DataValue);
      if (!isNaN(val)) {
        const key = row.SeriesCode || row.LineNumber;
        industries[key] = {
          description: row.LineDescription,
          valueBillions: val,
        };
        // Track total GDP (usually first line)
        if (row.LineDescription?.includes('All industries') || row.LineNumber === '1') {
          totalGDP = val;
        }
      }
    }

    const output: Record<string, unknown> = {
      source: 'BEA GDP by Industry (Value Added)',
      seriesOrTable: 'GDPbyIndustry Table 1',
      fetchedAt: new Date().toISOString(),
      dataYear,
      ...(dataQuarter ? { dataQuarter, estimateType } : {}),
      totalGDPBillions: totalGDP,
      industries,
      notes: `Value added by industry in billions of current dollars. ${noteSuffix}`,
    };

    writeJSON(path.join(OUTPUT_DIR, 'industry-gdp.json'), output);
    console.log(`  Industries: ${Object.keys(industries).length} sectors\n`);
  } catch (error) {
    console.error('  ❌ Industry GDP fetch error:', error);
  }
}

// ============================================================
// Fetch 1F: Input-Output Multipliers — SKIP with TODO
// ============================================================

function writeInputOutputTodo(): void {
  console.log('🔗 Input-Output Multipliers — SKIPPED (TODO)');

  const output = {
    isTodo: true,
    reason: 'InputOutput API format is complex — existing hardcoded multipliers in constants.ts are reasonable approximations from BEA input-output tables, Moretti (2010), ATA, and CBO estimates.',
    followUp: 'Investigate BEA InputOutput API in a future session. Consider parsing the published Excel tables instead.',
    existingMultipliersLocation: 'src/models/constants.ts → EMPLOYMENT_MULTIPLIERS',
    fetchedAt: new Date().toISOString(),
  };

  writeJSON(path.join(OUTPUT_DIR, 'input-output-multipliers.json'), output);
  console.log('  Written TODO placeholder.\n');
}

// ============================================================
// Fetch 1G: State-Level Data (Regional)
// ============================================================

async function fetchStateGDP(apiKey: string): Promise<void> {
  console.log('🗺️  Fetching State GDP (Regional SAGDP2N, Year=2024)...');

  try {
    // Regional data has a longer publication lag than NIPA. Use 2024.
    const data = await fetchBEA({
      DataSetName: 'Regional',
      TableName: 'SAGDP2N',
      GeoFips: 'STATE',
      Year: '2024',
      LineCode: '1',
    }, apiKey);

    if (!data || !data.some(r => !isNaN(parseNumericValue(r.DataValue)))) {
      console.log('  ⚠️  Regional SAGDP2N has no 2024 data — skipping. Not blocking (state-level is Phase 3).');
      return;
    }

    const states: Record<string, { fips: string; name: string; gdpMillions: number }> = {};
    for (const row of data) {
      const val = parseNumericValue(row.DataValue);
      if (!isNaN(val) && row.GeoFips && row.GeoFips !== '00000') {
        states[row.GeoFips] = {
          fips: row.GeoFips,
          name: row.GeoName ?? '',
          gdpMillions: val, // Regional data is typically in millions
        };
      }
    }

    const output = {
      source: 'BEA Regional SAGDP2N (GDP in Current Dollars by State)',
      seriesOrTable: 'Regional SAGDP2N',
      fetchedAt: new Date().toISOString(),
      dataYear: 2024,
      stateCount: Object.keys(states).length,
      states,
      notes: '2024 annual. Regional data has longer lag than NIPA. GDP in millions of current dollars. GeoFips = state FIPS code. Update to 2025 when available.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'state-gdp.json'), output);
    console.log(`  States: ${Object.keys(states).length}\n`);
  } catch (error) {
    console.error('  ❌ State GDP fetch error:', error);
    console.error('  Note: Regional API parameters may differ. This is not blocking (state-level is Phase 3).');
  }
}

async function fetchStateIncome(apiKey: string): Promise<void> {
  console.log('💰 Fetching State Personal Income (Regional SAINC1, Year=2024)...');

  try {
    // Regional data has a longer publication lag than NIPA. Use 2024.
    const data = await fetchBEA({
      DataSetName: 'Regional',
      TableName: 'SAINC1',
      GeoFips: 'STATE',
      Year: '2024',
      LineCode: '1',
    }, apiKey);

    if (!data || !data.some(r => !isNaN(parseNumericValue(r.DataValue)))) {
      console.log('  ⚠️  Regional SAINC1 has no 2024 data — skipping. Not blocking (state-level is Phase 3).');
      return;
    }

    const states: Record<string, { fips: string; name: string; personalIncomeThousands: number }> = {};
    for (const row of data) {
      const val = parseNumericValue(row.DataValue);
      if (!isNaN(val) && row.GeoFips && row.GeoFips !== '00000') {
        states[row.GeoFips] = {
          fips: row.GeoFips,
          name: row.GeoName ?? '',
          personalIncomeThousands: val, // Regional income is in thousands
        };
      }
    }

    const output = {
      source: 'BEA Regional SAINC1 (State Annual Personal Income)',
      seriesOrTable: 'Regional SAINC1',
      fetchedAt: new Date().toISOString(),
      dataYear: 2024,
      stateCount: Object.keys(states).length,
      states,
      notes: '2024 annual. Regional data has longer lag than NIPA. Personal income in thousands of dollars. Update to 2025 when available.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'state-income.json'), output);
    console.log(`  States: ${Object.keys(states).length}\n`);
  } catch (error) {
    console.error('  ❌ State Income fetch error:', error);
    console.error('  Note: Regional API parameters may differ. This is not blocking (state-level is Phase 3).');
  }
}

async function fetchStatePriceParities(apiKey: string): Promise<void> {
  console.log('📊 Fetching Regional Price Parities (Regional SARPP, Year=2024)...');

  try {
    // Regional data has a longer publication lag than NIPA. Use 2024.
    const data = await fetchBEA({
      DataSetName: 'Regional',
      TableName: 'SARPP',
      GeoFips: 'STATE',
      Year: '2024',
      LineCode: '1',
    }, apiKey);

    if (!data || !data.some(r => !isNaN(parseNumericValue(r.DataValue)))) {
      console.log('  ⚠️  Regional SARPP has no 2024 data — skipping. Not blocking (state-level is Phase 3).');
      return;
    }

    const states: Record<string, { fips: string; name: string; rpp: number }> = {};
    for (const row of data) {
      const val = parseNumericValue(row.DataValue);
      if (!isNaN(val) && row.GeoFips && row.GeoFips !== '00000') {
        states[row.GeoFips] = {
          fips: row.GeoFips,
          name: row.GeoName ?? '',
          rpp: val, // Regional Price Parity (US average = 100)
        };
      }
    }

    const output = {
      source: 'BEA Regional SARPP (Regional Price Parities)',
      seriesOrTable: 'Regional SARPP',
      fetchedAt: new Date().toISOString(),
      dataYear: 2024,
      stateCount: Object.keys(states).length,
      states,
      notes: '2024 annual. Regional data has longer lag than NIPA. US average = 100. Higher = more expensive. Update to 2025 when available.',
    };

    writeJSON(path.join(OUTPUT_DIR, 'state-price-parities.json'), output);
    console.log(`  States: ${Object.keys(states).length}\n`);
  } catch (error) {
    console.error('  ❌ State Price Parities fetch error:', error);
    console.error('  Note: Regional API parameters may differ. This is not blocking (state-level is Phase 3).');
  }
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('🚀 ATLAS BEA Data Fetch');
  console.log('========================\n');

  const { apiKey, flags } = parseCliArgs('BEA_API_KEY');
  const skipState = flags.has('--skip-state');
  const debug = flags.has('--debug');

  if (!apiKey) {
    console.error('❌ No BEA API key provided.');
    console.error('   Usage: npx tsx scripts/fetch-bea-data.ts --key YOUR_API_KEY');
    console.error('   Or:    BEA_API_KEY=YOUR_KEY npx tsx scripts/fetch-bea-data.ts');
    console.error('   Flags: --skip-state  Skip state-level fetches (many requests)');
    console.error('          --debug       Print all rows for each NIPA table (for line number inspection)');
    console.error('\n   Get a free key at: https://apps.bea.gov/api/signup/');
    process.exit(1);
  }

  if (debug) {
    console.log('🔍 DEBUG MODE: Will print all rows for each NIPA table.\n');
  }

  // ---- 1A: GDP Components ----
  await fetchGDPComponents(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  // ---- 1B: Personal Income ----
  await fetchPersonalIncome(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  // ---- 1C: Price Indices ----
  await fetchPriceIndices(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  // ---- 1D: Government Spending ----
  await fetchGovernmentSpending(apiKey, debug);
  await sleep(RATE_LIMIT_DELAY_MS);

  // ---- 1E: Industry GDP ----
  await fetchIndustryGDP(apiKey);
  await sleep(RATE_LIMIT_DELAY_MS);

  // ---- 1F: Input-Output Multipliers (TODO) ----
  writeInputOutputTodo();

  // ---- 1G: State-Level Data (optional) ----
  if (!skipState) {
    await sleep(RATE_LIMIT_DELAY_MS);
    await fetchStateGDP(apiKey);
    await sleep(RATE_LIMIT_DELAY_MS);
    await fetchStateIncome(apiKey);
    await sleep(RATE_LIMIT_DELAY_MS);
    await fetchStatePriceParities(apiKey);
  } else {
    console.log('⏭️  State-level fetches skipped (--skip-state).\n');
  }

  console.log('========================');
  console.log('🎉 BEA data fetch complete!');
  console.log(`   Output directory: ${OUTPUT_DIR}`);
  if (skipState) {
    console.log('   State data was skipped. Run without --skip-state to include.');
  }
  console.log('');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
