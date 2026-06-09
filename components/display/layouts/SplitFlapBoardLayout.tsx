'use client';

import SplitFlapText from '@/components/SplitFlapText';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { DisplayLayoutProps } from '@/types/display';
import { displayIdentifier } from '@/lib/aircraftUtils';
import AdminLink from '../shared/AdminLink';
import FlightListState from '../shared/FlightListState';
import './split-flap-board.css';

/** 4-digit row IDs like classic station boards (196, 1198, …) */
function flapRowId(index: number): string {
  const base = 196 + index * 102;
  return String(base % 10000).padStart(4, '0');
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
  const isNarrow = useMediaQuery('(max-width: 639px)');
  const destChars = isNarrow ? 8 : 14;

  return (
    <div className="solari-board flex h-full flex-col overflow-hidden">
      <main className="min-h-0 flex-1 overflow-y-auto py-2 md:py-4">
        <FlightListState status={status} count={displayedAircraft.length} />
        {displayedAircraft.map((ac, i) => (
          <div key={ac.hex} className="solari-board__row">
            <div className="solari-board__col-id">
              <SplitFlapText value={flapRowId(i)} minChars={4} />
            </div>
            <div className="solari-board__col-dest">
              <SplitFlapText value={flapDestination(ac.callsign, ac.hex)} minChars={destChars} />
            </div>
            <div className="solari-board__col-time">
              <SplitFlapText value={flapDepartureTime(i, lastUpdated)} minChars={5} />
            </div>
          </div>
        ))}
      </main>

      <footer className="safe-bottom shrink-0 border-t border-black bg-[#0a0a0a] px-4 py-2">
        <SplitFlapText
          value={`${settings.locationLabel.slice(0, 12).toUpperCase()} ${displayedAircraft.length}`}
          minChars={18}
          size="md"
          className="opacity-80"
        />
      </footer>
      <AdminLink />
    </div>
  );
}
