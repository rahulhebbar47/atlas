/**
 * ATLAS New Job Creation Model — Unit Tests
 *
 * Tests the new job creation, durability filtering, and net job metrics
 * as defined in src/models/newJobs.ts.
 *
 * Mathematical invariants under test:
 *   J_new(t) = innovation_rate x GDP(t) x rd_multiplier
 *   durable_new_jobs(t) = J_new(t) x (1 - A(t))^persistence_factor
 *   net_jobs(t) = durable_new_jobs(t) - displaced_jobs(t)
 */

import { describe, it, expect } from 'vitest';
import {
  computeNewJobCreation,
  computeDurableNewJobs,
  computeNetJobCreation,
  computeNewJobMetrics,
  computeRequiredInnovationRate,
  findNetJobCrossoverYear,
} from '@/models/newJobs';
import {
  DEFAULT_INNOVATION_RATE,
  DEFAULT_RD_MULTIPLIER,
  DEFAULT_JOB_PERSISTENCE_FACTOR,
} from '@/models/constants';

// ============================================================
// Standard test values
// ============================================================

const GDP = 23_000_000_000_000; // $23T
const DISPLACED_JOBS = 500_000;

// DEPRECATED: uniformCapabilityScores removed (FIX 8).
// computeNewJobMetrics now accepts automationCoverage directly.

// ============================================================
// computeNewJobCreation
// ============================================================

