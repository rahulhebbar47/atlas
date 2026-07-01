# CLAUDE.md — ATLAS

ATLAS is a macroeconomic simulation projecting AI's impact on labor, GDP, income composition, and policy through 2050. The economic model is pure TypeScript in `src/models/`; the UI is React + Vite + Zustand. Two design commitments shape every decision: **mathematical accuracy over implementation convenience**, and **every parameter exposed as a user-adjustable control**.

## Commands

```bash
npm run dev          # Vite dev server at http://localhost:3000
npm test             # Vitest suite
npm run type-check   # tsc --noEmit
npm run lint         # ESLint
npm run build        # Production build (tsc && vite build)

npm run fetch-bls    # Refresh BLS data → src/data/bls/
npm run fetch-bea    # Refresh BEA data → src/data/bea/
npm run fetch-fred   # Refresh FRED data → src/data/fred/
```

## Hard Rules

- **Do not delete files or code.** Mark with `// DEPRECATED:` and a one-line reason. Same for unused imports — comment them out, don't strip them.
- **No magic numbers in `src/models/`.** Every constant goes in `src/models/constants.ts` with a comment citing its source (BLS series ID, BEA table number, paper).
- **Do not simplify the math for implementation convenience.** If the spec in `docs/Methodology/DATA_MODEL.md` is complex, implement it as specified. The mathematical rigor is the product.
- **Do not generate or stub BLS data.** Real data lives in `src/data/bls/` as static JSON pre-fetched by `scripts/fetch-bls-data.ts`. Missing files → developer-facing error, never a user-facing API key prompt. There are no runtime BLS API calls.
- **Reactive computation only.** No "Calculate" button. Every parameter change re-runs the simulation through Zustand.
- **No time estimates or day-by-day plans.**
- **The shelter gate metric (amended at L9c, adjacent to a recorded miss):** the structural shelter gate reads the SETTLED-WINDOW average (2035-2050) ∈ [3.0, 4.0]; the transient window (2026-2034) is reported alongside, always, as its own line (the E-9b rule extended to decade-scale transients; the 25-year-letter miss 2.96 stays in the record with its attribution).
- **The liveness-proof requirement (standing, from FS-4b):** any dual-process, dead-code, or wrong-producer finding must include the LIVENESS PROOF — the live call graph showing who writes the field on the simulation path — before it is eligible for ruling (producer existence + consumer reads are not enough; the call path must be proven).
- **The assertion-referent policy (standing, from FS-1b):** Scenario A's test referent is PINNED to the macro remediation baseline permanently — any A movement, at any point, is a finding, never a referent advance. C/D referents advance ONLY with ruled fixes, each advance attributed in the landing report (the snapshot chain).
- **Loop-inventory re-derivation (standing, from the remediation engagement):** whenever a new EDGE is added to the system graph (a new term linking two blocks), the feedback-loop inventory must be RE-DERIVED over the FULL graph — loop analyses scoped to "the new elements only" are not acceptable for ratification (L8 slipped through two such scoped analyses).
- **The report-basis law (standing, from FS-6b):** every terminal-record entry states its basis — instantaneous / CAGR / window-mean — at the entry (the FS-4b "realG 2.23" was a path CAGR mislabeled into a terminal block; the comparison against the 2050 instantaneous manufactured a phantom 0.48pp growth fall).
- **The enforcement-over-reading law (standing, from FS-6f — the fourth cited-dead/uncited-live sighting):** reading verifies what code SAYS; only execution and type-enforcement verify what code DOES. All four sightings of the cited-dead/uncited-live genus (the E-8c constant, the F6 key, the tech_qa routing, the FRED fallback family) were found by enforcement machinery — exhaustiveness tests, liveness proofs, throw-on-failure — and zero by reading. Hardening orders do not require dormancy premises; the conversion-to-loud IS the test.
- **The documentation writing standard (owner directive, standing; code exempt):** documentation is written for a smart reader expert in exactly ONE of {engineering, economics, policy}. Per mechanism, three layers: (a) a plain-English paragraph — what it does and the economic reason it exists, no symbols or code identifiers; (b) the precise specification — every variable defined at point of use, units, ranges, sources, user-adjustability; (c) the implementation pointer (file + function). Timeless present — describe the model as it IS, never the journey; provenance is a link to the audit summary (docs/FABLE_AUDIT_SUMMARY.md), not inline narrative. No internal audit vocabulary in model docs (stage numbers, finding/rider IDs, "as ruled", "bit-zero"). Every acronym expanded at first use per document; one name per concept, matching VARIABLE_REGISTRY. One idea per sentence; no ALL-CAPS emphasis. Every constant states value + source (or honest uncited status) + user-adjustability. THE ACCURACY GUARD: style work is meaning-preserving — never replace precision with approximation; add the plain gloss above the precise statement. Rewrites require the claims-preservation check (extract and diff technical claims before/after; zero added/dropped/weakened); a needed content change found during rewrite is docketed as a finding, never made silently. Scope: model-facing docs (README, DATA_MODEL, USER_PARAMETERS, VARIABLE_REGISTRY, EXECUTION_FLOW, POLICY_MODEL, MethodologyView and user-visible strings, all future model docs). the audit working records (maintained outside the repository) are EXEMPT — they are the authentic working record. Code and code comments exempt.

