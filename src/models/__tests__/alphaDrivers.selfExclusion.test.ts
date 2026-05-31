/**
 * ATLAS Alpha Drivers Self-Exclusion Test — Phase 10.A Part 6
 *
 * Verifies that α(X, year N+1) is independent of α(X, year N) through the competitive channel.
 * Self-inclusion in peer mean would create a runaway α loop. The snapshot + filter(p !== self)
 * combination prevents this.
 */
import { describe, it, expect } from 'vitest';
import { computePeerAlpha } from '@/models/alphaDrivers';
import type { OccupationCluster } from '@/types';

const mkCluster = (id: string): OccupationCluster => ({
  id, name: id, category: 'Cat', socCodes: [],
  roles: [],
  capabilityRelevance: { weights: { generative: 1, agentic: 0, embodied: 0 } },
  deploymentType: 'software', employmentMultiplier: 1, adoptionLag: 0,
  geopoliticalRiskExposure: 0, notes: '', protectedByPolicy: false,
  policyDisplacementTarget: false, wageElasticity: 0.5,
  adoptionSteepness: 1.0, adoptionCeiling: 1.0,
  consumerDemandShare: 0.2, govDemandShare: 0.1,
});

describe('Alpha driver self-exclusion (Phase 10.A Part 6)', () => {
  it('2-cluster category: peer α for X returns only Y, never includes X itself', () => {
    const clusters = [mkCluster('x'), mkCluster('y')];
    const empMap = new Map([['x', 100], ['y', 100]]);

    // Scenario 1: X=0.9, Y=0.2 → peerAlpha for X = 0.2
    const scenario1 = computePeerAlpha('Cat', 'x', new Map([['x', 0.9], ['y', 0.2]]), empMap, clusters);
    expect(scenario1).toBeCloseTo(0.2, 10);

    // Scenario 2: X=0.1, Y=0.2 (X changed, Y same) → peerAlpha for X should STILL be 0.2
    const scenario2 = computePeerAlpha('Cat', 'x', new Map([['x', 0.1], ['y', 0.2]]), empMap, clusters);
    expect(scenario2).toBeCloseTo(0.2, 10);

    // Conclusion: peerAlpha for X does NOT depend on X's own α — only on peers.
    expect(scenario1).toBe(scenario2);
  });
});
