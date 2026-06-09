import { NextRequest, NextResponse } from 'next/server';
import { fetchFlights } from '@/lib/flightProvider';
import { DEFAULT_LAT, DEFAULT_LON } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const lat = parseFloat(searchParams.get('lat') ?? String(DEFAULT_LAT));
  const lon = parseFloat(searchParams.get('lon') ?? String(DEFAULT_LON));
  const radiusMi = parseFloat(searchParams.get('radiusMi') ?? '10');

  if (Number.isNaN(lat) || Number.isNaN(lon) || Number.isNaN(radiusMi)) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }

  const result = await fetchFlights({ lat, lon, radiusMi });

  return NextResponse.json({
    aircraft: result.aircraft,
    source: result.source,
    provider: result.provider,
    fetchedAt: new Date().toISOString(),
  });
}
