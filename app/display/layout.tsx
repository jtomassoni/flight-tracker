import type { ReactNode } from 'react';
import LogoManifestProvider from '@/components/LogoManifestProvider';

/** Runs before React hydrates — sends old iPads to /old-ipad-display before SSR loading screen. */
const LEGACY_REDIRECT_SCRIPT = `
(function () {
  if (/[?&]legacy=0(?:&|$)/.test(location.search)) return;
  var ua = navigator.userAgent || '';
  var ios = ua.match(/(?:CPU OS|iPhone OS|iPad OS) (\\d+)[_.]/i);
  var legacy = (ios && parseInt(ios[1], 10) <= 11) || (/iPad/.test(ua) && /Version\\/(?:9|10|11)\\./.test(ua));
  if (!legacy && !/[?&]legacy=1(?:&|$)/.test(location.search)) return;
  var target = '/old-ipad-display' + (location.search || '');
  if (location.pathname !== '/old-ipad-display') {
    location.replace(target);
  }
})();
`;

export default function DisplayLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: LEGACY_REDIRECT_SCRIPT }} />
      <LogoManifestProvider>{children}</LogoManifestProvider>
    </>
  );
}
