# ATLAS Verification Audit Report

Generated: 2026-02-23T20:50:03.888Z

## Executive Summary

| Category | Total | Pass | Warn/Fail |
|----------|------:|-----:|----------:|
| Field Comparisons | 14768 | 11044 | 1863W / 1861F |
| Invariant Checks | 7037 | 7037 | 0F |
| Extreme Value Tests | 69 | 69 | 0F |
| **TOTAL** | **21874** | **18150** | **1861** |

**RESULT: 1861 FAILURES detected**

## Scenario Summary

| Scenario | Fields | Pass | Warn | Fail | Worst Field | Worst Error |
|----------|-------:|-----:|-----:|-----:|-------------|------------|
| zero_displacement | 1846 | 1821 | 0 | 25 | potentialGDP | 91.4223% |
| displacement_no_policy | 1846 | 1371 | 230 | 245 | netInflation | 1149.5529% |
| ubi_only | 1846 | 1289 | 319 | 238 | actualInflationFromTransfers | 261.3522% |
| ubi_phased | 1846 | 1349 | 246 | 251 | cwiGrowthRate | 407.4582% |
| ai_fund_only | 1846 | 1374 | 232 | 240 | netInflation | 890.2812% |
| min_wage_only | 1846 | 1295 | 303 | 248 | cwiGrowthRate | 3243.2355% |
| all_policies | 1846 | 1287 | 315 | 244 | cwiAcceleration | 825.6014% |
| aggressive_stress | 1846 | 1258 | 218 | 370 | cwiAcceleration | 297.4034% |

## Field Comparison Failures

| Scenario | Year | Field | Expected | Actual | Error |
|----------|-----:|-------|----------|--------|------:|
| zero_displacement | 2026 | potentialGDP | 32.1442T | 32.9900T | 2.6313% |
| zero_displacement | 2027 | potentialGDP | 33.1365T | 34.9033T | 5.3318% |
| zero_displacement | 2028 | potentialGDP | 33.8511T | 36.5942T | 8.1033% |
| zero_displacement | 2029 | potentialGDP | 34.3152T | 38.0719T | 10.9478% |
| zero_displacement | 2030 | potentialGDP | 34.6034T | 39.4019T | 13.8672% |
| zero_displacement | 2031 | potentialGDP | 34.7788T | 40.6437T | 16.8633% |
| zero_displacement | 2032 | potentialGDP | 34.8845T | 41.8398T | 19.9383% |
| zero_displacement | 2033 | potentialGDP | 34.9475T | 43.0184T | 23.0942% |
| zero_displacement | 2034 | potentialGDP | 34.9849T | 44.1975T | 26.3331% |
| zero_displacement | 2035 | potentialGDP | 35.0067T | 45.3888T | 29.6573% |
| zero_displacement | 2036 | potentialGDP | 35.0192T | 46.5996T | 33.0689% |
| zero_displacement | 2037 | potentialGDP | 35.0260T | 47.8351T | 36.5703% |
| zero_displacement | 2038 | potentialGDP | 35.0294T | 49.0985T | 40.1639% |
| zero_displacement | 2039 | potentialGDP | 35.0307T | 50.3924T | 43.8520% |
| zero_displacement | 2040 | potentialGDP | 35.0309T | 51.7185T | 47.6371% |
| zero_displacement | 2041 | potentialGDP | 35.0303T | 53.0785T | 51.5218% |
| zero_displacement | 2042 | potentialGDP | 35.0292T | 54.4735T | 55.5088% |
| zero_displacement | 2043 | potentialGDP | 35.0280T | 55.9048T | 59.6006% |
| zero_displacement | 2044 | potentialGDP | 35.0265T | 57.3735T | 63.8001% |
| zero_displacement | 2045 | potentialGDP | 35.0250T | 58.8806T | 68.1102% |
| zero_displacement | 2046 | potentialGDP | 35.0235T | 60.4273T | 72.5336% |
| zero_displacement | 2047 | potentialGDP | 35.0220T | 62.0146T | 77.0734% |
| zero_displacement | 2048 | potentialGDP | 35.0204T | 63.6436T | 81.7327% |
| zero_displacement | 2049 | potentialGDP | 35.0189T | 65.3153T | 86.5146% |
| zero_displacement | 2050 | potentialGDP | 35.0174T | 67.0311T | 91.4223% |
| displacement_no_policy | 2026 | potentialGDP | 32.1442T | 32.9900T | 2.6313% |
| displacement_no_policy | 2027 | potentialGDP | 33.1365T | 34.9033T | 5.3318% |
| displacement_no_policy | 2028 | potentialGDP | 33.8511T | 36.5942T | 8.1033% |
| displacement_no_policy | 2029 | potentialGDP | 34.3152T | 38.0719T | 10.9478% |
| displacement_no_policy | 2030 | potentialGDP | 34.6034T | 39.4019T | 13.8672% |
| displacement_no_policy | 2031 | potentialGDP | 34.7788T | 40.6437T | 16.8633% |
| displacement_no_policy | 2032 | aiAdditionalOutput | 320.5461M | 328.9254M | 2.6141% |
| displacement_no_policy | 2032 | aiInvestmentBoost | 96.1638M | 98.6776M | 2.6141% |
| displacement_no_policy | 2032 | aiNetExportBoost | 32.0546M | 32.8925M | 2.6141% |
| displacement_no_policy | 2032 | aiConsumerGoodsPotential | 192.3277M | 197.3553M | 2.6141% |
| displacement_no_policy | 2032 | aiGoodsAbsorbed | 192.3277M | 197.3553M | 2.6141% |
| displacement_no_policy | 2032 | potentialGDP | 34.8872T | 41.8386T | 19.9252% |
| displacement_no_policy | 2032 | aiCorporateProfits | 80.1365M | 82.2314M | 2.6141% |
| displacement_no_policy | 2032 | aiGDPContribution | 320.5461M | 328.9254M | 2.6141% |
| displacement_no_policy | 2032 | maxNeutralTransfers | 2.7205B | 2.1772B | 19.9721% |
| displacement_no_policy | 2033 | aiAdditionalOutput | 5.5776B | 5.7084B | 2.3461% |
| displacement_no_policy | 2033 | aiInvestmentBoost | 1.6733B | 1.7125B | 2.3461% |
| displacement_no_policy | 2033 | aiNetExportBoost | 557.7579M | 570.8435M | 2.3461% |
| displacement_no_policy | 2033 | aiConsumerGoodsPotential | 3.3465B | 3.4251B | 2.3461% |
| displacement_no_policy | 2033 | aiGoodsAbsorbed | 3.3465B | 3.4251B | 2.3461% |
| displacement_no_policy | 2033 | potentialGDP | 34.9784T | 43.0068T | 22.9524% |
| displacement_no_policy | 2033 | aiCorporateProfits | 1.3944B | 1.4271B | 2.3461% |
| displacement_no_policy | 2033 | aiGDPContribution | 5.5776B | 5.7084B | 2.3461% |
| displacement_no_policy | 2033 | maxNeutralTransfers | 25.9452B | 20.1413B | 22.3698% |
| displacement_no_policy | 2034 | aiAdditionalOutput | 34.7859B | 35.3821B | 1.7139% |
| displacement_no_policy | 2034 | aiInvestmentBoost | 10.4358B | 10.6146B | 1.7139% |
| displacement_no_policy | 2034 | aiNetExportBoost | 3.4786B | 3.5382B | 1.7139% |
| displacement_no_policy | 2034 | aiConsumerGoodsPotential | 20.8715B | 21.2293B | 1.7139% |
| displacement_no_policy | 2034 | aiGoodsAbsorbed | 20.8715B | 21.2293B | 1.7139% |
| displacement_no_policy | 2034 | potentialGDP | 35.1026T | 44.1570T | 25.7941% |
| displacement_no_policy | 2034 | aiCorporateProfits | 8.6965B | 8.8455B | 1.7139% |
| displacement_no_policy | 2034 | aiGDPContribution | 34.7859B | 35.3821B | 1.7139% |
| displacement_no_policy | 2034 | maxNeutralTransfers | 76.2734B | 56.9586B | 25.3231% |
| displacement_no_policy | 2035 | aiAdditionalOutput | 120.9332B | 122.2624B | 1.0991% |
| displacement_no_policy | 2035 | aiInvestmentBoost | 36.2800B | 36.6787B | 1.0991% |
| displacement_no_policy | 2035 | aiNetExportBoost | 12.0933B | 12.2262B | 1.0991% |
| displacement_no_policy | 2035 | aiConsumerGoodsPotential | 72.5599B | 73.3574B | 1.0991% |
| displacement_no_policy | 2035 | aiGoodsAbsorbed | 72.5599B | 73.3574B | 1.0991% |
| displacement_no_policy | 2035 | potentialGDP | 35.0960T | 44.9519T | 28.0825% |
| displacement_no_policy | 2035 | aiCorporateProfits | 30.2333B | 30.5656B | 1.0991% |
| displacement_no_policy | 2035 | aiGDPContribution | 120.9332B | 122.2624B | 1.0991% |
| displacement_no_policy | 2035 | maxNeutralTransfers | 139.8898B | 103.3395B | 26.1279% |
| displacement_no_policy | 2036 | potentialGDP | 34.7654T | 44.9240T | 29.2203% |
| displacement_no_policy | 2036 | maxNeutralTransfers | 248.1921B | 189.1607B | 23.7846% |
| displacement_no_policy | 2037 | gdpNominal | 43.6774T | 42.3110T | 3.1284% |
| displacement_no_policy | 2037 | gdpReal | 33.6758T | 32.0886T | 4.7133% |
| displacement_no_policy | 2037 | consumption | 29.5386T | 28.2193T | 4.4664% |
| displacement_no_policy | 2037 | newJobWageIncome | 81.1350B | 80.2247B | 1.1220% |
| displacement_no_policy | 2037 | potentialGDP | 34.0300T | 42.6663T | 25.3786% |
| displacement_no_policy | 2037 | corporateProfits | 4.8872T | 4.7371T | 3.0703% |
| displacement_no_policy | 2037 | traditionalCorporateProfits | 4.7396T | 4.5891T | 3.1754% |
| displacement_no_policy | 2037 | maxNeutralTransfers | 375.5823B | 308.4131B | 17.8840% |
| displacement_no_policy | 2038 | aggregateWageIncome | 22.9924T | 22.2572T | 3.1978% |
| displacement_no_policy | 2038 | aggregateAssetIncome | 9.8717T | 9.5359T | 3.4016% |
| displacement_no_policy | 2038 | totalIncome | 40.7268T | 39.6365T | 2.6771% |
| displacement_no_policy | 2038 | gdpNominal | 39.6783T | 38.1446T | 3.8653% |
| displacement_no_policy | 2038 | gdpReal | 31.0964T | 28.8818T | 7.1217% |
| displacement_no_policy | 2038 | consumption | 25.6969T | 24.6566T | 4.0485% |
| displacement_no_policy | 2038 | investment | 7.9140T | 7.4484T | 5.8832% |
| displacement_no_policy | 2038 | newJobEmployment | 705.5013K | 672.2115K | 4.7186% |
| displacement_no_policy | 2038 | newJobWageIncome | 72.1980B | 66.6051B | 7.7467% |
| displacement_no_policy | 2038 | potentialGDP | 31.7555T | 38.8043T | 22.1970% |
| displacement_no_policy | 2038 | wageConsumption | 17.9450T | 17.3688T | 3.2113% |
| displacement_no_policy | 2038 | assetConsumption | 3.4551T | 3.3376T | 3.4016% |
| displacement_no_policy | 2038 | corporateProfits | 4.5184T | 4.3498T | 3.7309% |
| displacement_no_policy | 2038 | traditionalCorporateProfits | 4.2438T | 4.0750T | 3.9778% |
| displacement_no_policy | 2038 | maxNeutralTransfers | 544.4298B | 526.2113B | 3.3463% |
| displacement_no_policy | 2039 | totalUnemployment | 21.4687M | 21.7866M | 1.4808% |
| displacement_no_policy | 2039 | aggregateWageIncome | 18.4282T | 17.6059T | 4.4623% |
| displacement_no_policy | 2039 | aggregateAssetIncome | 9.4051T | 9.0246T | 4.0455% |
| displacement_no_policy | 2039 | totalIncome | 35.8202T | 34.6035T | 3.3967% |
| displacement_no_policy | 2039 | gdpNominal | 33.0134T | 31.3650T | 4.9929% |
| displacement_no_policy | 2039 | gdpReal | 27.0232T | 23.9579T | 11.3433% |
| displacement_no_policy | 2039 | consumption | 19.7090T | 18.3717T | 6.7851% |
| displacement_no_policy | 2039 | investment | 7.1677T | 6.8819T | 3.9870% |
| displacement_no_policy | 2039 | aiAdditionalOutput | 2.1868T | 2.2292T | 1.9371% |
| displacement_no_policy | 2039 | aiInvestmentBoost | 656.0409B | 668.7492B | 1.9371% |
| displacement_no_policy | 2039 | aiNetExportBoost | 218.6803B | 222.9164B | 1.9371% |
| displacement_no_policy | 2039 | aiConsumerGoodsPotential | 1.3121T | 1.3375T | 1.9371% |
| displacement_no_policy | 2039 | unrealizedAIOutput | 87.1471B | 173.5587B | 99.1560% |
| displacement_no_policy | 2039 | aiGoodsAbsorbed | 1.2249T | 1.1639T | 4.9794% |
| displacement_no_policy | 2039 | newJobEmployment | 613.2503K | 568.0593K | 7.3691% |
| displacement_no_policy | 2039 | newJobWageIncome | 53.0987B | 47.1237B | 11.2525% |
| displacement_no_policy | 2039 | potentialGDP | 28.3353T | 32.7025T | 15.4127% |
| displacement_no_policy | 2039 | wageConsumption | 14.0572T | 13.4145T | 4.5721% |
| displacement_no_policy | 2039 | assetConsumption | 3.2918T | 3.1586T | 4.0455% |
| displacement_no_policy | 2039 | corporateProfits | 3.9254T | 3.7379T | 4.7761% |
| displacement_no_policy | 2039 | aiCorporateProfits | 524.9140B | 513.9014B | 2.0980% |
| displacement_no_policy | 2039 | traditionalCorporateProfits | 3.4005T | 3.2240T | 5.1895% |
| displacement_no_policy | 2039 | aiGDPContribution | 2.0997T | 2.0556T | 2.0980% |
| displacement_no_policy | 2039 | maxNeutralTransfers | 668.8668B | 950.9910B | 42.1794% |
| displacement_no_policy | 2040 | totalEmployment | 148.8419M | 146.7357M | 1.4151% |
| displacement_no_policy | 2040 | totalUnemployment | 33.2359M | 35.3422M | 6.3374% |
| displacement_no_policy | 2040 | aggregateWageIncome | 12.2282T | 11.1484T | 8.8307% |
| displacement_no_policy | 2040 | aggregateAssetIncome | 8.2561T | 7.8146T | 5.3479% |
| displacement_no_policy | 2040 | totalIncome | 28.6971T | 27.1962T | 5.2302% |
| displacement_no_policy | 2040 | gdpNominal | 26.9042T | 25.6582T | 4.6312% |
| displacement_no_policy | 2040 | gdpReal | 23.4117T | 19.9883T | 14.6229% |
| displacement_no_policy | 2040 | consumption | 14.1461T | 13.1648T | 6.9370% |
| displacement_no_policy | 2040 | investment | 6.4922T | 6.2522T | 3.6971% |
| displacement_no_policy | 2040 | governmentSpending | 6.6551T | 6.5843T | 1.0631% |
| displacement_no_policy | 2040 | aiAdditionalOutput | 4.1401T | 4.2001T | 1.4475% |
| displacement_no_policy | 2040 | aiInvestmentBoost | 1.2420T | 1.2600T | 1.4475% |
| displacement_no_policy | 2040 | aiNetExportBoost | 414.0136B | 420.0064B | 1.4475% |
| displacement_no_policy | 2040 | aiConsumerGoodsPotential | 2.4841T | 2.5200T | 1.4475% |
| displacement_no_policy | 2040 | unrealizedAIOutput | 819.5553B | 948.5572B | 15.7405% |
| displacement_no_policy | 2040 | aiGoodsAbsorbed | 1.6645T | 1.5715T | 5.5899% |
| displacement_no_policy | 2040 | newJobEmployment | 475.4089K | 419.8207K | 11.6927% |
| displacement_no_policy | 2040 | newJobWageIncome | 30.2895B | 24.7738B | 18.2101% |
| displacement_no_policy | 2040 | potentialGDP | 25.8958T | 28.1783T | 8.8140% |
| displacement_no_policy | 2040 | wageConsumption | 8.9355T | 8.0820T | 9.5523% |
| displacement_no_policy | 2040 | assetConsumption | 2.8896T | 2.7351T | 5.3479% |
| displacement_no_policy | 2040 | corporateProfits | 3.4243T | 3.2776T | 4.2849% |
| displacement_no_policy | 2040 | aiCorporateProfits | 830.1453B | 812.8768B | 2.0802% |
| displacement_no_policy | 2040 | traditionalCorporateProfits | 2.5942T | 2.4647T | 4.9904% |
| displacement_no_policy | 2040 | aiGDPContribution | 3.3206T | 3.2515T | 2.0802% |
| displacement_no_policy | 2040 | totalDemandSpilloverLoss | 242.8830K | 1.9181M | 689.7357% |
| displacement_no_policy | 2040 | maxNeutralTransfers | 758.5143B | 1.2994T | 71.3062% |
| displacement_no_policy | 2041 | totalEmployment | 116.6885M | 112.5996M | 3.5041% |
| displacement_no_policy | 2041 | totalUnemployment | 66.1177M | 70.2066M | 6.1842% |
| displacement_no_policy | 2041 | aggregateWageIncome | 5.2642T | 4.6189T | 12.2595% |
| displacement_no_policy | 2041 | aggregateAssetIncome | 7.1615T | 6.8056T | 4.9701% |
| displacement_no_policy | 2041 | totalIncome | 21.2698T | 20.3270T | 4.4325% |
| displacement_no_policy | 2041 | gdpNominal | 22.8080T | 22.1705T | 2.7948% |
| displacement_no_policy | 2041 | gdpReal | 21.3242T | 17.7919T | 16.5647% |
| displacement_no_policy | 2041 | consumption | 9.6347T | 9.2289T | 4.2123% |
| displacement_no_policy | 2041 | investment | 6.6428T | 6.4378T | 3.0852% |
| displacement_no_policy | 2041 | unrealizedAIOutput | 2.4110T | 2.4963T | 3.5363% |
| displacement_no_policy | 2041 | aiGoodsAbsorbed | 2.0241T | 1.9388T | 4.2123% |
| displacement_no_policy | 2041 | newJobEmployment | 335.1973K | 286.1817K | 14.6229% |
| displacement_no_policy | 2041 | newJobWageIncome | 12.3178B | 9.5798B | 22.2275% |
| displacement_no_policy | 2041 | potentialGDP | 25.7593T | 26.6057T | 3.2854% |
| displacement_no_policy | 2041 | wageConsumption | 3.3752T | 2.9098T | 13.7900% |
| displacement_no_policy | 2041 | assetConsumption | 2.5065T | 2.3819T | 4.9701% |
| displacement_no_policy | 2041 | corporateProfits | 3.2062T | 3.1241T | 2.5593% |
| displacement_no_policy | 2041 | aiCorporateProfits | 1.2452T | 1.2239T | 1.7118% |
| displacement_no_policy | 2041 | traditionalCorporateProfits | 1.9610T | 1.9002T | 3.0974% |
| displacement_no_policy | 2041 | aiGDPContribution | 4.9809T | 4.8956T | 1.7118% |
| displacement_no_policy | 2041 | totalDemandSpilloverLoss | 14.4507M | 18.4905M | 27.9561% |
| displacement_no_policy | 2041 | maxNeutralTransfers | 841.1068B | 1.4036T | 66.8706% |
| displacement_no_policy | 2042 | totalEmployment | 94.1598M | 92.0032M | 2.2903% |
| displacement_no_policy | 2042 | totalUnemployment | 89.3776M | 91.5342M | 2.4129% |
| displacement_no_policy | 2042 | aggregateWageIncome | 2.7646T | 2.5651T | 7.2156% |
| displacement_no_policy | 2042 | aggregateAssetIncome | 6.2045T | 6.0650T | 2.2485% |
| displacement_no_policy | 2042 | totalIncome | 18.2598T | 17.9422T | 1.7392% |
| displacement_no_policy | 2042 | gdpNominal | 21.4187T | 21.1765T | 1.1307% |
| displacement_no_policy | 2042 | gdpReal | 21.7363T | 17.6787T | 18.6676% |
| displacement_no_policy | 2042 | consumption | 8.0991T | 7.9650T | 1.6560% |
| displacement_no_policy | 2042 | investment | 6.6287T | 6.5413T | 1.3191% |
| displacement_no_policy | 2042 | unrealizedAIOutput | 3.4769T | 3.5128T | 1.0308% |
| displacement_no_policy | 2042 | aiGoodsAbsorbed | 2.1641T | 2.1283T | 1.6560% |
| displacement_no_policy | 2042 | newJobEmployment | 262.0088K | 218.6078K | 16.5647% |
| displacement_no_policy | 2042 | newJobWageIncome | 6.5443B | 5.1926B | 20.6545% |
| displacement_no_policy | 2042 | potentialGDP | 27.3774T | 26.8176T | 2.0448% |
| displacement_no_policy | 2042 | wageConsumption | 1.5994T | 1.4689T | 8.1579% |
| displacement_no_policy | 2042 | assetConsumption | 2.1716T | 2.1227T | 2.2485% |
| displacement_no_policy | 2042 | traditionalCorporateProfits | 1.7043T | 1.6816T | 1.3318% |
| displacement_no_policy | 2042 | totalDemandSpilloverLoss | 25.2643M | 27.3774M | 8.3643% |
| displacement_no_policy | 2042 | maxNeutralTransfers | 1.0032T | 1.6318T | 62.6648% |
| displacement_no_policy | 2043 | aggregateWageIncome | 1.8355T | 1.7840T | 2.8105% |
| displacement_no_policy | 2043 | gdpReal | 24.4147T | 19.2079T | 21.3263% |
| displacement_no_policy | 2043 | newJobEmployment | 215.4835K | 175.2579K | 18.6676% |
| displacement_no_policy | 2043 | newJobWageIncome | 4.4700B | 3.5694B | 20.1483% |
| displacement_no_policy | 2043 | potentialGDP | 31.2029T | 28.5917T | 8.3684% |
| displacement_no_policy | 2043 | wageConsumption | 987.6917B | 956.3013B | 3.1782% |
| displacement_no_policy | 2043 | totalDemandSpilloverLoss | 25.0455M | 25.7555M | 2.8350% |
| displacement_no_policy | 2043 | maxNeutralTransfers | 1.3633T | 2.1451T | 57.3474% |
| displacement_no_policy | 2044 | gdpReal | 28.6265T | 21.5558T | 24.6998% |
| displacement_no_policy | 2044 | newJobEmployment | 208.3964K | 164.1372K | 21.2380% |
| displacement_no_policy | 2044 | newJobWageIncome | 4.1887B | 3.2927B | 21.3922% |
| displacement_no_policy | 2044 | potentialGDP | 36.2452T | 30.4146T | 16.0867% |
| displacement_no_policy | 2044 | maxNeutralTransfers | 1.9242T | 2.8888T | 50.1304% |
| displacement_no_policy | 2045 | aggregateAssetIncome | 8.4891T | 8.3677T | 1.4296% |
| displacement_no_policy | 2045 | gdpReal | 33.8564T | 24.3182T | 28.1725% |
| displacement_no_policy | 2045 | consumption | 7.7862T | 7.7073T | 1.0132% |
| displacement_no_policy | 2045 | newJobEmployment | 218.2551K | 164.2998K | 24.7212% |
| displacement_no_policy | 2045 | newJobWageIncome | 4.4533B | 3.3451B | 24.8849% |
| displacement_no_policy | 2045 | potentialGDP | 42.1254T | 31.9961T | 24.0456% |
| displacement_no_policy | 2045 | assetConsumption | 2.9712T | 2.9287T | 1.4296% |
| displacement_no_policy | 2045 | maxNeutralTransfers | 2.5003T | 3.5922T | 43.6731% |
| displacement_no_policy | 2046 | aggregateAssetIncome | 9.2156T | 8.8491T | 3.9776% |
| displacement_no_policy | 2046 | totalIncome | 20.6113T | 20.2142T | 1.9268% |
| displacement_no_policy | 2046 | gdpReal | 39.7046T | 27.2092T | 31.4711% |
| displacement_no_policy | 2046 | consumption | 7.9290T | 7.8251T | 1.3106% |
| displacement_no_policy | 2046 | consumerWelfareIndex | 34.8300K | 23.7052K | 31.9402% |
| displacement_no_policy | 2046 | aiGoodsAbsorbed | 3.2641T | 3.2214T | 1.3092% |
| displacement_no_policy | 2046 | newJobEmployment | 238.1669K | 171.0542K | 28.1789% |
| displacement_no_policy | 2046 | newJobWageIncome | 4.9716B | 3.5491B | 28.6119% |
| displacement_no_policy | 2046 | potentialGDP | 48.3953T | 32.9834T | 31.8458% |
| displacement_no_policy | 2046 | wageConsumption | 809.3186B | 800.6401B | 1.0723% |
| displacement_no_policy | 2046 | assetConsumption | 3.2255T | 3.0972T | 3.9776% |
| displacement_no_policy | 2046 | totalDemandSpilloverLoss | 15.4355M | 15.5980M | 1.0525% |
| displacement_no_policy | 2046 | maxNeutralTransfers | 3.1318T | 4.2928T | 37.0705% |
| displacement_no_policy | 2047 | aggregateWageIncome | 1.5825T | 1.5599T | 1.4330% |
| displacement_no_policy | 2047 | aggregateAssetIncome | 9.7057T | 9.1735T | 5.4833% |
| displacement_no_policy | 2047 | totalIncome | 21.1319T | 20.5635T | 2.6896% |
| displacement_no_policy | 2047 | gdpReal | 46.2811T | 30.3156T | 34.4968% |
| displacement_no_policy | 2047 | consumption | 8.0256T | 7.9239T | 1.2675% |
| displacement_no_policy | 2047 | consumerWelfareIndex | 40.3844K | 26.2890K | 34.9031% |
| displacement_no_policy | 2047 | aiGoodsAbsorbed | 3.4124T | 3.3692T | 1.2653% |
| displacement_no_policy | 2047 | newJobEmployment | 262.4319K | 179.7990K | 31.4874% |
| displacement_no_policy | 2047 | newJobWageIncome | 5.5203B | 3.7472B | 32.1198% |
| displacement_no_policy | 2047 | potentialGDP | 55.2573T | 33.5919T | 39.2082% |
| displacement_no_policy | 2047 | wageConsumption | 801.4108B | 788.5178B | 1.6088% |
| displacement_no_policy | 2047 | assetConsumption | 3.3970T | 3.2107T | 5.4833% |
| displacement_no_policy | 2047 | totalDemandSpilloverLoss | 13.6289M | 13.8723M | 1.7859% |
| displacement_no_policy | 2047 | maxNeutralTransfers | 3.8374T | 5.0284T | 31.0370% |
| displacement_no_policy | 2048 | aggregateWageIncome | 1.5612T | 1.5377T | 1.5032% |
| displacement_no_policy | 2048 | aggregateAssetIncome | 10.0600T | 9.3829T | 6.7299% |
| displacement_no_policy | 2048 | totalIncome | 21.4983T | 20.7847T | 3.3192% |
| displacement_no_policy | 2048 | gdpReal | 53.9618T | 33.8144T | 37.3364% |
| displacement_no_policy | 2048 | consumption | 8.0948T | 8.0027T | 1.1370% |
| displacement_no_policy | 2048 | consumerWelfareIndex | 46.9066K | 29.2245K | 37.6964% |
| displacement_no_policy | 2048 | aiGoodsAbsorbed | 3.5235T | 3.4836T | 1.1329% |
| displacement_no_policy | 2048 | newJobEmployment | 290.9308K | 190.5148K | 34.5154% |
| displacement_no_policy | 2048 | newJobWageIncome | 6.0938B | 3.9522B | 35.1445% |
| displacement_no_policy | 2048 | potentialGDP | 63.1512T | 34.0348T | 46.1059% |
| displacement_no_policy | 2048 | wageConsumption | 785.3268B | 772.0515B | 1.6904% |
| displacement_no_policy | 2048 | assetConsumption | 3.5210T | 3.2840T | 6.7299% |
| displacement_no_policy | 2048 | totalDemandSpilloverLoss | 12.4528M | 12.6979M | 1.9680% |
| displacement_no_policy | 2048 | maxNeutralTransfers | 4.6492T | 5.8281T | 25.3573% |
| displacement_no_policy | 2049 | aggregateWageIncome | 1.5483T | 1.5271T | 1.3689% |
| displacement_no_policy | 2049 | aggregateAssetIncome | 10.3263T | 9.5220T | 7.7885% |
| displacement_no_policy | 2049 | totalIncome | 21.7765T | 20.9375T | 3.8524% |
| displacement_no_policy | 2049 | gdpReal | 63.0319T | 37.7842T | 40.0555% |
| displacement_no_policy | 2049 | consumerWelfareIndex | 54.5836K | 32.5589K | 40.3503% |
| displacement_no_policy | 2049 | newJobEmployment | 328.3903K | 205.7813K | 37.3364% |
| displacement_no_policy | 2049 | newJobWageIncome | 6.8471B | 4.2540B | 37.8722% |
| displacement_no_policy | 2049 | potentialGDP | 72.3736T | 34.3838T | 52.4913% |
| displacement_no_policy | 2049 | wageConsumption | 775.5121B | 763.5219B | 1.5461% |
| displacement_no_policy | 2049 | assetConsumption | 3.6142T | 3.3327T | 7.7885% |
| displacement_no_policy | 2049 | totalDemandSpilloverLoss | 11.7553M | 11.9724M | 1.8466% |
| displacement_no_policy | 2049 | maxNeutralTransfers | 5.5596T | 6.6653T | 19.8891% |
| displacement_no_policy | 2050 | aggregateWageIncome | 1.5474T | 1.5282T | 1.2387% |
| displacement_no_policy | 2050 | aggregateAssetIncome | 10.5438T | 9.6259T | 8.7054% |
| displacement_no_policy | 2050 | totalIncome | 22.0096T | 21.0589T | 4.3195% |
| displacement_no_policy | 2050 | gdpReal | 73.6928T | 42.2497T | 42.6678% |
| displacement_no_policy | 2050 | consumerWelfareIndex | 63.5927K | 36.3200K | 42.8866% |
| displacement_no_policy | 2050 | newJobEmployment | 376.6055K | 225.7545K | 40.0555% |
| displacement_no_policy | 2050 | newJobWageIncome | 7.8403B | 4.6647B | 40.5032% |
| displacement_no_policy | 2050 | potentialGDP | 83.1418T | 34.6631T | 58.3085% |
| displacement_no_policy | 2050 | wageConsumption | 773.5252B | 762.6118B | 1.4109% |
| displacement_no_policy | 2050 | assetConsumption | 3.6903T | 3.3691T | 8.7054% |
| displacement_no_policy | 2050 | totalDemandSpilloverLoss | 11.3345M | 11.5139M | 1.5827% |
| displacement_no_policy | 2050 | maxNeutralTransfers | 6.5829T | 7.5482T | 14.6644% |
| ubi_only | 2025 | moneySupply | 24.1987T | 27.3974T | 13.2186% |
| ubi_only | 2026 | potentialGDP | 37.6905T | 38.8011T | 2.9466% |
| ubi_only | 2026 | moneySupply | 27.4102T | 33.8205T | 23.3863% |
| ubi_only | 2027 | potentialGDP | 42.5939T | 45.1413T | 5.9806% |
| ubi_only | 2027 | moneySupply | 30.6346T | 40.2692T | 31.4501% |
| ubi_only | 2028 | potentialGDP | 46.0435T | 50.2355T | 9.1045% |
| ubi_only | 2028 | moneySupply | 33.8719T | 46.7437T | 38.0016% |
| ubi_only | 2029 | gdpReal | 48.4344T | 49.0338T | 1.2376% |
| ubi_only | 2029 | potentialGDP | 48.4344T | 54.4019T | 12.3209% |
| ubi_only | 2029 | moneySupply | 37.1221T | 53.2441T | 43.4299% |
| ubi_only | 2030 | gdpReal | 50.0546T | 50.8307T | 1.5505% |
| ubi_only | 2030 | newJobEmployment | 1.0898M | 1.1033M | 1.2376% |
| ubi_only | 2030 | newJobWageIncome | 154.3446B | 156.2592B | 1.2405% |
| ubi_only | 2030 | potentialGDP | 50.0546T | 57.8795T | 15.6327% |
| ubi_only | 2030 | moneySupply | 40.3853T | 59.7705T | 48.0008% |
| ubi_only | 2031 | gdpReal | 51.1142T | 52.0673T | 1.8647% |
| ubi_only | 2031 | newJobEmployment | 1.1262M | 1.1437M | 1.5505% |
| ubi_only | 2031 | newJobWageIncome | 169.0247B | 171.6535B | 1.5552% |
| ubi_only | 2031 | potentialGDP | 51.1142T | 60.8476T | 19.0425% |
| ubi_only | 2031 | moneySupply | 43.6615T | 66.3231T | 51.9027% |
| ubi_only | 2032 | gdpReal | 51.6898T | 52.8172T | 2.1809% |
| ubi_only | 2032 | aiAdditionalOutput | 320.5461M | 334.9371M | 4.4895% |
| ubi_only | 2032 | aiInvestmentBoost | 96.1638M | 100.4811M | 4.4895% |
| ubi_only | 2032 | aiNetExportBoost | 32.0546M | 33.4937M | 4.4895% |
| ubi_only | 2032 | aiConsumerGoodsPotential | 192.3277M | 200.9623M | 4.4895% |
| ubi_only | 2032 | aiGoodsAbsorbed | 192.3277M | 200.9623M | 4.4895% |
| ubi_only | 2032 | newJobEmployment | 1.1500M | 1.1715M | 1.8646% |
| ubi_only | 2032 | newJobWageIncome | 180.7242B | 184.1065B | 1.8715% |
| ubi_only | 2032 | potentialGDP | 51.6900T | 63.3411T | 22.5403% |
| ubi_only | 2032 | aiCorporateProfits | 80.1365M | 83.7343M | 4.4895% |
| ubi_only | 2032 | aiGDPContribution | 320.5461M | 334.9371M | 4.4895% |
| ubi_only | 2032 | moneySupply | 46.9509T | 72.9018T | 55.2724% |
| ubi_only | 2032 | maxNeutralTransfers | 4.0308B | 2.6361B | 34.6008% |
| ubi_only | 2033 | gdpReal | 51.9317T | 53.2307T | 2.5013% |
| ubi_only | 2033 | aiAdditionalOutput | 5.5776B | 5.7905B | 3.8172% |
| ubi_only | 2033 | aiInvestmentBoost | 1.6733B | 1.7371B | 3.8172% |
| ubi_only | 2033 | aiNetExportBoost | 557.7579M | 579.0489M | 3.8172% |
| ubi_only | 2033 | aiConsumerGoodsPotential | 3.3465B | 3.4743B | 3.8172% |
| ubi_only | 2033 | aiGoodsAbsorbed | 3.3465B | 3.4743B | 3.8172% |
| ubi_only | 2033 | newJobEmployment | 1.1623M | 1.1876M | 2.1785% |
| ubi_only | 2033 | newJobWageIncome | 189.4093B | 193.5553B | 2.1889% |
| ubi_only | 2033 | potentialGDP | 51.9351T | 65.4508T | 26.0242% |
| ubi_only | 2033 | aiCorporateProfits | 1.3944B | 1.4476B | 3.8172% |
| ubi_only | 2033 | aiGDPContribution | 5.5776B | 5.7905B | 3.8172% |
| ubi_only | 2033 | moneySupply | 50.2534T | 79.5068T | 58.2118% |
| ubi_only | 2033 | maxNeutralTransfers | 38.5240B | 24.2809B | 36.9721% |
| ubi_only | 2034 | gdpReal | 52.0051T | 53.4727T | 2.8220% |
| ubi_only | 2034 | aiAdditionalOutput | 34.7859B | 35.6169B | 2.3890% |
| ubi_only | 2034 | aiInvestmentBoost | 10.4358B | 10.6851B | 2.3890% |
| ubi_only | 2034 | aiNetExportBoost | 3.4786B | 3.5617B | 2.3890% |
| ubi_only | 2034 | aiConsumerGoodsPotential | 20.8715B | 21.3702B | 2.3890% |
| ubi_only | 2034 | aiGoodsAbsorbed | 20.8715B | 21.3702B | 2.3890% |
| ubi_only | 2034 | newJobEmployment | 1.1639M | 1.1929M | 2.4901% |
| ubi_only | 2034 | newJobWageIncome | 195.4046B | 200.3003B | 2.5054% |
| ubi_only | 2034 | potentialGDP | 52.0260T | 67.2918T | 29.3427% |
| ubi_only | 2034 | aiCorporateProfits | 8.6965B | 8.9042B | 2.3890% |
| ubi_only | 2034 | aiGDPContribution | 34.7859B | 35.6169B | 2.3890% |
| ubi_only | 2034 | moneySupply | 53.5692T | 86.1383T | 60.7983% |
| ubi_only | 2034 | maxNeutralTransfers | 113.0675B | 67.9376B | 39.9141% |
| ubi_only | 2035 | gdpReal | 51.9056T | 53.5094T | 3.0899% |
| ubi_only | 2035 | aiAdditionalOutput | 120.9332B | 122.5205B | 1.3125% |
| ubi_only | 2035 | aiInvestmentBoost | 36.2800B | 36.7562B | 1.3125% |
| ubi_only | 2035 | aiNetExportBoost | 12.0933B | 12.2521B | 1.3125% |
| ubi_only | 2035 | aiConsumerGoodsPotential | 72.5599B | 73.5123B | 1.3125% |
| ubi_only | 2035 | aiGoodsAbsorbed | 72.5599B | 73.5123B | 1.3125% |
| ubi_only | 2035 | newJobEmployment | 1.1556M | 1.1880M | 2.8024% |
| ubi_only | 2035 | newJobWageIncome | 198.5886B | 204.2228B | 2.8371% |
| ubi_only | 2035 | potentialGDP | 51.9781T | 68.7808T | 32.3264% |
| ubi_only | 2035 | aiCorporateProfits | 30.2333B | 30.6301B | 1.3125% |
| ubi_only | 2035 | aiGDPContribution | 120.9332B | 122.5205B | 1.3125% |
| ubi_only | 2035 | moneySupply | 56.8982T | 92.7963T | 63.0919% |
| ubi_only | 2035 | maxNeutralTransfers | 207.3199B | 121.7137B | 41.2918% |
| ubi_only | 2036 | gdpReal | 51.2050T | 52.7175T | 2.9538% |
| ubi_only | 2036 | newJobEmployment | 1.1392M | 1.1742M | 3.0733% |
| ubi_only | 2036 | newJobWageIncome | 196.1879B | 202.3027B | 3.1168% |
| ubi_only | 2036 | potentialGDP | 51.3745T | 68.9528T | 34.2158% |
| ubi_only | 2036 | moneySupply | 60.2405T | 99.4809T | 65.1397% |
| ubi_only | 2036 | maxNeutralTransfers | 367.3464B | 222.5027B | 39.4297% |
| ubi_only | 2037 | gdpReal | 49.7258T | 50.8040T | 2.1682% |
| ubi_only | 2037 | newJobEmployment | 1.1025M | 1.1349M | 2.9393% |
| ubi_only | 2037 | newJobWageIncome | 185.1111B | 190.5255B | 2.9250% |
| ubi_only | 2037 | potentialGDP | 50.0800T | 67.3411T | 34.4671% |
| ubi_only | 2037 | moneySupply | 63.5961T | 106.1923T | 66.9791% |
| ubi_only | 2037 | maxNeutralTransfers | 554.5863B | 356.7041B | 35.6811% |
| ubi_only | 2038 | gdpNominal | 61.1231T | 60.4990T | 1.0209% |
| ubi_only | 2038 | consumption | 42.5932T | 42.0362T | 1.3079% |
| ubi_only | 2038 | newJobEmployment | 1.0418M | 1.0644M | 2.1663% |
| ubi_only | 2038 | newJobWageIncome | 164.5757B | 167.8623B | 1.9970% |
| ubi_only | 2038 | potentialGDP | 46.4932T | 61.1580T | 31.5418% |
| ubi_only | 2038 | traditionalCorporateProfits | 6.6028T | 6.5341T | 1.0401% |
| ubi_only | 2038 | moneySupply | 66.9652T | 112.9305T | 68.6405% |
| ubi_only | 2038 | maxNeutralTransfers | 802.0616B | 608.9619B | 24.0754% |
| ubi_only | 2039 | aggregateWageIncome | 28.5480T | 28.2484T | 1.0495% |
| ubi_only | 2039 | aggregateAssetIncome | 14.5116T | 14.3498T | 1.1150% |
| ubi_only | 2039 | gdpNominal | 50.7541T | 49.4126T | 2.6431% |
| ubi_only | 2039 | gdpReal | 39.5475T | 37.7373T | 4.5772% |
| ubi_only | 2039 | consumption | 33.4681T | 32.3474T | 3.3487% |
| ubi_only | 2039 | investment | 10.7125T | 10.5219T | 1.7796% |
| ubi_only | 2039 | newJobWageIncome | 121.0784B | 119.7407B | 1.1048% |
| ubi_only | 2039 | potentialGDP | 40.8576T | 50.7240T | 24.1484% |
| ubi_only | 2039 | wageConsumption | 21.8013T | 21.5714T | 1.0547% |
| ubi_only | 2039 | assetConsumption | 5.0790T | 5.0224T | 1.1150% |
| ubi_only | 2039 | corporateProfits | 5.8886T | 5.7414T | 2.5008% |
| ubi_only | 2039 | traditionalCorporateProfits | 5.3428T | 5.1950T | 2.7664% |
| ubi_only | 2039 | moneySupply | 70.3478T | 119.6957T | 70.1483% |
| ubi_only | 2039 | maxNeutralTransfers | 978.4780B | 1.0480T | 7.1055% |
| ubi_only | 2040 | aggregateWageIncome | 18.9856T | 18.4203T | 2.9775% |
| ubi_only | 2040 | aggregateAssetIncome | 12.7244T | 12.3497T | 2.9447% |
| ubi_only | 2040 | totalIncome | 47.0187T | 46.0484T | 2.0637% |
| ubi_only | 2040 | gdpNominal | 40.5359T | 39.5166T | 2.5147% |
| ubi_only | 2040 | gdpReal | 33.4054T | 30.7757T | 7.8721% |
| ubi_only | 2040 | consumption | 24.5609T | 23.7805T | 3.1774% |
| ubi_only | 2040 | investment | 9.3096T | 9.1058T | 2.1895% |
| ubi_only | 2040 | newJobEmployment | 696.1787K | 663.3016K | 4.7225% |
| ubi_only | 2040 | newJobWageIncome | 68.6308B | 63.5435B | 7.4126% |
| ubi_only | 2040 | potentialGDP | 35.8838T | 42.0088T | 17.0693% |
| ubi_only | 2040 | wageConsumption | 13.9007T | 13.4778T | 3.0422% |
| ubi_only | 2040 | assetConsumption | 4.4535T | 4.3224T | 2.9447% |
| ubi_only | 2040 | corporateProfits | 5.0372T | 4.9284T | 2.1616% |
| ubi_only | 2040 | traditionalCorporateProfits | 4.0046T | 3.8899T | 2.8637% |
| ubi_only | 2040 | moneySupply | 73.7439T | 126.4879T | 71.5231% |
| ubi_only | 2040 | maxNeutralTransfers | 1.0817T | 1.9957T | 84.4860% |
| ubi_only | 2041 | aggregateWageIncome | 10.6081T | 10.3344T | 2.5800% |
| ubi_only | 2041 | aggregateAssetIncome | 10.7988T | 10.5008T | 2.7590% |
| ubi_only | 2041 | totalIncome | 37.1039T | 36.4993T | 1.6296% |
| ubi_only | 2041 | gdpNominal | 34.2065T | 33.8067T | 1.1688% |
| ubi_only | 2041 | gdpReal | 30.1041T | 27.1225T | 9.9045% |
| ubi_only | 2041 | consumption | 18.4314T | 18.2335T | 1.0737% |
| ubi_only | 2041 | investment | 8.8849T | 8.7172T | 1.8870% |
| ubi_only | 2041 | unrealizedAIOutput | 562.9821B | 604.5569B | 7.3847% |
| ubi_only | 2041 | aiGoodsAbsorbed | 3.8721T | 3.8306T | 1.0737% |
| ubi_only | 2041 | newJobEmployment | 478.2812K | 440.6302K | 7.8721% |
| ubi_only | 2041 | newJobWageIncome | 31.3034B | 28.1016B | 10.2282% |
| ubi_only | 2041 | potentialGDP | 34.5393T | 38.2418T | 10.7198% |
| ubi_only | 2041 | wageConsumption | 7.2249T | 7.0374T | 2.5948% |
| ubi_only | 2041 | assetConsumption | 3.7796T | 3.6753T | 2.7590% |
| ubi_only | 2041 | corporateProfits | 4.7188T | 4.6690T | 1.0554% |
| ubi_only | 2041 | traditionalCorporateProfits | 3.0115T | 2.9721T | 1.3085% |
| ubi_only | 2041 | moneySupply | 77.1536T | 133.3073T | 72.7816% |
| ubi_only | 2041 | maxNeutralTransfers | 1.1874T | 2.1396T | 80.1910% |
| ubi_only | 2042 | aggregateWageIncome | 6.9146T | 6.8089T | 1.5277% |
| ubi_only | 2042 | gdpReal | 29.6022T | 25.8863T | 12.5528% |
| ubi_only | 2042 | unrealizedAIOutput | 1.4696T | 1.4857T | 1.0958% |
| ubi_only | 2042 | newJobEmployment | 369.8867K | 333.2514K | 9.9045% |
| ubi_only | 2042 | newJobWageIncome | 18.0349B | 16.0258B | 11.1400% |
| ubi_only | 2042 | potentialGDP | 35.2433T | 36.6577T | 4.0134% |
| ubi_only | 2042 | wageConsumption | 4.4682T | 4.3965T | 1.6052% |
| ubi_only | 2042 | totalDemandSpilloverLoss | 524.0630K | 674.1158K | 28.6326% |
| ubi_only | 2042 | moneySupply | 80.5770T | 140.1539T | 73.9380% |
| ubi_only | 2042 | maxNeutralTransfers | 1.3662T | 2.3894T | 74.8943% |
| ubi_only | 2043 | aggregateWageIncome | 4.2330T | 4.1868T | 1.0922% |
| ubi_only | 2043 | gdpReal | 31.2272T | 26.3874T | 15.4985% |
| ubi_only | 2043 | newJobEmployment | 293.4626K | 256.6247K | 12.5528% |
| ubi_only | 2043 | newJobWageIncome | 10.8996B | 9.4559B | 13.2459% |
| ubi_only | 2043 | potentialGDP | 38.0154T | 36.7497T | 3.3295% |
| ubi_only | 2043 | wageConsumption | 2.5219T | 2.4910T | 1.2242% |
| ubi_only | 2043 | totalDemandSpilloverLoss | 3.8706M | 4.1268M | 6.6180% |
| ubi_only | 2043 | moneySupply | 84.0140T | 147.0280T | 75.0042% |
| ubi_only | 2043 | maxNeutralTransfers | 1.7437T | 2.9470T | 69.0031% |
| ubi_only | 2044 | gdpReal | 34.8811T | 28.3223T | 18.8033% |
| ubi_only | 2044 | newJobEmployment | 266.3894K | 225.1148K | 15.4941% |
| ubi_only | 2044 | newJobWageIncome | 8.5052B | 7.1838B | 15.5361% |
| ubi_only | 2044 | potentialGDP | 42.5036T | 37.5773T | 11.5901% |
| ubi_only | 2044 | moneySupply | 87.4648T | 153.9296T | 75.9903% |
| ubi_only | 2044 | maxNeutralTransfers | 2.3475T | 3.8120T | 62.3893% |
| ubi_only | 2045 | gdpReal | 40.2451T | 31.3297T | 22.1527% |
| ubi_only | 2045 | consumerWelfareIndex | 46.7062K | 36.3124K | 22.2536% |
| ubi_only | 2045 | newJobEmployment | 265.3529K | 215.5282K | 18.7768% |
| ubi_only | 2045 | newJobWageIncome | 7.9467B | 6.4484B | 18.8539% |
| ubi_only | 2045 | potentialGDP | 48.5373T | 38.8458T | 19.9672% |
| ubi_only | 2045 | moneySupply | 90.9294T | 160.8587T | 76.9051% |
| ubi_only | 2045 | maxNeutralTransfers | 2.9750T | 4.6312T | 55.6721% |
| ubi_only | 2046 | aggregateAssetIncome | 11.8811T | 11.5764T | 2.5646% |
| ubi_only | 2046 | totalIncome | 31.3816T | 31.0295T | 1.1219% |
| ubi_only | 2046 | gdpReal | 46.8613T | 34.9940T | 25.3244% |
| ubi_only | 2046 | consumerWelfareIndex | 53.6451K | 39.9933K | 25.4483% |
| ubi_only | 2046 | unrealizedAIOutput | 3.2243T | 3.2574T | 1.0249% |
| ubi_only | 2046 | newJobEmployment | 283.0741K | 220.3692K | 22.1514% |
| ubi_only | 2046 | newJobWageIncome | 8.3773B | 6.4934B | 22.4877% |
| ubi_only | 2046 | potentialGDP | 55.5522T | 39.9262T | 28.1284% |
| ubi_only | 2046 | assetConsumption | 4.1584T | 4.0517T | 2.5646% |
| ubi_only | 2046 | totalDemandSpilloverLoss | 4.6575M | 4.7626M | 2.2581% |
| ubi_only | 2046 | moneySupply | 94.4078T | 167.8156T | 77.7561% |
| ubi_only | 2046 | maxNeutralTransfers | 3.6968T | 5.5212T | 49.3486% |
| ubi_only | 2047 | aggregateAssetIncome | 12.6240T | 12.1264T | 3.9415% |
| ubi_only | 2047 | totalIncome | 32.1522T | 31.6003T | 1.7165% |
| ubi_only | 2047 | gdpReal | 54.4602T | 39.0516T | 28.2933% |
| ubi_only | 2047 | consumerWelfareIndex | 61.7586K | 44.2062K | 28.4209% |
| ubi_only | 2047 | unrealizedAIOutput | 3.2749T | 3.3123T | 1.1428% |
| ubi_only | 2047 | newJobEmployment | 309.6815K | 231.2317K | 25.3324% |
| ubi_only | 2047 | newJobWageIncome | 9.1511B | 6.7876B | 25.8277% |
| ubi_only | 2047 | potentialGDP | 63.4366T | 40.6775T | 35.8769% |
| ubi_only | 2047 | wageConsumption | 1.3771T | 1.3619T | 1.1035% |
| ubi_only | 2047 | assetConsumption | 4.4184T | 4.2443T | 3.9415% |
| ubi_only | 2047 | totalDemandSpilloverLoss | 3.5061M | 3.6692M | 4.6520% |
| ubi_only | 2047 | moneySupply | 97.9001T | 174.8003T | 78.5496% |
| ubi_only | 2047 | maxNeutralTransfers | 4.5163T | 6.4776T | 43.4285% |
| ubi_only | 2048 | aggregateWageIncome | 2.5321T | 2.5044T | 1.0947% |
| ubi_only | 2048 | aggregateAssetIncome | 13.0921T | 12.4345T | 5.0231% |
| ubi_only | 2048 | totalIncome | 32.6402T | 31.9265T | 2.1865% |
| ubi_only | 2048 | gdpReal | 63.1818T | 43.5287T | 31.1056% |
| ubi_only | 2048 | consumerWelfareIndex | 71.2160K | 48.9752K | 31.2301% |
| ubi_only | 2048 | unrealizedAIOutput | 3.3165T | 3.3534T | 1.1139% |
| ubi_only | 2048 | newJobEmployment | 342.2875K | 245.3782K | 28.3123% |
| ubi_only | 2048 | newJobWageIncome | 10.0475B | 7.1501B | 28.8372% |
| ubi_only | 2048 | potentialGDP | 72.3714T | 41.1640T | 43.1211% |
| ubi_only | 2048 | wageConsumption | 1.3395T | 1.3230T | 1.2347% |
| ubi_only | 2048 | assetConsumption | 4.5822T | 4.3521T | 5.0231% |
| ubi_only | 2048 | totalDemandSpilloverLoss | 2.7270M | 2.8985M | 6.2882% |
| ubi_only | 2048 | moneySupply | 101.4065T | 181.8129T | 79.2913% |
| ubi_only | 2048 | maxNeutralTransfers | 5.4444T | 7.5034T | 37.8195% |
| ubi_only | 2049 | aggregateWageIncome | 2.4970T | 2.4706T | 1.0559% |
| ubi_only | 2049 | aggregateAssetIncome | 13.4170T | 12.6148T | 5.9791% |
| ubi_only | 2049 | totalIncome | 32.9880T | 32.1310T | 2.5978% |
| ubi_only | 2049 | gdpReal | 73.3331T | 48.5435T | 33.8041% |
| ubi_only | 2049 | consumerWelfareIndex | 82.3075K | 54.3957K | 33.9116% |
| ubi_only | 2049 | unrealizedAIOutput | 3.3405T | 3.3739T | 1.0010% |
| ubi_only | 2049 | newJobEmployment | 384.4992K | 264.8985K | 31.1056% |
| ubi_only | 2049 | newJobWageIncome | 11.2006B | 7.6630B | 31.5843% |
| ubi_only | 2049 | potentialGDP | 82.6747T | 41.5061T | 49.7959% |
| ubi_only | 2049 | wageConsumption | 1.3135T | 1.2978T | 1.1947% |
| ubi_only | 2049 | assetConsumption | 4.6960T | 4.4152T | 5.9791% |
| ubi_only | 2049 | totalDemandSpilloverLoss | 2.3136M | 2.4726M | 6.8715% |
| ubi_only | 2049 | moneySupply | 104.9268T | 188.8536T | 79.9860% |
| ubi_only | 2049 | maxNeutralTransfers | 6.4682T | 8.5633T | 32.3918% |
| ubi_only | 2050 | aggregateWageIncome | 2.4814T | 2.4562T | 1.0157% |
| ubi_only | 2050 | aggregateAssetIncome | 13.6593T | 12.7284T | 6.8147% |
| ubi_only | 2050 | totalIncome | 33.2628T | 32.2785T | 2.9591% |
| ubi_only | 2050 | gdpReal | 85.2068T | 54.1913T | 36.4002% |
| ubi_only | 2050 | consumerWelfareIndex | 95.2658K | 60.5123K | 36.4805% |
| ubi_only | 2050 | newJobEmployment | 438.1529K | 290.0393K | 33.8041% |
| ubi_only | 2050 | newJobWageIncome | 12.6998B | 8.3522B | 34.2339% |
| ubi_only | 2050 | potentialGDP | 94.6558T | 41.7811T | 55.8599% |
| ubi_only | 2050 | wageConsumption | 1.3014T | 1.2864T | 1.1584% |
| ubi_only | 2050 | assetConsumption | 4.7807T | 4.4550T | 6.8147% |
| ubi_only | 2050 | totalDemandSpilloverLoss | 2.0768M | 2.2151M | 6.6626% |
| ubi_only | 2050 | moneySupply | 108.4612T | 195.9225T | 80.6382% |
| ubi_only | 2050 | maxNeutralTransfers | 7.6114T | 9.6817T | 27.1996% |
| ubi_phased | 2026 | potentialGDP | 32.1442T | 32.9900T | 2.6313% |
| ubi_phased | 2027 | potentialGDP | 33.1365T | 34.9033T | 5.3318% |
| ubi_phased | 2028 | potentialGDP | 33.8511T | 36.5942T | 8.1033% |
| ubi_phased | 2029 | potentialGDP | 34.3152T | 38.0719T | 10.9478% |
| ubi_phased | 2030 | potentialGDP | 34.6034T | 39.4019T | 13.8672% |
| ubi_phased | 2031 | potentialGDP | 34.7788T | 40.6437T | 16.8633% |
| ubi_phased | 2032 | aiAdditionalOutput | 320.5461M | 328.9254M | 2.6141% |
| ubi_phased | 2032 | aiInvestmentBoost | 96.1638M | 98.6776M | 2.6141% |
| ubi_phased | 2032 | aiNetExportBoost | 32.0546M | 32.8925M | 2.6141% |
| ubi_phased | 2032 | aiConsumerGoodsPotential | 192.3277M | 197.3553M | 2.6141% |
| ubi_phased | 2032 | aiGoodsAbsorbed | 192.3277M | 197.3553M | 2.6141% |
| ubi_phased | 2032 | potentialGDP | 36.1215T | 43.3188T | 19.9253% |
| ubi_phased | 2032 | aiCorporateProfits | 80.1365M | 82.2314M | 2.6141% |
| ubi_phased | 2032 | aiGDPContribution | 320.5461M | 328.9254M | 2.6141% |
| ubi_phased | 2032 | moneySupply | 21.8223T | 22.6447T | 3.7683% |
| ubi_phased | 2032 | maxNeutralTransfers | 2.8168B | 2.1448B | 23.8578% |
| ubi_phased | 2033 | aiAdditionalOutput | 5.5776B | 5.7084B | 2.3461% |
| ubi_phased | 2033 | aiInvestmentBoost | 1.6733B | 1.7125B | 2.3461% |
| ubi_phased | 2033 | aiNetExportBoost | 557.7579M | 570.8435M | 2.3461% |
| ubi_phased | 2033 | aiConsumerGoodsPotential | 3.3465B | 3.4251B | 2.3461% |
| ubi_phased | 2033 | aiGoodsAbsorbed | 3.3465B | 3.4251B | 2.3461% |
| ubi_phased | 2033 | potentialGDP | 37.8915T | 46.5886T | 22.9526% |
| ubi_phased | 2033 | aiCorporateProfits | 1.3944B | 1.4271B | 2.3461% |
| ubi_phased | 2033 | aiGDPContribution | 5.5776B | 5.7084B | 2.3461% |
| ubi_phased | 2033 | moneySupply | 23.0608T | 25.1216T | 8.9363% |
| ubi_phased | 2033 | maxNeutralTransfers | 28.1062B | 19.7927B | 29.5788% |
| ubi_phased | 2034 | aiAdditionalOutput | 34.7859B | 36.0025B | 3.4974% |
| ubi_phased | 2034 | aiInvestmentBoost | 10.4358B | 10.8008B | 3.4974% |
| ubi_phased | 2034 | aiNetExportBoost | 3.4786B | 3.6003B | 3.4974% |
| ubi_phased | 2034 | aiConsumerGoodsPotential | 20.8715B | 21.6015B | 3.4974% |
| ubi_phased | 2034 | aiGoodsAbsorbed | 20.8715B | 21.6015B | 3.4974% |
| ubi_phased | 2034 | potentialGDP | 39.8212T | 50.0938T | 25.7969% |
| ubi_phased | 2034 | aiCorporateProfits | 8.6965B | 9.0006B | 3.4974% |
| ubi_phased | 2034 | aiGDPContribution | 34.7859B | 36.0025B | 3.4974% |
| ubi_phased | 2034 | moneySupply | 24.7187T | 28.4373T | 15.0439% |
| ubi_phased | 2034 | maxNeutralTransfers | 86.5323B | 56.1834B | 35.0723% |
| ubi_phased | 2035 | aiAdditionalOutput | 120.9332B | 123.7956B | 2.3669% |
| ubi_phased | 2035 | aiInvestmentBoost | 36.2800B | 37.1387B | 2.3669% |
| ubi_phased | 2035 | aiNetExportBoost | 12.0933B | 12.3796B | 2.3669% |
| ubi_phased | 2035 | aiConsumerGoodsPotential | 72.5599B | 74.2774B | 2.3669% |
| ubi_phased | 2035 | aiGoodsAbsorbed | 72.5599B | 74.2774B | 2.3669% |
| ubi_phased | 2035 | potentialGDP | 41.7182T | 53.4457T | 28.1114% |
| ubi_phased | 2035 | aiCorporateProfits | 30.2333B | 30.9489B | 2.3669% |
| ubi_phased | 2035 | aiGDPContribution | 120.9332B | 123.7956B | 2.3669% |
| ubi_phased | 2035 | moneySupply | 26.7993T | 32.5986T | 21.6397% |
| ubi_phased | 2035 | maxNeutralTransfers | 166.3399B | 100.4241B | 39.6272% |
| ubi_phased | 2036 | aiAdditionalOutput | 282.6292B | 286.5308B | 1.3805% |
| ubi_phased | 2036 | aiInvestmentBoost | 84.7888B | 85.9592B | 1.3805% |
| ubi_phased | 2036 | aiNetExportBoost | 28.2629B | 28.6531B | 1.3805% |
| ubi_phased | 2036 | aiConsumerGoodsPotential | 169.5775B | 171.9185B | 1.3805% |
| ubi_phased | 2036 | aiGoodsAbsorbed | 169.5775B | 171.9185B | 1.3805% |
| ubi_phased | 2036 | potentialGDP | 43.3213T | 56.0593T | 29.4036% |
| ubi_phased | 2036 | aiCorporateProfits | 70.6573B | 71.6327B | 1.3805% |
| ubi_phased | 2036 | aiGDPContribution | 282.6292B | 286.5308B | 1.3805% |
| ubi_phased | 2036 | moneySupply | 29.3060T | 37.6120T | 28.3423% |
| ubi_phased | 2036 | maxNeutralTransfers | 309.5722B | 183.4959B | 40.7260% |
| ubi_phased | 2037 | gdpNominal | 57.3294T | 55.5787T | 3.0537% |
| ubi_phased | 2037 | gdpReal | 44.0630T | 42.1601T | 4.3184% |
| ubi_phased | 2037 | consumption | 40.5617T | 38.8734T | 4.1623% |
| ubi_phased | 2037 | aiAdditionalOutput | 590.2807B | 596.6945B | 1.0866% |
| ubi_phased | 2037 | aiInvestmentBoost | 177.0842B | 179.0083B | 1.0866% |
| ubi_phased | 2037 | aiNetExportBoost | 59.0281B | 59.6694B | 1.0866% |
| ubi_phased | 2037 | aiConsumerGoodsPotential | 354.1684B | 358.0167B | 1.0866% |
| ubi_phased | 2037 | aiGoodsAbsorbed | 354.1684B | 358.0167B | 1.0866% |
| ubi_phased | 2037 | newJobWageIncome | 126.6794B | 125.3643B | 1.0382% |
| ubi_phased | 2037 | potentialGDP | 44.4171T | 55.9367T | 25.9350% |
| ubi_phased | 2037 | corporateProfits | 6.3889T | 6.1972T | 3.0001% |
| ubi_phased | 2037 | aiCorporateProfits | 147.5702B | 149.1736B | 1.0866% |
| ubi_phased | 2037 | traditionalCorporateProfits | 6.2413T | 6.0480T | 3.0967% |
| ubi_phased | 2037 | aiGDPContribution | 590.2807B | 596.6945B | 1.0866% |
| ubi_phased | 2037 | moneySupply | 32.2422T | 43.4845T | 34.8680% |
| ubi_phased | 2037 | maxNeutralTransfers | 491.4291B | 294.7595B | 40.0199% |
| ubi_phased | 2038 | aggregateWageIncome | 30.2996T | 29.3035T | 3.2877% |
| ubi_phased | 2038 | aggregateAssetIncome | 12.9757T | 12.5927T | 2.9514% |
| ubi_phased | 2038 | totalIncome | 57.8962T | 56.4826T | 2.4416% |
| ubi_phased | 2038 | gdpNominal | 54.8595T | 52.7921T | 3.7685% |
| ubi_phased | 2038 | gdpReal | 42.6884T | 39.9903T | 6.3205% |
| ubi_phased | 2038 | consumption | 37.8077T | 36.4062T | 3.7071% |
| ubi_phased | 2038 | investment | 10.8316T | 10.2082T | 5.7551% |
| ubi_phased | 2038 | governmentSpending | 7.5051T | 7.4188T | 1.1503% |
| ubi_phased | 2038 | aiAdditionalOutput | 1.0979T | 1.1110T | 1.1937% |
| ubi_phased | 2038 | aiInvestmentBoost | 329.3805B | 333.3122B | 1.1937% |
| ubi_phased | 2038 | aiNetExportBoost | 109.7935B | 111.1041B | 1.1937% |
| ubi_phased | 2038 | aiConsumerGoodsPotential | 658.7610B | 666.6244B | 1.1937% |
| ubi_phased | 2038 | aiGoodsAbsorbed | 658.7610B | 666.6244B | 1.1937% |
| ubi_phased | 2038 | newJobEmployment | 923.1454K | 882.5773K | 4.3946% |
| ubi_phased | 2038 | newJobWageIncome | 124.3693B | 115.1067B | 7.4477% |
| ubi_phased | 2038 | potentialGDP | 43.3472T | 53.4587T | 23.3268% |
| ubi_phased | 2038 | wageConsumption | 23.6667T | 22.8785T | 3.3305% |
| ubi_phased | 2038 | assetConsumption | 4.5415T | 4.4075T | 2.9514% |
| ubi_phased | 2038 | corporateProfits | 6.1883T | 5.9627T | 3.6452% |
| ubi_phased | 2038 | aiCorporateProfits | 274.4837B | 277.7602B | 1.1937% |
| ubi_phased | 2038 | traditionalCorporateProfits | 5.9138T | 5.6849T | 3.8698% |
| ubi_phased | 2038 | aiGDPContribution | 1.0979T | 1.1110T | 1.1937% |
| ubi_phased | 2038 | moneySupply | 35.6113T | 50.2227T | 41.0300% |
| ubi_phased | 2038 | maxNeutralTransfers | 747.0090B | 496.7019B | 33.5079% |
| ubi_phased | 2039 | aggregateWageIncome | 25.7132T | 24.6949T | 3.9601% |
| ubi_phased | 2039 | aggregateAssetIncome | 13.2192T | 12.6952T | 3.9638% |
| ubi_phased | 2039 | totalIncome | 53.6994T | 52.1223T | 2.9369% |
| ubi_phased | 2039 | gdpNominal | 47.5970T | 45.4427T | 4.5262% |
| ubi_phased | 2039 | gdpReal | 38.4635T | 34.7158T | 9.7435% |
| ubi_phased | 2039 | consumption | 31.1371T | 29.4563T | 5.3981% |
| ubi_phased | 2039 | investment | 10.1593T | 9.7318T | 4.2073% |
| ubi_phased | 2039 | governmentSpending | 7.4205T | 7.3233T | 1.3096% |
| ubi_phased | 2039 | newJobEmployment | 843.9328K | 790.1927K | 6.3678% |
| ubi_phased | 2039 | newJobWageIncome | 101.6025B | 91.4338B | 10.0084% |
| ubi_phased | 2039 | potentialGDP | 39.7521T | 46.7360T | 17.5688% |
| ubi_phased | 2039 | wageConsumption | 19.6485T | 18.8632T | 3.9967% |
| ubi_phased | 2039 | assetConsumption | 4.6267T | 4.4433T | 3.9638% |
| ubi_phased | 2039 | corporateProfits | 5.5363T | 5.3005T | 4.2600% |
| ubi_phased | 2039 | traditionalCorporateProfits | 4.9994T | 4.7616T | 4.7578% |
| ubi_phased | 2039 | moneySupply | 38.9939T | 56.9878T | 46.1454% |
| ubi_phased | 2039 | maxNeutralTransfers | 947.5980B | 839.4776B | 11.4099% |
| ubi_phased | 2040 | aggregateWageIncome | 18.1645T | 17.2626T | 4.9647% |
| ubi_phased | 2040 | aggregateAssetIncome | 12.1617T | 11.5614T | 4.9356% |
| ubi_phased | 2040 | totalIncome | 45.3259T | 43.7916T | 3.3851% |
| ubi_phased | 2040 | gdpNominal | 39.0128T | 37.4948T | 3.8911% |
| ubi_phased | 2040 | gdpReal | 33.3291T | 29.1982T | 12.3943% |
| ubi_phased | 2040 | consumption | 23.7887T | 22.7118T | 4.5272% |
| ubi_phased | 2040 | investment | 8.8135T | 8.4175T | 4.4938% |
| ubi_phased | 2040 | governmentSpending | 7.1718T | 7.0717T | 1.3965% |
| ubi_phased | 2040 | newJobEmployment | 684.3940K | 616.6038K | 9.9051% |
| ubi_phased | 2040 | newJobWageIncome | 63.9104B | 54.8328B | 14.2035% |
| ubi_phased | 2040 | potentialGDP | 35.7091T | 39.8913T | 11.7118% |
| ubi_phased | 2040 | wageConsumption | 13.3500T | 12.6758T | 5.0498% |
| ubi_phased | 2040 | assetConsumption | 4.2566T | 4.0465T | 4.9356% |
| ubi_phased | 2040 | corporateProfits | 4.8467T | 4.6836T | 3.3656% |
| ubi_phased | 2040 | traditionalCorporateProfits | 3.8551T | 3.6851T | 4.4102% |
| ubi_phased | 2040 | moneySupply | 42.3900T | 63.7801T | 50.4600% |
| ubi_phased | 2040 | maxNeutralTransfers | 1.0697T | 1.5431T | 44.2519% |
| ubi_phased | 2041 | aggregateWageIncome | 10.4934T | 10.0030T | 4.6737% |
| ubi_phased | 2041 | aggregateAssetIncome | 10.6312T | 10.2212T | 3.8562% |
| ubi_phased | 2041 | totalIncome | 36.5051T | 35.5760T | 2.5450% |
| ubi_phased | 2041 | gdpNominal | 33.3466T | 32.7176T | 1.8862% |
| ubi_phased | 2041 | gdpReal | 30.4191T | 26.2440T | 13.7253% |
| ubi_phased | 2041 | consumption | 18.1498T | 17.7845T | 2.0129% |
| ubi_phased | 2041 | investment | 8.5519T | 8.3238T | 2.6673% |
| ubi_phased | 2041 | governmentSpending | 6.8779T | 6.7995T | 1.1394% |
| ubi_phased | 2041 | unrealizedAIOutput | 602.7490B | 682.6743B | 13.2601% |
| ubi_phased | 2041 | aiGoodsAbsorbed | 3.6942T | 3.6496T | 1.2073% |
| ubi_phased | 2041 | newJobEmployment | 485.2326K | 423.2550K | 12.7728% |
| ubi_phased | 2041 | newJobWageIncome | 30.9755B | 25.8595B | 16.5162% |
| ubi_phased | 2041 | potentialGDP | 34.7161T | 37.0499T | 6.7225% |
| ubi_phased | 2041 | wageConsumption | 7.1872T | 6.8396T | 4.8359% |
| ubi_phased | 2041 | assetConsumption | 3.7209T | 3.5774T | 3.8562% |
| ubi_phased | 2041 | corporateProfits | 4.5864T | 4.5142T | 1.5728% |
| ubi_phased | 2041 | traditionalCorporateProfits | 2.9467T | 2.8798T | 2.2694% |
| ubi_phased | 2041 | moneySupply | 45.7997T | 70.5995T | 54.1482% |
| ubi_phased | 2041 | maxNeutralTransfers | 1.1967T | 2.0674T | 72.7536% |
| ubi_phased | 2042 | aggregateWageIncome | 6.7041T | 6.5316T | 2.5731% |
| ubi_phased | 2042 | aggregateAssetIncome | 9.3572T | 9.2603T | 1.0356% |
| ubi_phased | 2042 | gdpReal | 30.0311T | 25.3023T | 15.7462% |
| ubi_phased | 2042 | unrealizedAIOutput | 1.5561T | 1.5869T | 1.9824% |
| ubi_phased | 2042 | newJobEmployment | 373.7572K | 322.4580K | 13.7253% |
| ubi_phased | 2042 | newJobWageIncome | 17.7120B | 14.9338B | 15.6851% |
| ubi_phased | 2042 | wageConsumption | 4.3272T | 4.2095T | 2.7206% |
| ubi_phased | 2042 | assetConsumption | 3.2750T | 3.2411T | 1.0356% |
| ubi_phased | 2042 | totalDemandSpilloverLoss | 802.4092K | 1.1096M | 38.2848% |
| ubi_phased | 2042 | moneySupply | 49.2231T | 77.4461T | 57.3371% |
| ubi_phased | 2042 | maxNeutralTransfers | 1.3860T | 2.3355T | 68.5076% |
| ubi_phased | 2043 | aggregateWageIncome | 4.0487T | 3.9982T | 1.2469% |
| ubi_phased | 2043 | gdpReal | 31.7573T | 25.9023T | 18.4366% |
| ubi_phased | 2043 | newJobEmployment | 297.7141K | 250.8355K | 15.7462% |
| ubi_phased | 2043 | newJobWageIncome | 10.6978B | 8.9329B | 16.4971% |
| ubi_phased | 2043 | potentialGDP | 38.5455T | 36.2041T | 6.0744% |
| ubi_phased | 2043 | wageConsumption | 2.4002T | 2.3665T | 1.4027% |
| ubi_phased | 2043 | totalDemandSpilloverLoss | 4.9545M | 5.2524M | 6.0133% |
| ubi_phased | 2043 | moneySupply | 52.6601T | 84.3202T | 60.1216% |
| ubi_phased | 2043 | maxNeutralTransfers | 1.7733T | 2.8928T | 63.1267% |
| ubi_phased | 2044 | aggregateAssetIncome | 9.6160T | 9.7178T | 1.0591% |
| ubi_phased | 2044 | gdpReal | 35.5170T | 27.8210T | 21.6686% |
| ubi_phased | 2044 | newJobEmployment | 270.9186K | 220.9934K | 18.4281% |
| ubi_phased | 2044 | newJobWageIncome | 8.4152B | 6.8740B | 18.3144% |
| ubi_phased | 2044 | potentialGDP | 43.1393T | 37.0519T | 14.1111% |
| ubi_phased | 2044 | assetConsumption | 3.3656T | 3.4012T | 1.0591% |
| ubi_phased | 2044 | moneySupply | 56.1109T | 91.2217T | 62.5741% |
| ubi_phased | 2044 | maxNeutralTransfers | 2.3902T | 3.7444T | 56.6547% |
| ubi_phased | 2045 | gdpReal | 40.9931T | 30.7551T | 24.9749% |
| ubi_phased | 2045 | consumerWelfareIndex | 47.5688K | 35.6456K | 25.0652% |
| ubi_phased | 2045 | newJobEmployment | 270.2345K | 211.7919K | 21.6266% |
| ubi_phased | 2045 | newJobWageIncome | 7.8939B | 6.1888B | 21.5999% |
| ubi_phased | 2045 | potentialGDP | 49.2836T | 38.2874T | 22.3120% |
| ubi_phased | 2045 | moneySupply | 59.5754T | 98.1509T | 64.7506% |
| ubi_phased | 2045 | maxNeutralTransfers | 3.0301T | 4.5455T | 50.0147% |
| ubi_phased | 2046 | aggregateAssetIncome | 11.7050T | 11.3766T | 2.8057% |
| ubi_phased | 2046 | totalIncome | 30.8436T | 30.4649T | 1.2276% |
| ubi_phased | 2046 | gdpReal | 47.7362T | 34.3319T | 28.0800% |
| ubi_phased | 2046 | consumerWelfareIndex | 54.6313K | 39.2189K | 28.2117% |
| ubi_phased | 2046 | unrealizedAIOutput | 3.3248T | 3.3615T | 1.1037% |
| ubi_phased | 2046 | newJobEmployment | 288.3384K | 216.3323K | 24.9728% |
| ubi_phased | 2046 | newJobWageIncome | 8.3293B | 6.2218B | 25.3025% |
| ubi_phased | 2046 | potentialGDP | 56.4270T | 39.3415T | 30.2790% |
| ubi_phased | 2046 | assetConsumption | 4.0968T | 3.9818T | 2.8057% |
| ubi_phased | 2046 | totalDemandSpilloverLoss | 5.3044M | 5.4066M | 1.9270% |
| ubi_phased | 2046 | moneySupply | 63.0539T | 105.1078T | 66.6952% |
| ubi_phased | 2046 | maxNeutralTransfers | 3.7658T | 5.4166T | 43.8358% |
| ubi_phased | 2047 | aggregateWageIncome | 2.4992T | 2.4715T | 1.1088% |
| ubi_phased | 2047 | aggregateAssetIncome | 12.4127T | 11.8764T | 4.3207% |
| ubi_phased | 2047 | totalIncome | 31.5812T | 30.9856T | 1.8859% |
| ubi_phased | 2047 | gdpReal | 55.4747T | 38.3040T | 30.9522% |
| ubi_phased | 2047 | consumerWelfareIndex | 62.8803K | 43.3273K | 31.0956% |
| ubi_phased | 2047 | unrealizedAIOutput | 3.3809T | 3.4238T | 1.2684% |
| ubi_phased | 2047 | newJobEmployment | 315.4669K | 226.8644K | 28.0861% |
| ubi_phased | 2047 | newJobWageIncome | 9.1024B | 6.4968B | 28.6263% |
| ubi_phased | 2047 | potentialGDP | 64.4510T | 40.0771T | 37.8178% |
| ubi_phased | 2047 | wageConsumption | 1.3293T | 1.3128T | 1.2459% |
| ubi_phased | 2047 | assetConsumption | 4.3444T | 4.1567T | 4.3207% |
| ubi_phased | 2047 | totalDemandSpilloverLoss | 4.1250M | 4.3081M | 4.4394% |
| ubi_phased | 2047 | moneySupply | 66.5462T | 112.0925T | 68.4430% |
| ubi_phased | 2047 | maxNeutralTransfers | 4.6004T | 6.3534T | 38.1071% |
| ubi_phased | 2048 | aggregateWageIncome | 2.4523T | 2.4215T | 1.2572% |
| ubi_phased | 2048 | aggregateAssetIncome | 12.8711T | 12.1745T | 5.4123% |
| ubi_phased | 2048 | totalIncome | 32.0614T | 31.3031T | 2.3649% |
| ubi_phased | 2048 | gdpReal | 64.3646T | 42.7016T | 33.6566% |
| ubi_phased | 2048 | consumerWelfareIndex | 72.5146K | 48.0052K | 33.7993% |
| ubi_phased | 2048 | unrealizedAIOutput | 3.4253T | 3.4678T | 1.2420% |
| ubi_phased | 2048 | newJobEmployment | 348.6679K | 240.6899K | 30.9687% |
| ubi_phased | 2048 | newJobWageIncome | 9.9954B | 6.8417B | 31.5515% |
| ubi_phased | 2048 | potentialGDP | 73.5542T | 40.5631T | 44.8528% |
| ubi_phased | 2048 | wageConsumption | 1.2935T | 1.2752T | 1.4153% |
| ubi_phased | 2048 | assetConsumption | 4.5049T | 4.2611T | 5.4123% |
| ubi_phased | 2048 | totalDemandSpilloverLoss | 3.3288M | 3.5265M | 5.9380% |
| ubi_phased | 2048 | moneySupply | 70.0526T | 119.1051T | 70.0225% |
| ubi_phased | 2048 | maxNeutralTransfers | 5.5462T | 7.3606T | 32.7134% |
| ubi_phased | 2049 | aggregateWageIncome | 2.4193T | 2.3899T | 1.2128% |
| ubi_phased | 2049 | aggregateAssetIncome | 13.1903T | 12.3527T | 6.3502% |
| ubi_phased | 2049 | totalIncome | 32.4053T | 31.5075T | 2.7705% |
| ubi_phased | 2049 | gdpReal | 74.7165T | 47.6329T | 36.2485% |
| ubi_phased | 2049 | consumerWelfareIndex | 83.8159K | 53.3282K | 36.3746% |
| ubi_phased | 2049 | unrealizedAIOutput | 3.4511T | 3.4898T | 1.1213% |
| ubi_phased | 2049 | newJobEmployment | 391.6972K | 259.8651K | 33.6566% |
| ubi_phased | 2049 | newJobWageIncome | 11.1464B | 7.3357B | 34.1882% |
| ubi_phased | 2049 | potentialGDP | 84.0581T | 40.9095T | 51.3319% |
| ubi_phased | 2049 | wageConsumption | 1.2690T | 1.2516T | 1.3698% |
| ubi_phased | 2049 | assetConsumption | 4.6166T | 4.3234T | 6.3502% |
| ubi_phased | 2049 | totalDemandSpilloverLoss | 2.8997M | 3.0826M | 6.3071% |
| ubi_phased | 2049 | moneySupply | 73.5729T | 126.1458T | 71.4569% |
| ubi_phased | 2049 | maxNeutralTransfers | 6.5902T | 8.4027T | 27.5030% |
| ubi_phased | 2050 | aggregateWageIncome | 2.4051T | 2.3773T | 1.1571% |
| ubi_phased | 2050 | aggregateAssetIncome | 13.4289T | 12.4671T | 7.1624% |
| ubi_phased | 2050 | totalIncome | 32.6776T | 31.6572T | 3.1225% |
| ubi_phased | 2050 | gdpReal | 86.8240T | 53.1851T | 38.7438% |
| ubi_phased | 2050 | consumerWelfareIndex | 97.0195K | 59.3364K | 38.8407% |
| ubi_phased | 2050 | newJobEmployment | 446.4187K | 284.5986K | 36.2485% |
| ubi_phased | 2050 | newJobWageIncome | 12.6436B | 8.0006B | 36.7223% |
| ubi_phased | 2050 | potentialGDP | 96.2731T | 41.1875T | 57.2180% |
| ubi_phased | 2050 | wageConsumption | 1.2578T | 1.2413T | 1.3169% |
| ubi_phased | 2050 | assetConsumption | 4.7001T | 4.3635T | 7.1624% |
| ubi_phased | 2050 | totalDemandSpilloverLoss | 2.6526M | 2.8114M | 5.9837% |
| ubi_phased | 2050 | moneySupply | 77.1073T | 133.2147T | 72.7652% |
| ubi_phased | 2050 | maxNeutralTransfers | 7.7559T | 9.5019T | 22.5124% |
| ai_fund_only | 2026 | potentialGDP | 32.1442T | 32.9900T | 2.6313% |
| ai_fund_only | 2027 | potentialGDP | 33.1365T | 34.9033T | 5.3318% |
| ai_fund_only | 2028 | potentialGDP | 33.8511T | 36.5942T | 8.1033% |
| ai_fund_only | 2029 | potentialGDP | 34.3152T | 38.0719T | 10.9478% |
| ai_fund_only | 2030 | potentialGDP | 34.8419T | 39.6735T | 13.8672% |
| ai_fund_only | 2031 | potentialGDP | 35.2650T | 41.2118T | 16.8633% |
| ai_fund_only | 2032 | aiAdditionalOutput | 320.5461M | 330.6360M | 3.1477% |
| ai_fund_only | 2032 | aiInvestmentBoost | 96.1638M | 99.1908M | 3.1477% |
| ai_fund_only | 2032 | aiNetExportBoost | 32.0546M | 33.0636M | 3.1477% |
| ai_fund_only | 2032 | aiConsumerGoodsPotential | 192.3277M | 198.3816M | 3.1477% |
| ai_fund_only | 2032 | aiGoodsAbsorbed | 192.3277M | 198.3816M | 3.1477% |
| ai_fund_only | 2032 | potentialGDP | 35.5871T | 42.6779T | 19.9252% |
| ai_fund_only | 2032 | aiCorporateProfits | 80.1365M | 82.6590M | 3.1477% |
| ai_fund_only | 2032 | aiGDPContribution | 320.5461M | 330.6360M | 3.1477% |
| ai_fund_only | 2032 | maxNeutralTransfers | 2.7751B | 2.1816B | 21.3856% |
| ai_fund_only | 2033 | aiAdditionalOutput | 5.5776B | 5.7386B | 2.8864% |
| ai_fund_only | 2033 | aiInvestmentBoost | 1.6733B | 1.7216B | 2.8864% |
| ai_fund_only | 2033 | aiNetExportBoost | 557.7579M | 573.8571M | 2.8864% |
| ai_fund_only | 2033 | aiConsumerGoodsPotential | 3.3465B | 3.4431B | 2.8864% |
| ai_fund_only | 2033 | aiGoodsAbsorbed | 3.3465B | 3.4431B | 2.8864% |
| ai_fund_only | 2033 | potentialGDP | 35.8639T | 44.0954T | 22.9523% |
| ai_fund_only | 2033 | aiCorporateProfits | 1.3944B | 1.4346B | 2.8864% |
| ai_fund_only | 2033 | aiGDPContribution | 5.5776B | 5.7386B | 2.8864% |
| ai_fund_only | 2033 | maxNeutralTransfers | 26.6021B | 20.1660B | 24.1937% |
| ai_fund_only | 2034 | aiAdditionalOutput | 34.7859B | 35.5073B | 2.0738% |
| ai_fund_only | 2034 | aiInvestmentBoost | 10.4358B | 10.6522B | 2.0738% |
| ai_fund_only | 2034 | aiNetExportBoost | 3.4786B | 3.5507B | 2.0738% |
| ai_fund_only | 2034 | aiConsumerGoodsPotential | 20.8715B | 21.3044B | 2.0738% |
| ai_fund_only | 2034 | aiGoodsAbsorbed | 20.8715B | 21.3044B | 2.0738% |
| ai_fund_only | 2034 | potentialGDP | 36.1603T | 45.4877T | 25.7944% |
| ai_fund_only | 2034 | aiCorporateProfits | 8.6965B | 8.8768B | 2.0738% |
| ai_fund_only | 2034 | aiGDPContribution | 34.7859B | 35.5073B | 2.0738% |
| ai_fund_only | 2034 | maxNeutralTransfers | 78.5731B | 56.7991B | 27.7117% |
| ai_fund_only | 2035 | aiAdditionalOutput | 120.9332B | 122.5150B | 1.3080% |
| ai_fund_only | 2035 | aiInvestmentBoost | 36.2800B | 36.7545B | 1.3080% |
| ai_fund_only | 2035 | aiNetExportBoost | 12.0933B | 12.2515B | 1.3080% |
| ai_fund_only | 2035 | aiConsumerGoodsPotential | 72.5599B | 73.5090B | 1.3080% |
| ai_fund_only | 2035 | aiGoodsAbsorbed | 72.5599B | 73.5090B | 1.3080% |
| ai_fund_only | 2035 | potentialGDP | 36.3282T | 46.5327T | 28.0897% |
| ai_fund_only | 2035 | aiCorporateProfits | 30.2333B | 30.6288B | 1.3080% |
| ai_fund_only | 2035 | aiGDPContribution | 120.9332B | 122.5150B | 1.3080% |
| ai_fund_only | 2035 | maxNeutralTransfers | 144.8114B | 102.7559B | 29.0415% |
| ai_fund_only | 2036 | potentialGDP | 36.1693T | 46.7467T | 29.2443% |
| ai_fund_only | 2036 | maxNeutralTransfers | 258.2634B | 187.9749B | 27.2158% |
| ai_fund_only | 2037 | gdpNominal | 45.7247T | 44.2904T | 3.1367% |
| ai_fund_only | 2037 | gdpReal | 35.2470T | 33.5910T | 4.6984% |
| ai_fund_only | 2037 | consumption | 31.1969T | 29.8110T | 4.4423% |
| ai_fund_only | 2037 | newJobWageIncome | 87.9009B | 86.9242B | 1.1111% |
| ai_fund_only | 2037 | potentialGDP | 35.6012T | 44.6460T | 25.4058% |
| ai_fund_only | 2037 | corporateProfits | 5.1124T | 4.9549T | 3.0796% |
| ai_fund_only | 2037 | traditionalCorporateProfits | 4.9648T | 4.8068T | 3.1829% |
| ai_fund_only | 2037 | maxNeutralTransfers | 393.1061B | 305.6400B | 22.2500% |
| ai_fund_only | 2038 | aggregateWageIncome | 24.0863T | 23.3141T | 3.2058% |
| ai_fund_only | 2038 | aggregateAssetIncome | 11.2703T | 10.9177T | 3.1286% |
| ai_fund_only | 2038 | totalIncome | 43.2201T | 42.0754T | 2.6485% |
| ai_fund_only | 2038 | gdpNominal | 41.8103T | 40.2008T | 3.8496% |
| ai_fund_only | 2038 | gdpReal | 32.7571T | 30.4393T | 7.0755% |
| ai_fund_only | 2038 | consumption | 27.4019T | 26.3132T | 3.9729% |
| ai_fund_only | 2038 | investment | 8.3196T | 7.8277T | 5.9133% |
| ai_fund_only | 2038 | newJobEmployment | 738.4464K | 703.7217K | 4.7024% |
| ai_fund_only | 2038 | newJobWageIncome | 79.1501B | 73.0244B | 7.7393% |
| ai_fund_only | 2038 | potentialGDP | 33.4158T | 40.8600T | 22.2773% |
| ai_fund_only | 2038 | wageConsumption | 18.8012T | 18.1960T | 3.2193% |
| ai_fund_only | 2038 | assetConsumption | 3.6216T | 3.4982T | 3.4076% |
| ai_fund_only | 2038 | corporateProfits | 4.7528T | 4.5759T | 3.7231% |
| ai_fund_only | 2038 | traditionalCorporateProfits | 4.4784T | 4.3012T | 3.9552% |
| ai_fund_only | 2038 | maxNeutralTransfers | 573.2190B | 518.9595B | 9.4658% |
| ai_fund_only | 2039 | totalUnemployment | 21.3762M | 21.6909M | 1.4722% |
| ai_fund_only | 2039 | aggregateWageIncome | 19.4529T | 18.5891T | 4.4404% |
| ai_fund_only | 2039 | aggregateAssetIncome | 10.9907T | 10.5902T | 3.6435% |
| ai_fund_only | 2039 | totalIncome | 38.4302T | 37.1513T | 3.3277% |
| ai_fund_only | 2039 | gdpNominal | 35.0548T | 33.3157T | 4.9610% |
| ai_fund_only | 2039 | gdpReal | 28.6772T | 25.4474T | 11.2626% |
| ai_fund_only | 2039 | consumption | 21.3346T | 19.9235T | 6.6138% |
| ai_fund_only | 2039 | investment | 7.5622T | 7.2608T | 3.9862% |
| ai_fund_only | 2039 | governmentSpending | 6.9574T | 6.8875T | 1.0047% |
| ai_fund_only | 2039 | aiAdditionalOutput | 2.1776T | 2.2191T | 1.9074% |
| ai_fund_only | 2039 | aiInvestmentBoost | 653.2742B | 665.7348B | 1.9074% |
| ai_fund_only | 2039 | aiNetExportBoost | 217.7581B | 221.9116B | 1.9074% |
| ai_fund_only | 2039 | aiConsumerGoodsPotential | 1.3065T | 1.3315T | 1.9074% |
| ai_fund_only | 2039 | unrealizedAIOutput | 0.000000 | 74.9034B | 100.0000% |
| ai_fund_only | 2039 | aiGoodsAbsorbed | 1.3065T | 1.2566T | 3.8255% |
| ai_fund_only | 2039 | newJobEmployment | 646.3745K | 599.0722K | 7.3181% |
| ai_fund_only | 2039 | newJobWageIncome | 59.0358B | 52.4316B | 11.1868% |
| ai_fund_only | 2039 | potentialGDP | 29.9837T | 34.6472T | 15.5534% |
| ai_fund_only | 2039 | wageConsumption | 14.8438T | 14.1686T | 4.5491% |
| ai_fund_only | 2039 | assetConsumption | 3.4753T | 3.3351T | 4.0329% |
| ai_fund_only | 2039 | corporateProfits | 4.1609T | 3.9649T | 4.7098% |
| ai_fund_only | 2039 | aiCorporateProfits | 544.3951B | 536.0531B | 1.5323% |
| ai_fund_only | 2039 | traditionalCorporateProfits | 3.6165T | 3.4289T | 5.1881% |
| ai_fund_only | 2039 | aiGDPContribution | 2.1776T | 2.1442T | 1.5323% |
| ai_fund_only | 2039 | maxNeutralTransfers | 709.0274B | 928.4275B | 30.9438% |
| ai_fund_only | 2040 | totalUnemployment | 32.8035M | 33.3276M | 1.5978% |
| ai_fund_only | 2040 | aggregateWageIncome | 13.0943T | 12.3185T | 5.9250% |
| ai_fund_only | 2040 | aggregateAssetIncome | 10.0146T | 9.5469T | 4.6709% |
| ai_fund_only | 2040 | totalIncome | 31.3150T | 30.0607T | 4.0051% |
| ai_fund_only | 2040 | gdpNominal | 28.7329T | 27.6290T | 3.8419% |
| ai_fund_only | 2040 | gdpReal | 24.9865T | 21.5216T | 13.8668% |
| ai_fund_only | 2040 | consumption | 15.6409T | 14.8178T | 5.2628% |
| ai_fund_only | 2040 | investment | 6.8072T | 6.5527T | 3.7396% |
| ai_fund_only | 2040 | governmentSpending | 6.7261T | 6.6517T | 1.1052% |
| ai_fund_only | 2040 | aiAdditionalOutput | 4.1146T | 4.1733T | 1.4256% |
| ai_fund_only | 2040 | aiInvestmentBoost | 1.2344T | 1.2520T | 1.4256% |
| ai_fund_only | 2040 | aiNetExportBoost | 411.4636B | 417.3295B | 1.4256% |
| ai_fund_only | 2040 | aiConsumerGoodsPotential | 2.4688T | 2.5040T | 1.4256% |
| ai_fund_only | 2040 | unrealizedAIOutput | 639.7028B | 746.4552B | 16.6878% |
| ai_fund_only | 2040 | aiGoodsAbsorbed | 1.8291T | 1.7575T | 3.9122% |
| ai_fund_only | 2040 | newJobEmployment | 505.3524K | 446.7100K | 11.6043% |
| ai_fund_only | 2040 | newJobWageIncome | 34.3602B | 28.7045B | 16.4599% |
| ai_fund_only | 2040 | potentialGDP | 27.4552T | 30.1330T | 9.7530% |
| ai_fund_only | 2040 | wageConsumption | 9.5840T | 8.9984T | 6.1100% |
| ai_fund_only | 2040 | assetConsumption | 3.0779T | 2.9142T | 5.3192% |
| ai_fund_only | 2040 | corporateProfits | 3.6471T | 3.5189T | 3.5140% |
| ai_fund_only | 2040 | aiCorporateProfits | 868.7334B | 856.7099B | 1.3840% |
| ai_fund_only | 2040 | traditionalCorporateProfits | 2.7784T | 2.6622T | 4.1800% |
| ai_fund_only | 2040 | aiGDPContribution | 3.4749T | 3.4268T | 1.3840% |
| ai_fund_only | 2040 | totalDemandSpilloverLoss | 0.000000 | 98.2102K | 100.0000% |
| ai_fund_only | 2040 | maxNeutralTransfers | 808.4211B | 1.3970T | 72.8119% |
| ai_fund_only | 2041 | totalEmployment | 121.7973M | 118.7869M | 2.4717% |
| ai_fund_only | 2041 | totalUnemployment | 61.0088M | 64.0193M | 4.9344% |
| ai_fund_only | 2041 | aggregateWageIncome | 6.2319T | 5.6410T | 9.4822% |
| ai_fund_only | 2041 | aggregateAssetIncome | 9.1009T | 8.7965T | 3.3443% |
| ai_fund_only | 2041 | totalIncome | 24.0803T | 23.2222T | 3.5637% |
| ai_fund_only | 2041 | gdpNominal | 24.6758T | 24.0941T | 2.3574% |
| ai_fund_only | 2041 | gdpReal | 23.0553T | 19.3339T | 16.1411% |
| ai_fund_only | 2041 | consumption | 11.1825T | 10.8081T | 3.3482% |
| ai_fund_only | 2041 | investment | 6.9435T | 6.7620T | 2.6149% |
| ai_fund_only | 2041 | unrealizedAIOutput | 2.0859T | 2.1645T | 3.7711% |
| ai_fund_only | 2041 | aiGoodsAbsorbed | 2.3493T | 2.2706T | 3.3482% |
| ai_fund_only | 2041 | newJobEmployment | 357.7434K | 308.1358K | 13.8668% |
| ai_fund_only | 2041 | newJobWageIncome | 14.8774B | 11.9074B | 19.9630% |
| ai_fund_only | 2041 | potentialGDP | 27.4904T | 28.5292T | 3.7788% |
| ai_fund_only | 2041 | wageConsumption | 4.0827T | 3.6491T | 10.6198% |
| ai_fund_only | 2041 | assetConsumption | 2.6940T | 2.5875T | 3.9541% |
| ai_fund_only | 2041 | corporateProfits | 3.4572T | 3.3822T | 2.1694% |
| ai_fund_only | 2041 | aiCorporateProfits | 1.3265T | 1.3068T | 1.4825% |
| ai_fund_only | 2041 | traditionalCorporateProfits | 2.1307T | 2.0753T | 2.5971% |
| ai_fund_only | 2041 | aiGDPContribution | 5.3060T | 5.2274T | 1.4825% |
| ai_fund_only | 2041 | totalDemandSpilloverLoss | 9.3643M | 12.3252M | 31.6181% |
| ai_fund_only | 2041 | maxNeutralTransfers | 909.3860B | 1.5252T | 67.7177% |
| ai_fund_only | 2042 | totalEmployment | 99.6938M | 97.8780M | 1.8213% |
| ai_fund_only | 2042 | totalUnemployment | 83.8436M | 85.6594M | 2.1656% |
| ai_fund_only | 2042 | aggregateWageIncome | 3.3647T | 3.1621T | 6.0221% |
| ai_fund_only | 2042 | aggregateAssetIncome | 8.3989T | 8.2842T | 1.3655% |
| ai_fund_only | 2042 | totalIncome | 20.9496T | 20.6465T | 1.4469% |
| ai_fund_only | 2042 | gdpReal | 23.5006T | 19.1908T | 18.3392% |
| ai_fund_only | 2042 | consumption | 9.5215T | 9.3953T | 1.3252% |
| ai_fund_only | 2042 | unrealizedAIOutput | 3.0969T | 3.1306T | 1.0887% |
| ai_fund_only | 2042 | aiGoodsAbsorbed | 2.5442T | 2.5105T | 1.3252% |
| ai_fund_only | 2042 | newJobEmployment | 283.2781K | 237.5538K | 16.1411% |
| ai_fund_only | 2042 | newJobWageIncome | 8.1038B | 6.5119B | 19.6436% |
| ai_fund_only | 2042 | potentialGDP | 29.1417T | 28.6309T | 1.7528% |
| ai_fund_only | 2042 | wageConsumption | 1.9973T | 1.8613T | 6.8052% |
| ai_fund_only | 2042 | assetConsumption | 2.3746T | 2.3345T | 1.6903% |
| ai_fund_only | 2042 | totalDemandSpilloverLoss | 19.7516M | 21.5216M | 8.9615% |
| ai_fund_only | 2042 | maxNeutralTransfers | 1.0846T | 1.7714T | 63.3216% |
| ai_fund_only | 2043 | aggregateWageIncome | 2.2008T | 2.1584T | 1.9257% |
| ai_fund_only | 2043 | gdpReal | 26.3716T | 20.7890T | 21.1689% |
| ai_fund_only | 2043 | newJobEmployment | 232.9745K | 190.2488K | 18.3392% |
| ai_fund_only | 2043 | newJobWageIncome | 5.4580B | 4.4000B | 19.3832% |
| ai_fund_only | 2043 | potentialGDP | 33.1598T | 30.3885T | 8.3574% |
| ai_fund_only | 2043 | wageConsumption | 1.2114T | 1.1850T | 2.1772% |
| ai_fund_only | 2043 | totalDemandSpilloverLoss | 20.5134M | 20.9910M | 2.3284% |
| ai_fund_only | 2043 | maxNeutralTransfers | 1.4726T | 2.3217T | 57.6621% |
| ai_fund_only | 2044 | gdpReal | 31.0125T | 23.3787T | 24.6152% |
| ai_fund_only | 2044 | newJobEmployment | 225.0996K | 177.6354K | 21.0859% |
| ai_fund_only | 2044 | newJobWageIncome | 5.0671B | 3.9983B | 21.0928% |
| ai_fund_only | 2044 | potentialGDP | 38.6312T | 32.3450T | 16.2725% |
| ai_fund_only | 2044 | maxNeutralTransfers | 2.0846T | 3.1337T | 50.3280% |
| ai_fund_only | 2045 | aggregateAssetIncome | 11.7545T | 11.6095T | 1.2339% |
| ai_fund_only | 2045 | gdpReal | 36.9465T | 26.5589T | 28.1153% |
| ai_fund_only | 2045 | consumerWelfareIndex | 36.7977K | 26.3319K | 28.4413% |
| ai_fund_only | 2045 | newJobEmployment | 236.4465K | 178.2017K | 24.6334% |
| ai_fund_only | 2045 | newJobWageIncome | 5.3972B | 4.0616B | 24.7461% |
| ai_fund_only | 2045 | potentialGDP | 45.2156T | 34.1835T | 24.3989% |
| ai_fund_only | 2045 | assetConsumption | 3.2548T | 3.2041T | 1.5596% |
| ai_fund_only | 2045 | maxNeutralTransfers | 2.7285T | 3.9231T | 43.7847% |
| ai_fund_only | 2046 | aggregateAssetIncome | 12.9647T | 12.5843T | 2.9341% |
| ai_fund_only | 2046 | totalIncome | 24.5988T | 24.1847T | 1.6835% |
| ai_fund_only | 2046 | gdpReal | 43.7709T | 30.0264T | 31.4011% |
| ai_fund_only | 2046 | consumption | 9.9288T | 9.8253T | 1.0426% |
| ai_fund_only | 2046 | consumerWelfareIndex | 43.5855K | 29.7624K | 31.7149% |
| ai_fund_only | 2046 | aiGoodsAbsorbed | 4.0873T | 4.0448T | 1.0412% |
| ai_fund_only | 2046 | newJobEmployment | 259.9049K | 186.8140K | 28.1221% |
| ai_fund_only | 2046 | newJobWageIncome | 6.1241B | 4.3757B | 28.5500% |
| ai_fund_only | 2046 | potentialGDP | 52.4616T | 35.5006T | 32.3304% |
| ai_fund_only | 2046 | wageConsumption | 985.9471B | 975.4768B | 1.0620% |
| ai_fund_only | 2046 | assetConsumption | 3.5495T | 3.4164T | 3.7509% |
| ai_fund_only | 2046 | totalDemandSpilloverLoss | 11.7079M | 11.8743M | 1.4207% |
| ai_fund_only | 2046 | maxNeutralTransfers | 3.4526T | 4.7374T | 37.2114% |
| ai_fund_only | 2047 | aggregateWageIncome | 1.9261T | 1.8992T | 1.3983% |
| ai_fund_only | 2047 | aggregateAssetIncome | 14.0403T | 13.4867T | 3.9428% |
| ai_fund_only | 2047 | totalIncome | 25.7334T | 25.1390T | 2.3098% |
| ai_fund_only | 2047 | gdpReal | 51.6552T | 33.8743T | 34.4224% |
| ai_fund_only | 2047 | consumption | 10.3188T | 10.2149T | 1.0075% |
| ai_fund_only | 2047 | consumerWelfareIndex | 51.8896K | 33.8877K | 34.6927% |
| ai_fund_only | 2047 | aiGoodsAbsorbed | 4.3874T | 4.3434T | 1.0049% |
| ai_fund_only | 2047 | newJobEmployment | 289.3086K | 198.4056K | 31.4208% |
| ai_fund_only | 2047 | newJobWageIncome | 6.9578B | 4.7287B | 32.0375% |
| ai_fund_only | 2047 | potentialGDP | 60.6314T | 36.4832T | 39.8278% |
| ai_fund_only | 2047 | wageConsumption | 996.3460B | 980.6236B | 1.5780% |
| ai_fund_only | 2047 | assetConsumption | 3.7777T | 3.5840T | 5.1287% |
| ai_fund_only | 2047 | totalDemandSpilloverLoss | 9.5819M | 9.8294M | 2.5830% |
| ai_fund_only | 2047 | maxNeutralTransfers | 4.2829T | 5.6189T | 31.1921% |
| ai_fund_only | 2048 | aggregateWageIncome | 1.9435T | 1.9151T | 1.4637% |
| ai_fund_only | 2048 | aggregateAssetIncome | 15.0638T | 14.3573T | 4.6898% |
| ai_fund_only | 2048 | totalIncome | 26.8002T | 26.0519T | 2.7921% |
| ai_fund_only | 2048 | gdpReal | 61.0894T | 38.3223T | 37.2686% |
| ai_fund_only | 2048 | consumerWelfareIndex | 62.1129K | 38.8154K | 37.5084% |
| ai_fund_only | 2048 | newJobEmployment | 324.7132K | 212.8487K | 34.4502% |
| ai_fund_only | 2048 | newJobWageIncome | 7.8985B | 5.1292B | 35.0614% |
| ai_fund_only | 2048 | potentialGDP | 70.2788T | 37.3484T | 46.8568% |
| ai_fund_only | 2048 | wageConsumption | 1.0008T | 984.2065B | 1.6571% |
| ai_fund_only | 2048 | assetConsumption | 3.9655T | 3.7183T | 6.2353% |
| ai_fund_only | 2048 | totalDemandSpilloverLoss | 8.0137M | 8.2609M | 3.0841% |
| ai_fund_only | 2048 | maxNeutralTransfers | 5.2633T | 6.6059T | 25.5077% |
| ai_fund_only | 2049 | aggregateWageIncome | 1.9800T | 1.9536T | 1.3348% |
| ai_fund_only | 2049 | aggregateAssetIncome | 16.0925T | 15.2483T | 5.2457% |
| ai_fund_only | 2049 | totalIncome | 27.8802T | 26.9959T | 3.1719% |
| ai_fund_only | 2049 | gdpReal | 72.5252T | 43.5158T | 39.9991% |
| ai_fund_only | 2049 | consumerWelfareIndex | 74.7702K | 44.7179K | 40.1929% |
| ai_fund_only | 2049 | newJobEmployment | 371.7660K | 233.2140K | 37.2686% |
| ai_fund_only | 2049 | newJobWageIncome | 9.1701B | 5.7046B | 37.7912% |
| ai_fund_only | 2049 | potentialGDP | 81.8669T | 38.1838T | 53.3586% |
| ai_fund_only | 2049 | wageConsumption | 1.0180T | 1.0025T | 1.5179% |
| ai_fund_only | 2049 | assetConsumption | 4.1295T | 3.8341T | 7.1547% |
| ai_fund_only | 2049 | totalDemandSpilloverLoss | 6.8096M | 7.0310M | 3.2526% |
| ai_fund_only | 2049 | maxNeutralTransfers | 6.3969T | 7.6764T | 20.0018% |
| ai_fund_only | 2050 | aggregateWageIncome | 2.0348T | 2.0118T | 1.1337% |
| ai_fund_only | 2050 | aggregateAssetIncome | 17.1832T | 16.2142T | 5.6392% |
| ai_fund_only | 2050 | totalIncome | 29.0328T | 28.0261T | 3.4673% |
| ai_fund_only | 2050 | gdpReal | 86.3774T | 49.5619T | 42.6217% |
| ai_fund_only | 2050 | consumerWelfareIndex | 90.4585K | 51.7761K | 42.7625% |
| ai_fund_only | 2050 | newJobEmployment | 433.3264K | 259.9999K | 39.9991% |
| ai_fund_only | 2050 | newJobWageIncome | 10.8913B | 6.4885B | 40.4246% |
| ai_fund_only | 2050 | potentialGDP | 95.8265T | 39.0283T | 59.2719% |
| ai_fund_only | 2050 | wageConsumption | 1.0466T | 1.0331T | 1.2939% |
| ai_fund_only | 2050 | assetConsumption | 4.2859T | 3.9467T | 7.9131% |
| ai_fund_only | 2050 | totalDemandSpilloverLoss | 5.9098M | 6.0524M | 2.4121% |
| ai_fund_only | 2050 | maxNeutralTransfers | 7.7160T | 8.8546T | 14.7566% |
| min_wage_only | 2026 | potentialGDP | 32.1442T | 32.9900T | 2.6313% |
| min_wage_only | 2027 | potentialGDP | 33.1365T | 34.9033T | 5.3318% |
| min_wage_only | 2028 | gdpReal | 33.3396T | 34.0585T | 2.1563% |
| min_wage_only | 2028 | potentialGDP | 33.3396T | 36.8183T | 10.4343% |
| min_wage_only | 2029 | gdpReal | 33.4658T | 34.9257T | 4.3624% |
| min_wage_only | 2029 | newJobEmployment | 750.1402K | 766.3152K | 2.1563% |
| min_wage_only | 2029 | newJobWageIncome | 72.1927B | 73.7494B | 2.1563% |
| min_wage_only | 2029 | potentialGDP | 33.4658T | 38.7493T | 15.7878% |
| min_wage_only | 2030 | gdpReal | 33.5408T | 35.7609T | 6.6193% |
| min_wage_only | 2030 | newJobEmployment | 752.9794K | 785.8272K | 4.3624% |
| min_wage_only | 2030 | newJobWageIncome | 75.9602B | 79.2764B | 4.3657% |
| min_wage_only | 2030 | potentialGDP | 33.5408T | 40.7199T | 21.4044% |
| min_wage_only | 2031 | gdpReal | 33.5840T | 36.5822T | 8.9274% |
| min_wage_only | 2031 | newJobEmployment | 754.6670K | 804.6206K | 6.6193% |
| min_wage_only | 2031 | newJobWageIncome | 79.6785B | 84.9607B | 6.6293% |
| min_wage_only | 2031 | potentialGDP | 33.5840T | 42.7512T | 27.2961% |
| min_wage_only | 2032 | gdpReal | 33.6107T | 37.4046T | 11.2875% |
| min_wage_only | 2032 | aiAdditionalOutput | 320.5461M | 332.7445M | 3.8055% |
| min_wage_only | 2032 | aiInvestmentBoost | 96.1638M | 99.8233M | 3.8055% |
| min_wage_only | 2032 | aiNetExportBoost | 32.0546M | 33.2744M | 3.8055% |
| min_wage_only | 2032 | aiConsumerGoodsPotential | 192.3277M | 199.6467M | 3.8055% |
| min_wage_only | 2032 | aiGoodsAbsorbed | 192.3277M | 199.6467M | 3.8055% |
| min_wage_only | 2032 | newJobEmployment | 755.6211K | 823.0773K | 8.9272% |
| min_wage_only | 2032 | newJobWageIncome | 83.4190B | 90.8822B | 8.9466% |
| min_wage_only | 2032 | potentialGDP | 33.6109T | 44.8576T | 33.4614% |
| min_wage_only | 2032 | aiCorporateProfits | 80.1365M | 83.1861M | 3.8055% |
| min_wage_only | 2032 | aiGDPContribution | 320.5461M | 332.7445M | 3.8055% |
| min_wage_only | 2032 | maxNeutralTransfers | 2.6210B | 2.2165B | 15.4330% |
| min_wage_only | 2033 | totalUnemployment | 7.1044M | 7.0217M | 1.1643% |
| min_wage_only | 2033 | gdpReal | 33.6468T | 38.2582T | 13.7053% |
| min_wage_only | 2033 | aiAdditionalOutput | 5.5878B | 5.7949B | 3.7064% |
| min_wage_only | 2033 | aiInvestmentBoost | 1.6763B | 1.7385B | 3.7064% |
| min_wage_only | 2033 | aiNetExportBoost | 558.7826M | 579.4932M | 3.7064% |
| min_wage_only | 2033 | aiConsumerGoodsPotential | 3.3527B | 3.4770B | 3.7064% |
| min_wage_only | 2033 | aiGoodsAbsorbed | 3.3527B | 3.4770B | 3.7064% |
| min_wage_only | 2033 | newJobEmployment | 755.7612K | 841.0482K | 11.2849% |
| min_wage_only | 2033 | newJobWageIncome | 87.2056B | 97.0740B | 11.3162% |
| min_wage_only | 2033 | potentialGDP | 33.6501T | 47.0420T | 39.7975% |
| min_wage_only | 2033 | aiCorporateProfits | 1.3970B | 1.4487B | 3.7064% |
| min_wage_only | 2033 | aiGDPContribution | 5.5878B | 5.7949B | 3.7064% |
| min_wage_only | 2033 | maxNeutralTransfers | 24.9839B | 20.5692B | 17.6702% |
| min_wage_only | 2034 | totalUnemployment | 7.5005M | 7.4116M | 1.1847% |
| min_wage_only | 2034 | gdpReal | 33.7162T | 39.1720T | 16.1813% |
| min_wage_only | 2034 | consumerWelfareIndex | 65.8813K | 76.5468K | 16.1890% |
| min_wage_only | 2034 | aiAdditionalOutput | 34.8261B | 35.8252B | 2.8688% |
| min_wage_only | 2034 | aiInvestmentBoost | 10.4478B | 10.7476B | 2.8688% |
| min_wage_only | 2034 | aiNetExportBoost | 3.4826B | 3.5825B | 2.8688% |
| min_wage_only | 2034 | aiConsumerGoodsPotential | 20.8957B | 21.4951B | 2.8688% |
| min_wage_only | 2034 | aiGoodsAbsorbed | 20.8957B | 21.4951B | 2.8688% |
| min_wage_only | 2034 | newJobEmployment | 754.0648K | 857.2988K | 13.6903% |
| min_wage_only | 2034 | newJobWageIncome | 90.9686B | 103.4650B | 13.7370% |
| min_wage_only | 2034 | potentialGDP | 33.7371T | 49.3005T | 46.1314% |
| min_wage_only | 2034 | aiCorporateProfits | 8.7065B | 8.9563B | 2.8688% |
| min_wage_only | 2034 | aiGDPContribution | 34.8261B | 35.8252B | 2.8688% |
| min_wage_only | 2034 | maxNeutralTransfers | 73.3805B | 57.8166B | 21.2099% |
| min_wage_only | 2035 | totalUnemployment | 8.4797M | 8.3891M | 1.0684% |
| min_wage_only | 2035 | gdpReal | 33.6247T | 39.8879T | 18.6266% |
| min_wage_only | 2035 | consumerWelfareIndex | 65.1532K | 77.3230K | 18.6787% |
| min_wage_only | 2035 | aiAdditionalOutput | 121.0903B | 123.4104B | 1.9160% |
| min_wage_only | 2035 | aiInvestmentBoost | 36.3271B | 37.0231B | 1.9160% |
| min_wage_only | 2035 | aiNetExportBoost | 12.1090B | 12.3410B | 1.9160% |
| min_wage_only | 2035 | aiConsumerGoodsPotential | 72.6542B | 74.0462B | 1.9160% |
| min_wage_only | 2035 | aiGoodsAbsorbed | 72.6542B | 74.0462B | 1.9160% |
| min_wage_only | 2035 | newJobEmployment | 749.1461K | 870.1249K | 16.1489% |
| min_wage_only | 2035 | newJobWageIncome | 93.7391B | 109.0723B | 16.3573% |
| min_wage_only | 2035 | potentialGDP | 33.6974T | 51.2893T | 52.2056% |
| min_wage_only | 2035 | aiCorporateProfits | 30.2726B | 30.8526B | 1.9160% |
| min_wage_only | 2035 | aiGDPContribution | 121.0903B | 123.4104B | 1.9160% |
| min_wage_only | 2035 | maxNeutralTransfers | 134.5506B | 104.3892B | 22.4164% |
| min_wage_only | 2036 | totalUnemployment | 9.8904M | 9.7831M | 1.0848% |
| min_wage_only | 2036 | gdpReal | 33.1841T | 40.0366T | 20.6498% |
| min_wage_only | 2036 | consumerWelfareIndex | 63.5333K | 76.6737K | 20.6827% |
| min_wage_only | 2036 | aiAdditionalOutput | 283.1469B | 286.2448B | 1.0941% |
| min_wage_only | 2036 | aiInvestmentBoost | 84.9441B | 85.8735B | 1.0941% |
| min_wage_only | 2036 | aiNetExportBoost | 28.3147B | 28.6245B | 1.0941% |
| min_wage_only | 2036 | aiConsumerGoodsPotential | 169.8882B | 171.7469B | 1.0941% |
| min_wage_only | 2036 | aiGoodsAbsorbed | 169.8882B | 171.7469B | 1.0941% |
| min_wage_only | 2036 | newJobEmployment | 737.8354K | 875.0278K | 18.5939% |
| min_wage_only | 2036 | newJobWageIncome | 94.0667B | 111.8733B | 18.9297% |
| min_wage_only | 2036 | potentialGDP | 33.3540T | 52.4027T | 57.1105% |
| min_wage_only | 2036 | aiCorporateProfits | 70.7867B | 71.5612B | 1.0941% |
| min_wage_only | 2036 | aiGDPContribution | 283.1469B | 286.2448B | 1.0941% |
| min_wage_only | 2036 | maxNeutralTransfers | 238.7636B | 191.8441B | 19.6510% |
| min_wage_only | 2037 | gdpReal | 32.2801T | 39.3647T | 21.9472% |
| min_wage_only | 2037 | consumerWelfareIndex | 60.7968K | 74.1644K | 21.9874% |
| min_wage_only | 2037 | newJobEmployment | 714.4188K | 861.7219K | 20.6186% |
| min_wage_only | 2037 | newJobWageIncome | 90.4475B | 109.4230B | 20.9796% |
| min_wage_only | 2037 | potentialGDP | 32.6344T | 52.2511T | 60.1107% |
| min_wage_only | 2037 | maxNeutralTransfers | 360.3744B | 306.6753B | 14.9009% |
| min_wage_only | 2038 | gdpReal | 30.8981T | 37.7829T | 22.2821% |
| min_wage_only | 2038 | consumerWelfareIndex | 56.8464K | 69.5303K | 22.3126% |
| min_wage_only | 2038 | newJobEmployment | 676.0942K | 824.2018K | 21.9064% |
| min_wage_only | 2038 | newJobWageIncome | 82.1605B | 100.3081B | 22.0880% |
| min_wage_only | 2038 | potentialGDP | 31.5573T | 50.5446T | 60.1677% |
| min_wage_only | 2038 | maxNeutralTransfers | 542.4563B | 518.6910B | 4.3811% |
| min_wage_only | 2039 | gdpNominal | 44.1419T | 43.4372T | 1.5966% |
| min_wage_only | 2039 | gdpReal | 27.6053T | 33.1832T | 20.2059% |
| min_wage_only | 2039 | consumption | 27.1170T | 26.5399T | 2.1282% |
| min_wage_only | 2039 | newJobEmployment | 609.9743K | 745.7940K | 22.2665% |
| min_wage_only | 2039 | newJobWageIncome | 66.7173B | 81.4018B | 22.0100% |
| min_wage_only | 2039 | potentialGDP | 28.8988T | 44.7319T | 54.7881% |
| min_wage_only | 2039 | corporateProfits | 5.1574T | 5.0802T | 1.4977% |
| min_wage_only | 2039 | traditionalCorporateProfits | 4.6185T | 4.5407T | 1.6835% |
| min_wage_only | 2039 | maxNeutralTransfers | 681.8746B | 895.1505B | 31.2779% |
| min_wage_only | 2040 | aggregateWageIncome | 16.8055T | 16.5423T | 1.5663% |
| min_wage_only | 2040 | aggregateAssetIncome | 11.2515T | 11.0717T | 1.5982% |
| min_wage_only | 2040 | totalIncome | 38.1686T | 37.6409T | 1.3825% |
| min_wage_only | 2040 | gdpNominal | 37.3111T | 36.4761T | 2.2380% |
| min_wage_only | 2040 | gdpReal | 23.9446T | 28.4040T | 18.6237% |
| min_wage_only | 2040 | consumption | 21.1970T | 20.6321T | 2.6652% |
| min_wage_only | 2040 | investment | 8.3788T | 8.1747T | 2.4356% |
| min_wage_only | 2040 | governmentSpending | 8.4140T | 8.3297T | 1.0024% |
| min_wage_only | 2040 | unrealizedAIOutput | 0.000000 | 53.9779B | 100.0000% |
| min_wage_only | 2040 | aiGoodsAbsorbed | 2.3714T | 2.3245T | 1.9786% |
| min_wage_only | 2040 | newJobEmployment | 491.3822K | 590.2197K | 20.1142% |
| min_wage_only | 2040 | newJobWageIncome | 42.4677B | 50.2215B | 18.2580% |
| min_wage_only | 2040 | potentialGDP | 26.3160T | 38.8545T | 47.6459% |
| min_wage_only | 2040 | wageConsumption | 12.3440T | 12.1519T | 1.5569% |
| min_wage_only | 2040 | assetConsumption | 3.9380T | 3.8751T | 1.5982% |
| min_wage_only | 2040 | corporateProfits | 4.6575T | 4.5598T | 2.0990% |
| min_wage_only | 2040 | aiCorporateProfits | 988.0843B | 977.5302B | 1.0681% |
| min_wage_only | 2040 | traditionalCorporateProfits | 3.6695T | 3.5823T | 2.3766% |
| min_wage_only | 2040 | aiGDPContribution | 3.9523T | 3.9101T | 1.0681% |
| min_wage_only | 2040 | maxNeutralTransfers | 768.9302B | 1.6470T | 114.1915% |
| min_wage_only | 2041 | aggregateWageIncome | 10.1004T | 9.8104T | 2.8718% |
| min_wage_only | 2041 | aggregateAssetIncome | 10.2044T | 10.0180T | 1.8275% |
| min_wage_only | 2041 | totalIncome | 30.7613T | 30.2069T | 1.8023% |
| min_wage_only | 2041 | gdpNominal | 32.4700T | 32.0034T | 1.4371% |
| min_wage_only | 2041 | gdpReal | 21.4914T | 25.6717T | 19.4512% |
| min_wage_only | 2041 | consumption | 16.2459T | 15.9553T | 1.7890% |
| min_wage_only | 2041 | investment | 8.2438T | 8.1298T | 1.3825% |
| min_wage_only | 2041 | governmentSpending | 8.1801T | 8.0913T | 1.0856% |
| min_wage_only | 2041 | unrealizedAIOutput | 978.8591B | 1.0468T | 6.9431% |
| min_wage_only | 2041 | newJobEmployment | 350.3948K | 413.7360K | 18.0771% |
| min_wage_only | 2041 | newJobWageIncome | 21.4461B | 24.6832B | 15.0942% |
| min_wage_only | 2041 | potentialGDP | 25.7388T | 36.2897T | 40.9919% |
| min_wage_only | 2041 | wageConsumption | 6.9262T | 6.7186T | 2.9984% |
| min_wage_only | 2041 | assetConsumption | 3.5716T | 3.5063T | 1.8275% |
| min_wage_only | 2041 | corporateProfits | 4.4257T | 4.3740T | 1.1699% |
| min_wage_only | 2041 | traditionalCorporateProfits | 2.9007T | 2.8497T | 1.7574% |
| min_wage_only | 2041 | maxNeutralTransfers | 846.3180B | 2.0243T | 139.1885% |
| min_wage_only | 2042 | totalUnemployment | 66.2186M | 67.1759M | 1.4457% |
| min_wage_only | 2042 | aggregateWageIncome | 7.1153T | 6.9521T | 2.2930% |
| min_wage_only | 2042 | gdpReal | 20.8850T | 25.2406T | 20.8552% |
| min_wage_only | 2042 | unrealizedAIOutput | 1.9033T | 1.9369T | 1.7656% |
| min_wage_only | 2042 | newJobEmployment | 263.9002K | 315.2320K | 19.4512% |
| min_wage_only | 2042 | newJobWageIncome | 13.4369B | 15.8199B | 17.7346% |
| min_wage_only | 2042 | potentialGDP | 26.5265T | 35.8859T | 35.2831% |
| min_wage_only | 2042 | wageConsumption | 4.5652T | 4.4424T | 2.6902% |
| min_wage_only | 2042 | totalDemandSpilloverLoss | 2.0607M | 3.0693M | 48.9459% |
| min_wage_only | 2042 | maxNeutralTransfers | 965.4459B | 2.3336T | 141.7104% |
| min_wage_only | 2043 | aggregateWageIncome | 5.2872T | 5.2300T | 1.0814% |
| min_wage_only | 2043 | aggregateAssetIncome | 9.2156T | 9.3757T | 1.7376% |
| min_wage_only | 2043 | gdpReal | 21.5570T | 26.5127T | 22.9890% |
| min_wage_only | 2043 | newJobEmployment | 207.0220K | 250.1969K | 20.8552% |
| min_wage_only | 2043 | newJobWageIncome | 9.8509B | 11.8187B | 19.9766% |
| min_wage_only | 2043 | potentialGDP | 28.3454T | 36.8920T | 30.1514% |
| min_wage_only | 2043 | wageConsumption | 3.1155T | 3.0772T | 1.2288% |
| min_wage_only | 2043 | assetConsumption | 3.2255T | 3.2815T | 1.7376% |
| min_wage_only | 2043 | totalDemandSpilloverLoss | 6.1732M | 6.5398M | 5.9389% |
| min_wage_only | 2043 | maxNeutralTransfers | 1.2045T | 2.9628T | 145.9779% |
| min_wage_only | 2044 | aggregateAssetIncome | 9.8715T | 10.1958T | 3.2853% |
| min_wage_only | 2044 | gdpReal | 22.9643T | 28.8956T | 25.8284% |
| min_wage_only | 2044 | unrealizedAIOutput | 3.1884T | 3.1499T | 1.2075% |
| min_wage_only | 2044 | newJobEmployment | 183.9713K | 226.3447K | 23.0326% |
| min_wage_only | 2044 | newJobWageIncome | 8.6240B | 10.5998B | 22.9109% |
| min_wage_only | 2044 | potentialGDP | 30.5835T | 38.1822T | 24.8459% |
| min_wage_only | 2044 | assetConsumption | 3.4550T | 3.5685T | 3.2853% |
| min_wage_only | 2044 | maxNeutralTransfers | 1.5446T | 3.8839T | 151.4562% |
| min_wage_only | 2045 | aggregateAssetIncome | 10.8190T | 11.2281T | 3.7817% |
| min_wage_only | 2045 | totalIncome | 26.5988T | 26.9425T | 1.2921% |
| min_wage_only | 2045 | gdpReal | 24.7879T | 32.0384T | 29.2503% |
| min_wage_only | 2045 | consumption | 12.2609T | 12.4070T | 1.1908% |
| min_wage_only | 2045 | unrealizedAIOutput | 3.4685T | 3.4096T | 1.6981% |
| min_wage_only | 2045 | aiGoodsAbsorbed | 4.8053T | 4.8601T | 1.1412% |
| min_wage_only | 2045 | newJobEmployment | 175.0017K | 220.2913K | 25.8795% |
| min_wage_only | 2045 | newJobWageIncome | 8.2675B | 10.4330B | 26.1923% |
| min_wage_only | 2045 | potentialGDP | 33.0617T | 39.5251T | 19.5495% |
| min_wage_only | 2045 | assetConsumption | 3.7866T | 3.9298T | 3.7817% |
| min_wage_only | 2045 | totalDemandSpilloverLoss | 5.8673M | 5.7153M | 2.5898% |
| min_wage_only | 2045 | maxNeutralTransfers | 1.8309T | 4.7322T | 158.4542% |
| min_wage_only | 2046 | aggregateAssetIncome | 11.6700T | 12.0025T | 2.8488% |
| min_wage_only | 2046 | gdpReal | 26.7668T | 35.6958T | 33.3587% |
| min_wage_only | 2046 | consumption | 12.3795T | 12.5498T | 1.3759% |
| min_wage_only | 2046 | unrealizedAIOutput | 3.5945T | 3.5244T | 1.9505% |
| min_wage_only | 2046 | aiGoodsAbsorbed | 5.0962T | 5.1663T | 1.3761% |
| min_wage_only | 2046 | newJobEmployment | 174.3689K | 225.3693K | 29.2486% |
| min_wage_only | 2046 | newJobWageIncome | 8.3779B | 10.8708B | 29.7554% |
| min_wage_only | 2046 | potentialGDP | 35.4575T | 40.5600T | 14.3904% |
| min_wage_only | 2046 | assetConsumption | 4.0845T | 4.2009T | 2.8488% |
| min_wage_only | 2046 | totalDemandSpilloverLoss | 4.7309M | 4.5247M | 4.3590% |
| min_wage_only | 2046 | maxNeutralTransfers | 2.1114T | 5.6315T | 166.7212% |
| min_wage_only | 2047 | aggregateAssetIncome | 12.1138T | 12.3972T | 2.3394% |
| min_wage_only | 2047 | gdpReal | 28.7270T | 39.7220T | 38.2741% |
| min_wage_only | 2047 | consumption | 12.4296T | 12.6380T | 1.6773% |
| min_wage_only | 2047 | consumerWelfareIndex | 29.9942K | 41.9292K | 39.7910% |
| min_wage_only | 2047 | unrealizedAIOutput | 3.6913T | 3.6027T | 2.4003% |
| min_wage_only | 2047 | aiGoodsAbsorbed | 5.2849T | 5.3736T | 1.6784% |
| min_wage_only | 2047 | newJobEmployment | 176.9111K | 235.8990K | 33.3433% |
| min_wage_only | 2047 | newJobWageIncome | 8.6267B | 11.5560B | 33.9567% |
| min_wage_only | 2047 | potentialGDP | 37.7032T | 41.2296T | 9.3529% |
| min_wage_only | 2047 | assetConsumption | 4.2398T | 4.3390T | 2.3394% |
| min_wage_only | 2047 | totalDemandSpilloverLoss | 3.7421M | 3.5155M | 6.0533% |
| min_wage_only | 2047 | maxNeutralTransfers | 2.3820T | 6.5880T | 176.5797% |
| min_wage_only | 2048 | aggregateWageIncome | 4.2056T | 4.2483T | 1.0159% |
| min_wage_only | 2048 | aggregateAssetIncome | 12.4452T | 12.6732T | 1.8317% |
| min_wage_only | 2048 | gdpReal | 30.7145T | 44.2024T | 43.9135% |
| min_wage_only | 2048 | consumption | 12.4526T | 12.6967T | 1.9605% |
| min_wage_only | 2048 | consumerWelfareIndex | 31.8246K | 46.3659K | 45.6923% |
| min_wage_only | 2048 | unrealizedAIOutput | 3.7690T | 3.6628T | 2.8165% |
| min_wage_only | 2048 | aiGoodsAbsorbed | 5.4205T | 5.5269T | 1.9638% |
| min_wage_only | 2048 | newJobEmployment | 180.5760K | 249.6340K | 38.2432% |
| min_wage_only | 2048 | newJobWageIncome | 8.8659B | 12.3269B | 39.0367% |
| min_wage_only | 2048 | potentialGDP | 39.9040T | 41.6673T | 4.4189% |
| min_wage_only | 2048 | wageConsumption | 2.2189T | 2.2451T | 1.1800% |
| min_wage_only | 2048 | assetConsumption | 4.3558T | 4.4356T | 1.8317% |
| min_wage_only | 2048 | totalDemandSpilloverLoss | 3.0999M | 2.8357M | 8.5246% |
| min_wage_only | 2048 | maxNeutralTransfers | 2.6464T | 7.6184T | 187.8813% |
| min_wage_only | 2049 | aggregateWageIncome | 4.1783T | 4.2307T | 1.2551% |
| min_wage_only | 2049 | aggregateAssetIncome | 12.6677T | 12.8346T | 1.3178% |
| min_wage_only | 2049 | gdpReal | 32.8067T | 49.2403T | 50.0922% |
| min_wage_only | 2049 | consumption | 12.4656T | 12.7452T | 2.2426% |
| min_wage_only | 2049 | consumerWelfareIndex | 33.7765K | 51.3921K | 52.1532% |
| min_wage_only | 2049 | unrealizedAIOutput | 3.8256T | 3.7019T | 3.2335% |
| min_wage_only | 2049 | aiGoodsAbsorbed | 5.5160T | 5.6397T | 2.2426% |
| min_wage_only | 2049 | newJobEmployment | 186.9165K | 268.9982K | 43.9135% |
| min_wage_only | 2049 | newJobWageIncome | 9.1913B | 13.3222B | 44.9436% |
| min_wage_only | 2049 | wageConsumption | 2.1908T | 2.2227T | 1.4551% |
| min_wage_only | 2049 | assetConsumption | 4.4337T | 4.4921T | 1.3178% |
| min_wage_only | 2049 | aiCorporateProfits | 2.9359T | 2.9669T | 1.0534% |
| min_wage_only | 2049 | aiGDPContribution | 11.7438T | 11.8675T | 1.0534% |
| min_wage_only | 2049 | totalDemandSpilloverLoss | 2.7681M | 2.4593M | 11.1545% |
| min_wage_only | 2049 | maxNeutralTransfers | 2.8936T | 8.6862T | 200.1844% |
| min_wage_only | 2050 | aggregateWageIncome | 4.1644T | 4.2265T | 1.4919% |
| min_wage_only | 2050 | gdpReal | 35.0519T | 54.9335T | 56.7207% |
| min_wage_only | 2050 | consumption | 12.4949T | 12.8068T | 2.4969% |
| min_wage_only | 2050 | consumerWelfareIndex | 35.9102K | 57.1215K | 59.0678% |
| min_wage_only | 2050 | unrealizedAIOutput | 3.8565T | 3.7169T | 3.6209% |
| min_wage_only | 2050 | aiGoodsAbsorbed | 5.5925T | 5.7321T | 2.4969% |
| min_wage_only | 2050 | newJobEmployment | 196.0146K | 294.2027K | 50.0922% |
| min_wage_only | 2050 | newJobWageIncome | 9.6332B | 14.5827B | 51.3796% |
| min_wage_only | 2050 | potentialGDP | 44.5009T | 42.2327T | 5.0969% |
| min_wage_only | 2050 | wageConsumption | 2.1758T | 2.2133T | 1.7261% |
| min_wage_only | 2050 | corporateProfits | 5.2359T | 5.2906T | 1.0449% |
| min_wage_only | 2050 | aiCorporateProfits | 2.9730T | 3.0079T | 1.1743% |
| min_wage_only | 2050 | aiGDPContribution | 11.8918T | 12.0315T | 1.1743% |
| min_wage_only | 2050 | totalDemandSpilloverLoss | 2.5975M | 2.2389M | 13.8074% |
| min_wage_only | 2050 | maxNeutralTransfers | 3.1311T | 9.8143T | 213.4415% |
| all_policies | 2026 | potentialGDP | 32.1442T | 32.9900T | 2.6313% |
| all_policies | 2027 | potentialGDP | 33.1365T | 34.9033T | 5.3318% |
| all_policies | 2028 | gdpReal | 33.5300T | 33.9802T | 1.3428% |
| all_policies | 2028 | potentialGDP | 33.5300T | 36.7338T | 9.5550% |
| all_policies | 2029 | gdpReal | 33.7802T | 34.6942T | 2.7058% |
| all_policies | 2029 | newJobEmployment | 754.4246K | 764.5552K | 1.3428% |
| all_policies | 2029 | newJobWageIncome | 72.4383B | 73.4110B | 1.3428% |
| all_policies | 2029 | potentialGDP | 33.7802T | 38.4925T | 13.9498% |
| all_policies | 2030 | gdpReal | 34.1233T | 35.5186T | 4.0890% |
| all_policies | 2030 | newJobEmployment | 760.0550K | 780.6205K | 2.7058% |
| all_policies | 2030 | newJobWageIncome | 76.1668B | 78.2293B | 2.7079% |
| all_policies | 2030 | potentialGDP | 34.1233T | 40.4440T | 18.5232% |
| all_policies | 2031 | gdpReal | 34.4073T | 36.2970T | 5.4923% |
| all_policies | 2031 | newJobEmployment | 767.7737K | 799.1678K | 4.0890% |
| all_policies | 2031 | newJobWageIncome | 80.5158B | 83.8130B | 4.0951% |
| all_policies | 2031 | potentialGDP | 34.4073T | 42.4179T | 23.2817% |
| all_policies | 2032 | gdpReal | 38.0770T | 40.7262T | 6.9575% |
| all_policies | 2032 | aiAdditionalOutput | 320.5461M | 332.7061M | 3.7935% |
| all_policies | 2032 | aiInvestmentBoost | 96.1638M | 99.8118M | 3.7935% |
| all_policies | 2032 | aiNetExportBoost | 32.0546M | 33.2706M | 3.7935% |
| all_policies | 2032 | aiConsumerGoodsPotential | 192.3277M | 199.6237M | 3.7935% |
| all_policies | 2032 | aiGoodsAbsorbed | 192.3277M | 199.6237M | 3.7935% |
| all_policies | 2032 | newJobEmployment | 774.1431K | 816.6603K | 5.4922% |
| all_policies | 2032 | newJobWageIncome | 84.8031B | 89.4706B | 5.5039% |
| all_policies | 2032 | potentialGDP | 38.0772T | 48.8411T | 28.2686% |
| all_policies | 2032 | aiCorporateProfits | 80.1365M | 83.1765M | 3.7935% |
| all_policies | 2032 | aiGDPContribution | 320.5461M | 332.7061M | 3.7935% |
| all_policies | 2032 | moneySupply | 23.4670T | 25.9340T | 10.5127% |
| all_policies | 2032 | maxNeutralTransfers | 2.9693B | 2.1197B | 28.6129% |
| all_policies | 2033 | gdpReal | 40.7307T | 44.1720T | 8.4490% |
| all_policies | 2033 | aiAdditionalOutput | 5.5793B | 5.7820B | 3.6319% |
| all_policies | 2033 | aiInvestmentBoost | 1.6738B | 1.7346B | 3.6319% |
| all_policies | 2033 | aiNetExportBoost | 557.9322M | 578.1955M | 3.6319% |
| all_policies | 2033 | aiConsumerGoodsPotential | 3.3476B | 3.4692B | 3.6319% |
| all_policies | 2033 | aiGoodsAbsorbed | 3.3476B | 3.4692B | 3.6319% |
| all_policies | 2033 | newJobEmployment | 856.1922K | 915.7408K | 6.9550% |
| all_policies | 2033 | newJobWageIncome | 107.5797B | 115.0808B | 6.9726% |
| all_policies | 2033 | potentialGDP | 40.7340T | 54.3132T | 33.3362% |
| all_policies | 2033 | aiCorporateProfits | 1.3948B | 1.4455B | 3.6319% |
| all_policies | 2033 | aiGDPContribution | 5.5793B | 5.7820B | 3.6319% |
| all_policies | 2033 | moneySupply | 25.9439T | 30.8878T | 19.0562% |
| all_policies | 2033 | maxNeutralTransfers | 30.2198B | 19.6611B | 34.9396% |
| all_policies | 2034 | gdpReal | 42.6295T | 46.8789T | 9.9682% |
| all_policies | 2034 | aiAdditionalOutput | 34.7927B | 36.0094B | 3.4968% |
| all_policies | 2034 | aiInvestmentBoost | 10.4378B | 10.8028B | 3.4968% |
| all_policies | 2034 | aiNetExportBoost | 3.4793B | 3.6009B | 3.4968% |
| all_policies | 2034 | aiConsumerGoodsPotential | 20.8756B | 21.6056B | 3.4968% |
| all_policies | 2034 | aiGoodsAbsorbed | 20.8756B | 21.6056B | 3.4968% |
| all_policies | 2034 | newJobEmployment | 912.8383K | 989.8053K | 8.4316% |
| all_policies | 2034 | newJobWageIncome | 127.1653B | 137.9228B | 8.4595% |
| all_policies | 2034 | potentialGDP | 42.6504T | 58.9957T | 38.3240% |
| all_policies | 2034 | aiCorporateProfits | 8.6982B | 9.0023B | 3.4968% |
| all_policies | 2034 | aiGDPContribution | 34.7927B | 36.0094B | 3.4968% |
| all_policies | 2034 | moneySupply | 28.4307T | 35.8614T | 26.1362% |
| all_policies | 2034 | maxNeutralTransfers | 92.6998B | 55.4892B | 40.1410% |
| all_policies | 2035 | gdpReal | 43.8497T | 48.8707T | 11.4503% |
| all_policies | 2035 | consumerWelfareIndex | 88.9207K | 99.1241K | 11.4746% |
| all_policies | 2035 | aiAdditionalOutput | 120.9599B | 123.8224B | 2.3664% |
| all_policies | 2035 | aiInvestmentBoost | 36.2880B | 37.1467B | 2.3664% |
| all_policies | 2035 | aiNetExportBoost | 12.0960B | 12.3822B | 2.3664% |
| all_policies | 2035 | aiConsumerGoodsPotential | 72.5760B | 74.2934B | 2.3664% |
| all_policies | 2035 | aiGoodsAbsorbed | 72.5760B | 74.2934B | 2.3664% |
| all_policies | 2035 | newJobEmployment | 947.2424K | 1.0413M | 9.9304% |
| all_policies | 2035 | newJobWageIncome | 142.2737B | 156.5820B | 10.0569% |
| all_policies | 2035 | potentialGDP | 43.9223T | 62.8228T | 43.0317% |
| all_policies | 2035 | aiCorporateProfits | 30.2400B | 30.9556B | 2.3664% |
| all_policies | 2035 | aiGDPContribution | 120.9599B | 123.8224B | 2.3664% |
| all_policies | 2035 | moneySupply | 30.9275T | 40.8549T | 32.0992% |
| all_policies | 2035 | maxNeutralTransfers | 175.1984B | 99.4839B | 43.2164% |
| all_policies | 2036 | gdpReal | 44.2847T | 49.8351T | 12.5335% |
| all_policies | 2036 | consumerWelfareIndex | 88.7366K | 99.8789K | 12.5565% |
| all_policies | 2036 | aiAdditionalOutput | 282.7173B | 286.6188B | 1.3800% |
| all_policies | 2036 | aiInvestmentBoost | 84.8152B | 85.9856B | 1.3800% |
| all_policies | 2036 | aiNetExportBoost | 28.2717B | 28.6619B | 1.3800% |
| all_policies | 2036 | aiConsumerGoodsPotential | 169.6304B | 171.9713B | 1.3800% |
| all_policies | 2036 | aiGoodsAbsorbed | 169.6304B | 171.9713B | 1.3800% |
| all_policies | 2036 | newJobEmployment | 962.3540K | 1.0722M | 11.4117% |
| all_policies | 2036 | newJobWageIncome | 150.8890B | 168.4231B | 11.6205% |
| all_policies | 2036 | potentialGDP | 44.4543T | 65.1847T | 46.6331% |
| all_policies | 2036 | aiCorporateProfits | 70.6793B | 71.6547B | 1.3800% |
| all_policies | 2036 | aiGDPContribution | 282.7173B | 286.6188B | 1.3800% |
| all_policies | 2036 | moneySupply | 33.4342T | 45.8684T | 37.1901% |
| all_policies | 2036 | maxNeutralTransfers | 317.8586B | 182.8373B | 42.4784% |
| all_policies | 2037 | gdpReal | 43.7518T | 49.4127T | 12.9389% |
| all_policies | 2037 | consumerWelfareIndex | 86.5699K | 97.7855K | 12.9556% |
| all_policies | 2037 | aiAdditionalOutput | 590.3083B | 596.7220B | 1.0865% |
| all_policies | 2037 | aiInvestmentBoost | 177.0925B | 179.0166B | 1.0865% |
| all_policies | 2037 | aiNetExportBoost | 59.0308B | 59.6722B | 1.0865% |
| all_policies | 2037 | aiConsumerGoodsPotential | 354.1850B | 358.0332B | 1.0865% |
| all_policies | 2037 | aiGoodsAbsorbed | 354.1850B | 358.0332B | 1.0865% |
| all_policies | 2037 | newJobEmployment | 953.4296K | 1.0725M | 12.4891% |
| all_policies | 2037 | newJobWageIncome | 150.8405B | 169.9851B | 12.6919% |
| all_policies | 2037 | potentialGDP | 44.1059T | 65.4961T | 48.4972% |
| all_policies | 2037 | aiCorporateProfits | 147.5771B | 149.1805B | 1.0865% |
| all_policies | 2037 | aiGDPContribution | 590.3083B | 596.7220B | 1.0865% |
| all_policies | 2037 | moneySupply | 35.9510T | 50.9019T | 41.5871% |
| all_policies | 2037 | maxNeutralTransfers | 488.0293B | 291.3623B | 40.2982% |
| all_policies | 2038 | gdpReal | 41.2589T | 46.1849T | 11.9391% |
| all_policies | 2038 | newJobEmployment | 916.4896K | 1.0344M | 12.8701% |
| all_policies | 2038 | newJobWageIncome | 140.3250B | 158.4493B | 12.9160% |
| all_policies | 2038 | potentialGDP | 41.9178T | 61.6362T | 47.0407% |
| all_policies | 2038 | moneySupply | 38.4778T | 55.9556T | 45.4231% |
| all_policies | 2038 | maxNeutralTransfers | 722.2435B | 495.9639B | 31.3301% |
| all_policies | 2039 | gdpNominal | 53.4289T | 52.3869T | 1.9503% |
| all_policies | 2039 | gdpReal | 36.7485T | 40.0204T | 8.9033% |
| all_policies | 2039 | consumption | 35.1389T | 34.2754T | 2.4573% |
| all_policies | 2039 | investment | 11.1216T | 10.9740T | 1.3270% |
| all_policies | 2039 | newJobEmployment | 815.1299K | 912.3682K | 11.9292% |
| all_policies | 2039 | newJobWageIncome | 109.7287B | 122.0917B | 11.2668% |
| all_policies | 2039 | potentialGDP | 38.0374T | 53.6767T | 41.1153% |
| all_policies | 2039 | corporateProfits | 6.1779T | 6.0635T | 1.8522% |
| all_policies | 2039 | traditionalCorporateProfits | 5.6409T | 5.5261T | 2.0347% |
| all_policies | 2039 | moneySupply | 41.0147T | 61.0295T | 48.7989% |
| all_policies | 2039 | maxNeutralTransfers | 906.4343B | 830.3244B | 8.3966% |
| all_policies | 2040 | aggregateWageIncome | 20.2640T | 19.8463T | 2.0613% |
| all_policies | 2040 | aggregateAssetIncome | 14.6268T | 14.3415T | 1.9509% |
| all_policies | 2040 | totalIncome | 49.3206T | 48.5811T | 1.4994% |
| all_policies | 2040 | gdpNominal | 44.4031T | 43.3731T | 2.3197% |
| all_policies | 2040 | gdpReal | 31.6983T | 33.7794T | 6.5653% |
| all_policies | 2040 | consumption | 27.3357T | 26.6070T | 2.6660% |
| all_policies | 2040 | investment | 9.7921T | 9.5262T | 2.7152% |
| all_policies | 2040 | newJobEmployment | 651.8709K | 709.1018K | 8.7795% |
| all_policies | 2040 | newJobWageIncome | 68.1039B | 72.6121B | 6.6196% |
| all_policies | 2040 | potentialGDP | 34.1032T | 45.7885T | 34.2645% |
| all_policies | 2040 | wageConsumption | 14.8748T | 14.5654T | 2.0802% |
| all_policies | 2040 | assetConsumption | 4.7634T | 4.6635T | 2.0967% |
| all_policies | 2040 | corporateProfits | 5.4455T | 5.3346T | 2.0358% |
| all_policies | 2040 | traditionalCorporateProfits | 4.4434T | 4.3282T | 2.5931% |
| all_policies | 2040 | moneySupply | 43.5618T | 66.1236T | 51.7926% |
| all_policies | 2040 | maxNeutralTransfers | 1.0206T | 1.5336T | 50.2689% |
| all_policies | 2041 | aggregateWageIncome | 11.8949T | 11.5292T | 3.0744% |
| all_policies | 2041 | aggregateAssetIncome | 13.2808T | 13.0186T | 1.9745% |
| all_policies | 2041 | totalIncome | 39.9774T | 39.3196T | 1.6454% |
| all_policies | 2041 | gdpNominal | 38.2408T | 37.7958T | 1.1637% |
| all_policies | 2041 | gdpReal | 28.4861T | 30.3239T | 6.4518% |
| all_policies | 2041 | consumption | 21.2908T | 21.0194T | 1.2746% |
| all_policies | 2041 | investment | 9.4463T | 9.3027T | 1.5203% |
| all_policies | 2041 | unrealizedAIOutput | 0.000000 | 18.9286B | 100.0000% |
| all_policies | 2041 | newJobEmployment | 460.4001K | 488.1677K | 6.0312% |
| all_policies | 2041 | newJobWageIncome | 33.3783B | 34.4437B | 3.1919% |
| all_policies | 2041 | potentialGDP | 32.7981T | 42.1497T | 28.5129% |
| all_policies | 2041 | wageConsumption | 8.1398T | 7.8771T | 3.2271% |
| all_policies | 2041 | assetConsumption | 4.2389T | 4.1471T | 2.1652% |
| all_policies | 2041 | traditionalCorporateProfits | 3.4160T | 3.3614T | 1.5973% |
| all_policies | 2041 | moneySupply | 46.1191T | 71.2382T | 54.4657% |
| all_policies | 2041 | maxNeutralTransfers | 1.1231T | 2.3934T | 113.1101% |
| all_policies | 2042 | aggregateWageIncome | 7.8042T | 7.7165T | 1.1235% |
| all_policies | 2042 | gdpReal | 27.5625T | 29.4419T | 6.8185% |
| all_policies | 2042 | newJobEmployment | 349.8573K | 372.4294K | 6.4518% |
| all_policies | 2042 | newJobWageIncome | 19.1704B | 20.1748B | 5.2392% |
| all_policies | 2042 | potentialGDP | 33.2039T | 40.9147T | 23.2227% |
| all_policies | 2042 | wageConsumption | 5.0532T | 4.9969T | 1.1141% |
| all_policies | 2042 | moneySupply | 48.6866T | 76.3732T | 56.8670% |
| all_policies | 2042 | maxNeutralTransfers | 1.2733T | 2.7202T | 113.6371% |
| all_policies | 2043 | aggregateAssetIncome | 12.2365T | 12.4243T | 1.5350% |
| all_policies | 2043 | gdpReal | 28.6477T | 30.7486T | 7.3334% |
| all_policies | 2043 | unrealizedAIOutput | 1.3071T | 1.2540T | 4.0601% |
| all_policies | 2043 | newJobEmployment | 273.2419K | 291.8729K | 6.8185% |
| all_policies | 2043 | newJobWageIncome | 13.5571B | 14.4720B | 6.7485% |
| all_policies | 2043 | potentialGDP | 35.4359T | 41.6980T | 17.6715% |
| all_policies | 2043 | assetConsumption | 3.7414T | 3.8071T | 1.7572% |
| all_policies | 2043 | moneySupply | 51.2644T | 81.5287T | 59.0359% |
| all_policies | 2043 | maxNeutralTransfers | 1.5997T | 3.4340T | 114.6669% |
| all_policies | 2044 | aggregateAssetIncome | 13.2464T | 13.5868T | 2.5703% |
| all_policies | 2044 | gdpReal | 30.9400T | 33.4385T | 8.0753% |
| all_policies | 2044 | consumption | 16.5368T | 16.7411T | 1.2350% |
| all_policies | 2044 | unrealizedAIOutput | 1.6515T | 1.5776T | 4.4731% |
| all_policies | 2044 | aiGoodsAbsorbed | 5.9703T | 6.0435T | 1.2263% |
| all_policies | 2044 | newJobEmployment | 244.4088K | 262.3548K | 7.3426% |
| all_policies | 2044 | newJobWageIncome | 11.8737B | 12.8230B | 7.9947% |
| all_policies | 2044 | potentialGDP | 38.5618T | 42.9842T | 11.4684% |
| all_policies | 2044 | assetConsumption | 4.0136T | 4.1328T | 2.9690% |
| all_policies | 2044 | totalDemandSpilloverLoss | 837.2421K | 737.4853K | 11.9149% |
| all_policies | 2044 | moneySupply | 53.8524T | 86.7049T | 61.0045% |
| all_policies | 2044 | maxNeutralTransfers | 2.0821T | 4.5003T | 116.1413% |
| all_policies | 2045 | aggregateAssetIncome | 14.7420T | 15.0875T | 2.3437% |
| all_policies | 2045 | gdpReal | 34.0231T | 37.1458T | 9.1781% |
| all_policies | 2045 | consumption | 16.6905T | 16.9001T | 1.2559% |
| all_policies | 2045 | unrealizedAIOutput | 1.7338T | 1.6505T | 4.8001% |
| all_policies | 2045 | aiGoodsAbsorbed | 6.5459T | 6.6241T | 1.1937% |
| all_policies | 2045 | newJobEmployment | 235.6460K | 254.8012K | 8.1288% |
| all_policies | 2045 | newJobWageIncome | 11.5320B | 12.5653B | 8.9596% |
| all_policies | 2045 | potentialGDP | 42.3028T | 44.5034T | 5.2021% |
| all_policies | 2045 | wageConsumption | 2.6726T | 2.7004T | 1.0402% |
| all_policies | 2045 | assetConsumption | 4.4437T | 4.5646T | 2.7213% |
| all_policies | 2045 | totalDemandSpilloverLoss | 814.4133K | 703.5715K | 13.6100% |
| all_policies | 2045 | moneySupply | 56.4509T | 91.9017T | 62.7995% |
| all_policies | 2045 | maxNeutralTransfers | 2.5137T | 5.4877T | 118.3085% |
| all_policies | 2046 | aggregateAssetIncome | 16.2782T | 16.4538T | 1.0786% |
| all_policies | 2046 | gdpReal | 37.5496T | 41.6325T | 10.8734% |
| all_policies | 2046 | consumption | 17.0692T | 17.2867T | 1.2740% |
| all_policies | 2046 | unrealizedAIOutput | 1.6639T | 1.5744T | 5.3799% |
| all_policies | 2046 | aiGoodsAbsorbed | 7.0268T | 7.1164T | 1.2740% |
| all_policies | 2046 | newJobEmployment | 239.3256K | 261.2904K | 9.1778% |
| all_policies | 2046 | newJobWageIncome | 11.9602B | 13.1481B | 9.9324% |
| all_policies | 2046 | assetConsumption | 4.8739T | 4.9354T | 1.2608% |
| all_policies | 2046 | totalDemandSpilloverLoss | 561.5487K | 485.2720K | 13.5833% |
| all_policies | 2046 | moneySupply | 59.0597T | 97.1194T | 64.4428% |
| all_policies | 2046 | maxNeutralTransfers | 2.9620T | 6.5683T | 121.7474% |
| all_policies | 2047 | gdpReal | 41.2557T | 46.7271T | 13.2622% |
| all_policies | 2047 | consumption | 17.4178T | 17.6653T | 1.4207% |
| all_policies | 2047 | unrealizedAIOutput | 1.5704T | 1.4652T | 6.6992% |
| all_policies | 2047 | aiGoodsAbsorbed | 7.4059T | 7.5112T | 1.4219% |
| all_policies | 2047 | newJobEmployment | 248.1677K | 275.1184K | 10.8599% |
| all_policies | 2047 | newJobWageIncome | 12.6761B | 14.1432B | 11.5742% |
| all_policies | 2047 | potentialGDP | 50.2320T | 46.9077T | 6.6178% |
| all_policies | 2047 | totalDemandSpilloverLoss | 323.3124K | 256.3059K | 20.7250% |
| all_policies | 2047 | moneySupply | 61.6790T | 102.3579T | 65.9527% |
| all_policies | 2047 | maxNeutralTransfers | 3.4210T | 7.7502T | 126.5513% |
| all_policies | 2048 | gdpReal | 45.2167T | 52.5255T | 16.1640% |
| all_policies | 2048 | consumption | 17.7899T | 18.0562T | 1.4971% |
| all_policies | 2048 | unrealizedAIOutput | 1.4457T | 1.3299T | 8.0151% |
| all_policies | 2048 | aiGoodsAbsorbed | 7.7438T | 7.8600T | 1.5015% |
| all_policies | 2048 | newJobEmployment | 259.3191K | 293.6237K | 13.2287% |
| all_policies | 2048 | newJobWageIncome | 13.4578B | 15.3465B | 14.0343% |
| all_policies | 2048 | potentialGDP | 54.4062T | 47.7723T | 12.1932% |
| all_policies | 2048 | totalDemandSpilloverLoss | 160.2270K | 118.7661K | 25.8763% |
| all_policies | 2048 | moneySupply | 64.3087T | 107.6174T | 67.3450% |
| all_policies | 2048 | maxNeutralTransfers | 3.8960T | 9.0538T | 132.3858% |
| all_policies | 2049 | gdpReal | 49.5728T | 59.1804T | 19.3807% |
| all_policies | 2049 | consumption | 18.1946T | 18.4810T | 1.5738% |
| all_policies | 2049 | consumerWelfareIndex | 61.9940K | 74.5408K | 20.2387% |
| all_policies | 2049 | unrealizedAIOutput | 1.2906T | 1.1639T | 9.8180% |
| all_policies | 2049 | aiGoodsAbsorbed | 8.0511T | 8.1778T | 1.5738% |
| all_policies | 2049 | newJobEmployment | 275.1709K | 319.6495K | 16.1640% |
| all_policies | 2049 | newJobWageIncome | 14.4564B | 16.9258B | 17.0813% |
| all_policies | 2049 | potentialGDP | 58.9144T | 48.5538T | 17.5859% |
| all_policies | 2049 | totalDemandSpilloverLoss | 96.1326K | 76.3137K | 20.6162% |
| all_policies | 2049 | moneySupply | 66.9490T | 112.8979T | 68.6328% |
| all_policies | 2049 | maxNeutralTransfers | 4.3724T | 10.4397T | 138.7615% |
| all_policies | 2050 | gdpReal | 54.4451T | 66.9283T | 22.9281% |
| all_policies | 2050 | consumption | 18.6678T | 19.0052T | 1.8076% |
| all_policies | 2050 | consumerWelfareIndex | 68.4119K | 84.7910K | 23.9418% |
| all_policies | 2050 | unrealizedAIOutput | 1.0936T | 942.5767B | 13.8103% |
| all_policies | 2050 | aiGoodsAbsorbed | 8.3554T | 8.5064T | 1.8076% |
| all_policies | 2050 | newJobEmployment | 296.1893K | 353.5930K | 19.3807% |
| all_policies | 2050 | newJobWageIncome | 15.7424B | 18.9529B | 20.3943% |
| all_policies | 2050 | potentialGDP | 63.8941T | 49.3802T | 22.7156% |
| all_policies | 2050 | assetConsumption | 5.6055T | 5.5401T | 1.1660% |
| all_policies | 2050 | aiCorporateProfits | 3.6637T | 3.7014T | 1.0306% |
| all_policies | 2050 | aiGDPContribution | 14.6547T | 14.8058T | 1.0306% |
| all_policies | 2050 | totalDemandSpilloverLoss | 60.1057K | 40.0425K | 33.3798% |
| all_policies | 2050 | moneySupply | 69.5998T | 118.1996T | 69.8275% |
| all_policies | 2050 | maxNeutralTransfers | 4.8635T | 11.9573T | 145.8562% |
| aggressive_stress | 2026 | potentialGDP | 32.1442T | 32.9900T | 2.6313% |
| aggressive_stress | 2027 | potentialGDP | 33.1365T | 34.9033T | 5.3318% |
| aggressive_stress | 2028 | potentialGDP | 33.8511T | 36.5942T | 8.1033% |
| aggressive_stress | 2029 | aiAdditionalOutput | 29.0830B | 30.3379B | 4.3148% |
| aggressive_stress | 2029 | aiInvestmentBoost | 8.7249B | 9.1014B | 4.3148% |
| aggressive_stress | 2029 | aiNetExportBoost | 2.9083B | 3.0338B | 4.3148% |
| aggressive_stress | 2029 | aiConsumerGoodsPotential | 17.4498B | 18.2027B | 4.3148% |
| aggressive_stress | 2029 | aiGoodsAbsorbed | 17.4498B | 18.2027B | 4.3148% |
| aggressive_stress | 2029 | potentialGDP | 34.3580T | 38.0751T | 10.8187% |
| aggressive_stress | 2029 | aiCorporateProfits | 7.2707B | 7.5845B | 4.3148% |
| aggressive_stress | 2029 | aiGDPContribution | 29.0830B | 30.3379B | 4.3148% |
| aggressive_stress | 2029 | maxNeutralTransfers | 27.6808B | 24.8939B | 10.0682% |
| aggressive_stress | 2030 | totalUnemployment | 9.8457M | 9.9518M | 1.0774% |
| aggressive_stress | 2030 | aiAdditionalOutput | 370.4354B | 383.3929B | 3.4979% |
| aggressive_stress | 2030 | aiInvestmentBoost | 111.1306B | 115.0179B | 3.4979% |
| aggressive_stress | 2030 | aiNetExportBoost | 37.0435B | 38.3393B | 3.4979% |
| aggressive_stress | 2030 | aiConsumerGoodsPotential | 222.2612B | 230.0358B | 3.4979% |
| aggressive_stress | 2030 | aiGoodsAbsorbed | 222.2612B | 230.0358B | 3.4979% |
| aggressive_stress | 2030 | potentialGDP | 34.3777T | 38.4109T | 11.7318% |
| aggressive_stress | 2030 | aiCorporateProfits | 92.6088B | 95.8482B | 3.4979% |
| aggressive_stress | 2030 | aiGDPContribution | 370.4354B | 383.3929B | 3.4979% |
| aggressive_stress | 2030 | maxNeutralTransfers | 226.8154B | 211.8930B | 6.5791% |
| aggressive_stress | 2031 | gdpNominal | 34.7305T | 34.2712T | 1.3225% |
| aggressive_stress | 2031 | gdpReal | 31.4784T | 30.3110T | 3.7088% |
| aggressive_stress | 2031 | consumption | 22.1737T | 21.7550T | 1.8883% |
| aggressive_stress | 2031 | aiAdditionalOutput | 1.2649T | 1.2804T | 1.2247% |
| aggressive_stress | 2031 | aiInvestmentBoost | 379.4642B | 384.1114B | 1.2247% |
| aggressive_stress | 2031 | aiNetExportBoost | 126.4881B | 128.0371B | 1.2247% |
| aggressive_stress | 2031 | aiConsumerGoodsPotential | 758.9284B | 768.2229B | 1.2247% |
| aggressive_stress | 2031 | aiGoodsAbsorbed | 758.9284B | 768.2229B | 1.2247% |
| aggressive_stress | 2031 | newJobWageIncome | 65.1799B | 64.3654B | 1.2496% |
| aggressive_stress | 2031 | potentialGDP | 32.2374T | 35.0395T | 8.6921% |
| aggressive_stress | 2031 | corporateProfits | 3.9974T | 3.9491T | 1.2096% |
| aggressive_stress | 2031 | aiCorporateProfits | 316.2202B | 320.0929B | 1.2247% |
| aggressive_stress | 2031 | traditionalCorporateProfits | 3.6812T | 3.6290T | 1.4187% |
| aggressive_stress | 2031 | aiGDPContribution | 1.2649T | 1.2804T | 1.2247% |
| aggressive_stress | 2031 | maxNeutralTransfers | 503.2615B | 583.6528B | 15.9741% |
| aggressive_stress | 2032 | aggregateWageIncome | 15.1007T | 14.8884T | 1.4062% |
| aggressive_stress | 2032 | aggregateAssetIncome | 8.5843T | 8.4539T | 1.5193% |
| aggressive_stress | 2032 | totalIncome | 30.6815T | 30.3252T | 1.1613% |
| aggressive_stress | 2032 | gdpNominal | 27.6247T | 26.8354T | 2.8571% |
| aggressive_stress | 2032 | gdpReal | 26.4425T | 24.0504T | 9.0463% |
| aggressive_stress | 2032 | consumption | 15.6224T | 14.9874T | 4.0647% |
| aggressive_stress | 2032 | investment | 6.5998T | 6.4600T | 2.1169% |
| aggressive_stress | 2032 | unrealizedAIOutput | 443.0359B | 494.8067B | 11.6855% |
| aggressive_stress | 2032 | aiGoodsAbsorbed | 1.2610T | 1.2110T | 3.9646% |
| aggressive_stress | 2032 | newJobEmployment | 598.3211K | 575.9999K | 3.7306% |
| aggressive_stress | 2032 | newJobWageIncome | 44.8840B | 42.6155B | 5.0540% |
| aggressive_stress | 2032 | potentialGDP | 28.1465T | 28.5412T | 1.4024% |
| aggressive_stress | 2032 | wageConsumption | 11.3640T | 11.2023T | 1.4227% |
| aggressive_stress | 2032 | assetConsumption | 3.0045T | 2.9589T | 1.5193% |
| aggressive_stress | 2032 | corporateProfits | 3.3743T | 3.2806T | 2.7755% |
| aggressive_stress | 2032 | aiCorporateProfits | 599.2562B | 587.0539B | 2.0362% |
| aggressive_stress | 2032 | traditionalCorporateProfits | 2.7750T | 2.6936T | 2.9351% |
| aggressive_stress | 2032 | aiGDPContribution | 2.3970T | 2.3482T | 2.0362% |
| aggressive_stress | 2032 | maxNeutralTransfers | 739.9406B | 1.3468T | 82.0158% |
| aggressive_stress | 2033 | totalEmployment | 123.9480M | 121.1675M | 2.2433% |
| aggressive_stress | 2033 | totalUnemployment | 53.1122M | 55.8928M | 5.2352% |
| aggressive_stress | 2033 | aggregateWageIncome | 6.8537T | 6.2858T | 8.2863% |
| aggressive_stress | 2033 | aggregateAssetIncome | 7.2615T | 7.0188T | 3.3419% |
| aggressive_stress | 2033 | totalIncome | 21.6610T | 20.8894T | 3.5621% |
| aggressive_stress | 2033 | gdpNominal | 21.5282T | 20.9327T | 2.7664% |
| aggressive_stress | 2033 | gdpReal | 22.1328T | 19.3211T | 12.7038% |
| aggressive_stress | 2033 | consumption | 9.7182T | 9.2495T | 4.8232% |
| aggressive_stress | 2033 | investment | 6.1898T | 6.0768T | 1.8254% |
| aggressive_stress | 2033 | unrealizedAIOutput | 1.8526T | 1.9432T | 4.8930% |
| aggressive_stress | 2033 | aiGoodsAbsorbed | 1.5803T | 1.5153T | 4.1112% |
| aggressive_stress | 2033 | newJobEmployment | 422.3348K | 383.0637K | 9.2986% |
| aggressive_stress | 2033 | newJobWageIncome | 18.2658B | 15.5686B | 14.7663% |
| aggressive_stress | 2033 | potentialGDP | 25.5656T | 24.3912T | 4.5938% |
| aggressive_stress | 2033 | wageConsumption | 4.6058T | 4.1748T | 9.3579% |
| aggressive_stress | 2033 | assetConsumption | 2.5415T | 2.4566T | 3.3419% |
| aggressive_stress | 2033 | corporateProfits | 2.9097T | 2.8375T | 2.4817% |
| aggressive_stress | 2033 | aiCorporateProfits | 967.2162B | 955.2537B | 1.2368% |
| aggressive_stress | 2033 | traditionalCorporateProfits | 1.9425T | 1.8823T | 3.1015% |
| aggressive_stress | 2033 | aiGDPContribution | 3.8689T | 3.8210T | 1.2368% |
| aggressive_stress | 2033 | totalDemandSpilloverLoss | 12.3216M | 14.8220M | 20.2924% |
| aggressive_stress | 2033 | maxNeutralTransfers | 867.9437B | 1.5177T | 74.8612% |
| aggressive_stress | 2034 | totalEmployment | 81.5979M | 79.8014M | 2.2016% |
| aggressive_stress | 2034 | totalUnemployment | 96.1707M | 97.9671M | 1.8680% |
| aggressive_stress | 2034 | aggregateWageIncome | 2.1539T | 2.0087T | 6.7401% |
| aggressive_stress | 2034 | aggregateAssetIncome | 6.0924T | 5.8732T | 3.5979% |
| aggressive_stress | 2034 | totalIncome | 16.6188T | 16.2745T | 2.0716% |
| aggressive_stress | 2034 | gdpNominal | 20.2340T | 19.9980T | 1.1664% |
| aggressive_stress | 2034 | gdpReal | 22.6097T | 19.2263T | 14.9643% |
| aggressive_stress | 2034 | consumption | 7.1450T | 7.0253T | 1.6743% |
| aggressive_stress | 2034 | investment | 6.9814T | 6.8812T | 1.4350% |
| aggressive_stress | 2034 | aiGoodsAbsorbed | 2.2744T | 2.2363T | 1.6743% |
| aggressive_stress | 2034 | newJobEmployment | 241.0998K | 210.4709K | 12.7038% |
| aggressive_stress | 2034 | newJobWageIncome | 5.4111B | 4.5117B | 16.6211% |
| aggressive_stress | 2034 | potentialGDP | 29.3299T | 26.7182T | 8.9046% |
| aggressive_stress | 2034 | wageConsumption | 1.1879T | 1.0977T | 7.5945% |
| aggressive_stress | 2034 | assetConsumption | 2.1323T | 2.0556T | 3.5979% |
| aggressive_stress | 2034 | traditionalCorporateProfits | 1.4827T | 1.4610T | 1.4684% |
| aggressive_stress | 2034 | totalDemandSpilloverLoss | 25.5948M | 27.3606M | 6.8991% |
| aggressive_stress | 2034 | maxNeutralTransfers | 1.0632T | 1.8082T | 70.0714% |
| aggressive_stress | 2035 | aggregateWageIncome | 1.2528T | 1.2181T | 2.7626% |
| aggressive_stress | 2035 | aggregateAssetIncome | 6.2040T | 6.0847T | 1.9237% |
| aggressive_stress | 2035 | gdpReal | 26.1534T | 21.3952T | 18.1933% |
| aggressive_stress | 2035 | consumption | 6.7058T | 6.5468T | 2.3714% |
| aggressive_stress | 2035 | unrealizedAIOutput | 5.8187T | 5.8829T | 1.1039% |
| aggressive_stress | 2035 | aiGoodsAbsorbed | 2.7086T | 2.6444T | 2.3714% |
| aggressive_stress | 2035 | newJobEmployment | 169.4992K | 144.1348K | 14.9643% |
| aggressive_stress | 2035 | newJobWageIncome | 3.0394B | 2.5403B | 16.4213% |
| aggressive_stress | 2035 | potentialGDP | 34.6807T | 29.5145T | 14.8964% |
| aggressive_stress | 2035 | wageConsumption | 625.6069B | 606.2094B | 3.1006% |
| aggressive_stress | 2035 | assetConsumption | 2.1714T | 2.1296T | 1.9237% |
| aggressive_stress | 2035 | totalDemandSpilloverLoss | 21.8019M | 22.3961M | 2.7252% |
| aggressive_stress | 2035 | maxNeutralTransfers | 1.5450T | 2.5278T | 63.6134% |
| aggressive_stress | 2036 | aggregateWageIncome | 1.1527T | 1.1378T | 1.2931% |
| aggressive_stress | 2036 | aggregateAssetIncome | 7.4128T | 7.2318T | 2.4423% |
| aggressive_stress | 2036 | totalIncome | 17.4195T | 17.2129T | 1.1861% |
| aggressive_stress | 2036 | gdpReal | 31.3677T | 24.4735T | 21.9787% |
| aggressive_stress | 2036 | consumption | 6.8111T | 6.6143T | 2.8897% |
| aggressive_stress | 2036 | unrealizedAIOutput | 6.2965T | 6.3809T | 1.3400% |
| aggressive_stress | 2036 | aiGoodsAbsorbed | 2.9990T | 2.9113T | 2.9245% |
| aggressive_stress | 2036 | newJobEmployment | 153.2210K | 125.6614K | 17.9868% |
| aggressive_stress | 2036 | newJobWageIncome | 2.6869B | 2.1847B | 18.6903% |
| aggressive_stress | 2036 | potentialGDP | 40.6632T | 31.4581T | 22.6373% |
| aggressive_stress | 2036 | wageConsumption | 557.5250B | 549.7001B | 1.4035% |
| aggressive_stress | 2036 | assetConsumption | 2.5945T | 2.5311T | 2.4423% |
| aggressive_stress | 2036 | totalDemandSpilloverLoss | 15.4358M | 15.7157M | 1.8133% |
| aggressive_stress | 2036 | maxNeutralTransfers | 2.3030T | 3.5778T | 55.3525% |
| aggressive_stress | 2037 | aggregateWageIncome | 1.1104T | 1.0890T | 1.9263% |
| aggressive_stress | 2037 | aggregateAssetIncome | 9.1488T | 8.7226T | 4.6582% |
| aggressive_stress | 2037 | totalIncome | 19.1898T | 18.7340T | 2.3751% |
| aggressive_stress | 2037 | gdpNominal | 23.4431T | 23.1416T | 1.2862% |
| aggressive_stress | 2037 | gdpReal | 37.7149T | 28.0834T | 25.5375% |
| aggressive_stress | 2037 | consumption | 7.1691T | 6.9393T | 3.2053% |
| aggressive_stress | 2037 | unrealizedAIOutput | 6.5188T | 6.6270T | 1.6611% |
| aggressive_stress | 2037 | aiGoodsAbsorbed | 3.3520T | 3.2449T | 3.1930% |
| aggressive_stress | 2037 | newJobEmployment | 153.4901K | 119.6272K | 22.0619% |
| aggressive_stress | 2037 | newJobWageIncome | 2.7081B | 2.0838B | 23.0532% |
| aggressive_stress | 2037 | potentialGDP | 47.5856T | 33.0136T | 30.6228% |
| aggressive_stress | 2037 | wageConsumption | 526.2663B | 515.1563B | 2.1111% |
| aggressive_stress | 2037 | assetConsumption | 3.2021T | 3.0529T | 4.6582% |
| aggressive_stress | 2037 | corporateProfits | 3.9693T | 3.9212T | 1.2101% |
| aggressive_stress | 2037 | aiCorporateProfits | 2.4831T | 2.4566T | 1.0692% |
| aggressive_stress | 2037 | traditionalCorporateProfits | 1.4862T | 1.4647T | 1.4457% |
| aggressive_stress | 2037 | aiGDPContribution | 9.9325T | 9.8263T | 1.0692% |
| aggressive_stress | 2037 | totalDemandSpilloverLoss | 11.3283M | 11.5731M | 2.1603% |
| aggressive_stress | 2037 | maxNeutralTransfers | 3.1149T | 4.6440T | 49.0928% |
| aggressive_stress | 2038 | aggregateWageIncome | 1.0046T | 977.3620B | 2.7147% |
| aggressive_stress | 2038 | aggregateAssetIncome | 10.1046T | 9.3822T | 7.1493% |
| aggressive_stress | 2038 | totalIncome | 20.1364T | 19.3816T | 3.7486% |
| aggressive_stress | 2038 | gdpNominal | 24.3430T | 24.0325T | 1.2752% |
| aggressive_stress | 2038 | gdpReal | 45.5021T | 32.4475T | 28.6903% |
| aggressive_stress | 2038 | consumption | 7.3636T | 7.1137T | 3.3935% |
| aggressive_stress | 2038 | consumerWelfareIndex | 38.4352K | 26.8199K | 30.2204% |
| aggressive_stress | 2038 | unrealizedAIOutput | 6.9804T | 7.1384T | 2.2624% |
| aggressive_stress | 2038 | aiGoodsAbsorbed | 3.7389T | 3.6278T | 2.9715% |
| aggressive_stress | 2038 | newJobEmployment | 152.7080K | 113.2267K | 25.8541% |
| aggressive_stress | 2038 | newJobWageIncome | 2.6410B | 1.9238B | 27.1541% |
| aggressive_stress | 2038 | potentialGDP | 56.2215T | 34.7987T | 38.1043% |
| aggressive_stress | 2038 | wageConsumption | 463.5513B | 449.6665B | 2.9953% |
| aggressive_stress | 2038 | assetConsumption | 3.5366T | 3.2838T | 7.1493% |
| aggressive_stress | 2038 | corporateProfits | 4.2016T | 4.1563T | 1.0788% |
| aggressive_stress | 2038 | traditionalCorporateProfits | 1.4804T | 1.4550T | 1.7129% |
| aggressive_stress | 2038 | totalDemandSpilloverLoss | 8.7424M | 9.0328M | 3.3218% |
| aggressive_stress | 2038 | maxNeutralTransfers | 4.1067T | 5.8716T | 42.9756% |
| aggressive_stress | 2039 | aggregateWageIncome | 1.0051T | 981.4253B | 2.3537% |
| aggressive_stress | 2039 | aggregateAssetIncome | 10.7747T | 9.8090T | 8.9629% |
| aggressive_stress | 2039 | totalIncome | 20.8490T | 19.8521T | 4.7815% |
| aggressive_stress | 2039 | gdpNominal | 24.9894T | 24.6639T | 1.3025% |
| aggressive_stress | 2039 | gdpReal | 54.7569T | 37.3960T | 31.7054% |
| aggressive_stress | 2039 | consumption | 7.5174T | 7.2667T | 3.3340% |
| aggressive_stress | 2039 | consumerWelfareIndex | 45.8139K | 30.6444K | 33.1111% |
| aggressive_stress | 2039 | unrealizedAIOutput | 7.2534T | 7.3883T | 1.8601% |
| aggressive_stress | 2039 | aiGoodsAbsorbed | 4.0111T | 3.8780T | 3.3183% |
| aggressive_stress | 2039 | newJobEmployment | 166.7964K | 118.8140K | 28.7671% |
| aggressive_stress | 2039 | newJobWageIncome | 2.9008B | 2.0333B | 29.9047% |
| aggressive_stress | 2039 | potentialGDP | 66.0215T | 35.9303T | 45.5778% |
| aggressive_stress | 2039 | wageConsumption | 459.1330B | 447.3589B | 2.5644% |
| aggressive_stress | 2039 | assetConsumption | 3.7711T | 3.4331T | 8.9629% |
| aggressive_stress | 2039 | corporateProfits | 4.3618T | 4.3075T | 1.2442% |
| aggressive_stress | 2039 | aiCorporateProfits | 2.8802T | 2.8472T | 1.1448% |
| aggressive_stress | 2039 | traditionalCorporateProfits | 1.4815T | 1.4602T | 1.4375% |
| aggressive_stress | 2039 | aiGDPContribution | 11.5208T | 11.3890T | 1.1448% |
| aggressive_stress | 2039 | totalDemandSpilloverLoss | 7.0322M | 7.3060M | 3.8923% |
| aggressive_stress | 2039 | maxNeutralTransfers | 5.2692T | 7.2108T | 36.8498% |
| aggressive_stress | 2040 | aggregateWageIncome | 1.0233T | 999.4491B | 2.3271% |
| aggressive_stress | 2040 | aggregateAssetIncome | 11.2822T | 10.0972T | 10.5031% |
| aggressive_stress | 2040 | totalIncome | 21.3945T | 20.1778T | 5.6871% |
| aggressive_stress | 2040 | gdpNominal | 25.2783T | 24.9573T | 1.2697% |
| aggressive_stress | 2040 | gdpReal | 65.4599T | 42.8551T | 34.5324% |
| aggressive_stress | 2040 | consumption | 7.6346T | 7.3938T | 3.1544% |
| aggressive_stress | 2040 | consumerWelfareIndex | 54.7683K | 35.1710K | 35.7821% |
| aggressive_stress | 2040 | unrealizedAIOutput | 7.2914T | 7.4218T | 1.7884% |
| aggressive_stress | 2040 | aiGoodsAbsorbed | 4.1306T | 4.0004T | 3.1531% |
| aggressive_stress | 2040 | newJobEmployment | 191.8959K | 131.0351K | 31.7155% |
| aggressive_stress | 2040 | newJobWageIncome | 3.3757B | 2.2684B | 32.8033% |
| aggressive_stress | 2040 | potentialGDP | 76.8819T | 36.3795T | 52.6814% |
| aggressive_stress | 2040 | wageConsumption | 466.0278B | 454.2602B | 2.5251% |
| aggressive_stress | 2040 | assetConsumption | 3.9488T | 3.5340T | 10.5031% |
| aggressive_stress | 2040 | corporateProfits | 4.4249T | 4.3714T | 1.2096% |
| aggressive_stress | 2040 | aiCorporateProfits | 2.9363T | 2.9038T | 1.1080% |
| aggressive_stress | 2040 | traditionalCorporateProfits | 1.4886T | 1.4676T | 1.4101% |
| aggressive_stress | 2040 | aiGDPContribution | 11.7453T | 11.6151T | 1.1080% |
| aggressive_stress | 2040 | totalDemandSpilloverLoss | 6.1042M | 6.3747M | 4.4323% |
| aggressive_stress | 2040 | maxNeutralTransfers | 6.6439T | 8.7181T | 31.2194% |
| aggressive_stress | 2041 | aggregateWageIncome | 1.0303T | 1.0066T | 2.2981% |
| aggressive_stress | 2041 | aggregateAssetIncome | 11.6113T | 10.2418T | 11.7944% |
| aggressive_stress | 2041 | totalIncome | 21.7455T | 20.3445T | 6.4427% |
| aggressive_stress | 2041 | gdpNominal | 25.3974T | 25.0980T | 1.1788% |
| aggressive_stress | 2041 | gdpReal | 78.0798T | 49.0186T | 37.2198% |
| aggressive_stress | 2041 | consumption | 7.7136T | 7.4891T | 2.9105% |
| aggressive_stress | 2041 | consumerWelfareIndex | 65.4319K | 40.3584K | 38.3199% |
| aggressive_stress | 2041 | unrealizedAIOutput | 7.3083T | 7.4309T | 1.6775% |
| aggressive_stress | 2041 | aiGoodsAbsorbed | 4.2078T | 4.0854T | 2.9088% |
| aggressive_stress | 2041 | newJobEmployment | 224.8219K | 147.1591K | 34.5442% |
| aggressive_stress | 2041 | newJobWageIncome | 3.9647B | 2.5546B | 35.5679% |
| aggressive_stress | 2041 | potentialGDP | 89.5959T | 36.6143T | 59.1339% |
| aggressive_stress | 2041 | wageConsumption | 468.5559B | 456.8499B | 2.4983% |
| aggressive_stress | 2041 | assetConsumption | 4.0639T | 3.5846T | 11.7944% |
| aggressive_stress | 2041 | corporateProfits | 4.4576T | 4.4076T | 1.1228% |
| aggressive_stress | 2041 | aiCorporateProfits | 2.9713T | 2.9407T | 1.0287% |
| aggressive_stress | 2041 | traditionalCorporateProfits | 1.4863T | 1.4669T | 1.3108% |
| aggressive_stress | 2041 | aiGDPContribution | 11.8852T | 11.7629T | 1.0287% |
| aggressive_stress | 2041 | totalDemandSpilloverLoss | 5.7485M | 6.0058M | 4.4753% |
| aggressive_stress | 2041 | maxNeutralTransfers | 8.1515T | 10.2366T | 25.5791% |
| aggressive_stress | 2042 | aggregateWageIncome | 1.0239T | 1.0013T | 2.2064% |
| aggressive_stress | 2042 | aggregateAssetIncome | 11.8495T | 10.3209T | 12.8997% |
| aggressive_stress | 2042 | totalIncome | 21.9955T | 20.4365T | 7.0875% |
| aggressive_stress | 2042 | gdpNominal | 25.4947T | 25.2188T | 1.0821% |
| aggressive_stress | 2042 | gdpReal | 93.2474T | 56.1436T | 39.7907% |
| aggressive_stress | 2042 | consumption | 7.7737T | 7.5647T | 2.6890% |
| aggressive_stress | 2042 | consumerWelfareIndex | 78.1380K | 46.2821K | 40.7688% |
| aggressive_stress | 2042 | unrealizedAIOutput | 7.3255T | 7.4405T | 1.5690% |
| aggressive_stress | 2042 | aiGoodsAbsorbed | 4.2697T | 4.1549T | 2.6872% |
| aggressive_stress | 2042 | newJobEmployment | 263.1389K | 165.1687K | 37.2314% |
| aggressive_stress | 2042 | newJobWageIncome | 4.6145B | 2.8537B | 38.1573% |
| aggressive_stress | 2042 | potentialGDP | 104.8426T | 36.8142T | 64.8863% |
| aggressive_stress | 2042 | wageConsumption | 464.4922B | 453.3062B | 2.4082% |
| aggressive_stress | 2042 | assetConsumption | 4.1473T | 3.6123T | 12.8997% |
| aggressive_stress | 2042 | corporateProfits | 4.4844T | 4.4380T | 1.0345% |
| aggressive_stress | 2042 | traditionalCorporateProfits | 1.4844T | 1.4667T | 1.1952% |
| aggressive_stress | 2042 | totalDemandSpilloverLoss | 5.6122M | 5.8520M | 4.2741% |
| aggressive_stress | 2042 | maxNeutralTransfers | 9.8606T | 11.8757T | 20.4365% |
| aggressive_stress | 2043 | aggregateWageIncome | 998.3134B | 977.1095B | 2.1240% |
| aggressive_stress | 2043 | aggregateAssetIncome | 12.0907T | 10.4128T | 13.8773% |
| aggressive_stress | 2043 | totalIncome | 22.2396T | 20.5329T | 7.6743% |
| aggressive_stress | 2043 | gdpNominal | 25.6315T | 25.3702T | 1.0195% |
| aggressive_stress | 2043 | gdpReal | 112.1138T | 64.7065T | 42.2850% |
| aggressive_stress | 2043 | consumption | 7.8300T | 7.6302T | 2.5519% |
| aggressive_stress | 2043 | consumerWelfareIndex | 93.7476K | 53.2688K | 43.1785% |
| aggressive_stress | 2043 | unrealizedAIOutput | 7.3630T | 7.4740T | 1.5074% |
| aggressive_stress | 2043 | aiGoodsAbsorbed | 4.3409T | 4.2302T | 2.5491% |
| aggressive_stress | 2043 | newJobEmployment | 303.6909K | 182.8106K | 39.8037% |
| aggressive_stress | 2043 | newJobWageIncome | 5.2547B | 3.1194B | 40.6362% |
| aggressive_stress | 2043 | potentialGDP | 123.8177T | 37.0744T | 70.0573% |
| aggressive_stress | 2043 | wageConsumption | 450.3333B | 439.8424B | 2.3296% |
| aggressive_stress | 2043 | assetConsumption | 4.2317T | 3.6445T | 13.8773% |
| aggressive_stress | 2043 | traditionalCorporateProfits | 1.4837T | 1.4671T | 1.1187% |
| aggressive_stress | 2043 | totalDemandSpilloverLoss | 5.5354M | 5.7570M | 4.0037% |
| aggressive_stress | 2043 | maxNeutralTransfers | 12.2068T | 14.0928T | 15.4507% |
| aggressive_stress | 2044 | aggregateWageIncome | 971.4169B | 951.0015B | 2.1016% |
| aggressive_stress | 2044 | aggregateAssetIncome | 12.3451T | 10.5189T | 14.7925% |
| aggressive_stress | 2044 | totalIncome | 22.4971T | 20.6431T | 8.2410% |
| aggressive_stress | 2044 | gdpNominal | 25.8055T | 25.5473T | 1.0006% |
| aggressive_stress | 2044 | gdpReal | 135.9708T | 75.1726T | 44.7142% |
| aggressive_stress | 2044 | consumption | 7.8888T | 7.6909T | 2.5081% |
| aggressive_stress | 2044 | consumerWelfareIndex | 113.3240K | 61.6981K | 45.5560% |
| aggressive_stress | 2044 | unrealizedAIOutput | 7.4122T | 7.5233T | 1.4986% |
| aggressive_stress | 2044 | aiGoodsAbsorbed | 4.4223T | 4.3114T | 2.5060% |
| aggressive_stress | 2044 | newJobEmployment | 351.6250K | 202.9172K | 42.2916% |
| aggressive_stress | 2044 | newJobWageIncome | 6.0049B | 3.4193B | 43.0587% |
| aggressive_stress | 2044 | potentialGDP | 147.8052T | 37.3820T | 74.7086% |
| aggressive_stress | 2044 | wageConsumption | 435.5314B | 425.4463B | 2.3156% |
| aggressive_stress | 2044 | assetConsumption | 4.3208T | 3.6816T | 14.7925% |
| aggressive_stress | 2044 | traditionalCorporateProfits | 1.4843T | 1.4681T | 1.0935% |
| aggressive_stress | 2044 | totalDemandSpilloverLoss | 5.4509M | 5.6613M | 3.8601% |
| aggressive_stress | 2044 | maxNeutralTransfers | 15.3930T | 17.0225T | 10.5864% |
| aggressive_stress | 2045 | aggregateWageIncome | 973.7784B | 952.6579B | 2.1689% |
| aggressive_stress | 2045 | aggregateAssetIncome | 12.5607T | 10.5991T | 15.6168% |
| aggressive_stress | 2045 | totalIncome | 22.7283T | 20.7388T | 8.7532% |
| aggressive_stress | 2045 | gdpReal | 164.8583T | 87.4151T | 46.9756% |
| aggressive_stress | 2045 | consumption | 7.9462T | 7.7507T | 2.4606% |
| aggressive_stress | 2045 | consumerWelfareIndex | 137.0486K | 71.5920K | 47.7616% |
| aggressive_stress | 2045 | unrealizedAIOutput | 7.4290T | 7.5394T | 1.4856% |
| aggressive_stress | 2045 | aiGoodsAbsorbed | 4.4841T | 4.3738T | 2.4603% |
| aggressive_stress | 2045 | newJobEmployment | 421.9153K | 233.2562K | 44.7149% |
| aggressive_stress | 2045 | newJobWageIncome | 7.2052B | 3.9301B | 45.4543% |
| aggressive_stress | 2045 | potentialGDP | 176.7714T | 37.6118T | 78.7229% |
| aggressive_stress | 2045 | wageConsumption | 436.2411B | 425.7605B | 2.4025% |
| aggressive_stress | 2045 | assetConsumption | 4.3963T | 3.7097T | 15.6168% |
| aggressive_stress | 2045 | traditionalCorporateProfits | 1.4883T | 1.4721T | 1.0898% |
| aggressive_stress | 2045 | totalDemandSpilloverLoss | 5.3471M | 5.5553M | 3.8940% |
| aggressive_stress | 2045 | maxNeutralTransfers | 18.8689T | 20.0104T | 6.0495% |
| aggressive_stress | 2046 | aggregateWageIncome | 980.6310B | 958.2056B | 2.2868% |
| aggressive_stress | 2046 | aggregateAssetIncome | 12.7393T | 10.6645T | 16.2866% |
| aggressive_stress | 2046 | totalIncome | 22.9223T | 20.8193T | 9.1745% |
| aggressive_stress | 2046 | gdpReal | 199.7774T | 101.6088T | 49.1390% |
| aggressive_stress | 2046 | consumption | 7.9941T | 7.8030T | 2.3902% |
| aggressive_stress | 2046 | consumerWelfareIndex | 165.6517K | 83.0460K | 49.8671% |
| aggressive_stress | 2046 | unrealizedAIOutput | 7.4449T | 7.5535T | 1.4587% |
| aggressive_stress | 2046 | aiGoodsAbsorbed | 4.5372T | 4.4289T | 2.3882% |
| aggressive_stress | 2046 | newJobEmployment | 510.0793K | 270.4629K | 46.9763% |
| aggressive_stress | 2046 | newJobWageIncome | 8.7312B | 4.5661B | 47.7037% |
| aggressive_stress | 2046 | potentialGDP | 211.7595T | 37.8042T | 82.1476% |
| aggressive_stress | 2046 | wageConsumption | 439.6026B | 428.3973B | 2.5490% |
| aggressive_stress | 2046 | assetConsumption | 4.4587T | 3.7326T | 16.2866% |
| aggressive_stress | 2046 | traditionalCorporateProfits | 1.4905T | 1.4745T | 1.0732% |
| aggressive_stress | 2046 | totalDemandSpilloverLoss | 5.2557M | 5.4642M | 3.9671% |
| aggressive_stress | 2046 | maxNeutralTransfers | 22.9514T | 23.3471T | 1.7244% |
| aggressive_stress | 2047 | totalEmployment | 47.4603M | 46.9506M | 1.0740% |
| aggressive_stress | 2047 | aggregateWageIncome | 989.8490B | 965.9741B | 2.4120% |
| aggressive_stress | 2047 | aggregateAssetIncome | 12.8848T | 10.7149T | 16.8410% |
| aggressive_stress | 2047 | totalIncome | 23.0845T | 20.8861T | 9.5233% |
| aggressive_stress | 2047 | gdpReal | 241.9824T | 118.0616T | 51.2107% |
| aggressive_stress | 2047 | consumption | 8.0350T | 7.8489T | 2.3156% |
| aggressive_stress | 2047 | consumerWelfareIndex | 200.0890K | 96.2705K | 51.8862% |
| aggressive_stress | 2047 | unrealizedAIOutput | 7.4620T | 7.5682T | 1.4229% |
| aggressive_stress | 2047 | aiGoodsAbsorbed | 4.5852T | 4.4790T | 2.3156% |
| aggressive_stress | 2047 | newJobEmployment | 617.6426K | 314.1391K | 49.1390% |
| aggressive_stress | 2047 | newJobWageIncome | 10.5927B | 5.3121B | 49.8519% |
| aggressive_stress | 2047 | potentialGDP | 254.0296T | 37.9773T | 85.0501% |
| aggressive_stress | 2047 | wageConsumption | 444.1837B | 432.1553B | 2.7080% |
| aggressive_stress | 2047 | assetConsumption | 4.5097T | 3.7502T | 16.8410% |
| aggressive_stress | 2047 | traditionalCorporateProfits | 1.4917T | 1.4762T | 1.0396% |
| aggressive_stress | 2047 | totalDemandSpilloverLoss | 5.1886M | 5.3948M | 3.9740% |
| aggressive_stress | 2047 | maxNeutralTransfers | 27.8332T | 27.1592T | 2.4213% |
| aggressive_stress | 2048 | totalEmployment | 47.8499M | 47.2649M | 1.2226% |
| aggressive_stress | 2048 | aggregateWageIncome | 999.3313B | 973.7314B | 2.5617% |
| aggressive_stress | 2048 | aggregateAssetIncome | 13.0081T | 10.7578T | 17.2994% |
| aggressive_stress | 2048 | totalIncome | 23.2242T | 20.9451T | 9.8134% |
| aggressive_stress | 2048 | gdpReal | 292.9148T | 137.0900T | 53.1980% |
| aggressive_stress | 2048 | consumption | 8.0707T | 7.8895T | 2.2457% |
| aggressive_stress | 2048 | consumerWelfareIndex | 241.5271K | 111.5225K | 53.8261% |
| aggressive_stress | 2048 | unrealizedAIOutput | 7.4715T | 7.5753T | 1.3898% |
| aggressive_stress | 2048 | aiGoodsAbsorbed | 4.6241T | 4.5202T | 2.2457% |
| aggressive_stress | 2048 | newJobEmployment | 748.0764K | 364.9815K | 51.2107% |
| aggressive_stress | 2048 | newJobWageIncome | 12.8501B | 6.1795B | 51.9108% |
| aggressive_stress | 2048 | potentialGDP | 305.0104T | 38.1173T | 87.5029% |
| aggressive_stress | 2048 | wageConsumption | 448.9697B | 435.9532B | 2.8992% |
| aggressive_stress | 2048 | assetConsumption | 4.5528T | 3.7652T | 17.2994% |
| aggressive_stress | 2048 | traditionalCorporateProfits | 1.4932T | 1.4782T | 1.0069% |
| aggressive_stress | 2048 | totalDemandSpilloverLoss | 5.1356M | 5.3375M | 3.9319% |
| aggressive_stress | 2048 | maxNeutralTransfers | 33.6926T | 31.5376T | 6.3960% |
| aggressive_stress | 2049 | totalEmployment | 48.2574M | 47.5782M | 1.4074% |
| aggressive_stress | 2049 | aggregateWageIncome | 1.0086T | 980.7615B | 2.7561% |
| aggressive_stress | 2049 | aggregateAssetIncome | 13.1125T | 10.7950T | 17.6735% |
| aggressive_stress | 2049 | totalIncome | 23.3444T | 20.9978T | 10.0520% |
| aggressive_stress | 2049 | gdpReal | 354.4604T | 159.1330T | 55.1055% |
| aggressive_stress | 2049 | consumption | 8.1019T | 7.9253T | 2.1795% |
| aggressive_stress | 2049 | consumerWelfareIndex | 291.3772K | 129.1106K | 55.6896% |
| aggressive_stress | 2049 | unrealizedAIOutput | 7.4835T | 7.5851T | 1.3573% |
| aggressive_stress | 2049 | aiGoodsAbsorbed | 4.6605T | 4.5590T | 2.1795% |
| aggressive_stress | 2049 | newJobEmployment | 905.5044K | 423.7943K | 53.1980% |
| aggressive_stress | 2049 | newJobWageIncome | 15.5711B | 7.1795B | 53.8924% |
| aggressive_stress | 2049 | potentialGDP | 366.6044T | 38.2491T | 89.5667% |
| aggressive_stress | 2049 | wageConsumption | 453.6923B | 439.4237B | 3.1450% |
| aggressive_stress | 2049 | assetConsumption | 4.5894T | 3.7783T | 17.6735% |
| aggressive_stress | 2049 | totalDemandSpilloverLoss | 5.0935M | 5.2910M | 3.8766% |
| aggressive_stress | 2049 | maxNeutralTransfers | 40.7725T | 36.6092T | 10.2111% |
| aggressive_stress | 2050 | totalEmployment | 48.6928M | 47.8956M | 1.6372% |
| aggressive_stress | 2050 | aggregateWageIncome | 1.0182T | 987.5175B | 3.0091% |
| aggressive_stress | 2050 | aggregateAssetIncome | 13.2034T | 10.8283T | 17.9890% |
| aggressive_stress | 2050 | totalIncome | 23.4510T | 21.0461T | 10.2549% |
| aggressive_stress | 2050 | gdpReal | 428.8883T | 184.6929T | 56.9368% |
| aggressive_stress | 2050 | consumption | 8.1298T | 7.9573T | 2.1216% |
| aggressive_stress | 2050 | consumerWelfareIndex | 351.3720K | 149.3985K | 57.4814% |
| aggressive_stress | 2050 | unrealizedAIOutput | 7.4973T | 7.5969T | 1.3287% |
| aggressive_stress | 2050 | aiGoodsAbsorbed | 4.6953T | 4.5957T | 2.1216% |
| aggressive_stress | 2050 | newJobEmployment | 1.0957M | 491.9305K | 55.1055% |
| aggressive_stress | 2050 | newJobWageIncome | 18.8612B | 8.3360B | 55.8035% |
| aggressive_stress | 2050 | potentialGDP | 441.0809T | 38.3774T | 91.2992% |
| aggressive_stress | 2050 | wageConsumption | 458.6602B | 442.7816B | 3.4620% |
| aggressive_stress | 2050 | assetConsumption | 4.6212T | 3.7899T | 17.9890% |
| aggressive_stress | 2050 | totalDemandSpilloverLoss | 5.0578M | 5.2512M | 3.8236% |
| aggressive_stress | 2050 | maxNeutralTransfers | 49.3341T | 42.4897T | 13.8737% |

## Field Comparison Warnings

| Scenario | Year | Field | Expected | Actual | Error |
|----------|-----:|-------|----------|--------|------:|
| displacement_no_policy | 2033 | totalUnemployment | 7.0751M | 7.0767M | 0.0231% |
| displacement_no_policy | 2033 | newJobEmployment | 784.4647K | 784.4545K | 0.0013% |
| displacement_no_policy | 2034 | totalUnemployment | 7.4685M | 7.4772M | 0.1155% |
| displacement_no_policy | 2034 | newJobEmployment | 783.8493K | 783.8003K | 0.0062% |
| displacement_no_policy | 2035 | totalEmployment | 170.0374M | 170.0198M | 0.0103% |
| displacement_no_policy | 2035 | totalUnemployment | 8.4422M | 8.4598M | 0.2075% |
| displacement_no_policy | 2035 | aggregateWageIncome | 26.2544T | 26.2448T | 0.0368% |
| displacement_no_policy | 2035 | aggregateAssetIncome | 9.2986T | 9.3001T | 0.0163% |
| displacement_no_policy | 2035 | aggregateTransferIncome | 7.6491T | 7.6448T | 0.0552% |
| displacement_no_policy | 2035 | totalIncome | 43.2021T | 43.1898T | 0.0286% |
| displacement_no_policy | 2035 | gdpNominal | 44.9095T | 44.8785T | 0.0691% |
| displacement_no_policy | 2035 | gdpReal | 35.0234T | 34.9503T | 0.2089% |
| displacement_no_policy | 2035 | consumption | 31.0158T | 30.9877T | 0.0905% |
| displacement_no_policy | 2035 | governmentSpending | 6.9733T | 6.9699T | 0.0478% |
| displacement_no_policy | 2035 | consumerWelfareIndex | 68.3576K | 68.2002K | 0.2302% |
| displacement_no_policy | 2035 | newJobEmployment | 779.5367K | 779.4215K | 0.0148% |
| displacement_no_policy | 2035 | newJobWageIncome | 87.4475B | 87.4137B | 0.0386% |
| displacement_no_policy | 2035 | wageConsumption | 20.9602T | 20.9512T | 0.0429% |
| displacement_no_policy | 2035 | assetConsumption | 3.2545T | 3.2551T | 0.0163% |
| displacement_no_policy | 2035 | transferConsumption | 6.8842T | 6.8804T | 0.0552% |
| displacement_no_policy | 2035 | corporateProfits | 4.9570T | 4.9538T | 0.0651% |
| displacement_no_policy | 2035 | traditionalCorporateProfits | 4.9267T | 4.9232T | 0.0722% |
| displacement_no_policy | 2036 | totalEmployment | 169.3543M | 169.3360M | 0.0108% |
| displacement_no_policy | 2036 | totalUnemployment | 9.8392M | 9.8575M | 0.1855% |
| displacement_no_policy | 2036 | aggregateWageIncome | 26.0390T | 26.0120T | 0.1037% |
| displacement_no_policy | 2036 | aggregateAssetIncome | 9.6123T | 9.6077T | 0.0484% |
| displacement_no_policy | 2036 | aggregateTransferIncome | 7.7615T | 7.7439T | 0.2267% |
| displacement_no_policy | 2036 | totalIncome | 43.4128T | 43.3635T | 0.1134% |
| displacement_no_policy | 2036 | gdpNominal | 44.8589T | 44.7534T | 0.2352% |
| displacement_no_policy | 2036 | gdpReal | 34.5959T | 34.2996T | 0.8565% |
| displacement_no_policy | 2036 | consumption | 30.7311T | 30.6487T | 0.2681% |
| displacement_no_policy | 2036 | investment | 8.1311T | 8.1210T | 0.1248% |
| displacement_no_policy | 2036 | governmentSpending | 7.0610T | 7.0470T | 0.1970% |
| displacement_no_policy | 2036 | consumerWelfareIndex | 66.7120K | 66.1189K | 0.8891% |
| displacement_no_policy | 2036 | aiAdditionalOutput | 282.6292B | 284.3428B | 0.6063% |
| displacement_no_policy | 2036 | aiInvestmentBoost | 84.7888B | 85.3029B | 0.6063% |
| displacement_no_policy | 2036 | aiNetExportBoost | 28.2629B | 28.4343B | 0.6063% |
| displacement_no_policy | 2036 | aiConsumerGoodsPotential | 169.5775B | 170.6057B | 0.6063% |
| displacement_no_policy | 2036 | aiGoodsAbsorbed | 169.5775B | 170.6057B | 0.6063% |
| displacement_no_policy | 2036 | newJobEmployment | 768.6713K | 766.9492K | 0.2240% |
| displacement_no_policy | 2036 | newJobWageIncome | 86.0958B | 85.8261B | 0.3132% |
| displacement_no_policy | 2036 | wageConsumption | 20.6892T | 20.6664T | 0.1101% |
| displacement_no_policy | 2036 | assetConsumption | 3.3643T | 3.3627T | 0.0484% |
| displacement_no_policy | 2036 | transferConsumption | 6.9854T | 6.9695T | 0.2267% |
| displacement_no_policy | 2036 | corporateProfits | 4.9740T | 4.9627T | 0.2285% |
| displacement_no_policy | 2036 | aiCorporateProfits | 70.6573B | 71.0857B | 0.6063% |
| displacement_no_policy | 2036 | traditionalCorporateProfits | 4.9034T | 4.8916T | 0.2405% |
| displacement_no_policy | 2036 | aiGDPContribution | 282.6292B | 284.3428B | 0.6063% |
| displacement_no_policy | 2037 | totalEmployment | 167.9271M | 167.9087M | 0.0109% |
| displacement_no_policy | 2037 | totalUnemployment | 11.9832M | 12.0016M | 0.1534% |

*...and 1813 more warnings*

## Detailed Year-by-Year Comparison (Scenarios with Issues)

### zero_displacement

**Year 2026**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 32.1442T | 32.9900T | 2.6313% | **FAIL** |

**Year 2027**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 33.1365T | 34.9033T | 5.3318% | **FAIL** |

**Year 2028**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 33.8511T | 36.5942T | 8.1033% | **FAIL** |

**Year 2029**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 34.3152T | 38.0719T | 10.9478% | **FAIL** |

**Year 2030**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 34.6034T | 39.4019T | 13.8672% | **FAIL** |

**Year 2031**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 34.7788T | 40.6437T | 16.8633% | **FAIL** |

**Year 2032**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 34.8845T | 41.8398T | 19.9383% | **FAIL** |

**Year 2033**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 34.9475T | 43.0184T | 23.0942% | **FAIL** |

**Year 2034**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 34.9849T | 44.1975T | 26.3331% | **FAIL** |

**Year 2035**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 35.0067T | 45.3888T | 29.6573% | **FAIL** |

**Year 2036**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 35.0192T | 46.5996T | 33.0689% | **FAIL** |

**Year 2037**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 35.0260T | 47.8351T | 36.5703% | **FAIL** |

**Year 2038**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 35.0294T | 49.0985T | 40.1639% | **FAIL** |

**Year 2039**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 35.0307T | 50.3924T | 43.8520% | **FAIL** |

**Year 2040**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 35.0309T | 51.7185T | 47.6371% | **FAIL** |

**Year 2041**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 35.0303T | 53.0785T | 51.5218% | **FAIL** |

**Year 2042**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 35.0292T | 54.4735T | 55.5088% | **FAIL** |

**Year 2043**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 35.0280T | 55.9048T | 59.6006% | **FAIL** |

**Year 2044**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 35.0265T | 57.3735T | 63.8001% | **FAIL** |

**Year 2045**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 35.0250T | 58.8806T | 68.1102% | **FAIL** |

**Year 2046**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 35.0235T | 60.4273T | 72.5336% | **FAIL** |

**Year 2047**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 35.0220T | 62.0146T | 77.0734% | **FAIL** |

**Year 2048**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 35.0204T | 63.6436T | 81.7327% | **FAIL** |

**Year 2049**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 35.0189T | 65.3153T | 86.5146% | **FAIL** |

**Year 2050**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 35.0174T | 67.0311T | 91.4223% | **FAIL** |

### displacement_no_policy

**Year 2026**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 32.1442T | 32.9900T | 2.6313% | **FAIL** |

**Year 2027**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 33.1365T | 34.9033T | 5.3318% | **FAIL** |

**Year 2028**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 33.8511T | 36.5942T | 8.1033% | **FAIL** |

**Year 2029**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 34.3152T | 38.0719T | 10.9478% | **FAIL** |

**Year 2030**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 34.6034T | 39.4019T | 13.8672% | **FAIL** |

**Year 2031**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 34.7788T | 40.6437T | 16.8633% | **FAIL** |

**Year 2032**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| aiAdditionalOutput | 320.5461M | 328.9254M | 2.6141% | **FAIL** |
| aiInvestmentBoost | 96.1638M | 98.6776M | 2.6141% | **FAIL** |
| aiNetExportBoost | 32.0546M | 32.8925M | 2.6141% | **FAIL** |
| aiConsumerGoodsPotential | 192.3277M | 197.3553M | 2.6141% | **FAIL** |
| aiGoodsAbsorbed | 192.3277M | 197.3553M | 2.6141% | **FAIL** |
| potentialGDP | 34.8872T | 41.8386T | 19.9252% | **FAIL** |
| aiCorporateProfits | 80.1365M | 82.2314M | 2.6141% | **FAIL** |
| aiGDPContribution | 320.5461M | 328.9254M | 2.6141% | **FAIL** |
| maxNeutralTransfers | 2.7205B | 2.1772B | 19.9721% | **FAIL** |

**Year 2033**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 7.0751M | 7.0767M | 0.0231% | WARN |
| aiAdditionalOutput | 5.5776B | 5.7084B | 2.3461% | **FAIL** |
| aiInvestmentBoost | 1.6733B | 1.7125B | 2.3461% | **FAIL** |
| aiNetExportBoost | 557.7579M | 570.8435M | 2.3461% | **FAIL** |
| aiConsumerGoodsPotential | 3.3465B | 3.4251B | 2.3461% | **FAIL** |
| aiGoodsAbsorbed | 3.3465B | 3.4251B | 2.3461% | **FAIL** |
| newJobEmployment | 784.4647K | 784.4545K | 0.0013% | WARN |
| potentialGDP | 34.9784T | 43.0068T | 22.9524% | **FAIL** |
| aiCorporateProfits | 1.3944B | 1.4271B | 2.3461% | **FAIL** |
| aiGDPContribution | 5.5776B | 5.7084B | 2.3461% | **FAIL** |
| maxNeutralTransfers | 25.9452B | 20.1413B | 22.3698% | **FAIL** |

**Year 2034**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 7.4685M | 7.4772M | 0.1155% | WARN |
| aiAdditionalOutput | 34.7859B | 35.3821B | 1.7139% | **FAIL** |
| aiInvestmentBoost | 10.4358B | 10.6146B | 1.7139% | **FAIL** |
| aiNetExportBoost | 3.4786B | 3.5382B | 1.7139% | **FAIL** |
| aiConsumerGoodsPotential | 20.8715B | 21.2293B | 1.7139% | **FAIL** |
| aiGoodsAbsorbed | 20.8715B | 21.2293B | 1.7139% | **FAIL** |
| newJobEmployment | 783.8493K | 783.8003K | 0.0062% | WARN |
| potentialGDP | 35.1026T | 44.1570T | 25.7941% | **FAIL** |
| aiCorporateProfits | 8.6965B | 8.8455B | 1.7139% | **FAIL** |
| aiGDPContribution | 34.7859B | 35.3821B | 1.7139% | **FAIL** |
| maxNeutralTransfers | 76.2734B | 56.9586B | 25.3231% | **FAIL** |

**Year 2035**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 170.0374M | 170.0198M | 0.0103% | WARN |
| totalUnemployment | 8.4422M | 8.4598M | 0.2075% | WARN |
| aggregateWageIncome | 26.2544T | 26.2448T | 0.0368% | WARN |
| aggregateAssetIncome | 9.2986T | 9.3001T | 0.0163% | WARN |
| aggregateTransferIncome | 7.6491T | 7.6448T | 0.0552% | WARN |
| totalIncome | 43.2021T | 43.1898T | 0.0286% | WARN |
| gdpNominal | 44.9095T | 44.8785T | 0.0691% | WARN |
| gdpReal | 35.0234T | 34.9503T | 0.2089% | WARN |
| consumption | 31.0158T | 30.9877T | 0.0905% | WARN |
| governmentSpending | 6.9733T | 6.9699T | 0.0478% | WARN |
| consumerWelfareIndex | 68.3576K | 68.2002K | 0.2302% | WARN |
| aiAdditionalOutput | 120.9332B | 122.2624B | 1.0991% | **FAIL** |
| aiInvestmentBoost | 36.2800B | 36.6787B | 1.0991% | **FAIL** |
| aiNetExportBoost | 12.0933B | 12.2262B | 1.0991% | **FAIL** |
| aiConsumerGoodsPotential | 72.5599B | 73.3574B | 1.0991% | **FAIL** |
| aiGoodsAbsorbed | 72.5599B | 73.3574B | 1.0991% | **FAIL** |
| newJobEmployment | 779.5367K | 779.4215K | 0.0148% | WARN |
| newJobWageIncome | 87.4475B | 87.4137B | 0.0386% | WARN |
| potentialGDP | 35.0960T | 44.9519T | 28.0825% | **FAIL** |
| wageConsumption | 20.9602T | 20.9512T | 0.0429% | WARN |
| assetConsumption | 3.2545T | 3.2551T | 0.0163% | WARN |
| transferConsumption | 6.8842T | 6.8804T | 0.0552% | WARN |
| corporateProfits | 4.9570T | 4.9538T | 0.0651% | WARN |
| aiCorporateProfits | 30.2333B | 30.5656B | 1.0991% | **FAIL** |
| traditionalCorporateProfits | 4.9267T | 4.9232T | 0.0722% | WARN |
| aiGDPContribution | 120.9332B | 122.2624B | 1.0991% | **FAIL** |
| maxNeutralTransfers | 139.8898B | 103.3395B | 26.1279% | **FAIL** |

**Year 2036**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 169.3543M | 169.3360M | 0.0108% | WARN |
| totalUnemployment | 9.8392M | 9.8575M | 0.1855% | WARN |
| aggregateWageIncome | 26.0390T | 26.0120T | 0.1037% | WARN |
| aggregateAssetIncome | 9.6123T | 9.6077T | 0.0484% | WARN |
| aggregateTransferIncome | 7.7615T | 7.7439T | 0.2267% | WARN |
| totalIncome | 43.4128T | 43.3635T | 0.1134% | WARN |
| gdpNominal | 44.8589T | 44.7534T | 0.2352% | WARN |
| gdpReal | 34.5959T | 34.2996T | 0.8565% | WARN |
| consumption | 30.7311T | 30.6487T | 0.2681% | WARN |
| investment | 8.1311T | 8.1210T | 0.1248% | WARN |
| governmentSpending | 7.0610T | 7.0470T | 0.1970% | WARN |
| consumerWelfareIndex | 66.7120K | 66.1189K | 0.8891% | WARN |
| aiAdditionalOutput | 282.6292B | 284.3428B | 0.6063% | WARN |
| aiInvestmentBoost | 84.7888B | 85.3029B | 0.6063% | WARN |
| aiNetExportBoost | 28.2629B | 28.4343B | 0.6063% | WARN |
| aiConsumerGoodsPotential | 169.5775B | 170.6057B | 0.6063% | WARN |
| aiGoodsAbsorbed | 169.5775B | 170.6057B | 0.6063% | WARN |
| newJobEmployment | 768.6713K | 766.9492K | 0.2240% | WARN |
| newJobWageIncome | 86.0958B | 85.8261B | 0.3132% | WARN |
| potentialGDP | 34.7654T | 44.9240T | 29.2203% | **FAIL** |
| wageConsumption | 20.6892T | 20.6664T | 0.1101% | WARN |
| assetConsumption | 3.3643T | 3.3627T | 0.0484% | WARN |
| transferConsumption | 6.9854T | 6.9695T | 0.2267% | WARN |
| corporateProfits | 4.9740T | 4.9627T | 0.2285% | WARN |
| aiCorporateProfits | 70.6573B | 71.0857B | 0.6063% | WARN |
| traditionalCorporateProfits | 4.9034T | 4.8916T | 0.2405% | WARN |
| aiGDPContribution | 282.6292B | 284.3428B | 0.6063% | WARN |
| maxNeutralTransfers | 248.1921B | 189.1607B | 23.7846% | **FAIL** |

**Year 2037**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 167.9271M | 167.9087M | 0.0109% | WARN |
| totalUnemployment | 11.9832M | 12.0016M | 0.1534% | WARN |
| aggregateWageIncome | 24.9946T | 24.9268T | 0.2711% | WARN |
| aggregateAssetIncome | 9.8318T | 9.8106T | 0.2158% | WARN |
| aggregateTransferIncome | 7.8047T | 7.7851T | 0.2516% | WARN |
| totalIncome | 42.6311T | 42.5225T | 0.2548% | WARN |
| gdpNominal | 43.6774T | 42.3110T | 3.1284% | **FAIL** |
| gdpReal | 33.6758T | 32.0886T | 4.7133% | **FAIL** |
| consumption | 29.5386T | 28.2193T | 4.4664% | **FAIL** |
| investment | 8.1105T | 8.0786T | 0.3935% | WARN |
| governmentSpending | 7.0607T | 7.0428T | 0.2538% | WARN |
| consumerWelfareIndex | 63.8509K | 60.0011K | 6.0294% | WARN |
| aiAdditionalOutput | 590.2807B | 592.0800B | 0.3048% | WARN |
| aiInvestmentBoost | 177.0842B | 177.6240B | 0.3048% | WARN |
| aiNetExportBoost | 59.0281B | 59.2080B | 0.3048% | WARN |
| aiConsumerGoodsPotential | 354.1684B | 355.2480B | 0.3048% | WARN |
| aiGoodsAbsorbed | 354.1684B | 355.2480B | 0.3048% | WARN |
| newJobEmployment | 744.8631K | 738.4018K | 0.8674% | WARN |
| newJobWageIncome | 81.1350B | 80.2247B | 1.1220% | **FAIL** |
| potentialGDP | 34.0300T | 42.6663T | 25.3786% | **FAIL** |
| wageConsumption | 19.7132T | 19.6584T | 0.2775% | WARN |
| assetConsumption | 3.4411T | 3.4337T | 0.2158% | WARN |
| transferConsumption | 7.0242T | 7.0066T | 0.2516% | WARN |
| corporateProfits | 4.8872T | 4.7371T | 3.0703% | **FAIL** |
| aiCorporateProfits | 147.5702B | 148.0200B | 0.3048% | WARN |
| traditionalCorporateProfits | 4.7396T | 4.5891T | 3.1754% | **FAIL** |
| aiGDPContribution | 590.2807B | 592.0800B | 0.3048% | WARN |
| maxNeutralTransfers | 375.5823B | 308.4131B | 17.8840% | **FAIL** |

**Year 2038**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 165.6288M | 165.5895M | 0.0237% | WARN |
| totalUnemployment | 15.0012M | 15.0404M | 0.2616% | WARN |
| aggregateWageIncome | 22.9924T | 22.2572T | 3.1978% | **FAIL** |
| aggregateAssetIncome | 9.8717T | 9.5359T | 3.4016% | **FAIL** |
| aggregateTransferIncome | 7.8627T | 7.8434T | 0.2447% | WARN |
| totalIncome | 40.7268T | 39.6365T | 2.6771% | **FAIL** |
| gdpNominal | 39.6783T | 38.1446T | 3.8653% | **FAIL** |
| gdpReal | 31.0964T | 28.8818T | 7.1217% | **FAIL** |
| consumption | 25.6969T | 24.6566T | 4.0485% | **FAIL** |
| investment | 7.9140T | 7.4484T | 5.8832% | **FAIL** |
| governmentSpending | 7.0202T | 6.9591T | 0.8703% | WARN |
| consumerWelfareIndex | 56.2368K | 52.1322K | 7.2987% | WARN |
| aiAdditionalOutput | 1.0986T | 1.0995T | 0.0841% | WARN |
| aiInvestmentBoost | 329.5686B | 329.8456B | 0.0841% | WARN |
| aiNetExportBoost | 109.8562B | 109.9485B | 0.0841% | WARN |
| aiConsumerGoodsPotential | 659.1371B | 659.6911B | 0.0841% | WARN |
| aiGoodsAbsorbed | 659.1371B | 659.6911B | 0.0841% | WARN |
| newJobEmployment | 705.5013K | 672.2115K | 4.7186% | **FAIL** |
| newJobWageIncome | 72.1980B | 66.6051B | 7.7467% | **FAIL** |
| potentialGDP | 31.7555T | 38.8043T | 22.1970% | **FAIL** |
| wageConsumption | 17.9450T | 17.3688T | 3.2113% | **FAIL** |
| assetConsumption | 3.4551T | 3.3376T | 3.4016% | **FAIL** |
| transferConsumption | 7.0764T | 7.0591T | 0.2447% | WARN |
| corporateProfits | 4.5184T | 4.3498T | 3.7309% | **FAIL** |
| aiCorporateProfits | 274.6405B | 274.8713B | 0.0841% | WARN |
| traditionalCorporateProfits | 4.2438T | 4.0750T | 3.9778% | **FAIL** |
| aiGDPContribution | 1.0986T | 1.0995T | 0.0841% | WARN |
| maxNeutralTransfers | 544.4298B | 526.2113B | 3.3463% | **FAIL** |

**Year 2039**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 159.8838M | 159.5659M | 0.1988% | WARN |
| totalUnemployment | 21.4687M | 21.7866M | 1.4808% | **FAIL** |
| aggregateWageIncome | 18.4282T | 17.6059T | 4.4623% | **FAIL** |
| aggregateAssetIncome | 9.4051T | 9.0246T | 4.0455% | **FAIL** |
| aggregateTransferIncome | 7.9868T | 7.9729T | 0.1739% | WARN |
| totalIncome | 35.8202T | 34.6035T | 3.3967% | **FAIL** |
| gdpNominal | 33.0134T | 31.3650T | 4.9929% | **FAIL** |
| gdpReal | 27.0232T | 23.9579T | 11.3433% | **FAIL** |
| consumption | 19.7090T | 18.3717T | 6.7851% | **FAIL** |
| investment | 7.1677T | 6.8819T | 3.9870% | **FAIL** |
| governmentSpending | 6.8833T | 6.8165T | 0.9708% | WARN |
| consumerWelfareIndex | 44.8705K | 39.0302K | 13.0158% | WARN |
| aiAdditionalOutput | 2.1868T | 2.2292T | 1.9371% | **FAIL** |
| aiInvestmentBoost | 656.0409B | 668.7492B | 1.9371% | **FAIL** |
| aiNetExportBoost | 218.6803B | 222.9164B | 1.9371% | **FAIL** |
| aiConsumerGoodsPotential | 1.3121T | 1.3375T | 1.9371% | **FAIL** |
| unrealizedAIOutput | 87.1471B | 173.5587B | 99.1560% | **FAIL** |
| aiGoodsAbsorbed | 1.2249T | 1.1639T | 4.9794% | **FAIL** |
| newJobEmployment | 613.2503K | 568.0593K | 7.3691% | **FAIL** |
| newJobWageIncome | 53.0987B | 47.1237B | 11.2525% | **FAIL** |
| potentialGDP | 28.3353T | 32.7025T | 15.4127% | **FAIL** |
| wageConsumption | 14.0572T | 13.4145T | 4.5721% | **FAIL** |
| assetConsumption | 3.2918T | 3.1586T | 4.0455% | **FAIL** |
| transferConsumption | 7.1881T | 7.1756T | 0.1739% | WARN |
| corporateProfits | 3.9254T | 3.7379T | 4.7761% | **FAIL** |
| aiCorporateProfits | 524.9140B | 513.9014B | 2.0980% | **FAIL** |
| traditionalCorporateProfits | 3.4005T | 3.2240T | 5.1895% | **FAIL** |
| aiGDPContribution | 2.0997T | 2.0556T | 2.0980% | **FAIL** |
| maxNeutralTransfers | 668.8668B | 950.9910B | 42.1794% | **FAIL** |

**Year 2040**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 148.8419M | 146.7357M | 1.4151% | **FAIL** |
| totalUnemployment | 33.2359M | 35.3422M | 6.3374% | **FAIL** |
| aggregateWageIncome | 12.2282T | 11.1484T | 8.8307% | **FAIL** |
| aggregateAssetIncome | 8.2561T | 7.8146T | 5.3479% | **FAIL** |
| aggregateTransferIncome | 8.2128T | 8.2332T | 0.2490% | WARN |
| totalIncome | 28.6971T | 27.1962T | 5.2302% | **FAIL** |
| gdpNominal | 26.9042T | 25.6582T | 4.6312% | **FAIL** |
| gdpReal | 23.4117T | 19.9883T | 14.6229% | **FAIL** |
| consumption | 14.1461T | 13.1648T | 6.9370% | **FAIL** |
| investment | 6.4922T | 6.2522T | 3.6971% | **FAIL** |
| governmentSpending | 6.6551T | 6.5843T | 1.0631% | **FAIL** |
| consumerWelfareIndex | 34.1009K | 28.4104K | 16.6871% | WARN |
| aiAdditionalOutput | 4.1401T | 4.2001T | 1.4475% | **FAIL** |
| aiInvestmentBoost | 1.2420T | 1.2600T | 1.4475% | **FAIL** |
| aiNetExportBoost | 414.0136B | 420.0064B | 1.4475% | **FAIL** |
| aiConsumerGoodsPotential | 2.4841T | 2.5200T | 1.4475% | **FAIL** |
| unrealizedAIOutput | 819.5553B | 948.5572B | 15.7405% | **FAIL** |
| aiGoodsAbsorbed | 1.6645T | 1.5715T | 5.5899% | **FAIL** |
| newJobEmployment | 475.4089K | 419.8207K | 11.6927% | **FAIL** |
| newJobWageIncome | 30.2895B | 24.7738B | 18.2101% | **FAIL** |
| potentialGDP | 25.8958T | 28.1783T | 8.8140% | **FAIL** |
| wageConsumption | 8.9355T | 8.0820T | 9.5523% | **FAIL** |
| assetConsumption | 2.8896T | 2.7351T | 5.3479% | **FAIL** |
| transferConsumption | 7.3915T | 7.4099T | 0.2490% | WARN |
| corporateProfits | 3.4243T | 3.2776T | 4.2849% | **FAIL** |
| aiCorporateProfits | 830.1453B | 812.8768B | 2.0802% | **FAIL** |
| traditionalCorporateProfits | 2.5942T | 2.4647T | 4.9904% | **FAIL** |
| aiGDPContribution | 3.3206T | 3.2515T | 2.0802% | **FAIL** |
| totalDemandSpilloverLoss | 242.8830K | 1.9181M | 689.7357% | **FAIL** |
| maxNeutralTransfers | 758.5143B | 1.2994T | 71.3062% | **FAIL** |

**Year 2041**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 116.6885M | 112.5996M | 3.5041% | **FAIL** |
| totalUnemployment | 66.1177M | 70.2066M | 6.1842% | **FAIL** |
| aggregateWageIncome | 5.2642T | 4.6189T | 12.2595% | **FAIL** |
| aggregateAssetIncome | 7.1615T | 6.8056T | 4.9701% | **FAIL** |
| aggregateTransferIncome | 8.8441T | 8.9026T | 0.6616% | WARN |
| totalIncome | 21.2698T | 20.3270T | 4.4325% | **FAIL** |
| gdpNominal | 22.8080T | 22.1705T | 2.7948% | **FAIL** |
| gdpReal | 21.3242T | 17.7919T | 16.5647% | **FAIL** |
| consumption | 9.6347T | 9.2289T | 4.2123% | **FAIL** |
| investment | 6.6428T | 6.4378T | 3.0852% | **FAIL** |
| governmentSpending | 6.4459T | 6.3889T | 0.8839% | WARN |
| consumerWelfareIndex | 24.8546K | 20.4351K | 17.7814% | WARN |
| unrealizedAIOutput | 2.4110T | 2.4963T | 3.5363% | **FAIL** |
| aiGoodsAbsorbed | 2.0241T | 1.9388T | 4.2123% | **FAIL** |
| newJobEmployment | 335.1973K | 286.1817K | 14.6229% | **FAIL** |
| newJobWageIncome | 12.3178B | 9.5798B | 22.2275% | **FAIL** |
| potentialGDP | 25.7593T | 26.6057T | 3.2854% | **FAIL** |
| wageConsumption | 3.3752T | 2.9098T | 13.7900% | **FAIL** |
| assetConsumption | 2.5065T | 2.3819T | 4.9701% | **FAIL** |
| transferConsumption | 7.9597T | 8.0123T | 0.6616% | WARN |
| corporateProfits | 3.2062T | 3.1241T | 2.5593% | **FAIL** |
| aiCorporateProfits | 1.2452T | 1.2239T | 1.7118% | **FAIL** |
| traditionalCorporateProfits | 1.9610T | 1.9002T | 3.0974% | **FAIL** |
| aiGDPContribution | 4.9809T | 4.8956T | 1.7118% | **FAIL** |
| totalDemandSpilloverLoss | 14.4507M | 18.4905M | 27.9561% | **FAIL** |
| maxNeutralTransfers | 841.1068B | 1.4036T | 66.8706% | **FAIL** |

**Year 2042**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 94.1598M | 92.0032M | 2.2903% | **FAIL** |
| totalUnemployment | 89.3776M | 91.5342M | 2.4129% | **FAIL** |
| aggregateWageIncome | 2.7646T | 2.5651T | 7.2156% | **FAIL** |
| aggregateAssetIncome | 6.2045T | 6.0650T | 2.2485% | **FAIL** |
| aggregateTransferIncome | 9.2907T | 9.3121T | 0.2305% | WARN |
| totalIncome | 18.2598T | 17.9422T | 1.7392% | **FAIL** |
| gdpNominal | 21.4187T | 21.1765T | 1.1307% | **FAIL** |
| gdpReal | 21.7363T | 17.6787T | 18.6676% | **FAIL** |
| consumption | 8.0991T | 7.9650T | 1.6560% | **FAIL** |
| investment | 6.6287T | 6.5413T | 1.3191% | **FAIL** |
| governmentSpending | 6.3056T | 6.2695T | 0.5730% | WARN |
| consumerWelfareIndex | 22.5879K | 18.2737K | 19.0997% | WARN |
| unrealizedAIOutput | 3.4769T | 3.5128T | 1.0308% | **FAIL** |
| aiGoodsAbsorbed | 2.1641T | 2.1283T | 1.6560% | **FAIL** |
| newJobEmployment | 262.0088K | 218.6078K | 16.5647% | **FAIL** |
| newJobWageIncome | 6.5443B | 5.1926B | 20.6545% | **FAIL** |
| potentialGDP | 27.3774T | 26.8176T | 2.0448% | **FAIL** |
| wageConsumption | 1.5994T | 1.4689T | 8.1579% | **FAIL** |
| assetConsumption | 2.1716T | 2.1227T | 2.2485% | **FAIL** |
| transferConsumption | 8.3616T | 8.3809T | 0.2305% | WARN |
| corporateProfits | 3.1855T | 3.1539T | 0.9938% | WARN |
| aiCorporateProfits | 1.4812T | 1.4723T | 0.6049% | WARN |
| traditionalCorporateProfits | 1.7043T | 1.6816T | 1.3318% | **FAIL** |
| aiGDPContribution | 5.9249T | 5.8890T | 0.6049% | WARN |
| totalDemandSpilloverLoss | 25.2643M | 27.3774M | 8.3643% | **FAIL** |
| maxNeutralTransfers | 1.0032T | 1.6318T | 62.6648% | **FAIL** |

**Year 2043**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 79.6391M | 78.8889M | 0.9421% | WARN |
| totalUnemployment | 104.6324M | 105.3827M | 0.7170% | WARN |
| aggregateWageIncome | 1.8355T | 1.7840T | 2.8105% | **FAIL** |
| aggregateAssetIncome | 6.3452T | 6.3385T | 0.1060% | WARN |
| aggregateTransferIncome | 9.5836T | 9.5780T | 0.0583% | WARN |
| totalIncome | 17.7644T | 17.7005T | 0.3597% | WARN |
| gdpNominal | 21.8358T | 21.8035T | 0.1479% | WARN |
| gdpReal | 24.4147T | 19.2079T | 21.3263% | **FAIL** |
| consumption | 7.5966T | 7.5535T | 0.5670% | WARN |
| investment | 7.3709T | 7.3984T | 0.3729% | WARN |
| governmentSpending | 6.2580T | 6.2354T | 0.3611% | WARN |
| consumerWelfareIndex | 23.2496K | 18.2146K | 21.6565% | WARN |
| unrealizedAIOutput | 4.3456T | 4.3594T | 0.3187% | WARN |
| aiGoodsAbsorbed | 2.4427T | 2.4288T | 0.5670% | WARN |
| newJobEmployment | 215.4835K | 175.2579K | 18.6676% | **FAIL** |
| newJobWageIncome | 4.4700B | 3.5694B | 20.1483% | **FAIL** |
| potentialGDP | 31.2029T | 28.5917T | 8.3684% | **FAIL** |
| wageConsumption | 987.6917B | 956.3013B | 3.1782% | **FAIL** |
| assetConsumption | 2.2208T | 2.2185T | 0.1060% | WARN |
| transferConsumption | 8.6252T | 8.6202T | 0.0583% | WARN |
| corporateProfits | 3.3775T | 3.3720T | 0.1626% | WARN |
| aiCorporateProfits | 1.7420T | 1.7386T | 0.1988% | WARN |
| traditionalCorporateProfits | 1.6354T | 1.6334T | 0.1240% | WARN |
| aiGDPContribution | 6.9682T | 6.9543T | 0.1988% | WARN |
| totalDemandSpilloverLoss | 25.0455M | 25.7555M | 2.8350% | **FAIL** |
| maxNeutralTransfers | 1.3633T | 2.1451T | 57.3474% | **FAIL** |

**Year 2044**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 74.0334M | 73.9829M | 0.0682% | WARN |
| totalUnemployment | 110.9753M | 111.0257M | 0.0455% | WARN |
| aggregateWageIncome | 1.6224T | 1.6182T | 0.2579% | WARN |
| aggregateAssetIncome | 7.2444T | 7.2809T | 0.5044% | WARN |
| aggregateTransferIncome | 9.7054T | 9.6863T | 0.1960% | WARN |
| totalIncome | 18.5721T | 18.5854T | 0.0718% | WARN |
| gdpNominal | 22.8275T | 22.8023T | 0.1102% | WARN |
| gdpReal | 28.6265T | 21.5558T | 24.6998% | **FAIL** |
| consumption | 7.5668T | 7.5200T | 0.6183% | WARN |
| investment | 8.2498T | 8.2871T | 0.4524% | WARN |
| governmentSpending | 6.2723T | 6.2569T | 0.2457% | WARN |
| consumerWelfareIndex | 25.8704K | 19.3814K | 25.0828% | WARN |
| aiAdditionalOutput | 12.6979T | 12.6872T | 0.0847% | WARN |
| aiInvestmentBoost | 3.8094T | 3.8062T | 0.0847% | WARN |
| aiNetExportBoost | 1.2698T | 1.2687T | 0.0847% | WARN |
| aiConsumerGoodsPotential | 7.6188T | 7.6123T | 0.0847% | WARN |
| unrealizedAIOutput | 4.8880T | 4.9007T | 0.2605% | WARN |
| aiGoodsAbsorbed | 2.7308T | 2.7116T | 0.7025% | WARN |
| newJobEmployment | 208.3964K | 164.1372K | 21.2380% | **FAIL** |
| newJobWageIncome | 4.1887B | 3.2927B | 21.3922% | **FAIL** |
| potentialGDP | 36.2452T | 30.4146T | 16.0867% | **FAIL** |
| wageConsumption | 847.0179B | 844.6128B | 0.2839% | WARN |
| assetConsumption | 2.5355T | 2.5483T | 0.5044% | WARN |
| transferConsumption | 8.7348T | 8.7177T | 0.1960% | WARN |
| corporateProfits | 3.6044T | 3.5984T | 0.1680% | WARN |
| aiCorporateProfits | 1.9525T | 1.9466T | 0.3007% | WARN |
| traditionalCorporateProfits | 1.6519T | 1.6517T | 0.0112% | WARN |
| aiGDPContribution | 7.8099T | 7.7864T | 0.3007% | WARN |
| totalDemandSpilloverLoss | 21.6617M | 21.7349M | 0.3382% | WARN |
| maxNeutralTransfers | 1.9242T | 2.8888T | 50.1304% | **FAIL** |

**Year 2045**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 71.4209M | 71.2999M | 0.1694% | WARN |
| totalUnemployment | 114.3277M | 114.4487M | 0.1058% | WARN |
| aggregateWageIncome | 1.5724T | 1.5662T | 0.3942% | WARN |
| aggregateAssetIncome | 8.4891T | 8.3677T | 1.4296% | **FAIL** |
| aggregateTransferIncome | 9.7697T | 9.7521T | 0.1808% | WARN |
| totalIncome | 19.8312T | 19.6860T | 0.7323% | WARN |
| gdpNominal | 23.8192T | 23.7243T | 0.3984% | WARN |
| gdpReal | 33.8564T | 24.3182T | 28.1725% | **FAIL** |
| consumption | 7.7862T | 7.7073T | 1.0132% | **FAIL** |
| investment | 8.9039T | 8.9020T | 0.0217% | WARN |
| governmentSpending | 6.3063T | 6.2911T | 0.2405% | WARN |
| consumerWelfareIndex | 30.0529K | 21.4530K | 28.6158% | WARN |
| aiAdditionalOutput | 13.7817T | 13.7865T | 0.0343% | WARN |
| aiInvestmentBoost | 4.1345T | 4.1359T | 0.0343% | WARN |
| aiNetExportBoost | 1.3782T | 1.3786T | 0.0343% | WARN |
| aiConsumerGoodsPotential | 8.2690T | 8.2719T | 0.0343% | WARN |
| unrealizedAIOutput | 5.2193T | 5.2520T | 0.6265% | WARN |
| aiGoodsAbsorbed | 3.0498T | 3.0199T | 0.9793% | WARN |
| newJobEmployment | 218.2551K | 164.2998K | 24.7212% | **FAIL** |
| newJobWageIncome | 4.4533B | 3.3451B | 24.8849% | **FAIL** |
| potentialGDP | 42.1254T | 31.9961T | 24.0456% | **FAIL** |
| wageConsumption | 808.5933B | 804.8959B | 0.4573% | WARN |
| assetConsumption | 2.9712T | 2.9287T | 1.4296% | **FAIL** |
| transferConsumption | 8.7927T | 8.7768T | 0.1808% | WARN |
| corporateProfits | 3.8189T | 3.8045T | 0.3759% | WARN |
| aiCorporateProfits | 2.1406T | 2.1336T | 0.3267% | WARN |
| traditionalCorporateProfits | 1.6782T | 1.6709T | 0.4386% | WARN |
| aiGDPContribution | 8.5625T | 8.5345T | 0.3267% | WARN |
| totalDemandSpilloverLoss | 18.1419M | 18.1931M | 0.2822% | WARN |
| maxNeutralTransfers | 2.5003T | 3.5922T | 43.6731% | **FAIL** |

**Year 2046**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 70.1279M | 69.8936M | 0.3341% | WARN |
| totalUnemployment | 116.3638M | 116.5981M | 0.2013% | WARN |
| aggregateWageIncome | 1.5868T | 1.5718T | 0.9503% | WARN |
| aggregateAssetIncome | 9.2156T | 8.8491T | 3.9776% | **FAIL** |
| aggregateTransferIncome | 9.8088T | 9.7933T | 0.1579% | WARN |
| totalIncome | 20.6113T | 20.2142T | 1.9268% | **FAIL** |
| gdpNominal | 24.4467T | 24.2926T | 0.6303% | WARN |
| gdpReal | 39.7046T | 27.2092T | 31.4711% | **FAIL** |
| consumption | 7.9290T | 7.8251T | 1.3106% | **FAIL** |
| investment | 9.3085T | 9.2736T | 0.3755% | WARN |
| governmentSpending | 6.3402T | 6.3227T | 0.2769% | WARN |
| consumerWelfareIndex | 34.8300K | 23.7052K | 31.9402% | **FAIL** |
| unrealizedAIOutput | 5.4266T | 5.4695T | 0.7897% | WARN |
| aiGoodsAbsorbed | 3.2641T | 3.2214T | 1.3092% | **FAIL** |
| newJobEmployment | 238.1669K | 171.0542K | 28.1789% | **FAIL** |
| newJobWageIncome | 4.9716B | 3.5491B | 28.6119% | **FAIL** |
| potentialGDP | 48.3953T | 32.9834T | 31.8458% | **FAIL** |
| wageConsumption | 809.3186B | 800.6401B | 1.0723% | **FAIL** |
| assetConsumption | 3.2255T | 3.0972T | 3.9776% | **FAIL** |
| transferConsumption | 8.8279T | 8.8140T | 0.1579% | WARN |
| corporateProfits | 3.9572T | 3.9343T | 0.5793% | WARN |
| aiCorporateProfits | 2.2645T | 2.2538T | 0.4709% | WARN |
| traditionalCorporateProfits | 1.6928T | 1.6805T | 0.7242% | WARN |
| aiGDPContribution | 9.0579T | 9.0152T | 0.4709% | WARN |
| totalDemandSpilloverLoss | 15.4355M | 15.5980M | 1.0525% | **FAIL** |
| maxNeutralTransfers | 3.1318T | 4.2928T | 37.0705% | **FAIL** |

**Year 2047**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 69.0560M | 68.7179M | 0.4897% | WARN |
| totalUnemployment | 118.1816M | 118.5198M | 0.2861% | WARN |
| aggregateWageIncome | 1.5825T | 1.5599T | 1.4330% | **FAIL** |
| aggregateAssetIncome | 9.7057T | 9.1735T | 5.4833% | **FAIL** |
| aggregateTransferIncome | 9.8437T | 9.8302T | 0.1371% | WARN |
| totalIncome | 21.1319T | 20.5635T | 2.6896% | **FAIL** |
| gdpNominal | 24.7769T | 24.6155T | 0.6511% | WARN |
| gdpReal | 46.2811T | 30.3156T | 34.4968% | **FAIL** |
| consumption | 8.0256T | 7.9239T | 1.2675% | **FAIL** |
| investment | 9.4883T | 9.4445T | 0.4617% | WARN |
| governmentSpending | 6.3617T | 6.3421T | 0.3078% | WARN |
| consumerWelfareIndex | 40.3844K | 26.2890K | 34.9031% | **FAIL** |
| unrealizedAIOutput | 5.5638T | 5.6072T | 0.7796% | WARN |
| aiGoodsAbsorbed | 3.4124T | 3.3692T | 1.2653% | **FAIL** |
| newJobEmployment | 262.4319K | 179.7990K | 31.4874% | **FAIL** |
| newJobWageIncome | 5.5203B | 3.7472B | 32.1198% | **FAIL** |
| potentialGDP | 55.2573T | 33.5919T | 39.2082% | **FAIL** |
| wageConsumption | 801.4108B | 788.5178B | 1.6088% | **FAIL** |
| assetConsumption | 3.3970T | 3.2107T | 5.4833% | **FAIL** |
| transferConsumption | 8.8593T | 8.8472T | 0.1371% | WARN |
| corporateProfits | 4.0410T | 4.0172T | 0.5883% | WARN |
| aiCorporateProfits | 2.3491T | 2.3384T | 0.4581% | WARN |
| traditionalCorporateProfits | 1.6918T | 1.6788T | 0.7691% | WARN |
| aiGDPContribution | 9.3965T | 9.3535T | 0.4581% | WARN |
| totalDemandSpilloverLoss | 13.6289M | 13.8723M | 1.7859% | **FAIL** |
| maxNeutralTransfers | 3.8374T | 5.0284T | 31.0370% | **FAIL** |

**Year 2048**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 68.0648M | 67.7052M | 0.5283% | WARN |
| totalUnemployment | 119.9218M | 120.2814M | 0.2998% | WARN |
| aggregateWageIncome | 1.5612T | 1.5377T | 1.5032% | **FAIL** |
| aggregateAssetIncome | 10.0600T | 9.3829T | 6.7299% | **FAIL** |
| aggregateTransferIncome | 9.8771T | 9.8640T | 0.1325% | WARN |
| totalIncome | 21.4983T | 20.7847T | 3.3192% | **FAIL** |
| gdpNominal | 24.9864T | 24.8450T | 0.5657% | WARN |
| gdpReal | 53.9618T | 33.8144T | 37.3364% | **FAIL** |
| consumption | 8.0948T | 8.0027T | 1.1370% | **FAIL** |
| investment | 9.5898T | 9.5563T | 0.3491% | WARN |
| governmentSpending | 6.3730T | 6.3532T | 0.3112% | WARN |
| consumerWelfareIndex | 46.9066K | 29.2245K | 37.6964% | **FAIL** |
| unrealizedAIOutput | 5.6658T | 5.7061T | 0.7112% | WARN |
| aiGoodsAbsorbed | 3.5235T | 3.4836T | 1.1329% | **FAIL** |
| newJobEmployment | 290.9308K | 190.5148K | 34.5154% | **FAIL** |
| newJobWageIncome | 6.0938B | 3.9522B | 35.1445% | **FAIL** |
| potentialGDP | 63.1512T | 34.0348T | 46.1059% | **FAIL** |
| wageConsumption | 785.3268B | 772.0515B | 1.6904% | **FAIL** |
| assetConsumption | 3.5210T | 3.2840T | 6.7299% | **FAIL** |
| transferConsumption | 8.8894T | 8.8776T | 0.1325% | WARN |
| corporateProfits | 4.0995T | 4.0784T | 0.5148% | WARN |
| aiCorporateProfits | 2.4124T | 2.4025T | 0.4111% | WARN |
| traditionalCorporateProfits | 1.6870T | 1.6758T | 0.6631% | WARN |
| aiGDPContribution | 9.6498T | 9.6101T | 0.4111% | WARN |
| totalDemandSpilloverLoss | 12.4528M | 12.6979M | 1.9680% | **FAIL** |
| maxNeutralTransfers | 4.6492T | 5.8281T | 25.3573% | **FAIL** |

**Year 2049**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 67.5264M | 67.1867M | 0.5030% | WARN |
| totalUnemployment | 121.2121M | 121.5518M | 0.2802% | WARN |
| aggregateWageIncome | 1.5483T | 1.5271T | 1.3689% | **FAIL** |
| aggregateAssetIncome | 10.3263T | 9.5220T | 7.7885% | **FAIL** |
| aggregateTransferIncome | 9.9019T | 9.8884T | 0.1360% | WARN |
| totalIncome | 21.7765T | 20.9375T | 3.8524% | **FAIL** |
| gdpNominal | 25.1595T | 25.0421T | 0.4666% | WARN |
| gdpReal | 63.0319T | 37.7842T | 40.0555% | **FAIL** |
| consumption | 8.1525T | 8.0746T | 0.9562% | WARN |
| investment | 9.6778T | 9.6540T | 0.2453% | WARN |
| governmentSpending | 6.3802T | 6.3610T | 0.3001% | WARN |
| consumerWelfareIndex | 54.5836K | 32.5589K | 40.3503% | **FAIL** |
| unrealizedAIOutput | 5.7342T | 5.7687T | 0.6015% | WARN |
| aiGoodsAbsorbed | 3.6075T | 3.5730T | 0.9562% | WARN |
| newJobEmployment | 328.3903K | 205.7813K | 37.3364% | **FAIL** |
| newJobWageIncome | 6.8471B | 4.2540B | 37.8722% | **FAIL** |
| potentialGDP | 72.3736T | 34.3838T | 52.4913% | **FAIL** |
| wageConsumption | 775.5121B | 763.5219B | 1.5461% | **FAIL** |
| assetConsumption | 3.6142T | 3.3327T | 7.7885% | **FAIL** |
| transferConsumption | 8.9117T | 8.8996T | 0.1360% | WARN |
| corporateProfits | 4.1445T | 4.1267T | 0.4281% | WARN |
| aiCorporateProfits | 2.4588T | 2.4502T | 0.3507% | WARN |
| traditionalCorporateProfits | 1.6857T | 1.6766T | 0.5410% | WARN |
| aiGDPContribution | 9.8352T | 9.8007T | 0.3507% | WARN |
| totalDemandSpilloverLoss | 11.7553M | 11.9724M | 1.8466% | **FAIL** |
| maxNeutralTransfers | 5.5596T | 6.6653T | 19.8891% | **FAIL** |

**Year 2050**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 67.4198M | 67.0895M | 0.4898% | WARN |
| totalUnemployment | 122.0737M | 122.4039M | 0.2705% | WARN |
| aggregateWageIncome | 1.5474T | 1.5282T | 1.2387% | **FAIL** |
| aggregateAssetIncome | 10.5438T | 9.6259T | 8.7054% | **FAIL** |
| aggregateTransferIncome | 9.9184T | 9.9048T | 0.1376% | WARN |
| totalIncome | 22.0096T | 21.0589T | 4.3195% | **FAIL** |
| gdpNominal | 25.3100T | 25.2141T | 0.3788% | WARN |
| gdpReal | 73.6928T | 42.2497T | 42.6678% | **FAIL** |
| consumption | 8.2053T | 8.1430T | 0.7589% | WARN |
| investment | 9.7558T | 9.7377T | 0.1859% | WARN |
| governmentSpending | 6.3861T | 6.3678T | 0.2870% | WARN |
| consumerWelfareIndex | 63.5927K | 36.3200K | 42.8866% | **FAIL** |
| unrealizedAIOutput | 5.7764T | 5.8043T | 0.4825% | WARN |
| aiGoodsAbsorbed | 3.6726T | 3.6447T | 0.7589% | WARN |
| newJobEmployment | 376.6055K | 225.7545K | 40.0555% | **FAIL** |
| newJobWageIncome | 7.8403B | 4.6647B | 40.5032% | **FAIL** |
| potentialGDP | 83.1418T | 34.6631T | 58.3085% | **FAIL** |
| wageConsumption | 773.5252B | 762.6118B | 1.4109% | **FAIL** |
| assetConsumption | 3.6903T | 3.3691T | 8.7054% | **FAIL** |
| transferConsumption | 8.9266T | 8.9143T | 0.1376% | WARN |
| corporateProfits | 4.1802T | 4.1657T | 0.3456% | WARN |
| aiCorporateProfits | 2.4930T | 2.4860T | 0.2795% | WARN |
| traditionalCorporateProfits | 1.6872T | 1.6797T | 0.4434% | WARN |
| aiGDPContribution | 9.9719T | 9.9440T | 0.2795% | WARN |
| totalDemandSpilloverLoss | 11.3345M | 11.5139M | 1.5827% | **FAIL** |
| maxNeutralTransfers | 6.5829T | 7.5482T | 14.6644% | **FAIL** |

### ubi_only

**Year 2025**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| moneySupply | 24.1987T | 27.3974T | 13.2186% | **FAIL** |

**Year 2026**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| gdpReal | 37.6905T | 37.8063T | 0.3073% | WARN |
| consumerWelfareIndex | 81.3064K | 81.5562K | 0.3073% | WARN |
| potentialGDP | 37.6905T | 38.8011T | 2.9466% | **FAIL** |
| moneySupply | 27.4102T | 33.8205T | 23.3863% | **FAIL** |

**Year 2027**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 6.7585M | 6.7558M | 0.0386% | WARN |
| gdpReal | 42.5939T | 42.8563T | 0.6159% | WARN |
| consumerWelfareIndex | 90.9809K | 91.5415K | 0.6161% | WARN |
| newJobEmployment | 848.0358K | 850.6415K | 0.3073% | WARN |
| newJobWageIncome | 86.6987B | 86.9651B | 0.3073% | WARN |
| potentialGDP | 42.5939T | 45.1413T | 5.9806% | **FAIL** |
| moneySupply | 30.6346T | 40.2692T | 31.4501% | **FAIL** |

**Year 2028**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 6.6786M | 6.6726M | 0.0884% | WARN |
| gdpReal | 46.0435T | 46.4699T | 0.9261% | WARN |
| consumerWelfareIndex | 97.9389K | 98.8463K | 0.9265% | WARN |
| newJobEmployment | 958.3634K | 964.2664K | 0.6159% | WARN |
| newJobWageIncome | 113.5332B | 114.2331B | 0.6164% | WARN |
| potentialGDP | 46.0435T | 50.2355T | 9.1045% | **FAIL** |
| moneySupply | 33.8719T | 46.7437T | 38.0016% | **FAIL** |

**Year 2029**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 6.6315M | 6.6219M | 0.1447% | WARN |
| gdpReal | 48.4344T | 49.0338T | 1.2376% | **FAIL** |
| consumerWelfareIndex | 102.5745K | 103.8447K | 1.2383% | WARN |
| newJobEmployment | 1.0360M | 1.0456M | 0.9261% | WARN |
| newJobWageIncome | 136.0322B | 137.2939B | 0.9275% | WARN |
| potentialGDP | 48.4344T | 54.4019T | 12.3209% | **FAIL** |
| moneySupply | 37.1221T | 53.2441T | 43.4299% | **FAIL** |

**Year 2030**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 6.6084M | 6.5949M | 0.2041% | WARN |
| gdpReal | 50.0546T | 50.8307T | 1.5505% | **FAIL** |
| consumerWelfareIndex | 105.5288K | 107.1661K | 1.5515% | WARN |
| newJobEmployment | 1.0898M | 1.1033M | 1.2376% | **FAIL** |
| newJobWageIncome | 154.3446B | 156.2592B | 1.2405% | **FAIL** |
| potentialGDP | 50.0546T | 57.8795T | 15.6327% | **FAIL** |
| moneySupply | 40.3853T | 59.7705T | 48.0008% | **FAIL** |

**Year 2031**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 169.0496M | 169.0670M | 0.0103% | WARN |
| totalUnemployment | 6.6027M | 6.5852M | 0.2645% | WARN |
| aggregateWageIncome | 34.9746T | 34.9789T | 0.0121% | WARN |
| gdpReal | 51.1142T | 52.0673T | 1.8647% | **FAIL** |
| consumerWelfareIndex | 107.2681K | 109.2698K | 1.8660% | WARN |
| newJobEmployment | 1.1262M | 1.1437M | 1.5505% | **FAIL** |
| newJobWageIncome | 169.0247B | 171.6535B | 1.5552% | **FAIL** |
| potentialGDP | 51.1142T | 60.8476T | 19.0425% | **FAIL** |
| wageConsumption | 27.9797T | 27.9831T | 0.0121% | WARN |
| moneySupply | 43.6615T | 66.3231T | 51.9027% | **FAIL** |

**Year 2032**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 169.7422M | 169.7635M | 0.0126% | WARN |
| totalUnemployment | 6.6127M | 6.5913M | 0.3223% | WARN |
| aggregateWageIncome | 36.7696T | 36.7754T | 0.0158% | WARN |
| totalIncome | 63.2505T | 63.2571T | 0.0105% | WARN |
| gdpReal | 51.6898T | 52.8172T | 2.1809% | **FAIL** |
| consumption | 46.3277T | 46.3327T | 0.0106% | WARN |
| consumerWelfareIndex | 108.1404K | 110.5002K | 2.1822% | WARN |
| aiAdditionalOutput | 320.5461M | 334.9371M | 4.4895% | **FAIL** |
| aiInvestmentBoost | 96.1638M | 100.4811M | 4.4895% | **FAIL** |
| aiNetExportBoost | 32.0546M | 33.4937M | 4.4895% | **FAIL** |
| aiConsumerGoodsPotential | 192.3277M | 200.9623M | 4.4895% | **FAIL** |
| aiGoodsAbsorbed | 192.3277M | 200.9623M | 4.4895% | **FAIL** |
| newJobEmployment | 1.1500M | 1.1715M | 1.8646% | **FAIL** |
| newJobWageIncome | 180.7242B | 184.1065B | 1.8715% | **FAIL** |
| potentialGDP | 51.6900T | 63.3411T | 22.5403% | **FAIL** |
| wageConsumption | 29.4157T | 29.4203T | 0.0158% | WARN |
| aiCorporateProfits | 80.1365M | 83.7343M | 4.4895% | **FAIL** |
| aiGDPContribution | 320.5461M | 334.9371M | 4.4895% | **FAIL** |
| moneySupply | 46.9509T | 72.9018T | 55.2724% | **FAIL** |
| maxNeutralTransfers | 4.0308B | 2.6361B | 34.6008% | **FAIL** |

**Year 2033**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 170.3631M | 170.3857M | 0.0133% | WARN |
| totalUnemployment | 6.6972M | 6.6745M | 0.3386% | WARN |
| aggregateWageIncome | 38.2651T | 38.2724T | 0.0190% | WARN |
| aggregateAssetIncome | 13.1363T | 13.1380T | 0.0126% | WARN |
| totalIncome | 65.5064T | 65.5150T | 0.0131% | WARN |
| gdpNominal | 65.4399T | 65.4473T | 0.0113% | WARN |
| gdpReal | 51.9317T | 53.2307T | 2.5013% | **FAIL** |
| consumption | 47.9188T | 47.9247T | 0.0125% | WARN |
| investment | 11.5252T | 11.5268T | 0.0137% | WARN |
| consumerWelfareIndex | 108.3296K | 111.0406K | 2.5025% | WARN |
| aiAdditionalOutput | 5.5776B | 5.7905B | 3.8172% | **FAIL** |
| aiInvestmentBoost | 1.6733B | 1.7371B | 3.8172% | **FAIL** |
| aiNetExportBoost | 557.7579M | 579.0489M | 3.8172% | **FAIL** |
| aiConsumerGoodsPotential | 3.3465B | 3.4743B | 3.8172% | **FAIL** |
| aiGoodsAbsorbed | 3.3465B | 3.4743B | 3.8172% | **FAIL** |
| newJobEmployment | 1.1623M | 1.1876M | 2.1785% | **FAIL** |
| newJobWageIncome | 189.4093B | 193.5553B | 2.1889% | **FAIL** |
| potentialGDP | 51.9351T | 65.4508T | 26.0242% | **FAIL** |
| wageConsumption | 30.6121T | 30.6179T | 0.0190% | WARN |
| assetConsumption | 4.5977T | 4.5983T | 0.0126% | WARN |
| corporateProfits | 7.1992T | 7.2000T | 0.0117% | WARN |
| aiCorporateProfits | 1.3944B | 1.4476B | 3.8172% | **FAIL** |
| traditionalCorporateProfits | 7.1978T | 7.1986T | 0.0110% | WARN |
| aiGDPContribution | 5.5776B | 5.7905B | 3.8172% | **FAIL** |
| moneySupply | 50.2534T | 79.5068T | 58.2118% | **FAIL** |
| maxNeutralTransfers | 38.5240B | 24.2809B | 36.9721% | **FAIL** |

**Year 2034**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 7.0885M | 7.0715M | 0.2402% | WARN |
| aggregateWageIncome | 39.4768T | 39.4843T | 0.0191% | WARN |
| aggregateAssetIncome | 13.6326T | 13.6361T | 0.0258% | WARN |
| totalIncome | 67.4388T | 67.4492T | 0.0154% | WARN |
| gdpNominal | 67.2628T | 67.2704T | 0.0113% | WARN |
| gdpReal | 52.0051T | 53.4727T | 2.8220% | **FAIL** |
| consumption | 49.2638T | 49.2694T | 0.0114% | WARN |
| investment | 11.8375T | 11.8398T | 0.0196% | WARN |
| consumerWelfareIndex | 108.0728K | 111.1228K | 2.8221% | WARN |
| aiAdditionalOutput | 34.7859B | 35.6169B | 2.3890% | **FAIL** |
| aiInvestmentBoost | 10.4358B | 10.6851B | 2.3890% | **FAIL** |
| aiNetExportBoost | 3.4786B | 3.5617B | 2.3890% | **FAIL** |
| aiConsumerGoodsPotential | 20.8715B | 21.3702B | 2.3890% | **FAIL** |
| aiGoodsAbsorbed | 20.8715B | 21.3702B | 2.3890% | **FAIL** |
| newJobEmployment | 1.1639M | 1.1929M | 2.4901% | **FAIL** |
| newJobWageIncome | 195.4046B | 200.3003B | 2.5054% | **FAIL** |
| potentialGDP | 52.0260T | 67.2918T | 29.3427% | **FAIL** |
| wageConsumption | 31.5814T | 31.5874T | 0.0191% | WARN |
| assetConsumption | 4.7714T | 4.7726T | 0.0258% | WARN |
| corporateProfits | 7.4038T | 7.4047T | 0.0129% | WARN |
| aiCorporateProfits | 8.6965B | 8.9042B | 2.3890% | **FAIL** |
| traditionalCorporateProfits | 7.3951T | 7.3958T | 0.0101% | WARN |
| aiGDPContribution | 34.7859B | 35.6169B | 2.3890% | **FAIL** |
| moneySupply | 53.5692T | 86.1383T | 60.7983% | **FAIL** |
| maxNeutralTransfers | 113.0675B | 67.9376B | 39.9141% | **FAIL** |

**Year 2035**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 8.0662M | 8.0546M | 0.1439% | WARN |
| aggregateWageIncome | 40.2849T | 40.2978T | 0.0322% | WARN |
| aggregateAssetIncome | 14.1705T | 14.1756T | 0.0363% | WARN |
| aggregateTransferIncome | 14.5454T | 14.5433T | 0.0145% | WARN |
| totalIncome | 69.0007T | 69.0167T | 0.0232% | WARN |
| gdpNominal | 68.6985T | 68.7073T | 0.0128% | WARN |
| gdpReal | 51.9056T | 53.5094T | 3.0899% | **FAIL** |
| consumption | 50.2179T | 50.2251T | 0.0143% | WARN |
| investment | 12.1641T | 12.1668T | 0.0223% | WARN |
| governmentSpending | 7.9409T | 7.9398T | 0.0137% | WARN |
| consumerWelfareIndex | 107.2282K | 110.5431K | 3.0915% | WARN |
| aiAdditionalOutput | 120.9332B | 122.5205B | 1.3125% | **FAIL** |
| aiInvestmentBoost | 36.2800B | 36.7562B | 1.3125% | **FAIL** |
| aiNetExportBoost | 12.0933B | 12.2521B | 1.3125% | **FAIL** |
| aiConsumerGoodsPotential | 72.5599B | 73.5123B | 1.3125% | **FAIL** |
| aiGoodsAbsorbed | 72.5599B | 73.5123B | 1.3125% | **FAIL** |
| newJobEmployment | 1.1556M | 1.1880M | 2.8024% | **FAIL** |
| newJobWageIncome | 198.5886B | 204.2228B | 2.8371% | **FAIL** |
| potentialGDP | 51.9781T | 68.7808T | 32.3264% | **FAIL** |
| wageConsumption | 32.2039T | 32.2155T | 0.0363% | WARN |
| assetConsumption | 4.9597T | 4.9615T | 0.0363% | WARN |
| transferConsumption | 13.0909T | 13.0890T | 0.0145% | WARN |
| corporateProfits | 7.5738T | 7.5750T | 0.0157% | WARN |
| aiCorporateProfits | 30.2333B | 30.6301B | 1.3125% | **FAIL** |
| traditionalCorporateProfits | 7.5435T | 7.5443T | 0.0105% | WARN |
| aiGDPContribution | 120.9332B | 122.5205B | 1.3125% | **FAIL** |
| moneySupply | 56.8982T | 92.7963T | 63.0919% | **FAIL** |
| maxNeutralTransfers | 207.3199B | 121.7137B | 41.2918% | **FAIL** |

**Year 2036**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 169.7248M | 169.7423M | 0.0103% | WARN |
| totalUnemployment | 9.4687M | 9.4512M | 0.1851% | WARN |
| aggregateWageIncome | 40.1006T | 40.1178T | 0.0429% | WARN |
| aggregateAssetIncome | 14.7044T | 14.7094T | 0.0343% | WARN |
| aggregateTransferIncome | 14.7198T | 14.7071T | 0.0862% | WARN |
| totalIncome | 69.5248T | 69.5344T | 0.0138% | WARN |
| gdpNominal | 68.8110T | 68.7821T | 0.0421% | WARN |
| gdpReal | 51.2050T | 52.7175T | 2.9538% | **FAIL** |
| consumption | 49.9342T | 49.9108T | 0.0469% | WARN |
| investment | 12.4434T | 12.4464T | 0.0244% | WARN |
| governmentSpending | 8.0765T | 8.0680T | 0.1058% | WARN |
| consumerWelfareIndex | 104.5930K | 107.6773K | 2.9489% | WARN |
| aiAdditionalOutput | 282.6292B | 284.4419B | 0.6414% | WARN |
| aiInvestmentBoost | 84.7888B | 85.3326B | 0.6414% | WARN |
| aiNetExportBoost | 28.2629B | 28.4442B | 0.6414% | WARN |
| aiConsumerGoodsPotential | 169.5775B | 170.6651B | 0.6414% | WARN |
| aiGoodsAbsorbed | 169.5775B | 170.6651B | 0.6414% | WARN |
| newJobEmployment | 1.1392M | 1.1742M | 3.0733% | **FAIL** |
| newJobWageIncome | 196.1879B | 202.3027B | 3.1168% | **FAIL** |
| potentialGDP | 51.3745T | 68.9528T | 34.2158% | **FAIL** |
| wageConsumption | 31.9033T | 31.9189T | 0.0491% | WARN |
| assetConsumption | 5.1465T | 5.1483T | 0.0343% | WARN |
| transferConsumption | 13.2478T | 13.2364T | 0.0862% | WARN |
| corporateProfits | 7.6088T | 7.6059T | 0.0385% | WARN |
| aiCorporateProfits | 70.6573B | 71.1105B | 0.6414% | WARN |
| traditionalCorporateProfits | 7.5381T | 7.5347T | 0.0449% | WARN |
| aiGDPContribution | 282.6292B | 284.4419B | 0.6414% | WARN |
| moneySupply | 60.2405T | 99.4809T | 65.1397% | **FAIL** |
| maxNeutralTransfers | 367.3464B | 222.5027B | 39.4297% | **FAIL** |

**Year 2037**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 168.2847M | 168.3020M | 0.0103% | WARN |
| totalUnemployment | 11.6256M | 11.6083M | 0.1486% | WARN |
| aggregateWageIncome | 38.5885T | 38.5830T | 0.0144% | WARN |
| aggregateAssetIncome | 15.0828T | 15.0797T | 0.0204% | WARN |
| aggregateTransferIncome | 14.8230T | 14.7889T | 0.2298% | WARN |
| totalIncome | 68.4943T | 68.4516T | 0.0624% | WARN |
| gdpNominal | 67.1159T | 66.9856T | 0.1941% | WARN |
| gdpReal | 49.7258T | 50.8040T | 2.1682% | **FAIL** |
| consumption | 48.2429T | 48.1478T | 0.1970% | WARN |
| investment | 12.3826T | 12.3716T | 0.0890% | WARN |
| governmentSpending | 8.1054T | 8.0803T | 0.3101% | WARN |
| consumerWelfareIndex | 100.2090K | 102.3787K | 2.1652% | WARN |
| aiAdditionalOutput | 590.2807B | 592.5644B | 0.3869% | WARN |
| aiInvestmentBoost | 177.0842B | 177.7693B | 0.3869% | WARN |
| aiNetExportBoost | 59.0281B | 59.2564B | 0.3869% | WARN |
| aiConsumerGoodsPotential | 354.1684B | 355.5387B | 0.3869% | WARN |
| aiGoodsAbsorbed | 354.1684B | 355.5387B | 0.3869% | WARN |
| newJobEmployment | 1.1025M | 1.1349M | 2.9393% | **FAIL** |
| newJobWageIncome | 185.1111B | 190.5255B | 2.9250% | **FAIL** |
| potentialGDP | 50.0800T | 67.3411T | 34.4671% | **FAIL** |
| assetConsumption | 5.2790T | 5.2779T | 0.0204% | WARN |
| transferConsumption | 13.3407T | 13.3100T | 0.2298% | WARN |
| corporateProfits | 7.4654T | 7.4514T | 0.1877% | WARN |
| aiCorporateProfits | 147.5702B | 148.1411B | 0.3869% | WARN |
| traditionalCorporateProfits | 7.3178T | 7.3032T | 0.1993% | WARN |
| aiGDPContribution | 590.2807B | 592.5644B | 0.3869% | WARN |
| moneySupply | 63.5961T | 106.1923T | 66.9791% | **FAIL** |
| maxNeutralTransfers | 554.5863B | 356.7041B | 35.6811% | **FAIL** |

**Year 2038**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 165.9691M | 165.9897M | 0.0124% | WARN |
| totalUnemployment | 14.6608M | 14.6402M | 0.1406% | WARN |
| aggregateWageIncome | 35.5476T | 35.4916T | 0.1576% | WARN |
| aggregateAssetIncome | 15.1819T | 15.1521T | 0.1963% | WARN |
| aggregateTransferIncome | 14.9081T | 14.8740T | 0.2290% | WARN |
| totalIncome | 65.6376T | 65.5177T | 0.1827% | WARN |
| gdpNominal | 61.1231T | 60.4990T | 1.0209% | **FAIL** |
| gdpReal | 45.8344T | 45.8088T | 0.0560% | WARN |
| consumption | 42.5932T | 42.0362T | 1.3079% | **FAIL** |
| investment | 12.0055T | 11.9640T | 0.3460% | WARN |
| governmentSpending | 8.0474T | 8.0188T | 0.3555% | WARN |
| consumerWelfareIndex | 89.1888K | 88.8804K | 0.3458% | WARN |
| aiAdditionalOutput | 1.0979T | 1.0982T | 0.0276% | WARN |
| aiInvestmentBoost | 329.3805B | 329.4713B | 0.0276% | WARN |
| aiNetExportBoost | 109.7935B | 109.8238B | 0.0276% | WARN |
| aiConsumerGoodsPotential | 658.7610B | 658.9426B | 0.0276% | WARN |
| aiGoodsAbsorbed | 658.7610B | 658.9426B | 0.0276% | WARN |
| newJobEmployment | 1.0418M | 1.0644M | 2.1663% | **FAIL** |
| newJobWageIncome | 164.5757B | 167.8623B | 1.9970% | **FAIL** |
| potentialGDP | 46.4932T | 61.1580T | 31.5418% | **FAIL** |
| wageConsumption | 27.7776T | 27.7358T | 0.1503% | WARN |
| assetConsumption | 5.3137T | 5.3032T | 0.1963% | WARN |
| transferConsumption | 13.4173T | 13.3866T | 0.2290% | WARN |
| corporateProfits | 6.8772T | 6.8086T | 0.9975% | WARN |
| aiCorporateProfits | 274.4837B | 274.5594B | 0.0276% | WARN |
| traditionalCorporateProfits | 6.6028T | 6.5341T | 1.0401% | **FAIL** |
| aiGDPContribution | 1.0979T | 1.0982T | 0.0276% | WARN |
| moneySupply | 66.9652T | 112.9305T | 68.6405% | **FAIL** |
| maxNeutralTransfers | 802.0616B | 608.9619B | 24.0754% | **FAIL** |

**Year 2039**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 21.1566M | 21.1711M | 0.0688% | WARN |
| aggregateWageIncome | 28.5480T | 28.2484T | 1.0495% | **FAIL** |
| aggregateAssetIncome | 14.5116T | 14.3498T | 1.1150% | **FAIL** |
| aggregateTransferIncome | 15.0598T | 15.0263T | 0.2222% | WARN |
| totalIncome | 58.1194T | 57.6245T | 0.8515% | WARN |
| gdpNominal | 50.7541T | 49.4126T | 2.6431% | **FAIL** |
| gdpReal | 39.5475T | 37.7373T | 4.5772% | **FAIL** |
| consumption | 33.4681T | 32.3474T | 3.3487% | **FAIL** |
| investment | 10.7125T | 10.5219T | 1.7796% | **FAIL** |
| governmentSpending | 7.8422T | 7.7967T | 0.5804% | WARN |
| consumerWelfareIndex | 72.5317K | 68.7101K | 5.2688% | WARN |
| aiAdditionalOutput | 2.1835T | 2.1857T | 0.0991% | WARN |
| aiInvestmentBoost | 655.0503B | 655.6992B | 0.0991% | WARN |
| aiNetExportBoost | 218.3501B | 218.5664B | 0.0991% | WARN |
| aiConsumerGoodsPotential | 1.3101T | 1.3114T | 0.0991% | WARN |
| aiGoodsAbsorbed | 1.3101T | 1.3114T | 0.0991% | WARN |
| newJobEmployment | 904.0859K | 903.4569K | 0.0696% | WARN |
| newJobWageIncome | 121.0784B | 119.7407B | 1.1048% | **FAIL** |
| potentialGDP | 40.8576T | 50.7240T | 24.1484% | **FAIL** |
| wageConsumption | 21.8013T | 21.5714T | 1.0547% | **FAIL** |
| assetConsumption | 5.0790T | 5.0224T | 1.1150% | **FAIL** |
| transferConsumption | 13.5538T | 13.5237T | 0.2222% | WARN |
| corporateProfits | 5.8886T | 5.7414T | 2.5008% | **FAIL** |
| aiCorporateProfits | 545.8752B | 546.4160B | 0.0991% | WARN |
| traditionalCorporateProfits | 5.3428T | 5.1950T | 2.7664% | **FAIL** |
| aiGDPContribution | 2.1835T | 2.1857T | 0.0991% | WARN |
| moneySupply | 70.3478T | 119.6957T | 70.1483% | **FAIL** |
| maxNeutralTransfers | 978.4780B | 1.0480T | 7.1055% | **FAIL** |

**Year 2040**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 149.3652M | 149.1872M | 0.1191% | WARN |
| totalUnemployment | 32.7127M | 32.8907M | 0.5440% | WARN |
| aggregateWageIncome | 18.9856T | 18.4203T | 2.9775% | **FAIL** |
| aggregateAssetIncome | 12.7244T | 12.3497T | 2.9447% | **FAIL** |
| aggregateTransferIncome | 15.3087T | 15.2784T | 0.1981% | WARN |
| totalIncome | 47.0187T | 46.0484T | 2.0637% | **FAIL** |
| gdpNominal | 40.5359T | 39.5166T | 2.5147% | **FAIL** |
| gdpReal | 33.4054T | 30.7757T | 7.8721% | **FAIL** |
| consumption | 24.5609T | 23.7805T | 3.1774% | **FAIL** |
| investment | 9.3096T | 9.1058T | 2.1895% | **FAIL** |
| governmentSpending | 7.4871T | 7.4170T | 0.9360% | WARN |
| consumerWelfareIndex | 56.0707K | 51.3056K | 8.4984% | WARN |
| aiAdditionalOutput | 4.1306T | 4.1538T | 0.5609% | WARN |
| aiInvestmentBoost | 1.2392T | 1.2461T | 0.5609% | WARN |
| aiNetExportBoost | 413.0622B | 415.3792B | 0.5609% | WARN |
| aiConsumerGoodsPotential | 2.4784T | 2.4923T | 0.5609% | WARN |
| aiGoodsAbsorbed | 2.4784T | 2.4923T | 0.5609% | WARN |
| newJobEmployment | 696.1787K | 663.3016K | 4.7225% | **FAIL** |
| newJobWageIncome | 68.6308B | 63.5435B | 7.4126% | **FAIL** |
| potentialGDP | 35.8838T | 42.0088T | 17.0693% | **FAIL** |
| wageConsumption | 13.9007T | 13.4778T | 3.0422% | **FAIL** |
| assetConsumption | 4.4535T | 4.3224T | 2.9447% | **FAIL** |
| transferConsumption | 13.7778T | 13.7506T | 0.1981% | WARN |
| corporateProfits | 5.0372T | 4.9284T | 2.1616% | **FAIL** |
| aiCorporateProfits | 1.0327T | 1.0384T | 0.5609% | WARN |
| traditionalCorporateProfits | 4.0046T | 3.8899T | 2.8637% | **FAIL** |
| aiGDPContribution | 4.1306T | 4.1538T | 0.5609% | WARN |
| moneySupply | 73.7439T | 126.4879T | 71.5231% | **FAIL** |
| maxNeutralTransfers | 1.0817T | 1.9957T | 84.4860% | **FAIL** |

**Year 2041**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 131.2822M | 131.2446M | 0.0287% | WARN |
| totalUnemployment | 51.5240M | 51.5616M | 0.0731% | WARN |
| aggregateWageIncome | 10.6081T | 10.3344T | 2.5800% | **FAIL** |
| aggregateAssetIncome | 10.7988T | 10.5008T | 2.7590% | **FAIL** |
| aggregateTransferIncome | 15.6971T | 15.6640T | 0.2103% | WARN |
| totalIncome | 37.1039T | 36.4993T | 1.6296% | **FAIL** |
| gdpNominal | 34.2065T | 33.8067T | 1.1688% | **FAIL** |
| gdpReal | 30.1041T | 27.1225T | 9.9045% | **FAIL** |
| consumption | 18.4314T | 18.2335T | 1.0737% | **FAIL** |
| investment | 8.8849T | 8.7172T | 1.8870% | **FAIL** |
| governmentSpending | 7.1372T | 7.0782T | 0.8274% | WARN |
| consumerWelfareIndex | 44.7566K | 40.3625K | 9.8178% | WARN |
| unrealizedAIOutput | 562.9821B | 604.5569B | 7.3847% | **FAIL** |
| aiGoodsAbsorbed | 3.8721T | 3.8306T | 1.0737% | **FAIL** |
| newJobEmployment | 478.2812K | 440.6302K | 7.8721% | **FAIL** |
| newJobWageIncome | 31.3034B | 28.1016B | 10.2282% | **FAIL** |
| potentialGDP | 34.5393T | 38.2418T | 10.7198% | **FAIL** |
| wageConsumption | 7.2249T | 7.0374T | 2.5948% | **FAIL** |
| assetConsumption | 3.7796T | 3.6753T | 2.7590% | **FAIL** |
| transferConsumption | 14.1274T | 14.0976T | 0.2103% | WARN |
| corporateProfits | 4.7188T | 4.6690T | 1.0554% | **FAIL** |
| aiCorporateProfits | 1.7072T | 1.6968T | 0.6088% | WARN |
| traditionalCorporateProfits | 3.0115T | 2.9721T | 1.3085% | **FAIL** |
| aiGDPContribution | 6.8289T | 6.7873T | 0.6088% | WARN |
| moneySupply | 77.1536T | 133.3073T | 72.7816% | **FAIL** |
| maxNeutralTransfers | 1.1874T | 2.1396T | 80.1910% | **FAIL** |

**Year 2042**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 119.0079M | 118.8212M | 0.1569% | WARN |
| totalUnemployment | 64.5295M | 64.7162M | 0.2893% | WARN |
| aggregateWageIncome | 6.9146T | 6.8089T | 1.5277% | **FAIL** |
| aggregateAssetIncome | 9.3585T | 9.2887T | 0.7468% | WARN |
| aggregateTransferIncome | 15.9740T | 15.9439T | 0.1888% | WARN |
| totalIncome | 32.2472T | 32.0415T | 0.6378% | WARN |
| gdpNominal | 31.1718T | 31.0167T | 0.4977% | WARN |
| gdpReal | 29.6022T | 25.8863T | 12.5528% | **FAIL** |
| consumption | 15.6115T | 15.5512T | 0.3860% | WARN |
| investment | 8.5319T | 8.4651T | 0.7824% | WARN |
| governmentSpending | 6.9205T | 6.8826T | 0.5467% | WARN |
| consumerWelfareIndex | 40.7431K | 35.6686K | 12.4547% | WARN |
| unrealizedAIOutput | 1.4696T | 1.4857T | 1.0958% | **FAIL** |
| aiGoodsAbsorbed | 4.1715T | 4.1554T | 0.3860% | WARN |
| newJobEmployment | 369.8867K | 333.2514K | 9.9045% | **FAIL** |
| newJobWageIncome | 18.0349B | 16.0258B | 11.1400% | **FAIL** |
| potentialGDP | 35.2433T | 36.6577T | 4.0134% | **FAIL** |
| wageConsumption | 4.4682T | 4.3965T | 1.6052% | **FAIL** |
| assetConsumption | 3.2755T | 3.2510T | 0.7468% | WARN |
| transferConsumption | 14.3766T | 14.3495T | 0.1888% | WARN |
| corporateProfits | 4.5394T | 4.5201T | 0.4256% | WARN |
| aiCorporateProfits | 1.9831T | 1.9790T | 0.2030% | WARN |
| traditionalCorporateProfits | 2.5563T | 2.5411T | 0.5982% | WARN |
| aiGDPContribution | 7.9322T | 7.9161T | 0.2030% | WARN |
| totalDemandSpilloverLoss | 524.0630K | 674.1158K | 28.6326% | **FAIL** |
| moneySupply | 80.5770T | 140.1539T | 73.9380% | **FAIL** |
| maxNeutralTransfers | 1.3662T | 2.3894T | 74.8943% | **FAIL** |

**Year 2043**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 100.8920M | 100.5990M | 0.2904% | WARN |
| totalUnemployment | 83.3796M | 83.6725M | 0.3514% | WARN |
| aggregateWageIncome | 4.2330T | 4.1868T | 1.0922% | **FAIL** |
| aggregateAssetIncome | 9.2256T | 9.2477T | 0.2398% | WARN |
| aggregateTransferIncome | 16.3634T | 16.3352T | 0.1718% | WARN |
| totalIncome | 29.8219T | 29.7697T | 0.1751% | WARN |
| gdpNominal | 29.9666T | 29.9615T | 0.0170% | WARN |
| gdpReal | 31.2272T | 26.3874T | 15.4985% | **FAIL** |
| consumption | 13.7797T | 13.7873T | 0.0553% | WARN |
| investment | 8.9973T | 9.0102T | 0.1441% | WARN |
| governmentSpending | 6.8166T | 6.7871T | 0.4322% | WARN |
| consumerWelfareIndex | 39.3053K | 33.2376K | 15.4374% | WARN |
| unrealizedAIOutput | 2.3574T | 2.3550T | 0.1039% | WARN |
| aiGoodsAbsorbed | 4.4308T | 4.4333T | 0.0553% | WARN |
| newJobEmployment | 293.4626K | 256.6247K | 12.5528% | **FAIL** |
| newJobWageIncome | 10.8996B | 9.4559B | 13.2459% | **FAIL** |
| potentialGDP | 38.0154T | 36.7497T | 3.3295% | **FAIL** |
| wageConsumption | 2.5219T | 2.4910T | 1.2242% | **FAIL** |
| assetConsumption | 3.2290T | 3.2367T | 0.2398% | WARN |
| transferConsumption | 14.7270T | 14.7017T | 0.1718% | WARN |
| aiCorporateProfits | 2.2391T | 2.2397T | 0.0274% | WARN |
| traditionalCorporateProfits | 2.3111T | 2.3103T | 0.0359% | WARN |
| aiGDPContribution | 8.9563T | 8.9588T | 0.0274% | WARN |
| totalDemandSpilloverLoss | 3.8706M | 4.1268M | 6.6180% | **FAIL** |
| moneySupply | 84.0140T | 147.0280T | 75.0042% | **FAIL** |
| maxNeutralTransfers | 1.7437T | 2.9470T | 69.0031% | **FAIL** |

**Year 2044**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 89.7280M | 89.6941M | 0.0378% | WARN |
| totalUnemployment | 95.2806M | 95.3145M | 0.0356% | WARN |
| aggregateWageIncome | 3.1699T | 3.1675T | 0.0774% | WARN |
| aggregateAssetIncome | 9.7046T | 9.7588T | 0.5583% | WARN |
| aggregateTransferIncome | 16.6194T | 16.5863T | 0.1991% | WARN |
| totalIncome | 29.4939T | 29.5125T | 0.0632% | WARN |
| gdpNominal | 29.9709T | 29.9552T | 0.0523% | WARN |
| gdpReal | 34.8811T | 28.3223T | 18.8033% | **FAIL** |
| consumption | 13.1209T | 13.1010T | 0.1520% | WARN |
| investment | 9.5333T | 9.5618T | 0.2992% | WARN |
| governmentSpending | 6.7753T | 6.7510T | 0.3590% | WARN |
| consumerWelfareIndex | 41.6328K | 33.7707K | 18.8842% | WARN |
| unrealizedAIOutput | 2.8850T | 2.8920T | 0.2444% | WARN |
| aiGoodsAbsorbed | 4.7375T | 4.7301T | 0.1572% | WARN |
| newJobEmployment | 266.3894K | 225.1148K | 15.4941% | **FAIL** |
| newJobWageIncome | 8.5052B | 7.1838B | 15.5361% | **FAIL** |
| potentialGDP | 42.5036T | 37.5773T | 11.5901% | **FAIL** |
| wageConsumption | 1.7894T | 1.7877T | 0.0937% | WARN |
| assetConsumption | 3.3966T | 3.4156T | 0.5583% | WARN |
| transferConsumption | 14.9574T | 14.9276T | 0.1991% | WARN |
| corporateProfits | 4.6715T | 4.6687T | 0.0600% | WARN |
| aiCorporateProfits | 2.4548T | 2.4529T | 0.0785% | WARN |
| traditionalCorporateProfits | 2.2167T | 2.2158T | 0.0396% | WARN |
| aiGDPContribution | 9.8192T | 9.8115T | 0.0785% | WARN |
| totalDemandSpilloverLoss | 5.9900M | 5.9857M | 0.0712% | WARN |
| moneySupply | 87.4648T | 153.9296T | 75.9903% | **FAIL** |
| maxNeutralTransfers | 2.3475T | 3.8120T | 62.3893% | **FAIL** |

**Year 2045**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 83.6807M | 83.6346M | 0.0551% | WARN |
| totalUnemployment | 102.0679M | 102.1141M | 0.0452% | WARN |
| aggregateWageIncome | 2.7388T | 2.7349T | 0.1413% | WARN |
| aggregateAssetIncome | 10.7173T | 10.6422T | 0.7007% | WARN |
| aggregateTransferIncome | 16.7773T | 16.7444T | 0.1958% | WARN |
| totalIncome | 30.2334T | 30.1216T | 0.3698% | WARN |
| gdpNominal | 30.6427T | 30.5571T | 0.2791% | WARN |
| gdpReal | 40.2451T | 31.3297T | 22.1527% | **FAIL** |
| consumption | 13.0961T | 13.0426T | 0.4083% | WARN |
| investment | 10.1183T | 10.1111T | 0.0708% | WARN |
| governmentSpending | 6.7754T | 6.7508T | 0.3643% | WARN |
| consumerWelfareIndex | 46.7062K | 36.3124K | 22.2536% | **FAIL** |
| aiAdditionalOutput | 13.8203T | 13.8143T | 0.0432% | WARN |
| aiInvestmentBoost | 4.1461T | 4.1443T | 0.0432% | WARN |
| aiNetExportBoost | 1.3820T | 1.3814T | 0.0432% | WARN |
| aiConsumerGoodsPotential | 8.2922T | 8.2886T | 0.0432% | WARN |
| unrealizedAIOutput | 3.1482T | 3.1678T | 0.6237% | WARN |
| aiGoodsAbsorbed | 5.1440T | 5.1208T | 0.4513% | WARN |
| newJobEmployment | 265.3529K | 215.5282K | 18.7768% | **FAIL** |
| newJobWageIncome | 7.9467B | 6.4484B | 18.8539% | **FAIL** |
| potentialGDP | 48.5373T | 38.8458T | 19.9672% | **FAIL** |
| wageConsumption | 1.4988T | 1.4964T | 0.1640% | WARN |
| assetConsumption | 3.7511T | 3.7248T | 0.7007% | WARN |
| transferConsumption | 15.0995T | 15.0700T | 0.1958% | WARN |
| corporateProfits | 4.8648T | 4.8518T | 0.2671% | WARN |
| aiCorporateProfits | 2.6680T | 2.6616T | 0.2399% | WARN |
| traditionalCorporateProfits | 2.1968T | 2.1902T | 0.3001% | WARN |
| aiGDPContribution | 10.6721T | 10.6465T | 0.2399% | WARN |
| totalDemandSpilloverLoss | 5.8060M | 5.8205M | 0.2486% | WARN |
| moneySupply | 90.9294T | 160.8587T | 76.9051% | **FAIL** |
| maxNeutralTransfers | 2.9750T | 4.6312T | 55.6721% | **FAIL** |

**Year 2046**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 80.9443M | 80.7773M | 0.2063% | WARN |
| totalUnemployment | 105.5474M | 105.7143M | 0.1582% | WARN |
| aggregateWageIncome | 2.6287T | 2.6118T | 0.6406% | WARN |
| aggregateAssetIncome | 11.8811T | 11.5764T | 2.5646% | **FAIL** |
| aggregateTransferIncome | 16.8718T | 16.8413T | 0.1810% | WARN |
| totalIncome | 31.3816T | 31.0295T | 1.1219% | **FAIL** |
| gdpNominal | 31.3733T | 31.2354T | 0.4394% | WARN |
| gdpReal | 46.8613T | 34.9940T | 25.3244% | **FAIL** |
| consumption | 13.2789T | 13.1986T | 0.6047% | WARN |
| investment | 10.5929T | 10.5604T | 0.3075% | WARN |
| governmentSpending | 6.7984T | 6.7714T | 0.3982% | WARN |
| consumerWelfareIndex | 53.6451K | 39.9933K | 25.4483% | **FAIL** |
| unrealizedAIOutput | 3.2243T | 3.2574T | 1.0249% | **FAIL** |
| aiGoodsAbsorbed | 5.4665T | 5.4335T | 0.6049% | WARN |
| newJobEmployment | 283.0741K | 220.3692K | 22.1514% | **FAIL** |
| newJobWageIncome | 8.3773B | 6.4934B | 22.4877% | **FAIL** |
| potentialGDP | 55.5522T | 39.9262T | 28.1284% | **FAIL** |
| wageConsumption | 1.4169T | 1.4066T | 0.7231% | WARN |
| assetConsumption | 4.1584T | 4.0517T | 2.5646% | **FAIL** |
| transferConsumption | 15.1846T | 15.1571T | 0.1810% | WARN |
| corporateProfits | 5.0275T | 5.0077T | 0.3938% | WARN |
| aiCorporateProfits | 2.8151T | 2.8068T | 0.2938% | WARN |
| traditionalCorporateProfits | 2.2124T | 2.2009T | 0.5209% | WARN |
| aiGDPContribution | 11.2604T | 11.2274T | 0.2938% | WARN |
| totalDemandSpilloverLoss | 4.6575M | 4.7626M | 2.2581% | **FAIL** |
| moneySupply | 94.4078T | 167.8156T | 77.7561% | **FAIL** |
| maxNeutralTransfers | 3.6968T | 5.5212T | 49.3486% | **FAIL** |

**Year 2047**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 79.2173M | 78.9703M | 0.3118% | WARN |
| totalUnemployment | 108.0203M | 108.2674M | 0.2287% | WARN |
| aggregateWageIncome | 2.5811T | 2.5558T | 0.9811% | WARN |
| aggregateAssetIncome | 12.6240T | 12.1264T | 3.9415% | **FAIL** |
| aggregateTransferIncome | 16.9471T | 16.9181T | 0.1711% | WARN |
| totalIncome | 32.1522T | 31.6003T | 1.7165% | **FAIL** |
| gdpNominal | 31.8536T | 31.7011T | 0.4787% | WARN |
| gdpReal | 54.4602T | 39.0516T | 28.2933% | **FAIL** |
| consumption | 13.4090T | 13.3211T | 0.6558% | WARN |
| investment | 10.8883T | 10.8493T | 0.3586% | WARN |
| governmentSpending | 6.8235T | 6.7946T | 0.4230% | WARN |
| consumerWelfareIndex | 61.7586K | 44.2062K | 28.4209% | **FAIL** |
| unrealizedAIOutput | 3.2749T | 3.3123T | 1.1428% | **FAIL** |
| aiGoodsAbsorbed | 5.7014T | 5.6641T | 0.6548% | WARN |
| newJobEmployment | 309.6815K | 231.2317K | 25.3324% | **FAIL** |
| newJobWageIncome | 9.1511B | 6.7876B | 25.8277% | **FAIL** |
| potentialGDP | 63.4366T | 40.6775T | 35.8769% | **FAIL** |
| wageConsumption | 1.3771T | 1.3619T | 1.1035% | **FAIL** |
| assetConsumption | 4.4184T | 4.2443T | 3.9415% | **FAIL** |
| transferConsumption | 15.2524T | 15.2263T | 0.1711% | WARN |
| corporateProfits | 5.1399T | 5.1179T | 0.4279% | WARN |
| aiCorporateProfits | 2.9214T | 2.9121T | 0.3190% | WARN |
| traditionalCorporateProfits | 2.2185T | 2.2058T | 0.5712% | WARN |
| aiGDPContribution | 11.6857T | 11.6484T | 0.3190% | WARN |
| totalDemandSpilloverLoss | 3.5061M | 3.6692M | 4.6520% | **FAIL** |
| moneySupply | 97.9001T | 174.8003T | 78.5496% | **FAIL** |
| maxNeutralTransfers | 4.5163T | 6.4776T | 43.4285% | **FAIL** |

**Year 2048**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 77.8335M | 77.5520M | 0.3616% | WARN |
| totalUnemployment | 110.1531M | 110.4346M | 0.2555% | WARN |
| aggregateWageIncome | 2.5321T | 2.5044T | 1.0947% | **FAIL** |
| aggregateAssetIncome | 13.0921T | 12.4345T | 5.0231% | **FAIL** |
| aggregateTransferIncome | 17.0160T | 16.9877T | 0.1665% | WARN |
| totalIncome | 32.6402T | 31.9265T | 2.1865% | **FAIL** |
| gdpNominal | 32.1176T | 31.9741T | 0.4469% | WARN |
| gdpReal | 63.1818T | 43.5287T | 31.1056% | **FAIL** |
| consumption | 13.4922T | 13.4076T | 0.6268% | WARN |
| investment | 11.0288T | 10.9955T | 0.3025% | WARN |
| governmentSpending | 6.8399T | 6.8105T | 0.4294% | WARN |
| consumerWelfareIndex | 71.2160K | 48.9752K | 31.2301% | **FAIL** |
| unrealizedAIOutput | 3.3165T | 3.3534T | 1.1139% | **FAIL** |
| aiGoodsAbsorbed | 5.8731T | 5.8365T | 0.6230% | WARN |
| newJobEmployment | 342.2875K | 245.3782K | 28.3123% | **FAIL** |
| newJobWageIncome | 10.0475B | 7.1501B | 28.8372% | **FAIL** |
| potentialGDP | 72.3714T | 41.1640T | 43.1211% | **FAIL** |
| wageConsumption | 1.3395T | 1.3230T | 1.2347% | **FAIL** |
| assetConsumption | 4.5822T | 4.3521T | 5.0231% | **FAIL** |
| transferConsumption | 15.3144T | 15.2889T | 0.1665% | WARN |
| corporateProfits | 5.2129T | 5.1920T | 0.4005% | WARN |
| aiCorporateProfits | 2.9999T | 2.9908T | 0.3030% | WARN |
| traditionalCorporateProfits | 2.2130T | 2.2012T | 0.5327% | WARN |
| aiGDPContribution | 11.9995T | 11.9632T | 0.3030% | WARN |
| totalDemandSpilloverLoss | 2.7270M | 2.8985M | 6.2882% | **FAIL** |
| moneySupply | 101.4065T | 181.8129T | 79.2913% | **FAIL** |
| maxNeutralTransfers | 5.4444T | 7.5034T | 37.8195% | **FAIL** |

**Year 2049**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 77.0243M | 76.7457M | 0.3617% | WARN |
| totalUnemployment | 111.7143M | 111.9929M | 0.2494% | WARN |
| aggregateWageIncome | 2.4970T | 2.4706T | 1.0559% | **FAIL** |
| aggregateAssetIncome | 13.4170T | 12.6148T | 5.9791% | **FAIL** |
| aggregateTransferIncome | 17.0740T | 17.0456T | 0.1663% | WARN |
| totalIncome | 32.9880T | 32.1310T | 2.5978% | **FAIL** |
| gdpNominal | 32.2922T | 32.1645T | 0.3954% | WARN |
| gdpReal | 73.3331T | 48.5435T | 33.8041% | **FAIL** |
| consumption | 13.5620T | 13.4865T | 0.5572% | WARN |
| investment | 11.1056T | 11.0791T | 0.2392% | WARN |
| governmentSpending | 6.8489T | 6.8199T | 0.4243% | WARN |
| consumerWelfareIndex | 82.3075K | 54.3957K | 33.9116% | **FAIL** |
| unrealizedAIOutput | 3.3405T | 3.3739T | 1.0010% | **FAIL** |
| aiGoodsAbsorbed | 6.0012T | 5.9677T | 0.5572% | WARN |
| newJobEmployment | 384.4992K | 264.8985K | 31.1056% | **FAIL** |
| newJobWageIncome | 11.2006B | 7.6630B | 31.5843% | **FAIL** |
| potentialGDP | 82.6747T | 41.5061T | 49.7959% | **FAIL** |
| wageConsumption | 1.3135T | 1.2978T | 1.1947% | **FAIL** |
| assetConsumption | 4.6960T | 4.4152T | 5.9791% | **FAIL** |
| transferConsumption | 15.3666T | 15.3411T | 0.1663% | WARN |
| corporateProfits | 5.2642T | 5.2455T | 0.3558% | WARN |
| aiCorporateProfits | 3.0572T | 3.0489T | 0.2734% | WARN |
| traditionalCorporateProfits | 2.2070T | 2.1966T | 0.4698% | WARN |
| aiGDPContribution | 12.2289T | 12.1955T | 0.2734% | WARN |
| totalDemandSpilloverLoss | 2.3136M | 2.4726M | 6.8715% | **FAIL** |
| moneySupply | 104.9268T | 188.8536T | 79.9860% | **FAIL** |
| maxNeutralTransfers | 6.4682T | 8.5633T | 32.3918% | **FAIL** |

**Year 2050**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 76.7391M | 76.4526M | 0.3733% | WARN |
| totalUnemployment | 112.7544M | 113.0409M | 0.2541% | WARN |
| aggregateWageIncome | 2.4814T | 2.4562T | 1.0157% | **FAIL** |
| aggregateAssetIncome | 13.6593T | 12.7284T | 6.8147% | **FAIL** |
| aggregateTransferIncome | 17.1222T | 17.0939T | 0.1649% | WARN |
| totalIncome | 33.2628T | 32.2785T | 2.9591% | **FAIL** |
| gdpNominal | 32.4434T | 32.3321T | 0.3428% | WARN |
| gdpReal | 85.2068T | 54.1913T | 36.4002% | **FAIL** |
| consumption | 13.6273T | 13.5635T | 0.4687% | WARN |
| investment | 11.1719T | 11.1500T | 0.1964% | WARN |
| governmentSpending | 6.8549T | 6.8264T | 0.4160% | WARN |
| consumerWelfareIndex | 95.2658K | 60.5123K | 36.4805% | **FAIL** |
| unrealizedAIOutput | 3.3496T | 3.3782T | 0.8534% | WARN |
| aiGoodsAbsorbed | 6.0994T | 6.0708T | 0.4687% | WARN |
| newJobEmployment | 438.1529K | 290.0393K | 33.8041% | **FAIL** |
| newJobWageIncome | 12.6998B | 8.3522B | 34.2339% | **FAIL** |
| potentialGDP | 94.6558T | 41.7811T | 55.8599% | **FAIL** |
| wageConsumption | 1.3014T | 1.2864T | 1.1584% | **FAIL** |
| assetConsumption | 4.7807T | 4.4550T | 6.8147% | **FAIL** |
| transferConsumption | 15.4099T | 15.3845T | 0.1649% | WARN |
| corporateProfits | 5.3046T | 5.2884T | 0.3061% | WARN |
| aiCorporateProfits | 3.0997T | 3.0925T | 0.2305% | WARN |
| traditionalCorporateProfits | 2.2049T | 2.1958T | 0.4122% | WARN |
| aiGDPContribution | 12.3987T | 12.3701T | 0.2305% | WARN |
| totalDemandSpilloverLoss | 2.0768M | 2.2151M | 6.6626% | **FAIL** |
| moneySupply | 108.4612T | 195.9225T | 80.6382% | **FAIL** |
| maxNeutralTransfers | 7.6114T | 9.6817T | 27.1996% | **FAIL** |

### ubi_phased

**Year 2026**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 32.1442T | 32.9900T | 2.6313% | **FAIL** |

**Year 2027**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 33.1365T | 34.9033T | 5.3318% | **FAIL** |

**Year 2028**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 33.8511T | 36.5942T | 8.1033% | **FAIL** |

**Year 2029**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 34.3152T | 38.0719T | 10.9478% | **FAIL** |

**Year 2030**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 34.6034T | 39.4019T | 13.8672% | **FAIL** |

**Year 2031**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 34.7788T | 40.6437T | 16.8633% | **FAIL** |

**Year 2032**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| aiAdditionalOutput | 320.5461M | 328.9254M | 2.6141% | **FAIL** |
| aiInvestmentBoost | 96.1638M | 98.6776M | 2.6141% | **FAIL** |
| aiNetExportBoost | 32.0546M | 32.8925M | 2.6141% | **FAIL** |
| aiConsumerGoodsPotential | 192.3277M | 197.3553M | 2.6141% | **FAIL** |
| aiGoodsAbsorbed | 192.3277M | 197.3553M | 2.6141% | **FAIL** |
| potentialGDP | 36.1215T | 43.3188T | 19.9253% | **FAIL** |
| aiCorporateProfits | 80.1365M | 82.2314M | 2.6141% | **FAIL** |
| aiGDPContribution | 320.5461M | 328.9254M | 2.6141% | **FAIL** |
| moneySupply | 21.8223T | 22.6447T | 3.7683% | **FAIL** |
| maxNeutralTransfers | 2.8168B | 2.1448B | 23.8578% | **FAIL** |

**Year 2033**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 7.0473M | 7.0489M | 0.0232% | WARN |
| aiAdditionalOutput | 5.5776B | 5.7084B | 2.3461% | **FAIL** |
| aiInvestmentBoost | 1.6733B | 1.7125B | 2.3461% | **FAIL** |
| aiNetExportBoost | 557.7579M | 570.8435M | 2.3461% | **FAIL** |
| aiConsumerGoodsPotential | 3.3465B | 3.4251B | 2.3461% | **FAIL** |
| aiGoodsAbsorbed | 3.3465B | 3.4251B | 2.3461% | **FAIL** |
| newJobEmployment | 812.2186K | 812.2080K | 0.0013% | WARN |
| potentialGDP | 37.8915T | 46.5886T | 22.9526% | **FAIL** |
| aiCorporateProfits | 1.3944B | 1.4271B | 2.3461% | **FAIL** |
| aiGDPContribution | 5.5776B | 5.7084B | 2.3461% | **FAIL** |
| moneySupply | 23.0608T | 25.1216T | 8.9363% | **FAIL** |
| maxNeutralTransfers | 28.1062B | 19.7927B | 29.5788% | **FAIL** |

**Year 2034**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 170.3653M | 170.3477M | 0.0103% | WARN |
| totalUnemployment | 7.4032M | 7.4209M | 0.2381% | WARN |
| aggregateAssetIncome | 9.7048T | 9.7068T | 0.0202% | WARN |
| aiAdditionalOutput | 34.7859B | 36.0025B | 3.4974% | **FAIL** |
| aiInvestmentBoost | 10.4358B | 10.8008B | 3.4974% | **FAIL** |
| aiNetExportBoost | 3.4786B | 3.6003B | 3.4974% | **FAIL** |
| aiConsumerGoodsPotential | 20.8715B | 21.6015B | 3.4974% | **FAIL** |
| aiGoodsAbsorbed | 20.8715B | 21.6015B | 3.4974% | **FAIL** |
| newJobEmployment | 849.1364K | 849.0147K | 0.0143% | WARN |
| newJobWageIncome | 101.4881B | 101.4779B | 0.0100% | WARN |
| potentialGDP | 39.8212T | 50.0938T | 25.7969% | **FAIL** |
| assetConsumption | 3.3967T | 3.3974T | 0.0202% | WARN |
| aiCorporateProfits | 8.6965B | 9.0006B | 3.4974% | **FAIL** |
| aiGDPContribution | 34.7859B | 36.0025B | 3.4974% | **FAIL** |
| moneySupply | 24.7187T | 28.4373T | 15.0439% | **FAIL** |
| maxNeutralTransfers | 86.5323B | 56.1834B | 35.0723% | **FAIL** |

**Year 2035**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 170.1422M | 170.1045M | 0.0222% | WARN |
| totalUnemployment | 8.3374M | 8.3752M | 0.4529% | WARN |
| aggregateWageIncome | 29.8427T | 29.8207T | 0.0737% | WARN |
| aggregateAssetIncome | 10.5493T | 10.5536T | 0.0403% | WARN |
| aggregateTransferIncome | 11.8103T | 11.8062T | 0.0350% | WARN |
| totalIncome | 52.2023T | 52.1804T | 0.0419% | WARN |
| gdpNominal | 53.4150T | 53.3715T | 0.0815% | WARN |
| gdpReal | 41.6456T | 41.5668T | 0.1893% | WARN |
| consumption | 38.0763T | 38.0344T | 0.1101% | WARN |
| investment | 9.3669T | 9.3685T | 0.0174% | WARN |
| governmentSpending | 7.1780T | 7.1744T | 0.0495% | WARN |
| consumerWelfareIndex | 83.8967K | 83.7139K | 0.2179% | WARN |
| aiAdditionalOutput | 120.9332B | 123.7956B | 2.3669% | **FAIL** |
| aiInvestmentBoost | 36.2800B | 37.1387B | 2.3669% | **FAIL** |
| aiNetExportBoost | 12.0933B | 12.3796B | 2.3669% | **FAIL** |
| aiConsumerGoodsPotential | 72.5599B | 74.2774B | 2.3669% | **FAIL** |
| aiGoodsAbsorbed | 72.5599B | 74.2774B | 2.3669% | **FAIL** |
| newJobEmployment | 884.3857K | 884.1221K | 0.0298% | WARN |
| newJobWageIncome | 112.7179B | 112.6325B | 0.0758% | WARN |
| potentialGDP | 41.7182T | 53.4457T | 28.1114% | **FAIL** |
| wageConsumption | 23.8337T | 23.8129T | 0.0869% | WARN |
| assetConsumption | 3.6923T | 3.6938T | 0.0403% | WARN |
| transferConsumption | 10.6293T | 10.6256T | 0.0350% | WARN |
| corporateProfits | 5.8926T | 5.8882T | 0.0744% | WARN |
| aiCorporateProfits | 30.2333B | 30.9489B | 2.3669% | **FAIL** |
| traditionalCorporateProfits | 5.8623T | 5.8572T | 0.0870% | WARN |
| aiGDPContribution | 120.9332B | 123.7956B | 2.3669% | **FAIL** |
| moneySupply | 26.7993T | 32.5986T | 21.6397% | **FAIL** |
| maxNeutralTransfers | 166.3399B | 100.4241B | 39.6272% | **FAIL** |

**Year 2036**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 169.4996M | 169.4599M | 0.0234% | WARN |
| totalUnemployment | 9.6939M | 9.7336M | 0.4097% | WARN |
| aggregateWageIncome | 31.0523T | 31.0036T | 0.1568% | WARN |
| aggregateAssetIncome | 11.4329T | 11.4288T | 0.0364% | WARN |
| aggregateTransferIncome | 12.7803T | 12.7624T | 0.1397% | WARN |
| totalIncome | 55.2655T | 55.1947T | 0.1280% | WARN |
| gdpNominal | 56.0114T | 55.8874T | 0.2215% | WARN |
| gdpReal | 43.1517T | 42.8392T | 0.7244% | WARN |
| consumption | 39.8417T | 39.7367T | 0.2635% | WARN |
| investment | 10.0830T | 10.0773T | 0.0568% | WARN |
| governmentSpending | 7.3580T | 7.3432T | 0.2013% | WARN |
| consumerWelfareIndex | 86.3992K | 85.7373K | 0.7661% | WARN |
| aiAdditionalOutput | 282.6292B | 286.5308B | 1.3805% | **FAIL** |
| aiInvestmentBoost | 84.7888B | 85.9592B | 1.3805% | **FAIL** |
| aiNetExportBoost | 28.2629B | 28.6531B | 1.3805% | **FAIL** |
| aiConsumerGoodsPotential | 169.5775B | 171.9185B | 1.3805% | **FAIL** |
| aiGoodsAbsorbed | 169.5775B | 171.9185B | 1.3805% | **FAIL** |
| newJobEmployment | 914.0103K | 911.9637K | 0.2239% | WARN |
| newJobWageIncome | 122.0086B | 121.5830B | 0.3488% | WARN |
| potentialGDP | 43.3213T | 56.0593T | 29.4036% | **FAIL** |
| wageConsumption | 24.6851T | 24.6429T | 0.1707% | WARN |
| assetConsumption | 4.0015T | 4.0001T | 0.0364% | WARN |
| transferConsumption | 11.5022T | 11.4862T | 0.1397% | WARN |
| corporateProfits | 6.2008T | 6.1877T | 0.2113% | WARN |
| aiCorporateProfits | 70.6573B | 71.6327B | 1.3805% | **FAIL** |
| traditionalCorporateProfits | 6.1302T | 6.1161T | 0.2296% | WARN |
| aiGDPContribution | 282.6292B | 286.5308B | 1.3805% | **FAIL** |
| moneySupply | 29.3060T | 37.6120T | 28.3423% | **FAIL** |
| maxNeutralTransfers | 309.5722B | 183.4959B | 40.7260% | **FAIL** |

**Year 2037**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 168.1113M | 168.0617M | 0.0295% | WARN |
| totalUnemployment | 11.7990M | 11.8486M | 0.4204% | WARN |
| aggregateWageIncome | 31.3125T | 31.2121T | 0.3206% | WARN |
| aggregateAssetIncome | 12.2768T | 12.2561T | 0.1688% | WARN |
| aggregateTransferIncome | 13.6979T | 13.6620T | 0.2622% | WARN |
| totalIncome | 57.2872T | 57.1302T | 0.2741% | WARN |
| gdpNominal | 57.3294T | 55.5787T | 3.0537% | **FAIL** |
| gdpReal | 44.0630T | 42.1601T | 4.3184% | **FAIL** |
| consumption | 40.5617T | 38.8734T | 4.1623% | **FAIL** |
| investment | 10.6114T | 10.5760T | 0.3331% | WARN |
| governmentSpending | 7.4600T | 7.4293T | 0.4106% | WARN |
| consumerWelfareIndex | 87.4036K | 82.6728K | 5.4126% | WARN |
| aiAdditionalOutput | 590.2807B | 596.6945B | 1.0866% | **FAIL** |
| aiInvestmentBoost | 177.0842B | 179.0083B | 1.0866% | **FAIL** |
| aiNetExportBoost | 59.0281B | 59.6694B | 1.0866% | **FAIL** |
| aiConsumerGoodsPotential | 354.1684B | 358.0167B | 1.0866% | **FAIL** |
| aiGoodsAbsorbed | 354.1684B | 358.0167B | 1.0866% | **FAIL** |
| newJobEmployment | 929.0745K | 921.9805K | 0.7636% | WARN |
| newJobWageIncome | 126.6794B | 125.3643B | 1.0382% | **FAIL** |
| potentialGDP | 44.4171T | 55.9367T | 25.9350% | **FAIL** |
| wageConsumption | 24.7121T | 24.6286T | 0.3381% | WARN |
| assetConsumption | 4.2969T | 4.2896T | 0.1688% | WARN |
| transferConsumption | 12.3281T | 12.2958T | 0.2622% | WARN |
| corporateProfits | 6.3889T | 6.1972T | 3.0001% | **FAIL** |
| aiCorporateProfits | 147.5702B | 149.1736B | 1.0866% | **FAIL** |
| traditionalCorporateProfits | 6.2413T | 6.0480T | 3.0967% | **FAIL** |
| aiGDPContribution | 590.2807B | 596.6945B | 1.0866% | **FAIL** |
| moneySupply | 32.2422T | 43.4845T | 34.8680% | **FAIL** |
| maxNeutralTransfers | 491.4291B | 294.7595B | 40.0199% | **FAIL** |

**Year 2038**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 165.8505M | 165.7254M | 0.0754% | WARN |
| totalUnemployment | 14.7795M | 14.9045M | 0.8460% | WARN |
| aggregateWageIncome | 30.2996T | 29.3035T | 3.2877% | **FAIL** |
| aggregateAssetIncome | 12.9757T | 12.5927T | 2.9514% | **FAIL** |
| aggregateTransferIncome | 14.6209T | 14.5864T | 0.2357% | WARN |
| totalIncome | 57.8962T | 56.4826T | 2.4416% | **FAIL** |
| gdpNominal | 54.8595T | 52.7921T | 3.7685% | **FAIL** |
| gdpReal | 42.6884T | 39.9903T | 6.3205% | **FAIL** |
| consumption | 37.8077T | 36.4062T | 3.7071% | **FAIL** |
| investment | 10.8316T | 10.2082T | 5.7551% | **FAIL** |
| governmentSpending | 7.5051T | 7.4188T | 1.1503% | **FAIL** |
| consumerWelfareIndex | 82.1528K | 77.0094K | 6.2607% | WARN |
| aiAdditionalOutput | 1.0979T | 1.1110T | 1.1937% | **FAIL** |
| aiInvestmentBoost | 329.3805B | 333.3122B | 1.1937% | **FAIL** |
| aiNetExportBoost | 109.7935B | 111.1041B | 1.1937% | **FAIL** |
| aiConsumerGoodsPotential | 658.7610B | 666.6244B | 1.1937% | **FAIL** |
| aiGoodsAbsorbed | 658.7610B | 666.6244B | 1.1937% | **FAIL** |
| newJobEmployment | 923.1454K | 882.5773K | 4.3946% | **FAIL** |
| newJobWageIncome | 124.3693B | 115.1067B | 7.4477% | **FAIL** |
| potentialGDP | 43.3472T | 53.4587T | 23.3268% | **FAIL** |
| wageConsumption | 23.6667T | 22.8785T | 3.3305% | **FAIL** |
| assetConsumption | 4.5415T | 4.4075T | 2.9514% | **FAIL** |
| transferConsumption | 13.1588T | 13.1278T | 0.2357% | WARN |
| corporateProfits | 6.1883T | 5.9627T | 3.6452% | **FAIL** |
| aiCorporateProfits | 274.4837B | 277.7602B | 1.1937% | **FAIL** |
| traditionalCorporateProfits | 5.9138T | 5.6849T | 3.8698% | **FAIL** |
| aiGDPContribution | 1.0979T | 1.1110T | 1.1937% | **FAIL** |
| moneySupply | 35.6113T | 50.2227T | 41.0300% | **FAIL** |
| maxNeutralTransfers | 747.0090B | 496.7019B | 33.5079% | **FAIL** |

**Year 2039**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 160.3669M | 160.2613M | 0.0658% | WARN |
| totalUnemployment | 20.9856M | 21.0911M | 0.5030% | WARN |
| aggregateWageIncome | 25.7132T | 24.6949T | 3.9601% | **FAIL** |
| aggregateAssetIncome | 13.2192T | 12.6952T | 3.9638% | **FAIL** |
| aggregateTransferIncome | 14.7670T | 14.7322T | 0.2359% | WARN |
| totalIncome | 53.6994T | 52.1223T | 2.9369% | **FAIL** |
| gdpNominal | 47.5970T | 45.4427T | 4.5262% | **FAIL** |
| gdpReal | 38.4635T | 34.7158T | 9.7435% | **FAIL** |
| consumption | 31.1371T | 29.4563T | 5.3981% | **FAIL** |
| investment | 10.1593T | 9.7318T | 4.2073% | **FAIL** |
| governmentSpending | 7.4205T | 7.3233T | 1.3096% | **FAIL** |
| consumerWelfareIndex | 69.9837K | 62.5880K | 10.5678% | WARN |
| aiAdditionalOutput | 2.1476T | 2.1556T | 0.3750% | WARN |
| aiInvestmentBoost | 644.2747B | 646.6910B | 0.3750% | WARN |
| aiNetExportBoost | 214.7582B | 215.5637B | 0.3750% | WARN |
| aiConsumerGoodsPotential | 1.2885T | 1.2934T | 0.3750% | WARN |
| aiGoodsAbsorbed | 1.2885T | 1.2934T | 0.3750% | WARN |
| newJobEmployment | 843.9328K | 790.1927K | 6.3678% | **FAIL** |
| newJobWageIncome | 101.6025B | 91.4338B | 10.0084% | **FAIL** |
| potentialGDP | 39.7521T | 46.7360T | 17.5688% | **FAIL** |
| wageConsumption | 19.6485T | 18.8632T | 3.9967% | **FAIL** |
| assetConsumption | 4.6267T | 4.4433T | 3.9638% | **FAIL** |
| transferConsumption | 13.2903T | 13.2589T | 0.2359% | WARN |
| corporateProfits | 5.5363T | 5.3005T | 4.2600% | **FAIL** |
| aiCorporateProfits | 536.8956B | 538.9091B | 0.3750% | WARN |
| traditionalCorporateProfits | 4.9994T | 4.7616T | 4.7578% | **FAIL** |
| aiGDPContribution | 2.1476T | 2.1556T | 0.3750% | WARN |
| moneySupply | 38.9939T | 56.9878T | 46.1454% | **FAIL** |
| maxNeutralTransfers | 947.5980B | 839.4776B | 11.4099% | **FAIL** |

**Year 2040**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 150.3780M | 150.1383M | 0.1594% | WARN |
| totalUnemployment | 31.6999M | 31.9395M | 0.7560% | WARN |
| aggregateWageIncome | 18.1645T | 17.2626T | 4.9647% | **FAIL** |
| aggregateAssetIncome | 12.1617T | 11.5614T | 4.9356% | **FAIL** |
| aggregateTransferIncome | 14.9998T | 14.9675T | 0.2151% | WARN |
| totalIncome | 45.3259T | 43.7916T | 3.3851% | **FAIL** |
| gdpNominal | 39.0128T | 37.4948T | 3.8911% | **FAIL** |
| gdpReal | 33.3291T | 29.1982T | 12.3943% | **FAIL** |
| consumption | 23.7887T | 22.7118T | 4.5272% | **FAIL** |
| investment | 8.8135T | 8.4175T | 4.4938% | **FAIL** |
| governmentSpending | 7.1718T | 7.0717T | 1.3965% | **FAIL** |
| consumerWelfareIndex | 56.2994K | 48.9950K | 12.9742% | WARN |
| aiAdditionalOutput | 3.9666T | 3.9942T | 0.6951% | WARN |
| aiInvestmentBoost | 1.1900T | 1.1982T | 0.6951% | WARN |
| aiNetExportBoost | 396.6581B | 399.4152B | 0.6951% | WARN |
| aiConsumerGoodsPotential | 2.3799T | 2.3965T | 0.6951% | WARN |
| aiGoodsAbsorbed | 2.3799T | 2.3965T | 0.6951% | WARN |
| newJobEmployment | 684.3940K | 616.6038K | 9.9051% | **FAIL** |
| newJobWageIncome | 63.9104B | 54.8328B | 14.2035% | **FAIL** |
| potentialGDP | 35.7091T | 39.8913T | 11.7118% | **FAIL** |
| wageConsumption | 13.3500T | 12.6758T | 5.0498% | **FAIL** |
| assetConsumption | 4.2566T | 4.0465T | 4.9356% | **FAIL** |
| transferConsumption | 13.4998T | 13.4708T | 0.2151% | WARN |
| corporateProfits | 4.8467T | 4.6836T | 3.3656% | **FAIL** |
| aiCorporateProfits | 991.6454B | 998.5380B | 0.6951% | WARN |
| traditionalCorporateProfits | 3.8551T | 3.6851T | 4.4102% | **FAIL** |
| aiGDPContribution | 3.9666T | 3.9942T | 0.6951% | WARN |
| moneySupply | 42.3900T | 63.7801T | 50.4600% | **FAIL** |
| maxNeutralTransfers | 1.0697T | 1.5431T | 44.2519% | **FAIL** |

**Year 2041**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 132.6898M | 132.2635M | 0.3212% | WARN |
| totalUnemployment | 50.1164M | 50.5427M | 0.8505% | WARN |
| aggregateWageIncome | 10.4934T | 10.0030T | 4.6737% | **FAIL** |
| aggregateAssetIncome | 10.6312T | 10.2212T | 3.8562% | **FAIL** |
| aggregateTransferIncome | 15.3805T | 15.3519T | 0.1865% | WARN |
| totalIncome | 36.5051T | 35.5760T | 2.5450% | **FAIL** |
| gdpNominal | 33.3466T | 32.7176T | 1.8862% | **FAIL** |
| gdpReal | 30.4191T | 26.2440T | 13.7253% | **FAIL** |
| consumption | 18.1498T | 17.7845T | 2.0129% | **FAIL** |
| investment | 8.5519T | 8.3238T | 2.6673% | **FAIL** |
| governmentSpending | 6.8779T | 6.7995T | 1.1394% | **FAIL** |
| consumerWelfareIndex | 45.6825K | 39.3615K | 13.8367% | WARN |
| aiAdditionalOutput | 7.1616T | 7.2204T | 0.8221% | WARN |
| aiInvestmentBoost | 2.1485T | 2.1661T | 0.8221% | WARN |
| aiNetExportBoost | 716.1556B | 722.0432B | 0.8221% | WARN |
| aiConsumerGoodsPotential | 4.2969T | 4.3323T | 0.8221% | WARN |
| unrealizedAIOutput | 602.7490B | 682.6743B | 13.2601% | **FAIL** |
| aiGoodsAbsorbed | 3.6942T | 3.6496T | 1.2073% | **FAIL** |
| newJobEmployment | 485.2326K | 423.2550K | 12.7728% | **FAIL** |
| newJobWageIncome | 30.9755B | 25.8595B | 16.5162% | **FAIL** |
| potentialGDP | 34.7161T | 37.0499T | 6.7225% | **FAIL** |
| wageConsumption | 7.1872T | 6.8396T | 4.8359% | **FAIL** |
| assetConsumption | 3.7209T | 3.5774T | 3.8562% | **FAIL** |
| transferConsumption | 13.8425T | 13.8167T | 0.1865% | WARN |
| corporateProfits | 4.5864T | 4.5142T | 1.5728% | **FAIL** |
| aiCorporateProfits | 1.6397T | 1.6344T | 0.3209% | WARN |
| traditionalCorporateProfits | 2.9467T | 2.8798T | 2.2694% | **FAIL** |
| aiGDPContribution | 6.5588T | 6.5378T | 0.3209% | WARN |
| moneySupply | 45.7997T | 70.5995T | 54.1482% | **FAIL** |
| maxNeutralTransfers | 1.1967T | 2.0674T | 72.7536% | **FAIL** |

**Year 2042**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 118.7334M | 118.3749M | 0.3019% | WARN |
| totalUnemployment | 64.8040M | 65.1625M | 0.5532% | WARN |
| aggregateWageIncome | 6.7041T | 6.5316T | 2.5731% | **FAIL** |
| aggregateAssetIncome | 9.3572T | 9.2603T | 1.0356% | **FAIL** |
| aggregateTransferIncome | 15.6898T | 15.6598T | 0.1911% | WARN |
| totalIncome | 31.7511T | 31.4517T | 0.9429% | WARN |
| gdpNominal | 30.4888T | 30.3224T | 0.5457% | WARN |
| gdpReal | 30.0311T | 25.3023T | 15.7462% | **FAIL** |
| consumption | 15.2877T | 15.1723T | 0.7551% | WARN |
| investment | 8.3883T | 8.3700T | 0.2184% | WARN |
| governmentSpending | 6.6838T | 6.6359T | 0.7170% | WARN |
| consumerWelfareIndex | 41.3830K | 34.7933K | 15.9236% | WARN |
| unrealizedAIOutput | 1.5561T | 1.5869T | 1.9824% | **FAIL** |
| aiGoodsAbsorbed | 4.0850T | 4.0542T | 0.7551% | WARN |
| newJobEmployment | 373.7572K | 322.4580K | 13.7253% | **FAIL** |
| newJobWageIncome | 17.7120B | 14.9338B | 15.6851% | **FAIL** |
| potentialGDP | 35.6722T | 35.9635T | 0.8166% | WARN |
| wageConsumption | 4.3272T | 4.2095T | 2.7206% | **FAIL** |
| assetConsumption | 3.2750T | 3.2411T | 1.0356% | **FAIL** |
| transferConsumption | 14.1208T | 14.0939T | 0.1911% | WARN |
| corporateProfits | 4.4522T | 4.4295T | 0.5081% | WARN |
| aiCorporateProfits | 1.9614T | 1.9537T | 0.3932% | WARN |
| traditionalCorporateProfits | 2.4907T | 2.4758T | 0.5986% | WARN |
| aiGDPContribution | 7.8457T | 7.8149T | 0.3932% | WARN |
| totalDemandSpilloverLoss | 802.4092K | 1.1096M | 38.2848% | **FAIL** |
| moneySupply | 49.2231T | 77.4461T | 57.3371% | **FAIL** |
| maxNeutralTransfers | 1.3860T | 2.3355T | 68.5076% | **FAIL** |

**Year 2043**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 99.8124M | 99.4676M | 0.3455% | WARN |
| totalUnemployment | 84.4592M | 84.8040M | 0.4082% | WARN |
| aggregateWageIncome | 4.0487T | 3.9982T | 1.2469% | **FAIL** |
| aggregateAssetIncome | 9.1839T | 9.2555T | 0.7800% | WARN |
| aggregateTransferIncome | 16.0946T | 16.0643T | 0.1879% | WARN |
| totalIncome | 29.3272T | 29.3181T | 0.0310% | WARN |
| gdpNominal | 29.3806T | 29.4159T | 0.1203% | WARN |
| gdpReal | 31.7573T | 25.9023T | 18.4366% | **FAIL** |
| consumption | 13.5109T | 13.5237T | 0.0946% | WARN |
| investment | 8.8941T | 8.9447T | 0.5689% | WARN |
| governmentSpending | 6.5860T | 6.5539T | 0.4871% | WARN |
| consumerWelfareIndex | 39.9743K | 32.5960K | 18.4576% | WARN |
| unrealizedAIOutput | 2.4439T | 2.4397T | 0.1682% | WARN |
| aiGoodsAbsorbed | 4.3444T | 4.3485T | 0.0946% | WARN |
| newJobEmployment | 297.7141K | 250.8355K | 15.7462% | **FAIL** |
| newJobWageIncome | 10.6978B | 8.9329B | 16.4971% | **FAIL** |
| potentialGDP | 38.5455T | 36.2041T | 6.0744% | **FAIL** |
| wageConsumption | 2.4002T | 2.3665T | 1.4027% | **FAIL** |
| assetConsumption | 3.2144T | 3.2394T | 0.7800% | WARN |
| transferConsumption | 14.4851T | 14.4579T | 0.1879% | WARN |
| corporateProfits | 4.4736T | 4.4781T | 0.0998% | WARN |
| aiCorporateProfits | 2.2175T | 2.2185T | 0.0463% | WARN |
| traditionalCorporateProfits | 2.2562T | 2.2596T | 0.1523% | WARN |
| aiGDPContribution | 8.8699T | 8.8740T | 0.0463% | WARN |
| totalDemandSpilloverLoss | 4.9545M | 5.2524M | 6.0133% | **FAIL** |
| moneySupply | 52.6601T | 84.3202T | 60.1216% | **FAIL** |
| maxNeutralTransfers | 1.7733T | 2.8928T | 63.1267% | **FAIL** |

**Year 2044**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 88.9215M | 88.9417M | 0.0227% | WARN |
| totalUnemployment | 96.0871M | 96.0669M | 0.0210% | WARN |
| aggregateWageIncome | 3.0543T | 3.0599T | 0.1834% | WARN |
| aggregateAssetIncome | 9.6160T | 9.7178T | 1.0591% | **FAIL** |
| aggregateTransferIncome | 16.3453T | 16.3081T | 0.2279% | WARN |
| totalIncome | 29.0156T | 29.0858T | 0.2419% | WARN |
| gdpNominal | 29.4194T | 29.4304T | 0.0374% | WARN |
| gdpReal | 35.5170T | 27.8210T | 21.6686% | **FAIL** |
| consumption | 12.8799T | 12.8702T | 0.0753% | WARN |
| investment | 9.4358T | 9.4827T | 0.4968% | WARN |
| governmentSpending | 6.5480T | 6.5229T | 0.3844% | WARN |
| consumerWelfareIndex | 42.3932K | 33.1698K | 21.7569% | WARN |
| aiAdditionalOutput | 12.7038T | 12.7025T | 0.0105% | WARN |
| aiInvestmentBoost | 3.8112T | 3.8108T | 0.0105% | WARN |
| aiNetExportBoost | 1.2704T | 1.2703T | 0.0105% | WARN |
| aiConsumerGoodsPotential | 7.6223T | 7.6215T | 0.0105% | WARN |
| unrealizedAIOutput | 2.9719T | 2.9751T | 0.1073% | WARN |
| aiGoodsAbsorbed | 4.6504T | 4.6464T | 0.0858% | WARN |
| newJobEmployment | 270.9186K | 220.9934K | 18.4281% | **FAIL** |
| newJobWageIncome | 8.4152B | 6.8740B | 18.3144% | **FAIL** |
| potentialGDP | 43.1393T | 37.0519T | 14.1111% | **FAIL** |
| wageConsumption | 1.7175T | 1.7208T | 0.1931% | WARN |
| assetConsumption | 3.3656T | 3.4012T | 1.0591% | **FAIL** |
| transferConsumption | 14.7108T | 14.6773T | 0.2279% | WARN |
| corporateProfits | 4.5986T | 4.5992T | 0.0126% | WARN |
| aiCorporateProfits | 2.4330T | 2.4318T | 0.0465% | WARN |
| traditionalCorporateProfits | 2.1656T | 2.1673T | 0.0789% | WARN |
| aiGDPContribution | 9.7319T | 9.7274T | 0.0465% | WARN |
| totalDemandSpilloverLoss | 6.8025M | 6.7387M | 0.9384% | WARN |
| moneySupply | 56.1109T | 91.2217T | 62.5741% | **FAIL** |
| maxNeutralTransfers | 2.3902T | 3.7444T | 56.6547% | **FAIL** |

**Year 2045**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| aggregateWageIncome | 2.6482T | 2.6494T | 0.0461% | WARN |
| aggregateAssetIncome | 10.5814T | 10.5210T | 0.5712% | WARN |
| aggregateTransferIncome | 16.5008T | 16.4640T | 0.2229% | WARN |
| totalIncome | 29.7304T | 29.6344T | 0.3229% | WARN |
| gdpNominal | 30.0876T | 30.0028T | 0.2818% | WARN |
| gdpReal | 40.9931T | 30.7551T | 24.9749% | **FAIL** |
| consumption | 12.8574T | 12.8057T | 0.4019% | WARN |
| investment | 10.0149T | 10.0090T | 0.0588% | WARN |
| governmentSpending | 6.5494T | 6.5234T | 0.3971% | WARN |
| consumerWelfareIndex | 47.5688K | 35.6456K | 25.0652% | **FAIL** |
| aiAdditionalOutput | 13.8173T | 13.8077T | 0.0698% | WARN |
| aiInvestmentBoost | 4.1452T | 4.1423T | 0.0698% | WARN |
| aiNetExportBoost | 1.3817T | 1.3808T | 0.0698% | WARN |
| aiConsumerGoodsPotential | 8.2904T | 8.2846T | 0.0698% | WARN |
| unrealizedAIOutput | 3.2413T | 3.2593T | 0.5557% | WARN |
| aiGoodsAbsorbed | 5.0491T | 5.0253T | 0.4714% | WARN |
| newJobEmployment | 270.2345K | 211.7919K | 21.6266% | **FAIL** |
| newJobWageIncome | 7.8939B | 6.1888B | 21.5999% | **FAIL** |
| potentialGDP | 49.2836T | 38.2874T | 22.3120% | **FAIL** |
| wageConsumption | 1.4444T | 1.4450T | 0.0440% | WARN |
| assetConsumption | 3.7035T | 3.6823T | 0.5712% | WARN |
| transferConsumption | 14.8507T | 14.8176T | 0.2229% | WARN |
| corporateProfits | 4.7903T | 4.7771T | 0.2756% | WARN |
| aiCorporateProfits | 2.6440T | 2.6371T | 0.2615% | WARN |
| traditionalCorporateProfits | 2.1463T | 2.1400T | 0.2928% | WARN |
| aiGDPContribution | 10.5761T | 10.5484T | 0.2615% | WARN |
| totalDemandSpilloverLoss | 6.4983M | 6.4738M | 0.3773% | WARN |
| moneySupply | 59.5754T | 98.1509T | 64.7506% | **FAIL** |
| maxNeutralTransfers | 3.0301T | 4.5455T | 50.0147% | **FAIL** |

**Year 2046**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 80.3032M | 80.1304M | 0.2151% | WARN |
| totalUnemployment | 106.1885M | 106.3612M | 0.1626% | WARN |
| aggregateWageIncome | 2.5439T | 2.5272T | 0.6555% | WARN |
| aggregateAssetIncome | 11.7050T | 11.3766T | 2.8057% | **FAIL** |
| aggregateTransferIncome | 16.5946T | 16.5611T | 0.2022% | WARN |
| totalIncome | 30.8436T | 30.4649T | 1.2276% | **FAIL** |
| gdpNominal | 30.8053T | 30.6507T | 0.5019% | WARN |
| gdpReal | 47.7362T | 34.3319T | 28.0800% | **FAIL** |
| consumption | 13.0349T | 12.9457T | 0.6841% | WARN |
| investment | 10.4817T | 10.4435T | 0.3645% | WARN |
| governmentSpending | 6.5723T | 6.5430T | 0.4456% | WARN |
| consumerWelfareIndex | 54.6313K | 39.2189K | 28.2117% | **FAIL** |
| unrealizedAIOutput | 3.3248T | 3.3615T | 1.1037% | **FAIL** |
| aiGoodsAbsorbed | 5.3661T | 5.3293T | 0.6846% | WARN |
| newJobEmployment | 288.3384K | 216.3323K | 24.9728% | **FAIL** |
| newJobWageIncome | 8.3293B | 6.2218B | 25.3025% | **FAIL** |
| potentialGDP | 56.4270T | 39.3415T | 30.2790% | **FAIL** |
| wageConsumption | 1.3668T | 1.3567T | 0.7412% | WARN |
| assetConsumption | 4.0968T | 3.9818T | 2.8057% | **FAIL** |
| transferConsumption | 14.9351T | 14.9050T | 0.2022% | WARN |
| corporateProfits | 4.9510T | 4.9288T | 0.4475% | WARN |
| aiCorporateProfits | 2.7900T | 2.7808T | 0.3294% | WARN |
| traditionalCorporateProfits | 2.1610T | 2.1480T | 0.5999% | WARN |
| aiGDPContribution | 11.1600T | 11.1232T | 0.3294% | WARN |
| totalDemandSpilloverLoss | 5.3044M | 5.4066M | 1.9270% | **FAIL** |
| moneySupply | 63.0539T | 105.1078T | 66.6952% | **FAIL** |
| maxNeutralTransfers | 3.7658T | 5.4166T | 43.8358% | **FAIL** |

**Year 2047**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 78.6048M | 78.3287M | 0.3512% | WARN |
| totalUnemployment | 108.6328M | 108.9089M | 0.2542% | WARN |
| aggregateWageIncome | 2.4992T | 2.4715T | 1.1088% | **FAIL** |
| aggregateAssetIncome | 12.4127T | 11.8764T | 4.3207% | **FAIL** |
| aggregateTransferIncome | 16.6694T | 16.6378T | 0.1894% | WARN |
| totalIncome | 31.5812T | 30.9856T | 1.8859% | **FAIL** |
| gdpNominal | 31.2757T | 31.1007T | 0.5595% | WARN |
| gdpReal | 55.4747T | 38.3040T | 30.9522% | **FAIL** |
| consumption | 13.1597T | 13.0589T | 0.7659% | WARN |
| investment | 10.7725T | 10.7262T | 0.4295% | WARN |
| governmentSpending | 6.5968T | 6.5651T | 0.4802% | WARN |
| consumerWelfareIndex | 62.8803K | 43.3273K | 31.0956% | **FAIL** |
| unrealizedAIOutput | 3.3809T | 3.4238T | 1.2684% | **FAIL** |
| aiGoodsAbsorbed | 5.5954T | 5.5526T | 0.7651% | WARN |
| newJobEmployment | 315.4669K | 226.8644K | 28.0861% | **FAIL** |
| newJobWageIncome | 9.1024B | 6.4968B | 28.6263% | **FAIL** |
| potentialGDP | 64.4510T | 40.0771T | 37.8178% | **FAIL** |
| wageConsumption | 1.3293T | 1.3128T | 1.2459% | **FAIL** |
| assetConsumption | 4.3444T | 4.1567T | 4.3207% | **FAIL** |
| transferConsumption | 15.0024T | 14.9740T | 0.1894% | WARN |
| corporateProfits | 5.0615T | 5.0362T | 0.4985% | WARN |
| aiCorporateProfits | 2.8949T | 2.8842T | 0.3693% | WARN |
| traditionalCorporateProfits | 2.1666T | 2.1520T | 0.6712% | WARN |
| aiGDPContribution | 11.5797T | 11.5369T | 0.3693% | WARN |
| totalDemandSpilloverLoss | 4.1250M | 4.3081M | 4.4394% | **FAIL** |
| moneySupply | 66.5462T | 112.0925T | 68.4430% | **FAIL** |
| maxNeutralTransfers | 4.6004T | 6.3534T | 38.1071% | **FAIL** |

**Year 2048**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 77.2387M | 76.9212M | 0.4110% | WARN |
| totalUnemployment | 110.7479M | 111.0654M | 0.2867% | WARN |
| aggregateWageIncome | 2.4523T | 2.4215T | 1.2572% | **FAIL** |
| aggregateAssetIncome | 12.8711T | 12.1745T | 5.4123% | **FAIL** |
| aggregateTransferIncome | 16.7379T | 16.7071T | 0.1838% | WARN |
| totalIncome | 32.0614T | 31.3031T | 2.3649% | **FAIL** |
| gdpNominal | 31.5378T | 31.3732T | 0.5220% | WARN |
| gdpReal | 64.3646T | 42.7016T | 33.6566% | **FAIL** |
| consumption | 13.2423T | 13.1449T | 0.7359% | WARN |
| investment | 10.9118T | 10.8727T | 0.3584% | WARN |
| governmentSpending | 6.6129T | 6.5806T | 0.4896% | WARN |
| consumerWelfareIndex | 72.5146K | 48.0052K | 33.7993% | **FAIL** |
| unrealizedAIOutput | 3.4253T | 3.4678T | 1.2420% | **FAIL** |
| aiGoodsAbsorbed | 5.7643T | 5.7221T | 0.7325% | WARN |
| newJobEmployment | 348.6679K | 240.6899K | 30.9687% | **FAIL** |
| newJobWageIncome | 9.9954B | 6.8417B | 31.5515% | **FAIL** |
| potentialGDP | 73.5542T | 40.5631T | 44.8528% | **FAIL** |
| wageConsumption | 1.2935T | 1.2752T | 1.4153% | **FAIL** |
| assetConsumption | 4.5049T | 4.2611T | 5.4123% | **FAIL** |
| transferConsumption | 15.0641T | 15.0364T | 0.1838% | WARN |
| corporateProfits | 5.1339T | 5.1099T | 0.4673% | WARN |
| aiCorporateProfits | 2.9727T | 2.9622T | 0.3533% | WARN |
| traditionalCorporateProfits | 2.1612T | 2.1477T | 0.6241% | WARN |
| aiGDPContribution | 11.8907T | 11.8487T | 0.3533% | WARN |
| totalDemandSpilloverLoss | 3.3288M | 3.5265M | 5.9380% | **FAIL** |
| moneySupply | 70.0526T | 119.1051T | 70.0225% | **FAIL** |
| maxNeutralTransfers | 5.5462T | 7.3606T | 32.7134% | **FAIL** |

**Year 2049**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 76.4454M | 76.1307M | 0.4117% | WARN |
| totalUnemployment | 112.2932M | 112.6079M | 0.2803% | WARN |
| aggregateWageIncome | 2.4193T | 2.3899T | 1.2128% | **FAIL** |
| aggregateAssetIncome | 13.1903T | 12.3527T | 6.3502% | **FAIL** |
| aggregateTransferIncome | 16.7956T | 16.7648T | 0.1835% | WARN |
| totalIncome | 32.4053T | 31.5075T | 2.7705% | **FAIL** |
| gdpNominal | 31.7137T | 31.5678T | 0.4601% | WARN |
| gdpReal | 74.7165T | 47.6329T | 36.2485% | **FAIL** |
| consumption | 13.3121T | 13.2246T | 0.6569% | WARN |
| investment | 10.9901T | 10.9596T | 0.2771% | WARN |
| governmentSpending | 6.6219T | 6.5899T | 0.4836% | WARN |
| consumerWelfareIndex | 83.8159K | 53.3282K | 36.3746% | **FAIL** |
| unrealizedAIOutput | 3.4511T | 3.4898T | 1.1213% | **FAIL** |
| aiGoodsAbsorbed | 5.8906T | 5.8519T | 0.6569% | WARN |
| newJobEmployment | 391.6972K | 259.8651K | 33.6566% | **FAIL** |
| newJobWageIncome | 11.1464B | 7.3357B | 34.1882% | **FAIL** |
| potentialGDP | 84.0581T | 40.9095T | 51.3319% | **FAIL** |
| wageConsumption | 1.2690T | 1.2516T | 1.3698% | **FAIL** |
| assetConsumption | 4.6166T | 4.3234T | 6.3502% | **FAIL** |
| transferConsumption | 15.1161T | 15.0883T | 0.1835% | WARN |
| corporateProfits | 5.1851T | 5.1636T | 0.4140% | WARN |
| aiCorporateProfits | 3.0296T | 3.0199T | 0.3193% | WARN |
| traditionalCorporateProfits | 2.1555T | 2.1437T | 0.5472% | WARN |
| aiGDPContribution | 12.1183T | 12.0796T | 0.3193% | WARN |
| totalDemandSpilloverLoss | 2.8997M | 3.0826M | 6.3071% | **FAIL** |
| moneySupply | 73.5729T | 126.1458T | 71.4569% | **FAIL** |
| maxNeutralTransfers | 6.5902T | 8.4027T | 27.5030% | **FAIL** |

**Year 2050**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 76.1715M | 75.8509M | 0.4208% | WARN |
| totalUnemployment | 113.3220M | 113.6426M | 0.2829% | WARN |
| aggregateWageIncome | 2.4051T | 2.3773T | 1.1571% | **FAIL** |
| aggregateAssetIncome | 13.4289T | 12.4671T | 7.1624% | **FAIL** |
| aggregateTransferIncome | 16.8436T | 16.8128T | 0.1823% | WARN |
| totalIncome | 32.6776T | 31.6572T | 3.1225% | **FAIL** |
| gdpNominal | 31.8658T | 31.7385T | 0.3995% | WARN |
| gdpReal | 86.8240T | 53.1851T | 38.7438% | **FAIL** |
| consumption | 13.3772T | 13.3027T | 0.5571% | WARN |
| investment | 11.0574T | 11.0324T | 0.2255% | WARN |
| governmentSpending | 6.6279T | 6.5966T | 0.4735% | WARN |
| consumerWelfareIndex | 97.0195K | 59.3364K | 38.8407% | **FAIL** |
| unrealizedAIOutput | 3.4616T | 3.4949T | 0.9636% | WARN |
| aiGoodsAbsorbed | 5.9874T | 5.9541T | 0.5571% | WARN |
| newJobEmployment | 446.4187K | 284.5986K | 36.2485% | **FAIL** |
| newJobWageIncome | 12.6436B | 8.0006B | 36.7223% | **FAIL** |
| potentialGDP | 96.2731T | 41.1875T | 57.2180% | **FAIL** |
| wageConsumption | 1.2578T | 1.2413T | 1.3169% | **FAIL** |
| assetConsumption | 4.7001T | 4.3635T | 7.1624% | **FAIL** |
| transferConsumption | 15.1592T | 15.1316T | 0.1823% | WARN |
| corporateProfits | 5.2254T | 5.2067T | 0.3573% | WARN |
| aiCorporateProfits | 3.0717T | 3.0634T | 0.2715% | WARN |
| traditionalCorporateProfits | 2.1537T | 2.1434T | 0.4798% | WARN |
| aiGDPContribution | 12.2868T | 12.2534T | 0.2715% | WARN |
| totalDemandSpilloverLoss | 2.6526M | 2.8114M | 5.9837% | **FAIL** |
| moneySupply | 77.1073T | 133.2147T | 72.7652% | **FAIL** |
| maxNeutralTransfers | 7.7559T | 9.5019T | 22.5124% | **FAIL** |

### ai_fund_only

**Year 2026**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 32.1442T | 32.9900T | 2.6313% | **FAIL** |

**Year 2027**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 33.1365T | 34.9033T | 5.3318% | **FAIL** |

**Year 2028**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 33.8511T | 36.5942T | 8.1033% | **FAIL** |

**Year 2029**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 34.3152T | 38.0719T | 10.9478% | **FAIL** |

**Year 2030**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 34.8419T | 39.6735T | 13.8672% | **FAIL** |

**Year 2031**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 35.2650T | 41.2118T | 16.8633% | **FAIL** |

**Year 2032**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| aiAdditionalOutput | 320.5461M | 330.6360M | 3.1477% | **FAIL** |
| aiInvestmentBoost | 96.1638M | 99.1908M | 3.1477% | **FAIL** |
| aiNetExportBoost | 32.0546M | 33.0636M | 3.1477% | **FAIL** |
| aiConsumerGoodsPotential | 192.3277M | 198.3816M | 3.1477% | **FAIL** |
| aiGoodsAbsorbed | 192.3277M | 198.3816M | 3.1477% | **FAIL** |
| potentialGDP | 35.5871T | 42.6779T | 19.9252% | **FAIL** |
| aiCorporateProfits | 80.1365M | 82.6590M | 3.1477% | **FAIL** |
| aiGDPContribution | 320.5461M | 330.6360M | 3.1477% | **FAIL** |
| maxNeutralTransfers | 2.7751B | 2.1816B | 21.3856% | **FAIL** |

**Year 2033**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 7.0593M | 7.0613M | 0.0285% | WARN |
| aiAdditionalOutput | 5.5776B | 5.7386B | 2.8864% | **FAIL** |
| aiInvestmentBoost | 1.6733B | 1.7216B | 2.8864% | **FAIL** |
| aiNetExportBoost | 557.7579M | 573.8571M | 2.8864% | **FAIL** |
| aiConsumerGoodsPotential | 3.3465B | 3.4431B | 2.8864% | **FAIL** |
| aiGoodsAbsorbed | 3.3465B | 3.4431B | 2.8864% | **FAIL** |
| newJobEmployment | 800.2011K | 800.1882K | 0.0016% | WARN |
| potentialGDP | 35.8639T | 44.0954T | 22.9523% | **FAIL** |
| aiCorporateProfits | 1.3944B | 1.4346B | 2.8864% | **FAIL** |
| aiGDPContribution | 5.5776B | 5.7386B | 2.8864% | **FAIL** |
| maxNeutralTransfers | 26.6021B | 20.1660B | 24.1937% | **FAIL** |

**Year 2034**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 7.4487M | 7.4591M | 0.1401% | WARN |
| aggregateAssetIncome | 9.7131T | 9.7142T | 0.0107% | WARN |
| aiAdditionalOutput | 34.7859B | 35.5073B | 2.0738% | **FAIL** |
| aiInvestmentBoost | 10.4358B | 10.6522B | 2.0738% | **FAIL** |
| aiNetExportBoost | 3.4786B | 3.5507B | 2.0738% | **FAIL** |
| aiConsumerGoodsPotential | 20.8715B | 21.3044B | 2.0738% | **FAIL** |
| aiGoodsAbsorbed | 20.8715B | 21.3044B | 2.0738% | **FAIL** |
| newJobEmployment | 803.6936K | 803.6338K | 0.0074% | WARN |
| potentialGDP | 36.1603T | 45.4877T | 25.7944% | **FAIL** |
| assetConsumption | 3.2149T | 3.2153T | 0.0113% | WARN |
| aiCorporateProfits | 8.6965B | 8.8768B | 2.0738% | **FAIL** |
| aiGDPContribution | 34.7859B | 35.5073B | 2.0738% | **FAIL** |
| maxNeutralTransfers | 78.5731B | 56.7991B | 27.7117% | **FAIL** |

**Year 2035**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 170.0609M | 170.0400M | 0.0123% | WARN |
| totalUnemployment | 8.4187M | 8.4396M | 0.2476% | WARN |
| aggregateWageIncome | 27.0576T | 27.0459T | 0.0432% | WARN |
| aggregateAssetIncome | 10.1858T | 10.1877T | 0.0187% | WARN |
| aggregateTransferIncome | 7.6491T | 7.6448T | 0.0553% | WARN |
| totalIncome | 44.8925T | 44.8785T | 0.0312% | WARN |
| gdpNominal | 46.4922T | 46.4592T | 0.0711% | WARN |
| gdpReal | 36.2556T | 36.1819T | 0.2034% | WARN |
| consumption | 32.3041T | 32.2739T | 0.0935% | WARN |
| governmentSpending | 7.0191T | 7.0158T | 0.0483% | WARN |
| consumerWelfareIndex | 71.1929K | 71.0322K | 0.2257% | WARN |
| aiAdditionalOutput | 120.9332B | 122.5150B | 1.3080% | **FAIL** |
| aiInvestmentBoost | 36.2800B | 36.7545B | 1.3080% | **FAIL** |
| aiNetExportBoost | 12.0933B | 12.2515B | 1.3080% | **FAIL** |
| aiConsumerGoodsPotential | 72.5599B | 73.5090B | 1.3080% | **FAIL** |
| aiGoodsAbsorbed | 72.5599B | 73.5090B | 1.3080% | **FAIL** |
| newJobEmployment | 803.0402K | 802.9048K | 0.0169% | WARN |
| newJobWageIncome | 92.8306B | 92.7891B | 0.0447% | WARN |
| potentialGDP | 36.3282T | 46.5327T | 28.0897% | **FAIL** |
| wageConsumption | 21.6032T | 21.5923T | 0.0505% | WARN |
| assetConsumption | 3.3526T | 3.3533T | 0.0199% | WARN |
| transferConsumption | 7.4303T | 7.4265T | 0.0512% | WARN |
| corporateProfits | 5.1311T | 5.1277T | 0.0666% | WARN |
| aiCorporateProfits | 30.2333B | 30.6288B | 1.3080% | **FAIL** |
| traditionalCorporateProfits | 5.1008T | 5.0970T | 0.0747% | WARN |
| aiGDPContribution | 120.9332B | 122.5150B | 1.3080% | **FAIL** |
| maxNeutralTransfers | 144.8114B | 102.7559B | 29.0415% | **FAIL** |

**Year 2036**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 169.3813M | 169.3600M | 0.0126% | WARN |
| totalUnemployment | 9.8122M | 9.8335M | 0.2174% | WARN |
| aggregateWageIncome | 26.9699T | 26.9398T | 0.1116% | WARN |
| aggregateAssetIncome | 10.6490T | 10.6443T | 0.0439% | WARN |
| aggregateTransferIncome | 7.7620T | 7.7443T | 0.2270% | WARN |
| totalIncome | 45.3808T | 45.3284T | 0.1154% | WARN |
| gdpNominal | 46.6851T | 46.5759T | 0.2339% | WARN |
| gdpReal | 35.9997T | 35.6975T | 0.8396% | WARN |
| consumption | 32.2133T | 32.1279T | 0.2652% | WARN |
| investment | 8.4588T | 8.4481T | 0.1268% | WARN |
| governmentSpending | 7.1159T | 7.1018T | 0.1973% | WARN |
| consumerWelfareIndex | 69.9208K | 69.3120K | 0.8707% | WARN |
| aiAdditionalOutput | 282.6292B | 284.6574B | 0.7176% | WARN |
| aiInvestmentBoost | 84.7888B | 85.3972B | 0.7176% | WARN |
| aiNetExportBoost | 28.2629B | 28.4657B | 0.7176% | WARN |
| aiConsumerGoodsPotential | 169.5775B | 170.7944B | 0.7176% | WARN |
| aiGoodsAbsorbed | 169.5775B | 170.7944B | 0.7176% | WARN |
| newJobEmployment | 795.7145K | 793.9532K | 0.2213% | WARN |
| newJobWageIncome | 92.3003B | 92.0087B | 0.3159% | WARN |
| potentialGDP | 36.1693T | 46.7467T | 29.2443% | **FAIL** |
| wageConsumption | 21.4309T | 21.4053T | 0.1191% | WARN |
| assetConsumption | 3.4829T | 3.4812T | 0.0470% | WARN |
| transferConsumption | 7.6138T | 7.5980T | 0.2083% | WARN |
| corporateProfits | 5.1749T | 5.1632T | 0.2266% | WARN |
| aiCorporateProfits | 70.6573B | 71.1643B | 0.7176% | WARN |
| traditionalCorporateProfits | 5.1043T | 5.0920T | 0.2397% | WARN |
| aiGDPContribution | 282.6292B | 284.6574B | 0.7176% | WARN |
| maxNeutralTransfers | 258.2634B | 187.9749B | 27.2158% | **FAIL** |

**Year 2037**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 167.9573M | 167.9352M | 0.0132% | WARN |
| totalUnemployment | 11.9530M | 11.9751M | 0.1848% | WARN |
| aggregateWageIncome | 26.0263T | 25.9542T | 0.2773% | WARN |
| aggregateAssetIncome | 11.0347T | 11.0132T | 0.1954% | WARN |
| aggregateTransferIncome | 7.8057T | 7.7855T | 0.2593% | WARN |
| totalIncome | 44.8668T | 44.7528T | 0.2540% | WARN |
| gdpNominal | 45.7247T | 44.2904T | 3.1367% | **FAIL** |
| gdpReal | 35.2470T | 33.5910T | 4.6984% | **FAIL** |
| consumption | 31.1969T | 29.8110T | 4.4423% | **FAIL** |
| investment | 8.4802T | 8.4474T | 0.3863% | WARN |
| governmentSpending | 7.1243T | 7.1058T | 0.2601% | WARN |
| consumerWelfareIndex | 67.4217K | 63.3879K | 5.9829% | WARN |
| aiAdditionalOutput | 590.2807B | 592.6154B | 0.3955% | WARN |
| aiInvestmentBoost | 177.0842B | 177.7846B | 0.3955% | WARN |
| aiNetExportBoost | 59.0281B | 59.2615B | 0.3955% | WARN |
| aiConsumerGoodsPotential | 354.1684B | 355.5692B | 0.3955% | WARN |
| aiGoodsAbsorbed | 354.1684B | 355.5692B | 0.3955% | WARN |
| newJobEmployment | 775.0888K | 768.4707K | 0.8539% | WARN |
| newJobWageIncome | 87.9009B | 86.9242B | 1.1111% | **FAIL** |
| potentialGDP | 35.6012T | 44.6460T | 25.4058% | **FAIL** |
| wageConsumption | 20.5291T | 20.4706T | 0.2850% | WARN |
| assetConsumption | 3.5813T | 3.5737T | 0.2108% | WARN |
| transferConsumption | 7.7474T | 7.7292T | 0.2351% | WARN |
| corporateProfits | 5.1124T | 4.9549T | 3.0796% | **FAIL** |
| aiCorporateProfits | 147.5702B | 148.1539B | 0.3955% | WARN |
| traditionalCorporateProfits | 4.9648T | 4.8068T | 3.1829% | **FAIL** |
| aiGDPContribution | 590.2807B | 592.6154B | 0.3955% | WARN |
| maxNeutralTransfers | 393.1061B | 305.6400B | 22.2500% | **FAIL** |

**Year 2038**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 165.6658M | 165.6265M | 0.0237% | WARN |
| totalUnemployment | 14.9642M | 15.0034M | 0.2621% | WARN |
| aggregateWageIncome | 24.0863T | 23.3141T | 3.2058% | **FAIL** |
| aggregateAssetIncome | 11.2703T | 10.9177T | 3.1286% | **FAIL** |
| aggregateTransferIncome | 7.8635T | 7.8436T | 0.2532% | WARN |
| totalIncome | 43.2201T | 42.0754T | 2.6485% | **FAIL** |
| gdpNominal | 41.8103T | 40.2008T | 3.8496% | **FAIL** |
| gdpReal | 32.7571T | 30.4393T | 7.0755% | **FAIL** |
| consumption | 27.4019T | 26.3132T | 3.9729% | **FAIL** |
| investment | 8.3196T | 7.8277T | 5.9133% | **FAIL** |
| governmentSpending | 7.0915T | 7.0276T | 0.9011% | WARN |
| consumerWelfareIndex | 59.9493K | 55.6362K | 7.1946% | WARN |
| aiAdditionalOutput | 1.0979T | 1.0986T | 0.0636% | WARN |
| aiInvestmentBoost | 329.3805B | 329.5901B | 0.0636% | WARN |
| aiNetExportBoost | 109.7935B | 109.8634B | 0.0636% | WARN |
| aiConsumerGoodsPotential | 658.7610B | 659.1803B | 0.0636% | WARN |
| aiGoodsAbsorbed | 658.7610B | 659.1803B | 0.0636% | WARN |
| newJobEmployment | 738.4464K | 703.7217K | 4.7024% | **FAIL** |
| newJobWageIncome | 79.1501B | 73.0244B | 7.7393% | **FAIL** |
| potentialGDP | 33.4158T | 40.8600T | 22.2773% | **FAIL** |
| wageConsumption | 18.8012T | 18.1960T | 3.2193% | **FAIL** |
| assetConsumption | 3.6216T | 3.4982T | 3.4076% | **FAIL** |
| transferConsumption | 7.9078T | 7.8899T | 0.2266% | WARN |
| corporateProfits | 4.7528T | 4.5759T | 3.7231% | **FAIL** |
| aiCorporateProfits | 274.4837B | 274.6585B | 0.0636% | WARN |
| traditionalCorporateProfits | 4.4784T | 4.3012T | 3.9552% | **FAIL** |
| aiGDPContribution | 1.0979T | 1.0986T | 0.0636% | WARN |
| maxNeutralTransfers | 573.2190B | 518.9595B | 9.4658% | **FAIL** |

**Year 2039**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 159.9763M | 159.6616M | 0.1967% | WARN |
| totalUnemployment | 21.3762M | 21.6909M | 1.4722% | **FAIL** |
| aggregateWageIncome | 19.4529T | 18.5891T | 4.4404% | **FAIL** |
| aggregateAssetIncome | 10.9907T | 10.5902T | 3.6435% | **FAIL** |
| aggregateTransferIncome | 7.9866T | 7.9720T | 0.1831% | WARN |
| totalIncome | 38.4302T | 37.1513T | 3.3277% | **FAIL** |
| gdpNominal | 35.0548T | 33.3157T | 4.9610% | **FAIL** |
| gdpReal | 28.6772T | 25.4474T | 11.2626% | **FAIL** |
| consumption | 21.3346T | 19.9235T | 6.6138% | **FAIL** |
| investment | 7.5622T | 7.2608T | 3.9862% | **FAIL** |
| governmentSpending | 6.9574T | 6.8875T | 1.0047% | **FAIL** |
| consumerWelfareIndex | 48.5425K | 42.3262K | 12.8058% | WARN |
| aiAdditionalOutput | 2.1776T | 2.2191T | 1.9074% | **FAIL** |
| aiInvestmentBoost | 653.2742B | 665.7348B | 1.9074% | **FAIL** |
| aiNetExportBoost | 217.7581B | 221.9116B | 1.9074% | **FAIL** |
| aiConsumerGoodsPotential | 1.3065T | 1.3315T | 1.9074% | **FAIL** |
| unrealizedAIOutput | 0.000000 | 74.9034B | 100.0000% | **FAIL** |
| aiGoodsAbsorbed | 1.3065T | 1.2566T | 3.8255% | **FAIL** |
| newJobEmployment | 646.3745K | 599.0722K | 7.3181% | **FAIL** |
| newJobWageIncome | 59.0358B | 52.4316B | 11.1868% | **FAIL** |
| potentialGDP | 29.9837T | 34.6472T | 15.5534% | **FAIL** |
| wageConsumption | 14.8438T | 14.1686T | 4.5491% | **FAIL** |
| assetConsumption | 3.4753T | 3.3351T | 4.0329% | **FAIL** |
| transferConsumption | 8.1432T | 8.1300T | 0.1616% | WARN |
| corporateProfits | 4.1609T | 3.9649T | 4.7098% | **FAIL** |
| aiCorporateProfits | 544.3951B | 536.0531B | 1.5323% | **FAIL** |
| traditionalCorporateProfits | 3.6165T | 3.4289T | 5.1881% | **FAIL** |
| aiGDPContribution | 2.1776T | 2.1442T | 1.5323% | **FAIL** |
| maxNeutralTransfers | 709.0274B | 928.4275B | 30.9438% | **FAIL** |

**Year 2040**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 149.2744M | 148.7502M | 0.3511% | WARN |
| totalUnemployment | 32.8035M | 33.3276M | 1.5978% | **FAIL** |
| aggregateWageIncome | 13.0943T | 12.3185T | 5.9250% | **FAIL** |
| aggregateAssetIncome | 10.0146T | 9.5469T | 4.6709% | **FAIL** |
| aggregateTransferIncome | 8.2060T | 8.1954T | 0.1292% | WARN |
| totalIncome | 31.3150T | 30.0607T | 4.0051% | **FAIL** |
| gdpNominal | 28.7329T | 27.6290T | 3.8419% | **FAIL** |
| gdpReal | 24.9865T | 21.5216T | 13.8668% | **FAIL** |
| consumption | 15.6409T | 14.8178T | 5.2628% | **FAIL** |
| investment | 6.8072T | 6.5527T | 3.7396% | **FAIL** |
| governmentSpending | 6.7261T | 6.6517T | 1.1052% | **FAIL** |
| consumerWelfareIndex | 37.6793K | 31.9748K | 15.1396% | WARN |
| aiAdditionalOutput | 4.1146T | 4.1733T | 1.4256% | **FAIL** |
| aiInvestmentBoost | 1.2344T | 1.2520T | 1.4256% | **FAIL** |
| aiNetExportBoost | 411.4636B | 417.3295B | 1.4256% | **FAIL** |
| aiConsumerGoodsPotential | 2.4688T | 2.5040T | 1.4256% | **FAIL** |
| unrealizedAIOutput | 639.7028B | 746.4552B | 16.6878% | **FAIL** |
| aiGoodsAbsorbed | 1.8291T | 1.7575T | 3.9122% | **FAIL** |
| newJobEmployment | 505.3524K | 446.7100K | 11.6043% | **FAIL** |
| newJobWageIncome | 34.3602B | 28.7045B | 16.4599% | **FAIL** |
| potentialGDP | 27.4552T | 30.1330T | 9.7530% | **FAIL** |
| wageConsumption | 9.5840T | 8.9984T | 6.1100% | **FAIL** |
| assetConsumption | 3.0779T | 2.9142T | 5.3192% | **FAIL** |
| transferConsumption | 8.4839T | 8.4744T | 0.1125% | WARN |
| corporateProfits | 3.6471T | 3.5189T | 3.5140% | **FAIL** |
| aiCorporateProfits | 868.7334B | 856.7099B | 1.3840% | **FAIL** |
| traditionalCorporateProfits | 2.7784T | 2.6622T | 4.1800% | **FAIL** |
| aiGDPContribution | 3.4749T | 3.4268T | 1.3840% | **FAIL** |
| totalDemandSpilloverLoss | 0.000000 | 98.2102K | 100.0000% | **FAIL** |
| maxNeutralTransfers | 808.4211B | 1.3970T | 72.8119% | **FAIL** |

**Year 2041**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 121.7973M | 118.7869M | 2.4717% | **FAIL** |
| totalUnemployment | 61.0088M | 64.0193M | 4.9344% | **FAIL** |
| aggregateWageIncome | 6.2319T | 5.6410T | 9.4822% | **FAIL** |
| aggregateAssetIncome | 9.1009T | 8.7965T | 3.3443% | **FAIL** |
| aggregateTransferIncome | 8.7476T | 8.7847T | 0.4245% | WARN |
| totalIncome | 24.0803T | 23.2222T | 3.5637% | **FAIL** |
| gdpNominal | 24.6758T | 24.0941T | 2.3574% | **FAIL** |
| gdpReal | 23.0553T | 19.3339T | 16.1411% | **FAIL** |
| consumption | 11.1825T | 10.8081T | 3.3482% | **FAIL** |
| investment | 6.9435T | 6.7620T | 2.6149% | **FAIL** |
| governmentSpending | 6.5096T | 6.4570T | 0.8079% | WARN |
| consumerWelfareIndex | 28.8283K | 23.9298K | 16.9921% | WARN |
| unrealizedAIOutput | 2.0859T | 2.1645T | 3.7711% | **FAIL** |
| aiGoodsAbsorbed | 2.3493T | 2.2706T | 3.3482% | **FAIL** |
| newJobEmployment | 357.7434K | 308.1358K | 13.8668% | **FAIL** |
| newJobWageIncome | 14.8774B | 11.9074B | 19.9630% | **FAIL** |
| potentialGDP | 27.4904T | 28.5292T | 3.7788% | **FAIL** |
| wageConsumption | 4.0827T | 3.6491T | 10.6198% | **FAIL** |
| assetConsumption | 2.6940T | 2.5875T | 3.9541% | **FAIL** |
| transferConsumption | 9.1361T | 9.1695T | 0.3658% | WARN |
| corporateProfits | 3.4572T | 3.3822T | 2.1694% | **FAIL** |
| aiCorporateProfits | 1.3265T | 1.3068T | 1.4825% | **FAIL** |
| traditionalCorporateProfits | 2.1307T | 2.0753T | 2.5971% | **FAIL** |
| aiGDPContribution | 5.3060T | 5.2274T | 1.4825% | **FAIL** |
| totalDemandSpilloverLoss | 9.3643M | 12.3252M | 31.6181% | **FAIL** |
| maxNeutralTransfers | 909.3860B | 1.5252T | 67.7177% | **FAIL** |

**Year 2042**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 99.6938M | 97.8780M | 1.8213% | **FAIL** |
| totalUnemployment | 83.8436M | 85.6594M | 2.1656% | **FAIL** |
| aggregateWageIncome | 3.3647T | 3.1621T | 6.0221% | **FAIL** |
| aggregateAssetIncome | 8.3989T | 8.2842T | 1.3655% | **FAIL** |
| aggregateTransferIncome | 9.1860T | 9.2002T | 0.1546% | WARN |
| totalIncome | 20.9496T | 20.6465T | 1.4469% | **FAIL** |
| gdpNominal | 23.1726T | 22.9899T | 0.7885% | WARN |
| gdpReal | 23.5006T | 19.1908T | 18.3392% | **FAIL** |
| consumption | 9.5215T | 9.3953T | 1.3252% | **FAIL** |
| investment | 6.9406T | 6.9046T | 0.5184% | WARN |
| governmentSpending | 6.3707T | 6.3360T | 0.5448% | WARN |
| consumerWelfareIndex | 26.5374K | 21.5534K | 18.7810% | WARN |
| unrealizedAIOutput | 3.0969T | 3.1306T | 1.0887% | **FAIL** |
| aiGoodsAbsorbed | 2.5442T | 2.5105T | 1.3252% | **FAIL** |
| newJobEmployment | 283.2781K | 237.5538K | 16.1411% | **FAIL** |
| newJobWageIncome | 8.1038B | 6.5119B | 19.6436% | **FAIL** |
| potentialGDP | 29.1417T | 28.6309T | 1.7528% | **FAIL** |
| wageConsumption | 1.9973T | 1.8613T | 6.8052% | **FAIL** |
| assetConsumption | 2.3746T | 2.3345T | 1.6903% | **FAIL** |
| transferConsumption | 9.7202T | 9.7330T | 0.1315% | WARN |
| corporateProfits | 3.4317T | 3.4069T | 0.7232% | WARN |
| aiCorporateProfits | 1.5762T | 1.5678T | 0.5348% | WARN |
| traditionalCorporateProfits | 1.8554T | 1.8390T | 0.8834% | WARN |
| aiGDPContribution | 6.3049T | 6.2712T | 0.5348% | WARN |
| totalDemandSpilloverLoss | 19.7516M | 21.5216M | 8.9615% | **FAIL** |
| maxNeutralTransfers | 1.0846T | 1.7714T | 63.3216% | **FAIL** |

**Year 2043**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 84.1888M | 83.6684M | 0.6181% | WARN |
| totalUnemployment | 100.0828M | 100.6032M | 0.5199% | WARN |
| aggregateWageIncome | 2.2008T | 2.1584T | 1.9257% | **FAIL** |
| aggregateAssetIncome | 8.7978T | 8.8203T | 0.2551% | WARN |
| aggregateTransferIncome | 9.4978T | 9.4871T | 0.1124% | WARN |
| totalIncome | 20.4964T | 20.4658T | 0.1493% | WARN |
| gdpReal | 26.3716T | 20.7890T | 21.1689% | **FAIL** |
| consumption | 9.0183T | 8.9936T | 0.2731% | WARN |
| investment | 7.6965T | 7.7364T | 0.5184% | WARN |
| governmentSpending | 6.3192T | 6.2982T | 0.3330% | WARN |
| consumerWelfareIndex | 27.5824K | 21.6854K | 21.3798% | WARN |
| unrealizedAIOutput | 3.8884T | 3.8964T | 0.2037% | WARN |
| aiGoodsAbsorbed | 2.8998T | 2.8919T | 0.2731% | WARN |
| newJobEmployment | 232.9745K | 190.2488K | 18.3392% | **FAIL** |
| newJobWageIncome | 5.4580B | 4.4000B | 19.3832% | **FAIL** |
| potentialGDP | 33.1598T | 30.3885T | 8.3574% | **FAIL** |
| wageConsumption | 1.2114T | 1.1850T | 2.1772% | **FAIL** |
| assetConsumption | 2.4295T | 2.4374T | 0.3234% | WARN |
| transferConsumption | 10.2187T | 10.2091T | 0.0940% | WARN |
| corporateProfits | 3.6357T | 3.6345T | 0.0345% | WARN |
| aiCorporateProfits | 1.8563T | 1.8543T | 0.1067% | WARN |
| traditionalCorporateProfits | 1.7794T | 1.7801T | 0.0408% | WARN |
| aiGDPContribution | 7.4253T | 7.4174T | 0.1067% | WARN |
| totalDemandSpilloverLoss | 20.5134M | 20.9910M | 2.3284% | **FAIL** |
| maxNeutralTransfers | 1.4726T | 2.3217T | 57.6621% | **FAIL** |

**Year 2044**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| aggregateAssetIncome | 10.0441T | 10.0922T | 0.4789% | WARN |
| aggregateTransferIncome | 9.6319T | 9.6112T | 0.2144% | WARN |
| totalIncome | 21.5971T | 21.6246T | 0.1273% | WARN |
| gdpNominal | 24.7465T | 24.7323T | 0.0574% | WARN |
| gdpReal | 31.0125T | 23.3787T | 24.6152% | **FAIL** |
| consumption | 9.1129T | 9.0774T | 0.3899% | WARN |
| investment | 8.6040T | 8.6412T | 0.4317% | WARN |
| governmentSpending | 6.3339T | 6.3191T | 0.2342% | WARN |
| consumerWelfareIndex | 31.1359K | 23.3936K | 24.8660% | WARN |
| aiAdditionalOutput | 12.6979T | 12.6878T | 0.0795% | WARN |
| aiInvestmentBoost | 3.8094T | 3.8063T | 0.0795% | WARN |
| aiNetExportBoost | 1.2698T | 1.2688T | 0.0795% | WARN |
| aiConsumerGoodsPotential | 7.6188T | 7.6127T | 0.0795% | WARN |
| unrealizedAIOutput | 4.3300T | 4.3394T | 0.2164% | WARN |
| aiGoodsAbsorbed | 3.2887T | 3.2733T | 0.4691% | WARN |
| newJobEmployment | 225.0996K | 177.6354K | 21.0859% | **FAIL** |
| newJobWageIncome | 5.0671B | 3.9983B | 21.0928% | **FAIL** |
| potentialGDP | 38.6312T | 32.3450T | 16.2725% | **FAIL** |
| assetConsumption | 2.7683T | 2.7851T | 0.6082% | WARN |
| transferConsumption | 10.5900T | 10.5714T | 0.1755% | WARN |
| corporateProfits | 3.8936T | 3.8893T | 0.1101% | WARN |
| aiCorporateProfits | 2.0920T | 2.0871T | 0.2326% | WARN |
| traditionalCorporateProfits | 1.8016T | 1.8022T | 0.0321% | WARN |
| aiGDPContribution | 8.3679T | 8.3484T | 0.2326% | WARN |
| totalDemandSpilloverLoss | 17.7696M | 17.7859M | 0.0920% | WARN |
| maxNeutralTransfers | 2.0846T | 3.1337T | 50.3280% | **FAIL** |

**Year 2045**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 74.9483M | 74.8459M | 0.1366% | WARN |
| totalUnemployment | 110.8004M | 110.9027M | 0.0924% | WARN |
| aggregateWageIncome | 1.8537T | 1.8483T | 0.2890% | WARN |
| aggregateAssetIncome | 11.7545T | 11.6095T | 1.2339% | **FAIL** |
| aggregateTransferIncome | 9.7036T | 9.6849T | 0.1927% | WARN |
| totalIncome | 23.3118T | 23.1427T | 0.7254% | WARN |
| gdpNominal | 26.0104T | 25.9120T | 0.3781% | WARN |
| gdpReal | 36.9465T | 26.5589T | 28.1153% | **FAIL** |
| consumption | 9.5400T | 9.4608T | 0.8299% | WARN |
| investment | 9.3212T | 9.3165T | 0.0499% | WARN |
| governmentSpending | 6.3731T | 6.3578T | 0.2397% | WARN |
| consumerWelfareIndex | 36.7977K | 26.3319K | 28.4413% | **FAIL** |
| aiAdditionalOutput | 13.7817T | 13.7857T | 0.0290% | WARN |
| aiInvestmentBoost | 4.1345T | 4.1357T | 0.0290% | WARN |
| aiNetExportBoost | 1.3782T | 1.3786T | 0.0290% | WARN |
| aiConsumerGoodsPotential | 8.2690T | 8.2714T | 0.0290% | WARN |
| unrealizedAIOutput | 4.5323T | 4.5647T | 0.7134% | WARN |
| aiGoodsAbsorbed | 3.7367T | 3.7068T | 0.8011% | WARN |
| newJobEmployment | 236.4465K | 178.2017K | 24.6334% | **FAIL** |
| newJobWageIncome | 5.3972B | 4.0616B | 24.7461% | **FAIL** |
| potentialGDP | 45.2156T | 34.1835T | 24.3989% | **FAIL** |
| wageConsumption | 970.8741B | 967.5586B | 0.3415% | WARN |
| assetConsumption | 3.2548T | 3.2041T | 1.5596% | **FAIL** |
| transferConsumption | 10.9427T | 10.9259T | 0.1538% | WARN |
| corporateProfits | 4.1561T | 4.1413T | 0.3558% | WARN |
| aiCorporateProfits | 2.3124T | 2.3053T | 0.3064% | WARN |
| traditionalCorporateProfits | 1.8437T | 1.8360T | 0.4177% | WARN |
| aiGDPContribution | 9.2494T | 9.2211T | 0.3064% | WARN |
| totalDemandSpilloverLoss | 14.6327M | 14.6634M | 0.2097% | WARN |
| maxNeutralTransfers | 2.7285T | 3.9231T | 43.7847% | **FAIL** |

**Year 2046**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 73.8772M | 73.6328M | 0.3309% | WARN |
| totalUnemployment | 112.6145M | 112.8589M | 0.2171% | WARN |
| aggregateWageIncome | 1.8958T | 1.8780T | 0.9371% | WARN |
| aggregateAssetIncome | 12.9647T | 12.5843T | 2.9341% | **FAIL** |
| aggregateTransferIncome | 9.7384T | 9.7224T | 0.1640% | WARN |
| totalIncome | 24.5988T | 24.1847T | 1.6835% | **FAIL** |
| gdpNominal | 26.9682T | 26.8097T | 0.5877% | WARN |
| gdpReal | 43.7709T | 30.0264T | 31.4011% | **FAIL** |
| consumption | 9.9288T | 9.8253T | 1.0426% | **FAIL** |
| investment | 9.8074T | 9.7682T | 0.4001% | WARN |
| governmentSpending | 6.4164T | 6.3982T | 0.2830% | WARN |
| consumerWelfareIndex | 43.5855K | 29.7624K | 31.7149% | **FAIL** |
| unrealizedAIOutput | 4.6034T | 4.6461T | 0.9272% | WARN |
| aiGoodsAbsorbed | 4.0873T | 4.0448T | 1.0412% | **FAIL** |
| newJobEmployment | 259.9049K | 186.8140K | 28.1221% | **FAIL** |
| newJobWageIncome | 6.1241B | 4.3757B | 28.5500% | **FAIL** |
| potentialGDP | 52.4616T | 35.5006T | 32.3304% | **FAIL** |
| wageConsumption | 985.9471B | 975.4768B | 1.0620% | **FAIL** |
| assetConsumption | 3.5495T | 3.4164T | 3.7509% | **FAIL** |
| transferConsumption | 11.3055T | 11.2911T | 0.1271% | WARN |
| corporateProfits | 4.3499T | 4.3265T | 0.5375% | WARN |
| aiCorporateProfits | 2.4703T | 2.4597T | 0.4298% | WARN |
| traditionalCorporateProfits | 1.8796T | 1.8668T | 0.6790% | WARN |
| aiGDPContribution | 9.8811T | 9.8386T | 0.4298% | WARN |
| totalDemandSpilloverLoss | 11.7079M | 11.8743M | 1.4207% | **FAIL** |
| maxNeutralTransfers | 3.4526T | 4.7374T | 37.2114% | **FAIL** |

**Year 2047**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 73.1300M | 72.7769M | 0.4828% | WARN |
| totalUnemployment | 114.1077M | 114.4607M | 0.3094% | WARN |
| aggregateWageIncome | 1.9261T | 1.8992T | 1.3983% | **FAIL** |
| aggregateAssetIncome | 14.0403T | 13.4867T | 3.9428% | **FAIL** |
| aggregateTransferIncome | 9.7671T | 9.7532T | 0.1422% | WARN |
| totalIncome | 25.7334T | 25.1390T | 2.3098% | **FAIL** |
| gdpNominal | 27.6722T | 27.5068T | 0.5978% | WARN |
| gdpReal | 51.6552T | 33.8743T | 34.4224% | **FAIL** |
| consumption | 10.3188T | 10.2149T | 1.0075% | **FAIL** |
| investment | 10.0643T | 10.0191T | 0.4486% | WARN |
| governmentSpending | 6.4492T | 6.4290T | 0.3135% | WARN |
| consumerWelfareIndex | 51.8896K | 33.8877K | 34.6927% | **FAIL** |
| unrealizedAIOutput | 4.5888T | 4.6331T | 0.9661% | WARN |
| aiGoodsAbsorbed | 4.3874T | 4.3434T | 1.0049% | **FAIL** |
| newJobEmployment | 289.3086K | 198.4056K | 31.4208% | **FAIL** |
| newJobWageIncome | 6.9578B | 4.7287B | 32.0375% | **FAIL** |
| potentialGDP | 60.6314T | 36.4832T | 39.8278% | **FAIL** |
| wageConsumption | 996.3460B | 980.6236B | 1.5780% | **FAIL** |
| assetConsumption | 3.7777T | 3.5840T | 5.1287% | **FAIL** |
| transferConsumption | 11.7124T | 11.6999T | 0.1067% | WARN |
| corporateProfits | 4.4960T | 4.4716T | 0.5415% | WARN |
| aiCorporateProfits | 2.5929T | 2.5819T | 0.4235% | WARN |
| traditionalCorporateProfits | 1.9031T | 1.8897T | 0.7023% | WARN |
| aiGDPContribution | 10.3716T | 10.3276T | 0.4235% | WARN |
| totalDemandSpilloverLoss | 9.5819M | 9.8294M | 2.5830% | **FAIL** |
| maxNeutralTransfers | 4.2829T | 5.6189T | 31.1921% | **FAIL** |

**Year 2048**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 72.5376M | 72.1576M | 0.5239% | WARN |
| totalUnemployment | 115.4490M | 115.8290M | 0.3292% | WARN |
| aggregateWageIncome | 1.9435T | 1.9151T | 1.4637% | **FAIL** |
| aggregateAssetIncome | 15.0638T | 14.3573T | 4.6898% | **FAIL** |
| aggregateTransferIncome | 9.7928T | 9.7795T | 0.1365% | WARN |
| totalIncome | 26.8002T | 26.0519T | 2.7921% | **FAIL** |
| gdpNominal | 28.3054T | 28.1584T | 0.5193% | WARN |
| gdpReal | 61.0894T | 38.3223T | 37.2686% | **FAIL** |
| consumption | 10.7261T | 10.6296T | 0.8995% | WARN |
| investment | 10.2478T | 10.2136T | 0.3335% | WARN |
| governmentSpending | 6.4733T | 6.4528T | 0.3160% | WARN |
| consumerWelfareIndex | 62.1129K | 38.8154K | 37.5084% | **FAIL** |
| unrealizedAIOutput | 4.5205T | 4.5628T | 0.9353% | WARN |
| aiGoodsAbsorbed | 4.6689T | 4.6272T | 0.8935% | WARN |
| newJobEmployment | 324.7132K | 212.8487K | 34.4502% | **FAIL** |
| newJobWageIncome | 7.8985B | 5.1292B | 35.0614% | **FAIL** |
| potentialGDP | 70.2788T | 37.3484T | 46.8568% | **FAIL** |
| wageConsumption | 1.0008T | 984.2065B | 1.6571% | **FAIL** |
| assetConsumption | 3.9655T | 3.7183T | 6.2353% | **FAIL** |
| transferConsumption | 12.1739T | 12.1619T | 0.0988% | WARN |
| corporateProfits | 4.6249T | 4.6030T | 0.4748% | WARN |
| aiCorporateProfits | 2.6988T | 2.6885T | 0.3829% | WARN |
| traditionalCorporateProfits | 1.9261T | 1.9145T | 0.6034% | WARN |
| aiGDPContribution | 10.7951T | 10.7538T | 0.3829% | WARN |
| totalDemandSpilloverLoss | 8.0137M | 8.2609M | 3.0841% | **FAIL** |
| maxNeutralTransfers | 5.2633T | 6.6059T | 25.5077% | **FAIL** |

**Year 2049**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 72.5156M | 72.1555M | 0.4965% | WARN |
| totalUnemployment | 116.2230M | 116.5830M | 0.3098% | WARN |
| aggregateWageIncome | 1.9800T | 1.9536T | 1.3348% | **FAIL** |
| aggregateAssetIncome | 16.0925T | 15.2483T | 5.2457% | **FAIL** |
| aggregateTransferIncome | 9.8077T | 9.7939T | 0.1402% | WARN |
| totalIncome | 27.8802T | 26.9959T | 3.1719% | **FAIL** |
| gdpNominal | 28.9680T | 28.8422T | 0.4342% | WARN |
| gdpReal | 72.5252T | 43.5158T | 39.9991% | **FAIL** |
| consumption | 11.1750T | 11.0905T | 0.7559% | WARN |
| investment | 10.4297T | 10.4047T | 0.2403% | WARN |
| governmentSpending | 6.4950T | 6.4751T | 0.3052% | WARN |
| consumerWelfareIndex | 74.7702K | 44.7179K | 40.1929% | **FAIL** |
| unrealizedAIOutput | 4.3967T | 4.4341T | 0.8501% | WARN |
| aiGoodsAbsorbed | 4.9449T | 4.9075T | 0.7559% | WARN |
| newJobEmployment | 371.7660K | 233.2140K | 37.2686% | **FAIL** |
| newJobWageIncome | 9.1701B | 5.7046B | 37.7912% | **FAIL** |
| potentialGDP | 81.8669T | 38.1838T | 53.3586% | **FAIL** |
| wageConsumption | 1.0180T | 1.0025T | 1.5179% | **FAIL** |
| assetConsumption | 4.1295T | 3.8341T | 7.1547% | **FAIL** |
| transferConsumption | 12.6913T | 12.6789T | 0.0975% | WARN |
| corporateProfits | 4.7506T | 4.7316T | 0.4014% | WARN |
| aiCorporateProfits | 2.7932T | 2.7838T | 0.3346% | WARN |
| traditionalCorporateProfits | 1.9575T | 1.9478T | 0.4968% | WARN |
| aiGDPContribution | 11.1727T | 11.1353T | 0.3346% | WARN |
| totalDemandSpilloverLoss | 6.8096M | 7.0310M | 3.2526% | **FAIL** |
| maxNeutralTransfers | 6.3969T | 7.6764T | 20.0018% | **FAIL** |

**Year 2050**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 72.9012M | 72.5853M | 0.4333% | WARN |
| totalUnemployment | 116.5923M | 116.9082M | 0.2709% | WARN |
| aggregateWageIncome | 2.0348T | 2.0118T | 1.1337% | **FAIL** |
| aggregateAssetIncome | 17.1832T | 16.2142T | 5.6392% | **FAIL** |
| aggregateTransferIncome | 9.8148T | 9.8002T | 0.1487% | WARN |
| totalIncome | 29.0328T | 28.0261T | 3.4673% | **FAIL** |
| gdpNominal | 29.6862T | 29.5793T | 0.3600% | WARN |
| gdpReal | 86.3774T | 49.5619T | 42.6217% | **FAIL** |
| consumption | 11.6795T | 11.6089T | 0.6045% | WARN |
| investment | 10.6189T | 10.5987T | 0.1905% | WARN |
| governmentSpending | 6.5177T | 6.4986T | 0.2930% | WARN |
| consumerWelfareIndex | 90.4585K | 51.7761K | 42.7625% | **FAIL** |
| unrealizedAIOutput | 4.2215T | 4.2531T | 0.7486% | WARN |
| aiGoodsAbsorbed | 5.2276T | 5.1960T | 0.6045% | WARN |
| newJobEmployment | 433.3264K | 259.9999K | 39.9991% | **FAIL** |
| newJobWageIncome | 10.8913B | 6.4885B | 40.4246% | **FAIL** |
| potentialGDP | 95.8265T | 39.0283T | 59.2719% | **FAIL** |
| wageConsumption | 1.0466T | 1.0331T | 1.2939% | **FAIL** |
| assetConsumption | 4.2859T | 3.9467T | 7.9131% | **FAIL** |
| transferConsumption | 13.2774T | 13.2642T | 0.0990% | WARN |
| corporateProfits | 4.8792T | 4.8631T | 0.3316% | WARN |
| aiCorporateProfits | 2.8817T | 2.8738T | 0.2742% | WARN |
| traditionalCorporateProfits | 1.9975T | 1.9892T | 0.4145% | WARN |
| aiGDPContribution | 11.5269T | 11.4953T | 0.2742% | WARN |
| totalDemandSpilloverLoss | 5.9098M | 6.0524M | 2.4121% | **FAIL** |
| maxNeutralTransfers | 7.7160T | 8.8546T | 14.7566% | **FAIL** |

### min_wage_only

**Year 2026**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 32.1442T | 32.9900T | 2.6313% | **FAIL** |

**Year 2027**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 33.1365T | 34.9033T | 5.3318% | **FAIL** |

**Year 2028**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| gdpReal | 33.3396T | 34.0585T | 2.1563% | **FAIL** |
| consumerWelfareIndex | 66.6006K | 68.0367K | 2.1563% | WARN |
| potentialGDP | 33.3396T | 36.8183T | 10.4343% | **FAIL** |

**Year 2029**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 6.9173M | 6.9011M | 0.2338% | WARN |
| gdpReal | 33.4658T | 34.9257T | 4.3624% | **FAIL** |
| consumerWelfareIndex | 66.6450K | 69.5533K | 4.3639% | WARN |
| newJobEmployment | 750.1402K | 766.3152K | 2.1563% | **FAIL** |
| newJobWageIncome | 72.1927B | 73.7494B | 2.1563% | **FAIL** |
| potentialGDP | 33.4658T | 38.7493T | 15.7878% | **FAIL** |

**Year 2030**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 168.0073M | 168.0401M | 0.0196% | WARN |
| totalUnemployment | 6.9452M | 6.9123M | 0.4730% | WARN |
| aggregateWageIncome | 23.3780T | 23.3821T | 0.0174% | WARN |
| totalIncome | 38.6331T | 38.6374T | 0.0112% | WARN |
| gdpReal | 33.5408T | 35.7609T | 6.6193% | **FAIL** |
| consumption | 28.0300T | 28.0333T | 0.0119% | WARN |
| consumerWelfareIndex | 66.5704K | 70.9787K | 6.6220% | WARN |
| newJobEmployment | 752.9794K | 785.8272K | 4.3624% | **FAIL** |
| newJobWageIncome | 75.9602B | 79.2764B | 4.3657% | **FAIL** |
| potentialGDP | 33.5408T | 40.7199T | 21.4044% | **FAIL** |
| wageConsumption | 18.7024T | 18.7057T | 0.0174% | WARN |

**Year 2031**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 168.6780M | 168.7280M | 0.0296% | WARN |
| totalUnemployment | 6.9743M | 6.9243M | 0.7163% | WARN |
| aggregateWageIncome | 24.5653T | 24.5729T | 0.0309% | WARN |
| totalIncome | 40.5783T | 40.5866T | 0.0206% | WARN |
| gdpNominal | 42.7436T | 42.7512T | 0.0177% | WARN |
| gdpReal | 33.5840T | 36.5822T | 8.9274% | **FAIL** |
| consumption | 29.4375T | 29.4439T | 0.0216% | WARN |
| investment | 7.4812T | 7.4824T | 0.0160% | WARN |
| consumerWelfareIndex | 66.4174K | 72.3495K | 8.9315% | WARN |
| newJobEmployment | 754.6670K | 804.6206K | 6.6193% | **FAIL** |
| newJobWageIncome | 79.6785B | 84.9607B | 6.6293% | **FAIL** |
| potentialGDP | 33.5840T | 42.7512T | 27.2961% | **FAIL** |
| wageConsumption | 19.6522T | 19.6583T | 0.0309% | WARN |
| corporateProfits | 4.7018T | 4.7026T | 0.0177% | WARN |
| traditionalCorporateProfits | 4.7018T | 4.7026T | 0.0177% | WARN |

**Year 2032**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 169.3478M | 169.4151M | 0.0398% | WARN |
| totalUnemployment | 7.0071M | 6.9397M | 0.9611% | WARN |
| aggregateWageIncome | 25.7878T | 25.7998T | 0.0465% | WARN |
| aggregateAssetIncome | 8.8583T | 8.8599T | 0.0179% | WARN |
| totalIncome | 42.5873T | 42.6009T | 0.0318% | WARN |
| gdpNominal | 44.8451T | 44.8574T | 0.0274% | WARN |
| gdpReal | 33.6107T | 37.4046T | 11.2875% | **FAIL** |
| consumption | 30.8922T | 30.9023T | 0.0328% | WARN |
| investment | 7.8459T | 7.8480T | 0.0267% | WARN |
| consumerWelfareIndex | 66.2211K | 73.6998K | 11.2935% | WARN |
| aiAdditionalOutput | 320.5461M | 332.7445M | 3.8055% | **FAIL** |
| aiInvestmentBoost | 96.1638M | 99.8233M | 3.8055% | **FAIL** |
| aiNetExportBoost | 32.0546M | 33.2744M | 3.8055% | **FAIL** |
| aiConsumerGoodsPotential | 192.3277M | 199.6467M | 3.8055% | **FAIL** |
| aiGoodsAbsorbed | 192.3277M | 199.6467M | 3.8055% | **FAIL** |
| newJobEmployment | 755.6211K | 823.0773K | 8.9272% | **FAIL** |
| newJobWageIncome | 83.4190B | 90.8822B | 8.9466% | **FAIL** |
| potentialGDP | 33.6109T | 44.8576T | 33.4614% | **FAIL** |
| wageConsumption | 20.6302T | 20.6398T | 0.0465% | WARN |
| assetConsumption | 3.1004T | 3.1010T | 0.0179% | WARN |
| corporateProfits | 4.9330T | 4.9344T | 0.0274% | WARN |
| aiCorporateProfits | 80.1365M | 83.1861M | 3.8055% | **FAIL** |
| traditionalCorporateProfits | 4.9329T | 4.9343T | 0.0273% | WARN |
| aiGDPContribution | 320.5461M | 332.7445M | 3.8055% | **FAIL** |
| maxNeutralTransfers | 2.6210B | 2.2165B | 15.4330% | **FAIL** |

**Year 2033**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 169.9558M | 170.0386M | 0.0487% | WARN |
| totalUnemployment | 7.1044M | 7.0217M | 1.1643% | **FAIL** |
| aggregateWageIncome | 27.0472T | 27.0641T | 0.0626% | WARN |
| aggregateAssetIncome | 9.3014T | 9.3042T | 0.0305% | WARN |
| totalIncome | 44.6663T | 44.6857T | 0.0435% | WARN |
| gdpNominal | 47.0213T | 47.0385T | 0.0367% | WARN |
| gdpReal | 33.6468T | 38.2582T | 13.7053% | **FAIL** |
| consumption | 32.3936T | 32.4077T | 0.0436% | WARN |
| investment | 8.2299T | 8.2331T | 0.0393% | WARN |
| consumerWelfareIndex | 66.0327K | 75.0879K | 13.7131% | WARN |
| aiAdditionalOutput | 5.5878B | 5.7949B | 3.7064% | **FAIL** |
| aiInvestmentBoost | 1.6763B | 1.7385B | 3.7064% | **FAIL** |
| aiNetExportBoost | 558.7826M | 579.4932M | 3.7064% | **FAIL** |
| aiConsumerGoodsPotential | 3.3527B | 3.4770B | 3.7064% | **FAIL** |
| aiGoodsAbsorbed | 3.3527B | 3.4770B | 3.7064% | **FAIL** |
| newJobEmployment | 755.7612K | 841.0482K | 11.2849% | **FAIL** |
| newJobWageIncome | 87.2056B | 97.0740B | 11.3162% | **FAIL** |
| potentialGDP | 33.6501T | 47.0420T | 39.7975% | **FAIL** |
| wageConsumption | 21.6377T | 21.6513T | 0.0626% | WARN |
| assetConsumption | 3.2555T | 3.2565T | 0.0305% | WARN |
| corporateProfits | 5.1731T | 5.1751T | 0.0372% | WARN |
| aiCorporateProfits | 1.3970B | 1.4487B | 3.7064% | **FAIL** |
| traditionalCorporateProfits | 5.1717T | 5.1736T | 0.0362% | WARN |
| aiGDPContribution | 5.5878B | 5.7949B | 3.7064% | **FAIL** |
| maxNeutralTransfers | 24.9839B | 20.5692B | 17.6702% | **FAIL** |

**Year 2034**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 170.2680M | 170.3569M | 0.0522% | WARN |
| totalUnemployment | 7.5005M | 7.4116M | 1.1847% | **FAIL** |
| aggregateWageIncome | 28.3162T | 28.3375T | 0.0752% | WARN |
| aggregateAssetIncome | 9.7958T | 9.8011T | 0.0541% | WARN |
| totalIncome | 46.8073T | 46.8331T | 0.0551% | WARN |
| gdpNominal | 49.2575T | 49.2791T | 0.0438% | WARN |
| gdpReal | 33.7162T | 39.1720T | 16.1813% | **FAIL** |
| consumption | 33.9217T | 33.9388T | 0.0505% | WARN |
| investment | 8.6432T | 8.6480T | 0.0550% | WARN |
| consumerWelfareIndex | 65.8813K | 76.5468K | 16.1890% | **FAIL** |
| aiAdditionalOutput | 34.8261B | 35.8252B | 2.8688% | **FAIL** |
| aiInvestmentBoost | 10.4478B | 10.7476B | 2.8688% | **FAIL** |
| aiNetExportBoost | 3.4826B | 3.5825B | 2.8688% | **FAIL** |
| aiConsumerGoodsPotential | 20.8957B | 21.4951B | 2.8688% | **FAIL** |
| aiGoodsAbsorbed | 20.8957B | 21.4951B | 2.8688% | **FAIL** |
| newJobEmployment | 754.0648K | 857.2988K | 13.6903% | **FAIL** |
| newJobWageIncome | 90.9686B | 103.4650B | 13.7370% | **FAIL** |
| potentialGDP | 33.7371T | 49.3005T | 46.1314% | **FAIL** |
| wageConsumption | 22.6530T | 22.6700T | 0.0752% | WARN |
| assetConsumption | 3.4285T | 3.4304T | 0.0541% | WARN |
| corporateProfits | 5.4232T | 5.4257T | 0.0463% | WARN |
| aiCorporateProfits | 8.7065B | 8.9563B | 2.8688% | **FAIL** |
| traditionalCorporateProfits | 5.4145T | 5.4168T | 0.0418% | WARN |
| aiGDPContribution | 34.8261B | 35.8252B | 2.8688% | **FAIL** |
| maxNeutralTransfers | 73.3805B | 57.8166B | 21.2099% | **FAIL** |

**Year 2035**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 169.9999M | 170.0905M | 0.0533% | WARN |
| totalUnemployment | 8.4797M | 8.3891M | 1.0684% | **FAIL** |
| aggregateWageIncome | 29.2804T | 29.3416T | 0.2087% | WARN |
| aggregateAssetIncome | 10.3781T | 10.3864T | 0.0803% | WARN |
| aggregateTransferIncome | 9.0721T | 9.0675T | 0.0500% | WARN |
| totalIncome | 48.7306T | 48.7955T | 0.1332% | WARN |
| gdpNominal | 51.1511T | 51.2153T | 0.1255% | WARN |
| gdpReal | 33.6247T | 39.8879T | 18.6266% | **FAIL** |
| consumption | 35.0710T | 35.1304T | 0.1695% | WARN |
| investment | 9.0999T | 9.1062T | 0.0692% | WARN |
| governmentSpending | 8.1664T | 8.1652T | 0.0155% | WARN |
| consumerWelfareIndex | 65.1532K | 77.3230K | 18.6787% | **FAIL** |
| aiAdditionalOutput | 121.0903B | 123.4104B | 1.9160% | **FAIL** |
| aiInvestmentBoost | 36.3271B | 37.0231B | 1.9160% | **FAIL** |
| aiNetExportBoost | 12.1090B | 12.3410B | 1.9160% | **FAIL** |
| aiConsumerGoodsPotential | 72.6542B | 74.0462B | 1.9160% | **FAIL** |
| aiGoodsAbsorbed | 72.6542B | 74.0462B | 1.9160% | **FAIL** |
| newJobEmployment | 749.1461K | 870.1249K | 16.1489% | **FAIL** |
| newJobWageIncome | 93.7391B | 109.0723B | 16.3573% | **FAIL** |
| potentialGDP | 33.6974T | 51.2893T | 52.2056% | **FAIL** |
| wageConsumption | 23.3730T | 23.4292T | 0.2406% | WARN |
| assetConsumption | 3.6323T | 3.6352T | 0.0803% | WARN |
| transferConsumption | 8.1648T | 8.1608T | 0.0500% | WARN |
| corporateProfits | 5.6436T | 5.6510T | 0.1309% | WARN |
| aiCorporateProfits | 30.2726B | 30.8526B | 1.9160% | **FAIL** |
| traditionalCorporateProfits | 5.6133T | 5.6201T | 0.1213% | WARN |
| aiGDPContribution | 121.0903B | 123.4104B | 1.9160% | **FAIL** |
| maxNeutralTransfers | 134.5506B | 104.3892B | 22.4164% | **FAIL** |

**Year 2036**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 169.3031M | 169.4104M | 0.0634% | WARN |
| totalUnemployment | 9.8904M | 9.7831M | 1.0848% | **FAIL** |
| aggregateWageIncome | 29.6326T | 29.7268T | 0.3178% | WARN |
| aggregateAssetIncome | 10.9508T | 10.9686T | 0.1627% | WARN |
| aggregateTransferIncome | 9.4011T | 9.3834T | 0.1886% | WARN |
| totalIncome | 49.9845T | 50.0788T | 0.1886% | WARN |
| gdpNominal | 52.1646T | 52.2309T | 0.1272% | WARN |
| gdpReal | 33.1841T | 40.0366T | 20.6498% | **FAIL** |
| consumption | 35.4811T | 35.5359T | 0.1545% | WARN |
| investment | 9.4522T | 9.4740T | 0.2307% | WARN |
| governmentSpending | 8.4474T | 8.4384T | 0.1067% | WARN |
| consumerWelfareIndex | 63.5333K | 76.6737K | 20.6827% | **FAIL** |
| aiAdditionalOutput | 283.1469B | 286.2448B | 1.0941% | **FAIL** |
| aiInvestmentBoost | 84.9441B | 85.8735B | 1.0941% | **FAIL** |
| aiNetExportBoost | 28.3147B | 28.6245B | 1.0941% | **FAIL** |
| aiConsumerGoodsPotential | 169.8882B | 171.7469B | 1.0941% | **FAIL** |
| aiGoodsAbsorbed | 169.8882B | 171.7469B | 1.0941% | **FAIL** |
| newJobEmployment | 737.8354K | 875.0278K | 18.5939% | **FAIL** |
| newJobWageIncome | 94.0667B | 111.8733B | 18.9297% | **FAIL** |
| potentialGDP | 33.3540T | 52.4027T | 57.1105% | **FAIL** |
| wageConsumption | 23.5402T | 23.6240T | 0.3556% | WARN |
| assetConsumption | 3.8328T | 3.8390T | 0.1627% | WARN |
| transferConsumption | 8.4610T | 8.4451T | 0.1886% | WARN |
| corporateProfits | 5.7777T | 5.7855T | 0.1338% | WARN |
| aiCorporateProfits | 70.7867B | 71.5612B | 1.0941% | **FAIL** |
| traditionalCorporateProfits | 5.7070T | 5.7139T | 0.1219% | WARN |
| aiGDPContribution | 283.1469B | 286.2448B | 1.0941% | **FAIL** |
| maxNeutralTransfers | 238.7636B | 191.8441B | 19.6510% | **FAIL** |

**Year 2037**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 167.8892M | 168.0086M | 0.0712% | WARN |
| totalUnemployment | 12.0211M | 11.9017M | 0.9938% | WARN |
| aggregateWageIncome | 29.0460T | 29.1438T | 0.3368% | WARN |
| aggregateAssetIncome | 11.4339T | 11.4531T | 0.1687% | WARN |
| aggregateTransferIncome | 9.6555T | 9.6125T | 0.4457% | WARN |
| totalIncome | 50.1354T | 50.2095T | 0.1478% | WARN |
| gdpNominal | 51.9014T | 51.8943T | 0.0136% | WARN |
| gdpReal | 32.2801T | 39.3647T | 21.9472% | **FAIL** |
| consumption | 34.8665T | 34.8732T | 0.0194% | WARN |
| investment | 9.6100T | 9.6243T | 0.1484% | WARN |
| governmentSpending | 8.6349T | 8.6080T | 0.3113% | WARN |
| consumerWelfareIndex | 60.7968K | 74.1644K | 21.9874% | **FAIL** |
| aiAdditionalOutput | 590.4142B | 594.6146B | 0.7114% | WARN |
| aiInvestmentBoost | 177.1243B | 178.3844B | 0.7114% | WARN |
| aiNetExportBoost | 59.0414B | 59.4615B | 0.7114% | WARN |
| aiConsumerGoodsPotential | 354.2485B | 356.7687B | 0.7114% | WARN |
| aiGoodsAbsorbed | 354.2485B | 356.7687B | 0.7114% | WARN |
| newJobEmployment | 714.4188K | 861.7219K | 20.6186% | **FAIL** |
| newJobWageIncome | 90.4475B | 109.4230B | 20.9796% | **FAIL** |
| potentialGDP | 32.6344T | 52.2511T | 60.1107% | **FAIL** |
| wageConsumption | 22.9054T | 22.9923T | 0.3790% | WARN |
| assetConsumption | 4.0018T | 4.0086T | 0.1687% | WARN |
| transferConsumption | 8.6900T | 8.6513T | 0.4457% | WARN |
| aiCorporateProfits | 147.6035B | 148.6536B | 0.7114% | WARN |
| traditionalCorporateProfits | 5.6442T | 5.6430T | 0.0219% | WARN |
| aiGDPContribution | 590.4142B | 594.6146B | 0.7114% | WARN |
| maxNeutralTransfers | 360.3744B | 306.6753B | 14.9009% | **FAIL** |

**Year 2038**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 165.5731M | 165.6857M | 0.0680% | WARN |
| totalUnemployment | 15.0569M | 14.9443M | 0.7477% | WARN |
| aggregateWageIncome | 27.2972T | 27.3467T | 0.1815% | WARN |
| aggregateAssetIncome | 11.7481T | 11.7551T | 0.0595% | WARN |
| aggregateTransferIncome | 9.7890T | 9.7027T | 0.8815% | WARN |
| totalIncome | 48.8343T | 48.8046T | 0.0609% | WARN |
| gdpNominal | 50.0698T | 49.8821T | 0.3748% | WARN |
| gdpReal | 30.8981T | 37.7829T | 22.2821% | **FAIL** |
| consumption | 32.9886T | 32.8731T | 0.3500% | WARN |
| investment | 9.5543T | 9.5418T | 0.1308% | WARN |
| governmentSpending | 8.6797T | 8.6193T | 0.6965% | WARN |
| consumerWelfareIndex | 56.8464K | 69.5303K | 22.3126% | **FAIL** |
| aiAdditionalOutput | 1.0986T | 1.1041T | 0.5018% | WARN |
| aiInvestmentBoost | 329.5873B | 331.2410B | 0.5018% | WARN |
| aiNetExportBoost | 109.8624B | 110.4137B | 0.5018% | WARN |
| aiConsumerGoodsPotential | 659.1746B | 662.4821B | 0.5018% | WARN |
| aiGoodsAbsorbed | 659.1746B | 662.4821B | 0.5018% | WARN |
| newJobEmployment | 676.0942K | 824.2018K | 21.9064% | **FAIL** |
| newJobWageIncome | 82.1605B | 100.3081B | 22.0880% | **FAIL** |
| potentialGDP | 31.5573T | 50.5446T | 60.1677% | **FAIL** |
| wageConsumption | 21.3006T | 21.3478T | 0.2215% | WARN |
| assetConsumption | 4.1118T | 4.1143T | 0.0595% | WARN |
| transferConsumption | 8.8101T | 8.7325T | 0.8815% | WARN |
| corporateProfits | 5.6615T | 5.6416T | 0.3510% | WARN |
| aiCorporateProfits | 274.6561B | 276.0342B | 0.5018% | WARN |
| traditionalCorporateProfits | 5.3868T | 5.3656T | 0.3945% | WARN |
| aiGDPContribution | 1.0986T | 1.1041T | 0.5018% | WARN |
| maxNeutralTransfers | 542.4563B | 518.6910B | 4.3811% | **FAIL** |

**Year 2039**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 159.9870M | 160.1098M | 0.0767% | WARN |
| totalUnemployment | 21.3654M | 21.2427M | 0.5746% | WARN |
| aggregateWageIncome | 23.3158T | 23.2788T | 0.1588% | WARN |
| aggregateAssetIncome | 12.0312T | 11.9918T | 0.3273% | WARN |
| aggregateTransferIncome | 9.9102T | 9.8237T | 0.8727% | WARN |
| totalIncome | 45.2572T | 45.0943T | 0.3599% | WARN |
| gdpNominal | 44.1419T | 43.4372T | 1.5966% | **FAIL** |
| gdpReal | 27.6053T | 33.1832T | 20.2059% | **FAIL** |
| consumption | 27.1170T | 26.5399T | 2.1282% | **FAIL** |
| investment | 9.4105T | 9.3447T | 0.6994% | WARN |
| governmentSpending | 8.6170T | 8.5504T | 0.7733% | WARN |
| consumerWelfareIndex | 47.1662K | 56.3903K | 19.5566% | WARN |
| aiAdditionalOutput | 2.1558T | 2.1579T | 0.0946% | WARN |
| aiInvestmentBoost | 646.7474B | 647.3590B | 0.0946% | WARN |
| aiNetExportBoost | 215.5825B | 215.7863B | 0.0946% | WARN |
| aiConsumerGoodsPotential | 1.2935T | 1.2947T | 0.0946% | WARN |
| aiGoodsAbsorbed | 1.2935T | 1.2947T | 0.0946% | WARN |
| newJobEmployment | 609.9743K | 745.7940K | 22.2665% | **FAIL** |
| newJobWageIncome | 66.7173B | 81.4018B | 22.0100% | **FAIL** |
| potentialGDP | 28.8988T | 44.7319T | 54.7881% | **FAIL** |
| wageConsumption | 17.7922T | 17.7718T | 0.1145% | WARN |
| assetConsumption | 4.2109T | 4.1971T | 0.3273% | WARN |
| transferConsumption | 8.9191T | 8.8413T | 0.8727% | WARN |
| corporateProfits | 5.1574T | 5.0802T | 1.4977% | **FAIL** |
| aiCorporateProfits | 538.9562B | 539.4659B | 0.0946% | WARN |
| traditionalCorporateProfits | 4.6185T | 4.5407T | 1.6835% | **FAIL** |
| aiGDPContribution | 2.1558T | 2.1579T | 0.0946% | WARN |
| maxNeutralTransfers | 681.8746B | 895.1505B | 31.2779% | **FAIL** |

**Year 2040**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 150.2226M | 150.2481M | 0.0170% | WARN |
| totalUnemployment | 31.8553M | 31.8297M | 0.0803% | WARN |
| aggregateWageIncome | 16.8055T | 16.5423T | 1.5663% | **FAIL** |
| aggregateAssetIncome | 11.2515T | 11.0717T | 1.5982% | **FAIL** |
| aggregateTransferIncome | 10.1116T | 10.0269T | 0.8369% | WARN |
| totalIncome | 38.1686T | 37.6409T | 1.3825% | **FAIL** |
| gdpNominal | 37.3111T | 36.4761T | 2.2380% | **FAIL** |
| gdpReal | 23.9446T | 28.4040T | 18.6237% | **FAIL** |
| consumption | 21.1970T | 20.6321T | 2.6652% | **FAIL** |
| investment | 8.3788T | 8.1747T | 2.4356% | **FAIL** |
| governmentSpending | 8.4140T | 8.3297T | 1.0024% | **FAIL** |
| consumerWelfareIndex | 37.6842K | 44.5071K | 18.1054% | WARN |
| aiAdditionalOutput | 3.9523T | 3.9641T | 0.2976% | WARN |
| aiInvestmentBoost | 1.1857T | 1.1892T | 0.2976% | WARN |
| aiNetExportBoost | 395.2337B | 396.4099B | 0.2976% | WARN |
| aiConsumerGoodsPotential | 2.3714T | 2.3785T | 0.2976% | WARN |
| unrealizedAIOutput | 0.000000 | 53.9779B | 100.0000% | **FAIL** |
| aiGoodsAbsorbed | 2.3714T | 2.3245T | 1.9786% | **FAIL** |
| newJobEmployment | 491.3822K | 590.2197K | 20.1142% | **FAIL** |
| newJobWageIncome | 42.4677B | 50.2215B | 18.2580% | **FAIL** |
| potentialGDP | 26.3160T | 38.8545T | 47.6459% | **FAIL** |
| wageConsumption | 12.3440T | 12.1519T | 1.5569% | **FAIL** |
| assetConsumption | 3.9380T | 3.8751T | 1.5982% | **FAIL** |
| transferConsumption | 9.1004T | 9.0242T | 0.8369% | WARN |
| corporateProfits | 4.6575T | 4.5598T | 2.0990% | **FAIL** |
| aiCorporateProfits | 988.0843B | 977.5302B | 1.0681% | **FAIL** |
| traditionalCorporateProfits | 3.6695T | 3.5823T | 2.3766% | **FAIL** |
| aiGDPContribution | 3.9523T | 3.9101T | 1.0681% | **FAIL** |
| maxNeutralTransfers | 768.9302B | 1.6470T | 114.1915% | **FAIL** |

**Year 2041**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 132.9871M | 132.6605M | 0.2456% | WARN |
| totalUnemployment | 49.8191M | 50.1457M | 0.6555% | WARN |
| aggregateWageIncome | 10.1004T | 9.8104T | 2.8718% | **FAIL** |
| aggregateAssetIncome | 10.2044T | 10.0180T | 1.8275% | **FAIL** |
| aggregateTransferIncome | 10.4565T | 10.3786T | 0.7446% | WARN |
| totalIncome | 30.7613T | 30.2069T | 1.8023% | **FAIL** |
| gdpNominal | 32.4700T | 32.0034T | 1.4371% | **FAIL** |
| gdpReal | 21.4914T | 25.6717T | 19.4512% | **FAIL** |
| consumption | 16.2459T | 15.9553T | 1.7890% | **FAIL** |
| investment | 8.2438T | 8.1298T | 1.3825% | **FAIL** |
| governmentSpending | 8.1801T | 8.0913T | 1.0856% | **FAIL** |
| consumerWelfareIndex | 29.6694K | 35.3139K | 19.0247% | WARN |
| aiAdditionalOutput | 7.0791T | 7.1439T | 0.9148% | WARN |
| aiInvestmentBoost | 2.1237T | 2.1432T | 0.9148% | WARN |
| aiNetExportBoost | 707.9091B | 714.3851B | 0.9148% | WARN |
| aiConsumerGoodsPotential | 4.2475T | 4.2863T | 0.9148% | WARN |
| unrealizedAIOutput | 978.8591B | 1.0468T | 6.9431% | **FAIL** |
| aiGoodsAbsorbed | 3.2686T | 3.2395T | 0.8905% | WARN |
| newJobEmployment | 350.3948K | 413.7360K | 18.0771% | **FAIL** |
| newJobWageIncome | 21.4461B | 24.6832B | 15.0942% | **FAIL** |
| potentialGDP | 25.7388T | 36.2897T | 40.9919% | **FAIL** |
| wageConsumption | 6.9262T | 6.7186T | 2.9984% | **FAIL** |
| assetConsumption | 3.5716T | 3.5063T | 1.8275% | **FAIL** |
| transferConsumption | 9.4108T | 9.3407T | 0.7446% | WARN |
| corporateProfits | 4.4257T | 4.3740T | 1.1699% | **FAIL** |
| aiCorporateProfits | 1.5251T | 1.5243T | 0.0525% | WARN |
| traditionalCorporateProfits | 2.9007T | 2.8497T | 1.7574% | **FAIL** |
| aiGDPContribution | 6.1002T | 6.0970T | 0.0525% | WARN |
| maxNeutralTransfers | 846.3180B | 2.0243T | 139.1885% | **FAIL** |

**Year 2042**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 117.3188M | 116.3615M | 0.8160% | WARN |
| totalUnemployment | 66.2186M | 67.1759M | 1.4457% | **FAIL** |
| aggregateWageIncome | 7.1153T | 6.9521T | 2.2930% | **FAIL** |
| aggregateAssetIncome | 9.1631T | 9.1501T | 0.1410% | WARN |
| aggregateTransferIncome | 10.7713T | 10.7056T | 0.6104% | WARN |
| totalIncome | 27.0497T | 26.8078T | 0.8940% | WARN |
| gdpNominal | 30.4658T | 30.2443T | 0.7270% | WARN |
| gdpReal | 20.8850T | 25.2406T | 20.8552% | **FAIL** |
| consumption | 13.9887T | 13.8630T | 0.8990% | WARN |
| investment | 8.3125T | 8.2816T | 0.3717% | WARN |
| governmentSpending | 8.0143T | 7.9381T | 0.9507% | WARN |
| consumerWelfareIndex | 26.3540K | 31.7951K | 20.6459% | WARN |
| unrealizedAIOutput | 1.9033T | 1.9369T | 1.7656% | **FAIL** |
| aiGoodsAbsorbed | 3.7382T | 3.7046T | 0.8990% | WARN |
| newJobEmployment | 263.9002K | 315.2320K | 19.4512% | **FAIL** |
| newJobWageIncome | 13.4369B | 15.8199B | 17.7346% | **FAIL** |
| potentialGDP | 26.5265T | 35.8859T | 35.2831% | **FAIL** |
| wageConsumption | 4.5652T | 4.4424T | 2.6902% | **FAIL** |
| assetConsumption | 3.2071T | 3.2025T | 0.1410% | WARN |
| transferConsumption | 9.6942T | 9.6350T | 0.6104% | WARN |
| corporateProfits | 4.4011T | 4.3721T | 0.6605% | WARN |
| aiCorporateProfits | 1.8748T | 1.8664T | 0.4481% | WARN |
| traditionalCorporateProfits | 2.5263T | 2.5057T | 0.8181% | WARN |
| aiGDPContribution | 7.4992T | 7.4656T | 0.4481% | WARN |
| totalDemandSpilloverLoss | 2.0607M | 3.0693M | 48.9459% | **FAIL** |
| maxNeutralTransfers | 965.4459B | 2.3336T | 141.7104% | **FAIL** |

**Year 2043**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 98.4960M | 98.1726M | 0.3284% | WARN |
| totalUnemployment | 85.7755M | 86.0990M | 0.3771% | WARN |
| aggregateWageIncome | 5.2872T | 5.2300T | 1.0814% | **FAIL** |
| aggregateAssetIncome | 9.2156T | 9.3757T | 1.7376% | **FAIL** |
| aggregateTransferIncome | 11.1468T | 11.0689T | 0.6991% | WARN |
| totalIncome | 25.6496T | 25.6746T | 0.0976% | WARN |
| gdpNominal | 30.1334T | 30.1035T | 0.0990% | WARN |
| gdpReal | 21.5570T | 26.5127T | 22.9890% | **FAIL** |
| consumption | 12.7519T | 12.7821T | 0.2365% | WARN |
| investment | 9.0455T | 9.0479T | 0.0268% | WARN |
| governmentSpending | 7.9457T | 7.8779T | 0.8532% | WARN |
| consumerWelfareIndex | 24.9707K | 30.8143K | 23.4020% | WARN |
| unrealizedAIOutput | 2.6880T | 2.6783T | 0.3608% | WARN |
| aiGoodsAbsorbed | 4.1005T | 4.1102T | 0.2365% | WARN |
| newJobEmployment | 207.0220K | 250.1969K | 20.8552% | **FAIL** |
| newJobWageIncome | 9.8509B | 11.8187B | 19.9766% | **FAIL** |
| potentialGDP | 28.3454T | 36.8920T | 30.1514% | **FAIL** |
| wageConsumption | 3.1155T | 3.0772T | 1.2288% | **FAIL** |
| assetConsumption | 3.2255T | 3.2815T | 1.7376% | **FAIL** |
| transferConsumption | 10.0321T | 9.9620T | 0.6991% | WARN |
| corporateProfits | 4.5223T | 4.5204T | 0.0425% | WARN |
| aiCorporateProfits | 2.1565T | 2.1589T | 0.1124% | WARN |
| traditionalCorporateProfits | 2.3658T | 2.3615T | 0.1837% | WARN |
| aiGDPContribution | 8.6261T | 8.6358T | 0.1124% | WARN |
| totalDemandSpilloverLoss | 6.1732M | 6.5398M | 5.9389% | **FAIL** |
| maxNeutralTransfers | 1.2045T | 2.9628T | 145.9779% | **FAIL** |

**Year 2044**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 89.0309M | 89.0861M | 0.0620% | WARN |
| totalUnemployment | 95.9777M | 95.9225M | 0.0575% | WARN |
| aggregateWageIncome | 4.6171T | 4.6155T | 0.0366% | WARN |
| aggregateAssetIncome | 9.8715T | 10.1958T | 3.2853% | **FAIL** |
| aggregateTransferIncome | 11.3427T | 11.2575T | 0.7511% | WARN |
| totalIncome | 25.8313T | 26.0688T | 0.9192% | WARN |
| gdpNominal | 30.4899T | 30.5656T | 0.2484% | WARN |
| gdpReal | 22.9643T | 28.8956T | 25.8284% | **FAIL** |
| consumption | 12.2768T | 12.3805T | 0.8445% | WARN |
| investment | 9.7420T | 9.7750T | 0.3388% | WARN |
| governmentSpending | 7.9343T | 7.8731T | 0.7717% | WARN |
| consumerWelfareIndex | 25.2095K | 31.9093K | 26.5766% | WARN |
| aiAdditionalOutput | 12.6987T | 12.6943T | 0.0342% | WARN |
| aiInvestmentBoost | 3.8096T | 3.8083T | 0.0342% | WARN |
| aiNetExportBoost | 1.2699T | 1.2694T | 0.0342% | WARN |
| aiConsumerGoodsPotential | 7.6192T | 7.6166T | 0.0342% | WARN |
| unrealizedAIOutput | 3.1884T | 3.1499T | 1.2075% | **FAIL** |
| aiGoodsAbsorbed | 4.4308T | 4.4667T | 0.8100% | WARN |
| newJobEmployment | 183.9713K | 226.3447K | 23.0326% | **FAIL** |
| newJobWageIncome | 8.6240B | 10.5998B | 22.9109% | **FAIL** |
| potentialGDP | 30.5835T | 38.1822T | 24.8459% | **FAIL** |
| wageConsumption | 2.5977T | 2.5974T | 0.0101% | WARN |
| assetConsumption | 3.4550T | 3.5685T | 3.2853% | **FAIL** |
| transferConsumption | 10.2084T | 10.1318T | 0.7511% | WARN |
| corporateProfits | 4.6853T | 4.6984T | 0.2799% | WARN |
| aiCorporateProfits | 2.3776T | 2.3861T | 0.3591% | WARN |
| traditionalCorporateProfits | 2.3078T | 2.3123T | 0.1983% | WARN |
| aiGDPContribution | 9.5103T | 9.5445T | 0.3591% | WARN |
| totalDemandSpilloverLoss | 6.6291M | 6.6374M | 0.1259% | WARN |
| maxNeutralTransfers | 1.5446T | 3.8839T | 151.4562% | **FAIL** |

**Year 2045**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 83.6257M | 83.8456M | 0.2629% | WARN |
| totalUnemployment | 102.1229M | 101.9031M | 0.2153% | WARN |
| aggregateWageIncome | 4.3191T | 4.3420T | 0.5299% | WARN |
| aggregateAssetIncome | 10.8190T | 11.2281T | 3.7817% | **FAIL** |
| aggregateTransferIncome | 11.4607T | 11.3723T | 0.7709% | WARN |
| totalIncome | 26.5988T | 26.9425T | 1.2921% | **FAIL** |
| gdpNominal | 31.1333T | 31.2554T | 0.3922% | WARN |
| gdpReal | 24.7879T | 32.0384T | 29.2503% | **FAIL** |
| consumption | 12.2609T | 12.4070T | 1.1908% | **FAIL** |
| investment | 10.2886T | 10.3248T | 0.3521% | WARN |
| governmentSpending | 7.9465T | 7.8889T | 0.7251% | WARN |
| consumerWelfareIndex | 26.5085K | 34.5349K | 30.2786% | WARN |
| aiAdditionalOutput | 13.7897T | 13.7829T | 0.0491% | WARN |
| aiInvestmentBoost | 4.1369T | 4.1349T | 0.0491% | WARN |
| aiNetExportBoost | 1.3790T | 1.3783T | 0.0491% | WARN |
| aiConsumerGoodsPotential | 8.2738T | 8.2697T | 0.0491% | WARN |
| unrealizedAIOutput | 3.4685T | 3.4096T | 1.6981% | **FAIL** |
| aiGoodsAbsorbed | 4.8053T | 4.8601T | 1.1412% | **FAIL** |
| newJobEmployment | 175.0017K | 220.2913K | 25.8795% | **FAIL** |
| newJobWageIncome | 8.2675B | 10.4330B | 26.1923% | **FAIL** |
| potentialGDP | 33.0617T | 39.5251T | 19.5495% | **FAIL** |
| wageConsumption | 2.3630T | 2.3781T | 0.6386% | WARN |
| assetConsumption | 3.7866T | 3.9298T | 3.7817% | **FAIL** |
| transferConsumption | 10.3146T | 10.2351T | 0.7709% | WARN |
| corporateProfits | 4.8696T | 4.8903T | 0.4257% | WARN |
| aiCorporateProfits | 2.5803T | 2.5933T | 0.5051% | WARN |
| traditionalCorporateProfits | 2.2893T | 2.2970T | 0.3362% | WARN |
| aiGDPContribution | 10.3211T | 10.3733T | 0.5051% | WARN |
| totalDemandSpilloverLoss | 5.8673M | 5.7153M | 2.5898% | **FAIL** |
| maxNeutralTransfers | 1.8309T | 4.7322T | 158.4542% | **FAIL** |

**Year 2046**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 80.7673M | 81.0238M | 0.3176% | WARN |
| totalUnemployment | 105.7244M | 105.4679M | 0.2426% | WARN |
| aggregateWageIncome | 4.2587T | 4.2896T | 0.7256% | WARN |
| aggregateAssetIncome | 11.6700T | 12.0025T | 2.8488% | **FAIL** |
| aggregateTransferIncome | 11.5299T | 11.4408T | 0.7724% | WARN |
| totalIncome | 27.4585T | 27.7329T | 0.9990% | WARN |
| gdpNominal | 31.7233T | 31.8692T | 0.4601% | WARN |
| gdpReal | 26.7668T | 35.6958T | 33.3587% | **FAIL** |
| consumption | 12.3795T | 12.5498T | 1.3759% | **FAIL** |
| investment | 10.6842T | 10.7188T | 0.3241% | WARN |
| governmentSpending | 7.9686T | 7.9125T | 0.7031% | WARN |
| consumerWelfareIndex | 28.2510K | 38.0186K | 34.5744% | WARN |
| unrealizedAIOutput | 3.5945T | 3.5244T | 1.9505% | **FAIL** |
| aiGoodsAbsorbed | 5.0962T | 5.1663T | 1.3761% | **FAIL** |
| newJobEmployment | 174.3689K | 225.3693K | 29.2486% | **FAIL** |
| newJobWageIncome | 8.3779B | 10.8708B | 29.7554% | **FAIL** |
| potentialGDP | 35.4575T | 40.5600T | 14.3904% | **FAIL** |
| wageConsumption | 2.2935T | 2.3131T | 0.8542% | WARN |
| assetConsumption | 4.0845T | 4.2009T | 2.8488% | **FAIL** |
| transferConsumption | 10.3769T | 10.2967T | 0.7724% | WARN |
| corporateProfits | 5.0142T | 5.0400T | 0.5160% | WARN |
| aiCorporateProfits | 2.7225T | 2.7400T | 0.6441% | WARN |
| traditionalCorporateProfits | 2.2917T | 2.3000T | 0.3639% | WARN |
| aiGDPContribution | 10.8900T | 10.9602T | 0.6441% | WARN |
| totalDemandSpilloverLoss | 4.7309M | 4.5247M | 4.3590% | **FAIL** |
| maxNeutralTransfers | 2.1114T | 5.6315T | 166.7212% | **FAIL** |

**Year 2047**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 78.8555M | 79.1351M | 0.3546% | WARN |
| totalUnemployment | 108.3822M | 108.1026M | 0.2580% | WARN |
| aggregateWageIncome | 4.2395T | 4.2748T | 0.8325% | WARN |
| aggregateAssetIncome | 12.1138T | 12.3972T | 2.3394% | **FAIL** |
| aggregateTransferIncome | 11.5809T | 11.4914T | 0.7728% | WARN |
| totalIncome | 27.9341T | 28.1633T | 0.8205% | WARN |
| gdpNominal | 32.0692T | 32.2532T | 0.5740% | WARN |
| gdpReal | 28.7270T | 39.7220T | 38.2741% | **FAIL** |
| consumption | 12.4296T | 12.6380T | 1.6773% | **FAIL** |
| investment | 10.9266T | 10.9609T | 0.3143% | WARN |
| governmentSpending | 7.9888T | 7.9335T | 0.6911% | WARN |
| consumerWelfareIndex | 29.9942K | 41.9292K | 39.7910% | **FAIL** |
| unrealizedAIOutput | 3.6913T | 3.6027T | 2.4003% | **FAIL** |
| aiGoodsAbsorbed | 5.2849T | 5.3736T | 1.6784% | **FAIL** |
| newJobEmployment | 176.9111K | 235.8990K | 33.3433% | **FAIL** |
| newJobWageIncome | 8.6267B | 11.5560B | 33.9567% | **FAIL** |
| potentialGDP | 37.7032T | 41.2296T | 9.3529% | **FAIL** |
| wageConsumption | 2.2578T | 2.2798T | 0.9739% | WARN |
| assetConsumption | 4.2398T | 4.3390T | 2.3394% | **FAIL** |
| transferConsumption | 10.4228T | 10.3422T | 0.7728% | WARN |
| corporateProfits | 5.1053T | 5.1380T | 0.6400% | WARN |
| aiCorporateProfits | 2.8173T | 2.8395T | 0.7877% | WARN |
| traditionalCorporateProfits | 2.2880T | 2.2985T | 0.4582% | WARN |
| aiGDPContribution | 11.2691T | 11.3578T | 0.7877% | WARN |
| totalDemandSpilloverLoss | 3.7421M | 3.5155M | 6.0533% | **FAIL** |
| maxNeutralTransfers | 2.3820T | 6.5880T | 176.5797% | **FAIL** |

**Year 2048**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 77.3055M | 77.6277M | 0.4169% | WARN |
| totalUnemployment | 110.6811M | 110.3589M | 0.2912% | WARN |
| aggregateWageIncome | 4.2056T | 4.2483T | 1.0159% | **FAIL** |
| aggregateAssetIncome | 12.4452T | 12.6732T | 1.8317% | **FAIL** |
| aggregateTransferIncome | 11.6250T | 11.5347T | 0.7769% | WARN |
| totalIncome | 28.2759T | 28.4562T | 0.6379% | WARN |
| gdpNominal | 32.2468T | 32.4776T | 0.7157% | WARN |
| gdpReal | 30.7145T | 44.2024T | 43.9135% | **FAIL** |
| consumption | 12.4526T | 12.6967T | 1.9605% | **FAIL** |
| investment | 11.0422T | 11.0872T | 0.4075% | WARN |
| governmentSpending | 8.0006T | 7.9467T | 0.6738% | WARN |
| consumerWelfareIndex | 31.8246K | 46.3659K | 45.6923% | **FAIL** |
| unrealizedAIOutput | 3.7690T | 3.6628T | 2.8165% | **FAIL** |
| aiGoodsAbsorbed | 5.4205T | 5.5269T | 1.9638% | **FAIL** |
| newJobEmployment | 180.5760K | 249.6340K | 38.2432% | **FAIL** |
| newJobWageIncome | 8.8659B | 12.3269B | 39.0367% | **FAIL** |
| potentialGDP | 39.9040T | 41.6673T | 4.4189% | **FAIL** |
| wageConsumption | 2.2189T | 2.2451T | 1.1800% | **FAIL** |
| assetConsumption | 4.3558T | 4.4356T | 1.8317% | **FAIL** |
| transferConsumption | 10.4625T | 10.3812T | 0.7769% | WARN |
| corporateProfits | 5.1637T | 5.2040T | 0.7808% | WARN |
| aiCorporateProfits | 2.8867T | 2.9133T | 0.9236% | WARN |
| traditionalCorporateProfits | 2.2770T | 2.2907T | 0.5998% | WARN |
| aiGDPContribution | 11.5467T | 11.6534T | 0.9236% | WARN |
| totalDemandSpilloverLoss | 3.0999M | 2.8357M | 8.5246% | **FAIL** |
| maxNeutralTransfers | 2.6464T | 7.6184T | 187.8813% | **FAIL** |

**Year 2049**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 76.3722M | 76.7630M | 0.5118% | WARN |
| totalUnemployment | 112.3664M | 111.9755M | 0.3478% | WARN |
| aggregateWageIncome | 4.1783T | 4.2307T | 1.2551% | **FAIL** |
| aggregateAssetIncome | 12.6677T | 12.8346T | 1.3178% | **FAIL** |
| aggregateTransferIncome | 11.6574T | 11.5657T | 0.7861% | WARN |
| totalIncome | 28.5033T | 28.6311T | 0.4481% | WARN |
| gdpNominal | 32.3574T | 32.6349T | 0.8577% | WARN |
| gdpReal | 32.8067T | 49.2403T | 50.0922% | **FAIL** |
| consumption | 12.4656T | 12.7452T | 2.2426% | **FAIL** |
| investment | 11.1126T | 11.1685T | 0.5030% | WARN |
| governmentSpending | 8.0067T | 7.9544T | 0.6533% | WARN |
| consumerWelfareIndex | 33.7765K | 51.3921K | 52.1532% | **FAIL** |
| unrealizedAIOutput | 3.8256T | 3.7019T | 3.2335% | **FAIL** |
| aiGoodsAbsorbed | 5.5160T | 5.6397T | 2.2426% | **FAIL** |
| newJobEmployment | 186.9165K | 268.9982K | 43.9135% | **FAIL** |
| newJobWageIncome | 9.1913B | 13.3222B | 44.9436% | **FAIL** |
| potentialGDP | 42.1483T | 41.9765T | 0.4076% | WARN |
| wageConsumption | 2.1908T | 2.2227T | 1.4551% | **FAIL** |
| assetConsumption | 4.4337T | 4.4921T | 1.3178% | **FAIL** |
| transferConsumption | 10.4916T | 10.4092T | 0.7861% | WARN |
| corporateProfits | 5.2034T | 5.2513T | 0.9195% | WARN |
| aiCorporateProfits | 2.9359T | 2.9669T | 1.0534% | **FAIL** |
| traditionalCorporateProfits | 2.2675T | 2.2844T | 0.7463% | WARN |
| aiGDPContribution | 11.7438T | 11.8675T | 1.0534% | **FAIL** |
| totalDemandSpilloverLoss | 2.7681M | 2.4593M | 11.1545% | **FAIL** |
| maxNeutralTransfers | 2.8936T | 8.6862T | 200.1844% | **FAIL** |

**Year 2050**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 75.9762M | 76.4330M | 0.6013% | WARN |
| totalUnemployment | 113.5173M | 113.0605M | 0.4024% | WARN |
| aggregateWageIncome | 4.1644T | 4.2265T | 1.4919% | **FAIL** |
| aggregateAssetIncome | 12.8317T | 12.9346T | 0.8016% | WARN |
| aggregateTransferIncome | 11.6795T | 11.5866T | 0.7954% | WARN |
| totalIncome | 28.6756T | 28.7477T | 0.2514% | WARN |
| gdpNominal | 32.4641T | 32.7837T | 0.9846% | WARN |
| gdpReal | 35.0519T | 54.9335T | 56.7207% | **FAIL** |
| consumption | 12.4949T | 12.8068T | 2.4969% | **FAIL** |
| investment | 11.1711T | 11.2362T | 0.5829% | WARN |
| governmentSpending | 8.0105T | 7.9598T | 0.6330% | WARN |
| consumerWelfareIndex | 35.9102K | 57.1215K | 59.0678% | **FAIL** |
| unrealizedAIOutput | 3.8565T | 3.7169T | 3.6209% | **FAIL** |
| aiGoodsAbsorbed | 5.5925T | 5.7321T | 2.4969% | **FAIL** |
| newJobEmployment | 196.0146K | 294.2027K | 50.0922% | **FAIL** |
| newJobWageIncome | 9.6332B | 14.5827B | 51.3796% | **FAIL** |
| potentialGDP | 44.5009T | 42.2327T | 5.0969% | **FAIL** |
| wageConsumption | 2.1758T | 2.2133T | 1.7261% | **FAIL** |
| assetConsumption | 4.4911T | 4.5271T | 0.8016% | WARN |
| transferConsumption | 10.5115T | 10.4279T | 0.7954% | WARN |
| corporateProfits | 5.2359T | 5.2906T | 1.0449% | **FAIL** |
| aiCorporateProfits | 2.9730T | 3.0079T | 1.1743% | **FAIL** |
| traditionalCorporateProfits | 2.2629T | 2.2827T | 0.8750% | WARN |
| aiGDPContribution | 11.8918T | 12.0315T | 1.1743% | **FAIL** |
| totalDemandSpilloverLoss | 2.5975M | 2.2389M | 13.8074% | **FAIL** |
| maxNeutralTransfers | 3.1311T | 9.8143T | 213.4415% | **FAIL** |

### all_policies

**Year 2026**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 32.1442T | 32.9900T | 2.6313% | **FAIL** |

**Year 2027**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 33.1365T | 34.9033T | 5.3318% | **FAIL** |

**Year 2028**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| gdpReal | 33.5300T | 33.9802T | 1.3428% | **FAIL** |
| consumerWelfareIndex | 67.0102K | 67.9100K | 1.3428% | WARN |
| potentialGDP | 33.5300T | 36.7338T | 9.5550% | **FAIL** |

**Year 2029**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 6.9130M | 6.9029M | 0.1465% | WARN |
| gdpReal | 33.7802T | 34.6942T | 2.7058% | **FAIL** |
| consumerWelfareIndex | 67.3508K | 69.1738K | 2.7067% | WARN |
| newJobEmployment | 754.4246K | 764.5552K | 1.3428% | **FAIL** |
| newJobWageIncome | 72.4383B | 73.4110B | 1.3428% | **FAIL** |
| potentialGDP | 33.7802T | 38.4925T | 13.9498% | **FAIL** |

**Year 2030**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 168.0144M | 168.0349M | 0.0122% | WARN |
| totalUnemployment | 6.9381M | 6.9175M | 0.2964% | WARN |
| aggregateWageIncome | 23.2241T | 23.2266T | 0.0109% | WARN |
| gdpReal | 34.1233T | 35.5186T | 4.0890% | **FAIL** |
| consumerWelfareIndex | 68.0172K | 70.7995K | 4.0906% | WARN |
| newJobEmployment | 760.0550K | 780.6205K | 2.7058% | **FAIL** |
| newJobWageIncome | 76.1668B | 78.2293B | 2.7079% | **FAIL** |
| potentialGDP | 34.1233T | 40.4440T | 18.5232% | **FAIL** |
| wageConsumption | 18.5793T | 18.5813T | 0.0109% | WARN |

**Year 2031**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 168.6911M | 168.7225M | 0.0186% | WARN |
| totalUnemployment | 6.9612M | 6.9298M | 0.4510% | WARN |
| aggregateWageIncome | 24.4011T | 24.4058T | 0.0194% | WARN |
| totalIncome | 40.4079T | 40.4131T | 0.0129% | WARN |
| gdpNominal | 42.4132T | 42.4179T | 0.0111% | WARN |
| gdpReal | 34.4073T | 36.2970T | 5.4923% | **FAIL** |
| consumption | 29.3319T | 29.3358T | 0.0135% | WARN |
| investment | 7.4297T | 7.4304T | 0.0100% | WARN |
| consumerWelfareIndex | 68.3295K | 72.0840K | 5.4947% | WARN |
| newJobEmployment | 767.7737K | 799.1678K | 4.0890% | **FAIL** |
| newJobWageIncome | 80.5158B | 83.8130B | 4.0951% | **FAIL** |
| potentialGDP | 34.4073T | 42.4179T | 23.2817% | **FAIL** |
| wageConsumption | 19.5208T | 19.5246T | 0.0194% | WARN |
| corporateProfits | 4.6654T | 4.6660T | 0.0111% | WARN |
| traditionalCorporateProfits | 4.6654T | 4.6660T | 0.0111% | WARN |

**Year 2032**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 169.3663M | 169.4087M | 0.0250% | WARN |
| totalUnemployment | 6.9885M | 6.9461M | 0.6068% | WARN |
| aggregateWageIncome | 25.5904T | 25.5979T | 0.0293% | WARN |
| aggregateAssetIncome | 9.1224T | 9.1233T | 0.0109% | WARN |
| totalIncome | 47.2800T | 47.2884T | 0.0179% | WARN |
| gdpNominal | 48.8332T | 48.8409T | 0.0156% | WARN |
| gdpReal | 38.0770T | 40.7262T | 6.9575% | **FAIL** |
| consumption | 35.1730T | 35.1793T | 0.0179% | WARN |
| investment | 7.7770T | 7.7783T | 0.0168% | WARN |
| consumerWelfareIndex | 78.4406K | 83.9000K | 6.9599% | WARN |
| aiAdditionalOutput | 320.5461M | 332.7061M | 3.7935% | **FAIL** |
| aiInvestmentBoost | 96.1638M | 99.8118M | 3.7935% | **FAIL** |
| aiNetExportBoost | 32.0546M | 33.2706M | 3.7935% | **FAIL** |
| aiConsumerGoodsPotential | 192.3277M | 199.6237M | 3.7935% | **FAIL** |
| aiGoodsAbsorbed | 192.3277M | 199.6237M | 3.7935% | **FAIL** |
| newJobEmployment | 774.1431K | 816.6603K | 5.4922% | **FAIL** |
| newJobWageIncome | 84.8031B | 89.4706B | 5.5039% | **FAIL** |
| potentialGDP | 38.0772T | 48.8411T | 28.2686% | **FAIL** |
| wageConsumption | 20.4723T | 20.4783T | 0.0293% | WARN |
| assetConsumption | 3.0764T | 3.0768T | 0.0113% | WARN |
| corporateProfits | 5.3717T | 5.3725T | 0.0157% | WARN |
| aiCorporateProfits | 80.1365M | 83.1765M | 3.7935% | **FAIL** |
| traditionalCorporateProfits | 5.3716T | 5.3725T | 0.0156% | WARN |
| aiGDPContribution | 320.5461M | 332.7061M | 3.7935% | **FAIL** |
| moneySupply | 23.4670T | 25.9340T | 10.5127% | **FAIL** |
| maxNeutralTransfers | 2.9693B | 2.1197B | 28.6129% | **FAIL** |

**Year 2033**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 170.0568M | 170.1139M | 0.0335% | WARN |
| totalUnemployment | 7.0034M | 6.9464M | 0.8144% | WARN |
| aggregateWageIncome | 29.4651T | 29.4769T | 0.0399% | WARN |
| aggregateAssetIncome | 10.5109T | 10.5128T | 0.0180% | WARN |
| totalIncome | 52.8643T | 52.8776T | 0.0252% | WARN |
| gdpNominal | 54.2986T | 54.3097T | 0.0204% | WARN |
| gdpReal | 40.7307T | 44.1720T | 8.4490% | **FAIL** |
| consumption | 39.0751T | 39.0848T | 0.0247% | WARN |
| investment | 9.0604T | 9.0620T | 0.0172% | WARN |
| consumerWelfareIndex | 83.4995K | 90.5583K | 8.4537% | WARN |
| aiAdditionalOutput | 5.5793B | 5.7820B | 3.6319% | **FAIL** |
| aiInvestmentBoost | 1.6738B | 1.7346B | 3.6319% | **FAIL** |
| aiNetExportBoost | 557.9322M | 578.1955M | 3.6319% | **FAIL** |
| aiConsumerGoodsPotential | 3.3476B | 3.4692B | 3.6319% | **FAIL** |
| aiGoodsAbsorbed | 3.3476B | 3.4692B | 3.6319% | **FAIL** |
| newJobEmployment | 856.1922K | 915.7408K | 6.9550% | **FAIL** |
| newJobWageIncome | 107.5797B | 115.0808B | 6.9726% | **FAIL** |
| potentialGDP | 40.7340T | 54.3132T | 33.3362% | **FAIL** |
| wageConsumption | 23.5721T | 23.5815T | 0.0399% | WARN |
| assetConsumption | 3.5450T | 3.5456T | 0.0187% | WARN |
| corporateProfits | 5.9736T | 5.9749T | 0.0209% | WARN |
| aiCorporateProfits | 1.3948B | 1.4455B | 3.6319% | **FAIL** |
| traditionalCorporateProfits | 5.9722T | 5.9734T | 0.0200% | WARN |
| aiGDPContribution | 5.5793B | 5.7820B | 3.6319% | **FAIL** |
| moneySupply | 25.9439T | 30.8878T | 19.0562% | **FAIL** |
| maxNeutralTransfers | 30.2198B | 19.6611B | 34.9396% | **FAIL** |

**Year 2034**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 170.4286M | 170.4881M | 0.0349% | WARN |
| totalUnemployment | 7.3399M | 7.2805M | 0.8101% | WARN |
| aggregateWageIncome | 32.7208T | 32.7360T | 0.0465% | WARN |
| aggregateAssetIncome | 11.7514T | 11.7561T | 0.0401% | WARN |
| totalIncome | 57.6775T | 57.6966T | 0.0331% | WARN |
| gdpNominal | 58.9594T | 58.9741T | 0.0249% | WARN |
| gdpReal | 42.6295T | 46.8789T | 9.9682% | **FAIL** |
| consumption | 42.4307T | 42.4428T | 0.0283% | WARN |
| investment | 10.0957T | 10.0987T | 0.0301% | WARN |
| consumerWelfareIndex | 87.0473K | 95.7276K | 9.9720% | WARN |
| aiAdditionalOutput | 34.7927B | 36.0094B | 3.4968% | **FAIL** |
| aiInvestmentBoost | 10.4378B | 10.8028B | 3.4968% | **FAIL** |
| aiNetExportBoost | 3.4793B | 3.6009B | 3.4968% | **FAIL** |
| aiConsumerGoodsPotential | 20.8756B | 21.6056B | 3.4968% | **FAIL** |
| aiGoodsAbsorbed | 20.8756B | 21.6056B | 3.4968% | **FAIL** |
| newJobEmployment | 912.8383K | 989.8053K | 8.4316% | **FAIL** |
| newJobWageIncome | 127.1653B | 137.9228B | 8.4595% | **FAIL** |
| potentialGDP | 42.6504T | 58.9957T | 38.3240% | **FAIL** |
| wageConsumption | 26.1766T | 26.1888T | 0.0465% | WARN |
| assetConsumption | 3.9591T | 3.9607T | 0.0416% | WARN |
| corporateProfits | 6.4904T | 6.4922T | 0.0275% | WARN |
| aiCorporateProfits | 8.6982B | 9.0023B | 3.4968% | **FAIL** |
| traditionalCorporateProfits | 6.4817T | 6.4832T | 0.0229% | WARN |
| aiGDPContribution | 34.7927B | 36.0094B | 3.4968% | **FAIL** |
| moneySupply | 28.4307T | 35.8614T | 26.1362% | **FAIL** |
| maxNeutralTransfers | 92.6998B | 55.4892B | 40.1410% | **FAIL** |

**Year 2035**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 170.2039M | 170.2604M | 0.0332% | WARN |
| totalUnemployment | 8.2757M | 8.2192M | 0.6836% | WARN |
| aggregateWageIncome | 35.1774T | 35.2223T | 0.1276% | WARN |
| aggregateAssetIncome | 12.9270T | 12.9357T | 0.0671% | WARN |
| aggregateTransferIncome | 13.5180T | 13.5145T | 0.0260% | WARN |
| totalIncome | 61.6225T | 61.6725T | 0.0812% | WARN |
| gdpNominal | 62.7007T | 62.7485T | 0.0763% | WARN |
| gdpReal | 43.8497T | 48.8707T | 11.4503% | **FAIL** |
| consumption | 44.9909T | 45.0350T | 0.0981% | WARN |
| investment | 11.0225T | 11.0275T | 0.0453% | WARN |
| governmentSpending | 8.1096T | 8.1084T | 0.0152% | WARN |
| consumerWelfareIndex | 88.9207K | 99.1241K | 11.4746% | **FAIL** |
| aiAdditionalOutput | 120.9599B | 123.8224B | 2.3664% | **FAIL** |
| aiInvestmentBoost | 36.2880B | 37.1467B | 2.3664% | **FAIL** |
| aiNetExportBoost | 12.0960B | 12.3822B | 2.3664% | **FAIL** |
| aiConsumerGoodsPotential | 72.5760B | 74.2934B | 2.3664% | **FAIL** |
| aiGoodsAbsorbed | 72.5760B | 74.2934B | 2.3664% | **FAIL** |
| newJobEmployment | 947.2424K | 1.0413M | 9.9304% | **FAIL** |
| newJobWageIncome | 142.2737B | 156.5820B | 10.0569% | **FAIL** |
| potentialGDP | 43.9223T | 62.8228T | 43.0317% | **FAIL** |
| wageConsumption | 28.1003T | 28.1418T | 0.1475% | WARN |
| assetConsumption | 4.3475T | 4.3505T | 0.0698% | WARN |
| transferConsumption | 12.6214T | 12.6182T | 0.0250% | WARN |
| corporateProfits | 6.9140T | 6.9197T | 0.0819% | WARN |
| aiCorporateProfits | 30.2400B | 30.9556B | 2.3664% | **FAIL** |
| traditionalCorporateProfits | 6.8838T | 6.8887T | 0.0718% | WARN |
| aiGDPContribution | 120.9599B | 123.8224B | 2.3664% | **FAIL** |
| moneySupply | 30.9275T | 40.8549T | 32.0992% | **FAIL** |
| maxNeutralTransfers | 175.1984B | 99.4839B | 43.2164% | **FAIL** |

**Year 2036**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 169.5445M | 169.6167M | 0.0426% | WARN |
| totalUnemployment | 9.6490M | 9.5769M | 0.7478% | WARN |
| aggregateWageIncome | 36.4806T | 36.5550T | 0.2039% | WARN |
| aggregateAssetIncome | 14.0026T | 14.0189T | 0.1167% | WARN |
| aggregateTransferIncome | 13.7860T | 13.7705T | 0.1129% | WARN |
| totalIncome | 64.2692T | 64.3443T | 0.1169% | WARN |
| gdpNominal | 64.9719T | 65.0127T | 0.0629% | WARN |
| gdpReal | 44.2847T | 49.8351T | 12.5335% | **FAIL** |
| consumption | 46.2514T | 46.2900T | 0.0833% | WARN |
| investment | 11.8213T | 11.8328T | 0.0980% | WARN |
| governmentSpending | 8.3964T | 8.3879T | 0.1014% | WARN |
| consumerWelfareIndex | 88.7366K | 99.8789K | 12.5565% | **FAIL** |
| aiAdditionalOutput | 282.7173B | 286.6188B | 1.3800% | **FAIL** |
| aiInvestmentBoost | 84.8152B | 85.9856B | 1.3800% | **FAIL** |
| aiNetExportBoost | 28.2717B | 28.6619B | 1.3800% | **FAIL** |
| aiConsumerGoodsPotential | 169.6304B | 171.9713B | 1.3800% | **FAIL** |
| aiGoodsAbsorbed | 169.6304B | 171.9713B | 1.3800% | **FAIL** |
| newJobEmployment | 962.3540K | 1.0722M | 11.4117% | **FAIL** |
| newJobWageIncome | 150.8890B | 168.4231B | 11.6205% | **FAIL** |
| potentialGDP | 44.4543T | 65.1847T | 46.6331% | **FAIL** |
| wageConsumption | 29.0049T | 29.0714T | 0.2292% | WARN |
| assetConsumption | 4.6974T | 4.7031T | 0.1218% | WARN |
| transferConsumption | 12.9308T | 12.9168T | 0.1083% | WARN |
| corporateProfits | 7.1865T | 7.1915T | 0.0701% | WARN |
| aiCorporateProfits | 70.6793B | 71.6547B | 1.3800% | **FAIL** |
| traditionalCorporateProfits | 7.1158T | 7.1199T | 0.0571% | WARN |
| aiGDPContribution | 282.7173B | 286.6188B | 1.3800% | **FAIL** |
| moneySupply | 33.4342T | 45.8684T | 37.1901% | **FAIL** |
| maxNeutralTransfers | 317.8586B | 182.8373B | 42.4784% | **FAIL** |

**Year 2037**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 168.1314M | 168.2080M | 0.0455% | WARN |
| totalUnemployment | 11.7789M | 11.7023M | 0.6500% | WARN |
| aggregateWageIncome | 36.3355T | 36.4050T | 0.1913% | WARN |
| aggregateAssetIncome | 14.9103T | 14.9271T | 0.1123% | WARN |
| aggregateTransferIncome | 13.9804T | 13.9415T | 0.2784% | WARN |
| totalIncome | 65.2262T | 65.2735T | 0.0726% | WARN |
| gdpNominal | 65.1707T | 65.1381T | 0.0502% | WARN |
| gdpReal | 43.7518T | 49.4127T | 12.9389% | **FAIL** |
| consumption | 45.9947T | 45.9784T | 0.0354% | WARN |
| investment | 12.1281T | 12.1374T | 0.0771% | WARN |
| governmentSpending | 8.5696T | 8.5442T | 0.2964% | WARN |
| consumerWelfareIndex | 86.5699K | 97.7855K | 12.9556% | **FAIL** |
| aiAdditionalOutput | 590.3083B | 596.7220B | 1.0865% | **FAIL** |
| aiInvestmentBoost | 177.0925B | 179.0166B | 1.0865% | **FAIL** |
| aiNetExportBoost | 59.0308B | 59.6722B | 1.0865% | **FAIL** |
| aiConsumerGoodsPotential | 354.1850B | 358.0332B | 1.0865% | **FAIL** |
| aiGoodsAbsorbed | 354.1850B | 358.0332B | 1.0865% | **FAIL** |
| newJobEmployment | 953.4296K | 1.0725M | 12.4891% | **FAIL** |
| newJobWageIncome | 150.8405B | 169.9851B | 12.6919% | **FAIL** |
| potentialGDP | 44.1059T | 65.4961T | 48.4972% | **FAIL** |
| wageConsumption | 28.6784T | 28.7410T | 0.2183% | WARN |
| assetConsumption | 4.9845T | 4.9904T | 0.1176% | WARN |
| transferConsumption | 13.1843T | 13.1492T | 0.2657% | WARN |
| corporateProfits | 7.2514T | 7.2487T | 0.0372% | WARN |
| aiCorporateProfits | 147.5771B | 149.1805B | 1.0865% | **FAIL** |
| traditionalCorporateProfits | 7.1038T | 7.0995T | 0.0605% | WARN |
| aiGDPContribution | 590.3083B | 596.7220B | 1.0865% | **FAIL** |
| moneySupply | 35.9510T | 50.9019T | 41.5871% | **FAIL** |
| maxNeutralTransfers | 488.0293B | 291.3623B | 40.2982% | **FAIL** |

**Year 2038**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 165.8281M | 165.8814M | 0.0321% | WARN |
| totalUnemployment | 14.8018M | 14.7485M | 0.3601% | WARN |
| aggregateWageIncome | 34.4321T | 34.4432T | 0.0324% | WARN |
| aggregateAssetIncome | 15.5220T | 15.5282T | 0.0401% | WARN |
| aggregateTransferIncome | 14.0586T | 14.0201T | 0.2737% | WARN |
| totalIncome | 64.0127T | 63.9916T | 0.0330% | WARN |
| gdpNominal | 61.4072T | 60.9713T | 0.7098% | WARN |
| gdpReal | 41.2589T | 46.1849T | 11.9391% | **FAIL** |
| consumption | 42.2932T | 41.8982T | 0.9341% | WARN |
| investment | 12.0132T | 11.9986T | 0.1223% | WARN |
| governmentSpending | 8.5764T | 8.5485T | 0.3256% | WARN |
| consumerWelfareIndex | 79.3510K | 88.6241K | 11.6862% | WARN |
| aiAdditionalOutput | 1.0981T | 1.1081T | 0.9136% | WARN |
| aiInvestmentBoost | 329.4173B | 332.4269B | 0.9136% | WARN |
| aiNetExportBoost | 109.8058B | 110.8090B | 0.9136% | WARN |
| aiConsumerGoodsPotential | 658.8346B | 664.8538B | 0.9136% | WARN |
| aiGoodsAbsorbed | 658.8346B | 664.8538B | 0.9136% | WARN |
| newJobEmployment | 916.4896K | 1.0344M | 12.8701% | **FAIL** |
| newJobWageIncome | 140.3250B | 158.4493B | 12.9160% | **FAIL** |
| potentialGDP | 41.9178T | 61.6362T | 47.0407% | **FAIL** |
| wageConsumption | 26.8924T | 26.9062T | 0.0513% | WARN |
| assetConsumption | 5.1635T | 5.1657T | 0.0422% | WARN |
| transferConsumption | 13.3449T | 13.3103T | 0.2595% | WARN |
| corporateProfits | 6.9085T | 6.8620T | 0.6737% | WARN |
| aiCorporateProfits | 274.5144B | 277.0224B | 0.9136% | WARN |
| traditionalCorporateProfits | 6.6340T | 6.5850T | 0.7394% | WARN |
| aiGDPContribution | 1.0981T | 1.1081T | 0.9136% | WARN |
| moneySupply | 38.4778T | 55.9556T | 45.4231% | **FAIL** |
| maxNeutralTransfers | 722.2435B | 495.9639B | 31.3301% | **FAIL** |

**Year 2039**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 160.2699M | 160.3581M | 0.0550% | WARN |
| totalUnemployment | 21.0826M | 20.9944M | 0.4183% | WARN |
| aggregateWageIncome | 28.7397T | 28.5802T | 0.5551% | WARN |
| aggregateAssetIncome | 15.6293T | 15.5181T | 0.7118% | WARN |
| aggregateTransferIncome | 14.1994T | 14.1602T | 0.2757% | WARN |
| totalIncome | 58.5684T | 58.2585T | 0.5292% | WARN |
| gdpNominal | 53.4289T | 52.3869T | 1.9503% | **FAIL** |
| gdpReal | 36.7485T | 40.0204T | 8.9033% | **FAIL** |
| consumption | 35.1389T | 34.2754T | 2.4573% | **FAIL** |
| investment | 11.1216T | 10.9740T | 1.3270% | **FAIL** |
| governmentSpending | 8.4476T | 8.4058T | 0.4940% | WARN |
| consumerWelfareIndex | 67.2203K | 72.8266K | 8.3402% | WARN |
| aiAdditionalOutput | 2.1482T | 2.1496T | 0.0654% | WARN |
| aiInvestmentBoost | 644.4584B | 644.8801B | 0.0654% | WARN |
| aiNetExportBoost | 214.8195B | 214.9600B | 0.0654% | WARN |
| aiConsumerGoodsPotential | 1.2889T | 1.2898T | 0.0654% | WARN |
| aiGoodsAbsorbed | 1.2889T | 1.2898T | 0.0654% | WARN |
| newJobEmployment | 815.1299K | 912.3682K | 11.9292% | **FAIL** |
| newJobWageIncome | 109.7287B | 122.0917B | 11.2668% | **FAIL** |
| potentialGDP | 38.0374T | 53.6767T | 41.1153% | **FAIL** |
| wageConsumption | 21.9535T | 21.8386T | 0.5234% | WARN |
| assetConsumption | 5.1607T | 5.1218T | 0.7545% | WARN |
| transferConsumption | 13.5754T | 13.5402T | 0.2595% | WARN |
| corporateProfits | 6.1779T | 6.0635T | 1.8522% | **FAIL** |
| aiCorporateProfits | 537.0487B | 537.4001B | 0.0654% | WARN |
| traditionalCorporateProfits | 5.6409T | 5.5261T | 2.0347% | **FAIL** |
| aiGDPContribution | 2.1482T | 2.1496T | 0.0654% | WARN |
| moneySupply | 41.0147T | 61.0295T | 48.7989% | **FAIL** |
| maxNeutralTransfers | 906.4343B | 830.3244B | 8.3966% | **FAIL** |

**Year 2040**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 150.0508M | 149.9992M | 0.0344% | WARN |
| totalUnemployment | 32.0271M | 32.0787M | 0.1613% | WARN |
| aggregateWageIncome | 20.2640T | 19.8463T | 2.0613% | **FAIL** |
| aggregateAssetIncome | 14.6268T | 14.3415T | 1.9509% | **FAIL** |
| aggregateTransferIncome | 14.4298T | 14.3933T | 0.2527% | WARN |
| totalIncome | 49.3206T | 48.5811T | 1.4994% | **FAIL** |
| gdpNominal | 44.4031T | 43.3731T | 2.3197% | **FAIL** |
| gdpReal | 31.6983T | 33.7794T | 6.5653% | **FAIL** |
| consumption | 27.3357T | 26.6070T | 2.6660% | **FAIL** |
| investment | 9.7921T | 9.5262T | 2.7152% | **FAIL** |
| governmentSpending | 8.1744T | 8.1119T | 0.7644% | WARN |
| consumerWelfareIndex | 54.0591K | 57.4040K | 6.1875% | WARN |
| aiAdditionalOutput | 4.0082T | 4.0256T | 0.4353% | WARN |
| aiInvestmentBoost | 1.2024T | 1.2077T | 0.4353% | WARN |
| aiNetExportBoost | 400.8155B | 402.5601B | 0.4353% | WARN |
| aiConsumerGoodsPotential | 2.4049T | 2.4154T | 0.4353% | WARN |
| aiGoodsAbsorbed | 2.4049T | 2.4154T | 0.4353% | WARN |
| newJobEmployment | 651.8709K | 709.1018K | 8.7795% | **FAIL** |
| newJobWageIncome | 68.1039B | 72.6121B | 6.6196% | **FAIL** |
| potentialGDP | 34.1032T | 45.7885T | 34.2645% | **FAIL** |
| wageConsumption | 14.8748T | 14.5654T | 2.0802% | **FAIL** |
| assetConsumption | 4.7634T | 4.6635T | 2.0967% | **FAIL** |
| transferConsumption | 13.9022T | 13.8694T | 0.2360% | WARN |
| corporateProfits | 5.4455T | 5.3346T | 2.0358% | **FAIL** |
| aiCorporateProfits | 1.0020T | 1.0064T | 0.4353% | WARN |
| traditionalCorporateProfits | 4.4434T | 4.3282T | 2.5931% | **FAIL** |
| aiGDPContribution | 4.0082T | 4.0256T | 0.4353% | WARN |
| moneySupply | 43.5618T | 66.1236T | 51.7926% | **FAIL** |
| maxNeutralTransfers | 1.0206T | 1.5336T | 50.2689% | **FAIL** |

**Year 2041**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 132.4659M | 132.0717M | 0.2976% | WARN |
| totalUnemployment | 50.3402M | 50.7345M | 0.7832% | WARN |
| aggregateWageIncome | 11.8949T | 11.5292T | 3.0744% | **FAIL** |
| aggregateAssetIncome | 13.2808T | 13.0186T | 1.9745% | **FAIL** |
| aggregateTransferIncome | 14.8018T | 14.7719T | 0.2019% | WARN |
| totalIncome | 39.9774T | 39.3196T | 1.6454% | **FAIL** |
| gdpNominal | 38.2408T | 37.7958T | 1.1637% | **FAIL** |
| gdpReal | 28.4861T | 30.3239T | 6.4518% | **FAIL** |
| consumption | 21.2908T | 21.0194T | 1.2746% | **FAIL** |
| investment | 9.4463T | 9.3027T | 1.5203% | **FAIL** |
| governmentSpending | 7.8653T | 7.8032T | 0.7892% | WARN |
| consumerWelfareIndex | 43.7601K | 46.5312K | 6.3323% | WARN |
| aiAdditionalOutput | 7.1867T | 7.2566T | 0.9733% | WARN |
| aiInvestmentBoost | 2.1560T | 2.1770T | 0.9733% | WARN |
| aiNetExportBoost | 718.6661B | 725.6606B | 0.9733% | WARN |
| aiConsumerGoodsPotential | 4.3120T | 4.3540T | 0.9733% | WARN |
| unrealizedAIOutput | 0.000000 | 18.9286B | 100.0000% | **FAIL** |
| aiGoodsAbsorbed | 4.3120T | 4.3350T | 0.5343% | WARN |
| newJobEmployment | 460.4001K | 488.1677K | 6.0312% | **FAIL** |
| newJobWageIncome | 33.3783B | 34.4437B | 3.1919% | **FAIL** |
| potentialGDP | 32.7981T | 42.1497T | 28.5129% | **FAIL** |
| wageConsumption | 8.1398T | 7.8771T | 3.2271% | **FAIL** |
| assetConsumption | 4.2389T | 4.1471T | 2.1652% | **FAIL** |
| transferConsumption | 14.3743T | 14.3474T | 0.1871% | WARN |
| corporateProfits | 5.2126T | 5.1708T | 0.8021% | WARN |
| aiCorporateProfits | 1.7967T | 1.8094T | 0.7099% | WARN |
| traditionalCorporateProfits | 3.4160T | 3.3614T | 1.5973% | **FAIL** |
| aiGDPContribution | 7.1867T | 7.2377T | 0.7099% | WARN |
| moneySupply | 46.1191T | 71.2382T | 54.4657% | **FAIL** |
| maxNeutralTransfers | 1.1231T | 2.3934T | 113.1101% | **FAIL** |

**Year 2042**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 119.4798M | 119.5024M | 0.0189% | WARN |
| totalUnemployment | 64.0576M | 64.0350M | 0.0352% | WARN |
| aggregateWageIncome | 7.8042T | 7.7165T | 1.1235% | **FAIL** |
| aggregateAssetIncome | 12.1095T | 12.0741T | 0.2924% | WARN |
| aggregateTransferIncome | 15.0856T | 15.0477T | 0.2511% | WARN |
| totalIncome | 34.9993T | 34.8384T | 0.4599% | WARN |
| gdpNominal | 35.2965T | 35.2733T | 0.0656% | WARN |
| gdpReal | 27.5625T | 29.4419T | 6.8185% | **FAIL** |
| investment | 9.2156T | 9.2223T | 0.0723% | WARN |
| governmentSpending | 7.6543T | 7.6122T | 0.5492% | WARN |
| consumerWelfareIndex | 39.5228K | 42.2486K | 6.8968% | WARN |
| unrealizedAIOutput | 720.0175B | 719.6447B | 0.0518% | WARN |
| newJobEmployment | 349.8573K | 372.4294K | 6.4518% | **FAIL** |
| newJobWageIncome | 19.1704B | 20.1748B | 5.2392% | **FAIL** |
| potentialGDP | 33.2039T | 40.9147T | 23.2227% | **FAIL** |
| wageConsumption | 5.0532T | 4.9969T | 1.1141% | **FAIL** |
| assetConsumption | 3.7675T | 3.7551T | 0.3290% | WARN |
| transferConsumption | 14.7877T | 14.7536T | 0.2306% | WARN |
| corporateProfits | 5.0981T | 5.0956T | 0.0489% | WARN |
| traditionalCorporateProfits | 2.9276T | 2.9250T | 0.0884% | WARN |
| moneySupply | 48.6866T | 76.3732T | 56.8670% | **FAIL** |
| maxNeutralTransfers | 1.2733T | 2.7202T | 113.6371% | **FAIL** |

**Year 2043**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 104.3878M | 104.4036M | 0.0152% | WARN |
| totalUnemployment | 79.8838M | 79.8679M | 0.0199% | WARN |
| aggregateWageIncome | 5.8630T | 5.8599T | 0.0526% | WARN |
| aggregateAssetIncome | 12.2365T | 12.4243T | 1.5350% | **FAIL** |
| aggregateTransferIncome | 15.4100T | 15.3723T | 0.2450% | WARN |
| totalIncome | 33.5095T | 33.6565T | 0.4387% | WARN |
| gdpNominal | 34.6990T | 34.9098T | 0.6074% | WARN |
| gdpReal | 28.6477T | 30.7486T | 7.3334% | **FAIL** |
| consumption | 17.0461T | 17.2112T | 0.9682% | WARN |
| investment | 9.8268T | 9.8995T | 0.7404% | WARN |
| governmentSpending | 7.5534T | 7.5259T | 0.3653% | WARN |
| consumerWelfareIndex | 38.5224K | 41.4956K | 7.7183% | WARN |
| unrealizedAIOutput | 1.3071T | 1.2540T | 4.0601% | **FAIL** |
| aiGoodsAbsorbed | 5.4811T | 5.5342T | 0.9682% | WARN |
| newJobEmployment | 273.2419K | 291.8729K | 6.8185% | **FAIL** |
| newJobWageIncome | 13.5571B | 14.4720B | 6.7485% | **FAIL** |
| potentialGDP | 35.4359T | 41.6980T | 17.6715% | **FAIL** |
| wageConsumption | 3.5486T | 3.5469T | 0.0455% | WARN |
| assetConsumption | 3.7414T | 3.8071T | 1.7572% | **FAIL** |
| transferConsumption | 15.2613T | 15.2273T | 0.2227% | WARN |
| corporateProfits | 5.2178T | 5.2484T | 0.5867% | WARN |
| aiCorporateProfits | 2.5017T | 2.5149T | 0.5304% | WARN |
| traditionalCorporateProfits | 2.7162T | 2.7335T | 0.6387% | WARN |
| aiGDPContribution | 10.0066T | 10.0597T | 0.5304% | WARN |
| totalDemandSpilloverLoss | 354.6170K | 357.3751K | 0.7778% | WARN |
| moneySupply | 51.2644T | 81.5287T | 59.0359% | **FAIL** |
| maxNeutralTransfers | 1.5997T | 3.4340T | 114.6669% | **FAIL** |

**Year 2044**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 94.8647M | 94.9875M | 0.1295% | WARN |
| totalUnemployment | 90.1440M | 90.0211M | 0.1363% | WARN |
| aggregateWageIncome | 5.1197T | 5.1582T | 0.7517% | WARN |
| aggregateAssetIncome | 13.2464T | 13.5868T | 2.5703% | **FAIL** |
| aggregateTransferIncome | 15.6276T | 15.5878T | 0.2547% | WARN |
| totalIncome | 33.9937T | 34.3329T | 0.9977% | WARN |
| gdpNominal | 35.0935T | 35.3631T | 0.7683% | WARN |
| gdpReal | 30.9400T | 33.4385T | 8.0753% | **FAIL** |
| consumption | 16.5368T | 16.7411T | 1.2350% | **FAIL** |
| investment | 10.5975T | 10.6877T | 0.8513% | WARN |
| governmentSpending | 7.5330T | 7.5134T | 0.2600% | WARN |
| consumerWelfareIndex | 39.7491K | 43.1579K | 8.5758% | WARN |
| unrealizedAIOutput | 1.6515T | 1.5776T | 4.4731% | **FAIL** |
| aiGoodsAbsorbed | 5.9703T | 6.0435T | 1.2263% | **FAIL** |
| newJobEmployment | 244.4088K | 262.3548K | 7.3426% | **FAIL** |
| newJobWageIncome | 11.8737B | 12.8230B | 7.9947% | **FAIL** |
| potentialGDP | 38.5618T | 42.9842T | 11.4684% | **FAIL** |
| wageConsumption | 2.9611T | 2.9851T | 0.8095% | WARN |
| assetConsumption | 4.0136T | 4.1328T | 2.9690% | **FAIL** |
| transferConsumption | 15.6660T | 15.6301T | 0.2287% | WARN |
| corporateProfits | 5.4075T | 5.4473T | 0.7369% | WARN |
| aiCorporateProfits | 2.7629T | 2.7811T | 0.6585% | WARN |
| traditionalCorporateProfits | 2.6446T | 2.6663T | 0.8188% | WARN |
| aiGDPContribution | 11.0514T | 11.1242T | 0.6585% | WARN |
| totalDemandSpilloverLoss | 837.2421K | 737.4853K | 11.9149% | **FAIL** |
| moneySupply | 53.8524T | 86.7049T | 61.0045% | **FAIL** |
| maxNeutralTransfers | 2.0821T | 4.5003T | 116.1413% | **FAIL** |

**Year 2045**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 88.7073M | 88.8648M | 0.1776% | WARN |
| totalUnemployment | 97.0414M | 96.8839M | 0.1623% | WARN |
| aggregateWageIncome | 4.7658T | 4.8118T | 0.9638% | WARN |
| aggregateAssetIncome | 14.7420T | 15.0875T | 2.3437% | **FAIL** |
| aggregateTransferIncome | 15.7808T | 15.7403T | 0.2565% | WARN |
| totalIncome | 35.2886T | 35.6396T | 0.9946% | WARN |
| gdpNominal | 35.9801T | 36.2288T | 0.6912% | WARN |
| gdpReal | 34.0231T | 37.1458T | 9.1781% | **FAIL** |
| consumption | 16.6905T | 16.9001T | 1.2559% | **FAIL** |
| investment | 11.2169T | 11.2810T | 0.5711% | WARN |
| governmentSpending | 7.5465T | 7.5289T | 0.2328% | WARN |
| consumerWelfareIndex | 42.8576K | 47.0536K | 9.7904% | WARN |
| aiAdditionalOutput | 13.7995T | 13.7910T | 0.0614% | WARN |
| aiInvestmentBoost | 4.1399T | 4.1373T | 0.0614% | WARN |
| aiNetExportBoost | 1.3800T | 1.3791T | 0.0614% | WARN |
| aiConsumerGoodsPotential | 8.2797T | 8.2746T | 0.0614% | WARN |
| unrealizedAIOutput | 1.7338T | 1.6505T | 4.8001% | **FAIL** |
| aiGoodsAbsorbed | 6.5459T | 6.6241T | 1.1937% | **FAIL** |
| newJobEmployment | 235.6460K | 254.8012K | 8.1288% | **FAIL** |
| newJobWageIncome | 11.5320B | 12.5653B | 8.9596% | **FAIL** |
| potentialGDP | 42.3028T | 44.5034T | 5.2021% | **FAIL** |
| wageConsumption | 2.6726T | 2.7004T | 1.0402% | **FAIL** |
| assetConsumption | 4.4437T | 4.5646T | 2.7213% | **FAIL** |
| transferConsumption | 16.0439T | 16.0075T | 0.2270% | WARN |
| corporateProfits | 5.6470T | 5.6848T | 0.6697% | WARN |
| aiCorporateProfits | 3.0164T | 3.0351T | 0.6195% | WARN |
| traditionalCorporateProfits | 2.6306T | 2.6497T | 0.7274% | WARN |
| aiGDPContribution | 12.0658T | 12.1405T | 0.6195% | WARN |
| totalDemandSpilloverLoss | 814.4133K | 703.5715K | 13.6100% | **FAIL** |
| moneySupply | 56.4509T | 91.9017T | 62.7995% | **FAIL** |
| maxNeutralTransfers | 2.5137T | 5.4877T | 118.3085% | **FAIL** |

**Year 2046**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 84.9999M | 85.0980M | 0.1154% | WARN |
| totalUnemployment | 101.4917M | 101.3937M | 0.0966% | WARN |
| aggregateWageIncome | 4.6795T | 4.7175T | 0.8118% | WARN |
| aggregateAssetIncome | 16.2782T | 16.4538T | 1.0786% | **FAIL** |
| aggregateTransferIncome | 15.8870T | 15.8477T | 0.2476% | WARN |
| totalIncome | 36.8447T | 37.0189T | 0.4729% | WARN |
| gdpNominal | 36.9222T | 37.1601T | 0.6444% | WARN |
| gdpReal | 37.5496T | 41.6325T | 10.8734% | **FAIL** |
| consumption | 17.0692T | 17.2867T | 1.2740% | **FAIL** |
| investment | 11.7030T | 11.7478T | 0.3827% | WARN |
| governmentSpending | 7.5769T | 7.5586T | 0.2413% | WARN |
| consumerWelfareIndex | 46.9510K | 52.3818K | 11.5670% | WARN |
| unrealizedAIOutput | 1.6639T | 1.5744T | 5.3799% | **FAIL** |
| aiGoodsAbsorbed | 7.0268T | 7.1164T | 1.2740% | **FAIL** |
| newJobEmployment | 239.3256K | 261.2904K | 9.1778% | **FAIL** |
| newJobWageIncome | 11.9602B | 13.1481B | 9.9324% | **FAIL** |
| potentialGDP | 46.2404T | 45.8509T | 0.8423% | WARN |
| wageConsumption | 2.5732T | 2.5954T | 0.8600% | WARN |
| assetConsumption | 4.8739T | 4.9354T | 1.2608% | **FAIL** |
| transferConsumption | 16.4157T | 16.3803T | 0.2157% | WARN |
| corporateProfits | 5.8563T | 5.8950T | 0.6609% | WARN |
| aiCorporateProfits | 3.2052T | 3.2276T | 0.6983% | WARN |
| traditionalCorporateProfits | 2.6512T | 2.6675T | 0.6157% | WARN |
| aiGDPContribution | 12.8207T | 12.9102T | 0.6983% | WARN |
| totalDemandSpilloverLoss | 561.5487K | 485.2720K | 13.5833% | **FAIL** |
| moneySupply | 59.0597T | 97.1194T | 64.4428% | **FAIL** |
| maxNeutralTransfers | 2.9620T | 6.5683T | 121.7474% | **FAIL** |

**Year 2047**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 82.3432M | 82.4310M | 0.1066% | WARN |
| totalUnemployment | 104.8944M | 104.8067M | 0.0837% | WARN |
| aggregateWageIncome | 4.6526T | 4.6878T | 0.7545% | WARN |
| aggregateAssetIncome | 17.2930T | 17.3737T | 0.4668% | WARN |
| aggregateTransferIncome | 15.9732T | 15.9341T | 0.2450% | WARN |
| totalIncome | 37.9188T | 37.9955T | 0.2022% | WARN |
| gdpNominal | 37.6634T | 37.9314T | 0.7114% | WARN |
| gdpReal | 41.2557T | 46.7271T | 13.2622% | **FAIL** |
| consumption | 17.4178T | 17.6653T | 1.4207% | **FAIL** |
| investment | 12.0387T | 12.0836T | 0.3730% | WARN |
| governmentSpending | 7.6091T | 7.5905T | 0.2452% | WARN |
| consumerWelfareIndex | 51.3970K | 58.6234K | 14.0599% | WARN |
| unrealizedAIOutput | 1.5704T | 1.4652T | 6.6992% | **FAIL** |
| aiGoodsAbsorbed | 7.4059T | 7.5112T | 1.4219% | **FAIL** |
| newJobEmployment | 248.1677K | 275.1184K | 10.8599% | **FAIL** |
| newJobWageIncome | 12.6761B | 14.1432B | 11.5742% | **FAIL** |
| potentialGDP | 50.2320T | 46.9077T | 6.6178% | **FAIL** |
| wageConsumption | 2.5212T | 2.5413T | 0.7981% | WARN |
| assetConsumption | 5.1056T | 5.1338T | 0.5533% | WARN |
| transferConsumption | 16.8109T | 16.7757T | 0.2095% | WARN |
| corporateProfits | 6.0176T | 6.0618T | 0.7349% | WARN |
| aiCorporateProfits | 3.3475T | 3.3739T | 0.7869% | WARN |
| traditionalCorporateProfits | 2.6701T | 2.6879T | 0.6697% | WARN |
| aiGDPContribution | 13.3901T | 13.4955T | 0.7869% | WARN |
| totalDemandSpilloverLoss | 323.3124K | 256.3059K | 20.7250% | **FAIL** |
| moneySupply | 61.6790T | 102.3579T | 65.9527% | **FAIL** |
| maxNeutralTransfers | 3.4210T | 7.7502T | 126.5513% | **FAIL** |

**Year 2048**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 80.3217M | 80.3829M | 0.0761% | WARN |
| totalUnemployment | 107.6649M | 107.6037M | 0.0568% | WARN |
| aggregateWageIncome | 4.6326T | 4.6692T | 0.7914% | WARN |
| aggregateAssetIncome | 18.2586T | 18.2534T | 0.0285% | WARN |
| aggregateTransferIncome | 16.0474T | 16.0087T | 0.2407% | WARN |
| totalIncome | 38.9386T | 38.9314T | 0.0184% | WARN |
| gdpNominal | 38.2802T | 38.5825T | 0.7897% | WARN |
| gdpReal | 45.2167T | 52.5255T | 16.1640% | **FAIL** |
| consumption | 17.7899T | 18.0562T | 1.4971% | **FAIL** |
| investment | 12.2405T | 12.3006T | 0.4904% | WARN |
| governmentSpending | 7.6345T | 7.6169T | 0.2309% | WARN |
| consumerWelfareIndex | 56.3823K | 65.9557K | 16.9794% | WARN |
| unrealizedAIOutput | 1.4457T | 1.3299T | 8.0151% | **FAIL** |
| aiGoodsAbsorbed | 7.7438T | 7.8600T | 1.5015% | **FAIL** |
| newJobEmployment | 259.3191K | 293.6237K | 13.2287% | **FAIL** |
| newJobWageIncome | 13.4578B | 15.3465B | 14.0343% | **FAIL** |
| potentialGDP | 54.4062T | 47.7723T | 12.1932% | **FAIL** |
| wageConsumption | 2.4814T | 2.5018T | 0.8220% | WARN |
| assetConsumption | 5.3015T | 5.2997T | 0.0343% | WARN |
| transferConsumption | 17.2429T | 17.2081T | 0.2016% | WARN |
| corporateProfits | 6.1526T | 6.2022T | 0.8056% | WARN |
| aiCorporateProfits | 3.4675T | 3.4967T | 0.8402% | WARN |
| traditionalCorporateProfits | 2.6851T | 2.7055T | 0.7610% | WARN |
| aiGDPContribution | 13.8701T | 13.9866T | 0.8402% | WARN |
| totalDemandSpilloverLoss | 160.2270K | 118.7661K | 25.8763% | **FAIL** |
| moneySupply | 64.3087T | 107.6174T | 67.3450% | **FAIL** |
| maxNeutralTransfers | 3.8960T | 9.0538T | 132.3858% | **FAIL** |

**Year 2049**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 79.1324M | 79.1967M | 0.0813% | WARN |
| totalUnemployment | 109.6061M | 109.5418M | 0.0587% | WARN |
| aggregateWageIncome | 4.6383T | 4.6785T | 0.8678% | WARN |
| aggregateAssetIncome | 19.1825T | 19.0875T | 0.4956% | WARN |
| aggregateTransferIncome | 16.1057T | 16.0670T | 0.2402% | WARN |
| totalIncome | 39.9265T | 39.8330T | 0.2342% | WARN |
| gdpNominal | 38.8821T | 39.2122T | 0.8490% | WARN |
| gdpReal | 49.5728T | 59.1804T | 19.3807% | **FAIL** |
| consumption | 18.1946T | 18.4810T | 1.5738% | **FAIL** |
| investment | 12.4062T | 12.4737T | 0.5446% | WARN |
| governmentSpending | 7.6556T | 7.6392T | 0.2149% | WARN |
| consumerWelfareIndex | 61.9940K | 74.5408K | 20.2387% | **FAIL** |
| unrealizedAIOutput | 1.2906T | 1.1639T | 9.8180% | **FAIL** |
| aiGoodsAbsorbed | 8.0511T | 8.1778T | 1.5738% | **FAIL** |
| newJobEmployment | 275.1709K | 319.6495K | 16.1640% | **FAIL** |
| newJobWageIncome | 14.4564B | 16.9258B | 17.0813% | **FAIL** |
| potentialGDP | 58.9144T | 48.5538T | 17.5859% | **FAIL** |
| wageConsumption | 2.4659T | 2.4881T | 0.9001% | WARN |
| assetConsumption | 5.4615T | 5.4283T | 0.6092% | WARN |
| transferConsumption | 17.7154T | 17.6806T | 0.1965% | WARN |
| corporateProfits | 6.2761T | 6.3301T | 0.8612% | WARN |
| aiCorporateProfits | 3.5697T | 3.6014T | 0.8874% | WARN |
| traditionalCorporateProfits | 2.7064T | 2.7287T | 0.8267% | WARN |
| aiGDPContribution | 14.2788T | 14.4055T | 0.8874% | WARN |
| totalDemandSpilloverLoss | 96.1326K | 76.3137K | 20.6162% | **FAIL** |
| moneySupply | 66.9490T | 112.8979T | 68.6328% | **FAIL** |
| maxNeutralTransfers | 4.3724T | 10.4397T | 138.7615% | **FAIL** |

**Year 2050**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 78.6138M | 78.6912M | 0.0985% | WARN |
| totalUnemployment | 110.8797M | 110.8023M | 0.0699% | WARN |
| aggregateWageIncome | 4.6725T | 4.7165T | 0.9427% | WARN |
| aggregateAssetIncome | 20.1306T | 19.9439T | 0.9276% | WARN |
| aggregateTransferIncome | 16.1512T | 16.1123T | 0.2411% | WARN |
| totalIncome | 40.9543T | 40.7727T | 0.4435% | WARN |
| gdpNominal | 39.5456T | 39.9311T | 0.9749% | WARN |
| gdpReal | 54.4451T | 66.9283T | 22.9281% | **FAIL** |
| consumption | 18.6678T | 19.0052T | 1.8076% | **FAIL** |
| investment | 12.5727T | 12.6443T | 0.5696% | WARN |
| governmentSpending | 7.6762T | 7.6607T | 0.2019% | WARN |
| consumerWelfareIndex | 68.4119K | 84.7910K | 23.9418% | **FAIL** |
| unrealizedAIOutput | 1.0936T | 942.5767B | 13.8103% | **FAIL** |
| aiGoodsAbsorbed | 8.3554T | 8.5064T | 1.8076% | **FAIL** |
| newJobEmployment | 296.1893K | 353.5930K | 19.3807% | **FAIL** |
| newJobWageIncome | 15.7424B | 18.9529B | 20.3943% | **FAIL** |
| potentialGDP | 63.8941T | 49.3802T | 22.7156% | **FAIL** |
| wageConsumption | 2.4737T | 2.4980T | 0.9817% | WARN |
| assetConsumption | 5.6055T | 5.5401T | 1.1660% | **FAIL** |
| transferConsumption | 18.2395T | 18.2045T | 0.1921% | WARN |
| corporateProfits | 6.4017T | 6.4652T | 0.9927% | WARN |
| aiCorporateProfits | 3.6637T | 3.7014T | 1.0306% | **FAIL** |
| traditionalCorporateProfits | 2.7380T | 2.7638T | 0.9421% | WARN |
| aiGDPContribution | 14.6547T | 14.8058T | 1.0306% | **FAIL** |
| totalDemandSpilloverLoss | 60.1057K | 40.0425K | 33.3798% | **FAIL** |
| moneySupply | 69.5998T | 118.1996T | 69.8275% | **FAIL** |
| maxNeutralTransfers | 4.8635T | 11.9573T | 145.8562% | **FAIL** |

### aggressive_stress

**Year 2026**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 32.1442T | 32.9900T | 2.6313% | **FAIL** |

**Year 2027**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 33.1365T | 34.9033T | 5.3318% | **FAIL** |

**Year 2028**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 33.8511T | 36.5942T | 8.1033% | **FAIL** |

**Year 2029**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 7.1950M | 7.2076M | 0.1748% | WARN |
| aggregateAssetIncome | 7.6107T | 7.6119T | 0.0155% | WARN |
| investment | 6.7233T | 6.7240T | 0.0100% | WARN |
| aiAdditionalOutput | 29.0830B | 30.3379B | 4.3148% | **FAIL** |
| aiInvestmentBoost | 8.7249B | 9.1014B | 4.3148% | **FAIL** |
| aiNetExportBoost | 2.9083B | 3.0338B | 4.3148% | **FAIL** |
| aiConsumerGoodsPotential | 17.4498B | 18.2027B | 4.3148% | **FAIL** |
| aiGoodsAbsorbed | 17.4498B | 18.2027B | 4.3148% | **FAIL** |
| newJobEmployment | 759.6138K | 759.5252K | 0.0117% | WARN |
| potentialGDP | 34.3580T | 38.0751T | 10.8187% | **FAIL** |
| assetConsumption | 2.6637T | 2.6641T | 0.0155% | WARN |
| aiCorporateProfits | 7.2707B | 7.5845B | 4.3148% | **FAIL** |
| aiGDPContribution | 29.0830B | 30.3379B | 4.3148% | **FAIL** |
| maxNeutralTransfers | 27.6808B | 24.8939B | 10.0682% | **FAIL** |

**Year 2030**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 165.1068M | 165.0007M | 0.0643% | WARN |
| totalUnemployment | 9.8457M | 9.9518M | 1.0774% | **FAIL** |
| aggregateWageIncome | 21.9206T | 21.8757T | 0.2046% | WARN |
| aggregateAssetIncome | 8.1697T | 8.1798T | 0.1231% | WARN |
| aggregateTransferIncome | 6.7151T | 6.7028T | 0.1839% | WARN |
| totalIncome | 36.8054T | 36.7582T | 0.1281% | WARN |
| gdpNominal | 38.2822T | 38.1808T | 0.2649% | WARN |
| gdpReal | 34.1555T | 33.8900T | 0.7773% | WARN |
| consumption | 25.9966T | 25.8982T | 0.3784% | WARN |
| investment | 7.0971T | 7.1031T | 0.0842% | WARN |
| governmentSpending | 6.0774T | 6.0670T | 0.1700% | WARN |
| consumerWelfareIndex | 66.8701K | 66.2748K | 0.8902% | WARN |
| aiAdditionalOutput | 370.4354B | 383.3929B | 3.4979% | **FAIL** |
| aiInvestmentBoost | 111.1306B | 115.0179B | 3.4979% | **FAIL** |
| aiNetExportBoost | 37.0435B | 38.3393B | 3.4979% | **FAIL** |
| aiConsumerGoodsPotential | 222.2612B | 230.0358B | 3.4979% | **FAIL** |
| aiGoodsAbsorbed | 222.2612B | 230.0358B | 3.4979% | **FAIL** |
| newJobEmployment | 751.9731K | 751.2403K | 0.0975% | WARN |
| newJobWageIncome | 72.9121B | 72.7530B | 0.2181% | WARN |
| potentialGDP | 34.3777T | 38.4109T | 11.7318% | **FAIL** |
| wageConsumption | 17.4019T | 17.3597T | 0.2427% | WARN |
| assetConsumption | 2.8594T | 2.8629T | 0.1231% | WARN |
| transferConsumption | 6.0436T | 6.0325T | 0.1839% | WARN |
| corporateProfits | 4.2629T | 4.2536T | 0.2191% | WARN |
| aiCorporateProfits | 92.6088B | 95.8482B | 3.4979% | **FAIL** |
| traditionalCorporateProfits | 4.1703T | 4.1577T | 0.3017% | WARN |
| aiGDPContribution | 370.4354B | 383.3929B | 3.4979% | **FAIL** |
| maxNeutralTransfers | 226.8154B | 211.8930B | 6.5791% | **FAIL** |

**Year 2031**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 160.4653M | 160.3604M | 0.0654% | WARN |
| totalUnemployment | 15.1870M | 15.2919M | 0.6909% | WARN |
| aggregateWageIncome | 19.8885T | 19.7930T | 0.4802% | WARN |
| aggregateAssetIncome | 8.7268T | 8.7136T | 0.1509% | WARN |
| aggregateTransferIncome | 6.8177T | 6.8053T | 0.1815% | WARN |
| totalIncome | 35.4330T | 35.3119T | 0.3416% | WARN |
| gdpNominal | 34.7305T | 34.2712T | 1.3225% | **FAIL** |
| gdpReal | 31.4784T | 30.3110T | 3.7088% | **FAIL** |
| consumption | 22.1737T | 21.7550T | 1.8883% | **FAIL** |
| investment | 7.2766T | 7.2458T | 0.4239% | WARN |
| governmentSpending | 6.0851T | 6.0713T | 0.2263% | WARN |
| consumerWelfareIndex | 57.7111K | 55.2521K | 4.2609% | WARN |
| aiAdditionalOutput | 1.2649T | 1.2804T | 1.2247% | **FAIL** |
| aiInvestmentBoost | 379.4642B | 384.1114B | 1.2247% | **FAIL** |
| aiNetExportBoost | 126.4881B | 128.0371B | 1.2247% | **FAIL** |
| aiConsumerGoodsPotential | 758.9284B | 768.2229B | 1.2247% | **FAIL** |
| aiGoodsAbsorbed | 758.9284B | 768.2229B | 1.2247% | **FAIL** |
| newJobEmployment | 711.2252K | 705.0192K | 0.8726% | WARN |
| newJobWageIncome | 65.1799B | 64.3654B | 1.2496% | **FAIL** |
| potentialGDP | 32.2374T | 35.0395T | 8.6921% | **FAIL** |
| wageConsumption | 15.4886T | 15.4083T | 0.5183% | WARN |
| assetConsumption | 3.0544T | 3.0498T | 0.1509% | WARN |
| transferConsumption | 6.1359T | 6.1248T | 0.1815% | WARN |
| corporateProfits | 3.9974T | 3.9491T | 1.2096% | **FAIL** |
| aiCorporateProfits | 316.2202B | 320.0929B | 1.2247% | **FAIL** |
| traditionalCorporateProfits | 3.6812T | 3.6290T | 1.4187% | **FAIL** |
| aiGDPContribution | 1.2649T | 1.2804T | 1.2247% | **FAIL** |
| maxNeutralTransfers | 503.2615B | 583.6528B | 15.9741% | **FAIL** |

**Year 2032**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 151.8567M | 151.8124M | 0.0292% | WARN |
| totalUnemployment | 24.4982M | 24.5425M | 0.1810% | WARN |
| aggregateWageIncome | 15.1007T | 14.8884T | 1.4062% | **FAIL** |
| aggregateAssetIncome | 8.5843T | 8.4539T | 1.5193% | **FAIL** |
| aggregateTransferIncome | 6.9964T | 6.9829T | 0.1935% | WARN |
| totalIncome | 30.6815T | 30.3252T | 1.1613% | **FAIL** |
| gdpNominal | 27.6247T | 26.8354T | 2.8571% | **FAIL** |
| gdpReal | 26.4425T | 24.0504T | 9.0463% | **FAIL** |
| consumption | 15.6224T | 14.9874T | 4.0647% | **FAIL** |
| investment | 6.5998T | 6.4600T | 2.1169% | **FAIL** |
| governmentSpending | 5.9634T | 5.9374T | 0.4364% | WARN |
| consumerWelfareIndex | 42.7699K | 38.4173K | 10.1769% | WARN |
| aiAdditionalOutput | 2.8401T | 2.8430T | 0.1043% | WARN |
| aiInvestmentBoost | 852.0182B | 852.9067B | 0.1043% | WARN |
| aiNetExportBoost | 284.0061B | 284.3022B | 0.1043% | WARN |
| aiConsumerGoodsPotential | 1.7040T | 1.7058T | 0.1043% | WARN |
| unrealizedAIOutput | 443.0359B | 494.8067B | 11.6855% | **FAIL** |
| aiGoodsAbsorbed | 1.2610T | 1.2110T | 3.9646% | **FAIL** |
| newJobEmployment | 598.3211K | 575.9999K | 3.7306% | **FAIL** |
| newJobWageIncome | 44.8840B | 42.6155B | 5.0540% | **FAIL** |
| potentialGDP | 28.1465T | 28.5412T | 1.4024% | **FAIL** |
| wageConsumption | 11.3640T | 11.2023T | 1.4227% | **FAIL** |
| assetConsumption | 3.0045T | 2.9589T | 1.5193% | **FAIL** |
| transferConsumption | 6.2968T | 6.2846T | 0.1935% | WARN |
| corporateProfits | 3.3743T | 3.2806T | 2.7755% | **FAIL** |
| aiCorporateProfits | 599.2562B | 587.0539B | 2.0362% | **FAIL** |
| traditionalCorporateProfits | 2.7750T | 2.6936T | 2.9351% | **FAIL** |
| aiGDPContribution | 2.3970T | 2.3482T | 2.0362% | **FAIL** |
| maxNeutralTransfers | 739.9406B | 1.3468T | 82.0158% | **FAIL** |

**Year 2033**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 123.9480M | 121.1675M | 2.2433% | **FAIL** |
| totalUnemployment | 53.1122M | 55.8928M | 5.2352% | **FAIL** |
| aggregateWageIncome | 6.8537T | 6.2858T | 8.2863% | **FAIL** |
| aggregateAssetIncome | 7.2615T | 7.0188T | 3.3419% | **FAIL** |
| aggregateTransferIncome | 7.5458T | 7.5848T | 0.5168% | WARN |
| totalIncome | 21.6610T | 20.8894T | 3.5621% | **FAIL** |
| gdpNominal | 21.5282T | 20.9327T | 2.7664% | **FAIL** |
| gdpReal | 22.1328T | 19.3211T | 12.7038% | **FAIL** |
| consumption | 9.7182T | 9.2495T | 4.8232% | **FAIL** |
| investment | 6.1898T | 6.0768T | 1.8254% | **FAIL** |
| governmentSpending | 5.7201T | 5.6828T | 0.6525% | WARN |
| consumerWelfareIndex | 28.4621K | 24.3208K | 14.5504% | WARN |
| aiAdditionalOutput | 5.7215T | 5.7643T | 0.7480% | WARN |
| aiInvestmentBoost | 1.7164T | 1.7293T | 0.7480% | WARN |
| aiNetExportBoost | 572.1463B | 576.4261B | 0.7480% | WARN |
| aiConsumerGoodsPotential | 3.4329T | 3.4586T | 0.7480% | WARN |
| unrealizedAIOutput | 1.8526T | 1.9432T | 4.8930% | **FAIL** |
| aiGoodsAbsorbed | 1.5803T | 1.5153T | 4.1112% | **FAIL** |
| newJobEmployment | 422.3348K | 383.0637K | 9.2986% | **FAIL** |
| newJobWageIncome | 18.2658B | 15.5686B | 14.7663% | **FAIL** |
| potentialGDP | 25.5656T | 24.3912T | 4.5938% | **FAIL** |
| wageConsumption | 4.6058T | 4.1748T | 9.3579% | **FAIL** |
| assetConsumption | 2.5415T | 2.4566T | 3.3419% | **FAIL** |
| transferConsumption | 6.7912T | 6.8263T | 0.5168% | WARN |
| corporateProfits | 2.9097T | 2.8375T | 2.4817% | **FAIL** |
| aiCorporateProfits | 967.2162B | 955.2537B | 1.2368% | **FAIL** |
| traditionalCorporateProfits | 1.9425T | 1.8823T | 3.1015% | **FAIL** |
| aiGDPContribution | 3.8689T | 3.8210T | 1.2368% | **FAIL** |
| totalDemandSpilloverLoss | 12.3216M | 14.8220M | 20.2924% | **FAIL** |
| maxNeutralTransfers | 867.9437B | 1.5177T | 74.8612% | **FAIL** |

**Year 2034**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 81.5979M | 79.8014M | 2.2016% | **FAIL** |
| totalUnemployment | 96.1707M | 97.9671M | 1.8680% | **FAIL** |
| aggregateWageIncome | 2.1539T | 2.0087T | 6.7401% | **FAIL** |
| aggregateAssetIncome | 6.0924T | 5.8732T | 3.5979% | **FAIL** |
| aggregateTransferIncome | 8.3725T | 8.3926T | 0.2401% | WARN |
| totalIncome | 16.6188T | 16.2745T | 2.0716% | **FAIL** |
| gdpNominal | 20.2340T | 19.9980T | 1.1664% | **FAIL** |
| gdpReal | 22.6097T | 19.2263T | 14.9643% | **FAIL** |
| consumption | 7.1450T | 7.0253T | 1.6743% | **FAIL** |
| investment | 6.9814T | 6.8812T | 1.4350% | **FAIL** |
| governmentSpending | 5.5114T | 5.4807T | 0.5568% | WARN |
| consumerWelfareIndex | 22.6532K | 19.1643K | 15.4013% | WARN |
| unrealizedAIOutput | 4.4458T | 4.4839T | 0.8565% | WARN |
| aiGoodsAbsorbed | 2.2744T | 2.2363T | 1.6743% | **FAIL** |
| newJobEmployment | 241.0998K | 210.4709K | 12.7038% | **FAIL** |
| newJobWageIncome | 5.4111B | 4.5117B | 16.6211% | **FAIL** |
| potentialGDP | 29.3299T | 26.7182T | 8.9046% | **FAIL** |
| wageConsumption | 1.1879T | 1.0977T | 7.5945% | **FAIL** |
| assetConsumption | 2.1323T | 2.0556T | 3.5979% | **FAIL** |
| transferConsumption | 7.5353T | 7.5534T | 0.2401% | WARN |
| corporateProfits | 3.1714T | 3.1401T | 0.9867% | WARN |
| aiCorporateProfits | 1.6886T | 1.6791T | 0.5638% | WARN |
| traditionalCorporateProfits | 1.4827T | 1.4610T | 1.4684% | **FAIL** |
| aiGDPContribution | 6.7546T | 6.7165T | 0.5638% | WARN |
| totalDemandSpilloverLoss | 25.5948M | 27.3606M | 6.8991% | **FAIL** |
| maxNeutralTransfers | 1.0632T | 1.8082T | 70.0714% | **FAIL** |

**Year 2035**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 63.3194M | 62.6999M | 0.9784% | WARN |
| totalUnemployment | 115.1602M | 115.7797M | 0.5380% | WARN |
| aggregateWageIncome | 1.2528T | 1.2181T | 2.7626% | **FAIL** |
| aggregateAssetIncome | 6.2040T | 6.0847T | 1.9237% | **FAIL** |
| aggregateTransferIncome | 8.7371T | 8.7347T | 0.0285% | WARN |
| totalIncome | 16.1939T | 16.0375T | 0.9661% | WARN |
| gdpNominal | 21.1368T | 20.9872T | 0.7079% | WARN |
| gdpReal | 26.1534T | 21.3952T | 18.1933% | **FAIL** |
| consumption | 6.7058T | 6.5468T | 2.3714% | **FAIL** |
| investment | 8.0350T | 8.0570T | 0.2742% | WARN |
| governmentSpending | 5.4670T | 5.4487T | 0.3361% | WARN |
| consumerWelfareIndex | 23.4490K | 18.8615K | 19.5639% | WARN |
| unrealizedAIOutput | 5.8187T | 5.8829T | 1.1039% | **FAIL** |
| aiGoodsAbsorbed | 2.7086T | 2.6444T | 2.3714% | **FAIL** |
| newJobEmployment | 169.4992K | 144.1348K | 14.9643% | **FAIL** |
| newJobWageIncome | 3.0394B | 2.5403B | 16.4213% | **FAIL** |
| potentialGDP | 34.6807T | 29.5145T | 14.8964% | **FAIL** |
| wageConsumption | 625.6069B | 606.2094B | 3.1006% | **FAIL** |
| assetConsumption | 2.1714T | 2.1296T | 1.9237% | **FAIL** |
| transferConsumption | 7.8634T | 7.8612T | 0.0285% | WARN |
| corporateProfits | 3.5001T | 3.4747T | 0.7272% | WARN |
| aiCorporateProfits | 2.0984T | 2.0823T | 0.7653% | WARN |
| traditionalCorporateProfits | 1.4018T | 1.3924T | 0.6701% | WARN |
| aiGDPContribution | 8.3935T | 8.3293T | 0.7653% | WARN |
| totalDemandSpilloverLoss | 21.8019M | 22.3961M | 2.7252% | **FAIL** |
| maxNeutralTransfers | 1.5450T | 2.5278T | 63.6134% | **FAIL** |

**Year 2036**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 57.9442M | 57.7503M | 0.3346% | WARN |
| totalUnemployment | 121.2493M | 121.4432M | 0.1599% | WARN |
| aggregateWageIncome | 1.1527T | 1.1378T | 1.2931% | **FAIL** |
| aggregateAssetIncome | 7.4128T | 7.2318T | 2.4423% | **FAIL** |
| aggregateTransferIncome | 8.8541T | 8.8434T | 0.1204% | WARN |
| totalIncome | 17.4195T | 17.2129T | 1.1861% | **FAIL** |
| gdpNominal | 22.3860T | 22.1660T | 0.9829% | WARN |
| gdpReal | 31.3677T | 24.4735T | 21.9787% | **FAIL** |
| consumption | 6.8111T | 6.6143T | 2.8897% | **FAIL** |
| investment | 9.0419T | 9.0310T | 0.1203% | WARN |
| governmentSpending | 5.4980T | 5.4825T | 0.2805% | WARN |
| consumerWelfareIndex | 26.8643K | 20.5563K | 23.4812% | WARN |
| aiAdditionalOutput | 15.4925T | 15.4869T | 0.0358% | WARN |
| aiInvestmentBoost | 4.6477T | 4.6461T | 0.0358% | WARN |
| aiNetExportBoost | 1.5492T | 1.5487T | 0.0358% | WARN |
| aiConsumerGoodsPotential | 9.2955T | 9.2922T | 0.0358% | WARN |
| unrealizedAIOutput | 6.2965T | 6.3809T | 1.3400% | **FAIL** |
| aiGoodsAbsorbed | 2.9990T | 2.9113T | 2.9245% | **FAIL** |
| newJobEmployment | 153.2210K | 125.6614K | 17.9868% | **FAIL** |
| newJobWageIncome | 2.6869B | 2.1847B | 18.6903% | **FAIL** |
| potentialGDP | 40.6632T | 31.4581T | 22.6373% | **FAIL** |
| wageConsumption | 557.5250B | 549.7001B | 1.4035% | **FAIL** |
| assetConsumption | 2.5945T | 2.5311T | 2.4423% | **FAIL** |
| transferConsumption | 7.9686T | 7.9591T | 0.1204% | WARN |
| corporateProfits | 3.7499T | 3.7131T | 0.9812% | WARN |
| aiCorporateProfits | 2.2990T | 2.2765T | 0.9779% | WARN |
| traditionalCorporateProfits | 1.4509T | 1.4366T | 0.9864% | WARN |
| aiGDPContribution | 9.1960T | 9.1061T | 0.9779% | WARN |
| totalDemandSpilloverLoss | 15.4358M | 15.7157M | 1.8133% | **FAIL** |
| maxNeutralTransfers | 2.3030T | 3.5778T | 55.3525% | **FAIL** |

**Year 2037**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 54.6762M | 54.3549M | 0.5878% | WARN |
| totalUnemployment | 125.2340M | 125.5554M | 0.2566% | WARN |
| aggregateWageIncome | 1.1104T | 1.0890T | 1.9263% | **FAIL** |
| aggregateAssetIncome | 9.1488T | 8.7226T | 4.6582% | **FAIL** |
| aggregateTransferIncome | 8.9306T | 8.9223T | 0.0920% | WARN |
| totalIncome | 19.1898T | 18.7340T | 2.3751% | **FAIL** |
| gdpNominal | 23.4431T | 23.1416T | 1.2862% | **FAIL** |
| gdpReal | 37.7149T | 28.0834T | 25.5375% | **FAIL** |
| consumption | 7.1691T | 6.9393T | 3.2053% | **FAIL** |
| investment | 9.6328T | 9.5733T | 0.6172% | WARN |
| governmentSpending | 5.5407T | 5.5229T | 0.3218% | WARN |
| consumerWelfareIndex | 32.3353K | 23.6096K | 26.9852% | WARN |
| aiAdditionalOutput | 16.4512T | 16.4533T | 0.0127% | WARN |
| aiInvestmentBoost | 4.9354T | 4.9360T | 0.0127% | WARN |
| aiNetExportBoost | 1.6451T | 1.6453T | 0.0127% | WARN |
| aiConsumerGoodsPotential | 9.8707T | 9.8720T | 0.0127% | WARN |
| unrealizedAIOutput | 6.5188T | 6.6270T | 1.6611% | **FAIL** |
| aiGoodsAbsorbed | 3.3520T | 3.2449T | 3.1930% | **FAIL** |
| newJobEmployment | 153.4901K | 119.6272K | 22.0619% | **FAIL** |
| newJobWageIncome | 2.7081B | 2.0838B | 23.0532% | **FAIL** |
| potentialGDP | 47.5856T | 33.0136T | 30.6228% | **FAIL** |
| wageConsumption | 526.2663B | 515.1563B | 2.1111% | **FAIL** |
| assetConsumption | 3.2021T | 3.0529T | 4.6582% | **FAIL** |
| transferConsumption | 8.0375T | 8.0301T | 0.0920% | WARN |
| corporateProfits | 3.9693T | 3.9212T | 1.2101% | **FAIL** |
| aiCorporateProfits | 2.4831T | 2.4566T | 1.0692% | **FAIL** |
| traditionalCorporateProfits | 1.4862T | 1.4647T | 1.4457% | **FAIL** |
| aiGDPContribution | 9.9325T | 9.8263T | 1.0692% | **FAIL** |
| totalDemandSpilloverLoss | 11.3283M | 11.5731M | 2.1603% | **FAIL** |
| maxNeutralTransfers | 3.1149T | 4.6440T | 49.0928% | **FAIL** |

**Year 2038**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 50.3640M | 49.8832M | 0.9546% | WARN |
| totalUnemployment | 130.2659M | 130.7467M | 0.3691% | WARN |
| aggregateWageIncome | 1.0046T | 977.3620B | 2.7147% | **FAIL** |
| aggregateAssetIncome | 10.1046T | 9.3822T | 7.1493% | **FAIL** |
| aggregateTransferIncome | 9.0272T | 9.0220T | 0.0571% | WARN |
| totalIncome | 20.1364T | 19.3816T | 3.7486% | **FAIL** |
| gdpNominal | 24.3430T | 24.0325T | 1.2752% | **FAIL** |
| gdpReal | 45.5021T | 32.4475T | 28.6903% | **FAIL** |
| consumption | 7.3636T | 7.1137T | 3.3935% | **FAIL** |
| investment | 10.1863T | 10.1312T | 0.5404% | WARN |
| governmentSpending | 5.5769T | 5.5563T | 0.3697% | WARN |
| consumerWelfareIndex | 38.4352K | 26.8199K | 30.2204% | **FAIL** |
| aiAdditionalOutput | 17.8655T | 17.9436T | 0.4368% | WARN |
| aiInvestmentBoost | 5.3597T | 5.3831T | 0.4368% | WARN |
| aiNetExportBoost | 1.7866T | 1.7944T | 0.4368% | WARN |
| aiConsumerGoodsPotential | 10.7193T | 10.7661T | 0.4368% | WARN |
| unrealizedAIOutput | 6.9804T | 7.1384T | 2.2624% | **FAIL** |
| aiGoodsAbsorbed | 3.7389T | 3.6278T | 2.9715% | **FAIL** |
| newJobEmployment | 152.7080K | 113.2267K | 25.8541% | **FAIL** |
| newJobWageIncome | 2.6410B | 1.9238B | 27.1541% | **FAIL** |
| potentialGDP | 56.2215T | 34.7987T | 38.1043% | **FAIL** |
| wageConsumption | 463.5513B | 449.6665B | 2.9953% | **FAIL** |
| assetConsumption | 3.5366T | 3.2838T | 7.1493% | **FAIL** |
| transferConsumption | 8.1245T | 8.1198T | 0.0571% | WARN |
| corporateProfits | 4.2016T | 4.1563T | 1.0788% | **FAIL** |
| aiCorporateProfits | 2.7213T | 2.7013T | 0.7339% | WARN |
| traditionalCorporateProfits | 1.4804T | 1.4550T | 1.7129% | **FAIL** |
| aiGDPContribution | 10.8851T | 10.8052T | 0.7339% | WARN |
| totalDemandSpilloverLoss | 8.7424M | 9.0328M | 3.3218% | **FAIL** |
| maxNeutralTransfers | 4.1067T | 5.8716T | 42.9756% | **FAIL** |

**Year 2039**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 48.8966M | 48.5390M | 0.7313% | WARN |
| totalUnemployment | 132.4558M | 132.8134M | 0.2700% | WARN |
| aggregateWageIncome | 1.0051T | 981.4253B | 2.3537% | **FAIL** |
| aggregateAssetIncome | 10.7747T | 9.8090T | 8.9629% | **FAIL** |
| aggregateTransferIncome | 9.0692T | 9.0617T | 0.0829% | WARN |
| totalIncome | 20.8490T | 19.8521T | 4.7815% | **FAIL** |
| gdpNominal | 24.9894T | 24.6639T | 1.3025% | **FAIL** |
| gdpReal | 54.7569T | 37.3960T | 31.7054% | **FAIL** |
| consumption | 7.5174T | 7.2667T | 3.3340% | **FAIL** |
| investment | 10.5791T | 10.5173T | 0.5842% | WARN |
| governmentSpending | 5.6077T | 5.5868T | 0.3731% | WARN |
| consumerWelfareIndex | 45.8139K | 30.6444K | 33.1111% | **FAIL** |
| aiAdditionalOutput | 18.7743T | 18.7773T | 0.0162% | WARN |
| aiInvestmentBoost | 5.6323T | 5.6332T | 0.0162% | WARN |
| aiNetExportBoost | 1.8774T | 1.8777T | 0.0162% | WARN |
| aiConsumerGoodsPotential | 11.2646T | 11.2664T | 0.0162% | WARN |
| unrealizedAIOutput | 7.2534T | 7.3883T | 1.8601% | **FAIL** |
| aiGoodsAbsorbed | 4.0111T | 3.8780T | 3.3183% | **FAIL** |
| newJobEmployment | 166.7964K | 118.8140K | 28.7671% | **FAIL** |
| newJobWageIncome | 2.9008B | 2.0333B | 29.9047% | **FAIL** |
| potentialGDP | 66.0215T | 35.9303T | 45.5778% | **FAIL** |
| wageConsumption | 459.1330B | 447.3589B | 2.5644% | **FAIL** |
| assetConsumption | 3.7711T | 3.4331T | 8.9629% | **FAIL** |
| transferConsumption | 8.1623T | 8.1555T | 0.0829% | WARN |
| corporateProfits | 4.3618T | 4.3075T | 1.2442% | **FAIL** |
| aiCorporateProfits | 2.8802T | 2.8472T | 1.1448% | **FAIL** |
| traditionalCorporateProfits | 1.4815T | 1.4602T | 1.4375% | **FAIL** |
| aiGDPContribution | 11.5208T | 11.3890T | 1.1448% | **FAIL** |
| totalDemandSpilloverLoss | 7.0322M | 7.3060M | 3.8923% | **FAIL** |
| maxNeutralTransfers | 5.2692T | 7.2108T | 36.8498% | **FAIL** |

**Year 2040**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 48.5905M | 48.2542M | 0.6919% | WARN |
| totalUnemployment | 133.4874M | 133.8236M | 0.2519% | WARN |
| aggregateWageIncome | 1.0233T | 999.4491B | 2.3271% | **FAIL** |
| aggregateAssetIncome | 11.2822T | 10.0972T | 10.5031% | **FAIL** |
| aggregateTransferIncome | 9.0890T | 9.0811T | 0.0873% | WARN |
| totalIncome | 21.3945T | 20.1778T | 5.6871% | **FAIL** |
| gdpNominal | 25.2783T | 24.9573T | 1.2697% | **FAIL** |
| gdpReal | 65.4599T | 42.8551T | 34.5324% | **FAIL** |
| consumption | 7.6346T | 7.3938T | 3.1544% | **FAIL** |
| investment | 10.7181T | 10.6515T | 0.6217% | WARN |
| governmentSpending | 5.6299T | 5.6084T | 0.3809% | WARN |
| consumerWelfareIndex | 54.7683K | 35.1710K | 35.7821% | **FAIL** |
| unrealizedAIOutput | 7.2914T | 7.4218T | 1.7884% | **FAIL** |
| aiGoodsAbsorbed | 4.1306T | 4.0004T | 3.1531% | **FAIL** |
| newJobEmployment | 191.8959K | 131.0351K | 31.7155% | **FAIL** |
| newJobWageIncome | 3.3757B | 2.2684B | 32.8033% | **FAIL** |
| potentialGDP | 76.8819T | 36.3795T | 52.6814% | **FAIL** |
| wageConsumption | 466.0278B | 454.2602B | 2.5251% | **FAIL** |
| assetConsumption | 3.9488T | 3.5340T | 10.5031% | **FAIL** |
| transferConsumption | 8.1801T | 8.1730T | 0.0873% | WARN |
| corporateProfits | 4.4249T | 4.3714T | 1.2096% | **FAIL** |
| aiCorporateProfits | 2.9363T | 2.9038T | 1.1080% | **FAIL** |
| traditionalCorporateProfits | 1.4886T | 1.4676T | 1.4101% | **FAIL** |
| aiGDPContribution | 11.7453T | 11.6151T | 1.1080% | **FAIL** |
| totalDemandSpilloverLoss | 6.1042M | 6.3747M | 4.4323% | **FAIL** |
| maxNeutralTransfers | 6.6439T | 8.7181T | 31.2194% | **FAIL** |

**Year 2041**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 48.5435M | 48.2028M | 0.7019% | WARN |
| totalUnemployment | 134.2627M | 134.6034M | 0.2538% | WARN |
| aggregateWageIncome | 1.0303T | 1.0066T | 2.2981% | **FAIL** |
| aggregateAssetIncome | 11.6113T | 10.2418T | 11.7944% | **FAIL** |
| aggregateTransferIncome | 9.1039T | 9.0961T | 0.0862% | WARN |
| totalIncome | 21.7455T | 20.3445T | 6.4427% | **FAIL** |
| gdpNominal | 25.3974T | 25.0980T | 1.1788% | **FAIL** |
| gdpReal | 78.0798T | 49.0186T | 37.2198% | **FAIL** |
| consumption | 7.7136T | 7.4891T | 2.9105% | **FAIL** |
| investment | 10.7397T | 10.6782T | 0.5721% | WARN |
| governmentSpending | 5.6398T | 5.6185T | 0.3774% | WARN |
| consumerWelfareIndex | 65.4319K | 40.3584K | 38.3199% | **FAIL** |
| unrealizedAIOutput | 7.3083T | 7.4309T | 1.6775% | **FAIL** |
| aiGoodsAbsorbed | 4.2078T | 4.0854T | 2.9088% | **FAIL** |
| newJobEmployment | 224.8219K | 147.1591K | 34.5442% | **FAIL** |
| newJobWageIncome | 3.9647B | 2.5546B | 35.5679% | **FAIL** |
| potentialGDP | 89.5959T | 36.6143T | 59.1339% | **FAIL** |
| wageConsumption | 468.5559B | 456.8499B | 2.4983% | **FAIL** |
| assetConsumption | 4.0639T | 3.5846T | 11.7944% | **FAIL** |
| transferConsumption | 8.1935T | 8.1865T | 0.0862% | WARN |
| corporateProfits | 4.4576T | 4.4076T | 1.1228% | **FAIL** |
| aiCorporateProfits | 2.9713T | 2.9407T | 1.0287% | **FAIL** |
| traditionalCorporateProfits | 1.4863T | 1.4669T | 1.3108% | **FAIL** |
| aiGDPContribution | 11.8852T | 11.7629T | 1.0287% | **FAIL** |
| totalDemandSpilloverLoss | 5.7485M | 6.0058M | 4.4753% | **FAIL** |
| maxNeutralTransfers | 8.1515T | 10.2366T | 25.5791% | **FAIL** |

**Year 2042**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 48.3272M | 47.9835M | 0.7112% | WARN |
| totalUnemployment | 135.2102M | 135.5539M | 0.2542% | WARN |
| aggregateWageIncome | 1.0239T | 1.0013T | 2.2064% | **FAIL** |
| aggregateAssetIncome | 11.8495T | 10.3209T | 12.8997% | **FAIL** |
| aggregateTransferIncome | 9.1221T | 9.1143T | 0.0854% | WARN |
| totalIncome | 21.9955T | 20.4365T | 7.0875% | **FAIL** |
| gdpNominal | 25.4947T | 25.2188T | 1.0821% | **FAIL** |
| gdpReal | 93.2474T | 56.1436T | 39.7907% | **FAIL** |
| consumption | 7.7737T | 7.5647T | 2.6890% | **FAIL** |
| investment | 10.7625T | 10.7089T | 0.4982% | WARN |
| governmentSpending | 5.6438T | 5.6233T | 0.3641% | WARN |
| consumerWelfareIndex | 78.1380K | 46.2821K | 40.7688% | **FAIL** |
| unrealizedAIOutput | 7.3255T | 7.4405T | 1.5690% | **FAIL** |
| aiGoodsAbsorbed | 4.2697T | 4.1549T | 2.6872% | **FAIL** |
| newJobEmployment | 263.1389K | 165.1687K | 37.2314% | **FAIL** |
| newJobWageIncome | 4.6145B | 2.8537B | 38.1573% | **FAIL** |
| potentialGDP | 104.8426T | 36.8142T | 64.8863% | **FAIL** |
| wageConsumption | 464.4922B | 453.3062B | 2.4082% | **FAIL** |
| assetConsumption | 4.1473T | 3.6123T | 12.8997% | **FAIL** |
| transferConsumption | 8.2099T | 8.2029T | 0.0854% | WARN |
| corporateProfits | 4.4844T | 4.4380T | 1.0345% | **FAIL** |
| aiCorporateProfits | 2.9999T | 2.9713T | 0.9550% | WARN |
| traditionalCorporateProfits | 1.4844T | 1.4667T | 1.1952% | **FAIL** |
| aiGDPContribution | 11.9998T | 11.8852T | 0.9550% | WARN |
| totalDemandSpilloverLoss | 5.6122M | 5.8520M | 4.2741% | **FAIL** |
| maxNeutralTransfers | 9.8606T | 11.8757T | 20.4365% | **FAIL** |

**Year 2043**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 47.5765M | 47.2273M | 0.7341% | WARN |
| totalUnemployment | 136.6950M | 137.0443M | 0.2555% | WARN |
| aggregateWageIncome | 998.3134B | 977.1095B | 2.1240% | **FAIL** |
| aggregateAssetIncome | 12.0907T | 10.4128T | 13.8773% | **FAIL** |
| aggregateTransferIncome | 9.1506T | 9.1429T | 0.0839% | WARN |
| totalIncome | 22.2396T | 20.5329T | 7.6743% | **FAIL** |
| gdpNominal | 25.6315T | 25.3702T | 1.0195% | **FAIL** |
| gdpReal | 112.1138T | 64.7065T | 42.2850% | **FAIL** |
| consumption | 7.8300T | 7.6302T | 2.5519% | **FAIL** |
| investment | 10.8239T | 10.7754T | 0.4483% | WARN |
| governmentSpending | 5.6472T | 5.6274T | 0.3496% | WARN |
| consumerWelfareIndex | 93.7476K | 53.2688K | 43.1785% | **FAIL** |
| unrealizedAIOutput | 7.3630T | 7.4740T | 1.5074% | **FAIL** |
| aiGoodsAbsorbed | 4.3409T | 4.2302T | 2.5491% | **FAIL** |
| newJobEmployment | 303.6909K | 182.8106K | 39.8037% | **FAIL** |
| newJobWageIncome | 5.2547B | 3.1194B | 40.6362% | **FAIL** |
| potentialGDP | 123.8177T | 37.0744T | 70.0573% | **FAIL** |
| wageConsumption | 450.3333B | 439.8424B | 2.3296% | **FAIL** |
| assetConsumption | 4.2317T | 3.6445T | 13.8773% | **FAIL** |
| transferConsumption | 8.2356T | 8.2286T | 0.0839% | WARN |
| corporateProfits | 4.5196T | 4.4753T | 0.9781% | WARN |
| aiCorporateProfits | 3.0359T | 3.0083T | 0.9094% | WARN |
| traditionalCorporateProfits | 1.4837T | 1.4671T | 1.1187% | **FAIL** |
| aiGDPContribution | 12.1435T | 12.0330T | 0.9094% | WARN |
| totalDemandSpilloverLoss | 5.5354M | 5.7570M | 4.0037% | **FAIL** |
| maxNeutralTransfers | 12.2068T | 14.0928T | 15.4507% | **FAIL** |

**Year 2044**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 46.7502M | 46.3876M | 0.7756% | WARN |
| totalUnemployment | 138.2585M | 138.6211M | 0.2623% | WARN |
| aggregateWageIncome | 971.4169B | 951.0015B | 2.1016% | **FAIL** |
| aggregateAssetIncome | 12.3451T | 10.5189T | 14.7925% | **FAIL** |
| aggregateTransferIncome | 9.1806T | 9.1732T | 0.0809% | WARN |
| totalIncome | 22.4971T | 20.6431T | 8.2410% | **FAIL** |
| gdpNominal | 25.8055T | 25.5473T | 1.0006% | **FAIL** |
| gdpReal | 135.9708T | 75.1726T | 44.7142% | **FAIL** |
| consumption | 7.8888T | 7.6909T | 2.5081% | **FAIL** |
| investment | 10.9161T | 10.8686T | 0.4352% | WARN |
| governmentSpending | 5.6519T | 5.6326T | 0.3405% | WARN |
| consumerWelfareIndex | 113.3240K | 61.6981K | 45.5560% | **FAIL** |
| unrealizedAIOutput | 7.4122T | 7.5233T | 1.4986% | **FAIL** |
| aiGoodsAbsorbed | 4.4223T | 4.3114T | 2.5060% | **FAIL** |
| newJobEmployment | 351.6250K | 202.9172K | 42.2916% | **FAIL** |
| newJobWageIncome | 6.0049B | 3.4193B | 43.0587% | **FAIL** |
| potentialGDP | 147.8052T | 37.3820T | 74.7086% | **FAIL** |
| wageConsumption | 435.5314B | 425.4463B | 2.3156% | **FAIL** |
| assetConsumption | 4.3208T | 3.6816T | 14.7925% | **FAIL** |
| transferConsumption | 8.2626T | 8.2559T | 0.0809% | WARN |
| corporateProfits | 4.5623T | 4.5184T | 0.9621% | WARN |
| aiCorporateProfits | 3.0780T | 3.0503T | 0.8987% | WARN |
| traditionalCorporateProfits | 1.4843T | 1.4681T | 1.0935% | **FAIL** |
| aiGDPContribution | 12.3119T | 12.2012T | 0.8987% | WARN |
| totalDemandSpilloverLoss | 5.4509M | 5.6613M | 3.8601% | **FAIL** |
| maxNeutralTransfers | 15.3930T | 17.0225T | 10.5864% | **FAIL** |

**Year 2045**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 46.8040M | 46.4067M | 0.8489% | WARN |
| totalUnemployment | 138.9447M | 139.3420M | 0.2859% | WARN |
| aggregateWageIncome | 973.7784B | 952.6579B | 2.1689% | **FAIL** |
| aggregateAssetIncome | 12.5607T | 10.5991T | 15.6168% | **FAIL** |
| aggregateTransferIncome | 9.1938T | 9.1870T | 0.0735% | WARN |
| totalIncome | 22.7283T | 20.7388T | 8.7532% | **FAIL** |
| gdpNominal | 25.9564T | 25.6987T | 0.9930% | WARN |
| gdpReal | 164.8583T | 87.4151T | 46.9756% | **FAIL** |
| consumption | 7.9462T | 7.7507T | 2.4606% | **FAIL** |
| investment | 10.9946T | 10.9453T | 0.4490% | WARN |
| governmentSpending | 5.6578T | 5.6387T | 0.3382% | WARN |
| consumerWelfareIndex | 137.0486K | 71.5920K | 47.7616% | **FAIL** |
| unrealizedAIOutput | 7.4290T | 7.5394T | 1.4856% | **FAIL** |
| aiGoodsAbsorbed | 4.4841T | 4.3738T | 2.4603% | **FAIL** |
| newJobEmployment | 421.9153K | 233.2562K | 44.7149% | **FAIL** |
| newJobWageIncome | 7.2052B | 3.9301B | 45.4543% | **FAIL** |
| potentialGDP | 176.7714T | 37.6118T | 78.7229% | **FAIL** |
| wageConsumption | 436.2411B | 425.7605B | 2.4025% | **FAIL** |
| assetConsumption | 4.3963T | 3.7097T | 15.6168% | **FAIL** |
| transferConsumption | 8.2744T | 8.2683T | 0.0735% | WARN |
| corporateProfits | 4.5949T | 4.5511T | 0.9531% | WARN |
| aiCorporateProfits | 3.1065T | 3.0790T | 0.8876% | WARN |
| traditionalCorporateProfits | 1.4883T | 1.4721T | 1.0898% | **FAIL** |
| aiGDPContribution | 12.4261T | 12.3158T | 0.8876% | WARN |
| totalDemandSpilloverLoss | 5.3471M | 5.5553M | 3.8940% | **FAIL** |
| maxNeutralTransfers | 18.8689T | 20.0104T | 6.0495% | **FAIL** |

**Year 2046**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 47.1021M | 46.6536M | 0.9522% | WARN |
| totalUnemployment | 139.3895M | 139.8381M | 0.3218% | WARN |
| aggregateWageIncome | 980.6310B | 958.2056B | 2.2868% | **FAIL** |
| aggregateAssetIncome | 12.7393T | 10.6645T | 16.2866% | **FAIL** |
| aggregateTransferIncome | 9.2023T | 9.1966T | 0.0628% | WARN |
| totalIncome | 22.9223T | 20.8193T | 9.1745% | **FAIL** |
| gdpNominal | 26.0755T | 25.8219T | 0.9726% | WARN |
| gdpReal | 199.7774T | 101.6088T | 49.1390% | **FAIL** |
| consumption | 7.9941T | 7.8030T | 2.3902% | **FAIL** |
| investment | 11.0529T | 11.0032T | 0.4500% | WARN |
| governmentSpending | 5.6630T | 5.6439T | 0.3377% | WARN |
| consumerWelfareIndex | 165.6517K | 83.0460K | 49.8671% | **FAIL** |
| unrealizedAIOutput | 7.4449T | 7.5535T | 1.4587% | **FAIL** |
| aiGoodsAbsorbed | 4.5372T | 4.4289T | 2.3882% | **FAIL** |
| newJobEmployment | 510.0793K | 270.4629K | 46.9763% | **FAIL** |
| newJobWageIncome | 8.7312B | 4.5661B | 47.7037% | **FAIL** |
| potentialGDP | 211.7595T | 37.8042T | 82.1476% | **FAIL** |
| wageConsumption | 439.6026B | 428.3973B | 2.5490% | **FAIL** |
| assetConsumption | 4.4587T | 3.7326T | 16.2866% | **FAIL** |
| transferConsumption | 8.2821T | 8.2769T | 0.0628% | WARN |
| corporateProfits | 4.6218T | 4.5788T | 0.9314% | WARN |
| aiCorporateProfits | 3.1313T | 3.1043T | 0.8638% | WARN |
| traditionalCorporateProfits | 1.4905T | 1.4745T | 1.0732% | **FAIL** |
| aiGDPContribution | 12.5253T | 12.4171T | 0.8638% | WARN |
| totalDemandSpilloverLoss | 5.2557M | 5.4642M | 3.9671% | **FAIL** |
| maxNeutralTransfers | 22.9514T | 23.3471T | 1.7244% | **FAIL** |

**Year 2047**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 47.4603M | 46.9506M | 1.0740% | **FAIL** |
| totalUnemployment | 139.7773M | 140.2870M | 0.3647% | WARN |
| aggregateWageIncome | 989.8490B | 965.9741B | 2.4120% | **FAIL** |
| aggregateAssetIncome | 12.8848T | 10.7149T | 16.8410% | **FAIL** |
| aggregateTransferIncome | 9.2098T | 9.2052T | 0.0499% | WARN |
| totalIncome | 23.0845T | 20.8861T | 9.5233% | **FAIL** |
| gdpNominal | 26.1772T | 25.9301T | 0.9441% | WARN |
| gdpReal | 241.9824T | 118.0616T | 51.2107% | **FAIL** |
| consumption | 8.0350T | 7.8489T | 2.3156% | **FAIL** |
| investment | 11.1017T | 11.0534T | 0.4349% | WARN |
| governmentSpending | 5.6671T | 5.6481T | 0.3349% | WARN |
| consumerWelfareIndex | 200.0890K | 96.2705K | 51.8862% | **FAIL** |
| unrealizedAIOutput | 7.4620T | 7.5682T | 1.4229% | **FAIL** |
| aiGoodsAbsorbed | 4.5852T | 4.4790T | 2.3156% | **FAIL** |
| newJobEmployment | 617.6426K | 314.1391K | 49.1390% | **FAIL** |
| newJobWageIncome | 10.5927B | 5.3121B | 49.8519% | **FAIL** |
| potentialGDP | 254.0296T | 37.9773T | 85.0501% | **FAIL** |
| wageConsumption | 444.1837B | 432.1553B | 2.7080% | **FAIL** |
| assetConsumption | 4.5097T | 3.7502T | 16.8410% | **FAIL** |
| transferConsumption | 8.2888T | 8.2847T | 0.0499% | WARN |
| corporateProfits | 4.6458T | 4.6038T | 0.9051% | WARN |
| aiCorporateProfits | 3.1542T | 3.1276T | 0.8415% | WARN |
| traditionalCorporateProfits | 1.4917T | 1.4762T | 1.0396% | **FAIL** |
| aiGDPContribution | 12.6167T | 12.5105T | 0.8415% | WARN |
| totalDemandSpilloverLoss | 5.1886M | 5.3948M | 3.9740% | **FAIL** |
| maxNeutralTransfers | 27.8332T | 27.1592T | 2.4213% | **FAIL** |

**Year 2048**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 47.8499M | 47.2649M | 1.2226% | **FAIL** |
| totalUnemployment | 140.1367M | 140.7217M | 0.4175% | WARN |
| aggregateWageIncome | 999.3313B | 973.7314B | 2.5617% | **FAIL** |
| aggregateAssetIncome | 13.0081T | 10.7578T | 17.2994% | **FAIL** |
| aggregateTransferIncome | 9.2167T | 9.2135T | 0.0342% | WARN |
| totalIncome | 23.2242T | 20.9451T | 9.8134% | **FAIL** |
| gdpNominal | 26.2623T | 26.0217T | 0.9159% | WARN |
| gdpReal | 292.9148T | 137.0900T | 53.1980% | **FAIL** |
| consumption | 8.0707T | 7.8895T | 2.2457% | **FAIL** |
| investment | 11.1420T | 11.0954T | 0.4177% | WARN |
| governmentSpending | 5.6705T | 5.6518T | 0.3308% | WARN |
| consumerWelfareIndex | 241.5271K | 111.5225K | 53.8261% | **FAIL** |
| unrealizedAIOutput | 7.4715T | 7.5753T | 1.3898% | **FAIL** |
| aiGoodsAbsorbed | 4.6241T | 4.5202T | 2.2457% | **FAIL** |
| newJobEmployment | 748.0764K | 364.9815K | 51.2107% | **FAIL** |
| newJobWageIncome | 12.8501B | 6.1795B | 51.9108% | **FAIL** |
| potentialGDP | 305.0104T | 38.1173T | 87.5029% | **FAIL** |
| wageConsumption | 448.9697B | 435.9532B | 2.8992% | **FAIL** |
| assetConsumption | 4.5528T | 3.7652T | 17.2994% | **FAIL** |
| transferConsumption | 8.2950T | 8.2922T | 0.0342% | WARN |
| corporateProfits | 4.6651T | 4.6241T | 0.8788% | WARN |
| aiCorporateProfits | 3.1719T | 3.1460T | 0.8184% | WARN |
| traditionalCorporateProfits | 1.4932T | 1.4782T | 1.0069% | **FAIL** |
| aiGDPContribution | 12.6878T | 12.5839T | 0.8184% | WARN |
| totalDemandSpilloverLoss | 5.1356M | 5.3375M | 3.9319% | **FAIL** |
| maxNeutralTransfers | 33.6926T | 31.5376T | 6.3960% | **FAIL** |

**Year 2049**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 48.2574M | 47.5782M | 1.4074% | **FAIL** |
| totalUnemployment | 140.4811M | 141.1603M | 0.4835% | WARN |
| aggregateWageIncome | 1.0086T | 980.7615B | 2.7561% | **FAIL** |
| aggregateAssetIncome | 13.1125T | 10.7950T | 17.6735% | **FAIL** |
| aggregateTransferIncome | 9.2233T | 9.2220T | 0.0146% | WARN |
| totalIncome | 23.3444T | 20.9978T | 10.0520% | **FAIL** |
| gdpNominal | 26.3396T | 26.1051T | 0.8903% | WARN |
| gdpReal | 354.4604T | 159.1330T | 55.1055% | **FAIL** |
| consumption | 8.1019T | 7.9253T | 2.1795% | **FAIL** |
| investment | 11.1792T | 11.1339T | 0.4046% | WARN |
| governmentSpending | 5.6735T | 5.6549T | 0.3266% | WARN |
| consumerWelfareIndex | 291.3772K | 129.1106K | 55.6896% | **FAIL** |
| unrealizedAIOutput | 7.4835T | 7.5851T | 1.3573% | **FAIL** |
| aiGoodsAbsorbed | 4.6605T | 4.5590T | 2.1795% | **FAIL** |
| newJobEmployment | 905.5044K | 423.7943K | 53.1980% | **FAIL** |
| newJobWageIncome | 15.5711B | 7.1795B | 53.8924% | **FAIL** |
| potentialGDP | 366.6044T | 38.2491T | 89.5667% | **FAIL** |
| wageConsumption | 453.6923B | 439.4237B | 3.1450% | **FAIL** |
| assetConsumption | 4.5894T | 3.7783T | 17.6735% | **FAIL** |
| transferConsumption | 8.3010T | 8.2998T | 0.0146% | WARN |
| corporateProfits | 4.6833T | 4.6433T | 0.8544% | WARN |
| aiCorporateProfits | 3.1891T | 3.1637T | 0.7963% | WARN |
| traditionalCorporateProfits | 1.4941T | 1.4795T | 0.9785% | WARN |
| aiGDPContribution | 12.7565T | 12.6550T | 0.7963% | WARN |
| totalDemandSpilloverLoss | 5.0935M | 5.2910M | 3.8766% | **FAIL** |
| maxNeutralTransfers | 40.7725T | 36.6092T | 10.2111% | **FAIL** |

**Year 2050**

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalEmployment | 48.6928M | 47.8956M | 1.6372% | **FAIL** |
| totalUnemployment | 140.8007M | 141.5979M | 0.5662% | WARN |
| aggregateWageIncome | 1.0182T | 987.5175B | 3.0091% | **FAIL** |
| aggregateAssetIncome | 13.2034T | 10.8283T | 17.9890% | **FAIL** |
| totalIncome | 23.4510T | 21.0461T | 10.2549% | **FAIL** |
| gdpNominal | 26.4140T | 26.1848T | 0.8680% | WARN |
| gdpReal | 428.8883T | 184.6929T | 56.9368% | **FAIL** |
| consumption | 8.1298T | 7.9573T | 2.1216% | **FAIL** |
| investment | 11.2168T | 11.1727T | 0.3939% | WARN |
| governmentSpending | 5.6761T | 5.6578T | 0.3229% | WARN |
| consumerWelfareIndex | 351.3720K | 149.3985K | 57.4814% | **FAIL** |
| unrealizedAIOutput | 7.4973T | 7.5969T | 1.3287% | **FAIL** |
| aiGoodsAbsorbed | 4.6953T | 4.5957T | 2.1216% | **FAIL** |
| newJobEmployment | 1.0957M | 491.9305K | 55.1055% | **FAIL** |
| newJobWageIncome | 18.8612B | 8.3360B | 55.8035% | **FAIL** |
| potentialGDP | 441.0809T | 38.3774T | 91.2992% | **FAIL** |
| wageConsumption | 458.6602B | 442.7816B | 3.4620% | **FAIL** |
| assetConsumption | 4.6212T | 3.7899T | 17.9890% | **FAIL** |
| corporateProfits | 4.7009T | 4.6617T | 0.8332% | WARN |
| aiCorporateProfits | 3.2059T | 3.1810T | 0.7768% | WARN |
| traditionalCorporateProfits | 1.4949T | 1.4807T | 0.9541% | WARN |
| aiGDPContribution | 12.8237T | 12.7241T | 0.7768% | WARN |
| totalDemandSpilloverLoss | 5.0578M | 5.2512M | 3.8236% | **FAIL** |
| maxNeutralTransfers | 49.3341T | 42.4897T | 13.8737% | **FAIL** |

## Invariant Checks Summary

- **zero_displacement**: 911 passed, 0 failed (911 total)
- **displacement_no_policy**: 859 passed, 0 failed (859 total)
- **ubi_only**: 860 passed, 0 failed (860 total)
- **ubi_phased**: 902 passed, 0 failed (902 total)
- **ai_fund_only**: 890 passed, 0 failed (890 total)
- **min_wage_only**: 878 passed, 0 failed (878 total)
- **all_policies**: 860 passed, 0 failed (860 total)
- **aggressive_stress**: 860 passed, 0 failed (860 total)
- **aggressive_vs_conservative**: 1 passed, 0 failed (1 total)
- **ubi_vs_no_policy**: 16 passed, 0 failed (16 total)

## Extreme Value Sweep Summary

- **baselineGDPGrowth**: PASS (3 checks)
- **baseInflationRate**: PASS (3 checks)
- **mpcWage**: PASS (3 checks)
- **mpcAsset**: PASS (3 checks)
- **mpcTransfer**: PASS (2 checks)
- **profitRealizationSensitivity**: PASS (3 checks)
- **okunCoefficient**: PASS (3 checks)
- **revenuePressureSensitivity**: PASS (2 checks)
- **revenuePressureCap**: PASS (2 checks)
- **revenuePressureDecay**: PASS (2 checks)
- **aiWageProductivityMultiplier**: PASS (2 checks)
- **innovationRate_multiplier**: PASS (3 checks)
- **rdMultiplier**: PASS (2 checks)
- **newJobDurabilityFactor**: PASS (2 checks)
- **aiProfitMargin**: PASS (3 checks)
- **traditionalProfitMargin**: PASS (2 checks)
- **generative_ceiling**: PASS (2 checks)
- **agentic_ceiling**: PASS (2 checks)
- **embodied_ceiling**: PASS (2 checks)
- **generative_steepness**: PASS (2 checks)
- **creditSensitivity**: PASS (2 checks)
- **demandSensitivity**: PASS (2 checks)
- **populationGrowthRate**: PASS (3 checks)
- **bottom80WageShare**: PASS (2 checks)
- **bottom80TransferShare**: PASS (2 checks)
- **ai_profit_99pct_full_automation**: PASS (1 checks)
- **credit_sensitivity_1_high_ue**: PASS (1 checks)
- **zero_mpc_all**: PASS (1 checks)
- **max_mpc_all**: PASS (1 checks)
- **negative_gdp_growth_high_inflation**: PASS (1 checks)
- **extreme_revenue_pressure**: PASS (1 checks)
- **zero_innovation_full_automation**: PASS (1 checks)
- **max_ubi_no_funding**: PASS (1 checks)
- **all_ceilings_zero_with_policies**: PASS (1 checks)
- **extreme_deflation_sensitivity**: PASS (1 checks)

---
*Report generated by ATLAS Verification Audit v1.0*
