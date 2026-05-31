/**
 * ATLAS State Data Transform — Unit Tests
 *
 * Tests the state data transformation defined in src/data/stateTransform.ts.
 * Verifies proportional derivation of state cluster employment from
 * major SOC group data, and state distribution population on baselines.
 */

import { describe, it, expect } from 'vitest';
import {
  deriveStateOccupationDistributions,
  populateStateDistributions,
} from '@/data/stateTransform';
import type { OccupationBaseline } from '@/types';
import type { RawStateOEWSData, RawStateLAUSData, RawBLSDataPoint } from '@/services/dataLoader';

// ============================================================
// Test Helpers
// ============================================================

function makeDataPoint(value: string, year: string = '2024'): RawBLSDataPoint {
  return {
    year,
    period: 'A01',
    periodName: 'Annual',
    value,
    footnotes: [],
  };
}

function makeLAUSDataPoint(value: string, year: string = '2024'): RawBLSDataPoint {
  return {
    year,
    period: 'M13',
    periodName: 'Annual',
    value,
    footnotes: [],
  };
}

/**
 * Create minimal national baselines for testing.
 * Uses tech_swe (15-0000) and transport_trucking (53-0000).
 */
function makeNationalBaselines(): Map<string, OccupationBaseline> {
  const baselines = new Map<string, OccupationBaseline>();

  baselines.set('tech_swe', {
    clusterId: 'tech_swe',
    totalEmployment: 500_000,
    roles: {},
    stateDistribution: {},
    blsDataYear: '2024',
  });

  baselines.set('tech_data_ml', {
    clusterId: 'tech_data_ml',
    totalEmployment: 200_000,
    roles: {},
    stateDistribution: {},
    blsDataYear: '2024',
  });

  baselines.set('transport_trucking', {
    clusterId: 'transport_trucking',
    totalEmployment: 800_000,
    roles: {},
    stateDistribution: {},
    blsDataYear: '2024',
  });

  baselines.set('transport_delivery', {
    clusterId: 'transport_delivery',
    totalEmployment: 200_000,
    roles: {},
    stateDistribution: {},
    blsDataYear: '2024',
  });

  return baselines;
}

// ============================================================
// deriveStateOccupationDistributions
// ============================================================

describe('deriveStateOccupationDistributions', () => {
  it('proportionally derives cluster employment from SOC group data', () => {
    const stateOEWS: RawStateOEWSData = {
      TX: {
        '15-0000': [makeDataPoint('140000')], // Computer & Math: 140k
        '53-0000': [makeDataPoint('200000')], // Transportation: 200k
      },
    };

    const stateLAUS: RawStateLAUSData = {
      TX: {
        '03': [makeLAUSDataPoint('4.2')],     // 4.2% unemployment rate
        '06': [makeLAUSDataPoint('15000000')], // 15M labor force
      },
    };

    const baselines = makeNationalBaselines();
    const { stateDataMap, warnings } = deriveStateOccupationDistributions(
      stateOEWS,
      stateLAUS,
      baselines,
    );

    expect(stateDataMap.size).toBe(1);
    const txData = stateDataMap.get('TX');
    expect(txData).toBeDefined();

    // Tech SOC group (15-0000) national total = 500k + 200k = 700k
    // tech_swe share = 500k/700k ≈ 0.714
    // tech_data_ml share = 200k/700k ≈ 0.286
    // TX has 140k in 15-0000, so:
    // TX tech_swe = 140k * 0.714 = ~100k
    // TX tech_data_ml = 140k * 0.286 = ~40k
    expect(txData!.occupationDistribution['tech_swe']).toBeCloseTo(100_000, -3);
    expect(txData!.occupationDistribution['tech_data_ml']).toBeCloseTo(40_000, -3);

    // Transportation (53-0000) national total = 800k + 200k = 1M
    // transport_trucking share = 800k/1M = 0.8
    // transport_delivery share = 200k/1M = 0.2
    // TX has 200k in 53-0000, so:
    // TX trucking = 200k * 0.8 = 160k
    // TX delivery = 200k * 0.2 = 40k
    expect(txData!.occupationDistribution['transport_trucking']).toBeCloseTo(160_000, -3);
    expect(txData!.occupationDistribution['transport_delivery']).toBeCloseTo(40_000, -3);
  });

  it('handles suppressed data gracefully', () => {
    const stateOEWS: RawStateOEWSData = {
      WY: {
        '15-0000': [makeDataPoint('-')],       // Suppressed
        '53-0000': [makeDataPoint('50000')],
      },
    };

    const stateLAUS: RawStateLAUSData = {
      WY: {
        '03': [makeLAUSDataPoint('3.5')],
        '06': [makeLAUSDataPoint('300000')],
      },
    };

    const baselines = makeNationalBaselines();
    const { stateDataMap, warnings } = deriveStateOccupationDistributions(
      stateOEWS,
      stateLAUS,
      baselines,
    );

    const wyData = stateDataMap.get('WY');
    expect(wyData).toBeDefined();

    // Suppressed tech data should result in 0 employment
    expect(wyData!.occupationDistribution['tech_swe']).toBe(0);
    expect(wyData!.occupationDistribution['tech_data_ml']).toBe(0);

    // Transportation should still work
    expect(wyData!.occupationDistribution['transport_trucking']).toBeGreaterThan(0);

    // Should produce a warning about suppressed data
    expect(warnings.some(w => w.includes('WY') && w.includes('suppressed'))).toBe(true);
  });

  it('parses LAUS unemployment rate correctly (percent to decimal)', () => {
    const stateOEWS: RawStateOEWSData = {
      CA: {
        '15-0000': [makeDataPoint('100000')],
      },
    };

    const stateLAUS: RawStateLAUSData = {
      CA: {
        '03': [makeLAUSDataPoint('5.3')],      // 5.3% = 0.053
        '06': [makeLAUSDataPoint('19500000')],
      },
    };

    const baselines = makeNationalBaselines();
    const { stateDataMap } = deriveStateOccupationDistributions(
      stateOEWS,
      stateLAUS,
      baselines,
    );

    const caData = stateDataMap.get('CA');
    expect(caData!.baselineUnemploymentRate).toBeCloseTo(0.053, 4);
    expect(caData!.laborForce).toBe(19_500_000);
  });

  it('handles multiple states', () => {
    const stateOEWS: RawStateOEWSData = {
      TX: { '15-0000': [makeDataPoint('100000')] },
      CA: { '15-0000': [makeDataPoint('200000')] },
      NY: { '15-0000': [makeDataPoint('150000')] },
    };

    const stateLAUS: RawStateLAUSData = {
      TX: { '03': [makeLAUSDataPoint('4.0')], '06': [makeLAUSDataPoint('15000000')] },
      CA: { '03': [makeLAUSDataPoint('5.0')], '06': [makeLAUSDataPoint('19500000')] },
      NY: { '03': [makeLAUSDataPoint('4.5')], '06': [makeLAUSDataPoint('9500000')] },
    };

    const baselines = makeNationalBaselines();
    const { stateDataMap } = deriveStateOccupationDistributions(
      stateOEWS,
      stateLAUS,
      baselines,
    );

    expect(stateDataMap.size).toBe(3);
    expect(stateDataMap.has('TX')).toBe(true);
    expect(stateDataMap.has('CA')).toBe(true);
    expect(stateDataMap.has('NY')).toBe(true);
  });
});

