/**
 * O*NET Physical-Intensity Fetch + Transform (Production Program, an earlier build step)
 *
 * Downloads the O*NET database text files (public domain, onetcenter.org) into the
 * gitignored .onet-cache/, then computes the ADOPTED continuous physical-intensity
 * composite per occupation cluster (the design specification + the recorded design decision
 * scale, employment-weighted, no binary threshold) and writes the committed artifact
 * src/data/onet/physical-intensity.json.
 *
 * THE CLASSIFICATION RULE (part of the adopted rule going forward; recorded in the
 * artifact's metadata):
 *   Descriptors (three groups):
 *     Work Activities (Scale IM, 1–5): "Performing General Physical Activities",
 *                                      "Handling and Moving Objects"
 *     Work Context   (Scale CX, 1–5): "Spend Time Standing", "Physical Proximity"
 *     Abilities      (Scale IM, 1–5): "Manual Dexterity", "Stamina", "Trunk Strength"
 *   Normalization: (value − 1) / 4 per descriptor (both scales are 1–5).
 *   Composite: mean within group, then EQUAL group weights (1/3 each).
 *   SOC aggregation: O*NET-SOC 8-digit detail codes → 6-digit SOC by unweighted mean
 *     (detail-level employment is not published).
 *   Cluster aggregation: employment-weighted mean over the cluster's SOC codes
 *     (weights: OEWS national employment, datatype 01, from src/data/bls/oews-data.json);
 *     clusters without OEWS employment fall back to unweighted mean, noted per cluster.
 *
 * Run: npx tsx scripts/fetch-onet-data.ts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const CACHE = path.join(ROOT, '.onet-cache');
const OUT_DIR = path.join(ROOT, 'src', 'data', 'onet');

const ONET_VERSION = '30.3';
const ONET_DB = 'db_30_3_text';
const BASE = `https://www.onetcenter.org/dl_files/database/${ONET_DB}`;
const FILES = ['Work Activities.txt', 'Work Context.txt', 'Abilities.txt'] as const;

interface Descriptor {
  file: (typeof FILES)[number];
  elementName: string;
  scaleId: string;
  group: 'workActivities' | 'workContext' | 'abilities';
}

const DESCRIPTORS: Descriptor[] = [
  { file: 'Work Activities.txt', elementName: 'Performing General Physical Activities', scaleId: 'IM', group: 'workActivities' },
  { file: 'Work Activities.txt', elementName: 'Handling and Moving Objects', scaleId: 'IM', group: 'workActivities' },
  { file: 'Work Context.txt', elementName: 'Spend Time Standing', scaleId: 'CX', group: 'workContext' },
  { file: 'Work Context.txt', elementName: 'Physical Proximity', scaleId: 'CX', group: 'workContext' },
  { file: 'Abilities.txt', elementName: 'Manual Dexterity', scaleId: 'IM', group: 'abilities' },
  { file: 'Abilities.txt', elementName: 'Stamina', scaleId: 'IM', group: 'abilities' },
  { file: 'Abilities.txt', elementName: 'Trunk Strength', scaleId: 'IM', group: 'abilities' },
];
const GROUPS = ['workActivities', 'workContext', 'abilities'] as const;

async function download(file: string): Promise<string> {
  const dest = path.join(CACHE, file);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    console.log(`  cache hit: ${file} (${(fs.statSync(dest).size / 1e6).toFixed(1)} MB)`);
    return dest;
  }
  const url = `${BASE}/${encodeURIComponent(file)}`;
  console.log(`  fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`O*NET fetch failed: ${url} → ${res.status}`);
  const text = await res.text();
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(dest, text);
  console.log(`  saved ${file} (${(text.length / 1e6).toFixed(1)} MB)`);
  return dest;
}

/** Parse an O*NET tab-delimited file → per-SOC6 per-element mean Data Value. */
function parseFile(
  filePath: string,
  wanted: Array<{ elementName: string; scaleId: string }>,
): Map<string, Map<string, number>> {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const header = lines[0]!.replace(/\r$/, '').split('\t');
  const iSoc = header.indexOf('O*NET-SOC Code');
  const iName = header.indexOf('Element Name');
  const iScale = header.indexOf('Scale ID');
  const iValue = header.indexOf('Data Value');
  if ([iSoc, iName, iScale, iValue].includes(-1)) {
    throw new Error(`unexpected O*NET header in ${filePath}: ${header.join(',')}`);
  }
  const wantKey = new Set(wanted.map((w) => `${w.elementName}|${w.scaleId}`));
  // soc6 → elementName → {sum, n} across 8-digit detail codes
  const acc = new Map<string, Map<string, { sum: number; n: number }>>();
  for (let li = 1; li < lines.length; li++) {
    const row = lines[li]!.replace(/\r$/, '').split('\t');
    if (row.length < 5) continue;
    const key = `${row[iName]}|${row[iScale]}`;
    if (!wantKey.has(key)) continue;
    const soc6 = row[iSoc]!.slice(0, 7);
    const v = parseFloat(row[iValue]!);
    if (!isFinite(v)) continue;
    let bySoc = acc.get(soc6);
    if (!bySoc) { bySoc = new Map(); acc.set(soc6, bySoc); }
    const cell = bySoc.get(row[iName]!) ?? { sum: 0, n: 0 };
    cell.sum += v; cell.n += 1;
    bySoc.set(row[iName]!, cell);
  }
  const out = new Map<string, Map<string, number>>();
  for (const [soc, bySoc] of acc) {
    const m = new Map<string, number>();
    for (const [el, { sum, n }] of bySoc) m.set(el, sum / n);
    out.set(soc, m);
  }
  return out;
}