describe('computeNewJobCreation', () => {
  it('is proportional to GDP', () => {
    const jobs1 = computeNewJobCreation(GDP);
    const jobs2 = computeNewJobCreation(GDP * 2);

    // Doubling GDP should double new job creation
    expect(jobs2).toBeCloseTo(jobs1 * 2, 0);
  });

  it('uses default innovation rate and rd multiplier', () => {
    const result = computeNewJobCreation(GDP);

    const expected = DEFAULT_INNOVATION_RATE * GDP * DEFAULT_RD_MULTIPLIER;
    expect(result).toBeCloseTo(expected, 0);
    expect(result).toBeGreaterThan(0);
  });

  it('creates more jobs with a higher innovation rate', () => {
    const lowRate = 0.000000010;
    const highRate = 0.000000030;

    const jobsLow = computeNewJobCreation(GDP, lowRate);
    const jobsHigh = computeNewJobCreation(GDP, highRate);

    expect(jobsHigh).toBeGreaterThan(jobsLow);
    // Ratio should match rate ratio
    expect(jobsHigh / jobsLow).toBeCloseTo(highRate / lowRate, 5);
  });

  it('returns zero when GDP is zero', () => {
    const result = computeNewJobCreation(0);
    expect(result).toBe(0);
  });

  it('returns non-negative even with negative GDP (clamped)', () => {
    const result = computeNewJobCreation(-1_000_000_000_000);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('scales with rd multiplier', () => {
    const jobs1 = computeNewJobCreation(GDP, DEFAULT_INNOVATION_RATE, 1.0);
    const jobs2 = computeNewJobCreation(GDP, DEFAULT_INNOVATION_RATE, 3.0);

    expect(jobs2).toBeCloseTo(jobs1 * 3, 0);
  });
});

// ============================================================
// computeDurableNewJobs
// ============================================================

describe('computeDurableNewJobs', () => {
  const NEW_JOBS = 500_000;

  it('preserves most new jobs when automation coverage is low', () => {
    const lowAutomation = 0.1;
    const durable = computeDurableNewJobs(NEW_JOBS, lowAutomation);

    // survivability = (1 - 0.1)^1.5 = 0.9^1.5 = ~0.854
    const expectedSurvivability = Math.pow(1 - lowAutomation, DEFAULT_JOB_PERSISTENCE_FACTOR);
    const expected = NEW_JOBS * expectedSurvivability;

    expect(durable).toBeCloseTo(expected, 0);
    // Most jobs should survive at low automation
    expect(durable).toBeGreaterThan(NEW_JOBS * 0.8);
  });

  it('leaves very few jobs when automation coverage is 0.9', () => {
    const highAutomation = 0.9;
    const durable = computeDurableNewJobs(NEW_JOBS, highAutomation);

    // survivability = (1 - 0.9)^1.5 = 0.1^1.5 = ~0.0316
    const expectedSurvivability = Math.pow(1 - highAutomation, DEFAULT_JOB_PERSISTENCE_FACTOR);
    const expected = NEW_JOBS * expectedSurvivability;

    expect(durable).toBeCloseTo(expected, 0);
    // Very few jobs should survive — less than 5%
    expect(durable).toBeLessThan(NEW_JOBS * 0.05);
  });

  it('returns zero durable jobs when automation coverage is 1.0', () => {
    const fullAutomation = 1.0;
    const durable = computeDurableNewJobs(NEW_JOBS, fullAutomation);

    // survivability = (1 - 1.0)^1.5 = 0^1.5 = 0
    expect(durable).toBe(0);
  });

  it('returns all jobs when automation coverage is 0.0', () => {
    const noAutomation = 0.0;
    const durable = computeDurableNewJobs(NEW_JOBS, noAutomation);

    // survivability = (1 - 0)^1.5 = 1^1.5 = 1
    expect(durable).toBe(NEW_JOBS);
  });

  it('respects custom persistence factor', () => {
    const automation = 0.5;

    // Higher persistence factor = more vulnerable to automation
    const durableHigh = computeDurableNewJobs(NEW_JOBS, automation, 3.0);
    const durableLow = computeDurableNewJobs(NEW_JOBS, automation, 0.5);

    // (1 - 0.5)^3.0 = 0.125  vs  (1 - 0.5)^0.5 = 0.707
    expect(durableLow).toBeGreaterThan(durableHigh);
  });
});

// ============================================================
// computeNetJobCreation
// ============================================================

describe('computeNetJobCreation', () => {
  it('returns positive when durable new jobs exceed displacement', () => {
    const net = computeNetJobCreation(800_000, 500_000);
    expect(net).toBe(300_000);
    expect(net).toBeGreaterThan(0);
  });

  it('returns negative when displacement exceeds durable new jobs', () => {
    const net = computeNetJobCreation(200_000, 500_000);
    expect(net).toBe(-300_000);
    expect(net).toBeLessThan(0);
  });

  it('returns zero when creation equals displacement', () => {
    const net = computeNetJobCreation(500_000, 500_000);
    expect(net).toBe(0);
  });

  it('returns the negative of displaced jobs when no new jobs are created', () => {
    const net = computeNetJobCreation(0, 500_000);
    expect(net).toBe(-500_000);
  });
});

// ============================================================
// computeNewJobMetrics (integration)
// ============================================================

describe('computeNewJobMetrics', () => {
  // FIX 8: computeNewJobMetrics now accepts automationCoverage directly
  // instead of capabilityScores.
  it('integrates all calculations into a single metrics object', () => {
    const automationCoverage = 0.3;
    const metrics = computeNewJobMetrics(GDP, automationCoverage, DISPLACED_JOBS);

    // automationCoverage is passed through
    expect(metrics.automationCoverage).toBeCloseTo(0.3, 10);

    // newJobCreationRate = innovationRate * GDP * rdMultiplier
    const expectedNewJobs = DEFAULT_INNOVATION_RATE * GDP * DEFAULT_RD_MULTIPLIER;
    expect(metrics.newJobCreationRate).toBeCloseTo(expectedNewJobs, 0);

    // durableNewJobs = newJobs * (1 - 0.3)^1.5
    const survivability = Math.pow(1 - 0.3, DEFAULT_JOB_PERSISTENCE_FACTOR);
    const expectedDurable = expectedNewJobs * survivability;
    expect(metrics.durableNewJobs).toBeCloseTo(expectedDurable, 0);

    // netJobCreation = durable - displaced
    expect(metrics.netJobCreation).toBeCloseTo(expectedDurable - DISPLACED_JOBS, 0);
  });

  it('returns zero new jobs when GDP is zero', () => {
    const metrics = computeNewJobMetrics(0, 0.5, DISPLACED_JOBS);

    expect(metrics.newJobCreationRate).toBe(0);
    expect(metrics.durableNewJobs).toBe(0);
    expect(metrics.netJobCreation).toBe(-DISPLACED_JOBS);
  });

  it('respects custom innovation rate, rd multiplier, and persistence factor', () => {
    const automationCoverage = 0.4;
    const customInnovation = 0.00000003;
    const customRD = 2.0;
    const customPersistence = 1.0;

    const metrics = computeNewJobMetrics(
      GDP, automationCoverage, DISPLACED_JOBS,
      customInnovation, customRD, customPersistence,
    );

    const expectedNewJobs = customInnovation * GDP * customRD;
    expect(metrics.newJobCreationRate).toBeCloseTo(expectedNewJobs, 0);

    const survivability = Math.pow(1 - 0.4, customPersistence);
    const expectedDurable = expectedNewJobs * survivability;
    expect(metrics.durableNewJobs).toBeCloseTo(expectedDurable, 0);
  });

  it('returns object with all expected fields', () => {
    const metrics = computeNewJobMetrics(GDP, 0.5, DISPLACED_JOBS);

    expect(metrics).toHaveProperty('automationCoverage');
    expect(metrics).toHaveProperty('newJobCreationRate');
    expect(metrics).toHaveProperty('durableNewJobs');
    expect(metrics).toHaveProperty('netJobCreation');
    expect(typeof metrics.automationCoverage).toBe('number');
    expect(typeof metrics.newJobCreationRate).toBe('number');
    expect(typeof metrics.durableNewJobs).toBe('number');
    expect(typeof metrics.netJobCreation).toBe('number');
  });

  it('returns 0 automation coverage when passed 0', () => {
    const metrics = computeNewJobMetrics(GDP, 0, DISPLACED_JOBS);
    expect(metrics.automationCoverage).toBe(0);
    // With 0 automation coverage, all new jobs survive
    expect(metrics.durableNewJobs).toBe(metrics.newJobCreationRate);
  });
});

// ============================================================
// computeRequiredInnovationRate (Phase 7)
// ============================================================

describe('computeRequiredInnovationRate', () => {
  it('returns 0 when there are no displaced jobs', () => {
    const result = computeRequiredInnovationRate(0, GDP, 0.5);
    expect(result).toBe(0);
  });

  it('computes correct rate for normal case', () => {
    const displaced = 500_000;
    const automation = 0.3;
    const rdMult = DEFAULT_RD_MULTIPLIER;
    const persist = DEFAULT_JOB_PERSISTENCE_FACTOR;

    const result = computeRequiredInnovationRate(displaced, GDP, automation, rdMult, persist);

    // Verify: J_new = rate × GDP × rdMult, durable = J_new × (1 - A)^persist
    // So: rate = displaced / (GDP × rdMult × (1-A)^persist)
    const survivability = Math.pow(1 - automation, persist);
    const expected = displaced / (GDP * rdMult * survivability);

    expect(result).toBeCloseTo(expected, 20);
    expect(result).toBeGreaterThan(0);
    expect(isFinite(result)).toBe(true);
  });

  it('returns Infinity when automation coverage is 1.0', () => {
    const result = computeRequiredInnovationRate(500_000, GDP, 1.0);
    expect(result).toBe(Infinity);
  });

  it('returns extremely large value when automation coverage is very close to 1.0', () => {
    const result = computeRequiredInnovationRate(500_000, GDP, 0.9999999);
    // Survivability ≈ (1e-7)^1.5 ≈ 3.16e-11 — denominator is extremely small
    // Required rate should be astronomically high (but not exactly Infinity at this precision)
    expect(result).toBeGreaterThan(100);
  });

  it('increases as automation coverage rises', () => {
    const rateAt30 = computeRequiredInnovationRate(500_000, GDP, 0.3);
    const rateAt60 = computeRequiredInnovationRate(500_000, GDP, 0.6);
    const rateAt90 = computeRequiredInnovationRate(500_000, GDP, 0.9);

    expect(rateAt60).toBeGreaterThan(rateAt30);
    expect(rateAt90).toBeGreaterThan(rateAt60);
  });

  it('increases proportionally with more displaced jobs', () => {
    const rate1 = computeRequiredInnovationRate(500_000, GDP, 0.5);
    const rate2 = computeRequiredInnovationRate(1_000_000, GDP, 0.5);

    expect(rate2).toBeCloseTo(rate1 * 2, 5);
  });
});

// ============================================================
// findNetJobCrossoverYear (Phase 7)
// ============================================================

describe('findNetJobCrossoverYear', () => {
  it('returns null when net jobs are always positive', () => {
    const data = [
      { year: 2025, netJobCreation: 100_000 },
      { year: 2026, netJobCreation: 80_000 },
      { year: 2027, netJobCreation: 50_000 },
    ];
    expect(findNetJobCrossoverYear(data)).toBeNull();
  });

  it('returns the first year of permanent negative', () => {
    const data = [
      { year: 2025, netJobCreation: 100_000 },
      { year: 2026, netJobCreation: 50_000 },
      { year: 2027, netJobCreation: -10_000 },
      { year: 2028, netJobCreation: -50_000 },
      { year: 2029, netJobCreation: -100_000 },
    ];
    expect(findNetJobCrossoverYear(data)).toBe(2027);
  });

  it('ignores temporary dips that recover', () => {
    const data = [
      { year: 2025, netJobCreation: 100_000 },
      { year: 2026, netJobCreation: -10_000 },  // temporary dip
      { year: 2027, netJobCreation: 20_000 },    // recovers
      { year: 2028, netJobCreation: -50_000 },   // permanent from here
      { year: 2029, netJobCreation: -100_000 },
    ];
    expect(findNetJobCrossoverYear(data)).toBe(2028);
  });

  it('returns null for empty data', () => {
    expect(findNetJobCrossoverYear([])).toBeNull();
  });

  it('returns first year if all data is negative', () => {
    const data = [
      { year: 2030, netJobCreation: -10_000 },
      { year: 2031, netJobCreation: -50_000 },
    ];
    expect(findNetJobCrossoverYear(data)).toBe(2030);
  });
});
