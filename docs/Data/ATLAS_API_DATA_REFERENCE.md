# ATLAS API Data Reference — Complete Independent Audit Package

**Generated**: 2026-02-16
**Purpose**: Enable external reviewers to verify ATLAS model calibration against real government data and reproduce CSV export values from first principles.

---

## Section 1: Raw Government Data Sources

### 1A: BEA Data

#### GDP Components
- **File**: `src/data/bea/gdp-components.json`
- **Source**: BEA NIPA Table 1.1.5 (Gross Domestic Product)
- **Period**: Q3 2025 final, SAAR (Seasonally Adjusted Annual Rate)
- **Fetched**: 2026-02-17T00:26:04.605Z

| Line | Description | Value ($B) |
|------|-------------|------------|
| 1 | Gross domestic product | 31,098.027 |
| 2 | Personal consumption expenditures | 21,111.166 |
| 3 | Goods | 6,545.636 |
| 4 | Durable goods | 2,277.292 |
| 5 | Nondurable goods | 4,268.344 |
| 6 | Services | 14,565.530 |
| 7 | Gross private domestic investment | 5,419.029 |
| 8 | Fixed investment | 5,478.696 |
| 9 | Nonresidential | 4,293.474 |
| 10 | Structures | 887.332 |
| 11 | Equipment | 1,669.428 |
| 12 | Intellectual property products | 1,736.713 |
| 13 | Residential | 1,185.222 |
| 14 | Change in private inventories | -59.667 |
| 15 | Net exports of goods and services | -756.570 |
| 16 | Exports | 3,366.868 |
| 19 | Imports | 4,123.437 |
| 22 | Government consumption expenditures and gross investment | 5,324.402 |
| 23 | Federal | 1,989.727 |
| 24 | National defense | 1,161.912 |
| 25 | Nondefense | 827.815 |
| 26 | State and local | 3,334.675 |

**Pre-computed ratios in JSON** (component / GDP):
- `consumptionRatio`: 21111.166 / 31098.027 = **0.6788586941544555**
- `investmentRatio`: 5419.029 / 31098.027 = **0.17425636037939**
- `governmentRatio`: 5324.402 / 31098.027 = **0.1712134985283793**
- `netExportRatio`: -756.570 / 31098.027 = **-0.024328553062224815**
- Sum = 0.9999999999999998 ≈ 1.0 (no normalization applied; threshold is 0.001)

**GDP nominal stored as**: 31,098,027,000,000 (integer dollars, = 31098.027 × 10^9)

#### Personal Income Shares
- **File**: `src/data/bea/personal-income.json`
- **Source**: BEA NIPA Table 2.1 (Personal Income and Its Disposition)
- **Period**: Q3 2025 final, SAAR

| Category | Components | Value ($B) | Share of PI |
|----------|-----------|------------|-------------|
| Wage (Compensation) | Line 2: Compensation of employees | 15,754.589 | 60.14% |
| | Line 3: Wages and salaries | 12,972.367 | |
| | Line 6: Supplements | 2,782.223 | |
| Asset Income | Line 9: Proprietors' income | 2,117.675 | 20.72% |
| | Line 12: Rental income | 1,112.239 | |
| | Line 13: Personal income receipts on assets | 4,220.114 | |
| | Line 14: Personal interest income | 1,971.142 | |
| | Line 15: Personal dividend income | 2,248.973 | |
| | Less Line 25: Contributions for gov social insurance | -2,020.931 | |
| | **Subtotal** | **5,429.099** | |
| Transfer Receipts | Line 16: Personal current transfer receipts | 5,013.949 | 19.14% |
| | Line 17: Government social benefits | 4,901.633 | |
| | Line 18: Social Security | 1,575.439 | |
| | Line 19: Medicare | 1,237.623 | |
| | Line 20: Medicaid | 1,045.596 | |
| | Line 21: Unemployment insurance | 38.508 | |
| **Total Personal Income** | Line 1 | **26,197.637** | **100%** |

**Share derivation** (from JSON `componentsBillions`):
- `wageShare` = 15,754.589 / 26,197.637 = **0.6013744293044445**
- `assetShare` = 5,429.099 / 26,197.637 = **0.20723620989175473**
- `transferShare` = 5,013.949 / 26,197.637 = **0.19138936080380073**
- Sum = 1.0000000000000000 (exact; no normalization applied)

**NOTE**: `assetShare` is the residual: it includes proprietors' income, rental income, interest, and dividends, net of contributions for government social insurance. The JSON note confirms: "assetShare=residual (includes proprietors', rental, interest, dividends, net of contributions)."

---

### 1B: BLS Data

#### Total Nonfarm Employment
- **File**: `src/data/bls/total-employment.json`
- **Series ID**: CES0000000001 (Current Employment Statistics)
- **Value**: 158,497 (thousands), December 2025 (M12), preliminary
- **Conversion**: 158,497 × 1,000 = **158,497,000**

