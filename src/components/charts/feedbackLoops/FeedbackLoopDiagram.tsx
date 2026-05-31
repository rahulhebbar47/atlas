/**
 * FeedbackLoopDiagram — Vertical river-flow feedback loop renderer
 *
 * Renders any FeedbackLoopDefinition as a vertical flow chart with animated
 * "river tributary" connections between variable nodes.
 *
 * Features:
 *   - Vertical top-to-bottom node layout (rounded rectangle cards)
 *   - Three-layer river channels: glow + body + animated particles
 *   - Cascading fill animation when parameters change
 *   - Feedback return path curving along the right side
 *   - Polarity indicators (+/-) on river connections
 *   - Delta badges showing change from baseline
 *   - Hover tooltips with equation details
 */

import { useMemo, useState } from 'react';
import type { FeedbackLoopDefinition, CascadeAnimationState } from './types';

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const NODE_W = 240;
const NODE_H = 58;
const NODE_RX = 10;
const GAP = 32; // vertical gap between nodes (river segment)
const MARGIN_TOP = 36;
const MARGIN_BOTTOM = 36;
const CENTER_X = 170;
const RETURN_PATH_OFFSET = 70; // how far right the feedback return curves
const SVG_WIDTH = CENTER_X + NODE_W / 2 + RETURN_PATH_OFFSET + 30;

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

