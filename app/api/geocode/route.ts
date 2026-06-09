import { NextRequest, NextResponse } from 'next/server';
import { geocodeZip } from '@/lib/geocode';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get('zip');

  if (!zip?.trim()) {
    return NextResponse.json({ error: 'Missing zip parameter' }, { status: 400 });
  }

  try {
    const result = await geocodeZip(zip);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Geocoding failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
