/**
 * ATLAS Phase 8d: Scenario Templates
 *
 * Pre-built configurations that combine a fiscal response profile
 * with specific parameter overrides and optional config changes.
 *
 * Each template answers a specific analytical question about
 * how AI impacts the economy under different policy assumptions.
 *
 * Templates are STATIC DATA — no computation logic here.
 */

import type { SimulationConfig } from '@/types';

// ============================================================
// Types
// ============================================================

export interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  /** "What if..." framing for the analytical question. */
  analyticalQuestion: string;
  /** Tags for filtering in the gallery. */
  tags: string[];
  /** Fiscal response preset name. */
  fiscalProfile: string;
  /** Per-year parameter overrides (key:year → value). */
  parameterOverrides: Record<string, number>;
  /** Optional non-fiscal config changes. */
  configOverrides?: Partial<SimulationConfig>;
}

// ============================================================
// Templates
// ============================================================

export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    id: 'baseline',
    name: 'Baseline: Current Trajectory',
    description: 'Default AI capability curves with balanced fiscal response. No new policy interventions. The "do nothing beyond autopilot" scenario.',
    analyticalQuestion: 'What happens if we maintain current policy and let the autopilot handle fiscal adjustments?',
    tags: ['baseline', 'moderate'],
    fiscalProfile: 'balanced_reduction',
    parameterOverrides: {},
  },
  {
    id: 'aggressive-ai-gridlock',
    name: 'Aggressive AI + Political Gridlock',
    description: 'Steeper AI capability S-curves arrive 2-3 years sooner. Washington is gridlocked — minimal fiscal response with long implementation lags.',
    analyticalQuestion: 'What if AI arrives faster than expected and political gridlock prevents timely fiscal response?',
    tags: ['stress-test', 'technology', 'austerity'],
    fiscalProfile: 'gridlock',
    parameterOverrides: {},
    configOverrides: {
      capabilities: undefined, // Use default but with modified parameters below
    },
  },
  {
    id: 'nordic-model',
    name: 'Nordic Social Model',
    description: 'High taxes fund generous safety net. UBI introduced at $1,200/month in 2032, ramping to $2,000 by 2040. Full COLA protection maintained.',
    analyticalQuestion: 'What if we adopt Nordic-style transfers funded by higher taxes on AI winners?',
    tags: ['progressive', 'ubi', 'high-tax'],
    fiscalProfile: 'tax_the_winners',
    parameterOverrides: {
      'ubiEnabled:2032': 1,
      'ubiMonthlyAmount:2032': 1200,
      'ubiMonthlyAmount:2036': 1600,
      'ubiMonthlyAmount:2040': 2000,
      'effectiveIncomeTaxRate:2030': 0.18,
      'effectiveCorporateTaxRate:2030': 0.24,
    },
  },
  {
    id: 'austerity-response',
    name: 'Austerity Response',
    description: 'UK 2010-style austerity. Aggressive spending cuts, minimal tax increases, tight monetary policy. No new safety net programs.',
    analyticalQuestion: 'What if we respond to AI-driven fiscal stress with spending cuts and minimal new programs?',
    tags: ['austerity', 'conservative'],
    fiscalProfile: 'austerity',
    parameterOverrides: {},
  },
  {
    id: 'fed-monetization',
    name: 'Fed-Driven Resolution',
    description: 'Central bank absorbs most fiscal stress via QE. Higher inflation tolerance but maintained transfers and employment programs.',
    analyticalQuestion: 'What if the Fed monetizes the deficit, accepting higher inflation to maintain social spending?',
    tags: ['monetary', 'accommodation'],
    fiscalProfile: 'no_fiscal_response',
    parameterOverrides: {},
  },
  {
    id: 'gradual-ubi',
    name: 'Gradual UBI Phase-In',
    description: 'UBI starts small at $500/month in 2032, ramping to $2,000 by 2040. Balanced fiscal framework adjusts taxes and spending to fund it.',
    analyticalQuestion: 'What if we phase in UBI gradually as automation accelerates?',
    tags: ['ubi', 'progressive', 'gradual'],
    fiscalProfile: 'balanced_reduction',
    parameterOverrides: {
      'ubiEnabled:2032': 1,
      'ubiMonthlyAmount:2032': 500,
      'ubiMonthlyAmount:2035': 1000,
      'ubiMonthlyAmount:2038': 1500,
      'ubiMonthlyAmount:2040': 2000,
    },
  },
  {
    id: 'stress-test',
    name: 'Stress Test: No Fiscal Adjustment',
    description: 'Disables all fiscal autopilot adjustments. The model runs without automatic spending cuts, tax increases, or COLA dampening — only monetary accommodation responds.',
    analyticalQuestion: 'What happens when the fiscal autopilot is turned off and only monetary policy responds?',
    tags: ['stress-test', 'extreme'],
    fiscalProfile: 'no_fiscal_response',
    parameterOverrides: {},
  },
  {
    id: 'bipartisan-compromise',
    name: 'Bipartisan Compromise',
    description: 'Moderate UBI from 2035 ($1,000/month), Sovereign Wealth Fund enabled in 2030, modest tax increases. A plausible political center.',
    analyticalQuestion: 'What if Congress reaches a bipartisan deal combining moderate UBI, a sovereign wealth fund, and modest tax increases?',
    tags: ['moderate', 'ubi', 'swf'],
    fiscalProfile: 'balanced_reduction',
    parameterOverrides: {
      'ubiEnabled:2035': 1,
      'ubiMonthlyAmount:2035': 1000,
      'swfEnabled:2030': 1,
      'effectiveIncomeTaxRate:2032': 0.15,
      'effectiveCorporateTaxRate:2032': 0.22,
    },
  },
];
