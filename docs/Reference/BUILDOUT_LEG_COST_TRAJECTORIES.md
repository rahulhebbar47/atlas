# Buildout Leg Cost & Availability Trajectories — Data Artifact

Per-leg unit-cost and availability evidence for the AI buildout capacity machine's three
legs (design checkpoint §1.2) and for the N1 buildout-cost-trajectory axis (§4). Every
value carries its citation status per the per-value verification pass; values marked
[web-verified 2026-08-15] were re-checked against their sources this stage.

## Leg 1 — Chips ($/FLOP)

| Quantity | Value | Source / status |
|---|---|---|
| FLOP/$ doubling time, general-purpose GPUs (2006–2021, 470 GPUs) | ~2.5 years (~32%/yr price-performance improvement) | Epoch AI, "Trends in GPU price-performance" [web-verified 2026-08-15] |
| FLOP/$ doubling time, ML-class GPUs | ~2.1 years | same source [web-verified 2026-08-15] |
| Per-dollar compute improvement across 20+ AI accelerators, 2012–2025 | ~40%/yr | Epoch AI hardware-trends series [web-verified 2026-08-15] |
| Depreciation δ_chips | 3–5-year hardware cycles → δ ≈ 0.20–0.33/yr | industry accounting practice for accelerators; consistent with the AI-sector-labor-share comment (`constants.ts:884`, "GPU/accelerator 3–5yr cycles") [cited-practice] |

N1 anchor: the "cited-learning-rates-continue" variant's chips leg = 2.1–2.5-year
doubling continued; the "supply-constrained stagnation" pole = the decline stalling
(export-control/fab-concentration episodes); the "breakthrough" pole = step-faster
[honest-uncertainty].

## Leg 2 — Energy ($/MWh + availability)

| Quantity | Value | Source / status |
|---|---|---|
| Interconnection queue duration (request → commercial operation) | median ~5 years for 2023-completed projects; ~55 months average for 2024-completed | LBNL "Queued Up" 2024/2025 editions (emp.lbl.gov/queues) [web-verified 2026-08-15] |
| Active capacity in interconnection queues, end-2024 | ~2,290 GW (≈ 2× the existing US fleet); ~1,400 GW generation + ~890 GW storage | LBNL "Queued Up" 2025 edition [web-verified 2026-08-15] |
| Queue-duration trend | <2 years (2000–2007 builds) → >4 years (2018–2023 builds) | LBNL "Queued Up" [web-verified 2026-08-15] |
| $/MWh levels and declines by source | EIA Annual Energy Outlook LCOE tables; Lazard LCOE series (solar/wind learning-rate declines, gas roughly flat) | [cited-source class; the level table below fixes the vintage] |
| Depreciation / asset life δ_energy | multi-decade generation & grid assets (≈ 30-year class) → δ ≈ 0.03; interconnection lead times enter as AVAILABILITY (the queue numbers above), not as depreciation | [cited-practice + LBNL] |

The availability sub-series (queue duration) is the citable constraint for the energy
leg's buildout LAG: capacity ordered is capacity delivered ~4–5 years later under
current-regime beliefs. N1 variants move this lag and the cost trend together as one
coherent worldview.

## Leg 3 — Datacenters ($/MW)

| Quantity | Value | Source / status |
|---|---|---|
| Standard build cost | ~$10–12M per MW (2024–25) | industry cost surveys (Cushman & Wakefield development-cost guide class; corroborating industry benchmarks) [web-verified 2026-08-15] |
| AI-optimized build cost | ~$20M+ per MW | same family [web-verified 2026-08-15] |
| Global shell-and-core average | ~$10.7M per MW (2025), ~+6% forecast into 2026 | industry benchmark series [web-verified 2026-08-15] |
| Historical learning rate | THIN literature; recent trend is UPWARD (demand pressure), not a learning decline | **[honest-uncertainty; the capacity-cost worldview variants state DC trajectories as beliefs, not citations]** |
| Depreciation δ_dc | DC shells/structures multi-decade (25–40-year class) → δ ≈ 0.03–0.05; the MEP fit-out (~40–50% of budget) turns over faster | [cited-practice; the split refinement is a Stage-1 design note] |

## Cross-leg note (one machine per phenomenon)

The supply-chain block's `trainingDynamics` per-leg trend parameters (chips/energy/DC
techDeclineRate + scalePressure) and A2's `manufacturingAnnualChange` /
`energyAnnualChange` keys are the two EXISTING leg-trend surfaces; both merge into N1 at
one axis owner. This artifact is the evidence base those worldview variants
cite; it does not itself change any engine value.

---

## Energy leg — $/MWh LEVEL TABLE (source-read from Lazard LCOE+ v18.0, June 2025 report, p.8–10)

Unsubsidized levelized cost of energy, new build, $/MWh (Lazard's ranges; midpoints are
range centers unless noted):

| Technology | Unsubsidized LCOE range | With federal subsidies (p.9) | Notes |
|---|---|---|---|
| Solar PV — utility | **$38 – 78** | ITC $24–57 / PTC $20–45 | cheapest new-build class |
| Wind — onshore | **$37 – 86** | PTC $15–75 | |
| Solar + storage — utility | $50 – 131 | ITC $33–111 | the firmed-renewable class |
| Gas combined cycle | **$48 – 109** | — | fuel ±25% → $41–116; HIGH CASE reflects post-2028-COD CCGT capex quotes of $2,400–2,600/kW — the gas-turbine-backlog cost pressure, stated by Lazard |
| Gas peaking | $149 – 251 | — | |
| U.S. nuclear (new) | $141 – 220 | — | Vogtle-based; learning-curve sensitivity to ~$228 |
| Coal | $71 – 173 | — | |
| Geothermal | $66 – 109 | ITC $44–93 | |
| Wind — offshore | $70 – 157 | PTC $52–141 | |

**Status: [source-read 2026-08-17 — the v18.0 PDF's comparison pages read directly].**
Decline-path context: the 2025 report records gas-fired generation at a 10-year-high
LCOE (capex + fuel), while utility solar/onshore wind remain the cheapest new build —
N1's "cited-learning-rates-continue" variant carries renewable declines continuing with
gas flat-to-rising; the "supply-constrained stagnation" pole carries the CCGT-backlog
capex elevation generalizing. EIA AEO LCOE remains the secondary anchor (registered;
vintage to be pinned when the next AEO cycle publishes — the Lazard table above is the
citable level set for the build).
