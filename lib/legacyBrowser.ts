/** iOS major version from Mobile Safari / Chrome-on-iOS user agent. */
export function iosMajorVersion(userAgent: string): number | null {
  const match = userAgent.match(/(?:CPU OS|iPhone OS|iPad OS) (\d+)[_.]/i);
  if (!match) return null;
  const major = parseInt(match[1], 10);
  return Number.isFinite(major) ? major : null;
}

export type BrowserEnvironment = {
  label: string;
  iosMajor: number | null;
};

/** Human-readable device + OS string from user agent (server or client). */
export function describeBrowserEnvironment(userAgent: string): BrowserEnvironment {
  const iosMatch = userAgent.match(/(?:CPU OS|iPhone OS|iPad OS) (\d+)[_.](\d+)(?:[_.](\d+))?/i);
  if (iosMatch) {
    const major = parseInt(iosMatch[1], 10);
    const minor = iosMatch[2];
    const patch = iosMatch[3];
    const version = patch ? `${major}.${minor}.${patch}` : `${major}.${minor}`;
    const device = /iPad/.test(userAgent) ? 'iPad' : /iPhone/.test(userAgent) ? 'iPhone' : 'iOS device';
    return { label: `${device} · iOS ${version}`, iosMajor: major };
  }

  const safariMatch = userAgent.match(/Version\/(\d+(?:\.\d+)?)/);
  if (/iPad/.test(userAgent) && safariMatch) {
    return { label: `iPad · Safari ${safariMatch[1]}`, iosMajor: null };
  }

  return { label: 'this browser', iosMajor: null };
}

/**
 * Browsers that cannot run the Next.js/React display app.
 * iPad 4 (MD514LL/A) tops out at iOS 10.3.3 — WebKit ~Safari 10.
 */
export function isLegacyKioskBrowser(userAgent: string): boolean {
  const ios = iosMajorVersion(userAgent);
  if (ios != null && ios <= 11) return true;

  // Old iPad without OS token (very rare)
  if (/iPad/.test(userAgent) && /Version\/(?:9|10|11)\./.test(userAgent)) {
    return true;
  }

  return false;
}

/** Admin requires a modern browser — same threshold as the React display app. */
export function isAdminSupportedBrowser(userAgent: string): boolean {
  return !isLegacyKioskBrowser(userAgent);
}
