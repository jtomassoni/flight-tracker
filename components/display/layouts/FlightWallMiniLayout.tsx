'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DisplayLayoutProps } from '@/types/display';
import {
  airlineLedLogoUrl,
  getAircraftDisplayBrand,
  getAirlineLedWallStyle,
} from '@/lib/airlines';
import {
  computeFlightProgress,
  formatLedFlightId,
  formatLedOperatorTag,
  formatLedRouteHero,
  ledRouteLabel,
  ledTelemetryFields,
  resolveLedLogoMarkIcao,
} from '@/lib/ledFlightWall';
import { getDisplayEmptyState } from '@/lib/displayEmptyState';
import { useKioskOrientation } from '@/hooks/useKioskOrientation';
import LedMatrixCanvas from '../shared/LedMatrixCanvas';
import { useLogoManifestRevision } from '@/components/LogoManifestProvider';
import './flight-wall-mini.css';

const ROTATE_MS = 10_000;

export default function FlightWallMiniLayout({
  displayedAircraft,
  settings,
  status,
  errorMessage,
  trackLabel,
  trackStatus,
}: DisplayLayoutProps) {
  const [index, setIndex] = useState(0);
  const orientation = useKioskOrientation();
  const logoManifestRevision = useLogoManifestRevision();
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

  /** Prefer flights with a validated route so the top header isn't blank. */
  const carouselAircraft = useMemo(() => {
    const withRoute = displayedAircraft.filter((ac) => ledRouteLabel(ac));
    const withoutRoute = displayedAircraft.filter((ac) => !ledRouteLabel(ac));
    return withRoute.length > 0 ? [...withRoute, ...withoutRoute] : displayedAircraft;
  }, [displayedAircraft]);

  useEffect(() => {
    setIndex(0);
  }, [carouselAircraft.length, carouselAircraft[0]?.hex]);

  const carouselLength = useMemo(() => {
    const withRoute = displayedAircraft.filter((ac) => ledRouteLabel(ac));
    return withRoute.length > 0 ? withRoute.length : displayedAircraft.length;
  }, [displayedAircraft]);

  useEffect(() => {
    if (carouselLength <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % carouselLength);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [carouselLength]);

  const aircraft = carouselAircraft[index] ?? null;

  const ledContent = useMemo(() => {
    if (!aircraft) return null;
    const brand = getAircraftDisplayBrand(aircraft);
    const wallStyle = getAirlineLedWallStyle(brand);
    const routeLine = ledRouteLabel(aircraft);
    const operatorTag = formatLedOperatorTag(aircraft);
    return {
      airlineName: brand.name,
      flightId: formatLedFlightId(aircraft, brand),
      operatorTag,
      routeHero: formatLedRouteHero(routeLine),
      routeProgress: computeFlightProgress(aircraft),
      telemetry: ledTelemetryFields(aircraft),
      logoUrl: airlineLedLogoUrl(brand),
      logoIcao: resolveLedLogoMarkIcao(brand, operatorTag),
      logoFallback: brand.name,
      logoBackground: wallStyle.logoBackground,
      logoBorder: wallStyle.logoBorder,
      accentStripe: wallStyle.accentStripe,
      logoPalette: wallStyle.logoPalette,
      logoTileBorder: wallStyle.logoTileBorder,
    };
  }, [aircraft, displayedAircraft.length, index, logoManifestRevision]);

  return (
    <div className="flight-wall-mini h-full w-full">
      <div className="flight-wall-mini__screen h-full w-full">
        {!ledContent ? (
          <div className="flight-wall-mini__empty flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="flight-wall-mini__empty-title">
              {emptyState.title.toUpperCase()}
            </p>
            <p className="flight-wall-mini__empty-sub">
              {emptyState.subtitle.toUpperCase()}
            </p>
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
