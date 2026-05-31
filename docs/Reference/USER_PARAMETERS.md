# ATLAS User Parameter Reference

Every user-adjustable control in the ATLAS left-sidebar ControlsPanel, mapped to the config field it writes, the equation(s) in `MethodologyView.tsx` where it appears, and a plain-English description of its role.

Equation references (e.g. `Eq 1.3`) point to the numbered cards in `src/components/charts/MethodologyView.tsx`.

Descriptions are derived from JSDoc comments on the `DEFAULT_*` constants in `src/models/constants.ts` and the surrounding code in the model files. Where the effect of a control is not clearly documented or cannot be inferred unambiguously from the equation, the Description field is intentionally left blank.

---

## Panel Structure

The ControlsPanel (`src/components/layout/ControlsPanel.tsx`) has three top-level sections:

1. **Fiscal Response** — always visible; policy/fed preset + dimension pickers
2. **Year Parameters** — always visible; per-year overrides of any resolvable parameter at the currently selected year (no unique sliders — it re-exposes the baseline parameters below with per-year scope)
3. **Baseline Configuration** — collapsed by default; nine nested categories

The tables below cover every category in rendering order.

---

## 1. Fiscal Response (top-level)

`FiscalResponseSection.tsx` + `FiscalPresetSelector.tsx` + `DimensionSlider.tsx`

### 1a. Fiscal Policy Preset

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Fiscal Policy preset | `config.activeFiscalPolicyPreset` | austerity / tax_the_winners / balanced_reduction / gridlock / no_fiscal_response / custom | Eq 5.3 | Selects a named fiscal-response profile. Each preset sets the four fiscal dimensions (spending/revenue mix, safety net, reaction timing, adjustment speed) to a documented historical or canonical stance (UK 2010 austerity, Nordic tax-the-winners, Simpson-Bowles balanced, US political gridlock, no-response stress test). "custom" unlocks the dimension pickers below. |

### 1b. Fiscal Policy Dimensions (visible when "Customize" expanded)

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Spending vs Revenue | `config.fiscalDimensions.spendingRevenue` | All Cuts / Mostly Cuts / Balanced / Mostly Revenue / All Revenue | Eq 5.3 | How the fiscal adjustment splits between spending cuts and revenue increases. Maps to `maxDiscretionaryCut`, `maxObligationCut`, `maxRevenueIncrease` in the resolved profile. |
| Safety Net Protection | `config.fiscalDimensions.safetyNet` | Full Protection / Partial Erosion / Budget Priority | Eq 5.3 | Whether transfer payments remain fully indexed to inflation or are eroded via COLA dampening under fiscal stress. Maps to `colaDampeningRate`, `colaDampeningThreshold`, `colaDampeningMaxCIF`. |
| Reaction Timing | `config.fiscalDimensions.reactionTiming` | Early Response / Standard / Late Response | Eq 5.3 | The debt/GDP level at which consolidation begins (Early ≈ 1.0×, Standard ≈ 1.5×, Late ≈ 2.5×). Maps to `consolidationThreshold`, `consolidationMaxThreshold`. |
| Adjustment Speed | `config.fiscalDimensions.adjustmentSpeed` | Immediate / 1-Year Lag / 2-Year Lag / Gridlock | Eq 5.3 | Years of political delay before Congress acts on the consolidation trigger. Maps to `consolidationLag`. |

### 1c. Federal Reserve Preset

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Federal Reserve preset | `config.activeFederalReservePreset` | price_stability / balanced_mandate / employment_focused / maximum_accommodation / custom | Eq 6.9 | Selects a Fed policy stance. Sets the inflation-gap weight α in the Taylor Rule (2.0 hawkish → 0.8 super-dove) and QE parameters. "custom" unlocks the dimensions below. |

### 1d. Federal Reserve Dimensions (visible when "Customize" expanded)

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Inflation vs Employment | `config.fedDimensions.inflationVsEmployment` | Price Stability / Balanced / Employment-Leaning / Employment-First | Eq 6.9 | Fed dual-mandate weighting. Changes the inflation-gap coefficient and the output-gap / employment-gap terms in the Taylor Rule. |
| Bond Market Operations | `config.fedDimensions.bondMarketOperations` | Minimal Intervention / Standard Operations / Active Purchases / Aggressive QE | Eq 6.8 | How aggressively the Fed intervenes in the bond market — sets QE monetization rate, financial-repression cap, yield-responsive threshold, and max yield-response rate. |

### 1e. Baseline Comparison

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Show Baseline Comparison | `config.baselineComparisonEnabled` | on/off | — | UI-only toggle; renders the unmodified 2025 baseline alongside the current scenario in charts. |

---

## 2. Year Parameters

`YearParameterSection.tsx` — re-exposes the resolved value of every baseline parameter for the currently selected year, letting the user override any of them at a single year (keyframe-style). It does not introduce new parameters beyond those listed in the Baseline Configuration sections below; the override is written to `config.parameterOverrides[year][paramKey]` and merged with baseline + autopilot layers via `parameterResolution.ts`.

---

## 3. Baseline Configuration

### 3.1 AI Capabilities

#### `CapabilityControls.tsx` — Capability S-Curves

Three AI vectors (generative, agentic, embodied), each with 4 parameters:

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Floor | `config.capabilities[vectorId].floor` | 0–1 | Eq 1.1 | Lower asymptote of the logistic S-curve — the capability level the vector starts near in 2025. |
| Ceiling | `config.capabilities[vectorId].ceiling` | 0–1 | Eq 1.1 | Upper asymptote of the logistic S-curve — the capability level the vector saturates toward. |
| Steepness | `config.capabilities[vectorId].steepness` | 0.1–2.0 | Eq 1.1 | Slope coefficient in `S(t) = floor + (ceiling − floor) / (1 + exp(−steepness × (t − midpoint)))`. Higher = faster transition from floor to ceiling. |
| Midpoint Year | `config.capabilities[vectorId].midpointYear` | 2025–2045 | Eq 1.1 | The year at which capability is halfway between floor and ceiling (the inflection point of the S-curve). |

