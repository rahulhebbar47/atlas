/**
 * ATLAS Historical Comparison Chart
 *
 * Overlays the ATLAS AI displacement projection against past automation waves:
 * - Industrial Revolution (1760-1840): 80-year transition
 * - Computerization wave (1980-2020): 40-year transition
 * - ATLAS AI projection: current simulation
 *
 * X-axis: "Years from onset" (normalized to 0)
 * Y-axis: Employment as % of baseline (100% = pre-automation)
 *
 * Key insight: software AI has no physical manufacturing constraint,
 * so displacement can be faster than historical precedents.
 *
 * Sources:
 *   Industrial Revolution: Frey & Osborne (2017), Allen (2009)
 *   Computerization: Autor, Levy, Murnane (2003); BLS CES data
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useMemo } from 'react';
import { Card } from '@/components/shared/Card';
import { useSimulationStore } from '@/stores/simulationStore';
import { formatPercent } from '@/utils/format';

// ============================================================
// Historical Data Constants
// ============================================================

/**
 * Industrial Revolution employment impact (normalized).
 * ~80-year transition. Initial displacement was gradual, then accelerated.
 * Employment as % of baseline (artisan/cottage industry workforce).
 *
 * Source: Allen (2009) "The British Industrial Revolution in Global Perspective"
 *         Frey & Osborne (2017) "The Future of Employment"
 */
const INDUSTRIAL_REVOLUTION: Array<{ yearsFromOnset: number; employmentPct: number }> = [
  { yearsFromOnset: 0, employmentPct: 1.0 },
  { yearsFromOnset: 5, employmentPct: 0.98 },
  { yearsFromOnset: 10, employmentPct: 0.95 },
  { yearsFromOnset: 15, employmentPct: 0.92 },
  { yearsFromOnset: 20, employmentPct: 0.88 },
  { yearsFromOnset: 25, employmentPct: 0.84 },
  { yearsFromOnset: 30, employmentPct: 0.80 },
  { yearsFromOnset: 35, employmentPct: 0.78 },
  { yearsFromOnset: 40, employmentPct: 0.76 },
  { yearsFromOnset: 45, employmentPct: 0.75 },
  { yearsFromOnset: 50, employmentPct: 0.74 },
  { yearsFromOnset: 55, employmentPct: 0.75 },
  { yearsFromOnset: 60, employmentPct: 0.78 },
  { yearsFromOnset: 65, employmentPct: 0.82 },
  { yearsFromOnset: 70, employmentPct: 0.88 },
  { yearsFromOnset: 75, employmentPct: 0.94 },
  { yearsFromOnset: 80, employmentPct: 1.02 }, // eventual job growth from new industries
];

/**
 * Computerization wave employment impact (normalized).
 * ~40-year transition. Moderate displacement with strong job creation.
 *
 * Source: Autor, Levy, Murnane (2003) "The Skill Content of Recent Technological Change"
 *         BLS CES total nonfarm employment series
 */
const COMPUTERIZATION_WAVE: Array<{ yearsFromOnset: number; employmentPct: number }> = [
  { yearsFromOnset: 0, employmentPct: 1.0 },
  { yearsFromOnset: 5, employmentPct: 0.99 },
  { yearsFromOnset: 10, employmentPct: 0.97 },
  { yearsFromOnset: 15, employmentPct: 0.96 },
  { yearsFromOnset: 20, employmentPct: 0.95 },
  { yearsFromOnset: 25, employmentPct: 0.96 },
  { yearsFromOnset: 30, employmentPct: 0.98 },
  { yearsFromOnset: 35, employmentPct: 1.01 },
  { yearsFromOnset: 40, employmentPct: 1.05 },
];

