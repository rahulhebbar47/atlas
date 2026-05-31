// DEPRECATED: Replaced by FeedbackLoopViz (atlas-unified.html iframe visualization).
// The new visualization uses Canvas + DOM with animated river-style edges, cascade animations,
// and interactive loop isolation. See FeedbackLoopViz.tsx for the iframe wrapper.
/**
 * SystemInterconnectionDiagram — River tributary network of all 6 feedback loops
 *
 * Shows shared nodes (GDP, Unemployment, Consumption, Wages, Inflation, Investment)
 * as larger anchor nodes in a diamond layout. Each loop's connections are rendered
 * as colored river tributaries flowing between shared nodes.
 *
 * Interactions:
 *   - Hover on shared node → highlights ALL loops that pass through it
 *   - Hover on loop label → highlights just that loop's rivers
 *   - Click on loop label → scrolls to that loop's interactive card
 */

import { useMemo, useState, useCallback } from 'react';
import { ALL_LOOPS, SHARED_NODES, NODE_TO_SHARED } from './loopDefinitions';

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const SVG_WIDTH = 700;
const SVG_HEIGHT = 380;
const SHARED_NODE_W = 112;
const SHARED_NODE_H = 40;
const SHARED_NODE_RX = 10;

// Hand-tuned positions for diamond layout
const SHARED_NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  shared_gdp: { x: 350, y: 190 },
  shared_unemployment: { x: 160, y: 270 },
  shared_consumption: { x: 540, y: 270 },
  shared_wages: { x: 160, y: 110 },
  shared_inflation: { x: 350, y: 50 },
  shared_investment: { x: 540, y: 110 },
};

