# ATLAS User Parameter Reference

Every user-adjustable control in ATLAS, mapped to the config field it writes, the equation(s) in `MethodologyView.tsx` where it appears, and a plain-English description of its role.

Equation references (e.g. `Eq 1.3`) point to the numbered cards in `src/components/charts/MethodologyView.tsx`.

Descriptions are derived from JSDoc comments on the `DEFAULT_*` constants in `src/models/constants.ts` and the surrounding code in the model files. Where the effect of a control is not clearly documented or cannot be inferred unambiguously from the equation, the Description field is intentionally left blank.

---

## How the controls are organized: three tiers over one registry

ATLAS exposes its parameters at three depths. Which one you use depends on how much of the model you want in your hands; all three drive the same simulation through the same resolution rules (the composition system — see the methodology document §13).

1. **Worldview bundles** (the Scenarios area of the left sidebar). Named belief-only selections — one tap applies a coherent set of answers to the belief questions; one tap clears it. Your events and policy choices are untouched.
2. **The worldview sidebar** (the left panel). Four zones, topmost first: the data-calibration question (whose measurements ground the model — see "The Data-Calibration Selector" below), belief questions (fourteen axes in six groups, each answered by picking a variant), events (time-anchored happenings with an anchor-year control), and policy packages (revocable choices). Nothing here is a slider; everything is a named selection with its reasoning one tap away.
3. **The Advanced view** (the Advanced tab). Every live model parameter, rendered from the parameter registry (the dial table, `src/data/dialTable.ts`): a control per parameter, an authored title, a plain-English explanation where one has been written, a citation badge (cited / episode / uncertain), and a provenance badge when a worldview or package set the value. Values you change here shadow the worldview (badged, one-tap reset). The view also carries a search box with filter chips, a changed-from-default summary, the per-year parameter strip, and the container editors (per-cluster and per-role thresholds, tax rates, support programs, the policy-rate schedule, state overrides).

The registry is the organizing spine: each row carries the parameter's bounds, default, citation status, owning belief question, and control class. The tables below remain the per-parameter reference (label, config field, range, equation, description); where a table's section header names a location, the location is the Advanced view unless stated otherwise.

---

## 1. Fiscal Response (top-level)

`FiscalResponseSection.tsx` + `FiscalPresetSelector.tsx` + `DimensionSlider.tsx`

### 1a. Fiscal Policy Preset

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Fiscal Policy preset | `config.fiscalPolicyPreset` | observed_political_economy / gradual_stabilization / austerity / tax_the_winners / balanced_reduction / gridlock / no_fiscal_response / custom | Eq 5.3 | Selects a named fiscal-response profile. Each preset sets the four fiscal dimensions (spending/revenue mix, safety net, reaction timing, adjustment speed) to a documented historical or canonical stance (UK 2010 austerity, Nordic tax-the-winners, Simpson-Bowles balanced, US political gridlock, no-response stress test). "custom" unlocks the dimension pickers below. |

### 1b. Fiscal Policy Dimensions (visible when "Customize" expanded)

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Spending vs Revenue | dimension picker (writes `config.fiscalPolicyCustom` fields) | All Cuts / Mostly Cuts / Balanced / Mostly Revenue / All Revenue | Eq 5.3 | How the fiscal adjustment splits between spending cuts and revenue increases. Maps to `maxDiscretionaryCut`, `maxObligationCut`, `maxRevenueIncrease` in the resolved profile. |
| Safety Net Protection | dimension picker (writes `config.fiscalPolicyCustom` fields) | Full Protection / Partial Erosion / Budget Priority | Eq 5.3 | Whether transfer payments remain fully indexed to inflation or are eroded via COLA dampening under fiscal stress. Maps to `colaDampeningRate`, `colaDampeningThreshold`, `colaDampeningMaxCIF`. |
| Reaction Timing | dimension picker (writes `config.fiscalPolicyCustom` fields) | Early Response / Standard / Late Response | Eq 5.3 | The debt/GDP level at which consolidation begins (Early ≈ 1.0×, Standard ≈ 1.5×, Late ≈ 2.5×). Maps to `consolidationThreshold`, `consolidationMaxThreshold`. |
| Adjustment Speed | dimension picker (writes `config.fiscalPolicyCustom` fields) | Immediate / 1-Year Lag / 2-Year Lag / Gridlock | Eq 5.3 | Years of political delay before Congress acts on the consolidation trigger. Maps to `consolidationLag`. |

### 1c. Federal Reserve Preset

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Federal Reserve preset | `config.federalReservePreset` | price_stability / balanced_mandate / employment_focused / maximum_accommodation / custom | Eq 6.9 | Selects a Fed policy stance. Sets the inflation-gap weight α in the Taylor Rule (2.0 hawkish → 0.8 super-dove) and QE parameters. "custom" unlocks the dimensions below. |

### 1d. Federal Reserve Dimensions (visible when "Customize" expanded)

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Inflation vs Employment | dimension picker (writes `config.federalReserveCustom` fields) | Price Stability / Balanced / Employment-Leaning / Employment-First | Eq 6.9 | Fed dual-mandate weighting. Changes the inflation-gap coefficient and the output-gap / employment-gap terms in the Taylor Rule. |
| Bond Market Operations | dimension picker (writes `config.federalReserveCustom` fields) | Minimal Intervention / Standard Operations / Active Purchases / Aggressive QE | Eq 6.8 | How aggressively the Fed intervenes in the bond market — sets QE monetization rate, financial-repression cap, yield-responsive threshold, and max yield-response rate. |

### 1e. Baseline Comparison

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Show Baseline Comparison | store toggle `showBaselineComparison` (not a config field) | on/off | — | UI-only toggle; renders the unmodified 2025 baseline alongside the current scenario in charts. |

---

## 2. Year Parameters

`YearParameterSection.tsx` — exposes per-year, sticky-forward overrides (written to `config.parameterOverrides` as `"param:year"` keys and resolved through the baseline → autopilot → override layers in `parameterResolution.ts`) for the parameters the simulation actually reads back each year.

The sidebar shows 40 rows in 9 groups. 35 are editable and live: the fiscal consolidation multipliers (discretionary, obligation, intensity), the four effective tax rates, the two monetary levers (QE monetization rate, financial-repression cap), the three Taylor-rule coefficients, and the 23 supply-chain rows across four groups (Supply Shock Scenarios, Supply Resilience, Training Cost Dynamics, Supply Chain Economics). 5 are read-only displays: the three capability levels (computed from the S-curves) and two fiscal rows (`fiscalRevenueMultiplier`, `effectiveColaDampeningFactor`) whose displayed autopilot values are what the engine uses but whose user overrides were never read back.

The per-year tokens-per-task multiplier row is retired. The global tokens-per-task schedule it overrode has been replaced by the frontier-intensity cost layer (four baseline dials — see §3.1, Inference Cost), and the economy-wide tokens-per-task path is now an emergent output rather than an input: the timeline CSV reports it in the `implied_aggregate_tokens_per_task` and `aggregate_frontier_weight` diagnostic columns.

