/**
 * ATLAS Government Data Loader
 *
 * Central data loader that reads pre-fetched government data files (BEA, BLS, FRED)
 * and exports a single `govData` object consumed by constants.ts.
 *
 * Data flow: Government API → JSON file → loadGovernmentData.ts → constants.ts → model
 *
 * Uses static imports for build-time bundling (consistent with existing state data pattern).
 * Falls back to hardcoded values when JSON files are missing or malformed.
 */

// ============================================================
// Static imports — BEA (may be fallback data)
// ============================================================
import beaGDPComponents from '@/data/bea/gdp-components.json';
import beaPersonalIncome from '@/data/bea/personal-income.json';
import beaGovernmentReceipts from '@/data/bea/government-receipts.json';

// ============================================================
// Static imports — BLS (real data)
// ============================================================
import blsTotalEmployment from '@/data/bls/total-employment.json';
import blsUnemploymentRate from '@/data/bls/unemployment-rate.json';
import blsLaborForce from '@/data/bls/labor-force.json';
import blsLaborMarket from '@/data/bls/labor-market.json';
import blsCPISectorIndices from '@/data/bls/cpi-sector-indices.json';
import blsCPISectorWeights from '@/data/bls/cpi-sector-weights.json';

// ============================================================
// Static imports — FRED (real data)
// ============================================================
import fredM2Velocity from '@/data/fred/m2-velocity.json';
import fredNAIRU from '@/data/fred/nairu.json';
import fredFedFundsRate from '@/data/fred/fed-funds-rate.json';
import fredCPSEmployment from '@/data/fred/cps-employment.json';

// ============================================================
// Static imports — FRED Phase 5i: Housing & Credit
// ============================================================
import fredMortgageDelinquency from '@/data/fred/mortgage-delinquency.json';
import fredMortgageRate30yr from '@/data/fred/mortgage-rate-30yr.json';
import fredCaseShiller from '@/data/fred/case-shiller-national.json';
import fredHousingStarts from '@/data/fred/housing-starts.json';
import fredCPIShelter from '@/data/fred/cpi-shelter.json';
import fredSLOOSHousehold from '@/data/fred/sloos-household-tightening.json';
import fredSLOOSBusiness from '@/data/fred/sloos-business-tightening.json';

// ============================================================
// Static imports — FRED Phase 7: Fiscal-Monetary
//
// FS-6f FINDING (found BY the ruled fallback hardening, first run): the previous
// import.meta.glob patterns referenced filenames that do not exist (e.g.
// 'treasury-yield-10y.json' vs the committed 'treasury-10yr.json'), and the extractors
// read keys the committed files never had (e.g. 'federalDebtTotal' vs the committed
// 'debtMillions') — so the ENTIRE fiscal-monetary family had been riding the silent
// fallback estimates while the observed FRED data sat committed and unread (the
// cited-dead/uncited-live genus at the data layer; the fetch script and this loader were
// never reconciled). Static imports of the ACTUAL committed files replace the globs:
// a missing file now fails the build — the doctrine (observed data over estimates).
// ============================================================
import fredFederalDebt from '@/data/fred/federal-debt.json';
import fredTreasury10Y from '@/data/fred/treasury-10yr.json';
import fredDeficitGDP from '@/data/fred/federal-deficit-gdp.json';
import fredBBBSpread from '@/data/fred/bbb-corporate-spread.json';
import fredInterestOutlays from '@/data/fred/federal-interest-outlays.json';
import fredCorporateProfits from '@/data/fred/corporate-profits.json';
import fredCorpTaxReceipts from '@/data/fred/corporate-tax-receipts.json';
import fredSP500 from '@/data/fred/sp500.json';

// DEPRECATED (FS-6f): the glob mechanism and its unwrapper — retired with the optionality
// premise (every file in this family is committed; missing data is a build error, not a
// runtime estimate). Old code:
// const fredDebtModules = import.meta.glob('@/data/fred/federal-debt.json', { eager: true });
// ... (seven more glob declarations with mismatched filenames)
// function getGlobModule(modules: Record<string, unknown>): Record<string, unknown> | null { ... }

// ============================================================
// Type for the CPI sector inflation data
// ============================================================
interface CPISectorInflationEntry {
  avgAnnualInflation10yr: number;
  latestAnnualInflation: number;
}

