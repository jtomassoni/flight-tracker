'use client';

import { useEffect } from 'react';
import { getTheme } from '@/lib/themes';
import type { ThemeId } from '@/lib/settings';

type ThemeProviderProps = {
  themeId: ThemeId;
  children: React.ReactNode;
};

export default function ThemeProvider({ themeId, children }: ThemeProviderProps) {
  const theme = getTheme(themeId);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    root.dataset.theme = themeId;
    document.body.classList.add('theme-transition');
  }, [theme, themeId]);

  return <div className="theme-fade h-full">{children}</div>;
}
