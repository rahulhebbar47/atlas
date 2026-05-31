/**
 * ATLAS Phase 8d: Comparison Narrative Generator
 *
 * Auto-generates bullet-point summaries comparing two fiscal
 * response profiles based on their simulation outcomes.
 *
 * PURE FUNCTION — no side effects.
 */

import type { SimulationTimeline } from '@/types';

// ============================================================
// Types
// ============================================================

export interface ComparisonMetricRow {
  label: string;
  valueA: number;
  valueB: number;
  format: (v: number) => string;
  /** Higher is better (for determining "wins"). */
  higherIsBetter: boolean;
}

export interface ComparisonData {
  profileAName: string;
  profileBName: string;
  metrics: ComparisonMetricRow[];
  milestoneMetrics: Map<number, ComparisonMetricRow[]>;
  narrative: string[];
}

// ============================================================
// Display names
// ============================================================

const PROFILE_DISPLAY_NAMES: Record<string, string> = {
  austerity_first: 'Austerity First',
  tax_the_winners: 'Tax the Winners',
  fed_backstop: 'Fed Backstop',
  gridlock: 'Gridlock',
  balanced_pragmatism: 'Balanced Pragmatism',
  no_adjustment: 'No Adjustment',
  custom: 'Custom',
};

function displayName(profileId: string): string {
  return PROFILE_DISPLAY_NAMES[profileId] ?? profileId;
}

// ============================================================
// Formatters
// ============================================================

function formatCurrency(v: number): string {
  if (Math.abs(v) >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(0)}B`;
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatPercent(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

function formatMultiplier(v: number): string {
  return `${v.toFixed(2)}\u00D7`;
}

function formatDollars(v: number): string {
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

// ============================================================
// Metric extraction
// ============================================================

function getLastYearData(timeline: SimulationTimeline) {
  const last = timeline.years[timeline.years.length - 1];
  return last ?? null;
}

function getYearData(timeline: SimulationTimeline, year: number) {
  return timeline.years.find((y) => y.year === year) ?? null;
}

// ============================================================
// Main function
// ============================================================

/**
 * Generate a comprehensive comparison between two profiles.
 */
export function generateComparisonData(
  profileA: { name: string; timeline: SimulationTimeline },
  profileB: { name: string; timeline: SimulationTimeline },
): ComparisonData {
  const lastA = getLastYearData(profileA.timeline);
  const lastB = getLastYearData(profileB.timeline);

  if (!lastA || !lastB) {
    return {
      profileAName: displayName(profileA.name),
      profileBName: displayName(profileB.name),
      metrics: [],
      milestoneMetrics: new Map(),
      narrative: ['Insufficient simulation data for comparison.'],
    };
  }

  // Final-year metrics
  const metrics: ComparisonMetricRow[] = [
    {
      label: 'Consumer Welfare Index',
      valueA: lastA.macro.consumerWelfareIndex,
      valueB: lastB.macro.consumerWelfareIndex,
      format: formatDollars,
      higherIsBetter: true,
    },
    {
      label: 'Real GDP',
      valueA: lastA.macro.gdpReal,
      valueB: lastB.macro.gdpReal,
      format: formatCurrency,
      higherIsBetter: true,
    },
    {
      label: 'Unemployment Rate',
      valueA: lastA.macro.unemploymentRate,
      valueB: lastB.macro.unemploymentRate,
      format: formatPercent,
      higherIsBetter: false,
    },
    {
      label: 'Price Level',
      valueA: lastA.macro.priceLevel,
      valueB: lastB.macro.priceLevel,
      format: formatMultiplier,
      higherIsBetter: false,
    },
    {
      label: 'Debt/GDP',
      valueA: lastA.fiscalMonetary?.fiscal.debtGDPRatio ?? 0,
      valueB: lastB.fiscalMonetary?.fiscal.debtGDPRatio ?? 0,
      format: formatMultiplier,
      higherIsBetter: false,
    },
  ];

  // Milestone year metrics (2030, 2035, 2040, 2045, 2050)
  const milestoneMetrics = new Map<number, ComparisonMetricRow[]>();
  for (const year of [2030, 2035, 2040, 2045, 2050]) {
    const yearA = getYearData(profileA.timeline, year);
    const yearB = getYearData(profileB.timeline, year);
    if (!yearA || !yearB) continue;

    milestoneMetrics.set(year, [
      {
        label: 'CWI',
        valueA: yearA.macro.consumerWelfareIndex,
        valueB: yearB.macro.consumerWelfareIndex,
        format: formatDollars,
        higherIsBetter: true,
      },
      {
        label: 'Unemployment',
        valueA: yearA.macro.unemploymentRate,
        valueB: yearB.macro.unemploymentRate,
        format: formatPercent,
        higherIsBetter: false,
      },
      {
        label: 'Price Level',
        valueA: yearA.macro.priceLevel,
        valueB: yearB.macro.priceLevel,
        format: formatMultiplier,
        higherIsBetter: false,
      },
      {
        label: 'Debt/GDP',
        valueA: yearA.fiscalMonetary?.fiscal.debtGDPRatio ?? 0,
        valueB: yearB.fiscalMonetary?.fiscal.debtGDPRatio ?? 0,
        format: formatMultiplier,
        higherIsBetter: false,
      },
    ]);
  }

  // Generate narrative bullets
  const narrative = generateNarrativeBullets(
    displayName(profileA.name),
    displayName(profileB.name),
    metrics,
  );

  return {
    profileAName: displayName(profileA.name),
    profileBName: displayName(profileB.name),
    metrics,
    milestoneMetrics,
    narrative,
  };
}

// ============================================================
// Narrative generation
// ============================================================

function generateNarrativeBullets(
  nameA: string,
  nameB: string,
  metrics: ComparisonMetricRow[],
): string[] {
  const bullets: string[] = [];

  for (const m of metrics) {
    const delta = m.valueB - m.valueA;
    if (Math.abs(delta) < 1e-6) continue;

    const pctChange = m.valueA !== 0 ? (delta / Math.abs(m.valueA)) * 100 : 0;
    const absPctChange = Math.abs(pctChange);

    if (absPctChange < 1) continue; // Skip negligible differences

    const direction = delta > 0 ? 'higher' : 'lower';
    const isBetter = m.higherIsBetter ? delta > 0 : delta < 0;
    const quality = isBetter ? 'better' : 'worse';

    if (m.label === 'Consumer Welfare Index') {
      bullets.push(
        `${nameB} produces ${absPctChange.toFixed(0)}% ${direction} CWI (${quality} for consumers)`,
      );
    } else if (m.label === 'Unemployment Rate') {
      const ppDelta = Math.abs(delta * 100);
      bullets.push(
        `${nameB} has ${ppDelta.toFixed(1)}pp ${direction} unemployment`,
      );
    } else if (m.label === 'Price Level') {
      bullets.push(
        `${nameB} results in ${absPctChange.toFixed(0)}% ${direction} inflation`,
      );
    } else if (m.label === 'Debt/GDP') {
      bullets.push(
        `Debt stabilizes ${isBetter ? 'faster' : 'slower'} under ${nameB} (${m.format(m.valueB)} vs ${m.format(m.valueA)})`,
      );
    } else if (m.label === 'Real GDP') {
      bullets.push(
        `${nameB} achieves ${absPctChange.toFixed(0)}% ${direction} real GDP`,
      );
    }
  }

  return bullets;
}
