/**
 * Tests for SOC Code Mapping — Cluster ID Reconciliation
 */
import { describe, it, expect } from 'vitest';
import {
  OEWS_TO_CANONICAL_CLUSTER_ID,
  CANONICAL_TO_OEWS_CLUSTER_ID,
  CLUSTERS_WITHOUT_BLS_DATA,
  resolveCanonicalClusterId,
  resolveOEWSKey,
} from '@/data/socMapping';

describe('SOC Mapping', () => {
  describe('OEWS_TO_CANONICAL_CLUSTER_ID', () => {
    it('should have exactly 14 mismatched entries', () => {
      expect(Object.keys(OEWS_TO_CANONICAL_CLUSTER_ID)).toHaveLength(14);
    });

    it('should map all known mismatches correctly', () => {
      expect(OEWS_TO_CANONICAL_CLUSTER_ID['tech_it']).toBe('tech_it_support');
      expect(OEWS_TO_CANONICAL_CLUSTER_ID['health_techs']).toBe('health_technicians');
      expect(OEWS_TO_CANONICAL_CLUSTER_ID['health_aides']).toBe('health_home_health');
      expect(OEWS_TO_CANONICAL_CLUSTER_ID['trades_electrical']).toBe('construction_electricians');
      expect(OEWS_TO_CANONICAL_CLUSTER_ID['trades_plumbing']).toBe('construction_plumbers');
      expect(OEWS_TO_CANONICAL_CLUSTER_ID['trades_construction']).toBe('construction_general');
      expect(OEWS_TO_CANONICAL_CLUSTER_ID['trades_hvac']).toBe('construction_hvac');
      expect(OEWS_TO_CANONICAL_CLUSTER_ID['retail_floor']).toBe('retail_cashiers');
      expect(OEWS_TO_CANONICAL_CLUSTER_ID['retail_mgmt']).toBe('retail_management');
      expect(OEWS_TO_CANONICAL_CLUSTER_ID['retail_ecom']).toBe('retail_ecommerce');
      expect(OEWS_TO_CANONICAL_CLUSTER_ID['food_fast']).toBe('food_fast_food');
      expect(OEWS_TO_CANONICAL_CLUSTER_ID['prof_realestate']).toBe('prof_real_estate');
      expect(OEWS_TO_CANONICAL_CLUSTER_ID['ag_farm']).toBe('ag_farm_labor');
      expect(OEWS_TO_CANONICAL_CLUSTER_ID['sci_lab']).toBe('sci_lab_research');
    });
  });

  describe('CANONICAL_TO_OEWS_CLUSTER_ID (reverse mapping)', () => {
    it('should be the reverse of OEWS_TO_CANONICAL', () => {
      for (const [oews, canonical] of Object.entries(OEWS_TO_CANONICAL_CLUSTER_ID)) {
        expect(CANONICAL_TO_OEWS_CLUSTER_ID[canonical]).toBe(oews);
      }
    });

    it('should have same number of entries', () => {
      expect(Object.keys(CANONICAL_TO_OEWS_CLUSTER_ID)).toHaveLength(14);
    });
  });

  describe('CLUSTERS_WITHOUT_BLS_DATA', () => {
    it('should contain gov_federal, gov_state_local, and other_uncategorized', () => {
      expect(CLUSTERS_WITHOUT_BLS_DATA).toContain('gov_federal');
      expect(CLUSTERS_WITHOUT_BLS_DATA).toContain('gov_state_local');
      expect(CLUSTERS_WITHOUT_BLS_DATA).toContain('other_uncategorized');
    });

    // Updated from 2 to 3: added 'other_uncategorized' — this cluster
    // has no OEWS data; its baseline is synthesized from (CES total − OEWS sum).
    it('should have exactly 3 entries', () => {
      expect(CLUSTERS_WITHOUT_BLS_DATA).toHaveLength(3);
    });
  });

  describe('resolveCanonicalClusterId', () => {
    it('should resolve mismatched OEWS keys to canonical IDs', () => {
      expect(resolveCanonicalClusterId('tech_it')).toBe('tech_it_support');
      expect(resolveCanonicalClusterId('trades_electrical')).toBe('construction_electricians');
      expect(resolveCanonicalClusterId('retail_floor')).toBe('retail_cashiers');
      expect(resolveCanonicalClusterId('food_fast')).toBe('food_fast_food');
      expect(resolveCanonicalClusterId('sci_lab')).toBe('sci_lab_research');
    });

    it('should pass through IDs that already match', () => {
      expect(resolveCanonicalClusterId('tech_swe')).toBe('tech_swe');
      expect(resolveCanonicalClusterId('finance_trading')).toBe('finance_trading');
      expect(resolveCanonicalClusterId('health_nurses')).toBe('health_nurses');
      expect(resolveCanonicalClusterId('transport_trucking')).toBe('transport_trucking');
      expect(resolveCanonicalClusterId('gov_postal')).toBe('gov_postal');
    });
  });

  describe('resolveOEWSKey', () => {
    it('should resolve canonical IDs to OEWS keys', () => {
      expect(resolveOEWSKey('tech_it_support')).toBe('tech_it');
      expect(resolveOEWSKey('construction_electricians')).toBe('trades_electrical');
      expect(resolveOEWSKey('retail_cashiers')).toBe('retail_floor');
    });

    it('should pass through IDs that already match', () => {
      expect(resolveOEWSKey('tech_swe')).toBe('tech_swe');
      expect(resolveOEWSKey('finance_trading')).toBe('finance_trading');
    });

    it('should return null for clusters without BLS data', () => {
      expect(resolveOEWSKey('gov_federal')).toBeNull();
      expect(resolveOEWSKey('gov_state_local')).toBeNull();
    });
  });
});