#### Civilian Labor Force Level
- **File**: `src/data/bls/labor-force.json`
- **Series ID**: LNS11000000 (Current Population Survey)
- **Value**: 171,495 (thousands), December 2025 (M12)
- **Conversion**: 171,495 × 1,000 = **171,495,000**

#### Unemployment Rate
- **File**: `src/data/bls/unemployment-rate.json`
- **Series ID**: LNS14000000 (Current Population Survey)
- **Value**: 4.4 (percent), December 2025 (M12)
- **Conversion**: 4.4 / 100 = **0.044**

#### Labor Market Indicators
- **File**: `src/data/bls/labor-market.json`
- **Source**: BLS Current Employment Statistics (CES)

| Indicator | Series ID | Raw Value | Parsed |
|-----------|-----------|-----------|--------|
| Average Weekly Hours (Total Private) | CES0500000002 | "34.2" | **34.2** |
| Average Hourly Earnings (Total Private) | CES0500000003 | "37.02" | **$37.02** |

#### CPI-U Inflation (All Items)
- **File**: `src/data/bls/cpi-sector-indices.json`
- **Series ID**: CUUR0000SA0
- **Annual values**: 2024 = 313.689, 2025 = 321.943
- **Latest annual inflation**: (321.943 - 313.689) / 313.689 = **0.026312685494231425** (2.63%)
- **10-year average**: 0.03109801073194629 (3.11%)

#### CPI Sector Weights
- **File**: `src/data/bls/cpi-sector-weights.json`
- **Source**: BLS CPI Relative Importance, December 2024

| BLS Category | Weight |
|-------------|--------|
| food_home | 0.079 |
| food_away | 0.056 |
| shelter | 0.370 |
| medical_care | 0.084 |
| transportation | 0.151 |
| education_comm | 0.062 |
| info_technology | 0.013 |
| apparel | 0.025 |
| recreation | 0.053 |
| other_services | 0.032 |
| energy | 0.062 |
| other_goods | 0.013 |
| **Sum** | **1.000** |

---

### 1C: FRED Data

#### M2 Velocity
- **File**: `src/data/fred/m2-velocity.json`
- **Series ID**: M2V
- **Latest**: Q3 2025 (2025-07-01) = **1.406**

#### Natural Rate of Unemployment (NAIRU)
- **File**: `src/data/fred/nairu.json`
- **Series ID**: NROU (CBO Long-Term Natural Rate)
- **Latest**: Q1 2026 = **0.04308657724** (4.31%)
- **NOTE**: This is a reference value only. The model derives its own natural rate from baseline employment/labor force gap (see Section 2).

#### Federal Funds Rate
- **File**: `src/data/fred/fed-funds-rate.json`
- **Series ID**: FEDFUNDS
- **Latest**: January 2026 = **0.0364** (3.64%)

---

## Section 2: Derivation Chains

### Employment & Labor Force

```
BASELINE_TOTAL_EMPLOYMENT = govData.totalEmployment
    = extractTotalEmployment()
    = parseInt("158497", 10) × 1000      [from Dec 2025 M12 in total-employment.json]
    = 158,497,000

US_LABOR_FORCE_2025 = govData.laborForce
    = extractLaborForce()
    = 171495 × 1000                       [from latestMonthly.value in labor-force.json]
    = 171,495,000

BASELINE_UNEMPLOYMENT = US_LABOR_FORCE_2025 - BASELINE_TOTAL_EMPLOYMENT
    = 171,495,000 - 158,497,000
    = 12,998,000

NATURAL_UNEMPLOYMENT_RATE = BASELINE_UNEMPLOYMENT / US_LABOR_FORCE_2025
    = 12,998,000 / 171,495,000
    = 0.075792... (≈7.58%)
    NOTE: Module-level constant, computed once at import time.
    Ensures wagePressure = 1.0 at baseline (no wage distortion).
    NOT the same as FRED NAIRU (4.31%).
```

### Wages

```
BASELINE_AVERAGE_ANNUAL_WAGE = Math.round(govData.avgHourlyEarnings × govData.avgWeeklyHours × 52)
    = Math.round(37.02 × 34.2 × 52)
    = Math.round(1266.084 × 52)
    = Math.round(65,836.368)
    = 65,836
```

### GDP & Expenditure Ratios

