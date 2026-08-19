/**
 * ATLAS Occupations View (Phase 4)
 *
 * Container component for the Occupations tab.
 * Three states:
 * 1. If a cluster is selected → show OccupationDetailView
 * 2. Otherwise → toggle between OccupationBrowser (table) and BFCSHeatmap
 */

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useSimulationStore } from '@/stores/simulationStore';
import { OccupationBrowser } from './OccupationBrowser';
import { OccupationDetailView } from './OccupationDetailView';
import { BFCSHeatmap } from './BFCSHeatmap';

type SubView = 'browser' | 'heatmap';

export function OccupationsView() {
  const selectedClusterId = useSimulationStore((s) => s.selectedClusterId);
  const [subView, setSubView] = useState<SubView>('browser');
  // The browser → detail DRILL transition (owner request): the browser slips up and
  // out, the cluster page rises in; Back reverses it. Exit completes before enter
  // (mode="wait") so the two never overlap; reduced motion collapses to instant.
  const reduced = useReducedMotion();
  const dist = reduced ? 0 : 16;
  const dur = reduced ? 0 : 0.25;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {selectedClusterId ? (
        <motion.div
          key="detail"
          initial={{ opacity: 0, y: dist }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: dist }}
          transition={{ duration: dur, ease: 'easeInOut' }}
        >
          <OccupationDetailView />
        </motion.div>
      ) : (
        <motion.div
          key="browser"
          initial={{ opacity: 0, y: -dist }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -dist }}
          transition={{ duration: dur, ease: 'easeInOut' }}
          className="space-y-4"
        >
          {/* Sub-view toggle */}
          <div className="flex items-center gap-1">
            <SubViewButton
              label="Browser"
              active={subView === 'browser'}
              onClick={() => setSubView('browser')}
            />
            <SubViewButton
              label="BFCS Heatmap"
              active={subView === 'heatmap'}
              onClick={() => setSubView('heatmap')}
            />
          </div>

          {/* Content */}
          {subView === 'browser' && <OccupationBrowser />}
          {subView === 'heatmap' && <BFCSHeatmap />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SubViewButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-[11px] font-mono transition-colors ${
        active
          ? 'bg-gold/15 text-gold border border-gold/30'
          : 'bg-bg-elevated text-text-muted border border-border hover:text-text-secondary'
      }`}
    >
      {label}
    </button>
  );
}
