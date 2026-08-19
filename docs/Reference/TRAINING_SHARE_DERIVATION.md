# The Training Share of AI Compute — Derivation (time-varying)

**What this is.** The simulation grounds frontier AI progress in physical computing
capacity: capability advance rides the *training slice* of datacenter capacity, and
the supply-side throttle engages when built capacity falls below that slice of the
requirement. This artifact derives the training slice's share of total AI compute
demand as a function of time. It replaces a fixed constant: the share now starts at
the measured-era anchor and grows along the reinforcement-learning scaling path, so
sustained growth in reinforcement-learning compute strengthens the coupling between
what the economy finances and how fast capability advances.

**Definition (ruled, 2026-08-17).** The training slice includes pretraining AND
reinforcement-learning compute — explicitly including reinforcement-learning *rollout*
(inference-shaped) compute. Rollout compute is generated in service of capability
training; it belongs to the training slice regardless of its hardware signature.

## The form

```
trainingShare(t) = CAP − (CAP − S₀) × exp(−g × (t − 2025))
S₀  = 0.40      (the 2025 anchor)
CAP = 0.60      (the saturation ceiling; honest band 0.40–0.75)
g   = 0.15/yr   (the convergence rate; ≈ half the remaining gap closes every ~4.6 yr)
```

Properties: `trainingShare(2025) = S₀` exactly (the seam is preserved bit-for-bit);
strictly increasing; asymptote `CAP < 1` (the share can never exhaust total compute —
deployment demand grows alongside training by construction).

## The anchors

1. **The 2025 anchor S₀ = 0.40** — the training-versus-inference split of frontier AI
   compute in the 2024–25 operating era clusters in the 20–40% range for frontier
   operators (training-heavy labs at the top of the range; inference-heavy deployment
   pushes the fleet-wide average down). Status: honest-uncertainty seam constant,
   carried from the Stage-1 build and now the derivation's anchor (citation addendum
   row 44).
2. **Reinforcement learning is small today** — DeepSeek-R1's reinforcement-learning
   stage ran ≈ 147K H800 GPU-hours against ≈ 2.8M for the V3 base model's
   pretraining, ≈ 5% (recorded range 3.75–5%); open-model reasoning stages
   measure smaller still (Llama-Nemotron ~1e23 FLOP, <1% of pretraining;
   Phi-4-reasoning <0.01%). Citation addendum rows 41/43.
3. **Reinforcement-learning compute is scaling >10× per frontier generation**
   (o1→o3 class; Grok-3→Grok-4 class — row 42). At >10× per ~2-year generation
   against pretraining's ~3–5× per generation, the reinforcement-learning share of
   the training slice moves from ~5% toward parity with pretraining within two to
   three generations — the training slice's growth rate exceeds pretraining's alone
   by a factor that starts near 1 and rises toward ~2× per generation.
4. **Deployment compute grows alongside** (adoption-driven inference), so the SHARE
   moves much more slowly than reinforcement-learning compute itself: the net drift
   is the training slice's excess growth over total demand. The convergence constant
   `g = 0.15/yr` expresses "roughly two generations (~4–5 years) to close half the
   gap to the ceiling" — the pace the >10×/generation amplification supports once the
   reinforcement-learning share is material, discounted for deployment's own growth.
   Status: derived-with-band; the frontier's disclosure gap is real and stated
   (honest-uncertainty at the frontier — row 42).

## Saturation — what exhausts the growth

The share cannot exceed 1 trivially; it saturates BELOW 1 (CAP = 0.60) because the
same frontier budgets that scale reinforcement learning also scale deployment:
inference demand grows with adoption and with reasoning-style inference itself
(deployed chains of thought are deployment, not training). A world where training
crowds out deployment entirely would be a world with no revenue to finance training —
the finance block (Channel 1) closes that loop. The band on CAP (0.40–0.75) carries
the honest uncertainty: at 0.40 the share never grows (the static Stage-1 reading);
at 0.75 reinforcement-learning scaling dominates the fleet.

## Consequence in the engine

`u_supply = min(1, capacityDc / (trainingShare(t) × dcRequired))` — a rising share
makes the capability-supply gate engage earlier and harder: sustained
reinforcement-learning scaling grows the training slice toward deployment scale IN
THE DATA, strengthening finance-grounding of capability endogenously. This is the
empirical path of the registered "frontier-finance coupling strength" belief.

## Boundary vs axis N1 (no double-belief)

N1 owns capacity COSTS (chip $/FLOP, energy $/MWh, datacenter $/MW trajectories).
This share is a COMPOSITION of compute demand, not a cost; N1 variants do not move
it, and it does not move N1's cost curves. (The FLOPs-per-watt precedent:
`docs/Reference/FLOPS_PER_WATT_DERIVATION.md` — derived curves are not dials.)

**Dial status (honest):** derived, not user-adjustable this stage; the band above is
the range a future surfacing would carry. Implementation:
`src/models/buildout.ts → trainingShare()`; constants
`BUILDOUT_TRAINING_SHARE_2025 / _CAP / _CONVERGENCE` (`src/models/constants.ts`).