export function HistoricalComparisonChart() {
  const years = useSimulationStore((s) => s.timeline.years);

  const data = useMemo(() => {
    if (years.length === 0) return [];

    const baselineEmployment = years[0]!.macro.totalEmployment;
    if (baselineEmployment === 0) return [];

    // ATLAS projection: normalize to years-from-onset and employment %
    const atlasData = years.map((y, i) => ({
      yearsFromOnset: i,
      atlas: y.macro.totalEmployment / baselineEmployment,
    }));

    // Merge all series into a single array keyed by yearsFromOnset
    const maxYears = Math.max(
      atlasData.length,
      INDUSTRIAL_REVOLUTION.length > 0 ? INDUSTRIAL_REVOLUTION[INDUSTRIAL_REVOLUTION.length - 1]!.yearsFromOnset + 1 : 0,
      COMPUTERIZATION_WAVE.length > 0 ? COMPUTERIZATION_WAVE[COMPUTERIZATION_WAVE.length - 1]!.yearsFromOnset + 1 : 0,
    );

    const merged: Array<{
      yearsFromOnset: number;
      atlas?: number;
      industrial?: number;
      computerization?: number;
    }> = [];

    for (let i = 0; i < maxYears; i++) {
      const point: {
        yearsFromOnset: number;
        atlas?: number;
        industrial?: number;
        computerization?: number;
      } = { yearsFromOnset: i };

      // ATLAS
      const atlasPoint = atlasData.find((d) => d.yearsFromOnset === i);
      if (atlasPoint) point.atlas = atlasPoint.atlas;

      // Industrial Revolution (interpolate between data points)
      point.industrial = interpolateHistorical(INDUSTRIAL_REVOLUTION, i);

      // Computerization
      point.computerization = interpolateHistorical(COMPUTERIZATION_WAVE, i);

      merged.push(point);
    }

    return merged;
  }, [years]);

  if (data.length === 0) return null;

  return (
    <Card
      title="Historical Comparison"
      subtitle="Employment impact: AI vs. past automation waves (normalized to onset year)"
    >
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="2 6"
            stroke="rgba(138, 150, 173, 0.06)"
            vertical={false}
          />

          <XAxis
            dataKey="yearsFromOnset"
            tick={{ fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }}
            tickLine={false}
            label={{
              value: 'Years from Onset',
              position: 'insideBottom',
              offset: -2,
              fill: '#4E5D75',
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />

          <YAxis
            tick={{ fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatPercent(v, 0)}
            domain={[0.5, 1.1]}
            width={52}
          />

          {/* 100% baseline reference */}
          <ReferenceLine
            y={1.0}
            stroke="rgba(138, 150, 173, 0.2)"
            strokeDasharray="4 4"
            label={{
              value: 'Baseline',
              position: 'insideTopLeft',
              fill: '#4E5D75',
              fontSize: 9,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />

          {/* ATLAS AI Projection — primary */}
          <Line
            type="monotone"
            dataKey="atlas"
            name="AI Displacement (ATLAS)"
            stroke="#D4A03C"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#D4A03C', stroke: '#080D18', strokeWidth: 2 }}
            connectNulls={false}
          />

          {/* Industrial Revolution — historical */}
          <Line
            type="monotone"
            dataKey="industrial"
            name="Industrial Revolution"
            stroke="#6366F1"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            dot={false}
            activeDot={{ r: 3, fill: '#6366F1', stroke: '#080D18', strokeWidth: 2 }}
            connectNulls={false}
          />

          {/* Computerization — historical */}
          <Line
            type="monotone"
            dataKey="computerization"
            name="Computerization (1980s)"
            stroke="#06B6D4"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={false}
            activeDot={{ r: 3, fill: '#06B6D4', stroke: '#080D18', strokeWidth: 2 }}
            connectNulls={false}
          />

          <Tooltip content={<HistoricalTooltip />} />

          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="line"
            wrapperStyle={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              color: '#8A96AD',
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Annotation */}
      <div className="mt-3 px-2 text-[10px] text-text-muted font-mono leading-relaxed">
        <span className="text-gold">Key difference:</span> Software AI has no physical
        manufacturing or infrastructure constraint — displacement can propagate at the speed
        of deployment, not the speed of factory construction.
      </div>
    </Card>
  );
}

/** Interpolate a value from a historical data series */
function interpolateHistorical(
  data: Array<{ yearsFromOnset: number; employmentPct: number }>,
  year: number,
): number | undefined {
  if (data.length === 0) return undefined;
  if (year < data[0]!.yearsFromOnset || year > data[data.length - 1]!.yearsFromOnset) {
    return undefined;
  }

  // Find surrounding points
  for (let i = 0; i < data.length - 1; i++) {
    const a = data[i]!;
    const b = data[i + 1]!;
    if (year >= a.yearsFromOnset && year <= b.yearsFromOnset) {
      const t = (year - a.yearsFromOnset) / (b.yearsFromOnset - a.yearsFromOnset);
      return a.employmentPct + t * (b.employmentPct - a.employmentPct);
    }
  }

  return undefined;
}

function HistoricalTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; name: string; color: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">
        Year +{label}
      </div>
      {payload.map((entry) => (
        entry.value != null && (
          <div key={entry.dataKey} className="flex items-center gap-2 text-[11px] mb-0.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-text-secondary truncate max-w-[160px]">{entry.name}</span>
            <span className="font-mono text-text-primary ml-auto">
              {formatPercent(entry.value, 1)}
            </span>
          </div>
        )
      ))}
    </div>
  );
}
