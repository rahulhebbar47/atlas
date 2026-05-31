/**
 * ATLAS Verification Audit — Type Definitions
 *
 * Defines the verification output structure, comparison result types,
 * and tolerance thresholds for the automated audit.
 */

import type { SimulationConfig, CyclePhase, PolicyEffects, MonetaryState } from '@/types';

// ============================================================
// Tolerance Levels
// ============================================================

export type ComparisonStatus = 'PASS' | 'WARN' | 'FAIL';

/** Relative error thresholds */
export const TOLERANCE = {
  PASS: 0.0001,   // <0.01% relative error
  WARN: 0.01,     // 0.01-1% relative error
  // >1% = FAIL
} as const;

/** Absolute threshold for near-zero values (below this, use absolute comparison) */
export const NEAR_ZERO_THRESHOLD = 1_000_000; // $1M
export const NEAR_ZERO_RELATIVE = 0.00001;    // 0.001%

// ============================================================
// Scenario Definition
// ============================================================

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  config: SimulationConfig;
}

// ============================================================
// Verification Year Output
// ============================================================

/**
 * Independent verification output for a single year.
 * Fields match the corresponding ATLAS SimulationYearOutput/MacroOutput fields.
 */
export interface VerificationYear {
  year: number;

  // Capability scores
  capabilityGenerative: number;
  capabilityAgentic: number;
  capabilityEmbodied: number;

  // Employment
  totalRemainingEmployment: number;
  totalDirectDisplacement: number;
  totalSecondOrderDisplacement: number;
  totalDisplacement: number;
  weightedAverageWage: number;
  automationCoverage: number;

  // Demand spillover
  consumerDemandRatio: number;
  govDemandRatio: number;
  businessDemandRatio: number;
  aggregateDemandSurvival: number;
  totalDemandSpilloverLoss: number;

  // Macro - Employment
  totalEmployment: number;
  totalUnemployment: number;
  unemploymentRate: number;
  laborForceParticipation: number;

  // Macro - Income
  aggregateWageIncome: number;
  aggregateAssetIncome: number;
  aggregateTransferIncome: number;
  totalIncome: number;

  // Macro - Prices
  priceLevel: number;
  inflationRate: number;
  aiDeflationRate: number;
  netInflation: number;

  // Macro - GDP
  gdpNominal: number;
  gdpReal: number;
  gdpGrowthRate: number;
  consumption: number;
  investment: number;
  governmentSpending: number;

  // Macro - CWI
  consumerWelfareIndex: number;
  cwiGrowthRate: number;
  cwiAcceleration: number;
  cyclePhase: CyclePhase;

  // Macro - Revenue/automation pressure
  revenuePressure: number;
  automationAcceleration: number;

  // Macro - Depression
  isDepression: boolean;
  consecutiveDeclineQuarters: number;

  // Macro - Phillips & Deflation
  wagePressure: number;
  sectorWeightedDeflationRate: number;

  // Macro - Second-order
  demandRatio: number;
  demandPenalty: number;
  creditTightening: number;
  investmentMultiplier: number;
  consumptionMultiplier: number;
  fiscalDeficitGDPRatio: number;

  // Deflation drag
  velocityMultiplier: number;
  deflationDragPct: number;

  // Income derivation
  cumulativeInflationFactor: number;

  // AI Production
  aiAdditionalOutput: number;
  aiInvestmentBoost: number;
  aiNetExportBoost: number;
  aiConsumerGoodsPotential: number;
  unrealizedAIOutput: number;
  aiGoodsAbsorbed: number;

  // New Jobs
  newJobEmployment: number;
  newJobWageIncome: number;

  // Demand-constrained GDP
  potentialGDP: number;
  capacityUtilization: number;
  profitRealizationRate: number;
  wageConsumption: number;
  assetConsumption: number;
  transferConsumption: number;

  // Corporate Profits
  corporateProfits: number;
  aiCorporateProfits: number;
  traditionalCorporateProfits: number;
  profitGDPRatio: number;

  // AI GDP
  aiGDPContribution: number;
  aiGDPContributionPct: number;

  // Policy effects (summary)
  wageChannelAddition: number;
  assetChannelAddition: number;
  transferChannelAddition: number;
  totalPolicyIncome: number;
  fiscalCost: number;
  sovereignFundSize: number;

  // Monetary
  moneySupply: number;
  maxNeutralTransfers: number;
  actualInflationFromTransfers: number;
  isWithinNeutralZone: boolean;
}

// ============================================================
// Comparison Result
// ============================================================

export interface ComparisonResult {
  scenario: string;
  year: number;
  field: string;
  expected: number;
  actual: number;
  difference: number;
  percentError: number;
  status: ComparisonStatus;
}

// ============================================================
// Invariant Check Result
// ============================================================

export interface InvariantCheckResult {
  scenario: string;
  year: number;
  check: string;
  passed: boolean;
  message: string;
  expected?: string;
  actual?: string;
}

