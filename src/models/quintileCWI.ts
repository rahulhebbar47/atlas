/**
 * STAGE 8 — the quintile CWI measurement layer (ratified checkpoint + riders S8-R1..R4).
 * PURE POST-PROCESSING on the finished timeline: no model-loop feedback (bit-zero structural).
 * All tables PROVISIONAL PENDING FS (the program charter's standing marker).
 */
import type { SimulationYearOutput } from '@/types';
import {
  CEX_QUINTILE_SECTOR_SHARES, QUINTILE_WAGE_SHARES, QUINTILE_TRANSFER_SHARES,
  QUINTILE_ASSET_SHARES, DEFAULT_RENT_VINTAGE_LAG_YEARS,
} from './constants';
import { computeDisplacedIncidence, type DisplacedIncidenceYear } from './uiIncidence';

export interface QuintileYearRecord {
  year: number;
  /** the five quintile price indices (compounded; 1.0 at year 0) */
  indices: number[];
  /** the five quintile real income measures (CWI_q = income_q / (pop_q × index_q)), population-share-normalized */
  cwi: number[];
  headlineCWI: number;
  /** the nominal income legs per quintile (wage/asset/transfer, aggregate dollars) — the
   *  decomposition view's data (close-out K.3 build); purely additive display surface */
  incomeComponents: Array<{ wage: number; asset: number; transfer: number }>;
  /** the marginal vs stock-vintage shelter growth pair (the C-2 wedge, displayed) */
  marginalShelter: number;
  stockShelter: number;
  /** the lived-vs-Fed exhibit pair */
  livedComposite: number;
  fedProxy: number;
  /** the nominal-vs-deflator decomposition of real GDP growth */
  nominalGrowth: number;
  deflatorContribution: number;
}

/** S8-R3: the dial-derived kernel — linear-interpolated taps with mean lag EXACTLY the dial. */
export function vintageKernel(lagYears: number): Array<{ tap: number; w: number }> {
  const lo = Math.floor(lagYears), hi = Math.ceil(lagYears);
  if (lo === hi) return [{ tap: lo, w: 1 }];
  return [{ tap: lo, w: hi - lagYears }, { tap: hi, w: lagYears - lo }];
}

/** S8-R2(b), refined at FS-6b to HONEST INCIDENCE: the transfer dollars route by component.
 *  - Baseline transfers: the CBO quintile shares (cited constants).
 *  - UBI-class cash (UBI + the incremental-UE stabilizers): FLAT PER-CAPITA, 0.2/quintile
 *    (the S8 rider's reason stands: routing UBI through the Q1-heavy baseline shares would
 *    hand Q1 ≈ 2× its actual UBI dollars).
 *  - The wage-proportional enhanced-UI increment: by the displaced WAGE-MASS quintile shares
 *    from the incidence object (uiIncidence.ts — benefit ∝ prior wage, uncapped v1).
 *  - Flat per-head displaced support (retraining bonus + stipends): by the displaced
 *    HEADCOUNT quintile shares.
 *  When no workers are displaced, the incidence shares are zero and both displaced-routed
 *  components fall back to flat per-capita (any such dollars accrue to baseline unemployed,
 *  whose distribution the model does not resolve — stated). */
export function quintileTransferIncome(
  baselineTransfers: number, flatPerCapitaCash: number,
  uiWageCash: number, uiWageShare: number,
  headcountCash: number, headcountShare: number,
  q: number,
): number {
  return baselineTransfers * QUINTILE_TRANSFER_SHARES[q]!
    + flatPerCapitaCash * 0.2
    + uiWageCash * uiWageShare
    + headcountCash * headcountShare;
}

/** The per-year policy-cash decomposition used by the series, the conservation residual, and
 *  the attribution-gate tests — single source of truth for the routing inputs. */
export function decomposePolicyCash(
  y: SimulationYearOutput, incidence: DisplacedIncidenceYear | undefined,
): {
  baselineTransfers: number; flatPerCapitaCash: number;
  uiWageCash: number; uiWageShares: number[];
  headcountCash: number; headcountShares: number[];
} {
  const m = y.macro;
  const ui = y.policyEffects?.enhancedUIAddition ?? 0;
  const flatHead = y.policyEffects?.displacedFlatAddition ?? 0;
  const transferAdd = y.policyEffects?.transferChannelAddition ?? 0;
  const ubiClass = Math.max(0, transferAdd - ui - flatHead);
  const stabilizers = m.incrementalCashTransfers ?? 0;
  const displacedKnown = (incidence?.totalDisplaced ?? 0) > 0;
  const flat5 = [0.2, 0.2, 0.2, 0.2, 0.2];
  return {
    baselineTransfers: m.aggregateTransferIncome - (transferAdd + stabilizers),
    flatPerCapitaCash: ubiClass + stabilizers,
    uiWageCash: ui,
    uiWageShares: displacedKnown ? incidence!.wageMassShares : flat5,
    headcountCash: flatHead,
    headcountShares: displacedKnown ? incidence!.headcountShares : flat5,
  };
}

