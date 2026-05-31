/**
 * ATLAS State-Level Simulation Model
 *
 * Computes per-state displacement, unemployment, ARPP, and policy
 * effectiveness from national simulation results + state data.
 *
 * Core formula (POLICY_MODEL.md §6.2):
 *   stateDisplacement(s,t) = Σ(clusterDisplacementRate(o,t) × stateOccupationShare(s,o))
 *
 * All functions are PURE — no side effects, no state mutation.
 */

import type {
  StateCode,
  StateData,
  StateOutput,
  StatePolicyOverride,
  ClusterDisplacementResult,
  MacroOutput,
  PolicyEffects,
  SimulationConfig,
} from '@/types';
import { DISPLACEMENT_TO_UNEMPLOYMENT_FACTOR, BASELINE_AVERAGE_ANNUAL_WAGE } from './constants';
import { REGULATORY_LAG_MODIFIERS } from '@/data/stateData';
import type { RegulatoryEnvironment } from '@/data/stateData';

// ============================================================
// Core state computation
// ============================================================

/**
 * Compute all state outputs for a single simulation year.
 *
 * @param year - Current simulation year
 * @param stateDataMap - All state baseline data
 * @param clusterResults - National cluster displacement results for this year
 * @param nationalMacro - National macro output for this year
 * @param policyEffects - National policy effects for this year
 * @param stateOverrides - User-configured state policy overrides
 * @param config - Full simulation config (for policy reference)
 * @returns Array of StateOutput for all states
 */
export function computeStateOutputs(
  year: number,
  stateDataMap: Map<StateCode, StateData>,
  clusterResults: ClusterDisplacementResult[],
  nationalMacro: MacroOutput,
  policyEffects: PolicyEffects,
  stateOverrides: Record<StateCode, Partial<StatePolicyOverride>>,
  config: SimulationConfig,
): StateOutput[] {
  const outputs: StateOutput[] = [];

  // Pre-compute cluster displacement rates (reusable across states)
  const clusterDisplacementRates = computeClusterDisplacementRates(clusterResults);

  for (const [stateCode, stateData] of stateDataMap) {
    // Merge stored state policy with user overrides
    const effectiveOverride: Partial<StatePolicyOverride> = {
      ...stateData.policyOverrides,
      ...(stateOverrides[stateCode] ?? {}),
    };

    // 1. State displacement = weighted sum of cluster displacement rates
    const displacement = computeStateSingleDisplacement(
      stateData,
      clusterDisplacementRates,
    );

    // 2. Apply state policy modifiers (regulatory lag, UBI additions)
    const policyModifiers = applyStatePolicyModifiers(
      effectiveOverride,
      policyEffects,
      stateData,
    );

    // 3. State unemployment rate
    const unemploymentRate = computeStateUnemploymentRate(
      stateData.baselineUnemploymentRate,
      displacement,
    );

    // 4. State CWI (Consumer Welfare Index) — scaled from national CWI
    const consumerWelfareIndex = computeStateCWI(
      nationalMacro.consumerWelfareIndex,
      displacement,
      policyModifiers.additions,
      stateData.population,
    );

    // 5. Policy effectiveness
    // Use national macro's initial CWI estimate as baseline proxy
    const prevCWIGrowth = nationalMacro.cwiGrowthRate;
    const baselineCWI = nationalMacro.consumerWelfareIndex / (1 - Math.max(0, prevCWIGrowth));
    const policyEffectiveness = computeStatePolicyEffectiveness(consumerWelfareIndex, baselineCWI);

    outputs.push({
      code: stateCode,
      year,
      displacement,
      unemploymentRate,
      consumerWelfareIndex,
      policyEffectiveness,
    });
  }

  return outputs;
}

// ============================================================
// Individual computation functions
// ============================================================

/**
 * Pre-compute displacement rates per cluster for efficiency.
 * Displacement rate = 1 - (remainingEmployment / baselineEmployment)
 */
function computeClusterDisplacementRates(
  clusterResults: ClusterDisplacementResult[],
): Map<string, number> {
  const rates = new Map<string, number>();

  for (const cluster of clusterResults) {
    const baseline = cluster.totalRemainingEmployment + cluster.totalDirectDisplacement;
    if (baseline > 0) {
      rates.set(cluster.clusterId, cluster.totalDirectDisplacement / baseline);
    } else {
      rates.set(cluster.clusterId, 0);
    }
  }

  return rates;
}

/**
 * Compute a single state's displacement as a weighted average of
 * cluster displacement rates, weighted by the state's occupation distribution.
 *
 * Formula:
 *   stateDisplacement(s,t) = Σ(clusterDisplacementRate(o,t) × stateOccupationShare(s,o))
 *
 * @param stateData - State baseline data
 * @param clusterDisplacementRates - Pre-computed displacement rates per cluster
 * @returns Displacement rate [0, 1]
 */
