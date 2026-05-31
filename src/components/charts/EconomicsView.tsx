/**
 * ATLAS Economics View (Phase 5)
 *
 * Six-chart economics deep dive:
 *   1. Decoupling — GDP vs Employment (indexed to 100)
 *   2. Income Composition — wage/asset/transfer share stacked area
 *   3. Consumption Decomposition — absolute $ stacked area
 *   4. AI Production — output, absorption, unrealized
 *   5. Deflation — AI deflation, net inflation, velocity drag
 *   6. Credit — tightening, investment/consumption multipliers
 */

import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { POLICY_CHANNEL_COLORS } from '@/models/constants';
import {
  useDecouplingData,
  useConsumptionDecomposition,
  useDeflationData,
  useCreditData,
} from '@/hooks/useEconomicsData';
import { useMacroTimeSeries, usePolicyWindowInfo, useCurrentYear } from '@/hooks/useSimulation';
import { formatPercent, formatCurrency } from '@/utils/format';
import { NewJobsChart } from '@/components/charts/NewJobsChart';
import { PriceDecompositionChart } from '@/components/charts/PriceDecompositionChart';
import { AIProductionChart } from '@/components/charts/AIProductionChart';

export function EconomicsView() {
  return (
    <>
      <DecouplingChart />
      <IncomeCompositionChart />
      <ConsumptionDecompositionChart />
      <AIProductionChart />
      <DeflationChart />
      <CreditChart />
      <PriceDecompositionChart />
      <NewJobsChart />
    </>
  );
}

// ============================================================
// Shared styles
// ============================================================

const AXIS_TICK = { fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" };
const GRID_STYLE = { strokeDasharray: '2 6', stroke: 'rgba(138, 150, 173, 0.06)' };

function WindowMarker() {
  const { fiscalWindowClose } = usePolicyWindowInfo();
  const currentYear = useCurrentYear();
  if (fiscalWindowClose === null) return null;
  return (
    <>
      <ReferenceLine x={fiscalWindowClose} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} />
      <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} />
    </>
  );
}

// ============================================================
// 1. Decoupling Chart
// ============================================================

function DecouplingChart() {
  const data = useDecouplingData();
  const currentYear = useCurrentYear();

  return (
    <Card title="GDP vs Employment">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 0 }}>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="year" tick={AXIS_TICK} axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }} tickLine={false} ticks={[2025, 2030, 2035, 2040, 2045, 2050]} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={48}
            tickFormatter={(v: number) => `${v.toFixed(0)}`}
          />
          <ReferenceLine y={100} stroke="rgba(138, 150, 173, 0.15)" strokeDasharray="4 4" />
          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} />

          <Line type="monotone" dataKey="gdpIndex" stroke="#D4A03C" strokeWidth={2} dot={false} name="Real GDP" />
          <Line type="monotone" dataKey="employmentIndex" stroke="#3B82F6" strokeWidth={2} dot={false} name="Employment" />

          <Tooltip content={<DecouplingTooltip />} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 mt-3 pl-16">
        <LegendItem color="#D4A03C" label="Real GDP (indexed)" />
        <LegendItem color="#3B82F6" label="Employment (indexed)" />
      </div>
    </Card>
  );
}

function DecouplingTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-[12px] mt-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-secondary">{p.dataKey === 'gdpIndex' ? 'GDP' : 'Employment'}</span>
          <span className="font-mono text-text-primary ml-auto">{p.value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 2. Income Composition Chart (uses macro time series)
// ============================================================

function IncomeCompositionChart() {
  const data = useMacroTimeSeries();
  const currentYear = useCurrentYear();

  return (
    <Card title="Income Composition Over Time">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} stackOffset="expand" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="econ-wageFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={POLICY_CHANNEL_COLORS.wage} stopOpacity={0.3} />
              <stop offset="100%" stopColor={POLICY_CHANNEL_COLORS.wage} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="econ-assetFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={POLICY_CHANNEL_COLORS.asset} stopOpacity={0.3} />
              <stop offset="100%" stopColor={POLICY_CHANNEL_COLORS.asset} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="econ-transferFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={POLICY_CHANNEL_COLORS.transfer} stopOpacity={0.3} />
              <stop offset="100%" stopColor={POLICY_CHANNEL_COLORS.transfer} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="year" tick={AXIS_TICK} axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }} tickLine={false} ticks={[2025, 2030, 2035, 2040, 2045, 2050]} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatPercent(v, 0)} domain={[0, 1]} width={48} />
          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} />

          <Area type="monotone" dataKey="incomeWageShare" stackId="income" stroke={POLICY_CHANNEL_COLORS.wage} strokeWidth={1} fill="url(#econ-wageFill)" dot={false} />
          <Area type="monotone" dataKey="incomeAssetShare" stackId="income" stroke={POLICY_CHANNEL_COLORS.asset} strokeWidth={1} fill="url(#econ-assetFill)" dot={false} />
          <Area type="monotone" dataKey="incomeTransferShare" stackId="income" stroke={POLICY_CHANNEL_COLORS.transfer} strokeWidth={1} fill="url(#econ-transferFill)" dot={false} />

          <Tooltip content={<IncomeTooltip />} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 mt-3 pl-14">
        <LegendItem color={POLICY_CHANNEL_COLORS.wage} label="Wages" />
        <LegendItem color={POLICY_CHANNEL_COLORS.asset} label="Assets" />
        <LegendItem color={POLICY_CHANNEL_COLORS.transfer} label="Transfers" />
      </div>
    </Card>
  );
}

function IncomeTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload) return null;
  const names: Record<string, string> = { incomeWageShare: 'Wages', incomeAssetShare: 'Assets', incomeTransferShare: 'Transfers' };
  const colors: Record<string, string> = { incomeWageShare: POLICY_CHANNEL_COLORS.wage, incomeAssetShare: POLICY_CHANNEL_COLORS.asset, incomeTransferShare: POLICY_CHANNEL_COLORS.transfer };
  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-[12px] mt-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: colors[p.dataKey] }} />
          <span className="text-text-secondary">{names[p.dataKey]}</span>
          <span className="font-mono text-text-primary ml-auto">{formatPercent(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 3. Consumption Decomposition
// ============================================================

function ConsumptionDecompositionChart() {
  const data = useConsumptionDecomposition();
  const currentYear = useCurrentYear();

  return (
    <Card title="Consumption Decomposition">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="econ-cwFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={POLICY_CHANNEL_COLORS.wage} stopOpacity={0.25} />
              <stop offset="100%" stopColor={POLICY_CHANNEL_COLORS.wage} stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="econ-caFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={POLICY_CHANNEL_COLORS.asset} stopOpacity={0.25} />
              <stop offset="100%" stopColor={POLICY_CHANNEL_COLORS.asset} stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="econ-ctFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={POLICY_CHANNEL_COLORS.transfer} stopOpacity={0.25} />
              <stop offset="100%" stopColor={POLICY_CHANNEL_COLORS.transfer} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="year" tick={AXIS_TICK} axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }} tickLine={false} ticks={[2025, 2030, 2035, 2040, 2045, 2050]} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCurrency(v, { compact: true })} width={64} />
          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} />

          <Area type="monotone" dataKey="wageConsumption" stackId="c" stroke={POLICY_CHANNEL_COLORS.wage} strokeWidth={1} fill="url(#econ-cwFill)" dot={false} />
          <Area type="monotone" dataKey="assetConsumption" stackId="c" stroke={POLICY_CHANNEL_COLORS.asset} strokeWidth={1} fill="url(#econ-caFill)" dot={false} />
          <Area type="monotone" dataKey="transferConsumption" stackId="c" stroke={POLICY_CHANNEL_COLORS.transfer} strokeWidth={1} fill="url(#econ-ctFill)" dot={false} />

          <Tooltip content={<ConsumptionTooltip />} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 mt-3 pl-14">
        <LegendItem color={POLICY_CHANNEL_COLORS.wage} label="Wage Consumption" />
        <LegendItem color={POLICY_CHANNEL_COLORS.asset} label="Asset Consumption" />
        <LegendItem color={POLICY_CHANNEL_COLORS.transfer} label="Transfer Consumption" />
      </div>
    </Card>
  );
}

function ConsumptionTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload) return null;
  const names: Record<string, string> = { wageConsumption: 'Wage', assetConsumption: 'Asset', transferConsumption: 'Transfer' };
  const colors: Record<string, string> = { wageConsumption: POLICY_CHANNEL_COLORS.wage, assetConsumption: POLICY_CHANNEL_COLORS.asset, transferConsumption: POLICY_CHANNEL_COLORS.transfer };
  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-[12px] mt-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: colors[p.dataKey] }} />
          <span className="text-text-secondary">{names[p.dataKey]}</span>
          <span className="font-mono text-text-primary ml-auto">{formatCurrency(p.value, { compact: true })}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 4. AI Production Chart — extracted to AIProductionChart.tsx
