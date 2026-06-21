/**
 * Server-side helpers for the airline logo approval workflow.
 *
 * Storage backend (first match wins):
 *   - Vercel Blob when BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN is set.
 *   - Local files under data/airline-logos/ for dev without Blob.
 *
 * Logo editing is enabled when Blob is configured (prod + local with env pull)
 * or when ALLOW_LOGO_EDITS=1 / NODE_ENV=development.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { LOGO_BRAND_ICAO_LIST, getLogoBrandByIcao } from './airlines';
import {
  canUseLogoBlobStore,
  clearBlobCarrier,
  deleteBlobCandidate,
  listBlobCandidates,
  promoteBlobCandidate,
  readBlobManifest,
  removeBlobApproved,
  uploadBlobApproved,
  uploadBlobCandidate,
} from './logoBlobStore';

const DATA_DIR = path.join(process.cwd(), 'data', 'airline-logos');
const CANDIDATES_DIR = path.join(DATA_DIR, '_candidates');
const APPROVED_JSON = path.join(DATA_DIR, 'approved.json');

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
const ALLOWED_EXT = new Set(['png', 'svg', 'jpg', 'jpeg', 'webp', 'gif']);
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;

export type ApprovedEntry = {
  url?: string;
  file?: string;
  source?: string;
  approvedAt: string;
};

export type CandidateAsset = { file: string; url: string };

export type LogoCatalogEntry = {
  icao: string;
  name: string;
  iata: string;
  candidates: CandidateAsset[];
  approved: (CandidateAsset & { source?: string; approvedAt?: string }) | null;
};

const LOGO_EDITING_ENABLED =
  canUseLogoBlobStore() ||
  process.env.ALLOW_LOGO_EDITS === '1' ||
  process.env.NODE_ENV === 'development';

function assertEditable(): void {
  if (LOGO_EDITING_ENABLED) return;
  throw new Error(
    'Logo editing requires Vercel Blob (BLOB_READ_WRITE_TOKEN) or local dev. ' +
      'Run vercel env pull locally or set ALLOW_LOGO_EDITS=1 on a writable host.'
  );
}

export function isKnownIcao(icao: string): boolean {
  return LOGO_BRAND_ICAO_LIST.includes(icao);
}

function normalizeIcao(raw: string): string {
  return String(raw ?? '').trim().toUpperCase();
}

function useBlob(): boolean {
  return canUseLogoBlobStore();
}

async function ensureLocalDirs(): Promise<void> {
  await fs.mkdir(CANDIDATES_DIR, { recursive: true });
}

async function readLocalApproved(): Promise<Record<string, ApprovedEntry>> {
  try {
    const raw = await fs.readFile(APPROVED_JSON, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw err;
  }
}

async function writeLocalApproved(map: Record<string, ApprovedEntry>): Promise<void> {
  await ensureLocalDirs();
  await fs.writeFile(APPROVED_JSON, JSON.stringify(map, null, 2) + '\n', 'utf8');
}

async function readApproved(): Promise<Record<string, ApprovedEntry>> {
  if (useBlob()) return await readBlobManifest();
  return await readLocalApproved();
}

async function localAssetUrl(absPath: string, publicPath: string): Promise<string> {
  try {
    const stat = await fs.stat(absPath);
    return `${publicPath}?v=${Math.floor(stat.mtimeMs)}`;
  } catch {
    return publicPath;
  }
}

function localApprovedAssetUrl(entry: ApprovedEntry): string {
  if (entry.url) return entry.url;
  if (!entry.file) return '';
  const suffix = entry.approvedAt
    ? `?v=${Date.parse(entry.approvedAt)}`
    : entry.source?.match(/(\d{10,})/)
      ? `?v=${entry.source.match(/(\d{10,})/)![1]}`
      : '';
  return `/api/airline-logos/asset/${entry.file}${suffix}`;
}

/** Reject anything that isn't a plain in-directory basename for this carrier. */
function safeCandidatePath(icao: string, file: string): string {
  const base = path.basename(file);
  if (base !== file) throw new Error('Invalid file name');
  if (!base.startsWith(`${icao}-`) && !base.startsWith(`${icao}.`)) {
    throw new Error('File does not belong to this carrier');
  }
  const ext = path.extname(base).slice(1).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) throw new Error('Unsupported file type');
  const resolved = path.join(CANDIDATES_DIR, base);
  if (path.dirname(resolved) !== CANDIDATES_DIR) throw new Error('Invalid path');
  return resolved;
}

