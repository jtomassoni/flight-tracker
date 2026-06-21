'use client';

import SplitFlapText from '@/components/SplitFlapText';
import type { DisplayLayoutProps } from '@/types/display';
import { displayIdentifier, formatAltitude } from '@/lib/aircraftUtils';
import { getDisplayEmptyState } from '@/lib/displayEmptyState';
import { fidsDestination } from '@/lib/denFids';
import KioskScrollRegion from '../shared/KioskScrollRegion';
import './split-flap-board.css';

function flapDestination(ac: DisplayLayoutProps['displayedAircraft'][number]): string {
  const dest = fidsDestination(ac);
  if (dest !== '—') {
    return dest.replace(/[^A-Z0-9 ]/gi, '').toUpperCase().slice(0, 12);
  }
  const id = displayIdentifier(ac).replace(/[^A-Z0-9 ]/gi, '').toUpperCase();
  return id.slice(0, 12) || '—';
}

export default function SplitFlapBoardLayout({
  displayedAircraft,
  settings,
  status,
  errorMessage,
  trackLabel,
  trackStatus,
}: DisplayLayoutProps) {
  const locationLine = settings.locationLabel.replace(/,/g, '').trim().toUpperCase().slice(0, 14);
  const countLine = `${displayedAircraft.length} FLIGHTS`;
  const feedDown = status === 'error' || status === 'offline';
  const emptyState = getDisplayEmptyState({
    status,
    trackLabel,
    trackStatus,
    feedDown,
    errorMessage,
    locationLabel: settings.locationLabel,
    radiusMi: settings.radiusMi,
  });

  return (
    <div className="solari-board flex h-full flex-col overflow-hidden">
      <KioskScrollRegion className="min-h-0 flex-1 py-2 md:py-4" durationSec={40}>
        {displayedAircraft.length === 0 && (
          <div className="solari-board__empty">
            <SplitFlapText
              value={emptyState.title.toUpperCase().slice(0, 12)}
              maxChars={12}
            />
            <p className="solari-board__empty-sub">{emptyState.subtitle}</p>
          </div>
        )}
        {displayedAircraft.map((ac) => {
          const dest = flapDestination(ac);
          const alt = formatAltitude(ac.altitudeFt).replace(/\s+/g, '');
          return (
            <div key={ac.hex} className="solari-board__row">
              <div className="solari-board__col-id">
                <SplitFlapText
                  value={displayIdentifier(ac).replace(/[^A-Z0-9 ]/gi, '').slice(0, 8)}
                  maxChars={8}
                />
              </div>
              <div className="solari-board__col-dest">
                <SplitFlapText value={dest} maxChars={12} />
              </div>
              <div className="solari-board__col-time">
                <SplitFlapText value={alt} maxChars={6} />
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
    </div>
  );
}
