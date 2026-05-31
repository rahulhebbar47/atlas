/**
 * ATLAS Verification Audit — Report Generator
 *
 * Builds a comprehensive AUDIT_REPORT.md with:
 * - Executive summary
 * - Per-scenario comparison tables
 * - Invariant check results
 * - Extreme value sweep results
 * - Failure detail sections
 *
 * Also generates individual per-scenario/test files in results/ for
 * feeding into Claude or other LLM inspection.
 */

import type {
  ComparisonResult,
  InvariantCheckResult,
  ExtremeValueResult,
  AuditSummary,
  ScenarioSummary,
  ComparisonStatus,
  ScenarioDefinition,
} from './types';

// ============================================================
// Summary computation
// ============================================================

export function computeSummary(
  comparisons: ComparisonResult[],
  invariants: InvariantCheckResult[],
  extremes: ExtremeValueResult[],
): AuditSummary {
  const passCount = comparisons.filter(c => c.status === 'PASS').length;
  const warnCount = comparisons.filter(c => c.status === 'WARN').length;
  const failCount = comparisons.filter(c => c.status === 'FAIL').length;

  // Per-scenario breakdown
  const scenarioMap = new Map<string, ComparisonResult[]>();
  for (const c of comparisons) {
    const arr = scenarioMap.get(c.scenario) ?? [];
    arr.push(c);
    scenarioMap.set(c.scenario, arr);
  }

  const scenarioResults: ScenarioSummary[] = [];
  for (const [id, results] of scenarioMap) {
    const sp = results.filter(r => r.status === 'PASS').length;
    const sw = results.filter(r => r.status === 'WARN').length;
    const sf = results.filter(r => r.status === 'FAIL').length;

    // Find worst field
    let worstField = '';
    let worstError = 0;
    for (const r of results) {
      if (Number.isFinite(r.percentError) && r.percentError > worstError) {
        worstError = r.percentError;
        worstField = r.field;
      }
    }

    scenarioResults.push({
      scenarioId: id,
      scenarioName: id,
      totalFields: results.length,
      passCount: sp,
      warnCount: sw,
      failCount: sf,
      worstField,
      worstError,
    });
  }

  return {
    totalComparisons: comparisons.length,
    passCount,
    warnCount,
    failCount,
    totalInvariantChecks: invariants.length,
    invariantPassCount: invariants.filter(i => i.passed).length,
    invariantFailCount: invariants.filter(i => !i.passed).length,
    totalExtremeValueChecks: extremes.length,
    extremePassCount: extremes.filter(e => e.passed).length,
    extremeFailCount: extremes.filter(e => !e.passed).length,
    scenarioResults,
  };
}

// ============================================================
// Markdown generation
// ============================================================

function statusEmoji(status: ComparisonStatus): string {
  switch (status) {
    case 'PASS': return 'PASS';
    case 'WARN': return 'WARN';
    case 'FAIL': return '**FAIL**';
  }
}

function pctStr(n: number): string {
  if (!Number.isFinite(n)) return 'Inf';
  return (n * 100).toFixed(4) + '%';
}

