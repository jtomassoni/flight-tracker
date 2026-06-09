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
import PixelAirlineLogo from '../shared/PixelAirlineLogo';
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
    <div className="flight-wall-mini flex h-screen items-center justify-center p-4 md:p-8">
      <div className="flight-wall-mini__bezel w-full max-w-3xl rounded-2xl p-3 md:p-4">
        <div className="flight-wall-mini__screen aspect-[4/3] rounded-lg p-4 md:p-6">
          <div className="flight-wall-mini__scanline" aria-hidden />

          {!aircraft ? (
            <div className="flight-wall-mini__content flex h-full items-center justify-center">
              <FlightListState status={status} count={0} />
            </div>
          ) : (
            <div
              key={aircraft.hex}
              className="flight-wall-mini__content flight-wall-mini__fade flex h-full flex-col justify-between"
            >
              <div className="flex gap-4 md:gap-6">
                <div className="shrink-0 pt-1">
                  <PixelAirlineLogo brand={brand!} size={88} />
                </div>
                <div className="min-w-0 flex-1 space-y-1 md:space-y-2">
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

              <div className="space-y-2 md:space-y-3">
                <p className="flight-wall-mini__led-text flight-wall-mini__airport-line font-bold">
                  {formatOriginLine(settings.locationLabel)}
                </p>
                <p className="flight-wall-mini__led-text flight-wall-mini__airport-line">
                  {formatDestinationLine(aircraft)}
                </p>
              </div>
            </div>
          )}
        </div>

        {displayedAircraft.length > 1 && (
          <p className="mt-2 text-center text-[10px] tracking-widest text-slate-600">
            {index + 1} / {displayedAircraft.length}
          </p>
        )}
      </div>

      <AdminLink />
    </div>
  );
}
