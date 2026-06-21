import { NextRequest, NextResponse } from 'next/server';
import { normalizeRouteCallsign, resolveRoutesForRetry } from '@/lib/routeProvider';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const retry = searchParams.get('retry') === '1';

  const raw = searchParams.getAll('callsign');
  const callsigns = raw
    .map((value) => normalizeRouteCallsign(value))
    .filter((value): value is string => value != null);

  if (callsigns.length === 0) {
    return NextResponse.json({ routes: {} });
  }

  if (!retry) {
    return NextResponse.json(
      { error: 'Route retry requires retry=1' },
      { status: 400 }
    );
  }

  const routes = await resolveRoutesForRetry(callsigns);
  return NextResponse.json({ routes, fetchedAt: new Date().toISOString() });
}
