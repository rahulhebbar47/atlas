/**
 * ATLAS Policy Controls (Phase 5e)
 *
 * Left sidebar container organizing all 9 policies into 3 channel groups.
 * Each channel has a section header with channel color accent.
 * Uses PolicyKeyframeEditor for scheduled fields, Slider for flat fields.
 * Calls updatePolicyParam() for changes, togglePolicy() for toggles.
 */

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { POLICY_CHANNEL_COLORS } from '@/models/constants';
import { usePolicyConfig } from '@/hooks/usePolicyData';
import { Slider } from '@/components/shared/Slider';
import { PolicyKeyframeEditor } from './PolicyKeyframeEditor';
import { PolicyPresetSelector } from './PolicyPresetSelector';
import { PolicyToggleCard } from './PolicyToggleCard';
import { formatCurrency, formatPercent } from '@/utils/format';
import { interpolatePolicy } from '@/utils/policyInterpolation';
import type { PolicyConfig, PolicySchedule } from '@/types';

export function PolicyControls() {
  const config = usePolicyConfig();
  const currentYear = useSimulationStore((s) => s.currentYear);
  const togglePolicy = useSimulationStore((s) => s.togglePolicy);
  const updatePolicyParam = useSimulationStore((s) => s.updatePolicyParam);
  const resetPolicyToDefaults = useSimulationStore((s) => s.resetPolicyToDefaults);

  const update = useCallback(
    <K extends keyof PolicyConfig>(key: K, partial: Partial<PolicyConfig[K]>) => {
      updatePolicyParam(key, partial);
    },
    [updatePolicyParam],
  );

  // Helper to read current interpolated value for summaries
  const val = (schedule: PolicySchedule) => interpolatePolicy(schedule, currentYear);

  return (
    <div className="space-y-4">
      {/* Presets */}
      <PolicyPresetSelector />

      {/* Reset */}
      <button
        onClick={resetPolicyToDefaults}
        className="font-mono text-[9px] text-text-muted hover:text-gold transition-colors"
      >
        Reset to defaults
      </button>

      {/* ── Wage Channel ── */}
      <ChannelHeader label="Wage Channel" color={POLICY_CHANNEL_COLORS.wage} />

      <PolicyToggleCard
        label="Minimum Wage"
        summary={`$${val(config.minimumWage.federalMinimum).toFixed(2)}/hr`}
        enabled={config.minimumWage.enabled}
        onToggle={(v) => togglePolicy('minimumWage', v)}
        accentColor={POLICY_CHANNEL_COLORS.wage}
      >
        <PolicyKeyframeEditor
          label="Federal Minimum"
          schedule={config.minimumWage.federalMinimum}
          onChange={(s) => update('minimumWage', { federalMinimum: s })}
          currentYear={currentYear}
          min={7.25} max={30} step={0.25}
          color={POLICY_CHANNEL_COLORS.wage}
          formatValue={(v) => `$${v.toFixed(2)}`}
        />
      </PolicyToggleCard>

      <PolicyToggleCard
        label="Wage Subsidy"
        summary={config.wageSubsidy.enabled ? `${(val(config.wageSubsidy.subsidyPercentage) * 100).toFixed(0)}%` : 'Off'}
        enabled={config.wageSubsidy.enabled}
        onToggle={(v) => togglePolicy('wageSubsidy', v)}
        accentColor={POLICY_CHANNEL_COLORS.wage}
      >
        <PolicyKeyframeEditor
          label="Subsidy %"
          schedule={config.wageSubsidy.subsidyPercentage}
          onChange={(s) => update('wageSubsidy', { subsidyPercentage: s })}
          currentYear={currentYear}
          min={0} max={0.30} step={0.01}
          color={POLICY_CHANNEL_COLORS.wage}
          formatValue={(v) => formatPercent(v, 0)}
        />
        <Slider
          label="Max per Worker"
          value={config.wageSubsidy.maxSubsidyPerWorker}
          min={0} max={20000} step={500}
          color={POLICY_CHANNEL_COLORS.wage}
          onChange={(v) => update('wageSubsidy', { maxSubsidyPerWorker: v })}
          formatValue={(v) => formatCurrency(v, { compact: true })}
        />
      </PolicyToggleCard>

      {/* DEPRECATED (Phase 5h Fix 6): Work Week Reduction — type/config/UI exist but
          no computation logic was ever implemented in policy.ts. Hiding from UI until
          a proper model is built (see policy.ts:73 comment). */}
      {/* <PolicyToggleCard
        label="Work Week Reduction"
        summary={`${val(config.workWeekReduction.standardHours)}hr/wk`}
        enabled={config.workWeekReduction.enabled}
        onToggle={(v) => togglePolicy('workWeekReduction', v)}
        accentColor={POLICY_CHANNEL_COLORS.wage}
      >
        <PolicyKeyframeEditor
          label="Standard Hours"
          schedule={config.workWeekReduction.standardHours}
          onChange={(s) => update('workWeekReduction', { standardHours: s })}
          currentYear={currentYear}
          min={20} max={40} step={1}
          color={POLICY_CHANNEL_COLORS.wage}
          formatValue={(v) => `${v}hr`}
        />
      </PolicyToggleCard> */}

      {/* ── Asset Channel ── */}
      <ChannelHeader label="Asset Channel" color={POLICY_CHANNEL_COLORS.asset} />

      <PolicyToggleCard
        label="Sovereign Wealth Fund"
        summary={config.sovereignWealthFund.enabled ? `$${config.sovereignWealthFund.initialFundSize}B` : 'Off'}
        enabled={config.sovereignWealthFund.enabled}
        onToggle={(v) => togglePolicy('sovereignWealthFund', v)}
        accentColor={POLICY_CHANNEL_COLORS.asset}
      >
        <Slider
          label="Initial Fund Size"
          value={config.sovereignWealthFund.initialFundSize}
          min={0} max={5000} step={50}
          color={POLICY_CHANNEL_COLORS.asset}
          onChange={(v) => update('sovereignWealthFund', { initialFundSize: v })}
          formatValue={(v) => `$${v}B`}
        />
        <PolicyKeyframeEditor
          label="Annual Contribution"
          schedule={config.sovereignWealthFund.annualContribution}
          onChange={(s) => update('sovereignWealthFund', { annualContribution: s })}
          currentYear={currentYear}
          min={0} max={500} step={10}
          color={POLICY_CHANNEL_COLORS.asset}
          formatValue={(v) => `$${v}B/yr`}
        />
        <Slider
          label="Distribution Rate"
          value={config.sovereignWealthFund.distributionRate}
          min={0} max={0.10} step={0.005}
          color={POLICY_CHANNEL_COLORS.asset}
          onChange={(v) => update('sovereignWealthFund', { distributionRate: v })}
          formatValue={(v) => formatPercent(v, 1)}
        />
        {/* Phase 5g: Universal Equity fields merged into SWF section */}
        <PolicyKeyframeEditor
          label="Equity Ownership Fraction"
          schedule={config.sovereignWealthFund.ownershipFraction}
          onChange={(s) => update('sovereignWealthFund', { ownershipFraction: s })}
          currentYear={currentYear}
          min={0} max={0.50} step={0.01}
          color={POLICY_CHANNEL_COLORS.asset}
          formatValue={(v) => formatPercent(v, 0)}
        />
        <Slider
          label="AI Company Profits"
          value={config.sovereignWealthFund.totalAICompanyProfits}
          min={100} max={2000} step={50}
          color={POLICY_CHANNEL_COLORS.asset}
          onChange={(v) => update('sovereignWealthFund', { totalAICompanyProfits: v })}
          formatValue={(v) => `$${v}B/yr`}
        />
      </PolicyToggleCard>

      <PolicyToggleCard
        label="Profit Sharing"
        summary={config.profitSharing.enabled ? `${(val(config.profitSharing.mandatorySharePercentage) * 100).toFixed(0)}%` : 'Off'}
        enabled={config.profitSharing.enabled}
        onToggle={(v) => togglePolicy('profitSharing', v)}
        accentColor={POLICY_CHANNEL_COLORS.asset}
      >
        <PolicyKeyframeEditor
          label="Mandatory Share"
          schedule={config.profitSharing.mandatorySharePercentage}
          onChange={(s) => update('profitSharing', { mandatorySharePercentage: s })}
          currentYear={currentYear}
          min={0} max={0.30} step={0.01}
          color={POLICY_CHANNEL_COLORS.asset}
          formatValue={(v) => formatPercent(v, 0)}
        />
      </PolicyToggleCard>

      {/* ── Transfer Channel ── */}
      <ChannelHeader label="Transfer Channel" color={POLICY_CHANNEL_COLORS.transfer} />

      <PolicyToggleCard
        label="Universal Basic Income"
        summary={config.ubi.enabled ? `$${val(config.ubi.monthlyAmount).toLocaleString()}/mo` : 'Off'}
        enabled={config.ubi.enabled}
        onToggle={(v) => togglePolicy('ubi', v)}
        accentColor={POLICY_CHANNEL_COLORS.transfer}
      >
        <PolicyKeyframeEditor
          label=""
          schedule={config.ubi.monthlyAmount}
          onChange={(s) => update('ubi', { monthlyAmount: s })}
          currentYear={currentYear}
          min={0} max={10000} step={50}
          color={POLICY_CHANNEL_COLORS.transfer}
          formatValue={(v) => `$${v.toLocaleString()}/mo`}
        />
        <Slider
          label="Age Threshold"
          value={config.ubi.ageThreshold}
          min={16} max={21} step={1}
          color={POLICY_CHANNEL_COLORS.transfer}
          onChange={(v) => update('ubi', { ageThreshold: v })}
          formatValue={(v) => `${v}+`}
        />
      </PolicyToggleCard>

      <PolicyToggleCard
        label="Enhanced UI"
        summary={config.enhancedUI.enabled ? `${(val(config.enhancedUI.replacementRate) * 100).toFixed(0)}% / ${config.enhancedUI.durationWeeks}wk` : 'Off'}
        enabled={config.enhancedUI.enabled}
        onToggle={(v) => togglePolicy('enhancedUI', v)}
        accentColor={POLICY_CHANNEL_COLORS.transfer}
      >
        <PolicyKeyframeEditor
          label="Replacement Rate"
          schedule={config.enhancedUI.replacementRate}
          onChange={(s) => update('enhancedUI', { replacementRate: s })}
          currentYear={currentYear}
          min={0} max={1.0} step={0.05}
          color={POLICY_CHANNEL_COLORS.transfer}
          formatValue={(v) => formatPercent(v, 0)}
        />
        <Slider
          label="Duration"
          value={config.enhancedUI.durationWeeks}
          min={0} max={104} step={2}
          color={POLICY_CHANNEL_COLORS.transfer}
          onChange={(v) => update('enhancedUI', { durationWeeks: v })}
          formatValue={(v) => `${v} wk`}
        />
      </PolicyToggleCard>

      <PolicyToggleCard
        label="Retraining Programs"
        summary={config.retraining.enabled ? `$${val(config.retraining.stipendMonthly).toLocaleString()}/mo` : 'Off'}
        enabled={config.retraining.enabled}
        onToggle={(v) => togglePolicy('retraining', v)}
        accentColor={POLICY_CHANNEL_COLORS.transfer}
      >
        <PolicyKeyframeEditor
          label="Monthly Stipend"
          schedule={config.retraining.stipendMonthly}
          onChange={(s) => update('retraining', { stipendMonthly: s })}
          currentYear={currentYear}
          min={0} max={5000} step={100}
          color={POLICY_CHANNEL_COLORS.transfer}
          formatValue={(v) => `$${v.toLocaleString()}`}
        />
        <Slider
          label="Effectiveness"
          value={config.retraining.effectivenessRate}
          min={0} max={1.0} step={0.05}
          color={POLICY_CHANNEL_COLORS.transfer}
          onChange={(v) => update('retraining', { effectivenessRate: v })}
          formatValue={(v) => formatPercent(v, 0)}
        />
      </PolicyToggleCard>
    </div>
  );
}

function ChannelHeader({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted">
        {label}
      </span>
    </div>
  );
}
