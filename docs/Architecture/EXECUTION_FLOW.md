# ATLAS Execution Flow Document

**Audit date:** 2026-04-07
**Scope:** Read-only trace of the ATLAS simulation engine — entry point, per-year computation order, feedback loop wiring, and data flow boundaries.
**Source files traced:** `src/stores/simulationStore.ts`, `src/models/simulation.ts` (2402 lines), `src/models/macro.ts` (2450 lines), `src/services/dataLoader.ts`, `src/data/loadGovernmentData.ts`, `src/utils/csvExport.ts`, `src/hooks/*`.

**How to read this document:** Line numbers refer to the source files at audit time and will drift as code changes. Code snippets are copied verbatim except where elided with `// ...`.

---

## Part A — Simulation Entry Point and Call Graph

### A.1 — Top-level entry

There is **no "Run" button**. The simulation is reactive: every config mutation in the Zustand store triggers `recompute()`, which calls `runSimulation()` synchronously. The result is stored in `state.timeline`, and React components re-render via `useSimulationStore` selectors.

**Module-level initialization** (runs once at app load, in this order):

1. **`src/services/dataLoader.ts:110`** — `loadBLSData()` synchronously imports static JSON from `src/data/bls/*.json` (Vite resolves at build time). Optional state-level OEWS/LAUS files use `import.meta.glob({ eager: true })` so missing files don't break the build.
2. **`src/data/loadGovernmentData.ts`** — same pattern: synchronously imports BEA/BLS/FRED JSON into a single `govData` object that `constants.ts` reads at module load.
3. **`src/stores/simulationStore.ts:68`** — calls `loadBLSData()`, then `transformOEWSToBaselines()`, then `createOtherClusterBaseline()`, then optionally `deriveStateOccupationDistributions()` + `populateStateDistributions()`. Result is held in module-level variables `blsBaselines`, `blsMetadataResult`, `stateDataMapResult`.
4. **`src/stores/simulationStore.ts:334`** — `const initialTimeline = recompute(defaultConfig)` runs the first simulation before the store is even created.
5. **`src/stores/simulationStore.ts` (middle)** — Zustand store is created via `create(persist(subscribeWithSelector(...)))` with the initial state.

**Reactive entry point:** `src/stores/simulationStore.ts:150` — `recompute()`

```typescript
function recompute(config: SimulationConfig, parameterOverrides?: Record<string, number>): SimulationTimeline {
  const overridesObj = parameterOverrides ?? currentParameterOverrides;
  let overrideMap: Map<string, number> | undefined;
  if (Object.keys(overridesObj).length > 0) {
    overrideMap = new Map(Object.entries(overridesObj));
  }
  return runSimulation(
    config,
    OCCUPATION_CLUSTERS,
    blsBaselines ?? undefined,
    stateDataMapResult ?? undefined,
    overrideMap,
  );
}
```

`recompute()` is called from ~20+ store actions (e.g., `setStartYear`, `setCapabilityParam`, `togglePolicy`, `setFiscalPolicyPreset`, `setParameterOverride`, `loadScenario`, `importCSVConfig`, etc.). Each action mutates `config`, calls `recompute()`, and replaces `state.timeline` in a single Zustand `set()` call.

### A.2 — `runSimulation()` call graph

**Defined at:** `src/models/simulation.ts:429`

```typescript
export function runSimulation(
  config: SimulationConfig,
  clusters: OccupationCluster[],
  blsBaselines?: Map<string, OccupationBaseline>,
  stateDataMap?: Map<StateCode, StateData>,
  userOverrides?: UserOverrideMap,
): SimulationTimeline
```

**Returns:** `SimulationTimeline` containing `years: SimulationYearOutput[]`, `summary`, `parameterTimeline`, `yearSnapshots`.

The function is synchronous, pure (no I/O), and ~1700 lines long. It splits into a setup phase (lines 429–697) and a year loop (lines 699–2122).

#### Setup phase (lines 429–697) — runs once before any year is simulated

| Step | Line | Operation | Calls / Reads | Writes |
|---|---|---|---|---|
| S1 | 437–440 | Initialize per-year carry state | — | `previousMacro=null`, `previousFundSize`, `previousMoneySupply=BASELINE_MONEY_SUPPLY`, `previousTransferInflation=0` |
| S2 | 444–449 | Resolve fiscal/Fed combined profile | `resolveCombinedProfile(fiscalPolicyPreset, federalReservePreset, custom)` | `fiscalProfile` |
| S3 | 452 | Init debt history | — | `debtGDPHistory: number[] = []` |
| S4 | 455–457 | Set up parameter override map and timeline storage | `getBaselineTaxRates(config)` | `overrides`, `parameterTimeline`, `yearSnapshots`, `baselineTaxRates` |
| S5 | 463–469 | Initialize per-cluster, per-role trigger year tracker | iterate clusters | `triggerYears: Record<clusterId, Record<roleId, year\|null>>` (all null) |
| S6 | 473–482 | Build baseline employment/wage map per cluster | `getBaselineFromBLS()` (preferred) or `estimateBaselineForCluster()` (fallback) | `baselines: Map<clusterId, {employments, wages}>` |
| S7 | 487–503 | **FIX 6 normalization:** scale baseline employment so sum = `BASELINE_TOTAL_EMPLOYMENT` (158.3M) | iterate baselines | mutates `baselines` in place |
| S8 | 509–521 | **FIX C:** compute actual baseline weighted-average wage | iterate baselines | `actualBaselineAverageWage` |
| S9 | 524–545 | Build `secondOrderParams` from config (with constant fallbacks) | — | `secondOrderParams: SecondOrderEffectParams` |
| S10 | 548–549 | Init milestone trackers | — | `depressionOnsetYear=null`, `monetaryCollapseYear=null` |
| S11 | 554 | Init baseline CWI placeholder | — | `baselineCWI: number\|null = null` |
| S12 | 562–612 | Build `effectiveClusters` (Phase 5h Fix 9): override `employmentMultiplier` from `EMPLOYMENT_MULTIPLIERS` constant; apply employment-weighted average for `other_uncategorized`; normalize cluster demand shares | iterate clusters | `effectiveClusters: OccupationCluster[]` (copies) |
| S13 | 615 | Init nominal GDP history (for rolling demand) | — | `nominalGDPHistory: number[] = []` |
| S14 | 618 | Init dynamic velocity baseline | — | `baselineConsumption: number\|null = null` |
| S15 | 624–626 | Init demand spillover baselines | — | `demandBaselineRealC/G/I: number\|null = null` |
| S16 | 636 | Init capacity gate baseline | — | `capturedBaselineCreditFunded: number\|null = null` |
| S17 | 639–642 | Init Phase 6 credit baselines | — | `baselineHouseholdIncome=null`, `baselineCorporateProfits=null`, `creditBaselineCWI=null` |
| S18 | 645 | Init AI GDP at UBI start year | — | `startYearAiGDP=0` |
| S19 | 648–655 | Init Phase 7 fiscal-monetary carry state | — | `previousFiscalMonetary=null`, `previousDebtStock=INITIAL_FEDERAL_DEBT`, `previousWeightedAvgDebtRate=INITIAL_WEIGHTED_AVG_DEBT_RATE`, `previousMarketCap=0`, `historicalMaxCapabilityChange=0`, `prevCorporateProfitsForEquity`, `prevPrevCorporateProfitsForEquity`, `previousCapabilityScores=null` |
| S20 | 661–663 | Init Phase 8 Fix 5 housing carry state | — | `homePriceIndex=1.0`, `previousMortgageRate=undefined` |
| S21 | 666–674 | Init Phase 9 supply chain carry state | — | `adoptionState: AdoptionState`, `chipSupplyHistory=[]`, `cumulativeCapabilityDelay`, `supplyChainShockHistory`, `cognitiveProgress=0`, `embodiedProgress=0` |
| S22 | 677–696 | Init Phase 5i housing quintile state | `mapClustersToQuintiles(clusterWageData)` | `dynamicHomeownership: number[]` (5 quintiles), `displacementHistory: Array<Map>`, `clusterQuintileMap` |

#### Year loop body (lines 699–2122) — runs once per year `t` from `startYear` to `endYear`

This is the per-timestep sequence (Part B below). It calls these external functions in order:

```
runSimulation()                                          [simulation.ts:429]
└── for year = startYear ... endYear:                    [line 699]
    ├── computeSupplyChainEffects()                      [supplyChain.ts; called at line 718]
    ├── applyPropagationLags()                           [supplyChain.ts; called at line 731]
    ├── getAllCapabilityScores()                         [capabilities.ts; called at line 735]
    ├── interpolatePolicy()                              [policyInterpolation.ts; line 759]
    ├── for each cluster in effectiveClusters:           [line 774]
    │   ├── computeWeightedCapability()                  [bfcs.ts/displacement.ts; line 787]
    │   ├── for each role:                               [line 813]
    │   │   ├── computeFasterMultiplier() + computeSaferMultiplier()  [supplyChain.ts; lines 827, 831]
    │   │   ├── checkAdoptionTrigger()                   [bfcs.ts; line 838]
    │   │   ├── computeEffectiveAlpha()                  [alphaDrivers.ts; line 1050] — Phase 10.A 5-driver α
    │   │   ├── computeHysteresisWidth() + computeAdoptionDrag()  [supplyChain.ts/adoption.ts; line 856-858]
    │   │   ├── computeStatefulAdoptionRate() OR getAdoptionRate()  [adoption.ts; line 861/875]
    │   │   └── (push roleBFCSOutput)
    │   ├── computeClusterDisplacement()                 [displacement.ts; line 1154] — disp = adoption × weightedCap × α (Phase 10.A V2)
    │   └── for each role (augmentation pass):           [line 1231]
    │       └── computeAugmentationAdoption()            [augmentationAdoption.ts; line 1238] — pre-BFCS logistic S-curve (better × cheaper > 0.1 trigger)
    ├── computeAggregateDisplacement()                   [displacement.ts; line 948]
    ├── computeAutomationCoverageFromClusters()          [newJobs.ts; line 953]
    ├── (inline) demand spillover loop                   [lines 957-1035] — Loop 3
    ├── (inline) labor supply withdrawal + scarcity      [lines 1066-1124]
    ├── getEffectiveUBI()                                [policy.ts; line 1078]
    ├── computePolicyEffects()                           [policy.ts; line 1049]
    ├── computeSectorWeightedDeflation()                 [macro.ts; line 1135]
    ├── (inline) min wage cost-push                      [lines 1146-1158]
    ├── computeNewJobMetrics()                           [newJobs.ts; line 1164]
    ├── computeAIProductionExpansion()                   [simulation.ts:363]
    ├── updateHomeownership()                            [macro.ts; line 1204] — Loop 6 (lagged)
    ├── computeMortgageStressIndex()                     [macro.ts; line 1212]
    ├── --- PHASE 7 FISCAL-MONETARY BLOCK ---            [lines 1217-1696] — Loop 5
    │   ├── getBaseline*State() x 5                      [year 0 only]
    │   ├── getBaselineAutopilot() OR computeAutopilotParameters()  [autopilot.ts; line 1248]
    │   ├── resolveAllParameters()                       [parameterResolution.ts; line 1256]
    │   ├── (year > 0):
    │   │   ├── computeEndogenousRevenue()               [fiscal.ts; line 1284]
    │   │   ├── computeGovernmentSpending()              [fiscal.ts; line 1305]
    │   │   ├── computeDebtAccumulation()                [fiscal.ts; line 1319]
    │   │   ├── computeFullEmploymentGDP()               [federalReserve.ts; line 1348]
    │   │   ├── computeTaylorRule()                      [federalReserve.ts; line 1364]
    │   │   ├── interpolatePolicy() (policy rate override) [policyInterpolation.ts; line 1378]
    │   │   ├── computeFiscalDominance()                 [federalReserve.ts; line 1381]
    │   │   ├── computeMonetizationRate()                [monetization.ts; line 1393]
    │   │   ├── computeDynamicVelocity()                 [monetary.ts; line 1413]
    │   │   ├── computeMoneyCreation()                   [monetization.ts; line 1445]
    │   │   ├── computeExpectedPolicyRates()             [federalReserve.ts; line 1462]
    │   │   ├── computeFiscalRiskPremium()               [bondMarket.ts; line 1494]
    │   │   ├── computeForeignDemand()                   [bondMarket.ts; line 1514]
    │   │   ├── computeAbsorptionCapacity()              [bondMarket.ts; line 1535]
    │   │   ├── computeTenYearYield()                    [bondMarket.ts; line 1548]
    │   │   ├── computeRateTransmission()                [bondMarket.ts; line 1564]
    │   │   ├── computeGrowthMomentum()                  [equityMarket.ts; line 1579]
    │   │   ├── computeEquityValuation()                 [equityMarket.ts; line 1588]
    │   │   ├── computeEndogenousRolloverRate()          [fiscal.ts; line 1604]
    │   │   └── computeWeightedAverageDebtRate()         [fiscal.ts; line 1615]
    │   └── (assemble fiscalMonetaryOutput)
    ├── computeMacro()                                   [macro.ts; line 1844] ← MAIN MACRO CALL
    │   ├── (internal) computeRevenuePressure()          [macro.ts:475] — Loop 1
    │   ├── (internal) computeWagePressure()             [macro.ts:293] — Loop 2
    │   ├── (internal) computeConsumerCreditConditions() [macro.ts:730] — Loop 4 (consumer)
    │   ├── (internal) computeBusinessCreditConditions() [macro.ts:836] — Loop 4 (business)
    │   ├── (internal) housing wealth effect             [macro.ts:1881-1941] — Loop 6 (effect)
    │   ├── (internal) compositeInflation, priceLevel, GDP, CWI computations
    │   └── returns MacroOutput
    ├── computeDynamicVelocity()                         [monetary.ts; line 1940 — SECOND CALL]
    ├── computeMonetaryState()                           [monetary.ts; line 1972]
    ├── computeRequiredAssetOwnership()                  [policy.ts; line 2009]
    ├── computeRequiredTransferLevel()                   [policy.ts; line 2019]
    ├── computeStateOutputs()                            [stateSimulation.ts; line 2037] (Phase 6)
    ├── (assemble SimulationYearOutput, push to years[])  [line 2076]
    ├── previousMacro = macroWithJobs                    [line 2092]
    ├── previousFiscalMonetary = fiscalMonetaryOutput    [line 2093]
    └── previousMortgageRate = fm.bondMarket.mortgageRate [line 2094]
```

