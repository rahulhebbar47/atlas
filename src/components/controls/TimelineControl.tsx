/**
 * ATLAS Timeline Control
 *
 * Horizontal bar at the top of the main visualization area.
 * Play/pause button, year display, range scrubber with policy window band.
 *
 * Phase 5: Replaced T* tipping point marker with a green policy window band
 * spanning from policyWindowStart to policyWindowClose.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { usePolicyWindowInfo, useCurrentYear } from '@/hooks/useSimulation';
import { useTimelinePlayback } from '@/hooks/useTimelinePlayback';
import { useOverrideCount, useAutopilotYears } from '@/hooks/useParameterTimeline';

export function TimelineControl() {
  const startYear = useSimulationStore((s) => s.config.startYear);
  const endYear = useSimulationStore((s) => s.config.endYear);
  const currentYear = useCurrentYear();
  const isPlaying = useSimulationStore((s) => s.isPlaying);
  const setCurrentYear = useSimulationStore((s) => s.setCurrentYear);
  const togglePlay = useSimulationStore((s) => s.togglePlay);
  const setEndYear = useSimulationStore((s) => s.setEndYear);
  const {
    prepWindowOpen, prepWindowClose,
    fiscalWindowOpen, fiscalWindowClose,
    status,
  } = usePolicyWindowInfo();
  const isPast = status === 'post-window';
  const { years: overrideYears } = useOverrideCount();
  const autopilotYears = useAutopilotYears();

  // Activate playback interval
  useTimelinePlayback(400);

  const handleScrub = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentYear(parseInt(e.target.value, 10));
    },
    [setCurrentYear],
  );

  const handleEndYearChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setEndYear(parseInt(e.target.value, 10));
    },
    [setEndYear],
  );

  // Two-window band positions as percentages
  const totalRange = endYear - startYear;
  const prepStartPct = prepWindowOpen !== null
    ? ((prepWindowOpen - startYear) / totalRange) * 100 : null;
  const prepEndPct = prepWindowClose !== null
    ? ((prepWindowClose - startYear) / totalRange) * 100 : null;
  const fiscalStartPct = fiscalWindowOpen !== null
    ? ((fiscalWindowOpen - startYear) / totalRange) * 100 : null;
  const fiscalEndPct = fiscalWindowClose !== null
    ? ((fiscalWindowClose - startYear) / totalRange) * 100 : null;

  // Scrubber fill percentage
  const fillPercent = ((currentYear - startYear) / totalRange) * 100;

  return (
    <div className="flex items-center gap-4">
      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-bg-card hover:border-gold hover:text-gold text-text-secondary transition-all duration-150 flex-shrink-0"
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      {/* Current year display */}
      <div className="flex-shrink-0 w-[72px]">
        <span
          className={`font-display text-3xl leading-none transition-colors duration-300 ${
            isPast ? 'text-critical' : 'text-text-primary'
          }`}
        >
          {currentYear}
        </span>
      </div>

      {/* Scrubber track */}
      <div className="flex-1 relative">
        <input
          type="range"
          min={startYear}
          max={endYear}
          step={1}
          value={currentYear}
          onChange={handleScrub}
          className="w-full relative z-[2]"
          style={{
            '--slider-color': isPast
              ? 'var(--color-critical)'
              : 'var(--color-gold)',
            background: buildTrackGradient(
              fillPercent, isPast,
              prepStartPct, prepEndPct ?? fiscalStartPct ?? null,
              fiscalStartPct, fiscalEndPct,
            ),
          } as React.CSSProperties}
        />

        {/* Override/autopilot dot indicators */}
        {(overrideYears.size > 0 || autopilotYears.size > 0) && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none z-[1]">
            <svg width="100%" height="16" className="overflow-visible">
              {/* Blue dots — autopilot adjusted years (behind orange) */}
              {Array.from(autopilotYears).map((yr) => {
                if (yr < startYear || yr > endYear) return null;
                const pct = ((yr - startYear) / totalRange) * 100;
                return (
                  <circle
                    key={`ap-${yr}`}
                    cx={`${pct}%`}
                    cy="8"
                    r="2.5"
                    fill="#3B82F6"
                    opacity="0.5"
                  />
                );
              })}
              {/* Orange dots — user override years (on top) */}
              {Array.from(overrideYears).map((yr) => {
                if (yr < startYear || yr > endYear) return null;
                const pct = ((yr - startYear) / totalRange) * 100;
                return (
                  <circle
                    key={`ov-${yr}`}
                    cx={`${pct}%`}
                    cy="8"
                    r="3"
                    fill="#F59E0B"
                    opacity="0.8"
                  />
                );
              })}
            </svg>
          </div>
        )}

        {/* Year labels */}
        <div className="flex justify-between mt-1">
          <span className="font-mono text-[10px] text-text-muted">
            {startYear}
          </span>
          <span className="font-mono text-[10px] text-text-muted">
            {endYear}
          </span>
        </div>
      </div>

      {/* End year selector */}
      <select
        value={endYear}
        onChange={handleEndYearChange}
        className="flex-shrink-0 bg-bg-card border border-border rounded-md px-2 py-1.5 font-mono text-[11px] text-text-secondary focus:outline-none focus:border-gold appearance-none cursor-pointer"
      >
        <option value={2035}>2035</option>
        <option value={2040}>2040</option>
        <option value={2045}>2045</option>
        <option value={2050}>2050</option>
      </select>
    </div>
  );
}

