// Twin Stars — the hand-in program (Node 22, standard library only).
//
// The game itself is plain static files under game/: an index.html that opens in a
// desktop browser and plays offline, with its ES modules under game/src/. The
// screenshots under screenshots/ are real renders of that code, staged through
// ?shot=start|play|play2|win. This program copies both folders into the output
// directory and writes the dossier the judge reads, built by the vendored
// make.fun library from the files as they are.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader the output directory is /output.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: only text_max_bytes shapes the dossier's bytes; the
// others refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files in game/ or 48 MiB of game files in all, or
// a path under game/ over 1000 bytes).
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);

// A short report on stdout, so a local run shows what was handed in.
const shotNames = existsSync(join(out, 'screenshots')) ? readdirSync(join(out, 'screenshots')) : [];
const shotBytes = shotNames.reduce((sum, name) => sum + statSync(join(out, 'screenshots', name)).size, 0);
console.log(
  `Twin Stars handed in: game/ + ${shotNames.length} screenshots (${shotBytes} bytes) + dossier.json (${dossier.length} bytes) -> ${out}`,
);
