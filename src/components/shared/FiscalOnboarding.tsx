/**
 * ATLAS Phase 8d: Fiscal Onboarding
 *
 * Tooltip-style walkthrough for first-time visitors to the Fiscal tab.
 * Positioned tooltips point to key UI elements using data-tour-id attributes.
 *
 * 5 steps:
 *   1. Fiscal Response Profile — preset selector
 *   2. Dimension Sliders — customize section
 *   3. Parameter Dashboard — mini-chart grid
 *   4. Compare Profiles — compare button
 *   5. Scenario Templates — templates section
 *
 * Persists completion to localStorage. Does not re-show after dismissal.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';

// ============================================================
// Tour Steps
// ============================================================

interface TourStep {
  /** data-tour-id attribute value of the target element. */
  targetId: string;
  title: string;
  description: string;
  /** Preferred position of tooltip relative to target. */
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'fiscal-preset-selector',
    title: 'Fiscal Response Profile',
    description:
      'Choose a fiscal philosophy that determines how the government responds to AI-driven economic changes. Each preset configures spending, taxes, and monetary policy.',
    position: 'right',
  },
  {
    targetId: 'fiscal-dimensions',
    title: 'Dimension Sliders',
    description:
      'Fine-tune the five response dimensions: spending cuts, tax increases, monetary accommodation, safety net expansion, and implementation speed.',
    position: 'right',
  },
  {
    targetId: 'parameter-grid',
    title: 'Parameter Dashboard',
    description:
      'Each card shows how a parameter evolves over time. Gray = baseline, blue = autopilot adjustment, gold = your overrides. Click any card for a detailed trajectory chart.',
    position: 'top',
  },
  {
    targetId: 'profile-compare-button',
    title: 'Compare Profiles',
    description:
      'Compare two fiscal philosophies side-by-side to see how different response strategies lead to different economic outcomes.',
    position: 'bottom',
  },
  {
    targetId: 'scenario-templates',
    title: 'Scenario Templates',
    description:
      'Load pre-built scenarios that combine a fiscal profile with specific policy interventions to explore questions like "What if we adopt Nordic-style transfers?"',
    position: 'right',
  },
];

// ============================================================
// Component
// ============================================================

export function FiscalOnboarding() {
  const fiscalOnboardingComplete = useSimulationStore((s) => s.fiscalOnboardingComplete);
  const fiscalOnboardingStep = useSimulationStore((s) => s.fiscalOnboardingStep);
  const setFiscalOnboardingComplete = useSimulationStore((s) => s.setFiscalOnboardingComplete);
  const setFiscalOnboardingStep = useSimulationStore((s) => s.setFiscalOnboardingStep);

  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = TOUR_STEPS[fiscalOnboardingStep];

  // Position tooltip relative to target element
  const positionTooltip = useCallback(() => {
    if (!currentStep) return;

    const target = document.querySelector(`[data-tour-id="${currentStep.targetId}"]`);
    if (!target) {
      // Target not found — skip to next step or end
      if (fiscalOnboardingStep < TOUR_STEPS.length - 1) {
        setFiscalOnboardingStep(fiscalOnboardingStep + 1);
      } else {
        setFiscalOnboardingComplete(true);
      }
      return;
    }

    const rect = target.getBoundingClientRect();
    const gap = 12;
    const style: React.CSSProperties = { position: 'fixed', zIndex: 100 };
    const arrow: React.CSSProperties = { position: 'absolute' };

    switch (currentStep.position) {
      case 'top':
        style.bottom = window.innerHeight - rect.top + gap;
        style.left = rect.left + rect.width / 2;
        style.transform = 'translateX(-50%)';
        arrow.bottom = -6;
        arrow.left = '50%';
        arrow.transform = 'translateX(-50%) rotate(45deg)';
        break;
      case 'bottom':
        style.top = rect.bottom + gap;
        style.left = rect.left + rect.width / 2;
        style.transform = 'translateX(-50%)';
        arrow.top = -6;
        arrow.left = '50%';
        arrow.transform = 'translateX(-50%) rotate(45deg)';
        break;
      case 'left':
        style.right = window.innerWidth - rect.left + gap;
        style.top = rect.top + rect.height / 2;
        style.transform = 'translateY(-50%)';
        arrow.right = -6;
        arrow.top = '50%';
        arrow.transform = 'translateY(-50%) rotate(45deg)';
        break;
      case 'right':
        style.left = rect.right + gap;
        style.top = rect.top + rect.height / 2;
        style.transform = 'translateY(-50%)';
        arrow.left = -6;
        arrow.top = '50%';
        arrow.transform = 'translateY(-50%) rotate(45deg)';
        break;
    }

    setTooltipStyle(style);
    setArrowStyle(arrow);
    setVisible(true);
  }, [currentStep, fiscalOnboardingStep, setFiscalOnboardingStep, setFiscalOnboardingComplete]);

  // Position on step change and on scroll/resize
  useEffect(() => {
    if (fiscalOnboardingComplete || !currentStep) return;

    // Small delay to allow layout to settle
    const timer = setTimeout(positionTooltip, 100);

    window.addEventListener('scroll', positionTooltip, true);
    window.addEventListener('resize', positionTooltip);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', positionTooltip, true);
      window.removeEventListener('resize', positionTooltip);
    };
  }, [fiscalOnboardingComplete, currentStep, positionTooltip]);

  const handleNext = useCallback(() => {
    if (fiscalOnboardingStep < TOUR_STEPS.length - 1) {
      setVisible(false);
      setFiscalOnboardingStep(fiscalOnboardingStep + 1);
    } else {
      setFiscalOnboardingComplete(true);
    }
  }, [fiscalOnboardingStep, setFiscalOnboardingStep, setFiscalOnboardingComplete]);

  const handleSkip = useCallback(() => {
    setFiscalOnboardingComplete(true);
  }, [setFiscalOnboardingComplete]);

  if (fiscalOnboardingComplete || !currentStep) return null;

  return (
    <>
      {/* Semi-transparent backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-[99]"
        onClick={handleSkip}
      />

      {/* Tooltip */}
      {visible && (
        <div
          ref={tooltipRef}
          style={tooltipStyle}
          className="z-[100] w-[280px] bg-bg-card border border-gold/30 rounded-[12px] p-4 shadow-lg"
        >
          {/* Arrow */}
          <div
            style={arrowStyle}
            className="w-3 h-3 bg-bg-card border-l border-t border-gold/30"
          />

          {/* Step counter */}
          <div className="font-mono text-[9px] text-text-muted mb-1.5">
            {fiscalOnboardingStep + 1} of {TOUR_STEPS.length}
          </div>

          {/* Content */}
          <h4 className="text-[13px] font-semibold text-text-primary mb-1.5">
            {currentStep.title}
          </h4>
          <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
            {currentStep.description}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-[10px] font-mono text-text-muted hover:text-text-secondary transition-colors"
            >
              Skip tour
            </button>
            <button
              onClick={handleNext}
              className="px-3 py-1 rounded-[6px] bg-gold/10 text-gold text-[11px] font-mono font-semibold hover:bg-gold/20 transition-colors"
            >
              {fiscalOnboardingStep === TOUR_STEPS.length - 1 ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
