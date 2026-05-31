/**
 * ATLAS Federal Reserve Module (Phase 7)
 *
 * Implements Taylor Rule, fiscal dominance constraint, and
 * full employment GDP computation for output gap derivation.
 *
 * All functions are PURE — no side effects, no state mutation.
 */

import type { FederalReserveState } from '@/types';
import {
  INITIAL_POLICY_RATE,
  BASELINE_GDP_NOMINAL_2025,
  BASELINE_TOTAL_EMPLOYMENT,
  NATURAL_UNEMPLOYMENT_RATE,
} from './constants';

// ============================================================
// 1. Full Employment GDP
// ============================================================

/**
 * Computes GDP at full employment with AI productivity boost.
 *
 * NAMING NOTE: This is DIFFERENT from MacroOutput.potentialGDP, which means
 * "AI production potential" (gdpReal + aiConsumerGoodsPotential). This function
 * computes the GDP the economy would produce if unemployment were at its natural
 * rate and AI-augmented workers operated at boosted productivity.
 *
 * @param baselineGDPReal         - Real GDP at simulation start (BASELINE_GDP_NOMINAL_2025 at priceLevel=1.0)
 * @param baselineGDPGrowthRate   - Trend real GDP growth rate (config.baselineGDPGrowth, ~0.02)
 * @param yearsSinceStart         - Years elapsed since simulation start year
 * @param dynamicLaborForce       - Current labor force (from simulation loop, grows with population)
 * @param baselineTotalEmployment - Employment at simulation start (BASELINE_TOTAL_EMPLOYMENT)
 * @param naturalUnemploymentRate - NAIRU-equivalent rate (NATURAL_UNEMPLOYMENT_RATE, ~0.044)
 * @param aggregateAutomationCoverage - Fraction of economy automated [0, 1] (displacement-based)
 * @returns Full employment GDP ($)
 */
export function computeFullEmploymentGDP(
  baselineGDPReal: number,
  baselineGDPGrowthRate: number,
  yearsSinceStart: number,
  dynamicLaborForce: number,
  baselineTotalEmployment: number,
  naturalUnemploymentRate: number,
  aggregateAutomationCoverage: number,
): number {
  // Employment at natural unemployment rate
  const naturalEmployment = dynamicLaborForce * (1 - naturalUnemploymentRate);

  // AI productivity boost: at full automation coverage, remaining workers are ~50% more productive
  // Flag: needs calibration against existing aiProductivityPremium in Phillips curve
  const AI_PRODUCTIVITY_BOOST_AT_FULL_COVERAGE = 0.5;
  const productivityBoost = 1 + aggregateAutomationCoverage * AI_PRODUCTIVITY_BOOST_AT_FULL_COVERAGE;

  // Trend GDP = baseline compounded at structural growth rate
  const trendGDP = baselineGDPReal * Math.pow(1 + baselineGDPGrowthRate, yearsSinceStart);

  // Full employment GDP scales trend GDP by labor ratio and productivity
  const fullEmploymentGDP = trendGDP * (naturalEmployment / baselineTotalEmployment) * productivityBoost;

  return fullEmploymentGDP;
}

// ============================================================
// 2. Taylor Rule
// ============================================================

/**
 * Computes the Taylor Rule prescribed policy rate with dual-mandate support.
 *
 * Extends the standard Taylor (1993) Rule with an explicit employment gap term
 * to properly model the Fed's dual mandate of price stability AND maximum employment.
 *
 * The standard Taylor Rule uses the output gap as a proxy for employment via
 * Okun's Law (1pp unemployment ~ 2pp output gap). AI disruption severs this
 * relationship — GDP can grow from AI productivity while employment collapses.
 * An explicit employment term makes the dual mandate operational.
 *
 *   i = r* + pi + alpha * (pi - pi*) + beta_output * outputGap + beta_employment * (u* - u)
 *
 * Where (u* - u) is NEGATIVE when unemployment exceeds the natural rate,
 * pushing the prescribed rate DOWN (stimulative).
 *
 * NO artificial floor or ceiling is applied. The math produces the answer.
 * Negative rates represent a prescription for unconventional monetary policy (QE).
 *
 * Source: Taylor (1993); Yellen (2012) "The Economic Outlook and Monetary Policy"
 *         (balanced approach rule); Evans Rule (2012) for employment thresholds.
 *
 * @param neutralRealRate - r* (long-run equilibrium real rate)
 * @param compositeInflation - PREVIOUS year's composite inflation rate (one-year data lag)
 * @param inflationTarget - Fed's inflation target (config, 0.02)
 * @param outputGap - (realGDP - fullEmploymentGDP) / fullEmploymentGDP
 * @param taylorInflationCoeff - alpha (inflation response, default 1.5)
 * @param taylorOutputGapCoeff - beta_output (output gap response, default 0.5)
 * @param currentUnemploymentRate - Current unemployment rate (0-1)
 * @param naturalUnemploymentRate - Natural/NAIRU rate (0-1)
 * @param taylorEmploymentGapCoeff - beta_employment (employment gap response, default 0.3)
 * @returns Prescribed nominal policy rate (can be negative)
 */
