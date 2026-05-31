/**
 * ATLAS Navigation Header
 *
 * Top bar with logo, navigation tabs, and panel toggle controls.
 * Matches the landing page nav style: mono logo with gold dot,
 * backdrop blur, subtle border.
 *
 * CSV Import/Export buttons:
 * - Import CSV: uploads a two-column parameter CSV → updates all simulation inputs
 * - Export Settings CSV: exports current config as a two-column parameter CSV
 * - Export Results CSV: exports full simulation results as a wide-format 270-column CSV
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { ExportButton } from '@/components/shared/ExportButton';
import { exportConfigToParameterCSV } from '@/utils/csvImport';
import { downloadResultsCSV } from '@/utils/csvExport';
import { downloadCSV } from '@/utils/export';
import type { DashboardView } from '@/types';

const NAV_TABS: Array<{ label: string; view: DashboardView }> = [
  { label: 'Overview', view: 'overview' },
  { label: 'Occupations', view: 'occupations' },
  { label: 'Policy', view: 'policy' },
  { label: 'Fiscal', view: 'fiscal' },
  { label: 'Economics', view: 'economics' },
  { label: 'Monetary', view: 'monetary' },
  { label: 'Methodology', view: 'methodology' },
  { label: 'Predictions', view: 'predictions' },
];

export function Header() {
  const controlsPanelOpen = useSimulationStore((s) => s.controlsPanelOpen);
  const insightsPanelOpen = useSimulationStore((s) => s.insightsPanelOpen);
  const setControlsPanelOpen = useSimulationStore((s) => s.setControlsPanelOpen);
  const setInsightsPanelOpen = useSimulationStore((s) => s.setInsightsPanelOpen);
  const activeView = useSimulationStore((s) => s.activeView);
  const setActiveView = useSimulationStore((s) => s.setActiveView);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'warning' | 'error') => {
    setToast({ message, type });
  }, []);

  return (
    <>
      <header className="flex items-center justify-between h-[56px] px-5 bg-bg-void/85 backdrop-blur-[20px] border-b border-border flex-shrink-0 z-50 overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <div className="font-mono text-[15px] font-semibold tracking-[0.15em] text-text-primary">
            ATLAS<span className="text-gold">.</span>
          </div>

          {/* Navigation tabs */}
          <nav className="flex items-center gap-1" aria-label="Dashboard views">
            {NAV_TABS.map((tab) => (
              <NavTab
                key={tab.view}
                label={tab.label}
                active={activeView === tab.view}
                onClick={() => setActiveView(tab.view)}
              />
            ))}
          </nav>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <ExportSettingsCSVButton />
          <ExportResultsCSVButton />
          <ExportButton compact />
          <PresentButton />
          <PanelToggle
            label="Controls"
            isOpen={controlsPanelOpen}
            onToggle={() => setControlsPanelOpen(!controlsPanelOpen)}
          />
          <PanelToggle
            label="Insights"
            isOpen={insightsPanelOpen}
            onToggle={() => setInsightsPanelOpen(!insightsPanelOpen)}
            flipIcon
          />
        </div>
      </header>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </>
  );
}

