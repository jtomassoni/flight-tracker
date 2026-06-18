/**
 * Server-side helpers for the airline logo approval workflow.
 *
 * Layout under `public/airline-logos/`:
 *   _candidates/{ICAO}-*.{png,svg,...}  raw options (fetch script + uploads)
 *   {ICAO}.{ext}                        the approved logo (source of truth)
 *   approved.json                       record of approvals
 *
 * NOTE: filesystem writes here are intended for the local/home admin tool only.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { LOGO_BRAND_ICAO_LIST, getLogoBrandByIcao } from './airlines';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const LOGOS_DIR = path.join(PUBLIC_DIR, 'airline-logos');
const CANDIDATES_DIR = path.join(LOGOS_DIR, '_candidates');
const APPROVED_JSON = path.join(LOGOS_DIR, 'approved.json');

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
  file: string;
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

/**
 * The approval tool mutates files under `public/`, which only works on a
 * writable disk (i.e. local dev). On serverless hosts like Vercel the bundle
 * lives on a read-only filesystem (`EROFS`), so editing is disabled there and
 * approved logos ship as committed static assets instead. Set
 * `ALLOW_LOGO_EDITS=1` to force-enable (e.g. a self-hosted writable deploy).
 */
const LOGO_EDITING_ENABLED =
  process.env.ALLOW_LOGO_EDITS === '1' || process.env.NODE_ENV === 'development';

function assertEditable(): void {
  if (LOGO_EDITING_ENABLED) return;
  throw new Error(
    'Logo editing is only available when running locally. Approved logos are ' +
      'committed to the repo and deployed as static files — paste/approve a ' +
      'logo on your machine, then commit and deploy.'
  );
}

export function isKnownIcao(icao: string): boolean {
  return LOGO_BRAND_ICAO_LIST.includes(icao);
}

function normalizeIcao(raw: string): string {
  return String(raw ?? '').trim().toUpperCase();
}

async function ensureDirs(): Promise<void> {
  try {
    await fs.mkdir(CANDIDATES_DIR, { recursive: true });
  } catch (err) {
    // Read-only deploy (e.g. Vercel): the dir is part of the committed bundle,
    // so reads still work. Only surface the error if writes will actually run.
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'EROFS' || code === 'EACCES' || code === 'EEXIST') return;
    throw err;
  }
}

async function readApproved(): Promise<Record<string, ApprovedEntry>> {
  try {
    const raw = await fs.readFile(APPROVED_JSON, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw err;
  }
}

async function writeApproved(map: Record<string, ApprovedEntry>): Promise<void> {
  await ensureDirs();
  await fs.writeFile(APPROVED_JSON, JSON.stringify(map, null, 2) + '\n', 'utf8');
}

async function urlWithVersion(absPath: string, publicPath: string): Promise<string> {
  try {
    const stat = await fs.stat(absPath);
    return `${publicPath}?v=${Math.floor(stat.mtimeMs)}`;
  } catch {
    return publicPath;
  }
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

async function listCandidates(icao: string): Promise<CandidateAsset[]> {
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
    const url = await urlWithVersion(
      path.join(CANDIDATES_DIR, file),
      `/airline-logos/_candidates/${file}`
    );
    assets.push({ file, url });
  }
  return assets;
}

export async function getCatalog(): Promise<LogoCatalogEntry[]> {
  await ensureDirs();
  const approved = await readApproved();
  const out: LogoCatalogEntry[] = [];

  for (const icao of LOGO_BRAND_ICAO_LIST) {
    const brand = getLogoBrandByIcao(icao);
    if (!brand) continue;
    const candidates = await listCandidates(icao);

    let approvedAsset: LogoCatalogEntry['approved'] = null;
    const entry = approved[icao];
    if (entry) {
      const abs = path.join(LOGOS_DIR, entry.file);
      const url = await urlWithVersion(abs, `/airline-logos/${entry.file}`);
      approvedAsset = {
        file: entry.file,
        url,
        source: entry.source,
        approvedAt: entry.approvedAt,
      };
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

/** Save an uploaded image as a new candidate. Returns the stored file name. */
export async function saveUpload(
  rawIcao: string,
  dataUrl: string
): Promise<string> {
  assertEditable();
  const icao = normalizeIcao(rawIcao);
  if (!isKnownIcao(icao)) throw new Error(`Unknown carrier: ${icao}`);

  const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(dataUrl ?? '');
  if (!match) throw new Error('Expected a base64 data URL');
  const mime = match[1].toLowerCase();
  const ext = EXT_BY_MIME[mime];
  if (!ext) throw new Error(`Unsupported image type: ${mime}`);

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.byteLength === 0) throw new Error('Empty file');
  if (buffer.byteLength > MAX_UPLOAD_BYTES) throw new Error('File too large (max 3MB)');

  await ensureDirs();
  const file = `${icao}-up${Date.now()}.${ext}`;
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

  const srcPath = safeCandidatePath(icao, candidateFile);
  await fs.access(srcPath); // throws if missing

  const ext = path.extname(candidateFile).slice(1).toLowerCase();
  const approvedFile = `${icao}.${ext}`;

  const approved = await readApproved();
  // Remove any prior approved file with a different extension.
  const prior = approved[icao];
  if (prior && prior.file !== approvedFile) {
    await fs.rm(path.join(LOGOS_DIR, prior.file), { force: true });
  }

  await fs.copyFile(srcPath, path.join(LOGOS_DIR, approvedFile));
  const approvedAt = new Date().toISOString();
  approved[icao] = { file: approvedFile, source: candidateFile, approvedAt };
  await writeApproved(approved);

  const url = await urlWithVersion(
    path.join(LOGOS_DIR, approvedFile),
    `/airline-logos/${approvedFile}`
  );
  return { file: approvedFile, url, source: candidateFile, approvedAt };
}

export async function unapprove(rawIcao: string): Promise<void> {
  assertEditable();
  const icao = normalizeIcao(rawIcao);
  if (!isKnownIcao(icao)) throw new Error(`Unknown carrier: ${icao}`);
  const approved = await readApproved();
  const entry = approved[icao];
  if (entry) {
    await fs.rm(path.join(LOGOS_DIR, entry.file), { force: true });
    delete approved[icao];
    await writeApproved(approved);
  }
}

export async function deleteCandidate(
  rawIcao: string,
  candidateFile: string
): Promise<void> {
  assertEditable();
  const icao = normalizeIcao(rawIcao);
  if (!isKnownIcao(icao)) throw new Error(`Unknown carrier: ${icao}`);
  const target = safeCandidatePath(icao, candidateFile);
  await fs.rm(target, { force: true });
}

/** Full reset for a carrier — wipe every candidate and the approved logo. */
export async function clearCarrier(rawIcao: string): Promise<void> {
  assertEditable();
  const icao = normalizeIcao(rawIcao);
  if (!isKnownIcao(icao)) throw new Error(`Unknown carrier: ${icao}`);

  const candidates = await listCandidates(icao);
  for (const candidate of candidates) {
    await fs.rm(path.join(CANDIDATES_DIR, candidate.file), { force: true });
  }

  await unapprove(icao);
}