#### `BFCSEditor.tsx` — BFCS Thresholds (per cluster × role × dimension)

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Better / Faster / Cheaper / Safer threshold | `config.bfcsOverrides[clusterId][roleId].{better,faster,cheaper,safer}` | 0–1 | Eq 1.3 | Per-role override of the BFCS trigger threshold for each of the four dimensions. Adoption for the role triggers only when all four current scores are ≥ their thresholds simultaneously. |

**Preset actions** (bulk overrides — not config fields, but UI buttons that mutate `bfcsOverrides` directly):

| Button | Effect | Source |
|---|---|---|
| Reset to Defaults | Clears all per-role overrides — `bfcsOverrides = {}`. Falls back to the default thresholds defined in `OCCUPATION_CLUSTERS`. | `BFCSEditor.tsx:84` (`handleResetAll`) |
| Full Augmentation | Sets every dimension on every role in every cluster to `1.0`, making the BFCS trigger effectively unreachable. Replacement-channel adoption is suppressed across the model; only the augmentation channel remains active. Useful as a counterfactual to isolate augmentation effects. | `BFCSEditor.tsx:88` (`handleMaxAll`) + `buildMaxThresholdOverrides()` at line 49 |
| Reset Cluster | Clears overrides for just the currently selected cluster. | `BFCSEditor.tsx:78` (`handleResetCluster`) |

#### `AlphaControls.tsx` — α 5-Driver Decomposition (Phase 10.A)

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Capability Weight | `config.alphaDriverParams.capabilityWeight` | 0–0.5 | Eq 1.8 | Weight on the capability-readiness driver inside α. The driver is a sigmoid activation of weighted capability around `capabilityActivationThreshold`. |
| Trust Weight | `config.alphaDriverParams.trustWeight` | 0–0.5 | Eq 1.8 | Weight on the trust driver, which ramps post-trigger as `1 − exp(−yearsSinceTrigger / trustHalfLife)`. |
| Competitive Weight | `config.alphaDriverParams.competitiveWeight` | 0–0.5 | Eq 1.8 | Weight on the peer-pressure driver: `max(0, peerAlpha − baseline)` — competitor clusters' prior-year α. |
| Margin Weight | `config.alphaDriverParams.marginWeight` | 0–0.5 | Eq 1.8 | Weight on the corporate-margin driver: `max(0, baselineMargin − currentMargin) / baselineMargin` — margin compression pushes replacement. |
| Slack Weight | `config.alphaDriverParams.slackWeight` | 0–0.5 | Eq 1.8 | Weight on the labor-slack driver. This term is **subtracted** from α (high unemployment reduces urgency to automate because labor is cheap). |
| Capability Activation Threshold | `config.alphaDriverParams.capabilityActivationThreshold` | 0.2–0.95 | Eq 1.8 | The weighted-capability level at which the capability driver is at half-strength (centre of the sigmoid). |
| Trust Half-Life (years) | `config.alphaDriverParams.trustHalfLifeYears` | 1–20 | Eq 1.8 | Years for the trust driver to accumulate to 50% of its maximum contribution after the role's adoption trigger. |
| α — [Cluster] override | `config.clusterAutomationShareOverrides[clusterId]` | 0–1 | Eq 1.8, Eq 2.1 | Direct override of the effective automation share for a single cluster, bypassing the 5-driver decomposition. 0 = full augmentation, 1 = full replacement. |

#### `AugmentationAndScarcityControls.tsx`

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Augmentation Adoption Steepness | `config.augmentationAdoptionSteepness` | 0.1–2.0 | Eq 1.7 | Logistic steepness of the pre-BFCS augmentation S-curve: `rate = 1 / (1 + exp(−steepness × yearsSinceAugTrigger))`. At the 0.8 default, augmentation reaches ≈98% in ~5 years post-viability. |
| Competitive Pressure Threshold | `config.competitivePressureThreshold` | 0.05–0.5 | Eq 1.4 | Adoption-rate level above which competitive pressure kicks in and accelerates adoption further (default 0.2 → pressure activates once >20% adopted). |
| Scarcity Intensity (Phillips Mechanism 2) | `config.scarcityIntensity` | 0–1.0 | Eq 4.3 | Intensity of the AI-driven wage scarcity premium: `premium = aiShare × scarcityIntensity × aggregateReplacementDifficultyWagePremium`. |
| Replacement Multiplier | `config.replacementMultiplier` | 0.5–10.0 | Eq 1.9 | Multiplier in the AI replacement productivity formula: `effectiveProductivity = 1 + weightedCapability × betterScore × replacementMultiplier × (1 + cheaperScore)`. Drives the "more output per displaced worker" effect in Eq 5.5. |

#### `InferenceCostCurveControls.tsx` (Phase 10.A floored decay)

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Floor (asymptotic) | `config.inferenceCostCurve.floor` | 0.0001–0.1 | Eq 4.2 | Asymptotic floor of the inference cost curve: costs decay toward this fraction of the 2025 baseline and never go below it. |
| Decay rate (k) | `config.inferenceCostCurve.k` | 0.1–2.0 | Eq 4.2 | k parameter in `floor + (1 − floor) × exp(−k × t^decayExponent)`. Higher k = faster initial decline. |
| Decay exponent | `config.inferenceCostCurve.decayExponent` | 0.3–1.0 | Eq 4.2 | Exponent on time in the same formula. Higher values make the early decline steeper and the tail flatter. |

