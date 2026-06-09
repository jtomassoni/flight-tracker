'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { useLayoutDensity } from '@/hooks/useLayoutDensity';
import type { DisplayLayoutProps } from '@/types/display';
import type { NormalizedAircraft } from '@/types/aircraft';
import {
  fidsDepartureTime,
  fidsDestination,
  fidsFlightNumber,
  fidsGate,
  fidsStatus,
} from '@/lib/denFids';
import { airlineLogoUrl, getAirlineBrand } from '@/lib/airlines';
import { getVerticalTrend } from '@/lib/aircraftUtils';
import FlightListState from '../shared/FlightListState';
import KioskScrollRegion from '../shared/KioskScrollRegion';
import './den-fids.css';

const COL_HEADERS = ['Departing To', 'Airline', 'Flight', 'Gate', 'Time', 'Status'] as const;

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
  lastUpdated,
  globalOffset,
}: {
  flights: NormalizedAircraft[];
  panelIndex: number;
  lastUpdated: Date | null;
  globalOffset: number;
}) {
  return (
    <section className="den-fids__panel flex-1">
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
        {flights.map((ac, rowIndex) => {
          const rowNum = globalOffset + rowIndex;
          const brand = getAirlineBrand(ac.callsign);
          const trend = getVerticalTrend(ac.verticalRateFpm);
          const status = fidsStatus(trend, rowNum, lastUpdated);

          return (
            <div key={ac.hex} className="den-fids__row">
              <span className="den-fids__dest">{fidsDestination(rowNum)}</span>
              <div className="den-fids__airline">
                <div className="den-fids__logo-wrap">
                  <Image
                    src={airlineLogoUrl(brand, 128)}
                    alt={brand.name}
                    width={72}
                    height={28}
                    className="den-fids__logo-img"
                    unoptimized
                  />
                </div>
              </div>
              <span className="den-fids__data den-fids__flight">{fidsFlightNumber(ac)}</span>
              <span className="den-fids__data">{fidsGate(rowNum, ac.hex)}</span>
              <span className="den-fids__data">{fidsDepartureTime(rowNum, lastUpdated)}</span>
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
}: DisplayLayoutProps) {
  const { panelCount } = useLayoutDensity();
  const panels = useMemo(
    () => splitIntoPanels(displayedAircraft, panelCount),
    [displayedAircraft, panelCount]
  );

  let rowOffset = 0;

  return (
    <div className="den-fids flex h-full flex-col overflow-hidden">
      <main className="den-fids__main flex min-h-0 flex-1 flex-col md:flex-row">
        {displayedAircraft.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <FlightListState
              status={status}
              count={0}
              loadingMessage="Loading flight information…"
              emptyMessage="No flights to display."
            />
          </div>
        ) : (
          panels.map((flights, i) => {
            const panel = (
              <FidsPanel
                key={i}
                flights={flights}
                panelIndex={i}
                lastUpdated={lastUpdated}
                globalOffset={rowOffset}
              />
            );
            rowOffset += flights.length;
            return panel;
          })
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