// ============================================================
// populateStateDistributions
// ============================================================

describe('populateStateDistributions', () => {
  it('populates stateDistribution as fractions of national total', () => {
    const baselines = makeNationalBaselines();

    // Create state data where TX has 100k and CA has 400k of tech_swe (national total: 500k)
    const stateDataMap = new Map();
    stateDataMap.set('TX', {
      code: 'TX',
      name: 'Texas',
      population: 30_000_000,
      laborForce: 15_000_000,
      baselineUnemploymentRate: 0.04,
      occupationDistribution: { tech_swe: 100_000, transport_trucking: 300_000 },
      policyOverrides: {},
    });
    stateDataMap.set('CA', {
      code: 'CA',
      name: 'California',
      population: 39_000_000,
      laborForce: 19_500_000,
      baselineUnemploymentRate: 0.05,
      occupationDistribution: { tech_swe: 400_000, transport_trucking: 100_000 },
      policyOverrides: {},
    });

    populateStateDistributions(baselines, stateDataMap);

    const techSWE = baselines.get('tech_swe');
    expect(techSWE!.stateDistribution['TX']).toBeCloseTo(0.2, 4);  // 100k/500k
    expect(techSWE!.stateDistribution['CA']).toBeCloseTo(0.8, 4);  // 400k/500k

    const trucking = baselines.get('transport_trucking');
    expect(trucking!.stateDistribution['TX']).toBeCloseTo(0.375, 4); // 300k/800k
    expect(trucking!.stateDistribution['CA']).toBeCloseTo(0.125, 4); // 100k/800k
  });

  it('does not add state entries for 0 employment', () => {
    const baselines = makeNationalBaselines();
    const stateDataMap = new Map();
    stateDataMap.set('WY', {
      code: 'WY',
      name: 'Wyoming',
      population: 576_851,
      laborForce: 300_000,
      baselineUnemploymentRate: 0.03,
      occupationDistribution: { tech_swe: 0, transport_trucking: 50_000 },
      policyOverrides: {},
    });

    populateStateDistributions(baselines, stateDataMap);

    const techSWE = baselines.get('tech_swe');
    expect(techSWE!.stateDistribution['WY']).toBeUndefined();

    const trucking = baselines.get('transport_trucking');
    expect(trucking!.stateDistribution['WY']).toBeGreaterThan(0);
  });
});

// ============================================================
// Additional edge case tests
// ============================================================

