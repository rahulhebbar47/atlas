# PHASES.md — ATLAS Development Phases

> **Historical document.** This file captures the original phased development plan as it was written and executed. Some details — particularly early-phase references to 8 capability vectors (now consolidated to 3) and ARPP (now replaced by CWI) — reflect the model's state at the time each phase was designed. The plan is preserved as-is to document the development process.
>
> **Part I (Phases 1–8)** below is the original plan, preserved verbatim. **Part II (Post-Plan Development)**, starting after Phase 8, records the work that actually shipped after the original plan was completed: the Phase 5 refinement series, a nominal-first economics overhaul, the tax pipeline, the full fiscal-monetary system (8a–8d plus five stabilization fixes), Phase 9 (supply chain), and Phase 10.A (augmentation). Internal phase numbering was reused across some of these tracks — Part II groups the work thematically and notes the labels used at the time.

Each phase produces a working, demonstrable increment. Do NOT skip ahead. Each phase must be fully functional before starting the next.

---

# Part I — Original Phased Plan (Phases 1–8)

---

## Phase 1: Foundation — Project Scaffold + Core Math Engine

### Objective
Set up the project, implement the pure mathematical model with no UI, and verify it produces correct outputs.

### Tasks

1. **Project Setup**
   - Initialize Vite + React + TypeScript project
   - Configure Tailwind CSS 4
   - Set up project structure per CLAUDE.md architecture
   - Install dependencies: zustand, @tanstack/react-query, d3, recharts, framer-motion
   - Configure TypeScript strict mode
   - Set up path aliases (@/components, @/models, etc.)

2. **Type Definitions** (`src/types/`)
   - Define all core types: `CapabilityVector`, `OccupationCluster`, `RoleLevel`, `BFCSThresholds`, `SimulationState`, `SimulationOutput`, `PolicyConfig`, `IncomeComposition`
   - These types ARE the model contract. Get them right.

3. **Constants** (`src/models/constants.ts`)
   - All economic constants with source citations
   - Default BFCS thresholds per occupation cluster (from OCCUPATION_CLUSTERS.md)
   - Employment multipliers with sources
   - Default capability trajectories

4. **Capability Model** (`src/models/capabilities.ts`)
   - Implement sigmoid trajectory function
   - 8 capability vectors with adjustable parameters
   - Function: `getCapabilityScore(vector, year, params) → number`

5. **BFCS Model** (`src/models/bfcs.ts`)
   - BFCS score computation per occupation-role
   - Threshold checking (all 4 must be met)
   - Relevance matrix (capability → occupation mapping)
   - Function: `checkAdoptionTrigger(occupation, role, year, capabilities) → { triggered: boolean, scores: BFCSScores }`

6. **Adoption Model** (`src/models/adoption.ts`)
   - S-curve adoption rate post-trigger
   - Deployment type steepness parameters
   - Competitive pressure accelerant
   - Geopolitical risk modifier for robotics/AV
   - Function: `getAdoptionRate(occupation, role, year, triggerYear) → number`

7. **Displacement Model** (`src/models/displacement.ts`)
   - Task erosion calculation
   - Headcount multiplier (with special cases for teachers, admin)
   - Wage depression
   - Function: `getDisplacement(occupation, role, year, adoptionRate) → DisplacementResult`

8. **Macro Model** (`src/models/macro.ts`)
   - ARPP computation
   - GDP computation (C + I + G + NX)
   - Price level with AI deflation
   - Tipping point detection
   - Revenue pressure feedback loop
   - Function: `computeMacro(year, displacementResults, policyConfig) → MacroOutput`

9. **Simulation Orchestrator** (`src/models/simulation.ts`)
   - Master time loop: iterates year by year
   - Chains all models together
   - Collects all outputs per timestep
   - Function: `runSimulation(config: SimulationConfig) → SimulationTimeline`

10. **Unit Tests**
    - Test each model function in isolation
    - Test simulation produces sensible outputs for known inputs
    - Test tipping point detection works correctly
    - Test edge cases (100% automation, 0% automation)

### Definition of Done
- `runSimulation()` returns a complete timeline from 2025-2050
- All model functions have unit tests
- No UI yet — just verified math

---

## Phase 2: Core Dashboard — Visualization + Basic Controls

