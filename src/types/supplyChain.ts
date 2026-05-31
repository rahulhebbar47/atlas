/**
 * ATLAS Phase 9: Supply Chain Uncertainty Types
 *
 * Models how constraints on AI infrastructure (chip shortages, energy costs,
 * datacenter bottleneck, rare earth disruptions) affect the AI automation
 * timeline through the BFCS framework.
 *
 * Two channels:
 *   1. Training channel → delays AI capability S-curves (shifts rightward)
 *   2. Deployment channel → raises AI costs and slows speed (modifies BFCS)
 *
 * All types are PURE DATA — no computation logic here.
 */

import type { CapabilityVectorId, DeploymentType, BFCSScores, BFCSThresholds, AdoptionParams } from '@/types';

// ============================================================
// Supply Chain Input State
// ============================================================

/** Supply chain input values for a single year. 100 = baseline (no constraint). */
export interface SupplyChainInputs {
  /** Combined GPU/TPU/ASIC + HBM supply. 0-100. */
  aiChips: number;
  /** Energy price index (100 = current $/MWh). 50-500. */
  energyPrice: number;
  /** Grid capacity for AI workloads. 0-100. */
  energyCapacity: number;
  /** Training datacenter build capacity. 0-100. */
  trainingDCCapacity: number;
  /** Inference datacenter capacity. 0-100. */
  inferenceDCCapacity: number;
  /** Composite: actuators, sensors, batteries, rare earths. 0-100. */
  roboticsHardware: number;
  /** Algorithmic efficiency multiplier. 50-300. */
  softwareEfficiency: number;
}

// ============================================================
// Resilience
// ============================================================

/**
 * Per-input resilience [0, 0.95]. 0 = fully exposed, 1 = fully resilient.
 * Modulates shock severity: effectiveShock = rawShock × (1 - resilience).
 */
export interface SupplyChainResilience {
  /** Default 0.05. TSMC 70%+ foundry share.
   *  Source: TrendForce Q2 2025 — 70.2% global foundry market share. */
  aiChips: number;
  /** Default 0.85. US largest producer, domestic grid.
   *  Source: EIA — US #1 oil/gas producer. Grid is domestic infrastructure. */
  energy: number;
  /** Default 0.90. Domestic construction.
   *  Source: xAI Colossus built in 122 days from domestic materials. */
  trainingDC: number;
  /** Default 0.90. US cloud providers dominant.
   *  Source: Synergy Research — AWS/Azure/GCP dominate. */
  inferenceDC: number;
  /** Default 0.05. China 90%+ rare earth processing.
   *  Source: IEA 2024, CSIS Oct 2025. May 2025: 93.3% export drop. */
  roboticsHardware: number;
}

// ============================================================
// Training Resource Composition
// ============================================================

/** Initial training cost shares. Must sum to 1.0. */
export interface TrainingComposition {
  /** Default 0.55. Source: Epoch AI (2025) — accelerators 47-67% of cluster cost. */
  aiChips: number;
  /** Default 0.25. Binding operational constraint at GW-scale. */
  energy: number;
  /** Default 0.20. Facility, cooling, networking. Most substitutable component. */
  datacenter: number;
}

/** Per-component training cost dynamics. */
export interface TrainingCostDynamics {
  /** Annual technology improvement rate (negative = costs falling). */
  techDeclineRate: number;
  /** How much scaling increases per-unit cost [0, 0.50]. */
  scalePressure: number;
}

// ============================================================
// Deployment Cost Composition
// ============================================================

/** 3-component deployment cost weights per deployment type. */
export interface DeploymentCostComposition {
  /** GPU/HBM amortization for inference. */
  compute: number;
  /** Robots, sensors, vehicles (0 for software). */
  physicalHardware: number;
  /** Operational power. */
  energy: number;
}

// ============================================================
// Full Supply Chain Config (added to SimulationConfig)
// ============================================================

export interface SupplyChainConfig {
  // --- Supply inputs (year-by-year via parameter timeline) ---
  inputs: SupplyChainInputs;

  // --- Resilience baselines (year-by-year via parameter timeline) ---
  resilience: SupplyChainResilience;

  // --- Training composition (initial values, Baseline) ---
  trainingComposition: TrainingComposition;
  /** YoY multiplier on training compute demand. Default 3.0x/yr.
   *  Source: Epoch AI 4-5x/yr; conservative 3.0x with algorithmic efficiency offsets. */
  trainingScaleGrowthRate: number;

