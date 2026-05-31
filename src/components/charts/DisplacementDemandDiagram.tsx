/**
 * ATLAS Displacement-Demand Feedback Visualization
 *
 * Animated circular flow diagram showing the self-reinforcing feedback loop:
 *   Displacement → Wage Loss → Demand Fall → Revenue Pressure → More Automation
 *
 * The loop accelerates as the economy approaches and passes the tipping point.
 * Pre-tipping: gold/amber glow. Post-tipping: red pulsing.
 *
 * Data sources:
 *   - macro.totalDirectDisplacement (from aggregate)
 *   - macro.cwiGrowthRate (consumer welfare decline)
 *   - macro.revenuePressure (corporate revenue decline → automation incentive)
 *   - macro.automationAcceleration (feedback-driven adoption speedup)
 *   - macro.cyclePhase (vicious cycle phase classification)
 *
 * Uses custom SVG with CSS animations — no external dependencies.
 */

import { useMemo } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { formatPercent, formatNumber } from '@/utils/format';

/** The 5 stages of the displacement-demand feedback cycle */
const LOOP_STAGES = [
  {
    id: 'displacement',
    label: 'Job\nDisplacement',
    icon: 'M12 4.5v15m7.5-7.5h-15', // minus icon (jobs lost)
  },
  {
    id: 'wageLoss',
    label: 'Wage\nDecline',
    icon: 'M2 12l10 8 10-8M2 7l10 8 10-8', // down arrows
  },
  {
    id: 'demandFall',
    label: 'Demand\nCollapse',
    icon: 'M3 17l6-6 4 4 8-8', // trending down
  },
  {
    id: 'revenuePressure',
    label: 'Revenue\nPressure',
    icon: 'M12 2v10m0 0l3-3m-3 3l-3-3M3 19h18', // download/pressure
  },
  {
    id: 'automation',
    label: 'Accelerated\nAutomation',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', // computer
  },
] as const;

const CENTER_X = 180;
const CENTER_Y = 170;
const RADIUS = 120;
const NODE_RADIUS = 28;
const SVG_WIDTH = 360;
const SVG_HEIGHT = 360;

