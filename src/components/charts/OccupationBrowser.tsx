/**
 * ATLAS Occupation Cluster Browser (Phase 4)
 *
 * Sortable data table of all 51 clusters following DESIGN_PHILOSOPHY.md:
 * - Monospace numbers, right-aligned
 * - Alternating row backgrounds
 * - Sortable column headers (click to toggle asc/desc)
 * - Inline sparklines for displacement trajectory
 * - Color-coded displacement and wage cells
 * - Click row → navigate to occupation detail view
 */

import { useState, useMemo, useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { useClusterBrowserData, type ClusterBrowserRow } from '@/hooks/useOccupationData';
import { DisplacementSparkline } from './DisplacementSparkline';
import { formatNumber, formatPercent } from '@/utils/format';
import { getBFCSProximityColor } from '@/utils/colors';

type SortColumn =
  | 'name'
  | 'category'
  | 'employment'
  | 'displacement'
  | 'trigger'
  | 'wage';

type SortDirection = 'asc' | 'desc';

export function OccupationBrowser() {
  const [sortColumn, setSortColumn] = useState<SortColumn>('displacement');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const setSelectedCluster = useSimulationStore((s) => s.setSelectedCluster);

  const rows = useClusterBrowserData();

  const sortedRows = useMemo(() => {
    const sorted = [...rows];
    sorted.sort((a, b) => {
      let cmp = 0;
      switch (sortColumn) {
        case 'name':
          cmp = a.clusterName.localeCompare(b.clusterName);
          break;
        case 'category':
          cmp = a.category.localeCompare(b.category) || a.clusterName.localeCompare(b.clusterName);
          break;
        case 'employment':
          cmp = a.totalEmployment - b.totalEmployment;
          break;
        case 'displacement':
          cmp = a.displacementPercent - b.displacementPercent;
          break;
        case 'trigger':
          cmp = (a.earliestTriggerYear ?? 9999) - (b.earliestTriggerYear ?? 9999);
          break;
        case 'wage':
          cmp = a.wageChangePercent - b.wageChangePercent;
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [rows, sortColumn, sortDirection]);

  const handleSort = useCallback((column: SortColumn) => {
    setSortColumn((prev) => {
      if (prev === column) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
        return column;
      }
      setSortDirection(column === 'name' || column === 'category' ? 'asc' : 'desc');
      return column;
    });
  }, []);

  const handleRowClick = useCallback(
    (clusterId: string) => {
      setSelectedCluster(clusterId);
    },
    [setSelectedCluster],
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-border">
            <SortHeader column="name" label="Cluster" current={sortColumn} direction={sortDirection} onSort={handleSort} align="left" />
            <SortHeader column="category" label="Category" current={sortColumn} direction={sortDirection} onSort={handleSort} align="left" />
            <SortHeader column="employment" label="Employment" current={sortColumn} direction={sortDirection} onSort={handleSort} align="right" />
            <SortHeader column="displacement" label="Displaced %" current={sortColumn} direction={sortDirection} onSort={handleSort} align="right" />
            <SortHeader column="trigger" label="Trigger" current={sortColumn} direction={sortDirection} onSort={handleSort} align="right" />
            <SortHeader column="wage" label="Wage %" current={sortColumn} direction={sortDirection} onSort={handleSort} align="right" />
            <th className="py-2 px-2 text-text-muted font-medium text-right font-mono uppercase tracking-wider text-[10px]">
              Trajectory
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, i) => (
            <BrowserRow
              key={row.clusterId}
              row={row}
              isEven={i % 2 === 0}
              onClick={handleRowClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Sortable column header. */
function SortHeader({
  column,
  label,
  current,
  direction,
  onSort,
  align,
}: {
  column: SortColumn;
  label: string;
  current: SortColumn;
  direction: SortDirection;
  onSort: (column: SortColumn) => void;
  align: 'left' | 'right';
}) {
  const isActive = current === column;
  return (
    <th
      className={`py-2 px-2 font-medium font-mono uppercase tracking-wider text-[10px] cursor-pointer select-none transition-colors hover:text-text-primary ${
        align === 'right' ? 'text-right' : 'text-left'
      } ${isActive ? 'text-gold' : 'text-text-muted'}`}
      onClick={() => onSort(column)}
    >
      {label}
      {isActive && (
        <span className="ml-0.5">
          {direction === 'asc' ? '\u2191' : '\u2193'}
        </span>
      )}
    </th>
  );
}

/** Single row in the browser table. */
function BrowserRow({
  row,
  isEven,
  onClick,
}: {
  row: ClusterBrowserRow;
  isEven: boolean;
  onClick: (clusterId: string) => void;
}) {
  const displacementColor = getDisplacementColor(row.displacementPercent);
  const wageColor = row.wageChangePercent < -0.05 ? '#EF4444' : row.wageChangePercent < -0.01 ? '#F97316' : '#9CA3AF';
  const sparklineColor = getBFCSProximityColor(row.bfcsMaxProximity);

  return (
    <tr
      className={`border-b border-border/50 cursor-pointer transition-colors hover:bg-bg-elevated/60 ${
        isEven ? 'bg-bg-elevated/20' : ''
      }`}
      onClick={() => onClick(row.clusterId)}
    >
      {/* Cluster name */}
      <td className="py-1.5 px-2 text-text-primary font-medium truncate max-w-[160px]">
        {row.clusterName}
      </td>

      {/* Category */}
      <td className="py-1.5 px-2">
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: row.categoryColor }}
          />
          <span className="text-text-secondary truncate max-w-[100px]">
            {row.category}
          </span>
        </div>
      </td>

      {/* Employment */}
      <td className="py-1.5 px-2 text-right font-mono text-text-secondary">
        {formatNumber(row.totalEmployment, { compact: true })}
      </td>

      {/* Displaced % */}
      <td className="py-1.5 px-2 text-right font-mono" style={{ color: displacementColor }}>
        {formatPercent(row.displacementPercent, 1)}
      </td>

      {/* Trigger year */}
      <td className="py-1.5 px-2 text-right font-mono text-text-secondary">
        {row.earliestTriggerYear ?? '\u2014'}
      </td>

      {/* Wage change % */}
      <td className="py-1.5 px-2 text-right font-mono" style={{ color: wageColor }}>
        {row.wageChangePercent !== 0
          ? `${row.wageChangePercent > 0 ? '+' : ''}${formatPercent(row.wageChangePercent, 1)}`
          : '\u2014'}
      </td>

      {/* Sparkline */}
      <td className="py-1.5 px-2 text-right">
        <div className="flex justify-end">
          <DisplacementSparkline
            data={row.displacementTrajectory}
            color={sparklineColor}
          />
        </div>
      </td>
    </tr>
  );
}

function getDisplacementColor(percent: number): string {
  if (percent > 0.3) return '#EF4444';  // red >30%
  if (percent > 0.1) return '#F97316';  // orange 10-30%
  return '#22C55E';                      // green <10%
}
