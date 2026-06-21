import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

await esbuild.build({
  entryPoints: [join(root, 'lib/legacyLedWallRuntime.ts')],
  outfile: join(root, 'public/legacy-led-wall.js'),
  bundle: true,
  format: 'iife',
  globalName: 'LegacyLedWall',
  platform: 'browser',
  target: ['es2017'],
  tsconfig: join(root, 'tsconfig.json'),
  logLevel: 'info',
});

const version = Date.now().toString(36);
const htmlPath = join(root, 'public/legacy-display.html');
const html = readFileSync(htmlPath, 'utf8');
const stamped = html.replace(
  /(\/(?:legacy-(?:display-shared|led-wall|led-display|display-boot|fids-board))\.js)(\?v=[^"']*)?/g,
  `$1?v=${version}`
);
writeFileSync(htmlPath, stamped);
console.log(`[build:legacy-led] cache-bust v=${version}`);