The 22 supply-chain rows are live and consumed: the simulation loop resolves each of them per year through the same baseline → autopilot → override layers the sidebar records, so a per-year override changes execution in that year and forward (overrides are sticky-forward — a timed drop-and-recover shock is expressed with an explicit recovery override key). A 23rd supply-chain row, the chip price index (`supplyChainChipPrice`), joins the Supply Shock Scenarios group. The six policy-program rows remain hidden: they are resolved and recorded but the engine reads policy programs from `config.policyConfig` only, so editing them would change nothing; wiring them, if ruled, is pending. Provenance: [the audit summary](../FABLE_AUDIT_SUMMARY.md).

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
| Scarcity Intensity | `config.scarcityIntensity` | 0–1.0 | Eq 4.3 | Peak of the hump-shaped wage scarcity premium LEVEL `= scarcityIntensity × coverage × (1−coverage)`; its contribution to wage GROWTH is the year-over-year Δ of the level (wages rise as coverage→0.5, normalize beyond). |
| De-Adoption Speed (Cognitive) | `config.deAdoptionRateCognitive` | 0–0.5 /yr | Eq 1.11 | Maximum annual decline in a role's adoption rate for cognitive (software/hybrid) AI when adoption reverses — when the economics that justified deployment flip (cost shocks) or capability regresses below the hysteresis band. Default 0.10 (`ADOPTION_DECLINE_RATE_COGNITIVE`) — uncited; episode-anchored where the 2021–22 chip-shortage benchmark binds. |
| De-Adoption Speed (Embodied) | `config.deAdoptionRateEmbodied` | 0–0.5 /yr | Eq 1.11 | The same dial for embodied (robotics / vehicle) AI. Physical deployments unwind more slowly than software. Default 0.05 (`ADOPTION_DECLINE_RATE_EMBODIED`) — same uncited, episode-anchored status. |
| Re-Engagement Speed | `config.reAdoptionRate` | 0–1 × | Eq 1.11 | Cap on post-decline re-adoption, expressed as a fraction of the class's de-adoption rate: dismantling AI capacity is fast, rebuilding is slow (the standard labor-economics hiring asymmetry, mirrored). Re-hiring of humans during de-adoption is priced from, and capped by, the displaced-worker pool (§3.2). Default 0.5× (`DEFAULT_RE_ADOPTION_RATE_FRACTION`) — uncited structural dial. |

These three dials govern the adoption state machine — the mechanism by which adoption can
reverse. In plain terms: a deployed automation does not simply stay deployed. While its
economics hold, a role's adoption grows along the S-curve; when its scores dip inside the
switching-cost (hysteresis) band it freezes; and it reverses when capability or input
availability genuinely regresses, or when re-hiring people from the displaced-worker pool
becomes cheaper than continuing automation by more than the band. Cost-triggered reversal
is priced at the pool's composition-weighted re-entry wage and throttled by the pool's
employability-weighted size (§3.2, Jobless Measures & the Displaced-Worker Duration Pool).
Implementation: `computeUnifiedAdoptionState` in `src/models/adoption.ts`; the re-hiring
wage basis and fill capacity come from `poolRehireWage` and `poolFillBudget` in
`src/models/uiIncidence.ts`.

##### The Endogenous Wage Equation (`WageEquationControls`)

`nominalWageGrowth = inflationIndexation × compositeInflation(t−1) + productivityPassthrough × perWorkerProductivity − phillipsSlope × max(0, UE−NAIRU) + Δ scarcityPremiumLevel`, with `× (1 − downwardWageRigidity)` when negative.

| Label | Config Field | Default | Range | Description |
|---|---|---|---|---|
| Inflation Indexation | `config.inflationIndexation` | 1.0 | 0–1.5 | Fraction of LAGGED composite inflation passed into nominal wage growth (COLA). 1.0 = full indexation. Lagged (R7) to break the wage-price spiral. |
| Productivity Passthrough | `config.productivityPassthrough` | 1.0 | 0–1.5 | Fraction of genuine per-worker productivity growth (1.6% = baselineGDPGrowth − population) reaching wages. Population growth enters aggregate wage income via employment, not the wage level. |
| Phillips Slope | `config.phillipsSlope` | 0.30 | 0–1.0 | Wage-Phillips semi-elasticity: pp reduction in annual nominal wage growth per pp of excess unemployment. One-sided (below-NAIRU tightness does not boost). Source: Blanchard (2016) / Galí (0.2–0.5). |
| Downward Wage Rigidity | `config.downwardWageRigidity` | 0.60 | 0–1.0 | Asymmetric resistance to NOMINAL wage cuts: when growth would be negative, only (1−rigidity) passes through. 1.0 = wages never cut; 0 = fully flexible. **Daly & Hobijn (2014)** document strong nominal rigidity (spike at 0% wage change), but 1930–33 saw ~20–25% aggregate nominal-wage declines — so a single value cannot be 1.0; 0.60 keeps wages sticky in mild downturns yet lets them fall materially in a 40%-UE collapse. (Registered open item: duration/severity-dependent erosion of this rigidity — decision record: docs/FABLE_AUDIT_SUMMARY.md.) |

##### Residual Corporate Profits

`corporateProfits = GDP − wageBill − nonCorpIncome − otherCostsShare×GDP` — margins are OUTPUTS; labor share is a COMPUTED OUTPUT. The three-way split of AI gains is closed: prices (the sector passthroughs) → consumers; wage passthrough + rent-sharing → workers; capital gets the residual by identity.

| Label | Config Field | Default | Range | Description |
|---|---|---|---|---|
| Productivity Passthrough | `config.productivityPassthrough` | **0.90** (D-1) | 0–1.5 | Calibrated to the OBSERVED aggregate labor-share drift (≈ −0.10pp/yr; 1980-2020 fell only ~5-6pp). The famous productivity-pay "decoupling" is predominantly median/composition/deflator (Stansbury & Summers 2017; Lawrence; EPI) — **the ~0.3-class values are the misapplied median-capture figure and are explicitly rejected** for this parameter, which controls the labor-vs-capital split now that profits are residual. (D-3: `inflationIndexation` stays 1.0 — the 10.B 0.7 was a short-run passthrough misapplied to a 25-yr horizon; permanent real-wage erosion violates nominal homogeneity.) |
| Other Costs Share | `config.otherCostsShare` | ≈0.113 (init-derived) | 0.05–0.30 | Model-frame proxy of NIPA CFC (≈17% GDP) + production taxes (≈6.6%), net of the PI-frame wage-share wedge; derived at init so the year-0 residual = the BEA profit ratio exactly. |
| AI-Sector Labor Share | `config.aiSectorLaborShare` | 0.15 | 0–0.5 | 10.B: big-tech labor intensity. AI profits = aiGDP × (1−this) × (1−otherCostsShare); per-worker equity capture is a Stage-8 distribution matter. |
| Rent-Sharing Elasticity | `config.rentSharingElasticity` | 0.10 | 0–0.3 | Wage-growth clawback per unit profit-share deviation (Card, Cardoso, Heining & Kline 2018; surveyed 0.05-0.15). TWO-SIDED: recessions compress rent-sharing (stabilizing) — contrast the one-sided investor land bid (R24). |
| Secular Profit Drift | `config.secularProfitDriftRate` | 0.001/yr | 0–0.003 | **The worldview fork as one dial** (Q-2): at 0.001 the rent-sharing baseline drifts at the observed 1980-2020 labor-share-decline rate (the trend continues); at **0** the baseline is constant and rent-sharing makes the D-1 drift self-limiting (asymptote ≈ −1.6pp — the post-2015-stabilization reading). Same number as the D-1 calibration; no new free constant. |

##### Unified Incremental-Unemployment Transfer Support

Single source of truth: household income (cash), consumption (in-kind, NIPA PCE), and the federal budget (sum) all read these two constants per incrementally unemployed person.

