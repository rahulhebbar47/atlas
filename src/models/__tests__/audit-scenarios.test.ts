/**
 * AUDIT SCENARIO HARNESS — Feedback-loop root-cause audit (diagnostic, additive-only).
 *
 * Runs Scenarios A–D headlessly, extracts a curated per-year channel trace, and runs
 * EXTERNAL analyzers (binding-constraint logger + channel-attribution identity checks)
 * that recompute from surfaced outputs ONLY — zero model changes, golden-master safe.
 *
 * Run: npx vitest run src/models/__tests__/audit-scenarios.test.ts
 * Outputs: /tmp/atlas-audit/<scenario>.{trace.json,binding.json,identity.json}
 */
import { describe, it } from 'vitest';
import { writeFileSync, mkdirSync } from 'fs';
import type { SimulationConfig, SimulationTimeline, CapabilityVectorId } from '@/types';
import { runSimulation, getDefaultSimulationConfig } from '@/models/simulation';
import { assertKnownConfigKeys } from '@/utils/validateConfig';
import { OCCUPATION_CLUSTERS } from '@/data/occupationClusters';
import { loadBLSData } from '@/services/dataLoader';
import { transformOEWSToBaselines, createOtherClusterBaseline } from '@/services/dataTransform';
import { DEFAULT_ROLE_ESTIMATION_CONFIG } from '@/data/roleEstimation';
import {
  PHILLIPS_CURVE_SENSITIVITY, FRED_NAIRU_RATE, REVENUE_PRESSURE_CAP,
  DEFAULT_MAX_CONSUMER_TIGHTENING, DEFERRABLE_CONSUMPTION_SHARE,
  VELOCITY_FLOOR_RATIO, MAX_PRICE_LEVEL, MAX_REALIZATION_RATE, MIN_REALIZATION_RATE,
} from '@/models/constants';

const OUT = '/tmp/atlas-audit';
mkdirSync(OUT, { recursive: true });

function loadBaselines() {
  const bls = loadBLSData();
  if (!bls.isLoaded) throw new Error(bls.errorMessage);
  const { baselines } = transformOEWSToBaselines(bls.oews, OCCUPATION_CLUSTERS, DEFAULT_ROLE_ESTIMATION_CONFIG);
  const other = OCCUPATION_CLUSTERS.find((c) => c.id === 'other_uncategorized');
  if (other && !baselines.has('other_uncategorized')) {
    baselines.set('other_uncategorized', createOtherClusterBaseline(baselines, other));
  }
  return baselines;
}

const flatCap = (floor: number) => ({ floor, ceiling: floor, steepness: 1.0, midpointYear: 2035 });

function buildScenario(name: 'A' | 'B' | 'C' | 'D'): SimulationConfig {
  const cfg = getDefaultSimulationConfig();
  if (name === 'A') {
    // Zero-AI sanity baseline: capability identically 0 → no displacement AND no embodied/cognitive
    // deflation term anywhere (true zero-AI; required for the Stage 1.5 bit-identical price path).
    cfg.capabilities = {
      generative: flatCap(0), agentic: flatCap(0), embodied: flatCap(0),
    } as Record<CapabilityVectorId, typeof cfg.capabilities.generative>;
  } else if (name === 'B') {
    // Moderate: capped ceilings to reach ~12-15% UE by 2035 then plateau.
    cfg.capabilities = {
      generative: { floor: 0.10, ceiling: 0.80, steepness: 0.9, midpointYear: 2030 },
      agentic: { floor: 0.05, ceiling: 0.68, steepness: 0.7, midpointYear: 2032 },
      embodied: { floor: 0.02, ceiling: 0.45, steepness: 0.3, midpointYear: 2036 },
    };
  } else if (name === 'D') {
    // Severe (=C default) + strong policy response: $1000/mo UBI + 70% enhanced UI.
    cfg.policyConfig = {
      ...cfg.policyConfig,
      ubi: {
        ...cfg.policyConfig.ubi,
        enabled: true,
        monthlyAmount: { keyframes: [{ year: 2025, value: 1000 }] },
      },
      enhancedUI: {
        ...cfg.policyConfig.enhancedUI,
        enabled: true,
        replacementRate: { keyframes: [{ year: 2025, value: 0.70 }] },
      },
    };
  }
  // C = default unchanged.
  return cfg;
}

