# POLICY_MODEL.md — ATLAS Policy Simulation Specification

> **Note**: This document specifies the policy simulation layer — the income channels users adjust, each policy lever's mechanism, and its implementation pointers. The canonical formulas live in `DATA_MODEL.md`; every variable is indexed in `VARIABLE_REGISTRY.md`. Decision record: [the audit summary](../FABLE_AUDIT_SUMMARY.md).

## Implementation Notes (read first)

The design sections below (1–7) describe each lever conceptually, with flat field types for readability. The implemented configuration uses the shapes stated in these notes (time-varying schedules; post-tax channels). The config types in `src/types/index.ts` are the contract.

### A. Time-Varying Policy Schedules

Nine policy fields are `PolicySchedule` objects with linearly-interpolated `(year, value)` keyframes. Source: `src/types/index.ts:1054–1062`; interpolation in `src/utils/policyInterpolation.ts` (`interpolatePolicy`, `flatToSchedule`, `normalizeSchedule`).

```typescript
interface PolicyKeyframe { year: number; value: number; }
interface PolicySchedule { keyframes: PolicyKeyframe[]; }
```

**Fields converted to schedules** (every read in `simulation.ts` and `policy.ts` uses `interpolatePolicy(schedule, year)`):

| Section | Conceptual field | Implemented type |
|---|---|---|
| 2.1 Minimum Wage | `federalMinimum: number` | `federalMinimum: PolicySchedule` |
| 2.2 Wage Subsidy | `subsidyPercentage: number` | `subsidyPercentage: PolicySchedule` |
| 2.3 Work Week | `standardHours: number` | `standardHours: PolicySchedule` (but see deprecation below) |
| 3.1 SWF | `annualContribution: number` | `annualContribution: PolicySchedule` |
| 3.2 Equity Stakes | `ownershipFraction: number` | `ownershipFraction: PolicySchedule` |
| 3.3 Profit-Sharing | `mandatorySharePercentage: number` | `mandatorySharePercentage: PolicySchedule` |
| 4.1 UBI | `monthlyAmount: number` | `monthlyAmount: PolicySchedule` |
| 4.2 Enhanced UI | `replacementRate: number` | `replacementRate: PolicySchedule` |
| 4.3 Retraining | `stipendMonthly: number` | `stipendMonthly: PolicySchedule` |

The UI uses `PolicyKeyframeEditor.tsx` (sparkline + add/remove keyframe rows) for each. CSV import/export round-trips schedules via `csvQuoteSchedule()` / `parseSchedule()` — flat numeric legacy values are accepted on import.

### B. Four-Channel Post-Tax Decomposition

Income resolves through a **four-channel post-tax decomposition** (the three conceptual channels plus taxes as an explicit negative channel). Source: `src/models/macro.ts:1854–1917` (post-tax decomposition); CWI redefined as post-tax disposable income at `macro.ts:2221`.

The four channels:

1. **Wages** (pre-tax) → minus payroll & income tax
2. **Asset income** (pre-tax) → minus capital gains / dividend tax (split into dividends, capital gains, interest, rental)
3. **Transfers** (pre-tax) → mostly untaxed but tracked separately
4. **Taxes** (negative channel) → withheld at source; feeds government revenue

**Marginal propensities to consume (MPCs) are applied to post-tax income**, not pre-tax:

```
consumption = postTaxWages × 0.95 + postTaxAssets × 0.42 + postTaxTransfers × 0.95
```

(Wage and transfer MPCs are very high because transfers go to lower-income households with no savings buffer; asset MPC is low because dividends/capital gains concentrate with high-savers.) See `src/models/macro.ts` and `FEEDBACK_LOOP_REFERENCE.md` lines 40–80 for the 4-channel consumer credit closure. Dashboard "Required Transfer Level" and "Income Composition" displays use post-tax figures.

### C. Work-Week Reduction (Section 2.3) is DEPRECATED

`WorkWeekPolicy.standardHours` is preserved in the config type but **no computation logic was ever implemented**. Source: `src/models/policy.ts:75–78`. The control is hidden from the UI. Section 2.3 below is structural scaffolding only — do not expect it to affect the simulation.

