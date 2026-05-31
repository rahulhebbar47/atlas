/**
 * ATLAS Timeline Playback Hook
 *
 * Controls the animated playback of the timeline.
 * When isPlaying is true, advances currentYear by 1 at the given interval.
 * Stops automatically when reaching endYear.
 */

import { useEffect } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';

export function useTimelinePlayback(intervalMs: number = 400): void {
  const isPlaying = useSimulationStore((s) => s.isPlaying);
  const currentYear = useSimulationStore((s) => s.currentYear);
  const endYear = useSimulationStore((s) => s.config.endYear);
  const setCurrentYear = useSimulationStore((s) => s.setCurrentYear);
  const stopPlay = useSimulationStore((s) => s.stopPlay);

  useEffect(() => {
    if (!isPlaying) return;

    const id = setInterval(() => {
      const current = useSimulationStore.getState().currentYear;
      const end = useSimulationStore.getState().config.endYear;

      if (current >= end) {
        stopPlay();
      } else {
        setCurrentYear(current + 1);
      }
    }, intervalMs);

    return () => clearInterval(id);
  }, [isPlaying, intervalMs, setCurrentYear, stopPlay]);
}
