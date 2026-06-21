'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import type { DisplayLayoutProps } from '@/types/display';
import {
  displayIdentifier,
  formatAltitude,
  formatDistance,
  formatSpeed,
  getVerticalTrend,
} from '@/lib/aircraftUtils';
import { getAircraftDisplayBrand } from '@/lib/airlines';
import { getDisplayEmptyState } from '@/lib/displayEmptyState';
import { useLayoutDensity } from '@/hooks/useLayoutDensity';
import AirlineLogoImage from '../shared/AirlineLogoImage';
import KioskTicker from '../shared/KioskTicker';

const FlightMap = dynamic(() => import('../maps/FlightMap'), { ssr: false });

const TICKER_MINIMIZED_KEY = 'sky-map-ticker-minimized';

const TREND_COLOR: Record<string, string> = {
  climbing: 'text-cyan-300',
  descending: 'text-orange-300',
  level: 'text-lime-300',
};

export default function SkyMapLayout({
  displayedAircraft,
  settings,
  lastUpdated,
  status,
  errorMessage,
  trackLabel,
  trackStatus,
}: DisplayLayoutProps) {
  const { viewport } = useLayoutDensity();
  const [tickerMinimized, setTickerMinimized] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(TICKER_MINIMIZED_KEY) === '1';
    } catch {
      return false;
    }
  });

  const toggleTicker = useCallback(() => {
    setTickerMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(TICKER_MINIMIZED_KEY, next ? '1' : '0');
      } catch {
        /* storage blocked */
      }
      return next;
    });
  }, []);

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
    <div className="sky-map-layout relative flex h-full flex-col overflow-hidden bg-slate-950">
      <div className="sky-map-layout__map absolute inset-0 pointer-events-none">
        <FlightMap
          centerLat={settings.lat}
          centerLon={settings.lon}
          radiusMi={settings.radiusMi}
          aircraft={displayedAircraft}
          locationLabel={settings.locationLabel}
          skyMapZoom={settings.skyMapZoom}
          dataUpdatedAt={lastUpdated}
          animateAircraft
        />
      </div>

      <header
        className={`pointer-events-none relative z-10 flex gap-2 safe-top ${
          viewport === 'compact'
            ? 'flex-col p-2'
            : 'flex-row items-start justify-between p-[var(--kiosk-pad)]'
        }`}
      >
        <div className="rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2 shadow-lg backdrop-blur-md sm:px-4 sm:py-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-sky-300/80">Live Airspace</p>
          <h1
            className={`font-bold text-white ${
              viewport === 'wall' ? 'text-2xl' : viewport === 'desk' ? 'text-xl' : 'text-lg'
            }`}
          >
            Sky Map
          </h1>
          <p className="truncate text-[11px] text-slate-300 sm:text-xs">
            {settings.locationLabel} · ZIP {settings.zipCode} · {settings.radiusMi} mi
          </p>
        </div>

        <div className="shrink-0 self-end rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2 text-right text-xs text-slate-300 backdrop-blur-md sm:self-auto">
          <p>{displayedAircraft.length} aircraft</p>
          <p>{lastUpdated?.toLocaleTimeString() ?? '—'}</p>
          {viewport !== 'desk' && <p className="capitalize text-slate-400">{status}</p>}
        </div>
      </header>

      {displayedAircraft.length === 0 && (
        <div className="pointer-events-none relative z-10 flex flex-1 items-center justify-center p-6">
          <div className="rounded-2xl border border-white/15 bg-slate-950/80 px-6 py-5 text-center shadow-lg backdrop-blur-md">
            <p className="text-[10px] uppercase tracking-[0.3em] text-sky-300/80">
              {emptyState.kicker ?? (feedDown ? 'Signal Lost' : 'Live Airspace')}
            </p>
            <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
              {emptyState.title}
            </h2>
            <p className="mt-1 text-xs text-slate-300 sm:text-sm">
              {emptyState.subtitle}
            </p>
          </div>
        </div>
      )}

      {displayedAircraft.length > 0 && (
        <footer className="pointer-events-auto relative z-10 mt-auto safe-bottom p-[var(--kiosk-pad)]">
          {tickerMinimized ? (
            <button
              type="button"
              onClick={toggleTicker}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/90 px-4 py-2 text-xs text-slate-200 shadow-lg backdrop-blur-md"
              aria-expanded={false}
              aria-label="Show flight list"
            >
              <span className="font-mono font-semibold text-white">{displayedAircraft.length}</span>
              <span>flights</span>
              <svg
                viewBox="0 0 16 16"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M4 10l4-4 4 4" />
              </svg>
            </button>
          ) : (
            <div className="relative rounded-xl border border-white/15 bg-slate-950/85 p-2 pr-10 shadow-lg backdrop-blur-md">
              <button
                type="button"
                onClick={toggleTicker}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-slate-900/80 text-slate-300"
                aria-expanded
                aria-label="Minimize flight list"
              >
                <svg
                  viewBox="0 0 16 16"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
              <KioskTicker
                durationSec={30}
                itemMinWidthPx={viewport === 'desk' ? 176 : 208}
              >
                {displayedAircraft.map((ac) => {
                  const trend = getVerticalTrend(ac.verticalRateFpm);
                  const brand = getAircraftDisplayBrand(ac);
                  return (
                    <div
                      key={ac.hex}
                      className={`flex shrink-0 items-center gap-2.5 rounded-lg border border-white/10 bg-slate-900/70 py-1.5 pl-1.5 pr-3 ${
                        viewport === 'desk' ? 'min-w-[11rem]' : 'min-w-[12rem] sm:min-w-[13rem]'
                      }`}
                      style={{ borderLeft: `3px solid ${brand.primaryColor}` }}
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-white">
                        <AirlineLogoImage
                          brand={brand}
                          size={64}
                          background="#ffffff"
                          alt={brand.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <p className="truncate font-mono text-sm font-bold text-white">
                            {displayIdentifier(ac)}
                          </p>
                          <span
                            className={`shrink-0 text-[9px] capitalize ${TREND_COLOR[trend] ?? 'text-slate-300'}`}
                          >
                            {trend}
                          </span>
                        </div>
                        <p className="truncate text-[10px] font-medium text-slate-300">{brand.name}</p>
                        <p className="font-mono text-[10px] text-slate-400">
                          {formatAltitude(ac.altitudeFt)} · {formatSpeed(ac.groundSpeedKt)} ·{' '}
                          {formatDistance(ac.distanceMi)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </KioskTicker>
            </div>
          )}
        </footer>
      )}

    </div>
  );
}