/** Cluster → socCodes + per-SOC employment, from the committed OEWS artifact
 *  (canonical ids via socMapping.ts, parsed as the single source of truth). */
function loadClusters(): Map<string, { socs: string[]; employment: Map<string, number> }> {
  const oews = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/bls/oews-data.json'), 'utf8')) as Record<
    string, { socCodes: Record<string, Record<string, Array<{ value: string; latest?: string }>>> }
  >;
  const socMappingSrc = fs.readFileSync(path.join(ROOT, 'src/data/socMapping.ts'), 'utf8');
  const rename = new Map<string, string>();
  for (const m of socMappingSrc.matchAll(/'([a-z0-9_]+)':\s*'([a-z0-9_]+)'/g)) {
    rename.set(m[1]!, m[2]!);
  }
  const clusters = new Map<string, { socs: string[]; employment: Map<string, number> }>();
  for (const [rawId, rec] of Object.entries(oews)) {
    const id = rename.get(rawId) ?? rawId;
    const socs = Object.keys(rec.socCodes);
    const employment = new Map<string, number>();
    for (const soc of socs) {
      const emp = rec.socCodes[soc]?.['01']?.[0]?.value;
      if (emp !== undefined) employment.set(soc, parseFloat(emp));
    }
    clusters.set(id, { socs, employment });
  }
  // Non-OEWS clusters (gov_federal, gov_state_local): socCodes parsed from
  // occupationClusters.ts (they have no OEWS employment → unweighted, noted).
  const occSrc = fs.readFileSync(path.join(ROOT, 'src/data/occupationClusters.ts'), 'utf8');
  for (const gov of ['gov_federal', 'gov_state_local']) {
    if (clusters.has(gov)) continue;
    const block = occSrc.split(`id: '${gov}'`)[1]?.slice(0, 4000) ?? '';
    const socMatch = block.match(/socCodes:\s*\[([^\]]*)\]/);
    const socs = socMatch ? [...socMatch[1]!.matchAll(/'([0-9-]+)'/g)].map((m) => m[1]!) : [];
    clusters.set(gov, { socs, employment: new Map() });
  }
  return clusters;
}

