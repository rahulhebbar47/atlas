/**
 * ATLAS State Policy Override Controls (Phase 6)
 *
 * Controls for per-state policy overrides in the ControlsPanel.
 * Shown when activeView === 'states' and a state is selected.
 *
 * Overrides:
 *   - Minimum wage ($7.25–$25.00)
 *   - Additional UBI ($0–$2000/month)
 *   - UI replacement rate (0–1.0)
 *   - AV regulatory environment (permissive/moderate/restrictive)
 *   - Robotics regulatory environment (permissive/moderate/restrictive)
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { useStatePolicyOverride } from '@/hooks/useStateData';
import { STATE_NAMES, ALL_STATE_CODES, STATE_MINIMUM_WAGES_2024, DEFAULT_STATE_AV_REGULATORY } from '@/data/stateData';
import { Slider } from '@/components/shared/Slider';
import { formatCurrency, formatPercent } from '@/utils/format';
import type { StateCode, StatePolicyOverride } from '@/types';

// ============================================================
// Regulatory options
// ============================================================

type RegulatoryLevel = 'permissive' | 'moderate' | 'restrictive';

const REGULATORY_OPTIONS: { value: RegulatoryLevel; label: string }[] = [
  { value: 'permissive', label: 'Permissive' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'restrictive', label: 'Restrictive' },
];

// ============================================================
// Component
// ============================================================

export function StatePolicyOverrides() {
  const selectedStateCode = useSimulationStore((s) => s.selectedStateCode);
  const setSelectedState = useSimulationStore((s) => s.setSelectedState);
  const setStatePolicyOverride = useSimulationStore((s) => s.setStatePolicyOverride);
  const resetStatePolicyOverride = useSimulationStore((s) => s.resetStatePolicyOverride);

  const override = useStatePolicyOverride(selectedStateCode);

  const updateField = useCallback(
    (field: keyof StatePolicyOverride, value: number | string) => {
      if (selectedStateCode) {
        setStatePolicyOverride(selectedStateCode, field, value);
      }
    },
    [selectedStateCode, setStatePolicyOverride],
  );

  const handleReset = useCallback(() => {
    if (selectedStateCode) {
      resetStatePolicyOverride(selectedStateCode);
    }
  }, [selectedStateCode, resetStatePolicyOverride]);

  return (
    <div className="space-y-4">
      {/* State selector */}
      <div>
        <label className="text-text-secondary text-[11px] font-medium block mb-1">
          Select State
        </label>
        <select
          value={selectedStateCode ?? ''}
          onChange={(e) => setSelectedState(e.target.value ? (e.target.value as StateCode) : null)}
          className="w-full bg-bg-elevated border border-border rounded-md px-2 py-1.5 font-mono text-[11px] text-text-primary"
        >
          <option value="">Choose a state...</option>
          {ALL_STATE_CODES.map((code) => (
            <option key={code} value={code}>
              {STATE_NAMES[code]}
            </option>
          ))}
        </select>
      </div>

      {selectedStateCode && (
        <>
          {/* Defaults reference */}
          <div className="text-[10px] text-text-muted font-mono">
            Base min wage: {formatCurrency(STATE_MINIMUM_WAGES_2024[selectedStateCode] ?? 7.25)}/hr
            {' · '}
            AV: {DEFAULT_STATE_AV_REGULATORY[selectedStateCode]}
          </div>

          {/* Minimum wage override */}
          <Slider
            label="Min Wage Override"
            value={override.minimumWage ?? STATE_MINIMUM_WAGES_2024[selectedStateCode] ?? 7.25}
            min={7.25}
            max={25}
            step={0.25}
            color="#D4A03C"
            onChange={(v) => updateField('minimumWage', v)}
            formatValue={(v) => `$${v.toFixed(2)}`}
          />

          {/* Additional UBI */}
          <Slider
            label="Additional UBI"
            value={override.additionalUBI ?? 0}
            min={0}
            max={10000}
            step={50}
            color="#3B82F6"
            onChange={(v) => updateField('additionalUBI', v)}
            formatValue={(v) => formatCurrency(v, { decimals: 0 })}
          />

          {/* UI replacement rate */}
          <Slider
            label="UI Replacement Rate"
            value={override.uiReplacementRate ?? 0.45}
            min={0}
            max={1}
            step={0.05}
            color="#10B981"
            onChange={(v) => updateField('uiReplacementRate', v)}
            formatValue={(v) => formatPercent(v, 0)}
          />

          {/* AV regulatory environment */}
          <div>
            <label className="text-text-secondary text-[11px] font-medium block mb-1.5">
              AV Regulatory Environment
            </label>
            <div className="flex gap-1">
              {REGULATORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateField('avRegulatoryEnvironment', opt.value)}
                  className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-mono transition-colors ${
                    (override.avRegulatoryEnvironment ?? DEFAULT_STATE_AV_REGULATORY[selectedStateCode]) === opt.value
                      ? 'bg-gold/15 text-gold border border-gold/30'
                      : 'bg-bg-elevated text-text-muted border border-border hover:text-text-secondary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Robotics regulatory environment */}
          <div>
            <label className="text-text-secondary text-[11px] font-medium block mb-1.5">
              Robotics Regulatory Environment
            </label>
            <div className="flex gap-1">
              {REGULATORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateField('roboticsRegulatoryEnvironment', opt.value)}
                  className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-mono transition-colors ${
                    (override.roboticsRegulatoryEnvironment ?? 'moderate') === opt.value
                      ? 'bg-gold/15 text-gold border border-gold/30'
                      : 'bg-bg-elevated text-text-muted border border-border hover:text-text-secondary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="font-mono text-[9px] text-text-muted hover:text-gold transition-colors"
          >
            Reset {STATE_NAMES[selectedStateCode]} to defaults
          </button>
        </>
      )}
    </div>
  );
}
