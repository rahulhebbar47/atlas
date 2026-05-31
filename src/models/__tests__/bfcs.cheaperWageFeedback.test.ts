/**
 * ATLAS Cheaper-Score Wage Feedback Tests — Phase 10.A
 *
 * Verifies that priorYearWageAdjustmentByCluster from simulation.ts inflates humanCostFactor
 * inside computeCheaperScore, making AI look relatively more attractive (higher Cheaper score).
 */
import { describe, it, expect } from 'vitest';
import { computeCheaperScore } from '@/models/bfcs';
import type { OccupationCluster, RoleDefinition } from '@/types';

const mockRole: RoleDefinition = {
  id: 'r1', label: 'Role', seniorityLevel: 0.5,
  aiReplacementDifficulty: 0.5, employmentShareEstimate: 1,
  bfcsThresholds: { better: 0.5, faster: 0.5, cheaper: 0.5, safer: 0.5 },
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

describe('computeCheaperScore — Phase 10.A wage adjustment feedback', () => {
  it('wageAdjustment = 0 gives baseline Cheaper', () => {
    const baseline = computeCheaperScore(2030, mockRole, mockCluster);
    const explicitZero = computeCheaperScore(2030, mockRole, mockCluster, undefined, undefined, 0);
    expect(explicitZero).toBeCloseTo(baseline, 10);
  });

  it('positive wageAdjustment raises Cheaper score (scarcity → wages up → AI more attractive)', () => {
    const baseline = computeCheaperScore(2030, mockRole, mockCluster);
    const withAdj = computeCheaperScore(2030, mockRole, mockCluster, undefined, undefined, 0.1);
    expect(withAdj).toBeGreaterThan(baseline);
  });

  it('larger wageAdjustment raises Cheaper further', () => {
    const small = computeCheaperScore(2030, mockRole, mockCluster, undefined, undefined, 0.05);
    const big = computeCheaperScore(2030, mockRole, mockCluster, undefined, undefined, 0.20);
    expect(big).toBeGreaterThanOrEqual(small);
  });
});
