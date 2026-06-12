import * as esbuild from 'esbuild';
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
