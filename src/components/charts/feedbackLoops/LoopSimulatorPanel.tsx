/**
 * LoopSimulatorPanel — Slider controls + metrics table for a feedback loop
 *
 * Renders:
 *   - Range sliders for each adjustable parameter (colored by loop accent)
 *   - Compact metrics table showing all node values + deltas from baseline
 *   - Reset button to return all params to defaults
 */

import type { FeedbackLoopDefinition } from './types';

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatParamValue(value: number, unit: string): string {
  if (unit === '%') return `${(value * 100).toFixed(1)}%`;
  if (unit === 'x') return `${value.toFixed(2)}x`;
  return value.toFixed(3);
}

function formatNodeValueCompact(value: number, format: string): string {
  switch (format) {
    case 'percent':
      return `${(value * 100).toFixed(1)}%`;
    case 'multiplier':
      return `${value.toFixed(3)}x`;
    case 'compact':
      if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
      if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
      return `$${(value / 1e6).toFixed(0)}M`;
    default:
      return value.toFixed(2);
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface LoopSimulatorPanelProps {
  loop: FeedbackLoopDefinition;
  params: Record<string, number>;
  nodeValues: Record<string, number>;
  deltas: Record<string, number>;
  onParamChange: (paramId: string, value: number) => void;
  onReset: () => void;
}

export function LoopSimulatorPanel({
  loop,
  params,
  nodeValues,
  deltas,
  onParamChange,
  onReset,
}: LoopSimulatorPanelProps) {
  const hasChanges = loop.params.some((p) => params[p.id] !== p.defaultValue);

  return (
    <div className="space-y-4">
      {/* Parameter sliders */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: loop.color }}
          >
            Parameters
          </h4>
          {hasChanges && (
            <button
              onClick={onReset}
              className="font-mono text-[9px] text-text-muted hover:text-text-secondary px-2 py-0.5 rounded border border-border/50 hover:border-border transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {loop.params.map((param) => {
          const value = params[param.id] ?? param.defaultValue;
          const isModified = value !== param.defaultValue;

          return (
            <div key={param.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] text-text-muted">
                  {param.label}
                </label>
                <span
                  className="font-mono text-[10px] font-medium"
                  style={{ color: isModified ? loop.color : '#8A96AD' }}
                >
                  {formatParamValue(value, param.unit)}
                </span>
              </div>
              <input
                type="range"
                min={param.min}
                max={param.max}
                step={param.step}
                value={value}
                onChange={(e) => onParamChange(param.id, parseFloat(e.target.value))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${loop.color} 0%, ${loop.color} ${
                    ((value - param.min) / (param.max - param.min)) * 100
                  }%, #1a2235 ${
                    ((value - param.min) / (param.max - param.min)) * 100
                  }%, #1a2235 100%)`,
                  // @ts-expect-error CSS custom property for slider thumb
                  '--slider-color': loop.color,
                }}
              />
              <div className="flex justify-between font-mono text-[8px] text-text-muted/50">
                <span>{formatParamValue(param.min, param.unit)}</span>
                <span>{formatParamValue(param.max, param.unit)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-b border-border/30" />

      {/* Node values table */}
      <div>
        <div className="flex items-baseline gap-2 mb-2">
          <h4
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: loop.color }}
          >
            Variables
          </h4>
          <span className="font-mono text-[8px] text-text-muted/50">
            vs 2025 baseline
          </span>
        </div>
        <div className="space-y-0.5">
          {loop.nodes.map((node) => {
            const value = nodeValues[node.id] ?? 0;
            const delta = deltas[node.id] ?? 0;
            const deltaColor = delta > 0.001 ? '#22C55E' : delta < -0.001 ? '#EF4444' : '#4E5D75';
            const deltaArrow = delta > 0.001 ? '\u25B2' : delta < -0.001 ? '\u25BC' : '';

            return (
              <div
                key={node.id}
                className="flex items-center justify-between py-1 border-b border-border/20"
              >
                <div className="flex items-center gap-1.5 truncate mr-2">
                  <span className="font-mono text-[9px] text-text-muted truncate">
                    {node.label.replace('\n', ' ')}
                  </span>
                  {node.lagged && (
                    <span className="font-mono text-[7px] text-indigo-400/70 bg-indigo-500/10 px-1 py-px rounded flex-shrink-0">
                      t+1
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono text-[10px] text-text-secondary">
                    {formatNodeValueCompact(value, node.format)}
                  </span>
                  {Math.abs(delta) > 0.001 && (
                    <span
                      className="font-mono text-[8px]"
                      style={{ color: deltaColor }}
                    >
                      {deltaArrow}{(Math.abs(delta) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {loop.nodes.some((n) => n.lagged) && (
          <p className="font-mono text-[7px] text-indigo-400/50 mt-2 leading-relaxed">
            <span className="text-indigo-400/70 font-semibold">t+1</span> = next-year projected effect.
            These variables respond to lagged inputs in the model;
            shown here for clarity.
          </p>
        )}
      </div>
    </div>
  );
}
