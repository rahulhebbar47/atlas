# The credit impulse sensitivity — derivation from the 2008 episode citation

**Status: [e — derived from the citation basis].** This is the working derivation of
`creditDeflationImpulseSensitivity` (default 0.007). It is arithmetic on the shipped
level constant's own citation, not a new calibration; the proper episode table (FRED
CPI 2008–09 plus the Federal Reserve's Senior Loan Officer Opinion Survey series) is
registered to the data program as this anchor's upgrade path.

## What is being derived

The retired level form emitted deflation from the *level* of consumer-credit
tightening every year it persisted. Its constant carries the citation "2008 crisis
calibration — credit contraction of ~40% produced ~2% deflation"
(`src/models/constants.ts`, at `DEFAULT_CREDIT_DEFLATION_SENSITIVITY`). That ~2% is
an **episode total**, not an annual rate — the level form mis-applied it as a
per-year emission for as long as tightening persisted. The pass-through law re-reads
the same citation on its natural basis: the whole episode's tightening *change*
produced about two points of price-level decline.

## The reference episode path

Constructed from the same calibration's terms: consumer tightening rises from 0 to
0.5 (the Great-Recession peak, `CONSUMER_TIGHTENING_GR_PEAK`) over two years, holds
one year, and eases back over two — the shape of the 2008–10 loan-standards cycle
the level constant's calibration described.

## The arithmetic

With the noise floor `T_noise = 0.05` and persistence `κ = 0.5`:

```
above-floor tightening change per ramp year:  ΔT_sig = (0.5 − 0.05) / 2 = 0.225
in GR units (÷ 0.5):                          0.45 per ramp year
kernel state J:   year 1: 0.45   year 2: 0.45 + 0.5×0.45 = 0.675   hold year: 0.3375
tightening-phase kernel mass:                 Σ J ≈ 0.45 + 0.675 + 0.34 ≈ 1.46

band (level) component during the phase:      −(0.05/0.5) × 0.04 × ~2.5 yr ≈ −1.0 pp
target episode total (the citation):          ≈ −2.0 pp during the tightening phase
impulse budget:                               −2.0 − (−1.0) = −1.0 pp

impulseSensitivity = 1.0 pp / 1.46 ≈ 0.0068 ≈ 0.007
```

The A8 belief ladder carries its existing ratios onto the new dial: Contained 0.0035,
Consensus 0.007, 2008-replay 0.014, Doom-spiral 0.021.

## What this preserves and what it changes

During a tightening phase of the reference shape, the new machinery produces
Great-Recession-scale deflation — the anchor behavior, asserted by the episode
battery. What dies is the plateau: a standing tightening level no longer emits
crisis-scale deflation year after year; it decays at κ toward the small capped band
component. Easing produces the symmetric reflation impulse.
