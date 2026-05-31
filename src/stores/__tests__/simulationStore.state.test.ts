/**
 * ATLAS Simulation Store — State Management Tests (Phase 6 + Phase 7)
 *
 * Tests the Zustand store's state-level actions:
 *   - State selection and comparison management
 *   - State map metric toggling
 *   - State policy overrides with simulation recompute
 *   - Presentation mode (Phase 7)
 *   - Onboarding state (Phase 7)
 *
 * These tests exercise the store directly (no React rendering needed).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSimulationStore } from '@/stores/simulationStore';

// ============================================================
// Helpers
// ============================================================

function resetStore() {
  useSimulationStore.getState().resetToDefaults();
}

// ============================================================
// State selection
// ============================================================

describe('state selection', () => {
  beforeEach(resetStore);

  it('starts with no state selected', () => {
    expect(useSimulationStore.getState().selectedStateCode).toBeNull();
  });

  it('setSelectedState updates selectedStateCode', () => {
    useSimulationStore.getState().setSelectedState('TX');
    expect(useSimulationStore.getState().selectedStateCode).toBe('TX');
  });

  it('setSelectedState to null deselects', () => {
    useSimulationStore.getState().setSelectedState('TX');
    useSimulationStore.getState().setSelectedState(null);
    expect(useSimulationStore.getState().selectedStateCode).toBeNull();
  });
});

// ============================================================
// Comparison states
// ============================================================

describe('comparison states', () => {
  beforeEach(resetStore);

  it('starts with empty comparison codes', () => {
    expect(useSimulationStore.getState().comparisonStateCodes).toEqual([]);
  });

  it('addComparisonState adds a state', () => {
    useSimulationStore.getState().addComparisonState('TX');
    expect(useSimulationStore.getState().comparisonStateCodes).toEqual(['TX']);
  });

  it('addComparisonState prevents duplicates', () => {
    useSimulationStore.getState().addComparisonState('TX');
    useSimulationStore.getState().addComparisonState('TX');
    expect(useSimulationStore.getState().comparisonStateCodes).toEqual(['TX']);
  });

  it('addComparisonState caps at 3 states', () => {
    useSimulationStore.getState().addComparisonState('TX');
    useSimulationStore.getState().addComparisonState('CA');
    useSimulationStore.getState().addComparisonState('NY');
    useSimulationStore.getState().addComparisonState('FL');

    const codes = useSimulationStore.getState().comparisonStateCodes;
    expect(codes).toHaveLength(3);
    expect(codes).toEqual(['TX', 'CA', 'NY']);
  });

  it('removeComparisonState removes a specific state', () => {
    useSimulationStore.getState().addComparisonState('TX');
    useSimulationStore.getState().addComparisonState('CA');
    useSimulationStore.getState().removeComparisonState('TX');

    expect(useSimulationStore.getState().comparisonStateCodes).toEqual(['CA']);
  });

  it('clearComparisonStates empties the list', () => {
    useSimulationStore.getState().addComparisonState('TX');
    useSimulationStore.getState().addComparisonState('CA');
    useSimulationStore.getState().clearComparisonStates();

    expect(useSimulationStore.getState().comparisonStateCodes).toEqual([]);
  });
});

// ============================================================
// State map metric
// ============================================================

describe('state map metric', () => {
  beforeEach(resetStore);

  it('starts with displacement metric', () => {
    expect(useSimulationStore.getState().stateMapMetric).toBe('displacement');
  });

  it('setStateMapMetric changes the metric', () => {
    useSimulationStore.getState().setStateMapMetric('unemploymentRate');
    expect(useSimulationStore.getState().stateMapMetric).toBe('unemploymentRate');

    useSimulationStore.getState().setStateMapMetric('policyEffectiveness');
    expect(useSimulationStore.getState().stateMapMetric).toBe('policyEffectiveness');
  });
});

// ============================================================
// State policy overrides
// ============================================================

describe('state policy overrides', () => {
  beforeEach(resetStore);

  it('starts with empty stateOverrides', () => {
    expect(useSimulationStore.getState().config.stateOverrides).toEqual({});
  });

  it('setStatePolicyOverride creates an override and recomputes', () => {
    const timelineBefore = useSimulationStore.getState().timeline;
    useSimulationStore.getState().setStatePolicyOverride('TX', 'minimumWage', 15.00);

    const state = useSimulationStore.getState();
    expect(state.config.stateOverrides['TX']).toBeDefined();
    expect(state.config.stateOverrides['TX']?.minimumWage).toBe(15.00);
    // Simulation should have been recomputed
    expect(state.timeline).not.toBe(timelineBefore);
  });

  it('setStatePolicyOverride merges with existing overrides', () => {
    useSimulationStore.getState().setStatePolicyOverride('TX', 'minimumWage', 15.00);
    useSimulationStore.getState().setStatePolicyOverride('TX', 'additionalUBI', 500);

    const overrides = useSimulationStore.getState().config.stateOverrides['TX'];
    expect(overrides?.minimumWage).toBe(15.00);
    expect(overrides?.additionalUBI).toBe(500);
  });

  it('setStatePolicyOverride for different states are independent', () => {
    useSimulationStore.getState().setStatePolicyOverride('TX', 'minimumWage', 15.00);
    useSimulationStore.getState().setStatePolicyOverride('CA', 'minimumWage', 20.00);

    const overrides = useSimulationStore.getState().config.stateOverrides;
    expect(overrides['TX']?.minimumWage).toBe(15.00);
    expect(overrides['CA']?.minimumWage).toBe(20.00);
  });

  it('resetStatePolicyOverride removes state overrides and recomputes', () => {
    useSimulationStore.getState().setStatePolicyOverride('TX', 'minimumWage', 15.00);
    useSimulationStore.getState().setStatePolicyOverride('CA', 'minimumWage', 20.00);

    useSimulationStore.getState().resetStatePolicyOverride('TX');

    const overrides = useSimulationStore.getState().config.stateOverrides;
    expect(overrides['TX']).toBeUndefined();
    expect(overrides['CA']?.minimumWage).toBe(20.00);
  });

  it('resetToDefaults clears state overrides', () => {
    useSimulationStore.getState().setStatePolicyOverride('TX', 'minimumWage', 15.00);
    useSimulationStore.getState().resetToDefaults();

    expect(useSimulationStore.getState().config.stateOverrides).toEqual({});
    expect(useSimulationStore.getState().selectedStateCode).toBeNull();
  });
});

// ============================================================
// State data loaded
// ============================================================

describe('stateDataLoaded', () => {
  it('reflects whether state data was loaded at init', () => {
    // This depends on whether state JSON files exist in the test environment
    const loaded = useSimulationStore.getState().stateDataLoaded;
    expect(typeof loaded).toBe('boolean');
  });
});

// ============================================================
// Presentation mode (Phase 7)
// ============================================================

describe('presentation mode', () => {
  beforeEach(resetStore);

  it('starts with presentation mode off', () => {
    const state = useSimulationStore.getState();
    expect(state.presentationMode).toBe(false);
    expect(state.presentationStep).toBe(0);
  });

  it('toggles presentation mode and resets step', () => {
    const store = useSimulationStore;

    store.getState().togglePresentationMode();
    expect(store.getState().presentationMode).toBe(true);
    expect(store.getState().presentationStep).toBe(0);

    // Advance step, then toggle off — step should reset
    store.getState().nextPresentationStep();
    store.getState().nextPresentationStep();
    expect(store.getState().presentationStep).toBe(2);

    store.getState().togglePresentationMode();
    expect(store.getState().presentationMode).toBe(false);
    expect(store.getState().presentationStep).toBe(0);
  });

  it('navigates steps forward and backward', () => {
    const store = useSimulationStore;

    store.getState().nextPresentationStep();
    expect(store.getState().presentationStep).toBe(1);

    store.getState().nextPresentationStep();
    expect(store.getState().presentationStep).toBe(2);

    store.getState().prevPresentationStep();
    expect(store.getState().presentationStep).toBe(1);
  });

  it('clamps backward navigation at 0', () => {
    const store = useSimulationStore;
    store.getState().prevPresentationStep();
    expect(store.getState().presentationStep).toBe(0);
  });

  it('sets step directly', () => {
    useSimulationStore.getState().setPresentationStep(3);
    expect(useSimulationStore.getState().presentationStep).toBe(3);
  });

  it('resets presentation mode on resetToDefaults', () => {
    const store = useSimulationStore;
    store.getState().togglePresentationMode();
    store.getState().nextPresentationStep();
    store.getState().resetToDefaults();

    expect(store.getState().presentationMode).toBe(false);
    expect(store.getState().presentationStep).toBe(0);
  });
});

// ============================================================
// Onboarding (Phase 7)
// ============================================================

describe('onboarding', () => {
  beforeEach(resetStore);

  it('exposes onboarding state', () => {
    const state = useSimulationStore.getState();
    expect(typeof state.onboardingComplete).toBe('boolean');
    expect(state.onboardingStep).toBe(0);
  });

  it('advances onboarding step', () => {
    const store = useSimulationStore;
    store.getState().setOnboardingStep(3);
    expect(store.getState().onboardingStep).toBe(3);
  });

  it('marks onboarding complete', () => {
    const store = useSimulationStore;
    store.getState().setOnboardingComplete(true);
    expect(store.getState().onboardingComplete).toBe(true);
  });
});
