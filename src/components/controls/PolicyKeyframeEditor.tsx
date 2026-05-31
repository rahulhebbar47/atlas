/**
 * ATLAS Policy Keyframe Editor (Phase 5e — Mode-Based Redesign)
 *
 * Three modes for intuitive policy schedule editing:
 *   - Constant: single year + single slider (most common)
 *   - Ramp: two year/slider rows for linear ramp scenarios
 *   - Custom: full keyframe card editor for power users (3+ points)
 *
 * Sparkline always visible as a visual preview of the interpolated curve.
 * Underlying PolicySchedule data structure unchanged — modes just provide
 * structured UIs for the 1- and 2-keyframe cases.
 */

import { useCallback, useMemo, useState } from 'react';
import type { PolicySchedule, PolicyKeyframe } from '@/types';
import { interpolatePolicy, normalizeSchedule } from '@/utils/policyInterpolation';

interface PolicyKeyframeEditorProps {
  label: string;
  schedule: PolicySchedule;
  onChange: (schedule: PolicySchedule) => void;
  currentYear: number;
  min: number;
  max: number;
  step: number;
  color: string;
  formatValue: (v: number) => string;
}

/** Years available for keyframe selection. */
const YEARS = Array.from({ length: 26 }, (_, i) => 2025 + i);

type EditorMode = 'constant' | 'ramp' | 'custom';

/** Infer initial mode from keyframe count. */
function inferMode(kf: PolicyKeyframe[]): EditorMode {
  if (kf.length <= 1) return 'constant';
  if (kf.length === 2) return 'ramp';
  return 'custom';
}