// ── Curated per-year trace extraction (from surfaced outputs only) ───────────
function num(x: unknown): number { return typeof x === 'number' && isFinite(x) ? x : NaN; }

function extractTrace(tl: SimulationTimeline) {
  return tl.years.map((y) => {
    const m = y.macro as unknown as Record<string, number>;
    const fm = y.fiscalMonetary;
    const mon = y.monetary as unknown as Record<string, number> | undefined;
    const pl = num(m.priceLevel);
    const real = (v: number) => (pl > 0 ? v / pl : NaN);
    return {
      year: y.year,
      // labor
      ueRate: num(m.unemploymentRate),
      employment: num(m.totalEmployment),
      unemployment: num(m.totalUnemployment),
      aiDisplacementUnemployment: num(m.aiDisplacementUnemployment),
      automationCoverage: num(m.automationCoverage),
      // prices
      priceLevel: pl,
      compositeInflation: num(m.compositeInflation),
      pceProxyInflation: num(m.pceProxyInflation),
      goodsInflation: num(m.goodsInflation),
      shelterInflation: num(m.shelterInflation),
      netInflation: num(m.netInflation),
      aiDeflationRate: num(m.aiDeflationRate),
      aiExposedInflation: num(m.aiExposedInflation),
      laborServicesInflation: num(m.laborServicesInflation),
      foodEnergyInflation: num(m.foodEnergyInflation),
      nonAICompositeInflation: num(m.nonAICompositeInflation),
      nonAIPriceLevel: num(m.nonAIPriceLevel),
      // GDP (nominal + real)
      gdpNominal: num(m.gdpNominal),
      gdpReal: num(m.gdpReal),
      gdpGrowthRate: num(m.gdpGrowthRate),
      realGDPGrowthRate: num(m.realGDPGrowthRate),
      revenuePressure: num(m.revenuePressure),
      automationAcceleration: num(m.automationAcceleration),
      nonAIRealGDPGrowthRate: num(m.nonAIRealGDPGrowthRate),
      // expenditure (nominal)
      consumption: num(m.consumption),
      investment: num(m.investment),
      governmentSpending: num(m.governmentSpending),
      // real expenditure
      realConsumption: real(num(m.consumption)),
      realInvestment: real(num(m.investment)),
      realGov: real(num(m.governmentSpending)),
      // consumption components (pre credit/velocity multipliers)
      wageConsumption: num(m.wageConsumption),
      assetConsumption: num(m.assetConsumption),
      transferConsumption: num(m.transferConsumption),
      effectiveMpcWage: num(m.effectiveMpcWage),
      // income channels
      aggregateWageIncome: num(m.aggregateWageIncome),
      aggregateAssetIncome: num(m.aggregateAssetIncome),
      aggregateTransferIncome: num(m.aggregateTransferIncome),
      baselineTransferIncome: num(m.baselineTransferIncome),
      afterTaxWageIncome: num(m.afterTaxWageIncome),
      afterTaxAssetIncome: num(m.afterTaxAssetIncome),
      afterTaxTransferIncome: num(m.afterTaxTransferIncome),
      totalPostTaxIncome: num(m.totalPostTaxIncome),
      // asset decomposition
      dividendIncome: num(m.dividendIncome),
      aiCapitalGains: num(m.aiCapitalGains),
      traditionalCapitalGains: num(m.traditionalCapitalGains),
      nonCorporateAssetIncome: num(m.nonCorporateAssetIncome),
      capitalGainsRealizationRate: num(m.capitalGainsRealizationRate),
      // profits + investment capacity
      corporateProfits: num(m.corporateProfits),
      aiCorporateProfits: num(m.aiCorporateProfits),
      traditionalCorporateProfits: num(m.traditionalCorporateProfits),
      profitGDPRatio: num(m.profitGDPRatio),
      retainedEarnings: num(m.retainedEarnings),
      investmentCapacity: num(m.investmentCapacity),
      capacityGate: num(m.capacityGate),
      // wage pressure / Stage 3 endogenous wage path
      wagePressure: num(m.wagePressure),
      nominalWageGrowth: num(m.nominalWageGrowth),
      wageIndex: num(m.wageIndex),
      trendWageIndex: num(m.trendWageIndex),
      realWagePerWorker: (num(m.wageIndex) / (num(m.priceLevel) || 1)),
      // credit
      consumerCreditMultiplier: num(m.consumerCreditMultiplier),
      consumerCreditTightening: num(m.consumerCreditTightening),
      incomeAdequacyRatio: num(m.incomeAdequacyRatio),
      businessCreditMultiplier: num(m.businessCreditMultiplier),
      profitCoverageRatio: num(m.profitCoverageRatio),
      // deflation drag (consumption velocity)
      deflationVelocityMultiplier: num(m.velocityMultiplier),
      deflationDragPct: num(m.deflationDragPct),
      housingWealthDrag: num(m.housingWealthDrag),
      // demand spillover
      consumerDemandRatio: num(m.consumerDemandRatio),
      govDemandRatio: num(m.govDemandRatio),
      businessDemandRatio: num(m.businessDemandRatio),
      aggregateDemandSurvival: num(m.aggregateDemandSurvival),
      totalDemandSpilloverLoss: num(m.totalDemandSpilloverLoss),
      // welfare
      cwi: num(m.consumerWelfareIndex),
      medianCWI: num(m.medianCWI),
      cyclePhase: (y.macro as unknown as Record<string, unknown>).cyclePhase as string,
      // fiscal-monetary
      totalDeficit: num(fm?.fiscal.totalDeficit),
      debtGDPRatio: num(fm?.fiscal.debtGDPRatio),
      debtServiceRevenueRatio: num(fm?.fiscal.debtServiceRevenueRatio),
      interestExpense: num(fm?.fiscal.interestExpense),
      totalGovernmentRevenue: num(fm?.fiscal.bookedRevenueT1),
      policyRate: num(fm?.federalReserve.policyRate),
      taylorPrescribedRate: num(fm?.federalReserve.taylorPrescribedRate),
      fiscalDominanceActive: fm?.federalReserve.fiscalDominanceActive ?? false,
      tenYearYield: num(fm?.bondMarket.tenYearYield),
      fiscalRiskPremium: num(fm?.bondMarket.fiscalRiskPremium),
      monetizationRate: num(fm?.monetization.monetizationRate),
      moneyCreated: num(fm?.monetization.moneyCreated),
      inflationFromMonetization: num(fm?.monetization.inflationFromMonetization),
      monetaryInflation: num(m.monetaryInflation),
      monetizationVelocity: num(fm?.monetization.velocity),
      // Stage 5 (H3): unified transfer flows — income side (t) and budget side (booked at t+1)
      incrementalCashTransfers: num(m.incrementalCashTransfers),
      inKindConsumption: num(m.inKindConsumption),
      incrementalTransferSpending: num(m.incrementalTransferSpending),
      stabilizerTransfers: num(fm?.fiscal.stabilizerTransfers),
      laborServicesPriceLevel: num(m.laborServicesPriceLevel),
      unclippedConsumerTightening: num(m.unclippedConsumerTightening),
      // Stage 6.5: housing fields for all scenarios
      homePriceIndex: num(m.homePriceIndex),
      homePriceChangeRate: num(m.homePriceChangeRate),
      affordabilityDeviation: num(m.affordabilityDeviation),
      avgHomeownership: num(m.avgHomeownership),
      foreclosureRateAggregate: num(m.foreclosureRateAggregate),
      housingStock: num(m.housingStock),
      households: num(m.households),
      headshipRate: num(m.headshipRate),
      rentIndex: num(m.rentIndex),
      constructionCostIndex: num(m.constructionCostIndex),
      landCostIndex: num(m.landCostIndex),
      occupancyRate: num(m.occupancyRate),
      housingStarts: num(m.housingStarts),
      obligationGCOLAIndex: num(m.obligationGCOLAIndex),
      shelterDeflationFromAI: num(m.shelterDeflationFromAI),
      transmissionEfficiency: num(fm?.monetization.transmissionEfficiency),
      lolrActive: fm?.monetization.lolrActive ?? false,
      yieldResponseActive: fm?.monetization.yieldResponseActive ?? false,
      taperApplied: fm?.monetization.taperApplied ?? false,
      velocityOfMoney: num(mon?.velocityOfMoney),
      dynamicVelocity: num(mon?.dynamicVelocity),
      moneySupply: num(mon?.moneySupply),
      // deficit as % GDP
      deficitPctGDP: num(fm?.fiscal.totalDeficit) / num(m.gdpNominal),
    };
  });
}