export function computeTaylorRule(
  neutralRealRate: number,
  compositeInflation: number,
  inflationTarget: number,
  outputGap: number,
  taylorInflationCoeff: number,
  taylorOutputGapCoeff: number,
  currentUnemploymentRate: number = 0.044,
  naturalUnemploymentRate: number = 0.044,
  taylorEmploymentGapCoeff: number = 0.3,
): number {
  // Employment gap: negative when unemployment > natural rate -> pushes rate DOWN
  // At 30% unemployment (u=0.30, u*=0.044): gap = 0.044-0.30 = -0.256
  // With beta_employment=0.8: contribution = 0.8 * (-0.256) = -20.5pp
  // This is a massive rate cut prescription — appropriate for mass unemployment
  const employmentGap = naturalUnemploymentRate - currentUnemploymentRate;

  const taylorPrescribed =
    neutralRealRate +
    compositeInflation +
    taylorInflationCoeff * (compositeInflation - inflationTarget) +
    taylorOutputGapCoeff * outputGap +
    taylorEmploymentGapCoeff * employmentGap;

  return taylorPrescribed;
}

// ============================================================
// 3. Fiscal Dominance
// ============================================================

/**
 * Result of the fiscal dominance computation.
 */
export interface FiscalDominanceResult {
  /** Effective policy rate after fiscal dominance constraint */
  policyRate: number;
  /** Whether fiscal dominance is currently constraining the Fed */
  fiscalDominanceActive: boolean;
  /** Gap between Taylor-prescribed rate and actual rate due to fiscal dominance */
  fiscalDominanceGap: number;
  /** Phase 8 fix: How stuck the Fed is (0 = free to follow Taylor, 1 = fully stuck at prev rate). */
  dominanceFactor: number;
}

/**
 * Applies the fiscal dominance constraint to the Taylor-prescribed rate.
 *
 * When government debt service costs consume a large fraction of revenue,
 * the Fed becomes reluctant to raise rates further because doing so would
 * explode interest expense. This creates a soft ceiling on rate hikes.
 *
 * The dampening factor interpolates between the previous rate and the Taylor
 * prescription: as fiscal stress increases, the Fed can only partially close
 * the gap to where rates "should" be.
 *
 * @param taylorPrescribed          - Rate the Taylor Rule says we should be at
 * @param prevPolicyRate            - Previous year's actual policy rate
 * @param interestExpense           - Federal government interest expense ($)
 * @param totalGovernmentRevenue    - Total federal revenue ($)
 * @param fiscalDominanceThreshold  - Debt service/revenue ratio that triggers dominance (config, 0.25)
 * @param fiscalDominanceDampening  - How paralyzed Fed becomes (0=none, 1=fully stuck) (config, 0.5)
 * @param policyRateOverride        - User override from PolicySchedule (null = use Taylor)
 * @returns Effective policy rate, dominance status, and gap
 */
export function computeFiscalDominance(
  taylorPrescribed: number,
  prevPolicyRate: number,
  interestExpense: number,
  totalGovernmentRevenue: number,
  fiscalDominanceThreshold: number,
  fiscalDominanceDampening: number,
  policyRateOverride: number | null,
): FiscalDominanceResult {
  // If user has an explicit policy rate override, bypass Taylor Rule entirely
  if (policyRateOverride !== null) {
    return {
      policyRate: policyRateOverride,
      fiscalDominanceActive: false,
      fiscalDominanceGap: 0,
      dominanceFactor: 0,
    };
  }

  // Guard: avoid division by zero if revenue is zero or negative
  if (totalGovernmentRevenue <= 0) {
    // With no revenue, debt service ratio is effectively infinite — full dominance
    return {
      policyRate: prevPolicyRate,
      fiscalDominanceActive: true,
      fiscalDominanceGap: taylorPrescribed - prevPolicyRate,
      dominanceFactor: fiscalDominanceDampening, // Fully stuck
    };
  }

  const debtServiceRatio = interestExpense / totalGovernmentRevenue;

  if (debtServiceRatio > fiscalDominanceThreshold) {
    // Fiscal dominance is active — Fed cannot fully follow Taylor Rule
    const dominancePressure = (debtServiceRatio - fiscalDominanceThreshold) / fiscalDominanceThreshold;
    const dominanceFactor = Math.min(1, dominancePressure) * fiscalDominanceDampening;

    // Interpolate: dominanceFactor=0 → full Taylor, dominanceFactor=1 → stuck at prev rate
    const policyRate = prevPolicyRate + (1 - dominanceFactor) * (taylorPrescribed - prevPolicyRate);

    return {
      policyRate,
      fiscalDominanceActive: true,
      fiscalDominanceGap: taylorPrescribed - policyRate,
      dominanceFactor,
    };
  }

  // No fiscal dominance — Taylor Rule applies directly
  return {
    policyRate: taylorPrescribed,
    fiscalDominanceActive: false,
    fiscalDominanceGap: 0,
    dominanceFactor: 0,
  };
}

// ============================================================
// 4. Baseline State
// ============================================================

/**
 * Returns the initial FederalReserveState at simulation start (year 0).
 *
 * All values reflect the baseline economy:
 * - Policy rate = current FRED federal funds rate
 * - Output gap = 0 (economy at potential)
 * - Full employment GDP = baseline real GDP
 * - No fiscal dominance
 */
export function getBaselineFederalReserveState(): FederalReserveState {
  return {
    taylorPrescribedRate: INITIAL_POLICY_RATE,
    policyRate: INITIAL_POLICY_RATE,
    fiscalDominanceActive: false,
    fiscalDominanceGap: 0,
    dominanceFactor: 0,
    outputGap: 0,
    fullEmploymentGDP: BASELINE_GDP_NOMINAL_2025,
  };
}
