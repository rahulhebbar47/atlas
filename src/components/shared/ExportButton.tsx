/**
 * ATLAS Export Button
 *
 * Reusable dropdown button for exporting data as CSV or chart as PNG.
 * Integrates with the export utility functions.
 */

import { useState, useRef, useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import {
  generateMacroCSV,
  generateClusterCSV,
  generateStateCSV,
  downloadCSV,
  exportElementAsPNG,
} from '@/utils/export';
import { generateParameterTimelineCSV, downloadText } from '@/utils/exportTimeline';

interface ExportButtonProps {
  /** Optional ref to a DOM element for PNG export */
  chartRef?: React.RefObject<HTMLElement | null>;
  /** Which CSV types to offer (defaults to all) */
  csvTypes?: Array<'macro' | 'clusters' | 'states'>;
  /** Show parameter timeline CSV export option */
  showParameterTimeline?: boolean;
  /** Compact mode: single icon button with dropdown */
  compact?: boolean;
}

export function ExportButton({
  chartRef,
  csvTypes = ['macro', 'clusters', 'states'],
  showParameterTimeline = false,
  compact = false,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeline = useSimulationStore((s) => s.timeline);

  const handleCSVExport = useCallback((type: 'macro' | 'clusters' | 'states') => {
    const timestamp = new Date().toISOString().slice(0, 10);
    let csv: string;
    let filename: string;

    switch (type) {
      case 'macro':
        csv = generateMacroCSV(timeline);
        filename = `atlas-macro-${timestamp}.csv`;
        break;
      case 'clusters':
        csv = generateClusterCSV(timeline);
        filename = `atlas-clusters-${timestamp}.csv`;
        break;
      case 'states':
        csv = generateStateCSV(timeline);
        filename = `atlas-states-${timestamp}.csv`;
        break;
    }

    downloadCSV(csv, filename);
    setIsOpen(false);
  }, [timeline]);

  const handleParameterTimelineExport = useCallback(() => {
    const paramTimeline = timeline.parameterTimeline;
    if (!paramTimeline || paramTimeline.size === 0) return;

    const firstYear = Array.from(paramTimeline.values())[0];
    const profileName = firstYear?.profileName ?? 'unknown';
    const csv = generateParameterTimelineCSV(paramTimeline, profileName);
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadText(csv, `atlas-parameter-timeline-${timestamp}.csv`, 'text/csv');
    setIsOpen(false);
  }, [timeline]);

  const handlePNGExport = useCallback(async () => {
    if (!chartRef?.current) return;
    const timestamp = new Date().toISOString().slice(0, 10);
    await exportElementAsPNG(chartRef.current, `atlas-chart-${timestamp}.png`);
    setIsOpen(false);
  }, [chartRef]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 transition-colors ${
          compact
            ? 'p-1.5 rounded-md text-text-muted hover:text-gold hover:bg-gold/10'
            : 'px-3 py-1.5 rounded-md text-[11px] font-mono bg-bg-elevated text-text-muted border border-border hover:text-gold hover:border-gold/30'
        }`}
        aria-label="Export data"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M7 2v7m0 0l2.5-2.5M7 9L4.5 6.5M2.5 11.5h9"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {!compact && 'Export'}
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close on outside click */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 top-full mt-1 z-50 bg-bg-card border border-border rounded-[8px] py-1 min-w-[180px]"
            role="menu"
          >
            {csvTypes.includes('macro') && (
              <ExportMenuItem
                label="Macro Timeline CSV"
                onClick={() => handleCSVExport('macro')}
              />
            )}
            {csvTypes.includes('clusters') && (
              <ExportMenuItem
                label="Cluster Data CSV"
                onClick={() => handleCSVExport('clusters')}
              />
            )}
            {csvTypes.includes('states') && (
              <ExportMenuItem
                label="State Data CSV"
                onClick={() => handleCSVExport('states')}
              />
            )}
            {showParameterTimeline && (
              <>
                <div className="border-t border-border/50 my-1" />
                <ExportMenuItem
                  label="Parameter Timeline CSV"
                  onClick={handleParameterTimelineExport}
                />
              </>
            )}
            {chartRef && (
              <>
                <div className="border-t border-border/50 my-1" />
                <ExportMenuItem
                  label="Export as PNG"
                  onClick={handlePNGExport}
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ExportMenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-1.5 text-[11px] font-mono text-text-secondary hover:text-gold hover:bg-gold/5 transition-colors"
      role="menuitem"
    >
      {label}
    </button>
  );
}
