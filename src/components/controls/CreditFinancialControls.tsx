/**
 * ATLAS Credit & Financial Markets Controls (Category 6)
 *
 * Subcategories:
 * - Credit Cycle: credit UE sensitivity, credit → investment, credit → consumption,
 *   max credit tightening, credit deflation sensitivity
 * - Business Credit: business credit GDP sensitivity, max business credit loosening,
 *   credit adoption sensitivity
 *
 * Relocated from: FinancialMarketsControls (credit UE/invest/consump),
 *   FeedbackLoopControls (max credit tightening), HousingCreditControls (business credit 3 sliders).
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import {
  CREDIT_UE_SENSITIVITY,
  CREDIT_INVESTMENT_SENSITIVITY,
  CREDIT_CONSUMPTION_SENSITIVITY,
  MAX_CREDIT_TIGHTENING,
  DEFAULT_CREDIT_DEFLATION_SENSITIVITY,
  DEFAULT_BUSINESS_CREDIT_GDP_SENSITIVITY,
  DEFAULT_MAX_BUSINESS_CREDIT_LOOSENING,
  DEFAULT_CREDIT_ADOPTION_SENSITIVITY,
} from '@/models/constants';

/** Amber accent for credit & financial controls */
const CONTROL_COLOR = '#F59E0B';

export function CreditFinancialControls() {
  // Credit Cycle
  const creditUE = useSimulationStore((s) => s.config.creditUESensitivity ?? CREDIT_UE_SENSITIVITY);
  const creditInvest = useSimulationStore((s) => s.config.creditInvestmentSensitivity ?? CREDIT_INVESTMENT_SENSITIVITY);
  const creditConsump = useSimulationStore((s) => s.config.creditConsumptionSensitivity ?? CREDIT_CONSUMPTION_SENSITIVITY);
  const maxCredit = useSimulationStore((s) => s.config.maxCreditTightening ?? MAX_CREDIT_TIGHTENING);
  const creditDeflSens = useSimulationStore(
    (s) => s.config.creditDeflationSensitivity ?? DEFAULT_CREDIT_DEFLATION_SENSITIVITY,
  );

  // Business Credit
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

  // Credit Cycle handlers
  const handleCreditUE = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, creditUESensitivity: value })),
    [updateConfig],
  );
  const handleCreditInvest = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, creditInvestmentSensitivity: value })),
    [updateConfig],
  );
  const handleCreditConsump = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, creditConsumptionSensitivity: value })),
    [updateConfig],
  );
  const handleMaxCredit = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, maxCreditTightening: value })),
    [updateConfig],
  );
  const handleCreditDeflSens = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, creditDeflationSensitivity: value })),
    [updateConfig],
  );

  // Business Credit handlers
  const handleBizCreditGDPSens = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, businessCreditGDPSensitivity: value })),
    [updateConfig],
  );
  const handleMaxBizCreditLoosening = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, maxBusinessCreditLoosening: value })),
    [updateConfig],
  );
  const handleCreditAdoptionSens = useCallback(
    (value: number) => updateConfig((c) => ({ ...c, creditAdoptionSensitivity: value })),
    [updateConfig],
  );

  return (
    <div className="space-y-5">
      {/* Subcategory: Credit Cycle */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Credit Cycle</p>
        <Slider label="Credit UE Sensitivity" value={creditUE} min={0} max={5} step={0.1} color={CONTROL_COLOR} onChange={handleCreditUE} formatValue={(v) => v.toFixed(1)} />
        <Slider label="Credit → Investment" value={creditInvest} min={0} max={2} step={0.05} color={CONTROL_COLOR} onChange={handleCreditInvest} formatValue={(v) => v.toFixed(2)} />
        <Slider label="Credit → Consumption" value={creditConsump} min={0} max={2} step={0.05} color={CONTROL_COLOR} onChange={handleCreditConsump} formatValue={(v) => v.toFixed(2)} />
        <Slider label="Max Credit Contraction" value={maxCredit} min={0.3} max={1} step={0.05} color={CONTROL_COLOR} onChange={handleMaxCredit} formatValue={(v) => `${(v * 100).toFixed(0)}%`} />
        <Slider label="Credit Deflation Sensitivity" value={creditDeflSens} min={0} max={0.15} step={0.005} color={CONTROL_COLOR} onChange={handleCreditDeflSens} formatValue={(v) => v.toFixed(3)} />
      </div>

      {/* Subcategory: Business Credit */}
      <div className="space-y-3">
        <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider">Business Credit</p>
        <Slider label="Biz Credit GDP Sens." value={bizCreditGDPSens} min={0} max={15} step={0.5} color={CONTROL_COLOR} onChange={handleBizCreditGDPSens} formatValue={(v) => v.toFixed(1)} />
        <Slider label="Max Biz Credit Loosening" value={maxBizCreditLoosening} min={0} max={1} step={0.05} color={CONTROL_COLOR} onChange={handleMaxBizCreditLoosening} formatValue={(v) => v.toFixed(2)} />
        <Slider label="Credit Adopt. Sens." value={creditAdoptionSens} min={0} max={0.5} step={0.05} color={CONTROL_COLOR} onChange={handleCreditAdoptionSens} formatValue={(v) => v.toFixed(2)} />
      </div>

    </div>
  );
}