After the loop ends, `runSimulation()` calls `computeSummary(years)` (`simulation.ts:2243`) which builds the `SimulationSummary` (depression onset, peak employment, prep window, fiscal window, GDP peak, valley, recovery, monetary collapse), and returns the full `SimulationTimeline`.

---

## Part B — Per-Timestep Computation Order

The complete sequence executed for each year `t`. Numbers refer to source line in `src/models/simulation.ts` unless noted.

### Step-by-step (year `t` advancing from `t-1`)

| # | Line | Operation | Reads from year… | Writes |
|---|---|---|---|---|
| 1 | 702–710 | Compute dynamic population & labor force (compounding from `t=startYear`) | `config.totalPopulation`, `config.populationGrowthRate` | `dynamicPopulation`, `dynamicLaborForce`, `laborForceGrowthFactor` |
| 2 | 712–732 | **Phase 9:** Compute supply chain effects → cumulative capability delays. Calls `computeSupplyChainEffects()` and `applyPropagationLags()` | `previousMacro?.automationCoverage` (**t-1**), `supplyChainShockHistory` | `scEffects`, `cumulativeCapabilityDelay`, `scLaggedInputs` |
| 3 | 734–738 | **Capability S-curves:** `getAllCapabilityScores(year, config.capabilities, scEffects?.cumulativeCapabilityDelay)` for all 3 vectors | `config.capabilities`, supply chain delay | `capabilityScores: {generative, agentic, embodied}` |
| 4 | 740–756 | **⚠️ Loop 1 input:** read `previousMacro?.automationAcceleration` (**t-1**) and `previousMacro?.businessCreditTightening` (**t-1**); compute combined `automationAcceleration` (capped at `revenuePressureCap`) | `previousMacro` (**t-1**) | `baseAutomationAcceleration`, `creditAdoptionAcceleration`, `automationAcceleration` |
| 5 | 758–764 | Compute min wage early (interpolated from PolicySchedule, indexed to `previousMacro?.priceLevel` (**t-1**)) | `config.policyConfig.minimumWage`, `previousMacro?.priceLevel` (**t-1**) | `effectiveMinWageEarly`, `annualMinWage`, `policyWageFloor` |
| 6 | 770–945 | **CLUSTER LOOP** — for each `effectiveCluster`: | | |
|   | 787 | Compute weighted capability for cluster (uses current-year `capabilityScores`) | `capabilityScores` (**t**) | `weightedCapability` |
|   | 813 | **ROLE LOOP** — for each role in cluster: | | |
|   | 838 | `checkAdoptionTrigger(cluster, role, year, capabilityScores, thresholds, aiCostParams, scBFCSParams)` | `capabilityScores` (**t**) | `triggered`, `scores` |
|   | 844–846 | If first triggered: write `triggerYears[cluster][role] = year` | — | `triggerYears` |
|   | 1050–1068 | **Phase 10.A — α 5-driver model:** `computeEffectiveAlpha({cluster, role, year, weightedCapability, triggerYear, previousYearPeerAlpha, currentCorporateMargin, baselineCorporateMargin, unemploymentRate, naturalRate, params})` → effective automation share for this role. Drivers: capability-sigmoid, trust-ramp, peer pressure, margin compression, labor slack (subtracted). Attaches `scores.alpha` + `alphaDecomposition` to BFCS output. | `previousYearPeerAlpha` (**t-1**), `previousMacro?.corporateMargin` (**t-1**), `previousMacro?.unemploymentRate` (**t-1**) | `roleAlphas[role.id]`, `nextAlphaByRole[cluster][role]` |
|   | 851–881 | Compute adoption rate. Phase 9 path: `computeStatefulAdoptionRate()`. Default path: `getAdoptionRate(year, triggerYear, deploymentType, lag, geoRiskExposure, params, automationAcceleration + minWageAdoptionBonus, ...)` | `automationAcceleration` (computed at step 4 from **t-1**), `triggerYears`, `adoptionState` (**t-1**) | `adoptionRates[role.id]`, mutates `adoptionState` |
|   | 1154–1163 | `computeClusterDisplacement(cluster, adoptionRates, scaledEmployments, baseline.wages, weightedCapability, roleAlphas, wageElasticity, scarcityIntensity)` — **Phase 10.A V2 formula** `disp = adoptionRate × weightedCapability × α` (α from step above, replacing the deprecated quadratic `weightedCapability²`). Aggregates per-cluster scarcity premium from `aiReplacementDifficultyWagePremium`. | `roleAlphas` (**t**), adoption rates (**t**), baseline employment | `clusterDisplacement: ClusterDisplacementResult` (with `effectiveAlpha`, `scarcityPremiumContribution`, `aggregateReplacementDifficultyWagePremium`) |
|   | 915–942 | Accumulate `totalAutomationDividend` from cluster cost savings (Phase 9 fix) | adoption rates, displacement | `totalAutomationDividend` |
|   | 1229–1275 | **Phase 10.A — augmentation pass** (separate role loop, runs when `augMultiplier > 0`): `computeAugmentationAdoption({year, betterScore, cheaperScore, augTriggerYear, steepness})`. Logistic S-curve with viability trigger `better × cheaper > 0.1` (independent of BFCS replacement trigger). On first trigger writes `augTriggerYears[cluster][role] = year`. Accumulates `clusterAugmentationOutput = augmentedRemaining × wage × (better × cheaper × augMultiplier)` and `augmentedHeadcountByCluster` (pure [0,1] fraction). Attaches `scores.augAdoptionRate` to BFCS output. | `betterScore`, `cheaperScore` from BFCS (**t**), `augTriggerYears` (**t-1**) | `augResult.augAdoptionRate`, `totalAugmentationOutput`, `augmentationByCluster`, `augmentedHeadcountByCluster`, `augTriggerYears` |
| 7 | 947–948 | `computeAggregateDisplacement(clusterResults)` → `aggregate` (totals across all clusters) | `clusterResults` (**t**) | `aggregate: { totalDirectDisplacement, weightedAverageWage, ... }` |
| 8 | 950–955 | `computeAutomationCoverageFromClusters(clusterResults, scaledBaselineEmployment)` | `clusterResults` (**t**) | `automationCoverage` |
| 9 | **957–1035** | **⚠️ Loop 3 (Demand Spillover):** read `previousMacro?.consumption`, `governmentSpending`, `investment`, `priceLevel` (**all t-1**); compute real demand ratios vs year-0 baselines; apply tolerance band; constrain employment per cluster | `previousMacro` (**t-1**), `effectiveBaseC/G/I` (year-0 captured) | `consumerDemandRatio`, `govDemandRatio`, `businessDemandRatio`, `dampedDemandRatioForInvestment`, `totalAfterSpillover`, `aggregateDemandSurvival`, `clusterDemandSurvivalMap` |
| 10 | 1037–1040 | Compute `effectiveUnemployment` from demand-constrained employment | `totalAfterSpillover` (**t**), `dynamicLaborForce` (**t**) | `effectiveUnemployment` |
| 11 | 1042–1046 | Track AI GDP at UBI start year (one-time capture) | `previousMacro?.aiGDPContribution` (**t-1**) | `startYearAiGDP` |
| 12 | 1049–1062 | `computePolicyEffects()` — wage/asset/transfer policy aggregation (uses **t-1** prices, GDP, fund size) | `previousMacro?.priceLevel`, `previousMacro?.gdpNominal`, `previousMacro?.aiGDPContribution`, `previousFundSize` (**all t-1**) | `policyEffects`, mutates `previousFundSize` |
| 13 | 1066–1124 | **Inline scarcity & labor supply:** for each cluster, compute `voluntaryWithdrawalRate` from UBI elasticity, then `scarcityInflation` from `(demandForWorkers - effectiveLaborSupply) / demandForWorkers` weighted by employment share | `policyEffects.ubi` (computed at step 12), `clusterDemandSurvivalMap` (computed at step 9) | `scarcityInflation`, `voluntaryWithdrawalRate`, `totalEffectiveLaborSupply` |
| 14 | 1130–1138 | `computeSectorWeightedDeflation(clusterResults, year, mergedDeflationOverrides, clusterDeploymentMap, aiCostParams)` | `clusterResults` (**t**), `aiCostParams` | `sectorWeightedDeflationRate` |
| 15 | 1143–1158 | **Inline min wage cost-push inflation:** per cluster, if `annualMinWage > clusterAvgWage`, accumulate weighted overshoot | `clusterResults` (**t**), `annualMinWage` (**t**) | `minWageCostPush` |
| 16 | 1160–1171 | `computeNewJobMetrics(prevGDPForJobs, automationCoverage, totalDirectDisplacement, innovationRate, rdMultiplier, jobPersistenceFactor)` — **uses t-1 GDP** ("last year's investment creates this year's jobs") | `previousMacro?.gdpReal` (**t-1**), `automationCoverage` (**t**), displacement (**t**) | `newJobMetrics` |
| 17 | 1173–1176 | `computeAIProductionExpansion(clusterResults, effectiveClusters, capabilityScores, config)` | `clusterResults`, `capabilityScores` (**t**) | `aiProduction: { aiInvestmentBoost, aiNetExportBoost, aiConsumerGoodsPotential, totalAdditionalOutput }` |
| 18 | 1188–1209 | **⚠️ Loop 6 (homeownership update):** push current `yearDisp` into `displacementHistory[]`; call `updateHomeownership()` which uses LAGGED displacement (year `t - foreclosureLag`) | `displacementHistory` (current + history), `foreclosureLag` | mutates `dynamicHomeownership[]`, returns `hoResult.foreclosureRateAggregate` |
| 19 | 1211–1215 | `computeMortgageStressIndex(clusterResults, clusterQuintileMap, dynamicHomeownership, mortgageStressAmplifier)` | `clusterResults` (**t**), `dynamicHomeownership` (**t**, just updated) | `mortgageStressIndex` |
| 20 | **1217–1696** | **⚠️ Loop 5 (Phase 7 Fiscal-Monetary Block):** runs in 2 phases — year 0 uses baseline state; year > 0 runs the full chain. All inputs come from `previousMacro` (**t-1**) and `previousFiscalMonetary` (**t-1**). | `previousMacro` (**t-1**), `previousFiscalMonetary` (**t-1**), `debtGDPHistory`, `nominalGDPHistory` | `fiscalMonetaryOutput` (full FM state), mutates `previousDebtStock`, `previousWeightedAvgDebtRate`, `previousMarketCap`, `prevCorporateProfitsForEquity` |
|   | 1241–1264 | Compute autopilot params (`computeAutopilotParameters`) and resolve year params (`resolveAllParameters`) | `debtGDPHistory[laggedIndex]`, `previousMacro?.cumulativeInflationFactor` | `autopilotResult`, `yearParams`, write `parameterTimeline.set(year, ...)` |
|   | 1284–1302 | `computeEndogenousRevenue()` — uses **t-1** macro tax components | `previousMacro` tax fields | `revenue` |
|   | 1305–1316 | `computeGovernmentSpending()` with consolidation multipliers | `revenue`, `previousMacro?.gdpNominal` (**t-1**), `policyEffects.transferChannelAddition` (**t**), `previousDebtStock` | `spending` |
|   | 1319–1325 | `computeDebtAccumulation()` | `spending`, `revenue`, `previousDebtStock`, `previousMacro?.gdpNominal` (**t-1**) | `debtResult` |
|   | 1331–1359 | `computeFullEmploymentGDP()` and `outputGap` (using `prevMacroForFiscal.gdpReal` (**t-1**)) | `prevMacroForFiscal.gdpReal` (**t-1**) | `fullEmploymentGDP`, `outputGap` |
|   | 1361–1374 | `computeTaylorRule()` — uses **t-1** inflation and unemployment | `prevMacroForFiscal.compositeInflation` (**t-1**), `prevMacroForFiscal.unemploymentRate` (**t-1**) | `taylorPrescribed` |
|   | 1376–1389 | `computeFiscalDominance()` — uses current `spending.interestExpense` and `revenue.totalGovernmentRevenue` | `spending` (**t**), `revenue` (**t** computed from **t-1** tax base) | `fedResult: { policyRate, fiscalDominanceActive, ... }` |
|   | 1391–1409 | `computeMonetizationRate()` — uses `previousFiscalMonetary?.bondMarket.tenYearYield` (**t-1**) | `fedResult`, `debtServiceRevenueRatio`, `previousFiscalMonetary` (**t-1**) | `monetizationResult`, `monetizationRateVal` |
|   | 1411–1457 | `computeDynamicVelocity()` (FIRST call) and `computeMoneyCreation()` | `previousMoneySupply` (**t-1**), `prevMacroForFiscal.unemploymentRate` (**t-1**), `prevMacroForFiscal.consumption` (**t-1**) | `moneyResult` |
|   | 1459–1478 | `computeExpectedPolicyRates()` (10-year forward projection) | `prevCompositeInflation` (**t-1**), `prevUnemploymentRate` (**t-1**) | `expectedAvgPolicyRate` |
|   | 1480–1545 | `computeFiscalRiskPremium()` (trajectory + sustainability + level), `computeForeignDemand()`, `computeAbsorptionCapacity()` | `debtResult` (**t**), `previousWeightedAvgDebtRate` (**t-1**), `nominalGDPHistory`, `previousFiscalMonetary` (**t-1**) | `fiscalRiskResult`, `foreignDemandRatio`, `absorptionCapacity` |
|   | 1548–1561 | `computeTenYearYield()` | `fedResult.policyRate`, `expectedAvgPolicyRate`, `fiscalRiskPremium`, `moneyResult.bondFinancedDeficit`, `foreignDemandRatio`, `prevMacroForFiscal.gdpNominal` (**t-1**), `absorptionCapacity` | `yieldResult` |
|   | 1564–1571 | `computeRateTransmission()` — yields → mortgage rate, corporate rate | `yieldResult.tenYearYield` (**t**) | `rates: { mortgageRate, corporateBorrowingRate }` |
|   | 1574–1597 | `computeGrowthMomentum()` and `computeEquityValuation()` | `capabilityScores` (**t**), `previousCapabilityScores` (**t-1**), `prevMacroForFiscal.afterTaxCorporateProfits` (**t-1**), `prevCorporateProfitsForEquity` (lagged) | `equityResult`, mutates `historicalMaxCapabilityChange`, `previousCapabilityScores` |
|   | 1604–1622 | `computeEndogenousRolloverRate()` and `computeWeightedAverageDebtRate()` | `rawFiscalRiskPremium`, `yieldResult.tenYearYield`, `fedResult.policyRate`, `previousDebtStock`, `previousWeightedAvgDebtRate` | `rolloverResult`, `newWeightedAvgRate` |
|   | 1624–1696 | Assemble `fiscalMonetaryOutput` and update carry-forward state | — | `previousDebtStock`, `previousWeightedAvgDebtRate`, `previousMarketCap`, `prevCorporateProfitsForEquity`, `prevPrevCorporateProfitsForEquity` |
| 21 | 1701–1843 | Build `macroInputs: MacroInputs` — large struct that bundles everything `computeMacro()` needs. Includes injection of `inflationFromMonetization` from step 20, `mortgageRate`, `corporateBorrowingRate`, `marketReturn`, etc. | all of the above | `macroInputs` |
| 22 | **1844** | **`computeMacro(macroInputs)` — MAIN MACRO CALL** (Loops 1, 2, 4, 6 fire inside this) | `macroInputs` | `macro: MacroOutput` |
| 23 | 1847 | `nominalGDPHistory.push(macro.gdpNominal)` | — | `nominalGDPHistory` |
| 24 | 1850 | Update cumulative `homePriceIndex` from macro output | `macro.homePriceIndex` (**t**) | `homePriceIndex` |
| 25 | 1853–1896 | Build `macroWithJobs: MacroOutput` — merges newJobMetrics, demand spillover diagnostics, labor supply, homeownership quintiles, supply chain diagnostics into the final per-year macro output | `macro`, `newJobMetrics`, `aggregateDemandSurvival`, `dynamicHomeownership`, `scEffects` | `macroWithJobs` |
| 26 | 1899–1936 | **Year-0 baseline captures (one-time):** `baselineConsumption`, `demandBaselineRealC/G/I`, `baselineHouseholdIncome`, `baselineCorporateProfits`, `creditBaselineCWI`, `capturedBaselineCreditFunded` | `macro` (**t**) when `===null` | mutates the year-0 baselines |
| 27 | 1940–1954 | `computeDynamicVelocity()` (SECOND call, with current-year unemployment & consumption) and apply rate effect from `fm.federalReserve.policyRate` | `macro.unemploymentRate` (**t**), `macro.consumption` (**t**), `baselineConsumption`, `fm.federalReserve.policyRate` (**t**) | `dynamicVelocity` |
| 28 | 1971–1985 | `computeMonetaryState(priceLevel, gdpReal, aiDeflationRate, monetizedDeltaM, dynamicPopulation, 0, previousMoneySupply, dynamicVelocity)` | `macro` (**t**), `fm.monetization.moneyCreated`, `previousMoneySupply` (**t-1**) | `monetaryState`, mutates `previousMoneySupply`, `previousTransferInflation` |
| 29 | 1989–1991 | Capture `baselineCWI` from year 0 if `===null` | `macroWithJobs.consumerWelfareIndex` | `baselineCWI` |
| 30 | 2009–2027 | `computeRequiredAssetOwnership()` and `computeRequiredTransferLevel()` — answer "what ownership/transfer is needed to maintain year-0 CWI" | `baselineCWI`, `macroWithJobs`, `aggregate`, `dynamicPopulation`, `totalAIProfitsPerCapita` | mutates `policyEffects.requiredAssetOwnership`, `policyEffects.requiredTransferLevel` |
| 31 | 2030–2032 | Track depression onset year if `macroWithJobs.isDepression` | — | mutates `depressionOnsetYear` |
| 32 | 2034–2046 | `computeStateOutputs()` (Phase 6, optional) | `stateDataMap`, `clusterResults`, `macroWithJobs`, `policyEffects`, `config.stateOverrides` | `stateOutputs` |
| 33 | 2048–2068 | Re-update `fiscalMonetaryOutput.fiscal.effectiveCOLAFactor` from `macroWithJobs.cumulativeInflationFactor` (post-macro adjustment) | `macroWithJobs.cumulativeInflationFactor` (**t**), `fiscalProfile` | mutates `fiscalMonetaryOutput.fiscal.effectiveCOLAFactor` |
| 34 | 2070–2073 | `debtGDPHistory.push(fiscalMonetaryOutput.fiscal.debtGDPRatio)` | — | `debtGDPHistory` |
| 35 | 2076–2091 | Assemble `SimulationYearOutput` and push to `years[]` | all per-year computed state | `years.push(yearOutput)` |
| 36 | 2092–2094 | Update carry-forward state for next year: `previousMacro = macroWithJobs`, `previousFiscalMonetary = fiscalMonetaryOutput`, `previousMortgageRate = fm.bondMarket.mortgageRate` | — | mutates carry state |
| 37 | 2096–2122 | **Phase 9:** push current chip supply, update shock history, accumulate `cognitiveProgress` and `embodiedProgress` from current displacement | `clusterResults` (**t**), `scConfig.inputs` (**t**) | `chipSupplyHistory`, `supplyChainShockHistory`, `cognitiveProgress`, `embodiedProgress` |

