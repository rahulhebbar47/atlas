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

  let triggerYear = augTriggerYear;
  if (triggerYear === null && viable) {
    triggerYear = year;
  }

  if (triggerYear === null) {
    return { augAdoptionRate: 0, triggered: false, triggerYear: null };
  }

  const yearsSince = Math.max(0, year - triggerYear);
  const augAdoptionRate = 1 / (1 + Math.exp(-steepness * yearsSince));

  return {
    augAdoptionRate,
    triggered: true,
    triggerYear,
  };
}