### Objective
Build the three-panel dashboard layout with basic capability controls and employment visualization.

### Tasks

1. **Design System Setup** (`src/styles/`)
   - Implement design tokens from DESIGN_PHILOSOPHY.md
   - Custom fonts loaded (select and configure distinctive fonts)
   - Color system as CSS variables / Tailwind config
   - Dark mode as default

2. **App Shell** (`src/components/layout/`)
   - Three-panel layout (controls | main viz | insights)
   - Responsive breakpoints
   - Navigation header
   - Panel collapse/expand

3. **Zustand Store** (`src/stores/simulationStore.ts`)
   - All model parameters as state
   - Capability trajectory params (per vector)
   - BFCS threshold overrides
   - Policy config
   - Computed: full simulation output (derived from params)
   - Use `subscribeWithSelector` for efficient re-renders

4. **Capability Controls** (`src/components/controls/`)
   - Slider group for each capability vector (floor, ceiling, steepness, midpoint)
   - Real-time capability curve preview (small sparkline per vector)
   - Color-coded per DESIGN_PHILOSOPHY.md

5. **Timeline Control**
   - Master time range selector (2025-2050, adjustable end year)
   - Year scrubber / playback control
   - Current year indicator

6. **Employment Chart** (`src/components/charts/`)
   - Total employment over time (area chart)
   - Breakdown by cluster (stacked area or selectable lines)
   - Unemployment rate overlay
   - Hover tooltips with per-cluster detail

7. **GDP & ARPP Chart**
   - GDP trajectory line
   - ARPP trajectory line
   - Tipping point annotation (vertical line, color change)
   - Before/after tipping point visual differentiation

8. **Key Metrics Panel** (`src/components/layout/InsightsPanel.tsx`)
   - Current year metrics: employment, GDP, ARPP, unemployment rate
   - Tipping point year indicator
   - Income composition (wage/asset/transfer) as donut or bar
   - All update reactively as controls change

### Definition of Done
- Dashboard renders with all three panels
- Moving capability sliders updates all charts in real-time
- Tipping point is visually identifiable on charts
- Looks good — follows DESIGN_PHILOSOPHY.md

---

## Phase 3: BLS Data Integration

### Objective
Integrate the pre-fetched BLS data (static JSON files in `src/data/bls/`) into the model so all baselines use real employment and wage data.

### Prerequisites
Before starting this phase, the project maintainer must have run the data fetch script:
```bash
npx tsx scripts/fetch-bls-data.ts --key YOUR_BLS_API_KEY
```
This produces JSON files in `src/data/bls/`. If these files don't exist, the app should show a developer-facing error message: "BLS data not found. Run: npx tsx scripts/fetch-bls-data.ts --key YOUR_KEY". This is NOT a user-facing prompt — it means the build is incomplete.

### Tasks

1. **Data Loader** (`src/services/dataLoader.ts`)
   - Import static JSON files from `src/data/bls/`
   - Parse and validate on app initialization
   - Expose as typed data structures matching the model's interfaces
   - Show data source and freshness in UI footer (from metadata.json)

2. **Data Transform** (`src/services/dataTransform.ts`)
   - Transform raw BLS OEWS JSON into `OccupationBaseline` format per cluster
   - Estimate role-level breakdown from wage percentiles
   - Aggregate SOC codes to cluster level (sum employment, weighted-average wages)
   - Handle missing data gracefully (some SOC codes may not have all data types)

3. **SOC Code Mapping** (`src/data/socMapping.ts`)
   - Map each ATLAS occupation cluster ID to its BLS SOC codes
   - Used by the data transform to know which SOC data belongs to which cluster
   - Must match the mapping in `scripts/fetch-bls-data.ts`

4. **Model Integration**
   - Feed real BLS baselines into the simulation as initial employment and wage values
   - Replace any hardcoded placeholder values from Phase 1 with real data
   - CPI data feeds into the price level baseline for the macro model

5. **Data Freshness Indicator**
   - Footer or settings area shows: "Data: BLS OEWS [year] · Fetched [date]"
   - Read from `src/data/bls/metadata.json`

6. **Missing Data Handling**
   - If `src/data/bls/` files don't exist: show clear error for developers (not users)
   - If individual cluster data is missing: use 0 with a visual warning on that cluster
   - Never generate fake data as fallback

