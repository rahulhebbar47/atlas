/**
 * POLICY PACKAGE MANIFESTS  — the existing gallery presets RE-DERIVED as
 * PolicyManifests, SUBSUMING (not duplicating) the live machinery. Rule (i):
 * designLabel states accurately what is modeled; referent cited where the package
 * claims to represent a real system.
 *
 * THE PER-FIELD REBUILD (a recorded design decision-08-08, the sidebar↔Advanced binding): the
 * three support programs write PER-FIELD config assignments (values sourced from the
 * POLICY_PRESETS they previously pointed at) so the Advanced editor shows what the
 * sidebar chose, a user's Advanced edit wins per key, and the packages compose with
 * each other (disjoint policyConfig.* key sets). Each declares its card params;
 * scheduleField onsets ride the start-year keyframe (0 before it — the
 * interpolatePolicy contract). Dead-on-simulation-path preset fields are NOT written
 * (ubi.phaseOut, wageSubsidy.phaseOutThreshold, retraining.effectivenessRate — writing
 * dead fields would claim modeling that does not occur).
 *
 * pkg-full-package stays on the policyPreset object-slot channel (hidden from the
 * sidebar via HIDDEN_POLICY_IDS; reachable by import/persisted compositions; the
 * compiler's cross-channel backstop surfaces any fight with per-field packages).
 */
import type { PolicyManifest } from '@/types/manifests';

/** The packages the sidebar does NOT render (author orders 2026-08-08): the fiscal
 *  course and Fed stance live as Government axis chips; the stress-test full package
 *  leaves the zone with the per-field rebuild. Manifests, compiler slots, and
 *  tests keep all three; persisted/imported compositions still compile. Applied
 *  by every policy-zone surface (WorldviewSidebar, AxisBoardView). */
export const HIDDEN_POLICY_IDS: ReadonlySet<string> = new Set([
  'pkg-austerity-turn', 'pkg-accommodative-fed', 'pkg-full-package',
]);

// DEPRECATED (the per-field rebuild): the three support programs' retired object-slot
// writes, kept per the no-delete rule (the POLICY_PRESETS they pointed at remain live
// in constants.ts — the preset gallery and pkg-full-package still consume that system):
//   pkg-ubi-1000        → writes: [{ kind: 'policyPreset', presetId: 'progressive_ubi' }]
//   pkg-asset-democracy → writes: [{ kind: 'policyPreset', presetId: 'asset_democracy' }]
//   pkg-nordic          → writes: [{ kind: 'policyPreset', presetId: 'nordic_model' }]