// ============================================================
// Extreme Value Check Result
// ============================================================

export interface ExtremeValueResult {
  parameter: string;
  testValue: number | string;
  year: number;
  check: string;
  passed: boolean;
  message: string;
}

// ============================================================
// Audit Report Summary
// ============================================================

export interface AuditSummary {
  totalComparisons: number;
  passCount: number;
  warnCount: number;
  failCount: number;
  totalInvariantChecks: number;
  invariantPassCount: number;
  invariantFailCount: number;
  totalExtremeValueChecks: number;
  extremePassCount: number;
  extremeFailCount: number;
  scenarioResults: ScenarioSummary[];
}

export interface ScenarioSummary {
  scenarioId: string;
  scenarioName: string;
  totalFields: number;
  passCount: number;
  warnCount: number;
  failCount: number;
  worstField: string;
  worstError: number;
}

// ============================================================
// Field mapping: VerificationYear field -> ATLAS field path
// ============================================================

export type FieldMapping = {
  verifyField: keyof VerificationYear;
  atlasPath: string; // dot-separated path in SimulationYearOutput
};

/**
 * Maps verification fields to their ATLAS output paths.
 * Used by compareResults.ts to extract actual values.
 */
export const FIELD_MAPPINGS: FieldMapping[] = [
  // Capabilities
  { verifyField: 'capabilityGenerative', atlasPath: 'capabilities.generative' },
  { verifyField: 'capabilityAgentic', atlasPath: 'capabilities.agentic' },
  { verifyField: 'capabilityEmbodied', atlasPath: 'capabilities.embodied' },

  // Macro - Employment
  { verifyField: 'totalEmployment', atlasPath: 'macro.totalEmployment' },
  { verifyField: 'totalUnemployment', atlasPath: 'macro.totalUnemployment' },
  { verifyField: 'unemploymentRate', atlasPath: 'macro.unemploymentRate' },
  { verifyField: 'laborForceParticipation', atlasPath: 'macro.laborForceParticipation' },

  // Macro - Income
  { verifyField: 'aggregateWageIncome', atlasPath: 'macro.aggregateWageIncome' },
  { verifyField: 'aggregateAssetIncome', atlasPath: 'macro.aggregateAssetIncome' },
  { verifyField: 'aggregateTransferIncome', atlasPath: 'macro.aggregateTransferIncome' },
  { verifyField: 'totalIncome', atlasPath: 'macro.totalIncome' },

  // Macro - Prices
  { verifyField: 'priceLevel', atlasPath: 'macro.priceLevel' },
  { verifyField: 'inflationRate', atlasPath: 'macro.inflationRate' },
  { verifyField: 'aiDeflationRate', atlasPath: 'macro.aiDeflationRate' },
  { verifyField: 'netInflation', atlasPath: 'macro.netInflation' },

  // Macro - GDP
  { verifyField: 'gdpNominal', atlasPath: 'macro.gdpNominal' },
  { verifyField: 'gdpReal', atlasPath: 'macro.gdpReal' },
  { verifyField: 'gdpGrowthRate', atlasPath: 'macro.gdpGrowthRate' },
  { verifyField: 'consumption', atlasPath: 'macro.consumption' },
  { verifyField: 'investment', atlasPath: 'macro.investment' },
  { verifyField: 'governmentSpending', atlasPath: 'macro.governmentSpending' },

  // Macro - CWI
  { verifyField: 'consumerWelfareIndex', atlasPath: 'macro.consumerWelfareIndex' },
  { verifyField: 'cwiGrowthRate', atlasPath: 'macro.cwiGrowthRate' },
  { verifyField: 'cwiAcceleration', atlasPath: 'macro.cwiAcceleration' },

  // Macro - Pressure
  { verifyField: 'revenuePressure', atlasPath: 'macro.revenuePressure' },
  { verifyField: 'automationAcceleration', atlasPath: 'macro.automationAcceleration' },
  { verifyField: 'wagePressure', atlasPath: 'macro.wagePressure' },
  { verifyField: 'sectorWeightedDeflationRate', atlasPath: 'macro.sectorWeightedDeflationRate' },

  // Second-order
  { verifyField: 'demandRatio', atlasPath: 'macro.demandRatio' },
  { verifyField: 'demandPenalty', atlasPath: 'macro.demandPenalty' },
  { verifyField: 'creditTightening', atlasPath: 'macro.creditTightening' },
  { verifyField: 'investmentMultiplier', atlasPath: 'macro.investmentMultiplier' },
  { verifyField: 'consumptionMultiplier', atlasPath: 'macro.consumptionMultiplier' },
  { verifyField: 'fiscalDeficitGDPRatio', atlasPath: 'macro.fiscalDeficitGDPRatio' },

  // Deflation drag
  { verifyField: 'velocityMultiplier', atlasPath: 'macro.velocityMultiplier' },
  { verifyField: 'deflationDragPct', atlasPath: 'macro.deflationDragPct' },

  // Income derivation
  { verifyField: 'cumulativeInflationFactor', atlasPath: 'macro.cumulativeInflationFactor' },

  // AI Production
  { verifyField: 'aiAdditionalOutput', atlasPath: 'macro.aiAdditionalOutput' },
  { verifyField: 'aiInvestmentBoost', atlasPath: 'macro.aiInvestmentBoost' },
  { verifyField: 'aiNetExportBoost', atlasPath: 'macro.aiNetExportBoost' },
  { verifyField: 'aiConsumerGoodsPotential', atlasPath: 'macro.aiConsumerGoodsPotential' },
  { verifyField: 'unrealizedAIOutput', atlasPath: 'macro.unrealizedAIOutput' },
  { verifyField: 'aiGoodsAbsorbed', atlasPath: 'macro.aiGoodsAbsorbed' },

  // New Jobs
  { verifyField: 'newJobEmployment', atlasPath: 'macro.newJobEmployment' },
  { verifyField: 'newJobWageIncome', atlasPath: 'macro.newJobWageIncome' },

  // Demand-constrained GDP
  { verifyField: 'potentialGDP', atlasPath: 'macro.potentialGDP' },
  { verifyField: 'capacityUtilization', atlasPath: 'macro.capacityUtilization' },
  { verifyField: 'profitRealizationRate', atlasPath: 'macro.profitRealizationRate' },
  { verifyField: 'wageConsumption', atlasPath: 'macro.wageConsumption' },
  { verifyField: 'assetConsumption', atlasPath: 'macro.assetConsumption' },
  { verifyField: 'transferConsumption', atlasPath: 'macro.transferConsumption' },

  // Corporate Profits
  { verifyField: 'corporateProfits', atlasPath: 'macro.corporateProfits' },
  { verifyField: 'aiCorporateProfits', atlasPath: 'macro.aiCorporateProfits' },
  { verifyField: 'traditionalCorporateProfits', atlasPath: 'macro.traditionalCorporateProfits' },
  { verifyField: 'profitGDPRatio', atlasPath: 'macro.profitGDPRatio' },

  // AI GDP
  { verifyField: 'aiGDPContribution', atlasPath: 'macro.aiGDPContribution' },
  { verifyField: 'aiGDPContributionPct', atlasPath: 'macro.aiGDPContributionPct' },

  // Demand spillover
  { verifyField: 'consumerDemandRatio', atlasPath: 'macro.consumerDemandRatio' },
  { verifyField: 'govDemandRatio', atlasPath: 'macro.govDemandRatio' },
  { verifyField: 'businessDemandRatio', atlasPath: 'macro.businessDemandRatio' },
  { verifyField: 'aggregateDemandSurvival', atlasPath: 'macro.aggregateDemandSurvival' },
  { verifyField: 'totalDemandSpilloverLoss', atlasPath: 'macro.totalDemandSpilloverLoss' },

  // Policy
  { verifyField: 'wageChannelAddition', atlasPath: 'policyEffects.wageChannelAddition' },
  { verifyField: 'assetChannelAddition', atlasPath: 'policyEffects.assetChannelAddition' },
  { verifyField: 'transferChannelAddition', atlasPath: 'policyEffects.transferChannelAddition' },
  { verifyField: 'totalPolicyIncome', atlasPath: 'policyEffects.totalPolicyIncome' },
  { verifyField: 'fiscalCost', atlasPath: 'policyEffects.fiscalCost' },
  { verifyField: 'sovereignFundSize', atlasPath: 'policyEffects.sovereignFundSize' },

  // Monetary
  { verifyField: 'moneySupply', atlasPath: 'monetary.moneySupply' },
  { verifyField: 'maxNeutralTransfers', atlasPath: 'monetary.maxNeutralTransfers' },
  { verifyField: 'actualInflationFromTransfers', atlasPath: 'monetary.actualInflationFromTransfers' },
];

/**
 * Determine comparison status for a single field comparison.
 */
export function getComparisonStatus(expected: number, actual: number): ComparisonStatus {
  // Handle exact boolean-like checks (0 or 1)
  if (expected === actual) return 'PASS';

  const diff = Math.abs(expected - actual);

  // Near-zero: use absolute threshold
  if (Math.abs(expected) < NEAR_ZERO_THRESHOLD && Math.abs(actual) < NEAR_ZERO_THRESHOLD) {
    if (diff < NEAR_ZERO_THRESHOLD * NEAR_ZERO_RELATIVE) return 'PASS';
    if (diff < NEAR_ZERO_THRESHOLD * TOLERANCE.WARN) return 'WARN';
    return 'FAIL';
  }

  // Standard relative error
  const relError = Math.abs(expected) > 0 ? diff / Math.abs(expected) : (actual === 0 ? 0 : 1);

  if (relError < TOLERANCE.PASS) return 'PASS';
  if (relError < TOLERANCE.WARN) return 'WARN';
  return 'FAIL';
}
