/**
 * ATLAS State Ranking Cards (Phase 6)
 *
 * Shown in the InsightsPanel when activeView === 'states'.
 * Displays top 5 most/least impacted states by displacement.
 */

import { useStateRanking, useStateDataLoaded } from '@/hooks/useStateData';
import { Card } from '@/components/shared/Card';
import { formatPercent } from '@/utils/format';

export function StateRankingCards() {
  const stateDataLoaded = useStateDataLoaded();
  const mostImpacted = useStateRanking('displacement', 'desc', 5);
  const leastImpacted = useStateRanking('displacement', 'asc', 5);

  if (!stateDataLoaded || mostImpacted.length === 0) return null;

  return (
    <>
      <Card title="Most Impacted States">
        <div className="space-y-1.5">
          {mostImpacted.map((state, i) => (
            <RankRow
              key={state.code}
              rank={i + 1}
              name={state.name}
              value={formatPercent(state.displacement)}
              color="#EF4444"
            />
          ))}
        </div>
      </Card>

      <Card title="Least Impacted States">
        <div className="space-y-1.5">
          {leastImpacted.map((state, i) => (
            <RankRow
              key={state.code}
              rank={i + 1}
              name={state.name}
              value={formatPercent(state.displacement)}
              color="#22C55E"
            />
          ))}
        </div>
      </Card>
    </>
  );
}

function RankRow({
  rank,
  name,
  value,
  color,
}: {
  rank: number;
  name: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="font-mono text-text-muted w-4 text-right">{rank}.</span>
      <span className="text-text-secondary flex-1 truncate">{name}</span>
      <span className="font-mono" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
