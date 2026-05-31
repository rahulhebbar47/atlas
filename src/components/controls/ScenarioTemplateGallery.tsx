/**
 * ATLAS Phase 8d: Scenario Template Gallery
 *
 * Displays pre-built scenario templates as cards that users can
 * browse and load. Loading a template sets the fiscal profile
 * and applies parameter overrides.
 */

import { useState, useCallback } from 'react';
import { SCENARIO_TEMPLATES, type ScenarioTemplate } from '@/data/scenarioTemplates';
import { useSimulationStore } from '@/stores/simulationStore';

// ============================================================
// Tag colors
// ============================================================

const TAG_COLORS: Record<string, string> = {
  baseline: '#6B7280',
  moderate: '#60A5FA',
  progressive: '#10B981',
  conservative: '#F97316',
  ubi: '#A78BFA',
  'high-tax': '#EAB308',
  austerity: '#EF4444',
  monetary: '#6366F1',
  accommodation: '#6366F1',
  'stress-test': '#EF4444',
  technology: '#22D3EE',
  extreme: '#EF4444',
  gradual: '#22C55E',
  swf: '#3B82F6',
};

// ============================================================
// Component
// ============================================================

export function ScenarioTemplateGallery() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const setFiscalPolicyPreset = useSimulationStore((s) => s.setFiscalPolicyPreset);
  const setParameterOverride = useSimulationStore((s) => s.setParameterOverride);
  const clearParameterOverrides = useSimulationStore((s) => s.clearParameterOverrides);
  const updateConfig = useSimulationStore((s) => s.updateConfig);

  const handleLoadTemplate = useCallback((template: ScenarioTemplate) => {
    // 1. Clear existing overrides
    clearParameterOverrides();

    // 2. Set fiscal response profile
    setFiscalPolicyPreset(template.fiscalProfile);

    // 3. Apply config overrides (if any, excluding undefined values)
    if (template.configOverrides) {
      updateConfig((config) => {
        const overrides = template.configOverrides!;
        const merged = { ...config };
        for (const [key, value] of Object.entries(overrides)) {
          if (value !== undefined) {
            (merged as Record<string, unknown>)[key] = value;
          }
        }
        return merged;
      });
    }

    // 4. Apply parameter overrides
    for (const [key, value] of Object.entries(template.parameterOverrides)) {
      const colonIdx = key.lastIndexOf(':');
      if (colonIdx >= 0) {
        const paramKey = key.slice(0, colonIdx);
        const year = parseInt(key.slice(colonIdx + 1), 10);
        if (!isNaN(year)) {
          setParameterOverride(paramKey, year, value);
        }
      }
    }

    setStatusMessage(`Loaded: ${template.name}`);
    setTimeout(() => setStatusMessage(null), 2500);
  }, [clearParameterOverrides, setFiscalPolicyPreset, setParameterOverride, updateConfig]);

  return (
    <div className="space-y-3">
      <h4 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
        Scenario Templates
      </h4>

      {statusMessage && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-[8px] px-3 py-1.5 text-[11px] font-mono text-green-400">
          {statusMessage}
        </div>
      )}

      <div className="space-y-2">
        {SCENARIO_TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onLoad={handleLoadTemplate}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Template Card
// ============================================================

function TemplateCard({
  template,
  onLoad,
}: {
  template: ScenarioTemplate;
  onLoad: (t: ScenarioTemplate) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-bg-card border border-border rounded-[10px] p-3 transition-colors hover:border-text-muted/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[12px] font-semibold text-text-primary hover:text-gold transition-colors text-left"
          >
            {template.name}
          </button>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-mono uppercase"
                style={{
                  color: TAG_COLORS[tag] ?? '#6B7280',
                  background: `${TAG_COLORS[tag] ?? '#6B7280'}15`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => onLoad(template)}
          className="px-2.5 py-1 rounded-[6px] bg-gold/10 text-gold text-[10px] font-mono font-semibold hover:bg-gold/20 transition-colors flex-shrink-0"
        >
          Load
        </button>
      </div>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <p className="text-[11px] text-text-secondary leading-relaxed">
            {template.description}
          </p>
          <p className="text-[11px] text-text-muted italic mt-1.5">
            {template.analyticalQuestion}
          </p>
          {Object.keys(template.parameterOverrides).length > 0 && (
            <p className="text-[10px] font-mono text-text-muted mt-1">
              {Object.keys(template.parameterOverrides).length} parameter override{Object.keys(template.parameterOverrides).length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
