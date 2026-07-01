/**
 * ATLAS Joblessness — the "how many people need help" display.
 *
 * Two measures from existing simulation state (no model change):
 *   - Jobless workers, in millions (area, left axis): the labor force minus the employed.
 *   - Employment-to-population (line, right axis): employed workers over total population.
 *
 * THE MEASUREMENT CAVEAT (rendered on the chart): ATLAS reports TOTAL joblessness — in the
 * model no one exits the labor force, so its unemployment is an upper bound on the official
 * U-3 rate, which counts only active searchers. Compare these lines to
 * employment-to-population statistics, not to U-3. The employment-to-population line uses
 * total population as its base (the model does not track the working-age subset).
 */
import {
  ComposedChart, Area, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { useMemo } from 'react';
import { Card } from '@/components/shared/Card';
import { useSimulationStore } from '@/stores/simulationStore';
import { useCurrentYear } from '@/hooks/useSimulation';

const AXIS_TICK = { fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" };
const GRID_STYLE = { strokeDasharray: '2 6', stroke: 'rgba(138, 150, 173, 0.06)' };
const CORAL = '#E86A5E';
const GOLD = '#D4A03C';

export function JoblessnessChart() {
  const years = useSimulationStore((s) => s.timeline.years);
  const currentYear = useCurrentYear();

  const data = useMemo(() => years.map((y) => {
    const lf = y.macro.dynamicLaborForce;
    const jobless = y.macro.unemploymentRate * lf;
    const employed = lf - jobless;
    return {
      year: y.year,
      joblessM: jobless / 1e6,
      epop: y.macro.dynamicPopulation > 0 ? (employed / y.macro.dynamicPopulation) * 100 : 0,
    };
  }), [years]);

  return (
    <Card title="Joblessness — total jobless workers and employment-to-population">
      <p className="text-text-muted text-[11px] mb-2 max-w-2xl">
        ATLAS reports total joblessness: nobody exits the labor force in the model, so this is
        an upper bound on the official U-3 unemployment rate, which counts only active job
        seekers. Compare to employment-to-population, not U-3. (Employment-to-population here
        uses total population as its base.)
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 0 }}>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false}
            axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }}
            ticks={[2025, 2030, 2035, 2040, 2045, 2050]} />
          <YAxis yAxisId="m" tick={AXIS_TICK} axisLine={false} tickLine={false} width={48}
            tickFormatter={(v: number) => `${v.toFixed(0)}M`} />
          <YAxis yAxisId="pct" orientation="right" tick={AXIS_TICK} axisLine={false} tickLine={false} width={44}
            tickFormatter={(v: number) => `${v.toFixed(0)}%`} domain={[0, 70]} />
          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} yAxisId="m" />
          <Area yAxisId="m" type="monotone" dataKey="joblessM"
            fill={CORAL} fillOpacity={0.15} stroke={CORAL} strokeWidth={2} />
          <Line yAxisId="pct" type="monotone" dataKey="epop"
            stroke={GOLD} strokeWidth={2} dot={false}
            activeDot={{ r: 4, fill: GOLD, stroke: '#080D18', strokeWidth: 2 }} />
          <Tooltip content={<JoblessTooltip />} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 mt-3 pl-16 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-[2px]" style={{ background: CORAL }} />
          <span className="text-[10px] font-mono text-text-muted">Jobless workers (millions, left)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-[2px]" style={{ background: GOLD }} />
          <span className="text-[10px] font-mono text-text-muted">Employment-to-population (right)</span>
        </div>
      </div>
    </Card>
  );
}

function JoblessTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const byKey = new Map(payload.map((p) => [p.dataKey, p.value]));
  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2">
      <div className="font-mono text-[11px] text-text-muted mb-1">{label}</div>
      <div className="flex items-center gap-3 text-[12px]">
        <span className="text-text-secondary">Jobless</span>
        <span className="font-mono text-text-primary ml-auto">{(byKey.get('joblessM') ?? 0).toFixed(1)}M workers</span>
      </div>
      <div className="flex items-center gap-3 text-[12px]">
        <span className="text-text-secondary">Employment-to-population</span>
        <span className="font-mono text-text-primary ml-auto">{(byKey.get('epop') ?? 0).toFixed(1)}%</span>
      </div>
    </div>
  );
}