### D. The Fiscal / Federal-Reserve Profile Split

Section 5 describes monetary integration conceptually; the implemented system splits the response into **two independent components**. Source: `src/models/fiscalResponseProfiles.ts` (entire file); `src/models/fiscalDimensions.ts:33–101`.

- **`FiscalPolicyProfile`** (Congress side — `SimulationConfig.fiscalPolicyProfile`): four dimensions —
  - `spendingResponseToDebt` ∈ [0,1] — how aggressively to cut spending as debt/GDP rises
  - `revenueResponseToDebt` ∈ [0,1] — how aggressively to raise taxes
  - `safetyNetProtection` ∈ [0,1] — drives **COLA dampening** (`computeCOLADampening()` at `macro.ts:40–45` caps transfer-index growth above a threshold when high)
  - `reactionTiming` and `adjustmentSpeed` — ramp shape of consolidation
- **`FederalReserveProfile`** (Fed side — `SimulationConfig.federalReserveProfile`): drives the dual-mandate Taylor Rule (`computeTaylorRule()` at `federalReserve.ts`), absorption capacity, and `maxFinancialRepressionRate` cap on Case-2 monetization (`monetization.ts`, replacing the hardcoded `1.0` ceiling).

`resolveCombinedProfile()` merges the two into the legacy `FiscalResponseProfile` interface that the rest of the simulation reads.

**A noted regime mechanism**: aggressive `spendingResponseToDebt` can produce consolidation that contracts GDP faster than it reduces debt — the austerity-trap configuration, in which debt/GDP worsens rather than improves. Whether a given preset lands in the trap depends on the scenario; compare presets directly in the dashboard.

### E. State-Level Policy Overrides — Implementation Detail

Section 6 defines the interface but omits how overrides are applied. Source: `src/models/stateSimulation.ts:71–75` (`applyStatePolicyModifiers`); `src/data/stateData.ts` (`REGULATORY_LAG_MODIFIERS` map).

`StatePolicyOverride` is keyed in `config.stateOverrides: Record<StateCode, Partial<StatePolicyOverride>>` and applied to per-state cluster computation:

- `minimumWage` — overrides federal min-wage floor for state-level effective-wage calculation only.
- `additionalUBI` — added on top of federal UBI per resident.
- `uiReplacementRate` — replaces federal UI rate for state-resident displaced workers.
- `avRegulatoryEnvironment` and `roboticsRegulatoryEnvironment` — map to lag modifiers via `REGULATORY_LAG_MODIFIERS` (`permissive=0`, `moderate=1`, `restrictive=3` years). Both unset defaults to `'moderate'` — must set both to get a full permissive lag of 0.

State outputs are passed into `runSimulation()` via the optional `stateDataMap?` parameter and emitted as `SimulationYearOutput.states` (undefined if no state data loaded).

---

## Overview

The policy simulation layer sits on top of the displacement and macro models. It allows the user to adjust three income channels — Wages, Assets, Transfers — and see how different policy configurations prevent or delay the self-reinforcing displacement cycle.

The goal: **find the minimum policy intervention that maintains CWI above the tipping point threshold for any given automation timeline.**

---

## 1. Income Channel Model

### Current Baseline (2024)
Average American household income composition:
- **Wages & Salaries**: ~60% of total income
- **Asset Income** (dividends, interest, capital gains, rental): ~20%
- **Government Transfers** (Social Security, unemployment, SNAP, Medicaid, etc.): ~20%

Source: BEA Personal Income tables, CBO Distribution of Household Income reports.

```typescript
interface IncomeComposition {
  year: number;
  wageShare: number;      // default: 0.60
  assetShare: number;     // default: 0.20
  transferShare: number;  // default: 0.20
  totalPerCapita: number; // in real dollars
}
```

### Under Automation
As displacement progresses:
```
wageShare(t) = baselineWageShare × (E(t)/E_baseline) × (W_avg(t)/W_baseline)
```

The wage channel collapses proportional to employment × wage reductions.

**The fundamental question**: Can asset + transfer channels grow fast enough to compensate?

---

## 2. Wage Channel Policies

