/**
 * FeedbackLoopCard — Collapsible card wrapping a river-flow diagram + simulator panel
 *
 * Renders:
 *   - Header with loop name, accent color dot, description, expand/collapse toggle
 *   - Body (when expanded): FeedbackLoopDiagram + LoopSimulatorPanel side-by-side
 */

import { useState } from 'react';
import type { FeedbackLoopDefinition } from './types';
import { FeedbackLoopDiagram } from './FeedbackLoopDiagram';
import { LoopSimulatorPanel } from './LoopSimulatorPanel';
import { useLoopSimulation } from './useLoopSimulation';
import {
  BASELINE_GDP_NOMINAL_2025,
  BASELINE_TOTAL_EMPLOYMENT,
  BASELINE_CONSUMPTION_2025,
  BASELINE_INVESTMENT_2025,
  BASELINE_HOUSING_WEALTH,
} from '@/models/constants';

// ---------------------------------------------------------------------------
// Per-loop baseline context — key 2025 values grounding each simulation
// ---------------------------------------------------------------------------

const LOOP_BASELINES: Record<string, Array<{ label: string; value: string; source: string }>> = {
  displacement_demand: [
    { label: 'GDP', value: `$${(BASELINE_GDP_NOMINAL_2025 / 1e12).toFixed(1)}T`, source: 'BEA NIPA' },
    { label: 'Employment', value: `${(BASELINE_TOTAL_EMPLOYMENT / 1e6).toFixed(1)}M`, source: 'BLS CES' },
  ],
  phillips_curve: [
    { label: 'GDP', value: `$${(BASELINE_GDP_NOMINAL_2025 / 1e12).toFixed(1)}T`, source: 'BEA NIPA' },
    { label: 'Employment', value: `${(BASELINE_TOTAL_EMPLOYMENT / 1e6).toFixed(1)}M`, source: 'BLS CES' },
  ],
  demand_spillover: [
    { label: 'GDP', value: `$${(BASELINE_GDP_NOMINAL_2025 / 1e12).toFixed(1)}T`, source: 'BEA NIPA' },
    { label: 'Consumption', value: `$${(BASELINE_CONSUMPTION_2025 / 1e12).toFixed(1)}T`, source: 'BEA NIPA' },
    { label: 'Investment', value: `$${(BASELINE_INVESTMENT_2025 / 1e12).toFixed(1)}T`, source: 'BEA NIPA' },
  ],
  credit_crunch: [
    { label: 'Consumption', value: `$${(BASELINE_CONSUMPTION_2025 / 1e12).toFixed(1)}T`, source: 'BEA NIPA' },
    { label: 'Investment', value: `$${(BASELINE_INVESTMENT_2025 / 1e12).toFixed(1)}T`, source: 'BEA NIPA' },
  ],
  fiscal_monetary: [
    { label: 'GDP', value: `$${(BASELINE_GDP_NOMINAL_2025 / 1e12).toFixed(1)}T`, source: 'BEA NIPA' },
    { label: 'Federal Debt', value: `$${(BASELINE_GDP_NOMINAL_2025 * 1.20 / 1e12).toFixed(1)}T`, source: 'Treasury' },
  ],
  housing_wealth: [
    { label: 'Housing Wealth', value: `$${(BASELINE_HOUSING_WEALTH / 1e12).toFixed(0)}T`, source: 'Fed Z.1' },
    { label: 'Consumption', value: `$${(BASELINE_CONSUMPTION_2025 / 1e12).toFixed(1)}T`, source: 'BEA NIPA' },
  ],
};

interface FeedbackLoopCardProps {
  loop: FeedbackLoopDefinition;
  defaultExpanded?: boolean;
}

export function FeedbackLoopCard({ loop, defaultExpanded = false }: FeedbackLoopCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const sim = useLoopSimulation(loop);

  return (
    <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-bg-elevated/50 transition-colors"
      >
        {/* Color dot */}
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: loop.color }}
        />

        {/* Name + description */}
        <div className="flex-1 min-w-0">
          <h3 className="text-text-primary text-sm font-medium">
            {loop.name}
          </h3>
          {!expanded && (
            <p className="text-text-muted text-xs mt-0.5 truncate">
              {loop.description}
            </p>
          )}
        </div>

        {/* Node count badge */}
        <span className="font-mono text-[9px] text-text-muted bg-bg-elevated px-2 py-0.5 rounded flex-shrink-0">
          {loop.nodes.length} vars
        </span>

        {/* Expand/collapse chevron */}
        <svg
          className={`w-4 h-4 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Body — diagram + simulator */}
      {expanded && (
        <div className="border-t border-border">
          {/* Description */}
          <p className="text-text-secondary text-xs leading-relaxed px-5 pt-3 pb-2">
            {loop.description}
          </p>

          {/* Diagram + Simulator layout */}
          <div className="flex flex-col sm:flex-row gap-4 px-5 overflow-hidden">
            {/* Left: Vertical River Flow Diagram */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <FeedbackLoopDiagram
                loop={loop}
                nodeValues={sim.nodeValues}
                deltas={sim.deltas}
                cascade={sim.cascade}
              />
            </div>

            {/* Right: Simulator Panel */}
            <div className="sm:w-[260px] flex-shrink-0">
              <LoopSimulatorPanel
                loop={loop}
                params={sim.params}
                nodeValues={sim.nodeValues}
                deltas={sim.deltas}
                onParamChange={sim.setParam}
                onReset={sim.resetParams}
              />
            </div>
          </div>

          {/* 2025 Baseline Context — below diagram */}
          {(() => {
            const baselines = LOOP_BASELINES[loop.id];
            if (!baselines) return null;
            return (
              <div className="mx-5 mb-5 mt-3 px-3 py-2.5 rounded-md bg-emerald-950/30 border border-emerald-900/40">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-400">
                      2025 Baseline
                    </span>
                  </div>
                  <div className="flex gap-5 flex-wrap">
                    {baselines.map((b) => (
                      <div key={b.label} className="flex items-baseline gap-1.5">
                        <span className="font-mono text-[9px] text-emerald-500/60">{b.label}</span>
                        <span className="font-mono text-[12px] text-emerald-300/90 font-medium">{b.value}</span>
                        <span className="font-mono text-[7px] text-emerald-600/50">{b.source}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
