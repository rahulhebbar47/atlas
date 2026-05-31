/**
 * ATLAS State-Level Reference Data
 *
 * Contains all static reference data needed for state-level analysis:
 *   - FIPS codes for BLS series ID construction
 *   - State names for display
 *   - Population estimates for per-capita calculations
 *   - SOC major group mappings for cluster-to-state derivation
 *   - State minimum wages and regulatory classifications
 *
 * Sources cited inline per ATLAS conventions.
 */

import type { StateCode, OccupationClusterId } from '@/types';

// ============================================================
// 1. State FIPS Codes (50 states + DC)
// Source: US Census Bureau FIPS State Codes
// ============================================================

export const STATE_FIPS_CODES: Record<StateCode, string> = {
  AL: '01', AK: '02', AZ: '04', AR: '05', CA: '06',
  CO: '08', CT: '09', DE: '10', DC: '11', FL: '12',
  GA: '13', HI: '15', ID: '16', IL: '17', IN: '18',
  IA: '19', KS: '20', KY: '21', LA: '22', ME: '23',
  MD: '24', MA: '25', MI: '26', MN: '27', MS: '28',
  MO: '29', MT: '30', NE: '31', NV: '32', NH: '33',
  NJ: '34', NM: '35', NY: '36', NC: '37', ND: '38',
  OH: '39', OK: '40', OR: '41', PA: '42', RI: '44',
  SC: '45', SD: '46', TN: '47', TX: '48', UT: '49',
  VT: '50', VA: '51', WA: '53', WV: '54', WI: '55',
  WY: '56',
};

// ============================================================
// 2. State Full Names
// ============================================================

export const STATE_NAMES: Record<StateCode, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida',
  GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana',
  IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine',
  MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
  VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin',
  WY: 'Wyoming',
};

// ============================================================
// 3. State Population Estimates (2024)
// Source: US Census Bureau 2024 Population Estimates (released Dec 2024)
// https://www.census.gov/data/tables/time-series/demo/popest/2020s-state-total.html
// ============================================================

export const STATE_POPULATIONS: Record<StateCode, number> = {
  AL: 5_108_468,   AK: 733_536,     AZ: 7_431_344,   AR: 3_067_732,   CA: 38_965_193,
  CO: 5_877_610,   CT: 3_617_176,   DE: 1_031_890,   DC: 678_972,     FL: 22_610_726,
  GA: 11_029_227,  HI: 1_435_138,   ID: 1_964_726,   IL: 12_549_689,  IN: 6_862_199,
  IA: 3_207_004,   KS: 2_940_865,   KY: 4_526_154,   LA: 4_573_749,   ME: 1_395_722,
  MD: 6_180_253,   MA: 7_001_399,   MI: 10_037_261,  MN: 5_737_915,   MS: 2_939_690,
  MO: 6_196_156,   MT: 1_132_812,   NE: 1_978_379,   NV: 3_194_176,   NH: 1_402_054,
  NJ: 9_290_841,   NM: 2_114_371,   NY: 19_571_216,  NC: 10_835_491,  ND: 783_926,
  OH: 11_785_935,  OK: 4_053_824,   OR: 4_233_358,   PA: 12_961_683,  RI: 1_095_962,
  SC: 5_373_555,   SD: 919_318,     TN: 7_126_489,   TX: 30_503_340,  UT: 3_417_734,
  VT: 647_464,     VA: 8_642_274,   WA: 7_812_880,   WV: 1_770_071,   WI: 5_892_539,
  WY: 576_851,
};

// ============================================================
// 4. SOC Major Groups (22 two-digit groups)
// Source: BLS Standard Occupational Classification Manual 2018
// https://www.bls.gov/soc/2018/major_groups.htm
// ============================================================

/**
 * The 22 SOC major groups (2-digit codes formatted as "XX-0000").
 * Used for state-level OEWS series construction.
 */