```
BASELINE_GDP_NOMINAL_2025 = govData.gdpNominal
    = beaGDPComponents.gdpNominal          [from gdp-components.json]
    = 31,098,027,000,000                   ($31.098 trillion)

MARGINAL_PROPENSITY_TO_CONSUME = govData.consumptionRatio
    = 21,111.166 / 31,098.027             [PCE / GDP from Table 1.1.5]
    = 0.6788586941544555

TRADITIONAL_INVESTMENT_GDP_FRACTION = govData.investmentRatio
    = 5,419.029 / 31,098.027             [GPDI / GDP from Table 1.1.5]
    = 0.17425636037939

GOVERNMENT_SPENDING_GDP_FRACTION = govData.governmentRatio
    = 5,324.402 / 31,098.027             [G / GDP from Table 1.1.5]
    = 0.1712134985283793

NET_EXPORTS_GDP_FRACTION = govData.netExportRatio
    = -756.570 / 31,098.027              [NX / GDP from Table 1.1.5]
    = -0.024328553062224815

Normalization check: sum = 0.9999999999999998 ≈ 1.0 (no normalization applied)
```

### Income Shares & Baseline Income

```
BASELINE_WAGE_SHARE = govData.wageShare = 0.6013744293044445
BASELINE_ASSET_SHARE = govData.assetShare = 0.20723620989175473
BASELINE_TRANSFER_SHARE = govData.transferShare = 0.19138936080380073

BASELINE_NATIONAL_INCOME = BASELINE_GDP_NOMINAL_2025 = 31,098,027,000,000

BASELINE_WAGE_INCOME = BASELINE_WAGE_SHARE × BASELINE_NATIONAL_INCOME
    = 0.6013744293044445 × 31,098,027,000,000
    = 18,701,555,442,168  (approx $18.70T)

BASELINE_ASSET_INCOME = BASELINE_ASSET_SHARE × BASELINE_NATIONAL_INCOME
    = 0.20723620989175473 × 31,098,027,000,000
    = 6,444,635,588,038  (approx $6.44T)

BASELINE_TRANSFER_INCOME = BASELINE_TRANSFER_SHARE × BASELINE_NATIONAL_INCOME
    = 0.19138936080380073 × 31,098,027,000,000
    = 5,951,835,969,794  (approx $5.95T)

Verification: sum = 31,098,027,000,000 ✓
```

### Inflation

```
BASE_INFLATION_RATE = govData.baseInflationRate
    = extractBaseInflationRate()
    = blsCPISectorIndices.sectors.all_items.latestAnnualInflation
    = (CPI_2025 - CPI_2024) / CPI_2024
    = (321.943 - 313.689) / 313.689
    = 8.254 / 313.689
    = 0.026312685494231425
```

### Monetary

```
BASELINE_VELOCITY_OF_MONEY = govData.m2Velocity
    = fredM2Velocity.velocity
    = 1.406

FEDERAL_FUNDS_RATE = govData.fedFundsRate
    = fredFedFundsRate.federalFundsRate
    = 0.0364

FRED_NAIRU_RATE = govData.fredNairuRate
    = fredNAIRU.naturalUnemploymentRate
    = 0.04308657724
```

### CPI Sector Weight Mapping (buildSectorCPIWeights)

Maps 12 BLS categories → 16 ATLAS sector groups:

| ATLAS Sector | Source BLS Category | Formula | Weight |
|-------------|--------------------|---------:|-------:|
| health | medical_care | direct | 0.084 |
| food | food_away | direct | 0.056 |
| ag | food_home | direct | 0.079 |
| transport | transportation | direct | 0.151 |
| retail | apparel | direct | 0.025 |
| construction | shelter | direct | 0.370 |
| edu | education_comm | direct | 0.062 |
| tech | info_technology | direct | 0.013 |
| creative | recreation | direct | 0.053 |
| prof | other_services × 0.67 | 0.032 × 0.67 | 0.02144 |
| legal | other_services × 0.33 | 0.032 × 0.33 | 0.01056 |
| finance | other_goods × 0.40 | 0.013 × 0.40 | 0.00520 |
| gov | other_goods × 0.25 | 0.013 × 0.25 | 0.00325 |
| mfg | energy | direct | 0.062 |
| sci | other_goods × 0.10 | 0.013 × 0.10 | 0.00130 |
| other | other_goods × 0.25 | 0.013 × 0.25 | 0.00325 |
| **Sum** | | | **1.000** |

No normalization applied (sum within 0.001 of 1.0).

---

## Section 3: Year-by-Year Expected Values — Test B (Zero Displacement)

### Test B Configuration

From `docs/atlas-test-B-input.csv`:
- `start_year` = 2025, `end_year` = 2035
- `total_population` = 340,000,000
- `labor_force` = 168,000,000
- `baseline_gdp_growth` = 0.02
- `base_inflation_rate` = 0.02
- `marginal_propensity_to_consume` = 0.68
- `innovation_rate` = 0
- All 8 capability vectors: floor=0, ceiling=0.01, steepness=0.1, midpoint=2050
- All 9 policies disabled

### ⚠️ CRITICAL: Config Override Resolution (See Section 4)

**Three Test B overrides DO NOT take effect in the simulation formulas:**

