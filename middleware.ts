import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { OLD_IPAD_DISPLAY_PATH } from '@/lib/kioskUrl';
import { isLegacyKioskBrowser } from '@/lib/legacyBrowser';

/** Serve the static iOS 10–compatible display (settings via query string). */
function rewriteToOldIpadDisplay(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = '/legacy-display.html';
  return NextResponse.rewrite(url);
}

/** /kiosk → /old-ipad-display (keep query params). */
function redirectKioskAlias(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = OLD_IPAD_DISPLAY_PATH;
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === '/kiosk' || pathname.startsWith('/kiosk/')) {
    return redirectKioskAlias(request);
  }

  if (pathname === OLD_IPAD_DISPLAY_PATH || pathname.startsWith(`${OLD_IPAD_DISPLAY_PATH}/`)) {
    return rewriteToOldIpadDisplay(request);
  }

  if (!pathname.startsWith('/display')) {
    return NextResponse.next();
  }

  if (searchParams.get('legacy') === '0') {
    return NextResponse.next();
  }

  const forceLegacy = searchParams.get('legacy') === '1';
  const ua = request.headers.get('user-agent') ?? '';

  if (forceLegacy || isLegacyKioskBrowser(ua)) {
    const url = request.nextUrl.clone();
    url.pathname = OLD_IPAD_DISPLAY_PATH;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/kiosk',
    '/kiosk/:path*',
    '/old-ipad-display',
    '/old-ipad-display/:path*',
    '/display',
    '/display/:path*',
  ],
};
