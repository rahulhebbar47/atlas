/**
 * ATLAS Onboarding Overlay
 *
 * First-time walkthrough that highlights key areas of the dashboard.
 * Shows a series of steps with descriptions, progressing via "Next" button.
 * Persists completion to localStorage so it only shows once.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';

// Rewritten at the pre-push finalization (2026-08): the flow teaches the shipped model —
// where the numbers come from → beliefs → happenings → choices → Advanced. Exported so the
// strings enter the permanent user-visible vocabulary sweep (r3c-batteries).
// The retired step set (pre-redesign left-panel sliders, the States tab, the old Scenario
// Manager position), kept per the no-delete rule:
//   { title: 'Capability Controls', description: 'The left panel contains sliders for AI
//     capability trajectories. Each slider controls how fast a particular AI technology
//     improves — from language models to robotics. Drag any slider to see real-time impact
//     on the simulation.', highlight: 'controls' },
//   ...tabs '(Overview, Occupations, Policy, States)' / '...Scenario Manager at the bottom
//   of the Controls panel.'
export const ONBOARDING_STEPS = [
  {
    title: 'Welcome to ATLAS',
    description:
      'ATLAS simulates how AI-driven automation could reshape the U.S. labor force, economy, and policy response through 2050. It is built for serious policy analysis: every number traces to a source, and every assumption is yours to change.',
    highlight: 'overview',
  },
  {
    title: 'The Worldview Panel',
    description:
      'The left panel sets the worldview the simulation runs under, as four questions: whose measurements do you trust (optional calibration from published AI-usage data), what do you believe (the assumption dials, in plain language), what happens (events you can schedule), and what do we choose (policy packages). Every selection recomputes the simulation immediately.',
    highlight: 'controls',
  },
  {
    title: 'The Main Views',
    description:
      'The center panel charts the trajectory — employment, output, incomes, new job creation. The tabs change the depth: Overview for the headline story, Occupations for who is affected, Policy and Fiscal for the response, Economics and Monetary for the machinery, Methodology for how the model works.',
    highlight: 'main',
  },
  {
    title: 'The Insights Panel',
    description:
      'The right panel tracks the key readings as you explore — headline metrics, tipping-point analysis, income composition, and stress tests — recomputed live with every change.',
    highlight: 'insights',
  },
  {
    title: 'The Timeline',
    description:
      'Scrub the timeline above the charts to move through the years, or press play to watch the trajectory unfold. Every reading follows the selected year.',
    highlight: 'timeline',
  },
  {
    // Re-touched at the Scenarios redesign (and again at the bug pass: the top bar is
    // always the Test My Own reset; link-sharing removed earlier — local-install only).
    title: 'Saving and Testing Worlds',
    description:
      'The top of the left panel asks the capstone question: what world do you want to test? Test My Own returns the model to its defaults (your data-source choice stays) so you can build a world from scratch; load an authored worldview or one of your saves with one tap, save the current world under a name with Save, and move complete worlds between machines as exported files. For the full instrument panel — every parameter in the model, each with its provenance — open the Advanced tab.',
    highlight: 'scenarios',
  },
] as const;

export function OnboardingOverlay() {
  const onboardingComplete = useSimulationStore((s) => s.onboardingComplete);
  const onboardingStep = useSimulationStore((s) => s.onboardingStep);
  const setOnboardingComplete = useSimulationStore((s) => s.setOnboardingComplete);
  const setOnboardingStep = useSimulationStore((s) => s.setOnboardingStep);

  const handleNext = useCallback(() => {
    if (onboardingStep < ONBOARDING_STEPS.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setOnboardingComplete(true);
    }
  }, [onboardingStep, setOnboardingStep, setOnboardingComplete]);

  const handleSkip = useCallback(() => {
    setOnboardingComplete(true);
  }, [setOnboardingComplete]);

  if (onboardingComplete) return null;

  const step = ONBOARDING_STEPS[onboardingStep];
  if (!step) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bg-void/80 backdrop-blur-sm" />

      {/* Dialog */}
      <div className="relative bg-bg-surface border border-border rounded-2xl p-8 max-w-[480px] w-full mx-4 shadow-2xl">
        {/* Step indicator */}
        <div className="flex items-center gap-1.5 mb-5">
          {ONBOARDING_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === onboardingStep
                  ? 'w-6 bg-gold'
                  : i < onboardingStep
                    ? 'w-3 bg-gold/40'
                    : 'w-3 bg-border'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <h2 className="font-display text-xl text-text-primary mb-3">
          {step.title}
        </h2>
        <p className="text-text-secondary text-[13px] leading-relaxed mb-8">
          {step.description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-[11px] font-mono text-text-muted hover:text-text-secondary transition-colors uppercase tracking-[0.06em]"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-text-muted">
              {onboardingStep + 1} / {ONBOARDING_STEPS.length}
            </span>
            <button
              onClick={handleNext}
              className="px-5 py-2 text-[11px] font-mono font-medium uppercase tracking-[0.08em] rounded-lg border border-gold text-gold bg-gold-subtle hover:bg-gold/20 transition-colors"
            >
              {onboardingStep === ONBOARDING_STEPS.length - 1 ? 'Get started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
