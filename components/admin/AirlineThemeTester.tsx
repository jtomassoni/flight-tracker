'use client';

import Link from 'next/link';
import CarrierInspectorPanel from '@/components/admin/CarrierInspectorPanel';
import LogoApprovalPanel from '@/components/admin/LogoApprovalPanel';
import './airline-logo-gallery.css';
import './theme-tester.css';

export type TesterTab = 'approve' | 'preview';

const TABS: { id: TesterTab; label: string; href: string; hint: string }[] = [
  {
    id: 'approve',
    label: 'Approve logos',
    href: '/admin/theme-tester/approve',
    hint: 'Pick the source-of-truth logo per carrier',
  },
  {
    id: 'preview',
    label: 'Theme preview',
    href: '/admin/theme-tester/preview',
    hint: 'Inspect LED + gallery rendering',
  },
];

export default function AirlineThemeTester({ tab }: { tab: TesterTab }) {
  return (
    <div className="admin-page admin-page--tester">
      <div className="admin-page__content admin-page__content--tester">
        <nav className="theme-tester__tabs" aria-label="Logo sections">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={t.href}
              title={t.hint}
              className="theme-tester__tab"
              data-active={tab === t.id ? 'true' : 'false'}
              aria-current={tab === t.id ? 'page' : undefined}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="theme-tester__body">
          {tab === 'approve' ? <LogoApprovalPanel /> : <CarrierInspectorPanel />}
        </div>
      </div>
    </div>
  );
}
