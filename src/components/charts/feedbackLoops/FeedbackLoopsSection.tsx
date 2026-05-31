/**
 * FeedbackLoopsSection — Container for all feedback loop visualizations
 *
 * Integrates into MethodologyView as the first section ("System Dynamics").
 * Contains:
 *   1. System Interconnection Diagram (master overview)
 *   2. Six FeedbackLoopCard components (collapsible, interactive)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ALL_LOOPS } from './loopDefinitions';
// DEPRECATED: SystemInterconnectionDiagram replaced by FeedbackLoopViz (atlas-unified.html iframe)
// import { SystemInterconnectionDiagram } from './SystemInterconnectionDiagram';
import { FeedbackLoopViz } from './FeedbackLoopViz';
import { FeedbackLoopCard } from './FeedbackLoopCard';

export function FeedbackLoopsSection() {
  const loopCardsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const [vizFullscreen, setVizFullscreen] = useState(false);

  // DEPRECATED: handleLoopClick was used by SystemInterconnectionDiagram (now replaced by FeedbackLoopViz iframe)
  // const handleLoopClick = useCallback((loopId: string) => {
  //   const element = loopCardsRef.current.get(loopId);
  //   if (element) {
  //     element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  //   }
  // }, []);

  const setLoopCardRef = useCallback((loopId: string, el: HTMLDivElement | null) => {
    if (el) {
      loopCardsRef.current.set(loopId, el);
    } else {
      loopCardsRef.current.delete(loopId);
    }
  }, []);

  // Close fullscreen on Escape key
  useEffect(() => {
    if (!vizFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVizFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [vizFullscreen]);

  return (
    <div className="space-y-6 overflow-hidden">
      {/* Introduction */}
      <div className="bg-bg-surface border border-border rounded-lg p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-text-primary font-medium text-sm mb-2">
              How the Model Works: Feedback Loops
            </h3>
            <p className="text-text-secondary text-xs leading-relaxed mb-3">
              ATLAS models six interconnected feedback loops that link economic variables through
              causal chains. These loops can amplify or dampen shocks in either direction — a
              positive shock can reinforce growth just as a negative shock can compound decline.
              When one variable changes, the effects propagate through the system like tributaries
              feeding a river.
            </p>
            <p className="text-text-muted text-xs leading-relaxed mb-3">
              Explore the interactive diagram to isolate individual loops, trigger cascade
              animations, and see how variables propagate through the system.
            </p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-bg-elevated border border-border/50">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <p className="font-mono text-[10px] text-text-muted leading-relaxed">
                <span className="text-emerald-400 font-semibold">Grounded in 2025 data</span>
                {' · '}All simulations below use real U.S. economic baselines from BLS, BEA, and Federal Reserve sources — GDP, employment, consumption, housing wealth, and tax rates reflect actual 2025 values, not estimates.
              </p>
            </div>
          </div>
          <button
            onClick={() => setVizFullscreen(true)}
            className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-md text-xs font-mono
                       bg-bg-elevated border border-border text-text-accent
                       hover:bg-[rgba(212,160,60,0.08)] hover:border-text-accent
                       transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 1 13 1 13 5" />
              <polyline points="5 13 1 13 1 9" />
              <line x1="13" y1="1" x2="8.5" y2="5.5" />
              <line x1="1" y1="13" x2="5.5" y2="8.5" />
            </svg>
            View Diagram
          </button>
        </div>
      </div>

      {/* ── Fullscreen System Dynamics Visualization (portaled to body to escape Framer Motion transforms) ── */}
      {vizFullscreen && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            background: '#03060C',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setVizFullscreen(false)}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 81,
              width: 36,
              height: 36,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(12,20,36,0.85)',
              color: '#8A96AD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#D4A03C';
              e.currentTarget.style.borderColor = 'rgba(212,160,60,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#8A96AD';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            }}
            aria-label="Close visualization"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>

          {/* Visualization fills the viewport */}
          <div style={{ flex: 1, minHeight: 0, height: '100%' }}>
            <FeedbackLoopViz height="100%" fullscreen />
          </div>
        </div>,
        document.body,
      )}

      {/* Individual Loop Cards */}
      <div className="space-y-3">
        {ALL_LOOPS.map((loop, i) => (
          <div key={loop.id} ref={(el) => setLoopCardRef(loop.id, el)}>
            <FeedbackLoopCard loop={loop} defaultExpanded={i === 0} />
          </div>
        ))}
      </div>
    </div>
  );
}
