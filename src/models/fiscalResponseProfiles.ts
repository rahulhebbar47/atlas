/**
 * ATLAS Fiscal Response Profiles (Phase 8a → Phase 8 Fix 4)
 *
 * Phase 8 Fix 4: Split into independent FiscalPolicyProfile (what Congress does)
 * and FederalReserveProfile (what the Fed does). Users select one of each.
 *
 * Fiscal Policy Dimensions:
 *   1. Spending vs Revenue — who bears the adjustment cost?
 *   2. Safety net protection — are transfers protected from inflation?
 *   3. Reaction timing — how much debt before the system responds?
 *   4. Adjustment speed — how quickly does correction happen?
 *
 * Federal Reserve Dimensions:
 *   1. Inflation vs Employment response — dual-mandate Taylor Rule coefficients
 *   2. Bond market operations — QE, yield-responsive monetization, financial repression
 *
 * FiscalResponseProfile = FiscalPolicyProfile + FederalReserveProfile (combined type
 * used by the simulation engine, constructed via resolveCombinedProfile()).
 *
 * All functions are PURE — no side effects, no state mutation.
 */

// ============================================================
// Phase 8 Fix 4: Fiscal Policy Profile (what Congress does)
// ============================================================

export interface FiscalPolicyProfile {
  name: string;
  description: string;

  // Spending vs Revenue
  /** Max fractional cut to discretionary (revenue-sensitive) G. Range: 0-0.50. */
  maxDiscretionaryCut: number;
  /** Max fractional cut to mandatory (obligation) G. Range: 0-0.20. */
  maxObligationCut: number;
  /** Max fractional increase in effective tax rates. Range: 0-0.30. */
  maxRevenueIncrease: number;

  // Safety Net Protection
  /** COLA dampening rate: 0 = full COLA, 0.5 = COLA grows at 50% of inflation. Range: 0-1.0. */
  colaDampeningRate: number;
  /** CIF level above which dampening kicks in. */
  colaDampeningThreshold: number;
  /** CIF level at which dampening is fully active. */
  colaDampeningMaxCIF: number;

  // Reaction Timing
  /** Debt/GDP ratio that triggers fiscal response. Range: 0.50-10.0. */
  consolidationThreshold: number;
  /** E-8b item 4 (R-B): true = markets price this profile's announced consolidation (the
   *  adjustmentExpectation ramps, compressing premia below the Laubach evidence slope). False/absent
   *  = the observed-regime default — the evidence slope alone carries the pricing. */
  marketPricesConsolidation?: boolean;
  /** Debt/GDP at full response intensity. Range: threshold+0.5 to 10.0. */
  consolidationMaxThreshold: number;

  // Adjustment Speed
  /** Years of political delay before response. Range: 0-5. */
  consolidationLag: number;
}

// ============================================================
// Phase 8 Fix 4: Federal Reserve Profile (what the Fed does)
// ============================================================

export interface FederalReserveProfile {
  name: string;
  description: string;

  // Dual-mandate Taylor Rule reaction function
  /** Taylor Rule inflation coefficient α. Higher = more hawkish on inflation. Range: 0.5-2.5. */
  taylorInflationCoeff: number;
  /** Taylor Rule output gap coefficient β_output. Range: 0-1.0. */
  taylorOutputGapCoeff: number;
  /** Taylor Rule employment gap coefficient β_employment. Higher = more responsive to unemployment. Range: 0-1.5. */
  taylorEmploymentGapCoeff: number;

  // Bond market operations
  /** Fraction of deficit monetized at ZLB (QE). Range: 0-0.80. */
  qeMonetizationRate: number;
  /** Cap on monetization under fiscal stress (financial repression). Range: 0-1.0. */
  maxFinancialRepressionRate: number;

  // Yield response
  /** 10Y yield above which central bank increases purchases. Range: 0.04-0.15. */
  yieldResponseThreshold: number;
  /** Maximum monetization rate under yield stress. Range: 0.40-0.90. */
  maxYieldResponseRate: number;
}

// ============================================================
// Combined Profile (used by simulation engine)
// ============================================================

