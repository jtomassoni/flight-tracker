import { redirect } from 'next/navigation';

export default async function ThemePreviewRedirect({
  searchParams,
}: {
  searchParams: Promise<{ icao?: string }>;
}) {
  const { icao } = await searchParams;
  redirect(icao ? `/admin/theme-tester?icao=${icao}` : '/admin/theme-tester');
}
