'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { DisplayLayoutProps } from '@/types/display';
import type { NormalizedAircraft } from '@/types/aircraft';
import { getAirlineBrand } from '@/lib/airlines';
import {
  displayIdentifier,
  formatAltitude,
  formatDistance,
  getVerticalTrend,
  headingToCardinal,
} from '@/lib/aircraftUtils';
import AdminLink from '../shared/AdminLink';
import FlightListState from '../shared/FlightListState';
import './den-fids.css';

function usePanelCount(): number {
  const isNarrow = useMediaQuery('(max-width: 639px)');
  const isTablet = useMediaQuery('(max-width: 1279px)');
  if (isNarrow) return 1;
  if (isTablet) return 2;
  return 4;
}

const COL_HEADERS = ['Departing To', 'Airline', 'Flight', 'Gate', 'Time', 'Status'] as const;

function splitIntoPanels(aircraft: NormalizedAircraft[], panels: number): NormalizedAircraft[][] {
  const result = Array.from({ length: panels }, () => [] as NormalizedAircraft[]);
  aircraft.forEach((ac, i) => {
    result[i % panels].push(ac);
  });
  return result;
}

function statusDisplay(trend: ReturnType<typeof getVerticalTrend>): {
  label: string;
  className: string;
} {
  switch (trend) {
    case 'climbing':
      return { label: 'Climbing', className: 'den-fids__status--active' };
    case 'descending':
      return { label: 'Descending', className: 'den-fids__status--alert' };
    default:
      return { label: 'On Time', className: 'den-fids__status--ontime' };
  }
}

function DenLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <circle cx="16" cy="16" r="15" fill="none" stroke="#ffffff" strokeWidth="1.5" />
      <path
        d="M6 22 L16 8 L26 22 Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 22 L16 14 L22 22" fill="none" stroke="#ffffff" strokeWidth="1" />
    </svg>
  );
}

function FidsPanel({ flights, panelIndex }: { flights: NormalizedAircraft[]; panelIndex: number }) {
  return (
    <section className="den-fids__panel flex-1">
      <div className="den-fids__panel-header">
        <DenLogo />
        <span className="den-fids__panel-title">Departures</span>
        {panelIndex > 0 && (
          <span className="ml-auto text-[10px] uppercase tracking-widest text-[#7eb8d4]">
            {panelIndex + 1}
          </span>
        )}
      </div>

      <div className="den-fids__col-header">
        {COL_HEADERS.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {flights.map((ac) => {
          const brand = getAirlineBrand(ac.callsign);
          const id = displayIdentifier(ac);
          const trend = getVerticalTrend(ac.verticalRateFpm);
          const { label: statusLabel, className: statusClass } = statusDisplay(trend);
          const gate = formatDistance(ac.distanceMi).replace(' mi', '');
          const alt = formatAltitude(ac.altitudeFt).replace(' ft', '').replace(/,/g, '');

          return (
            <div key={ac.hex} className="den-fids__row">
              <span className="den-fids__dest">{headingToCardinal(ac.headingDeg)}</span>
              <div className="den-fids__airline">
                <div className="den-fids__logo-wrap">
                  <Image
                    src={brand.logoUrl}
                    alt=""
                    width={40}
                    height={18}
                    className="h-full w-full object-contain p-0.5"
                    unoptimized
                  />
                </div>
                <span className="den-fids__airline-name">{brand.name}</span>
              </div>
              <span className="den-fids__cyan truncate">{id}</span>
              <span className="den-fids__cyan">{gate}</span>
              <span className="den-fids__cyan">{alt}</span>
              <span className={statusClass}>{statusLabel}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function DepartureTableLayout({
  displayedAircraft,
  settings,
  status,
  lastUpdated,
  errorMessage,
  onRefresh,
}: DisplayLayoutProps) {
  const panelCount = usePanelCount();
  const panels = useMemo(
    () => splitIntoPanels(displayedAircraft, panelCount),
    [displayedAircraft, panelCount]
  );

  return (
    <div className="den-fids flex h-full flex-col overflow-hidden">
      <main className="flex min-h-0 flex-1 flex-col md:flex-row">
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
          panels.map((flights, i) => (
            <FidsPanel key={i} flights={flights} panelIndex={i} />
          ))
        )}
      </main>

      <footer className="safe-bottom flex shrink-0 flex-col gap-1 border-t border-white/10 bg-[#0a1628] px-4 py-2 text-[10px] uppercase tracking-wider text-[#7eb8d4] sm:flex-row sm:items-center sm:justify-between sm:py-1.5">
        <span className="truncate">
          Denver International Airport · {settings.locationLabel} · ZIP {settings.zipCode}
        </span>
        <span className="flex shrink-0 items-center gap-3 sm:gap-4">
          {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString()}</span>}
          <button type="button" onClick={onRefresh} className="font-bold text-[#5ec8e8] hover:underline">
            Refresh
          </button>
          {errorMessage && <span className="text-red-400">{errorMessage}</span>}
        </span>
      </footer>
      <AdminLink />
    </div>
  );
}
