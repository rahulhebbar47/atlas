# ATLAS Data Sourcing: Complete Government Data Mapping

## Methodology

Every hardcoded constant and estimated parameter in ATLAS is mapped below 
to its ideal real-data source. Priority levels:
- **P0**: Baseline-critical. Wrong value = wrong model. Must use real data.
- **P1**: Accuracy-critical. Significantly improves projection quality.
- **P2**: Nice-to-have. Improves granularity but model works without it.

---

## 1. GDP AND MACROECONOMIC BASELINE

### What we need:
| Variable | Current | Real Source | Priority |
|----------|---------|-------------|----------|
| Baseline GDP nominal (2025) | Hardcoded $29T | BEA NIPA Table 1.1.5 Line 1 | P0 |
| Baseline GDP real (2025) | = nominal | BEA NIPA Table 1.1.6 Line 1 (chained 2017$) | P0 |
| GDP deflator (2025) | Not used | BEA NIPA Table 1.1.9 Line 1 | P1 |
| C (consumption) | Hardcoded 0.68 | BEA NIPA Table 1.1.5 Line 2 / GDP | P0 |
| I (investment) | Hardcoded 0.15 | BEA NIPA Table 1.1.5 Line 7 / GDP | P0 |
| G (govt consumption+investment) | Hardcoded 0.18 | BEA NIPA Table 1.1.5 Line 21 / GDP | P0 |
| NX (net exports) | Hardcoded -0.03 | BEA NIPA Table 1.1.5 Line 14 / GDP | P0 |
| Real GDP growth rate (2025) | Hardcoded 0.02 | BEA NIPA Table 1.1.1 (% change real GDP) | P0 |
| Base inflation rate | Hardcoded 0.02 | BLS CPI-U annual % change (2024→2025) | P0 |

### BEA API calls:
```
DataSetName=NIPA&TableName=T10105&Frequency=A&Year=2025  → GDP components (nominal)
DataSetName=NIPA&TableName=T10106&Frequency=A&Year=2025  → GDP components (real, chained $)
DataSetName=NIPA&TableName=T10101&Frequency=A&Year=2024,2025  → GDP % change (real)
DataSetName=NIPA&TableName=T10109&Frequency=A&Year=2025  → GDP deflator
```

### BLS API calls:
```
Series: CUUR0000SA0 (CPI-U All Items)  → compute 2024→2025 annual inflation
```

---

## 2. PERSONAL INCOME COMPOSITION (Wage / Asset / Transfer Shares)

### What we need:
| Variable | Current | Real Source | Priority |
|----------|---------|-------------|----------|
| Total personal income | Derived | BEA NIPA Table 2.1 Line 1 | P0 |
| Wage & salary disbursements | Hardcoded 0.60 | BEA NIPA Table 2.1 Line 3 | P0 |
| Supplements to wages (employer contributions) | Lumped with wages | BEA Table 2.1 Line 6 | P1 |
| Proprietors' income | Not tracked | BEA Table 2.1 Line 9 | P1 |
| Personal income on assets (rent+interest+dividends) | Hardcoded 0.20 | BEA Table 2.1 Line 12 | P0 |
| Rental income | Not separated | BEA Table 2.1 Line 13 | P2 |
| Dividend income | Not separated | BEA Table 2.1 Line 15 | P2 |
| Interest income | Not separated | BEA Table 2.1 Line 14 | P2 |
| Government social benefits (transfers) | Hardcoded 0.20 | BEA Table 2.1 Line 17 | P0 |

### Transfer income breakdown (validates our $5.8T assumption):
| Sub-component | Real Source | Priority |
|--------------|-------------|----------|
| Social Security (OASDI) | BEA Table 3.12 Line 3 | P1 |
| Medicare benefits | BEA Table 3.12 Line 5 | P1 |
| Medicaid | BEA Table 3.12 Line 26 | P1 |
| Unemployment insurance | BEA Table 3.12 Line 8 | P1 |
| SNAP / food assistance | BEA Table 3.12 Line 24 | P2 |
| Veterans benefits | BEA Table 3.12 Line 16 | P2 |
| Other transfers | BEA Table 3.12 remaining | P2 |

