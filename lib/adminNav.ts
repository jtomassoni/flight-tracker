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
    href: '/admin/settings',
    label: 'Settings',
    code: '02',
    match: (pathname) =>
      pathname.startsWith('/admin/settings') ||
      pathname.startsWith('/admin/filters') ||
      pathname.startsWith('/admin/location') ||
      pathname.startsWith('/admin/screen'),
  },
  {
    href: '/admin/watch',
    label: 'Watch',
    code: '03',
    match: (pathname) => pathname.startsWith('/admin/watch'),
  },
  {
    href: '/admin/theme-tester',
    label: 'Logos',
    code: '04',
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
