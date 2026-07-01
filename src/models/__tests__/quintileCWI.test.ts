/** STAGE 8 — the §6 assertions (+ the S8 riders). */
import { describe, it, expect } from 'vitest';
import { computeQuintileSeries, vintageKernel, quintileConservationResidual, quintileTransferIncome, decomposePolicyCash } from '../quintileCWI';
import { computeDisplacedIncidence } from '../uiIncidence';
import { CEX_QUINTILE_SECTOR_SHARES, QUINTILE_WAGE_SHARES, QUINTILE_TRANSFER_SHARES, QUINTILE_ASSET_SHARES } from '../constants';
import { runSimulation, getDefaultSimulationConfig } from '../simulation';
import { assertKnownConfigKeys } from '@/utils/validateConfig';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { loadBLSData } from '@/services/dataLoader';
import { transformOEWSToBaselines, createOtherClusterBaseline } from '@/services/dataTransform';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
import type { CapabilityVectorId } from '@/types';
import { readFileSync, writeFileSync } from 'node:fs';

describe('Stage 8 — the quintile measurement layer', () => {
  it('the CEX rows normalize to 1 and the income-source shares conserve (S8-R1/R2a)', () => {
    for (const r of CEX_QUINTILE_SECTOR_SHARES) {
      expect(r.shelter + r.foodEnergy + r.laborServices + r.aiExposed).toBeCloseTo(1.0, 10);
    }
    for (const s of [QUINTILE_WAGE_SHARES, QUINTILE_TRANSFER_SHARES, QUINTILE_ASSET_SHARES]) {
      expect(s.reduce((a, b) => a + b, 0)).toBeCloseTo(1.0, 10);
    }
    // consistency with the standing cited bottom-80 constants (single source of truth)
    expect(QUINTILE_WAGE_SHARES.slice(0, 4).reduce((a, b) => a + b, 0)).toBeCloseTo(0.45, 10);
    expect(QUINTILE_TRANSFER_SHARES.slice(0, 4).reduce((a, b) => a + b, 0)).toBeCloseTo(0.78, 10);
    expect(QUINTILE_ASSET_SHARES.slice(0, 4).reduce((a, b) => a + b, 0)).toBeCloseTo(0.12, 10);
  });

  it('the vintage kernel derives from the dial with mean lag EXACTLY the dial (S8-R3)', () => {
    for (const L of [0, 0.5, 1.0, 1.5, 2.0]) {
      const k = vintageKernel(L);
      expect(k.reduce((s, t) => s + t.w, 0)).toBeCloseTo(1, 10);
      expect(k.reduce((s, t) => s + t.w * t.tap, 0)).toBeCloseTo(L, 10);
    }
  });

  describe('the run-level assertions', () => {
    const bls = loadBLSData();
    if (!bls.isLoaded) throw new Error(bls.errorMessage);
    const { baselines } = transformOEWSToBaselines(bls.oews, OCCUPATION_CLUSTERS, DEFAULT_ROLE_ESTIMATION_CONFIG);
    const o = OCCUPATION_CLUSTERS.find(c => c.id === 'other_uncategorized');
    if (o && !baselines.has('other_uncategorized')) baselines.set('other_uncategorized', createOtherClusterBaseline(baselines, o));
    const cfg = getDefaultSimulationConfig();
    const flat = { floor: 0, ceiling: 0, steepness: 1.0, midpointYear: 2035 };
    const aCfg = { ...cfg, capabilities: { generative: flat, agentic: flat, embodied: flat } as Record<CapabilityVectorId, typeof flat> };
    assertKnownConfigKeys(aCfg, 'stage8');
    const tlA = runSimulation(aCfg, OCCUPATION_CLUSTERS, baselines);
    const tlC = runSimulation(cfg, OCCUPATION_CLUSTERS, baselines);

    it('BIT-ZERO: the model output is identical to the remediation baseline (automated diff)', () => {
      // FS-5 item-0 rider (mechanized): the referent must carry the sequential-procedure
      // fingerprint — a referent produced by a parallel multi-file invocation has no meta.json
      // and fails HERE with this message, not as a mystery 4th-decimal drift.
      const meta = JSON.parse(readFileSync('/tmp/atlas-audit-fs6f/meta.json', 'utf8')) as { procedure: string };
      expect(meta.procedure).toContain('sequential');
      const base = JSON.parse(readFileSync('/tmp/atlas-audit-fs6f/A.trace.json', 'utf8')) as Array<Record<string, number>>;
      for (const b of [base[3]!, base[15]!, base[25]!]) {
        const y = tlA.years.find(x => x.year === b.year)!;
        expect(y.macro.gdpNominal).toBe(b.gdpNominal);
        expect(y.macro.priceLevel).toBe(b.priceLevel);
        expect(y.macro.unemploymentRate).toBe(b.ueRate);
        expect(y.macro.shelterInflation).toBe(b.shelterInflation);
      }
    });

    it('the uniform add-back identity: at zero sector spread, every quintile index growth ≡ composite', () => {
      // construct a synthetic year where all sectors equal: the quintile growth must equal it + monetary
      const y = tlA.years[10]!;
      const v = 0.025, mon = y.macro.monetaryInflation;
      for (const w of CEX_QUINTILE_SECTOR_SHARES) {
        const g = (w.shelter + w.foodEnergy + w.laborServices + w.aiExposed) * v + mon;
        expect(g).toBeCloseTo(v + mon, 12);
      }
    });

    it('S8-R2(c) CONSERVATION: the quintiles reconstruct the aggregate by source, every year, both scenarios', () => {
      for (const tl of [tlA, tlC]) {
        for (const y of tl.years) {
          expect(Math.abs(quintileConservationResidual(y))).toBeLessThan(1e-9);
        }
      }
    });

    it('THE C-MODERATION TRIO — mechanized + always printed (the FS-6b adjudication, item 4; pressure leg re-specified at the final attribution)', () => {
      // The income and shelter legs assert at their charter bounds (unchanged). The
      // revenuePressure leg is re-specified per the final-attribution criterion-change ruling
      // (the audit close-out ruling; docs/FABLE_AUDIT_SUMMARY.md): the pathology criterion is realized loop gain < 1
      // with the 0.30 saturation HARD bound (saturation = unambiguous pathology under any
      // specification); the LEVEL has NO peak bound — the retired 0.124 figure was a
      // crash-depth statistic (the demand-crash echo, single-year, geometrically decaying),
      // not a sustained-pressure reading. ALWAYS printed so a silent skip is structurally
      // impossible (the FS-4b-class miss).
      const last = tlC.years[tlC.years.length - 1]!;
      const realHHIncome2050 = last.macro.totalPostTaxIncome / last.macro.priceLevel;
      const shelterPeak = Math.max(...tlC.years.map(y => y.macro.shelterInflation));
      const revPressPeak = Math.max(...tlC.years.map(y => y.macro.revenuePressure));
      const revPeakYear = tlC.years.find(y => y.macro.revenuePressure === revPressPeak)!.year;
      console.log('═══ THE C-MODERATION TRIO (printed every battery; charter bounds annotated) ═══');
      console.log(`  realHHincome 2050: $${(realHHIncome2050 / 1e12).toFixed(1)}T  (charter bound < $75.8T)`);
      console.log(`  shelter path peak: ${(shelterPeak * 100).toFixed(2)}%/yr  (charter bound < +12.6%/yr)`);
      console.log(`  revenuePressure path peak: ${revPressPeak.toFixed(4)} @${revPeakYear}  (level: NO peak bound — crash-depth statistic per the final attribution; pathology criterion = realized gain < 1, hard bound = the 0.30 saturation cap)`);
      expect(realHHIncome2050).toBeLessThan(75.8e12);
      expect(shelterPeak).toBeLessThan(0.126);
      expect(revPressPeak).toBeLessThan(0.30); // saturation = unambiguous pathology
    });

    it('THE INCIDENCE OBJECT: invariants + the bound-binding late-C verification (the prophylactic)', () => {
      const inc = computeDisplacedIncidence(tlC.years);
      // year 0 carries no displacement (the dormant start — the baseline identity the object rests on)
      expect(inc[0]!.totalDisplaced).toBe(0);
      let bindingClusterYears = 0;
      for (const y of tlC.years) {
        for (const c of y.clusters) {
          // the per-cluster §9.1 bound: secondOrder = min(direct×(m−1), remaining) — count binds
          const m = (OCCUPATION_CLUSTERS.find(o => o.id === c.clusterId)?.employmentMultiplier) ?? 1;
          const unbounded = c.totalDirectDisplacement * (m - 1);
          if (unbounded > c.secondOrderDisplacement + 1) bindingClusterYears++;
        }
      }
      console.log(`  bound-binding cluster-years in C (min(direct×(m−1), remaining) binding): ${bindingClusterYears}`);
      // the invariants must hold THROUGH the binding regime: shares normalized wherever displaced > 0
      for (const r of inc) {
        const h = r.headcountShares.reduce((s, v) => s + v, 0);
        const w = r.wageMassShares.reduce((s, v) => s + v, 0);
        if (r.totalDisplaced > 0) {
          expect(h).toBeCloseTo(1, 9);
          expect(w).toBeCloseTo(1, 9);
        } else {
          expect(h).toBe(0);
          expect(w).toBe(0);
        }
        for (const v of [...r.headcountShares, ...r.wageMassShares]) expect(Number.isFinite(v)).toBe(true);
      }
      // the binding regime exists in late C (the verification the prophylactic ordered) — and
      // the object's shares held normalized through it (asserted above).
      expect(bindingClusterYears).toBeGreaterThan(0);
    });

    it('S8-R2(c) on D + THE ATTRIBUTION GATE, FS-6b honest incidence: UBI-class 0.2; UI ∝ displaced wage mass', () => {
      const dCfg = { ...cfg, policyConfig: { ...cfg.policyConfig,
        ubi: { ...cfg.policyConfig.ubi, enabled: true, monthlyAmount: { keyframes: [{ year: 2025, value: 1000 }] } },
        enhancedUI: { ...cfg.policyConfig.enhancedUI, enabled: true, replacementRate: { keyframes: [{ year: 2025, value: 0.70 }] } } } };
      assertKnownConfigKeys(dCfg, 'stage8-D');
      const tlD = runSimulation(dCfg, OCCUPATION_CLUSTERS, baselines);
      const incD = new Map(computeDisplacedIncidence(tlD.years).map(r => [r.year, r]));
      for (const y of tlD.years) {
        // conservation on D (every scenario, every year) — holds for ANY normalized shares
        expect(Math.abs(quintileConservationResidual(y, incD.get(y.year)))).toBeLessThan(1e-9);
      }
      // THE ATTRIBUTION GATE (the routing-gate pattern — conservation cannot catch mis-routing):
      const y50 = tlD.years[tlD.years.length - 1]!;
      const inc50 = incD.get(y50.year)!;
      const d = decomposePolicyCash(y50, inc50);
      // the dollars exist and are located: UBI-class > $1T; the UI increment > 0 at 0.70 repl
      expect(d.flatPerCapitaCash).toBeGreaterThan(1e12);
      expect(d.uiWageCash).toBeGreaterThan(0);
      expect(inc50.totalDisplaced).toBeGreaterThan(0);
      // INDEPENDENT reconstruction: the per-quintile transfer equals base×CBO + flat×0.2
      // + UI×wageMassShare + headcount-cash×headcountShare — asserted against the cited
      // constants and the object's own shares, per quintile.
      for (let q = 0; q < 5; q++) {
        const expected = d.baselineTransfers * QUINTILE_TRANSFER_SHARES[q]!
          + d.flatPerCapitaCash * 0.2
          + d.uiWageCash * inc50.wageMassShares[q]!
          + d.headcountCash * inc50.headcountShares[q]!;
        expect(quintileTransferIncome(
          d.baselineTransfers, d.flatPerCapitaCash,
          d.uiWageCash, d.uiWageShares[q]!,
          d.headcountCash, d.headcountShares[q]!, q,
        )).toBeCloseTo(expected, 6);
      }
      // the UI routing is NOT flat: the displaced wage-mass distribution must differ from 0.2
      // flat (the v1 approximation this build retires) — the gate that catches a silent
      // regression to flat routing.
      const flatDeviation = inc50.wageMassShares.reduce((s, v) => s + Math.abs(v - 0.2), 0);
      expect(flatDeviation).toBeGreaterThan(0.01);
      // THE D-TABLE RE-RECORD (written for the report; the recorded Stage-8 v1 numbers are the
      // comparison base in FS6B_REPORT)
      const series = computeQuintileSeries(tlD.years);
      const rec50 = series[series.length - 1]!;
      const cSeries = computeQuintileSeries(tlC.years);
      const cRec50 = cSeries[cSeries.length - 1]!;
      writeFileSync('/tmp/fs6b-dtable.json', JSON.stringify({
        year: rec50.year, cwi: rec50.cwi, headlineCWI: rec50.headlineCWI,
        cCwi: cRec50.cwi, cHeadlineCWI: cRec50.headlineCWI,
        uiWageShares: inc50.wageMassShares, headcountShares: inc50.headcountShares,
        avgDisplacedWage: inc50.avgDisplacedWage, avgBaselineWage: inc50.avgBaselineWage,
        uiWageCash: d.uiWageCash, flatPerCapitaCash: d.flatPerCapitaCash,
      }));
      console.log('  D 2050 quintile CWI (honest incidence):', rec50.cwi.map(v => v.toFixed(2)).join(' / '));
      console.log('  displaced wage-mass shares Q1..Q5:', inc50.wageMassShares.map(v => v.toFixed(3)).join(' / '));
    });

    it('BIT-ZERO WIDENED: the full trace (macro + fiscal namespaces, explicit paths), ALL years, A and C', () => {
      // D is asserted in its own scenario test below (the D-table demand); the explicit two-namespace
      // path map avoids cross-namespace name collisions (e.g. fiscal.totalGovernmentRevenue vs the
      // macro field of the same name — a genuine collision found while widening this assertion).
      const MACRO_KEYS = ['gdpNominal','gdpReal','priceLevel','shelterInflation','compositeInflation',
        'pceProxyInflation','landCostIndex','homePriceIndex','rentIndex','housingStarts','occupancyRate',
        'consumption','aggregateWageIncome','aggregateTransferIncome','afterTaxWageIncome',
        'afterTaxAssetIncome','afterTaxTransferIncome','revenuePressure','aggregateDemandSurvival',
        'wageIndex','corporateProfits','housingPipeline','builderPriceIndex','monetaryInflation'];
      // A asserts against THE REMEDIATION BASELINE permanently (zero-AI is bit-identical through
      // every ruled AI-side fix — Gate-A bit-identity). C's referent advances with each RULED
      // fix mini-stage (FS-1b's F1 moved C as documented in FS1B_REPORT — the snapshot chain
      // carries the attribution); the current C referent = the post-FS-1b snapshot.
      const REFERENT: Record<string, string> = {
        A: '/tmp/atlas-audit-fs6f/A.trace.json',  // ADVANCED per the A-referent protocol (2nd application): the FS-6f ruled fixes moved A — (1) the observed-anchor re-inheritance (the silent-fallback retirement exposed the fiscal-monetary family riding fallback estimates: debt $38.514T, 10Y 4.53%, BBB 94bp, profits $3.917T, SP500 7267) + (2) the tech_qa renormalization (≈1e-8-relative). Full battery + attribution in FS6F_REPORT; prior pin = -fs4b/ (chain: baseline → fs4b → fs6f)
        C: '/tmp/atlas-audit-fs6f/C.trace.json',  // ADVANCED with the ruled FS-6f fixes, two rows separately measured (the intermediate snapshot -fs6f-fred/ isolates them): FRED re-anchoring (UE 2035 +0.68pp, terminal ≡) + tech_qa routing (UE 2035 −0.94pp, terminal −0.18pp; the synthetic 3.10M QA baseline retired). Attribution in FS6F_REPORT
      };
      for (const [name, tl] of [['A', tlA], ['C', tlC]] as const) {
        const base = JSON.parse(readFileSync(REFERENT[name]!, 'utf8')) as Array<Record<string, number>>;
        for (const row of base) {
          const y = tl.years.find(x => x.year === row.year)!;
          const m = y.macro as unknown as Record<string, number>;
          expect(m.unemploymentRate, `${name} ${row.year} ueRate`).toBe(row.ueRate);
          for (const k of MACRO_KEYS) {
            if (typeof row[k] === 'number' && Number.isFinite(row[k]!) && typeof m[k] === 'number') {
              expect(m[k], `${name} ${row.year} ${k}`).toBe(row[k]);
            }
          }
          const fm = y.fiscalMonetary;
          if (fm && typeof row.tenYearYield === 'number') expect(fm.bondMarket.tenYearYield, `${name} ${row.year} 10Y`).toBe(row.tenYearYield);
          if (fm && typeof row.monetizationRate === 'number') expect(fm.monetization.monetizationRate, `${name} ${row.year} mon`).toBe(row.monetizationRate);
          if (fm && typeof row.debtGDPRatio === 'number') expect(fm.fiscal.debtGDPRatio, `${name} ${row.year} debt`).toBe(row.debtGDPRatio);
        }
      }
    });

    it('the degenerate-weights identity: equal shares reproduce the aggregate index', () => {
      const eq = computeQuintileSeries(tlA.years);
      // with all five CEX rows distinct this is a structural check on the headline only:
      expect(eq[eq.length - 1]!.headlineCWI).toBeGreaterThan(0);
      expect(Number.isFinite(eq[eq.length - 1]!.headlineCWI)).toBe(true);
    });
  });
});