  // --- Training cost dynamics (Autopilot, year-by-year overridable) ---
  trainingDynamics: {
    aiChips: TrainingCostDynamics;     // { techDeclineRate: -0.35, scalePressure: 0.05 }
    energy: TrainingCostDynamics;      // { techDeclineRate: -0.04, scalePressure: 0.15 }
    datacenter: TrainingCostDynamics;  // { techDeclineRate: -0.08, scalePressure: 0.25 }
  };
  /** Multiplier on DC scale pressure. Default 1.0.
   *  2.0 = permitting gridlock; 0.3 = streamlined/space DCs. */
  regulatoryFriction: number;

  // --- Chip cascade (Baseline) ---
  /** How long before training chips reach inference. Default 2.5 years. */
  chipCascadeLag: number;
  /** How much more expensive per-query older-gen chips are. Default 0.30. */
  chipCascadeCostPremium: number;

  // --- Pass-through (year-by-year via parameter timeline) ---
  /** Inference cost pass-through rate. Default trajectory 0→0.30→0.75. */
  costPassThroughRate: number;
  /** Deployer cost pass-through to consumers. Default 0.50. */
  consumerPassThroughRate: number;

  // --- Hysteresis (Baseline) ---
  /** Max hysteresis width for cognitive AI. Default 0.25. */
  hysteresisMaxCognitive: number;
  /** Max hysteresis width for embodied AI. Default 0.35. */
  hysteresisMaxEmbodied: number;

  // --- Procurement constraint shares (Baseline) ---
  /** Physical throughput constraint shares. Must sum to 1.0.
   *  Reflects how hard each resource is to physically scale up,
   *  independent of per-unit cost. */
  procurementShares: TrainingComposition;

  // --- Cost vs procurement blend (Autopilot, year-by-year overridable) ---
  /** 1.0 = pure cost-driven composition, 0.0 = pure procurement-driven.
   *  Default 0.50. Blends cost share with procurement constraint share
   *  to prevent cheap-but-scarce resources from becoming invisible. */
  costVsProcurementBlend: number;

  // --- Sensitivity blend (Baseline) ---
  /** -1 = auto from S-curve progress. Range -1 to 1. */
  sensitivityBlendCognitive: number;
  /** -1 = auto from S-curve progress. Range -1 to 1. */
  sensitivityBlendEmbodied: number;
}

// ============================================================
// Sensitivity Matrix Types
// ============================================================

/** Supply input keys used in sensitivity and propagation lag matrices. */
export type SupplyInputKey = 'aiChips' | 'energyPrice' | 'energyCapacity' | 'trainingDCCapacity' | 'inferenceDCCapacity' | 'roboticsHardware';

/** BFCS dimensions. */
export type BFCSDimension = 'better' | 'faster' | 'cheaper' | 'safer';

/** Sensitivity matrix: supply input → BFCS dimension → weight. */
export type SensitivityMatrix = Record<SupplyInputKey, Record<BFCSDimension, number>>;

// ============================================================
// Computed Effects (intermediate result per year)
// ============================================================

export interface SupplyChainEffects {
  // Training channel
  annualCapabilityDelay: Record<CapabilityVectorId, number>;
  cumulativeCapabilityDelay: Record<CapabilityVectorId, number>;
  dynamicTrainingComposition: TrainingComposition;

  // Deployment channel
  deploymentCostMultipliers: { compute: number; physicalHardware: number; energy: number };
  /** Pass-through-applied multipliers in BFCS field names (compute→inference, physicalHardware→manufacturing). */
  bfcsCostMultipliers: { inference: number; manufacturing: number; energy: number };
  effectiveComputeDeclineRate: number;

  // BFCS multipliers
  fasterMultiplier: number;
  saferMultiplier: number;
  adoptionDragMultiplier: number;

  // Macro integration
  supplyChainCostPush: number;
  labProfitMarginAdjustment: number;

  // Pass-through
  costPassThroughRate: number;

  // Scaled sensitivity matrices (blend-adjusted for per-cluster BFCS computation)
  scaledCognitiveSensitivity: SensitivityMatrix;
  scaledEmbodiedSensitivity: SensitivityMatrix;

  // Diagnostics
  effectiveResilience: SupplyChainResilience;
  aggregateResilience: number;
  cascadeBacklog: number;
}

// ============================================================
// Adoption State (carried forward in YearSnapshot)
// ============================================================

export interface AdoptionState {
  /** Current adoption rate per cluster-role. */
  rates: Record<string, Record<string, number>>;
  /** Year adoption was frozen per cluster-role (null if not frozen). */
  frozenSince: Record<string, Record<string, number | null>>;
}
