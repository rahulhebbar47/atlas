/**
 * ATLAS Multiplier Flow Diagram
 *
 * Sankey-style flow diagram showing cascading displacement effects.
 * When a cluster is displaced, second-order effects hit adjacent
 * service clusters via ADJACENCY_WEIGHTS (DATA_MODEL.md §9.2).
 *
 * FS-5b NOTE: ADJACENCY_WEIGHTS is REGISTERED-INACTIVE structure — it is NOT on the
 * simulation path (FS-5, liveness-proven). The flows this diagram draws are an
 * ILLUSTRATION computed from the inactive matrix (direct displacement × weight); they are
 * not simulation output and are not subtracted from any cluster's employment. The
 * user-visible labeling decision (mark illustrative / remove / hold for the registered
 * enrichment) is logged with the owner at FS-5b.
 *
 * Layout:
 *   Left column: Source clusters (those with displacement)
 *   Right column: Target clusters (receiving cascading effects)
 *   Flows: width proportional to displaced workers × adjacency weight
 *
 * Uses custom SVG — no external Sankey library dependency.
 */

import { useMemo } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { ADJACENCY_WEIGHTS } from '@/models/multipliers';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { getCategoryColor, withOpacity } from '@/utils/colors';
import { formatNumber } from '@/utils/format';

interface FlowNode {
  id: string;
  label: string;
  category: string;
  color: string;
  value: number; // displaced workers (source) or received cascade (target)
}

interface FlowLink {
  sourceId: string;
  targetId: string;
  value: number; // cascading displacement in workers
  weight: number; // adjacency weight
}

interface LayoutNode extends FlowNode {
  x: number;
  y: number;
  height: number;
}

interface LayoutLink extends FlowLink {
  sourceY: number;
  targetY: number;
  thickness: number;
}

const DIAGRAM_WIDTH = 720;
const DIAGRAM_HEIGHT = 400;
const NODE_WIDTH = 16;
const NODE_GAP = 8;
const MARGIN = { top: 24, right: 140, bottom: 24, left: 140 };
const MIN_FLOW_THICKNESS = 1.5;
const MAX_FLOW_THICKNESS = 32;

/** Cluster name lookup */
const CLUSTER_NAMES: Record<string, string> = {};
for (const c of OCCUPATION_CLUSTERS) {
  CLUSTER_NAMES[c.id] = c.name;
}

/** Cluster category lookup */
const CLUSTER_CATEGORIES: Record<string, string> = {};
for (const c of OCCUPATION_CLUSTERS) {
  CLUSTER_CATEGORIES[c.id] = c.category;
}

