/**
 * ATLAS Predictions View
 *
 * Sortable table of AI company projections — lets policymakers compare
 * how robotics, model, and agent companies each project technology impact
 * on labor markets and the economy.
 *
 * Design mirrors OccupationBrowser.tsx: same header style, row styling,
 * sort mechanics, and color coding.
 *
 * Currently uses static illustrative data. Future phases will allow
 * companies to submit live projections via the ATLAS API.
 */

import { useState, useMemo } from 'react';
import { formatPercent } from '@/utils/format';

// ============================================================
// Types
// ============================================================

type CapabilityFocus = 'Generative' | 'Agentic' | 'Embodied' | 'Generative + Agentic';
type OutlookSentiment = 'Aggressive' | 'Moderate' | 'Conservative';
type SortColumn = 'company' | 'capabilityFocus' | 'peakAutomationYear' | 'laborDisplacementPct' | 'gdpImpactPct' | 'newJobsCreatedM' | 'outlook';
type SortDirection = 'asc' | 'desc';

interface CompanyPrediction {
  id: string;
  company: string;
  capabilityFocus: CapabilityFocus;
  focusColor: string;
  peakAutomationYear: number;
  laborDisplacementPct: number;   // [0, 1]
  gdpImpactPct: number;          // [0, 1]
  newJobsCreatedM: number;       // millions
  outlook: OutlookSentiment;
  notes: string;
}

// ============================================================
// Static mock data
// ============================================================

const COMPANY_PREDICTIONS: CompanyPrediction[] = [
  {
    id: 'tesla',
    company: 'Tesla',
    capabilityFocus: 'Embodied',
    focusColor: '#EF4444',
    peakAutomationYear: 2038,
    laborDisplacementPct: 0.22,
    gdpImpactPct: 0.30,
    newJobsCreatedM: 8.5,
    outlook: 'Aggressive',
    notes: 'Projects Optimus humanoid + FSD reaching cost parity with human labor by 2032. Emphasizes manufacturing and logistics transformation.',
  },
  {
    id: 'anthropic',
    company: 'Anthropic',
    capabilityFocus: 'Generative + Agentic',
    focusColor: '#3B82F6',
    peakAutomationYear: 2033,
    laborDisplacementPct: 0.18,
    gdpImpactPct: 0.20,
    newJobsCreatedM: 12.0,
    outlook: 'Conservative',
    notes: 'Emphasizes responsible scaling. Projects significant knowledge-worker augmentation before displacement. Safety requirements delay full autonomy.',
  },
  {
    id: 'google',
    company: 'Google',
    capabilityFocus: 'Generative + Agentic',
    focusColor: '#3B82F6',
    peakAutomationYear: 2032,
    laborDisplacementPct: 0.25,
    gdpImpactPct: 0.35,
    newJobsCreatedM: 15.0,
    outlook: 'Aggressive',
    notes: 'Projects AGI-level capabilities by 2030. Broad portfolio across search, cloud, autonomous vehicles, and scientific research.',
  },
  {
    id: 'openai',
    company: 'OpenAI',
    capabilityFocus: 'Generative + Agentic',
    focusColor: '#F59E0B',
    peakAutomationYear: 2034,
    laborDisplacementPct: 0.28,
    gdpImpactPct: 0.40,
    newJobsCreatedM: 20.0,
    outlook: 'Aggressive',
    notes: 'Projects superintelligent AI by mid-2030s. Expects massive economic restructuring with net-positive job creation through new industries.',
  },
  {
    id: 'figure_ai',
    company: 'Figure AI',
    capabilityFocus: 'Embodied',
    focusColor: '#EF4444',
    peakAutomationYear: 2040,
    laborDisplacementPct: 0.15,
    gdpImpactPct: 0.18,
    newJobsCreatedM: 5.0,
    outlook: 'Moderate',
    notes: 'Focused on humanoid robots for warehouse and manufacturing. Projects cost parity with human labor in structured environments by 2035.',
  },
];

// ============================================================
// Color helpers
// ============================================================

function getDisplacementColor(pct: number): string {
  if (pct > 0.25) return '#EF4444';
  if (pct > 0.15) return '#F97316';
  return '#22C55E';
}

function getGDPImpactColor(pct: number): string {
  if (pct > 0.30) return '#22C55E';
  if (pct > 0.20) return '#4ADE80';
  return '#86EFAC';
}

const OUTLOOK_COLORS: Record<OutlookSentiment, string> = {
  Aggressive: '#F59E0B',
  Moderate: '#3B82F6',
  Conservative: '#22C55E',
};

// ============================================================
// Default sort config
// ============================================================

function defaultDirectionForColumn(col: SortColumn): SortDirection {
  if (col === 'company' || col === 'capabilityFocus') return 'asc';
  return 'desc';
}

// ============================================================
// Main exported component
// ============================================================

export function PredictionsView() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-serif text-text-primary">
          AI Company Projections
        </h2>
        <p className="text-[11px] text-text-muted mt-1 max-w-[600px]">
          How leading AI companies project their technology will impact labor markets and the economy.
          Compare timelines, displacement estimates, and economic outlooks across robotics, model, and agent companies.
        </p>
      </div>

      <PredictionTable />

      <p className="text-[10px] text-text-muted/60 font-mono">
        Projections are illustrative estimates derived from public statements, earnings calls, and published research.
        They do not represent official company forecasts.
      </p>
    </div>
  );
}

