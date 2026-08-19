/**
 * AnimatedRange — the grid's range input, upgraded two ways (owner request):
 *
 * 1. EASED MOTION: when the value changes from OUTSIDE the user's hand (a worldview
 *    selection moving a dial, a shadow reset), the thumb eases to its new position
 *    (ease-in-out, ~280ms) instead of snapping. A user drag bypasses the tween — the
 *    thumb follows the pointer directly. Programmatic mid-tween values may sit off
 *    the step grid; the HTML range value model clamps to [min, max] but does not
 *    step-align programmatic values, so the motion is smooth and the FINAL value is
 *    always the exact target.
 * 2. FILLED TRACK: the track is colored up to the thumb and quiet after it — one
 *    accent color everywhere (gold), per the one-system rule.
 *
 * A native <input type="range"> underneath — keyboard, focus, and screen-reader
 * behavior stay the browser's.
 */
import { useEffect, useRef, useState } from 'react';

const EASE_MS = 420; // owner-tuned: 50% slower than the original 280ms
const easeInOutCubic = (t: number): number =>
  (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const FILL = '#D4A03C';
const TRACK = 'rgba(255,255,255,0.10)';

export function AnimatedRange({ value, min, max, step, onChange, className }: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(display);
  displayRef.current = display;
  const dragging = useRef(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (dragging.current || !Number.isFinite(value)) return;
    const from = displayRef.current;
    if (!Number.isFinite(from) || from === value) {
      if (from !== value) setDisplay(value);
      return;
    }
    // prefers-reduced-motion: position instantly — the ease is a courtesy, never a
    // barrier (checked per change so a live setting change is honored).
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / EASE_MS);
      setDisplay(from + (value - from) * easeInOutCubic(t));
      raf.current = t < 1 ? requestAnimationFrame(tick) : null;
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) {
        cancelAnimationFrame(raf.current);
        raf.current = null;
      }
    };
  }, [value]);

  const pct = max > min ? Math.min(100, Math.max(0, ((display - min) / (max - min)) * 100)) : 0;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={display}
      onPointerDown={() => {
        dragging.current = true;
        if (raf.current !== null) {
          cancelAnimationFrame(raf.current);
          raf.current = null;
        }
      }}
      onPointerUp={() => { dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}
      onChange={(e) => {
        const v = Number(e.target.value);
        setDisplay(v);
        onChange(v);
      }}
      className={`atlas-range ${className ?? ''}`}
      style={{ background: `linear-gradient(to right, ${FILL} 0%, ${FILL} ${pct}%, ${TRACK} ${pct}%, ${TRACK} 100%)` }}
    />
  );
}