| Parameter | Test B Value | Module Constant Used | Impact |
|-----------|-------------|---------------------|--------|
| `base_inflation_rate` | 0.02 | **0.026312685494231425** | Price level, ARPP growth |
| `marginal_propensity_to_consume` | 0.68 | **0.6788586941544555** | GDP consumption |
| `baseline_gdp_growth` | 0.02 | **0.02** | No impact (same value) |

**Three Test B overrides DO take effect:**

| Parameter | Test B Value | Module Default |
|-----------|-------------|---------------|
| `labor_force` | 168,000,000 | 171,495,000 |
| `total_population` | 340,000,000 | 340,000,000 (same) |
| `innovation_rate` | 0 | 1.5e-8 |

**Therefore, Test B computations below use:**
- Inflation = 0.026312685494231425 (module constant, NOT 0.02)
- MPC = 0.6788586941544555 (module constant, NOT 0.68)
- laborForce = 168,000,000 (config override DOES take effect)
- All other module constants at their govData-derived values

### Key Derived Values for Test B

```
nominalGrowthRate = BASELINE_GDP_GROWTH_RATE + BASE_INFLATION_RATE
    = 0.02 + 0.026312685494231425
    = 0.046312685494231425

NATURAL_UNEMPLOYMENT_RATE = 12,998,000 / 171,495,000 = 0.075792...
    (module-level constant — uses US_LABOR_FORCE_2025, NOT config.laborForce)

Test B unemploymentRate = (168,000,000 - 158,497,000) / 168,000,000
    = 9,503,000 / 168,000,000 = 0.056565476...

Since 0.056565 < 0.075792: excessUnemployment = 0, wagePressure = 1.0

incrementalUnemployment = max(0, 9,503,000 - BASELINE_UNEMPLOYMENT)
    = max(0, 9,503,000 - 12,998,000) = 0

All policy channels = 0 (all policies disabled)
```

### Capability Scores (Test B, all vectors identical)

```
S_c(t) = 0 + (0.01 - 0) / (1 + exp(-0.1 × (t - 2050)))
       = 0.01 / (1 + exp(0.1 × (2050 - t)))

Year 2025: 0.01 / (1 + exp(2.5)) = 0.01 / 13.18249 = 0.000758756
Year 2026: 0.01 / (1 + exp(2.4)) = 0.01 / 12.02318 = 0.000831727
Year 2027: 0.01 / (1 + exp(2.3)) = 0.01 / 10.97462 = 0.000911220
Year 2028: 0.01 / (1 + exp(2.2)) = 0.01 / 10.02507 = 0.000997499
Year 2029: 0.01 / (1 + exp(2.1)) = 0.01 / 9.16609  = 0.001090952
Year 2030: 0.01 / (1 + exp(2.0)) = 0.01 / 8.38906  = 0.001192029

All scores ≈ 0.001 — far below any BFCS threshold (typically 0.3–0.9).
Result: NO adoption triggers, adoption_rate = 0, displacement = 0, automationCoverage = 0.
```

### Year 0 (2025)

```
yearsSinceStart = 0
baselineGrowthFactor = (1 + 0.046312685494231425)^0 = 1.0

Employment:
  totalEmployment = 158,497,000 (no displacement)
  economicActivityFactor = 1.0 (no previous year)
  effectiveEmployment = 158,497,000
  totalUnemployment = 168,000,000 - 158,497,000 = 9,503,000
  unemploymentRate = 9,503,000 / 168,000,000 = 0.056565476190476
  laborForceParticipation = 168,000,000 / 340,000,000 = 0.494117647

Prices:
  isFirstYear = true → priceLevel = 1.0
  aiDeflationRate = 0 (no automation)
  netInflation = 0.026312685494231425 - 0 = 0.026312685494231425

Wage Pressure:
  excessUnemployment = max(0, 0.056565 - 0.075792) = 0
  wagePressure = max(0.3, 1 - 1.5 × 0) = 1.0

Income:
  employmentRatio = 158,497,000 / 158,497,000 = 1.0
  wageRatio = actualBaselineAvgWage / actualBaselineAvgWage = 1.0
  adjustedWageRatio = 1.0 × 1.0 = 1.0

  aggregateWageIncome = BASELINE_WAGE_INCOME × 1.0 × 1.0 × 1.0 + 0
      = 0.6013744293044445 × 31,098,027,000,000
      ≈ 18,701,555,442,168

  aggregateAssetIncome = BASELINE_ASSET_INCOME × 1.0 × (1 + 0) + 0
      = 0.20723620989175473 × 31,098,027,000,000
      ≈ 6,444,635,588,038

  incrementalUnemployment = max(0, 9,503,000 - 12,998,000) = 0
  aggregateTransferIncome = BASELINE_TRANSFER_INCOME × 1.0 + 0 + 0
      = 0.19138936080380073 × 31,098,027,000,000
      ≈ 5,951,835,969,794

  totalIncome = 18,701,555,442,168 + 6,444,635,588,038 + 5,951,835,969,794
      = 31,098,027,000,000

ARPP:
  ARPP = totalIncome / (population × priceLevel)
       = 31,098,027,000,000 / (340,000,000 × 1.0)
       = 91,464.785294117647

GDP:
  isFirstYear → gdpReal = BASELINE_GDP_NOMINAL_2025 = 31,098,027,000,000
  gdpNominal = gdpReal × priceLevel = 31,098,027,000,000 × 1.0 = 31,098,027,000,000
  gdpGrowthRate = BASELINE_GDP_GROWTH_RATE = 0.02 (first-year default)

Income Composition:
  wageShare = 18,701,555,442,168 / 31,098,027,000,000 = 0.6013744293044445
  assetShare = 6,444,635,588,038 / 31,098,027,000,000 = 0.20723620989175473
  transferShare = 5,951,835,969,794 / 31,098,027,000,000 = 0.19138936080380073
```

