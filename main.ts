// LEONIDA LEDGER — hand-in program for the gta6-trophy-guide-01 bounty (Node 22, standard library only).
//
// The guide itself is the static web app in app/ (open app/index.html in a browser; it runs fully offline).
// This program's one job is to hand that app in the way the bounty asks: copy app/ and screenshots/ into the
// output directory, then write dossier.json — the pack the judge reads — with the kit's own dossier builder.
// vendor/makefun-frontend.ts is the kit's library and must stay byte-identical: the scorer rebuilds the
// dossier with its own copy and compares the two byte for byte.
//
// Run it outside the grader like this (MAKEFUN_OUTPUT_DIR stands in for /output):
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The app's static files, exactly as they sit in the repository.
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

// The screenshots the maker took of the running app; the first by name is the cover.
const shotsDir = join(repoRoot, 'screenshots');
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// The dossier, under the scorer's own caps: at most 4 screenshots of at most 256 KiB each, at most 993
// files and directories and 48 MiB in app/, and 160 KiB of source text in the dossier's text block.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);

// A one-line receipt for anyone running this outside the grader: what was handed in, and how big
// the dossier came out. The grader ignores stdout; the maker should not have to guess.
const shotCount = readdirSync(join(outputDir, 'screenshots')).length;
const dossierBytes = statSync(join(outputDir, 'dossier.json')).size;
console.log(`LEONIDA LEDGER handed in: app/ + ${shotCount} screenshots -> dossier.json (${dossierBytes} bytes)`);
