/**
 * ATLAS Fiscal Accounting Module (Phase 7)
 *
 * Implements government revenue reorganization, spending obligations,
 * deficit/debt accumulation, and weighted average debt rate dynamics.
 *
 * Revenue is decomposed into 3 endogenous buckets (labor, corporate, other)
 * from the 8 tax components already computed by computeMacro(). Spending
 * tracks existing obligations, policy costs, and interest expense. Debt
 * accumulates with a weighted-average rate that blends rollover and new
 * issuance at the current 10Y yield.
 *
 * All functions are PURE — no side effects, no state mutation.
 */

import type { FiscalState } from '@/types';
import type { FiscalResponseProfile } from './fiscalResponseProfiles';
import {
  INITIAL_FEDERAL_DEBT,
  INITIAL_10Y_YIELD,
  INITIAL_WEIGHTED_AVG_DEBT_RATE,
  BASELINE_GDP_NOMINAL_2025,
  FEDERAL_REVENUE_GDP_RATIO,
  FISCAL_MONETARY_SAFETY_CAP,
  G_OBLIGATION_SHARE,
  G_REVENUE_SENSITIVE_SHARE,
} from './constants';

// ============================================================
// 1. Revenue Reorganization
// ============================================================

/**
 * Reorganize the 8 tax components (already computed by computeMacro)
 * into a 3-bucket endogenous revenue structure.
 *
 * Buckets:
 *   - laborTaxRevenue: personal income tax on wages + employee payroll + employer payroll
 *   - corporateTaxRevenue: corporate income tax (pass-through)
 *   - otherRevenue: capital gains + state/local + transfer tax + non-corporate asset tax
 *
 * Source: BEA NIPA Table 3.2 (Government Current Receipts by Type);
 *         CBO Revenue Projections (2024) for category splits.
 *
 * @param wageIncomeTax - Personal income tax on wage income
 * @param employeePayrollTax - Employee-side payroll tax (FICA §3101)
 * @param employerPayrollTax - Employer-side payroll tax (FICA §3111)
 * @param corporateTaxRevenue - Corporate income tax
 * @param capitalGainsTax - Tax on capital gains / investment income
 * @param stateLocalRevenue - State and local government revenue
 * @param transferTax - Tax on transfer income (e.g., partial SS taxation)
 * @param nonCorpAssetTax - Tax on non-corporate asset income (interest, rent, proprietor's)
 * @param nominalGDP - Current nominal GDP (for ratio computation)
 * @returns Revenue decomposition with total and GDP ratio
 */
export function computeEndogenousRevenue(
  wageIncomeTax: number,
  employeePayrollTax: number,
  employerPayrollTax: number,
  corporateTaxRevenue: number,
  capitalGainsTax: number,
  stateLocalRevenue: number,
  transferTax: number,
  nonCorpAssetTax: number,
  nominalGDP: number,
): {
  laborTaxRevenue: number;
  corporateTaxRevenue: number;
  otherRevenue: number;
  bookedRevenueT1: number;
  revenueGDPRatio: number;
} {
  // FS-6f (ruled rename; was totalGovernmentRevenue): every input arrives from the PREVIOUS
  // year's MacroOutput (the fiscal block's uniform t−1 booking convention), so the total this
  // function books equals MacroOutput.totalGovernmentRevenue(t−1) exactly. The name carries
  // the offset; the completeness assertion at the simulation.ts bridge enforces the identity.
  const laborTaxRevenue = wageIncomeTax + employeePayrollTax + employerPayrollTax;
  const otherRevenue = capitalGainsTax + stateLocalRevenue + transferTax + nonCorpAssetTax;
  const bookedRevenueT1 = laborTaxRevenue + corporateTaxRevenue + otherRevenue;
  const revenueGDPRatio = nominalGDP > 0 ? bookedRevenueT1 / nominalGDP : 0;

  return {
    laborTaxRevenue,
    corporateTaxRevenue,
    otherRevenue,
    bookedRevenueT1,
    revenueGDPRatio,
  };
}

// ============================================================
// 2. Government Spending
// ============================================================

