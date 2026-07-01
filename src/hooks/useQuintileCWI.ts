/**
 * Quintile CWI data hooks (the close-out K.3 chart build).
 *
 * The quintile series is the honest welfare object: per population fifth, real income
 * deflated by that fifth's OWN cost of living (computeQuintileSeries, display-pure).
 * The policy-delta hook runs the no-policy TWIN through the real simulation (the existing
 * compare-mode pattern via getBLSBaselines) — a true comparison pair, not the income-
 * subtraction approximation the legacy chart used.
 */
import { useMemo } from 'react';
import { useSimulationStore, getBLSBaselines } from '@/stores/simulationStore';
import { runSimulation } from '@/models/simulation';
import { computeQuintileSeries, type QuintileYearRecord } from '@/models/quintileCWI';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import type { PolicyConfig, SimulationConfig } from '@/types';

export function useQuintileSeries(): QuintileYearRecord[] {
  const years = useSimulationStore((s) => s.timeline.years);
  return useMemo(() => computeQuintileSeries(years), [years]);
}

/** True when any policy lever is enabled in the current config. */
export function useAnyPolicyEnabled(): boolean {
  const policyConfig = useSimulationStore((s) => s.config.policyConfig);
  return useMemo(() => anyPolicyEnabled(policyConfig), [policyConfig]);
}

function anyPolicyEnabled(pc: PolicyConfig): boolean {
  return Object.values(pc).some(
    (lever) => typeof lever === 'object' && lever !== null && 'enabled' in lever
      && (lever as { enabled?: boolean }).enabled === true,
  );
}

/** Every policy lever's `enabled` forced off — the comparison twin. */
function noPolicyTwin(config: SimulationConfig): SimulationConfig {
  const pc: Record<string, unknown> = {};
  for (const [key, lever] of Object.entries(config.policyConfig)) {
    pc[key] = typeof lever === 'object' && lever !== null && 'enabled' in lever
      ? { ...(lever as object), enabled: false }
      : lever;
  }
  // reason: the twin rebuilds PolicyConfig field-by-field from the live config; the keys are
  // PolicyConfig's own keys, only `enabled` flags changed.
  return { ...config, policyConfig: pc as unknown as PolicyConfig };
}

/**
 * The no-policy quintile series (the policy-delta view's counterfactual leg).
 * Returns null when no policy is enabled — the pair would be identical.
 */
export function useNoPolicyQuintileSeries(): QuintileYearRecord[] | null {
  const config = useSimulationStore((s) => s.config);
  const policyActive = useAnyPolicyEnabled();
  return useMemo(() => {
    if (!policyActive) return null;
    const twin = runSimulation(noPolicyTwin(config), OCCUPATION_CLUSTERS, getBLSBaselines());
    return computeQuintileSeries(twin.years);
  }, [config, policyActive]);
}