## Code Conventions

- TypeScript strict mode. No `any`. No `as` assertions without a `// reason:` comment.
- Every function in `src/models/` is pure — no side effects, no state mutation. Tests live alongside source (`bfcs.test.ts` beside `bfcs.ts`).
- For financial precision concerns, use `decimal.js`.
- Every economic constant is named and sourced in `src/models/constants.ts`.
- Every model parameter must be reachable from a slider, input, or editor somewhere in the UI.
- UI: dark mode is primary. Use Framer Motion for transitions, not raw CSS. Charts must be readable without hover (direct labels where possible).
- Match the visual identity established by `public/landing.html` and `docs/Design/DESIGN_PHILOSOPHY.md` — same color system, typography, and tokens.

## Architecture

```
src/
├── models/                 # Pure math — the economic engine
│   ├── simulation.ts             # Master orchestrator (year-by-year loop)
│   ├── constants.ts              # Every named constant, sourced
│   ├── capabilities.ts           # AI capability vector trajectories
│   ├── bfcs.ts                   # Better/Faster/Cheaper/Safer thresholds
│   ├── adoption.ts               # S-curve adoption dynamics
│   ├── displacement.ts           # Task erosion → headcount → wage cascade
│   ├── macro.ts                  # GDP, CWI, feedback loops, cycle phases
│   ├── monetary.ts               # Money supply, Fisher equation
│   ├── fiscal.ts                 # Spending, taxation, debt dynamics
│   ├── policy.ts                 # Wage / asset / transfer policy
│   ├── multipliers.ts            # Second-order employment multipliers
│   ├── newJobs.ts                # New-job creation vs. automation coverage
│   ├── bondMarket.ts             # 10Y yield, term premium
│   ├── equityMarket.ts           # Valuation, wealth effects
│   ├── federalReserve.ts         # Taylor Rule, balance sheet, LOLR
│   ├── monetization.ts           # Debt monetization, financial repression
│   ├── alphaDrivers.ts           # Automation-share decomposition
│   ├── augmentationAdoption.ts   # Augmentation vs. displacement channel
│   ├── supplyChain.ts            # Supply-chain uncertainty
│   ├── stateSimulation.ts        # State-level displacement & policy
│   ├── fiscalResponseProfiles.ts # Fiscal + Fed preset profiles
│   └── parameterResolution.ts    # Per-year parameter interpolation
├── services/               # dataLoader, dataTransform
├── stores/                 # Zustand simulation store
├── components/             # layout / controls / charts / policy / shared
├── data/{bls,bea,fred}/    # Static JSON, pre-fetched
├── types/                  # TypeScript contracts — read first when in doubt
├── hooks/                  # Custom React hooks
├── utils/                  # Formatting, math helpers
└── styles/                 # Global styles, design tokens
```

## Model Concepts

Full specification in `docs/Methodology/DATA_MODEL.md`.

1. **Capability Vectors** — three AI vectors (generative, agentic, embodied), each a [0,1] capability trajectory over time.
2. **BFCS Thresholds** — per cluster × role × dimension. Adoption triggers only when all four current scores meet thresholds *simultaneously*.
3. **Adoption S-Curves** — once triggered, displacement follows an asymmetric S-curve whose steepness depends on deployment type (software=steep, robotics=gradual, vehicles=regulatory-gated).
4. **Displacement Cascade** — task erosion → headcount reduction → wage depression → occupation elimination.
5. **Macro Feedback** — Consumer Welfare Index plus six loops: revenue pressure, Phillips curve, demand spillover, credit crunch, fiscal-monetary, housing wealth.
6. **Cycle Phases** — continuous classification (stable → accelerating decline → recovery), not a binary tipping point.
7. **Policy Levers** — wages / assets / transfers income-channel splits (BEA-derived shares), each independently adjustable.
8. **Fiscal-Monetary System** — Taylor Rule, bond market (10Y yield), equity market, debt dynamics, Fed balance sheet.
9. **Second-Order Multipliers** — BEA input-output employment multipliers per industry.

## Domain Gotchas

- **Teachers are policy-protected**: `productivityToHeadcountRatio = 0.1`. Education and healthcare *administrative* roles are not — they sit at `1.0`. Easy to lump them together; don't.
- **Trucking's second-order multiplier is 3.4×.** When trucking employment falls, adjacent jobs (warehousing, fueling, lodging, restaurants on freight corridors) fall with it. Most models ignore this multiplier; ATLAS does not.
- **Adoption is a feedback system, not a switch.** Revenue pressure → faster automation → more displacement → more revenue pressure. Implement as a dynamic loop, never an `if`.
- **localStorage scope.** BLS API cache and user's API key only. All simulation state lives in Zustand. Do not persist anything else there.

## Testing

