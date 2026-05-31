/**
 * ATLAS Data Export Utilities
 *
 * Provides CSV export for simulation timeline data and chart image export.
 * Uses browser Blob + URL.createObjectURL for downloads.
 *
 * All functions are PURE where possible — side effects only in download triggers.
 */

import type { SimulationTimeline, SimulationYearOutput } from '@/types';

// ============================================================
// CSV Export
// ============================================================

/**
 * Generate CSV string for the full macro timeline.
 */
export function generateMacroCSV(timeline: SimulationTimeline): string {
  const headers = [
    'Year',
    'Total Employment',
    'Unemployment Rate',
    'GDP Nominal ($)',
    'GDP Real ($)',
    'Consumer Welfare Index ($)',
    'CWI Growth Rate',
    'Cycle Phase',
    'Wage Income Share',
    'Asset Income Share',
    'Transfer Income Share',
    'Inflation Rate',
    'AI Deflation Rate',
    'Net Inflation',
    'AI GDP Contribution ($)',
    'Revenue Pressure',
    'Automation Acceleration',
    'New Job Creation Rate',
    'Durable New Jobs',
    'Net Job Creation',
    'Automation Coverage',
    'Policy Fiscal Cost ($)',
    'Policy Fiscal Cost % GDP',
  ];

  const rows = timeline.years.map((y) => [
    y.year,
    y.macro.totalEmployment,
    y.macro.unemploymentRate,
    y.macro.gdpNominal,
    y.macro.gdpReal,
    y.macro.consumerWelfareIndex,
    y.macro.cwiGrowthRate,
    y.macro.cyclePhase,
    y.macro.incomeComposition.wageShare,
    y.macro.incomeComposition.assetShare,
    y.macro.incomeComposition.transferShare,
    y.macro.inflationRate,
    y.macro.aiDeflationRate,
    y.macro.netInflation,
    y.macro.aiGDPContribution,
    y.macro.revenuePressure,
    y.macro.automationAcceleration,
    y.macro.newJobCreationRate,
    y.macro.durableNewJobs,
    y.macro.netJobCreation,
    y.macro.automationCoverage,
    y.policyEffects.fiscalCost,
    y.policyEffects.fiscalCostAsPercentGDP,
  ]);

  return formatCSV(headers, rows);
}

/**
 * Generate CSV string for cluster-level displacement data.
 */
export function generateClusterCSV(timeline: SimulationTimeline): string {
  const headers = [
    'Year',
    'Cluster ID',
    'Remaining Employment',
    'Direct Displacement',
    'Second-Order Displacement',
    'Total Displacement',
    'Average Wage ($)',
  ];

  const rows: (string | number)[][] = [];
  for (const y of timeline.years) {
    for (const c of y.clusters) {
      rows.push([
        y.year,
        c.clusterId,
        c.totalRemainingEmployment,
        c.totalDirectDisplacement,
        c.secondOrderDisplacement,
        c.totalDisplacement,
        c.averageWage,
      ]);
    }
  }

  return formatCSV(headers, rows);
}

/**
 * Generate CSV string for state-level data.
 */
export function generateStateCSV(timeline: SimulationTimeline): string {
  const headers = [
    'Year',
    'State Code',
    'Displacement Rate',
    'Unemployment Rate',
    'CWI ($)',
    'Policy Effectiveness',
  ];

  const rows: (string | number)[][] = [];
  for (const y of timeline.years) {
    if (!y.states) continue;
    for (const s of y.states) {
      rows.push([
        y.year,
        s.code,
        s.displacement,
        s.unemploymentRate,
        s.consumerWelfareIndex,
        s.policyEffectiveness,
      ]);
    }
  }

  return formatCSV(headers, rows);
}

// ============================================================
// Download Helpers
// ============================================================

/**
 * Trigger a browser download of a CSV string.
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Trigger a browser download of a Blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Clean up the object URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Export a DOM element as a PNG image.
 * Uses html-to-image library (already a project dependency).
 */
export async function exportElementAsPNG(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const { toPng } = await import('html-to-image');
  const dataUrl = await toPng(element, {
    backgroundColor: '#080D18', // deep navy background
    pixelRatio: 2,
  });
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

// ============================================================
// Internal Helpers
// ============================================================

/**
 * Format headers and rows into a valid CSV string.
 * Handles values with commas or quotes by quoting.
 */
function formatCSV(headers: string[], rows: (string | number | boolean)[][]): string {
  const escape = (val: string | number | boolean): string => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ];

  return lines.join('\n');
}