function numStr(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(4)}T`;
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(4)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(4)}M`;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(4)}K`;
  return n.toFixed(6);
}

export function generateReport(
  comparisons: ComparisonResult[],
  invariants: InvariantCheckResult[],
  extremes: ExtremeValueResult[],
  summary: AuditSummary,
): string {
  const lines: string[] = [];

  // Header
  lines.push('# ATLAS Verification Audit Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  // Executive Summary
  lines.push('## Executive Summary');
  lines.push('');
  lines.push('| Category | Total | Pass | Warn/Fail |');
  lines.push('|----------|------:|-----:|----------:|');
  lines.push(`| Field Comparisons | ${summary.totalComparisons} | ${summary.passCount} | ${summary.warnCount}W / ${summary.failCount}F |`);
  lines.push(`| Invariant Checks | ${summary.totalInvariantChecks} | ${summary.invariantPassCount} | ${summary.invariantFailCount}F |`);
  lines.push(`| Extreme Value Tests | ${summary.totalExtremeValueChecks} | ${summary.extremePassCount} | ${summary.extremeFailCount}F |`);
  const totalChecks = summary.totalComparisons + summary.totalInvariantChecks + summary.totalExtremeValueChecks;
  const totalFails = summary.failCount + summary.invariantFailCount + summary.extremeFailCount;
  lines.push(`| **TOTAL** | **${totalChecks}** | **${summary.passCount + summary.invariantPassCount + summary.extremePassCount}** | **${totalFails}** |`);
  lines.push('');

  if (totalFails === 0 && summary.warnCount === 0) {
    lines.push('**RESULT: ALL CHECKS PASSED**');
  } else if (totalFails === 0) {
    lines.push(`**RESULT: PASSED with ${summary.warnCount} warnings**`);
  } else {
    lines.push(`**RESULT: ${totalFails} FAILURES detected**`);
  }
  lines.push('');

  // Per-Scenario Summary
  lines.push('## Scenario Summary');
  lines.push('');
  lines.push('| Scenario | Fields | Pass | Warn | Fail | Worst Field | Worst Error |');
  lines.push('|----------|-------:|-----:|-----:|-----:|-------------|------------|');
  for (const s of summary.scenarioResults) {
    lines.push(
      `| ${s.scenarioId} | ${s.totalFields} | ${s.passCount} | ${s.warnCount} | ${s.failCount} | ${s.worstField || '-'} | ${pctStr(s.worstError)} |`,
    );
  }
  lines.push('');

  // Failure Details (if any)
  const failures = comparisons.filter(c => c.status === 'FAIL');
  if (failures.length > 0) {
    lines.push('## Field Comparison Failures');
    lines.push('');
    lines.push('| Scenario | Year | Field | Expected | Actual | Error |');
    lines.push('|----------|-----:|-------|----------|--------|------:|');
    for (const f of failures) {
      lines.push(
        `| ${f.scenario} | ${f.year} | ${f.field} | ${numStr(f.expected)} | ${numStr(f.actual)} | ${pctStr(f.percentError)} |`,
      );
    }
    lines.push('');
  }

  // Warning Details (if any, cap at 50)
  const warnings = comparisons.filter(c => c.status === 'WARN');
  if (warnings.length > 0) {
    lines.push('## Field Comparison Warnings');
    lines.push('');
    const displayWarnings = warnings.slice(0, 50);
    lines.push('| Scenario | Year | Field | Expected | Actual | Error |');
    lines.push('|----------|-----:|-------|----------|--------|------:|');
    for (const w of displayWarnings) {
      lines.push(
        `| ${w.scenario} | ${w.year} | ${w.field} | ${numStr(w.expected)} | ${numStr(w.actual)} | ${pctStr(w.percentError)} |`,
      );
    }
    if (warnings.length > 50) {
      lines.push(`\n*...and ${warnings.length - 50} more warnings*`);
    }
    lines.push('');
  }

  // Invariant Check Failures
  const invFails = invariants.filter(i => !i.passed);
  if (invFails.length > 0) {
    lines.push('## Invariant Check Failures');
    lines.push('');
    lines.push('| Scenario | Year | Check | Expected | Actual | Message |');
    lines.push('|----------|-----:|-------|----------|--------|---------|');
    for (const f of invFails) {
      lines.push(
        `| ${f.scenario} | ${f.year} | ${f.check} | ${f.expected ?? '-'} | ${f.actual ?? '-'} | ${f.message} |`,
      );
    }
    lines.push('');
  }

  // Extreme Value Failures
  const extFails = extremes.filter(e => !e.passed);
  if (extFails.length > 0) {
    lines.push('## Extreme Value Failures');
    lines.push('');
    lines.push('| Parameter | Test Value | Year | Check | Message |');
    lines.push('|-----------|-----------|-----:|-------|---------|');
    for (const f of extFails) {
      lines.push(
        `| ${f.parameter} | ${f.testValue} | ${f.year} | ${f.check} | ${f.message} |`,
      );
    }
    lines.push('');
  }

  // Per-Scenario Year-by-Year Tables (only for failures and warnings)
  const scenariosWithIssues = new Set<string>();
  for (const c of comparisons) {
    if (c.status !== 'PASS') scenariosWithIssues.add(c.scenario);
  }

  if (scenariosWithIssues.size > 0) {
    lines.push('## Detailed Year-by-Year Comparison (Scenarios with Issues)');
    lines.push('');

    for (const scenarioId of scenariosWithIssues) {
      const scenarioResults = comparisons.filter(c => c.scenario === scenarioId && c.status !== 'PASS');

      // Group by year
      const byYear = new Map<number, ComparisonResult[]>();
      for (const r of scenarioResults) {
        const arr = byYear.get(r.year) ?? [];
        arr.push(r);
        byYear.set(r.year, arr);
      }

      lines.push(`### ${scenarioId}`);
      lines.push('');

      for (const [year, results] of [...byYear.entries()].sort((a, b) => a[0] - b[0])) {
        lines.push(`**Year ${year}**`);
        lines.push('');
        lines.push('| Field | Expected | Actual | Error | Status |');
        lines.push('|-------|----------|--------|------:|--------|');
        for (const r of results) {
          lines.push(
            `| ${r.field} | ${numStr(r.expected)} | ${numStr(r.actual)} | ${pctStr(r.percentError)} | ${statusEmoji(r.status)} |`,
          );
        }
        lines.push('');
      }
    }
  }

  // Invariant Summary (all checks)
  lines.push('## Invariant Checks Summary');
  lines.push('');
  const invByScenario = new Map<string, InvariantCheckResult[]>();
  for (const inv of invariants) {
    const arr = invByScenario.get(inv.scenario) ?? [];
    arr.push(inv);
    invByScenario.set(inv.scenario, arr);
  }
  for (const [scenario, checks] of invByScenario) {
    const passed = checks.filter(c => c.passed).length;
    const failed = checks.filter(c => !c.passed).length;
    lines.push(`- **${scenario}**: ${passed} passed, ${failed} failed (${checks.length} total)`);
  }
  lines.push('');

  // Extreme Value Summary
  lines.push('## Extreme Value Sweep Summary');
  lines.push('');
  const extByParam = new Map<string, ExtremeValueResult[]>();
  for (const ext of extremes) {
    const arr = extByParam.get(ext.parameter) ?? [];
    arr.push(ext);
    extByParam.set(ext.parameter, arr);
  }
  for (const [param, checks] of extByParam) {
    const passed = checks.filter(c => c.passed).length;
    const failed = checks.filter(c => !c.passed).length;
    const status = failed === 0 ? 'PASS' : `${failed} FAIL`;
    lines.push(`- **${param}**: ${status} (${checks.length} checks)`);
  }
  lines.push('');

  // Footer
  lines.push('---');
  lines.push('*Report generated by ATLAS Verification Audit v1.0*');
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// Individual file generators (for per-test inspection)
// ============================================================