### B.1 — What runs first vs. last

- **First (year `t`):** dynamic population growth (line 702)
- **Capability S-curves:** step 3 (line 735) — evaluated immediately after population
- **Last (year `t`, before next iteration):** Phase 9 supply chain progress accumulation (line 2122)
- **Last meaningful state mutation:** `previousMortgageRate = fm.bondMarket.mortgageRate` (line 2094)

### B.2 — When does each S-curve get evaluated?

- The 3 capability S-curves (`generative`, `agentic`, `embodied`) are all evaluated in a **single call** to `getAllCapabilityScores(year, config.capabilities, scEffects?.cumulativeCapabilityDelay)` at **step 3 (line 735)**, immediately after population growth and before any cluster-level work.
- Each call evaluates `S_v(t) = floor + (ceiling - floor) / (1 + exp(-steepness × (t - midpointYear - delay)))` for each vector.
- The adoption S-curve (per cluster-role) is evaluated inside the cluster loop at **step 6 (lines 861/875)**, using `getAdoptionRate(year, triggerYear, deploymentType, lag, ...)` or `computeStatefulAdoptionRate()` (Phase 9 path).
- The deflation drag S-curve (`computeDeflationDrag` in macro.ts) is evaluated **inside `computeMacro()`** at step 22.

### B.3 — When does each feedback loop fire?