| Label | Config Field | Default | Range | Description |
|---|---|---|---|---|
| Cash Support per Unemployed | `config.cashTransferPerUnemployed` | 8,000 | 0–40,000 | Annual CASH support per incremental unemployed in 2025 dollars (→ transfer income → MPC → C); indexed over time by the COLA index (never cut nominally; subject to the COLA-dampening lever). Stock-average with recipiency baked in: UI = $430/wk (DOL ETA CY2024 AWBA) × 28% stock recipiency × 52 ≈ $6,260; SNAP = $345/mo household (USDA FNS FY2024) × 40% receipt ≈ $1,700. |
| In-Kind Support per Unemployed | `config.inKindTransferPerUnemployed` | 5,000 | 0–30,000 | Annual IN-KIND support per incremental unemployed in 2025 dollars (→ PCE consumption directly; also a budget outlay; NOT cash income, untaxed, bypasses MPC and credit multipliers); indexed over time by the cumulative labor-services sector price index (healthcare is labor-services consumption, so this support inflates with that sector and deflates with the Baumol channel). Medicaid ≈ $4,500 (KFF FY2021 per-enrollee × 0.75 Great-Recession enrollment elasticity) + ACA APTC ≈ $500. |
| Replacement Multiplier | `config.replacementMultiplier` | 0.5–10.0 | Eq 1.9 | Multiplier in the AI replacement productivity formula: `effectiveProductivity = 1 + weightedCapability × betterScore × replacementMultiplier × (1 + cheaperScore)`. Drives the "more output per displaced worker" effect in Eq 5.5. |

