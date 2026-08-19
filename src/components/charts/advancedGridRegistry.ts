/**
 * THE ADVANCED GRID REGISTRY  — one entry per LIVE dial key: the control class the
 * grid renders and the DECLARED display↔config scale (the specified two-scales check: the
 * innovationRate and %g incidents are the evidence base; every rendered control's
 * declaration round-trips at the bounds, asserted permanently in the registry tests).
 *
 * Control classes (mechanical, from the dial row + the default config's shape):
 *  - 'slider'   : numeric with table bounds, writable at a real config path
 *  - 'number'   : numeric without table bounds, writable (free input; load-time clamps)
 *  - 'toggle'   : boolean at a real config path
 *  - 'editor'   : owned by a dedicated editor surface (per-cluster/per-role containers,
 *                 keyframe schedules, the profile/dimension machinery, selector rows) —
 *                 the grid renders a display row pointing at the model author
 *  - 'per-year' : the override vehicle — lives in the per-year strip
 *  - 'display'  : read-only class (mirrors, report-only rows)
 */
import { DIAL_TABLE, type DialRow } from '@/data/dialTable';
import { ALL_VARIANT_MANIFESTS, CONSENSUS_VARIANT, AXIS_SHORT_FORMS } from '@/data/manifests/axes';
import { getDefaultSimulationConfig } from '@/models/simulation';
import { getDefaultSupplyChainConfig } from '@/models/supplyChain';
import { DEFAULT_INNOVATION_RATE } from '@/models/constants';
import { REGISTERED_EVENT_KEY_TO_CONFIG } from '@/models/manifestCompiler';
import type { SimulationConfig } from '@/types';

/** The governed-row chip: config path → its per-year event key, inverted from the
 *  compiler's census map (one source; completeness test-asserted there). A grid row
 *  with an entry here can be governed by an event's per-year window — GridRow asks the
 *  store for the active coverage and badges it. */
export const PER_YEAR_KEY_FOR_ROW: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(REGISTERED_EVENT_KEY_TO_CONFIG).map(([perYearKey, configPath]) => [configPath, perYearKey]),
);

export type ScaleKind = 'identity' | 'percent' | 'index' | 'multiplier-of-innovation';
export interface ScaleDecl {
  kind: ScaleKind;
  toDisplay: (config: number) => number;
  toConfig: (display: number) => number;
}

const SCALES: Record<ScaleKind, ScaleDecl> = {
  identity: { kind: 'identity', toDisplay: (x) => x, toConfig: (x) => x },
  percent: { kind: 'percent', toDisplay: (x) => x * 100, toConfig: (x) => x / 100 },
  index: { kind: 'index', toDisplay: (x) => x, toConfig: (x) => x }, // 100 = baseline; identity numerically, distinct semantically
  'multiplier-of-innovation': {
    kind: 'multiplier-of-innovation',
    toDisplay: (x) => x / DEFAULT_INNOVATION_RATE,
    toConfig: (x) => x * DEFAULT_INNOVATION_RATE,
  },
};

/** Keys rendered ×100 (rates/fractions the UI has always shown as percentages). */
const PERCENT_KEYS = new Set<string>([
  'baseInflationRate', 'baselineGDPGrowth', 'populationGrowthRate', 'inflationTarget',
  'neutralRealRate', 'termPremium', 'effectiveLowerBound', 'fiscalDominanceThreshold',
  'fiscalRiskPremiumMax', 'aiCostParams.frontierIntensityGrowth',
  'aiCostParams.manufacturingAnnualChange', 'aiCostParams.energyAnnualChange',
  'deferrableConsumptionShare', 'deflationMidpoint', 'supplyChainConfig.costPassThroughRate',
  'supplyChainConfig.consumerPassThroughRate', 'supplyChainConfig.costVsProcurementBlend',
  'deAdoptionRateCognitive', 'deAdoptionRateEmbodied',
]);
const INDEX_KEYS = new Set<string>([
  'supplyChainConfig.inputs.aiChips', 'supplyChainConfig.inputs.chipPrice',
  'supplyChainConfig.inputs.energyPrice', 'supplyChainConfig.inputs.energyCapacity',
  'supplyChainConfig.inputs.trainingDCCapacity', 'supplyChainConfig.inputs.inferenceDCCapacity',
  'supplyChainConfig.inputs.roboticsHardware', 'supplyChainConfig.inputs.softwareEfficiency',
]);

export function scaleFor(key: string): ScaleDecl {
  if (key === 'innovationRate') return SCALES['multiplier-of-innovation'];
  if (PERCENT_KEYS.has(key)) return SCALES.percent;
  if (INDEX_KEYS.has(key)) return SCALES.index;
  return SCALES.identity;
}

export type ControlClass = 'slider' | 'number' | 'toggle' | 'editor' | 'per-year' | 'display';

