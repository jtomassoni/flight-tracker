'use client';

import { useEffect, type ReactNode } from 'react';

/** Locks document scroll so the admin shell is the sole scroll container. */
export default function AdminPageShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add('admin-page');
    document.body.classList.add('admin-page');
    return () => {
      document.documentElement.classList.remove('admin-page');
      document.body.classList.remove('admin-page');
    };
  }, []);

  return <>{children}</>;
}
