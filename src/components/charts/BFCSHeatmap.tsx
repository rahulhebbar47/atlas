/**
 * ATLAS BFCS Heatmap (Phase 4)
 *
 * Matrix view: occupation clusters (rows) x BFCS dimensions (columns).
 * Cell color = proximity of score to threshold for the most-vulnerable role.
 * Grouped by category with divider headers.
 *
 * Custom SVG — no library needed. Click row navigates to detail view.
 */

import { useMemo, useState, useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { useClusterBrowserData } from '@/hooks/useOccupationData';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { getBFCSProximityColor, getCategoryColor } from '@/utils/colors';
import { BFCS_DIMENSION_COLORS, BFCS_DIMENSION_LABELS } from '@/models/constants';
import type { BFCSThresholds, BFCSScores, RoleBFCSOutput } from '@/types';

const DIMENSIONS: (keyof BFCSThresholds)[] = ['better', 'faster', 'cheaper', 'safer'];

interface HeatmapRow {
  clusterId: string;
  clusterName: string;
  category: string;
  proximities: Record<keyof BFCSThresholds, number>;
  triggered: boolean;
}

export function BFCSHeatmap() {
  const years = useSimulationStore((s) => s.timeline.years);
  const currentYear = useSimulationStore((s) => s.currentYear);
  const setSelectedCluster = useSimulationStore((s) => s.setSelectedCluster);

  const [hoveredCell, setHoveredCell] = useState<{
    clusterId: string;
    dimension: keyof BFCSThresholds;
    score: number;
    threshold: number;
    proximity: number;
  } | null>(null);

  const rows = useMemo(() => {
    const currentYearData = years.find((y) => y.year === currentYear) ?? years[years.length - 1];
    if (!currentYearData) return [];

    return OCCUPATION_CLUSTERS.map((cluster): HeatmapRow => {
      const clusterData = currentYearData.clusters.find((c) => c.clusterId === cluster.id);
      const bfcsOutput = clusterData?.bfcsOutput ?? [];

      // Find the most-vulnerable role (highest minimum proximity across dimensions)
      const mostVulnerable = findMostVulnerableRole(bfcsOutput);
      const proximities: Record<keyof BFCSThresholds, number> = {
        better: 0, faster: 0, cheaper: 0, safer: 0,
      };
      let triggered = false;

      if (mostVulnerable) {
        for (const dim of DIMENSIONS) {
          const threshold = mostVulnerable.thresholds[dim];
          proximities[dim] = threshold > 0
            ? mostVulnerable.scores[dim] / threshold
            : 0;
        }
        triggered = mostVulnerable.triggered;
      }

      return {
        clusterId: cluster.id,
        clusterName: cluster.name,
        category: cluster.category,
        proximities,
        triggered,
      };
    });
  }, [years, currentYear]);

  // Group by category
  const groupedRows = useMemo(() => {
    const groups: Array<{ category: string; rows: HeatmapRow[] }> = [];
    let currentCategory = '';

    for (const row of rows) {
      if (row.category !== currentCategory) {
        currentCategory = row.category;
        groups.push({ category: currentCategory, rows: [] });
      }
      groups[groups.length - 1]!.rows.push(row);
    }

    return groups;
  }, [rows]);

  const handleRowClick = useCallback(
    (clusterId: string) => {
      setSelectedCluster(clusterId);
    },
    [setSelectedCluster],
  );

  const CELL_HEIGHT = 24;
  const NAME_WIDTH = 170;
  const CELL_WIDTH = 56;
  const HEADER_HEIGHT = 22;
  const GAP = 1;

  // Calculate total rows including category headers
  let totalRows = 0;
  for (const group of groupedRows) {
    totalRows += 1; // category header
    totalRows += group.rows.length;
  }
  const svgHeight = totalRows * (CELL_HEIGHT + GAP) + 40; // extra padding top for column headers
  const svgWidth = NAME_WIDTH + DIMENSIONS.length * (CELL_WIDTH + GAP);

  return (
    <div className="space-y-3">
      {/* Column headers */}
      <div className="flex items-center gap-4">
        <div style={{ width: NAME_WIDTH }} />
        {DIMENSIONS.map((dim) => (
          <div
            key={dim}
            className="font-mono text-[10px] font-medium uppercase tracking-wider text-center"
            style={{ width: CELL_WIDTH, color: BFCS_DIMENSION_COLORS[dim] }}
          >
            {dim.charAt(0).toUpperCase()}*
          </div>
        ))}
      </div>

      {/* Heatmap body */}
      <div className="overflow-y-auto max-h-[600px]">
        {groupedRows.map((group) => (
          <div key={group.category}>
            {/* Category header */}
            <div className="flex items-center gap-2 py-1.5 mt-2 first:mt-0">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: getCategoryColor(group.category) }}
              />
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted">
                {group.category}
              </span>
            </div>

            {/* Cluster rows */}
            {group.rows.map((row) => (
              <div
                key={row.clusterId}
                className="flex items-center gap-[1px] cursor-pointer hover:bg-bg-elevated/40 rounded transition-colors"
                onClick={() => handleRowClick(row.clusterId)}
              >
                {/* Cluster name */}
                <div
                  className="text-[10px] text-text-secondary truncate pr-2 py-0.5"
                  style={{ width: NAME_WIDTH }}
                  title={row.clusterName}
                >
                  {row.clusterName}
                </div>

                {/* Dimension cells */}
                {DIMENSIONS.map((dim) => {
                  const proximity = row.proximities[dim];
                  const color = getBFCSProximityColor(proximity);

                  return (
                    <div
                      key={dim}
                      className="relative rounded-sm transition-opacity"
                      style={{
                        width: CELL_WIDTH,
                        height: CELL_HEIGHT,
                        background: color,
                        opacity: proximity > 0 ? 0.15 + Math.min(proximity, 1.5) * 0.55 : 0.1,
                      }}
                      onMouseEnter={() =>
                        setHoveredCell({
                          clusterId: row.clusterId,
                          dimension: dim,
                          score: proximity * 1, // Proxy — actual score = proximity * threshold
                          threshold: 1,
                          proximity,
                        })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {/* Inner score label */}
                      <div
                        className="absolute inset-0 flex items-center justify-center font-mono text-[9px]"
                        style={{
                          color: proximity >= 1.0 ? '#FFF' : proximity >= 0.5 ? '#E8ECF4' : '#8A96AD',
                        }}
                      >
                        {(proximity * 100).toFixed(0)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div className="fixed pointer-events-none z-50" style={{ display: 'none' }}>
          {/* Tooltip is shown inline via cell labels instead */}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <span className="text-text-muted text-[10px] font-mono">Proximity:</span>
        <LegendSwatch color="#22C55E" label="< 50%" />
        <LegendSwatch color="#F59E0B" label="50-80%" />
        <LegendSwatch color="#F97316" label="80-100%" />
        <LegendSwatch color="#EF4444" label="Triggered" />
      </div>
    </div>
  );
}

/** Find the most-vulnerable role — highest minimum proximity across all 4 dimensions. */
function findMostVulnerableRole(bfcsOutput: RoleBFCSOutput[]): {
  scores: BFCSScores;
  thresholds: BFCSThresholds;
  triggered: boolean;
} | null {
  if (bfcsOutput.length === 0) return null;

  let best: typeof bfcsOutput[0] | null = null;
  let bestMinProximity = -1;

  for (const role of bfcsOutput) {
    let minProximity = Infinity;
    for (const dim of DIMENSIONS) {
      const threshold = role.thresholds[dim];
      if (threshold > 0) {
        const proximity = role.scores[dim] / threshold;
        if (proximity < minProximity) minProximity = proximity;
      }
    }
    if (minProximity !== Infinity && minProximity > bestMinProximity) {
      bestMinProximity = minProximity;
      best = role;
    }
  }

  return best;
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div
        className="w-3 h-3 rounded-sm"
        style={{ background: color, opacity: 0.6 }}
      />
      <span className="text-text-muted text-[9px] font-mono">{label}</span>
    </div>
  );
}
