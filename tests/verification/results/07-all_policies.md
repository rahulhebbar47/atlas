# Scenario: All Policies

> UBI $1500@2032 + AI Fund 25%@2030 + Min Wage $18@2028.

Generated: 2026-02-23T20:50:03.899Z

## Summary

| Metric | Value |
|--------|------:|
| Total field comparisons | 1846 |
| PASS (<0.01% error) | 1287 |
| WARN (0.01-1% error) | 315 |
| FAIL (>1% error) | 244 |
| Invariant checks | 860 (860 pass, 0 fail) |
| Worst field | cwiAcceleration (825.6014%) |

## Field Comparison Failures

244 fields exceed 1% relative error.

| Year | Field | Expected | Actual | Error |
|-----:|-------|----------|--------|------:|
| 2026 | potentialGDP | 32.1442T | 32.9900T | 2.6313% |
| 2027 | potentialGDP | 33.1365T | 34.9033T | 5.3318% |
| 2028 | gdpReal | 33.5300T | 33.9802T | 1.3428% |
| 2028 | potentialGDP | 33.5300T | 36.7338T | 9.5550% |
| 2029 | gdpReal | 33.7802T | 34.6942T | 2.7058% |
| 2029 | newJobEmployment | 754.4246K | 764.5552K | 1.3428% |
| 2029 | newJobWageIncome | 72.4383B | 73.4110B | 1.3428% |
| 2029 | potentialGDP | 33.7802T | 38.4925T | 13.9498% |
| 2030 | gdpReal | 34.1233T | 35.5186T | 4.0890% |
| 2030 | newJobEmployment | 760.0550K | 780.6205K | 2.7058% |
| 2030 | newJobWageIncome | 76.1668B | 78.2293B | 2.7079% |
| 2030 | potentialGDP | 34.1233T | 40.4440T | 18.5232% |
| 2031 | gdpReal | 34.4073T | 36.2970T | 5.4923% |
| 2031 | newJobEmployment | 767.7737K | 799.1678K | 4.0890% |
| 2031 | newJobWageIncome | 80.5158B | 83.8130B | 4.0951% |
| 2031 | potentialGDP | 34.4073T | 42.4179T | 23.2817% |
| 2032 | gdpReal | 38.0770T | 40.7262T | 6.9575% |
| 2032 | aiAdditionalOutput | 320.5461M | 332.7061M | 3.7935% |
| 2032 | aiInvestmentBoost | 96.1638M | 99.8118M | 3.7935% |
| 2032 | aiNetExportBoost | 32.0546M | 33.2706M | 3.7935% |
| 2032 | aiConsumerGoodsPotential | 192.3277M | 199.6237M | 3.7935% |
| 2032 | aiGoodsAbsorbed | 192.3277M | 199.6237M | 3.7935% |
| 2032 | newJobEmployment | 774.1431K | 816.6603K | 5.4922% |
| 2032 | newJobWageIncome | 84.8031B | 89.4706B | 5.5039% |
| 2032 | potentialGDP | 38.0772T | 48.8411T | 28.2686% |
| 2032 | aiCorporateProfits | 80.1365M | 83.1765M | 3.7935% |
| 2032 | aiGDPContribution | 320.5461M | 332.7061M | 3.7935% |
| 2032 | moneySupply | 23.4670T | 25.9340T | 10.5127% |
| 2032 | maxNeutralTransfers | 2.9693B | 2.1197B | 28.6129% |
| 2033 | gdpReal | 40.7307T | 44.1720T | 8.4490% |
| 2033 | aiAdditionalOutput | 5.5793B | 5.7820B | 3.6319% |
| 2033 | aiInvestmentBoost | 1.6738B | 1.7346B | 3.6319% |
| 2033 | aiNetExportBoost | 557.9322M | 578.1955M | 3.6319% |
| 2033 | aiConsumerGoodsPotential | 3.3476B | 3.4692B | 3.6319% |
| 2033 | aiGoodsAbsorbed | 3.3476B | 3.4692B | 3.6319% |
| 2033 | newJobEmployment | 856.1922K | 915.7408K | 6.9550% |
| 2033 | newJobWageIncome | 107.5797B | 115.0808B | 6.9726% |
| 2033 | potentialGDP | 40.7340T | 54.3132T | 33.3362% |
| 2033 | aiCorporateProfits | 1.3948B | 1.4455B | 3.6319% |
| 2033 | aiGDPContribution | 5.5793B | 5.7820B | 3.6319% |
| 2033 | moneySupply | 25.9439T | 30.8878T | 19.0562% |
| 2033 | maxNeutralTransfers | 30.2198B | 19.6611B | 34.9396% |
| 2034 | gdpReal | 42.6295T | 46.8789T | 9.9682% |
| 2034 | aiAdditionalOutput | 34.7927B | 36.0094B | 3.4968% |
| 2034 | aiInvestmentBoost | 10.4378B | 10.8028B | 3.4968% |
| 2034 | aiNetExportBoost | 3.4793B | 3.6009B | 3.4968% |
| 2034 | aiConsumerGoodsPotential | 20.8756B | 21.6056B | 3.4968% |
| 2034 | aiGoodsAbsorbed | 20.8756B | 21.6056B | 3.4968% |
| 2034 | newJobEmployment | 912.8383K | 989.8053K | 8.4316% |
| 2034 | newJobWageIncome | 127.1653B | 137.9228B | 8.4595% |
| 2034 | potentialGDP | 42.6504T | 58.9957T | 38.3240% |
| 2034 | aiCorporateProfits | 8.6982B | 9.0023B | 3.4968% |
| 2034 | aiGDPContribution | 34.7927B | 36.0094B | 3.4968% |
| 2034 | moneySupply | 28.4307T | 35.8614T | 26.1362% |
| 2034 | maxNeutralTransfers | 92.6998B | 55.4892B | 40.1410% |
| 2035 | gdpReal | 43.8497T | 48.8707T | 11.4503% |
| 2035 | consumerWelfareIndex | 88.9207K | 99.1241K | 11.4746% |
| 2035 | aiAdditionalOutput | 120.9599B | 123.8224B | 2.3664% |
| 2035 | aiInvestmentBoost | 36.2880B | 37.1467B | 2.3664% |
| 2035 | aiNetExportBoost | 12.0960B | 12.3822B | 2.3664% |
| 2035 | aiConsumerGoodsPotential | 72.5760B | 74.2934B | 2.3664% |
| 2035 | aiGoodsAbsorbed | 72.5760B | 74.2934B | 2.3664% |
| 2035 | newJobEmployment | 947.2424K | 1.0413M | 9.9304% |
| 2035 | newJobWageIncome | 142.2737B | 156.5820B | 10.0569% |
| 2035 | potentialGDP | 43.9223T | 62.8228T | 43.0317% |
| 2035 | aiCorporateProfits | 30.2400B | 30.9556B | 2.3664% |
| 2035 | aiGDPContribution | 120.9599B | 123.8224B | 2.3664% |
| 2035 | moneySupply | 30.9275T | 40.8549T | 32.0992% |
| 2035 | maxNeutralTransfers | 175.1984B | 99.4839B | 43.2164% |
| 2036 | gdpReal | 44.2847T | 49.8351T | 12.5335% |
| 2036 | consumerWelfareIndex | 88.7366K | 99.8789K | 12.5565% |
| 2036 | aiAdditionalOutput | 282.7173B | 286.6188B | 1.3800% |
| 2036 | aiInvestmentBoost | 84.8152B | 85.9856B | 1.3800% |
| 2036 | aiNetExportBoost | 28.2717B | 28.6619B | 1.3800% |
| 2036 | aiConsumerGoodsPotential | 169.6304B | 171.9713B | 1.3800% |
| 2036 | aiGoodsAbsorbed | 169.6304B | 171.9713B | 1.3800% |
| 2036 | newJobEmployment | 962.3540K | 1.0722M | 11.4117% |
| 2036 | newJobWageIncome | 150.8890B | 168.4231B | 11.6205% |
| 2036 | potentialGDP | 44.4543T | 65.1847T | 46.6331% |
| 2036 | aiCorporateProfits | 70.6793B | 71.6547B | 1.3800% |
| 2036 | aiGDPContribution | 282.7173B | 286.6188B | 1.3800% |
| 2036 | moneySupply | 33.4342T | 45.8684T | 37.1901% |
| 2036 | maxNeutralTransfers | 317.8586B | 182.8373B | 42.4784% |
| 2037 | gdpReal | 43.7518T | 49.4127T | 12.9389% |
| 2037 | consumerWelfareIndex | 86.5699K | 97.7855K | 12.9556% |
| 2037 | aiAdditionalOutput | 590.3083B | 596.7220B | 1.0865% |
| 2037 | aiInvestmentBoost | 177.0925B | 179.0166B | 1.0865% |
| 2037 | aiNetExportBoost | 59.0308B | 59.6722B | 1.0865% |
| 2037 | aiConsumerGoodsPotential | 354.1850B | 358.0332B | 1.0865% |
| 2037 | aiGoodsAbsorbed | 354.1850B | 358.0332B | 1.0865% |
| 2037 | newJobEmployment | 953.4296K | 1.0725M | 12.4891% |
| 2037 | newJobWageIncome | 150.8405B | 169.9851B | 12.6919% |
| 2037 | potentialGDP | 44.1059T | 65.4961T | 48.4972% |
| 2037 | aiCorporateProfits | 147.5771B | 149.1805B | 1.0865% |
| 2037 | aiGDPContribution | 590.3083B | 596.7220B | 1.0865% |
| 2037 | moneySupply | 35.9510T | 50.9019T | 41.5871% |
| 2037 | maxNeutralTransfers | 488.0293B | 291.3623B | 40.2982% |
| 2038 | gdpReal | 41.2589T | 46.1849T | 11.9391% |
| 2038 | newJobEmployment | 916.4896K | 1.0344M | 12.8701% |
| 2038 | newJobWageIncome | 140.3250B | 158.4493B | 12.9160% |
| 2038 | potentialGDP | 41.9178T | 61.6362T | 47.0407% |
| 2038 | moneySupply | 38.4778T | 55.9556T | 45.4231% |
| 2038 | maxNeutralTransfers | 722.2435B | 495.9639B | 31.3301% |
| 2039 | gdpNominal | 53.4289T | 52.3869T | 1.9503% |
| 2039 | gdpReal | 36.7485T | 40.0204T | 8.9033% |
| 2039 | consumption | 35.1389T | 34.2754T | 2.4573% |
| 2039 | investment | 11.1216T | 10.9740T | 1.3270% |
| 2039 | newJobEmployment | 815.1299K | 912.3682K | 11.9292% |
| 2039 | newJobWageIncome | 109.7287B | 122.0917B | 11.2668% |
| 2039 | potentialGDP | 38.0374T | 53.6767T | 41.1153% |
| 2039 | corporateProfits | 6.1779T | 6.0635T | 1.8522% |
| 2039 | traditionalCorporateProfits | 5.6409T | 5.5261T | 2.0347% |
| 2039 | moneySupply | 41.0147T | 61.0295T | 48.7989% |
| 2039 | maxNeutralTransfers | 906.4343B | 830.3244B | 8.3966% |
| 2040 | aggregateWageIncome | 20.2640T | 19.8463T | 2.0613% |
| 2040 | aggregateAssetIncome | 14.6268T | 14.3415T | 1.9509% |
| 2040 | totalIncome | 49.3206T | 48.5811T | 1.4994% |
| 2040 | gdpNominal | 44.4031T | 43.3731T | 2.3197% |
| 2040 | gdpReal | 31.6983T | 33.7794T | 6.5653% |
| 2040 | consumption | 27.3357T | 26.6070T | 2.6660% |
| 2040 | investment | 9.7921T | 9.5262T | 2.7152% |
| 2040 | newJobEmployment | 651.8709K | 709.1018K | 8.7795% |
| 2040 | newJobWageIncome | 68.1039B | 72.6121B | 6.6196% |
| 2040 | potentialGDP | 34.1032T | 45.7885T | 34.2645% |
| 2040 | wageConsumption | 14.8748T | 14.5654T | 2.0802% |
| 2040 | assetConsumption | 4.7634T | 4.6635T | 2.0967% |
| 2040 | corporateProfits | 5.4455T | 5.3346T | 2.0358% |
| 2040 | traditionalCorporateProfits | 4.4434T | 4.3282T | 2.5931% |
| 2040 | moneySupply | 43.5618T | 66.1236T | 51.7926% |
| 2040 | maxNeutralTransfers | 1.0206T | 1.5336T | 50.2689% |
| 2041 | aggregateWageIncome | 11.8949T | 11.5292T | 3.0744% |
| 2041 | aggregateAssetIncome | 13.2808T | 13.0186T | 1.9745% |
| 2041 | totalIncome | 39.9774T | 39.3196T | 1.6454% |
| 2041 | gdpNominal | 38.2408T | 37.7958T | 1.1637% |
| 2041 | gdpReal | 28.4861T | 30.3239T | 6.4518% |
| 2041 | consumption | 21.2908T | 21.0194T | 1.2746% |
| 2041 | investment | 9.4463T | 9.3027T | 1.5203% |
| 2041 | unrealizedAIOutput | 0.000000 | 18.9286B | 100.0000% |
| 2041 | newJobEmployment | 460.4001K | 488.1677K | 6.0312% |
| 2041 | newJobWageIncome | 33.3783B | 34.4437B | 3.1919% |
| 2041 | potentialGDP | 32.7981T | 42.1497T | 28.5129% |
| 2041 | wageConsumption | 8.1398T | 7.8771T | 3.2271% |
| 2041 | assetConsumption | 4.2389T | 4.1471T | 2.1652% |
| 2041 | traditionalCorporateProfits | 3.4160T | 3.3614T | 1.5973% |
| 2041 | moneySupply | 46.1191T | 71.2382T | 54.4657% |
| 2041 | maxNeutralTransfers | 1.1231T | 2.3934T | 113.1101% |
| 2042 | aggregateWageIncome | 7.8042T | 7.7165T | 1.1235% |
| 2042 | gdpReal | 27.5625T | 29.4419T | 6.8185% |
| 2042 | newJobEmployment | 349.8573K | 372.4294K | 6.4518% |
| 2042 | newJobWageIncome | 19.1704B | 20.1748B | 5.2392% |
| 2042 | potentialGDP | 33.2039T | 40.9147T | 23.2227% |
| 2042 | wageConsumption | 5.0532T | 4.9969T | 1.1141% |
| 2042 | moneySupply | 48.6866T | 76.3732T | 56.8670% |
| 2042 | maxNeutralTransfers | 1.2733T | 2.7202T | 113.6371% |
| 2043 | aggregateAssetIncome | 12.2365T | 12.4243T | 1.5350% |
| 2043 | gdpReal | 28.6477T | 30.7486T | 7.3334% |
| 2043 | unrealizedAIOutput | 1.3071T | 1.2540T | 4.0601% |
| 2043 | newJobEmployment | 273.2419K | 291.8729K | 6.8185% |
| 2043 | newJobWageIncome | 13.5571B | 14.4720B | 6.7485% |
| 2043 | potentialGDP | 35.4359T | 41.6980T | 17.6715% |
| 2043 | assetConsumption | 3.7414T | 3.8071T | 1.7572% |
| 2043 | moneySupply | 51.2644T | 81.5287T | 59.0359% |
| 2043 | maxNeutralTransfers | 1.5997T | 3.4340T | 114.6669% |
| 2044 | aggregateAssetIncome | 13.2464T | 13.5868T | 2.5703% |
| 2044 | gdpReal | 30.9400T | 33.4385T | 8.0753% |
| 2044 | consumption | 16.5368T | 16.7411T | 1.2350% |
| 2044 | unrealizedAIOutput | 1.6515T | 1.5776T | 4.4731% |
| 2044 | aiGoodsAbsorbed | 5.9703T | 6.0435T | 1.2263% |
| 2044 | newJobEmployment | 244.4088K | 262.3548K | 7.3426% |
| 2044 | newJobWageIncome | 11.8737B | 12.8230B | 7.9947% |
| 2044 | potentialGDP | 38.5618T | 42.9842T | 11.4684% |
| 2044 | assetConsumption | 4.0136T | 4.1328T | 2.9690% |
| 2044 | totalDemandSpilloverLoss | 837.2421K | 737.4853K | 11.9149% |
| 2044 | moneySupply | 53.8524T | 86.7049T | 61.0045% |
| 2044 | maxNeutralTransfers | 2.0821T | 4.5003T | 116.1413% |
| 2045 | aggregateAssetIncome | 14.7420T | 15.0875T | 2.3437% |
| 2045 | gdpReal | 34.0231T | 37.1458T | 9.1781% |
| 2045 | consumption | 16.6905T | 16.9001T | 1.2559% |
| 2045 | unrealizedAIOutput | 1.7338T | 1.6505T | 4.8001% |
| 2045 | aiGoodsAbsorbed | 6.5459T | 6.6241T | 1.1937% |
| 2045 | newJobEmployment | 235.6460K | 254.8012K | 8.1288% |
| 2045 | newJobWageIncome | 11.5320B | 12.5653B | 8.9596% |
| 2045 | potentialGDP | 42.3028T | 44.5034T | 5.2021% |
| 2045 | wageConsumption | 2.6726T | 2.7004T | 1.0402% |
| 2045 | assetConsumption | 4.4437T | 4.5646T | 2.7213% |
| 2045 | totalDemandSpilloverLoss | 814.4133K | 703.5715K | 13.6100% |
| 2045 | moneySupply | 56.4509T | 91.9017T | 62.7995% |
| 2045 | maxNeutralTransfers | 2.5137T | 5.4877T | 118.3085% |
| 2046 | aggregateAssetIncome | 16.2782T | 16.4538T | 1.0786% |
| 2046 | gdpReal | 37.5496T | 41.6325T | 10.8734% |
| 2046 | consumption | 17.0692T | 17.2867T | 1.2740% |
| 2046 | unrealizedAIOutput | 1.6639T | 1.5744T | 5.3799% |
| 2046 | aiGoodsAbsorbed | 7.0268T | 7.1164T | 1.2740% |
| 2046 | newJobEmployment | 239.3256K | 261.2904K | 9.1778% |
| 2046 | newJobWageIncome | 11.9602B | 13.1481B | 9.9324% |
| 2046 | assetConsumption | 4.8739T | 4.9354T | 1.2608% |
| 2046 | totalDemandSpilloverLoss | 561.5487K | 485.2720K | 13.5833% |
| 2046 | moneySupply | 59.0597T | 97.1194T | 64.4428% |
| 2046 | maxNeutralTransfers | 2.9620T | 6.5683T | 121.7474% |
| 2047 | gdpReal | 41.2557T | 46.7271T | 13.2622% |
| 2047 | consumption | 17.4178T | 17.6653T | 1.4207% |
| 2047 | unrealizedAIOutput | 1.5704T | 1.4652T | 6.6992% |
| 2047 | aiGoodsAbsorbed | 7.4059T | 7.5112T | 1.4219% |
| 2047 | newJobEmployment | 248.1677K | 275.1184K | 10.8599% |
| 2047 | newJobWageIncome | 12.6761B | 14.1432B | 11.5742% |
| 2047 | potentialGDP | 50.2320T | 46.9077T | 6.6178% |
| 2047 | totalDemandSpilloverLoss | 323.3124K | 256.3059K | 20.7250% |
| 2047 | moneySupply | 61.6790T | 102.3579T | 65.9527% |
| 2047 | maxNeutralTransfers | 3.4210T | 7.7502T | 126.5513% |
| 2048 | gdpReal | 45.2167T | 52.5255T | 16.1640% |
| 2048 | consumption | 17.7899T | 18.0562T | 1.4971% |
| 2048 | unrealizedAIOutput | 1.4457T | 1.3299T | 8.0151% |
| 2048 | aiGoodsAbsorbed | 7.7438T | 7.8600T | 1.5015% |
| 2048 | newJobEmployment | 259.3191K | 293.6237K | 13.2287% |
| 2048 | newJobWageIncome | 13.4578B | 15.3465B | 14.0343% |
| 2048 | potentialGDP | 54.4062T | 47.7723T | 12.1932% |
| 2048 | totalDemandSpilloverLoss | 160.2270K | 118.7661K | 25.8763% |
| 2048 | moneySupply | 64.3087T | 107.6174T | 67.3450% |
| 2048 | maxNeutralTransfers | 3.8960T | 9.0538T | 132.3858% |
| 2049 | gdpReal | 49.5728T | 59.1804T | 19.3807% |
| 2049 | consumption | 18.1946T | 18.4810T | 1.5738% |
| 2049 | consumerWelfareIndex | 61.9940K | 74.5408K | 20.2387% |
| 2049 | unrealizedAIOutput | 1.2906T | 1.1639T | 9.8180% |
| 2049 | aiGoodsAbsorbed | 8.0511T | 8.1778T | 1.5738% |
| 2049 | newJobEmployment | 275.1709K | 319.6495K | 16.1640% |
| 2049 | newJobWageIncome | 14.4564B | 16.9258B | 17.0813% |
| 2049 | potentialGDP | 58.9144T | 48.5538T | 17.5859% |
| 2049 | totalDemandSpilloverLoss | 96.1326K | 76.3137K | 20.6162% |
| 2049 | moneySupply | 66.9490T | 112.8979T | 68.6328% |
| 2049 | maxNeutralTransfers | 4.3724T | 10.4397T | 138.7615% |
| 2050 | gdpReal | 54.4451T | 66.9283T | 22.9281% |
| 2050 | consumption | 18.6678T | 19.0052T | 1.8076% |
| 2050 | consumerWelfareIndex | 68.4119K | 84.7910K | 23.9418% |
| 2050 | unrealizedAIOutput | 1.0936T | 942.5767B | 13.8103% |
| 2050 | aiGoodsAbsorbed | 8.3554T | 8.5064T | 1.8076% |
| 2050 | newJobEmployment | 296.1893K | 353.5930K | 19.3807% |
| 2050 | newJobWageIncome | 15.7424B | 18.9529B | 20.3943% |
| 2050 | potentialGDP | 63.8941T | 49.3802T | 22.7156% |
| 2050 | assetConsumption | 5.6055T | 5.5401T | 1.1660% |
| 2050 | aiCorporateProfits | 3.6637T | 3.7014T | 1.0306% |
| 2050 | aiGDPContribution | 14.6547T | 14.8058T | 1.0306% |
| 2050 | totalDemandSpilloverLoss | 60.1057K | 40.0425K | 33.3798% |
| 2050 | moneySupply | 69.5998T | 118.1996T | 69.8275% |
| 2050 | maxNeutralTransfers | 4.8635T | 11.9573T | 145.8562% |