#### `ReplacementDifficultyEditor.tsx` (per-role)

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| AI Replacement Friction (years) | `config.roleReplacementFrictionYearsOverrides[clusterId][roleId]` | 0–15 yr | — | Years of regulatory / cultural / licensure delay before AI can begin replacing the role after BFCS thresholds are met. Non-BFCS friction (legal approval, licensure updates, union negotiation). |
| Wage Premium (residual humanness) | `config.roleReplacementDifficultyWagePremiumOverrides[clusterId][roleId]` | 0–1 | Eq 4.3 | Residual human wage share at the automation tail — the `aggregateReplacementDifficultyWagePremium` input to the Phillips scarcity premium. Higher values for hard-to-replace roles (nursing ≈ 0.75) than for binary-outcome roles (trucking ≈ 0.15). |

---

### 3.2 Labor & Demographics

#### `NewJobsControls.tsx`

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Innovation Rate | `config.innovationRate` | 0.1×–10× of default | Eq 2.4 | Multiplier on `DEFAULT_INNOVATION_RATE` (jobs per dollar of GDP). Scales `rawNewJobs = nominalGDP × innovationRate × rdMultiplier`. |
| R&D Multiplier | `config.rdMultiplier` | 0.1–15 | Eq 2.4 | Amplification factor applied to innovation-driven job creation. |
| Job Persistence | `config.jobPersistenceFactor` | 0.1–15 | Eq 2.4 | Exponent in the survivability term: `durableNewJobs = rawNewJobs × (1 − automationCoverage)^persistenceFactor`. >1 = new jobs are more vulnerable to automation than the cluster average; <1 = more durable. |

#### `DemographicsControls.tsx`

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Population Growth | `config.populationGrowthRate` | −1% to 3%/yr | Eq 3.1 | Annual population growth rate. Scales the denominator of CWI (Eq 7.1) and the productivity-growth term `BASELINE_GDP_GROWTH_RATE − populationGrowthRate` in the income-composition formula (Eq 3.1). |
| UBI Withdrawal Elasticity | `config.participationElasticity` | 0–0.5 | Eq 2.5 | Elasticity parameter in the voluntary-withdrawal formula: `withdrawal = elasticity × min(1, excessReplacement / (1 − threshold))`. |
| UBI Withdrawal Threshold | `config.participationThreshold` | 10%–100% | Eq 2.5 | UBI/wage replacement ratio above which voluntary labor-force exit begins. |

#### `FeedbackControls.tsx`

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Rev. Pressure Sensitivity | `config.revenuePressureSensitivity` | 0–3 | Eq 1.5 | `sensitivity` in `newPressure = min(cap, sensitivity × max(0, −gdpGrowthRate))` — how strongly GDP contraction accelerates automation. |
| Rev. Pressure Cap | `config.revenuePressureCap` | 0–1 | Eq 1.5 | Ceiling on total automation acceleration from revenue pressure + credit combined. |
| Rev. Pressure Decay | `config.revenuePressureDecay` | 0–1 | Eq 1.5 | Persistence factor on prior-year pressure. Half-life ≈ 1 year at the 0.5 default — prevents infinite compounding after conditions recover. |
| AI Wage Premium | `config.aiWageProductivityMultiplier` | 0–1 | — | *DEPRECATED in Phase 10.A*: prior inverted-U wage premium peaking at 50% automation coverage. Retained for legacy scenarios; modern wage effects flow through the Phillips scarcity premium (Eq 4.3). |
| Wage-UE Sensitivity | `config.phillipsCurveSensitivity` | 0–5 | Eq 4.3 | Exponential decay coefficient β in `classicPhillips = exp(−β × excessUE × (1 − aiShare))`. |

#### `MultiplierControls.tsx`

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Uncategorized Multiplier | `config.otherUncategorizedMultiplierOverride` | 0–5 (custom mode) | Eq 2.2 | BEA-style employment multiplier applied to the ~84M uncategorized workers not mapped to a BLS OEWS SOC code. In Auto mode, falls back to the employment-weighted average of all cluster multipliers (~2.4×). |

---

### 3.3 Investment & Corporate

`InvestmentCorporateControls.tsx`

#### Investment Demand

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Baseline GDP Growth | `config.baselineGDPGrowth` | 0%–5% | Eq 3.1 | The long-run real GDP growth rate assumed *without* AI effects. Feeds the productivity-growth term in the income-composition formula. |
| AI Utilization Sensitivity | `config.aiUtilizationSensitivity` | 0–100 | Eq 5.2 | Mapped to the `utilExp` exponent in `investmentRealization = utilization^utilExp × demand^demandExp × creditHealth^creditExp`. |
| Consumer Demand Inv. Sens. | `config.consumerDemandInvestmentSensitivity` | 0–100 | Eq 5.2 | Mapped to the `demandExp` exponent in the same investment-realization formula. |
| Credit Inv. Response Sens. | `config.creditInvestmentResponseSensitivity` | 0–100 | Eq 5.2 | Mapped to the `creditExp` exponent on business-credit health in the same investment-realization formula. |
| Trad. Inv. Demand Sens. | `config.traditionalInvestmentDemandSensitivity` | 0–100 | Eq 5.2 | Sensitivity of traditional (non-AI) investment to consumer demand; feeds `tradDemandFactor`. |
| Trad. Inv. GDP Fraction | `config.traditionalInvestmentGDPFraction` | 5%–40% | Eq 5.2 | Baseline fraction of prior-year nominal GDP allocated to traditional private fixed investment. Data-driven default from BEA. |

