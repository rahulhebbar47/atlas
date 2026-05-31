# Scenario: UBI Only

> Default S-curves + UBI $2000/mo from 2025. Isolates transfer mechanics.

Generated: 2026-02-23T20:50:03.899Z

## Summary

| Metric | Value |
|--------|------:|
| Total field comparisons | 1846 |
| PASS (<0.01% error) | 1289 |
| WARN (0.01-1% error) | 319 |
| FAIL (>1% error) | 238 |
| Invariant checks | 860 (860 pass, 0 fail) |
| Worst field | actualInflationFromTransfers (261.3522%) |

## Field Comparison Failures

238 fields exceed 1% relative error.

| Year | Field | Expected | Actual | Error |
|-----:|-------|----------|--------|------:|
| 2025 | moneySupply | 24.1987T | 27.3974T | 13.2186% |
| 2026 | potentialGDP | 37.6905T | 38.8011T | 2.9466% |
| 2026 | moneySupply | 27.4102T | 33.8205T | 23.3863% |
| 2027 | potentialGDP | 42.5939T | 45.1413T | 5.9806% |
| 2027 | moneySupply | 30.6346T | 40.2692T | 31.4501% |
| 2028 | potentialGDP | 46.0435T | 50.2355T | 9.1045% |
| 2028 | moneySupply | 33.8719T | 46.7437T | 38.0016% |
| 2029 | gdpReal | 48.4344T | 49.0338T | 1.2376% |
| 2029 | potentialGDP | 48.4344T | 54.4019T | 12.3209% |
| 2029 | moneySupply | 37.1221T | 53.2441T | 43.4299% |
| 2030 | gdpReal | 50.0546T | 50.8307T | 1.5505% |
| 2030 | newJobEmployment | 1.0898M | 1.1033M | 1.2376% |
| 2030 | newJobWageIncome | 154.3446B | 156.2592B | 1.2405% |
| 2030 | potentialGDP | 50.0546T | 57.8795T | 15.6327% |
| 2030 | moneySupply | 40.3853T | 59.7705T | 48.0008% |
| 2031 | gdpReal | 51.1142T | 52.0673T | 1.8647% |
| 2031 | newJobEmployment | 1.1262M | 1.1437M | 1.5505% |
| 2031 | newJobWageIncome | 169.0247B | 171.6535B | 1.5552% |
| 2031 | potentialGDP | 51.1142T | 60.8476T | 19.0425% |
| 2031 | moneySupply | 43.6615T | 66.3231T | 51.9027% |
| 2032 | gdpReal | 51.6898T | 52.8172T | 2.1809% |
| 2032 | aiAdditionalOutput | 320.5461M | 334.9371M | 4.4895% |
| 2032 | aiInvestmentBoost | 96.1638M | 100.4811M | 4.4895% |
| 2032 | aiNetExportBoost | 32.0546M | 33.4937M | 4.4895% |
| 2032 | aiConsumerGoodsPotential | 192.3277M | 200.9623M | 4.4895% |
| 2032 | aiGoodsAbsorbed | 192.3277M | 200.9623M | 4.4895% |
| 2032 | newJobEmployment | 1.1500M | 1.1715M | 1.8646% |
| 2032 | newJobWageIncome | 180.7242B | 184.1065B | 1.8715% |
| 2032 | potentialGDP | 51.6900T | 63.3411T | 22.5403% |
| 2032 | aiCorporateProfits | 80.1365M | 83.7343M | 4.4895% |
| 2032 | aiGDPContribution | 320.5461M | 334.9371M | 4.4895% |
| 2032 | moneySupply | 46.9509T | 72.9018T | 55.2724% |
| 2032 | maxNeutralTransfers | 4.0308B | 2.6361B | 34.6008% |
| 2033 | gdpReal | 51.9317T | 53.2307T | 2.5013% |
| 2033 | aiAdditionalOutput | 5.5776B | 5.7905B | 3.8172% |
| 2033 | aiInvestmentBoost | 1.6733B | 1.7371B | 3.8172% |
| 2033 | aiNetExportBoost | 557.7579M | 579.0489M | 3.8172% |
| 2033 | aiConsumerGoodsPotential | 3.3465B | 3.4743B | 3.8172% |
| 2033 | aiGoodsAbsorbed | 3.3465B | 3.4743B | 3.8172% |
| 2033 | newJobEmployment | 1.1623M | 1.1876M | 2.1785% |
| 2033 | newJobWageIncome | 189.4093B | 193.5553B | 2.1889% |
| 2033 | potentialGDP | 51.9351T | 65.4508T | 26.0242% |
| 2033 | aiCorporateProfits | 1.3944B | 1.4476B | 3.8172% |
| 2033 | aiGDPContribution | 5.5776B | 5.7905B | 3.8172% |
| 2033 | moneySupply | 50.2534T | 79.5068T | 58.2118% |
| 2033 | maxNeutralTransfers | 38.5240B | 24.2809B | 36.9721% |
| 2034 | gdpReal | 52.0051T | 53.4727T | 2.8220% |
| 2034 | aiAdditionalOutput | 34.7859B | 35.6169B | 2.3890% |
| 2034 | aiInvestmentBoost | 10.4358B | 10.6851B | 2.3890% |
| 2034 | aiNetExportBoost | 3.4786B | 3.5617B | 2.3890% |
| 2034 | aiConsumerGoodsPotential | 20.8715B | 21.3702B | 2.3890% |
| 2034 | aiGoodsAbsorbed | 20.8715B | 21.3702B | 2.3890% |
| 2034 | newJobEmployment | 1.1639M | 1.1929M | 2.4901% |
| 2034 | newJobWageIncome | 195.4046B | 200.3003B | 2.5054% |
| 2034 | potentialGDP | 52.0260T | 67.2918T | 29.3427% |
| 2034 | aiCorporateProfits | 8.6965B | 8.9042B | 2.3890% |
| 2034 | aiGDPContribution | 34.7859B | 35.6169B | 2.3890% |
| 2034 | moneySupply | 53.5692T | 86.1383T | 60.7983% |
| 2034 | maxNeutralTransfers | 113.0675B | 67.9376B | 39.9141% |
| 2035 | gdpReal | 51.9056T | 53.5094T | 3.0899% |
| 2035 | aiAdditionalOutput | 120.9332B | 122.5205B | 1.3125% |
| 2035 | aiInvestmentBoost | 36.2800B | 36.7562B | 1.3125% |
| 2035 | aiNetExportBoost | 12.0933B | 12.2521B | 1.3125% |
| 2035 | aiConsumerGoodsPotential | 72.5599B | 73.5123B | 1.3125% |
| 2035 | aiGoodsAbsorbed | 72.5599B | 73.5123B | 1.3125% |
| 2035 | newJobEmployment | 1.1556M | 1.1880M | 2.8024% |
| 2035 | newJobWageIncome | 198.5886B | 204.2228B | 2.8371% |
| 2035 | potentialGDP | 51.9781T | 68.7808T | 32.3264% |
| 2035 | aiCorporateProfits | 30.2333B | 30.6301B | 1.3125% |
| 2035 | aiGDPContribution | 120.9332B | 122.5205B | 1.3125% |
| 2035 | moneySupply | 56.8982T | 92.7963T | 63.0919% |
| 2035 | maxNeutralTransfers | 207.3199B | 121.7137B | 41.2918% |
| 2036 | gdpReal | 51.2050T | 52.7175T | 2.9538% |
| 2036 | newJobEmployment | 1.1392M | 1.1742M | 3.0733% |
| 2036 | newJobWageIncome | 196.1879B | 202.3027B | 3.1168% |
| 2036 | potentialGDP | 51.3745T | 68.9528T | 34.2158% |
| 2036 | moneySupply | 60.2405T | 99.4809T | 65.1397% |
| 2036 | maxNeutralTransfers | 367.3464B | 222.5027B | 39.4297% |
| 2037 | gdpReal | 49.7258T | 50.8040T | 2.1682% |
| 2037 | newJobEmployment | 1.1025M | 1.1349M | 2.9393% |
| 2037 | newJobWageIncome | 185.1111B | 190.5255B | 2.9250% |
| 2037 | potentialGDP | 50.0800T | 67.3411T | 34.4671% |
| 2037 | moneySupply | 63.5961T | 106.1923T | 66.9791% |
| 2037 | maxNeutralTransfers | 554.5863B | 356.7041B | 35.6811% |
| 2038 | gdpNominal | 61.1231T | 60.4990T | 1.0209% |
| 2038 | consumption | 42.5932T | 42.0362T | 1.3079% |
| 2038 | newJobEmployment | 1.0418M | 1.0644M | 2.1663% |
| 2038 | newJobWageIncome | 164.5757B | 167.8623B | 1.9970% |
| 2038 | potentialGDP | 46.4932T | 61.1580T | 31.5418% |
| 2038 | traditionalCorporateProfits | 6.6028T | 6.5341T | 1.0401% |
| 2038 | moneySupply | 66.9652T | 112.9305T | 68.6405% |
| 2038 | maxNeutralTransfers | 802.0616B | 608.9619B | 24.0754% |
| 2039 | aggregateWageIncome | 28.5480T | 28.2484T | 1.0495% |
| 2039 | aggregateAssetIncome | 14.5116T | 14.3498T | 1.1150% |
| 2039 | gdpNominal | 50.7541T | 49.4126T | 2.6431% |
| 2039 | gdpReal | 39.5475T | 37.7373T | 4.5772% |
| 2039 | consumption | 33.4681T | 32.3474T | 3.3487% |
| 2039 | investment | 10.7125T | 10.5219T | 1.7796% |
| 2039 | newJobWageIncome | 121.0784B | 119.7407B | 1.1048% |
| 2039 | potentialGDP | 40.8576T | 50.7240T | 24.1484% |
| 2039 | wageConsumption | 21.8013T | 21.5714T | 1.0547% |
| 2039 | assetConsumption | 5.0790T | 5.0224T | 1.1150% |
| 2039 | corporateProfits | 5.8886T | 5.7414T | 2.5008% |
| 2039 | traditionalCorporateProfits | 5.3428T | 5.1950T | 2.7664% |
| 2039 | moneySupply | 70.3478T | 119.6957T | 70.1483% |
| 2039 | maxNeutralTransfers | 978.4780B | 1.0480T | 7.1055% |
| 2040 | aggregateWageIncome | 18.9856T | 18.4203T | 2.9775% |
| 2040 | aggregateAssetIncome | 12.7244T | 12.3497T | 2.9447% |
| 2040 | totalIncome | 47.0187T | 46.0484T | 2.0637% |
| 2040 | gdpNominal | 40.5359T | 39.5166T | 2.5147% |
| 2040 | gdpReal | 33.4054T | 30.7757T | 7.8721% |
| 2040 | consumption | 24.5609T | 23.7805T | 3.1774% |
| 2040 | investment | 9.3096T | 9.1058T | 2.1895% |
| 2040 | newJobEmployment | 696.1787K | 663.3016K | 4.7225% |
| 2040 | newJobWageIncome | 68.6308B | 63.5435B | 7.4126% |
| 2040 | potentialGDP | 35.8838T | 42.0088T | 17.0693% |
| 2040 | wageConsumption | 13.9007T | 13.4778T | 3.0422% |
| 2040 | assetConsumption | 4.4535T | 4.3224T | 2.9447% |
| 2040 | corporateProfits | 5.0372T | 4.9284T | 2.1616% |
| 2040 | traditionalCorporateProfits | 4.0046T | 3.8899T | 2.8637% |
| 2040 | moneySupply | 73.7439T | 126.4879T | 71.5231% |
| 2040 | maxNeutralTransfers | 1.0817T | 1.9957T | 84.4860% |
| 2041 | aggregateWageIncome | 10.6081T | 10.3344T | 2.5800% |
| 2041 | aggregateAssetIncome | 10.7988T | 10.5008T | 2.7590% |
| 2041 | totalIncome | 37.1039T | 36.4993T | 1.6296% |
| 2041 | gdpNominal | 34.2065T | 33.8067T | 1.1688% |
| 2041 | gdpReal | 30.1041T | 27.1225T | 9.9045% |
| 2041 | consumption | 18.4314T | 18.2335T | 1.0737% |
| 2041 | investment | 8.8849T | 8.7172T | 1.8870% |
| 2041 | unrealizedAIOutput | 562.9821B | 604.5569B | 7.3847% |
| 2041 | aiGoodsAbsorbed | 3.8721T | 3.8306T | 1.0737% |
| 2041 | newJobEmployment | 478.2812K | 440.6302K | 7.8721% |
| 2041 | newJobWageIncome | 31.3034B | 28.1016B | 10.2282% |
| 2041 | potentialGDP | 34.5393T | 38.2418T | 10.7198% |
| 2041 | wageConsumption | 7.2249T | 7.0374T | 2.5948% |
| 2041 | assetConsumption | 3.7796T | 3.6753T | 2.7590% |
| 2041 | corporateProfits | 4.7188T | 4.6690T | 1.0554% |
| 2041 | traditionalCorporateProfits | 3.0115T | 2.9721T | 1.3085% |
| 2041 | moneySupply | 77.1536T | 133.3073T | 72.7816% |
| 2041 | maxNeutralTransfers | 1.1874T | 2.1396T | 80.1910% |
| 2042 | aggregateWageIncome | 6.9146T | 6.8089T | 1.5277% |
| 2042 | gdpReal | 29.6022T | 25.8863T | 12.5528% |
| 2042 | unrealizedAIOutput | 1.4696T | 1.4857T | 1.0958% |
| 2042 | newJobEmployment | 369.8867K | 333.2514K | 9.9045% |
| 2042 | newJobWageIncome | 18.0349B | 16.0258B | 11.1400% |
| 2042 | potentialGDP | 35.2433T | 36.6577T | 4.0134% |
| 2042 | wageConsumption | 4.4682T | 4.3965T | 1.6052% |
| 2042 | totalDemandSpilloverLoss | 524.0630K | 674.1158K | 28.6326% |
| 2042 | moneySupply | 80.5770T | 140.1539T | 73.9380% |
| 2042 | maxNeutralTransfers | 1.3662T | 2.3894T | 74.8943% |
| 2043 | aggregateWageIncome | 4.2330T | 4.1868T | 1.0922% |
| 2043 | gdpReal | 31.2272T | 26.3874T | 15.4985% |
| 2043 | newJobEmployment | 293.4626K | 256.6247K | 12.5528% |
| 2043 | newJobWageIncome | 10.8996B | 9.4559B | 13.2459% |
| 2043 | potentialGDP | 38.0154T | 36.7497T | 3.3295% |
| 2043 | wageConsumption | 2.5219T | 2.4910T | 1.2242% |
| 2043 | totalDemandSpilloverLoss | 3.8706M | 4.1268M | 6.6180% |
| 2043 | moneySupply | 84.0140T | 147.0280T | 75.0042% |
| 2043 | maxNeutralTransfers | 1.7437T | 2.9470T | 69.0031% |
| 2044 | gdpReal | 34.8811T | 28.3223T | 18.8033% |
| 2044 | newJobEmployment | 266.3894K | 225.1148K | 15.4941% |
| 2044 | newJobWageIncome | 8.5052B | 7.1838B | 15.5361% |
| 2044 | potentialGDP | 42.5036T | 37.5773T | 11.5901% |
| 2044 | moneySupply | 87.4648T | 153.9296T | 75.9903% |
| 2044 | maxNeutralTransfers | 2.3475T | 3.8120T | 62.3893% |
| 2045 | gdpReal | 40.2451T | 31.3297T | 22.1527% |
| 2045 | consumerWelfareIndex | 46.7062K | 36.3124K | 22.2536% |
| 2045 | newJobEmployment | 265.3529K | 215.5282K | 18.7768% |
| 2045 | newJobWageIncome | 7.9467B | 6.4484B | 18.8539% |
| 2045 | potentialGDP | 48.5373T | 38.8458T | 19.9672% |
| 2045 | moneySupply | 90.9294T | 160.8587T | 76.9051% |
| 2045 | maxNeutralTransfers | 2.9750T | 4.6312T | 55.6721% |
| 2046 | aggregateAssetIncome | 11.8811T | 11.5764T | 2.5646% |
| 2046 | totalIncome | 31.3816T | 31.0295T | 1.1219% |
| 2046 | gdpReal | 46.8613T | 34.9940T | 25.3244% |
| 2046 | consumerWelfareIndex | 53.6451K | 39.9933K | 25.4483% |
| 2046 | unrealizedAIOutput | 3.2243T | 3.2574T | 1.0249% |
| 2046 | newJobEmployment | 283.0741K | 220.3692K | 22.1514% |
| 2046 | newJobWageIncome | 8.3773B | 6.4934B | 22.4877% |
| 2046 | potentialGDP | 55.5522T | 39.9262T | 28.1284% |
| 2046 | assetConsumption | 4.1584T | 4.0517T | 2.5646% |
| 2046 | totalDemandSpilloverLoss | 4.6575M | 4.7626M | 2.2581% |
| 2046 | moneySupply | 94.4078T | 167.8156T | 77.7561% |
| 2046 | maxNeutralTransfers | 3.6968T | 5.5212T | 49.3486% |
| 2047 | aggregateAssetIncome | 12.6240T | 12.1264T | 3.9415% |
| 2047 | totalIncome | 32.1522T | 31.6003T | 1.7165% |
| 2047 | gdpReal | 54.4602T | 39.0516T | 28.2933% |
| 2047 | consumerWelfareIndex | 61.7586K | 44.2062K | 28.4209% |
| 2047 | unrealizedAIOutput | 3.2749T | 3.3123T | 1.1428% |
| 2047 | newJobEmployment | 309.6815K | 231.2317K | 25.3324% |
| 2047 | newJobWageIncome | 9.1511B | 6.7876B | 25.8277% |
| 2047 | potentialGDP | 63.4366T | 40.6775T | 35.8769% |
| 2047 | wageConsumption | 1.3771T | 1.3619T | 1.1035% |
| 2047 | assetConsumption | 4.4184T | 4.2443T | 3.9415% |
| 2047 | totalDemandSpilloverLoss | 3.5061M | 3.6692M | 4.6520% |
| 2047 | moneySupply | 97.9001T | 174.8003T | 78.5496% |
| 2047 | maxNeutralTransfers | 4.5163T | 6.4776T | 43.4285% |
| 2048 | aggregateWageIncome | 2.5321T | 2.5044T | 1.0947% |
| 2048 | aggregateAssetIncome | 13.0921T | 12.4345T | 5.0231% |
| 2048 | totalIncome | 32.6402T | 31.9265T | 2.1865% |
| 2048 | gdpReal | 63.1818T | 43.5287T | 31.1056% |
| 2048 | consumerWelfareIndex | 71.2160K | 48.9752K | 31.2301% |
| 2048 | unrealizedAIOutput | 3.3165T | 3.3534T | 1.1139% |
| 2048 | newJobEmployment | 342.2875K | 245.3782K | 28.3123% |
| 2048 | newJobWageIncome | 10.0475B | 7.1501B | 28.8372% |
| 2048 | potentialGDP | 72.3714T | 41.1640T | 43.1211% |
| 2048 | wageConsumption | 1.3395T | 1.3230T | 1.2347% |
| 2048 | assetConsumption | 4.5822T | 4.3521T | 5.0231% |
| 2048 | totalDemandSpilloverLoss | 2.7270M | 2.8985M | 6.2882% |
| 2048 | moneySupply | 101.4065T | 181.8129T | 79.2913% |
| 2048 | maxNeutralTransfers | 5.4444T | 7.5034T | 37.8195% |
| 2049 | aggregateWageIncome | 2.4970T | 2.4706T | 1.0559% |
| 2049 | aggregateAssetIncome | 13.4170T | 12.6148T | 5.9791% |
| 2049 | totalIncome | 32.9880T | 32.1310T | 2.5978% |
| 2049 | gdpReal | 73.3331T | 48.5435T | 33.8041% |
| 2049 | consumerWelfareIndex | 82.3075K | 54.3957K | 33.9116% |
| 2049 | unrealizedAIOutput | 3.3405T | 3.3739T | 1.0010% |
| 2049 | newJobEmployment | 384.4992K | 264.8985K | 31.1056% |
| 2049 | newJobWageIncome | 11.2006B | 7.6630B | 31.5843% |
| 2049 | potentialGDP | 82.6747T | 41.5061T | 49.7959% |
| 2049 | wageConsumption | 1.3135T | 1.2978T | 1.1947% |
| 2049 | assetConsumption | 4.6960T | 4.4152T | 5.9791% |
| 2049 | totalDemandSpilloverLoss | 2.3136M | 2.4726M | 6.8715% |
| 2049 | moneySupply | 104.9268T | 188.8536T | 79.9860% |
| 2049 | maxNeutralTransfers | 6.4682T | 8.5633T | 32.3918% |
| 2050 | aggregateWageIncome | 2.4814T | 2.4562T | 1.0157% |
| 2050 | aggregateAssetIncome | 13.6593T | 12.7284T | 6.8147% |
| 2050 | totalIncome | 33.2628T | 32.2785T | 2.9591% |
| 2050 | gdpReal | 85.2068T | 54.1913T | 36.4002% |
| 2050 | consumerWelfareIndex | 95.2658K | 60.5123K | 36.4805% |
| 2050 | newJobEmployment | 438.1529K | 290.0393K | 33.8041% |
| 2050 | newJobWageIncome | 12.6998B | 8.3522B | 34.2339% |
| 2050 | potentialGDP | 94.6558T | 41.7811T | 55.8599% |
| 2050 | wageConsumption | 1.3014T | 1.2864T | 1.1584% |
| 2050 | assetConsumption | 4.7807T | 4.4550T | 6.8147% |
| 2050 | totalDemandSpilloverLoss | 2.0768M | 2.2151M | 6.6626% |
| 2050 | moneySupply | 108.4612T | 195.9225T | 80.6382% |
| 2050 | maxNeutralTransfers | 7.6114T | 9.6817T | 27.1996% |

