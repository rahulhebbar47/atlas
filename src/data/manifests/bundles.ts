/**
 * WORLDVIEW BUNDLES  — belief-only saved compositions for the Scenarios
 * gallery. Each bundle selects axis variants and NOTHING else (no events, no policies
 * — those stay the user's); applying one is an ordinary composition write, so removing
 * it returns the world exactly (composition purity). School names appear in rationale
 * text as orientation only. Every bundle carries the scope line verbatim.
 *
 * STATUS: the five-bundle set is ADOPTED as proposed (2026-07-28). Bundles are data;
 * the set grows by the same proposal-and-review path.
 */
import type { AxisId } from '@/types/manifests';

export const BUNDLE_SCOPE_LINE = "as expressible within ATLAS's mechanisms" as const;

export interface WorldviewBundleDef {
  id: string;
  name: string;
  /** One-paragraph reasoning; school names orientation-only. */
  rationaleText: string;
  /** Belief selections only. Unset axes stay at the quiet consensus. */
  axes: Partial<Record<AxisId, string>>;
  scopeLine: typeof BUNDLE_SCOPE_LINE;
}

export const WORLDVIEW_BUNDLES: readonly WorldviewBundleDef[] = [
  {
    id: 'bundle-acceleration',
    name: 'The acceleration',
    rationaleText: 'Capable AI arrives fast and cheap, firms adopt with little friction and tilt toward replacing workers, displaced workers scar, and new work arrives too slowly to absorb them. The displacement-stress reading (orientation: the fast-takeoff displacement literature).',
    // the card says
    // capable AI "arrives fast AND CHEAP"; its cheap-physical-inputs content
    // (manufacturing −0.15) migrated to N1·Breakthrough-collapse at the A2
    // surgery — the selection restores the stated worldview.
    axes: {
      A1: 'Fast', A2: 'Commodity-collapse', A3: 'Frictionless', A4: 'Replacement-tilted',
      A5: 'Scarred', A6: 'Pessimist', A7: 'Fragile-hoarding', A8: '2008-replay',
      N1: 'Breakthrough-collapse',
    },
    scopeLine: BUNDLE_SCOPE_LINE,
  },
  {
    id: 'bundle-augmented-abundance',
    name: 'Augmented abundance',
    rationaleText: 'AI advances fast but lands as a tool: workers become more productive rather than redundant, the economy invents new work at wage parity, demand holds, and housing supply responds. The optimistic reading (orientation: the augmentation and new-task literature).',
    // the
    // card's "AI advances fast" world composed A2·Commodity-collapse pre-surgery
    // — the cheap-AI belief was already its content; cheap capacity grounds more
    // realized automation even in the tool reading (measured, adopted knowingly).
    axes: {
      A1: 'Fast', A2: 'Commodity-collapse', A3: 'Frictionless', A4: 'Augmentation-dominant',
      A5: 'Fluid', A6: 'Creation-optimist', A7: 'Resilient', A9: 'Abundance',
      N1: 'Breakthrough-collapse',
    },
    scopeLine: BUNDLE_SCOPE_LINE,
  },
  {
    id: 'bundle-long-plateau',
    name: 'The long plateau',
    rationaleText: 'Benchmarks saturate near current capability, frontier work stays expensive, and procurement friction slows what does arrive. The scaling-skeptic reading: the wave is smaller and slower than the demonstrations suggest.',
    axes: { A1: 'Plateau', A2: 'Persistent-premium', A3: 'Sticky' },
    scopeLine: BUNDLE_SCOPE_LINE,
  },
  {
    id: 'bundle-cognition-without-hands',
    name: 'Cognition without hands',
    rationaleText: 'Language and decision AI race ahead while robotics lags a decade: office work transforms while physical work holds, and the construction gains that would unlock housing never quite arrive. The robotics-is-hard reading.',
    axes: { A1: 'Embodied-lag', A9: 'Constrained-coastal' },
    scopeLine: BUNDLE_SCOPE_LINE,
  },
  {
    id: 'bundle-fiscal-reckoning', // id stable (saved compositions reference bundle axes, not ids — but stability costs nothing)
    // Owner rename (pre-flight polish): 'The fiscal reckoning' read doomerish against the
    // bundle's actual content — four constraints on the fiscal response, not a collapse
    // thesis. The standing milder term for exactly that configuration:
    name: 'Fiscal headwinds',
    rationaleText: 'Bond markets lose patience early while Washington gridlocks: debt limits bind, credit amplifies the downturn, and displaced workers scar against a state with no fiscal room. The sovereign-stress reading (orientation: fiscal-dominance episodes).',
    axes: { A5: 'Scarred', A8: '2008-replay', A10: 'Dominance-prone', A13: 'gridlock' },
    scopeLine: BUNDLE_SCOPE_LINE,
  },
];