### 2.1 Minimum Wage / Living Wage
```typescript
interface MinimumWagePolicy {
  enabled: boolean;
  federalMinimum: number;        // dollars per hour
  stateOverrides: Map<StateCode, number>;
  indexedToInflation: boolean;    // auto-adjust with CPI
  indexedToProductivity: boolean; // auto-adjust with AI productivity gains
}
```

**What it does, plainly.** A statutory minimum wage enters the model through three channels: it puts a floor under how far aggregate wages can fall in a downturn, it makes automation more attractive in occupations whose market wage sits below the statutory floor, and — when the floor actually binds — it pushes production costs into prices.

Effect on model (three channels, all at the aggregate/cluster level rather than per role):

1. **Wage floor.** The Phillips-curve wage-pressure factor cannot fall below `annualMinimumWage / baselineAverageWage`, so the economy-wide wage level is floored at the statutory wage's share of the baseline average. When inflation indexing is on, the statutory wage rides a price-only cost-of-living index: it compounds the prior year's composite inflation (floored at zero — indexed minimums are not cut in deflations, the prevailing state-statute practice), with the fiscal-response profile's cost-of-living dampening applied — the same dampening the budget applies to its own obligations. A wage-linked index is deliberately not used: feeding wage growth back into a wage floor is self-referential.
2. **Automation acceleration.** For any occupation cluster whose average wage is below the statutory annual minimum, adoption pressure gains a bonus proportional to the shortfall (`wageAutomationSensitivity × (annualMinWage − clusterWage) / clusterWage`) — raising the wage of low-wage work makes automating it more attractive.
3. **Cost push.** Where the floor binds, the wage overshoot (weighted by the affected employment share and a pass-through rate) enters price inflation.

A per-role wage override (`max(marketWage, minimumWage)` role by role) is **not** modeled; the floor operates on the aggregate wage level. Implementation: `src/models/simulation.ts` (the floor and the adoption bonus at the top of the year loop) and `src/models/macro.ts` (`computeWagePressure`).

### 2.2 Wage Subsidies
Government pays portion of wages to keep people employed:
```typescript
interface WageSubsidyPolicy {
  enabled: boolean;
  subsidyPercentage: number;   // government covers X% of wage
  targetRoles: RoleLevel[];    // which seniority levels qualify
  maxSubsidyPerWorker: number; // cap per worker
  phaseOutThreshold: number;   // wage level above which subsidy phases out
}
```

**What it does, plainly.** The wage subsidy is an income-channel instrument: the government pays part of every employed worker's wage, and that payment lands in household wage income (raising consumption through the wage-income propensity to spend) while its full cost lands in the government budget (deficit, debt, and yields respond).

Effect on model:
```
wageChannelAddition(t) = min(averageWage(t) × subsidyPercentage(t), maxSubsidyPerWorker) × totalEmployment(t)
```
The addition flows into aggregate wage income and the identical amount is booked as fiscal cost. Implementation: `src/models/policy.ts` (`computeWagePolicyEffect`) → `src/models/macro.ts` (wage income) and the fiscal spending path.

**Not modeled:** an employer-cost channel. The subsidy does not enter any employer's automate-or-hire comparison — it does not change the Cheaper threshold, adoption rates, or displacement directly (displacement responds only through the economy-wide demand feedback). A subsidy designed as an automation brake would need the employer's side of the transaction wired into the adoption economics; that is a documented extension, not current behavior.

### 2.3 Work Week Reduction

> ⚠ **DEPRECATED**: Type and config field exist but no computation logic was ever implemented. UI control is hidden. See Implementation Note C above.

Redistribute available work across more people:
```typescript
interface WorkWeekPolicy {
  enabled: boolean;
  standardHours: number;      // default: 40, adjustable to 32, 30, etc.
  overtimeMultiplier: number; // default: 1.5
}
```

Effect on model:
```
effectiveEmployment(o, t) = totalWorkHours(o, t) / standardHours
```

Shorter work weeks → same total hours distributed across more workers → lower unemployment, lower per-worker wages.

---

## 3. Asset Channel Policies

