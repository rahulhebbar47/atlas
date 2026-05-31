/**
 * ATLAS BFCS Score Bar (Phase 4)
 *
 * Custom dual-track visualization for a single BFCS dimension:
 * - Score fill: colored bar from 0 to current AI score (read-only)
 * - Threshold marker: draggable position on the track
 * - Met state: bright fill when score >= threshold, dimmed when not met
 * - Override indicator: reset icon when threshold differs from default
 *
 * Uses a standard <input type="range"> overlaid on a custom SVG bar
 * for the threshold control. Score fill is a div with width%.
 */

import { memo, useCallback } from 'react';
import type { BFCSThresholds } from '@/types';
import { BFCS_DIMENSION_COLORS, BFCS_DIMENSION_LABELS } from '@/models/constants';

interface BFCSScoreBarProps {
  dimension: keyof BFCSThresholds;
  score: number;
  threshold: number;
  defaultThreshold: number;
  onThresholdChange: (dimension: keyof BFCSThresholds, value: number) => void;
  onReset?: () => void;
}

export const BFCSScoreBar = memo(function BFCSScoreBar({
  dimension,
  score,
  threshold,
  defaultThreshold,
  onThresholdChange,
  onReset,
}: BFCSScoreBarProps) {
  const color = BFCS_DIMENSION_COLORS[dimension];
  const label = BFCS_DIMENSION_LABELS[dimension];
  const isMet = score >= threshold;
  const isOverridden = Math.abs(threshold - defaultThreshold) > 0.001;
  const scorePercent = Math.min(score, 1) * 100;
  const thresholdPercent = Math.min(threshold, 1) * 100;

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onThresholdChange(dimension, parseFloat(e.target.value));
    },
    [dimension, onThresholdChange],
  );

  return (
    <div className="space-y-0.5">
      {/* Label row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className="font-mono text-[10px] font-medium"
            style={{ color }}
          >
            {label}
          </span>
          {isMet && (
            <span className="text-[9px] font-mono text-critical">MET</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isOverridden && onReset && (
            <button
              onClick={onReset}
              className="text-text-muted hover:text-gold text-[9px] font-mono transition-colors"
              title={`Reset to default (${defaultThreshold.toFixed(2)})`}
            >
              RST
            </button>
          )}
          <span className="font-mono text-[10px] text-text-secondary">
            <span style={{ color: isMet ? color : undefined }}>
              {score.toFixed(2)}
            </span>
            <span className="text-text-muted"> / </span>
            <span className={isOverridden ? 'text-gold' : ''}>
              {threshold.toFixed(2)}
            </span>
          </span>
        </div>
      </div>

      {/* Track visualization + slider */}
      <div className="relative h-3">
        {/* Background track */}
        <div className="absolute inset-0 rounded-sm bg-bg-elevated" />

        {/* Score fill */}
        <div
          className="absolute top-0 left-0 h-full rounded-sm transition-[width] duration-100"
          style={{
            width: `${scorePercent}%`,
            background: color,
            opacity: isMet ? 0.7 : 0.3,
          }}
        />

        {/* Threshold indicator line */}
        <div
          className="absolute top-0 h-full w-px transition-[left] duration-100"
          style={{
            left: `${thresholdPercent}%`,
            background: isOverridden ? 'var(--color-gold)' : 'var(--color-text-secondary)',
          }}
        />
        <div
          className="absolute top-[-1px] h-[14px] w-[6px] -translate-x-1/2 rounded-sm transition-[left] duration-100"
          style={{
            left: `${thresholdPercent}%`,
            background: isOverridden ? 'var(--color-gold)' : 'var(--color-text-muted)',
            opacity: 0.8,
          }}
        />

        {/* Range input overlay — controls threshold */}
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={threshold}
          onInput={handleInput}
          onChange={handleInput}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
});
