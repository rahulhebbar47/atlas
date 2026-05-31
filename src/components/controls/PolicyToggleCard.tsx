/**
 * ATLAS Policy Toggle Card (Phase 5)
 *
 * Reusable expand/collapse card for individual policies.
 * - Header: toggle switch + policy name + one-line value summary
 * - Expandable body: policy-specific sliders
 * - Left border accent color by channel (wage=blue, asset=green, transfer=amber)
 * Follows BFCSRoleEditor expand/collapse pattern.
 */

import { useState, useCallback, type ReactNode } from 'react';

interface PolicyToggleCardProps {
  label: string;
  summary: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  accentColor: string;
  children: ReactNode;
}

export function PolicyToggleCard({
  label,
  summary,
  enabled,
  onToggle,
  accentColor,
  children,
}: PolicyToggleCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    onToggle(!enabled);
  }, [enabled, onToggle]);

  const handleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <div
      className="border border-border rounded-[10px] overflow-hidden"
      style={{ borderLeftWidth: 3, borderLeftColor: enabled ? accentColor : 'transparent' }}
    >
      {/* Header — always visible */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none hover:bg-bg-elevated/50 transition-colors"
        onClick={handleExpand}
      >
        {/* Toggle switch */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          className={`
            relative w-7 h-4 rounded-full transition-colors flex-shrink-0
            ${enabled ? 'bg-gold/30' : 'bg-bg-elevated'}
          `}
        >
          <span
            className={`
              absolute top-0.5 w-3 h-3 rounded-full transition-all
              ${enabled ? 'left-3.5 bg-gold' : 'left-0.5 bg-text-muted'}
            `}
          />
        </button>

        {/* Label + summary */}
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] font-medium text-text-primary truncate">
            {label}
          </div>
          <div className="font-mono text-[9px] text-text-muted truncate">
            {summary}
          </div>
        </div>

        {/* Expand chevron */}
        <svg
          className={`w-3 h-3 text-text-muted flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 4.5L6 7.5L9 4.5" />
        </svg>
      </div>

      {/* Expandable body */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}
