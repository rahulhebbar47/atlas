/**
 * ATLAS — BLS Data Fetch Script
 * 
 * Run this script to fetch real employment and wage data from the
 * Bureau of Labor Statistics API and save it as static JSON files.
 * 
 * Usage:
 *   npx tsx scripts/fetch-bls-data.ts --key YOUR_BLS_API_KEY
 *   npx tsx scripts/fetch-bls-data.ts --key YOUR_BLS_API_KEY --include-states
 *
 * Or set the environment variable:
 *   BLS_API_KEY=YOUR_KEY npx tsx scripts/fetch-bls-data.ts
 * 
 * This script:
 *   1. Fetches OEWS (occupation employment & wage) data for all 51 clusters
 *   2. Fetches CPI data for price level baseline
 *   3. Fetches total nonfarm employment
 *   4. Fetches state-level employment data (with --include-states)
 *   5. Fetches unemployment rate, labor force, and labor market data
 *   6. Fetches CPI sector indices (10-year history for 11 sectors)
 *   7. Writes CPI relative importance weights (from BLS publication)
 *   8. Writes everything to src/data/bls/ as JSON files
 * 
 * The app imports these JSON files directly — no runtime API calls needed.
 * Re-run this script when BLS publishes new data (OEWS: annually in May).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sleep, RATE_LIMIT_DELAY_MS as SHARED_RATE_LIMIT_MS, writeJSON } from './fetch-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// Configuration
// ============================================================

const BLS_BASE_URL = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';
const OUTPUT_DIR = path.resolve(__dirname, '../src/data/bls');
const RATE_LIMIT_DELAY_MS = 1500; // Be respectful to BLS servers

// BLS API limits: 50 series per request, 500 requests/day, 20 years per request
const MAX_SERIES_PER_REQUEST = 50;
const DATA_START_YEAR = '2014';
const DATA_END_YEAR = '2025';

// ============================================================
// SOC Code → Series ID Mapping
// 
// OEWS series format: OEUM[area][area_type][industry][occupation][data_type]
// National level: area=0000000, area_type=00
// All industries: industry=000000
// Data types: 01=employment, 04=mean wage, 13=median wage
// ============================================================

interface OccupationMapping {
  clusterId: string;
  clusterName: string;
  socCodes: string[];
}

const OCCUPATION_MAPPINGS: OccupationMapping[] = [
  // Technology
  { clusterId: 'tech_swe', clusterName: 'Software Engineering', socCodes: ['15-1252', '15-1254', '15-1256'] }, // FS-6f: 15-1253 belongs to tech_qa (was double-listed — a re-fetch would have double-counted QA),
  { clusterId: 'tech_data_ml', clusterName: 'Data / ML Engineering', socCodes: ['15-2051', '15-2098'] },
  { clusterId: 'tech_it', clusterName: 'IT Support / Sysadmin', socCodes: ['15-1231', '15-1244', '15-1232'] },
  { clusterId: 'tech_qa', clusterName: 'QA / Testing', socCodes: ['15-1253'] },
  
  // Finance
  { clusterId: 'finance_trading', clusterName: 'Trading / Quantitative', socCodes: ['13-2051', '13-2054'] },
  { clusterId: 'finance_banking', clusterName: 'Banking', socCodes: ['13-2071', '13-2072', '43-3071'] },
  { clusterId: 'finance_accounting', clusterName: 'Accounting / Bookkeeping', socCodes: ['13-2011', '43-3031'] },
  { clusterId: 'finance_insurance', clusterName: 'Insurance / Underwriting', socCodes: ['13-2053', '13-2022'] },
  
  // Healthcare
  { clusterId: 'health_physicians', clusterName: 'Physicians / Surgeons', socCodes: ['29-1210', '29-1215', '29-1216', '29-1228', '29-1248'] },
  { clusterId: 'health_nurses', clusterName: 'Nurses', socCodes: ['29-1141', '29-1151', '29-2061'] },
  { clusterId: 'health_techs', clusterName: 'Technicians / Diagnostics', socCodes: ['29-2010', '29-2034', '29-2035'] },
  { clusterId: 'health_aides', clusterName: 'Home Health / Aides', socCodes: ['31-1120', '31-1131', '39-9021'] },
  { clusterId: 'health_admin', clusterName: 'Healthcare Administration', socCodes: ['11-9111', '43-6013', '29-2071'] },
  
  // Education
  { clusterId: 'edu_teachers', clusterName: 'Teachers / Professors', socCodes: ['25-2021', '25-2031', '25-1099'] },
  { clusterId: 'edu_admin', clusterName: 'Education Administration', socCodes: ['11-9032', '11-9033', '11-9039'] },
  { clusterId: 'edu_support', clusterName: 'Education Support', socCodes: ['25-9045', '25-4022'] },
  
  // Legal
  { clusterId: 'legal_attorneys', clusterName: 'Attorneys', socCodes: ['23-1011', '23-1021', '23-1022'] },
  { clusterId: 'legal_paralegals', clusterName: 'Paralegals / Legal Assistants', socCodes: ['23-2011', '23-2099'] },
  
  // Transportation
  { clusterId: 'transport_trucking', clusterName: 'Trucking / Long-Haul', socCodes: ['53-3032'] },
  { clusterId: 'transport_delivery', clusterName: 'Local Delivery', socCodes: ['53-3031', '43-5021'] },
  { clusterId: 'transport_taxi', clusterName: 'Taxi / Rideshare', socCodes: ['53-3041', '53-3054'] },
  { clusterId: 'transport_warehouse', clusterName: 'Warehousing / Logistics', socCodes: ['53-7062', '53-7064', '43-5071'] },
  
  // Manufacturing
  { clusterId: 'mfg_assembly', clusterName: 'Assembly / Production', socCodes: ['51-2028', '51-2098'] },
  { clusterId: 'mfg_machinists', clusterName: 'Skilled Machinists', socCodes: ['51-4041', '51-4011', '51-4111'] },
  { clusterId: 'mfg_qc', clusterName: 'Quality Control', socCodes: ['51-9061'] },
  
  // Construction / Trades
  { clusterId: 'trades_electrical', clusterName: 'Electricians', socCodes: ['47-2111'] },
  { clusterId: 'trades_plumbing', clusterName: 'Plumbers', socCodes: ['47-2152'] },
  { clusterId: 'trades_construction', clusterName: 'General Construction', socCodes: ['47-2061', '47-2031', '47-2051'] },
  { clusterId: 'trades_hvac', clusterName: 'HVAC', socCodes: ['49-9021'] },
  
  // Retail
  { clusterId: 'retail_floor', clusterName: 'Cashiers / Floor', socCodes: ['41-2011', '41-2031'] },
  { clusterId: 'retail_mgmt', clusterName: 'Retail Management', socCodes: ['41-1011', '41-1012'] },
  { clusterId: 'retail_ecom', clusterName: 'E-commerce / Fulfillment', socCodes: ['43-5011', '53-7065'] },
  
  // Food Service
  { clusterId: 'food_fast', clusterName: 'Fast Food', socCodes: ['35-3023', '35-2014'] },
  { clusterId: 'food_restaurant', clusterName: 'Sit-Down Restaurant', socCodes: ['35-1012', '35-3031'] },
  { clusterId: 'food_industrial', clusterName: 'Food Prep / Industrial', socCodes: ['35-2021', '51-3091', '51-3092'] },
  
  // Creative
  { clusterId: 'creative_design', clusterName: 'Design / Visual', socCodes: ['27-1024', '27-1025', '27-1014'] },
  { clusterId: 'creative_writing', clusterName: 'Writing / Content', socCodes: ['27-3043', '27-3042', '27-3041'] },
  { clusterId: 'creative_marketing', clusterName: 'Marketing / Advertising', socCodes: ['13-1161', '27-3031'] },
  { clusterId: 'creative_media', clusterName: 'Media Production', socCodes: ['27-4011', '27-4014', '27-4021', '27-4032'] },
  
  // Professional Services
  { clusterId: 'prof_consulting', clusterName: 'Consulting', socCodes: ['13-1111', '13-1199'] },
  { clusterId: 'prof_hr', clusterName: 'Human Resources', socCodes: ['13-1071', '13-1075', '11-3121'] },
  { clusterId: 'prof_realestate', clusterName: 'Real Estate', socCodes: ['41-9022', '41-9021'] },
  { clusterId: 'prof_admin', clusterName: 'Administrative / Clerical', socCodes: ['43-6014', '43-9061', '43-4051', '43-1011'] },
  
  // Government
  { clusterId: 'gov_postal', clusterName: 'Postal / Delivery Services', socCodes: ['43-5052', '43-5053'] },
  
  // Agriculture
  { clusterId: 'ag_farm', clusterName: 'Farm Labor', socCodes: ['45-2092', '45-2093'] },
  { clusterId: 'ag_equipment', clusterName: 'Equipment Operation', socCodes: ['45-2091'] },
  
  // Scientific R&D
  { clusterId: 'sci_lab', clusterName: 'Lab Research', socCodes: ['19-1042', '19-2031', '19-4099'] },
  { clusterId: 'sci_engineering', clusterName: 'Engineering / Applied Science', socCodes: ['17-2051', '17-2071', '17-2112', '17-2141'] },
];

// CPI series for price level baseline
const CPI_SERIES = 'CUUR0000SA0'; // All items, US city average, not seasonally adjusted

// Total nonfarm employment
const TOTAL_EMPLOYMENT_SERIES = 'CES0000000001';

// ============================================================
// API Client
// ============================================================

interface BLSApiResponse {
  status: string;
  responseTime: number;
  message: string[];
  Results: {
    series: Array<{
      seriesID: string;
      data: Array<{
        year: string;
        period: string;
        periodName: string;
        value: string;
        footnotes: Array<{ code: string; text: string }>;
      }>;
    }>;
  };
}

async function fetchBLSSeries(
  seriesIds: string[],
  apiKey: string,
  startYear: string = DATA_START_YEAR,
  endYear: string = DATA_END_YEAR
): Promise<BLSApiResponse> {
  const response = await fetch(BLS_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      seriesid: seriesIds,
      startyear: startYear,
      endyear: endYear,
      catalog: true,
      calculations: true,
      annualaverage: true,
      registrationkey: apiKey,
    }),
  });

  if (!response.ok) {
    throw new Error(`BLS API returned ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// sleep() imported from ./fetch-utils.js

// ============================================================
// OEWS Series ID Builder
// ============================================================

function buildOEWSSeriesId(socCode: string, dataType: '01' | '04' | '13'): string {
  // OEWS format: OEUM + area(7) + area_type(1) + industry(6) + occupation(6) + data_type(2)
  // National: 0000000, area_type: 0, all industries: 000000
  const occupation = socCode.replace('-', '');
  return `OEUN0000000000000${occupation}${dataType}`;
}

// ============================================================
// State-Level Data (Phase 6)
//
// State OEWS: employment by major SOC group per state
// Series format: OEUS[fips]00000000000[majorSOC][dataType]
//   fips = 2-digit state FIPS, zero-padded to 7 chars with trailing zeros
//   majorSOC = 6-digit major group (e.g., 150000 for Computer & Math)
//   dataType = 01 (employment)
//
// State LAUS: unemployment rate + labor force per state
// Series format: LAUST[fips]0000000000[measure]
//   fips = 2-digit state FIPS, zero-padded to 5 chars
//   measure = 03 (unemployment rate), 06 (labor force)
// ============================================================

const STATE_FIPS: Record<string, string> = {
  AL: '01', AK: '02', AZ: '04', AR: '05', CA: '06',
  CO: '08', CT: '09', DE: '10', DC: '11', FL: '12',
  GA: '13', HI: '15', ID: '16', IL: '17', IN: '18',
  IA: '19', KS: '20', KY: '21', LA: '22', ME: '23',
  MD: '24', MA: '25', MI: '26', MN: '27', MS: '28',
  MO: '29', MT: '30', NE: '31', NV: '32', NH: '33',
  NJ: '34', NM: '35', NY: '36', NC: '37', ND: '38',
  OH: '39', OK: '40', OR: '41', PA: '42', RI: '44',
  SC: '45', SD: '46', TN: '47', TX: '48', UT: '49',
  VT: '50', VA: '51', WA: '53', WV: '54', WI: '55',
  WY: '56',
};

const SOC_MAJOR_GROUP_CODES = [
  '11-0000', '13-0000', '15-0000', '17-0000', '19-0000',
  '21-0000', '23-0000', '25-0000', '27-0000', '29-0000',
  '31-0000', '33-0000', '35-0000', '37-0000', '39-0000',
  '41-0000', '43-0000', '45-0000', '47-0000', '49-0000',
  '51-0000', '53-0000',
];

function buildStateOEWSSeriesId(fips: string, majorSOC: string): string {
  // State OEWS: OEUS + state area (fips padded to 7) + area_type(0) + industry(000000) + occupation(6) + data_type(01)
  // Area format for states: fips + "00000" to make 7 chars
  const area = fips + '00000';
  const occupation = majorSOC.replace('-', '');
  return `OEUS${area}00000${occupation}01`;
}

function buildLAUSSeriesId(fips: string, measure: '03' | '06'): string {
  // LAUS: LAUST + fips(2 padded to 2) + 00000000000 + measure(2)
  // Format: LAUST[ST]000000000000[measure]
  return `LAUST${fips}000000000000${measure}`;
}

// ============================================================
// Main Fetch Logic
// ============================================================

async function fetchAllData(apiKey: string, includeStates: boolean = false, debug: boolean = false) {
  console.log('🚀 ATLAS BLS Data Fetch');
  console.log('========================\n');

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // ---- 1. Fetch OEWS occupation data ----
  console.log('📊 Fetching OEWS occupation employment & wage data...\n');

  const allSeriesIds: { seriesId: string; clusterId: string; socCode: string; dataType: string }[] = [];

  for (const mapping of OCCUPATION_MAPPINGS) {
    for (const soc of mapping.socCodes) {
      // Employment (01), Mean Wage (04), Median Wage (13)
      for (const dt of ['01', '04', '13'] as const) {
        allSeriesIds.push({
          seriesId: buildOEWSSeriesId(soc, dt),
          clusterId: mapping.clusterId,
          socCode: soc,
          dataType: dt,
        });
      }
    }
  }

  console.log(`  Total OEWS series to fetch: ${allSeriesIds.length}`);
  console.log(`  Batches needed: ${Math.ceil(allSeriesIds.length / MAX_SERIES_PER_REQUEST)}\n`);

  const oewsResults: Record<string, any> = {};

  // Batch requests (50 series max per request)
  for (let i = 0; i < allSeriesIds.length; i += MAX_SERIES_PER_REQUEST) {
    const batch = allSeriesIds.slice(i, i + MAX_SERIES_PER_REQUEST);
    const batchNum = Math.floor(i / MAX_SERIES_PER_REQUEST) + 1;
    const totalBatches = Math.ceil(allSeriesIds.length / MAX_SERIES_PER_REQUEST);

    console.log(`  Batch ${batchNum}/${totalBatches} (${batch.length} series)...`);

    try {
      const response = await fetchBLSSeries(
        batch.map(b => b.seriesId),
        apiKey
      );

      if (response.status !== 'REQUEST_SUCCEEDED') {
        console.error(`  ⚠️  Batch ${batchNum} failed: ${response.message.join(', ')}`);
        continue;
      }

      for (const series of response.Results.series) {
        const meta = batch.find(b => b.seriesId === series.seriesID);
        if (meta) {
          if (!oewsResults[meta.clusterId]) {
            oewsResults[meta.clusterId] = {
              clusterId: meta.clusterId,
              clusterName: OCCUPATION_MAPPINGS.find(m => m.clusterId === meta.clusterId)?.clusterName,
              socCodes: {},
            };
          }
          if (!oewsResults[meta.clusterId].socCodes[meta.socCode]) {
            oewsResults[meta.clusterId].socCodes[meta.socCode] = {};
          }
          oewsResults[meta.clusterId].socCodes[meta.socCode][meta.dataType] = series.data;
        }
      }

      console.log(`  ✅ Batch ${batchNum} complete (${response.Results.series.length} series returned)`);
    } catch (error) {
      console.error(`  ❌ Batch ${batchNum} error:`, error);
    }

    // Rate limit respect
    if (i + MAX_SERIES_PER_REQUEST < allSeriesIds.length) {
      await sleep(RATE_LIMIT_DELAY_MS);
    }
  }

  // Write OEWS data
  const oewsOutputPath = path.join(OUTPUT_DIR, 'oews-data.json');
  fs.writeFileSync(oewsOutputPath, JSON.stringify(oewsResults, null, 2));
  console.log(`\n✅ OEWS data written to ${oewsOutputPath}\n`);

  // ---- 2. Fetch CPI data ----
  console.log('📈 Fetching CPI (price level) data...');

  try {
    const cpiResponse = await fetchBLSSeries([CPI_SERIES], apiKey);
    if (cpiResponse.status === 'REQUEST_SUCCEEDED') {
      const cpiOutputPath = path.join(OUTPUT_DIR, 'cpi-data.json');
      fs.writeFileSync(cpiOutputPath, JSON.stringify(cpiResponse.Results.series[0], null, 2));
      console.log(`✅ CPI data written to ${cpiOutputPath}\n`);
    }
  } catch (error) {
    console.error('❌ CPI fetch error:', error);
  }

  await sleep(RATE_LIMIT_DELAY_MS);

  // ---- 3. Fetch total nonfarm employment ----
  console.log('👥 Fetching total nonfarm employment...');

  try {
    const empResponse = await fetchBLSSeries([TOTAL_EMPLOYMENT_SERIES], apiKey);
    if (empResponse.status === 'REQUEST_SUCCEEDED') {
      const empOutputPath = path.join(OUTPUT_DIR, 'total-employment.json');
      fs.writeFileSync(empOutputPath, JSON.stringify(empResponse.Results.series[0], null, 2));
      console.log(`✅ Total employment data written to ${empOutputPath}\n`);
    }
  } catch (error) {
    console.error('❌ Total employment fetch error:', error);
  }

  // ---- 4. Fetch state-level data (optional) ----
  let stateOEWSSeriesCount = 0;
  let stateLAUSSeriesCount = 0;

  if (includeStates) {
    await sleep(RATE_LIMIT_DELAY_MS);

    // ---- 4a. State OEWS: employment by major SOC group per state ----
    console.log('🗺️  Fetching state OEWS employment data (22 SOC major groups x 51 states)...\n');

    const stateOEWSSeries: { seriesId: string; stateCode: string; fips: string; majorSOC: string }[] = [];

    for (const [stateCode, fips] of Object.entries(STATE_FIPS)) {
      for (const majorSOC of SOC_MAJOR_GROUP_CODES) {
        stateOEWSSeries.push({
          seriesId: buildStateOEWSSeriesId(fips, majorSOC),
          stateCode,
          fips,
          majorSOC,
        });
      }
    }

    stateOEWSSeriesCount = stateOEWSSeries.length;
    console.log(`  Total state OEWS series: ${stateOEWSSeries.length}`);
    console.log(`  Batches needed: ${Math.ceil(stateOEWSSeries.length / MAX_SERIES_PER_REQUEST)}\n`);

    // State OEWS results: keyed by stateCode → majorSOC → data points
    const stateOEWSResults: Record<string, Record<string, any>> = {};

    for (let i = 0; i < stateOEWSSeries.length; i += MAX_SERIES_PER_REQUEST) {
      const batch = stateOEWSSeries.slice(i, i + MAX_SERIES_PER_REQUEST);
      const batchNum = Math.floor(i / MAX_SERIES_PER_REQUEST) + 1;
      const totalBatches = Math.ceil(stateOEWSSeries.length / MAX_SERIES_PER_REQUEST);

      console.log(`  State OEWS Batch ${batchNum}/${totalBatches} (${batch.length} series)...`);

      try {
        const response = await fetchBLSSeries(
          batch.map(b => b.seriesId),
          apiKey
        );

        if (response.status !== 'REQUEST_SUCCEEDED') {
          console.error(`  ⚠️  Batch ${batchNum} failed: ${response.message.join(', ')}`);
          continue;
        }

        for (const series of response.Results.series) {
          const meta = batch.find(b => b.seriesId === series.seriesID);
          if (meta) {
            if (!stateOEWSResults[meta.stateCode]) {
              stateOEWSResults[meta.stateCode] = {};
            }
            stateOEWSResults[meta.stateCode][meta.majorSOC] = series.data;
          }
        }

        console.log(`  ✅ Batch ${batchNum} complete (${response.Results.series.length} series returned)`);
      } catch (error) {
        console.error(`  ❌ Batch ${batchNum} error:`, error);
      }

      if (i + MAX_SERIES_PER_REQUEST < stateOEWSSeries.length) {
        await sleep(RATE_LIMIT_DELAY_MS);
      }
    }

    const stateOEWSOutputPath = path.join(OUTPUT_DIR, 'state-oews-data.json');
    fs.writeFileSync(stateOEWSOutputPath, JSON.stringify(stateOEWSResults, null, 2));
    console.log(`\n✅ State OEWS data written to ${stateOEWSOutputPath}\n`);

    await sleep(RATE_LIMIT_DELAY_MS);

    // ---- 4b. State LAUS: unemployment rate + labor force ----
    console.log('📉 Fetching state LAUS (unemployment + labor force) data...\n');

    const stateLAUSSeries: { seriesId: string; stateCode: string; measure: string }[] = [];

    for (const [stateCode, fips] of Object.entries(STATE_FIPS)) {
      // 03 = unemployment rate, 06 = labor force
      for (const measure of ['03', '06'] as const) {
        stateLAUSSeries.push({
          seriesId: buildLAUSSeriesId(fips, measure),
          stateCode,
          measure,
        });
      }
    }

    stateLAUSSeriesCount = stateLAUSSeries.length;
    console.log(`  Total LAUS series: ${stateLAUSSeries.length}`);
    console.log(`  Batches needed: ${Math.ceil(stateLAUSSeries.length / MAX_SERIES_PER_REQUEST)}\n`);

    // LAUS results: keyed by stateCode → measure → data points
    const stateLAUSResults: Record<string, Record<string, any>> = {};

    for (let i = 0; i < stateLAUSSeries.length; i += MAX_SERIES_PER_REQUEST) {
      const batch = stateLAUSSeries.slice(i, i + MAX_SERIES_PER_REQUEST);
      const batchNum = Math.floor(i / MAX_SERIES_PER_REQUEST) + 1;
      const totalBatches = Math.ceil(stateLAUSSeries.length / MAX_SERIES_PER_REQUEST);

      console.log(`  LAUS Batch ${batchNum}/${totalBatches} (${batch.length} series)...`);

      try {
        const response = await fetchBLSSeries(
          batch.map(b => b.seriesId),
          apiKey
        );

        if (response.status !== 'REQUEST_SUCCEEDED') {
          console.error(`  ⚠️  Batch ${batchNum} failed: ${response.message.join(', ')}`);
          continue;
        }

        for (const series of response.Results.series) {
          const meta = batch.find(b => b.seriesId === series.seriesID);
          if (meta) {
            if (!stateLAUSResults[meta.stateCode]) {
              stateLAUSResults[meta.stateCode] = {};
            }
            stateLAUSResults[meta.stateCode][meta.measure] = series.data;
          }
        }

        console.log(`  ✅ Batch ${batchNum} complete (${response.Results.series.length} series returned)`);
      } catch (error) {
        console.error(`  ❌ Batch ${batchNum} error:`, error);
      }

      if (i + MAX_SERIES_PER_REQUEST < stateLAUSSeries.length) {
        await sleep(RATE_LIMIT_DELAY_MS);
      }
    }

    const stateLAUSOutputPath = path.join(OUTPUT_DIR, 'state-laus-data.json');
    fs.writeFileSync(stateLAUSOutputPath, JSON.stringify(stateLAUSResults, null, 2));
    console.log(`\n✅ State LAUS data written to ${stateLAUSOutputPath}\n`);
  }

  // ---- 5. Fetch unemployment rate, labor force, and labor market data ----
  await sleep(RATE_LIMIT_DELAY_MS);
  console.log('📊 Fetching unemployment rate, labor force, and labor market data...\n');

  const UNEMPLOYMENT_RATE_SERIES = 'LNS14000000';
  const LABOR_FORCE_SERIES = 'LNS11000000';
  const AVG_WEEKLY_HOURS_SERIES = 'CES0500000002';
  const AVG_HOURLY_EARNINGS_SERIES = 'CES0500000003';

  let laborMarketSeriesCount = 0;

  try {
    const laborSeries = [UNEMPLOYMENT_RATE_SERIES, LABOR_FORCE_SERIES,
                         AVG_WEEKLY_HOURS_SERIES, AVG_HOURLY_EARNINGS_SERIES];
    const laborResponse = await fetchBLSSeries(laborSeries, apiKey, '2020', DATA_END_YEAR);

    if (laborResponse.status === 'REQUEST_SUCCEEDED') {
      laborMarketSeriesCount = laborSeries.length;

      // Debug: dump all 2025 data points per series
      if (debug) {
        console.log('\n  [DEBUG] Labor market series — all 2025 data points:');
        const seriesNames: Record<string, string> = {
          [UNEMPLOYMENT_RATE_SERIES]: 'Unemployment Rate (LNS14000000)',
          [LABOR_FORCE_SERIES]: 'Labor Force (LNS11000000)',
          [AVG_WEEKLY_HOURS_SERIES]: 'Avg Weekly Hours (CES0500000002)',
          [AVG_HOURLY_EARNINGS_SERIES]: 'Avg Hourly Earnings (CES0500000003)',
        };
        for (const series of laborResponse.Results.series) {
          const name = seriesNames[series.seriesID] ?? series.seriesID;
          const pts2025 = series.data.filter(d => d.year === '2025');
          if (pts2025.length === 0) {
            console.log(`    ${name}: NO 2025 data points!`);
          } else {
            for (const d of pts2025) {
              console.log(`    ${name} | ${d.year} ${d.period} = ${d.value}`);
            }
          }
          // Also show M13 annual averages for all years
          const m13s = series.data.filter(d => d.period === 'M13');
          if (m13s.length > 0) {
            console.log(`    ${name} M13 annuals: ${m13s.map(d => `${d.year}=${d.value}`).join(', ')}`);
          } else {
            console.log(`    ${name}: NO M13 annual averages found`);
          }
        }
        console.log('');
      }

      for (const series of laborResponse.Results.series) {
        // Find annual average (M13) and latest monthly values
        const annualAvg = series.data.find(d => d.period === 'M13' && d.year === DATA_END_YEAR);
        const latestMonthly = series.data.find(d => d.period !== 'M13');
        const history = series.data
          .filter(d => d.period === 'M13')
          .map(d => ({ year: d.year, value: d.value }));

        if (series.seriesID === UNEMPLOYMENT_RATE_SERIES) {
          const output = {
            source: 'BLS Current Population Survey (CPS)',
            seriesId: UNEMPLOYMENT_RATE_SERIES,
            fetchedAt: new Date().toISOString(),
            annualAverage: annualAvg ? parseFloat(annualAvg.value) : null,
            latestMonthly: latestMonthly ? {
              year: latestMonthly.year,
              period: latestMonthly.period,
              value: parseFloat(latestMonthly.value),
            } : null,
            history,
            notes: 'Unemployment rate as percentage (e.g., 4.2 = 4.2%). LNS14000000.',
          };
          writeJSON(path.join(OUTPUT_DIR, 'unemployment-rate.json'), output);
        } else if (series.seriesID === LABOR_FORCE_SERIES) {
          const output = {
            source: 'BLS Current Population Survey (CPS)',
            seriesId: LABOR_FORCE_SERIES,
            fetchedAt: new Date().toISOString(),
            annualAverage: annualAvg ? parseFloat(annualAvg.value) : null,
            latestMonthly: latestMonthly ? {
              year: latestMonthly.year,
              period: latestMonthly.period,
              value: parseFloat(latestMonthly.value),
            } : null,
            history,
            notes: 'Civilian labor force level in thousands. LNS11000000.',
          };
          writeJSON(path.join(OUTPUT_DIR, 'labor-force.json'), output);
        } else {
          // Weekly hours and hourly earnings go into labor-market.json
          // (handled below after both are collected)
        }
      }

      // Build labor-market.json from hours + earnings series
      const hoursSeries = laborResponse.Results.series.find(s => s.seriesID === AVG_WEEKLY_HOURS_SERIES);
      const earningsSeries = laborResponse.Results.series.find(s => s.seriesID === AVG_HOURLY_EARNINGS_SERIES);

      const laborMarketOutput = {
        source: 'BLS Current Employment Statistics (CES)',
        fetchedAt: new Date().toISOString(),
        avgWeeklyHours: {
          seriesId: AVG_WEEKLY_HOURS_SERIES,
          annualAverage: hoursSeries?.data.find(d => d.period === 'M13' && d.year === DATA_END_YEAR)?.value ?? null,
          latestMonthly: hoursSeries?.data.find(d => d.period !== 'M13')?.value ?? null,
          history: hoursSeries?.data.filter(d => d.period === 'M13').map(d => ({ year: d.year, value: d.value })) ?? [],
        },
        avgHourlyEarnings: {
          seriesId: AVG_HOURLY_EARNINGS_SERIES,
          annualAverage: earningsSeries?.data.find(d => d.period === 'M13' && d.year === DATA_END_YEAR)?.value ?? null,
          latestMonthly: earningsSeries?.data.find(d => d.period !== 'M13')?.value ?? null,
          history: earningsSeries?.data.filter(d => d.period === 'M13').map(d => ({ year: d.year, value: d.value })) ?? [],
        },
        notes: 'Average weekly hours (CES0500000002) and average hourly earnings (CES0500000003), total private.',
      };
      writeJSON(path.join(OUTPUT_DIR, 'labor-market.json'), laborMarketOutput);

      console.log('  ✅ Unemployment rate, labor force, and labor market data written.\n');

      // Debug: cross-check consistency + derived annual wage
      if (debug) {
        const ueRate = laborResponse.Results.series.find(s => s.seriesID === UNEMPLOYMENT_RATE_SERIES);
        const lf = laborResponse.Results.series.find(s => s.seriesID === LABOR_FORCE_SERIES);
        const hrs = laborResponse.Results.series.find(s => s.seriesID === AVG_WEEKLY_HOURS_SERIES);
        const earn = laborResponse.Results.series.find(s => s.seriesID === AVG_HOURLY_EARNINGS_SERIES);

        const ueLatest = ueRate?.data.find(d => d.period !== 'M13');
        const lfLatest = lf?.data.find(d => d.period !== 'M13');
        const hrsLatest = hrs?.data.find(d => d.period !== 'M13');
        const earnLatest = earn?.data.find(d => d.period !== 'M13');

        // Total employment from CES (already fetched)
        const empData = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, 'total-employment.json'), 'utf-8'));
        const empDec = empData.data?.[0];
        const empValue = empDec ? parseInt(empDec.value, 10) * 1000 : NaN;

        const lfValue = lfLatest ? parseFloat(lfLatest.value) * 1000 : NaN;
        const ueValue = ueLatest ? parseFloat(ueLatest.value) / 100 : NaN;
        const hrsValue = hrsLatest ? parseFloat(hrsLatest.value) : NaN;
        const earnValue = earnLatest ? parseFloat(earnLatest.value) : NaN;

        console.log('  [DEBUG] Cross-check calculations:');
        console.log(`    Labor Force:      ${lfValue.toLocaleString()} (${lfLatest?.year} ${lfLatest?.period})`);
        console.log(`    Employment (CES): ${empValue.toLocaleString()} (${empDec?.year} ${empDec?.period})`);
        console.log(`    Gap:              ${(lfValue - empValue).toLocaleString()}`);
        console.log(`    Implied UE rate:  ${((lfValue - empValue) / lfValue * 100).toFixed(2)}%`);
        console.log(`    Reported UE rate: ${(ueValue * 100).toFixed(2)}% (${ueLatest?.year} ${ueLatest?.period})`);
        console.log('');
        console.log(`    Avg Weekly Hours:   ${hrsValue} (${hrsLatest?.year} ${hrsLatest?.period})`);
        console.log(`    Avg Hourly Earn:    $${earnValue} (${earnLatest?.year} ${earnLatest?.period})`);
        const derivedAnnualWage = hrsValue * earnValue * 52;
        console.log(`    Derived Annual Wage: $${derivedAnnualWage.toLocaleString(undefined, { maximumFractionDigits: 0 })} (hours × earnings × 52)`);
        console.log('');

        // NOTE: CES employment < CPS employment (CES excludes self-employed, agricultural).
        // The implied UE rate from CPS LF - CES employment will be ~7.5%, much higher than
        // the actual BLS unemployment rate (~4.4%) from CPS. This is NOT a data error.
        // The model uses CPS employment (via BASELINE_CPS_EMPLOYMENT) for unemployment calculations
        // and CES employment (via BASELINE_TOTAL_EMPLOYMENT) for cluster normalization only.
        const impliedUE = (lfValue - empValue) / lfValue;
        console.log(`    NOTE: CES/CPS gap = ${((impliedUE - ueValue) * 100).toFixed(2)}pp — this is expected.`);
        console.log(`          Model uses CPS employment for unemployment; CES for cluster normalization.`);
        console.log('');
      }
    } else {
      console.error(`  ⚠️  Labor market fetch failed: ${laborResponse.message.join(', ')}`);
    }
  } catch (error) {
    console.error('  ❌ Labor market data fetch error:', error);
  }

  // ---- 6. Fetch CPI sector indices (10-year history) ----
  await sleep(RATE_LIMIT_DELAY_MS);
  console.log('📈 Fetching CPI sector indices (10-year history)...\n');

  const CPI_SECTOR_SERIES: Record<string, string> = {
    'all_items':       'CUUR0000SA0',
    'medical_care':    'CUUR0000SAM',
    'food_away':       'CUUR0000SEFV',
    'food_home':       'CUUR0000SAF1',
    'shelter':         'CUUR0000SAH1',
    'transportation':  'CUUR0000SAT',
    'education_comm':  'CUUR0000SAE1',
    'info_technology': 'CUUR0000SEEE01',
    'apparel':         'CUUR0000SAA',
    'recreation':      'CUUR0000SAR',
    'other_services':  'CUUR0000SAS',
  };

  let cpiSectorSeriesCount = 0;

  try {
    const cpiSectorIds = Object.values(CPI_SECTOR_SERIES);
    const cpiSectorResponse = await fetchBLSSeries(cpiSectorIds, apiKey, '2015', DATA_END_YEAR);

    if (cpiSectorResponse.status === 'REQUEST_SUCCEEDED') {
      cpiSectorSeriesCount = cpiSectorIds.length;
      const sectorEntries = Object.entries(CPI_SECTOR_SERIES);

      const sectors: Record<string, {
        seriesId: string;
        annualValues: Record<string, number>;
        avgAnnualInflation10yr: number | null;
        latestAnnualInflation: number | null;
      }> = {};

      for (const series of cpiSectorResponse.Results.series) {
        const sectorEntry = sectorEntries.find(([, id]) => id === series.seriesID);
        if (!sectorEntry) continue;
        const [sectorName] = sectorEntry;

        // Compute annual averages from M13 periods
        const annualValues: Record<string, number> = {};
        for (const dp of series.data) {
          if (dp.period === 'M13') {
            annualValues[dp.year] = parseFloat(dp.value);
          }
        }

        // Compute average annual inflation over 10 years
        const years = Object.keys(annualValues).sort();
        let avgAnnualInflation10yr: number | null = null;
        let latestAnnualInflation: number | null = null;

        if (years.length >= 2) {
          const first = annualValues[years[0]];
          const last = annualValues[years[years.length - 1]];
          const span = parseInt(years[years.length - 1]) - parseInt(years[0]);
          if (first > 0 && span > 0) {
            avgAnnualInflation10yr = Math.pow(last / first, 1 / span) - 1;
          }

          // Latest annual inflation (second-to-last → last year)
          if (years.length >= 2) {
            const prevYear = years[years.length - 2];
            const lastYear = years[years.length - 1];
            const prev = annualValues[prevYear];
            const curr = annualValues[lastYear];
            if (prev > 0) {
              latestAnnualInflation = (curr - prev) / prev;
            }
          }
        }

        sectors[sectorName] = {
          seriesId: series.seriesID,
          annualValues,
          avgAnnualInflation10yr,
          latestAnnualInflation,
        };
      }

      const cpiSectorOutput = {
        source: 'BLS CPI-U Sector Indices',
        fetchedAt: new Date().toISOString(),
        startYear: '2015',
        endYear: DATA_END_YEAR,
        sectors,
        notes: 'Annual average CPI index values (period M13). Inflation rates computed from annual averages.',
      };

      // Debug: verify each sector's data and inflation computation
      if (debug) {
        console.log('  [DEBUG] CPI Sector Indices verification:');
        const expectedSectors = Object.keys(CPI_SECTOR_SERIES);
        const returnedSectors = Object.keys(sectors);
        const missingSectors = expectedSectors.filter(s => !returnedSectors.includes(s));
        if (missingSectors.length > 0) {
          console.log(`    ⚠️  Missing sectors (no data returned): ${missingSectors.join(', ')}`);
        }

        for (const [name, data] of Object.entries(sectors)) {
          const years = Object.keys(data.annualValues).sort();
          const hasData = years.length > 0;
          const yr2024 = data.annualValues['2024'];
          const yr2025 = data.annualValues['2025'];
          if (!hasData) {
            console.log(`    ⚠️  ${name}: NO annual values returned!`);
          } else {
            console.log(`    ${name.padEnd(18)} | years: ${years[0]}-${years[years.length - 1]} (${years.length}) | 2024=${yr2024 ?? 'N/A'}, 2025=${yr2025 ?? 'N/A'} | 10yr=${((data.avgAnnualInflation10yr ?? 0) * 100).toFixed(2)}% | latest=${((data.latestAnnualInflation ?? 0) * 100).toFixed(2)}%`);
            // Verify latest inflation calculation: (avg2025 - avg2024) / avg2024
            if (yr2024 && yr2025 && yr2024 > 0) {
              const computed = (yr2025 - yr2024) / yr2024;
              const stored = data.latestAnnualInflation ?? 0;
              if (Math.abs(computed - stored) > 0.0001) {
                console.log(`      ⚠️  Inflation mismatch! Computed: ${(computed * 100).toFixed(4)}%, Stored: ${(stored * 100).toFixed(4)}%`);
              }
            }
          }
        }
        console.log('');
      }

      writeJSON(path.join(OUTPUT_DIR, 'cpi-sector-indices.json'), cpiSectorOutput);
      console.log(`  ✅ CPI sector indices written (${Object.keys(sectors).length} sectors).\n`);
    } else {
      console.error(`  ⚠️  CPI sector fetch failed: ${cpiSectorResponse.message.join(', ')}`);
    }
  } catch (error) {
    console.error('  ❌ CPI sector indices fetch error:', error);
  }

  // ---- 7. Write CPI relative importance weights ----
  // These are hardcoded from the BLS published table — update annually.
  // Source: BLS CPI Relative Importance, December 2024
  // https://www.bls.gov/cpi/tables/relative-importance/2024.htm
  console.log('📋 Writing CPI relative importance weights...');

  const cpiWeightsOutput = {
    source: 'BLS CPI Relative Importance, December 2024',
    url: 'https://www.bls.gov/cpi/tables/relative-importance/2024.htm',
    fetchedAt: new Date().toISOString(),
    dataYear: 2024,
    weights: {
      food_home:       0.079,   // Food at home (SA series SAF1)
      food_away:       0.056,   // Food away from home (SA series SEFV)
      shelter:         0.370,   // Shelter — rent, OER (SA series SAH1)
      medical_care:    0.084,   // Medical care — commodities + services (SA series SAM)
      transportation:  0.151,   // Transportation — vehicles + fuel + services (SA series SAT)
      education_comm:  0.062,   // Education and communication (SA series SAE1)
      info_technology: 0.013,   // Information technology hardware + services (SA series SEEE01)
      apparel:         0.025,   // Apparel (SA series SAA)
      recreation:      0.053,   // Recreation (SA series SAR)
      other_services:  0.032,   // Other goods and services (SA series SAS)
      energy:          0.062,   // Energy (fuel + electricity + gas — cross-cutting)
      other_goods:     0.013,   // Residual (durables, nondurables not elsewhere classified)
    },
    notes: 'Published BLS weights from December 2024 Relative Importance table. These are approximate values from the published BLS data — verify against the source URL for exact figures. Weights should sum to ~1.0. Update annually when BLS publishes new relative importance data.',
  };

  // Verify weights sum
  const weightSum = Object.values(cpiWeightsOutput.weights).reduce((a, b) => a + b, 0);
  console.log(`  Weight sum: ${weightSum.toFixed(3)} (target: 1.000)`);

  if (debug) {
    console.log('  [DEBUG] CPI weight breakdown:');
    for (const [name, weight] of Object.entries(cpiWeightsOutput.weights)) {
      console.log(`    ${name.padEnd(18)}: ${weight.toFixed(3)}`);
    }
    if (Math.abs(weightSum - 1.0) > 0.05) {
      console.log(`  ⚠️  Weight sum ${weightSum.toFixed(3)} differs from 1.000 by more than 5%!`);
    }
  }

  writeJSON(path.join(OUTPUT_DIR, 'cpi-sector-weights.json'), cpiWeightsOutput);
  console.log('  ✅ CPI sector weights written.\n');

  // ---- 8. Write metadata ----
  const metadata: Record<string, unknown> = {
    fetchedAt: new Date().toISOString(),
    startYear: DATA_START_YEAR,
    endYear: DATA_END_YEAR,
    clusterCount: Object.keys(oewsResults).length,
    totalSeriesFetched: allSeriesIds.length + stateOEWSSeriesCount + stateLAUSSeriesCount + laborMarketSeriesCount + cpiSectorSeriesCount,
    source: 'Bureau of Labor Statistics (api.bls.gov)',
    notes: 'OEWS data is annual. CPI is monthly. Re-run when new data is published.',
    includesStateData: includeStates,
    laborMarketSeriesCount,
    cpiSectorSeriesCount,
  };

  if (includeStates) {
    metadata.stateOEWSSeriesCount = stateOEWSSeriesCount;
    metadata.stateLAUSSeriesCount = stateLAUSSeriesCount;
    metadata.stateCount = Object.keys(STATE_FIPS).length;
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'metadata.json'), JSON.stringify(metadata, null, 2));

  console.log('========================');
  console.log('🎉 All data fetched successfully!');
  console.log(`   Output directory: ${OUTPUT_DIR}`);
  console.log(`   Clusters: ${Object.keys(oewsResults).length}`);
  if (includeStates) {
    console.log(`   States: ${Object.keys(STATE_FIPS).length} (OEWS + LAUS)`);
  }
  console.log(`   Run "npm run dev" to start the app with real data.\n`);
}

// ============================================================
// CLI Entry Point
// ============================================================

const args = process.argv.slice(2);
let apiKey = process.env.BLS_API_KEY;

// Parse --key flag
const keyIndex = args.indexOf('--key');
if (keyIndex !== -1 && args[keyIndex + 1]) {
  apiKey = args[keyIndex + 1];
}

// Parse --include-states flag
const includeStates = args.includes('--include-states');

// Parse --debug flag
const debug = args.includes('--debug');

if (!apiKey) {
  console.error('❌ No BLS API key provided.');
  console.error('   Usage: npx tsx scripts/fetch-bls-data.ts --key YOUR_API_KEY');
  console.error('   Or:    BLS_API_KEY=YOUR_KEY npx tsx scripts/fetch-bls-data.ts');
  console.error('   Flags: --include-states  Fetch state-level OEWS + LAUS data');
  console.error('          --debug           Print raw API data for verification');
  console.error('\n   Get a free key at: https://data.bls.gov/registrationEngine/');
  process.exit(1);
}

fetchAllData(apiKey, includeStates, debug).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});