export const POLICY_MANIFESTS: readonly PolicyManifest[] = [
  {
    species: 'policy', id: 'pkg-ubi-1000', title: 'UBI $1,000/month',
    designLabel: 'Models a universal basic income to all adults 18+, inflation-indexed, from the chosen start year. Amount and start year adjustable on the card; every other lever in Advanced.',
    referent: 'Yang 2020 Freedom Dividend proposal',
    writes: [
      { kind: 'configField', key: 'policyConfig.ubi.enabled', value: true },
      {
        kind: 'scheduleField', key: 'policyConfig.ubi.monthlyAmount',
        valueParam: 'amount', defaultValue: 1000,
        yearParam: 'startYear', defaultYear: 2025,
      },
    ],
    params: [
      { id: 'startYear', title: 'Starts', min: 2025, max: 2045, step: 1, default: 2025, unit: 'yr' },
      { id: 'amount', title: 'Monthly amount', min: 250, max: 3000, step: 50, default: 1000, unit: '$' },
    ],
  },
  {
    species: 'policy', id: 'pkg-asset-democracy', title: 'Asset democracy',
    designLabel: 'Models a sovereign wealth fund with universal equity stakes and dividend distribution (design-maximal asset-channel package). Creation year, initial size, and dividend rate adjustable on the card.',
    writes: [
      { kind: 'configField', key: 'policyConfig.sovereignWealthFund.enabled', value: true },
      // The canonical startYear read site (first write bound to the param): the
      // fund's own creation-year field — the model seeds initialFundSize AT this year.
      { kind: 'configField', key: 'policyConfig.sovereignWealthFund.startYear', value: 2025, param: 'startYear' },
      { kind: 'configField', key: 'policyConfig.sovereignWealthFund.initialFundSize', value: 500, param: 'fundSize' },
      { kind: 'configField', key: 'policyConfig.sovereignWealthFund.distributionRate', value: 0.04, param: 'dividendRate' },
      {
        kind: 'scheduleField', key: 'policyConfig.sovereignWealthFund.annualContribution',
        defaultValue: 100, yearParam: 'startYear', defaultYear: 2025,
      },
      {
        kind: 'scheduleField', key: 'policyConfig.sovereignWealthFund.ownershipFraction',
        defaultValue: 0.10, yearParam: 'startYear', defaultYear: 2025,
      },
    ],
    params: [
      { id: 'startYear', title: 'Created', min: 2025, max: 2045, step: 1, default: 2025, unit: 'yr' },
      { id: 'fundSize', title: 'Starting fund', min: 0, max: 2000, step: 50, default: 500, unit: '$B' },
      { id: 'dividendRate', title: 'Dividend rate', min: 0.01, max: 0.08, step: 0.005, default: 0.04, unit: '%' },
    ],
  },
  {
    species: 'policy', id: 'pkg-nordic', title: 'Nordic model',
    designLabel: 'Models a flexicurity package: 80% UI replacement for 78 weeks (the Danish ~2-year duration), wage subsidies on the Kurzarbeit pattern, active retraining. Replacement rate, duration, and start year adjustable on the card.',
    referent: 'Denmark flexicurity system + German Kurzarbeit',
    writes: [
      // enhancedUI first: the replacement-rate schedule is the canonical startYear
      // read site for the card projection.
      { kind: 'configField', key: 'policyConfig.enhancedUI.enabled', value: true },
      {
        kind: 'scheduleField', key: 'policyConfig.enhancedUI.replacementRate',
        valueParam: 'replacementRate', defaultValue: 0.80,
        yearParam: 'startYear', defaultYear: 2025,
      },
      { kind: 'configField', key: 'policyConfig.enhancedUI.durationWeeks', value: 78, param: 'durationWeeks' },
      { kind: 'configField', key: 'policyConfig.enhancedUI.retrainingBonus', value: 10_000 },
      { kind: 'configField', key: 'policyConfig.wageSubsidy.enabled', value: true },
      {
        kind: 'scheduleField', key: 'policyConfig.wageSubsidy.subsidyPercentage',
        defaultValue: 0.15, yearParam: 'startYear', defaultYear: 2025,
      },
      { kind: 'configField', key: 'policyConfig.wageSubsidy.maxSubsidyPerWorker', value: 15_000 },
      { kind: 'configField', key: 'policyConfig.retraining.enabled', value: true },
      {
        kind: 'scheduleField', key: 'policyConfig.retraining.stipendMonthly',
        defaultValue: 3_000, yearParam: 'startYear', defaultYear: 2025,
      },
      { kind: 'configField', key: 'policyConfig.retraining.durationMonths', value: 12 },
      { kind: 'configField', key: 'policyConfig.retraining.participationRate', value: 0.50 },
    ],
    params: [
      { id: 'startYear', title: 'Starts', min: 2025, max: 2045, step: 1, default: 2025, unit: 'yr' },
      { id: 'replacementRate', title: 'UI replacement', min: 0.5, max: 0.9, step: 0.05, default: 0.80, unit: '%' },
      { id: 'durationWeeks', title: 'UI duration', min: 26, max: 104, step: 2, default: 78, unit: 'wk' },
    ],
  },
  {
    // The stress-test composition stays on the object-slot channel, hidden from the
    // sidebar (per-field conversion would write every block including deprecated
    // levers; the honest form of "everything at design-max" remains the preset).
    species: 'policy', id: 'pkg-full-package', title: 'Full package',
    designLabel: 'Models every support program at design-maximal values simultaneously: 2-year UI (104 weeks), indexed UBI, a sovereign wealth fund, profit sharing, retraining (12 effective stipend-months — the model\'s annualization cap; a longer entitlement is a registered extension). A stress-test composition, not a real system.',
    writes: [{ kind: 'policyPreset', presetId: 'full_package' }],
  },
  {
    species: 'policy', id: 'pkg-austerity-turn', title: 'Austerity turn',
    designLabel: 'Models a fiscal consolidation regime: spending cuts plus revenue increases once the debt ratio crosses its trigger. A chosen policy course, not an external event.',
    writes: [{ kind: 'fiscalPreset', presetId: 'balanced_reduction' }],
  },
  {
    species: 'policy', id: 'pkg-accommodative-fed', title: 'Accommodative Fed',
    designLabel: 'Models an employment-weighted Federal Reserve reaction function (the balanced-mandate profile with employment-gap emphasis).',
    writes: [{ kind: 'fedPreset', presetId: 'balanced_mandate' }],
  },
];
