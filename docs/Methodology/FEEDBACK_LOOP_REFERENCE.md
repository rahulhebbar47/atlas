# FEEDBACK_LOOP_REFERENCE.md — ATLAS Feedback Loop Architecture

Complete reference for all 6 feedback loops in the ATLAS economic model: every variable, every equation, every connection between loops. This document is designed to be self-contained — another engineer or designer can use it to understand the full system dynamics without reading source code.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Shared Variables (Loop Interconnection Points)](#2-shared-variables)
3. [Loop 1: Revenue Pressure (Displacement-Demand Feedback)](#3-loop-1-revenue-pressure-displacement-demand-feedback)
4. [Loop 2: Phillips Curve (Wage-Price Spiral)](#4-loop-2-phillips-curve-wage-price-spiral)
5. [Loop 3: Demand Spillover](#5-loop-3-demand-spillover)
6. [Loop 4: Credit Crunch](#6-loop-4-credit-crunch)
7. [Loop 5: Fiscal-Monetary](#7-loop-5-fiscal-monetary)
8. [Loop 6: Housing Wealth](#8-loop-6-housing-wealth)
9. [Complete Interconnection Map](#9-complete-interconnection-map)
10. [Simulation Execution Order](#10-simulation-execution-order)
11. [Key Constants & Defaults](#11-key-constants--defaults)

---

## 1. System Overview

ATLAS models the economic impact of AI automation through 6 interconnected feedback loops. Each loop is a causal chain where Variable A affects Variable B, which affects Variable C, and so on — eventually feeding back to Variable A. The loops can be stabilizing (negative feedback — deviations self-correct) or destabilizing (positive feedback — deviations amplify).

### The 6 Loops at a Glance

| # | Loop Name | Color | Type | Core Mechanism | Nodes |
|---|-----------|-------|------|----------------|-------|
| 1 | **Revenue Pressure (Displacement-Demand Feedback)** | `#EF4444` (red) | Destabilizing | GDP decline → firms automate faster → more displacement → GDP declines more | 7 |
| 2 | **Phillips Curve (Wage-Price)** | `#F59E0B` (amber) | Mixed | Unemployment ↔ wage pressure ↔ inflation ↔ real wages | 7 |
| 3 | **Demand Spillover** | `#6366F1` (indigo) | Destabilizing | Income loss → consumption drop → demand-driven layoffs → more income loss | 7 |
| 4 | **Credit Crunch** | `#D97706` (orange) | Destabilizing | Unemployment → credit tightening → consumption/investment drop → more unemployment | 7 |
| 5 | **Fiscal-Monetary** | `#22C55E` (green) | Mixed | Revenue drop → deficit → debt → monetization → inflation → nominal GDP (can stabilize or spiral) | 8 |
| 6 | **Housing Wealth** | `#EC4899` (pink) | Destabilizing | Wage decline → mortgage stress → foreclosures → wealth loss → consumption drop → GDP drop | 7 |

### How Loops Connect

The loops are not independent — they share variables. When GDP drops in Loop 1, that same GDP drop is felt by Loop 3 (demand), Loop 4 (credit), Loop 5 (fiscal), and Loop 6 (housing). There are **6 shared variables** that serve as connection points between loops:

| Shared Variable | Appears In Loops | Role |
|----------------|-----------------|------|
| **GDP** | 1, 3, 4, 5, 6 | Central output; sum of C + I + G + NX |
| **Unemployment** | 1, 2, 4, 6 | Labor market signal; drives wages, credit, housing |
| **Consumption** | 1, 2, 3, 4, 6 | Largest GDP component (~68%); driven by income × MPC × credit |
| **Wages / Income** | 1, 2, 3, 6 | Primary household income; modulated by employment × wage pressure |
| **Inflation** | 2, 5 | Price level changes; affects real values and monetary policy |
| **Investment** | 3, 4 | Business spending; driven by profits × credit conditions |

---

## 2. Shared Variables

These are the exact variables that connect the loops. Each is computed once per simulation year and consumed by multiple loops.

### 2.1 GDP (Nominal)

**Equation** (GDP identity):
```
GDP = Consumption + Investment + GovernmentSpending + NetExports
```

- **Consumption**: `totalIncome × MPC × creditMultiplier - deflationDrag`
- **Investment**: `min(investmentDemand, investmentCapacity) × businessCreditMultiplier`
- **GovernmentSpending**: `baselineGovSpending × (obligationShare × obligationMult + discretionaryShare × discretionaryMult)`
- **NetExports**: `BASELINE_GDP × NET_EXPORTS_GDP_FRACTION` (exogenous)

**Code**: `simulation.ts` lines 1583-1810 (inside `computeMacro()`)

**GDP Growth Rate**: `gdpGrowthRate = (realGDP(t) - realGDP(t-1)) / realGDP(t-1)` where `realGDP = nominalGDP / priceLevel`

### 2.2 Unemployment Rate

**Equation**:
```
effectiveUnemployment = max(0, dynamicLaborForce - totalAfterSpillover - scaledNonClusterEmployed)
unemploymentRate = effectiveUnemployment / dynamicLaborForce
```

Where:
- `dynamicLaborForce` = baseline labor force × population growth factor, adjusted for participation
- `totalAfterSpillover` = employment surviving both AI displacement AND demand spillover
- `scaledNonClusterEmployed` = government and other non-modeled employment

**Code**: `simulation.ts` lines 920-930

### 2.3 Consumption

**Equation** (multi-step):
```
1. totalIncome = wageIncome + assetIncome + transferIncome
2. deferredConsumption = deflationDrag × totalIncome × DEFERRABLE_SHARE
3. baseConsumption = totalIncome × weightedMPC - deferredConsumption
4. creditAdjusted = baseConsumption × consumerCreditMultiplier
5. housingWealth = housingWealthEffect × housingWealthMPC × GDP
6. finalConsumption = creditAdjusted + housingWealth
```

Where MPC is differentiated:
- `MPC_WAGE = 0.80` — workers spend 80% of wage income
- `MPC_ASSET = 0.35` — asset holders spend 35% of asset income
- `MPC_TRANSFER = 0.90` — transfer recipients spend 90% of transfers

**Code**: `macro.ts` inside `computeMacro()`, lines 1780-1820

### 2.4 Wages / Income

**Equation**:
```
aggregateWageIncome = wageBase × employmentRatio × adjustedWageRatio
```

Where:
- `wageBase = BASELINE_AGGREGATE_WAGES × cumulativeInflation × cumulativeProductivity`
- `employmentRatio = totalRemainingEmployment / baselineEmployment`
- `adjustedWageRatio = (avgWage / baselineAvgWage) × wagePressure`
- `wagePressure` = output of `computeWagePressure()` (Phillips curve, see Loop 2)

**Code**: `macro.ts` lines 1640-1660

### 2.5 Inflation (Composite)

**Equation**:
```
compositeInflation = shelterWeight × shelterInflation + (1 - shelterWeight) × goodsInflation

goodsInflation = baseInflation
               - aiDeflation
               + transferInflation
               + scarcityInflation
               + creditDeflation
               + minWageCostPush
               + demandPullInflation

priceLevel(t) = priceLevel(t-1) × (1 + compositeInflation)
```

Components:
- `baseInflation = 0.02` (2% baseline)
- `aiDeflation` = technology-driven price decreases
- `transferInflation` = from money creation (Fisher equation)
- `scarcityInflation` = from labor shortages in specific sectors
- `creditDeflation` = deflation pressure from credit tightening
- `shelterInflation` = sticky, modeled separately with CPI shelter weight

**Code**: `macro.ts` lines 1680-1750

### 2.6 Investment

**Equation**:
```
investmentDemand = aiShareOfGDP × aiInvestmentRate × GDP
                 + (1 - aiShareOfGDP) × traditionalInvestmentRate × GDP

investmentCapacity = retainedCorporateEarnings + creditFunding

investment = min(investmentDemand, investmentCapacity) × businessCreditMultiplier
```

**Code**: `macro.ts` lines 1760-1790

---

## 3. Loop 1: Revenue Pressure (Displacement-Demand Feedback)

**Color**: `#EF4444` (red)

**Plain English**: When GDP contracts, firms face revenue pressure and respond by automating faster (cutting costs via AI). This accelerated automation displaces more workers, reducing wages and consumption, which contracts GDP further — a self-reinforcing vicious cycle.

### Variable Chain

```
GDP Growth ──(-)-→ Revenue Pressure ──(+)-→ Automation Acceleration
    ↑                                              │
    │                                              (+)
    │                                              ↓
Consumption ←(-)-── Wage Income ←(-)-── Unemployment ←(+)-── Displacement Rate
    │                                                              ↑
    └──────────────────────(+)─────────────────────────────────────┘
                    (feedback return)
```

### Variables (7 nodes)

| # | Variable | ID | Format | Shared? | Equation Ref | Code Reference |
|---|----------|----|--------|---------|-------------|----------------|
| 1 | GDP Growth Rate | `dl_gdp_growth` | percent | Yes (GDP) | §5.6 | `macro.ts:computeMacro()` |
| 2 | Revenue Pressure | `dl_revenue_pressure` | percent | No | §1.5 | `macro.ts:computeRevenuePressure()` |
| 3 | Automation Acceleration | `dl_auto_accel` | multiplier | No | §1.5 | `adoption.ts:applyRevenuePressure()` |
| 4 | Displacement Rate | `dl_displacement` | percent | No | §2.1 | `displacement.ts:computeSimplifiedDisplacement()` |
| 5 | Unemployment Rate | `dl_unemployment` | percent | Yes (Unemployment) | §2.2 | `macro.ts:computeMacro()` |
| 6 | Wage Income | `dl_wage_income` | currency | Yes (Wages) | §3.1 | `macro.ts:computeMacro()` |
| 7 | Consumption | `dl_consumption` | currency | Yes (Consumption) | §3.2 | `macro.ts:computeMacro()` |

### Equations

**Edge 1→2: GDP Growth → Revenue Pressure** (polarity: `-`, negative GDP growth creates positive pressure)
```
gdpContraction = max(0, -gdpGrowthRate)
revenuePressure = min(cap, sensitivity × gdpContraction)
```
- `sensitivity`: default `1.50` (REVENUE_PRESSURE_SENSITIVITY_DEFAULT)
- `cap`: default `0.30` (REVENUE_PRESSURE_CAP)
- When GDP grows: pressure = 0. When GDP contracts by 5%: pressure = min(0.30, 1.5 × 0.05) = 7.5%

**Edge 2→3: Revenue Pressure → Automation Acceleration** (polarity: `+`)
```
automationAcceleration(t) = min(cap, previousAcceleration(t-1) × decay + revenuePressure(t))
```
- `decay`: default `0.50` (REVENUE_PRESSURE_DECAY)
- Accumulates over time: persistent GDP decline builds acceleration. Decays when pressure eases.

**Edge 3→4: Automation Acceleration → Displacement** (polarity: `+`)
```
effectiveAdoptionRate = baseAdoptionRate × (1 + automationAcceleration)
displacement = min(1, effectiveAdoptionRate × capability²)
```
- Quadratic in capability: displacement = adoptionRate × capability × capability
- Example: adoption=0.5, capability=0.7 → displacement = 0.5 × 0.49 = 24.5%

**Edge 4→5: Displacement → Unemployment** (polarity: `+`)
```
displacedWorkers = totalEmployment × displacementRate
effectiveUnemployment = laborForce - remainingEmployed
unemploymentRate = effectiveUnemployment / laborForce
```

**Edge 5→6: Unemployment → Wage Income** (polarity: `-`)
```
wageIncome = wageBase × (remainingEmployed / baselineEmployment) × wagePressure
```
- More unemployment → fewer employed → lower aggregate wages
- `wagePressure` from Phillips curve (Loop 2) also depresses wages

**Edge 6→7: Wage Income → Consumption** (polarity: `+`)
```
consumption = wageIncome × MPC_WAGE + assetIncome × MPC_ASSET + transferIncome × MPC_TRANSFER
```
- Lower wages → lower consumption (MPC_WAGE = 0.80)

**Edge 7→1: Consumption → GDP Growth (feedback return)** (polarity: `+`)
```
GDP = Consumption + Investment + GovSpending + NetExports
gdpGrowthRate = (realGDP(t) - realGDP(t-1)) / realGDP(t-1)
```
- Consumption is ~68% of GDP. When it falls, GDP falls, triggering more revenue pressure.

### Adjustable Parameters

| Parameter | Default | Min | Max | Step | Unit | Constant |
|-----------|---------|-----|-----|------|------|----------|
| Revenue Pressure Sensitivity | 1.50 | 0 | 5.0 | 0.1 | x | `REVENUE_PRESSURE_SENSITIVITY_DEFAULT` |
| Revenue Pressure Cap | 0.30 | 0 | 1.0 | 0.01 | % | `REVENUE_PRESSURE_CAP` |
| Revenue Pressure Decay | 0.50 | 0 | 1.0 | 0.01 | x | `REVENUE_PRESSURE_DECAY` |
| Initial GDP Growth Shock | 0.02 | -0.10 | 0.05 | 0.005 | % | (simulation input) |

---

## 4. Loop 2: Phillips Curve (Wage-Price Spiral)

**Color**: `#F59E0B` (amber)

**Plain English**: When unemployment rises, workers lose bargaining power and wages fall (Phillips curve). Falling wages reduce cost-push inflation, which lowers prices. But — AI-augmented workers who remain employed become scarce and command a productivity premium (hump-shaped: peaks when half the workforce is augmented). The tension between these two forces determines whether wages stabilize or collapse.

### Variable Chain

```
Unemployment Rate ──(+)-→ Excess Unemployment ──(-)-→ Phillips Pressure
        ↑                                                      │
        │                                                      (-)
        │                                                      ↓
Real Wages ←(+)-── Cost-Push Inflation ←(-)-── Wage Pressure ←(+)-── AI Wage Premium
        │                                              ↑
        └──────────(+)─────────────────────────────────┘
                 (feedback return)
```

### Variables (7 nodes)

| # | Variable | ID | Format | Shared? | Code Reference |
|---|----------|----|--------|---------|----------------|
| 1 | Unemployment Rate | `pc_unemployment` | percent | Yes (Unemployment) | `macro.ts:computeMacro()` |
| 2 | Excess Unemployment | `pc_excess_ue` | percent | No | `macro.ts:computeWagePressure()` |
| 3 | Phillips Pressure | `pc_phillips` | multiplier | No | `macro.ts:computeWagePressure()` |
| 4 | AI Wage Premium | `pc_ai_premium` | multiplier | No | `macro.ts:computeWagePressure()` |
| 5 | Wage Pressure | `pc_wage_pressure` | multiplier | No | `macro.ts:computeWagePressure()` |
| 6 | Cost-Push Inflation | `pc_inflation` | percent | Yes (Inflation) | `macro.ts:computeMacro()` |
| 7 | Real Wages | `pc_real_wages` | currency | Yes (Wages) | `macro.ts:computeMacro()` |

### Equations

**Edge 1→2: Unemployment → Excess Unemployment** (polarity: `+`)
```
excessUnemployment = max(0, unemploymentRate - naturalRate)
```
- `naturalRate` (NAIRU): default `0.044` (4.4%)
- Below NAIRU: excess = 0, no downward wage pressure

**Edge 2→3: Excess UE → Phillips Pressure** (polarity: `-`)
```
phillipsPressure = exp(-sensitivity × excessUnemployment)
```
- `sensitivity`: default `0.15` (PHILLIPS_CURVE_SENSITIVITY)
- Exponential decay: 0% excess → pressure = 1.0 (full); 10% excess → pressure ≈ 0.22
- This is the classic Phillips curve: high unemployment = low wage pressure

**Edge 4: AI Wage Premium** (independent input from automation coverage)
```
aiPremium = automationCoverage × multiplier × (1 - automationCoverage)
```
- `multiplier`: default `0.40` (AI_WAGE_PRODUCTIVITY_MULTIPLIER)
- Hump-shaped: peaks at 50% automation coverage (0.5 × 0.40 × 0.5 = 0.10)
- At 0% or 100% coverage: premium = 0
- Rationale: at 50% automation, the remaining human workers are scarce and AI-augmented, commanding premium

**Edge 3+4→5: Phillips + Premium → Wage Pressure** (polarity: `+`)
```
wagePressure = max(policyWageFloor, phillipsPressure + aiPremium)
```
- `policyWageFloor` = (federalMinimumWage × 2080) / baselineAverageWage
- Wage pressure ∈ [0, ~1.1] — below 1.0 means wages falling, above 1.0 means rising

**Edge 5→6: Wage Pressure → Cost-Push Inflation** (polarity: `-`)
```
nominalWages(t) = nominalWages(t-1) × wagePressure
costPushInflation = (wagePressure - 1.0) × laborCostShare
```
- Lower wage pressure → less cost-push → lower inflation (or deflation)

**Edge 6→7: Cost-Push Inflation → Real Wages** (polarity: `-`)
```
realWages = nominalWages / priceLevel
priceLevel(t) = priceLevel(t-1) × (1 + compositeInflation)
```
- Higher inflation erodes real wages even if nominal wages stay flat

### Adjustable Parameters

| Parameter | Default | Min | Max | Step | Unit | Constant |
|-----------|---------|-----|-----|------|------|----------|
| Phillips Curve Sensitivity | 0.15 | 0.01 | 1.0 | 0.01 | x | `PHILLIPS_CURVE_SENSITIVITY` |
| Natural Unemployment Rate | 0.044 | 0.02 | 0.10 | 0.002 | % | `FRED_NAIRU_RATE` |
| AI Wage Productivity Multiplier | 0.40 | 0 | 2.0 | 0.05 | x | `AI_WAGE_PRODUCTIVITY_MULTIPLIER` |
| Automation Coverage | 0 | 0 | 1.0 | 0.01 | % | (simulation input) |

---

## 5. Loop 3: Demand Spillover

**Color**: `#6366F1` (indigo)

**Plain English**: When workers lose income, they spend less. Reduced consumer spending means less demand for goods and services, causing businesses to lay off additional workers — even those not directly displaced by AI. This is the demand multiplier effect: one person's spending is another person's income.

### Variable Chain

```
Income ──(+)-→ Consumption ──(+)-→ Investment ──(+)-→ Gov Spending
   ↑                                                       │
   │                                                       (+)
   │                                                       ↓
Employment ←(+)-── Demand Survival Rate ←(+)-── GDP (Demand Ratios)
   │                                                       ↑
   └──────────────────────(+)──────────────────────────────┘
                    (feedback return)
```

### Variables (7 nodes)

| # | Variable | ID | Format | Shared? | Code Reference |
|---|----------|----|--------|---------|----------------|
| 1 | Income | `ds_income` | currency | Yes (Wages) | `macro.ts:computeMacro()` |
| 2 | Consumption | `ds_consumption` | currency | Yes (Consumption) | `macro.ts:computeMacro()` |
| 3 | Investment | `ds_investment` | currency | Yes (Investment) | `macro.ts:computeMacro()` |
| 4 | Gov Spending | `ds_gov_spending` | currency | No | `macro.ts:computeMacro()` |
| 5 | GDP | `ds_gdp` | currency | Yes (GDP) | `macro.ts:computeMacro()` |
| 6 | Demand Ratios | `ds_demand_ratio` | multiplier | No | `simulation.ts:840-918` |
| 7 | Employment | `ds_employment` | number | No | `simulation.ts:920` |

### Equations

**Edge 1→2: Income → Consumption** (polarity: `+`)
```
consumption = wageIncome × MPC_WAGE + assetIncome × MPC_ASSET + transferIncome × MPC_TRANSFER
            - deflationDrag × totalIncome × DEFERRABLE_SHARE
```
- MPC_WAGE = 0.80, MPC_ASSET = 0.35, MPC_TRANSFER = 0.90
- Differentiated MPC: wage earners spend most, asset holders save more, transfer recipients spend almost all

**Edge 2+3+4→5: C + I + G → GDP** (polarity: `+`)
```
GDP = Consumption + Investment + GovernmentSpending + NetExports
```

**Edge 5→6: GDP → Demand Ratios** (polarity: `+`)
```
consumerDemandRatio = realConsumption(t-1) / baselineConsumption
govDemandRatio = realGovSpending(t-1) / baselineGovSpending
businessDemandRatio = realInvestment(t-1) / baselineInvestment
```
- Level-based comparison to FIXED year-0 baselines (not growing)
- Deflated by priceLevel to prevent nominal inflation from inflating demand

**Edge 6→7: Demand Ratios → Employment** (polarity: `+`)
```
// Per cluster:
clusterDemandRatio = consumerShare × consumerDemandRatio
                   + govShare × govDemandRatio
                   + businessShare × businessDemandRatio

demandShortfall = max(0, 1.0 - clusterDemandRatio)
excessShortfall = max(0, demandShortfall - tolerance)
demandSurvivalRate = 1.0 - excessShortfall

constrainedEmployment = remainingEmployment × demandSurvivalRate
```
- `tolerance`: default `0.03` (3% band before layoffs start)
- Each cluster has different demand mix (consumer/gov/business shares)
- When demand ratio < (1 - tolerance): additional layoffs from demand loss

**Edge 7→1: Employment → Income (feedback return)** (polarity: `+`)
```
wageIncome = baselineWages × employmentRatio × wageRatio
```
- Fewer jobs → less total income → less spending → less demand → fewer jobs (spiral)

### Adjustable Parameters

| Parameter | Default | Min | Max | Step | Unit | Constant |
|-----------|---------|-----|-----|------|------|----------|
| MPC (Wages) | 0.80 | 0.50 | 0.95 | 0.01 | x | `MPC_WAGE` |
| MPC (Assets) | 0.35 | 0.10 | 0.70 | 0.01 | x | `MPC_ASSET` |
| MPC (Transfers) | 0.90 | 0.50 | 1.0 | 0.01 | x | `MPC_TRANSFER` |
| Demand Spillover Tolerance | 0.03 | 0 | 0.10 | 0.005 | % | `config.demandSpilloverTolerance` |

---

## 6. Loop 4: Credit Crunch

**Color**: `#D97706` (orange)

**Plain English**: Rising unemployment causes banks to tighten consumer lending (income adequacy falls, collateral values drop, systemic risk rises). Tighter credit reduces consumer borrowing power, cutting consumption. Simultaneously, falling corporate profits and negative GDP growth cause business credit tightening, reducing investment. Both channels suppress GDP, driving more unemployment.

### Variable Chain

```
Unemployment ──(+)-→ Consumer Credit Tightening ──(-)-→ Consumption Multiplier
       ↑                                                        │
       │                                                        (-)
       │                                                        ↓
   GDP Gap ←(-)-── Investment ←(-)-── Business Credit ←(+)-── Consumption
       │                                                        ↑
       └────────────────────────(-)─────────────────────────────┘
                          (feedback return)
```

### Variables (7 nodes)

| # | Variable | ID | Format | Shared? | Code Reference |
|---|----------|----|--------|---------|----------------|
| 1 | Unemployment Rate | `cc_unemployment` | percent | Yes (Unemployment) | `macro.ts:computeMacro()` |
| 2 | Consumer Credit Tightening | `cc_consumer_credit` | percent | No | `macro.ts:computeConsumerCreditConditions()` |
| 3 | Consumption Multiplier | `cc_consumption_mult` | multiplier | No | `macro.ts:computeConsumerCreditConditions()` |
| 4 | Consumption | `cc_consumption` | currency | Yes (Consumption) | `macro.ts:computeMacro()` |
| 5 | GDP Gap | `cc_gdp_gap` | percent | Yes (GDP) | `macro.ts:computeMacro()` |
| 6 | Business Credit | `cc_business_credit` | multiplier | No | `macro.ts:computeBusinessCreditConditions()` |
| 7 | Investment | `cc_investment` | currency | Yes (Investment) | `macro.ts:computeMacro()` |

### Equations

**Edge 1→2: Unemployment → Consumer Credit Tightening** (polarity: `+`)

Consumer credit uses a 4-channel model:

```
Channel 1 — Income Adequacy:
  underwritableIncome = wageIncome × 1.0 + transferIncome × 0.70 + assetIncome × 0.50
  incomeAdequacyRatio = underwritableIncome / (baseline × (1 + trendGrowth)^years)
  incomeTightening = incomeAdequacySensitivity × max(0, 1 - incomeAdequacyRatio)

Channel 2 — Collateral Values (asymmetric):
  If prices falling:  tightening = collateralSensitivity × mortgageStress × |priceChange|
  If prices rising:   loosening = -collateralSensitivity × 0.33 × priceChange
  (3:1 asymmetry: falling prices tighten 3× faster than rising prices loosen)

Channel 3 — Systemic Portfolio Risk:
  cwiDecline = max(0, 1 - prevCWI / baselineCWI)
  systemicTightening = systemicRiskSensitivity × cwiDecline

Channel 4 — Inflation Risk:
  inflationPremium = max(0, inflation - 0.03) × inflationRiskSensitivity

Combined:
  totalTightening = min(maxTightening, income + collateral + systemic + inflation)
  consumerCreditMultiplier = 1.0 - creditImpact × (totalTightening / maxTightening)
```

**Edge 2→3→4: Credit Tightening → Consumption** (polarity: `-`)
```
creditConstrainedConsumption = baseConsumption × consumerCreditMultiplier
```
- Multiplier ∈ [0.01, 1.0]: at maximum tightening (0.70), multiplier = 1 - 0.30 × 1.0 = 0.70

**Edge 4→5: Consumption → GDP Gap** (polarity: `+`)
```
gdpGrowthRate = (realGDP(t) - realGDP(t-1)) / realGDP(t-1)
gdpGap = gdpGrowthRate  (used as business credit signal)
```

**Edge 5→6: GDP Gap → Business Credit** (polarity: `-`)

Business credit uses 2 channels:
```
Channel 1 — Profitability:
  profitCoverageRatio = afterTaxProfits / baselineProfits
  profitSignal = 1.0 - profitCoverageRatio
  profitTightening = profitabilitySensitivity × profitSignal

Channel 2 — Revenue Trajectory:
  growthSignal = -growthTrajectorySensitivity × gdpGrowthRate
  (Negative GDP growth → positive tightening signal)

Combined:
  totalTightening = clamp(profitTightening + growthSignal, -maxLoosening, maxTightening)
  businessCreditMultiplier = 1.0 - investmentImpact × (totalTightening / maxTightening)
```

**Edge 6→7: Business Credit → Investment** (polarity: `-`)
```
investment = min(investmentDemand, investmentCapacity) × businessCreditMultiplier
```

**Edge 7→1: Investment → Unemployment (feedback return)** (polarity: `-`)
```
GDP = C + I + G + NX
Lower investment → Lower GDP → Lower demand for workers → Higher unemployment
```

**SPECIAL CONNECTION**: Business credit loosening also feeds back into adoption:
```
// When business credit is loose (negative tightening = loosening):
creditAdoptionAcceleration = min(cap, businessCreditLoosening × creditAdoptionSensitivity)
// Cheap capital → firms invest in automation → feeds Loop 1
```

### Adjustable Parameters

| Parameter | Default | Min | Max | Step | Unit | Constant |
|-----------|---------|-----|-----|------|------|----------|
| Income Adequacy Sensitivity | 0.50 | 0 | 2.0 | 0.05 | x | `CREDIT_UE_SENSITIVITY` (Note: constant name is legacy) |
| Max Consumer Tightening | 0.70 | 0.10 | 1.0 | 0.05 | % | `MAX_CREDIT_TIGHTENING` |
| Business Credit GDP Sensitivity | 5.0 | 0 | 10.0 | 0.5 | x | `DEFAULT_BUSINESS_CREDIT_GDP_SENSITIVITY` |
| Credit → Consumption Impact | 0.06 | 0 | 0.30 | 0.01 | x | `CREDIT_CONSUMPTION_SENSITIVITY` |

---

## 7. Loop 5: Fiscal-Monetary

**Color**: `#22C55E` (green)

**Plain English**: When GDP falls, tax revenue falls. Rising unemployment increases spending obligations (unemployment insurance, safety net). The gap between revenue and spending creates a deficit, which accumulates as debt. When debt/GDP exceeds thresholds, the government may: (a) implement austerity (cutting spending, which further reduces GDP — the austerity paradox), or (b) monetize the debt (central bank prints money to buy bonds), which creates inflation. Inflation raises nominal GDP, temporarily improving debt ratios, but erodes real purchasing power.

### Variable Chain

```
Tax Revenue ──(-)-→ Deficit ──(+)-→ Debt/GDP ──(+)-→ Interest Expense
       ↑                                                       │
       │                                                       (+)
       │                                                       ↓
Nominal GDP ←(+)-── Inflation ←(+)-── Money Creation ←(+)-── Monetization Rate
       │                                          ↑                    ↑
       └──────────(+)─────────────────────────────┘                    │
                                                          Debt Service Ratio
```

### Variables (8 nodes)

| # | Variable | ID | Format | Shared? | Code Reference |
|---|----------|----|--------|---------|----------------|
| 1 | Tax Revenue | `fm_revenue` | currency | No | `fiscal.ts:computeEndogenousRevenue()` |
| 2 | Deficit | `fm_deficit` | currency | No | `fiscal.ts:computeDebtAccumulation()` |
| 3 | Debt/GDP Ratio | `fm_debt_gdp` | percent | No | `fiscal.ts:computeDebtAccumulation()` |
| 4 | Interest Expense | `fm_interest` | currency | No | `fiscal.ts` (bond market) |
| 5 | Debt Service Ratio | `fm_debt_service` | percent | No | `simulation.ts` |
| 6 | Monetization Rate | `fm_monetization` | percent | No | `monetization.ts:computeMonetizationRate()` |
| 7 | Money Creation | `fm_money_creation` | currency | No | `monetary.ts:computeMonetaryState()` |
| 8 | Inflation | `fm_inflation` | percent | Yes (Inflation) | `macro.ts:computeMacro()` |

### Equations

**Edge 1→2: Revenue → Deficit** (polarity: `-`)
```
laborTaxRevenue = wageIncomeTax + payrollTax_employee + payrollTax_employer
corporateTaxRevenue = corporateProfits × effectiveCorporateTaxRate
totalRevenue = laborTaxRevenue + corporateTaxRevenue + capitalGainsTax + stateLocalRevenue

primaryDeficit = governmentSpending - interestExpense - totalRevenue
totalDeficit = primaryDeficit + interestExpense
```
- As wages fall (displacement), labor tax revenue falls → deficit rises

**Edge 2→3: Deficit → Debt/GDP** (polarity: `+`)
```
debtStock(t) = debtStock(t-1) + totalDeficit(t)
debtGDPRatio = debtStock / nominalGDP
```
- Initial debtGDP ≈ 1.24 (124% — current US level)
- Safety cap at extreme values to prevent numerical explosion

**Edge 3→4: Debt/GDP → Interest Expense** (polarity: `+`)
```
interestExpense = debtStock × weightedAverageYield
weightedAverageYield = f(tenYearYield, rolloverRate, existingCoupons)
```
- Higher debt → more bonds → more interest payments
- Interest expense itself adds to the deficit → self-reinforcing

**Edge 4→5: Interest → Debt Service Ratio** (polarity: `+`)
```
debtServiceRatio = interestExpense / totalRevenue
```
- When interest > 50% of revenue: Case 2 monetization triggers (financial repression)

**Edge 5→6: Debt Service → Monetization Rate** (polarity: `+`)

6 cases determine monetization:
```
Case 1 (QE):          policyRate ≤ effectiveLowerBound → rate = qeMonetizationRate (25%)
Case 2 (Repression):  debtServiceRatio > 50% → ramp from 25% to maxFinancialRepressionRate
Case 3 (Dominance):   fiscal pressure prevents Fed tightening → partial monetization
Case 5 (Yield):       10Y yield > 8% → ramp from 25% to 70%
Case 6 (LOLR):        10Y yield > 12% → ramp from 70% to 95% (crisis backstop)
```
- Rate = max of all applicable cases
- Asymmetric smoothing: ramp up fast, taper gradually (Fix 3)

**Edge 6→7: Monetization → Money Creation** (polarity: `+`)
```
monetizedDeficit = totalDeficit × monetizationRate
deltaM = monetizedDeficit
moneySupply(t) = moneySupply(t-1) + deltaM
```

**Edge 7→8: Money Creation → Inflation** (polarity: `+`)
```
Fisher: M × V = P × Y
inflationFromMonetization = (deltaM × velocity) / realGDP - aiDeflationRate

dynamicVelocity = baselineVelocity × velocityMultiplier
velocityMultiplier = max(floorRatio, (1 - sensitivity × excessUE) × demandEffect)
```
- High unemployment → velocity drops (hoarding) → dampens inflation even with money printing
- This is why monetization doesn't always cause runaway inflation

**Edge 8→1: Inflation → Nominal GDP → Tax Revenue (feedback return)** (polarity: `+`)
```
priceLevel(t) = priceLevel(t-1) × (1 + compositeInflation)
nominalGDP = realGDP × priceLevel
taxRevenue ∝ nominalGDP × effectiveTaxRate
```
- Inflation raises nominal GDP → raises nominal tax revenue (even if real activity flat)
- This is the "inflate away the debt" mechanism

### Fiscal Consolidation (Austerity Sub-Loop)

When debt/GDP crosses thresholds, the government may cut spending:
```
If debtGDP > consolidationThreshold:
  intensity = min(1, (debtGDP - threshold) / (maxThreshold - threshold))
  discretionaryMultiplier = 1.0 - intensity × maxDiscretionaryCut
  obligationMultiplier = 1.0 - intensity × maxObligationCut
  revenueMultiplier = 1.0 + intensity × maxRevenueIncrease
```
- This creates the **Keynesian Austerity Paradox**: cutting spending → GDP falls → tax revenue falls MORE than spending was cut → debt/GDP ratio WORSENS

### Adjustable Parameters

| Parameter | Default | Min | Max | Step | Unit | Constant |
|-----------|---------|-----|-----|------|------|----------|
| Effective Tax Rate | 0.25 | 0.10 | 0.40 | 0.01 | % | `EFFECTIVE_TAX_RATE` |
| QE Monetization Rate | 0.25 | 0 | 1.0 | 0.05 | % | `config.qeMonetizationRate` |
| Max Financial Repression Rate | 0.50 | 0 | 1.0 | 0.05 | % | `config.maxFinancialRepressionRate` |
| Baseline GDP Growth | 0.02 | -0.05 | 0.05 | 0.005 | % | `BASELINE_GDP_GROWTH_RATE` |

---

## 8. Loop 6: Housing Wealth

**Color**: `#EC4899` (pink)

**Plain English**: When wages decline, workers struggle to make mortgage payments. The mortgage stress index rises (composition-weighted: high-wage workers with large mortgages are displaced first). Stress leads to foreclosures, destroying housing wealth. Lost housing wealth reduces consumption (wealth effect MPC ≈ 5 cents per dollar of housing wealth lost). Lower consumption depresses GDP and employment, further reducing wages.

### Variable Chain

```
Wage Growth ──(+)-→ Affordability ──(-)-→ Mortgage Stress ──(+)-→ Foreclosures
       ↑                                                              │
       │                                                              (+)
       │                                                              ↓
Employment ←(+)-── GDP ←(+)-── Wealth Consumption ←(+)-── Housing Wealth
       │                                                              ↑
       └────────────────────────(+)───────────────────────────────────┘
                          (feedback return)
```

### Variables (7 nodes)

| # | Variable | ID | Format | Shared? | Code Reference |
|---|----------|----|--------|---------|----------------|
| 1 | Wage Growth | `hw_wage_growth` | percent | Yes (Wages) | `macro.ts:computeMacro()` |
| 2 | Affordability | `hw_affordability` | multiplier | No | `macro.ts:computeHomePriceChange()` |
| 3 | Mortgage Stress | `hw_mortgage_stress` | multiplier | No | `macro.ts:computeMortgageStressIndex()` |
| 4 | Foreclosures | `hw_foreclosures` | percent | No | `macro.ts:updateHomeownership()` |
| 5 | Housing Wealth | `hw_housing_wealth` | currency | No | `macro.ts:computeMacro()` |
| 6 | Wealth Consumption | `hw_wealth_consumption` | currency | Yes (Consumption) | `macro.ts:computeMacro()` |
| 7 | GDP | `hw_gdp` | currency | Yes (GDP) | `macro.ts:computeMacro()` |

### Equations

**Edge 1→2: Wage Growth → Affordability** (polarity: `+`)
```
realIncomeGrowthRate = (realIncome(t) - realIncome(t-1)) / realIncome(t-1)
affordabilityDeviation = (homePriceIndex / incomeIndex) - 1.0
```
- Falling real income → affordability deteriorates → home prices face headwinds

**Edge 2→3: Affordability → Mortgage Stress** (polarity: `-`)

Home price change is a 5-channel model:
```
Channel 1: Mortgage affordability  = -mortgageRateChange × priceSensitivity (4.0)
Channel 2: Real income growth     = realIncomeGrowthRate × housingElasticity (0.5)
Channel 3: Foreclosure supply     = foreclosureSupplyPressure (negative)
Channel 4: Demographic demand     = populationGrowth × demographicElasticity (1.0)
Channel 5: Affordability reversion = deviation × reversionSensitivity (0.15)
           (asymmetric: downward stickiness ratio = 0.5)

homePriceChange = sum of all 5 channels
```

Mortgage stress is composition-based:
```
mortgageStressIndex = 1.0 + (rawIndex - 1.0) × amplifier

rawIndex = sum(quintile_displacement × mortgage_burden × homeownership)
         / sum(overall_displacement × mortgage_burden × homeownership)
```
- When high-income quintiles (Q5) are displaced disproportionately: rawIndex > 1 → amplified stress
- `amplifier`: default `0.40` (DEFAULT_MORTGAGE_STRESS_AMPLIFIER)
- Mortgage burden by quintile: Q1=8%, Q2=10%, Q3=12%, Q4=13%, Q5=15%

**Edge 3→4: Mortgage Stress → Foreclosures** (polarity: `+`)
```
// From updateHomeownership():
quintileForeclosures = displacementRate × foreclosureLag × homeownershipRate × stressMultiplier
dynamicHomeownership[q] = max(minRate, previousRate - foreclosures + recoveries)
```
- `foreclosureLag`: default 2 years (displaced workers don't foreclose immediately)
- `recoveryRate`: default 0.02 (2% of lost homeownership recovers per year)

**Edge 4→5: Foreclosures → Housing Wealth** (polarity: `-`)
```
foreclosureSupplyPressure = -totalForeclosureRate × supplyElasticity
homePriceChange includes foreclosureSupplyPressure (Channel 3)
housingWealth = homePriceIndex × baselineHousingStock × dynamicHomeownershipRate
```
- Foreclosures create supply glut → price decline → wealth destruction

**Edge 5→6: Housing Wealth → Wealth Consumption** (polarity: `+`)
```
housingWealthEffect = (housingWealth(t) - housingWealth(t-1)) / housingWealth(t-1)
wealthConsumption = housingWealthEffect × HOUSING_WEALTH_MPC × GDP
```
- `HOUSING_WEALTH_MPC`: default `0.05` (5 cents of consumption per dollar of housing wealth change)

**Edge 6→7→1: Wealth Consumption → GDP → Employment → Wages (feedback return)** (polarity: `+`)
```
GDP = C + I + G + NX  (where C now includes wealthConsumption)
Employment tracks GDP through demand survival
Wages track employment through wagePressure
```

### Adjustable Parameters

| Parameter | Default | Min | Max | Step | Unit | Constant |
|-----------|---------|-----|-----|------|------|----------|
| Mortgage Stress Amplifier | 0.40 | 0 | 3.0 | 0.1 | x | `DEFAULT_MORTGAGE_STRESS_AMPLIFIER` |
| Housing Wealth MPC | 0.05 | 0 | 0.15 | 0.005 | x | `DEFAULT_HOUSING_WEALTH_MPC` |
| Foreclosure Lag | 2 | 0 | 5 | 1 | years | `DEFAULT_FORECLOSURE_LAG` |
| Homeownership Recovery Rate | 0.02 | 0 | 0.10 | 0.005 | x | `DEFAULT_HOMEOWNERSHIP_RECOVERY_RATE` |

---

## 9. Complete Interconnection Map

This section shows exactly how every loop connects to every other loop through shared variables.

### Adjacency Matrix

Which loops share which variables:

| | Loop 1 (Displ-Demand) | Loop 2 (Phillips) | Loop 3 (Demand) | Loop 4 (Credit) | Loop 5 (Fiscal) | Loop 6 (Housing) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Loop 1** | — | Unemployment, Wages | GDP, Consumption, Wages | GDP, Unemployment | GDP | GDP, Consumption, Wages |
| **Loop 2** | Unemployment, Wages | — | Wages | Unemployment | Inflation | Wages |
| **Loop 3** | GDP, Consumption, Wages | Wages | — | GDP, Consumption, Investment | GDP | GDP, Consumption |
| **Loop 4** | GDP, Unemployment | Unemployment | GDP, Consumption, Investment | — | GDP | GDP, Consumption |
| **Loop 5** | GDP | Inflation | GDP | GDP | — | — |
| **Loop 6** | GDP, Consumption, Wages | Wages | GDP, Consumption | GDP, Consumption | — | — |

### Causal Flow Between Loops

**Loop 1 (Displ-Demand) → Loop 2 (Phillips)**: Displacement raises unemployment → Phillips curve depresses wages
**Loop 1 (Displ-Demand) → Loop 3 (Demand)**: Wage loss → consumption drop → demand spillover
**Loop 1 (Displ-Demand) → Loop 4 (Credit)**: Unemployment → income adequacy falls → credit tightens
**Loop 1 (Displ-Demand) → Loop 5 (Fiscal)**: GDP decline → tax revenue falls → deficit rises
**Loop 1 (Displ-Demand) → Loop 6 (Housing)**: Wages decline → affordability worsens → mortgage stress

**Loop 2 (Phillips) → Loop 1 (Doom)**: Lower wage pressure → lower wages → lower consumption → lower GDP → more revenue pressure
**Loop 2 (Phillips) → Loop 5 (Fiscal)**: Wage-driven inflation → changes composite inflation → affects monetization

**Loop 3 (Demand) → Loop 1 (Doom)**: Demand spillover layoffs → more displacement → GDP drops more
**Loop 3 (Demand) → Loop 4 (Credit)**: Lower consumption → lower corporate profits → business credit tightens

**Loop 4 (Credit) → Loop 1 (Doom)**: Credit-constrained consumption → GDP drops → revenue pressure rises
**Loop 4 (Credit) → Loop 3 (Demand)**: Investment drop → GDP drop → demand ratios worsen
**Loop 4 (Credit) → Loop 1 (Doom) [SPECIAL]**: Business credit LOOSENING → cheap capital → adoption acceleration

**Loop 5 (Fiscal) → Loop 3 (Demand)**: Government spending cuts (consolidation) → GDP drops
**Loop 5 (Fiscal) → All**: Monetization inflation → erodes real income → affects all loops through priceLevel

**Loop 6 (Housing) → Loop 4 (Credit)**: Falling home prices + mortgage stress → collateral channel tightens consumer credit
**Loop 6 (Housing) → Loop 3 (Demand)**: Wealth consumption drop → GDP drops → demand spillover

### The Master Causal Sequence

In a full crisis scenario, the loops activate in roughly this order:

```
Year 0-3: AI begins displacing workers
    │
    ├─→ LOOP 1 activates: Revenue pressure builds, adoption accelerates
    ├─→ LOOP 2 activates: Unemployment rises above NAIRU, wages begin falling
    │
Year 3-5: Demand effects materialize
    │
    ├─→ LOOP 3 activates: Consumption drops measurably, demand spillover begins
    ├─→ LOOP 4 activates: Credit tightening begins (income adequacy channel)
    │
Year 5-8: Second-order effects compound
    │
    ├─→ LOOP 6 activates: High-income displacement → mortgage stress → foreclosures
    ├─→ LOOP 5 activates: Tax revenue declining, deficits growing, debt/GDP rising
    │
Year 8+: System-level dynamics dominate
    │
    ├─→ All 6 loops interacting simultaneously
    ├─→ Fiscal consolidation (if triggered) → austerity paradox
    ├─→ Monetization (if triggered) → inflation complicates real values
    └─→ Policy interventions (UBI, minimum wage, transfers) may stabilize
```

---

## 10. Simulation Execution Order

Each year in `simulation.ts`, the computation proceeds in this order:

```
1.  Capability scores (S-curves per vector)
2.  BFCS scores per cluster/role (Better/Faster/Cheaper/Safer)
3.  Adoption triggers (BFCS thresholds)
4.  Revenue pressure → automation acceleration (LOOP 1 entry point)
5.  Business credit → adoption acceleration (LOOP 4 → LOOP 1 cross-link)
6.  Adoption rates with acceleration (applyRevenuePressure)
7.  Per-role displacement (quadratic: adoptionRate × capability²)
8.  Aggregate employment, wages (LOOP 1 midpoint)
9.  Demand spillover (LOOP 3 — constrains employment by demand survival)
10. Scarcity inflation + labor supply response
11. Mortgage stress index (LOOP 6 entry point)
12. computeMacro() — ALL OTHER LOOPS computed here:
    a. Wage pressure / Phillips curve (LOOP 2)
    b. Consumer credit conditions (LOOP 4 consumer side)
    c. Business credit conditions (LOOP 4 business side)
    d. Home price change (LOOP 6 housing prices)
    e. Consumption = income × MPC × credit (LOOP 3 consumption)
    f. Investment = demand × capacity × businessCredit (LOOP 4 investment)
    g. Government spending with consolidation (LOOP 5 fiscal)
    h. GDP = C + I + G + NX
    i. Inflation composite (LOOP 2 + LOOP 5)
    j. Price level update
13. Fiscal block — revenue, deficit, debt (LOOP 5)
14. Bond market — yields, term premium
15. Monetization rate (LOOP 5 monetary)
16. Money supply update (Fisher equation)
17. Store year output → next year uses as inputs
```

---

## 11. Key Constants & Defaults

All constants live in `src/models/constants.ts` with source citations.

### Revenue Pressure (Loop 1)
| Constant | Value | Source |
|----------|-------|--------|
| `REVENUE_PRESSURE_SENSITIVITY_DEFAULT` | 1.50 | ATLAS calibration |
| `REVENUE_PRESSURE_CAP` | 0.30 | ATLAS calibration |
| `REVENUE_PRESSURE_DECAY` | 0.50 | ATLAS calibration |

### Phillips Curve (Loop 2)
| Constant | Value | Source |
|----------|-------|--------|
| `PHILLIPS_CURVE_SENSITIVITY` | 0.15 | Blanchard (2016) |
| `FRED_NAIRU_RATE` | 0.044 | CBO NAIRU estimate 2024 |
| `AI_WAGE_PRODUCTIVITY_MULTIPLIER` | 0.40 | ATLAS calibration |

### Demand / MPC (Loop 3)
| Constant | Value | Source |
|----------|-------|--------|
| `MPC_WAGE` | 0.80 | BLS Consumer Expenditure Survey |
| `MPC_ASSET` | 0.35 | Mian, Rao, Sufi (2013) |
| `MPC_TRANSFER` | 0.90 | Parker et al. (2013) stimulus studies |
| `BASELINE_CONSUMPTION_2025` | ~$19.3T | BEA NIPA Table 1.1.5 |
| `BASELINE_INVESTMENT_2025` | ~$4.7T | BEA NIPA |
| `BASELINE_GOVT_SPENDING_2025` | ~$4.9T | BEA NIPA |

### Credit (Loop 4)
| Constant | Value | Source |
|----------|-------|--------|
| `CREDIT_UE_SENSITIVITY` | 8.0 | ATLAS calibration (income adequacy) |
| `MAX_CREDIT_TIGHTENING` | 0.70 | ATLAS calibration |
| `CREDIT_CONSUMPTION_SENSITIVITY` | 0.06 | ATLAS calibration |
| `DEFAULT_BUSINESS_CREDIT_GDP_SENSITIVITY` | 5.0 | ATLAS calibration |

### Fiscal-Monetary (Loop 5)
| Constant | Value | Source |
|----------|-------|--------|
| `EFFECTIVE_TAX_RATE` | 0.25 | CBO effective federal rate |
| `INITIAL_DEBT_GDP_RATIO` | 1.24 | Treasury 2024 |
| `BASELINE_VELOCITY_OF_MONEY` | 1.2 | FRED M2 velocity |
| `BASE_INFLATION_RATE` | 0.02 | Fed 2% target |

### Housing (Loop 6)
| Constant | Value | Source |
|----------|-------|--------|
| `DEFAULT_MORTGAGE_STRESS_AMPLIFIER` | 0.40 | ATLAS calibration |
| `DEFAULT_HOUSING_WEALTH_MPC` | 0.05 | Case, Quigley, Shiller (2005) |
| `DEFAULT_AFFORDABILITY_PRICE_SENSITIVITY` | 4.0 | FHFA house price model |
| `DEFAULT_INCOME_HOUSING_ELASTICITY` | 0.50 | ATLAS calibration |
| `DEFAULT_FORECLOSURE_LAG` | 2 | Historical: foreclosure takes ~2 years |

### Employment Baselines
| Constant | Value | Source |
|----------|-------|--------|
| `BASELINE_TOTAL_EMPLOYMENT` | ~158.3M | BLS CES 2024 |
| `BASELINE_AVERAGE_ANNUAL_WAGE` | ~$65,470 | BLS OEWS 2024 |
| `BASELINE_LABOR_FORCE` | ~167.6M | BLS LAUS 2024 |

---

## Appendix: Visual Design Context

### Current UI Stack
- **Charts**: Recharts (standard), D3.js (geo/custom), Custom SVG (flow diagrams)
- **Design**: Dark navy palette (#04070D void, #080D18 deep, #0C1424 surface), gold accent (#D4A03C)
- **Typography**: JetBrains Mono (data/mono), DM Sans (body), Instrument Serif (display)
- **Components**: 16px border-radius cards, subtle borders at ~10% opacity, no shadows
- **Animation**: Framer Motion for panels, CSS @keyframes for SVG flow animations

### Existing Data Layer (Ready to Use)
The following files already exist and provide the complete data/simulation layer for building loop visualizations. They do NOT need to be rewritten:

- **`src/components/charts/feedbackLoops/types.ts`** — TypeScript interfaces: `FeedbackLoopDefinition`, `LoopNode`, `LoopEdge`, `LoopParam`, `CascadeAnimationState`, `SharedNode`
- **`src/components/charts/feedbackLoops/loopDefinitions.ts`** — All 6 loops declared with nodes, edges, params, colors. Also exports `ALL_LOOPS`, `SHARED_NODES`, `NODE_TO_SHARED`
- **`src/components/charts/feedbackLoops/loopSimulations.ts`** — Pure `simulateLoop(loopId, params)` functions that import actual model equations. Returns `Record<string, number>` of node values.
- **`src/components/charts/feedbackLoops/useLoopSimulation.ts`** — React hook providing: `params`, `setParam`, `resetParams`, `nodeValues`, `baselineValues`, `deltas`, `cascade`

### Integration Point
The visualizations render inside `MethodologyView.tsx` → `FeedbackLoopsSection.tsx` as Section 0 ("System Dynamics"). The methodology view has a sidebar nav (176px wide on desktop) and a `flex-1 min-w-0` main content area.
