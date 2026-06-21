'use client';

import { useLayoutDensity } from '@/hooks/useLayoutDensity';
import type { DisplayLayoutProps } from '@/types/display';
import AirlineLogoImage from '@/components/display/shared/AirlineLogoImage';
import { getAircraftDisplayBrand, getAirlineTileStyle } from '@/lib/airlines';
import {
  displayIdentifier,
  formatAltitude,
  formatDistance,
  formatHeading,
  formatSpeed,
  getVerticalTrend,
} from '@/lib/aircraftUtils';
import { getDisplayEmptyState } from '@/lib/displayEmptyState';
import './airline-gallery.css';

export default function AirlineGalleryLayout({
  displayedAircraft,
  settings,
  status,
  lastUpdated,
  provider,
  errorMessage,
  trackLabel,
  trackStatus,
}: DisplayLayoutProps) {
  const { galleryCols: gridClass, galleryMaxCards, showGalleryStats, viewport } =
    useLayoutDensity();
  const visibleAircraft = displayedAircraft.slice(0, galleryMaxCards);
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
        {displayedAircraft.length === 0 ? (
          <div className="gallery-empty flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="gallery-empty__panel flex flex-col items-center gap-4 rounded-3xl px-10 py-12">
              <span className="gallery-empty__icon" aria-hidden>
                {feedDown ? (
                  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 8.5C7.5 4 16.5 4 22 8.5" opacity="0.4" />
                    <path d="M5.5 12C9 9.5 15 9.5 18.5 12" opacity="0.7" />
                    <path d="M9 15.5c1.8-1.3 4.2-1.3 6 0" />
                    <path d="M3 3 21 21" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.8 19.2 16 11l3.5-3.5a1.7 1.7 0 0 0-2.4-2.4L13.6 8.6 5.4 6.8a1 1 0 0 0-.9 1.7L9 11l-2 2-2.5-.5a.8.8 0 0 0-.7 1.3L6 17l2.2 2.5a.8.8 0 0 0 1.3-.7L9 16.3l2-2 2.6 4.4a1 1 0 0 0 1.7-.9z" />
                  </svg>
                )}
              </span>
              <h2 className="gallery-empty__title font-display text-2xl font-bold sm:text-3xl">
                {emptyState.title}
              </h2>
              <p className="gallery-empty__sub max-w-sm text-sm text-muted sm:text-base">
                {emptyState.subtitle}
              </p>
            </div>
          </div>
        ) : (
        <div className={`grid gap-3 sm:gap-4 ${gridClass}`}>
          {visibleAircraft.map((ac) => {
            const brand = getAircraftDisplayBrand(ac);
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
                    <AirlineLogoImage
                      brand={brand}
                      size={128}
                      background={tile.logoBackground}
                      alt={brand.name}
                      fill
                      className="object-contain p-2"
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

                <div className="gallery-stats-grid grid flex-1 grid-cols-2 gap-1.5 p-3">
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
                  ).map(([label, value], i) => {
                    const spaceIdx = value.lastIndexOf(' ');
                    const main = spaceIdx > 0 ? value.slice(0, spaceIdx) : value;
                    const unit = spaceIdx > 0 ? value.slice(spaceIdx + 1) : '';
                    return (
                      <div
                        key={label}
                        className={`gallery-stat flex h-full flex-col justify-between rounded-lg px-4 py-3 ${i % 2 === 1 ? 'gallery-stat--alt' : ''}`}
                      >
                        <p
                          className="relative text-[11px] font-semibold uppercase tracking-wider"
                          style={{ color: tile.labelColor }}
                        >
                          {label}
                        </p>
                        <p className="gallery-stat__value relative mt-1 flex items-baseline gap-1 font-mono leading-none">
                          <span className="text-3xl font-bold sm:text-4xl">{main}</span>
                          {unit && (
                            <span
                              className="text-sm font-semibold uppercase tracking-wide"
                              style={{ color: tile.labelColor }}
                            >
                              {unit}
                            </span>
                          )}
                        </p>
                      </div>
                    );
                  })}
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
        )}
      </div>

      <footer className="gallery-footer safe-bottom shrink-0 border-t border-border/60 px-4 py-2 sm:px-6">
        <span className="text-xs text-muted sm:text-sm">
          ZIP {settings.zipCode} · {settings.radiusMi} mi radius
        </span>
      </footer>
    </div>
  );
}
