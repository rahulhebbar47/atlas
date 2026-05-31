# Scenario: Min Wage Only

> $20/hr from 2028. Isolates wage floor mechanics.

Generated: 2026-02-23T20:50:03.899Z

## Summary

| Metric | Value |
|--------|------:|
| Total field comparisons | 1846 |
| PASS (<0.01% error) | 1295 |
| WARN (0.01-1% error) | 303 |
| FAIL (>1% error) | 248 |
| Invariant checks | 878 (878 pass, 0 fail) |
| Worst field | cwiGrowthRate (3243.2355%) |

## Field Comparison Failures

248 fields exceed 1% relative error.

| Year | Field | Expected | Actual | Error |
|-----:|-------|----------|--------|------:|
| 2026 | potentialGDP | 32.1442T | 32.9900T | 2.6313% |
| 2027 | potentialGDP | 33.1365T | 34.9033T | 5.3318% |
| 2028 | gdpReal | 33.3396T | 34.0585T | 2.1563% |
| 2028 | potentialGDP | 33.3396T | 36.8183T | 10.4343% |
| 2029 | gdpReal | 33.4658T | 34.9257T | 4.3624% |
| 2029 | newJobEmployment | 750.1402K | 766.3152K | 2.1563% |
| 2029 | newJobWageIncome | 72.1927B | 73.7494B | 2.1563% |
| 2029 | potentialGDP | 33.4658T | 38.7493T | 15.7878% |
| 2030 | gdpReal | 33.5408T | 35.7609T | 6.6193% |
| 2030 | newJobEmployment | 752.9794K | 785.8272K | 4.3624% |
| 2030 | newJobWageIncome | 75.9602B | 79.2764B | 4.3657% |
| 2030 | potentialGDP | 33.5408T | 40.7199T | 21.4044% |
| 2031 | gdpReal | 33.5840T | 36.5822T | 8.9274% |
| 2031 | newJobEmployment | 754.6670K | 804.6206K | 6.6193% |
| 2031 | newJobWageIncome | 79.6785B | 84.9607B | 6.6293% |
| 2031 | potentialGDP | 33.5840T | 42.7512T | 27.2961% |
| 2032 | gdpReal | 33.6107T | 37.4046T | 11.2875% |
| 2032 | aiAdditionalOutput | 320.5461M | 332.7445M | 3.8055% |
| 2032 | aiInvestmentBoost | 96.1638M | 99.8233M | 3.8055% |
| 2032 | aiNetExportBoost | 32.0546M | 33.2744M | 3.8055% |
| 2032 | aiConsumerGoodsPotential | 192.3277M | 199.6467M | 3.8055% |
| 2032 | aiGoodsAbsorbed | 192.3277M | 199.6467M | 3.8055% |
| 2032 | newJobEmployment | 755.6211K | 823.0773K | 8.9272% |
| 2032 | newJobWageIncome | 83.4190B | 90.8822B | 8.9466% |
| 2032 | potentialGDP | 33.6109T | 44.8576T | 33.4614% |
| 2032 | aiCorporateProfits | 80.1365M | 83.1861M | 3.8055% |
| 2032 | aiGDPContribution | 320.5461M | 332.7445M | 3.8055% |
| 2032 | maxNeutralTransfers | 2.6210B | 2.2165B | 15.4330% |
| 2033 | totalUnemployment | 7.1044M | 7.0217M | 1.1643% |
| 2033 | gdpReal | 33.6468T | 38.2582T | 13.7053% |
| 2033 | aiAdditionalOutput | 5.5878B | 5.7949B | 3.7064% |
| 2033 | aiInvestmentBoost | 1.6763B | 1.7385B | 3.7064% |
| 2033 | aiNetExportBoost | 558.7826M | 579.4932M | 3.7064% |
| 2033 | aiConsumerGoodsPotential | 3.3527B | 3.4770B | 3.7064% |
| 2033 | aiGoodsAbsorbed | 3.3527B | 3.4770B | 3.7064% |
| 2033 | newJobEmployment | 755.7612K | 841.0482K | 11.2849% |
| 2033 | newJobWageIncome | 87.2056B | 97.0740B | 11.3162% |
| 2033 | potentialGDP | 33.6501T | 47.0420T | 39.7975% |
| 2033 | aiCorporateProfits | 1.3970B | 1.4487B | 3.7064% |
| 2033 | aiGDPContribution | 5.5878B | 5.7949B | 3.7064% |
| 2033 | maxNeutralTransfers | 24.9839B | 20.5692B | 17.6702% |
| 2034 | totalUnemployment | 7.5005M | 7.4116M | 1.1847% |
| 2034 | gdpReal | 33.7162T | 39.1720T | 16.1813% |
| 2034 | consumerWelfareIndex | 65.8813K | 76.5468K | 16.1890% |
| 2034 | aiAdditionalOutput | 34.8261B | 35.8252B | 2.8688% |
| 2034 | aiInvestmentBoost | 10.4478B | 10.7476B | 2.8688% |
| 2034 | aiNetExportBoost | 3.4826B | 3.5825B | 2.8688% |
| 2034 | aiConsumerGoodsPotential | 20.8957B | 21.4951B | 2.8688% |
| 2034 | aiGoodsAbsorbed | 20.8957B | 21.4951B | 2.8688% |
| 2034 | newJobEmployment | 754.0648K | 857.2988K | 13.6903% |
| 2034 | newJobWageIncome | 90.9686B | 103.4650B | 13.7370% |
| 2034 | potentialGDP | 33.7371T | 49.3005T | 46.1314% |
| 2034 | aiCorporateProfits | 8.7065B | 8.9563B | 2.8688% |
| 2034 | aiGDPContribution | 34.8261B | 35.8252B | 2.8688% |
| 2034 | maxNeutralTransfers | 73.3805B | 57.8166B | 21.2099% |
| 2035 | totalUnemployment | 8.4797M | 8.3891M | 1.0684% |
| 2035 | gdpReal | 33.6247T | 39.8879T | 18.6266% |
| 2035 | consumerWelfareIndex | 65.1532K | 77.3230K | 18.6787% |
| 2035 | aiAdditionalOutput | 121.0903B | 123.4104B | 1.9160% |
| 2035 | aiInvestmentBoost | 36.3271B | 37.0231B | 1.9160% |
| 2035 | aiNetExportBoost | 12.1090B | 12.3410B | 1.9160% |
| 2035 | aiConsumerGoodsPotential | 72.6542B | 74.0462B | 1.9160% |
| 2035 | aiGoodsAbsorbed | 72.6542B | 74.0462B | 1.9160% |
| 2035 | newJobEmployment | 749.1461K | 870.1249K | 16.1489% |
| 2035 | newJobWageIncome | 93.7391B | 109.0723B | 16.3573% |
| 2035 | potentialGDP | 33.6974T | 51.2893T | 52.2056% |
| 2035 | aiCorporateProfits | 30.2726B | 30.8526B | 1.9160% |
| 2035 | aiGDPContribution | 121.0903B | 123.4104B | 1.9160% |
| 2035 | maxNeutralTransfers | 134.5506B | 104.3892B | 22.4164% |
| 2036 | totalUnemployment | 9.8904M | 9.7831M | 1.0848% |
| 2036 | gdpReal | 33.1841T | 40.0366T | 20.6498% |
| 2036 | consumerWelfareIndex | 63.5333K | 76.6737K | 20.6827% |
| 2036 | aiAdditionalOutput | 283.1469B | 286.2448B | 1.0941% |
| 2036 | aiInvestmentBoost | 84.9441B | 85.8735B | 1.0941% |
| 2036 | aiNetExportBoost | 28.3147B | 28.6245B | 1.0941% |
| 2036 | aiConsumerGoodsPotential | 169.8882B | 171.7469B | 1.0941% |
| 2036 | aiGoodsAbsorbed | 169.8882B | 171.7469B | 1.0941% |
| 2036 | newJobEmployment | 737.8354K | 875.0278K | 18.5939% |
| 2036 | newJobWageIncome | 94.0667B | 111.8733B | 18.9297% |
| 2036 | potentialGDP | 33.3540T | 52.4027T | 57.1105% |
| 2036 | aiCorporateProfits | 70.7867B | 71.5612B | 1.0941% |
| 2036 | aiGDPContribution | 283.1469B | 286.2448B | 1.0941% |
| 2036 | maxNeutralTransfers | 238.7636B | 191.8441B | 19.6510% |
| 2037 | gdpReal | 32.2801T | 39.3647T | 21.9472% |
| 2037 | consumerWelfareIndex | 60.7968K | 74.1644K | 21.9874% |
| 2037 | newJobEmployment | 714.4188K | 861.7219K | 20.6186% |
| 2037 | newJobWageIncome | 90.4475B | 109.4230B | 20.9796% |
| 2037 | potentialGDP | 32.6344T | 52.2511T | 60.1107% |
| 2037 | maxNeutralTransfers | 360.3744B | 306.6753B | 14.9009% |
| 2038 | gdpReal | 30.8981T | 37.7829T | 22.2821% |
| 2038 | consumerWelfareIndex | 56.8464K | 69.5303K | 22.3126% |
| 2038 | newJobEmployment | 676.0942K | 824.2018K | 21.9064% |
| 2038 | newJobWageIncome | 82.1605B | 100.3081B | 22.0880% |
| 2038 | potentialGDP | 31.5573T | 50.5446T | 60.1677% |
| 2038 | maxNeutralTransfers | 542.4563B | 518.6910B | 4.3811% |
| 2039 | gdpNominal | 44.1419T | 43.4372T | 1.5966% |
| 2039 | gdpReal | 27.6053T | 33.1832T | 20.2059% |
| 2039 | consumption | 27.1170T | 26.5399T | 2.1282% |
| 2039 | newJobEmployment | 609.9743K | 745.7940K | 22.2665% |
| 2039 | newJobWageIncome | 66.7173B | 81.4018B | 22.0100% |
| 2039 | potentialGDP | 28.8988T | 44.7319T | 54.7881% |
| 2039 | corporateProfits | 5.1574T | 5.0802T | 1.4977% |
| 2039 | traditionalCorporateProfits | 4.6185T | 4.5407T | 1.6835% |
| 2039 | maxNeutralTransfers | 681.8746B | 895.1505B | 31.2779% |
| 2040 | aggregateWageIncome | 16.8055T | 16.5423T | 1.5663% |
| 2040 | aggregateAssetIncome | 11.2515T | 11.0717T | 1.5982% |
| 2040 | totalIncome | 38.1686T | 37.6409T | 1.3825% |
| 2040 | gdpNominal | 37.3111T | 36.4761T | 2.2380% |
| 2040 | gdpReal | 23.9446T | 28.4040T | 18.6237% |
| 2040 | consumption | 21.1970T | 20.6321T | 2.6652% |
| 2040 | investment | 8.3788T | 8.1747T | 2.4356% |
| 2040 | governmentSpending | 8.4140T | 8.3297T | 1.0024% |
| 2040 | unrealizedAIOutput | 0.000000 | 53.9779B | 100.0000% |
| 2040 | aiGoodsAbsorbed | 2.3714T | 2.3245T | 1.9786% |
| 2040 | newJobEmployment | 491.3822K | 590.2197K | 20.1142% |
| 2040 | newJobWageIncome | 42.4677B | 50.2215B | 18.2580% |
| 2040 | potentialGDP | 26.3160T | 38.8545T | 47.6459% |
| 2040 | wageConsumption | 12.3440T | 12.1519T | 1.5569% |
| 2040 | assetConsumption | 3.9380T | 3.8751T | 1.5982% |
| 2040 | corporateProfits | 4.6575T | 4.5598T | 2.0990% |
| 2040 | aiCorporateProfits | 988.0843B | 977.5302B | 1.0681% |
| 2040 | traditionalCorporateProfits | 3.6695T | 3.5823T | 2.3766% |
| 2040 | aiGDPContribution | 3.9523T | 3.9101T | 1.0681% |
| 2040 | maxNeutralTransfers | 768.9302B | 1.6470T | 114.1915% |
| 2041 | aggregateWageIncome | 10.1004T | 9.8104T | 2.8718% |
| 2041 | aggregateAssetIncome | 10.2044T | 10.0180T | 1.8275% |
| 2041 | totalIncome | 30.7613T | 30.2069T | 1.8023% |
| 2041 | gdpNominal | 32.4700T | 32.0034T | 1.4371% |
| 2041 | gdpReal | 21.4914T | 25.6717T | 19.4512% |
| 2041 | consumption | 16.2459T | 15.9553T | 1.7890% |
| 2041 | investment | 8.2438T | 8.1298T | 1.3825% |
| 2041 | governmentSpending | 8.1801T | 8.0913T | 1.0856% |
| 2041 | unrealizedAIOutput | 978.8591B | 1.0468T | 6.9431% |
| 2041 | newJobEmployment | 350.3948K | 413.7360K | 18.0771% |
| 2041 | newJobWageIncome | 21.4461B | 24.6832B | 15.0942% |
| 2041 | potentialGDP | 25.7388T | 36.2897T | 40.9919% |
| 2041 | wageConsumption | 6.9262T | 6.7186T | 2.9984% |
| 2041 | assetConsumption | 3.5716T | 3.5063T | 1.8275% |
| 2041 | corporateProfits | 4.4257T | 4.3740T | 1.1699% |
| 2041 | traditionalCorporateProfits | 2.9007T | 2.8497T | 1.7574% |
| 2041 | maxNeutralTransfers | 846.3180B | 2.0243T | 139.1885% |
| 2042 | totalUnemployment | 66.2186M | 67.1759M | 1.4457% |
| 2042 | aggregateWageIncome | 7.1153T | 6.9521T | 2.2930% |
| 2042 | gdpReal | 20.8850T | 25.2406T | 20.8552% |
| 2042 | unrealizedAIOutput | 1.9033T | 1.9369T | 1.7656% |
| 2042 | newJobEmployment | 263.9002K | 315.2320K | 19.4512% |
| 2042 | newJobWageIncome | 13.4369B | 15.8199B | 17.7346% |
| 2042 | potentialGDP | 26.5265T | 35.8859T | 35.2831% |
| 2042 | wageConsumption | 4.5652T | 4.4424T | 2.6902% |
| 2042 | totalDemandSpilloverLoss | 2.0607M | 3.0693M | 48.9459% |
| 2042 | maxNeutralTransfers | 965.4459B | 2.3336T | 141.7104% |
| 2043 | aggregateWageIncome | 5.2872T | 5.2300T | 1.0814% |
| 2043 | aggregateAssetIncome | 9.2156T | 9.3757T | 1.7376% |
| 2043 | gdpReal | 21.5570T | 26.5127T | 22.9890% |
| 2043 | newJobEmployment | 207.0220K | 250.1969K | 20.8552% |
| 2043 | newJobWageIncome | 9.8509B | 11.8187B | 19.9766% |
| 2043 | potentialGDP | 28.3454T | 36.8920T | 30.1514% |
| 2043 | wageConsumption | 3.1155T | 3.0772T | 1.2288% |
| 2043 | assetConsumption | 3.2255T | 3.2815T | 1.7376% |
| 2043 | totalDemandSpilloverLoss | 6.1732M | 6.5398M | 5.9389% |
| 2043 | maxNeutralTransfers | 1.2045T | 2.9628T | 145.9779% |
| 2044 | aggregateAssetIncome | 9.8715T | 10.1958T | 3.2853% |
| 2044 | gdpReal | 22.9643T | 28.8956T | 25.8284% |
| 2044 | unrealizedAIOutput | 3.1884T | 3.1499T | 1.2075% |
| 2044 | newJobEmployment | 183.9713K | 226.3447K | 23.0326% |
| 2044 | newJobWageIncome | 8.6240B | 10.5998B | 22.9109% |
| 2044 | potentialGDP | 30.5835T | 38.1822T | 24.8459% |
| 2044 | assetConsumption | 3.4550T | 3.5685T | 3.2853% |
| 2044 | maxNeutralTransfers | 1.5446T | 3.8839T | 151.4562% |
| 2045 | aggregateAssetIncome | 10.8190T | 11.2281T | 3.7817% |
| 2045 | totalIncome | 26.5988T | 26.9425T | 1.2921% |
| 2045 | gdpReal | 24.7879T | 32.0384T | 29.2503% |
| 2045 | consumption | 12.2609T | 12.4070T | 1.1908% |
| 2045 | unrealizedAIOutput | 3.4685T | 3.4096T | 1.6981% |
| 2045 | aiGoodsAbsorbed | 4.8053T | 4.8601T | 1.1412% |
| 2045 | newJobEmployment | 175.0017K | 220.2913K | 25.8795% |
| 2045 | newJobWageIncome | 8.2675B | 10.4330B | 26.1923% |
| 2045 | potentialGDP | 33.0617T | 39.5251T | 19.5495% |
| 2045 | assetConsumption | 3.7866T | 3.9298T | 3.7817% |
| 2045 | totalDemandSpilloverLoss | 5.8673M | 5.7153M | 2.5898% |
| 2045 | maxNeutralTransfers | 1.8309T | 4.7322T | 158.4542% |
| 2046 | aggregateAssetIncome | 11.6700T | 12.0025T | 2.8488% |
| 2046 | gdpReal | 26.7668T | 35.6958T | 33.3587% |
| 2046 | consumption | 12.3795T | 12.5498T | 1.3759% |
| 2046 | unrealizedAIOutput | 3.5945T | 3.5244T | 1.9505% |
| 2046 | aiGoodsAbsorbed | 5.0962T | 5.1663T | 1.3761% |
| 2046 | newJobEmployment | 174.3689K | 225.3693K | 29.2486% |
| 2046 | newJobWageIncome | 8.3779B | 10.8708B | 29.7554% |
| 2046 | potentialGDP | 35.4575T | 40.5600T | 14.3904% |
| 2046 | assetConsumption | 4.0845T | 4.2009T | 2.8488% |
| 2046 | totalDemandSpilloverLoss | 4.7309M | 4.5247M | 4.3590% |
| 2046 | maxNeutralTransfers | 2.1114T | 5.6315T | 166.7212% |
| 2047 | aggregateAssetIncome | 12.1138T | 12.3972T | 2.3394% |
| 2047 | gdpReal | 28.7270T | 39.7220T | 38.2741% |
| 2047 | consumption | 12.4296T | 12.6380T | 1.6773% |
| 2047 | consumerWelfareIndex | 29.9942K | 41.9292K | 39.7910% |
| 2047 | unrealizedAIOutput | 3.6913T | 3.6027T | 2.4003% |
| 2047 | aiGoodsAbsorbed | 5.2849T | 5.3736T | 1.6784% |
| 2047 | newJobEmployment | 176.9111K | 235.8990K | 33.3433% |
| 2047 | newJobWageIncome | 8.6267B | 11.5560B | 33.9567% |
| 2047 | potentialGDP | 37.7032T | 41.2296T | 9.3529% |
| 2047 | assetConsumption | 4.2398T | 4.3390T | 2.3394% |
| 2047 | totalDemandSpilloverLoss | 3.7421M | 3.5155M | 6.0533% |
| 2047 | maxNeutralTransfers | 2.3820T | 6.5880T | 176.5797% |
| 2048 | aggregateWageIncome | 4.2056T | 4.2483T | 1.0159% |
| 2048 | aggregateAssetIncome | 12.4452T | 12.6732T | 1.8317% |
| 2048 | gdpReal | 30.7145T | 44.2024T | 43.9135% |
| 2048 | consumption | 12.4526T | 12.6967T | 1.9605% |
| 2048 | consumerWelfareIndex | 31.8246K | 46.3659K | 45.6923% |
| 2048 | unrealizedAIOutput | 3.7690T | 3.6628T | 2.8165% |
| 2048 | aiGoodsAbsorbed | 5.4205T | 5.5269T | 1.9638% |
| 2048 | newJobEmployment | 180.5760K | 249.6340K | 38.2432% |
| 2048 | newJobWageIncome | 8.8659B | 12.3269B | 39.0367% |
| 2048 | potentialGDP | 39.9040T | 41.6673T | 4.4189% |
| 2048 | wageConsumption | 2.2189T | 2.2451T | 1.1800% |
| 2048 | assetConsumption | 4.3558T | 4.4356T | 1.8317% |
| 2048 | totalDemandSpilloverLoss | 3.0999M | 2.8357M | 8.5246% |
| 2048 | maxNeutralTransfers | 2.6464T | 7.6184T | 187.8813% |
| 2049 | aggregateWageIncome | 4.1783T | 4.2307T | 1.2551% |
| 2049 | aggregateAssetIncome | 12.6677T | 12.8346T | 1.3178% |
| 2049 | gdpReal | 32.8067T | 49.2403T | 50.0922% |
| 2049 | consumption | 12.4656T | 12.7452T | 2.2426% |
| 2049 | consumerWelfareIndex | 33.7765K | 51.3921K | 52.1532% |
| 2049 | unrealizedAIOutput | 3.8256T | 3.7019T | 3.2335% |
| 2049 | aiGoodsAbsorbed | 5.5160T | 5.6397T | 2.2426% |
| 2049 | newJobEmployment | 186.9165K | 268.9982K | 43.9135% |
| 2049 | newJobWageIncome | 9.1913B | 13.3222B | 44.9436% |
| 2049 | wageConsumption | 2.1908T | 2.2227T | 1.4551% |
| 2049 | assetConsumption | 4.4337T | 4.4921T | 1.3178% |
| 2049 | aiCorporateProfits | 2.9359T | 2.9669T | 1.0534% |
| 2049 | aiGDPContribution | 11.7438T | 11.8675T | 1.0534% |
| 2049 | totalDemandSpilloverLoss | 2.7681M | 2.4593M | 11.1545% |
| 2049 | maxNeutralTransfers | 2.8936T | 8.6862T | 200.1844% |
| 2050 | aggregateWageIncome | 4.1644T | 4.2265T | 1.4919% |
| 2050 | gdpReal | 35.0519T | 54.9335T | 56.7207% |
| 2050 | consumption | 12.4949T | 12.8068T | 2.4969% |
| 2050 | consumerWelfareIndex | 35.9102K | 57.1215K | 59.0678% |
| 2050 | unrealizedAIOutput | 3.8565T | 3.7169T | 3.6209% |
| 2050 | aiGoodsAbsorbed | 5.5925T | 5.7321T | 2.4969% |
| 2050 | newJobEmployment | 196.0146K | 294.2027K | 50.0922% |
| 2050 | newJobWageIncome | 9.6332B | 14.5827B | 51.3796% |
| 2050 | potentialGDP | 44.5009T | 42.2327T | 5.0969% |
| 2050 | wageConsumption | 2.1758T | 2.2133T | 1.7261% |
| 2050 | corporateProfits | 5.2359T | 5.2906T | 1.0449% |
| 2050 | aiCorporateProfits | 2.9730T | 3.0079T | 1.1743% |
| 2050 | aiGDPContribution | 11.8918T | 12.0315T | 1.1743% |
| 2050 | totalDemandSpilloverLoss | 2.5975M | 2.2389M | 13.8074% |
| 2050 | maxNeutralTransfers | 3.1311T | 9.8143T | 213.4415% |

