/**
 * ATLAS Policy Dashboard (Phase 5 Cleanup)
 *
 * Main center panel content when the "Policy" tab is active.
 * Single-column layout:
 *   1. GDP Comparison
 *   2. CWI Comparison
 *   3. Fiscal Cost
 *   4. Income Composition
 *   5. Price Pressure
 *   6. Transfer Headroom
 *   7. Monetary Details (collapsible)
 *   8. Compare Mode
 */

import { GDPComparisonChart } from './GDPComparisonChart';
import { CWIComparisonChart } from './CWIComparisonChart';
import { FiscalCostChart } from './FiscalCostChart';
import { IncomeCompositionTimeChart } from './IncomeCompositionTimeChart';
import { PricePressureChart } from './PricePressureChart';
import { TransferHeadroomCard } from './TransferHeadroomCard';
import { CompareMode } from './CompareMode';

export function PolicyDashboard() {
  return (
    <div className="space-y-6">
      <GDPComparisonChart />
      <CWIComparisonChart />
      <FiscalCostChart />
      <IncomeCompositionTimeChart />
      <PricePressureChart />
      <TransferHeadroomCard />
      <CompareMode />
    </div>
  );
}
