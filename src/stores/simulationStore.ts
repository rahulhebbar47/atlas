/**
 * ATLAS Simulation Store
 *
 * Central state management for the entire application.
 * Holds all model parameters and computed simulation output.
 *
 * On every config mutation, re-runs runSimulation() and stores the result.
 * The simulation is fast (~5-10ms for 26 years x 51 clusters) so no
 * debouncing is needed.
 *
 * Phase 3: Loads real BLS data at module initialization and passes it
 * to the simulation engine for real employment/wage baselines.
 *
 * Uses Zustand v5 with subscribeWithSelector for efficient re-renders.
 */

import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import type {
  SimulationConfig,
  SimulationTimeline,
  CapabilityVectorId,
  CapabilityTrajectoryParams,
  OccupationBaseline,
  BLSMetadata,
  BFCSThresholds,
  DashboardView,
  PolicyConfig,
  StateData,
  StateCode,
  PolicySchedule,
} from '@/types';
import { runSimulation, getDefaultSimulationConfig } from '@/models/simulation';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { loadBLSData } from '@/services/dataLoader';
import { transformOEWSToBaselines, createOtherClusterBaseline } from '@/services/dataTransform';
import { deriveStateOccupationDistributions, populateStateDistributions } from '@/data/stateTransform';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
import { DEFAULT_POLICY_CONFIG, POLICY_PRESETS, DEFAULT_AI_COST_PARAMS } from '@/models/constants';
import { parseParameterCSV, buildConfigFromCSV } from '@/utils/csvImport';
import { flatToSchedule } from '@/utils/policyInterpolation';
import { validateConfig } from '@/utils/validateConfig';
import type { FiscalDimensionKey, FedDimensionKey } from '@/types/fiscalDimensions';
import {
  dimensionPositionsToProfileFields, presetToDimensionPositions,
  fedDimensionPositionsToProfileFields, fedPresetToDimensionPositions,
} from '@/models/fiscalDimensions';
// DEPRECATED Phase 8 Fix 4: FISCAL_RESPONSE_PRESETS and resolveFiscalProfile replaced by split presets
// import { FISCAL_RESPONSE_PRESETS, resolveFiscalProfile } from '@/models/fiscalResponseProfiles';
import {
  resolveCombinedProfile,
  DEFAULT_FISCAL_POLICY_PRESET,
  DEFAULT_FEDERAL_RESERVE_PRESET,
  FISCAL_POLICY_PRESETS,
  FEDERAL_RESERVE_PRESETS,
} from '@/models/fiscalResponseProfiles';

// ============================================================
// BLS Data Initialization (runs once at module load)
// ============================================================

let blsBaselines: Map<string, OccupationBaseline> | null = null;
let blsMetadataResult: BLSMetadata | null = null;
let blsWarningsResult: string[] = [];
let blsErrorResult: string | null = null;
let stateDataMapResult: Map<StateCode, StateData> | null = null;

const blsResult = loadBLSData();
if (blsResult.isLoaded) {
  const transformed = transformOEWSToBaselines(
    blsResult.oews,
    OCCUPATION_CLUSTERS,
    DEFAULT_ROLE_ESTIMATION_CONFIG,
  );
  blsBaselines = transformed.baselines;
  blsMetadataResult = blsResult.metadata;
  blsWarningsResult = [...blsResult.warnings, ...transformed.warnings];

  // FIX: Create synthetic baseline for "Other / Uncategorized" cluster.
  // OEWS data covers ~74M of ~158M CES total nonfarm employment. The Other cluster
  // fills the gap so macro calculations use the full CES employment as the denominator.
  const otherCluster = OCCUPATION_CLUSTERS.find(c => c.id === 'other_uncategorized');
  if (otherCluster && !blsBaselines.has('other_uncategorized')) {
    const otherBaseline = createOtherClusterBaseline(blsBaselines, otherCluster);
    blsBaselines.set('other_uncategorized', otherBaseline);
    console.log(`[ATLAS] Other/Uncategorized cluster: ${otherBaseline.totalEmployment.toLocaleString()} workers (CES gap fill)`);
  }

  // Phase 6: Load state data if available
  if (blsResult.stateOEWS && blsResult.stateLAUS && blsBaselines) {
    const stateResult = deriveStateOccupationDistributions(
      blsResult.stateOEWS,
      blsResult.stateLAUS,
      blsBaselines,
    );
    stateDataMapResult = stateResult.stateDataMap;
    blsWarningsResult.push(...stateResult.warnings);

    // Populate stateDistribution on national baselines
    populateStateDistributions(blsBaselines, stateDataMapResult);

    console.log(`[ATLAS] State data loaded: ${stateDataMapResult.size} states`);
  }
} else {
  blsErrorResult = blsResult.errorMessage;
  console.error(`[ATLAS] ${blsResult.errorMessage}`);
}

