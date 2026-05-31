# Scenario: Aggressive Stress

> Fast S-curves (mid 2028/2031/2035, ceilings 1.0), no policy.

Generated: 2026-02-23T20:50:03.899Z

## Summary

| Metric | Value |
|--------|------:|
| Total field comparisons | 1846 |
| PASS (<0.01% error) | 1258 |
| WARN (0.01-1% error) | 218 |
| FAIL (>1% error) | 370 |
| Invariant checks | 860 (860 pass, 0 fail) |
| Worst field | cwiAcceleration (297.4034%) |

## Field Comparison Failures

370 fields exceed 1% relative error.

| Year | Field | Expected | Actual | Error |
|-----:|-------|----------|--------|------:|
| 2026 | potentialGDP | 32.1442T | 32.9900T | 2.6313% |
| 2027 | potentialGDP | 33.1365T | 34.9033T | 5.3318% |
| 2028 | potentialGDP | 33.8511T | 36.5942T | 8.1033% |
| 2029 | aiAdditionalOutput | 29.0830B | 30.3379B | 4.3148% |
| 2029 | aiInvestmentBoost | 8.7249B | 9.1014B | 4.3148% |
| 2029 | aiNetExportBoost | 2.9083B | 3.0338B | 4.3148% |
| 2029 | aiConsumerGoodsPotential | 17.4498B | 18.2027B | 4.3148% |
| 2029 | aiGoodsAbsorbed | 17.4498B | 18.2027B | 4.3148% |
| 2029 | potentialGDP | 34.3580T | 38.0751T | 10.8187% |
| 2029 | aiCorporateProfits | 7.2707B | 7.5845B | 4.3148% |
| 2029 | aiGDPContribution | 29.0830B | 30.3379B | 4.3148% |
| 2029 | maxNeutralTransfers | 27.6808B | 24.8939B | 10.0682% |
| 2030 | totalUnemployment | 9.8457M | 9.9518M | 1.0774% |
| 2030 | aiAdditionalOutput | 370.4354B | 383.3929B | 3.4979% |
| 2030 | aiInvestmentBoost | 111.1306B | 115.0179B | 3.4979% |
| 2030 | aiNetExportBoost | 37.0435B | 38.3393B | 3.4979% |
| 2030 | aiConsumerGoodsPotential | 222.2612B | 230.0358B | 3.4979% |
| 2030 | aiGoodsAbsorbed | 222.2612B | 230.0358B | 3.4979% |
| 2030 | potentialGDP | 34.3777T | 38.4109T | 11.7318% |
| 2030 | aiCorporateProfits | 92.6088B | 95.8482B | 3.4979% |
| 2030 | aiGDPContribution | 370.4354B | 383.3929B | 3.4979% |
| 2030 | maxNeutralTransfers | 226.8154B | 211.8930B | 6.5791% |
| 2031 | gdpNominal | 34.7305T | 34.2712T | 1.3225% |
| 2031 | gdpReal | 31.4784T | 30.3110T | 3.7088% |
| 2031 | consumption | 22.1737T | 21.7550T | 1.8883% |
| 2031 | aiAdditionalOutput | 1.2649T | 1.2804T | 1.2247% |
| 2031 | aiInvestmentBoost | 379.4642B | 384.1114B | 1.2247% |
| 2031 | aiNetExportBoost | 126.4881B | 128.0371B | 1.2247% |
| 2031 | aiConsumerGoodsPotential | 758.9284B | 768.2229B | 1.2247% |
| 2031 | aiGoodsAbsorbed | 758.9284B | 768.2229B | 1.2247% |
| 2031 | newJobWageIncome | 65.1799B | 64.3654B | 1.2496% |
| 2031 | potentialGDP | 32.2374T | 35.0395T | 8.6921% |
| 2031 | corporateProfits | 3.9974T | 3.9491T | 1.2096% |
| 2031 | aiCorporateProfits | 316.2202B | 320.0929B | 1.2247% |
| 2031 | traditionalCorporateProfits | 3.6812T | 3.6290T | 1.4187% |
| 2031 | aiGDPContribution | 1.2649T | 1.2804T | 1.2247% |
| 2031 | maxNeutralTransfers | 503.2615B | 583.6528B | 15.9741% |
| 2032 | aggregateWageIncome | 15.1007T | 14.8884T | 1.4062% |
| 2032 | aggregateAssetIncome | 8.5843T | 8.4539T | 1.5193% |
| 2032 | totalIncome | 30.6815T | 30.3252T | 1.1613% |
| 2032 | gdpNominal | 27.6247T | 26.8354T | 2.8571% |
| 2032 | gdpReal | 26.4425T | 24.0504T | 9.0463% |
| 2032 | consumption | 15.6224T | 14.9874T | 4.0647% |
| 2032 | investment | 6.5998T | 6.4600T | 2.1169% |
| 2032 | unrealizedAIOutput | 443.0359B | 494.8067B | 11.6855% |
| 2032 | aiGoodsAbsorbed | 1.2610T | 1.2110T | 3.9646% |
| 2032 | newJobEmployment | 598.3211K | 575.9999K | 3.7306% |
| 2032 | newJobWageIncome | 44.8840B | 42.6155B | 5.0540% |
| 2032 | potentialGDP | 28.1465T | 28.5412T | 1.4024% |
| 2032 | wageConsumption | 11.3640T | 11.2023T | 1.4227% |
| 2032 | assetConsumption | 3.0045T | 2.9589T | 1.5193% |
| 2032 | corporateProfits | 3.3743T | 3.2806T | 2.7755% |
| 2032 | aiCorporateProfits | 599.2562B | 587.0539B | 2.0362% |
| 2032 | traditionalCorporateProfits | 2.7750T | 2.6936T | 2.9351% |
| 2032 | aiGDPContribution | 2.3970T | 2.3482T | 2.0362% |
| 2032 | maxNeutralTransfers | 739.9406B | 1.3468T | 82.0158% |
| 2033 | totalEmployment | 123.9480M | 121.1675M | 2.2433% |
| 2033 | totalUnemployment | 53.1122M | 55.8928M | 5.2352% |
| 2033 | aggregateWageIncome | 6.8537T | 6.2858T | 8.2863% |
| 2033 | aggregateAssetIncome | 7.2615T | 7.0188T | 3.3419% |
| 2033 | totalIncome | 21.6610T | 20.8894T | 3.5621% |
| 2033 | gdpNominal | 21.5282T | 20.9327T | 2.7664% |
| 2033 | gdpReal | 22.1328T | 19.3211T | 12.7038% |
| 2033 | consumption | 9.7182T | 9.2495T | 4.8232% |
| 2033 | investment | 6.1898T | 6.0768T | 1.8254% |
| 2033 | unrealizedAIOutput | 1.8526T | 1.9432T | 4.8930% |
| 2033 | aiGoodsAbsorbed | 1.5803T | 1.5153T | 4.1112% |
| 2033 | newJobEmployment | 422.3348K | 383.0637K | 9.2986% |
| 2033 | newJobWageIncome | 18.2658B | 15.5686B | 14.7663% |
| 2033 | potentialGDP | 25.5656T | 24.3912T | 4.5938% |
| 2033 | wageConsumption | 4.6058T | 4.1748T | 9.3579% |
| 2033 | assetConsumption | 2.5415T | 2.4566T | 3.3419% |
| 2033 | corporateProfits | 2.9097T | 2.8375T | 2.4817% |
| 2033 | aiCorporateProfits | 967.2162B | 955.2537B | 1.2368% |
| 2033 | traditionalCorporateProfits | 1.9425T | 1.8823T | 3.1015% |
| 2033 | aiGDPContribution | 3.8689T | 3.8210T | 1.2368% |
| 2033 | totalDemandSpilloverLoss | 12.3216M | 14.8220M | 20.2924% |
| 2033 | maxNeutralTransfers | 867.9437B | 1.5177T | 74.8612% |
| 2034 | totalEmployment | 81.5979M | 79.8014M | 2.2016% |
| 2034 | totalUnemployment | 96.1707M | 97.9671M | 1.8680% |
| 2034 | aggregateWageIncome | 2.1539T | 2.0087T | 6.7401% |
| 2034 | aggregateAssetIncome | 6.0924T | 5.8732T | 3.5979% |
| 2034 | totalIncome | 16.6188T | 16.2745T | 2.0716% |
| 2034 | gdpNominal | 20.2340T | 19.9980T | 1.1664% |
| 2034 | gdpReal | 22.6097T | 19.2263T | 14.9643% |
| 2034 | consumption | 7.1450T | 7.0253T | 1.6743% |
| 2034 | investment | 6.9814T | 6.8812T | 1.4350% |
| 2034 | aiGoodsAbsorbed | 2.2744T | 2.2363T | 1.6743% |
| 2034 | newJobEmployment | 241.0998K | 210.4709K | 12.7038% |
| 2034 | newJobWageIncome | 5.4111B | 4.5117B | 16.6211% |
| 2034 | potentialGDP | 29.3299T | 26.7182T | 8.9046% |
| 2034 | wageConsumption | 1.1879T | 1.0977T | 7.5945% |
| 2034 | assetConsumption | 2.1323T | 2.0556T | 3.5979% |
| 2034 | traditionalCorporateProfits | 1.4827T | 1.4610T | 1.4684% |
| 2034 | totalDemandSpilloverLoss | 25.5948M | 27.3606M | 6.8991% |
| 2034 | maxNeutralTransfers | 1.0632T | 1.8082T | 70.0714% |
| 2035 | aggregateWageIncome | 1.2528T | 1.2181T | 2.7626% |
| 2035 | aggregateAssetIncome | 6.2040T | 6.0847T | 1.9237% |
| 2035 | gdpReal | 26.1534T | 21.3952T | 18.1933% |
| 2035 | consumption | 6.7058T | 6.5468T | 2.3714% |
| 2035 | unrealizedAIOutput | 5.8187T | 5.8829T | 1.1039% |
| 2035 | aiGoodsAbsorbed | 2.7086T | 2.6444T | 2.3714% |
| 2035 | newJobEmployment | 169.4992K | 144.1348K | 14.9643% |
| 2035 | newJobWageIncome | 3.0394B | 2.5403B | 16.4213% |
| 2035 | potentialGDP | 34.6807T | 29.5145T | 14.8964% |
| 2035 | wageConsumption | 625.6069B | 606.2094B | 3.1006% |
| 2035 | assetConsumption | 2.1714T | 2.1296T | 1.9237% |
| 2035 | totalDemandSpilloverLoss | 21.8019M | 22.3961M | 2.7252% |
| 2035 | maxNeutralTransfers | 1.5450T | 2.5278T | 63.6134% |
| 2036 | aggregateWageIncome | 1.1527T | 1.1378T | 1.2931% |
| 2036 | aggregateAssetIncome | 7.4128T | 7.2318T | 2.4423% |
| 2036 | totalIncome | 17.4195T | 17.2129T | 1.1861% |
| 2036 | gdpReal | 31.3677T | 24.4735T | 21.9787% |
| 2036 | consumption | 6.8111T | 6.6143T | 2.8897% |
| 2036 | unrealizedAIOutput | 6.2965T | 6.3809T | 1.3400% |
| 2036 | aiGoodsAbsorbed | 2.9990T | 2.9113T | 2.9245% |
| 2036 | newJobEmployment | 153.2210K | 125.6614K | 17.9868% |
| 2036 | newJobWageIncome | 2.6869B | 2.1847B | 18.6903% |
| 2036 | potentialGDP | 40.6632T | 31.4581T | 22.6373% |
| 2036 | wageConsumption | 557.5250B | 549.7001B | 1.4035% |
| 2036 | assetConsumption | 2.5945T | 2.5311T | 2.4423% |
| 2036 | totalDemandSpilloverLoss | 15.4358M | 15.7157M | 1.8133% |
| 2036 | maxNeutralTransfers | 2.3030T | 3.5778T | 55.3525% |
| 2037 | aggregateWageIncome | 1.1104T | 1.0890T | 1.9263% |
| 2037 | aggregateAssetIncome | 9.1488T | 8.7226T | 4.6582% |
| 2037 | totalIncome | 19.1898T | 18.7340T | 2.3751% |
| 2037 | gdpNominal | 23.4431T | 23.1416T | 1.2862% |
| 2037 | gdpReal | 37.7149T | 28.0834T | 25.5375% |
| 2037 | consumption | 7.1691T | 6.9393T | 3.2053% |
| 2037 | unrealizedAIOutput | 6.5188T | 6.6270T | 1.6611% |
| 2037 | aiGoodsAbsorbed | 3.3520T | 3.2449T | 3.1930% |
| 2037 | newJobEmployment | 153.4901K | 119.6272K | 22.0619% |
| 2037 | newJobWageIncome | 2.7081B | 2.0838B | 23.0532% |
| 2037 | potentialGDP | 47.5856T | 33.0136T | 30.6228% |
| 2037 | wageConsumption | 526.2663B | 515.1563B | 2.1111% |
| 2037 | assetConsumption | 3.2021T | 3.0529T | 4.6582% |
| 2037 | corporateProfits | 3.9693T | 3.9212T | 1.2101% |
| 2037 | aiCorporateProfits | 2.4831T | 2.4566T | 1.0692% |
| 2037 | traditionalCorporateProfits | 1.4862T | 1.4647T | 1.4457% |
| 2037 | aiGDPContribution | 9.9325T | 9.8263T | 1.0692% |
| 2037 | totalDemandSpilloverLoss | 11.3283M | 11.5731M | 2.1603% |
| 2037 | maxNeutralTransfers | 3.1149T | 4.6440T | 49.0928% |
| 2038 | aggregateWageIncome | 1.0046T | 977.3620B | 2.7147% |
| 2038 | aggregateAssetIncome | 10.1046T | 9.3822T | 7.1493% |
| 2038 | totalIncome | 20.1364T | 19.3816T | 3.7486% |
| 2038 | gdpNominal | 24.3430T | 24.0325T | 1.2752% |
| 2038 | gdpReal | 45.5021T | 32.4475T | 28.6903% |
| 2038 | consumption | 7.3636T | 7.1137T | 3.3935% |
| 2038 | consumerWelfareIndex | 38.4352K | 26.8199K | 30.2204% |
| 2038 | unrealizedAIOutput | 6.9804T | 7.1384T | 2.2624% |
| 2038 | aiGoodsAbsorbed | 3.7389T | 3.6278T | 2.9715% |
| 2038 | newJobEmployment | 152.7080K | 113.2267K | 25.8541% |
| 2038 | newJobWageIncome | 2.6410B | 1.9238B | 27.1541% |
| 2038 | potentialGDP | 56.2215T | 34.7987T | 38.1043% |
| 2038 | wageConsumption | 463.5513B | 449.6665B | 2.9953% |
| 2038 | assetConsumption | 3.5366T | 3.2838T | 7.1493% |
| 2038 | corporateProfits | 4.2016T | 4.1563T | 1.0788% |
| 2038 | traditionalCorporateProfits | 1.4804T | 1.4550T | 1.7129% |
| 2038 | totalDemandSpilloverLoss | 8.7424M | 9.0328M | 3.3218% |
| 2038 | maxNeutralTransfers | 4.1067T | 5.8716T | 42.9756% |
| 2039 | aggregateWageIncome | 1.0051T | 981.4253B | 2.3537% |
| 2039 | aggregateAssetIncome | 10.7747T | 9.8090T | 8.9629% |
| 2039 | totalIncome | 20.8490T | 19.8521T | 4.7815% |
| 2039 | gdpNominal | 24.9894T | 24.6639T | 1.3025% |
| 2039 | gdpReal | 54.7569T | 37.3960T | 31.7054% |
| 2039 | consumption | 7.5174T | 7.2667T | 3.3340% |
| 2039 | consumerWelfareIndex | 45.8139K | 30.6444K | 33.1111% |
| 2039 | unrealizedAIOutput | 7.2534T | 7.3883T | 1.8601% |
| 2039 | aiGoodsAbsorbed | 4.0111T | 3.8780T | 3.3183% |
| 2039 | newJobEmployment | 166.7964K | 118.8140K | 28.7671% |
| 2039 | newJobWageIncome | 2.9008B | 2.0333B | 29.9047% |
| 2039 | potentialGDP | 66.0215T | 35.9303T | 45.5778% |
| 2039 | wageConsumption | 459.1330B | 447.3589B | 2.5644% |
| 2039 | assetConsumption | 3.7711T | 3.4331T | 8.9629% |
| 2039 | corporateProfits | 4.3618T | 4.3075T | 1.2442% |
| 2039 | aiCorporateProfits | 2.8802T | 2.8472T | 1.1448% |
| 2039 | traditionalCorporateProfits | 1.4815T | 1.4602T | 1.4375% |
| 2039 | aiGDPContribution | 11.5208T | 11.3890T | 1.1448% |
| 2039 | totalDemandSpilloverLoss | 7.0322M | 7.3060M | 3.8923% |
| 2039 | maxNeutralTransfers | 5.2692T | 7.2108T | 36.8498% |
| 2040 | aggregateWageIncome | 1.0233T | 999.4491B | 2.3271% |
| 2040 | aggregateAssetIncome | 11.2822T | 10.0972T | 10.5031% |
| 2040 | totalIncome | 21.3945T | 20.1778T | 5.6871% |
| 2040 | gdpNominal | 25.2783T | 24.9573T | 1.2697% |
| 2040 | gdpReal | 65.4599T | 42.8551T | 34.5324% |
| 2040 | consumption | 7.6346T | 7.3938T | 3.1544% |
| 2040 | consumerWelfareIndex | 54.7683K | 35.1710K | 35.7821% |
| 2040 | unrealizedAIOutput | 7.2914T | 7.4218T | 1.7884% |
| 2040 | aiGoodsAbsorbed | 4.1306T | 4.0004T | 3.1531% |
| 2040 | newJobEmployment | 191.8959K | 131.0351K | 31.7155% |
| 2040 | newJobWageIncome | 3.3757B | 2.2684B | 32.8033% |
| 2040 | potentialGDP | 76.8819T | 36.3795T | 52.6814% |
| 2040 | wageConsumption | 466.0278B | 454.2602B | 2.5251% |
| 2040 | assetConsumption | 3.9488T | 3.5340T | 10.5031% |
| 2040 | corporateProfits | 4.4249T | 4.3714T | 1.2096% |
| 2040 | aiCorporateProfits | 2.9363T | 2.9038T | 1.1080% |
| 2040 | traditionalCorporateProfits | 1.4886T | 1.4676T | 1.4101% |
| 2040 | aiGDPContribution | 11.7453T | 11.6151T | 1.1080% |
| 2040 | totalDemandSpilloverLoss | 6.1042M | 6.3747M | 4.4323% |
| 2040 | maxNeutralTransfers | 6.6439T | 8.7181T | 31.2194% |
| 2041 | aggregateWageIncome | 1.0303T | 1.0066T | 2.2981% |
| 2041 | aggregateAssetIncome | 11.6113T | 10.2418T | 11.7944% |
| 2041 | totalIncome | 21.7455T | 20.3445T | 6.4427% |
| 2041 | gdpNominal | 25.3974T | 25.0980T | 1.1788% |
| 2041 | gdpReal | 78.0798T | 49.0186T | 37.2198% |
| 2041 | consumption | 7.7136T | 7.4891T | 2.9105% |
| 2041 | consumerWelfareIndex | 65.4319K | 40.3584K | 38.3199% |
| 2041 | unrealizedAIOutput | 7.3083T | 7.4309T | 1.6775% |
| 2041 | aiGoodsAbsorbed | 4.2078T | 4.0854T | 2.9088% |
| 2041 | newJobEmployment | 224.8219K | 147.1591K | 34.5442% |
| 2041 | newJobWageIncome | 3.9647B | 2.5546B | 35.5679% |
| 2041 | potentialGDP | 89.5959T | 36.6143T | 59.1339% |
| 2041 | wageConsumption | 468.5559B | 456.8499B | 2.4983% |
| 2041 | assetConsumption | 4.0639T | 3.5846T | 11.7944% |
| 2041 | corporateProfits | 4.4576T | 4.4076T | 1.1228% |
| 2041 | aiCorporateProfits | 2.9713T | 2.9407T | 1.0287% |
| 2041 | traditionalCorporateProfits | 1.4863T | 1.4669T | 1.3108% |
| 2041 | aiGDPContribution | 11.8852T | 11.7629T | 1.0287% |
| 2041 | totalDemandSpilloverLoss | 5.7485M | 6.0058M | 4.4753% |
| 2041 | maxNeutralTransfers | 8.1515T | 10.2366T | 25.5791% |
| 2042 | aggregateWageIncome | 1.0239T | 1.0013T | 2.2064% |
| 2042 | aggregateAssetIncome | 11.8495T | 10.3209T | 12.8997% |
| 2042 | totalIncome | 21.9955T | 20.4365T | 7.0875% |
| 2042 | gdpNominal | 25.4947T | 25.2188T | 1.0821% |
| 2042 | gdpReal | 93.2474T | 56.1436T | 39.7907% |
| 2042 | consumption | 7.7737T | 7.5647T | 2.6890% |
| 2042 | consumerWelfareIndex | 78.1380K | 46.2821K | 40.7688% |
| 2042 | unrealizedAIOutput | 7.3255T | 7.4405T | 1.5690% |
| 2042 | aiGoodsAbsorbed | 4.2697T | 4.1549T | 2.6872% |
| 2042 | newJobEmployment | 263.1389K | 165.1687K | 37.2314% |
| 2042 | newJobWageIncome | 4.6145B | 2.8537B | 38.1573% |
| 2042 | potentialGDP | 104.8426T | 36.8142T | 64.8863% |
| 2042 | wageConsumption | 464.4922B | 453.3062B | 2.4082% |
| 2042 | assetConsumption | 4.1473T | 3.6123T | 12.8997% |
| 2042 | corporateProfits | 4.4844T | 4.4380T | 1.0345% |
| 2042 | traditionalCorporateProfits | 1.4844T | 1.4667T | 1.1952% |
| 2042 | totalDemandSpilloverLoss | 5.6122M | 5.8520M | 4.2741% |
| 2042 | maxNeutralTransfers | 9.8606T | 11.8757T | 20.4365% |
| 2043 | aggregateWageIncome | 998.3134B | 977.1095B | 2.1240% |
| 2043 | aggregateAssetIncome | 12.0907T | 10.4128T | 13.8773% |
| 2043 | totalIncome | 22.2396T | 20.5329T | 7.6743% |
| 2043 | gdpNominal | 25.6315T | 25.3702T | 1.0195% |
| 2043 | gdpReal | 112.1138T | 64.7065T | 42.2850% |
| 2043 | consumption | 7.8300T | 7.6302T | 2.5519% |
| 2043 | consumerWelfareIndex | 93.7476K | 53.2688K | 43.1785% |
| 2043 | unrealizedAIOutput | 7.3630T | 7.4740T | 1.5074% |
| 2043 | aiGoodsAbsorbed | 4.3409T | 4.2302T | 2.5491% |
| 2043 | newJobEmployment | 303.6909K | 182.8106K | 39.8037% |
| 2043 | newJobWageIncome | 5.2547B | 3.1194B | 40.6362% |
| 2043 | potentialGDP | 123.8177T | 37.0744T | 70.0573% |
| 2043 | wageConsumption | 450.3333B | 439.8424B | 2.3296% |
| 2043 | assetConsumption | 4.2317T | 3.6445T | 13.8773% |
| 2043 | traditionalCorporateProfits | 1.4837T | 1.4671T | 1.1187% |
| 2043 | totalDemandSpilloverLoss | 5.5354M | 5.7570M | 4.0037% |
| 2043 | maxNeutralTransfers | 12.2068T | 14.0928T | 15.4507% |
| 2044 | aggregateWageIncome | 971.4169B | 951.0015B | 2.1016% |
| 2044 | aggregateAssetIncome | 12.3451T | 10.5189T | 14.7925% |
| 2044 | totalIncome | 22.4971T | 20.6431T | 8.2410% |
| 2044 | gdpNominal | 25.8055T | 25.5473T | 1.0006% |
| 2044 | gdpReal | 135.9708T | 75.1726T | 44.7142% |
| 2044 | consumption | 7.8888T | 7.6909T | 2.5081% |
| 2044 | consumerWelfareIndex | 113.3240K | 61.6981K | 45.5560% |
| 2044 | unrealizedAIOutput | 7.4122T | 7.5233T | 1.4986% |
| 2044 | aiGoodsAbsorbed | 4.4223T | 4.3114T | 2.5060% |
| 2044 | newJobEmployment | 351.6250K | 202.9172K | 42.2916% |
| 2044 | newJobWageIncome | 6.0049B | 3.4193B | 43.0587% |
| 2044 | potentialGDP | 147.8052T | 37.3820T | 74.7086% |
| 2044 | wageConsumption | 435.5314B | 425.4463B | 2.3156% |
| 2044 | assetConsumption | 4.3208T | 3.6816T | 14.7925% |
| 2044 | traditionalCorporateProfits | 1.4843T | 1.4681T | 1.0935% |
| 2044 | totalDemandSpilloverLoss | 5.4509M | 5.6613M | 3.8601% |
| 2044 | maxNeutralTransfers | 15.3930T | 17.0225T | 10.5864% |
| 2045 | aggregateWageIncome | 973.7784B | 952.6579B | 2.1689% |
| 2045 | aggregateAssetIncome | 12.5607T | 10.5991T | 15.6168% |
| 2045 | totalIncome | 22.7283T | 20.7388T | 8.7532% |
| 2045 | gdpReal | 164.8583T | 87.4151T | 46.9756% |
| 2045 | consumption | 7.9462T | 7.7507T | 2.4606% |
| 2045 | consumerWelfareIndex | 137.0486K | 71.5920K | 47.7616% |
| 2045 | unrealizedAIOutput | 7.4290T | 7.5394T | 1.4856% |
| 2045 | aiGoodsAbsorbed | 4.4841T | 4.3738T | 2.4603% |
| 2045 | newJobEmployment | 421.9153K | 233.2562K | 44.7149% |
| 2045 | newJobWageIncome | 7.2052B | 3.9301B | 45.4543% |
| 2045 | potentialGDP | 176.7714T | 37.6118T | 78.7229% |
| 2045 | wageConsumption | 436.2411B | 425.7605B | 2.4025% |
| 2045 | assetConsumption | 4.3963T | 3.7097T | 15.6168% |
| 2045 | traditionalCorporateProfits | 1.4883T | 1.4721T | 1.0898% |
| 2045 | totalDemandSpilloverLoss | 5.3471M | 5.5553M | 3.8940% |
| 2045 | maxNeutralTransfers | 18.8689T | 20.0104T | 6.0495% |
| 2046 | aggregateWageIncome | 980.6310B | 958.2056B | 2.2868% |
| 2046 | aggregateAssetIncome | 12.7393T | 10.6645T | 16.2866% |
| 2046 | totalIncome | 22.9223T | 20.8193T | 9.1745% |
| 2046 | gdpReal | 199.7774T | 101.6088T | 49.1390% |
| 2046 | consumption | 7.9941T | 7.8030T | 2.3902% |
| 2046 | consumerWelfareIndex | 165.6517K | 83.0460K | 49.8671% |
| 2046 | unrealizedAIOutput | 7.4449T | 7.5535T | 1.4587% |
| 2046 | aiGoodsAbsorbed | 4.5372T | 4.4289T | 2.3882% |
| 2046 | newJobEmployment | 510.0793K | 270.4629K | 46.9763% |
| 2046 | newJobWageIncome | 8.7312B | 4.5661B | 47.7037% |
| 2046 | potentialGDP | 211.7595T | 37.8042T | 82.1476% |
| 2046 | wageConsumption | 439.6026B | 428.3973B | 2.5490% |
| 2046 | assetConsumption | 4.4587T | 3.7326T | 16.2866% |
| 2046 | traditionalCorporateProfits | 1.4905T | 1.4745T | 1.0732% |
| 2046 | totalDemandSpilloverLoss | 5.2557M | 5.4642M | 3.9671% |
| 2046 | maxNeutralTransfers | 22.9514T | 23.3471T | 1.7244% |
| 2047 | totalEmployment | 47.4603M | 46.9506M | 1.0740% |
| 2047 | aggregateWageIncome | 989.8490B | 965.9741B | 2.4120% |
| 2047 | aggregateAssetIncome | 12.8848T | 10.7149T | 16.8410% |
| 2047 | totalIncome | 23.0845T | 20.8861T | 9.5233% |
| 2047 | gdpReal | 241.9824T | 118.0616T | 51.2107% |
| 2047 | consumption | 8.0350T | 7.8489T | 2.3156% |
| 2047 | consumerWelfareIndex | 200.0890K | 96.2705K | 51.8862% |
| 2047 | unrealizedAIOutput | 7.4620T | 7.5682T | 1.4229% |
| 2047 | aiGoodsAbsorbed | 4.5852T | 4.4790T | 2.3156% |
| 2047 | newJobEmployment | 617.6426K | 314.1391K | 49.1390% |
| 2047 | newJobWageIncome | 10.5927B | 5.3121B | 49.8519% |
| 2047 | potentialGDP | 254.0296T | 37.9773T | 85.0501% |
| 2047 | wageConsumption | 444.1837B | 432.1553B | 2.7080% |
| 2047 | assetConsumption | 4.5097T | 3.7502T | 16.8410% |
| 2047 | traditionalCorporateProfits | 1.4917T | 1.4762T | 1.0396% |
| 2047 | totalDemandSpilloverLoss | 5.1886M | 5.3948M | 3.9740% |
| 2047 | maxNeutralTransfers | 27.8332T | 27.1592T | 2.4213% |
| 2048 | totalEmployment | 47.8499M | 47.2649M | 1.2226% |
| 2048 | aggregateWageIncome | 999.3313B | 973.7314B | 2.5617% |
| 2048 | aggregateAssetIncome | 13.0081T | 10.7578T | 17.2994% |
| 2048 | totalIncome | 23.2242T | 20.9451T | 9.8134% |
| 2048 | gdpReal | 292.9148T | 137.0900T | 53.1980% |
| 2048 | consumption | 8.0707T | 7.8895T | 2.2457% |
| 2048 | consumerWelfareIndex | 241.5271K | 111.5225K | 53.8261% |
| 2048 | unrealizedAIOutput | 7.4715T | 7.5753T | 1.3898% |
| 2048 | aiGoodsAbsorbed | 4.6241T | 4.5202T | 2.2457% |
| 2048 | newJobEmployment | 748.0764K | 364.9815K | 51.2107% |
| 2048 | newJobWageIncome | 12.8501B | 6.1795B | 51.9108% |
| 2048 | potentialGDP | 305.0104T | 38.1173T | 87.5029% |
| 2048 | wageConsumption | 448.9697B | 435.9532B | 2.8992% |
| 2048 | assetConsumption | 4.5528T | 3.7652T | 17.2994% |
| 2048 | traditionalCorporateProfits | 1.4932T | 1.4782T | 1.0069% |
| 2048 | totalDemandSpilloverLoss | 5.1356M | 5.3375M | 3.9319% |
| 2048 | maxNeutralTransfers | 33.6926T | 31.5376T | 6.3960% |
| 2049 | totalEmployment | 48.2574M | 47.5782M | 1.4074% |
| 2049 | aggregateWageIncome | 1.0086T | 980.7615B | 2.7561% |
| 2049 | aggregateAssetIncome | 13.1125T | 10.7950T | 17.6735% |
| 2049 | totalIncome | 23.3444T | 20.9978T | 10.0520% |
| 2049 | gdpReal | 354.4604T | 159.1330T | 55.1055% |
| 2049 | consumption | 8.1019T | 7.9253T | 2.1795% |
| 2049 | consumerWelfareIndex | 291.3772K | 129.1106K | 55.6896% |
| 2049 | unrealizedAIOutput | 7.4835T | 7.5851T | 1.3573% |
| 2049 | aiGoodsAbsorbed | 4.6605T | 4.5590T | 2.1795% |
| 2049 | newJobEmployment | 905.5044K | 423.7943K | 53.1980% |
| 2049 | newJobWageIncome | 15.5711B | 7.1795B | 53.8924% |
| 2049 | potentialGDP | 366.6044T | 38.2491T | 89.5667% |
| 2049 | wageConsumption | 453.6923B | 439.4237B | 3.1450% |
| 2049 | assetConsumption | 4.5894T | 3.7783T | 17.6735% |
| 2049 | totalDemandSpilloverLoss | 5.0935M | 5.2910M | 3.8766% |
| 2049 | maxNeutralTransfers | 40.7725T | 36.6092T | 10.2111% |
| 2050 | totalEmployment | 48.6928M | 47.8956M | 1.6372% |
| 2050 | aggregateWageIncome | 1.0182T | 987.5175B | 3.0091% |
| 2050 | aggregateAssetIncome | 13.2034T | 10.8283T | 17.9890% |
| 2050 | totalIncome | 23.4510T | 21.0461T | 10.2549% |
| 2050 | gdpReal | 428.8883T | 184.6929T | 56.9368% |
| 2050 | consumption | 8.1298T | 7.9573T | 2.1216% |
| 2050 | consumerWelfareIndex | 351.3720K | 149.3985K | 57.4814% |
| 2050 | unrealizedAIOutput | 7.4973T | 7.5969T | 1.3287% |
| 2050 | aiGoodsAbsorbed | 4.6953T | 4.5957T | 2.1216% |
| 2050 | newJobEmployment | 1.0957M | 491.9305K | 55.1055% |
| 2050 | newJobWageIncome | 18.8612B | 8.3360B | 55.8035% |
| 2050 | potentialGDP | 441.0809T | 38.3774T | 91.2992% |
| 2050 | wageConsumption | 458.6602B | 442.7816B | 3.4620% |
| 2050 | assetConsumption | 4.6212T | 3.7899T | 17.9890% |
| 2050 | totalDemandSpilloverLoss | 5.0578M | 5.2512M | 3.8236% |
| 2050 | maxNeutralTransfers | 49.3341T | 42.4897T | 13.8737% |