**Why the breakdown matters**: The transfer_per_incremental_unemployed 
calculation needs to know how much existing UI pays. And the baseline 
transfer amount tells us the fiscal starting point for new policies.

### BEA API calls:
```
DataSetName=NIPA&TableName=T20100&Frequency=A&Year=2025  → Personal income composition
DataSetName=NIPA&TableName=T30120&Frequency=A&Year=2025  → Transfer payment breakdown
```

---

## 3. EMPLOYMENT AND LABOR MARKET

### What we need:
| Variable | Current | Real Source | Priority |
|----------|---------|-------------|----------|
| Total nonfarm employment | BLS CES (already fetched) | BLS CES0000000001 | P0 |
| Labor force | Hardcoded 168M | BLS LNS11000000 | P0 |
| Unemployment rate | Derived | BLS LNS14000000 | P0 |
| Average weekly hours | Not used | BLS CES0500000002 | P1 |
| Average hourly earnings | Not used | BLS CES0500000003 | P1 |
| Per-cluster employment | BLS OEWS (already fetched) | BLS OEWS series | P0 |
| Per-cluster wages | BLS OEWS (already fetched) | BLS OEWS series | P0 |
| Job openings (JOLTS) | Not used | BLS JTS00000000JOL | P2 |
| Quits rate | Not used | BLS JTS00000000QUR | P2 |

### Phillips Curve calibration:
| Variable | Current | Real Source | Priority |
|----------|---------|-------------|----------|
| Natural unemployment rate (NAIRU) | Derived (~5.8%) | CBO estimate or BLS U-4/U-5 spread | P1 |
| Historical unemployment-wage relationship | Hardcoded β=1.5 | BLS wage + unemployment data (10yr regression) | P1 |

**Why JOLTS matters**: Job openings vs unemployment (the Beveridge curve) 
tells us how tight the labor market is. As AI displaces workers, openings 
should decline in automated sectors while potentially rising in others. 
This is P2 for now but becomes important for the "new jobs" model.

### BLS API calls (additions to existing script):
```
Series: LNS11000000        → Civilian labor force (monthly)
Series: LNS14000000        → Unemployment rate (monthly)
Series: CES0500000002      → Average weekly hours, private
Series: CES0500000003      → Average hourly earnings, private
Series: JTS00000000JOL     → Job openings, total nonfarm (JOLTS)
Series: JTS00000000QUR     → Quits rate (JOLTS)
```

---

## 4. PRICE LEVEL AND INFLATION

### CPI Component Weights (for sector-weighted deflation):
| Variable | Current | Real Source | Priority |
|----------|---------|-------------|----------|
| CPI shelter weight | Hardcoded 0.330 | BLS CPI relative importance table | P0 |
| CPI food weight | Hardcoded 0.135 | BLS CPI relative importance table | P0 |
| CPI medical care weight | Hardcoded 0.085 | BLS CPI relative importance table | P0 |
| CPI transportation weight | Hardcoded 0.085 | BLS CPI relative importance table | P0 |
| CPI education weight | Hardcoded 0.030 | BLS CPI relative importance table | P0 |
| CPI apparel weight | Hardcoded 0.080 | BLS CPI relative importance table | P0 |
| [all other CPI categories] | Hardcoded | BLS CPI relative importance table | P0 |

BLS publishes CPI relative importance weights annually. These tell us 
exactly how much each sector contributes to the consumer price basket.
This directly replaces our hardcoded SECTOR_CPI_WEIGHTS table.

