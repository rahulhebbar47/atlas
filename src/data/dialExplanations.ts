/**
 * DIAL EXPLANATIONS — the plain-English layer (R3b, tranche 1).
 *
 * Authored under the documentation writing standard: plain English for a smart reader
 * expert in exactly one of {engineering, economics, policy}; no symbols, no code
 * identifiers, no filler; the accuracy guard governs (a gloss never replaces the
 * precise specification — that lives in USER_PARAMETERS/DATA_MODEL; this layer says
 * what the dial does and why it exists). HONEST-STOP: this file carries what has been
 * authored AT GRADE; coverage is counted in the R3b report; unauthored keys render
 * without an explanation rather than with generated filler.
 */

export const DIAL_EXPLANATIONS: Record<string, string> = {
  // ── The displaced-worker pool (A5) ──
  exitBase: 'The yearly chance that a displaced worker stops searching for work entirely, before counting how long they have been out. Exists because joblessness is not a waiting room: some people leave the labor force, and a model that ignores them understates the damage.',
  exitDurationSlope: 'How much faster people give up searching for each additional year out of work. Long spells push people out at rising rates; this dial sets how steeply.',
  atrophyRate: 'How quickly a displaced worker’s employability fades with each year out of work. Employers call back long-unemployed applicants less; this dial sets how fast that door closes.',
  wageScarringRate: 'The pay cut a displaced worker absorbs when rehired, for each year spent out of work (capped at a quarter of the old wage). Re-entry rarely happens at the old salary; this dial sets how deep the scar runs.',

  // ── The reverse gear (A3) ──
  deAdoptionRateCognitive: 'How fast firms can unwind software-class automation when it stops making economic sense. Layoffs of machines are faster than hiring them; this is the unwind speed for cognitive AI.',
  deAdoptionRateEmbodied: 'How fast firms can unwind robot- and vehicle-class automation. Physical capital unwinds slower than software because the hardware is sunk cost.',
  reAdoptionRate: 'After a retreat, how quickly firms re-engage automation once conditions favor it again, as a fraction of the retreat speed. Re-engagement is slower than retreat: trust must rebuild and integration must restart.',

  // ── The frontier cost layer (A2) ──
  'aiCostParams.frontierIntensityLevel': 'How many times more computation the hardest AI work of the moment takes compared to routine work, at the 2026 anchor. New capabilities arrive expensive; this sets how expensive.',
  'aiCostParams.frontierIntensityGrowth': 'How fast the computation premium on frontier work grows each year. The work keeps moving to the frontier; the total cost of frontier AI falls only when per-unit prices fall faster than this premium grows.',
  'aiCostParams.sigmaMigration': 'How quickly a task migrates from expensive frontier pricing to cheap commodity pricing once AI comfortably exceeds the task’s requirement. Small values mean fast migration.',
  'aiCostParams.wMinFrontierFloor': 'The share of work that never leaves frontier pricing no matter how capable AI becomes. Zero means everything eventually gets cheap; higher values keep a permanent expensive core.',
  'aiCostParams.tokenCostCurve.floor': 'The lowest the per-unit price of AI computation can ever fall, as a fraction of its starting price. Sets the bottom of the cost decline.',
  'aiCostParams.tokenCostCurve.k': 'How fast the per-unit price of AI computation falls in the early years. Higher means a steeper early collapse.',
  'aiCostParams.tokenCostCurve.decayExponent': 'How stubbornly the price decline slows over time. Lower values stretch the decline out over decades rather than years.',
  'aiCostParams.manufacturingAnnualChange': 'The yearly change in the cost of building physical automation (robots, vehicles). Negative means costs fall.',
  'aiCostParams.energyAnnualChange': 'The yearly change in the energy cost of running AI systems. Energy falls slower than computation.',

  // ── Capabilities (A1) ──
  'capabilities.generative.midpointYear': 'The year language-and-code AI reaches the halfway point of its eventual ability. Earlier means the wave arrives sooner.',
  'capabilities.generative.ceiling': 'How capable language-and-code AI eventually becomes, on a zero-to-one scale where one is full human-level breadth on these tasks.',
  'capabilities.agentic.midpointYear': 'The year multi-step, decision-making AI reaches the halfway point of its eventual ability.',
  'capabilities.agentic.ceiling': 'How capable autonomous multi-step AI eventually becomes.',
  'capabilities.embodied.midpointYear': 'The year physical-world AI (robots, vehicles) reaches the halfway point of its eventual ability. Historically the slowest of the three.',
  'capabilities.embodied.ceiling': 'How capable physical-world AI eventually becomes.',
  'capabilities.generative.steepness': 'How suddenly language-and-code ability improves around its midpoint year. Higher means more of the change lands in fewer years.',
  'capabilities.agentic.steepness': 'How suddenly autonomous multi-step ability improves around its midpoint year.',
  'capabilities.embodied.steepness': 'How suddenly physical-world ability improves around its midpoint year.',
  'capabilities.generative.floor': 'Where language-and-code ability stands today, on the zero-to-one scale.',
  'capabilities.agentic.floor': 'Where autonomous multi-step ability stands today.',
  'capabilities.embodied.floor': 'Where physical-world ability stands today.',

  // ── Diffusion (A3) ──
  'adoptionParams.competitivePressureMultiplier': 'How strongly firms accelerate their own automation when competitors automate first. The keeping-up force.',
  competitivePressureThreshold: 'The share of an industry that must automate before laggards feel forced to follow.',
  revenuePressureSensitivity: 'How strongly falling revenues push firms toward automation as a cost defense. Downturns speed the machines up.',
  revenuePressureCap: 'The most extra automation speed that revenue pressure and cheap credit together can add. A cap on panic.',
  revenuePressureDecay: 'How quickly the automation urgency from a bad revenue year fades once conditions improve.',
  creditAdoptionSensitivity: 'How much easier automation investment becomes when business credit is loose. Shares its ceiling with revenue pressure.',
  wageAutomationSensitivity: 'How strongly a minimum wage that overshoots an industry’s pay level accelerates automation there. Only acts when a wage floor actually binds.',
  'adoptionParams.geopoliticalRiskFactor': 'The standing level of global-tension drag on automation that depends on exposed supply chains. Events can raise it temporarily.',
  'supplyChainConfig.hysteresisMaxCognitive': 'The widest the stay-put band can grow for software automation: how much conditions must deteriorate before firms that automated retreat. Wider bands mean stickier automation.',
  'supplyChainConfig.hysteresisMaxEmbodied': 'The widest the stay-put band can grow for physical automation. Sunk hardware makes this band wider than software’s.',

  // ── Replace-vs-augment (A4) ──
  augmentationMultiplier: 'How much more productive a worker becomes when AI assists rather than replaces them. The upside of the augmentation path.',
  augmentationAdoptionSteepness: 'How quickly assisted-work practices spread once they become viable.',
  // DEPRECATED (an earlier build step): the dial retired with the ledger re-anchor (see dialTable).
  // replacementMultiplier: 'How much output one automated position produces compared to the worker it replaced. The economics of choosing replacement.',
  'alphaDriverParams.capabilityWeight': 'How much raw AI capability pushes firms toward replacing rather than assisting workers.',
  'alphaDriverParams.trustWeight': 'How much accumulated trust in AI (time since it proved itself in a role) pushes toward replacement.',
  'alphaDriverParams.trustHalfLifeYears': 'How many years it takes for half of the eventual trust in AI to accumulate after it proves itself. Longer means slower replacement.',
  'alphaDriverParams.competitiveWeight': 'How much competitors’ automation choices push a firm toward replacement rather than assistance.',
  'alphaDriverParams.marginWeight': 'How much shrinking profit margins push firms toward replacement as a cost cut.',
  'alphaDriverParams.slackWeight': 'How much a loose labor market (cheap, available workers) holds automation back. The one force in this set that slows replacement.',
  'alphaDriverParams.capabilityActivationThreshold': 'The capability level below which raw ability contributes nothing to the replacement decision.',

  // ── New work (A6) ──
  innovationRate: 'How much new kinds of work the economy invents per dollar of output. The engine that replaced farm jobs with office jobs, dialed up or down.',
  rdMultiplier: 'How strongly research investment amplifies new-work creation.',
  jobPersistenceFactor: 'How vulnerable newly created jobs are to being automated themselves. Above one, new work dies faster than old work.',
  newJobWageFraction: 'What newly created jobs pay compared to the average existing job. One means full parity.',

  // ── Household and firm demand (A7) ──
  'postTaxMPCs.wage': 'How much of each after-tax wage dollar households spend rather than save.',
  'postTaxMPCs.asset': 'How much of each after-tax investment-income dollar gets spent. Wealthier income spends less.',
  'postTaxMPCs.transfer': 'How much of each after-tax benefit dollar gets spent. Support payments are spent almost entirely.',
  mpcWageUESensitivity: 'How much employed households cut spending as unemployment rises around them. The fear-of-being-next effect.',
  demandFeedbackSensitivity: 'How strongly weak sales feed back into weaker business activity. The demand spiral’s gain.',
  deferrableConsumptionShare: 'The share of household spending that can wait (durables, upgrades) when prices are falling or times are uncertain.',
  deflationMidpoint: 'The pace of falling prices at which half of deferrable purchases get postponed. The wait-for-cheaper tipping point.',
  deflationSteepness: 'How suddenly postponement kicks in around that tipping point.',
  velocitySensitivity: 'How much money changes hands more slowly as joblessness rises. Precautionary hoarding, in one number.',
  aiDeflationPassthrough: 'How much of AI’s cost savings reach consumer prices rather than staying in producer margins. The is-the-cheapness-real dial.',

  // ── Washington and the Fed (A13/A14) ──
  fiscalPolicyPreset: 'Which forecast of Congress’s behavior under fiscal stress the model runs: when it recognizes trouble, what it cuts, what it raises, what it refuses to touch. A prediction about an institution, not a policy you choose.',
  federalReservePreset: 'Which forecast of the Federal Reserve’s behavior the model runs: how hard it leans against inflation versus unemployment, and how far it goes when debt pressure mounts.',
  taylorSmoothing: 'How gradually the Fed moves its policy rate toward where its own rule says the rate should be. Central banks step, they don’t jump.',
  inflationTarget: 'The inflation rate the Fed treats as success. The anchor the whole rate-setting machinery steers toward.',
  fiscalCredibilityTrigger: 'The debt-service burden at which markets start believing consolidation promises. Only matters in worlds where Washington announces market-facing adjustment.',
  fiscalAdjustmentHorizonYears: 'How many years of consistent behavior it takes for a fiscal adjustment promise to become fully credible.',

  // ── The buildout (A11/A12) ──
  aiProductionInvestmentFraction: 'The share of AI-driven profits that gets reinvested into building more AI capacity rather than flowing to consumption. How big the buildout gets.',
  aiProductionOnshoringFraction: 'The share of the AI buildout that happens domestically. Higher means more domestic jobs from the buildout and less exposure to foreign supply shocks.',

  // ── Sovereign debt (A10, headline) ──
  laubachLevelBeta: 'How many basis points the ten-year borrowing rate rises for each percentage point of debt-to-GDP above today’s level. The market’s patience with the accumulated stock of debt.',
  laubachDeficitBeta: 'How much the borrowing rate rises for each point of ongoing primary deficit. The market’s patience with the ongoing flow.',
  termPremium: 'The extra yield investors demand for holding ten-year debt instead of rolling short-term bills, independent of expected rates.',
  neutralRealRate: 'The inflation-adjusted interest rate that neither stimulates nor restrains the economy. Nobody chooses it; the Fed estimates it.',
  credibilityHorizonYears: 'How many years of delivered inflation it takes for markets to fully update their long-run inflation expectations.',
  monetizationDominanceThreshold: 'The share of federal revenue eaten by interest payments at which money-printing becomes the path of least resistance.',
  effectiveLowerBound: 'The policy rate below which cutting further stops helping, because cash hoarding defeats the cut. A structural floor, not a choice.',

  // ── Credit amplification (A8, headline) ──
  incomeAdequacySensitivity: 'How sharply banks tighten consumer lending when household incomes fall short of the standard of living lenders expect.',
  collateralSensitivity: 'How sharply falling home prices tighten lending against homes. The 2008 channel.',
  maxConsumerTightening: 'The most consumer credit can contract, as a fraction of normal lending. The floor under the credit crunch.',
  creditDeflationImpulseSensitivity: 'How much prices fall when credit newly tightens beyond ordinary conditions. Only changes in crisis-scale tightening move prices; a standing credit stance, once priced in, stays priced in. Derived from the 2008 episode: the whole crisis produced about two points of deflation.',
  creditDeflationPersistence: 'How long a credit-tightening price shock keeps echoing. At one half, each year carries half the prior impulse forward — the 2008 pattern faded in about two years. Zero makes every impulse a single-year event.',
  creditDeflationNoiseFloor: 'The line between ordinary credit wiggle and a crisis. Below it, a small standing drag on prices applies; above it, only fresh tightening moves prices. Set from measurement: calm economies never cross it, crises exceed it fourfold. The same line gates the stock market\'s crisis risk premium — one measure of credit stress, one threshold.',
  aiBuildoutSeamAnchor: 'The measured 2025 United States AI buildout spending the model anchors to: data-center construction plus computing equipment above its pre-boom trend. The range spans the measurement bracket.',
  aiRetentionShare: 'The share of AI-builder profits retained to finance the compute buildout rather than paid out. National accounts put recent corporate retention near thirty percent.',
  buildoutAllocSmoothing: 'How quickly buildout spending shifts toward the scarcest input (chips, power, data centers, or fleets). Low values spread the adjustment over years; the maximum chases the bottleneck immediately.',
  unitsPerEmbodiedWorker: 'How many robots or autonomous vehicles it takes to do one fully automated physical worker\'s job. Around one, with honest uncertainty on both sides.',
  absorptionElasticityAiExposed: 'How strongly households buy more AI-exposed goods and services when AI makes them cheaper.',
  absorptionElasticityLaborServices: 'How strongly demand for healthcare and other labor-heavy services responds when automation lowers their prices.',
  absorptionElasticityFoodEnergy: 'How strongly food and energy purchases respond to price declines from automation.',
  equityIssuanceRate: 'How much new stock AI firms can sell each year against their market value to fund the buildout. Markets shut this window in a crisis.',
  aiRdIntensity: 'How much of AI revenue is reinvested in research and development, as in the software industry\'s historical range.',
  rdTfpElasticity: 'How strongly a growing research stock lowers prices across the economy. The central estimate from the returns-to-research literature.',
  buildoutChipsCostTrend: 'How fast chip cost per unit of computing capacity changes each year. The default continues the measured price-performance decline.',
  buildoutEnergyCostTrend: 'How the energy leg\'s unit cost moves each year. The default holds flat: renewables cheapen while gas holds or rises.',
  buildoutDcCostTrend: 'How datacenter construction cost per unit capacity moves each year. The cost level is well documented; no learning rate is.',
  buildoutFleetCostTrend: 'How the cost of an embodied unit (a robot or vehicle retrofit) moves each year.',
  buildoutFleetRampGrowth: 'How fast fleet manufacturing capacity grows in years when production runs at its ceiling. Anchored to automotive plant-ramp episodes.',
  energyQueueLeadYears: 'How many years pass between ordering grid power for AI datacenters and receiving it. The default is the measured interconnection queue: about four years.',
  energyQueueCeilingGrowth: 'How fast the grid\'s annual additions capacity grows in years when it is saturated with orders. A queue, not a fence: heavy demand expands the industrial base.',
  energyBtmShare: 'What share of new AI power is built on-site behind the meter — bypassing the grid queue at a cost premium, the way observed turbine deployments do.',
  fleetAllocSmoothing: 'How quickly the robot fleet reallocates across industries toward the highest-value cleared work each year. Lower values mean stickier allocation.',
  erpCrisisSensitivity: 'How much extra return investors demand from stocks when credit tightens into a crisis. In 2008 the demanded premium rose about two points while safe rates collapsed; at zero, the market prices a depression as calmly as a boom. Only crisis-scale tightening moves it.',
  fireSaleElasticity: 'How much each forced sale depresses home prices when foreclosures cluster and ordinary buyers are absent.',
  institutionalBuyerRate: 'The share of distressed home sales absorbed by large investors before prices take the hit. The 2012-era shock absorber.',

  // ── Housing supply (A9, headline) ──
  housingSupplyElasticity: 'How much homebuilding responds when building becomes profitable. The single biggest divide between abundant and constrained housing futures.',
  landShare: 'The share of a home’s value that is the land under it rather than the structure. High land shares blunt construction-cost improvements.',
  embodiedCapacityGain: 'How much robot-assisted construction raises the ceiling on annual homebuilding once physical AI matures. Ties housing abundance to the robotics timeline.',
  rentDownwardRigidity: 'How much of a rent decrease landlords actually pass through when market conditions would justify one. Rents fall far more reluctantly than they rise.',

  // ── Tranche 2 : the POLICY species ──
  cashTransferPerUnemployed: 'The yearly cash support the model pays per jobless worker before any added policy. The baseline safety net in one number.',
  inKindTransferPerUnemployed: 'The yearly value of non-cash support (health coverage, food assistance) per jobless worker before any added policy. Support that arrives as services rather than income.',
  taxConfig: 'The tax-rate section: effective average rates on wage income, payroll, corporate profit, and capital gains, taken from national-accounts data. The revenue side of every fiscal path.',
  'taxConfig.incomeTaxRate': 'The effective average tax rate on wage and salary income. An economy-wide average, not a bracket.',
  'taxConfig.payrollTaxRate': 'The effective payroll tax rate on wages, employer and employee contributions combined.',
  'taxConfig.corporateTaxRate': 'The effective average tax rate on corporate profits, federal and state combined.',
  'taxConfig.capitalGainsTaxRate': 'The effective average tax rate on investment income and realized gains.',
  policyRateSchedule: 'A year-by-year override of the Federal Reserve’s policy rate. When set, the chosen path replaces the modeled reaction rule for those years — you are the Fed.',
  'policyConfig.minimumWage.enabled': 'Turns the federal minimum-wage lever on. When off, the modeled wage floor stays at current law.',
  'policyConfig.minimumWage.federalMinimum': 'The federal minimum wage, schedulable year by year. Raising it lifts low-end wages — and where it overshoots an industry’s pay level, it accelerates automation there.',
  'policyConfig.minimumWage.indexedToInflation': 'Whether the minimum wage rises automatically with consumer prices rather than eroding in real terms.',
  'policyConfig.wageSubsidy.enabled': 'Turns the wage-subsidy program on: government pays part of the wage to keep workers on payroll, on the work-sharing pattern.',
  'policyConfig.wageSubsidy.subsidyPercentage': 'The share of each covered wage the government pays.',
  'policyConfig.wageSubsidy.maxSubsidyPerWorker': 'The yearly ceiling on subsidy per worker. Caps the program’s per-head cost.',
  'policyConfig.sovereignWealthFund.enabled': 'Turns the sovereign wealth fund on: a public investment fund whose returns are distributed to households — capital income for people who own no capital.',
  'policyConfig.sovereignWealthFund.initialFundSize': 'The fund’s starting size.',
  'policyConfig.sovereignWealthFund.startYear': 'The year the fund is created. It seeds with its initial size at this year and pays nothing before it.',
  'policyConfig.sovereignWealthFund.annualContribution': 'What the government pays into the fund each year, schedulable.',
  'policyConfig.sovereignWealthFund.annualReturnRate': 'The yearly return the fund earns on its holdings.',
  'policyConfig.sovereignWealthFund.distributionRate': 'The share of the fund paid out to households each year rather than reinvested.',
  'policyConfig.sovereignWealthFund.ownershipFraction': 'The fraction of the economy’s equity the fund holds, schedulable. The scale of public ownership.',
  'policyConfig.profitSharing.enabled': 'Turns mandatory profit sharing on: firms distribute part of profits to their employees.',
  'policyConfig.profitSharing.mandatorySharePercentage': 'The share of corporate profits distributed to workers, schedulable.',
  'policyConfig.ubi.enabled': 'Turns universal basic income on: an unconditional monthly payment to every adult.',
  'policyConfig.ubi.monthlyAmount': 'The monthly payment per adult, schedulable year by year.',
  'policyConfig.ubi.ageThreshold': 'The age at which a person starts receiving the payment.',
  'policyConfig.ubi.indexedToInflation': 'Whether the payment rises with consumer prices, protecting its purchasing power.',
  'policyConfig.ubi.mode': 'How the payment is set over time: a fixed schedule, or an indexed formula growing from a base amount.',
  'policyConfig.ubi.indexedBaseAmount': 'The starting monthly amount for the indexed formula.',
  'policyConfig.ubi.indexedStartYear': 'The year the indexed formula starts growing the payment.',
  'policyConfig.ubi.productivityIndexRate': 'How strongly the payment tracks economy-wide productivity gains — a dividend on automation.',
  'policyConfig.enhancedUI.enabled': 'Turns enhanced unemployment insurance on: a higher share of lost wages replaced, for longer.',
  'policyConfig.enhancedUI.replacementRate': 'The share of the lost wage unemployment insurance replaces, schedulable.',
  'policyConfig.enhancedUI.durationWeeks': 'How many weeks the benefit lasts.',
  'policyConfig.enhancedUI.retrainingBonus': 'The extra benefit share paid while the recipient is in retraining.',
  'policyConfig.retraining.enabled': 'Turns the retraining program on: stipended training for displaced workers.',
  'policyConfig.retraining.stipendMonthly': 'The monthly stipend paid during training, schedulable.',
  'policyConfig.retraining.durationMonths': 'How many months of training the program entitles. The model caps effective stipend-months at twelve per year.',
  'policyConfig.retraining.participationRate': 'The share of displaced workers who actually enter the program. Uptake, not eligibility.',
  stateOverrides: 'Per-state departures from federal policy: state minimum wages, extra state benefits, and state regulatory stances.',
  'stateOverrides[state].additionalUBI': 'A state-level payment on top of any federal basic income, for that state’s residents.',
  'stateOverrides[state].uiReplacementRate': 'A state-level unemployment-insurance replacement rate that overrides the federal one.',

  // ── Tranche 2 : the EVENT species (supply-chain conditions; 100 = baseline) ──
  'supplyChainConfig.inputs.aiChips': 'The availability of AI chips, indexed to 100 at normal supply. Shortages slow the adoption of cognitive AI.',
  'supplyChainConfig.inputs.chipPrice': 'The price of AI chips, indexed to 100. A price spike is distinct from a quantity shortage — both can bind.',
  'supplyChainConfig.inputs.energyPrice': 'The price of energy for AI systems, indexed to 100. Spikes raise AI operating costs.',
  'supplyChainConfig.inputs.energyCapacity': 'The grid capacity available to AI, indexed to 100. Binding capacity slows the buildout regardless of price.',
  'supplyChainConfig.inputs.trainingDCCapacity': 'Datacenter capacity available for training frontier models, indexed to 100.',
  'supplyChainConfig.inputs.inferenceDCCapacity': 'Datacenter capacity available for running deployed AI, indexed to 100.',
  'supplyChainConfig.inputs.roboticsHardware': 'The availability of robotics hardware, indexed to 100. Shortages slow physical automation specifically.',
  'supplyChainConfig.inputs.softwareEfficiency': 'Software efficiency, indexed to 100 at the baseline trend. Gains above 100 offset hardware constraints on deployed AI.',
  'supplyChainConfig.resilience.aiChips': 'The share of a chip shock the system absorbs rather than feels (domestic fabs, stockpiles, alternatives). Onshoring raises it over time.',
  'supplyChainConfig.resilience.energy': 'The share of an energy shock the system absorbs rather than feels.',
  'supplyChainConfig.resilience.trainingDC': 'The share of a training-datacenter shock the system absorbs rather than feels.',
  'supplyChainConfig.resilience.inferenceDC': 'The share of an inference-capacity shock the system absorbs rather than feels.',
  'supplyChainConfig.resilience.roboticsHardware': 'The share of a robotics-hardware shock (rare-earth processing included) the system absorbs rather than feels.',
  'supplyChainConfig.trainingComposition.aiChips': 'The share of frontier-training cost that is chips.',
  'supplyChainConfig.trainingComposition.energy': 'The share of frontier-training cost that is energy.',
  'supplyChainConfig.trainingComposition.datacenter': 'The share of frontier-training cost that is datacenter construction and operation.',
  'supplyChainConfig.trainingScaleGrowthRate': 'How fast the compute scale of frontier training grows each year. The demand side of the training-cost race.',
  'supplyChainConfig.trainingDynamics.aiChips.techDeclineRate': 'How fast chip cost per unit of computation falls each year on technology alone.',
  'supplyChainConfig.trainingDynamics.energy.techDeclineRate': 'How fast the energy cost of computation falls each year.',
  'supplyChainConfig.trainingDynamics.datacenter.techDeclineRate': 'How fast datacenter cost per unit of capacity falls each year.',
  'supplyChainConfig.trainingDynamics.aiChips.scalePressure': 'How strongly growing training scale bids up chip costs when supply cannot keep pace.',
  'supplyChainConfig.trainingDynamics.energy.scalePressure': 'How strongly growing training scale bids up energy costs.',
  'supplyChainConfig.trainingDynamics.datacenter.scalePressure': 'How strongly growing training scale bids up datacenter costs. Regulatory friction amplifies this channel.',
  'supplyChainConfig.regulatoryFriction': 'How much permitting and regulation slow datacenter buildout: at 3, capacity additions that took one year take three. Slows the datacenter resilience trajectory and amplifies datacenter scale pressure; events can raise it.',
  'supplyChainConfig.chipCascadeLag': 'How many years a chip supply shock takes to reach deployed AI capacity.',
  'supplyChainConfig.chipCascadeCostPremium': 'The extra cost deployed AI carries while a chip shortage works through.',
  'supplyChainConfig.frontierDrainScale': 'How much a supply famine erodes accumulated frontier training capacity relative to its planned path. One means exactly the growth-derived rate; zero means shortages never compound.',
  'supplyChainConfig.frontierRebuildYears': 'How many years rebuilding lost frontier capacity takes once supply returns — the fab-construction timescale. Crises are followed by a rebuild period, not an instant resume.',
  'flywheelStarvationThreshold': 'How starved of revenue the AI market must be before the efficiency flywheel stalls. The model reads how much AI investment the market actually funds and how much AI output it absorbs; while both stay above this threshold the flywheel is fully funded and nothing changes. Below it, cost declines slow in proportion. Zero turns the funding channel off.',
  'frontierCostElasticity': 'How strongly a starved flywheel slows AI cost declines. The cost dials set the pace innovation could achieve if fully funded; this dial sets how much of that pace a starved industry loses. One means proportional; zero means costs fall on schedule no matter what the economy does.',
  'supplyChainConfig.frontierRateElasticity': 'How strongly AI capability progress tracks the frontier capacity stock. One means proportional: at 80% capacity, progress runs at 80% speed. Zero decouples progress from shortages.',
  'supplyChainConfig.frontierInnovationElasticity': 'How compute-bound new-job-creating innovation is. Zero means ideas flow regardless of hardware famines; one means innovation moves in lockstep with frontier capacity.',
  'supplyChainConfig.resilienceOnsetYears': 'How many years reactive supply-security capacity takes to deliver once a shock hits — new fabs cannot insure a shortage the year it starts. Zero restores instant insurance.',
  'supplyChainConfig.costPassThroughRate': 'The share of AI-lab cost changes that reaches AI deployers’ prices.',
  'supplyChainConfig.consumerPassThroughRate': 'The share of deployer cost changes that reaches consumer-facing AI prices.',
  'supplyChainConfig.procurementShares.aiChips': 'The share of deployment spending that is chip procurement.',
  'supplyChainConfig.procurementShares.energy': 'The share of deployment spending that is energy procurement.',
  'supplyChainConfig.procurementShares.datacenter': 'The share of deployment spending that is datacenter procurement.',
  'supplyChainConfig.costVsProcurementBlend': 'The weight on the cost-index channel versus the procurement-share channel in deployment costs. One means pure cost; zero means pure procurement.',
};

/** Coverage counter for the honest-stop report . */
export const EXPLANATION_COVERAGE = Object.keys(DIAL_EXPLANATIONS).length;
