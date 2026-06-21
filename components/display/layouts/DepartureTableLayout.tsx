'use client';

import { useMemo } from 'react';
import { useLayoutDensity } from '@/hooks/useLayoutDensity';
import type { DisplayLayoutProps } from '@/types/display';
import type { NormalizedAircraft } from '@/types/aircraft';
import RouteEndpointField from '@/components/display/shared/RouteEndpointField';
import AirlineLogoImage from '@/components/display/shared/AirlineLogoImage';
import { getAircraftDisplayBrand } from '@/lib/airlines';
import { getVerticalTrend } from '@/lib/aircraftUtils';
import { getDisplayEmptyState } from '@/lib/displayEmptyState';
import { fidsFlightNumber, fidsStatus } from '@/lib/denFids';
import KioskScrollRegion from '../shared/KioskScrollRegion';
import './den-fids.css';

const COL_HEADERS = ['From', 'Destination', 'Airline', 'Flight', 'Status'] as const;

function splitIntoPanels(aircraft: NormalizedAircraft[], panels: number): NormalizedAircraft[][] {
  const result = Array.from({ length: panels }, () => [] as NormalizedAircraft[]);
  aircraft.forEach((ac, i) => {
    result[i % panels].push(ac);
  });
  return result;
}

function DenBrandMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden className="den-fids__mark shrink-0">
      <circle cx="20" cy="20" r="18" fill="none" stroke="#ffffff" strokeWidth="1.5" />
      <path
        d="M8 28 L20 10 L32 28 Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 28 L20 18 L28 28" fill="none" stroke="#ffffff" strokeWidth="1" />
    </svg>
  );
}

function FidsPanel({
  flights,
  panelIndex,
}: {
  flights: NormalizedAircraft[];
  panelIndex: number;
}) {
  return (
    <section className="den-fids__panel">
      <header className="den-fids__panel-header">
        <div className="den-fids__brand">
          <DenBrandMark />
          <div className="den-fids__brand-text">
            <p className="den-fids__airport-name">Denver International Airport</p>
            <p className="den-fids__tagline">Together we soar.</p>
          </div>
        </div>
        <h2 className="den-fids__panel-title">Departures</h2>
      </header>

      <div className="den-fids__col-header">
        {COL_HEADERS.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>

      <KioskScrollRegion className="den-fids__rows min-h-0 flex-1" durationSec={32}>
        {flights.map((ac) => {
          const brand = getAircraftDisplayBrand(ac);
          const trend = getVerticalTrend(ac.verticalRateFpm);
          const status = fidsStatus(trend);

          return (
            <div key={ac.hex} className="den-fids__row">
              <RouteEndpointField ac={ac} kind="origin" variant="fids" />
              <RouteEndpointField ac={ac} kind="destination" variant="fids" />
              <div className="den-fids__airline">
                <div className="den-fids__logo-wrap">
                  <AirlineLogoImage
                    brand={brand}
                    size={128}
                    alt={brand.name}
                    fill
                    className="den-fids__logo-img"
                  />
                </div>
              </div>
              <span className="den-fids__data den-fids__flight">{fidsFlightNumber(ac)}</span>
              <span className={`den-fids__status den-fids__status--${status.tone}`}>
                {status.label}
              </span>
            </div>
          );
        })}
      </KioskScrollRegion>

      {panelIndex > 0 && (
        <span className="den-fids__panel-index" aria-hidden>
          {panelIndex + 1}
        </span>
      )}
    </section>
  );
}

export default function DepartureTableLayout({
  displayedAircraft,
  settings,
  status,
  lastUpdated,
  errorMessage,
  trackLabel,
  trackStatus,
}: DisplayLayoutProps) {
  const { panelCount } = useLayoutDensity();
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
  const panels = useMemo(
    () => splitIntoPanels(displayedAircraft, panelCount),
    [displayedAircraft, panelCount]
  );

  return (
    <div className="den-fids flex h-full flex-col overflow-hidden">
      <main className="den-fids__main flex min-h-0 flex-1 flex-col md:flex-row">
        {displayedAircraft.length === 0 ? (
          <div className="den-fids__empty flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <DenBrandMark />
            <div>
              <p className="den-fids__empty-title">{emptyState.title}</p>
              <p className="den-fids__empty-sub">{emptyState.subtitle}</p>
            </div>
          </div>
        ) : (
          panels.map((flights, i) => (
            <FidsPanel key={i} flights={flights} panelIndex={i} />
          ))
        )}
      </main>

      {(lastUpdated || errorMessage) && (
        <footer className="den-fids__footer safe-bottom shrink-0">
          {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString()}</span>}
          {errorMessage && <span className="den-fids__footer-error">{errorMessage}</span>}
        </footer>
      )}
    </div>
  );
}