export function PolicyKeyframeEditor({
  label,
  schedule,
  onChange,
  currentYear,
  min,
  max,
  step,
  color,
  formatValue,
}: PolicyKeyframeEditorProps) {
  // Defensive: handle stale persisted data where schedule may be a raw number
  const safeSchedule: PolicySchedule = (schedule && Array.isArray(schedule.keyframes))
    ? schedule
    : { keyframes: [] };
  const kf = safeSchedule.keyframes;
  const currentValue = interpolatePolicy(safeSchedule, currentYear);

  // Explicit mode state — initialized from keyframe count, user can override
  const [modeOverride, setModeOverride] = useState<EditorMode | null>(null);
  const mode = modeOverride ?? inferMode(kf);

  // Interpolated values for sparkline (2025-2050)
  const sparklineData = useMemo(() => {
    const points: number[] = [];
    for (let y = 2025; y <= 2050; y++) {
      points.push(interpolatePolicy(safeSchedule, y));
    }
    return points;
  }, [safeSchedule]);

  // ── Mode switching ──

  const switchToConstant = useCallback(() => {
    setModeOverride('constant');
    if (kf.length === 0) {
      onChange({ keyframes: [{ year: currentYear, value: Math.round((max - min) / 2 / step) * step }] });
    } else {
      // Keep first keyframe only
      onChange({ keyframes: [kf[0]!] });
    }
  }, [kf, currentYear, max, min, step, onChange]);

  const switchToRamp = useCallback(() => {
    setModeOverride('ramp');
    if (kf.length === 0) {
      const midVal = Math.round((max - min) / 2 / step) * step;
      onChange({ keyframes: [
        { year: Math.min(currentYear, 2045), value: Math.round(midVal / 2 / step) * step },
        { year: Math.min(currentYear + 5, 2050), value: midVal },
      ] });
    } else if (kf.length === 1) {
      const endYear = Math.min(kf[0]!.year + 5, 2050);
      onChange({ keyframes: [kf[0]!, { year: endYear, value: kf[0]!.value }] });
    } else {
      // Keep first two
      onChange({ keyframes: [kf[0]!, kf[1]!] });
    }
  }, [kf, currentYear, max, min, step, onChange]);

  const switchToCustom = useCallback(() => {
    setModeOverride('custom');
    if (kf.length === 0) {
      onChange({ keyframes: [{ year: currentYear, value: Math.round((max - min) / 2 / step) * step }] });
    }
    // Otherwise keep existing keyframes as-is — mode override handles the rest
  }, [kf, currentYear, max, min, step, onChange]);

  // ── Constant mode handlers ──

  const handleConstantYear = useCallback((year: number) => {
    if (kf.length === 0) {
      onChange({ keyframes: [{ year, value: Math.round((max - min) / 2 / step) * step }] });
    } else {
      onChange({ keyframes: [{ ...kf[0]!, year }] });
    }
  }, [kf, max, min, step, onChange]);

  const handleConstantValue = useCallback((value: number) => {
    const clamped = Math.max(min, Math.min(max, value));
    if (kf.length === 0) {
      onChange({ keyframes: [{ year: currentYear, value: clamped }] });
    } else {
      onChange({ keyframes: [{ ...kf[0]!, value: clamped }] });
    }
  }, [kf, currentYear, min, max, onChange]);

  // ── Ramp mode handlers ──

  const handleRampYear = useCallback((idx: 0 | 1, year: number) => {
    const updated = [kf[0]!, kf[1]!];
    updated[idx] = { ...updated[idx]!, year };
    onChange(normalizeSchedule({ keyframes: updated }));
  }, [kf, onChange]);

  const handleRampValue = useCallback((idx: 0 | 1, value: number) => {
    const clamped = Math.max(min, Math.min(max, value));
    const updated = [kf[0]!, kf[1]!];
    updated[idx] = { ...updated[idx]!, value: clamped };
    onChange({ keyframes: updated });
  }, [kf, min, max, onChange]);

  // ── Custom mode handlers ──

  const handleCustomYearChange = useCallback(
    (index: number, newYear: number) => {
      const updated = kf.map((k, i) => (i === index ? { ...k, year: newYear } : k));
      onChange(normalizeSchedule({ keyframes: updated }));
    },
    [kf, onChange],
  );

  const handleCustomValueChange = useCallback(
    (index: number, newValue: number) => {
      const clamped = Math.max(min, Math.min(max, newValue));
      const updated = kf.map((k, i) => (i === index ? { ...k, value: clamped } : k));
      onChange({ keyframes: updated });
    },
    [kf, min, max, onChange],
  );

  const handleCustomRemove = useCallback(
    (index: number) => {
      onChange({ keyframes: kf.filter((_, i) => i !== index) });
    },
    [kf, onChange],
  );

  const handleCustomAdd = useCallback(() => {
    const newKf: PolicyKeyframe = {
      year: currentYear,
      value: kf.length > 0 ? currentValue : Math.round((max - min) / 2 / step) * step,
    };
    const filtered = kf.filter((k) => k.year !== currentYear);
    onChange(normalizeSchedule({ keyframes: [...filtered, newKf] }));
  }, [currentYear, currentValue, kf, max, min, step, onChange]);

  // ── Clear handler ──

  const handleClear = useCallback(() => {
    setModeOverride(null);
    onChange({ keyframes: [] });
  }, [onChange]);

  return (
    <div className="space-y-2">
      {/* Header: label + current interpolated value */}
      <div className="flex items-center justify-center">
        <span className="font-mono text-xs" style={{ color }}>
          At {currentYear}: {formatValue(currentValue)}
        </span>
      </div>

      {/* Sparkline */}
      <Sparkline data={sparklineData} color={color} max={max} currentYear={currentYear} />

      {/* Mode selector row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <ModeTab label="Constant" active={mode === 'constant'} color={color} onClick={switchToConstant} />
          <ModeTab label="Ramp" active={mode === 'ramp'} color={color} onClick={switchToRamp} />
          <ModeTab label="Custom" active={mode === 'custom'} color={color} onClick={switchToCustom} />
        </div>
        {kf.length > 0 && (
          <button
            onClick={handleClear}
            className="w-3 h-3 flex items-center justify-center rounded-full bg-bg-elevated text-text-muted hover:text-red-400 hover:bg-bg-elevated/80 transition-colors text-[11px] leading-none aspect-square"
            title="Clear all keyframes"
          >
            ×
          </button>
        )}
      </div>

      {/* Mode content */}
      {mode === 'constant' && (
        <ConstantMode
          keyframe={kf[0] ?? null}
          min={min} max={max} step={step}
          color={color}
          formatValue={formatValue}
          onYearChange={handleConstantYear}
          onValueChange={handleConstantValue}
        />
      )}

      {mode === 'ramp' && kf.length >= 2 && (
        <RampMode
          from={kf[0]!}
          to={kf[1]!}
          min={min} max={max} step={step}
          color={color}
          formatValue={formatValue}
          onYearChange={handleRampYear}
          onValueChange={handleRampValue}
        />
      )}

      {mode === 'custom' && (
        <CustomMode
          keyframes={kf}
          currentYear={currentYear}
          min={min} max={max} step={step}
          color={color}
          formatValue={formatValue}
          onYearChange={handleCustomYearChange}
          onValueChange={handleCustomValueChange}
          onRemove={handleCustomRemove}
          onAdd={handleCustomAdd}
        />
      )}
    </div>
  );
}

/* ─── Mode Tab ─────────────────────────────────────────────── */