| Loop | Step | Line | Lagged or instantaneous? |
|---|---|---|---|
| **Loop 1 — Revenue Pressure** | 4 (input) + 22 (recomputed inside macro.ts:1801–1807 via `computeRevenuePressure()`) | 740–756 / 1801 | **Lagged.** Reads `previousMacro.realGDPGrowthRate` (**t-1**) and `previousMacro.automationAcceleration` (**t-1**). Output `automationAcceleration` is used in step 6 of the SAME year to bump adoption rates. |
| **Loop 2 — Phillips Curve** | Inside computeMacro at step 22 (macro.ts:293, called ~1613) | 1844 | **Instantaneous within `computeMacro`.** Uses current-year `unemploymentRate` (computed earlier in macro.ts from current employment) → wage pressure → wage income → consumption — all in same year. |
| **Loop 3 — Demand Spillover** | 9 | 957–1035 | **Lagged.** Reads `previousMacro.consumption / governmentSpending / investment / priceLevel` (**all t-1**). Output `totalAfterSpillover` constrains current-year employment immediately at step 10. |
| **Loop 4 — Credit Crunch** | Inside computeMacro at step 22 (macro.ts:730 consumer, 836 business) | 1844 | **Lagged.** Reads previous-year real wage/transfer/asset income, previous corporate profits, previous home price changes, previous CWI. Output `consumerCreditMultiplier` and `businessCreditMultiplier` reduce current-year consumption and investment. |
| **Loop 5 — Fiscal-Monetary** | 20 (lines 1217–1696) | 1217–1696 | **Lagged.** All inputs are from `previousMacro` and `previousFiscalMonetary` (**t-1**). Outputs (`inflationFromMonetization`, `mortgageRate`, `corporateBorrowingRate`, `marketReturn`, `policyRate`) are injected into `macroInputs` for the SAME year's `computeMacro()` call at step 22 — **so the fiscal-monetary results affect the same year's GDP/inflation/wages.** |
| **Loop 6 — Housing Wealth** | 18–19 (homeownership/foreclosure update, lagged); inside computeMacro step 22 (housing wealth effect on consumption, instantaneous) | 1204 / 1844 | **Mixed.** Foreclosures use `displacementHistory[t - foreclosureLag]` (lagged 1-3 years). Wealth effect on consumption applies in same year via `housingWealthDrag` additive term. |

### B.4 — When is consumption / CWI computed?

- **Consumption** is computed inside `computeMacro()` at **step 22 (line 1844)**. Components:
  - `wageConsumption = afterTaxWageIncome × postTaxMpcWage` (macro.ts:1876)
  - `assetConsumption = afterTaxAssetIncome × postTaxMpcAsset` (macro.ts:1877)
  - `transferConsumption = afterTaxTransferIncome × postTaxMpcTransfer` (macro.ts:1878)
  - Total: `adjustedConsumption = baseConsumption × consumerCreditMultiplier × velocityMultiplier + housingWealthDrag` (macro.ts:1948–1951)
- **CWI** (`consumerWelfareIndex = totalIncome / (population × priceLevel)`) is computed inside `computeMacro()` at line ~2128–2170. It's part of the same step 22.
- **Required ownership / transfer** to maintain year-0 CWI is computed AFTER `computeMacro()` at step 30 (lines 2009–2027).

### B.5 — When is employment displacement computed?

- **Displacement is computed at step 6** (the cluster loop, lines 770–945), specifically in `computeClusterDisplacement()` per cluster.
- Aggregate displacement across all clusters: **step 7** (line 948).
- Employment is then **constrained again at step 9** by demand spillover (`totalAfterSpillover = sum(remainingEmployment × demandSurvivalRate)`).
- The `effectiveUnemployment` value used for policy and credit decisions is computed at **step 10** (line 1040) from `dynamicLaborForce - totalAfterSpillover - scaledNonClusterEmployed`.

### B.6 — Variables computed from current vs previous timestep

**⚠️ STALE READS — variables read from `t-1` while their `t` value is computed later in the same loop:**

| Variable | Read at step | `t-1` source | `t` source | Notes |
|---|---|---|---|---|
| `previousMacro.automationAcceleration` | step 4 (line 741) | `previousMacro` (**t-1**) | Recomputed inside `computeMacro()` at step 22 | Intentional. Displacement-demand feedback is lagged. |
| `previousMacro.businessCreditTightening` | step 4 (line 746) | `previousMacro` (**t-1**) | Recomputed inside `computeMacro()` at step 22 (Loop 4 business) | Intentional. Credit-driven AI adoption uses last year's credit conditions. |
| `previousMacro.priceLevel` | step 5 (line 761), step 9 (line 967) | `previousMacro` (**t-1**) | `macro.priceLevel` computed at step 22 | Intentional. Min wage indexing and demand-ratio deflation use prior price level. |
| `previousMacro.consumption / governmentSpending / investment` | step 9 (lines 961–963) | `previousMacro` (**t-1**) | `macro.consumption` etc. computed at step 22 | Intentional. Demand spillover is lagged. |
| `previousMacro.gdpNominal` | step 12 (line 1057), step 20 (line 1450 et al) | `previousMacro` (**t-1**) | `macro.gdpNominal` computed at step 22 | Intentional. Policy effects and fiscal block use last year's GDP. |
| `previousMacro.gdpReal` | step 16 (line 1163), step 20 (line 1358) | `previousMacro` (**t-1**) | `macro.gdpReal` computed at step 22 | Intentional. New job creation uses last year's GDP ("last year's investment creates this year's jobs"). |
| `previousMacro.aiGDPContribution` | step 11 (line 1045), step 12 (line 1060) | `previousMacro` (**t-1**) | `macro.aiGDPContribution` computed at step 22 | Intentional. UBI productivity indexing is one-year lagged. |
| `previousMacro.cumulativeInflationFactor` | step 20 (line 1242) | `previousMacro` (**t-1**) | `macro.cumulativeInflationFactor` computed at step 22 | Intentional. Autopilot reads last year's CIF. |
| `previousMacro.compositeInflation` | step 20 (line 1362) | `previousMacro` (**t-1**) | `macro.compositeInflation` computed at step 22 | Intentional. Taylor rule uses last year's inflation. |
| `previousMacro.unemploymentRate` | step 20 (line 1363) | `previousMacro` (**t-1**) | `macro.unemploymentRate` computed at step 22 | Intentional. Taylor rule uses last year's unemployment. |
| `previousMacro.afterTaxCorporateProfits` | step 20 (line 1587) | `previousMacro` (**t-1**) | `macro.afterTaxCorporateProfits` computed at step 22 | Intentional. Equity valuation uses last year's profits. |
| `previousFiscalMonetary.bondMarket.tenYearYield` | step 20 (lines 1403, 1537) | `previousFiscalMonetary` (**t-1**) | `yieldResult.tenYearYield` computed in same step 20 | Intentional. Yield-responsive monetization (Case 5) explicitly uses prior year's yield to avoid circular reference. |
| `previousFiscalMonetary.equityMarket.marketReturn` | step 20 (line 1520) | `previousFiscalMonetary` (**t-1**) | `equityResult.marketReturn` computed later in same step 20 | Intentional. Absorption capacity uses prior year's equity return. |
| `dampedDemandRatioForInvestment` (in macroInputs at step 21) | passes current-year `consumerDemandRatio` | computed at step 9 from **t-1** consumption | — | Intentional but worth noting: investment in macro responds to demand ratio that is itself derived from t-1 consumption. Two-step lag through this channel. |
| `previousMortgageRate` (passed as `prevMortgageRate` in macroInputs) | step 21 (line 1836) | `previousMortgageRate` (**t-1**) or current `fm.bondMarket.mortgageRate` if undefined | Used in housing affordability for **t** | Intentional. Year-over-year rate change for housing model. |

**Variables computed using strictly current-year values:**
- `dynamicPopulation`, `dynamicLaborForce`, `laborForceGrowthFactor` (step 1)
- `capabilityScores` (step 3) — uses current year and current capability config
- `weightedCapability` per cluster (step 6) — uses current `capabilityScores`
- `displacementPct = adoptionRate × weightedCapability²` (step 6) — both inputs are current-year
- `totalAfterSpillover` (step 9 output) — current-year employment minus current-year demand penalty
- `policyEffects` (step 12) — uses current-year employment and population (but **t-1** prices/GDP/fundSize)
- `scarcityInflation`, `voluntaryWithdrawalRate` (step 13)
- `sectorWeightedDeflationRate` (step 14)
- `aiProduction` boost components (step 17)
- `homePriceIndex` is updated from `macro.homePriceIndex` (step 24) — but the input to macro at step 21 includes the previous year's accumulated `homePriceIndex`
- All values inside `computeMacro()` at step 22 are computed from `macroInputs` which is fully assembled at that point

**Macro outputs that flow back into the SAME year's downstream computations (not the next year):**
- `macro.priceLevel` → used by `computeDynamicVelocity()` at step 27 (within the same year, line 1944 path? — actually step 27 uses `macro.unemploymentRate` and `macro.consumption`, not `priceLevel`)
- `macro.consumerWelfareIndex` → used to compute `requiredAssetOwnership` and `requiredTransferLevel` at step 30
- `macro.gdpNominal` → pushed to `nominalGDPHistory` at step 23, used by NEXT year's fiscal risk premium
- `macro.cumulativeInflationFactor` → used to update `fiscalMonetaryOutput.fiscal.effectiveCOLAFactor` at step 33

**⚠️ NONDETERMINISTIC ORDER:** The cluster loop at step 6 iterates over `effectiveClusters` (an array, deterministic) and for each cluster iterates over `cluster.roles` (also an array, deterministic). Within a single iteration, BFCS scoring, adoption, and displacement are sequential. **No nondeterministic ordering was observed.** The only `Map` iterations (e.g., over `baselines`, `clusterDemandSurvivalMap`) are used for accumulation (sums), so iteration order does not affect the result.

**⚠️ ASYNC IN SIMULATION — none.** `runSimulation()` is fully synchronous. There is no `await`, no `Promise`, no `setTimeout` inside the function. The only async code in the codebase touching the simulation is `await import('html-to-image')` in `src/utils/export.ts:174` for PNG export — this runs after a simulation completes, never during.

---

## Part C — Feedback Loop Wiring