### Sector-level price indices (for deflation calibration):
| Variable | Current | Real Source | Priority |
|----------|---------|-------------|----------|
| CPI Medical care | Not tracked per-sector | BLS CUUR0000SAM | P1 |
| CPI Food away from home | Not tracked per-sector | BLS CUUR0000SEFV | P1 |
| CPI Shelter | Not tracked per-sector | BLS CUUR0000SAH1 | P1 |
| CPI Transportation | Not tracked per-sector | BLS CUUR0000SAT | P1 |
| CPI Education | Not tracked per-sector | BLS CUUR0000SAE1 | P1 |
| CPI Information technology | Not tracked per-sector | BLS CUUR0000SEEE01 | P1 |
| CPI Apparel | Not tracked per-sector | BLS CUUR0000SAA | P1 |

**Why per-sector CPI matters**: If healthcare CPI has risen 4%/year for 
a decade while tech goods CPI has fallen 2%/year, that tells us the 
DEFLATION_INTENSITY constants are wrong. Healthcare prices are sticky 
(regulated, insurance-mediated) so even full automation might not reduce 
them as much as our 0.4 assumes. Tech prices already deflate without AI, 
so the AI-only deflation increment might be smaller. Historical sector 
CPI trends CALIBRATE our deflation intensity constants.

### BLS API calls:
```
# CPI relative importance (weights) — published as a table, not a time series
# May need web scrape from: https://www.bls.gov/cpi/tables/relative-importance/
# Or use the CPI item structure series

# Sector CPI indices (for calibration):
Series: CUUR0000SA0     → CPI All items (already fetched)
Series: CUUR0000SAM     → CPI Medical care
Series: CUUR0000SEFV    → CPI Food away from home
Series: CUUR0000SAH1    → CPI Shelter
Series: CUUR0000SAT     → CPI Transportation
Series: CUUR0000SAE1    → CPI Education/communication
Series: CUUR0000SEEE01  → CPI Information technology
Series: CUUR0000SAA     → CPI Apparel
Series: CUUR0000SAF1    → CPI Food at home
Series: CUUR0000SAS     → CPI Other services
Series: CUUR0000SAR     → CPI Recreation
```

---

## 5. MONETARY MODEL (Fisher Equation)

### What we need:
| Variable | Current | Real Source | Priority |
|----------|---------|-------------|----------|
| Money supply M2 | Not tracked | Federal Reserve H.6 (via FRED) | P1 |
| Velocity of money | Hardcoded 1.122 | Derived: GDP / M2 (from FRED) | P1 |
| Federal funds rate | Not tracked | Federal Reserve H.15 (via FRED) | P2 |

**Note**: The Federal Reserve data is available through FRED (Federal 
Reserve Economic Data) API at https://api.stlouisfed.org/fred/
This is a THIRD data source beyond BEA and BLS.

### FRED API calls:
```
Series: M2SL        → M2 money supply (billions, monthly)
Series: M2V         → Velocity of M2 (quarterly, directly computed)
Series: FEDFUNDS    → Federal funds effective rate (monthly)
```

**Why velocity matters**: Our Fisher equation (MV=PY) uses velocity to 
compute the neutral zone for transfers. If V is declining (it has been 
for decades), the model underestimates how much money injection is needed 
to maintain demand. Real M2V data from FRED gives us the actual trend.

---

## 6. STATE-LEVEL DATA

### What we need:
| Variable | Current | Real Source | Priority |
|----------|---------|-------------|----------|
| State GDP | Not per-state | BEA Regional → GDP by state | P1 |
| State employment by industry | BLS state OEWS | BLS state OEWS (already planned) | P1 |
| State unemployment rates | Not per-state | BLS LAUS (Local Area Unemployment) | P1 |
| State personal income | Not per-state | BEA Regional → Personal income by state | P1 |
| State CPI / price parities | Not per-state | BEA Regional → RPPs (Regional Price Parities) | P1 |
| State minimum wages | Hardcoded | Dept of Labor or manual table | P1 |
| State UI replacement rates | Hardcoded | DOL ETA reports | P2 |
| State UI max duration (weeks) | Hardcoded | DOL ETA reports | P2 |