### Year 1 (2026)

```
yearsSinceStart = 1
baselineGrowthFactor = (1.046312685494231425)^1 = 1.046312685494231425

Employment:
  totalEmployment = 158,497,000 (still no displacement)
  economicActivityFactor = 1.0 (gdpGrowthRate was 0.02, no tipping)
  effectiveEmployment = 158,497,000
  totalUnemployment = 9,503,000
  unemploymentRate = 0.056565476190476
  wagePressure = 1.0

Prices:
  priceLevel = 1.0 × (1 + 0.026312685494231425 - 0) = 1.026312685494231425
  aiDeflationRate = 0
  netInflation = 0.026312685494231425

Income:
  aggregateWageIncome = BASELINE_WAGE_INCOME × 1.046312685494231425 × 1.0 × 1.0
      = 18,701,555,442,168 × 1.046312685494231425
      ≈ 19,568,175,574,800

  aggregateAssetIncome = BASELINE_ASSET_INCOME × 1.046312685494231425 × 1.0
      = 6,444,635,588,038 × 1.046312685494231425
      ≈ 6,743,067,879,860

  aggregateTransferIncome = BASELINE_TRANSFER_INCOME × 1.046312685494231425 + 0
      = 5,951,835,969,794 × 1.046312685494231425
      ≈ 6,227,453,545,340

  totalIncome = 31,098,027,000,000 × 1.046312685494231425
      = 32,538,697,000,000  (approx)

ARPP:
  ARPP = 32,538,697,000,000 / (340,000,000 × 1.026312685494231425)
       = 32,538,697,000,000 / 348,946,313,068
       ≈ 93,247.14  (approx)

  arppChangeRate = (93,247.14 - 91,464.79) / 91,464.79 ≈ 0.01949 (≈1.95% real growth)

  NOTE: Real ARPP growth = (1 + nominalGrowthRate) / (1 + inflationRate) - 1
      = 1.046312685 / 1.026312685 - 1
      = 0.019487... ≈ 1.95%
      (Slightly less than 2% due to cross-term: r×i = 0.02 × 0.02631 = 0.000526)

GDP:
  C = ARPP × population × MPC
    = 93,247.14 × 340,000,000 × 0.6788586941544555
    ≈ 21,524,478,000,000

  I = prevGDPReal × TRADITIONAL_INVESTMENT_GDP_FRACTION
    = 31,098,027,000,000 × 0.17425636037939
    ≈ 5,417,080,000,000

  G = prevGDPReal × GOVERNMENT_SPENDING_GDP_FRACTION
    = 31,098,027,000,000 × 0.1712134985283793
    ≈ 5,323,622,000,000

  NX = prevGDPReal × NET_EXPORTS_GDP_FRACTION
     = 31,098,027,000,000 × (-0.024328553062224815)
     ≈ -756,408,000,000

  gdpReal = C + I + G + NX
          ≈ 21,524,478,000,000 + 5,417,080,000,000 + 5,323,622,000,000 - 756,408,000,000
          ≈ 31,508,772,000,000

  gdpNominal = gdpReal × priceLevel
             ≈ 31,508,772,000,000 × 1.026312685
             ≈ 32,337,816,000,000

  gdpGrowthRate = (31,508,772,000,000 - 31,098,027,000,000) / 31,098,027,000,000
                ≈ 0.0132 (≈1.32%)
```

### Years 2–5 (2027–2030)

The pattern continues identically each year since displacement remains 0:
- Employment, unemployment, wagePressure all unchanged
- baselineGrowthFactor grows as (1.046312685...)^n
- priceLevel grows as (1.026312685...)^n
- Income grows nominally but ARPP grows ~1.95% real/year
- GDP follows from expenditure formula