// ============================================================
// Type for the exported government data
// ============================================================
export interface GovernmentData {
  // BEA
  gdpNominal: number;
  consumptionRatio: number;
  investmentRatio: number;
  governmentRatio: number;
  netExportRatio: number;
  wageShare: number;
  assetShare: number;
  transferShare: number;
  // BLS
  totalEmployment: number;   // CES nonfarm payrolls (for cluster normalization)
  cpsEmployment: number;     // CPS household survey employment (for unemployment calc)
  laborForce: number;
  unemploymentRate: number;
  avgWeeklyHours: number;
  avgHourlyEarnings: number;
  baseInflationRate: number;
  cpiSectorWeights: Record<string, number>;
  cpiSectorInflation: Record<string, CPISectorInflationEntry>;
  // FRED
  m2Velocity: number;
  fredNairuRate: number;
  fedFundsRate: number;
  // Phase 5i: Housing & Credit (FRED)
  mortgageDelinquencyRate: number;    // FRED DRSFRMACBS
  mortgageRate30yr: number;           // FRED MORTGAGE30US (decimal, e.g. 0.068)
  caseShillerIndex: number;           // FRED CSUSHPINSA
  housingStarts: number;              // FRED HOUST (annual, absolute units)
  baselineShelterInflation: number;   // FRED CUSR0000SAH1 (YoY rate, decimal)
  // Tax decomposition (Phase 5-tax)
  effectiveIncomeTaxRate: number;      // personalCurrentTaxes / totalPersonalIncome
  effectivePayrollRate: number;        // socialInsuranceContributions / wageAndSalaryIncome
  effectiveCorporateTaxRate: number;   // corporateIncomeTaxes / corporateProfitsBeforeTax
  effectiveCapGainsRate: number;       // ~0.165 (CBO, no clean API source)
  corporateRetentionRate: number;      // undistributedProfits / corporateProfitsAfterTax
  baselineProfitGDPRatio: number;      // corporateProfitsBeforeTax / GDP
  // Phase 7: Fiscal-Monetary
  federalDebtTotal: number;           // FRED GFDEBTN — millions (e.g., 36_000_000 = $36T)
  treasuryYield10Y: number;           // FRED DGS10 — decimal (e.g., 0.043 = 4.3%)
  baselineDeficitGDPRatio: number;    // FRED FYFSGDA188S — positive decimal (e.g., 0.06 = 6%)
  bbbCorporateSpread: number;         // FRED BAMLC0A4CBBB — decimal (e.g., 0.015 = 150bp)
  federalInterestOutlays: number;     // FRED FYOINT — dollars
  corporateProfitsAfterTax: number;   // FRED CP — quarterly SAAR, dollars (converted from billions)
  federalCorpTaxReceipts: number;     // FRED FCTAX — dollars
  sp500Level: number;                 // FRED SP500 — index value
  mortgageSpread: number;             // DERIVED: mortgageRate30yr - treasuryYield10Y
  // Meta
  isFallback: {
    bea: boolean;
    beaGDP: boolean;
    beaIncome: boolean;
    bls: boolean;
    fred: boolean;
    fredFiscalMonetary: boolean;
  };
}

// ============================================================
// Extraction helpers
// ============================================================

/**
 * FS-6f (ruled): a data-extraction failure THROWS a developer-facing error instead of
 * silently returning a fallback estimate. Fallback-on-failure inverted the project's own
 * "data not found over estimates" doctrine: a future file-shape drift would have silently
 * shifted economic baselines (the 0.132-vs-derived-0.124 registry episode is the
 * demonstrated harm class). Every committed file parsed here exists and parses today,
 * so this hardening changes no live value; it converts future drift into a loud error.
 */
function failParse(field: string, source: string): never {
  throw new Error(
    `[ATLAS data] Failed to parse ${field} from ${source} — the committed file is missing, ` +
    `empty, or its shape changed. Re-run the relevant fetch script (scripts/fetch-*.ts) or fix ` +
    `the file. Do NOT substitute estimates for observed data.`,
  );
}

/**
 * Extract BLS total employment from CES data.
 * Finds Dec 2025 (or latest available month) and converts from thousands.
 */
function extractTotalEmployment(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 158_316_000;
  try {
    const data = blsTotalEmployment.data;
    if (!Array.isArray(data) || data.length === 0) return failParse('totalEmployment', 'src/data/bls/total-employment.json');

    // Find Dec 2025 first (most recent year-end)
    const dec2025 = data.find(
      (d: { year: string; period: string }) => d.year === '2025' && d.period === 'M12',
    );
    if (dec2025) {
      const val = parseInt(dec2025.value, 10);
      if (!isNaN(val) && val > 0) return val * 1000;
    }

    // Fall back to most recent data point (data is sorted newest first)
    const latest = data[0];
    if (latest) {
      const val = parseInt(latest.value, 10);
      if (!isNaN(val) && val > 0) return val * 1000;
    }

    return failParse('totalEmployment', 'src/data/bls/total-employment.json');
  } catch {
    return failParse('totalEmployment', 'src/data/bls/total-employment.json');
  }
}

/**
 * Extract CPS (household survey) employment level from FRED data.
 * This is DIFFERENT from CES nonfarm payrolls — CPS includes self-employed,
 * agricultural, private household workers. Used for unemployment calculations.
 */
function extractCPSEmployment(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 163_949_000; // Derived from LF × (1 - UE_rate): 171495 × 0.956
  try {
    const val = (fredCPSEmployment as Record<string, unknown>).cpsEmploymentAbsolute;
    if (typeof val === 'number' && val > 100_000_000) return val;
    const thousands = (fredCPSEmployment as Record<string, unknown>).cpsEmployment;
    if (typeof thousands === 'number' && thousands > 100_000) return thousands * 1000;
    return failParse('cpsEmployment', 'src/data/fred/cps-employment.json');
  } catch {
    return failParse('cpsEmployment', 'src/data/fred/cps-employment.json');
  }
}

/**
 * Extract BLS labor force level from CPS data (in thousands → absolute).
 */
function extractLaborForce(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 168_000_000;
  try {
    const monthly = blsLaborForce.latestMonthly;
    if (monthly && typeof monthly.value === 'number' && monthly.value > 0) {
      return monthly.value * 1000;
    }
    return failParse('laborForce', 'src/data/bls/labor-force.json');
  } catch {
    return failParse('laborForce', 'src/data/bls/labor-force.json');
  }
}

