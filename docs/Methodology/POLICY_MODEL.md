# POLICY_MODEL.md — ATLAS Policy Simulation Specification

> **Note**: This document reflects the initial Phase 1 policy framing for conceptual reference, augmented with current-implementation addenda inline. See `DATA_MODEL.md` and `VARIABLE_REGISTRY.md` for the canonical specification.

## Current-Implementation Addenda (Phases 5e → 10.A)

The original interfaces below are conceptually correct but the **actual config types and runtime behavior have evolved**. Read this section first; the original Section 1–7 below uses outdated `number` field types and pre-Phase-5-tax channel arithmetic.

### A. PolicySchedule Keyframes (Phase 5e)

Nine policy fields are no longer flat `number` values — they are `PolicySchedule` objects with linearly-interpolated `(year, value)` keyframes. Source: `src/types/index.ts:1054–1062`; interpolation in `src/utils/policyInterpolation.ts` (`interpolatePolicy`, `flatToSchedule`, `normalizeSchedule`).

```typescript
interface PolicyKeyframe { year: number; value: number; }
interface PolicySchedule { keyframes: PolicyKeyframe[]; }
```

**Fields converted to schedules** (every read in `simulation.ts` and `policy.ts` uses `interpolatePolicy(schedule, year)`):

| Section | Original field | Now |
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

### B. Phase 5-tax — 4-Channel Decomposition & Post-Tax Income

The original "Wages / Assets / Transfers" 3-channel model has been replaced by a **4-channel post-tax decomposition** (Phase 5-tax, commit `8153f15`). Source: `src/models/macro.ts:1854–1917` (post-tax decomposition); CWI redefined as post-tax disposable income at `macro.ts:2221`.

The four channels are now:

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

`WorkWeekPolicy.standardHours` is preserved in the config type but **no computation logic was ever implemented** (Phase 5h Fix 6). Source: `src/models/policy.ts:75–78`. The control is hidden from the UI. Section 2.3 below is structural scaffolding only — do not expect it to affect the simulation.

### D. Fiscal Response Profile Split (Phase 8a → Fix 4)

Section 5's "Monetary Policy Integration" predates the **Phase 8 Fix 4 split** of fiscal/monetary response into two independent components. Source: `src/models/fiscalResponseProfiles.ts` (entire file); `src/models/fiscalDimensions.ts:33–101`.

- **`FiscalPolicyProfile`** (Congress side — `SimulationConfig.fiscalPolicyProfile`): four dimensions —
  - `spendingResponseToDebt` ∈ [0,1] — how aggressively to cut spending as debt/GDP rises
  - `revenueResponseToDebt` ∈ [0,1] — how aggressively to raise taxes
  - `safetyNetProtection` ∈ [0,1] — drives **COLA dampening** (`computeCOLADampening()` at `macro.ts:40–45` caps transfer-index growth above a threshold when high)
  - `reactionTiming` and `adjustmentSpeed` — ramp shape of consolidation
- **`FederalReserveProfile`** (Fed side — `SimulationConfig.federalReserveProfile`): drives the dual-mandate Taylor Rule (`computeTaylorRule()` at `federalReserve.ts`), absorption capacity, and `maxFinancialRepressionRate` cap on Case-2 monetization (`monetization.ts`, replacing the hardcoded `1.0` ceiling).

`resolveCombinedProfile()` merges the two into the legacy `FiscalResponseProfile` interface that the rest of the simulation reads.

**Key behavioral nuance**: aggressive `spendingResponseToDebt` triggers the **Keynesian Austerity Paradox** — consolidation contracts GDP fast enough that debt/GDP worsens, not improves. The `no_adjustment` preset is the only profile that avoids the trap in the default scenario.

### E. State-Level Policy Overrides — Implementation Detail (Phase 6)

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

Effect on model:
```
effectiveWage(o, r, t) = max(marketWage(o, r, t), minimumWage(t))
```

Note: Higher minimum wages may accelerate automation for low-wage roles (makes C* easier to meet).

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

Effect on model:
```
effectiveWageForWorker(o, r, t) = marketWage(o, r, t) + subsidyPerWorker(o, r, t)
costToEmployer(o, r, t) = marketWage(o, r, t) - subsidyPerWorker(o, r, t)
```

This lowers the effective cost to employers, which RAISES the C* threshold (makes automation less attractive) — a deliberate brake on displacement.

### 2.3 Work Week Reduction

> ⚠ **DEPRECATED (Phase 5h Fix 6)**: Type and config field exist but no computation logic was ever implemented. UI control is hidden. See addendum §C above.

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
Every citizen receives equity in AI companies:
```typescript
interface EquityStakePolicy {
  enabled: boolean;
  ownershipFraction: number;       // % of AI company equity held by public
  totalAICompanyProfits: number;   // user-adjustable projection (billions/year)
  profitGrowthRate: number;        // annual profit growth rate
  distributionMethod: 'equal' | 'progressive';
}
```

Effect on model:
```
equityIncomePerCapita(t) = ownershipFraction × totalProfits(t) / population(t)
totalProfits(t) = baseProfits × (1 + profitGrowthRate)^(t - t_start)
```

**Key user question the model answers**: "How much of the AI economy does the average person need to own to maintain current living standards?"

```
requiredOwnership(t) = (targetIncome - wageIncome(t) - transferIncome(t)) / (totalProfits(t) / population(t))
```

### 3.3 Profit-Sharing Mandates
Require companies above a certain size to share profits with workers and communities:
```typescript
interface ProfitSharingPolicy {
  enabled: boolean;
  mandatorySharePercentage: number;  // % of profits distributed
  companyThreshold: number;          // minimum revenue to trigger mandate
  distributionScope: 'employees_only' | 'community' | 'national';
}
```

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

### 4.2 Enhanced Unemployment Insurance
```typescript
interface EnhancedUIPolicy {
  enabled: boolean;
  replacementRate: number;     // % of previous wage (default: 0.45, max 1.0)
  durationWeeks: number;       // how long benefits last (default: 26)
  retrainingBonus: number;     // additional payment during retraining
  stateOverrides: Map<StateCode, Partial<EnhancedUIPolicy>>;
}
```

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

Effect on model:
```
retrained_reemployed(o, t) = displaced(o, t) × retrainingCoverage × effectivenessRate
```

This feeds back into E(t) — some displaced workers return to employment through retraining. But as A(t) increases, `effectivenessRate` should decrease (fewer occupations to retrain INTO).

---

## 5. Monetary Policy Integration

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