#### `InferenceCostCurveControls.tsx` (Phase 10.A floored decay + frontier-intensity layer)

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Floor (asymptotic) | `config.aiCostParams.tokenCostCurve.floor` | 0.0001–0.1 | Eq 4.2 | Asymptotic floor of the per-token cost curve: costs decay toward this fraction of the 2025 baseline and never go below it. |
| Decay rate (k) | `config.aiCostParams.tokenCostCurve.k` | 0.1–2.0 | Eq 4.2 | k parameter in `floor + (1 − floor) × exp(−k × t^decayExponent)`. Higher k = faster initial decline. |
| Decay exponent | `config.aiCostParams.tokenCostCurve.decayExponent` | 0.3–1.0 | Eq 4.2 | Exponent on time in the same formula. Higher values make the early decline steeper and the tail flatter. |
| Frontier Intensity (2026) | `config.aiCostParams.frontierIntensityLevel` | 1–100 | — | Frontier tokens-per-task multiple at the 2026 anchor: how many times more tokens a task performed at the capability frontier consumes than the 2025 single-shot baseline (default 20, from the observed 2023–2026 reasoning-class intensity record). |
| Frontier Intensity Growth | `config.aiCostParams.frontierIntensityGrowth` | −0.15 to +0.40 /yr | — | Annual growth of frontier token intensity after the 2026 anchor (default +0.05/yr — a stated modeling judgment, not a citation). Absolute frontier per-task cost climbs only when this growth exceeds the per-token decline rate (~26%/yr in the early window); the range top expresses a runaway-frontier world, the range bottom a chip-abundant world where frontier intensity itself compresses. |
| Migration σ (surplus to halve) | `config.aiCostParams.sigmaMigration` | 0.02–1.0 | — | Capability surplus (Better score above a role's requirement) at which the role's frontier reliance halves; once the frontier surpasses a role, its work migrates off frontier pricing onto the fixed-capability cost curve at this rate. Uncited structural dial. |
| Always-Frontier Floor | `config.aiCostParams.wMinFrontierFloor` | 0–0.5 | — | Floor on the frontier-reliance weight: the fraction of a role's work that stays frontier-priced no matter how large the capability surplus (default 0). Uncited. |

The economy-wide tokens-per-task path implied by these dials is an emergent output, reported in the timeline CSV as `implied_aggregate_tokens_per_task` alongside `aggregate_frontier_weight` (the employment-weighted frontier reliance).

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

#### Jobless Measures & the Displaced-Worker Duration Pool

The model reports joblessness two ways, because prolonged joblessness changes behavior:
some jobless people eventually stop searching for work and drop out of the measured labor
force. The headline measure counts every working-age person without a job, whether or not
they are still searching. The official statistic policymakers quote — the U-3 unemployment
rate — counts only active searchers. The model carries both measures, plus the stock of
people who have stopped searching, so the two are never silently conflated. The displaced
population is tracked as duration cohorts: how long each group has been jobless determines
its chance of giving up the search, how employable it remains, and the wage it can command
on re-entry.

The measures, precisely (all are point-in-time values for the stated year):

| Output Field | CSV Column | Definition |
|---|---|---|
| `unemploymentRate` | `unemployment_rate` | The headline, broad-consistent measure: all working-age jobless in the exogenous labor force — `(laborForce − totalEmployment) / laborForce`. Every internal feedback consumer (wage Phillips slack, the Federal Reserve employment gap, transfer headcounts) reads this measure. It is an upper bound on the official U-3 rate. |
| `u3UnemploymentRate` | `u3_unemployment_rate` | Searchers only: discouragement exits are removed from both numerator and denominator — `(totalUnemployment − laborForceExitedStock) / (laborForce − laborForceExitedStock)`. Compare this series, not the headline, to the official U-3 statistic. |
| `laborForceExitedStock` | `labor_force_exited_stock` | Persons who have stopped searching (cumulative discouragement exits from the displaced pool). The gap between the two rates above. |
| `employmentToPopulation` | `employment_to_population` | `totalEmployment / totalPopulation`. Uses total population, not the working-age subset. |
| `longTermJoblessShare` | `long_term_jobless_share` | Fraction of the still-searching displaced pool jobless for one year or longer. |
| `meanJoblessDurationYears` | `mean_jobless_duration_years` | Cohort-weighted mean years jobless across the still-searching displaced pool. |

**The jobless-measures caveat.** The headline `unemploymentRate` is the broad measure: it
includes discouraged workers who have left the measured labor force. The U-3-consistent
rate is exported alongside it. In deep-displacement scenarios the two diverge widely — by
tens of percentage points once discouragement exits accumulate — so any reader comparing
model output to the published Bureau of Labor Statistics U-3 statistic must use the
`u3UnemploymentRate` field, never the headline rate. The methodology card for these
measures is Eq 2.7.

The pool's dynamics are governed by four dials. **These have no sidebar control yet** —
they are reachable through the parameter CSV (`pool.exit_base`, `pool.exit_duration_slope`,
`pool.atrophy_rate`, `pool.wage_scarring_rate`) and saved-scenario JSON (see the
Reachability Register).

| Dial | Config Field | Default | Range | Basis |
|---|---|---|---|---|
| Discouragement Exit Hazard | `config.exitBase` | 0.05 /yr | 0–0.3 | Annual probability that a displaced searcher stops searching and leaves the measured labor force. Anchor: Current Population Survey unemployed→not-in-labor-force transition flows — honest-flagged: the anchor is registered but not yet committed as a citation. Constant: `DEFAULT_POOL_EXIT_BASE`. |
| Exit Duration Slope | `config.exitDurationSlope` | 0.3 | 0–1 | Steepens the exit hazard with time jobless: `hazard = exitBase × (1 + slope × yearsJobless)`. Same anchor and citation status. Constant: `DEFAULT_POOL_EXIT_DURATION_SLOPE`. |
| Skill Atrophy Rate | `config.atrophyRate` | 0.10 /yr | 0–0.3 | Employability decay per jobless year: `(1 − rate)^years` weights the pool's effective supply for re-hiring. Anchor: Kroft, Lange & Notowidigdo — employer callback rates decay with unemployment duration. Constant: `DEFAULT_POOL_ATROPHY_RATE`. |
| Wage Scarring Rate | `config.wageScarringRate` | 0.02 /yr | 0–0.1 (total loss capped at 0.25) | Re-entry wage reduction per jobless year: `1 − min(0.25, rate × years)`. Anchor: Jacobson, LaLonde & Sullivan; Davis & von Wachter — displaced-worker earnings losses of 15–25%. Constant: `DEFAULT_POOL_WAGE_SCARRING_RATE`. |

Implementation: the cohort machinery is `advanceDisplacedPool` and `poolDurationShares` in
`src/models/uiIncidence.ts`; the year loop in `src/models/simulation.ts` advances the pool,
derives the five output fields, and feeds the duration shares to unemployment-insurance
entitlement pricing (`computeTransferPolicyEffect`, `src/models/policy.ts`).

#### `FeedbackControls.tsx`

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Rev. Pressure Sensitivity | `config.revenuePressureSensitivity` | 0–3 | Eq 1.5 | `sensitivity` in `newPressure = min(cap, sensitivity × max(0, −gdpGrowthRate))` — how strongly GDP contraction accelerates automation. |
| Rev. Pressure Cap | `config.revenuePressureCap` | 0–1 | Eq 1.5 | Ceiling on total automation acceleration from revenue pressure + credit combined. |
| Rev. Pressure Decay | `config.revenuePressureDecay` | 0–1 | Eq 1.5 | Persistence factor on prior-year pressure. Half-life ≈ 1 year at the 0.5 default — prevents infinite compounding after conditions recover. |
| AI Wage Premium | `config.aiWageProductivityMultiplier` | 0–1 | — | **Control removed** — dead: written into the second-order parameter bundle but never read (the Phase-10.A retirement). Field retained; probe-guarded. |
| Wage-UE Sensitivity | `config.phillipsCurveSensitivity` | 0–5 | — | **Control removed** — dead: its consumer `computeWagePressure` was retired by the endogenous wage equation (whose live slope dial is `phillipsSlope`, §3.1). Field retained; probe-guarded. |

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
| Credit Inv. Response Sens. | `config.creditInvestmentResponseSensitivity` | 0–100 | — | **Control removed** — dead on the simulation path (both readers of the `creditExp` mapping are commented out since the Phase-6 credit split); field retained (no-delete rule), deadness enforced by `stageH-honesty.test.ts`. |
| Trad. Inv. Demand Sens. | `config.traditionalInvestmentDemandSensitivity` | 0–100 | Eq 5.2 | Sensitivity of traditional (non-AI) investment to consumer demand; feeds `tradDemandFactor`. |
| Trad. Inv. GDP Fraction | `config.traditionalInvestmentGDPFraction` | 5%–40% | Eq 5.2 | Baseline fraction of prior-year nominal GDP allocated to traditional private fixed investment. Data-driven default from BEA. |

#### Corporate & Profits

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| AI Profit Margin | `config.aiProfitMargin` | 5%–60% | — | **Control removed** — dead: corporate profits are the accounting residual (GDP − wages − other costs) since the residual-profits redesign; the margin input is explicitly voided in `macro.ts`. Field retained; deadness enforced by `stageH-honesty.test.ts`. |
| Traditional Profit Margin | `config.traditionalProfitMargin` | 2%–30% | — | **Control removed** — dead: same residual-profits voiding as the AI margin. Field retained; probe-guarded. |
| Corporate Retention | `config.corporateRetentionRate` | 0–1 | Eq 3.1 | Fraction of after-tax profits retained by corporations (not paid as dividends). Complement flows into the asset-income channel. |
| AI Market Power | `config.aiProfitGrowthRate` | discrete 0.5–10× | — | **Control removed** — dead: the P/E channel now uses endogenous earnings growth; this multiplier's reader was retired. Field retained; probe-guarded. |

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
| Inference Cost Change | `config.aiCostParams.inferenceAnnualChange` | −80% to +50%/yr | — | **Control removed** — the legacy constant-rate leg's only remaining consumers are diagnostics (the automation-dividend and cost-index CSV columns and the dormant supply-chain cascade rate); the live inference-cost path is the floored token curve blended with the frontier-intensity layer (both §3.1); the retired global tokens-per-task schedule is superseded by that layer, and the aggregate tokens-per-task path is an emergent output (`implied_aggregate_tokens_per_task`). Moving this dial never changed the economy. Field retained; probe-guarded (economic identity AND diagnostic movement asserted). |
| Manufacturing Cost Change | `config.aiCostParams.manufacturingAnnualChange` | −50% to +50%/yr | Eq 4.2 | Annual cost decline rate for AI manufacturing components (the manufacturing slice of sector AI cost). |
| Energy Cost Change | `config.aiCostParams.energyAnnualChange` | −50% to +50%/yr | Eq 4.2 | Annual cost decline rate for AI energy input (the energy slice of sector AI cost). |
| Scarcity Pass-Through | `config.scarcityPassThrough` | 0–1 | Eq 2.6 | Fraction of sector-level labor scarcity passed through to goods prices: `scarcityInflation = Σ(laborScarcity × employmentShare × passThrough)`. |
| Wage Pass-Through | `config.wagePassThrough` | 0–1 | — | Fraction of unit-labor-cost increases passed through to prices. |
| Wage Automation Sensitivity | `config.wageAutomationSensitivity` | 0–1 | — | Sensitivity of automation adoption to minimum-wage cost pressure (higher minimum wage → more automation). |

#### Sectoral Price Architecture

Composite CPI = weighted blend of four consumption sectors (§5.2.3). Each sector's CPI weight is user-adjustable (normalized to sum 1). Each **passthrough** is "the fraction of AI cost savings reaching consumer prices in this sector, **net of regulatory friction and government policy**" — this single knob deliberately absorbs regulation, permitting, and supply-management policy. The cluster→sector routing (R10) is a documented constant, **not** user-adjustable.

| Label | Config Field | Default | Range | Description |
|---|---|---|---|---|
| AI-Exposed CPI Weight | `config.aiExposedCPIWeight` | 0.22 | 0–1 | Consumption share of AI-exposed goods & services (durables, info/comm, financial & professional, etc.). |
| Labor-Services CPI Weight | `config.laborServicesCPIWeight` | 0.22 | 0–1 | Consumption share of labor-intensive services (medical, education, transport/recreation services). |
| Food & Energy CPI Weight | `config.foodEnergyCPIWeight` | 0.20 | 0–1 | Consumption share of food + energy. |
| AI-Deflation Passthrough (AI-exposed) | `config.aiDeflationPassthrough` | 0.70 | 0–1 | Fraction of **cognitive** AI cost savings reaching AI-exposed prices (competitive → most savings pass; retained → margins). |
| Labor-Services Passthrough | `config.laborServicesPassthrough` | 0.15 | 0–1 | Fraction of **embodied** (service-robotics) cost savings reaching service prices, net of licensing/regulatory friction. |
| Food & Energy Passthrough | `config.foodEnergyPassthrough` | 0.10 | 0–1 | Fraction of **embodied** (agricultural-automation) cost savings reaching food/energy prices, net of supply management. |
| Shelter Passthrough | `config.shelterPassthrough` | 0.05 | 0–1 | Fraction of **embodied** (construction-robotics) cost savings reaching shelter prices, net of housing/land-use regulation (near-zero by default). An interim hook; the stock-flow housing block carries the main shelter dynamics. |
| Labor Cost Share | `config.laborCostShare` | 0.60 | 0–1 | Labor compensation share of service-sector output (Baumol channel + embodied erosion of the labor-cost component). |

---

### 3.6 Credit & Financial

`CreditFinancialControls.tsx`

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Credit UE Sensitivity | `config.creditUESensitivity` | 0–5 | — | **Control removed** — dead: the pre-Phase-6 credit system these four dials drove is block-commented in `macro.ts`; the live credit machinery is the separated consumer/business system (whose eleven parameters are listed under Reachability — currently scenario-JSON only). Field retained; probe-guarded. |
| Credit → Investment | `config.creditInvestmentSensitivity` | 0–2 | — | **Control removed** — dead (old credit system, see above). Field retained; probe-guarded. |
| Credit → Consumption | `config.creditConsumptionSensitivity` | 0–2 | — | **Control removed** — dead (old credit system). Field retained; probe-guarded. |
| Max Credit Contraction | `config.maxCreditTightening` | 30%–100% | — | **Control removed** — dead (old credit system cap; the live cap is `maxConsumerTightening`). Field retained; probe-guarded. |
| Credit Deflation Sensitivity | `config.creditDeflationSensitivity` | 0–0.15 | Eq 4.1 | Sensitivity of the price level to credit contraction — the `creditDeflation` component of the 7-component net inflation. |
| Biz Credit GDP Sens. | `config.businessCreditGDPSensitivity` | 0–15 | — | **Control removed** — dead: no live reader (Phase-6 business credit replaced this channel). Field retained; probe-guarded. |
| Max Biz Credit Loosening | `config.maxBusinessCreditLoosening` | 0–1 | Eq 6.1 | Cap on how far business credit can loosen above baseline during sustained GDP growth. |
| Credit Adopt. Sens. | `config.creditAdoptionSensitivity` | 0–0.5 | Eq 1.6 | `sensitivity` in `creditAcceleration = min(cap, max(0, businessCreditSignal) × sensitivity)` — how strongly cheap business credit feeds into AI-adoption acceleration. |

---

### 3.7 Housing — the stock-flow model

**Framing: the DEFAULTS encode current regulatory/land-use reality (the supply-constrained regime the modern CPI-shelter data measured); the parameters are the REFORM LEVERS.** Users representing housing-abundance reform raise `housingSupplyElasticity` or lower `landIncomeBeta` and watch shelter inflation fall — that is the model working, not a calibration knob.

| Label | Config Field | Default | Range | Description |
|---|---|---|---|---|
| Formation Sensitivity | `config.formationSensitivity` | 0.06 | 0–0.3 | Δln(headship)/yr per unit negative income-growth deviation (one-sided). GR calibration: formation −60% at ≈−4pp (Census HVS/JCHS). **0 disables doubling-up.** |
| Headship Recovery | `config.headshipRecoveryRate` | 0.12 | 0–0.5 | /yr reversion of headship to baseline (JCHS: ~5-7yr post-GR recovery). |
| Supply Elasticity | `config.housingSupplyElasticity` | 1.5 | 0–4 | % starts per % profitability gap — **the regulatory-friction dial** (Saiz 2010; Topel-Rosen). Low = restrictive, high = abundance reform. |
| Embodied Capacity Gain | `config.embodiedCapacityGain` | 1.0 | 0–5 | Construction-capacity gain at full embodied capability (robots build FASTER). ATLAS judgment param. |
| Depreciation Rate | `config.housingDepreciationRate` | 0.0025 | 0.001–0.005 | /yr stock losses (HUD CINCH). |
| Land Share λ | `config.landShare` | 0.40 | 0.2–0.6 | Land share of replacement cost — research snapshot (Davis-Heathcote/Lincoln; **no government API serves land prices**). |
| Construction Labor Share | `config.constructionLaborShare` | 0.35 | 0.2–0.5 | Labor share of construction-cost growth (Census/RSMeans). |
| Land Income Beta | `config.landIncomeBeta` | 1.0 | 0–1.5 | Land growth per unit nominal income growth (Knoll-Schularick-Steger). Ruled to stay 1.0 — a reform lever, not a tuning knob. |
| Land Scarcity Elasticity | `config.landScarcityElasticity` | 2.0 | 0–5 | Land growth per unit occupancy gap (ATLAS judgment param, flagged). |
| Rent-Occupancy Elasticity | `config.rentOccupancyElasticity` | 2.0 | 0.5–5 | Rent growth per unit occupancy gap (Rosen-Smith natural-vacancy literature). |
| Rent Cost Anchor | `config.rentCostAnchorWeight` | 0 | 0–1 | Weight on replacement-cost growth in ΔR. The default is 0 — the landlord P&L rent equation supersedes the proportional cost anchor; 1.0 is the pre-P&L legacy pole, kept as a comparison toggle. |
| Baseline Cap Rate | `config.baselineCapRate` | 0.052 | 0.03–0.08 | Rent-price ratio anchor (Davis-Lehnert-Martin; 2024-25 multifamily caps). |
| Cap-Rate Mortgage Beta | `config.capRateMortgageBeta` | 0.4 | 0–1 | Δcap per Δmortgage rate (NCREIF/CBRE ≈0.3-0.5). Rate rises sink prices with stable rents (GR pattern). |
| Cap-Rate Investor Compression | `config.capRateInvestorCompression` | 0 | 0–0.5 | Optional direct yield-compression channel (default OFF). |
| Fire-Sale Elasticity | `config.fireSaleElasticity` | 1.75 | 0–4 | Price impact per unit unabsorbed foreclosure flow (Mian-Sufi-Trebbi 2015; replaces the hand-set ×3.0). |
| **Investor Demand Intensity** | `config.investorDemandIntensity` | 0.10 | 0–0.5 | **The land/store-of-value thesis dial:** land bid per unit asset-income-share deviation. **ONE-SIDED by design — land ratchets up; gains are not surrendered when the asset share recedes (held, not dumped).** 0 = capital ignores land. |
| Mortgage Stress Amp. | `config.mortgageStressAmplifier` | 0.40 | 0–2 | Retained: composition amplifier on credit collateral (Fed SCF quintiles). |
| Housing Wealth MPC | `config.housingWealthMPC` | 0.05 | 0–0.15 | Retained; the wealth base now scales with the price index: `drag = BASELINE_WEALTH × ΔP_level × MPC × ownership`. |
| Foreclosure Lag | `config.foreclosureLag` | 0.75 | 0–3 yr | Retained (dynamic-homeownership machinery). |
| Ownership Recovery | `config.homeownershipRecoveryRate` | 0.02 | 0–0.10/yr | Retained. |
| Institutional Buyer Rate | `config.institutionalBuyerRate` | 0.40 | 0–1 | Retained, re-pointed: fraction of foreclosures absorbed to RENTAL stock (conservation) vs left vacant (fire-sale pressure). |
| Shelter CPI Weight | `config.shelterCPIWeight` | 0.36 | 20%–50% | Retained (BLS CPI-U relative importance). |

**RETIRED** (inert on the config, kept for compile compatibility, marked deprecated): `shelterInflationStickiness`, `shelterInflationFloor`, `rentalDemandSensitivity`, `shelterPassthrough`, and the 5-channel price params (`affordabilityPriceSensitivity`, `incomeHousingElasticity`, `affordabilityReversionSensitivity`, `demographicHousingElasticity`, `downwardStickinessRatio`). Decision record: [the audit summary](../FABLE_AUDIT_SUMMARY.md).

---

### 3.8 Supply Chain

`SupplyChainControls.tsx` — all fields map into Eq 1.10 (Supply Chain Uncertainty); the supply-chain module combines them in two channels (training delay, deployment cost + adoption drag).

#### Supply Shock Scenarios (8 input constraints)

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| AI Chip Availability | `config.supplyChainConfig.inputs.aiChips` | 0–100 | Eq 1.10 | Capacity index for AI semiconductors (100 = baseline, <100 = shortage). |
| Chip Price Index | `config.supplyChainConfig.inputs.chipPrice` | 50–500 | Eq 1.10 | Price index for AI chips (100 = baseline; >100 raises deployment cost directly). Price and quantity are separate levers: in the 2021–22 chip shortage, spot GPU prices ran 2–3× while shipments were rationed, so a shortage scenario may need both this lever and AI Chip Availability. |
| Energy Price Level | `config.supplyChainConfig.inputs.energyPrice` | 50–500 | Eq 1.10 | Index for electricity costs to datacenters (100 = baseline; >100 raises deployment cost). |
| Grid Capacity for AI | `config.supplyChainConfig.inputs.energyCapacity` | 0–100 | Eq 1.10 | Power-grid availability for AI infrastructure. |
| Training DC Capacity | `config.supplyChainConfig.inputs.trainingDCCapacity` | 0–100 | Eq 1.10 | Datacentre availability for model training. Feeds the capability-delay channel. |
| Inference DC Capacity | `config.supplyChainConfig.inputs.inferenceDCCapacity` | 0–100 | Eq 1.10 | Datacentre availability for inference/serving. Feeds the deployment-cost multiplier. |
| Robotics HW Availability | `config.supplyChainConfig.inputs.roboticsHardware` | 0–100 | Eq 1.10 | Supply of robotics hardware. Feeds deployment cost for embodied-AI tasks. |
| Software Efficiency | `config.supplyChainConfig.inputs.softwareEfficiency` | 50–300 | Eq 1.10 | Algorithmic efficiency index (100 = baseline). Offsets constraint effects. |

#### Cost Pass-Through

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Lab → Deployer Rate | `config.supplyChainConfig.costPassThroughRate` | 0–1 | Eq 1.10 | Fraction of lab/training costs passed on to AI service deployers. Unless the user sets this rate (config value or per-year override), the autopilot applies a constant 0.5 each year (`PASS_THROUGH_TRAJECTORY`). The value is anchored to the 2021–22 chip-shortage record (`src/data/episodes/chipShortage2021.ts`): hardware buyers paid 2–3× spot premia from the shock's onset, so deployer-side cost incidence arrives immediately rather than ramping in over decades. An earlier uncited ramp (0 → 0.30 → 0.75 over 2025–2045) is retired (provenance: [the audit summary](../FABLE_AUDIT_SUMMARY.md)). |
| Deployer → Consumer Rate | `config.supplyChainConfig.consumerPassThroughRate` | 0–1 | Eq 1.10 | Fraction of deployer costs passed on to consumer prices. |

**Timing note:** timed shocks are expressible. The simulation resolves every supply-chain input per year through the Year Parameters override layers (§2), so a shock can be scheduled: a per-year override sets the shocked level in the shock year, and — because overrides are sticky-forward — an explicit recovery override key restores the baseline level in the recovery year. A config-level (slider) value without overrides remains a permanent level, phased in over ~2 years by the propagation lags.

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

**The bond-market bias note (model honesty).** The 10-year-yield machinery — the
expected-policy-rate path that the bond market projects forward from the Federal Reserve's
rule — reads the headline broad unemployment measure (§3.2, Jobless Measures), not the
U-3-consistent rate the real institution reads. In deep-displacement scenarios the broad
measure overstates the employment gap, so the projected policy path sits too low and the
10-year yield is understated; debt-service and fiscal-risk conclusions drawn from deep
scenarios are therefore flattered — more favorable than a U-3-consistent reading would
show. The bias is zero wherever no one has left the measured labor force and grows with
the exited stock. Implementation: `computeExpectedPolicyRates` in
`src/models/bondMarket.ts`.

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
| Corp. Tax Effectiveness | `config.corporateTaxEffectiveness` | 10%–100% | — | **Control removed** — dead: zero readers anywhere in the source tree (the audit's strongest dead row). Field retained; probe-guarded. |
| Foreign Treasury Demand | `config.foreignTreasuryDemand` | 5%–60% | — | **Control removed** — inert on the default path: the supply-pressure premium it fed is identically zero since the deficit-premium fix; only the retired legacy toggles (no UI) would revive it. Field retained; probe-guarded on the default path. |
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
| AI Company Profits | `config.policyConfig.sovereignWealthFund.totalAICompanyProfits` | $100–$2,000 B/yr | — | **Control removed** — the exogenous profit path (500 × 1.15^t $B) is retired: equity-stakes and profit-sharing payouts are now priced from the model's own realized AI corporate profits, lagged one year (this year's distributions come from last year's realized earnings; year 0 pays from the 2025 anchor's zero-automation initialization). The consumed base is exposed as `PolicyEffects.aiProfitPayoutBase` and asserted equal to the lagged endogenous series every year. Fields kept (no-delete rule); deadness probe-guarded. |
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
| Duration | `config.policyConfig.enhancedUI.durationWeeks` | 0–104 wk | Eq 7.5 | Total entitlement weeks per displaced worker. Benefits pay honestly across years through the duration pool: each cohort draws down 52 payable weeks per year of joblessness, so a 78-week program pays 52 weeks in the first year, 26 in the second, then nothing — long-duration jobless carry no ongoing enhanced benefit once exhausted. Multi-year durations (above 52) are fully priced. |
| Retraining toggle | `config.policyConfig.retraining.enabled` | on/off | Eq 7.5 | Enables the displaced-worker retraining stipend. |
| Monthly Stipend (schedule) | `config.policyConfig.retraining.stipendMonthly` | $0–$5,000/mo | Eq 7.5 | Per-worker monthly income support during retraining. |
| Effectiveness | `config.policyConfig.retraining.effectivenessRate` | 0–100% | — | **Control removed** — dead: no computation reads it (the live retraining dial is `participationRate`, which has no control — a docketed reachability gap). Field retained; probe-guarded with the program enabled. |

#### 3.10c State Policy Overrides — `StatePolicyOverrides.tsx`

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| Select State | (UI selector) | 50 states + DC | — | Picks which state's overrides are being edited. |
| Min Wage Override | `config.stateOverrides[stateCode].minimumWage` | $7.25–$25/hr | — | **Control removed** — dead: the state computation never reads this field. Field retained. |
| Additional UBI | `config.stateOverrides[stateCode].additionalUBI` | $0–$10,000/mo | Eq 3.1 | Supplementary state-level UBI on top of the federal amount. |
| UI Replacement Rate | `config.stateOverrides[stateCode].uiReplacementRate` | 0–100% | — | State-level override of the UI replacement rate. |
| AV Regulatory Environment | `config.stateOverrides[stateCode].avRegulatoryEnvironment` | permissive / moderate / restrictive | — | **Control removed** — inactive: the lag modifier it computes is discarded by the state output computation (only the policy additions are consumed). Field retained. |
| Robotics Regulatory Environment | `config.stateOverrides[stateCode].roboticsRegulatoryEnvironment` | permissive / moderate / restrictive | — | **Control removed** — inactive, same discarded lag modifier as AV. Field retained. |

---

### 3.11 AI Buildout, Energy & Production (Advanced grid; DATA_MODEL.md §14)

The financing and physical-capacity system that grounds the believed capability
trajectory. Most of these are worldview-axis levers ("What does building AI
capacity cost?") also reachable individually in Advanced.

| Label | Config Field | Range | Equation Ref | Description |
|---|---|---|---|---|
| AI Retention Share | `config.aiRetentionShare` | 0.1–0.6 | §14.1 | Share of the AI profit base retained for buildout finance (national-accounts retention ratios, 2023–2025). |
| Buildout Seam Anchor | `config.aiBuildoutSeamAnchor` | $130–155 B | §14.1 | The observed 2025 AI capital spending the baseline embeds; moves the machine seam and the baseline partition together. |
| Buildout Alloc. Smoothing | `config.buildoutAllocSmoothing` | 0.1–1.0 | §14.2 | Bounded step per year toward the binding-input allocation target. |
| Chips Cost Trend | `config.buildoutChipsCostTrend` | −50% to +5%/yr | §14.2 | Chip cost per computation (measured price-performance doubling ≈ 2.1–2.5 yr → default −26%/yr). |
| Energy Cost Trend | `config.buildoutEnergyCostTrend` | −10% to +10%/yr | §14.2, §14.5 | Energy capital AND operating cost trajectory (one energy-cost belief moves both). |
| Datacenter Cost Trend | `config.buildoutDcCostTrend` | −10% to +10%/yr | §14.2 | Datacenter construction cost per unit capacity (level citable; trend flagged uncertain). |
| Fleet Unit Cost Trend | `config.buildoutFleetCostTrend` | −25% to +5%/yr | §14.2 | Embodied-unit (robot/vehicle) cost trajectory. |
| Fleet Ramp Growth | `config.buildoutFleetRampGrowth` | 5–100%/yr | §14.2 | Fleet manufacturing-capacity growth in years production runs at its ceiling (automotive ramp episodes). |
| Fleet Alloc. Smoothing | `config.fleetAllocSmoothing` | 0.1–1.0 | §14.6 | Bounded step toward priority-proportional fleet shares across clusters. |
| Units per Embodied Worker | `config.unitsPerEmbodiedWorker` | 0.5–1.5 | §14.6 | Embodied-capital units required per fully automated physical worker (robot-density anchor). |
| Grid Power Lead Time | `config.energyQueueLeadYears` | 1–8 yr | §14.3 | Years from ordering grid power to receiving it (measured interconnection queue: default 4). |
| Grid Additions Growth | `config.energyQueueCeilingGrowth` | 0–100%/yr | §14.3 | Growth of the annual grid-additions ceiling in saturated years (a queue, not a fence). |
| On-Site Power Share | `config.energyBtmShare` | 0–80% | §14.3 | Share of new AI power built behind the meter — bypasses the queue at a capital-cost premium. |
| Equity Issuance Rate | `config.equityIssuanceRate` | 0.5–3%/yr | §14.1 | Gross issuance as a share of the implied AI market value per year. |
| AI R&D Intensity | `config.aiRdIntensity` | 2–20% | §14.8 | Research spending as a share of realized AI revenue (software/information-sector range). |
| R&D → Productivity Elasticity | `config.rdTfpElasticity` | 0.01–0.25 | §14.8 | The research-returns elasticity (the innovation-amplification axis's one lever). |
| Absorption Elasticity (AI-exposed) | `config.absorptionElasticityAiExposed` | 0.3–1.0 | §14.7 | Own-price demand elasticity magnitude for AI-exposed consumption. |
| Absorption Elasticity (Labor Services) | `config.absorptionElasticityLaborServices` | 0.1–0.5 | §14.7 | Healthcare-dominant services elasticity. |
| Absorption Elasticity (Food & Energy) | `config.absorptionElasticityFoodEnergy` | 0.05–0.8 | §14.7 | Food-dominant blend elasticity. |

---

## The Data-Calibration Selector (sidebar, topmost)

The sidebar's first question — "Whose measurements do you trust?" — offers two radio
answers. **ATLAS defaults** (the default) runs the model on its hand-authored
parameter values, each documented in the registry with its source and uncertainty.
**AEI** grounds the automation-share and capability-weight values of the 25 cognitive
occupation clusters with published data in the Anthropic Economic Index (release
2026-06-26, first-party API population). The selection writes no configuration field:
it composes like a worldview selection, is fully reversible, and any value you set by
hand keeps winning — an overlap renders a quiet count notice. The details view
carries the full disclosure: the population choice and its measured divergence
(roughly 49% of consumer conversations classify as automation versus roughly 94% on
the API), the signal's character (high and relatively uniform shares — level-raising,
not re-ranking), the coverage bounds (about 70% of occupation-classified usage falls
outside the modeled occupation groups; clusters below publication thresholds keep
authored defaults), the measured effect at defaults (about 3.4 percentage points more
2050 unemployment; first automation trigger one year later), and the license and
non-affiliation statement (data CC-BY 4.0; not endorsed by or affiliated with
Anthropic). Per-cluster automation-share editors render the effective value with a
source badge when the calibration supplies it. Methodology: the data model document
§13.7.

## Shared UI Components

These are reusable controls referenced by the cards above — they do not expose new parameters:

- **`PolicyKeyframeEditor.tsx`** — generic time-varying `PolicySchedule` editor (constant / linear ramp / custom multi-keyframe). Used by every `(schedule)` field above.
- **`ParameterRow.tsx`** — renders a single parameter in `YearParameterSection` with baseline → autopilot → override provenance.
- **`CollapsibleSection.tsx`**, **`DimensionSlider.tsx`**, **`FiscalPresetSelector.tsx`**, **`BaselineComparisonToggle.tsx`**, **`CapabilitySparkline.tsx`**, **`BFCSScoreBar.tsx`** — UI primitives with no additional parameters beyond what the parent card exposes.

---

## Model-Dynamics Dials (advanced)

These dials govern the model's monetary, fiscal, and housing dynamics. Each is a config
field readable in `src/models/constants.ts`, where the full citation block lives at the
named constant. Decision record: [the audit summary](../FABLE_AUDIT_SUMMARY.md).

| Dial | Default | Range | Basis |
|---|---|---|---|
| creditExpectationTurnover | 1/7 | 0–1 | Blended household debt duration (Fed Z.1 / G.19); 0 = a fixed legacy expectation that never turns over |
| assetShareDriftRate | derived | ≥0 | Dividend payout net of tax plus the secular ownership drift; 0 freezes the asset-income share |
| demandTrendGrowth / creditBarRealTrend | emergent ≈1.84% | — | Per-worker productivity growth passed through to demand, plus population growth; setting 0.02 reproduces the older fixed-trend behavior |
| landRateSensitivity | 0 (retired) | 0–2 | Interest-rate capitalization of land now arrives through the home-price channel; the direct sensitivity is inactive |
| credibilityHorizonYears (τ_cred) | 10 | 3–30; 0 = sentinel | 10 years matches the post-1980 anchored-expectations era (confirmed by the 2021–23 episode); 5–8 represents the 1970s de-anchoring pole |
| fiscalCredibilityTrigger / AdjustmentHorizon | 0.18 / 8y | — | Calibrated to the 1992–1998 US consolidation episode; active only under the fiscal-response profiles |
| pceCpiWedge (fallback) / pceFormulaEffect | 0.005 / 0.002 | — | The CPI-versus-PCE inflation differential (BLS) / the BEA–BLS formula reconciliation |
| usePceProxy | true | — | The Federal Reserve reads the NIPA-weighted price proxy, matching its actual target measure |
| nonShelterBaseInflation | 0.0222 | — | CPI-U all-items inflation with the shelter component removed (the non-shelter complement) |
| legacyNairu / legacySingleRollover / legacyTotalDeficitPremium / legacySupplyPressure | false | — | Diagnostic toggles that restore retired model forms for comparison runs; all off in normal use |
| taylorSmoothing (ρ) | 0.5 | 0–0.9 | Clarida–Galí–Gertler (2000): quarterly smoothing 0.79–0.92, ≈0.5 at annual frequency |
| marketAnchorInit | 0.027 | — | Derived from observed 2025 market pricing (two independent readings agree) |
| laubachLevelBeta / laubachDeficitBeta | 0.035 / 0.25 | — | Laubach (2009); Engen–Hubbard (2004), primary-deficit basis |
| monetizationDominanceThreshold / PremiumCoCondition | 0.50 / 0.01 | 0.25–0.8 / 0.002–0.05 | Historical monetization episodes (UK 1926, interwar France, Weimar) set the poles; the lower guard reflects the Volcker-era boundary |
| fiscalDominanceThreshold | 0.25 | 0.15–0.40 | The IMF debt-sustainability interest-to-revenue band (20–25%) |
| landClosureKappa | 0.45 | 0.1–1.0 | Calibrated to the 2022–23 land-price correction; 0 disables the closure (the older behavior) |
| builderAdjustmentLambda | 0.6 | 0–0.9 | Matches the observed housing-starts adjustment cadence in 2022–23 (Census HOUST series) |
| housingPipelineDuration | 1.2y | ≥0 | Length-biased blend of Census construction-duration data; consistent with the units-under-construction series (UNDCONTSA) |
| builderPriceMode | trend-aware | spot / adaptive | How builders read prices: current spot, trend-aware (default), or adaptive-legacy — the adaptive setting represents a chronic-under-build world |
| constructionCreditSensitivity | 2.0 | 0–3 | Solved against the 2006–2012 construction-lending episode (acquisition-development-construction credit data) |
| opexPassthrough | 0.40 | 0–0.6 | Landlord operating-expense share (National Apartment Association / IREM data) |
| rentDownwardRigidity | 0.85 | 0–1 | Genesove (2003) nominal rent rigidity plus the 2008–12 record; recalibration to the new-tenant basis is a registered open item |
| rentIncomeElasticity (θ) | 0.47 | 0.3–0.7 | Derived from a 40-year decomposition of rent-to-income growth; invariant to the rent-measure basis |
| mortgageRateReference | derived 10Y+spread | — | The 10-year Treasury yield plus the observed spread, dated consistently; the fixed 0.06 setting reproduces a retired fixed-rate behavior |
| rentVintageLagYears (display) | 1.0 | 0–2 | New-tenant rents lead the stock rent measure by about four quarters (BLS New Tenant Rent Index) |

---

## Supply-Chain Dials (`config.supplyChainConfig`)

> **Dormant by default; calibration grade: largely uncited.** No `supplyChainConfig` is set in
> the default configuration, so every consumer of this module is gated off — it contributes
> exactly zero to baseline runs. Its ~20 defaults (shock inputs, resilience, training
> composition and dynamics, cascade lags and premiums, pass-throughs, hysteresis) carry almost
> no source citations. A user activating these dials is running scenario-only machinery whose
> magnitudes are uncited. Any analysis built on this module should first validate it against
> the 2021–22 chip-shortage record. Decision record: [the audit summary](../FABLE_AUDIT_SUMMARY.md).

---

## Reachability Register

Every model parameter belongs to one of four reachability classes. The classes are documented
here so a reader knows how to change any given parameter; the panel tables above cover class
UI by construction. Source of truth: the successor-program parameter inventory (audit CSV;
provenance: [the audit summary](../FABLE_AUDIT_SUMMARY.md)).

**Classes:**
- **UI** — a sidebar control writes it (the panel tables above).
- **CSV** — no control, but the scenario CSV imports/exports it (`csvImport.ts` mapping).
- **Scenario-JSON** — no control and no CSV mapping; reachable only by editing a saved
  scenario's JSON (or a shared-URL payload).
- **None** — no producer path at all.

**Live simulation-path parameters with NO UI control** (the interim register; whether
scenario-JSON reachability satisfies the every-parameter-a-control commitment is deferred to
the preset-architecture program):

| Family | Parameters | Class |
|---|---|---|
| Phase-6 credit (the live credit system) | `transferReliabilityWeight`, `incomeAdequacySensitivity`, `collateralSensitivity`, `systemicRiskSensitivity`, `inflationRiskSensitivity`, `maxConsumerTightening`, `consumerCreditImpact`, `profitabilitySensitivity`, `growthTrajectorySensitivity`, `maxBusinessTightening`, `businessInvestmentImpact` | Scenario-JSON |
| Stage-3 wage equation | `inflationIndexation`, `productivityPassthrough`, `phillipsSlope`, `downwardWageRigidity` | Scenario-JSON (documented in §3.1 with the equation) |
| Stage-6.5 housing stock-flow | the §3.7 table's parameters (formation, headship, supply elasticity, land family, cap-rate family, fire-sale, investor bid, L9 rent family, builder family) | Scenario-JSON (no CSV mapping) |
| Expectation/E-family dials | the Model-Dynamics table below (`creditExpectationTurnover`, `credibilityHorizonYears`, `taylorSmoothing`, the Laubach betas, the monetization guards, the legacy toggles, …) | Scenario-JSON |
| Fiscal-monetary (bond/maturity/monetization) | `consolidationCreditMax`, `supplyPressureSensitivity`, `safetyFlightSensitivity`, `yieldAttractionMidpoint`, `inflationDeterrentSensitivity`, `sovereignConfidenceDecayRate`, `baseWeightedAverageMaturity`, `minWeightedAverageMaturity`, `maxWeightedAverageMaturity`, `maturityStressSensitivity`, `monetizationTransmissionSensitivity`, `fiscalRiskTrajectoryMidpoint` | CSV (importable, no control) |
| Transfer support | `cashTransferPerUnemployed`, `inKindTransferPerUnemployed` | Scenario-JSON |
| Distribution shares | `bottom80WageShare/TransferShare/AssetShare` have controls; the quintile measurement layer's shares are constants | UI / constants |
| Asset-share drift | `assetShareDriftRate` | Scenario-JSON (live; neither control nor CSV mapping) |
| Sector deflation per-cluster | `deflationIntensityOverrides` | Scenario-JSON |
| Retraining | `participationRate` (live), `durationMonths` | Scenario-JSON |
| Indexed-UBI mode | `ubi.mode`, `ubi.indexedBaseAmount`, `ubi.indexedStartYear`, `ubi.productivityIndexRate`, `ubi.indexedToInflation` | Scenario-JSON (the indexed mode is UI-unreachable) |
| Adoption internals | `adoptionParams.steepnessByDeployment` (dormant — every cluster defines its own), `adoptionParams.competitivePressureMultiplier`, `geopoliticalRiskFactor`, `clusterOverrides.*` | CSV |
| Displaced-pool duration dials | `exitBase`, `exitDurationSlope`, `atrophyRate`, `wageScarringRate` (documented with ranges and anchors in §3.2, Jobless Measures & the Displaced-Worker Duration Pool) | CSV (importable via `pool.*`, no control) |
| AI cost composition | `aiCostParams.composition` | None (no producer; the deployment-type composition constants apply) |
| Role estimation | `roleEstimation.*` (`src/data/roleEstimation.ts`) | None (hardcoded at store load, despite the file's "user-adjustable" comment) |
| Legacy/basis toggles | `legacyCheaperProxy`, `seamBasisOnly`, `diagSpotBuilderPrice`, `legacyNairu`, `legacySingleRollover`, `legacyTotalDeficitPremium`, `legacySupplyPressure` | Scenario-JSON (comparison-run machinery, deliberately unexposed; the family is FROZEN by a permanent test — no additions. `legacyFiscalPremium` retired: its comparison runs are a recorded artifact set, see the model provenance link) |
| Supply-chain sensitivity blends | `supplyChainConfig.sensitivityBlendCognitive/Embodied` | CSV |

---

## Notes

- Equation numbers correspond to the current `MethodologyView.tsx` (new cards append within their sections without renumbering — e.g. the adoption state machine at 1.11, the displaced-worker pool at 2.7). If cards are ever renumbered, re-run the audit.
- Every `DEFAULT_*` constant cited in a description is defined in `src/models/constants.ts` with a JSDoc source citation (BLS, BEA, FRED, CBO, or academic paper).
- Where a slider is marked *DEPRECATED* (e.g. `aiWageProductivityMultiplier`, the legacy `aiCostParams.inferenceAnnualChange`), it is retained per the no-delete rule but has been superseded by a Phase 10.A replacement — the modern path is noted in the description.
- Fields whose Description is intentionally blank are ones where the effect on the model could not be unambiguously derived from the code comments or equations; update them as the relevant constants gain JSDoc coverage.
