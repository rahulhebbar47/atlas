/**
 * Tests for BLS Data Transform
 *
 * Verifies SOC aggregation, role-level breakdown, wage percentile estimation,
 * and CPI/total employment transformation.
 */
import { describe, it, expect } from 'vitest';
import {
  aggregateSOCCodes,
  estimateRoleBreakdown,
  estimateWagePercentiles,
  transformOEWSToBaselines,
  transformCPIData,
  transformTotalEmployment,
} from '@/services/dataTransform';
import type { RawOEWSClusterData, RawCPIData, RawTotalEmploymentData } from '@/services/dataLoader';
import type { OccupationCluster } from '@/types';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
import realOewsData from '@/data/bls/oews-data.json';

// Cast the real OEWS data to the expected type
const oewsData = realOewsData as unknown as Record<string, RawOEWSClusterData>;

// ============================================================
// Test fixtures
// ============================================================

const mockOEWSCluster: RawOEWSClusterData = {
  clusterId: 'tech_swe',
  clusterName: 'Software Engineering',
  socCodes: {
    '15-1252': {
      '01': [{ year: '2024', period: 'A01', periodName: 'Annual', value: '1654440', footnotes: [{}] }],
      '04': [{ year: '2024', period: 'A01', periodName: 'Annual', value: '144570', footnotes: [{}] }],
      '13': [{ year: '2024', period: 'A01', periodName: 'Annual', value: '133080', footnotes: [{}] }],
    },
    '15-1253': {
      '01': [{ year: '2024', period: 'A01', periodName: 'Annual', value: '199800', footnotes: [{}] }],
      '04': [{ year: '2024', period: 'A01', periodName: 'Annual', value: '110260', footnotes: [{}] }],
      '13': [{ year: '2024', period: 'A01', periodName: 'Annual', value: '102610', footnotes: [{}] }],
    },
  },
};

const mockCPIData: RawCPIData = {
  seriesID: 'CUUR0000SA0',
  data: [
    { year: '2024', period: 'M13', periodName: 'Annual', value: '313.689', footnotes: [{}] },
    { year: '2024', period: 'M12', periodName: 'December', value: '315.605', footnotes: [{}] },
    { year: '2023', period: 'M13', periodName: 'Annual', value: '304.702', footnotes: [{}] },
    { year: '2022', period: 'M13', periodName: 'Annual', value: '292.655', footnotes: [{}] },
  ],
};

const mockTotalEmployment: RawTotalEmploymentData = {
  seriesID: 'CES0000000001',
  data: [
    { year: '2024', period: 'M12', periodName: 'December', value: '158316', footnotes: [{}] },
    { year: '2024', period: 'M11', periodName: 'November', value: '158079', footnotes: [{}] },
  ],
};

// ============================================================
// Tests
// ============================================================