## Field Comparison Warnings

319 fields between 0.01-1% relative error.

| Year | Field | Expected | Actual | Error |
|-----:|-------|----------|--------|------:|
| 2026 | gdpReal | 37.6905T | 37.8063T | 0.3073% |
| 2026 | consumerWelfareIndex | 81.3064K | 81.5562K | 0.3073% |
| 2027 | totalUnemployment | 6.7585M | 6.7558M | 0.0386% |
| 2027 | gdpReal | 42.5939T | 42.8563T | 0.6159% |
| 2027 | consumerWelfareIndex | 90.9809K | 91.5415K | 0.6161% |
| 2027 | newJobEmployment | 848.0358K | 850.6415K | 0.3073% |
| 2027 | newJobWageIncome | 86.6987B | 86.9651B | 0.3073% |
| 2028 | totalUnemployment | 6.6786M | 6.6726M | 0.0884% |
| 2028 | gdpReal | 46.0435T | 46.4699T | 0.9261% |
| 2028 | consumerWelfareIndex | 97.9389K | 98.8463K | 0.9265% |
| 2028 | newJobEmployment | 958.3634K | 964.2664K | 0.6159% |
| 2028 | newJobWageIncome | 113.5332B | 114.2331B | 0.6164% |
| 2029 | totalUnemployment | 6.6315M | 6.6219M | 0.1447% |
| 2029 | consumerWelfareIndex | 102.5745K | 103.8447K | 1.2383% |
| 2029 | newJobEmployment | 1.0360M | 1.0456M | 0.9261% |
| 2029 | newJobWageIncome | 136.0322B | 137.2939B | 0.9275% |
| 2030 | totalUnemployment | 6.6084M | 6.5949M | 0.2041% |
| 2030 | consumerWelfareIndex | 105.5288K | 107.1661K | 1.5515% |
| 2031 | totalEmployment | 169.0496M | 169.0670M | 0.0103% |
| 2031 | totalUnemployment | 6.6027M | 6.5852M | 0.2645% |
| 2031 | aggregateWageIncome | 34.9746T | 34.9789T | 0.0121% |
| 2031 | consumerWelfareIndex | 107.2681K | 109.2698K | 1.8660% |
| 2031 | wageConsumption | 27.9797T | 27.9831T | 0.0121% |
| 2032 | totalEmployment | 169.7422M | 169.7635M | 0.0126% |
| 2032 | totalUnemployment | 6.6127M | 6.5913M | 0.3223% |
| 2032 | aggregateWageIncome | 36.7696T | 36.7754T | 0.0158% |
| 2032 | totalIncome | 63.2505T | 63.2571T | 0.0105% |
| 2032 | consumption | 46.3277T | 46.3327T | 0.0106% |
| 2032 | consumerWelfareIndex | 108.1404K | 110.5002K | 2.1822% |
| 2032 | wageConsumption | 29.4157T | 29.4203T | 0.0158% |
| 2033 | totalEmployment | 170.3631M | 170.3857M | 0.0133% |
| 2033 | totalUnemployment | 6.6972M | 6.6745M | 0.3386% |
| 2033 | aggregateWageIncome | 38.2651T | 38.2724T | 0.0190% |
| 2033 | aggregateAssetIncome | 13.1363T | 13.1380T | 0.0126% |
| 2033 | totalIncome | 65.5064T | 65.5150T | 0.0131% |
| 2033 | gdpNominal | 65.4399T | 65.4473T | 0.0113% |
| 2033 | consumption | 47.9188T | 47.9247T | 0.0125% |
| 2033 | investment | 11.5252T | 11.5268T | 0.0137% |
| 2033 | consumerWelfareIndex | 108.3296K | 111.0406K | 2.5025% |
| 2033 | wageConsumption | 30.6121T | 30.6179T | 0.0190% |
| 2033 | assetConsumption | 4.5977T | 4.5983T | 0.0126% |
| 2033 | corporateProfits | 7.1992T | 7.2000T | 0.0117% |
| 2033 | traditionalCorporateProfits | 7.1978T | 7.1986T | 0.0110% |
| 2034 | totalUnemployment | 7.0885M | 7.0715M | 0.2402% |
| 2034 | aggregateWageIncome | 39.4768T | 39.4843T | 0.0191% |
| 2034 | aggregateAssetIncome | 13.6326T | 13.6361T | 0.0258% |
| 2034 | totalIncome | 67.4388T | 67.4492T | 0.0154% |
| 2034 | gdpNominal | 67.2628T | 67.2704T | 0.0113% |
| 2034 | consumption | 49.2638T | 49.2694T | 0.0114% |
| 2034 | investment | 11.8375T | 11.8398T | 0.0196% |
| 2034 | consumerWelfareIndex | 108.0728K | 111.1228K | 2.8221% |
| 2034 | wageConsumption | 31.5814T | 31.5874T | 0.0191% |
| 2034 | assetConsumption | 4.7714T | 4.7726T | 0.0258% |
| 2034 | corporateProfits | 7.4038T | 7.4047T | 0.0129% |
| 2034 | traditionalCorporateProfits | 7.3951T | 7.3958T | 0.0101% |
| 2035 | totalUnemployment | 8.0662M | 8.0546M | 0.1439% |
| 2035 | aggregateWageIncome | 40.2849T | 40.2978T | 0.0322% |
| 2035 | aggregateAssetIncome | 14.1705T | 14.1756T | 0.0363% |
| 2035 | aggregateTransferIncome | 14.5454T | 14.5433T | 0.0145% |
| 2035 | totalIncome | 69.0007T | 69.0167T | 0.0232% |
| 2035 | gdpNominal | 68.6985T | 68.7073T | 0.0128% |
| 2035 | consumption | 50.2179T | 50.2251T | 0.0143% |
| 2035 | investment | 12.1641T | 12.1668T | 0.0223% |
| 2035 | governmentSpending | 7.9409T | 7.9398T | 0.0137% |
| 2035 | consumerWelfareIndex | 107.2282K | 110.5431K | 3.0915% |
| 2035 | wageConsumption | 32.2039T | 32.2155T | 0.0363% |
| 2035 | assetConsumption | 4.9597T | 4.9615T | 0.0363% |
| 2035 | transferConsumption | 13.0909T | 13.0890T | 0.0145% |
| 2035 | corporateProfits | 7.5738T | 7.5750T | 0.0157% |
| 2035 | traditionalCorporateProfits | 7.5435T | 7.5443T | 0.0105% |
| 2036 | totalEmployment | 169.7248M | 169.7423M | 0.0103% |
| 2036 | totalUnemployment | 9.4687M | 9.4512M | 0.1851% |
| 2036 | aggregateWageIncome | 40.1006T | 40.1178T | 0.0429% |
| 2036 | aggregateAssetIncome | 14.7044T | 14.7094T | 0.0343% |
| 2036 | aggregateTransferIncome | 14.7198T | 14.7071T | 0.0862% |
| 2036 | totalIncome | 69.5248T | 69.5344T | 0.0138% |
| 2036 | gdpNominal | 68.8110T | 68.7821T | 0.0421% |
| 2036 | consumption | 49.9342T | 49.9108T | 0.0469% |
| 2036 | investment | 12.4434T | 12.4464T | 0.0244% |
| 2036 | governmentSpending | 8.0765T | 8.0680T | 0.1058% |
| 2036 | consumerWelfareIndex | 104.5930K | 107.6773K | 2.9489% |
| 2036 | aiAdditionalOutput | 282.6292B | 284.4419B | 0.6414% |
| 2036 | aiInvestmentBoost | 84.7888B | 85.3326B | 0.6414% |
| 2036 | aiNetExportBoost | 28.2629B | 28.4442B | 0.6414% |
| 2036 | aiConsumerGoodsPotential | 169.5775B | 170.6651B | 0.6414% |
| 2036 | aiGoodsAbsorbed | 169.5775B | 170.6651B | 0.6414% |
| 2036 | wageConsumption | 31.9033T | 31.9189T | 0.0491% |
| 2036 | assetConsumption | 5.1465T | 5.1483T | 0.0343% |
| 2036 | transferConsumption | 13.2478T | 13.2364T | 0.0862% |
| 2036 | corporateProfits | 7.6088T | 7.6059T | 0.0385% |
| 2036 | aiCorporateProfits | 70.6573B | 71.1105B | 0.6414% |
| 2036 | traditionalCorporateProfits | 7.5381T | 7.5347T | 0.0449% |
| 2036 | aiGDPContribution | 282.6292B | 284.4419B | 0.6414% |
| 2037 | totalEmployment | 168.2847M | 168.3020M | 0.0103% |
| 2037 | totalUnemployment | 11.6256M | 11.6083M | 0.1486% |
| 2037 | aggregateWageIncome | 38.5885T | 38.5830T | 0.0144% |
| 2037 | aggregateAssetIncome | 15.0828T | 15.0797T | 0.0204% |
| 2037 | aggregateTransferIncome | 14.8230T | 14.7889T | 0.2298% |
| 2037 | totalIncome | 68.4943T | 68.4516T | 0.0624% |
| 2037 | gdpNominal | 67.1159T | 66.9856T | 0.1941% |
| 2037 | consumption | 48.2429T | 48.1478T | 0.1970% |
| 2037 | investment | 12.3826T | 12.3716T | 0.0890% |
| 2037 | governmentSpending | 8.1054T | 8.0803T | 0.3101% |
| 2037 | consumerWelfareIndex | 100.2090K | 102.3787K | 2.1652% |
| 2037 | aiAdditionalOutput | 590.2807B | 592.5644B | 0.3869% |
| 2037 | aiInvestmentBoost | 177.0842B | 177.7693B | 0.3869% |
| 2037 | aiNetExportBoost | 59.0281B | 59.2564B | 0.3869% |
| 2037 | aiConsumerGoodsPotential | 354.1684B | 355.5387B | 0.3869% |
| 2037 | aiGoodsAbsorbed | 354.1684B | 355.5387B | 0.3869% |
| 2037 | assetConsumption | 5.2790T | 5.2779T | 0.0204% |
| 2037 | transferConsumption | 13.3407T | 13.3100T | 0.2298% |
| 2037 | corporateProfits | 7.4654T | 7.4514T | 0.1877% |
| 2037 | aiCorporateProfits | 147.5702B | 148.1411B | 0.3869% |
| 2037 | traditionalCorporateProfits | 7.3178T | 7.3032T | 0.1993% |
| 2037 | aiGDPContribution | 590.2807B | 592.5644B | 0.3869% |
| 2038 | totalEmployment | 165.9691M | 165.9897M | 0.0124% |
| 2038 | totalUnemployment | 14.6608M | 14.6402M | 0.1406% |
| 2038 | aggregateWageIncome | 35.5476T | 35.4916T | 0.1576% |
| 2038 | aggregateAssetIncome | 15.1819T | 15.1521T | 0.1963% |
| 2038 | aggregateTransferIncome | 14.9081T | 14.8740T | 0.2290% |
| 2038 | totalIncome | 65.6376T | 65.5177T | 0.1827% |
| 2038 | gdpReal | 45.8344T | 45.8088T | 0.0560% |
| 2038 | investment | 12.0055T | 11.9640T | 0.3460% |
| 2038 | governmentSpending | 8.0474T | 8.0188T | 0.3555% |
| 2038 | consumerWelfareIndex | 89.1888K | 88.8804K | 0.3458% |
| 2038 | aiAdditionalOutput | 1.0979T | 1.0982T | 0.0276% |
| 2038 | aiInvestmentBoost | 329.3805B | 329.4713B | 0.0276% |
| 2038 | aiNetExportBoost | 109.7935B | 109.8238B | 0.0276% |
| 2038 | aiConsumerGoodsPotential | 658.7610B | 658.9426B | 0.0276% |
| 2038 | aiGoodsAbsorbed | 658.7610B | 658.9426B | 0.0276% |
| 2038 | wageConsumption | 27.7776T | 27.7358T | 0.1503% |
| 2038 | assetConsumption | 5.3137T | 5.3032T | 0.1963% |
| 2038 | transferConsumption | 13.4173T | 13.3866T | 0.2290% |
| 2038 | corporateProfits | 6.8772T | 6.8086T | 0.9975% |
| 2038 | aiCorporateProfits | 274.4837B | 274.5594B | 0.0276% |
| 2038 | aiGDPContribution | 1.0979T | 1.0982T | 0.0276% |
| 2039 | totalUnemployment | 21.1566M | 21.1711M | 0.0688% |
| 2039 | aggregateTransferIncome | 15.0598T | 15.0263T | 0.2222% |
| 2039 | totalIncome | 58.1194T | 57.6245T | 0.8515% |
| 2039 | governmentSpending | 7.8422T | 7.7967T | 0.5804% |
| 2039 | consumerWelfareIndex | 72.5317K | 68.7101K | 5.2688% |
| 2039 | aiAdditionalOutput | 2.1835T | 2.1857T | 0.0991% |
| 2039 | aiInvestmentBoost | 655.0503B | 655.6992B | 0.0991% |
| 2039 | aiNetExportBoost | 218.3501B | 218.5664B | 0.0991% |
| 2039 | aiConsumerGoodsPotential | 1.3101T | 1.3114T | 0.0991% |
| 2039 | aiGoodsAbsorbed | 1.3101T | 1.3114T | 0.0991% |
| 2039 | newJobEmployment | 904.0859K | 903.4569K | 0.0696% |
| 2039 | transferConsumption | 13.5538T | 13.5237T | 0.2222% |
| 2039 | aiCorporateProfits | 545.8752B | 546.4160B | 0.0991% |
| 2039 | aiGDPContribution | 2.1835T | 2.1857T | 0.0991% |
| 2040 | totalEmployment | 149.3652M | 149.1872M | 0.1191% |
| 2040 | totalUnemployment | 32.7127M | 32.8907M | 0.5440% |
| 2040 | aggregateTransferIncome | 15.3087T | 15.2784T | 0.1981% |
| 2040 | governmentSpending | 7.4871T | 7.4170T | 0.9360% |
| 2040 | consumerWelfareIndex | 56.0707K | 51.3056K | 8.4984% |
| 2040 | aiAdditionalOutput | 4.1306T | 4.1538T | 0.5609% |
| 2040 | aiInvestmentBoost | 1.2392T | 1.2461T | 0.5609% |
| 2040 | aiNetExportBoost | 413.0622B | 415.3792B | 0.5609% |
| 2040 | aiConsumerGoodsPotential | 2.4784T | 2.4923T | 0.5609% |
| 2040 | aiGoodsAbsorbed | 2.4784T | 2.4923T | 0.5609% |
| 2040 | transferConsumption | 13.7778T | 13.7506T | 0.1981% |
| 2040 | aiCorporateProfits | 1.0327T | 1.0384T | 0.5609% |
| 2040 | aiGDPContribution | 4.1306T | 4.1538T | 0.5609% |
| 2041 | totalEmployment | 131.2822M | 131.2446M | 0.0287% |
| 2041 | totalUnemployment | 51.5240M | 51.5616M | 0.0731% |
| 2041 | aggregateTransferIncome | 15.6971T | 15.6640T | 0.2103% |
| 2041 | governmentSpending | 7.1372T | 7.0782T | 0.8274% |
| 2041 | consumerWelfareIndex | 44.7566K | 40.3625K | 9.8178% |
| 2041 | transferConsumption | 14.1274T | 14.0976T | 0.2103% |
| 2041 | aiCorporateProfits | 1.7072T | 1.6968T | 0.6088% |
| 2041 | aiGDPContribution | 6.8289T | 6.7873T | 0.6088% |
| 2042 | totalEmployment | 119.0079M | 118.8212M | 0.1569% |
| 2042 | totalUnemployment | 64.5295M | 64.7162M | 0.2893% |
| 2042 | aggregateAssetIncome | 9.3585T | 9.2887T | 0.7468% |
| 2042 | aggregateTransferIncome | 15.9740T | 15.9439T | 0.1888% |
| 2042 | totalIncome | 32.2472T | 32.0415T | 0.6378% |
| 2042 | gdpNominal | 31.1718T | 31.0167T | 0.4977% |
| 2042 | consumption | 15.6115T | 15.5512T | 0.3860% |
| 2042 | investment | 8.5319T | 8.4651T | 0.7824% |
| 2042 | governmentSpending | 6.9205T | 6.8826T | 0.5467% |
| 2042 | consumerWelfareIndex | 40.7431K | 35.6686K | 12.4547% |
| 2042 | aiGoodsAbsorbed | 4.1715T | 4.1554T | 0.3860% |
| 2042 | assetConsumption | 3.2755T | 3.2510T | 0.7468% |
| 2042 | transferConsumption | 14.3766T | 14.3495T | 0.1888% |
| 2042 | corporateProfits | 4.5394T | 4.5201T | 0.4256% |
| 2042 | aiCorporateProfits | 1.9831T | 1.9790T | 0.2030% |
| 2042 | traditionalCorporateProfits | 2.5563T | 2.5411T | 0.5982% |
| 2042 | aiGDPContribution | 7.9322T | 7.9161T | 0.2030% |
| 2043 | totalEmployment | 100.8920M | 100.5990M | 0.2904% |
| 2043 | totalUnemployment | 83.3796M | 83.6725M | 0.3514% |
| 2043 | aggregateAssetIncome | 9.2256T | 9.2477T | 0.2398% |
| 2043 | aggregateTransferIncome | 16.3634T | 16.3352T | 0.1718% |
| 2043 | totalIncome | 29.8219T | 29.7697T | 0.1751% |
| 2043 | gdpNominal | 29.9666T | 29.9615T | 0.0170% |
| 2043 | consumption | 13.7797T | 13.7873T | 0.0553% |
| 2043 | investment | 8.9973T | 9.0102T | 0.1441% |
| 2043 | governmentSpending | 6.8166T | 6.7871T | 0.4322% |
| 2043 | consumerWelfareIndex | 39.3053K | 33.2376K | 15.4374% |
| 2043 | unrealizedAIOutput | 2.3574T | 2.3550T | 0.1039% |
| 2043 | aiGoodsAbsorbed | 4.4308T | 4.4333T | 0.0553% |
| 2043 | assetConsumption | 3.2290T | 3.2367T | 0.2398% |
| 2043 | transferConsumption | 14.7270T | 14.7017T | 0.1718% |
| 2043 | aiCorporateProfits | 2.2391T | 2.2397T | 0.0274% |
| 2043 | traditionalCorporateProfits | 2.3111T | 2.3103T | 0.0359% |
| 2043 | aiGDPContribution | 8.9563T | 8.9588T | 0.0274% |
| 2044 | totalEmployment | 89.7280M | 89.6941M | 0.0378% |
| 2044 | totalUnemployment | 95.2806M | 95.3145M | 0.0356% |
| 2044 | aggregateWageIncome | 3.1699T | 3.1675T | 0.0774% |
| 2044 | aggregateAssetIncome | 9.7046T | 9.7588T | 0.5583% |
| 2044 | aggregateTransferIncome | 16.6194T | 16.5863T | 0.1991% |
| 2044 | totalIncome | 29.4939T | 29.5125T | 0.0632% |
| 2044 | gdpNominal | 29.9709T | 29.9552T | 0.0523% |
| 2044 | consumption | 13.1209T | 13.1010T | 0.1520% |
| 2044 | investment | 9.5333T | 9.5618T | 0.2992% |
| 2044 | governmentSpending | 6.7753T | 6.7510T | 0.3590% |
| 2044 | consumerWelfareIndex | 41.6328K | 33.7707K | 18.8842% |
| 2044 | unrealizedAIOutput | 2.8850T | 2.8920T | 0.2444% |
| 2044 | aiGoodsAbsorbed | 4.7375T | 4.7301T | 0.1572% |
| 2044 | wageConsumption | 1.7894T | 1.7877T | 0.0937% |
| 2044 | assetConsumption | 3.3966T | 3.4156T | 0.5583% |
| 2044 | transferConsumption | 14.9574T | 14.9276T | 0.1991% |
| 2044 | corporateProfits | 4.6715T | 4.6687T | 0.0600% |
| 2044 | aiCorporateProfits | 2.4548T | 2.4529T | 0.0785% |
| 2044 | traditionalCorporateProfits | 2.2167T | 2.2158T | 0.0396% |
| 2044 | aiGDPContribution | 9.8192T | 9.8115T | 0.0785% |
| 2044 | totalDemandSpilloverLoss | 5.9900M | 5.9857M | 0.0712% |
| 2045 | totalEmployment | 83.6807M | 83.6346M | 0.0551% |
| 2045 | totalUnemployment | 102.0679M | 102.1141M | 0.0452% |
| 2045 | aggregateWageIncome | 2.7388T | 2.7349T | 0.1413% |
| 2045 | aggregateAssetIncome | 10.7173T | 10.6422T | 0.7007% |
| 2045 | aggregateTransferIncome | 16.7773T | 16.7444T | 0.1958% |
| 2045 | totalIncome | 30.2334T | 30.1216T | 0.3698% |
| 2045 | gdpNominal | 30.6427T | 30.5571T | 0.2791% |
| 2045 | consumption | 13.0961T | 13.0426T | 0.4083% |
| 2045 | investment | 10.1183T | 10.1111T | 0.0708% |
| 2045 | governmentSpending | 6.7754T | 6.7508T | 0.3643% |
| 2045 | aiAdditionalOutput | 13.8203T | 13.8143T | 0.0432% |
| 2045 | aiInvestmentBoost | 4.1461T | 4.1443T | 0.0432% |
| 2045 | aiNetExportBoost | 1.3820T | 1.3814T | 0.0432% |
| 2045 | aiConsumerGoodsPotential | 8.2922T | 8.2886T | 0.0432% |
| 2045 | unrealizedAIOutput | 3.1482T | 3.1678T | 0.6237% |
| 2045 | aiGoodsAbsorbed | 5.1440T | 5.1208T | 0.4513% |
| 2045 | wageConsumption | 1.4988T | 1.4964T | 0.1640% |
| 2045 | assetConsumption | 3.7511T | 3.7248T | 0.7007% |
| 2045 | transferConsumption | 15.0995T | 15.0700T | 0.1958% |
| 2045 | corporateProfits | 4.8648T | 4.8518T | 0.2671% |
| 2045 | aiCorporateProfits | 2.6680T | 2.6616T | 0.2399% |
| 2045 | traditionalCorporateProfits | 2.1968T | 2.1902T | 0.3001% |
| 2045 | aiGDPContribution | 10.6721T | 10.6465T | 0.2399% |
| 2045 | totalDemandSpilloverLoss | 5.8060M | 5.8205M | 0.2486% |
| 2046 | totalEmployment | 80.9443M | 80.7773M | 0.2063% |
| 2046 | totalUnemployment | 105.5474M | 105.7143M | 0.1582% |
| 2046 | aggregateWageIncome | 2.6287T | 2.6118T | 0.6406% |
| 2046 | aggregateTransferIncome | 16.8718T | 16.8413T | 0.1810% |
| 2046 | gdpNominal | 31.3733T | 31.2354T | 0.4394% |
| 2046 | consumption | 13.2789T | 13.1986T | 0.6047% |
| 2046 | investment | 10.5929T | 10.5604T | 0.3075% |
| 2046 | governmentSpending | 6.7984T | 6.7714T | 0.3982% |
| 2046 | aiGoodsAbsorbed | 5.4665T | 5.4335T | 0.6049% |
| 2046 | wageConsumption | 1.4169T | 1.4066T | 0.7231% |
| 2046 | transferConsumption | 15.1846T | 15.1571T | 0.1810% |
| 2046 | corporateProfits | 5.0275T | 5.0077T | 0.3938% |
| 2046 | aiCorporateProfits | 2.8151T | 2.8068T | 0.2938% |
| 2046 | traditionalCorporateProfits | 2.2124T | 2.2009T | 0.5209% |
| 2046 | aiGDPContribution | 11.2604T | 11.2274T | 0.2938% |
| 2047 | totalEmployment | 79.2173M | 78.9703M | 0.3118% |
| 2047 | totalUnemployment | 108.0203M | 108.2674M | 0.2287% |
| 2047 | aggregateWageIncome | 2.5811T | 2.5558T | 0.9811% |
| 2047 | aggregateTransferIncome | 16.9471T | 16.9181T | 0.1711% |
| 2047 | gdpNominal | 31.8536T | 31.7011T | 0.4787% |
| 2047 | consumption | 13.4090T | 13.3211T | 0.6558% |
| 2047 | investment | 10.8883T | 10.8493T | 0.3586% |
| 2047 | governmentSpending | 6.8235T | 6.7946T | 0.4230% |
| 2047 | aiGoodsAbsorbed | 5.7014T | 5.6641T | 0.6548% |
| 2047 | transferConsumption | 15.2524T | 15.2263T | 0.1711% |
| 2047 | corporateProfits | 5.1399T | 5.1179T | 0.4279% |
| 2047 | aiCorporateProfits | 2.9214T | 2.9121T | 0.3190% |
| 2047 | traditionalCorporateProfits | 2.2185T | 2.2058T | 0.5712% |
| 2047 | aiGDPContribution | 11.6857T | 11.6484T | 0.3190% |
| 2048 | totalEmployment | 77.8335M | 77.5520M | 0.3616% |
| 2048 | totalUnemployment | 110.1531M | 110.4346M | 0.2555% |
| 2048 | aggregateTransferIncome | 17.0160T | 16.9877T | 0.1665% |
| 2048 | gdpNominal | 32.1176T | 31.9741T | 0.4469% |
| 2048 | consumption | 13.4922T | 13.4076T | 0.6268% |
| 2048 | investment | 11.0288T | 10.9955T | 0.3025% |
| 2048 | governmentSpending | 6.8399T | 6.8105T | 0.4294% |
| 2048 | aiGoodsAbsorbed | 5.8731T | 5.8365T | 0.6230% |
| 2048 | transferConsumption | 15.3144T | 15.2889T | 0.1665% |
| 2048 | corporateProfits | 5.2129T | 5.1920T | 0.4005% |
| 2048 | aiCorporateProfits | 2.9999T | 2.9908T | 0.3030% |
| 2048 | traditionalCorporateProfits | 2.2130T | 2.2012T | 0.5327% |
| 2048 | aiGDPContribution | 11.9995T | 11.9632T | 0.3030% |
| 2049 | totalEmployment | 77.0243M | 76.7457M | 0.3617% |
| 2049 | totalUnemployment | 111.7143M | 111.9929M | 0.2494% |
| 2049 | aggregateTransferIncome | 17.0740T | 17.0456T | 0.1663% |
| 2049 | gdpNominal | 32.2922T | 32.1645T | 0.3954% |
| 2049 | consumption | 13.5620T | 13.4865T | 0.5572% |
| 2049 | investment | 11.1056T | 11.0791T | 0.2392% |
| 2049 | governmentSpending | 6.8489T | 6.8199T | 0.4243% |
| 2049 | aiGoodsAbsorbed | 6.0012T | 5.9677T | 0.5572% |
| 2049 | transferConsumption | 15.3666T | 15.3411T | 0.1663% |
| 2049 | corporateProfits | 5.2642T | 5.2455T | 0.3558% |
| 2049 | aiCorporateProfits | 3.0572T | 3.0489T | 0.2734% |
| 2049 | traditionalCorporateProfits | 2.2070T | 2.1966T | 0.4698% |
| 2049 | aiGDPContribution | 12.2289T | 12.1955T | 0.2734% |
| 2050 | totalEmployment | 76.7391M | 76.4526M | 0.3733% |
| 2050 | totalUnemployment | 112.7544M | 113.0409M | 0.2541% |
| 2050 | aggregateTransferIncome | 17.1222T | 17.0939T | 0.1649% |
| 2050 | gdpNominal | 32.4434T | 32.3321T | 0.3428% |
| 2050 | consumption | 13.6273T | 13.5635T | 0.4687% |
| 2050 | investment | 11.1719T | 11.1500T | 0.1964% |
| 2050 | governmentSpending | 6.8549T | 6.8264T | 0.4160% |
| 2050 | unrealizedAIOutput | 3.3496T | 3.3782T | 0.8534% |
| 2050 | aiGoodsAbsorbed | 6.0994T | 6.0708T | 0.4687% |
| 2050 | transferConsumption | 15.4099T | 15.3845T | 0.1649% |
| 2050 | corporateProfits | 5.3046T | 5.2884T | 0.3061% |
| 2050 | aiCorporateProfits | 3.0997T | 3.0925T | 0.2305% |
| 2050 | traditionalCorporateProfits | 2.2049T | 2.1958T | 0.4122% |
| 2050 | aiGDPContribution | 12.3987T | 12.3701T | 0.2305% |

