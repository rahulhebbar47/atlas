/**
 * Bug reproduction test: policy changes causing state reset.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useSimulationStore } from '@/stores/simulationStore';

describe('policy change persistence bug', () => {
  beforeEach(() => {
    useSimulationStore.getState().resetToDefaults();
  });

  it('S-curve changes persist after policy toggle', () => {
    const store = useSimulationStore;

    // Step 1: Modify S-curve parameters
    store.getState().setCapabilityParam('generative', 'midpointYear', 2040);
    expect(store.getState().config.capabilities.generative.midpointYear).toBe(2040);

    // Step 2: Toggle UBI
    store.getState().togglePolicy('ubi', true);
    expect(store.getState().config.policyConfig.ubi.enabled).toBe(true);
    // S-curve should still be modified
    expect(store.getState().config.capabilities.generative.midpointYear).toBe(2040);

    // Step 3: Change UBI amount
    store.getState().updatePolicyParam('ubi', { monthlyAmount: { keyframes: [{ year: 2025, value: 1000 }] } });
    expect(store.getState().config.policyConfig.ubi.monthlyAmount).toEqual({ keyframes: [{ year: 2025, value: 1000 }] });
    // S-curve should still be modified
    expect(store.getState().config.capabilities.generative.midpointYear).toBe(2040);

    // Step 4: Navigate to policy view
    store.getState().setActiveView('policy');
    expect(store.getState().activeView).toBe('policy');
    expect(store.getState().config.capabilities.generative.midpointYear).toBe(2040);
    expect(store.getState().config.policyConfig.ubi.enabled).toBe(true);

    // Step 5: Navigate to overview
    store.getState().setActiveView('overview');
    expect(store.getState().activeView).toBe('overview');
    expect(store.getState().config.capabilities.generative.midpointYear).toBe(2040);
    expect(store.getState().config.policyConfig.ubi.enabled).toBe(true);
    expect(store.getState().config.policyConfig.ubi.monthlyAmount).toEqual({ keyframes: [{ year: 2025, value: 1000 }] });
  });

  it('timeline recomputes correctly with both changes', () => {
    const store = useSimulationStore;

    // Baseline timeline
    const baseTimeline = store.getState().timeline;

    // Modify S-curve
    store.getState().setCapabilityParam('generative', 'midpointYear', 2040);
    const afterScurve = store.getState().timeline;
    expect(afterScurve).not.toBe(baseTimeline); // New timeline object

    // Toggle UBI
    store.getState().togglePolicy('ubi', true);
    store.getState().updatePolicyParam('ubi', { monthlyAmount: { keyframes: [{ year: 2025, value: 1000 }] } });
    const afterPolicy = store.getState().timeline;
    expect(afterPolicy).not.toBe(afterScurve); // New timeline object

    // Verify policy effects are non-zero in later years
    const lastYear = afterPolicy.years[afterPolicy.years.length - 1]!;
    expect(lastYear.policyEffects.totalPolicyIncome).toBeGreaterThan(0);

    // Navigate
    store.getState().setActiveView('policy');
    store.getState().setActiveView('overview');

    // Timeline should be the SAME object (navigation doesn't trigger recompute)
    expect(store.getState().timeline).toBe(afterPolicy);
  });

  it('all policy toggles preserve capability changes', () => {
    const store = useSimulationStore;
    const policyKeys = [
      'minimumWage', 'wageSubsidy', 'workWeekReduction',
      'sovereignWealthFund', 'profitSharing',
      'ubi', 'enhancedUI', 'retraining',
    ] as const;

    // Set a capability change
    store.getState().setCapabilityParam('agentic', 'steepness', 1.5);

    // Toggle each policy on, check that capability change persists
    for (const key of policyKeys) {
      store.getState().togglePolicy(key, true);
      expect(
        store.getState().config.capabilities.agentic.steepness,
        `capability lost after toggling ${key}`,
      ).toBe(1.5);
    }
  });
});
