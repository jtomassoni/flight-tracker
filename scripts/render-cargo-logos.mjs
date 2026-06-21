#!/usr/bin/env node
/**
 * Render cargo logo SVGs to approved PNGs (1254×1254, matching existing assets).
 * Usage: node scripts/render-cargo-logos.mjs [ICAO...]
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcesDir = join(root, 'assets/logo-sources');
const logosDir = join(root, 'data/airline-logos');
const candidatesDir = join(logosDir, '_candidates');
const size = 1254;

const DEFAULT_ICAOS = ['FDX', 'UPS', 'GTI', 'ABX', 'DHK'];
const icaos = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_ICAOS;

mkdirSync(candidatesDir, { recursive: true });

for (const icao of icaos) {
  const svgPath = join(sourcesDir, `${icao}.svg`);
  if (!existsSync(svgPath)) {
    console.error(`Missing SVG: ${svgPath}`);
    process.exitCode = 1;
    continue;
  }
  const stamp = Date.now();
  const candidate = join(candidatesDir, `${icao}-gen${stamp}.png`);
  const approved = join(logosDir, `${icao}.png`);

  execFileSync('rsvg-convert', ['-w', String(size), '-h', String(size), '-o', candidate, svgPath], {
    stdio: 'inherit',
  });
  copyFileSync(candidate, approved);
  console.log(`[render-cargo-logos] ${icao} → ${approved}`);
}
