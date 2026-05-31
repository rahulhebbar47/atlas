/**
 * ATLAS Main Visualization Panel
 *
 * Center panel containing the timeline control and view-switched content.
 * Scrollable content area — switches between Overview, Economics, Policy, Occupations
 * based on the active dashboard view in the store.
 *
 * Phase 5: Removed States view, added Economics view.
 */

import { useSimulationStore } from '@/stores/simulationStore';
import { TimelineControl } from '@/components/controls/TimelineControl';
// DEPRECATED: Standalone chart imports moved to Overview 6-chart layout
// import { EmploymentChart } from '@/components/charts/EmploymentChart';
// import { GDPChart } from '@/components/charts/GDPChart';
// import { NewJobsChart } from '@/components/charts/NewJobsChart';
// import { DisplacementDemandDiagram } from '@/components/charts/DisplacementDemandDiagram';
// import { HistoricalComparisonChart } from '@/components/charts/HistoricalComparisonChart';
import { OccupationsView } from '@/components/charts/OccupationsView';
import { PolicyDashboard } from '@/components/policy/PolicyDashboard';
// DEPRECATED: StatesView — state-level analysis removed from main nav in Phase 5
// import { StatesView } from '@/components/charts/StatesView';
import { EconomicsView } from '@/components/charts/EconomicsView';
import { MonetaryView } from '@/components/charts/MonetaryView';
import { MethodologyView } from '@/components/charts/MethodologyView';
import { PredictionsView } from '@/components/charts/PredictionsView';
import { PolicyWindowChart } from '@/components/charts/PolicyWindowChart';
import { CWIChart } from '@/components/charts/CWIChart';
import { IncomeCompositionOverviewChart } from '@/components/charts/IncomeCompositionOverviewChart';
import { GDPCompositionChart } from '@/components/charts/GDPCompositionChart';
import { ProfitWageChart } from '@/components/charts/ProfitWageChart';
import { AIProductionChart } from '@/components/charts/AIProductionChart';
import { PriceLevelChart } from '@/components/charts/PriceLevelChart';
import { FiscalView } from '@/components/charts/FiscalView';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

/**
 * Overview: 6 full-width charts in a single scrolling column.
 * Tells one story: the economy splits in two.
 *
 *   1. GDP Trajectory — headline reassurance (GDP recovers)
 *   2. Consumer Welfare Index — the truth (purchasing power collapses)
 *   3. Price Level Decomposition — goods deflate, shelter sticks
 *   4. Income Composition — where the money went (wages → capital)
 *   5. GDP Composition — what drives GDP now (investment, not consumption)
 *   6. Profits vs Wage Bill — the distributional crossing
 *   7. AI Production & Absorption — the demand gap
 */
function OverviewView() {
  return (
    <>
      <ErrorBoundary section="GDP Trajectory">
        <PolicyWindowChart />
      </ErrorBoundary>
      <ErrorBoundary section="Consumer Welfare">
        <CWIChart />
      </ErrorBoundary>
      <ErrorBoundary section="Price Level Decomposition">
        <PriceLevelChart />
      </ErrorBoundary>
      <ErrorBoundary section="Income Composition">
        <IncomeCompositionOverviewChart />
      </ErrorBoundary>
      <ErrorBoundary section="GDP Composition">
        <GDPCompositionChart />
      </ErrorBoundary>
      <ErrorBoundary section="Profits vs Wages">
        <ProfitWageChart />
      </ErrorBoundary>
      <ErrorBoundary section="AI Production">
        <AIProductionChart />
      </ErrorBoundary>
    </>
  );
}

export function MainVisualization() {
  const activeView = useSimulationStore((s) => s.activeView);

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 min-w-0">
      <TimelineControl />
      <div className="grid gap-6 mt-6 min-w-0">
        {activeView === 'overview' && <OverviewView />}
        {activeView === 'fiscal' && <FiscalView />}
        {activeView === 'economics' && <EconomicsView />}
        {activeView === 'monetary' && <MonetaryView />}
        {activeView === 'occupations' && <OccupationsView />}
        {activeView === 'policy' && <PolicyDashboard />}
        {activeView === 'methodology' && <MethodologyView />}
        {activeView === 'predictions' && <PredictionsView />}
      </div>
    </main>
  );
}