export interface IndividualReports {
  /** Filename → content */
  files: Map<string, string>;
}

/**
 * Generate individual report files for each scenario, invariant checks,
 * extreme value sweep, and a summary index.
 */
export function generateIndividualReports(
  scenarios: ScenarioDefinition[],
  comparisons: ComparisonResult[],
  invariants: InvariantCheckResult[],
  extremes: ExtremeValueResult[],
  summary: AuditSummary,
): IndividualReports {
  const files = new Map<string, string>();
  const timestamp = new Date().toISOString();

  // Group comparisons and invariants by scenario
  const compByScenario = new Map<string, ComparisonResult[]>();
  for (const c of comparisons) {
    const arr = compByScenario.get(c.scenario) ?? [];
    arr.push(c);
    compByScenario.set(c.scenario, arr);
  }
  const invByScenario = new Map<string, InvariantCheckResult[]>();
  for (const inv of invariants) {
    const arr = invByScenario.get(inv.scenario) ?? [];
    arr.push(inv);
    invByScenario.set(inv.scenario, arr);
  }

  // ── Summary index ──
  files.set('00-summary.md', generateSummaryIndex(scenarios, summary, timestamp));

  // ── Per-scenario files ──
  for (let i = 0; i < scenarios.length; i++) {
    const s = scenarios[i];
    const num = String(i + 1).padStart(2, '0');
    const scenarioComps = compByScenario.get(s.id) ?? [];
    const scenarioInvs = invByScenario.get(s.id) ?? [];
    const scenarioSummary = summary.scenarioResults.find(sr => sr.scenarioId === s.id);
    files.set(
      `${num}-${s.id}.md`,
      generateScenarioFile(s, scenarioComps, scenarioInvs, scenarioSummary, timestamp),
    );
  }

  // ── Invariant checks file ──
  files.set('09-invariant-checks.md', generateInvariantFile(invariants, invByScenario, timestamp));

  // ── Extreme value sweep file ──
  files.set('10-extreme-value-sweep.md', generateExtremeValueFile(extremes, timestamp));

  return { files };
}

