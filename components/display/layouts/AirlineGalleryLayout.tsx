'use client';

import Image from 'next/image';
import type { DisplayLayoutProps } from '@/types/display';
import { getAirlineBrand, getAirlineTileStyle } from '@/lib/airlines';
import {
  displayIdentifier,
  formatAltitude,
  formatDistance,
  formatHeading,
  formatSpeed,
  getVerticalTrend,
} from '@/lib/aircraftUtils';
import AdminLink from '../shared/AdminLink';
import FlightListState from '../shared/FlightListState';

export default function AirlineGalleryLayout({
  displayedAircraft,
  settings,
  status,
  lastUpdated,
  provider,
  onRefresh,
}: DisplayLayoutProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background font-display text-foreground">
      <header className="safe-top shrink-0 flex flex-wrap items-end justify-between gap-3 border-b border-border px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Live Traffic</p>
          <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            Flights Over {settings.locationLabel}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-border bg-panel px-3 py-1 text-xs text-muted">
            {displayedAircraft.length} aircraft
          </span>
          <span className="rounded-full border border-border bg-panel px-3 py-1 text-xs text-muted">
            {settings.radiusMi} mi
          </span>
          <span className="rounded-full border border-border bg-panel px-3 py-1 text-xs text-muted">
            {lastUpdated?.toLocaleTimeString() ?? '—'}
          </span>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 [-webkit-overflow-scrolling:touch]">
        <FlightListState status={status} count={displayedAircraft.length} />
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {displayedAircraft.map((ac) => {
            const brand = getAirlineBrand(ac.callsign);
            const tile = getAirlineTileStyle(brand);
            const id = displayIdentifier(ac);
            const trend = getVerticalTrend(ac.verticalRateFpm);

            return (
              <article
                key={ac.hex}
                className="flex flex-col overflow-hidden rounded-2xl shadow-lg"
                style={{
                  background: tile.cardBackground,
                  border: `2px solid ${tile.borderColor}`,
                  color: tile.textColor,
                }}
              >
                <div className="h-1.5 shrink-0" style={{ backgroundColor: tile.accentBarColor }} />

                <div
                  className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4"
                  style={{ background: tile.headerBackground }}
                >
                  <div
                    className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl shadow-inner sm:h-16 sm:w-16"
                    style={{ backgroundColor: tile.logoBackground }}
                  >
                    <Image src={brand.logoUrl} alt={brand.name} fill className="object-contain p-2" unoptimized />
                  </div>
                  <div className="min-w-0" style={{ color: tile.badgeTextColor }}>
                    <p className="truncate text-xl font-bold tracking-tight sm:text-2xl">{id}</p>
                    <p className="text-sm opacity-90">{brand.name}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest opacity-75">
                      {brand.icao} · {brand.iata}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 p-3">
                  {[
                    ['Distance', formatDistance(ac.distanceMi)],
                    ['Altitude', formatAltitude(ac.altitudeFt)],
                    ['Speed', formatSpeed(ac.groundSpeedKt)],
                    ['Heading', formatHeading(ac.headingDeg)],
                  ].map(([label, value], i) => (
                    <div
                      key={label}
                      className="rounded-lg px-3 py-2.5"
                      style={{
                        backgroundColor: i % 2 === 0 ? tile.statBackground : tile.statAltBackground,
                      }}
                    >
                      <p
                        className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: tile.labelColor }}
                      >
                        {label}
                      </p>
                      <p className="mt-0.5 font-mono text-lg font-semibold">{value}</p>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-auto flex items-center justify-between px-5 py-3"
                  style={{ borderTop: `1px solid ${tile.borderColor}44` }}
                >
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold capitalize shadow-sm"
                    style={{
                      backgroundColor: tile.badgeBackground,
                      color: tile.badgeTextColor,
                    }}
                  >
                    {trend}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: tile.mutedTextColor }}>
                    {provider}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <footer className="safe-bottom shrink-0 flex items-center justify-between border-t border-border bg-panel/95 px-4 py-3 backdrop-blur sm:px-6">
        <span className="text-sm text-muted">ZIP {settings.zipCode}</span>
        <button onClick={onRefresh} className="text-sm text-accent hover:underline">
          Refresh
        </button>
      </footer>
      <AdminLink />
    </div>
  );
}
