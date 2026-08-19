/**
 * ATLAS Policy Window Chart (Phase 5)
 *
 * The GDP trajectory chart (the policy-window band overlays were removed; renamed at the owner's pre-flight polish).
 * Green band from policyWindowStart to policyWindowClose.
 * Shows the realized AI share of GDP as a secondary area (H3 ruling 1).
 * Key "act now" visual for the Overview screen.
 */

import {
  ComposedChart, Line, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/shared/Card';
import { useMacroTimeSeries, usePolicyWindowInfo, useCurrentYear, useBaselineMacroTimeSeries } from '@/hooks/useSimulation';
import { useSimulationStore, getBLSBaselines } from '@/stores/simulationStore';
import { runSimulation } from '@/models/simulation';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { formatCurrency, formatPercent } from '@/utils/format';
import { useEffect, useMemo, useState } from 'react';
import type { CapabilityVectorId, CapabilityTrajectoryParams } from '@/types';

/** Zero-capability config: all AI vectors frozen at floor=ceiling=0, steepness=0 */
const ZERO_CAPABILITIES: Record<CapabilityVectorId, CapabilityTrajectoryParams> = {
  generative: { floor: 0, ceiling: 0, steepness: 0, midpointYear: 2040 },
  agentic:    { floor: 0, ceiling: 0, steepness: 0, midpointYear: 2040 },
  embodied:   { floor: 0, ceiling: 0, steepness: 0, midpointYear: 2040 },
};

export function PolicyWindowChart() {
  const macroData = useMacroTimeSeries();
  const baselineData = useBaselineMacroTimeSeries();
  const {
    prepWindowOpen, prepWindowClose,
    fiscalWindowOpen, fiscalWindowClose,
  } = usePolicyWindowInfo();
  const currentYear = useCurrentYear();
  const config = useSimulationStore((s) => s.config);
  const endYear = config.endYear;

  // Run a full simulation with zero AI capabilities (~5ms).
  // This captures all non-AI macro dynamics (Okun's, Phillips, fiscal, etc.)
  // so the ghost lines match exactly when the user zeroes AI sliders.
  const noAIData = useMemo(() => {
    const noAIConfig = { ...config, capabilities: ZERO_CAPABILITIES };
    const baselines = getBLSBaselines();
    const noAITimeline = runSimulation(noAIConfig, OCCUPATION_CLUSTERS, baselines);
    return new Map(noAITimeline.years.map((y) => [y.year, y]));
  }, [config]);

  // THE Y-AXIS RULE (owner-tuned): base ceiling $90T; the LINES move first on any
  // settings change, and the axis rescales only AFTERWARD, and only when a GDP
  // metric exceeds the current ceiling (a line briefly clips at the top edge for the
  // beat, which is the honest signal that the scale is about to grow). When the data
  // recedes, the ceiling settles back toward the $90T base the same deferred way —
  // a transient spike never leaves an inflated scale behind. (The prior design held
  // a $120T minimum ceiling updated in the same render as the lines: changes never
  // outran the axis, but every change read as small against the inflated scale.)
  const GDP_Y_MIN = 0;
  const GDP_Y_FLOOR = 90e12; // $90T base upper bound

  // The bound covers exactly the RENDERED series: live nominal + real, the no-AI
  // REAL ghost, and the baseline real ghost when comparison is on. (The no-AI
  // NOMINAL path is not a chart line and must not size the axis — without AI
  // deflation it compounds past $100T by 2050 and silently inflated the ceiling;
  // the old $120T floor masked that.)
  const gdpTargetMax = useMemo(() => {
    let max = GDP_Y_FLOOR;
    for (const d of macroData) {
      if (d.gdpNominal > max) max = d.gdpNominal;
      if (d.gdpReal > max) max = d.gdpReal;
    }
    for (const y of noAIData.values()) {
      if (y.macro.gdpReal > max) max = y.macro.gdpReal;
    }
    for (const b of baselineData ?? []) {
      if (b.gdpReal > max) max = b.gdpReal;
    }
    // Round up to nearest $10T for clean ticks
    return Math.ceil(max / 10e12) * 10e12;
  }, [macroData, noAIData, baselineData]);

  // The deferred axis: lines render against the CURRENT ceiling immediately; the
  // ceiling follows once the lines have moved (rapid slider drags keep deferring, so
  // the axis adjusts once after the hand stops, not mid-drag).
  const [gdpAxisMax, setGdpAxisMax] = useState(gdpTargetMax);
  useEffect(() => {
    if (gdpTargetMax === gdpAxisMax) return;
    const t = setTimeout(() => setGdpAxisMax(gdpTargetMax), 450);
    return () => clearTimeout(t);
  }, [gdpTargetMax, gdpAxisMax]);

  // Merge GDP nominal + realized AI GDP share + no-AI counterfactual + baseline ghost data
  const data = useMemo(() => {
    const baselineMap = new Map(baselineData?.map((d) => [d.year, d]) ?? []);

    return macroData.map((d) => {
      const bl = baselineMap.get(d.year);
      const noAI = noAIData.get(d.year);
      return {
        year: d.year,
        gdpNominal: d.gdpNominal,
        gdpReal: d.gdpReal,
        // H3 ruling 1: the green area claims AI's share of GDP — the REALIZED metric.
        aiRealizedShareOfGDP: d.aiRealizedShareOfGDP,
        gdpNoAI_real: noAI?.macro.gdpReal ?? d.gdpReal,
        ...(bl ? { baseline_gdpReal: bl.gdpReal } : {}),
      };
    });
  }, [macroData, baselineData, noAIData]);

  return (
    // Owner order (pre-flight polish): renamed — the overlays are gone, the chart is the GDP story.
    <Card title="GDP Trajectory">
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 6" stroke="rgba(138, 150, 173, 0.06)" vertical={false} />

          <XAxis
            dataKey="year"
            tick={{ fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={{ stroke: 'rgba(138, 150, 173, 0.1)' }}
            tickLine={false}
            ticks={[2025, 2030, 2035, 2040, 2045, 2050]}
          />

          <YAxis
            yAxisId="gdp"
            domain={[GDP_Y_MIN, gdpAxisMax]}
            allowDataOverflow
            tick={{ fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatCurrency(v, { compact: true })}
            width={56}
          />

          <YAxis
            yAxisId="pct"
            orientation="right"
            tick={{ fill: '#4E5D75', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatPercent(v, 0)}
            width={40}
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
          />

          <ReferenceLine x={currentYear} stroke="rgba(232, 236, 244, 0.3)" strokeWidth={1} yAxisId="gdp" />

          {/* No-AI counterfactual ghost line — faint, behind main lines */}
          <Line
            yAxisId="gdp"
            type="monotone"
            dataKey="gdpNoAI_real"
            stroke="#D4A03C"
            strokeWidth={1}
            strokeDasharray="4 6"
            strokeOpacity={0.25}
            dot={false}
            activeDot={false}
          />

          {/* Nominal GDP line (dashed) */}
          <Line
            yAxisId="gdp"
            type="monotone"
            dataKey="gdpNominal"
            stroke="#8A96AD"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />

          {/* Real GDP line (solid — primary) */}
          <Line
            yAxisId="gdp"
            type="monotone"
            dataKey="gdpReal"
            stroke="#D4A03C"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#D4A03C', stroke: '#080D18', strokeWidth: 2 }}
          />

          {/* Baseline ghost line — autopilot real GDP */}
          {baselineData && (
            <Line
              yAxisId="gdp"
              type="monotone"
              dataKey="baseline_gdpReal"
              stroke="#6B7280"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              strokeOpacity={0.5}
              dot={false}
              activeDot={false}
            />
          )}

          {/* Realized AI share of GDP (H3) */}
          <Area
            yAxisId="pct"
            type="monotone"
            dataKey="aiRealizedShareOfGDP"
            stroke="#22C55E"
            strokeWidth={1}
            fill="#22C55E"
            fillOpacity={0.08}
            dot={false}
          />

          <Tooltip content={<PolicyWindowTooltip />} />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-6 mt-3 pl-16 flex-wrap">
        <LegendItem color="#D4A03C" label="Real GDP" />
        <LegendItem color="#8A96AD" label="Nominal GDP" dashed />
        <LegendItem color="#22C55E" label="Realized AI GDP %" />
        <LegendItem color="rgba(138, 150, 173, 0.35)" label="No AI" dashed />
        {baselineData && <LegendItem color="#6B7280" label="Autopilot baseline" dashed />}
      </div>
    </Card>
  );
}

function PolicyWindowTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload) return null;

  const gdpNom = payload.find((p) => p.dataKey === 'gdpNominal');
  const gdpReal = payload.find((p) => p.dataKey === 'gdpReal');
  const noAIReal = payload.find((p) => p.dataKey === 'gdpNoAI_real');
  const aiPct = payload.find((p) => p.dataKey === 'aiRealizedShareOfGDP');

  return (
    <div className="bg-bg-card border border-border rounded-[8px] px-3 py-2 shadow-none">
      <div className="font-mono text-[11px] text-text-muted mb-1.5">{label}</div>
      {gdpReal && (
        <div className="flex items-center gap-2 text-[12px]">
          <div className="w-2 h-2 rounded-full" style={{ background: '#D4A03C' }} />
          <span className="text-text-secondary">Real GDP</span>
          <span className="font-mono text-text-primary ml-auto">{formatCurrency(gdpReal.value, { compact: true })}</span>
        </div>
      )}
      {noAIReal && (
        <div className="flex items-center gap-2 text-[12px] mt-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(212, 160, 60, 0.35)' }} />
          <span className="text-text-secondary">No AI (Real)</span>
          <span className="font-mono text-text-muted ml-auto">{formatCurrency(noAIReal.value, { compact: true })}</span>
        </div>
      )}
      {gdpNom && (
        <div className="flex items-center gap-2 text-[12px] mt-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: '#8A96AD' }} />
          <span className="text-text-secondary">Nominal GDP</span>
          <span className="font-mono text-text-primary ml-auto">{formatCurrency(gdpNom.value, { compact: true })}</span>
        </div>
      )}
      {aiPct && (
        <div className="flex items-center gap-2 text-[12px] mt-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
          <span className="text-text-secondary">Realized AI GDP %</span>
          <span className="font-mono text-text-primary ml-auto">{formatPercent(aiPct.value)}</span>
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
          }}
        />
      </div>
      <span className="text-text-muted text-[10px] font-mono">{label}</span>
    </div>
  );
}