// ── Summary index ──────────────────────────────────────────

function generateSummaryIndex(
  scenarios: ScenarioDefinition[],
  summary: AuditSummary,
  timestamp: string,
): string {
  const L: string[] = [];
  L.push('# ATLAS Verification Audit — Summary');
  L.push('');
  L.push(`Generated: ${timestamp}`);
  L.push('');

  // Executive summary table
  L.push('## Results Overview');
  L.push('');
  L.push('| Category | Total | Pass | Warn | Fail |');
  L.push('|----------|------:|-----:|-----:|-----:|');
  L.push(`| Field Comparisons | ${summary.totalComparisons} | ${summary.passCount} | ${summary.warnCount} | ${summary.failCount} |`);
  L.push(`| Invariant Checks | ${summary.totalInvariantChecks} | ${summary.invariantPassCount} | — | ${summary.invariantFailCount} |`);
  L.push(`| Extreme Value Tests | ${summary.totalExtremeValueChecks} | ${summary.extremePassCount} | — | ${summary.extremeFailCount} |`);
  const totalChecks = summary.totalComparisons + summary.totalInvariantChecks + summary.totalExtremeValueChecks;
  const totalPass = summary.passCount + summary.invariantPassCount + summary.extremePassCount;
  const totalFails = summary.failCount + summary.invariantFailCount + summary.extremeFailCount;
  L.push(`| **TOTAL** | **${totalChecks}** | **${totalPass}** | **${summary.warnCount}** | **${totalFails}** |`);
  L.push('');

  if (totalFails === 0 && summary.warnCount === 0) {
    L.push('**VERDICT: ALL CHECKS PASSED**');
  } else if (totalFails === 0) {
    L.push(`**VERDICT: PASSED with ${summary.warnCount} warnings**`);
  } else {
    L.push(`**VERDICT: ${totalFails} FAILURES detected**`);
  }
  L.push('');

  // Per-scenario table
  L.push('## Per-Scenario Results');
  L.push('');
  L.push('| # | Scenario | Pass | Warn | Fail | Worst Field | File |');
  L.push('|--:|----------|-----:|-----:|-----:|-------------|------|');
  for (let i = 0; i < scenarios.length; i++) {
    const s = scenarios[i];
    const sr = summary.scenarioResults.find(r => r.scenarioId === s.id);
    if (!sr) continue;
    const num = String(i + 1).padStart(2, '0');
    const fname = `${num}-${s.id}.md`;
    L.push(
      `| ${i + 1} | ${s.name} | ${sr.passCount} | ${sr.warnCount} | ${sr.failCount} | ${sr.worstField || '—'} | [${fname}](${fname}) |`,
    );
  }
  L.push('');

  // Links to other files
  L.push('## Other Reports');
  L.push('');
  L.push('- [Invariant Checks (all scenarios)](09-invariant-checks.md)');
  L.push('- [Extreme Value Sweep](10-extreme-value-sweep.md)');
  L.push('');

  // Scenario descriptions
  L.push('## Scenario Descriptions');
  L.push('');
  for (let i = 0; i < scenarios.length; i++) {
    const s = scenarios[i];
    L.push(`**${i + 1}. ${s.name}** — ${s.description}`);
  }
  L.push('');

  L.push('---');
  L.push('*Report generated by ATLAS Verification Audit v1.0*');
  L.push('');
  return L.join('\n');
}