function ModeTab({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-[10px] whitespace-nowrap px-2 py-0.5 rounded transition-colors ${
        active
          ? 'text-text-primary'
          : 'text-text-muted hover:text-text-secondary'
      }`}
      style={active ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {label}
    </button>
  );
}

/* ─── Sparkline ─────────────────────────────────────────────── */

function Sparkline({
  data,
  color,
  max,
  currentYear,
}: {
  data: number[];
  color: string;
  max: number;
  currentYear: number;
}) {
  const width = 200;
  const height = 36;
  const pad = 1;

  const dataMax = Math.max(max, ...data) || 1;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - 2 * pad);
    const y = height - pad - (v / dataMax) * (height - 2 * pad);
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1]!.x.toFixed(1)},${height - pad} L${pad},${height - pad} Z`;

  const yearIdx = currentYear - 2025;
  const markerX = yearIdx >= 0 && yearIdx < data.length
    ? pad + (yearIdx / (data.length - 1)) * (width - 2 * pad)
    : null;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="rounded">
      <rect width={width} height={height} fill="var(--color-bg-elevated)" rx={3} />
      <path d={areaPath} fill={color} opacity={0.15} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} />
      {markerX !== null && (
        <line x1={markerX} y1={pad} x2={markerX} y2={height - pad} stroke={color} strokeWidth={0.75} strokeDasharray="2,2" opacity={0.6} />
      )}
      <text x={pad + 2} y={height - 3} fill="var(--color-text-muted)" fontSize={7} fontFamily="var(--font-mono)">2025</text>
      <text x={width - pad - 2} y={height - 3} fill="var(--color-text-muted)" fontSize={7} fontFamily="var(--font-mono)" textAnchor="end">2050</text>
    </svg>
  );
}

/* ─── Year Dropdown (shared) ───────────────────────────────── */

function YearDropdown({
  value,
  onChange,
  disabledYears,
}: {
  value: number;
  onChange: (year: number) => void;
  disabledYears?: number[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="w-[62px] bg-bg-surface border border-border/50 rounded px-1 py-0.5 font-mono text-[11px] text-text-primary focus:border-gold/50 focus:outline-none appearance-none cursor-pointer"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='4' viewBox='0 0 6 4'%3E%3Cpath d='M0 0l3 4 3-4z' fill='%234E5D75'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 4px center',
        paddingRight: '14px',
      }}
    >
      {YEARS.map((y) => {
        const taken = disabledYears?.includes(y) && y !== value;
        return (
          <option key={y} value={y} disabled={taken}>
            {y}
          </option>
        );
      })}
    </select>
  );
}

/* ─── Value Slider Row (shared) ────────────────────────────── */

function ValueSliderRow({
  value,
  min,
  max,
  step,
  color,
  formatValue,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  color: string;
  formatValue: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const fillPct = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className="space-y-0.5">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={(e) => onChange(parseFloat((e.target as HTMLInputElement).value))}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        style={{
          '--slider-color': color,
          background: `linear-gradient(to right, ${color} 0%, ${color} ${fillPct}%, var(--color-bg-surface) ${fillPct}%, var(--color-bg-surface) 100%)`,
        } as React.CSSProperties}
      />
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-[9px] font-mono">{formatValue(min)}</span>
        <span className="text-text-muted text-[9px] font-mono">{formatValue(max)}</span>
      </div>
    </div>
  );
}

/* ─── Constant Mode ────────────────────────────────────────── */

function ConstantMode({
  keyframe,
  min, max, step, color, formatValue,
  onYearChange,
  onValueChange,
}: {
  keyframe: PolicyKeyframe | null;
  min: number; max: number; step: number;
  color: string;
  formatValue: (v: number) => string;
  onYearChange: (year: number) => void;
  onValueChange: (value: number) => void;
}) {
  if (!keyframe) {
    return <div className="font-mono text-[9px] text-text-muted py-1">No keyframes — policy inactive</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-text-muted text-[10px] font-mono w-10">Start</span>
        <YearDropdown value={keyframe.year} onChange={onYearChange} />
        <span className="font-mono text-xs flex-1 text-right" style={{ color }}>
          {formatValue(keyframe.value)}
        </span>
      </div>
      <ValueSliderRow
        value={keyframe.value}
        min={min} max={max} step={step}
        color={color} formatValue={formatValue}
        onChange={onValueChange}
      />
    </div>
  );
}

/* ─── Ramp Mode ────────────────────────────────────────────── */