```
Year 2 (2027):
  baselineGrowthFactor = (1.046312685)^2 = 1.094451...
  priceLevel = (1.026312685)^2 = 1.053317...
  totalIncome = 31,098,027,000,000 × 1.094451 ≈ 34,035,976,000,000
  ARPP = 34,035,976,000,000 / (340,000,000 × 1.053317) ≈ 95,068...

Year 3 (2028):
  baselineGrowthFactor = (1.046312685)^3 = 1.145538...
  priceLevel = (1.026312685)^3 = 1.081023...
  ARPP ≈ 96,929...

Year 4 (2029):
  baselineGrowthFactor = (1.046312685)^4 = 1.199583...
  priceLevel = (1.026312685)^4 = 1.109470...
  ARPP ≈ 98,833...

Year 5 (2030):
  baselineGrowthFactor = (1.046312685)^5 = 1.256597...
  priceLevel = (1.026312685)^5 = 1.138667...
  ARPP ≈ 100,780...
```

---

## Section 4: Config vs Module Constant Resolution

### ⚠️ CRITICAL FINDING

Test B sets 6 config overrides. Only 3 actually take effect in the simulation formulas. The other 3 are stored in the `SimulationConfig` object but the model code reads module-level constants instead.

### base_inflation_rate → **DOES NOT TAKE EFFECT**

Test B sets `config.baseInflationRate = 0.02`.
Module constant: `BASE_INFLATION_RATE = 0.026312685494231425`

**Where the value is actually read in macro.ts:**

```typescript
// Line 540: netInflation uses MODULE CONSTANT
const netInflation = BASE_INFLATION_RATE - aiDeflationRate;

// Line 548: nominalGrowthRate uses MODULE CONSTANT
const nominalGrowthRate = BASELINE_GDP_GROWTH_RATE + BASE_INFLATION_RATE;

// Line 537-539: computePriceLevel uses MODULE CONSTANT via default parameter
const priceLevel = isFirstYear
    ? BASELINE_PRICE_LEVEL
    : computePriceLevel(prevPriceLevel, aiDeflationRate);
    // computePriceLevel signature: (prev, aiDeflation, baseInflation = BASE_INFLATION_RATE)
    // Called with only 2 args → uses default = BASE_INFLATION_RATE

// Line 663: inflationRate output uses MODULE CONSTANT
inflationRate: BASE_INFLATION_RATE,
```

`config.baseInflationRate` is set in `getDefaultSimulationConfig()` (simulation.ts:90) and stored, but **never read by any computation function**.

### marginal_propensity_to_consume → **DOES NOT TAKE EFFECT**

Test B sets `config.marginalPropensityToConsume = 0.68`.
Module constant: `MARGINAL_PROPENSITY_TO_CONSUME = 0.6788586941544555`

**Where the value is actually read in macro.ts:**

```typescript
// Line 319 in computeGDP():
const consumption = arpp * population * MARGINAL_PROPENSITY_TO_CONSUME;

// Line 616 in computeMacro() (year 0 consumption):
consumption = arpp * population * MARGINAL_PROPENSITY_TO_CONSUME;
```

`config.marginalPropensityToConsume` is set in `getDefaultSimulationConfig()` (simulation.ts:93) and stored, but **never read by any computation function**.

### baseline_gdp_growth → **DOES NOT TAKE EFFECT** (but same value)

Test B sets `config.baselineGDPGrowth = 0.02`.
Module constant: `BASELINE_GDP_GROWTH_RATE = 0.02`

**Where the value is actually read in macro.ts:**

```typescript
// Line 548:
const nominalGrowthRate = BASELINE_GDP_GROWTH_RATE + BASE_INFLATION_RATE;

// Line 635:
? BASELINE_GDP_GROWTH_RATE;  // first-year default gdpGrowthRate
```

Both values are 0.02, so there is **no numerical impact**. But the override mechanism is still broken.

### labor_force → **TAKES EFFECT** ✓

Test B sets `config.laborForce = 168,000,000`.
Module constant: `US_LABOR_FORCE_2025 = 171,495,000`

**Where the value is actually read in simulation.ts:**

```typescript
// Line 340: effectiveUnemployment uses CONFIG
const effectiveUnemployment = Math.max(0, config.laborForce - effectiveEmployment);

// Lines 373-374: passed to computeMacro
const macro = computeMacro(
    year, effectiveEmployment, ..., config.totalPopulation, config.laborForce, ...
);
```

In `computeMacro()`, the `laborForce` parameter receives `config.laborForce` (168M), overriding the default `US_LABOR_FORCE_2025` (171.5M). This changes unemployment calculations.

**However**: `NATURAL_UNEMPLOYMENT_RATE` is a module-level constant computed from `US_LABOR_FORCE_2025` (171.5M), not from `config.laborForce`. So wagePressure uses the module's natural rate even when laborForce is overridden.

### total_population → **TAKES EFFECT** ✓

Test B sets `config.totalPopulation = 340,000,000`.
Module constant: `US_POPULATION_2025 = 340,000,000` (same value)

