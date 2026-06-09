'use client';

import { useEffect, useState } from 'react';
import type { DisplayLayoutProps } from '@/types/display';
import type { NormalizedAircraft } from '@/types/aircraft';
import { getAirlineBrand } from '@/lib/airlines';
import {
  displayIdentifier,
  formatAltitude,
  formatDistance,
  headingToCardinal,
} from '@/lib/aircraftUtils';
import AdminLink from '../shared/AdminLink';
import FlightListState from '../shared/FlightListState';
import LedAirlineLogo from '../shared/LedAirlineLogo';
import './flight-wall-mini.css';

const ROTATE_MS = 10_000;

function formatAircraftType(ac: NormalizedAircraft): string {
  if (ac.aircraftType?.trim()) return ac.aircraftType.trim().toUpperCase();
  if (ac.category?.trim()) return ac.category.trim().toUpperCase();
  return '—';
}

function formatOriginLine(locationLabel: string): string {
  const trimmed = locationLabel.trim();
  if (/near/i.test(trimmed)) return trimmed;
  return `Near ${trimmed}`;
}

function formatDestinationLine(ac: NormalizedAircraft): string {
  const cardinal = headingToCardinal(ac.headingDeg);
  if (cardinal === '—') {
    return `${formatDistance(ac.distanceMi)} · ${formatAltitude(ac.altitudeFt)}`;
  }
  return `${cardinal}bound · ${formatDistance(ac.distanceMi)}`;
}

export default function FlightWallMiniLayout({
  displayedAircraft,
  settings,
  status,
}: DisplayLayoutProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [displayedAircraft.length, displayedAircraft[0]?.hex]);

  useEffect(() => {
    if (displayedAircraft.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % displayedAircraft.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [displayedAircraft]);

  const aircraft = displayedAircraft[index] ?? null;
  const brand = aircraft ? getAirlineBrand(aircraft.callsign) : null;

  return (
    <div className="flight-wall-mini h-full w-full">
      <div className="flight-wall-mini__bezel h-full w-full">
        <div className="flight-wall-mini__screen h-full w-full">
          <div className="flight-wall-mini__phosphor">
            {!aircraft ? (
              <div className="flex h-full items-center justify-center">
                <FlightListState status={status} count={0} />
              </div>
            ) : (
              <div
                key={aircraft.hex}
                className="flight-wall-mini__fade flex h-full flex-col justify-between"
              >
                <div className="flex items-start gap-4 md:gap-6">
                  <div className="flight-wall-mini__logo-slot shrink-0">
                    <LedAirlineLogo brand={brand!} size={120} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5 md:space-y-2">
                    <p className="flight-wall-mini__led-text flight-wall-mini__route-line font-bold">
                      {brand!.name}
                    </p>
                    <p className="flight-wall-mini__led-text flight-wall-mini__route-line">
                      {displayIdentifier(aircraft)}
                    </p>
                    <p className="flight-wall-mini__led-dim flight-wall-mini__route-line">
                      {formatAircraftType(aircraft)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 md:space-y-2.5">
                  <p className="flight-wall-mini__led-text flight-wall-mini__airport-line font-bold">
                    {formatOriginLine(settings.locationLabel)}
                  </p>
                  <p className="flight-wall-mini__led-text flight-wall-mini__airport-line">
                    {formatDestinationLine(aircraft)}
                  </p>
                </div>

                {displayedAircraft.length > 1 && (
                  <p className="flight-wall-mini__page pt-2 text-center uppercase">
                    {index + 1} / {displayedAircraft.length}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flight-wall-mini__mesh" aria-hidden />
          <div className="flight-wall-mini__mesh-hot" aria-hidden />
          <div className="flight-wall-mini__scanlines" aria-hidden />
          <div className="flight-wall-mini__refresh-band" aria-hidden />
          <div className="flight-wall-mini__vignette" aria-hidden />
          <div className="flight-wall-mini__glass" aria-hidden />
        </div>
      </div>

      <AdminLink />
    </div>
  );
}
