/**
 * ATLAS Policy Preset Selector (Phase 5)
 *
 * Row of compact toggle buttons for one-click policy preset loading.
 * Active preset highlighted with gold accent.
 * Auto-detects "Custom" when user manually modifies any parameter.
 */

import { useCallback, useMemo } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { POLICY_PRESETS } from '@/models/constants';
import { usePolicyConfig } from '@/hooks/usePolicyData';

export function PolicyPresetSelector() {
  const policyConfig = usePolicyConfig();
  const setPolicyPreset = useSimulationStore((s) => s.setPolicyPreset);

  // Determine which preset (if any) matches current config
  const activePresetId = useMemo(() => {
    for (const preset of POLICY_PRESETS) {
      if (JSON.stringify(preset.config) === JSON.stringify(policyConfig)) {
        return preset.id;
      }
    }
    return null; // Custom
  }, [policyConfig]);

  const handleSelect = useCallback(
    (presetId: string) => {
      setPolicyPreset(presetId);
    },
    [setPolicyPreset],
  );

  return (
    <div className="flex flex-wrap gap-1.5">
      {POLICY_PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => handleSelect(preset.id)}
          title={preset.description}
          className={`
            font-mono text-[9px] font-medium uppercase tracking-[0.05em]
            px-2 py-1 rounded-md border transition-colors
            ${activePresetId === preset.id
              ? 'border-gold/50 bg-gold/10 text-gold'
              : 'border-border bg-bg-elevated text-text-muted hover:text-text-secondary hover:border-border'
            }
          `}
        >
          {preset.label}
        </button>
      ))}
      {/* Custom indicator when no preset matches */}
      {activePresetId === null && (
        <span className="font-mono text-[9px] font-medium uppercase tracking-[0.05em] px-2 py-1 rounded-md border border-gold/30 bg-gold/5 text-gold/70">
          Custom
        </span>
      )}
    </div>
  );
}
