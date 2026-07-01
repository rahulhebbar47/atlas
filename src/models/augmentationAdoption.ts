/**
 * ATLAS Augmentation Adoption Model (Phase 10.A Part 7)
 *
 * Pre-BFCS augmentation adoption: once AI is "viable as a tool" (betterScore × cheaperScore
 * crosses a small internal threshold), augmentation adoption begins as a logistic S-curve
 * in yearsSinceTrigger.
 *
 *   augAdoptionRate = 1 / (1 + exp(-steepness × yearsSinceTrigger))
 *
 * The 0.1 viability threshold is a module-internal implementation detail, not a user knob.
 * It marks the point at which AI becomes a credible tool, not a user-adjustable "worth adopting" line.
 *
 * All functions PURE — no side effects, no state mutation.
 */

import type { AugmentationAdoptionResult } from '@/types';

/** Mathematical viability threshold: betterScore × cheaperScore must exceed this before
 *  augmentation adoption can begin. INTERNAL — never exported, never a user knob. */
const AUGMENTATION_VIABILITY_THRESHOLD = 0.1;

/**
 * Compute the augmentation adoption rate for one role at one year.
 *
 * Trigger semantics (stateful via the caller):
 *   - If augTriggerYear is null AND (better × cheaper) > threshold, return triggered=true with
 *     triggerYear=currentYear so the caller can persist it.
 *   - If augTriggerYear is null AND not viable, return { augAdoptionRate: 0, triggered: false, triggerYear: null }.
 *   - If augTriggerYear is already set, compute the logistic regardless of current viability
 *     (once adoption starts, a temporary dip in viability doesn't reset it).
 *
 * @param year               Current simulation year
 * @param betterScore        Current BFCS Better score for the role [0,1]
 * @param cheaperScore       Current BFCS Cheaper score for the role [0,1]
 * @param augTriggerYear     Prior augmentation trigger year if already armed, else null
 * @param steepness          Logistic steepness (larger = faster adoption) — user-adjustable
 */
export function computeAugmentationAdoption(inputs: {
  year: number;
  betterScore: number;
  cheaperScore: number;
  augTriggerYear: number | null;
  steepness: number;
}): AugmentationAdoptionResult {
  const { year, betterScore, cheaperScore, augTriggerYear, steepness } = inputs;

  const viable = (betterScore * cheaperScore) > AUGMENTATION_VIABILITY_THRESHOLD;

  // FS-1b F9 (documented one-sidedness, the R24 standard; why-note amended at the close-out
  // per OD-12): the trigger latch is ONE-WAY — a MODELING CHOICE with switching frictions,
  // not a physical law. The model's cost basis is per-token inference (an opex), so a
  // sustained cost reversal CAN make continued automation uneconomic at the margin; reversal
  // is unmodeled here pending the successor program's hysteresis design
  // (the successor program charter, maintained with the audit records — the reverse gear: hysteresis band +
  // asymmetric speeds). The U1 integrator's structural bound is coverage saturation
  // (adoption ≤ ceiling ≤ 1).
  let triggerYear = augTriggerYear;
  if (triggerYear === null && viable) {
    triggerYear = year;
  }

  if (triggerYear === null) {
    return { augAdoptionRate: 0, triggered: false, triggerYear: null };
  }

  const yearsSince = Math.max(0, year - triggerYear);
  // FS-1b F1 (ruled): the SIBLING FORM (adoption.ts consistency) — starts at 0 at the trigger
  // year and saturates, replacing the logistic that JUMPED to 0.5 at yearsSince = 0 (the FS-1
  // discontinuity finding). The Bass-class slow-start enrichment is REGISTERED with a citation
  // as its trigger — not taken without one.
  const augAdoptionRate = 1 - Math.exp(-steepness * yearsSince);

  return {
    augAdoptionRate,
    triggered: true,
    triggerYear,
  };
}
