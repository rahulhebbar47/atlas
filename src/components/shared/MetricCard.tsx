/**
 * ATLAS Metric Card Component
 *
 * Compact metric display for the insights panel.
 * Label in mono/uppercase/muted, value in mono/large, optional delta.
 */

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

const DELTA_COLORS: Record<string, string> = {
  positive: 'text-growth',
  negative: 'text-critical',
  neutral: 'text-neutral',
};

export function MetricCard({
  label,
  value,
  delta,
  deltaType = 'neutral',
  className = '',
}: MetricCardProps) {
  return (
    <div
      className={`bg-bg-card border border-border rounded-[12px] px-4 py-3 ${className}`}
    >
      <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted mb-1">
        {label}
      </div>
      <div className="font-mono text-lg text-text-primary leading-tight truncate">
        {value}
      </div>
      {delta && (
        <div
          className={`font-mono text-[11px] mt-1 truncate ${DELTA_COLORS[deltaType] ?? 'text-neutral'}`}
        >
          {delta}
        </div>
      )}
    </div>
  );
}