## Field Comparison Warnings

218 fields between 0.01-1% relative error.

| Year | Field | Expected | Actual | Error |
|-----:|-------|----------|--------|------:|
| 2029 | totalUnemployment | 7.1950M | 7.2076M | 0.1748% |
| 2029 | aggregateAssetIncome | 7.6107T | 7.6119T | 0.0155% |
| 2029 | investment | 6.7233T | 6.7240T | 0.0100% |
| 2029 | newJobEmployment | 759.6138K | 759.5252K | 0.0117% |
| 2029 | assetConsumption | 2.6637T | 2.6641T | 0.0155% |
| 2030 | totalEmployment | 165.1068M | 165.0007M | 0.0643% |
| 2030 | aggregateWageIncome | 21.9206T | 21.8757T | 0.2046% |
| 2030 | aggregateAssetIncome | 8.1697T | 8.1798T | 0.1231% |
| 2030 | aggregateTransferIncome | 6.7151T | 6.7028T | 0.1839% |
| 2030 | totalIncome | 36.8054T | 36.7582T | 0.1281% |
| 2030 | gdpNominal | 38.2822T | 38.1808T | 0.2649% |
| 2030 | gdpReal | 34.1555T | 33.8900T | 0.7773% |
| 2030 | consumption | 25.9966T | 25.8982T | 0.3784% |
| 2030 | investment | 7.0971T | 7.1031T | 0.0842% |
| 2030 | governmentSpending | 6.0774T | 6.0670T | 0.1700% |
| 2030 | consumerWelfareIndex | 66.8701K | 66.2748K | 0.8902% |
| 2030 | newJobEmployment | 751.9731K | 751.2403K | 0.0975% |
| 2030 | newJobWageIncome | 72.9121B | 72.7530B | 0.2181% |
| 2030 | wageConsumption | 17.4019T | 17.3597T | 0.2427% |
| 2030 | assetConsumption | 2.8594T | 2.8629T | 0.1231% |
| 2030 | transferConsumption | 6.0436T | 6.0325T | 0.1839% |
| 2030 | corporateProfits | 4.2629T | 4.2536T | 0.2191% |
| 2030 | traditionalCorporateProfits | 4.1703T | 4.1577T | 0.3017% |
| 2031 | totalEmployment | 160.4653M | 160.3604M | 0.0654% |
| 2031 | totalUnemployment | 15.1870M | 15.2919M | 0.6909% |
| 2031 | aggregateWageIncome | 19.8885T | 19.7930T | 0.4802% |
| 2031 | aggregateAssetIncome | 8.7268T | 8.7136T | 0.1509% |
| 2031 | aggregateTransferIncome | 6.8177T | 6.8053T | 0.1815% |
| 2031 | totalIncome | 35.4330T | 35.3119T | 0.3416% |
| 2031 | investment | 7.2766T | 7.2458T | 0.4239% |
| 2031 | governmentSpending | 6.0851T | 6.0713T | 0.2263% |
| 2031 | consumerWelfareIndex | 57.7111K | 55.2521K | 4.2609% |
| 2031 | newJobEmployment | 711.2252K | 705.0192K | 0.8726% |
| 2031 | wageConsumption | 15.4886T | 15.4083T | 0.5183% |
| 2031 | assetConsumption | 3.0544T | 3.0498T | 0.1509% |
| 2031 | transferConsumption | 6.1359T | 6.1248T | 0.1815% |
| 2032 | totalEmployment | 151.8567M | 151.8124M | 0.0292% |
| 2032 | totalUnemployment | 24.4982M | 24.5425M | 0.1810% |
| 2032 | aggregateTransferIncome | 6.9964T | 6.9829T | 0.1935% |
| 2032 | governmentSpending | 5.9634T | 5.9374T | 0.4364% |
| 2032 | consumerWelfareIndex | 42.7699K | 38.4173K | 10.1769% |
| 2032 | aiAdditionalOutput | 2.8401T | 2.8430T | 0.1043% |
| 2032 | aiInvestmentBoost | 852.0182B | 852.9067B | 0.1043% |
| 2032 | aiNetExportBoost | 284.0061B | 284.3022B | 0.1043% |
| 2032 | aiConsumerGoodsPotential | 1.7040T | 1.7058T | 0.1043% |
| 2032 | transferConsumption | 6.2968T | 6.2846T | 0.1935% |
| 2033 | aggregateTransferIncome | 7.5458T | 7.5848T | 0.5168% |
| 2033 | governmentSpending | 5.7201T | 5.6828T | 0.6525% |
| 2033 | consumerWelfareIndex | 28.4621K | 24.3208K | 14.5504% |
| 2033 | aiAdditionalOutput | 5.7215T | 5.7643T | 0.7480% |
| 2033 | aiInvestmentBoost | 1.7164T | 1.7293T | 0.7480% |
| 2033 | aiNetExportBoost | 572.1463B | 576.4261B | 0.7480% |
| 2033 | aiConsumerGoodsPotential | 3.4329T | 3.4586T | 0.7480% |
| 2033 | transferConsumption | 6.7912T | 6.8263T | 0.5168% |
| 2034 | aggregateTransferIncome | 8.3725T | 8.3926T | 0.2401% |
| 2034 | governmentSpending | 5.5114T | 5.4807T | 0.5568% |
| 2034 | consumerWelfareIndex | 22.6532K | 19.1643K | 15.4013% |
| 2034 | unrealizedAIOutput | 4.4458T | 4.4839T | 0.8565% |
| 2034 | transferConsumption | 7.5353T | 7.5534T | 0.2401% |
| 2034 | corporateProfits | 3.1714T | 3.1401T | 0.9867% |
| 2034 | aiCorporateProfits | 1.6886T | 1.6791T | 0.5638% |
| 2034 | aiGDPContribution | 6.7546T | 6.7165T | 0.5638% |
| 2035 | totalEmployment | 63.3194M | 62.6999M | 0.9784% |
| 2035 | totalUnemployment | 115.1602M | 115.7797M | 0.5380% |
| 2035 | aggregateTransferIncome | 8.7371T | 8.7347T | 0.0285% |
| 2035 | totalIncome | 16.1939T | 16.0375T | 0.9661% |
| 2035 | gdpNominal | 21.1368T | 20.9872T | 0.7079% |
| 2035 | investment | 8.0350T | 8.0570T | 0.2742% |
| 2035 | governmentSpending | 5.4670T | 5.4487T | 0.3361% |
| 2035 | consumerWelfareIndex | 23.4490K | 18.8615K | 19.5639% |
| 2035 | transferConsumption | 7.8634T | 7.8612T | 0.0285% |
| 2035 | corporateProfits | 3.5001T | 3.4747T | 0.7272% |
| 2035 | aiCorporateProfits | 2.0984T | 2.0823T | 0.7653% |
| 2035 | traditionalCorporateProfits | 1.4018T | 1.3924T | 0.6701% |
| 2035 | aiGDPContribution | 8.3935T | 8.3293T | 0.7653% |
| 2036 | totalEmployment | 57.9442M | 57.7503M | 0.3346% |
| 2036 | totalUnemployment | 121.2493M | 121.4432M | 0.1599% |
| 2036 | aggregateTransferIncome | 8.8541T | 8.8434T | 0.1204% |
| 2036 | gdpNominal | 22.3860T | 22.1660T | 0.9829% |
| 2036 | investment | 9.0419T | 9.0310T | 0.1203% |
| 2036 | governmentSpending | 5.4980T | 5.4825T | 0.2805% |
| 2036 | consumerWelfareIndex | 26.8643K | 20.5563K | 23.4812% |
| 2036 | aiAdditionalOutput | 15.4925T | 15.4869T | 0.0358% |
| 2036 | aiInvestmentBoost | 4.6477T | 4.6461T | 0.0358% |
| 2036 | aiNetExportBoost | 1.5492T | 1.5487T | 0.0358% |
| 2036 | aiConsumerGoodsPotential | 9.2955T | 9.2922T | 0.0358% |
| 2036 | transferConsumption | 7.9686T | 7.9591T | 0.1204% |
| 2036 | corporateProfits | 3.7499T | 3.7131T | 0.9812% |
| 2036 | aiCorporateProfits | 2.2990T | 2.2765T | 0.9779% |
| 2036 | traditionalCorporateProfits | 1.4509T | 1.4366T | 0.9864% |
| 2036 | aiGDPContribution | 9.1960T | 9.1061T | 0.9779% |
| 2037 | totalEmployment | 54.6762M | 54.3549M | 0.5878% |
| 2037 | totalUnemployment | 125.2340M | 125.5554M | 0.2566% |
| 2037 | aggregateTransferIncome | 8.9306T | 8.9223T | 0.0920% |
| 2037 | investment | 9.6328T | 9.5733T | 0.6172% |
| 2037 | governmentSpending | 5.5407T | 5.5229T | 0.3218% |
| 2037 | consumerWelfareIndex | 32.3353K | 23.6096K | 26.9852% |
| 2037 | aiAdditionalOutput | 16.4512T | 16.4533T | 0.0127% |
| 2037 | aiInvestmentBoost | 4.9354T | 4.9360T | 0.0127% |
| 2037 | aiNetExportBoost | 1.6451T | 1.6453T | 0.0127% |
| 2037 | aiConsumerGoodsPotential | 9.8707T | 9.8720T | 0.0127% |
| 2037 | transferConsumption | 8.0375T | 8.0301T | 0.0920% |
| 2038 | totalEmployment | 50.3640M | 49.8832M | 0.9546% |
| 2038 | totalUnemployment | 130.2659M | 130.7467M | 0.3691% |
| 2038 | aggregateTransferIncome | 9.0272T | 9.0220T | 0.0571% |
| 2038 | investment | 10.1863T | 10.1312T | 0.5404% |
| 2038 | governmentSpending | 5.5769T | 5.5563T | 0.3697% |
| 2038 | aiAdditionalOutput | 17.8655T | 17.9436T | 0.4368% |
| 2038 | aiInvestmentBoost | 5.3597T | 5.3831T | 0.4368% |
| 2038 | aiNetExportBoost | 1.7866T | 1.7944T | 0.4368% |
| 2038 | aiConsumerGoodsPotential | 10.7193T | 10.7661T | 0.4368% |
| 2038 | transferConsumption | 8.1245T | 8.1198T | 0.0571% |
| 2038 | aiCorporateProfits | 2.7213T | 2.7013T | 0.7339% |
| 2038 | aiGDPContribution | 10.8851T | 10.8052T | 0.7339% |
| 2039 | totalEmployment | 48.8966M | 48.5390M | 0.7313% |
| 2039 | totalUnemployment | 132.4558M | 132.8134M | 0.2700% |
| 2039 | aggregateTransferIncome | 9.0692T | 9.0617T | 0.0829% |
| 2039 | investment | 10.5791T | 10.5173T | 0.5842% |
| 2039 | governmentSpending | 5.6077T | 5.5868T | 0.3731% |
| 2039 | aiAdditionalOutput | 18.7743T | 18.7773T | 0.0162% |
| 2039 | aiInvestmentBoost | 5.6323T | 5.6332T | 0.0162% |
| 2039 | aiNetExportBoost | 1.8774T | 1.8777T | 0.0162% |
| 2039 | aiConsumerGoodsPotential | 11.2646T | 11.2664T | 0.0162% |
| 2039 | transferConsumption | 8.1623T | 8.1555T | 0.0829% |
| 2040 | totalEmployment | 48.5905M | 48.2542M | 0.6919% |
| 2040 | totalUnemployment | 133.4874M | 133.8236M | 0.2519% |
| 2040 | aggregateTransferIncome | 9.0890T | 9.0811T | 0.0873% |
| 2040 | investment | 10.7181T | 10.6515T | 0.6217% |
| 2040 | governmentSpending | 5.6299T | 5.6084T | 0.3809% |
| 2040 | transferConsumption | 8.1801T | 8.1730T | 0.0873% |
| 2041 | totalEmployment | 48.5435M | 48.2028M | 0.7019% |
| 2041 | totalUnemployment | 134.2627M | 134.6034M | 0.2538% |
| 2041 | aggregateTransferIncome | 9.1039T | 9.0961T | 0.0862% |
| 2041 | investment | 10.7397T | 10.6782T | 0.5721% |
| 2041 | governmentSpending | 5.6398T | 5.6185T | 0.3774% |
| 2041 | transferConsumption | 8.1935T | 8.1865T | 0.0862% |
| 2042 | totalEmployment | 48.3272M | 47.9835M | 0.7112% |
| 2042 | totalUnemployment | 135.2102M | 135.5539M | 0.2542% |
| 2042 | aggregateTransferIncome | 9.1221T | 9.1143T | 0.0854% |
| 2042 | investment | 10.7625T | 10.7089T | 0.4982% |
| 2042 | governmentSpending | 5.6438T | 5.6233T | 0.3641% |
| 2042 | transferConsumption | 8.2099T | 8.2029T | 0.0854% |
| 2042 | aiCorporateProfits | 2.9999T | 2.9713T | 0.9550% |
| 2042 | aiGDPContribution | 11.9998T | 11.8852T | 0.9550% |
| 2043 | totalEmployment | 47.5765M | 47.2273M | 0.7341% |
| 2043 | totalUnemployment | 136.6950M | 137.0443M | 0.2555% |
| 2043 | aggregateTransferIncome | 9.1506T | 9.1429T | 0.0839% |
| 2043 | investment | 10.8239T | 10.7754T | 0.4483% |
| 2043 | governmentSpending | 5.6472T | 5.6274T | 0.3496% |
| 2043 | transferConsumption | 8.2356T | 8.2286T | 0.0839% |
| 2043 | corporateProfits | 4.5196T | 4.4753T | 0.9781% |
| 2043 | aiCorporateProfits | 3.0359T | 3.0083T | 0.9094% |
| 2043 | aiGDPContribution | 12.1435T | 12.0330T | 0.9094% |
| 2044 | totalEmployment | 46.7502M | 46.3876M | 0.7756% |
| 2044 | totalUnemployment | 138.2585M | 138.6211M | 0.2623% |
| 2044 | aggregateTransferIncome | 9.1806T | 9.1732T | 0.0809% |
| 2044 | investment | 10.9161T | 10.8686T | 0.4352% |
| 2044 | governmentSpending | 5.6519T | 5.6326T | 0.3405% |
| 2044 | transferConsumption | 8.2626T | 8.2559T | 0.0809% |
| 2044 | corporateProfits | 4.5623T | 4.5184T | 0.9621% |
| 2044 | aiCorporateProfits | 3.0780T | 3.0503T | 0.8987% |
| 2044 | aiGDPContribution | 12.3119T | 12.2012T | 0.8987% |
| 2045 | totalEmployment | 46.8040M | 46.4067M | 0.8489% |
| 2045 | totalUnemployment | 138.9447M | 139.3420M | 0.2859% |
| 2045 | aggregateTransferIncome | 9.1938T | 9.1870T | 0.0735% |
| 2045 | gdpNominal | 25.9564T | 25.6987T | 0.9930% |
| 2045 | investment | 10.9946T | 10.9453T | 0.4490% |
| 2045 | governmentSpending | 5.6578T | 5.6387T | 0.3382% |
| 2045 | transferConsumption | 8.2744T | 8.2683T | 0.0735% |
| 2045 | corporateProfits | 4.5949T | 4.5511T | 0.9531% |
| 2045 | aiCorporateProfits | 3.1065T | 3.0790T | 0.8876% |
| 2045 | aiGDPContribution | 12.4261T | 12.3158T | 0.8876% |
| 2046 | totalEmployment | 47.1021M | 46.6536M | 0.9522% |
| 2046 | totalUnemployment | 139.3895M | 139.8381M | 0.3218% |
| 2046 | aggregateTransferIncome | 9.2023T | 9.1966T | 0.0628% |
| 2046 | gdpNominal | 26.0755T | 25.8219T | 0.9726% |
| 2046 | investment | 11.0529T | 11.0032T | 0.4500% |
| 2046 | governmentSpending | 5.6630T | 5.6439T | 0.3377% |
| 2046 | transferConsumption | 8.2821T | 8.2769T | 0.0628% |
| 2046 | corporateProfits | 4.6218T | 4.5788T | 0.9314% |
| 2046 | aiCorporateProfits | 3.1313T | 3.1043T | 0.8638% |
| 2046 | aiGDPContribution | 12.5253T | 12.4171T | 0.8638% |
| 2047 | totalUnemployment | 139.7773M | 140.2870M | 0.3647% |
| 2047 | aggregateTransferIncome | 9.2098T | 9.2052T | 0.0499% |
| 2047 | gdpNominal | 26.1772T | 25.9301T | 0.9441% |
| 2047 | investment | 11.1017T | 11.0534T | 0.4349% |
| 2047 | governmentSpending | 5.6671T | 5.6481T | 0.3349% |
| 2047 | transferConsumption | 8.2888T | 8.2847T | 0.0499% |
| 2047 | corporateProfits | 4.6458T | 4.6038T | 0.9051% |
| 2047 | aiCorporateProfits | 3.1542T | 3.1276T | 0.8415% |
| 2047 | aiGDPContribution | 12.6167T | 12.5105T | 0.8415% |
| 2048 | totalUnemployment | 140.1367M | 140.7217M | 0.4175% |
| 2048 | aggregateTransferIncome | 9.2167T | 9.2135T | 0.0342% |
| 2048 | gdpNominal | 26.2623T | 26.0217T | 0.9159% |
| 2048 | investment | 11.1420T | 11.0954T | 0.4177% |
| 2048 | governmentSpending | 5.6705T | 5.6518T | 0.3308% |
| 2048 | transferConsumption | 8.2950T | 8.2922T | 0.0342% |
| 2048 | corporateProfits | 4.6651T | 4.6241T | 0.8788% |
| 2048 | aiCorporateProfits | 3.1719T | 3.1460T | 0.8184% |
| 2048 | aiGDPContribution | 12.6878T | 12.5839T | 0.8184% |
| 2049 | totalUnemployment | 140.4811M | 141.1603M | 0.4835% |
| 2049 | aggregateTransferIncome | 9.2233T | 9.2220T | 0.0146% |
| 2049 | gdpNominal | 26.3396T | 26.1051T | 0.8903% |
| 2049 | investment | 11.1792T | 11.1339T | 0.4046% |
| 2049 | governmentSpending | 5.6735T | 5.6549T | 0.3266% |
| 2049 | transferConsumption | 8.3010T | 8.2998T | 0.0146% |
| 2049 | corporateProfits | 4.6833T | 4.6433T | 0.8544% |
| 2049 | aiCorporateProfits | 3.1891T | 3.1637T | 0.7963% |
| 2049 | traditionalCorporateProfits | 1.4941T | 1.4795T | 0.9785% |
| 2049 | aiGDPContribution | 12.7565T | 12.6550T | 0.7963% |
| 2050 | totalUnemployment | 140.8007M | 141.5979M | 0.5662% |
| 2050 | gdpNominal | 26.4140T | 26.1848T | 0.8680% |
| 2050 | investment | 11.2168T | 11.1727T | 0.3939% |
| 2050 | governmentSpending | 5.6761T | 5.6578T | 0.3229% |
| 2050 | corporateProfits | 4.7009T | 4.6617T | 0.8332% |
| 2050 | aiCorporateProfits | 3.2059T | 3.1810T | 0.7768% |
| 2050 | traditionalCorporateProfits | 1.4949T | 1.4807T | 0.9541% |
| 2050 | aiGDPContribution | 12.8237T | 12.7241T | 0.7768% |

