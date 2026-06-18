/**
 * Server-side persistence for display settings.
 *
 * Settings are stored in one shared place so every device that opens the site
 * loads the same saved configuration (localStorage alone is per-device).
 *
 * Storage backend (first match wins):
 *   - Vercel Blob (private) when BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN is set.
 *     On Vercel this uses OIDC + BLOB_STORE_ID; locally use `vercel env pull`.
 *   - A local JSON file (data/settings.json) for dev with no Blob configured.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { get, put } from '@vercel/blob';
import { normalizeSettings, type DisplaySettings } from './settings';

const SETTINGS_PATH = 'settings/display.json';
const SETTINGS_FILE =
  process.env.SETTINGS_FILE || path.join(process.cwd(), 'data', 'settings.json');

function canUseBlobStore(): boolean {
  return !!(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}

async function readBlobSettings(): Promise<DisplaySettings | null> {
  const result = await get(SETTINGS_PATH, { access: 'private' });
  if (!result?.stream) return null;

  const raw = await new Response(result.stream).text();
  return normalizeSettings(JSON.parse(raw) as Partial<DisplaySettings>);
}

async function writeBlobSettings(settings: DisplaySettings): Promise<void> {
  await put(SETTINGS_PATH, JSON.stringify(settings), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

export async function readStoredSettings(): Promise<DisplaySettings | null> {
  if (canUseBlobStore()) {
    try {
      return await readBlobSettings();
    } catch {
      return null;
    }
  }

  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf8');
    return normalizeSettings(JSON.parse(raw) as Partial<DisplaySettings>);
  } catch {
    return null;
  }
}

export async function writeStoredSettings(input: unknown): Promise<DisplaySettings> {
  const normalized = normalizeSettings(input as Partial<DisplaySettings> | null);

  if (canUseBlobStore()) {
    await writeBlobSettings(normalized);
    return normalized;
  }

  await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  await fs.writeFile(SETTINGS_FILE, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  return normalized;
}