### BEA API calls:
```
DataSetName=Regional&TableName=SAGDP2N&GeoFips=STATE&Year=2025  → State GDP by industry
DataSetName=Regional&TableName=SAINC1&GeoFips=STATE&Year=2025   → State personal income
DataSetName=Regional&TableName=SARPP&GeoFips=STATE&Year=2025    → Regional Price Parities
```

### BLS API calls:
```
# LAUS (Local Area Unemployment Statistics)
Series: LASST[FIPS]0000000000003  → State unemployment rate (one per state)
Series: LASST[FIPS]0000000000005  → State employment (one per state)
Series: LASST[FIPS]0000000000006  → State labor force (one per state)
```

**Why Regional Price Parities matter**: $50K salary in Mississippi buys 
far more than in San Francisco. When we model state-level ARPP, we need 
to adjust by local price levels. BEA RPPs give us exactly this — the 
relative cost of living by state. Without this, our state map shows 
nominal values that are misleading.

---

## 7. INPUT-OUTPUT MODEL (Second-Order Employment Multipliers)

### What we need:
| Variable | Current | Real Source | Priority |
|----------|---------|-------------|----------|
| Employment multipliers by industry | Hardcoded (3.4x trucking, etc.) | BEA InputOutput tables | P1 |
| Inter-industry dependency matrix | Hardcoded adjacency weights | BEA InputOutput "Use" table | P1 |
| Value-added by industry | Not tracked | BEA InputOutput or GDPByIndustry | P2 |

### BEA API calls:
```
DataSetName=InputOutput&TableID=2&Year=2022  → "Use" table (commodity by industry)
DataSetName=InputOutput&TableID=56&Year=2022 → Requirements table (Type I multipliers)
DataSetName=InputOutput&TableID=58&Year=2022 → Requirements table (Type II multipliers, includes induced)
DataSetName=GDPByIndustry&TableID=1&Frequency=A&Year=2025&Industry=ALL  → Value added by industry
```

**Why this is P1**: Our second-order multipliers (Section 9 of DATA_MODEL) 
are currently hand-estimated. The BEA publishes the exact multipliers 
we need. When trucking is automated, how many truck stop jobs disappear? 
The Input-Output "Use" table gives the precise inter-industry flows. 
The Requirements tables give the exact multipliers. These replace our 
guessed values of 3.4x for trucking, 4.3x for tech, etc.

The Input-Output tables are published ~every 5 years (latest: 2022). 
Close enough for our purposes.

---

## 8. INDUSTRY-LEVEL GDP (for sector deflation calibration)

### What we need:
| Variable | Current | Real Source | Priority |
|----------|---------|-------------|----------|
| GDP by industry (value added) | Not tracked | BEA GDPByIndustry | P1 |
| Industry output | Not tracked | BEA GDPByIndustry | P2 |
| Industry employment | BLS OEWS (partial) | BEA GDPByIndustry (KLEMS employment) | P1 |
| Industry labor share | Not tracked | BEA GDPByIndustry (compensation / value added) | P1 |

### BEA API call:
```
DataSetName=GDPByIndustry&TableID=1&Frequency=A&Year=2025&Industry=ALL
DataSetName=GDPByIndustry&TableID=10&Frequency=A&Year=2025&Industry=ALL  → KLEMS data
```

**Why industry labor share matters**: Our DEFLATION_INTENSITY constants 
(0.8 for tech, 0.3 for construction) estimate how much of each sector's 
cost is labor. BEA GDPByIndustry directly tells us labor compensation as 
a fraction of value added for EVERY industry. This replaces our guesses 
with real data:
- Information sector: compensation/value_added = ?% 
- Construction: compensation/value_added = ?%
- Healthcare: compensation/value_added = ?%