function getDeep(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
}

function setDeep(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const [head, ...rest] = path.split('.');
  if (!head) return obj;
  if (rest.length === 0) return { ...obj, [head]: value };
  return { ...obj, [head]: setDeep((obj[head] ?? {}) as Record<string, unknown>, rest.join('.'), value) };
}

/**
 * (the optional-parent rule, user-config side): the grid's ONE write path.
 * A nested write under an ABSENT supplyChainConfig materializes the FULL default
 * block first — a partial parent would activate the dormant machinery with missing
 * fields. Battery-asserted (the composition tests).
 */
export function writeConfigValue(config: SimulationConfig, key: string, value: unknown): SimulationConfig {
  let base = config as unknown as Record<string, unknown>;
  if (key.startsWith('supplyChainConfig.') && base['supplyChainConfig'] === undefined) {
    base = { ...base, supplyChainConfig: getDefaultSupplyChainConfig() as unknown };
  }
  return setDeep(base, key, value) as unknown as SimulationConfig;
}

const DEFAULT_CFG = getDefaultSimulationConfig() as unknown as Record<string, unknown>;

/** Keyframe-schedule and dedicated-editor ownership (the grid points, never duplicates). */
const EDITOR_OWNED_PREFIXES = ['bfcsOverrides', 'clusterOverrides', 'roleAutomationShareOverrides',
  'roleReplacementFrictionYearsOverrides', 'roleReplacementDifficultyWagePremiumOverrides',
  'clusterAutomationShareOverrides', 'deflationIntensityOverrides', 'stateOverrides',
  'FiscalPolicyProfile.', 'FederalReserveProfile.', 'fiscalPolicyCustom', 'federalReserveCustom',
  'fiscalPolicyPreset', 'federalReservePreset', 'policyRateSchedule', 'roleEstimation.',
  'taxConfig', 'policyConfig.'];

export function controlClassFor(row: DialRow): ControlClass {
  if (row.species === 'OVERRIDE-VEHICLE') return 'per-year';
  if (EDITOR_OWNED_PREFIXES.some((p) => row.key === p || row.key.startsWith(p))) return 'editor';
  const v = getDeep(DEFAULT_CFG, row.key);
  const probe = v !== undefined ? v : row.default;
  if (typeof probe === 'boolean' || probe === 'true' || probe === 'false') return 'toggle';
  if (typeof probe === 'string') {
    // (a recorded design decision): an OPTIONAL NUMERIC with table bounds whose default is the descriptive
    // 'undefined (…)' seed string is a real dial, not an editor container — render the
    // slider (writing it sets the override; the prefix check above already kept true
    // containers in the editor class).
    if (probe.startsWith('undefined') && row.min !== null && row.max !== null) return 'slider';
    return 'editor';                                        // enums/derived own their surfaces
  }
  if (typeof probe !== 'number') return 'display';
  return row.min !== null && row.max !== null ? 'slider' : 'number';
}

export interface GridEntry { row: DialRow; control: ControlClass; scale: ScaleDecl }
export const ADVANCED_GRID_REGISTRY: ReadonlyMap<string, GridEntry> = new Map(
  DIAL_TABLE.map((row) => [row.key, { row, control: controlClassFor(row), scale: scaleFor(row.key) }]),
);

/**
 * R3c (P2, motion+hints item): soft range hints for number-class rows — ONLY where the
 * config validator actually clamps the key (no invented bounds; test-asserted
 * against the validator source). Display-scale conversion applies at render.
 */
export const NUMBER_RANGE_HINTS: Record<string, readonly [number, number]> = {
  aiProductionInvestmentFraction: [0, 1],
  aiProductionOnshoringFraction: [0, 1],
  newJobWageFraction: [0, 2],
  transferReliabilityWeight: [0.3, 0.95],
  incomeAdequacySensitivity: [0.5, 5],
  collateralSensitivity: [0, 3],
  systemicRiskSensitivity: [0.5, 4],
  inflationRiskSensitivity: [0, 2],
  maxConsumerTightening: [0.2, 1],
  consumerCreditImpact: [0.02, 0.15],
  profitabilitySensitivity: [0.5, 4],
  growthTrajectorySensitivity: [0.5, 5],
  maxBusinessTightening: [0.2, 1],
  businessInvestmentImpact: [0.05, 0.3],
  fiscalRiskPremiumMax: [0.01, 0.15],
  inflationConvergenceYears: [1, 15],
  formationSensitivity: [0, 0.5],
  headshipRecoveryRate: [0, 1],
  housingSupplyElasticity: [0, 10],
  embodiedCapacityGain: [0, 5],
  housingDepreciationRate: [0, 0.05],
  constructionLaborShare: [0, 1],
  landIncomeBeta: [0, 3],
  landScarcityElasticity: [0, 10],
  rentOccupancyElasticity: [0, 10],
  rentCostAnchorWeight: [0, 1],
  baselineCapRate: [0.01, 0.2],
  capRateMortgageBeta: [0, 2],
  capRateInvestorCompression: [0, 1],
  fireSaleElasticity: [0, 10],
  investorDemandIntensity: [0, 1],
  landRateSensitivity: [0, 5],
  landClosureKappa: [0, 1],
  opexPassthrough: [0, 1],
  rentDownwardRigidity: [0, 1],
  rentIncomeElasticity: [0, 2],
  constructionCreditSensitivity: [0, 10],
  builderAdjustmentLambda: [0, 1],
  housingPipelineDuration: [0, 10],
};