// ============================================================
// Migration: Phase 5e — convert flat policy numbers to PolicySchedule
// ============================================================

/** The 9 policy fields that changed from number to PolicySchedule in Phase 5e. */
const SCHEDULE_FIELDS: Array<{ policyKey: keyof SimulationConfig['policyConfig']; field: string }> = [
  { policyKey: 'minimumWage', field: 'federalMinimum' },
  { policyKey: 'wageSubsidy', field: 'subsidyPercentage' },
  { policyKey: 'workWeekReduction', field: 'standardHours' },
  { policyKey: 'sovereignWealthFund', field: 'annualContribution' },
  { policyKey: 'sovereignWealthFund', field: 'ownershipFraction' },
  { policyKey: 'profitSharing', field: 'mandatorySharePercentage' },
  { policyKey: 'ubi', field: 'monthlyAmount' },
  { policyKey: 'enhancedUI', field: 'replacementRate' },
  { policyKey: 'retraining', field: 'stipendMonthly' },
];

function migratePolicySchedules(config: SimulationConfig): void {
  for (const { policyKey, field } of SCHEDULE_FIELDS) {
    const policy = config.policyConfig[policyKey] as unknown as Record<string, unknown>;
    const val = policy[field];
    // If it's a raw number (old format), convert to PolicySchedule
    if (typeof val === 'number') {
      policy[field] = flatToSchedule(val) as unknown as PolicySchedule;
    }
    // If it's null/undefined, set to empty schedule
    if (val == null || (typeof val === 'object' && !(val as PolicySchedule).keyframes)) {
      policy[field] = { keyframes: [] };
    }
  }
}

// ============================================================
// Helper: run simulation and return fresh timeline
// ============================================================

// Phase 8b: Module-level override state for recompute.
// Updated by store actions that modify overrides. This avoids
// threading parameterOverrides through every existing recompute() call.
let currentParameterOverrides: Record<string, number> = {};

function recompute(config: SimulationConfig, parameterOverrides?: Record<string, number>): SimulationTimeline {
  // Phase 8b: Use explicitly passed overrides, or fall back to module-level state
  const overridesObj = parameterOverrides ?? currentParameterOverrides;
  let overrideMap: Map<string, number> | undefined;
  if (Object.keys(overridesObj).length > 0) {
    overrideMap = new Map(Object.entries(overridesObj));
  }
  return runSimulation(
    config,
    OCCUPATION_CLUSTERS,
    blsBaselines ?? undefined,
    stateDataMapResult ?? undefined,
    overrideMap,
  );
}

/**
 * Access the module-level BLS baselines.
 * Needed by compare mode hooks (Phase 5 Step 7) which run
 * runSimulation() independently with different policy configs.
 */
export function getBLSBaselines(): Map<string, OccupationBaseline> | undefined {
  return blsBaselines ?? undefined;
}

// ============================================================
// Store Interface
// ============================================================

export interface SimulationState {
  // === Configuration (user-adjustable) ===
  config: SimulationConfig;

  // === Timeline navigation ===
  currentYear: number;
  isPlaying: boolean;

  // === Panel visibility ===
  controlsPanelOpen: boolean;
  insightsPanelOpen: boolean;

  // === Dashboard navigation (Phase 4) ===
  activeView: DashboardView;
  selectedClusterId: string | null;

  // === Computed simulation output ===
  timeline: SimulationTimeline;

  // === BLS Data State (Phase 3) ===
  blsDataLoaded: boolean;
  blsDataError: string | null;
  blsMetadata: BLSMetadata | null;
  blsWarnings: string[];

  // === State Data State (Phase 6) ===
  stateDataLoaded: boolean;
  selectedStateCode: StateCode | null;
  comparisonStateCodes: StateCode[];
  stateMapMetric: 'displacement' | 'unemploymentRate' | 'policyEffectiveness';

  // === Actions: State (Phase 6) ===
  setSelectedState: (code: StateCode | null) => void;
  setStateMapMetric: (metric: 'displacement' | 'unemploymentRate' | 'policyEffectiveness') => void;
  addComparisonState: (code: StateCode) => void;
  removeComparisonState: (code: StateCode) => void;
  clearComparisonStates: () => void;
  setStatePolicyOverride: (
    stateCode: StateCode,
    field: keyof import('@/types').StatePolicyOverride,
    value: number | string,
  ) => void;
  resetStatePolicyOverride: (stateCode: StateCode) => void;

  // === Actions: Capability parameters ===
  setCapabilityParam: (
    vectorId: CapabilityVectorId,
    param: keyof CapabilityTrajectoryParams,
    value: number,
  ) => void;

  // === Actions: Timeline ===
  setStartYear: (year: number) => void;
  setEndYear: (year: number) => void;
  setCurrentYear: (year: number) => void;
  togglePlay: () => void;
  stopPlay: () => void;