async function listLocalCandidates(icao: string): Promise<CandidateAsset[]> {
  let entries: string[] = [];
  try {
    entries = await fs.readdir(CANDIDATES_DIR);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
  const matches = entries
    .filter((name) => name.startsWith(`${icao}-`))
    .filter((name) => ALLOWED_EXT.has(path.extname(name).slice(1).toLowerCase()))
    .sort();
  const assets: CandidateAsset[] = [];
  for (const file of matches) {
    const url = await localAssetUrl(
      path.join(CANDIDATES_DIR, file),
      `/api/airline-logos/asset/_candidates/${file}`
    );
    assets.push({ file, url });
  }
  return assets;
}

export async function getApprovedManifest(): Promise<Record<string, ApprovedEntry>> {
  return await readApproved();
}

export async function getCatalog(): Promise<LogoCatalogEntry[]> {
  const approved = await readApproved();
  const out: LogoCatalogEntry[] = [];

  for (const icao of LOGO_BRAND_ICAO_LIST) {
    const brand = getLogoBrandByIcao(icao);
    if (!brand) continue;

    const candidates = useBlob()
      ? await listBlobCandidates(icao)
      : await listLocalCandidates(icao);

    let approvedAsset: LogoCatalogEntry['approved'] = null;
    const entry = approved[icao];
    if (entry) {
      let url: string | undefined;
      if (entry.file) {
        url = useBlob()
          ? localApprovedAssetUrl(entry)
          : await localAssetUrl(
              path.join(DATA_DIR, entry.file),
              `/api/airline-logos/asset/${entry.file}`
            );
      } else if (entry.url) {
        url = entry.url;
      }
      if (url) {
        approvedAsset = {
          file: entry.file ?? `${icao}.png`,
          url,
          source: entry.source,
          approvedAt: entry.approvedAt,
        };
      }
    }

    out.push({
      icao,
      name: brand.name,
      iata: brand.iata,
      candidates,
      approved: approvedAsset,
    });
  }
  return out;
}

function parseDataUrl(dataUrl: string): { mime: string; buffer: Buffer; ext: string } {
  const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(dataUrl ?? '');
  if (!match) throw new Error('Expected a base64 data URL');
  const mime = match[1].toLowerCase();
  const ext = EXT_BY_MIME[mime];
  if (!ext) throw new Error(`Unsupported image type: ${mime}`);

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.byteLength === 0) throw new Error('Empty file');
  if (buffer.byteLength > MAX_UPLOAD_BYTES) throw new Error('File too large (max 3MB)');

  return { mime, buffer, ext };
}

/** Save an uploaded image as a new candidate. Returns the stored file name. */
export async function saveUpload(rawIcao: string, dataUrl: string): Promise<string> {
  assertEditable();
  const icao = normalizeIcao(rawIcao);
  if (!isKnownIcao(icao)) throw new Error(`Unknown carrier: ${icao}`);

  const { mime, buffer, ext } = parseDataUrl(dataUrl);
  const file = `${icao}-up${Date.now()}.${ext}`;

  if (useBlob()) {
    await uploadBlobCandidate(icao, file, buffer, mime);
    return file;
  }

  await ensureLocalDirs();
  await fs.writeFile(path.join(CANDIDATES_DIR, file), buffer);
  return file;
}