export function DisplacementDemandDiagram() {
  const years = useSimulationStore((s) => s.timeline.years);
  const currentYear = useSimulationStore((s) => s.currentYear);

  const loopData = useMemo(() => {
    const currentYearData = years.find((y) => y.year === currentYear) ?? years[years.length - 1];
    if (!currentYearData) {
      return {
        active: false,
        intensity: 0,
        isInDecline: false,
        displacement: 0,
        cwiGrowthRate: 0,
        revenuePressure: 0,
        automationAcceleration: 0,
        unemploymentRate: 0,
      };
    }

    const m = currentYearData.macro;
    const totalDisplacement = currentYearData.clusters.reduce(
      (sum, c) => sum + c.totalDirectDisplacement, 0,
    );

    // Loop intensity: 0 (no loop) to 1 (full feedback cycle)
    // Based on revenue pressure and CWI decline
    const pressureSignal = Math.min(1, m.revenuePressure * 5);
    const declineSignal = m.cwiGrowthRate < 0 ? Math.min(1, Math.abs(m.cwiGrowthRate) * 20) : 0;
    const intensity = Math.max(pressureSignal, declineSignal);

    // In decline if cycle phase indicates any decline
    const isInDecline = m.cyclePhase === 'ACCELERATING_DECLINE' ||
      m.cyclePhase === 'LINEAR_DECLINE' ||
      m.cyclePhase === 'DECELERATING_DECLINE';

    return {
      active: intensity > 0.01,
      intensity,
      isInDecline,
      displacement: totalDisplacement,
      cwiGrowthRate: m.cwiGrowthRate,
      revenuePressure: m.revenuePressure,
      automationAcceleration: m.automationAcceleration,
      unemploymentRate: m.unemploymentRate,
    };
  }, [years, currentYear]);

  // Node positions: evenly spaced around the circle, starting from top
  const nodes = useMemo(() => {
    return LOOP_STAGES.map((stage, i) => {
      const angle = (i / LOOP_STAGES.length) * Math.PI * 2 - Math.PI / 2;
      return {
        ...stage,
        x: CENTER_X + RADIUS * Math.cos(angle),
        y: CENTER_Y + RADIUS * Math.sin(angle),
        angle,
      };
    });
  }, []);

  // Determine colors based on loop state
  const loopColor = loopData.isInDecline ? '#EF4444' : '#D4A03C';
  const bgGlow = loopData.isInDecline
    ? `rgba(239, 68, 68, ${0.03 + loopData.intensity * 0.07})`
    : `rgba(212, 160, 60, ${0.02 + loopData.intensity * 0.04})`;

  // Animation speed: faster as intensity increases
  const animDuration = loopData.active ? Math.max(2, 8 - loopData.intensity * 6) : 0;

  return (
    <div
      className="bg-bg-card border border-border rounded-[16px] p-4 transition-colors duration-500"
      style={{ backgroundColor: bgGlow }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
          Feedback Loop
        </h3>
        {loopData.isInDecline && (
          <span className="font-mono text-[10px] text-critical animate-pulse">
            DECLINE PHASE
          </span>
        )}
        {!loopData.isInDecline && loopData.active && (
          <span className="font-mono text-[10px] text-gold">
            LOOP ACTIVE
          </span>
        )}
      </div>

      <div className="flex items-start gap-4">
        {/* SVG Diagram */}
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="flex-shrink-0"
          style={{ width: '260px', height: '260px' }}
        >
          <defs>
            {/* Animated dash for flow arrows */}
            {loopData.active && (
              <style>{`
                @keyframes flowDash {
                  to { stroke-dashoffset: -30; }
                }
                .dd-flow {
                  animation: flowDash ${animDuration}s linear infinite;
                }
              `}</style>
            )}
            {/* Glow filter */}
            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={loopData.intensity * 3} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connecting arcs between nodes */}
          {nodes.map((node, i) => {
            const next = nodes[(i + 1) % nodes.length]!;
            // Compute a curved path between nodes (arc along the circle)
            const midAngle = (node.angle + next.angle) / 2 +
              (next.angle < node.angle ? Math.PI : 0);
            const controlR = RADIUS * 0.6;
            const cx = CENTER_X + controlR * Math.cos(midAngle);
            const cy = CENTER_Y + controlR * Math.sin(midAngle);

            // Start/end points offset from node centers (at edge of node circle)
            const dx1 = next.x - node.x;
            const dy1 = next.y - node.y;
            const dist = Math.sqrt(dx1 * dx1 + dy1 * dy1);
            const startX = node.x + (dx1 / dist) * NODE_RADIUS;
            const startY = node.y + (dy1 / dist) * NODE_RADIUS;
            const endX = next.x - (dx1 / dist) * NODE_RADIUS;
            const endY = next.y - (dy1 / dist) * NODE_RADIUS;

            const opacity = loopData.active ? 0.2 + loopData.intensity * 0.5 : 0.12;

            return (
              <g key={`arc-${i}`}>
                {/* Background arc */}
                <path
                  d={`M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`}
                  fill="none"
                  stroke={loopColor}
                  strokeWidth={1.5 + loopData.intensity * 2}
                  strokeOpacity={opacity}
                  strokeLinecap="round"
                />
                {/* Animated flow dash */}
                {loopData.active && (
                  <path
                    d={`M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`}
                    fill="none"
                    stroke={loopColor}
                    strokeWidth={1 + loopData.intensity * 1.5}
                    strokeOpacity={0.4 + loopData.intensity * 0.4}
                    strokeDasharray="4 26"
                    strokeLinecap="round"
                    className="dd-flow"
                  />
                )}
                {/* Arrowhead */}
                <circle
                  cx={endX}
                  cy={endY}
                  r={2.5}
                  fill={loopColor}
                  opacity={opacity + 0.2}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const opacity = loopData.active ? 0.7 + loopData.intensity * 0.3 : 0.5;
            return (
              <g key={node.id} filter={loopData.intensity > 0.3 ? 'url(#nodeGlow)' : undefined}>
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill="#0C1424"
                  stroke={loopColor}
                  strokeWidth={1.5}
                  strokeOpacity={opacity}
                />
                {/* Label (multi-line) */}
                {node.label.split('\n').map((line, li) => (
                  <text
                    key={li}
                    x={node.x}
                    y={node.y + (li - 0.5) * 11}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#8A96AD"
                    fontSize={8.5}
                    fontFamily="'JetBrains Mono', monospace"
                    opacity={opacity}
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}

          {/* Center intensity indicator */}
          {loopData.active && (
            <g>
              <circle
                cx={CENTER_X}
                cy={CENTER_Y}
                r={20 + loopData.intensity * 15}
                fill="none"
                stroke={loopColor}
                strokeWidth={0.5}
                strokeOpacity={0.15 + loopData.intensity * 0.15}
              />
              <text
                x={CENTER_X}
                y={CENTER_Y - 5}
                textAnchor="middle"
                dominantBaseline="central"
                fill={loopColor}
                fontSize={16}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="bold"
                opacity={0.8}
              >
                {Math.round(loopData.intensity * 100)}%
              </text>
              <text
                x={CENTER_X}
                y={CENTER_Y + 10}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#4E5D75"
                fontSize={7}
                fontFamily="'JetBrains Mono', monospace"
                letterSpacing="0.1em"
              >
                INTENSITY
              </text>
            </g>
          )}
          {!loopData.active && (
            <text
              x={CENTER_X}
              y={CENTER_Y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#4E5D75"
              fontSize={8}
              fontFamily="'JetBrains Mono', monospace"
            >
              INACTIVE
            </text>
          )}
        </svg>

        {/* Metric cards */}
        <div className="flex-1 space-y-2 min-w-0 pt-2">
          <LoopMetric
            label="Displaced Workers"
            value={formatNumber(loopData.displacement, { compact: true })}
            active={loopData.displacement > 0}
            color={loopColor}
          />
          <LoopMetric
            label="CWI Change"
            value={loopData.cwiGrowthRate !== 0
              ? `${loopData.cwiGrowthRate > 0 ? '+' : ''}${formatPercent(loopData.cwiGrowthRate, 2)}`
              : '\u2014'}
            active={loopData.cwiGrowthRate < -0.001}
            color={loopColor}
          />
          <LoopMetric
            label="Revenue Pressure"
            value={formatPercent(loopData.revenuePressure, 1)}
            active={loopData.revenuePressure > 0.01}
            color={loopColor}
          />
          <LoopMetric
            label="Automation Accel."
            value={`${loopData.automationAcceleration.toFixed(3)}x`}
            active={loopData.automationAcceleration > 1.001}
            color={loopColor}
          />
          <LoopMetric
            label="Unemployment"
            value={formatPercent(loopData.unemploymentRate, 1)}
            active={loopData.unemploymentRate > 0.06}
            color={loopColor}
          />
        </div>
      </div>
    </div>
  );
}

function LoopMetric({
  label,
  value,
  active,
  color,
}: {
  label: string;
  value: string;
  active: boolean;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/30">
      <span className="text-text-muted text-[10px] font-mono">{label}</span>
      <span
        className="font-mono text-[11px] transition-colors duration-300"
        style={{ color: active ? color : '#4E5D75' }}
      >
        {value}
      </span>
    </div>
  );
}