  // === Actions: Panel visibility ===
  setControlsPanelOpen: (open: boolean) => void;
  setInsightsPanelOpen: (open: boolean) => void;

  // === Actions: Dashboard navigation (Phase 4) ===
  setActiveView: (view: DashboardView) => void;
  setSelectedCluster: (id: string | null) => void;

  // === Actions: BFCS Threshold Overrides (Phase 4) ===
  setBFCSThreshold: (
    clusterId: string,
    roleId: string,
    dimension: keyof BFCSThresholds,
    value: number,
  ) => void;
  resetClusterBFCS: (clusterId: string) => void;
  resetRoleBFCS: (clusterId: string, roleId: string) => void;

  // === Actions: Policy (Phase 5) ===
  setPolicyPreset: (presetId: string) => void;
  togglePolicy: (policyKey: keyof PolicyConfig, enabled: boolean) => void;
  updatePolicyParam: <K extends keyof PolicyConfig>(
    policyKey: K,
    update: Partial<PolicyConfig[K]>,
  ) => void;
  resetPolicyToDefaults: () => void;

  // === Compare Mode (Phase 5) ===
  compareMode: boolean;
  comparisonPolicyConfigs: Array<{ label: string; config: PolicyConfig }>;
  toggleCompareMode: () => void;
  setComparisonSlot: (index: number, label: string, config: PolicyConfig) => void;
  addComparisonSlot: (label: string, config: PolicyConfig) => void;
  removeComparisonSlot: (index: number) => void;

  // === Presentation Mode (Phase 7) ===
  presentationMode: boolean;
  presentationStep: number;

  // === Actions: Presentation Mode (Phase 7) ===
  togglePresentationMode: () => void;
  setPresentationStep: (step: number) => void;
  nextPresentationStep: () => void;
  prevPresentationStep: () => void;

  // === Onboarding (Phase 7) ===
  onboardingComplete: boolean;
  onboardingStep: number;
  setOnboardingComplete: (complete: boolean) => void;
  setOnboardingStep: (step: number) => void;

  // === Fiscal Onboarding (Phase 8d) ===
  fiscalOnboardingComplete: boolean;
  fiscalOnboardingStep: number;
  setFiscalOnboardingComplete: (complete: boolean) => void;
  setFiscalOnboardingStep: (step: number) => void;

  // === Actions: Scenario Save/Load (Phase 7) ===
  loadScenario: (config: SimulationConfig) => void;

  // === Actions: CSV Import ===
  importCSVConfig: (csvString: string) => { importedCount: number; warnings: string[] };

  // === Actions: Generic config update ===
  updateConfig: (updater: (config: SimulationConfig) => SimulationConfig) => void;

  // === Phase 8b: Per-Year Parameter Overrides ===
  parameterOverrides: Record<string, number>;
  setParameterOverride: (paramKey: string, year: number, value: number) => void;
  removeParameterOverride: (paramKey: string, year: number) => void;
  clearParameterOverrides: () => void;

  // === Phase 8c: Fiscal Response UI ===
  showBaselineComparison: boolean;
  baselineTimeline: SimulationTimeline | null;
  // DEPRECATED Phase 8 Fix 4: setFiscalResponsePreset replaced by split preset actions
  // setFiscalResponsePreset: (presetId: string) => void;
  setFiscalPolicyPreset: (presetId: string) => void;
  setFederalReservePreset: (presetId: string) => void;
  setFiscalDimension: (dimension: FiscalDimensionKey, position: number) => void;
  setFedDimension: (dimension: FedDimensionKey, position: number) => void;
  toggleBaselineComparison: () => void;
  resetYearOverrides: (year: number) => void;

  // === Phase 8d: Profile Comparison ===
  fiscalComparisonProfile: string | null;
  setFiscalComparisonProfile: (profileName: string | null) => void;

  // === Phase 10.A: Alpha Drivers + Augmentation + Scarcity + Inference Curve ===
  setAlphaDriverParams: (params: SimulationConfig['alphaDriverParams']) => void;
  setAugmentationAdoptionSteepness: (value: number) => void;
  setTokenCostCurve: (curve: NonNullable<SimulationConfig['aiCostParams']>['tokenCostCurve']) => void;
  setScarcityIntensity: (value: number) => void;
  setCompetitivePressureThreshold: (value: number) => void;
  setReplacementMultiplier: (value: number) => void;
  // DEPRECATED (Phase 10.A fix #2): setMaxAdoptionFrictionYears removed; friction is now direct years per role.
  setClusterAlpha: (clusterId: string, value: number) => void;
  setRoleAlphaOverride: (clusterId: string, roleId: string, value: number) => void;
  setRoleReplacementFrictionYears: (clusterId: string, roleId: string, value: number) => void;
  setRoleReplacementDifficultyWagePremium: (clusterId: string, roleId: string, value: number) => void;

