/**
 * ATLAS Full CSV Results Export
 *
 * Exports the complete simulation output as a single wide-format CSV
 * with one row per year covering every computed value.
 *
 * This is separate from the existing per-category CSV exports in
 * src/utils/export.ts — those are preserved as-is.
 */

import type { SimulationTimeline, SimulationYearOutput, ClusterDisplacementResult } from '@/types';
import { OCCUPATION_CLUSTERS, OCCUPATION_CLUSTER_MAP } from '@/data/occupationClusters';
import { computeWeightedCapability } from '@/models/capabilities';
import { SECTOR_DEFLATION_INTENSITY, AI_PRODUCTIVITY_MULTIPLIER_BY_DEPLOYMENT } from '@/models/constants';
import { downloadCSV } from '@/utils/export';
import { interpolatePolicy } from '@/utils/policyInterpolation';

// ============================================================
// Column Specification
// ============================================================

/** All cluster IDs in canonical order (used for per-cluster columns). */
const CLUSTER_IDS = OCCUPATION_CLUSTERS.map(c => c.id);

/** Per-cluster metric suffixes. */
const CLUSTER_METRICS = [
  '_displacement_pct',
  '_remaining_employment',
  '_trigger_year',
  '_adoption_rate',
  '_deflation_intensity',
  '_weighted_capability',
  '_effective_productivity',
] as const;

/**
 * Build the complete header row (276 columns).
 */