function formatNodeValue(value: number, format: string): string {
  switch (format) {
    case 'percent':
      return `${(value * 100).toFixed(1)}%`;
    case 'multiplier':
      return `${value.toFixed(3)}x`;
    case 'currency':
      return `$${(value / 1e12).toFixed(2)}T`;
    case 'compact':
      if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
      if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(0)}B`;
      if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
      return `$${value.toFixed(0)}`;
    case 'number':
    default:
      if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
      return value.toFixed(1);
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface FeedbackLoopDiagramProps {
  loop: FeedbackLoopDefinition;
  nodeValues: Record<string, number>;
  deltas: Record<string, number>;
  cascade: CascadeAnimationState;
}

export function FeedbackLoopDiagram({
  loop,
  nodeValues,
  deltas,
  cascade,
}: FeedbackLoopDiagramProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<number | null>(null);

  const nodeCount = loop.nodes.length;
  const svgHeight = MARGIN_TOP + nodeCount * NODE_H + (nodeCount - 1) * GAP + MARGIN_BOTTOM;

  // Compute vertical node positions
  const nodePositions = useMemo(() => {
    return loop.nodes.map((node, i) => ({
      ...node,
      x: CENTER_X,
      y: MARGIN_TOP + i * (NODE_H + GAP) + NODE_H / 2,
      index: i,
    }));
  }, [loop.nodes]);

  // Overall intensity — drives animation speed and brightness
  const intensity = useMemo(() => {
    const vals = Object.values(deltas);
    if (vals.length === 0) return 0;
    const avgAbs = vals.reduce((sum, d) => sum + Math.abs(d), 0) / vals.length;
    return Math.min(1, avgAbs * 5);
  }, [deltas]);

  const isActive = intensity > 0.01;
  const animDuration = isActive ? Math.max(1.5, 6 - intensity * 4) : 6;
  const uid = loop.id;

  // River path between two consecutive nodes (vertical with slight curve)
  const riverPath = (fromY: number, toY: number) => {
    const startY = fromY + NODE_H / 2;
    const endY = toY - NODE_H / 2;
    const midY = (startY + endY) / 2;
    // Slight S-curve for organic feel
    return `M ${CENTER_X} ${startY} C ${CENTER_X} ${midY}, ${CENTER_X} ${midY}, ${CENTER_X} ${endY}`;
  };

  // Feedback return path (from bottom of last node, curving right, up, back to top of first)
  const feedbackReturnPath = useMemo(() => {
    if (nodePositions.length < 2) return '';
    const first = nodePositions[0]!;
    const last = nodePositions[nodePositions.length - 1]!;
    const rightEdge = CENTER_X + NODE_W / 2;
    const returnX = rightEdge + RETURN_PATH_OFFSET;
    const startY = last.y + NODE_H / 2;
    const endY = first.y - NODE_H / 2;
    const cornerR = 24;

    // Path: right edge of last node → curve right → up → curve left → right edge of first node
    return [
      `M ${rightEdge} ${startY}`,
      `C ${rightEdge + cornerR} ${startY}, ${returnX} ${startY - cornerR}, ${returnX} ${startY - cornerR * 2}`,
      `L ${returnX} ${endY + cornerR * 2}`,
      `C ${returnX} ${endY + cornerR}, ${rightEdge + cornerR} ${endY}, ${rightEdge} ${endY}`,
    ].join(' ');
  }, [nodePositions]);

  // Find the closing edge (last→first) for polarity display
  const closingEdge = loop.edges.find(
    (e) => e.from === loop.nodes[loop.nodes.length - 1]?.id && e.to === loop.nodes[0]?.id,
  );

  return (
    <div className="relative overflow-hidden">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
        className="w-full h-auto"
      >
        <defs>
          {/* Particle flow animation */}
          <style>{`
            @keyframes riverFlow-${uid} {
              to { stroke-dashoffset: -24; }
            }
            .river-particles-${uid} {
              animation: riverFlow-${uid} ${animDuration}s linear infinite;
            }
            @keyframes riverFlowUp-${uid} {
              to { stroke-dashoffset: 24; }
            }
            .river-particles-up-${uid} {
              animation: riverFlowUp-${uid} ${Math.max(2, animDuration * 1.2)}s linear infinite;
            }
          `}</style>

          {/* Glow filter for rivers */}
          <filter id={`river-glow-${uid}`} x="-100%" y="-20%" width="300%" height="140%">
            <feGaussianBlur stdDeviation={3} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Forward River Connections ── */}
        {loop.edges.map((edge, i) => {
          const fromNode = nodePositions.find((n) => n.id === edge.from);
          const toNode = nodePositions.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          // Skip the closing edge (rendered as return path)
          if (
            edge.from === loop.nodes[loop.nodes.length - 1]?.id &&
            edge.to === loop.nodes[0]?.id
          ) {
            return null;
          }

          const pathD = riverPath(fromNode.y, toNode.y);
          const edgeIsActive = cascade.isAnimating && cascade.activeNodeIndex >= fromNode.index;
          const isHovered = hoveredEdge === i;
          const midY = (fromNode.y + NODE_H / 2 + toNode.y - NODE_H / 2) / 2;

          return (
            <g
              key={`edge-${i}`}
              onMouseEnter={() => setHoveredEdge(i)}
              onMouseLeave={() => setHoveredEdge(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Layer 1: Glow */}
              <path
                d={pathD}
                fill="none"
                stroke={loop.color}
                strokeWidth={10}
                strokeOpacity={edgeIsActive ? 0.10 : isActive ? 0.05 : 0.03}
                strokeLinecap="round"
                filter={`url(#river-glow-${uid})`}
                style={{ transition: 'stroke-opacity 0.3s' }}
              />
              {/* Layer 2: Body */}
              <path
                d={pathD}
                fill="none"
                stroke={loop.color}
                strokeWidth={edgeIsActive ? 4.5 : isHovered ? 4 : 3}
                strokeOpacity={edgeIsActive ? 0.35 : isHovered ? 0.30 : isActive ? 0.18 : 0.12}
                strokeLinecap="round"
                style={{ transition: 'stroke-opacity 0.3s, stroke-width 0.3s' }}
              />
              {/* Layer 3: Particles */}
              <path
                d={pathD}
                fill="none"
                stroke={loop.color}
                strokeWidth={1.5}
                strokeOpacity={edgeIsActive ? 0.7 : isActive ? 0.4 : 0.15}
                strokeDasharray="6 18"
                strokeLinecap="round"
                className={`river-particles-${uid}`}
                style={{ transition: 'stroke-opacity 0.3s' }}
              />
              {/* Arrowhead */}
              <polygon
                points={`${CENTER_X} ${toNode.y - NODE_H / 2}, ${CENTER_X - 4} ${toNode.y - NODE_H / 2 - 6}, ${CENTER_X + 4} ${toNode.y - NODE_H / 2 - 6}`}
                fill={loop.color}
                opacity={edgeIsActive ? 0.6 : 0.25}
                style={{ transition: 'opacity 0.3s' }}
              />
              {/* Polarity pill */}
              <rect
                x={CENTER_X + 18}
                y={midY - 10}
                width={20}
                height={20}
                rx={5}
                fill={edge.polarity === '+' ? '#22C55E' : '#EF4444'}
                opacity={isHovered ? 0.25 : 0.10}
                style={{ transition: 'opacity 0.3s' }}
              />
              <text
                x={CENTER_X + 28}
                y={midY + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill={edge.polarity === '+' ? '#22C55E' : '#EF4444'}
                fontSize={13}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="bold"
                opacity={isHovered ? 1 : 0.6}
                style={{ transition: 'opacity 0.3s' }}
              >
                {edge.polarity}
              </text>
              {/* Hover tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={CENTER_X - NODE_W / 2}
                    y={midY + 14}
                    width={NODE_W}
                    height={24}
                    rx={5}
                    fill="#080D18"
                    stroke={loop.color}
                    strokeWidth={0.5}
                    strokeOpacity={0.4}
                  />
                  <text
                    x={CENTER_X}
                    y={midY + 28}
                    textAnchor="middle"
                    fill="#8A96AD"
                    fontSize={9}
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    {edge.equation.length > 45 ? edge.equation.slice(0, 45) + '\u2026' : edge.equation}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ── Feedback Return Path (last → first, closes the loop) ── */}
        {feedbackReturnPath && (
          <g>
            {/* Glow */}
            <path
              d={feedbackReturnPath}
              fill="none"
              stroke={loop.color}
              strokeWidth={8}
              strokeOpacity={isActive ? 0.08 : 0.04}
              strokeLinecap="round"
              filter={`url(#river-glow-${uid})`}
            />
            {/* Body — solid, not dashed, to match forward edges */}
            <path
              d={feedbackReturnPath}
              fill="none"
              stroke={loop.color}
              strokeWidth={isActive ? 3 : 2.5}
              strokeOpacity={isActive ? 0.25 : 0.15}
              strokeLinecap="round"
              style={{ transition: 'stroke-opacity 0.3s, stroke-width 0.3s' }}
            />
            {/* Particles (flowing upward) */}
            <path
              d={feedbackReturnPath}
              fill="none"
              stroke={loop.color}
              strokeWidth={1.5}
              strokeOpacity={isActive ? 0.5 : 0.20}
              strokeDasharray="5 19"
              strokeLinecap="round"
              className={`river-particles-up-${uid}`}
              style={{ transition: 'stroke-opacity 0.3s' }}
            />
            {/* Arrowhead pointing into the first node (top) */}
            {(() => {
              const rightEdge = CENTER_X + NODE_W / 2;
              const endY = nodePositions[0]!.y - NODE_H / 2;
              return (
                <polygon
                  points={`${rightEdge} ${endY}, ${rightEdge + 5} ${endY - 7}, ${rightEdge + 5} ${endY + 7}`}
                  fill={loop.color}
                  opacity={isActive ? 0.6 : 0.35}
                  style={{ transition: 'opacity 0.3s' }}
                />
              );
            })()}
            {/* Return polarity pill */}
            {closingEdge && (() => {
              const first = nodePositions[0]!;
              const last = nodePositions[nodePositions.length - 1]!;
              const returnX = CENTER_X + NODE_W / 2 + RETURN_PATH_OFFSET;
              const midReturnY = (first.y + last.y) / 2;
              return (
                <g>
                  <rect
                    x={returnX - 10}
                    y={midReturnY - 10}
                    width={20}
                    height={20}
                    rx={5}
                    fill={closingEdge.polarity === '+' ? '#22C55E' : '#EF4444'}
                    opacity={0.12}
                  />
                  <text
                    x={returnX}
                    y={midReturnY + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={closingEdge.polarity === '+' ? '#22C55E' : '#EF4444'}
                    fontSize={13}
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight="bold"
                    opacity={0.7}
                  >
                    {closingEdge.polarity}
                  </text>
                </g>
              );
            })()}
            {/* Closing edge label */}
            {closingEdge && (
              <text
                x={CENTER_X + NODE_W / 2 + RETURN_PATH_OFFSET + 14}
                y={(nodePositions[0]!.y + nodePositions[nodePositions.length - 1]!.y) / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={loop.color}
                fontSize={9}
                fontFamily="'JetBrains Mono', monospace"
                letterSpacing="0.10em"
                opacity={0.4}
                transform={`rotate(90, ${CENTER_X + NODE_W / 2 + RETURN_PATH_OFFSET + 14}, ${(nodePositions[0]!.y + nodePositions[nodePositions.length - 1]!.y) / 2})`}
              >
                {closingEdge.label.toUpperCase()}
              </text>
            )}
          </g>
        )}

        {/* ── Node Cards ── */}
        {nodePositions.map((node, i) => {
          const value = nodeValues[node.id] ?? 0;
          const delta = deltas[node.id] ?? 0;
          const isCascadeReached = cascade.isAnimating && cascade.activeNodeIndex >= i;
          const isHovered = hoveredNode === node.id;
          const nodeLeft = node.x - NODE_W / 2;
          const nodeTop = node.y - NODE_H / 2;

          const deltaColor = delta > 0.001 ? '#22C55E' : delta < -0.001 ? '#EF4444' : '#4E5D75';
          const deltaArrow = delta > 0.001 ? '\u25B2' : delta < -0.001 ? '\u25BC' : '';

          // Single-line label (replace \n with space)
          const label = node.label.replace('\n', ' ');

          return (
            <g
              key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Cascade fill background (fills with color when reached) */}
              <rect
                x={nodeLeft}
                y={nodeTop}
                width={NODE_W}
                height={NODE_H}
                rx={NODE_RX}
                fill={loop.color}
                fillOpacity={
                  isCascadeReached ? 0.12
                    : isActive ? 0.03
                      : 0
                }
                style={{ transition: 'fill-opacity 0.3s ease-out' }}
              />

              {/* Node border */}
              <rect
                x={nodeLeft}
                y={nodeTop}
                width={NODE_W}
                height={NODE_H}
                rx={NODE_RX}
                fill="#0C1424"
                fillOpacity={0.85}
                stroke={
                  isCascadeReached ? loop.color
                    : isHovered ? loop.color
                      : '#4E5D75'
                }
                strokeWidth={isCascadeReached ? 1.5 : isHovered ? 1.5 : 0.8}
                strokeOpacity={
                  isCascadeReached ? 0.7
                    : isHovered ? 0.5
                      : 0.2
                }
                style={{ transition: 'stroke 0.3s, stroke-opacity 0.3s, stroke-width 0.3s' }}
              />

              {/* Shared node diamond indicator */}
              {node.shared && (
                <rect
                  x={nodeLeft + NODE_W - 14}
                  y={nodeTop + 5}
                  width={7}
                  height={7}
                  rx={1}
                  fill="#D4A03C"
                  opacity={0.6}
                  transform={`rotate(45, ${nodeLeft + NODE_W - 10.5}, ${nodeTop + 8.5})`}
                />
              )}

              {/* Lagged node t+1 badge */}
              {node.lagged && (
                <g>
                  <rect
                    x={nodeLeft + 4}
                    y={nodeTop + 4}
                    width={24}
                    height={14}
                    rx={3}
                    fill="#6366F1"
                    opacity={0.20}
                  />
                  <text
                    x={nodeLeft + 16}
                    y={nodeTop + 12}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#818CF8"
                    fontSize={8}
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight="bold"
                    letterSpacing="0.04em"
                  >
                    t+1
                  </text>
                </g>
              )}

              {/* Label */}
              <text
                x={node.x}
                y={node.y - 8}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#8A96AD"
                fontSize={12}
                fontFamily="'JetBrains Mono', monospace"
                style={{ transition: 'fill 0.3s' }}
              >
                {label}
              </text>

              {/* Value */}
              <text
                x={node.x}
                y={node.y + 12}
                textAnchor="middle"
                dominantBaseline="central"
                fill={loop.color}
                fontSize={13}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="bold"
                opacity={isActive ? 0.9 : 0.65}
                style={{ transition: 'all 0.3s ease-out' }}
              >
                {formatNodeValue(value, node.format)}
              </text>

              {/* Delta badge */}
              {Math.abs(delta) > 0.001 && (
                <g>
                  <rect
                    x={nodeLeft + NODE_W + 6}
                    y={node.y - 10}
                    width={42}
                    height={20}
                    rx={5}
                    fill={deltaColor}
                    opacity={0.12}
                  />
                  <text
                    x={nodeLeft + NODE_W + 27}
                    y={node.y + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={deltaColor}
                    fontSize={10}
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight="bold"
                    opacity={0.85}
                  >
                    {deltaArrow}{(Math.abs(delta) * 100).toFixed(0)}%
                  </text>
                </g>
              )}

              {/* Hover: equation ref tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={nodeLeft}
                    y={nodeTop + NODE_H + 4}
                    width={NODE_W}
                    height={24}
                    rx={5}
                    fill="#080D18"
                    stroke={loop.color}
                    strokeWidth={0.5}
                    strokeOpacity={0.3}
                  />
                  <text
                    x={node.x}
                    y={nodeTop + NODE_H + 18}
                    textAnchor="middle"
                    fill="#6B7A90"
                    fontSize={9}
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    [{node.equationRef}] {node.codeRef}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Loop name (top-left badge) */}
        <text
          x={CENTER_X - NODE_W / 2}
          y={14}
          fill={loop.color}
          fontSize={11}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="bold"
          letterSpacing="0.08em"
          opacity={0.7}
        >
          {loop.shortName.toUpperCase()}
        </text>

        {/* Intensity indicator */}
        {isActive && (
          <text
            x={CENTER_X + NODE_W / 2}
            y={14}
            textAnchor="end"
            fill="#8A96AD"
            fontSize={10}
            fontFamily="'JetBrains Mono', monospace"
            opacity={0.5}
          >
            {Math.round(intensity * 100)}% active
          </text>
        )}
        {!isActive && (
          <text
            x={CENTER_X + NODE_W / 2}
            y={14}
            textAnchor="end"
            fill="#4E5D75"
            fontSize={10}
            fontFamily="'JetBrains Mono', monospace"
          >
            BASELINE
          </text>
        )}
      </svg>
    </div>
  );
}