/**
 * Compute total government spending from existing obligations,
 * new policy costs, and debt service.
 *
 * Existing obligations are defined as current revenue plus the baseline
 * deficit (the government already spends more than it collects). Policy
 * costs (UBI, retraining, etc.) and interest on accumulated debt are
 * additive on top.
 *
 * Source: CBO Budget and Economic Outlook (2024) for baseline deficit;
 *         FRED FYFSGDA188S for deficit/GDP ratio.
 *
 * @param totalGovernmentRevenue - Total tax revenue (from computeEndogenousRevenue)
 * @param baselinePrimaryDeficitGDPRatio - Structural PRIMARY deficit (excl. interest) as fraction of GDP (e.g., 0.027)
 * @param nominalGDP - Current nominal GDP
 * @param policyTransferAddition - Transfer channel addition from policy effects (UBI, SWF dividends, etc.)
 * @param retrainingCosts - Government spending on retraining programs
 * @param otherPolicyCosts - Future extensibility — additional policy spending (pass 0 if unused)
 * @param prevDebtStock - Previous year's total federal debt stock
 * @param weightedAverageDebtRate - Blended interest rate on outstanding debt
 * @param discretionaryMultiplier - Phase 8a: fiscal consolidation multiplier for discretionary G (default 1.0)
 * @param obligationMultiplier - Phase 8a: fiscal consolidation multiplier for mandatory G (default 1.0)
 * @param stabilizerTransfers - Stage 5 (H3): incremental-UE transfer outlays (cash + in-kind), the SAME
 *        dollar flow paid to households on the income/consumption side (computeMacro's
 *        incrementalTransferSpending, previous year per the fiscal block's t−1 convention).
 *        Previously this spending was NEVER booked in the load-bearing budget — households received
 *        unbooked income while only the reporting deficit carried an (inconsistent $65B/pp) estimate.
 * @returns Spending decomposition
 */
export function computeGovernmentSpending(
  totalGovernmentRevenue: number,
  baselinePrimaryDeficitGDPRatio: number,
  nominalGDP: number,
  policyTransferAddition: number,
  retrainingCosts: number,
  otherPolicyCosts: number,
  prevDebtStock: number,
  weightedAverageDebtRate: number,
  discretionaryMultiplier: number = 1.0,
  obligationMultiplier: number = 1.0,
  stabilizerTransfers: number = 0,
): {
  existingObligations: number;
  policyCosts: number;
  stabilizerTransfers: number;
  interestExpense: number;
  totalGovernmentSpending: number;
} {
  // Existing obligations = what government would spend absent new policies
  // Revenue + structural PRIMARY deficit (excluding interest, which is computed dynamically below)
  // Using primary deficit avoids double-counting interest that's already in the total deficit figure
  // Phase 8a: Decompose into obligation vs discretionary portions and apply consolidation multipliers.
  // Uses the same 80/20 split (G_OBLIGATION_SHARE / G_REVENUE_SENSITIVE_SHARE) as macro.ts
  // to ensure the deficit equation and GDP equation use the same government spending figure.
  const baseObligations = totalGovernmentRevenue + baselinePrimaryDeficitGDPRatio * nominalGDP;
  const obligationPortion = G_OBLIGATION_SHARE * baseObligations * obligationMultiplier;
  const discretionaryPortion = G_REVENUE_SENSITIVE_SHARE * baseObligations * discretionaryMultiplier;
  const existingObligations = obligationPortion + discretionaryPortion;

  // New policy costs layered on top
  const policyCosts = policyTransferAddition + retrainingCosts + otherPolicyCosts;

  // Debt service: interest on accumulated debt at the blended rate
  // Cap to safety limit to prevent IEEE 754 overflow in extreme scenarios
  const interestExpense = Math.min(
    FISCAL_MONETARY_SAFETY_CAP,
    prevDebtStock * weightedAverageDebtRate,
  );

  // Stage 5 (H3): automatic-stabilizer transfers to the incremental unemployed are a real budget
  // outlay above the revenue-following baseline (baseObligations does NOT grow with UE — spending
  // tracks revenue + the structural ratio — so adding the increment here is not double-counting;
  // it is exactly $0 at baseline unemployment).
  const totalGovernmentSpending = existingObligations + policyCosts + stabilizerTransfers + interestExpense;

  return {
    existingObligations,
    policyCosts,
    stabilizerTransfers,
    interestExpense,
    totalGovernmentSpending,
  };
}

