'use client';

import Image from 'next/image';
import { useLayoutDensity } from '@/hooks/useLayoutDensity';
import type { DisplayLayoutProps } from '@/types/display';
import { airlineLogoUrl, getAirlineBrand, getAirlineTileStyle } from '@/lib/airlines';
import {
  displayIdentifier,
  formatAltitude,
  formatDistance,
  formatHeading,
  formatSpeed,
  getVerticalTrend,
} from '@/lib/aircraftUtils';
import FlightListState from '../shared/FlightListState';
import './airline-gallery.css';

export default function AirlineGalleryLayout({
  displayedAircraft,
  settings,
  status,
  lastUpdated,
  provider,
}: DisplayLayoutProps) {
  const { galleryCols: gridClass, galleryMaxCards, showGalleryStats, viewport } =
    useLayoutDensity();
  const visibleAircraft = displayedAircraft.slice(0, galleryMaxCards);

  return (
    <div className="gallery-shell flex h-full flex-col overflow-hidden font-display text-foreground">
      <header className="gallery-header safe-top shrink-0 flex flex-wrap items-end justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
        <div className="min-w-0">
          <p className="gallery-kicker text-xs font-semibold uppercase tracking-[0.2em]">Live Traffic</p>
          <h1
            className={`gallery-title font-bold ${viewport === 'desk' ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl md:text-4xl'}`}
          >
            Flights Over {settings.locationLabel}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="gallery-pill rounded-full px-3 py-1 text-xs text-muted">
            {displayedAircraft.length} aircraft
          </span>
          <span className="gallery-pill rounded-full px-3 py-1 text-xs text-muted">
            {settings.radiusMi} mi
          </span>
          <span className="gallery-pill rounded-full px-3 py-1 text-xs text-muted">
            {lastUpdated?.toLocaleTimeString() ?? '—'}
          </span>
        </div>
      </header>

      <div className="gallery-body min-h-0 flex-1 overflow-hidden p-[var(--kiosk-pad)]">
        <FlightListState status={status} count={displayedAircraft.length} />
        <div className={`grid gap-3 sm:gap-4 ${gridClass}`}>
          {visibleAircraft.map((ac) => {
            const brand = getAirlineBrand(ac.callsign);
            const tile = getAirlineTileStyle(brand);
            const id = displayIdentifier(ac);
            const trend = getVerticalTrend(ac.verticalRateFpm);

            return (
              <article
                key={ac.hex}
                className="gallery-card flex flex-col overflow-hidden rounded-2xl"
                style={{
                  background: tile.cardBackground,
                  border: `2px solid ${tile.borderColor}`,
                  color: tile.textColor,
                  ['--tile-border' as string]: tile.borderColor,
                  ['--tile-glow' as string]: tile.borderColor,
                  ['--tile-badge' as string]: tile.badgeBackground,
                  ['--tile-stat-bg' as string]: tile.statBackground,
                  ['--tile-stat-alt-bg' as string]: tile.statAltBackground,
                }}
              >
                <div
                  className="gallery-card__accent-bar h-2 shrink-0"
                  style={{ background: tile.accentBarColor }}
                  aria-hidden
                />

                <div
                  className="gallery-card__header flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4"
                  style={{ background: tile.headerBackground }}
                >
                  <div
                    className="gallery-card__logo relative h-14 w-14 shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-16"
                    style={{
                      backgroundColor: tile.logoBackground,
                      border: `1px solid ${tile.borderColor}44`,
                    }}
                  >
                    <Image
                      src={airlineLogoUrl(brand, 128)}
                      alt={brand.name}
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                  <div className="relative min-w-0">
                    <p
                      className="truncate text-xl font-bold tracking-tight sm:text-2xl"
                      style={{ color: tile.headerTextColor }}
                    >
                      {id}
                    </p>
                    <p className="text-sm font-semibold" style={{ color: tile.headerTextColor }}>
                      {brand.name}
                    </p>
                    <p
                      className="mt-0.5 font-mono text-[10px] uppercase tracking-widest"
                      style={{ color: tile.headerMutedColor }}
                    >
                      {brand.icao} · {brand.iata}
                    </p>
                  </div>
                </div>

                <div className="gallery-stats-grid grid grid-cols-2 gap-1.5 p-3">
                  {(showGalleryStats
                    ? [
                        ['Distance', formatDistance(ac.distanceMi)],
                        ['Altitude', formatAltitude(ac.altitudeFt)],
                        ['Speed', formatSpeed(ac.groundSpeedKt)],
                        ['Heading', formatHeading(ac.headingDeg)],
                      ]
                    : [
                        ['Distance', formatDistance(ac.distanceMi)],
                        ['Altitude', formatAltitude(ac.altitudeFt)],
                      ]
                  ).map(([label, value], i) => (
                    <div
                      key={label}
                      className={`gallery-stat rounded-lg px-3 py-2.5 ${i % 2 === 1 ? 'gallery-stat--alt' : ''}`}
                    >
                      <p
                        className="relative text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: tile.labelColor }}
                      >
                        {label}
                      </p>
                      <p className="gallery-stat__value relative mt-0.5 font-mono text-lg font-semibold">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-auto flex items-center justify-between px-5 py-3"
                  style={{ borderTop: `1px solid ${tile.borderColor}55` }}
                >
                  <span
                    className="gallery-badge rounded-full px-3 py-1 text-xs font-semibold capitalize"
                    style={{ color: tile.badgeTextColor }}
                  >
                    {trend}
                  </span>
                  {showGalleryStats && (
                    <span className="font-mono text-[10px]" style={{ color: tile.mutedTextColor }}>
                      {provider}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <footer className="gallery-footer safe-bottom shrink-0 border-t border-border/60 px-4 py-2 sm:px-6">
        <span className="text-xs text-muted sm:text-sm">
          ZIP {settings.zipCode} · {settings.radiusMi} mi radius
        </span>
      </footer>
    </div>
  );
}