#### Corporate & Profits

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| AI Profit Margin | `config.aiProfitMargin` | 5%–60% | Eq 7.7 | Operating margin applied to AI-sector GDP contribution: `aiProfits = aiGDPContribution × aiMargin`. |
| Traditional Profit Margin | `config.traditionalProfitMargin` | 2%–30% | Eq 7.7 | Operating margin applied to non-AI GDP: `tradProfits = (GDP − aiGDP) × tradMargin`. |
| Corporate Retention | `config.corporateRetentionRate` | 0–1 | Eq 3.1 | Fraction of after-tax profits retained by corporations (not paid as dividends). Complement flows into the asset-income channel. |
| AI Market Power | `config.aiProfitGrowthRate` | discrete 0.5–10× | Eq 7.7 | Multiplier on the AI profit growth rate during the transition, representing super-normal AI sector returns. |

#### AI Production

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| AI Augmentation Multiplier | `config.augmentationMultiplier` | 0–5 | Eq 1.7 | Per-worker output boost at full capability when the role is augmented (not replaced). Effective boost = `betterScore × augmentationMultiplier`. |
| Investment Fraction | `config.aiProductionInvestmentFraction` | 0–1 | Eq 5.5 | Fraction of the AI production surplus allocated to investment goods. |
| Onshoring Fraction | `config.aiProductionOnshoringFraction` | 0–1 | Eq 5.5 | Fraction of the AI production surplus allocated to net exports (onshoring). The remainder (1 − investFrac − onshoreFrac) goes to consumer goods potential. |
| New Job Wage Fraction | `config.newJobWageFraction` | 0–2 | Eq 2.4 | New-job wage as a fraction of the cluster average wage. <1.0 = new jobs pay below average; >1.0 = above average. |

#### Market Valuation

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| AI Valuation Sensitivity | `config.aiPESensitivity` | 25–250 | Eq 6.7 | P/E sensitivity of the AI sector to earnings growth (points of P/E per 100% earnings growth). Feeds `basePE + aiPESensitivity × growthRate`. |
| Market Valuation Sensitivity | `config.traditionalPESensitivity` | 15–150 | Eq 6.7 | Same as above but for the non-AI / traditional equity sector. |

---

### 3.4 Consumer Demand

`ConsumerDemandControls.tsx`

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| MPC Wage | `config.postTaxMPCs.wage` | 0–1 | Eq 3.2 | Post-tax marginal propensity to consume out of wage income. |
| MPC Asset | `config.postTaxMPCs.asset` | 0–1 | Eq 3.2 | Post-tax MPC out of asset income (dividends, capital gains, non-corp business). |
| MPC Transfer | `config.postTaxMPCs.transfer` | 0–1 | Eq 3.2 | Post-tax MPC out of transfer income (UI, UBI, SWF distributions). |
| MPC Wage UE Sensitivity | `config.mpcWageUESensitivity` | 0–0.05 | Eq 3.3 | Reduction in the effective wage MPC per percentage point of excess unemployment: `effectiveMPC_wage = max(0.01, MPC_wage − sensitivity × excessUE_pp)`. |
| Demand Feedback | `config.demandFeedbackSensitivity` | 0–2 | Eq 7.4 | Sensitivity exponent in `demandPenalty = demandRatio ^ sensitivity`, where `demandRatio = currentGDP / rollingAvgGDP(5yr)`. Higher = firms' realized AI profits collapse faster when demand softens. |
| Wage Share (Bottom 80%) | `config.bottom80WageShare` | 0.20–0.70 | Eq 3.1 | Fraction of aggregate wage income accruing to the bottom 80% of households (used for distributional routing of income, which feeds MPC blending). |
| Transfer Share (Bottom 80%) | `config.bottom80TransferShare` | 0.50–1.00 | Eq 3.1 | Fraction of aggregate transfer income accruing to the bottom 80%. |
| Asset Share (Bottom 80%) | `config.bottom80AssetShare` | 0.01–0.50 | Eq 3.1 | Fraction of aggregate asset income accruing to the bottom 80%. |
| Deferrable Spending | `config.deferrableConsumptionShare` | 10%–50% | Eq 3.5 | Maximum fraction of consumption that can be deferred when consumers expect price declines. Upper asymptote of the logistic in `deferralRate`. |
| Deflation Deferral Midpoint | `config.deflationMidpoint` | 1%–15% | Eq 3.5 | Deflation rate at which 50% of `deferrableShare` is actually deferred (centre of the logistic). |
| Deflation Deferral Steepness | `config.deflationSteepness` | 5–100 | Eq 3.5 | Steepness of the deferral logistic around the midpoint. |

---

### 3.5 Monetary & Prices

`MonetaryPricesControls.tsx`

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Velocity Sensitivity | `config.velocitySensitivity` | 0–0.10 | Eq 6.6 | Percentage-point drop in money velocity per percentage point of excess unemployment. Feeds dynamic velocity in the Fisher equation. |
| Base Inflation Rate | `config.baseInflationRate` | 0%–10% | Eq 4.1 | Starting CPI-U inflation rate that the 7-component net inflation is built on top of. Default is data-driven from BLS CPI. |
| Inference Cost Change | `config.aiCostParams.inferenceAnnualChange` | −80% to +50%/yr | Eq 4.2 | *Legacy* constant-rate inference cost decline. Phase 10.A replaced this with the floored decay curve (see §3.1); retained for scenarios that explicitly pass an override. |
| Manufacturing Cost Change | `config.aiCostParams.manufacturingAnnualChange` | −50% to +50%/yr | Eq 4.2 | Annual cost decline rate for AI manufacturing components (the manufacturing slice of sector AI cost). |
| Energy Cost Change | `config.aiCostParams.energyAnnualChange` | −50% to +50%/yr | Eq 4.2 | Annual cost decline rate for AI energy input (the energy slice of sector AI cost). |
| Scarcity Pass-Through | `config.scarcityPassThrough` | 0–1 | Eq 2.6 | Fraction of sector-level labor scarcity passed through to goods prices: `scarcityInflation = Σ(laborScarcity × employmentShare × passThrough)`. |
| Wage Pass-Through | `config.wagePassThrough` | 0–1 | — | Fraction of unit-labor-cost increases passed through to prices. |
| Wage Automation Sensitivity | `config.wageAutomationSensitivity` | 0–1 | — | Sensitivity of automation adoption to minimum-wage cost pressure (higher minimum wage → more automation). |

