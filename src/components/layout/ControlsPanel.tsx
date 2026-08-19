/**
 * ATLAS Controls Panel (Left Sidebar)
 *
 * Phase 8c: Three-section layout:
 *   1. Fiscal Response (always visible) — preset selector + dimension sliders
 *   2. Year Parameters (always visible) — per-year parameter editing
 *   3. Baseline Configuration (collapsed by default) — 9 nested categories
 *
 * Each baseline category has a reset button that restores all sliders to defaults.
 * Animated via Framer Motion with 0.3s transitions per DESIGN_PHILOSOPHY.md.
 */

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from '@/stores/simulationStore';
import { getDefaultSimulationConfig } from '@/models/simulation';
import type { SimulationConfig } from '@/types';
import { CapabilityControls } from '@/components/controls/CapabilityControls';
import { BFCSEditor } from '@/components/controls/BFCSEditor';
// Phase 10.A controls
import { AlphaControls } from '@/components/controls/AlphaControls';
import { AugmentationAndScarcityControls } from '@/components/controls/AugmentationAndScarcityControls';
import { InferenceCostControls } from '@/components/controls/InferenceCostControls';
import { ReplacementDifficultyEditor } from '@/components/controls/ReplacementDifficultyEditor';
import { NewJobsControls } from '@/components/controls/NewJobsControls';
import { DemographicsControls } from '@/components/controls/DemographicsControls';
import { MultiplierControls } from '@/components/controls/MultiplierControls';
import { FeedbackControls } from '@/components/controls/FeedbackControls';
import { InvestmentCorporateControls } from '@/components/controls/InvestmentCorporateControls';
import { ConsumerDemandControls } from '@/components/controls/ConsumerDemandControls';
import { MonetaryPricesControls } from '@/components/controls/MonetaryPricesControls';
import { CreditFinancialControls } from '@/components/controls/CreditFinancialControls';
import { HousingControls } from '@/components/controls/HousingControls';
import { SupplyChainControls } from '@/components/controls/SupplyChainControls';
import { TaxRateControls } from '@/components/controls/TaxRateControls';
import { PolicyControls } from '@/components/controls/PolicyControls';
import { StatePolicyOverrides } from '@/components/controls/StatePolicyOverrides';
import { FiscalMonetaryControls } from '@/components/controls/FiscalMonetaryControls';
import { ScenarioManager } from '@/components/controls/ScenarioManager';
import { WorldviewSidebar } from '@/components/controls/WorldviewSidebar';
import { DataCalibrationZone } from '@/components/controls/DataCalibrationZone';
import { InfoTooltip } from '@/components/shared/InfoTooltip';
import { FiscalResponseSection } from '@/components/controls/FiscalResponseSection';
import { YearParameterSection } from '@/components/controls/YearParameterSection';
import { CollapsibleSection } from '@/components/controls/CollapsibleSection';
import { useOverrideCount } from '@/hooks/useParameterTimeline';
import { useCurrentYear } from '@/hooks/useSimulation';

// DEPRECATED: Old component imports removed from rendering.
// Files still exist per no-delete rule:
//   AIProductionControls, DemandModelControls, FeedbackLoopControls,
//   FinancialMarketsControls, HousingCreditControls, IncomeDistributionControls,
//   MonetaryControls, TaxPolicyControls

/**
 * Small reset icon button for each category header.
 * Counter-clockwise arrow icon — standard "reset" affordance.
 */
function CategoryResetButton({ onClick, color }: { onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      title="Reset to defaults"
      className="ml-auto p-0.5 rounded opacity-40 hover:opacity-100 transition-opacity"
      style={{ color }}
    >
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1.5 1.5v4.5h4.5" />
        <path d="M3.5 13A6.5 6.5 0 1 0 1.5 6" />
      </svg>
    </button>
  );
}

/**
 * Per-category config reset functions.
 * Required fields: copied from getDefaultSimulationConfig().
 * Optional fields: set to undefined so components fall back to module constants.
 */
function resetAICapabilities(config: SimulationConfig): SimulationConfig {
  const defaults = getDefaultSimulationConfig();
  return {
    ...config,
    capabilities: { ...defaults.capabilities },
    bfcsOverrides: {},
  };
}

function resetLaborDemographics(config: SimulationConfig): SimulationConfig {
  const defaults = getDefaultSimulationConfig();
  return {
    ...config,
    innovationRate: defaults.innovationRate,
    rdMultiplier: defaults.rdMultiplier,
    jobPersistenceFactor: defaults.jobPersistenceFactor,
    populationGrowthRate: undefined,
    participationElasticity: undefined,
    participationThreshold: undefined,
    revenuePressureSensitivity: undefined,
    revenuePressureCap: undefined,
    revenuePressureDecay: undefined,
    aiWageProductivityMultiplier: undefined,
    phillipsCurveSensitivity: undefined,
    otherUncategorizedMultiplierOverride: undefined,
  };
}

