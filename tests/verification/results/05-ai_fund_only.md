# Scenario: AI Fund Only

> SWF 30% ownership from 2030. Isolates asset channel.

Generated: 2026-02-23T20:50:03.899Z

## Summary

| Metric | Value |
|--------|------:|
| Total field comparisons | 1846 |
| PASS (<0.01% error) | 1374 |
| WARN (0.01-1% error) | 232 |
| FAIL (>1% error) | 240 |
| Invariant checks | 890 (890 pass, 0 fail) |
| Worst field | netInflation (890.2812%) |

## Field Comparison Failures

240 fields exceed 1% relative error.

| Year | Field | Expected | Actual | Error |
|-----:|-------|----------|--------|------:|
| 2026 | potentialGDP | 32.1442T | 32.9900T | 2.6313% |
| 2027 | potentialGDP | 33.1365T | 34.9033T | 5.3318% |
| 2028 | potentialGDP | 33.8511T | 36.5942T | 8.1033% |
| 2029 | potentialGDP | 34.3152T | 38.0719T | 10.9478% |
| 2030 | potentialGDP | 34.8419T | 39.6735T | 13.8672% |
| 2031 | potentialGDP | 35.2650T | 41.2118T | 16.8633% |
| 2032 | aiAdditionalOutput | 320.5461M | 330.6360M | 3.1477% |
| 2032 | aiInvestmentBoost | 96.1638M | 99.1908M | 3.1477% |
| 2032 | aiNetExportBoost | 32.0546M | 33.0636M | 3.1477% |
| 2032 | aiConsumerGoodsPotential | 192.3277M | 198.3816M | 3.1477% |
| 2032 | aiGoodsAbsorbed | 192.3277M | 198.3816M | 3.1477% |
| 2032 | potentialGDP | 35.5871T | 42.6779T | 19.9252% |
| 2032 | aiCorporateProfits | 80.1365M | 82.6590M | 3.1477% |
| 2032 | aiGDPContribution | 320.5461M | 330.6360M | 3.1477% |
| 2032 | maxNeutralTransfers | 2.7751B | 2.1816B | 21.3856% |
| 2033 | aiAdditionalOutput | 5.5776B | 5.7386B | 2.8864% |
| 2033 | aiInvestmentBoost | 1.6733B | 1.7216B | 2.8864% |
| 2033 | aiNetExportBoost | 557.7579M | 573.8571M | 2.8864% |
| 2033 | aiConsumerGoodsPotential | 3.3465B | 3.4431B | 2.8864% |
| 2033 | aiGoodsAbsorbed | 3.3465B | 3.4431B | 2.8864% |
| 2033 | potentialGDP | 35.8639T | 44.0954T | 22.9523% |
| 2033 | aiCorporateProfits | 1.3944B | 1.4346B | 2.8864% |
| 2033 | aiGDPContribution | 5.5776B | 5.7386B | 2.8864% |
| 2033 | maxNeutralTransfers | 26.6021B | 20.1660B | 24.1937% |
| 2034 | aiAdditionalOutput | 34.7859B | 35.5073B | 2.0738% |
| 2034 | aiInvestmentBoost | 10.4358B | 10.6522B | 2.0738% |
| 2034 | aiNetExportBoost | 3.4786B | 3.5507B | 2.0738% |
| 2034 | aiConsumerGoodsPotential | 20.8715B | 21.3044B | 2.0738% |
| 2034 | aiGoodsAbsorbed | 20.8715B | 21.3044B | 2.0738% |
| 2034 | potentialGDP | 36.1603T | 45.4877T | 25.7944% |
| 2034 | aiCorporateProfits | 8.6965B | 8.8768B | 2.0738% |
| 2034 | aiGDPContribution | 34.7859B | 35.5073B | 2.0738% |
| 2034 | maxNeutralTransfers | 78.5731B | 56.7991B | 27.7117% |
| 2035 | aiAdditionalOutput | 120.9332B | 122.5150B | 1.3080% |
| 2035 | aiInvestmentBoost | 36.2800B | 36.7545B | 1.3080% |
| 2035 | aiNetExportBoost | 12.0933B | 12.2515B | 1.3080% |
| 2035 | aiConsumerGoodsPotential | 72.5599B | 73.5090B | 1.3080% |
| 2035 | aiGoodsAbsorbed | 72.5599B | 73.5090B | 1.3080% |
| 2035 | potentialGDP | 36.3282T | 46.5327T | 28.0897% |
| 2035 | aiCorporateProfits | 30.2333B | 30.6288B | 1.3080% |
| 2035 | aiGDPContribution | 120.9332B | 122.5150B | 1.3080% |
| 2035 | maxNeutralTransfers | 144.8114B | 102.7559B | 29.0415% |
| 2036 | potentialGDP | 36.1693T | 46.7467T | 29.2443% |
| 2036 | maxNeutralTransfers | 258.2634B | 187.9749B | 27.2158% |
| 2037 | gdpNominal | 45.7247T | 44.2904T | 3.1367% |
| 2037 | gdpReal | 35.2470T | 33.5910T | 4.6984% |
| 2037 | consumption | 31.1969T | 29.8110T | 4.4423% |
| 2037 | newJobWageIncome | 87.9009B | 86.9242B | 1.1111% |
| 2037 | potentialGDP | 35.6012T | 44.6460T | 25.4058% |
| 2037 | corporateProfits | 5.1124T | 4.9549T | 3.0796% |
| 2037 | traditionalCorporateProfits | 4.9648T | 4.8068T | 3.1829% |
| 2037 | maxNeutralTransfers | 393.1061B | 305.6400B | 22.2500% |
| 2038 | aggregateWageIncome | 24.0863T | 23.3141T | 3.2058% |
| 2038 | aggregateAssetIncome | 11.2703T | 10.9177T | 3.1286% |
| 2038 | totalIncome | 43.2201T | 42.0754T | 2.6485% |
| 2038 | gdpNominal | 41.8103T | 40.2008T | 3.8496% |
| 2038 | gdpReal | 32.7571T | 30.4393T | 7.0755% |
| 2038 | consumption | 27.4019T | 26.3132T | 3.9729% |
| 2038 | investment | 8.3196T | 7.8277T | 5.9133% |
| 2038 | newJobEmployment | 738.4464K | 703.7217K | 4.7024% |
| 2038 | newJobWageIncome | 79.1501B | 73.0244B | 7.7393% |
| 2038 | potentialGDP | 33.4158T | 40.8600T | 22.2773% |
| 2038 | wageConsumption | 18.8012T | 18.1960T | 3.2193% |
| 2038 | assetConsumption | 3.6216T | 3.4982T | 3.4076% |
| 2038 | corporateProfits | 4.7528T | 4.5759T | 3.7231% |
| 2038 | traditionalCorporateProfits | 4.4784T | 4.3012T | 3.9552% |
| 2038 | maxNeutralTransfers | 573.2190B | 518.9595B | 9.4658% |
| 2039 | totalUnemployment | 21.3762M | 21.6909M | 1.4722% |
| 2039 | aggregateWageIncome | 19.4529T | 18.5891T | 4.4404% |
| 2039 | aggregateAssetIncome | 10.9907T | 10.5902T | 3.6435% |
| 2039 | totalIncome | 38.4302T | 37.1513T | 3.3277% |
| 2039 | gdpNominal | 35.0548T | 33.3157T | 4.9610% |
| 2039 | gdpReal | 28.6772T | 25.4474T | 11.2626% |
| 2039 | consumption | 21.3346T | 19.9235T | 6.6138% |
| 2039 | investment | 7.5622T | 7.2608T | 3.9862% |
| 2039 | governmentSpending | 6.9574T | 6.8875T | 1.0047% |
| 2039 | aiAdditionalOutput | 2.1776T | 2.2191T | 1.9074% |
| 2039 | aiInvestmentBoost | 653.2742B | 665.7348B | 1.9074% |
| 2039 | aiNetExportBoost | 217.7581B | 221.9116B | 1.9074% |
| 2039 | aiConsumerGoodsPotential | 1.3065T | 1.3315T | 1.9074% |
| 2039 | unrealizedAIOutput | 0.000000 | 74.9034B | 100.0000% |
| 2039 | aiGoodsAbsorbed | 1.3065T | 1.2566T | 3.8255% |
| 2039 | newJobEmployment | 646.3745K | 599.0722K | 7.3181% |
| 2039 | newJobWageIncome | 59.0358B | 52.4316B | 11.1868% |
| 2039 | potentialGDP | 29.9837T | 34.6472T | 15.5534% |
| 2039 | wageConsumption | 14.8438T | 14.1686T | 4.5491% |
| 2039 | assetConsumption | 3.4753T | 3.3351T | 4.0329% |
| 2039 | corporateProfits | 4.1609T | 3.9649T | 4.7098% |
| 2039 | aiCorporateProfits | 544.3951B | 536.0531B | 1.5323% |
| 2039 | traditionalCorporateProfits | 3.6165T | 3.4289T | 5.1881% |
| 2039 | aiGDPContribution | 2.1776T | 2.1442T | 1.5323% |
| 2039 | maxNeutralTransfers | 709.0274B | 928.4275B | 30.9438% |
| 2040 | totalUnemployment | 32.8035M | 33.3276M | 1.5978% |
| 2040 | aggregateWageIncome | 13.0943T | 12.3185T | 5.9250% |
| 2040 | aggregateAssetIncome | 10.0146T | 9.5469T | 4.6709% |
| 2040 | totalIncome | 31.3150T | 30.0607T | 4.0051% |
| 2040 | gdpNominal | 28.7329T | 27.6290T | 3.8419% |
| 2040 | gdpReal | 24.9865T | 21.5216T | 13.8668% |
| 2040 | consumption | 15.6409T | 14.8178T | 5.2628% |
| 2040 | investment | 6.8072T | 6.5527T | 3.7396% |
| 2040 | governmentSpending | 6.7261T | 6.6517T | 1.1052% |
| 2040 | aiAdditionalOutput | 4.1146T | 4.1733T | 1.4256% |
| 2040 | aiInvestmentBoost | 1.2344T | 1.2520T | 1.4256% |
| 2040 | aiNetExportBoost | 411.4636B | 417.3295B | 1.4256% |
| 2040 | aiConsumerGoodsPotential | 2.4688T | 2.5040T | 1.4256% |
| 2040 | unrealizedAIOutput | 639.7028B | 746.4552B | 16.6878% |
| 2040 | aiGoodsAbsorbed | 1.8291T | 1.7575T | 3.9122% |
| 2040 | newJobEmployment | 505.3524K | 446.7100K | 11.6043% |
| 2040 | newJobWageIncome | 34.3602B | 28.7045B | 16.4599% |
| 2040 | potentialGDP | 27.4552T | 30.1330T | 9.7530% |
| 2040 | wageConsumption | 9.5840T | 8.9984T | 6.1100% |
| 2040 | assetConsumption | 3.0779T | 2.9142T | 5.3192% |
| 2040 | corporateProfits | 3.6471T | 3.5189T | 3.5140% |
| 2040 | aiCorporateProfits | 868.7334B | 856.7099B | 1.3840% |
| 2040 | traditionalCorporateProfits | 2.7784T | 2.6622T | 4.1800% |
| 2040 | aiGDPContribution | 3.4749T | 3.4268T | 1.3840% |
| 2040 | totalDemandSpilloverLoss | 0.000000 | 98.2102K | 100.0000% |
| 2040 | maxNeutralTransfers | 808.4211B | 1.3970T | 72.8119% |
| 2041 | totalEmployment | 121.7973M | 118.7869M | 2.4717% |
| 2041 | totalUnemployment | 61.0088M | 64.0193M | 4.9344% |
| 2041 | aggregateWageIncome | 6.2319T | 5.6410T | 9.4822% |
| 2041 | aggregateAssetIncome | 9.1009T | 8.7965T | 3.3443% |
| 2041 | totalIncome | 24.0803T | 23.2222T | 3.5637% |
| 2041 | gdpNominal | 24.6758T | 24.0941T | 2.3574% |
| 2041 | gdpReal | 23.0553T | 19.3339T | 16.1411% |
| 2041 | consumption | 11.1825T | 10.8081T | 3.3482% |
| 2041 | investment | 6.9435T | 6.7620T | 2.6149% |
| 2041 | unrealizedAIOutput | 2.0859T | 2.1645T | 3.7711% |
| 2041 | aiGoodsAbsorbed | 2.3493T | 2.2706T | 3.3482% |
| 2041 | newJobEmployment | 357.7434K | 308.1358K | 13.8668% |
| 2041 | newJobWageIncome | 14.8774B | 11.9074B | 19.9630% |
| 2041 | potentialGDP | 27.4904T | 28.5292T | 3.7788% |
| 2041 | wageConsumption | 4.0827T | 3.6491T | 10.6198% |
| 2041 | assetConsumption | 2.6940T | 2.5875T | 3.9541% |
| 2041 | corporateProfits | 3.4572T | 3.3822T | 2.1694% |
| 2041 | aiCorporateProfits | 1.3265T | 1.3068T | 1.4825% |
| 2041 | traditionalCorporateProfits | 2.1307T | 2.0753T | 2.5971% |
| 2041 | aiGDPContribution | 5.3060T | 5.2274T | 1.4825% |
| 2041 | totalDemandSpilloverLoss | 9.3643M | 12.3252M | 31.6181% |
| 2041 | maxNeutralTransfers | 909.3860B | 1.5252T | 67.7177% |
| 2042 | totalEmployment | 99.6938M | 97.8780M | 1.8213% |
| 2042 | totalUnemployment | 83.8436M | 85.6594M | 2.1656% |
| 2042 | aggregateWageIncome | 3.3647T | 3.1621T | 6.0221% |
| 2042 | aggregateAssetIncome | 8.3989T | 8.2842T | 1.3655% |
| 2042 | totalIncome | 20.9496T | 20.6465T | 1.4469% |
| 2042 | gdpReal | 23.5006T | 19.1908T | 18.3392% |
| 2042 | consumption | 9.5215T | 9.3953T | 1.3252% |
| 2042 | unrealizedAIOutput | 3.0969T | 3.1306T | 1.0887% |
| 2042 | aiGoodsAbsorbed | 2.5442T | 2.5105T | 1.3252% |
| 2042 | newJobEmployment | 283.2781K | 237.5538K | 16.1411% |
| 2042 | newJobWageIncome | 8.1038B | 6.5119B | 19.6436% |
| 2042 | potentialGDP | 29.1417T | 28.6309T | 1.7528% |
| 2042 | wageConsumption | 1.9973T | 1.8613T | 6.8052% |
| 2042 | assetConsumption | 2.3746T | 2.3345T | 1.6903% |
| 2042 | totalDemandSpilloverLoss | 19.7516M | 21.5216M | 8.9615% |
| 2042 | maxNeutralTransfers | 1.0846T | 1.7714T | 63.3216% |
| 2043 | aggregateWageIncome | 2.2008T | 2.1584T | 1.9257% |
| 2043 | gdpReal | 26.3716T | 20.7890T | 21.1689% |
| 2043 | newJobEmployment | 232.9745K | 190.2488K | 18.3392% |
| 2043 | newJobWageIncome | 5.4580B | 4.4000B | 19.3832% |
| 2043 | potentialGDP | 33.1598T | 30.3885T | 8.3574% |
| 2043 | wageConsumption | 1.2114T | 1.1850T | 2.1772% |
| 2043 | totalDemandSpilloverLoss | 20.5134M | 20.9910M | 2.3284% |
| 2043 | maxNeutralTransfers | 1.4726T | 2.3217T | 57.6621% |
| 2044 | gdpReal | 31.0125T | 23.3787T | 24.6152% |
| 2044 | newJobEmployment | 225.0996K | 177.6354K | 21.0859% |
| 2044 | newJobWageIncome | 5.0671B | 3.9983B | 21.0928% |
| 2044 | potentialGDP | 38.6312T | 32.3450T | 16.2725% |
| 2044 | maxNeutralTransfers | 2.0846T | 3.1337T | 50.3280% |
| 2045 | aggregateAssetIncome | 11.7545T | 11.6095T | 1.2339% |
| 2045 | gdpReal | 36.9465T | 26.5589T | 28.1153% |
| 2045 | consumerWelfareIndex | 36.7977K | 26.3319K | 28.4413% |
| 2045 | newJobEmployment | 236.4465K | 178.2017K | 24.6334% |
| 2045 | newJobWageIncome | 5.3972B | 4.0616B | 24.7461% |
| 2045 | potentialGDP | 45.2156T | 34.1835T | 24.3989% |
| 2045 | assetConsumption | 3.2548T | 3.2041T | 1.5596% |
| 2045 | maxNeutralTransfers | 2.7285T | 3.9231T | 43.7847% |
| 2046 | aggregateAssetIncome | 12.9647T | 12.5843T | 2.9341% |
| 2046 | totalIncome | 24.5988T | 24.1847T | 1.6835% |
| 2046 | gdpReal | 43.7709T | 30.0264T | 31.4011% |
| 2046 | consumption | 9.9288T | 9.8253T | 1.0426% |
| 2046 | consumerWelfareIndex | 43.5855K | 29.7624K | 31.7149% |
| 2046 | aiGoodsAbsorbed | 4.0873T | 4.0448T | 1.0412% |
| 2046 | newJobEmployment | 259.9049K | 186.8140K | 28.1221% |
| 2046 | newJobWageIncome | 6.1241B | 4.3757B | 28.5500% |
| 2046 | potentialGDP | 52.4616T | 35.5006T | 32.3304% |
| 2046 | wageConsumption | 985.9471B | 975.4768B | 1.0620% |
| 2046 | assetConsumption | 3.5495T | 3.4164T | 3.7509% |
| 2046 | totalDemandSpilloverLoss | 11.7079M | 11.8743M | 1.4207% |
| 2046 | maxNeutralTransfers | 3.4526T | 4.7374T | 37.2114% |
| 2047 | aggregateWageIncome | 1.9261T | 1.8992T | 1.3983% |
| 2047 | aggregateAssetIncome | 14.0403T | 13.4867T | 3.9428% |
| 2047 | totalIncome | 25.7334T | 25.1390T | 2.3098% |
| 2047 | gdpReal | 51.6552T | 33.8743T | 34.4224% |
| 2047 | consumption | 10.3188T | 10.2149T | 1.0075% |
| 2047 | consumerWelfareIndex | 51.8896K | 33.8877K | 34.6927% |
| 2047 | aiGoodsAbsorbed | 4.3874T | 4.3434T | 1.0049% |
| 2047 | newJobEmployment | 289.3086K | 198.4056K | 31.4208% |
| 2047 | newJobWageIncome | 6.9578B | 4.7287B | 32.0375% |
| 2047 | potentialGDP | 60.6314T | 36.4832T | 39.8278% |
| 2047 | wageConsumption | 996.3460B | 980.6236B | 1.5780% |
| 2047 | assetConsumption | 3.7777T | 3.5840T | 5.1287% |
| 2047 | totalDemandSpilloverLoss | 9.5819M | 9.8294M | 2.5830% |
| 2047 | maxNeutralTransfers | 4.2829T | 5.6189T | 31.1921% |
| 2048 | aggregateWageIncome | 1.9435T | 1.9151T | 1.4637% |
| 2048 | aggregateAssetIncome | 15.0638T | 14.3573T | 4.6898% |
| 2048 | totalIncome | 26.8002T | 26.0519T | 2.7921% |
| 2048 | gdpReal | 61.0894T | 38.3223T | 37.2686% |
| 2048 | consumerWelfareIndex | 62.1129K | 38.8154K | 37.5084% |
| 2048 | newJobEmployment | 324.7132K | 212.8487K | 34.4502% |
| 2048 | newJobWageIncome | 7.8985B | 5.1292B | 35.0614% |
| 2048 | potentialGDP | 70.2788T | 37.3484T | 46.8568% |
| 2048 | wageConsumption | 1.0008T | 984.2065B | 1.6571% |
| 2048 | assetConsumption | 3.9655T | 3.7183T | 6.2353% |
| 2048 | totalDemandSpilloverLoss | 8.0137M | 8.2609M | 3.0841% |
| 2048 | maxNeutralTransfers | 5.2633T | 6.6059T | 25.5077% |
| 2049 | aggregateWageIncome | 1.9800T | 1.9536T | 1.3348% |
| 2049 | aggregateAssetIncome | 16.0925T | 15.2483T | 5.2457% |
| 2049 | totalIncome | 27.8802T | 26.9959T | 3.1719% |
| 2049 | gdpReal | 72.5252T | 43.5158T | 39.9991% |
| 2049 | consumerWelfareIndex | 74.7702K | 44.7179K | 40.1929% |
| 2049 | newJobEmployment | 371.7660K | 233.2140K | 37.2686% |
| 2049 | newJobWageIncome | 9.1701B | 5.7046B | 37.7912% |
| 2049 | potentialGDP | 81.8669T | 38.1838T | 53.3586% |
| 2049 | wageConsumption | 1.0180T | 1.0025T | 1.5179% |
| 2049 | assetConsumption | 4.1295T | 3.8341T | 7.1547% |
| 2049 | totalDemandSpilloverLoss | 6.8096M | 7.0310M | 3.2526% |
| 2049 | maxNeutralTransfers | 6.3969T | 7.6764T | 20.0018% |
| 2050 | aggregateWageIncome | 2.0348T | 2.0118T | 1.1337% |
| 2050 | aggregateAssetIncome | 17.1832T | 16.2142T | 5.6392% |
| 2050 | totalIncome | 29.0328T | 28.0261T | 3.4673% |
| 2050 | gdpReal | 86.3774T | 49.5619T | 42.6217% |
| 2050 | consumerWelfareIndex | 90.4585K | 51.7761K | 42.7625% |
| 2050 | newJobEmployment | 433.3264K | 259.9999K | 39.9991% |
| 2050 | newJobWageIncome | 10.8913B | 6.4885B | 40.4246% |
| 2050 | potentialGDP | 95.8265T | 39.0283T | 59.2719% |
| 2050 | wageConsumption | 1.0466T | 1.0331T | 1.2939% |
| 2050 | assetConsumption | 4.2859T | 3.9467T | 7.9131% |
| 2050 | totalDemandSpilloverLoss | 5.9098M | 6.0524M | 2.4121% |
| 2050 | maxNeutralTransfers | 7.7160T | 8.8546T | 14.7566% |

