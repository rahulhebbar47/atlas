# ATLAS Variable Registry

**Audit date:** 2026-04-07
**Scope:** Full read-only audit of every parameter, constant, computed state variable, and derived output in the ATLAS simulation engine, store, and UI.
**Source files audited:** `src/models/*.ts` (24 files), `src/types/*.ts` (4 files), `src/stores/simulationStore.ts`, `src/components/controls/*.tsx` (~40 files), `src/data/*.ts` (8 files), `src/utils/csvExport.ts`, `src/components/charts/feedbackLoops/*.ts`.

**How to read this document:**
- Each entry lists: variable name → type → defined in (file:line) → default → readers → writers → UI binding → unit.
- Types: `param` = user-adjustable, `const` = hardcoded, `state` = computed each year, `derived` = formula-from-state, `input` = function arg.
- Flags: ⚠️ DUPLICATE / ⚠️ ORPHAN / ⚠️ UNDEFINED SOURCE / ⚠️ UI BINDING — NO ENGINE.
- File:line citations come from the source files at audit time. The registry will drift as code changes — re-run the audit before relying on it.

**Categories in this document:**
1. Simulation control variables
2. Core economic parameters (MPC, income shares, price weights, discount rates)
3. Capability S-curve parameters (3 vectors)
4. BFCS thresholds and scoring constants
5. Adoption dynamics
6. Displacement model
7. New job creation
8. Employment/occupation cluster data
9. Macro: GDP, consumption, capacity
10. Macro: prices, inflation, CWI components
11. Macro: labor market, wages, unemployment
12. Macro: profits, capital share, inequality
13. Consumer Welfare Index (CWI) components
14. Housing & shelter
15. Monetary: money supply, velocity, Fisher
16. Monetization (Cases 1–6)
17. Equity market
18. Bond market
19. Federal Reserve / monetary policy
20. Fiscal: revenue, spending, debt
21. Fiscal response profiles & dimensions
22. Wage policy
23. Asset policy
24. Transfer policy
25. Tax policy
26. Credit & financial conditions
27. Supply chain (Phase 9)
28. State simulation
29. Feedback loops (6 simulator loops)
30. Parameter timeline & autopilot
31. Store state & actions
32. Government data baselines
33. ⚠️ Flagged items
34. Summary statistics

---

## 1. Simulation control variables

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `startYear` | param | types/index.ts:1095 | 2025 | simulation.ts → runSimulation; csvExport.ts | TimelineControl.tsx | year |
| `endYear` | param | types/index.ts:1096 | 2050 | simulation.ts → runSimulation; csvExport.ts | TimelineControl.tsx | year |
| `DEFAULT_START_YEAR` | const | constants.ts:34 | 2025 | simulation.ts; UI defaults | N/A | year |
| `DEFAULT_END_YEAR` | const | constants.ts:37 | 2050 | simulation.ts; UI defaults | N/A | year |
| `currentYear` | store state | simulationStore.ts | config.startYear | setCurrentYear, setStartYear, setEndYear | TimelineControl scrubber | year |
| `isPlaying` | store state | simulationStore.ts | false | togglePlay, stopPlay | TimelineControl play button | boolean |
| Per-year loop step order (1-11) | architecture | simulation.ts:429-2402 | N/A | runSimulation orchestrator | N/A | sequence |

**Loop order:** capabilities → BFCS → adoption triggers → adoption rates → displacement → new jobs → aggregate emp/wages → macro → AI GDP → policy effects → store outputs.

**Per-year state carried across iterations** (simulation.ts:437-473):
- `previousMacro` (MacroOutput | null)
- `previousFundSize` ($B, from sovereignWealthFund.initialFundSize)
- `previousMoneySupply` ($, from BASELINE_MONEY_SUPPLY)
- `previousTransferInflation` (decimal, init 0)
- `debtGDPHistory` (array of ratios, Phase 8a)
- `triggerYears` (Record<clusterId, Record<roleId, year>>)
- `baselines` (Map<clusterId, {employments, wages}>, from BLS data)

---

## 2. Core economic parameters

### MPC values (Marginal Propensity to Consume)

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `DEFAULT_POST_TAX_MPC_WAGE` | const | constants.ts:1927 | 0.95 | macro.ts:1337 → wageConsumption | ConsumerDemandControls "MPC Wage" | ratio (0-1) |
| `DEFAULT_POST_TAX_MPC_ASSET` | const | constants.ts:1928 | 0.42 | macro.ts:1338 → assetConsumption | ConsumerDemandControls "MPC Asset" | ratio (0-1) |
| `DEFAULT_POST_TAX_MPC_TRANSFER` | const | constants.ts:1929 | 0.95 | macro.ts:1339 → transferConsumption | ConsumerDemandControls "MPC Transfer" | ratio (0-1) |
| `postTaxMPCs.wage` | param | types/index.ts:1300 | 0.95 | macro.ts → computeConsumption | ConsumerDemandControls | ratio |
| `postTaxMPCs.asset` | param | types/index.ts:1300 | 0.42 | macro.ts → computeConsumption | ConsumerDemandControls | ratio |
| `postTaxMPCs.transfer` | param | types/index.ts:1300 | 0.95 | macro.ts → computeConsumption | ConsumerDemandControls | ratio |
| `MPC_WAGE` ⚠️ DEPRECATED | const | constants.ts:319 | 0.80 | macro.ts (legacy, no active readers) | N/A | ratio |
| `MPC_ASSET` ⚠️ DEPRECATED | const | constants.ts:329 | 0.35 | macro.ts (legacy) | N/A | ratio |
| `MPC_TRANSFER` ⚠️ DEPRECATED | const | constants.ts:339 | 0.90 | macro.ts (legacy) | N/A | ratio |
| `DEFAULT_HOUSING_WEALTH_MPC` | const | constants.ts:1732 | 0.05 | macro.ts:923 → computeHousingWealthEffect | HousingControls "Housing Wealth MPC" | ratio |
| `housingWealthMPC` | param | types/index.ts:1229 | 0.05 | macro.ts → computeConsumption | HousingControls | ratio |
| `mpcWageUESensitivity` | param | types/index.ts:1231 | 0.005 | macro.ts → computeWageConsumption | ConsumerDemandControls "MPC Wage UE Sensitivity" | ratio per pp UE |
| `DEFAULT_MPC_WAGE_UE_SENSITIVITY` | const | constants.ts:1752 | 0.005 | macro.ts:1815 | N/A | ratio per pp UE |
| `effectiveMpcWage` | derived | macro.ts:739 | POST_TAX_MPC_WAGE × (1 - precautionaryMpcReduction) | wageConsumption | N/A | ratio |
| `precautionaryMpcReduction` | state | macro.ts:1810-1824 | unemploymentRate × mpcWageUESensitivity | MacroOutput | N/A | ratio |

### Income share weights (national & bottom-80)

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `BASELINE_WAGE_SHARE` | const | constants.ts:280 | govData.wageShare (~0.60) | macro.ts → computeIncome | N/A | ratio |
| `BASELINE_ASSET_SHARE` | const | constants.ts:281 | govData.assetShare (~0.20) | macro.ts → computeIncome | N/A | ratio |
| `BASELINE_TRANSFER_SHARE` | const | constants.ts:282 | govData.transferShare (~0.20) | macro.ts → computeIncome | N/A | ratio |
| `BOTTOM80_WAGE_SHARE` | const | constants.ts:292 | 0.45 | macro.ts → computeConsumerWelfareIndex | ConsumerDemandControls "Wage Share (Bottom 80%)" | ratio |
| `BOTTOM80_TRANSFER_SHARE` | const | constants.ts:293 | 0.78 | macro.ts → computeConsumerWelfareIndex | ConsumerDemandControls "Transfer Share (Bottom 80%)" | ratio |
| `BOTTOM80_ASSET_SHARE` | const | constants.ts:294 | 0.12 | macro.ts → computeConsumerWelfareIndex | ConsumerDemandControls "Asset Share (Bottom 80%)" | ratio |
| `BOTTOM80_POP_SHARE` | const | constants.ts:295 | 0.80 | macro.ts → computeConsumerWelfareIndex | N/A | ratio |
| `bottom80WageShare` | param | types/index.ts:1289 | 0.45 (BOTTOM80_WAGE_SHARE) | macro.ts → CWI | ConsumerDemandControls | ratio |
| `bottom80TransferShare` | param | types/index.ts:1291 | 0.78 | macro.ts → CWI | ConsumerDemandControls | ratio |
| `bottom80AssetShare` | param | types/index.ts:1293 | 0.12 | macro.ts → CWI | ConsumerDemandControls | ratio |
| `NON_CORPORATE_ASSET_SHARE` | const | constants.ts:490 | IIFE from govData (~0.40) | macro.ts → computeNonCorpAssetIncome | N/A | ratio |
| `EQUITY_CONCENTRATION_TOP10` | const | constants.ts:1244 | 0.88 | equity.ts (wealth concentration; not actively read) | N/A | ratio |

### Baseline income & GDP constants

| Variable | Type | Defined in | Default | Read by | Unit |
|---|---|---|---|---|---|
| `BASELINE_NATIONAL_INCOME` | const | constants.ts:466 | BASELINE_GDP_NOMINAL_2025 | macro.ts → computeIncome | dollars |
| `BASELINE_WAGE_INCOME` | const | constants.ts:474 | BASELINE_WAGE_SHARE × BASELINE_NATIONAL_INCOME | macro.ts → income composition | dollars |
| `BASELINE_ASSET_INCOME` | const | constants.ts:481 | BASELINE_ASSET_SHARE × BASELINE_NATIONAL_INCOME | macro.ts → asset income | dollars |
| `BASELINE_TRANSFER_INCOME` | const | constants.ts:505 | BASELINE_TRANSFER_SHARE × BASELINE_NATIONAL_INCOME | macro.ts → income composition | dollars |
| `BASELINE_GDP_NOMINAL_2025` | const | constants.ts:380 | govData.gdpNominal (~$29T) | many — macro.ts, fiscal.ts, equity.ts | dollars |
| `BASELINE_GDP_REAL_2025` | const | constants.ts:386 | 23,000,000,000,000 | monetary.ts (Fisher); macro.ts (potential GDP) | dollars (2017 chained) |
| `BASELINE_GDP_GROWTH_RATE` | const | constants.ts:370 | 0.02 | macro.ts → computeGDP; defaults | percent (0-1) |
| `BASELINE_AVERAGE_ANNUAL_WAGE` | const | constants.ts:441 | round(govData.avgHourlyEarnings × hours × 52) | policy.ts; wage comparisons | dollars/year |
| `BASELINE_TRANSFER_PER_UNEMPLOYED` | const (DEPRECATED) | constants.ts | 19,200 — RETIRED from the loop (100%-recipiency UI-only figure) | none (historical reference) | dollars/year |
| `DEFAULT_CASH_TRANSFER_PER_UNEMPLOYED` | const | constants.ts | 8,000 — UI ($430/wk × 28% stock recipiency, DOL ETA) + SNAP ($345/mo × 40%, USDA FNS) | macro.ts income block → transfer income; budget via incrementalTransferSpending | dollars/year |
| `DEFAULT_IN_KIND_TRANSFER_PER_UNEMPLOYED` | const | constants.ts | 5,000 — Medicaid (KFF FY2021 per-enrollee × 0.75 enrollment elasticity) + ACA APTC | macro.ts → consumption directly (NIPA PCE); budget via incrementalTransferSpending | dollars/year |
| `CURRENT_LAW_UI_REPLACEMENT_RATE` / `_DURATION_WEEKS` | const | constants.ts | 0.45 / 26 (DOL) | policy.ts enhanced-UI netting anchor ($0 increment at current-law settings) | fraction / weeks |
| `BASELINE_PRICE_LEVEL` | const | constants.ts:459 | 1.0 | macro.ts; monetary.ts | index |
| `BASELINE_GOVT_TRANSFERS` | const | constants.ts:1862 | 4,500,000,000,000 | macro.ts (baseline) | dollars |
| `BASELINE_DEBT_INTEREST` ⚠️ DEPRECATED | const | constants.ts:1869 | 1,050,000,000,000 | fiscal.ts (legacy) | dollars |

### Population & labor force

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `US_POPULATION_2025` | const | constants.ts:47 | 340,000,000 | macro.ts; policy.ts | N/A | persons |
| `US_LABOR_FORCE_2025` | const | constants.ts:54 | govData.laborForce (~168M) | macro.ts → computeWagePressure; policy.ts | N/A | persons |
| `DEFAULT_POPULATION_GROWTH_RATE` | const | constants.ts:60 | 0.004 | macro.ts → computeMacro | N/A | percent (0-1) |
| `populationGrowthRate` | param | types/index.ts:1109 | 0.004 | macro.ts → computeMacro | DemographicsControls | percent (0-1) |
| `totalPopulation` | param | types/index.ts:1106 | US_POPULATION_2025 | macro.ts → computeMacro | N/A (init only) | persons |
| `laborForce` | param | types/index.ts:1107 | US_LABOR_FORCE_2025 | macro.ts; policy.ts | N/A (init only) | persons |
| `BASELINE_TOTAL_EMPLOYMENT` | const | constants.ts:91 | govData.totalEmployment (~158M CES) | simulation.ts → initClusterData; macro.ts | N/A | persons |
| `BASELINE_CPS_EMPLOYMENT` | const | constants.ts:100 | govData.cpsEmployment (~164M CPS) | macro.ts → computeUnemployment | N/A | persons |
| `NON_CLUSTER_EMPLOYED` | const | constants.ts:110 | BASELINE_CPS - BASELINE_TOTAL | macro.ts → computeUnemployment | N/A | persons |
| `BASELINE_UNEMPLOYMENT` | const | constants.ts:513 | US_LABOR_FORCE - BASELINE_CPS_EMPLOYMENT | macro.ts; Phillips curve | N/A | persons |
| `AGE_THRESHOLD_FRACTIONS` | const | constants.ts:68-80 | Record<age, fraction> (12 entries) | policy.ts → computeUBIEligibility | N/A | ratio map |
| `participationElasticity` | param | types/index.ts:1209 | 0.15 | macro.ts → computeLaborForce | DemographicsControls | elasticity |
| `participationThreshold` | param | types/index.ts:1211 | 0.60 | macro.ts → computeLaborForce | DemographicsControls | ratio |
| `DEFAULT_PARTICIPATION_ELASTICITY` | const | constants.ts:615 | 0.15 | macro.ts | N/A | elasticity |
| `DEFAULT_PARTICIPATION_THRESHOLD` | const | constants.ts:623 | 0.60 | macro.ts | N/A | ratio |
| `dynamicPopulation` | state | macro.ts:1341-1351 | prevPopulation × (1 + populationGrowthRate) | MacroOutput | N/A | persons |
| `dynamicLaborForce` | state | macro.ts:1352-1360 | prevLaborForce × (1 + popGrowth - voluntaryWithdrawal) | MacroOutput | N/A | persons |
| `voluntaryWithdrawalRate` | state | macro.ts:1345-1351 | from UBI replacement rate elasticity | MacroOutput | N/A | ratio |
| `effectiveLaborSupply` | derived | macro.ts:1355 | dynamicLaborForce | employment model | N/A | persons |
| `laborForceParticipation` | derived | macro.ts:569 | dynamicLaborForce / dynamicPopulation | MacroOutput | N/A | ratio |

---

## 3. Capability S-curve parameters (3 vectors)

The model uses 3 consolidated AI capability vectors (Phase 8 consolidation from older 8-vector system):
- **generative** (text/image/code generation)
- **agentic** (autonomous task execution)
- **embodied** (robotics/physical world)

S-curve formula: `S_v(t) = floor + (ceiling - floor) / (1 + exp(-steepness × (t - midpointYear)))`

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `VECTOR_IDS` | const | capabilities.ts:17 | `['generative', 'agentic', 'embodied']` | getCapabilityScore, getAllCapabilityScores | N/A | enum |
| `DEFAULT_CAPABILITY_TRAJECTORIES` | const | constants.ts:153-172 | Record<vectorId, params> (3 vectors) | capabilities.ts → initCapabilities | N/A | nested object |
| `CAPABILITY_VECTOR_METADATA` | const | constants.ts:184 | name/description/color per vector | UI components, MethodologyView, CapabilityControls | N/A | enum metadata |
| **generative.floor** | param | constants.ts:156 | 0.10 | capabilities.ts → getCapabilityScore | CapabilityControls "Generative → Floor" | score (0-1) |
| **generative.ceiling** | param | constants.ts:157 | 0.95 | capabilities.ts → getCapabilityScore | CapabilityControls "Generative → Ceiling" | score (0-1) |
| **generative.steepness** | param | constants.ts:158 | 0.6 | capabilities.ts → getCapabilityScore | CapabilityControls "Generative → Steepness" | dimensionless |
| **generative.midpointYear** | param | constants.ts:159 | 2033 | capabilities.ts → getCapabilityScore | CapabilityControls "Generative → Midpoint Year" | year |
| **agentic.floor** | param | constants.ts:161 | 0.05 | capabilities.ts → getCapabilityScore | CapabilityControls "Agentic → Floor" | score (0-1) |
| **agentic.ceiling** | param | constants.ts:162 | 0.90 | capabilities.ts → getCapabilityScore | CapabilityControls "Agentic → Ceiling" | score (0-1) |
| **agentic.steepness** | param | constants.ts:163 | 0.5 | capabilities.ts → getCapabilityScore | CapabilityControls "Agentic → Steepness" | dimensionless |
| **agentic.midpointYear** | param | constants.ts:164 | 2038 | capabilities.ts → getCapabilityScore | CapabilityControls "Agentic → Midpoint Year" | year |
| **embodied.floor** | param | constants.ts:167 | 0.02 | capabilities.ts → getCapabilityScore | CapabilityControls "Embodied → Floor" | score (0-1) |
| **embodied.ceiling** | param | constants.ts:168 | 0.85 | capabilities.ts → getCapabilityScore | CapabilityControls "Embodied → Ceiling" | score (0-1) |
| **embodied.steepness** | param | constants.ts:169 | 0.5 | capabilities.ts → getCapabilityScore | CapabilityControls "Embodied → Steepness" | dimensionless |
| **embodied.midpointYear** | param | constants.ts:171 | 2043 | capabilities.ts → getCapabilityScore | CapabilityControls "Embodied → Midpoint Year" | year |
| `capabilities` (nested config) | param | types/index.ts (SimulationConfig) | DEFAULT_CAPABILITY_TRAJECTORIES | capabilities.ts (per-vector iteration) | CapabilityControls (12 sliders total) | nested map |
| `capabilityDelays` (per-vector) | param (optional) | SimulationConfig | undefined | getAllCapabilityScores (delay subtracted from year) | N/A — advanced only | year offset |
| `capabilityScores` (per year) | state | simulation.ts year loop | getAllCapabilityScores(year, config.capabilities) | computeBFCSScores, computeAutomationCoverage, macro.ts, newJobs.ts | N/A (display only) | score per vector |
| `weightedCapability` | derived | displacement.ts | sum(weights × scores) per cluster.capabilityRelevance | computeRoleDisplacement | N/A | score (0-1) |
| `automationCoverage A(t)` | derived | newJobs.ts:160 | mean of 3 vectors (or employment-weighted from clusters) | computeNewJobMetrics, macro.ts revenue pressure | Dashboard "Automation Coverage" | ratio (0-1) |

---

## 4. BFCS thresholds and scoring constants

Better/Faster/Cheaper/Safer dimensions. Each role has 4 thresholds; each year computes 4 scores. Adoption triggers when all 4 scores ≥ thresholds.

### Per-dimension scoring constants

| Variable | Type | Defined in | Default | Read by | Unit |
|---|---|---|---|---|---|
| `BFCS_DIMENSION_COLORS` | const | constants.ts:1575-1580 | `{better:'#3B82F6', faster:'#06B6D4', cheaper:'#10B981', safer:'#F59E0B'}` | UI components, charts | enum map |
| `BFCS_DIMENSION_LABELS` | const | constants.ts:1583-1588 | `{better:'Better (B*)', faster:'Faster (F*)', ...}` | UI components, charts | enum map |
| `BASELINE_INFERENCE_SPEED` | const | constants.ts:1432 | 0.7 | bfcs.ts → computeFasterScore | ratio (0-1) |
| `INFERENCE_SPEED_IMPROVEMENT_RATE` | const | constants.ts:1438 | 0.3 | bfcs.ts → computeFasterScore | rate/year |
| `TASK_PARALLELISM` (4 deployment types) | const | constants.ts:1444-1449 | software:0.9, robotics:0.5, autonomous_vehicle:0.6, hybrid:0.7 | bfcs.ts → computeFasterScore | multiplier map |
| `BASELINE_SAFETY_RECORD` | const | constants.ts:1456 | 0.6 | bfcs.ts → computeSaferScore | ratio (0-1) |
| `SAFETY_IMPROVEMENT_RATE` | const | constants.ts:1462 | 0.1 (audit found 0.5 in one place — verify) | bfcs.ts → computeSaferScore | rate/year |
| `DOMAIN_RISK_FACTORS` (14 sectors) | const | constants.ts:1469-1493 | Healthcare:0.60, Finance:0.80, Tech:0.85, Transport:0.65, Manufacturing:0.45, Construction:0.50, Retail:0.60, Food:0.75, Creative:0.70, Professional:0.65, Government:0.80, Agriculture:0.55, Science:0.75, Education:0.70, Other:0.70 | bfcs.ts → computeSaferScore (keyed by cluster.category) | multiplier map |
| `DEFAULT_INFERENCE_ANNUAL_CHANGE` ⚠️ DEPRECATED (Phase 10.A) | const | constants.ts:1960–1961 | -0.45 | replaced by `DEFAULT_INFERENCE_COST_CURVE` (floored decay) | annual rate |
| `DEFAULT_INFERENCE_COST_CURVE` | const | constants.ts:2517–2521 | `{floor:0.001, decayRate:0.50, decayExponent:0.7}` | bfcs.ts (Cheaper-score); macro.ts (sector deflation) — formula: `cost_ratio = floor + (1−floor) × exp(−k × t^exp)` | bundled |
| `InferenceCostCurveParams` | type | types/index.ts:245–248 (`AICostParams.inferenceCostCurve`) | DEFAULT_INFERENCE_COST_CURVE | bfcs.ts; macro.ts | InferenceCostCurveControls | nested |
| `DEFAULT_MANUFACTURING_ANNUAL_CHANGE` | const | constants.ts:1936 | -0.10 | bfcs.ts → computeCheaperScore | annual rate |
| `DEFAULT_ENERGY_ANNUAL_CHANGE` | const | constants.ts:1937 | -0.03 | bfcs.ts → computeCheaperScore | annual rate |
| `AI_COST_COMPOSITION` ⚠️ DEPRECATED | const | constants.ts:1942-1947 | per-deployment cost composition (4 entries) | bfcs.ts → computeCheaperScore | fraction map |
| `DEPLOYMENT_COST_COMPOSITION` | const | constants.ts:2169-2174 | Replacement for AI_COST_COMPOSITION (Phase 9) | supplyChain.ts; macro.ts | nested map |

### Per-role thresholds (defined in occupationClusters.ts per role)

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `Role.bfcsThresholds.better` (B*) | param (per role) | occupationClusters.ts (per cluster, per role) | varies (e.g., tech_swe junior: 0.6, senior: 0.8) | bfcs.ts → checkThresholdsMet (~165 roles × 4) | BFCSEditor → BFCSRoleEditor | threshold (0-1) |
| `Role.bfcsThresholds.faster` (F*) | param | occupationClusters.ts | varies (junior: 0.7, senior: 0.8) | bfcs.ts | BFCSEditor | threshold |
| `Role.bfcsThresholds.cheaper` (C*) | param | occupationClusters.ts | varies (junior: 0.5, senior: 0.6) | bfcs.ts | BFCSEditor | threshold |
| `Role.bfcsThresholds.safer` (S*) | param | occupationClusters.ts | varies (junior: 0.7, senior: 0.85) | bfcs.ts | BFCSEditor | threshold |
| `bfcsOverrides` | param (sparse map) | types/index.ts:1119 | `{}` | bfcs.ts → checkAdoptionTrigger; useBFCSScores hook | BFCSEditor sliders | nested map |

