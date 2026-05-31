# BLS_API.md — Bureau of Labor Statistics Data Integration

## Overview

ATLAS uses real employment and wage data from the BLS, fetched at **build time** and shipped as static JSON. There are NO runtime API calls and NO user-facing API key prompts. The data lives in `src/data/bls/` as JSON files that the app imports directly.

**Data fetch script**: `scripts/fetch-bls-data.ts`
**How to run**: `npx tsx scripts/fetch-bls-data.ts --key YOUR_BLS_API_KEY`
**Output**: JSON files in `src/data/bls/` (oews-data.json, cpi-data.json, total-employment.json, metadata.json)
**When to re-run**: When BLS publishes new data (OEWS: annually each May)

The API key belongs to the project maintainer and is NEVER shipped to users, committed to git, or embedded in client code.

**BLS API Docs**: https://www.bls.gov/developers/
**Registration**: https://data.bls.gov/registrationEngine/

---

## Key Data Sources

### 1. Occupational Employment and Wage Statistics (OEWS)
- **What**: Employment counts and wage data for ~830 detailed occupations
- **Series ID format**: `OEUM[area_code][area_type][industry_code][occupation_code][data_type]`
- **Frequency**: Annual (released each May)
- **Use in ATLAS**: Baseline employment counts and wage levels per occupation cluster

### 2. Current Employment Statistics (CES)
- **What**: Monthly employment by industry (total nonfarm, manufacturing, services, etc.)
- **Series ID format**: `CES[seasonal][industry_code][data_type]`
- **Frequency**: Monthly
- **Use in ATLAS**: Real-time employment trend tracking, seasonal adjustment

### 3. Local Area Unemployment Statistics (LAUS)
- **What**: Monthly unemployment rates by state and metro area
- **Series ID format**: `LAUS[area_code][measure_code]`
- **Frequency**: Monthly
- **Use in ATLAS**: State-level unemployment baseline for policy simulation

### 4. Consumer Price Index (CPI)
- **What**: Price level changes over time
- **Series ID format**: `CUUR0000SA0` (all items, US city average, not seasonally adjusted)
- **Frequency**: Monthly
- **Use in ATLAS**: Historical price level data, inflation/deflation tracking

### 5. Employment Projections (EP)
- **What**: BLS's own 10-year employment projections by occupation
- **Use in ATLAS**: Comparison baseline — how do ATLAS predictions differ from BLS's (non-AI-adjusted) projections?

---

## API Usage

### Endpoint
```
POST https://api.bls.gov/publicAPI/v2/timeseries/data/
```

### Request Body
```json
{
  "seriesid": ["CES0000000001", "CES0500000001"],
  "startyear": "2014",
  "endyear": "2024",
  "catalog": true,
  "calculations": true,
  "annualaverage": true,
  "aspects": true,
  "registrationkey": "YOUR_API_KEY"
}
```

### Rate Limits (v2 with key)
- 500 requests per day
- 50 series per request
- 20 years of data per request

### Response Format
```json
{
  "status": "REQUEST_SUCCEEDED",
  "Results": {
    "series": [
      {
        "seriesID": "CES0000000001",
        "data": [
          {
            "year": "2024",
            "period": "M12",
            "periodName": "December",
            "value": "157200",
            "footnotes": [{}]
          }
        ]
      }
    ]
  }
}
```

---

## Data Architecture in ATLAS

### Static JSON Files (src/data/bls/)

After running the fetch script, the following files exist:

```
src/data/bls/
├── oews-data.json         # Employment counts + wages for all 51 clusters
├── cpi-data.json          # Consumer Price Index time series
├── total-employment.json  # Total nonfarm employment
└── metadata.json          # Fetch timestamp, data year, source info
```

The app imports these directly:
```typescript
import oewsData from '@/data/bls/oews-data.json';
import cpiData from '@/data/bls/cpi-data.json';
```

### Data Transform Layer (src/services/dataTransform.ts)