### 3.1 Sovereign Wealth Fund
Government invests in AI/tech companies, distributes dividends to citizens:
```typescript
interface SovereignWealthFundPolicy {
  enabled: boolean;
  initialFundSize: number;          // in billions
  annualContribution: number;       // government adds per year (in billions)
  annualReturnRate: number;         // default: 0.07 (7% market return)
  distributionRate: number;         // % of fund distributed annually
  distribution: 'universal' | 'means_tested';
}
```

Effect on model:
```
fundSize(t) = fundSize(t-1) × (1 + returnRate) + annualContribution(t) - distribution(t)
dividendPerCapita(t) = (fundSize(t) × distributionRate) / population(t)
assetIncome_addition(t) = dividendPerCapita(t)
```

### 3.2 Universal Equity Stakes / AI Ownership

**What it does, plainly.** The public holds an ownership fraction of the AI sector through the sovereign wealth fund, and households receive that fraction of the AI sector's profits as asset income. The payout base is the model's own AI-sector profits — realized earnings the simulation computed, not an authored projection — lagged one year, because this year's distributions come from last year's realized earnings.

Effect on model:
```
equityStakeIncome(t) = ownershipFraction(t) × aiCorporateProfits(t−1)
```
`aiCorporateProfits` is the endogenous AI-sector profit series (realized revenue net of labor, non-labor costs, and energy operating costs — see DATA_MODEL.md). The stake requires the fund to exist (it activates at the fund's creation year). An earlier design that priced payouts off a user-projected profit path (`totalAICompanyProfits × (1 + profitGrowthRate)^t`) is retired: it paid dividends on profits the model never recorded. Implementation: `src/models/policy.ts` (`computeAssetPolicyEffect`).

**Key user question the model answers**: "How much of the AI economy does the average person need to own to maintain current living standards?"

```
requiredOwnership(t) = (targetIncome − wageIncome(t) − transferIncome(t)) / (totalAIProfits(t) / population(t))
```

### 3.3 Profit-Sharing Mandates

**What it does, plainly.** A mandated share of AI-sector profits is distributed to households. Arithmetically this is the same instrument as the equity stake — `mandatorySharePercentage × aiCorporateProfits(t−1)` on the same lagged endogenous base — differing only in framing (a legal mandate rather than fund-held ownership). Enabling both at equal rates doubles the same flow.

```typescript
interface ProfitSharingPolicy {
  enabled: boolean;
  mandatorySharePercentage: PolicySchedule;  // share of AI-sector profits distributed
}
```
Implementation: `src/models/policy.ts` (`computeAssetPolicyEffect`).

---

## 4. Transfer Channel Policies

### 4.1 Universal Basic Income (UBI)
```typescript
interface UBIPolicy {
  enabled: boolean;
  monthlyAmount: number;       // dollars per person per month
  ageThreshold: number;        // minimum age (default: 18)
  phaseOut: {
    enabled: boolean;
    incomeThreshold: number;   // income above which UBI phases out
    phaseOutRate: number;      // dollars reduction per dollar earned
  };
  indexedToInflation: boolean;
  indexedToProductivity: boolean;  // grows with AI-driven GDP
}
```

Effect on model:
```
transferIncome_UBI(t) = monthlyAmount(t) × 12
// If phased out:
transferIncome_UBI(t) = max(0, monthlyAmount×12 - phaseOutRate × max(0, otherIncome - threshold))
```

**The indexed mode.** In `mode: 'indexed'`, the monthly amount scales with the
growth of realized AI revenue measured in real terms (the sector's actual
sold output, deflated by the price level) from the index start year, raised to
the productivity-index exponent and never below the base amount. The real,
realized basis is deliberate: a nominal basis would ride inflation back into
the transfer, and an accrual basis would index to output that was never sold.

**Inflation indexing.** When `indexedToInflation` is on (the shipped card's
default), the monthly amount rides a price-only cost-of-living index: it
compounds the prior year's composite inflation (floored at zero — the benefit
is never cut nominally in a deflation, the cost-of-living-adjustment practice),
with the fiscal-response profile's cost-of-living dampening applied — the same
machinery the budget applies to its own obligations. A wage-or-price
benefit-adequacy index (the larger of wage growth and inflation) is a possible
future mode, not currently offered. One honest consequence the model reports
rather than hides: a large, fully-indexed, debt-financed transfer composed with
heavy monetization and no fiscal response can spiral — in extreme
configurations the model declares monetary collapse (see DATA_MODEL.md, the
cycle phases) and says so on the interface. Implementation:
`src/models/policy.ts` (`computeTransferPolicyEffect`) with the indexation
factor threaded from the simulation loop.