---

### 3.6 Credit & Financial

`CreditFinancialControls.tsx`

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Credit UE Sensitivity | `config.creditUESensitivity` | 0–5 | Eq 6.1 | Household credit-tightening sensitivity per percentage point of excess unemployment, feeding the consumer-credit income-adequacy and systemic-risk channels. |
| Credit → Investment | `config.creditInvestmentSensitivity` | 0–2 | Eq 6.1 | `investImpact` in `businessMultiplier = 1 − impact × (tightening / maxTightening)`. Maximum investment decline at peak business-credit tightening. |
| Credit → Consumption | `config.creditConsumptionSensitivity` | 0–2 | Eq 6.1 | `consImpact` in `consumerMultiplier = 1 − impact × (tightening / maxTightening)`. Maximum consumption decline at peak consumer-credit tightening. |
| Max Credit Contraction | `config.maxCreditTightening` | 30%–100% | Eq 6.1 | Cap on consumer-credit tightening (fraction of credit that can withdraw from baseline). |
| Credit Deflation Sensitivity | `config.creditDeflationSensitivity` | 0–0.15 | Eq 4.1 | Sensitivity of the price level to credit contraction — the `creditDeflation` component of the 7-component net inflation. |
| Biz Credit GDP Sens. | `config.businessCreditGDPSensitivity` | 0–15 | Eq 6.1 | Business-credit loosening per percentage point of positive prior-year GDP growth (Channel 2 of the business-credit calculation). |
| Max Biz Credit Loosening | `config.maxBusinessCreditLoosening` | 0–1 | Eq 6.1 | Cap on how far business credit can loosen above baseline during sustained GDP growth. |
| Credit Adopt. Sens. | `config.creditAdoptionSensitivity` | 0–0.5 | Eq 1.6 | `sensitivity` in `creditAcceleration = min(cap, max(0, businessCreditSignal) × sensitivity)` — how strongly cheap business credit feeds into AI-adoption acceleration. |

---

### 3.7 Housing

`HousingControls.tsx`

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Shelter CPI Weight | `config.shelterCPIWeight` | 20%–50% | Eq 4.4 | `shelterWeight` in `compositeInflation = shelterWeight × shelter + (1 − shelterWeight) × goods`. Default 36% from BLS CPI-U relative importance. |
| Shelter Stickiness | `config.shelterInflationStickiness` | 0–1 | Eq 4.4 | `stickiness` in `shelterDeflationFromAI = −embodiedCap × stickiness × 0.10`. Higher = shelter deflates less in response to AI capability gains (construction is among the last sectors to automate). |
| Shelter Inflation Floor | `config.shelterInflationFloor` | −15% to 0% | Eq 4.4 | Hard floor on composite shelter inflation, preventing unrealistically deep shelter deflation (land scarcity constraint). |
| Mortgage Stress Amp. | `config.mortgageStressAmplifier` | 0–2 | Eq 6.2 | `amplifier` in `mortgageStressIndex = 1.0 + (rawIndex − 1.0) × amplifier`. Amplifies the asymmetry effect where AI first hits high-income quintiles with larger mortgages. |
| Housing Wealth MPC | `config.housingWealthMPC` | 0–0.15 | Eq 3.4, Eq 6.4 | MPC out of housing-wealth changes. `housingWealthDrag = BASELINE_WEALTH × homePriceChange × housingWealthMPC × avgHomeownership`. |
| Foreclosure Lag | `config.foreclosureLag` | 0–3 yr | Eq 6.3 | Years between job loss and mortgage default — savings-buffer delay in the dynamic-homeownership model. |
| Ownership Recovery | `config.homeownershipRecoveryRate` | 0%–10%/yr | Eq 6.3 | Annual rate at which homeownership pulls back toward baseline after a foreclosure episode. |
| Institutional Buyer Rate | `config.institutionalBuyerRate` | 0–1 | Eq 4.4, Eq 6.4 | Fraction of foreclosed homes absorbed by institutional investors (dampens the `foreclosureSupply` term in shelter-inflation and home-price channels). |
| Rental Demand Sensitivity | `config.rentalDemandSensitivity` | 0–1 | Eq 4.4 | `rentalSens` in `rentalDemandPressure = max(0, baseOwnership − avgOwnership) × rentalSens` — how much displaced owners' rental demand pressures shelter inflation. |

---

### 3.8 Supply Chain

`SupplyChainControls.tsx` — all fields map into Eq 1.10 (Supply Chain Uncertainty); the supply-chain module combines them in two channels (training delay, deployment cost + adoption drag).

