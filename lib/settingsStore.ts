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

export type StoredSettingsRecord = {
  settings: DisplaySettings;
  savedAt: number;
};

const SETTINGS_PATH = 'settings/display.json';
const SETTINGS_FILE =
  process.env.SETTINGS_FILE || path.join(process.cwd(), 'data', 'settings.json');

function canUseBlobStore(): boolean {
  return !!(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}

function parseStoredRecord(raw: unknown): StoredSettingsRecord | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as {
    settings?: Partial<DisplaySettings>;
    savedAt?: number;
  } & Partial<DisplaySettings>;

  if (record.settings && typeof record.settings === 'object') {
    return {
      settings: normalizeSettings(record.settings),
      savedAt:
        typeof record.savedAt === 'number' && Number.isFinite(record.savedAt)
          ? record.savedAt
          : 0,
    };
  }

  return {
    settings: normalizeSettings(record as Partial<DisplaySettings>),
    savedAt: 0,
  };
}

async function readBlobSettings(): Promise<StoredSettingsRecord | null> {
  const result = await get(SETTINGS_PATH, { access: 'private' });
  if (!result?.stream) return null;

  const raw = await new Response(result.stream).text();
  return parseStoredRecord(JSON.parse(raw) as unknown);
}

async function writeBlobSettings(record: StoredSettingsRecord): Promise<void> {
  await put(SETTINGS_PATH, JSON.stringify(record), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

export async function readStoredSettings(): Promise<StoredSettingsRecord | null> {
  if (canUseBlobStore()) {
    try {
      return await readBlobSettings();
    } catch {
      return null;
    }
  }

  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf8');
    return parseStoredRecord(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export async function writeStoredSettings(input: unknown): Promise<StoredSettingsRecord> {
  const parsed =
    input && typeof input === 'object'
      ? (input as { settings?: unknown; savedAt?: number } & Partial<DisplaySettings>)
      : null;

  const settings = normalizeSettings(
    parsed?.settings && typeof parsed.settings === 'object'
      ? (parsed.settings as Partial<DisplaySettings>)
      : (parsed as Partial<DisplaySettings> | null)
  );
  const savedAt =
    typeof parsed?.savedAt === 'number' && Number.isFinite(parsed.savedAt)
      ? parsed.savedAt
      : Date.now();
  const record: StoredSettingsRecord = { settings, savedAt };

  if (canUseBlobStore()) {
    await writeBlobSettings(record);
    return record;
  }

  await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  await fs.writeFile(SETTINGS_FILE, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  return record;
}