/**
 * The combined fiscal + monetary profile used by the simulation engine.
 * Constructed from a FiscalPolicyProfile + FederalReserveProfile
 * via resolveCombinedProfile().
 *
 * Note: Both sub-interfaces have `name` and `description` — the combined
 * profile overrides these with a composite name/description.
 */
export interface FiscalResponseProfile extends FiscalPolicyProfile, FederalReserveProfile {
  // All fields from both profiles (name/description overlap resolved by TypeScript)
}

// ============================================================
// Fiscal Policy Presets (5 options)
// ============================================================

/**
 * Five fiscal policy presets spanning the spectrum of historical
 * government responses to unsustainable debt.
 *
 * Sources:
 *   - Alesina & Ardagna (2010) "Large Changes in Fiscal Policy"
 *   - IMF Fiscal Monitor (2023) — consolidation thresholds
 *   - CBO Long-Term Budget Outlook (2024) — US fiscal trajectory
 */
export const FISCAL_POLICY_PRESETS: Record<string, FiscalPolicyProfile> = {
  austerity: {
    name: 'Austerity',
    description: 'Government cuts spending aggressively with minimal tax increases. '
      + 'Analog: UK 2010-2015, IMF structural adjustment.',
    maxDiscretionaryCut: 0.25,
    maxObligationCut: 0.08,
    maxRevenueIncrease: 0.03,
    colaDampeningRate: 0.35,
    colaDampeningThreshold: 1.5,
    colaDampeningMaxCIF: 4.0,
    consolidationThreshold: 1.2,
    consolidationMaxThreshold: 2.5,
    consolidationLag: 1,
  },

  tax_the_winners: {
    name: 'Tax the Winners',
    description: 'Tax increases on AI beneficiaries fund maintained spending and safety net. '
      + 'Analog: Post-WWII US (91% top rate), Nordic fiscal model.',
    maxDiscretionaryCut: 0.05,
    maxObligationCut: 0.02,
    maxRevenueIncrease: 0.18,
    colaDampeningRate: 0.0,
    colaDampeningThreshold: 5.0,
    colaDampeningMaxCIF: 10.0,
    consolidationThreshold: 1.5,
    consolidationMaxThreshold: 3.0,
    consolidationLag: 2,
  },

  observed_political_economy: {
    name: 'Observed Political Economy (R-C default)',
    description: 'E-8b (ratified, R-C): the DEFAULT — forward-reasoned from the observed record. '
      + 'Long recognition lag (AI displacement is gradual and deniable; slower political trigger '
      + 'than a financial crash), transfer-heavy deficit-financed expansion when it bites (the '
      + 'COVID template — carried by the existing automatic stabilizers and scenario policy), '
      + 'consolidation ABSENT until bond-market duress, monetization pressure arriving first. '
      + 'Baseline debt RISES, CBO-like (R-A); sustainability comes from r ≈ g with Laubach-sized '
      + 'premia, not forced adjustment. STATUTE GUARD: maxObligationCut = 0.',
    maxDiscretionaryCut: 0.10,
    maxObligationCut: 0,           // statute guard (carried from E-8, binding)
    maxRevenueIncrease: 0.04,
    colaDampeningRate: 0.10,
    colaDampeningThreshold: 2.0,
    colaDampeningMaxCIF: 4.0,
    consolidationThreshold: 2.2,   // duress-only (R-C: no consolidation until the bond market forces it)
    consolidationMaxThreshold: 3.0,
    consolidationLag: 4,           // long recognition lag (R-C)
    marketPricesConsolidation: false,  // the Laubach evidence slope IS the observed-regime pricing
  },

  gradual_stabilization: {
    name: 'Gradual Stabilization (E-8 baseline)',
    description: 'E-8 (ratified): the OBSERVED-REGIME default — phased primary-balance adjustment '
      + 'at the 1990s pace (~0.55pp of GDP/yr; 1992-1998: 4.5pp over six years) via discretionary '
      + 'and revenue levers ONLY. STATUTE GUARD: maxObligationCut = 0 — the Stage-5b/6b '
      + 'statute-indexed transfer stocks are untouchable in the baseline; COLA dampening stays a '
      + 'visible, mild lever. Dialing consolidationThreshold to 999 = the never-consolidates world '
      + '(the E-7 conditional-instability finding as a scenario).',
    maxDiscretionaryCut: 0.12,
    maxObligationCut: 0,          // statute guard (E-8 §2, binding)
    maxRevenueIncrease: 0.05,
    colaDampeningRate: 0.15,
    colaDampeningThreshold: 2.0,
    colaDampeningMaxCIF: 4.0,
    consolidationThreshold: 1.1,  // between the 2011 episode (~0.95) and the current trajectory
    consolidationMaxThreshold: 2.0,  // the threshold→max intensity ramp IS the pressure-proportional pace (E-8b relocation)
    consolidationLag: 1,
    marketPricesConsolidation: true,  // E-8b item 4: an announced consolidation regime — markets price it
  },

  balanced_reduction: {
    name: 'Balanced Deficit Reduction',
    description: 'Moderate spending cuts and tax increases — the centrist compromise. '
      + 'Analog: Simpson-Bowles, bipartisan deficit deals.',
    maxDiscretionaryCut: 0.15,
    maxObligationCut: 0.05,
    maxRevenueIncrease: 0.08,
    colaDampeningRate: 0.20,
    colaDampeningThreshold: 2.0,
    colaDampeningMaxCIF: 5.0,
    consolidationThreshold: 1.5,
    consolidationMaxThreshold: 3.0,
    consolidationLag: 1,
  },

  gridlock: {
    name: 'Gridlock',
    description: 'Political paralysis prevents meaningful fiscal adjustment. '
      + 'Analog: US debt ceiling crises, Italian chronic debt.',
    maxDiscretionaryCut: 0.05,
    maxObligationCut: 0.01,
    maxRevenueIncrease: 0.03,
    colaDampeningRate: 0.0,
    colaDampeningThreshold: 5.0,
    colaDampeningMaxCIF: 10.0,
    consolidationThreshold: 2.5,
    consolidationMaxThreshold: 5.0,
    consolidationLag: 3,
  },

  no_fiscal_response: {
    name: 'No Fiscal Response',
    description: 'No spending cuts, no tax increases. Deficits run unchecked. '
      + 'Stress test for monetary-only stabilization.',
    maxDiscretionaryCut: 0.0,
    maxObligationCut: 0.0,
    maxRevenueIncrease: 0.0,
    colaDampeningRate: 0.0,
    colaDampeningThreshold: 999.0,
    colaDampeningMaxCIF: 999.0,
    consolidationThreshold: 999.0,
    consolidationMaxThreshold: 999.0,
    consolidationLag: 0,
  },
};