#### Supply Shock Scenarios (7 input constraints)

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| AI Chip Availability | `config.supplyChainConfig.inputs.aiChips` | 0–100 | Eq 1.10 | Capacity index for AI semiconductors (100 = baseline, <100 = shortage). |
| Energy Price Level | `config.supplyChainConfig.inputs.energyPrice` | 50–500 | Eq 1.10 | Index for electricity costs to datacenters (100 = baseline; >100 raises deployment cost). |
| Grid Capacity for AI | `config.supplyChainConfig.inputs.energyCapacity` | 0–100 | Eq 1.10 | Power-grid availability for AI infrastructure. |
| Training DC Capacity | `config.supplyChainConfig.inputs.trainingDCCapacity` | 0–100 | Eq 1.10 | Datacentre availability for model training. Feeds the capability-delay channel. |
| Inference DC Capacity | `config.supplyChainConfig.inputs.inferenceDCCapacity` | 0–100 | Eq 1.10 | Datacentre availability for inference/serving. Feeds the deployment-cost multiplier. |
| Robotics HW Availability | `config.supplyChainConfig.inputs.roboticsHardware` | 0–100 | Eq 1.10 | Supply of robotics hardware. Feeds deployment cost for embodied-AI tasks. |
| Software Efficiency | `config.supplyChainConfig.inputs.softwareEfficiency` | 50–300 | Eq 1.10 | Algorithmic efficiency index (100 = baseline). Offsets constraint effects. |

#### Cost Pass-Through

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Lab → Deployer Rate | `config.supplyChainConfig.costPassThroughRate` | 0–1 | Eq 1.10 | Fraction of lab/training costs passed on to AI service deployers. |
| Deployer → Consumer Rate | `config.supplyChainConfig.consumerPassThroughRate` | 0–1 | Eq 1.10 | Fraction of deployer costs passed on to consumer prices. |

#### Training Cost Dynamics (per component: aiChips, energy, datacenter)

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Chip / Energy / DC Cost Decline | `config.supplyChainConfig.trainingDynamics.{aiChips,energy,datacenter}.techDeclineRate` | −80% to +30% / yr | Eq 1.10 | Annual tech-driven cost change for each training component (negative = costs fall). |
| Chip / Energy / DC Scale Pressure | `config.supplyChainConfig.trainingDynamics.{aiChips,energy,datacenter}.scalePressure` | 0–0.50 | Eq 1.10 | Multiplicative cost increase from scaling training compute (applied to `scalingLnGrowth × scalePressure`). |
| DC Regulatory Friction | `config.supplyChainConfig.regulatoryFriction` | 0.1–5.0 | Eq 1.10 | Cost multiplier from zoning/environmental delays on datacentre build-out. |
| Training Scale Growth | `config.supplyChainConfig.trainingScaleGrowthRate` | 1.0–10.0 ×/yr | Eq 1.10 | Annual multiplier on training compute scale; drives the `scalingLnGrowth` term. |

#### Training Cost Composition

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Chip / Energy / DC Cost Share | `config.supplyChainConfig.trainingComposition.{aiChips,energy,datacenter}` | 0–1 (auto-normalized) | Eq 1.10 | Initial shares of total training cost. The three values auto-normalize to sum to 1. |

#### Procurement Constraints

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Chip / Energy / DC Procurement Share | `config.supplyChainConfig.procurementShares.{aiChips,energy,datacenter}` | 0–1 (auto-normalized) | Eq 1.10 | Fraction of each physical-throughput constraint's weight in the procurement-bottleneck calculation. |
| Cost vs Procurement Blend | `config.supplyChainConfig.costVsProcurementBlend` | 0–1 | Eq 1.10 | Weights cost-based (0) vs physical-procurement (1) constraints when both apply. |

#### Supply Resilience

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Chip Fab Resilience | `config.supplyChainConfig.resilience.aiChips` | 0–0.85 | Eq 1.10 | Fraction of chip supply domestically substitutable / resilient to shock. Reduces the deployment-constraint effect of chip shortages. |
| Energy Grid Resilience | `config.supplyChainConfig.resilience.energy` | 0–0.95 | Eq 1.10 | Fraction of power supply reroutable/resilient. |
| Training DC Resilience | `config.supplyChainConfig.resilience.trainingDC` | 0–0.95 | Eq 1.10 | Fraction of training capacity available from alternative/domestic sources. Reduces training capability delay. |
| Inference DC Resilience | `config.supplyChainConfig.resilience.inferenceDC` | 0–0.95 | Eq 1.10 | Fraction of inference capacity resilient to constraint. Reduces deployment cost multiplier. |
| Rare Earth Resilience | `config.supplyChainConfig.resilience.roboticsHardware` | 0–0.85 | Eq 1.10 | Fraction of robotics-hardware supply resilient to geopolitical shock. |

#### Cascade & Hysteresis

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Chip Cascade Lag | `config.supplyChainConfig.chipCascadeLag` | 1–5 yr | Eq 1.10 | Delay for older-node chips to cascade to market after newer nodes saturate. |
| Cascade Cost Premium | `config.supplyChainConfig.chipCascadeCostPremium` | 0%–50% | Eq 1.10 | Markup on the leading-edge node relative to older cascaded nodes; feeds `effectiveComputeDeclineRate`. |
| Cognitive Hysteresis Max | `config.supplyChainConfig.hysteresisMaxCognitive` | 0–0.50 | Eq 1.10 | Maximum width of the adoption/de-adoption hysteresis band for cognitive tasks; prevents flicker when conditions hover near the threshold. |
| Embodied Hysteresis Max | `config.supplyChainConfig.hysteresisMaxEmbodied` | 0–0.60 | Eq 1.10 | Same as above for embodied (robotics) tasks — physical deployment has a wider hysteresis band. |

---

### 3.9 Fiscal & Monetary

`FiscalMonetaryControls.tsx`