type Row = ReturnType<typeof extractTrace>[number];

// ── External binding-constraint logger (recompute raw vs clipped) ────────────
function bindingConstraints(rows: Row[]) {
  const EPS = 1e-6;
  return rows.map((r) => {
    const flags: Record<string, boolean> = {};
    // Revenue-pressure cap (0.30)
    flags['REVENUE_PRESSURE_CAP'] = r.revenuePressure >= REVENUE_PRESSURE_CAP - EPS
      || r.automationAcceleration >= REVENUE_PRESSURE_CAP - EPS;
    // Consumer-credit max tightening (0.50)
    flags['MAX_CONSUMER_TIGHTENING'] = r.consumerCreditTightening >= DEFAULT_MAX_CONSUMER_TIGHTENING - EPS;
    // Deflation-drag floor (velocityMult == 1 - 0.30 = 0.70)
    flags['DEFLATION_DRAG_FLOOR_0.70'] = r.deflationVelocityMultiplier <= (1 - DEFERRABLE_CONSUMPTION_SHARE) + EPS
      && r.deflationDragPct >= DEFERRABLE_CONSUMPTION_SHARE - 1e-3;
    // Monetization velocity floor (dynamicVelocity/velocityOfMoney == 0.5)
    flags['VELOCITY_FLOOR_0.5'] = isFinite(r.dynamicVelocity) && isFinite(r.velocityOfMoney)
      && r.velocityOfMoney > 0 && r.dynamicVelocity / r.velocityOfMoney <= VELOCITY_FLOOR_RATIO + 1e-4;
    // Profit accounting-identity cap: corporateProfits == gdpNominal - wageBill
    {
      // Stage 7: the profit accounting cap is DELETED (residual identity). The diagnostic flag now
      // marks years where the SIGNED residual goes negative (total or traditional) — reported, never clamped.
      flags['NEGATIVE_TOTAL_PROFITS'] = r.corporateProfits < 0;
      flags['NEGATIVE_TRADITIONAL_PROFITS'] = (r.traditionalCorporateProfits ?? 0) < 0;
    }
    // incomeAdequacyRatio cap (2.0) / profitCoverageRatio cap (2.0)
    flags['INCOME_ADEQUACY_CAP_2.0'] = r.incomeAdequacyRatio >= 2.0 - EPS;
    flags['PROFIT_COVERAGE_CAP_2.0'] = r.profitCoverageRatio >= 2.0 - EPS;
    // Realization-rate clamp [0.04, 0.12]
    flags['REALIZATION_RATE_CLAMP'] = r.capitalGainsRealizationRate >= MAX_REALIZATION_RATE - EPS
      || r.capitalGainsRealizationRate <= MIN_REALIZATION_RATE + EPS;
    // Capacity gate active (<1)
    flags['CAPACITY_GATE_ACTIVE'] = isFinite(r.capacityGate) && r.capacityGate < 1 - 1e-4;
    // Price-level safety cap
    flags['MAX_PRICE_LEVEL'] = r.priceLevel >= MAX_PRICE_LEVEL * 0.5;
    // Demand spillover firing (survival<1)
    flags['DEMAND_SPILLOVER_FIRING'] = r.aggregateDemandSurvival < 1 - 1e-4;
    // Monetization firing
    flags['MONETIZATION_FIRING'] = r.monetizationRate > 1e-6;
    return { year: r.year, ueRate: r.ueRate, ...flags };
  });
}