/** Promote a candidate to the approved logo for a carrier. */
export async function approveCandidate(
  rawIcao: string,
  candidateFile: string
): Promise<LogoCatalogEntry['approved']> {
  assertEditable();
  const icao = normalizeIcao(rawIcao);
  if (!isKnownIcao(icao)) throw new Error(`Unknown carrier: ${icao}`);

  if (useBlob()) {
    const entry = await promoteBlobCandidate(icao, candidateFile);
    return {
      file: entry.file ?? `${icao}.png`,
      url: localApprovedAssetUrl(entry),
      source: entry.source,
      approvedAt: entry.approvedAt,
    };
  }

  const srcPath = safeCandidatePath(icao, candidateFile);
  await fs.access(srcPath);

  const ext = path.extname(candidateFile).slice(1).toLowerCase();
  const approvedFile = `${icao}.${ext}`;
  const approved = await readLocalApproved();

  const prior = approved[icao];
  if (prior?.file && prior.file !== approvedFile) {
    await fs.rm(path.join(DATA_DIR, prior.file), { force: true });
  }

  await fs.copyFile(srcPath, path.join(DATA_DIR, approvedFile));
  const approvedAt = new Date().toISOString();
  const localEntry: ApprovedEntry = {
    file: approvedFile,
    source: candidateFile,
    approvedAt,
  };
  approved[icao] = localEntry;
  await writeLocalApproved(approved);

  const url = await localAssetUrl(
    path.join(DATA_DIR, approvedFile),
    `/api/airline-logos/asset/${approvedFile}`
  );
  return { file: approvedFile, url, source: candidateFile, approvedAt };
}

export async function unapprove(rawIcao: string): Promise<void> {
  assertEditable();
  const icao = normalizeIcao(rawIcao);
  if (!isKnownIcao(icao)) throw new Error(`Unknown carrier: ${icao}`);

  if (useBlob()) {
    await removeBlobApproved(icao);
    return;
  }

  const approved = await readLocalApproved();
  const entry = approved[icao];
  if (entry?.file) {
    await fs.rm(path.join(DATA_DIR, entry.file), { force: true });
    delete approved[icao];
    await writeLocalApproved(approved);
  }
}

export async function deleteCandidate(rawIcao: string, candidateFile: string): Promise<void> {
  assertEditable();
  const icao = normalizeIcao(rawIcao);
  if (!isKnownIcao(icao)) throw new Error(`Unknown carrier: ${icao}`);

  if (useBlob()) {
    await deleteBlobCandidate(candidateFile);
    return;
  }

  const target = safeCandidatePath(icao, candidateFile);
  await fs.rm(target, { force: true });
}

/** Full reset for a carrier — wipe every candidate and the approved logo. */
export async function clearCarrier(rawIcao: string): Promise<void> {
  assertEditable();
  const icao = normalizeIcao(rawIcao);
  if (!isKnownIcao(icao)) throw new Error(`Unknown carrier: ${icao}`);

  if (useBlob()) {
    await clearBlobCarrier(icao);
    return;
  }

  const candidates = await listLocalCandidates(icao);
  for (const candidate of candidates) {
    await fs.rm(path.join(CANDIDATES_DIR, candidate.file), { force: true });
  }
  await unapprove(icao);
}

/** Paste-to-approved shortcut — skips the candidate queue. */
export async function approveUpload(
  rawIcao: string,
  dataUrl: string
): Promise<LogoCatalogEntry['approved']> {
  assertEditable();
  const icao = normalizeIcao(rawIcao);
  if (!isKnownIcao(icao)) throw new Error(`Unknown carrier: ${icao}`);

  const { mime, buffer, ext } = parseDataUrl(dataUrl);

  if (useBlob()) {
    const entry = await uploadBlobApproved(icao, buffer, mime, ext);
    return {
      file: entry.file ?? `${icao}.${ext}`,
      url: localApprovedAssetUrl(entry),
      approvedAt: entry.approvedAt,
    };
  }

  await ensureLocalDirs();
  const approvedFile = `${icao}.${ext}`;
  const approved = await readLocalApproved();
  const prior = approved[icao];
  if (prior?.file && prior.file !== approvedFile) {
    await fs.rm(path.join(DATA_DIR, prior.file), { force: true });
  }

  await fs.writeFile(path.join(DATA_DIR, approvedFile), buffer);
  const approvedAt = new Date().toISOString();
  const localEntry: ApprovedEntry = { file: approvedFile, approvedAt };
  approved[icao] = localEntry;
  await writeLocalApproved(approved);

  const url = await localAssetUrl(
    path.join(DATA_DIR, approvedFile),
    `/api/airline-logos/asset/${approvedFile}`
  );
  return { file: approvedFile, url, approvedAt };
}