#### Yield Calibration

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Neutral Real Rate (r*) | `config.neutralRealRate` | −1% to +3% | Eq 6.8, Eq 6.9 | Long-run equilibrium real interest rate; floor for the policy rate when inflation is at target. |
| Term Premium | `config.termPremium` | 0–2% | Eq 6.8 | Duration compensation investors demand for the 10-year bond over overnight rates. |
| Inflation Convergence (yrs) | `config.inflationConvergenceYears` | 1–15 | Eq 6.8 | Years over which current inflation blends toward the target in the Taylor-Rule inflation-expectation input. |
| Inflation Target | `config.inflationTarget` | −2% to +10% | Eq 6.8, Eq 6.9 | Fed target inflation rate (default 2%). Drives the inflation-gap term in the Taylor Rule. |
| Effective Lower Bound | `config.effectiveLowerBound` | −5% to +1% | Eq 6.9 | Floor on the prescribed policy rate (baseline ≈ 0, but adjustable). |

#### Fiscal Dominance

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Fiscal Dom. Threshold | `config.fiscalDominanceThreshold` | 5%–60% | Eq 6.9 | Debt-service / revenue ratio above which the fiscal-dominance constraint activates and caps rate hikes. |
| Fiscal Dom. Dampening | `config.fiscalDominanceDampening` | 0–1 | Eq 6.9 | Fraction by which the Fed's rate prescription is attenuated when fiscal dominance is active (1 = fully paralyzed). |

#### Fiscal Risk Premium (3-component bond pricing)

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Risk Premium Max | `config.fiscalRiskPremiumMax` | 1%–15% | Eq 6.8 | Maximum spread added to the 10-year yield from fiscal stress. |
| Trajectory Weight | `config.fiscalRiskTrajectoryWeight` | 0–1 | Eq 6.8 | Weight on the trajectory component (rising vs stabilising deficits) in `fiscalRiskPremium`. |
| Sustainability Weight | `config.fiscalRiskSustainabilityWeight` | 0–1 | Eq 6.8 | Weight on the sustainability component (r − g divergence). |
| Level Weight | `config.fiscalRiskLevelWeight` | 0–1 | Eq 6.8 | Weight on the absolute-level component (debt/GDP above midpoint). |
| Level Midpoint (Debt/GDP) | `config.fiscalRiskLevelMidpoint` | 1.0–4.0 | Eq 6.8 | Debt/GDP level around which the level-component risk premium is centred. |

#### Tax & Market

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Corp. Tax Effectiveness | `config.corporateTaxEffectiveness` | 10%–100% | Eq 6.5 | Fraction of the statutory corporate tax rate that is actually collected (base elasticity). |
| Foreign Treasury Demand | `config.foreignTreasuryDemand` | 5%–60% | Eq 6.8 | Fraction of new Treasury issuance absorbed by foreign buyers; dampens yield pressure. |
| AI P/E Multiplier | `config.aiPEMultiplier` | 0.5–3.0 | Eq 6.7 | Valuation multiple applied to the AI sector relative to the traditional sector in the equity-market computation. |

#### Fed Funds Rate Override

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Override toggle | `config.policyRateSchedule.keyframes.length > 0` | on/off | Eq 6.9 | When enabled, the manual policy-rate schedule below replaces the Taylor-Rule prescription for that year. |
| Policy Rate (keyframe schedule) | `config.policyRateSchedule` | −5% to +15% | Eq 6.9, Eq 6.8 | Year-by-year explicit Fed policy rate. Feeds directly into the bond-market and monetization calculations. |

---

### 3.10 Policy Interventions

#### 3.10a Tax Rates — `TaxRateControls.tsx`

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Income Tax Rate | `config.taxConfig.incomeTaxRate` | 0–50% | Eq 6.5 | Effective federal income-tax rate on wages; feeds `revenue = effectiveTaxRate × GDP` via the tax-config override chain. |
| Payroll Tax Rate | `config.taxConfig.payrollTaxRate` | 0–50% | Eq 6.5 | Combined employee + employer Social Security / Medicare payroll tax. |
| Corporate Tax Rate | `config.taxConfig.corporateTaxRate` | 0–50% | Eq 6.5, Eq 7.7 | Federal statutory corporate income tax. |
| Capital Gains Tax Rate | `config.taxConfig.capitalGainsTaxRate` | 0–50% | Eq 6.5 | Tax on realised asset gains (long-term basis). |

#### 3.10b Policy Cards — `PolicyControls.tsx`

Each card has an enable/disable toggle plus parameter sliders and/or keyframe schedules.

**Wage channel**

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Minimum Wage toggle | `config.policyConfig.minimumWage.enabled` | on/off | Eq 4.3, Eq 7.5 | Enables the minimum-wage floor policy. Feeds `policyWageFloor` in the Phillips curve. |
| Federal Minimum (schedule) | `config.policyConfig.minimumWage.federalMinimum` | $7.25–$30/hr | Eq 4.3, Eq 7.5 | Year-by-year federal minimum wage (PolicySchedule keyframes). |
| Wage Subsidy toggle | `config.policyConfig.wageSubsidy.enabled` | on/off | Eq 7.5 | Enables the employer-side wage subsidy. |
| Subsidy % (schedule) | `config.policyConfig.wageSubsidy.subsidyPercentage` | 0–30% | Eq 7.5 | Fraction of wage the government subsidises: `subsidyPct × avgWage × employment`. |
| Max per Worker | `config.policyConfig.wageSubsidy.maxSubsidyPerWorker` | $0–$20,000 | Eq 7.5 | Annual cap on per-worker subsidy amount. |