// ── Per-scenario file ──────────────────────────────────────

function generateScenarioFile(
  scenario: ScenarioDefinition,
  comparisons: ComparisonResult[],
  invariants: InvariantCheckResult[],
  scenarioSummary: ScenarioSummary | undefined,
  timestamp: string,
): string {
  const L: string[] = [];
  L.push(`# Scenario: ${scenario.name}`);
  L.push('');
  L.push(`> ${scenario.description}`);
  L.push('');
  L.push(`Generated: ${timestamp}`);
  L.push('');

  // Summary stats
  const passCount = comparisons.filter(c => c.status === 'PASS').length;
  const warnCount = comparisons.filter(c => c.status === 'WARN').length;
  const failCount = comparisons.filter(c => c.status === 'FAIL').length;
  const invPass = invariants.filter(i => i.passed).length;
  const invFail = invariants.filter(i => !i.passed).length;

  L.push('## Summary');
  L.push('');
  L.push(`| Metric | Value |`);
  L.push(`|--------|------:|`);
  L.push(`| Total field comparisons | ${comparisons.length} |`);
  L.push(`| PASS (<0.01% error) | ${passCount} |`);
  L.push(`| WARN (0.01-1% error) | ${warnCount} |`);
  L.push(`| FAIL (>1% error) | ${failCount} |`);
  L.push(`| Invariant checks | ${invariants.length} (${invPass} pass, ${invFail} fail) |`);
  if (scenarioSummary?.worstField) {
    L.push(`| Worst field | ${scenarioSummary.worstField} (${pctStr(scenarioSummary.worstError)}) |`);
  }
  L.push('');

  // ── Failures table ──
  const failures = comparisons.filter(c => c.status === 'FAIL');
  if (failures.length > 0) {
    L.push('## Field Comparison Failures');
    L.push('');
    L.push(`${failures.length} fields exceed 1% relative error.`);
    L.push('');
    L.push('| Year | Field | Expected | Actual | Error |');
    L.push('|-----:|-------|----------|--------|------:|');
    for (const f of failures) {
      L.push(`| ${f.year} | ${f.field} | ${numStr(f.expected)} | ${numStr(f.actual)} | ${pctStr(f.percentError)} |`);
    }
    L.push('');
  } else {
    L.push('## Field Comparison Failures');
    L.push('');
    L.push('None — all comparisons within 1% tolerance.');
    L.push('');
  }

  // ── Warnings table ──
  const warnings = comparisons.filter(c => c.status === 'WARN');
  if (warnings.length > 0) {
    L.push('## Field Comparison Warnings');
    L.push('');
    L.push(`${warnings.length} fields between 0.01-1% relative error.`);
    L.push('');
    L.push('| Year | Field | Expected | Actual | Error |');
    L.push('|-----:|-------|----------|--------|------:|');
    for (const w of warnings) {
      L.push(`| ${w.year} | ${w.field} | ${numStr(w.expected)} | ${numStr(w.actual)} | ${pctStr(w.percentError)} |`);
    }
    L.push('');
  }

  // ── Year-by-year detail (all non-PASS) ──
  const nonPass = comparisons.filter(c => c.status !== 'PASS');
  if (nonPass.length > 0) {
    const byYear = new Map<number, ComparisonResult[]>();
    for (const r of nonPass) {
      const arr = byYear.get(r.year) ?? [];
      arr.push(r);
      byYear.set(r.year, arr);
    }

    L.push('## Year-by-Year Detail');
    L.push('');
    for (const [year, results] of [...byYear.entries()].sort((a, b) => a[0] - b[0])) {
      L.push(`### Year ${year}`);
      L.push('');
      L.push('| Field | Expected | Actual | Error | Status |');
      L.push('|-------|----------|--------|------:|--------|');
      for (const r of results) {
        L.push(`| ${r.field} | ${numStr(r.expected)} | ${numStr(r.actual)} | ${pctStr(r.percentError)} | ${statusEmoji(r.status)} |`);
      }
      L.push('');
    }
  }

  // ── Invariant checks for this scenario ──
  if (invariants.length > 0) {
    L.push('## Invariant Checks');
    L.push('');
    L.push(`${invPass} passed, ${invFail} failed out of ${invariants.length} checks.`);
    L.push('');

    if (invFail > 0) {
      L.push('### Failures');
      L.push('');
      L.push('| Year | Check | Expected | Actual | Message |');
      L.push('|-----:|-------|----------|--------|---------|');
      for (const f of invariants.filter(i => !i.passed)) {
        L.push(`| ${f.year} | ${f.check} | ${f.expected ?? '—'} | ${f.actual ?? '—'} | ${f.message} |`);
      }
      L.push('');
    }

    // Group passed checks by check name for a compact summary
    const passedByCheck = new Map<string, number>();
    for (const inv of invariants.filter(i => i.passed)) {
      passedByCheck.set(inv.check, (passedByCheck.get(inv.check) ?? 0) + 1);
    }
    if (passedByCheck.size > 0) {
      L.push('### Passed Check Summary');
      L.push('');
      L.push('| Check | Count |');
      L.push('|-------|------:|');
      for (const [check, count] of [...passedByCheck.entries()].sort()) {
        L.push(`| ${check} | ${count} |`);
      }
      L.push('');
    }
  }

  L.push('---');
  L.push(`*Scenario "${scenario.id}" — ATLAS Verification Audit v1.0*`);
  L.push('');
  return L.join('\n');
}