function buildHeaders(): string[] {
  const headers: string[] = [];

  // A. Year (1)
  headers.push('year');

  // B. Capability Scores (3)
  headers.push('capability_generative', 'capability_agentic', 'capability_embodied');

  // B2. Dynamic Demographics (2) — Phase 5g
  headers.push('dynamic_population', 'dynamic_labor_force');

  // C. Employment & Labor (5)
  headers.push(
    'total_employment', 'total_unemployment', 'unemployment_rate',
    'labor_force_participation', 'total_displaced',
  );

  // D. Income (7)
  headers.push(
    'aggregate_wage_income', 'aggregate_asset_income', 'aggregate_transfer_income',
    'total_income', 'wage_share', 'asset_share', 'transfer_share',
  );

  // E. Prices & Inflation (5)
  headers.push('price_level', 'inflation_rate', 'ai_deflation_rate', 'net_inflation', 'sector_weighted_deflation_rate');

  // F. GDP (6)
  headers.push(
    'gdp_nominal', 'gdp_real', 'gdp_growth_rate',
    'consumption', 'investment', 'government_spending',
  );

  // G. Consumer Welfare Index + AI GDP Contribution (8)
  headers.push(
    'consumer_welfare_index', 'cwi_growth_rate', 'cwi_acceleration', 'cycle_phase',
    'median_cwi', 'median_cwi_growth_rate',
    'ai_gdp_contribution', 'ai_gdp_contribution_pct',
  );

  // H. Depression (2)
  headers.push('is_depression', 'consecutive_decline_quarters');

  // I. Revenue Pressure, Acceleration, Demand Spillover, Wage Pressure & Second-Order (15)
  headers.push('revenue_pressure', 'automation_acceleration', 'wage_pressure');
  headers.push(
    'consumer_demand_ratio', 'gov_demand_ratio', 'business_demand_ratio',
    'aggregate_demand_survival', 'total_demand_spillover_loss',
  );
  headers.push(
    'demand_ratio', 'demand_penalty',
    'consumer_credit_multiplier', 'consumer_credit_tightening',
    'income_adequacy_ratio', 'underwritable_income',
    'business_credit_multiplier', 'business_credit_tightening', 'profit_coverage_ratio',
    'fiscal_deficit_gdp_pct', 'discretionary_spending',
  );

  // I2. Deflation Velocity Drag (2)
  headers.push('velocity_multiplier', 'deflation_drag_pct');

  // I3. Income Derivation (3)
  headers.push('cumulative_inflation_factor', 'baseline_transfer_income', 'effective_inflation_rate');

  // J. New Jobs (4)
  headers.push('automation_coverage', 'new_jobs_created', 'durable_new_jobs', 'net_job_creation');

  // J2. AI Production Expansion & New Job Integration (9)
  headers.push(
    'total_human_new_jobs', 'new_job_wage_income',
    'ai_additional_output', 'ai_investment_boost', 'ai_net_export_boost',
    'ai_consumer_goods_potential', 'unrealized_ai_output',
    'ai_goods_absorbed', 'ai_capacity_utilization',
  );

  // J3. Demand-Constrained GDP (5)
  headers.push(
    'potential_gdp', 'capacity_utilization',
    'wage_consumption', 'asset_consumption', 'transfer_consumption',
  );

  // J3b. Asset Income Decomposition (8)
  headers.push(
    'dividend_income', 'ai_capital_gains', 'traditional_capital_gains',
    'non_corporate_asset_income', 'non_corporate_asset_tax',
    'capital_gains_realization_rate', 'ai_sector_pe', 'traditional_sector_pe',
  );

  // J4. Corporate Profits (6) — Phase 5g
  headers.push(
    'corporate_profits', 'ai_corporate_profits', 'traditional_corporate_profits', 'profit_gdp_ratio',
    'prev_ai_corporate_profits', 'prev_traditional_corporate_profits',
  );

  // J5. Price Level Decomposition (3) — Phase 5g Batch C
  headers.push('min_wage_cost_push', 'credit_deflation_contribution', 'scarcity_inflation');

  // J6. Labor Supply Response (2) — Phase 5g Step 12
  headers.push('voluntary_withdrawal_rate', 'effective_labor_supply');

  // J7. Housing & Shelter (Phase 5i) — 20 columns
  headers.push(
    'goods_inflation', 'shelter_inflation', 'composite_inflation',
    'shelter_deflation_from_ai', 'foreclosure_supply_effect',
    'rental_demand_pressure', 'institutional_absorption',
    'mortgage_stress_index',
    'foreclosure_rate_aggregate',
    'homeownership_q1', 'homeownership_q2', 'homeownership_q3',
    'homeownership_q4', 'homeownership_q5', 'avg_homeownership',
    'home_price_change_rate', 'home_price_index',
    'affordability_deviation', 'real_income_growth_rate', 'mortgage_rate_change',
    'nominal_wage_growth',
    'housing_wealth_drag',
    'effective_mpc_wage', 'precautionary_mpc_reduction',
    'credit_adoption_acceleration',
  );

  // J8. Investment Demand Constraint (3)
  headers.push('investment_realization', 'ai_investment_realized', 'ai_exports_realized');

  // J9. Tax Revenue & After-Tax Income (Phase 5-tax) — 11 columns
  headers.push(
    'wage_income_tax', 'employee_payroll_tax', 'employer_payroll_tax',
    'capital_gains_tax', 'corporate_tax_revenue', 'state_local_revenue',
    'total_government_revenue',
    'after_tax_wage_income', 'after_tax_asset_income', 'after_tax_transfer_income',
    'total_post_tax_income',
  );

  // J10. Investment Capacity (Phase 5-tax) — 8 columns
  headers.push(
    'after_tax_corporate_profits', 'retained_earnings',
    'credit_capacity', 'investment_capacity', 'capacity_gate',
    'profit_funded_ratio', 'credit_funded_ratio',
    'corporate_cash_accumulation',
  );

  // J11. AI Cost Indices (Phase 5-tax) — 4 columns
  headers.push(
    'blended_ai_cost_index', 'inference_cost_index',
    'manufacturing_cost_index', 'energy_cost_index',
  );

  // J12. Supply Chain (Phase 5-tax + Phase 9) — 16 columns
  headers.push('import_dependence');
  headers.push(
    'aggregate_resilience',
    'cumulative_delay_generative', 'cumulative_delay_agentic', 'cumulative_delay_embodied',
    'supply_chain_cost_push', 'cascade_backlog',
    'dynamic_training_comp_chips', 'dynamic_training_comp_energy', 'dynamic_training_comp_dc',
    'effective_compute_decline_rate',
    'deployment_multiplier_compute', 'deployment_multiplier_physical', 'deployment_multiplier_energy',
    'cost_pass_through_rate', 'adoption_drag_multiplier',
    'automation_dividend',
  );

  // K. Policy Effects (10)
  headers.push(
    'policy_wage_addition', 'policy_asset_addition', 'policy_transfer_addition',
    'policy_total_income', 'policy_fiscal_cost', 'policy_fiscal_cost_gdp_pct',
    'swf_fund_size', 'swf_annual_contribution', 'required_asset_ownership', 'required_transfer_level',
  );

  // K2. Per-Year Interpolated Policy Values (9)
  headers.push(
    'policy_min_wage_value', 'policy_wage_subsidy_pct',
    'policy_swf_contribution', 'policy_equity_ownership', 'policy_profit_share_pct',
    'policy_ubi_monthly', 'policy_ui_replacement_rate', 'policy_retraining_stipend',
  );

  // L. Monetary State (7) — +1 for dynamic_velocity (Phase 5g), transfer_funding_source → money_creation_share
  headers.push(
    'money_supply', 'velocity_of_money', 'dynamic_velocity', 'money_creation_share',
    'max_neutral_transfers', 'inflation_from_transfers', 'within_neutral_zone',
  );

  // L2. Fiscal-Monetary System (Phase 7) — 46 columns
  // Fiscal State (13)
  headers.push(
    'fm_federal_debt_stock', 'fm_debt_gdp_ratio', 'fm_interest_expense',
    'fm_debt_service_revenue_ratio', 'fm_weighted_average_debt_rate',
    'fm_total_government_revenue', 'fm_revenue_gdp_ratio',
    'fm_labor_tax_revenue', 'fm_corporate_tax_revenue',
    'fm_primary_deficit', 'fm_total_deficit',
    'fm_weighted_average_maturity', 'fm_effective_rollover_rate',
  );
  // Federal Reserve State (7)
  headers.push(
    'fm_taylor_prescribed_rate', 'fm_policy_rate',
    'fm_fiscal_dominance_active', 'fm_fiscal_dominance_gap',
    'fm_dominance_factor',
    'fm_output_gap', 'fm_full_employment_gdp',
  );
  // Bond Market State (13) — Phase 8 Fix 4: +3 risk sub-components
  headers.push(
    'fm_ten_year_yield', 'fm_expected_average_policy_rate',
    'fm_term_premium', 'fm_fiscal_risk_premium', 'fm_supply_pressure_premium',
    'fm_mortgage_rate', 'fm_corporate_borrowing_rate', 'fm_foreign_demand_ratio',
    'fm_consolidation_credibility',
    'fm_absorption_capacity',
    'fm_fiscal_risk_trajectory', 'fm_fiscal_risk_sustainability', 'fm_fiscal_risk_level',
  );
  // Equity Market State (6)
  headers.push(
    'fm_aggregate_market_cap', 'fm_pe_ratio',
    'fm_effective_pe_multiplier', 'fm_growth_momentum',
    'fm_equity_discount_rate', 'fm_market_return',
  );
  // Monetization State (10)
  headers.push(
    'fm_monetization_rate', 'fm_money_created',
    'fm_bond_financed_deficit', 'fm_inflation_from_monetization',
    'fm_yield_response_active', 'fm_yield_response_monetization',
    'fm_lolr_active', 'fm_lolr_monetization',
    'fm_transmission_efficiency', 'fm_taper_applied',
  );

  // L3. Fiscal Response (Phase 8a) — 10 columns
  headers.push(
    'fiscal_response_profile',
    'fiscal_consolidation_intensity',
    'fiscal_discretionary_multiplier',
    'fiscal_obligation_multiplier',
    'fiscal_revenue_multiplier',
    'effective_cola_factor',
    'real_gdp_growth_rate',
    'real_consumer_demand_ratio',
    'real_gov_demand_ratio',
    'real_business_demand_ratio',
  );

  // L4. Parameter Provenance (Phase 8b) — 23 columns
  headers.push(
    'param_profile_name',
    'param_consolidation_intensity', 'param_consolidation_intensity_source',
    'param_discretionary_multiplier', 'param_discretionary_multiplier_source',
    'param_obligation_multiplier', 'param_obligation_multiplier_source',
    'param_revenue_multiplier', 'param_revenue_multiplier_source',
    'param_effective_cola_factor', 'param_effective_cola_factor_source',
    'param_effective_income_tax_rate', 'param_effective_income_tax_rate_source',
    'param_effective_payroll_tax_rate', 'param_effective_payroll_tax_rate_source',
    'param_effective_corporate_tax_rate', 'param_effective_corporate_tax_rate_source',
    'param_effective_capital_gains_tax_rate', 'param_effective_capital_gains_tax_rate_source',
    'param_qe_monetization_rate', 'param_qe_monetization_rate_source',
    'param_max_financial_repression_rate', 'param_max_financial_repression_rate_source',
  );

  // M. Per-Cluster (CLUSTER_IDS.length x 4)
  for (const clusterId of CLUSTER_IDS) {
    for (const suffix of CLUSTER_METRICS) {
      headers.push(`cluster_${clusterId}${suffix}`);
    }
  }

  // N. Timeline Summary (15)
  headers.push(
    'timeline_depression_onset_year',
    'timeline_peak_employment_year', 'timeline_policy_prevents_depression',
    'timeline_prep_window_open', 'timeline_prep_window_close',
    'timeline_prep_window_duration',
    'timeline_fiscal_window_open', 'timeline_fiscal_window_close',
    'timeline_fiscal_window_duration',
    'timeline_gdp_peak_year', 'timeline_gdp_peak_value',
    'timeline_cycle_start_year', 'timeline_valley_floor_year',
    'timeline_valley_depth_pct', 'timeline_recovery_year',
    'timeline_monetary_collapse_year',
  );

  return headers;
}