// ── Channel-attribution identity checks ──────────────────────────────────────
function identityChecks(rows: Row[]) {
  return rows.map((r, idx) => {
    // Consumption identity: C ≈ (wageC+assetC+transferC)·creditMult·deflVelMult + housingDrag
    //                           + inKindConsumption (Stage 5: in-kind enters C directly, post-multipliers)
    const baseC = r.wageConsumption + r.assetConsumption + r.transferConsumption;
    const reconC = baseC * r.consumerCreditMultiplier * r.deflationVelocityMultiplier
      + r.housingWealthDrag
      + r.inKindConsumption;
    const cResid = r.consumption - reconC;
    // Stage 5 Gate C (extended): budget books LAST year's income-side flow exactly (fiscal block's
    // uniform t−1 convention, same as revenue). Residual must be identically 0.
    const prevRow = idx > 0 ? rows[idx - 1] : undefined;
    const transferBudgetResidual = prevRow
      ? r.stabilizerTransfers - prevRow.incrementalTransferSpending
      : r.stabilizerTransfers;  // year 0: baseline fiscal state books 0
    // GDP identity: NX = gdp - C - I - G (residual = implied net exports; report it)
    const impliedNX = r.gdpNominal - r.consumption - r.investment - r.governmentSpending;
    // Income identity: totalPostTax ≈ afterTaxWage+asset+transfer
    const reconInc = r.afterTaxWageIncome + r.afterTaxAssetIncome + r.afterTaxTransferIncome;
    const incResid = r.totalPostTaxIncome - reconInc;
    return {
      year: r.year,
      consumptionResidual: cResid,
      consumptionResidualPct: r.consumption ? cResid / r.consumption : 0,
      impliedNetExports: impliedNX,
      impliedNetExportsPctGDP: r.gdpNominal ? impliedNX / r.gdpNominal : 0,
      incomeResidual: incResid,
      incomeResidualPct: r.totalPostTaxIncome ? incResid / r.totalPostTaxIncome : 0,
      transferBudgetResidual,
    };
  });
}