describe('deriveStateOccupationDistributions — edge cases', () => {
  it('handles missing LAUS data with defaults', () => {
    const stateOEWS: RawStateOEWSData = {
      AK: {
        '15-0000': [makeDataPoint('5000')],
      },
    };

    // No LAUS entry for AK
    const stateLAUS: RawStateLAUSData = {};

    const baselines = makeNationalBaselines();
    const { stateDataMap, warnings } = deriveStateOccupationDistributions(
      stateOEWS,
      stateLAUS,
      baselines,
    );

    const akData = stateDataMap.get('AK');
    expect(akData).toBeDefined();
    // Should default to 0.04 unemployment rate when LAUS missing
    expect(akData!.baselineUnemploymentRate).toBe(0.04);
    expect(akData!.laborForce).toBe(0);
  });

  it('populates default policy overrides from reference data', () => {
    const stateOEWS: RawStateOEWSData = {
      CA: {
        '15-0000': [makeDataPoint('100000')],
      },
    };
    const stateLAUS: RawStateLAUSData = {
      CA: {
        '03': [makeLAUSDataPoint('5.0')],
        '06': [makeLAUSDataPoint('19000000')],
      },
    };

    const baselines = makeNationalBaselines();
    const { stateDataMap } = deriveStateOccupationDistributions(
      stateOEWS,
      stateLAUS,
      baselines,
    );

    const caData = stateDataMap.get('CA');
    expect(caData).toBeDefined();
    // Should populate minimumWage and regulatory from reference data
    expect(caData!.policyOverrides.minimumWage).toBeGreaterThan(0);
    expect(caData!.policyOverrides.avRegulatoryEnvironment).toBeDefined();
  });

  it('handles state with no matching SOC groups gracefully', () => {
    const stateOEWS: RawStateOEWSData = {
      DE: {
        '99-0000': [makeDataPoint('50000')], // Non-existent SOC group
      },
    };
    const stateLAUS: RawStateLAUSData = {
      DE: {
        '03': [makeLAUSDataPoint('3.8')],
        '06': [makeLAUSDataPoint('500000')],
      },
    };

    const baselines = makeNationalBaselines();
    const { stateDataMap } = deriveStateOccupationDistributions(
      stateOEWS,
      stateLAUS,
      baselines,
    );

    const deData = stateDataMap.get('DE');
    expect(deData).toBeDefined();
    // All cluster employment should be 0 since 99-0000 doesn't map to anything
    expect(deData!.occupationDistribution['tech_swe']).toBe(0);
  });

  it('handles BLS special values correctly', () => {
    const stateOEWS: RawStateOEWSData = {
      MT: {
        '15-0000': [makeDataPoint('**')],     // Not available
        '53-0000': [makeDataPoint('#')],      // Estimate not available
      },
    };
    const stateLAUS: RawStateLAUSData = {
      MT: {
        '03': [makeLAUSDataPoint('N')],       // Not available
        '06': [makeLAUSDataPoint('500000')],
      },
    };

    const baselines = makeNationalBaselines();
    const { stateDataMap } = deriveStateOccupationDistributions(
      stateOEWS,
      stateLAUS,
      baselines,
    );

    const mtData = stateDataMap.get('MT');
    expect(mtData).toBeDefined();
    // All suppressed → 0 employment
    expect(mtData!.occupationDistribution['tech_swe']).toBe(0);
    expect(mtData!.occupationDistribution['transport_trucking']).toBe(0);
    // Missing unemployment → default
    expect(mtData!.baselineUnemploymentRate).toBe(0.04);
  });

  it('uses state name and population from reference data', () => {
    const stateOEWS: RawStateOEWSData = {
      TX: {
        '15-0000': [makeDataPoint('100000')],
      },
    };
    const stateLAUS: RawStateLAUSData = {
      TX: {
        '03': [makeLAUSDataPoint('4.0')],
        '06': [makeLAUSDataPoint('15000000')],
      },
    };

    const baselines = makeNationalBaselines();
    const { stateDataMap } = deriveStateOccupationDistributions(
      stateOEWS,
      stateLAUS,
      baselines,
    );

    const txData = stateDataMap.get('TX');
    expect(txData!.name).toBe('Texas');
    expect(txData!.population).toBeGreaterThan(0);
    expect(txData!.code).toBe('TX');
  });

  it('total state cluster employment within SOC group sums to state SOC total', () => {
    const stateOEWS: RawStateOEWSData = {
      NY: {
        '15-0000': [makeDataPoint('300000')],
      },
    };
    const stateLAUS: RawStateLAUSData = {
      NY: {
        '03': [makeLAUSDataPoint('4.5')],
        '06': [makeLAUSDataPoint('9500000')],
      },
    };

    const baselines = makeNationalBaselines();
    const { stateDataMap } = deriveStateOccupationDistributions(
      stateOEWS,
      stateLAUS,
      baselines,
    );

    const nyData = stateDataMap.get('NY');
    // tech_swe + tech_data_ml should sum to ~300k (the state SOC group total)
    const techTotal = (nyData!.occupationDistribution['tech_swe'] ?? 0)
      + (nyData!.occupationDistribution['tech_data_ml'] ?? 0);
    expect(techTotal).toBeCloseTo(300_000, -2);
  });
});