async function main() {
  console.log(`O*NET ${ONET_VERSION} physical-intensity pipeline`);
  const paths = new Map<string, string>();
  for (const f of FILES) paths.set(f, await download(f));

  // Parse each file for its wanted descriptors
  const perFile = new Map<string, Map<string, Map<string, number>>>();
  for (const f of FILES) {
    const wanted = DESCRIPTORS.filter((d) => d.file === f);
    perFile.set(f, parseFile(paths.get(f)!, wanted));
  }

  // SOC6 → normalized group scores
  const socScore = new Map<string, { byGroup: Record<string, number>; composite: number; nDescriptors: number }>();
  const allSocs = new Set<string>();
  for (const m of perFile.values()) for (const s of m.keys()) allSocs.add(s);
  for (const soc of allSocs) {
    const byGroup: Record<string, { sum: number; n: number }> = {};
    let nDesc = 0;
    for (const d of DESCRIPTORS) {
      const v = perFile.get(d.file)!.get(soc)?.get(d.elementName);
      if (v === undefined) continue;
      const norm = Math.max(0, Math.min(1, (v - 1) / 4));
      const g = (byGroup[d.group] ??= { sum: 0, n: 0 });
      g.sum += norm; g.n += 1; nDesc += 1;
    }
    const groupMeans: Record<string, number> = {};
    let gSum = 0, gN = 0;
    for (const g of GROUPS) {
      if (byGroup[g] && byGroup[g]!.n > 0) {
        groupMeans[g] = byGroup[g]!.sum / byGroup[g]!.n;
        gSum += groupMeans[g]!; gN += 1;
      }
    }
    if (gN === 0) continue;
    socScore.set(soc, { byGroup: groupMeans, composite: gSum / gN, nDescriptors: nDesc });
  }
  console.log(`  SOC codes scored: ${socScore.size}`);

  // Cluster aggregation
  const clusters = loadClusters();
  const outClusters: Record<string, unknown> = {};
  const rows: Array<[string, number, string]> = [];
  for (const [id, { socs, employment }] of [...clusters.entries()].sort()) {
    let wSum = 0, wTot = 0, uSum = 0, uN = 0;
    const missing: string[] = [];
    for (const soc of socs) {
      const s = socScore.get(soc);
      if (!s) { missing.push(soc); continue; }
      uSum += s.composite; uN += 1;
      const w = employment.get(soc);
      if (w !== undefined && w > 0) { wSum += s.composite * w; wTot += w; }
    }
    const weighting = wTot > 0 ? 'employment' : 'unweighted';
    const score = wTot > 0 ? wSum / wTot : uN > 0 ? uSum / uN : null;
    const notes: string[] = [];
    if (missing.length) notes.push(`SOC not in O*NET: ${missing.join(', ')}`);
    if (weighting === 'unweighted' && score !== null) notes.push('no OEWS employment; unweighted mean');
    if (score === null) notes.push('no scoreable SOC codes');
    outClusters[id] = {
      score: score === null ? null : +score.toFixed(4),
      weighting,
      socScored: uN,
      socMissing: missing,
      employmentCovered: wTot,
      notes: notes.join('; ') || undefined,
    };
    if (score !== null) rows.push([id, score, weighting]);
  }
  // The residual cluster (not in OEWS; no SOC codes by construction) — explicit row so
  // the artifact covers all 51 canonical clusters; the gate default for null-score
  // clusters is a an earlier build step design decision (flagged in the an earlier build step report, not made here).
  outClusters['other_uncategorized'] = {
    score: null, weighting: 'unweighted', socScored: 0, socMissing: [], employmentCovered: 0,
    notes: 'residual cluster; no SOC codes by construction — unscored; Stage 2 defines the null-score gate default',
  };
  rows.sort((a, b) => b[1] - a[1]);
  console.log('\n  cluster physical-intensity (desc):');
  for (const [id, s, w] of rows) console.log(`   ${s.toFixed(3)}  ${id}${w === 'unweighted' ? '  [unweighted]' : ''}`);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const artifact = {
    source: `O*NET ${ONET_VERSION} Database (onetcenter.org, public domain; ${ONET_DB})`,
    fetchedAt: new Date().toISOString(),
    rule: {
      descriptors: DESCRIPTORS.map((d) => ({ file: d.file, elementName: d.elementName, scaleId: d.scaleId, group: d.group })),
      normalization: '(value − 1) / 4 per descriptor (IM and CX scales are 1–5)',
      groupWeights: 'equal (1/3 workActivities, 1/3 workContext, 1/3 abilities); mean within group',
      socAggregation: 'O*NET-SOC 8-digit detail → 6-digit SOC, unweighted mean',
      clusterWeighting: 'OEWS national employment (datatype 01, src/data/bls/oews-data.json); unweighted fallback noted per cluster',
      ratification: 'Production program R4 (2026-08-15): CONTINUOUS scale, no binary threshold; the composite IS the embodiment gate strength',
    },
    clusters: outClusters,
  };
  fs.writeFileSync(path.join(OUT_DIR, 'physical-intensity.json'), JSON.stringify(artifact, null, 2));
  console.log(`\n  wrote src/data/onet/physical-intensity.json (${Object.keys(outClusters).length} clusters)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