These values ARE the deflation intensity — if 70% of an industry's value 
added is labor, then fully automating it can reduce costs by at most 70%.

---

## 9. UI AND TRANSFER PROGRAM PARAMETERS

### What we need:
| Variable | Current | Real Source | Priority |
|----------|---------|-------------|----------|
| UI average weekly benefit | Hardcoded | DOL ETA 5159 report | P1 |
| UI average duration (weeks) | Hardcoded 26 weeks | DOL ETA 5159 report | P1 |
| UI replacement rate | Hardcoded 45% | DOL ETA 5159 report | P1 |
| UI coverage rate (% of unemployed receiving UI) | Not tracked | DOL ETA statistics | P1 |
| Average Social Security benefit | Not tracked | SSA annual report | P2 |
| SNAP average benefit | Not tracked | USDA FNS data | P2 |

**Why UI coverage rate matters**: Only ~28% of unemployed workers 
currently receive UI benefits (due to eligibility restrictions, 
exhaustion, etc.). Our model assumes all newly unemployed get UI at 
the replacement rate — this dramatically overstates the transfer cushion.

---

## SUMMARY: Data Sources to Integrate

### Tier 1 — Must Have (P0: wrong without it)

| Source | API | Data | Est. Series |
|--------|-----|------|-------------|
| BEA NIPA | apps.bea.gov/api | GDP, components, income, transfers | ~8 tables |
| BLS CES | api.bls.gov | Employment, wages, hours | Already done |
| BLS CPI | api.bls.gov | Inflation rate, CPI weights | ~12 series |
| BLS LAUS | api.bls.gov | Unemployment, labor force | ~4 series |

### Tier 2 — Should Have (P1: significantly more accurate)

| Source | API | Data | Est. Series |
|--------|-----|------|-------------|
| BEA Regional | apps.bea.gov/api | State GDP, income, price parities | ~150+ series (50 states × 3) |
| BEA GDPByIndustry | apps.bea.gov/api | Industry value added, labor share | ~20 industries |
| BEA InputOutput | apps.bea.gov/api | Employment multipliers, inter-industry flows | 3 tables |
| BEA NIPA Table 3.12 | apps.bea.gov/api | Transfer payment breakdown | 1 table |
| FRED (St. Louis Fed) | api.stlouisfed.org | M2, velocity, fed funds rate | ~3 series |
| BLS sector CPI | api.bls.gov | Per-sector price indices (10yr history) | ~10 series |

### Tier 3 — Nice to Have (P2)

| Source | API | Data | Est. Series |
|--------|-----|------|-------------|
| BLS JOLTS | api.bls.gov | Job openings, quits rate | ~2 series |
| DOL ETA | manual or scrape | UI benefit parameters by state | 50 states |
| SSA | ssa.gov | Social Security benefit levels | Manual |
| BEA ITA | apps.bea.gov/api | Trade composition for NX modeling | Low priority |

---

## IMPLEMENTATION PRIORITY

### Phase 1: Core Baseline (do now)
1. BEA NIPA → GDP, components, income shares, transfers
2. BLS additions → labor force, unemployment rate, inflation rate
3. FRED → M2 velocity

### Phase 2: Sector Calibration (do next)
4. BLS CPI weights → replace hardcoded SECTOR_CPI_WEIGHTS
5. BEA GDPByIndustry → replace hardcoded DEFLATION_INTENSITY with real labor shares
6. BLS sector CPI history → validate deflation intensity assumptions

### Phase 3: State & Multiplier Accuracy (do after)
7. BEA Regional → state GDP, income, price parities
8. BEA InputOutput → real employment multipliers
9. BLS LAUS → state unemployment rates

### Phase 4: Fine-Tuning (polish)
10. BEA NIPA 3.12 → transfer payment breakdown (calibrate UI model)
11. FRED additional → fed funds rate for monetary model
12. BLS JOLTS → labor market tightness
13. DOL ETA → UI parameters by state

