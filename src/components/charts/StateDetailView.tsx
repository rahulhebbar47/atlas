/**
 * ATLAS State Detail View (Phase 6)
 *
 * Per-state deep dive shown when a state is selected from the choropleth map.
 * Contains:
 * 1. Back button + state header with key metric cards
 * 2. Displacement timeline chart (Recharts area chart)
 * 3. Industry exposure: horizontal bar chart of top clusters by impact
 */

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { useSimulationStore } from '@/stores/simulationStore';
import { useStateTimeSeries, useStateMapData } from '@/hooks/useStateData';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { STATE_NAMES } from '@/data/stateData';
import { Card } from '@/components/shared/Card';
import { formatPercent, formatCurrency, formatNumber } from '@/utils/format';
import { getCategoryColor } from '@/utils/colors';
import type { StateCode } from '@/types';

// ============================================================
// Component
// ============================================================

export function StateDetailView() {
  const selectedStateCode = useSimulationStore((s) => s.selectedStateCode);
  const setSelectedState = useSimulationStore((s) => s.setSelectedState);
  const currentYear = useSimulationStore((s) => s.currentYear);
  const years = useSimulationStore((s) => s.timeline.years);

  const timeSeries = useStateTimeSeries(selectedStateCode);
  const mapData = useStateMapData();

  // Current-year data for this state
  const currentData = useMemo(() => {
    return mapData.find((d) => d.code === selectedStateCode);
  }, [mapData, selectedStateCode]);

  // Industry exposure: per-cluster displacement for this state
  const industryExposure = useMemo(() => {
    if (!selectedStateCode) return [];

    const yearData = years.find((y) => y.year === currentYear);
    if (!yearData) return [];

    const stateOutput = yearData.states?.find((s) => s.code === selectedStateCode);
    if (!stateOutput) return [];

    // Get national cluster results for displacement rates
    return yearData.clusters
      .map((cluster) => {
        const clusterDef = OCCUPATION_CLUSTERS.find((c) => c.id === cluster.clusterId);
        if (!clusterDef) return null;

        const displacement = 1 - (cluster.totalRemainingEmployment / (cluster.totalRemainingEmployment + cluster.totalDirectDisplacement));
        if (displacement < 0.001) return null;

        return {
          clusterId: cluster.clusterId,
          name: clusterDef.name.length > 25
            ? clusterDef.name.slice(0, 22) + '...'
            : clusterDef.name,
          fullName: clusterDef.name,
          category: clusterDef.category,
          displacement,
        };
      })
      .filter((d): d is NonNullable<typeof d> => d !== null)
      .sort((a, b) => b.displacement - a.displacement)
      .slice(0, 10);
  }, [selectedStateCode, years, currentYear]);

  if (!selectedStateCode || !currentData) return null;

  const stateName = STATE_NAMES[selectedStateCode] ?? selectedStateCode;

  return (
    <div className="space-y-6">
      {/* Back button + header */}
      <div>
        <button
          onClick={() => setSelectedState(null)}
          className="flex items-center gap-1.5 text-text-muted hover:text-gold text-[11px] font-mono mb-2 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 9L4.5 6L7.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Map
        </button>

        <h2 className="font-display text-xl text-text-primary">
          {stateName}
        </h2>
      </div>

      {/* Key metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Displacement"
          value={formatPercent(currentData.displacement)}
          color={currentData.displacement > 0.15 ? '#EF4444' : currentData.displacement > 0.08 ? '#F97316' : '#22C55E'}
        />
        <MetricCard
          label="Unemployment"
          value={formatPercent(currentData.unemploymentRate)}
          color={currentData.unemploymentRate > 0.08 ? '#EF4444' : currentData.unemploymentRate > 0.05 ? '#F97316' : '#22C55E'}
        />
        <MetricCard
          label="CWI"
          value={formatCurrency(currentData.consumerWelfareIndex, { compact: true })}
          color="#8A96AD"
        />
        <MetricCard
          label="Policy Effect."
          value={formatPercent(currentData.policyEffectiveness)}
          color={currentData.policyEffectiveness > 0.7 ? '#22C55E' : currentData.policyEffectiveness > 0.4 ? '#F97316' : '#EF4444'}
        />
      </div>

      {/* Displacement timeline chart */}
      {timeSeries.length > 0 && (
        <Card title="Displacement Over Time">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={timeSeries}
              margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="stateDisplacementFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4A03C" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#D4A03C" stopOpacity={0.02} />
                </linearGradient>
              </defs>

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
                tick={{ fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatPercent(v, 0)}
                width={48}
              />

              <Area
                type="monotone"
                dataKey="displacement"
                stroke="#D4A03C"
                strokeWidth={2}
                fill="url(#stateDisplacementFill)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: '#D4A03C',
                  stroke: '#080D18',
                  strokeWidth: 2,
                }}
              />

              <Tooltip content={<StateTimelineTooltip />} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Industry exposure bar chart */}
      {industryExposure.length > 0 && (
        <Card title="Top Industry Exposure">
          <ResponsiveContainer width="100%" height={Math.max(200, industryExposure.length * 28 + 20)}>
            <BarChart
              data={industryExposure}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="2 6"
                stroke="rgba(138, 150, 173, 0.06)"
                horizontal={false}
              />

              <XAxis
                type="number"
                tick={{ fill: '#4E5D75', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatPercent(v, 0)}
              />

              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#8A96AD', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={false}
                tickLine={false}
                width={140}
              />

              <Bar dataKey="displacement" radius={[0, 3, 3, 0]} barSize={16}>
                {industryExposure.map((entry) => (
                  <Cell
                    key={entry.clusterId}
                    fill={getCategoryColor(entry.category)}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>

              <Tooltip content={<IndustryTooltip />} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-[12px] p-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted mb-1">
        {label}
      </div>
      <div className="font-mono text-lg font-medium" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function StateTimelineTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-[11px]">
          <span className="text-text-secondary capitalize">{p.dataKey}</span>
          <span className="font-mono text-text-primary ml-auto">
            {formatPercent(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function IndustryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { fullName: string; displacement: number; category: string } }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const entry = payload[0];
  if (!entry) return null;
  const data = entry.payload;
  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="text-text-primary text-[11px] font-medium mb-1">
        {data.fullName}
      </div>
      <div className="flex items-center gap-2 text-[11px]">
        <span className="text-text-muted">Displacement</span>
        <span className="font-mono text-text-primary ml-auto">
          {formatPercent(data.displacement)}
        </span>
      </div>
    </div>
  );
}
