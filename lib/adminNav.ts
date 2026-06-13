export type AdminNavItem = {
  href: string;
  label: string;
  code: string;
  match: (pathname: string) => boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: '/admin/themes',
    label: 'Themes',
    code: '01',
    match: (pathname) => pathname === '/admin' || pathname.startsWith('/admin/themes'),
  },
  {
    href: '/admin/location',
    label: 'Location',
    code: '02',
    match: (pathname) => pathname.startsWith('/admin/location'),
  },
  {
    href: '/admin/filters',
    label: 'Filters',
    code: '03',
    match: (pathname) => pathname.startsWith('/admin/filters'),
  },
  {
    href: '/admin/screen',
    label: 'Screen',
    code: '04',
    match: (pathname) => pathname.startsWith('/admin/screen'),
  },
  {
    href: '/admin/theme-tester/approve',
    label: 'Logos',
    code: '05',
    match: (pathname) =>
      pathname.startsWith('/admin/theme-tester') || pathname.startsWith('/admin/logos'),
  },
];

export function isAdminNavActive(pathname: string, item: AdminNavItem): boolean {
  return item.match(pathname);
}

export function adminNavItemForPath(pathname: string): AdminNavItem | undefined {
  return ADMIN_NAV_ITEMS.find((item) => isAdminNavActive(pathname, item));
}
