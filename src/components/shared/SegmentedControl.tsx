/**
 * ATLAS Segmented Control (the quintile view redesign's shared control).
 *
 * ONE component, one behavior, learned once: a compact segmented switch deployed
 * identically wherever a view choice is exclusive and small (first use: the
 * "Top vs rest" | "All quintiles" quintile view on every quintile-rendering chart).
 * Styling follows the DimensionSlider segmented grammar and the card token system.
 */
interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, ariaLabel }: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex gap-0.5 p-0.5 rounded-[6px] bg-bg-elevated border border-border"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`px-2.5 py-1 text-[10px] font-mono rounded-[4px] whitespace-nowrap transition-colors duration-150 ${
              active
                ? 'bg-bg-card text-text-primary border border-border-accent'
                : 'text-text-muted hover:text-text-secondary border border-transparent'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
