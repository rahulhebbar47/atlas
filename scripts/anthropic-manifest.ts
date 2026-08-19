/**
 * ATLAS — AEI (Anthropic Economic Index) source-file manifest, shared by
 * fetch-anthropic-data.ts (download + verify) and transform-anthropic-data.ts
 * (re-verify before consuming).
 *
 * The dataset is pinned to a specific Hugging Face repo commit; every file's
 * sha256 was verified against the repo's LFS manifest at pin time (survey,
 * 2026-08-03). A hash mismatch at fetch or transform time is a hard error —
 * the pipeline never consumes unverified bytes.
 *
 * License: data CC-BY 4.0, code MIT (per release_2026_06_26/data_documentation.md).
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const AEI_DATASET_REPO = 'Anthropic/EconomicIndex';

/** The pinned dataset revision (repo main at pin time; nothing newer than V6 exists). */
export const AEI_SOURCE_COMMIT_SHA = '2ea58ff75e4247d26810c37f10c179edc2466cac';

export const AEI_RELEASE_ID = 'release_2026_06_26';

/** Raw downloads live OUTSIDE git (77–219 MB per file; .gitignore carries this path). */
export const AEI_CACHE_DIR = path.resolve(__dirname, '../.anthropic-cache');

export const AEI_LICENSE = 'Data: CC-BY 4.0; code: MIT';

export interface AeiSourceFile {
  /** Repo-relative path (mirrored under the cache directory). */
  path: string;
  bytes: number;
  sha256: string;
}

export const AEI_SOURCE_FILES: readonly AeiSourceFile[] = [
  {
    path: 'release_2026_06_26/data/aei_1p_api_2026-06-26.csv',
    bytes: 77282477,
    sha256: '62197f003e001945ad130c2f26f5e07f3fda45ff41644df91444b04fd524a19f',
  },
  {
    path: 'release_2026_06_26/data/aei_claude_ai_2026-06-26.csv',
    bytes: 219174671,
    sha256: 'f974b358bce0e5a8417510c61da4342234cd0de9d9d0b62acf4c6dbcf8ec7b68',
  },
  {
    path: 'release_2026_06_26/data_documentation.md',
    bytes: 7397,
    sha256: '1a01eeb7d34250b192aa9c906098bea1db971644e6bdb04497d87b7a4ed141a5',
  },
  {
    path: 'labor_market_impacts/job_exposure.csv',
    bytes: 37176,
    sha256: '4f0a3adf5feeb2ec5f5d02ab18cc5e851a2a4b8470bde84c0c9335017be12d68',
  },
  {
    path: 'labor_market_impacts/task_penetration.csv',
    bytes: 1889822,
    sha256: '85bee872db1d55d3e9a7f4e89da5ae4a5d59aa8ec875d728fbf4b7d820984616',
  },
];

export function resolveUrl(filePath: string): string {
  return `https://huggingface.co/datasets/${AEI_DATASET_REPO}/resolve/${AEI_SOURCE_COMMIT_SHA}/${filePath}`;
}

export function cachePath(filePath: string): string {
  return path.join(AEI_CACHE_DIR, filePath);
}