The simulation engine contains **6 in-engine feedback loops** (the user's prompt mentions 5; ATLAS has 6 — there are also 6 standalone visualization simulators in `src/components/charts/feedbackLoops/loopSimulations.ts` which are SEPARATE pedagogical components, NOT part of `runSimulation()`).

### Loop 1 — Revenue Pressure (Displacement-Demand Feedback)

| Property | Value |
|---|---|
| **ID in code** | `automationAcceleration` / `revenuePressure` |
| **Defined in** | `src/models/macro.ts:475–490` (`computeRevenuePressure`) |
| **Called from** | `src/models/macro.ts:1801–1807` (inside `computeMacro`) AND `src/models/simulation.ts:740–756` (year loop, before cluster work) |
| **Trigger** | Negative real GDP growth from previous year. |
| **Run order** | Step 4 (input read) and step 22 (recomputed inside macro). Output from step 4 is used at step 6 (cluster adoption). |
| **Loop type** | Lagged (one-year) |

**Code (verbatim, `macro.ts:475–490`):**
```typescript
export function computeRevenuePressure(
  gdpGrowthRate: number,
  previousAcceleration: number,
  sensitivity: number = REVENUE_PRESSURE_SENSITIVITY_DEFAULT,
  cap: number = REVENUE_PRESSURE_CAP,
  decay: number = REVENUE_PRESSURE_DECAY,
): { revenuePressure: number; automationAcceleration: number } {
  const gdpContraction = Math.max(0, -gdpGrowthRate);
  const newPressure = Math.min(cap, sensitivity * gdpContraction);
  const automationAcceleration = Math.min(cap, previousAcceleration * decay + newPressure);
  return { revenuePressure: newPressure, automationAcceleration };
}
```

**Inputs:**

| Variable | Source | Year |
|---|---|---|
| `gdpGrowthRate` | `previousMacro.realGDPGrowthRate` | t-1 |
| `previousAcceleration` | `previousMacro.automationAcceleration` | t-1 |
| `sensitivity`, `cap`, `decay` | config / constants | static |

**Outputs:**

| Variable | Written to | Downstream effect |
|---|---|---|
| `automationAcceleration` | Used in `simulation.ts:753–756` to bump adoption rates this year | Increases displacement → more job loss this year |
| `revenuePressure` | Returned diagnostic; written to MacroOutput | Display only |

**Loop interactions:**
- **Reads from:** Loop 5 (lower interest rates → higher GDP → less revenue pressure)
- **Feeds into:** Loop 3 (more displacement → less employment → less consumption → demand spillover)
- **Ordering dependency:** Must run BEFORE the cluster loop (step 6) because adoption rates incorporate `automationAcceleration`. The `simulation.ts:740–756` block satisfies this.

**⚠️ Stale read flag:** None — intentional one-year lag is correct by design.

---

### Loop 2 — Phillips Curve (Wage-Price)

| Property | Value |
|---|---|
| **ID in code** | `wagePressure` / `computeWagePressure` |
| **Defined in** | `src/models/macro.ts:293–311` |
| **Called from** | inside `computeMacro()` at macro.ts ~1613–1619 |
| **Trigger** | Unemployment rate above or below NAIRU. |
| **Run order** | Inside step 22 (within `computeMacro`). |
| **Loop type** | Instantaneous within macro |

**Code (verbatim, `macro.ts:293–311`):**
```typescript
export function computeWagePressure(
  unemploymentRate: number,
  automationCoverage: number = 0,
  aiWageMultiplier: number = AI_WAGE_PRODUCTIVITY_MULTIPLIER,
  policyWageFloor: number = 0,
  phillipsCurveSensitivity: number = PHILLIPS_CURVE_SENSITIVITY,
  naturalRate: number = FRED_NAIRU_RATE,
): number {
  const excessUnemployment = Math.max(0, unemploymentRate - naturalRate);
  const phillipsPressure = Math.exp(-phillipsCurveSensitivity * excessUnemployment);
  const aiProductivityPremium = automationCoverage * aiWageMultiplier * (1 - automationCoverage);
  return Math.max(policyWageFloor, phillipsPressure + aiProductivityPremium);
}
```

**Inputs:**

| Variable | Source | Year |
|---|---|---|
| `unemploymentRate` | computed inside `computeMacro` from current-year employment / labor force | t |
| `automationCoverage` | passed in via `macroInputs.automationCoverage` (computed at step 8) | t |
| `policyWageFloor` | computed at step 5 (line 763) from current-year min wage / baseline wage | t |
| `phillipsCurveSensitivity` | `secondOrderParams.phillipsCurveSensitivity` | static |
| `naturalRate` | `FRED_NAIRU_RATE` | static |

**Outputs:**

| Variable | Written to | Downstream effect |
|---|---|---|
| `wagePressure` | multiplies wage base in `aggregateWageIncome` calculation (macro.ts ~1630–1651) | higher wage income → higher consumption (via wageConsumption) → higher GDP same year |

**Loop interactions:**
- **Reads from:** Loop 3 (demand spillover sets unemployment), Loop 1 (automationCoverage)
- **Feeds into:** Loop 5 (higher wage income → higher tax revenue → lower deficit next year)
- **Ordering:** Must run AFTER unemployment is computed inside macro (which happens AFTER macroInputs are assembled).

**⚠️ Stale read flag:** None.

---

### Loop 3 — Demand Spillover

| Property | Value |
|---|---|
| **ID in code** | `consumerDemandRatio`, `govDemandRatio`, `businessDemandRatio`, `aggregateDemandSurvival` |
| **Defined in** | `src/models/simulation.ts:957–1035` (inline, no function — computed directly in the year loop) |
| **Trigger** | Real C/G/I from previous year falls below year-0 baseline (with tolerance band). |
| **Run order** | Step 9, immediately after aggregate displacement and BEFORE policy effects. |
| **Loop type** | Lagged (one-year) |

**Code (verbatim, simulation.ts:983–1031, abbreviated):**
```typescript
const consumerDemandRatio = realPrevConsumption / effectiveBaseC;
const govDemandRatio = realPrevGovSpending / effectiveBaseG;
const businessDemandRatio = realPrevInvestment / effectiveBaseI;
const demandSpilloverTolerance = config.demandSpilloverTolerance ?? 0.03;
const dampedDemandRatioForInvestment = Math.min(1.0, consumerDemandRatio + demandSpilloverTolerance);
for (const cr of clusterResults) {
  const clusterDemandRatio = cShare*consumerDemandRatio + gShare*govDemandRatio + bShare*businessDemandRatio;
  const demandShortfall = Math.max(0, 1.0 - clusterDemandRatio);
  const excessShortfall = Math.max(0, demandShortfall - demandSpilloverTolerance);
  const demandSurvivalRate = Math.min(1.0, 1.0 - excessShortfall);
  const constrainedEmployment = cr.totalRemainingEmployment * demandSurvivalRate;
}
```

**Inputs:**

| Variable | Source | Year |
|---|---|---|
| `prevConsumption`, `prevGovSpending`, `prevInvestment` | `previousMacro` | t-1 |
| `prevPriceLevel` | `previousMacro?.priceLevel` | t-1 |
| `effectiveBaseC/G/I` | year-0 captured at step 26 (`demandBaselineRealC/G/I`) | t=0 |
| `demandSpilloverTolerance` | config (default 0.03) | static |
| `cShare/gShare/bShare` | per-cluster `consumerDemandShare`, `govDemandShare`, `1 - both` | static (cluster def) |

**Outputs:**

| Variable | Written to | Downstream effect |
|---|---|---|
| `totalAfterSpillover` | Used in step 10 → `effectiveUnemployment`, step 12 → `computePolicyEffects`, step 21 → `macroInputs.totalRemainingEmployment` | Reduces employment → fewer wages → lower consumption next year (recursive) |
| `aggregateDemandSurvival` | Stored in `macroWithJobs` diagnostics | Display only |
| `clusterDemandSurvivalMap` | Used in scarcity computation at step 13 | Affects scarcity inflation |
| `dampedDemandRatioForInvestment` | Passed to `macroInputs.consumerDemandRatio` at step 21 | Gates AI/traditional investment in macro |

**Loop interactions:**
- **Reads from:** Loop 2 (last year's wages → consumption), Loop 5 (last year's gov spending), Loop 4 (last year's credit-constrained C/I)
- **Feeds into:** Loop 1 (lower employment → lower GDP → revenue pressure NEXT year), Loop 4 (this year's credit conditions inside macro use lower employment), the investment pipeline (instantaneous via `dampedDemandRatioForInvestment`)
- **Ordering:** Must run BEFORE step 10 (effectiveUnemployment) and step 12 (policy effects). Satisfied.

**⚠️ Stale read flag:** Reads `previousMacro.consumption`, etc. — this is INTENTIONAL one-year lag. ATLAS Phase 8a explicitly uses **real** (deflated) values to prevent inflation from masking demand collapse (lines 964–970).

---

### Loop 4 — Credit Crunch (Consumer + Business)

| Property | Value |
|---|---|
| **ID in code** | `computeConsumerCreditConditions` (consumer) / `computeBusinessCreditConditions` (business) |
| **Defined in** | `src/models/macro.ts:730–822` (consumer); `src/models/macro.ts:836–883` (business) |
| **Called from** | inside `computeMacro()` at macro.ts ~1419–1455 |
| **Trigger** | Consumer: real income falls below trend baseline, OR home price drops, OR CWI declines. Business: corporate profits collapse OR GDP growth turns negative. |
| **Run order** | Inside step 22 (within `computeMacro`). |
| **Loop type** | Inputs are lagged (t-1); output applied instantaneously to current-year consumption/investment. |

**Code (verbatim excerpt, consumer side, `macro.ts:730–822`):**
```typescript
const underwritableIncome = prevRealWageIncome * 1.0
                          + prevRealTransferIncome * transferReliabilityWeight
                          + prevRealAssetIncome * ASSET_INCOME_UNDERWRITING_WEIGHT;
const expectedGrowth = Math.pow(1 + trendRealIncomeGrowthRate, yearsSinceBaseline);
const adjustedBaseline = baselineHouseholdIncome * expectedGrowth;
const incomeAdequacyRatio = adjustedBaseline > 0 ? Math.min(2.0, underwritableIncome / adjustedBaseline) : 1.0;
const incomeDeficiency = Math.max(0, 1.0 - incomeAdequacyRatio);
const incomeTightening = incomeAdequacySensitivity * incomeDeficiency;
// + collateralTightening (home price), + systemicTightening (CWI decline)
const totalConsumerTightening = Math.min(maxConsumerTightening,
  Math.max(0, incomeTightening + collateralTightening + totalSystemicTightening));
const consumerCreditMultiplier = Math.max(0.01, 1.0 - consumerCreditImpact * consumerCreditRatio);
```

**Code (verbatim excerpt, business side, `macro.ts:836–883`):**
```typescript
const profitCoverageRatio = baselineCorporateProfits > 0
  ? Math.min(2.0, prevAfterTaxCorporateProfits / baselineCorporateProfits) : 1.0;
const profitSignal = 1.0 - profitCoverageRatio;
const profitTightening = profitabilitySensitivity * profitSignal;
const growthSignal = -growthTrajectorySensitivity * prevGDPGrowthRate;
const cappedGrowthEffect = Math.max(-DEFAULT_MAX_GROWTH_TIGHTENING,
  Math.min(maxBusinessLoosening, growthSignal));
const rawBusinessTightening = profitTightening + cappedGrowthEffect;
const totalBusinessTightening = Math.max(-maxBusinessLoosening,
  Math.min(maxBusinessTightening, rawBusinessTightening));
const businessCreditMultiplier = Math.max(0.01, 1.0 - businessInvestmentImpact * businessCreditRatio);
```

**Inputs (consumer):**

| Variable | Source | Year |
|---|---|---|
| `prevRealWageIncome` | `inputs.prevRealWageIncome` (= `previousMacro.afterTaxWageIncome / previousMacro.priceLevel`) | t-1 |
| `prevRealTransferIncome` | same pattern | t-1 |
| `prevRealAssetIncome` | same pattern | t-1 |
| `baselineHouseholdIncome` | captured year-0 at step 26 | t=0 |
| `prevHomePriceChangeRate` | `previousMacro.homePriceChangeRate` | t-1 |
| `prevCWI` | `previousMacro.consumerWelfareIndex` | t-1 |
| `mortgageStressIdx` | computed at step 19 | t |

**Inputs (business):**

| Variable | Source | Year |
|---|---|---|
| `prevAfterTaxCorporateProfits` | `previousMacro.afterTaxCorporateProfits` | t-1 |
| `baselineCorporateProfits` | captured year-0 at step 26 | t=0 |
| `prevGDPGrowthRate` | `previousMacro.gdpGrowthRate` | t-1 |

**Outputs:**

| Variable | Written to | Downstream effect |
|---|---|---|
| `consumerCreditMultiplier` | Multiplies `baseConsumption` (macro.ts ~1948) | Reduces current-year consumption → lower GDP → worse income next year |
| `businessCreditMultiplier` | Multiplies `totalInvestmentDemand` (macro.ts ~1980) | Reduces current-year investment → lower GDP next year |
| `consumerCreditTightening` | Used in `creditDeflationContribution = -tightening × creditDeflationSensitivity` (macro.ts ~1457) | Less borrowing → less money creation → deflation → reinforces low inflation |
| `businessCreditTightening` | Stored on MacroOutput; **read at simulation.ts:746 next year** as `previousMacro.businessCreditTightening` for credit-driven adoption acceleration | Cross-loop wiring into Loop 1 |

**Loop interactions:**
- **Reads from:** Loop 2 (income inputs), Loop 6 (mortgage stress, home price), Loop 5 (corporate profits affected by yields)
- **Feeds into:** Same-year consumption and investment (instantaneous within macro), Loop 1 next year (via `businessCreditTightening`), Loop 6 next year (via consumption changes that affect home affordability)
- **Ordering:** Inside macro, must run BEFORE consumption is computed.

**⚠️ Stale read flag:** All inputs are lagged by design — banks underwrite based on observed past performance.

---

### Loop 5 — Fiscal-Monetary (Debt → Yields → Monetization → Inflation)

| Property | Value |
|---|---|
| **ID in code** | "Phase 7 Fiscal-Monetary Block" — no single function; spans `simulation.ts:1217–1696` |
| **Defined in** | inline orchestration in `simulation.ts`; calls 17+ functions in `fiscal.ts`, `federalReserve.ts`, `monetization.ts`, `monetary.ts`, `bondMarket.ts`, `equityMarket.ts` |
| **Trigger** | Always runs every year ≥ 1 (year 0 uses baseline FM state). |
| **Run order** | Step 20, between housing/mortgage stress and `computeMacro()`. |
| **Loop type** | Inputs lagged from t-1; outputs injected into same-year `computeMacro()` via `macroInputs`. |

**Chain of calls (abbreviated, all in step 20):**

```typescript
// 14a: revenue from t-1 tax components
const revenue = computeEndogenousRevenue(prevMacro.wageIncomeTax, ..., prevMacro.gdpNominal);
// 14b: government spending with consolidation multipliers
const spending = computeGovernmentSpending(revenue.totalGovernmentRevenue, ..., previousDebtStock,
  previousWeightedAvgDebtRate, consolidation.discretionaryMultiplier, consolidation.obligationMultiplier);
// 14c: deficit and debt
const debtResult = computeDebtAccumulation(spending, revenue, spending.interestExpense, previousDebtStock, prevMacro.gdpNominal);
// 14e: Taylor rule
const taylorPrescribed = computeTaylorRule(neutralRealRate, prevCompositeInflation, inflationTarget,
  outputGap, taylorInflationCoeff, taylorOutputGapCoeff, prevUnemploymentRate, NATURAL_UNEMPLOYMENT_RATE,
  taylorEmploymentGapCoeff);
// 14f: fiscal dominance constraint
const fedResult = computeFiscalDominance(taylorPrescribed, prevPolicyRate, spending.interestExpense,
  revenue.totalGovernmentRevenue, fiscalDominanceThreshold, fiscalDominanceDampening, policyRateOverride);
// 14g: monetization rate (max of cases 1-6)
const monetizationResult = computeMonetizationRate(fedResult.policyRate, effectiveLowerBound,
  fedResult.fiscalDominanceActive, taylorPrescribed, fedResult.policyRate, qeMonetizationRate,
  debtServiceRevenueRatio, maxFinancialRepressionRate, prevTenYearYield, ...);
// 14h: money creation
const moneyResult = computeMoneyCreation(debtResult.totalDeficit, monetizationRateVal,
  prevMoneySupply, dynamicVelocity, prevMacro.gdpNominal, sectorWeightedDeflationRate,
  transferShareVal, discretionaryShareVal, interestShareVal, monetizationTransmissionSensitivity);
// ... fiscal risk premium, foreign demand, absorption capacity, yield, rates, equity, debt rate
```

**Inputs (selected):**

| Variable | Source | Year |
|---|---|---|
| All `prevMacroForFiscal.*` | `previousMacro` | t-1 |
| `previousDebtStock`, `previousWeightedAvgDebtRate` | carry-forward | t-1 |
| `previousFiscalMonetary.bondMarket.tenYearYield` | carry-forward | t-1 |
| `previousFiscalMonetary.equityMarket.marketReturn` | carry-forward | t-1 |
| `prevCorporateProfitsForEquity`, `prevPrevCorporateProfitsForEquity` | 2-year-lagged carry | t-1, t-2 |
| `policyEffects.transferChannelAddition` | computed at step 12 | t |
| `consolidation.*` (multipliers) | from `yearParams` (autopilot, current year) | t |
| `nominalGDPHistory` | historical | t-1 and earlier |
| `debtGDPHistory[laggedIndex]` | with `consolidationLag` | varies |

**Outputs:**

| Variable | Written to | Downstream effect |
|---|---|---|
| `inflationFromMonetization` | Injected into `macroInputs.transferInflation` and `macroInputs.inflationFromMonetization` at step 21 | Affects current-year priceLevel inside `computeMacro` (instantaneous) |
| `mortgageRate` | Injected into `macroInputs.mortgageRate` | Affects housing affordability and consumer credit collateral channel |
| `corporateBorrowingRate` | Injected into `macroInputs.corporateBorrowingRate` | Affects investment capacity and business credit |
| `marketReturn` | Injected into `macroInputs.marketReturn` | Affects current-year asset income (capital gains) |
| `policyRate` | Injected into `macroInputs.fiscalMonetaryPolicyRate` | Affects velocity rate effect at step 27, and credit conditions |
| `debtStock`, `debtGDPRatio` | Carried forward + tracked in `debtGDPHistory` | NEXT year's autopilot consolidation lag |
| `previousMoneySupply` | Updated at step 28 from `monetaryState.moneySupply` | NEXT year's monetary computation |
| `previousMarketCap`, `prevCorporateProfitsForEquity` | Carried forward | NEXT year's equity valuation |

**Loop interactions:**
- **Reads from:** Loop 2 (wages → revenue), Loop 3 (employment → revenue), Loop 4 (profits → tax base), Loop 6 (foreclosure-driven mortgage stress doesn't directly enter FM block but mortgage rate does)
- **Feeds into:** Loop 2 (inflation pass-through inside macro affects real wages), Loop 4 (mortgage rate affects credit collateral), Loop 6 (mortgage rate affects housing affordability), Loop 1 indirectly (via GDP and credit channels)
- **Ordering:** Must run AFTER `policyEffects` (which it reads at line 1309 for `transferChannelAddition`) and BEFORE `computeMacro` (because its outputs are injected into `macroInputs`). Satisfied.

**⚠️ Stale read flag:**
- **Line 1450:** `prevMacroForFiscal.gdpNominal` (**t-1**) is used as the Fisher equation denominator in `computeMoneyCreation`, while the velocity passed in (`dynamicVelocityForMonetization`) was computed from `prevMacroForFiscal.unemploymentRate` and `prevMacroForFiscal.consumption` (both **t-1**). All three inputs are from the same year, so this is consistent — but it does mean Fisher math uses last year's GDP, not this year's projected GDP. Intentional per the architecture but worth flagging for debugging inflation timing.
- **Line 1948-1953 (after macro):** A SECOND `computeDynamicVelocity()` call uses the CURRENT year's `macro.unemploymentRate` and `macro.consumption`. This produces a different velocity from the one used in `computeMoneyCreation`. **The two velocities are not equal.** The current-year velocity is used in `computeMonetaryState` at step 28, while the t-1 velocity is used in money creation at step 20. This is documented as intentional (`Phase 7: Rate effect on velocity`).

---

### Loop 6 — Housing Wealth

| Property | Value |
|---|---|
| **ID in code** | `updateHomeownership` / `housingWealthDrag` (no single function) |
| **Defined in** | Foreclosure/homeownership update: `src/models/macro.ts:1120–1193` (`updateHomeownership`); housing wealth effect: `src/models/macro.ts:1881–1941` |
| **Called from** | `simulation.ts:1204–1209` (homeownership update) and inside `computeMacro` step 22 (wealth effect) |
| **Trigger** | Cluster displacement → foreclosures (after lag) → home prices → wealth change. |
| **Run order** | Two-phase: step 18–19 BEFORE macro (homeownership update, mortgage stress), then inside step 22 (wealth effect on consumption). |
| **Loop type** | Mixed: foreclosures lagged 1-3 years, wealth effect on consumption applied same year. |

**Code (verbatim excerpt, foreclosure → homeownership update, `macro.ts:1120–1193`):**
```typescript
const lagYears = Math.floor(foreclosureLag);
const lagFraction = foreclosureLag - lagYears;
const idx1 = histLen - 1 - lagYears;
const laggedDisp = displacementHistory[idx1];   // displacement from year (t - lagYears)
const dispRate = qForeclosure / baseEmp;
const foreclosureImpact = dispRate * burden;
updated[q] = Math.max(0, Math.min(1, currentOwnership - lossFromForeclosure + recoveryAmount));
```

**Code (verbatim excerpt, housing wealth effect on consumption, `macro.ts:1920–1941`):**
```typescript
const homePriceChangeRate = computeHomePriceChange(
  computedMortgageRateChange, computedRealIncomeGrowthRate, housingForeclosureSupply,
  popGrowthRate, computedAffordabilityDeviation, ...);
computedHomePriceIndex *= (1 + homePriceChangeRate);
const wealthChange = BASELINE_HOUSING_WEALTH * homePriceChangeRate;
housingWealthDrag = wealthChange * housingWealthMPCParam * avgHomeownership;
// Applied at line ~1948-1951:
const adjustedConsumption = baseConsumption * consumerCreditMultiplier
                          * deflationDrag.velocityMultiplier + housingWealthDrag;
```

**Inputs:**

| Variable | Source | Year |
|---|---|---|
| `displacementHistory` | accumulated each year at step 18 (line 1201) | t through t-foreclosureLag |
| `foreclosureLag` | config (default 0.75-1.5 depending on source) | static |
| `dynamicHomeownership` | carried forward, mutated each year at step 18 | t-1 (then updated to t) |
| `mortgageRate` | from FM block step 20 (`fm.bondMarket.mortgageRate`) | t |
| `previousMortgageRate` | carry-forward | t-1 |
| `prevHomePriceChangeRate` | `previousMacro.homePriceChangeRate` | t-1 |
| `homePriceIndex` | accumulated across years from line 1850 | t-1 (then updated to t) |
| `housingWealthMPC` | config (default 0.05) | static |

**Outputs:**

| Variable | Written to | Downstream effect |
|---|---|---|
| `dynamicHomeownership[]` | mutated at line 1209 | Used same-year for mortgage stress (step 19) and wealth effect (step 22) |
| `hoResult.foreclosureRateAggregate` | passed into `macroInputs.foreclosureRateAggregate` at step 21 | Used inside macro for shelter inflation foreclosure pressure |
| `mortgageStressIndex` | passed into `macroInputs.mortgageStressIndex` at step 21 | Amplifies collateral channel in consumer credit (Loop 4) |
| `housingWealthDrag` | added to `adjustedConsumption` (additive, can be negative) | Reduces same-year consumption → lower GDP → recursive |
| `homePriceIndex` | updated at line 1850 from `macro.homePriceIndex` | Carried forward to next year |

**Loop interactions:**
- **Reads from:** Loop 5 (mortgage rate, corporate borrowing rate), Loop 3 (this year's displacement is captured in `displacementHistory`)
- **Feeds into:** Loop 4 same-year via mortgage stress and home price change (collateral channel), Loop 2 same-year via housing wealth drag on consumption → consumption affects unemployment via demand spillover NEXT year
- **Ordering:** Homeownership update (step 18) MUST run before mortgage stress (step 19), and BOTH must run before macro (step 22). Wealth effect computation runs inside macro after mortgage rate is injected via macroInputs. Satisfied.

**⚠️ Lagged read note:** `displacementHistory[t - lagYears]` is the explicit foreclosure lag — correct by design (MBA data shows ~2-3 year lag from job loss to foreclosure).

**⚠️ Subtle ordering:** `housingWealthDrag = wealthChange × housingWealthMPCParam × avgHomeownership`. The `avgHomeownership` is the value AFTER the current year's update at step 18, so if homeownership collapses this year, the wealth drag is computed using the LOWER (already-collapsed) homeownership. This is conservative — partially dampens the consumption effect of a foreclosure wave in the same year.

---

### Cross-loop dependency matrix

| Loop | Reads from (lagged inputs) | Feeds into (same-year) | Feeds into (next-year) |
|---|---|---|---|
| 1 Revenue Pressure | 5 (GDP), 4 (credit) | 6 (cluster adoption rates) | own carry via `automationAcceleration` |
| 2 Phillips Curve | 3 (unemployment from demand spillover), 1 (automation coverage) | wage income → consumption → GDP (same year) | 5 (tax revenue) |
| 3 Demand Spillover | 2, 5, 4 (last year's C/G/I) | 4 inside macro (lower employment → income → credit), 6 (displacement history) | 1 (lower GDP) |
| 4 Credit Crunch | 2 (income), 5 (profits/yields), 6 (collateral) | consumption × multiplier (instantaneous) | 1 via businessCreditTightening, 3 via lower C/I |
| 5 Fiscal-Monetary | 2, 3, 4 (all from t-1 macro) | 2 (inflation pass-through), 4 (mortgage rate, corporate rate), 6 (mortgage rate) | own carry via debt, yields, market cap |
| 6 Housing Wealth | 3 (displacement history, lagged), 5 (mortgage rate), 4 (collateral) | 4 (mortgage stress), 2 (housing wealth drag on consumption) | next year's affordability via homePriceIndex |

### Standalone visualization simulators (NOT part of `runSimulation`)

`src/components/charts/feedbackLoops/loopSimulations.ts` contains 6 standalone interactive simulator functions: `simulateDisplacementDemand`, `simulatePhillipsCurve`, `simulateDemandSpillover`, `simulateCreditCrunch`, `simulateFiscalMonetary`, `simulateHousingWealth`. These are pedagogical visualizations used by `FeedbackLoopsSection.tsx` in the dashboard. They are SEPARATE from the engine — they implement simplified versions of the same loops for explanatory diagrams. **The engine's loops use the in-engine implementations described above, not these simulators.**

---

## Part D — Data Flow Boundaries

### D.1 — Where external data ENTERS the simulation

**1. Static JSON files (build-time imports, no runtime fetches):**

ATLAS does NOT make any runtime API calls. All government data is pre-fetched into JSON files in `src/data/` and imported via Vite at build time.

| Source | Files | Loaded by | Pattern |
|---|---|---|---|
| **BLS OEWS** (Occupational Employment & Wages) | `src/data/bls/oews-data.json`, `metadata.json`, `total-employment.json`, `cpi-data.json` | `src/services/dataLoader.ts:90-93` | `import oewsRaw from '@/data/bls/oews-data.json'` (eager static import) |
| **BLS State OEWS / LAUS** (optional) | `src/data/bls/state-oews-data.json`, `state-laus-data.json` | `src/services/dataLoader.ts:97-98` | `import.meta.glob('@/data/bls/state-oews-data.json', { eager: true })` (optional, no build error if missing) |
| **BEA NIPA** | `src/data/bea/gdp-components.json`, `personal-income.json`, `government-receipts.json` (+ optional spending, price-indices, state-gdp, etc.) | `src/data/loadGovernmentData.ts` | static + glob |
| **FRED** (required) | `m2-velocity.json`, `nairu.json`, `fed-funds-rate.json`, `mortgage-delinquency.json`, `mortgage-rate-30yr.json`, `case-shiller-national.json`, `housing-starts.json`, `cpi-shelter.json`, `unrate.json`, `cps-employment.json`, `sloos-business-tightening.json`, `sloos-household-tightening.json` | `src/data/loadGovernmentData.ts` | static |
| **FRED** (optional) | `federal-debt.json`, `treasury-yield-10y.json`, `deficit-gdp-ratio.json`, `bbb-corporate-spread.json`, `federal-interest-outlays.json`, `corporate-profits-after-tax.json`, `federal-corp-tax-receipts.json`, `sp500.json` | `src/data/loadGovernmentData.ts:54-61` | `import.meta.glob('@/data/fred/federal-debt.json', { eager: true })` |

**Loading sequence at app start:**
1. JS module evaluation loads `src/data/loadGovernmentData.ts` → builds `govData` object
2. `src/models/constants.ts` reads `govData` at module load and computes derived constants (BASELINE_GDP_NOMINAL_2025, BASELINE_TOTAL_EMPLOYMENT, etc.)
3. `src/services/dataLoader.ts:loadBLSData()` is called from `src/stores/simulationStore.ts:68` → returns typed `BLSDataResult`
4. `src/services/dataTransform.ts:transformOEWSToBaselines()` builds per-cluster `OccupationBaseline` map
5. `src/services/dataTransform.ts:createOtherClusterBaseline()` creates synthetic baseline for `other_uncategorized` cluster (CES gap fill)
6. If state data exists, `src/data/stateTransform.ts:deriveStateOccupationDistributions()` and `populateStateDistributions()` build `stateDataMap`
7. Module-level variables `blsBaselines`, `blsMetadataResult`, `stateDataMapResult` are now ready
8. `recompute(defaultConfig)` is called immediately to produce the initial timeline (`simulationStore.ts:334`)

**Validation:** Each loader emits warnings (not errors) for missing optional data, accumulated in `blsWarningsResult`. The Zustand store exposes them as `blsWarnings` and `blsDataError`.

**2. CSV imports (runtime, user-initiated):**

`src/utils/csvImport.ts` exposes `parseParameterCSV()` and `buildConfigFromCSV()`. Called by store action `importCSVConfig(csvString)` at simulationStore.ts:730. The CSV is parsed in-memory, validated, mapped to `SimulationConfig`, and `recompute()` is called. **No file I/O in the engine itself** — the CSV string is passed in by the UI layer (a `<input type=file>` reads the file via FileReader).

**3. Scenario templates:**

`src/data/scenarioTemplates.ts` exports 8 hardcoded `SavedScenario` objects (`baseline`, `nordic-model`, `austerity-response`, etc.). Loaded via `loadScenario(config)` at simulationStore.ts:713.

**4. URL-shared scenarios:**

`src/utils/scenarios.ts` includes `lz-string` compression for URL sharing. `App.tsx` decodes a `?scenario=` URL param at startup and calls `loadScenario()`. This is read-once at app load.

**5. localStorage / sessionStorage:**

- **sessionStorage:** Zustand `persist` middleware on the store. Persisted fields: `config`, `currentYear`, `activeView`, `selectedClusterId`, `selectedStateCode`, `comparisonStateCodes`, `stateMapMetric`, `compareMode`, `comparisonPolicyConfigs`, `parameterOverrides`, `fiscalComparisonProfile`. Resets on tab close.
- **localStorage:** `atlas_onboarding_complete` and `atlas_fiscal_onboarding_complete` flags (UI-only, not part of simulation state).
- On rehydrate, `migratePolicySchedules()` converts legacy flat-number policy fields into `PolicySchedule` keyframe form (Phase 5e migration). The `timeline` is NOT persisted — it's recomputed via `runSimulation` from the rehydrated config.

### D.2 — Where data EXITS the simulation

**1. React component rendering (primary):**

The Zustand store's `timeline` field holds the latest `SimulationTimeline`. Components subscribe via `useSimulationStore((s) => s.timeline)` or via convenience hooks in `src/hooks/useSimulation.ts`:
- `useSimulationTimeline()` (line 32)
- `useCurrentYearData()` (line 40) — selects `timeline.years[currentYear - startYear]`
- `useMacroTimeSeries()` (line 78) — flattens macro fields across all years
- `useCapabilityParams()` (line 124)
- `usePolicyWindowInfo()` (line 137)
- `useSimulationSummary()` (line 187)
- `useCurrentYear()` (line 194)
- `useBFCSOverrideCount()` (line 202)
- `useBaselineMacroTimeSeries()` (line 222) — for baseline-comparison overlay

Other hooks: `useBFCSScores`, `useCompareMode`, `useEconomicsData`, `useOccupationData`, `useParameterTimeline`, `useParameterTrajectory`, `usePolicyData`, `useProfileComparison`, `useStateData`, `useTimelinePlayback`.

Charts (in `src/components/charts/`) consume these hooks and render via Recharts or D3.

**2. CSV export (user-initiated):**

`src/utils/csvExport.ts:690` — `exportSimulationResultsCSV(timeline: SimulationTimeline): string`. Builds headers + ~291 base columns (+ ~336 per-cluster columns) from the timeline. `downloadResultsCSV(timeline)` (line 705) triggers a browser download via Blob URL.

`src/utils/exportTimeline.ts` does parameter timeline export (long format) — separate from the main results CSV.

`src/utils/csvImport.ts` mirrors for round-trip support (`csvQuoteSchedule` / `parseSchedule` for PolicySchedule fields).

**3. PNG export (presentation mode):**

`src/utils/export.ts:174` — `await import('html-to-image').toPng(...)`. **This is the only async operation in the export path**, but it runs only after the simulation has completed. It reads DOM nodes (rendered charts) and produces a PNG, never touching the simulation state.

**4. URL share strings:**

`src/utils/scenarios.ts` compresses the current `config` via `lz-string` for URL sharing. Read-only export to clipboard.

### D.3 — Caching, memoization, and state management layers

**1. Zustand store (`src/stores/simulationStore.ts`)** — the central state.
- Holds `config`, `timeline`, `currentYear`, UI state, and Phase 8b parameter overrides.
- `subscribeWithSelector` middleware enables selector-based subscriptions (components only re-render when their selected slice changes).
- `persist` middleware writes to sessionStorage on every update.
- **Module-level mutable variables** (NOT in the store, NOT persisted):
  - `blsBaselines`, `blsMetadataResult`, `blsWarningsResult`, `blsErrorResult`, `stateDataMapResult` — set once at app load
  - `currentParameterOverrides` (line 148) — module-level Map, kept in sync with the store's `parameterOverrides` field. This avoids threading overrides through every existing `recompute()` call. Restored on rehydrate via `onRehydrateStorage` callback.

**2. `recompute()` cache** — there is **no memoization**. Every call to `recompute()` runs `runSimulation()` from scratch. The simulation is fast enough (~5-10ms for 26 years × 51 clusters) that caching isn't needed. The store comment at line 8 confirms: "no debouncing is needed."

**3. Per-year carry-forward state inside `runSimulation()`** — these are local variables, not a persistent cache. They live for the duration of one `runSimulation` invocation and are discarded when it returns:
- `previousMacro`, `previousFundSize`, `previousMoneySupply`, `previousTransferInflation`
- `debtGDPHistory`, `nominalGDPHistory`
- `triggerYears`, `baselines`, `effectiveClusters`
- `previousFiscalMonetary`, `previousDebtStock`, `previousWeightedAvgDebtRate`, `previousMarketCap`
- `previousCapabilityScores`, `prevCorporateProfitsForEquity`, `prevPrevCorporateProfitsForEquity`
- `homePriceIndex`, `previousMortgageRate`
- `adoptionState`, `chipSupplyHistory`, `cumulativeCapabilityDelay`, `supplyChainShockHistory`
- `dynamicHomeownership`, `displacementHistory`
- `baselineCWI`, `creditBaselineCWI`, `baselineHouseholdIncome`, `baselineCorporateProfits`, `baselineConsumption`, `demandBaselineRealC/G/I`, `capturedBaselineCreditFunded`, `startYearAiGDP`

**4. `parameterTimeline` and `yearSnapshots` Maps** — built inside `runSimulation` (lines 456–457) and exposed on `SimulationTimeline` for downstream tooling. Not persistent caches; rebuilt every run.

**5. React hook memoization** — selector hooks in `src/hooks/*` use Zustand's built-in equality checks. Some hooks (notably `useBFCSScores`) use `useShallow` from Zustand to prevent infinite re-renders when returning objects/arrays. Charts may use `useMemo` internally for derivative computations (e.g., chart-ready data shapes).

**6. TanStack Query** — listed in CLAUDE.md but **not used in the simulation engine path**. The codebase doesn't make runtime BLS API calls so there's no fetching layer to cache.

**7. Web workers** — none. The simulation runs synchronously on the main thread. With ~5-10ms per recompute, this is acceptable. If the model grows substantially heavier, this would need revisiting.

### D.4 — Summary diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│  BUILD TIME (Vite static imports, eager glob imports)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                       │
│  │  BLS JSON   │  │  BEA JSON   │  │  FRED JSON  │  → loadGovernmentData │
│  │  (oews etc) │  │  (gdp etc)  │  │  (m2v etc)  │  → govData object     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                       │
│         │                │                │                              │
│         └────────────────┼────────────────┘                              │
│                          ↓                                               │
│  ┌──────────────────────────────────────┐                                │
│  │  src/models/constants.ts             │ ← reads govData at module load │
│  │  Computes BASELINE_* derived consts  │                                │
│  └──────────────────────────────────────┘                                │
└──────────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────────┐
│  APP INIT (one-time, in simulationStore.ts module body)                  │
│  loadBLSData() → transformOEWSToBaselines() → createOtherClusterBaseline │
│      → deriveStateOccupationDistributions() → populateStateDistributions │
│  → blsBaselines, stateDataMapResult (module-level vars)                  │
│  → recompute(defaultConfig) → initialTimeline                            │
└──────────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────────┐
│  ZUSTAND STORE                                                           │
│  state: { config, timeline, currentYear, parameterOverrides, ... }       │
│  ↑     ↓                                                                 │
│  │     └─→ React hooks (useSimulationTimeline, useMacroTimeSeries, ...)  │
│  │              ↓                                                        │
│  │         React components (charts, panels, control sliders)            │
│  │              ↓                                                        │
│  │         User interaction (slider drag, preset click, etc.)            │
│  │              ↓                                                        │
│  │         Store action (e.g., setCapabilityParam)                       │
│  │              ↓                                                        │
│  │         updates config + calls recompute(newConfig)                   │
│  │              ↓                                                        │
│  └─────────────recompute() → runSimulation() → new timeline → set state  │
└──────────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────────┐
│  EXIT POINTS                                                             │
│  ├── React component renders (continuous, on every state change)         │
│  ├── exportSimulationResultsCSV(timeline) → downloadResultsCSV() (Blob)  │
│  ├── exportTimeline(parameterTimeline) (separate long-format CSV)        │
│  ├── PresentationMode → html-to-image → PNG download (async, post-sim)   │
│  ├── lz-string compress(config) → URL share string                       │
│  └── Zustand persist middleware → sessionStorage (config, UI state)      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Critical findings & flags

### ⚠️ Stale read flags (intentional one-year lags)

All flagged below are INTENTIONAL design choices, not bugs. They are listed so that debugging timing issues has a complete reference.

1. **Loop 1 input at step 4** — `previousMacro.automationAcceleration` and `previousMacro.businessCreditTightening` are both **t-1**. This produces a one-year delay between GDP contraction and the AI-acceleration response, which dampens oscillation.

2. **Loop 3 (demand spillover) at step 9** — All three demand inputs (`prevConsumption`, `prevGovSpending`, `prevInvestment`) are **t-1**, deflated by `previousMacro.priceLevel` (also **t-1**) to compute REAL ratios (Phase 8a fix). One-year lag between demand collapse and employment response.

3. **Loop 4 (credit crunch) inside macro at step 22** — All income, profit, home price, and CWI inputs are **t-1**. Banks underwrite based on observed past performance, so this is causally correct.

4. **Loop 5 (fiscal-monetary) at step 20** — All `prevMacroForFiscal.*` inputs are **t-1**. Critically, `prevTenYearYield` (used by Cases 5 & 6 of monetization) is from `previousFiscalMonetary` to avoid circular reference within the same year.

5. **New job creation at step 16** — `prevGDPForJobs` is `previousMacro.gdpReal` (**t-1**). Documented as "last year's investment creates this year's jobs."

6. **Policy effects at step 12** — `previousMacro.priceLevel`, `previousMacro.gdpNominal`, `previousMacro.aiGDPContribution` (**all t-1**). Policy budgeting uses prior period economic conditions.

7. **Equity valuation at step 20** — Uses `prevMacro.afterTaxCorporateProfits`, `prevCorporateProfitsForEquity` (**t-1**), and `prevPrevCorporateProfitsForEquity` (**t-2**) for 2-year average growth.

### ⚠️ Subtle inconsistencies (worth investigating)

1. **Two `computeDynamicVelocity()` calls per year** — at line 1413 (inside FM block, uses **t-1** unemployment & consumption) and at line 1940 (after macro, uses **t** unemployment & consumption). The two velocities differ; the first feeds money creation, the second feeds the monetary state output. Documented as intentional but can create confusion.

2. **`automationAcceleration` is computed twice** — at simulation.ts:740–756 (uses `previousMacro.automationAcceleration` + `previousMacro.businessCreditTightening`, both **t-1**) and AGAIN inside `computeMacro` at macro.ts:1801–1807 (`computeRevenuePressure`). The two computations produce different values: the simulation.ts version is used to bump cluster adoption rates BEFORE macro runs; the macro.ts version is what gets stored in `MacroOutput.automationAcceleration` for next year. **Verify these are consistent in intent.**

3. **`fiscalMonetaryOutput.fiscal.effectiveCOLAFactor` is set twice** — first at line 1643 from `previousMacro?.cumulativeInflationFactor` (**t-1**), then re-updated at line 2067 from `macroWithJobs.cumulativeInflationFactor` (**t**) after macro completes. This is documented as a workaround because the fiscal block runs before macro but COLA dampening happens inside macro.

4. **`displacementHistory.push(yearDisp)` at line 1201** is called BEFORE `updateHomeownership` at line 1204. So when `updateHomeownership` reads `displacementHistory[idx1]` with `idx1 = histLen - 1 - lagYears`, the most recent entry IS the current year's displacement. With `foreclosureLag = 0.75` (default constant), this means foreclosures react PARTLY to current-year displacement and PARTLY to last year's. Verify this is the intended interpretation of fractional lag.

5. **`baselineCWI` capture at step 29** uses `macroWithJobs.consumerWelfareIndex` from year 0, but `creditBaselineCWI` is captured at step 26 (line 1921) from `macro.consumerWelfareIndex` — same year, slightly different objects. They should be equal but the capture order means a future refactor could diverge them.

### ⚠️ NONDETERMINISTIC ORDER

**None observed.** All loops in the year body iterate over arrays (`effectiveClusters`, `cluster.roles`, `clusterResults`) in deterministic order. `Map` iteration is used only for accumulation (sums), where order is irrelevant. JavaScript Map iteration order is insertion order, which is itself deterministic.

### ⚠️ ASYNC IN SIMULATION

**None.** `runSimulation()` and all functions it calls are synchronous and pure. The only async code in the export pipeline is `await import('html-to-image')` in `src/utils/export.ts:174`, which runs after a simulation completes for PNG export — never during.

### Notes on the user's question about "5 feedback loops"

The user's prompt mentions "5 feedback loops". ATLAS actually contains **6** in-engine feedback loops (Revenue Pressure, Phillips Curve, Demand Spillover, Credit Crunch, Fiscal-Monetary, Housing Wealth). Documented all 6 in Part C. The 6 standalone visualization simulators in `src/components/charts/feedbackLoops/` are SEPARATE from the engine.

---

## Audit metadata

**Method:**
- Direct line-by-line trace of `simulation.ts` lines 429–2122 (the entire `runSimulation` function and per-year loop)
- Direct read of `simulationStore.ts` for entry-point identification
- Focused exploration agent for `macro.ts` feedback loop locations
- Direct read of `csvExport.ts`, `dataLoader.ts`, `loadGovernmentData.ts` for boundary identification
- Cross-check with the Variable Registry (`docs/VARIABLE_REGISTRY.md`)

**Limitations:**
- Line numbers are accurate at audit time but will drift as code evolves
- The internal structure of `computeMacro()` (2450 lines) is documented at the function-call boundary; deeper line-by-line tracing of macro.ts internals is left to a follow-up audit if needed
- The supply-chain module is fully integrated but dormant in the default configuration: no `supplyChainConfig` is set by default, so its consumers are gated off and it contributes nothing to baseline runs. It activates only in user scenarios that set that configuration.

**Recommended follow-up audits:**
1. Trace `computeMacro()` internals to document the exact order of operations inside the macro module (currently treated as a black box at step 22)
2. Verify that the two `automationAcceleration` computations (simulation.ts vs macro.ts) are intentionally divergent
3. Verify the `effectiveCOLAFactor` double-write is mathematically equivalent to a single write
4. Document the deflation drag, scarcity, and minWage cost-push computations more thoroughly inside macro.ts

---

**END OF EXECUTION FLOW DOCUMENT**
