/**
 * ATLAS Phase 8 Fix 4: Preset Selector
 *
 * Generic dropdown for fiscal policy or Federal Reserve presets.
 * Shows a 1-2 line description of the active preset below.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { FISCAL_POLICY_PRESETS, FEDERAL_RESERVE_PRESETS } from '@/models/fiscalResponseProfiles';
import { useFiscalDimensions, useFedDimensions, useOverrideCount } from '@/hooks/useParameterTimeline';

// ============================================================
// Fiscal Policy Preset Selector
// ============================================================

const FISCAL_PRESET_ORDER: string[] = [
  'austerity',
  'tax_the_winners',
  'balanced_reduction',
  'gridlock',
  'no_fiscal_response',
];

export function FiscalPresetSelector() {
  const setFiscalPolicyPreset = useSimulationStore((s) => s.setFiscalPolicyPreset);
  const clearParameterOverrides = useSimulationStore((s) => s.clearParameterOverrides);
  const { activePreset } = useFiscalDimensions();
  const { total: overrideCount } = useOverrideCount();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    if (presetId === 'custom') return;

    if (overrideCount > 0) {
      const confirmed = window.confirm(
        `Changing the fiscal policy preset will clear ${overrideCount} per-year override${overrideCount > 1 ? 's' : ''}. Continue?`
      );
      if (!confirmed) return;
      clearParameterOverrides();
    }

    setFiscalPolicyPreset(presetId);
  }, [setFiscalPolicyPreset, clearParameterOverrides, overrideCount]);

  const activeProfile = FISCAL_POLICY_PRESETS[activePreset];
  const description = activeProfile?.description ?? 'Custom fiscal policy configuration.';

  return (
    <div className="space-y-2">
      <select
        value={activePreset}
        onChange={handleChange}
        className="w-full bg-bg-card border border-border rounded-md px-2.5 py-1.5 font-mono text-[11px] text-text-primary focus:outline-none focus:border-gold appearance-none cursor-pointer"
      >
        {FISCAL_PRESET_ORDER.map((key) => {
          const preset = FISCAL_POLICY_PRESETS[key]!;
          return (
            <option key={key} value={key}>
              {preset.name}
            </option>
          );
        })}
        {activePreset === 'custom' && (
          <option value="custom">Custom</option>
        )}
      </select>
      <p className={`text-[10px] leading-relaxed ${
        activePreset === 'no_fiscal_response' ? 'text-red-400' : 'text-text-muted'
      }`}>
        {description}
      </p>
    </div>
  );
}

// ============================================================
// Federal Reserve Preset Selector
// ============================================================

const FED_PRESET_ORDER: string[] = [
  'price_stability',
  'balanced_mandate',
  'employment_focused',
  'maximum_accommodation',
];

export function FedPresetSelector() {
  const setFederalReservePreset = useSimulationStore((s) => s.setFederalReservePreset);
  const { activePreset } = useFedDimensions();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    if (presetId === 'custom') return;
    setFederalReservePreset(presetId);
  }, [setFederalReservePreset]);

  const activeProfile = FEDERAL_RESERVE_PRESETS[activePreset];
  const description = activeProfile?.description ?? 'Custom Federal Reserve configuration.';

  return (
    <div className="space-y-2">
      <select
        value={activePreset}
        onChange={handleChange}
        className="w-full bg-bg-card border border-border rounded-md px-2.5 py-1.5 font-mono text-[11px] text-text-primary focus:outline-none focus:border-gold appearance-none cursor-pointer"
      >
        {FED_PRESET_ORDER.map((key) => {
          const preset = FEDERAL_RESERVE_PRESETS[key]!;
          return (
            <option key={key} value={key}>
              {preset.name}
            </option>
          );
        })}
        {activePreset === 'custom' && (
          <option value="custom">Custom</option>
        )}
      </select>
      <p className="text-[10px] leading-relaxed text-text-muted">
        {description}
      </p>
    </div>
  );
}