## Year-by-Year Detail

### Year 2026

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 32.1442T | 32.9900T | 2.6313% | **FAIL** |

### Year 2027

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 33.1365T | 34.9033T | 5.3318% | **FAIL** |

### Year 2028

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 33.8511T | 36.5942T | 8.1033% | **FAIL** |

### Year 2029

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

### Year 2030

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

### Year 2031

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

### Year 2032

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

### Year 2033

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

### Year 2034

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

### Year 2035

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

### Year 2036

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

### Year 2037

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

### Year 2038

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

### Year 2039

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

### Year 2040

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

### Year 2041

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

### Year 2042

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

### Year 2043

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

### Year 2044

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

### Year 2045

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

### Year 2046

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

### Year 2047

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

### Year 2048

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

### Year 2049

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

### Year 2050

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

## Invariant Checks

860 passed, 0 failed out of 860 checks.

### Passed Check Summary

| Check | Count |
|-------|------:|
| capability_agentic_bounds | 26 |
| capability_embodied_bounds | 26 |
| capability_generative_bounds | 26 |
| cwi_identity | 26 |
| cwi_nonneg | 26 |
| employment_nonneg | 26 |
| fiscal_after_prep | 1 |
| fiscal_window_close_gdp_contract | 1 |
| gdp_nominal_nonneg | 26 |
| gdp_real_identity | 26 |
| income_sum | 26 |
| median_cwi_finite | 26 |
| median_cwi_growth_finite | 26 |
| median_cwi_le_system_cwi | 26 |
| median_cwi_positive_with_transfers | 26 |
| money_supply_positive | 26 |
| no_nan_inf_aggregateAssetIncome | 26 |
| no_nan_inf_aggregateTransferIncome | 26 |
| no_nan_inf_aggregateWageIncome | 26 |
| no_nan_inf_consumerWelfareIndex | 26 |
| no_nan_inf_consumption | 26 |
| no_nan_inf_corporateProfits | 26 |
| no_nan_inf_gdpNominal | 26 |
| no_nan_inf_gdpReal | 26 |
| no_nan_inf_governmentSpending | 26 |
| no_nan_inf_inflationRate | 26 |
| no_nan_inf_investment | 26 |
| no_nan_inf_medianCWI | 26 |
| no_nan_inf_priceLevel | 26 |
| no_nan_inf_revenuePressure | 26 |
| no_nan_inf_totalEmployment | 26 |
| no_nan_inf_totalIncome | 26 |
| no_nan_inf_unemploymentRate | 26 |
| price_level_positive | 26 |
| unemployment_rate_bounds | 26 |

---
*Scenario "aggressive_stress" — ATLAS Verification Audit v1.0*