// ============================================================
// 3. Debt Accumulation
// ============================================================

/**
 * Compute deficit and debt accumulation for the current year.
 *
 * The primary deficit excludes interest (structural gap between non-interest
 * spending and revenue). The total deficit includes interest. Debt stock
 * accumulates as previous stock + total deficit, floored at zero (surpluses
 * reduce debt but it cannot go negative).
 *
 * Source: CBO "The Budget and Economic Outlook" methodology;
 *         IMF Fiscal Monitor debt dynamics framework.
 *
 * @param totalGovernmentSpending - Total spending (from computeGovernmentSpending)
 * @param totalGovernmentRevenue - Total revenue (from computeEndogenousRevenue)
 * @param interestExpense - Interest on debt (from computeGovernmentSpending)
 * @param prevDebtStock - Previous year's total debt stock
 * @param nominalGDP - Current nominal GDP (for debt/GDP ratio)
 * @returns Deficit and debt metrics
 */
export function computeDebtAccumulation(
  totalGovernmentSpending: number,
  totalGovernmentRevenue: number,
  interestExpense: number,
  prevDebtStock: number,
  nominalGDP: number,
): {
  primaryDeficit: number;
  totalDeficit: number;
  debtStock: number;
  debtGDPRatio: number;
} {
  // Primary deficit = non-interest spending minus revenue
  const primaryDeficit = totalGovernmentSpending - interestExpense - totalGovernmentRevenue;

  // Total deficit = primary deficit + interest
  const totalDeficit = primaryDeficit + interestExpense;

  // Debt stock accumulates; surpluses reduce debt but it cannot go below zero
  // Cap to safety limit to prevent IEEE 754 overflow
  const debtStock = Math.min(
    FISCAL_MONETARY_SAFETY_CAP,
    Math.max(0, prevDebtStock + totalDeficit),
  );

  // Debt-to-GDP ratio (guard against division by zero)
  const debtGDPRatio = nominalGDP > 0 ? debtStock / nominalGDP : 0;

  return {
    primaryDeficit,
    totalDeficit,
    debtStock,
    debtGDPRatio,
  };
}

// ============================================================
// 4. Weighted Average Debt Rate
// ============================================================

/**
 * Compute the blended interest rate on outstanding federal debt.
 *
 * Each year, a fraction of existing debt matures and is reissued ("rolled over")
 * at the current market rate (10Y yield). New deficit issuance also occurs at
 * this rate. The remainder of existing debt retains its previous blended rate.
 *
 * This produces a gradual convergence of the average rate toward the current
 * market rate, matching real-world Treasury debt dynamics where the ~6-year
 * weighted-average maturity means rate changes propagate slowly.
 *
 * Source: Treasury quarterly refunding statements;
 *         CBO "Federal Debt and the Statutory Limit" (2024);
 *         BIS "Government bond market dynamics" working paper (2023).
 *
 * @param prevDebtStock - Previous year's total debt stock
 * @param prevWeightedAvgRate - Previous year's blended interest rate
 * @param debtRolloverRate - Fraction of existing debt rolling over annually (e.g., 0.30)
 * @param newIssuanceRate - Current market rate for new issuance (10Y yield)
 * @param totalDeficit - Current year's total deficit (positive = new borrowing)
 * @param currentDebtStock - Current year's total debt stock (after accumulation)
 * @returns New weighted average interest rate on federal debt
 */
export function computeWeightedAverageDebtRate(
  prevDebtStock: number,
  prevWeightedAvgRate: number,
  debtRolloverRate: number,
  newIssuanceRate: number,
  totalDeficit: number,
  currentDebtStock: number,
): number {
  // Guard: if no debt, return the current market rate
  if (currentDebtStock <= 0) {
    return newIssuanceRate;
  }

  // Portion of existing debt that rolls over at the new market rate
  const rolledOver = prevDebtStock * debtRolloverRate;

  // Only positive deficits issue new debt; surpluses don't issue at the new rate
  const newDeficit = Math.max(0, totalDeficit);

  // Retained debt keeps the old blended rate
  const retained = prevDebtStock - rolledOver;

  // Weighted average: retained at old rate, rolled-over + new deficit at market rate
  const weightedAvgRate =
    (retained * prevWeightedAvgRate + (rolledOver + newDeficit) * newIssuanceRate) /
    currentDebtStock;

  // Clamp to non-negative (rates cannot be negative in this model)
  return Math.max(0, weightedAvgRate);
}