function NavTab({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[12px] font-medium tracking-[0.05em] uppercase transition-colors duration-150 rounded-md ${
        active
          ? 'text-text-primary bg-bg-elevated'
          : 'text-text-muted hover:text-text-secondary'
      }`}
      role="tab"
      aria-selected={active}
      aria-label={`${label} view`}
    >
      {label}
    </button>
  );
}

function PresentButton() {
  const togglePresentationMode = useSimulationStore((s) => s.togglePresentationMode);

  return (
    <button
      onClick={togglePresentationMode}
      className="p-1.5 text-text-muted hover:text-gold transition-colors duration-150"
      title="Enter Presentation Mode"
    >
      <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
        <rect
          x="1"
          y="2"
          width="12"
          height="8"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M5 12H9"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M7 10V12"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M5.5 5L9 7L5.5 9V5Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}

function DataFreshnessBadge() {
  const blsMetadata = useSimulationStore((s) => s.blsMetadata);
  const blsDataError = useSimulationStore((s) => s.blsDataError);
  const blsDataLoaded = useSimulationStore((s) => s.blsDataLoaded);

  if (blsDataError) {
    return (
      <div
        className="text-[10px] font-mono text-red-400 px-2 py-1 border border-red-500/30 rounded"
        title={blsDataError}
      >
        BLS data missing
      </div>
    );
  }

  if (!blsDataLoaded || !blsMetadata) return null;

  const fetchDate = new Date(blsMetadata.fetchedAt).toLocaleDateString();

  return (
    <div
      className="text-[10px] font-mono text-text-muted px-2 py-1 border border-border rounded cursor-default"
      title={`2025 baseline: actual BEA/BLS/FRED data. 2026+ are model projections.\n\nSource: ${blsMetadata.source}\nFetched: ${blsMetadata.fetchedAt}\n${blsMetadata.clusterCount} clusters, ${blsMetadata.totalSeriesFetched} series\n${blsMetadata.notes}`}
    >
      Data: BLS OEWS {blsMetadata.endYear} · {fetchDate}
    </div>
  );
}

function ImportCSVButton({ onToast }: { onToast: (message: string, type: 'success' | 'warning' | 'error') => void }) {
  const importCSVConfig = useSimulationStore((s) => s.importCSVConfig);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const csvString = reader.result as string;
        const { importedCount, warnings } = importCSVConfig(csvString);

        if (warnings.length > 0) {
          onToast(
            `Imported ${importedCount} parameters with ${warnings.length} warning${warnings.length > 1 ? 's' : ''}: ${warnings.slice(0, 3).join('; ')}${warnings.length > 3 ? '...' : ''}`,
            'warning',
          );
        } else {
          onToast(`Imported ${importedCount} parameters. Simulation updated.`, 'success');
        }
      } catch (err) {
        onToast(`Failed to parse CSV: ${err instanceof Error ? err.message : String(err)}`, 'error');
      }
    };
    reader.onerror = () => {
      onToast('Failed to read file.', 'error');
    };
    reader.readAsText(file);

    // Reset the input so the same file can be re-imported
    e.target.value = '';
  }, [importCSVConfig, onToast]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-medium uppercase tracking-[0.08em] rounded-md border border-border text-text-muted hover:text-gold hover:border-gold/40 transition-all duration-150"
        title="Import parameter CSV to update simulation inputs"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M4 5L7 2L10 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 10V11.5C2 11.776 2.224 12 2.5 12H11.5C11.776 12 12 11.776 12 11.5V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        Import CSV
      </button>
    </>
  );
}

function ExportSettingsCSVButton() {
  const config = useSimulationStore((s) => s.config);

  const handleClick = useCallback(() => {
    const csv = exportConfigToParameterCSV(config);
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadCSV(csv, `atlas-settings-${timestamp}.csv`);
  }, [config]);

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-medium uppercase tracking-[0.08em] rounded-md border border-border text-text-muted hover:text-gold hover:border-gold/40 transition-all duration-150"
      title="Export current settings as parameter CSV"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5 4H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M5 7H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M5 10H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      Export Configuration
    </button>
  );
}

function ExportResultsCSVButton() {
  const timeline = useSimulationStore((s) => s.timeline);

  const handleClick = useCallback(() => {
    downloadResultsCSV(timeline);
  }, [timeline]);

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-medium uppercase tracking-[0.08em] rounded-md border border-border text-text-muted hover:text-gold hover:border-gold/40 transition-all duration-150"
      title="Export full simulation results as 270-column CSV"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 2V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M4 7L7 10L10 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 11V11.5C2 11.776 2.224 12 2.5 12H11.5C11.776 12 12 11.776 12 11.5V11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      Export Results
    </button>
  );
}

function Toast({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: 'success' | 'warning' | 'error';
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const borderColor =
    type === 'success'
      ? 'border-green-500/60'
      : type === 'warning'
        ? 'border-gold/60'
        : 'border-red-500/60';

  return (
    <div
      className={`fixed top-[64px] left-1/2 -translate-x-1/2 z-[60] max-w-[600px] px-4 py-2.5 rounded-md border ${borderColor} bg-bg-card/95 backdrop-blur-sm text-[11px] font-mono text-text-secondary shadow-lg`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-2">
        <span className="flex-1 break-words">{message}</span>
        <button
          onClick={onDismiss}
          className="text-text-muted hover:text-text-primary ml-2 flex-shrink-0"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function PanelToggle({
  label,
  isOpen,
  onToggle,
  flipIcon = false,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  flipIcon?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-medium uppercase tracking-[0.08em] rounded-md border transition-all duration-150 ${
        isOpen
          ? 'border-border-accent text-gold bg-gold-subtle'
          : 'border-border text-text-muted hover:text-text-secondary hover:border-border-accent'
      }`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className={`transition-transform duration-150 ${(flipIcon ? !isOpen : isOpen) ? 'rotate-180' : ''}`}
      >
        <rect
          x="1"
          y="1"
          width="5"
          height="12"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.2"
          fill={isOpen ? 'currentColor' : 'none'}
          opacity={isOpen ? 0.3 : 1}
        />
        <rect
          x="8"
          y="1"
          width="5"
          height="12"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
      {label}
    </button>
  );
}
