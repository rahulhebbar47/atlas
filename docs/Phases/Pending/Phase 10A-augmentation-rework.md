# ATLAS Augmentation Rework — Phase 10.A
## Claude Code Implementation Prompt — Version 2

**Context:** ATLAS is a production-grade labor-market displacement simulator projecting AI impact through 2050. Target user: Senior government officials. Accuracy over everything; everything subjective must be user-adjustable; no arbitrary caps; no hand-authored defaults passed off as ground truth.

**This prompt covers:** structural math rework of displacement, augmentation, BFCS scoring, and wage pressure. AEI data integration is a separate follow-up prompt.

**Workflow for Claude Code:**
1. Read this prompt end-to-end before writing any code
2. Draft a detailed implementation plan (file-by-file, ordered by dependency)
3. Return the plan to the user for review/edit before executing
4. Only after plan approval, execute
5. If you hit an ambiguity or a place where current code violates an assumption in this prompt, STOP and ask — do not silently change scope

---

## Non-Negotiable Rules (from CLAUDE.md)

- **No file deletion.** Comment out with `// DEPRECATED:` + reason. Never remove code outright.
- **No magic numbers.** Every constant goes in `src/models/constants.ts` with a source/rationale comment.
- **Every user-adjustable parameter** reachable from a UI slider.
- **Strict TypeScript.** No `any`.
- **Pure functions in `src/models/`.** No side effects, no mutation.
- **No backward compatibility concerns** — product is pre-launch.
- **No arbitrary caps on user parameters.** Craft equations that produce coherent outputs across the full parameter range; don't clamp to hide unrealistic outputs from unrealistic inputs.
- **Sources cited** for every constant with a non-trivial value.

---

## Mission

1. New `automationShare` (α) primitive on `OccupationCluster` and `RoleDefinition`
2. Rewrite displacement: drop `weightedCapability²`, use `adoption × weightedCapability × α`
3. Pre-BFCS augmentation adoption S-curve triggered by `betterScore × cheaperScore`
4. Rewrite augmentation per-worker boost: `betterScore × cheaperScore × augMultiplier`
5. Rewrite AI-replacement productivity: `1 + weightedCapability × betterScore × replacementMultiplier × (1 + cheaperScore)`; deprecate `AI_PRODUCTIVITY_MULTIPLIER_BY_DEPLOYMENT` and `maxProductivityMultiplier`
6. Five time-varying α drivers (capability, trust, competitive peer signal, margin compression, labor slack)
7. Split role-replacement-difficulty into TWO primitives: `aiReplacementDifficultyFriction` (adoption-delay) and `aiReplacementDifficultyWagePremium` (scarcity premium + adoption ceiling)
8. Remove `qualityMultiplier` from `computeBetterScore` — BFCS threshold alone gates role difficulty
9. Rewrite Phillips Mechanism 2 as AI-displacement-aware scarcity premium using `aiReplacementDifficultyWagePremium`; per-cluster and aggregate; per-cluster wage adjustment feeds back into next year's Cheaper score
10. Replace inference cost exponential with floored decay curve
11. Make competitive pressure threshold user-adjustable
12. Split competitive pressure between adoption channel and α channel based on peer-α signal
13. Hand-author defensible defaults for all new per-role variables; expose all as UI sliders
14. Unit tests for every pure function
15. Update `docs/DATA_MODEL.md`, `VARIABLE_REGISTRY.md`; new `docs/ALPHA_DRIVERS.md`; methodology screen updates

---

## Part 1 — Type Definitions

### File: `src/types/index.ts`

Add to `OccupationCluster`:
```typescript
/** Automation share of AI usage in this cluster [0,1].
 *  1.0 = all adoption → worker replacement. 0.0 = all adoption is augmentation.
 *  0.5 = balanced default for cognitive clusters. Embodied clusters per EMBODIED_CLUSTER_ALPHA_DEFAULTS.
 *  User adjustable at cluster level; per-role overrides via role.automationShareOverride. */
automationShare: number;
```

Add to `RoleDefinition`:
```typescript
/** Per-role α override [0,1]. If undefined, inherits cluster.automationShare. */
automationShareOverride?: number;

/** Pre-adoption regulatory/organizational/cultural friction [0,1].
 *  Reader: adoption delay. effectiveTriggerYear = bfcsTriggerYear + value × maxAdoptionFrictionYears.
 *  Captures forces outside BFCS math: licensure, liability, union resistance, cultural trust.
 *  Default per role in ROLE_AI_REPLACEMENT_DIFFICULTY_FRICTION_DEFAULTS. User-adjustable. */
aiReplacementDifficultyFriction: number;

/** Residual human share at automation tail [0,1].
 *  Two readers:
 *    1. Adoption S-curve tail drag: exponent on standard approach formula, slowing tail.
 *       Larger value → slower approach to 100% without ever ceilinging.
 *    2. Phillips scarcity premium weight.
 *  Captures: how hard is the last 10-20% of automation within this role?
 *  High = last-mile residual humans command premium (surgery, specialist nursing).
 *  Low = once automation starts, tail automates cleanly (trucking, warehouse).
 *  Default per role in ROLE_AI_REPLACEMENT_DIFFICULTY_WAGE_PREMIUM_DEFAULTS. User-adjustable. */
aiReplacementDifficultyWagePremium: number;
```