/**
 * THE SUB-GROUP LAYER (the Advanced IA stage, IA-1): authored mechanism-family
 * headers inside a rendered group, so short row titles read unambiguously ("Floor"
 * under "Generative — language & code"). Match tokens: a trailing dot is a PREFIX,
 * otherwise an exact key. Coverage is BIDIRECTIONAL and test-asserted: every row
 * in a subgrouped group falls in exactly one cell, and every token matches at least
 * one live dial key (a stale token after a future retirement fails loudly instead of
 * hiding). Every name is a user-visible string — the permanent vocabulary ban walks
 * this set.
 */
export interface GridSubgroup { name: string; match: readonly string[] }
export const GRID_SUBGROUPS: Record<string, readonly GridSubgroup[]> = {
  A1: [
    { name: 'Generative — language & code', match: ['capabilities.generative.'] },
    { name: 'Agentic — multi-step decisions', match: ['capabilities.agentic.'] },
    { name: 'Embodied — robots & vehicles', match: ['capabilities.embodied.'] },
  ],
  A2: [
    { name: 'Per-unit cost decline', match: ['aiCostParams.tokenCostCurve.', 'aiCostParams.inferenceAnnualChange'] },
    { name: 'The frontier premium', match: ['aiCostParams.frontierIntensityLevel', 'aiCostParams.frontierIntensityGrowth', 'aiCostParams.sigmaMigration', 'aiCostParams.wMinFrontierFloor'] },
    // 'Hardware & energy costs' MOVED to N1 — the keys
    // migrated with the axis (the recorded design decision)). Retired per no-delete:
    //   { name: 'Hardware & energy costs', match: ['aiCostParams.manufacturingAnnualChange', 'aiCostParams.energyAnnualChange'] },
  ],
  // an earlier build step — N1, the buildout-cost worldview (one author of every leg cost).
  N1: [
    { name: 'Capacity cost trends', match: ['buildoutChipsCostTrend', 'buildoutEnergyCostTrend', 'buildoutDcCostTrend'] },
    // The energy queue:
    { name: 'Grid power delivery', match: ['energyQueueLeadYears', 'energyQueueCeilingGrowth', 'energyBtmShare'] },
    { name: 'Fleet production', match: ['buildoutFleetCostTrend', 'buildoutFleetRampGrowth'] },
    { name: 'Hardware & energy costs', match: ['aiCostParams.manufacturingAnnualChange', 'aiCostParams.energyAnnualChange'] },
    { name: 'Frontier training cost structure', match: ['supplyChainConfig.trainingDynamics.'] },
  ],
  A3: [
    { name: 'Adoption pressure', match: ['adoptionParams.competitivePressureMultiplier', 'adoptionParams.geopoliticalRiskFactor', 'competitivePressureThreshold', 'wageAutomationSensitivity', 'creditAdoptionSensitivity', 'revenuePressureSensitivity', 'revenuePressureCap', 'revenuePressureDecay'] },
    { name: 'The reverse gear — unwind & re-adopt', match: ['supplyChainConfig.hysteresisMaxCognitive', 'supplyChainConfig.hysteresisMaxEmbodied', 'deAdoptionRateCognitive', 'deAdoptionRateEmbodied', 'reAdoptionRate'] },
  ],
  A4: [
    { name: 'The replace-or-augment decision', match: ['alphaDriverParams.'] },
    { name: 'Productivity of each mode', match: ['augmentationMultiplier', 'augmentationAdoptionSteepness'] }, // replacementMultiplier retired with the ledger re-anchor
  ],
  A5: [
    { name: 'The displaced-worker pool', match: ['exitBase', 'exitDurationSlope', 'atrophyRate', 'wageScarringRate', 'participationElasticity', 'participationThreshold'] },
    { name: 'Wage formation & bargaining', match: ['phillipsSlope', 'downwardWageRigidity', 'rentSharingElasticity', 'productivityPassthrough', 'wagePassThrough', 'scarcityPassThrough', 'scarcityIntensity', 'inflationIndexation', 'secularProfitDriftRate'] },
  ],
  A7: [
    { name: 'Household spending', match: ['postTaxMPCs.', 'mpcWageUESensitivity', 'deferrableConsumptionShare', 'deflationMidpoint', 'deflationSteepness', 'velocitySensitivity'] },
    { name: 'Business demand & prices', match: ['demandFeedbackSensitivity', 'aiDeflationPassthrough', 'laborServicesPassthrough', 'foodEnergyPassthrough', 'aiUtilizationSensitivity', 'consumerDemandInvestmentSensitivity', 'traditionalInvestmentDemandSensitivity', 'traditionalInvestmentGDPFraction'] },
  ],
  A8: [
    { name: 'Consumer credit', match: ['transferReliabilityWeight', 'incomeAdequacySensitivity', 'maxConsumerTightening', 'consumerCreditImpact', 'creditDeflationSensitivity', 'creditDeflationImpulseSensitivity'] },
    { name: 'Business credit', match: ['profitabilitySensitivity', 'growthTrajectorySensitivity', 'maxBusinessTightening', 'businessInvestmentImpact', 'maxBusinessCreditLoosening', 'creditExpectationTurnover'] },
    { name: 'Housing distress', match: ['collateralSensitivity', 'mortgageStressAmplifier', 'foreclosureLag', 'homeownershipRecoveryRate', 'housingWealthMPC', 'institutionalBuyerRate', 'fireSaleElasticity'] },
    { name: 'Markets & systemic', match: ['systemicRiskSensitivity', 'inflationRiskSensitivity', 'aiPESensitivity', 'traditionalPESensitivity', 'aiPEMultiplier', 'aiSectorLaborShare', 'erpCrisisSensitivity'] },
  ],
  A9: [
    { name: 'Building & supply response', match: ['housingSupplyElasticity', 'builderAdjustmentLambda', 'builderPriceMode', 'housingPipelineDuration', 'constructionCreditSensitivity', 'constructionLaborShare', 'embodiedCapacityGain', 'housingDepreciationRate'] },
    { name: 'Land', match: ['landShare', 'landScarcityElasticity', 'landClosureKappa'] },
    { name: 'Rents & occupancy', match: ['rentIncomeElasticity', 'rentOccupancyElasticity', 'rentDownwardRigidity', 'opexPassthrough', 'formationSensitivity', 'headshipRecoveryRate'] },
    { name: 'Investors & financing', match: ['baselineCapRate', 'capRateMortgageBeta', 'capRateInvestorCompression', 'investorDemandIntensity'] },
  ],
  A10: [
    { name: 'Market patience — the yield response', match: ['laubachLevelBeta', 'laubachDeficitBeta', 'termPremium', 'neutralRealRate', 'credibilityHorizonYears', 'inflationConvergenceYears', 'fiscalRiskPremiumMax'] },
    { name: 'Debt mechanics — maturity', match: ['baseWeightedAverageMaturity', 'minWeightedAverageMaturity', 'maxWeightedAverageMaturity', 'maturityStressSensitivity'] },
    { name: 'The monetization limit', match: ['monetizationDominanceThreshold', 'monetizationPremiumCoCondition', 'monetizationTransmissionSensitivity', 'fiscalDominanceThreshold', 'fiscalDominanceDampening', 'effectiveLowerBound', 'consolidationCreditMax'] },
  ],
  A13: [
    { name: 'Which forecast runs', match: ['fiscalPolicyPreset'] },
    { name: 'What Congress cuts or raises', match: ['FiscalPolicyProfile.maxDiscretionaryCut', 'FiscalPolicyProfile.maxObligationCut', 'FiscalPolicyProfile.maxRevenueIncrease'] },
    { name: 'Consolidation triggers & timing', match: ['FiscalPolicyProfile.consolidationThreshold', 'FiscalPolicyProfile.consolidationMaxThreshold', 'FiscalPolicyProfile.consolidationLag', 'FiscalPolicyProfile.marketPricesConsolidation', 'fiscalCredibilityTrigger', 'fiscalAdjustmentHorizonYears'] },
    { name: 'Cost-of-living dampening', match: ['FiscalPolicyProfile.colaDampeningRate', 'FiscalPolicyProfile.colaDampeningThreshold', 'FiscalPolicyProfile.colaDampeningMaxCIF'] },
  ],
  A14: [
    { name: 'Which forecast runs', match: ['federalReservePreset'] },
    { name: 'The reaction rule', match: ['FederalReserveProfile.taylorInflationCoeff', 'FederalReserveProfile.taylorOutputGapCoeff', 'FederalReserveProfile.taylorEmploymentGapCoeff', 'taylorSmoothing', 'inflationTarget'] },
    { name: 'Balance-sheet operations', match: ['FederalReserveProfile.qeMonetizationRate', 'FederalReserveProfile.maxFinancialRepressionRate', 'FederalReserveProfile.yieldResponseThreshold', 'FederalReserveProfile.maxYieldResponseRate'] },
  ],
  'Supply-chain conditions': [
    { name: 'Current conditions — indices', match: ['supplyChainConfig.inputs.'] },
    { name: 'Resilience', match: ['supplyChainConfig.resilience.'] },
    // the trainingDynamics token moved to N1 with its keys (the merge).
    { name: 'Frontier training cost structure', match: ['supplyChainConfig.trainingComposition.', 'supplyChainConfig.trainingScaleGrowthRate'] },
    { name: 'Pass-through & procurement', match: ['supplyChainConfig.costPassThroughRate', 'supplyChainConfig.consumerPassThroughRate', 'supplyChainConfig.procurementShares.', 'supplyChainConfig.costVsProcurementBlend', 'supplyChainConfig.sensitivityBlendCognitive', 'supplyChainConfig.sensitivityBlendEmbodied'] },
    { name: 'Cascades & friction', match: ['supplyChainConfig.chipCascadeLag', 'supplyChainConfig.chipCascadeCostPremium', 'supplyChainConfig.regulatoryFriction'] },
    { name: 'Frontier stock & rebuild', match: ['supplyChainConfig.frontierDrainScale', 'supplyChainConfig.frontierRebuildYears', 'supplyChainConfig.frontierRateElasticity', 'supplyChainConfig.frontierInnovationElasticity', 'supplyChainConfig.resilienceOnsetYears', 'flywheelStarvationThreshold', 'frontierCostElasticity'] },
  ],
  'Support programs': [
    { name: 'Minimum wage', match: ['policyConfig.minimumWage.'] },
    { name: 'Wage subsidy', match: ['policyConfig.wageSubsidy.'] },
    { name: 'Sovereign wealth fund', match: ['policyConfig.sovereignWealthFund.'] },
    { name: 'Profit sharing', match: ['policyConfig.profitSharing.'] },
    { name: 'Universal basic income', match: ['policyConfig.ubi.'] },
    { name: 'Unemployment insurance', match: ['policyConfig.enhancedUI.'] },
    { name: 'Retraining', match: ['policyConfig.retraining.'] },
  ],
};