function resetInvestmentCorporate(config: SimulationConfig): SimulationConfig {
  const defaults = getDefaultSimulationConfig();
  return {
    ...config,
    baselineGDPGrowth: defaults.baselineGDPGrowth,
    aiUtilizationSensitivity: undefined,
    consumerDemandInvestmentSensitivity: undefined,
    creditInvestmentResponseSensitivity: undefined,
    traditionalInvestmentDemandSensitivity: undefined,
    traditionalInvestmentGDPFraction: undefined,
    aiProfitMargin: undefined,
    traditionalProfitMargin: undefined,
    corporateRetentionRate: undefined,
    aiProfitGrowthRate: undefined,
    aiProductionInvestmentFraction: undefined,
    aiProductionOnshoringFraction: undefined,
    newJobWageFraction: undefined,
    aiPESensitivity: undefined,
    traditionalPESensitivity: undefined,
  };
}

function resetConsumerDemand(config: SimulationConfig): SimulationConfig {
  return {
    ...config,
    postTaxMPCs: undefined,
    mpcWageUESensitivity: undefined,
    demandFeedbackSensitivity: undefined,
    bottom80WageShare: undefined,
    bottom80TransferShare: undefined,
    bottom80AssetShare: undefined,
    deferrableConsumptionShare: undefined,
    deflationMidpoint: undefined,
    deflationSteepness: undefined,
  };
}

function resetMonetaryPrices(config: SimulationConfig): SimulationConfig {
  const defaults = getDefaultSimulationConfig();
  return {
    ...config,
    baseInflationRate: defaults.baseInflationRate,
    velocitySensitivity: undefined,
    aiCostParams: undefined,
    scarcityPassThrough: undefined,
    wagePassThrough: undefined,
    wageAutomationSensitivity: undefined,
  };
}

function resetCreditFinancial(config: SimulationConfig): SimulationConfig {
  return {
    ...config,
    creditUESensitivity: undefined,
    creditInvestmentSensitivity: undefined,
    creditConsumptionSensitivity: undefined,
    maxCreditTightening: undefined,
    creditDeflationSensitivity: undefined,
    businessCreditGDPSensitivity: undefined,
    maxBusinessCreditLoosening: undefined,
    creditAdoptionSensitivity: undefined,
  };
}

function resetHousing(config: SimulationConfig): SimulationConfig {
  return {
    ...config,
    shelterCPIWeight: undefined,
    shelterInflationStickiness: undefined,
    shelterInflationFloor: undefined,
    mortgageStressAmplifier: undefined,
    housingWealthMPC: undefined,
    foreclosureLag: undefined,
    homeownershipRecoveryRate: undefined,
    institutionalBuyerRate: undefined,
    rentalDemandSensitivity: undefined,
  };
}

function resetFiscalMonetary(config: SimulationConfig): SimulationConfig {
  return {
    ...config,
    neutralRealRate: undefined,
    termPremium: undefined,
    inflationConvergenceYears: undefined,
    inflationTarget: undefined,
    effectiveLowerBound: undefined,
    fiscalDominanceThreshold: undefined,
    fiscalDominanceDampening: undefined,
    fiscalRiskPremiumMax: undefined,
    fiscalRiskTrajectoryWeight: undefined,
    fiscalRiskSustainabilityWeight: undefined,
    fiscalRiskLevelWeight: undefined,
    fiscalRiskLevelMidpoint: undefined,
    corporateTaxEffectiveness: undefined,
    foreignTreasuryDemand: undefined,
    aiPEMultiplier: undefined,
    policyRateSchedule: undefined,
  };
}

function resetSupplyChain(config: SimulationConfig): SimulationConfig {
  return { ...config, supplyChainConfig: undefined };
}

function resetPolicy(config: SimulationConfig): SimulationConfig {
  const defaults = getDefaultSimulationConfig();
  return {
    ...config,
    policyConfig: { ...defaults.policyConfig },
    taxConfig: undefined,
    stateOverrides: {},
  };
}

export function ControlsPanel() {
  const isOpen = useSimulationStore((s) => s.controlsPanelOpen);
  const updateConfig = useSimulationStore((s) => s.updateConfig);
  const currentYear = useCurrentYear();
  const { forYear } = useOverrideCount();
  const yearOverrideCount = forYear(currentYear);

  const handleReset = useCallback(
    (resetFn: (config: SimulationConfig) => SimulationConfig) => {
      updateConfig(resetFn);
    },
    [updateConfig],
  );

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="border-r border-border bg-bg-deep overflow-hidden flex-shrink-0"
        >
          <div className="w-full h-full overflow-y-auto overflow-x-hidden">
            <div className="p-5 space-y-4">
              {/* R3a' (the redesign ruling): THE SIDEBAR IS THE WORLDVIEW SURFACE.
                  The control sections and the per-year section RELOCATED to the
                  Advanced view (src/components/charts/AdvancedView.tsx — the interim
                  relocation; R3b rebuilds it as the dial-table grid). ScenarioManager
                  holds the reserved Scenarios slot (B-2; worldview bundles at R3c).
                  The data-calibration zone (the AEI program) is the TOPMOST section:
                  the narrative arc reads ground the numbers → beliefs → happenings →
                  choices. */}
              <DataCalibrationZone />
              <ScenarioManager />
              <WorldviewSidebar />
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
