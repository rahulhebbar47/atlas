/**
 * ATLAS Alpha Drivers Tests — Phase 10.A Part 6
 */
import { describe, it, expect } from 'vitest';
import { computeEffectiveAlpha, computePeerAlpha } from '@/models/alphaDrivers';
import { DEFAULT_ALPHA_DRIVER_PARAMS, ALPHA_BASELINE_CORPORATE_MARGIN, DEFAULT_COGNITIVE_ALPHA } from '@/models/constants';
import type { OccupationCluster, RoleDefinition } from '@/types';

const mockRole: RoleDefinition = {
  id: 'r1',
  label: 'Role 1',
  seniorityLevel: 0.5,
  aiReplacementDifficulty: 0.5,
  employmentShareEstimate: 1.0,
  bfcsThresholds: { better: 0.5, faster: 0.5, cheaper: 0.5, safer: 0.5 },
  aiReplacementFrictionYears: 2.5,
  aiReplacementDifficultyWagePremium: 0.5,
};

const mockCluster: OccupationCluster = {
  id: 'c1', name: 'C1', category: 'Technology', socCodes: [],
  roles: [mockRole],
  capabilityRelevance: { weights: { generative: 1, agentic: 0, embodied: 0 } },
  deploymentType: 'software', employmentMultiplier: 1, adoptionLag: 0,
  geopoliticalRiskExposure: 0, notes: '', protectedByPolicy: false,
  policyDisplacementTarget: false, wageElasticity: 0.5,
  adoptionSteepness: 1.0, adoptionCeiling: 1.0,
  consumerDemandShare: 0.2, govDemandShare: 0.1,
  automationShare: 0.5,
};

describe('computeEffectiveAlpha', () => {
  const baseInputs = {
    cluster: mockCluster, role: mockRole, year: 2025,
    weightedCapability: 0, triggerYear: null as number | null,
    previousYearPeerAlpha: 0.5, currentCorporateMargin: ALPHA_BASELINE_CORPORATE_MARGIN,
    baselineCorporateMargin: ALPHA_BASELINE_CORPORATE_MARGIN,
    unemploymentRate: 0.044, naturalRate: 0.044,
    params: DEFAULT_ALPHA_DRIVER_PARAMS,
  };

  it('year 0 cold start: only capability term active; other drivers zero', () => {
    const { alpha, decomposition } = computeEffectiveAlpha(baseInputs);
    expect(decomposition.trustContribution).toBe(0);
    expect(decomposition.competitiveContribution).toBe(0);
    expect(decomposition.marginContribution).toBe(0);
    expect(decomposition.slackContribution).toBe(0);
    // decomposition.baseline is the baseline seed (0.5); α = baseline + capabilityContribution (clamped [0,1])
    expect(decomposition.baseline).toBeCloseTo(0.5, 10);
    expect(alpha).toBeCloseTo(decomposition.baseline + decomposition.capabilityContribution, 10);
    expect(alpha).toBeGreaterThan(0.5);
    expect(alpha).toBeLessThan(0.55);
  });

  it('full capability + triggered + margin squeeze → α significantly above baseline, clamped [0,1]', () => {
    const inputs = {
      ...baseInputs,
      weightedCapability: 1.0, triggerYear: 2025,
      currentCorporateMargin: 0.06, // half of baseline
    };
    const { alpha } = computeEffectiveAlpha(inputs);
    expect(alpha).toBeGreaterThan(baseInputs.cluster.automationShare!);
    expect(alpha).toBeLessThanOrEqual(1);
    expect(alpha).toBeGreaterThanOrEqual(0);
  });

  it('high unemployment → negative slack contribution', () => {
    const { decomposition } = computeEffectiveAlpha({ ...baseInputs, unemploymentRate: 0.15 });
    expect(decomposition.slackContribution).toBeLessThan(0);
  });

  it('peer α above baseline → positive competitive contribution', () => {
    const { decomposition } = computeEffectiveAlpha({ ...baseInputs, previousYearPeerAlpha: 0.8 });
    expect(decomposition.competitiveContribution).toBeGreaterThan(0);
  });

  it('peer α at or below baseline → zero competitive contribution (not negative)', () => {
    const { decomposition } = computeEffectiveAlpha({ ...baseInputs, previousYearPeerAlpha: 0.3 });
    expect(decomposition.competitiveContribution).toBe(0);
  });

  it('margin at baseline → zero margin contribution', () => {
    const { decomposition } = computeEffectiveAlpha({ ...baseInputs, currentCorporateMargin: ALPHA_BASELINE_CORPORATE_MARGIN });
    expect(decomposition.marginContribution).toBe(0);
  });
});

describe('computePeerAlpha', () => {
  it('returns DEFAULT_COGNITIVE_ALPHA when peer group is empty (single cluster in category)', () => {
    const map = new Map<string, number>();
    const empMap = new Map<string, number>();
    const result = computePeerAlpha('Technology', 'c1', map, empMap, [mockCluster]);
    expect(result).toBe(DEFAULT_COGNITIVE_ALPHA);
  });

  it('excludes self — α(X, next year) independent of α(X, this year) via competitive channel', () => {
    const peerA: OccupationCluster = { ...mockCluster, id: 'a' };
    const peerB: OccupationCluster = { ...mockCluster, id: 'b' };
    const alphaMap = new Map([['a', 0.9], ['b', 0.2]]);
    const empMap = new Map([['a', 100], ['b', 100]]);
    // peer α for A should NOT include A's own α (should only be B's = 0.2)
    const resultA = computePeerAlpha('Technology', 'a', alphaMap, empMap, [peerA, peerB]);
    expect(resultA).toBeCloseTo(0.2, 5);
    // symmetrically
    const resultB = computePeerAlpha('Technology', 'b', alphaMap, empMap, [peerA, peerB]);
    expect(resultB).toBeCloseTo(0.9, 5);
  });

  it('employment-weights correctly', () => {
    const peerA: OccupationCluster = { ...mockCluster, id: 'a' };
    const peerB: OccupationCluster = { ...mockCluster, id: 'b' };
    const peerC: OccupationCluster = { ...mockCluster, id: 'c' };
    const alphaMap = new Map([['a', 0.8], ['b', 0.4]]);
    const empMap = new Map([['a', 300], ['b', 100]]);
    // Excluding c; weighted mean = (0.8*300 + 0.4*100) / 400 = 280/400 = 0.7
    const result = computePeerAlpha('Technology', 'c', alphaMap, empMap, [peerA, peerB, peerC]);
    expect(result).toBeCloseTo(0.7, 5);
  });
});
