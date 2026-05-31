/**
 * ATLAS Insights Panel (Right Sidebar)
 *
 * Collapsible right panel (~320px) with view-dependent content.
 * Each dashboard view gets its own snapshot + relevant indicators.
 * Animated via Framer Motion with 0.3s transitions per DESIGN_PHILOSOPHY.md.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from '@/stores/simulationStore';
import { KeyMetrics } from '@/components/charts/KeyMetrics';
import { TippingPointIndicator } from '@/components/charts/TippingPointIndicator';
import { IncomeCompositionChart } from '@/components/charts/IncomeCompositionChart';
import { OverviewSnapshot } from '@/components/charts/OverviewSnapshot';
import { EconomicsSnapshot } from '@/components/charts/EconomicsSnapshot';
import { PolicySnapshot } from '@/components/charts/PolicySnapshot';
import { PolicyWindowIndicator } from '@/components/policy/PolicyWindowIndicator';
import { NetNeutralZoneIndicator } from '@/components/policy/NetNeutralZoneIndicator';
import { RequiredOwnershipCard } from '@/components/policy/RequiredOwnershipCard';
import { RequiredTransferCard } from '@/components/policy/RequiredTransferCard';
import { StateRankingCards } from '@/components/charts/StateRankingCards';
import { NewJobsStressTest } from '@/components/charts/NewJobsStressTest';
import { MonetarySnapshot } from '@/components/charts/MonetarySnapshot';
import { FiscalSnapshot } from '@/components/charts/FiscalSnapshot';
import { InfoTooltip } from '@/components/shared/InfoTooltip';

export function InsightsPanel() {
  const isOpen = useSimulationStore((s) => s.insightsPanelOpen);
  const activeView = useSimulationStore((s) => s.activeView);

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="border-l border-border bg-bg-deep overflow-hidden flex-shrink-0"
        >
          <div className="w-[320px] h-full overflow-y-auto overflow-x-hidden">
            <div className="p-5 space-y-4">
              {/* Section header */}
              <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted flex items-center gap-1.5">
                Current Year Snapshot
                <InfoTooltip text="All metrics reflect the currently selected year on the timeline. Drag the timeline scrubber or press play to see how values change over the simulation period." />
              </h2>

              {/* Shared metrics for all views */}
              <KeyMetrics />
              <TippingPointIndicator />

              {/* View-dependent content */}
              {activeView === 'overview' && (
                <>
                  <OverviewSnapshot />
                  <IncomeCompositionChart />
                  <NewJobsStressTest />
                </>
              )}

              {activeView === 'economics' && (
                <>
                  <EconomicsSnapshot />
                  <StateRankingCards />
                </>
              )}

              {activeView === 'policy' && (
                <>
                  <PolicySnapshot />
                  <PolicyWindowIndicator />
                  <NetNeutralZoneIndicator />
                  <RequiredOwnershipCard />
                  <RequiredTransferCard />
                </>
              )}

              {activeView === 'occupations' && (
                <>
                  <IncomeCompositionChart />
                  <NewJobsStressTest />
                </>
              )}

              {activeView === 'fiscal' && (
                <FiscalSnapshot />
              )}

              {activeView === 'monetary' && (
                <MonetarySnapshot />
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
