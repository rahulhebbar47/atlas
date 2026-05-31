# DATA_MODEL.md — ATLAS Economic Model Specification

This document defines the complete mathematical model that powers ATLAS. Every equation here must be implemented faithfully in `src/models/`. No simplifications without explicit documentation of what was simplified and why.

---

## 1. AI Capability Vectors

### 1.1 Capability Categories

<!-- UPDATED 2026-03-02: Replaced 8-vector system with 3-vector consolidated system (Phase 8 Consolidation).
Eight distinct AI technology vectors, each with independent capability trajectories:

| ID | Category | Description | Key Benchmarks |
|----|----------|-------------|----------------|
| `lang` | Language / Reasoning | NLP, analysis, synthesis, legal/medical reasoning | Contract review accuracy, diagnostic accuracy |
| `code` | Code Generation | Writing, reviewing, debugging, deploying code | SWE-bench scores, autonomous PR completion |
| `agent` | Agentic AI | Multi-step workflows, tool use, autonomous task completion | End-to-end task completion rates |
| `decide` | Decision-Making | Risk assessment, strategy, resource allocation | Portfolio performance, logistics optimization |
| `robot` | Robotics | Physical manipulation, navigation, dexterity | Task completion in unstructured environments |
| `auto` | Autonomous Vehicles | Self-driving for freight, passenger, delivery | Miles per disengagement, safety multiples vs human |
| `gen` | Generative AI | Image, video, audio, 3D content creation | Human indistinguishability rates, creative quality |
| `sci` | Scientific / Discovery | Hypothesis generation, experiment design, simulation | Novel discoveries, drug candidate success rates |
-->

Three consolidated AI technology vectors, each with independent capability trajectories:

| ID | Category | Description | Consolidates |
|----|----------|-------------|-------------|
| `generative` | Generative AI | Language, code generation, creative content, scientific reasoning | lang + code + gen + sci |
| `agentic` | Agentic AI | Multi-step workflows, tool use, autonomous decision-making | agent + decide |
| `embodied` | Embodied AI | Robotics, physical manipulation, autonomous vehicles | robot + auto |

The consolidation from 8 to 3 vectors reduces parameter space while preserving the key distinctions: software-only (generative), software-with-agency (agentic), and physical-world (embodied) — each with fundamentally different deployment dynamics, regulatory regimes, and scaling constraints.

### 1.2 Capability Score

For each vector `c`, define `S_c(t)` ∈ [0, 1] representing AI performance relative to expert human performance at time `t`:

- 0.0 = No capability
- 0.3 = Below average human
- 0.5 = Average human performance
- 0.7 = Above average / junior professional
- 0.85 = Senior professional equivalent
- 0.95 = Expert / top-tier human
- 1.0 = Superhuman (exceeds best humans)

### 1.3 Capability Trajectory Function

Each capability follows a modified sigmoid (logistic) trajectory:

```
S_c(t) = S_c_floor + (S_c_ceil - S_c_floor) / (1 + exp(-k_c * (t - t_c_mid)))
```

Where:
- `S_c_floor` = minimum capability (where it is today, user-adjustable)
- `S_c_ceil` = maximum achievable capability (default 1.0, adjustable — maybe robotics never reaches 1.0 for fine surgery)
- `k_c` = steepness of improvement (higher = faster capability gain)
- `t_c_mid` = inflection point year (when capability hits 50% of its range)

**User controls**: The user adjusts `S_c_floor`, `S_c_ceil`, `k_c`, and `t_c_mid` for each vector via sliders. The UI shows the resulting S-curve in real-time.

### 1.4 Baseline Trajectories

<!-- UPDATED 2026-03-02: Replaced 8-vector baseline trajectories with 3-vector defaults (Phase 8 Consolidation).
The model offers baseline trajectories derived from observable trends. The user can load these as starting points and adjust.

For robotics baselines, use Tesla Optimus production/capability milestones:
- Current state (2025): S_robot ≈ 0.2 (basic warehouse tasks, controlled environments)
- Tesla's stated goal: millions of units by early 2030s
- Scale trajectory: manufacturing ramp follows Tesla's own production curve estimates

For autonomous vehicles, use Tesla fleet only:
- Cybercab (robotaxi): post-2025 Austin launch, scaling to additional cities
- Semi: long-haul freight, fleet conversion timelines
- Current FSD safety multiple vs. human: ~10x (not enough for many regulators, see BFCS)

For software AI (lang, code, agent):
- Trajectory is steeper — no physical manufacturing constraint
- Capability gains track with compute scaling and model improvements
- Current state: code ≈ 0.7 (junior dev equivalent), lang ≈ 0.75, agent ≈ 0.4
-->

Default 3-vector baseline trajectories from `constants.ts`:

| Vector | Floor | Ceiling | Steepness | Midpoint | Rationale |
|--------|-------|---------|-----------|----------|-----------|
| `generative` | 0.10 | 0.95 | 0.6 | 2033 | Software-only scaling but slower saturation; composite of lang/code/gen/sci benchmarks (2024-2025) |
| `agentic` | 0.05 | 0.90 | 0.5 | 2038 | Reliability + trust challenges slow rollout; composite of agent/decide benchmarks |
| `embodied` | 0.02 | 0.85 | 0.5 | 2043 | Physical world harder — manufacturing throughput + regulatory gating; composite of robot/auto (Tesla Optimus, FSD) |

Key dynamics:
- **Generative**: Steeper trajectory because scaling requires only compute + model improvements (no factories). Floor at 0.10 reflects current ~early capability across the consolidated domain.
- **Agentic**: Moderate trajectory — multi-step reliability is the bottleneck. Even 99% per-step accuracy yields low end-to-end success on long chains.
- **Embodied**: Slowest trajectory — constrained by manufacturing throughput (Tesla Optimus production ramp), regulatory approval per jurisdiction, and the inherent difficulty of the physical world. Ceiling at 0.85 (may never reach 1.0 for surgery-level dexterity).

---

## 2. BFCS Threshold Model (Better, Faster, Cheaper, Safer)

### 2.1 Core Concept

Automation of a specific occupation-role is NOT triggered by capability alone. It requires meeting ALL FOUR thresholds simultaneously:

```
adoption_triggered(c, o, r) = B(c,o,r) ≥ B*(o,r) AND F(c,o,r) ≥ F*(o,r) AND C(c,o,r) ≥ C*(o,r) AND S(c,o,r) ≥ S*(o,r)
```

Where:
- `c` = capability vector
- `o` = occupation cluster
- `r` = role/seniority level
- `B, F, C, S` = current AI performance on each dimension ∈ [0, 1]
- `B*, F*, C*, S*` = minimum threshold required for that occupation-role

### 2.2 BFCS Score Derivation

Each BFCS dimension for a given occupation-role is derived from the relevant capability scores:

**Better (B):**
```
weighted_sum = Σ (S_c(t) × weight_c) for each capability c where weight_c > 0
total_weight = Σ weight_c for each capability c where weight_c > 0
normalized_score = weighted_sum / total_weight   (0 if total_weight = 0)
quality_multiplier = clamp(2 - seniority_level, 0.5, 2.0)
B(c, o, r) = min(1, normalized_score × quality_multiplier)
```

> **NOTE**: Normalization by total_weight ensures the Better score is comparable across clusters regardless of how many capability dimensions are relevant. Without normalization, clusters with more relevant capabilities would systematically score higher. The quality_multiplier uses (2 - seniority) rather than (1 / seniority) for more linear and predictable scaling: junior roles (seniority ~0.4) get multiplier ~1.6, senior roles (~0.85) get ~1.15.

<!-- UPDATED 2026-03-02: Capability weights now use 3 vectors instead of 8 (Phase 8 Consolidation).
The `weight_c` values come from `relevance(c, o)`, which maps how much each capability vector matters for each occupation. E.g., trucking depends heavily on `auto` (0.9) and `decide` (0.3) but barely on `code` (0.0).
-->

The `weight_c` values come from `capabilityRelevance.weights` on each `OccupationCluster`, which maps the 3 consolidated capability vectors (`generative`, `agentic`, `embodied`) to each occupation. E.g., trucking has weights: generative=0.05, agentic=0.15, embodied=0.80. Software engineering: generative=0.70, agentic=0.25, embodied=0.05. Per-cluster weights sum to 1.0.

**Faster (F):**
```
inference_speed(t) = min(1.0, BASELINE_INFERENCE_SPEED
                         + INFERENCE_SPEED_IMPROVEMENT_RATE × (t - t_start) × 0.1)
F(o, t) = min(1, inference_speed(t) × TASK_PARALLELISM[deployment_type])
```

> **NOTE**: Inference speed improves linearly at an effective rate of 0.03/year (0.3 × 0.1 calibration factor), from a 2025 baseline of 0.7. This is a technology-wide improvement not tied to specific capability vectors.

**Cheaper (C):**
```
C(c, o, r, t) = (human_cost(o, r, t) - ai_cost(c, t)) / human_cost(o, r, t)
              + priorYearWageAdjustmentByCluster[o](t−1)        -- Phase 10.A scarcity feedback
```

The wage-adjustment term closes the scarcity → cost loop: if last year's labor scarcity pushed wages up in cluster `o`, this year's Cheaper-score is correspondingly higher, accelerating adoption. See §4.3a for the per-cluster aggregation.

**Safer (S):**
```
S(c, o, r) = safety_record(c, t) * domain_risk_factor(o)
```

### 2.3 Threshold Values — Key Insight