/**
 * Extract BLS unemployment rate from CPS data (percent → decimal).
 */
function extractUnemploymentRate(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 0.041;
  try {
    const monthly = blsUnemploymentRate.latestMonthly;
    if (monthly && typeof monthly.value === 'number' && monthly.value > 0) {
      return monthly.value / 100;
    }
    return failParse('unemploymentRate', 'src/data/bls/unemployment-rate.json');
  } catch {
    return failParse('unemploymentRate', 'src/data/bls/unemployment-rate.json');
  }
}

/**
 * Extract BLS average weekly hours and hourly earnings.
 */
function extractLaborMarket(): { avgWeeklyHours: number; avgHourlyEarnings: number } {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK_HOURS = 34.3;  const FALLBACK_EARNINGS = 35.50;
  try {
    const hours = parseFloat(blsLaborMarket.avgWeeklyHours?.latestMonthly);
    const earnings = parseFloat(blsLaborMarket.avgHourlyEarnings?.latestMonthly);
    return {
      avgWeeklyHours: !isNaN(hours) && hours > 0 ? hours : failParse('avgWeeklyHours', 'src/data/bls/labor-market.json'),
      avgHourlyEarnings: !isNaN(earnings) && earnings > 0 ? earnings : failParse('avgHourlyEarnings', 'src/data/bls/labor-market.json'),
    };
  } catch {
    return failParse('labor market (hours/earnings)', 'src/data/bls/labor-market.json');
  }
}

/**
 * Extract base inflation rate from CPI-U All Items sector.
 */
function extractBaseInflationRate(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 0.025;
  try {
    const allItems = blsCPISectorIndices.sectors?.all_items;
    if (allItems && typeof allItems.latestAnnualInflation === 'number') {
      return allItems.latestAnnualInflation;
    }
    return failParse('baseInflationRate (CPI-U all items)', 'src/data/bls/cpi-sector-indices.json');
  } catch {
    return failParse('baseInflationRate (CPI-U all items)', 'src/data/bls/cpi-sector-indices.json');
  }
}

/**
 * Extract CPI sector weights from BLS relative importance data.
 */