### 4.2 Enhanced Unemployment Insurance

Enhanced unemployment insurance (UI) raises the generosity of jobless benefits above
current law: a larger fraction of the lost wage, paid for more weeks. Current-law
unemployment insurance is already part of the model's baseline transfer support, so this
lever pays (and costs) only the increment above the current-law statutory benefit — at the
current-law settings it adds exactly zero. Benefits are also finite: a jobless person
draws down a fixed entitlement of weeks, so people jobless longer than their entitlement
receive no ongoing enhanced-UI income.

```typescript
interface EnhancedUIPolicy {
  enabled: boolean;
  replacementRate: number;     // % of previous wage (default: 0.45, max 1.0)
  durationWeeks: number;       // how long benefits last (default: 26)
  retrainingBonus: number;     // additional payment during retraining
  stateOverrides: Map<StateCode, Partial<EnhancedUIPolicy>>;
}
```

Effect on model (entitlement weeks):
```
payableWeeks(durationWeeks, d) = min(52, max(0, durationWeeks − 52 × d))

perPersonIncrement = max(0, (w / 52) × replacementRate × E
                          − (w / 52) × 0.45 × CL)
```

where `d` is a duration cohort's years since displacement; `w` is the annual wage the
benefit replaces (dollars); `E` and `CL` are the expected payable weeks under the program
and under current law respectively; and 0.45 / 26 weeks are the current-law statutory
parameters (`CURRENT_LAW_UI_REPLACEMENT_RATE`, `CURRENT_LAW_UI_DURATION_WEEKS` in
`src/models/constants.ts`; source: Department of Labor — average replacement ≈45% of
prior wage, standard state duration 26 weeks; not user-adjustable).

Each duration cohort of the displaced-worker pool has consumed 52 weeks of entitlement per
jobless year, so a 26-week program pays only the newly displaced (cohort 0), while a
78-week program pays 52 weeks in the first jobless year, then 26, then nothing.
Long-duration jobless therefore carry no ongoing enhanced-UI income, and total transfer
cost in deep-displacement scenarios is correspondingly lower than a naive
benefit-per-unemployed-person reading would suggest. New cohorts enter with the program's
`durationWeeks` as their entitlement (the current-law 26 weeks when the program is off).

Pricing: for the AI-displaced pool, `E` and `CL` are averaged over the pool's duration
mix, and `w` is the pool's employment-weighted wage at displacement; the remaining
(frictional, short-spell) unemployed are treated as cohort 0 at the economy-average wage.
When no displacement exists the pool is empty and pricing reduces to the economy average.
The `retrainingBonus` is paid per unemployed person and is always incremental — it has no
current-law counterpart to net against.

Implementation: `computeTransferPolicyEffect` in `src/models/policy.ts`; the duration
shares come from `poolDurationShares` in `src/models/uiIncidence.ts`, advanced each year
by the simulation loop (`src/models/simulation.ts`).

### 4.3 Retraining Programs
```typescript
interface RetrainingPolicy {
  enabled: boolean;
  stipendMonthly: number;     // income during retraining
  durationMonths: number;     // retraining program length
  effectivenessRate: number;  // % of retrained workers who find new employment
  targetClusters: OccupationClusterId[];  // which displaced clusters get retraining
}
```

**What it does, plainly.** Retraining is modeled as income support during retraining: displaced workers who participate receive a monthly stipend, and that stipend flows into household transfer income (and into the government budget as cost).

Effect on model:
```
stipendIncome(t) = stipendMonthly(t) × min(12, durationMonths) × displacedWorkers(t) × participationRate
```
Implementation: `src/models/policy.ts` (`computeTransferPolicyEffect`).

