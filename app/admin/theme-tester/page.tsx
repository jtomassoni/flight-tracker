import type { Metadata } from 'next';
import { Suspense } from 'react';
import AirlineThemeTester from '@/components/admin/AirlineThemeTester';
import '../admin.css';

export const metadata: Metadata = {
  title: 'Airline Theme Tester',
};

export default function ThemeTesterPage() {
  return (
    <div className="admin-shell relative">
      <div className="admin-horizon" aria-hidden />
      <Suspense fallback={<div className="theme-tester p-6 text-slate-400">Loading…</div>}>
        <AirlineThemeTester />
      </Suspense>
    </div>
  );
}
