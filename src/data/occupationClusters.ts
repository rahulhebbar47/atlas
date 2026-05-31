/**
 * ATLAS Occupation Clusters
 *
 * Complete taxonomy of 51 occupation clusters with role/seniority sub-differentiation,
 * BFCS threshold values, capability relevance weights, and deployment parameters.
 *
 * Source: docs/OCCUPATION_CLUSTERS.md
 * All BFCS thresholds (B*, F*, C*, S*) are taken directly from the documentation.
 * Employment multipliers cite BEA input-output tables unless otherwise noted.
 *
 * NOTE (Phase 5h): The `employmentMultiplier` values on each cluster object are FALLBACK values.
 * The authoritative source of truth for employment multipliers is EMPLOYMENT_MULTIPLIERS
 * in src/models/constants.ts. At simulation start, simulation.ts creates effectiveClusters
 * with multipliers overridden from the constant. Direct cluster.employmentMultiplier values
 * are only used if a cluster is missing from the EMPLOYMENT_MULTIPLIERS map.
 */

import type { OccupationCluster, CapabilityVectorId } from '@/types';
import {
  DEFAULT_COGNITIVE_ALPHA,
  EMBODIED_CLUSTER_ALPHA_DEFAULTS,
  ROLE_AI_REPLACEMENT_FRICTION_YEARS_DEFAULTS,
  ROLE_AI_REPLACEMENT_DIFFICULTY_WAGE_PREMIUM_DEFAULTS,
  FALLBACK_REPLACEMENT_FRICTION_YEARS,
  FALLBACK_REPLACEMENT_DIFFICULTY_WAGE_PREMIUM,
} from '@/models/constants';

// DEPRECATED: Old 8-vector capWeights helper
// function capWeights(partial: Partial<Record<CapabilityVectorId, number>>): Record<CapabilityVectorId, number> {
//   return { lang: 0, code: 0, agent: 0, decide: 0, robot: 0, auto: 0, gen: 0, sci: 0, ...partial };
// }

// Helper to build a full 3-vector capability weights record with defaults of 0
function capWeights(
  partial: Partial<Record<CapabilityVectorId, number>>
): Record<CapabilityVectorId, number> {
  return {
    generative: 0,
    agentic: 0,
    embodied: 0,
    ...partial,
  };
}