function subgroupMatches(token: string, key: string): boolean {
  return token.endsWith('.') ? key.startsWith(token) : key === token;
}

/**
 * THE AXIS ANSWER (IA-2): what the collapsed axis header shows before opening — the
 * current answer (explicit selection in gold; the quiet consensus otherwise) and how
 * many of the axis's dials the user's edits shadow. Pure and exported so the
 * header≡composition test exercises the same derivation the header renders.
 */
export function axisAnswerState(
  axis: string,
  recordedAxes: Partial<Record<string, string>>,
  provenance: Record<string, { shadowed: boolean }>,
): { label: string; explicit: boolean; shadows: number } {
  const recorded = recordedAxes[axis];
  const variant = recorded ?? CONSENSUS_VARIANT[axis];
  const m = ALL_VARIANT_MANIFESTS.find((v) => v.axis === axis && v.variant === variant);
  let shadows = 0;
  for (const e of ADVANCED_GRID_REGISTRY.values()) {
    if (e.row.axis === axis && provenance[e.row.key]?.shadowed) shadows++;
  }
  return {
    label: m?.displayName ?? m?.variant ?? variant ?? '—',
    explicit: recorded !== undefined,
    shadows,
  };
}

/** The sub-group cell a key belongs to within its rendered group (undefined when the
 *  group has no sub-groups). */
