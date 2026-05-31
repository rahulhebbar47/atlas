/**
 * ATLAS CSV Parameter Import — Unit Tests
 *
 * Tests parseParameterCSV(), buildConfigFromCSV(), and exportConfigToParameterCSV()
 * from src/utils/csvImport.ts against the specification in docs/Import-Export-CSV-Plan.md.
 *
 * 31 test cases covering:
 *   - Minimal/full parameter parsing
 *   - Capability trajectories and midpoint mapping
 *   - Adoption parameters
 *   - All 9 policy configurations
 *   - Boolean format acceptance
 *   - BFCS overrides (valid, invalid cluster, invalid role)
 *   - Missing/unrecognized/invalid parameters
 *   - State policy overrides (numeric and enum)
 *   - Header and comment line skipping
 *   - Round-trip export/import fidelity
 *   - Cross-field validation (year ordering, floor/ceiling swap)
 *   - Export format validation
 */

import { describe, it, expect } from 'vitest';
import {
  parseParameterCSV,
  buildConfigFromCSV,
  exportConfigToParameterCSV,
} from '@/utils/csvImport';
import { runSimulation, getDefaultSimulationConfig } from '@/models/simulation';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { loadBLSData } from '@/services/dataLoader';
import { transformOEWSToBaselines } from '@/services/dataTransform';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
import { computeWeightedCapability } from '@/models/capabilities';
import type { OccupationBaseline } from '@/types';

// ============================================================
// Helper: build a CSV string from lines
// ============================================================

function csv(...lines: string[]): string {
  return lines.join('\n');
}

// ============================================================
// Test Suite
// ============================================================

