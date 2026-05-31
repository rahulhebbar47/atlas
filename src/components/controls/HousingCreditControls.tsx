/**
 * ATLAS Housing & Credit Controls (Phase 5i)
 *
 * Sliders for shelter inflation, mortgage stress, housing wealth effects,
 * and business credit channels.
 *
 * Shelter (~36% of CPI) stays sticky until embodied AI automates construction.
 * In AI transitions, business credit loosens (GDP growing) while household
 * credit tightens (rising UE). Housing wealth drag amplifies consumption drops
 * when home prices fall.
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
  DEFAULT_BUSINESS_CREDIT_GDP_SENSITIVITY,
  DEFAULT_MAX_BUSINESS_CREDIT_LOOSENING,
  DEFAULT_CREDIT_ADOPTION_SENSITIVITY,
} from '@/models/constants';

/** Warm amber accent for housing & credit controls */
const CONTROL_COLOR = '#E07C24';

export function HousingCreditControls() {
  const shelterCPIWeight = useSimulationStore(
    (s) => s.config.shelterCPIWeight ?? BASELINE_SHELTER_CPI_WEIGHT,
  );
  const shelterStickiness = useSimulationStore(
    (s) => s.config.shelterInflationStickiness ?? DEFAULT_SHELTER_INFLATION_STICKINESS,
  );
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
  const bizCreditGDPSens = useSimulationStore(
    (s) => s.config.businessCreditGDPSensitivity ?? DEFAULT_BUSINESS_CREDIT_GDP_SENSITIVITY,
  );
  const maxBizCreditLoosening = useSimulationStore(
    (s) => s.config.maxBusinessCreditLoosening ?? DEFAULT_MAX_BUSINESS_CREDIT_LOOSENING,
  );
  const creditAdoptionSens = useSimulationStore(
    (s) => s.config.creditAdoptionSensitivity ?? DEFAULT_CREDIT_ADOPTION_SENSITIVITY,
  );
  const updateConfig = useSimulationStore((s) => s.updateConfig);

  const handleShelterCPIWeight = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, shelterCPIWeight: value }));
    },
    [updateConfig],
  );

  const handleShelterStickiness = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, shelterInflationStickiness: value }));
    },
    [updateConfig],
  );

  const handleMortgageStressAmp = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, mortgageStressAmplifier: value }));
    },
    [updateConfig],
  );

  const handleHousingWealthMPC = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, housingWealthMPC: value }));
    },
    [updateConfig],
  );

  const handleForeclosureLag = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, foreclosureLag: value }));
    },
    [updateConfig],
  );

  const handleOwnershipRecovery = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, homeownershipRecoveryRate: value }));
    },
    [updateConfig],
  );

  const handleBizCreditGDPSens = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, businessCreditGDPSensitivity: value }));
    },
    [updateConfig],
  );

  const handleMaxBizCreditLoosening = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, maxBusinessCreditLoosening: value }));
    },
    [updateConfig],
  );

  const handleCreditAdoptionSens = useCallback(
    (value: number) => {
      updateConfig((config) => ({ ...config, creditAdoptionSensitivity: value }));
    },
    [updateConfig],
  );

  return (
    <div className="space-y-3">
      <Slider
        label="Shelter CPI Weight"
        value={shelterCPIWeight}
        min={0.20}
        max={0.50}
        step={0.01}
        color={CONTROL_COLOR}
        onChange={handleShelterCPIWeight}
        formatValue={(v) => `${(v * 100).toFixed(0)}%`}
      />
      <Slider
        label="Shelter Stickiness"
        value={shelterStickiness}
        min={0}
        max={1}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleShelterStickiness}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Mortgage Stress Amp."
        value={mortgageStressAmp}
        min={0}
        max={2}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleMortgageStressAmp}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Housing Wealth MPC"
        value={housingWealthMPC}
        min={0}
        max={0.15}
        step={0.01}
        color={CONTROL_COLOR}
        onChange={handleHousingWealthMPC}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Foreclosure Lag"
        value={foreclosureLag}
        min={0}
        max={3}
        step={0.25}
        color={CONTROL_COLOR}
        onChange={handleForeclosureLag}
        formatValue={(v) => `${v.toFixed(2)} yr`}
      />
      <Slider
        label="Ownership Recovery"
        value={ownershipRecovery}
        min={0}
        max={0.10}
        step={0.005}
        color={CONTROL_COLOR}
        onChange={handleOwnershipRecovery}
        formatValue={(v) => `${(v * 100).toFixed(1)}%`}
      />
      <Slider
        label="Biz Credit GDP Sens."
        value={bizCreditGDPSens}
        min={0}
        max={15}
        step={0.5}
        color={CONTROL_COLOR}
        onChange={handleBizCreditGDPSens}
        formatValue={(v) => v.toFixed(1)}
      />
      <Slider
        label="Max Biz Credit Loosening"
        value={maxBizCreditLoosening}
        min={0}
        max={1}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleMaxBizCreditLoosening}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Credit Adopt. Sens."
        value={creditAdoptionSens}
        min={0}
        max={0.5}
        step={0.05}
        color={CONTROL_COLOR}
        onChange={handleCreditAdoptionSens}
        formatValue={(v) => v.toFixed(2)}
      />
      <p className="text-text-muted text-[10px] leading-relaxed">
        Shelter (~36% of CPI) stays sticky until embodied AI automates construction.
        In AI transitions, business credit loosens (GDP growing) while household
        credit tightens (rising UE). Housing wealth drag amplifies consumption drops
        when home prices fall.
      </p>
    </div>
  );
}
