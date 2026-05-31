/**
 * ATLAS Phase 8c: Dimension Slider
 *
 * Discrete segmented control for a single fiscal response dimension.
 * NOT a continuous slider — each position maps to specific parameter values.
 */

import type { DimensionConfig } from '@/types/fiscalDimensions';

interface DimensionSliderProps {
  config: DimensionConfig;
  value: number;
  onChange: (position: number) => void;
}

export function DimensionSlider({ config, value, onChange }: DimensionSliderProps) {
  return (
    <div className="space-y-1.5">
      {/* Dimension label */}
      <div className="text-[10px] font-mono font-medium uppercase tracking-wider" style={{ color: config.color }}>
        {config.label}
      </div>

      {/* Segmented control */}
      <div className="flex gap-0.5">
        {config.options.map((option) => {
          const isActive = option.position === value;
          return (
            <button
              key={option.position}
              onClick={() => onChange(option.position)}
              className={`flex-1 px-1 py-1 text-[9px] font-mono font-medium rounded transition-all duration-150 truncate ${
                isActive
                  ? 'text-white shadow-sm'
                  : 'bg-bg-elevated text-text-muted hover:text-text-secondary'
              }`}
              style={isActive ? { backgroundColor: config.color } : undefined}
              title={`${option.label}: ${Object.entries(option.fields).map(([k, v]) => `${k}=${v}`).join(', ')}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Current parameter summary */}
      <div className="text-[9px] font-mono text-text-muted leading-tight">
        {formatDimensionSummary(config, value)}
      </div>
    </div>
  );
}

/**
 * Format a human-readable summary of the selected position's parameter values.
 */
function formatDimensionSummary(config: DimensionConfig, position: number): string {
  const option = config.options.find((o) => o.position === position);
  if (!option) return '';

  const parts: string[] = [];
  for (const [key, value] of Object.entries(option.fields)) {
    // Format based on common patterns
    if (key.includes('Cut') || key.includes('Increase') || key.includes('Rate') || key.includes('Dampening')) {
      parts.push(`${shortFieldName(key)}: ${(value * 100).toFixed(0)}%`);
    } else if (key.includes('Threshold') || key.includes('MaxThreshold') || key.includes('MaxCIF')) {
      parts.push(`${shortFieldName(key)}: ${value.toFixed(1)}\u00D7`);
    } else if (key.includes('Lag')) {
      parts.push(`${shortFieldName(key)}: ${value}yr`);
    } else {
      parts.push(`${shortFieldName(key)}: ${value}`);
    }
  }

  return parts.join(' | ');
}

/**
 * Shorten FiscalResponseProfile field names for compact display.
 */
function shortFieldName(key: string): string {
  const map: Record<string, string> = {
    maxDiscretionaryCut: 'Disc. cut',
    maxObligationCut: 'Oblig. cut',
    maxRevenueIncrease: 'Rev. increase',
    qeMonetizationRate: 'QE rate',
    maxFinancialRepressionRate: 'Repression cap',
    colaDampeningRate: 'COLA damp',
    colaDampeningThreshold: 'Threshold',
    colaDampeningMaxCIF: 'Max CIF',
    consolidationThreshold: 'Trigger',
    consolidationMaxThreshold: 'Full',
    consolidationLag: 'Delay',
  };
  return map[key] ?? key;
}
