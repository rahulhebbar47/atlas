/**
 * ATLAS Custom Slider Component
 *
 * Custom-styled range input matching DESIGN_PHILOSOPHY.md:
 * - Shows current value prominently
 * - Shows min/max range
 * - Color-coded via --slider-color CSS variable
 * - Fires on every input event for real-time reactivity
 */

import { useCallback } from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  color: string;
  onChange: (value: number) => void;
  formatValue?: (v: number) => string;
  className?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  color,
  onChange,
  formatValue,
  className = '',
}: SliderProps) {
  const displayValue = formatValue ? formatValue(value) : String(value);
  const displayMin = formatValue ? formatValue(min) : String(min);
  const displayMax = formatValue ? formatValue(max) : String(max);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value));
    },
    [onChange],
  );

  // Compute fill percentage for the track gradient
  const fillPercent = ((value - min) / (max - min)) * 100;

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-[11px] font-medium">
          {label}
        </span>
        <span
          className="font-mono text-xs text-text-accent"
          style={{ color }}
        >
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={handleInput}
        onChange={handleInput}
        className="w-full"
        style={{
          '--slider-color': color,
          background: `linear-gradient(to right, ${color} 0%, ${color} ${fillPercent}%, var(--color-bg-elevated) ${fillPercent}%, var(--color-bg-elevated) 100%)`,
        } as React.CSSProperties}
      />
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-[10px] font-mono">
          {displayMin}
        </span>
        <span className="text-text-muted text-[10px] font-mono">
          {displayMax}
        </span>
      </div>
    </div>
  );
}