export function computeStateSingleDisplacement(
  stateData: StateData,
  clusterDisplacementRates: Map<string, number>,
): number {
  let totalStateEmployment = 0;
  let weightedDisplacement = 0;

  for (const [clusterId, employment] of Object.entries(stateData.occupationDistribution)) {
    if (employment > 0) {
      const displacementRate = clusterDisplacementRates.get(clusterId) ?? 0;
      weightedDisplacement += displacementRate * employment;
      totalStateEmployment += employment;
    }
  }

  if (totalStateEmployment === 0) return 0;
  return weightedDisplacement / totalStateEmployment;
}

/**
 * Compute state-level ARPP.
 *
 * StateARPP = nationalARPP adjusted by relative state displacement,
 * plus any state-specific policy additions (UBI, etc.).
 *
 * States with higher displacement have proportionally lower CWI.
 * States with additional UBI or higher minimum wages get additions.
 *
 * @param nationalCWI - National consumer welfare index (per-capita real consumption)
 * @param stateDisplacement - State displacement rate [0, 1]
 * @param statePolicyAddition - Additional per-capita income from state policies
 * @param statePopulation - State population
 * @returns State CWI value
 */
export function computeStateCWI(
  nationalCWI: number,
  stateDisplacement: number,
  statePolicyAddition: number,
  statePopulation: number,
): number {
  // Scale national CWI by (1 - displacement relative to average)
  // A state with average displacement gets nationalCWI
  // A state with higher displacement gets less
  const adjustedARPP = nationalCWI * (1 - stateDisplacement * 0.5);

  // Add state-specific policy income (per-capita)
  const perCapitaAddition = statePopulation > 0 ? statePolicyAddition / statePopulation : 0;

  return adjustedARPP + perCapitaAddition;
}

/**
 * Compute state unemployment rate.
 *
 * Formula:
 *   stateUnemploymentRate = baseline + displacement × DISPLACEMENT_TO_UNEMPLOYMENT_FACTOR
 *
 * Not all displaced workers become unemployed — some leave labor force,
 * retire, or enter informal work.
 *
 * @param baselineRate - State baseline unemployment rate [0, 1]
 * @param displacement - State displacement rate [0, 1]
 * @returns Unemployment rate [0, 1], clamped to [0, 0.80]
 */
export function computeStateUnemploymentRate(
  baselineRate: number,
  displacement: number,
): number {
  const rate = baselineRate + displacement * DISPLACEMENT_TO_UNEMPLOYMENT_FACTOR;
  return Math.max(0, Math.min(0.80, rate)); // Cap at 80% — allows extreme displacement scenarios
}

/**
 * Compute state policy effectiveness.
 *
 * Effectiveness = how well the state CWI is maintained relative to baseline.
 *   1.0 = CWI fully maintained (or improved)
 *   0.0 = CWI has collapsed to zero
 *
 * @param stateCWI - Current state CWI
 * @param baselineCWI - Baseline CWI (from year 0)
 * @returns Policy effectiveness [0, 1]
 */
export function computeStatePolicyEffectiveness(
  stateCWI: number,
  baselineCWI: number,
): number {
  if (baselineCWI <= 0) return 1.0;
  return Math.max(0, Math.min(1, stateCWI / baselineCWI));
}

/**
 * Apply state-level policy modifiers.
 *
 * Computes:
 * 1. Additional per-capita income from state UBI / minimum wage premium
 * 2. Regulatory lag modifier for AV/robotics adoption
 *
 * @param stateOverride - Effective state policy override (merged defaults + user)
 * @param nationalPolicyEffects - National policy effects
 * @param stateData - State baseline data
 * @returns Policy additions (total dollars) and lag modifier (years)
 */
export function applyStatePolicyModifiers(
  stateOverride: Partial<StatePolicyOverride>,
  nationalPolicyEffects: PolicyEffects,
  stateData: StateData,
): { additions: number; lagModifier: number } {
  let additions = 0;

  // Additional UBI (state-level supplement on top of federal)
  if (stateOverride.additionalUBI && stateOverride.additionalUBI > 0) {
    // Monthly UBI × 12 × eligible population (approximate: 80% of population are adults)
    const eligiblePopulation = stateData.population * 0.8;
    additions += stateOverride.additionalUBI * 12 * eligiblePopulation;
  }

  // UI replacement rate bonus (if higher than national)
  if (stateOverride.uiReplacementRate && stateOverride.uiReplacementRate > 0.45) {
    // Approximate additional UI income from higher replacement rate
    const displacedWorkers = stateData.laborForce * 0.05; // rough estimate
    const additionalReplacement = stateOverride.uiReplacementRate - 0.45;
    const avgWage = BASELINE_AVERAGE_ANNUAL_WAGE; // Use national baseline; good enough for state approximation
    additions += displacedWorkers * avgWage * additionalReplacement;
  }

  // Regulatory lag modifier — picks the more restrictive of AV vs robotics
  const avLag = REGULATORY_LAG_MODIFIERS[
    (stateOverride.avRegulatoryEnvironment ?? 'moderate') as RegulatoryEnvironment
  ] ?? 1;
  const roboticsLag = REGULATORY_LAG_MODIFIERS[
    (stateOverride.roboticsRegulatoryEnvironment ?? 'moderate') as RegulatoryEnvironment
  ] ?? 1;
  const lagModifier = Math.max(avLag, roboticsLag);

  return { additions, lagModifier };
}