function RampMode({
  from,
  to,
  min, max, step, color, formatValue,
  onYearChange,
  onValueChange,
}: {
  from: PolicyKeyframe;
  to: PolicyKeyframe;
  min: number; max: number; step: number;
  color: string;
  formatValue: (v: number) => string;
  onYearChange: (idx: 0 | 1, year: number) => void;
  onValueChange: (idx: 0 | 1, value: number) => void;
}) {
  return (
    <div className="space-y-3">
      {/* From */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-[10px] font-mono w-10">From</span>
          <YearDropdown
            value={from.year}
            onChange={(y) => onYearChange(0, y)}
            disabledYears={[to.year]}
          />
          <span className="font-mono text-xs flex-1 text-right" style={{ color }}>
            {formatValue(from.value)}
          </span>
        </div>
        <ValueSliderRow
          value={from.value}
          min={min} max={max} step={step}
          color={color} formatValue={formatValue}
          onChange={(v) => onValueChange(0, v)}
        />
      </div>

      {/* Divider with arrow */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex-1 border-t border-border/20" />
        <span className="text-text-muted text-[10px]">\u2193</span>
        <div className="flex-1 border-t border-border/20" />
      </div>

      {/* To */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-[10px] font-mono w-10">To</span>
          <YearDropdown
            value={to.year}
            onChange={(y) => onYearChange(1, y)}
            disabledYears={[from.year]}
          />
          <span className="font-mono text-xs flex-1 text-right" style={{ color }}>
            {formatValue(to.value)}
          </span>
        </div>
        <ValueSliderRow
          value={to.value}
          min={min} max={max} step={step}
          color={color} formatValue={formatValue}
          onChange={(v) => onValueChange(1, v)}
        />
      </div>
    </div>
  );
}

/* ─── Custom Mode ──────────────────────────────────────────── */

function CustomMode({
  keyframes,
  currentYear,
  min, max, step, color, formatValue,
  onYearChange,
  onValueChange,
  onRemove,
  onAdd,
}: {
  keyframes: PolicyKeyframe[];
  currentYear: number;
  min: number; max: number; step: number;
  color: string;
  formatValue: (v: number) => string;
  onYearChange: (index: number, year: number) => void;
  onValueChange: (index: number, value: number) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
}) {
  const usedYears = keyframes.map((k) => k.year);

  return (
    <div className="space-y-1.5">
      {keyframes.length === 0 && (
        <div className="font-mono text-[9px] text-text-muted py-1">No keyframes — policy inactive</div>
      )}

      {keyframes.map((k, i) => (
        <KeyframeCard
          key={`${i}-${k.year}`}
          keyframe={k}
          index={i}
          min={min} max={max} step={step}
          color={color}
          formatValue={formatValue}
          usedYears={usedYears}
          onYearChange={onYearChange}
          onValueChange={onValueChange}
          onRemove={onRemove}
        />
      ))}

      <button
        onClick={onAdd}
        className="w-full py-1.5 border border-dashed border-border/40 rounded font-mono text-[10px] text-text-muted hover:text-gold hover:border-gold/30 transition-colors"
      >
        + Add Keyframe at {currentYear}
      </button>
    </div>
  );
}

/* ─── Keyframe Card (Custom mode) ──────────────────────────── */

function KeyframeCard({
  keyframe,
  index,
  min, max, step, color, formatValue,
  usedYears,
  onYearChange,
  onValueChange,
  onRemove,
}: {
  keyframe: PolicyKeyframe;
  index: number;
  min: number; max: number; step: number;
  color: string;
  formatValue: (v: number) => string;
  usedYears: number[];
  onYearChange: (index: number, year: number) => void;
  onValueChange: (index: number, value: number) => void;
  onRemove: (index: number) => void;
}) {
  const fillPct = max > min ? ((keyframe.value - min) / (max - min)) * 100 : 0;

  return (
    <div className="rounded-md border border-border/30 bg-bg-elevated/50 px-2.5 py-2 space-y-1.5">
      <div className="flex items-center gap-2">
        <YearDropdown
          value={keyframe.year}
          onChange={(y) => onYearChange(index, y)}
          disabledYears={usedYears}
        />
        <span className="font-mono text-xs flex-1" style={{ color }}>
          {formatValue(keyframe.value)}
        </span>
        <button
          onClick={() => onRemove(index)}
          className="w-3 h-3 flex items-center justify-center rounded-full bg-bg-elevated text-text-muted hover:text-red-400 hover:bg-bg-elevated/80 transition-colors text-[11px] leading-none aspect-square flex-shrink-0 ml-auto"
          title="Remove keyframe"
        >
          ×
        </button>
      </div>

      <input
        type="range"
        min={min} max={max} step={step}
        value={keyframe.value}
        onInput={(e) => onValueChange(index, parseFloat((e.target as HTMLInputElement).value))}
        onChange={(e) => onValueChange(index, parseFloat(e.target.value))}
        className="w-full"
        style={{
          '--slider-color': color,
          background: `linear-gradient(to right, ${color} 0%, ${color} ${fillPct}%, var(--color-bg-surface) ${fillPct}%, var(--color-bg-surface) 100%)`,
        } as React.CSSProperties}
      />

      <div className="flex items-center justify-between">
        <span className="text-text-muted text-[9px] font-mono">{formatValue(min)}</span>
        <span className="text-text-muted text-[9px] font-mono">{formatValue(max)}</span>
      </div>
    </div>
  );
}
