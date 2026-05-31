/**
 * ATLAS Info Tooltip Component
 *
 * Small (i) icon that shows explanatory text on hover.
 * Used throughout the dashboard to explain complex parameters
 * and metrics without cluttering the default view.
 *
 * Bug fixes:
 *   - Changed default position to 'below' (safe default — content won't go above viewport)
 *   - Switched from useEffect to useLayoutEffect to calculate position before paint
 *   - Added horizontal bounds checking to prevent overflow in narrow sidebar
 */

import { useState, useRef, useLayoutEffect, useCallback } from 'react';

interface InfoTooltipProps {
  text: string;
  className?: string;
}

export function InfoTooltip({ text, className = '' }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  // FIX: Default to 'below' instead of 'above' — prevents
  // tooltip from rendering above the viewport on first paint for elements near
  // the top of the sidebar.
  const [position, setPosition] = useState<'above' | 'below'>('below');
  const [horizontalShift, setHorizontalShift] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    // Vertical: if there's not enough space above (< 100px), show below
    setPosition(rect.top < 100 ? 'below' : 'above');

    // Horizontal: prevent tooltip from overflowing left/right edges
    // Tooltip is 200px wide, centered on trigger. Check if it fits.
    const tooltipHalfWidth = 100; // w-[200px] / 2
    const leftEdge = rect.left + rect.width / 2 - tooltipHalfWidth;
    const rightEdge = rect.left + rect.width / 2 + tooltipHalfWidth;

    if (leftEdge < 8) {
      // Would overflow left — shift right
      setHorizontalShift(8 - leftEdge);
    } else if (rightEdge > window.innerWidth - 8) {
      // Would overflow right — shift left
      setHorizontalShift(window.innerWidth - 8 - rightEdge);
    } else {
      setHorizontalShift(0);
    }
  }, []);

  // FIX: Use useLayoutEffect instead of useEffect to calculate
  // position before the browser paints, eliminating the flicker where the tooltip
  // briefly appears at the stale position.
  useLayoutEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible, updatePosition]);

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="inline-flex items-center justify-center w-[14px] h-[14px] rounded-full border border-border text-text-muted hover:text-text-secondary hover:border-border-accent transition-colors cursor-help"
        aria-label="More information"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path
            d="M4 1.5V1.5M4 3.5V6.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`absolute z-50 w-[200px] px-3 py-2 bg-bg-elevated border border-border rounded-lg shadow-lg ${
            position === 'above'
              ? 'bottom-full mb-1.5'
              : 'top-full mt-1.5'
          }`}
          style={{
            left: `calc(50% + ${horizontalShift}px)`,
            transform: 'translateX(-50%)',
          }}
        >
          <p className="text-[10px] font-mono text-text-secondary leading-relaxed">
            {text}
          </p>
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-bg-elevated border-border rotate-45 ${
              position === 'above'
                ? 'bottom-[-5px] border-r border-b'
                : 'top-[-5px] border-l border-t'
            }`}
            style={{
              left: `calc(50% - ${horizontalShift}px)`,
              transform: 'translateX(-50%) rotate(45deg)',
            }}
          />
        </div>
      )}
    </span>
  );
}
