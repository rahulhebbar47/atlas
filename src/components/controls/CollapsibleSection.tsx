/**
 * ATLAS Phase 8c: Collapsible Section
 *
 * Animated accordion wrapper for sidebar sections.
 * Uses Framer Motion for height animation (0.3s per DESIGN_PHILOSOPHY.md).
 */

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen: boolean;
  children: ReactNode;
  /** Optional badge (e.g., override count). */
  badge?: string | number;
  /** Accent color for the header text (hex string). */
  color?: string;
  /** Whether this is a top-level (larger) section or nested (smaller). */
  level?: 'top' | 'nested';
}

export function CollapsibleSection({
  title,
  defaultOpen,
  children,
  badge,
  color,
  level = 'top',
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const headerStyle = level === 'top'
    ? 'text-[12px] font-semibold tracking-[0.10em]'
    : 'text-[11px] font-medium tracking-[0.12em]';

  return (
    <div className={level === 'top' ? 'border-t border-border pt-4' : ''}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-1.5 py-1 group cursor-pointer"
      >
        {/* Chevron */}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke={color ?? 'currentColor'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`}
        >
          <path d="M3.5 2L6.5 5L3.5 8" />
        </svg>

        {/* Title */}
        <span
          className={`font-mono uppercase ${headerStyle}`}
          style={color ? { color } : undefined}
        >
          {title}
        </span>

        {/* Badge */}
        {badge !== undefined && badge !== 0 && (
          <span className="ml-auto px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded-full bg-amber-500/20 text-amber-400">
            {badge}
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={level === 'top' ? 'pt-2 pb-2' : 'pt-1 pb-1'}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
