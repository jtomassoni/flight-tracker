/**
 * Approved logo manifest — the source-of-truth logos promoted via the admin
 * approval tool (`public/airline-logos/approved.json`).
 *
 * The display, gallery, and LED renderers resolve logos through this first so an
 * approved local asset always wins over the Kiwi CDN fallback.
 */
import approvedManifest from '@/public/airline-logos/approved.json';

type ApprovedEntry = {
  file: string;
  source?: string;
  approvedAt?: string;
};

const APPROVED_LOGOS = approvedManifest as Record<string, ApprovedEntry>;

export function hasApprovedLogo(icao: string): boolean {
  return Boolean(APPROVED_LOGOS[icao?.trim().toUpperCase()]?.file);
}

/** Same-origin path to a carrier's approved logo, or undefined if none is approved. */
export function approvedLogoUrl(icao: string): string | undefined {
  const entry = APPROVED_LOGOS[icao?.trim().toUpperCase()];
  if (!entry?.file) return undefined;
  const version = entry.approvedAt ? Date.parse(entry.approvedAt) : NaN;
  const suffix = Number.isFinite(version) ? `?v=${version}` : '';
  return `/airline-logos/${entry.file}${suffix}`;
}