/**
 * Build a multi-stop linear gradient that colors the timeline track:
 * - Default track color for the unfilled portion
 * - Gold/red for the filled (playhead) portion
 * - Amber tint for prep window region
 * - Green tint for fiscal window region
 * - Red tint for post-fiscal region
 */
function buildTrackGradient(
  fillPct: number,
  isPast: boolean,
  prepStart: number | null,
  prepEnd: number | null,
  fiscalStart: number | null,
  fiscalEnd: number | null,
): string {
  const bg = 'var(--color-bg-elevated)';
  const fill = isPast ? 'var(--color-critical)' : 'var(--color-gold)';
  // Window region tints — subtle but visible
  const prepColor = 'rgba(245, 158, 11, 0.25)';
  const fiscalColor = 'rgba(34, 197, 94, 0.25)';
  const postFiscalColor = 'rgba(239, 68, 68, 0.20)';

  // Build color stops: each stop is [pct, color]
  type Stop = [number, string];
  const stops: Stop[] = [];

  // Helper: for a given position, what's the background track color?
  function trackColor(pct: number): string {
    if (fiscalEnd !== null && pct >= fiscalEnd) return postFiscalColor;
    if (fiscalStart !== null && pct >= fiscalStart) return fiscalColor;
    if (prepStart !== null && prepEnd !== null && pct >= prepStart && pct < prepEnd) return prepColor;
    if (prepStart !== null && prepEnd === null && pct >= prepStart) return prepColor;
    return bg;
  }

  // Split the track into: filled part (0→fillPct) and unfilled part (fillPct→100)
  // The filled part uses fill color, the unfilled part uses window-aware track colors
  stops.push([0, fill]);
  stops.push([fillPct, fill]);

  // Collect all boundary points in the unfilled region
  const boundaries = new Set<number>();
  boundaries.add(fillPct);
  boundaries.add(100);
  if (prepStart !== null && prepStart > fillPct) boundaries.add(prepStart);
  if (prepEnd !== null && prepEnd > fillPct) boundaries.add(prepEnd);
  if (fiscalStart !== null && fiscalStart > fillPct) boundaries.add(fiscalStart);
  if (fiscalEnd !== null && fiscalEnd > fillPct) boundaries.add(fiscalEnd);

  const sorted = Array.from(boundaries).sort((a, b) => a - b);
  for (let i = 0; i < sorted.length - 1; i++) {
    const segStart = sorted[i]!;
    const segEnd = sorted[i + 1]!;
    const color = trackColor(segStart + 0.01);
    stops.push([segStart, color]);
    stops.push([segEnd, color]);
  }

  // Deduplicate consecutive same-color stops and build CSS
  const cssStops = stops.map(([pct, color]) => `${color} ${pct.toFixed(1)}%`);
  return `linear-gradient(to right, ${cssStops.join(', ')})`;
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d="M4 2.5L11 7L4 11.5V2.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="3" y="2" width="3" height="10" rx="0.5" />
      <rect x="8" y="2" width="3" height="10" rx="0.5" />
    </svg>
  );
}
