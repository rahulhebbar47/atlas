/**
 * ATLAS Compare Mode (Phase 5)
 *
 * Toggle + slot selector for side-by-side policy comparison.
 * When active, shows ComparisonARPPChart and ComparisonDiffTable.
 * Slot 0 is always "Current Config" (locked).
 * Users can select 1-2 additional presets to compare against.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { POLICY_PRESETS } from '@/models/constants';
import { ComparisonCWIChart } from './ComparisonCWIChart';
import { ComparisonDiffTable } from './ComparisonDiffTable';

export function CompareMode() {
  const compareMode = useSimulationStore((s) => s.compareMode);
  const toggleCompareMode = useSimulationStore((s) => s.toggleCompareMode);
  const comparisonConfigs = useSimulationStore((s) => s.comparisonPolicyConfigs);
  const addComparisonSlot = useSimulationStore((s) => s.addComparisonSlot);
  const setComparisonSlot = useSimulationStore((s) => s.setComparisonSlot);
  const removeComparisonSlot = useSimulationStore((s) => s.removeComparisonSlot);

  const handleAddSlot = useCallback(() => {
    if (comparisonConfigs.length >= 2) return;
    // Default to the first preset that isn't already selected
    const usedIds = new Set(comparisonConfigs.map((c) => {
      const match = POLICY_PRESETS.find((p) => JSON.stringify(p.config) === JSON.stringify(c.config));
      return match?.id;
    }));
    const available = POLICY_PRESETS.find((p) => !usedIds.has(p.id));
    if (available) {
      addComparisonSlot(available.label, available.config);
    }
  }, [comparisonConfigs, addComparisonSlot]);

  const handlePresetChange = useCallback(
    (slotIdx: number, presetId: string) => {
      const preset = POLICY_PRESETS.find((p) => p.id === presetId);
      if (preset) {
        setComparisonSlot(slotIdx, preset.label, preset.config);
      }
    },
    [setComparisonSlot],
  );

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
          Compare Scenarios
        </h3>
        <button
          onClick={toggleCompareMode}
          className={`
            font-mono text-[10px] font-medium uppercase tracking-wider
            px-3 py-1 rounded-md border transition-colors
            ${compareMode
              ? 'border-gold/50 bg-gold/10 text-gold'
              : 'border-border bg-bg-elevated text-text-muted hover:text-text-secondary'
            }
          `}
        >
          {compareMode ? 'Close Compare' : 'Compare'}
        </button>
      </div>

      {compareMode && (
        <div className="space-y-6">
          {/* Slot selectors */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Slot 0: Current Config — locked */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 border border-gold/30 rounded-md">
              <div className="w-2 h-2 rounded-full bg-gold" />
              <span className="font-mono text-[10px] text-gold font-medium">Current Config</span>
            </div>

            {/* Comparison slots */}
            {comparisonConfigs.map((slot, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: idx === 0 ? '#3B82F6' : '#10B981' }}
                />
                <select
                  value={POLICY_PRESETS.find((p) => JSON.stringify(p.config) === JSON.stringify(slot.config))?.id ?? ''}
                  onChange={(e) => handlePresetChange(idx, e.target.value)}
                  className="font-mono text-[10px] bg-bg-elevated border border-border rounded-md px-2 py-1 text-text-primary"
                >
                  {POLICY_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeComparisonSlot(idx)}
                  className="text-text-muted hover:text-critical text-[10px] font-mono transition-colors"
                  title="Remove slot"
                >
                  x
                </button>
              </div>
            ))}

            {/* Add slot button */}
            {comparisonConfigs.length < 2 && (
              <button
                onClick={handleAddSlot}
                className="font-mono text-[10px] text-text-muted hover:text-gold border border-dashed border-border rounded-md px-2 py-1 transition-colors"
              >
                + Add Scenario
              </button>
            )}
          </div>

          {/* Charts and table only shown when at least 1 comparison slot exists */}
          {comparisonConfigs.length > 0 && (
            <>
              <ComparisonCWIChart />
              <ComparisonDiffTable />
            </>
          )}
        </div>
      )}
    </div>
  );
}
