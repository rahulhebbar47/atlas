/**
 * THE 2021-22 SEMICONDUCTOR-SHORTAGE EPISODE — cited static evidence tables.
 *
 * The activation-price episode for the supply-chain block (registered at FS-5; run as a
 * pre-registered test of the coupled design, an earlier build step). These are HAND-ENTERED
 * static tables per the FRED-key pattern (cited, no runtime APIs); values are the
 * commonly-cited public figures at entry date 2026-07-02 — the refresh (and any
 * precision upgrade) is registered to the data program alongside the other citation rows.
 *
 * THE EPISODE'S THREE LOAD-BEARING FACTS for the model mapping:
 *  1. PRICE/QUANTITY DIVERGENCE: producer price indices for semiconductors stayed muted
 *     while SPOT prices (GPUs) ran 2-3× MSRP and quantities were rationed by allocation —
 *     the rationale for the separate chipPrice input (C-3).
 *  2. FREEZE-NOT-COLLAPSE: constrained industries cut PRODUCTION (≈10M vehicles), not
 *     their automation/technology stock — adoption froze rather than reversed.
 *  3. RECOVERY WAS EXPLICIT AND TOOK ~2 YEARS: lead times normalized through 2023.
 */

/** WSTS/SIA global semiconductor sales, $B (annual). Source: WSTS via SIA press releases
 *  (2021 record year: the shortage was allocation/mix, not aggregate supply collapse). */
export const GLOBAL_SEMI_SALES_BILLIONS: ReadonlyArray<{ year: number; salesB: number }> = [
  { year: 2019, salesB: 412 },
  { year: 2020, salesB: 440 },
  { year: 2021, salesB: 556 },
  { year: 2022, salesB: 574 },
  { year: 2023, salesB: 527 },
];

/** Approximate broad chip lead times, weeks (Susquehanna Financial Group lead-time survey,
 *  as widely reported; automotive MCUs ran materially longer at the peak). */
export const CHIP_LEAD_TIME_WEEKS: ReadonlyArray<{ period: string; weeks: number }> = [
  { period: '2020Q4', weeks: 13 },
  { period: '2021Q2', weeks: 18 },
  { period: '2021Q4', weeks: 25 },
  { period: '2022Q2', weeks: 27 },
  { period: '2023Q2', weeks: 22 },
  { period: '2023Q4', weeks: 16 },
];

/** Global light-vehicle production LOST to the chip shortage, 2021 (units, millions).
 *  Source: AutoForecast Solutions ≈10.5M; S&P Global Mobility (IHS) estimates in the
 *  9.5-11M range — the freeze-not-collapse capacity-loss reality. */
export const VEHICLE_PRODUCTION_LOSS_2021_MILLIONS = 10.5;

/** BLS PPI, semiconductors & related devices: approximately FLAT through the shortage
 *  (≈0-1%/yr 2021) — the index-level price signal the episode did NOT show. */
export const PPI_SEMICONDUCTORS_2021_APPROX_PCT = 1.0;

/** Spot GPU street-price premium over MSRP at the 2021 peak (mining + shortage):
 *  ≈2-3× across market trackers — the spot signal the episode DID show. */
export const SPOT_GPU_PREMIUM_2021_RANGE: readonly [number, number] = [2.0, 3.0];

/** BLS CPI, Dec/Dec 2021: new vehicles +11.8%, used cars & trucks +37.3% — the
 *  downstream consumer-price incidence of the constrained goods. */
export const VEHICLE_CPI_2021 = { newVehiclesPct: 11.8, usedVehiclesPct: 37.3 } as const;

/** JOLTS, motor vehicles & parts (shape reference): the 2020Q2 layoff spike was followed
 *  by recall/rehire through 2020H2-2021 — furlough-then-recall, with the 2021 constraint
 *  showing as production cuts and intermittent line idling, not technology abandonment.
 *  (Series: BLS JOLTS layoffs & discharges + hires, transportation equipment mfg.) */
export const JOLTS_SHAPE_NOTE =
  'furlough-then-recall 2020; production cuts + line idling under the 2021 chip constraint';

/**
 * THE MODEL MAPPING (documented for the test; model-relative years):
 *  - quantity dip: supplyChainAiChips 100→60, supplyChainRoboticsHW 100→70 for two years,
 *    EXPLICIT recovery keys back to 100 (the resolver's recovery-is-explicit convention);
 *  - price spike: supplyChainChipPrice 100→250 for the same window, explicit recovery;
 *  - pass-through: swept at the B2-5 calibration test; the episode's deployer-side
 *    incidence (spot premia paid by buyers) anchors the upper half of the range.
 */
export const EPISODE_SHOCK_MAPPING = {
  aiChipsDip: 60,
  roboticsHardwareDip: 70,
  chipPriceSpike: 250,
  shockYears: 2,
} as const;