Passed via `config.totalPopulation` to `computeMacro()` and `computePolicyEffects()`.

### innovation_rate → **TAKES EFFECT** ✓

Test B sets `config.innovationRate = 0`.
Module constant: `DEFAULT_INNOVATION_RATE = 1.5e-8`

**Where the value is actually read in simulation.ts:**

```typescript
// Line 385:
const newJobMetrics = computeNewJobMetrics(
    macro.gdpReal, automationCoverage, aggregate.totalDirectDisplacement,
    config.innovationRate, config.rdMultiplier, config.jobPersistenceFactor,
);
```

### Also: Investment, Government, Net Export ratios → **NOT OVERRIDABLE**

These are used directly as module constants in `computeGDP()`:
- `TRADITIONAL_INVESTMENT_GDP_FRACTION` (line 324)
- `GOVERNMENT_SPENDING_GDP_FRACTION` (line 327)
- `NET_EXPORTS_GDP_FRACTION` (line 330)

There are no corresponding config fields for these. They cannot be overridden via CSV import.

---

## Section 5: Default Config Expected Values (Years 0–5)

### Default Configuration

From `getDefaultSimulationConfig()` (simulation.ts:83–103):
- `laborForce` = US_LABOR_FORCE_2025 = 171,495,000
- `totalPopulation` = US_POPULATION_2025 = 340,000,000
- `baseInflationRate` = BASE_INFLATION_RATE = 0.026312685... (stored but not read)
- `marginalPropensityToConsume` = 0.6788586941544555 (stored but not read)
- `baselineGDPGrowth` = 0.02 (stored but not read)
- `innovationRate` = 1.5e-8
- Capabilities: DEFAULT_CAPABILITY_TRAJECTORIES (real sigmoid parameters)
- Policies: minimumWage enabled ($7.25), enhancedUI enabled (0.45/26wk), all others disabled

### Default Capability Scores at Year 2025

```
lang:   0.75 + 0.23/(1+exp(0.8×3))  = 0.75 + 0.23/12.023 = 0.7691
code:   0.70 + 0.27/(1+exp(0.9×3))  = 0.70 + 0.27/15.880 = 0.7170
agent:  0.40 + 0.55/(1+exp(0.7×4))  = 0.40 + 0.55/17.445 = 0.4315
decide: 0.50 + 0.45/(1+exp(0.6×5))  = 0.50 + 0.45/21.086 = 0.5213
robot:  0.20 + 0.70/(1+exp(0.4×8))  = 0.20 + 0.70/25.533 = 0.2274
auto:   0.35 + 0.60/(1+exp(0.5×6))  = 0.35 + 0.60/21.086 = 0.3785
gen:    0.65 + 0.33/(1+exp(0.85×2)) = 0.65 + 0.33/6.474  = 0.7010
sci:    0.45 + 0.50/(1+exp(0.5×7))  = 0.45 + 0.50/34.116 = 0.4647
```

These are higher than Test B but still need to pass all 4 BFCS thresholds for each occupation-role. Whether any adoption triggers in Year 0 depends on per-cluster BFCS threshold values (typically 0.3–0.9).

### Default Year 0 (2025) — Baseline

```
Employment:
  totalEmployment = 158,497,000 (displacement is likely 0 or near-0 at year 0)
  totalUnemployment = 171,495,000 - 158,497,000 = 12,998,000
  unemploymentRate = 12,998,000 / 171,495,000 = NATURAL_UNEMPLOYMENT_RATE ≈ 0.07579
  wagePressure = 1.0 (at natural rate exactly)

Prices:
  priceLevel = 1.0 (first year)
  aiDeflationRate ≈ 0 (negligible automation coverage)

Income:
  aggregateWageIncome = BASELINE_WAGE_INCOME × 1.0 × 1.0 × 1.0 + minWageBoost
  aggregateAssetIncome = BASELINE_ASSET_INCOME × 1.0 × 1.0 + 0
  aggregateTransferIncome = BASELINE_TRANSFER_INCOME × 1.0 + incrementalUI + 0

Policy effects (default):
  minimumWage at $7.25/hr: annualMinWage = $7.25 × 2080 = $15,080
      avgWage × 0.5 = 65,836 × 0.5 = $32,918
      Since $15,080 < $32,918: NO boost (min wage below threshold)
      wageChannelAddition = 0

  enhancedUI at 0.45 / 26 weeks:
      weeklyBenefit = (65,836/52) × 0.45 = 1,265.69 × 0.45 = $569.56
      annualBenefit = 569.56 × 26 = $14,808.63
      incrementalBenefit = max(0, 14,808.63 - 19,200) = 0
      (Annual benefit < BASELINE_TRANSFER_PER_UNEMPLOYED, so no increment)
      transferChannelAddition = 0

  Total policy effect = 0

  totalIncome = 31,098,027,000,000
  ARPP = 91,464.785...

GDP:
  gdpReal = 31,098,027,000,000
  gdpNominal = 31,098,027,000,000
```