### Definition of Done
- App loads with real BLS employment and wage data for all 51 clusters
- Wage data populates into the model's baseline calculations
- Charts display real employment baselines
- Data source and freshness are visible in the UI
- No fake/placeholder data anywhere in the app

---

## Phase 4: BFCS Threshold Editor + Occupation Deep Dive

### Objective
Allow granular control over BFCS thresholds and provide per-occupation detail views.

### Tasks

1. **BFCS Threshold Editor** (`src/components/controls/BFCSEditor.tsx`)
   - Select occupation cluster → see all roles
   - Per role: 4 slider controls (B*, F*, C*, S*)
   - Visual indicator showing current AI scores vs thresholds
   - Highlight when thresholds are met (trigger indicator)
   - "Reset to defaults" per cluster

2. **Occupation Cluster Browser** (`src/components/charts/OccupationBrowser.tsx`)
   - Table/grid of all 51 clusters
   - Sortable by: total employment, % displaced at year X, trigger year, wage impact
   - Sparklines for each cluster showing displacement trajectory
   - Click to expand into detailed view

3. **Occupation Detail View**
   - Per-cluster: role breakdown table with displacement timeline
   - Per-cluster: BFCS score trajectory chart (4 lines approaching thresholds)
   - Per-cluster: employment curve (before and after automation)
   - Adjacent employment impact (second-order multiplier)

4. **BFCS Heatmap**
   - Matrix view: occupation clusters × BFCS dimensions
   - Color-coded by how close to threshold
   - Instant visibility into "what's about to be automated"

### Definition of Done
- Every BFCS threshold is adjustable per occupation-role
- Occupation browser shows sortable summary of all clusters
- Detail view provides full per-cluster analysis
- BFCS heatmap gives at-a-glance automation readiness

---

## Phase 5: Policy Simulation

### Objective
Implement the full policy simulation layer with all three income channels.

### Tasks

1. **Policy Control Panel** (`src/components/policy/`)
   - Income channel sliders (target future wage/asset/transfer split)
   - Policy toggle cards (enable/disable individual policies)
   - Parameter inputs for each policy (UBI amount, fund size, etc.)
   - Policy preset buttons (Status Quo, Progressive UBI, Asset Democracy, etc.)

2. **Wage Policies Implementation**
   - Minimum wage control with state overrides
   - Wage subsidy parameters
   - Work week reduction slider

3. **Asset Policies Implementation**
   - Sovereign wealth fund simulator (initial size, contribution, return rate)
   - Universal equity stake (ownership %, profit projections)
   - Required ownership calculator

4. **Transfer Policies Implementation**
   - UBI configurator (amount, phase-out, indexing)
   - Enhanced UI parameters
   - Retraining program effectiveness

5. **Monetary Integration**
   - Money supply impact calculator
   - Net neutral zone indicator
   - Inflation projection under policy mix
   - Fisher equation visualization

6. **Policy Effectiveness Dashboard**
   - Income composition stacked area chart (with vs without policy)
   - "ARPP with policy" vs "ARPP without policy" overlay
   - Required transfer/ownership level calculator
   - Policy window indicator ("implement by 20XX to prevent displacement-demand feedback")
   - Fiscal cost as % of GDP

7. **Compare Mode**
   - Side-by-side comparison of 2-3 policy configurations
   - Diff view: what changes between scenarios

### Definition of Done
- All three policy channels are adjustable
- Policy effects are visible in all charts
- Net neutral zone is computed and displayed
- Policy presets work
- Required ownership/transfer calculations are correct

---

## Phase 6: State-Level Analysis

### Objective
Add state-level granularity using BLS state data and state policy overrides.

### Tasks

1. **State Data Fetch**
   - Fetch state-level OEWS data from BLS
   - Fetch LAUS unemployment data by state
   - Map state industry compositions

2. **State Heat Map** (`src/components/charts/StateMap.tsx`)
   - Interactive US map (D3 or react-simple-maps)
   - Color-coded by: displacement %, unemployment rate, policy effectiveness
   - Click state for detail view
   - Time scrubber changes map colors

