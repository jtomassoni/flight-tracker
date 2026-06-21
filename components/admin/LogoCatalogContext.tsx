'use client';

import { setApprovedManifest } from '@/lib/approvedLogos';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type LogoCatalogApproved = {
  file: string;
  url: string;
  source?: string;
  approvedAt?: string;
};

export type LogoCatalogEntry = {
  icao: string;
  name: string;
  iata: string;
  candidates: { file: string; url: string }[];
  approved: LogoCatalogApproved | null;
};

function approvedAssetUrl(approved: LogoCatalogApproved): string {
  if (approved.url) return approved.url;
  const suffix = approved.approvedAt ? `?v=${Date.parse(approved.approvedAt)}` : '';
  return `/api/airline-logos/asset/${approved.file}${suffix}`;
}

function manifestFromCatalog(nextCatalog: LogoCatalogEntry[]) {
  const manifest: Record<string, { url?: string; file?: string; source?: string; approvedAt?: string }> =
    {};
  for (const entry of nextCatalog) {
    if (entry.approved) {
      manifest[entry.icao] = {
        url: entry.approved.url,
        file: entry.approved.file,
        source: entry.approved.source,
        approvedAt: entry.approved.approvedAt,
      };
    }
  }
  return manifest;
}

function mergeApprovedEntry(
  catalog: LogoCatalogEntry[],
  icao: string,
  approved: LogoCatalogApproved
): LogoCatalogEntry[] {
  const key = icao.trim().toUpperCase();
  return catalog.map((entry) =>
    entry.icao === key ? { ...entry, approved, candidates: [] } : entry
  );
}

function clearApprovedEntry(catalog: LogoCatalogEntry[], icao: string): LogoCatalogEntry[] {
  const key = icao.trim().toUpperCase();
  return catalog.map((entry) =>
    entry.icao === key ? { ...entry, approved: null } : entry
  );
}

type LogoCatalogContextValue = {
  catalog: LogoCatalogEntry[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getApprovedUrl: (icao: string) => string | undefined;
  /** Paste a screenshot and auto-approve — same path as the approve tab. */
  uploadPaste: (icao: string, dataUrl: string) => Promise<void>;
  /** Remove the approved logo for a carrier. */
  removeLogo: (icao: string) => Promise<void>;
};

const LogoCatalogContext = createContext<LogoCatalogContextValue | null>(null);

export function LogoCatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<LogoCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/airline-logos', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Catalog request failed (${res.status})`);
    const data = await res.json();
    const nextCatalog = data.catalog ?? [];
    setCatalog(nextCatalog);
    setApprovedManifest(manifestFromCatalog(nextCatalog));
    setError(null);
  }, []);

  useEffect(() => {
    refresh()
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [refresh]);

  const urlByIcao = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of catalog) {
      if (entry.approved) map.set(entry.icao, approvedAssetUrl(entry.approved));
    }
    return map;
  }, [catalog]);

  const getApprovedUrl = useCallback(
    (icao: string) => urlByIcao.get(icao.trim().toUpperCase()),
    [urlByIcao]
  );

  const uploadPaste = useCallback(async (icao: string, dataUrl: string) => {
    const res = await fetch('/api/airline-logos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upload', icao, dataUrl, autoApprove: true }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? `Paste failed (${res.status})`);
    if (!data.approved) throw new Error('Paste did not return an approved logo');

    const approved = data.approved as LogoCatalogApproved;
    setCatalog((prev) => {
      const next = mergeApprovedEntry(prev, icao, approved);
      setApprovedManifest(manifestFromCatalog(next));
      return next;
    });
  }, []);

  const removeLogo = useCallback(async (icao: string) => {
    const res = await fetch('/api/airline-logos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unapprove', icao }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? `Remove failed (${res.status})`);

    setCatalog((prev) => {
      const next = clearApprovedEntry(prev, icao);
      setApprovedManifest(manifestFromCatalog(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ catalog, loading, error, refresh, getApprovedUrl, uploadPaste, removeLogo }),
    [catalog, loading, error, refresh, getApprovedUrl, uploadPaste, removeLogo]
  );

  return <LogoCatalogContext.Provider value={value}>{children}</LogoCatalogContext.Provider>;
}

export function useLogoCatalog(): LogoCatalogContextValue {
  const ctx = useContext(LogoCatalogContext);
  if (!ctx) {
    throw new Error('useLogoCatalog must be used within LogoCatalogProvider');
  }
  return ctx;
}
