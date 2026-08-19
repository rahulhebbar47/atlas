/**
 * THE QUINTILE VIEW MODULE (the quintile view redesign; display-only, bit-zero pinned).
 *
 * One source for everything the quintile-rendering charts draw: the view options, the
 * line descriptors (the SAME array renders the lines, the legend, and the tooltip rows —
 * the legend invariant is structural, then test-asserted), and the one aggregation
 * (the Bottom-80% simple average — equal population fifths make the simple mean the
 * population-weighted truth; the "(average)" label prevents the household misreading).
 *
 * Charts consuming this module (the enumeration, from the mounted-chart registry sweep):
 *   1. QuintileCWIChart        — Consumer Welfare per fifth (Overview)
 *   2. QuintilePolicyDeltaChart — per-fifth policy delta vs the no-policy twin (Overview)
 * (CWIChart is retired/unmounted; every other CWI reference is an aggregate scalar,
 * not a quintile series.)
 */
import type { QuintileViewMode } from '@/types';
import type { QuintileYearRecord } from '@/models/quintileCWI';

/** The specified default: the two-line view. The store initializes from this and the value
 *  is deliberately NOT session-persisted — every session opens on the specified default. */
export const DEFAULT_QUINTILE_VIEW: QuintileViewMode = 'top-vs-rest';

/** The one shared segmented control's options — deployed identically on every
 *  quintile-rendering chart (one component, one behavior, learned once). */
export const QUINTILE_VIEW_OPTIONS: ReadonlyArray<{ value: QuintileViewMode; label: string }> = [
  { value: 'top-vs-rest', label: 'Top vs rest' },
  { value: 'all', label: 'All quintiles' },
];

/** Q1..Q5; Q3 (index 2) is the emphasized median household. (Moved here from
 *  QuintileCWIChart — re-exported there for standing importers.)
 *  THE PALETTE RIDER (H1 acceptance): Q2 re-stepped #5B8DB8 → #0F74C5 (same blue hue
 *  family, OKLCH L 0.55 C 0.15 h250) to clear the validator's pair gates on Q1↔Q2 —
 *  was ΔE 6.9 normal / 4.6 protan, now 16.7 / 13.6 (floors 15 / 8); contrast 3.34:1.
 *  Every shipped pair on both quintile views is permanently gated by
 *  quintile-palette-tests.test.ts (the in-repo port of the dataviz validator). */
export const QUINTILE_COLORS = ['#8A96AD', '#0F74C5', '#D4A03C', '#4ECDC4', '#9B7ED9'];
export const QUINTILE_LABELS = ['Q1 (lowest fifth)', 'Q2', 'Q3 (median household)', 'Q4', 'Q5 (highest fifth)'];

/** The Bottom-80% line wears the system gold — the design system's emphasis accent
 *  (the same grammar as Q3's emphasized median line in the five-line view: gold marks
 *  "the typical household" object in both views). Q5 keeps its established purple in
 *  BOTH views for continuity (specified). Pair validated computationally (dark surface
 *  #13203A): CVD ΔE 26.1, normal-vision ΔE 26.3, contrast ≥ 3:1. */
export const BOTTOM80_COLOR = '#D4A03C';
export const BOTTOM80_LABEL = 'Bottom 80% (average)';
export const TOP20_LABEL = 'Top 20%';

export interface QuintileLineDescriptor {
  /** dataKey in the chart rows ('q0'..'q4', 'b80', legacy keys) */
  key: string;
  /** the legend text — the SAME string the legend renders (the legend invariant) */
  label: string;
  /** the compact tooltip-row text (view-correct: "Top 20%" in the two-line view, "Q5"
   *  in the five-line view — same object, the view's own vocabulary) */
  shortLabel: string;
  color: string;
  strokeWidth: number;
  /** 0..4 for a single-quintile line (decomposition target); null for aggregates */
  qIndex: number | null;
  /** stroke-dasharray for the legacy comparison lines */
  dash?: string;
  opacity?: number;
}

