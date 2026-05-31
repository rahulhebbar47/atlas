/**
 * ATLAS Tax Rate Controls (Category 8 subcategory)
 *
 * 4 decomposed federal tax rate sliders:
 * - Income Tax Rate
 * - Payroll Tax Rate
 * - Corporate Tax Rate
 * - Capital Gains Tax Rate
 *
 * Relocated from TaxPolicyControls.tsx Section 1.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import {
  BASELINE_INCOME_TAX_RATE,
  BASELINE_PAYROLL_RATE,
  BASELINE_CORPORATE_TAX_RATE,
  BASELINE_CAPITAL_GAINS_RATE,
} from '@/models/constants';

/** Emerald accent for policy controls */
const CONTROL_COLOR = '#10B981';

export function TaxRateControls() {
  const incomeTaxRate = useSimulationStore(
    (s) => s.config.taxConfig?.incomeTaxRate ?? BASELINE_INCOME_TAX_RATE,
  );
  const payrollTaxRate = useSimulationStore(
    (s) => s.config.taxConfig?.payrollTaxRate ?? BASELINE_PAYROLL_RATE,
  );
  const corporateTaxRate = useSimulationStore(
    (s) => s.config.taxConfig?.corporateTaxRate ?? BASELINE_CORPORATE_TAX_RATE,
  );
  const capitalGainsTaxRate = useSimulationStore(
    (s) => s.config.taxConfig?.capitalGainsTaxRate ?? BASELINE_CAPITAL_GAINS_RATE,
  );
  const updateConfig = useSimulationStore((s) => s.updateConfig);

  const handleTaxRate = useCallback(
    (field: 'incomeTaxRate' | 'payrollTaxRate' | 'corporateTaxRate' | 'capitalGainsTaxRate') =>
      (value: number) => {
        updateConfig((config) => ({
          ...config,
          taxConfig: {
            incomeTaxRate: config.taxConfig?.incomeTaxRate ?? BASELINE_INCOME_TAX_RATE,
            payrollTaxRate: config.taxConfig?.payrollTaxRate ?? BASELINE_PAYROLL_RATE,
            corporateTaxRate: config.taxConfig?.corporateTaxRate ?? BASELINE_CORPORATE_TAX_RATE,
            capitalGainsTaxRate: config.taxConfig?.capitalGainsTaxRate ?? BASELINE_CAPITAL_GAINS_RATE,
            [field]: value,
          },
        }));
      },
    [updateConfig],
  );

  return (
    <div className="space-y-3">
      <Slider label="Income Tax Rate" value={incomeTaxRate} min={0} max={0.50} step={0.001} color={CONTROL_COLOR} onChange={handleTaxRate('incomeTaxRate')} formatValue={(v) => `${(v * 100).toFixed(1)}%`} />
      <Slider label="Payroll Tax Rate" value={payrollTaxRate} min={0} max={0.50} step={0.001} color={CONTROL_COLOR} onChange={handleTaxRate('payrollTaxRate')} formatValue={(v) => `${(v * 100).toFixed(1)}%`} />
      <Slider label="Corporate Tax Rate" value={corporateTaxRate} min={0} max={0.50} step={0.001} color={CONTROL_COLOR} onChange={handleTaxRate('corporateTaxRate')} formatValue={(v) => `${(v * 100).toFixed(1)}%`} />
      <Slider label="Capital Gains Tax Rate" value={capitalGainsTaxRate} min={0} max={0.50} step={0.001} color={CONTROL_COLOR} onChange={handleTaxRate('capitalGainsTaxRate')} formatValue={(v) => `${(v * 100).toFixed(1)}%`} />
    </div>
  );
}
