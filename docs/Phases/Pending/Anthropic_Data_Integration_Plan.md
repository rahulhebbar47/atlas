# PLAN: Integrating the Anthropic Economic Index as a Global Preset in ATLAS

## Context

ATLAS's BFCS thresholds, `aiReplacementDifficulty` values, cluster capability weights, and capability trajectories are currently hand-authored. They're informed by intuition and benchmark citations, but they're not anchored in observed economy-wide AI deployment data. Anthropic publishes a quarterly **Economic Index** on HuggingFace (`Anthropic/EconomicIndex`) derived from millions of Claude conversations and API transcripts — per-O\*NET-task automation/augmentation ratios, per-SOC-group effective AI coverage, and task horizons. This is the best available empirical ground truth on where AI is actually being used for automation today.

The goal is to expose this empirical data as an **optional global preset** at the top of the left-hand ControlsPanel, so that users — primarily policy professionals evaluating AI policy scenarios — can toggle between "ATLAS hand-authored defaults" and "Anthropic-anchored empirical defaults." This is additive, not prescriptive: the preset changes what the *baseline* values are, but every parameter remains individually overridable.

**Scope constraints (per user directive)**:
- Accept Anthropic's Claude-user-skewed population; extrapolate to all generative/agentic tasks economy-wide.
- Robotics/embodied clusters keep their current hand-authored values (Anthropic data doesn't cover physical work).
- Preset must be **opt-in** — `null` preset = current behavior, byte-for-byte.
- Must remain reversible — toggling the preset off must produce identical simulation output to never having toggled it on.

---

## Strategic Decisions

### Decision 1: Single global preset (dropdown with snapshot options), not multiple per-section presets

**Rationale**:
- The user's explicit request is "a global preset at the top of the left-hand column."
- Each Anthropic release is a self-consistent snapshot at one point in time. Mixing data across snapshots (e.g., using Sept 2025 task-level data but Jan 2026 effective-coverage data) is epistemically messy and pushes the user to reason about version skew.
- Existing section-level reset buttons in `ControlsPanel.tsx` already provide granular "opt out of this preset's coverage of X" affordance. No new pattern needed.
- Keeps UX parallel to existing `PolicyPresetSelector`, `FiscalPolicyPreset`, `FederalReservePreset` — pattern ATLAS already uses.

**Implication**: Exactly one preset can be active at a time. Dropdown options at launch:
- `ATLAS Defaults` (null — current behavior)
- `Anthropic AEI 2026-01 (Economic Primitives)` — primary recommended default
- `Anthropic AEI 2026-03 (Learning Curves)` — latest

The system supports adding more snapshots as Anthropic releases them by dropping a new subdirectory and registering it.

### Decision 2: Preset scope — which parameters are overridden

| Parameter | Override? | Source in Anthropic data | Confidence |
|---|---|---|---|
| `RoleDefinition.aiReplacementDifficulty` | Yes | Effective AI coverage per SOC major group (Jan 2026+) or derived from task-level `automation_vs_augmentation_by_task` + `task_pct` | High |
| `OccupationCluster.capabilityRelevance.weights.generative` and `.agentic` | Yes | Derived from collaboration-pattern mix (directive+feedback\_loop → agentic; validation+task\_iteration+learning → generative) | Medium |
| `OccupationCluster.capabilityRelevance.weights.embodied` | No | Not covered by Anthropic data; preserved from hand-authored defaults | — |
| `RoleDefinition.bfcsThresholds.better` (B\*) | Yes | Back-derived from observed automation share at current capability score | Medium |
| `RoleDefinition.bfcsThresholds.faster/cheaper/safer` | No | Not directly measurable in Anthropic data; remain hand-authored | — |
| `DEFAULT_CAPABILITY_TRAJECTORIES.generative.{steepness, midpointYear}` | Yes | Sigmoid fit to observed directive-share time series across releases | Medium |
| `DEFAULT_CAPABILITY_TRAJECTORIES.agentic.{steepness, midpointYear}` | Yes | Same time series, weighted toward long-horizon/agentic tasks | Lower |
| `DEFAULT_CAPABILITY_TRAJECTORIES.embodied.*` | No | Anthropic data excludes physical work | — |
| New field `OccupationCluster.automationShare` | Yes (new) | `automation_pct` / (`automation_pct` + `augmentation_pct`) per cluster. Feeds into displacement formula as a dampening multiplier. | Medium |
| Cluster-level `adoptionSteepness` / `adoptionCeiling` | No | Not directly measurable in data | — |
| Policy, macro, tax, monetary parameters | No | Orthogonal to Anthropic data | — |

### Decision 3: Temporal semantics — snapshots are frozen anchors, not projections

- A preset represents Anthropic's observation **as of its release date**.
- The preset anchors **present-year** (t=2025) baseline values.
- For **trajectory parameters** (`steepness`, `midpointYear`), the preset uses a sigmoid fit across **all prior snapshots** through the selected release — each snapshot contributes a data point `(release_date, observed_automation_share)` and we fit a 2-parameter model (floor/ceiling from existing defaults, fit steepness and midpointYear).
- The preset does **not** mutate future years. Simulation still projects forward using the trajectory functions; the preset merely sets better-calibrated trajectory parameters.

### Decision 4: Reproducibility over freshness for saved scenarios

When a user saves a scenario while a preset is active, the saved config includes **the expanded parameter values**, plus a metadata tag recording which preset was active at save time. On load, the config is applied as-is — the preset is *not* re-applied from current data. This means:
- Old scenarios remain reproducible even if Anthropic data updates.
- The preset's identity is displayed in the UI ("Built on Anthropic AEI 2026-03") but does not participate in recomputation.
- Users who want to "refresh" a saved scenario to current Anthropic data can re-select the preset from the dropdown.

### Decision 5: Extrapolation and Claude-skew disclosure

Per user directive, Anthropic data is extrapolated to all generative/agentic clusters economy-wide without debiasing for Claude-user population skew. This must be visibly disclosed:
- InfoTooltip on the preset selector.
- A paragraph in a new `docs/ANTHROPIC_DATA_INTEGRATION.md`.
- A line in the data freshness area of the app header when an Anthropic preset is active.

---

## Phase-by-Phase Implementation

### Phase 10.0: Foundation — Data Survey and Schema Finalization

**Goal**: Empirically verify the CSV column schemas for each target release before writing code against them. The web-fetch research produced a mostly-accurate schema inventory, but some columns (especially in the Jan 2026 and Mar 2026 releases) need verification against the actual data.

**Deliverables**:
- `docs/ANTHROPIC_DATA_SURVEY.md` (new, ~1 page, informal) — a one-time artifact capturing:
  - For each of the 3 target releases (2025-09, 2026-01, 2026-03):
    - Complete list of files in the release.
    - For each CSV: exact column names, types, number of rows.
    - Which columns carry the metrics ATLAS will consume.
    - Any deviations from the HuggingFace `data_documentation.md` claims.
  - Heuristic decisions frozen:
    - How to derive generative-vs-agentic weight from collaboration pattern mix.
    - How to aggregate tasks to cluster level when a cluster has multiple SOC codes.
    - What to do about O\*NET-SOC 8-digit codes (e.g., `15-1231.00`) that ATLAS currently records as 6-digit (`15-1231`).
- Committed **example rows** pasted into the survey doc so the transformation script has known-good test fixtures.

**Key activities** (manual, one-time):
1. `curl` or `wget` representative files from each release:
   - `https://huggingface.co/datasets/Anthropic/EconomicIndex/resolve/main/release_2025_09_15/data/aei_enriched_claude_ai_2025-08-04_to_2025-08-11.csv`
   - Analogous URLs for 2026-01-15 and 2026-03-24
2. Inspect headers and first ~20 rows.
3. Record findings in survey doc. Freeze decisions.

**Why this is a phase**: Skipping this step is how we end up with a transformation layer that assumes `automation_pct` exists as a column when it's actually derived, or that `effective_AI_coverage` is published at 6-digit SOC when it's actually at 2-digit. Both would cause silent wrong numbers downstream.

**Exit criteria**: Survey doc committed. Heuristics frozen. A reviewer can look at the doc and trace every parameter ATLAS will derive back to a specific column in a specific file.

---

### Phase 10.1: Data Ingestion Script

**Goal**: A repeatable script that downloads the chosen Anthropic releases from HuggingFace, caches raw CSVs locally, and writes them into `src/data/anthropic/<release-id>/raw/`.

**New files**:
- `scripts/fetch-anthropic-data.ts` — mirrors the pattern of `scripts/fetch-bls-data.ts` and `scripts/fetch-fred-data.ts`. Uses `scripts/fetch-utils.ts` for rate-limiting and JSON writing.
- `src/data/anthropic/.gitkeep` — ensures directory exists in git.

**Script specification**:

```
Usage:
  npx tsx scripts/fetch-anthropic-data.ts                      # Fetch all 3 default releases
  npx tsx scripts/fetch-anthropic-data.ts --release 2026-01-15 # Fetch a specific release
  npx tsx scripts/fetch-anthropic-data.ts --list               # List available releases without fetching
```

**Behavior**:
1. For each requested release (`2025-09-15`, `2026-01-15`, `2026-03-24`):
   1. Check if `src/data/anthropic/<release-id>/raw/` already has files; if present and `--force` not set, skip.
   2. Fetch the file manifest for that release via the HuggingFace API:
      - `GET https://huggingface.co/api/datasets/Anthropic/EconomicIndex/tree/main/release_<id>/data`
   3. For each CSV file in the manifest, download via:
      - `https://huggingface.co/datasets/Anthropic/EconomicIndex/resolve/main/release_<id>/data/<filename>`
      - Honor a 2-second rate limit between requests (HF CDN is fine with higher rates but this is polite).
   4. Write to `src/data/anthropic/<release-id>/raw/<filename>`.
   5. Write a `src/data/anthropic/<release-id>/metadata.json` with:
      - `releaseId`, `fetchedAt` (ISO), `sourceCommitSha` (from HF), `files[]` (names + sha256), `license` ("CC-BY-4.0").

**Error handling**:
- 429/5xx: exponential backoff, up to 3 retries.
- File missing from manifest: log warning, continue.
- Schema mismatch (column count differs from survey): write error and exit non-zero.
- Network unavailable: exit with clear error; script is idempotent so user can retry.

**Why a script and not runtime fetching**: Matches ATLAS's hard rule that the app never makes runtime data API calls (CLAUDE.md). Script produces committed static data.

**Exit criteria**: Running the script produces a full `src/data/anthropic/<release-id>/` for each of the 3 releases. All files checksummed. Second invocation is a no-op (cached).

---

### Phase 10.2: Data Transformation Layer

**Goal**: Transform raw Anthropic CSVs into ATLAS-native parameter payloads. This is **pure TypeScript**, runs at script time, and produces per-release `processed.json` files consumed by the simulation.

**New files**:
- `scripts/transform-anthropic-data.ts` — orchestrator; runs after ingestion or as its own step.
- `src/data/anthropic/anthropicCSVParse.ts` — pure CSV parsing helpers (no external deps beyond what ATLAS already has; a lightweight CSV parser will be added if ATLAS doesn't already use one — check `package.json`).
- `src/data/anthropic/anthropicTransform.ts` — pure transformation functions, unit-tested.
- Output: `src/data/anthropic/<release-id>/processed.json` — a single normalized file per release.

**Processed payload schema** (`processed.json`):

```typescript
interface AnthropicPresetPayload {
  releaseId: string;                  // e.g., "2026-01-15"
  releaseLabel: string;               // e.g., "Anthropic AEI 2026-01 (Economic Primitives)"
  releaseDate: string;                // ISO date
  sourceHash: string;                 // Hash of raw CSV bytes for reproducibility

  // Per-cluster overrides
  clusters: Record<OccupationClusterId, AnthropicClusterOverride>;

  // Global capability trajectory fits (generative + agentic only)
  trajectories: {
    generative: { steepness: number; midpointYear: number; fitRSquared: number; fitSnapshots: string[] };
    agentic:    { steepness: number; midpointYear: number; fitRSquared: number; fitSnapshots: string[] };
  };

  // Diagnostic metadata
  coverage: {
    clustersWithData: number;         // e.g., 38 of 51
    clustersMissing: string[];        // Cluster IDs with no Anthropic coverage (keep hand-authored)
    tasksAggregated: number;          // Count of O*NET tasks consumed
    socCodesMapped: number;
  };
  warnings: string[];                 // Non-fatal issues during transform
}

interface AnthropicClusterOverride {
  // Derived from effective AI coverage, weighted by cluster's SOC task-share
  roles: Record<string, {
    aiReplacementDifficulty: number;  // 1 - effective_AI_coverage, clamped [0, 1]
    bfcsBetterThreshold: number;      // Back-derived B*
  }>;

  // Derived from collaboration-pattern mix
  capabilityWeights: {
    generative: number;
    agentic: number;
    // NOTE: embodied is NOT provided. Merge logic preserves hand-authored embodied weight.
  };

  // Derived from automation_pct / (automation_pct + augmentation_pct)
  automationShare: number;            // [0, 1] — used in displacement dampening

  // Diagnostic
  socCodesCovered: string[];
  tasksAggregated: number;
  confidenceLevel: 'high' | 'medium' | 'low'; // Based on sample size
}
```

**Transformation logic** (precise):

1. **SOC code normalization**:
   - Anthropic uses O\*NET-SOC 8-digit codes like `15-1231.00`. ATLAS uses 6-digit like `15-1231`.
   - Transformation: strip `.NN` suffix, match 6-digit prefix.
   - If a cluster's 6-digit SOC code matches multiple O\*NET 8-digit variants (e.g., `15-1232.00` and `15-1232.01`), **sum their `task_pct` values** to aggregate.
   - Use `src/data/socMapping.ts` and `CLUSTERS_WITHOUT_BLS_DATA` to identify clusters that cannot be mapped (e.g., `gov_federal`, `gov_state_local`, `other_uncategorized`). These go into `coverage.clustersMissing`.

2. **Per-cluster task aggregation**:
   - For each cluster, collect all O\*NET tasks whose O\*NET-SOC codes match any of the cluster's `socCodes`.
   - Weight each task by its `task_pct` (share of Claude conversations) — this weighting is a deliberate choice: we're measuring *what Claude users actually do*, which is the empirical signal.
   - Note: This weighting skews toward tasks Claude users care about, not the employment-weighted task mix. Document as a known limitation.

3. **`aiReplacementDifficulty` derivation**:
   - Primary path (Jan 2026+): Use the published `effective_AI_coverage` per SOC major group (2-digit).
     - A cluster's effective coverage = weighted mean of its SOC major groups' coverage, weighted by employment share within the cluster.
     - `aiReplacementDifficulty = 1 - effective_coverage`, clamped to `[0, 1]`.
   - Fallback path (Sept 2025 only): Compute pseudo-coverage from task-level data:
     - `pseudo_coverage(cluster) = Σ task_pct(t) × (directive(t) + feedback_loop(t))` over cluster's tasks, normalized.
   - Per-role variation: Within a cluster, roles retain their original `seniorityLevel` relationship. The cluster-level value becomes the **senior role's** anchor; junior roles get a lower difficulty via `aiReplacementDifficulty_junior = aiReplacementDifficulty_cluster × 0.7` (same relative ratio as current hand-authored defaults). This preserves the role hierarchy while anchoring the absolute level.

4. **Capability weights (generative vs agentic)**:
   - For each cluster, compute aggregate collaboration pattern mix across its tasks:
     - `agentic_signal = Σ task_pct(t) × (directive(t) + feedback_loop(t))`
     - `generative_signal = Σ task_pct(t) × (validation(t) + task_iteration(t) + learning(t))`
   - Normalize: `agentic_share = agentic_signal / (agentic_signal + generative_signal)`.
   - Preserve hand-authored embodied weight: `embodied = hand_authored_embodied_weight`.
   - Rescale so weights sum to 1.0:
     - `software_budget = 1 - embodied`
     - `generative_weight = software_budget × (1 - agentic_share)`
     - `agentic_weight = software_budget × agentic_share`
   - This guarantees clusters with high embodied weight (trucking, construction) retain their embodied emphasis.

5. **B\* (better-threshold) back-derivation**:
   - Rationale: if we observe significant automation today (2025-2026) for a cluster, then `B(t=2025) >= B*(cluster)` for that cluster's roles.
   - Method: compute what `B(t=2025)` evaluates to for each role using the **default capability scores at t=2025** and the cluster's newly-derived capability weights. Then set `B*(role) = B(t=2025) × (1 - automationShare(cluster))`.
     - Interpretation: if `automationShare = 0` (all augmentation, no automation), `B* = B(t=2025)` — threshold exactly at current capability (no automation triggered). If `automationShare = 1` (full automation observed), `B* = 0` — threshold trivially met.
   - Bound: clamp to `[0.1, 0.95]` to avoid degenerate triggers.
   - Only override `bfcsThresholds.better`; leave `faster`, `cheaper`, `safer` untouched.

6. **`automationShare`**:
   - `automation_pct / (automation_pct + augmentation_pct)` at cluster level.
   - Drives a displacement-dampening multiplier (see Phase 10.5 simulation integration).

7. **Capability trajectory fit**:
   - Aggregate across all 3 releases to produce a time series: `[(2025-09-15, overall_automation_share), (2026-01-15, ...), (2026-03-24, ...)]`. Also use the known data point that directive-share went from 27% → 39% between mid-2025 and Feb 2026 (per public Anthropic reports).
   - Fit a 2-parameter sigmoid to the `generative` vector: fix `floor=0.10`, `ceiling=0.95` (current defaults); fit `steepness` and `midpointYear` via least-squares.
   - For `agentic`, fit against the subset of tasks categorized as high-autonomy (per Jan 2026 primitives). If primitives data unavailable in earlier releases, use `feedback_loop_pct` as a proxy.
   - Cap fits at physically reasonable ranges: `steepness ∈ [0.3, 1.5]`, `midpointYear ∈ [2028, 2045]`. If fit produces out-of-range values, log warning and clamp.
   - Store `fitRSquared` as a quality signal displayed to the user.

**Edge cases to handle explicitly** (each with a test):
- Cluster has all SOC codes in `CLUSTERS_WITHOUT_BLS_DATA` → skip, log as missing.
- Cluster has one SOC code, but Anthropic has no tasks for it → skip, log as missing.
- Task appears in multiple clusters' SOC codes (shared SOC) → count proportionally per cluster, weight by `employmentShareEstimate` if known.
- Zero-sum collaboration mix (all `filtered` column) → set capability weights to hand-authored, flag as low confidence.
- Division by zero in `agentic_share` → fall back to 0.5 (neutral split), flag warning.
- Task-weighted coverage exceeds 1.0 → clamp and warn.

**Tests** (in `src/data/anthropic/__tests__/anthropicTransform.test.ts`):
- Unit test for each transformation step with known-good CSV fixtures.
- SOC code normalization tests (6-digit, 8-digit, invalid).
- Round-trip: known input → known output, byte-stable.
- Coverage test: all 51 clusters either have override or are in `clustersMissing`.

**Exit criteria**:
- `processed.json` written for each of 3 releases.
- Unit tests pass.
- `coverage.clustersWithData + coverage.clustersMissing.length === 51`.

---

### Phase 10.3: Preset Data Model and Types

**Goal**: TypeScript types and the `SimulationConfig` field that declares which preset is active.

**Files to modify**:
- `src/types/index.ts` (add types; no removals).

**New types** (add to `src/types/index.ts`):

```typescript
// Anthropic preset identifier — one of the registered release IDs or null for defaults.
export type AnthropicPresetId =
  | 'anthropic_2025_09'
  | 'anthropic_2026_01'
  | 'anthropic_2026_03'
  | null;

export interface AnthropicPresetMetadata {
  id: Exclude<AnthropicPresetId, null>;
  label: string;                     // Display label for dropdown
  shortLabel: string;                // Condensed label for badges
  releaseDate: string;
  description: string;               // What this release emphasizes
  tooltip: string;                   // Shown on InfoTooltip
  fetchedAt: string;                 // When raw data was ingested
}
```

**`SimulationConfig` additions** (in the main config interface):

```typescript
interface SimulationConfig {
  // ... existing fields
  anthropicPreset: AnthropicPresetId;  // null = hand-authored defaults (default)
}
```

Extend `OccupationCluster`:

```typescript
interface OccupationCluster {
  // ... existing fields
  /** Share of AI adoption that results in automation vs augmentation. [0,1] where 1=full automation.
   *  Default undefined (preserves legacy behavior — equivalent to 1.0).
   *  Populated by Anthropic preset when active. */
  automationShare?: number;
}
```

Note the `?` — this field is optional, so existing code paths that don't reference it continue to work.

**No removals, no renames** — per CLAUDE.md no-delete rule. Any deprecated fields keep their `// DEPRECATED:` markers.

**Exit criteria**: `tsc --noEmit` clean. New types exported from `@/types`.

---

### Phase 10.4: Preset Registry and Precomputed Payloads

**Goal**: The static registry of available presets, plus the loaded payloads that Phase 10.5's simulation code consumes.

**New files**:
- `src/data/anthropic/presets.ts` — the registry.

**Registry structure**:

```typescript
import payload_2025_09 from './2025-09-15/processed.json';
import payload_2026_01 from './2026-01-15/processed.json';
import payload_2026_03 from './2026-03-24/processed.json';

export const ANTHROPIC_PRESETS: Record<Exclude<AnthropicPresetId, null>, {
  metadata: AnthropicPresetMetadata;
  payload: AnthropicPresetPayload;
}> = {
  anthropic_2025_09: {
    metadata: { /* ... */ },
    payload: payload_2025_09 as AnthropicPresetPayload,
  },
  anthropic_2026_01: { /* ... */ },
  anthropic_2026_03: { /* ... */ },
};

export function getAnthropicPreset(id: AnthropicPresetId): AnthropicPresetPayload | null {
  if (id === null) return null;
  return ANTHROPIC_PRESETS[id]?.payload ?? null;
}

export function getAnthropicPresetMetadata(id: AnthropicPresetId): AnthropicPresetMetadata | null {
  if (id === null) return null;
  return ANTHROPIC_PRESETS[id]?.metadata ?? null;
}

export function listAnthropicPresets(): AnthropicPresetMetadata[] {
  return Object.values(ANTHROPIC_PRESETS).map(p => p.metadata);
}
```

**Why static imports**: Matches the BLS/BEA/FRED pattern in `src/data/loadGovernmentData.ts`. Vite bundles the JSON at build time. Bundle-size impact: each `processed.json` should be well under 100KB since we've compressed raw CSVs into per-cluster aggregates.

**Bundle sizing check**: estimate 51 clusters × ~200 bytes per cluster payload × 3 releases ≈ 30KB total. Negligible relative to the 847KB OEWS JSON already in the bundle.

**Exit criteria**: `ANTHROPIC_PRESETS` compiles. `listAnthropicPresets()` returns 3 entries.

---

### Phase 10.5: Simulation Integration — Applying the Preset

**Goal**: The simulation engine consumes the active preset during each year's computation. Semantically, preset application is "merge preset values into the effective cluster/role/trajectory data that simulation uses, with user explicit overrides winning."

**Merge priority (highest to lowest)**:
1. Per-year parameter overrides (`parameterOverrides` map in the store — already exists).
2. User overrides stored in `config` directly (e.g., `config.bfcsOverrides`, per-cluster overrides) — user has explicitly edited via UI.
3. Active Anthropic preset values (if preset is non-null).
4. Hand-authored defaults from `src/data/occupationClusters.ts` and `src/models/constants.ts`.

**New files**:
- `src/models/applyAnthropicPreset.ts` — pure function that takes hand-authored defaults and the preset payload, returns a merged effective state.

**Function signature**:

```typescript
/**
 * Merge an Anthropic preset into the default cluster list and capability trajectories.
 * Pure function: does not mutate inputs.
 */
export function applyAnthropicPreset(
  clusters: OccupationCluster[],
  trajectories: Record<CapabilityVectorId, CapabilityTrajectoryParams>,
  preset: AnthropicPresetPayload | null,
): {
  clusters: OccupationCluster[];
  trajectories: Record<CapabilityVectorId, CapabilityTrajectoryParams>;
} {
  if (preset === null) {
    return { clusters, trajectories };
  }

  const mergedClusters = clusters.map(cluster => {
    const override = preset.clusters[cluster.id];
    if (!override) return cluster;  // Cluster not covered by preset

    return {
      ...cluster,
      capabilityRelevance: {
        weights: {
          generative: override.capabilityWeights.generative,
          agentic: override.capabilityWeights.agentic,
          embodied: cluster.capabilityRelevance.weights.embodied, // preserved
        },
      },
      automationShare: override.automationShare,
      roles: cluster.roles.map(role => {
        const roleOverride = override.roles[role.id];
        if (!roleOverride) return role;
        return {
          ...role,
          aiReplacementDifficulty: roleOverride.aiReplacementDifficulty,
          bfcsThresholds: {
            ...role.bfcsThresholds,
            better: roleOverride.bfcsBetterThreshold,
          },
        };
      }),
    };
  });

  const mergedTrajectories = {
    ...trajectories,
    generative: {
      ...trajectories.generative,
      steepness: preset.trajectories.generative.steepness,
      midpointYear: preset.trajectories.generative.midpointYear,
    },
    agentic: {
      ...trajectories.agentic,
      steepness: preset.trajectories.agentic.steepness,
      midpointYear: preset.trajectories.agentic.midpointYear,
    },
    // embodied untouched
  };

  return { clusters: mergedClusters, trajectories: mergedTrajectories };
}
```

**Displacement formula change** (the only structural model modification):

In `src/models/displacement.ts` (or wherever displacement_pct is computed — per DATA_MODEL.md §4.1, quadratic formula):
- Current: `displacement_pct = adoption_rate × weighted_capability²`
- New: `displacement_pct = adoption_rate × weighted_capability² × effective_automation_share`
  - where `effective_automation_share = cluster.automationShare ?? 1.0`
- When `automationShare` is undefined (preset off / cluster not covered), result is identical to current (multiply by 1.0).
- When preset is on, displacement is dampened proportionally to the augmentation fraction (e.g., `automationShare = 0.4` → 40% of AI adoption translates to headcount reduction, 60% is augmentation / productivity boost on remaining workers).

**Integration point in `src/models/simulation.ts`**:
- Near the top of `runSimulation()`, after reading `config`, insert:

```typescript
const anthropicPreset = getAnthropicPreset(config.anthropicPreset);
const { clusters: effectiveClusters, trajectories: effectiveTrajectories } =
  applyAnthropicPreset(OCCUPATION_CLUSTERS, config.capabilities, anthropicPreset);

// Use effectiveClusters in place of OCCUPATION_CLUSTERS throughout runSimulation.
// Use effectiveTrajectories in place of config.capabilities where trajectories are read.
```

- `runSimulation()` already creates an `effectiveClusters` at Phase 5h for employment multiplier override; extend this to layer preset application on top.

**User override preservation**: `config.bfcsOverrides` is checked in `checkAdoptionTrigger()` after preset merge, so user overrides naturally win (they're applied later in the call chain).

**Tests** (`src/models/__tests__/applyAnthropicPreset.test.ts`):
- Preset null → identical clusters and trajectories (reference-equal not required, but deep-equal required).
- Preset applied → cluster not covered in preset is identical.
- Preset applied → cluster covered has its `generative` and `agentic` weights replaced; `embodied` preserved; weights sum to 1.0.
- User `bfcsOverrides` beat preset `bfcsBetterThreshold`.
- Golden-master test: full simulation with known preset produces a snapshot timeline; diff on regression.

**Exit criteria**:
- Toggling preset from `null` → `anthropic_2026_01` → `null` returns the timeline byte-identical to the initial null state.
- Full test suite passes (currently 999 tests; must still pass).

---

### Phase 10.6: Store Integration and Override Tracking

**Goal**: The Zustand store exposes the preset selection and tracks when a user has diverged from preset values (for the "Custom" indicator UX).

**Files to modify**:
- `src/stores/simulationStore.ts` — add state and actions.
- `src/hooks/useAnthropicPreset.ts` (new) — read hooks.

**Store additions**:

```typescript
// In SimulationState interface
interface SimulationState {
  // ... existing
  // No new top-level store state needed — anthropicPreset lives in config.
  setAnthropicPreset: (presetId: AnthropicPresetId) => void;
}

// In store implementation
setAnthropicPreset: (presetId) => {
  set((state) => {
    const newConfig = { ...state.config, anthropicPreset: presetId };
    return {
      config: newConfig,
      timeline: recompute(newConfig),
    };
  });
},
```

**`getDefaultSimulationConfig()` update**: add `anthropicPreset: null` to the returned object. This is the ONE line that changes user-facing default behavior — by setting to `null`, we preserve current behavior exactly.

**New hook** (`src/hooks/useAnthropicPreset.ts`):

```typescript
export function useAnthropicPreset() {
  const presetId = useSimulationStore(s => s.config.anthropicPreset);
  const setPreset = useSimulationStore(s => s.setAnthropicPreset);
  return {
    activeId: presetId,
    active: getAnthropicPresetMetadata(presetId),
    setPreset,
    availablePresets: listAnthropicPresets(),
  };
}
```

**`resetToDefaults()` update**: already resets `config` to `getDefaultSimulationConfig()`, so `anthropicPreset` gets reset to null automatically. No additional change needed.

**Per-section reset interactions**:
- `resetAICapabilities(config)`: currently resets `capabilities` and clears `bfcsOverrides`. Per preset design, **do not** reset `anthropicPreset` here — user may want to keep preset active while resetting their per-section overrides. The preset values will re-apply naturally.
- Same for all other per-section resets.

**Subtle issue**: What if a user has `anthropicPreset = anthropic_2026_01` and the AI-Capabilities reset triggers? Currently that function sets `capabilities: { ...defaults.capabilities }`. The default `capabilities` is `DEFAULT_CAPABILITY_TRAJECTORIES`. The preset's trajectory override is applied inside `applyAnthropicPreset()` — which is called during simulation — so even after reset, the preset's trajectory values come back in. Correct behavior: user's hand-edits to capability curves are wiped, but preset's baseline values are preserved. Document this.

**Exit criteria**: Store tests pass. `setAnthropicPreset('anthropic_2026_01')` triggers recomputation. `resetToDefaults()` clears the preset.

---

### Phase 10.7: UI — Global Preset Selector

**Goal**: A dropdown at the top of `ControlsPanel` (above `FiscalResponseSection`) that lets the user choose a preset.

**New files**:
- `src/components/controls/AnthropicPresetSelector.tsx`.

**Design** (matches existing `PolicyPresetSelector.tsx` pattern):

- Rendered as the **first element inside** the ControlsPanel's inner `<div className="p-5 space-y-4">` (line 241 of `ControlsPanel.tsx`), above `<FiscalResponseSection />`.
- Structure:
  - A labeled header row: "Data Baseline" with an InfoTooltip explaining what the selector does + the Claude-skew disclosure.
  - A select (or a vertical stack of radio buttons — matches ATLAS visual style better) with four options: `ATLAS Defaults`, `Anthropic AEI 2026-01`, `Anthropic AEI 2026-03`, and `Anthropic AEI 2025-09` (in that preference order).
  - When a non-null preset is active:
    - Gold accent border (matches active-preset pattern).
    - Secondary line showing release date, sample size summary, and `coverage.clustersWithData / 51` coverage.
    - A subtle "Coverage" expander showing which clusters are covered vs missing.
  - When null: no accent.

**Component props**: none — reads state via `useAnthropicPreset`.

**InfoTooltip text** (embedded in component):
> Selects the empirical data source for ATLAS's baseline AI-capability parameters. "ATLAS Defaults" uses hand-authored values calibrated from published benchmarks and reports. Anthropic presets anchor the baseline to observed Claude usage data; per the user directive, this data is extrapolated to all generative/agentic tasks economy-wide, accepting the Claude-user population skew. Embodied (robotics/AV) parameters remain hand-authored — Anthropic data does not cover physical work. All parameters remain individually overridable via section sliders below.

**Confirmation prompt when switching away from a preset**:
- If the user has any non-trivial user overrides stacked on the preset and selects a different preset, show a one-sentence inline notice: "Switching presets will rebase your overrides on new baseline values." This is a passive note — not a blocking modal.
- If the user selects `ATLAS Defaults` from any non-null preset, no notice needed (trivially reversible).

**Interaction flow**:
- User clicks a preset option → `setAnthropicPreset(id)` → store updates `config.anthropicPreset` → `recompute()` fires → timeline refreshes → all downstream UI updates reactively.

**Styling**: Uses existing Tailwind classes from `PolicyPresetSelector.tsx`. Gold accent `#D4A03C` for active state. Monospace 9-10px uppercase for labels.

**Exit criteria**: Component renders. Clicking options toggles preset. Visual regression test against `PolicyPresetSelector` style.

---

### Phase 10.8: UI — Per-Parameter Source Badges (Optional, Deferred)

**Goal**: Each slider/input in the ControlsPanel shows a small indicator of where its value came from (default / preset / user override).

**Status**: **Marked deferred** — worthwhile but not blocking. The Phase 10.7 global indicator is sufficient for the core UX. This phase is "nice to have" and can ship separately.

**Design sketch** (for the QA reviewer to evaluate):
- New component: `src/components/shared/ParameterSourceBadge.tsx`.
- A tiny 8px-font uppercase badge next to each parameter label.
- Three states: `DEFAULT` (gray), `AEI 2026-01` (gold, for whichever preset), `CUSTOM` (amber).
- Click to reset that single parameter to the preset/default value.

**Reason deferred**: Requires plumbing per-parameter provenance through `BFCSScoreBar`, `CapabilityControls`, `BFCSEditor`, etc. — ~20 components touched. Not strictly necessary for the user's stated goal.

**Decision needed from user**: Include this phase in the initial deliverable, or defer?

---

### Phase 10.9: Scenario System Updates

**Goal**: Saved scenarios remember which preset was active, so users can tell at a glance what a loaded scenario's baseline was.

**Files to modify**:
- `src/types/index.ts` — extend `SavedScenario`:

```typescript
interface SavedScenario {
  // ... existing
  /** Which Anthropic preset was active when the scenario was saved.
   *  Informational only — config values already reflect preset application.
   *  Null means ATLAS defaults were active. */
  anthropicPresetAtSave?: AnthropicPresetId;
}
```

- `src/utils/scenarios.ts` — `saveScenario()` captures `config.anthropicPreset` into the new field.
- `src/components/controls/ScenarioManager.tsx` — display the preset name on scenario cards.

**Load semantics**: When a scenario loads, `config.anthropicPreset` is restored from the saved config; the preset's effects are re-applied via the normal simulation path. This is automatic — no special load logic.

**URL share updates**: `encodeScenarioURL()` already encodes the full `config`, including `anthropicPreset`. No change needed.

**Backward compatibility**: Per project memory ("NO backward compatibility — product not launched"), we do not need to migrate existing saved scenarios. Any scenarios in localStorage that predate this change will load with `anthropicPreset = undefined`, which in the store layer is treated as `null` (via a one-line `?? null` guard in the load handler).

**Exit criteria**:
- Saving a scenario with a preset active preserves the preset ID.
- Loading such a scenario restores the preset as active.
- Scenario JSON export includes `anthropicPresetAtSave`.

---

### Phase 10.10: CSV Export and Presentation Mode Updates

**Goal**: The parameter timeline CSV export records which preset was active, and presentation mode shows it.

**Files to modify**:
- `src/utils/csvExport.ts` (or equivalent — the file that writes the 632-column CSV) — add a `Metadata` row-group or a metadata header comment that includes `# anthropic_preset: anthropic_2026_01` at the top.
- `src/components/layout/PresentationMode.tsx` — on slide 1 ("Scenario Overview"), add a line showing the active preset name and coverage fraction.

**Note**: Does not introduce new CSV columns — preset metadata goes in the header comment block (above the data rows), consistent with CSV conventions.

**Exit criteria**: CSV export includes preset marker in header. Presentation mode slide 1 reflects preset.

---

### Phase 10.11: Testing Strategy

**Goal**: Comprehensive test coverage that proves (a) preset off = current behavior, (b) preset application is deterministic and idempotent, (c) all edge cases handled.

**Test files to add**:
1. `src/data/anthropic/__tests__/anthropicTransform.test.ts` — unit tests for each transformation function.
2. `src/models/__tests__/applyAnthropicPreset.test.ts` — preset merge function tests.
3. `src/stores/__tests__/simulationStore.anthropicPreset.test.ts` — store integration tests.
4. `src/models/__tests__/simulation.anthropicPreset.test.ts` — full simulation integration tests.

**Critical test scenarios** (must all pass):

**Reversibility (the core invariant)**:
- Run simulation with `preset = null`. Save timeline.
- Run simulation with `preset = anthropic_2026_01`. Save timeline.
- Run simulation with `preset = null` again. Assert timeline is **byte-equal** to the first run.

**Idempotence**:
- `applyAnthropicPreset(A, T, null) === { clusters: A, trajectories: T }` (deep-equal).
- `applyAnthropicPreset(applyAnthropicPreset(A, T, P).clusters, applyAnthropicPreset(A, T, P).trajectories, P)` equals `applyAnthropicPreset(A, T, P)`.

**User override priority**:
- Preset active + `bfcsOverrides` set → simulation uses user override, not preset value.
- Per-year `parameterOverrides` set → those values used, not preset's.

**Coverage invariants**:
- For every preset, `coverage.clustersWithData + coverage.clustersMissing.length === 51`.
- Every cluster in `clustersMissing` has at least one SOC code in `CLUSTERS_WITHOUT_BLS_DATA` or is explicitly flagged (physical work: trucking, construction, etc.).

**Weight conservation**:
- After merge, every cluster's capability weights still sum to exactly 1.0 (within floating-point epsilon 1e-9).

**Embodied preservation**:
- For every cluster in every preset, `mergedCluster.capabilityRelevance.weights.embodied === handAuthoredCluster.capabilityRelevance.weights.embodied`.

**Zero-preset-no-field-leaks**:
- When `preset = null`, no reference to any preset's data appears in the computed timeline.

**CSV round-trip**:
- Export CSV with preset active. Import the CSV into a fresh store. Timeline matches the exported run.

**Snapshot tests**:
- For each preset, a snapshot of `timeline.summary` (the aggregate key metrics). Locks in expected simulation behavior. Run on CI.

**Performance test**:
- Preset application should add <2ms to simulation start. Measure via `performance.now()`.

**Exit criteria**: All new tests pass. Pre-existing 999 tests continue to pass. Total test count ~1030+ when this phase completes.

---

### Phase 10.12: Documentation

**Goal**: Documentation reflects the new system.

**Files to create**:
- `docs/ANTHROPIC_DATA_INTEGRATION.md` — complete spec of:
  - What the preset is.
  - Which parameters it touches (table from Decision 2 above).
  - Data provenance chain (raw CSV → transform → preset payload → simulation).
  - Extrapolation disclosure (Claude-user skew).
  - How to add a new release.
  - How to re-derive trajectory fits if sigmoid parameters change.

**Files to update**:
- `docs/DATA_MODEL.md` — add a new Section (e.g., §12 "Data Anchors and Presets") describing the preset layer and its interaction with the existing model.
- `docs/PHASES.md` — add Phase 10 summary.
- `CLAUDE.md` — add a line under "Tech Stack" or in an appropriate section noting that Anthropic AEI data is an optional empirical anchor.
- `src/models/constants.ts` — ensure any constants touched by the preset still have source citations including the Anthropic release.

**Exit criteria**: All docs updated. A new developer can read `ANTHROPIC_DATA_INTEGRATION.md` and understand the full pipeline without reading code.

---

## Critical Files Reference

Existing files modified:
- `src/types/index.ts` — add `AnthropicPresetId`, `AnthropicPresetPayload` types; extend `SimulationConfig`, `OccupationCluster`, `SavedScenario`.
- `src/models/simulation.ts` — invoke `applyAnthropicPreset()`; use returned `effectiveClusters` and `effectiveTrajectories`.
- `src/models/displacement.ts` — incorporate `automationShare` multiplier in displacement formula.
- `src/stores/simulationStore.ts` — add `setAnthropicPreset` action; update `getDefaultSimulationConfig()`.
- `src/components/layout/ControlsPanel.tsx` — mount `<AnthropicPresetSelector />` at line 243 (above `<FiscalResponseSection />`).
- `src/utils/scenarios.ts` — capture preset ID on save.
- `src/components/controls/ScenarioManager.tsx` — display preset name on scenario cards.
- `src/components/layout/PresentationMode.tsx` — slide 1 shows preset.
- `src/utils/csvExport.ts` — preset in CSV header comment.
- `docs/DATA_MODEL.md`, `docs/PHASES.md`, `CLAUDE.md` — documentation updates.

New files created:
- `scripts/fetch-anthropic-data.ts`
- `scripts/transform-anthropic-data.ts`
- `src/data/anthropic/anthropicCSVParse.ts`
- `src/data/anthropic/anthropicTransform.ts`
- `src/data/anthropic/presets.ts`
- `src/data/anthropic/2025-09-15/raw/*.csv`
- `src/data/anthropic/2025-09-15/processed.json`
- `src/data/anthropic/2025-09-15/metadata.json`
- (Same for 2026-01-15 and 2026-03-24)
- `src/models/applyAnthropicPreset.ts`
- `src/components/controls/AnthropicPresetSelector.tsx`
- `src/hooks/useAnthropicPreset.ts`
- `src/data/anthropic/__tests__/anthropicTransform.test.ts`
- `src/models/__tests__/applyAnthropicPreset.test.ts`
- `src/stores/__tests__/simulationStore.anthropicPreset.test.ts`
- `src/models/__tests__/simulation.anthropicPreset.test.ts`
- `docs/ANTHROPIC_DATA_INTEGRATION.md`
- `docs/ANTHROPIC_DATA_SURVEY.md` (from Phase 10.0)

Existing utilities reused (no duplication):
- `scripts/fetch-utils.ts` — `sleep`, `writeJSON` for ingestion script.
- `src/data/socMapping.ts` — `OEWS_TO_CANONICAL_CLUSTER_ID`, `CLUSTERS_WITHOUT_BLS_DATA` for cluster mapping.
- `src/data/loadGovernmentData.ts` — pattern for static JSON imports.
- `src/components/controls/PolicyPresetSelector.tsx` — visual pattern for new preset selector.
- `src/utils/scenarios.ts` — existing save/load harness; extend, don't replace.

---

## Risk Register

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| 1 | Anthropic schema changes in a future release break transform | Medium | Survey doc + schema validation at transform time. Versioned per-release transform paths. |
| 2 | O\*NET-SOC 8-digit to 6-digit mapping loses information (e.g., `15-1232.00` vs `15-1232.01` have different automation signals) | Low-Medium | Document the aggregation rule; use `task_pct`-weighted sum to proportionally weight. Track via `coverage.tasksAggregated`. |
| 3 | Preset diverges from current defaults enough that existing scenario files produce visibly different simulations when preset is activated | Expected | Not a bug — this is the point of the preset. Document in scenario cards: "Originally built on [preset name]". |
| 4 | Capability trajectory sigmoid fit produces physically unreasonable values (e.g., `midpointYear = 2099`) when data is too sparse | Medium | Clamp to `[2028, 2045]`; fall back to hand-authored defaults when clamping triggers. Log warning, surface in UI. |
| 5 | Bundle size bloat from 3 preset payloads | Low | Estimated <100KB total. Well below existing 847KB OEWS chunk. |
| 6 | Preset-on state causes subtle test failures in existing tests that assume hand-authored defaults | High | **Explicit safeguard**: `getDefaultSimulationConfig().anthropicPreset = null`. Every existing test uses default config, so preset is off by default. Verify via test run before and after each phase lands. |
| 7 | User confused by "custom" vs "preset" distinction | Medium | InfoTooltip on selector; visible indicator of which parameters diverge from preset; deferred Phase 10.8 source badges address this. |
| 8 | User selects a preset and expects future years' predictions to change immediately; they don't because trajectories are fit to past data | Medium | Tooltip on selector explicitly states: "Present-year anchor + trajectory calibration from past data; the future is still projected." |
| 9 | Merge priority interaction with `parameterOverrides` (Phase 8b) is subtle — both operate on overlapping state | High | Explicit test (Phase 10.11): preset + override coexistence. Document in `DATA_MODEL.md`. |
| 10 | HuggingFace download URL or API changes | Low | Script logs the full URL; manual fallback is trivial (download CSV via browser, drop into `raw/`). |
| 11 | Anthropic's pseudo-coverage heuristic (Sept 2025 path) gives systematically different values than published effective-coverage (Jan 2026+). Cross-release user comparisons become apples-to-oranges | Medium | Document clearly in survey doc. Prefer Jan 2026 and later releases. |
| 12 | B\* back-derivation is circular — it uses current capability scores, which may themselves be adjusted by the preset | Medium | Compute B\* using **hand-authored capability defaults** at t=2025, not preset-adjusted. Document explicitly. |
| 13 | `automationShare` dampens displacement, which affects macro feedback loops. Existing tuning of policy responses assumes non-dampened displacement | High | Full-simulation snapshot tests; expect modest CWI / unemployment shifts; verify no new numerical instabilities. If severe, consider exposing `automationShare` as a per-cluster slider. |
| 14 | Preset's embodied-preservation could leave inconsistent weights if hand-authored embodied weight for a cluster is very high (>0.8) and generative/agentic are being recalibrated. Could yield total weight >1.0 if logic has a bug | Low (with correct normalization) | Unit test: for every cluster × preset, weights sum to 1.0 exactly. |
| 15 | Preset data files grow large as Anthropic adds releases. Static imports bloat bundle | Low | Future: switch to dynamic import with code-splitting if file count exceeds ~10. Not needed at 3. |

---

## Open Questions for QA / User Decision

1. **Include Phase 10.8 (per-parameter source badges) in initial deliverable, or defer?** Default recommendation: defer. Can ship independently once the core flow works.
2. **Which preset is the recommended default when users first see the selector?** Current plan: highlight "Anthropic AEI 2026-01" with a subtle "recommended" indicator, but leave `null` as the actual default to preserve current behavior on first launch. Alternative: set `Anthropic AEI 2026-03` (the latest) as default. Decision needed.
3. **How prominent should the Claude-skew disclosure be?** Options: (a) in InfoTooltip only; (b) InfoTooltip + inline subtitle on selector; (c) a one-time dismissible info banner on first preset activation. Current plan: option (b). Confirm.
4. **Should the preset also calibrate `wageElasticity` per cluster?** Clusters with high Anthropic-observed automation likely have higher wage elasticity (commoditized work). Could add, but not in initial scope per user directive (they mentioned capability and BFCS only). Decision: out of scope unless QA recommends otherwise.
5. **Preset-on indicator on the app header / data freshness badge?** Current plan: yes, add a compact "AEI 2026-01" badge next to the BLS freshness badge in Header. Low cost, high visibility. Confirm.

---

## Verification — How to Test End-to-End

After implementation lands:

1. **Fresh install test**: Delete `src/data/anthropic/`. Run `npx tsx scripts/fetch-anthropic-data.ts`. Verify all files appear. Run `npx tsx scripts/transform-anthropic-data.ts`. Verify `processed.json` for all 3 releases.

2. **Byte-identical null state**: Run full simulation with `anthropicPreset = null`. Export CSV. Switch preset to `anthropic_2026_01`, then back to `null`. Re-export CSV. `diff` the two exports — must be zero.

3. **Preset activation smoke test** (manual browser):
   - Load app. Verify ATLAS Defaults is selected. Verify no AEI badge on header.
   - Click `Anthropic AEI 2026-01`. Verify:
     - Gold accent appears on selector.
     - Header badge appears.
     - Key metrics in InsightsPanel change (specifically `total_displaced_2040`, `unemployment_rate_2040`, `CWI_2040`).
     - BFCS scores in OccupationBrowser change for at least 30 of 51 clusters.
     - Robotics/trucking/construction BFCS scores are **unchanged** (embodied preservation).
   - Click `ATLAS Defaults`. Verify metrics return to original values.

4. **User override persistence**: Enable preset. Manually override a BFCS threshold for `tech_swe` via `BFCSEditor`. Switch to a different preset. Verify the user override is preserved.

5. **Scenario save/load**: Save a scenario with preset active. Change preset. Load the scenario. Verify preset returns to saved state.

6. **URL share**: Copy share URL with preset active. Open in incognito. Verify preset is applied.

7. **CSV export includes preset marker**: Export CSV. Open first 10 lines. Verify `# anthropic_preset: anthropic_2026_01` appears in header.

8. **Test suite**: Run `npm test`. Verify all tests pass (target: 1030+ tests).

9. **TypeScript check**: Run `tsc --noEmit`. Zero errors.

10. **Performance**: Time a simulation run with preset on vs off. Verify <5ms difference (preset merge is a single array map).

11. **Bundle size**: `npm run build`. Confirm main bundle grew by <150KB.

12. **Presentation mode**: Enter presentation mode with preset active. Verify slide 1 shows preset name.

**Success definition**: All 12 steps pass, documentation is complete, and a reviewer can read `docs/ANTHROPIC_DATA_INTEGRATION.md` and predict the behavior of any user action involving the preset.