function extractCPISectorWeights(): Record<string, number> {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK: Record<string, number> = {
  // food_home: 0.079, food_away: 0.056, shelter: 0.370, medical_care: 0.084,
  // transportation: 0.151, education_comm: 0.062, info_technology: 0.013,
  // apparel: 0.025, recreation: 0.053, other_services: 0.032, energy: 0.062,
  // other_goods: 0.013,
  // };
  try {
    const weights = blsCPISectorWeights.weights;
    if (weights && typeof weights === 'object' && Object.keys(weights).length > 0) {
      return weights as Record<string, number>;
    }
    return failParse('cpiSectorWeights', 'src/data/bls/cpi-sector-weights.json');
  } catch {
    return failParse('cpiSectorWeights', 'src/data/bls/cpi-sector-weights.json');
  }
}

/**
 * Extract per-sector CPI inflation data.
 */
function extractCPISectorInflation(): Record<string, CPISectorInflationEntry> {
  const result: Record<string, CPISectorInflationEntry> = {};
  try {
    const sectors = blsCPISectorIndices.sectors;
    if (!sectors || typeof sectors !== 'object') return result;
    for (const [key, sector] of Object.entries(sectors)) {
      if (key === 'all_items') continue;
      const s = sector as { avgAnnualInflation10yr?: number; latestAnnualInflation?: number };
      if (typeof s.avgAnnualInflation10yr === 'number' && typeof s.latestAnnualInflation === 'number') {
        result[key] = {
          avgAnnualInflation10yr: s.avgAnnualInflation10yr,
          latestAnnualInflation: s.latestAnnualInflation,
        };
      }
    }
  } catch {
    // Return empty on error
  }
  return result;
}

/**
 * Extract BEA GDP components with ratio normalization.
 */
function extractGDPComponents(): {
  gdpNominal: number;
  consumptionRatio: number;
  investmentRatio: number;
  governmentRatio: number;
  netExportRatio: number;
  isFallback: boolean;
} {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = { gdpNominal: 29_000_000_000_000, consumptionRatio: 0.681,
  //   investmentRatio: 0.175, governmentRatio: 0.18, netExportRatio: -0.03, isFallback: true };
  try {
    const bea = beaGDPComponents;
    if (!bea || typeof bea.gdpNominal !== 'number') return failParse('gdpNominal', 'src/data/bea/gdp-components.json');

    let { consumptionRatio, investmentRatio, governmentRatio, netExportRatio } = bea;
    if (typeof consumptionRatio !== 'number') consumptionRatio = failParse('consumptionRatio', 'src/data/bea/gdp-components.json');
    if (typeof investmentRatio !== 'number') investmentRatio = failParse('investmentRatio', 'src/data/bea/gdp-components.json');
    if (typeof governmentRatio !== 'number') governmentRatio = failParse('governmentRatio', 'src/data/bea/gdp-components.json');
    if (typeof netExportRatio !== 'number') netExportRatio = failParse('netExportRatio', 'src/data/bea/gdp-components.json');

    // Normalize ratios to sum to 1.0 (safety net for BEA rounding)
    const ratioSum = consumptionRatio + investmentRatio + governmentRatio + netExportRatio;
    if (Math.abs(ratioSum - 1.0) > 0.001) {
      if (Math.abs(ratioSum - 1.0) > 0.02) {
        console.warn(`⚠️ GDP ratios sum to ${ratioSum.toFixed(4)}, normalizing to 1.0`);
      }
      consumptionRatio /= ratioSum;
      investmentRatio /= ratioSum;
      governmentRatio /= ratioSum;
      netExportRatio /= ratioSum;
    }

    return {
      gdpNominal: bea.gdpNominal,
      consumptionRatio,
      investmentRatio,
      governmentRatio,
      netExportRatio,
      isFallback: 'isFallback' in bea && (bea as Record<string, unknown>).isFallback === true,
    };
  } catch {
    return failParse('GDP components', 'src/data/bea/gdp-components.json');
  }
}

/**
 * Extract BEA personal income shares with normalization.
 */
function extractIncomeShares(): {
  wageShare: number;
  assetShare: number;
  transferShare: number;
  isFallback: boolean;
} {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = { wageShare: 0.60, assetShare: 0.20, transferShare: 0.20, isFallback: true };
  try {
    const pi = beaPersonalIncome;
    if (!pi) return failParse('personal income shares', 'src/data/bea/personal-income.json');

    let wageShare = typeof pi.wageShare === 'number' ? pi.wageShare : failParse('wageShare', 'src/data/bea/personal-income.json');
    let assetShare = typeof pi.assetShare === 'number' ? pi.assetShare : failParse('assetShare', 'src/data/bea/personal-income.json');
    let transferShare = typeof pi.transferShare === 'number' ? pi.transferShare : failParse('transferShare', 'src/data/bea/personal-income.json');

    // Normalize shares to sum to 1.0
    const shareSum = wageShare + assetShare + transferShare;
    if (Math.abs(shareSum - 1.0) > 0.001) {
      console.warn(`⚠️ Income shares sum to ${shareSum.toFixed(4)}, normalizing to 1.0`);
      wageShare /= shareSum;
      assetShare /= shareSum;
      transferShare /= shareSum;
    }

    return {
      wageShare,
      assetShare,
      transferShare,
      isFallback: 'isFallback' in pi && (pi as Record<string, unknown>).isFallback === true,
    };
  } catch {
    return failParse('income shares', 'src/data/bea/personal-income.json');
  }
}

/**
 * Extract FRED M2 velocity.
 */
function extractM2Velocity(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 1.2;
  try {
    if (typeof fredM2Velocity.velocity === 'number' && fredM2Velocity.velocity > 0) {
      return fredM2Velocity.velocity;
    }
    return failParse('m2Velocity', 'src/data/fred/m2-velocity.json');
  } catch {
    return failParse('m2Velocity', 'src/data/fred/m2-velocity.json');
  }
}

/**
 * Extract FRED NAIRU (already decimal).
 */
function extractNairuRate(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 0.044;
  try {
    if (typeof fredNAIRU.naturalUnemploymentRate === 'number' && fredNAIRU.naturalUnemploymentRate > 0) {
      return fredNAIRU.naturalUnemploymentRate;
    }
    return failParse('fredNairuRate', 'src/data/fred/nairu.json');
  } catch {
    return failParse('fredNairuRate', 'src/data/fred/nairu.json');
  }
}

/**
 * Extract FRED federal funds rate (already decimal).
 */
function extractFedFundsRate(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 0.045;
  try {
    if (typeof fredFedFundsRate.federalFundsRate === 'number' && fredFedFundsRate.federalFundsRate > 0) {
      return fredFedFundsRate.federalFundsRate;
    }
    return failParse('fedFundsRate', 'src/data/fred/fed-funds-rate.json');
  } catch {
    return failParse('fedFundsRate', 'src/data/fred/fed-funds-rate.json');
  }
}

// ============================================================
// Phase 5i: Housing & Credit extraction helpers
// ============================================================

function extractMortgageDelinquencyRate(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 0.0178; // FRED DRSFRMACBS, 2025 average
  try {
    const data = fredMortgageDelinquency as Record<string, unknown>;
    const val = data.mortgageDelinquencyRate;
    if (typeof val === 'number' && val > 0 && val < 1) return val;
    return failParse('mortgageDelinquencyRate', 'src/data/fred/mortgage-delinquency.json');
  } catch { return failParse('mortgageDelinquencyRate', 'src/data/fred/mortgage-delinquency.json'); }
}

function extractMortgageRate30yr(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 0.0617; // FRED MORTGAGE30US, 2025-2026 annual avg
  try {
    const data = fredMortgageRate30yr as Record<string, unknown>;
    const val = data.annualAverage;
    if (typeof val === 'number' && val > 0 && val < 1) return val;
    // latestValue is already in decimal (0.0601)
    const latest = data.latestValue;
    if (typeof latest === 'number' && latest > 0 && latest < 1) return latest;
    return failParse('mortgageRate30yr', 'src/data/fred/mortgage-rate-30yr.json');
  } catch { return failParse('mortgageRate30yr', 'src/data/fred/mortgage-rate-30yr.json'); }
}

function extractCaseShillerIndex(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 328.15; // FRED CSUSHPINSA, Nov 2025
  try {
    const data = fredCaseShiller as Record<string, unknown>;
    const val = data.latestValue;
    if (typeof val === 'number' && val > 0) return val;
    return failParse('caseShillerIndex', 'src/data/fred/case-shiller-national.json');
  } catch { return failParse('caseShillerIndex', 'src/data/fred/case-shiller-national.json'); }
}

function extractHousingStarts(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 1_358_500; // FRED HOUST, 2025 annual avg (thousands SAAR → absolute)
  try {
    const data = fredHousingStarts as Record<string, unknown>;
    const val = data.annualAverageAbsolute;
    if (typeof val === 'number' && val > 0) return val;
    // Fallback to annualAverage (in thousands) × 1000
    const avg = data.annualAverage;
    if (typeof avg === 'number' && avg > 0) return avg * 1000;
    return failParse('housingStarts', 'src/data/fred/housing-starts.json');
  } catch { return failParse('housingStarts', 'src/data/fred/housing-starts.json'); }
}

function extractBaselineShelterInflation(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 0.035; // BLS CPI Shelter ~3.5% (10-year avg 2015-2024)
  try {
    const data = fredCPIShelter as Record<string, unknown>;
    // Use YoY shelter inflation rate
    const val = data.yoyShelterInflation;
    if (typeof val === 'number' && val > -0.1 && val < 0.2) return val;
    return failParse('baselineShelterInflation', 'src/data/fred/cpi-shelter.json');
  } catch { return failParse('baselineShelterInflation', 'src/data/fred/cpi-shelter.json'); }
}

// ============================================================
// Tax Rate Extraction (Phase 5-tax)
// ============================================================

function extractTaxRates(gdpNominal: number): {
  effectiveIncomeTaxRate: number;
  effectivePayrollRate: number;
  effectiveCorporateTaxRate: number;
  effectiveCapGainsRate: number;
  corporateRetentionRate: number;
  baselineProfitGDPRatio: number;
  isFallback: boolean;
} {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw). The
  // 0.132 income-tax literal below is the demonstrated harm class: the April registry
  // recorded it as the live value while the live derived value was 0.1242.
  // const FALLBACK = { effectiveIncomeTaxRate: 0.132, effectivePayrollRate: 0.136,
  //   effectiveCorporateTaxRate: 0.14, effectiveCapGainsRate: 0.165,
  //   corporateRetentionRate: 0.40, baselineProfitGDPRatio: 0.11, isFallback: true };
  try {
    const data = beaGovernmentReceipts as Record<string, unknown>;
    if (!data) return failParse('government receipts', 'src/data/bea/government-receipts.json');

    const personalTaxes = data.personalCurrentTaxes as number;
    const socialInsurance = data.socialInsuranceContributions as number;
    const corpTaxes = data.corporateIncomeTaxes as number;
    const totalPI = data.totalPersonalIncome as number;
    const wageIncome = data.wageAndSalaryIncome as number;
    const corpProfitsBT = data.corporateProfitsBeforeTax as number;
    const corpProfitsAT = data.corporateProfitsAfterTax as number;
    const undistributed = data.undistributedProfits as number;

    if (!personalTaxes || !totalPI || !socialInsurance || !wageIncome ||
        !corpTaxes || !corpProfitsBT || !corpProfitsAT || !undistributed) {
      return failParse('effective tax rate components (one or more missing)', 'src/data/bea/government-receipts.json');
    }

    return {
      effectiveIncomeTaxRate: personalTaxes / totalPI,
      effectivePayrollRate: socialInsurance / wageIncome,
      effectiveCorporateTaxRate: corpTaxes / corpProfitsBT,
      effectiveCapGainsRate: 0.165, // CBO manual entry — no clean API source
      corporateRetentionRate: undistributed / corpProfitsAT,
      baselineProfitGDPRatio: (corpProfitsBT * 1e9) / gdpNominal, // BEA data in billions, GDP in actual $
      isFallback: false,
    };
  } catch {
    return failParse('effective tax rates', 'src/data/bea/government-receipts.json');
  }
}

// ============================================================
// Phase 7: Fiscal-Monetary Extraction Helpers
// ============================================================

/**
 * Extract federal debt total (FRED GFDEBTN).
 * Units: millions of dollars (e.g., 36_000_000 = $36T).
 */
function extractFederalDebtTotal(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 36_000_000; // ~$36T in millions
  try {
    // FS-6f: read the committed key directly (GFDEBTN, millions of dollars)
    const val = (fredFederalDebt as Record<string, unknown>).debtMillions;
    if (typeof val === 'number' && val > 1_000_000) return val; // sanity: >$1T
    return failParse('debtMillions', 'src/data/fred/federal-debt.json');
  } catch { return failParse('debtMillions', 'src/data/fred/federal-debt.json'); }
}

/**
 * Extract 10-year Treasury yield (FRED DGS10).
 * Stored as percent in FRED → convert to decimal.
 */
function extractTreasuryYield10Y(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 0.043; // 4.3%
  try {
    // FS-6f: read the committed key directly (DGS10, decimal form)
    const val = (fredTreasury10Y as Record<string, unknown>).yieldDecimal;
    if (typeof val === 'number' && val > 0 && val < 0.20) return val;
    return failParse('yieldDecimal', 'src/data/fred/treasury-10yr.json');
  } catch { return failParse('yieldDecimal', 'src/data/fred/treasury-10yr.json'); }
}

/**
 * Extract federal deficit as fraction of GDP (FRED FYFSGDA188S).
 * FRED stores this as percent, and deficits are negative → we take absolute value.
 * Result is a positive decimal (e.g., 0.06 = 6% of GDP).
 */
function extractBaselineDeficitGDPRatio(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 0.06; // 6% of GDP
  try {
    // FS-6f: read the committed key directly (FYFSGDA188S, stored as a positive decimal)
    const val = (fredDeficitGDP as Record<string, unknown>).deficitGDPRatioPositive;
    if (typeof val === 'number' && val > 0 && val < 1) return val;
    return failParse('deficitGDPRatioPositive', 'src/data/fred/federal-deficit-gdp.json');
  } catch { return failParse('deficitGDPRatioPositive', 'src/data/fred/federal-deficit-gdp.json'); }
}

/**
 * Extract BBB corporate spread (FRED BAMLC0A4CBBB).
 * FRED stores as percent → convert to decimal.
 */
function extractBBBCorporateSpread(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 0.015; // 150bp
  try {
    // FS-6f: read the committed key directly (BAMLC0A4CBBB, decimal form)
    const val = (fredBBBSpread as Record<string, unknown>).spreadDecimal;
    if (typeof val === 'number' && val > 0 && val < 0.10) return val;
    return failParse('spreadDecimal', 'src/data/fred/bbb-corporate-spread.json');
  } catch { return failParse('spreadDecimal', 'src/data/fred/bbb-corporate-spread.json'); }
}

/**
 * Extract federal interest outlays (FRED FYOINT).
 * Units: dollars (already in absolute dollar terms in our JSON).
 */
function extractFederalInterestOutlays(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 1_050_000_000_000; // $1.05T
  try {
    // FS-6f: read the committed key directly (FYOINT, absolute dollars)
    const val = (fredInterestOutlays as Record<string, unknown>).interestOutlaysDollars;
    if (typeof val === 'number' && val > 100_000_000_000) return val; // sanity: >$100B
    return failParse('interestOutlaysDollars', 'src/data/fred/federal-interest-outlays.json');
  } catch { return failParse('interestOutlaysDollars', 'src/data/fred/federal-interest-outlays.json'); }
}

/**
 * Extract corporate profits after tax (FRED CP).
 * FRED CP is quarterly SAAR in billions → convert to dollars.
 */
function extractCorporateProfitsAfterTax(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 3_000_000_000_000; // $3T
  try {
    // FS-6f: read the committed key directly (CP, absolute dollars)
    const val = (fredCorporateProfits as Record<string, unknown>).profitsDollars;
    if (typeof val === 'number' && val > 1_000_000_000_000) return val; // sanity: >$1T
    return failParse('profitsDollars', 'src/data/fred/corporate-profits.json');
  } catch { return failParse('profitsDollars', 'src/data/fred/corporate-profits.json'); }
}

/**
 * Extract federal corporate tax receipts (FRED FCTAX).
 * Units: dollars.
 */
function extractFederalCorpTaxReceipts(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 420_000_000_000; // $420B
  try {
    // FS-6f UNIT CORRECTION: FRED FCTAX is denominated in BILLIONS of dollars; the pre-FS-6f
    // fetch script labeled the raw value "receiptsMillions" and derived a dollars field 1000×
    // too small. The corrected script writes "receiptsBillions"; the mislabeled key is read
    // as billions for the current committed vintage. (Validation-only field: no simulation
    // consumer reads it — verified at FS-6f.)
    const f = fredCorpTaxReceipts as Record<string, unknown>;
    const raw = f.receiptsBillions ?? f.receiptsMillions;
    if (typeof raw === 'number' && raw > 100 && raw < 2000) return raw * 1_000_000_000;
    return failParse('receiptsMillions (FCTAX, billions — see unit correction)', 'src/data/fred/corporate-tax-receipts.json');
  } catch { return failParse('receiptsMillions (FCTAX, billions — see unit correction)', 'src/data/fred/corporate-tax-receipts.json'); }
}

/**
 * Extract S&P 500 level (FRED SP500).
 * Units: index value (e.g., 5800).
 */
function extractSP500Level(): number {
  // DEPRECATED (FS-6f, ruled — silent fallback retired; parse failures throw):
  // const FALLBACK = 5800;
  try {
    // FS-6f: read the committed key directly (SP500 index level)
    const val = (fredSP500 as Record<string, unknown>).sp500Level;
    if (typeof val === 'number' && val > 100) return val;
    return failParse('sp500Level', 'src/data/fred/sp500.json');
  } catch { return failParse('sp500Level', 'src/data/fred/sp500.json'); }
}

/**
 * Compute mortgage spread: mortgageRate30yr - treasuryYield10Y.
 * Both inputs are decimals. Returns decimal (e.g., 0.017 = 170bp).
 */
function computeMortgageSpread(mortgageRate: number, treasuryYield: number): number {
  // DEPRECATED (FS-6f, ruled — silent substitution retired; out-of-bounds throws):
  // const FALLBACK = 0.017; // 170bp
  const spread = mortgageRate - treasuryYield;
  // Sanity: spread should be positive and < 500bp
  if (spread > 0 && spread < 0.05) return spread;
  return failParse(`mortgageSpread (derived ${spread.toFixed(4)} outside (0, 0.05))`, 'mortgage-rate-30yr.json minus treasury-yield-10y.json');
}

// ============================================================
// Assemble the government data object
// ============================================================

const gdpComponents = extractGDPComponents();
const incomeShares = extractIncomeShares();
const laborMarket = extractLaborMarket();

const taxRates = extractTaxRates(gdpComponents.gdpNominal);

const blsDataAvailable = (() => {
  try {
    // BLS data is "real" if total employment JSON has actual data array
    return Array.isArray(blsTotalEmployment.data) && blsTotalEmployment.data.length > 0;
  } catch {
    return false;
  }
})();

const fredDataAvailable = (() => {
  try {
    return typeof fredM2Velocity.velocity === 'number' && fredM2Velocity.velocity > 0;
  } catch {
    return false;
  }
})();

// Phase 7: Extract fiscal-monetary values (may use fallbacks if JSON files don't exist)
const _fiscalDebt = extractFederalDebtTotal();
const _treasuryYield = extractTreasuryYield10Y();
const _mortgageRate = extractMortgageRate30yr();

// FS-6f: the family is statically imported — a missing file fails the build, so by the
// time this module evaluates, the data is structurally present (extraction failures throw).
const fredFiscalMonetaryAvailable = true;

/**
 * Central government data object.
 * Every economic baseline constant should trace back to a value here.
 */
export const govData: GovernmentData = {
  // BEA
  gdpNominal: gdpComponents.gdpNominal,
  consumptionRatio: gdpComponents.consumptionRatio,
  investmentRatio: gdpComponents.investmentRatio,
  governmentRatio: gdpComponents.governmentRatio,
  netExportRatio: gdpComponents.netExportRatio,
  wageShare: incomeShares.wageShare,
  assetShare: incomeShares.assetShare,
  transferShare: incomeShares.transferShare,

  // BLS
  totalEmployment: extractTotalEmployment(),
  cpsEmployment: extractCPSEmployment(),
  laborForce: extractLaborForce(),
  unemploymentRate: extractUnemploymentRate(),
  avgWeeklyHours: laborMarket.avgWeeklyHours,
  avgHourlyEarnings: laborMarket.avgHourlyEarnings,
  baseInflationRate: extractBaseInflationRate(),
  cpiSectorWeights: extractCPISectorWeights(),
  cpiSectorInflation: extractCPISectorInflation(),

  // FRED
  m2Velocity: extractM2Velocity(),
  fredNairuRate: extractNairuRate(),
  fedFundsRate: extractFedFundsRate(),

  // Phase 5i: Housing & Credit
  mortgageDelinquencyRate: extractMortgageDelinquencyRate(),
  mortgageRate30yr: _mortgageRate,
  caseShillerIndex: extractCaseShillerIndex(),
  housingStarts: extractHousingStarts(),
  baselineShelterInflation: extractBaselineShelterInflation(),

  // Tax decomposition (Phase 5-tax)
  effectiveIncomeTaxRate: taxRates.effectiveIncomeTaxRate,
  effectivePayrollRate: taxRates.effectivePayrollRate,
  effectiveCorporateTaxRate: taxRates.effectiveCorporateTaxRate,
  effectiveCapGainsRate: taxRates.effectiveCapGainsRate,
  corporateRetentionRate: taxRates.corporateRetentionRate,
  baselineProfitGDPRatio: taxRates.baselineProfitGDPRatio,

  // Phase 7: Fiscal-Monetary
  federalDebtTotal: _fiscalDebt,
  treasuryYield10Y: _treasuryYield,
  baselineDeficitGDPRatio: extractBaselineDeficitGDPRatio(),
  bbbCorporateSpread: extractBBBCorporateSpread(),
  federalInterestOutlays: extractFederalInterestOutlays(),
  corporateProfitsAfterTax: extractCorporateProfitsAfterTax(),
  federalCorpTaxReceipts: extractFederalCorpTaxReceipts(),
  sp500Level: extractSP500Level(),
  mortgageSpread: computeMortgageSpread(_mortgageRate, _treasuryYield),

  // Meta
  isFallback: {
    bea: gdpComponents.isFallback || incomeShares.isFallback,
    beaGDP: gdpComponents.isFallback,
    beaIncome: incomeShares.isFallback,
    bls: !blsDataAvailable,
    fred: !fredDataAvailable,
    fredFiscalMonetary: !fredFiscalMonetaryAvailable,
  },
};

// ============================================================
// Validation
// ============================================================

/**
 * Validate government data for reasonableness.
 * Returns array of warning strings (empty = all good).
 */
export function validateGovernmentData(): string[] {
  const warnings: string[] = [];

  // Employment sanity checks
  if (govData.totalEmployment < 100_000_000 || govData.totalEmployment > 200_000_000) {
    warnings.push(`Total employment ${govData.totalEmployment.toLocaleString()} outside expected range [100M, 200M]`);
  }
  if (govData.laborForce < 150_000_000 || govData.laborForce > 200_000_000) {
    warnings.push(`Labor force ${govData.laborForce.toLocaleString()} outside expected range [150M, 200M]`);
  }
  if (govData.totalEmployment > govData.laborForce) {
    warnings.push(`Total employment (${govData.totalEmployment.toLocaleString()}) exceeds labor force (${govData.laborForce.toLocaleString()})`);
  }
  if (govData.cpsEmployment <= govData.totalEmployment) {
    warnings.push(`CPS employment (${govData.cpsEmployment.toLocaleString()}) should exceed CES employment (${govData.totalEmployment.toLocaleString()})`);
  }
  if (govData.cpsEmployment >= govData.laborForce) {
    warnings.push(`CPS employment (${govData.cpsEmployment.toLocaleString()}) should be less than labor force (${govData.laborForce.toLocaleString()})`);
  }

  // GDP sanity
  if (govData.gdpNominal < 20_000_000_000_000 || govData.gdpNominal > 40_000_000_000_000) {
    warnings.push(`GDP ${govData.gdpNominal.toLocaleString()} outside expected range [$20T, $40T]`);
  }

  // Ratios
  const ratioSum = govData.consumptionRatio + govData.investmentRatio + govData.governmentRatio + govData.netExportRatio;
  if (Math.abs(ratioSum - 1.0) > 0.01) {
    warnings.push(`GDP component ratios sum to ${ratioSum.toFixed(4)}, expected ~1.0`);
  }
  const shareSum = govData.wageShare + govData.assetShare + govData.transferShare;
  if (Math.abs(shareSum - 1.0) > 0.01) {
    warnings.push(`Income shares sum to ${shareSum.toFixed(4)}, expected ~1.0`);
  }

  // Inflation
  if (govData.baseInflationRate < 0 || govData.baseInflationRate > 0.15) {
    warnings.push(`Base inflation rate ${(govData.baseInflationRate * 100).toFixed(1)}% outside expected range [0%, 15%]`);
  }

  // M2 velocity
  if (govData.m2Velocity < 0.5 || govData.m2Velocity > 3.0) {
    warnings.push(`M2 velocity ${govData.m2Velocity.toFixed(3)} outside expected range [0.5, 3.0]`);
  }

  // Phase 7: Fiscal-monetary sanity checks
  if (govData.treasuryYield10Y < 0 || govData.treasuryYield10Y > 0.20) {
    warnings.push(`10Y Treasury yield ${(govData.treasuryYield10Y * 100).toFixed(1)}% outside expected range [0%, 20%]`);
  }
  if (govData.baselineDeficitGDPRatio < 0 || govData.baselineDeficitGDPRatio > 0.30) {
    warnings.push(`Deficit/GDP ratio ${(govData.baselineDeficitGDPRatio * 100).toFixed(1)}% outside expected range [0%, 30%]`);
  }
  if (govData.federalDebtTotal < 10_000_000 || govData.federalDebtTotal > 100_000_000) {
    warnings.push(`Federal debt ${govData.federalDebtTotal.toLocaleString()}M outside expected range [$10T, $100T]`);
  }

  // Fallback warnings
  if (govData.isFallback.beaGDP) {
    warnings.push('BEA GDP data is FALLBACK — run scripts/fetch-bea-data.ts with API key for real data');
  }
  if (govData.isFallback.beaIncome) {
    warnings.push('BEA personal income shares are FALLBACK (60/20/20) — run scripts/fetch-bea-data.ts with API key for real data');
  }
  if (govData.isFallback.bls) {
    warnings.push('BLS data is FALLBACK — run scripts/fetch-bls-data.ts for real data');
  }
  if (govData.isFallback.fred) {
    warnings.push('FRED data is FALLBACK — run scripts/fetch-fred-data.ts for real data');
  }
  if (govData.isFallback.fredFiscalMonetary) {
    warnings.push('FRED fiscal-monetary data is FALLBACK — run scripts/fetch-fred-data.ts with Phase 7 series for real data');
  }

  return warnings;
}

/**
 * Maps BLS CPI weight categories to ATLAS sector group prefixes.
 * Used by constants.ts to build SECTOR_CPI_WEIGHTS from real BLS data.
 *
 * Mapping logic:
 *   shelter     → construction (housing costs)
 *   transportation → transport
 *   medical_care  → health
 *   food_home     → ag (farm inputs to consumer food at home)
 *   food_away     → food (food service / restaurants)
 *   education_comm → edu
 *   info_technology → tech
 *   recreation    → creative (entertainment/media)
 *   apparel       → retail
 *   other_services → prof + legal (professional/legal services)
 *   energy        → mfg (energy production)
 *   other_goods   → other + gov + sci + finance (residual distribution)
 */
export function buildSectorCPIWeights(
  blsWeights: Record<string, number>,
): Record<string, number> {
  const w = blsWeights;

  // Split "other_services" equally between prof and legal
  const otherServices = w.other_services ?? 0.032;
  const profWeight = otherServices * 0.67; // ~2/3 professional
  const legalWeight = otherServices * 0.33; // ~1/3 legal

  // Split "other_goods" among remaining sectors: finance, gov, sci, other
  const otherGoods = w.other_goods ?? 0.013;
  const financeWeight = otherGoods * 0.40;
  const govWeight = otherGoods * 0.25;
  const sciWeight = otherGoods * 0.10;
  const residualWeight = otherGoods * 0.25;

  const result: Record<string, number> = {
    health: w.medical_care ?? 0.084,
    food: w.food_away ?? 0.056,
    ag: w.food_home ?? 0.079,
    transport: w.transportation ?? 0.151,
    retail: w.apparel ?? 0.025,
    construction: w.shelter ?? 0.370,
    edu: w.education_comm ?? 0.062,
    tech: w.info_technology ?? 0.013,
    creative: w.recreation ?? 0.053,
    finance: financeWeight,
    legal: legalWeight,
    prof: profWeight,
    gov: govWeight,
    mfg: w.energy ?? 0.062,
    sci: sciWeight,
    other: residualWeight,
  };

  // Normalize to sum to 1.0
  const sum = Object.values(result).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1.0) > 0.001) {
    for (const key of Object.keys(result)) {
      result[key] = result[key]! / sum;
    }
  }

  return result;
}
