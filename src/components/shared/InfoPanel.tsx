/**
 * ATLAS Info Panel
 *
 * Expandable panel that displays a description and a bullet list
 * of parameter groups contained within a section. Used in the
 * ControlsPanel to give users more context about each section.
 *
 * Features:
 * - Toggles between collapsed (icon + summary) and expanded (full list)
 * - Uses the section's accent color for the info icon
 * - Compact styling consistent with sidebar constraints
 */

import { useState } from 'react';

interface InfoPanelProps {
  /** Brief one-line description */
  summary: string;
  /** Detailed items to show when expanded */
  items?: string[];
  /** Accent color for the icon */
  color?: string;
}

export function InfoPanel({ summary, items, color = '#D4A03C' }: InfoPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded border border-border/50 bg-bg-elevated/50 px-2.5 py-1.5">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-start gap-2 w-full text-left group"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="mt-0.5 flex-shrink-0"
          style={{ color }}
        >
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
          <path
            d="M6 3.5V3.5M6 5V9"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-[10px] text-text-muted leading-relaxed">
          {summary}
        </span>
        {items && items.length > 0 && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            className={`mt-0.5 ml-auto flex-shrink-0 transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
          >
            <path
              d="M2.5 4L5 6.5L7.5 4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-text-muted group-hover:text-text-secondary"
            />
          </svg>
        )}
      </button>
      {expanded && items && items.length > 0 && (
        <ul className="mt-1.5 pl-5 space-y-0.5">
          {items.map((item, i) => (
            <li key={i} className="text-[9px] text-text-muted leading-relaxed list-disc">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