## Field Comparison Warnings

303 fields between 0.01-1% relative error.

| Year | Field | Expected | Actual | Error |
|-----:|-------|----------|--------|------:|
| 2028 | consumerWelfareIndex | 66.6006K | 68.0367K | 2.1563% |
| 2029 | totalUnemployment | 6.9173M | 6.9011M | 0.2338% |
| 2029 | consumerWelfareIndex | 66.6450K | 69.5533K | 4.3639% |
| 2030 | totalEmployment | 168.0073M | 168.0401M | 0.0196% |
| 2030 | totalUnemployment | 6.9452M | 6.9123M | 0.4730% |
| 2030 | aggregateWageIncome | 23.3780T | 23.3821T | 0.0174% |
| 2030 | totalIncome | 38.6331T | 38.6374T | 0.0112% |
| 2030 | consumption | 28.0300T | 28.0333T | 0.0119% |
| 2030 | consumerWelfareIndex | 66.5704K | 70.9787K | 6.6220% |
| 2030 | wageConsumption | 18.7024T | 18.7057T | 0.0174% |
| 2031 | totalEmployment | 168.6780M | 168.7280M | 0.0296% |
| 2031 | totalUnemployment | 6.9743M | 6.9243M | 0.7163% |
| 2031 | aggregateWageIncome | 24.5653T | 24.5729T | 0.0309% |
| 2031 | totalIncome | 40.5783T | 40.5866T | 0.0206% |
| 2031 | gdpNominal | 42.7436T | 42.7512T | 0.0177% |
| 2031 | consumption | 29.4375T | 29.4439T | 0.0216% |
| 2031 | investment | 7.4812T | 7.4824T | 0.0160% |
| 2031 | consumerWelfareIndex | 66.4174K | 72.3495K | 8.9315% |
| 2031 | wageConsumption | 19.6522T | 19.6583T | 0.0309% |
| 2031 | corporateProfits | 4.7018T | 4.7026T | 0.0177% |
| 2031 | traditionalCorporateProfits | 4.7018T | 4.7026T | 0.0177% |
| 2032 | totalEmployment | 169.3478M | 169.4151M | 0.0398% |
| 2032 | totalUnemployment | 7.0071M | 6.9397M | 0.9611% |
| 2032 | aggregateWageIncome | 25.7878T | 25.7998T | 0.0465% |
| 2032 | aggregateAssetIncome | 8.8583T | 8.8599T | 0.0179% |
| 2032 | totalIncome | 42.5873T | 42.6009T | 0.0318% |
| 2032 | gdpNominal | 44.8451T | 44.8574T | 0.0274% |
| 2032 | consumption | 30.8922T | 30.9023T | 0.0328% |
| 2032 | investment | 7.8459T | 7.8480T | 0.0267% |
| 2032 | consumerWelfareIndex | 66.2211K | 73.6998K | 11.2935% |
| 2032 | wageConsumption | 20.6302T | 20.6398T | 0.0465% |
| 2032 | assetConsumption | 3.1004T | 3.1010T | 0.0179% |
| 2032 | corporateProfits | 4.9330T | 4.9344T | 0.0274% |
| 2032 | traditionalCorporateProfits | 4.9329T | 4.9343T | 0.0273% |
| 2033 | totalEmployment | 169.9558M | 170.0386M | 0.0487% |
| 2033 | aggregateWageIncome | 27.0472T | 27.0641T | 0.0626% |
| 2033 | aggregateAssetIncome | 9.3014T | 9.3042T | 0.0305% |
| 2033 | totalIncome | 44.6663T | 44.6857T | 0.0435% |
| 2033 | gdpNominal | 47.0213T | 47.0385T | 0.0367% |
| 2033 | consumption | 32.3936T | 32.4077T | 0.0436% |
| 2033 | investment | 8.2299T | 8.2331T | 0.0393% |
| 2033 | consumerWelfareIndex | 66.0327K | 75.0879K | 13.7131% |
| 2033 | wageConsumption | 21.6377T | 21.6513T | 0.0626% |
| 2033 | assetConsumption | 3.2555T | 3.2565T | 0.0305% |
| 2033 | corporateProfits | 5.1731T | 5.1751T | 0.0372% |
| 2033 | traditionalCorporateProfits | 5.1717T | 5.1736T | 0.0362% |
| 2034 | totalEmployment | 170.2680M | 170.3569M | 0.0522% |
| 2034 | aggregateWageIncome | 28.3162T | 28.3375T | 0.0752% |
| 2034 | aggregateAssetIncome | 9.7958T | 9.8011T | 0.0541% |
| 2034 | totalIncome | 46.8073T | 46.8331T | 0.0551% |
| 2034 | gdpNominal | 49.2575T | 49.2791T | 0.0438% |
| 2034 | consumption | 33.9217T | 33.9388T | 0.0505% |
| 2034 | investment | 8.6432T | 8.6480T | 0.0550% |
| 2034 | wageConsumption | 22.6530T | 22.6700T | 0.0752% |
| 2034 | assetConsumption | 3.4285T | 3.4304T | 0.0541% |
| 2034 | corporateProfits | 5.4232T | 5.4257T | 0.0463% |
| 2034 | traditionalCorporateProfits | 5.4145T | 5.4168T | 0.0418% |
| 2035 | totalEmployment | 169.9999M | 170.0905M | 0.0533% |
| 2035 | aggregateWageIncome | 29.2804T | 29.3416T | 0.2087% |
| 2035 | aggregateAssetIncome | 10.3781T | 10.3864T | 0.0803% |
| 2035 | aggregateTransferIncome | 9.0721T | 9.0675T | 0.0500% |
| 2035 | totalIncome | 48.7306T | 48.7955T | 0.1332% |
| 2035 | gdpNominal | 51.1511T | 51.2153T | 0.1255% |
| 2035 | consumption | 35.0710T | 35.1304T | 0.1695% |
| 2035 | investment | 9.0999T | 9.1062T | 0.0692% |
| 2035 | governmentSpending | 8.1664T | 8.1652T | 0.0155% |
| 2035 | wageConsumption | 23.3730T | 23.4292T | 0.2406% |
| 2035 | assetConsumption | 3.6323T | 3.6352T | 0.0803% |
| 2035 | transferConsumption | 8.1648T | 8.1608T | 0.0500% |
| 2035 | corporateProfits | 5.6436T | 5.6510T | 0.1309% |
| 2035 | traditionalCorporateProfits | 5.6133T | 5.6201T | 0.1213% |
| 2036 | totalEmployment | 169.3031M | 169.4104M | 0.0634% |
| 2036 | aggregateWageIncome | 29.6326T | 29.7268T | 0.3178% |
| 2036 | aggregateAssetIncome | 10.9508T | 10.9686T | 0.1627% |
| 2036 | aggregateTransferIncome | 9.4011T | 9.3834T | 0.1886% |
| 2036 | totalIncome | 49.9845T | 50.0788T | 0.1886% |
| 2036 | gdpNominal | 52.1646T | 52.2309T | 0.1272% |
| 2036 | consumption | 35.4811T | 35.5359T | 0.1545% |
| 2036 | investment | 9.4522T | 9.4740T | 0.2307% |
| 2036 | governmentSpending | 8.4474T | 8.4384T | 0.1067% |
| 2036 | wageConsumption | 23.5402T | 23.6240T | 0.3556% |
| 2036 | assetConsumption | 3.8328T | 3.8390T | 0.1627% |
| 2036 | transferConsumption | 8.4610T | 8.4451T | 0.1886% |
| 2036 | corporateProfits | 5.7777T | 5.7855T | 0.1338% |
| 2036 | traditionalCorporateProfits | 5.7070T | 5.7139T | 0.1219% |
| 2037 | totalEmployment | 167.8892M | 168.0086M | 0.0712% |
| 2037 | totalUnemployment | 12.0211M | 11.9017M | 0.9938% |
| 2037 | aggregateWageIncome | 29.0460T | 29.1438T | 0.3368% |
| 2037 | aggregateAssetIncome | 11.4339T | 11.4531T | 0.1687% |
| 2037 | aggregateTransferIncome | 9.6555T | 9.6125T | 0.4457% |
| 2037 | totalIncome | 50.1354T | 50.2095T | 0.1478% |
| 2037 | gdpNominal | 51.9014T | 51.8943T | 0.0136% |
| 2037 | consumption | 34.8665T | 34.8732T | 0.0194% |
| 2037 | investment | 9.6100T | 9.6243T | 0.1484% |
| 2037 | governmentSpending | 8.6349T | 8.6080T | 0.3113% |
| 2037 | aiAdditionalOutput | 590.4142B | 594.6146B | 0.7114% |
| 2037 | aiInvestmentBoost | 177.1243B | 178.3844B | 0.7114% |
| 2037 | aiNetExportBoost | 59.0414B | 59.4615B | 0.7114% |
| 2037 | aiConsumerGoodsPotential | 354.2485B | 356.7687B | 0.7114% |
| 2037 | aiGoodsAbsorbed | 354.2485B | 356.7687B | 0.7114% |
| 2037 | wageConsumption | 22.9054T | 22.9923T | 0.3790% |
| 2037 | assetConsumption | 4.0018T | 4.0086T | 0.1687% |
| 2037 | transferConsumption | 8.6900T | 8.6513T | 0.4457% |
| 2037 | aiCorporateProfits | 147.6035B | 148.6536B | 0.7114% |
| 2037 | traditionalCorporateProfits | 5.6442T | 5.6430T | 0.0219% |
| 2037 | aiGDPContribution | 590.4142B | 594.6146B | 0.7114% |
| 2038 | totalEmployment | 165.5731M | 165.6857M | 0.0680% |
| 2038 | totalUnemployment | 15.0569M | 14.9443M | 0.7477% |
| 2038 | aggregateWageIncome | 27.2972T | 27.3467T | 0.1815% |
| 2038 | aggregateAssetIncome | 11.7481T | 11.7551T | 0.0595% |
| 2038 | aggregateTransferIncome | 9.7890T | 9.7027T | 0.8815% |
| 2038 | totalIncome | 48.8343T | 48.8046T | 0.0609% |
| 2038 | gdpNominal | 50.0698T | 49.8821T | 0.3748% |
| 2038 | consumption | 32.9886T | 32.8731T | 0.3500% |
| 2038 | investment | 9.5543T | 9.5418T | 0.1308% |
| 2038 | governmentSpending | 8.6797T | 8.6193T | 0.6965% |
| 2038 | aiAdditionalOutput | 1.0986T | 1.1041T | 0.5018% |
| 2038 | aiInvestmentBoost | 329.5873B | 331.2410B | 0.5018% |
| 2038 | aiNetExportBoost | 109.8624B | 110.4137B | 0.5018% |
| 2038 | aiConsumerGoodsPotential | 659.1746B | 662.4821B | 0.5018% |
| 2038 | aiGoodsAbsorbed | 659.1746B | 662.4821B | 0.5018% |
| 2038 | wageConsumption | 21.3006T | 21.3478T | 0.2215% |
| 2038 | assetConsumption | 4.1118T | 4.1143T | 0.0595% |
| 2038 | transferConsumption | 8.8101T | 8.7325T | 0.8815% |
| 2038 | corporateProfits | 5.6615T | 5.6416T | 0.3510% |
| 2038 | aiCorporateProfits | 274.6561B | 276.0342B | 0.5018% |
| 2038 | traditionalCorporateProfits | 5.3868T | 5.3656T | 0.3945% |
| 2038 | aiGDPContribution | 1.0986T | 1.1041T | 0.5018% |
| 2039 | totalEmployment | 159.9870M | 160.1098M | 0.0767% |
| 2039 | totalUnemployment | 21.3654M | 21.2427M | 0.5746% |
| 2039 | aggregateWageIncome | 23.3158T | 23.2788T | 0.1588% |
| 2039 | aggregateAssetIncome | 12.0312T | 11.9918T | 0.3273% |
| 2039 | aggregateTransferIncome | 9.9102T | 9.8237T | 0.8727% |
| 2039 | totalIncome | 45.2572T | 45.0943T | 0.3599% |
| 2039 | investment | 9.4105T | 9.3447T | 0.6994% |
| 2039 | governmentSpending | 8.6170T | 8.5504T | 0.7733% |
| 2039 | consumerWelfareIndex | 47.1662K | 56.3903K | 19.5566% |
| 2039 | aiAdditionalOutput | 2.1558T | 2.1579T | 0.0946% |
| 2039 | aiInvestmentBoost | 646.7474B | 647.3590B | 0.0946% |
| 2039 | aiNetExportBoost | 215.5825B | 215.7863B | 0.0946% |
| 2039 | aiConsumerGoodsPotential | 1.2935T | 1.2947T | 0.0946% |
| 2039 | aiGoodsAbsorbed | 1.2935T | 1.2947T | 0.0946% |
| 2039 | wageConsumption | 17.7922T | 17.7718T | 0.1145% |
| 2039 | assetConsumption | 4.2109T | 4.1971T | 0.3273% |
| 2039 | transferConsumption | 8.9191T | 8.8413T | 0.8727% |
| 2039 | aiCorporateProfits | 538.9562B | 539.4659B | 0.0946% |
| 2039 | aiGDPContribution | 2.1558T | 2.1579T | 0.0946% |
| 2040 | totalEmployment | 150.2226M | 150.2481M | 0.0170% |
| 2040 | totalUnemployment | 31.8553M | 31.8297M | 0.0803% |
| 2040 | aggregateTransferIncome | 10.1116T | 10.0269T | 0.8369% |
| 2040 | consumerWelfareIndex | 37.6842K | 44.5071K | 18.1054% |
| 2040 | aiAdditionalOutput | 3.9523T | 3.9641T | 0.2976% |
| 2040 | aiInvestmentBoost | 1.1857T | 1.1892T | 0.2976% |
| 2040 | aiNetExportBoost | 395.2337B | 396.4099B | 0.2976% |
| 2040 | aiConsumerGoodsPotential | 2.3714T | 2.3785T | 0.2976% |
| 2040 | transferConsumption | 9.1004T | 9.0242T | 0.8369% |
| 2041 | totalEmployment | 132.9871M | 132.6605M | 0.2456% |
| 2041 | totalUnemployment | 49.8191M | 50.1457M | 0.6555% |
| 2041 | aggregateTransferIncome | 10.4565T | 10.3786T | 0.7446% |
| 2041 | consumerWelfareIndex | 29.6694K | 35.3139K | 19.0247% |
| 2041 | aiAdditionalOutput | 7.0791T | 7.1439T | 0.9148% |
| 2041 | aiInvestmentBoost | 2.1237T | 2.1432T | 0.9148% |
| 2041 | aiNetExportBoost | 707.9091B | 714.3851B | 0.9148% |
| 2041 | aiConsumerGoodsPotential | 4.2475T | 4.2863T | 0.9148% |
| 2041 | aiGoodsAbsorbed | 3.2686T | 3.2395T | 0.8905% |
| 2041 | transferConsumption | 9.4108T | 9.3407T | 0.7446% |
| 2041 | aiCorporateProfits | 1.5251T | 1.5243T | 0.0525% |
| 2041 | aiGDPContribution | 6.1002T | 6.0970T | 0.0525% |
| 2042 | totalEmployment | 117.3188M | 116.3615M | 0.8160% |
| 2042 | aggregateAssetIncome | 9.1631T | 9.1501T | 0.1410% |
| 2042 | aggregateTransferIncome | 10.7713T | 10.7056T | 0.6104% |
| 2042 | totalIncome | 27.0497T | 26.8078T | 0.8940% |
| 2042 | gdpNominal | 30.4658T | 30.2443T | 0.7270% |
| 2042 | consumption | 13.9887T | 13.8630T | 0.8990% |
| 2042 | investment | 8.3125T | 8.2816T | 0.3717% |
| 2042 | governmentSpending | 8.0143T | 7.9381T | 0.9507% |
| 2042 | consumerWelfareIndex | 26.3540K | 31.7951K | 20.6459% |
| 2042 | aiGoodsAbsorbed | 3.7382T | 3.7046T | 0.8990% |
| 2042 | assetConsumption | 3.2071T | 3.2025T | 0.1410% |
| 2042 | transferConsumption | 9.6942T | 9.6350T | 0.6104% |
| 2042 | corporateProfits | 4.4011T | 4.3721T | 0.6605% |
| 2042 | aiCorporateProfits | 1.8748T | 1.8664T | 0.4481% |
| 2042 | traditionalCorporateProfits | 2.5263T | 2.5057T | 0.8181% |
| 2042 | aiGDPContribution | 7.4992T | 7.4656T | 0.4481% |
| 2043 | totalEmployment | 98.4960M | 98.1726M | 0.3284% |
| 2043 | totalUnemployment | 85.7755M | 86.0990M | 0.3771% |
| 2043 | aggregateTransferIncome | 11.1468T | 11.0689T | 0.6991% |
| 2043 | totalIncome | 25.6496T | 25.6746T | 0.0976% |
| 2043 | gdpNominal | 30.1334T | 30.1035T | 0.0990% |
| 2043 | consumption | 12.7519T | 12.7821T | 0.2365% |
| 2043 | investment | 9.0455T | 9.0479T | 0.0268% |
| 2043 | governmentSpending | 7.9457T | 7.8779T | 0.8532% |
| 2043 | consumerWelfareIndex | 24.9707K | 30.8143K | 23.4020% |
| 2043 | unrealizedAIOutput | 2.6880T | 2.6783T | 0.3608% |
| 2043 | aiGoodsAbsorbed | 4.1005T | 4.1102T | 0.2365% |
| 2043 | transferConsumption | 10.0321T | 9.9620T | 0.6991% |
| 2043 | corporateProfits | 4.5223T | 4.5204T | 0.0425% |
| 2043 | aiCorporateProfits | 2.1565T | 2.1589T | 0.1124% |
| 2043 | traditionalCorporateProfits | 2.3658T | 2.3615T | 0.1837% |
| 2043 | aiGDPContribution | 8.6261T | 8.6358T | 0.1124% |
| 2044 | totalEmployment | 89.0309M | 89.0861M | 0.0620% |
| 2044 | totalUnemployment | 95.9777M | 95.9225M | 0.0575% |
| 2044 | aggregateWageIncome | 4.6171T | 4.6155T | 0.0366% |
| 2044 | aggregateTransferIncome | 11.3427T | 11.2575T | 0.7511% |
| 2044 | totalIncome | 25.8313T | 26.0688T | 0.9192% |
| 2044 | gdpNominal | 30.4899T | 30.5656T | 0.2484% |
| 2044 | consumption | 12.2768T | 12.3805T | 0.8445% |
| 2044 | investment | 9.7420T | 9.7750T | 0.3388% |
| 2044 | governmentSpending | 7.9343T | 7.8731T | 0.7717% |
| 2044 | consumerWelfareIndex | 25.2095K | 31.9093K | 26.5766% |
| 2044 | aiAdditionalOutput | 12.6987T | 12.6943T | 0.0342% |
| 2044 | aiInvestmentBoost | 3.8096T | 3.8083T | 0.0342% |
| 2044 | aiNetExportBoost | 1.2699T | 1.2694T | 0.0342% |
| 2044 | aiConsumerGoodsPotential | 7.6192T | 7.6166T | 0.0342% |
| 2044 | aiGoodsAbsorbed | 4.4308T | 4.4667T | 0.8100% |
| 2044 | wageConsumption | 2.5977T | 2.5974T | 0.0101% |
| 2044 | transferConsumption | 10.2084T | 10.1318T | 0.7511% |
| 2044 | corporateProfits | 4.6853T | 4.6984T | 0.2799% |
| 2044 | aiCorporateProfits | 2.3776T | 2.3861T | 0.3591% |
| 2044 | traditionalCorporateProfits | 2.3078T | 2.3123T | 0.1983% |
| 2044 | aiGDPContribution | 9.5103T | 9.5445T | 0.3591% |
| 2044 | totalDemandSpilloverLoss | 6.6291M | 6.6374M | 0.1259% |
| 2045 | totalEmployment | 83.6257M | 83.8456M | 0.2629% |
| 2045 | totalUnemployment | 102.1229M | 101.9031M | 0.2153% |
| 2045 | aggregateWageIncome | 4.3191T | 4.3420T | 0.5299% |
| 2045 | aggregateTransferIncome | 11.4607T | 11.3723T | 0.7709% |
| 2045 | gdpNominal | 31.1333T | 31.2554T | 0.3922% |
| 2045 | investment | 10.2886T | 10.3248T | 0.3521% |
| 2045 | governmentSpending | 7.9465T | 7.8889T | 0.7251% |
| 2045 | consumerWelfareIndex | 26.5085K | 34.5349K | 30.2786% |
| 2045 | aiAdditionalOutput | 13.7897T | 13.7829T | 0.0491% |
| 2045 | aiInvestmentBoost | 4.1369T | 4.1349T | 0.0491% |
| 2045 | aiNetExportBoost | 1.3790T | 1.3783T | 0.0491% |
| 2045 | aiConsumerGoodsPotential | 8.2738T | 8.2697T | 0.0491% |
| 2045 | wageConsumption | 2.3630T | 2.3781T | 0.6386% |
| 2045 | transferConsumption | 10.3146T | 10.2351T | 0.7709% |
| 2045 | corporateProfits | 4.8696T | 4.8903T | 0.4257% |
| 2045 | aiCorporateProfits | 2.5803T | 2.5933T | 0.5051% |
| 2045 | traditionalCorporateProfits | 2.2893T | 2.2970T | 0.3362% |
| 2045 | aiGDPContribution | 10.3211T | 10.3733T | 0.5051% |
| 2046 | totalEmployment | 80.7673M | 81.0238M | 0.3176% |
| 2046 | totalUnemployment | 105.7244M | 105.4679M | 0.2426% |
| 2046 | aggregateWageIncome | 4.2587T | 4.2896T | 0.7256% |
| 2046 | aggregateTransferIncome | 11.5299T | 11.4408T | 0.7724% |
| 2046 | totalIncome | 27.4585T | 27.7329T | 0.9990% |
| 2046 | gdpNominal | 31.7233T | 31.8692T | 0.4601% |
| 2046 | investment | 10.6842T | 10.7188T | 0.3241% |
| 2046 | governmentSpending | 7.9686T | 7.9125T | 0.7031% |
| 2046 | consumerWelfareIndex | 28.2510K | 38.0186K | 34.5744% |
| 2046 | wageConsumption | 2.2935T | 2.3131T | 0.8542% |
| 2046 | transferConsumption | 10.3769T | 10.2967T | 0.7724% |
| 2046 | corporateProfits | 5.0142T | 5.0400T | 0.5160% |
| 2046 | aiCorporateProfits | 2.7225T | 2.7400T | 0.6441% |
| 2046 | traditionalCorporateProfits | 2.2917T | 2.3000T | 0.3639% |
| 2046 | aiGDPContribution | 10.8900T | 10.9602T | 0.6441% |
| 2047 | totalEmployment | 78.8555M | 79.1351M | 0.3546% |
| 2047 | totalUnemployment | 108.3822M | 108.1026M | 0.2580% |
| 2047 | aggregateWageIncome | 4.2395T | 4.2748T | 0.8325% |
| 2047 | aggregateTransferIncome | 11.5809T | 11.4914T | 0.7728% |
| 2047 | totalIncome | 27.9341T | 28.1633T | 0.8205% |
| 2047 | gdpNominal | 32.0692T | 32.2532T | 0.5740% |
| 2047 | investment | 10.9266T | 10.9609T | 0.3143% |
| 2047 | governmentSpending | 7.9888T | 7.9335T | 0.6911% |
| 2047 | wageConsumption | 2.2578T | 2.2798T | 0.9739% |
| 2047 | transferConsumption | 10.4228T | 10.3422T | 0.7728% |
| 2047 | corporateProfits | 5.1053T | 5.1380T | 0.6400% |
| 2047 | aiCorporateProfits | 2.8173T | 2.8395T | 0.7877% |
| 2047 | traditionalCorporateProfits | 2.2880T | 2.2985T | 0.4582% |
| 2047 | aiGDPContribution | 11.2691T | 11.3578T | 0.7877% |
| 2048 | totalEmployment | 77.3055M | 77.6277M | 0.4169% |
| 2048 | totalUnemployment | 110.6811M | 110.3589M | 0.2912% |
| 2048 | aggregateTransferIncome | 11.6250T | 11.5347T | 0.7769% |
| 2048 | totalIncome | 28.2759T | 28.4562T | 0.6379% |
| 2048 | gdpNominal | 32.2468T | 32.4776T | 0.7157% |
| 2048 | investment | 11.0422T | 11.0872T | 0.4075% |
| 2048 | governmentSpending | 8.0006T | 7.9467T | 0.6738% |
| 2048 | transferConsumption | 10.4625T | 10.3812T | 0.7769% |
| 2048 | corporateProfits | 5.1637T | 5.2040T | 0.7808% |
| 2048 | aiCorporateProfits | 2.8867T | 2.9133T | 0.9236% |
| 2048 | traditionalCorporateProfits | 2.2770T | 2.2907T | 0.5998% |
| 2048 | aiGDPContribution | 11.5467T | 11.6534T | 0.9236% |
| 2049 | totalEmployment | 76.3722M | 76.7630M | 0.5118% |
| 2049 | totalUnemployment | 112.3664M | 111.9755M | 0.3478% |
| 2049 | aggregateTransferIncome | 11.6574T | 11.5657T | 0.7861% |
| 2049 | totalIncome | 28.5033T | 28.6311T | 0.4481% |
| 2049 | gdpNominal | 32.3574T | 32.6349T | 0.8577% |
| 2049 | investment | 11.1126T | 11.1685T | 0.5030% |
| 2049 | governmentSpending | 8.0067T | 7.9544T | 0.6533% |
| 2049 | potentialGDP | 42.1483T | 41.9765T | 0.4076% |
| 2049 | transferConsumption | 10.4916T | 10.4092T | 0.7861% |
| 2049 | corporateProfits | 5.2034T | 5.2513T | 0.9195% |
| 2049 | traditionalCorporateProfits | 2.2675T | 2.2844T | 0.7463% |
| 2050 | totalEmployment | 75.9762M | 76.4330M | 0.6013% |
| 2050 | totalUnemployment | 113.5173M | 113.0605M | 0.4024% |
| 2050 | aggregateAssetIncome | 12.8317T | 12.9346T | 0.8016% |
| 2050 | aggregateTransferIncome | 11.6795T | 11.5866T | 0.7954% |
| 2050 | totalIncome | 28.6756T | 28.7477T | 0.2514% |
| 2050 | gdpNominal | 32.4641T | 32.7837T | 0.9846% |
| 2050 | investment | 11.1711T | 11.2362T | 0.5829% |
| 2050 | governmentSpending | 8.0105T | 7.9598T | 0.6330% |
| 2050 | assetConsumption | 4.4911T | 4.5271T | 0.8016% |
| 2050 | transferConsumption | 10.5115T | 10.4279T | 0.7954% |
| 2050 | traditionalCorporateProfits | 2.2629T | 2.2827T | 0.8750% |

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
| gdpReal | 33.3396T | 34.0585T | 2.1563% | **FAIL** |
| consumerWelfareIndex | 66.6006K | 68.0367K | 2.1563% | WARN |
| potentialGDP | 33.3396T | 36.8183T | 10.4343% | **FAIL** |

