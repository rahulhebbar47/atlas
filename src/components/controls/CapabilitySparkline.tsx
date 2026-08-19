/**
 * ATLAS Capability Sparkline
 *
 * Tiny inline SVG showing the sigmoid trajectory for one capability vector.
 * Computed from getCapabilityScore() using the current store parameters.
 * No axes, no labels — just the curve shape.
 *
 * Frontier-stock overlay (MS1, ruled minimal form): when the current world's supply
 * shocks drain the frontier stock, a dashed supply-chain-orange path of the stock
 * (same 0–1 scale) overlays the curve — the drain and the rebuild trend visible where
 * the user reads capability. Absent entirely on unshocked worlds (every value is 1).
 */

import { useMemo, memo } from 'react';
import type { CapabilityVectorId } from '@/types';
import { getCapabilityScore } from '@/models/capabilities';
import { useSimulationStore } from '@/stores/simulationStore';
import { getCapabilityColor } from '@/utils/colors';

/** Supply-chain accent (SupplyChainControls SC_COLOR) — the overlay is an SC phenomenon. */
const FRONTIER_STOCK_COLOR = '#F97316';

interface CapabilitySparklineProps {
  vectorId: CapabilityVectorId;
  width?: number;
  height?: number;
}

export const CapabilitySparkline = memo(function CapabilitySparkline({
  vectorId,
  width = 72,
  height = 22,
}: CapabilitySparklineProps) {
  const params = useSimulationStore(
    (s) => s.config.capabilities[vectorId],
  );
  const startYear = useSimulationStore((s) => s.config.startYear);
  const endYear = useSimulationStore((s) => s.config.endYear);
  const timeline = useSimulationStore((s) => s.timeline);
  const color = getCapabilityColor(vectorId);

  const pathD = useMemo(() => {
    const years = endYear - startYear;
    if (years <= 0) return '';

    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points: string[] = [];
    for (let i = 0; i <= years; i++) {
      const year = startYear + i;
      const score = getCapabilityScore(vectorId, year, params);
      const x = padding + (i / years) * chartWidth;
      // Invert Y: SVG origin is top-left, score 0 should be bottom
      const y = padding + (1 - score) * chartHeight;
      points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }

    return points.join(' ');
  }, [vectorId, params, startYear, endYear, width, height]);

  // The frontier-stock overlay path: empty string on unshocked worlds (all values 1),
  // so the extra path renders nothing at defaults — the ruled minimal form.
  const stockPathD = useMemo(() => {
    const years = endYear - startYear;
    if (years <= 0 || !timeline.years.length) return '';
    if (!timeline.years.some((y) => y.macro.frontierStock < 1)) return '';

    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points: string[] = [];
    for (const y of timeline.years) {
      const i = y.year - startYear;
      if (i < 0 || i > years) continue;
      const x = padding + (i / years) * chartWidth;
      const yy = padding + (1 - y.macro.frontierStock) * chartHeight;
      points.push(`${points.length === 0 ? 'M' : 'L'}${x.toFixed(1)},${yy.toFixed(1)}`);
    }
    return points.join(' ');
  }, [timeline, startYear, endYear, width, height]);

  // The cost-clock overlay (flywheel MS, ruling 5's minimal form): normalized clock
  // progress τ(t)/(t − startYear) — exactly 1 on funded paths (renders nothing), sags
  // when the flywheel is starved and the cost decline stalls. Same scale as the stock.
  const clockPathD = useMemo(() => {
    const years = endYear - startYear;
    if (years <= 0 || !timeline.years.length) return '';
    const progress = (y: (typeof timeline.years)[number]): number => {
      const t = y.year - startYear;
      return t > 0 ? y.macro.effectiveCostTime / t : 1;
    };
    if (!timeline.years.some((y) => progress(y) < 0.999)) return '';

    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const points: string[] = [];
    for (const y of timeline.years) {
      const i = y.year - startYear;
      if (i < 0 || i > years) continue;
      const x = padding + (i / years) * chartWidth;
      const yy = padding + (1 - Math.max(0, Math.min(1, progress(y)))) * chartHeight;
      points.push(`${points.length === 0 ? 'M' : 'L'}${x.toFixed(1)},${yy.toFixed(1)}`);
    }
    return points.join(' ');
  }, [timeline, startYear, endYear, width, height]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="flex-shrink-0"
    >
      {stockPathD && (
        <path
          d={stockPathD}
          fill="none"
          stroke={FRONTIER_STOCK_COLOR}
          strokeWidth={1}
          strokeDasharray="2 2"
          strokeOpacity={0.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {clockPathD && (
        <path
          d={clockPathD}
          fill="none"
          stroke={FRONTIER_STOCK_COLOR}
          strokeWidth={1}
          strokeDasharray="4 3"
          strokeOpacity={0.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});