describe('aggregateSOCCodes', () => {
  it('should sum employment across SOC codes', () => {
    const result = aggregateSOCCodes(mockOEWSCluster, 'tech_swe');
    // 1,654,440 + 199,800 = 1,854,240
    expect(result.totalEmployment).toBe(1654440 + 199800);
  });

  it('should compute employment-weighted average wages', () => {
    const result = aggregateSOCCodes(mockOEWSCluster, 'tech_swe');

    // Weighted mean wage: (144570 * 1654440 + 110260 * 199800) / (1654440 + 199800)
    const expectedWeightedMean =
      (144570 * 1654440 + 110260 * 199800) / (1654440 + 199800);
    expect(result.weightedMeanWage).toBeCloseTo(expectedWeightedMean, 0);

    // Weighted median wage: (133080 * 1654440 + 102610 * 199800) / (1654440 + 199800)
    const expectedWeightedMedian =
      (133080 * 1654440 + 102610 * 199800) / (1654440 + 199800);
    expect(result.weightedMedianWage).toBeCloseTo(expectedWeightedMedian, 0);
  });

  it('should track the most recent data year', () => {
    const result = aggregateSOCCodes(mockOEWSCluster, 'tech_swe');
    expect(result.dataYear).toBe('2024');
  });

  it('should handle missing data types gracefully', () => {
    const partial: RawOEWSClusterData = {
      clusterId: 'test',
      clusterName: 'Test',
      socCodes: {
        '99-0001': {
          '01': [{ year: '2024', period: 'A01', periodName: 'Annual', value: '1000', footnotes: [{}] }],
          // Missing '04' and '13'
        },
      },
    };
    const result = aggregateSOCCodes(partial, 'test');
    expect(result.totalEmployment).toBe(1000);
    expect(result.weightedMeanWage).toBe(0);
    expect(result.weightedMedianWage).toBe(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should handle suppressed BLS values (dashes)', () => {
    const suppressed: RawOEWSClusterData = {
      clusterId: 'test',
      clusterName: 'Test',
      socCodes: {
        '99-0001': {
          '01': [{ year: '2024', period: 'A01', periodName: 'Annual', value: '-', footnotes: [{}] }],
          '04': [{ year: '2024', period: 'A01', periodName: 'Annual', value: '50000', footnotes: [{}] }],
          '13': [{ year: '2024', period: 'A01', periodName: 'Annual', value: '45000', footnotes: [{}] }],
        },
      },
    };
    const result = aggregateSOCCodes(suppressed, 'test');
    // Employment is '-' → null → 0, so this SOC is skipped (employment <= 0)
    expect(result.totalEmployment).toBe(0);
  });
});

describe('estimateWagePercentiles', () => {
  it('should produce ordered percentiles (p10 < p25 < median < p75 < p90)', () => {
    const result = estimateWagePercentiles(100000, 110000);
    expect(result.p10).toBeLessThan(result.p25);
    expect(result.p25).toBeLessThan(100000); // p25 < median
    expect(100000).toBeLessThan(result.p75); // median < p75
    expect(result.p75).toBeLessThan(result.p90);
  });

  it('should handle zero median wage', () => {
    const result = estimateWagePercentiles(0, 0);
    expect(result.p10).toBe(0);
    expect(result.p25).toBe(0);
    expect(result.p75).toBe(0);
    expect(result.p90).toBe(0);
  });

  it('should handle equal mean and median (no skew)', () => {
    const result = estimateWagePercentiles(80000, 80000);
    // With no skew (mean === median), skewFactor = 0, so all percentiles equal median
    expect(result.p10).toBe(80000);
    expect(result.p25).toBe(80000);
    expect(result.p75).toBe(80000);
    expect(result.p90).toBe(80000);
  });

  it('should respect skewFactorScale parameter', () => {
    const narrow = estimateWagePercentiles(100000, 120000, 0.5);
    const wide = estimateWagePercentiles(100000, 120000, 2.0);
    // Higher skewFactorScale = wider spread
    expect(wide.p90 - wide.p10).toBeGreaterThan(narrow.p90 - narrow.p10);
  });

  it('should produce positive percentiles for typical wage data', () => {
    // Tech SWE: median ~130K, mean ~140K
    const result = estimateWagePercentiles(130000, 140000);
    expect(result.p10).toBeGreaterThan(0);
    expect(result.p25).toBeGreaterThan(0);
    expect(result.p75).toBeGreaterThan(0);
    expect(result.p90).toBeGreaterThan(0);
  });
});

describe('estimateRoleBreakdown', () => {
  it('should distribute employment using role share estimates', () => {
    const techSweCluster = OCCUPATION_CLUSTERS.find(c => c.id === 'tech_swe')!;
    const agg = aggregateSOCCodes(mockOEWSCluster, 'tech_swe');

    const baseline = estimateRoleBreakdown(agg, techSweCluster, DEFAULT_ROLE_ESTIMATION_CONFIG);

    // Should have entries for all roles
    expect(Object.keys(baseline.roles)).toHaveLength(techSweCluster.roles.length);

    // Role employments should sum approximately to total (rounding may differ slightly)
    const totalRoleEmployment = Object.values(baseline.roles).reduce(
      (sum, role) => sum + role.estimatedEmployment,
      0,
    );
    expect(totalRoleEmployment).toBeCloseTo(agg.totalEmployment, -2); // within ~100

    // Junior/mid (45% share) should have more employment than staff/principal (20%)
    const juniorMid = baseline.roles['junior_mid'];
    const staffPrincipal = baseline.roles['staff_principal'];
    expect(juniorMid?.estimatedEmployment).toBeGreaterThan(staffPrincipal?.estimatedEmployment ?? 0);
  });

  it('should scale wages by seniority level', () => {
    const techSweCluster = OCCUPATION_CLUSTERS.find(c => c.id === 'tech_swe')!;
    const agg = aggregateSOCCodes(mockOEWSCluster, 'tech_swe');

    const baseline = estimateRoleBreakdown(agg, techSweCluster, DEFAULT_ROLE_ESTIMATION_CONFIG);

    // Senior wages should be higher than junior/mid wages
    const juniorMid = baseline.roles['junior_mid'];
    const senior = baseline.roles['senior'];
    const staffPrincipal = baseline.roles['staff_principal'];

    expect(senior?.medianWage).toBeGreaterThan(juniorMid?.medianWage ?? 0);
    expect(staffPrincipal?.medianWage).toBeGreaterThan(senior?.medianWage ?? 0);
  });

  it('should set blsDataYear from aggregation', () => {
    const techSweCluster = OCCUPATION_CLUSTERS.find(c => c.id === 'tech_swe')!;
    const agg = aggregateSOCCodes(mockOEWSCluster, 'tech_swe');

    const baseline = estimateRoleBreakdown(agg, techSweCluster, DEFAULT_ROLE_ESTIMATION_CONFIG);
    expect(baseline.blsDataYear).toBe('2024');
  });
});

describe('transformOEWSToBaselines', () => {
  it('should produce baselines for clusters with data', () => {
    const { baselines, warnings } = transformOEWSToBaselines(
      oewsData,
      OCCUPATION_CLUSTERS,
      DEFAULT_ROLE_ESTIMATION_CONFIG,
    );

    // Should have baselines for most clusters (47 total - 2 gov without data - some may be missing)
    expect(baselines.size).toBeGreaterThanOrEqual(40);

    // Should warn about gov_federal and gov_state_local
    const govWarnings = warnings.filter(w => w.includes('gov_federal') || w.includes('gov_state_local'));
    expect(govWarnings.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle cluster ID mismatches correctly', () => {
    const { baselines } = transformOEWSToBaselines(
      oewsData,
      OCCUPATION_CLUSTERS,
      DEFAULT_ROLE_ESTIMATION_CONFIG,
    );

    // These canonical IDs should be resolved from their mismatched OEWS keys
    expect(baselines.has('tech_it_support')).toBe(true);
    expect(baselines.has('construction_electricians')).toBe(true);
    expect(baselines.has('retail_cashiers')).toBe(true);
    expect(baselines.has('food_fast_food')).toBe(true);
    expect(baselines.has('sci_lab_research')).toBe(true);
  });

  it('should produce positive employment for tech_swe', () => {
    const { baselines } = transformOEWSToBaselines(
      oewsData,
      OCCUPATION_CLUSTERS,
      DEFAULT_ROLE_ESTIMATION_CONFIG,
    );

    const techSwe = baselines.get('tech_swe');
    expect(techSwe).toBeDefined();
    expect(techSwe!.totalEmployment).toBeGreaterThan(1_000_000);
  });

  it('should produce no NaN values in any baseline', () => {
    const { baselines } = transformOEWSToBaselines(
      oewsData,
      OCCUPATION_CLUSTERS,
      DEFAULT_ROLE_ESTIMATION_CONFIG,
    );

    for (const [_clusterId, baseline] of baselines) {
      expect(isNaN(baseline.totalEmployment)).toBe(false);
      for (const [_roleId, roleData] of Object.entries(baseline.roles)) {
        expect(isNaN(roleData.estimatedEmployment)).toBe(false);
        expect(isNaN(roleData.medianWage)).toBe(false);
        expect(isNaN(roleData.meanWage)).toBe(false);
        expect(isNaN(roleData.wagePercentiles.p10)).toBe(false);
        expect(isNaN(roleData.wagePercentiles.p25)).toBe(false);
        expect(isNaN(roleData.wagePercentiles.p75)).toBe(false);
        expect(isNaN(roleData.wagePercentiles.p90)).toBe(false);
      }
    }
  });
});

describe('transformCPIData', () => {
  it('should extract annual CPI values (M13 periods)', () => {
    const { annualCPI, latestCPI } = transformCPIData(mockCPIData);

    expect(annualCPI.size).toBe(3); // 2024, 2023, 2022
    expect(annualCPI.get(2024)).toBeCloseTo(313.689, 1);
    expect(annualCPI.get(2023)).toBeCloseTo(304.702, 1);
    expect(annualCPI.get(2022)).toBeCloseTo(292.655, 1);
  });

  it('should identify the latest CPI year', () => {
    const { latestCPI } = transformCPIData(mockCPIData);
    expect(latestCPI).not.toBeNull();
    expect(latestCPI!.year).toBe(2024);
    expect(latestCPI!.value).toBeCloseTo(313.689, 1);
  });

  it('should ignore non-annual periods', () => {
    const { annualCPI } = transformCPIData(mockCPIData);
    // M12 (December) should NOT be in the annual CPI map
    // Only M13 (Annual average) entries should be included
    for (const [_year, _value] of annualCPI) {
      // All entries should come from M13 periods only
    }
    // We should have exactly 3 entries (2022, 2023, 2024 M13 entries)
    expect(annualCPI.size).toBe(3);
  });
});

describe('transformTotalEmployment', () => {
  it('should return the latest employment figure', () => {
    const result = transformTotalEmployment(mockTotalEmployment);
    expect(result).not.toBeNull();
    expect(result!.latestEmploymentThousands).toBe(158316);
    expect(result!.latestEmployment).toBe(158316000); // converted from thousands
    expect(result!.year).toBe(2024);
    expect(result!.month).toBe('December');
  });

  it('should handle empty data', () => {
    const empty: RawTotalEmploymentData = { seriesID: 'CES0000000001', data: [] };
    const result = transformTotalEmployment(empty);
    expect(result).toBeNull();
  });
});