// ============================================================
// Row Building
// ============================================================

/**
 * Build a row of values for a single simulation year.
 */
function buildRow(
  yearOutput: SimulationYearOutput,
  timeline: SimulationTimeline,
): (string | number)[] {
  const { macro, monetary, policyEffects, clusters } = yearOutput;
  const row: (string | number)[] = [];

  // Build cluster lookup for fast access
  const clusterMap = new Map<string, ClusterDisplacementResult>();
  for (const c of clusters) {
    clusterMap.set(c.clusterId, c);
  }

  // A. Year
  row.push(yearOutput.year);

  // B. Capability Scores (3 vectors)
  row.push(
    yearOutput.capabilities.generative, yearOutput.capabilities.agentic,
    yearOutput.capabilities.embodied,
  );

  // B2. Dynamic Demographics (Phase 5g)
  row.push(macro.dynamicPopulation, macro.dynamicLaborForce);

  // C. Employment & Labor
  const totalDisplaced = clusters.reduce((sum, c) => sum + c.totalDisplacement, 0);
  row.push(
    macro.totalEmployment, macro.totalUnemployment, macro.unemploymentRate,
    macro.laborForceParticipation, totalDisplaced,
  );

  // D. Income
  row.push(
    macro.aggregateWageIncome, macro.aggregateAssetIncome, macro.aggregateTransferIncome,
    macro.totalIncome, macro.incomeComposition.wageShare,
    macro.incomeComposition.assetShare, macro.incomeComposition.transferShare,
  );

  // E. Prices & Inflation
  row.push(macro.priceLevel, macro.inflationRate, macro.aiDeflationRate, macro.netInflation, macro.sectorWeightedDeflationRate);

  // F. GDP
  row.push(
    macro.gdpNominal, macro.gdpReal, macro.gdpGrowthRate,
    macro.consumption, macro.investment, macro.governmentSpending,
  );

  // G. Consumer Welfare Index + AI GDP Contribution
  row.push(
    macro.consumerWelfareIndex, macro.cwiGrowthRate, macro.cwiAcceleration, macro.cyclePhase,
    macro.medianCWI, macro.medianCWIGrowthRate,
    macro.aiGDPContribution, macro.aiGDPContributionPct,
  );

  // H. Depression
  row.push(macro.isDepression ? 1 : 0, macro.consecutiveDeclineQuarters);

  // I. Revenue Pressure, Acceleration, Demand Spillover, Wage Pressure & Second-Order
  row.push(macro.revenuePressure, macro.automationAcceleration, macro.wagePressure);
  row.push(
    macro.consumerDemandRatio, macro.govDemandRatio, macro.businessDemandRatio,
    macro.aggregateDemandSurvival, macro.totalDemandSpilloverLoss,
  );
  row.push(
    macro.demandRatio, macro.demandPenalty,
    macro.consumerCreditMultiplier, macro.consumerCreditTightening,
    macro.incomeAdequacyRatio, macro.underwritableIncome,
    macro.businessCreditMultiplier, macro.businessCreditTightening, macro.profitCoverageRatio,
    macro.fiscalDeficitGDPRatio, macro.discretionarySpending,
  );

  // I2. Deflation Velocity Drag
  row.push(macro.velocityMultiplier, macro.deflationDragPct);

  // I3. Income Derivation
  row.push(macro.cumulativeInflationFactor, macro.baselineTransferIncome, macro.effectiveInflationRate);

  // J. New Jobs
  row.push(
    macro.automationCoverage, macro.newJobCreationRate,
    macro.durableNewJobs, macro.netJobCreation,
  );

  // J2. AI Production Expansion & New Job Integration
  row.push(
    macro.newJobEmployment, macro.newJobWageIncome,
    macro.aiAdditionalOutput, macro.aiInvestmentBoost, macro.aiNetExportBoost,
    macro.aiConsumerGoodsPotential, macro.unrealizedAIOutput,
    macro.aiGoodsAbsorbed, macro.aiCapacityUtilization,
  );

  // J3. Demand-Constrained GDP
  row.push(
    macro.potentialGDP, macro.capacityUtilization,
    macro.wageConsumption, macro.assetConsumption, macro.transferConsumption,
  );

  // J3b. Asset Income Decomposition
  row.push(
    macro.dividendIncome, macro.aiCapitalGains, macro.traditionalCapitalGains,
    macro.nonCorporateAssetIncome, macro.nonCorporateAssetTax,
    macro.capitalGainsRealizationRate, macro.aiSectorPE, macro.traditionalSectorPE,
  );

  // J4. Corporate Profits (Phase 5g)
  row.push(
    macro.corporateProfits, macro.aiCorporateProfits, macro.traditionalCorporateProfits, macro.profitGDPRatio,
    macro.prevAICorporateProfits, macro.prevTraditionalCorporateProfits,
  );

  // J5. Price Level Decomposition (Phase 5g Batch C)
  row.push(macro.minWageCostPush, macro.creditDeflationContribution, macro.scarcityInflation);

  // J6. Labor Supply Response (Phase 5g Step 12)
  row.push(macro.voluntaryWithdrawalRate, macro.effectiveLaborSupply);

  // J7. Housing & Shelter (Phase 5i)
  row.push(
    macro.goodsInflation, macro.shelterInflation, macro.compositeInflation,
    macro.shelterDeflationFromAI, macro.foreclosureSupplyEffect,
    macro.rentalDemandPressure, macro.institutionalAbsorption,
    macro.mortgageStressIndex,
    macro.foreclosureRateAggregate,
    macro.homeownershipQ1, macro.homeownershipQ2, macro.homeownershipQ3,
    macro.homeownershipQ4, macro.homeownershipQ5, macro.avgHomeownership,
    macro.homePriceChangeRate, macro.homePriceIndex,
    macro.affordabilityDeviation, macro.realIncomeGrowthRate, macro.mortgageRateChange,
    macro.nominalWageGrowth,
    macro.housingWealthDrag,
    macro.effectiveMpcWage, macro.precautionaryMpcReduction,
    macro.creditAdoptionAcceleration,
  );

  // J8. Investment Demand Constraint
  row.push(macro.investmentRealization, macro.aiInvestmentRealized, macro.aiExportsRealized);

  // J9. Tax Revenue & After-Tax Income (Phase 5-tax)
  row.push(
    macro.wageIncomeTax, macro.employeePayrollTax, macro.employerPayrollTax,
    macro.capitalGainsTax, macro.corporateTaxRevenue, macro.stateLocalRevenue,
    macro.totalGovernmentRevenue,
    macro.afterTaxWageIncome, macro.afterTaxAssetIncome, macro.afterTaxTransferIncome,
    macro.totalPostTaxIncome,
  );

  // J10. Investment Capacity
  row.push(
    macro.afterTaxCorporateProfits, macro.retainedEarnings,
    macro.creditCapacity, macro.investmentCapacity, macro.capacityGate,
    macro.profitFundedRatio, macro.creditFundedRatio,
    macro.corporateCashAccumulation,
  );

  // J11. AI Cost Indices
  row.push(
    macro.blendedAiCostIndex, macro.inferenceCostIndex,
    macro.manufacturingCostIndex, macro.energyCostIndex,
  );

  // J12. Supply Chain
  row.push(macro.importDependence);
  row.push(
    macro.aggregateResilience,
    macro.cumulativeDelayGenerative, macro.cumulativeDelayAgentic, macro.cumulativeDelayEmbodied,
    macro.supplyChainCostPush, macro.cascadeBacklog,
    macro.dynamicTrainingCompChips, macro.dynamicTrainingCompEnergy, macro.dynamicTrainingCompDC,
    macro.effectiveComputeDeclineRate,
    macro.deploymentMultiplierCompute, macro.deploymentMultiplierPhysical, macro.deploymentMultiplierEnergy,
    macro.costPassThroughRate, macro.adoptionDragMultiplier,
    macro.automationDividend,
  );

  // K. Policy Effects
  row.push(
    policyEffects.wageChannelAddition, policyEffects.assetChannelAddition,
    policyEffects.transferChannelAddition, policyEffects.totalPolicyIncome,
    policyEffects.fiscalCost, policyEffects.fiscalCostAsPercentGDP,
    policyEffects.sovereignFundSize, policyEffects.swfAnnualContribution,
    policyEffects.requiredAssetOwnership, policyEffects.requiredTransferLevel,
  );

  // K2. Per-Year Interpolated Policy Values
  const pc = timeline.config.policyConfig;
  row.push(
    interpolatePolicy(pc.minimumWage.federalMinimum, yearOutput.year),
    interpolatePolicy(pc.wageSubsidy.subsidyPercentage, yearOutput.year),
    interpolatePolicy(pc.sovereignWealthFund.annualContribution, yearOutput.year),
    interpolatePolicy(pc.sovereignWealthFund.ownershipFraction, yearOutput.year),
    interpolatePolicy(pc.profitSharing.mandatorySharePercentage, yearOutput.year),
    interpolatePolicy(pc.ubi.monthlyAmount, yearOutput.year),
    interpolatePolicy(pc.enhancedUI.replacementRate, yearOutput.year),
    interpolatePolicy(pc.retraining.stipendMonthly, yearOutput.year),
  );

  // L. Monetary State
  row.push(
    monetary.moneySupply, monetary.velocityOfMoney, monetary.dynamicVelocity,
    monetary.moneyCreationShare,
    monetary.maxNeutralTransfers, monetary.actualInflationFromTransfers,
    monetary.isWithinNeutralZone ? 1 : 0,
  );

  // L2. Fiscal-Monetary System (Phase 7)
  const fm = yearOutput.fiscalMonetary;
  if (fm) {
    // Fiscal State (13)
    row.push(
      fm.fiscal.federalDebtStock, fm.fiscal.debtGDPRatio, fm.fiscal.interestExpense,
      fm.fiscal.debtServiceRevenueRatio, fm.fiscal.weightedAverageDebtRate,
      fm.fiscal.totalGovernmentRevenue, fm.fiscal.revenueGDPRatio,
      fm.fiscal.laborTaxRevenue, fm.fiscal.corporateTaxRevenue,
      fm.fiscal.primaryDeficit, fm.fiscal.totalDeficit,
      fm.fiscal.weightedAverageMaturity, fm.fiscal.effectiveRolloverRate,
    );
    // Federal Reserve State (7)
    row.push(
      fm.federalReserve.taylorPrescribedRate, fm.federalReserve.policyRate,
      fm.federalReserve.fiscalDominanceActive ? 1 : 0, fm.federalReserve.fiscalDominanceGap,
      fm.federalReserve.dominanceFactor,
      fm.federalReserve.outputGap, fm.federalReserve.fullEmploymentGDP,
    );
    // Bond Market State (13) — Phase 8 Fix 4: +3 risk sub-components
    row.push(
      fm.bondMarket.tenYearYield, fm.bondMarket.expectedAveragePolicyRate,
      fm.bondMarket.termPremium, fm.bondMarket.fiscalRiskPremium, fm.bondMarket.supplyPressurePremium,
      fm.bondMarket.mortgageRate, fm.bondMarket.corporateBorrowingRate, fm.bondMarket.foreignDemandRatio,
      fm.bondMarket.consolidationCredibility,
      fm.bondMarket.absorptionCapacity,
      fm.bondMarket.fiscalRiskTrajectoryComponent, fm.bondMarket.fiscalRiskSustainabilityComponent, fm.bondMarket.fiscalRiskLevelComponent,
    );
    // Equity Market State (6)
    row.push(
      fm.equityMarket.aggregateMarketCap, fm.equityMarket.peRatio,
      fm.equityMarket.effectivePEMultiplier, fm.equityMarket.growthMomentum,
      fm.equityMarket.equityDiscountRate, fm.equityMarket.marketReturn,
    );
    // Monetization State (10)
    row.push(
      fm.monetization.monetizationRate, fm.monetization.moneyCreated,
      fm.monetization.bondFinancedDeficit, fm.monetization.inflationFromMonetization,
      fm.monetization.yieldResponseActive ? 1 : 0, fm.monetization.yieldResponseMonetization,
      fm.monetization.lolrActive ? 1 : 0, fm.monetization.lolrMonetization,
      fm.monetization.transmissionEfficiency,
      fm.monetization.taperApplied ? 1 : 0,
    );
  } else {
    // Pad with 46 zeros if fiscal-monetary data not available
    for (let i = 0; i < 46; i++) {
      row.push(0);
    }
  }

  // L3. Fiscal Response (Phase 8a)
  row.push(
    timeline.config.fiscalPolicyPreset ?? 'balanced_reduction',
    fm?.fiscal.consolidationIntensity ?? 0,
    fm?.fiscal.discretionaryMultiplier ?? 1,
    fm?.fiscal.obligationMultiplier ?? 1,
    fm?.fiscal.revenueMultiplier ?? 1,
    fm?.fiscal.effectiveCOLAFactor ?? 1,
    macro.realGDPGrowthRate ?? macro.gdpGrowthRate,
    yearOutput.realConsumerDemandRatio ?? macro.consumerDemandRatio,
    yearOutput.realGovDemandRatio ?? macro.govDemandRatio,
    yearOutput.realBusinessDemandRatio ?? macro.businessDemandRatio,
  );

  // L4. Parameter Provenance (Phase 8b)
  const yp = timeline.parameterTimeline?.get(yearOutput.year);
  if (yp) {
    row.push(
      yp.profileName,
      yp.consolidationIntensity.effective, yp.consolidationIntensity.source,
      yp.fiscalDiscretionaryMultiplier.effective, yp.fiscalDiscretionaryMultiplier.source,
      yp.fiscalObligationMultiplier.effective, yp.fiscalObligationMultiplier.source,
      yp.fiscalRevenueMultiplier.effective, yp.fiscalRevenueMultiplier.source,
      yp.effectiveColaDampeningFactor.effective, yp.effectiveColaDampeningFactor.source,
      yp.effectiveIncomeTaxRate.effective, yp.effectiveIncomeTaxRate.source,
      yp.effectivePayrollTaxRate.effective, yp.effectivePayrollTaxRate.source,
      yp.effectiveCorporateTaxRate.effective, yp.effectiveCorporateTaxRate.source,
      yp.effectiveCapitalGainsTaxRate.effective, yp.effectiveCapitalGainsTaxRate.source,
      yp.qeMonetizationRate.effective, yp.qeMonetizationRate.source,
      yp.maxFinancialRepressionRate.effective, yp.maxFinancialRepressionRate.source,
    );
  } else {
    // Fallback: profile name + 22 zeros/empty for backward compat
    row.push(timeline.config.fiscalPolicyPreset ?? 'balanced_reduction');
    for (let i = 0; i < 22; i++) row.push(0);
  }

  // M. Per-Cluster
  for (const clusterId of CLUSTER_IDS) {
    const c = clusterMap.get(clusterId);
    if (c) {
      const baseline = c.totalRemainingEmployment + c.totalDisplacement;
      const displacementPct = baseline > 0 ? c.totalDisplacement / baseline : 0;

      // Earliest trigger year across all roles
      let earliestTrigger: number | '' = '';
      let maxAdoptionRate = 0;
      if (c.bfcsOutput) {
        for (const bo of c.bfcsOutput) {
          if (bo.triggerYear !== null) {
            if (earliestTrigger === '' || bo.triggerYear < (earliestTrigger as number)) {
              earliestTrigger = bo.triggerYear;
            }
          }
          if (bo.adoptionRate > maxAdoptionRate) {
            maxAdoptionRate = bo.adoptionRate;
          }
        }
      }

      // Effective deflation intensity: config overrides > BEA-calibrated defaults
      const effectiveIntensity = timeline.config.deflationIntensityOverrides?.[clusterId]
        ?? SECTOR_DEFLATION_INTENSITY[clusterId] ?? 0.4;

      // Weighted capability for this cluster
      const clusterDef = OCCUPATION_CLUSTER_MAP[clusterId];
      const wCap = clusterDef
        ? computeWeightedCapability(yearOutput.capabilities, clusterDef.capabilityRelevance.weights)
        : 0;

      // Effective productivity: 1.0 + (maxMult - 1.0) * weightedCapability
      const maxMult = timeline.config.clusterOverrides?.[clusterId]?.maxProductivityMultiplier
        ?? (clusterDef ? AI_PRODUCTIVITY_MULTIPLIER_BY_DEPLOYMENT[clusterDef.deploymentType] : 1.0);
      const effectiveProductivity = 1.0 + (maxMult - 1.0) * wCap;

      row.push(displacementPct, c.totalRemainingEmployment, earliestTrigger, maxAdoptionRate, effectiveIntensity, wCap, effectiveProductivity);
    } else {
      const effectiveIntensity = timeline.config.deflationIntensityOverrides?.[clusterId]
        ?? SECTOR_DEFLATION_INTENSITY[clusterId] ?? 0.4;
      const clusterDef = OCCUPATION_CLUSTER_MAP[clusterId];
      const wCap = clusterDef
        ? computeWeightedCapability(yearOutput.capabilities, clusterDef.capabilityRelevance.weights)
        : 0;
      const maxMult = timeline.config.clusterOverrides?.[clusterId]?.maxProductivityMultiplier
        ?? (clusterDef ? AI_PRODUCTIVITY_MULTIPLIER_BY_DEPLOYMENT[clusterDef.deploymentType] : 1.0);
      const effectiveProductivity = 1.0 + (maxMult - 1.0) * wCap;
      row.push(0, 0, '', 0, effectiveIntensity, wCap, effectiveProductivity);
    }
  }

  // N. Timeline Summary (constant across rows)
  row.push(
    timeline.depressionOnsetYear ?? '',
    timeline.summary.peakEmployment.year,
    timeline.summary.policyPreventsDepression ? 1 : 0,
    timeline.summary.prepWindowOpen ?? '',
    timeline.summary.prepWindowClose ?? '',
    timeline.summary.prepWindowDuration ?? '',
    timeline.summary.fiscalWindowOpen ?? '',
    timeline.summary.fiscalWindowClose ?? '',
    timeline.summary.fiscalWindowDuration ?? '',
    timeline.summary.gdpPeakYear ?? '',
    timeline.summary.gdpPeakValue,
    timeline.summary.cycleStartYear ?? '',
    timeline.summary.valleyFloorYear ?? '',
    timeline.summary.valleyDepthPct,
    timeline.summary.recoveryYear ?? '',
    timeline.monetaryCollapseYear ?? '',
  );

  return row;
}

// ============================================================
// Public API
// ============================================================

/**
 * Generate the full simulation results as a CSV string.
 * One row per year, 270 columns.
 */
export function exportSimulationResultsCSV(timeline: SimulationTimeline): string {
  const headers = buildHeaders();
  const rows: (string | number)[][] = [];

  for (let i = 0; i < timeline.years.length; i++) {
    const yearOutput = timeline.years[i]!;
    rows.push(buildRow(yearOutput, timeline));
  }

  return formatCSV(headers, rows);
}

/**
 * Trigger browser download of the full results CSV.
 */
export function downloadResultsCSV(timeline: SimulationTimeline): void {
  const csv = exportSimulationResultsCSV(timeline);
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadCSV(csv, `atlas-full-results-${timestamp}.csv`);
}

/**
 * Get the expected number of columns in the export CSV.
 * Useful for testing.
 */
export function getExpectedColumnCount(): number {
  return buildHeaders().length;
}

// ============================================================
// CSV Formatting (mirrors src/utils/export.ts formatCSV)
// ============================================================

function formatCSV(headers: string[], rows: (string | number | boolean)[][]): string {
  const escape = (val: string | number | boolean): string => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ];

  return lines.join('\n');
}
