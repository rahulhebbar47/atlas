/**
 * ATLAS Policy Data Hooks (Phase 5)
 *
 * Hooks that extract policy-specific time series and metrics from
 * the simulation store. Follows the same patterns as useSimulation.ts:
 *   - useShallow for object selectors (avoids infinite re-render)
 *   - useMemo for derived arrays (recalculates only when source changes)
 *
 * These hooks power the Policy Dashboard, Insights Panel indicators,
 * and the "CWI without policy" overlay on the Overview charts.
 */

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSimulationStore } from '@/stores/simulationStore';
import { DEFAULT_POLICY_CONFIG, BOTTOM80_POP_SHARE, BOTTOM80_TRANSFER_SHARE } from '@/models/constants';
import type { PolicyConfig } from '@/types';

// ============================================================
// usePolicyConfig — raw config for controls
// ============================================================

/**
 * Current policy configuration.
 * Uses useShallow because PolicyConfig is a nested object.
 */
export function usePolicyConfig(): PolicyConfig {
  return useSimulationStore(
    useShallow((state) => state.config.policyConfig),
  );
}

// ============================================================
// usePolicyTimeSeries — flattened for Recharts
// ============================================================

export interface PolicyTimeSeriesPoint {
  year: number;
  wageAddition: number;
  assetAddition: number;
  transferAddition: number;
  totalPolicyIncome: number;
  fiscalCost: number;
  fiscalCostGDP: number;
  fundSize: number;
  requiredOwnership: number;
  requiredTransfer: number;
  moneySupply: number;
  maxNeutralTransfers: number;
  inflationFromTransfers: number;
  isWithinNeutralZone: boolean;
}

/**
 * Policy effects flattened into an array for Recharts charts.
 * One entry per simulation year with all policy + monetary fields.
 */
export function usePolicyTimeSeries(): PolicyTimeSeriesPoint[] {
  const years = useSimulationStore((state) => state.timeline.years);
  return useMemo(
    () =>
      years.map((y) => ({
        year: y.year,
        wageAddition: y.policyEffects.wageChannelAddition,
        assetAddition: y.policyEffects.assetChannelAddition,
        transferAddition: y.policyEffects.transferChannelAddition,
        totalPolicyIncome: y.policyEffects.totalPolicyIncome,
        fiscalCost: y.policyEffects.fiscalCost,
        fiscalCostGDP: y.policyEffects.fiscalCostAsPercentGDP,
        fundSize: y.policyEffects.sovereignFundSize,
        requiredOwnership: y.policyEffects.requiredAssetOwnership,
        requiredTransfer: y.policyEffects.requiredTransferLevel,
        moneySupply: y.monetary.moneySupply,
        maxNeutralTransfers: y.monetary.maxNeutralTransfers,
        inflationFromTransfers: y.monetary.actualInflationFromTransfers,
        isWithinNeutralZone: y.monetary.isWithinNeutralZone,
      })),
    [years],
  );
}

// ============================================================
// usePolicyMetrics — single-year snapshot for MetricCards
// ============================================================

export interface PolicyMetrics {
  fiscalCost: number;
  fiscalCostGDP: number;
  isWithinNeutralZone: boolean;
  maxNeutralTransfers: number;
  requiredOwnership: number;
  requiredTransfer: number;
  fundSize: number;
  totalPolicyIncome: number;
  wageAddition: number;
  assetAddition: number;
  transferAddition: number;
  inflationFromTransfers: number;
}

/**
 * Policy metrics at the current year for MetricCard display.
 */
