/**
 * THE NEAR-TERM RECORD (2022-2026) — the §6.2 calendar-anchored realism table.
 *
 * Hand-entered cited statics (the FRED-key pattern; refresh registered to the data
 * program). THE LOAD-BEARING FACT for test B3-4: as of the entry date (2026-07),
 * the observed record shows NO economy-wide AI-displacement wave — the 2022-24 tech
 * layoff cycle (~430k announced across trackers) was rate-cycle/over-hiring-corrective
 * with AI cited in a minority of announcements; aggregate U-3 stayed in the low-4s;
 * frontier-priced pilot pauses/resumptions keyed to reasoning-model pricing are the
 * mechanism's qualitative near-term signature (margin churn, not mass displacement).
 */
export const NEAR_TERM_RECORD = {
  /** Announced tech-sector layoffs, cumulative 2022-2024 (layoff-tracker aggregates). */
  techLayoffsAnnounced2022to2024: 430_000,
  /** Aggregate U-3 range through 2025 (BLS): low-4s — no AI displacement wave visible. */
  u3Range2025: [3.9, 4.4] as const,
  /** THE FLAG test B3-4 consumes: is an economy-wide AI-displacement wave visible in
   *  the record by 2026? (≥1pp of U-3 attributable to AI displacement = the failure
   *  trigger (a); an author recalibration decision with citations if a refresh flips it.) */
  aiDisplacementWaveVisibleBy2026: false,
  entryDate: '2026-07-02',
} as const;