export const SOC_MAJOR_GROUPS: Record<string, string> = {
  '11-0000': 'Management',
  '13-0000': 'Business and Financial Operations',
  '15-0000': 'Computer and Mathematical',
  '17-0000': 'Architecture and Engineering',
  '19-0000': 'Life, Physical, and Social Science',
  '21-0000': 'Community and Social Service',
  '23-0000': 'Legal',
  '25-0000': 'Educational Instruction and Library',
  '27-0000': 'Arts, Design, Entertainment, Sports, and Media',
  '29-0000': 'Healthcare Practitioners and Technical',
  '31-0000': 'Healthcare Support',
  '33-0000': 'Protective Service',
  '35-0000': 'Food Preparation and Serving Related',
  '37-0000': 'Building and Grounds Cleaning and Maintenance',
  '39-0000': 'Personal Care and Service',
  '41-0000': 'Sales and Related',
  '43-0000': 'Office and Administrative Support',
  '45-0000': 'Farming, Fishing, and Forestry',
  '47-0000': 'Construction and Extraction',
  '49-0000': 'Installation, Maintenance, and Repair',
  '51-0000': 'Production',
  '53-0000': 'Transportation and Material Moving',
};

// ============================================================
// 5. Cluster → SOC Major Group Mapping
//
// Maps each ATLAS cluster to its primary 2-digit SOC major group.
// Used to derive state-level cluster employment from state SOC group data.
//
// Some clusters span multiple SOC groups — we map to the PRIMARY one
// and accept small distribution approximation errors.
//
// Source: Cross-reference of occupationClusters.ts SOC codes with
// BLS SOC 2018 major group definitions.
// ============================================================

export const CLUSTER_TO_SOC_MAJOR_GROUP: Record<OccupationClusterId, string> = {
  // Technology (all 15-XXXX)
  tech_swe: '15-0000',
  tech_data_ml: '15-0000',
  tech_it_support: '15-0000',
  tech_qa: '15-0000',

  // Finance (mostly 13-XXXX)
  finance_trading: '13-0000',
  finance_banking: '13-0000',
  finance_accounting: '13-0000',
  finance_insurance: '13-0000',

  // Healthcare
  health_physicians: '29-0000',    // 29-XXXX: Healthcare Practitioners
  health_nurses: '29-0000',
  health_technicians: '29-0000',
  health_home_health: '31-0000',   // 31-XXXX: Healthcare Support
  health_admin: '11-0000',         // 11-9111: Medical & Health Services Managers

  // Education (25-XXXX)
  edu_teachers: '25-0000',
  edu_admin: '11-0000',            // 11-903X: Education Administrators
  edu_support: '25-0000',

  // Legal (23-XXXX)
  legal_attorneys: '23-0000',
  legal_paralegals: '23-0000',

  // Transportation (53-XXXX)
  transport_trucking: '53-0000',
  transport_delivery: '53-0000',
  transport_taxi: '53-0000',
  transport_warehouse: '53-0000',

  // Manufacturing (51-XXXX)
  mfg_assembly: '51-0000',
  mfg_machinists: '51-0000',
  mfg_qc: '51-0000',

  // Construction (47-XXXX)
  construction_electricians: '47-0000',
  construction_plumbers: '47-0000',
  construction_general: '47-0000',
  construction_hvac: '49-0000',    // 49-9021: HVAC is Installation/Maintenance

  // Retail (41-XXXX)
  retail_cashiers: '41-0000',
  retail_management: '41-0000',
  retail_ecommerce: '43-0000',     // 43-5011: Cargo/freight → Office & Admin Support

  // Food Service (35-XXXX)
  food_fast_food: '35-0000',
  food_restaurant: '35-0000',
  food_industrial: '51-0000',      // 51-3091/3092: Food processing → Production

  // Creative (27-XXXX)
  creative_design: '27-0000',
  creative_writing: '27-0000',
  creative_marketing: '13-0000',   // 13-1161: Market Research Analysts → Biz/Fin
  creative_media: '27-0000',

  // Professional Services
  prof_consulting: '13-0000',      // 13-1111: Management Analysts
  prof_hr: '13-0000',              // 13-1071: HR Specialists
  prof_real_estate: '41-0000',     // 41-9022: Real Estate Sales → Sales
  prof_admin: '43-0000',           // 43-XXXX: Office & Administrative Support

  // Government
  gov_federal: '43-0000',          // Cross-cutting — approximate with admin
  gov_state_local: '43-0000',      // Cross-cutting — approximate with admin
  gov_postal: '43-0000',           // 43-5052: Postal Service Clerks

  // Agriculture (45-XXXX)
  ag_farm_labor: '45-0000',
  ag_equipment: '45-0000',

  // Scientific R&D
  sci_lab_research: '19-0000',     // 19-XXXX: Life/Physical/Social Science
  sci_engineering: '17-0000',      // 17-XXXX: Architecture & Engineering
};