The **Safer** threshold `S*` varies enormously:
- Shelf stocking: S* = 0.5 (just don't break things)
- Trucking: S* = 0.99 (regulatory requirement, even though 10x safer isn't enough politically)
- Elder care: S* = 0.995 (vulnerability of population)
- Surgery: S* = 0.999 (life-critical)
- Fast food: S* = 0.3 (low stakes)
- Junior code review: S* = 0.7 (errors catchable)
- Senior system architecture: S* = 0.95 (critical errors costly)

The **Cheaper** threshold `C*` depends on:
- Current wage levels (from BLS data)
- AI inference costs (trajectory: falling toward near-zero long-term)
- Capital costs for physical AI (Optimus unit cost, fleet purchase cost)
- Amortization period for physical assets

### 2.4 Threshold Adjustability

ALL thresholds are user-adjustable per occupation cluster. The model provides informed defaults but the user can override any threshold to test scenarios like:
- "What if regulators approve autonomous trucking at 100x safety instead of 1000x?"
- "What if Optimus unit costs fall to $20k instead of $50k — how does that change C* for warehouse work?"

---

## 3. Adoption Dynamics

### 3.1 Adoption S-Curve

Once all BFCS thresholds are met for an occupation-role, adoption follows a logistic S-curve:

```
adoption_rate(o, r, t) = 1 / (1 + exp(-a(o) * (t - t_trigger(o,r) - lag(o))))
```

Where:
- `t_trigger(o, r)` = the year when BFCS thresholds are first met
- `lag(o)` = deployment lag (regulatory approval, organizational inertia)
- `a(o)` = adoption steepness, determined by deployment type

### 3.2 Adoption Steepness by Deployment Type

Three deployment categories with very different S-curve profiles:

**Software deployment** (generative, agentic):
- `a` = 2.0–4.0 (very steep — deploy inference, done)
- `lag` = 0.5–2 years (organizational adoption, not technical)
- Example: Once agentic AI can do junior analyst work, adoption across finance happens in 1-3 years because firms that adopt first crush competitors on cost

**Robotics deployment** (embodied):
- `a` = 0.5–1.0 (gradual — manufacturing throughput limited)
- `lag` = 2–5 years (factory build-out, supply chain)
- Scale constraint: Tesla Optimus production ramp
- **Geopolitical risk modifier**: supply chain disruption can flatten the curve further
  - `effective_risk = geopolitical_risk_factor × cluster_geopolitical_risk_exposure`
  - `a_effective = a × (1 - effective_risk)` where `geopolitical_risk_factor` ∈ [0, 0.5]

> **NOTE**: Per-cluster `geopolitical_risk_exposure` weights (0.0 for software, 0.1–0.2 for robotics/hybrid/AV) allow the global risk factor to differentially affect clusters based on their supply chain and regulatory exposure.

**Autonomous vehicle deployment** (embodied — AV subset):
- `a` = 0.3–1.5 (varies by vehicle type and regulatory environment)
- `lag` = 1–5 years (regulatory approval per jurisdiction)
- Fleet conversion constraint: trucks have 10-15 year replacement cycles
- Faster for new fleet (Cybercab) than retrofit (existing trucks)

Per-cluster `adoptionSteepness` and `adoptionCeiling` are now configurable via `OccupationCluster` and can be overridden at runtime via `config.clusterOverrides`.

### 3.3 Competitive Pressure Accelerant

Key insight: companies that adopt first will have an economic advantage over their field and be able to drive the others into bankruptcy.

Model this as: once adoption_rate > 0.2 in any sector, remaining non-adopters face increasing cost disadvantage, which accelerates their adoption:

```
competitive_pressure(o, t) = max(0, adoption_rate(o, t) - 0.2) * pressure_multiplier
adoption_rate_adjusted(o, t) = adoption_rate(o, t) * (1 + competitive_pressure(o, t))
```

This creates the "meaningful displacement → full displacement gap is small" dynamic.

### 3.4 Augmentation Adoption — Pre-BFCS S-Curve (Phase 10.A Part 7)

Phase 10.A separates **augmentation** (humans using AI as a productivity tool) from **replacement** (jobs eliminated via BFCS triggers). Augmentation adoption runs on its own logistic S-curve, triggered by a viability threshold that fires well before all four BFCS thresholds are met.

Source: `src/models/augmentationAdoption.ts` (entire file; called from `simulation.ts:1238`).

**Viability trigger**:
```
augTriggered(o, r, t) ⇔ better_score(o, r, t) × cheaper_score(o, r, t) > AUG_VIABILITY_THRESHOLD   (default 0.1)
```

Augmentation is **not** gated on the full Better/Faster/Cheaper/Safer simultaneous-pass requirement — humans can adopt AI tools long before AI is trustworthy or safe enough to run unsupervised. The first year `augTriggered` becomes true is recorded as `augTriggerYears[clusterId][roleId]`.

**Adoption rate** (logistic):
```
yearsSinceAugTrigger(t) = max(0, t − augTriggerYears[o][r])
augAdoptionRate(o, r, t) = 1 / (1 + exp(−steepness × yearsSinceAugTrigger))
```

At the default `augmentationAdoptionSteepness = 0.8` (`DEFAULT_AUGMENTATION_ADOPTION_STEEPNESS`, `constants.ts:2526`), augmentation reaches ≈98 % adoption ~5 years after viability.

**Output channel**:
```
clusterAugmentationOutput(o, t) = Σ_r remaining(o, r, t) × augAdoptionRate(o, r, t)
                                     × wage(o, r) × (better × cheaper × augmentationMultiplier)
```

where `remaining(o, r, t) = baseline(o, r) × (1 − displacement(o, r, t))` and `augmentationMultiplier` is the user-adjustable per-worker productivity boost (default `DEFAULT_AUGMENTATION_MULTIPLIER = 2.0`, recalibrated upward from 0.20 in commit `537e4ee`).

A parallel **head-count fraction** `augmentedHeadcountByCluster[o]` ∈ [0,1] is recorded for use in the sector-deflation pipeline (Phase 10.A fix #1 — pure fraction, independent of wage / score amplification).

---

## 4. Displacement Model

### 4.1 Displacement Formula — α-Driven Model (Phase 10.A V2)

> ⚠ **Phase 10.A V2 (commit `86e2dc2`) replaces the quadratic `weighted_capability²` formula with an explicit α-driven decomposition.** The historical quadratic narrative is preserved below for context; the current implementation is in the **"V2 — Current Formula"** box at the end of this section. Source: `src/models/displacement.ts:40–70` (`computeSimplifiedDisplacement` marked DEPRECATED; `computeDisplacementV2` is current); `src/models/alphaDrivers.ts`.

<!-- UPDATED 2026-03-02: Replaced old task erosion + headcount ratio with quadratic displacement formula (Phase 8 Consolidation).
Not all automation eliminates jobs immediately. Task erosion comes first:

```
task_erosion(o, r, t) = adoption_rate(o, r, t) * task_automatable_fraction(o, r)
```

Where `task_automatable_fraction` is the % of tasks in that role that the relevant AI capability can perform. A junior software dev might have 80% automatable tasks (write code, write tests, fix bugs) but 20% non-automatable (stakeholder communication, ambiguous requirements).

**Headcount reduction** follows task erosion with a lag:

```
headcount_multiplier(o, r, t) = 1 - (task_erosion(o, r, t) * productivity_to_headcount_ratio)
```

Where `productivity_to_headcount_ratio` captures: if a team of 10 now needs only 60% of tasks done by humans, do they fire 4 people or keep all 10 doing 60% of the work? Empirically, this ratio is ~0.6–0.8 (firms do reduce headcount, but not 1:1 with task reduction).
-->

Displacement uses a quadratic formula that provides natural dynamics — gentle early displacement that accelerates as AI capability increases:

```
weighted_capability(o, t) = Σ (capability_score(v, t) × weight(v, o))    for v in {generative, agentic, embodied}
displacement_pct(o, r, t) = adoption_rate(o, r, t) × weighted_capability(o, t)²
headcount_multiplier(o, r, t) = 1 - displacement_pct(o, r, t)
remaining_employment(o, r, t) = baseline_employment(o, r) × headcount_multiplier(o, r, t)
```

Where:
- `adoption_rate` is computed per-role from BFCS trigger + S-curve (§3)
- `weighted_capability` uses per-cluster weights for the 3 capability vectors (weights sum to 1.0)
- The quadratic term (²) produces gentler early displacement that accelerates as AI capability increases — more realistic than the old linear model

Displacement dynamics at different capability levels (assuming full adoption):
- Low capability (0.30): displacement = adoption × 0.09 (barely noticeable)
- Moderate (0.50): displacement = adoption × 0.25 (meaningful but manageable)
- High (0.70): displacement = adoption × 0.49 (approaching majority)
- Near-perfect (0.90): displacement = adoption × 0.81 (near-total)

**Wage depression** from automation (per-cluster):
```
wage_multiplier(o, r, t) = 1 - (displacement_pct(o, r, t) × wage_elasticity(o))
remaining_wage(o, r, t) = baseline_wage(o, r) × wage_multiplier(o, r, t)
```

Where `wage_elasticity` is per-cluster (default 0.6) — high for easily substitutable roles (data entry: 0.9), low for licensed/union (electricians: 0.3).

#### V2 — Current Formula (Phase 10.A)

The quadratic `weighted_capability²` term was a convenient stand-in for "things that make AI displacement gentler at low capability." Phase 10.A makes those forces explicit by decomposing α — the effective automation share — into five drivers. The product `adoptionRate × weightedCapability × α` replaces the quadratic.

```
displacement_pct(o, r, t) = clamp(adoption_rate(o, r, t) × weighted_capability(o, t) × α(o, r, t), 0, 1)
remaining_employment(o, r, t) = baseline_employment(o, r) × (1 − displacement_pct(o, r, t))
```

`α(o, r, t)` is the effective automation share for that role (output of `computeEffectiveAlpha()`), bounded to [0, 1]. It decomposes into five weighted drivers (`AlphaDriverParams`, `DEFAULT_ALPHA_DRIVER_PARAMS` in `constants.ts:2500`):

| Driver | Mechanism | Term |
|---|---|---|
| **Capability** | Sigmoid activation of `weighted_capability` around `capabilityActivationThreshold`. | `+w_cap × σ((wc − θ_cap) × k)` |
| **Trust** | Post-trigger ramp `1 − exp(−yearsSinceTrigger / trustHalfLife)`. Zero before trigger. | `+w_trust × trustRamp` |
| **Competitive** | Peer-cluster prior-year α minus a baseline. Captures "if competitors automated, I must too." | `+w_comp × max(0, peerAlpha − baseline)` |
| **Margin** | Corporate-margin compression: `max(0, baselineMargin − currentMargin) / baselineMargin`. Anchor `ALPHA_BASELINE_CORPORATE_MARGIN = 0.12`. | `+w_margin × marginCompression` |
| **Slack** | Labor slack (excess unemployment above NAIRU) **subtracted** — abundant cheap labor reduces urgency to automate. | `−w_slack × max(0, U − U*)` |

The cluster's `effectiveAlpha` (output field) is the employment-weighted mean of role-level α and is fed back into the next year's `peerAlpha` reads for adjacent clusters (the competitive driver closure). `clusterAutomationShareOverrides[clusterId]` lets the user bypass the 5-driver model and pin α directly (0 = full augmentation, 1 = full replacement).

**Wage depression** under V2 uses the same `wage_multiplier = 1 − displacement_pct × wage_elasticity` structure as above, with `displacement_pct` from the V2 formula. The aggregated per-cluster wage premium from `aiReplacementDifficultyWagePremium` enters via the scarcity channel — see §4.3a.

### 4.2 AI-Driven Displacement vs. Economic Contraction

**CRITICAL DISTINCTION**: The model tracks two separate sources of job loss:

1. **AI displacement** = jobs directly replaced by automation via BFCS triggers and adoption. Computed per-cluster from `headcount_multiplier`. This is what appears in `cluster_*_displacement_pct` and `total_displaced`.

2. **Demand spillover** = jobs lost due to falling aggregate demand. Each cluster's remaining employment is reduced by its weighted demand ratio.

<!-- UPDATED 2026-03-02: Replaced economic_activity_factor with demand spillover (Phase 3c.1) and Okun's Law (Phase 1 overhaul, later replaced).
```
ai_displaced(o, r, t) = baseline_employment(o, r) × (1 - headcount_multiplier(o, r, t))
remaining_after_ai(o, r, t) = baseline_employment(o, r) - ai_displaced(o, r, t)
total_employment(t) = Σ remaining_after_ai(o, r, t) × economic_activity_factor(t)
```

The `total_displaced` metric reports ONLY AI-driven displacement. The `economic_activity_factor` is a separate macro adjustment. When capabilities are near zero and no BFCS thresholds are crossed, `total_displaced = 0` regardless of economic conditions.
-->

```
ai_displaced(o, r, t) = baseline_employment(o, r) × (1 - headcount_multiplier(o, r, t))
remaining_after_ai(o, r, t) = baseline_employment(o, r) - ai_displaced(o, r, t)

-- Per-cluster demand spillover (Phase 3c.1):
consumer_demand_ratio = consumption(t-1) / baseline_consumption
gov_demand_ratio = government_spending(t-1) / baseline_gov_spending
business_demand_ratio = investment(t-1) / baseline_investment
cluster_demand_ratio(o) = c_share(o) × consumer_demand_ratio
                        + g_share(o) × gov_demand_ratio
                        + b_share(o) × business_demand_ratio

demand_constrained_employment(o, r, t) = remaining_after_ai(o, r, t) × min(1, cluster_demand_ratio(o))
total_employment(t) = Σ demand_constrained_employment(o, r, t) + non_cluster_employed
```

The `total_displaced` metric reports ONLY AI-driven displacement. Demand spillover is a separate macro-level employment constraint applied after cluster displacement. When capabilities are near zero and no BFCS thresholds are crossed, `total_displaced = 0` regardless of economic conditions.

### 4.3 Wage Depression from Labor Surplus (Phillips Curve)

Even before displacement, and independently from task erosion, wages face downward pressure when unemployment rises above the natural rate. This reflects surplus labor competing for surviving jobs:

<!-- UPDATED 2026-03-02: Fixed PHILLIPS_CURVE_SENSITIVITY from 1.5 to 2.5 (matches code) and added exponential formulation + AI productivity premium + policy wage floor.
```
wage_pressure(t) = max(0.3, 1 - β × max(0, unemployment_rate(t) - NATURAL_UNEMPLOYMENT_RATE))
average_wage(t) = baseline_average_wage × baseline_growth_factor(t) × wage_pressure(t) × task_erosion_wage_effect(t)
```

Where:
- `β` = `PHILLIPS_CURVE_SENSITIVITY` = 1.5 (calibrated so 10% unemployment above natural rate causes ~15% wage decline)
- `NATURAL_UNEMPLOYMENT_RATE` = `BASELINE_UNEMPLOYMENT / US_LABOR_FORCE_2025` = 12,998,000 / 171,495,000 ≈ 0.0758 (derived from BLS government data)
- `baseline_growth_factor(t)` = `(1 + nominal_growth_rate)^(t - t_start)` — see §5.2.2
- `task_erosion_wage_effect(t)` = weighted average of per-cluster `wage_multiplier(o, r, t)` from Section 4.1

> **NOTE**: The 0.3 floor prevents unrealistic wage collapse — even in extreme unemployment scenarios, wages cannot fall below 30% of trend. NATURAL_UNEMPLOYMENT_RATE is derived from BLS government data (158.5M employed, 171.5M labor force) rather than assumed.

At baseline (~7.6% unemployment, zero displacement): `wage_pressure = 1.0`, `task_erosion_wage_effect = 1.0`, wages grow at nominal rate (real + inflation).

At 15% unemployment: `wage_pressure = max(0.3, 1 - 1.5 × (0.15 - 0.0758)) = max(0.3, 0.889) = 0.889` — wages fall ~11% below trend.

At 25% unemployment: `wage_pressure = max(0.3, 1 - 1.5 × (0.25 - 0.0758)) = max(0.3, 0.739) = 0.739` — wages fall ~26% below trend.
-->

The model uses an **exponential** Phillips curve, **dampened by labor's non-AI share** and topped up with an **AI-driven scarcity premium** (Phase 10.A Part 12). Source: `src/models/macro.ts:354–363` (`computeWagePressure`); `macro.ts:367–385` (`computeClusterScarcityPremium`).

```
excess_unemployment(t) = max(0, unemployment_rate(t) - NATURAL_UNEMPLOYMENT_RATE)
ai_share(t) = ai_displacement_stock(t) / total_displaced(t)        -- 0 if no displacement
classic_phillips(t) = exp(-β × excess_unemployment(t) × (1 − ai_share(t)))

scarcity_premium(t) = ai_share(t) × scarcityIntensity
                      × aggregateReplacementDifficultyWagePremium(t)

ai_wage_premium(t) = ai_wage_productivity_multiplier × automation_coverage(t) × (1 - automation_coverage(t))

wage_pressure(t) = max(policy_wage_floor, classic_phillips(t) + scarcity_premium(t) + ai_wage_premium(t))
```

Where:
- `β` = `PHILLIPS_CURVE_SENSITIVITY` = 2.5
- `(1 − ai_share)` **dampens classic Phillips** when unemployment is AI-caused — laid-off workers can't undercut wages in roles AI is doing, so slack stops biting where displacement is high. The classic mechanism dominates when joblessness is cyclical/demand-driven, not AI-driven.
- `scarcityIntensity` (default `DEFAULT_SCARCITY_INTENSITY = 0.4`) — user knob on how strongly labor scarcity in AI-resistant roles bids wages up.
- `aggregateReplacementDifficultyWagePremium(t)` is the employment-weighted mean of role-level `aiReplacementDifficultyWagePremium` (per-role property — high for licensed/embodied/high-trust roles, low for routine cognitive roles). See §4.3a.
- `ai_wage_productivity_multiplier` = 0.5 (default) — hump-shaped premium peaks at 50% automation coverage
- `policy_wage_floor` = `annual_min_wage / BASELINE_AVERAGE_ANNUAL_WAGE`

The classic Phillips channel and the scarcity channel sit on opposite sides of the AI-displacement spectrum: classic dominates where AI hasn't moved, scarcity dominates where AI has moved and remaining human roles are scarce.

**AI Productivity Premium** — Four phases:
- **Phase 1 (UE 4-10%)**: Premium offsets Phillips → wages flat/rise
- **Phase 2 (UE 10-25%)**: Phillips grows, premium peaks → wages flat
- **Phase 3 (UE 25%+)**: Phillips dominates, premium fading → wages fall
- **Phase 4 (UE 40%+)**: Premium ≈ 0 → wages collapse to min wage floor

Source: Goldman Sachs, McKinsey (2023-2024) — firms raising compensation for AI-proficient senior staff while laying off junior staff.

### 4.3a Scarcity Premium → Cheaper-Score Feedback (Phase 10.A Part 12)

The per-cluster scarcity premium computed in §4.3 is not just a macro wage adjustment — it **feeds back into next year's Cheaper-score**, closing the loop between labor scarcity and the relative attractiveness of automation. Source: `src/models/macro.ts:367–385` (`computeClusterScarcityPremium`); `src/models/displacement.ts:176–228` (cluster aggregation).

**Per-role primitive**:
- `role.aiReplacementDifficultyWagePremium` — how much wages would rise in this role under sustained AI scarcity (analytic property of the role, set per cluster/role).

**Per-cluster aggregation** (each year):
```
priorYearWageAdjustmentByCluster[o] =
    Σ_r (employment(o, r, t) × role.aiReplacementDifficultyWagePremium(o, r))
  / Σ_r  employment(o, r, t)
```

**Cheaper-score adjustment** (next year):
```
C(c, o, r, t+1) = C_baseline(c, o, r, t+1) + priorYearWageAdjustmentByCluster[o](t)
```

The mechanism: if AI displacement raises the relative cost of remaining human labor in a cluster, that wage premium is added back into the next year's Cheaper-score for the cluster, making automation comparatively *more* attractive. This is the cost-side complement to the capability-side competitive driver in α (§4.1 V2).

Cluster outputs:
- `effectiveAlpha` — employment-weighted mean α (read by adjacent clusters via the competitive driver)
- `scarcityPremiumContribution` — this cluster's contribution to the aggregate scarcity premium
- `aggregateReplacementDifficultyWagePremium` — the cluster-level aggregated wage premium

### 4.4 Special Cases

**Education — Teachers**: Protected by policy assumption. Task erosion occurs (AI tutoring replaces some direct instruction) but headcount does NOT decrease proportionally. Model with low `adoptionCeiling`.

**Education — Administrators**: Opposite treatment. Low BFCS thresholds. Policy-driven displacement (government cuts bloat in AI era to reduce costs).

**Healthcare — Administration**: Similar to education admin. High displacement target.

---

## 5. Macro Feedback Loop

### 5.1 Consumer Welfare Index (CWI)

<!-- UPDATED 2026-03-02: CWI replaced ARPP as the headline metric (Phase 5g). ARPP (Aggregate Real Purchasing Power) deprecated.
The central metric for tracking the tipping point. ARPP is **per-capita real purchasing power** — the average person's ability to buy goods and services:

```
ARPP(t) = total_nominal_income(t) / (N × P(t))
```
-->

The central metric for tracking economic welfare. CWI is **per-capita real disposable income** — the average person's purchasing power after taxes:

```
CWI(t) = total_post_tax_income(t) / (population(t) × price_level(t))
```

Where:
- `total_post_tax_income(t)` = after_tax_wage_income + after_tax_asset_income + after_tax_transfer_income
- `population(t)` = `US_POPULATION_2025 × (1 + population_growth_rate)^(t - t_start)`
- `price_level(t)` = composite price level (§5.3)

CWI captures the race between two forces:
- **Income destruction** (displacement + wage pressure + rising taxes) pushes CWI DOWN
- **AI-driven deflation** (cheaper goods) + **policy transfers** push CWI UP

**Cycle Phase Classification** (replaces binary tipping point):
```
CWI_growth_rate(t) = (CWI(t) - CWI(t-1)) / CWI(t-1)
CWI_acceleration(t) = CWI_growth_rate(t) - CWI_growth_rate(t-1)
```

Phases:
- `STABLE`: CWI growth ≥ 0 and was not previously declining
- `ACCELERATING_DECLINE`: growth < 0 and acceleration < -threshold
- `LINEAR_DECLINE`: growth < 0 and |acceleration| ≤ threshold
- `DECELERATING_DECLINE`: growth < 0 and acceleration > threshold
- `RECOVERY`: growth ≥ 0 and was previously declining
- `MONETARY_COLLAPSE`: price level hit safety cap (1e15)

**Median CWI**: Bottom 80% real purchasing power per capita:
```
median_CWI(t) = (0.45 × after_tax_wages + 0.78 × after_tax_transfers + 0.12 × after_tax_assets) / (0.80 × population × price_level)
```
Source: CBO "Distribution of Household Income, 2022" — bottom 80% receive 45% of labor income, 78% of transfers, 12% of capital income.

### 5.2 Income Channels

Three channels compose total national income. Each has a **baseline** representing current economic reality plus **adjustments** from AI effects and policy.

#### 5.2.1 Constants

```
BASELINE_NATIONAL_INCOME = BASELINE_GDP_NOMINAL_2025       (BEA NIPA, via govData)
BASELINE_WAGE_SHARE ≈ 0.6014                               (BEA personal income, via govData)
BASELINE_ASSET_SHARE ≈ 0.2072                               (BEA personal income, via govData)
BASELINE_TRANSFER_SHARE ≈ 0.1914                            (BEA personal income, via govData)
BASELINE_WAGE_INCOME = BASELINE_WAGE_SHARE × BASELINE_GDP
BASELINE_ASSET_INCOME = BASELINE_ASSET_SHARE × BASELINE_GDP
BASELINE_TRANSFER_INCOME = BASELINE_TRANSFER_SHARE × BASELINE_GDP
BASELINE_REAL_GDP_GROWTH = 0.02                             (CBO long-term trend)
BASE_INFLATION_RATE ≈ 0.0263                                (BLS CPI-U, via govData)
BASELINE_TOTAL_EMPLOYMENT                                   (BLS CES, via govData)
US_LABOR_FORCE_2025                                         (BLS CPS, via govData)
BASELINE_UNEMPLOYMENT = US_LABOR_FORCE_2025 - BASELINE_CPS_EMPLOYMENT
NATURAL_UNEMPLOYMENT_RATE = BASELINE_UNEMPLOYMENT / US_LABOR_FORCE_2025
```

**Note on baseline transfers**: The baseline transfer income represents EXISTING government transfer programs — Social Security (~$1.3T), Medicare (~$900B), Medicaid (~$800B), unemployment insurance, SNAP, disability, veterans benefits, etc. These exist regardless of ATLAS policy toggles. ATLAS policy channels (UBI, enhanced UI, etc.) ADD to this baseline.

#### 5.2.2 Cumulative Productivity Factor

Income channels that derive from static 2025 baselines use a **cumulative productivity factor** to grow at the structural productivity rate:

```
structural_productivity_growth = max(0, BASELINE_GDP_GROWTH_RATE - DEFAULT_POPULATION_GROWTH_RATE)
                               = max(0, 0.020 - 0.004) = 0.016  (1.6%/year)
cumulative_productivity_factor(t) = (1 + structural_productivity_growth)^(t - t_start)
```

This compounds at ~1.6%/year from a static 2025 baseline. Combined with `cumulative_inflation_factor`, it ensures exogenous income channels grow at the correct nominal rate (inflation + productivity ≈ 2.6% + 1.6% = 4.2%) independently of GDP — breaking the GDP circularity that previously caused 0% real growth in zero-AI scenarios.

> **DESIGN NOTE — Static Baselines**: Wages, non-corporate asset income, and transfers all derive from `BASELINE_GDP_NOMINAL_2025` (a static constant), NOT from `prev_nominal_GDP`. This is critical. If income derives from GDP, and GDP derives from income (via consumption), you get a circular system where the growth rate tracks GDP rather than compounding at the structural productivity rate. Static baselines break this circularity while still allowing AI effects (displacement, wage pressure) to modulate the outcome.

#### 5.2.3 Wage Income

```
-- Static baseline × cumulative inflation × cumulative productivity:
wage_base(t) = BASELINE_GDP_NOMINAL_2025 × BASELINE_WAGE_SHARE
               × cumulative_inflation_factor(t) × cumulative_productivity_factor(t)

-- Displacement modulation:
employment_ratio(t) = total_remaining_employment(t) / (BASELINE_TOTAL_EMPLOYMENT × labor_force_growth_factor)
wage_ratio(t) = weighted_average_wage(t) / BASELINE_AVERAGE_ANNUAL_WAGE
adjusted_wage_ratio(t) = wage_ratio(t) × wage_pressure(t)

-- Existing wage income:
existing_wage_income(t) = wage_base(t) × employment_ratio(t) × adjusted_wage_ratio(t)
                          + policy_wage_addition(t)

-- New job wage income (pays current nominal average wage):
current_avg_wage = wage_base(t) / (BASELINE_TOTAL_EMPLOYMENT × labor_force_growth_factor)
new_job_wage_income(t) = total_human_new_jobs(t) × current_avg_wage × new_job_wage_fraction × wage_pressure(t)

aggregate_wage_income(t) = existing_wage_income(t) + new_job_wage_income(t)
```

At t=0 with zero displacement: `employment_ratio = 1.0`, `wage_ratio = 1.0`, `wage_pressure = 1.0` → wage income = BASELINE_WAGE_INCOME (≈60% of GDP). ✓

In a zero-AI economy: wages compound at inflation + productivity ≈ 4.2% nominal, matching CBO long-run trend. ✓

#### 5.2.4 Asset Income — Exact Decomposition

<!-- UPDATED 2026-03-02: Replaced simple AI profit boost with exact decomposition (Phase 5g + Phase 5-tax).
```
ai_profit_boost(t) = AI_PROFIT_GROWTH_RATE × automation_coverage(t)

aggregate_asset_income(t) = BASELINE_ASSET_INCOME
                            × baseline_growth_factor(t)
                            × (1 + ai_profit_boost(t))
                            + policy_asset_addition(t)
```
-->

Asset income is decomposed into four components with dynamic P/E ratios and endogenous capital gains realization:

```
-- Component 1: Dividends
after_tax_corporate_profits(t) = corporate_profits(t-1) × (1 - corporate_tax_rate)
dividend_income(t) = after_tax_corporate_profits(t) × (1 - corporate_retention_rate)

-- Component 2: AI Capital Gains (dynamic P/E)
ai_profit_growth_rate = (ai_profits(t-1) - ai_profits(t-2)) / ai_profits(t-1)
ai_sector_PE = max(MIN_PE, BASE_PE_ZERO_GROWTH + ai_PE_sensitivity × ai_profit_growth_rate)
ai_market_cap_change = (ai_profits(t-1) - ai_profits(t-2)) × ai_sector_PE
ai_capital_gains = max(0, ai_market_cap_change × realization_rate)

-- Component 3: Traditional Capital Gains (same structure, different PE sensitivity)
trad_sector_PE = max(MIN_PE, BASE_PE_ZERO_GROWTH + trad_PE_sensitivity × trad_profit_growth_rate)
trad_capital_gains = max(0, trad_market_cap_change × realization_rate)

-- Component 4: Non-Corporate Asset Income (static baseline, same pattern as wages)
non_corporate_asset_income = BASELINE_GDP_NOMINAL_2025 × NON_CORPORATE_ASSET_SHARE
                             × cumulative_inflation_factor × cumulative_productivity_factor

-- Endogenous Realization Rate
blended_market_performance = ai_weight × ai_growth_rate + (1 - ai_weight) × trad_growth_rate
realization_rate = clamp(BASE_REALIZATION_RATE × (1 + REALIZATION_SENSITIVITY × blended_market_performance),
                         MIN_REALIZATION_RATE, MAX_REALIZATION_RATE)

-- Total
aggregate_asset_income(t) = dividends + ai_capital_gains + trad_capital_gains
                            + non_corporate_asset_income + policy_asset_addition
```

Constants (from `constants.ts`):
- `BASE_PE_ZERO_GROWTH` = 10 (perpetuity valuation at zero growth)
- `MIN_PE` = 5 (distress floor)
- `DEFAULT_AI_PE_SENSITIVITY` = 100 (P/E points per 100% earnings growth)
- `DEFAULT_TRADITIONAL_PE_SENSITIVITY` = 60
- `BASE_REALIZATION_RATE` = 0.07 (IRS 20-year average)
- `REALIZATION_SENSITIVITY` = 1.0
- `MIN_REALIZATION_RATE` = 0.04, `MAX_REALIZATION_RATE` = 0.12

**Corporate Profits** (bottom-up, computed per year):
```
ai_corporate_profits = ai_GDP_contribution × ai_profit_margin       (default margin: 0.25)
traditional_corporate_profits = (GDP - ai_GDP) × traditional_margin  (default margin: 0.11)
total_corporate_profits = min(ai + traditional, GDP - total_wage_bill)  -- accounting identity cap
```

#### 5.2.5 Transfer Income

```
incremental_unemployment(t) = max(0, total_unemployed(t) - BASELINE_UNEMPLOYMENT)

-- COLA dampening (Phase 8a): fiscal austerity can reduce COLA indexation
effective_CIF = cumulative_inflation_factor(t)
if fiscal_profile AND CIF > cola_dampening_threshold:
    dampen_range = cola_dampening_max_CIF - cola_dampening_threshold
    dampen_intensity = min(1, (CIF - threshold) / dampen_range)
    dampen_factor = 1.0 - dampen_intensity × cola_dampening_rate
    effective_CIF = 1.0 + (CIF - 1.0) × dampen_factor    -- only the GROWTH portion is dampened

-- Baseline transfers grow at inflation + productivity (static baseline):
baseline_transfers(t) = BASELINE_TRANSFER_INCOME × effective_CIF × cumulative_productivity_factor(t)

aggregate_transfer_income(t) = baseline_transfers(t)
                               + incremental_unemployment(t) × BASELINE_TRANSFER_PER_UNEMPLOYED
                               + policy_transfer_addition(t)
```

> **NOTE**: Transfers grow with inflation (COLA) AND structural productivity. The cumulative inflation factor uses compositeInflation (goods + shelter blend) — matching Social Security COLA's CPI-W basis. The cumulative productivity factor ensures transfers maintain purchasing power relative to the growing economy.

> **NOTE on COLA dampening**: Under fiscal austerity presets (e.g., "Balanced Reduction" with `colaDampeningRate = 0.30`), COLA growth is reduced by up to 30% when cumulative inflation exceeds the threshold. This is a critical policy lever — full COLA protection (dampening = 0, "Tax the Winners") can feed a transfer-inflation spiral during mass displacement, while partial dampening breaks the feedback loop. Only the growth portion above 1.0 is dampened; the base is always preserved.

> **NOTE on BASELINE_TRANSFER_PER_UNEMPLOYED**: This constant ($19,200/year, from DOL data) represents the all-in annual transfer per incrementally unemployed person, including UI benefits, SNAP, Medicaid, and other automatic stabilizers — not just UI alone.

**Three components**:
1. **Baseline transfers** growing at inflation + productivity: Social Security, Medicare, Medicaid, etc. — these grow with CPI and structural productivity regardless of automation.
2. **Incremental transfers**: As unemployment rises above baseline, additional transfers kick in at `BASELINE_TRANSFER_PER_UNEMPLOYED` ($19,200/year) per incrementally unemployed person.
3. **Policy additions**: UBI, enhanced UI, retraining stipends from ATLAS policy toggles.

#### 5.2.6 Total Income and Shares

```
total_nominal_income(t) = aggregate_wage_income(t) + aggregate_asset_income(t) + aggregate_transfer_income(t)

wage_share(t) = aggregate_wage_income(t) / total_nominal_income(t)
asset_share(t) = aggregate_asset_income(t) / total_nominal_income(t)
transfer_share(t) = aggregate_transfer_income(t) / total_nominal_income(t)
```

Shares always sum to 1.0 by construction. As automation progresses, wage_share falls while asset_share and transfer_share rise.

### 5.3 Price Level Dynamics — Sector-Weighted AI Deflation

AI does not reduce all prices equally. Prices fall **sector by sector** as AI automates each industry. When AI automates customer service, the price of customer service falls; the price of plumbing stays the same until robots can do plumbing.

#### 5.3.1 Sector Deflation

Each occupation cluster maps to a sector of the consumer economy. The cluster's automation level directly reduces prices in its sector:

```
-- Phase 10.A floored decay curve (constants.ts:2517–2521 — DEFAULT_INFERENCE_COST_CURVE):
cost_ratio(t)         = floor + (1 − floor) × exp(−k × (t − t_start)^decayExponent)
inference_cost_savings(t) = 1 − cost_ratio(t)
sector_deflation(o, t)    = cluster_automation_coverage(o, t) × deflation_intensity(o) × inference_cost_savings(t)
```

Where:
- `cluster_automation_coverage(o, t)` = weighted adoption rate across all roles in cluster `o` (0 = no automation, 1 = fully automated)
- `deflation_intensity(o)` = how much automation in this sector reduces consumer prices (default: sector-specific, see table below)
- `floor = 0.001` — minimum residual cost ratio. Prevents implausible cost collapse (the pre-Phase-10.A unfloored exponential drove inference cost to ≈77,000× cheaper by 2050).
- `k = 0.50`, `decayExponent = 0.7` — calibrated decay shape (sub-linear in exponent for slower late-stage gains, consistent with empirical Stanford AI Index inference-cost data).
- `inference_cost_savings(t)` ∈ [0, 1 − floor] — asymptotes at `1 − floor = 0.999` rather than 1.0.

> **NOTE**: The floored curve replaces the unbounded `1 - exp(-rate × t)` form. The old `DEFAULT_INFERENCE_ANNUAL_CHANGE` constant is marked DEPRECATED in `constants.ts:1960–1961`. `InferenceCostCurveParams` is now user-adjustable via `AICostParams.inferenceCostCurve` (`types/index.ts:245–248`). `deflation_intensity` still caps the maximum price reduction — prices can't fall below the non-AI input costs (materials, energy, real estate).

When multiple clusters share a sector prefix (e.g., `tech_swe` and `tech_data_ml` both map to "tech"), the sector's CPI weight is split evenly among those clusters:
```
cluster_cpi_weight = SECTOR_CPI_WEIGHTS[prefix] / count_of_clusters_in_prefix
```

#### 5.3.2 Deflation Intensity by Sector

Values are now **BEA-calibrated** labor cost shares by NAICS industry (source: BEA GDPbyIndustry Table 7, Compensation as % of Value Added, 2024). Per-cluster values are defined in `SECTOR_DEFLATION_INTENSITY` in `constants.ts`.

| Sector Group | Clusters | deflation_intensity | Rationale |
|---|---|---|---|
| Technology / Software | tech_* | 0.65–0.75 | Mostly labor cost — AI replaces expensive engineers |
| Finance | finance_* | 0.35–0.60 | Capital-intensive except accounting |
| Healthcare | health_* | 0.55–0.60 | Equipment + labor mix |
| Education | edu_* | 0.65–0.70 | Very labor-intensive |
| Legal | legal_* | 0.60–0.65 | Labor-intensive |
| Transportation | transport_* | 0.40–0.45 | Vehicles + fuel dominate |
| Manufacturing | mfg_* | 0.35–0.40 | Materials + equipment |
| Construction | construction_* | 0.45–0.50 | Materials + labor |
| Retail | retail_* | 0.45–0.50 | Rent + inventory |
| Food Service | food_* | 0.30–0.40 | Ingredients + labor |
| Creative | creative_* | 0.60–0.75 | Cost IS labor |
| Professional Services | prof_* | 0.15–0.60 | Mixed (real estate very capital-heavy) |
| Government | gov_* | 0.45–0.60 | Labor-intensive |
| Agriculture | ag_* | 0.25–0.35 | Land, seeds, equipment are major non-labor costs |
| Scientific R&D | sci_* | 0.50–0.55 | Equipment + labor |
| Other | other_* | 0.45 | Weighted average |

#### 5.3.3 Consumer Price Index Weight by Sector

Each sector has a weight in the consumer price basket (approximating CPI composition). Values loaded from BLS CPI Relative Importance weights (via `govData.cpiSectorWeights`). These weights must sum to 1.0.

#### 5.3.4 Composite Price Level

The price level uses a **shelter vs. goods decomposition** (Phase 5i) with 7-component goods inflation:

```
-- Goods inflation (7 components):
goods_inflation(t) = base_inflation_rate
                   - ai_deflation_rate(t)
                   + transfer_inflation(t-1)           -- one-year lag from monetary module
                   + demand_effects(t)                 -- demand-pull (TODO: not yet computed)
                   + min_wage_cost_push(t)             -- per-cluster wage overshoot × pass-through
                   + credit_deflation(t)               -- consumer credit tightening → less borrowing
                   + scarcity_inflation(t)             -- labor scarcity where AI can't fill gaps

-- Shelter inflation (sticky, separate channel):
shelter_inflation(t) = BASELINE_SHELTER_INFLATION
                     + shelter_deflation_from_AI(t)     -- embodied_capability × stickiness × 0.10
                     + foreclosure_supply_effect(t)     -- with institutional buyer absorption
                     + mortgage_rate_effect(t)          -- credit tightening → higher rates
                     + rental_demand_pressure(t)        -- displaced homeowners → renters

-- Composite (what consumers experience):
composite_inflation(t) = shelter_weight × shelter_inflation(t) + (1 - shelter_weight) × goods_inflation(t)

-- Price level accumulation:
P(t) = P(t-1) × (1 + composite_inflation(t))     for t > t_start
P(t_start) = 1.0                                  at t_start (reference index)
```

**Key dynamics**:
- Early years: Only a few low-threshold clusters are automated → ai_deflation_rate is small → prices still rising near 2%
- Middle years: Software-heavy clusters (tech, finance, legal, creative) automate rapidly → ai_deflation_rate grows → net_inflation approaches 0 or goes negative
- Late years: Physical sectors (construction, healthcare, manufacturing) automate → broad deflation → P(t) may decline significantly
- Shelter (~36% of CPI) barely deflates until embodied AI automates construction
- Deflation has a **floor**: prices can't fall below marginal cost of non-labor inputs (materials, energy, land). The `deflation_intensity` constants cap this.

#### 5.3.5 Automation Coverage

```
automation_coverage(t) = Σ_o [ employment_weight(o) × cluster_automation_coverage(o, t) ]
```

Where `employment_weight(o)` = cluster baseline employment / total baseline employment. This is a weighted measure of how much of the economy is actually automated — NOT the raw capability score.

With zero adoption: `automation_coverage = 0`. ✓

### 5.4 GDP Computation

```
GDP_nominal(t) = C(t) + I(t) + G(t) + NX(t)
GDP_real(t) = GDP_nominal(t) / P(t)
```

At t = t_start, GDP_nominal is forced to BASELINE_GDP_NOMINAL_2025. For t > t_start, the full expenditure approach is used:

#### Consumption — Differentiated Post-Tax MPC

<!-- UPDATED 2026-03-02: Replaced single-MPC consumption with differentiated post-tax MPC system (Phase 5-tax).
```
C(t) = ARPP(t) × N × MPC
```
Where `MPC = MARGINAL_PROPENSITY_TO_CONSUME = 0.6789` (BEA NIPA Table 1.1.5).

ARPP drives consumption: as real purchasing power rises (Phase 1 — deflation benefits), consumption grows. As ARPP falls (Phase 3 — displacement-demand feedback), consumption contracts.
-->

Consumption uses differentiated post-tax marginal propensities to consume:

```
-- Tax computation:
wage_income_tax = aggregate_wage_income × income_tax_rate
employee_payroll_tax = aggregate_wage_income × payroll_tax_rate × employer_employee_split
capital_gains_tax = (dividends + ai_cap_gains + trad_cap_gains) × capital_gains_rate
non_corporate_asset_tax = non_corporate_asset_income × income_tax_rate
transfer_tax = aggregate_transfer_income × transfer_tax_rate

after_tax_wage_income = aggregate_wage_income - wage_income_tax - employee_payroll_tax
after_tax_asset_income = aggregate_asset_income - capital_gains_tax - non_corporate_asset_tax
after_tax_transfer_income = aggregate_transfer_income - transfer_tax

-- Post-tax MPC consumption:
wage_consumption(t) = after_tax_wage_income(t) × effective_mpc_wage
asset_consumption(t) = after_tax_asset_for_MPC(t) × post_tax_mpc_asset
transfer_consumption(t) = after_tax_transfer_for_MPC(t) × post_tax_mpc_transfer

C(t) = wage_consumption + asset_consumption + transfer_consumption
     × consumer_credit_multiplier × deflation_velocity_multiplier
     + housing_wealth_drag
```

Where:
- `post_tax_mpc_wage` = 0.95 (Jappelli & Pistaferri 2014, post-tax calibration)
- `post_tax_mpc_asset` = 0.42 (Jappelli & Pistaferri 2014, post-tax — capital income mostly saved/reinvested)
- `post_tax_mpc_transfer` = 0.95 (Jappelli & Pistaferri 2014, post-tax — transfers mostly spent by low-income recipients)
- `effective_mpc_wage` = `post_tax_mpc_wage - precautionary_saving_adjustment` (employed workers save more when UE rises)
- SWF/equity/profit-sharing policy distributions are reclassified from asset to transfer MPC (citizens spend dividends like transfer recipients)

**Tax rates** (from `govData`, user-adjustable):
- `income_tax_rate` (effective federal income tax rate)
- `payroll_tax_rate` (split 50/50 employer/employee)
- `corporate_tax_rate` (effective corporate tax rate)
- `capital_gains_tax_rate` (effective rate on dividends + cap gains)
- `state_local_tax_rate` (on GDP)
- `transfer_tax_rate` (Social Security benefits above income thresholds)

#### Investment — Unified Pipeline

```
-- AI investment demand (gated by market signals):
utilization_factor = prev_ai_capacity_utilization ^ (util_sensitivity/100 × 3.0)
demand_factor = min(1, consumer_demand_ratio) ^ (demand_sensitivity/100 × 3.0)
investment_realization = utilization_factor × demand_factor
ai_investment_demand = ai_investment_boost × investment_realization

-- Traditional investment demand:
trad_demand_factor = min(1, consumer_demand_ratio) ^ (trad_sensitivity/100 × 3.0)
traditional_investment_demand = prev_nominal_GDP × TRADITIONAL_INVESTMENT_GDP_FRACTION × trad_demand_factor

-- Unified credit gate:
total_investment_demand = (traditional + ai_demand) × business_credit_multiplier

-- Supply-side capacity gate:
retained_earnings = after_tax_corporate_profits × corporate_retention_rate
credit_capacity = BASELINE_CREDIT_FUNDED × (prev_nominal_GDP / BASELINE_GDP)
investment_capacity = retained_earnings + credit_capacity
capacity_gate = 1.0 / (total_demand / investment_capacity) ^ CAPACITY_GATE_SENSITIVITY    if demand > capacity
I(t) = total_investment_demand × capacity_gate
```

#### Government Spending — Obligation-Based Decomposition
```
-- Phase 8a: Fiscal consolidation multipliers from fiscal response profile
obligation_G = 0.80 × BASELINE_GOVT_SPENDING × effective_CIF × consolidation_obligation_multiplier
revenue_sensitive_G = 0.20 × prev_nominal_GDP × GOVERNMENT_SPENDING_GDP_FRACTION × consolidation_discretionary_multiplier
G(t) = obligation_G + revenue_sensitive_G
```

Where `effective_CIF` is the COLA-dampened cumulative inflation factor (same as transfers, §5.2.5). `consolidation_obligation_multiplier` and `consolidation_discretionary_multiplier` are computed by `computeFiscalConsolidation()` — they ramp linearly from 1.0 toward (1 - maxCut) as debt/GDP rises from `consolidationThreshold` to `consolidationMaxThreshold`.

Source: CBO mandatory/discretionary split. ~80% obligation-driven (federal mandatory + discretionary — grows with inflation), ~20% revenue-sensitive (state/local — tracks GDP via tax revenue).

#### Net Exports
```
NX(t) = prev_nominal_GDP × NET_EXPORTS_GDP_FRACTION + ai_net_export_boost × investment_realization
```

`NET_EXPORTS_GDP_FRACTION` = negative (BEA NIPA — U.S. is net importer). AI production onshoring adds to NX.

#### GDP Growth Rate
```
gdp_growth_rate(t) = (GDP_nominal(t) - GDP_nominal(t-1)) / GDP_nominal(t-1)    for t > t_start
gdp_growth_rate(t_start) = BASELINE_REAL_GDP_GROWTH                             at t_start
```

#### AI Productivity Effect on GDP

AI boosts GDP through TWO mechanisms (neither involves raising wages):

1. **Output per worker increases**: Remaining workers augmented by AI produce more. This is captured implicitly — as sectors automate, they produce the same (or more) output with fewer workers, which shows up as lower prices (Section 5.3) and higher profits (Section 5.2.3).

2. **AI production expansion**: Displaced-worker-equivalent output by AI, split into investment, net exports, and consumer goods potential. The consumer goods potential is absorbed by the economy based on demand health.

AI does NOT meaningfully raise wages. Historical evidence since the 1970s: productivity has roughly doubled while median real wages are flat. Productivity gains accrue to capital owners. The model reflects this by growing asset income (not wages) with automation.

### 5.5 The Policy Window

#### 5.5.1 Two-Part Window

The model identifies two separate policy windows:

**Preparation Window**:
- Opens: first year where unemployment rate ≥ baseline + 1pp (Sahm Rule analog)
- Closes: first year after open where cycle phase hits `ACCELERATING_DECLINE` or `MONETARY_COLLAPSE`

**Fiscal Window**:
- Opens: first year where GDP still growing AND displacement has started (prep window open)
- Closes: first year after open where GDP growth turns negative (no fiscal room for new commitments)

```
policy_window_duration = fiscal_window_close - fiscal_window_open
```

During this window:
- The economy is benefiting from AI (CWI rising or stable)
- But displacement is accumulating
- Policy intervention (UBI, equity redistribution, retraining) can redirect AI's productivity gains to displaced workers
- The Fisher equation (Section 7) determines how much can be redistributed without inflation

After the window closes, policy intervention becomes much more expensive and less effective.

#### 5.5.2 Cycle Phases

Phase classification is now continuous (from CWI growth rate + acceleration), not binary:

1. **STABLE** — CWI growing, no prior decline
2. **ACCELERATING_DECLINE** — CWI falling, decline accelerating
3. **LINEAR_DECLINE** — CWI falling, roughly constant rate
4. **DECELERATING_DECLINE** — CWI falling, decline slowing
5. **RECOVERY** — CWI growing after prior decline
6. **MONETARY_COLLAPSE** — price level hit safety cap

### 5.6 Displacement-Demand Feedback

<!-- UPDATED 2026-03-02: Replaced ARPP-based revenue pressure with GDP-contraction-based (Phase 1 overhaul).
When ARPP falls, firms face revenue pressure, which accelerates automation:

```
revenue_pressure(t) = max(0, -ΔARPP(t) / ARPP(t))
automation_acceleration(t) = revenue_pressure(t) × pressure_sensitivity
```
-->

When GDP contracts, firms face revenue pressure, which accelerates automation adoption:

```
gdp_contraction(t) = max(0, -gdp_growth_rate(t))
new_pressure(t) = min(cap, sensitivity × gdp_contraction)
automation_acceleration(t) = min(cap, previous_acceleration × (1 - decay) + new_pressure)
```

Where:
- `sensitivity` = `REVENUE_PRESSURE_SENSITIVITY_DEFAULT` = 1.5 (McKinsey 2020: COVID caused 3-4 years of digital acceleration for ~10% revenue shock)
- `cap` = `REVENUE_PRESSURE_CAP` = 0.3 (enterprise procurement/integration timelines limit adoption speed)
- `decay` = `REVENUE_PRESSURE_DECAY` = 0.5 (half-life ~1 year; prevents infinite compounding)

This creates the self-reinforcing displacement-demand feedback cycle:
```
GDP falls → revenue_pressure rises → adoption accelerates → more displacement →
wage income falls → GDP falls more → revenue_pressure rises more → ...
```

### 5.7 Demand Spillover & Revenue Pressure

<!-- UPDATED 2026-03-02: Replaced economic_activity_factor with demand spillover (Phase 3c.1) and GDP-based revenue pressure (Phase 1 overhaul).
```
economic_activity_factor(t) = f(gdp_growth_rate(t-1), is_past_tipping_point(t))
```

This is a macro-level multiplier on employment that captures demand-side effects:
- When GDP is growing: `eaf ≥ 1.0` (some displaced workers reabsorbed)
- When GDP is shrinking: `eaf < 1.0` (demand contraction causes additional job losses beyond AI displacement)
- When past tipping point: `eaf` declines faster (revenue pressure acceleration)

`economic_activity_factor` affects `total_employment` but does NOT contribute to `total_displaced` or `cluster_*_displacement_pct` — those metrics track AI displacement only (see Section 4.2).
-->

#### 5.7a Demand Spillover

Per-cluster demand spillover is the level-based mechanism that replaces the old rate-of-change-based economic activity factor. Each cluster's remaining employment is reduced by its weighted demand ratio:

```
consumer_demand_ratio = consumption(t-1) / BASELINE_CONSUMPTION_2025
gov_demand_ratio = government_spending(t-1) / BASELINE_GOVT_SPENDING_2025
business_demand_ratio = investment(t-1) / BASELINE_INVESTMENT_2025

cluster_demand_ratio(o) = consumer_share(o) × consumer_demand_ratio
                        + gov_share(o) × gov_demand_ratio
                        + business_share(o) × business_demand_ratio

demand_survival_rate(o) = min(1.0, max(0, cluster_demand_ratio(o)))
demand_spillover_loss(o) = remaining_employment(o) × (1 - demand_survival_rate(o))
```

Where `consumer_share`, `gov_share`, and `business_share` are per-cluster demand composition weights (summing to 1.0).

#### 5.7b Revenue Pressure Feedback (Revised)

```
revenue_pressure(t) = accumulated_pressure(t-1) × (1 - decay) + new_pressure(t)
new_pressure(t) = min(cap, sensitivity × max(0, -gdp_growth_rate(t)))
accumulated_pressure(t) = min(cap, revenue_pressure(t))
```

This replaces the old ARPP-based revenue pressure with GDP-contraction-based acceleration with decay and cap.

### 5.8 Extended Model Components

#### 5.8a Capacity Utilization & Profit Realization

```
potential_GDP = gdp_real + ai_consumer_goods_potential
capacity_utilization = min(1.0, gdp_real / potential_GDP)
```

The demand health ratio determines how much AI consumer goods potential is absorbed:
```
real_consumption = consumption / price_level
demand_health_ratio = min(1.0, real_consumption / BASELINE_CONSUMPTION_2025)
ai_goods_absorbed = ai_supply_capacity × demand_health_ratio
unrealized_AI_output = ai_supply_capacity - ai_goods_absorbed
```

#### 5.8b Demand Feedback

Corporate profits are dampened when nominal GDP falls below recent trend:
```
rolling_avg_GDP = average(nominal_GDP_history, lookback=5_years)
demand_ratio = min(1.0, current_nominal_GDP / rolling_avg_GDP)
demand_penalty = demand_ratio ^ sensitivity
```

Rolling average adapts to the "new normal" — prevents diverging baseline problem where comparing to a trend growing at ~4.6%/year made the ratio meaningless at long horizons.

#### 5.8c Tax System

```
-- Individual taxes:
wage_income_tax = aggregate_wage_income × income_tax_rate
employee_payroll_tax = aggregate_wage_income × payroll_tax_rate × 0.50
capital_gains_tax = (dividends + ai_cap_gains + trad_cap_gains) × capital_gains_rate
non_corporate_asset_tax = non_corporate_asset_income × income_tax_rate
transfer_tax = aggregate_transfer_income × transfer_tax_rate

-- Corporate tax:
corporate_tax_revenue = corporate_profits(t-1) × corporate_tax_rate

-- State/local:
state_local_revenue = gdp_nominal × state_local_tax_rate

-- Total:
total_government_revenue = wage_income_tax + employee_payroll + employer_payroll
                         + capital_gains_tax + non_corporate_asset_tax + transfer_tax
                         + corporate_tax_revenue + state_local_revenue

fiscal_balance = total_government_revenue - government_spending
```

#### 5.8d Housing & Shelter

Dual-channel housing model (Phase 5i):

**Shelter Inflation** (sticky, separate from goods):
- Baseline shelter inflation + AI construction deflation (gated by embodied capability)
- Foreclosure supply pressure (with institutional buyer absorption)
- Mortgage rate effects from credit tightening
- Rental demand pressure from displaced homeowners
- Land scarcity floor (`shelterInflationFloor`, default -0.05)

**Mortgage Stress Index** — composition-based credit amplifier:
- When AI displaces high-wage knowledge workers first (generative → Q4/Q5 quintiles), the same aggregate unemployment rate causes MORE mortgage stress
- Returns ≥ 1.0 when high-wage clusters displaced disproportionately

**Dynamic Homeownership** — per-quintile tracking:
- Displacement → foreclosure (with configurable lag, default 2 years) → homeownership loss
- Recovery rate gradually rebuilds toward baseline rates
- Feeds into housing wealth effect on consumption

**Home Price Model** (5-channel, computed in `computeHomePriceChange()`):
```
home_price_change_rate = -mortgage_rate_change × affordability_sensitivity     -- Channel 1: Affordability
                       + real_income_growth × income_housing_elasticity        -- Channel 2: Income
                       + foreclosure_supply_pressure                           -- Channel 3: Supply
                       + population_growth × demographic_elasticity            -- Channel 4: Demographics
                       + affordability_reversion_effect                        -- Channel 5: Mean reversion
```

Where affordability reversion is asymmetric: upward reversion at full sensitivity, downward at 50% (sticky downward).

**Housing Wealth Effect**:
```
wealth_change = BASELINE_HOUSING_WEALTH × home_price_change_rate
housing_wealth_drag = wealth_change × housing_wealth_MPC × avg_homeownership
```

#### 5.8e Investment Pipeline

```
-- Supply side:
after_tax_profits = corporate_profits(t-1) × (1 - corporate_tax_rate)
retained_earnings = after_tax_profits × corporate_retention_rate
credit_capacity = BASELINE_CREDIT_FUNDED × (prev_nominal_GDP / BASELINE_GDP)
investment_capacity = retained_earnings + credit_capacity

-- Soft capacity gate:
if total_investment_demand > investment_capacity:
    capacity_gate = 1.0 / (demand / capacity) ^ CAPACITY_GATE_SENSITIVITY
else:
    capacity_gate = 1.0

final_investment = total_investment_demand × capacity_gate
```

#### 5.8f Consumer & Business Credit Conditions (Phase 5i → Fix 5)

**Consumer Credit** — three independent channels (computed in `computeConsumerCreditConditions()`):

1. **Income Adequacy** (dominant channel): Banks assess each income stream by perceived stability:
```
underwritable_income = real_wage_income × 1.0
                     + real_transfer_income × transfer_reliability_weight
                     + real_asset_income × 0.10   (ASSET_INCOME_UNDERWRITING_WEIGHT)

-- Phase 8 Fix 5: Baseline grows at structural productivity trend:
adjusted_baseline = baseline_household_income × (1 + trend_real_income_growth)^years_since_baseline
income_adequacy_ratio = min(2.0, underwritable_income / adjusted_baseline)
income_deficiency = max(0, 1 - income_adequacy_ratio)
income_tightening = income_adequacy_sensitivity × income_deficiency
```

2. **Collateral Values** (asymmetric): Falling home prices → aggressive tightening; rising → mild loosening:
```
if home_price_change < 0:
    collateral_tightening = sensitivity × mortgage_stress_index × |home_price_change|
else:
    collateral_tightening = -sensitivity × LOOSENING_ASYMMETRY(3:1) × home_price_change
```

3. **Systemic Risk**: CWI decline + inflation risk premium:
```
cwi_decline = max(0, 1 - current_CWI / baseline_CWI)
inflation_risk = max(0, composite_inflation - 0.03) × inflation_risk_sensitivity
systemic_tightening = systemic_risk_sensitivity × cwi_decline + inflation_risk
```

Combined:
```
consumer_credit_tightening = min(max_tightening, income + collateral + systemic)
consumer_credit_multiplier = max(0.01, 1.0 - credit_impact × (tightening / max_tightening))
```

**Business Credit** — two independent channels (computed in `computeBusinessCreditConditions()`):
1. **Profitability**: after-tax corporate profits vs baseline (below → tightening, above → loosening)
2. **Revenue Trajectory**: GDP growth direction and magnitude

```
business_credit_multiplier = 1.0 - business_investment_impact × (total_tightening / max_tightening)
```

Business credit loosening also feeds into AI adoption acceleration:
```
credit_adoption_acceleration = min(cap, business_credit_loosening × credit_adoption_sensitivity)
```

### 5.9 Depression Detection

The model flags a depression when:
```
GDP_nominal(t) < GDP_nominal(t-1) for 4+ consecutive quarters AND unemployment_rate(t) > 15%
```

---

## 6. New Job Creation vs. Automation Coverage

### 6.1 The Survivability Function

```
A(t) = automation_coverage(t)    // as defined in §5.3.5
     = Σ (employment_weight(o) × cluster_auto_coverage(o, t))
```

`A(t)` represents the fraction of the economy actually automated, measured by employment-weighted cluster automation coverage. This displacement-based metric (not raw capability scores) is used consistently for:
- AI profit boost (§5.2.3)
- AI investment hump (§5.4)
- New job survivability (below)
- Sector-weighted deflation (§5.3.1)

New job creation rate from AI-driven R&D and new industries:
```
J_new(t) = innovation_rate × GDP(t) × rd_multiplier
```

But survivability of new jobs:
```
durable_new_jobs(t) = J_new(t) × (1 - A(t))^persistence_factor
```

Where `persistence_factor` > 1 means new jobs are more vulnerable than average (because they're created in AI-adjacent fields), and < 1 means they're more durable.

### 6.2 The Mathematical Proof

Net job change:
```
net_jobs(t) = durable_new_jobs(t) - displaced_jobs(t)
```

As A(t) → 0.9+, `durable_new_jobs(t)` → near zero regardless of how large `J_new(t)` is.
Meanwhile `displaced_jobs(t)` continues growing.

The crossover point where net_jobs becomes permanently negative is identifiable and visualizable.

---

## 7. Monetary Model

### 7.1 Fisher Equation Framework

```
M(t) × V(t) = P(t) × Y(t)
```

Where:
- `M(t)` = money supply (adjustable — Fed + fiscal transfers increase M)
- `V(t)` = velocity of money (dynamic — responds to unemployment and consumption ratio)
- `P(t)` = price level (from Section 5.3)
- `Y(t)` = real GDP (from Section 5.4)

**Dynamic Velocity** (Phase 5g):
```
V(t) = V_baseline × f(unemployment_rate, consumption_ratio, velocity_sensitivity, floor_ratio)
```

Velocity declines with excess unemployment (~3% per pp, from FRED M2V analysis) and falls in consumption. Floor at 50% of baseline (Great Depression precedent).

### 7.2 Transfer Funding Without Inflation — The Neutral Zone

AI deflation creates fiscal headroom. As AI reduces prices, the government can inject money via transfers without causing net inflation, as long as:

```
transfer_driven_inflation ≤ ai_deflation_headroom
```

Maximum transfer level that maintains price stability:

```
ΔM_max = (P_target × ΔY_ai - ΔP_ai × Y) / V
T_max_per_capita = ΔM_max / N
```

The neutral zone grows as AI deflation increases. This is the core mechanism that makes the policy window actionable: AI creates the very fiscal space needed to fund the transfers that prevent the self-reinforcing displacement cycle.

### 7.3 Fiscal Accounting

#### 7.3.1 Endogenous Revenue

Government revenue is reorganized from the 8-component tax model (§5.8c) into 3 endogenous buckets:

```
laborTaxRevenue = wage_income_tax + employee_payroll_tax + employer_payroll_tax
corporateTaxRevenue = corporate_tax_revenue  (pass-through)
otherRevenue = capital_gains_tax + state_local_revenue + transfer_tax + non_corp_asset_tax
totalGovernmentRevenue = labor + corporate + other
revenueGDPRatio = totalGovernmentRevenue / nominalGDP
```

Source: BEA NIPA Table 3.2 (Government Current Receipts by Type); CBO Revenue Projections.

#### 7.3.2 Government Spending

```
existingObligations = totalGovernmentRevenue + BASELINE_PRIMARY_DEFICIT_GDP_RATIO × nominalGDP
policyCosts = policyTransferAddition + retrainingCosts + otherPolicyCosts
interestExpense = prevDebtStock × weightedAverageDebtRate
totalGovernmentSpending = existingObligations + policyCosts + interestExpense
```

Key change from earlier phases: replaces fixed `BASELINE_DEBT_INTEREST` with dynamic `prevDebtStock × weightedAverageDebtRate`, creating endogenous interest expense that responds to debt accumulation and rate changes.

Source: CBO Budget and Economic Outlook; FRED FYFSGDA188S.

#### 7.3.3 Debt Accumulation

```
primaryDeficit = (totalSpending - interestExpense) - totalRevenue
totalDeficit = primaryDeficit + interestExpense
debtStock = max(0, prevDebtStock + totalDeficit)
debtGDPRatio = debtStock / nominalGDP
```

Debt cannot go negative (surpluses reduce debt). Safety cap at `FISCAL_MONETARY_SAFETY_CAP` prevents IEEE 754 overflow.

Source: CBO "The Budget and Economic Outlook" methodology; IMF Fiscal Monitor debt dynamics framework.

#### 7.3.4 Weighted Average Debt Rate

Each year, a fraction of existing debt matures and is reissued at the current market rate (10Y yield):

```
rolledOver = prevDebtStock × DEBT_ROLLOVER_RATE    (default 0.30, ~3-year convergence)
retained = prevDebtStock - rolledOver
newDeficit = max(0, totalDeficit)

weightedAvgRate = (retained × prevRate + (rolledOver + newDeficit) × marketRate) / currentDebtStock
```

This produces gradual convergence toward the current market rate, matching real-world Treasury debt dynamics where ~6-year weighted-average maturity means rate changes propagate slowly.

Source: Treasury quarterly refunding statements; CBO Federal Debt and the Statutory Limit.

### 7.4 Federal Reserve

#### 7.4.1 Full Employment GDP

```
naturalEmployment = dynamicLaborForce × (1 - NATURAL_UNEMPLOYMENT_RATE)
productivityBoost = 1 + aggregateAutomationCoverage × 0.5
trendGDP = baselineGDPReal × (1 + baselineGDPGrowthRate)^yearsSinceStart
fullEmploymentGDP = trendGDP × (naturalEmployment / baselineTotalEmployment) × productivityBoost
```

**Naming distinction**: `fullEmploymentGDP` is the GDP at natural unemployment with AI productivity augmentation. This is DIFFERENT from `MacroOutput.potentialGDP` which means "AI production potential" (gdpReal + aiConsumerGoodsPotential).

#### 7.4.2 Taylor Rule

Classic Taylor (1993) formulation with configurable coefficients:

```
outputGap = (gdpReal - fullEmploymentGDP) / fullEmploymentGDP
taylorPrescribed = r* + π(t-1) + α × (π(t-1) - π*) + β × outputGap
```

Where:
- `r*` = `NEUTRAL_REAL_RATE` = 0.01 (Holston-Laubach-Williams estimate)
- `π(t-1)` = previous year's `compositeInflation` (one-year data lag)
- `π*` = `inflationTarget` = 0.02 (Fed's 2% target, user-adjustable)
- `α` = `taylorInflationCoeff` = 1.5 (user-adjustable, 0–3)
- `β` = `taylorOutputGapCoeff` = 0.5 (user-adjustable, 0–2; 0 = Fed ignores unemployment)

**No artificial floor or ceiling.** Negative rates represent a prescription for unconventional policy (QE). The math produces the answer.

Source: Taylor (1993) "Discretion versus Policy Rules in Practice."

#### 7.4.3 Fiscal Dominance

When government debt service costs consume a large fraction of revenue, the Fed becomes reluctant to raise rates further:

```
debtServiceRatio = interestExpense / totalGovernmentRevenue

if debtServiceRatio > fiscalDominanceThreshold:
    dominancePressure = (debtServiceRatio - threshold) / threshold
    dominanceFactor = min(1, dominancePressure) × fiscalDominanceDampening
    policyRate = prevPolicyRate + (1 - dominanceFactor) × (taylorPrescribed - prevPolicyRate)
    fiscalDominanceActive = true
else:
    policyRate = taylorPrescribed
    fiscalDominanceActive = false
```

Where:
- `fiscalDominanceThreshold` = 0.25 (user-adjustable, 0.05–0.60)
- `fiscalDominanceDampening` = 0.5 (user-adjustable, 0–1; 1 = Fed fully stuck at prev rate)

User can also override the policy rate entirely via `policyRateSchedule` (PolicySchedule with year/value keyframes), bypassing Taylor Rule.

### 7.5 Monetization — The Hyperinflation Fix

Government deficits are **bond-financed by default** (no inflation). Money creation only occurs under specific conditions:

```
if policyRate ≤ effectiveLowerBound:
    monetizationRate = qeMonetizationRate                    -- Case 1: QE at zero lower bound
elif debtServiceRatio > 0.50:
    stressIntensity = min(1, (debtServiceRatio - 0.50) / 0.50)
    monetizationRate = qeRate + stressIntensity × (1 - qeRate)   -- Case 2: Financial repression
elif fiscalDominanceActive AND taylorPrescribed > 0:
    rateGap = taylorPrescribed - actualPolicyRate
    monetizationRate = min(qeRate, max(0, rateGap / taylorPrescribed))  -- Case 3: Fiscal dominance
else:
    monetizationRate = 0                                     -- Case 4: Normal times (DEFAULT)
```

**This is the critical fix.** The old `computeEndogenousFundingSplit()` returned `moneyCreatedFraction = 1.0` whenever `fiscalDeficitGDPRatio > 0` (always true), treating ALL government transfers as newly printed money and causing runaway hyperinflation. The new system defaults to 0 — no monetization in normal times.

Money creation from deficit monetization:

```
monetizedDeltaM = max(0, totalDeficit) × monetizationRate
moneySupply = min(FISCAL_MONETARY_SAFETY_CAP, prevMoneySupply + monetizedDeltaM)
bondFinancedDeficit = max(0, totalDeficit) × (1 - monetizationRate)

-- Fisher equation for monetization inflation:
inflationFromMonetization = max(0, (monetizedDeltaM × velocity) / nominalGDP - aiDeflation)
```

Where:
- `effectiveLowerBound` = -0.005 (user-adjustable)
- `qeMonetizationRate` = 0.40 (user-adjustable, 0–0.80)

Source: Reinhart & Sbrancia (2015) "The Liquidation of Government Debt" for financial repression dynamics.

### 7.6 Bond Market

#### 7.6.1 Fiscal Risk Premium

Markets gradually shift from "not worried" to "panicked" as debt/GDP rises, following a sigmoid:

```
fiscalRiskPremium = maxPremium / (1 + exp(-steepness × (debtGDPRatio - midpoint)))
```

Where:
- `midpoint` = `fiscalRiskPremiumMidpoint` = 1.20 (user-adjustable, 0.60–2.50)
- `maxPremium` = `fiscalRiskPremiumMax` = 0.04 (400bp, user-adjustable, 0.01–0.10)
- `steepness` = `log(9) / 0.20` ≈ 10.99 (10%-to-90% transition spans 40pp centered on midpoint)

Source: Laubach (2009) "New Evidence on the Interest Rate Effects of Budget Deficits and Debt."

#### 7.6.2 Foreign Demand

Foreign demand for Treasuries decays exponentially as debt/GDP rises:

```
threshold = initialDebtGDPRatio + 0.10    -- 10pp buffer
if debtGDPRatio > threshold:
    foreignDemand = FOREIGN_DEMAND_INITIAL × exp(-ln(2)/0.50 × (debtGDPRatio - threshold))
else:
    foreignDemand = FOREIGN_DEMAND_INITIAL    -- 0.30 (30%)
```

Half-life: 50 percentage points of debt/GDP increase.

Source: TIC (Treasury International Capital) data; IMF WP/23/18.

#### 7.6.3 Expected Policy Rates (Expectations Channel)

Projects the Taylor Rule forward 10 years assuming inflation converges to target and output gap closes:

```
for k in 1..horizon:
    projectedInflation = currentInflation + (k/horizon) × (target - currentInflation)
    projectedOutputGap = currentOutputGap × (1 - k/horizon)
    projectedRate = r* + projectedInflation + α × (projectedInflation - target) + β × projectedOutputGap
expectedAvgPolicyRate = average(projectedRates)
```

Source: Expectations Hypothesis (Fama 1984); Survey of Professional Forecasters.

#### 7.6.4 Ten-Year Treasury Yield

```
supplyPressurePremium = max(0, bondFinancedDeficit × (1 - foreignDemand) × (1 - monetizationRate) / nominalGDP)
fundamentalYield = expectedAvgPolicyRate + TERM_PREMIUM + fiscalRiskPremium + supplyPressurePremium
tenYearYield = max(policyRate, fundamentalYield)    -- no-arbitrage floor
```

Where `TERM_PREMIUM` = 0.005 (50bp, NY Fed ACM model).

Source: Kim & Wright (2005); D'Amico et al. (2012).

#### 7.6.5 Rate Transmission

```
mortgageRate = tenYearYield + BASELINE_MORTGAGE_SPREAD    (~170bp)
stressFactor = 1 + max(0, (debtGDPRatio - baselineDebtGDPRatio) / baselineDebtGDPRatio)
corporateBorrowingRate = tenYearYield + BASE_CORPORATE_SPREAD × stressFactor    (~150bp base)
consumerCreditRate = policyRate + 0.10    (1000bp consumer spread)
```

These feed into macro.ts:
- `mortgageRate` → shelter inflation (housing channel)
- `corporateBorrowingRate` → investment dampening (crowding out)
- `consumerCreditRate` → consumer spending (credit channel)

Source: Fed H.15 Selected Interest Rates; Gilchrist & Zakrajsek (2012).

### 7.7 Equity Market

#### 7.7.1 Growth Momentum

Tracks the velocity of AI capability improvement across the 3 vectors:

```
currentChange = Σ |capability(v, t) - capability(v, t-1)|    for v in {generative, agentic, embodied}
newHistoricalMax = max(historicalMax, currentChange)
growthMomentum = currentChange / newHistoricalMax    (0 at year 0)
```

When S-curves are at their steepest: momentum ≈ 1. When S-curves flatten: momentum → 0 naturally — no hardcoded decay.

#### 7.7.2 Gordon Growth Valuation

```
equityDiscountRate = tenYearYield + EQUITY_RISK_PREMIUM    (0.045, Damodaran)
expectedGrowth = 2-year average of actual corporate profit growth rates

-- Singularity guard: prevent IEEE 754 division by zero
denominator = max(1e-6, equityDiscountRate - expectedGrowth)
basePE = (1 + expectedGrowth) / denominator

-- AI P/E premium (rational by default):
effectivePEMultiplier = 1 + (aiPEMultiplier - 1) × growthMomentum
peRatio = basePE × effectivePEMultiplier

aggregateMarketCap = max(0, corporateProfits) × peRatio
marketReturn = (marketCap(t) - marketCap(t-1)) / marketCap(t-1)
```

Where:
- `aiPEMultiplier` = 1.0 default (rational pricing, no AI premium regardless of momentum)
- User-adjustable 0.5–3.0: values > 1.0 model AI hype/bubble dynamics

Source: Gordon (1962) "The Investment, Financing, and Valuation of the Corporation"; Damodaran (2024) implied ERP.

---

## 8. Policy Simulation

### 8.1 Three Channels

**Wage Channel**: Minimum wage (enforced through Phillips curve floor), wage subsidies
```
wage_policy_effect(t) = wage_subsidy_per_worker(t) × total_employment(t)
```

> **NOTE**: Minimum wage is no longer a direct wage addition. It is enforced through the Phillips curve wage floor in `computeWagePressure()`: `policy_wage_floor = annual_min_wage / BASELINE_AVERAGE_ANNUAL_WAGE`. This also drives cost-push inflation and adoption acceleration for low-wage clusters.

**Asset Channel**: Sovereign wealth fund, universal equity stakes, mandatory profit-sharing
```
asset_policy_effect(t) = sovereign_fund_dividend(t) + equity_stake_income(t) + profit_share_income(t)
```

Where:
- `sovereign_fund_dividend = fund_size(t) × distribution_rate / N` (fund grows: size × return + contribution - distribution)
- `equity_stake_income = ownership_fraction × total_ai_company_profits(t)`
- User controls: ownership fraction, projected profit levels, annual contribution

**Transfer Channel**: UBI, expanded unemployment insurance, retraining stipends
```
transfer_policy_effect(t) = ubi_amount(t) + enhanced_ui(t) + retraining_stipend(t)
```

UBI supports two modes:
- **Manual**: keyframe schedule (PolicySchedule with year/value pairs, linearly interpolated)
- **Indexed**: base amount × (current_AI_GDP / start_year_AI_GDP)^index_rate — automatically scales with AI productivity

### 8.2 Income Composition Under Policy

```
total_income(t) = aggregate_wage_income(t) + aggregate_asset_income(t) + aggregate_transfer_income(t)
```

Where each aggregate already includes its policy additions (see Section 5.2). The shares are:

```
wage_share(t) = aggregate_wage_income(t) / total_income(t)
asset_share(t) = aggregate_asset_income(t) / total_income(t)
transfer_share(t) = aggregate_transfer_income(t) / total_income(t)
```

### 8.3 State-Level Variation

Federal parameters serve as the baseline. States override with:
- Different industry compositions (from BLS state-level OEWS data)
- Different minimum wage levels
- Different transfer generosity
- Different regulatory environments (e.g., AV approval timelines)

```
state_outcome(s, t) = federal_baseline(t) × state_industry_weight(s) × state_policy_modifier(s)
```

### 8.4 Required Asset Ownership Calculation

Given a target CWI level (year-0 CWI) and projected automation timeline, the model solves for:

```
required_asset_ownership = (target_CWI × N × P(t) - E(t) × W(t) - aggregate_transfer_income(t)) / (N × total_ai_profits(t))
```

"How much of the AI economy does the average person need to own to maintain current living standards?"

**CRITICAL**: The `target_CWI` must use the YEAR 0 CWI value as the target, NOT the current year's CWI. If it targets current-year CWI, required ownership shrinks as the economy deteriorates — defeating the purpose.

Similarly, solve for required transfer levels:
```
required_transfers = (target_CWI × N × P(t) - E(t) × W(t) - aggregate_asset_income(t)) / U(t)
```

---

## 9. Second-Order Employment Multipliers

### 9.1 Direct + Indirect + Induced Effects

Using BEA input-output employment multipliers:

```
total_displacement(o, t) = direct_displacement(o, t) × employment_multiplier(o)
```

Industry-specific multipliers (from `EMPLOYMENT_MULTIPLIERS` in `constants.ts`, user-adjustable):
- Trucking: 3.4x (ATA estimate)
- Manufacturing: 1.6x (Moretti 2010)
- Tech/Software: 4.3x (high local spending multiplier)
- Retail: 1.2x (lower multiplier — already local service)
- Healthcare: 2.1x (significant local economic anchor)
- Construction: 2.4x (materials + subcontractor chains)
- Finance: 3.2–3.8x (high-income spending multiplier)
- Legal: 2.5–3.0x (professional services cluster)
- `other_uncategorized`: employment-weighted average of all other clusters (computed at runtime)

Second-order displacement is bounded: cannot exceed remaining employment in the cluster.

### 9.2 Cascading Displacement

When a major employer category is automated, second-order effects hit adjacent service jobs:

```
adjacent_displacement(o_adj, t) = Σ(displacement(o, t) × adjacency_weight(o, o_adj))
```

The adjacency matrix captures relationships like:
- Trucking → Truck stops, diners, motels, fuel stations
- Office workers → Downtown restaurants, dry cleaners, commercial real estate
- Manufacturing → Supplier towns, local retail

### 9.3 Supply Chain Multipliers (Phase 9)

The Phase 9 Supply Chain Uncertainty model (commit `8315d88`, `src/models/supplyChain.ts`) introduces a **non-demand** multiplier path: chip / energy / datacenter constraints delay AI capability trajectories and pass costs through to BFCS, throttling the adoption side of the displacement cascade rather than the demand side.

**Training-channel effect — capability delay**:
```
cumulativeCapabilityDelay(t) = applyPropagationLags(supplyChainShockHistory)
S_v(t) = trajectory_v(t − cumulativeCapabilityDelay)        -- effective capability S-curve lag
```
Shocks (e.g., chip shortages) accumulate into a backlog with hysteresis (`hysteresisWidth`) so capacity additions don't unwind delays instantaneously. The `cascadeBacklog` term captures supplier-level propagation lag — bottlenecks in node-N flow downstream into N+1.

**Deployment-channel effect — cost pass-through to BFCS**:
```
faster_multiplier(o, r, t) = computeFasterMultiplier(scParams, scState)        -- ≤ 1 under shortage
safer_multiplier(o, r, t)  = computeSaferMultiplier(scParams, scState)         -- ≤ 1 under shortage
F(o, r, t) = baselineFaster × faster_multiplier
S(o, r, t) = baselineSafer  × safer_multiplier
```
Hardware cost pass-through similarly compresses Cheaper-score during shortages. Net result: adoption rate falls (or delays beyond `endYear`), employment multiplier impacts compound through the standard §9.1 chain but with shifted timing.

**Adoption drag**:
```
computeHysteresisWidth(supply_state) → drag → computeStatefulAdoptionRate(...)
```
Adoption itself has memory under supply uncertainty — firms postpone commitments when shock variance is high.

**Output fields** (per year):
- `supplyChainState`: `effectiveComputeDecline`, `cascadeBacklog`, `hysteresisWidth`, current shock decomposition
- `cumulativeCapabilityDelay`: per-vector capability-S-curve lag (in years)

---

## 10. Simulation Orchestration

### 10.1 Time Loop

The master simulation runs year-by-year from `t_start` (current year) to `t_end` (user-configurable, default 2050):

```
for t in range(t_start, t_end + 1):
    1. Update capability scores S_c(t) for all 3 vectors
    2. For each cluster:
       a. Compute weighted capability from 3-vector scores × cluster weights
       b. Compute BFCS scores for all roles
       c. Check adoption triggers (with payroll tax → Cheaper modulation)
       d. Compute adoption rates (with competitive + revenue + credit + min wage acceleration)
       e. Compute quadratic displacement: adoption × weighted_capability²
    3. Aggregate to total employment, average wages (AI-only, no demand adjustment yet)
    4. Compute automation coverage (employment-weighted)
    5. Per-cluster demand spillover (using previous year's C, G, I)
    6. Compute scarcity inflation + labor supply response (after policy effects)
    7. Compute new job creation and survivability
    8. Compute AI production expansion
    9. Compute sector-weighted deflation + composite price level
    10. Apply policy effects (wages, assets, transfers)
    11. Compute macro: income channels, taxes, consumption, investment, GDP, CWI
    12. Compute revenue pressure and automation acceleration (displacement-demand feedback)
    13. Compute monetary state (Fisher equation, neutral zone, dynamic velocity)
    14. Fiscal-monetary block:
        a. Endogenous revenue (reorganize 8 macro tax components → 3 buckets)
        b. Government spending (obligations + policy costs + interest on debt)
        c. Deficit & debt accumulation (accounting identity)
        d. Full employment GDP + output gap
        e. Taylor Rule prescribed rate
        f. Fiscal dominance check + policy rate (with optional keyframe override)
        g. Monetization regime selection (normal/ZLB/fiscal dominance/financial repression)
        h. Money creation (deficit × monetization rate → deltaM for monetary state)
        i. Expectations channel (10-year forward rate projection)
        j. Bond market (fiscal risk premium, foreign demand, 10Y yield, supply pressure)
        k. Rate transmission (mortgage, corporate borrowing, consumer credit rates)
        l. Equity market (growth momentum, Gordon Growth valuation, market cap)
        m. Weighted average debt rate update (30% annual rollover)
    15. Compute state-level variations
    16. Update housing state (homeownership, mortgage stress, foreclosures)
    17. Store all outputs for visualization
```

### 10.2 Outputs

Every timestep produces:
- Employment by cluster and role (absolute numbers + % change)
- Average wages by cluster and role (with Phillips curve + wage elasticity adjustment)
- Unemployment rate (U3 equivalent, CPS-consistent)
- CWI (per-capita real disposable purchasing power) + Median CWI (bottom 80%)
- GDP (nominal and real, where real = nominal / price_level)
- Price level (composite: shelter × 36% + goods × 64%), inflation/deflation rate
- Income composition (wage/asset/transfer shares, pre- and post-tax)
- Cycle phase (STABLE / ACCELERATING_DECLINE / LINEAR_DECLINE / DECELERATING_DECLINE / RECOVERY / MONETARY_COLLAPSE)
- Policy window status (preparation + fiscal)
- Money supply, velocity, inflation impact of transfers (neutral zone status)
- Fiscal-monetary system:
  - Fiscal: federal debt stock, debt/GDP ratio, revenue (labor/corporate/other), spending, deficit, interest expense, weighted avg debt rate
  - Federal Reserve: Taylor-prescribed rate, policy rate, fiscal dominance status, output gap, full employment GDP
  - Bond Market: 10Y yield, expected avg policy rate, term premium, fiscal risk premium, supply pressure premium, foreign demand ratio, mortgage/corporate/consumer rates
  - Monetization: regime, monetization rate, money created, bond-financed deficit, inflation from monetization
  - Equity Market: aggregate market cap, P/E ratio, growth momentum, expected return
- State-level breakdowns
- Net job creation rate
- Depression probability indicator
- Automation coverage (employment-weighted, not raw capability)
- Revenue pressure and automation acceleration
- Capacity utilization, unrealized AI output
- Corporate profits (AI + traditional), tax revenue decomposition
- Housing: homeownership quintiles, mortgage stress, shelter inflation, wealth effect
- Consumer + business credit conditions
- Investment pipeline: retained earnings, credit capacity, capacity gate