### BFCS scores (computed per role per year)

| Variable | Type | Defined in | Formula | Read by | Unit |
|---|---|---|---|---|---|
| `betterScore` | derived | bfcs.ts:50 | `sum(weight_i × score_i) × qualityMultiplier`; qualityMultiplier = `2.0 - (aiReplacementDifficulty × 1.5)` | checkAdoptionTrigger | score (0-1) |
| `fasterScore` | derived | bfcs.ts:98 | `min(1.0, BASELINE + RATE × yrs × 0.1) × TASK_PARALLELISM[deploy]` | checkAdoptionTrigger | score (0-1) |
| `cheaperScore` | derived | bfcs.ts:131 | `1 - (aiCostFraction / humanCostFactor)`; aiCost decays exp by deployment | checkAdoptionTrigger | score (0-1) |
| `saferScore` | derived | bfcs.ts:176 | `safetyRecord × domainRiskFactor`; safetyRecord = `1 - (1-BASELINE) × exp(-rate × yrs)` | checkAdoptionTrigger | score (0-1) |
| `triggerYear` (per role) | state | bfcs.ts:287 (findTriggerYear) | scanned start..end; null if never met | adoption.ts; simulation.ts role loop | year or null |

---

## 5. Adoption dynamics

Adoption begins after BFCS triggers fire, then follows an S-curve: `rate(t) = ceiling / (1 + exp(-steepness × (t - triggerYear - lag)))`. Modified by geopolitical risk, competitive pressure, and revenue pressure.

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `DEFAULT_ADOPTION_STEEPNESS` (4 deployment types) | const | constants.ts:217-222 | software:3.0, robotics:0.75, autonomous_vehicle:0.8, hybrid:1.5 | adoption.ts → computeBaseAdoptionRate | steepness map |
| `DEFAULT_COMPETITIVE_PRESSURE_MULTIPLIER` | const | constants.ts:229 | 2.0 | adoption.ts → applyCompetitivePressure | multiplier |
| `DEFAULT_COMPETITIVE_PRESSURE_THRESHOLD` | const | constants.ts:235 | 0.2 | adoption.ts → applyCompetitivePressure | rate threshold |
| `DEFAULT_GEOPOLITICAL_RISK_FACTOR` | const | constants.ts:241 | 0.1 | adoption.ts → applyGeopoliticalRisk | risk factor |
| `DEFAULT_ADOPTION_PARAMS` | const | constants.ts:246 | bundled object of above 4 | simulation.ts → initAdoptionParams | nested |
| `adoptionParams.steepnessByDeployment` | param | types | DEFAULT_ADOPTION_STEEPNESS | adoption.ts | N/A (advanced) | multiplier map |
| `adoptionParams.competitivePressureMultiplier` | param | types | 2.0 | adoption.ts | N/A | multiplier |
| `adoptionParams.competitivePressureThreshold` | param | types | 0.2 | adoption.ts | N/A | ratio |
| `adoptionParams.geopoliticalRiskFactor` | param | types | 0.1 | adoption.ts | N/A | ratio |
| Per-cluster `adoptionLag` | param | occupationClusters.ts (per cluster) | 1-3 years | adoption.ts | N/A (cluster def) | years |
| Per-cluster `adoptionSteepness` | param | occupationClusters.ts | varies (1.5 default) | adoption.ts | N/A | steepness |
| Per-cluster `adoptionCeiling` | param | occupationClusters.ts | 1.0 default | adoption.ts | N/A | ratio |
| Per-cluster `geopoliticalRiskExposure` | param | occupationClusters.ts | varies (0.0-0.5) | adoption.ts | N/A | exposure |
| `baseAdoptionRate` | state | adoption.ts:53 | `ceiling / (1 + exp(-steepness × (year - triggerYear - lag)))` | getAdoptionRate; simulation.ts | rate (0-1) |
| `geopoliticalAdjustedSteepness` | derived | adoption.ts:158 | `baseSteepness × (1 - riskFactor × exposure)` | computeBaseAdoptionRate | steepness |
| `afterCompetitivePressure` | state | adoption.ts:185 | `baseRate × (1 + max(0, baseRate - threshold) × multiplier)` | getAdoptionRate | rate (0-1) |
| `automationAcceleration` | state | macro.ts (revenue pressure feedback) | varies, default 0 | adoption.ts → applyRevenuePressure | feedback multiplier |
| `finalAdoptionRate` | derived | adoption.ts:198 | `min(ceiling, afterCompetitive × (1 + automationAcceleration))` | simulation.ts; macro.ts | rate (0-1) |
| `creditAdoptionSensitivity` | param | types/index.ts:1233 | 0.15 | adoption.ts | (no direct UI; advanced) | ratio |
| `DEFAULT_CREDIT_ADOPTION_SENSITIVITY` | const | constants.ts:1759 | 0.15 | adoption.ts | N/A | ratio |
| `wageAutomationSensitivity` | param | types/index.ts:1191 | 0.50 | adoption.ts → computeWageAutomationFeedback | MonetaryPricesControls | ratio |
| `DEFAULT_WAGE_AUTOMATION_SENSITIVITY` | const | constants.ts:643 | 0.50 | adoption.ts | N/A | ratio |
| `revenuePressureSensitivity` | param | types/index.ts:1133 | 1.5 | adoption.ts → computeRevenuePressure | FeedbackControls | multiplier |
| `revenuePressureCap` | param | types/index.ts:1134 | 0.3 | adoption.ts | FeedbackControls | ratio |
| `revenuePressureDecay` | param | types/index.ts:1135 | 0.5 | adoption.ts | FeedbackControls | ratio |
| `REVENUE_PRESSURE_SENSITIVITY_DEFAULT` | const | constants.ts:397 | 1.5 | adoption.ts | N/A | multiplier |
| `REVENUE_PRESSURE_CAP` | const | constants.ts:404 | 0.3 | adoption.ts | N/A | ratio |
| `REVENUE_PRESSURE_DECAY` | const | constants.ts:411 | 0.5 | adoption.ts | N/A | ratio |
| `aiWageProductivityMultiplier` | param | types/index.ts:1136 | 0.5 | macro.ts → computeWageIncome (Phillips hump) | FeedbackControls | multiplier |
| `AI_WAGE_PRODUCTIVITY_MULTIPLIER` | const | constants.ts:420 | 0.5 | macro.ts | N/A | multiplier |

### Phase 10.A — α 5-Driver Decomposition (alphaDrivers.ts)

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `alphaDriverParams` | param | types/index.ts:1565 | `DEFAULT_ALPHA_DRIVER_PARAMS` | simulation.ts → computeEffectiveAlpha | AlphaControls (8 sliders) | nested object |
| `DEFAULT_ALPHA_DRIVER_PARAMS` | const | constants.ts:2500 | `{capability:0.45, trust:0.20, competitive:0.15, margin:0.10, slack:0.10, capabilityActivationThreshold:0.55, trustHalfLifeYears:7}` | alphaDrivers.ts | N/A | bundled |
| `alphaDriverParams.capabilityWeight` | param | types | 0.45 | alphaDrivers.ts → capability driver sigmoid | AlphaControls "Capability Weight" | weight |
| `alphaDriverParams.trustWeight` | param | types | 0.20 | alphaDrivers.ts → trust ramp | AlphaControls "Trust Weight" | weight |
| `alphaDriverParams.competitiveWeight` | param | types | 0.15 | alphaDrivers.ts → peer-α term | AlphaControls "Competitive Weight" | weight |
| `alphaDriverParams.marginWeight` | param | types | 0.10 | alphaDrivers.ts → margin compression | AlphaControls "Margin Weight" | weight |
| `alphaDriverParams.slackWeight` | param | types | 0.10 | alphaDrivers.ts → labor-slack subtraction | AlphaControls "Slack Weight" | weight |
| `alphaDriverParams.capabilityActivationThreshold` | param | types | 0.55 | alphaDrivers.ts → sigmoid centre | AlphaControls | ratio |
| `alphaDriverParams.trustHalfLifeYears` | param | types | 7 | alphaDrivers.ts → trust ramp half-life | AlphaControls | years |
| `ALPHA_BASELINE_CORPORATE_MARGIN` | const | constants.ts:2534 | 0.12 | alphaDrivers.ts → margin driver anchor | N/A | ratio |
| `DEFAULT_COGNITIVE_ALPHA` | const | constants.ts:2463 | 0.5 | simulation.ts (per-cluster fallback) | N/A | ratio |
| `clusterAutomationShareOverrides` | param | types/index.ts (Record<clusterId, number>) | `{}` | simulation.ts → bypass 5-driver model for cluster | AlphaControls per-cluster row | ratio (0-1) |
| `roleAlphas[role.id]` | state | simulation.ts:1063 | `computeEffectiveAlpha(…).alpha` | computeClusterDisplacement (V2 formula) | N/A | ratio (0-1) |
| `peerAlpha` (read t-1, write t) | state | alphaDrivers.ts:`computePeerAlpha` | employment-weighted across competing clusters | competitive driver | N/A | ratio (0-1) |
| `nextAlphaByRole[cluster][role]` | state | simulation.ts:1064 | role's current α | written each year, read as t-1 by next year | N/A | ratio (0-1) |