Transforms raw BLS JSON into the model's `OccupationBaseline` format at app initialization. This runs once on load — NOT on every render.

```typescript
interface OccupationBaseline {
  clusterId: OccupationClusterId;
  totalEmployment: number;
  roleBreakdown: Map<RoleLevel, {
    estimatedEmployment: number;
    medianWage: number;
    meanWage: number;
    wagePercentiles: { p10: number; p25: number; p75: number; p90: number };
  }>;
  stateDistribution: Map<StateCode, number>;
}
```

### Data Freshness

The app displays "Data source: BLS OEWS [year]" in the footer/settings, read from `metadata.json`. There is no runtime API key, no user prompt, no fetch button. If the data files are missing, the app shows an error: "BLS data not found. Run: npx tsx scripts/fetch-bls-data.ts --key YOUR_KEY"

### Role-Level Estimation

BLS doesn't directly provide seniority-level breakdowns within an occupation. We estimate using:
- **Wage percentile distribution**: P10-P25 ≈ junior, P25-P75 ≈ mid, P75-P90 ≈ senior, P90+ ≈ principal
- **Employment share assumptions**: ~30% junior, ~45% mid, ~20% senior, ~5% principal (adjustable per cluster)

These estimation parameters are stored in `src/data/roleEstimation.ts` and are user-adjustable in the UI.

---

## Fetch Script Notes (scripts/fetch-bls-data.ts)

### Error Handling
- Invalid series IDs: logged and skipped, don't fail the whole batch
- Rate limiting: 1.5s delay between batches (BLS allows 500 requests/day)
- Network failure: script exits with error, can be re-run safely

### Batching
- 50 series max per request (BLS limit)
- All OEWS series grouped into batches automatically
- ~10 batches needed for all 51 clusters × 3 data types

### Re-running the Script
- Safe to re-run at any time — overwrites existing JSON files
- Run after BLS publishes new OEWS data (annually, usually May)
- Commit updated JSON files to git after re-running

### State-Level Data
- OEWS provides state-level occupation data with area codes
- State FIPS codes: AL=01, AK=02, ..., WY=56
- Metro area data available but probably too granular for v1

---

## Co-Primary Data Sources

ATLAS integrates three government data sources, all equally important to the model. Each is fetched at build time and shipped as static JSON — no runtime API calls.

### Bureau of Labor Statistics (BLS)
- **Employment and wage data**: OEWS employment counts and wages for all 51 occupation clusters, LAUS state-level unemployment and labor force data
- **Static files**: `src/data/bls/` (oews-data.json, cpi-data.json, total-employment.json, state OEWS/LAUS data)
- **Fetch script**: `scripts/fetch-bls-data.ts`
- API: https://www.bls.gov/developers/

### Bureau of Economic Analysis (BEA)
- **GDP components**: consumption, investment, government spending, net exports
- **Employment multipliers**: input-output tables for second-order employment effects
- **Price indices**: GDP deflator, industry-level price indices, state price parities (RPPs)
- **Government fiscal data**: federal/state spending and receipts
- **Static files**: `src/data/bea/`
- API: https://apps.bea.gov/api/

### Federal Reserve Economic Data (FRED)
- **Macroeconomic indicators**: M2 money supply velocity, CPI components, housing starts, mortgage rates, federal funds rate, NAIRU, unemployment rate, senior loan officer survey (lending standards)
- **Static files**: `src/data/fred/`
- API: https://api.stlouisfed.org/fred/

### Data Loading

All three sources are loaded at startup via `src/data/loadGovernmentData.ts`, which reads the static JSON files from `src/data/bls/`, `src/data/bea/`, and `src/data/fred/`. The data is validated, transformed into the model's typed interfaces, and made available to the simulation engine before the first render.

### Census Bureau (Supplementary)
- American Community Survey for demographic overlay
- County Business Patterns for local industry composition
- Not yet integrated; available for future phases