**Not modeled:** a re-employment channel. Retraining does not return anyone to employment, does not target particular occupation clusters, and does not interact with the physical-capital gating of embodied occupations — displaced workers' re-employment runs entirely through the model's separate rehiring machinery (the displaced-worker pool with duration-dependent employability), which retraining does not currently modify. The `effectivenessRate` and `targetClusters` fields exist in the configuration type for structural compatibility but have no effect; their interface controls are hidden. A genuine retraining-to-re-employment mechanism (with effectiveness declining as automation coverage rises, since there are fewer occupations to retrain into) is a documented extension, not current behavior.

---

## 5. Monetary Policy Integration

> The implemented fiscal and monetary response is the two-profile system in Implementation Note D; this section's integration narrative is the conceptual frame those profiles parameterize.

### 5.1 Transfer Funding and Inflation

All transfers must be funded. Two sources:
1. **Taxation**: Revenue-neutral transfers (redistribute from AI company profits)
2. **Money creation**: Increase M (money supply) — potentially inflationary

The model uses the Fisher equation to determine inflationary impact:
```
inflation_from_transfers(t) = (ΔM_transfers(t) × V(t)) / Y(t) - ai_deflation_rate(t)
```

If AI deflation > transfer inflation → net deflation (good, can increase transfers)
If AI deflation < transfer inflation → net inflation (bad, must reduce transfers or increase taxes)

### 5.2 The Net Neutral Zone

The maximum transfer level that produces zero net inflation:
```
max_neutral_transfers(t) = (ai_deflation_rate(t) × Y(t)) / V(t)
```

The UI should prominently display: "Current transfer policy is within / exceeds the net neutral zone."

### 5.3 Tax Revenue from AI Companies

If funding transfers via taxation:
```
taxRevenue(t) = effectiveTaxRate × totalAICompanyProfits(t)
maxTransfersFromTax(t) = taxRevenue(t) / population(t)
```

**Note**: The monetary policy implementation has evolved significantly beyond this initial specification. The current model includes a full Taylor Rule, bond market (10Y yield with term premium, fiscal risk premium, and inflation expectations), equity market valuation, Fed balance sheet operations, debt monetization, and financial repression mechanics. See `docs/Methodology/DATA_MODEL.md` sections 7.1--7.7 for the complete specification.

---

## 6. State-Level Policy Variation

### 6.1 State Parameters

Each state can override federal parameters:
```typescript
interface StatePolicyOverride {
  stateCode: StateCode;
  minimumWage?: number;
  additionalUBI?: number;        // state UBI on top of federal
  uiReplacementRate?: number;    // state UI generosity
  avRegulatoryEnvironment?: 'permissive' | 'moderate' | 'restrictive';
  roboticsRegulatoryEnvironment?: 'permissive' | 'moderate' | 'restrictive';
}
```

### 6.2 State Impact Variation

States experience different automation impacts based on industry composition:
```
stateDisplacement(s, t) = Σ(displacement(o, t) × stateOccupationShare(s, o))
```

Where `stateOccupationShare(s, o)` comes from BLS state-level OEWS data.

A state with high trucking employment (e.g., Indiana) experiences AV automation harder than a tech-heavy state (e.g., California), but California gets hit harder by software automation.

---

## 7. Policy Effectiveness Dashboard

### Key Metrics to Display

1. **Income Composition Over Time**: Stacked area chart showing wage/asset/transfer shares
2. **CWI With vs Without Policy**: Overlay showing displacement cycle prevention
3. **Required Transfer Level**: "To maintain current CWI, transfers must reach $X/month by 20XX"
4. **Required Asset Ownership**: "Average citizen needs X% AI company ownership to offset wage loss"
5. **Inflation Impact**: Is the policy mix inflationary? Within net neutral zone?
6. **State Heat Map**: Color US map by state-level impact under current policy configuration
7. **Fiscal Cost**: Total annual cost of all active policies, as % of GDP
8. **Policy Window**: "You have until 20XX to implement [policy] before the tipping point"

### Policy Scenario Presets

Provide one-click presets for common policy packages:
- **Status Quo**: No new policies
- **Progressive UBI**: $1,000/month UBI + enhanced UI
- **Asset Democracy**: Sovereign wealth fund + universal equity stakes
- **Nordic Model**: High transfers + wage subsidies + strong retraining
- **Full Package**: All three channels maximized
- **Custom**: User builds their own
