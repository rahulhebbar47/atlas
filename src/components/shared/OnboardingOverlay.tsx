/**
 * ATLAS Onboarding Overlay
 *
 * First-time walkthrough that highlights key areas of the dashboard.
 * Shows a series of steps with descriptions, progressing via "Next" button.
 * Persists completion to localStorage so it only shows once.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';

const ONBOARDING_STEPS = [
  {
    title: 'Welcome to ATLAS',
    description:
      'ATLAS simulates how AI-driven automation will impact the U.S. labor force, economy, and policy responses over the next 25 years. This tool is built for serious policy analysis.',
    highlight: 'overview',
  },
  {
    title: 'Capability Controls',
    description:
      'The left panel contains sliders for AI capability trajectories. Each slider controls how fast a particular AI technology improves — from language models to robotics. Drag any slider to see real-time impact on the simulation.',
    highlight: 'controls',
  },
  {
    title: 'Main Visualizations',
    description:
      'The center panel shows employment, GDP, and new job creation trajectories. Use the navigation tabs (Overview, Occupations, Policy, States) to explore different dimensions of the simulation.',
    highlight: 'main',
  },
  {
    title: 'Insights Panel',
    description:
      'The right panel shows key metrics, tipping point analysis, income composition, and stress tests. These update in real-time as you adjust parameters.',
    highlight: 'insights',
  },
  {
    title: 'Timeline Scrubber',
    description:
      'Use the timeline bar at the top of the visualization area to scrub through years. Press play to animate the simulation forward. All metrics update to reflect the selected year.',
    highlight: 'timeline',
  },
  {
    title: 'Scenarios & Sharing',
    description:
      'Save your configurations as named scenarios, export them as JSON, or share via compressed URL links. Find the Scenario Manager at the bottom of the Controls panel.',
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
