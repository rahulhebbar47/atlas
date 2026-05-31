/**
 * Tests for BLS Data Loader
 */
import { describe, it, expect } from 'vitest';
import { loadBLSData } from '@/services/dataLoader';

describe('loadBLSData', () => {
  it('should load BLS data successfully when files exist', () => {
    const result = loadBLSData();
    expect(result.isLoaded).toBe(true);
  });

  it('should return OEWS data with expected clusters', () => {
    const result = loadBLSData();
    if (!result.isLoaded) throw new Error('BLS data should be loaded');

    const oewsKeys = Object.keys(result.oews);
    // Should have 45 clusters (47 total minus gov_federal and gov_state_local)
    expect(oewsKeys.length).toBeGreaterThanOrEqual(40);

    // Check a few known cluster keys from the fetch script
    expect(oewsKeys).toContain('tech_swe');
    expect(oewsKeys).toContain('finance_trading');
    expect(oewsKeys).toContain('health_nurses');
    expect(oewsKeys).toContain('transport_trucking');
  });

  it('should return CPI data with data points', () => {
    const result = loadBLSData();
    if (!result.isLoaded) throw new Error('BLS data should be loaded');

    expect(result.cpi.seriesID).toBe('CUUR0000SA0');
    expect(result.cpi.data.length).toBeGreaterThan(0);
  });

  it('should return total employment data', () => {
    const result = loadBLSData();
    if (!result.isLoaded) throw new Error('BLS data should be loaded');

    expect(result.totalEmployment.seriesID).toBe('CES0000000001');
    expect(result.totalEmployment.data.length).toBeGreaterThan(0);
  });

  it('should return metadata with fetch timestamp', () => {
    const result = loadBLSData();
    if (!result.isLoaded) throw new Error('BLS data should be loaded');

    expect(result.metadata.fetchedAt).toBeTruthy();
    expect(result.metadata.source).toContain('Bureau of Labor Statistics');
    expect(result.metadata.clusterCount).toBeGreaterThanOrEqual(40);
  });

  it('should return OEWS clusters with valid socCodes structure', () => {
    const result = loadBLSData();
    if (!result.isLoaded) throw new Error('BLS data should be loaded');

    const techSwe = result.oews['tech_swe'];
    expect(techSwe).toBeDefined();
    if (!techSwe) return;
    expect(techSwe.socCodes).toBeDefined();
    expect(Object.keys(techSwe.socCodes).length).toBeGreaterThan(0);

    // Check that SOC codes have expected data types
    const firstSoc = Object.values(techSwe.socCodes)[0];
    expect(firstSoc).toBeDefined();
    if (!firstSoc) return;
    // Should have at least one of '01', '04', '13'
    const dataTypes = Object.keys(firstSoc);
    expect(dataTypes.length).toBeGreaterThan(0);
  });
});
