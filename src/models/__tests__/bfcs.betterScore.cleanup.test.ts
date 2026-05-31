/**
 * ATLAS Better Score Cleanup Tests — Phase 10.A Part 4
 *
 * Phase 10.A removed the quality multiplier from computeBetterScore. Role-difficulty gating
 * now lives in aiReplacementDifficultyFriction (adoption delay inside findTriggerYear).
 *
 * Consequence: roles in the SAME cluster get the SAME Better score regardless of aiReplacementDifficulty.
 */
import { describe, it, expect } from 'vitest';
import { computeBetterScore } from '@/models/bfcs';
import type { OccupationCluster, RoleDefinition } from '@/types';

const juniorRole: RoleDefinition = {
  id: 'junior', label: 'Junior', seniorityLevel: 0.3, aiReplacementDifficulty: 0.3,
  employmentShareEstimate: 0.5,
  bfcsThresholds: { better: 0.5, faster: 0.5, cheaper: 0.5, safer: 0.5 },
};
const seniorRole: RoleDefinition = {
  id: 'senior', label: 'Senior', seniorityLevel: 0.9, aiReplacementDifficulty: 0.9,
  employmentShareEstimate: 0.5,
  bfcsThresholds: { better: 0.5, faster: 0.5, cheaper: 0.5, safer: 0.5 },
};

const mockCluster: OccupationCluster = {
  id: 'c', name: 'C', category: 'Tech', socCodes: [],
  roles: [juniorRole, seniorRole],
  capabilityRelevance: { weights: { generative: 0.5, agentic: 0.3, embodied: 0.2 } },
  deploymentType: 'software', employmentMultiplier: 1, adoptionLag: 0,
  geopoliticalRiskExposure: 0, notes: '', protectedByPolicy: false,
  policyDisplacementTarget: false, wageElasticity: 0.5,
  adoptionSteepness: 1.0, adoptionCeiling: 1.0,
  consumerDemandShare: 0.2, govDemandShare: 0.1,
};

const capScores = { generative: 0.6, agentic: 0.6, embodied: 0.6 };

describe('computeBetterScore — Phase 10.A cleanup (quality multiplier removed)', () => {
  it('junior and senior in the same cluster produce IDENTICAL Better scores', () => {
    const juniorB = computeBetterScore(capScores, mockCluster, juniorRole);
    const seniorB = computeBetterScore(capScores, mockCluster, seniorRole);
    expect(juniorB).toBeCloseTo(seniorB, 10);
  });

  it('Better score is the weighted sum of capability scores normalized by total weight', () => {
    // weights sum to 1.0; capability scores all 0.6 → weighted sum = 0.6, total weight = 1.0 → normalized = 0.6
    const better = computeBetterScore(capScores, mockCluster, juniorRole);
    expect(better).toBeCloseTo(0.6, 5);
  });

  it('weights still sum correctly (normalization preserved after cleanup)', () => {
    // Normalization guarantees Better is in [0, 1] when capability scores are in [0, 1]
    const highCap = { generative: 1.0, agentic: 1.0, embodied: 1.0 };
    const result = computeBetterScore(highCap, mockCluster, juniorRole);
    expect(result).toBeLessThanOrEqual(1.0);
  });
});
