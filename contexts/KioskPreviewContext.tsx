'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { IpadOrientation } from '@/lib/kiosk';
import type { KioskViewport } from '@/hooks/useKioskViewport';

type KioskPreviewContextValue = {
  enabled: boolean;
  orientation: IpadOrientation;
};

const KioskPreviewContext = createContext<KioskPreviewContextValue>({
  enabled: false,
  orientation: 'landscape',
});

export function KioskPreviewProvider({
  enabled,
  orientation,
  children,
}: {
  enabled: boolean;
  orientation: IpadOrientation;
  children: ReactNode;
}) {
  return (
    <KioskPreviewContext.Provider value={{ enabled, orientation }}>
      {children}
    </KioskPreviewContext.Provider>
  );
}

export function useKioskPreview(): KioskPreviewContextValue {
  return useContext(KioskPreviewContext);
}

/** Viewport tier layouts should use — preview forces desk (iPad) sizing */
export function useEffectiveKioskViewport(windowViewport: KioskViewport): KioskViewport {
  const preview = useKioskPreview();
  if (preview.enabled) return 'desk';
  return windowViewport;
}
