// GTA VI trophy guide entry: a static, offline web app in app/ (index.html,
// style.css, app.js and data/trophies.json — no build step, no network at run
// time) plus screenshots/ of that app. This program is the handover: it copies
// both folders from beside this file into the output directory and writes
// dossier.json there with the vendored make.fun library, which is what the
// judge reads. vendor/makefun-frontend.ts stays untouched, so the dossier the
// scorer rebuilds matches this one byte for byte.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// and serve the app locally with `node serve.ts` (http://localhost:8080).

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Caps from the scorer: at most 4 screenshots of 256 KiB each, at most 993
// files / 48 MiB under app/, and the judge-view text capped at 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
