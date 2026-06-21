import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { canUseLogoBlobStore, readBlobLogoAsset, safeLogoBlobPath } from '@/lib/logoBlobStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'data', 'airline-logos');
const CANDIDATES_DIR = path.join(DATA_DIR, '_candidates');

const MIME_BY_EXT: Record<string, string> = {
  png: 'image/png',
  svg: 'image/svg+xml',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

function safeLocalPath(segments: string[]): string | null {
  if (segments.length === 1) {
    const file = path.basename(segments[0]);
    if (!/^[A-Z0-9]{2,4}\.[a-z0-9]+$/i.test(file)) return null;
    return path.join(DATA_DIR, file);
  }
  if (segments.length === 2 && segments[0] === '_candidates') {
    const file = path.basename(segments[1]);
    if (!/^[A-Z0-9]{2,4}-[\w.-]+\.[a-z0-9]+$/i.test(file)) return null;
    return path.join(CANDIDATES_DIR, file);
  }
  return null;
}

/** Serves logo files from Vercel Blob (private) or data/airline-logos/ locally. */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const segments = (await context.params).path;

  if (canUseLogoBlobStore()) {
    const blobPath = safeLogoBlobPath(segments);
    if (!blobPath) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const asset = await readBlobLogoAsset(blobPath);
    if (!asset) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(asset.buffer), {
      headers: {
        'Content-Type': asset.contentType,
        'Cache-Control': 'private, no-store, must-revalidate',
      },
    });
  }

  const absPath = safeLocalPath(segments);
  if (!absPath) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  try {
    const buffer = await fs.readFile(absPath);
    const ext = path.extname(absPath).slice(1).toLowerCase();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': MIME_BY_EXT[ext] ?? 'application/octet-stream',
        'Cache-Control': 'private, no-store, must-revalidate',
      },
    });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    throw err;
  }
}
