# Scenario: UBI Phased

> UBI ramp: $500@2032 -> $2000@2038. Verifies keyframe interpolation + policy isolation.

Generated: 2026-02-23T20:50:03.899Z

## Summary

| Metric | Value |
|--------|------:|
| Total field comparisons | 1846 |
| PASS (<0.01% error) | 1349 |
| WARN (0.01-1% error) | 246 |
| FAIL (>1% error) | 251 |
| Invariant checks | 902 (902 pass, 0 fail) |
| Worst field | cwiGrowthRate (407.4582%) |

## Field Comparison Failures

251 fields exceed 1% relative error.

| Year | Field | Expected | Actual | Error |
|-----:|-------|----------|--------|------:|
| 2026 | potentialGDP | 32.1442T | 32.9900T | 2.6313% |
| 2027 | potentialGDP | 33.1365T | 34.9033T | 5.3318% |
| 2028 | potentialGDP | 33.8511T | 36.5942T | 8.1033% |
| 2029 | potentialGDP | 34.3152T | 38.0719T | 10.9478% |
| 2030 | potentialGDP | 34.6034T | 39.4019T | 13.8672% |
| 2031 | potentialGDP | 34.7788T | 40.6437T | 16.8633% |
| 2032 | aiAdditionalOutput | 320.5461M | 328.9254M | 2.6141% |
| 2032 | aiInvestmentBoost | 96.1638M | 98.6776M | 2.6141% |
| 2032 | aiNetExportBoost | 32.0546M | 32.8925M | 2.6141% |
| 2032 | aiConsumerGoodsPotential | 192.3277M | 197.3553M | 2.6141% |
| 2032 | aiGoodsAbsorbed | 192.3277M | 197.3553M | 2.6141% |
| 2032 | potentialGDP | 36.1215T | 43.3188T | 19.9253% |
| 2032 | aiCorporateProfits | 80.1365M | 82.2314M | 2.6141% |
| 2032 | aiGDPContribution | 320.5461M | 328.9254M | 2.6141% |
| 2032 | moneySupply | 21.8223T | 22.6447T | 3.7683% |
| 2032 | maxNeutralTransfers | 2.8168B | 2.1448B | 23.8578% |
| 2033 | aiAdditionalOutput | 5.5776B | 5.7084B | 2.3461% |
| 2033 | aiInvestmentBoost | 1.6733B | 1.7125B | 2.3461% |
| 2033 | aiNetExportBoost | 557.7579M | 570.8435M | 2.3461% |
| 2033 | aiConsumerGoodsPotential | 3.3465B | 3.4251B | 2.3461% |
| 2033 | aiGoodsAbsorbed | 3.3465B | 3.4251B | 2.3461% |
| 2033 | potentialGDP | 37.8915T | 46.5886T | 22.9526% |
| 2033 | aiCorporateProfits | 1.3944B | 1.4271B | 2.3461% |
| 2033 | aiGDPContribution | 5.5776B | 5.7084B | 2.3461% |
| 2033 | moneySupply | 23.0608T | 25.1216T | 8.9363% |
| 2033 | maxNeutralTransfers | 28.1062B | 19.7927B | 29.5788% |
| 2034 | aiAdditionalOutput | 34.7859B | 36.0025B | 3.4974% |
| 2034 | aiInvestmentBoost | 10.4358B | 10.8008B | 3.4974% |
| 2034 | aiNetExportBoost | 3.4786B | 3.6003B | 3.4974% |
| 2034 | aiConsumerGoodsPotential | 20.8715B | 21.6015B | 3.4974% |
| 2034 | aiGoodsAbsorbed | 20.8715B | 21.6015B | 3.4974% |
| 2034 | potentialGDP | 39.8212T | 50.0938T | 25.7969% |
| 2034 | aiCorporateProfits | 8.6965B | 9.0006B | 3.4974% |
| 2034 | aiGDPContribution | 34.7859B | 36.0025B | 3.4974% |
| 2034 | moneySupply | 24.7187T | 28.4373T | 15.0439% |
| 2034 | maxNeutralTransfers | 86.5323B | 56.1834B | 35.0723% |
| 2035 | aiAdditionalOutput | 120.9332B | 123.7956B | 2.3669% |
| 2035 | aiInvestmentBoost | 36.2800B | 37.1387B | 2.3669% |
| 2035 | aiNetExportBoost | 12.0933B | 12.3796B | 2.3669% |
| 2035 | aiConsumerGoodsPotential | 72.5599B | 74.2774B | 2.3669% |
| 2035 | aiGoodsAbsorbed | 72.5599B | 74.2774B | 2.3669% |
| 2035 | potentialGDP | 41.7182T | 53.4457T | 28.1114% |
| 2035 | aiCorporateProfits | 30.2333B | 30.9489B | 2.3669% |
| 2035 | aiGDPContribution | 120.9332B | 123.7956B | 2.3669% |
| 2035 | moneySupply | 26.7993T | 32.5986T | 21.6397% |
| 2035 | maxNeutralTransfers | 166.3399B | 100.4241B | 39.6272% |
| 2036 | aiAdditionalOutput | 282.6292B | 286.5308B | 1.3805% |
| 2036 | aiInvestmentBoost | 84.7888B | 85.9592B | 1.3805% |
| 2036 | aiNetExportBoost | 28.2629B | 28.6531B | 1.3805% |
| 2036 | aiConsumerGoodsPotential | 169.5775B | 171.9185B | 1.3805% |
| 2036 | aiGoodsAbsorbed | 169.5775B | 171.9185B | 1.3805% |
| 2036 | potentialGDP | 43.3213T | 56.0593T | 29.4036% |
| 2036 | aiCorporateProfits | 70.6573B | 71.6327B | 1.3805% |
| 2036 | aiGDPContribution | 282.6292B | 286.5308B | 1.3805% |
| 2036 | moneySupply | 29.3060T | 37.6120T | 28.3423% |
| 2036 | maxNeutralTransfers | 309.5722B | 183.4959B | 40.7260% |
| 2037 | gdpNominal | 57.3294T | 55.5787T | 3.0537% |
| 2037 | gdpReal | 44.0630T | 42.1601T | 4.3184% |
| 2037 | consumption | 40.5617T | 38.8734T | 4.1623% |
| 2037 | aiAdditionalOutput | 590.2807B | 596.6945B | 1.0866% |
| 2037 | aiInvestmentBoost | 177.0842B | 179.0083B | 1.0866% |
| 2037 | aiNetExportBoost | 59.0281B | 59.6694B | 1.0866% |
| 2037 | aiConsumerGoodsPotential | 354.1684B | 358.0167B | 1.0866% |
| 2037 | aiGoodsAbsorbed | 354.1684B | 358.0167B | 1.0866% |
| 2037 | newJobWageIncome | 126.6794B | 125.3643B | 1.0382% |
| 2037 | potentialGDP | 44.4171T | 55.9367T | 25.9350% |
| 2037 | corporateProfits | 6.3889T | 6.1972T | 3.0001% |
| 2037 | aiCorporateProfits | 147.5702B | 149.1736B | 1.0866% |
| 2037 | traditionalCorporateProfits | 6.2413T | 6.0480T | 3.0967% |
| 2037 | aiGDPContribution | 590.2807B | 596.6945B | 1.0866% |
| 2037 | moneySupply | 32.2422T | 43.4845T | 34.8680% |
| 2037 | maxNeutralTransfers | 491.4291B | 294.7595B | 40.0199% |
| 2038 | aggregateWageIncome | 30.2996T | 29.3035T | 3.2877% |
| 2038 | aggregateAssetIncome | 12.9757T | 12.5927T | 2.9514% |
| 2038 | totalIncome | 57.8962T | 56.4826T | 2.4416% |
| 2038 | gdpNominal | 54.8595T | 52.7921T | 3.7685% |
| 2038 | gdpReal | 42.6884T | 39.9903T | 6.3205% |
| 2038 | consumption | 37.8077T | 36.4062T | 3.7071% |
| 2038 | investment | 10.8316T | 10.2082T | 5.7551% |
| 2038 | governmentSpending | 7.5051T | 7.4188T | 1.1503% |
| 2038 | aiAdditionalOutput | 1.0979T | 1.1110T | 1.1937% |
| 2038 | aiInvestmentBoost | 329.3805B | 333.3122B | 1.1937% |
| 2038 | aiNetExportBoost | 109.7935B | 111.1041B | 1.1937% |
| 2038 | aiConsumerGoodsPotential | 658.7610B | 666.6244B | 1.1937% |
| 2038 | aiGoodsAbsorbed | 658.7610B | 666.6244B | 1.1937% |
| 2038 | newJobEmployment | 923.1454K | 882.5773K | 4.3946% |
| 2038 | newJobWageIncome | 124.3693B | 115.1067B | 7.4477% |
| 2038 | potentialGDP | 43.3472T | 53.4587T | 23.3268% |
| 2038 | wageConsumption | 23.6667T | 22.8785T | 3.3305% |
| 2038 | assetConsumption | 4.5415T | 4.4075T | 2.9514% |
| 2038 | corporateProfits | 6.1883T | 5.9627T | 3.6452% |
| 2038 | aiCorporateProfits | 274.4837B | 277.7602B | 1.1937% |
| 2038 | traditionalCorporateProfits | 5.9138T | 5.6849T | 3.8698% |
| 2038 | aiGDPContribution | 1.0979T | 1.1110T | 1.1937% |
| 2038 | moneySupply | 35.6113T | 50.2227T | 41.0300% |
| 2038 | maxNeutralTransfers | 747.0090B | 496.7019B | 33.5079% |
| 2039 | aggregateWageIncome | 25.7132T | 24.6949T | 3.9601% |
| 2039 | aggregateAssetIncome | 13.2192T | 12.6952T | 3.9638% |
| 2039 | totalIncome | 53.6994T | 52.1223T | 2.9369% |
| 2039 | gdpNominal | 47.5970T | 45.4427T | 4.5262% |
| 2039 | gdpReal | 38.4635T | 34.7158T | 9.7435% |
| 2039 | consumption | 31.1371T | 29.4563T | 5.3981% |
| 2039 | investment | 10.1593T | 9.7318T | 4.2073% |
| 2039 | governmentSpending | 7.4205T | 7.3233T | 1.3096% |
| 2039 | newJobEmployment | 843.9328K | 790.1927K | 6.3678% |
| 2039 | newJobWageIncome | 101.6025B | 91.4338B | 10.0084% |
| 2039 | potentialGDP | 39.7521T | 46.7360T | 17.5688% |
| 2039 | wageConsumption | 19.6485T | 18.8632T | 3.9967% |
| 2039 | assetConsumption | 4.6267T | 4.4433T | 3.9638% |
| 2039 | corporateProfits | 5.5363T | 5.3005T | 4.2600% |
| 2039 | traditionalCorporateProfits | 4.9994T | 4.7616T | 4.7578% |
| 2039 | moneySupply | 38.9939T | 56.9878T | 46.1454% |
| 2039 | maxNeutralTransfers | 947.5980B | 839.4776B | 11.4099% |
| 2040 | aggregateWageIncome | 18.1645T | 17.2626T | 4.9647% |
| 2040 | aggregateAssetIncome | 12.1617T | 11.5614T | 4.9356% |
| 2040 | totalIncome | 45.3259T | 43.7916T | 3.3851% |
| 2040 | gdpNominal | 39.0128T | 37.4948T | 3.8911% |
| 2040 | gdpReal | 33.3291T | 29.1982T | 12.3943% |
| 2040 | consumption | 23.7887T | 22.7118T | 4.5272% |
| 2040 | investment | 8.8135T | 8.4175T | 4.4938% |
| 2040 | governmentSpending | 7.1718T | 7.0717T | 1.3965% |
| 2040 | newJobEmployment | 684.3940K | 616.6038K | 9.9051% |
| 2040 | newJobWageIncome | 63.9104B | 54.8328B | 14.2035% |
| 2040 | potentialGDP | 35.7091T | 39.8913T | 11.7118% |
| 2040 | wageConsumption | 13.3500T | 12.6758T | 5.0498% |
| 2040 | assetConsumption | 4.2566T | 4.0465T | 4.9356% |
| 2040 | corporateProfits | 4.8467T | 4.6836T | 3.3656% |
| 2040 | traditionalCorporateProfits | 3.8551T | 3.6851T | 4.4102% |
| 2040 | moneySupply | 42.3900T | 63.7801T | 50.4600% |
| 2040 | maxNeutralTransfers | 1.0697T | 1.5431T | 44.2519% |
| 2041 | aggregateWageIncome | 10.4934T | 10.0030T | 4.6737% |
| 2041 | aggregateAssetIncome | 10.6312T | 10.2212T | 3.8562% |
| 2041 | totalIncome | 36.5051T | 35.5760T | 2.5450% |
| 2041 | gdpNominal | 33.3466T | 32.7176T | 1.8862% |
| 2041 | gdpReal | 30.4191T | 26.2440T | 13.7253% |
| 2041 | consumption | 18.1498T | 17.7845T | 2.0129% |
| 2041 | investment | 8.5519T | 8.3238T | 2.6673% |
| 2041 | governmentSpending | 6.8779T | 6.7995T | 1.1394% |
| 2041 | unrealizedAIOutput | 602.7490B | 682.6743B | 13.2601% |
| 2041 | aiGoodsAbsorbed | 3.6942T | 3.6496T | 1.2073% |
| 2041 | newJobEmployment | 485.2326K | 423.2550K | 12.7728% |
| 2041 | newJobWageIncome | 30.9755B | 25.8595B | 16.5162% |
| 2041 | potentialGDP | 34.7161T | 37.0499T | 6.7225% |
| 2041 | wageConsumption | 7.1872T | 6.8396T | 4.8359% |
| 2041 | assetConsumption | 3.7209T | 3.5774T | 3.8562% |
| 2041 | corporateProfits | 4.5864T | 4.5142T | 1.5728% |
| 2041 | traditionalCorporateProfits | 2.9467T | 2.8798T | 2.2694% |
| 2041 | moneySupply | 45.7997T | 70.5995T | 54.1482% |
| 2041 | maxNeutralTransfers | 1.1967T | 2.0674T | 72.7536% |
| 2042 | aggregateWageIncome | 6.7041T | 6.5316T | 2.5731% |
| 2042 | aggregateAssetIncome | 9.3572T | 9.2603T | 1.0356% |
| 2042 | gdpReal | 30.0311T | 25.3023T | 15.7462% |
| 2042 | unrealizedAIOutput | 1.5561T | 1.5869T | 1.9824% |
| 2042 | newJobEmployment | 373.7572K | 322.4580K | 13.7253% |
| 2042 | newJobWageIncome | 17.7120B | 14.9338B | 15.6851% |
| 2042 | wageConsumption | 4.3272T | 4.2095T | 2.7206% |
| 2042 | assetConsumption | 3.2750T | 3.2411T | 1.0356% |
| 2042 | totalDemandSpilloverLoss | 802.4092K | 1.1096M | 38.2848% |
| 2042 | moneySupply | 49.2231T | 77.4461T | 57.3371% |
| 2042 | maxNeutralTransfers | 1.3860T | 2.3355T | 68.5076% |
| 2043 | aggregateWageIncome | 4.0487T | 3.9982T | 1.2469% |
| 2043 | gdpReal | 31.7573T | 25.9023T | 18.4366% |
| 2043 | newJobEmployment | 297.7141K | 250.8355K | 15.7462% |
| 2043 | newJobWageIncome | 10.6978B | 8.9329B | 16.4971% |
| 2043 | potentialGDP | 38.5455T | 36.2041T | 6.0744% |
| 2043 | wageConsumption | 2.4002T | 2.3665T | 1.4027% |
| 2043 | totalDemandSpilloverLoss | 4.9545M | 5.2524M | 6.0133% |
| 2043 | moneySupply | 52.6601T | 84.3202T | 60.1216% |
| 2043 | maxNeutralTransfers | 1.7733T | 2.8928T | 63.1267% |
| 2044 | aggregateAssetIncome | 9.6160T | 9.7178T | 1.0591% |
| 2044 | gdpReal | 35.5170T | 27.8210T | 21.6686% |
| 2044 | newJobEmployment | 270.9186K | 220.9934K | 18.4281% |
| 2044 | newJobWageIncome | 8.4152B | 6.8740B | 18.3144% |
| 2044 | potentialGDP | 43.1393T | 37.0519T | 14.1111% |
| 2044 | assetConsumption | 3.3656T | 3.4012T | 1.0591% |
| 2044 | moneySupply | 56.1109T | 91.2217T | 62.5741% |
| 2044 | maxNeutralTransfers | 2.3902T | 3.7444T | 56.6547% |
| 2045 | gdpReal | 40.9931T | 30.7551T | 24.9749% |
| 2045 | consumerWelfareIndex | 47.5688K | 35.6456K | 25.0652% |
| 2045 | newJobEmployment | 270.2345K | 211.7919K | 21.6266% |
| 2045 | newJobWageIncome | 7.8939B | 6.1888B | 21.5999% |
| 2045 | potentialGDP | 49.2836T | 38.2874T | 22.3120% |
| 2045 | moneySupply | 59.5754T | 98.1509T | 64.7506% |
| 2045 | maxNeutralTransfers | 3.0301T | 4.5455T | 50.0147% |
| 2046 | aggregateAssetIncome | 11.7050T | 11.3766T | 2.8057% |
| 2046 | totalIncome | 30.8436T | 30.4649T | 1.2276% |
| 2046 | gdpReal | 47.7362T | 34.3319T | 28.0800% |
| 2046 | consumerWelfareIndex | 54.6313K | 39.2189K | 28.2117% |
| 2046 | unrealizedAIOutput | 3.3248T | 3.3615T | 1.1037% |
| 2046 | newJobEmployment | 288.3384K | 216.3323K | 24.9728% |
| 2046 | newJobWageIncome | 8.3293B | 6.2218B | 25.3025% |
| 2046 | potentialGDP | 56.4270T | 39.3415T | 30.2790% |
| 2046 | assetConsumption | 4.0968T | 3.9818T | 2.8057% |
| 2046 | totalDemandSpilloverLoss | 5.3044M | 5.4066M | 1.9270% |
| 2046 | moneySupply | 63.0539T | 105.1078T | 66.6952% |
| 2046 | maxNeutralTransfers | 3.7658T | 5.4166T | 43.8358% |
| 2047 | aggregateWageIncome | 2.4992T | 2.4715T | 1.1088% |
| 2047 | aggregateAssetIncome | 12.4127T | 11.8764T | 4.3207% |
| 2047 | totalIncome | 31.5812T | 30.9856T | 1.8859% |
| 2047 | gdpReal | 55.4747T | 38.3040T | 30.9522% |
| 2047 | consumerWelfareIndex | 62.8803K | 43.3273K | 31.0956% |
| 2047 | unrealizedAIOutput | 3.3809T | 3.4238T | 1.2684% |
| 2047 | newJobEmployment | 315.4669K | 226.8644K | 28.0861% |
| 2047 | newJobWageIncome | 9.1024B | 6.4968B | 28.6263% |
| 2047 | potentialGDP | 64.4510T | 40.0771T | 37.8178% |
| 2047 | wageConsumption | 1.3293T | 1.3128T | 1.2459% |
| 2047 | assetConsumption | 4.3444T | 4.1567T | 4.3207% |
| 2047 | totalDemandSpilloverLoss | 4.1250M | 4.3081M | 4.4394% |
| 2047 | moneySupply | 66.5462T | 112.0925T | 68.4430% |
| 2047 | maxNeutralTransfers | 4.6004T | 6.3534T | 38.1071% |
| 2048 | aggregateWageIncome | 2.4523T | 2.4215T | 1.2572% |
| 2048 | aggregateAssetIncome | 12.8711T | 12.1745T | 5.4123% |
| 2048 | totalIncome | 32.0614T | 31.3031T | 2.3649% |
| 2048 | gdpReal | 64.3646T | 42.7016T | 33.6566% |
| 2048 | consumerWelfareIndex | 72.5146K | 48.0052K | 33.7993% |
| 2048 | unrealizedAIOutput | 3.4253T | 3.4678T | 1.2420% |
| 2048 | newJobEmployment | 348.6679K | 240.6899K | 30.9687% |
| 2048 | newJobWageIncome | 9.9954B | 6.8417B | 31.5515% |
| 2048 | potentialGDP | 73.5542T | 40.5631T | 44.8528% |
| 2048 | wageConsumption | 1.2935T | 1.2752T | 1.4153% |
| 2048 | assetConsumption | 4.5049T | 4.2611T | 5.4123% |
| 2048 | totalDemandSpilloverLoss | 3.3288M | 3.5265M | 5.9380% |
| 2048 | moneySupply | 70.0526T | 119.1051T | 70.0225% |
| 2048 | maxNeutralTransfers | 5.5462T | 7.3606T | 32.7134% |
| 2049 | aggregateWageIncome | 2.4193T | 2.3899T | 1.2128% |
| 2049 | aggregateAssetIncome | 13.1903T | 12.3527T | 6.3502% |
| 2049 | totalIncome | 32.4053T | 31.5075T | 2.7705% |
| 2049 | gdpReal | 74.7165T | 47.6329T | 36.2485% |
| 2049 | consumerWelfareIndex | 83.8159K | 53.3282K | 36.3746% |
| 2049 | unrealizedAIOutput | 3.4511T | 3.4898T | 1.1213% |
| 2049 | newJobEmployment | 391.6972K | 259.8651K | 33.6566% |
| 2049 | newJobWageIncome | 11.1464B | 7.3357B | 34.1882% |
| 2049 | potentialGDP | 84.0581T | 40.9095T | 51.3319% |
| 2049 | wageConsumption | 1.2690T | 1.2516T | 1.3698% |
| 2049 | assetConsumption | 4.6166T | 4.3234T | 6.3502% |
| 2049 | totalDemandSpilloverLoss | 2.8997M | 3.0826M | 6.3071% |
| 2049 | moneySupply | 73.5729T | 126.1458T | 71.4569% |
| 2049 | maxNeutralTransfers | 6.5902T | 8.4027T | 27.5030% |
| 2050 | aggregateWageIncome | 2.4051T | 2.3773T | 1.1571% |
| 2050 | aggregateAssetIncome | 13.4289T | 12.4671T | 7.1624% |
| 2050 | totalIncome | 32.6776T | 31.6572T | 3.1225% |
| 2050 | gdpReal | 86.8240T | 53.1851T | 38.7438% |
| 2050 | consumerWelfareIndex | 97.0195K | 59.3364K | 38.8407% |
| 2050 | newJobEmployment | 446.4187K | 284.5986K | 36.2485% |
| 2050 | newJobWageIncome | 12.6436B | 8.0006B | 36.7223% |
| 2050 | potentialGDP | 96.2731T | 41.1875T | 57.2180% |
| 2050 | wageConsumption | 1.2578T | 1.2413T | 1.3169% |
| 2050 | assetConsumption | 4.7001T | 4.3635T | 7.1624% |
| 2050 | totalDemandSpilloverLoss | 2.6526M | 2.8114M | 5.9837% |
| 2050 | moneySupply | 77.1073T | 133.2147T | 72.7652% |
| 2050 | maxNeutralTransfers | 7.7559T | 9.5019T | 22.5124% |

