'use client';

import CarrierInspectorPanel from '@/components/admin/CarrierInspectorPanel';
import { LogoCatalogProvider } from '@/components/admin/LogoCatalogContext';
import './airline-logo-gallery.css';
import './theme-tester.css';

export default function AirlineThemeTester() {
  return (
    <LogoCatalogProvider>
      <div className="admin-page admin-page--tester">
        <div className="admin-page__content admin-page__content--tester">
          <CarrierInspectorPanel />
        </div>
      </div>
    </LogoCatalogProvider>
  );
}
