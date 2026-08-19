/**
 * ATLAS Scenario Manager — the capstone sidebar section (the Scenarios redesign).
 *
 * "What world do you want to test?" — saved COMPLETE worlds (calibration + beliefs +
 * events + policies + overrides). The current-world chip (the document model) shows
 * fresh / unsaved / loaded / modified from the one battery-asserted producer
 * (deriveWorldChipState); one folded list holds the authored worldview bundles and the
 * user's saved worlds; save / export / import (JSON, validated) / reset in the action
 * row. Sharing was removed (local-install only). Persists named worlds to localStorage.
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { getDefaultSimulationConfig } from '@/models/simulation';
import type { SavedScenario } from '@/types';
import {
  loadScenarios,
  saveScenario,
  updateScenario,
  renameScenario,
  deleteScenario,
  exportScenarioJSON,
  importScenarioJSON,
  // copyShareLink, // DEPRECATED (owner order, pre-flight): the Share buttons are removed — the app is local-install only, links have nowhere to resolve
  exportConfigJSON,
} from '@/utils/scenarios';
// import { deriveWorldChipState } from '@/stores/simulationStore'; // DEPRECATED (owner ruling: the chip is always "Test My Own") — the producer stays live in the store for the saved-row radios' machinery and the WC batteries
// import { copyFiscalShareLink } from '@/utils/exportTimeline'; // DEPRECATED (owner order): Share Fiscal removed with Share
// import { DEFAULT_FISCAL_POLICY_PRESET } from '@/models/fiscalResponseProfiles'; // DEPRECATED: only the removed Share Fiscal handler consumed it
// DEPRECATED (owner order, the Scenarios audit): the preloaded template gallery is retired —
// its load path mutated user config in place with no inverse (the audited warp). The
// Templates panel now lists the user's own saved scenarios, loaded via the safe
// full-replacement path.
// import { ScenarioTemplateGallery } from '@/components/controls/ScenarioTemplateGallery';
import { WorldviewBundleGallery } from '@/components/controls/WorldviewBundleGallery';
import { BELIEVE_ZONE_ID } from '@/components/controls/WorldviewSidebar';
// the diff-from-default producer the Advanced grid's scenario summary reads (one
// rendering class for "what this world sets")
import { diffAgainstDefaults } from '@/components/charts/advancedGridRegistry';
import { Reveal } from '@/components/shared/Reveal';

/** The fresh-state call to action (exported for the chip battery's label assert). */
export const TEST_MY_OWN_LABEL = 'Test My Own';
// The data-calibration slot (the AEI program): the registry for the import-time
// snapshot check — an unknown id follows the loud-loss pattern, never a throw.
import { DATA_CALIBRATION_PRESETS } from '@/data/manifests/dataCalibration';
// The per-field rebuild: legacy saves carry bare policy id strings — every load
// boundary normalizes (loud loss on unknown ids/params, never a mid-load throw).
import { normalizePolicyRefs } from '@/models/manifestCompiler';
import { POLICY_MANIFESTS } from '@/data/manifests/policies';