- Every `src/models/` function needs a unit test. If the math is wrong, nothing else matters.
- Test edge cases: 0% and 100% automation; all BFCS thresholds met simultaneously; historical sanity checks (the simulation should produce sensible results for past automation waves).
- Snapshot test key visualizations to catch regressions.

## When Working on a File, Read First

| Working on… | Reference |
|---|---|
| Economic model | `docs/Methodology/DATA_MODEL.md` |
| UI / design | `docs/Design/DESIGN_PHILOSOPHY.md` + `public/landing.html` |
| BLS integration | `docs/Data/BLS_API.md` |
| Occupation data | `docs/Methodology/OCCUPATION_CLUSTERS.md` (51 clusters with role/seniority sub-differentiation) |
| Policy simulation | `docs/Methodology/POLICY_MODEL.md` |
| Phase planning | `docs/Phases/PHASES.md` |
| Types & contracts | `src/types/index.ts` |


# CC_WORKFLOW.md — Claude Code Execution Guide

## How to Work on ATLAS

This file contains instructions for Claude Code on how to approach development of ATLAS. Follow these rules strictly.

---

## Before Starting ANY Work

1. Read the relevant docs for your current phase (see `docs/Phases/PHASES.md`)
2. Read `src/types/index.ts` — the types are the contract
3. If working on UI: read `docs/Design/DESIGN_PHILOSOPHY.md`
4. If working on math: read `docs/Methodology/DATA_MODEL.md`
5. If working on BLS: read `docs/Data/BLS_API.md`
6. If working on policy: read `docs/Methodology/POLICY_MODEL.md`

---

## Critical Development Rules

### File Safety
- **NEVER delete files.** Comment out or deprecate.
- **NEVER delete functions.** Mark with `// DEPRECATED:` comment.
- **NEVER remove imports** that might be used elsewhere. Comment out with explanation.
- If you're unsure whether something is used, leave it. Add a `// TODO: verify if still needed` comment.

### Code Quality
- Every function in `src/models/` must be a **pure function** (no side effects, no state mutation)
- Every economic constant must be in `src/models/constants.ts` with a source citation comment
- All numbers that appear in model computations must be **named constants**, never magic numbers
- TypeScript strict mode is ON — no `any`, no type assertions unless absolutely necessary with a comment explaining why

### Model Accuracy
- The mathematical model in `docs/Methodology/DATA_MODEL.md` is the source of truth
- If you find an inconsistency between the docs and the code, **fix the code to match the docs** and note the change
- Every formula in the docs should be traceable to a function in `src/models/`
- When in doubt about a formula, implement it exactly as specified — don't simplify

### Testing
- Write tests for model functions BEFORE or alongside implementation
- Test file location: alongside source files (e.g., `capabilities.test.ts` next to `capabilities.ts`)
- Test known scenarios: "if all capabilities are 0, there should be 0 AI-driven displacement"
- Test edge cases: capabilities at 1.0, all thresholds met simultaneously, etc.

### UI Development
- Follow `docs/Design/DESIGN_PHILOSOPHY.md` strictly
- Dark mode is the PRIMARY theme
- Every slider must update the simulation in real-time (no submit buttons)
- Charts must be readable without hovering — direct labels where possible
- Use Framer Motion for transitions, not CSS transitions

---

## Phase Execution Pattern

For each phase:

1. **Read the phase definition** in `docs/Phases/PHASES.md`
2. **Implement in small, testable increments** — don't try to build an entire phase in one go
3. **Test each model function** before building UI on top of it
4. **Verify the phase's Definition of Done** before moving on
5. **Do not start the next phase** until the current one is fully working

---

## Common Pitfalls to Avoid

1. **Don't generate fake BLS data.** Real data lives in `src/data/bls/` as static JSON, pre-fetched via `scripts/fetch-bls-data.ts`. The app imports these files directly. If the files are missing, show a developer-facing error — NEVER a user-facing API key prompt, NEVER placeholder data. There are NO runtime BLS API calls.

2. **Don't simplify the S-curve adoption model.** It has competitive pressure, revenue pressure, and geopolitical risk modifiers. Implement all of them.

3. **Don't forget the special cases**: Teachers are policy-protected (`productivityToHeadcountRatio = 0.1`). Education/Healthcare admin are displacement targets (`productivityToHeadcountRatio = 1.0`).

4. **Don't make the displacement-demand feedback cycle a simple if-statement.** It's a continuous feedback loop where revenue pressure accelerates automation, which increases displacement, which increases revenue pressure. Model it as a dynamic system.

5. **Don't skip the second-order multiplier.** When trucking employment falls, 3.4x adjacent jobs also fall. This is a massive impact multiplier that most models ignore.

6. **Don't use localStorage for anything except BLS API cache and user's API key.** All model state lives in Zustand.

7. **Don't over-animate.** This is a serious analytical tool. Animations should be functional (smooth transitions between states) not decorative.

---

## Useful Terminal Commands

```bash
# Start dev server
npm run dev

# Run tests
npm test

# Type check without building
npm run type-check

# Build for production
npm run build
```
