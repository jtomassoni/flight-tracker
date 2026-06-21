import { NextResponse } from 'next/server';
import { getApprovedManifest } from '@/lib/airlineLogoAssets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Lightweight manifest for display boot — logo URLs only, no full catalog. */
export async function GET() {
  const manifest = await getApprovedManifest();
  return NextResponse.json({ manifest });
}
