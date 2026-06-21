import { NextRequest, NextResponse } from 'next/server';
import { fetchFlights, UpstreamUnavailableError } from '@/lib/flightProvider';
import { enrichWithRoutes } from '@/lib/routeProvider';
import { DEFAULT_LAT, DEFAULT_LON } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const lat = parseFloat(searchParams.get('lat') ?? String(DEFAULT_LAT));
  const lon = parseFloat(searchParams.get('lon') ?? String(DEFAULT_LON));
  const radiusMi = parseFloat(searchParams.get('radiusMi') ?? '10');
  const callsign = searchParams.get('callsign')?.trim().toUpperCase() || undefined;

  if (Number.isNaN(lat) || Number.isNaN(lon) || Number.isNaN(radiusMi)) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }

  let result;
  try {
    result = await fetchFlights({ lat, lon, radiusMi, callsign });
  } catch (error) {
    // Only live data is ever served — if the upstream feed is unreachable we
    // report an error rather than fabricating aircraft.
    const message =
      error instanceof UpstreamUnavailableError
        ? error.message
        : 'Live flight feed is unavailable';
    const status =
      error instanceof UpstreamUnavailableError ? error.statusCode : 502;
    return NextResponse.json({ error: message }, { status });
  }

  const aircraft = await enrichWithRoutes(result.aircraft);

  return NextResponse.json({
    aircraft,
    source: result.source,
    provider: result.provider,
    fetchedAt: result.fetchedAt,
    stale: result.stale ?? false,
  });
}
