/**
 * ATLAS States View Container (Phase 6)
 *
 * Container component for the States tab.
 * Three states:
 * 1. If a state is selected → show StateDetailView
 * 2. Otherwise → toggle between "Map" and "Compare" sub-views
 *
 * Follows the same routing pattern as OccupationsView.tsx.
 */

import { useState } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { useStateDataLoaded } from '@/hooks/useStateData';
import { StateMap } from './StateMap';
import { StateDetailView } from './StateDetailView';
import { StateComparisonView } from './StateComparisonView';

type SubView = 'map' | 'compare';

export function StatesView() {
  const selectedStateCode = useSimulationStore((s) => s.selectedStateCode);
  const stateDataLoaded = useStateDataLoaded();
  const [subView, setSubView] = useState<SubView>('map');

  // If state data not loaded, show developer message
  if (!stateDataLoaded) {
    return (
      <div className="border border-border rounded-2xl bg-bg-surface p-8">
        <h2 className="font-mono text-[13px] font-semibold uppercase tracking-[0.1em] text-text-primary mb-2">
          State-Level Analysis
        </h2>
        <p className="text-text-muted text-[13px]">
          State data is not loaded. Run the BLS fetch script with{' '}
          <code className="font-mono text-gold bg-bg-elevated px-1.5 py-0.5 rounded">
            --include-states
          </code>{' '}
          to enable state-level analysis.
        </p>
      </div>
    );
  }

  // If a state is selected, show its detail view
  if (selectedStateCode) {
    return <StateDetailView />;
  }

  return (
    <div className="space-y-4">
      {/* Sub-view toggle */}
      <div className="flex items-center gap-1">
        <SubViewButton
          label="Map"
          active={subView === 'map'}
          onClick={() => setSubView('map')}
        />
        <SubViewButton
          label="Compare"
          active={subView === 'compare'}
          onClick={() => setSubView('compare')}
        />
      </div>

      {/* Content */}
      {subView === 'map' && <StateMap />}
      {subView === 'compare' && <StateComparisonView />}
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
