/**
 * ATLAS Inference Cost Controls
 *
 * Token Cost Curve — the *baseline* declining cost-per-token of AI work.
 *
 * The other half of total inference cost is the frontier-intensity layer
 * (mini-stage 1): work AT the capability frontier pays a persistent tokens-per-task
 * premium (`frontierIntensityLevel`, growing at `frontierIntensityGrowth`), while
 * work the frontier has surpassed migrates onto arrival-anchored fixed-capability
 * pricing (`sigmaMigration` sets the migration speed; `wMinFrontierFloor` the
 * always-frontier residue). The economy-wide tokens-per-task path is an emergent
 * OUTPUT (MacroOutput.impliedAggregateTokensPerTask), never an input.
 *
 * (Superseded framing, kept for the record — the retired per-year global multiplier:)
 * // Combined: inferenceCostFactor(t) = tokenCostFactor(t) × tokenUsageMultiplier(year)
 * // RETIRED (Amendment 2, no legacy toggles): the per-year tokenUsageMultiplier row
 * // and the global tokens-per-task schedule are replaced by the frontier layer above.
 */

import { useCallback, useMemo } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import {
  DEFAULT_TOKEN_COST_CURVE,
  DEFAULT_FRONTIER_INTENSITY_LEVEL,
  DEFAULT_FRONTIER_INTENSITY_GROWTH,
  DEFAULT_SIGMA_MIGRATION,
  DEFAULT_W_MIN_FRONTIER_FLOOR,
} from '@/models/constants';
import { computeTokenCostFactor } from '@/models/bfcs';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CONTROL_COLOR = '#475569';
const CHART_COLOR = '#CBD5E1';

