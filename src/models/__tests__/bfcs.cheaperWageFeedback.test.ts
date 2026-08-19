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
  // Mini-stage 1 re-spec: moved 2030 → 2050 — under frontier pricing (arrival=null) the score is
  // 0-clamped at 2030 (equality was degenerate); at 2050 per-token decay dominates and the
  // default-vs-explicit-zero equality is tested on an interior value.
  it('wageAdjustment = 0 gives baseline Cheaper', () => {
    const baseline = computeCheaperScore(2050, mockRole, mockCluster);
    const explicitZero = computeCheaperScore(2050, mockRole, mockCluster, undefined, undefined, 0);
    expect(baseline).toBeGreaterThan(0); // interior — the equality is non-degenerate
    expect(explicitZero).toBeCloseTo(baseline, 10);
  });

  // Mini-stage 1 re-spec: frontier pricing 0-clamps Cheaper at 2030 for both wage levels; the wage
  // feedback is now asserted in the arrival-anchored regime (arrival 2025, surplus 0.5) at 2035
  // where the score is interior.
  it('positive wageAdjustment raises Cheaper score (scarcity → wages up → AI more attractive)', () => {
    const baseline = computeCheaperScore(2035, mockRole, mockCluster, undefined, undefined, 0, undefined, 1.0, 2025, 0.5);
    const withAdj = computeCheaperScore(2035, mockRole, mockCluster, undefined, undefined, 0.1, undefined, 1.0, 2025, 0.5);
    expect(baseline).toBeGreaterThan(0); // interior — feedback is observable, not clamped away
    expect(withAdj).toBeGreaterThan(baseline);
  });

  // Mini-stage 1 re-spec: same arrival-anchored interior configuration, so monotonicity in
  // wageAdjustment is strict rather than the degenerate 0 ≥ 0.
  it('larger wageAdjustment raises Cheaper further', () => {
    const small = computeCheaperScore(2035, mockRole, mockCluster, undefined, undefined, 0.05, undefined, 1.0, 2025, 0.5);
    const big = computeCheaperScore(2035, mockRole, mockCluster, undefined, undefined, 0.20, undefined, 1.0, 2025, 0.5);
    expect(small).toBeGreaterThan(0);
    expect(big).toBeGreaterThan(small);
  });
});