// ============================================================
// Federal Reserve Presets (4 options)
// ============================================================

/**
 * Four Federal Reserve presets spanning the dual-mandate spectrum.
 *
 * The Taylor Rule coefficients (α, β_output, β_employment) determine
 * how the Fed weights inflation vs. employment in its reaction function.
 *
 * Sources:
 *   - Taylor (1993) — original Taylor Rule
 *   - Yellen (2012) "The Economic Outlook and Monetary Policy" — balanced approach
 *   - Evans Rule (2012) — employment thresholds
 *   - Reinhart & Sbrancia (2015) — financial repression
 */
export const FEDERAL_RESERVE_PRESETS: Record<string, FederalReserveProfile> = {
  price_stability: {
    name: 'Price Stability First',
    description: 'Hawkish — prioritizes 2% inflation target over employment. '
      + 'Accepts recession to maintain price stability. Analog: Volcker Fed.',
    taylorInflationCoeff: 2.0,
    taylorOutputGapCoeff: 0.5,
    taylorEmploymentGapCoeff: 0.0,
    qeMonetizationRate: 0.10,
    maxFinancialRepressionRate: 0.30,
    yieldResponseThreshold: 0.10,
    maxYieldResponseRate: 0.45,
  },

  balanced_mandate: {
    name: 'Balanced Mandate',
    description: 'Standard dual mandate — responds to both inflation and employment '
      + 'pressures equally. Analog: standard Taylor Rule.',
    taylorInflationCoeff: 1.5,
    taylorOutputGapCoeff: 0.5,
    taylorEmploymentGapCoeff: 0.5,
    qeMonetizationRate: 0.15,
    maxFinancialRepressionRate: 0.50,
    yieldResponseThreshold: 0.08,
    maxYieldResponseRate: 0.65,
  },

  employment_focused: {
    name: 'Employment Focused',
    description: 'Accommodative — prioritizes maximum employment, tolerates above-target '
      + 'inflation during transitions. Analog: Yellen/Evans Rule.',
    taylorInflationCoeff: 1.0,
    taylorOutputGapCoeff: 0.3,
    taylorEmploymentGapCoeff: 0.8,
    qeMonetizationRate: 0.25,
    maxFinancialRepressionRate: 0.60,
    yieldResponseThreshold: 0.07,
    maxYieldResponseRate: 0.70,
  },

  maximum_accommodation: {
    name: 'Maximum Accommodation',
    description: 'Strongly employment-focused — inflation is secondary to preventing mass '
      + 'hardship. Aggressive bond purchases. Analog: BOJ Abenomics, emergency Fed.',
    taylorInflationCoeff: 0.8,
    taylorOutputGapCoeff: 0.2,
    taylorEmploymentGapCoeff: 1.2,
    qeMonetizationRate: 0.40,
    maxFinancialRepressionRate: 0.80,
    yieldResponseThreshold: 0.05,
    maxYieldResponseRate: 0.85,
  },
};

