# FLOPs-per-Watt Efficiency Curve — Derivation Artifact

This artifact derives the compute-energy-efficiency curve `FLOPsPerWatt(t)` used by the
energy leg of the AI buildout capacity machine (design checkpoint §1.2). The curve is
DERIVED from cited efficiency data — it is not a user dial. Committed per the
`GR_CREDIT_IMPULSE_DERIVATION.md` precedent: the parameter's value is traceable to its
sources here, and any future change re-derives through this document.

## What it is, plainly

Computing hardware gets more energy-efficient over time: the same watt of power drives
more computation each year. In the buildout machine, the energy leg's stock is powered
capacity; multiplying by this efficiency curve converts watts into compute so the
three legs (chips, energy, datacenters) are commensurable and their minimum is the
honest physical capacity.

## The cited record

| Source | Finding | Vintage |
|---|---|---|
| Koomey et al. (2011), "Implications of Historical Trends in the Electrical Efficiency of Computing", IEEE Annals of the History of Computing (and updates) | Computations per joule doubled every ~1.57 years for ~a half-century; after 2000 the doubling slowed to ~2.6 years (end of Dennard scaling) | historical record through ~2010s; slowdown well-replicated |
| Epoch AI, "Trends in Machine Learning Hardware" (epoch.ai) | GPU/accelerator energy efficiency (FLOP/s per W) has doubled every ~2.4 years on average since 2008 | web-verified 2026-08-15 |
| Epoch AI, "Trends in GPU price-performance" (epoch.ai/blog/trends-in-gpu-price-performance) | Companion price-performance series (FLOP/$ doubling ~2.1 yr ML GPUs / ~2.5 yr general), context for the hardware-trend family | web-verified 2026-08-15 |

## The derived form

```
FLOPsPerWatt(t) = FPW_anchor × 2^((t − t_anchor) / T_double)
T_double = 2.5 years   [derived: the midpoint of Epoch's measured 2.4 (accelerators
                        since 2008) and Koomey's post-Dennard 2.6; honest range 2.3–2.6]
```

- **T_double = 2.5 years** is the citable center; the Stage-1 build carries the range
  [2.3, 2.6] as the parameter's honest uncertainty band (a sensitivity check in the
  Channel-1 dose-response battery, not a user dial).
- **FPW_anchor** (the absolute level at t_anchor = the simulation start year) is fixed
  at build in the engine's chosen capacity units from current-generation accelerator
  specifications ([spec-derived]; the CURVE SHAPE is what this artifact derives — the
  anchor is a unit convention, and the three-leg min is invariant to a common unit
  rescaling).
- **Slowdown honesty:** both sources record a post-2000 slowdown; extrapolating 2.5-year
  doubling to 2050 is an extrapolation of the post-Dennard regime, stated here. The N1
  buildout-cost axis does NOT move this curve (efficiency is physics-trend, not a cost
  belief); a future efficiency-belief axis would be a separate design decision.

## Named values (the per-value citation pass)

| Parameter | Value | Status |
|---|---|---|
| T_double | 2.5 yr (range 2.3–2.6) | [cited-derived: Epoch 2.4 / Koomey post-2000 2.6; web-verified 2026-08-15] |
| FPW_anchor | fixed at build | [spec-derived; unit convention] |

Implementation pointer: enters in the three-leg capacity machine
(`Capacity = min(S_chips, S_energy × FLOPsPerWatt(t), S_dc)`), design checkpoint §1.2.
