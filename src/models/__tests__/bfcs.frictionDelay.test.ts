/**
 * ATLAS Friction Delay Tests — Phase 10.A Part 9
 *
 * findTriggerYear now takes roleFriction + maxAdoptionFrictionYears as separate parameters.
 * Multiplication happens INSIDE findTriggerYear: frictionYears = roleFriction × maxAdoptionFrictionYears.
 * Effective trigger year = ceil(bfcsTriggerYear + frictionYears). Out-of-window → null.
 */
import { describe, it, expect } from 'vitest';
import { findTriggerYear } from '@/models/bfcs';
import type { OccupationCluster, RoleDefinition, CapabilityVectorId } from '@/types';

const mockRole: RoleDefinition = {
  id: 'r', label: 'Role', seniorityLevel: 0.5,
  aiReplacementDifficulty: 0.5, employmentShareEstimate: 1,
  // All thresholds 0 so the role triggers immediately at startYear
  // (at t=0 the inference curve is 1.0, so Cheaper score = 0; need threshold = 0 with `>=`).
  bfcsThresholds: { better: 0, faster: 0, cheaper: 0, safer: 0 },
};

const mockCluster: OccupationCluster = {
  id: 'c', name: 'C', category: 'Technology', socCodes: [],
  roles: [mockRole],
  capabilityRelevance: { weights: { generative: 1, agentic: 0, embodied: 0 } },
  deploymentType: 'software', employmentMultiplier: 1, adoptionLag: 0,
  geopoliticalRiskExposure: 0, notes: '', protectedByPolicy: false,
  policyDisplacementTarget: false, wageElasticity: 0.5,
  adoptionSteepness: 1.0, adoptionCeiling: 1.0,
  consumerDemandShare: 0.2, govDemandShare: 0.1,
};

const getScores = (_year: number): Record<CapabilityVectorId, number> => ({
  generative: 0.9, agentic: 0.9, embodied: 0.9,
});

describe('findTriggerYear — Phase 10.A fix #2 friction-years', () => {
  it('frictionYears = 0 → no delay (triggers at raw BFCS-met year)', () => {
    const y = findTriggerYear(mockCluster, mockRole, 2025, 2050, getScores, undefined, undefined, 0);
    expect(y).toBe(2025);
  });

  it('frictionYears = 3 → trigger year shifts +3', () => {
    const y = findTriggerYear(mockCluster, mockRole, 2025, 2050, getScores, undefined, undefined, 3);
    expect(y).toBe(2028);
  });

  it('frictionYears = 50 → pushed outside the simulation window → null', () => {
    const y = findTriggerYear(mockCluster, mockRole, 2025, 2050, getScores, undefined, undefined, 50);
    expect(y).toBe(null);
  });

  it('thresholds never met → null regardless of frictionYears', () => {
    const impossibleRole: RoleDefinition = {
      ...mockRole,
      bfcsThresholds: { better: 2.0, faster: 2.0, cheaper: 2.0, safer: 2.0 },
    };
    const y = findTriggerYear(mockCluster, impossibleRole, 2025, 2050, getScores, undefined, undefined, 0);
    expect(y).toBe(null);
  });
});
