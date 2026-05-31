/**
 * Feedback Loop Visualization Types
 *
 * Declarative definitions for the 6 feedback loops in the ATLAS model.
 * Used by FeedbackLoopDiagram (circular SVG renderer) and
 * SystemInterconnectionDiagram (master view).
 */

// ---------------------------------------------------------------------------
// Node & Edge Types
// ---------------------------------------------------------------------------

/** A node (variable) in a feedback loop diagram */
export interface LoopNode {
  /** Unique within a loop — used as key and for edge references */
  id: string;
  /** Display label (use \n for line breaks inside SVG nodes) */
  label: string;
  /** Short label for the system interconnection diagram */
  shortLabel: string;
  /** Which methodology equation number this relates to, e.g. "1.5" */
  equationRef: string;
  /** Source file and function, e.g. "macro.ts:computeRevenuePressure()" */
  codeRef: string;
  /** Display format for the node's computed value */
  format: 'percent' | 'currency' | 'multiplier' | 'number' | 'compact';
  /** Whether this node is a "shared" node appearing in multiple loops */
  shared?: boolean;
  /**
   * Whether this node's value reflects the next year (t+1) rather than the
   * immediate year.  Some variables (e.g. business credit, investment) respond
   * to lagged inputs in the production model, so the mini-simulation runs a
   * second iteration and shows the compound effect for clarity.
   */
  lagged?: boolean;
}

/** A directed edge (causal relationship) between two nodes */
export interface LoopEdge {
  /** Source node ID */
  from: string;
  /** Target node ID */
  to: string;
  /** Relationship label shown on hover, e.g. "amplifies" */
  label: string;
  /** Causal polarity: '+' = same direction, '-' = inverse */
  polarity: '+' | '-';
  /** The equation governing this edge (shown in tooltip) */
  equation: string;
}

/** A user-adjustable parameter within a loop's mini-simulation */
export interface LoopParam {
  /** Matches a key in the simulate() params object */
  id: string;
  /** UI label */
  label: string;
  /** Slider min value */
  min: number;
  /** Slider max value */
  max: number;
  /** Slider step */
  step: number;
  /** Default/baseline value */
  defaultValue: number;
  /** Unit label shown after value, e.g. "%" or "x" */
  unit: string;
  /** Which constant in constants.ts this corresponds to */
  sourceConstant: string;
}

// ---------------------------------------------------------------------------
// Loop Definition
// ---------------------------------------------------------------------------

/** Complete definition of one feedback loop */
export interface FeedbackLoopDefinition {
  /** Unique loop identifier */
  id: string;
  /** Full display name, e.g. "Revenue Pressure (Displacement-Demand Feedback)" */
  name: string;
  /** Short name for tabs/badges, e.g. "Displacement-Demand" */
  shortName: string;
  /** Accent color for this loop */
  color: string;
  /** 2-3 sentence plain-English explanation */
  description: string;
  /** Nodes ordered around the circle (first → second → ... → back to first) */
  nodes: LoopNode[];
  /** Directed edges (typically one per consecutive pair + closing edge) */
  edges: LoopEdge[];
  /** User-adjustable parameters */
  params: LoopParam[];
}

// ---------------------------------------------------------------------------
// Simulation Result Types
// ---------------------------------------------------------------------------

/** Result of running a loop's mini-simulation */
export interface LoopSimulationResult {
  /** Computed value for each node, keyed by node ID */
  nodeValues: Record<string, number>;
}

/** State for the cascading animation */
export interface CascadeAnimationState {
  /** Index of the currently-highlighted node in the cascade (-1 = none) */
  activeNodeIndex: number;
  /** Per-node delta from baseline (positive = increase, negative = decrease) */
  deltas: Record<string, number>;
  /** Whether an animation is currently running */
  isAnimating: boolean;
}

// ---------------------------------------------------------------------------
// Shared Node Metadata (for System Interconnection Diagram)
// ---------------------------------------------------------------------------

/** A shared node that appears in multiple loops */
export interface SharedNode {
  /** Canonical node ID */
  id: string;
  /** Display label */
  label: string;
  /** Which loop IDs this node appears in */
  loopIds: string[];
  /** Position in the master diagram (manually laid out) */
  position: { x: number; y: number };
}
