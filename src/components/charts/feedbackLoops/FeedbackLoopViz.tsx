import { useRef, useEffect, useState } from 'react';

interface FeedbackLoopVizProps {
  /** Height of the visualization container. Defaults to 640px. Accepts number (px) or CSS string. */
  height?: number | string;
  /** When true, removes border-radius and border for viewport-filling mode. */
  fullscreen?: boolean;
  className?: string;
}

/**
 * FeedbackLoopViz
 *
 * Renders the ATLAS unified feedback loop visualization as an iframe.
 * The visualization is a standalone Canvas + DOM app (atlas-unified.html)
 * that handles its own layout, animation, and interaction.
 *
 * The iframe approach is intentional: the visualization uses an RAF loop,
 * imperative DOM mutations, and window resize listeners that must remain
 * isolated from React's render cycle.
 *
 * To update the model data inside the visualization, edit:
 *   public/methodology/atlas-unified.html → ATLAS_CONFIG object (top of <script>)
 */
export function FeedbackLoopViz({ height = 640, fullscreen = false, className }: FeedbackLoopVizProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const handleLoad = () => setLoaded(true);
    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, []);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: fullscreen ? 0 : '12px',
        overflow: 'hidden',
        border: fullscreen ? 'none' : '1px solid rgba(255,255,255,0.07)',
        background: '#03060C',
      }}
    >
      {/* Loading state — matches ATLAS void color so no flash */}
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#03060C',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'rgba(212,160,60,0.4)',
            letterSpacing: '0.12em',
          }}
        >
          LOADING SYSTEM DYNAMICS...
        </div>
      )}

      <iframe
        ref={iframeRef}
        src="/methodology/atlas-unified.html"
        title="ATLAS System Dynamics — Unified Feedback Architecture"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.4s ease',
          background: 'transparent',
        }}
        // Permissions: allow the iframe's canvas and animations to run at full speed
        allow="autoplay"
        // No sandbox — the visualization needs full JS execution and font loading
      />
    </div>
  );
}
