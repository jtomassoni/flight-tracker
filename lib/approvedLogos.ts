/**
 * Approved logo manifest — logos promoted via the admin approval tool.
 *
 * URLs are stored in Vercel Blob (prod + local dev with `vercel env pull`) or
 * served from data/airline-logos/ via /api/airline-logos/asset/ when no blob
 * token is configured.
 *
 * Client code loads the manifest at runtime (LogoManifestProvider or legacy
 * syncLogoManifest) before resolving logo URLs.
 */

export type ApprovedLogoEntry = {
  url?: string;
  file?: string;
  source?: string;
  approvedAt?: string;
};

let approvedManifest: Record<string, ApprovedLogoEntry> = {};

export function setApprovedManifest(manifest: Record<string, ApprovedLogoEntry>): void {
  approvedManifest = manifest ?? {};
}

export function getApprovedManifest(): Record<string, ApprovedLogoEntry> {
  return approvedManifest;
}

function logoCacheSuffix(entry: ApprovedLogoEntry): string {
  const fromSource = entry.source?.match(/(\d{10,})/)?.[1];
  if (fromSource) return `?v=${fromSource}`;
  const version = entry.approvedAt ? Date.parse(entry.approvedAt) : NaN;
  return Number.isFinite(version) ? `?v=${version}` : '';
}

export function hasApprovedLogo(icao: string): boolean {
  const entry = approvedManifest[icao?.trim().toUpperCase()];
  return Boolean(entry?.url || entry?.file);
}

/** Approved logo URL for a carrier, or undefined when none is approved. */
export function approvedLogoUrl(icao: string): string | undefined {
  const entry = approvedManifest[icao?.trim().toUpperCase()];
  if (!entry) return undefined;
  if (entry.file) {
    return `/api/airline-logos/asset/${entry.file}${logoCacheSuffix(entry)}`;
  }
  if (entry.url) return entry.url;
  return undefined;
}
