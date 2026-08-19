/**
 * Cluster VA anchor loader (the AI production system — Channel 2's data layer).
 *
 * Reads the Stage-0 committed artifact `src/data/bea/cluster-va-anchors.json`
 * (BLS National Employment Matrix 2024–34 × BEA GDP-by-Industry value added 2025;
 * construction metadata in the artifact) and exposes the per-cluster VALUE-ADDED
 * anchors in the form the engine consumes: VA per NEM worker ($/worker/yr).
 *
 * THE BASIS-COMMENSURABILITY STEP (stated, Stage-2 report §2): the artifact's dollar
 * anchors are attributed over the NEM occupation set; the engine's cluster employment
 * comes from the OEWS-based role estimation, which draws a broader/narrower SOC set
 * per cluster (health_physicians: NEM 172k vs engine 902k). The engine therefore
 * consumes VA PER WORKER × its own year-0 employment, keeping the anchor and the
 * wage-mass term of the ledger on ONE employment basis. The citable content (industry
 * value added per worker at the cluster's industry mix) is exactly what survives the
 * re-basis.
 *
 * Data flow: BEA/BLS artifacts → this loader → constants.ts → models (the
 * loadGovernmentData pattern).
 */
import clusterVAAnchorsJson from '@/data/bea/cluster-va-anchors.json';
import industryGdpJson from '@/data/bea/industry-gdp.json';

interface AnchorRow {
  vaAnchorBillions: number;
  nemEmploymentThousands: number;
  mappingQuality: string;
  selfEmployedUnmappedPct: number;
}

const rawClusters = (clusterVAAnchorsJson as {
  clusters: Record<string, AnchorRow>;
  sigmaSanity: { sumClusterVABillions: number; economyVABillions: number };
}).clusters;

/** VA per NEM worker, $/worker/yr, per measured cluster (48 rows). */
export const clusterVAPerWorker: Record<string, number> = {};
/** The artifact's dollar anchors ($B), passed through for records/tests. */
export const clusterVAAnchorBillions: Record<string, number> = {};
/** Mapping quality per cluster (concentrated / moderate / diffuse) — consumed with the anchor. */
export const clusterVAMappingQuality: Record<string, string> = {};
/** Self-employed share excluded from the anchor (the SE-floor design decision's input). */
export const clusterVASelfEmployedPct: Record<string, number> = {};

for (const [id, row] of Object.entries(rawClusters)) {
  const emp = row.nemEmploymentThousands * 1000;
  if (emp > 0) clusterVAPerWorker[id] = (row.vaAnchorBillions * 1e9) / emp;
  clusterVAAnchorBillions[id] = row.vaAnchorBillions;
  clusterVAMappingQuality[id] = row.mappingQuality;
  clusterVASelfEmployedPct[id] = row.selfEmployedUnmappedPct;
}

/** Σ measured anchors ($B) — the Stage-0 Σ-sanity numerator (regression-tested). */
export const clusterVAAnchorsTotalBillions = (clusterVAAnchorsJson as {
  sigmaSanity: { sumClusterVABillions: number };
}).sigmaSanity.sumClusterVABillions;

/** Economy-wide value added 2025 ($B) — BEA GDP-by-Industry total (the A1 denominator). */
export const economyVA2025Billions = (() => {
  const va = (industryGdpJson as { valueAdded: Record<string, { valueBillions: number }> }).valueAdded;
  // The artifact's own Σ-sanity records $30,762.1B; read the GDP total row when present,
  // else fall back to the recorded partition total.
  const gdpRow = va['GDP'] ?? va['1'];
  return gdpRow && gdpRow.valueBillions > 20_000
    ? gdpRow.valueBillions
    : (clusterVAAnchorsJson as { sigmaSanity: { economyVABillions: number } }).sigmaSanity.economyVABillions;
})();

/** Government VA rows ($B), 2025 (BEA GDP-by-Industry Table 1) — the unanchored-cluster
 *  assignments' numerators (gov_federal ← GFGN+GFGD; gov_state_local ← GSLG). */
export const governmentVA2025Billions = (() => {
  const va = (industryGdpJson as { valueAdded: Record<string, { valueBillions: number }> }).valueAdded;
  return {
    federalGeneral: (va['GFGN']?.valueBillions ?? 459.5) + (va['GFGD']?.valueBillions ?? 569.7),
    stateLocalGeneral: va['GSLG']?.valueBillions ?? 2171.2,
  };
})();
