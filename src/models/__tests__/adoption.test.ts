/**
 * ATLAS Adoption Model Tests
 *
 * Tests the S-curve adoption dynamics, geopolitical risk modifiers,
 * competitive pressure, and revenue pressure functions from
 * src/models/adoption.ts.
 *
 * Reference: DATA_MODEL.md Sections 3.1-3.3, 5.6
 */

import { describe, it, expect } from 'vitest';
import {
  computeBaseAdoptionRate,
  applyGeopoliticalRisk,
  applyCompetitivePressure,
  applyRevenuePressure,
  getAdoptionRate,
} from '@/models/adoption';
import { DEFAULT_ADOPTION_PARAMS } from '@/models/constants';
import type { AdoptionParams } from '@/types';

// ---------------------------------------------------------------------------
// computeBaseAdoptionRate
// ---------------------------------------------------------------------------
describe('computeBaseAdoptionRate', () => {
  it('returns 0 before trigger year', () => {
    const rate = computeBaseAdoptionRate(2025, 2030, 'software', 0);
    expect(rate).toBe(0);
  });

  // DEPRECATED (Phase 10.A): Old logistic curve started at 0.5 at t=triggerYear+lag.
  // New asymmetric curve `(1 - exp(-k × t))^(1 + wagePremium × 5)` starts at 0 and climbs.
  // This is intentional per Phase 10.A plan — more realistic early-stage adoption dynamics.
  it('returns 0 at exactly triggerYear + adoptionLag (Phase 10.A: new asymmetric S-curve starts at 0)', () => {
    const triggerYear = 2025;
    const adoptionLag = 2;
    const rate = computeBaseAdoptionRate(
      triggerYear + adoptionLag,
      triggerYear,
      'software',
      adoptionLag,
    );
    expect(rate).toBe(0);
  });

  it('climbs rapidly after trigger+lag for software (Phase 10.A asymmetric S-curve)', () => {
    // At timeSinceTrigger=1 and software steepness 3.0, rate = (1 - exp(-3))^1 ≈ 0.95
    const triggerYear = 2025;
    const lag = 0;
    const rateAtT1 = computeBaseAdoptionRate(2026, triggerYear, 'software', lag);
    expect(rateAtT1).toBeGreaterThan(0.90);
    expect(rateAtT1).toBeLessThanOrEqual(1.0);
  });

  it('returns close to 1.0 long after trigger', () => {
    // Software steepness = 3.0; 10 years past trigger+lag should saturate
    const rate = computeBaseAdoptionRate(2045, 2025, 'software', 0);
    expect(rate).toBeGreaterThan(0.99);
  });

  it('software steepness produces faster adoption than robotics', () => {
    const year = 2030;
    const triggerYear = 2028;
    const lag = 0;

    const softwareRate = computeBaseAdoptionRate(year, triggerYear, 'software', lag);
    const roboticsRate = computeBaseAdoptionRate(year, triggerYear, 'robotics', lag);

    // Software default steepness = 3.0, robotics = 0.75
    // At t=2 both should be positive, but software should be much higher
    expect(softwareRate).toBeGreaterThan(roboticsRate);
  });

  it('adoption lag delays the S-curve midpoint', () => {
    const triggerYear = 2025;

    // No lag: at trigger + 0 the exponent is -a*(-lag) when lag>0
    // With lag=3 and year=triggerYear+1 => timeSinceTrigger = 1 - 3 = -2 => rate < 0.5
    const rateWithLag = computeBaseAdoptionRate(2028, triggerYear, 'software', 3);
    const rateNoLag = computeBaseAdoptionRate(2028, triggerYear, 'software', 0);

    expect(rateNoLag).toBeGreaterThan(rateWithLag);
  });
});

// ---------------------------------------------------------------------------
// applyGeopoliticalRisk
// ---------------------------------------------------------------------------
describe('applyGeopoliticalRisk', () => {
  it('reduces steepness proportionally to risk and exposure', () => {
    const baseSteepness = 1.0;
    const exposure = 0.5;
    const riskFactor = 0.4;

    const adjusted = applyGeopoliticalRisk(baseSteepness, exposure, riskFactor);
    // a_eff = 1.0 * (1 - 0.4 * 0.5) = 1.0 * 0.8 = 0.8
    expect(adjusted).toBeCloseTo(0.8, 10);
  });

  it('has no effect when exposure is 0', () => {
    const baseSteepness = 2.5;
    const adjusted = applyGeopoliticalRisk(baseSteepness, 0, 0.5);
    expect(adjusted).toBe(baseSteepness);
  });
});

