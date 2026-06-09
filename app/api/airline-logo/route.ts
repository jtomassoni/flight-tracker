import { NextRequest, NextResponse } from 'next/server';

const SIZES = new Set(['64', '128', '256']);

export async function GET(request: NextRequest) {
  const iata = request.nextUrl.searchParams.get('iata')?.trim().toUpperCase();
  const size = request.nextUrl.searchParams.get('size') ?? '128';

  if (!iata || !/^[A-Z0-9]{2}$/.test(iata)) {
    return NextResponse.json({ error: 'Invalid iata parameter' }, { status: 400 });
  }

  if (!SIZES.has(size)) {
    return NextResponse.json({ error: 'Invalid size parameter' }, { status: 400 });
  }

  const upstream = `https://images.kiwi.com/airlines/${size}/${iata}.png`;
  const response = await fetch(upstream, { next: { revalidate: 60 * 60 * 24 * 7 } });

  if (!response.ok) {
    return NextResponse.json({ error: 'Logo not found' }, { status: response.status });
  }

  const bytes = await response.arrayBuffer();
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
    },
  });
}
