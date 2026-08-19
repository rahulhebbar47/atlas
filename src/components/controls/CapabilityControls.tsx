/**
 * ATLAS Capability Controls
 *
 * One collapsible section per capability vector, each with 4 sliders
 * (floor, ceiling, steepness, midpoint) and an inline sparkline preview.
 * Color-coded per CAPABILITY_VECTOR_METADATA from constants.ts.
 */

import { useState, useCallback } from 'react';
import type { CapabilityVectorId, CapabilityTrajectoryParams } from '@/types';
import { CAPABILITY_VECTOR_METADATA } from '@/models/constants';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import { CapabilitySparkline } from './CapabilitySparkline';
import { formatPercent, formatYear } from '@/utils/format';

// DEPRECATED: Old 8-vector IDs
// const VECTOR_IDS: CapabilityVectorId[] = ['lang', 'code', 'agent', 'decide', 'robot', 'auto', 'gen', 'sci'];
const VECTOR_IDS: CapabilityVectorId[] = ['generative', 'agentic', 'embodied'];

export function CapabilityControls() {
  // MS1: the frontier-stock overlay legend — rendered only when the current world's
  // shocks (supply famines or funding starvation, since the flywheel MS) drain the
  // stock (the sparklines then carry the dashed overlay).
  const stockDrained = useSimulationStore(
    (s) => s.timeline.years.some((y) => y.macro.frontierStock < 1),
  );
  // Flywheel MS (ruling 5, minimal form): the cost-clock legend — rendered only when
  // the clock has visibly fallen behind calendar (τ/t < 1 somewhere).
  const clockStalled = useSimulationStore(
    (s) => s.timeline.years.some(
      (y) => y.year > s.config.startYear
        && y.macro.effectiveCostTime / (y.year - s.config.startYear) < 0.999,
    ),
  );
  return (
    <div className="space-y-1">
      {VECTOR_IDS.map((id) => (
        <CapabilityVectorSection key={id} vectorId={id} />
      ))}
      {stockDrained && (
        <div className="flex items-center gap-1.5 pt-1.5 pb-0.5">
          <svg width="14" height="4" viewBox="0 0 14 4" className="flex-shrink-0">
            <line x1="0" y1="2" x2="14" y2="2" stroke="#F97316" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.8" />
          </svg>
          <span className="text-text-muted text-[10px] leading-none">
            frontier compute stock — drained by supply shocks and funding collapses, rebuilt at fab speed
          </span>
        </div>
      )}
      {clockStalled && (
        <div className="flex items-center gap-1.5 pt-0.5 pb-0.5">
          <svg width="14" height="4" viewBox="0 0 14 4" className="flex-shrink-0">
            <line x1="0" y1="2" x2="14" y2="2" stroke="#F97316" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.5" />
          </svg>
          <span className="text-text-muted text-[10px] leading-none">
            cost clock — AI cost declines stall while the flywheel is starved, resume at pace on recovery
          </span>
        </div>
      )}
    </div>
  );
}

function CapabilityVectorSection({ vectorId }: { vectorId: CapabilityVectorId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const meta = CAPABILITY_VECTOR_METADATA[vectorId];
  const params = useSimulationStore((s) => s.config.capabilities[vectorId]);
  const setParam = useSimulationStore((s) => s.setCapabilityParam);

  const handleChange = useCallback(
    (param: keyof CapabilityTrajectoryParams, value: number) => {
      setParam(vectorId, param, value);
    },
    [vectorId, setParam],
  );

  return (
    <div className="border-b border-border last:border-b-0">
      {/* Header row — always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full py-2.5 text-left group"
      >
        {/* Color dot */}
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: meta.color }}
        />

        {/* Vector name */}
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-text-secondary group-hover:text-text-primary transition-colors flex-shrink-0">
          {meta.name}
        </span>

        {/* Sparkline */}
        <div className="flex-1 flex justify-end">
          <CapabilitySparkline vectorId={vectorId} />
        </div>

        {/* Chevron */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`flex-shrink-0 text-text-muted transition-transform duration-150 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Expanded slider group */}
      {isExpanded && (
        <div className="pb-3 pl-5 pr-1 space-y-3">
          <Slider
            label="Floor"
            value={params.floor}
            min={0}
            max={1}
            step={0.01}
            color={meta.color}
            onChange={(v) => handleChange('floor', v)}
            formatValue={(v) => formatPercent(v, 0)}
          />
          <Slider
            label="Ceiling"
            value={params.ceiling}
            min={0}
            max={1}
            step={0.01}
            color={meta.color}
            onChange={(v) => handleChange('ceiling', v)}
            formatValue={(v) => formatPercent(v, 0)}
          />
          <Slider
            label="Steepness"
            value={params.steepness}
            min={0.1}
            max={2.0}
            step={0.05}
            color={meta.color}
            onChange={(v) => handleChange('steepness', v)}
            formatValue={(v) => v.toFixed(2)}
          />
          <Slider
            label="Midpoint Year"
            value={params.midpointYear}
            min={2025}
            max={2045}
            step={1}
            color={meta.color}
            onChange={(v) => handleChange('midpointYear', v)}
            formatValue={formatYear}
          />

          {/* Description */}
          <p className="text-text-muted text-[10px] leading-relaxed pt-1">
            {meta.description}
          </p>
        </div>
      )}
    </div>
  );
}
