'use client';

import SplitFlapText from '@/components/SplitFlapText';
import type { DisplayLayoutProps } from '@/types/display';
import { displayIdentifier } from '@/lib/aircraftUtils';
import AdminLink from '../shared/AdminLink';
import FlightListState from '../shared/FlightListState';
import KioskScrollRegion from '../shared/KioskScrollRegion';
import './split-flap-board.css';

/** 2-digit platform / row numbers like classic departure boards */
function flapRowId(index: number): string {
  return String(index + 1).padStart(2, '0');
}

/** 24h departure-style time derived from row index + last sync */
function flapDepartureTime(index: number, lastUpdated: Date | null): string {
  const base = lastUpdated ?? new Date();
  const totalMin = base.getHours() * 60 + base.getMinutes() + index * 4;
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function flapDestination(callsign?: string, hex?: string): string {
  const raw = displayIdentifier({ hex: hex ?? '', callsign, lat: 0, lon: 0, distanceMi: 0 });
  if (raw === '—' && hex) return hex.slice(0, 6).toUpperCase();
  return raw.replace(/[^A-Z0-9 ]/gi, '').toUpperCase();
}

export default function SplitFlapBoardLayout({
  displayedAircraft,
  settings,
  status,
  lastUpdated,
}: DisplayLayoutProps) {
  const locationLine = settings.locationLabel.replace(/,/g, '').trim().toUpperCase().slice(0, 14);
  const countLine = `${displayedAircraft.length} FLIGHTS`;

  return (
    <div className="solari-board flex h-full flex-col overflow-hidden">
      <KioskScrollRegion className="min-h-0 flex-1 py-2 md:py-4" durationSec={40}>
        <FlightListState status={status} count={displayedAircraft.length} />
        {displayedAircraft.map((ac, i) => {
          const dest = flapDestination(ac.callsign, ac.hex);
          return (
            <div key={ac.hex} className="solari-board__row">
              <div className="solari-board__col-id">
                <SplitFlapText value={flapRowId(i)} minChars={2} />
              </div>
              <div className="solari-board__col-dest">
                <SplitFlapText value={dest} maxChars={12} />
              </div>
              <div className="solari-board__col-time">
                <SplitFlapText value={flapDepartureTime(i, lastUpdated)} minChars={5} />
              </div>
            </div>
          );
        })}
      </KioskScrollRegion>

      <footer className="solari-board__footer safe-bottom shrink-0 border-t border-black bg-[#0a0a0a] px-4 py-2">
        <div className="solari-board__footer-grid">
          <SplitFlapText value={locationLine} size="md" className="solari-board__footer-location" />
          <SplitFlapText value={countLine} size="md" className="opacity-80" />
        </div>
        <p className="solari-board__footer-hint">Aircraft currently in range</p>
      </footer>
      <AdminLink />
    </div>
  );
}