3. **State Policy Overrides**
   - Select state → override federal parameters
   - State-specific minimum wage
   - State-specific transfer levels
   - State regulatory environment for AV/robotics (affects lag)

4. **State Comparison View**
   - Compare 2-3 states side by side
   - Same automation timeline, different impacts due to industry mix

### Definition of Done
- Interactive US map shows state-level automation impact
- States are color-coded and clickable
- State policy overrides affect state-level outcomes
- State comparison works

---

## Phase 7: New Job Creation Model + Advanced Features

### Objective
Implement the automation coverage vs. new job creation model, and polish.

### Tasks

1. **New Jobs Model** (`src/models/newJobs.ts`)
   - Automation coverage A(t) computation
   - New job creation rate J_new(t)
   - Survivability function
   - Net job creation visualization
   - "How large would J_new need to be" stress test

2. **Presentation Mode**
   - Full-screen chart view
   - Step-through narrative with annotations
   - Export charts to PNG/SVG
   - Print-friendly light mode

3. **Scenario Save/Load**
   - Save current configuration as named scenario
   - Load saved scenarios
   - Export scenario as JSON
   - Share scenario via URL parameters

4. **Onboarding / Tutorial**
   - First-time walkthrough of key controls
   - Tooltip explanations on hover for complex parameters
   - "What does this mean?" expandable helpers

5. **Performance Optimization**
   - Memoize simulation computation
   - Web Worker for heavy simulation runs
   - Virtualize occupation cluster lists
   - Debounce rapid slider movements (16ms minimum)

### Definition of Done
- New job creation model is implemented and visualized
- Presentation mode is polished and presentation-ready
- Scenarios can be saved, loaded, and shared
- Performance is smooth (no jank on slider movement)

---

## Phase 8: Second-Order Effects + Refinement

### Objective
Add second-order employment effects and final polish.

### Tasks

1. **Employment Multiplier Visualization**
   - When a cluster is displaced, show cascading effects
   - Sankey or flow diagram: trucking → truck stops → gas stations → motels
   - Multiplier effect on total displacement numbers

2. **Revenue Pressure Feedback Visualization**
   - Animated visualization of the feedback loop
   - Show: displacement → wage loss → demand fall → revenue pressure → more displacement
   - Speed of loop increases as it progresses

3. **Historical Comparison**
   - Overlay past automation waves (industrial revolution, computerization)
   - Compare ATLAS projections to BLS's standard employment projections
   - "How different is the AI wave?" visual

4. **Data Export**
   - Export full simulation data as CSV
   - Export charts as images
   - Export policy recommendations as formatted document

5. **Final Polish**
   - Accessibility audit (keyboard navigation, screen readers, contrast)
   - Performance audit
   - Edge case handling
   - Error boundary components
   - Loading and empty state polish

---
---

# Part II — Post-Plan Development

> Everything below shipped *after* the original Phases 1–8 were complete. The model and dashboard were extended and substantially re-derived for analytical rigor. Internal phase numbering was reused across tracks (there is both an original "Phase 5" and a later "Phase 5 overhaul" series, and a model-economics track that reused labels 1/2/3); the groupings below reflect the actual work, in roughly the order it was done.

---

## Phase 4 Formula Quality Pass

### Objective
Seven targeted formula improvements to the displacement and capability pipeline, tightening correctness without changing the architecture.

### What shipped
- Targeted corrections across the BFCS → adoption → displacement chain
- Capability-vector consolidation groundwork (toward the 3-vector model: generative, agentic, embodied)
- Quadratic displacement response and per-cluster override plumbing

---

## Phase 5 Overhaul Series (5c–5i)

### Objective
Re-work the Phase 5 policy layer into a presentation-grade, fully parameterized system, and harden the macro model behind it.

