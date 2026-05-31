/**
 * ATLAS Per-Role Replacement Difficulty Editor — Phase 10.A fix #2
 *
 * Lets a user adjust per-role aiReplacementFrictionYears (direct years, no global scaling)
 * and aiReplacementDifficultyWagePremium (residual humanness at automation tail).
 *
 * Accent color: Indigo #6366F1 (shares AlphaControls identity — same conceptual family).
 */

import { useMemo, useState, useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import {
  ROLE_AI_REPLACEMENT_FRICTION_YEARS_DEFAULTS,
  ROLE_AI_REPLACEMENT_DIFFICULTY_WAGE_PREMIUM_DEFAULTS,
  FALLBACK_REPLACEMENT_FRICTION_YEARS,
  FALLBACK_REPLACEMENT_DIFFICULTY_WAGE_PREMIUM,
} from '@/models/constants';

const CONTROL_COLOR = '#6366F1';

// Stable module-level empty-object references. Returning a fresh `{}` literal from a Zustand
// selector triggers Maximum-update-depth-exceeded because each render sees a new reference.
const EMPTY_FRICTION_OVERRIDES: Record<string, Record<string, number>> = {};
const EMPTY_WAGE_PREMIUM_OVERRIDES: Record<string, Record<string, number>> = {};

export function ReplacementDifficultyEditor() {
  const frictionOverrides = useSimulationStore(
    (s) => s.config.roleReplacementFrictionYearsOverrides ?? EMPTY_FRICTION_OVERRIDES,
  );
  const wagePremiumOverrides = useSimulationStore(
    (s) => s.config.roleReplacementDifficultyWagePremiumOverrides ?? EMPTY_WAGE_PREMIUM_OVERRIDES,
  );
  const setFrictionYears = useSimulationStore((s) => s.setRoleReplacementFrictionYears);
  const setWagePremium = useSimulationStore((s) => s.setRoleReplacementDifficultyWagePremium);

  const [selectedClusterId, setSelectedClusterId] = useState<string>('tech_swe');

  const clusterGroups = useMemo(() => {
    const groups: Record<string, typeof OCCUPATION_CLUSTERS> = {};
    for (const c of OCCUPATION_CLUSTERS) {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category]!.push(c);
    }
    return groups;
  }, []);

  const selectedCluster = OCCUPATION_CLUSTERS.find((c) => c.id === selectedClusterId);

  const resolveFriction = useCallback(
    (clusterId: string, roleId: string) => {
      const override = frictionOverrides[clusterId]?.[roleId];
      if (override !== undefined) return override;
      return ROLE_AI_REPLACEMENT_FRICTION_YEARS_DEFAULTS[clusterId]?.[roleId] ?? FALLBACK_REPLACEMENT_FRICTION_YEARS;
    },
    [frictionOverrides],
  );
  const resolveWagePremium = useCallback(
    (clusterId: string, roleId: string) => {
      const override = wagePremiumOverrides[clusterId]?.[roleId];
      if (override !== undefined) return override;
      return ROLE_AI_REPLACEMENT_DIFFICULTY_WAGE_PREMIUM_DEFAULTS[clusterId]?.[roleId]
        ?? FALLBACK_REPLACEMENT_DIFFICULTY_WAGE_PREMIUM;
    },
    [wagePremiumOverrides],
  );

  return (
    <div className="space-y-3">
      <label className="text-text-muted text-[10px] uppercase tracking-wider block mb-2">
        Cluster
      </label>
      <select
        className="w-full bg-surface-elevated text-text-primary text-xs px-2 py-1 rounded border border-border"
        value={selectedClusterId}
        onChange={(e) => setSelectedClusterId(e.target.value)}
      >
        {Object.entries(clusterGroups).map(([category, clusters]) => (
          <optgroup label={category} key={category}>
            {clusters.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </optgroup>
        ))}
      </select>

      {selectedCluster?.roles.map((role) => {
        const frictionY = resolveFriction(selectedClusterId, role.id);
        const wp = resolveWagePremium(selectedClusterId, role.id);
        return (
          <div key={role.id} className="border-t border-border pt-3 mt-3">
            <div className="text-text-primary text-xs font-medium mb-2">{role.label}</div>
            <Slider
              label="AI Replacement Friction (years)"
              value={frictionY}
              min={0} max={15} step={0.5}
              color={CONTROL_COLOR}
              onChange={(v) => setFrictionYears(selectedClusterId, role.id, v)}
              formatValue={(v) => v.toFixed(1)}
            />
            <Slider
              label="Wage Premium (residual humanness)"
              value={wp}
              min={0} max={1} step={0.01}
              color={CONTROL_COLOR}
              onChange={(v) => setWagePremium(selectedClusterId, role.id, v)}
              formatValue={(v) => v.toFixed(2)}
            />
          </div>
        );
      })}

      <p className="text-text-muted text-[10px] leading-relaxed">
        Friction = your estimate of regulatory, cultural, and licensure delay before AI can replace
        this role, once AI is capable. Surgeons might be 4–5 years; software engineers near 0.
        Wage premium = residual human share at the automation tail (shapes the adoption S-curve
        asymmetry and the Phillips scarcity premium).
      </p>
    </div>
  );
}