// ============================================================
// Defaults
// ============================================================

/** Default fiscal policy preset name. */
// E-8b (ratified, R-A/R-C): the baseline fiscal regime is the OBSERVED one — no consolidation
// until duress; debt rises CBO-like; r ≈ g + evidence premia carry sustainability.
export const DEFAULT_FISCAL_POLICY_PRESET = 'observed_political_economy';

/** Default Federal Reserve preset name. */
export const DEFAULT_FEDERAL_RESERVE_PRESET = 'balanced_mandate';

// ============================================================
// Combined Profile Resolution
// ============================================================

/**
 * Resolve a combined FiscalResponseProfile from independent fiscal and Fed
 * preset names, with optional custom overrides for each.
 *
 * @param fiscalPresetName - Fiscal policy preset key (e.g., 'balanced_reduction')
 * @param fedPresetName - Federal Reserve preset key (e.g., 'balanced_mandate')
 * @param fiscalCustom - Optional partial overrides for fiscal fields
 * @param fedCustom - Optional partial overrides for Fed fields
 * @returns Fully resolved FiscalResponseProfile (combined type)
 */
export function resolveCombinedProfile(
  fiscalPresetName: string,
  fedPresetName: string,
  fiscalCustom?: Partial<FiscalPolicyProfile>,
  fedCustom?: Partial<FederalReserveProfile>,
): FiscalResponseProfile {
  const fiscal = {
    ...(FISCAL_POLICY_PRESETS[fiscalPresetName] ?? FISCAL_POLICY_PRESETS[DEFAULT_FISCAL_POLICY_PRESET]!),
    ...fiscalCustom,
  };
  const fed = {
    ...(FEDERAL_RESERVE_PRESETS[fedPresetName] ?? FEDERAL_RESERVE_PRESETS[DEFAULT_FEDERAL_RESERVE_PRESET]!),
    ...fedCustom,
  };
  return {
    ...fiscal,
    ...fed,
    name: `${fiscal.name} + ${fed.name}`,
    description: `Fiscal: ${fiscal.description} Fed: ${fed.description}`,
  };
}

// ============================================================
// DEPRECATED Phase 8 Fix 4: Old combined presets and resolution.
// Replaced by independent FISCAL_POLICY_PRESETS + FEDERAL_RESERVE_PRESETS.
// ============================================================

// /** Default fiscal response profile preset name. */
// export const DEFAULT_FISCAL_RESPONSE_PROFILE = 'balanced_pragmatism';

// export const FISCAL_RESPONSE_PRESETS: Record<string, FiscalResponseProfile> = {
//   austerity_first: { ... },
//   tax_the_winners: { ... },
//   fed_backstop: { ... },
//   gridlock: { ... },
//   balanced_pragmatism: { ... },
//   no_adjustment: { ... },
// };

// export function resolveFiscalProfile(
//   profileName: string = DEFAULT_FISCAL_RESPONSE_PROFILE,
//   custom?: Partial<FiscalResponseProfile>,
// ): FiscalResponseProfile { ... }
