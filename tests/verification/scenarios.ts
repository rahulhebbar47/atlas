/**
 * ATLAS Verification Audit — Test Scenarios
 *
 * 8 scenarios as complete SimulationConfig objects built from
 * getDefaultSimulationConfig() with targeted overrides.
 */

import { getDefaultSimulationConfig } from '@/models/simulation';
import { DEFAULT_POLICY_CONFIG } from '@/models/constants';
import type { ScenarioDefinition } from './types';

function disableAllPolicies(): typeof DEFAULT_POLICY_CONFIG {
  return {
    ...DEFAULT_POLICY_CONFIG,
    minimumWage: {
      ...DEFAULT_POLICY_CONFIG.minimumWage,
      enabled: false,
    },
    wageSubsidy: { ...DEFAULT_POLICY_CONFIG.wageSubsidy, enabled: false },
    workWeekReduction: { ...DEFAULT_POLICY_CONFIG.workWeekReduction, enabled: false },
    sovereignWealthFund: { ...DEFAULT_POLICY_CONFIG.sovereignWealthFund, enabled: false },
    profitSharing: { ...DEFAULT_POLICY_CONFIG.profitSharing, enabled: false },
    ubi: { ...DEFAULT_POLICY_CONFIG.ubi, enabled: false },
    enhancedUI: { ...DEFAULT_POLICY_CONFIG.enhancedUI, enabled: false },
    retraining: { ...DEFAULT_POLICY_CONFIG.retraining, enabled: false },
  };
}

// ============================================================
// Scenario 1: Zero Displacement
// ============================================================

function scenario1_ZeroDisplacement(): ScenarioDefinition {
  const config = getDefaultSimulationConfig();
  // Set all 3 capability ceilings to 0 — no AI progress
  config.capabilities = {
    generative: { floor: 0, ceiling: 0, steepness: 0.6, midpointYear: 2033 },
    agentic: { floor: 0, ceiling: 0, steepness: 0.5, midpointYear: 2038 },
    embodied: { floor: 0, ceiling: 0, steepness: 0.5, midpointYear: 2043 },
  };
  config.policyConfig = disableAllPolicies();
  return {
    id: 'zero_displacement',
    name: 'Zero Displacement',
    description: 'All 3 capability ceilings = 0. Verifies clean GDP growth, constant employment.',
    config,
  };
}

// ============================================================
// Scenario 2: Displacement No Policy
// ============================================================

function scenario2_DisplacementNoPolicy(): ScenarioDefinition {
  const config = getDefaultSimulationConfig();
  config.policyConfig = disableAllPolicies();
  return {
    id: 'displacement_no_policy',
    name: 'Displacement No Policy',
    description: 'Default S-curves, all policy disabled. Verifies displacement cascade.',
    config,
  };
}

// ============================================================
// Scenario 3: UBI Only
// ============================================================

function scenario3_UBIOnly(): ScenarioDefinition {
  const config = getDefaultSimulationConfig();
  config.policyConfig = {
    ...disableAllPolicies(),
    ubi: {
      enabled: true,
      monthlyAmount: { keyframes: [{ year: 2025, value: 2000 }] },
      ageThreshold: 18,
      phaseOut: { enabled: false, incomeThreshold: 75_000, phaseOutRate: 0.2 },
      indexedToInflation: false,
      indexedToProductivity: false,
      mode: 'manual',
      indexedBaseAmount: 1000,
      indexedStartYear: 2032,
      productivityIndexRate: 1.0,
    },
  };
  return {
    id: 'ubi_only',
    name: 'UBI Only',
    description: 'Default S-curves + UBI $2000/mo from 2025. Isolates transfer mechanics.',
    config,
  };
}

// ============================================================
// Scenario 4: UBI Phased
// ============================================================

function scenario4_UBIPhased(): ScenarioDefinition {
  const config = getDefaultSimulationConfig();
  config.policyConfig = {
    ...disableAllPolicies(),
    ubi: {
      enabled: true,
      monthlyAmount: {
        keyframes: [
          { year: 2032, value: 500 },
          { year: 2038, value: 2000 },
        ],
      },
      ageThreshold: 18,
      phaseOut: { enabled: false, incomeThreshold: 75_000, phaseOutRate: 0.2 },
      indexedToInflation: false,
      indexedToProductivity: false,
      mode: 'manual',
      indexedBaseAmount: 1000,
      indexedStartYear: 2032,
      productivityIndexRate: 1.0,
    },
  };
  return {
    id: 'ubi_phased',
    name: 'UBI Phased',
    description: 'UBI ramp: $500@2032 -> $2000@2038. Verifies keyframe interpolation + policy isolation.',
    config,
  };
}

// ============================================================
// Scenario 5: AI Fund Only
// ============================================================