### Year 2029

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 6.9173M | 6.9011M | 0.2338% | WARN |
| gdpReal | 33.4658T | 34.9257T | 4.3624% | **FAIL** |
| consumerWelfareIndex | 66.6450K | 69.5533K | 4.3639% | WARN |
| newJobEmployment | 750.1402K | 766.3152K | 2.1563% | **FAIL** |
| newJobWageIncome | 72.1927B | 73.7494B | 2.1563% | **FAIL** |
| potentialGDP | 33.4658T | 38.7493T | 15.7878% | **FAIL** |

### Year 2030

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

### Year 2031

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

### Year 2032

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

### Year 2033

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

### Year 2034

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

### Year 2035

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

### Year 2036

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

### Year 2037

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

### Year 2038

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

### Year 2039

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

### Year 2040

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

### Year 2041

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

### Year 2042

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

### Year 2043

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

### Year 2044

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

### Year 2045

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

### Year 2046

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

### Year 2047

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

### Year 2048

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

### Year 2049

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

### Year 2050

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

## Invariant Checks

878 passed, 0 failed out of 878 checks.

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
| policy_isolation_consumerWelfareIndex | 3 |
| policy_isolation_consumption | 3 |
| policy_isolation_gdpNominal | 3 |
| policy_isolation_priceLevel | 3 |
| policy_isolation_totalEmployment | 3 |
| policy_isolation_totalIncome | 3 |
| price_level_positive | 26 |
| unemployment_rate_bounds | 26 |

---
*Scenario "min_wage_only" — ATLAS Verification Audit v1.0*
