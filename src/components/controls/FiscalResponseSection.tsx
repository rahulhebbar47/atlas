/**
 * ATLAS Phase 8 Fix 4: Fiscal Response Section
 *
 * Top section of the sidebar — the highest-level user choices.
 * Split into two sub-sections:
 *   1. Fiscal Policy — preset selector + 4 dimension sliders
 *   2. Federal Reserve — preset selector + 2 dimension sliders
 *
 * Also contains baseline comparison toggle and override summary.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from '@/stores/simulationStore';
import { FiscalPresetSelector, FedPresetSelector } from '@/components/controls/FiscalPresetSelector';
import { DimensionSlider } from '@/components/controls/DimensionSlider';
import { BaselineComparisonToggle } from '@/components/controls/BaselineComparisonToggle';
import { useFiscalDimensions, useFedDimensions, useOverrideCount } from '@/hooks/useParameterTimeline';
import { FISCAL_DIMENSIONS, FED_DIMENSIONS } from '@/models/fiscalDimensions';
import { InfoTooltip } from '@/components/shared/InfoTooltip';
import type { FiscalDimensionKey, FedDimensionKey } from '@/types';

export function FiscalResponseSection() {
  const { positions: fiscalPositions, activePreset: fiscalPreset } = useFiscalDimensions();
  const { positions: fedPositions, activePreset: fedPreset } = useFedDimensions();
  const setFiscalDimension = useSimulationStore((s) => s.setFiscalDimension);
  const setFedDimension = useSimulationStore((s) => s.setFedDimension);
  const clearParameterOverrides = useSimulationStore((s) => s.clearParameterOverrides);
  const { total: overrideCount, years: overrideYears } = useOverrideCount();

  const [fiscalDimsExpanded, setFiscalDimsExpanded] = useState(fiscalPreset === 'custom');
  const [fedDimsExpanded, setFedDimsExpanded] = useState(fedPreset === 'custom');

  return (
    <div className="space-y-4">
      {/* ═══ Fiscal Policy Section ═══ */}
      <div className="space-y-3">
        <div>
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#F97316] flex items-center gap-1.5">
            Fiscal Policy
            <InfoTooltip text="How does Congress respond to AI-driven fiscal stress? Select a preset or customize the four fiscal response dimensions: spending/revenue mix, safety net generosity, reaction timing, and adjustment speed." />
          </h2>
          <p className="text-text-muted text-[11px] mt-1">
            Government spending &amp; revenue response
          </p>
        </div>

        <div data-tour-id="fiscal-preset-selector">
          <FiscalPresetSelector />
        </div>

        <button
          onClick={() => setFiscalDimsExpanded(!fiscalDimsExpanded)}
          className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted hover:text-text-secondary transition-colors"
        >
          <svg
            width="8" height="8" viewBox="0 0 8 8" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-200 ${fiscalDimsExpanded ? 'rotate-90' : ''}`}
          >
            <path d="M2.5 1L5.5 4L2.5 7" />
          </svg>
          Customize dimensions
        </button>

        <div data-tour-id="fiscal-dimensions">
          <AnimatePresence initial={false}>
            {fiscalDimsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-3 pt-1">
                  {FISCAL_DIMENSIONS.map((dim) => (
                    <DimensionSlider
                      key={dim.key}
                      config={dim}
                      value={fiscalPositions[dim.key as FiscalDimensionKey]}
                      onChange={(pos) => setFiscalDimension(dim.key as FiscalDimensionKey, pos)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══ Federal Reserve Section ═══ */}
      <div className="space-y-3">
        <div>
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#818CF8] flex items-center gap-1.5">
            Federal Reserve
            <InfoTooltip text="How does the Fed react to AI-driven economic stress? Select a preset or customize the two monetary dimensions: inflation vs employment focus, and bond market operations." />
          </h2>
          <p className="text-text-muted text-[11px] mt-1">
            Monetary policy &amp; dual mandate
          </p>
        </div>

        <FedPresetSelector />

        <button
          onClick={() => setFedDimsExpanded(!fedDimsExpanded)}
          className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted hover:text-text-secondary transition-colors"
        >
          <svg
            width="8" height="8" viewBox="0 0 8 8" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-200 ${fedDimsExpanded ? 'rotate-90' : ''}`}
          >
            <path d="M2.5 1L5.5 4L2.5 7" />
          </svg>
          Customize dimensions
        </button>

        <AnimatePresence initial={false}>
          {fedDimsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-1">
                {FED_DIMENSIONS.map((dim) => (
                  <DimensionSlider
                    key={dim.key}
                    config={dim}
                    value={fedPositions[dim.key as FedDimensionKey]}
                    onChange={(pos) => setFedDimension(dim.key as FedDimensionKey, pos)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Baseline Comparison ═══ */}
      <BaselineComparisonToggle />

      {/* ═══ Override Summary ═══ */}
      {overrideCount > 0 && (
        <div className="flex items-center justify-between px-1 py-1.5 bg-amber-500/10 rounded">
          <span className="text-[9px] font-mono text-amber-400">
            {overrideCount} override{overrideCount > 1 ? 's' : ''} across {overrideYears.size} year{overrideYears.size > 1 ? 's' : ''}
          </span>
          <button
            onClick={() => {
              const confirmed = window.confirm(
                `Clear all ${overrideCount} per-year overrides?`
              );
              if (confirmed) clearParameterOverrides();
            }}
            className="text-[9px] font-mono text-amber-400 hover:text-amber-300 underline"
          >
            Reset all
          </button>
        </div>
      )}
    </div>
  );
}