function scenario5_AIFundOnly(): ScenarioDefinition {
  const config = getDefaultSimulationConfig();
  config.policyConfig = {
    ...disableAllPolicies(),
    sovereignWealthFund: {
      enabled: true,
      initialFundSize: 0,
      annualContribution: { keyframes: [] },
      annualReturnRate: 0.07,
      distributionRate: 0.04,
      distribution: 'universal',
      ownershipFraction: { keyframes: [{ year: 2030, value: 0.30 }] },
      totalAICompanyProfits: 500,
      profitGrowthRate: 0.15,
      distributionMethod: 'equal',
    },
  };
  return {
    id: 'ai_fund_only',
    name: 'AI Fund Only',
    description: 'SWF 30% ownership from 2030. Isolates asset channel.',
    config,
  };
}

// ============================================================
// Scenario 6: Min Wage Only
// ============================================================

function scenario6_MinWageOnly(): ScenarioDefinition {
  const config = getDefaultSimulationConfig();
  config.policyConfig = {
    ...disableAllPolicies(),
    minimumWage: {
      enabled: true,
      federalMinimum: { keyframes: [{ year: 2028, value: 20.00 }] },
      stateOverrides: {},
      indexedToInflation: false,
      indexedToProductivity: false,
    },
  };
  return {
    id: 'min_wage_only',
    name: 'Min Wage Only',
    description: '$20/hr from 2028. Isolates wage floor mechanics.',
    config,
  };
}

// ============================================================
// Scenario 7: All Policies
// ============================================================

function scenario7_AllPolicies(): ScenarioDefinition {
  const config = getDefaultSimulationConfig();
  config.policyConfig = {
    minimumWage: {
      enabled: true,
      federalMinimum: { keyframes: [{ year: 2028, value: 18.00 }] },
      stateOverrides: {},
      indexedToInflation: false,
      indexedToProductivity: false,
    },
    wageSubsidy: { ...DEFAULT_POLICY_CONFIG.wageSubsidy, enabled: false },
    workWeekReduction: { ...DEFAULT_POLICY_CONFIG.workWeekReduction, enabled: false },
    sovereignWealthFund: {
      enabled: true,
      initialFundSize: 0,
      annualContribution: { keyframes: [] },
      annualReturnRate: 0.07,
      distributionRate: 0.04,
      distribution: 'universal',
      ownershipFraction: { keyframes: [{ year: 2030, value: 0.25 }] },
      totalAICompanyProfits: 500,
      profitGrowthRate: 0.15,
      distributionMethod: 'equal',
    },
    profitSharing: { ...DEFAULT_POLICY_CONFIG.profitSharing, enabled: false },
    ubi: {
      enabled: true,
      monthlyAmount: { keyframes: [{ year: 2032, value: 1500 }] },
      ageThreshold: 18,
      phaseOut: { enabled: false, incomeThreshold: 75_000, phaseOutRate: 0.2 },
      indexedToInflation: false,
      indexedToProductivity: false,
      mode: 'manual',
      indexedBaseAmount: 1000,
      indexedStartYear: 2032,
      productivityIndexRate: 1.0,
    },
    enhancedUI: { ...DEFAULT_POLICY_CONFIG.enhancedUI },
    retraining: { ...DEFAULT_POLICY_CONFIG.retraining, enabled: false },
  };
  return {
    id: 'all_policies',
    name: 'All Policies',
    description: 'UBI $1500@2032 + AI Fund 25%@2030 + Min Wage $18@2028.',
    config,
  };
}

// ============================================================
// Scenario 8: Aggressive Stress
// ============================================================

function scenario8_AggressiveStress(): ScenarioDefinition {
  const config = getDefaultSimulationConfig();
  config.capabilities = {
    generative: { floor: 0.10, ceiling: 1.0, steepness: 1.2, midpointYear: 2028 },
    agentic: { floor: 0.05, ceiling: 1.0, steepness: 1.0, midpointYear: 2031 },
    embodied: { floor: 0.02, ceiling: 1.0, steepness: 0.8, midpointYear: 2035 },
  };
  config.policyConfig = disableAllPolicies();
  return {
    id: 'aggressive_stress',
    name: 'Aggressive Stress',
    description: 'Fast S-curves (mid 2028/2031/2035, ceilings 1.0), no policy.',
    config,
  };
}

// ============================================================
// Export all scenarios
// ============================================================

export function getAllScenarios(): ScenarioDefinition[] {
  return [
    scenario1_ZeroDisplacement(),
    scenario2_DisplacementNoPolicy(),
    scenario3_UBIOnly(),
    scenario4_UBIPhased(),
    scenario5_AIFundOnly(),
    scenario6_MinWageOnly(),
    scenario7_AllPolicies(),
    scenario8_AggressiveStress(),
  ];
}
