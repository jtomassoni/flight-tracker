import { NextRequest, NextResponse } from 'next/server';
import {
  approveCandidate,
  deleteCandidate,
  getCatalog,
  saveUpload,
  unapprove,
} from '@/lib/airlineLogoAssets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const catalog = await getCatalog();
  return NextResponse.json({ catalog });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const action = String(body.action ?? '');
  const icao = String(body.icao ?? '');

  try {
    switch (action) {
      case 'upload': {
        const file = await saveUpload(icao, String(body.dataUrl ?? ''));
        return NextResponse.json({ ok: true, file });
      }
      case 'approve': {
        const approved = await approveCandidate(icao, String(body.file ?? ''));
        return NextResponse.json({ ok: true, approved });
      }
      case 'unapprove': {
        await unapprove(icao);
        return NextResponse.json({ ok: true });
      }
      case 'delete': {
        await deleteCandidate(icao, String(body.file ?? ''));
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