---

## NEW CONSTANTS DERIVED FROM REAL DATA

After fetching all Tier 1+2 data, these hardcoded values get replaced:

| Constant | Hardcoded | Replaced By |
|----------|-----------|-------------|
| BASELINE_GDP_NOMINAL_2025 | $29T | BEA NIPA T10105 |
| CONSUMPTION_GDP_FRACTION | 0.68 | BEA NIPA T10105 (C/GDP) |
| INVESTMENT_GDP_FRACTION | 0.15 | BEA NIPA T10105 (I/GDP) |
| GOVERNMENT_SPENDING_GDP_FRACTION | 0.18 | BEA NIPA T10105 (G/GDP) |
| NET_EXPORT_GDP_FRACTION | -0.03 | BEA NIPA T10105 (NX/GDP) |
| BASELINE_WAGE_SHARE | 0.60 | BEA NIPA T20100 |
| BASELINE_ASSET_SHARE | 0.20 | BEA NIPA T20100 |
| BASELINE_TRANSFER_SHARE | 0.20 | BEA NIPA T20100 |
| BASELINE_REAL_GDP_GROWTH | 0.02 | BEA NIPA T10101 |
| BASE_INFLATION_RATE | 0.02 | BLS CPI-U annual change |
| BASELINE_VELOCITY | 1.122 | FRED M2V |
| SECTOR_CPI_WEIGHTS | Guessed | BLS CPI relative importance |
| SECTOR_DEFLATION_INTENSITY | Guessed | BEA GDPByIndustry labor share |
| Employment multipliers | Guessed | BEA InputOutput requirements |
| State price levels | Not done | BEA Regional RPP |
| UI replacement rate | 0.45 | DOL ETA data |
| Natural unemployment rate | ~0.058 | CBO NAIRU estimate (via FRED NROU) |

---

## FETCH SCRIPT ARCHITECTURE

Three scripts, matching the three primary APIs:

```
scripts/fetch-bea-data.ts   → BEA API (GDP, income, industry, state, I/O)
scripts/fetch-bls-data.ts   → BLS API (employment, wages, CPI, unemployment)  [exists, expand]
scripts/fetch-fred-data.ts  → FRED API (M2, velocity, NAIRU, fed funds)
```

Output structure:
```
src/data/
  bea/
    gdp-components.json          ← NIPA T10105
    gdp-real.json                ← NIPA T10106
    gdp-growth.json              ← NIPA T10101
    gdp-deflator.json            ← NIPA T10109
    personal-income.json         ← NIPA T20100
    transfer-breakdown.json      ← NIPA T30120
    gdp-by-industry.json         ← GDPByIndustry
    input-output-multipliers.json ← InputOutput requirements
    state-gdp.json               ← Regional SAGDP
    state-income.json            ← Regional SAINC
    state-price-parities.json    ← Regional SARPP
    metadata.json
  bls/
    oews-data.json               ← existing
    cpi-data.json                ← existing (expand)
    cpi-sector-weights.json      ← NEW: CPI relative importance
    cpi-sector-indices.json      ← NEW: per-sector CPI history
    total-employment.json        ← existing (update to 2025)
    unemployment-rate.json       ← NEW
    labor-force.json             ← NEW
    labor-market.json            ← NEW: hours, earnings
    state-unemployment.json      ← NEW: LAUS data
    metadata.json
  fred/
    m2-money-supply.json         ← M2SL
    m2-velocity.json             ← M2V
    nairu.json                   ← NROU (CBO natural rate)
    fed-funds-rate.json          ← FEDFUNDS
    metadata.json
```

Each JSON file includes:
- The data values
- Source table/series ID
- Fetch timestamp
- Data year/period
- Any computation notes (e.g., "wageShare = Line3 / Line1")