## Year-by-Year Detail

### Year 2025

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| moneySupply | 24.1987T | 27.3974T | 13.2186% | **FAIL** |

### Year 2026

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| gdpReal | 37.6905T | 37.8063T | 0.3073% | WARN |
| consumerWelfareIndex | 81.3064K | 81.5562K | 0.3073% | WARN |
| potentialGDP | 37.6905T | 38.8011T | 2.9466% | **FAIL** |
| moneySupply | 27.4102T | 33.8205T | 23.3863% | **FAIL** |

### Year 2027

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 6.7585M | 6.7558M | 0.0386% | WARN |
| gdpReal | 42.5939T | 42.8563T | 0.6159% | WARN |
| consumerWelfareIndex | 90.9809K | 91.5415K | 0.6161% | WARN |
| newJobEmployment | 848.0358K | 850.6415K | 0.3073% | WARN |
| newJobWageIncome | 86.6987B | 86.9651B | 0.3073% | WARN |
| potentialGDP | 42.5939T | 45.1413T | 5.9806% | **FAIL** |
| moneySupply | 30.6346T | 40.2692T | 31.4501% | **FAIL** |

### Year 2028

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 6.6786M | 6.6726M | 0.0884% | WARN |
| gdpReal | 46.0435T | 46.4699T | 0.9261% | WARN |
| consumerWelfareIndex | 97.9389K | 98.8463K | 0.9265% | WARN |
| newJobEmployment | 958.3634K | 964.2664K | 0.6159% | WARN |
| newJobWageIncome | 113.5332B | 114.2331B | 0.6164% | WARN |
| potentialGDP | 46.0435T | 50.2355T | 9.1045% | **FAIL** |
| moneySupply | 33.8719T | 46.7437T | 38.0016% | **FAIL** |

