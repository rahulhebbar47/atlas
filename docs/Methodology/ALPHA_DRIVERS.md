# ATLAS — Alpha (α) Drivers

The automation share `α ∈ [0, 1]` is an explicit per-cluster quantity (with optional
per-role override), driven by five signals. It replaces an earlier squared-capability proxy
that conflated capability with the deployment choice. Decision record: [the audit summary](../FABLE_AUDIT_SUMMARY.md).

---

## Concept

`α` is the deployment-mode choice: *of the AI capability that can be used, how much goes into replacing workers vs augmenting them?*

- α = 1.0 means 100% of adoption takes the replacement path (capability × adoption → displacement).
- α = 0.0 means 100% of adoption is augmentation (capability × adoption → higher output per remaining worker, not fewer workers).
- α is clamped to `[0, 1]`.

The formula separates "can we do it?" (capability) from "are we choosing to replace?" (α — the deployment-mode choice, previously implicit in a squared-capability term):

```
displacement = adoption × weightedCapability × α     (V2)
```

---

## The Five Drivers

α is computed per role per year as:

```
α = clamp01(
        baseline
      + capabilityW × sigmoid((weightedCapability - activationThreshold) × 6)
      + trustW      × (1 - exp(-yearsSinceTrigger / halfLife))
      + competitiveW × max(0, peerAlpha - baseline)
      + marginW     × max(0, baselineMargin - currentMargin) / baselineMargin
      - slackW      × max(0, unemploymentRate - naturalRate) × 5
    )
```

Each driver captures a different force:

| Driver | Intuition | Sign | Data source |
|---|---|---|---|
| **Capability** | AI has to be capable enough for replacement to be worthwhile | + | Current year's capability scores |
| **Trust** | Observed reliability accumulates once the role triggers | + | Years since effective trigger year |
| **Competitive** | Peer clusters' prior-year α creates competitive pressure | + | `priorYearAlphaByCluster` (employment-weighted, excludes self) |
| **Margin** | Corporate margin compression pushes firms to replace vs augment | + | `previousMacro.corporateMarginRatio` |
| **Slack** | Labor market slack makes workers cheaper → less urgency to replace | − | `previousMacro.unemploymentRate − NAIRU` |

Default weights: `capability=0.20, trust=0.15, competitive=0.25, margin=0.15, slack=0.10`. All user-adjustable via `config.alphaDriverParams`.

### Baselines

Cluster-level `automationShare` seed comes from `initializeClusterAlphaDefaults`:

- Embodied clusters use `EMBODIED_CLUSTER_ALPHA_DEFAULTS` (e.g., trucking 0.85, surgery 0.20).
- Cognitive clusters default to `DEFAULT_COGNITIVE_ALPHA = 0.5`.

Runtime overrides flow through `config.clusterAutomationShareOverrides[clusterId]` and `config.roleAutomationShareOverrides[clusterId][roleId]`.

---

## Peer α — The One-Year Lag

The competitive driver reads `priorYearAlphaByCluster` — a frozen snapshot of last year's α across every cluster in the same category, excluding self. This lag is deliberate:

1. **Avoids runaway self-reinforcement.** If the competitive term read *this year's* α, a cluster's own α would feed back into itself within a year; high-α clusters would amplify.
2. **Realistic observation latency.** Firms respond to what competitors did last year, not what they're doing right now.
3. **Order-independent simulation.** Snapshot + commit after cluster loop means iteration order doesn't affect results.

The peer exclusion is enforced in `computePeerAlpha` via `filter(p => p.id !== self)`.

---

## Worked Example: SWE Cluster, 2030

Hypothetical scenario: `tech_swe.junior_mid` role at year 2030, after triggering in 2028.

| Term | Value | Notes |
|---|---|---|
| baseline | 0.50 | DEFAULT_COGNITIVE_ALPHA |
| capability contribution | +0.20 × sigmoid((0.75 − 0.60) × 6) | weightedCapability hits 0.75 → sigmoid(0.9) ≈ 0.71 |
| | +0.142 | |
| trust contribution | +0.15 × (1 − exp(−2/5)) | 2 years past trigger, half-life = 5 |
| | +0.0495 | |
| competitive contribution | +0.25 × max(0, 0.72 − 0.50) | prior-year peer α = 0.72 (tech_data_ml, tech_qa ahead) |
| | +0.055 | |
| margin contribution | +0.15 × (max(0, 0.12 − 0.09) / 0.12) | corporate margins compressed to 0.09 |
| | +0.0375 | |
| slack contribution | −0.10 × (0.068 − 0.044) × 5 | unemployment at 6.8% |
| | −0.012 | |
| **α** | **clamp01(0.50 + 0.142 + 0.0495 + 0.055 + 0.0375 − 0.012) = 0.772** | |

SWE displacement this year = `adoption × weightedCapability × 0.772`. The replacement path dominates strongly over the augmentation path.

---

## Per-Cluster Wage Feedback (Scarcity → Next Year's Cheaper)

A tight feedback loop connects this year's displacement to next year's adoption economics:

1. Cluster displacement → cluster has residual "scarcer" workers in high-difficulty roles.
2. `computeClusterScarcityPremium` computes `wageAdjustmentFromScarcity = aiDisplacementShare × scarcityIntensity × clusterWagePremium`.
3. `priorYearWageAdjustmentByCluster` persists this value.
4. **Next year**, `computeCheaperScore` reads the prior-year adjustment and multiplies `humanCostFactor × (1 + wageAdjustment)` — making AI relatively more attractive when the cluster has scarce high-difficulty workers.

This closes the loop: displacement → scarcity → wage pressure in the cluster → higher Cheaper score → more adoption → more displacement. The **one-year lag is the damping mechanism**. No smoothing is applied; oscillation (if any) is surfaced explicitly in the sanity-table diagnostics rather than silently damped.

---

## Editorial Defaults Awaiting Empirical Calibration

The per-role `aiReplacementDifficultyFriction` and `aiReplacementDifficultyWagePremium` tables in `constants.ts` are ATLAS-authored editorial judgments. They rate four friction factors (regulatory, liability, licensure, cultural) and five wage-premium factors (care element, relational trust, judgment residual, binary-outcome as negative, functional-output as negative). A future phase will calibrate these against the Anthropic Economic Index (AEI) data.

Until then, the defaults are the source of truth; users override per role via the UI.