export function usePolicyMetrics(): PolicyMetrics | null {
  const years = useSimulationStore((state) => state.timeline.years);
  const currentYear = useSimulationStore((state) => state.currentYear);
  return useMemo(() => {
    const yearData = years.find((y) => y.year === currentYear);
    if (!yearData) return null;
    return {
      fiscalCost: yearData.policyEffects.fiscalCost,
      fiscalCostGDP: yearData.policyEffects.fiscalCostAsPercentGDP,
      isWithinNeutralZone: yearData.monetary.isWithinNeutralZone,
      maxNeutralTransfers: yearData.monetary.maxNeutralTransfers,
      requiredOwnership: yearData.policyEffects.requiredAssetOwnership,
      requiredTransfer: yearData.policyEffects.requiredTransferLevel,
      fundSize: yearData.policyEffects.sovereignFundSize,
      totalPolicyIncome: yearData.policyEffects.totalPolicyIncome,
      wageAddition: yearData.policyEffects.wageChannelAddition,
      assetAddition: yearData.policyEffects.assetChannelAddition,
      transferAddition: yearData.policyEffects.transferChannelAddition,
      inflationFromTransfers: yearData.monetary.actualInflationFromTransfers,
    };
  }, [years, currentYear]);
}

// ============================================================
// useNoPolicyGDPApproximation — GDP with vs without policy
// ============================================================

export interface GDPComparisonPoint {
  year: number;
  gdpWithPolicy: number;
  gdpWithoutPolicy: number;
}

/**
 * Nominal GDP with vs without policy for every simulation year.
 * "Without policy" approximation: subtract policy-driven consumption
 * (totalPolicyIncome × MPC_TRANSFER=0.90) from nominal GDP.
 */
export function useNoPolicyGDPApproximation(): GDPComparisonPoint[] {
  const years = useSimulationStore((state) => state.timeline.years);
  return useMemo(
    () =>
      years.map((y) => {
        const policyConsumptionImpact = y.policyEffects.totalPolicyIncome * 0.90;
        return {
          year: y.year,
          gdpWithPolicy: y.macro.gdpNominal,
          gdpWithoutPolicy: y.macro.gdpNominal - policyConsumptionImpact,
        };
      }),
    [years],
  );
}

// ============================================================
// useNoPolicyCWIApproximation — CWI with vs without policy
// ============================================================

export interface CWIComparisonPoint {
  year: number;
  cwiWithPolicy: number;
  cwiWithoutPolicy: number;
  medianCwiWithPolicy: number;
  medianCwiWithoutPolicy: number;
}

/**
 * CWI with vs without policy for every simulation year.
 * The "without policy" value approximates by subtracting policy-driven
 * consumption per capita (using MPC_TRANSFER=0.90 as most policy is transfers).
 * Includes both system (macro average) and median (bottom 80%) CWI.
 */
export function useNoPolicyCWIApproximation(): CWIComparisonPoint[] {
  const years = useSimulationStore((state) => state.timeline.years);
  const population = useSimulationStore((state) => state.config.totalPopulation);
  const b80TransferShare = useSimulationStore(
    (state) => state.config.bottom80TransferShare ?? BOTTOM80_TRANSFER_SHARE,
  );
  return useMemo(
    () => {
      const bottom80Pop = BOTTOM80_POP_SHARE * population;
      return years.map((y) => {
        const policyRealConsumptionPerCapita = y.macro.priceLevel > 0 && population > 0
          ? (y.policyEffects.totalPolicyIncome * 0.90) / (y.macro.priceLevel * population)
          : 0;
        // Median: policy income reaches bottom 80% at transferShare rate
        const policyMedianPerCapita = y.macro.priceLevel > 0 && bottom80Pop > 0
          ? (y.policyEffects.totalPolicyIncome * b80TransferShare) / (y.macro.priceLevel * bottom80Pop)
          : 0;
        return {
          year: y.year,
          cwiWithPolicy: y.macro.consumerWelfareIndex,
          cwiWithoutPolicy: y.macro.consumerWelfareIndex - policyRealConsumptionPerCapita,
          medianCwiWithPolicy: y.macro.medianCWI,
          medianCwiWithoutPolicy: y.macro.medianCWI - policyMedianPerCapita,
        };
      });
    },
    [years, population, b80TransferShare],
  );
}

// ============================================================
// usePolicyActive — is any non-default policy enabled?
// ============================================================

/**
 * Returns true if any policy parameter differs from the default config.
 * Used to conditionally show policy overlays on Overview charts.
 */
