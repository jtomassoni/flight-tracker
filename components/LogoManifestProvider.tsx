'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { setApprovedManifest } from '@/lib/approvedLogos';

const LogoManifestRevisionContext = createContext(0);

/** Bumps when the server manifest has been applied — use as a useMemo/useEffect dep for logo URLs. */
export function useLogoManifestRevision(): number {
  return useContext(LogoManifestRevisionContext);
}

/** Loads approved logo URLs from the server manifest so display layouts can resolve logos. */
export default function LogoManifestProvider({ children }: { children: ReactNode }) {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    fetch('/api/airline-logos/manifest', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.manifest) {
          setApprovedManifest(data.manifest);
          setRevision((r) => r + 1);
        }
      })
      .catch(() => {
        // Display falls back to native marks / IATA text when manifest is unavailable.
      });
  }, []);

  return (
    <LogoManifestRevisionContext.Provider value={revision}>
      {children}
    </LogoManifestRevisionContext.Provider>
  );
}