export function computeQuintileSeries(
  years: SimulationYearOutput[],
  rentVintageLagYears: number = DEFAULT_RENT_VINTAGE_LAG_YEARS,
): QuintileYearRecord[] {
  const kernel = vintageKernel(rentVintageLagYears);
  const marginalShelterHist: number[] = [];
  const indices = [1, 1, 1, 1, 1];
  const out: QuintileYearRecord[] = [];
  let prevNominal = 0, prevReal = 0;
  // FS-6b: the displaced-worker incidence (self-contained — built from the same timeline)
  const incidenceByYear = new Map(computeDisplacedIncidence(years).map(r => [r.year, r]));

  for (const y of years) {
    const m = y.macro;
    marginalShelterHist.push(m.shelterInflation);
    // the stock-vintage shelter growth (display-only): the kernel over the marginal history
    const stockShelter = kernel.reduce((s, { tap, w }) => {
      const v = marginalShelterHist[marginalShelterHist.length - 1 - tap];
      return s + w * (v ?? marginalShelterHist[0] ?? 0);
    }, 0);
    const sectors = {
      shelter: stockShelter,                       // the lived (stock-vintage) concept, S8-R4 OER note
      foodEnergy: m.foodEnergyInflation,
      laborServices: m.laborServicesInflation,
      aiExposed: m.aiExposedInflation,
    };
    // S8-R2(b), FS-6b honest incidence: the policy cash decomposes by component (UBI-class
    // flat per-capita; the UI increment by displaced wage mass; flat per-head support by
    // displaced headcount) — decomposePolicyCash is the single source of truth.
    const d = decomposePolicyCash(y, incidenceByYear.get(y.year));
    const cwi: number[] = [];
    const incomeComponents: Array<{ wage: number; asset: number; transfer: number }> = [];
    for (let q = 0; q < 5; q++) {
      const w = CEX_QUINTILE_SECTOR_SHARES[q]!;
      // the uniform monetary add-back at EACH index (the doc-02 §7 rule, harness-asserted)
      const qInfl = w.shelter * sectors.shelter + w.foodEnergy * sectors.foodEnergy
        + w.laborServices * sectors.laborServices + w.aiExposed * sectors.aiExposed
        + m.monetaryInflation;
      indices[q] = out.length === 0 ? 1.0 : indices[q]! * (1 + qInfl);
      const wageLeg = m.afterTaxWageIncome * QUINTILE_WAGE_SHARES[q]!;
      const assetLeg = m.afterTaxAssetIncome * QUINTILE_ASSET_SHARES[q]!;
      const transferLeg = quintileTransferIncome(
          d.baselineTransfers, d.flatPerCapitaCash,
          d.uiWageCash, d.uiWageShares[q]!,
          d.headcountCash, d.headcountShares[q]!, q,
        )
        * (m.afterTaxTransferIncome / Math.max(1, m.aggregateTransferIncome));  // the transfer-tax wedge, applied pro-rata
      const income = wageLeg + assetLeg + transferLeg;
      incomeComponents.push({ wage: wageLeg, asset: assetLeg, transfer: transferLeg });
      cwi.push(income / (0.2 * (m.dynamicPopulation || 1)) / indices[q]!);
    }
    const nominalGrowth = prevNominal > 0 ? m.gdpNominal / prevNominal - 1 : 0;
    const realGrowth = prevReal > 0 ? m.gdpReal / prevReal - 1 : 0;
    out.push({
      year: y.year, indices: [...indices], cwi, headlineCWI: cwi.reduce((s, v) => s + v, 0) / 5,
      incomeComponents,
      marginalShelter: m.shelterInflation, stockShelter,
      livedComposite: m.compositeInflation, fedProxy: m.pceProxyInflation,
      nominalGrowth, deflatorContribution: nominalGrowth - realGrowth,
    });
    prevNominal = m.gdpNominal; prevReal = m.gdpReal;
  }
  return out;
}

/** S8-R2(c): the conservation assertion — the quintiles reconstruct the aggregate BY SOURCE.
 *  FS-6b: conservation holds for ANY share vectors that sum to 1 (the guard-design principle:
 *  it catches loss, not routing) — the ROUTING is asserted separately by the attribution gate. */
export function quintileConservationResidual(
  y: SimulationYearOutput, incidence?: DisplacedIncidenceYear,
): number {
  const m = y.macro;
  const d = decomposePolicyCash(y, incidence);
  let total = 0;
  for (let q = 0; q < 5; q++) {
    total += m.afterTaxWageIncome * QUINTILE_WAGE_SHARES[q]!
      + m.afterTaxAssetIncome * QUINTILE_ASSET_SHARES[q]!
      + quintileTransferIncome(
          d.baselineTransfers, d.flatPerCapitaCash,
          d.uiWageCash, d.uiWageShares[q]!,
          d.headcountCash, d.headcountShares[q]!, q,
        )
        * (m.afterTaxTransferIncome / Math.max(1, m.aggregateTransferIncome));
  }
  const aggregate = m.afterTaxWageIncome + m.afterTaxAssetIncome + m.afterTaxTransferIncome;
  return aggregate > 0 ? (total - aggregate) / aggregate : 0;
}