export const OCCUPATION_CLUSTERS: OccupationCluster[] = [
  // ============================================================
  // 1. TECHNOLOGY
  // ============================================================

  // 1.1 Software Engineering
  {
    id: 'tech_swe',
    name: 'Software Engineering',
    category: 'Technology',
    socCodes: ['15-1252', '15-1253', '15-1254', '15-1256'],
    roles: [
      {
        id: 'junior_mid',
        label: 'Junior/Mid Developer',
        seniorityLevel: 0.7,
        aiReplacementDifficulty: 0.7,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.6, faster: 0.7, cheaper: 0.5, safer: 0.7 },
      },
      {
        id: 'senior',
        label: 'Senior Developer',
        seniorityLevel: 0.85,
        aiReplacementDifficulty: 0.85,
        employmentShareEstimate: 0.35,
        bfcsThresholds: { better: 0.8, faster: 0.8, cheaper: 0.6, safer: 0.85 },
      },
      {
        id: 'staff_principal',
        label: 'Staff/Principal/Architect',
        seniorityLevel: 0.95,
        aiReplacementDifficulty: 0.95,
        employmentShareEstimate: 0.20,
        bfcsThresholds: { better: 0.9, faster: 0.85, cheaper: 0.7, safer: 0.95 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.50, agentic: 0.45, embodied: 0.05 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 4.3,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes:
      'Junior devs already approaching BFCS threshold. Senior architects are significantly further out. The "Safer" threshold for architects reflects that critical system design errors are extremely costly.',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.20,
    govDemandShare: 0.10,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { junior_mid: 0.75, senior: 0.50, staff_principal: 0.30 },
  },

  // 1.2 Data / ML Engineering
  {
    id: 'tech_data_ml',
    name: 'Data / ML Engineering',
    category: 'Technology',
    socCodes: ['15-2051', '15-2098'],
    roles: [
      {
        id: 'junior_analyst',
        label: 'Junior Data Analyst',
        seniorityLevel: 0.6,
        aiReplacementDifficulty: 0.6,
        employmentShareEstimate: 0.35,
        bfcsThresholds: { better: 0.5, faster: 0.6, cheaper: 0.4, safer: 0.5 },
      },
      {
        id: 'ml_engineer',
        label: 'ML Engineer',
        seniorityLevel: 0.8,
        aiReplacementDifficulty: 0.8,
        employmentShareEstimate: 0.40,
        bfcsThresholds: { better: 0.75, faster: 0.75, cheaper: 0.6, safer: 0.8 },
      },
      {
        id: 'research_scientist',
        label: 'Research Scientist',
        seniorityLevel: 0.95,
        aiReplacementDifficulty: 0.95,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.9, faster: 0.8, cheaper: 0.7, safer: 0.9 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.50, agentic: 0.45, embodied: 0.05 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 4.0,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.15,
    govDemandShare: 0.10,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { junior_analyst: 0.75, ml_engineer: 0.50, research_scientist: 0.25 },
  },

  // 1.3 IT Support / Sysadmin
  {
    id: 'tech_it_support',
    name: 'IT Support / Sysadmin',
    category: 'Technology',
    socCodes: ['15-1231', '15-1244', '15-1232'],
    roles: [
      {
        id: 'tier1_support',
        label: 'Tier 1 Support',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 0.40,
        bfcsThresholds: { better: 0.5, faster: 0.6, cheaper: 0.4, safer: 0.4 },
      },
      {
        id: 'sysadmin',
        label: 'Sysadmin',
        seniorityLevel: 0.7,
        aiReplacementDifficulty: 0.7,
        employmentShareEstimate: 0.35,
        bfcsThresholds: { better: 0.65, faster: 0.7, cheaper: 0.5, safer: 0.7 },
      },
      {
        id: 'devops_sre',
        label: 'DevOps/SRE',
        seniorityLevel: 0.85,
        aiReplacementDifficulty: 0.85,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.8, faster: 0.8, cheaper: 0.6, safer: 0.85 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.25, agentic: 0.55, embodied: 0.20 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 3.0,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.15,
    govDemandShare: 0.15,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { tier1_support: 0.80, sysadmin: 0.55, devops_sre: 0.35 },
  },

  // 1.4 QA / Testing
  {
    id: 'tech_qa',
    name: 'QA / Testing',
    category: 'Technology',
    socCodes: ['15-1253'],
    roles: [
      {
        id: 'manual_qa',
        label: 'Manual QA',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.5 },
      },
      {
        id: 'automation_qa',
        label: 'Automation QA',
        seniorityLevel: 0.7,
        aiReplacementDifficulty: 0.7,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.6, faster: 0.65, cheaper: 0.5, safer: 0.65 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.40, agentic: 0.55, embodied: 0.05 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 3.5,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.15,
    govDemandShare: 0.10,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { manual_qa: 0.80, automation_qa: 0.55 },
  },

  // ============================================================
  // 2. FINANCE
  // ============================================================

  // 2.1 Trading / Quantitative
  {
    id: 'finance_trading',
    name: 'Trading / Quantitative',
    category: 'Finance',
    socCodes: ['13-2051', '13-2054'],
    roles: [
      {
        id: 'execution_trader',
        label: 'Execution Trader',
        seniorityLevel: 0.6,
        aiReplacementDifficulty: 0.6,
        employmentShareEstimate: 0.30,
        bfcsThresholds: { better: 0.6, faster: 0.8, cheaper: 0.5, safer: 0.7 },
      },
      {
        id: 'quant_analyst',
        label: 'Quant Analyst',
        seniorityLevel: 0.85,
        aiReplacementDifficulty: 0.85,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.8, faster: 0.85, cheaper: 0.6, safer: 0.85 },
      },
      {
        id: 'portfolio_manager',
        label: 'Portfolio Manager',
        seniorityLevel: 0.95,
        aiReplacementDifficulty: 0.95,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.9, faster: 0.8, cheaper: 0.7, safer: 0.9 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.40, agentic: 0.55, embodied: 0.05 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 3.8,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.10,
    govDemandShare: 0.05,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { execution_trader: 0.75, quant_analyst: 0.50, portfolio_manager: 0.30 },
  },

  // 2.2 Banking
  {
    id: 'finance_banking',
    name: 'Banking',
    category: 'Finance',
    socCodes: ['13-2071', '13-2072', '43-3071'],
    roles: [
      {
        id: 'teller',
        label: 'Teller / Service Rep',
        seniorityLevel: 0.4,
        aiReplacementDifficulty: 0.4,
        employmentShareEstimate: 0.35,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.3 },
      },
      {
        id: 'junior_analyst',
        label: 'Junior Analyst',
        seniorityLevel: 0.6,
        aiReplacementDifficulty: 0.6,
        employmentShareEstimate: 0.40,
        bfcsThresholds: { better: 0.55, faster: 0.6, cheaper: 0.4, safer: 0.5 },
      },
      {
        id: 'senior_banker',
        label: 'Senior Banker / Relationship Mgr',
        seniorityLevel: 0.85,
        aiReplacementDifficulty: 0.85,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.8, faster: 0.7, cheaper: 0.6, safer: 0.7 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.30, agentic: 0.65, embodied: 0.05 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 3.2,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.40,
    govDemandShare: 0.05,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { teller: 0.80, junior_analyst: 0.70, senior_banker: 0.40 },
  },

  // 2.3 Accounting / Bookkeeping
  {
    id: 'finance_accounting',
    name: 'Accounting / Bookkeeping',
    category: 'Finance',
    socCodes: ['13-2011', '43-3031'],
    roles: [
      {
        id: 'bookkeeper',
        label: 'Bookkeeper',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 0.30,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.5 },
      },
      {
        id: 'accountant',
        label: 'Accountant',
        seniorityLevel: 0.7,
        aiReplacementDifficulty: 0.7,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.6, faster: 0.65, cheaper: 0.5, safer: 0.7 },
      },
      {
        id: 'cpa_audit',
        label: 'CPA / Audit Senior',
        seniorityLevel: 0.85,
        aiReplacementDifficulty: 0.85,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.8, faster: 0.75, cheaper: 0.6, safer: 0.85 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.35, agentic: 0.60, embodied: 0.05 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 2.5,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.30,
    govDemandShare: 0.05,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { bookkeeper: 0.80, accountant: 0.55, cpa_audit: 0.35 },
  },

  // 2.4 Insurance / Underwriting
  {
    id: 'finance_insurance',
    name: 'Insurance / Underwriting',
    category: 'Finance',
    socCodes: ['13-2053', '13-2022'],
    roles: [
      {
        id: 'claims_processor',
        label: 'Claims Processor',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.4 },
      },
      {
        id: 'underwriter',
        label: 'Underwriter',
        seniorityLevel: 0.75,
        aiReplacementDifficulty: 0.75,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.65, faster: 0.7, cheaper: 0.5, safer: 0.7 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.30, agentic: 0.65, embodied: 0.05 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 2.3,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.45,
    govDemandShare: 0.05,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { claims_processor: 0.80, underwriter: 0.50 },
  },

  // ============================================================
  // 3. HEALTHCARE
  // ============================================================

  // 3.1 Physicians / Surgeons
  {
    id: 'health_physicians',
    name: 'Physicians / Surgeons',
    category: 'Healthcare',
    socCodes: ['29-1210', '29-1211', '29-1212', '29-1213', '29-1214', '29-1215', '29-1216', '29-1217', '29-1218', '29-1221', '29-1222', '29-1223', '29-1224', '29-1229', '29-1241', '29-1242', '29-1243', '29-1249'],
    roles: [
      {
        id: 'primary_care',
        label: 'Primary Care',
        seniorityLevel: 0.85,
        aiReplacementDifficulty: 0.85,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.85, faster: 0.7, cheaper: 0.7, safer: 0.99 },
      },
      {
        id: 'specialist',
        label: 'Specialist',
        seniorityLevel: 0.9,
        aiReplacementDifficulty: 0.9,
        employmentShareEstimate: 0.35,
        bfcsThresholds: { better: 0.9, faster: 0.75, cheaper: 0.75, safer: 0.995 },
      },
      {
        id: 'surgeon',
        label: 'Surgeon',
        seniorityLevel: 0.95,
        aiReplacementDifficulty: 0.95,
        employmentShareEstimate: 0.20,
        bfcsThresholds: { better: 0.95, faster: 0.8, cheaper: 0.8, safer: 0.999 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.25, agentic: 0.25, embodied: 0.50 }),
    },
    deploymentType: 'hybrid',
    employmentMultiplier: 2.1,
    adoptionLag: 2,
    geopoliticalRiskExposure: 0.1,
    notes:
      'Extremely high Safer thresholds. Physicians will be among the last fully displaced, but AI-assisted diagnostics will erode tasks early.',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.0,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.45,
    govDemandShare: 0.40,
    wageElasticity: 0.5,
    // DEPRECATED: taskAutomatableFraction: { primary_care: 0.40, specialist: 0.35, surgeon: 0.20 },
  },

  // 3.2 Nurses
  {
    id: 'health_nurses',
    name: 'Nurses',
    category: 'Healthcare',
    socCodes: ['29-1141', '29-1151', '29-2061'],
    roles: [
      {
        id: 'lpn',
        label: 'LPN',
        seniorityLevel: 0.6,
        aiReplacementDifficulty: 0.6,
        employmentShareEstimate: 0.30,
        bfcsThresholds: { better: 0.6, faster: 0.6, cheaper: 0.5, safer: 0.95 },
      },
      {
        id: 'rn',
        label: 'RN',
        seniorityLevel: 0.75,
        aiReplacementDifficulty: 0.75,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.7, faster: 0.65, cheaper: 0.6, safer: 0.97 },
      },
      {
        id: 'nurse_practitioner',
        label: 'Nurse Practitioner',
        seniorityLevel: 0.85,
        aiReplacementDifficulty: 0.85,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.8, faster: 0.7, cheaper: 0.7, safer: 0.98 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.10, agentic: 0.20, embodied: 0.70 }),
    },
    deploymentType: 'hybrid',
    employmentMultiplier: 2.0,
    adoptionLag: 2,
    geopoliticalRiskExposure: 0.1,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.0,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.45,
    govDemandShare: 0.40,
    wageElasticity: 0.5,
    // DEPRECATED: taskAutomatableFraction: { lpn: 0.50, rn: 0.40, nurse_practitioner: 0.30 },
  },

  // 3.3 Technicians / Diagnostics
  {
    id: 'health_technicians',
    name: 'Technicians / Diagnostics',
    category: 'Healthcare',
    socCodes: ['29-2010', '29-2011', '29-2012', '29-2030', '29-2031', '29-2032', '29-2033', '29-2034', '29-2035', '29-2040', '29-2050', '29-2055', '29-2056', '29-2057', '29-2061', '29-2099'],
    roles: [
      {
        id: 'lab_technician',
        label: 'Lab Technician',
        seniorityLevel: 0.6,
        aiReplacementDifficulty: 0.6,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.5, faster: 0.6, cheaper: 0.4, safer: 0.85 },
      },
      {
        id: 'imaging_technician',
        label: 'Radiologic/Imaging',
        seniorityLevel: 0.7,
        aiReplacementDifficulty: 0.7,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.6, faster: 0.7, cheaper: 0.5, safer: 0.9 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.15, agentic: 0.20, embodied: 0.65 }),
    },
    deploymentType: 'hybrid',
    employmentMultiplier: 1.8,
    adoptionLag: 2,
    geopoliticalRiskExposure: 0.1,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.0,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.45,
    govDemandShare: 0.40,
    wageElasticity: 0.5,
    // DEPRECATED: taskAutomatableFraction: { lab_technician: 0.60, imaging_technician: 0.50 },
  },

  // 3.4 Home Health / Aides
  {
    id: 'health_home_health',
    name: 'Home Health / Aides',
    category: 'Healthcare',
    socCodes: ['31-1120', '31-1131', '39-9021'],
    roles: [
      {
        id: 'home_health_aide',
        label: 'Home Health Aide',
        seniorityLevel: 0.4,
        aiReplacementDifficulty: 0.4,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.4, faster: 0.4, cheaper: 0.3, safer: 0.95 },
      },
      {
        id: 'personal_care_aide',
        label: 'Personal Care Aide',
        seniorityLevel: 0.35,
        aiReplacementDifficulty: 0.35,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.35, faster: 0.35, cheaper: 0.25, safer: 0.995 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.05, agentic: 0.15, embodied: 0.80 }),
    },
    deploymentType: 'robotics',
    employmentMultiplier: 1.5,
    adoptionLag: 3,
    geopoliticalRiskExposure: 0.2,
    notes:
      'Elder care has extremely high Safer threshold. Physical presence and emotional component resist automation.',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 0.8,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.40,
    govDemandShare: 0.50,
    wageElasticity: 0.4,
    // DEPRECATED: taskAutomatableFraction: { home_health_aide: 0.40, personal_care_aide: 0.35 },
  },

  // 3.5 Healthcare Administration
  {
    id: 'health_admin',
    name: 'Healthcare Administration',
    category: 'Healthcare',
    socCodes: ['11-9111', '43-6013', '29-2071'],
    roles: [
      {
        id: 'medical_coder',
        label: 'Medical Coder/Biller',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 0.30,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.5 },
      },
      {
        id: 'admin_staff',
        label: 'Admin Staff',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.4 },
      },
      {
        id: 'hospital_admin',
        label: 'Hospital Administrator',
        seniorityLevel: 0.75,
        aiReplacementDifficulty: 0.75,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.6, faster: 0.6, cheaper: 0.5, safer: 0.6 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.35, agentic: 0.60, embodied: 0.05 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 1.5,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes:
      'HIGH DISPLACEMENT TARGET. Administrative bloat in healthcare is a policy priority for cost reduction.',
    protectedByPolicy: false,
    policyDisplacementTarget: true,
    // DEPRECATED: productivityToHeadcountRatio: 1.0,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.45,
    govDemandShare: 0.40,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { medical_coder: 0.80, admin_staff: 0.75, hospital_admin: 0.50 },
  },

  // ============================================================
  // 4. EDUCATION
  // ============================================================

  // 4.1 Teachers / Professors
  {
    id: 'edu_teachers',
    name: 'Teachers / Professors',
    category: 'Education',
    socCodes: ['25-1000', '25-1011', '25-1021', '25-1022', '25-1031', '25-1032', '25-1041', '25-1042', '25-1043', '25-1051', '25-1052', '25-1053', '25-1054', '25-1061', '25-1062', '25-1063', '25-1064', '25-1065', '25-1066', '25-1071', '25-1072', '25-1081', '25-1082', '25-1099', '25-2011', '25-2012', '25-2021', '25-2022', '25-2031', '25-2032', '25-2051', '25-2052', '25-2053', '25-2054', '25-2059', '25-3011', '25-3021', '25-3031', '25-3041', '25-3099'],
    roles: [
      {
        id: 'k12_teacher',
        label: 'K-12 Teacher',
        seniorityLevel: 0.7,
        aiReplacementDifficulty: 0.7,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.9, faster: 0.8, cheaper: 0.8, safer: 0.95 },
      },
      {
        id: 'professor',
        label: 'College Professor',
        seniorityLevel: 0.85,
        aiReplacementDifficulty: 0.85,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.9, faster: 0.8, cheaper: 0.7, safer: 0.9 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.45, agentic: 0.40, embodied: 0.15 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 1.8,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes:
      'PROTECTED BY POLICY. AI tutors augment but don\'t replace teachers. productivity_to_headcount_ratio = 0.1. Each student gets AI tutor + human teacher oversight.',
    protectedByPolicy: true,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.1,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.20,
    govDemandShare: 0.70,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { k12_teacher: 0.30, professor: 0.35 },
  },

  // 4.2 Education Administration
  {
    id: 'edu_admin',
    name: 'Education Administration',
    category: 'Education',
    socCodes: ['11-9032', '11-9033', '11-9039'],
    roles: [
      {
        id: 'school_admin',
        label: 'School Admin Staff',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.4 },
      },
      {
        id: 'district_admin',
        label: 'District/University Admin',
        seniorityLevel: 0.7,
        aiReplacementDifficulty: 0.7,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.5, faster: 0.55, cheaper: 0.4, safer: 0.5 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.30, agentic: 0.65, embodied: 0.05 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 1.3,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes:
      'HIGH DISPLACEMENT TARGET. Policy assumption: administrators are bloat and will be removed in AI era to drive down education costs. productivity_to_headcount_ratio = 1.0.',
    protectedByPolicy: false,
    policyDisplacementTarget: true,
    // DEPRECATED: productivityToHeadcountRatio: 1.0,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.20,
    govDemandShare: 0.70,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { school_admin: 0.80, district_admin: 0.60 },
  },

  // 4.3 Education Support
  {
    id: 'edu_support',
    name: 'Education Support',
    category: 'Education',
    socCodes: ['25-9000', '25-4000'],
    roles: [
      {
        id: 'teaching_assistant',
        label: 'Teaching Assistants',
        seniorityLevel: 0.4,
        aiReplacementDifficulty: 0.4,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.5, faster: 0.5, cheaper: 0.4, safer: 0.7 },
      },
      {
        id: 'librarian',
        label: 'Librarians/Media',
        seniorityLevel: 0.6,
        aiReplacementDifficulty: 0.6,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.5, faster: 0.6, cheaper: 0.4, safer: 0.5 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.35, agentic: 0.40, embodied: 0.25 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 1.3,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.15,
    govDemandShare: 0.75,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { teaching_assistant: 0.65, librarian: 0.55 },
  },

  // ============================================================
  // 5. LEGAL
  // ============================================================

  // 5.1 Attorneys
  {
    id: 'legal_attorneys',
    name: 'Attorneys',
    category: 'Legal',
    socCodes: ['23-1011', '23-1021', '23-1022'],
    roles: [
      {
        id: 'junior_associate',
        label: 'Junior Associate',
        seniorityLevel: 0.65,
        aiReplacementDifficulty: 0.65,
        employmentShareEstimate: 0.30,
        bfcsThresholds: { better: 0.6, faster: 0.65, cheaper: 0.5, safer: 0.7 },
      },
      {
        id: 'senior_attorney',
        label: 'Senior Attorney',
        seniorityLevel: 0.85,
        aiReplacementDifficulty: 0.85,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.8, faster: 0.75, cheaper: 0.65, safer: 0.85 },
      },
      {
        id: 'partner',
        label: 'Partner/Litigator',
        seniorityLevel: 0.95,
        aiReplacementDifficulty: 0.95,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.9, faster: 0.8, cheaper: 0.75, safer: 0.9 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.50, agentic: 0.45, embodied: 0.05 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 3.0,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.30,
    govDemandShare: 0.10,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { junior_associate: 0.70, senior_attorney: 0.45, partner: 0.25 },
  },

  // 5.2 Paralegals / Legal Assistants
  {
    id: 'legal_paralegals',
    name: 'Paralegals / Legal Assistants',
    category: 'Legal',
    socCodes: ['23-2011', '23-2099'],
    roles: [
      {
        id: 'legal_secretary',
        label: 'Legal Secretary',
        seniorityLevel: 0.4,
        aiReplacementDifficulty: 0.4,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.4 },
      },
      {
        id: 'paralegal',
        label: 'Paralegal',
        seniorityLevel: 0.6,
        aiReplacementDifficulty: 0.6,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.5, faster: 0.6, cheaper: 0.4, safer: 0.6 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.45, agentic: 0.50, embodied: 0.05 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 2.5,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.30,
    govDemandShare: 0.10,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { legal_secretary: 0.80, paralegal: 0.65 },
  },

  // ============================================================
  // 6. TRANSPORTATION
  // ============================================================

  // 6.1 Trucking / Long-Haul
  {
    id: 'transport_trucking',
    name: 'Trucking / Long-Haul',
    category: 'Transportation',
    socCodes: ['53-3032'],
    roles: [
      {
        id: 'long_haul',
        label: 'Long-Haul Driver',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.7, faster: 0.7, cheaper: 0.6, safer: 0.99 },
      },
      {
        id: 'short_haul',
        label: 'Local/Short-Haul',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.6, faster: 0.6, cheaper: 0.5, safer: 0.97 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.05, agentic: 0.10, embodied: 0.85 }),
    },
    deploymentType: 'autonomous_vehicle',
    employmentMultiplier: 3.4,
    adoptionLag: 3,
    geopoliticalRiskExposure: 0.15,
    notes:
      'Tesla Semi anchors deployment timeline. Fleet conversion takes 10-15 years even after full capability.',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 0.6,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.30,
    govDemandShare: 0.05,
    wageElasticity: 0.3,
    // DEPRECATED: taskAutomatableFraction: { long_haul: 0.70, short_haul: 0.60 },
  },

  // 6.2 Local Delivery
  {
    id: 'transport_delivery',
    name: 'Local Delivery',
    category: 'Transportation',
    socCodes: ['53-3031', '43-5021'],
    roles: [
      {
        id: 'delivery_driver',
        label: 'Delivery Driver',
        seniorityLevel: 0.4,
        aiReplacementDifficulty: 0.4,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.5, faster: 0.6, cheaper: 0.4, safer: 0.95 },
      },
      {
        id: 'courier',
        label: 'Courier/Last-Mile',
        seniorityLevel: 0.35,
        aiReplacementDifficulty: 0.35,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.45, faster: 0.5, cheaper: 0.35, safer: 0.9 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.05, agentic: 0.10, embodied: 0.85 }),
    },
    deploymentType: 'hybrid',
    employmentMultiplier: 2.0,
    adoptionLag: 2,
    geopoliticalRiskExposure: 0.1,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.0,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.55,
    govDemandShare: 0.05,
    wageElasticity: 0.5,
    // DEPRECATED: taskAutomatableFraction: { delivery_driver: 0.65, courier: 0.60 },
  },

  // 6.3 Taxi / Rideshare
  {
    id: 'transport_taxi',
    name: 'Taxi / Rideshare',
    category: 'Transportation',
    socCodes: ['53-3041', '53-3054'],
    roles: [
      {
        id: 'driver',
        label: 'Taxi/Rideshare Driver',
        seniorityLevel: 0.4,
        aiReplacementDifficulty: 0.4,
        employmentShareEstimate: 1.0,
        bfcsThresholds: { better: 0.5, faster: 0.6, cheaper: 0.4, safer: 0.97 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.05, agentic: 0.10, embodied: 0.85 }),
    },
    deploymentType: 'autonomous_vehicle',
    employmentMultiplier: 2.2,
    adoptionLag: 3,
    geopoliticalRiskExposure: 0.15,
    notes:
      'Tesla Cybercab is the anchor. Regulatory approval is the primary lag factor.',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 0.6,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.85,
    govDemandShare: 0.05,
    wageElasticity: 0.3,
    // DEPRECATED: taskAutomatableFraction: { driver: 0.70 },
  },

  // 6.4 Warehousing / Logistics
  {
    id: 'transport_warehouse',
    name: 'Warehousing / Logistics',
    category: 'Transportation',
    socCodes: ['53-7062', '53-7064', '43-5071'],
    roles: [
      {
        id: 'warehouse_worker',
        label: 'Warehouse Worker',
        seniorityLevel: 0.4,
        aiReplacementDifficulty: 0.4,
        employmentShareEstimate: 0.40,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.5 },
      },
      {
        id: 'equipment_operator',
        label: 'Forklift/Equipment Operator',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 0.35,
        bfcsThresholds: { better: 0.5, faster: 0.6, cheaper: 0.4, safer: 0.7 },
      },
      {
        id: 'logistics_coordinator',
        label: 'Logistics Coordinator',
        seniorityLevel: 0.7,
        aiReplacementDifficulty: 0.7,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.6, faster: 0.7, cheaper: 0.5, safer: 0.6 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.05, agentic: 0.15, embodied: 0.80 }),
    },
    deploymentType: 'robotics',
    employmentMultiplier: 2.5,
    adoptionLag: 3,
    geopoliticalRiskExposure: 0.2,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 0.8,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.40,
    govDemandShare: 0.05,
    wageElasticity: 0.4,
    // DEPRECATED: taskAutomatableFraction: { warehouse_worker: 0.70, equipment_operator: 0.60, logistics_coordinator: 0.45 },
  },

  // ============================================================
  // 7. MANUFACTURING
  // ============================================================

  // 7.1 Assembly / Production
  {
    id: 'mfg_assembly',
    name: 'Assembly / Production',
    category: 'Manufacturing',
    socCodes: ['51-2000', '51-2011', '51-2021', '51-2022', '51-2023', '51-2028', '51-2031', '51-2041', '51-2051', '51-2090', '51-2091', '51-2092', '51-2093', '51-2098', '51-2099'],
    roles: [
      {
        id: 'line_worker',
        label: 'Line Worker',
        seniorityLevel: 0.4,
        aiReplacementDifficulty: 0.4,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.6 },
      },
      {
        id: 'skilled_assembler',
        label: 'Skilled Assembler',
        seniorityLevel: 0.6,
        aiReplacementDifficulty: 0.6,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.55, faster: 0.6, cheaper: 0.45, safer: 0.7 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.05, agentic: 0.10, embodied: 0.85 }),
    },
    deploymentType: 'robotics',
    employmentMultiplier: 1.6,
    adoptionLag: 3,
    geopoliticalRiskExposure: 0.2,
    notes: 'Multiplier from Moretti 2010.',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 0.8,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.35,
    govDemandShare: 0.15,
    wageElasticity: 0.4,
    // DEPRECATED: taskAutomatableFraction: { line_worker: 0.70, skilled_assembler: 0.55 },
  },

  // 7.2 Skilled Machinists
  {
    id: 'mfg_machinists',
    name: 'Skilled Machinists',
    category: 'Manufacturing',
    socCodes: ['51-4041', '51-4011', '51-4111'],
    roles: [
      {
        id: 'cnc_operator',
        label: 'CNC Operator',
        seniorityLevel: 0.6,
        aiReplacementDifficulty: 0.6,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.5, faster: 0.6, cheaper: 0.4, safer: 0.75 },
      },
      {
        id: 'master_machinist',
        label: 'Master Machinist',
        seniorityLevel: 0.85,
        aiReplacementDifficulty: 0.85,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.8, faster: 0.75, cheaper: 0.6, safer: 0.9 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.05, agentic: 0.10, embodied: 0.85 }),
    },
    deploymentType: 'robotics',
    employmentMultiplier: 1.8,
    adoptionLag: 3,
    geopoliticalRiskExposure: 0.2,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 0.8,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.15,
    govDemandShare: 0.15,
    wageElasticity: 0.4,
    // DEPRECATED: taskAutomatableFraction: { cnc_operator: 0.55, master_machinist: 0.35 },
  },

  // 7.3 Quality Control
  {
    id: 'mfg_qc',
    name: 'Quality Control',
    category: 'Manufacturing',
    socCodes: ['51-9061'],
    roles: [
      {
        id: 'inspector',
        label: 'Inspector',
        seniorityLevel: 0.6,
        aiReplacementDifficulty: 0.6,
        employmentShareEstimate: 1.0,
        bfcsThresholds: { better: 0.5, faster: 0.7, cheaper: 0.4, safer: 0.8 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.20, agentic: 0.25, embodied: 0.55 }),
    },
    deploymentType: 'hybrid',
    employmentMultiplier: 1.5,
    adoptionLag: 2,
    geopoliticalRiskExposure: 0.1,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.0,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.25,
    govDemandShare: 0.15,
    wageElasticity: 0.5,
    // DEPRECATED: taskAutomatableFraction: { inspector: 0.60 },
  },

  // ============================================================
  // 8. CONSTRUCTION / TRADES
  // ============================================================

  // 8.1 Electricians
  {
    id: 'construction_electricians',
    name: 'Electricians',
    category: 'Construction / Trades',
    socCodes: ['47-2111'],
    roles: [
      {
        id: 'apprentice',
        label: 'Apprentice',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 0.30,
        bfcsThresholds: { better: 0.5, faster: 0.5, cheaper: 0.4, safer: 0.9 },
      },
      {
        id: 'journeyman',
        label: 'Journeyman',
        seniorityLevel: 0.75,
        aiReplacementDifficulty: 0.75,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.7, faster: 0.65, cheaper: 0.55, safer: 0.95 },
      },
      {
        id: 'master',
        label: 'Master Electrician',
        seniorityLevel: 0.9,
        aiReplacementDifficulty: 0.9,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.85, faster: 0.75, cheaper: 0.65, safer: 0.98 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.05, agentic: 0.10, embodied: 0.85 }),
    },
    deploymentType: 'robotics',
    employmentMultiplier: 2.4,
    adoptionLag: 3,
    geopoliticalRiskExposure: 0.2,
    notes:
      'High complexity trade -- requires navigating unique building layouts, reading schematics, making judgment calls. Among the LAST trades automated.',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 0.8,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.30,
    govDemandShare: 0.20,
    wageElasticity: 0.3,
    // DEPRECATED: taskAutomatableFraction: { apprentice: 0.50, journeyman: 0.35, master: 0.20 },
  },

  // 8.2 Plumbers
  {
    id: 'construction_plumbers',
    name: 'Plumbers',
    category: 'Construction / Trades',
    socCodes: ['47-2152'],
    roles: [
      {
        id: 'apprentice',
        label: 'Apprentice',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.5, faster: 0.5, cheaper: 0.4, safer: 0.85 },
      },
      {
        id: 'journeyman',
        label: 'Journeyman',
        seniorityLevel: 0.75,
        aiReplacementDifficulty: 0.75,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.7, faster: 0.65, cheaper: 0.55, safer: 0.9 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.05, agentic: 0.10, embodied: 0.85 }),
    },
    deploymentType: 'robotics',
    employmentMultiplier: 2.2,
    adoptionLag: 3,
    geopoliticalRiskExposure: 0.2,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 0.8,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.35,
    govDemandShare: 0.20,
    wageElasticity: 0.3,
    // DEPRECATED: taskAutomatableFraction: { apprentice: 0.50, journeyman: 0.35 },
  },

  // 8.3 General Construction
  {
    id: 'construction_general',
    name: 'General Construction',
    category: 'Construction / Trades',
    socCodes: ['47-2061', '47-2031', '47-2051'],
    roles: [
      {
        id: 'laborer',
        label: 'Laborer',
        seniorityLevel: 0.35,
        aiReplacementDifficulty: 0.35,
        employmentShareEstimate: 0.35,
        bfcsThresholds: { better: 0.35, faster: 0.4, cheaper: 0.25, safer: 0.6 },
      },
      {
        id: 'carpenter',
        label: 'Carpenter',
        seniorityLevel: 0.6,
        aiReplacementDifficulty: 0.6,
        employmentShareEstimate: 0.35,
        bfcsThresholds: { better: 0.55, faster: 0.55, cheaper: 0.4, safer: 0.75 },
      },
      {
        id: 'heavy_equipment',
        label: 'Heavy Equipment Operator',
        seniorityLevel: 0.6,
        aiReplacementDifficulty: 0.6,
        employmentShareEstimate: 0.30,
        bfcsThresholds: { better: 0.5, faster: 0.6, cheaper: 0.4, safer: 0.8 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.20, agentic: 0.45, embodied: 0.35 }),
    },
    deploymentType: 'robotics',
    employmentMultiplier: 2.4,
    adoptionLag: 3,
    geopoliticalRiskExposure: 0.2,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 0.8,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.35,
    govDemandShare: 0.25,
    wageElasticity: 0.3,
    // DEPRECATED: taskAutomatableFraction: { laborer: 0.65, carpenter: 0.45, heavy_equipment: 0.55 },
  },

  // 8.4 HVAC
  {
    id: 'construction_hvac',
    name: 'HVAC',
    category: 'Construction / Trades',
    socCodes: ['49-9021'],
    roles: [
      {
        id: 'technician',
        label: 'Technician',
        seniorityLevel: 0.6,
        aiReplacementDifficulty: 0.6,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.55, faster: 0.55, cheaper: 0.45, safer: 0.85 },
      },
      {
        id: 'senior_technician',
        label: 'Senior Technician',
        seniorityLevel: 0.75,
        aiReplacementDifficulty: 0.75,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.7, faster: 0.65, cheaper: 0.55, safer: 0.9 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.05, agentic: 0.10, embodied: 0.85 }),
    },
    deploymentType: 'robotics',
    employmentMultiplier: 2.0,
    adoptionLag: 3,
    geopoliticalRiskExposure: 0.2,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 0.8,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.35,
    govDemandShare: 0.20,
    wageElasticity: 0.3,
    // DEPRECATED: taskAutomatableFraction: { technician: 0.50, senior_technician: 0.35 },
  },

  // ============================================================
  // 9. RETAIL
  // ============================================================

  // 9.1 Cashiers / Floor
  {
    id: 'retail_cashiers',
    name: 'Cashiers / Floor',
    category: 'Retail',
    socCodes: ['41-2011', '41-2031'],
    roles: [
      {
        id: 'cashier',
        label: 'Cashier',
        seniorityLevel: 0.3,
        aiReplacementDifficulty: 0.3,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.3, faster: 0.4, cheaper: 0.2, safer: 0.3 },
      },
      {
        id: 'sales_associate',
        label: 'Sales Associate',
        seniorityLevel: 0.4,
        aiReplacementDifficulty: 0.4,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.4 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.10, agentic: 0.30, embodied: 0.60 }),
    },
    deploymentType: 'hybrid',
    employmentMultiplier: 1.2,
    adoptionLag: 2,
    geopoliticalRiskExposure: 0.1,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.0,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.85,
    govDemandShare: 0.05,
    wageElasticity: 0.5,
    // DEPRECATED: taskAutomatableFraction: { cashier: 0.80, sales_associate: 0.65 },
  },

  // 9.2 Retail Management
  {
    id: 'retail_management',
    name: 'Retail Management',
    category: 'Retail',
    socCodes: ['41-1011', '41-1012'],
    roles: [
      {
        id: 'store_manager',
        label: 'Store Manager',
        seniorityLevel: 0.65,
        aiReplacementDifficulty: 0.65,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.6, faster: 0.6, cheaper: 0.5, safer: 0.6 },
      },
      {
        id: 'district_manager',
        label: 'District Manager',
        seniorityLevel: 0.8,
        aiReplacementDifficulty: 0.8,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.75, faster: 0.7, cheaper: 0.6, safer: 0.7 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.25, agentic: 0.60, embodied: 0.15 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 1.5,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.80,
    govDemandShare: 0.05,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { store_manager: 0.50, district_manager: 0.40 },
  },

  // 9.3 E-commerce / Fulfillment
  {
    id: 'retail_ecommerce',
    name: 'E-commerce / Fulfillment',
    category: 'Retail',
    socCodes: ['43-5011', '53-7065'],
    roles: [
      {
        id: 'fulfillment_worker',
        label: 'Fulfillment Worker',
        seniorityLevel: 0.35,
        aiReplacementDifficulty: 0.35,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.35, faster: 0.45, cheaper: 0.25, safer: 0.5 },
      },
      {
        id: 'ecommerce_coordinator',
        label: 'E-commerce Coordinator',
        seniorityLevel: 0.6,
        aiReplacementDifficulty: 0.6,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.5, faster: 0.6, cheaper: 0.4, safer: 0.5 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.40, agentic: 0.55, embodied: 0.05 }),
    },
    deploymentType: 'robotics',
    employmentMultiplier: 1.8,
    adoptionLag: 3,
    geopoliticalRiskExposure: 0.2,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 0.8,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.80,
    govDemandShare: 0.05,
    wageElasticity: 0.4,
    // DEPRECATED: taskAutomatableFraction: { fulfillment_worker: 0.70, ecommerce_coordinator: 0.50 },
  },

  // ============================================================
  // 10. FOOD SERVICE
  // ============================================================

  // 10.1 Fast Food
  {
    id: 'food_fast_food',
    name: 'Fast Food',
    category: 'Food Service',
    socCodes: ['35-3023', '35-2014'],
    roles: [
      {
        id: 'counter',
        label: 'Counter/Drive-Through',
        seniorityLevel: 0.3,
        aiReplacementDifficulty: 0.3,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.3, faster: 0.4, cheaper: 0.2, safer: 0.4 },
      },
      {
        id: 'line_cook',
        label: 'Line Cook',
        seniorityLevel: 0.4,
        aiReplacementDifficulty: 0.4,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.35, faster: 0.45, cheaper: 0.25, safer: 0.5 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.05, agentic: 0.15, embodied: 0.80 }),
    },
    deploymentType: 'robotics',
    employmentMultiplier: 1.3,
    adoptionLag: 3,
    geopoliticalRiskExposure: 0.2,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 0.8,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.90,
    govDemandShare: 0.05,
    wageElasticity: 0.4,
    // DEPRECATED: taskAutomatableFraction: { counter: 0.75, line_cook: 0.60 },
  },

  // 10.2 Sit-Down Restaurant
  {
    id: 'food_restaurant',
    name: 'Sit-Down Restaurant',
    category: 'Food Service',
    socCodes: ['35-1012', '35-3031', '35-2014'],
    roles: [
      {
        id: 'server',
        label: 'Server',
        seniorityLevel: 0.4,
        aiReplacementDifficulty: 0.4,
        employmentShareEstimate: 0.30,
        bfcsThresholds: { better: 0.4, faster: 0.4, cheaper: 0.3, safer: 0.5 },
      },
      {
        id: 'chef',
        label: 'Chef',
        seniorityLevel: 0.7,
        aiReplacementDifficulty: 0.7,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.6, faster: 0.5, cheaper: 0.5, safer: 0.6 },
      },
      {
        id: 'head_chef',
        label: 'Head Chef',
        seniorityLevel: 0.85,
        aiReplacementDifficulty: 0.85,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.8, faster: 0.6, cheaper: 0.6, safer: 0.7 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.05, agentic: 0.15, embodied: 0.80 }),
    },
    deploymentType: 'robotics',
    employmentMultiplier: 1.4,
    adoptionLag: 3,
    geopoliticalRiskExposure: 0.2,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 0.8,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.85,
    govDemandShare: 0.05,
    wageElasticity: 0.4,
    // DEPRECATED: taskAutomatableFraction: { server: 0.55, chef: 0.40, head_chef: 0.25 },
  },

  // 10.3 Food Prep / Industrial
  {
    id: 'food_industrial',
    name: 'Food Prep / Industrial',
    category: 'Food Service',
    socCodes: ['35-2021', '51-3091', '51-3092'],
    roles: [
      {
        id: 'food_processing',
        label: 'Food Processing Worker',
        seniorityLevel: 0.35,
        aiReplacementDifficulty: 0.35,
        employmentShareEstimate: 1.0,
        bfcsThresholds: { better: 0.3, faster: 0.4, cheaper: 0.2, safer: 0.5 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.05, agentic: 0.15, embodied: 0.80 }),
    },
    deploymentType: 'robotics',
    employmentMultiplier: 1.5,
    adoptionLag: 3,
    geopoliticalRiskExposure: 0.2,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 0.8,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.65,
    govDemandShare: 0.10,
    wageElasticity: 0.4,
    // DEPRECATED: taskAutomatableFraction: { food_processing: 0.70 },
  },

  // ============================================================
  // 11. CREATIVE
  // ============================================================

  // 11.1 Design / Visual
  {
    id: 'creative_design',
    name: 'Design / Visual',
    category: 'Creative',
    socCodes: ['27-1024', '27-1025', '27-1014'],
    roles: [
      {
        id: 'junior_designer',
        label: 'Junior Designer',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 0.30,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.3 },
      },
      {
        id: 'senior_designer',
        label: 'Senior Designer',
        seniorityLevel: 0.8,
        aiReplacementDifficulty: 0.8,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.7, faster: 0.7, cheaper: 0.6, safer: 0.5 },
      },
      {
        id: 'art_director',
        label: 'Art Director',
        seniorityLevel: 0.9,
        aiReplacementDifficulty: 0.9,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.85, faster: 0.75, cheaper: 0.7, safer: 0.6 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.75, agentic: 0.20, embodied: 0.05 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 2.5,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes:
      'Low Safer thresholds -- bad design isn\'t catastrophic. Gen AI already near threshold for junior roles.',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.15,
    govDemandShare: 0.05,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { junior_designer: 0.75, senior_designer: 0.50, art_director: 0.30 },
  },

  // 11.2 Writing / Content
  {
    id: 'creative_writing',
    name: 'Writing / Content',
    category: 'Creative',
    socCodes: ['27-3043', '27-3042', '27-3041'],
    roles: [
      {
        id: 'content_writer',
        label: 'Content Writer',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 0.30,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.3 },
      },
      {
        id: 'journalist',
        label: 'Journalist',
        seniorityLevel: 0.75,
        aiReplacementDifficulty: 0.75,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.65, faster: 0.6, cheaper: 0.5, safer: 0.6 },
      },
      {
        id: 'senior_editor',
        label: 'Senior Editor',
        seniorityLevel: 0.85,
        aiReplacementDifficulty: 0.85,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.8, faster: 0.7, cheaper: 0.6, safer: 0.7 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.80, agentic: 0.15, embodied: 0.05 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 2.0,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.35,
    govDemandShare: 0.10,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { content_writer: 0.75, journalist: 0.50, senior_editor: 0.35 },
  },

  // 11.3 Marketing / Advertising
  {
    id: 'creative_marketing',
    name: 'Marketing / Advertising',
    category: 'Creative',
    socCodes: ['13-1161', '27-3031'],
    roles: [
      {
        id: 'marketing_coordinator',
        label: 'Marketing Coordinator',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 0.30,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.3 },
      },
      {
        id: 'marketing_manager',
        label: 'Marketing Manager',
        seniorityLevel: 0.75,
        aiReplacementDifficulty: 0.75,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.65, faster: 0.65, cheaper: 0.5, safer: 0.5 },
      },
      {
        id: 'cmo_director',
        label: 'CMO/Director',
        seniorityLevel: 0.9,
        aiReplacementDifficulty: 0.9,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.85, faster: 0.75, cheaper: 0.7, safer: 0.7 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.55, agentic: 0.40, embodied: 0.05 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 2.3,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.10,
    govDemandShare: 0.05,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { marketing_coordinator: 0.75, marketing_manager: 0.50, cmo_director: 0.30 },
  },

  // 11.4 Media Production
  {
    id: 'creative_media',
    name: 'Media Production',
    category: 'Creative',
    socCodes: ['27-4011', '27-4014', '27-4021', '27-4032'],
    roles: [
      {
        id: 'production_assistant',
        label: 'Production Assistant',
        seniorityLevel: 0.4,
        aiReplacementDifficulty: 0.4,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.3 },
      },
      {
        id: 'editor_producer',
        label: 'Editor/Producer',
        seniorityLevel: 0.75,
        aiReplacementDifficulty: 0.75,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.65, faster: 0.65, cheaper: 0.5, safer: 0.5 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.65, agentic: 0.20, embodied: 0.15 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 2.0,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.50,
    govDemandShare: 0.05,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { production_assistant: 0.70, editor_producer: 0.50 },
  },

  // ============================================================
  // 12. PROFESSIONAL SERVICES
  // ============================================================

  // 12.1 Consulting
  {
    id: 'prof_consulting',
    name: 'Consulting',
    category: 'Professional Services',
    socCodes: ['13-1111', '13-1199'],
    roles: [
      {
        id: 'junior_consultant',
        label: 'Junior Consultant',
        seniorityLevel: 0.6,
        aiReplacementDifficulty: 0.6,
        employmentShareEstimate: 0.30,
        bfcsThresholds: { better: 0.5, faster: 0.6, cheaper: 0.4, safer: 0.5 },
      },
      {
        id: 'senior_consultant',
        label: 'Senior Consultant',
        seniorityLevel: 0.8,
        aiReplacementDifficulty: 0.8,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.7, faster: 0.7, cheaper: 0.6, safer: 0.7 },
      },
      {
        id: 'partner_director',
        label: 'Partner/Director',
        seniorityLevel: 0.95,
        aiReplacementDifficulty: 0.95,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.9, faster: 0.8, cheaper: 0.75, safer: 0.85 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.45, agentic: 0.50, embodied: 0.05 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 3.5,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.10,
    govDemandShare: 0.15,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { junior_consultant: 0.70, senior_consultant: 0.45, partner_director: 0.25 },
  },

  // 12.2 Human Resources
  {
    id: 'prof_hr',
    name: 'Human Resources',
    category: 'Professional Services',
    socCodes: ['13-1071', '13-1075', '11-3121'],
    roles: [
      {
        id: 'hr_coordinator',
        label: 'HR Coordinator',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.4 },
      },
      {
        id: 'hr_manager',
        label: 'HR Manager',
        seniorityLevel: 0.7,
        aiReplacementDifficulty: 0.7,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.6, faster: 0.6, cheaper: 0.5, safer: 0.6 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.30, agentic: 0.65, embodied: 0.05 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 1.5,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.05,
    govDemandShare: 0.10,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { hr_coordinator: 0.75, hr_manager: 0.50 },
  },

  // 12.3 Real Estate
  {
    id: 'prof_real_estate',
    name: 'Real Estate',
    category: 'Professional Services',
    socCodes: ['41-9022', '41-9021'],
    roles: [
      {
        id: 'agent',
        label: 'Agent',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.5, faster: 0.5, cheaper: 0.4, safer: 0.4 },
      },
      {
        id: 'broker',
        label: 'Broker',
        seniorityLevel: 0.75,
        aiReplacementDifficulty: 0.75,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.7, faster: 0.65, cheaper: 0.55, safer: 0.6 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.20, agentic: 0.40, embodied: 0.40 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 2.0,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.60,
    govDemandShare: 0.05,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { agent: 0.60, broker: 0.40 },
  },

  // 12.4 Administrative / Clerical
  {
    id: 'prof_admin',
    name: 'Administrative / Clerical',
    category: 'Professional Services',
    socCodes: ['43-6014', '43-9061', '43-4051', '43-1011'],
    roles: [
      {
        id: 'receptionist',
        label: 'Receptionist',
        seniorityLevel: 0.3,
        aiReplacementDifficulty: 0.3,
        employmentShareEstimate: 0.30,
        bfcsThresholds: { better: 0.3, faster: 0.4, cheaper: 0.2, safer: 0.3 },
      },
      {
        id: 'admin_assistant',
        label: 'Admin Assistant',
        seniorityLevel: 0.45,
        aiReplacementDifficulty: 0.45,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.35, faster: 0.45, cheaper: 0.25, safer: 0.3 },
      },
      {
        id: 'executive_assistant',
        label: 'Executive Assistant',
        seniorityLevel: 0.65,
        aiReplacementDifficulty: 0.65,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.55, faster: 0.6, cheaper: 0.45, safer: 0.5 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.30, agentic: 0.65, embodied: 0.05 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 1.3,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.40,
    govDemandShare: 0.15,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { receptionist: 0.80, admin_assistant: 0.75, executive_assistant: 0.50 },
  },

  // ============================================================
  // 13. GOVERNMENT / PUBLIC SECTOR
  // ============================================================

  // 13.1 Federal Civilian
  {
    id: 'gov_federal',
    name: 'Federal Civilian',
    category: 'Government',
    socCodes: [],
    roles: [
      {
        id: 'clerical_admin',
        label: 'Clerical/Admin',
        seniorityLevel: 0.4,
        aiReplacementDifficulty: 0.4,
        employmentShareEstimate: 0.30,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.4 },
      },
      {
        id: 'analyst',
        label: 'Analyst/Professional',
        seniorityLevel: 0.7,
        aiReplacementDifficulty: 0.7,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.6, faster: 0.65, cheaper: 0.5, safer: 0.65 },
      },
      {
        id: 'senior_management',
        label: 'Senior/Management',
        seniorityLevel: 0.85,
        aiReplacementDifficulty: 0.85,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.8, faster: 0.75, cheaper: 0.6, safer: 0.8 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.30, agentic: 0.60, embodied: 0.10 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 1.8,
    adoptionLag: 5,
    geopoliticalRiskExposure: 0,
    notes:
      'Government adoption is SLOW. Add extra lag of 3-5 years to adoption S-curve. Union protections further slow displacement.',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.00,
    govDemandShare: 0.95,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { clerical_admin: 0.70, analyst: 0.50, senior_management: 0.30 },
  },

  // 13.2 State / Local — Similar to Federal but with state-level variation
  {
    id: 'gov_state_local',
    name: 'State / Local Government',
    category: 'Government',
    socCodes: [],
    roles: [
      {
        id: 'clerical_admin',
        label: 'Clerical/Admin',
        seniorityLevel: 0.4,
        aiReplacementDifficulty: 0.4,
        employmentShareEstimate: 0.30,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.4 },
      },
      {
        id: 'analyst',
        label: 'Analyst/Professional',
        seniorityLevel: 0.7,
        aiReplacementDifficulty: 0.7,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.6, faster: 0.65, cheaper: 0.5, safer: 0.65 },
      },
      {
        id: 'senior_management',
        label: 'Senior/Management',
        seniorityLevel: 0.85,
        aiReplacementDifficulty: 0.85,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.8, faster: 0.75, cheaper: 0.6, safer: 0.8 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.30, agentic: 0.55, embodied: 0.15 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 1.8,
    adoptionLag: 5,
    geopoliticalRiskExposure: 0,
    notes:
      'Even slower adoption than federal. Varies significantly by state.',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.00,
    govDemandShare: 0.95,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { clerical_admin: 0.70, analyst: 0.50, senior_management: 0.30 },
  },

  // 13.3 Postal / Delivery Services
  {
    id: 'gov_postal',
    name: 'Postal / Delivery Services',
    category: 'Government',
    socCodes: ['43-5052', '43-5053'],
    roles: [
      {
        id: 'mail_carrier',
        label: 'Mail Carrier',
        seniorityLevel: 0.4,
        aiReplacementDifficulty: 0.4,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.3, safer: 0.8 },
      },
      {
        id: 'sorting_processing',
        label: 'Sorting/Processing',
        seniorityLevel: 0.35,
        aiReplacementDifficulty: 0.35,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.3, faster: 0.5, cheaper: 0.2, safer: 0.5 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.05, agentic: 0.15, embodied: 0.80 }),
    },
    deploymentType: 'hybrid',
    employmentMultiplier: 1.5,
    adoptionLag: 5,
    geopoliticalRiskExposure: 0.1,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.0,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.40,
    govDemandShare: 0.30,
    wageElasticity: 0.5,
    // DEPRECATED: taskAutomatableFraction: { mail_carrier: 0.60, sorting_processing: 0.75 },
  },

  // ============================================================
  // 14. AGRICULTURE
  // ============================================================

  // 14.1 Farm Labor
  {
    id: 'ag_farm_labor',
    name: 'Farm Labor',
    category: 'Agriculture',
    socCodes: ['45-2092', '45-2093'],
    roles: [
      {
        id: 'farmworker',
        label: 'Farmworker',
        seniorityLevel: 0.35,
        aiReplacementDifficulty: 0.35,
        employmentShareEstimate: 0.55,
        bfcsThresholds: { better: 0.35, faster: 0.4, cheaper: 0.25, safer: 0.5 },
      },
      {
        id: 'skilled_ag',
        label: 'Skilled Agricultural Worker',
        seniorityLevel: 0.55,
        aiReplacementDifficulty: 0.55,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.5, faster: 0.55, cheaper: 0.4, safer: 0.6 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.05, agentic: 0.10, embodied: 0.85 }),
    },
    deploymentType: 'robotics',
    employmentMultiplier: 1.8,
    adoptionLag: 3,
    geopoliticalRiskExposure: 0.2,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 0.8,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.45,
    govDemandShare: 0.15,
    wageElasticity: 0.4,
    // DEPRECATED: taskAutomatableFraction: { farmworker: 0.65, skilled_ag: 0.50 },
  },

  // 14.2 Equipment Operation
  {
    id: 'ag_equipment',
    name: 'Equipment Operation',
    category: 'Agriculture',
    socCodes: ['45-2091'],
    roles: [
      {
        id: 'operator',
        label: 'Tractor/Harvester Operator',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 1.0,
        bfcsThresholds: { better: 0.4, faster: 0.5, cheaper: 0.35, safer: 0.7 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.05, agentic: 0.15, embodied: 0.80 }),
    },
    deploymentType: 'autonomous_vehicle',
    employmentMultiplier: 1.6,
    adoptionLag: 3,
    geopoliticalRiskExposure: 0.15,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 0.6,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.30,
    govDemandShare: 0.10,
    wageElasticity: 0.3,
    // DEPRECATED: taskAutomatableFraction: { operator: 0.65 },
  },

  // ============================================================
  // 15. SCIENTIFIC R&D
  // ============================================================

  // 15.1 Lab Research
  {
    id: 'sci_lab_research',
    name: 'Lab Research',
    category: 'Scientific R&D',
    socCodes: ['19-1000', '19-1011', '19-1012', '19-1013', '19-1021', '19-1022', '19-1023', '19-1029', '19-1031', '19-1032', '19-1041', '19-1042', '19-1099', '19-2000', '19-2011', '19-2012', '19-2021', '19-2031', '19-2032', '19-2041', '19-2042', '19-2043', '19-2099', '19-4000', '19-4099'],
    roles: [
      {
        id: 'lab_technician',
        label: 'Lab Technician',
        seniorityLevel: 0.55,
        aiReplacementDifficulty: 0.55,
        employmentShareEstimate: 0.30,
        bfcsThresholds: { better: 0.5, faster: 0.6, cheaper: 0.4, safer: 0.7 },
      },
      {
        id: 'research_scientist',
        label: 'Research Scientist',
        seniorityLevel: 0.85,
        aiReplacementDifficulty: 0.85,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.8, faster: 0.75, cheaper: 0.65, safer: 0.85 },
      },
      {
        id: 'principal_investigator',
        label: 'Principal Investigator',
        seniorityLevel: 0.95,
        aiReplacementDifficulty: 0.95,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.9, faster: 0.8, cheaper: 0.75, safer: 0.9 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.40, agentic: 0.30, embodied: 0.30 }),
    },
    deploymentType: 'hybrid',
    employmentMultiplier: 3.0,
    adoptionLag: 2,
    geopoliticalRiskExposure: 0.1,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.0,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.10,
    govDemandShare: 0.35,
    wageElasticity: 0.5,
    // DEPRECATED: taskAutomatableFraction: { lab_technician: 0.60, research_scientist: 0.40, principal_investigator: 0.25 },
  },

  // 15.2 Engineering / Applied Science
  {
    id: 'sci_engineering',
    name: 'Engineering / Applied Science',
    category: 'Scientific R&D',
    socCodes: ['17-2000', '17-2011', '17-2021', '17-2031', '17-2041', '17-2051', '17-2061', '17-2071', '17-2072', '17-2081', '17-2111', '17-2112', '17-2121', '17-2131', '17-2141', '17-2151', '17-2161', '17-2171', '17-2199'],
    roles: [
      {
        id: 'junior_engineer',
        label: 'Junior Engineer',
        seniorityLevel: 0.6,
        aiReplacementDifficulty: 0.6,
        employmentShareEstimate: 0.30,
        bfcsThresholds: { better: 0.55, faster: 0.6, cheaper: 0.45, safer: 0.7 },
      },
      {
        id: 'senior_engineer',
        label: 'Senior Engineer',
        seniorityLevel: 0.85,
        aiReplacementDifficulty: 0.85,
        employmentShareEstimate: 0.45,
        bfcsThresholds: { better: 0.8, faster: 0.75, cheaper: 0.6, safer: 0.85 },
      },
      {
        id: 'principal_engineer',
        label: 'Principal Engineer',
        seniorityLevel: 0.95,
        aiReplacementDifficulty: 0.95,
        employmentShareEstimate: 0.25,
        bfcsThresholds: { better: 0.9, faster: 0.8, cheaper: 0.7, safer: 0.95 },
      },
    ],
    capabilityRelevance: {
      weights: capWeights({ generative: 0.45, agentic: 0.45, embodied: 0.10 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 2.8,
    adoptionLag: 1,
    geopoliticalRiskExposure: 0,
    notes: '',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 1.5,
    adoptionCeiling: 1.0,
    consumerDemandShare: 0.10,
    govDemandShare: 0.25,
    wageElasticity: 0.7,
    // DEPRECATED: taskAutomatableFraction: { junior_engineer: 0.65, senior_engineer: 0.45, principal_engineer: 0.25 },
  },

  // ============================================================
  // 16. OTHER / UNCATEGORIZED
  // ============================================================

  // FIX: BLS OEWS covers ~74M of the ~158M CES total nonfarm
  // employment. The remaining ~84M workers (in occupations not individually mapped
  // to SOC codes in the 50 clusters above) are placed in this catch-all cluster.
  // Without this, the simulation's total employment is only ~83M, causing 50%+
  // unemployment, an immediate tipping point at 2025, and wrong ARPP.
  //
  // This cluster has HIGH BFCS thresholds (hard to automate), slow adoption,
  // and a low multiplier (1.0x) since these are diverse, hard-to-categorize jobs.
  // Employment is computed dynamically in dataTransform.ts as:
  //   CES total nonfarm (~158M) − sum of all OEWS-derived cluster employment
  {
    id: 'other_uncategorized',
    name: 'Other / Uncategorized',
    category: 'Other',
    socCodes: [],
    roles: [
      {
        id: 'general_worker',
        label: 'General Worker',
        seniorityLevel: 0.5,
        aiReplacementDifficulty: 0.5,
        employmentShareEstimate: 0.60,
        bfcsThresholds: { better: 0.55, faster: 0.45, cheaper: 0.40, safer: 0.30 },
      },
      {
        id: 'specialized_worker',
        label: 'Specialized Worker',
        seniorityLevel: 0.7,
        aiReplacementDifficulty: 0.7,
        employmentShareEstimate: 0.40,
        bfcsThresholds: { better: 0.55, faster: 0.45, cheaper: 0.40, safer: 0.30 },
      },
    ],
    capabilityRelevance: {
      // Blended weights — this cluster is a mix of many occupation types
      weights: capWeights({ generative: 0.30, agentic: 0.55, embodied: 0.15 }),
    },
    deploymentType: 'software',
    employmentMultiplier: 1.0,
    adoptionLag: 4,
    geopoliticalRiskExposure: 0.1,
    notes:
      'Catch-all for ~84M workers in occupations not covered by OEWS SOC-level data. Includes self-employed, informal, government (non-federal/state coded), and other hard-to-categorize roles. High BFCS thresholds reflect the diverse, often physical or interpersonal nature of these jobs.',
    protectedByPolicy: false,
    policyDisplacementTarget: false,
    // DEPRECATED: productivityToHeadcountRatio: 0.7,
    adoptionSteepness: 0.7,
    adoptionCeiling: 0.85,
    consumerDemandShare: 0.70,
    govDemandShare: 0.12,
    wageElasticity: 0.5,
    // DEPRECATED: taskAutomatableFraction: { general_worker: 0.40, specialized_worker: 0.25 },
  },
];

/**
 * Phase 10.A — Initialize α (automationShare) and the two role replacement-difficulty fields.
 *
 * Called once at module load, mutates OCCUPATION_CLUSTERS in place so every cluster has
 * a deterministic seed value for cluster.automationShare, role.aiReplacementDifficultyFriction,
 * role.aiReplacementDifficultyWagePremium, and the legacy role.aiReplacementDifficulty (averaged).
 *
 * Defaults come from EMBODIED_CLUSTER_ALPHA_DEFAULTS + DEFAULT_COGNITIVE_ALPHA for α,
 * and ROLE_AI_REPLACEMENT_DIFFICULTY_{FRICTION,WAGE_PREMIUM}_DEFAULTS for the role fields.
 * Runtime user overrides flow through config.clusterAutomationShareOverrides and the
 * role-override maps — NOT through this init function.
 *
 * Six clusters intentionally fall back to the global FALLBACK_* constants in this initial commit
 * (pending user sign-off on hand-authored defaults). Console-warns flag this behavior so it
 * doesn't go unnoticed.
 */
function initializeClusterAlphaDefaults(clusters: OccupationCluster[]): void {
  let warnedClusters = 0;
  for (const cluster of clusters) {
    // Cluster-level α
    cluster.automationShare =
      EMBODIED_CLUSTER_ALPHA_DEFAULTS[cluster.id] ?? DEFAULT_COGNITIVE_ALPHA;

    const frictionYearsTable = ROLE_AI_REPLACEMENT_FRICTION_YEARS_DEFAULTS[cluster.id];
    const wagePremiumTable = ROLE_AI_REPLACEMENT_DIFFICULTY_WAGE_PREMIUM_DEFAULTS[cluster.id];

    if (!frictionYearsTable || !wagePremiumTable) {
      warnedClusters += 1;
      // eslint-disable-next-line no-console
      console.warn(
        `[initializeClusterAlphaDefaults] cluster "${cluster.id}" missing explicit per-role ` +
          `frictionYears/wagePremium defaults — falling back to globals ` +
          `(${FALLBACK_REPLACEMENT_FRICTION_YEARS}y / ${FALLBACK_REPLACEMENT_DIFFICULTY_WAGE_PREMIUM}).`,
      );
    }

    for (const role of cluster.roles) {
      const frictionYears = frictionYearsTable?.[role.id] ?? FALLBACK_REPLACEMENT_FRICTION_YEARS;
      const wagePremium = wagePremiumTable?.[role.id] ?? FALLBACK_REPLACEMENT_DIFFICULTY_WAGE_PREMIUM;
      role.aiReplacementFrictionYears = frictionYears;
      role.aiReplacementDifficultyWagePremium = wagePremium;
      // Deprecated diagnostic field [0,1]: convert years back via /5 for the legacy averaging semantic.
      role.aiReplacementDifficulty = (frictionYears / 5 + wagePremium) / 2;
    }
  }
  if (warnedClusters > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `[initializeClusterAlphaDefaults] ${warnedClusters} cluster(s) using global fallbacks.`,
    );
  }
}

initializeClusterAlphaDefaults(OCCUPATION_CLUSTERS);

/**
 * Lookup map for O(1) access to occupation clusters by ID.
 */
export const OCCUPATION_CLUSTER_MAP: Record<string, OccupationCluster> = Object.fromEntries(
  OCCUPATION_CLUSTERS.map(c => [c.id, c])
) as Record<string, OccupationCluster>;
