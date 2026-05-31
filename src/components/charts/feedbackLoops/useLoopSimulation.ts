/**
 * useLoopSimulation — React hook for feedback loop mini-simulation
 *
 * Manages local React state (NOT Zustand) for:
 *   - User-adjustable parameter values
 *   - Computed node values via simulate() functions
 *   - Cascading animation state (which node is actively highlighting)
 *   - Delta indicators (change from baseline)
 *
 * Self-contained: does not read from or write to the main simulation store.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { FeedbackLoopDefinition, CascadeAnimationState } from './types';
import { simulateLoop } from './loopSimulations';

/** Delay between each node's cascade highlight (ms) */
const CASCADE_STAGGER_MS = 150;

export interface UseLoopSimulationReturn {
  /** Current parameter values */
  params: Record<string, number>;
  /** Set a single parameter value (triggers re-simulation + cascade) */
  setParam: (paramId: string, value: number) => void;
  /** Reset all params to defaults */
  resetParams: () => void;
  /** Computed node values from the simulation */
  nodeValues: Record<string, number>;
  /** Baseline node values (computed with default params) */
  baselineValues: Record<string, number>;
  /** Per-node delta from baseline */
  deltas: Record<string, number>;
  /** Cascade animation state */
  cascade: CascadeAnimationState;
}

function buildDefaultParams(loop: FeedbackLoopDefinition): Record<string, number> {
  const defaults: Record<string, number> = {};
  for (const p of loop.params) {
    defaults[p.id] = p.defaultValue;
  }
  return defaults;
}

export function useLoopSimulation(loop: FeedbackLoopDefinition): UseLoopSimulationReturn {
  const defaultParams = useMemo(() => buildDefaultParams(loop), [loop]);

  // Baseline values computed once from default params
  const baselineValues = useMemo(
    () => simulateLoop(loop.id, defaultParams),
    [loop.id, defaultParams],
  );

  const [params, setParams] = useState<Record<string, number>>(defaultParams);
  const [nodeValues, setNodeValues] = useState<Record<string, number>>(baselineValues);
  const [cascade, setCascade] = useState<CascadeAnimationState>({
    activeNodeIndex: -1,
    deltas: {},
    isAnimating: false,
  });

  // Track cascade timeouts for cleanup
  const cascadeTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Cleanup cascade timers on unmount
  useEffect(() => {
    return () => {
      for (const timer of cascadeTimers.current) clearTimeout(timer);
    };
  }, []);

  // Compute deltas from baseline
  const deltas = useMemo(() => {
    const d: Record<string, number> = {};
    for (const [key, value] of Object.entries(nodeValues)) {
      const baseline = baselineValues[key];
      if (baseline !== undefined && baseline !== 0) {
        d[key] = (value - baseline) / Math.abs(baseline);
      } else {
        d[key] = value !== 0 ? 1 : 0;
      }
    }
    return d;
  }, [nodeValues, baselineValues]);

  const setParam = useCallback(
    (paramId: string, value: number) => {
      // Update params
      const newParams = { ...params, [paramId]: value };
      setParams(newParams);

      // Re-run simulation
      const newValues = simulateLoop(loop.id, newParams);
      setNodeValues(newValues);

      // Cancel any running cascade
      for (const timer of cascadeTimers.current) clearTimeout(timer);
      cascadeTimers.current = [];

      // Start cascading animation
      setCascade({ activeNodeIndex: 0, deltas: {}, isAnimating: true });

      const nodeCount = loop.nodes.length;
      for (let i = 1; i <= nodeCount; i++) {
        const timer = setTimeout(() => {
          if (i < nodeCount) {
            setCascade((prev) => ({
              ...prev,
              activeNodeIndex: i,
            }));
          } else {
            // Animation complete
            setCascade({
              activeNodeIndex: -1,
              deltas: {},
              isAnimating: false,
            });
          }
        }, i * CASCADE_STAGGER_MS);
        cascadeTimers.current.push(timer);
      }
    },
    [params, loop.id, loop.nodes.length],
  );

  const resetParams = useCallback(() => {
    // Cancel any running cascade
    for (const timer of cascadeTimers.current) clearTimeout(timer);
    cascadeTimers.current = [];

    setParams(defaultParams);
    setNodeValues(baselineValues);
    setCascade({ activeNodeIndex: -1, deltas: {}, isAnimating: false });
  }, [defaultParams, baselineValues]);

  return {
    params,
    setParam,
    resetParams,
    nodeValues,
    baselineValues,
    deltas,
    cascade,
  };
}