export function InferenceCostControls() {
  const tokenCostCurve = useSimulationStore(
    (s) => s.config.aiCostParams?.tokenCostCurve ?? DEFAULT_TOKEN_COST_CURVE,
  );
  const setTokenCostCurve = useSimulationStore((s) => s.setTokenCostCurve);

  // Frontier-intensity cost layer dials (mini-stage 1) — defaults by reference.
  const frontierIntensityLevel = useSimulationStore(
    (s) => s.config.aiCostParams?.frontierIntensityLevel ?? DEFAULT_FRONTIER_INTENSITY_LEVEL,
  );
  const frontierIntensityGrowth = useSimulationStore(
    (s) => s.config.aiCostParams?.frontierIntensityGrowth ?? DEFAULT_FRONTIER_INTENSITY_GROWTH,
  );
  const sigmaMigration = useSimulationStore(
    (s) => s.config.aiCostParams?.sigmaMigration ?? DEFAULT_SIGMA_MIGRATION,
  );
  const wMinFrontierFloor = useSimulationStore(
    (s) => s.config.aiCostParams?.wMinFrontierFloor ?? DEFAULT_W_MIN_FRONTIER_FLOOR,
  );
  const setAiCostParams = useSimulationStore((s) => s.setAiCostParams);

  const handleCurveChange = useCallback(
    (key: 'floor' | 'k' | 'decayExponent') => (value: number) => {
      setTokenCostCurve({ ...tokenCostCurve, [key]: value });
    },
    [tokenCostCurve, setTokenCostCurve],
  );

  // One typed callback per dial (a computed `{ [key]: value }` would widen past
  // Partial<AICostParams> under strict mode).
  const handleFrontierLevel = useCallback(
    (value: number) => setAiCostParams({ frontierIntensityLevel: value }),
    [setAiCostParams],
  );
  const handleFrontierGrowth = useCallback(
    (value: number) => setAiCostParams({ frontierIntensityGrowth: value }),
    [setAiCostParams],
  );
  const handleSigmaMigration = useCallback(
    (value: number) => setAiCostParams({ sigmaMigration: value }),
    [setAiCostParams],
  );
  const handleWMinFloor = useCallback(
    (value: number) => setAiCostParams({ wMinFrontierFloor: value }),
    [setAiCostParams],
  );

  const previewData = useMemo(() => {
    const data: { year: number; tokenCost: number }[] = [];
    for (let t = 0; t <= 25; t++) {
      data.push({ year: 2025 + t, tokenCost: computeTokenCostFactor(t, tokenCostCurve) });
    }
    return data;
  }, [tokenCostCurve]);

  return (
    <div className="space-y-3">
      <Slider
        label="Floor (asymptotic)"
        value={tokenCostCurve.floor}
        min={0.0001} max={0.1} step={0.0001}
        color={CONTROL_COLOR}
        onChange={handleCurveChange('floor')}
        formatValue={(v) => v < 0.01 ? v.toExponential(1) : v.toFixed(3)}
      />
      <Slider
        label="Decay rate (k)"
        value={tokenCostCurve.k}
        min={0.1} max={2.0} step={0.01}
        color={CONTROL_COLOR}
        onChange={handleCurveChange('k')}
        formatValue={(v) => v.toFixed(2)}
      />
      <Slider
        label="Decay exponent"
        value={tokenCostCurve.decayExponent}
        min={0.3} max={1.0} step={0.01}
        color={CONTROL_COLOR}
        onChange={handleCurveChange('decayExponent')}
        formatValue={(v) => v.toFixed(2)}
      />

      <div className="mt-3" style={{ height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={previewData} margin={{ top: 4, right: 4, bottom: 16, left: 4 }}>
            <XAxis dataKey="year" stroke="#6B7280" tick={{ fontSize: 9 }} />
            <YAxis stroke="#6B7280" tick={{ fontSize: 9 }} tickFormatter={(v) => v.toFixed(2)} />
            <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', fontSize: 11 }} />
            <Line type="monotone" dataKey="tokenCost" stroke={CHART_COLOR} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-text-muted text-[10px] leading-relaxed">
        Cost per token of AI work, as a fraction of the 2025 baseline: floor + (1−floor) × exp(−k × t^exponent).
        Total inference cost blends this curve with the frontier-intensity layer below; the economy-wide
        tokens-per-task path is an emergent output (CSV columns{' '}
        <span className="font-mono">implied_aggregate_tokens_per_task</span> and{' '}
        <span className="font-mono">aggregate_frontier_weight</span>), not an input.
      </p>

      <div className="pt-2 border-t border-white/5">
        <p className="text-text-muted text-[11px] font-medium mb-2">Frontier Intensity Layer</p>
        <div className="space-y-3">
          <Slider
            label="Frontier Intensity (2026)"
            value={frontierIntensityLevel}
            min={1} max={100} step={1}
            color={CONTROL_COLOR}
            onChange={handleFrontierLevel}
            formatValue={(v) => `${v.toFixed(0)}×`}
          />
          <Slider
            label="Frontier Intensity Growth"
            value={frontierIntensityGrowth}
            min={-0.15} max={0.40} step={0.01}
            color={CONTROL_COLOR}
            onChange={handleFrontierGrowth}
            formatValue={(v) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(0)}%/yr`}
          />
          <p className="text-text-muted text-[10px] leading-relaxed">
            Absolute frontier per-task cost climbs only when this growth exceeds the per-token
            decline rate (~26%/yr in the early window); below that, frontier cost still falls,
            just more slowly than non-frontier cost.
          </p>
          <Slider
            label="Migration σ (surplus to halve)"
            value={sigmaMigration}
            min={0.02} max={1.0} step={0.01}
            color={CONTROL_COLOR}
            onChange={handleSigmaMigration}
            formatValue={(v) => v.toFixed(2)}
          />
          <Slider
            label="Always-Frontier Floor"
            value={wMinFrontierFloor}
            min={0} max={0.5} step={0.01}
            color={CONTROL_COLOR}
            onChange={handleWMinFloor}
            formatValue={(v) => v.toFixed(2)}
          />
        </div>
      </div>
    </div>
  );
}
