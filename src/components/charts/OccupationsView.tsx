/**
 * ATLAS Occupations View (Phase 4)
 *
 * Container component for the Occupations tab.
 * Three states:
 * 1. If a cluster is selected → show OccupationDetailView
 * 2. Otherwise → toggle between OccupationBrowser (table) and BFCSHeatmap
 */

import { useState } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { OccupationBrowser } from './OccupationBrowser';
import { OccupationDetailView } from './OccupationDetailView';
import { BFCSHeatmap } from './BFCSHeatmap';

type SubView = 'browser' | 'heatmap';

export function OccupationsView() {
  const selectedClusterId = useSimulationStore((s) => s.selectedClusterId);
  const [subView, setSubView] = useState<SubView>('browser');

  // If a cluster is selected, show its detail view
  if (selectedClusterId) {
    return <OccupationDetailView />;
  }

  return (
    <div className="space-y-4">
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
    </div>
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