// ============================================================
// 6. State Minimum Wages (2024)
// Source: US Department of Labor Wage and Hour Division
// https://www.dol.gov/agencies/whd/minimum-wage/state
// States with no state minimum or lower than federal use federal rate ($7.25)
// ============================================================

export const STATE_MINIMUM_WAGES_2024: Record<StateCode, number> = {
  AL: 7.25,   // No state minimum — federal applies
  AK: 11.73,
  AZ: 14.35,
  AR: 11.00,
  CA: 16.00,
  CO: 14.42,
  CT: 15.69,
  DE: 13.25,
  DC: 17.50,
  FL: 13.00,
  GA: 7.25,   // State min $5.15 — federal applies
  HI: 14.00,
  ID: 7.25,
  IL: 14.00,
  IN: 7.25,
  IA: 7.25,
  KS: 7.25,
  KY: 7.25,
  LA: 7.25,   // No state minimum
  ME: 14.15,
  MD: 15.00,
  MA: 15.00,
  MI: 10.33,
  MN: 10.85,
  MS: 7.25,   // No state minimum
  MO: 12.30,
  MT: 10.30,
  NE: 12.00,
  NV: 12.00,
  NH: 7.25,   // No state minimum
  NJ: 15.13,
  NM: 12.00,
  NY: 15.00,
  NC: 7.25,
  ND: 7.25,
  OH: 10.45,
  OK: 7.25,
  OR: 14.70,
  PA: 7.25,
  RI: 14.00,
  SC: 7.25,   // No state minimum
  SD: 11.20,
  TN: 7.25,   // No state minimum
  TX: 7.25,
  UT: 7.25,
  VT: 13.67,
  VA: 12.00,
  WA: 16.28,
  WV: 8.75,
  WI: 7.25,
  WY: 7.25,
};

// ============================================================
// 7. State AV Regulatory Environment
// Source: National Conference of State Legislatures (NCSL)
// Autonomous Vehicle legislation tracker (2024)
// https://www.ncsl.org/transportation/autonomous-vehicles
//
// Categories:
//   permissive: explicit AV-friendly legislation, testing corridors
//   moderate: some regulation, conditional permits
//   restrictive: no AV legislation or restrictive requirements
// ============================================================

export type RegulatoryEnvironment = 'permissive' | 'moderate' | 'restrictive';

export const DEFAULT_STATE_AV_REGULATORY: Record<StateCode, RegulatoryEnvironment> = {
  AL: 'moderate',    AK: 'restrictive', AZ: 'permissive',  AR: 'moderate',    CA: 'permissive',
  CO: 'permissive',  CT: 'moderate',    DE: 'moderate',     DC: 'permissive',  FL: 'permissive',
  GA: 'permissive',  HI: 'restrictive', ID: 'restrictive',  IL: 'moderate',    IN: 'moderate',
  IA: 'moderate',    KS: 'moderate',    KY: 'moderate',     LA: 'moderate',    ME: 'restrictive',
  MD: 'moderate',    MA: 'moderate',    MI: 'permissive',   MN: 'moderate',    MS: 'moderate',
  MO: 'moderate',    MT: 'restrictive', NE: 'moderate',     NV: 'permissive',  NH: 'moderate',
  NJ: 'moderate',    NM: 'moderate',    NY: 'moderate',     NC: 'permissive',  ND: 'moderate',
  OH: 'permissive',  OK: 'moderate',    OR: 'moderate',     PA: 'permissive',  RI: 'restrictive',
  SC: 'moderate',    SD: 'moderate',    TN: 'permissive',   TX: 'permissive',  UT: 'permissive',
  VT: 'restrictive', VA: 'permissive',  WA: 'moderate',     WV: 'restrictive', WI: 'moderate',
  WY: 'restrictive',
};

// ============================================================
// 8. Regulatory Lag Modifiers
// Source: POLICY_MODEL.md §6.2 — state regulatory environment impact
//
// Additional years of lag applied to AV/robotics adoption based on
// state regulatory environment.
// ============================================================

export const REGULATORY_LAG_MODIFIERS: Record<RegulatoryEnvironment, number> = {
  permissive: 0,
  moderate: 1,
  restrictive: 3,
};

// ============================================================
// 9. Convenience: All state codes as array
// ============================================================

export const ALL_STATE_CODES: StateCode[] = Object.keys(STATE_FIPS_CODES);