// ── Invariant checks file ──────────────────────────────────

function generateInvariantFile(
  invariants: InvariantCheckResult[],
  invByScenario: Map<string, InvariantCheckResult[]>,
  timestamp: string,
): string {
  const L: string[] = [];
  L.push('# ATLAS Verification Audit — Invariant Checks');
  L.push('');
  L.push(`Generated: ${timestamp}`);
  L.push('');

  const totalPass = invariants.filter(i => i.passed).length;
  const totalFail = invariants.filter(i => !i.passed).length;
  L.push('## Summary');
  L.push('');
  L.push(`**${invariants.length} total checks: ${totalPass} passed, ${totalFail} failed**`);
  L.push('');

  // Per-scenario summary
  L.push('| Scenario | Pass | Fail | Total |');
  L.push('|----------|-----:|-----:|------:|');
  for (const [scenario, checks] of invByScenario) {
    const p = checks.filter(c => c.passed).length;
    const f = checks.filter(c => !c.passed).length;
    L.push(`| ${scenario} | ${p} | ${f} | ${checks.length} |`);
  }
  L.push('');

  // All failures in detail
  const allFails = invariants.filter(i => !i.passed);
  if (allFails.length > 0) {
    L.push('## All Failures');
    L.push('');
    L.push('| Scenario | Year | Check | Expected | Actual | Message |');
    L.push('|----------|-----:|-------|----------|--------|---------|');
    for (const f of allFails) {
      L.push(`| ${f.scenario} | ${f.year} | ${f.check} | ${f.expected ?? '—'} | ${f.actual ?? '—'} | ${f.message} |`);
    }
    L.push('');
  } else {
    L.push('## All Failures');
    L.push('');
    L.push('None — all invariant checks passed across all scenarios.');
    L.push('');
  }

  // Per-scenario detail sections
  for (const [scenario, checks] of invByScenario) {
    const passed = checks.filter(c => c.passed);
    const failed = checks.filter(c => !c.passed);

    L.push(`## ${scenario}`);
    L.push('');
    L.push(`${passed.length} passed, ${failed.length} failed.`);
    L.push('');

    if (failed.length > 0) {
      L.push('### Failures');
      L.push('');
      L.push('| Year | Check | Expected | Actual | Message |');
      L.push('|-----:|-------|----------|--------|---------|');
      for (const f of failed) {
        L.push(`| ${f.year} | ${f.check} | ${f.expected ?? '—'} | ${f.actual ?? '—'} | ${f.message} |`);
      }
      L.push('');
    }

    // Group passed checks by check name for compact display
    const passedByCheck = new Map<string, number>();
    for (const inv of passed) {
      passedByCheck.set(inv.check, (passedByCheck.get(inv.check) ?? 0) + 1);
    }
    L.push('### Passed Checks');
    L.push('');
    L.push('| Check | Years Passed |');
    L.push('|-------|------------:|');
    for (const [check, count] of [...passedByCheck.entries()].sort()) {
      L.push(`| ${check} | ${count} |`);
    }
    L.push('');
  }

  L.push('---');
  L.push('*ATLAS Verification Audit v1.0 — Invariant Checks*');
  L.push('');
  return L.join('\n');
}

