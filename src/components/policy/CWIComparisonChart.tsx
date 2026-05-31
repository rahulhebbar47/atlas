/**
 * ATLAS CWI Comparison Chart (Phase 5)
 *
 * Four-line chart showing System and Median CWI, each with and without policy:
 *   - System CWI With Policy (gold, solid)
 *   - System CWI Without Policy (gold, dashed, lighter)
 *   - Median CWI With Policy (teal, solid)
 *   - Median CWI Without Policy (teal, dashed, lighter)
 *
 * Colors match the Overview CWI chart: gold = system, teal = median.
 */

import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { useNoPolicyCWIApproximation } from '@/hooks/usePolicyData';
import { usePolicyWindowInfo, useCurrentYear } from '@/hooks/useSimulation';
import { useSimulationStore } from '@/stores/simulationStore';
import { formatCurrency } from '@/utils/format';

const GOLD = '#D4A03C';
const TEAL = '#4ECDC4';
const AXIS_TICK = { fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" };

export function CWIComparisonChart() {
  const data = useNoPolicyCWIApproximation();
  const { fiscalWindowOpen, fiscalWindowClose } = usePolicyWindowInfo();
  const currentYear = useCurrentYear();
  const endYear = useSimulationStore((s) => s.config.endYear);

  return (
    <Card title="CWI: With vs Without Policy">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 6" stroke="rgba(138, 150, 173, 0.06)" vertical={false} />

          <XAxis
            dataKey="year"
            tick={AXIS_TICK}
            axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }}
            tickLine={false}
            ticks={[2025, 2030, 2035, 2040, 2045, 2050]}
          />

          <YAxis
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatCurrency(v, { compact: true })}
            width={64}
            domain={[0, 'auto']}
          />

          {/* Policy window green band */}
          {fiscalWindowOpen !== null && (
            <ReferenceArea
              x1={fiscalWindowOpen}
              x2={fiscalWindowClose ?? endYear}
              fill="#22C55E"
              fillOpacity={0.06}
            />
          )}

          {/* Post-window red zone */}
          {fiscalWindowClose !== null && (
            <ReferenceArea
              x1={fiscalWindowClose}
              x2={endYear}
              fill="#EF4444"
              fillOpacity={0.04}
            />
          )}

          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} />

          {/* No-policy counterfactuals — dashed, behind primary lines */}
          <Line
            type="monotone"
            dataKey="cwiWithoutPolicy"
            stroke={GOLD}
            strokeWidth={1}
            strokeDasharray="4 4"
            strokeOpacity={0.4}
            dot={false}
            activeDot={false}
          />
          <Line
            type="monotone"
            dataKey="medianCwiWithoutPolicy"
            stroke={TEAL}
            strokeWidth={1}
            strokeDasharray="4 4"
            strokeOpacity={0.4}
            dot={false}
            activeDot={false}
          />

          {/* Median CWI With Policy — teal solid */}
          <Line
            type="monotone"
            dataKey="medianCwiWithPolicy"
            stroke={TEAL}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: TEAL, stroke: '#080D18', strokeWidth: 2 }}
          />

          {/* System CWI With Policy — gold solid */}
          <Line
            type="monotone"
            dataKey="cwiWithPolicy"
            stroke={GOLD}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: GOLD, stroke: '#080D18', strokeWidth: 2 }}
          />

          <Tooltip content={<CWIComparisonTooltip />} />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-6 mt-3 pl-16 flex-wrap">
        <LegendItem color={GOLD} label="System CWI (Avg)" />
        <LegendItem color={TEAL} label="Median CWI (Bottom 80%)" />
        <LegendItem color={GOLD} label="System (No Policy)" dashed />
        <LegendItem color={TEAL} label="Median (No Policy)" dashed />
      </div>
    </Card>
  );
}

function CWIComparisonTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload: Record<string, number> }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  const systemWith = row['cwiWithPolicy'] ?? 0;
  const systemWithout = row['cwiWithoutPolicy'] ?? 0;
  const medianWith = row['medianCwiWithPolicy'] ?? 0;
  const medianWithout = row['medianCwiWithoutPolicy'] ?? 0;
  const systemGap = systemWith - systemWithout;
  const medianGap = medianWith - medianWithout;

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>

      {/* System CWI */}
      <div className="flex items-center gap-2 text-[12px]">
        <div className="w-2 h-2 rounded-full" style={{ background: GOLD }} />
        <span className="text-text-secondary">System CWI</span>
        <span className="font-mono text-text-primary ml-auto">
          {formatCurrency(systemWith, { compact: true })}/person
        </span>
      </div>

      {/* Median CWI */}
      <div className="flex items-center gap-2 text-[12px] mt-0.5">
        <div className="w-2 h-2 rounded-full" style={{ background: TEAL }} />
        <span className="text-text-secondary">Median CWI</span>
        <span className="font-mono text-text-primary ml-auto">
          {formatCurrency(medianWith, { compact: true })}/person
        </span>
      </div>

      {/* No-policy values */}
      <div className="flex items-center gap-2 text-[12px] mt-1 pt-1 border-t border-border/50">
        <span className="text-text-muted text-[10px] font-mono">
          No Policy: System {formatCurrency(systemWithout, { compact: true })} / Median {formatCurrency(medianWithout, { compact: true })}
        </span>
      </div>

      {/* Policy impact */}
      {(systemGap > 0 || medianGap > 0) && (
        <div className="text-[11px] mt-1 pt-1 border-t border-border/50 space-y-0.5">
          {systemGap > 0 && (
            <div className="text-growth font-mono">
              System Impact: +{formatCurrency(systemGap, { compact: true })}
            </div>
          )}
          {medianGap > 0 && (
            <div className="font-mono" style={{ color: TEAL }}>
              Median Impact: +{formatCurrency(medianGap, { compact: true })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label, dashed = false }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-0 relative">
        <div
          className="absolute inset-x-0 top-1/2 h-[2px]"
          style={{
            background: dashed ? 'none' : color,
            borderTop: dashed ? `2px dashed ${color}` : 'none',
            opacity: dashed ? 0.4 : 1,
          }}
        />
      </div>
      <span className="text-text-muted text-[10px] font-mono">{label}</span>
    </div>
  );
}
