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
import { DEFAULT_POLICY_CONFIG } from '@/models/constants';

// Stage H item 1 (the audit's cosmetic-template finding): policy features MUST be expressed
// through config.policyConfig (the engine's live mechanism — computePolicyEffects reads config
// only). The per-year override keys ubiEnabled/ubiMonthlyAmount/swfEnabled are RESOLVED and
// RECORDED but never read back by the simulation; templates that wrote them advertised UBI/SWF
// that never fired while their tax-rate rows (live keys) did. The policyConfig blocks below are
// full objects (the gallery's configOverrides merge is shallow, top-level-key replacement).

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
      // Tax rows stay as per-year overrides — these keys ARE read back by the engine.
      'effectiveIncomeTaxRate:2030': 0.18,
      'effectiveCorporateTaxRate:2030': 0.24,
      // The former ubiEnabled/ubiMonthlyAmount override rows were dead keys (never consumed);
      // the UBI ramp now lives in policyConfig below — the advertised feature actually fires.
    },
    configOverrides: {
      policyConfig: {
        ...DEFAULT_POLICY_CONFIG,
        ubi: {
          ...DEFAULT_POLICY_CONFIG.ubi,
          enabled: true,
          // interpolatePolicy: 0 before the first keyframe (introduction at 2032), linear
          // ramp between keyframes — exactly the description's "introduced at $1,200 in
          // 2032, ramping to $2,000 by 2040".
          monthlyAmount: { keyframes: [{ year: 2032, value: 1200 }, { year: 2036, value: 1600 }, { year: 2040, value: 2000 }] },
        },
      },
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
      // The former ubiEnabled/ubiMonthlyAmount override rows were dead keys (never consumed);
      // the phase-in now lives in policyConfig below — the advertised feature actually fires.
    },
    configOverrides: {
      policyConfig: {
        ...DEFAULT_POLICY_CONFIG,
        ubi: {
          ...DEFAULT_POLICY_CONFIG.ubi,
          enabled: true,
          monthlyAmount: { keyframes: [{ year: 2032, value: 500 }, { year: 2035, value: 1000 }, { year: 2038, value: 1500 }, { year: 2040, value: 2000 }] },
        },
      },
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
      // Tax rows stay as per-year overrides — these keys ARE read back by the engine.
      'effectiveIncomeTaxRate:2032': 0.15,
      'effectiveCorporateTaxRate:2032': 0.22,
      // The former ubiEnabled/ubiMonthlyAmount/swfEnabled override rows were dead keys (never
      // consumed); UBI and the SWF now live in policyConfig below — the advertised features
      // actually fire.
    },
    configOverrides: {
      policyConfig: {
        ...DEFAULT_POLICY_CONFIG,
        ubi: {
          ...DEFAULT_POLICY_CONFIG.ubi,
          enabled: true,
          monthlyAmount: { keyframes: [{ year: 2035, value: 1000 }] },
        },
        sovereignWealthFund: {
          ...DEFAULT_POLICY_CONFIG.sovereignWealthFund,
          enabled: true,
          // "Enabled in 2030": contributions begin at 2030 (0 before the first keyframe).
          // $100B/yr matches the asset_democracy preset's cited federal-feasibility value
          // (~0.4% GDP — see POLICY_PRESETS in constants.ts).
          annualContribution: { keyframes: [{ year: 2030, value: 100 }] },
        },
      },
    },
  },
];
