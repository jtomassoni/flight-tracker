#!/usr/bin/env node
/**
 * Wipe all airline logo blobs and reset the manifest to {}.
 * Usage: node scripts/clear-logo-blob.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Load .env.local when present (Next.js does this automatically; scripts do not).
try {
  const envPath = join(root, '.env.local');
  const env = readFileSync(envPath, 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
  }
} catch {
  // No local env file — rely on process env.
}

if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN required.');
  process.exit(1);
}

// Resolve compiled path via tsx or use dynamic import through next — use @vercel/blob directly.
const { del, list, put } = await import('@vercel/blob');

const MANIFEST_PATH = 'airline-logos/approved.json';
const PREFIX = 'airline-logos/';

let deleted = 0;
let cursor;

do {
  const result = await list({ prefix: PREFIX, cursor });
  for (const blob of result.blobs) {
    if (blob.pathname === MANIFEST_PATH) continue;
    await del(blob.url);
    deleted += 1;
    console.log('deleted', blob.pathname);
  }
  cursor = result.hasMore ? result.cursor : undefined;
} while (cursor);

await put(MANIFEST_PATH, '{}\n', {
  access: 'private',
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: 'application/json',
});

console.log(`[clear-logo-blob] removed ${deleted} blob(s), manifest reset`);