export function ScenarioManager() {
  // Owner-ordered rider (pre-push finalization, 2026-08-07): the Scenarios section opens
  // EXPANDED by default in the left sidebar (was collapsed — invisible on first load).
  const [isExpanded, setIsExpanded] = useState(true);
  const [scenarios, setScenarios] = useState<SavedScenario[]>(() => loadScenarios());
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  // DEPRECATED (the Scenarios redesign): const [showTemplates, setShowTemplates] = useState(false);
  // — the Templates panel retired into the single folded list below.
  const [showImportHelp, setShowImportHelp] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [openSaveId, setOpenSaveId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = useSimulationStore((s) => s.config);
  const parameterOverrides = useSimulationStore((s) => s.parameterOverrides);
  const loadScenarioAction = useSimulationStore((s) => s.loadScenario);
  const composition = useSimulationStore((s) => s.composition);
  const touchedKeys = useSimulationStore((s) => s.touchedKeys);
  const currentWorld = useSimulationStore((s) => s.currentWorld);
  const markWorldLoaded = useSimulationStore((s) => s.markWorldLoaded);
  const resetWorldPreservingData = useSimulationStore((s) => s.resetWorldPreservingData);

  // DEPRECATED (owner ruling — the always-"Test My Own" top bar): the four-state chip
  // render retired; the producer deriveWorldChipState remains exported and battery-
  // asserted in the store. The retired derivation, per no-delete:
  //   const chip = useMemo(
  //     () => deriveWorldChipState({ config, composition, touchedKeys, parameterOverrides, currentWorld }),
  //     [config, composition, touchedKeys, parameterOverrides, currentWorld],
  //   );
  void composition; void touchedKeys; // reason: retained store reads; their consumer was the retired chip derivation

  /** Apply a scenario's COMPLETE composition after its config loads (the bug pass:
   *  saves previously restored the config only — the worldview never traveled). The
   *  data-calibration id (from the composition, or the legacy top-level field on older
   *  saves) keeps the LOUD-LOSS rule: an unavailable snapshot is named in the status
   *  and the slot cleared — never silently dropped, never partially applied. */
  const applyScenarioComposition = useCallback((saved: SavedScenario): string => {
    const comp = saved.composition ?? { axes: {}, events: [], policies: [] };
    const id = comp.dataCalibration ?? saved.dataCalibration ?? null;
    const known = id !== null && DATA_CALIBRATION_PRESETS.some((d) => d.id === id);
    const { setComposition } = useSimulationStore.getState();
    setComposition({
      axes: { ...comp.axes },
      events: [...comp.events],
      // The load-boundary normalizer (the per-field rebuild): legacy saves carry
      // bare id strings; unknown ids/params drop loudly instead of throwing mid-load.
      policies: normalizePolicyRefs(comp.policies, POLICY_MANIFESTS),
      ...(known && id ? { dataCalibration: id } : {}),
    });
    return id !== null && !known
      ? ` — its data snapshot "${id}" is not available in this build; authored defaults apply`
      : '';
  }, []);

  const showStatus = useCallback((msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 2500);
  }, []);

  const handleSave = useCallback(() => {
    if (!saveName.trim()) return;
    const st = useSimulationStore.getState();
    // THE COMPLETE WORLD (the bug pass): config WITH the per-year overrides embedded
    // (loadScenario reads them back from the config), plus the whole composition.
    const worldConfig = { ...st.config, parameterOverrides: { ...st.parameterOverrides } };
    const comp = {
      axes: { ...st.composition.axes },
      events: [...st.composition.events],
      policies: [...st.composition.policies],
      dataCalibration: st.composition.dataCalibration ?? null,
    };
    const name = saveName.trim();
    // Owner ruling: the Save button is the one save path — saving under an EXISTING
    // name overwrites that world (the edit-a-preexisting-world flow), else creates.
    const existing = loadScenarios().find((x) => x.name === name);
    const scenario = existing
      ? updateScenario(existing.id, worldConfig, comp.dataCalibration, comp, st.touchedKeys)!
      : saveScenario(name, saveDescription.trim(), worldConfig, comp.dataCalibration, comp, st.touchedKeys);
    setScenarios(loadScenarios());
    setSaveName('');
    setSaveDescription('');
    setShowSaveForm(false);
    markWorldLoaded({ id: scenario.id, name: scenario.name });
    showStatus(existing ? `Updated "${scenario.name}"` : `Saved "${scenario.name}"`);
  }, [saveName, saveDescription, config, markWorldLoaded, showStatus]);

  /** The chip's "Save changes": overwrite the loaded world in place; a deleted id
   *  degrades to the save-as-new form with the name prefilled. */
  const handleSaveChanges = useCallback(() => {
    if (!currentWorld) return;
    const st = useSimulationStore.getState();
    const updated = updateScenario(
      currentWorld.id,
      { ...st.config, parameterOverrides: { ...st.parameterOverrides } },
      st.composition.dataCalibration ?? null,
      {
        axes: { ...st.composition.axes },
        events: [...st.composition.events],
        policies: [...st.composition.policies],
        dataCalibration: st.composition.dataCalibration ?? null,
      },
      st.touchedKeys);
    if (updated) {
      setScenarios(loadScenarios());
      markWorldLoaded({ id: updated.id, name: updated.name });
      showStatus(`Saved changes to "${updated.name}"`);
    } else {
      setSaveName(currentWorld.name);
      setShowSaveForm(true);
      showStatus('That save no longer exists — saving as new');
    }
  }, [currentWorld, config, markWorldLoaded, showStatus]);

  /** Rename a saved world in place; the chip's name follows WITHOUT re-capturing the
   *  signature (a rename must not launder a modified state into a clean one). */
  const handleRename = useCallback((id: string) => {
    const name = renameValue.trim();
    if (!name || !renameScenario(id, name)) { setRenamingId(null); return; }
    setScenarios(loadScenarios());
    useSimulationStore.setState((st) => ({
      currentWorld: st.currentWorld && st.currentWorld.id === id
        ? { ...st.currentWorld, name }
        : st.currentWorld,
    }));
    setRenamingId(null);
    showStatus(`Renamed to "${name}"`);
  }, [renameValue, showStatus]);

  const handleLoad = useCallback(
    (scenario: SavedScenario) => {
      loadScenarioAction(scenario.config, scenario.touchedKeys);
      const loss = applyScenarioComposition(scenario);
      // the chip: mark AFTER the calibration slot applies, so the captured signature
      // matches the fully-applied state (loaded, not instantly "modified")
      markWorldLoaded({ id: scenario.id, name: scenario.name });
      // Owner bug pass: no load popup — the filled radio and the chip ARE the feedback.
      // The calibration LOUD-LOSS stays loud (the standing rule): status only on loss.
      if (loss) showStatus(`Loaded "${scenario.name}"${loss}`);
    },
    [loadScenarioAction, applyScenarioComposition, markWorldLoaded, showStatus],
  );

  /** Owner ruling: un-clicking the active saved world returns everything to the default
   *  world EXCEPT the data-calibration selection (the same semantics as Test My Own and
   *  the bundle un-click — one reset grammar). */
  const handleUnloadToBaseline = useCallback(() => {
    resetWorldPreservingData();
  }, [resetWorldPreservingData]);

  const handleDelete = useCallback(
    (scenario: SavedScenario) => {
      deleteScenario(scenario.id);
      setScenarios(loadScenarios());
      showStatus(`Deleted "${scenario.name}"`);
    },
    [showStatus],
  );

  // RETIRED (owner refinement): per-row Export — the action row's Export covers the
  // loaded world. Kept per the no-delete rule (the retired ScenarioRow still types it):
  const handleExport = useCallback(
    (scenario: SavedScenario) => {
      exportScenarioJSON(scenario);
      showStatus('Exported JSON');
    },
    [showStatus],
  );
  void handleExport; // reason: consumer retired with the strip-style row

  const handleExportCurrent = useCallback(() => {
    const st = useSimulationStore.getState();
    exportConfigJSON(
      { ...st.config, parameterOverrides: { ...st.parameterOverrides } },
      'Current Configuration',
      {
        axes: { ...st.composition.axes },
        events: [...st.composition.events],
        policies: [...st.composition.policies],
        dataCalibration: st.composition.dataCalibration ?? null,
      },
      st.touchedKeys);
    showStatus('Exported current world');
  }, [showStatus]);

  const handleImport = useCallback(async () => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const scenario = await importScenarioJSON(file);
      if (scenario) {
        // Save imported scenario to localStorage and load it (the data-calibration
        // reference travels; an unknown snapshot id is a loud loss, applied as null)
        const saved = saveScenario(
          scenario.name, scenario.description, scenario.config,
          scenario.dataCalibration ?? null);
        setScenarios(loadScenarios());
        loadScenarioAction(saved.config);
        const loss = applyScenarioComposition(saved);
        markWorldLoaded({ id: saved.id, name: saved.name });
        showStatus(`Imported "${saved.name}"${loss}`);
      } else {
        showStatus('Invalid scenario file');
      }
      // Reset file input
      e.target.value = '';
    },
    [loadScenarioAction, markWorldLoaded, applyScenarioComposition, showStatus],
  );

  // DEPRECATED (owner order, pre-flight): the Share and Share Fiscal buttons are removed —
  // the app is local-install only, so a copied link has nowhere public to resolve. The
  // handlers, kept per the no-delete rule:
  //   const handleShareLink = useCallback(async () => {
  //     const success = await copyShareLink(config);
  //     showStatus(success ? 'Link copied to clipboard' : 'Failed to copy link');
  //   }, [config, showStatus]);
  //   const handleShareFiscal = useCallback(async () => {
  //     const profileName = config.fiscalPolicyPreset ?? DEFAULT_FISCAL_POLICY_PRESET;
  //     const success = await copyFiscalShareLink(profileName, parameterOverrides);
  //     showStatus(success ? 'Fiscal link copied' : 'Failed to copy link');
  //   }, [config.fiscalPolicyPreset, parameterOverrides, showStatus]);
  void parameterOverrides; // reason: retained store read; its only consumer was the removed Share Fiscal handler

  /** THE FULL RESET (owner order, the Scenarios audit): back to the model's original
   *  defaults through the SAFE path — default config via loadScenario (full replacement,
   *  validation, touch set re-derived to empty) plus an empty composition (axes, events,
   *  policies, and the data-calibration slot all cleared). Undoes anything a template or
   *  import left behind, by construction rather than by inverse. */
  const handleResetDefaults = useCallback(() => {
    loadScenarioAction(getDefaultSimulationConfig());
    const { setComposition } = useSimulationStore.getState();
    setComposition({ axes: {}, events: [], policies: [] });
    showStatus('Model reset to original defaults');
  }, [loadScenarioAction, showStatus]);

  return (
    <div className="space-y-2">
      {/* Header / toggle — the Scenarios redesign: the section joins the sidebar's
          question grammar as the capstone species (saved COMPLETE worlds), in the zone
          style, pure white per the prior order. The retired header, per no-delete:
            <span className="font-mono text-[11px] ...">Scenarios ({scenarios.length})</span> */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-end justify-between w-full py-1 gap-2"
      >
        <span className="font-serif text-[13px] tracking-wide uppercase text-white text-left">
          What world do you want to test?
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`text-text-muted transition-transform duration-150 shrink-0 mb-1 ${
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

      {/* THE TOP BAR (owner ruling, the bug pass): ALWAYS "Test My Own" — it never
          transforms. Clicking resets the model to the default world EXCEPT the
          data-calibration selection (the data-trust answer is a separate question), and
          scrolls to the beliefs zone. Saving an edited world goes through the Save
          button (accepted as less obvious). The retired document-model chip states,
          per no-delete (the producer deriveWorldChipState stays live for the saved-row
          radios and the batteries):
            baseline → 'Current: ATLAS baseline'
            unsaved  → 'Current: unsaved world · N changes' + [Save as…]
            loaded   → gold {name}
            modified → gold {name} · modified + [Save] [Save as New] */}
      <button
        onClick={() => {
          resetWorldPreservingData();
          document.getElementById(BELIEVE_ZONE_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        className="w-full rounded-lg border border-gold/40 bg-gold/5 px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-[0.06em] text-gold hover:bg-gold/10 transition-colors"
      >
        {TEST_MY_OWN_LABEL}
      </button>

      {isExpanded && (
        <div className="space-y-3">
          {/* THE ONE LIST (owner-ruled fold): authored worldview bundles first, the user's
              saved worlds beneath — one list, one caption, one load semantics per species.
              Owner bug pass: ONE gap column wraps both blocks so the bundle-to-save gap
              is EXACTLY the within-block gap. */}
          <p className="text-[10px] text-[#8A96AD]">
            Authored worldviews load belief answers; your saves restore the complete world.
          </p>
          <div className="flex flex-col gap-1.5">
            <WorldviewBundleGallery />
            {/* the user's saved worlds — same row grammar (tap loads; the active row's tap
                returns to baseline), GOLD OUTLINE ONLY (owner bug pass: the title follows
                the bundle text colors so saves read distinct without shouting). */}
            {scenarios.map((sc) => (
              <SavedWorldRow
                key={sc.id}
                scenario={sc}
                active={currentWorld?.id === sc.id}
                open={openSaveId === sc.id}
                onToggleOpen={() => setOpenSaveId(openSaveId === sc.id ? null : sc.id)}
                onLoad={handleLoad}
                onUnload={handleUnloadToBaseline}
                renaming={renamingId === sc.id}
                renameValue={renameValue}
                onRenameStart={() => { setRenamingId(sc.id); setRenameValue(sc.name); }}
                onRenameChange={setRenameValue}
                onRenameCommit={() => handleRename(sc.id)}
                onRenameCancel={() => setRenamingId(null)}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Action buttons row. Share / Share Fiscal REMOVED (owner order — local-install
              only; the retired markup is with the deprecated handlers above):
                <ActionButton label="Share" onClick={handleShareLink} />
                <ActionButton label="Share Fiscal" onClick={handleShareFiscal} />
              The Templates button retired with the fold (its list IS this list now). */}
          <div className="flex gap-1.5 flex-wrap">
            <ActionButton
              label="Save"
              onClick={() => setShowSaveForm(!showSaveForm)}
            />
            <ActionButton label="Export" onClick={handleExportCurrent} />
            <ActionButton label="Import" onClick={handleImport} />
            <ActionButton
              label={showImportHelp ? 'Hide Format' : 'Format'}
              onClick={() => setShowImportHelp(!showImportHelp)}
            />
            <ActionButton label="Reset" onClick={handleResetDefaults} danger />
          </div>

          {/* Import format explainer (owner order: Import is useless without it) */}
          {showImportHelp && (
            <div className="bg-bg-elevated border border-border rounded-[8px] p-3 space-y-1.5">
              <p className="text-[10px] text-text-secondary leading-relaxed">
                Import accepts JSON files that Export produces: a single object with a{' '}
                <span className="font-mono">name</span>, an optional{' '}
                <span className="font-mono">description</span>, and a{' '}
                <span className="font-mono">config</span> holding every simulation
                parameter, plus the world&apos;s selections (worldview answers, events,
                policy packages, and the data-source choice). The dependable route is
                round-tripping — set the model up, press Export, edit values in the
                downloaded file, then Import it back.
              </p>
              <p className="text-[10px] text-text-muted leading-relaxed">
                Files that are not JSON or lack that shape are rejected without touching
                the model. Inside an accepted file, any parameter that is missing,
                out of range, or not a number falls back to the model default when loaded.
              </p>
            </div>
          )}

          {/* Templates (owner order, the Scenarios audit): the PRELOADED gallery is retired —
              its load path mutated user configuration in place with no way back. Templates
              now hold only what the user has saved, loaded via the same safe
              full-replacement path as the list below. Retired mount, per no-delete:
                <div data-tour-id="scenario-templates">
                  {showTemplates && <ScenarioTemplateGallery />}
                </div> */}
          {/* RETIRED (the Scenarios redesign fold): the interim "Your Templates" panel —
              superseded by the single list above (same items, same safe load path). */}

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

          {/* RETIRED (the Scenarios redesign fold): the separate saved-scenarios list —
              the rows render in the single list above, beneath the authored bundles. */}
          {scenarios.length === 0 && (
            <p className="text-text-muted text-[10px] font-mono">
              No saved worlds yet — the chip above offers a save whenever the world diverges.
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

/** The saved-world row (owner refinement): the bundle grammar in gold. Tap = load;
 *  "more" reveals description → rename/delete → the variable list (diff-from-default,
 *  capped at 8 rows with a "+K more" line — the density account in the stage report). */
function SavedWorldRow({
  scenario, active, open, onToggleOpen, onLoad, onUnload,
  renaming, renameValue, onRenameStart, onRenameChange, onRenameCommit, onRenameCancel,
  onDelete,
}: {
  scenario: SavedScenario;
  /** this save is the current world (loaded or modified) — the filled radio */
  active: boolean;
  open: boolean;
  onToggleOpen: () => void;
  onLoad: (s: SavedScenario) => void;
  /** owner ruling: tapping the active row returns everything to the default world */
  onUnload: () => void;
  renaming: boolean;
  renameValue: string;
  onRenameStart: () => void;
  onRenameChange: (v: string) => void;
  onRenameCommit: () => void;
  onRenameCancel: () => void;
  onDelete: (s: SavedScenario) => void;
}) {
  const diff = useMemo(() => diffAgainstDefaults(scenario.config), [scenario.config]);
  const DIFF_CAP = 8;
  return (
    // Owner bug pass: GOLD OUTLINE ONLY marks user-created; everything else follows the
    // bundle row design (background, hover, text colors, active gold title + fill).
    <div className={`rounded-lg border px-3 py-2 border-[#D4A03C]/40 ${active ? 'bg-[#D4A03C]/5' : 'bg-[#0C1424]'} hover:border-[#D4A03C]/70`}>
      <div className="flex items-end justify-between gap-2">
        <button onClick={() => (active ? onUnload() : onLoad(scenario))} className="flex-1 min-w-0 text-left text-[11px]/[1.3]">
          <span className={`font-medium block truncate ${active ? 'text-[#D4A03C]' : 'text-[#E8ECF4]'}`} title={scenario.name}>
            {active ? '● ' : '○ '}{scenario.name}
          </span>
        </button>
        <button onClick={onToggleOpen}
          className="text-[9px] font-mono text-[#8A96AD] hover:text-[#E8ECF4] shrink-0">
          {open ? 'less' : 'more'}
        </button>
      </div>
      <Reveal open={open}>
        {scenario.description && (
          <p className="text-[10px] leading-relaxed text-[#8A96AD] mt-1">{scenario.description}</p>
        )}
        {renaming ? (
          <div className="flex items-center gap-1.5 mt-1.5">
            <input
              type="text" value={renameValue} autoFocus
              onChange={(e) => onRenameChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onRenameCommit(); if (e.key === 'Escape') onRenameCancel(); }}
              className="flex-1 min-w-0 bg-bg-card border border-border rounded px-2 py-1 text-[11px] font-mono text-text-primary focus:outline-none focus:border-gold"
            />
            <SmallButton label="OK" onClick={onRenameCommit} />
            <SmallButton label="Esc" onClick={onRenameCancel} />
          </div>
        ) : (
          <div className="flex gap-1.5 mt-1.5">
            <SmallButton label="Rename" onClick={onRenameStart} />
            <SmallButton label="Delete" onClick={() => onDelete(scenario)} danger />
          </div>
        )}
        <div className="flex flex-col gap-0.5 mt-1.5">
          {diff.slice(0, DIFF_CAP).map(({ entry, value }) => (
            <div key={entry.row.key} className="flex items-baseline justify-between gap-2">
              <span className="text-[9px] text-[#8A96AD] truncate">{entry.row.title}</span>
              <span className="text-[9px] font-mono text-[#E8ECF4] shrink-0">{String(value)}</span>
            </div>
          ))}
          {diff.length > DIFF_CAP && (
            <span className="text-[9px] text-[#8A96AD]">+{diff.length - DIFF_CAP} more in the Advanced tab</span>
          )}
          {diff.length === 0 && (
            <span className="text-[9px] text-[#8A96AD]">Sets nothing beyond the defaults.</span>
          )}
        </div>
      </Reveal>
    </div>
  );
}

/** RETIRED (owner refinement — the bundle-grammar fold): the strip-style row. Kept per
 *  the no-delete rule. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ScenarioRow({
  scenario,
  onLoad,
  onRename,
  onExport,
  onDelete,
}: {
  scenario: SavedScenario;
  onLoad: (s: SavedScenario) => void;
  onRename: (s: SavedScenario) => void;
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
        <SmallButton label="Ren" onClick={() => onRename(scenario)} />
        <SmallButton label="Export" onClick={() => onExport(scenario)} />
        <SmallButton label="Del" onClick={() => onDelete(scenario)} danger />
      </div>
    </div>
  );
}

function ChipButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="px-1.5 py-px text-[8px] font-mono uppercase tracking-[0.04em] rounded border border-gold/40 text-gold hover:bg-gold/10 transition-colors shrink-0"
    >
      {label}
    </button>
  );
}

function ActionButton({
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
      className={`px-2.5 py-1 text-[10px] font-mono font-medium uppercase tracking-[0.06em] rounded border transition-colors ${
        danger
          ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
          : 'border-border text-text-secondary hover:text-text-primary hover:border-border-accent'
      }`}
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