const baselines = loadBaselines();

describe('audit scenarios A–D', () => {
  // Stage 6.5 (owner demonstration, REQUIRED): C_INV = Scenario C with the investor/store-of-value
  // dial at 0.40 (vs default 0.10) — the land-thesis sensitivity pair (OD-9b).
  for (const name of ['A', 'B', 'C', 'D', 'C_INV'] as const) {
    it(`scenario ${name}`, () => {
      const cfg = buildScenario(name === 'C_INV' ? 'C' : name);
      if (name === 'C_INV') cfg.investorDemandIntensity = 0.40;
      assertKnownConfigKeys(cfg, 'harness');
    const tl = runSimulation(cfg, OCCUPATION_CLUSTERS, baselines);
      const trace = extractTrace(tl);
      const binding = bindingConstraints(trace);
      const identity = identityChecks(trace);

      writeFileSync(`${OUT}/${name}.trace.json`, JSON.stringify(trace, null, 1));
      writeFileSync(`${OUT}/${name}.binding.json`, JSON.stringify(binding, null, 1));
      writeFileSync(`${OUT}/${name}.identity.json`, JSON.stringify(identity, null, 1));

      // R15 — Stage 6.5 evidence capture: per-year Scenario C shelter-model internal drivers.
      // Evidence only; the design session needs to see WHAT props housing demand at 44% UE.
      if (name === 'C') {
        const shelter = tl.years.map((y) => {
          const m = y.macro as unknown as Record<string, number>;
          const pl = num(m.priceLevel);
          return {
            year: y.year,
            ueRate: num(m.unemploymentRate),
            shelterInflation: num(m.shelterInflation),
            homePriceChangeRate: num(m.homePriceChangeRate),
            homePriceIndex: num(m.homePriceIndex),
            mortgageRateChange: num(m.mortgageRateChange),
            mortgageRate: num(y.fiscalMonetary?.bondMarket.mortgageRate),
            realIncomeGrowthRate: num(m.realIncomeGrowthRate),       // feeds home-price channel 2
            affordabilityDeviation: num(m.affordabilityDeviation),   // channel 5 (reversion)
            foreclosureRateAggregate: num(m.foreclosureRateAggregate),
            avgHomeownership: num(m.avgHomeownership),
            housingWealthDrag: num(m.housingWealthDrag),
            // income/wealth that may be propping housing demand (pre-Stage-3/7):
            afterTaxWageIncome: num(m.afterTaxWageIncome),
            afterTaxAssetIncome: num(m.afterTaxAssetIncome),
            afterTaxTransferIncome: num(m.afterTaxTransferIncome),
            realHouseholdIncome: (num(m.afterTaxWageIncome) + num(m.afterTaxAssetIncome) + num(m.afterTaxTransferIncome)) / (pl || 1),
          };
        });
        writeFileSync(`${OUT}/C.shelter-drivers.json`, JSON.stringify(shelter, null, 1));
      }

      // Console summary
      const last = trace[trace.length - 1];
      if (!last) throw new Error('empty trace');
      console.log(`\n===== SCENARIO ${name} =====`);
      console.log(`final ${last.year}: UE=${(last.ueRate * 100).toFixed(1)}% priceLevel=${last.priceLevel.toFixed(3)} gdpNom=$${(last.gdpNominal / 1e12).toFixed(1)}T gdpReal=$${(last.gdpReal / 1e12).toFixed(1)}T CWI=${last.cwi.toFixed(0)}`);
      // max identity residuals
      const maxCResid = Math.max(...identity.map((i) => Math.abs(i.consumptionResidualPct)));
      const maxIncResid = Math.max(...identity.map((i) => Math.abs(i.incomeResidualPct)));
      console.log(`max |consumptionResidual%|=${(maxCResid * 100).toExponential(2)}  max |incomeResidual%|=${(maxIncResid * 100).toExponential(2)}`);
      // binding constraint years
      const keys = Object.keys(binding[0] ?? {}).filter((k) => k !== 'year' && k !== 'ueRate');
      for (const k of keys) {
        const yrs = binding.filter((b) => (b as Record<string, unknown>)[k] === true).map((b) => b.year);
        if (yrs.length) console.log(`  BIND ${k}: ${yrs[0]}–${yrs[yrs.length - 1]} (${yrs.length}y)`);
      }
      // milestone rows
      const milestones = trace.filter((r) => [2025, 2035, 2040, 2045, 2050].includes(r.year));
      for (const r of milestones) {
        console.log(`  ${r.year} UE=${(r.ueRate * 100).toFixed(1)}% | wagePress=${r.wagePressure.toFixed(3)} | credMult=${r.consumerCreditMultiplier.toFixed(3)} | demSurv=${r.aggregateDemandSurvival.toFixed(3)} | monetRate=${r.monetizationRate.toFixed(3)} | deficit%GDP=${(r.deficitPctGDP * 100).toFixed(1)} | debtGDP=${r.debtGDPRatio.toFixed(2)} | 10Y=${(r.tenYearYield * 100).toFixed(1)}%`);
      }
    });
  }
});
