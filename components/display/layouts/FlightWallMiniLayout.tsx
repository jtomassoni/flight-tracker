'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DisplayLayoutProps } from '@/types/display';
import { airlineLedLogoUrl, getAirlineBrand, getAirlineLedWallStyle } from '@/lib/airlines';
import {
  formatLedFlightId,
  formatLedRouteHero,
  ledRouteLabel,
  ledTelemetryFields,
} from '@/lib/ledFlightWall';
import { useKioskOrientation } from '@/hooks/useKioskOrientation';
import FlightListState from '../shared/FlightListState';
import LedMatrixCanvas from '../shared/LedMatrixCanvas';
import './flight-wall-mini.css';

const ROTATE_MS = 10_000;

export default function FlightWallMiniLayout({
  displayedAircraft,
  status,
}: DisplayLayoutProps) {
  const [index, setIndex] = useState(0);
  const orientation = useKioskOrientation();

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

  const ledContent = useMemo(() => {
    if (!aircraft) return null;
    const brand = getAirlineBrand(aircraft.callsign);
    const wallStyle = getAirlineLedWallStyle(brand);
    const routeLine = ledRouteLabel(aircraft);
    return {
      airlineName: brand.name,
      flightId: formatLedFlightId(aircraft, brand),
      routeHero: formatLedRouteHero(routeLine),
      telemetry: ledTelemetryFields(aircraft),
      logoUrl: airlineLedLogoUrl(brand, 128),
      logoIcao: brand.icao,
      logoFallback: brand.iata,
      logoBackground: wallStyle.logoBackground,
      logoBorder: wallStyle.logoBorder,
      accentStripe: wallStyle.accentStripe,
      logoPalette: wallStyle.logoPalette,
      logoTileBorder: wallStyle.logoTileBorder,
    };
  }, [aircraft, displayedAircraft.length, index]);

  return (
    <div className="flight-wall-mini h-full w-full">
      <div className="flight-wall-mini__screen h-full w-full">
        {!ledContent ? (
          <div className="flight-wall-mini__empty flex h-full items-center justify-center">
            <FlightListState status={status} count={0} />
          </div>
        ) : (
          <>
            <LedMatrixCanvas
              key={aircraft!.hex}
              orientation={orientation}
              content={ledContent}
              className="flight-wall-mini__canvas flight-wall-mini__fade h-full w-full"
            />
            <div className="flight-wall-mini__overlay" aria-hidden>
              <div className="flight-wall-mini__scanlines" />
              <div className="flight-wall-mini__vignette" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
