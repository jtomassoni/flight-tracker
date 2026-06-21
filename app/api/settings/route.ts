import { NextRequest, NextResponse } from 'next/server';
import { readStoredSettings, writeStoredSettings } from '@/lib/settingsStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const record = await readStoredSettings();
  if (!record) return NextResponse.json({ settings: null, savedAt: 0 });
  return NextResponse.json({ settings: record.settings, savedAt: record.savedAt });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const record = await writeStoredSettings(body);
    return NextResponse.json({ ok: true, settings: record.settings, savedAt: record.savedAt });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
