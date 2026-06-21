/**
 * Vercel Blob persistence for approved airline logos.
 *
 * All blobs use private access (matches the store configuration).
 * Images are served via /api/airline-logos/asset/, not direct blob URLs.
 *
 * Manifest:   airline-logos/approved.json
 * Approved:   airline-logos/{ICAO}.{ext}
 * Candidates: airline-logos/_candidates/{ICAO}-*.{ext}
 */
import { del, get, list, put } from '@vercel/blob';

export const LOGO_MANIFEST_PATH = 'airline-logos/approved.json';
const LOGO_PREFIX = 'airline-logos/';
const CANDIDATES_PREFIX = 'airline-logos/_candidates/';

export type ApprovedLogoEntry = {
  url?: string;
  file?: string;
  source?: string;
  approvedAt: string;
};

function candidateAssetUrl(file: string): string {
  return `/api/airline-logos/asset/_candidates/${file}`;
}

export function safeLogoBlobPath(segments: string[]): string | null {
  if (segments.length === 1) {
    const file = segments[0].split('/').pop() ?? '';
    if (!/^[A-Z0-9]{2,4}\.[a-z0-9]+$/i.test(file)) return null;
    return `${LOGO_PREFIX}${file}`;
  }
  if (segments.length === 2 && segments[0] === '_candidates') {
    const file = segments[1].split('/').pop() ?? '';
    if (!/^[A-Z0-9]{2,4}-[\w.-]+\.[a-z0-9]+$/i.test(file)) return null;
    return `${CANDIDATES_PREFIX}${file}`;
  }
  return null;
}

const MIME_BY_EXT: Record<string, string> = {
  png: 'image/png',
  svg: 'image/svg+xml',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

export async function readBlobLogoAsset(
  blobPath: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const result = await get(blobPath, { access: 'private' });
  if (!result?.stream) return null;

  const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
  const contentType =
    result.blob.contentType ??
    MIME_BY_EXT[blobPath.split('.').pop()?.toLowerCase() ?? ''] ??
    'application/octet-stream';
  return { buffer, contentType };
}

export function canUseLogoBlobStore(): boolean {
  return !!(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}

export async function readBlobManifest(): Promise<Record<string, ApprovedLogoEntry>> {
  const result = await get(LOGO_MANIFEST_PATH, { access: 'private' });
  if (!result?.stream) return {};

  const raw = await new Response(result.stream).text();
  const parsed = JSON.parse(raw) as Record<string, ApprovedLogoEntry>;
  return parsed && typeof parsed === 'object' ? parsed : {};
}

export async function writeBlobManifest(
  map: Record<string, ApprovedLogoEntry>
): Promise<void> {
  await put(LOGO_MANIFEST_PATH, JSON.stringify(map, null, 2) + '\n', {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

export async function listBlobCandidates(icao: string): Promise<{ file: string; url: string }[]> {
  const { blobs } = await list({ prefix: `${CANDIDATES_PREFIX}${icao}-` });
  return blobs
    .map((blob) => {
      const file = blob.pathname.replace(CANDIDATES_PREFIX, '');
      return file ? { file, url: candidateAssetUrl(file) } : null;
    })
    .filter((entry): entry is { file: string; url: string } => entry !== null)
    .sort((a, b) => a.file.localeCompare(b.file));
}

export async function uploadBlobCandidate(
  icao: string,
  file: string,
  buffer: Buffer,
  contentType: string
): Promise<{ file: string; url: string }> {
  const path = `${CANDIDATES_PREFIX}${file}`;
  await put(path, buffer, {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
  });
  return { file, url: candidateAssetUrl(file) };
}

export async function deleteBlobCandidate(candidateFile: string): Promise<void> {
  await del(`${CANDIDATES_PREFIX}${candidateFile}`);
}

export async function promoteBlobCandidate(
  icao: string,
  candidateFile: string
): Promise<ApprovedLogoEntry> {
  const candidates = await listBlobCandidates(icao);
  const match = candidates.find((c) => c.file === candidateFile);
  if (!match) throw new Error('Candidate not found');

  const ext = candidateFile.includes('.') ? candidateFile.split('.').pop()!.toLowerCase() : 'png';
  const approvedFile = `${icao}.${ext}`;
  const approvedPath = `${LOGO_PREFIX}${approvedFile}`;

  const candidatePath = `${CANDIDATES_PREFIX}${candidateFile}`;
  const candidate = await readBlobLogoAsset(candidatePath);
  if (!candidate) throw new Error('Failed to read candidate image');

  await put(approvedPath, candidate.buffer, {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: candidate.contentType,
  });

  const approvedAt = new Date().toISOString();
  const entry: ApprovedLogoEntry = {
    file: approvedFile,
    source: candidateFile,
    approvedAt,
  };

  const manifest = await readBlobManifest();
  manifest[icao] = entry;
  await writeBlobManifest(manifest);

  try {
    await deleteBlobCandidate(candidateFile);
  } catch {
    // Non-fatal — approved logo is already live.
  }

  return entry;
}

export async function uploadBlobApproved(
  icao: string,
  buffer: Buffer,
  contentType: string,
  ext: string,
  source?: string
): Promise<ApprovedLogoEntry> {
  const approvedFile = `${icao}.${ext}`;
  await put(`${LOGO_PREFIX}${approvedFile}`, buffer, {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
  });

  const entry: ApprovedLogoEntry = {
    file: approvedFile,
    source,
    approvedAt: new Date().toISOString(),
  };

  const manifest = await readBlobManifest();
  manifest[icao] = entry;
  await writeBlobManifest(manifest);
  return entry;
}

export async function removeBlobApproved(icao: string): Promise<void> {
  const manifest = await readBlobManifest();
  const entry = manifest[icao];
  if (!entry) return;

  if (entry.file) {
    try {
      await del(`${LOGO_PREFIX}${entry.file}`);
    } catch {
      // Ignore missing blob.
    }
  }

  delete manifest[icao];
  await writeBlobManifest(manifest);
}

export async function clearBlobCarrier(icao: string): Promise<void> {
  const candidates = await listBlobCandidates(icao);
  for (const candidate of candidates) {
    try {
      await deleteBlobCandidate(candidate.file);
    } catch {
      // Continue clearing remaining candidates.
    }
  }
  await removeBlobApproved(icao);
}

/** Delete every logo blob and reset the manifest to empty. */
export async function purgeAllBlobLogos(): Promise<{ deleted: number }> {
  let deleted = 0;
  let cursor: string | undefined;

  do {
    const result = await list({ prefix: LOGO_PREFIX, cursor });
    for (const blob of result.blobs) {
      if (blob.pathname === LOGO_MANIFEST_PATH) continue;
      try {
        await del(blob.url);
        deleted += 1;
      } catch {
        // Continue purging remaining blobs.
      }
    }
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);

  await writeBlobManifest({});
  return { deleted };
}
