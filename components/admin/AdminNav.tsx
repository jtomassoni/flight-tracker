'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_NAV_ITEMS, isAdminNavActive } from '@/lib/adminNav';

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-tabs" aria-label="Settings">
      <ul className="admin-tabs__list">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = isAdminNavActive(pathname, item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="admin-tabs__link"
                data-active={active ? 'true' : 'false'}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
