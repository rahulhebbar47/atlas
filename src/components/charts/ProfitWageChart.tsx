/**
 * ATLAS Corporate Profits vs Total Wage Bill Chart (Overview)
 *
 * The crossing of these lines is the distributional crisis in one image.
 * Total Wage Bill collapses while Corporate Profits grow modestly.
 * The crossing point (~2035-2036) marks when capital income surpasses
 * total labor compensation for the first time in modern economic history.
 */

import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { useProfitWageData } from '@/hooks/useEconomicsData';
import { useCurrentYear } from '@/hooks/useSimulation';
import { formatCurrency } from '@/utils/format';

const AXIS_TICK = { fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" };
const GRID_STYLE = { strokeDasharray: '2 6', stroke: 'rgba(138, 150, 173, 0.06)' };

const WAGE_COLOR = '#D4A03C';   // gold
const PROFIT_COLOR = '#6366F1'; // indigo

export function ProfitWageChart() {
  const { data } = useProfitWageData();
  const currentYear = useCurrentYear();

  return (
    <Card title="Corporate Profits vs Total Wage Bill (Real 2025$)">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 0 }}>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="year" tick={AXIS_TICK} axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }} tickLine={false} ticks={[2025, 2030, 2035, 2040, 2045, 2050]} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCurrency(v, { compact: true })} width={64} />

          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} />

          <Line
            type="monotone"
            dataKey="wageBill"
            stroke={WAGE_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: WAGE_COLOR, stroke: '#080D18', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="corporateProfits"
            stroke={PROFIT_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: PROFIT_COLOR, stroke: '#080D18', strokeWidth: 2 }}
          />

          <Tooltip content={<ProfitWageTooltip />} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 mt-3 pl-16">
        <LegendItem color={WAGE_COLOR} label="Total Wage Bill" />
        <LegendItem color={PROFIT_COLOR} label="Corporate Profits" />
      </div>
    </Card>
  );
}

function ProfitWageTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload: Record<string, number> }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  const wage = row['wageBill'] ?? 0;
  const profit = row['corporateProfits'] ?? 0;
  const ratio = wage > 0 ? profit / wage : 0;

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      <div className="flex items-center gap-2 text-[12px]">
        <div className="w-2 h-2 rounded-full" style={{ background: WAGE_COLOR }} />
        <span className="text-text-secondary">Wage Bill</span>
        <span className="font-mono text-text-primary ml-auto">{formatCurrency(wage, { compact: true })}</span>
      </div>
      <div className="flex items-center gap-2 text-[12px] mt-0.5">
        <div className="w-2 h-2 rounded-full" style={{ background: PROFIT_COLOR }} />
        <span className="text-text-secondary">Corp. Profits</span>
        <span className="font-mono text-text-primary ml-auto">{formatCurrency(profit, { compact: true })}</span>
      </div>
      <div className="flex items-center gap-2 text-[12px] mt-1 pt-1 border-t border-border/50">
        <span className="text-text-muted text-[11px] font-mono">
          Profit/Wage: {ratio.toFixed(2)}x
        </span>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-0 relative">
        <div className="absolute inset-x-0 top-1/2 h-[2px]" style={{ background: color }} />
      </div>
      <span className="text-text-muted text-[10px] font-mono">{label}</span>
    </div>
  );
}