### Phase 10.A — Augmentation Adoption (augmentationAdoption.ts)

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `augmentationAdoptionSteepness` | param | types/index.ts:1567 | `DEFAULT_AUGMENTATION_ADOPTION_STEEPNESS` | augmentationAdoption.ts → logistic S-curve | AugmentationAndScarcityControls | steepness |
| `DEFAULT_AUGMENTATION_ADOPTION_STEEPNESS` | const | constants.ts:2526 | 0.8 | augmentationAdoption.ts | N/A | steepness |
| `augmentationMultiplier` | param | types/index.ts:1169 | `DEFAULT_AUGMENTATION_MULTIPLIER` | simulation.ts:1255 → per-worker boost | DemandModelControls "Augmentation Multiplier" | multiplier |
| `DEFAULT_AUGMENTATION_MULTIPLIER` | const | constants.ts:1337 | 2.0 | simulation.ts (recalibrated from 0.20 in commit 537e4ee) | N/A | multiplier |
| `AUG_VIABILITY_THRESHOLD` (implicit constant) | const | augmentationAdoption.ts | 0.1 | viability trigger `better × cheaper > 0.1` | N/A | score product |
| `augTriggerYears[cluster][role]` | state | simulation.ts:1242, 1246 | null until triggered | augmentationAdoption.ts | N/A | year |
| `augResult.augAdoptionRate` | derived | augmentationAdoption.ts | `1 / (1 + exp(−steepness × yearsSinceTrigger))` | simulation.ts:1265 (attached to BFCS output as `scores.augAdoptionRate`) | N/A | ratio (0-1) |
| `clusterAugmentationOutput` | state | simulation.ts:1257 | `Σ remaining × wage × (better × cheaper × augMultiplier)` | totalAugmentationOutput | N/A | dollars |
| `augmentationByCluster` | state | simulation.ts:1269 | Map<clusterId, output> | macro.ts (GDP augmentation channel) | N/A | dollars |
| `augmentedHeadcountByCluster` | state | simulation.ts:1274 | Map<clusterId, [0,1] fraction> | macro.ts (sector-deflation pipeline; Phase 10.A fix #1) | N/A | ratio (0-1) |

---

## 6. Displacement model

Phase 10.A V2 formula: `displacementPct = adoptionRate × weightedCapability × α(o, r, t)` (α from 5-driver model — see §5 subsection above). Phase 8 quadratic `weightedCapability²` deprecated.

| Variable | Type | Defined in | Default/Formula | Read by | Unit |
|---|---|---|---|---|---|
| `displacementPct` (per role) | state | displacement.ts (computeDisplacementV2) | **Phase 10.A V2**: `clamp(adoptionRate × weightedCapability × α, 0, 1)` (α from `roleAlphas[role.id]`). Deprecated quadratic `weightedCapability²` retained in `computeSimplifiedDisplacement` as fallback. | computeRoleDisplacement; simulation.ts:1154 | fraction (0-1) |
| `effectiveAlpha` (per cluster output) | derived | simulation.ts post cluster-loop | employment-weighted mean of role-level α | ClusterDisplacementResult.effectiveAlpha; peer-α reads | ratio (0-1) |
| `scarcityPremiumContribution` (per cluster) | derived | macro.ts:367–385 → computeClusterScarcityPremium | cluster's contribution to aggregate scarcity premium | ClusterDisplacementResult.scarcityPremiumContribution | premium |
| `aggregateReplacementDifficultyWagePremium` (per cluster) | derived | displacement.ts:176–228 (aggregation) | employment-weighted mean of role-level `aiReplacementDifficultyWagePremium` | ClusterDisplacementResult.aggregateReplacementDifficultyWagePremium; macro Phillips | premium |
| `priorYearWageAdjustmentByCluster` | state | simulation.ts (post cluster loop) | last year's per-cluster wage premium aggregate, fed into next year's BFCS Cheaper-score | bfcs.ts → checkAdoptionTrigger | premium |
| `aiReplacementDifficultyWagePremium` (per role) | param | occupationClusters.ts role def | varies 0.0–0.3 | macro.ts scarcity premium aggregation | premium |
| `headcountMultiplier` | derived | displacement.ts:109 | `1 - displacementPct` | computeRoleDisplacement | multiplier |
| `wageElasticity` (per cluster) | param | occupationClusters.ts (per cluster) | varies 0.3-0.9 | displacement.ts:112 → computeWageMultiplier | elasticity |
| `wageMultiplier` | derived | displacement.ts:113 | `1 - (displacementPct × wageElasticity)` | computeRoleDisplacement; macro.ts | multiplier |
| `remainingEmployment` | derived | displacement.ts:116 | `baselineEmployment × headcountMultiplier` | simulation.ts; macro.ts | persons |
| `remainingWage` | derived | displacement.ts:120 | `baselineWage × wageMultiplier` | simulation.ts; macro.ts | dollars/year |
| `totalDirectDisplacement` (per cluster) | derived | displacement.ts:179 | `Σ (baselineEmpl - remainingEmpl)` per role | computeClusterDisplacement; simulation.ts | persons |
| `secondOrderDisplacement` | derived | displacement.ts:185 | `min(directDispl × (multiplier - 1), totalRemainingEmployment)` | computeClusterDisplacement | persons |
| `totalDisplacement` (per cluster) | derived | displacement.ts:200 | `directDispl + secondOrderDispl` | simulation.ts; macro.ts (job loss) | persons |
| `averageWage` (cluster-level) | derived | displacement.ts:190 | `Σ(wageWeighted) / totalRemainingEmpl` | simulation.ts | dollars/year |
| `EMPLOYMENT_MULTIPLIERS` (per cluster) | const | constants.ts:1343-1421 | Record<clusterId, number> (~44 entries; e.g., tech_swe:4.3, mfg:1.5) | displacement.ts:184; macro.ts; simulation.ts initClusterData | multiplier map |
| `SIMPLE_AVG_EMPLOYMENT_MULTIPLIER` | const | constants.ts:1420 | arithmetic mean of clusters (~2.08) | simulation.ts (fallback for other_uncategorized) | multiplier |
| `otherUncategorizedMultiplierOverride` | param | types/index.ts:1173 | undefined (auto) | simulation.ts → initClusterData | MultiplierControls | multiplier |
| `DISPLACEMENT_TO_UNEMPLOYMENT_FACTOR` | const | constants.ts:2007 | 0.7 | macro.ts → computeUnemployment | ratio |
| `DEFAULT_WAGE_ELASTICITY` ⚠️ ORPHAN | const | constants.ts:269 | (value) | no readers in src/ | elasticity |
| `productivityToHeadcountRatio` ⚠️ DEPRECATED | per-cluster optional field | OccupationCluster type | varies | not read in displacement.ts | ratio |
| `taskAutomatableFraction` ⚠️ DEPRECATED | per-cluster optional field | OccupationCluster type | varies | not read | ratio map |

---

## 7. New job creation

Formula: `J_new(t) = innovationRate × GDP × rdMultiplier`; `durable = J_new × (1 - A(t))^persistenceFactor`

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `DEFAULT_INNOVATION_RATE` | const | constants.ts:1266 | 1.5e-8 | newJobs.ts → computeNewJobCreation | NewJobsControls (shown as 0.1×-10× multiplier) | jobs per $ GDP |
| `DEFAULT_RD_MULTIPLIER` | const | constants.ts:1272 | 1.5 | newJobs.ts | NewJobsControls "R&D Multiplier" | multiplier |
| `DEFAULT_JOB_PERSISTENCE_FACTOR` | const | constants.ts:1279 | 1.5 | newJobs.ts → computeDurableNewJobs | NewJobsControls "Job Persistence Factor" | exponent |
| `innovationRate` | param | types/index.ts:1112 | DEFAULT_INNOVATION_RATE | newJobs.ts → computeNewJobMetrics | NewJobsControls | jobs per $ GDP |
| `rdMultiplier` | param | types/index.ts:1113 | 1.5 | newJobs.ts | NewJobsControls | multiplier |
| `jobPersistenceFactor` | param | types/index.ts:1114 | 1.5 | newJobs.ts | NewJobsControls | exponent |
| `newJobCreationRate` (J_new) | state | newJobs.ts:177 | `innovationRate × GDP × rdMultiplier` | computeNewJobMetrics; simulation.ts | persons |
| `survivability` | derived | newJobs.ts:63 | `(1 - automationCoverage)^persistenceFactor` | computeDurableNewJobs | fraction (0-1) |
| `durableNewJobs` | derived | newJobs.ts:178 | `J_new × survivability` | simulation.ts | persons |
| `displacedJobs` (input) | input | newJobs.ts:165 | from displacement totals | computeNewJobMetrics | persons |
| `netJobCreation` | derived | newJobs.ts:179 | `durableNewJobs - displacedJobs` | dashboard, simulation.ts | persons (can be neg) |
| `requiredInnovationRate` | derived | newJobs.ts:132 | `displacedJobs / (GDP × rdMult × surv)` | dashboard | jobs per $ GDP |
| `AI_PRODUCTIVITY_MULTIPLIER_BY_DEPLOYMENT` | const | constants.ts:1290-1295 | software:5.0, robotics:2.5, autonomous_vehicle:2.5, hybrid:2.0 | macro.ts → computeAIProduction | multiplier map |
| `DEFAULT_AI_PRODUCTION_INVESTMENT_FRACTION` | const | constants.ts:1301 | 0.30 | macro.ts → AI investment boost | InvestmentCorporateControls | ratio |
| `DEFAULT_AI_PRODUCTION_ONSHORING_FRACTION` | const | constants.ts:1307 | 0.10 | macro.ts → AI net export boost | InvestmentCorporateControls | ratio |
| `DEFAULT_NEW_JOB_WAGE_FRACTION` | const | constants.ts:1313 | 0.70 | macro.ts → newJobWageIncome | InvestmentCorporateControls | ratio |
| `aiProductionInvestmentFraction` | param | types/index.ts:1166 | 0.30 | macro.ts | InvestmentCorporateControls | ratio |
| `aiProductionOnshoringFraction` | param | types/index.ts:1167 | 0.10 | macro.ts | InvestmentCorporateControls | ratio |
| `newJobWageFraction` | param | types/index.ts:1168 | 0.70 | macro.ts | InvestmentCorporateControls | ratio |

---

## 8. Employment / occupation cluster data

**File:** `src/data/occupationClusters.ts` (2476 lines, 51 clusters, ~165 roles)

### OccupationCluster type fields

| Field | Type | Unit | Notes |
|---|---|---|---|
| `id` | string | enum | e.g., 'tech_swe', 'health_physicians' |
| `name` | string | label | display name |
| `category` | string | enum | broad industry (used by DOMAIN_RISK_FACTORS) |
| `socCodes` | string[] | SOC codes | for BLS OEWS data mapping |
| `roles[]` | RoleDefinition[] | array | per-seniority breakdown (3-5 per cluster) |
| `capabilityRelevance.weights` | Record<vectorId, number> | fractions sum to 1 | e.g., `{generative:0.50, agentic:0.45, embodied:0.05}` |
| `deploymentType` | enum | category | software / robotics / autonomous_vehicle / hybrid |
| `employmentMultiplier` | number | multiplier | from EMPLOYMENT_MULTIPLIERS or fallback |
| `adoptionLag` | number | years | typically 1-3 |
| `geopoliticalRiskExposure` | number | fraction (0-1) | most 0; transport_trucking 0.5 |
| `notes` | string | text | special handling notes |
| `protectedByPolicy` | boolean | flag | exempt from displacement |
| `policyDisplacementTarget` | boolean | flag | policy can target this cluster |
| `adoptionSteepness` | number | steepness | per-cluster S-curve override |
| `adoptionCeiling` | number | fraction | max adoption (default 1.0) |
| `consumerDemandShare` | number | fraction | jobs from PCE |
| `govDemandShare` | number | fraction | jobs from G |
| `wageElasticity` | number | elasticity | wage depression sensitivity |
| `productivityToHeadcountRatio` ⚠️ DEPRECATED | number? | ratio | unused |
| `taskAutomatableFraction` ⚠️ DEPRECATED | Record<string, number>? | fractions | unused |

### RoleDefinition type fields

| Field | Type | Unit | Example (tech_swe junior_mid) |
|---|---|---|---|
| `id` | string | enum | 'junior_mid' |
| `label` | string | label | 'Junior/Mid Developer' |
| `seniorityLevel` | number | fraction (0-1) | 0.7 |
| `aiReplacementDifficulty` | number | fraction (0-1) | 0.7 |
| `employmentShareEstimate` | number | fraction | 0.45 |
| `bfcsThresholds.better` | number | threshold | 0.6 |
| `bfcsThresholds.faster` | number | threshold | 0.7 |
| `bfcsThresholds.cheaper` | number | threshold | 0.5 |
| `bfcsThresholds.safer` | number | threshold | 0.7 |

### SOC mapping & role estimation

| Variable | Type | Defined in | Default | Read by | Unit |
|---|---|---|---|---|---|
| `OEWS_TO_CANONICAL_CLUSTER_ID` | const | socMapping.ts:17 | 14-entry map | dataTransform.ts; resolveCanonicalClusterId | mapping |
| `CANONICAL_TO_OEWS_CLUSTER_ID` | const (derived) | socMapping.ts:38 | reverse of above | dataLoader.ts; resolveOEWSKey | mapping |
| `CLUSTERS_WITHOUT_BLS_DATA` | const | socMapping.ts:49 | `['gov_federal', 'gov_state_local', 'other_uncategorized']` | resolveOEWSKey | array |
| `DEFAULT_ROLE_ESTIMATION_CONFIG` | const | roleEstimation.ts:44 | `{useClusterRoleShares:true, wageScalingMethod:'seniority_scaled', skewFactorScale:1.0}` | dataTransform.ts; simulationStore.ts | nested |
| `RoleEstimationConfig.useClusterRoleShares` | param | SimulationConfig | true | dataTransform.ts | N/A | boolean |
| `RoleEstimationConfig.wageScalingMethod` | param | SimulationConfig | 'seniority_scaled' | dataTransform.ts | N/A | enum |
| `RoleEstimationConfig.skewFactorScale` | param | SimulationConfig | 1.0 | dataTransform.ts | N/A | multiplier |

### Sector deflation & CPI weights

| Variable | Type | Defined in | Default | Read by | Unit |
|---|---|---|---|---|---|
| `SECTOR_DEFLATION_INTENSITY` | const | constants.ts:526-594 | Record<clusterId, number> (50+ entries) | macro.ts → computeDeflation | ratio map |
| `SECTOR_CPI_WEIGHTS` | const | constants.ts:603 | buildSectorCPIWeights(govData.cpiSectorWeights) | macro.ts → sectorWeightedDeflation | ratio map |
| `deflationIntensityOverrides` | param | types/index.ts:1151 | `{}` (falls back to constant) | macro.ts → computeDeflation | N/A | enum map |
| `clusterOverrides` | param | types/index.ts:1176 | `{}` | adoption.ts; per-cluster customization | N/A (advanced) | nested map |


---

## 9. Macro: GDP, consumption, capacity

| Variable | Type | Defined in | Default/Formula | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `wageIncome` (aggregate) | state | macro.ts:1630-1651 | `prevNominalGDP × wageShare × wagePressure × (1 + structProd)` | MacroOutput | N/A | dollars |
| `assetIncome` (aggregate) | state | macro.ts:1730-1774 | dividends + capital gains (endogenous) | MacroOutput | N/A | dollars |
| `transferIncome` (aggregate) | state | macro.ts:1599-1615 | `BASELINE_TRANSFER × cumulativeInflationFactor + policy additions` | MacroOutput | N/A | dollars |
| `wageConsumption` | derived | macro.ts:1876 | `afterTaxWageIncome × postTaxMpcWage` | consumption | N/A | dollars |
| `assetConsumption` | derived | macro.ts:1877 | `afterTaxAssetIncome × postTaxMpcAsset` | consumption | N/A | dollars |
| `transferConsumption` | derived | macro.ts:1878 | `afterTaxTransferIncome × postTaxMpcTransfer` | consumption | N/A | dollars |
| `consumption` | state | macro.ts:2037 | sum + housingWealthDrag, weighted by credit multiplier | gdpNominal | N/A | dollars |
| `investment` | state | macro.ts:2038 | traditional + AI, gated by capacity & credit | gdpNominal | N/A | dollars |
| `gdpNominal` | state | macro.ts:2041 | C + I + G + NX | many | N/A | dollars |
| `gdpReal` | state | macro.ts:2042 | gdpNominal / priceLevel | many | N/A | dollars (2025) |
| `governmentSpending` | state | macro.ts:2035 | obligation G + revenue-sensitive G | MacroOutput | N/A | dollars |
| `potentialGDP` | state | macro.ts:2049 | gdpReal + aiConsumerGoodsPotential | capacityUtilization | N/A | dollars |
| `capacityUtilization` | derived | macro.ts:2051 | `min(1.0, gdpReal / potentialGDP)` | MacroOutput | N/A | ratio |
| `gdpGrowthRate` | derived | macro.ts:2101 | `(gdpNom - prev) / prev` | MacroOutput | N/A | percent |
| `realGDPGrowthRate` | derived | macro.ts | `(gdpReal - prev) / prev` (full-composite deflated; reporting/legacy) | reporting | N/A | percent |
| `nonAIRealGDPGrowthRate` | derived | macro.ts | growth of `nominalGDP / nonAIPriceLevel` (prices excl. ALL AI supply deflation) — **the revenue-pressure firewall input** (AI-supply deflation excluded so the loop reads real contraction, not deflation) | revenue pressure | N/A | percent |
| `BASELINE_CONSUMPTION_2025` | const | constants.ts:978 | derived from GDP shares (~0.65 × GDP) | macro.ts (year-0 ref) | N/A | dollars |
| `BASELINE_GOVT_SPENDING_2025` | const | constants.ts:980 | BASELINE_GDP × GOVERNMENT_SPENDING_GDP_FRACTION | macro.ts (baseline) | N/A | dollars |
| `BASELINE_INVESTMENT_2025` | const | constants.ts:981 | BASELINE_GDP × TRADITIONAL_INVESTMENT_GDP_FRACTION | macro.ts (baseline) | N/A | dollars |
| `TRADITIONAL_INVESTMENT_GDP_FRACTION` | const | constants.ts:952 | govData.investmentRatio (~0.175) | macro.ts | InvestmentCorporateControls | ratio |
| `traditionalInvestmentGDPFraction` | param | types/index.ts:1261 | 0.175 | macro.ts | InvestmentCorporateControls | ratio |
| `GOVERNMENT_SPENDING_GDP_FRACTION` | const | constants.ts:962 | govData.governmentRatio (~0.18) | macro.ts | N/A | ratio |
| `NET_EXPORTS_GDP_FRACTION` | const | constants.ts:969 | govData.netExportRatio (~-0.03) | macro.ts | N/A | ratio |
| `G_OBLIGATION_SHARE` | const | constants.ts:1005 | 0.80 | macro.ts → computeGovSpending | N/A | ratio |
| `G_REVENUE_SENSITIVE_SHARE` | const | constants.ts:1006 | 0.20 | macro.ts → computeGovSpending | N/A | ratio |
| `DISCRETIONARY_SHARE_OF_G` | const | constants.ts:1988 | 0.55 | macro.ts → computeGovSpending | N/A | ratio |
| `AI_INVESTMENT_GROWTH_RATE` | const | constants.ts:945 | 0.15 | macro.ts → computeAIInvestment | N/A | ratio |
| `aiInvestmentBoost` | derived | computeAIProductionExpansion | `totalAdditionalOutput × investFrac` | macro.ts I component | N/A | dollars |
| `aiNetExportBoost` | derived | computeAIProductionExpansion | `totalAdditionalOutput × onshoreFrac` | macro.ts NX component | N/A | dollars |
| `aiConsumerGoodsPotential` | derived | computeAIProductionExpansion | `totalAdditionalOutput × consumerFrac` | tracked (not in C) | N/A | dollars |
| `aiUtilizationSensitivity` | param | types/index.ts:1249 | 50 | macro.ts → computeAIInvestmentGate | InvestmentCorporateControls | index 0-100 |
| `consumerDemandInvestmentSensitivity` | param | types/index.ts:1252 | 50 | macro.ts | InvestmentCorporateControls | index |
| `creditInvestmentResponseSensitivity` | param | types/index.ts:1255 | 50 | macro.ts | InvestmentCorporateControls | index |
| `traditionalInvestmentDemandSensitivity` | param | types/index.ts:1258 | 30 | macro.ts | InvestmentCorporateControls | index |
| `CAPACITY_GATE_SENSITIVITY` | const | constants.ts:1960 | 0.5 | macro.ts → computeAIInvestmentGate | N/A | exponent |
| `BASELINE_RETAINED_EARNINGS` | const | constants.ts:1967 | IIFE: profit × (1-tax) × retention | macro.ts (baseline) | N/A | dollars |
| `BASELINE_CREDIT_FUNDED` | const | constants.ts:1973 | BASELINE_INVESTMENT - BASELINE_RETAINED_EARNINGS | macro.ts (baseline) | N/A | dollars |
| `realConsumerDemandRatio` | derived | macro.ts | `consumerDemand / priceLevel` | SimulationYearOutput | N/A | ratio |
| `realGovDemandRatio` | derived | macro.ts | `govDemand / priceLevel` | SimulationYearOutput | N/A | ratio |
| `realBusinessDemandRatio` | derived | macro.ts | `investmentDemand / priceLevel` | SimulationYearOutput | N/A | ratio |
| `demandFeedbackSensitivity` | param | types/index.ts:1127 | 1.5 | macro.ts → computeProfitBoost | ConsumerDemandControls | multiplier |
| `DEMAND_FEEDBACK_SENSITIVITY` | const | constants.ts:1605 | 1.5 | macro.ts | N/A | exponent |
| `demandSpilloverTolerance` | param | types/index.ts:1197 | 0.03 | macro.ts → computeLabor | N/A | ratio |
| `deferrableConsumptionShare` | param | types/index.ts:1155 | 0.30 | macro.ts → computeDeflationVelocityDrag | ConsumerDemandControls | ratio |
| `DEFERRABLE_CONSUMPTION_SHARE` | const | constants.ts:802 | 0.30 | macro.ts | N/A | ratio |
| `deflationMidpoint` | param | types/index.ts:1157 | 0.05 | macro.ts → deflationDrag | ConsumerDemandControls | ratio |
| `DEFLATION_MIDPOINT` | const | constants.ts:808 | 0.05 | macro.ts | N/A | ratio |
| `deflationSteepness` | param | types/index.ts:1159 | 40 | macro.ts → deflationDrag | ConsumerDemandControls | dimensionless |
| `DEFLATION_STEEPNESS` | const | constants.ts:814 | 40 | macro.ts | N/A | dimensionless |
| `deflationDrag` | state | macro.ts:1583-1591 | S-curve from netInflation | velocityMultiplier; consumption | N/A | ratio |
| `velocityMultiplier` | derived | macro.ts:1583 | from deflationDrag, in [0.70, 1.0] | MacroOutput | N/A | multiplier |

---

## 10. Macro: prices, inflation, CPI, CWI computation

The model splits inflation into shelter and goods, then weighted-blends. Inflation has 7 components: base + AI deflation + transfer-monetization + demand + min-wage cost-push + credit deflation + scarcity inflation.

| Variable | Type | Defined in | Default/Formula | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `BASE_INFLATION_RATE` | const | constants.ts:304 | govData.baseInflationRate (~0.025) | monetary.ts; macro.ts:1524 | N/A | percent |
| `baseInflationRate` | param | types/index.ts:1102 | 0.025 | monetary.ts → computeMonetaryState | MonetaryPricesControls "Base Inflation Rate" | percent |
| `priceLevel` | state | macro.ts:1578 | `prevPriceLevel × (1 + compositeInflation)` | many — GDP deflation, CWI | N/A | index (1.0=base) |
| `BASELINE_PRICE_LEVEL` | const | constants.ts:459 | 1.0 | macro.ts year-0 | N/A | index |
| `MAX_PRICE_LEVEL` | const | constants.ts:669 | 1e15 | monetary.ts (safety cap) | N/A | index cap |
| `MONETARY_COLLAPSE_THRESHOLD_FRACTION` | const | constants.ts:677 | 0.99 | monetary.ts → flagMonetaryCollapse | N/A | ratio |
| `compositeInflation` | state | macro.ts | `Σ_sector weight_s × sectorInflation_s` over 4 consumption sectors (shelter/AI-exposed/labor-services/food-energy), normalized | priceLevel update | N/A | percent |
| `nonAICompositeInflation` | state | macro.ts | composite + Σ_s (sector AI-supply deflation contribution) = composite as if AI deflated nothing — **the firewall counterpart** | nonAIPriceLevel | N/A | percent |
| `nonAIPriceLevel` | state | macro.ts | compounds from `nonAICompositeInflation` (excl. all cognitive+embodied AI deflation) | nonAIRealGDP, Stage-2 firewall | N/A | index (1.0=base) |
| `aiExposedInflation` / `laborServicesInflation` / `foodEnergyInflation` | state | macro.ts | per-sector inflation: base + broad pressures − sector AI deflation × sector passthrough (sector-routed consumption shares) | compositeInflation | N/A | percent |
| `shelterInflation` | state | macro.ts | BASELINE_SHELTER − shelterEmbodiedDeflation + mortgage + foreclosure + rental | compositeInflation | N/A | percent |
| `goodsInflation` | state | macro.ts | = aiExposedInflation (back-compat alias) | reporting | N/A | percent |
| `netInflation` | state | macro.ts:1502-1521 | `base - aiDefl + transferInfl + demand + minWageCostPush + creditDefl + scarcityInfl` | goodsInflation | N/A | percent (can be neg) |
| `aiDeflationRate` | state | macro.ts:1477 | `computeSectorWeightedDeflation(clusters, year)` | netInflation | N/A | percent |
| `sectorWeightedDeflationRate` | state | macro.ts:189-242 | `Σ(clusterAutoCoverage × deflationIntensity × costSavings × cpiWeight)` | aiDeflationRate | N/A | percent |
| `creditDeflationContribution` | state | macro.ts:1457 | `-creditTightening × creditDeflationSensitivity` | netInflation | N/A | percent |
| `creditDeflationSensitivity` | param | types/index.ts:1201 | 0.04 | monetary.ts → computePriceLevel | CreditFinancialControls | ratio |
| `DEFAULT_CREDIT_DEFLATION_SENSITIVITY` | const | constants.ts:651 | 0.04 | monetary.ts | N/A | ratio |
| `scarcityInflation` | state | macro.ts:1470 | `Σ(laborScarcity × clusterWeight × scarcityPassThrough)` | netInflation | N/A | percent |
| `scarcityPassThrough` | param | types/index.ts:1205 | 0.30 | macro.ts → computeWageInflation | MonetaryPricesControls | ratio |
| `DEFAULT_SCARCITY_PASS_THROUGH` | const | constants.ts:659 | 0.30 | macro.ts | N/A | ratio |
| `minWageCostPush` | state | macro.ts:1438 | `Σ(minWageExcess × clusterWeights × wagePassThrough)` | netInflation | N/A | percent |
| `wagePassThrough` | param | types/index.ts:1189 | 0.40 | macro.ts → computeMinWageInflation | MonetaryPricesControls | ratio |
| `DEFAULT_WAGE_PASS_THROUGH` | const | constants.ts:635 | 0.40 | macro.ts | N/A | ratio |
| `inflationRate` (legacy) | derived | macro.ts:2102 | `(gdpNom - prev) / prev` | MacroOutput (deprecated, use compositeInflation) | N/A | percent |
| `effectiveInflationRate` | derived | macro.ts:653 | `max(0, compositeInflation)` | COLA basis | N/A | percent |
| `cumulativeInflationFactor` | state | macro.ts:651 | grows by max(0, compositeInflation) annually | baselineTransferIncome scaling | N/A | index (1.0+) |
| `baselineTransferIncome` (year-scaled) | derived | macro.ts:652 | `BASELINE_TRANSFER × cumulativeInflationFactor` | transferIncome COLA | N/A | dollars |
| `inflationFromMonetization` | state | monetization.ts:296 | `(effMoney × velocity)/nomGDP - aiDefl` | macro.ts:1313 | N/A | percent |
| `transferInflation` ⚠️ DEPRECATED | state | macro.ts:1313-1321 | replaced by inflationFromMonetization | N/A | N/A | percent |
| `inflationTarget` | param | types/index.ts:1313 | 0.02 | federalReserve.ts → computeFedRate | FiscalMonetaryControls | ratio |

---

## 11. Macro: labor market, wages, unemployment

| Variable | Type | Defined in | Formula/Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `totalEmployment` | state | macro.ts:1361-1367 | `prevEmpl - displacement + newJobCreation` | MacroOutput | N/A | persons |
| `totalUnemployment` | state | macro.ts:1372 | `max(0, laborForce - totalEmployment)` | MacroOutput | N/A | persons |
| `unemploymentRate` | derived | macro.ts:1373 | `totalUnemployment / laborForce` | many — wage pressure, credit, cycle | N/A | ratio |
| `wagePressure` | derived | macro.ts | back-compatibility alias: `wageIndex / trendWageIndex` (=1.0 zero-AI, <1 when wages below trend). The (1−aiShare) gate is RETIRED. | reporting | N/A | multiplier |
| `wageIndex` | state | macro.ts | compounded per-worker nominal wage (1.0=2025) from `computeNominalWageGrowth`; floored at `policyWageFloor × trendWageIndex` (a wage-LEVEL floor, not a growth floor) | wage income | N/A | index |
| `trendWageIndex` | state | macro.ts | wage index with NO Phillips/scarcity (policy-floor + Baumol reference) | wageIndex floor, Baumol | N/A | index |
| `obligationGCOLAIndex` | state | macro.ts | compounds `max(nominalWageGrowth, compositeInflation(t−1), 0)` — wage-indexed when wages lead, CPI-protected in stagflation, flat in deflation; single-index approximation of the statute's stock-weighted blend | obligation-G, baseline transfers, incremental cash (one index, three consumers) | N/A | index |
| `scarcityPremium` | derived | macro.ts:354–363 | `aiShare × scarcityIntensity × aggregateReplacementDifficultyWagePremium` | wagePressure | N/A | premium |
| `scarcityIntensity` | param | types/index.ts (SimulationConfig) → macro.ts:344 input | `DEFAULT_SCARCITY_INTENSITY` | macro.ts computeWagePressure; displacement.ts computeClusterDisplacement | AugmentationAndScarcityControls "Scarcity Intensity" | ratio (0–1) |
| `DEFAULT_SCARCITY_INTENSITY` | const | constants.ts:2530 | 0.4 | macro.ts; simulation.ts (fallback) | N/A | ratio |
| `aiShare(t)` (wage-pressure context) | derived | macro.ts:354–363 | `aiDisplacementStock / totalDisplaced` (0 if none) | classic Phillips dampener `(1 − aiShare)` | N/A | ratio (0-1) |
| `PHILLIPS_CURVE_SENSITIVITY` | const | constants.ts:690 | 2.5 | macro.ts:297 | N/A | exponent |
| `phillipsCurveSensitivity` | param | types/index.ts:1141 | 2.5 | macro.ts | FeedbackControls "Wage-UE Sensitivity" | exponent |
| `NATURAL_UNEMPLOYMENT_RATE` | const | constants.ts:698 | `BASELINE_UNEMPLOYMENT / US_LABOR_FORCE_2025` (~0.044) | macro.ts | N/A | ratio |
| `FRED_NAIRU_RATE` | const | constants.ts:706 | govData.fredNairuRate (~0.044) | UI display only | N/A | ratio |
| `automationCoverage` | state | macro.ts:255-270 | `computeAutomationCoverageFromClusters(clusters, baseline)` | wage premium, deflation | N/A | ratio (0-1) |
| `nominalWageGrowth` | state | macro.ts (computeNominalWageGrowth) | the endogenous wage equation: `indexation×composite(t−1) + passthrough×perWorkerProd − phillipsSlope×excessUE + Δscarcity`, ×(1−rigidity) if <0 | wageIndex, Baumol, obligation-G | N/A | percent |
| `TRANSFER_GROWTH_PER_UE_POINT` | const (DEPRECATED) | constants.ts | 65e9 — RETIRED: CBO first-year-flow estimate that fed ONLY the reporting deficit (~3× the consistent per-person value); both deficits now derive from CASH+IN-KIND × headcount | none (historical reference) | N/A | dollars per pp UE |
| `incrementalTransferSpending` | state | macro.ts income block | `incrementalUnemployment × (cashPerUnemployed + inKindPerUnemployed)` | computeFiscalPressure (reporting, t); computeGovernmentSpending (load-bearing budget, t+1) | MacroOutput | N/A | dollars |
| `stabilizerTransfers` | state | fiscal.ts computeGovernmentSpending | = prev-year `incrementalTransferSpending` (extended Gate C: residual ≡ 0) | totalGovernmentSpending → totalDeficit → debt/yields/monetization | FiscalState | N/A | dollars |
| `laborServicesPriceLevel` | state | macro.ts | cumulative labor-services sector index, compounds `laborServicesInflation + monetaryInflation` (the uniform monetary term added back at sector level) | in-kind support deflator | MacroOutput | N/A | index |
| `housingStock` / `households` / `headshipRate` | state | macro.ts computeHousingBlock | stock-flow housing demography (Census HVS/TTLHH init) | occupancy → rents | MacroOutput | N/A | units / households / ratio |
| `rentIndex` | state | computeHousingBlock | ΔR = costAnchor×Δrepl + occElast×occGap — shelter CPI = its growth | composite → priceLevel → wage/COLA indexation | MacroOutput | N/A | index |
| `constructionCostIndex` / `landCostIndex` | state | computeHousingBlock | ΔCC = laborShare×wage + materials − FULL secDefl.shelter; ΔL = income×β + scarcity×gap + investorLandBid (R24: one-sided) | replacement cost → starts, rents | MacroOutput | N/A | index |
| `housingStarts` / `occupancyRate` | state | computeHousingBlock | starts = base × max(0, 1+Saiz×gap), capacity-capped; occ = HH/H (natural 0.897) | stock evolution; rent/land occupancy terms | MacroOutput | N/A | units/yr, ratio |
| `homePriceIndex` (re-derived) | state | computeHousingBlock | ΔP = ΔR − Δcap/cap + fireSale (1.75, Mian-Sufi-Trebbi) | wealth effect (base × P), credit collateral, affordability diagnostic | MacroOutput | N/A | index |
| (retired) `computeHomePriceChange` 5-channel + additive shelter stack | — | macro.ts (deprecated comments) | replaced by computeHousingBlock (decision record: docs/FABLE_AUDIT_SUMMARY.md) | — | — | — |
| `corporateProfits` (re-derived) | state | macro.ts | **RESIDUAL IDENTITY: GDP − wageBill − nonCorpIncome − otherCostsShare×GDP** — signed, no cap (the min(raw, GDP−wageBill) is deleted); margins are OUTPUTS | dividends/tax/retained (t−1), equity market, α margin driver, profit coverage, investor bid via asset share | MacroOutput | N/A | dollars |
| `rentSharingContribution` | internal | macro.ts computeNominalWageGrowth | `rentSharingElasticity × (profitShare(t−1) − driftingBaseline)` — two-sided | nominal wage growth | N/A | N/A | fraction/yr |
| (retired) `cumulativeProductivityFactor` | — | macro.ts (commented out) | ZERO consumers post-Stage-7 (wages→S3 wageIndex; transfers→S5b COLA; nonCorp→S7 wageIndex) | — | — | — |
| (retired) `automationDividend`/`augmentationProfitBoost` additive profit terms + `DEFAULT_AI_PROFIT_MARGIN`/`DEFAULT_TRADITIONAL_PROFIT_MARGIN` (0.11 → validation reference) | — | macro.ts | the residual captures un-passed AI cost savings automatically (double-counts removed) | — | — | — |
| `effectiveObligationCOLA` | internal | macro.ts | `obligationGCOLAIndex` with the COLA-dampening lever applied | baselineTransfers, incremental cash indexation; mirrored to `fiscal.effectiveCOLAFactor` | N/A | N/A | index |
| `DEPRESSION_CONSECUTIVE_DECLINE_QUARTERS` | const | constants.ts:426 | 4 | macro.ts → flagDepression | N/A | quarters |
| `DEPRESSION_UNEMPLOYMENT_THRESHOLD` | const | constants.ts:432 | 0.15 | macro.ts → flagDepression | N/A | ratio |
| `is_depression` | derived | macro.ts | boolean from depression test | MacroOutput | N/A | boolean |
| `consecutive_decline_quarters` | state | macro.ts | counter | depression test | N/A | quarters |
| `cyclePhase` | derived | macro.ts:2180-2201 | enum from CWI acceleration: STABLE/DECLINE/RECOVERY/MONETARY_COLLAPSE | MacroOutput; sim halt | N/A | category |

---

## 12. Macro: profits, capital share, asset income

| Variable | Type | Defined in | Default/Formula | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `BASELINE_CORPORATE_PROFITS` | const | constants.ts:1088 | govData.corporateProfitsAfterTax (~$3T) | macro.ts; equity.ts | N/A | dollars |
| `DEFAULT_AI_PROFIT_MARGIN` | const | constants.ts:831 | 0.25 | macro.ts:1690 → aiCorporateProfits | InvestmentCorporateControls "AI Profit Margin" | ratio |
| `DEFAULT_TRADITIONAL_PROFIT_MARGIN` | const | constants.ts:835 | 0.11 | macro.ts:1698 → tradCorporateProfits | InvestmentCorporateControls "Traditional Profit Margin" | ratio |
| `aiProfitMargin` | param | types/index.ts:1179 | 0.25 | macro.ts | InvestmentCorporateControls | ratio |
| `traditionalProfitMargin` | param | types/index.ts:1180 | 0.11 | macro.ts | InvestmentCorporateControls | ratio |
| `corporateProfits` | state | macro.ts:1705-1730 | aiCorpProfits + traditionalCorpProfits | MacroOutput; equity.ts | N/A | dollars |
| `aiCorporateProfits` | state | macro.ts:1690 | `aiGDP × aiProfitMargin` | MacroOutput | N/A | dollars |
| `traditionalCorporateProfits` | state | macro.ts:1698 | `traditionalGDP × tradProfitMargin` | MacroOutput | N/A | dollars |
| `profitGDPRatio` | derived | macro.ts:2229 | `corporateProfits / gdpNominal` | MacroOutput | N/A | ratio |
| `BASELINE_PROFIT_GDP_RATIO` | const | constants.ts:1895 | govData.baselineProfitGDPRatio (~0.11) | profit baseline | N/A | ratio |
| `dividendIncome` | state | macro.ts:1732 | `afterTaxCorpProfits × (1 - retentionRate)` | assetIncome | N/A | dollars |
| `aiCapitalGains` | state | macro.ts:1740 | `growth × dynamicPE × realizationRate` | MacroOutput | N/A | dollars |
| `traditionalCapitalGains` | state | macro.ts:1755 | same formula for traditional | MacroOutput | N/A | dollars |
| `capitalGainsRealizationRate` | state | macro.ts:1765 | `BASE_REALIZATION × stress × volatility` clamped [0.04, 0.12] | capital gains | N/A | ratio |
| `BASE_REALIZATION_RATE` | const | constants.ts:885 | 0.07 | macro.ts | N/A | ratio |
| `REALIZATION_SENSITIVITY` | const | constants.ts:893 | 1.0 | macro.ts | N/A | multiplier |
| `MIN_REALIZATION_RATE` | const | constants.ts:896 | 0.04 | macro.ts (clamp) | N/A | ratio |
| `MAX_REALIZATION_RATE` | const | constants.ts:899 | 0.12 | macro.ts (clamp) | N/A | ratio |
| `afterTaxCorporateProfits` | state | macro.ts:1723 | `corporateProfits × (1 - effCorpTaxRate)` | retainedEarnings | N/A | dollars |
| `retainedEarnings` | state | macro.ts:1733 | `afterTaxCorpProfits × retentionRate` | investmentCapacity | N/A | dollars |
| `BASELINE_CORPORATE_RETENTION_RATE` | const | constants.ts:1894 | govData.corporateRetentionRate (~0.40) | macro.ts | N/A | ratio |
| `corporateRetentionRate` | param | types/index.ts:1304 | 0.40 | macro.ts → computeCorporateIncome | InvestmentCorporateControls | ratio |
| `CORPORATE_PAYOUT_RATIO` | const | constants.ts:1234 | IIFE: `1 - corporateRetentionRate` | equity.ts → computeDividends | N/A | ratio |
| `profitCoverageRatio` | derived | macro.ts | `prevAfterTaxProfits / (baselineProfits × laggedNominalGDP/baseGDP)` (GDP-proportional baseline) | businessCreditConditions | N/A | ratio |
| `nonCorporateAssetIncome` | state | macro.ts:1719 | `NON_CORPORATE_ASSET_SHARE × totalAssetIncome` | assetIncome composition | N/A | dollars |
| `aiSectorPE` | derived | macro.ts:687 | dynamic P/E for AI sector | MacroOutput | N/A | multiple |
| `traditionalSectorPE` | derived | macro.ts:688 | dynamic P/E for trad sector | MacroOutput | N/A | multiple |
| `aiProfitGrowthRate` | param | types/index.ts:1306 | 2.0 | macro.ts → computeAIProfit | InvestmentCorporateControls | multiplier |
| `DEFAULT_AI_PROFIT_GROWTH_RATE` | const | constants.ts:1953 | 2.0 | macro.ts | N/A | multiplier |


---

## 13. Consumer Welfare Index (CWI) components

CWI replaces the older ARPP (Aggregate Real Purchasing Power) metric. **CWI = totalPostTaxIncome / (population × priceLevel)**

| Variable | Type | Defined in | Formula | Read by | Unit |
|---|---|---|---|---|---|
| `consumerWelfareIndex` (CWI) | derived | macro.ts:2128-2170 | `totalIncome / (population × priceLevel)` | MacroOutput; cyclePhase detection | $/person (real, 2025) |
| `cwiGrowthRate` | derived | macro.ts:599 | `(CWI - prevCWI) / prevCWI` | MacroOutput | percent YoY |
| `cwiAcceleration` | derived | macro.ts:600 | `cwiGrowthRate - prevCwiGrowthRate` | cyclePhase classifier | percent (can be neg) |
| `medianCWI` | state | macro.ts:2150-2170 | `(bottom80Income / BOTTOM80_POP_SHARE) / (pop × priceLevel)` | MacroOutput; inequality | $/person |
| `medianCWIGrowthRate` | derived | macro.ts:605 | `(medianCWI - prevMedianCWI) / prevMedianCWI` | MacroOutput | percent YoY |
| `totalIncome` | derived | macro.ts:579 | wageIncome + assetIncome + transferIncome | CWI | dollars |
| `incomeComposition` | derived | macro.ts:580 | `{wageShare, assetShare, transferShare}` summing to 1 | distribution tracking | ratios |

**CWI components are not exported separately**; they are computed from post-tax income, population (dynamic), and price level (composite shelter+goods inflation). Bottom-80 share parameters drive medianCWI computation.

**Shelter vs goods split:**

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `BASELINE_SHELTER_CPI_WEIGHT` | const | constants.ts:1684 | 0.36 | macro.ts:1568 → composite blending | HousingControls "Shelter CPI Weight" (default 0.35) | ratio |
| `shelterCPIWeight` | param | types/index.ts:1219 | 0.36 | macro.ts → computeDeflation | HousingControls | ratio |
| `BASELINE_SHELTER_INFLATION` | const | constants.ts:1698 | 0.035 | macro.ts:1561 (baseline) | N/A | percent |
| `DEFAULT_SHELTER_INFLATION_STICKINESS` | const | constants.ts:1692 | 0.80 | macro.ts:1541 → AI deflation scaling | N/A | ratio |
| `shelterInflationStickiness` | param | types/index.ts:1221 | 0.80 (audit found 0.70 in UI) | macro.ts | HousingControls "Shelter Stickiness" | ratio |
| `shelterInflationFloor` | param | types/index.ts:1244 | -0.05 | macro.ts → computeShelterInflation | HousingControls "Shelter Inflation Floor" | percent |
| `shelterDeflationFromAI` | state | macro.ts:1541 | `-(embodiedCap × stickiness × 0.10)` | shelterInflation | N/A | percent (≤0) |

---

## 14. Housing & shelter

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `BASELINE_HOUSING_WEALTH` | const | constants.ts:1738 | 45e12 | macro.ts (wealth) | N/A | dollars |
| `BASELINE_HOMEOWNERSHIP` | const | constants.ts:1744 | 0.642 | credit.ts (baseline) | N/A | ratio |
| `DEFAULT_HOUSING_WEALTH_MPC` | const | constants.ts:1732 | 0.05 | macro.ts:923 | HousingControls "Housing Wealth MPC" | ratio |
| `housingWealthMPC` | param | types/index.ts:1229 | 0.05 | macro.ts → computeConsumption | HousingControls | ratio |
| `DEFAULT_MORTGAGE_STRESS_AMPLIFIER` | const | constants.ts:1707 | 0.40 | credit.ts → computeConsumerCredit | N/A | multiplier |
| `mortgageStressAmplifier` | param | types/index.ts:1223 | 0.40 | credit.ts | HousingControls "Mortgage Stress Amplifier" | multiplier |
| `DEFAULT_FORECLOSURE_LAG` | const | constants.ts:1714 | 0.75 | credit.ts → computeForeclosures | N/A | years |
| `foreclosureLag` | param | types/index.ts:1225 | 0.75 (UI 1.5) | credit.ts | HousingControls "Foreclosure Lag" | years |
| `DEFAULT_HOMEOWNERSHIP_RECOVERY_RATE` | const | constants.ts:1722 | 0.02 | credit.ts → computeHomeownership | N/A | rate |
| `homeownershipRecoveryRate` | param | types/index.ts:1227 | 0.02 | credit.ts | HousingControls "Ownership Recovery" | rate |
| `institutionalBuyerRate` | param | types/index.ts:1238 | 0.40 | credit.ts → computeForeclosureMarket | HousingControls "Institutional Buyer Rate" | ratio |
| `rentalDemandSensitivity` | param | types/index.ts:1241 | 0.50 | macro.ts → shelterInflation | HousingControls "Rental Demand Sensitivity" | elasticity |
| `MORTGAGE_EXPOSURE_QUINTILES` | const | constants.ts:1847 | 5-element quintile array | credit.ts → computeForeclosures | N/A | array |
| `affordabilityPriceSensitivity` | param | types/index.ts:1388 | 4.0 | housing.ts → computeHousingPrice | (housing model controls) | elasticity |
| `incomeHousingElasticity` | param | types/index.ts:1391 | 0.5 | housing.ts | (housing model) | elasticity |
| `affordabilityReversionSensitivity` | param | types/index.ts:1394 | 0.15 | housing.ts | (housing model) | rate |
| `downwardStickinessRatio` | param | types/index.ts:1397 | 0.5 | housing.ts | (housing model) | ratio |
| `demographicHousingElasticity` | param | types/index.ts:1400 | 1.0 | housing.ts | (housing model) | elasticity |
| `DEFAULT_AFFORDABILITY_PRICE_SENSITIVITY` | const | constants.ts:725 | 4.0 | housing.ts | N/A | elasticity |
| `DEFAULT_INCOME_HOUSING_ELASTICITY` | const | constants.ts:733 | 0.5 | housing.ts | N/A | elasticity |
| `DEFAULT_AFFORDABILITY_REVERSION_SENSITIVITY` | const | constants.ts:741 | 0.15 | housing.ts | N/A | rate |
| `DEFAULT_DOWNWARD_STICKINESS_RATIO` | const | constants.ts:750 | 0.5 | housing.ts | N/A | ratio |
| `DEFAULT_DEMOGRAPHIC_HOUSING_ELASTICITY` | const | constants.ts:758 | 1.0 | housing.ts | N/A | elasticity |

**Housing CSV columns (Phase 5i, 25 columns):** goods_inflation, shelter_inflation, composite_inflation, shelter_deflation_from_ai, foreclosure_supply_effect, rental_demand_pressure, institutional_absorption, mortgage_stress_index, foreclosure_rate_aggregate, homeownership_q1..q5, avg_homeownership, home_price_change_rate, home_price_index, affordability_deviation, real_income_growth_rate, mortgage_rate_change, nominal_wage_growth, housing_wealth_drag, effective_mpc_wage, precautionary_mpc_reduction, credit_adoption_acceleration

---

## 15. Monetary: money supply, velocity, Fisher

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `BASELINE_MONEY_SUPPLY` | const | constants.ts:1139 | 21e12 ($21T M2) | monetary.ts (baseline) | N/A | dollars |
| `BASELINE_VELOCITY_OF_MONEY` | const | constants.ts:1146 | govData.m2Velocity (~1.40) | monetary.ts → computeMoneyVelocity | N/A | ratio (PY/M) |
| `velocityOfMoney` | state | monetary.ts:60 | computeDynamicVelocity() | MonetaryState | MonetaryControls | ratio |
| `DEFAULT_VELOCITY_SENSITIVITY` | const | constants.ts:1153 | 0.03 | monetary.ts:42 | N/A | ratio per pp UE |
| `velocitySensitivity` | param | types/index.ts:1163 | 0.03 | monetary.ts | MonetaryPricesControls "Velocity Sensitivity" | ratio |
| `VELOCITY_FLOOR_RATIO` | const | constants.ts:1160 | 0.5 | monetary.ts | N/A | ratio |
| `dynamicVelocity` | state | monetary.ts:60 | `baseline × max(floor, UE × demand)` | MonetaryState | N/A | ratio |
| `moneySupply` | state | monetary.ts:129 | `prev + deltaM` (capped) | MonetaryState; inflation | N/A | dollars (M2) |
| `deltaM` | state | monetary.ts:125 | `totalTransfers × moneyCreationShare` | moneySupply | N/A | dollars |
| `moneyCreationShare` | state | monetary.ts | default 0.5 (mixed) or endogenous | MonetaryState | (Phase 5g, deprecated by Phase 7) | ratio |
| `maxNeutralTransfers` | state | monetary.ts:135 | `(aiDeflation × realGDP) / velocity` | MonetaryState | N/A | dollars |
| `actualInflationFromTransfers` | state | monetary.ts:142 | Fisher: `(deltaM × V) / Y - aiDefl` | MonetaryState | N/A | percent |
| `isWithinNeutralZone` | derived | monetary.ts:146 | `totalTransfers ≤ maxNeutralTransfers` | MonetaryState | N/A | boolean |
| `FISCAL_MONETARY_SAFETY_CAP` | const | constants.ts:1170 | MAX_PRICE_LEVEL × BASELINE_GDP | monetary.ts (safety) | N/A | dollars |

---

## 16. Monetization (Phase 7-8: Cases 1-6)

Phase 8 fix: `computeMonetizationRate` now evaluates ALL cases and returns the maximum (was sequential if/return).

| Variable | Type | Defined in | Default/Formula | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `monetizationRate` | state | monetization.ts:83-202 | max(case1..case6) | MonetizationState; deficit money creation | N/A | ratio (0-1) |
| `qeMonetizationRate` | param | types/index.ts:1331 | 0.40 | monetization.ts (Cases 1,2,3,5 base) | FiscalMonetaryControls (via fed preset) | ratio |
| `effectiveLowerBound` | param | types/index.ts:1315 | -0.005 | monetization.ts:102 → Case 1 | FiscalMonetaryControls "Effective Lower Bound" | rate |
| `policyRate` (from Fed) | state | federalReserve.ts:177-221 | computeFiscalDominance() | monetization.ts:84 (ZLB check) | (via Fed preset) | rate |
| **Case 1** ZLB | regime | monetization.ts:101-104 | fires when `policyRate ≤ ELB` | monetization.ts:103 | N/A | flag |
| **Case 2** Financial Repression | regime | monetization.ts:106-117 | fires when `debtServiceRatio > 0.50` | monetization.ts:115 | N/A | flag |
| `debtServiceRatio` | state (fiscal) | macro.ts/fiscal | `interestExp / totalGovRev` | monetization.ts:113; Case 2 | N/A | ratio |
| `maxFinancialRepressionRate` | param | types | 1.0 | monetization.ts:91, 115 | N/A (advanced) | ratio |
| **Case 3** Fiscal Dominance | regime | monetization.ts:119-124 | fires when fiscalDominanceActive && taylorPrescribed > 0 | monetization.ts:122 | N/A | flag |
| `fiscalDominanceActive` | state | federalReserve.ts:199 | `debtServiceRatio > fiscalDominanceThreshold` | monetization.ts:86 | (via fed UI) | boolean |
| `taylorPrescribed` | state | federalReserve.ts:102-127 | Taylor rule output | monetization.ts:87 | N/A | rate |
| `rateGap` | state | monetization.ts:121 | `taylorPrescribed - actualPolicyRate` | Case 3 intensity | N/A | rate diff |
| **Case 5** Yield-Responsive | regime | monetization.ts:131-138 | fires when `prevTenYearYield > 0.08` | monetization.ts:136 | N/A | flag |
| `yieldResponseActive` | derived | monetization.ts:131 | boolean | MonetizationState | N/A | boolean |
| `yieldResponseMonetization` | state | monetization.ts:136 | `qe + stress × (maxYieldRate - qe)` | max-of-all | N/A | ratio |
| `yieldResponseThreshold` | param | constants/types | 0.08 | monetization.ts:133 | N/A | rate |
| `maxYieldResponseRate` | param | constants/types | 0.70 | monetization.ts:94, 136, 177 | N/A | ratio |
| `prevTenYearYield` | state (lagged) | bondMarket.ts | year t-1 yield | monetization.ts:133, 171 | N/A | rate |
| **Case 6** LOLR | regime | monetization.ts:140-179 | fires when `prevTenYearYield > 0.12` | monetization.ts:177 | N/A | flag |
| `lolrActive` | derived | monetization.ts:169 | boolean | MonetizationState | N/A | boolean |
| `lolrMonetization` | state | monetization.ts:177 | `maxYield + crisis × (LOLR_MAX - maxYield)` | max-of-all | N/A | ratio |
| `LOLR_YIELD_THRESHOLD` | const | monetization.ts:165 | 0.12 | monetization.ts:171 | N/A | rate |
| `LOLR_YIELD_CEILING` | const | monetization.ts:166 | 0.25 | monetization.ts:174 | N/A | rate |
| `LOLR_MAX_MONETIZATION` | const | monetization.ts:167 | 0.95 | monetization.ts:177 | N/A | ratio |
| `moneyCreated` | state | monetization.ts:254 | `effectiveDeficit × monetizationRate` | money supply growth | N/A | dollars |
| `bondFinancedDeficit` | state | monetization.ts:265 | `effectiveDeficit × (1 - monetizationRate)` | bondMarket supply pressure | N/A | dollars |
| `transmissionEfficiency` | state | monetization.ts:289 | `rawTransmission × sensitivity` | inflationFromMonetization | N/A | ratio |
| `TRANSFER_TRANSMISSION` | const | monetization.ts:280 | 0.85 | transmission blending | N/A | ratio |
| `DISCRETIONARY_TRANSMISSION` | const | monetization.ts:281 | 0.70 | transmission blending | N/A | ratio |
| `INTEREST_TRANSMISSION` | const | monetization.ts:282 | 0.20 | transmission blending | N/A | ratio |
| `monetizationTransmissionSensitivity` | param | types/index.ts:1356 | 1.0 | monetization.ts:243 | N/A | multiplier |
| `MONETIZATION_TAPER_RATE` | const | monetization.ts:192 | 0.25 | monetization.ts:195 → taperFloor | N/A | rate/year |
| `prevMonetizationRate` | state | monetization.ts:95 | year t-1 rate | taper floor | N/A | ratio |
| `taperApplied` | derived | monetization.ts:197 | boolean | MonetizationState | N/A | boolean |

---

## 17. Equity market

| Variable | Type | Defined in | Default/Formula | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `BASELINE_SP500_LEVEL` | const | constants.ts:1102 | govData.sp500Level (~5800) | equityMarket.ts:192 (baseline P/E) | N/A | index |
| `EQUITY_RISK_PREMIUM` | const | constants.ts:1218 | 0.045 | equityMarket.ts:120 (discount rate) | N/A | rate |
| `equityDiscountRate` | state | equityMarket.ts:129 | `tenYearYield + EQUITY_RISK_PREMIUM` | basePE denominator | N/A | rate |
| `expectedGrowth` | state | equityMarket.ts:132-141 | 2-yr avg profit growth | basePE denominator | N/A | percent |
| `basePE` | state | equityMarket.ts:147 | `(1 + g) / max(1e-6, r - g)` | peRatio | N/A | multiple |
| `aiPEMultiplier` | param | types/index.ts:1329 | 1.0 | equityMarket.ts:126 | FiscalMonetaryControls "AI P/E Multiplier" | multiplier |
| `growthMomentum` | state | equityMarket.ts:44-84 | capability velocity / historical max | effectivePEMultiplier | N/A | ratio |
| `effectivePEMultiplier` | state | equityMarket.ts:152 | `1 + (aiPE - 1) × momentum` | peRatio scaling | N/A | multiplier |
| `peRatio` | state | equityMarket.ts:153 | `basePE × effectivePEMultiplier` | aggregateMarketCap | N/A | multiple |
| `aggregateMarketCap` | state | equityMarket.ts:157 | `currentCorpProfits × peRatio` | EquityMarketState | N/A | dollars |
| `marketReturn` | derived | equityMarket.ts:160 | `(mcap - prevMcap) / prevMcap` | asset income (capital gains) | N/A | percent |
| `MIN_PE` | const | constants.ts:859 | 5.0 | macro.ts:1780 (safety) | N/A | multiple |
| `BASE_PE_ZERO_GROWTH` | const | constants.ts:852 | 10 | (orphan — imported but not actively used) | N/A | ratio |
| `DEFAULT_AI_PE_SENSITIVITY` | const | constants.ts:869 | 100 | macro.ts:1754 | N/A | parameter |
| `aiPESensitivity` | param | types/index.ts:1183 | 100 | equity.ts | InvestmentCorporateControls "AI P/E Sensitivity" | parameter |
| `DEFAULT_TRADITIONAL_PE_SENSITIVITY` | const | constants.ts:878 | 60 | macro.ts:1762 | N/A | parameter |
| `traditionalPESensitivity` | param | types/index.ts:1185 | 60 | equity.ts | InvestmentCorporateControls "Traditional P/E Sensitivity" | parameter |

---

## 18. Bond market

| Variable | Type | Defined in | Default/Formula | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `tenYearYield` | state | bondMarket.ts:406-457 | `max(0, expectedAvgRate + termPremium + fiscalRiskPremium + supplyPressure)` | mortgage, corporate, consumer rates | N/A | rate |
| `expectedAveragePolicyRate` | state | bondMarket.ts:227-283 | computeExpectedPolicyRates() over 10yr | tenYearYield | N/A | rate |
| `TERM_PREMIUM` | const | constants.ts:1210 | 0.005 (5bp) | bondMarket.ts:409 | N/A | rate |
| `termPremium` | param | types/index.ts:1364 | 0.003 (30bp) | federalReserve.ts → computeYield | FiscalMonetaryControls "Term Premium" | rate |
| `fiscalRiskPremium` | state | bondMarket.ts:81-144 | composite of trajectory + sustainability + level | tenYearYield | N/A | rate |
| `fiscalRiskPremiumMax` | param | types/index.ts:1323 | 0.06 | bondMarket.ts:89 | FiscalMonetaryControls "Risk Premium Max" | rate |
| `debtGDPRatio` | state | macro.ts/fiscal | `federalDebtStock / gdpNominal` | bondMarket trajectory & level | N/A | ratio |
| `prevDebtGDPRatio` | state | macro.ts/fiscal | year t-1 | bondMarket.ts:83 | N/A | ratio |
| `debtGDPChange` | derived | bondMarket.ts:103 | current - previous | trajectory sigmoid | N/A | ratio (pp) |
| `fiscalRiskTrajectoryWeight` | param | types/index.ts:1370 | 0.50 | bondMarket.ts:133 | FiscalMonetaryControls "Trajectory Weight" | weight |
| `fiscalRiskSustainabilityWeight` | param | types/index.ts:1372 | 0.35 | bondMarket.ts:133 | FiscalMonetaryControls "Sustainability Weight" | weight |
| `fiscalRiskLevelWeight` | param | types/index.ts:1374 | 0.15 | bondMarket.ts:133 | FiscalMonetaryControls "Level Weight" | weight |
| `fiscalRiskLevelMidpoint` | param | types/index.ts:1376 | 2.0 (200% debt/GDP) | bondMarket.ts:128 | FiscalMonetaryControls "Level Midpoint" | ratio |
| `fiscalRiskTrajectoryMidpoint` | param | types/index.ts:1379 | 0.15 (15pp/yr) | bondMarket.ts | (advanced) | ratio |
| `trajectoryRisk` | state | bondMarket.ts:107 | `trajectoryRaw × maxPremium` (sigmoid on debt change) | composite fiscal risk | N/A | rate |
| `rMinusG` | state | bondMarket.ts:116 | `weightedAvgDebtRate - gdpGrowthRate` | sustainability sigmoid | N/A | rate diff |
| `sustainabilityRisk` | state | bondMarket.ts:118 | sigmoid on rMinusG | composite | N/A | rate |
| `levelRisk` | state | bondMarket.ts:128 | sigmoid on debt/GDP centered at midpoint | composite | N/A | rate |
| `supplyPressurePremium` | state | bondMarket.ts:439 | `excessAbsorption / (capacity × sensitivity)` | tenYearYield | N/A | rate |
| `supplyPressureSensitivity` | param | types/index.ts:1336 | 1.0 | bondMarket.ts | (advanced) | multiplier |
| `safetyFlightSensitivity` | param | types/index.ts:1338 | 1.5 | bondMarket.ts → computeTreasuryDemand | (advanced) | multiplier |
| `yieldAttractionMidpoint` | param | types/index.ts:1340 | 0.06 | bondMarket.ts → computeBuyerSelfCorrection | (advanced) | rate |
| `inflationDeterrentSensitivity` | param | types/index.ts:1342 | 1.0 | bondMarket.ts | (advanced) | multiplier |
| `sovereignConfidenceDecayRate` | param | types/index.ts:1344 | 2.0 | bondMarket.ts → computeSovereignConfidence | (advanced) | rate |
| `foreignDemandRatio` | state | bondMarket.ts:167-187 | exponential decay as debt/GDP rises | tenYearYield (reduces supply pressure) | N/A | ratio |
| `FOREIGN_DEMAND_INITIAL` | const | constants.ts:1225 | 0.30 | bondMarket.ts:170 | N/A | ratio |
| `foreignTreasuryDemand` | param | types/index.ts:1327 | 0.30 | bondMarket.ts:412 | FiscalMonetaryControls "Foreign Treasury Demand" | ratio |
| `absorptionCapacity` | state | bondMarket.ts:319-372 | 5-factor model | supplyPressure scaling | N/A | multiplier |
| `mortgageRate` | derived | bondMarket.ts:496 | `tenYearYield + BASELINE_MORTGAGE_SPREAD` | housing demand; shelter inflation | N/A | rate |
| `BASELINE_MORTGAGE_SPREAD` | const | constants.ts:1095 | govData.mortgageSpread (~0.017) | bondMarket.ts:496 | N/A | spread |
| `corporateBorrowingRate` | derived | bondMarket.ts:501 | `tenYearYield + BASE_CORP_SPREAD × stress` | business investment | N/A | rate |
| `BASE_CORPORATE_SPREAD` | const | constants.ts:1079 | govData.bbbCorporateSpread (~0.015) | bondMarket.ts:501 | N/A | spread |
| `stressFactor` | derived | bondMarket.ts:500 | `1 + max(0, (debt - baseline) / baseline)` | corporateRate widening | N/A | multiplier |
| `consumerCreditRate` | derived | bondMarket.ts:507 | `policyRate + 0.10` | macro credit channels | N/A | rate |
| `CONSUMER_CREDIT_SPREAD` | const | bondMarket.ts:506 | 0.10 (1000bp) | bondMarket.ts:507 | N/A | spread |
| `INITIAL_10Y_YIELD` | const | constants.ts:1036 | govData.treasuryYield10Y (~0.043) | bondMarket baseline | N/A | rate |
| `consolidationCredibility` | state | bondMarket.ts (Phase 8a) | from fiscal consolidation effort | risk premium reduction | N/A | multiplier |

---

## 19. Federal Reserve / monetary policy

| Variable | Type | Defined in | Default/Formula | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `NEUTRAL_REAL_RATE` | const | constants.ts:1195 | 0.01 (1% r*) | federalReserve.ts:119 (Taylor r*) | N/A | rate |
| `neutralRealRate` | param | types/index.ts:1362 | 0.007 | federalReserve.ts | FiscalMonetaryControls "Neutral Real Rate (r*)" | rate |
| `INITIAL_POLICY_RATE` | const | constants.ts:1183 | FEDERAL_FUNDS_RATE | federalReserve.ts baseline | N/A | rate |
| `FEDERAL_FUNDS_RATE` | const | constants.ts:1176 | govData.fedFundsRate | federalReserve.ts (baseline) | N/A | rate |
| `taylorPrescribedRate` | state | federalReserve.ts:102-127 | dual-mandate Taylor | FederalReserveState | N/A | rate |
| `TAYLOR_INFLATION_COEFF` | const (per profile) | federalReserve.ts | 1.5 (default α) | federalReserve.ts:122 | (via Fed preset) | coefficient |
| `TAYLOR_OUTPUT_GAP_COEFF` | const (per profile) | federalReserve.ts | 0.5 | federalReserve.ts:123 | (via Fed preset) | coefficient |
| `taylorEmploymentGapCoeff` | const | federalReserve.ts:111 | 0.3 | federalReserve.ts:124 | (via Fed preset) | coefficient |
| `outputGap` | state | federalReserve.ts | `(realGDP - fullEmpGDP) / fullEmpGDP` | Taylor output term | N/A | ratio |
| `fullEmploymentGDP` | state | federalReserve.ts:39-63 | `trendGDP × (natUE/baseline) × (1 + aiBoost)` | output gap denominator | N/A | dollars |
| `employmentGap` | state | federalReserve.ts:117 | `naturalUE - currentUE` | Taylor employment term | N/A | ratio |
| `policyRate` | state | federalReserve.ts:177-221 | Taylor + dominance constraint | many — interest channels | FiscalMonetaryControls (keyframe override) | rate |
| `fiscalDominanceThreshold` | param | types/index.ts:1317 | 0.25 | federalReserve.ts:199 | FiscalMonetaryControls "Fiscal Dom. Threshold" | ratio |
| `fiscalDominanceDampening` | param | types/index.ts:1319 | 0.5 | federalReserve.ts:202 | FiscalMonetaryControls "Fiscal Dom. Dampening" | ratio |
| `fiscalDominanceGap` | derived | federalReserve.ts:210 | `taylor - policyRate` | FederalReserveState | N/A | rate diff |
| `dominanceFactor` | derived | federalReserve.ts:202 | `(pressure × dampening) or 0` | Case 3 monetization input | N/A | ratio |
| `policyRateSchedule` | param (PolicySchedule) | types/index.ts:1358 | undefined | federalReserve.ts:174 (overrides Taylor) | FiscalMonetaryControls keyframe editor | rate |
| `inflationConvergenceYears` | param | types/index.ts:1366 | 5 | federalReserve.ts → expectations | FiscalMonetaryControls "Inflation Convergence" | years |
| `effectiveLowerBound` | param | types/index.ts:1315 | -0.005 | federalReserve.ts → ZLB; monetization Case 1 | FiscalMonetaryControls "Effective Lower Bound" | rate |

---

## 20. Fiscal: revenue, spending, debt

| Variable | Type | Defined in | Default/Formula | Read by | Unit |
|---|---|---|---|---|---|
| `INITIAL_FEDERAL_DEBT` | const | constants.ts:1029 | govData.federalDebtTotal × 1e6 | fiscal.ts; sim init | dollars |
| `INITIAL_10Y_YIELD` | const | constants.ts:1036 | govData.treasuryYield10Y | fiscal.ts → newDebtRate | rate |
| `BASELINE_DEFICIT_GDP_RATIO` | const | constants.ts:1043 | govData.baselineDeficitGDPRatio (~0.06) | fiscal.ts → computeDeficit | ratio |
| `FEDERAL_DEFICIT_GDP_RATIO` | const | constants.ts:1049 | alias of BASELINE_DEFICIT_GDP_RATIO | fiscal.ts | ratio |
| `INITIAL_WEIGHTED_AVG_DEBT_RATE` | const | constants.ts:1058 | 0.029 | fiscal.ts → interestExpense | rate |
| `BASELINE_PRIMARY_DEFICIT_GDP_RATIO` | const | constants.ts:1070 | derived: deficit - interest×debt/GDP | fiscal.ts → computeDeficit | ratio |
| `DEBT_ROLLOVER_RATE` ⚠️ DEPRECATED | const | constants.ts:1123 | 0.30 | fiscal.ts (legacy) | ratio |
| `STATUTORY_CORPORATE_RATE` | const | constants.ts:1110 | 0.21 | macro.ts → computeTaxes | ratio |
| `FEDERAL_REVENUE_GDP_RATIO` | const | constants.ts:1018 | 0.175 | fiscal.ts (fallback only — see flags) | ratio |
| `federalDebtStock` | state | fiscal.ts:370 | INITIAL_FEDERAL_DEBT | computeDebtAccumulation | dollars |
| `debtGDPRatio` | derived | fiscal.ts:211 | `debtStock / gdpNominal` (1.27 baseline) | bondMarket; dashboard | ratio |
| `interestExpense` | state | fiscal.ts:148-150 | `prevDebt × weightedAvgRate` | computeGovSpending | dollars |
| `debtServiceRevenueRatio` | derived | fiscal.ts:834 | `interestExp / totalRevenue` | monetization Case 2; Fed dominance | ratio |
| `weightedAverageDebtRate` | state | fiscal.ts:272 | computeWeightedAverageDebtRate() | interestExpense | rate |
| `primaryDeficit` | derived | fiscal.ts:198 | `spending (excl interest) - revenue` | debt accumulation | dollars |
| `totalDeficit` | derived | fiscal.ts:201 | `spending - revenue` | fiscal stability | dollars |
| `totalGovernmentRevenue` | derived | fiscal.ts:75 | sum of tax channels | gov spending | dollars |
| `revenueGDPRatio` | derived | fiscal.ts:76 | `totalRevenue / gdpNominal` | fiscal balance | ratio |
| `laborTaxRevenue` | derived | fiscal.ts:73 | from income+payroll taxes | fiscal decomp | dollars |
| `corporateTaxRevenue` | derived | fiscal.ts:75 | from corporate tax | fiscal decomp | dollars |
| `effectiveRolloverRate` | state (Phase 8 Fix 3) | fiscal.ts:313-351 | computeEndogenousRolloverRate() | weighted avg debt rate | ratio |
| `weightedAverageMaturity` | state | fiscal.ts | endogenous from stress | rollover rate | years |
| `baseWeightedAverageMaturity` | param | types/index.ts:1347 | 6.0 | fiscal.ts | (advanced) | years |
| `minWeightedAverageMaturity` | param | types/index.ts:1349 | 2.5 | fiscal.ts | (advanced) | years |
| `maxWeightedAverageMaturity` | param | types/index.ts:1351 | 8.0 | fiscal.ts | (advanced) | years |
| `maturityStressSensitivity` | param | types/index.ts:1353 | 1.0 | fiscal.ts | (advanced) | multiplier |
| `consolidationCreditMax` | param | types/index.ts:1333 | 0.40 | fiscal.ts → computeConsolidationCredit | (advanced) | ratio |


---

## 21. Fiscal response profiles & dimensions (Phase 8a/8c, split into Fiscal + Fed in Phase 8 Fix 4)

### Fiscal policy presets (5 options) — fiscalResponseProfiles.ts:116-191

| Preset | maxDiscretionaryCut | maxObligationCut | maxRevenueIncrease | colaDampeningRate | consolidationThreshold | consolidationLag |
|---|---|---|---|---|---|---|
| `austerity` | 0.25 | 0.08 | 0.03 | 0.35 | 1.2 | 1 |
| `tax_the_winners` | 0.05 | 0.02 | 0.18 | 0.0 | 1.5 | 2 |
| `balanced_reduction` (DEFAULT) | 0.15 | 0.05 | 0.08 | 0.20 | 1.5 | 1 |
| `gridlock` | 0.05 | 0.01 | 0.03 | 0.0 | 2.5 | 3 |
| `no_fiscal_response` | 0.0 | 0.0 | 0.0 | 0.0 | 999.0 | 0 |

### Federal Reserve presets (4 options) — fiscalResponseProfiles.ts:209-261

| Preset | taylorInflationCoeff | taylorOutputGapCoeff | taylorEmploymentGapCoeff | qeMonetizationRate | maxFinancialRepressionRate |
|---|---|---|---|---|---|
| `price_stability` | 2.0 | 0.5 | 0.0 | 0.10 | 0.30 |
| `balanced_mandate` (DEFAULT) | 1.5 | 0.5 | 0.5 | 0.15 | 0.50 |
| `employment_focused` | 1.0 | 0.3 | 0.8 | 0.25 | 0.60 |
| `maximum_accommodation` | 0.8 | 0.2 | 1.2 | 0.40 | 0.80 |

### Profile config fields

| Variable | Type | Defined in | Default | Read by | UI binding |
|---|---|---|---|---|---|
| `fiscalPolicyPreset` | param | types/index.ts:1404 | 'balanced_reduction' | fiscal.ts → resolveProfile | FiscalResponseSection / FiscalPresetSelector |
| `federalReservePreset` | param | types/index.ts:1406 | 'balanced_mandate' | federalReserve.ts → resolveProfile | FiscalResponseSection |
| `fiscalPolicyCustom` | param (optional) | types/index.ts:1408 | undefined | fiscal.ts → mergeWithPreset | (set by setFiscalDimension) |
| `federalReserveCustom` | param (optional) | types/index.ts:1410 | undefined | federalReserve.ts → mergeWithPreset | (set by setFedDimension) |

### Fiscal dimensions (Phase 8c)

**4 fiscal dimensions** (fiscalDimensions.ts:28-35), each maps preset positions to profile field values:
- `spendingRevenue`: 0-4 (cut spending → tax winners)
- `safetyNet`: 0-2 (austere → generous)
- `reactionTiming`: 0-2 (early → late)
- `adjustmentSpeed`: 0-3 (gradual → rapid)

**2 Fed dimensions:**
- `inflationVsEmployment`: 0-3 (hawkish → accommodative)
- `bondMarketOperations`: 0-3 (passive → active)

### Autopilot-computed fiscal multipliers

| Variable | Type | Defined in | Computation | Read by | Unit |
|---|---|---|---|---|---|
| `discretionaryMultiplier` | autopilot | autopilot.ts | linear ramp on debt/GDP gap × profile params | macro.ts → spending | multiplier (≤1) |
| `obligationMultiplier` | autopilot | autopilot.ts | same logic | macro.ts → spending | multiplier (≤1) |
| `revenueMultiplier` | autopilot | autopilot.ts | same logic | macro.ts → tax revenue | multiplier (≥1) |
| `consolidationIntensity` | autopilot | autopilot.ts | from debt/GDP relative to threshold | display | ratio (0-1) |
| `colaDampeningFactor` | autopilot | autopilot.ts | caps CIF growth above colaDampeningThreshold | macro.ts → COLA | factor (0.8-1.0) |
| `effectiveIncomeTaxRate` | autopilot | autopilot.ts:75 | `baseline × revenueMultiplier` | macro.ts → computeTaxes | rate |
| `effectivePayrollTaxRate` | autopilot | autopilot.ts:76 | `baseline × revenueMultiplier` | macro.ts → computeTaxes | rate |
| `effectiveCorporateTaxRate` | autopilot | autopilot.ts:77 | `baseline × revenueMultiplier` | macro.ts → computeTaxes | rate |
| `effectiveCapitalGainsTaxRate` | autopilot | autopilot.ts:78 | `baseline × revenueMultiplier` | macro.ts → computeTaxes | rate |

---

## 22. Wage policy

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `policyConfig.minimumWage.enabled` | param | policy.ts:48 | false | computeWagePolicyEffect | PolicyControls toggle | boolean |
| `policyConfig.minimumWage.federalMinimum` | param (PolicySchedule) | policy.ts:49 | 7.25 | policy.ts; macro.ts (Phillips floor) | PolicyKeyframeEditor | $/hr |
| `policyConfig.minimumWage.indexedToInflation` | param | policy.ts:52 | true | computeWagePolicyEffect | PolicyControls | boolean |
| `policyConfig.wageSubsidy.enabled` | param | policy.ts:67 | false | computeWagePolicyEffect | PolicyControls | boolean |
| `policyConfig.wageSubsidy.subsidyPercentage` | param (PolicySchedule) | policy.ts:66 | 0.0 | computeWagePolicyEffect | PolicyKeyframeEditor | fraction |
| `policyConfig.wageSubsidy.maxSubsidyPerWorker` | param | policy.ts:69 | 5000 | computeWagePolicyEffect | PolicyControls | $ |
| `policyConfig.workWeekReduction` ⚠️ DEPRECATED | param | policy.ts:75-78 | (config exists) | NOT IMPLEMENTED in models/policy.ts | (UI commented out) | hours/week |
| **Wage policy split weight** | architecture | simulation.ts | 60% | policy effect aggregation | N/A | percent |

**Phase 1 Overhaul:** Direct minimum-wage wage addition replaced by Phillips curve wage floor in `computeWagePressure()`.

---

## 23. Asset policy

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `policyConfig.sovereignWealthFund.enabled` | param | policy.ts:107 | false | computeAssetPolicyEffect | PolicyControls toggle | boolean |
| `policyConfig.sovereignWealthFund.initialFundSize` | param | policy.ts:109 | 0 | computeAssetPolicyEffect; sim init | PolicyControls | $B |
| `policyConfig.sovereignWealthFund.annualContribution` | param (PolicySchedule) | policy.ts:116 | 0 | computeAssetPolicyEffect | PolicyKeyframeEditor | $B/year |
| `policyConfig.sovereignWealthFund.annualReturnRate` | param | policy.ts:114 | 0.05 | computeAssetPolicyEffect | PolicyControls | rate |
| `policyConfig.sovereignWealthFund.distributionRate` | param | policy.ts:115 | 0.05 | computeAssetPolicyEffect | PolicyControls | rate |
| `policyConfig.sovereignWealthFund.ownershipFraction` | param (PolicySchedule) | policy.ts:127 | 0.0 | computeAssetPolicyEffect | PolicyKeyframeEditor | fraction |
| `policyConfig.sovereignWealthFund.totalAICompanyProfits` | param | policy.ts:129 | 500B (was 100B in some refs) | computeAssetPolicyEffect | PolicyControls | $B |
| `policyConfig.sovereignWealthFund.profitGrowthRate` | param | policy.ts:129 | 0.15 | computeAssetPolicyEffect | PolicyControls | rate/year |
| `policyConfig.profitSharing.enabled` | param | policy.ts:139 | false | computeAssetPolicyEffect | PolicyControls toggle | boolean |
| `policyConfig.profitSharing.mandatorySharePercentage` | param (PolicySchedule) | policy.ts:144 | 0.0 | computeAssetPolicyEffect | PolicyKeyframeEditor | fraction |
| `sovereignFundSize` | state | policy.ts:118, 376 | computed each year | sim output | $B |
| `swfAnnualContribution` | state | policy.ts:117, 360 | computed | macro + CSV | $B |
| **Asset policy split weight** | architecture | simulation.ts | 20% | policy aggregation | N/A | percent |

---

## 24. Transfer policy

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `policyConfig.ubi.enabled` | param | policy.ts:250 | false | computeTransferPolicyEffect | PolicyControls toggle | boolean |
| `policyConfig.ubi.monthlyAmount` | param (PolicySchedule) | policy.ts:213 | 0 | getEffectiveUBI | PolicyKeyframeEditor | $/month |
| `policyConfig.ubi.mode` | param | policy.ts:197 | 'manual' | getEffectiveUBI | PolicyToggleCard | enum |
| `policyConfig.ubi.indexedBaseAmount` | param | policy.ts:198 | 1000 | getEffectiveUBI (indexed mode) | PolicyToggleCard | $/month |
| `policyConfig.ubi.indexedStartYear` | param | policy.ts:199 | 2032 | getEffectiveUBI | PolicyToggleCard | year |
| `policyConfig.ubi.productivityIndexRate` | param | policy.ts:200 | 1.0 | getEffectiveUBI | PolicyToggleCard | fraction |
| `policyConfig.ubi.ageThreshold` | param | policy.ts:261 | 18 | getEligibleFraction | PolicyControls | years |
| `policyConfig.ubi.indexedToInflation` | param | policy.ts:254 | true | computeTransferPolicyEffect | PolicyControls | boolean |
| `policyConfig.ubi.phaseOut` ⚠️ DEPRECATED | param | policy.ts:269-270 | undefined | NOT APPLIED (see flags) | (hidden) | varies |
| `policyConfig.enhancedUI.enabled` | param | policy.ts:279 | false | computeTransferPolicyEffect | PolicyControls toggle | boolean |
| `policyConfig.enhancedUI.replacementRate` | param (PolicySchedule) | policy.ts:282 | 0.45 | computeTransferPolicyEffect | PolicyKeyframeEditor | fraction |
| `policyConfig.enhancedUI.durationWeeks` | param | policy.ts:283 | 26 | computeTransferPolicyEffect | PolicyControls | weeks |
| `policyConfig.enhancedUI.retrainingBonus` | param | policy.ts:292 | 0 | computeTransferPolicyEffect | PolicyControls | $ |
| `policyConfig.retraining.enabled` | param | policy.ts:298 | false | computeTransferPolicyEffect | PolicyControls toggle | boolean |
| `policyConfig.retraining.stipendMonthly` | param (PolicySchedule) | policy.ts:300 | 0 | computeTransferPolicyEffect | PolicyKeyframeEditor | $/month |
| `policyConfig.retraining.durationMonths` | param | policy.ts:301 | 12 | computeTransferPolicyEffect | PolicyControls | months |
| `policyConfig.retraining.participationRate` | param | policy.ts:303 | 0.5 | computeTransferPolicyEffect | PolicyControls | fraction |
| `policyConfig.retraining.effectivenessRate` | param | policy.ts | 0.60 | computeTransferPolicyEffect | PolicyControls | fraction |
| **Transfer policy split weight** | architecture | simulation.ts | 20% | policy aggregation | N/A | percent |

### Policy schedule (PolicySchedule type)

`PolicySchedule = { keyframes: { year: number, value: number }[] }`. Linear interpolation between keyframes via `interpolatePolicy()`. Conversion utilities in `src/utils/policyInterpolation.ts`. Persisted via Zustand with CSV round-trip support (`csvQuoteSchedule()`, `parseSchedule()`). Migrated on rehydrate via `migratePolicySchedules()`.

**9 fields use PolicySchedule:** `federalMinimum`, `subsidyPercentage`, `standardHours` (deprecated), `annualContribution`, `ownershipFraction`, `mandatorySharePercentage`, `monthlyAmount`, `replacementRate`, `stipendMonthly`.

---

## 25. Tax policy

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `taxConfig.incomeTaxRate` | param | autopilot.ts:47, types | 0.145 (govData.effectiveIncomeTaxRate) | computeAutopilotParameters; macro.ts | TaxRateControls "Income Tax Rate" | rate |
| `taxConfig.payrollTaxRate` | param | autopilot.ts:48 | 0.153 | macro.ts | TaxRateControls "Payroll Tax Rate" | rate |
| `taxConfig.corporateTaxRate` | param | autopilot.ts:49 | 0.21 | macro.ts | TaxRateControls "Corporate Tax Rate" | rate |
| `taxConfig.capitalGainsTaxRate` | param | autopilot.ts:50 | 0.165 (UI 0.20) | macro.ts | TaxRateControls "Capital Gains Tax Rate" | rate |
| `corporateTaxEffectiveness` | param | types/index.ts:1325 | 0.65 | macro.ts → computeTaxes (⚠️ verify usage) | FiscalMonetaryControls "Corp Tax Effectiveness" | ratio |
| `BASELINE_INCOME_TAX_RATE` | const | constants.ts:1890 | govData.effectiveIncomeTaxRate (~0.132) | macro.ts | N/A | rate |
| `BASELINE_PAYROLL_RATE` | const | constants.ts:1891 | govData.effectivePayrollRate (~0.136) | macro.ts | N/A | rate |
| `BASELINE_CORPORATE_TAX_RATE` | const | constants.ts:1892 | govData.effectiveCorporateTaxRate (~0.14) | macro.ts | N/A | rate |
| `BASELINE_CAPITAL_GAINS_RATE` | const | constants.ts:1893 | govData.effectiveCapGainsRate (~0.165) | macro.ts | N/A | rate |
| `BASELINE_CORPORATE_RETENTION_RATE` | const | constants.ts:1894 | govData.corporateRetentionRate (~0.40) | macro.ts | N/A | ratio |
| `BASELINE_PROFIT_GDP_RATIO` | const | constants.ts:1895 | govData.baselineProfitGDPRatio (~0.11) | macro.ts | N/A | ratio |
| `EMPLOYER_EMPLOYEE_SPLIT` | const | constants.ts:1899 | 0.50 | macro.ts → computeTaxes | N/A | ratio |
| `TRANSFER_TAX_RATE` | const | constants.ts:1901 | 0.05 | macro.ts → computeTaxes | N/A | rate |
| `STATE_LOCAL_TAX_RATE` | const | constants.ts:1907-1924 | IIFE: residual to match effective tax | macro.ts → computeTaxes | N/A | rate |
| `EFFECTIVE_TAX_RATE` (legacy) | const | constants.ts:1876 | 0.25 | macro.ts (fallback) | N/A | rate |
| `FALLBACK_INCOME_TAX_RATE` | const | constants.ts:1883 | 0.132 | macro.ts (fallback) | N/A | rate |
| `FALLBACK_PAYROLL_TAX_RATE` | const | constants.ts:1884 | 0.136 | macro.ts (fallback) | N/A | rate |
| `FALLBACK_CORPORATE_TAX_RATE` | const | constants.ts:1885 | 0.14 | macro.ts (fallback) | N/A | rate |
| `FALLBACK_CAPITAL_GAINS_RATE` | const | constants.ts:1886 | 0.165 | macro.ts (fallback) | N/A | rate |
| `FALLBACK_CORPORATE_RETENTION_RATE` | const | constants.ts:1887 | 0.40 | macro.ts (fallback) | N/A | ratio |
| `aiCostParams.inferenceAnnualChange` | param | types | -0.45 | macro.ts → computeAICostDeflation | MonetaryPricesControls "Inference Cost Change" | rate/year |
| `aiCostParams.manufacturingAnnualChange` | param | types | -0.10 | macro.ts → computeAICostDeflation | MonetaryPricesControls "Manufacturing Cost Change" | rate/year |
| `aiCostParams.energyAnnualChange` | param | types | -0.03 (UI 0.02) | macro.ts → computeAICostDeflation | MonetaryPricesControls "Energy Cost Change" | rate/year |

---

## 26. Credit & financial conditions (Phase 6 Phase 8 Fix 5)

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `CREDIT_UE_SENSITIVITY` | const | constants.ts:1627 | 8.0 | credit.ts → computeConsumerCredit | N/A | ratio |
| `creditUESensitivity` | param | types/index.ts:1128 | 8.0 (UI 3.0) | credit.ts | CreditFinancialControls "Credit UE Sensitivity" | elasticity |
| `MAX_CREDIT_TIGHTENING` | const | constants.ts:1639 | 0.70 | credit.ts | N/A | ratio |
| `maxCreditTightening` | param | types/index.ts:1147 | 0.70 | credit.ts | CreditFinancialControls "Max Credit Contraction" | ratio |
| `CREDIT_INVESTMENT_SENSITIVITY` | const | constants.ts:1649 | 0.35 (UI 1.2) | credit.ts → computeBusinessCredit | N/A | ratio |
| `creditInvestmentSensitivity` | param | types/index.ts:1129 | 0.35 | credit.ts | CreditFinancialControls "Credit → Investment" | elasticity |
| `CREDIT_CONSUMPTION_SENSITIVITY` | const | constants.ts:1659 | 0.06 (UI 1.5) | credit.ts → computeConsumerCredit | N/A | ratio |
| `creditConsumptionSensitivity` | param | types/index.ts:1130 | 0.06 | credit.ts | CreditFinancialControls "Credit → Consumption" | elasticity |
| `DEFAULT_BUSINESS_CREDIT_GDP_SENSITIVITY` | const | constants.ts:1671 | 5.0 | credit.ts | N/A | elasticity |
| `businessCreditGDPSensitivity` | param | types/index.ts:1215 | 5.0 | credit.ts | CreditFinancialControls "Biz Credit GDP Sensitivity" | elasticity |
| `DEFAULT_MAX_BUSINESS_CREDIT_LOOSENING` | const | constants.ts:1678 | 0.30 (UI 0.50) | credit.ts | N/A | ratio |
| `maxBusinessCreditLoosening` | param | types/index.ts:1217 | 0.30 | credit.ts | CreditFinancialControls "Max Biz Credit Loosening" | ratio |
| `DEFAULT_TRANSFER_RELIABILITY_WEIGHT` | const | constants.ts:1767 | 0.70 | credit.ts | N/A | ratio |
| `transferReliabilityWeight` | param | types/index.ts:1265 | 0.70 | credit.ts | (advanced) | ratio |
| `DEFAULT_INCOME_ADEQUACY_SENSITIVITY` | const | constants.ts:1773 | 2.0 | credit.ts | N/A | ratio |
| `incomeAdequacySensitivity` | param | types/index.ts:1267 | 2.0 | credit.ts | (advanced) | ratio |
| `DEFAULT_COLLATERAL_SENSITIVITY` | const | constants.ts:1778 | 1.0 | credit.ts | N/A | ratio |
| `collateralSensitivity` | param | types/index.ts:1269 | 1.0 | credit.ts | (advanced) | ratio |
| `DEFAULT_SYSTEMIC_RISK_SENSITIVITY` | const | constants.ts:1784 | 1.5 | credit.ts | N/A | ratio |
| `systemicRiskSensitivity` | param | types/index.ts:1271 | 1.5 | credit.ts | (advanced) | ratio |
| `DEFAULT_INFLATION_RISK_SENSITIVITY` | const | constants.ts:1789 | 0.5 | credit.ts | N/A | ratio |
| `inflationRiskSensitivity` | param | types/index.ts:1273 | 0.5 | credit.ts | (advanced) | ratio |
| `DEFAULT_MAX_CONSUMER_TIGHTENING` | const | constants.ts:1794 | 0.5 | credit.ts | N/A | ratio |
| `maxConsumerTightening` | param | types/index.ts:1275 | 0.5 | credit.ts | (advanced) | ratio |
| `DEFAULT_CONSUMER_CREDIT_IMPACT` | const | constants.ts:1801 | 0.06 | credit.ts → computeConsumption | N/A | ratio |
| `consumerCreditImpact` | param | types/index.ts:1277 | 0.06 | credit.ts | (advanced) | ratio |
| `ASSET_INCOME_UNDERWRITING_WEIGHT` | const | constants.ts:1806 | 0.3 | credit.ts | N/A | ratio |
| `COLLATERAL_LOOSENING_ASYMMETRY` | const | constants.ts:1811 | 0.3 (UI not exposed) | macro.ts:1823 | N/A | ratio |
| `DEFAULT_PROFITABILITY_SENSITIVITY` | const | constants.ts:1819 | 1.5 | credit.ts | N/A | ratio |
| `profitabilitySensitivity` | param | types/index.ts:1279 | 1.5 | credit.ts | (advanced) | ratio |
| `DEFAULT_GROWTH_TRAJECTORY_SENSITIVITY` | const | constants.ts:1824 | 2.0 | credit.ts | N/A | ratio |
| `growthTrajectorySensitivity` | param | types/index.ts:1281 | 2.0 | credit.ts | (advanced) | ratio |
| `DEFAULT_MAX_BUSINESS_TIGHTENING` | const | constants.ts:1829 | 0.5 | credit.ts | N/A | ratio |
| `maxBusinessTightening` | param | types/index.ts:1283 | 0.5 | credit.ts | (advanced) | ratio |
| `DEFAULT_BUSINESS_INVESTMENT_IMPACT` | const | constants.ts:1834 | 0.15 | credit.ts | N/A | ratio |
| `businessInvestmentImpact` | param | types/index.ts:1285 | 0.15 | credit.ts | (advanced) | ratio |
| `DEFAULT_MAX_GROWTH_TIGHTENING` | const | constants.ts:1839 | 0.3 | credit.ts | N/A | ratio |

---

## 27. Supply chain (Phase 9)

**Defined in:** `src/models/supplyChain.ts` (886 lines), `src/types/supplyChain.ts`. Optional config; not yet fully integrated into main UI flow.

### Supply chain inputs (7 inputs, baseline=100)

| Input | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `inputs.aiChips` | param | constants.ts:2035 | 100 | supplyChain.ts; macro.ts (BFCS) | SupplyChainControls "AI Chip Availability" | index 0-100 |
| `inputs.energyPrice` | param | constants.ts:2036 | 100 | supplyChain.ts | SupplyChainControls "Energy Price Level" | index |
| `inputs.energyCapacity` | param | constants.ts:2037 | 100 | supplyChain.ts | SupplyChainControls "Grid Capacity for AI" | index |
| `inputs.trainingDCCapacity` | param | constants.ts:2038 | 100 | supplyChain.ts | SupplyChainControls "Training DC Capacity" | index |
| `inputs.inferenceDCCapacity` | param | constants.ts:2039 | 100 | supplyChain.ts | SupplyChainControls "Inference DC Capacity" | index |
| `inputs.roboticsHardware` | param | constants.ts:2040 | 100 | supplyChain.ts | SupplyChainControls "Robotics HW Availability" | index |
| `inputs.softwareEfficiency` | param | constants.ts:2041 | 100 | supplyChain.ts | SupplyChainControls "Software Efficiency" | index |

### Resilience (5 factors)

| Factor | Type | Defined in | Default | Max | Improvement Rate | UI binding |
|---|---|---|---|---|---|---|
| `resilience.aiChips` | param | constants.ts:2049 | 0.05 | 0.85 | RESILIENCE_IMPROVEMENT_RATES.aiChips | SupplyChainControls "Chip Fab Resilience" |
| `resilience.energy` | param | constants.ts:2050 | 0.85 | 0.95 | RESILIENCE_IMPROVEMENT_RATES.energy | SupplyChainControls "Energy Grid Resilience" |
| `resilience.trainingDC` | param | constants.ts:2051 | 0.90 | 0.95 | RESILIENCE_IMPROVEMENT_RATES.trainingDC | SupplyChainControls "Training DC Resilience" |
| `resilience.inferenceDC` | param | constants.ts:2052 | 0.90 | 0.95 | RESILIENCE_IMPROVEMENT_RATES.inferenceDC | SupplyChainControls "Inference DC Resilience" |
| `resilience.roboticsHardware` | param | constants.ts:2053 | 0.05 | 0.85 | RESILIENCE_IMPROVEMENT_RATES.roboticsHardware | SupplyChainControls "Rare Earth Resilience" |
| `MAX_RESILIENCE` | const | constants.ts:2070 | 0.85 | — | clampResilience | N/A |
| `MAX_RESILIENCE_DC` | const | constants.ts:2072 | 0.95 | — | clampResilience | N/A |
| `RESILIENCE_IMPROVEMENT_RATES` | const | constants.ts:2061-2067 | per-factor yearly rates | — | evolveResilience | N/A |

### Training & cost composition

| Variable | Type | Defined in | Default | Read by | UI binding |
|---|---|---|---|---|---|
| `DEFAULT_TRAINING_COMPOSITION` | const | constants.ts:2078 | `{aiChips:0.55, energy:0.25, datacenter:0.20}` | supplyChain.ts → trainingCosts | (initial values) |
| `trainingComposition.aiChips/energy/datacenter` | param | types | 0.55/0.25/0.20 (UI 0.40/0.30/0.30) | supplyChain.ts | SupplyChainControls "Training Cost Shares" (auto-normalized) |
| `DEFAULT_PROCUREMENT_SHARES` | const | constants.ts:2096 | `{aiChips:0.45, energy:0.35, datacenter:0.20}` | supplyChain.ts → composition | N/A |
| `procurementShares.aiChips/energy/datacenter` | param | types | 0.45/0.35/0.20 (UI 0.50/0.25/0.25) | supplyChain.ts | SupplyChainControls "Procurement Constraints" |
| `DEFAULT_COST_VS_PROCUREMENT_BLEND` | const | constants.ts:2107 | 0.50 | supplyChain.ts → composition blending | N/A |
| `costVsProcurementBlend` | param | types | 0.50 | supplyChain.ts | SupplyChainControls "Cost vs Procurement Blend" |
| `DEFAULT_TRAINING_SCALE_GROWTH_RATE` | const | constants.ts:2113 | 3.0 | supplyChain.ts → trainingDemand | N/A |
| `trainingScaleGrowthRate` | param | types | 3.0 (UI 1.5) | supplyChain.ts | SupplyChainControls "Training Scale Growth" |
| `DEFAULT_TRAINING_DYNAMICS` | const | constants.ts:2116 | per-component {techDeclineRate, scalePressure} | supplyChain.ts → trainingCosts | N/A |
| `trainingDynamics.aiChips.techDeclineRate` | param | types | -0.35 (UI -0.25) | supplyChain.ts | SupplyChainControls "Chip Cost Decline" |
| `trainingDynamics.energy.techDeclineRate` | param | types | -0.02 | supplyChain.ts | SupplyChainControls "Energy Cost Decline" |
| `trainingDynamics.datacenter.techDeclineRate` | param | types | -0.05 | supplyChain.ts | SupplyChainControls "DC Cost Decline" |
| `trainingDynamics.aiChips.scalePressure` | param | types | 0.15 | supplyChain.ts | SupplyChainControls "Chip Scale Pressure" |
| `trainingDynamics.energy.scalePressure` | param | types | 0.05 | supplyChain.ts | SupplyChainControls "Energy Scale Pressure" |
| `trainingDynamics.datacenter.scalePressure` | param | types | 0.08 | supplyChain.ts | SupplyChainControls "DC Scale Pressure" |
| `DEFAULT_REGULATORY_FRICTION` | const | constants.ts:2126 | 1.0 | supplyChain.ts → DCScaling | N/A |
| `regulatoryFriction` | param | types | 1.0 | supplyChain.ts | SupplyChainControls "Regulatory Friction" |

### Cascade, hysteresis, pass-through

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `DEFAULT_CASCADE_LAG` | const | constants.ts:2129 | 2.5 (UI 1.5) | supplyChain.ts → chipCascade | N/A | years |
| `chipCascadeLag` | param | types | 2.5 | supplyChain.ts | SupplyChainControls "Chip Cascade Lag" | years |
| `DEFAULT_CASCADE_COST_PREMIUM` | const | constants.ts:2131 | 0.30 (UI 0.20) | supplyChain.ts | N/A | ratio |
| `chipCascadeCostPremium` | param | types | 0.30 | supplyChain.ts | SupplyChainControls "Cascade Cost Premium" | ratio |
| `DEFAULT_COST_PASS_THROUGH` | const | constants.ts:2134 | 0.0 (UI 0.7) | supplyChain.ts; macro.ts deflation | N/A | ratio |
| `costPassThroughRate` | param | types | 0.0 | supplyChain.ts | SupplyChainControls "Lab → Deployer Rate" | ratio |
| `DEFAULT_CONSUMER_PASS_THROUGH` | const | constants.ts:2136 | 0.50 | supplyChain.ts → deploymentCosts | N/A | ratio |
| `consumerPassThroughRate` | param | types | 0.50 | supplyChain.ts | SupplyChainControls "Deployer → Consumer Rate" | ratio |
| `PASS_THROUGH_TRAJECTORY` | const | constants.ts:2139 | `[{2025,0},{2035,0.30},{2045,0.75}]` | supplyChain.ts → interpolateTrajectory | N/A | keyframe |
| `DEFAULT_HYSTERESIS_MAX_COGNITIVE` | const | constants.ts:2146 | 0.25 | adoption.ts → computeHysteresis | N/A | ratio |
| `hysteresisMaxCognitive` | param | types | 0.25 | adoption.ts | SupplyChainControls "Cognitive Hysteresis Max" | ratio |
| `DEFAULT_HYSTERESIS_MAX_EMBODIED` | const | constants.ts:2148 | 0.35 | adoption.ts | N/A | ratio |
| `hysteresisMaxEmbodied` | param | types | 0.35 | adoption.ts | SupplyChainControls "Embodied Hysteresis Max" | ratio |
| `HYSTERESIS_BASE_COGNITIVE` | const | constants.ts:2150 | 0.05 | adoption.ts | N/A | ratio |
| `HYSTERESIS_BASE_EMBODIED` | const | constants.ts:2152 | 0.10 | adoption.ts | N/A | ratio |
| `HYSTERESIS_CAP_YEARS_COGNITIVE` | const | constants.ts:2154 | 6 | adoption.ts | N/A | years |
| `HYSTERESIS_CAP_YEARS_EMBODIED` | const | constants.ts:2156 | 5 | adoption.ts | N/A | years |
| `ADOPTION_DECLINE_RATE_COGNITIVE` | const | constants.ts:2158 | 0.10 | adoption.ts → adoptionDecline | N/A | rate |
| `ADOPTION_DECLINE_RATE_EMBODIED` | const | constants.ts:2160 | 0.05 | adoption.ts | N/A | rate |
| `DEPLOYMENT_COST_COMPOSITION` | const | constants.ts:2169-2174 | per-deployment cost composition | supplyChain.ts; macro.ts | N/A | nested map |

### Sensitivity matrices (Phase 9)

| Variable | Type | Defined in | Value | Read by | Unit |
|---|---|---|---|---|---|
| `SENSITIVITY_NONE/LOW/MEDIUM/HIGH` | const | constants.ts:2177-2180 | 0, 0.25, 0.50, 0.75 | supplyChain.ts (calibration) | dimensionless |
| `COGNITIVE_SENSITIVITY` | const | constants.ts:2189-2196 | 6×4 matrix (input × BFCS dimension) | supplyChain.ts → sensitivity | matrix |
| `EMBODIED_SENSITIVITY` | const | constants.ts:2203-2210 | 6×4 matrix | supplyChain.ts → sensitivity | matrix |
| `PROPAGATION_LAGS` | const | constants.ts:2217-2224 | 6×4 matrix in months | supplyChain.ts → propagation | matrix (months) |

### Supply chain effects (computed per year)

| Effect | Function | Output | Used by |
|---|---|---|---|
| Capability delay | computeCapabilityDelay | `Record<vectorId, years>` | capability S-curves (monotonic) |
| Cost multipliers | computeDeploymentCostMultipliers | `{compute, physicalHardware, energy}` | BFCS cost dimension |
| Adoption drag | computeAdoptionDrag | `[0,1]` | adoption S-curve slope |
| Faster multiplier | computeFasterMultiplier | `[0,1]` | BFCS faster |
| Safer multiplier | computeSaferMultiplier | `[0,1]` | BFCS safer |
| Hysteresis width | computeHysteresisWidth | number | adoption hysteresis band |
| Cascade backlog | computeCascadeBacklog | `[0,1]` | inference fleet decline |
| Effective compute decline | computeEffectiveComputeDecline | number | inference cost trajectory |

### Stateful adoption (Phase 9)

`AdoptionState` carries `{rates, frozenSince}` per cluster-role across years for hysteresis modeling. Function: `computeStatefulAdoptionRate(year, currentRate, hysteresisWidth, drag, scenario?, state?)`.

---

## 28. State simulation (Phase 6 — US states)

| Variable | Type | Defined in | Default | Read by | UI binding | Unit |
|---|---|---|---|---|---|---|
| `STATE_FIPS_CODES` | const | stateData.ts | 51-entry map (AL→01..WY→56) | dataLoader; choropleth | N/A | FIPS codes |
| `STATE_NAMES` | const | stateData.ts | 51-entry map | UI display | N/A | strings |
| `STATE_POPULATIONS` (2024) | const | stateData.ts | 51-entry map (AL: 5.1M, ..., WY: 577K) | macro state aggregation | N/A | persons |
| `STATE_MINIMUM_WAGES_2024` | const | stateData.ts | 51-entry map (e.g., AL:7.25, WA:16.28, DC:17.50) | applyStatePolicyModifiers | N/A | $/hour |
| `DEFAULT_STATE_AV_REGULATORY` | const | stateData.ts | 51-entry map | applyStatePolicyModifiers | N/A | enum |
| `REGULATORY_LAG_MODIFIERS` | const | stateData.ts | `{permissive:0, moderate:1, restrictive:3}` | applyStatePolicyModifiers | N/A | years |
| `SOC_MAJOR_GROUPS` | const | stateData.ts | 22-entry map (11-0000..53-0000) | dataTransform.ts | N/A | SOC codes |
| `CLUSTER_TO_SOC_MAJOR_GROUP` | const | stateData.ts | maps 48 clusters to 22 groups | dataTransform.ts (state derivation) | N/A | mapping |
| `DISPLACEMENT_TO_UNEMPLOYMENT_FACTOR` | const | constants.ts:2007 | 0.7 | stateSimulation.ts; macro.ts | N/A | ratio |
| `stateOverrides` (per state) | param | types/index.ts:1123 | `{}` | stateSimulation.ts | StatePolicyOverrides | nested map |
| `StatePolicyOverride.minimumWage` | param | stateData.ts | varies | applyStatePolicyModifiers | StatePolicyOverrides | $/hour |
| `StatePolicyOverride.additionalUBI` | param | stateData.ts | 0 | applyStatePolicyModifiers | StatePolicyOverrides | $/month |
| `StatePolicyOverride.uiReplacementRate` | param | stateData.ts | 0.45 | applyStatePolicyModifiers | StatePolicyOverrides | fraction |
| `StatePolicyOverride.avRegulatoryEnvironment` | param | stateData.ts | 'moderate' | applyStatePolicyModifiers | StatePolicyOverrides | enum |
| `StatePolicyOverride.roboticsRegulatoryEnvironment` | param | stateData.ts | 'moderate' | applyStatePolicyModifiers | StatePolicyOverrides | enum |

### State output (per state per year)

| Variable | Type | Defined in | Formula | Unit |
|---|---|---|---|---|
| `code` | input | stateSimulation.ts | StateCode | enum |
| `displacement` | derived | computeStateSingleDisplacement | `Σ(clusterDisplRate × stateOccupShare)` | fraction |
| `unemploymentRate` | derived | computeStateUnemploymentRate | from displacement and baseline UE | fraction |
| `consumerWelfareIndex` | derived | computeStateCWI | `nationalCWI × (1 - displ × 0.5) + per-capita policy add` | $/person |
| `policyEffectiveness` | derived | computeStatePolicyEffectiveness | varies | fraction |


---

## 29. Feedback loops (6 simulator loops)

**Defined in:** `src/components/charts/feedbackLoops/loopDefinitions.ts`, simulated in `loopSimulations.ts`. Each loop is a standalone interactive simulator (not the main runSimulation engine), used in dashboard for explanatory diagrams.

### Loop 1: Revenue Pressure (Displacement-Demand Feedback)

| Property | Value |
|---|---|
| ID | `displacement_demand` |
| File | loopDefinitions.ts:18-105 / loopSimulations.ts:130-187 |
| Color | #EF4444 |
| **Inputs (config fields)** | gdpGrowthRate (exogenous), revenuePressureSensitivity, revenuePressureCap, revenuePressureDecay, aiWageProductivityMultiplier, phillipsCurveSensitivity, capabilities.* |
| **Outputs** | gdp_growth, revenue_pressure, automation_acceleration, displacement_rate, unemployment, wage_income, consumption |
| Nodes (7) | dl_gdp_growth, dl_revenue_pressure, dl_auto_accel, dl_displacement, dl_unemployment, dl_wage_income, dl_consumption |
| Edges (7) | GDP→pressure(neg), pressure→accel(pos), accel→displ(pos), displ→UE(pos), UE→wages(neg), wages→consumption(pos), cons→GDP(pos) |
| Tunable params (4) | gdpGrowthRate (-0.15..0.05), sensitivity (0.5-3.0), cap (0.10-0.50), decay (0.30-0.70) |
| Entry | `simulateDisplacementDemand(params)` |

### Loop 2: Phillips Curve (Wage-Price)

| Property | Value |
|---|---|
| ID | `phillips_curve` |
| File | loopDefinitions.ts:111-198 / loopSimulations.ts:202-252 |
| Color | #F59E0B |
| Inputs | unemploymentRate, phillipsCurveSensitivity, naturalRate, aiWageProductivityMultiplier, aiCostParams, postTaxMPCs |
| Outputs | excess_ue, phillips_pressure, ai_premium, wage_pressure, nominal_wages, consumption |
| Nodes (7) | pc_unemployment, pc_excess_ue, pc_phillips, pc_ai_premium, pc_wage_pressure, pc_nominal_wages, pc_consumption |
| Edges (7) | UE→excess(pos), excess→phillips(neg), phillips→wage_pressure(pos), ai_premium→wage_pressure(pos), wages→cons(pos), cons→UE(neg) |
| Tunable params (5) | unemploymentRate (0.03-0.30), phillipsSensitivity (0.05-0.30), naturalRate (0.03-0.06), automationCoverage (0-1.0), aiWageMultiplier (0-1.5) |
| Entry | `simulatePhillipsCurve(params)` |

### Loop 3: Demand Spillover

| Property | Value |
|---|---|
| ID | `demand_spillover` |
| File | loopDefinitions.ts:204-293 / loopSimulations.ts:266-323 |
| Color | #6366F1 |
| Inputs | mpcWage, mpcAsset, mpcTransfer, displacementPct, consumerDemandInvestmentSensitivity, demandFeedbackSensitivity |
| Outputs | income, consumption, investment, gov_spending, gdp, demand_ratios, employment |
| Nodes (7) | ds_income, ds_consumption, ds_investment, ds_gov_spending, ds_gdp, ds_demand_ratios, ds_employment |
| Edges (6) | income→cons(pos), cons→GDP(pos), invest→GDP(pos), gov→GDP(pos), GDP→ratios(pos), ratios→empl(pos), empl→income(pos) |
| Tunable params (4) | mpcWage (0.60-1.00), mpcAsset (0.15-0.50), mpcTransfer (0.70-1.00), displacementPct (0-0.50) |
| Entry | `simulateDemandSpillover(params)` |

### Loop 4: Credit Crunch

| Property | Value |
|---|---|
| ID | `credit_crunch` |
| File | loopDefinitions.ts:299-388 / loopSimulations.ts:338-423 |
| Color | #D97706 |
| Inputs | unemploymentRate, creditUESensitivity, maxCreditTightening, businessCreditGDPSensitivity |
| Outputs | consumer_credit, consumption_mult, consumption, gdp_gap, business_credit, investment |
| Nodes (7) | cc_unemployment, cc_consumer_credit, cc_consumption_mult, cc_consumption, cc_gdp_gap, cc_business_credit, cc_investment |
| Edges (7) | UE→cons_credit(pos), credit→cons(pos), cons→GDP_gap(pos), gap→biz_credit(pos), credit→invest(pos), invest→UE(neg) |
| Tunable params (4) | unemploymentRate (0.03-0.30), incomeAdequacySensitivity (2-15), maxCreditTightening (0.30-0.90), businessCreditGDPSensitivity (2-8) |
| Entry | `simulateCreditCrunch(params)` |

### Loop 5: Fiscal-Monetary

| Property | Value |
|---|---|
| ID | `fiscal_monetary` |
| File | loopDefinitions.ts:394-489 / loopSimulations.ts:438-490 |
| Color | #22C55E |
| Inputs | taxRate, gdpGrowthRate, interestRate, qeMonetizationRate |
| Outputs | revenue, deficit, debt_gdp, interest_expense, debt_service_ratio, monetization_rate, inflation, nominal_gdp |
| Nodes (8) | fm_revenue, fm_deficit, fm_debt_gdp, fm_interest, fm_debt_service, fm_monetization, fm_inflation, fm_nominal_gdp |
| Edges (8) | rev→deficit(neg), def→debt(pos), debt→interest(pos), int→DSR(pos), DSR→monetization(pos), mon→inflation(pos), infl→nomGDP(pos), nomGDP→rev(pos) |
| Tunable params (4) | taxRate (0.15-0.35), gdpGrowthRate (-0.10..0.05), interestRate (0.01-0.10), qeMonetizationRate (0-0.80) |
| Entry | `simulateFiscalMonetary(params)` |

### Loop 6: Housing Wealth

| Property | Value |
|---|---|
| ID | `housing_wealth` |
| File | loopDefinitions.ts:495-581 / loopSimulations.ts:510-552 |
| Color | #EC4899 |
| Inputs | wageGrowthRate, mortgageStressAmplifier, housingWealthMPC, displacementPct |
| Outputs | affordability, mortgage_stress, foreclosure_rate, housing_wealth, wealth_consumption, gdp |
| Nodes (7) | hw_wage_growth, hw_affordability, hw_mortgage_stress, hw_foreclosures, hw_housing_wealth, hw_consumption, hw_gdp |
| Edges (7) | wage_growth→affordability(pos), aff→stress(neg), stress→foreclosures(pos), forec→wealth(neg), wealth→cons(pos), cons→GDP(pos), GDP→wages(pos) |
| Tunable params (4) | wageGrowthRate (-0.15..0.05), mortgageStressAmplifier (0.1-1.0), housingWealthMPC (0.01-0.10), displacementPct (0-0.50) |
| Entry | `simulateHousingWealth(params)` |

---

## 30. Parameter timeline & autopilot

**Three-layer resolution:** `userOverride > autopilot > baseline` (sticky forward)

| Layer | Source | Notes |
|---|---|---|
| `baseline` | SimulationConfig sliders | static config |
| `autopilot` | computeAutopilotParameters | endogenous from debt/inflation |
| `userOverride` | per-year manual input | sticky forward |
| `effective` | resolved final value | what simulation actually uses |
| `source` | enum | 'baseline' / 'autopilot' / 'override' |

### YearParameters tracked categories (39 params total)

| Category | Count | Examples |
|---|---|---|
| Fiscal Consolidation | 5 | fiscalDiscretionaryMultiplier, fiscalObligationMultiplier, fiscalRevenueMultiplier, effectiveColaDampeningFactor, consolidationIntensity |
| Tax Rates | 4 | effectiveIncomeTaxRate, effectivePayrollTaxRate, effectiveCorporateTaxRate, effectiveCapitalGainsTaxRate |
| Monetary | 2 | qeMonetizationRate, maxFinancialRepressionRate |
| Federal Reserve | 3 | taylorInflationCoeff, taylorOutputGapCoeff, taylorEmploymentGapCoeff |
| Policy Programs | 5 | ubiEnabled, ubiMonthlyAmount, wageSubsidyEnabled, wageSubsidyPercentage, swfEnabled, equityEnabled |
| Technology (read-only) | 3 | generativeCapabilityLevel, agenticCapabilityLevel, embodiedCapabilityLevel |
| Supply Chain | 17 | supplyChainAiChips, resilienceAiChips, regulatoryFriction, etc. |

**Resolver:** `resolveAllParameters(year, config, autopilot, overrides, profileName, capabilityLevels) → YearParameters`

### Autopilot logic

`computeAutopilotParameters(laggedDebtGDP, prevCIF, profile, baselineTaxRates, year?, scConfig?, onshoringFraction?)` computes:
1. **Fiscal Consolidation** — linear ramp on debt/GDP gap → spending/revenue multipliers
2. **COLA Dampening** — caps CIF growth above colaDampeningThreshold
3. **Effective Tax Rates** — `baseline × revenueMultiplier`
4. **Supply Chain Autopilot** (Phase 9) — time-evolved resilience, pass-through, dynamic composition

### Trigger thresholds (per fiscal profile)

| Threshold | Source | Used by |
|---|---|---|
| `consolidationThreshold` (varies 0.50-2.5) | FiscalPolicyProfile | computeFiscalConsolidation |
| `consolidationMaxThreshold` (threshold+0.5 to 10.0) | FiscalPolicyProfile | computeFiscalConsolidation |
| `colaDampeningThreshold` (varies 1.5-5.0) | FiscalPolicyProfile | COLA logic |
| `colaDampeningMaxCIF` (varies 3.5-10.0) | FiscalPolicyProfile | COLA logic |
| `consolidationLag` (0-4 years) | FiscalPolicyProfile | debt history lookback |

---

## 31. Store state & actions (Zustand)

**File:** `src/stores/simulationStore.ts` (1004 lines, Zustand v5 + subscribeWithSelector + persist)

### Persisted state (sessionStorage)

| Field | Type | Default | Mutations |
|---|---|---|---|
| `config` | SimulationConfig | getDefaultSimulationConfig() | updateConfig, loadScenario, importCSVConfig, setCapabilityParam, ... |
| `currentYear` | number | config.startYear | setCurrentYear, setStartYear, setEndYear |
| `controlsPanelOpen` | boolean | true | setControlsPanelOpen |
| `insightsPanelOpen` | boolean | true | setInsightsPanelOpen |
| `activeView` | DashboardView | 'overview' | setActiveView |
| `selectedClusterId` | string \| null | null | setSelectedCluster |
| `selectedStateCode` | StateCode \| null | null | setSelectedState |
| `comparisonStateCodes` | StateCode[] | [] | addComparisonState, removeComparisonState, clearComparisonStates |
| `stateMapMetric` | enum | 'displacement' | setStateMapMetric |
| `compareMode` | boolean | false | toggleCompareMode |
| `comparisonPolicyConfigs` | array | [] | setComparisonSlot, addComparisonSlot, removeComparisonSlot |
| `parameterOverrides` | Record<string, number> | {} | setParameterOverride, removeParameterOverride, clearParameterOverrides |
| `fiscalComparisonProfile` | string \| null | null | setFiscalComparisonProfile |

### Non-persisted state

| Field | Type | Default | Notes |
|---|---|---|---|
| `timeline` | SimulationTimeline | computed | recomputed on every config change |
| `baselineTimeline` | SimulationTimeline \| null | null | computed without overrides for comparison |
| `isPlaying` | boolean | false | playback toggle |
| `presentationMode` | boolean | false | full-viewport overlay |
| `presentationStep` | number | 0 | slide index |
| `onboardingComplete` | boolean | localStorage flag | first-time tutorial |
| `onboardingStep` | number | 0 | tutorial progress |
| `fiscalOnboardingComplete` | boolean | localStorage | fiscal tutorial |
| `fiscalOnboardingStep` | number | 0 | fiscal tutorial progress |
| `blsDataLoaded` | boolean | computed at init | BLS Phase 3 |
| `blsDataError` | string \| null | computed | error message |
| `blsMetadata` | BLSMetadata \| null | computed | data provenance |
| `blsWarnings` | string[] | computed | warnings |
| `stateDataLoaded` | boolean | computed | state Phase 6 |
| `showBaselineComparison` | boolean | false | toggleBaselineComparison |

### Module-level state (Phase 8b)

`currentParameterOverrides` — module-level Map; restored on rehydrate via `onRehydrateStorage`. Avoids threading overrides through every recompute() call.

### Key actions (40+ total)

| Category | Actions |
|---|---|
| Timeline | setStartYear, setEndYear, setCurrentYear, togglePlay, stopPlay |
| Capability | setCapabilityParam(vector, param, value) |
| Cluster/State | setActiveView, setSelectedCluster, setSelectedState, setStateMapMetric, addComparisonState, removeComparisonState, clearComparisonStates |
| State Policy | setStatePolicyOverride, resetStatePolicyOverride |
| BFCS | setBFCSThreshold, resetClusterBFCS, resetRoleBFCS |
| Policy | setPolicyPreset, togglePolicy, updatePolicyParam, resetPolicyToDefaults |
| Compare | toggleCompareMode, setComparisonSlot, addComparisonSlot, removeComparisonSlot |
| Panels | setControlsPanelOpen, setInsightsPanelOpen |
| Presentation | togglePresentationMode, setPresentationStep, nextPresentationStep, prevPresentationStep |
| Onboarding | setOnboardingComplete, setOnboardingStep, setFiscalOnboardingComplete, setFiscalOnboardingStep |
| Scenario | loadScenario(config), importCSVConfig(csvString), updateConfig(updater) |
| Parameter Override | setParameterOverride(paramKey, year, value), removeParameterOverride, clearParameterOverrides, resetYearOverrides |
| Fiscal Response | setFiscalPolicyPreset, setFederalReservePreset, setFiscalDimension, setFedDimension, toggleBaselineComparison |
| Profile Compare | setFiscalComparisonProfile |
| Reset | resetToDefaults() |

### Recompute pattern

Every config-mutating action calls `recompute()`, which runs `runSimulation(config, blsBaselines, blsMetadata, stateDataMap, parameterOverrides)` and stores the result in `timeline`. ~5-10ms per run on modern hardware.

---

## 32. Government data baselines

**Loaded from:** `src/data/loadGovernmentData.ts` → `govData` object (50+ fields)

### BEA NIPA (`src/data/bea/`)

| Field | Source JSON | Default | Unit |
|---|---|---|---|
| `gdpNominal` | gdp-components.json | $29.0T | dollars |
| `consumptionRatio` | gdp-components.json | 0.681 | ratio |
| `investmentRatio` | gdp-components.json | 0.175 | ratio |
| `governmentRatio` | gdp-components.json | 0.18 | ratio |
| `netExportRatio` | gdp-components.json | -0.03 | ratio |
| `wageShare` | personal-income.json | 0.60 | ratio |
| `assetShare` | personal-income.json | 0.20 | ratio |
| `transferShare` | personal-income.json | 0.20 | ratio |
| `effectiveIncomeTaxRate` | government-receipts.json | 0.132 | rate |
| `effectivePayrollRate` | government-receipts.json | 0.136 | rate |
| `effectiveCorporateTaxRate` | government-receipts.json | 0.14 | rate |
| `effectiveCapGainsRate` | manual | 0.165 | rate |
| `corporateRetentionRate` | government-receipts.json | 0.40 | ratio |
| `baselineProfitGDPRatio` | government-receipts.json | 0.11 | ratio |

### BLS (`src/data/bls/`)

| Field | Source JSON | Default | Unit |
|---|---|---|---|
| `totalEmployment` | total-employment.json | 158,316,000 | persons (CES) |
| `cpsEmployment` | cps-employment.json (FRED) | 163,949,000 | persons (CPS) |
| `laborForce` | labor-force.json | 168,000,000 | persons |
| `unemploymentRate` | unemployment-rate.json | 0.041 | ratio |
| `avgWeeklyHours` | labor-market.json | 34.3 | hours/week |
| `avgHourlyEarnings` | labor-market.json | $35.50 | $/hour |
| `baseInflationRate` | cpi-sector-indices.json | 0.025 | ratio |
| `cpiSectorWeights` | cpi-sector-weights.json | per-sector | fraction map |
| `cpiSectorInflation` | cpi-sector-indices.json | per-sector | object map |

### FRED (`src/data/fred/`)

| Field | Source JSON | Default | Unit |
|---|---|---|---|
| `m2Velocity` | m2-velocity.json | 1.2 | ratio (PY/M) |
| `fredNairuRate` | nairu.json | 0.044 | ratio |
| `fedFundsRate` | fed-funds-rate.json | 0.045 | rate |
| `mortgageDelinquencyRate` | mortgage-delinquency.json | 0.0178 | ratio |
| `mortgageRate30yr` | mortgage-rate-30yr.json | 0.0617 | rate |
| `caseShillerIndex` | case-shiller-national.json | 328.15 | index |
| `housingStarts` | housing-starts.json | 1,358,500 | annual |
| `baselineShelterInflation` | cpi-shelter.json | 0.035 | rate |
| `mortgageSpread` | computed | 0.017 | rate |
| `federalDebtTotal` | federal-debt.json (optional) | 36,000,000 | $millions |
| `treasuryYield10Y` | treasury-yield-10y.json (optional) | 0.043 | rate |
| `baselineDeficitGDPRatio` | deficit-gdp-ratio.json (optional) | 0.06 | ratio |
| `bbbCorporateSpread` | bbb-corporate-spread.json (optional) | 0.015 | rate |
| `federalInterestOutlays` | federal-interest-outlays.json (optional) | $1.05T | dollars |
| `corporateProfitsAfterTax` | corporate-profits-after-tax.json (optional) | $3.0T | dollars |
| `federalCorpTaxReceipts` | federal-corp-tax-receipts.json (optional) | $420B | dollars |
| `sp500Level` | sp500.json (optional) | 5800 | index |

### Scenario templates (`src/data/scenarioTemplates.ts`)

8 pre-built configurations: `baseline`, `aggressive-ai-gridlock`, `nordic-model`, `austerity-response`, `fed-monetization`, `gradual-ubi`, `stress-test`, `bipartisan-compromise`. Each defines fiscal profile + parameter overrides.


---

## 33. ⚠️ Flagged items (consolidated)

### ⚠️ DUPLICATE DEFINITION

| ID | Items | Status | Recommendation |
|---|---|---|---|
| D1 | `MPC_WAGE` (constants.ts:319 = 0.80) vs `DEFAULT_POST_TAX_MPC_WAGE` (constants.ts:1927 = 0.95) | DEPRECATED constant retained for compat. Different concept (pre-tax vs post-tax). | No fix needed; verify no callers use deprecated. |
| D2 | `MPC_ASSET` (0.35) vs `DEFAULT_POST_TAX_MPC_ASSET` (0.42) | Same — pre vs post tax | Same |
| D3 | `MPC_TRANSFER` (0.90) vs `DEFAULT_POST_TAX_MPC_TRANSFER` (0.95) | Same | Same |
| D4 | `AI_COST_COMPOSITION` (constants.ts:1942-1947 DEPRECATED) vs `DEPLOYMENT_COST_COMPOSITION` (constants.ts:2169-2174) | Phase 9 refactor; field names changed (inference→compute, etc.) | Verify no callers use old constant. |
| D5 | `CREDIT_INVESTMENT_SENSITIVITY` (0.35) | RESOLVED — no UI divergence in source: the control reads `config.creditInvestmentSensitivity ?? CREDIT_INVESTMENT_SENSITIVITY` (CreditFinancialControls.tsx); the recorded "1.2" does not exist in the codebase (stale audit capture, the D23 class) | None |
| D6 | `CREDIT_CONSUMPTION_SENSITIVITY` (0.06) | RESOLVED — same pattern, same verification; recorded "1.5" not in source | None |
| D7 | `CREDIT_UE_SENSITIVITY` (8.0) | RESOLVED — same; recorded "3.0" not in source | None |
| D8 | `MAX_CREDIT_TIGHTENING` const (0.70) vs UI default (0.70) | Match | None |
| D9 | `BOTTOM80_WAGE_SHARE` (0.45) | RESOLVED — `?? BOTTOM80_WAGE_SHARE` pattern; recorded "0.52" not in source | None |
| D10 | `BOTTOM80_TRANSFER_SHARE` (0.78) | RESOLVED — same class | None |
| D11 | `BOTTOM80_ASSET_SHARE` (0.12) | RESOLVED — same class | None |
| D12 | `DEFAULT_INFERENCE_ANNUAL_CHANGE` (−0.45) | RESOLVED — same class | None |
| D13 | `BASELINE_SHELTER_CPI_WEIGHT` (0.36) | RESOLVED — same class | None |
| D14 | `DEFAULT_SHELTER_INFLATION_STICKINESS` (0.80) | RESOLVED — same class | None |
| D15 | `DEFAULT_FORECLOSURE_LAG` (0.75) | RESOLVED — same class | None |
| D16 | `DEFAULT_AI_PRODUCTION_INVESTMENT_FRACTION` (0.30) | RESOLVED — same class | None |
| D17 | `DEFAULT_AI_PRODUCTION_ONSHORING_FRACTION` (0.10) | RESOLVED — same class | None |
| D18 | `DEFAULT_NEW_JOB_WAGE_FRACTION` (0.70) | RESOLVED — same class | None |
| D19 | `DEFAULT_AI_PE_SENSITIVITY` (100) | RESOLVED — same class; no "multiplier form" mapping exists, the constant is the default | None |
| D20 | `DEFAULT_TRADITIONAL_PE_SENSITIVITY` (60) | RESOLVED — same class | None |
| D21 | `DEFAULT_AI_PROFIT_MARGIN` (0.25) | RESOLVED — same class | None |
| D22 | `DEFAULT_TRADITIONAL_PROFIT_MARGIN` (0.11) | RESOLVED — same class | None |
| D23 | `BASELINE_INCOME_TAX_RATE` vs a recorded UI/autopilot default | RESOLVED — claim not found: no 0.145 exists in source. One chain: `config.taxConfig?.incomeTaxRate ?? BASELINE_INCOME_TAX_RATE` = `govData.effectiveIncomeTaxRate`, derived ≈ 0.1242 from the committed BEA table (personalCurrentTaxes / totalPersonalIncome, 2025 vintage). The "~0.132" this row previously recorded was a retired parse-failure fallback literal, never the live derived value. | None |
| D24 | `BASELINE_CAPITAL_GAINS_RATE` (0.165) | RESOLVED — same class; recorded "0.20" not in source | None |
| D25 | `DEFAULT_POPULATION_GROWTH_RATE` (0.004) | RESOLVED — same class; recorded "0.007" not in source | None |
| D26 | Tax rates: `autopilot.ts:45-50` baseline vs `constants.ts` BASELINE_*_RATE | Both referenced; autopilot reads config, falls back to constants | Acceptable design |
| D27 | Inflation: `netInflation` (macro.ts:1502) vs deprecated `computePriceLevel` | Resolved Phase 5g; deprecated function in comments only | None |
| D28 | ARPP vs CWI: old function in comments; current uses CWI | Resolved Phase 5g | None |
| D29 | `inflationFromTransfers` (Phase 5g) vs `inflationFromMonetization` (Phase 7) | Resolved Phase 7 | None |
| D30 | `BASELINE_AVERAGE_ANNUAL_WAGE` (per-capita) vs `BASELINE_WAGE_INCOME` (aggregate) | Different aggregation levels — not a duplicate | None |
| D31 | `DEFAULT_TRAINING_COMPOSITION` (cost-driven) vs `DEFAULT_PROCUREMENT_SHARES` (procurement-driven) | Used in costVsProcurementBlend; intentional | None |

**D5–D25 RESOLVED (one-pass sweep at the engagement close-out).** Every flagged parameter resolves through `config.<field> ?? NAMED_CONSTANT` — the named constant IS the UI default; no control hardcodes a numeric default for any of these fields (verified by pattern search over components, stores, and hooks). The divergent "UI defaults" previously recorded here were stale captures from an earlier automated audit — the same failure class as the resolved D23 row. Decision record: [the audit summary](../FABLE_AUDIT_SUMMARY.md).

### ⚠️ ORPHAN (defined but never read)

| ID | Variable | Defined in | Notes |
|---|---|---|---|
| O1 | `DEFAULT_WAGE_ELASTICITY` | constants.ts:269 | No readers in src/. Likely dead code from displacement model refactor (Phase 8 quadratic formula). |
| O2 | `BASELINE_REAL_GDP_2025` | constants.ts:386 | macro.ts uses BASELINE_GDP_NOMINAL_2025 everywhere; possibly legacy reference. |
| O3 | `FEDERAL_REVENUE_GDP_RATIO` | constants.ts:1018 | Marked as Phase 7 fallback but only referenced in comment, not active computation. |
| O4 | `DEBT_ROLLOVER_RATE` | constants.ts:1123 | DEPRECATED (Phase 8 Fix 3); replaced by `computeEndogenousRolloverRate`. |
| O5 | `SIGMOID_STEEPNESS` | constants.ts:1256 | DEPRECATED (Phase 8 Fix 3); old sigmoid-on-level model replaced. |
| O6 | `BASE_PE_ZERO_GROWTH` | constants.ts:852 | Imported into macro.ts:118 but no active reader. Dynamic P/E computed differently. |
| O7 | `MPC_WAGE` / `MPC_ASSET` / `MPC_TRANSFER` | constants.ts:319-339 | DEPRECATED, kept for backward compat. No active readers in current macro.ts. |
| O8 | `BASELINE_DEBT_INTEREST` | constants.ts:1869 | DEPRECATED; fiscal.ts now computes endogenously. |
| O9 | `BASELINE_CPI_2024` | constants.ts:120 | DEPRECATED Phase 5h; CPI now loaded from govData. |
| O10 | `productivityToHeadcountRatio` (per-cluster optional field) | OccupationCluster type | DEPRECATED; replaced by quadratic capability formula. |
| O11 | `taskAutomatableFraction` (per-cluster optional field) | OccupationCluster type | DEPRECATED; replaced by adoption/capability model. |
| O12 | `policyConfig.workWeekReduction` (entire subtree) | policy.ts:75-78 | Type/config exists but NO computation logic in models/policy.ts. Hidden from UI. |
| O13 | `policyConfig.ubi.phaseOut` | policy.ts:269-270 | DEFINED but NOT APPLIED. Needs per-capita income tracking. |
| O14 | `EQUITY_CONCENTRATION_TOP10` | constants.ts:1244 | Defined for inequality model but not currently consumed in computeMacro. |
| O15 | `corporateTaxEffectiveness` | types/index.ts:1325 | UI binding exists (FiscalMonetaryControls), but unclear if read in current corporateTaxRevenue calc. ⚠️ VERIFY usage in macro.ts |
| O16 | `AGE_THRESHOLD_FRACTIONS` (12 entries) | constants.ts:68-80 | Verify policy.ts → computeUBIEligibility uses all 12 keys (not just subset) |
| O17 | `DOMAIN_RISK_FACTORS` (14-15 entries) | constants.ts:1469-1493 | Verify bfcs.ts → computeSaferScore covers all categories |

### ⚠️ UNDEFINED SOURCE (used but definition not located in audit)

| ID | Variable | Used in | Status |
|---|---|---|---|
| U1 | `SECTOR_CPI_WEIGHTS` | macro.ts:237 | Definition is at constants.ts:603 (`buildSectorCPIWeights(govData.cpiSectorWeights)`) — verified after audit. |
| U2 | `SECTOR_DEFLATION_INTENSITY` | macro.ts:230 | Defined at constants.ts:526-594. Verified. |
| U3 | `currentCapabilityScores` | equityMarket.ts:45 | Sourced from adoption module (passed in). Verified. |
| U4 | `costParams` (AICostParams) | macro.ts | Type exists but config field is optional; UI binding via MonetaryPricesControls.tsx exposes nested aiCostParams. Verify config flow. |
| U5 | `supplyChainParams` | bfcs.ts; adoption.ts | Optional Phase 9 config; UI exposes via SupplyChainControls. Verify all defaults are wired. |
| U6 | `AI GDP year-0 initialization` | simulation.ts | Computed implicitly in macro.ts on each call; not stored in baseline. Risk: initialization state could differ from year-1 result. |

### ⚠️ UI BINDING — NO ENGINE CONNECTION (or weak connection)

| ID | Control | File | Status |
|---|---|---|---|
| UI1 | Velocity Sensitivity | MonetaryControls.tsx:43-52 | ✓ CONNECTED to monetary.ts:42 |
| UI2 | Base Inflation Rate | MonetaryControls.tsx:53-62 | ✓ CONNECTED to macro.ts:1524 |
| UI3 | Neutral Real Rate | FiscalMonetaryControls.tsx:166-175 | ✓ CONNECTED to federalReserve.ts:119 |
| UI4 | Term Premium | FiscalMonetaryControls.tsx:176-185 | ✓ CONNECTED to bondMarket.ts:409 |
| UI5 | Inflation Convergence | FiscalMonetaryControls.tsx:186-195 | ✓ CONNECTED to bondMarket.ts:250 |
| UI6 | Fiscal Dom. Threshold | FiscalMonetaryControls.tsx:218-227 | ✓ CONNECTED to federalReserve.ts:199 |
| UI7 | Fiscal Dom. Dampening | FiscalMonetaryControls.tsx:228-237 | ✓ CONNECTED to federalReserve.ts:202 |
| UI8 | Risk Premium Max | FiscalMonetaryControls.tsx:240-249 | ✓ CONNECTED to bondMarket.ts:89 |
| UI9 | Trajectory/Sustainability/Level Weights | FiscalMonetaryControls.tsx:250-289 | ✓ CONNECTED to bondMarket.ts:133 |
| UI10 | **Corp. Tax Effectiveness** | FiscalMonetaryControls.tsx:292-301 | ⚠️ IMPORTED into macro.ts but possibly not used in corporateTaxRevenue calc. **VERIFY** |
| UI11 | Foreign Treasury Demand | FiscalMonetaryControls.tsx:302-311 | ✓ CONNECTED to bondMarket.ts:412 |
| UI12 | AI P/E Multiplier | FiscalMonetaryControls.tsx:312-321 | ✓ CONNECTED to equityMarket.ts:126 |
| UI13 | Credit UE/Investment/Consumption | FinancialMarketsControls.tsx:63-92 | ✓ CONNECTED to macro.ts:668-698 |
| UI14 | Demand Feedback | FinancialMarketsControls.tsx:93-102 | ✓ CONNECTED to macro.ts:638 |
| UI15 | Supply Chain controls (~40 sliders) | SupplyChainControls.tsx | ⚠️ Phase 9 not fully integrated; verify config persists in scenario saves |
| UI16 | All capability sliders (12) | CapabilityControls.tsx | ✓ CONNECTED to capabilities.ts |
| UI17 | All BFCS sliders (~165 × 4) | BFCSEditor / BFCSRoleEditor | ✓ CONNECTED to bfcs.ts |
| UI18 | All policy keyframe editors (9 fields) | PolicyKeyframeEditor | ✓ CONNECTED to policy.ts |
| UI19 | `policyConfig.workWeekReduction` controls | (commented out in PolicyControls.tsx:99) | ⚠️ ORPHAN — UI removed because no model logic |
| UI20 | `policyConfig.ubi.phaseOut` controls | (hidden) | ⚠️ ORPHAN — UI hidden because not applied |

### ⚠️ INCONSISTENCIES & ANOMALIES

| ID | Issue | Details | Status |
|---|---|---|---|
| I1 | `BASELINE_UNEMPLOYMENT` uses CPS not CES | constants.ts:513 — `US_LABOR_FORCE - BASELINE_CPS_EMPLOYMENT` | Intentional per comment (CPS for unemployment matching) |
| I2 | `EMPLOYMENT_MULTIPLIERS['other_uncategorized']` overridden at runtime | constants.ts:1421 sets to SIMPLE_AVG_EMPLOYMENT_MULTIPLIER; runtime recomputes employment-weighted | Intentional fallback design |
| I3 | `COGNITIVE_SENSITIVITY` / `EMBODIED_SENSITIVITY` are hardcoded 6×4 matrices | No config override exposed | Intentional — model architecture, not user-tunable |
| I4 | `SimulationConfig` has 100+ optional fields | Many nested types | Intentional but high UX complexity |
| I5 | Capability vector consolidation (8 → 3) | DEFAULT_CAPABILITY_TRAJECTORIES contains 3 vectors only; old 8-vector system in comments | Intentional Phase 8 refactor |
| I6 | BLS baseline normalization happens once | simulation.ts:484-505 — only first iteration; no re-normalization | Intentional per FIX 6 comment |
| I7 | `PASS_THROUGH_TRAJECTORY` is hardcoded | constants.ts:2139-2143 — keyframe array, not user-editable | Could be configurable; minor concern |
| I8 | `computeEndogenousRolloverRate` | fiscal.ts:313-351 — complex sigmoid logic, hard to validate | Well-documented; reasonable model |
| I9 | `SAFETY_IMPROVEMENT_RATE` value mismatch | constants.ts:1462 (one source said 0.1, another said 0.5) | ⚠️ VERIFY constant value |
| I10 | `CAPABILITY_VECTOR_METADATA` UI defaults | CapabilityControls UI shows different midpoint years (2027/2031/2033) than constants (2033/2038/2043) | ⚠️ VERIFY which is authoritative |
| I11 | Late-binding IIFE constants | constants.ts:1234, 1907, 490, 1967 — IIFE pattern for cross-reference | Intentional; correct |

### ⚠️ DEPRECATED but still exported (15+ items)

These are intentionally retained for backward compat but should be reviewed:
- `MPC_WAGE`, `MPC_ASSET`, `MPC_TRANSFER` (constants.ts:319-339)
- `AI_COST_COMPOSITION` (constants.ts:1942)
- `DEBT_ROLLOVER_RATE` (constants.ts:1123)
- `SIGMOID_STEEPNESS` (constants.ts:1256)
- `BASELINE_CPI_2024` (constants.ts:120)
- `BASELINE_DEBT_INTEREST` (constants.ts:1869)
- `BASELINE_REAL_GDP_2025` (constants.ts:386 — possibly orphan)
- `policyConfig.workWeekReduction` (policy.ts:75-78)
- `policyConfig.ubi.phaseOut` (policy.ts:269-270)
- `productivityToHeadcountRatio` (cluster type)
- `taskAutomatableFraction` (cluster type)
- `inflationFromTransfers` mechanism (Phase 5g)
- `computeARPP` function (Phase 5g, comment-only)
- `computePriceLevel` (Phase 5g, comment-only)
- `computeNominalWageGrowth` (Phase 8 Fix 5, comment-only)

---

## 34. Summary statistics

| Category | Count | Notes |
|---|---|---|
| **SimulationConfig top-level fields** | 92 | counted in audit |
| **SimulationConfig nested type fields** | 50+ | across PolicyConfig, SupplyChainConfig, TaxConfig, PostTaxMPCs, AICostParams |
| **constants.ts named constants** | 200+ | grouped into 38 sections (C1-C38) |
| **macro.ts variables (defined or computed)** | ~380 | 2450 lines, hundreds of state vars and derivations |
| **simulation.ts top-level state vars** | 7 | previousMacro, previousFundSize, previousMoneySupply, previousTransferInflation, debtGDPHistory, triggerYears, baselines |
| **Capability vectors** | 3 | generative, agentic, embodied (Phase 8 consolidation) |
| **Capability S-curve params** | 12 | 4 (floor/ceiling/steepness/midpoint) × 3 vectors |
| **Occupation clusters** | 51 | full taxonomy in occupationClusters.ts |
| **Roles (cluster × role)** | ~165 | 3-5 roles per cluster, BFCS thresholds per role |
| **BFCS dimensions** | 4 | Better, Faster, Cheaper, Safer |
| **Per-role BFCS thresholds** | ~660 | 4 thresholds × ~165 roles |
| **BFCS scoring constants** | 8 | inference speed, parallelism, safety, domain risk factors |
| **Deployment types** | 4 | software, robotics, autonomous_vehicle, hybrid |
| **Adoption steepness constants** | 4 | one per deployment type |
| **Displacement formula components** | 5 | adoptionRate, weightedCapability, displacementPct, headcountMult, wageMult |
| **Employment multipliers (per cluster)** | ~44 | EMPLOYMENT_MULTIPLIERS map |
| **New job creation params** | 3 | innovationRate, rdMultiplier, jobPersistenceFactor |
| **MPC values** | 3 (active) + 3 (deprecated) | post-tax + housing wealth + UE sensitivity |
| **Income share weights** | 6 | wage/asset/transfer (national) + bottom-80 versions |
| **CWI computed metrics** | 5 | CWI, growthRate, acceleration, medianCWI, medianGrowth |
| **Inflation components** | 7 | base, AI deflation, transfer monetization, demand, min wage, credit, scarcity |
| **Sector deflation/CPI weight maps** | 50+ | per cluster |
| **Housing CSV columns** | 25 | Phase 5i |
| **Monetization Cases** | 6 | ZLB, financial repression, fiscal dominance, yield-responsive, LOLR, taper |
| **Federal Reserve presets** | 4 | price_stability, balanced_mandate, employment_focused, maximum_accommodation |
| **Fiscal policy presets** | 5 | austerity, tax_the_winners, balanced_reduction, gridlock, no_fiscal_response |
| **Fiscal dimensions** | 4 + 2 (Fed) | spending/revenue, safety net, timing, speed + inflation/employment, bond market |
| **Tracked YearParameters (Phase 8b)** | 39 | across 7 categories |
| **Supply chain inputs** | 7 | aiChips, energyPrice/Capacity, training/inferenceDC, robotics, software |
| **Supply chain resilience factors** | 5 | aiChips, energy, trainingDC, inferenceDC, roboticsHardware |
| **Supply chain effects on BFCS** | 8 | capability delay, cost mults, BFCS mults, hysteresis, cascade |
| **Sensitivity matrices** | 2 | COGNITIVE_SENSITIVITY, EMBODIED_SENSITIVITY (6×4 each) |
| **Policy programs (in PolicyConfig)** | 9 | minimumWage, wageSubsidy, workWeekReduction (deprecated), SWF, profitSharing, UBI, enhancedUI, retraining, plus aggregations |
| **Policy schedule fields (PolicySchedule)** | 9 | federalMinimum, subsidyPercentage, standardHours, annualContribution, ownershipFraction, mandatorySharePercentage, monthlyAmount, replacementRate, stipendMonthly |
| **Tax channels** | 4 | income, payroll, corporate, capital gains |
| **US states modeled** | 51 | 50 + DC |
| **Scenario templates** | 8 | baseline, nordic-model, austerity-response, fed-monetization, etc. |
| **Government data fields** | 50+ | from BEA + BLS + FRED |
| **CSV export columns** | ~291 base + 48×7 per-cluster ≈ 627 | full simulation output |
| **Feedback loop simulators** | 6 | displacement_demand, phillips_curve, demand_spillover, credit_crunch, fiscal_monetary, housing_wealth |
| **UI control files** | ~40 | in src/components/controls/ |
| **UI sliders** | ~150 | across all control panels |
| **Store state fields** | 20+ | persisted + non-persisted |
| **Store actions** | 40+ | timeline, capability, BFCS, policy, fiscal, etc. |
| **Test files** | 43 | 999 tests passing |
| **Deprecated constants/fields still exported** | 15+ | for backward compatibility |
| **Likely orphans (no readers)** | 5-10 | flagged in section O |
| **Confirmed duplicates** | 0 | all overlaps are intentional pre/post-tax or refactor pairs |
| **Constant↔UI default mismatches needing verification** | 21 | items D5-D25 above |

---

## Audit metadata

**Method:** 6 parallel exploration agents covering different subsystems, then compiled by main thread.

**Subsystem coverage:**
1. Constants & types (constants.ts, types/*.ts)
2. Capability/adoption/displacement (capabilities.ts, adoption.ts, bfcs.ts, displacement.ts, newJobs.ts, occupationClusters.ts)
3. Macro/monetary/financial (macro.ts, monetary.ts, monetization.ts, equityMarket.ts, bondMarket.ts, federalReserve.ts)
4. Fiscal/policy/orchestrator (policy.ts, fiscal.ts, fiscalDimensions.ts, fiscalResponseProfiles.ts, multipliers.ts, simulation.ts, autopilot.ts, parameterResolution.ts, stateSimulation.ts, supplyChain.ts)
5. UI bindings & store (simulationStore.ts, all components/controls, feedbackLoops/*)
6. Data files & CSV (stateData.ts, scenarioTemplates.ts, loadGovernmentData.ts, csvExport.ts)

**Limitations:**
- File:line citations were captured during a single audit pass; line numbers will drift as code changes.
- Some cross-references between agents could not be fully reconciled (e.g., constant defaults vs UI defaults; see flagged items D5-D25 — these may be agent inference errors and need source verification).
- Phase 9 supply chain integration is in-flight; some bindings may not yet flow end-to-end.
- The audit favored breadth over depth in `macro.ts` (2450 lines, hundreds of variables) and `simulation.ts` (2402 lines). Deeper passes may surface additional state vars not captured here.
- Per-cluster data values (51 clusters × ~10 fields each) are not enumerated individually; only the OccupationCluster type is documented. Use `occupationClusters.ts` directly for per-cluster values.
- Per-role BFCS thresholds (~660 values) are not enumerated individually; only the threshold structure and override mechanism is documented.

**Recommended next audit steps:**
1. ⚠️ Verify items D5-D25 — check whether constant defaults vs UI defaults are real discrepancies or audit inference errors.
2. ⚠️ Verify `corporateTaxEffectiveness` (UI10) — confirm it is or is not consumed in `computeMacro`.
3. ⚠️ Verify SAFETY_IMPROVEMENT_RATE (I9) value.
4. ⚠️ Verify CapabilityControls UI midpoint year defaults (I10).
5. ⚠️ Confirm orphans O1-O14 by grep — true orphans should be removed or re-wired.
6. Confirm Phase 9 supply chain config persists in scenario saves and CSV exports.
7. Re-verify per-cluster `EMPLOYMENT_MULTIPLIERS` coverage (44+ entries) against the 51-cluster taxonomy.
8. Decide whether deprecated constants D1-D3 (MPC_*) and the 15+ deprecated items in section "DEPRECATED" should be removed in a Phase 9 cleanup.

---

## Phase 10.A Additions (2026-04-19)

### New primitives

| Variable | Type | Defined in | Default | Readers | Writers | UI binding | Unit |
|---|---|---|---|---|---|---|---|
| `OccupationCluster.automationShare` | state | `types/index.ts:152` | seeded by `initializeClusterAlphaDefaults` from `EMBODIED_CLUSTER_ALPHA_DEFAULTS` or `DEFAULT_COGNITIVE_ALPHA = 0.5` | `computeEffectiveAlpha` via baseline lookup; `effectiveClusters` applies overrides | `occupationClusters.ts:initializeClusterAlphaDefaults`; `simulation.ts:effectiveClusters` (from `config.clusterAutomationShareOverrides`) | `AlphaControls.tsx` per-cluster slider | `[0, 1]` |
| `RoleDefinition.automationShareOverride` | param | `types/index.ts:101` | `undefined` | `computeEffectiveAlpha` as `role.automationShareOverride ?? cluster.automationShare` | `simulation.ts:effectiveClusters` (from `config.roleAutomationShareOverrides`) | `AlphaControls.tsx` per-role override | `[0, 1]` |
| `RoleDefinition.aiReplacementDifficultyFriction` | param | `types/index.ts:108` | `ROLE_AI_REPLACEMENT_DIFFICULTY_FRICTION_DEFAULTS[c][r]` or `FALLBACK_REPLACEMENT_DIFFICULTY_FRICTION = 0.25` | `findTriggerYear` for adoption-delay shift; `simulation.ts` trigger-year assignment | `initializeClusterAlphaDefaults`; `effectiveClusters` from `config.roleReplacementDifficultyFrictionOverrides` | Pending Phase 5.1 per-role editor | `[0, 1]` |
| `RoleDefinition.aiReplacementDifficultyWagePremium` | param | `types/index.ts:116` | `ROLE_AI_REPLACEMENT_DIFFICULTY_WAGE_PREMIUM_DEFAULTS[c][r]` or `FALLBACK_REPLACEMENT_DIFFICULTY_WAGE_PREMIUM = 0.30` | `computeBaseAdoptionRate` (tail-drag exponent); `computeClusterDisplacement` (cluster scarcity premium aggregate) | `initializeClusterAlphaDefaults`; `effectiveClusters` from `config.roleReplacementDifficultyWagePremiumOverrides` | Pending Phase 5.1 per-role editor | `[0, 1]` |
| `RoleDefinition.aiReplacementDifficulty` | state | `types/index.ts:97` | `(friction + wagePremium) / 2` auto-populated | **No active readers** post-cleanup; retained for diagnostic continuity | `initializeClusterAlphaDefaults` (writer only) | — | `[0, 1]` — **DEPRECATED** |

### New driver params (AlphaDriverParams interface)

| Variable | Default | Range | UI binding |
|---|---|---|---|
| `capabilityWeight` | 0.20 | [0, 0.5] | `AlphaControls.tsx` |
| `trustWeight` | 0.15 | [0, 0.5] | `AlphaControls.tsx` |
| `competitiveWeight` | 0.25 | [0, 0.5] | `AlphaControls.tsx` |
| `marginWeight` | 0.15 | [0, 0.5] | `AlphaControls.tsx` |
| `slackWeight` | 0.10 | [0, 0.5] | `AlphaControls.tsx` |
| `capabilityActivationThreshold` | 0.60 | [0.2, 0.95] | `AlphaControls.tsx` |
| `trustHalfLifeYears` | 5 | [1, 20] | `AlphaControls.tsx` |

### New top-level config params

| Variable | Default | Range | UI binding |
|---|---|---|---|
| `augmentationAdoptionSteepness` | `DEFAULT_AUGMENTATION_ADOPTION_STEEPNESS = 0.8` | [0.1, 2.0] | `AugmentationAndScarcityControls.tsx` |
| `inferenceCostCurve` | `DEFAULT_INFERENCE_COST_CURVE = {floor: 0.001, k: 0.50, decayExponent: 0.7}` | — | `InferenceCostCurveControls.tsx` |
| `scarcityIntensity` | `DEFAULT_SCARCITY_INTENSITY = 0.4` | [0, 1.0] | `AugmentationAndScarcityControls.tsx` |
| `competitivePressureThreshold` | `DEFAULT_COMPETITIVE_PRESSURE_THRESHOLD = 0.2` | [0.05, 0.5] | `AugmentationAndScarcityControls.tsx` |
| `replacementMultiplier` | `DEFAULT_REPLACEMENT_MULTIPLIER = 2.0` | [0.5, 10.0] | `AugmentationAndScarcityControls.tsx` |
| `maxAdoptionFrictionYears` | `DEFAULT_MAX_ADOPTION_FRICTION_YEARS = 5.0` | [0, 15] | `AugmentationAndScarcityControls.tsx` |

### New MacroOutput fields

| Variable | Type | Defined by | Readers |
|---|---|---|---|
| `corporateMarginRatio` | derived | `computeMacro` = `corporateProfits / gdpNominal` (guard 0) | `computeEffectiveAlpha` via `previousMacro.corporateMarginRatio` |
| `aiDisplacementUnemployment` | state | `simulation.ts` cumulative across years, override via `macroWithJobs` | `computeWagePressure` aiShare derivation |

### New BFCSScores diagnostic fields (optional, populated by simulation.ts)

| Variable | Type | Purpose |
|---|---|---|
| `alpha` | derived | Effective α for the role this year |
| `alphaDecomposition` | derived | Per-driver contributions (for sanity review + UI) |
| `augAdoptionRate` | derived | Augmentation adoption S-curve rate |
| `effectiveTriggerYearShift` | derived | `friction × maxAdoptionFrictionYears` — surfaces friction delay to UI |

### New ClusterDisplacementResult fields

| Variable | Type | Purpose |
|---|---|---|
| `effectiveAlpha` | derived | Employment-weighted mean α across cluster roles |
| `scarcityPremiumContribution` | derived | Cluster's contribution to aggregate Phillips Mechanism 2 premium |
| `aggregateReplacementDifficultyWagePremium` | derived | Employment-weighted mean of role `wagePremium` |
| `wageAdjustmentFromScarcity` | derived | Fed into `priorYearWageAdjustmentByCluster` for next year's Cheaper score |

### Deprecated constants (retained with `// DEPRECATED:` comments)

| Constant | Replacement |
|---|---|
| `DEFAULT_INFERENCE_ANNUAL_CHANGE` | `DEFAULT_INFERENCE_COST_CURVE` (used inside `computeCheaperScore`; legacy constant still exported for audit) |
| `AI_PRODUCTIVITY_MULTIPLIER_BY_DEPLOYMENT` | first-principles productivity formula inside `computeAIProductionExpansion` (`1 + weightedCapability × betterScore × replacementMultiplier × (1 + cheaperScore)`) |
| `AI_WAGE_PRODUCTIVITY_MULTIPLIER` | `DEFAULT_SCARCITY_INTENSITY` (Phillips Mechanism 2 scarcity premium replaces hump-shaped AI premium) |

### Internal (non-exported) constants

| Constant | Location | Purpose |
|---|---|---|
| `AUGMENTATION_VIABILITY_THRESHOLD = 0.1` | `src/models/augmentationAdoption.ts` module-local `const` | Triggers augmentation S-curve when `betterScore × cheaperScore > 0.1`. **Not a user knob** — never exposed to constants.ts, SimulationConfig, store, or UI. |
| `SCARCITY_WAGE_SMOOTHING` | **Removed per user sign-off.** One-year lag via `priorYearWageAdjustmentByCluster` is the sole damping mechanism. If oscillation is observed in the sanity table, surface for user decision rather than damp silently. |

### Sanity-table references

Phase 10.A sanity-table generator: `scripts/generate-phase10a-sanity-table.test.ts`. Run via `npx vitest run scripts/generate-phase10a-sanity-table.test.ts`. Output: `docs/Phase10A-sanity-table.md`. Golden-master SHA-256 printed to stdout.

---

**END OF VARIABLE REGISTRY**
