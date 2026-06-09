'use client';

import Link from 'next/link';
import { useKioskPreview } from '@/contexts/KioskPreviewContext';

export default function AdminLink() {
  const { enabled: ipadPreview } = useKioskPreview();

  if (ipadPreview) return null;

  return (
    <Link
      href="/admin"
      className="fixed z-[300] rounded bg-panel/80 px-2.5 py-1.5 font-mono text-[10px] text-muted opacity-40 hover:opacity-100"
      style={{
        bottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        right: 'max(0.75rem, env(safe-area-inset-right))',
      }}
    >
      admin
    </Link>
  );
}