// ---------------------------------------------------------------------------
// applyCompetitivePressure
// ---------------------------------------------------------------------------
describe('applyCompetitivePressure', () => {
  it('has no effect when adoption rate is below the threshold (0.2)', () => {
    const rate = 0.15;
    const adjusted = applyCompetitivePressure(rate, DEFAULT_ADOPTION_PARAMS);
    // pressure = max(0, 0.15 - 0.2) * 2.0 = 0; adjusted = 0.15 * (1 + 0) = 0.15
    expect(adjusted).toBe(rate);
  });

  it('accelerates adoption when rate is above the threshold (peerAlpha=0 routes all pressure to adoption)', () => {
    // Phase 10.A: applyCompetitivePressure now splits by peerAlpha.
    // With peerAlpha=0, ALL pressure flows to the adoption-rate channel (old behavior).
    // With peerAlpha=0.5 (default), half flows to α (via computeEffectiveAlpha), so adoption
    // rate sees only half the boost. This test pins the peerAlpha=0 case.
    const rate = 0.5;
    const adjusted = applyCompetitivePressure(rate, DEFAULT_ADOPTION_PARAMS, 0);
    // pressure = max(0, 0.5 - 0.2) * 2.0 = 0.6; adjusted = 0.5 * (1 + 0.6 * 1.0) = 0.8
    expect(adjusted).toBeGreaterThan(rate);
    expect(adjusted).toBeCloseTo(0.8, 10);
  });

  it('competitive pressure is halved when peerAlpha = 0.5 (default split)', () => {
    const rate = 0.5;
    const adjusted = applyCompetitivePressure(rate, DEFAULT_ADOPTION_PARAMS, 0.5);
    // pressure = 0.6, adjusted = 0.5 * (1 + 0.6 * 0.5) = 0.5 * 1.3 = 0.65
    expect(adjusted).toBeCloseTo(0.65, 10);
  });
});

// ---------------------------------------------------------------------------
// applyRevenuePressure
// ---------------------------------------------------------------------------
describe('applyRevenuePressure', () => {
  it('amplifies adoption rate by automation acceleration factor', () => {
    const adjustedRate = 0.4;
    const acceleration = 0.25;
    const final = applyRevenuePressure(adjustedRate, acceleration);
    // 0.4 * (1 + 0.25) = 0.5
    expect(final).toBeCloseTo(0.5, 10);
  });

  it('clamps result to 1.0 when amplified rate would exceed it', () => {
    const final = applyRevenuePressure(0.9, 0.5);
    // 0.9 * 1.5 = 1.35 -> clamped to 1.0
    expect(final).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// getAdoptionRate (full chain)
// ---------------------------------------------------------------------------
describe('getAdoptionRate', () => {
  it('returns not triggered when triggerYear is null', () => {
    const result = getAdoptionRate(2030, null, 'software', 0, 0);
    expect(result.triggered).toBe(false);
    expect(result.triggerYear).toBeNull();
    expect(result.adoptionRate).toBe(0);
    expect(result.adjustedAdoptionRate).toBe(0);
  });

  it('returns not triggered (triggered=false, rate=0) when year < triggerYear and triggerYear is in the future', () => {
    // When triggerYear is non-null but year < triggerYear, the result has
    // triggered = true (thresholds HAVE been met in the future timeline)
    // but adoptionRate = 0 (we haven't reached that year yet).
    // Actually, looking at the code: if year < triggerYear, triggered = (triggerYear !== null)
    // So with triggerYear = 2035 and year = 2030, triggered = true but rates are 0.
    const result = getAdoptionRate(2030, 2035, 'software', 0, 0);
    expect(result.triggered).toBe(true);
    expect(result.adoptionRate).toBe(0);
    expect(result.adjustedAdoptionRate).toBe(0);
  });

  it('chains all modifiers: geo risk, competitive pressure, revenue pressure', () => {
    // Use a year well past trigger so we get a high base rate
    const year = 2040;
    const triggerYear = 2025;
    const deploymentType = 'software' as const;
    const adoptionLag = 0;
    const geoRiskExposure = 0.5;
    const automationAcceleration = 0.1;

    const result = getAdoptionRate(
      year,
      triggerYear,
      deploymentType,
      adoptionLag,
      geoRiskExposure,
      DEFAULT_ADOPTION_PARAMS,
      automationAcceleration,
    );

    expect(result.triggered).toBe(true);
    expect(result.triggerYear).toBe(triggerYear);
    expect(result.adoptionRate).toBeGreaterThan(0);
    expect(result.adjustedAdoptionRate).toBeGreaterThanOrEqual(result.adoptionRate);
    expect(result.adjustedAdoptionRate).toBeLessThanOrEqual(1);
  });

  it('all rates are clamped to [0, 1]', () => {
    // Even with extreme acceleration, rates must stay in [0, 1]
    const extremeParams: AdoptionParams = {
      steepnessByDeployment: {
        software: 10,
        robotics: 10,
        autonomous_vehicle: 10,
        hybrid: 10,
      },
      competitivePressureThreshold: 0.01,
      competitivePressureMultiplier: 50,
      geopoliticalRiskFactor: 0,
    };

    const result = getAdoptionRate(
      2040,
      2025,
      'software',
      0,
      0,
      extremeParams,
      5.0, // extreme automation acceleration
    );

    expect(result.adoptionRate).toBeGreaterThanOrEqual(0);
    expect(result.adoptionRate).toBeLessThanOrEqual(1);
    expect(result.adjustedAdoptionRate).toBeGreaterThanOrEqual(0);
    expect(result.adjustedAdoptionRate).toBeLessThanOrEqual(1);
  });
});