export function usePolicyActive(): boolean {
  const policyConfig = useSimulationStore((state) => state.config.policyConfig);
  return useMemo(() => {
    // Check each policy's enabled state against defaults
    const keys = Object.keys(DEFAULT_POLICY_CONFIG) as (keyof PolicyConfig)[];
    for (const key of keys) {
      const current = policyConfig[key];
      const defaultPolicy = DEFAULT_POLICY_CONFIG[key];

      // If enabled states differ, policy is active
      if ('enabled' in current && 'enabled' in defaultPolicy) {
        if (current.enabled !== defaultPolicy.enabled) return true;
      }

      // If a policy is enabled, check if any params changed
      if ('enabled' in current && current.enabled) {
        const currentStr = JSON.stringify(current);
        const defaultStr = JSON.stringify(defaultPolicy);
        if (currentStr !== defaultStr) return true;
      }
    }
    return false;
  }, [policyConfig]);
}

// ============================================================
// usePolicyWindow — policy window status
// ============================================================

export interface PolicyWindow {
  prepWindowOpen: number | null;
  prepWindowClose: number | null;
  fiscalWindowOpen: number | null;
  fiscalWindowClose: number | null;
  prepYearsRemaining: number | null;
  fiscalYearsRemaining: number | null;
  status: 'pre-impact' | 'prep-only' | 'both-open' | 'fiscal-only' | 'post-window' | 'recovery';
}

/**
 * Two-part policy window status (Phase 5 Cleanup).
 *
 * Preparation Window: UE-triggered, closes at ACCELERATING_DECLINE.
 * Fiscal Window: AI GDP-triggered, closes when NomGDP declined >20% from peak.
 */
export function usePolicyWindow(): PolicyWindow {
  return useSimulationStore(
    useShallow((state) => {
      const {
        prepWindowOpen, prepWindowClose,
        fiscalWindowOpen, fiscalWindowClose,
        recoveryYear,
      } = state.timeline;
      const currentYear = state.currentYear;

      const prepOpen = prepWindowOpen !== null && currentYear >= prepWindowOpen
        && (prepWindowClose === null || currentYear < prepWindowClose);
      const fiscalOpen = fiscalWindowOpen !== null && currentYear >= fiscalWindowOpen
        && (fiscalWindowClose === null || currentYear < fiscalWindowClose);

      let status: PolicyWindow['status'];
      if (recoveryYear !== null && currentYear >= recoveryYear) {
        status = 'recovery';
      } else if (fiscalWindowClose !== null && currentYear >= fiscalWindowClose) {
        status = 'post-window';
      } else if (prepOpen && fiscalOpen) {
        status = 'both-open';
      } else if (fiscalOpen) {
        status = 'fiscal-only';
      } else if (prepOpen) {
        status = 'prep-only';
      } else {
        status = 'pre-impact';
      }

      const prepYearsRemaining = prepWindowClose !== null && currentYear < prepWindowClose
        ? prepWindowClose - currentYear
        : null;
      const fiscalYearsRemaining = fiscalWindowClose !== null && currentYear < fiscalWindowClose
        ? fiscalWindowClose - currentYear
        : null;

      return {
        prepWindowOpen, prepWindowClose,
        fiscalWindowOpen, fiscalWindowClose,
        prepYearsRemaining, fiscalYearsRemaining,
        status,
      };
    }),
  );
}

// ============================================================
// usePricePressureData — AI deflation vs transfer inflation
// ============================================================

export interface PricePressurePoint {
  year: number;
  aiDeflation: number;         // negative (below zero line)
  transferInflation: number;   // positive (above zero line)
  netPriceChange: number;      // net of both forces
}

/**
 * Returns time series of price pressure decomposition:
 * - AI deflation (negative, pushes prices down)
 * - Transfer inflation (positive, pushes prices up)
 * - Net price change
 */
export function usePricePressureData(): PricePressurePoint[] {
  const years = useSimulationStore((state) => state.timeline.years);
  return useMemo(
    () =>
      years.map((y) => ({
        year: y.year,
        aiDeflation: -Math.abs(y.macro.aiDeflationRate),
        transferInflation: y.monetary.actualInflationFromTransfers,
        netPriceChange: y.macro.netInflation,
      })),
    [years],
  );
}