// ── Extreme value sweep file ───────────────────────────────

function generateExtremeValueFile(
  extremes: ExtremeValueResult[],
  timestamp: string,
): string {
  const L: string[] = [];
  L.push('# ATLAS Verification Audit — Extreme Value Sweep');
  L.push('');
  L.push(`Generated: ${timestamp}`);
  L.push('');

  const totalPass = extremes.filter(e => e.passed).length;
  const totalFail = extremes.filter(e => !e.passed).length;
  L.push('## Summary');
  L.push('');
  L.push(`**${extremes.length} total checks: ${totalPass} passed, ${totalFail} failed**`);
  L.push('');

  // Group by parameter
  const byParam = new Map<string, ExtremeValueResult[]>();
  for (const ext of extremes) {
    const arr = byParam.get(ext.parameter) ?? [];
    arr.push(ext);
    byParam.set(ext.parameter, arr);
  }

  // Summary table
  L.push('| Parameter | Checks | Status |');
  L.push('|-----------|-------:|--------|');
  for (const [param, checks] of byParam) {
    const failed = checks.filter(c => !c.passed).length;
    const status = failed === 0 ? 'PASS' : `**${failed} FAIL**`;
    L.push(`| ${param} | ${checks.length} | ${status} |`);
  }
  L.push('');

  // Failures detail
  const allFails = extremes.filter(e => !e.passed);
  if (allFails.length > 0) {
    L.push('## Failures');
    L.push('');
    L.push('| Parameter | Test Value | Year | Check | Message |');
    L.push('|-----------|-----------|-----:|-------|---------|');
    for (const f of allFails) {
      L.push(`| ${f.parameter} | ${f.testValue} | ${f.year} | ${f.check} | ${f.message} |`);
    }
    L.push('');
  }

  // Per-parameter detail
  for (const [param, checks] of byParam) {
    L.push(`## ${param}`);
    L.push('');

    const passed = checks.filter(c => c.passed);
    const failed = checks.filter(c => !c.passed);
    L.push(`${passed.length} passed, ${failed.length} failed.`);
    L.push('');

    L.push('| Test Value | Year | Check | Status | Message |');
    L.push('|-----------|-----:|-------|--------|---------|');
    for (const c of checks) {
      const status = c.passed ? 'PASS' : '**FAIL**';
      L.push(`| ${c.testValue} | ${c.year} | ${c.check} | ${status} | ${c.message} |`);
    }
    L.push('');
  }

  L.push('---');
  L.push('*ATLAS Verification Audit v1.0 — Extreme Value Sweep*');
  L.push('');
  return L.join('\n');
}