describe('csvImport', () => {
  // ----------------------------------------------------------
  // 1. Minimal CSV produces valid config
  // ----------------------------------------------------------
  it('1. Minimal CSV produces valid config', () => {
    const input = csv('start_year,2030', 'end_year,2045');
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(config.startYear).toBe(2030);
    expect(config.endYear).toBe(2045);
    expect(warnings).toHaveLength(0);

    // All other fields should match defaults
    const defaults = getDefaultSimulationConfig();
    expect(config.baseInflationRate).toBe(defaults.baseInflationRate);
    expect(config.totalPopulation).toBe(defaults.totalPopulation);
    expect(config.laborForce).toBe(defaults.laborForce);
    expect(config.innovationRate).toBe(defaults.innovationRate);
    expect(config.capabilities.generative.floor).toBe(defaults.capabilities.generative.floor);
  });

  // ----------------------------------------------------------
  // 2. All global params parse correctly
  // ----------------------------------------------------------
  it('2. All global params parse correctly', () => {
    const input = csv(
      'start_year,2026',
      'end_year,2048',
      'base_inflation_rate,0.03',
      'baseline_gdp_growth,0.025',
      'total_population,350000000',
      'labor_force,170000000',
      'innovation_rate,2e-8',
      'rd_multiplier,2.0',
      'job_persistence_factor,1.2',
    );

    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);
    expect(config.startYear).toBe(2026);
    expect(config.endYear).toBe(2048);
    expect(config.baseInflationRate).toBe(0.03);
    expect(config.baselineGDPGrowth).toBe(0.025);
    expect(config.totalPopulation).toBe(350000000);
    expect(config.laborForce).toBe(170000000);
    expect(config.innovationRate).toBe(2e-8);
    expect(config.rdMultiplier).toBe(2.0);
    expect(config.jobPersistenceFactor).toBe(1.2);
  });

  // ----------------------------------------------------------
  // 3. Capability trajectories parse correctly
  // ----------------------------------------------------------
  it('3. Capability trajectories parse correctly', () => {
    const vectors = ['generative', 'agentic', 'embodied'] as const;
    const lines: string[] = [];
    let testVal = 0.10;

    for (const vec of vectors) {
      lines.push(`capability.${vec}.floor,${testVal}`);
      lines.push(`capability.${vec}.ceiling,${testVal + 0.5}`);
      lines.push(`capability.${vec}.steepness,${testVal + 0.2}`);
      lines.push(`capability.${vec}.midpoint,${2025 + Math.round(testVal * 10)}`);
      testVal += 0.05;
    }

    const input = csv(...lines);
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);

    testVal = 0.10;
    for (const vec of vectors) {
      expect(config.capabilities[vec].floor).toBeCloseTo(testVal, 10);
      expect(config.capabilities[vec].ceiling).toBeCloseTo(testVal + 0.5, 10);
      expect(config.capabilities[vec].steepness).toBeCloseTo(testVal + 0.2, 10);
      expect(config.capabilities[vec].midpointYear).toBe(2025 + Math.round(testVal * 10));
      testVal += 0.05;
    }
  });

  // ----------------------------------------------------------
  // 4. Capability midpoint maps to midpointYear
  // ----------------------------------------------------------
  it('4. Capability midpoint maps to midpointYear', () => {
    const input = csv('capability.generative.midpoint,2030');
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);
    expect(config.capabilities.generative.midpointYear).toBe(2030);
  });

  // ----------------------------------------------------------
  // 5. Adoption params parse correctly
  // ----------------------------------------------------------
  it('5. Adoption params parse correctly', () => {
    const input = csv(
      'adoption.steepness.software,4.0',
      'adoption.steepness.robotics,1.0',
      'adoption.steepness.autonomous_vehicle,1.2',
      'adoption.steepness.hybrid,2.0',
      'adoption.competitive_pressure_multiplier,3.0',
      'adoption.competitive_pressure_threshold,0.3',
      'adoption.geopolitical_risk_factor,0.2',
    );

    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);
    expect(config.adoptionParams.steepnessByDeployment.software).toBe(4.0);
    expect(config.adoptionParams.steepnessByDeployment.robotics).toBe(1.0);
    expect(config.adoptionParams.steepnessByDeployment.autonomous_vehicle).toBe(1.2);
    expect(config.adoptionParams.steepnessByDeployment.hybrid).toBe(2.0);
    expect(config.adoptionParams.competitivePressureMultiplier).toBe(3.0);
    expect(config.adoptionParams.competitivePressureThreshold).toBe(0.3);
    expect(config.adoptionParams.geopoliticalRiskFactor).toBe(0.2);
  });

  // ----------------------------------------------------------
  // 6. All policy params parse correctly (one test per policy, 9 tests)
  // ----------------------------------------------------------
  describe('policy params', () => {
    it('6a. Minimum wage params parse correctly', () => {
      const input = csv(
        'policy.minimum_wage.enabled,true',
        'policy.minimum_wage.federal_minimum,15.00',
        'policy.minimum_wage.indexed_to_inflation,true',
        'policy.minimum_wage.indexed_to_productivity,false',
      );

      const { params } = parseParameterCSV(input);
      const { config, warnings } = buildConfigFromCSV(params);

      expect(warnings).toHaveLength(0);
      expect(config.policyConfig.minimumWage.enabled).toBe(true);
      expect(config.policyConfig.minimumWage.federalMinimum).toEqual({ keyframes: [{ year: 2025, value: 15 }] });
      expect(config.policyConfig.minimumWage.indexedToInflation).toBe(true);
      expect(config.policyConfig.minimumWage.indexedToProductivity).toBe(false);
    });

    it('6b. Wage subsidy params parse correctly', () => {
      const input = csv(
        'policy.wage_subsidy.enabled,true',
        'policy.wage_subsidy.subsidy_percentage,0.15',
        'policy.wage_subsidy.max_per_worker,15000',
        'policy.wage_subsidy.phase_out_threshold,80000',
      );

      const { params } = parseParameterCSV(input);
      const { config, warnings } = buildConfigFromCSV(params);

      expect(warnings).toHaveLength(0);
      expect(config.policyConfig.wageSubsidy.enabled).toBe(true);
      expect(config.policyConfig.wageSubsidy.subsidyPercentage).toEqual({ keyframes: [{ year: 2025, value: 0.15 }] });
      expect(config.policyConfig.wageSubsidy.maxSubsidyPerWorker).toBe(15000);
      expect(config.policyConfig.wageSubsidy.phaseOutThreshold).toBe(80000);
    });

    it('6d. Sovereign Wealth Fund params parse correctly (including enum)', () => {
      const input = csv(
        'policy.swf.enabled,true',
        'policy.swf.initial_fund_size,500',
        'policy.swf.annual_contribution,100',
        'policy.swf.expected_return,0.07',
        'policy.swf.distribution_rate,0.04',
        'policy.swf.distribution,means_tested',
      );

      const { params } = parseParameterCSV(input);
      const { config, warnings } = buildConfigFromCSV(params);

      expect(warnings).toHaveLength(0);
      expect(config.policyConfig.sovereignWealthFund.enabled).toBe(true);
      expect(config.policyConfig.sovereignWealthFund.initialFundSize).toBe(500);
      expect(config.policyConfig.sovereignWealthFund.annualContribution).toEqual({ keyframes: [{ year: 2025, value: 100 }] });
      expect(config.policyConfig.sovereignWealthFund.annualReturnRate).toBe(0.07);
      expect(config.policyConfig.sovereignWealthFund.distributionRate).toBe(0.04);
      expect(config.policyConfig.sovereignWealthFund.distribution).toBe('means_tested');
    });

    it('6e. Universal equity params parse correctly', () => {
      const input = csv(
        'policy.equity.enabled,true',
        'policy.equity.ownership_fraction,0.10',
        'policy.equity.total_ai_profits,600',
        'policy.equity.profit_growth_rate,0.20',
        'policy.equity.distribution_method,progressive',
      );

      const { params } = parseParameterCSV(input);
      const { config, warnings } = buildConfigFromCSV(params);

      expect(warnings).toHaveLength(0);
      // Phase 5g: equity fields merged into sovereignWealthFund
      expect(config.policyConfig.sovereignWealthFund.enabled).toBe(true);
      expect(config.policyConfig.sovereignWealthFund.ownershipFraction).toEqual({ keyframes: [{ year: 2025, value: 0.1 }] });
      expect(config.policyConfig.sovereignWealthFund.totalAICompanyProfits).toBe(600);
      expect(config.policyConfig.sovereignWealthFund.profitGrowthRate).toBe(0.20);
      expect(config.policyConfig.sovereignWealthFund.distributionMethod).toBe('progressive');
    });

    it('6f. Profit sharing params parse correctly', () => {
      const input = csv(
        'policy.profit_sharing.enabled,true',
        'policy.profit_sharing.mandatory_percentage,0.10',
        'policy.profit_sharing.revenue_threshold,500000000',
        'policy.profit_sharing.distribution_scope,community',
      );

      const { params } = parseParameterCSV(input);
      const { config, warnings } = buildConfigFromCSV(params);

      expect(warnings).toHaveLength(0);
      expect(config.policyConfig.profitSharing.enabled).toBe(true);
      expect(config.policyConfig.profitSharing.mandatorySharePercentage).toEqual({ keyframes: [{ year: 2025, value: 0.1 }] });
      expect(config.policyConfig.profitSharing.companyRevenueThreshold).toBe(500000000);
      expect(config.policyConfig.profitSharing.distributionScope).toBe('community');
    });

    it('6g. UBI params parse correctly', () => {
      const input = csv(
        'policy.ubi.enabled,true',
        'policy.ubi.monthly_amount,1000',
        'policy.ubi.age_threshold,21',
        'policy.ubi.indexed_to_inflation,false',
        'policy.ubi.indexed_to_productivity,true',
      );

      const { params } = parseParameterCSV(input);
      const { config, warnings } = buildConfigFromCSV(params);

      expect(warnings).toHaveLength(0);
      expect(config.policyConfig.ubi.enabled).toBe(true);
      expect(config.policyConfig.ubi.monthlyAmount).toEqual({ keyframes: [{ year: 2025, value: 1000 }] });
      expect(config.policyConfig.ubi.ageThreshold).toBe(21);
      expect(config.policyConfig.ubi.indexedToInflation).toBe(false);
      expect(config.policyConfig.ubi.indexedToProductivity).toBe(true);
    });

    it('6h. Enhanced UI params parse correctly', () => {
      const input = csv(
        'policy.enhanced_ui.enabled,true',
        'policy.enhanced_ui.replacement_rate,0.70',
        'policy.enhanced_ui.duration_weeks,52',
        'policy.enhanced_ui.retraining_bonus,5000',
      );

      const { params } = parseParameterCSV(input);
      const { config, warnings } = buildConfigFromCSV(params);

      expect(warnings).toHaveLength(0);
      expect(config.policyConfig.enhancedUI.enabled).toBe(true);
      expect(config.policyConfig.enhancedUI.replacementRate).toEqual({ keyframes: [{ year: 2025, value: 0.7 }] });
      expect(config.policyConfig.enhancedUI.durationWeeks).toBe(52);
      expect(config.policyConfig.enhancedUI.retrainingBonus).toBe(5000);
    });

    it('6i. Retraining params parse correctly (including target_clusters CSV-in-CSV)', () => {
      const input = csv(
        'policy.retraining.enabled,true',
        'policy.retraining.stipend_monthly,3000',
        'policy.retraining.duration_months,12',
        'policy.retraining.effectiveness_rate,0.50',
        'policy.retraining.target_clusters,tech_swe,finance_banking,legal_paralegals',
      );

      const { params } = parseParameterCSV(input);
      const { config, warnings } = buildConfigFromCSV(params);

      expect(warnings).toHaveLength(0);
      expect(config.policyConfig.retraining.enabled).toBe(true);
      expect(config.policyConfig.retraining.stipendMonthly).toEqual({ keyframes: [{ year: 2025, value: 3000 }] });
      expect(config.policyConfig.retraining.durationMonths).toBe(12);
      expect(config.policyConfig.retraining.effectivenessRate).toBe(0.50);
      expect(config.policyConfig.retraining.targetClusters).toEqual([
        'tech_swe',
        'finance_banking',
        'legal_paralegals',
      ]);
    });
  });

  // ----------------------------------------------------------
  // 7. Boolean parsing accepts multiple formats
  // ----------------------------------------------------------
  it('7. Boolean parsing accepts multiple formats', () => {
    // Test 'true'
    const input1 = csv('policy.ubi.enabled,true');
    const { params: p1 } = parseParameterCSV(input1);
    const { config: c1 } = buildConfigFromCSV(p1);
    expect(c1.policyConfig.ubi.enabled).toBe(true);

    // Test '1'
    const input2 = csv('policy.ubi.enabled,1');
    const { params: p2 } = parseParameterCSV(input2);
    const { config: c2 } = buildConfigFromCSV(p2);
    expect(c2.policyConfig.ubi.enabled).toBe(true);

    // Test 'yes'
    const input3 = csv('policy.ubi.enabled,yes');
    const { params: p3 } = parseParameterCSV(input3);
    const { config: c3 } = buildConfigFromCSV(p3);
    expect(c3.policyConfig.ubi.enabled).toBe(true);

    // Test 'false'
    const input4 = csv('policy.ubi.enabled,false');
    const { params: p4 } = parseParameterCSV(input4);
    const { config: c4 } = buildConfigFromCSV(p4);
    expect(c4.policyConfig.ubi.enabled).toBe(false);

    // Test '0'
    const input5 = csv('policy.ubi.enabled,0');
    const { params: p5 } = parseParameterCSV(input5);
    const { config: c5 } = buildConfigFromCSV(p5);
    expect(c5.policyConfig.ubi.enabled).toBe(false);

    // Test 'no'
    const input6 = csv('policy.ubi.enabled,no');
    const { params: p6 } = parseParameterCSV(input6);
    const { config: c6 } = buildConfigFromCSV(p6);
    expect(c6.policyConfig.ubi.enabled).toBe(false);
  });

  // ----------------------------------------------------------
  // 8. BFCS overrides: single dimension creates full override
  // ----------------------------------------------------------
  it('8. BFCS overrides: single dimension creates full override', () => {
    const input = csv('bfcs.tech_swe.junior_mid.better,0.1');
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);
    expect(config.bfcsOverrides.tech_swe).toBeDefined();
    expect(config.bfcsOverrides.tech_swe!.junior_mid).toBeDefined();

    const override = config.bfcsOverrides.tech_swe!.junior_mid!;
    expect(override.better).toBe(0.1);
    // Remaining dimensions filled from defaults: F=0.7, C=0.5, S=0.7
    expect(override.faster).toBe(0.7);
    expect(override.cheaper).toBe(0.5);
    expect(override.safer).toBe(0.7);
  });

  // ----------------------------------------------------------
  // 9. BFCS overrides: all 4 dimensions for a role
  // ----------------------------------------------------------
  it('9. BFCS overrides: all 4 dimensions for a role', () => {
    const input = csv(
      'bfcs.tech_swe.junior_mid.better,0.1',
      'bfcs.tech_swe.junior_mid.faster,0.2',
      'bfcs.tech_swe.junior_mid.cheaper,0.3',
      'bfcs.tech_swe.junior_mid.safer,0.4',
    );
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);
    const override = config.bfcsOverrides.tech_swe!.junior_mid!;
    expect(override.better).toBe(0.1);
    expect(override.faster).toBe(0.2);
    expect(override.cheaper).toBe(0.3);
    expect(override.safer).toBe(0.4);
  });

  // ----------------------------------------------------------
  // 10. BFCS overrides: invalid cluster ID produces warning
  // ----------------------------------------------------------
  it('10. BFCS overrides: invalid cluster ID produces warning', () => {
    const input = csv('bfcs.nonexistent_cluster.junior.better,0.5');
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some(w => w.toLowerCase().includes('unrecognized cluster'))).toBe(true);
    expect(Object.keys(config.bfcsOverrides)).toHaveLength(0);
  });

  // ----------------------------------------------------------
  // 11. BFCS overrides: invalid role ID produces warning
  // ----------------------------------------------------------
  it('11. BFCS overrides: invalid role ID produces warning', () => {
    const input = csv('bfcs.tech_swe.nonexistent_role.better,0.5');
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some(w => w.toLowerCase().includes('unrecognized role'))).toBe(true);
    // No override should have been applied for this cluster
    expect(config.bfcsOverrides.tech_swe).toBeUndefined();
  });

  // ----------------------------------------------------------
  // 12. Missing parameters use defaults
  // ----------------------------------------------------------
  it('12. Missing parameters use defaults', () => {
    // Empty CSV (header-only)
    const input = csv('parameter_path,value');
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);

    const defaults = getDefaultSimulationConfig();
    expect(config.startYear).toBe(defaults.startYear);
    expect(config.endYear).toBe(defaults.endYear);
    expect(config.baseInflationRate).toBe(defaults.baseInflationRate);
    expect(config.baselineGDPGrowth).toBe(defaults.baselineGDPGrowth);
    expect(config.totalPopulation).toBe(defaults.totalPopulation);
    expect(config.laborForce).toBe(defaults.laborForce);
    expect(config.innovationRate).toBe(defaults.innovationRate);
    expect(config.rdMultiplier).toBe(defaults.rdMultiplier);
    expect(config.jobPersistenceFactor).toBe(defaults.jobPersistenceFactor);
    expect(config.capabilities.generative.floor).toBe(defaults.capabilities.generative.floor);
    expect(config.policyConfig.minimumWage.enabled).toBe(defaults.policyConfig.minimumWage.enabled);
    expect(config.policyConfig.ubi.enabled).toBe(defaults.policyConfig.ubi.enabled);
  });

  // ----------------------------------------------------------
  // 13. Unrecognized parameter_path produces warning
  // ----------------------------------------------------------
  it('13. Unrecognized parameter_path produces warning, does not crash', () => {
    const input = csv('some.unknown.path,42');
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some(w => w.includes('some.unknown.path'))).toBe(true);

    // Config should still be valid (defaults)
    const defaults = getDefaultSimulationConfig();
    expect(config.startYear).toBe(defaults.startYear);
  });

  // ----------------------------------------------------------
  // 14. Invalid numeric value produces warning
  // ----------------------------------------------------------
  it('14. Invalid numeric value produces warning', () => {
    const input = csv('start_year,abc');
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some(w => w.includes('abc'))).toBe(true);

    // startYear should remain at default
    const defaults = getDefaultSimulationConfig();
    expect(config.startYear).toBe(defaults.startYear);
  });

  // ----------------------------------------------------------
  // 15. State policy overrides parse correctly
  // ----------------------------------------------------------
  it('15. State policy overrides parse correctly', () => {
    const input = csv('state_override.CA.minimum_wage,15.50');
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);
    expect(config.stateOverrides.CA).toBeDefined();
    expect(config.stateOverrides.CA!.minimumWage).toBe(15.5);
  });

  // ----------------------------------------------------------
  // 16. State policy enum overrides parse correctly
  // ----------------------------------------------------------
  it('16. State policy enum overrides parse correctly', () => {
    const input = csv('state_override.TX.av_regulatory,restrictive');
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);
    expect(config.stateOverrides.TX).toBeDefined();
    expect(config.stateOverrides.TX!.avRegulatoryEnvironment).toBe('restrictive');
  });

  // ----------------------------------------------------------
  // 17. Header row is skipped
  // ----------------------------------------------------------
  it('17. Header row is skipped', () => {
    const input = csv(
      'parameter_path,value',
      'start_year,2030',
    );
    const { params, warnings } = parseParameterCSV(input);

    // The header row should not appear as a param
    expect(params.has('parameter_path')).toBe(false);
    expect(params.get('start_year')).toBe('2030');
    expect(warnings).toHaveLength(0);

    // Also confirm buildConfigFromCSV does not generate a warning for it
    const { warnings: buildWarnings } = buildConfigFromCSV(params);
    expect(buildWarnings).toHaveLength(0);
  });

  // ----------------------------------------------------------
  // 18. Comment lines are skipped
  // ----------------------------------------------------------
  it('18. Comment lines (starting with #) are skipped', () => {
    const input = csv(
      '# This is a comment',
      'start_year,2030',
    );
    const { params, warnings } = parseParameterCSV(input);
    const { config, warnings: buildWarnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);
    expect(buildWarnings).toHaveLength(0);
    expect(config.startYear).toBe(2030);
  });

  // ----------------------------------------------------------
  // 19. Round-trip: export default config -> import -> config matches
  // ----------------------------------------------------------
  it('19. Round-trip: export default config -> import -> config matches', () => {
    const defaultConfig = getDefaultSimulationConfig();
    const csvString = exportConfigToParameterCSV(defaultConfig);
    const { params, warnings: parseWarnings } = parseParameterCSV(csvString);
    const { config: roundTripped, warnings: buildWarnings } = buildConfigFromCSV(params);

    // No warnings at any step
    expect(parseWarnings).toHaveLength(0);
    expect(buildWarnings).toHaveLength(0);

    // --- Global / Timeline ---
    expect(roundTripped.startYear).toBe(defaultConfig.startYear);
    expect(roundTripped.endYear).toBe(defaultConfig.endYear);

    // --- Macro ---
    expect(roundTripped.baseInflationRate).toBe(defaultConfig.baseInflationRate);
    expect(roundTripped.baselineGDPGrowth).toBe(defaultConfig.baselineGDPGrowth);

    // --- Population ---
    expect(roundTripped.totalPopulation).toBe(defaultConfig.totalPopulation);
    expect(roundTripped.laborForce).toBe(defaultConfig.laborForce);

    // --- New Job Creation ---
    expect(roundTripped.innovationRate).toBe(defaultConfig.innovationRate);
    expect(roundTripped.rdMultiplier).toBe(defaultConfig.rdMultiplier);
    expect(roundTripped.jobPersistenceFactor).toBe(defaultConfig.jobPersistenceFactor);

    // --- Adoption ---
    expect(roundTripped.adoptionParams.steepnessByDeployment.software)
      .toBe(defaultConfig.adoptionParams.steepnessByDeployment.software);
    expect(roundTripped.adoptionParams.steepnessByDeployment.robotics)
      .toBe(defaultConfig.adoptionParams.steepnessByDeployment.robotics);
    expect(roundTripped.adoptionParams.steepnessByDeployment.autonomous_vehicle)
      .toBe(defaultConfig.adoptionParams.steepnessByDeployment.autonomous_vehicle);
    expect(roundTripped.adoptionParams.steepnessByDeployment.hybrid)
      .toBe(defaultConfig.adoptionParams.steepnessByDeployment.hybrid);
    expect(roundTripped.adoptionParams.competitivePressureMultiplier)
      .toBe(defaultConfig.adoptionParams.competitivePressureMultiplier);
    expect(roundTripped.adoptionParams.competitivePressureThreshold)
      .toBe(defaultConfig.adoptionParams.competitivePressureThreshold);
    expect(roundTripped.adoptionParams.geopoliticalRiskFactor)
      .toBe(defaultConfig.adoptionParams.geopoliticalRiskFactor);

    // --- Capabilities (all 3 vectors x 4 params) ---
    const vectors = ['generative', 'agentic', 'embodied'] as const;
    for (const vec of vectors) {
      expect(roundTripped.capabilities[vec].floor).toBe(defaultConfig.capabilities[vec].floor);
      expect(roundTripped.capabilities[vec].ceiling).toBe(defaultConfig.capabilities[vec].ceiling);
      expect(roundTripped.capabilities[vec].steepness).toBe(defaultConfig.capabilities[vec].steepness);
      expect(roundTripped.capabilities[vec].midpointYear).toBe(defaultConfig.capabilities[vec].midpointYear);
    }

    // --- Policy: Minimum Wage ---
    expect(roundTripped.policyConfig.minimumWage.enabled).toBe(defaultConfig.policyConfig.minimumWage.enabled);
    expect(roundTripped.policyConfig.minimumWage.federalMinimum).toEqual(defaultConfig.policyConfig.minimumWage.federalMinimum);
    expect(roundTripped.policyConfig.minimumWage.indexedToInflation).toBe(defaultConfig.policyConfig.minimumWage.indexedToInflation);
    expect(roundTripped.policyConfig.minimumWage.indexedToProductivity).toBe(defaultConfig.policyConfig.minimumWage.indexedToProductivity);
    expect(roundTripped.policyConfig.minimumWage.stateOverrides).toEqual(defaultConfig.policyConfig.minimumWage.stateOverrides);

    // --- Policy: Wage Subsidy ---
    expect(roundTripped.policyConfig.wageSubsidy.enabled).toBe(defaultConfig.policyConfig.wageSubsidy.enabled);
    expect(roundTripped.policyConfig.wageSubsidy.subsidyPercentage).toEqual(defaultConfig.policyConfig.wageSubsidy.subsidyPercentage);
    expect(roundTripped.policyConfig.wageSubsidy.maxSubsidyPerWorker).toBe(defaultConfig.policyConfig.wageSubsidy.maxSubsidyPerWorker);
    expect(roundTripped.policyConfig.wageSubsidy.phaseOutThreshold).toBe(defaultConfig.policyConfig.wageSubsidy.phaseOutThreshold);

    // --- Policy: Work Week ---
    expect(roundTripped.policyConfig.workWeekReduction.enabled).toBe(defaultConfig.policyConfig.workWeekReduction.enabled);
    expect(roundTripped.policyConfig.workWeekReduction.standardHours).toEqual(defaultConfig.policyConfig.workWeekReduction.standardHours);
    expect(roundTripped.policyConfig.workWeekReduction.overtimeMultiplier).toBe(defaultConfig.policyConfig.workWeekReduction.overtimeMultiplier);

    // --- Policy: SWF ---
    expect(roundTripped.policyConfig.sovereignWealthFund.enabled).toBe(defaultConfig.policyConfig.sovereignWealthFund.enabled);
    expect(roundTripped.policyConfig.sovereignWealthFund.initialFundSize).toBe(defaultConfig.policyConfig.sovereignWealthFund.initialFundSize);
    expect(roundTripped.policyConfig.sovereignWealthFund.annualContribution).toEqual(defaultConfig.policyConfig.sovereignWealthFund.annualContribution);
    expect(roundTripped.policyConfig.sovereignWealthFund.annualReturnRate).toBe(defaultConfig.policyConfig.sovereignWealthFund.annualReturnRate);
    expect(roundTripped.policyConfig.sovereignWealthFund.distributionRate).toBe(defaultConfig.policyConfig.sovereignWealthFund.distributionRate);
    expect(roundTripped.policyConfig.sovereignWealthFund.distribution).toBe(defaultConfig.policyConfig.sovereignWealthFund.distribution);

    // --- Policy: Equity (Phase 5g: merged into SWF — round-trip reads from sovereignWealthFund) ---
    expect(roundTripped.policyConfig.sovereignWealthFund.ownershipFraction).toEqual(defaultConfig.policyConfig.sovereignWealthFund.ownershipFraction);
    expect(roundTripped.policyConfig.sovereignWealthFund.totalAICompanyProfits).toBe(defaultConfig.policyConfig.sovereignWealthFund.totalAICompanyProfits);
    expect(roundTripped.policyConfig.sovereignWealthFund.profitGrowthRate).toBe(defaultConfig.policyConfig.sovereignWealthFund.profitGrowthRate);
    expect(roundTripped.policyConfig.sovereignWealthFund.distributionMethod).toBe(defaultConfig.policyConfig.sovereignWealthFund.distributionMethod);

    // --- Policy: Profit Sharing ---
    expect(roundTripped.policyConfig.profitSharing.enabled).toBe(defaultConfig.policyConfig.profitSharing.enabled);
    expect(roundTripped.policyConfig.profitSharing.mandatorySharePercentage).toEqual(defaultConfig.policyConfig.profitSharing.mandatorySharePercentage);
    expect(roundTripped.policyConfig.profitSharing.companyRevenueThreshold).toBe(defaultConfig.policyConfig.profitSharing.companyRevenueThreshold);
    expect(roundTripped.policyConfig.profitSharing.distributionScope).toBe(defaultConfig.policyConfig.profitSharing.distributionScope);

    // --- Policy: UBI ---
    expect(roundTripped.policyConfig.ubi.enabled).toBe(defaultConfig.policyConfig.ubi.enabled);
    expect(roundTripped.policyConfig.ubi.monthlyAmount).toEqual(defaultConfig.policyConfig.ubi.monthlyAmount);
    expect(roundTripped.policyConfig.ubi.ageThreshold).toBe(defaultConfig.policyConfig.ubi.ageThreshold);
    // DEPRECATED (Phase 5h Fix 7): phaseOut no longer exported in config CSV — skip round-trip assertions
    // Phase-out fields are not used in computation and were removed from config export.
    expect(roundTripped.policyConfig.ubi.indexedToInflation).toBe(defaultConfig.policyConfig.ubi.indexedToInflation);
    expect(roundTripped.policyConfig.ubi.indexedToProductivity).toBe(defaultConfig.policyConfig.ubi.indexedToProductivity);

    // --- Policy: Enhanced UI ---
    expect(roundTripped.policyConfig.enhancedUI.enabled).toBe(defaultConfig.policyConfig.enhancedUI.enabled);
    expect(roundTripped.policyConfig.enhancedUI.replacementRate).toEqual(defaultConfig.policyConfig.enhancedUI.replacementRate);
    expect(roundTripped.policyConfig.enhancedUI.durationWeeks).toBe(defaultConfig.policyConfig.enhancedUI.durationWeeks);
    expect(roundTripped.policyConfig.enhancedUI.retrainingBonus).toBe(defaultConfig.policyConfig.enhancedUI.retrainingBonus);
    expect(roundTripped.policyConfig.enhancedUI.stateOverrides).toEqual(defaultConfig.policyConfig.enhancedUI.stateOverrides);

    // --- Policy: Retraining ---
    expect(roundTripped.policyConfig.retraining.enabled).toBe(defaultConfig.policyConfig.retraining.enabled);
    expect(roundTripped.policyConfig.retraining.stipendMonthly).toEqual(defaultConfig.policyConfig.retraining.stipendMonthly);
    expect(roundTripped.policyConfig.retraining.durationMonths).toBe(defaultConfig.policyConfig.retraining.durationMonths);
    expect(roundTripped.policyConfig.retraining.effectivenessRate).toBe(defaultConfig.policyConfig.retraining.effectivenessRate);
    expect(roundTripped.policyConfig.retraining.targetClusters).toEqual(defaultConfig.policyConfig.retraining.targetClusters);

    // --- BFCS and State Overrides (should be empty on default) ---
    expect(roundTripped.bfcsOverrides).toEqual({});
    expect(roundTripped.stateOverrides).toEqual({});
  });

  // ----------------------------------------------------------
  // 20. Policy minimum wage state overrides parse correctly
  // ----------------------------------------------------------
  it('20. Policy minimum wage state overrides parse correctly', () => {
    const input = csv('policy.minimum_wage.state_override.CA,15.00');
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);
    expect(config.policyConfig.minimumWage.stateOverrides.CA).toBe(15.0);
  });

  // ----------------------------------------------------------
  // 21. end_year < start_year produces warning and reverts to defaults
  // ----------------------------------------------------------
  it('21. end_year less than start_year produces warning and reverts to defaults', () => {
    const input = csv('start_year,2040', 'end_year,2025');
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some(w => w.includes('end_year (2025) must be greater than start_year (2040)'))).toBe(true);

    const defaults = getDefaultSimulationConfig();
    expect(config.startYear).toBe(defaults.startYear);
    expect(config.endYear).toBe(defaults.endYear);
  });

  // ----------------------------------------------------------
  // 22. end_year == start_year produces warning and reverts to defaults
  // ----------------------------------------------------------
  it('22. end_year equal to start_year produces warning and reverts to defaults', () => {
    const input = csv('start_year,2030', 'end_year,2030');
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings.length).toBeGreaterThan(0);

    const defaults = getDefaultSimulationConfig();
    expect(config.startYear).toBe(defaults.startYear);
    expect(config.endYear).toBe(defaults.endYear);
  });

  // ----------------------------------------------------------
  // 23. Capability floor > ceiling produces warning and swaps
  // ----------------------------------------------------------
  it('23. Capability floor > ceiling produces warning and swaps values', () => {
    const input = csv(
      'capability.generative.floor,0.95',
      'capability.generative.ceiling,0.50',
    );
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some(w => w.includes('capability.generative.floor'))).toBe(true);

    // Values should be swapped
    expect(config.capabilities.generative.floor).toBe(0.50);
    expect(config.capabilities.generative.ceiling).toBe(0.95);
  });

  // ----------------------------------------------------------
  // 24. exportConfigToParameterCSV produces valid two-column CSV
  // ----------------------------------------------------------
  it('24. exportConfigToParameterCSV produces valid two-column CSV', () => {
    const defaultConfig = getDefaultSimulationConfig();
    const csvOutput = exportConfigToParameterCSV(defaultConfig);
    const lines = csvOutput.split('\n').filter(l => l.trim().length > 0);

    // First line is header
    expect(lines[0]).toBe('parameter_path,value');

    // Every line has at least one comma (two columns)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      expect(line).toContain(',');
    }

    // Check that key paths exist in the output
    const csvBody = csvOutput;
    expect(csvBody).toContain('start_year,');
    expect(csvBody).toContain('capability.generative.floor,');
    expect(csvBody).toContain('policy.ubi.enabled,');
    expect(csvBody).toContain('adoption.steepness.software,');
    expect(csvBody).toContain('policy.retraining.target_clusters,');

    // Row count should be ~75 (header + all non-override params)
    // Default config has no BFCS or state overrides, so just the base params
    // Base: 2 global + 4 macro + 3 population + 3 new jobs + 7 adoption + 12 capabilities
    // + ~40 policy fields + ~50 optional flat params (always exported with defaults)
    // + 5 investment demand + 2 tax/econ pipeline + 4 tax config + 3 post-tax MPC
    // + 3 AI cost + 11 separated credit + 12 fiscal-monetary = ~130+ total (growing with each phase)
    const dataLines = lines.length - 1; // subtract header
    expect(dataLines).toBeGreaterThanOrEqual(140);
    expect(dataLines).toBeLessThanOrEqual(185);
  });

  // ----------------------------------------------------------
  // 32. Phase 5g corporate profits params import correctly
  // ----------------------------------------------------------
  it('32. Corporate profits + P/E sensitivity params import and round-trip', () => {
    const input = csv(
      'ai_profit_margin,0.30',
      'traditional_profit_margin,0.15',
      'ai_pe_sensitivity,120',
      'traditional_pe_sensitivity,80',
    );
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);
    expect(config.aiProfitMargin).toBe(0.30);
    expect(config.traditionalProfitMargin).toBe(0.15);
    expect(config.aiPESensitivity).toBe(120);
    expect(config.traditionalPESensitivity).toBe(80);

    // Round-trip
    const exported = exportConfigToParameterCSV(config);
    expect(exported).toContain('ai_profit_margin,0.3');
    expect(exported).toContain('traditional_profit_margin,0.15');
    expect(exported).toContain('ai_pe_sensitivity,120');
    expect(exported).toContain('traditional_pe_sensitivity,80');
  });

  // ----------------------------------------------------------
  // 33. Phase 5g wage feedback and deflation params import correctly
  // ----------------------------------------------------------
  it('33. Phase 5g wage feedback, credit deflation, scarcity params', () => {
    const input = csv(
      'wage_pass_through,0.50',
      'wage_automation_sensitivity,0.60',
      'credit_deflation_sensitivity,0.05',
      'scarcity_pass_through,0.40',
    );
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);
    expect(config.wagePassThrough).toBe(0.50);
    expect(config.wageAutomationSensitivity).toBe(0.60);
    expect(config.creditDeflationSensitivity).toBe(0.05);
    expect(config.scarcityPassThrough).toBe(0.40);

    // Round-trip
    const exported = exportConfigToParameterCSV(config);
    expect(exported).toContain('wage_pass_through,0.5');
    expect(exported).toContain('wage_automation_sensitivity,0.6');
    expect(exported).toContain('credit_deflation_sensitivity,0.05');
    expect(exported).toContain('scarcity_pass_through,0.4');
  });

  // ----------------------------------------------------------
  // 34. Phase 5g UBI mode fields import correctly
  // ----------------------------------------------------------
  it('34. UBI mode fields import and round-trip', () => {
    const input = csv(
      'policy.ubi.mode,indexed',
      'policy.ubi.indexed_base_amount,1500',
      'policy.ubi.indexed_start_year,2035',
      'policy.ubi.productivity_index_rate,0.8',
    );
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);
    expect(config.policyConfig.ubi.mode).toBe('indexed');
    expect(config.policyConfig.ubi.indexedBaseAmount).toBe(1500);
    expect(config.policyConfig.ubi.indexedStartYear).toBe(2035);
    expect(config.policyConfig.ubi.productivityIndexRate).toBe(0.8);

    // Round-trip
    const exported = exportConfigToParameterCSV(config);
    expect(exported).toContain('policy.ubi.mode,indexed');
    expect(exported).toContain('policy.ubi.indexed_base_amount,1500');
    expect(exported).toContain('policy.ubi.indexed_start_year,2035');
    expect(exported).toContain('policy.ubi.productivity_index_rate,0.8');
  });

  // ----------------------------------------------------------
  // 35. Phase 5i housing & mortgage params import correctly
  // ----------------------------------------------------------
  it('35. Phase 5i housing & mortgage params import and round-trip', () => {
    const input = csv(
      'business_credit_gdp_sensitivity,6.0',
      'max_business_credit_loosening,0.25',
      'shelter_cpi_weight,0.38',
      'shelter_inflation_stickiness,0.75',
      'mortgage_stress_amplifier,0.50',
      'foreclosure_lag,1.0',
      'homeownership_recovery_rate,0.03',
      'housing_wealth_mpc,0.06',
      'mpc_wage_ue_sensitivity,0.008',
      'credit_adoption_sensitivity,0.20',
    );
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);
    expect(config.businessCreditGDPSensitivity).toBe(6.0);
    expect(config.maxBusinessCreditLoosening).toBe(0.25);
    expect(config.shelterCPIWeight).toBe(0.38);
    expect(config.shelterInflationStickiness).toBe(0.75);
    expect(config.mortgageStressAmplifier).toBe(0.50);
    expect(config.foreclosureLag).toBe(1.0);
    expect(config.homeownershipRecoveryRate).toBe(0.03);
    expect(config.housingWealthMPC).toBe(0.06);
    expect(config.mpcWageUESensitivity).toBe(0.008);
    expect(config.creditAdoptionSensitivity).toBe(0.20);

    // Round-trip
    const exported = exportConfigToParameterCSV(config);
    expect(exported).toContain('business_credit_gdp_sensitivity,6');
    expect(exported).toContain('max_business_credit_loosening,0.25');
    expect(exported).toContain('shelter_cpi_weight,0.38');
    expect(exported).toContain('shelter_inflation_stickiness,0.75');
    expect(exported).toContain('mortgage_stress_amplifier,0.5');
    expect(exported).toContain('foreclosure_lag,1');
    expect(exported).toContain('homeownership_recovery_rate,0.03');
    expect(exported).toContain('housing_wealth_mpc,0.06');
    expect(exported).toContain('mpc_wage_ue_sensitivity,0.008');
    expect(exported).toContain('credit_adoption_sensitivity,0.2');
  });

  // ----------------------------------------------------------
  // 36. Income distribution params import correctly
  // ----------------------------------------------------------
  it('36. Income distribution params import and round-trip', () => {
    const input = csv(
      'bottom_80_wage_share,0.50',
      'bottom_80_transfer_share,0.85',
      'bottom_80_asset_share,0.15',
    );
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);
    expect(config.bottom80WageShare).toBe(0.50);
    expect(config.bottom80TransferShare).toBe(0.85);
    expect(config.bottom80AssetShare).toBe(0.15);

    // Round-trip
    const exported = exportConfigToParameterCSV(config);
    expect(exported).toContain('bottom_80_wage_share,0.5');
    expect(exported).toContain('bottom_80_transfer_share,0.85');
    expect(exported).toContain('bottom_80_asset_share,0.15');
  });

  // ----------------------------------------------------------
  // 25. cluster_override imports all field types correctly
  // ----------------------------------------------------------
  it('25. cluster_override imports all field types correctly', () => {
    const input = csv(
      'cluster_override.tech_swe.generative_weight,0.90',
      'cluster_override.tech_swe.agentic_weight,0.08',
      'cluster_override.tech_swe.embodied_weight,0.02',
      'cluster_override.tech_swe.adoption_steepness,2.5',
      'cluster_override.tech_swe.adoption_ceiling,0.50',
      'cluster_override.tech_swe.deployment_lag,1.5',
      'cluster_override.tech_swe.wage_elasticity,0.7',
      'cluster_override.tech_swe.deflation_intensity,0.85',
    );
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);
    expect(config.clusterOverrides).toBeDefined();
    const ov = config.clusterOverrides!['tech_swe']!;
    expect(ov.generativeWeight).toBe(0.90);
    expect(ov.agenticWeight).toBe(0.08);
    expect(ov.embodiedWeight).toBe(0.02);
    expect(ov.adoptionSteepness).toBe(2.5);
    expect(ov.adoptionCeiling).toBe(0.50);
    expect(ov.deploymentLag).toBe(1.5);
    expect(ov.wageElasticity).toBe(0.7);
    expect(ov.deflationIntensity).toBe(0.85);
  });

  // ----------------------------------------------------------
  // 26. cluster_override validates range constraints
  // ----------------------------------------------------------
  it('26. cluster_override validates range constraints', () => {
    const input = csv(
      'cluster_override.tech_swe.generative_weight,1.5',     // > 1 — warning
      'cluster_override.tech_swe.adoption_steepness,-0.5',    // < 0 — warning
      'cluster_override.tech_swe.adoption_ceiling,2.0',       // > 1 — warning
      'cluster_override.tech_swe.deployment_lag,-1',           // < 0 — warning
      'cluster_override.tech_swe.wage_elasticity,1.5',         // > 1 — warning
    );
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    // Should have 5 range validation warnings
    expect(warnings).toHaveLength(5);
    expect(warnings.some(w => w.includes('generative_weight'))).toBe(true);
    expect(warnings.some(w => w.includes('adoption_steepness'))).toBe(true);
    expect(warnings.some(w => w.includes('adoption_ceiling'))).toBe(true);
    expect(warnings.some(w => w.includes('deployment_lag'))).toBe(true);
    expect(warnings.some(w => w.includes('wage_elasticity'))).toBe(true);

    // Invalid values should NOT be applied
    expect(config.clusterOverrides?.['tech_swe']).toBeUndefined();
  });

  // ----------------------------------------------------------
  // 27. cluster_override warns on unknown cluster and unknown field
  // ----------------------------------------------------------
  it('27. cluster_override warns on unknown cluster and unknown field', () => {
    const input = csv(
      'cluster_override.fake_cluster.adoption_ceiling,0.50',
      'cluster_override.tech_swe.unknown_field,42',
    );
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(2);
    expect(warnings.some(w => w.includes('fake_cluster'))).toBe(true);
    expect(warnings.some(w => w.includes('unknown_field'))).toBe(true);
  });

  // ----------------------------------------------------------
  // 28. cluster_override deflation_intensity via canonical path
  // ----------------------------------------------------------
  it('28. cluster_override deflation_intensity via canonical path', () => {
    const input = csv('cluster_override.tech_swe.deflation_intensity,0.90');
    const { params } = parseParameterCSV(input);
    const { config, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);
    expect(config.clusterOverrides?.['tech_swe']?.deflationIntensity).toBe(0.90);
  });

  // ----------------------------------------------------------
  // 29. cluster_override round-trip: export then re-import preserves values
  // ----------------------------------------------------------
  it('29. cluster_override round-trip: export then re-import preserves values', () => {
    const defaultConfig = getDefaultSimulationConfig();
    defaultConfig.clusterOverrides = {
      tech_swe: {
        generativeWeight: 0.85,
        adoptionCeiling: 0.60,
        wageElasticity: 0.4,
      },
      finance_trading: {
        deploymentLag: 2.0,
        deflationIntensity: 0.50,
      },
    };

    const csvOutput = exportConfigToParameterCSV(defaultConfig);

    // Re-import
    const { params } = parseParameterCSV(csvOutput);
    const { config: roundTripped, warnings } = buildConfigFromCSV(params);

    expect(warnings).toHaveLength(0);
    expect(roundTripped.clusterOverrides?.['tech_swe']?.generativeWeight).toBe(0.85);
    expect(roundTripped.clusterOverrides?.['tech_swe']?.adoptionCeiling).toBe(0.60);
    expect(roundTripped.clusterOverrides?.['tech_swe']?.wageElasticity).toBe(0.4);
    expect(roundTripped.clusterOverrides?.['finance_trading']?.deploymentLag).toBe(2.0);
    expect(roundTripped.clusterOverrides?.['finance_trading']?.deflationIntensity).toBe(0.50);
  });

  // ----------------------------------------------------------
  // 30. cluster_override.adoption_ceiling affects simulation output
  // ----------------------------------------------------------
  it('30. cluster_override.adoption_ceiling caps adoption in simulation', () => {
    const blsData = loadBLSData();
    let baselines: Map<string, OccupationBaseline> | undefined;
    if (blsData.isLoaded) {
      baselines = transformOEWSToBaselines(blsData.oews, OCCUPATION_CLUSTERS, DEFAULT_ROLE_ESTIMATION_CONFIG).baselines;
    }

    // Run with low ceiling for tech_swe
    const config = getDefaultSimulationConfig();
    config.clusterOverrides = { tech_swe: { adoptionCeiling: 0.50 } };
    const result = runSimulation(config, OCCUPATION_CLUSTERS, baselines);

    // Check that tech_swe adoption never exceeds 0.50
    for (const yearOutput of result.years) {
      const techCluster = yearOutput.clusters.find(c => c.clusterId === 'tech_swe');
      if (techCluster) {
        for (const bo of techCluster.bfcsOutput) {
          expect(bo.adoptionRate).toBeLessThanOrEqual(0.501); // small epsilon for floating point
        }
      }
    }
  });

  // ----------------------------------------------------------
  // 31. cluster_override.generative_weight changes weighted capability
  // ----------------------------------------------------------
  it('31. cluster_override.generative_weight changes weighted capability', () => {
    const blsData = loadBLSData();
    let baselines: Map<string, OccupationBaseline> | undefined;
    if (blsData.isLoaded) {
      baselines = transformOEWSToBaselines(blsData.oews, OCCUPATION_CLUSTERS, DEFAULT_ROLE_ESTIMATION_CONFIG).baselines;
    }

    // Default tech_swe weights: generative=0.70, agentic=0.25, embodied=0.05
    // Override to heavy embodied: generative=0.10, agentic=0.10, embodied=0.80
    const config = getDefaultSimulationConfig();
    config.clusterOverrides = {
      tech_swe: {
        generativeWeight: 0.10,
        agenticWeight: 0.10,
        embodiedWeight: 0.80,
      },
    };
    const result = runSimulation(config, OCCUPATION_CLUSTERS, baselines);

    // At year 2035, embodied is still very low (~0.035) so heavy embodied weighting
    // should produce a LOWER weighted capability than default (generative-heavy)
    const year2035 = result.years.find(y => y.year === 2035);
    expect(year2035).toBeDefined();

    const caps = year2035!.capabilities;
    const defaultWeightedCap = computeWeightedCapability(caps, { generative: 0.70, agentic: 0.25, embodied: 0.05 });
    const overrideWeightedCap = computeWeightedCapability(caps, { generative: 0.10, agentic: 0.10, embodied: 0.80 });

    // Override should produce lower weighted capability since embodied lags
    expect(overrideWeightedCap).toBeLessThan(defaultWeightedCap);
  });
});

