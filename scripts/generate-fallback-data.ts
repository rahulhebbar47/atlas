/**
 * ATLAS — Fallback Data Generator
 *
 * Generates reasonable default JSON files with "isFallback: true" for all
 * BEA, FRED, and new BLS output locations. This allows the app to run
 * without API keys, using hardcoded values from src/models/constants.ts.
 *
 * Usage:
 *   npx tsx scripts/generate-fallback-data.ts
 *
 * The model should log a warning at startup if any data file has isFallback: true.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { writeJSON } from './fetch-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BEA_DIR = path.resolve(__dirname, '../src/data/bea');
const FRED_DIR = path.resolve(__dirname, '../src/data/fred');
const BLS_DIR = path.resolve(__dirname, '../src/data/bls');

const TIMESTAMP = new Date().toISOString();

// ============================================================
// BEA Fallback Data
// Values from src/models/constants.ts with source citations
// ============================================================

function generateBEAFallbacks(): void {
  console.log('📊 Generating BEA fallback data...\n');

  // GDP Components (Table 1.1.5)
  writeJSON(path.join(BEA_DIR, 'gdp-components.json'), {
    isFallback: true,
    fallbackReason: 'Run: npx tsx scripts/fetch-bea-data.ts --key YOUR_BEA_API_KEY',
    source: 'Fallback — BEA NIPA Table 1.1.5 approximation',
    fetchedAt: TIMESTAMP,
    dataYear: 2025,
    gdpNominal: 29_000_000_000_000,  // $29T — BEA advance estimate
    gdpBillions: 29000,
    consumptionRatio: 0.681,          // BEA Personal Consumption Expenditures / GDP
    investmentRatio: 0.175,           // BEA Gross Private Domestic Investment / GDP
    governmentRatio: 0.180,           // BEA Government Consumption + Gross Investment / GDP
    netExportRatio: -0.030,           // BEA Net Exports / GDP (US trade deficit)
    notes: 'FALLBACK DATA. Values from constants.ts based on BEA estimates.',
  });

  // Personal Income (Table 2.1)
  writeJSON(path.join(BEA_DIR, 'personal-income.json'), {
    isFallback: true,
    fallbackReason: 'Run: npx tsx scripts/fetch-bea-data.ts --key YOUR_BEA_API_KEY',
    source: 'Fallback — BEA NIPA Table 2.1 approximation',
    fetchedAt: TIMESTAMP,
    dataYear: 2025,
    personalIncomeBillions: 24000,    // ~$24T personal income
    wageShare: 0.60,                   // BEA compensation / personal income
    assetShare: 0.20,                  // BEA property income / personal income
    transferShare: 0.20,               // BEA government transfers / personal income
    notes: 'FALLBACK DATA. 60/20/20 split from constants.ts (BEA + CBO estimates).',
  });

  // Price Indices (Table 1.1.4)
  writeJSON(path.join(BEA_DIR, 'price-indices.json'), {
    isFallback: true,
    fallbackReason: 'Run: npx tsx scripts/fetch-bea-data.ts --key YOUR_BEA_API_KEY',
    source: 'Fallback — BEA NIPA Table 1.1.4 approximation',
    fetchedAt: TIMESTAMP,
    dataYear: 2025,
    gdpDeflator: 126.1,               // GDP deflator (2017=100), estimated 2025
    baseYear: 2017,
    notes: 'FALLBACK DATA. GDP deflator estimated from BEA trend.',
  });

  // Government Spending (Table 3.1)
  writeJSON(path.join(BEA_DIR, 'government-spending.json'), {
    isFallback: true,
    fallbackReason: 'Run: npx tsx scripts/fetch-bea-data.ts --key YOUR_BEA_API_KEY',
    source: 'Fallback — BEA NIPA Table 3.1 approximation',
    fetchedAt: TIMESTAMP,
    dataYear: 2025,
    totalSpendingBillions: 5220,       // ~18% of $29T GDP
    federalSpendingBillions: 2030,     // ~7% of GDP
    stateLocalSpendingBillions: 3190,  // ~11% of GDP
    notes: 'FALLBACK DATA. Values from constants.ts GOVERNMENT_SPENDING_GDP_FRACTION (18%).',
  });

  // Industry GDP
  writeJSON(path.join(BEA_DIR, 'industry-gdp.json'), {
    isFallback: true,
    fallbackReason: 'Run: npx tsx scripts/fetch-bea-data.ts --key YOUR_BEA_API_KEY',
    source: 'Fallback — no industry breakdown available',
    fetchedAt: TIMESTAMP,
    dataYear: 2025,
    totalGDPBillions: 29000,
    industries: {},
    notes: 'FALLBACK DATA. Industry breakdown requires real BEA API data.',
  });

  // Input-Output Multipliers (TODO)
  writeJSON(path.join(BEA_DIR, 'input-output-multipliers.json'), {
    isTodo: true,
    isFallback: true,
    reason: 'InputOutput API format is complex — existing hardcoded multipliers in constants.ts are reasonable approximations.',
    followUp: 'Investigate BEA InputOutput API in a future session.',
    existingMultipliersLocation: 'src/models/constants.ts → EMPLOYMENT_MULTIPLIERS',
    fetchedAt: TIMESTAMP,
  });

  // State GDP
  writeJSON(path.join(BEA_DIR, 'state-gdp.json'), {
    isFallback: true,
    fallbackReason: 'Run: npx tsx scripts/fetch-bea-data.ts --key YOUR_BEA_API_KEY (without --skip-state)',
    source: 'Fallback — no state GDP data',
    fetchedAt: TIMESTAMP,
    dataYear: 2025,
    stateCount: 0,
    states: {},
    notes: 'FALLBACK DATA. State GDP requires real BEA Regional API data.',
  });

  // State Income
  writeJSON(path.join(BEA_DIR, 'state-income.json'), {
    isFallback: true,
    fallbackReason: 'Run: npx tsx scripts/fetch-bea-data.ts --key YOUR_BEA_API_KEY (without --skip-state)',
    source: 'Fallback — no state income data',
    fetchedAt: TIMESTAMP,
    dataYear: 2025,
    stateCount: 0,
    states: {},
    notes: 'FALLBACK DATA. State income requires real BEA Regional API data.',
  });

  // State Price Parities
  writeJSON(path.join(BEA_DIR, 'state-price-parities.json'), {
    isFallback: true,
    fallbackReason: 'Run: npx tsx scripts/fetch-bea-data.ts --key YOUR_BEA_API_KEY (without --skip-state)',
    source: 'Fallback — no state price parity data',
    fetchedAt: TIMESTAMP,
    dataYear: 2025,
    stateCount: 0,
    states: {},
    notes: 'FALLBACK DATA. Regional Price Parities require real BEA Regional API data.',
  });
}

// ============================================================
// FRED Fallback Data
// Values from src/models/constants.ts
// ============================================================

function generateFREDFallbacks(): void {
  console.log('💰 Generating FRED fallback data...\n');

  // M2 Velocity
  writeJSON(path.join(FRED_DIR, 'm2-velocity.json'), {
    isFallback: true,
    fallbackReason: 'Run: npx tsx scripts/fetch-fred-data.ts --key YOUR_FRED_API_KEY',
    source: 'Fallback — FRED M2V approximation',
    seriesOrTable: 'M2V',
    fetchedAt: TIMESTAMP,
    latestDate: '2024-10-01',
    velocity: 1.2,                     // FRED M2V — declining trend, ~1.2 as of 2024
    recentValues: [],
    notes: 'FALLBACK DATA. Velocity from constants.ts BASELINE_VELOCITY_OF_MONEY.',
  });

  // NAIRU
  writeJSON(path.join(FRED_DIR, 'nairu.json'), {
    isFallback: true,
    fallbackReason: 'Run: npx tsx scripts/fetch-fred-data.ts --key YOUR_FRED_API_KEY',
    source: 'Fallback — FRED NROU approximation',
    seriesOrTable: 'NROU',
    fetchedAt: TIMESTAMP,
    latestDate: '2024-10-01',
    naturalUnemploymentRate: 0.0441,   // CBO long-term NAIRU ~4.41%
    naturalUnemploymentRatePercent: 4.41,
    recentValues: [],
    notes: 'FALLBACK DATA. NAIRU from CBO estimates.',
  });

  // Federal Funds Rate
  writeJSON(path.join(FRED_DIR, 'fed-funds-rate.json'), {
    isFallback: true,
    fallbackReason: 'Run: npx tsx scripts/fetch-fred-data.ts --key YOUR_FRED_API_KEY',
    source: 'Fallback — FRED FEDFUNDS approximation',
    seriesOrTable: 'FEDFUNDS',
    fetchedAt: TIMESTAMP,
    latestDate: '2025-01-01',
    federalFundsRate: 0.0433,          // ~4.33% as of early 2025
    federalFundsRatePercent: 4.33,
    recentValues: [],
    notes: 'FALLBACK DATA. Fed funds rate approximate as of early 2025.',
  });
}

// ============================================================
// BLS Fallback Data (new series only — OEWS/CPI/employment already exist)
// ============================================================

function generateBLSFallbacks(): void {
  console.log('📈 Generating BLS fallback data (new series)...\n');

  // Unemployment Rate
  writeJSON(path.join(BLS_DIR, 'unemployment-rate.json'), {
    isFallback: true,
    fallbackReason: 'Run: npx tsx scripts/fetch-bls-data.ts --key YOUR_BLS_API_KEY',
    source: 'Fallback — BLS CPS approximation',
    seriesId: 'LNS14000000',
    fetchedAt: TIMESTAMP,
    annualAverage: 4.0,                // ~4.0% unemployment rate estimate 2025
    latestMonthly: null,
    history: [],
    notes: 'FALLBACK DATA. Unemployment rate approximate.',
  });

  // Labor Force
  writeJSON(path.join(BLS_DIR, 'labor-force.json'), {
    isFallback: true,
    fallbackReason: 'Run: npx tsx scripts/fetch-bls-data.ts --key YOUR_BLS_API_KEY',
    source: 'Fallback — BLS CPS approximation',
    seriesId: 'LNS11000000',
    fetchedAt: TIMESTAMP,
    annualAverage: 168000,             // 168M from constants.ts US_LABOR_FORCE_2025
    latestMonthly: null,
    history: [],
    notes: 'FALLBACK DATA. Labor force in thousands from constants.ts.',
  });

  // Labor Market (hours + earnings)
  writeJSON(path.join(BLS_DIR, 'labor-market.json'), {
    isFallback: true,
    fallbackReason: 'Run: npx tsx scripts/fetch-bls-data.ts --key YOUR_BLS_API_KEY',
    source: 'Fallback — BLS CES approximation',
    fetchedAt: TIMESTAMP,
    avgWeeklyHours: {
      seriesId: 'CES0500000002',
      annualAverage: '34.3',           // ~34.3 hours typical total private
      latestMonthly: null,
      history: [],
    },
    avgHourlyEarnings: {
      seriesId: 'CES0500000003',
      annualAverage: '34.50',          // ~$34.50/hr total private
      latestMonthly: null,
      history: [],
    },
    notes: 'FALLBACK DATA. Weekly hours and hourly earnings approximate.',
  });

  // CPI Sector Indices
  writeJSON(path.join(BLS_DIR, 'cpi-sector-indices.json'), {
    isFallback: true,
    fallbackReason: 'Run: npx tsx scripts/fetch-bls-data.ts --key YOUR_BLS_API_KEY',
    source: 'Fallback — no CPI sector index data',
    fetchedAt: TIMESTAMP,
    startYear: '2015',
    endYear: '2025',
    sectors: {},
    notes: 'FALLBACK DATA. CPI sector indices require real BLS API data.',
  });

  // CPI Sector Weights
  writeJSON(path.join(BLS_DIR, 'cpi-sector-weights.json'), {
    isFallback: true,
    fallbackReason: 'Run: npx tsx scripts/fetch-bls-data.ts --key YOUR_BLS_API_KEY',
    source: 'Fallback — BLS CPI Relative Importance December 2024 approximation',
    url: 'https://www.bls.gov/cpi/tables/relative-importance/2024.htm',
    fetchedAt: TIMESTAMP,
    dataYear: 2024,
    weights: {
      food_home:       0.079,
      food_away:       0.056,
      shelter:         0.370,
      medical_care:    0.084,
      transportation:  0.151,
      education_comm:  0.062,
      info_technology: 0.013,
      apparel:         0.025,
      recreation:      0.053,
      other_services:  0.032,
      energy:          0.062,
      other_goods:     0.013,
    },
    notes: 'FALLBACK DATA. Approximate CPI weights. Verify against BLS source URL.',
  });
}

// ============================================================
// Main
// ============================================================

function main(): void {
  console.log('🚀 ATLAS Fallback Data Generator');
  console.log('================================\n');
  console.log('Generating reasonable default data files with isFallback: true.\n');
  console.log('These allow the app to run without API keys. The model will\n');
  console.log('use hardcoded constants from src/models/constants.ts.\n');

  generateBEAFallbacks();
  generateFREDFallbacks();
  generateBLSFallbacks();

  console.log('================================');
  console.log('🎉 All fallback data generated!');
  console.log('   BEA: src/data/bea/ (9 files)');
  console.log('   FRED: src/data/fred/ (3 files)');
  console.log('   BLS: src/data/bls/ (5 new files)');
  console.log('\n   ⚠️  These are FALLBACK values. For real data, run:');
  console.log('   npx tsx scripts/fetch-bls-data.ts --key YOUR_BLS_KEY');
  console.log('   npx tsx scripts/fetch-bea-data.ts --key YOUR_BEA_KEY');
  console.log('   npx tsx scripts/fetch-fred-data.ts --key YOUR_FRED_KEY');
  console.log('');
}

main();