## Field Comparison Warnings

315 fields between 0.01-1% relative error.

| Year | Field | Expected | Actual | Error |
|-----:|-------|----------|--------|------:|
| 2028 | consumerWelfareIndex | 67.0102K | 67.9100K | 1.3428% |
| 2029 | totalUnemployment | 6.9130M | 6.9029M | 0.1465% |
| 2029 | consumerWelfareIndex | 67.3508K | 69.1738K | 2.7067% |
| 2030 | totalEmployment | 168.0144M | 168.0349M | 0.0122% |
| 2030 | totalUnemployment | 6.9381M | 6.9175M | 0.2964% |
| 2030 | aggregateWageIncome | 23.2241T | 23.2266T | 0.0109% |
| 2030 | consumerWelfareIndex | 68.0172K | 70.7995K | 4.0906% |
| 2030 | wageConsumption | 18.5793T | 18.5813T | 0.0109% |
| 2031 | totalEmployment | 168.6911M | 168.7225M | 0.0186% |
| 2031 | totalUnemployment | 6.9612M | 6.9298M | 0.4510% |
| 2031 | aggregateWageIncome | 24.4011T | 24.4058T | 0.0194% |
| 2031 | totalIncome | 40.4079T | 40.4131T | 0.0129% |
| 2031 | gdpNominal | 42.4132T | 42.4179T | 0.0111% |
| 2031 | consumption | 29.3319T | 29.3358T | 0.0135% |
| 2031 | investment | 7.4297T | 7.4304T | 0.0100% |
| 2031 | consumerWelfareIndex | 68.3295K | 72.0840K | 5.4947% |
| 2031 | wageConsumption | 19.5208T | 19.5246T | 0.0194% |
| 2031 | corporateProfits | 4.6654T | 4.6660T | 0.0111% |
| 2031 | traditionalCorporateProfits | 4.6654T | 4.6660T | 0.0111% |
| 2032 | totalEmployment | 169.3663M | 169.4087M | 0.0250% |
| 2032 | totalUnemployment | 6.9885M | 6.9461M | 0.6068% |
| 2032 | aggregateWageIncome | 25.5904T | 25.5979T | 0.0293% |
| 2032 | aggregateAssetIncome | 9.1224T | 9.1233T | 0.0109% |
| 2032 | totalIncome | 47.2800T | 47.2884T | 0.0179% |
| 2032 | gdpNominal | 48.8332T | 48.8409T | 0.0156% |
| 2032 | consumption | 35.1730T | 35.1793T | 0.0179% |
| 2032 | investment | 7.7770T | 7.7783T | 0.0168% |
| 2032 | consumerWelfareIndex | 78.4406K | 83.9000K | 6.9599% |
| 2032 | wageConsumption | 20.4723T | 20.4783T | 0.0293% |
| 2032 | assetConsumption | 3.0764T | 3.0768T | 0.0113% |
| 2032 | corporateProfits | 5.3717T | 5.3725T | 0.0157% |
| 2032 | traditionalCorporateProfits | 5.3716T | 5.3725T | 0.0156% |
| 2033 | totalEmployment | 170.0568M | 170.1139M | 0.0335% |
| 2033 | totalUnemployment | 7.0034M | 6.9464M | 0.8144% |
| 2033 | aggregateWageIncome | 29.4651T | 29.4769T | 0.0399% |
| 2033 | aggregateAssetIncome | 10.5109T | 10.5128T | 0.0180% |
| 2033 | totalIncome | 52.8643T | 52.8776T | 0.0252% |
| 2033 | gdpNominal | 54.2986T | 54.3097T | 0.0204% |
| 2033 | consumption | 39.0751T | 39.0848T | 0.0247% |
| 2033 | investment | 9.0604T | 9.0620T | 0.0172% |
| 2033 | consumerWelfareIndex | 83.4995K | 90.5583K | 8.4537% |
| 2033 | wageConsumption | 23.5721T | 23.5815T | 0.0399% |
| 2033 | assetConsumption | 3.5450T | 3.5456T | 0.0187% |
| 2033 | corporateProfits | 5.9736T | 5.9749T | 0.0209% |
| 2033 | traditionalCorporateProfits | 5.9722T | 5.9734T | 0.0200% |
| 2034 | totalEmployment | 170.4286M | 170.4881M | 0.0349% |
| 2034 | totalUnemployment | 7.3399M | 7.2805M | 0.8101% |
| 2034 | aggregateWageIncome | 32.7208T | 32.7360T | 0.0465% |
| 2034 | aggregateAssetIncome | 11.7514T | 11.7561T | 0.0401% |
| 2034 | totalIncome | 57.6775T | 57.6966T | 0.0331% |
| 2034 | gdpNominal | 58.9594T | 58.9741T | 0.0249% |
| 2034 | consumption | 42.4307T | 42.4428T | 0.0283% |
| 2034 | investment | 10.0957T | 10.0987T | 0.0301% |
| 2034 | consumerWelfareIndex | 87.0473K | 95.7276K | 9.9720% |
| 2034 | wageConsumption | 26.1766T | 26.1888T | 0.0465% |
| 2034 | assetConsumption | 3.9591T | 3.9607T | 0.0416% |
| 2034 | corporateProfits | 6.4904T | 6.4922T | 0.0275% |
| 2034 | traditionalCorporateProfits | 6.4817T | 6.4832T | 0.0229% |
| 2035 | totalEmployment | 170.2039M | 170.2604M | 0.0332% |
| 2035 | totalUnemployment | 8.2757M | 8.2192M | 0.6836% |
| 2035 | aggregateWageIncome | 35.1774T | 35.2223T | 0.1276% |
| 2035 | aggregateAssetIncome | 12.9270T | 12.9357T | 0.0671% |
| 2035 | aggregateTransferIncome | 13.5180T | 13.5145T | 0.0260% |
| 2035 | totalIncome | 61.6225T | 61.6725T | 0.0812% |
| 2035 | gdpNominal | 62.7007T | 62.7485T | 0.0763% |
| 2035 | consumption | 44.9909T | 45.0350T | 0.0981% |
| 2035 | investment | 11.0225T | 11.0275T | 0.0453% |
| 2035 | governmentSpending | 8.1096T | 8.1084T | 0.0152% |
| 2035 | wageConsumption | 28.1003T | 28.1418T | 0.1475% |
| 2035 | assetConsumption | 4.3475T | 4.3505T | 0.0698% |
| 2035 | transferConsumption | 12.6214T | 12.6182T | 0.0250% |
| 2035 | corporateProfits | 6.9140T | 6.9197T | 0.0819% |
| 2035 | traditionalCorporateProfits | 6.8838T | 6.8887T | 0.0718% |
| 2036 | totalEmployment | 169.5445M | 169.6167M | 0.0426% |
| 2036 | totalUnemployment | 9.6490M | 9.5769M | 0.7478% |
| 2036 | aggregateWageIncome | 36.4806T | 36.5550T | 0.2039% |
| 2036 | aggregateAssetIncome | 14.0026T | 14.0189T | 0.1167% |
| 2036 | aggregateTransferIncome | 13.7860T | 13.7705T | 0.1129% |
| 2036 | totalIncome | 64.2692T | 64.3443T | 0.1169% |
| 2036 | gdpNominal | 64.9719T | 65.0127T | 0.0629% |
| 2036 | consumption | 46.2514T | 46.2900T | 0.0833% |
| 2036 | investment | 11.8213T | 11.8328T | 0.0980% |
| 2036 | governmentSpending | 8.3964T | 8.3879T | 0.1014% |
| 2036 | wageConsumption | 29.0049T | 29.0714T | 0.2292% |
| 2036 | assetConsumption | 4.6974T | 4.7031T | 0.1218% |
| 2036 | transferConsumption | 12.9308T | 12.9168T | 0.1083% |
| 2036 | corporateProfits | 7.1865T | 7.1915T | 0.0701% |
| 2036 | traditionalCorporateProfits | 7.1158T | 7.1199T | 0.0571% |
| 2037 | totalEmployment | 168.1314M | 168.2080M | 0.0455% |
| 2037 | totalUnemployment | 11.7789M | 11.7023M | 0.6500% |
| 2037 | aggregateWageIncome | 36.3355T | 36.4050T | 0.1913% |
| 2037 | aggregateAssetIncome | 14.9103T | 14.9271T | 0.1123% |
| 2037 | aggregateTransferIncome | 13.9804T | 13.9415T | 0.2784% |
| 2037 | totalIncome | 65.2262T | 65.2735T | 0.0726% |
| 2037 | gdpNominal | 65.1707T | 65.1381T | 0.0502% |
| 2037 | consumption | 45.9947T | 45.9784T | 0.0354% |
| 2037 | investment | 12.1281T | 12.1374T | 0.0771% |
| 2037 | governmentSpending | 8.5696T | 8.5442T | 0.2964% |
| 2037 | wageConsumption | 28.6784T | 28.7410T | 0.2183% |
| 2037 | assetConsumption | 4.9845T | 4.9904T | 0.1176% |
| 2037 | transferConsumption | 13.1843T | 13.1492T | 0.2657% |
| 2037 | corporateProfits | 7.2514T | 7.2487T | 0.0372% |
| 2037 | traditionalCorporateProfits | 7.1038T | 7.0995T | 0.0605% |
| 2038 | totalEmployment | 165.8281M | 165.8814M | 0.0321% |
| 2038 | totalUnemployment | 14.8018M | 14.7485M | 0.3601% |
| 2038 | aggregateWageIncome | 34.4321T | 34.4432T | 0.0324% |
| 2038 | aggregateAssetIncome | 15.5220T | 15.5282T | 0.0401% |
| 2038 | aggregateTransferIncome | 14.0586T | 14.0201T | 0.2737% |
| 2038 | totalIncome | 64.0127T | 63.9916T | 0.0330% |
| 2038 | gdpNominal | 61.4072T | 60.9713T | 0.7098% |
| 2038 | consumption | 42.2932T | 41.8982T | 0.9341% |
| 2038 | investment | 12.0132T | 11.9986T | 0.1223% |
| 2038 | governmentSpending | 8.5764T | 8.5485T | 0.3256% |
| 2038 | consumerWelfareIndex | 79.3510K | 88.6241K | 11.6862% |
| 2038 | aiAdditionalOutput | 1.0981T | 1.1081T | 0.9136% |
| 2038 | aiInvestmentBoost | 329.4173B | 332.4269B | 0.9136% |
| 2038 | aiNetExportBoost | 109.8058B | 110.8090B | 0.9136% |
| 2038 | aiConsumerGoodsPotential | 658.8346B | 664.8538B | 0.9136% |
| 2038 | aiGoodsAbsorbed | 658.8346B | 664.8538B | 0.9136% |
| 2038 | wageConsumption | 26.8924T | 26.9062T | 0.0513% |
| 2038 | assetConsumption | 5.1635T | 5.1657T | 0.0422% |
| 2038 | transferConsumption | 13.3449T | 13.3103T | 0.2595% |
| 2038 | corporateProfits | 6.9085T | 6.8620T | 0.6737% |
| 2038 | aiCorporateProfits | 274.5144B | 277.0224B | 0.9136% |
| 2038 | traditionalCorporateProfits | 6.6340T | 6.5850T | 0.7394% |
| 2038 | aiGDPContribution | 1.0981T | 1.1081T | 0.9136% |
| 2039 | totalEmployment | 160.2699M | 160.3581M | 0.0550% |
| 2039 | totalUnemployment | 21.0826M | 20.9944M | 0.4183% |
| 2039 | aggregateWageIncome | 28.7397T | 28.5802T | 0.5551% |
| 2039 | aggregateAssetIncome | 15.6293T | 15.5181T | 0.7118% |
| 2039 | aggregateTransferIncome | 14.1994T | 14.1602T | 0.2757% |
| 2039 | totalIncome | 58.5684T | 58.2585T | 0.5292% |
| 2039 | governmentSpending | 8.4476T | 8.4058T | 0.4940% |
| 2039 | consumerWelfareIndex | 67.2203K | 72.8266K | 8.3402% |
| 2039 | aiAdditionalOutput | 2.1482T | 2.1496T | 0.0654% |
| 2039 | aiInvestmentBoost | 644.4584B | 644.8801B | 0.0654% |
| 2039 | aiNetExportBoost | 214.8195B | 214.9600B | 0.0654% |
| 2039 | aiConsumerGoodsPotential | 1.2889T | 1.2898T | 0.0654% |
| 2039 | aiGoodsAbsorbed | 1.2889T | 1.2898T | 0.0654% |
| 2039 | wageConsumption | 21.9535T | 21.8386T | 0.5234% |
| 2039 | assetConsumption | 5.1607T | 5.1218T | 0.7545% |
| 2039 | transferConsumption | 13.5754T | 13.5402T | 0.2595% |
| 2039 | aiCorporateProfits | 537.0487B | 537.4001B | 0.0654% |
| 2039 | aiGDPContribution | 2.1482T | 2.1496T | 0.0654% |
| 2040 | totalEmployment | 150.0508M | 149.9992M | 0.0344% |
| 2040 | totalUnemployment | 32.0271M | 32.0787M | 0.1613% |
| 2040 | aggregateTransferIncome | 14.4298T | 14.3933T | 0.2527% |
| 2040 | governmentSpending | 8.1744T | 8.1119T | 0.7644% |
| 2040 | consumerWelfareIndex | 54.0591K | 57.4040K | 6.1875% |
| 2040 | aiAdditionalOutput | 4.0082T | 4.0256T | 0.4353% |
| 2040 | aiInvestmentBoost | 1.2024T | 1.2077T | 0.4353% |
| 2040 | aiNetExportBoost | 400.8155B | 402.5601B | 0.4353% |
| 2040 | aiConsumerGoodsPotential | 2.4049T | 2.4154T | 0.4353% |
| 2040 | aiGoodsAbsorbed | 2.4049T | 2.4154T | 0.4353% |
| 2040 | transferConsumption | 13.9022T | 13.8694T | 0.2360% |
| 2040 | aiCorporateProfits | 1.0020T | 1.0064T | 0.4353% |
| 2040 | aiGDPContribution | 4.0082T | 4.0256T | 0.4353% |
| 2041 | totalEmployment | 132.4659M | 132.0717M | 0.2976% |
| 2041 | totalUnemployment | 50.3402M | 50.7345M | 0.7832% |
| 2041 | aggregateTransferIncome | 14.8018T | 14.7719T | 0.2019% |
| 2041 | governmentSpending | 7.8653T | 7.8032T | 0.7892% |
| 2041 | consumerWelfareIndex | 43.7601K | 46.5312K | 6.3323% |
| 2041 | aiAdditionalOutput | 7.1867T | 7.2566T | 0.9733% |
| 2041 | aiInvestmentBoost | 2.1560T | 2.1770T | 0.9733% |
| 2041 | aiNetExportBoost | 718.6661B | 725.6606B | 0.9733% |
| 2041 | aiConsumerGoodsPotential | 4.3120T | 4.3540T | 0.9733% |
| 2041 | aiGoodsAbsorbed | 4.3120T | 4.3350T | 0.5343% |
| 2041 | transferConsumption | 14.3743T | 14.3474T | 0.1871% |
| 2041 | corporateProfits | 5.2126T | 5.1708T | 0.8021% |
| 2041 | aiCorporateProfits | 1.7967T | 1.8094T | 0.7099% |
| 2041 | aiGDPContribution | 7.1867T | 7.2377T | 0.7099% |
| 2042 | totalEmployment | 119.4798M | 119.5024M | 0.0189% |
| 2042 | totalUnemployment | 64.0576M | 64.0350M | 0.0352% |
| 2042 | aggregateAssetIncome | 12.1095T | 12.0741T | 0.2924% |
| 2042 | aggregateTransferIncome | 15.0856T | 15.0477T | 0.2511% |
| 2042 | totalIncome | 34.9993T | 34.8384T | 0.4599% |
| 2042 | gdpNominal | 35.2965T | 35.2733T | 0.0656% |
| 2042 | investment | 9.2156T | 9.2223T | 0.0723% |
| 2042 | governmentSpending | 7.6543T | 7.6122T | 0.5492% |
| 2042 | consumerWelfareIndex | 39.5228K | 42.2486K | 6.8968% |
| 2042 | unrealizedAIOutput | 720.0175B | 719.6447B | 0.0518% |
| 2042 | assetConsumption | 3.7675T | 3.7551T | 0.3290% |
| 2042 | transferConsumption | 14.7877T | 14.7536T | 0.2306% |
| 2042 | corporateProfits | 5.0981T | 5.0956T | 0.0489% |
| 2042 | traditionalCorporateProfits | 2.9276T | 2.9250T | 0.0884% |
| 2043 | totalEmployment | 104.3878M | 104.4036M | 0.0152% |
| 2043 | totalUnemployment | 79.8838M | 79.8679M | 0.0199% |
| 2043 | aggregateWageIncome | 5.8630T | 5.8599T | 0.0526% |
| 2043 | aggregateTransferIncome | 15.4100T | 15.3723T | 0.2450% |
| 2043 | totalIncome | 33.5095T | 33.6565T | 0.4387% |
| 2043 | gdpNominal | 34.6990T | 34.9098T | 0.6074% |
| 2043 | consumption | 17.0461T | 17.2112T | 0.9682% |
| 2043 | investment | 9.8268T | 9.8995T | 0.7404% |
| 2043 | governmentSpending | 7.5534T | 7.5259T | 0.3653% |
| 2043 | consumerWelfareIndex | 38.5224K | 41.4956K | 7.7183% |
| 2043 | aiGoodsAbsorbed | 5.4811T | 5.5342T | 0.9682% |
| 2043 | wageConsumption | 3.5486T | 3.5469T | 0.0455% |
| 2043 | transferConsumption | 15.2613T | 15.2273T | 0.2227% |
| 2043 | corporateProfits | 5.2178T | 5.2484T | 0.5867% |
| 2043 | aiCorporateProfits | 2.5017T | 2.5149T | 0.5304% |
| 2043 | traditionalCorporateProfits | 2.7162T | 2.7335T | 0.6387% |
| 2043 | aiGDPContribution | 10.0066T | 10.0597T | 0.5304% |
| 2043 | totalDemandSpilloverLoss | 354.6170K | 357.3751K | 0.7778% |
| 2044 | totalEmployment | 94.8647M | 94.9875M | 0.1295% |
| 2044 | totalUnemployment | 90.1440M | 90.0211M | 0.1363% |
| 2044 | aggregateWageIncome | 5.1197T | 5.1582T | 0.7517% |
| 2044 | aggregateTransferIncome | 15.6276T | 15.5878T | 0.2547% |
| 2044 | totalIncome | 33.9937T | 34.3329T | 0.9977% |
| 2044 | gdpNominal | 35.0935T | 35.3631T | 0.7683% |
| 2044 | investment | 10.5975T | 10.6877T | 0.8513% |
| 2044 | governmentSpending | 7.5330T | 7.5134T | 0.2600% |
| 2044 | consumerWelfareIndex | 39.7491K | 43.1579K | 8.5758% |
| 2044 | wageConsumption | 2.9611T | 2.9851T | 0.8095% |
| 2044 | transferConsumption | 15.6660T | 15.6301T | 0.2287% |
| 2044 | corporateProfits | 5.4075T | 5.4473T | 0.7369% |
| 2044 | aiCorporateProfits | 2.7629T | 2.7811T | 0.6585% |
| 2044 | traditionalCorporateProfits | 2.6446T | 2.6663T | 0.8188% |
| 2044 | aiGDPContribution | 11.0514T | 11.1242T | 0.6585% |
| 2045 | totalEmployment | 88.7073M | 88.8648M | 0.1776% |
| 2045 | totalUnemployment | 97.0414M | 96.8839M | 0.1623% |
| 2045 | aggregateWageIncome | 4.7658T | 4.8118T | 0.9638% |
| 2045 | aggregateTransferIncome | 15.7808T | 15.7403T | 0.2565% |
| 2045 | totalIncome | 35.2886T | 35.6396T | 0.9946% |
| 2045 | gdpNominal | 35.9801T | 36.2288T | 0.6912% |
| 2045 | investment | 11.2169T | 11.2810T | 0.5711% |
| 2045 | governmentSpending | 7.5465T | 7.5289T | 0.2328% |
| 2045 | consumerWelfareIndex | 42.8576K | 47.0536K | 9.7904% |
| 2045 | aiAdditionalOutput | 13.7995T | 13.7910T | 0.0614% |
| 2045 | aiInvestmentBoost | 4.1399T | 4.1373T | 0.0614% |
| 2045 | aiNetExportBoost | 1.3800T | 1.3791T | 0.0614% |
| 2045 | aiConsumerGoodsPotential | 8.2797T | 8.2746T | 0.0614% |
| 2045 | transferConsumption | 16.0439T | 16.0075T | 0.2270% |
| 2045 | corporateProfits | 5.6470T | 5.6848T | 0.6697% |
| 2045 | aiCorporateProfits | 3.0164T | 3.0351T | 0.6195% |
| 2045 | traditionalCorporateProfits | 2.6306T | 2.6497T | 0.7274% |
| 2045 | aiGDPContribution | 12.0658T | 12.1405T | 0.6195% |
| 2046 | totalEmployment | 84.9999M | 85.0980M | 0.1154% |
| 2046 | totalUnemployment | 101.4917M | 101.3937M | 0.0966% |
| 2046 | aggregateWageIncome | 4.6795T | 4.7175T | 0.8118% |
| 2046 | aggregateTransferIncome | 15.8870T | 15.8477T | 0.2476% |
| 2046 | totalIncome | 36.8447T | 37.0189T | 0.4729% |
| 2046 | gdpNominal | 36.9222T | 37.1601T | 0.6444% |
| 2046 | investment | 11.7030T | 11.7478T | 0.3827% |
| 2046 | governmentSpending | 7.5769T | 7.5586T | 0.2413% |
| 2046 | consumerWelfareIndex | 46.9510K | 52.3818K | 11.5670% |
| 2046 | potentialGDP | 46.2404T | 45.8509T | 0.8423% |
| 2046 | wageConsumption | 2.5732T | 2.5954T | 0.8600% |
| 2046 | transferConsumption | 16.4157T | 16.3803T | 0.2157% |
| 2046 | corporateProfits | 5.8563T | 5.8950T | 0.6609% |
| 2046 | aiCorporateProfits | 3.2052T | 3.2276T | 0.6983% |
| 2046 | traditionalCorporateProfits | 2.6512T | 2.6675T | 0.6157% |
| 2046 | aiGDPContribution | 12.8207T | 12.9102T | 0.6983% |
| 2047 | totalEmployment | 82.3432M | 82.4310M | 0.1066% |
| 2047 | totalUnemployment | 104.8944M | 104.8067M | 0.0837% |
| 2047 | aggregateWageIncome | 4.6526T | 4.6878T | 0.7545% |
| 2047 | aggregateAssetIncome | 17.2930T | 17.3737T | 0.4668% |
| 2047 | aggregateTransferIncome | 15.9732T | 15.9341T | 0.2450% |
| 2047 | totalIncome | 37.9188T | 37.9955T | 0.2022% |
| 2047 | gdpNominal | 37.6634T | 37.9314T | 0.7114% |
| 2047 | investment | 12.0387T | 12.0836T | 0.3730% |
| 2047 | governmentSpending | 7.6091T | 7.5905T | 0.2452% |
| 2047 | consumerWelfareIndex | 51.3970K | 58.6234K | 14.0599% |
| 2047 | wageConsumption | 2.5212T | 2.5413T | 0.7981% |
| 2047 | assetConsumption | 5.1056T | 5.1338T | 0.5533% |
| 2047 | transferConsumption | 16.8109T | 16.7757T | 0.2095% |
| 2047 | corporateProfits | 6.0176T | 6.0618T | 0.7349% |
| 2047 | aiCorporateProfits | 3.3475T | 3.3739T | 0.7869% |
| 2047 | traditionalCorporateProfits | 2.6701T | 2.6879T | 0.6697% |
| 2047 | aiGDPContribution | 13.3901T | 13.4955T | 0.7869% |
| 2048 | totalEmployment | 80.3217M | 80.3829M | 0.0761% |
| 2048 | totalUnemployment | 107.6649M | 107.6037M | 0.0568% |
| 2048 | aggregateWageIncome | 4.6326T | 4.6692T | 0.7914% |
| 2048 | aggregateAssetIncome | 18.2586T | 18.2534T | 0.0285% |
| 2048 | aggregateTransferIncome | 16.0474T | 16.0087T | 0.2407% |
| 2048 | totalIncome | 38.9386T | 38.9314T | 0.0184% |
| 2048 | gdpNominal | 38.2802T | 38.5825T | 0.7897% |
| 2048 | investment | 12.2405T | 12.3006T | 0.4904% |
| 2048 | governmentSpending | 7.6345T | 7.6169T | 0.2309% |
| 2048 | consumerWelfareIndex | 56.3823K | 65.9557K | 16.9794% |
| 2048 | wageConsumption | 2.4814T | 2.5018T | 0.8220% |
| 2048 | assetConsumption | 5.3015T | 5.2997T | 0.0343% |
| 2048 | transferConsumption | 17.2429T | 17.2081T | 0.2016% |
| 2048 | corporateProfits | 6.1526T | 6.2022T | 0.8056% |
| 2048 | aiCorporateProfits | 3.4675T | 3.4967T | 0.8402% |
| 2048 | traditionalCorporateProfits | 2.6851T | 2.7055T | 0.7610% |
| 2048 | aiGDPContribution | 13.8701T | 13.9866T | 0.8402% |
| 2049 | totalEmployment | 79.1324M | 79.1967M | 0.0813% |
| 2049 | totalUnemployment | 109.6061M | 109.5418M | 0.0587% |
| 2049 | aggregateWageIncome | 4.6383T | 4.6785T | 0.8678% |
| 2049 | aggregateAssetIncome | 19.1825T | 19.0875T | 0.4956% |
| 2049 | aggregateTransferIncome | 16.1057T | 16.0670T | 0.2402% |
| 2049 | totalIncome | 39.9265T | 39.8330T | 0.2342% |
| 2049 | gdpNominal | 38.8821T | 39.2122T | 0.8490% |
| 2049 | investment | 12.4062T | 12.4737T | 0.5446% |
| 2049 | governmentSpending | 7.6556T | 7.6392T | 0.2149% |
| 2049 | wageConsumption | 2.4659T | 2.4881T | 0.9001% |
| 2049 | assetConsumption | 5.4615T | 5.4283T | 0.6092% |
| 2049 | transferConsumption | 17.7154T | 17.6806T | 0.1965% |
| 2049 | corporateProfits | 6.2761T | 6.3301T | 0.8612% |
| 2049 | aiCorporateProfits | 3.5697T | 3.6014T | 0.8874% |
| 2049 | traditionalCorporateProfits | 2.7064T | 2.7287T | 0.8267% |
| 2049 | aiGDPContribution | 14.2788T | 14.4055T | 0.8874% |
| 2050 | totalEmployment | 78.6138M | 78.6912M | 0.0985% |
| 2050 | totalUnemployment | 110.8797M | 110.8023M | 0.0699% |
| 2050 | aggregateWageIncome | 4.6725T | 4.7165T | 0.9427% |
| 2050 | aggregateAssetIncome | 20.1306T | 19.9439T | 0.9276% |
| 2050 | aggregateTransferIncome | 16.1512T | 16.1123T | 0.2411% |
| 2050 | totalIncome | 40.9543T | 40.7727T | 0.4435% |
| 2050 | gdpNominal | 39.5456T | 39.9311T | 0.9749% |
| 2050 | investment | 12.5727T | 12.6443T | 0.5696% |
| 2050 | governmentSpending | 7.6762T | 7.6607T | 0.2019% |
| 2050 | wageConsumption | 2.4737T | 2.4980T | 0.9817% |
| 2050 | transferConsumption | 18.2395T | 18.2045T | 0.1921% |
| 2050 | corporateProfits | 6.4017T | 6.4652T | 0.9927% |
| 2050 | traditionalCorporateProfits | 2.7380T | 2.7638T | 0.9421% |

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
| gdpReal | 33.5300T | 33.9802T | 1.3428% | **FAIL** |
| consumerWelfareIndex | 67.0102K | 67.9100K | 1.3428% | WARN |
| potentialGDP | 33.5300T | 36.7338T | 9.5550% | **FAIL** |

### Year 2029

| Field | Expected | Actual | Error | Status |
|-------|----------|--------|------:|--------|
| totalUnemployment | 6.9130M | 6.9029M | 0.1465% | WARN |
| gdpReal | 33.7802T | 34.6942T | 2.7058% | **FAIL** |
| consumerWelfareIndex | 67.3508K | 69.1738K | 2.7067% | WARN |
| newJobEmployment | 754.4246K | 764.5552K | 1.3428% | **FAIL** |
| newJobWageIncome | 72.4383B | 73.4110B | 1.3428% | **FAIL** |
| potentialGDP | 33.7802T | 38.4925T | 13.9498% | **FAIL** |

### Year 2030

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

### Year 2031

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

### Year 2032

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

### Year 2033

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

### Year 2034

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

### Year 2035

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

### Year 2036

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

### Year 2037

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

### Year 2038

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

### Year 2039

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

### Year 2040

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

### Year 2041

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

### Year 2042

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

### Year 2043

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

### Year 2044

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

### Year 2045

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

### Year 2046

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

### Year 2047

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

### Year 2048

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

### Year 2049

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

### Year 2050

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
*Scenario "all_policies" — ATLAS Verification Audit v1.0*
