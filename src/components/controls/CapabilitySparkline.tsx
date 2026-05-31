/**
 * ATLAS Capability Sparkline
 *
 * Tiny inline SVG showing the sigmoid trajectory for one capability vector.
 * Computed from getCapabilityScore() using the current store parameters.
 * No axes, no labels — just the curve shape.
 */

import { useMemo, memo } from 'react';
import type { CapabilityVectorId } from '@/types';
import { getCapabilityScore } from '@/models/capabilities';
import { useSimulationStore } from '@/stores/simulationStore';
import { getCapabilityColor } from '@/utils/colors';

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

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="flex-shrink-0"
    >
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
