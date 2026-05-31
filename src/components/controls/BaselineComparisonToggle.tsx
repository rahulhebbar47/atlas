/**
 * ATLAS Phase 8c: Baseline Comparison Toggle
 *
 * Toggle switch to show/hide autopilot baseline ghost lines on charts.
 */

import { useSimulationStore } from '@/stores/simulationStore';

export function BaselineComparisonToggle() {
  const showBaselineComparison = useSimulationStore((s) => s.showBaselineComparison);
  const toggleBaselineComparison = useSimulationStore((s) => s.toggleBaselineComparison);

  return (
    <button
      onClick={toggleBaselineComparison}
      className="flex items-center gap-2 w-full px-2 py-1.5 rounded transition-colors duration-150 hover:bg-bg-elevated"
    >
      {/* Toggle track */}
      <div
        className={`relative w-7 h-4 rounded-full flex-shrink-0 transition-colors duration-200 ${
          showBaselineComparison ? 'bg-blue-500' : 'bg-bg-elevated border border-border'
        }`}
      >
        <div
          className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200 ${
            showBaselineComparison
              ? 'left-3.5 bg-white'
              : 'left-0.5 bg-text-muted'
          }`}
        />
      </div>

      {/* Label */}
      <span className={`text-[10px] font-mono ${
        showBaselineComparison ? 'text-blue-400' : 'text-text-muted'
      }`}>
        Compare to autopilot
      </span>
    </button>
  );
}
