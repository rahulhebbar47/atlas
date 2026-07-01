/**
 * ATLAS Methodology View
 *
 * Dedicated screen showing every equation in the simulation engine,
 * grouped by economic theme, with plain-English explanations and
 * academic source citations.
 *
 * Audience: Policy professionals, analysts, and academics
 * reviewing ATLAS for credibility.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { FeedbackLoopsSection } from './feedbackLoops/FeedbackLoopsSection';
import {
  // Capability & Adoption
  // PHILLIPS_CURVE_SENSITIVITY, — FS-6f: card 4.3 rewritten to the live wage equation; the
  // retired exponential-Phillips constant is no longer displayed
  NATURAL_UNEMPLOYMENT_RATE,
  // FS-6f: the live wage-equation constants (card 4.3)
  DEFAULT_PHILLIPS_SLOPE,
  DEFAULT_DOWNWARD_WAGE_RIGIDITY,
  DEFAULT_INFLATION_INDEXATION,
  DEFAULT_PRODUCTIVITY_PASSTHROUGH,
  // FS-6f: the live structural-rent constants (card 4.4)
  DEFAULT_RENT_OCCUPANCY_ELASTICITY,
  DEFAULT_OPEX_PASSTHROUGH,
  DEFAULT_RENT_INCOME_ELASTICITY,
  DEFAULT_RENT_DOWNWARD_RIGIDITY,
  // FS-6f: the residual-profits identity (card 5.7)
  DEFAULT_OTHER_COSTS_SHARE,
  REVENUE_PRESSURE_SENSITIVITY_DEFAULT,
  REVENUE_PRESSURE_CAP,
  REVENUE_PRESSURE_DECAY,
  DEFAULT_CAPABILITY_TRAJECTORIES,
  DEFAULT_WAGE_ELASTICITY,
  DEFAULT_INNOVATION_RATE,
  DEFAULT_RD_MULTIPLIER,
  DEFAULT_JOB_PERSISTENCE_FACTOR,
  DEFAULT_PARTICIPATION_ELASTICITY,
  DEFAULT_PARTICIPATION_THRESHOLD,
  DEFAULT_SCARCITY_PASS_THROUGH,
  // Phase 10.A — Augmentation, α drivers, floored inference, scarcity premium
  DEFAULT_COGNITIVE_ALPHA,
  DEFAULT_ALPHA_DRIVER_PARAMS,
  DEFAULT_TOKEN_COST_CURVE,
  DEFAULT_TOKEN_USAGE_SCHEDULE,
  DEFAULT_AUGMENTATION_ADOPTION_STEEPNESS,
  // DEFAULT_SCARCITY_INTENSITY, — FS-6f: displayed by the retired card 4.3 only
  ALPHA_BASELINE_CORPORATE_MARGIN,
  DEFAULT_REPLACEMENT_MULTIPLIER,
  // MPC & Consumption
  MPC_WAGE,
  MPC_ASSET,
  MPC_TRANSFER,
  DEFAULT_AI_PROFIT_GROWTH_RATE,
  BASELINE_WAGE_SHARE,
  BASELINE_ASSET_SHARE,
  BASELINE_TRANSFER_SHARE,
  BASELINE_GDP_GROWTH_RATE,
  DEFAULT_POPULATION_GROWTH_RATE,
  // Deflation & Inflation
  DEFERRABLE_CONSUMPTION_SHARE,
  DEFLATION_MIDPOINT,
  DEFLATION_STEEPNESS,
  BASE_INFLATION_RATE,
  BASELINE_SHELTER_CPI_WEIGHT,
  // DEFAULT_SHELTER_INFLATION_STICKINESS, — FS-6f: card 4.4 rewritten to the live structural
  // rent; the retired additive-stack constants are no longer displayed
  // BASELINE_SHELTER_INFLATION,
  // GDP
  TRADITIONAL_INVESTMENT_GDP_FRACTION,
  GOVERNMENT_SPENDING_GDP_FRACTION,
  NET_EXPORTS_GDP_FRACTION,
  G_OBLIGATION_SHARE,
  G_REVENUE_SENSITIVE_SHARE,
  // Credit & Housing
  CREDIT_UE_SENSITIVITY,
  MAX_CREDIT_TIGHTENING,
  CREDIT_INVESTMENT_SENSITIVITY,
  CREDIT_CONSUMPTION_SENSITIVITY,
  DEFAULT_BUSINESS_CREDIT_GDP_SENSITIVITY,
  DEFAULT_MAX_BUSINESS_CREDIT_LOOSENING,
  DEFAULT_MORTGAGE_STRESS_AMPLIFIER,
  DEFAULT_FORECLOSURE_LAG,
  DEFAULT_HOMEOWNERSHIP_RECOVERY_RATE,
  DEFAULT_HOUSING_WEALTH_MPC,
  BASELINE_HOUSING_WEALTH,
  DEFAULT_MPC_WAGE_UE_SENSITIVITY,
  DEFAULT_CREDIT_ADOPTION_SENSITIVITY,
  // Fiscal
  EFFECTIVE_TAX_RATE,
  // DEPRECATED (Stage 5 / H3): TRANSFER_GROWTH_PER_UE_POINT retired — per-person split shown instead
  // TRANSFER_GROWTH_PER_UE_POINT,
  DEFAULT_CASH_TRANSFER_PER_UNEMPLOYED,
  DEFAULT_IN_KIND_TRANSFER_PER_UNEMPLOYED,
  BASELINE_VELOCITY_OF_MONEY,
  // Multipliers
  DEMAND_FEEDBACK_SENSITIVITY,
} from '@/models/constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Section {
  id: string;
  label: string;
  color: string;
}

const SECTIONS: Section[] = [
  { id: 'system-dynamics', label: 'System Dynamics', color: '#D4A03C' },
  { id: 'ai-technology',   label: 'AI Technology',   color: '#3B82F6' },
  { id: 'labor-market',    label: 'Labor Market',    color: '#F59E0B' },
  { id: 'income',          label: 'Income',          color: '#F43F5E' },
  { id: 'prices',          label: 'Prices',          color: '#22C55E' },
  { id: 'gdp',             label: 'GDP',             color: '#6366F1' },
  { id: 'financial',       label: 'Financial',       color: '#D97706' },
  { id: 'welfare',         label: 'Welfare',         color: '#4ECDC4' },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Eq({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-bg-elevated rounded-md px-4 py-3 font-mono text-[13px] leading-relaxed text-text-accent overflow-x-auto whitespace-pre-wrap break-words">
      {children}
    </pre>
  );
}

function Param({ name, value, unit }: { name: string; value: string | number; unit?: string }) {
  return (
    <span className="inline-flex items-baseline gap-1 mr-4 font-mono text-xs text-text-secondary">
      <span className="text-text-muted">{name}</span>
      <span className="text-text-accent">= {value}</span>
      {unit && <span className="text-text-muted">({unit})</span>}
    </span>
  );
}

function Source({ children }: { children: React.ReactNode }) {
  return <p className="text-xs italic text-text-muted mt-2">Source: {children}</p>;
}

function CodeRef({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-text-muted mt-1 font-mono">Code: {children}</p>;
}

function EquationCard({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-surface border border-border rounded-lg p-5 mb-4 break-inside-avoid">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-text-primary font-medium text-sm">{title}</h3>
        <span className="text-text-muted text-xs font-mono">[{number}]</span>
      </div>
      {children}
    </div>
  );
}

function SectionHeader({
  id,
  number,
  title,
  color,
}: {
  id: string;
  number: number;
  title: string;
  color: string;
}) {
  return (
    <div id={id} className="pt-8 mb-6 scroll-mt-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1 h-6 rounded-full" style={{ backgroundColor: color }} />
        <h2 className="text-text-primary text-xs font-semibold uppercase tracking-[0.1em]">
          {number}. {title}
        </h2>
      </div>
      <div className="border-b border-border" />
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-text-secondary text-sm leading-relaxed mt-2 mb-3">{children}</p>;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function MethodologyView() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0]!.id);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        setActiveSection(entry.target.id);
        break;
      }
    }
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: '-80px 0px -70% 0px',
      threshold: 0,
    });

    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, [handleIntersection]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileNavOpen(false);
  };

  const gen = DEFAULT_CAPABILITY_TRAJECTORIES.generative;
  const agt = DEFAULT_CAPABILITY_TRAJECTORIES.agentic;
  const emb = DEFAULT_CAPABILITY_TRAJECTORIES.embodied;

  return (
    <div className="flex gap-6 w-full min-w-0 methodology-root">
      {/* Print styles */}
      <style>{`
        @media print {
          .methodology-sidebar { display: none !important; }
          .methodology-root { max-width: 100% !important; }
          .methodology-main { max-width: 100% !important; }
          * { color: #111 !important; background: white !important; border-color: #ccc !important; }
          .break-inside-avoid { break-inside: avoid; }
        }
      `}</style>

      {/* Sidebar — desktop */}
      <nav className="methodology-sidebar hidden md:block w-44 shrink-0 sticky top-0 self-start pt-8">
        <p className="text-text-muted text-[10px] uppercase tracking-[0.15em] mb-4 font-semibold">
          Sections
        </p>
        <ul className="space-y-1">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => scrollTo(s.id)}
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors ${
                  activeSection === s.id
                    ? 'text-text-primary bg-bg-elevated'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle"
                  style={{ backgroundColor: activeSection === s.id ? s.color : 'transparent' }}
                />
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile nav dropdown */}
      <div className="md:hidden fixed top-16 left-4 right-4 z-50">
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 text-xs text-text-secondary flex items-center justify-between"
        >
          <span>{SECTIONS.find(s => s.id === activeSection)?.label ?? 'Sections'}</span>
          <span className="text-text-muted">{mobileNavOpen ? '\u25B2' : '\u25BC'}</span>
        </button>
        {mobileNavOpen && (
          <ul className="bg-bg-elevated border border-border rounded-md mt-1 overflow-hidden shadow-lg">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => scrollTo(s.id)}
                  className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-bg-surface"
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Main content */}
      <main className="methodology-main flex-1 min-w-0 overflow-hidden pb-24 pr-2">
        {/* Header */}
        <div className="pt-4 mb-8">
          <h1 className="font-display text-2xl text-text-primary mb-2">
            ATLAS Methodology
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed max-w-xl">
            Every equation in the simulation engine, with plain-English explanations and academic
            source citations. Full transparency for policy review and academic scrutiny.
          </p>
        </div>

        {/* ================================================================
            SECTION 0: SYSTEM DYNAMICS (Feedback Loops)
        ================================================================ */}
        <SectionHeader id="system-dynamics" number={0} title="System Dynamics" color="#D4A03C" />
        <FeedbackLoopsSection />

        {/* ================================================================
            SECTION 1: AI TECHNOLOGY & ADOPTION
        ================================================================ */}
        <SectionHeader id="ai-technology" number={1} title="AI Technology & Adoption" color="#3B82F6" />

        <EquationCard number="1.1" title="Capability S-Curves">
          <Eq>{`S(t) = floor + (ceiling - floor) / (1 + exp(-steepness × (t - midpoint)))`}</Eq>
          <Prose>
            Three logistic S-curves model AI capability trajectories for generative (language,
            code, image), agentic (planning, decision-making), and embodied (robotics, vehicles)
            AI. Each starts near its floor and saturates toward its ceiling.
          </Prose>
          <div className="overflow-x-auto">
            <table className="text-xs text-text-secondary w-full">
              <thead>
                <tr className="text-text-muted border-b border-border">
                  <th className="text-left py-1 pr-4">Vector</th>
                  <th className="text-left py-1 pr-4">Floor</th>
                  <th className="text-left py-1 pr-4">Ceiling</th>
                  <th className="text-left py-1 pr-4">Steepness</th>
                  <th className="text-left py-1">Midpoint</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr><td className="py-0.5">Generative</td><td>{gen.floor}</td><td>{gen.ceiling}</td><td>{gen.steepness}</td><td>{gen.midpointYear}</td></tr>
                <tr><td className="py-0.5">Agentic</td><td>{agt.floor}</td><td>{agt.ceiling}</td><td>{agt.steepness}</td><td>{agt.midpointYear}</td></tr>
                <tr><td className="py-0.5">Embodied</td><td>{emb.floor}</td><td>{emb.ceiling}</td><td>{emb.steepness}</td><td>{emb.midpointYear}</td></tr>
              </tbody>
            </table>
          </div>
          <Source>SWE-bench, MMLU, GPQA benchmarks; agent trust/reliability studies; Tesla Optimus, FSD deployment</Source>
          <CodeRef>capabilities.ts → getCapabilityScore(), getAllCapabilityScores()</CodeRef>
        </EquationCard>

        <EquationCard number="1.2" title="Weighted Cluster Capability">
          <Eq>{`W(cluster, t) = w_gen × S_gen(t) + w_agt × S_agt(t) + w_emb × S_emb(t)`}</Eq>
          <Prose>
            Each of the 51 occupation clusters has per-vector weights reflecting how relevant
            each AI capability dimension is. Software engineering weights generative heavily;
            trucking weights embodied heavily. Weights sum to 1.0 per cluster.
          </Prose>
          <CodeRef>capabilities.ts → computeWeightedCapability()</CodeRef>
        </EquationCard>

        <EquationCard number="1.3" title="BFCS Threshold Model">
          <Eq>{`triggered = (B ≥ B*) AND (F ≥ F*) AND (C ≥ C*) AND (S ≥ S*)`}</Eq>
          <Prose>
            Adoption of AI for a specific occupation-role is NOT triggered by capability alone.
            Four dimensions — Better (quality-adjusted capability), Faster (inference speed ×
            task parallelism), Cheaper (AI cost vs. human wage), Safer (safety record × domain
            risk) — must ALL exceed their thresholds simultaneously.
          </Prose>
          <Source>DATA_MODEL.md §2; domain risk factors from industry safety literature</Source>
          <CodeRef>bfcs.ts → checkAdoptionTrigger()</CodeRef>
        </EquationCard>

        <EquationCard number="1.4" title="Adoption S-Curve (Post-Trigger)">
          <Eq>{`A(t) = ceiling / (1 + exp(-steepness × (t - triggerYear - lag)))`}</Eq>
          <Prose>
            Once triggered, adoption follows a logistic S-curve whose steepness depends on
            deployment type (software is steep, robotics is gradual). Competitive pressure
            accelerates adoption once {'>'} 20% is adopted. Geopolitical risk slows robotics/AV.
          </Prose>
          <CodeRef>adoption.ts → computeBaseAdoptionRate(), applyCompetitivePressure(), applyGeopoliticalRisk()</CodeRef>
        </EquationCard>

        <EquationCard number="1.5" title="Revenue Pressure → Acceleration">
          <Eq>{`newPressure = min(cap, sensitivity × max(0, -gdpGrowthRate))
automationAcceleration = min(cap, prevAcceleration × decay + newPressure)`}</Eq>
          <Prose>
            GDP contraction triggers cost-cutting automation acceleration. Firms adopt AI faster
            when revenues fall. The effect has built-in decay (half-life ~1 year) and a cap.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="sensitivity" value={REVENUE_PRESSURE_SENSITIVITY_DEFAULT} />
            <Param name="cap" value={REVENUE_PRESSURE_CAP} />
            <Param name="decay" value={REVENUE_PRESSURE_DECAY} />
          </div>
          <Source>McKinsey (2020) — COVID caused 3-4 years of digital acceleration in 1 year</Source>
          <CodeRef>macro.ts → computeRevenuePressure()</CodeRef>
        </EquationCard>

        <EquationCard number="1.6" title="Credit → Adoption Acceleration">
          <Eq>{`creditAcceleration = min(cap, max(0, businessCreditSignal) × sensitivity)
totalAcceleration = min(cap, revenueAcceleration + creditAcceleration)`}</Eq>
          <Prose>
            Cheap business credit funds AI capital expenditure. This is distinct from revenue
            pressure: GDP growth loosens business credit → firms invest in AI. Both feed into
            the same adoption acceleration with a shared cap.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="sensitivity" value={DEFAULT_CREDIT_ADOPTION_SENSITIVITY} />
            <Param name="cap" value={REVENUE_PRESSURE_CAP} />
          </div>
          <Source>COVID-era AI investment patterns, NVIDIA capex correlation with lending availability</Source>
          <CodeRef>simulation.ts → main loop (~line 536)</CodeRef>
        </EquationCard>

        <EquationCard number="1.7" title="Augmentation Adoption (Pre-BFCS Tool-Use)">
          <Eq>{`viable = (betterScore × cheaperScore) > 0.1
triggerYear = first year viability holds
augAdoptionRate = 1 / (1 + exp(-steepness × yearsSinceTrigger))`}</Eq>
          <Prose>
            Phase 10.A separates AI <em>augmentation</em> (humans using AI as a tool) from AI
            <em> replacement</em> (humans being removed from the workflow). Augmentation begins
            <strong> before</strong> BFCS thresholds fire — as soon as AI is a credible tool
            (better × cheaper above 0.1), firms equip workers with it. Once armed, a
            temporary dip in viability doesn&apos;t reset the trigger. At the default
            steepness, augmentation reaches ~98% within 5 years of viability. The 0.1
            viability threshold is an internal mathematical floor, not a user knob.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="steepness" value={DEFAULT_AUGMENTATION_ADOPTION_STEEPNESS} />
            <Param name="viabilityThreshold" value="0.1" />
          </div>
          <Source>Phase 10.A Part 7 (pre-BFCS augmentation channel)</Source>
          <CodeRef>augmentationAdoption.ts → computeAugmentationAdoption()</CodeRef>
        </EquationCard>

        <EquationCard number="1.8" title="Effective Automation Share (α) — 5-Driver Decomposition">
          <Eq>{`α = clamp01(
    baseline
  + w_cap    × sigmoid((weightedCapability - capThreshold) × 6)         // 1. Capability
  + w_trust  × (1 - exp(-yearsSinceTrigger / trustHalfLife))             // 2. Trust
  + w_comp   × max(0, peerAlpha - baseline)                              // 3. Competitive
  + w_margin × max(0, baselineMargin - currentMargin) / baselineMargin   // 4. Margin
  - w_slack  × max(0, unemploymentRate - naturalRate) × 5                // 5. Slack
)`}</Eq>
          <Prose>
            α is the fraction of adoption that takes the <em>replacement</em> path rather than
            augmenting a human — it is what multiplies displacement in Eq 2.1. Five drivers
            combine additively: (1) capability must clear an activation threshold; (2) trust
            accumulates post-trigger on a half-life; (3) peer clusters&apos; prior-year α creates
            competitive replacement pressure; (4) corporate margin compression pushes firms
            toward replacement; (5) labor slack <em>reduces</em> α because cheap workers
            postpone the capex case for full automation. Per-role, per-year.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="baselineα" value={DEFAULT_COGNITIVE_ALPHA} />
            <Param name="w_cap" value={DEFAULT_ALPHA_DRIVER_PARAMS.capabilityWeight} />
            <Param name="w_trust" value={DEFAULT_ALPHA_DRIVER_PARAMS.trustWeight} />
            <Param name="w_comp" value={DEFAULT_ALPHA_DRIVER_PARAMS.competitiveWeight} />
            <Param name="w_margin" value={DEFAULT_ALPHA_DRIVER_PARAMS.marginWeight} />
            <Param name="w_slack" value={DEFAULT_ALPHA_DRIVER_PARAMS.slackWeight} />
            <Param name="capThreshold" value={DEFAULT_ALPHA_DRIVER_PARAMS.capabilityActivationThreshold} />
            <Param name="trustHalfLife" value={DEFAULT_ALPHA_DRIVER_PARAMS.trustHalfLifeYears} unit="yrs" />
            <Param name="baselineMargin" value={ALPHA_BASELINE_CORPORATE_MARGIN} />
          </div>
          <Source>Phase 10.A Part 6; FRED corporate profits/GDP (margin anchor); peer-pressure from Bass diffusion literature</Source>
          <CodeRef>alphaDrivers.ts → computeEffectiveAlpha(), computePeerAlpha()</CodeRef>
        </EquationCard>

        <EquationCard number="1.9" title="AI Replacement Productivity">
          <Eq>{`effectiveProductivity = 1 + weightedCapability × betterScore
                      × replacementMultiplier × (1 + cheaperScore)`}</Eq>
          <Prose>
            When AI replaces a worker, it doesn&apos;t produce 1× their output — it produces more.
            Productivity scales with how capable AI is, how much better it is than the human,
            and how much cheaper it is (because cheaper AI can be deployed more aggressively).
            Feeds AI production expansion (Eq 5.5): displaced workers × wage ×
            (effectiveProductivity − 1) = additional output.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="replacementMultiplier" value={DEFAULT_REPLACEMENT_MULTIPLIER} />
          </div>
          <Source>Phase 10.A Part 8 (productivity decomposition); McKinsey (2023); BCG (2024)</Source>
          <CodeRef>simulation.ts → computeAIProductionExpansion()</CodeRef>
        </EquationCard>

        <EquationCard number="1.10" title="Supply Chain Uncertainty (Phase 9)">
          <Eq>{`7 constraints ∈ [0,200]: aiChips, energyPrice, energyCapacity,
  trainingDC, inferenceDC, roboticsHardware, softwareEfficiency

// Training channel — delays capability S-curves:
capabilityDelay(t) = Σ propagationLag × resilience × deficit(constraint, t-lag)
cumulativeCapabilityDelay(t) = cumulativeCapabilityDelay(t-1) + capabilityDelay(t)

// Deployment channel — raises costs, slows adoption, dampens BFCS F/S:
deploymentCostMultiplier = f(inferenceDC, energyPrice, roboticsHardware)
adoptionDragMultiplier    = f(aggregate deficit, hysteresis band)
{fasterMult, saferMult}   = supply-chain dampeners on BFCS score improvements
effectiveComputeDecline   = baselineDecline × (1 - cascadePremium × backlog)`}</Eq>
          <Prose>
            Models chip shortages, energy constraints, and datacentre bottlenecks as an
            exogenous shock envelope on AI. Two channels: <em>training</em> delays push
            capability midpoints later (cumulative, monotonic); <em>deployment</em> raises
            inference/manufacturing costs, slows adoption, and attenuates BFCS Faster/Safer
            improvements. Hysteresis band prevents constant flicker between adoption and
            de-adoption when conditions hover near the threshold. Default inputs of 100 are
            a no-op (baseline); {'<100'} is surplus, {'>100'} is deficit.
          </Prose>
          <Source>Phase 9 (docs/PHASES.md §9); SEMI chip-cycle data; IEA energy forecasts; BLS capital-goods lead times</Source>
          <CodeRef>supplyChain.ts → computeSupplyChainEffects(); simulation.ts (~line 843)</CodeRef>
        </EquationCard>

        {/* ================================================================
            SECTION 2: LABOR MARKET
        ================================================================ */}
        <SectionHeader id="labor-market" number={2} title="Labor Market" color="#F59E0B" />

        <EquationCard number="2.1" title="Displacement (α × Capability)">
          <Eq>{`displacementPct = adoptionRate × weightedCapability × α
remainingEmployment = baselineEmployment × (1 - displacementPct)
wageMultiplier = 1 - (displacementPct × wageElasticity)`}</Eq>
          <Prose>
            Phase 10.A decomposes the prior quadratic into two separate channels. Adoption
            (how widely AI is deployed) and weightedCapability (how technically ready it is)
            are multiplied by α — the effective <em>automation share</em>, the fraction of
            adoption that takes the replacement path rather than augmenting a human. α is
            computed from 5 drivers per role (see Eq 1.8). Computed per-role within each
            cluster, then aggregated.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="wageElasticity" value={DEFAULT_WAGE_ELASTICITY} />
          </div>
          <Source>DATA_MODEL.md §4; Phase 10.A Part 6 (α decomposition replaces capability²)</Source>
          <CodeRef>displacement.ts → computeDisplacementV2(), computeClusterDisplacement()</CodeRef>
        </EquationCard>

        <EquationCard number="2.2" title="Employment Multipliers (Second-Order)">
          <Eq>{`secondOrderDisplacement = directDisplacement × (multiplier - 1)
totalDisplacement = direct + secondOrder`}</Eq>
          <Prose>
            BEA input-output employment multipliers capture ripple effects. Tech SWE has the
            highest multiplier (4.3×) — each displaced engineer costs 3.3 additional jobs in
            the local economy. Retail cashiers have the lowest (1.2×). 51 cluster-specific
            multipliers.
          </Prose>
          <Source>Moretti (2010) AER; BEA input-output tables</Source>
          <CodeRef>displacement.ts → computeClusterDisplacement(); constants.ts → EMPLOYMENT_MULTIPLIERS</CodeRef>
        </EquationCard>

        <EquationCard number="2.3" title="Demand Spillover">
          <Eq>{`demandSurvivalRate = f(consumption / GDP, government / GDP, investment / GDP)
effectiveDisplacement = displacement × (1 - demandSurvivalRate × dampening)`}</Eq>
          <Prose>
            GDP composition feeds back to sector-level demand. When consumption falls relative
            to GDP, demand-sensitive sectors (retail, food service) see accelerated displacement.
            Government-heavy sectors are more sheltered.
          </Prose>
          <CodeRef>simulation.ts → inline demand spillover (~line 523)</CodeRef>
        </EquationCard>

        <EquationCard number="2.4" title="New Job Creation">
          <Eq>{`rawNewJobs = nominalGDP × innovationRate × rdMultiplier
survivability = (1 - automationCoverage) ^ persistenceFactor
durableNewJobs = rawNewJobs × survivability`}</Eq>
          <Prose>
            New jobs emerge from AI-driven R&D and new industries, but are themselves vulnerable
            to automation. As automation coverage approaches 1.0, survivability falls to zero
            regardless of innovation rate — the key structural insight.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="innovationRate" value={DEFAULT_INNOVATION_RATE.toExponential(1)} unit="jobs/$" />
            <Param name="rdMultiplier" value={DEFAULT_RD_MULTIPLIER} />
            <Param name="persistenceFactor" value={DEFAULT_JOB_PERSISTENCE_FACTOR} />
          </div>
          <Source>Autor (2015) AER; BLS occupational projections; NSF R&D statistics</Source>
          <CodeRef>newJobs.ts → computeNewJobCreation(), computeDurableNewJobs()</CodeRef>
        </EquationCard>

        <EquationCard number="2.5" title="Labor Supply Response (Voluntary Withdrawal)">
          <Eq>{`replacementRate = annualUBI / clusterWage
excessReplacement = replacementRate - threshold
withdrawal = elasticity × min(1, excessReplacement / (1 - threshold))
effectiveLaborSupply = remainingEmployment × (1 - withdrawal)`}</Eq>
          <Prose>
            When UBI replacement rate exceeds the participation threshold, some workers
            voluntarily exit the labor force. Higher-wage clusters are less affected (lower
            replacement rate). This reduces available labor for scarcity calculations.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="elasticity" value={DEFAULT_PARTICIPATION_ELASTICITY} />
            <Param name="threshold" value={DEFAULT_PARTICIPATION_THRESHOLD} />
          </div>
          <CodeRef>simulation.ts → main loop (~line 738)</CodeRef>
        </EquationCard>

        <EquationCard number="2.6" title="Scarcity Inflation (Corrected Demand)">
          <Eq>{`totalOutputDemand = baselineEmployment × demandSurvivalRate
aiCapacity = max(0, baselineEmployment - remainingEmployment)
demandForHumans = max(0, totalOutputDemand - aiCapacity)
laborScarcity = max(0, (demandForHumans - availableWorkers) / demandForHumans)
scarcityInflation = Σ(laborScarcity × employmentShare × passThrough)`}</Eq>
          <Prose>
            AI capacity is subtracted BEFORE computing scarcity. Scarcity inflation only fires
            when demand exceeds what AI + remaining humans can jointly provide. Without this
            correction, scarcity fires even when AI fully covers the displaced output.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="passThrough" value={DEFAULT_SCARCITY_PASS_THROUGH} />
          </div>
          <CodeRef>simulation.ts → main loop (~line 760)</CodeRef>
        </EquationCard>

        {/* ================================================================
            SECTION 3: INCOME & CONSUMPTION
        ================================================================ */}
        <SectionHeader id="income" number={3} title="Income & Consumption" color="#F43F5E" />

        <EquationCard number="3.1" title="Income Composition (Static Baselines)">
          <Eq>{`productivityFactor = (1 + ${(BASELINE_GDP_GROWTH_RATE - DEFAULT_POPULATION_GROWTH_RATE).toFixed(3)})^yearsSinceStart

wageBase = GDP_2025 × wageShare × inflationFactor × productivityFactor
wageIncome = wageBase × employmentRatio × wagePressure
           + policyWageAddition + newJobWageIncome

assetIncome = dividends + aiCapGains + tradCapGains
            + (GDP_2025 × nonCorpShare × inflFactor × prodFactor)
            + policyAssetAddition

transferIncome = baselineTransfers × effectiveCOLA × productivityFactor
               + excessUE × autoStabilizer + policyTransferAddition`}</Eq>
          <Prose>
            Three-channel income decomposition with STATIC 2025 baselines. Wages and
            non-corporate asset income derive from BASELINE_GDP_2025 (not previous-year GDP)
            × cumulative inflation × cumulative productivity — this breaks the GDP circularity
            that caused 0% real growth. Asset income uses a 4-component decomposition with
            dynamic P/E ratios. Transfers grow with COLA (inflation) + productivity, with
            optional dampening from fiscal response profile.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="wageShare" value={BASELINE_WAGE_SHARE.toFixed(2)} />
            <Param name="assetShare" value={BASELINE_ASSET_SHARE.toFixed(2)} />
            <Param name="transferShare" value={BASELINE_TRANSFER_SHARE.toFixed(2)} />
            <Param name="prodGrowth" value={((BASELINE_GDP_GROWTH_RATE - DEFAULT_POPULATION_GROWTH_RATE) * 100).toFixed(1) + '%/yr'} />
          </div>
          <Source>BEA NIPA Table 2.1 (income shares); DOL UI data; CBO long-run GDP trend</Source>
          <CodeRef>macro.ts → computeMacro() income section (~line 1633)</CodeRef>
        </EquationCard>

        <EquationCard number="3.2" title="MPC-Differentiated Consumption (Nominal)">
          <Eq>{`wageConsumption = wageIncome × effectiveMPC_wage
assetConsumption = assetIncome × MPC_asset
transferConsumption = transferIncome × MPC_transfer
baseConsumption = wage + asset + transfer`}</Eq>
          <Prose>
            All consumption is NOMINAL — no division by price level. When income shifts from
            wages to assets (as AI displaces workers), consumption drops because MPC_asset
            ({MPC_ASSET}) is far below MPC_wage ({MPC_WAGE}). SWF dividends are reclassified
            from asset to transfer MPC ({MPC_TRANSFER}).
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="MPC_wage" value={MPC_WAGE} />
            <Param name="MPC_asset" value={MPC_ASSET} />
            <Param name="MPC_transfer" value={MPC_TRANSFER} />
          </div>
          <Source>Jappelli & Pistaferri (2014); Parker et al (2013); Carroll et al (2017)</Source>
          <CodeRef>macro.ts → computeMacro() (~line 1228)</CodeRef>
        </EquationCard>

        <EquationCard number="3.3" title="Precautionary Saving">
          <Eq>{`excessUE_pp = max(0, unemploymentRate - naturalUE) × 100
mpcReduction = sensitivity × excessUE_pp
effectiveMPC_wage = max(0.01, baseMPC_wage - mpcReduction)`}</Eq>
          <Prose>
            Employed workers save more when they observe rising displacement around them.
            Calibrated to the Great Recession: at 5pp excess unemployment, wage MPC drops
            by ~{(DEFAULT_MPC_WAGE_UE_SENSITIVITY * 5 * 100).toFixed(1)}%.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="sensitivity" value={DEFAULT_MPC_WAGE_UE_SENSITIVITY} unit="MPC per pp" />
          </div>
          <Source>Carroll (1992); Carroll & Samwick (1997); IMF WP/12/42</Source>
          <CodeRef>macro.ts → computeMacro() (~line 1222)</CodeRef>
        </EquationCard>

        <EquationCard number="3.4" title="Consumption Adjustments">
          <Eq>{`adjustedConsumption = baseConsumption
  × creditConsumptionMultiplier       [0.94, 1.0]
  × deflationVelocityMultiplier       [0.70, 1.0]
  + housingWealthDrag                 [can be negative]
consumption = max(0, adjustedConsumption)`}</Eq>
          <Prose>
            Three independent transmission mechanisms, each with separate empirical literature.
            Credit tightening reduces available purchasing power. Deflation expectations cause
            consumers to defer durable purchases. Falling home values reduce perceived wealth
            and spending even for employed homeowners.
          </Prose>
          <CodeRef>macro.ts → computeMacro() (~line 1277)</CodeRef>
        </EquationCard>

        <EquationCard number="3.5" title="Deflation Drag (S-Curve Logistic Deferral)">
          <Eq>{`deflationRate = max(0, -netInflation)
deferralRate = deferrableShare / (1 + exp(-steepness × (deflationRate - midpoint)))
velocityMultiplier = 1.0 - deferralRate`}</Eq>
          <Prose>
            Consumers defer durable purchases when expecting price declines. The S-curve ensures
            small deflation rates have minimal impact, but deflation beyond the midpoint triggers
            rapid deferral up to the deferrable consumption share.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="deferrableShare" value={DEFERRABLE_CONSUMPTION_SHARE} />
            <Param name="midpoint" value={DEFLATION_MIDPOINT} />
            <Param name="steepness" value={DEFLATION_STEEPNESS} />
          </div>
          <Source>BEA PCE Tables (durable goods share); Japan deflation literature</Source>
          <CodeRef>macro.ts → computeDeflationDrag()</CodeRef>
        </EquationCard>

        {/* ================================================================
            SECTION 4: PRICES & INFLATION
        ================================================================ */}
        <SectionHeader id="prices" number={4} title="Prices & Inflation" color="#22C55E" />

        <EquationCard number="4.1" title="Sectoral Composite Inflation">
          <Eq>{`sector_s = base_s + broadPressures − aiDeflation_s × passthrough_s   (4 sectors)
composite = Σ weight_s × sector_s + monetaryInflation
netInflation = aiExposedInflation      (back-compatibility alias: the goods bucket)`}</Eq>
          <Prose>
            Consumer inflation is a weighted blend of four consumption sectors (shelter,
            AI-exposed goods and services, labor services, food and energy). AI cost deflation
            reaches each sector only through that sector's pass-through — the retained
            fraction accrues to producer margins. Shelter inflation comes from the structural
            housing system (Eq 4.4), and a uniform monetary term applies across all sectors.
            A parallel non-AI composite (the same blend with AI supply deflation added back)
            feeds the revenue-pressure loop, so cheaper goods never register as demand
            contraction.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="baselineInflation" value={(BASE_INFLATION_RATE * 100).toFixed(1) + '%'} />
          </div>
          <CodeRef>macro.ts → computeMacro() (~line 1079)</CodeRef>
        </EquationCard>

        <EquationCard number="4.2" title="Sector-Weighted AI Deflation (Inference Cost = Token Cost × Tokens per Task)">
          <Eq>{`tokenCostFactor(t) = floor + (1 - floor) × exp(-k × t^decayExponent)
inferenceCostFactor(t) = tokenCostFactor(t) × tokenUsageMultiplier(year)
inferenceCostSavings = 1 - inferenceCostFactor(yearsSinceStart)
sectorDeflation = autoCoverage × deflationIntensity × inferenceCostSavings
totalDeflation = Σ(cpiWeight × sectorDeflation)`}</Eq>
          <Prose>
            Total inference cost is decomposed into cost-per-token (a smooth, floored decay
            curve representing compute hardware progress) and tokens-per-task (a year-by-year
            multiplier representing how many tokens a single task consumes — chain-of-thought,
            agent loops, deeper context). Token cost is a baseline; tokens-per-task is a
            year-overridable parameter set in the Year Parameters section, because its
            trajectory depends on business decisions and doesn't follow a smooth curve.
            The default trajectory is a spike-and-recover curve — a near-term jump as
            reasoning/agentic models explode token usage (peaking at 25× in 2027), then a
            decline back to the 2025 baseline by 2030 as algorithmic breakthroughs restore
            efficiency. CPI-weighted across 51 clusters; deflation intensity varies by
            sector — tech and finance high, healthcare and education low.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="floor" value={DEFAULT_TOKEN_COST_CURVE.floor} />
            <Param name="k" value={DEFAULT_TOKEN_COST_CURVE.k} />
            <Param name="decayExponent" value={DEFAULT_TOKEN_COST_CURVE.decayExponent} />
            <Param name="tokensPerTask (2025→2030)" value={DEFAULT_TOKEN_USAGE_SCHEDULE.join('× → ') + '×'} />
          </div>
          <Source>BEA GDP-by-Industry Table 7 (deflation intensity); BLS CPI weights; Epoch AI (inference costs)</Source>
          <CodeRef>bfcs.ts → computeTokenCostFactor(), computeInferenceCostFactor(); macro.ts → computeSectorWeightedDeflation()</CodeRef>
        </EquationCard>

        <EquationCard number="4.3" title="Nominal Wage Growth (One-Sided Phillips Curve with Downward Rigidity)">
          <Eq>{`perWorkerProductivity = baselineGDPGrowth − populationGrowth        (≈ 1.6%/yr)
excessUnemployment = max(0, UE − naturalUE)

nominalWageGrowth = inflationIndexation × compositeInflation(t−1)
                  + productivityPassthrough × perWorkerProductivity
                  − phillipsSlope × excessUnemployment
                  + Δ scarcityPremium

if nominalWageGrowth < 0:
  nominalWageGrowth ×= (1 − downwardWageRigidity)

wageIndex(t) = wageIndex(t−1) × (1 + nominalWageGrowth)
effectiveWageIndex = max(wageIndex, policyWageFloor × trendWageIndex)`}</Eq>
          <Prose>
            Wages grow with last year&apos;s inflation, with productivity per worker, and fall
            when unemployment exceeds its natural rate. The slack term is one-sided: a tight
            labor market does not add a boom premium. Workers resist nominal pay cuts, so
            negative wage growth is dampened — in a depression wages fall, but far more slowly
            than the slack alone implies. Workers who are hard to replace earn a scarcity
            premium while automation coverage is partial; the premium fades as coverage
            saturates, and it feeds back into the next year&apos;s automation cost comparison.
            A legislated minimum wage acts as a floor on the wage level itself. Wages read the
            previous year&apos;s inflation, so wages and prices cannot chase each other within
            a single year.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="phillipsSlope" value={DEFAULT_PHILLIPS_SLOPE} />
            <Param name="naturalUE" value={(NATURAL_UNEMPLOYMENT_RATE * 100).toFixed(1) + '%'} />
            <Param name="downwardRigidity" value={DEFAULT_DOWNWARD_WAGE_RIGIDITY} />
            <Param name="inflationIndexation" value={DEFAULT_INFLATION_INDEXATION} />
            <Param name="productivityPassthrough" value={DEFAULT_PRODUCTIVITY_PASSTHROUGH} />
          </div>
          <Source>Phillips (1958), one-sided slack form; downward nominal rigidity: Bewley (1999) class of evidence — constants carry their citations in constants.ts; decision record: docs/FABLE_AUDIT_SUMMARY.md</Source>
          <CodeRef>macro.ts → computeNominalWageGrowth()</CodeRef>
        </EquationCard>

        <EquationCard number="4.4" title="Shelter CPI (Structural Rent from the Housing Block)">
          <Eq>{`occupancyGap = occupancyRate − naturalOccupancy
incomePerHouseholdGrowth = afterTaxIncomeGrowth(t−1) − householdGrowth

rentGrowthRaw = rentOccupancyElasticity × occupancyGap
              + opexPassthrough × constructionCostGrowth
              + rentIncomeElasticity × incomePerHouseholdGrowth

rentGrowth = rentGrowthRaw                                   if rentGrowthRaw ≥ 0
           = (1 − rentDownwardRigidity) × rentGrowthRaw      if rentGrowthRaw < 0

shelterInflation = rentGrowth
compositeInflation = Σ sectorWeight × sectorInflation        (shelter is one of four sectors)`}</Eq>
          <Prose>
            Shelter prices come from a structural rental market, not a fixed trend. Rents rise
            when housing is scarce (occupancy above its natural level), when landlords&apos;
            operating costs rise, and when tenant incomes rise. Rents fall when those forces
            reverse, but slowly: landlords resist cutting nominal rents, so only a fraction of
            a negative pressure is realized each year. The rent index is the model&apos;s
            shelter CPI. Home prices are a separate, linked index driven by rents,
            capitalization rates, and distress sales; construction activity responds to prices
            through a builder pipeline that feeds back into occupancy.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="shelterWeight" value={BASELINE_SHELTER_CPI_WEIGHT} />
            <Param name="occupancyElasticity" value={DEFAULT_RENT_OCCUPANCY_ELASTICITY} />
            <Param name="opexPassthrough" value={DEFAULT_OPEX_PASSTHROUGH} />
            <Param name="rentIncomeElasticity" value={DEFAULT_RENT_INCOME_ELASTICITY} />
            <Param name="downwardRigidity" value={DEFAULT_RENT_DOWNWARD_RIGIDITY} />
          </div>
          <Source>NAA/IREM operating-expense share; Genesove (2003) nominal rent rigidity; the rent-income elasticity from a 40-year CPI-rent/income decomposition — citations at the constants; decision record: docs/FABLE_AUDIT_SUMMARY.md</Source>
          <CodeRef>macro.ts → computeHousingBlock()</CodeRef>
        </EquationCard>

        <EquationCard number="4.5" title="Price Level">
          <Eq>{`P(t) = max(0.01, P(t-1) × (1 + compositeInflation))`}</Eq>
          <Prose>
            Cumulative price index, starting at P(0) = 1.0 in the base year. Uses composite
            inflation (36% shelter + 64% goods with all 7 components) for accumulation. Floored
            at 0.01 to prevent division-by-zero in downstream formulas.
          </Prose>
          <CodeRef>macro.ts → computeMacro() (inline after compositeInflation)</CodeRef>
        </EquationCard>

        {/* ================================================================
            SECTION 5: GDP & PRODUCTION
        ================================================================ */}
        <SectionHeader id="gdp" number={5} title="GDP & Production" color="#6366F1" />

        <EquationCard number="5.1" title="GDP Identity (Nominal-First)">
          <Eq>{`GDP_nominal = C + I + G + NX
GDP_real = GDP_nominal / priceLevel`}</Eq>
          <Prose>
            ALL GDP components are computed in nominal terms. Real GDP is derived by dividing
            by the price level index. This is the core accounting identity — the nominal-first
            architecture ensures internal consistency when prices are changing rapidly.
          </Prose>
          <CodeRef>macro.ts → computeMacro() (~line 1305)</CodeRef>
        </EquationCard>

        <EquationCard number="5.2" title="Investment (Demand-Constrained)">
          <Eq>{`investmentRealization = utilization^utilExp × demand^demandExp × creditHealth^creditExp
aiInvestmentRealized = aiProductionBoost × investmentRealization
tradInvestment = prevNominalGDP × tradFraction × creditMult × tradDemandFactor
investment = tradInvestment + aiInvestmentRealized`}</Eq>
          <Prose>
            Three market signals gate AI investment: capacity utilization, consumer demand,
            and business credit conditions. Each signal has a user-adjustable sensitivity
            (0-100%) mapped to an exponent (0-3.0). Traditional investment responds to
            consumer demand via a separate sensitivity parameter.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="tradInvestFraction" value={TRADITIONAL_INVESTMENT_GDP_FRACTION} />
          </div>
          <Source>BEA NIPA Table 1.1.5; Accelerator principle (Samuelson 1939); Fed SLOOS</Source>
          <CodeRef>macro.ts → computeMacro() (~line 1310)</CodeRef>
        </EquationCard>

        <EquationCard number="5.3" title="Government Spending">
          <Eq>{`obligationG = ${G_OBLIGATION_SHARE} × baselineG × effectiveCOLA × consolidationObligMult
revenueSensitiveG = ${G_REVENUE_SENSITIVE_SHARE} × prevNominalGDP × govtFraction × consolidationDiscMult
governmentSpending = obligationG + revenueSensitiveG`}</Eq>
          <Prose>
            {(G_OBLIGATION_SHARE * 100).toFixed(0)}% is obligatory (entitlements, defense — indexed to COLA-dampened inflation),
            {' '}{(G_REVENUE_SENSITIVE_SHARE * 100).toFixed(0)}% is revenue-sensitive (state/local discretionary — scales with GDP).
            Fiscal consolidation multipliers ramp from 1.0 toward spending cuts as debt/GDP
            rises above the fiscal preset's threshold. The COLA dampening mechanism (same
            as transfers) can reduce obligation growth under austerity presets.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="govtFraction" value={GOVERNMENT_SPENDING_GDP_FRACTION} />
          </div>
          <Source>CBO Budget 2024; Census Government Finance Statistics</Source>
          <CodeRef>macro.ts → computeMacro() (~line 2024)</CodeRef>
        </EquationCard>

        <EquationCard number="5.4" title="Net Exports">
          <Eq>{`netExports = prevNominalGDP × nxFraction + aiNetExportBoost`}</Eq>
          <Prose>
            Baseline net exports fraction
            ({(NET_EXPORTS_GDP_FRACTION * 100).toFixed(1)}% — typically negative) plus AI production onshoring boost.
          </Prose>
          <CodeRef>macro.ts → computeMacro() (~line 1288)</CodeRef>
        </EquationCard>

        <EquationCard number="5.5" title="AI Production Expansion">
          <Eq>{`For each cluster:
  additionalOutput = displacedWorkers × avgWage × (productivityMultiplier - 1)

totalOutput split:
  30% → investment, 10% → net exports, 60% → consumer goods potential`}</Eq>
          <Prose>
            AI doesn't just replace workers — it produces MORE output per displaced unit.
            Software AI produces 5× per displaced worker, robotics 2.5×. The additional
            output splits into GDP components: investment (capex), net exports (onshoring),
            and consumer goods (which may go unrealized if demand is insufficient).
          </Prose>
          <Source>McKinsey (2023); BCG (2024); BEA Private Fixed Investment</Source>
          <CodeRef>simulation.ts → computeAIProductionExpansion()</CodeRef>
        </EquationCard>

        <EquationCard number="5.6" title="GDP Growth Rate">
          <Eq>{`gdpGrowthRate = (GDP_nominal - prevNominalGDP) / prevNominalGDP`}</Eq>
          <Prose>
            Computed from NOMINAL GDP, not real. This is consistent with the nominal-first
            architecture and feeds back into revenue pressure and credit channel calculations.
          </Prose>
          <CodeRef>macro.ts → computeMacro() (~line 1347)</CodeRef>
        </EquationCard>

        <EquationCard number="5.7" title="Corporate Profits (Residual Identity)">
          <Eq>{`otherCosts = otherCostsShare × GDP
corporateProfits = GDP − totalWageBill − nonCorporateAssetIncome − otherCosts`}</Eq>
          <Prose>
            Corporate profits are whatever remains of national income after paying workers,
            non-corporate owners, and other costs. Profit margins are an output of the
            simulation, not an assumption. The identity closes the income side of the
            accounts: when displacement cuts the wage bill, the savings appear in profits;
            when demand collapses faster than costs, profits absorb the loss. Profits cannot
            be assumed to grow through a collapse in which someone must be absorbing losses.
            Dividends paid from these profits flow to household asset income with a one-year
            lag and are floored at zero in loss years.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="otherCostsShare" value={DEFAULT_OTHER_COSTS_SHARE} />
          </div>
          <Source>BEA NIPA accounting identity (corporate profits as residual national income); decision record: docs/FABLE_AUDIT_SUMMARY.md</Source>
          <CodeRef>macro.ts → computeMacro(), residual-profits block</CodeRef>
        </EquationCard>

        {/* ================================================================
            SECTION 6: FINANCIAL SYSTEM
        ================================================================ */}
        <SectionHeader id="financial" number={6} title="Financial System" color="#D97706" />

        <EquationCard number="6.1" title="Dual Credit Channels">
          <Eq>{`CONSUMER (3 channels → consumption):
  Ch1: incomeAdequacy = (wages×1.0 + transfers×reliability + assets×0.10)
       / adjustedBaseline → deficiency → tightening
  Ch2: collateral = mortgageStress × |homePriceChange| (3:1 asymmetry)
  Ch3: systemic = cwiDecline × riskSens + inflationRiskPremium
  consumerMultiplier = 1.0 - impact × (totalTightening / maxTightening)

BUSINESS (2 channels → investment):
  Ch1: profitCoverage = afterTaxProfits / baselineProfits
  Ch2: revenueTrajectory = -gdpSensitivity × prevGDPGrowthRate
  businessMultiplier = 1.0 - impact × (totalTightening / maxTightening)`}</Eq>
          <Prose>
            Consumer credit uses three independent channels: income adequacy (banks assess
            each income stream by perceived stability), collateral values (asymmetric — falling
            home prices trigger 3× the response of rising prices), and systemic risk (CWI decline
            + inflation premium). Business credit diverges: profitability and GDP growth drive
            loosening even as consumer credit tightens in AI scenarios.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="maxConsumerTight" value={MAX_CREDIT_TIGHTENING} />
            <Param name="investImpact" value={CREDIT_INVESTMENT_SENSITIVITY} />
            <Param name="consImpact" value={CREDIT_CONSUMPTION_SENSITIVITY} />
            <Param name="businessGDPSens" value={DEFAULT_BUSINESS_CREDIT_GDP_SENSITIVITY} />
            <Param name="maxLoosening" value={DEFAULT_MAX_BUSINESS_CREDIT_LOOSENING} />
          </div>
          <Source>Fed SLOOS data; BEA NIPA (2008); Fed SCF; Elul et al. (2010)</Source>
          <CodeRef>macro.ts → computeConsumerCreditConditions(), computeBusinessCreditConditions()</CodeRef>
        </EquationCard>

        <EquationCard number="6.2" title="Mortgage Stress Index">
          <Eq>{`For each income quintile:
  actualStress += displacementRate[q] × mortgageBurden[q] × homeownership[q]
  proportionalStress += overallRate × mortgageBurden[q] × homeownership[q]

rawIndex = actualStress / proportionalStress
mortgageStressIndex = 1.0 + (rawIndex - 1.0) × amplifier`}</Eq>
          <Prose>
            AI displaces high-wage knowledge workers (upper quintiles) first. These workers
            have higher homeownership rates and larger mortgages. The same unemployment rate
            causes disproportionate banking stress compared to historical recessions that
            hit low-wage workers first.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="amplifier" value={DEFAULT_MORTGAGE_STRESS_AMPLIFIER} />
          </div>
          <Source>Federal Reserve Survey of Consumer Finances (SCF) 2022</Source>
          <CodeRef>macro.ts → computeMortgageStressIndex()</CodeRef>
        </EquationCard>

        <EquationCard number="6.3" title="Dynamic Homeownership">
          <Eq>{`laggedDisplacement = displacementHistory[t - lagYears]    (interpolated)
foreclosureImpact = quintileDispRate × mortgageBurden × currentOwnership
recovery = recoveryRate × (baselineOwnership - currentOwnership)
homeownership[q] = max(0, min(1, current - foreclosureImpact + recovery))`}</Eq>
          <Prose>
            Foreclosures follow displacement with a configurable lag (~{DEFAULT_FORECLOSURE_LAG} years — typical
            savings buffer before mortgage default). Recovery pulls homeownership back toward
            the baseline, modeling household formation and market stabilization.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="lag" value={DEFAULT_FORECLOSURE_LAG} unit="years" />
            <Param name="recoveryRate" value={DEFAULT_HOMEOWNERSHIP_RECOVERY_RATE} unit="/year" />
          </div>
          <Source>MBA National Delinquency Survey; Census Housing Vacancy Survey; Elul et al. (2010)</Source>
          <CodeRef>macro.ts → updateHomeownership()</CodeRef>
        </EquationCard>

        <EquationCard number="6.4" title="Home Prices & Housing Wealth">
          <Eq>{`ΔP/P = ΔR/R − Δcap/cap + fireSale        (the structural price: rents ÷ cap rate)
cap = 0.052 + 0.4 × (mortgageRate − 6%)
wealthBase(t) = BASELINE_WEALTH × homePriceIndex(t)
housingWealthDrag = wealthBase × ΔP/P × housingWealthMPC × avgHomeownership`}</Eq>
          <Prose>
            Home prices come from the structural housing system: rents divided by a
            rate-sensitive capitalization rate, plus fire-sale pressure from unabsorbed
            foreclosures. Even employed homeowners cut spending when home prices fall — the
            primary 2008 recession transmission. The wealth base scales with the price index
            rather than staying frozen at the baseline ${(BASELINE_HOUSING_WEALTH / 1e12).toFixed(0)}T.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="housingWealthMPC" value={DEFAULT_HOUSING_WEALTH_MPC} />
            <Param name="baselineWealth" value={`$${(BASELINE_HOUSING_WEALTH / 1e12).toFixed(0)}T`} />
          </div>
          <Source>Glaeser et al (2012); Mian & Sufi (2009); Case & Shiller (1989); Fed Z.1 Financial Accounts</Source>
          <CodeRef>macro.ts → computeHousingBlock(); computeMacro() housing-wealth section</CodeRef>
        </EquationCard>

        <EquationCard number="6.5" title="Fiscal Pressure (Reporting Only)">
          <Eq>{`revenue = effectiveTaxRate × GDP_nominal
spending = baselineG + transfers + debtInterest + policyCost
deficit = spending - revenue
deficitGDPRatio = deficit / GDP_nominal`}</Eq>
          <Prose>
            The model reports the fiscal deficit but does NOT enforce austerity. Government
            spending is not reduced by the deficit — that is treated as a political judgment
            beyond the model's scope.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="effectiveTaxRate" value={EFFECTIVE_TAX_RATE} />
            <Param name="cashPerUnemployed" value={`$${(DEFAULT_CASH_TRANSFER_PER_UNEMPLOYED / 1000).toFixed(0)}k/yr`} />
            <Param name="inKindPerUnemployed" value={`$${(DEFAULT_IN_KIND_TRANSFER_PER_UNEMPLOYED / 1000).toFixed(0)}k/yr`} />
          </div>
          <Source>FRED FGRECPT; DOL ETA UI Data Summary; USDA FNS; KFF Medicaid per-enrollee</Source>
          <CodeRef>macro.ts → computeFiscalPressure()</CodeRef>
        </EquationCard>

        <EquationCard number="6.6" title="Monetary Model (Fisher Equation)">
          <Eq>{`M × V = P × Y
moneySupply = priceLevel × GDP_real / velocity`}</Eq>
          <Prose>
            Fisher equation with dynamic velocity that falls during recessions (unemployment
            and consumption effects). Baseline velocity from FRED M2V ({BASELINE_VELOCITY_OF_MONEY.toFixed(2)}).
            Endogenous funding split determines what fraction of policy costs
            is tax-funded vs. money-created.
          </Prose>
          <Source>FRED M2SL, FRED M2V</Source>
          <CodeRef>monetary.ts → computeMonetaryState(), computeDynamicVelocity()</CodeRef>
        </EquationCard>

        <EquationCard number="6.7" title="Equity Market (Gordon Growth with AI Momentum)">
          <Eq>{`momentum = currentCapabilityChange / historicalMaxChange   // ∈ [0, 1]
effectivePE = basePE × (1 + (aiMultiplier - 1) × momentum)
marketCap(t) = profits(t) × effectivePE(t)
aiCapitalGains = max(0, marketCap(t) - marketCap(t-1))`}</Eq>
          <Prose>
            AI-era P/E ratios inflate above trend while capability is accelerating, then
            compress as S-curves flatten. Momentum scales the AI multiplier so the premium
            fades organically as the capability frontier saturates — no hand-coded bubble
            pop. Feeds the asset-income channel (Eq 3.1) and housing-wealth comparisons.
          </Prose>
          <Source>Gordon (1959) growth model; Shiller CAPE data; dot-com and AI-era P/E expansion patterns</Source>
          <CodeRef>equityMarket.ts → computeGrowthMomentum(), computeEquityValuation()</CodeRef>
        </EquationCard>

        <EquationCard number="6.8" title="Bond Market (Fiscal Risk → 10Y Yield)">
          <Eq>{`fiscalRiskPremium = f_trajectory(ΔdebtGDP)        // accelerating deficits
                   + f_sustainability(r - g)        // r vs g divergence
                   + f_level(max(0, debtGDP - 1.0)) // only at extreme debt

tenYearYield = realNeutralRate + expectedInflation
             + fiscalRiskPremium
             + foreignDemandAdjustment
             + supplyAbsorptionPremium

mortgageRate    = tenYearYield + mortgageSpread
corporateRate   = tenYearYield + corporateSpread × creditRiskMultiplier`}</Eq>
          <Prose>
            The 10-year Treasury yield is built from fiscal risk (not just debt/GDP level but
            its trajectory AND the r-vs-g sustainability gap), foreign demand (dollar reserve
            status), and domestic absorption capacity. Rates cascade to mortgages, corporate
            borrowing, and consumer credit. Replaced the prior naive sigmoid-on-debt/GDP model
            that mis-priced slow-burn vs. acute fiscal stress.
          </Prose>
          <Source>Reinhart & Rogoff (2010); Blanchard (2019) on r-g dynamics; FRED DGS10, 30US, AAA, BAA series</Source>
          <CodeRef>bondMarket.ts → computeFiscalRiskPremium(), computeTenYearYield(), computeRateTransmission()</CodeRef>
        </EquationCard>

        <EquationCard number="6.9" title="Federal Reserve (Dual-Mandate Taylor Rule)">
          <Eq>{`outputGap       = (GDP_real - fullEmploymentGDP) / fullEmploymentGDP
employmentGap   = NAIRU - unemploymentRate                // separate term
inflationGap    = inflation - 2%

policyRate = neutralRate + inflationGap
           + outputGapWeight × outputGap
           + employmentGapWeight × employmentGap          // dual mandate

// Fiscal dominance constraint — cap hikes when debt service is unsustainable:
if debtServiceRatio > threshold: policyRate = min(policyRate, fiscalDominanceCeiling)`}</Eq>
          <Prose>
            AI displacement breaks Okun&apos;s Law (the assumed link between output and
            employment), so ATLAS uses an explicit dual-mandate Taylor Rule with separate
            output and employment gap terms. A fiscal-dominance constraint caps rate hikes
            once debt service consumes an unsustainable share of revenue. Output feeds the
            bond market (Eq 6.8) via expected policy rates.
          </Prose>
          <Source>Taylor (1993); Orphanides (2003) dual-mandate extensions; Sargent-Wallace (1981) fiscal dominance</Source>
          <CodeRef>federalReserve.ts → computeFullEmploymentGDP(), computeTaylorRule(), computeFiscalDominance()</CodeRef>
        </EquationCard>

        {/* ================================================================
            SECTION 7: WELFARE & POLICY
        ================================================================ */}
        <SectionHeader id="welfare" number={7} title="Welfare & Policy" color="#4ECDC4" />

        <EquationCard number="7.1" title="Consumer Welfare Index">
          <Eq>{`totalPostTaxIncome = afterTaxWages + afterTaxAssets + afterTaxTransfers
CWI = totalPostTaxIncome / (population × priceLevel)
cwiGrowth = (CWI(t) - CWI(t-1)) / CWI(t-1)`}</Eq>
          <Prose>
            Real post-tax income per capita — the primary welfare metric. Dividing nominal
            after-tax income by priceLevel converts to 2025 purchasing power. Captures both
            price effects and income effects in a single number. Used for cycle phase
            classification and depression detection.
          </Prose>
          <CodeRef>macro.ts → computeMacro() (~line 2050)</CodeRef>
        </EquationCard>

        <EquationCard number="7.2" title="Cycle Phase Classification">
          <Eq>{`if cwiGrowth ≥ 0:
  if was_declining: RECOVERY  else: STABLE
if cwiGrowth < 0:
  if accelerating_decline: ACCELERATING_DECLINE
  if decelerating_decline: DECELERATING_DECLINE
  else: LINEAR_DECLINE`}</Eq>
          <Prose>
            Five-phase cycle detection tracks whether welfare is improving, stable, or
            declining — and whether declines are getting worse or better. Enables policy
            timing recommendations.
          </Prose>
          <CodeRef>macro.ts → computeMacro() cycle classification</CodeRef>
        </EquationCard>

        <EquationCard number="7.3" title="Depression Detection">
          <Eq>{`isDepression = consecutiveDeclineYears ≥ 4 AND UE ≥ 15%`}</Eq>
          <Prose>
            Structural depression flag when welfare has declined for 4+ consecutive years
            AND unemployment exceeds 15%. Both conditions must hold simultaneously.
          </Prose>
          <CodeRef>macro.ts → depression detection</CodeRef>
        </EquationCard>

        <EquationCard number="7.4" title="Demand Feedback">
          <Eq>{`rollingAvgGDP = mean(last 5 years nominalGDP)
demandRatio = min(1, currentGDP / rollingAvgGDP)
demandPenalty = demandRatio ^ sensitivity`}</Eq>
          <Prose>
            Firms can only realize AI profits if demand exists for their output. The 5-year
            rolling average prevents short-term volatility from destabilizing the feedback loop.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="sensitivity" value={DEMAND_FEEDBACK_SENSITIVITY} />
          </div>
          <CodeRef>macro.ts → computeDemandFeedback()</CodeRef>
        </EquationCard>

        <EquationCard number="7.5" title="Policy Effects (3 Channels)">
          <Eq>{`Wage Channel:
  minimumWage → floor on Phillips curve wage pressure
  wageSubsidy → subsidyPct × avgWage × employment

Asset Channel:
  SWF → fund grows with returns + contributions - distributions
  profitSharing → mandatoryShare × aiProfits

Transfer Channel:
  UBI → monthlyAmount × 12 × eligibleAdults
  enhancedUI → incrementalBenefit × totalUnemployment
  retraining → stipend × displacedWorkers × participationRate`}</Eq>
          <Prose>
            Nine policy instruments across three channels. Each channel adds to the corresponding
            income stream, which flows through MPC-differentiated consumption. SWF distributions
            are reclassified from asset to transfer MPC (citizens spend dividends like transfers).
            All policy schedules support keyframe interpolation for time-varying parameters.
          </Prose>
          <Source>Policy design from DATA_MODEL.md §7; Census age data for UBI eligibility</Source>
          <CodeRef>policy.ts → computePolicyEffects()</CodeRef>
        </EquationCard>

        <EquationCard number="7.6" title="Capacity Utilization">
          <Eq>{`potentialGDP = GDP_nominal + aiConsumerGoodsPotential
capacityUtilization = min(1.0, GDP_nominal / potentialGDP)`}</Eq>
          <Prose>
            Measures what fraction of potential output (including AI consumer goods that could
            be produced) is actually realized. Low utilization means demand is insufficient
            to absorb AI output — this constrains profit realization in the next period.
          </Prose>
          <CodeRef>macro.ts → computeMacro() (~line 1314)</CodeRef>
        </EquationCard>

        <EquationCard number="7.7" title="Corporate Profits">
          <Eq>{`aiProfits = aiGDPContribution × aiMargin
tradProfits = (GDP - aiGDP) × tradMargin
totalProfits = min(aiProfits + tradProfits, GDP - totalWageBill)`}</Eq>
          <Prose>
            Bottom-up profit computation with a soft cap: profits cannot exceed GDP minus
            the total wage bill. AI profit growth rate multiplier creates
            super-normal returns during the transition, constrained by demand realization.
          </Prose>
          <div className="flex flex-wrap gap-x-1 mt-2">
            <Param name="aiProfitGrowthRate" value={DEFAULT_AI_PROFIT_GROWTH_RATE} unit="multiplier" />
          </div>
          <CodeRef>macro.ts → computeMacro() profit section</CodeRef>
        </EquationCard>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-text-muted text-xs">
            All equations reflect the current ATLAS simulation engine. Parameter defaults
            are read from <span className="font-mono">constants.ts</span> and stay in sync
            with the model. Source citations reference the academic literature, government
            datasets, and calibration studies that inform each parameter value.
          </p>
          <p className="text-text-muted text-xs mt-2">
            For the complete parameter registry and CSV column mapping, see the documentation
            in <span className="font-mono">docs/Audits/tests/</span>.
          </p>
        </div>
      </main>
    </div>
  );
}
