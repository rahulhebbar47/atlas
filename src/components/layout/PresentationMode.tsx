/**
 * ATLAS Presentation Mode
 *
 * Full-viewport overlay for presenting simulation findings.
 * Step-through narrative with key charts and metrics.
 * Keyboard navigation (left/right arrows, Escape to exit).
 * Export current slide to PNG via html-to-image.
 *
 * Per DESIGN_PHILOSOPHY.md §7:
 *   - Hides control panels
 *   - Full-screen visualization with step-through narrative
 *   - Key metrics displayed as large, prominent cards
 *   - Suitable for projecting in a briefing room
 *   - Export to PNG/SVG for slides
 */

import { useEffect, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';
import { useSimulationStore } from '@/stores/simulationStore';
import { useMacroTimeSeries, usePolicyWindowInfo, useCurrentYear, useCurrentYearData } from '@/hooks/useSimulation';
import { EmploymentChart } from '@/components/charts/EmploymentChart';
import { GDPChart } from '@/components/charts/GDPChart';
import { NewJobsChart } from '@/components/charts/NewJobsChart';
import { formatNumber, formatCurrency, formatPercent } from '@/utils/format';
import type { PresentationSlide } from '@/types';

// ============================================================
// Presentation Slides Definition
// ============================================================

const PRESENTATION_SLIDES: PresentationSlide[] = [
  {
    id: 'metrics',
    title: 'Key Economic Indicators',
    narrative:
      'Current snapshot of the U.S. economy under the simulated AI automation scenario. These metrics update in real-time as model parameters change.',
    content: 'metrics',
  },
  {
    id: 'employment',
    title: 'Employment Trajectory',
    narrative:
      'Total employment over the simulation period, showing the impact of AI-driven automation on the U.S. labor force. The tipping point marks where wage and employment decline outpaces price deflation.',
    content: 'employment',
  },
  {
    id: 'gdp',
    title: 'GDP & Purchasing Power',
    narrative:
      'Nominal GDP growth alongside Aggregate Real Purchasing Power (ARPP) per capita. Divergence between GDP growth and purchasing power indicates the onset of the displacement-demand feedback cycle.',
    content: 'gdp',
  },
  {
    id: 'newJobs',
    title: 'New Job Creation vs. Displacement',
    narrative:
      'The balance between AI-created jobs and AI-displaced jobs. Durable new jobs are filtered by automation survivability — as AI coverage rises, newly created jobs become increasingly vulnerable to immediate automation.',
    content: 'newJobs',
  },
];

// ============================================================
// Presentation Mode Component
// ============================================================

export function PresentationMode() {
  const presentationMode = useSimulationStore((s) => s.presentationMode);
  const presentationStep = useSimulationStore((s) => s.presentationStep);
  const togglePresentationMode = useSimulationStore((s) => s.togglePresentationMode);
  const nextPresentationStep = useSimulationStore((s) => s.nextPresentationStep);
  const prevPresentationStep = useSimulationStore((s) => s.prevPresentationStep);
  const setPresentationStep = useSimulationStore((s) => s.setPresentationStep);

  const slideRef = useRef<HTMLDivElement>(null);

  // Clamp step to valid range
  const currentStep = Math.min(presentationStep, PRESENTATION_SLIDES.length - 1);
  const slide = PRESENTATION_SLIDES[currentStep];

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!presentationMode) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          if (currentStep < PRESENTATION_SLIDES.length - 1) {
            nextPresentationStep();
          }
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          prevPresentationStep();
          break;
        case 'Escape':
          e.preventDefault();
          togglePresentationMode();
          break;
      }
    },
    [presentationMode, currentStep, nextPresentationStep, prevPresentationStep, togglePresentationMode],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Export current slide as PNG
  const handleExport = useCallback(async () => {
    if (!slideRef.current) return;
    try {
      const dataUrl = await toPng(slideRef.current, {
        backgroundColor: '#04070D',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `atlas-slide-${currentStep + 1}-${slide?.id ?? 'unknown'}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('[ATLAS] Failed to export slide as PNG:', err);
    }
  }, [currentStep, slide?.id]);

  if (!presentationMode || !slide) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-bg-void flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between h-[48px] px-6 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="font-mono text-[13px] font-semibold tracking-[0.15em] text-text-primary">
            ATLAS<span className="text-gold">.</span>
          </div>
          <span className="text-text-muted text-[10px] font-mono uppercase tracking-[0.08em]">
            Presentation Mode
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Export button */}
          <button
            onClick={handleExport}
            className="px-3 py-1 text-[10px] font-mono font-medium uppercase tracking-[0.08em] rounded border border-border text-text-secondary hover:text-text-primary hover:border-border-accent transition-colors"
          >
            Export PNG
          </button>

          {/* Close button */}
          <button
            onClick={togglePresentationMode}
            className="px-3 py-1 text-[10px] font-mono font-medium uppercase tracking-[0.08em] rounded border border-border text-text-muted hover:text-text-primary transition-colors"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div ref={slideRef} className="flex-1 flex flex-col overflow-hidden p-8">
        {/* Slide header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl text-text-primary mb-2">
            {slide.title}
          </h1>
          <p className="text-text-secondary text-[14px] leading-relaxed max-w-[720px]">
            {slide.narrative}
          </p>
        </div>

        {/* Slide visualization */}
        <div className="flex-1 min-h-0">
          <SlideContent content={slide.content} />
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between h-[56px] px-6 border-t border-border flex-shrink-0">
        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {PRESENTATION_SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setPresentationStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-8 bg-gold'
                  : 'w-4 bg-border hover:bg-border-accent'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-text-muted mr-2">
            {currentStep + 1} / {PRESENTATION_SLIDES.length}
          </span>
          <button
            onClick={prevPresentationStep}
            disabled={currentStep === 0}
            className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.06em] rounded border border-border text-text-secondary hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <button
            onClick={nextPresentationStep}
            disabled={currentStep === PRESENTATION_SLIDES.length - 1}
            className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.06em] rounded border border-gold text-gold bg-gold-subtle hover:bg-gold/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="absolute bottom-[68px] left-6 text-[9px] font-mono text-text-muted/50">
        Arrow keys to navigate · Esc to exit
      </div>
    </div>
  );
}

// ============================================================
// Slide Content Renderer
// ============================================================

function SlideContent({ content }: { content: PresentationSlide['content'] }) {
  switch (content) {
    case 'metrics':
      return <PresentationMetrics />;
    case 'employment':
      return <EmploymentChart />;
    case 'gdp':
      return <GDPChart />;
    case 'newJobs':
      return <NewJobsChart />;
    default:
      return null;
  }
}

// ============================================================
// Large-format Metrics for Presentation
// ============================================================

function PresentationMetrics() {
  const yearData = useCurrentYearData();
  const currentYear = useCurrentYear();
  const { fiscalWindowClose: fiscalWindowCloseYear } = usePolicyWindowInfo();

  if (!yearData) return null;
  const { macro } = yearData;

  return (
    <div className="h-full flex flex-col justify-center">
      {/* Year badge */}
      <div className="text-center mb-8">
        <span className="font-mono text-[14px] text-text-muted uppercase tracking-[0.15em]">
          Projected — {currentYear}
        </span>
      </div>

      {/* Large metric cards */}
      <div className="grid grid-cols-3 gap-6 max-w-[960px] mx-auto w-full">
        <PresentationMetricCard
          label="Total Employment"
          value={formatNumber(macro.totalEmployment, { compact: true })}
          color="text-text-primary"
        />
        <PresentationMetricCard
          label="Unemployment Rate"
          value={formatPercent(macro.unemploymentRate)}
          color={macro.unemploymentRate > 0.1 ? 'text-critical' : 'text-text-primary'}
        />
        <PresentationMetricCard
          label="GDP"
          value={formatCurrency(macro.gdpNominal, { compact: true })}
          color="text-text-primary"
        />
        <PresentationMetricCard
          label="CWI"
          value={formatCurrency(macro.consumerWelfareIndex, { compact: true })}
          color="text-text-primary"
        />
        <PresentationMetricCard
          label="AI Coverage"
          value={formatPercent(macro.automationCoverage)}
          color="text-gold"
        />
        <PresentationMetricCard
          label="Net Job Creation"
          value={(macro.netJobCreation >= 0 ? '+' : '') + formatNumber(macro.netJobCreation, { compact: true })}
          color={macro.netJobCreation >= 0 ? 'text-growth' : 'text-critical'}
        />
      </div>

      {/* Policy window close callout */}
      {fiscalWindowCloseYear && (
        <div className="text-center mt-10">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-critical/10 border border-critical/30 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-critical animate-pulse" />
            <span className="font-mono text-[13px] text-critical">
              Policy Window Closes: {fiscalWindowCloseYear}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function PresentationMetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-2xl px-6 py-5">
      <div className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted mb-2">
        {label}
      </div>
      <div className={`font-mono text-2xl leading-tight ${color}`}>
        {value}
      </div>
    </div>
  );
}
