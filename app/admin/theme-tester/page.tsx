import { redirect } from 'next/navigation';

export default function ThemeTesterPage() {
  redirect('/admin/theme-tester/approve');
}