export function subgroupNameFor(groupId: string, key: string): string | undefined {
  const defs = GRID_SUBGROUPS[groupId];
  if (!defs) return undefined;
  return defs.find((d) => d.match.some((m) => subgroupMatches(m, key)))?.name;
}

/**
 * THE CONTEXT BREADCRUMB (IA amendment 1): "group · sub-group" for a key, rendered
 * wherever rows appear FLAT (search results, the diff view) — the disambiguation the
 * sub-group layer buys must survive flattening ("Floor" stays unambiguous exactly
 * where users search for it). Total over the registry, test-asserted.
 */
export function breadcrumbFor(key: string): string {
  const e = ADVANCED_GRID_REGISTRY.get(key);
  if (!e) return '';
  const gid = e.row.species === 'BELIEF' && e.row.axis
    ? e.row.axis
    : (GRID_GROUP_NAMES[e.row.axis ?? e.row.key.split('.')[0] ?? 'other'] ?? 'other');
  const gLabel = e.row.species === 'BELIEF' && e.row.axis
    ? (AXIS_SHORT_FORMS[e.row.axis] ?? e.row.axis)
    : gid;
  const sub = subgroupNameFor(gid, key);
  return sub ? `${gLabel} · ${sub}` : gLabel;
}

/** Order a group's entries into rendered cells (authored order; a single null-name
 *  cell when the group has no sub-groups). */