### Year 2029

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 6.6315M | 6.6219M | 0.1447% | WARN |
| gdpReal | 48.4344T | 49.0338T | 1.2376% | **FAIL** |
| consumerWelfareIndex | 102.5745K | 103.8447K | 1.2383% | WARN |
| newJobEmployment | 1.0360M | 1.0456M | 0.9261% | WARN |
| newJobWageIncome | 136.0322B | 137.2939B | 0.9275% | WARN |
| potentialGDP | 48.4344T | 54.4019T | 12.3209% | **FAIL** |
| moneySupply | 37.1221T | 53.2441T | 43.4299% | **FAIL** |

### Year 2030

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 6.6084M | 6.5949M | 0.2041% | WARN |
| gdpReal | 50.0546T | 50.8307T | 1.5505% | **FAIL** |
| consumerWelfareIndex | 105.5288K | 107.1661K | 1.5515% | WARN |
| newJobEmployment | 1.0898M | 1.1033M | 1.2376% | **FAIL** |
| newJobWageIncome | 154.3446B | 156.2592B | 1.2405% | **FAIL** |
| potentialGDP | 50.0546T | 57.8795T | 15.6327% | **FAIL** |
| moneySupply | 40.3853T | 59.7705T | 48.0008% | **FAIL** |

### Year 2031

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

### Year 2032

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

### Year 2033

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

### Year 2034

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

### Year 2035

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

### Year 2036

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

### Year 2037

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

### Year 2038

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

### Year 2039

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

### Year 2040

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

### Year 2041

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

### Year 2042

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

### Year 2043

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

### Year 2044

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

### Year 2045

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

### Year 2046

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

### Year 2047

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

### Year 2048

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

### Year 2049

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

### Year 2050

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
*Scenario "ubi_only" — ATLAS Verification Audit v1.0*
