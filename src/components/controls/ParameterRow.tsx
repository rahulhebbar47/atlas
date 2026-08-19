/**
 * ATLAS Phase 8c: Parameter Row
 *
 * Displays a single parameter from YearParameters with provenance coloring
 * and inline editing for user overrides.
 *
 * Three visual states:
 *   - Baseline (gray):  param unchanged from config slider value
 *   - Autopilot (blue): param adjusted by fiscal response profile rules
 *   - Override (orange): param explicitly overridden by user for this year
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSimulationStore, eventOriginAt } from '@/stores/simulationStore';
import type { ParameterValue } from '@/types';
import { formatParamValue, isReadOnlyParam, isBooleanParam } from '@/utils/parameterFormatter';

interface ParameterRowProps {
  label: string;
  paramKey: string;
  value: ParameterValue;
  year: number;
}

export function ParameterRow({ label, paramKey, value, year }: ParameterRowProps) {
  const setParameterOverride = useSimulationStore((s) => s.setParameterOverride);
  const removeParameterOverride = useSimulationStore((s) => s.removeParameterOverride);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const readOnly = isReadOnlyParam(paramKey);
  const isBoolean = isBooleanParam(paramKey);

  // Source-based styling (R1: the provenance union — the charter invariant).
  // 'axis-variant' / 'event' / 'imported' become producible at R2; styled now so the
  // badge system is complete when the manifest compiler lands. 'data-calibration'
  // (the AEI program) is type-level in v1 — the shipped preset writes no per-year
  // scalar; styled for the species' structural completeness.
  const sourceConfig = {
    'default': { dotColor: 'bg-text-muted', textColor: 'text-text-muted', label: 'default' },
    'policy': { dotColor: 'bg-blue-400', textColor: 'text-blue-400', label: 'policy' },
    'axis-variant': { dotColor: 'bg-cyan-400', textColor: 'text-cyan-400', label: 'axis' },
    'event': { dotColor: 'bg-orange-400', textColor: 'text-orange-400', label: 'event' },
    'user-override': { dotColor: 'bg-amber-400', textColor: 'text-amber-400', label: 'override' },
    'imported': { dotColor: 'bg-amber-600', textColor: 'text-amber-600', label: 'imported' },
    'data-calibration': { dotColor: 'bg-emerald-400', textColor: 'text-emerald-400', label: 'data' },
  }[value.source];

  const startEditing = useCallback(() => {
    if (readOnly) return;
    if (isBoolean) {
      // Toggle boolean params directly
      const newVal = value.effective >= 0.5 ? 0 : 1;
      setParameterOverride(paramKey, year, newVal);
      return;
    }
    setEditValue(String(value.effective));
    setIsEditing(true);
  }, [readOnly, isBoolean, value.effective, paramKey, year, setParameterOverride]);

  const saveEdit = useCallback(() => {
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed)) {
      setParameterOverride(paramKey, year, parsed);
    }
    setIsEditing(false);
  }, [editValue, paramKey, year, setParameterOverride]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  }, [saveEdit, cancelEdit]);

  const handleReset = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    removeParameterOverride(paramKey, year);
  }, [removeParameterOverride, paramKey, year]);

  // Auto-focus input when editing
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <div className="group">
      {/* Main row */}
      <div
        className={`flex items-center gap-1.5 py-1 px-1 rounded transition-colors ${
          readOnly ? '' : 'cursor-pointer hover:bg-bg-elevated'
        }`}
        onClick={() => {
          if (!isEditing) setIsExpanded(!isExpanded);
        }}
      >
        {/* Source dot */}
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sourceConfig.dotColor}`} />

        {/* Label */}
        <span className="text-[10px] font-mono text-text-secondary flex-1 truncate">
          {label}
        </span>

        {/* R3b: the event-origin chip — WHICH event set this key-year (the owner's
            linkage requirement rendered by provenance; source 'event' is the truth,
            this names it) */}
        {value.source === 'event' && (
          <span className="text-[8px] font-mono text-orange-400 border border-orange-400/30 rounded px-1 truncate max-w-[90px]"
            title={`set by event: ${eventOriginAt(paramKey, year) ?? 'event'}`}>
            {eventOriginAt(paramKey, year) ?? 'event'}
          </span>
        )}

        {/* Value display or edit input */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={saveEdit}
            className="w-16 px-1 py-0.5 text-[10px] font-mono text-right bg-bg-card border border-gold rounded focus:outline-none"
            step="any"
          />
        ) : (
          <span
            className={`text-[10px] font-mono font-medium ${sourceConfig.textColor} ${
              readOnly ? '' : 'cursor-pointer'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              startEditing();
            }}
          >
            {formatParamValue(value.effective, paramKey)}
          </span>
        )}

        {/* Reset button (only for overrides) */}
        {(value.source === 'user-override' || value.source === 'imported') && !isEditing && (
          <button
            onClick={handleReset}
            className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-opacity p-0.5"
            title="Remove override"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 1L7 7M7 1L1 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="ml-3 pl-2 border-l border-border/50 py-1 space-y-0.5">
          <DetailLine label="Baseline" value={formatParamValue(value.baseline, paramKey)} color="text-text-muted" />
          {value.autopilot !== value.baseline && (
            <DetailLine
              label="Autopilot"
              value={formatParamValue(value.autopilot, paramKey)}
              color="text-blue-400"
              explanation={value.explanation}
            />
          )}
          {value.userOverride !== undefined && (
            <DetailLine
              label="Override"
              value={formatParamValue(value.userOverride, paramKey)}
              color="text-amber-400"
            />
          )}
        </div>
      )}
    </div>
  );
}

function DetailLine({
  label,
  value,
  color,
  explanation,
}: {
  label: string;
  value: string;
  color: string;
  explanation?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1">
        <span className="text-[9px] font-mono text-text-muted w-14">{label}:</span>
        <span className={`text-[9px] font-mono font-medium ${color}`}>{value}</span>
      </div>
      {explanation && (
        <p className="text-[8px] text-text-muted leading-tight mt-0.5 ml-14">
          {explanation}
        </p>
      )}
    </div>
  );
}
