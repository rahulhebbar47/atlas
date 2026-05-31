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
  return (
    <div className="space-y-1">
      {VECTOR_IDS.map((id) => (
        <CapabilityVectorSection key={id} vectorId={id} />
      ))}
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