// ============================================================
// Sortable table
// ============================================================

function PredictionTable() {
  const [sortColumn, setSortColumn] = useState<SortColumn>('laborDisplacementPct');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (col: SortColumn) => {
    if (col === sortColumn) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection(defaultDirectionForColumn(col));
    }
  };

  const sortedRows = useMemo(() => {
    const sorted = [...COMPANY_PREDICTIONS];
    sorted.sort((a, b) => {
      let cmp = 0;
      switch (sortColumn) {
        case 'company':
          cmp = a.company.localeCompare(b.company);
          break;
        case 'capabilityFocus':
          cmp = a.capabilityFocus.localeCompare(b.capabilityFocus);
          break;
        case 'peakAutomationYear':
          cmp = a.peakAutomationYear - b.peakAutomationYear;
          break;
        case 'laborDisplacementPct':
          cmp = a.laborDisplacementPct - b.laborDisplacementPct;
          break;
        case 'gdpImpactPct':
          cmp = a.gdpImpactPct - b.gdpImpactPct;
          break;
        case 'newJobsCreatedM':
          cmp = a.newJobsCreatedM - b.newJobsCreatedM;
          break;
        case 'outlook': {
          const order: Record<OutlookSentiment, number> = { Aggressive: 3, Moderate: 2, Conservative: 1 };
          cmp = order[a.outlook] - order[b.outlook];
          break;
        }
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [sortColumn, sortDirection]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-border">
            <SortHeader label="Company" column="company" current={sortColumn} direction={sortDirection} onSort={handleSort} />
            <SortHeader label="Focus" column="capabilityFocus" current={sortColumn} direction={sortDirection} onSort={handleSort} />
            <SortHeader label="Peak Year" column="peakAutomationYear" current={sortColumn} direction={sortDirection} onSort={handleSort} align="right" />
            <SortHeader label="Labor Impact" column="laborDisplacementPct" current={sortColumn} direction={sortDirection} onSort={handleSort} align="right" />
            <SortHeader label="GDP Impact" column="gdpImpactPct" current={sortColumn} direction={sortDirection} onSort={handleSort} align="right" />
            <SortHeader label="New Jobs" column="newJobsCreatedM" current={sortColumn} direction={sortDirection} onSort={handleSort} align="right" />
            <SortHeader label="Outlook" column="outlook" current={sortColumn} direction={sortDirection} onSort={handleSort} align="center" />
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, idx) => (
            <PredictionRow key={row.id} row={row} isEven={idx % 2 === 0} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// Sort header (matches OccupationBrowser SortHeader)
// ============================================================

function SortHeader({
  label,
  column,
  current,
  direction,
  onSort,
  align = 'left',
}: {
  label: string;
  column: SortColumn;
  current: SortColumn;
  direction: SortDirection;
  onSort: (col: SortColumn) => void;
  align?: 'left' | 'right' | 'center';
}) {
  const isActive = current === column;
  const arrow = isActive ? (direction === 'asc' ? ' \u2191' : ' \u2193') : '';
  const textAlign = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  return (
    <th
      onClick={() => onSort(column)}
      className={`py-2 px-2 font-medium font-mono uppercase tracking-wider text-[10px] cursor-pointer select-none transition-colors ${textAlign} ${
        isActive ? 'text-gold' : 'text-text-muted hover:text-text-primary'
      }`}
    >
      {label}{arrow}
    </th>
  );
}

// ============================================================
// Table row (matches OccupationBrowser BrowserRow)
// ============================================================

function PredictionRow({ row, isEven }: { row: CompanyPrediction; isEven: boolean }) {
  return (
    <tr
      title={row.notes}
      className={`border-b border-border/50 transition-colors hover:bg-bg-elevated/60 ${
        isEven ? 'bg-bg-elevated/20' : ''
      }`}
    >
      {/* Company */}
      <td className="py-2.5 px-2 text-text-primary font-medium">
        {row.company}
      </td>

      {/* Focus */}
      <td className="py-2.5 px-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: row.focusColor }} />
          <span className="text-text-secondary truncate max-w-[140px]">{row.capabilityFocus}</span>
        </div>
      </td>

      {/* Peak Year */}
      <td className="py-2.5 px-2 text-right font-mono text-text-secondary">
        {row.peakAutomationYear}
      </td>

      {/* Labor Impact */}
      <td className="py-2.5 px-2 text-right font-mono" style={{ color: getDisplacementColor(row.laborDisplacementPct) }}>
        {formatPercent(row.laborDisplacementPct, 1)}
      </td>

      {/* GDP Impact */}
      <td className="py-2.5 px-2 text-right font-mono" style={{ color: getGDPImpactColor(row.gdpImpactPct) }}>
        +{formatPercent(row.gdpImpactPct, 0)}
      </td>

      {/* New Jobs */}
      <td className="py-2.5 px-2 text-right font-mono text-text-secondary">
        {row.newJobsCreatedM.toFixed(1)}M
      </td>

      {/* Outlook */}
      <td className="py-2.5 px-2 text-center">
        <OutlookBadge outlook={row.outlook} />
      </td>
    </tr>
  );
}

// ============================================================
// Outlook badge
// ============================================================

function OutlookBadge({ outlook }: { outlook: OutlookSentiment }) {
  const color = OUTLOOK_COLORS[outlook];
  return (
    <span
      className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-medium uppercase tracking-wider"
      style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
    >
      {outlook}
    </span>
  );
}
