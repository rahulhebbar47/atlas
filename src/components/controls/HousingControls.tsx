/**
 * ATLAS Housing Controls (Category 7)
 *
 * Subcategories:
 * - Shelter Prices: shelter CPI weight, shelter stickiness, shelter inflation floor (NEW)
 * - Mortgage & Ownership: mortgage stress amplifier, housing wealth MPC,
 *   foreclosure lag, ownership recovery
 * - Market Stabilization: institutional buyer rate (NEW), rental demand sensitivity (NEW)
 *
 * Relocated from: HousingCreditControls (shelter/mortgage/ownership sliders).
 * New sliders: shelter inflation floor, institutional buyer rate, rental demand sensitivity.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import {
  BASELINE_SHELTER_CPI_WEIGHT,
  DEFAULT_SHELTER_INFLATION_STICKINESS,
  DEFAULT_MORTGAGE_STRESS_AMPLIFIER,
  DEFAULT_HOUSING_WEALTH_MPC,
  DEFAULT_FORECLOSURE_LAG,
  DEFAULT_HOMEOWNERSHIP_RECOVERY_RATE,
} from '@/models/constants';

/** Warm amber accent for housing controls */
const CONTROL_COLOR = '#E07C24';

export function HousingControls() {
  // Shelter Prices
  const shelterCPIWeight = useSimulationStore(
    (s) => s.config.shelterCPIWeight ?? BASELINE_SHELTER_CPI_WEIGHT,
  );
  const shelterStickiness = useSimulationStore(
    (s) => s.config.shelterInflationStickiness ?? DEFAULT_SHELTER_INFLATION_STICKINESS,
  );
  const shelterFloor = useSimulationStore(
    (s) => s.config.shelterInflationFloor ?? -0.05,
  );

  // Mortgage & Ownership
  const mortgageStressAmp = useSimulationStore(
    (s) => s.config.mortgageStressAmplifier ?? DEFAULT_MORTGAGE_STRESS_AMPLIFIER,
  );
  const housingWealthMPC = useSimulationStore(
    (s) => s.config.housingWealthMPC ?? DEFAULT_HOUSING_WEALTH_MPC,
  );
  const foreclosureLag = useSimulationStore(
    (s) => s.config.foreclosureLag ?? DEFAULT_FORECLOSURE_LAG,
  );
  const ownershipRecovery = useSimulationStore(
    (s) => s.config.homeownershipRecoveryRate ?? DEFAULT_HOMEOWNERSHIP_RECOVERY_RATE,
  );

  // Market Stabilization (NEW)
  const institutionalBuyer = useSimulationStore(
    (s) => s.config.institutionalBuyerRate ?? 0.40,
  );
  const rentalDemandSens = useSimulationStore(
    (s) => s.config.rentalDemandSensitivity ?? 0.50,
  );

  const updateConfig = useSimulationStore((s) => s.updateConfig);

  // Shelter handlers
  const handleShelterCPIWeight = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, shelterCPIWeight: value })),
    [updateConfig],
  );
  const handleShelterStickiness = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, shelterInflationStickiness: value })),
    [updateConfig],
  );
  const handleShelterFloor = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, shelterInflationFloor: value })),
    [updateConfig],
  );

  // Mortgage handlers
  const handleMortgageStressAmp = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, mortgageStressAmplifier: value })),
    [updateConfig],
  );
  const handleHousingWealthMPC = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, housingWealthMPC: value })),
    [updateConfig],
  );
  const handleForeclosureLag = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, foreclosureLag: value })),
    [updateConfig],
  );
  const handleOwnershipRecovery = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, homeownershipRecoveryRate: value })),
    [updateConfig],
  );

  // Stabilization handlers (NEW)
  const handleInstitutionalBuyer = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, institutionalBuyerRate: value })),
    [updateConfig],
  );
  const handleRentalDemandSens = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, rentalDemandSensitivity: value })),
    [updateConfig],
  );

  return (
    <div className="space-y-5">
      {/* Subcategory: Shelter Prices */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Shelter Prices</p>
        <Slider label="Shelter CPI Weight" value={shelterCPIWeight} min={0.20} max={0.50} step={0.01} color={CONTROL_COLOR} onChange={handleShelterCPIWeight} formatValue={(v) => `${(v * 100).toFixed(0)}%`} />
        <Slider label="Shelter Stickiness" value={shelterStickiness} min={0} max={1} step={0.05} color={CONTROL_COLOR} onChange={handleShelterStickiness} formatValue={(v) => v.toFixed(2)} />
        <Slider label="Shelter Inflation Floor" value={shelterFloor} min={-0.15} max={0} step={0.01} color={CONTROL_COLOR} onChange={handleShelterFloor} formatValue={(v) => `${(v * 100).toFixed(0)}%`} />
      </div>

      {/* Subcategory: Mortgage & Ownership */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Mortgage & Ownership</p>
        <Slider label="Mortgage Stress Amp." value={mortgageStressAmp} min={0} max={2} step={0.05} color={CONTROL_COLOR} onChange={handleMortgageStressAmp} formatValue={(v) => v.toFixed(2)} />
        <Slider label="Housing Wealth MPC" value={housingWealthMPC} min={0} max={0.15} step={0.01} color={CONTROL_COLOR} onChange={handleHousingWealthMPC} formatValue={(v) => v.toFixed(2)} />
        <Slider label="Foreclosure Lag" value={foreclosureLag} min={0} max={3} step={0.25} color={CONTROL_COLOR} onChange={handleForeclosureLag} formatValue={(v) => `${v.toFixed(2)} yr`} />
        <Slider label="Ownership Recovery" value={ownershipRecovery} min={0} max={0.10} step={0.005} color={CONTROL_COLOR} onChange={handleOwnershipRecovery} formatValue={(v) => `${(v * 100).toFixed(1)}%`} />
      </div>

      {/* Subcategory: Market Stabilization */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Market Stabilization</p>
        <Slider label="Institutional Buyer Rate" value={institutionalBuyer} min={0} max={1} step={0.05} color={CONTROL_COLOR} onChange={handleInstitutionalBuyer} formatValue={(v) => v.toFixed(2)} />
        <Slider label="Rental Demand Sensitivity" value={rentalDemandSens} min={0} max={1} step={0.05} color={CONTROL_COLOR} onChange={handleRentalDemandSens} formatValue={(v) => v.toFixed(2)} />
      </div>
    </div>
  );
}
