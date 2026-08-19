/**
 * ATLAS — AEI (Anthropic Economic Index) Raw Data Fetch
 *
 * Downloads the pinned V6 + labor_market_impacts files from Hugging Face into the
 * gitignored cache (.anthropic-cache/), verifying every file's sha256 against the
 * pinned manifest (scripts/anthropic-manifest.ts). Anonymous access — no API key.
 *
 * Outputs (cache-relative, mirroring the repo layout):
 *   release_2026_06_26/data/aei_1p_api_2026-06-26.csv      (77 MB)
 *   release_2026_06_26/data/aei_claude_ai_2026-06-26.csv   (219 MB)
 *   release_2026_06_26/data_documentation.md
 *   labor_market_impacts/job_exposure.csv
 *   labor_market_impacts/task_penetration.csv
 *   fetch-manifest.json  (fetchedAt + the verified inventory)
 *
 * A file already present with a matching hash is skipped. A hash mismatch is a hard
 * error — the pipeline never consumes unverified bytes. Raw CSVs are never committed;
 * only the transform's small processed.json/metadata.json enter git
 * (scripts/transform-anthropic-data.ts).
 *
 * Usage: npm run fetch-anthropic
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  AEI_CACHE_DIR,
  AEI_RELEASE_ID,
  AEI_SOURCE_COMMIT_SHA,
  AEI_SOURCE_FILES,
  cachePath,
  resolveUrl,
} from './anthropic-manifest.js';

function sha256OfFile(filepath: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filepath));
  return hash.digest('hex');
}

async function fetchFile(fileSpec: (typeof AEI_SOURCE_FILES)[number]): Promise<'skipped' | 'downloaded'> {
  const target = cachePath(fileSpec.path);
  if (fs.existsSync(target)) {
    const existing = sha256OfFile(target);
    if (existing === fileSpec.sha256) {
      console.log(`  ✓ cached & verified: ${fileSpec.path}`);
      return 'skipped';
    }
    console.log(`  ! cached file hash mismatch — re-downloading: ${fileSpec.path}`);
  }
  const url = resolveUrl(fileSpec.path);
  console.log(`  ↓ downloading ${fileSpec.path} (${(fileSpec.bytes / 1e6).toFixed(1)} MB)`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`download failed (${response.status} ${response.statusText}): ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const actual = crypto.createHash('sha256').update(buffer).digest('hex');
  if (actual !== fileSpec.sha256) {
    throw new Error(
      `sha256 mismatch for ${fileSpec.path}: expected ${fileSpec.sha256}, got ${actual} — `
      + 'the pinned revision should be immutable; refusing to write unverified bytes.');
  }
  if (buffer.length !== fileSpec.bytes) {
    throw new Error(`size mismatch for ${fileSpec.path}: expected ${fileSpec.bytes}, got ${buffer.length}`);
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, buffer);
  console.log(`  ✅ verified & written: ${target}`);
  return 'downloaded';
}

async function main(): Promise<void> {
  console.log(`AEI fetch — release ${AEI_RELEASE_ID}, revision ${AEI_SOURCE_COMMIT_SHA}`);
  console.log(`Cache: ${AEI_CACHE_DIR} (gitignored — raw files never enter git)\n`);
  let downloaded = 0;
  for (const fileSpec of AEI_SOURCE_FILES) {
    const outcome = await fetchFile(fileSpec);
    if (outcome === 'downloaded') downloaded += 1;
  }
  const manifest = {
    fetchedAt: new Date().toISOString(),
    sourceCommitSha: AEI_SOURCE_COMMIT_SHA,
    files: AEI_SOURCE_FILES,
  };
  fs.writeFileSync(path.join(AEI_CACHE_DIR, 'fetch-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\nDone: ${downloaded} downloaded, ${AEI_SOURCE_FILES.length - downloaded} already verified in cache.`);
  console.log('Next: npm run transform-anthropic');
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