**Asset channel**

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Sovereign Wealth Fund toggle | `config.policyConfig.sovereignWealthFund.enabled` | on/off | Eq 7.5, Eq 3.1 | Enables the government equity fund (SWF + Universal Equity merged). |
| Initial Fund Size | `config.policyConfig.sovereignWealthFund.initialFundSize` | $0–$5,000 B | Eq 7.5 | Starting capitalisation of the fund in the base year. |
| Annual Contribution (schedule) | `config.policyConfig.sovereignWealthFund.annualContribution` | $0–$500 B/yr | Eq 7.5 | Year-by-year budget contribution that grows the fund. |
| Distribution Rate | `config.policyConfig.sovereignWealthFund.distributionRate` | 0–10% | Eq 7.5, Eq 3.2 | Annual fraction of fund corpus paid out as citizen dividends. Distributions are routed through the transfer-MPC channel. |
| Equity Ownership Fraction (schedule) | `config.policyConfig.sovereignWealthFund.ownershipFraction` | 0–50% | Eq 7.5 | Fraction of AI-company profits claimed by the SWF each year. |
| AI Company Profits | `config.policyConfig.sovereignWealthFund.totalAICompanyProfits` | $100–$2,000 B/yr | Eq 7.5 | Exogenous baseline of total AI company profits used to size `ownershipFraction × profits`. |
| Profit Sharing toggle | `config.policyConfig.profitSharing.enabled` | on/off | Eq 7.5 | Enables mandatory corporate profit sharing with workers. |
| Mandatory Share (schedule) | `config.policyConfig.profitSharing.mandatorySharePercentage` | 0–30% | Eq 7.5 | `mandatoryShare × aiProfits` redistributed to workers. |

**Transfer channel**

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| UBI toggle | `config.policyConfig.ubi.enabled` | on/off | Eq 7.5, Eq 3.1 | Enables universal basic income. |
| Monthly Amount (schedule) | `config.policyConfig.ubi.monthlyAmount` | $0–$10,000/mo | Eq 7.5 | Per-capita monthly UBI payment; annualised and multiplied by eligible adults. |
| Age Threshold | `config.policyConfig.ubi.ageThreshold` | 16–21 yr | Eq 7.5 | Minimum age for UBI eligibility; determines the eligible-adult fraction from Census data. |
| Enhanced UI toggle | `config.policyConfig.enhancedUI.enabled` | on/off | Eq 7.5 | Enables the higher-replacement-rate / longer-duration unemployment insurance policy. |
| Replacement Rate (schedule) | `config.policyConfig.enhancedUI.replacementRate` | 0–100% | Eq 7.5 | Fraction of pre-unemployment wage replaced by UI. |
| Duration | `config.policyConfig.enhancedUI.durationWeeks` | 0–104 wk | Eq 7.5 | Weeks of UI coverage per unemployed worker. |
| Retraining toggle | `config.policyConfig.retraining.enabled` | on/off | Eq 7.5 | Enables the displaced-worker retraining stipend. |
| Monthly Stipend (schedule) | `config.policyConfig.retraining.stipendMonthly` | $0–$5,000/mo | Eq 7.5 | Per-worker monthly income support during retraining. |
| Effectiveness | `config.policyConfig.retraining.effectivenessRate` | 0–100% | Eq 7.5 | Fraction of retrainees who successfully transition to new employment. |

#### 3.10c State Policy Overrides — `StatePolicyOverrides.tsx`

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Select State | (UI selector) | 50 states + DC | — | Picks which state's overrides are being edited. |
| Min Wage Override | `config.stateOverrides[stateCode].minimumWage` | $7.25–$25/hr | Eq 4.3 | State-level override of the federal minimum-wage schedule. |
| Additional UBI | `config.stateOverrides[stateCode].additionalUBI` | $0–$10,000/mo | Eq 3.1 | Supplementary state-level UBI on top of the federal amount. |
| UI Replacement Rate | `config.stateOverrides[stateCode].uiReplacementRate` | 0–100% | — | State-level override of the UI replacement rate. |
| AV Regulatory Environment | `config.stateOverrides[stateCode].avRegulatoryEnvironment` | permissive / moderate / restrictive | — | State regulatory stance for autonomous vehicles; adds a lag to AV deployment (permissive = 0 yr, moderate = 1 yr, restrictive = 3 yr). |
| Robotics Regulatory Environment | `config.stateOverrides[stateCode].roboticsRegulatoryEnvironment` | permissive / moderate / restrictive | — | State regulatory stance for robotics deployment; same lag structure as AV. |

---

## Shared UI Components

These are reusable controls referenced by the cards above — they do not expose new parameters:

- **`PolicyKeyframeEditor.tsx`** — generic time-varying `PolicySchedule` editor (constant / linear ramp / custom multi-keyframe). Used by every `(schedule)` field above.
- **`ParameterRow.tsx`** — renders a single parameter in `YearParameterSection` with baseline → autopilot → override provenance.
- **`CollapsibleSection.tsx`**, **`DimensionSlider.tsx`**, **`FiscalPresetSelector.tsx`**, **`BaselineComparisonToggle.tsx`**, **`CapabilitySparkline.tsx`**, **`BFCSScoreBar.tsx`** — UI primitives with no additional parameters beyond what the parent card exposes.

---

## Notes

- Equation numbers correspond to the current `MethodologyView.tsx` after the Phase 9 / 10.A updates (45 → 52 equation cards). If cards are renumbered, re-run the audit.
- Every `DEFAULT_*` constant cited in a description is defined in `src/models/constants.ts` with a JSDoc source citation (BLS, BEA, FRED, CBO, or academic paper).
- Where a slider is marked *DEPRECATED* (e.g. `aiWageProductivityMultiplier`, the legacy `aiCostParams.inferenceAnnualChange`), it is retained per the no-delete rule but has been superseded by a Phase 10.A replacement — the modern path is noted in the description.
- Fields whose Description is intentionally blank are ones where the effect on the model could not be unambiguously derived from the code comments or equations; update them as the relevant constants gain JSDoc coverage.