// ============================================================
// 4b. Endogenous Debt Maturity / Rollover Rate (Phase 8 Fix 3)
// ============================================================

/**
 * Compute the effective debt rollover rate based on endogenous maturity dynamics.
 *
 * The US Treasury actively manages its debt maturity profile:
 *   - When long-term yields are low: issues more 10-30Y bonds → WAM lengthens
 *   - When long-term yields are high: shifts to bills/short notes → WAM shortens
 *   - Under market stress: issues whatever sells → WAM shortens further
 *
 * Real-world calibration:
 *   US Treasury WAM: ~6.0 years (2024), range 4.5-6.5 years historically
 *   Minimum WAM: ~2.5 years (extreme stress, heavy bill issuance)
 *   Maximum WAM: ~8.0 years (very favorable conditions, heavy long-bond issuance)
 *
 * The effective rollover rate = 1 / WAM, determining what fraction of outstanding
 * debt matures and must be refinanced at current market rates each year.
 *
 * Source: Treasury quarterly refunding statements; CBO "Federal Debt and the
 *         Statutory Limit"; Greenwood, Hanson & Stein (2015) "A Comparative-
 *         Advantage Approach to Government Debt Maturity."
 *
 * @param fiscalRiskPremium - Current fiscal risk premium from sigmoid (0 to maxPremium)
 * @param maxFiscalRiskPremium - Maximum fiscal risk premium (config, default 0.04)
 * @param tenYearYield - Current 10Y Treasury yield
 * @param policyRate - Current Fed policy rate
 * @param baseWAMYears - Baseline weighted average maturity in years (default 6.0)
 * @param minWAMYears - Minimum WAM under extreme stress (default 2.5)
 * @param maxWAMYears - Maximum WAM under favorable conditions (default 8.0)
 * @param maturityStressSensitivity - How aggressively stress shortens maturity (default 1.0)
 * @returns Effective rollover rate and weighted average maturity
 */
export function computeEndogenousRolloverRate(
  fiscalRiskPremium: number,
  maxFiscalRiskPremium: number,
  tenYearYield: number,
  policyRate: number,
  baseWAMYears: number = 6.0,
  minWAMYears: number = 2.5,
  maxWAMYears: number = 8.0,
  maturityStressSensitivity: number = 1.0,
): {
  effectiveRolloverRate: number;
  weightedAverageMaturity: number;
} {
  // Fiscal stress: normalized 0-1 from the fiscal risk premium sigmoid
  const fiscalRiskIntensity = maxFiscalRiskPremium > 0
    ? Math.min(1, fiscalRiskPremium / maxFiscalRiskPremium)
    : 0;

  // Yield spread pressure: when 10Y is much higher than policy rate,
  // long-term debt is expensive relative to short-term → Treasury avoids long end.
  // Normalized: 500bp spread = full pressure.
  const yieldSpread = Math.max(0, tenYearYield - policyRate);
  const spreadPressure = Math.min(1, yieldSpread / 0.05);

  // Combined maturity stress: weighted blend of fiscal risk and yield spread
  // Both contribute — fiscal risk signals market perception, yield spread signals cost.
  const rawStress = fiscalRiskIntensity * 0.6 + spreadPressure * 0.4;
  const maturityStress = Math.min(1, rawStress * maturityStressSensitivity);

  // WAM: shortens under stress, stays at baseline or slightly lengthens when calm
  const weightedAverageMaturity = maturityStress > 0
    ? baseWAMYears - maturityStress * (baseWAMYears - minWAMYears)
    : Math.min(maxWAMYears, baseWAMYears * 1.05); // slight lengthening in good times

  // Rollover rate = inverse of WAM (floor WAM at 0.5 to avoid division issues)
  const effectiveRolloverRate = 1.0 / Math.max(0.5, weightedAverageMaturity);

  return { effectiveRolloverRate, weightedAverageMaturity };
}

// ============================================================
// 5. Baseline Fiscal State
// ============================================================

