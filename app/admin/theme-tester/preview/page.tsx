import type { Metadata } from 'next';
import { Suspense } from 'react';
import AirlineThemeTester from '@/components/admin/AirlineThemeTester';

export const metadata: Metadata = {
  title: 'Theme Preview',
};

export default function ThemePreviewPage() {
  return (
    <Suspense fallback={<div className="admin-page p-6 text-slate-400">Loading…</div>}>
      <AirlineThemeTester tab="preview" />
    </Suspense>
  );
}
