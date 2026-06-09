import type { Metadata } from 'next';
import DisplayDashboard from '@/components/display/DisplayDashboard';

export const metadata: Metadata = {
  title: 'Display',
};

export default function DisplayPage() {
  return (
    <div className="display-shell kiosk-no-select">
      <DisplayDashboard />
    </div>
  );
}