/**
 * Returns the initial FiscalState for simulation year 0.
 *
 * Uses calibrated constants from FRED (federal debt, 10Y yield) and
 * BEA/CBO (revenue/GDP ratio) to establish a consistent starting point.
 *
 * Source: FRED GFDEBTN (federal debt), FRED DGS10 (10Y yield),
 *         CBO Historical Budget Data (revenue/GDP).
 */
export function getBaselineFiscalState(): FiscalState {
  const bookedRevenueT1 = BASELINE_GDP_NOMINAL_2025 * FEDERAL_REVENUE_GDP_RATIO;

  return {
    federalDebtStock: INITIAL_FEDERAL_DEBT,
    debtGDPRatio: INITIAL_FEDERAL_DEBT / BASELINE_GDP_NOMINAL_2025,
    interestExpense: INITIAL_FEDERAL_DEBT * INITIAL_WEIGHTED_AVG_DEBT_RATE,
    debtServiceRevenueRatio: 0, // Computed properly in the first simulation year
    weightedAverageDebtRate: INITIAL_WEIGHTED_AVG_DEBT_RATE,
    bookedRevenueT1,
    revenueGDPRatio: FEDERAL_REVENUE_GDP_RATIO,
    laborTaxRevenue: 0, // Decomposed in the first simulation year
    corporateTaxRevenue: 0, // Decomposed in the first simulation year
    primaryDeficit: 0, // Computed in the first simulation year
    totalDeficit: 0, // Computed in the first simulation year
    stabilizerTransfers: 0, // Stage 5: no incremental unemployment at baseline
    // Phase 8a: Fiscal consolidation baseline (no consolidation at t=0)
    consolidationIntensity: 0,
    discretionaryMultiplier: 1.0,
    obligationMultiplier: 1.0,
    revenueMultiplier: 1.0,
    effectiveCOLAFactor: 1.0,
    // Phase 8 Fix 3: Endogenous debt maturity baseline
    weightedAverageMaturity: 6.0,
    effectiveRolloverRate: 0.17, // 1/6 ≈ 0.167
  };
}

// ============================================================
// 6. Fiscal Consolidation (Phase 8a)
// ============================================================

/**
 * Compute fiscal adjustment multipliers based on debt sustainability.
 *
 * When debt/GDP exceeds the profile's threshold, spending is constrained
 * and effective tax rates increase. This models the political economy
 * reality that unsustainable debt forces fiscal correction — the FORM
 * of that correction (cuts vs taxes vs monetary accommodation) depends
 * on the chosen FiscalResponseProfile.
 *
 * Uses PREVIOUS year's debt/GDP (lagged by profile.consolidationLag years)
 * because political processes take time to respond to fiscal data.
 *
 * Source: IMF Fiscal Monitor (2023) — consolidation episodes dataset;
 *         Alesina & Ardagna (2010) "Large Changes in Fiscal Policy";
 *         CBO "Options for Reducing the Deficit" (2024).
 *
 * @param debtGDPRatio - Previous year's debt/GDP ratio (or lagged value)
 * @param profile - Active fiscal response profile
 * @returns Spending and revenue multipliers
 */
export function computeFiscalConsolidation(
  debtGDPRatio: number,
  profile: FiscalResponseProfile,
): {
  discretionaryMultiplier: number;
  obligationMultiplier: number;
  revenueMultiplier: number;
  consolidationIntensity: number;
} {
  if (debtGDPRatio <= profile.consolidationThreshold) {
    return {
      discretionaryMultiplier: 1.0,
      obligationMultiplier: 1.0,
      revenueMultiplier: 1.0,
      consolidationIntensity: 0,
    };
  }

  const range = profile.consolidationMaxThreshold - profile.consolidationThreshold;
  const intensity = range > 0
    ? Math.min(1, (debtGDPRatio - profile.consolidationThreshold) / range)
    : 1.0;

  return {
    discretionaryMultiplier: 1.0 - intensity * profile.maxDiscretionaryCut,
    obligationMultiplier: 1.0 - intensity * profile.maxObligationCut,
    revenueMultiplier: 1.0 + intensity * profile.maxRevenueIncrease,
    consolidationIntensity: intensity,
  };
}