export function subgroupCells(groupId: string, entries: readonly GridEntry[]): Array<{ name: string | null; entries: GridEntry[] }> {
  const defs = GRID_SUBGROUPS[groupId];
  if (!defs) return [{ name: null, entries: [...entries] }];
  return defs
    .map((d) => ({
      name: d.name as string | null,
      entries: entries.filter((e) => d.match.some((m) => subgroupMatches(m, e.row.key))),
    }))
    .filter((c) => c.entries.length > 0);
}

/**
 * R3c (P1-5): the grid filter — a PURE predicate (test-tested apart from the DOM).
 * query: every whitespace-separated term must appear in title+key+explanation;
 * chips: citation class, set-by-my-worldview (provenance present), shadowed,
 * has-explanation.
 */
export interface GridFilter {
  query: string;
  cite: 'cited' | 'episode' | 'honest-uncertainty' | null;
  worldview: boolean;
  shadowed: boolean;
  explained: boolean;
}
export const EMPTY_FILTER: GridFilter = { query: '', cite: null, worldview: false, shadowed: false, explained: false };
export function filterIsActive(f: GridFilter): boolean {
  return f.query.trim() !== '' || f.cite !== null || f.worldview || f.shadowed || f.explained;
}
export function gridRowMatches(
  entry: GridEntry,
  f: GridFilter,
  prov: Record<string, { shadowed: boolean }>,
  explanation: string | undefined,
): boolean {
  if (f.cite && entry.row.citationClass !== f.cite) return false;
  const p = prov[entry.row.key];
  if (f.worldview && !p) return false;
  if (f.shadowed && !p?.shadowed) return false;
  if (f.explained && !explanation) return false;
  const q = f.query.trim().toLowerCase();
  if (q) {
    const hay = `${entry.row.title} ${entry.row.key} ${explanation ?? ''}`.toLowerCase();
    for (const term of q.split(/\s+/)) if (!hay.includes(term)) return false;
  }
  return true;
}

/**
 * R3c (P1-8): the diff-from-default selector — every scalar dial whose EFFECTIVE value
 * differs from its table default (the scenario-summary table). Containers, per-year
 * vehicle rows, and UNSET optional/derived defaults are excluded (their owners display
 * them); a DEFINED value on an optional/derived default IS a change (default: null).
 * At defaults with an empty composition the diff set is EMPTY — the identity's UI face
 * (test-asserted).
 */