## Field Comparison Warnings

232 fields between 0.01-1% relative error.

| Year | Field | Expected | Actual | Error |
|-----:|-------|----------|--------|------:|
| 2033 | totalUnemployment | 7.0593M | 7.0613M | 0.0285% |
| 2033 | newJobEmployment | 800.2011K | 800.1882K | 0.0016% |
| 2034 | totalUnemployment | 7.4487M | 7.4591M | 0.1401% |
| 2034 | aggregateAssetIncome | 9.7131T | 9.7142T | 0.0107% |
| 2034 | newJobEmployment | 803.6936K | 803.6338K | 0.0074% |
| 2034 | assetConsumption | 3.2149T | 3.2153T | 0.0113% |
| 2035 | totalEmployment | 170.0609M | 170.0400M | 0.0123% |
| 2035 | totalUnemployment | 8.4187M | 8.4396M | 0.2476% |
| 2035 | aggregateWageIncome | 27.0576T | 27.0459T | 0.0432% |
| 2035 | aggregateAssetIncome | 10.1858T | 10.1877T | 0.0187% |
| 2035 | aggregateTransferIncome | 7.6491T | 7.6448T | 0.0553% |
| 2035 | totalIncome | 44.8925T | 44.8785T | 0.0312% |
| 2035 | gdpNominal | 46.4922T | 46.4592T | 0.0711% |
| 2035 | gdpReal | 36.2556T | 36.1819T | 0.2034% |
| 2035 | consumption | 32.3041T | 32.2739T | 0.0935% |
| 2035 | governmentSpending | 7.0191T | 7.0158T | 0.0483% |
| 2035 | consumerWelfareIndex | 71.1929K | 71.0322K | 0.2257% |
| 2035 | newJobEmployment | 803.0402K | 802.9048K | 0.0169% |
| 2035 | newJobWageIncome | 92.8306B | 92.7891B | 0.0447% |
| 2035 | wageConsumption | 21.6032T | 21.5923T | 0.0505% |
| 2035 | assetConsumption | 3.3526T | 3.3533T | 0.0199% |
| 2035 | transferConsumption | 7.4303T | 7.4265T | 0.0512% |
| 2035 | corporateProfits | 5.1311T | 5.1277T | 0.0666% |
| 2035 | traditionalCorporateProfits | 5.1008T | 5.0970T | 0.0747% |
| 2036 | totalEmployment | 169.3813M | 169.3600M | 0.0126% |
| 2036 | totalUnemployment | 9.8122M | 9.8335M | 0.2174% |
| 2036 | aggregateWageIncome | 26.9699T | 26.9398T | 0.1116% |
| 2036 | aggregateAssetIncome | 10.6490T | 10.6443T | 0.0439% |
| 2036 | aggregateTransferIncome | 7.7620T | 7.7443T | 0.2270% |
| 2036 | totalIncome | 45.3808T | 45.3284T | 0.1154% |
| 2036 | gdpNominal | 46.6851T | 46.5759T | 0.2339% |
| 2036 | gdpReal | 35.9997T | 35.6975T | 0.8396% |
| 2036 | consumption | 32.2133T | 32.1279T | 0.2652% |
| 2036 | investment | 8.4588T | 8.4481T | 0.1268% |
| 2036 | governmentSpending | 7.1159T | 7.1018T | 0.1973% |
| 2036 | consumerWelfareIndex | 69.9208K | 69.3120K | 0.8707% |
| 2036 | aiAdditionalOutput | 282.6292B | 284.6574B | 0.7176% |
| 2036 | aiInvestmentBoost | 84.7888B | 85.3972B | 0.7176% |
| 2036 | aiNetExportBoost | 28.2629B | 28.4657B | 0.7176% |
| 2036 | aiConsumerGoodsPotential | 169.5775B | 170.7944B | 0.7176% |
| 2036 | aiGoodsAbsorbed | 169.5775B | 170.7944B | 0.7176% |
| 2036 | newJobEmployment | 795.7145K | 793.9532K | 0.2213% |
| 2036 | newJobWageIncome | 92.3003B | 92.0087B | 0.3159% |
| 2036 | wageConsumption | 21.4309T | 21.4053T | 0.1191% |
| 2036 | assetConsumption | 3.4829T | 3.4812T | 0.0470% |
| 2036 | transferConsumption | 7.6138T | 7.5980T | 0.2083% |
| 2036 | corporateProfits | 5.1749T | 5.1632T | 0.2266% |
| 2036 | aiCorporateProfits | 70.6573B | 71.1643B | 0.7176% |
| 2036 | traditionalCorporateProfits | 5.1043T | 5.0920T | 0.2397% |
| 2036 | aiGDPContribution | 282.6292B | 284.6574B | 0.7176% |
| 2037 | totalEmployment | 167.9573M | 167.9352M | 0.0132% |
| 2037 | totalUnemployment | 11.9530M | 11.9751M | 0.1848% |
| 2037 | aggregateWageIncome | 26.0263T | 25.9542T | 0.2773% |
| 2037 | aggregateAssetIncome | 11.0347T | 11.0132T | 0.1954% |
| 2037 | aggregateTransferIncome | 7.8057T | 7.7855T | 0.2593% |
| 2037 | totalIncome | 44.8668T | 44.7528T | 0.2540% |
| 2037 | investment | 8.4802T | 8.4474T | 0.3863% |
| 2037 | governmentSpending | 7.1243T | 7.1058T | 0.2601% |
| 2037 | consumerWelfareIndex | 67.4217K | 63.3879K | 5.9829% |
| 2037 | aiAdditionalOutput | 590.2807B | 592.6154B | 0.3955% |
| 2037 | aiInvestmentBoost | 177.0842B | 177.7846B | 0.3955% |
| 2037 | aiNetExportBoost | 59.0281B | 59.2615B | 0.3955% |
| 2037 | aiConsumerGoodsPotential | 354.1684B | 355.5692B | 0.3955% |
| 2037 | aiGoodsAbsorbed | 354.1684B | 355.5692B | 0.3955% |
| 2037 | newJobEmployment | 775.0888K | 768.4707K | 0.8539% |
| 2037 | wageConsumption | 20.5291T | 20.4706T | 0.2850% |
| 2037 | assetConsumption | 3.5813T | 3.5737T | 0.2108% |
| 2037 | transferConsumption | 7.7474T | 7.7292T | 0.2351% |
| 2037 | aiCorporateProfits | 147.5702B | 148.1539B | 0.3955% |
| 2037 | aiGDPContribution | 590.2807B | 592.6154B | 0.3955% |
| 2038 | totalEmployment | 165.6658M | 165.6265M | 0.0237% |
| 2038 | totalUnemployment | 14.9642M | 15.0034M | 0.2621% |
| 2038 | aggregateTransferIncome | 7.8635T | 7.8436T | 0.2532% |
| 2038 | governmentSpending | 7.0915T | 7.0276T | 0.9011% |
| 2038 | consumerWelfareIndex | 59.9493K | 55.6362K | 7.1946% |
| 2038 | aiAdditionalOutput | 1.0979T | 1.0986T | 0.0636% |
| 2038 | aiInvestmentBoost | 329.3805B | 329.5901B | 0.0636% |
| 2038 | aiNetExportBoost | 109.7935B | 109.8634B | 0.0636% |
| 2038 | aiConsumerGoodsPotential | 658.7610B | 659.1803B | 0.0636% |
| 2038 | aiGoodsAbsorbed | 658.7610B | 659.1803B | 0.0636% |
| 2038 | transferConsumption | 7.9078T | 7.8899T | 0.2266% |
| 2038 | aiCorporateProfits | 274.4837B | 274.6585B | 0.0636% |
| 2038 | aiGDPContribution | 1.0979T | 1.0986T | 0.0636% |
| 2039 | totalEmployment | 159.9763M | 159.6616M | 0.1967% |
| 2039 | aggregateTransferIncome | 7.9866T | 7.9720T | 0.1831% |
| 2039 | consumerWelfareIndex | 48.5425K | 42.3262K | 12.8058% |
| 2039 | transferConsumption | 8.1432T | 8.1300T | 0.1616% |
| 2040 | totalEmployment | 149.2744M | 148.7502M | 0.3511% |
| 2040 | aggregateTransferIncome | 8.2060T | 8.1954T | 0.1292% |
| 2040 | consumerWelfareIndex | 37.6793K | 31.9748K | 15.1396% |
| 2040 | transferConsumption | 8.4839T | 8.4744T | 0.1125% |
| 2041 | aggregateTransferIncome | 8.7476T | 8.7847T | 0.4245% |
| 2041 | governmentSpending | 6.5096T | 6.4570T | 0.8079% |
| 2041 | consumerWelfareIndex | 28.8283K | 23.9298K | 16.9921% |
| 2041 | transferConsumption | 9.1361T | 9.1695T | 0.3658% |
| 2042 | aggregateTransferIncome | 9.1860T | 9.2002T | 0.1546% |
| 2042 | gdpNominal | 23.1726T | 22.9899T | 0.7885% |
| 2042 | investment | 6.9406T | 6.9046T | 0.5184% |
| 2042 | governmentSpending | 6.3707T | 6.3360T | 0.5448% |
| 2042 | consumerWelfareIndex | 26.5374K | 21.5534K | 18.7810% |
| 2042 | transferConsumption | 9.7202T | 9.7330T | 0.1315% |
| 2042 | corporateProfits | 3.4317T | 3.4069T | 0.7232% |
| 2042 | aiCorporateProfits | 1.5762T | 1.5678T | 0.5348% |
| 2042 | traditionalCorporateProfits | 1.8554T | 1.8390T | 0.8834% |
| 2042 | aiGDPContribution | 6.3049T | 6.2712T | 0.5348% |
| 2043 | totalEmployment | 84.1888M | 83.6684M | 0.6181% |
| 2043 | totalUnemployment | 100.0828M | 100.6032M | 0.5199% |
| 2043 | aggregateAssetIncome | 8.7978T | 8.8203T | 0.2551% |
| 2043 | aggregateTransferIncome | 9.4978T | 9.4871T | 0.1124% |
| 2043 | totalIncome | 20.4964T | 20.4658T | 0.1493% |
| 2043 | consumption | 9.0183T | 8.9936T | 0.2731% |
| 2043 | investment | 7.6965T | 7.7364T | 0.5184% |
| 2043 | governmentSpending | 6.3192T | 6.2982T | 0.3330% |
| 2043 | consumerWelfareIndex | 27.5824K | 21.6854K | 21.3798% |
| 2043 | unrealizedAIOutput | 3.8884T | 3.8964T | 0.2037% |
| 2043 | aiGoodsAbsorbed | 2.8998T | 2.8919T | 0.2731% |
| 2043 | assetConsumption | 2.4295T | 2.4374T | 0.3234% |
| 2043 | transferConsumption | 10.2187T | 10.2091T | 0.0940% |
| 2043 | corporateProfits | 3.6357T | 3.6345T | 0.0345% |
| 2043 | aiCorporateProfits | 1.8563T | 1.8543T | 0.1067% |
| 2043 | traditionalCorporateProfits | 1.7794T | 1.7801T | 0.0408% |
| 2043 | aiGDPContribution | 7.4253T | 7.4174T | 0.1067% |
| 2044 | aggregateAssetIncome | 10.0441T | 10.0922T | 0.4789% |
| 2044 | aggregateTransferIncome | 9.6319T | 9.6112T | 0.2144% |
| 2044 | totalIncome | 21.5971T | 21.6246T | 0.1273% |
| 2044 | gdpNominal | 24.7465T | 24.7323T | 0.0574% |
| 2044 | consumption | 9.1129T | 9.0774T | 0.3899% |
| 2044 | investment | 8.6040T | 8.6412T | 0.4317% |
| 2044 | governmentSpending | 6.3339T | 6.3191T | 0.2342% |
| 2044 | consumerWelfareIndex | 31.1359K | 23.3936K | 24.8660% |
| 2044 | aiAdditionalOutput | 12.6979T | 12.6878T | 0.0795% |
| 2044 | aiInvestmentBoost | 3.8094T | 3.8063T | 0.0795% |
| 2044 | aiNetExportBoost | 1.2698T | 1.2688T | 0.0795% |
| 2044 | aiConsumerGoodsPotential | 7.6188T | 7.6127T | 0.0795% |
| 2044 | unrealizedAIOutput | 4.3300T | 4.3394T | 0.2164% |
| 2044 | aiGoodsAbsorbed | 3.2887T | 3.2733T | 0.4691% |
| 2044 | assetConsumption | 2.7683T | 2.7851T | 0.6082% |
| 2044 | transferConsumption | 10.5900T | 10.5714T | 0.1755% |
| 2044 | corporateProfits | 3.8936T | 3.8893T | 0.1101% |
| 2044 | aiCorporateProfits | 2.0920T | 2.0871T | 0.2326% |
| 2044 | traditionalCorporateProfits | 1.8016T | 1.8022T | 0.0321% |
| 2044 | aiGDPContribution | 8.3679T | 8.3484T | 0.2326% |
| 2044 | totalDemandSpilloverLoss | 17.7696M | 17.7859M | 0.0920% |
| 2045 | totalEmployment | 74.9483M | 74.8459M | 0.1366% |
| 2045 | totalUnemployment | 110.8004M | 110.9027M | 0.0924% |
| 2045 | aggregateWageIncome | 1.8537T | 1.8483T | 0.2890% |
| 2045 | aggregateTransferIncome | 9.7036T | 9.6849T | 0.1927% |
| 2045 | totalIncome | 23.3118T | 23.1427T | 0.7254% |
| 2045 | gdpNominal | 26.0104T | 25.9120T | 0.3781% |
| 2045 | consumption | 9.5400T | 9.4608T | 0.8299% |
| 2045 | investment | 9.3212T | 9.3165T | 0.0499% |
| 2045 | governmentSpending | 6.3731T | 6.3578T | 0.2397% |
| 2045 | aiAdditionalOutput | 13.7817T | 13.7857T | 0.0290% |
| 2045 | aiInvestmentBoost | 4.1345T | 4.1357T | 0.0290% |
| 2045 | aiNetExportBoost | 1.3782T | 1.3786T | 0.0290% |
| 2045 | aiConsumerGoodsPotential | 8.2690T | 8.2714T | 0.0290% |
| 2045 | unrealizedAIOutput | 4.5323T | 4.5647T | 0.7134% |
| 2045 | aiGoodsAbsorbed | 3.7367T | 3.7068T | 0.8011% |
| 2045 | wageConsumption | 970.8741B | 967.5586B | 0.3415% |
| 2045 | transferConsumption | 10.9427T | 10.9259T | 0.1538% |
| 2045 | corporateProfits | 4.1561T | 4.1413T | 0.3558% |
| 2045 | aiCorporateProfits | 2.3124T | 2.3053T | 0.3064% |
| 2045 | traditionalCorporateProfits | 1.8437T | 1.8360T | 0.4177% |
| 2045 | aiGDPContribution | 9.2494T | 9.2211T | 0.3064% |
| 2045 | totalDemandSpilloverLoss | 14.6327M | 14.6634M | 0.2097% |
| 2046 | totalEmployment | 73.8772M | 73.6328M | 0.3309% |
| 2046 | totalUnemployment | 112.6145M | 112.8589M | 0.2171% |
| 2046 | aggregateWageIncome | 1.8958T | 1.8780T | 0.9371% |
| 2046 | aggregateTransferIncome | 9.7384T | 9.7224T | 0.1640% |
| 2046 | gdpNominal | 26.9682T | 26.8097T | 0.5877% |
| 2046 | investment | 9.8074T | 9.7682T | 0.4001% |
| 2046 | governmentSpending | 6.4164T | 6.3982T | 0.2830% |
| 2046 | unrealizedAIOutput | 4.6034T | 4.6461T | 0.9272% |
| 2046 | transferConsumption | 11.3055T | 11.2911T | 0.1271% |
| 2046 | corporateProfits | 4.3499T | 4.3265T | 0.5375% |
| 2046 | aiCorporateProfits | 2.4703T | 2.4597T | 0.4298% |
| 2046 | traditionalCorporateProfits | 1.8796T | 1.8668T | 0.6790% |
| 2046 | aiGDPContribution | 9.8811T | 9.8386T | 0.4298% |
| 2047 | totalEmployment | 73.1300M | 72.7769M | 0.4828% |
| 2047 | totalUnemployment | 114.1077M | 114.4607M | 0.3094% |
| 2047 | aggregateTransferIncome | 9.7671T | 9.7532T | 0.1422% |
| 2047 | gdpNominal | 27.6722T | 27.5068T | 0.5978% |
| 2047 | investment | 10.0643T | 10.0191T | 0.4486% |
| 2047 | governmentSpending | 6.4492T | 6.4290T | 0.3135% |
| 2047 | unrealizedAIOutput | 4.5888T | 4.6331T | 0.9661% |
| 2047 | transferConsumption | 11.7124T | 11.6999T | 0.1067% |
| 2047 | corporateProfits | 4.4960T | 4.4716T | 0.5415% |
| 2047 | aiCorporateProfits | 2.5929T | 2.5819T | 0.4235% |
| 2047 | traditionalCorporateProfits | 1.9031T | 1.8897T | 0.7023% |
| 2047 | aiGDPContribution | 10.3716T | 10.3276T | 0.4235% |
| 2048 | totalEmployment | 72.5376M | 72.1576M | 0.5239% |
| 2048 | totalUnemployment | 115.4490M | 115.8290M | 0.3292% |
| 2048 | aggregateTransferIncome | 9.7928T | 9.7795T | 0.1365% |
| 2048 | gdpNominal | 28.3054T | 28.1584T | 0.5193% |
| 2048 | consumption | 10.7261T | 10.6296T | 0.8995% |
| 2048 | investment | 10.2478T | 10.2136T | 0.3335% |
| 2048 | governmentSpending | 6.4733T | 6.4528T | 0.3160% |
| 2048 | unrealizedAIOutput | 4.5205T | 4.5628T | 0.9353% |
| 2048 | aiGoodsAbsorbed | 4.6689T | 4.6272T | 0.8935% |
| 2048 | transferConsumption | 12.1739T | 12.1619T | 0.0988% |
| 2048 | corporateProfits | 4.6249T | 4.6030T | 0.4748% |
| 2048 | aiCorporateProfits | 2.6988T | 2.6885T | 0.3829% |
| 2048 | traditionalCorporateProfits | 1.9261T | 1.9145T | 0.6034% |
| 2048 | aiGDPContribution | 10.7951T | 10.7538T | 0.3829% |
| 2049 | totalEmployment | 72.5156M | 72.1555M | 0.4965% |
| 2049 | totalUnemployment | 116.2230M | 116.5830M | 0.3098% |
| 2049 | aggregateTransferIncome | 9.8077T | 9.7939T | 0.1402% |
| 2049 | gdpNominal | 28.9680T | 28.8422T | 0.4342% |
| 2049 | consumption | 11.1750T | 11.0905T | 0.7559% |
| 2049 | investment | 10.4297T | 10.4047T | 0.2403% |
| 2049 | governmentSpending | 6.4950T | 6.4751T | 0.3052% |
| 2049 | unrealizedAIOutput | 4.3967T | 4.4341T | 0.8501% |
| 2049 | aiGoodsAbsorbed | 4.9449T | 4.9075T | 0.7559% |
| 2049 | transferConsumption | 12.6913T | 12.6789T | 0.0975% |
| 2049 | corporateProfits | 4.7506T | 4.7316T | 0.4014% |
| 2049 | aiCorporateProfits | 2.7932T | 2.7838T | 0.3346% |
| 2049 | traditionalCorporateProfits | 1.9575T | 1.9478T | 0.4968% |
| 2049 | aiGDPContribution | 11.1727T | 11.1353T | 0.3346% |
| 2050 | totalEmployment | 72.9012M | 72.5853M | 0.4333% |
| 2050 | totalUnemployment | 116.5923M | 116.9082M | 0.2709% |
| 2050 | aggregateTransferIncome | 9.8148T | 9.8002T | 0.1487% |
| 2050 | gdpNominal | 29.6862T | 29.5793T | 0.3600% |
| 2050 | consumption | 11.6795T | 11.6089T | 0.6045% |
| 2050 | investment | 10.6189T | 10.5987T | 0.1905% |
| 2050 | governmentSpending | 6.5177T | 6.4986T | 0.2930% |
| 2050 | unrealizedAIOutput | 4.2215T | 4.2531T | 0.7486% |
| 2050 | aiGoodsAbsorbed | 5.2276T | 5.1960T | 0.6045% |
| 2050 | transferConsumption | 13.2774T | 13.2642T | 0.0990% |
| 2050 | corporateProfits | 4.8792T | 4.8631T | 0.3316% |
| 2050 | aiCorporateProfits | 2.8817T | 2.8738T | 0.2742% |
| 2050 | traditionalCorporateProfits | 1.9975T | 1.9892T | 0.4145% |
| 2050 | aiGDPContribution | 11.5269T | 11.4953T | 0.2742% |

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
| potentialGDP | 34.3152T | 38.0719T | 10.9478% | **FAIL** |

### Year 2030

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 34.8419T | 39.6735T | 13.8672% | **FAIL** |

### Year 2031

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 35.2650T | 41.2118T | 16.8633% | **FAIL** |

### Year 2032

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

### Year 2033

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

### Year 2034

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

### Year 2035

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

### Year 2036

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

### Year 2037

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

### Year 2038

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

### Year 2039

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

### Year 2040

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

### Year 2041

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

### Year 2042

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

### Year 2043

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

### Year 2044

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

### Year 2045

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

### Year 2046

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

### Year 2047

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

### Year 2048

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

### Year 2049

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

### Year 2050

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

## Invariant Checks

890 passed, 0 failed out of 890 checks.

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
| policy_isolation_consumerWelfareIndex | 5 |
| policy_isolation_consumption | 5 |
| policy_isolation_gdpNominal | 5 |
| policy_isolation_priceLevel | 5 |
| policy_isolation_totalEmployment | 5 |
| policy_isolation_totalIncome | 5 |
| price_level_positive | 26 |
| unemployment_rate_bounds | 26 |

---
*Scenario "ai_fund_only" — ATLAS Verification Audit v1.0*