### What shipped
- **5c — Policy Presets**: curated preset library for the policy panel.
- **5d — PPTX Export**: PowerPoint export of charts/scenarios for briefings.
- **5e — Policy Keyframe System**: 9 policy fields changed from scalar `number` to `PolicySchedule` (keyframe arrays with linear interpolation). New types `PolicyKeyframe`/`PolicySchedule`, `src/utils/policyInterpolation.ts`, `PolicyKeyframeEditor.tsx`. All policy reads in the simulation loop go through `interpolatePolicy(schedule, year)` — verified leak-free (a policy starting in 2035 produces identical 2025–2034 output). CSV round-trips schedules.
- **5f — Verification Audit**: systematic correctness audit of the policy/macro pipeline.
- **5g — Dynamic Parameters & Model Improvements**: 13 model improvements + sidebar reorganization. `computeMacro()` refactored to take a single `MacroInputs` object (replacing 21 positional params). Added dynamic population growth, Census-based UBI age demographics, dynamic money velocity, bottom-up corporate profits, `universalEquity` → `sovereignWealthFund` rename (43 references), UBI productivity indexing, min-wage cost-push inflation, credit deflation, sector scarcity inflation, and per-cluster voluntary labor-supply withdrawal. New `validateConfig` utility clamps extreme inputs on CSV import / scenario load.
- **5h — Bug Fixes**: stabilization pass over the 5g changes.
- **5i — Housing & Mortgage Stress**: housing market stabilization — institutional buyers, rental demand, shelter floor, plus a price-level chart.

---

## Model Economics Overhaul (nominal-first rebuild)

> This track reused internal labels "Phase 1/2/3." It re-derived the macro core onto a nominal-first architecture so real values are consistently deflated by an endogenous price level.

### Overhaul Phase 1 — Feedback Loop Overhaul
- Okun's Law replaces the old employment-adjustment factor
- Revenue-pressure loop with decay and a cap (no longer unbounded)
- Rolling 5-year demand window; Phillips-curve wage floor
- 5 new config fields (`okunCoefficient`, `revenuePressureSensitivity/Cap/Decay`, `aiWageProductivityMultiplier`); `FeedbackLoopControls.tsx`

### Overhaul Phase 2 — AI Production Expansion + New Job Integration
- AI produces *more* output than the humans it displaces; surplus splits into Investment (I), Net Exports (NX), and a tracked-but-not-consumed Consumer Goods potential ("the policy argument")
- `durableNewJobs` added to the employment pool and generate wage income
- `AI_PRODUCTIVITY_MULTIPLIER_BY_DEPLOYMENT` (software 5.0, robotics/AV 2.5, hybrid 2.0); `AIProductionControls.tsx`

### Overhaul Phase 3 — Demand-Constrained GDP + Structural Fixes
- Differentiated MPC by income source (wage 0.80, asset 0.35, transfer 0.90), capacity utilization, profit realization
- **3b structural fixes**: obligation-based government-spending decomposition (80% obligation / 20% revenue-sensitive → automatic stabilizer behavior); unrealized-AI-output demand-absorption metric (replaces a tautology — now responds to policy)
- **3c growth-factor removal**: deleted the fictional `cumulativeNominalGrowthFactor`; income now flows from source-specific equations (wages from employment × wage ratio, assets from AI profit boost, transfers COLA-indexed)

---

## Tax & Economic Pipeline (Phase 5-tax)

### Objective
A proper tax-and-transfer pipeline feeding the income decomposition.

### What shipped
- 4-channel income decomposition with post-tax income
- Unified investment treatment
- Median CWI added to policy charts
- Deprecated tax constants removed (no backward-compat — pre-launch product)

---

## Fiscal-Monetary System (Phase 8a–8d)

### Objective
Add a full fiscal-monetary layer — bond market, Federal Reserve, debt dynamics, monetization — with policy that *reacts endogenously* to the economy, plus per-year parameter control and visualization.

### Phase 8a — Endogenous Fiscal Adjustment with Response Profiles
- Root cause addressed: a self-reinforcing debt-monetization spiral drove price level to 6,508× by 2050 with no fiscal-adjustment mechanism
- `FiscalResponseProfile` system (`src/models/fiscalResponseProfiles.ts`): 6 named presets across 5 dimensions (spending/revenue, monetary stance, safety net, reaction timing, adjustment speed)
- `computeFiscalConsolidation()`: debt/GDP → spending and revenue multipliers via linear ramp; COLA dampening; profile-controlled financial-repression cap
- **Key finding — Keynesian Austerity Paradox**: consolidation during a demand crisis is contractionary → worse debt spiral; `no_adjustment` avoids the collapse

