/**
 * THE ADVANCED VIEW (R3a′ — the interim RELOCATION per the pre-registered design
 * decision: emptying the sidebar with no Advanced would orphan every slider for one
 * stage boundary, so the existing control sections + the per-year section re-host HERE
 * unchanged; R3b rebuilds this as the dial-table grid with titles, explanations,
 * citation and provenance badges).
 *
 * Layout: the per-year strip first (the owner's linkage — event-activated rows carry
 * their provenance badges from the R1 record), then the control sections in a
 * two-column grid, preserving the sidebar-era grouping and colors.
 */
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useCurrentYear } from '@/hooks/useSimulation';
import { useOverrideCount } from '@/hooks/useParameterTimeline';
import { useSimulationStore, countEventTouchedKeysAt } from '@/stores/simulationStore';
import { CollapsibleSection } from '@/components/controls/CollapsibleSection';
import { AdvancedGrid } from './AdvancedGrid';
import { FiscalResponseSection } from '@/components/controls/FiscalResponseSection';
import { YearParameterSection } from '@/components/controls/YearParameterSection';
// RELOCATED to the Occupations detail page (owner ruling):
// import { BFCSEditor } from '@/components/controls/BFCSEditor';
// RELOCATED to the Occupations detail page (owner ruling):
// import { AlphaControls } from '@/components/controls/AlphaControls';
// RELOCATED to the Occupations detail page (owner ruling):
// import { ReplacementDifficultyEditor } from '@/components/controls/ReplacementDifficultyEditor';
// EMBEDDED in the grid:
// import { TaxRateControls } from '@/components/controls/TaxRateControls';
// EMBEDDED in the grid:
// import { PolicyControls } from '@/components/controls/PolicyControls';
// EMBEDDED in the grid:
// import { PolicyRateScheduleSection } from '@/components/controls/PolicyRateScheduleSection';
// UNMOUNTED by owner ruling (not exposed in this build):
// import { StatePolicyOverrides } from '@/components/controls/StatePolicyOverrides';
// R3c (S6, the duplicate retirement): the 14 PURE-SLIDER sections RETIRED from this
// mount — the grid renders every one of their keys with title, explanation, citation
// and provenance badges (files kept per no-delete; imports commented per the rule).
// AlphaControls: initially kept as the per-cluster alpha owner, later relocated —
// its per-cluster half lives on as ClusterAlphaEditor on the Occupations page; its
// global sliders are the grid's replace-vs-augment group.
// import { CapabilityControls } from '@/components/controls/CapabilityControls';
// import { InferenceCostControls } from '@/components/controls/InferenceCostControls';
// import { AugmentationAndScarcityControls } from '@/components/controls/AugmentationAndScarcityControls';
// import { NewJobsControls } from '@/components/controls/NewJobsControls';
// import { DemographicsControls } from '@/components/controls/DemographicsControls';
// import { FeedbackControls } from '@/components/controls/FeedbackControls';
// import { MultiplierControls } from '@/components/controls/MultiplierControls';
// import { InvestmentCorporateControls } from '@/components/controls/InvestmentCorporateControls';
// import { ConsumerDemandControls } from '@/components/controls/ConsumerDemandControls';
// import { MonetaryPricesControls } from '@/components/controls/MonetaryPricesControls';
// import { CreditFinancialControls } from '@/components/controls/CreditFinancialControls';
// import { HousingControls } from '@/components/controls/HousingControls';
// import { SupplyChainControls } from '@/components/controls/SupplyChainControls';
// import { FiscalMonetaryControls } from '@/components/controls/FiscalMonetaryControls';
//   (its policyRateSchedule keyframe editor lives on as PolicyRateScheduleSection)

export function AdvancedView() {
  const currentYear = useCurrentYear();
  const { forYear } = useOverrideCount();
  const yearOverrideCount = forYear(currentYear);
  const composition = useSimulationStore((s) => s.composition);
  const stripActivity = useMemo(
    () => yearOverrideCount + countEventTouchedKeysAt(currentYear),
    [yearOverrideCount, currentYear, composition],
  );

  // R3c (P1-7): consume anchor / per-year deep links — open the target section and
  // scroll it into view (axis links are consumed by the grid itself).
  const focus = useSimulationStore((s) => s.advancedFocus);
  const clearAdvancedFocus = useSimulationStore((s) => s.clearAdvancedFocus);
  const [openSignals, setOpenSignals] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!focus || focus.kind === 'axis') return;
    const anchor = focus.kind === 'per-year' ? 'per-year-strip' : focus.anchor;
    setOpenSignals((s) => ({ ...s, [anchor]: (s[anchor] ?? 0) + 1 }));
    setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    clearAdvancedFocus();
  }, [focus, clearAdvancedFocus]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 p-6 overflow-y-auto h-full">
      <div>
        <h2 className="font-serif text-2xl text-[#E8ECF4]">Advanced controls</h2>
        <p className="text-[12px] text-[#8A96AD] mt-1 max-w-3xl">
          Every model parameter, pre-populated by your worldview. Values your sidebar
          choices set carry their origin; anything you adjust here shadows the variant
          (badged, resettable). The per-year timeline shows which overrides your events
          activated.
        </p>
      </div>

      {/* the per-year strip: the owner's event-linkage surface. R3c (P2): ACTIVITY-
          AWARE — auto-open when the scrubbed year carries event rows or overrides;
          collapsed with the count badge otherwise (the key remount re-derives the
          default state as the activity flips). */}
      <div id="per-year-strip">
        <CollapsibleSection
          key={stripActivity > 0 ? 'active' : 'idle'}
          title={`Year ${currentYear} Parameters`}
          defaultOpen={stripActivity > 0}
          badge={stripActivity || undefined}
          color="#D4A03C"
          openSignal={openSignals['per-year-strip']}
        >
          <YearParameterSection />
        </CollapsibleSection>
      </div>

      {/* THE DIAL-TABLE GRID — every live parameter, one system. */}
      <AdvancedGrid />

      <div id="editor-fiscal-response">
        <FiscalResponseSection />
      </div>

      {/* THE EDITOR SECTIONS, RETIRED FROM THIS VIEW (owner ruling): the policy
          editors (support programs, taxation, the policy-rate schedule) render
          EMBEDDED inside their own groups on the grid's Policies tab — the controls
          lead, the informational rows follow; the cluster & role editors live on the
          Occupations detail page; the state-override editor is UNMOUNTED (not
          exposed in this build — its keys carry honest ledger text in the grid).
          The prior two-column block rendered here until this ruling; files kept per
          no-delete. */}

    </motion.div>
  );
}