// ============================================================
// DEPRECATED: Inline AIProductionChart moved to src/components/charts/AIProductionChart.tsx
// for reuse in Overview. Imported at top of this file.

// ============================================================
// 5. Deflation Chart
// ============================================================

function DeflationChart() {
  const data = useDeflationData();
  const currentYear = useCurrentYear();

  return (
    <Card title="Inflation & Deflation Dynamics">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 0 }}>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="year" tick={AXIS_TICK} axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }} tickLine={false} ticks={[2025, 2030, 2035, 2040, 2045, 2050]} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatPercent(v, 1)} width={56} />
          <ReferenceLine y={0} stroke="rgba(138, 150, 173, 0.2)" strokeWidth={1} />
          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} />

          <Line type="monotone" dataKey="inflationRate" stroke="#F97316" strokeWidth={1.5} dot={false} name="Inflation" />
          <Line type="monotone" dataKey="aiDeflationRate" stroke="#3B82F6" strokeWidth={1.5} dot={false} name="AI Deflation" />
          <Line type="monotone" dataKey="netInflation" stroke="#D4A03C" strokeWidth={2} dot={false} name="Net Inflation" />

          <Tooltip content={<DeflationTooltip />} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 mt-3 pl-16">
        <LegendItem color="#F97316" label="Inflation" />
        <LegendItem color="#3B82F6" label="AI Deflation" />
        <LegendItem color="#D4A03C" label="Net Inflation" />
      </div>
    </Card>
  );
}

function DeflationTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: number;
}) {
  if (!active || !payload) return null;
  const names: Record<string, string> = { inflationRate: 'Inflation', aiDeflationRate: 'AI Deflation', netInflation: 'Net Inflation' };
  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-[12px] mt-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-secondary">{names[p.dataKey] ?? p.dataKey}</span>
          <span className="font-mono text-text-primary ml-auto">{formatPercent(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 6. Credit Chart
// ============================================================

function CreditChart() {
  const data = useCreditData();
  const currentYear = useCurrentYear();

  return (
    <Card title="Credit Conditions">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 48, left: 8, bottom: 0 }}>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="year" tick={AXIS_TICK} axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }} tickLine={false} ticks={[2025, 2030, 2035, 2040, 2045, 2050]} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[0, 1.1]} width={48}
            tickFormatter={(v: number) => v.toFixed(2)}
          />
          <ReferenceLine y={1.0} stroke="rgba(138, 150, 173, 0.15)" strokeDasharray="4 4" />
          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} />

          <Line type="monotone" dataKey="investmentMultiplier" stroke="#3B82F6" strokeWidth={2} dot={false} name="Investment Mult." />
          <Line type="monotone" dataKey="consumptionMultiplier" stroke="#22C55E" strokeWidth={2} dot={false} name="Consumption Mult." />
          <Line type="monotone" dataKey="creditTightening" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Credit Tightening" />

          <Tooltip content={<CreditTooltip />} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 mt-3 pl-16">
        <LegendItem color="#3B82F6" label="Investment Multiplier" />
        <LegendItem color="#22C55E" label="Consumption Multiplier" />
        <LegendItem color="#EF4444" label="Credit Tightening" dashed />
      </div>
    </Card>
  );
}

function CreditTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: number;
}) {
  if (!active || !payload) return null;
  const names: Record<string, string> = { investmentMultiplier: 'Investment Mult.', consumptionMultiplier: 'Consumption Mult.', creditTightening: 'Credit Tightening' };
  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-[12px] mt-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-secondary">{names[p.dataKey] ?? p.dataKey}</span>
          <span className="font-mono text-text-primary ml-auto">{p.value.toFixed(4)}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Shared Legend Item
// ============================================================

function LegendItem({ color, label, dashed = false }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-0 relative">
        <div
          className="absolute inset-x-0 top-1/2 h-[2px]"
          style={{
            background: dashed ? 'none' : color,
            borderTop: dashed ? `2px dashed ${color}` : 'none',
          }}
        />
      </div>
      <span className="text-text-muted text-[10px] font-mono">{label}</span>
    </div>
  );
}
