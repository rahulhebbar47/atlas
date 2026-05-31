/**
 * ATLAS Phase 8d: Autopilot Activity Log
 *
 * Chronological list of all years where the autopilot made significant
 * parameter adjustments. Extracted from the parameterTimeline.
 *
 * Only years where autopilot changed a parameter are shown.
 * Clickable year markers jump the timeline to that year.
 */

import { useMemo } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import type { YearParameters, ParameterValue } from '@/types';
import { PARAM_LABELS, PARAM_CATEGORIES, formatParamValue } from '@/utils/parameterFormatter';

// ============================================================
// Types
// ============================================================

interface AutopilotEvent {
  year: number;
  paramKey: string;
  paramLabel: string;
  categoryColor: string;
  explanation: string;
  baselineValue: number;
  autopilotValue: number;
  effectiveValue: number;
  source: 'autopilot' | 'override';
}

interface YearGroup {
  year: number;
  events: AutopilotEvent[];
}

// ============================================================
// Helpers
// ============================================================

const ALL_PARAM_KEYS = PARAM_CATEGORIES.flatMap((cat) => cat.params);
const PARAM_COLOR_MAP = new Map<string, string>();
for (const cat of PARAM_CATEGORIES) {
  for (const key of cat.params) {
    PARAM_COLOR_MAP.set(key, cat.color);
  }
}

function getParamValue(yearParams: YearParameters, key: string): ParameterValue | undefined {
  return (yearParams as unknown as Record<string, ParameterValue>)[key];
}

// ============================================================
// Component
// ============================================================

export function AutopilotLog() {
  const parameterTimeline = useSimulationStore((s) => s.timeline.parameterTimeline);
  const setCurrentYear = useSimulationStore((s) => s.setCurrentYear);

  const yearGroups = useMemo(() => {
    if (!parameterTimeline) return [];

    const groups: YearGroup[] = [];
    const sortedYears = Array.from(parameterTimeline.keys()).sort((a, b) => a - b);

    for (const year of sortedYears) {
      const yearParams = parameterTimeline.get(year)!;
      const events: AutopilotEvent[] = [];

      for (const paramKey of ALL_PARAM_KEYS) {
        const pv = getParamValue(yearParams, paramKey);
        if (!pv) continue;

        // Only include parameters where autopilot differs from baseline
        const autopilotDiffers = Math.abs(pv.autopilot - pv.baseline) > 1e-9;
        const hasOverride = pv.userOverride !== undefined;

        if (!autopilotDiffers && !hasOverride) continue;

        events.push({
          year,
          paramKey,
          paramLabel: PARAM_LABELS[paramKey] ?? paramKey,
          categoryColor: PARAM_COLOR_MAP.get(paramKey) ?? '#6B7280',
          explanation: pv.explanation ?? '',
          baselineValue: pv.baseline,
          autopilotValue: pv.autopilot,
          effectiveValue: pv.effective,
          source: pv.source === 'override' ? 'override' : 'autopilot',
        });
      }

      if (events.length > 0) {
        groups.push({ year, events });
      }
    }

    return groups;
  }, [parameterTimeline]);

  if (yearGroups.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-[12px] p-4">
        <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted mb-2">
          Autopilot Activity Log
        </h3>
        <p className="text-text-muted text-[12px]">
          No autopilot adjustments detected. The current profile has not triggered any fiscal consolidation or COLA dampening.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-[12px] p-4">
      <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted mb-3">
        Autopilot Activity Log
      </h3>

      <div className="space-y-0">
        {yearGroups.map((group) => (
          <YearEntry
            key={group.year}
            group={group}
            onYearClick={() => setCurrentYear(group.year)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Year Entry
// ============================================================

function YearEntry({
  group,
  onYearClick,
}: {
  group: YearGroup;
  onYearClick: () => void;
}) {
  // Deduplicate explanation text (consolidation explanation is shared across params)
  const uniqueExplanations = new Set<string>();
  for (const e of group.events) {
    if (e.explanation) uniqueExplanations.add(e.explanation);
  }

  return (
    <div className="relative pl-5 pb-3 border-l border-border/50 last:border-l-0">
      {/* Year dot */}
      <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-blue-400" />

      {/* Year label */}
      <button
        onClick={onYearClick}
        className="font-mono text-[12px] font-semibold text-blue-400 hover:text-blue-300 transition-colors mb-1"
      >
        {group.year}
      </button>

      {/* Explanation text */}
      {uniqueExplanations.size > 0 && (
        <div className="mb-1.5">
          {Array.from(uniqueExplanations).map((exp, i) => (
            <p key={i} className="text-[11px] text-text-secondary leading-tight">
              {exp}
            </p>
          ))}
        </div>
      )}

      {/* Parameter changes */}
      <div className="space-y-0.5">
        {group.events.map((event) => (
          <div key={event.paramKey} className="flex items-center gap-2 text-[11px]">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: event.categoryColor }}
            />
            <span className="text-text-muted truncate">{event.paramLabel}</span>
            <span className="font-mono text-text-muted ml-auto">
              {formatParamValue(event.baselineValue, event.paramKey)}
            </span>
            <span className="text-text-muted">{'\u2192'}</span>
            <span
              className={`font-mono ${
                event.source === 'override' ? 'text-amber-400' : 'text-blue-400'
              }`}
            >
              {formatParamValue(event.effectiveValue, event.paramKey)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
