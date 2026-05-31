/**
 * ATLAS BFCS Trajectory Chart (Phase 4)
 *
 * Shows 4 BFCS score lines (B, F, C, S) over time for a specific role
 * within a cluster. Horizontal reference lines show the threshold values.
 * Role selector (button group) above chart for switching between roles.
 *
 * Follows EmploymentChart.tsx pattern: Card wrapper, Recharts, axis styling,
 * custom tooltip.
 */

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { useClusterDetailData } from '@/hooks/useOccupationData';
import { useSimulationStore } from '@/stores/simulationStore';
import { BFCS_DIMENSION_COLORS, BFCS_DIMENSION_LABELS } from '@/models/constants';
import type { BFCSThresholds } from '@/types';

const DIMENSIONS: (keyof BFCSThresholds)[] = ['better', 'faster', 'cheaper', 'safer'];

interface BFCSTrajectoryChartProps {
  clusterId: string;
}

interface BFCSDataPoint {
  year: number;
  better: number;
  faster: number;
  cheaper: number;
  safer: number;
}

export function BFCSTrajectoryChart({ clusterId }: BFCSTrajectoryChartProps) {
  const detail = useClusterDetailData(clusterId);
  const bfcsOverrides = useSimulationStore((s) => s.config.bfcsOverrides);

  // Get available roles
  const roles = useMemo(() => {
    if (!detail?.yearlyData.length) return [];
    const firstYear = detail.yearlyData[0];
    if (!firstYear) return [];
    return firstYear.cluster.bfcsOutput.map((r) => ({
      id: r.roleId,
      label: r.roleId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    }));
  }, [detail]);

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const activeRoleId = selectedRoleId ?? roles[0]?.id ?? null;

  // Build time series data for the selected role
  const { chartData, thresholds } = useMemo(() => {
    if (!detail || !activeRoleId) {
      return { chartData: [] as BFCSDataPoint[], thresholds: null };
    }

    const data: BFCSDataPoint[] = [];
    let roleThresholds: BFCSThresholds | null = null;

    for (const { year, cluster } of detail.yearlyData) {
      const roleOutput = cluster.bfcsOutput.find((r) => r.roleId === activeRoleId);
      if (roleOutput) {
        data.push({
          year,
          better: roleOutput.scores.better,
          faster: roleOutput.scores.faster,
          cheaper: roleOutput.scores.cheaper,
          safer: roleOutput.scores.safer,
        });
        if (!roleThresholds) {
          // Use effective thresholds (with overrides applied)
          roleThresholds = bfcsOverrides[clusterId]?.[activeRoleId] ?? roleOutput.thresholds;
        }
      }
    }

    return { chartData: data, thresholds: roleThresholds };
  }, [detail, activeRoleId, clusterId, bfcsOverrides]);

  if (!detail || roles.length === 0) return null;

  return (
    <Card title="BFCS Score Trajectories">
      {/* Role selector */}
      <div className="flex gap-1 mb-4">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRoleId(role.id)}
            className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
              activeRoleId === role.id
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'bg-bg-elevated text-text-muted border border-border hover:text-text-secondary'
            }`}
          >
            {role.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="2 6"
            stroke="rgba(138, 150, 173, 0.06)"
            vertical={false}
          />

          <XAxis
            dataKey="year"
            tick={{ fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }}
            tickLine={false}
            ticks={[2025, 2030, 2035, 2040, 2045, 2050]}
          />

          <YAxis
            domain={[0, 1]}
            tick={{ fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => v.toFixed(1)}
            width={32}
          />

          {/* Threshold reference lines */}
          {thresholds && DIMENSIONS.map((dim) => (
            <ReferenceLine
              key={`threshold-${dim}`}
              y={thresholds[dim]}
              stroke={BFCS_DIMENSION_COLORS[dim]}
              strokeDasharray="4 4"
              strokeWidth={1}
              strokeOpacity={0.5}
            />
          ))}

          {/* Score lines */}
          {DIMENSIONS.map((dim) => (
            <Line
              key={dim}
              type="monotone"
              dataKey={dim}
              stroke={BFCS_DIMENSION_COLORS[dim]}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 3,
                fill: BFCS_DIMENSION_COLORS[dim],
                stroke: '#080D18',
                strokeWidth: 2,
              }}
            />
          ))}

          <Tooltip content={<BFCSTooltip thresholds={thresholds} />} />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-3">
        {DIMENSIONS.map((dim) => (
          <div key={dim} className="flex items-center gap-1.5">
            <div
              className="w-3 h-[2px] rounded-full"
              style={{ background: BFCS_DIMENSION_COLORS[dim] }}
            />
            <span className="text-text-muted text-[10px] font-mono">
              {BFCS_DIMENSION_LABELS[dim]}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0 border-t border-dashed border-text-muted" />
          <span className="text-text-muted text-[10px] font-mono">Threshold</span>
        </div>
      </div>
    </Card>
  );
}

function BFCSTooltip({
  active,
  payload,
  label,
  thresholds,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
  thresholds: BFCSThresholds | null;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">
        {label}
      </div>
      {DIMENSIONS.map((dim) => {
        const entry = payload.find((p) => p.dataKey === dim);
        if (!entry) return null;
        const threshold = thresholds?.[dim] ?? 0;
        const isMet = entry.value >= threshold;
        return (
          <div key={dim} className="flex items-center gap-2 text-[11px] mt-0.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: BFCS_DIMENSION_COLORS[dim] }}
            />
            <span className="text-text-secondary w-12">
              {dim.charAt(0).toUpperCase() + dim.slice(1)}
            </span>
            <span className="font-mono text-text-primary ml-auto">
              {entry.value.toFixed(2)}
            </span>
            <span className={`font-mono text-[9px] ${isMet ? 'text-critical' : 'text-text-muted'}`}>
              {isMet ? 'MET' : `/${threshold.toFixed(2)}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
