/**
 * ATLAS New Job Creation Model
 *
 * Implements new job creation vs. automation coverage
 * per DATA_MODEL.md Section 6.
 *
 * Key insight: As automation coverage A(t) → 0.9+, durable new jobs → ~0
 * regardless of how large the innovation rate is, because new jobs are
 * also automatable.
 *
 * All functions are PURE — no side effects, no state mutation.
 */

import {
  DEFAULT_INNOVATION_RATE,
  DEFAULT_RD_MULTIPLIER,
  DEFAULT_JOB_PERSISTENCE_FACTOR,
} from './constants';
// DEPRECATED: computeAutomationCoverage import removed (FIX 8).
// automationCoverage is now passed in as a parameter, computed from actual
// adoption-driven displacement rather than raw capability scores.

/**
 * Compute new job creation rate from AI-driven R&D and new industries.
 *
 * Formula (DATA_MODEL.md §6.1):
 *   J_new(t) = innovation_rate × GDP(t) × rd_multiplier
 *
 * @param gdp - Current real GDP
 * @param innovationRate - Jobs created per dollar of GDP
 * @param rdMultiplier - R&D amplification factor
 * @returns New jobs created (before survivability filter)
 */
export function computeNewJobCreation(
  gdp: number,
  innovationRate: number = DEFAULT_INNOVATION_RATE,
  rdMultiplier: number = DEFAULT_RD_MULTIPLIER,
): number {
  return Math.max(0, innovationRate * gdp * rdMultiplier);
}

/**
 * Compute durable new jobs — new jobs that survive automation.
 *
 * Formula (DATA_MODEL.md §6.1):
 *   durable_new_jobs(t) = J_new(t) × (1 - A(t))^persistence_factor
 *
 * As A(t) → 1, survivability → 0 exponentially.
 * persistence_factor > 1 means new jobs are MORE vulnerable (AI-adjacent).
 * persistence_factor < 1 means new jobs are MORE durable.
 *
 * @param newJobs - Raw new job creation J_new(t)
 * @param automationCoverage - A(t), fraction of all tasks AI can perform [0, 1]
 * @param persistenceFactor - Vulnerability of new jobs to automation
 * @returns Durable new jobs
 */
export function computeDurableNewJobs(
  newJobs: number,
  automationCoverage: number,
  persistenceFactor: number = DEFAULT_JOB_PERSISTENCE_FACTOR,
): number {
  // (1 - A(t))^persistence_factor
  const survivability = Math.pow(Math.max(0, 1 - automationCoverage), persistenceFactor);
  return Math.max(0, newJobs * survivability);
}

/**
 * Compute net job creation — new durable jobs minus displaced jobs.
 *
 * Formula (DATA_MODEL.md §6.2):
 *   net_jobs(t) = durable_new_jobs(t) - displaced_jobs(t)
 *
 * The crossover point where net_jobs becomes permanently negative
 * is identifiable and visualizable.
 *
 * @param durableNewJobs - Durable new jobs
 * @param displacedJobs - Total jobs displaced in this period
 * @returns Net job creation (negative = net loss)
 */
export function computeNetJobCreation(
  durableNewJobs: number,
  displacedJobs: number,
): number {
  return durableNewJobs - displacedJobs;
}

/**
 * Compute all new job metrics for a given year.
 *
 * @param gdp - Current real GDP
 * @param capabilityScores - Capability scores at time t
 * @param displacedJobs - Total displaced jobs at time t
 * @param innovationRate - Jobs per GDP dollar
 * @param rdMultiplier - R&D amplification
 * @param persistenceFactor - New job vulnerability
 * @returns Object with all new job metrics
 */
/**
 * Compute the required innovation rate to offset displacement.
 *
 * Answers DATA_MODEL.md §6.2: "How large would J_new need to be?"
 *
 * From: durable_new_jobs = innovation_rate × GDP × rd_multiplier × (1 - A(t))^persistence_factor
 * Solve for innovation_rate:
 *   required_rate = displaced_jobs / (GDP × rd_multiplier × (1 - A(t))^persistence_factor)
 *
 * Returns Infinity when survivability is ~0 (A(t) ≈ 1), meaning it's mathematically
 * impossible to create enough durable jobs to offset displacement.
 *
 * @param displacedJobs - Total jobs displaced at time t
 * @param gdp - Current real GDP
 * @param automationCoverage - A(t), fraction of tasks AI can perform [0, 1]
 * @param rdMultiplier - R&D amplification factor
 * @param persistenceFactor - Vulnerability of new jobs to automation
 * @returns Required innovation rate (jobs per dollar of GDP)
 */
export function computeRequiredInnovationRate(
  displacedJobs: number,
  gdp: number,
  automationCoverage: number,
  rdMultiplier: number = DEFAULT_RD_MULTIPLIER,
  persistenceFactor: number = DEFAULT_JOB_PERSISTENCE_FACTOR,
): number {
  if (displacedJobs <= 0) return 0;

  const survivability = Math.pow(Math.max(0, 1 - automationCoverage), persistenceFactor);
  const denominator = gdp * rdMultiplier * survivability;

  // When survivability → 0, no innovation rate can compensate
  if (denominator < 1e-10) return Infinity;

  return displacedJobs / denominator;
}

/**
 * Find the crossover year where net job creation becomes permanently negative.
 *
 * Scans a time series and returns the first year where netJobCreation < 0
 * and remains negative for all subsequent years.
 *
 * @param yearlyData - Array of { year, netJobCreation } sorted by year
 * @returns Crossover year or null if net jobs never goes permanently negative
 */
export function findNetJobCrossoverYear(
  yearlyData: Array<{ year: number; netJobCreation: number }>,
): number | null {
  for (let i = 0; i < yearlyData.length; i++) {
    if (yearlyData[i]!.netJobCreation < 0) {
      // Check if it stays negative for all remaining years
      const remainsNegative = yearlyData.slice(i).every((d) => d.netJobCreation < 0);
      if (remainsNegative) {
        return yearlyData[i]!.year;
      }
    }
  }
  return null;
}

/**
 * FIX 8: Now accepts automationCoverage directly instead of computing from
 * capability scores. automationCoverage = totalDirectDisplacement / BASELINE_TOTAL_EMPLOYMENT,
 * representing the actual fraction of the economy automated via adoption.
 */
export function computeNewJobMetrics(
  gdp: number,
  automationCoverage: number,
  displacedJobs: number,
  innovationRate: number = DEFAULT_INNOVATION_RATE,
  rdMultiplier: number = DEFAULT_RD_MULTIPLIER,
  persistenceFactor: number = DEFAULT_JOB_PERSISTENCE_FACTOR,
): {
  automationCoverage: number;
  newJobCreationRate: number;
  durableNewJobs: number;
  netJobCreation: number;
} {
  const newJobCreationRate = computeNewJobCreation(gdp, innovationRate, rdMultiplier);
  const durableNewJobs = computeDurableNewJobs(newJobCreationRate, automationCoverage, persistenceFactor);
  const netJobCreation = computeNetJobCreation(durableNewJobs, displacedJobs);

  return {
    automationCoverage,
    newJobCreationRate,
    durableNewJobs,
    netJobCreation,
  };
}