  // === Actions: Reset ===
  resetToDefaults: () => void;
}

// ============================================================
// Store Creation
// ============================================================

const defaultConfig = getDefaultSimulationConfig();
const initialTimeline = recompute(defaultConfig);

export const useSimulationStore = create<SimulationState>()(
  persist(
  subscribeWithSelector((set) => ({
    // Initial state
    config: defaultConfig,
    currentYear: defaultConfig.startYear,
    isPlaying: false,
    controlsPanelOpen: true,
    insightsPanelOpen: true,
    activeView: 'overview' as DashboardView,
    selectedClusterId: null,
    timeline: initialTimeline,

    // BLS data state (Phase 3)
    blsDataLoaded: blsBaselines !== null,
    blsDataError: blsErrorResult,
    blsMetadata: blsMetadataResult,
    blsWarnings: blsWarningsResult,

    // Phase 8b: Per-year parameter overrides
    parameterOverrides: {},

    // State data state (Phase 6)
    stateDataLoaded: stateDataMapResult !== null && stateDataMapResult.size > 0,
    selectedStateCode: null,
    comparisonStateCodes: [],
    stateMapMetric: 'displacement' as const,

    // State actions (Phase 6)
    setSelectedState: (code) => set(() => ({ selectedStateCode: code })),

    setStateMapMetric: (metric) => set(() => ({ stateMapMetric: metric })),

    addComparisonState: (code) =>
      set((state) => {
        if (state.comparisonStateCodes.includes(code)) return state;
        if (state.comparisonStateCodes.length >= 3) return state;
        return { comparisonStateCodes: [...state.comparisonStateCodes, code] };
      }),

    removeComparisonState: (code) =>
      set((state) => ({
        comparisonStateCodes: state.comparisonStateCodes.filter((c) => c !== code),
      })),

    clearComparisonStates: () => set(() => ({ comparisonStateCodes: [] })),

    setStatePolicyOverride: (stateCode, field, value) =>
      set((state) => {
        const currentOverrides = state.config.stateOverrides ?? {};
        const currentStateOverride = currentOverrides[stateCode] ?? {};
        const newConfig: SimulationConfig = {
          ...state.config,
          stateOverrides: {
            ...currentOverrides,
            [stateCode]: {
              ...currentStateOverride,
              [field]: value,
            },
          },
        };
        return {
          config: newConfig,
          timeline: recompute(newConfig),
        };
      }),

    resetStatePolicyOverride: (stateCode) =>
      set((state) => {
        const { [stateCode]: _removed, ...rest } = state.config.stateOverrides ?? {};
        const newConfig: SimulationConfig = {
          ...state.config,
          stateOverrides: rest,
        };
        return {
          config: newConfig,
          timeline: recompute(newConfig),
        };
      }),

    // Capability parameter setter — updates one param of one vector
    setCapabilityParam: (vectorId, param, value) =>
      set((state) => {
        const newConfig: SimulationConfig = {
          ...state.config,
          capabilities: {
            ...state.config.capabilities,
            [vectorId]: {
              ...state.config.capabilities[vectorId],
              [param]: value,
            },
          },
        };
        return {
          config: newConfig,
          timeline: recompute(newConfig),
        };
      }),

    // Timeline year setters
    setStartYear: (year) =>
      set((state) => {
        const newConfig = { ...state.config, startYear: year };
        const newCurrentYear = Math.max(state.currentYear, year);
        return {
          config: newConfig,
          currentYear: newCurrentYear,
          timeline: recompute(newConfig),
        };
      }),

    setEndYear: (year) =>
      set((state) => {
        const newConfig = { ...state.config, endYear: year };
        const newCurrentYear = Math.min(state.currentYear, year);
        return {
          config: newConfig,
          currentYear: newCurrentYear,
          timeline: recompute(newConfig),
        };
      }),

    setCurrentYear: (year) =>
      set((state) => ({
        currentYear: Math.max(
          state.config.startYear,
          Math.min(year, state.config.endYear),
        ),
      })),

    togglePlay: () =>
      set((state) => ({ isPlaying: !state.isPlaying })),

    stopPlay: () =>
      set(() => ({ isPlaying: false })),

    // Panel visibility
    setControlsPanelOpen: (open) => set(() => ({ controlsPanelOpen: open })),
    setInsightsPanelOpen: (open) => set(() => ({ insightsPanelOpen: open })),

    // Dashboard navigation (Phase 4)
    setActiveView: (view) => set(() => ({ activeView: view })),
    setSelectedCluster: (id) => set(() => ({ selectedClusterId: id })),

    // BFCS Threshold Overrides (Phase 4)
    setBFCSThreshold: (clusterId, roleId, dimension, value) =>
      set((state) => {
        // Find default thresholds for this role
        const cluster = OCCUPATION_CLUSTERS.find((c) => c.id === clusterId);
        const role = cluster?.roles.find((r) => r.id === roleId);
        if (!role) return state;

        // Start from current override or defaults
        const currentOverrides = state.config.bfcsOverrides[clusterId]?.[roleId]
          ?? role.bfcsThresholds;

        const newConfig: SimulationConfig = {
          ...state.config,
          bfcsOverrides: {
            ...state.config.bfcsOverrides,
            [clusterId]: {
              ...state.config.bfcsOverrides[clusterId],
              [roleId]: {
                ...currentOverrides,
                [dimension]: value,
              },
            },
          },
        };
        return {
          config: newConfig,
          timeline: recompute(newConfig),
        };
      }),

    resetClusterBFCS: (clusterId) =>
      set((state) => {
        const { [clusterId]: _removed, ...rest } = state.config.bfcsOverrides;
        const newConfig: SimulationConfig = {
          ...state.config,
          bfcsOverrides: rest,
        };
        return {
          config: newConfig,
          timeline: recompute(newConfig),
        };
      }),

    resetRoleBFCS: (clusterId, roleId) =>
      set((state) => {
        const clusterOverrides = state.config.bfcsOverrides[clusterId];
        if (!clusterOverrides) return state;

        const { [roleId]: _removed, ...restRoles } = clusterOverrides;
        const newBfcsOverrides = { ...state.config.bfcsOverrides };

        if (Object.keys(restRoles).length > 0) {
          newBfcsOverrides[clusterId] = restRoles;
        } else {
          delete newBfcsOverrides[clusterId];
        }

        const newConfig: SimulationConfig = {
          ...state.config,
          bfcsOverrides: newBfcsOverrides,
        };
        return {
          config: newConfig,
          timeline: recompute(newConfig),
        };
      }),

    // Policy actions (Phase 5)
    setPolicyPreset: (presetId) =>
      set((state) => {
        const preset = POLICY_PRESETS.find((p) => p.id === presetId);
        if (!preset) return state;

        const newConfig: SimulationConfig = {
          ...state.config,
          policyConfig: preset.config,
        };
        return {
          config: newConfig,
          timeline: recompute(newConfig),
        };
      }),

    togglePolicy: (policyKey, enabled) =>
      set((state) => {
        const currentPolicy = state.config.policyConfig[policyKey];
        if (typeof currentPolicy !== 'object' || !('enabled' in currentPolicy)) return state;

        const newConfig: SimulationConfig = {
          ...state.config,
          policyConfig: {
            ...state.config.policyConfig,
            [policyKey]: {
              ...currentPolicy,
              enabled,
            },
          },
        };
        return {
          config: newConfig,
          timeline: recompute(newConfig),
        };
      }),

    updatePolicyParam: (policyKey, update) =>
      set((state) => {
        const currentPolicy = state.config.policyConfig[policyKey];
        const newConfig: SimulationConfig = {
          ...state.config,
          policyConfig: {
            ...state.config.policyConfig,
            [policyKey]: {
              ...currentPolicy,
              ...update,
            },
          },
        };
        return {
          config: newConfig,
          timeline: recompute(newConfig),
        };
      }),

    resetPolicyToDefaults: () =>
      set((state) => {
        const newConfig: SimulationConfig = {
          ...state.config,
          policyConfig: DEFAULT_POLICY_CONFIG,
        };
        return {
          config: newConfig,
          timeline: recompute(newConfig),
        };
      }),

    // Compare mode (Phase 5)
    compareMode: false,
    comparisonPolicyConfigs: [],

    toggleCompareMode: () =>
      set((state) => ({ compareMode: !state.compareMode })),

    setComparisonSlot: (index, label, config) =>
      set((state) => {
        const updated = [...state.comparisonPolicyConfigs];
        updated[index] = { label, config };
        return { comparisonPolicyConfigs: updated };
      }),

    addComparisonSlot: (label, config) =>
      set((state) => ({
        comparisonPolicyConfigs: [...state.comparisonPolicyConfigs, { label, config }],
      })),

    removeComparisonSlot: (index) =>
      set((state) => ({
        comparisonPolicyConfigs: state.comparisonPolicyConfigs.filter((_, i) => i !== index),
      })),

    // Presentation mode (Phase 7)
    presentationMode: false,
    presentationStep: 0,

    togglePresentationMode: () =>
      set((state) => ({
        presentationMode: !state.presentationMode,
        presentationStep: 0,
      })),

    setPresentationStep: (step) =>
      set(() => ({ presentationStep: step })),

    nextPresentationStep: () =>
      set((state) => ({ presentationStep: state.presentationStep + 1 })),

    prevPresentationStep: () =>
      set((state) => ({ presentationStep: Math.max(0, state.presentationStep - 1) })),

    // Onboarding (Phase 7)
    onboardingComplete: (() => {
      try {
        return localStorage.getItem('atlas_onboarding_complete') === 'true';
      } catch {
        return false;
      }
    })(),
    onboardingStep: 0,

    setOnboardingComplete: (complete) => {
      try {
        localStorage.setItem('atlas_onboarding_complete', String(complete));
      } catch {
        // localStorage unavailable
      }
      set(() => ({ onboardingComplete: complete }));
    },

    setOnboardingStep: (step) =>
      set(() => ({ onboardingStep: step })),

    // Fiscal Onboarding (Phase 8d)
    fiscalOnboardingComplete: (() => {
      try {
        return localStorage.getItem('atlas_fiscal_onboarding_complete') === 'true';
      } catch {
        return false;
      }
    })(),
    fiscalOnboardingStep: 0,

    setFiscalOnboardingComplete: (complete) => {
      try {
        localStorage.setItem('atlas_fiscal_onboarding_complete', String(complete));
      } catch {
        // localStorage unavailable
      }
      set(() => ({ fiscalOnboardingComplete: complete }));
    },

    setFiscalOnboardingStep: (step) =>
      set(() => ({ fiscalOnboardingStep: step })),

    // Scenario load — replaces entire config and recomputes (Phase 7)
    // Phase 8b: Also loads overrides from config if present
    loadScenario: (config) => {
      const { config: validated } = validateConfig(config);
      const overrides = validated.parameterOverrides ?? {};
      currentParameterOverrides = overrides;
      set(() => ({
        config: validated,
        currentYear: validated.startYear,
        parameterOverrides: overrides,
        timeline: recompute(validated, overrides),
      }));
    },

    // CSV Import — parses CSV parameter file and applies as new config
    // Phase 8b: Also imports parameter overrides from config
    importCSVConfig: (csvString: string) => {
      const { params, warnings: parseWarnings } = parseParameterCSV(csvString);
      const { config, warnings: buildWarnings } = buildConfigFromCSV(params);
      const allWarnings = [...parseWarnings, ...buildWarnings];

      const overrides = config.parameterOverrides ?? {};
      currentParameterOverrides = overrides;

      set({
        config,
        parameterOverrides: overrides,
        timeline: recompute(config, overrides),
        currentYear: config.startYear,
      });

      return { importedCount: params.size, warnings: allWarnings };
    },

    // Generic config updater for advanced parameters
    updateConfig: (updater) =>
      set((state) => {
        const newConfig = updater(state.config);
        return {
          config: newConfig,
          timeline: recompute(newConfig, state.parameterOverrides),
          baselineTimeline: state.showBaselineComparison
            ? recompute(newConfig)
            : null,
        };
      }),

    // Phase 8b: Per-Year Parameter Override Actions
    setParameterOverride: (paramKey, year, value) =>
      set((state) => {
        const newOverrides = { ...state.parameterOverrides, [`${paramKey}:${year}`]: value };
        currentParameterOverrides = newOverrides;
        return {
          parameterOverrides: newOverrides,
          timeline: recompute(state.config, newOverrides),
          // Baseline unaffected by override changes — it's the no-override run
        };
      }),

    removeParameterOverride: (paramKey, year) =>
      set((state) => {
        const newOverrides = { ...state.parameterOverrides };
        delete newOverrides[`${paramKey}:${year}`];
        currentParameterOverrides = newOverrides;
        return {
          parameterOverrides: newOverrides,
          timeline: recompute(state.config, newOverrides),
        };
      }),

    clearParameterOverrides: () =>
      set((state) => {
        currentParameterOverrides = {};
        const newTimeline = recompute(state.config);
        return {
          parameterOverrides: {},
          timeline: newTimeline,
          // When clearing overrides, baseline and main timeline become identical
          baselineTimeline: state.showBaselineComparison ? newTimeline : null,
        };
      }),

    // Phase 8c: Fiscal Response UI
    showBaselineComparison: false,
    baselineTimeline: null,

    // DEPRECATED Phase 8 Fix 4: setFiscalResponsePreset replaced by split preset actions below
    // setFiscalResponsePreset: (presetId) =>
    //   set((state) => {
    //     const newConfig = { ...state.config, fiscalResponseProfile: presetId, fiscalResponseCustom: undefined };
    //     return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
    //   }),

    setFiscalPolicyPreset: (presetId) =>
      set((state) => {
        const newConfig: SimulationConfig = {
          ...state.config,
          fiscalPolicyPreset: presetId,
          fiscalPolicyCustom: undefined,
        };
        const newTimeline = recompute(newConfig, state.parameterOverrides);
        return {
          config: newConfig,
          timeline: newTimeline,
          baselineTimeline: state.showBaselineComparison
            ? recompute(newConfig)
            : null,
        };
      }),

    setFederalReservePreset: (presetId) =>
      set((state) => {
        const newConfig: SimulationConfig = {
          ...state.config,
          federalReservePreset: presetId,
          federalReserveCustom: undefined,
        };
        const newTimeline = recompute(newConfig, state.parameterOverrides);
        return {
          config: newConfig,
          timeline: newTimeline,
          baselineTimeline: state.showBaselineComparison
            ? recompute(newConfig)
            : null,
        };
      }),

    setFiscalDimension: (dimension, position) =>
      set((state) => {
        // Phase 8 Fix 4: Read current fiscal dimension positions from the resolved profile,
        // then override just the changed dimension
        const currentProfile = resolveCombinedProfile(
          state.config.fiscalPolicyPreset ?? DEFAULT_FISCAL_POLICY_PRESET,
          state.config.federalReservePreset ?? DEFAULT_FEDERAL_RESERVE_PRESET,
          state.config.fiscalPolicyCustom,
          state.config.federalReserveCustom,
        );
        const currentPositions = presetToDimensionPositions(currentProfile);
        const newPositions = { ...currentPositions, [dimension]: position };
        const profileFields = dimensionPositionsToProfileFields(newPositions);

        const newConfig: SimulationConfig = {
          ...state.config,
          fiscalPolicyPreset: 'custom',
          fiscalPolicyCustom: profileFields,
        };
        const newTimeline = recompute(newConfig, state.parameterOverrides);
        return {
          config: newConfig,
          timeline: newTimeline,
          baselineTimeline: state.showBaselineComparison
            ? recompute(newConfig)
            : null,
        };
      }),

    setFedDimension: (dimension, position) =>
      set((state) => {
        // Phase 8 Fix 4: Read current Fed dimension positions from the resolved profile,
        // then override just the changed dimension
        const currentProfile = resolveCombinedProfile(
          state.config.fiscalPolicyPreset ?? DEFAULT_FISCAL_POLICY_PRESET,
          state.config.federalReservePreset ?? DEFAULT_FEDERAL_RESERVE_PRESET,
          state.config.fiscalPolicyCustom,
          state.config.federalReserveCustom,
        );
        const currentPositions = fedPresetToDimensionPositions(currentProfile);
        const newPositions = { ...currentPositions, [dimension]: position };
        const profileFields = fedDimensionPositionsToProfileFields(newPositions);

        const newConfig: SimulationConfig = {
          ...state.config,
          federalReservePreset: 'custom',
          federalReserveCustom: profileFields,
        };
        const newTimeline = recompute(newConfig, state.parameterOverrides);
        return {
          config: newConfig,
          timeline: newTimeline,
          baselineTimeline: state.showBaselineComparison
            ? recompute(newConfig)
            : null,
        };
      }),

    toggleBaselineComparison: () =>
      set((state) => {
        if (state.showBaselineComparison) {
          // Turning OFF
          return { showBaselineComparison: false, baselineTimeline: null };
        }
        // Turning ON: run simulation without overrides
        return {
          showBaselineComparison: true,
          baselineTimeline: recompute(state.config),
        };
      }),

    resetYearOverrides: (year) =>
      set((state) => {
        const suffix = `:${year}`;
        const newOverrides: Record<string, number> = {};
        for (const [key, value] of Object.entries(state.parameterOverrides)) {
          if (!key.endsWith(suffix)) {
            newOverrides[key] = value;
          }
        }
        currentParameterOverrides = newOverrides;
        return {
          parameterOverrides: newOverrides,
          timeline: recompute(state.config, newOverrides),
          baselineTimeline: state.showBaselineComparison
            ? state.baselineTimeline // baseline unaffected by override changes
            : null,
        };
      }),

    // Phase 8d: Profile Comparison
    fiscalComparisonProfile: null,
    setFiscalComparisonProfile: (profileName) =>
      set(() => ({ fiscalComparisonProfile: profileName })),

    // Phase 10.A: alpha drivers, augmentation, scarcity, inference curve, friction
    setAlphaDriverParams: (params) =>
      set((state) => {
        const newConfig = { ...state.config, alphaDriverParams: params };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    setAugmentationAdoptionSteepness: (value) =>
      set((state) => {
        const newConfig = { ...state.config, augmentationAdoptionSteepness: value };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    setTokenCostCurve: (curve) =>
      set((state) => {
        const base = state.config.aiCostParams ?? DEFAULT_AI_COST_PARAMS;
        const newConfig = {
          ...state.config,
          aiCostParams: { ...base, tokenCostCurve: curve },
        };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    setScarcityIntensity: (value) =>
      set((state) => {
        const newConfig = { ...state.config, scarcityIntensity: value };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    setCompetitivePressureThreshold: (value) =>
      set((state) => {
        const newConfig = { ...state.config, competitivePressureThreshold: value };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    setReplacementMultiplier: (value) =>
      set((state) => {
        const newConfig = { ...state.config, replacementMultiplier: value };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    // DEPRECATED (Phase 10.A fix #2): setMaxAdoptionFrictionYears removed.
    setClusterAlpha: (clusterId, value) =>
      set((state) => {
        const currentOverrides = state.config.clusterAutomationShareOverrides ?? {};
        const newConfig = {
          ...state.config,
          clusterAutomationShareOverrides: { ...currentOverrides, [clusterId]: value },
        };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    setRoleAlphaOverride: (clusterId, roleId, value) =>
      set((state) => {
        const currentOuter = state.config.roleAutomationShareOverrides ?? {};
        const currentInner = currentOuter[clusterId] ?? {};
        const newConfig = {
          ...state.config,
          roleAutomationShareOverrides: {
            ...currentOuter,
            [clusterId]: { ...currentInner, [roleId]: value },
          },
        };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    setRoleReplacementFrictionYears: (clusterId, roleId, value) =>
      set((state) => {
        const currentOuter = state.config.roleReplacementFrictionYearsOverrides ?? {};
        const currentInner = currentOuter[clusterId] ?? {};
        const newConfig = {
          ...state.config,
          roleReplacementFrictionYearsOverrides: {
            ...currentOuter,
            [clusterId]: { ...currentInner, [roleId]: value },
          },
        };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),
    setRoleReplacementDifficultyWagePremium: (clusterId, roleId, value) =>
      set((state) => {
        const currentOuter = state.config.roleReplacementDifficultyWagePremiumOverrides ?? {};
        const currentInner = currentOuter[clusterId] ?? {};
        const newConfig = {
          ...state.config,
          roleReplacementDifficultyWagePremiumOverrides: {
            ...currentOuter,
            [clusterId]: { ...currentInner, [roleId]: value },
          },
        };
        return { config: newConfig, timeline: recompute(newConfig, state.parameterOverrides) };
      }),

    // Reset everything to defaults
    resetToDefaults: () => {
      const freshConfig = getDefaultSimulationConfig();
      currentParameterOverrides = {};
      set(() => ({
        config: freshConfig,
        currentYear: freshConfig.startYear,
        isPlaying: false,
        timeline: recompute(freshConfig),
        parameterOverrides: {},
        selectedStateCode: null,
        comparisonStateCodes: [],
        stateMapMetric: 'displacement' as const,
        compareMode: false,
        comparisonPolicyConfigs: [],
        presentationMode: false,
        presentationStep: 0,
        showBaselineComparison: false,
        baselineTimeline: null,
        fiscalComparisonProfile: null,
      }));
    },
  })),
  {
    name: 'atlas-session',
    // Bump `version` whenever SimulationConfig's shape changes (add/remove/rename a field).
    // The migrate function discards any prior-version state so stale browser sessions
    // can't hydrate the current store with an incompatible config.
    version: 5,
    migrate: (_persisted: unknown, version: number) => {
      if (version < 5) return undefined;
      return _persisted;
    },
    storage: {
      getItem: (name) => {
        try {
          const raw = sessionStorage.getItem(name);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      },
      setItem: (name, value) => {
        try {
          sessionStorage.setItem(name, JSON.stringify(value));
        } catch {
          // sessionStorage full or unavailable
        }
      },
      removeItem: (name) => {
        try {
          sessionStorage.removeItem(name);
        } catch {
          // sessionStorage unavailable
        }
      },
    },
    // Only persist user-adjustable state, not derived data
    partialize: (state: SimulationState) => ({
      config: state.config,
      currentYear: state.currentYear,
      activeView: state.activeView,
      selectedClusterId: state.selectedClusterId,
      selectedStateCode: state.selectedStateCode,
      comparisonStateCodes: state.comparisonStateCodes,
      stateMapMetric: state.stateMapMetric,
      compareMode: state.compareMode,
      comparisonPolicyConfigs: state.comparisonPolicyConfigs,
      parameterOverrides: state.parameterOverrides,
      fiscalComparisonProfile: state.fiscalComparisonProfile,
    }),
    // Recompute timeline from persisted config on rehydration
    onRehydrateStorage: () => (state) => {
      if (state) {
        // Migrate: 'states' view removed in Phase 5 → redirect to 'overview'
        if ((state.activeView as string) === 'states') {
          state.activeView = 'overview';
        }
        // Migrate Phase 5e: convert flat policy numbers to PolicySchedule objects
        migratePolicySchedules(state.config);
        // Phase 8b: Restore module-level overrides from persisted state
        currentParameterOverrides = state.parameterOverrides ?? {};
        state.timeline = recompute(state.config, state.parameterOverrides);
      }
    },
  },
  ),
);