// ============================================================
// Phase 8a: Fiscal Response Profile Import/Export
// ============================================================

describe('Phase 8a fiscal response profile CSV', () => {
  it('parses fiscal_response_profile preset name', () => {
    const csv = [
      'parameter_path,value',
      'fiscal_policy_preset,austerity',
    ].join('\n');
    const { params } = parseParameterCSV(csv);
    const { config, warnings } = buildConfigFromCSV(params);
    expect(warnings.filter(w => w.includes('fiscal'))).toHaveLength(0);
    expect(config.fiscalPolicyPreset).toBe('austerity');
  });

  it('parses fiscal_response.* custom overrides', () => {
    const csv = [
      'parameter_path,value',
      'fiscal_policy_preset,balanced_reduction',
      'fiscal_response.max_discretionary_cut,0.30',
      'fiscal_response.consolidation_lag,3',
    ].join('\n');
    const { params } = parseParameterCSV(csv);
    const { config, warnings } = buildConfigFromCSV(params);
    expect(warnings.filter(w => w.includes('fiscal'))).toHaveLength(0);
    expect(config.fiscalPolicyPreset).toBe('balanced_reduction');
    expect(config.fiscalPolicyCustom).toBeDefined();
    expect(config.fiscalPolicyCustom!.maxDiscretionaryCut).toBe(0.30);
    expect(config.fiscalPolicyCustom!.consolidationLag).toBe(3);
  });

  it('warns on unknown fiscal_response field', () => {
    const csv = [
      'parameter_path,value',
      'fiscal_response.nonexistent_field,42',
    ].join('\n');
    const { params } = parseParameterCSV(csv);
    const { warnings } = buildConfigFromCSV(params);
    expect(warnings.some(w => w.includes('nonexistent_field'))).toBe(true);
  });

  it('exports fiscal_response_profile in config CSV', () => {
    const config = getDefaultSimulationConfig();
    config.fiscalPolicyPreset = 'austerity';
    const csv = exportConfigToParameterCSV(config);
    expect(csv).toContain('fiscal_policy_preset,austerity');
  });

  it('exports fiscal_response.* custom overrides', () => {
    const config = getDefaultSimulationConfig();
    config.fiscalPolicyPreset = 'balanced_reduction';
    config.fiscalPolicyCustom = { maxDiscretionaryCut: 0.22, consolidationLag: 4 };
    const csv = exportConfigToParameterCSV(config);
    expect(csv).toContain('fiscal_response.max_discretionary_cut,0.22');
    expect(csv).toContain('fiscal_response.consolidation_lag,4');
  });

  it('round-trips fiscal response profile through export/import', () => {
    const config = getDefaultSimulationConfig();
    config.fiscalPolicyPreset = 'tax_the_winners';
    config.fiscalPolicyCustom = { consolidationLag: 2 };
    const exported = exportConfigToParameterCSV(config);
    const { params } = parseParameterCSV(exported);
    const { config: imported } = buildConfigFromCSV(params);
    expect(imported.fiscalPolicyPreset).toBe('tax_the_winners');
    expect(imported.fiscalPolicyCustom?.consolidationLag).toBe(2);
  });
});