## Field Comparison Warnings

246 fields between 0.01-1% relative error.

| Year | Field | Expected | Actual | Error |
|-----:|-------|----------|--------|------:|
| 2033 | totalUnemployment | 7.0473M | 7.0489M | 0.0232% |
| 2033 | newJobEmployment | 812.2186K | 812.2080K | 0.0013% |
| 2034 | totalEmployment | 170.3653M | 170.3477M | 0.0103% |
| 2034 | totalUnemployment | 7.4032M | 7.4209M | 0.2381% |
| 2034 | aggregateAssetIncome | 9.7048T | 9.7068T | 0.0202% |
| 2034 | newJobEmployment | 849.1364K | 849.0147K | 0.0143% |
| 2034 | newJobWageIncome | 101.4881B | 101.4779B | 0.0100% |
| 2034 | assetConsumption | 3.3967T | 3.3974T | 0.0202% |
| 2035 | totalEmployment | 170.1422M | 170.1045M | 0.0222% |
| 2035 | totalUnemployment | 8.3374M | 8.3752M | 0.4529% |
| 2035 | aggregateWageIncome | 29.8427T | 29.8207T | 0.0737% |
| 2035 | aggregateAssetIncome | 10.5493T | 10.5536T | 0.0403% |
| 2035 | aggregateTransferIncome | 11.8103T | 11.8062T | 0.0350% |
| 2035 | totalIncome | 52.2023T | 52.1804T | 0.0419% |
| 2035 | gdpNominal | 53.4150T | 53.3715T | 0.0815% |
| 2035 | gdpReal | 41.6456T | 41.5668T | 0.1893% |
| 2035 | consumption | 38.0763T | 38.0344T | 0.1101% |
| 2035 | investment | 9.3669T | 9.3685T | 0.0174% |
| 2035 | governmentSpending | 7.1780T | 7.1744T | 0.0495% |
| 2035 | consumerWelfareIndex | 83.8967K | 83.7139K | 0.2179% |
| 2035 | newJobEmployment | 884.3857K | 884.1221K | 0.0298% |
| 2035 | newJobWageIncome | 112.7179B | 112.6325B | 0.0758% |
| 2035 | wageConsumption | 23.8337T | 23.8129T | 0.0869% |
| 2035 | assetConsumption | 3.6923T | 3.6938T | 0.0403% |
| 2035 | transferConsumption | 10.6293T | 10.6256T | 0.0350% |
| 2035 | corporateProfits | 5.8926T | 5.8882T | 0.0744% |
| 2035 | traditionalCorporateProfits | 5.8623T | 5.8572T | 0.0870% |
| 2036 | totalEmployment | 169.4996M | 169.4599M | 0.0234% |
| 2036 | totalUnemployment | 9.6939M | 9.7336M | 0.4097% |
| 2036 | aggregateWageIncome | 31.0523T | 31.0036T | 0.1568% |
| 2036 | aggregateAssetIncome | 11.4329T | 11.4288T | 0.0364% |
| 2036 | aggregateTransferIncome | 12.7803T | 12.7624T | 0.1397% |
| 2036 | totalIncome | 55.2655T | 55.1947T | 0.1280% |
| 2036 | gdpNominal | 56.0114T | 55.8874T | 0.2215% |
| 2036 | gdpReal | 43.1517T | 42.8392T | 0.7244% |
| 2036 | consumption | 39.8417T | 39.7367T | 0.2635% |
| 2036 | investment | 10.0830T | 10.0773T | 0.0568% |
| 2036 | governmentSpending | 7.3580T | 7.3432T | 0.2013% |
| 2036 | consumerWelfareIndex | 86.3992K | 85.7373K | 0.7661% |
| 2036 | newJobEmployment | 914.0103K | 911.9637K | 0.2239% |
| 2036 | newJobWageIncome | 122.0086B | 121.5830B | 0.3488% |
| 2036 | wageConsumption | 24.6851T | 24.6429T | 0.1707% |
| 2036 | assetConsumption | 4.0015T | 4.0001T | 0.0364% |
| 2036 | transferConsumption | 11.5022T | 11.4862T | 0.1397% |
| 2036 | corporateProfits | 6.2008T | 6.1877T | 0.2113% |
| 2036 | traditionalCorporateProfits | 6.1302T | 6.1161T | 0.2296% |
| 2037 | totalEmployment | 168.1113M | 168.0617M | 0.0295% |
| 2037 | totalUnemployment | 11.7990M | 11.8486M | 0.4204% |
| 2037 | aggregateWageIncome | 31.3125T | 31.2121T | 0.3206% |
| 2037 | aggregateAssetIncome | 12.2768T | 12.2561T | 0.1688% |
| 2037 | aggregateTransferIncome | 13.6979T | 13.6620T | 0.2622% |
| 2037 | totalIncome | 57.2872T | 57.1302T | 0.2741% |
| 2037 | investment | 10.6114T | 10.5760T | 0.3331% |
| 2037 | governmentSpending | 7.4600T | 7.4293T | 0.4106% |
| 2037 | consumerWelfareIndex | 87.4036K | 82.6728K | 5.4126% |
| 2037 | newJobEmployment | 929.0745K | 921.9805K | 0.7636% |
| 2037 | wageConsumption | 24.7121T | 24.6286T | 0.3381% |
| 2037 | assetConsumption | 4.2969T | 4.2896T | 0.1688% |
| 2037 | transferConsumption | 12.3281T | 12.2958T | 0.2622% |
| 2038 | totalEmployment | 165.8505M | 165.7254M | 0.0754% |
| 2038 | totalUnemployment | 14.7795M | 14.9045M | 0.8460% |
| 2038 | aggregateTransferIncome | 14.6209T | 14.5864T | 0.2357% |
| 2038 | consumerWelfareIndex | 82.1528K | 77.0094K | 6.2607% |
| 2038 | transferConsumption | 13.1588T | 13.1278T | 0.2357% |
| 2039 | totalEmployment | 160.3669M | 160.2613M | 0.0658% |
| 2039 | totalUnemployment | 20.9856M | 21.0911M | 0.5030% |
| 2039 | aggregateTransferIncome | 14.7670T | 14.7322T | 0.2359% |
| 2039 | consumerWelfareIndex | 69.9837K | 62.5880K | 10.5678% |
| 2039 | aiAdditionalOutput | 2.1476T | 2.1556T | 0.3750% |
| 2039 | aiInvestmentBoost | 644.2747B | 646.6910B | 0.3750% |
| 2039 | aiNetExportBoost | 214.7582B | 215.5637B | 0.3750% |
| 2039 | aiConsumerGoodsPotential | 1.2885T | 1.2934T | 0.3750% |
| 2039 | aiGoodsAbsorbed | 1.2885T | 1.2934T | 0.3750% |
| 2039 | transferConsumption | 13.2903T | 13.2589T | 0.2359% |
| 2039 | aiCorporateProfits | 536.8956B | 538.9091B | 0.3750% |
| 2039 | aiGDPContribution | 2.1476T | 2.1556T | 0.3750% |
| 2040 | totalEmployment | 150.3780M | 150.1383M | 0.1594% |
| 2040 | totalUnemployment | 31.6999M | 31.9395M | 0.7560% |
| 2040 | aggregateTransferIncome | 14.9998T | 14.9675T | 0.2151% |
| 2040 | consumerWelfareIndex | 56.2994K | 48.9950K | 12.9742% |
| 2040 | aiAdditionalOutput | 3.9666T | 3.9942T | 0.6951% |
| 2040 | aiInvestmentBoost | 1.1900T | 1.1982T | 0.6951% |
| 2040 | aiNetExportBoost | 396.6581B | 399.4152B | 0.6951% |
| 2040 | aiConsumerGoodsPotential | 2.3799T | 2.3965T | 0.6951% |
| 2040 | aiGoodsAbsorbed | 2.3799T | 2.3965T | 0.6951% |
| 2040 | transferConsumption | 13.4998T | 13.4708T | 0.2151% |
| 2040 | aiCorporateProfits | 991.6454B | 998.5380B | 0.6951% |
| 2040 | aiGDPContribution | 3.9666T | 3.9942T | 0.6951% |
| 2041 | totalEmployment | 132.6898M | 132.2635M | 0.3212% |
| 2041 | totalUnemployment | 50.1164M | 50.5427M | 0.8505% |
| 2041 | aggregateTransferIncome | 15.3805T | 15.3519T | 0.1865% |
| 2041 | consumerWelfareIndex | 45.6825K | 39.3615K | 13.8367% |
| 2041 | aiAdditionalOutput | 7.1616T | 7.2204T | 0.8221% |
| 2041 | aiInvestmentBoost | 2.1485T | 2.1661T | 0.8221% |
| 2041 | aiNetExportBoost | 716.1556B | 722.0432B | 0.8221% |
| 2041 | aiConsumerGoodsPotential | 4.2969T | 4.3323T | 0.8221% |
| 2041 | transferConsumption | 13.8425T | 13.8167T | 0.1865% |
| 2041 | aiCorporateProfits | 1.6397T | 1.6344T | 0.3209% |
| 2041 | aiGDPContribution | 6.5588T | 6.5378T | 0.3209% |
| 2042 | totalEmployment | 118.7334M | 118.3749M | 0.3019% |
| 2042 | totalUnemployment | 64.8040M | 65.1625M | 0.5532% |
| 2042 | aggregateTransferIncome | 15.6898T | 15.6598T | 0.1911% |
| 2042 | totalIncome | 31.7511T | 31.4517T | 0.9429% |
| 2042 | gdpNominal | 30.4888T | 30.3224T | 0.5457% |
| 2042 | consumption | 15.2877T | 15.1723T | 0.7551% |
| 2042 | investment | 8.3883T | 8.3700T | 0.2184% |
| 2042 | governmentSpending | 6.6838T | 6.6359T | 0.7170% |
| 2042 | consumerWelfareIndex | 41.3830K | 34.7933K | 15.9236% |
| 2042 | aiGoodsAbsorbed | 4.0850T | 4.0542T | 0.7551% |
| 2042 | potentialGDP | 35.6722T | 35.9635T | 0.8166% |
| 2042 | transferConsumption | 14.1208T | 14.0939T | 0.1911% |
| 2042 | corporateProfits | 4.4522T | 4.4295T | 0.5081% |
| 2042 | aiCorporateProfits | 1.9614T | 1.9537T | 0.3932% |
| 2042 | traditionalCorporateProfits | 2.4907T | 2.4758T | 0.5986% |
| 2042 | aiGDPContribution | 7.8457T | 7.8149T | 0.3932% |
| 2043 | totalEmployment | 99.8124M | 99.4676M | 0.3455% |
| 2043 | totalUnemployment | 84.4592M | 84.8040M | 0.4082% |
| 2043 | aggregateAssetIncome | 9.1839T | 9.2555T | 0.7800% |
| 2043 | aggregateTransferIncome | 16.0946T | 16.0643T | 0.1879% |
| 2043 | totalIncome | 29.3272T | 29.3181T | 0.0310% |
| 2043 | gdpNominal | 29.3806T | 29.4159T | 0.1203% |
| 2043 | consumption | 13.5109T | 13.5237T | 0.0946% |
| 2043 | investment | 8.8941T | 8.9447T | 0.5689% |
| 2043 | governmentSpending | 6.5860T | 6.5539T | 0.4871% |
| 2043 | consumerWelfareIndex | 39.9743K | 32.5960K | 18.4576% |
| 2043 | unrealizedAIOutput | 2.4439T | 2.4397T | 0.1682% |
| 2043 | aiGoodsAbsorbed | 4.3444T | 4.3485T | 0.0946% |
| 2043 | assetConsumption | 3.2144T | 3.2394T | 0.7800% |
| 2043 | transferConsumption | 14.4851T | 14.4579T | 0.1879% |
| 2043 | corporateProfits | 4.4736T | 4.4781T | 0.0998% |
| 2043 | aiCorporateProfits | 2.2175T | 2.2185T | 0.0463% |
| 2043 | traditionalCorporateProfits | 2.2562T | 2.2596T | 0.1523% |
| 2043 | aiGDPContribution | 8.8699T | 8.8740T | 0.0463% |
| 2044 | totalEmployment | 88.9215M | 88.9417M | 0.0227% |
| 2044 | totalUnemployment | 96.0871M | 96.0669M | 0.0210% |
| 2044 | aggregateWageIncome | 3.0543T | 3.0599T | 0.1834% |
| 2044 | aggregateTransferIncome | 16.3453T | 16.3081T | 0.2279% |
| 2044 | totalIncome | 29.0156T | 29.0858T | 0.2419% |
| 2044 | gdpNominal | 29.4194T | 29.4304T | 0.0374% |
| 2044 | consumption | 12.8799T | 12.8702T | 0.0753% |
| 2044 | investment | 9.4358T | 9.4827T | 0.4968% |
| 2044 | governmentSpending | 6.5480T | 6.5229T | 0.3844% |
| 2044 | consumerWelfareIndex | 42.3932K | 33.1698K | 21.7569% |
| 2044 | aiAdditionalOutput | 12.7038T | 12.7025T | 0.0105% |
| 2044 | aiInvestmentBoost | 3.8112T | 3.8108T | 0.0105% |
| 2044 | aiNetExportBoost | 1.2704T | 1.2703T | 0.0105% |
| 2044 | aiConsumerGoodsPotential | 7.6223T | 7.6215T | 0.0105% |
| 2044 | unrealizedAIOutput | 2.9719T | 2.9751T | 0.1073% |
| 2044 | aiGoodsAbsorbed | 4.6504T | 4.6464T | 0.0858% |
| 2044 | wageConsumption | 1.7175T | 1.7208T | 0.1931% |
| 2044 | transferConsumption | 14.7108T | 14.6773T | 0.2279% |
| 2044 | corporateProfits | 4.5986T | 4.5992T | 0.0126% |
| 2044 | aiCorporateProfits | 2.4330T | 2.4318T | 0.0465% |
| 2044 | traditionalCorporateProfits | 2.1656T | 2.1673T | 0.0789% |
| 2044 | aiGDPContribution | 9.7319T | 9.7274T | 0.0465% |
| 2044 | totalDemandSpilloverLoss | 6.8025M | 6.7387M | 0.9384% |
| 2045 | aggregateWageIncome | 2.6482T | 2.6494T | 0.0461% |
| 2045 | aggregateAssetIncome | 10.5814T | 10.5210T | 0.5712% |
| 2045 | aggregateTransferIncome | 16.5008T | 16.4640T | 0.2229% |
| 2045 | totalIncome | 29.7304T | 29.6344T | 0.3229% |
| 2045 | gdpNominal | 30.0876T | 30.0028T | 0.2818% |
| 2045 | consumption | 12.8574T | 12.8057T | 0.4019% |
| 2045 | investment | 10.0149T | 10.0090T | 0.0588% |
| 2045 | governmentSpending | 6.5494T | 6.5234T | 0.3971% |
| 2045 | aiAdditionalOutput | 13.8173T | 13.8077T | 0.0698% |
| 2045 | aiInvestmentBoost | 4.1452T | 4.1423T | 0.0698% |
| 2045 | aiNetExportBoost | 1.3817T | 1.3808T | 0.0698% |
| 2045 | aiConsumerGoodsPotential | 8.2904T | 8.2846T | 0.0698% |
| 2045 | unrealizedAIOutput | 3.2413T | 3.2593T | 0.5557% |
| 2045 | aiGoodsAbsorbed | 5.0491T | 5.0253T | 0.4714% |
| 2045 | wageConsumption | 1.4444T | 1.4450T | 0.0440% |
| 2045 | assetConsumption | 3.7035T | 3.6823T | 0.5712% |
| 2045 | transferConsumption | 14.8507T | 14.8176T | 0.2229% |
| 2045 | corporateProfits | 4.7903T | 4.7771T | 0.2756% |
| 2045 | aiCorporateProfits | 2.6440T | 2.6371T | 0.2615% |
| 2045 | traditionalCorporateProfits | 2.1463T | 2.1400T | 0.2928% |
| 2045 | aiGDPContribution | 10.5761T | 10.5484T | 0.2615% |
| 2045 | totalDemandSpilloverLoss | 6.4983M | 6.4738M | 0.3773% |
| 2046 | totalEmployment | 80.3032M | 80.1304M | 0.2151% |
| 2046 | totalUnemployment | 106.1885M | 106.3612M | 0.1626% |
| 2046 | aggregateWageIncome | 2.5439T | 2.5272T | 0.6555% |
| 2046 | aggregateTransferIncome | 16.5946T | 16.5611T | 0.2022% |
| 2046 | gdpNominal | 30.8053T | 30.6507T | 0.5019% |
| 2046 | consumption | 13.0349T | 12.9457T | 0.6841% |
| 2046 | investment | 10.4817T | 10.4435T | 0.3645% |
| 2046 | governmentSpending | 6.5723T | 6.5430T | 0.4456% |
| 2046 | aiGoodsAbsorbed | 5.3661T | 5.3293T | 0.6846% |
| 2046 | wageConsumption | 1.3668T | 1.3567T | 0.7412% |
| 2046 | transferConsumption | 14.9351T | 14.9050T | 0.2022% |
| 2046 | corporateProfits | 4.9510T | 4.9288T | 0.4475% |
| 2046 | aiCorporateProfits | 2.7900T | 2.7808T | 0.3294% |
| 2046 | traditionalCorporateProfits | 2.1610T | 2.1480T | 0.5999% |
| 2046 | aiGDPContribution | 11.1600T | 11.1232T | 0.3294% |
| 2047 | totalEmployment | 78.6048M | 78.3287M | 0.3512% |
| 2047 | totalUnemployment | 108.6328M | 108.9089M | 0.2542% |
| 2047 | aggregateTransferIncome | 16.6694T | 16.6378T | 0.1894% |
| 2047 | gdpNominal | 31.2757T | 31.1007T | 0.5595% |
| 2047 | consumption | 13.1597T | 13.0589T | 0.7659% |
| 2047 | investment | 10.7725T | 10.7262T | 0.4295% |
| 2047 | governmentSpending | 6.5968T | 6.5651T | 0.4802% |
| 2047 | aiGoodsAbsorbed | 5.5954T | 5.5526T | 0.7651% |
| 2047 | transferConsumption | 15.0024T | 14.9740T | 0.1894% |
| 2047 | corporateProfits | 5.0615T | 5.0362T | 0.4985% |
| 2047 | aiCorporateProfits | 2.8949T | 2.8842T | 0.3693% |
| 2047 | traditionalCorporateProfits | 2.1666T | 2.1520T | 0.6712% |
| 2047 | aiGDPContribution | 11.5797T | 11.5369T | 0.3693% |
| 2048 | totalEmployment | 77.2387M | 76.9212M | 0.4110% |
| 2048 | totalUnemployment | 110.7479M | 111.0654M | 0.2867% |
| 2048 | aggregateTransferIncome | 16.7379T | 16.7071T | 0.1838% |
| 2048 | gdpNominal | 31.5378T | 31.3732T | 0.5220% |
| 2048 | consumption | 13.2423T | 13.1449T | 0.7359% |
| 2048 | investment | 10.9118T | 10.8727T | 0.3584% |
| 2048 | governmentSpending | 6.6129T | 6.5806T | 0.4896% |
| 2048 | aiGoodsAbsorbed | 5.7643T | 5.7221T | 0.7325% |
| 2048 | transferConsumption | 15.0641T | 15.0364T | 0.1838% |
| 2048 | corporateProfits | 5.1339T | 5.1099T | 0.4673% |
| 2048 | aiCorporateProfits | 2.9727T | 2.9622T | 0.3533% |
| 2048 | traditionalCorporateProfits | 2.1612T | 2.1477T | 0.6241% |
| 2048 | aiGDPContribution | 11.8907T | 11.8487T | 0.3533% |
| 2049 | totalEmployment | 76.4454M | 76.1307M | 0.4117% |
| 2049 | totalUnemployment | 112.2932M | 112.6079M | 0.2803% |
| 2049 | aggregateTransferIncome | 16.7956T | 16.7648T | 0.1835% |
| 2049 | gdpNominal | 31.7137T | 31.5678T | 0.4601% |
| 2049 | consumption | 13.3121T | 13.2246T | 0.6569% |
| 2049 | investment | 10.9901T | 10.9596T | 0.2771% |
| 2049 | governmentSpending | 6.6219T | 6.5899T | 0.4836% |
| 2049 | aiGoodsAbsorbed | 5.8906T | 5.8519T | 0.6569% |
| 2049 | transferConsumption | 15.1161T | 15.0883T | 0.1835% |
| 2049 | corporateProfits | 5.1851T | 5.1636T | 0.4140% |
| 2049 | aiCorporateProfits | 3.0296T | 3.0199T | 0.3193% |
| 2049 | traditionalCorporateProfits | 2.1555T | 2.1437T | 0.5472% |
| 2049 | aiGDPContribution | 12.1183T | 12.0796T | 0.3193% |
| 2050 | totalEmployment | 76.1715M | 75.8509M | 0.4208% |
| 2050 | totalUnemployment | 113.3220M | 113.6426M | 0.2829% |
| 2050 | aggregateTransferIncome | 16.8436T | 16.8128T | 0.1823% |
| 2050 | gdpNominal | 31.8658T | 31.7385T | 0.3995% |
| 2050 | consumption | 13.3772T | 13.3027T | 0.5571% |
| 2050 | investment | 11.0574T | 11.0324T | 0.2255% |
| 2050 | governmentSpending | 6.6279T | 6.5966T | 0.4735% |
| 2050 | unrealizedAIOutput | 3.4616T | 3.4949T | 0.9636% |
| 2050 | aiGoodsAbsorbed | 5.9874T | 5.9541T | 0.5571% |
| 2050 | transferConsumption | 15.1592T | 15.1316T | 0.1823% |
| 2050 | corporateProfits | 5.2254T | 5.2067T | 0.3573% |
| 2050 | aiCorporateProfits | 3.0717T | 3.0634T | 0.2715% |
| 2050 | traditionalCorporateProfits | 2.1537T | 2.1434T | 0.4798% |
| 2050 | aiGDPContribution | 12.2868T | 12.2534T | 0.2715% |

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
| potentialGDP | 34.6034T | 39.4019T | 13.8672% | **FAIL** |

### Year 2031

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| potentialGDP | 34.7788T | 40.6437T | 16.8633% | **FAIL** |

### Year 2032

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

### Year 2033

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

### Year 2034

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

### Year 2035

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

### Year 2036

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

### Year 2037

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

### Year 2038

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

### Year 2039

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

### Year 2040

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

### Year 2041

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

### Year 2042

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

### Year 2043

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

### Year 2044

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

### Year 2045

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

### Year 2046

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

### Year 2047

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

### Year 2048

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

### Year 2049

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

### Year 2050

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

## Invariant Checks

902 passed, 0 failed out of 902 checks.

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
| policy_isolation_consumerWelfareIndex | 7 |
| policy_isolation_consumption | 7 |
| policy_isolation_gdpNominal | 7 |
| policy_isolation_priceLevel | 7 |
| policy_isolation_totalEmployment | 7 |
| policy_isolation_totalIncome | 7 |
| price_level_positive | 26 |
| unemployment_rate_bounds | 26 |

---
*Scenario "ubi_phased" — ATLAS Verification Audit v1.0*