export interface DiffRow { entry: GridEntry; value: number | string | boolean; defaultValue: number | string | boolean | null }
export function diffAgainstDefaults(effective: SimulationConfig): DiffRow[] {
  const out: DiffRow[] = [];
  for (const e of ADVANCED_GRID_REGISTRY.values()) {
    const row = e.row;
    if (row.species === 'OVERRIDE-VEHICLE') continue;
    const v = getDeep(effective as unknown as Record<string, unknown>, row.key);
    if (v === undefined || v === null || typeof v === 'object') continue;
    const d = row.default;
    if (typeof d === 'string' && (d.startsWith('undefined') || d.startsWith('derived') || d.startsWith('init-derived'))) {
      out.push({ entry: e, value: v as number | string | boolean, defaultValue: null });
      continue;
    }
    const equal = typeof v === 'number' && typeof d === 'number'
      ? Math.abs(v - d) < 1e-12
      : String(v) === String(d) || (typeof d === 'string' && String(v) === d.replace(/'/g, ''));
    if (!equal) out.push({ entry: e, value: v as number | string | boolean, defaultValue: d });
  }
  return out;
}

/**
 * R3c (S6, the duplicate retirement): the editor-class AUTHOR MAP — which mounted
 * surface owns each editor-owned key family (anchor ids match the Advanced view's
 * section anchors; the deep-link work targets them). Keys in NO_OWNER_LEDGER have NO
 * editor surface in this build — the grid states that honestly instead of pointing at
 * nothing; the ledger is exact-set asserted so a gap can never be silent.
 */
export interface EditorOwner {
  component: string;
  /** An anchor inside the Advanced view (deep-link target). */
  anchor?: string;
  /** The author lives on another view (the Occupations detail page). */
  view?: 'occupations';
  /** The author renders EMBEDDED inside this grid group (no pointer needed). */
  embedded?: string;
}
export const EDITOR_OWNERS: Record<string, EditorOwner> = {
  // the cluster & role editors live WITH the cluster on the Occupations detail page
  bfcsOverrides: { component: 'BFCSEditor', view: 'occupations' },
  clusterAutomationShareOverrides: { component: 'ClusterAlphaEditor', view: 'occupations' },
  roleReplacementFrictionYearsOverrides: { component: 'ReplacementDifficultyEditor', view: 'occupations' },
  roleReplacementDifficultyWagePremiumOverrides: { component: 'ReplacementDifficultyEditor', view: 'occupations' },
  // the policy editors render EMBEDDED inside their own grid groups
  'taxConfig': { component: 'TaxRateControls', embedded: 'Taxation' },
  'policyConfig.': { component: 'PolicyControls', embedded: 'Support programs' },
  policyRateSchedule: { component: 'PolicyRateScheduleSection', embedded: 'Policy rate schedule' },
  fiscalPolicyPreset: { component: 'FiscalResponseSection', anchor: 'editor-fiscal-response' },
  federalReservePreset: { component: 'FiscalResponseSection', anchor: 'editor-fiscal-response' },
  fiscalPolicyCustom: { component: 'FiscalResponseSection', anchor: 'editor-fiscal-response' },
  federalReserveCustom: { component: 'FiscalResponseSection', anchor: 'editor-fiscal-response' },
  'FiscalPolicyProfile.': { component: 'FiscalResponseSection', anchor: 'editor-fiscal-response' },
  'FederalReserveProfile.': { component: 'FiscalResponseSection', anchor: 'editor-fiscal-response' },
  // stateOverrides: unmounted by recorded design decision — ledgered below, not owned
  'cashTransferPerUnemployed': { component: 'PolicyControls', embedded: 'Support programs' },
  'inKindTransferPerUnemployed': { component: 'PolicyControls', embedded: 'Support programs' },
};

/**
 * THE READ SIDE OF A GRID ROW (the sidebar→Advanced binding fix): the value a
 * value-rendering control displays comes from the EFFECTIVE config the simulation
 * consumed — composed keys show the variant/event/package value, shadowed keys show
 * the user's winning value, unselected keys show the default. Writes go to user
 * config (unchanged). Exported pure so the render-binding test exercises the same
 * derivation the component renders.
 */
export function effectiveRowValue(effective: SimulationConfig, row: DialRow): { raw: unknown; value: number } {
  const raw = getDeep(effective as unknown as Record<string, unknown>, row.key);
  const value = typeof raw === 'number' ? raw : (typeof row.default === 'number' ? row.default : 0);
  return { raw, value };
}

/** R3c (P1-7): the model author record for an editor-class key (undefined ⇒ no author). */
export function ownerFor(key: string): EditorOwner | undefined {
  const p = Object.keys(EDITOR_OWNERS).find((pre) => key === pre || key.startsWith(pre));
  return p ? EDITOR_OWNERS[p] : undefined;
}

/** DEPRECATED shim (anchor-only callers): prefer ownerFor. */
export function ownerAnchorFor(key: string): string | undefined {
  return ownerFor(key)?.anchor;
}

/** Editor-class keys with NO author surface in this build (exact set, test-asserted).
 *  Derived-default numerics state their runtime derivation; containers state absence. */
export const NO_OWNER_LEDGER: Record<string, string> = {
  'clusterOverrides.generativeWeight': 'per-cluster container — no editor surface in this build',
  'clusterOverrides.agenticWeight': 'per-cluster container — no editor surface in this build',
  'clusterOverrides.embodiedWeight': 'per-cluster container — no editor surface in this build',
  'clusterOverrides.deploymentLag': 'per-cluster container — no editor surface in this build',
  'clusterOverrides.adoptionSteepness': 'per-cluster container — no editor surface in this build',
  'clusterOverrides.adoptionCeiling': 'per-cluster container — no editor surface in this build',
  'clusterOverrides.deflationIntensity': 'per-cluster container — no editor surface in this build',
  'clusterOverrides.wageElasticity': 'per-cluster container — no editor surface in this build',
  'deflationIntensityOverrides': 'per-cluster container — no editor surface in this build',
  'roleAutomationShareOverrides': 'per-role container — no editor surface in this build',
  'aiCostParams.composition': 'per-deployment weight table — no editor surface in this build',
  'roleEstimation.useClusterRoleShares': 'applied once at data load — not adjustable at run time',
  'roleEstimation.wageScalingMethod': 'applied once at data load — not adjustable at run time',
  'roleEstimation.skewFactorScale': 'applied once at data load — not adjustable at run time',
  'creditBarRealTrend': 'derived at run time from growth and pass-through settings',
  'demandTrendGrowth': 'derived at run time from growth and population settings',
  'nonShelterBaseInflation': 'derived at run time from the price-index weights',
  'otherCostsShare': 'derived at run time from the income-share identity',
  'assetShareDriftRate': 'derived at run time from payout and tax settings',
  'mortgageRateReference': 'derived at run time from the yield path',
  'builderPriceMode': 'two-mode dial (trend-aware / spot) — no selector surface in this build',
  'stateOverrides': 'state-level overrides — not exposed in this build',
  'stateOverrides[state].additionalUBI': 'state-level overrides — not exposed in this build',
  'stateOverrides[state].uiReplacementRate': 'state-level overrides — not exposed in this build',
};

/**
 * R3c (P0-2, human names): authored names for every non-belief grid group. The group
 * key is `row.axis ?? first key segment`; several singleton scalar keys COALESCE into
 * one authored thematic group (multiple keys mapping to one name) — density earned,
 * no raw config prefixes as headers. Completeness over the registry's actual group
 * keys is asserted permanently (the composition tests).
 */
export const GRID_GROUP_NAMES: Record<string, string> = {
  // ── POLICY tab ──
  policyConfig: 'Support programs',
  taxConfig: 'Taxation',
  policyRateSchedule: 'Policy rate schedule',
  stateOverrides: 'State policy overrides',
  'stateOverrides[state]': 'State policy overrides',
  cashTransferPerUnemployed: 'Direct transfer levels',
  inKindTransferPerUnemployed: 'Direct transfer levels',
  // ── EVENT tab ──
  supplyChainConfig: 'Supply-chain conditions',
  // The flywheel dials (root-level, always-on) render under the same header.
  flywheelStarvationThreshold: 'Supply-chain conditions',
  frontierCostElasticity: 'Supply-chain conditions',
  // the buildout dials (root-level scalars).
  aiRetentionShare: 'AI buildout',
  buildoutAllocSmoothing: 'AI buildout',
  aiBuildoutSeamAnchor: 'AI buildout',
  unitsPerEmbodiedWorker: 'AI buildout',
  equityIssuanceRate: 'AI buildout',
  aiRdIntensity: 'AI buildout',
  fleetAllocSmoothing: 'AI buildout',
  // The pass-through credit dials (root-level) render under the credit header.
  creditDeflationPersistence: 'Credit & financial system',
  creditDeflationNoiseFloor: 'Credit & financial system',
  // The the valuation-guard work valuation fix's ERP dial (root-level) renders under the same header.
  erpCrisisSensitivity: 'Credit & financial system',
  // ── INFRA tab (coalesced thematic groups) ──
  startYear: 'Simulation window',
  endYear: 'Simulation window',
  totalPopulation: 'Population & labor force',
  laborForce: 'Population & labor force',
  populationGrowthRate: 'Population & labor force',
  baseInflationRate: 'Baseline inflation',
  nonShelterBaseInflation: 'Baseline inflation',
  baselineGDPGrowth: 'Growth & demand trend',
  demandTrendGrowth: 'Growth & demand trend',
  demandSpilloverTolerance: 'Growth & demand trend',
  creditBarRealTrend: 'Growth & demand trend',
  shelterCPIWeight: 'Consumer-price basket weights',
  foodEnergyCPIWeight: 'Consumer-price basket weights',
  laborServicesCPIWeight: 'Consumer-price basket weights',
  aiExposedCPIWeight: 'Consumer-price basket weights',
  pceCpiWedge: 'Price-measure proxy (PCE)',
  pceFormulaEffect: 'Price-measure proxy (PCE)',
  usePceProxy: 'Price-measure proxy (PCE)',
  laborCostShare: 'Cost & income shares',
  otherCostsShare: 'Cost & income shares',
  corporateRetentionRate: 'Cost & income shares',
  assetShareDriftRate: 'Cost & income shares',
  landIncomeBeta: 'Housing finance anchors',
  landRateSensitivity: 'Housing finance anchors',
  rentCostAnchorWeight: 'Housing finance anchors',
  mortgageRateReference: 'Housing finance anchors',
  marketAnchorInit: 'Housing finance anchors',
  adoptionParams: 'Adoption machinery',
  aiCostParams: 'AI cost composition',
  bfcsOverrides: 'Per-cluster & per-role overrides',
  clusterOverrides: 'Per-cluster & per-role overrides',
  clusterAutomationShareOverrides: 'Per-cluster & per-role overrides',
  roleAutomationShareOverrides: 'Per-cluster & per-role overrides',
  roleReplacementFrictionYearsOverrides: 'Per-cluster & per-role overrides',
  roleReplacementDifficultyWagePremiumOverrides: 'Per-cluster & per-role overrides',
  deflationIntensityOverrides: 'Per-cluster & per-role overrides',
  otherUncategorizedMultiplierOverride: 'Per-cluster & per-role overrides',
  roleEstimation: 'Role estimation heuristics',
  fiscalPolicyCustom: 'Profile custom overlays',
  federalReserveCustom: 'Profile custom overlays',
  parameterOverrides: 'Per-year override vehicle',
};