**IMPORTANT:** `role.aiReplacementDifficulty` previously existed. DEPRECATE it (comment, don't remove). Its two prior usages are now split: the `computeBetterScore` quality-multiplier reader is REMOVED entirely; the Phillips reader moves to `aiReplacementDifficultyWagePremium`.

New type `AlphaDriverParams`:
```typescript
export interface AlphaDriverParams {
  capabilityWeight: number;           // Default 0.20
  trustWeight: number;                // Default 0.15
  competitiveWeight: number;          // Default 0.25
  marginWeight: number;               // Default 0.15
  slackWeight: number;                // Default 0.10
  capabilityActivationThreshold: number; // Default 0.60
  trustHalfLifeYears: number;         // Default 5
}
```

New type `InferenceCostCurveParams`:
```typescript
export interface InferenceCostCurveParams {
  floor: number;         // Asymptotic floor relative to 2025=1.0. Default 0.001
  k: number;             // Initial decay rate. Default 0.50
  decayExponent: number; // Sub-linear time exponent. Default 0.7
}
```

New type `AlphaDecomposition`:
```typescript
export interface AlphaDecomposition {
  baseline: number;
  capabilityContribution: number;
  trustContribution: number;
  competitiveContribution: number;
  marginContribution: number;
  slackContribution: number;
}
```

New type `AugmentationAdoptionResult`:
```typescript
export interface AugmentationAdoptionResult {
  augAdoptionRate: number;  // [0,1]
  triggered: boolean;
  triggerYear: number | null;
}
```

Extend `SimulationConfig`:
```typescript
alphaDriverParams: AlphaDriverParams;
augmentationAdoptionSteepness?: number;        // Default 0.8
inferenceCostCurve?: InferenceCostCurveParams;
scarcityIntensity?: number;                    // Default 0.4
competitivePressureThreshold?: number;         // Default 0.20 (was hardcoded)
replacementMultiplier?: number;                // Default 2.0
maxAdoptionFrictionYears?: number;             // Default 5.0
```

Extend `BFCSScores` output:
```typescript
alpha?: number;
alphaDecomposition?: AlphaDecomposition;
cheaperScore?: number;
effectiveTriggerYearShift?: number;  // applied from friction factor
```

Extend `ClusterDisplacementResult`:
```typescript
scarcityPremiumContribution?: number;
aggregateReplacementDifficultyWagePremium?: number;  // employment-weighted within cluster
wageAdjustmentFromScarcity?: number;                 // feeds back into next year's Cheaper
```

Extend `MacroOutput`:
```typescript
corporateMarginRatio: number;        // corporate_profits / GDP — for α margin driver
aiDisplacementUnemployment: number;  // cumulative unemployment from AI displacement
```

---

## Part 2 — Constants (`src/models/constants.ts`)

**Deprecate:**
- `DEFAULT_INFERENCE_ANNUAL_CHANGE` — replaced by curve
- `AI_PRODUCTIVITY_MULTIPLIER_BY_DEPLOYMENT` — replaced by first-principles productivity formula
- `AI_WAGE_PRODUCTIVITY_MULTIPLIER` — replaced by `DEFAULT_SCARCITY_INTENSITY`

**Add:**

```typescript
/** Default α for cognitive clusters. User adjustable. */
export const DEFAULT_COGNITIVE_ALPHA = 0.5;

/** Per-embodied-cluster α defaults.
 *  Rationale: embodied work tends toward binary outcomes (robot does it OR human does it).
 *  Factors: binary-task outcome (+), 24/7 economics (+), dexterity requirement (−),
 *           regulatory human-in-loop (−). */
export const EMBODIED_CLUSTER_ALPHA_DEFAULTS: Record<string, number> = {
  transport_trucking: 0.85,
  transport_delivery: 0.60,
  transport_taxi: 0.55,
  transport_warehouse: 0.80,
  mfg_assembly: 0.80,
  mfg_machinists: 0.55,
  mfg_qc: 0.70,
  construction_electricians: 0.30,
  construction_plumbers: 0.30,
  construction_general: 0.45,
  construction_hvac: 0.35,
  food_fast_food: 0.65,
  food_restaurant: 0.35,
  food_industrial: 0.85,
  health_physicians: 0.20,
  health_nurses: 0.25,
  health_technicians: 0.50,
  health_home_health: 0.20,
  retail_cashiers: 0.75,
  ag_farm_labor: 0.80,
};

/** Default α driver parameters. */
export const DEFAULT_ALPHA_DRIVER_PARAMS: AlphaDriverParams = {
  capabilityWeight: 0.20,
  trustWeight: 0.15,
  competitiveWeight: 0.25,
  marginWeight: 0.15,
  slackWeight: 0.10,
  capabilityActivationThreshold: 0.60,
  trustHalfLifeYears: 5,
};

/** Default inference cost curve.
 *  Shape: floor + (1 - floor) × exp(-k × t^decayExponent)
 *  t=1 → 0.61, t=5 → 0.18, t=10 → 0.053, t=25 → 0.006 (~167× reduction over 25 years)
 *  Prior constant-rate exponential compounded to 77,000× by 2050 — implausible. */
export const DEFAULT_INFERENCE_COST_CURVE: InferenceCostCurveParams = {
  floor: 0.001,
  k: 0.50,
  decayExponent: 0.7,
};

export const DEFAULT_AUGMENTATION_ADOPTION_STEEPNESS = 0.8;
export const DEFAULT_SCARCITY_INTENSITY = 0.4;
/** Source: FRED corporate profits after tax / GDP, typical recent range 0.10-0.14. */
export const ALPHA_BASELINE_CORPORATE_MARGIN = 0.12;
export const DEFAULT_COMPETITIVE_PRESSURE_THRESHOLD = 0.20;

/** AI replacement productivity multiplier (solo, not augmented).
 *  Default 2.0 — users raise for more optimistic AI-worker scenarios. */
export const DEFAULT_REPLACEMENT_MULTIPLIER = 2.0;

/** Max years of friction delay at aiReplacementDifficultyFriction = 1.0.
 *  Source: FDA clearance / NHTSA rulemaking / state licensure cycles historically 3-7 years. */
export const DEFAULT_MAX_ADOPTION_FRICTION_YEARS = 5.0;

/** Per-role defaults for aiReplacementDifficultyFriction.
 *  Captures pre-adoption friction: regulation, licensure, liability, cultural trust.
 *  Higher = more friction before replacement-mode adoption begins.
 *  ATLAS-authored defaults; users override per role. */
export const ROLE_AI_REPLACEMENT_DIFFICULTY_FRICTION_DEFAULTS: Record<string, Record<string, number>> = {
  // Technology — low regulatory friction
  tech_swe: { junior_mid: 0.10, senior: 0.15, staff_principal: 0.25 },
  tech_data_ml: { junior_analyst: 0.10, ml_engineer: 0.15, research_scientist: 0.25 },
  tech_it_support: { tier1_support: 0.10, sysadmin: 0.20, devops_sre: 0.25 },
  tech_qa: { manual_qa: 0.05, automation_qa: 0.10 },
  // Finance — licensing, fiduciary duty
  finance_trading: { execution_trader: 0.20, quant_analyst: 0.25, portfolio_manager: 0.50 },
  finance_banking: { teller: 0.15, junior_analyst: 0.20, senior_banker: 0.45 },
  finance_accounting: { bookkeeper: 0.15, accountant: 0.30, cpa_audit: 0.60 },
  finance_insurance: { claims_processor: 0.20, underwriter: 0.40 },
  // Healthcare — heaviest regulatory friction
  health_physicians: { primary_care: 0.75, specialist: 0.80, surgeon: 0.90 },
  health_nurses: { lpn: 0.60, rn: 0.70, nurse_practitioner: 0.80 },
  health_technicians: { lab_technician: 0.40, imaging_technician: 0.45 },
  health_home_health: { home_health_aide: 0.65, personal_care_aide: 0.70 },
  health_admin: { medical_coder: 0.30, admin_staff: 0.20, hospital_admin: 0.45 },
  // Education — licensure and institutional inertia
  edu_teachers: { k12_teacher: 0.70, professor: 0.55 },
  edu_admin: { default: 0.40 },  // use cluster roles
  edu_support: { default: 0.30 },
  // Legal
  legal_lawyers: { associate: 0.50, partner: 0.75 },
  legal_paralegal: { legal_secretary: 0.15, paralegal: 0.30 },
  // Transportation
  transport_trucking: { long_haul: 0.35, short_haul: 0.40 },
  transport_delivery: { delivery_driver: 0.30, courier: 0.25 },
  transport_taxi: { driver: 0.40 },
  transport_warehouse: { warehouse_worker: 0.10, equipment_operator: 0.25, logistics_coordinator: 0.20 },
  // Manufacturing
  mfg_assembly: { line_worker: 0.10, skilled_assembler: 0.20 },
  mfg_machinists: { cnc_operator: 0.20, master_machinist: 0.40 },
  mfg_qc: { inspector: 0.20 },
  // Construction — state licensure, code inspection
  construction_electricians: { apprentice: 0.35, journeyman: 0.50, master: 0.65 },
  construction_plumbers: { apprentice: 0.35, journeyman: 0.50 },
  construction_general: { laborer: 0.15, carpenter: 0.35, heavy_equipment: 0.30 },
  construction_hvac: { technician: 0.40, senior_technician: 0.55 },
  // Retail
  retail_cashiers: { cashier: 0.10, sales_associate: 0.15 },
  retail_management: { store_manager: 0.35, district_manager: 0.40 },
  retail_ecommerce: { fulfillment_worker: 0.10, ecommerce_coordinator: 0.15 },
  // Food Service
  food_fast_food: { counter: 0.15, line_cook: 0.20 },
  food_restaurant: { server: 0.40, chef: 0.35, head_chef: 0.45 },
  food_industrial: { food_processing: 0.20 },
  // Creative
  creative_design: { junior_designer: 0.15, senior_designer: 0.25, art_director: 0.35 },
  creative_writing: { content_writer: 0.15, journalist: 0.40 },
  // Professional Services
  prof_consultants: { junior: 0.25, senior_consultant: 0.45, partner: 0.55 },
  prof_real_estate: { agent: 0.40, broker: 0.50 },
  prof_marketing: { coordinator: 0.15, manager: 0.25, director: 0.35 },
  // Government — civil service protections
  gov_federal: { default: 0.65 },
  gov_state_local: { default: 0.60 },
  // Agriculture
  ag_farm_labor: { default: 0.20 },
  // Science
  sci_lab_research: { default: 0.30 },
  // Other
  other_uncategorized: { default: 0.25 },
};

/** Per-role defaults for aiReplacementDifficultyWagePremium.
 *  Captures last-mile automation resistance: residual humanness required at automation tail.
 *  Higher = more remaining workers at full automation, higher scarcity premium.
 *  Factors: care element (+), relational trust (+), unstructured judgment (+),
 *           binary physical outcome (−), functional output regardless of source (−). */
export const ROLE_AI_REPLACEMENT_DIFFICULTY_WAGE_PREMIUM_DEFAULTS: Record<string, Record<string, number>> = {
  tech_swe: { junior_mid: 0.20, senior: 0.45, staff_principal: 0.60 },
  tech_data_ml: { junior_analyst: 0.20, ml_engineer: 0.40, research_scientist: 0.60 },
  tech_it_support: { tier1_support: 0.20, sysadmin: 0.35, devops_sre: 0.45 },
  tech_qa: { manual_qa: 0.15, automation_qa: 0.25 },
  finance_trading: { execution_trader: 0.25, quant_analyst: 0.45, portfolio_manager: 0.65 },
  finance_banking: { teller: 0.20, junior_analyst: 0.35, senior_banker: 0.60 },
  finance_accounting: { bookkeeper: 0.20, accountant: 0.40, cpa_audit: 0.55 },
  finance_insurance: { claims_processor: 0.25, underwriter: 0.45 },
  // Healthcare — highest residual humanness
  health_physicians: { primary_care: 0.80, specialist: 0.85, surgeon: 0.90 },
  health_nurses: { lpn: 0.65, rn: 0.75, nurse_practitioner: 0.80 },
  health_technicians: { lab_technician: 0.35, imaging_technician: 0.40 },
  health_home_health: { home_health_aide: 0.80, personal_care_aide: 0.80 },
  health_admin: { medical_coder: 0.25, admin_staff: 0.20, hospital_admin: 0.50 },
  edu_teachers: { k12_teacher: 0.75, professor: 0.60 },
  edu_admin: { default: 0.40 },
  edu_support: { default: 0.30 },
  legal_lawyers: { associate: 0.55, partner: 0.75 },
  legal_paralegal: { legal_secretary: 0.25, paralegal: 0.40 },
  // Transportation — low residual (binary outcomes)
  transport_trucking: { long_haul: 0.15, short_haul: 0.20 },
  transport_delivery: { delivery_driver: 0.20, courier: 0.15 },
  transport_taxi: { driver: 0.25 },
  transport_warehouse: { warehouse_worker: 0.15, equipment_operator: 0.30, logistics_coordinator: 0.30 },
  mfg_assembly: { line_worker: 0.15, skilled_assembler: 0.25 },
  mfg_machinists: { cnc_operator: 0.20, master_machinist: 0.55 },
  mfg_qc: { inspector: 0.25 },
  // Construction — unstructured environments create residual
  construction_electricians: { apprentice: 0.30, journeyman: 0.45, master: 0.60 },
  construction_plumbers: { apprentice: 0.30, journeyman: 0.50 },
  construction_general: { laborer: 0.20, carpenter: 0.45, heavy_equipment: 0.30 },
  construction_hvac: { technician: 0.40, senior_technician: 0.55 },
  retail_cashiers: { cashier: 0.10, sales_associate: 0.20 },
  retail_management: { store_manager: 0.40, district_manager: 0.50 },
  retail_ecommerce: { fulfillment_worker: 0.10, ecommerce_coordinator: 0.20 },
  food_fast_food: { counter: 0.20, line_cook: 0.25 },
  food_restaurant: { server: 0.55, chef: 0.50, head_chef: 0.65 },
  food_industrial: { food_processing: 0.15 },
  creative_design: { junior_designer: 0.25, senior_designer: 0.50, art_director: 0.65 },
  creative_writing: { content_writer: 0.25, journalist: 0.65 },
  prof_consultants: { junior: 0.30, senior_consultant: 0.55, partner: 0.70 },
  prof_real_estate: { agent: 0.45, broker: 0.55 },
  prof_marketing: { coordinator: 0.20, manager: 0.35, director: 0.50 },
  gov_federal: { default: 0.55 },
  gov_state_local: { default: 0.50 },
  ag_farm_labor: { default: 0.20 },
  sci_lab_research: { default: 0.55 },
  other_uncategorized: { default: 0.30 },
};
```

**In `occupationClusters.ts`:** add a post-construction initialization step that sets:
- `cluster.automationShare` from `EMBODIED_CLUSTER_ALPHA_DEFAULTS[cluster.id] ?? DEFAULT_COGNITIVE_ALPHA`
- `role.aiReplacementDifficultyFriction` from `ROLE_AI_REPLACEMENT_DIFFICULTY_FRICTION_DEFAULTS[cluster.id]?.[role.id] ?? 0.25`
- `role.aiReplacementDifficultyWagePremium` from `ROLE_AI_REPLACEMENT_DIFFICULTY_WAGE_PREMIUM_DEFAULTS[cluster.id]?.[role.id] ?? 0.30`

Fallbacks used when no specific role match; log warnings if a cluster is missing its role-level defaults (shouldn't happen for the explicit tables above).

---

## Part 3 — Inference Cost Curve

### File: `src/models/bfcs.ts`

Add:
```typescript
/** Compute inference cost as fraction of 2025 baseline at year offset t.
 *  Shape: floor + (1 - floor) × exp(-k × t^decayExponent) */
export function computeInferenceCostFactor(
  t: number,
  params: InferenceCostCurveParams = DEFAULT_INFERENCE_COST_CURVE,
): number {
  if (t <= 0) return 1.0;
  const decay = Math.exp(-params.k * Math.pow(t, params.decayExponent));
  return params.floor + (1 - params.floor) * decay;
}
```

Modify `computeCheaperScore`:
- Replace `Math.exp(inferenceChange * t)` with `computeInferenceCostFactor(t, costParams?.inferenceCostCurve)`
- Manufacturing and energy components: keep existing exponential decay (out of scope)
- Add new parameter `wageAdjustment: number = 0` — multiplies `humanCostFactor` by `(1 + wageAdjustment)`
- Ensure `cheaperScore` is returned in `BFCSScores.cheaper` (should already be) and made available to downstream callers

Update `AICostParams` type to include optional `inferenceCostCurve: InferenceCostCurveParams`.

---

## Part 4 — BFCS Better Score Cleanup

### File: `src/models/bfcs.ts`

Modify `computeBetterScore`:
- Remove `qualityMultiplier` calculation and its application
- Better score becomes clean weighted sum of capability scores, normalized by total weight
- Add comment documenting removal: role difficulty is now gated via `aiReplacementDifficultyFriction` (adoption delay), not score multiplier

Effect: senior/specialist roles will have higher computed Better scores than before; their B* thresholds continue to gate them appropriately. Net trigger timing will shift and this is intentional.

---

## Part 5 — Displacement Formula V2

### File: `src/models/displacement.ts`

Mark `computeSimplifiedDisplacement` as `// DEPRECATED:`.

Add:
```typescript
/** V2 displacement: adoption × weightedCapability × α
 *  The previous weightedCapability² squaring was a hacky proxy for α; now α is explicit. */
export function computeDisplacementV2(
  adoptionRate: number,
  weightedCapability: number,
  alpha: number,
): number {
  const raw = adoptionRate * weightedCapability * alpha;
  return Math.max(0, Math.min(1, raw));
}
```

Modify `computeRoleDisplacement` to accept `alpha: number`.

Modify `computeClusterDisplacement`:
- Accept `alphaByRole: Record<string, number>`
- Per-role: pass `alphaByRole[role.id]`
- Compute cluster-aggregate `aggregateReplacementDifficultyWagePremium` (employment-weighted mean across roles)
- Compute `scarcityPremiumContribution` per-cluster using existing AI displacement share inputs
- Store `wageAdjustmentFromScarcity` on result for next-year feedback

---

## Part 6 — Alpha Driver Computation

### New file: `src/models/alphaDrivers.ts`

```typescript
import type {
  OccupationCluster, RoleDefinition, AlphaDriverParams, AlphaDecomposition,
} from '@/types';

export function computeEffectiveAlpha(inputs: {
  cluster: OccupationCluster;
  role: RoleDefinition;
  year: number;
  weightedCapability: number;
  triggerYear: number | null;
  previousYearPeerAlpha: number;
  currentCorporateMargin: number;
  baselineCorporateMargin: number;
  unemploymentRate: number;
  naturalRate: number;
  params: AlphaDriverParams;
}): { alpha: number; decomposition: AlphaDecomposition } {
  const {
    cluster, role, year, weightedCapability, triggerYear,
    previousYearPeerAlpha, currentCorporateMargin, baselineCorporateMargin,
    unemploymentRate, naturalRate, params,
  } = inputs;

  const baseline = role.automationShareOverride ?? cluster.automationShare;

  const capabilityContribution = params.capabilityWeight *
    sigmoid((weightedCapability - params.capabilityActivationThreshold) * 6);

  let trustContribution = 0;
  if (triggerYear !== null && year >= triggerYear) {
    const yearsSinceTrigger = year - triggerYear;
    trustContribution = params.trustWeight *
      (1 - Math.exp(-yearsSinceTrigger / params.trustHalfLifeYears));
  }

  const competitiveContribution = params.competitiveWeight *
    Math.max(0, previousYearPeerAlpha - baseline);

  const marginGap = Math.max(0, baselineCorporateMargin - currentCorporateMargin);
  const marginContribution = params.marginWeight * (marginGap / baselineCorporateMargin);

  const excessUnemployment = Math.max(0, unemploymentRate - naturalRate);
  const slackContribution = -params.slackWeight * excessUnemployment * 5;

  const raw = baseline + capabilityContribution + trustContribution
    + competitiveContribution + marginContribution + slackContribution;

  return {
    alpha: Math.max(0, Math.min(1, raw)),
    decomposition: {
      baseline, capabilityContribution, trustContribution,
      competitiveContribution, marginContribution, slackContribution,
    },
  };
}

/** Employment-weighted mean α across category peers, excluding self. */
export function computePeerAlpha(
  category: string,
  selfClusterId: string,
  priorYearAlphaByCluster: Map<string, number>,
  clusterEmploymentByCluster: Map<string, number>,
  clusters: OccupationCluster[],
): number {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const cluster of clusters) {
    if (cluster.id === selfClusterId) continue;
    if (cluster.category !== category) continue;
    const alpha = priorYearAlphaByCluster.get(cluster.id);
    const emp = clusterEmploymentByCluster.get(cluster.id);
    if (alpha === undefined || emp === undefined) continue;
    weightedSum += alpha * emp;
    totalWeight += emp;
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
}

function sigmoid(x: number): number { return 1 / (1 + Math.exp(-x)); }
```

---

## Part 7 — Augmentation Adoption

### New file: `src/models/augmentationAdoption.ts`

```typescript
/** Pre-BFCS augmentation adoption: fraction of workers using AI as tool.
 *  Triggers when betterScore × cheaperScore > 0.1 (workable-tool threshold).
 *  Threshold is mathematical, not a user knob — the 0.1 is an implementation detail. */
export function computeAugmentationAdoption(inputs: {
  year: number;
  betterScore: number;
  cheaperScore: number;
  augTriggerYear: number | null;
  steepness: number;
}): { augAdoptionRate: number; triggered: boolean; triggerYear: number | null } {
  const viable = (inputs.betterScore * inputs.cheaperScore) > 0.1;
  let triggerYear = inputs.augTriggerYear;
  if (triggerYear === null && viable) triggerYear = inputs.year;
  if (triggerYear === null) return { augAdoptionRate: 0, triggered: false, triggerYear: null };
  const yearsSince = Math.max(0, inputs.year - triggerYear);
  const augAdoptionRate = 1 / (1 + Math.exp(-inputs.steepness * yearsSince));
  return { augAdoptionRate, triggered: true, triggerYear };
}
```

---

## Part 8 — Productivity Formulas

### File: `src/models/simulation.ts` — `computeAIProductionExpansion`

Deprecate the `maxMult / AI_PRODUCTIVITY_MULTIPLIER_BY_DEPLOYMENT / effectiveProductivity = 1 + (maxMult - 1) × weightedCapability` block with `// DEPRECATED:`.

Replace:
```typescript
// V2 productivity — first-principles derivation from BFCS dimensions.
// No arbitrary multiplier cap; extreme inputs produce extreme but coherent outputs.
//   Baseline 1.0 + capability-gated quality × replacementMultiplier × throughput boost from cost
// betterScore scales quality, cheaperScore scales throughput (AI at scale).
// Augmentation counterpart uses different formula (human-rate-limited).
const betterScore = /* employment-weighted avg across cluster roles */;
const cheaperScore = /* employment-weighted avg across cluster roles */;
const replacementMultiplier = config.replacementMultiplier ?? DEFAULT_REPLACEMENT_MULTIPLIER;
const effectiveProductivity = 1
  + weightedCapability * betterScore * replacementMultiplier * (1 + cheaperScore);
```

The `effectiveProductivityByCluster` Map consumers (in `macro.ts` `computeSectorWeightedDeflation`) continue to work unchanged — just populated from new formula.

### File: `src/models/simulation.ts` — augmentation output loop (lines ~989-1015)

Replace with:
```typescript
let clusterAugmentationOutput = 0;
if (augMultiplier > 0) {
  for (const role of cluster.roles) {
    const roleBaseline = scaledEmployments[role.id] ?? 0;
    const roleWage = baseline.wages[role.id] ?? 0;
    const roleBFCS = roleBFCSOutputs.find(r => r.roleId === role.id);
    const betterScore = roleBFCS?.scores.better ?? 0;
    const cheaperScore = roleBFCS?.scores.cheaper ?? 0;
    const alpha = roleAlphas[role.id];

    const augResult = computeAugmentationAdoption({
      year, betterScore, cheaperScore,
      augTriggerYear: augTriggerYears[cluster.id][role.id],
      steepness: config.augmentationAdoptionSteepness ?? DEFAULT_AUGMENTATION_ADOPTION_STEEPNESS,
    });
    if (augResult.triggered && augTriggerYears[cluster.id][role.id] === null) {
      augTriggerYears[cluster.id][role.id] = augResult.triggerYear;
    }

    const roleAdoption = adoptionRates[role.id] ?? 0;
    const roleDisplacement = computeDisplacementV2(roleAdoption, weightedCapability, alpha);
    const roleRemaining = roleBaseline * (1 - roleDisplacement);

    // Per-worker augmentation boost — human-rate-limited (multiplicative, not compound)
    const perWorkerBoost = betterScore * cheaperScore * augMultiplier;
    const augmentedRemaining = roleRemaining * augResult.augAdoptionRate;
    clusterAugmentationOutput += augmentedRemaining * roleWage * perWorkerBoost;
  }
  totalAugmentationOutput += clusterAugmentationOutput;
  augmentationByCluster.set(cluster.id, clusterAugmentationOutput);
}
```

---

## Part 9 — BFCS Trigger with Friction Delay

### File: `src/models/bfcs.ts`

Modify `findTriggerYear`:
- After finding the year where BFCS conditions are met, apply friction delay:
  ```typescript
  const frictionYears = role.aiReplacementDifficultyFriction
    * (config.maxAdoptionFrictionYears ?? DEFAULT_MAX_ADOPTION_FRICTION_YEARS);
  const effectiveTriggerYear = Math.ceil(bfcsTriggerYear + frictionYears);
  return effectiveTriggerYear;
  ```
- If `effectiveTriggerYear` exceeds the simulation window, return null (role never triggers)

Add the triggerYearShift value to the returned object so it can be surfaced in diagnostics and UI.

---

## Part 10 — Adoption S-Curve Tail Drag from Wage Premium Difficulty

### File: `src/models/adoption.ts`

**Motivation:** `aiReplacementDifficultyWagePremium` should slow adoption AS IT APPROACHES 100%, not ceiling it. For trucking, tail is fast — once AVs work, nothing slows full automation. For surgery, tail is slow — the last 20% requires edge-case judgment that is genuinely hard for AI. But nothing is absolutely ceilinged; given infinite time and capability, any role can asymptotically approach 100% automation.

**Mechanism:** Asymmetric S-curve where the exponent modulates the tail shape.

Replace the standard logistic in `computeBaseAdoptionRate`:
```typescript
// asymmetry controls how dragged the tail is.
//   wagePremium=0 → asymmetry=1 → standard exponential approach to 1.0
//   wagePremium=0.5 → asymmetry=3.5 → moderate tail drag
//   wagePremium=1.0 → asymmetry=6 → severe tail drag
// The ×5 maps [0,1] user input to the expressive exponent range [1,6].
const asymmetry = 1 + role.aiReplacementDifficultyWagePremium * 5;
const standardApproach = 1 - Math.exp(-steepness * timeSinceTrigger);
const rate = Math.pow(Math.max(0, standardApproach), asymmetry);
```

**Nothing is ceilinged.** Given infinite time, rate → 1. User who believes surgeons will never be fully replaced sets `wagePremium = 1.0`; adoption practically crawls in the tail within simulation window but is not hard-capped. Cluster-level `adoptionCeiling` continues to operate separately for capacity-constraint reasons.

**Verification at steepness=1, wagePremium=1:**
- t=5: `(1 - e^-5)^6 = 0.993^6 = 0.96`
- t=10: `0.99995^6 = 0.9997`
- t=50: → 1.0 (asymptotic)

---

## Part 11 — Competitive Pressure Split

### File: `src/models/adoption.ts`

Modify `applyCompetitivePressure`:
```typescript
export function applyCompetitivePressure(
  baseAdoptionRate: number,
  adoptionParams: AdoptionParams = DEFAULT_ADOPTION_PARAMS,
  peerAlpha: number = 0.5,
  thresholdOverride?: number,
): number {
  const threshold = thresholdOverride
    ?? adoptionParams.competitivePressureThreshold
    ?? DEFAULT_COMPETITIVE_PRESSURE_THRESHOLD;
  const { competitivePressureMultiplier } = adoptionParams;
  const pressure = Math.max(0, baseAdoptionRate - threshold) * competitivePressureMultiplier;
  // (1 - peerAlpha) routes to adoption rate; peerAlpha routes to α via computeEffectiveAlpha.
  const adjusted = baseAdoptionRate * (1 + pressure * (1 - peerAlpha));
  return Math.min(1, adjusted);
}
```

Update call sites in simulation.ts to pass `peerAlpha` and configured threshold.

---

## Part 12 — Phillips Curve Mechanism 2

### File: `src/models/macro.ts`

Rewrite `computeWagePressure`:
```typescript
export function computeWagePressure(
  unemploymentRate: number,
  aiDisplacementUnemployment: number,
  aggregateReplacementDifficultyWagePremium: number,
  scarcityIntensity: number = DEFAULT_SCARCITY_INTENSITY,
  policyWageFloor: number = 0,
  phillipsCurveSensitivity: number = PHILLIPS_CURVE_SENSITIVITY,
  naturalRate: number = FRED_NAIRU_RATE,
  laborForceBaseline: number,
): number {
  const excessUnemployment = Math.max(0, unemploymentRate - naturalRate);
  const totalUnemployed = Math.max(unemploymentRate * laborForceBaseline, 1);
  const aiShare = Math.min(1, aiDisplacementUnemployment / totalUnemployed);
  const classicPhillips = Math.exp(-phillipsCurveSensitivity * excessUnemployment * (1 - aiShare));
  const scarcityPremium = aiShare * scarcityIntensity * aggregateReplacementDifficultyWagePremium;
  return Math.max(policyWageFloor, classicPhillips + scarcityPremium);
}
```

Add per-cluster helper:
```typescript
/** Per-cluster scarcity premium. Feeds macro aggregate AND next-year Cheaper feedback. */
export function computeClusterScarcityPremium(inputs: {
  clusterAiDisplacementShare: number;
  clusterReplacementDifficultyWagePremium: number;
  scarcityIntensity: number;
}): { premium: number; wageAdjustment: number } {
  const premium = inputs.clusterAiDisplacementShare
    * inputs.scarcityIntensity
    * inputs.clusterReplacementDifficultyWagePremium;
  return { premium, wageAdjustment: premium };
}
```

In `computeClusterDisplacement`: compute `aggregateReplacementDifficultyWagePremium` as employment-weighted mean of `role.aiReplacementDifficultyWagePremium` across roles. Compute and store `scarcityPremiumContribution` and `wageAdjustmentFromScarcity`.

Macro aggregate (in simulation.ts): sum cluster premiums weighted by cluster employment share.

Per-cluster wage feedback: `priorYearWageAdjustmentByCluster` Map is updated each year; next year's `computeCheaperScore` reads it via new `wageAdjustment` parameter that multiplies `humanCostFactor` by `(1 + wageAdjustment)`.

---

## Part 13 — Simulation Integration

### File: `src/models/simulation.ts`

**New persistent state (near line 489):**
```typescript
const augTriggerYears: Record<string, Record<string, number | null>> = {};
const priorYearAlphaByCluster = new Map<string, number>();
const priorYearAlphaByRole: Record<string, Record<string, number>> = {};
const priorYearWageAdjustmentByCluster = new Map<string, number>();

for (const cluster of clusters) {
  augTriggerYears[cluster.id] = {};
  priorYearAlphaByRole[cluster.id] = {};
  for (const role of cluster.roles) {
    augTriggerYears[cluster.id][role.id] = null;
    priorYearAlphaByRole[cluster.id][role.id] = role.automationShareOverride ?? cluster.automationShare;
  }
  priorYearAlphaByCluster.set(cluster.id, cluster.automationShare);
  priorYearWageAdjustmentByCluster.set(cluster.id, 0);
}
```

**Per-year additions (inside cluster loop):**
1. Compute `peerAlpha` via `computePeerAlpha`
2. For each role: compute α via `computeEffectiveAlpha`, store in `roleAlphas`, decomposition
3. Pass `peerAlpha` and `configured threshold` into `applyCompetitivePressure`
4. Pass `priorYearWageAdjustmentByCluster.get(cluster.id)` into BFCS `computeCheaperScore` chain
5. Pass `roleAlphas` into `computeClusterDisplacement`

**End-of-year state update** (after cluster loop):
- Update `priorYearAlphaByCluster` (employment-weighted across roles)
- Update `priorYearAlphaByRole`
- Update `priorYearWageAdjustmentByCluster` from each cluster's `wageAdjustmentFromScarcity`

**Pass to `computeMacro`:**
- `aiDisplacementUnemployment` (cumulative across years and clusters)
- `aggregateReplacementDifficultyWagePremium` (economy-wide employment-weighted)

---

## Part 14 — UI Controls

### New: `src/components/controls/AlphaControls.tsx`

Section: "AI Deployment Mode (Automation vs Augmentation)"
- Per-cluster α slider with reset-to-default button
- Collapsible per-role α override section
- Five α driver weight sliders: capability, trust, competitive, margin, slack
- Capability activation threshold slider
- Trust half-life years slider

### Update BFCSEditor (or add new panel):

Per-role sliders for:
- `aiReplacementDifficultyFriction` (0-1, default per ROLE_AI_REPLACEMENT_DIFFICULTY_FRICTION_DEFAULTS)
- `aiReplacementDifficultyWagePremium` (0-1, default per ROLE_AI_REPLACEMENT_DIFFICULTY_WAGE_PREMIUM_DEFAULTS)

### Update `AICapabilitiesControls.tsx` (or appropriate panel):
- Augmentation Adoption Steepness slider (0.1 to 2.0)
- Competitive Pressure Threshold slider (0.05 to 0.5)
- Scarcity Intensity slider (0 to 1.0) — move/rename from existing "AI Wage Premium"
- Replacement Multiplier slider (0.5 to 10.0, default 2.0)
- Max Adoption Friction Years slider (0 to 15, default 5)

### New: `src/components/controls/InferenceCostCurveControls.tsx`
Three sliders with live Recharts preview of 2025-2050 trajectory:
- Floor (log scale, 1e-5 to 0.1)
- Initial decay rate k (0.1 to 2.0)
- Decay exponent (0.3 to 1.0)

### Update `FeedbackLoopControls.tsx`:
Remove "AI Wage Premium" slider (moved). Update Phillips feedback loop diagram labels for new scarcity premium structure.

---

## Part 15 — Store Updates

### File: `src/stores/simulationStore.ts`

Add to default config: all new fields from Part 1.

Add actions:
- `setAlphaDriverParams`
- `setAugmentationAdoptionSteepness`
- `setInferenceCostCurve`
- `setScarcityIntensity`
- `setCompetitivePressureThreshold`
- `setReplacementMultiplier`
- `setMaxAdoptionFrictionYears`
- `setClusterAlpha(clusterId, value)`
- `setRoleAlphaOverride(clusterId, roleId, value)`
- `setRoleReplacementDifficultyFriction(clusterId, roleId, value)`
- `setRoleReplacementDifficultyWagePremium(clusterId, roleId, value)`

`resetToDefaults` resets all new fields.

---

## Part 16 — Tests

Write unit tests for every new pure function. Minimum coverage:

### `src/models/__tests__/alphaDrivers.test.ts`
- Year 0 defaults: α ≈ baseline
- Full driver activation: α > baseline, clamped [0,1]
- High unemployment: negative slack
- Peer lag: uses prior-year value
- Margin compression positive; peer below baseline zero-not-negative

### `src/models/__tests__/displacement.test.ts` (extend)
- `computeDisplacementV2`: α=0 → 0; α=1 cap=0.7 adopt=0.6 → 0.42
- Verify drop of square vs deprecated formula (~71% ratio at canonical test case)

### `src/models/__tests__/augmentationAdoption.test.ts`
- Below threshold: not triggered
- Just crosses: triggered, low rate
- 5 years post-trigger at steepness 0.8: rate ≈ 0.98

### `src/models/__tests__/bfcs.inferenceCurve.test.ts`
- t=0 → 1.0; t=1 → 0.61 ±0.02; t=10 → 0.053 ±0.01; t=25 → 0.006 ±0.002
- Asymptotes to floor

### `src/models/__tests__/bfcs.cheaperWageFeedback.test.ts`
- wageAdjustment=0: baseline behavior
- wageAdjustment=0.10: cheaper score rises (AI looks more attractive)

### `src/models/__tests__/bfcs.betterScore.cleanup.test.ts`
- Post-removal of quality multiplier: Better scores for high-difficulty roles have risen
- Weights still sum correctly

### `src/models/__tests__/bfcs.frictionDelay.test.ts`
- friction=0: no delay
- friction=1 maxFrictionYears=5: 5-year delay
- Large delay pushes trigger out of window → null

### `src/models/__tests__/adoption.tailDrag.test.ts`
- WagePremium=0: standard exponential approach (asymmetry=1); rate at t=5, k=1 ≈ 0.993
- WagePremium=0.5: asymmetry=3.5; rate at t=5, k=1 ≈ 0.975
- WagePremium=1.0: asymmetry=6; rate at t=5, k=1 ≈ 0.96 (still climbing)
- WagePremium=1.0: rate at t=50, k=1 ≈ 1.0 (asymptotically reachable, never ceilinged)
- Verify rate never exceeds 1.0
- Verify monotonic increase for any valid inputs

### `src/models/__tests__/macro.scarcityPremium.test.ts`
- aiDisplacement=0: reduces to classic Phillips
- aiShare=1 high difficulty: premium dominates
- aiShare=1 zero difficulty: premium = 0

### `src/models/__tests__/productivity.derived.test.ts`
- Zero capability: productivity = 1.0
- Full capability full scores: yields expected replacement productivity
- Cheaper score boost is multiplicative on capability-gated base

### Golden-master integration test
- Full simulation 2025-2050 with all defaults. Snapshot `timeline.summary` as new baseline. Document that this is the NEW model output; not compared against prior snapshot.

---

## Part 17 — Documentation

### Update `docs/DATA_MODEL.md`
- Section: α primitive and drivers (new)
- Section: displacement V2 formula (replace old squared formula section with deprecation note + new)
- Section: augmentation adoption + output (rewrite)
- Section: Phillips Mechanism 2 (rewrite as AI-displacement-aware scarcity premium)
- Section: inference cost curve (new)
- Section: BFCS Better score cleanup (note removal of quality multiplier)
- Section: role replacement difficulty split (friction vs wage premium)

### Update `docs/VARIABLE_REGISTRY.md`
- All new variables registered in their sections
- All renamed variables tracked
- All deprecated constants noted

### New: `docs/ALPHA_DRIVERS.md`
- Plain-English description of each driver
- Worked example: SWE cluster 2030 α decomposition
- Notes on one-year peer lag rationale
- Notes on per-cluster wage-adjustment feedback

### Methodology screen
- Add α section
- Add augmentation section explaining the two formulas (replacement compound, augmentation multiplicative)
- Add AEI placeholder section: "Anthropic Economic Index data integration (planned)" — CC places logically within augmentation/displacement explanations

---

## Completion Criteria

1. `npx tsc --noEmit` — zero errors
2. `npm test` — all new tests pass; golden-master captured as new baseline
3. Full simulation 2025-2050 runs without NaN/Infinity
4. Every user-adjustable parameter reachable from a UI slider
5. No arbitrary caps on user-adjustable parameters
6. All deprecated constants/functions marked, not removed
7. A reviewer can trace any displacement number in a 2040 output back to inputs via registry + data model docs
8. Methodology screen renders new sections correctly

---

## Out of Scope (Future Prompts)

- AEI data ingestion, transformation, preset selector UI
- Massenkoff-McCrory β back-cast validator
- DOMAIN_RISK_FACTORS per-cluster/role refinement
- Manufacturing/energy cost curves
- Back-cast validation dashboard view

---

## Instructions for CC — Planning Phase

Before writing any code:

1. Read this prompt end-to-end
2. Check your understanding by re-reading the existing relevant files: `bfcs.ts`, `displacement.ts`, `adoption.ts`, `macro.ts`, `simulation.ts`, `types/index.ts`, `constants.ts`, `occupationClusters.ts`, `stores/simulationStore.ts`
3. Produce a detailed implementation plan organized by:
   - Phase 1: Types and constants (what goes where, what gets deprecated)
   - Phase 2: Pure functions in `src/models/` (dependency order: alphaDrivers, augmentationAdoption, inference curve, displacement v2, BFCS modifications)
   - Phase 3: Simulation integration (persistent state, per-year wiring, end-of-year state updates)
   - Phase 4: Store updates (default config, actions)
   - Phase 5: UI controls
   - Phase 6: Tests
   - Phase 7: Documentation
4. For each file, note: what changes, what's deprecated, what's added, dependencies on other changes
5. **Produce a dependency graph** as part of the plan: which new/modified functions call which others, and the resulting implementation order. The α driver chain has tight coupling (peerAlpha → effectiveAlpha → displacement → aggregate → priorYear state) and should be visible as a graph before any code is written.
6. Flag any ambiguities, conflicts with existing code, or places where the prompt's assumptions appear wrong
7. Return plan for user review

Do NOT execute until user approves the plan.

---

## Interactions and Second-Order Effects — READ BEFORE IMPLEMENTATION

### Friction delay compounds with existing `role.adoptionLag`

`role.adoptionLag` already exists (default 1) and adds a deployment logistics delay inside `getAdoptionRate`. The new `aiReplacementDifficultyFriction` adds a separate regulatory/cultural delay at trigger-year computation. **These are additive, not multiplicative, and must compose cleanly:**

```
effectiveTriggerYear = bfcsTriggerYear + frictionYears
// then inside getAdoptionRate:
effectiveStartYear = effectiveTriggerYear + adoptionLag
```

Do not double-count. Do not accidentally apply friction inside getAdoptionRate. Friction modifies triggerYear; adoptionLag modifies the rate function afterwards.

### BFCS Better cleanup shifts trigger years

Removing the quality multiplier from `computeBetterScore` raises scores for senior/specialist roles. Their B* thresholds still gate them, but with higher scores, they trigger earlier than under the previous model.

The new `aiReplacementDifficultyFriction` is designed to replace this earlier difficulty modulation. For senior surgeons, BFCS may now trigger in 2032 (earlier than prior 2040+); friction of 0.90 × 5 years = 4.5 years pushes effective trigger to 2036.5; adoption ramp then begins but tail-drag from wagePremium slows it dramatically.

**Net effect should be similar or slightly earlier trigger timelines for specialists compared to current model.** If CC sees senior/specialist roles suddenly triggering in 2027 with full automation by 2030, something is miscalibrated. CC should run a diagnostic: for each cluster at default config, report `bfcsTriggerYear`, `frictionYears`, `effectiveTriggerYear`, and `adoptionRate at 2050` as a sanity table. Include this table in the implementation review output.

### Embodied α baselines × α drivers interaction

Embodied clusters start at α baselines 0.60-0.85. The α drivers (capability, trust, competitive, margin, slack) can push α further up or down. Surgery baseline 0.20 with all drivers fully active could reach ~0.60 by 2050. Trucking baseline 0.85 could approach 1.0. **Any cluster pegging α at the [0,1] boundary for extended periods is a calibration signal worth flagging in the sanity table above.**

### Role default values are ATLAS-authored, not ground truth

The per-role defaults for `aiReplacementDifficultyFriction` and `aiReplacementDifficultyWagePremium` are editorial judgments. Healthcare clusters (0.6-0.9) have the strongest empirical basis (regulatory/licensure visible in public record). Creative clusters (journalism at 0.4/0.65) are the softest. **Document in DATA_MODEL.md that these are editorial defaults awaiting empirical calibration (AEI preset in future phase).** User override is the expected workflow.

### UI layer may have hardcoded reference values

This rework shifts nearly every simulation output. Charts, scenario displays, and test fixtures may have hardcoded expected values ("displacement by 2040 around X%"). CC should grep for such hardcoded expectations across `src/components/` and `src/hooks/` before committing. **Flag them in the implementation review; do not silently adjust them.**

### AEI is out of scope

This prompt does not implement AEI data ingestion, AEI preset UI, or Massenkoff-McCrory β validator. If CC's plan includes any AEI-related work, that's scope creep. Return to user for confirmation before including.

### Parameter conflict during refactor

Renaming and deprecating `role.aiReplacementDifficulty` creates a migration window. CC should:
1. Keep the old field present but marked deprecated
2. Populate both old and new fields during cluster initialization (old = average of new two, for any legacy consumer)
3. Update BFCS Better score to no longer read the old field
4. Update Phillips to read `aiReplacementDifficultyWagePremium` only
5. Flag any other readers that exist — there should be none but verify via grep before the old field is truly orphaned

### Golden-master captured, not compared

The existing simulation produces specific numbers. This rework produces different specific numbers. Do not attempt to reconcile the two. CC captures a NEW golden-master after implementation, documents what it represents, and that becomes the anchor for future regression tests.