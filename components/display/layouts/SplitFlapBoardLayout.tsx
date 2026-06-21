'use client';

import { memo, useMemo } from 'react';
import SplitFlapText from '@/components/SplitFlapText';
import type { DisplayLayoutProps } from '@/types/display';
import type { NormalizedAircraft } from '@/types/aircraft';
import { getVerticalTrend } from '@/lib/aircraftUtils';
import RouteEndpointField from '@/components/display/shared/RouteEndpointField';
import { getDisplayEmptyState } from '@/lib/displayEmptyState';
import {
  fidsAirlineCode,
  fidsBoardStatus,
  fidsEstimatedTime,
  fidsFlightNumOnly,
  FIDS_UNKNOWN,
} from '@/lib/denFids';
import { useLayoutDensity } from '@/hooks/useLayoutDensity';
import './split-flap-board.css';

const COL_HEADERS = ['Airline', 'Flight', 'City', 'Status', 'Time'] as const;

function flapText(raw: string, maxChars: number): string {
  const cleaned = raw.replace(/[^A-Z0-9 :]/gi, '').toUpperCase().slice(0, maxChars);
  return cleaned || FIDS_UNKNOWN;
}

function flapUnknown(chars: number): string {
  return FIDS_UNKNOWN.padEnd(chars, ' ').slice(0, chars);
}

type FlapRowProps = {
  ac: NormalizedAircraft;
  boardNow: Date;
};

const SplitFlapRow = memo(function SplitFlapRow({ ac, boardNow }: FlapRowProps) {
  const trend = getVerticalTrend(ac.verticalRateFpm);
  const boardStatus = fidsBoardStatus(trend);
  const rawTime = fidsEstimatedTime(ac, trend, boardNow);
  const time = rawTime === FIDS_UNKNOWN ? flapUnknown(6) : flapText(rawTime, 6);

  return (
    <div className="solari-board__row">
      <div className="solari-board__col-airline">
        <SplitFlapText value={flapText(fidsAirlineCode(ac), 2)} minChars={2} maxChars={2} />
      </div>
      <div className="solari-board__col-flight">
        <SplitFlapText value={flapText(fidsFlightNumOnly(ac), 4)} minChars={4} maxChars={4} />
      </div>
      <div className="solari-board__col-city">
        <RouteEndpointField ac={ac} kind="endpoint" trend={trend} variant="flap" />
      </div>
      <div className={`solari-board__col-status solari-board__col-status--${trend}`}>
        <SplitFlapText value={boardStatus} minChars={9} maxChars={9} size="md" />
      </div>
      <div className="solari-board__col-time">
        <SplitFlapText value={time} minChars={6} maxChars={6} size="md" />
      </div>
    </div>
  );
});

export default function SplitFlapBoardLayout({
  displayedAircraft,
  settings,
  status,
  lastUpdated,
  errorMessage,
  trackLabel,
  trackStatus,
  theme,
}: DisplayLayoutProps) {
  const { flapMaxRows } = useLayoutDensity();
  const locationLine = settings.locationLabel.replace(/,/g, '').trim().toUpperCase().slice(0, 14);
  const boardNow = useMemo(
    () => lastUpdated ?? new Date(),
    [lastUpdated]
  );
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

  const visibleFlights = useMemo(
    () => displayedAircraft.slice(0, flapMaxRows),
    [displayedAircraft, flapMaxRows]
  );
  const countLine =
    displayedAircraft.length > flapMaxRows
      ? `${visibleFlights.length} OF ${displayedAircraft.length} FLIGHTS`
      : `${displayedAircraft.length} FLIGHTS`;

  const header = theme.boardHeader;

  return (
    <div className="solari-board flex h-full flex-col overflow-hidden">
      {header && (
        <header className="solari-board__header">
          <p className="solari-board__header-title">{header.title}</p>
          {header.subtitle && <p className="solari-board__header-sub">{header.subtitle}</p>}
        </header>
      )}

      <div className="solari-board__panel min-h-0 flex-1">
        <div className="solari-board__col-header">
          {COL_HEADERS.map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>

        <div className="solari-board__rows min-h-0 flex-1">
          {visibleFlights.length === 0 && (
            <div className="solari-board__empty">
              <p className="solari-board__empty-title">{emptyState.title}</p>
              <p className="solari-board__empty-sub">{emptyState.subtitle}</p>
            </div>
          )}
          {visibleFlights.map((ac) => (
            <SplitFlapRow key={ac.hex} ac={ac} boardNow={boardNow} />
          ))}
        </div>
      </div>

      <footer className="solari-board__footer safe-bottom shrink-0">
        <div className="solari-board__footer-grid">
          <span className="solari-board__footer-location">{locationLine}</span>
          <span className="solari-board__footer-count">{countLine}</span>
        </div>
        <p className="solari-board__footer-hint">
          Est. times from live position · not published schedules
        </p>
      </footer>
    </div>
  );
}