// Loop label positions around the perimeter
const LOOP_LABEL_POSITIONS = [
  { x: 60, y: 50 },   // Displacement-Demand Feedback
  { x: 60, y: 190 },  // Phillips Curve
  { x: 60, y: 330 },  // Demand Spillover
  { x: 640, y: 50 },  // Credit Crunch
  { x: 640, y: 190 }, // Fiscal-Monetary
  { x: 640, y: 330 }, // Housing Wealth
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RiverConnection {
  fromId: string;
  toId: string;
  loopId: string;
  loopColor: string;
  offset: number; // perpendicular offset to avoid overlapping parallel rivers
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SystemInterconnectionDiagramProps {
  onLoopClick?: (loopId: string) => void;
}

export function SystemInterconnectionDiagram({ onLoopClick }: SystemInterconnectionDiagramProps) {
  const [hoveredSharedNode, setHoveredSharedNode] = useState<string | null>(null);
  const [hoveredLoop, setHoveredLoop] = useState<string | null>(null);

  // Build river connections between shared nodes for each loop
  const rivers = useMemo(() => {
    const conns: RiverConnection[] = [];
    // Track how many rivers exist between each pair for offset calculation
    const pairCounts = new Map<string, number>();

    for (const loop of ALL_LOOPS) {
      // Extract shared node sequence for this loop
      const sharedSequence: string[] = [];
      for (const node of loop.nodes) {
        const sharedId = NODE_TO_SHARED[node.id];
        if (sharedId && !sharedSequence.includes(sharedId)) {
          sharedSequence.push(sharedId);
        }
      }

      // Create connections between consecutive shared nodes
      for (let i = 0; i < sharedSequence.length; i++) {
        const from = sharedSequence[i]!;
        const to = sharedSequence[(i + 1) % sharedSequence.length]!;
        if (from === to) continue;

        // Create a canonical pair key for offset tracking
        const pairKey = [from, to].sort().join('|');
        const count = pairCounts.get(pairKey) ?? 0;
        pairCounts.set(pairKey, count + 1);

        conns.push({
          fromId: from,
          toId: to,
          loopId: loop.id,
          loopColor: loop.color,
          offset: (count - 1) * 6, // Will re-center after counting
        });
      }
    }

    // Re-center offsets so they're balanced around 0
    const pairOffsets = new Map<string, number>();
    return conns.map((conn) => {
      const pairKey = [conn.fromId, conn.toId].sort().join('|');
      const total = pairCounts.get(pairKey) ?? 1;
      const currentIndex = pairOffsets.get(pairKey) ?? 0;
      pairOffsets.set(pairKey, currentIndex + 1);
      return {
        ...conn,
        offset: (currentIndex - (total - 1) / 2) * 6,
      };
    });
  }, []);

  // Get position for a shared node
  const getPos = useCallback((nodeId: string) => {
    return SHARED_NODE_POSITIONS[nodeId] ?? { x: 0, y: 0 };
  }, []);

  // Compute river path between two shared nodes with perpendicular offset
  const computeRiverPath = useCallback(
    (fromId: string, toId: string, offset: number) => {
      const from = getPos(fromId);
      const to = getPos(toId);

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) return '';

      // Perpendicular normal for offset
      const nx = (-dy / len) * offset;
      const ny = (dx / len) * offset;

      // Start/end points offset from node centers (at edge of node rect, approximated)
      const startX = from.x + (dx / len) * (SHARED_NODE_W / 2 + 4) + nx;
      const startY = from.y + (dy / len) * (SHARED_NODE_H / 2 + 4) + ny;
      const endX = to.x - (dx / len) * (SHARED_NODE_W / 2 + 4) + nx;
      const endY = to.y - (dy / len) * (SHARED_NODE_H / 2 + 4) + ny;

      // Control point for gentle curve (offset toward center of diagram)
      const midX = (startX + endX) / 2 + nx * 2;
      const midY = (startY + endY) / 2 + ny * 2;

      return `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
    },
    [getPos],
  );

  // Determine highlighting
  const isRiverHighlighted = useCallback(
    (conn: RiverConnection) => {
      if (hoveredLoop) return conn.loopId === hoveredLoop;
      if (hoveredSharedNode) {
        return conn.fromId === hoveredSharedNode || conn.toId === hoveredSharedNode;
      }
      return false;
    },
    [hoveredLoop, hoveredSharedNode],
  );

  const isNodeHighlighted = useCallback(
    (nodeId: string) => {
      if (hoveredSharedNode) return nodeId === hoveredSharedNode;
      if (hoveredLoop) {
        const loop = ALL_LOOPS.find((l) => l.id === hoveredLoop);
        if (!loop) return false;
        return loop.nodes.some((n) => NODE_TO_SHARED[n.id] === nodeId);
      }
      return false;
    },
    [hoveredSharedNode, hoveredLoop],
  );

  const anyHover = hoveredLoop !== null || hoveredSharedNode !== null;

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full h-auto"
      >
        <defs>
          {/* Particle animation for rivers */}
          <style>{`
            @keyframes systemRiverFlow {
              to { stroke-dashoffset: -20; }
            }
            .system-river-particles {
              animation: systemRiverFlow 4s linear infinite;
            }
          `}</style>

          {/* Glow filter */}
          <filter id="shared-river-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={4} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── River Connections ── */}
        {rivers.map((conn, i) => {
          const pathD = computeRiverPath(conn.fromId, conn.toId, conn.offset);
          if (!pathD) return null;
          const highlighted = isRiverHighlighted(conn);
          const dimmed = anyHover && !highlighted;

          return (
            <g key={`river-${i}`}>
              {/* Glow layer */}
              <path
                d={pathD}
                fill="none"
                stroke={conn.loopColor}
                strokeWidth={highlighted ? 8 : 6}
                strokeOpacity={highlighted ? 0.10 : dimmed ? 0.01 : 0.03}
                strokeLinecap="round"
                filter="url(#shared-river-glow)"
                style={{ transition: 'stroke-opacity 0.4s, stroke-width 0.3s' }}
              />
              {/* Body layer */}
              <path
                d={pathD}
                fill="none"
                stroke={conn.loopColor}
                strokeWidth={highlighted ? 3 : 2}
                strokeOpacity={highlighted ? 0.40 : dimmed ? 0.05 : 0.12}
                strokeLinecap="round"
                style={{ transition: 'stroke-opacity 0.4s, stroke-width 0.3s' }}
              />
              {/* Particle layer */}
              <path
                d={pathD}
                fill="none"
                stroke={conn.loopColor}
                strokeWidth={1}
                strokeOpacity={highlighted ? 0.65 : dimmed ? 0.03 : 0.15}
                strokeDasharray="4 16"
                strokeLinecap="round"
                className="system-river-particles"
                style={{ transition: 'stroke-opacity 0.4s' }}
              />
            </g>
          );
        })}

        {/* ── Shared Nodes ── */}
        {SHARED_NODES.map((node) => {
          const pos = SHARED_NODE_POSITIONS[node.id];
          if (!pos) return null;
          const highlighted = isNodeHighlighted(node.id);
          const dimmed = anyHover && !highlighted;
          const loopCount = node.loopIds.length;

          return (
            <g
              key={node.id}
              onMouseEnter={() => setHoveredSharedNode(node.id)}
              onMouseLeave={() => setHoveredSharedNode(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Node rectangle */}
              <rect
                x={pos.x - SHARED_NODE_W / 2}
                y={pos.y - SHARED_NODE_H / 2}
                width={SHARED_NODE_W}
                height={SHARED_NODE_H}
                rx={SHARED_NODE_RX}
                fill="#0C1424"
                stroke={highlighted ? '#D4A03C' : '#4E5D75'}
                strokeWidth={highlighted ? 2 : 1}
                strokeOpacity={highlighted ? 0.8 : dimmed ? 0.15 : 0.25}
                style={{ transition: 'stroke 0.3s, stroke-opacity 0.3s, stroke-width 0.3s' }}
              />
              {/* Tint fill on hover */}
              {highlighted && (
                <rect
                  x={pos.x - SHARED_NODE_W / 2}
                  y={pos.y - SHARED_NODE_H / 2}
                  width={SHARED_NODE_W}
                  height={SHARED_NODE_H}
                  rx={SHARED_NODE_RX}
                  fill="#D4A03C"
                  fillOpacity={0.06}
                />
              )}

              {/* Label */}
              <text
                x={pos.x}
                y={pos.y - 4}
                textAnchor="middle"
                dominantBaseline="central"
                fill={highlighted ? '#D4A03C' : dimmed ? '#4E5D75' : '#8A96AD'}
                fontSize={11}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight={highlighted ? 'bold' : 'normal'}
                style={{ transition: 'fill 0.3s' }}
              >
                {node.label}
              </text>
              {/* Loop count */}
              <text
                x={pos.x}
                y={pos.y + 12}
                textAnchor="middle"
                dominantBaseline="central"
                fill={dimmed ? '#2A3549' : '#4E5D75'}
                fontSize={8}
                fontFamily="'JetBrains Mono', monospace"
                style={{ transition: 'fill 0.3s' }}
              >
                {loopCount} {loopCount === 1 ? 'loop' : 'loops'}
              </text>

              {/* Tributary dots (which loops pass through) */}
              {highlighted && (
                <g>
                  {node.loopIds.map((loopId, li) => {
                    const loop = ALL_LOOPS.find((l) => l.id === loopId);
                    if (!loop) return null;
                    const dotX = pos.x - ((node.loopIds.length - 1) * 8) / 2 + li * 8;
                    return (
                      <circle
                        key={loopId}
                        cx={dotX}
                        cy={pos.y + SHARED_NODE_H / 2 + 8}
                        r={3}
                        fill={loop.color}
                        opacity={0.8}
                      />
                    );
                  })}
                </g>
              )}
            </g>
          );
        })}

        {/* ── Loop Labels ── */}
        {ALL_LOOPS.map((loop, i) => {
          const pos = LOOP_LABEL_POSITIONS[i];
          if (!pos) return null;
          const isHovered = hoveredLoop === loop.id;
          const labelWidth = loop.shortName.length * 7 + 20;

          return (
            <g
              key={loop.id}
              onMouseEnter={() => setHoveredLoop(loop.id)}
              onMouseLeave={() => setHoveredLoop(null)}
              onClick={() => onLoopClick?.(loop.id)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={pos.x - labelWidth / 2}
                y={pos.y - 12}
                width={labelWidth}
                height={24}
                rx={6}
                fill={isHovered ? loop.color : '#0C1424'}
                fillOpacity={isHovered ? 0.15 : 0.9}
                stroke={loop.color}
                strokeWidth={isHovered ? 1.5 : 0.8}
                strokeOpacity={isHovered ? 0.8 : 0.3}
                style={{ transition: 'all 0.3s' }}
              />
              <text
                x={pos.x}
                y={pos.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isHovered ? loop.color : '#8A96AD'}
                fontSize={9}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight={isHovered ? 'bold' : 'normal'}
                style={{ transition: 'fill 0.3s' }}
              >
                {loop.shortName}
              </text>
            </g>
          );
        })}

        {/* Center title */}
        <text
          x={SVG_WIDTH / 2}
          y={SVG_HEIGHT / 2 + 40}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#4E5D75"
          fontSize={8}
          fontFamily="'JetBrains Mono', monospace"
          letterSpacing="0.15em"
          opacity={anyHover ? 0.2 : 0.5}
          style={{ transition: 'opacity 0.3s' }}
        >
          LOOP INTERCONNECTIONS
        </text>
      </svg>
    </div>
  );
}
