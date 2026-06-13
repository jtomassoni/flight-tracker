'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_NAV_ITEMS, isAdminNavActive } from '@/lib/adminNav';

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-rail" aria-label="Admin sections">
      <p className="admin-rail__heading admin-mono">Modules</p>
      <ul className="admin-rail__list">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = isAdminNavActive(pathname, item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="admin-rail__link"
                data-active={active ? 'true' : 'false'}
                aria-current={active ? 'page' : undefined}
              >
                <span className="admin-rail__code admin-mono">{item.code}</span>
                <span className="admin-rail__label">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
