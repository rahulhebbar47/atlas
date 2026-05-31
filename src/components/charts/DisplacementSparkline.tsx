/**
 * ATLAS Displacement Sparkline (Phase 4)
 *
 * Tiny inline SVG showing displacement trajectory for an occupation cluster.
 * Follows CapabilitySparkline pattern: memo-wrapped, useMemo path, ~80x20px.
 * Used in the OccupationBrowser table rows.
 */

import { memo, useMemo } from 'react';

interface DisplacementSparklineProps {
  /** Displacement fraction per year (0 = no displacement, 1 = 100% displaced) */
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export const DisplacementSparkline = memo(function DisplacementSparkline({
  data,
  color = '#EF4444',
  width = 80,
  height = 20,
}: DisplacementSparklineProps) {
  const pathD = useMemo(() => {
    if (data.length < 2) return '';

    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Find max for scale (minimum 0.1 to avoid flat lines at tiny values)
    const maxVal = Math.max(0.1, ...data);

    const points: string[] = [];
    for (let i = 0; i < data.length; i++) {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = padding + (1 - (data[i] ?? 0) / maxVal) * chartHeight;
      points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }

    return points.join(' ');
  }, [data, width, height]);

  if (data.length < 2) return null;

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
