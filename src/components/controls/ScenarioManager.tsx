/**
 * ATLAS Scenario Manager
 *
 * Save, load, export, import, and share simulation configurations.
 * Persists named scenarios to localStorage.
 * Supports JSON export/import and compressed URL sharing.
 */

import { useState, useCallback, useRef } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import type { SavedScenario } from '@/types';
import {
  loadScenarios,
  saveScenario,
  deleteScenario,
  exportScenarioJSON,
  importScenarioJSON,
  copyShareLink,
  exportConfigJSON,
} from '@/utils/scenarios';
import { copyFiscalShareLink } from '@/utils/exportTimeline';
import { ScenarioTemplateGallery } from '@/components/controls/ScenarioTemplateGallery';

export function ScenarioManager() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [scenarios, setScenarios] = useState<SavedScenario[]>(() => loadScenarios());
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = useSimulationStore((s) => s.config);
  const parameterOverrides = useSimulationStore((s) => s.parameterOverrides);
  const loadScenarioAction = useSimulationStore((s) => s.loadScenario);

  const showStatus = useCallback((msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 2500);
  }, []);

  const handleSave = useCallback(() => {
    if (!saveName.trim()) return;
    const scenario = saveScenario(saveName.trim(), saveDescription.trim(), config);
    setScenarios(loadScenarios());
    setSaveName('');
    setSaveDescription('');
    setShowSaveForm(false);
    showStatus(`Saved "${scenario.name}"`);
  }, [saveName, saveDescription, config, showStatus]);

  const handleLoad = useCallback(
    (scenario: SavedScenario) => {
      loadScenarioAction(scenario.config);
      showStatus(`Loaded "${scenario.name}"`);
    },
    [loadScenarioAction, showStatus],
  );

  const handleDelete = useCallback(
    (scenario: SavedScenario) => {
      deleteScenario(scenario.id);
      setScenarios(loadScenarios());
      showStatus(`Deleted "${scenario.name}"`);
    },
    [showStatus],
  );

  const handleExport = useCallback(
    (scenario: SavedScenario) => {
      exportScenarioJSON(scenario);
      showStatus('Exported JSON');
    },
    [showStatus],
  );

  const handleExportCurrent = useCallback(() => {
    exportConfigJSON(config, 'Current Configuration');
    showStatus('Exported current config');
  }, [config, showStatus]);

  const handleImport = useCallback(async () => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const scenario = await importScenarioJSON(file);
      if (scenario) {
        // Save imported scenario to localStorage and load it
        const saved = saveScenario(scenario.name, scenario.description, scenario.config);
        setScenarios(loadScenarios());
        loadScenarioAction(saved.config);
        showStatus(`Imported "${saved.name}"`);
      } else {
        showStatus('Invalid scenario file');
      }
      // Reset file input
      e.target.value = '';
    },
    [loadScenarioAction, showStatus],
  );

  const handleShareLink = useCallback(async () => {
    const success = await copyShareLink(config);
    showStatus(success ? 'Link copied to clipboard' : 'Failed to copy link');
  }, [config, showStatus]);

  const handleShareFiscal = useCallback(async () => {
    const profileName = config.fiscalPolicyPreset ?? 'balanced_reduction';
    const success = await copyFiscalShareLink(profileName, parameterOverrides);
    showStatus(success ? 'Fiscal link copied' : 'Failed to copy link');
  }, [config.fiscalPolicyPreset, parameterOverrides, showStatus]);

  return (
    <div className="space-y-2">
      {/* Header / toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full py-1"
      >
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-text-secondary hover:text-text-primary transition-colors">
          Scenarios ({scenarios.length})
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`text-text-muted transition-transform duration-150 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="space-y-3">
          {/* Action buttons row */}
          <div className="flex gap-1.5 flex-wrap">
            <ActionButton
              label="Save"
              onClick={() => setShowSaveForm(!showSaveForm)}
            />
            <ActionButton label="Export" onClick={handleExportCurrent} />
            <ActionButton label="Import" onClick={handleImport} />
            <ActionButton label="Share" onClick={handleShareLink} />
            <ActionButton label="Share Fiscal" onClick={handleShareFiscal} />
            <ActionButton
              label={showTemplates ? 'Hide Templates' : 'Templates'}
              onClick={() => setShowTemplates(!showTemplates)}
            />
          </div>

          {/* Template gallery */}
          <div data-tour-id="scenario-templates">
            {showTemplates && <ScenarioTemplateGallery />}
          </div>

          {/* Hidden file input for import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Save form */}
          {showSaveForm && (
            <div className="space-y-2 bg-bg-elevated border border-border rounded-[8px] p-3">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Scenario name"
                className="w-full bg-bg-card border border-border rounded px-2 py-1.5 text-[11px] font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <input
                type="text"
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full bg-bg-card border border-border rounded px-2 py-1.5 text-[11px] font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <div className="flex gap-1.5">
                <button
                  onClick={handleSave}
                  disabled={!saveName.trim()}
                  className="px-3 py-1 text-[10px] font-mono font-medium uppercase tracking-[0.08em] rounded border border-gold text-gold bg-gold-subtle hover:bg-gold/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowSaveForm(false)}
                  className="px-3 py-1 text-[10px] font-mono font-medium uppercase tracking-[0.08em] rounded border border-border text-text-muted hover:text-text-secondary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Saved scenarios list */}
          {scenarios.length > 0 && (
            <div className="space-y-1">
              {scenarios.map((s) => (
                <ScenarioRow
                  key={s.id}
                  scenario={s}
                  onLoad={handleLoad}
                  onExport={handleExport}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {scenarios.length === 0 && (
            <p className="text-text-muted text-[10px] font-mono">
              No saved scenarios yet.
            </p>
          )}

          {/* Status message */}
          {statusMessage && (
            <div className="text-[10px] font-mono text-gold animate-pulse">
              {statusMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScenarioRow({
  scenario,
  onLoad,
  onExport,
  onDelete,
}: {
  scenario: SavedScenario;
  onLoad: (s: SavedScenario) => void;
  onExport: (s: SavedScenario) => void;
  onDelete: (s: SavedScenario) => void;
}) {
  const date = new Date(scenario.createdAt).toLocaleDateString();

  return (
    <div className="flex items-center gap-2 bg-bg-elevated border border-border rounded-[8px] px-3 py-2 group">
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[11px] text-text-primary truncate">
          {scenario.name}
        </div>
        {scenario.description && (
          <div className="text-[9px] text-text-muted truncate mt-0.5">
            {scenario.description}
          </div>
        )}
        <div className="text-[9px] text-text-muted font-mono mt-0.5">
          {date}
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <SmallButton label="Load" onClick={() => onLoad(scenario)} />
        <SmallButton label="Export" onClick={() => onExport(scenario)} />
        <SmallButton label="Del" onClick={() => onDelete(scenario)} danger />
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 text-[10px] font-mono font-medium uppercase tracking-[0.06em] rounded border border-border text-text-secondary hover:text-text-primary hover:border-border-accent transition-colors"
    >
      {label}
    </button>
  );
}

function SmallButton({
  label,
  onClick,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-1.5 py-0.5 text-[9px] font-mono uppercase rounded border transition-colors ${
        danger
          ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
          : 'border-border text-text-muted hover:text-text-primary'
      }`}
    >
      {label}
    </button>
  );
}