/**
 * THE RENDERED-LINE SET, one array per (view, options): the charts map this array to
 * <Line> elements, the legend maps the SAME array to its entries, and the tooltip maps
 * it to its rows — legend ≡ rendered by construction, then test-asserted.
 *
 * Order is the reading order everywhere (legend, tooltip, paint order — later paints on
 * top, so the emphasized Bottom-80% line paints over Q5 where they approach).
 *
 * The legacy aggregate-deflated lines are an "All quintiles" affordance only (the
 * close-out K.3 design decision keeps them behind their toggle under true labels; the two-line
 * default stays two lines) — legacyLines is ignored in 'top-vs-rest'.
 */
export function quintileLineDescriptors(
  view: QuintileViewMode,
  opts?: { legacyLines?: boolean },
): QuintileLineDescriptor[] {
  if (view === 'top-vs-rest') {
    return [
      { key: 'q4', label: TOP20_LABEL, shortLabel: TOP20_LABEL, color: QUINTILE_COLORS[4]!, strokeWidth: 2, qIndex: 4 },
      { key: 'b80', label: BOTTOM80_LABEL, shortLabel: 'Bottom 80%', color: BOTTOM80_COLOR, strokeWidth: 3, qIndex: null },
    ];
  }
  const lines: QuintileLineDescriptor[] = [0, 1, 2, 3, 4].map((q) => ({
    key: `q${q}`,
    label: QUINTILE_LABELS[q]!,
    shortLabel: `Q${q + 1}`,
    color: QUINTILE_COLORS[q]!,
    strokeWidth: q === 2 ? 3 : 1.5,
    qIndex: q,
  }));
  if (opts?.legacyLines) {
    lines.push(
      { key: 'legacyAvg', label: 'aggregate-deflated mean (legacy)', shortLabel: 'legacy mean', color: '#6B7280', strokeWidth: 1, qIndex: null, dash: '2 4', opacity: 0.6 },
      { key: 'legacyB80', label: 'aggregate-deflated bottom-80 (legacy)', shortLabel: 'legacy bottom-80', color: '#6B7280', strokeWidth: 1, qIndex: null, dash: '6 4', opacity: 0.6 },
    );
  }
  return lines;
}

/** THE ONE AGGREGATION: the Bottom-80% simple average of the four quintile per-person
 *  values. Equal population fifths make the simple mean the population-weighted truth.
 *  Left-associative sum — the aggregation-identity test re-derives it bit-exact. */
export function bottom80Average(values: readonly number[]): number {
  return (values[0]! + values[1]! + values[2]! + values[3]!) / 4;
}

/** The CWI chart's row: the five per-fifth values PLUS the Bottom-80% average, computed
 *  from the SAME record the five-line view renders — one source, asserted bit-exact.
 *  (`mean` retained for the DEPRECATED mean-of-quintile-measures line.) */
export function cwiChartRow(r: QuintileYearRecord): {
  year: number; q0: number; q1: number; q2: number; q3: number; q4: number;
  b80: number; mean: number;
} {
  return {
    year: r.year,
    q0: r.cwi[0]!, q1: r.cwi[1]!, q2: r.cwi[2]!, q3: r.cwi[3]!, q4: r.cwi[4]!,
    b80: bottom80Average(r.cwi),
    mean: r.headlineCWI,
  };
}

/** The policy-delta chart's row: each fifth's percent difference against the no-policy
 *  twin, PLUS the Bottom-80% average of those four rendered deltas (the same
 *  equal-fifths principle: each fifth's percent change counts equally by population). */
export function policyDeltaRow(withRec: QuintileYearRecord, noPolicyRec: QuintileYearRecord | undefined): {
  year: number; q0: number; q1: number; q2: number; q3: number; q4: number; b80: number;
} {
  const d: number[] = [];
  for (let q = 0; q < 5; q++) {
    const bv = noPolicyRec?.cwi[q] ?? 0;
    d.push(bv > 0 ? (withRec.cwi[q]! / bv - 1) * 100 : 0);
  }
  return {
    year: withRec.year,
    q0: d[0]!, q1: d[1]!, q2: d[2]!, q3: d[3]!, q4: d[4]!,
    b80: bottom80Average(d),
  };
}