export function MultiplierFlowDiagram({ clusterId }: { clusterId: string }) {
  const years = useSimulationStore((s) => s.timeline.years);
  const currentYear = useSimulationStore((s) => s.currentYear);

  const { sourceNodes, targetNodes, links, maxSourceValue, maxTargetValue } = useMemo(() => {
    const currentYearData = years.find((y) => y.year === currentYear) ?? years[years.length - 1];
    if (!currentYearData) {
      return { sourceNodes: [], targetNodes: [], links: [], maxSourceValue: 0, maxTargetValue: 0 };
    }

    // Get the selected cluster's displacement
    const selectedCluster = currentYearData.clusters.find((c) => c.clusterId === clusterId);
    if (!selectedCluster || selectedCluster.totalDirectDisplacement < 1) {
      return { sourceNodes: [], targetNodes: [], links: [], maxSourceValue: 0, maxTargetValue: 0 };
    }

    // Build flow data from the selected cluster as source
    const adjacencyMap = ADJACENCY_WEIGHTS[clusterId];
    if (!adjacencyMap || Object.keys(adjacencyMap).length === 0) {
      return { sourceNodes: [], targetNodes: [], links: [], maxSourceValue: 0, maxTargetValue: 0 };
    }

    const directDisplacement = selectedCluster.totalDirectDisplacement;

    // Also check if any OTHER clusters are cascading INTO the selected cluster
    const incomingLinks: FlowLink[] = [];
    const outgoingLinks: FlowLink[] = [];
    const sourceMap = new Map<string, number>();
    const targetMap = new Map<string, number>();

    // Outgoing: selected cluster → targets
    for (const [targetId, weight] of Object.entries(adjacencyMap)) {
      const cascadeJobs = directDisplacement * weight;
      if (cascadeJobs >= 1) {
        outgoingLinks.push({
          sourceId: clusterId,
          targetId,
          value: cascadeJobs,
          weight,
        });
        targetMap.set(targetId, (targetMap.get(targetId) ?? 0) + cascadeJobs);
      }
    }

    // Incoming: other clusters → selected cluster
    for (const [srcId, adjMap] of Object.entries(ADJACENCY_WEIGHTS)) {
      if (srcId === clusterId) continue;
      const weightToSelected = adjMap[clusterId];
      if (!weightToSelected) continue;

      const srcCluster = currentYearData.clusters.find((c) => c.clusterId === srcId);
      if (!srcCluster || srcCluster.totalDirectDisplacement < 1) continue;

      const cascadeJobs = srcCluster.totalDirectDisplacement * weightToSelected;
      if (cascadeJobs >= 1) {
        incomingLinks.push({
          sourceId: srcId,
          targetId: clusterId,
          value: cascadeJobs,
          weight: weightToSelected,
        });
        sourceMap.set(srcId, (sourceMap.get(srcId) ?? 0) + cascadeJobs);
      }
    }

    // Build source nodes (selected cluster + any incoming sources)
    const sources: FlowNode[] = [];
    sources.push({
      id: clusterId,
      label: CLUSTER_NAMES[clusterId] ?? clusterId,
      category: CLUSTER_CATEGORIES[clusterId] ?? 'Other',
      color: getCategoryColor(CLUSTER_CATEGORIES[clusterId] ?? 'Other'),
      value: directDisplacement,
    });

    for (const [srcId, val] of sourceMap) {
      sources.push({
        id: srcId,
        label: CLUSTER_NAMES[srcId] ?? srcId,
        category: CLUSTER_CATEGORIES[srcId] ?? 'Other',
        color: getCategoryColor(CLUSTER_CATEGORIES[srcId] ?? 'Other'),
        value: val,
      });
    }

    // Build target nodes
    const targets: FlowNode[] = [];
    for (const [tgtId, val] of targetMap) {
      targets.push({
        id: tgtId,
        label: CLUSTER_NAMES[tgtId] ?? tgtId,
        category: CLUSTER_CATEGORIES[tgtId] ?? 'Other',
        color: getCategoryColor(CLUSTER_CATEGORIES[tgtId] ?? 'Other'),
        value: val,
      });
    }

    // If selected cluster receives cascading effects, add it to targets too
    if (incomingLinks.length > 0) {
      const totalIncoming = incomingLinks.reduce((s, l) => s + l.value, 0);
      targets.push({
        id: `${clusterId}_target`,
        label: `${CLUSTER_NAMES[clusterId] ?? clusterId} (received)`,
        category: CLUSTER_CATEGORIES[clusterId] ?? 'Other',
        color: getCategoryColor(CLUSTER_CATEGORIES[clusterId] ?? 'Other'),
        value: totalIncoming,
      });
    }

    // Remap incoming links to point to the _target node
    const remappedIncoming = incomingLinks.map((l) => ({
      ...l,
      targetId: `${clusterId}_target`,
    }));

    const allLinks = [...outgoingLinks, ...remappedIncoming];

    // Sort: largest values first for better visual layout
    sources.sort((a, b) => b.value - a.value);
    targets.sort((a, b) => b.value - a.value);

    return {
      sourceNodes: sources,
      targetNodes: targets,
      links: allLinks,
      maxSourceValue: Math.max(...sources.map((s) => s.value), 1),
      maxTargetValue: Math.max(...targets.map((t) => t.value), 1),
    };
  }, [years, currentYear, clusterId]);

  // Layout computation
  const { layoutSources, layoutTargets, layoutLinks } = useMemo(() => {
    if (sourceNodes.length === 0 || targetNodes.length === 0 || links.length === 0) {
      return { layoutSources: [], layoutTargets: [], layoutLinks: [] };
    }

    const innerHeight = DIAGRAM_HEIGHT - MARGIN.top - MARGIN.bottom;
    const innerWidth = DIAGRAM_WIDTH - MARGIN.left - MARGIN.right;

    // Compute node heights proportional to value
    const sourceTotalValue = sourceNodes.reduce((s, n) => s + n.value, 0);
    const targetTotalValue = targetNodes.reduce((s, n) => s + n.value, 0);

    const sourceUsableHeight = innerHeight - (sourceNodes.length - 1) * NODE_GAP;
    const targetUsableHeight = innerHeight - (targetNodes.length - 1) * NODE_GAP;

    const MIN_NODE_HEIGHT = 12;

    // Layout source nodes
    let sourceY = MARGIN.top;
    const layoutSrcs: LayoutNode[] = sourceNodes.map((node) => {
      const rawHeight = sourceTotalValue > 0
        ? (node.value / sourceTotalValue) * sourceUsableHeight
        : sourceUsableHeight / sourceNodes.length;
      const height = Math.max(MIN_NODE_HEIGHT, rawHeight);
      const layoutNode: LayoutNode = {
        ...node,
        x: MARGIN.left,
        y: sourceY,
        height,
      };
      sourceY += height + NODE_GAP;
      return layoutNode;
    });

    // Layout target nodes
    let targetY = MARGIN.top;
    const layoutTgts: LayoutNode[] = targetNodes.map((node) => {
      const rawHeight = targetTotalValue > 0
        ? (node.value / targetTotalValue) * targetUsableHeight
        : targetUsableHeight / targetNodes.length;
      const height = Math.max(MIN_NODE_HEIGHT, rawHeight);
      const layoutNode: LayoutNode = {
        ...node,
        x: MARGIN.left + innerWidth - NODE_WIDTH,
        y: targetY,
        height,
      };
      targetY += height + NODE_GAP;
      return layoutNode;
    });

    // Layout links
    // Track cumulative offsets within each node for stacking
    const sourceOffsets = new Map<string, number>();
    const targetOffsets = new Map<string, number>();

    const maxLinkValue = Math.max(...links.map((l) => l.value), 1);

    const layoutLnks: LayoutLink[] = links.map((link) => {
      const sourceNode = layoutSrcs.find((n) => n.id === link.sourceId);
      const targetNode = layoutTgts.find((n) => n.id === link.targetId);

      if (!sourceNode || !targetNode) {
        return { ...link, sourceY: 0, targetY: 0, thickness: 0 };
      }

      // Compute thickness proportional to flow value
      const thickness = Math.max(
        MIN_FLOW_THICKNESS,
        Math.min(MAX_FLOW_THICKNESS, (link.value / maxLinkValue) * MAX_FLOW_THICKNESS),
      );

      const srcOffset = sourceOffsets.get(link.sourceId) ?? 0;
      const tgtOffset = targetOffsets.get(link.targetId) ?? 0;

      const srcY = sourceNode.y + srcOffset + thickness / 2;
      const tgtY = targetNode.y + tgtOffset + thickness / 2;

      sourceOffsets.set(link.sourceId, srcOffset + thickness + 2);
      targetOffsets.set(link.targetId, tgtOffset + thickness + 2);

      return {
        ...link,
        sourceY: srcY,
        targetY: tgtY,
        thickness,
      };
    });

    return {
      layoutSources: layoutSrcs,
      layoutTargets: layoutTgts,
      layoutLinks: layoutLnks,
    };
  }, [sourceNodes, targetNodes, links]);

  if (links.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-[16px] p-4">
        <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted mb-3">
          Cascade Effects
        </h3>
        <p className="text-text-muted text-[12px]">
          No cascading displacement effects at this time. Effects appear once displacement begins
          and adjacency relationships exist for this cluster.
        </p>
      </div>
    );
  }

  const totalCascade = links.reduce((s, l) => s + l.value, 0);

  return (
    <div className="bg-bg-card border border-border rounded-[16px] p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
          Cascade Effects
        </h3>
        <span className="font-mono text-[11px] text-text-secondary">
          {formatNumber(totalCascade, { compact: true })} second-order jobs depicted
        </span>
      </div>
      <p className="text-text-muted text-[11px] mb-3">
        Illustrative: depicts the inter-industry flow concept. The model applies cluster-level
        employment multipliers; see DATA_MODEL §9.2.
      </p>

      <svg
        viewBox={`0 0 ${DIAGRAM_WIDTH} ${DIAGRAM_HEIGHT}`}
        className="w-full"
        style={{ maxHeight: `${DIAGRAM_HEIGHT}px` }}
      >
        {/* Flow paths */}
        {layoutLinks.map((link, i) => {
          const sourceNode = layoutSources.find((n) => n.id === link.sourceId);
          const color = sourceNode?.color ?? '#D4A03C';
          const x0 = MARGIN.left + NODE_WIDTH;
          const x1 = MARGIN.left + DIAGRAM_WIDTH - MARGIN.left - MARGIN.right - NODE_WIDTH;
          const midX = (x0 + x1) / 2;

          return (
            <g key={i}>
              <path
                d={`M ${x0} ${link.sourceY}
                    C ${midX} ${link.sourceY}, ${midX} ${link.targetY}, ${x1} ${link.targetY}`}
                fill="none"
                stroke={withOpacity(color, 0.35)}
                strokeWidth={link.thickness}
                strokeLinecap="round"
              />
              {/* Brighter center line for readability */}
              <path
                d={`M ${x0} ${link.sourceY}
                    C ${midX} ${link.sourceY}, ${midX} ${link.targetY}, ${x1} ${link.targetY}`}
                fill="none"
                stroke={withOpacity(color, 0.6)}
                strokeWidth={Math.max(1, link.thickness * 0.3)}
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* Source nodes */}
        {layoutSources.map((node) => (
          <g key={node.id}>
            <rect
              x={node.x}
              y={node.y}
              width={NODE_WIDTH}
              height={node.height}
              rx={3}
              fill={node.color}
              opacity={0.85}
            />
            <text
              x={node.x - 6}
              y={node.y + node.height / 2}
              textAnchor="end"
              dominantBaseline="central"
              fill="#8A96AD"
              fontSize={10}
              fontFamily="'JetBrains Mono', monospace"
            >
              {truncateLabel(node.label, 18)}
            </text>
            <text
              x={node.x - 6}
              y={node.y + node.height / 2 + 13}
              textAnchor="end"
              dominantBaseline="central"
              fill="#4E5D75"
              fontSize={9}
              fontFamily="'JetBrains Mono', monospace"
            >
              {formatNumber(node.value, { compact: true })}
            </text>
          </g>
        ))}

        {/* Target nodes */}
        {layoutTargets.map((node) => (
          <g key={node.id}>
            <rect
              x={node.x}
              y={node.y}
              width={NODE_WIDTH}
              height={node.height}
              rx={3}
              fill={node.color}
              opacity={0.85}
            />
            <text
              x={node.x + NODE_WIDTH + 6}
              y={node.y + node.height / 2}
              textAnchor="start"
              dominantBaseline="central"
              fill="#8A96AD"
              fontSize={10}
              fontFamily="'JetBrains Mono', monospace"
            >
              {truncateLabel(node.label, 18)}
            </text>
            <text
              x={node.x + NODE_WIDTH + 6}
              y={node.y + node.height / 2 + 13}
              textAnchor="start"
              dominantBaseline="central"
              fill="#4E5D75"
              fontSize={9}
              fontFamily="'JetBrains Mono', monospace"
            >
              {formatNumber(node.value, { compact: true })}
            </text>
          </g>
        ))}

        {/* Column headers */}
        <text
          x={MARGIN.left + NODE_WIDTH / 2}
          y={12}
          textAnchor="middle"
          fill="#4E5D75"
          fontSize={9}
          fontFamily="'JetBrains Mono', monospace"
          textDecoration="uppercase"
          letterSpacing="0.1em"
        >
          SOURCE
        </text>
        <text
          x={DIAGRAM_WIDTH - MARGIN.right - NODE_WIDTH / 2}
          y={12}
          textAnchor="middle"
          fill="#4E5D75"
          fontSize={9}
          fontFamily="'JetBrains Mono', monospace"
          textDecoration="uppercase"
          letterSpacing="0.1em"
        >
          AFFECTED
        </text>
      </svg>
    </div>
  );
}

function truncateLabel(label: string, maxLen: number): string {
  if (label.length <= maxLen) return label;
  return label.slice(0, maxLen - 1) + '\u2026';
}