### Phase 8b — Per-Year Parameter Storage with Profile-Aware Resolution
- Three-layer resolution: baseline → autopilot (profile-driven) → user override (sticky, per-year)
- 20 tracked parameters per year with full provenance; `YearSnapshot` captures all inter-year state for restart-from-year capability
- Revenue multiplier now actually wired to tax rates (`effectiveTaxRate = baselineRate × revenueMultiplier`)
- New files: `parameterTimeline.ts`, `autopilot.ts`, `parameterResolution.ts`

### Phase 8c — Fiscal Response UI + Per-Year Parameter Editing
- Sidebar restructured into 3 sections (Fiscal Response · Year Parameters · Baseline Configuration)
- 5 discrete-position fiscal dimension sliders; 3-layer parameter provenance shown as colored dots (gray baseline / blue autopilot / orange override)
- Baseline-comparison ghost lines on top charts

### Phase 8d — Parameter Visualization, Scenario Comparison & Polish
- Dedicated Fiscal dashboard tab; parameter trajectory charts; autopilot adjustment log
- Profile-comparison panel; "what changed" override-impact analysis
- 8 pre-built scenario templates; fiscal URL sharing; fiscal onboarding tour

---

## Fiscal-Monetary Stabilization Fixes

> A sequence of calibration fixes that took the fiscal-monetary system from "hyperinflates under most presets" to a stable, defensible bond/yield model.

### Bond Market Fix + Lender of Last Resort (LOLR)
- Fixed double-counted supply pressure in `computeTenYearYield()`; restructured monetization so ZLB no longer blocks financial repression (return MAX of all cases)
- Added yield-responsive monetization (yield-curve control), fiscal-dominance in the expectations channel, and consolidation-credibility risk discount
- **LOLR (Case 6)**: above a 12% yield, the central bank is *structurally forced* to absorb bonds, ramping to 0.95 monetization at 25% — not a policy choice

### Fix 3 — Monetization Taper + Calibration
- Monetization taper (max 0.25/yr change) ends cobweb oscillation; 5-factor bond absorption capacity; endogenous debt maturity (WAM shortens under stress); endogenous monetization transmission by deficit composition

### Fix 4 — Yield Calibration + Split Presets
- Trajectory-based composite fiscal-risk premium; dual-mandate Taylor Rule; removed the no-arbitrage floor (yield-curve inversion is normal)
- Split combined profile into independent **5 fiscal presets** + **4 Fed presets** with `resolveCombinedProfile()`
- Result: 10Y yield at 2026 = 3.99% (was 5.05%), no yield-driven doom loop

### Fix 5 — Wage Growth Baseline + Housing + Credit
- Fixed zero-AI baseline collapse: nominal wage growth (inflation pass-through + productivity + Phillips), 5-channel housing price model (GDP not a direct input), credit baseline that grows at trend
- 999 tests passing, 632-column CSV export + parameter-timeline CSV

---

## Phase 9 — Supply Chain Uncertainty

### Objective
Model how constraints on AI infrastructure (chip shortages, energy costs, datacenter bottlenecks, rare-earth disruptions) reshape the automation timeline through the BFCS framework.

### What shipped (`src/models/supplyChain.ts`)
- **Training channel** → delays AI capability S-curves (monotonic, never recovers)
- **Deployment channel** → raises AI costs and slows speed (modifies BFCS thresholds)
- Resilience, procurement shares, cascade lags, pass-through trajectories, hysteresis (cognitive vs embodied) — all pure, fully testable
- Dedicated controls and audit (`atlas-phase9-supply-chain-audit.md`)

---

## Phase 10.A — Augmentation Rework

### Objective
Make automation share (α) an endogenous, decomposed primitive and model augmentation adoption separately from displacement.

### What shipped
- **Effective α as a primitive** (`src/models/alphaDrivers.ts`): α decomposed from 5 drivers — capability, trust (accumulated reliability since trigger), competitive pressure (peers' prior-year α), margin compression, and labor-market slack (which *reduces* α)
- **Pre-BFCS augmentation adoption** (`src/models/augmentationAdoption.ts`): once AI is "viable as a tool" (better × cheaper crosses a small internal threshold), augmentation follows a logistic S-curve in years-since-trigger
- Scarcity premium and a floored inference-cost curve
- Augmentation multiplier recalibrated (0.20 → 2.0); GDP chart improvements; BFCS presets
