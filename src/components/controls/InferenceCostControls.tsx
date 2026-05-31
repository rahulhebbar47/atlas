/**
 * ATLAS Inference Cost Controls
 *
 * Token Cost Curve — the *baseline* declining cost-per-token of AI work.
 *
 * The other half of total inference cost — tokens-per-task (`tokenUsageMultiplier`) —
 * is a year-overridable parameter and lives in the Year Parameters section, since
 * its trajectory depends on business decisions and doesn't follow a smooth curve.
 *
 * Combined: inferenceCostFactor(t) = tokenCostFactor(t) × tokenUsageMultiplier(year)
 */

import { useCallback, useMemo } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/shared/Slider';
import { DEFAULT_TOKEN_COST_CURVE } from '@/models/constants';
import { computeTokenCostFactor } from '@/models/bfcs';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CONTROL_COLOR = '#475569';
const CHART_COLOR = '#CBD5E1';

export function InferenceCostControls() {
  const tokenCostCurve = useSimulationStore(
    (s) => s.config.aiCostParams?.tokenCostCurve ?? DEFAULT_TOKEN_COST_CURVE,
  );
  const setTokenCostCurve = useSimulationStore((s) => s.setTokenCostCurve);

  const handleCurveChange = useCallback(
    (key: 'floor' | 'k' | 'decayExponent') => (value: number) => {
      setTokenCostCurve({ ...tokenCostCurve, [key]: value });
    },
    [tokenCostCurve, setTokenCostCurve],
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
        Total inference cost is this curve multiplied by the year-resolved <span className="font-mono">tokensPerTask</span> multiplier
        (see Year Parameters → Technology).
      </p>
    </div>
  );
}