### Default Years 1–5 (2026–2030)

In default config, capabilities rise on real sigmoids. By ~2027-2029, some high-vulnerability clusters (creative, tech_qa, finance_accounting) may begin triggering BFCS thresholds. This makes year-by-year computation dependent on the full cluster-role BFCS threshold matrix (121 roles × 4 dimensions = 484 threshold values).

**Without displacement** (if no BFCS triggers yet), the default config produces the same results as Test B with these differences:
- laborForce = 171,495,000 (vs 168M)
- unemploymentRate = 0.075792 (vs 0.056565)
- wagePressure = 1.0 (both at or below natural rate)
- innovationRate = 1.5e-8 (vs 0, but with 0 displacement the effect is negligible)

**The key difference**: Default config unemployment is HIGHER (12.998M vs 9.503M) because the labor force is larger, but this doesn't affect income since incrementalUnemployment is 0 in both cases and wagePressure is 1.0 in both.

If no BFCS triggers in years 0-5:
```
Default Year 0 ARPP = 91,464.785... (same as Test B)
Default Year 5 ARPP ≈ 100,780 (same as Test B, ≈1.95% annual real growth)
```

---

## Section 6: Checksum Values

### Test B (zero displacement, actual module constants)

```
Year 0:
  ARPP:              $91,464.79 (= 31,098,027,000,000 / 340,000,000)
  GDP nominal:       $31,098,027,000,000
  GDP real:          $31,098,027,000,000
  unemployment_rate: 0.056565 (= 9,503,000 / 168,000,000)
  wage_share:        0.601374
  asset_share:       0.207236
  transfer_share:    0.191389
  price_level:       1.0
  inflation_rate:    0.026313 (BASE_INFLATION_RATE, module constant)
  ai_deflation_rate: 0.0
  net_inflation:     0.026313
  wagePressure:      1.0
  automation_coverage: 0.0
  total_displaced:   0
  total_employment:  158,497,000
  total_unemployment: 9,503,000

Year 5:
  price_level:       (1.026312685)^5 ≈ 1.13867
  ARPP:              ≈ $100,780 (≈10.2% above Year 0, ≈1.95%/yr real)
  GDP nominal:       > $31.1T (grows nominally from expenditure formula)
```

### Default Config (no early displacement assumed)

```
Year 0:
  ARPP:              $91,464.79 (identical to Test B — same baseline income/population)
  GDP nominal:       $31,098,027,000,000
  unemployment_rate: 0.075792 (= 12,998,000 / 171,495,000)
  price_level:       1.0

Year 5 (if no BFCS triggers):
  ARPP:              ≈ $100,780 (same real growth rate as Test B)
  GDP nominal:       > $31.1T
  price_level:       ≈ 1.13867
```

### Quick Verification Formulas

```
ARPP(t) = [BASELINE_GDP_NOMINAL × (1 + nominalGrowthRate)^t] / [population × (1 + BASE_INFLATION_RATE)^t]

Where:
  nominalGrowthRate = 0.02 + 0.026312685 = 0.046312685
  population = 340,000,000
  BASE_INFLATION_RATE = 0.026312685
  BASELINE_GDP_NOMINAL = 31,098,027,000,000

Real ARPP growth per year ≈ (1 + 0.046313) / (1 + 0.026313) - 1 ≈ 1.949%

ARPP(0) = 31,098,027,000,000 / 340,000,000 = 91,464.79
ARPP(5) = 91,464.79 × (1.01949)^5 ≈ 91,464.79 × 1.10123 ≈ 100,720

NOTE: GDP does not grow at the same rate as income because GDP is computed
via expenditure approach (C + I + G + NX) where I, G, NX use previous year's
GDP, creating a different growth trajectory than income.
```

---

## Appendix: Summary of Bugs Found

### BUG: Config overrides for inflation, MPC, and GDP growth are silently ignored

**Severity**: HIGH — Test B does not actually test what it claims to test.

**Impact**: When a user imports a CSV that sets `base_inflation_rate=0.02`, the model continues using the module constant 0.026312685. This means:
1. Price levels grow faster than expected (2.63%/yr instead of 2%)
2. Nominal income growth is higher than expected
3. Real ARPP growth is ~1.95% instead of the ~1.96% that would result from config inflation of 2%

**Root Cause**: `computeMacro()` in macro.ts imports and uses `BASE_INFLATION_RATE`, `MARGINAL_PROPENSITY_TO_CONSUME`, etc. as module-level constants. The `SimulationConfig` stores these values but no code path reads them from the config object.

**Fix Needed**: Pass `config.baseInflationRate`, `config.marginalPropensityToConsume`, and `config.baselineGDPGrowth` through from `runSimulation()` to `computeMacro()` and `computeGDP()`, and use them instead of the module constants.
