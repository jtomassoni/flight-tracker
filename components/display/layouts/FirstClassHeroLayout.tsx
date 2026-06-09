'use client';

import Image from 'next/image';
import type { DisplayLayoutProps } from '@/types/display';
import { getAirlineBrand } from '@/lib/airlines';
import {
  displayIdentifier,
  formatAltitude,
  formatDistance,
  formatHeading,
  formatSpeed,
  formatVerticalRate,
  getVerticalTrend,
} from '@/lib/aircraftUtils';
import { useLayoutDensity } from '@/hooks/useLayoutDensity';
import AdminLink from '../shared/AdminLink';
import FlightListState from '../shared/FlightListState';
import KioskScrollRegion from '../shared/KioskScrollRegion';

export default function FirstClassHeroLayout({
  displayedAircraft,
  featured,
  settings,
  status,
  lastUpdated,
}: DisplayLayoutProps) {
  const { trafficCols: gridClass, viewport } = useLayoutDensity();
  const hero = featured;
  const rest = displayedAircraft.slice(1);
  const brand = hero ? getAirlineBrand(hero.callsign) : null;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background font-serif text-foreground">
      <header className="safe-top flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3 md:px-6">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.35em] text-accent">First Class</p>
          <h1 className="truncate text-lg font-bold italic text-foreground md:text-xl">
            {settings.locationLabel}
          </h1>
        </div>
        <p className="shrink-0 font-mono text-[10px] text-muted sm:text-xs">
          <span className="hidden sm:inline">ZIP {settings.zipCode} · </span>
          {lastUpdated?.toLocaleTimeString() ?? '—'}
        </p>
      </header>

      {!hero ? (
        <FlightListState status={status} count={0} />
      ) : (
        <section className="shrink-0 border-b border-border bg-panel/40 px-4 py-4 md:px-6">
          <div
            className="relative overflow-hidden rounded-xl border border-accent/25 p-4 md:p-5"
            style={{
              background: brand
                ? `linear-gradient(135deg, ${brand.primaryColor}18, var(--panel))`
                : undefined,
            }}
          >
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              {brand && (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-accent/30 bg-background/50 md:h-16 md:w-16">
                  <Image src={brand.logoUrl} alt={brand.name} fill className="object-contain p-2" unoptimized />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Primary Track</p>
                <p
                  className="truncate text-3xl font-bold italic text-accent md:text-4xl"
                  style={{ textShadow: 'var(--glow)' }}
                >
                  {displayIdentifier(hero)}
                </p>
                <p className="truncate text-sm text-muted">{brand?.name ?? 'Unidentified'}</p>
              </div>
              <div
                className={`grid w-full gap-3 md:w-auto ${
                  viewport === 'desk'
                    ? 'grid-cols-2 md:min-w-[16rem]'
                    : 'grid-cols-2 sm:grid-cols-4 md:min-w-[28rem]'
                }`}
              >
                {(viewport === 'desk'
                  ? [
                      ['Distance', formatDistance(hero.distanceMi)],
                      ['Altitude', formatAltitude(hero.altitudeFt)],
                    ]
                  : [
                      ['Distance', formatDistance(hero.distanceMi)],
                      ['Altitude', formatAltitude(hero.altitudeFt)],
                      ['Speed', formatSpeed(hero.groundSpeedKt)],
                      ['Trend', getVerticalTrend(hero.verticalRateFpm)],
                    ]
                ).map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-border/60 bg-background/30 px-3 py-2">
                    <p className="text-[9px] uppercase tracking-widest text-muted">{label}</p>
                    <p className="mt-0.5 font-mono text-base capitalize text-foreground md:text-lg">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            {viewport !== 'desk' && (
              <p className="mt-3 font-mono text-[10px] text-muted">
                Hdg {formatHeading(hero.headingDeg)} · {formatVerticalRate(hero.verticalRateFpm)}
              </p>
            )}
          </div>
        </section>
      )}

      <section className="flex min-h-0 flex-1 flex-col px-4 py-3 md:px-6">
        <p className="mb-2 shrink-0 text-[10px] uppercase tracking-[0.3em] text-muted">
          Traffic ({displayedAircraft.length})
        </p>
        {rest.length === 0 && hero ? (
          <p className="text-sm text-muted">No additional aircraft in range.</p>
        ) : (
          <KioskScrollRegion className="min-h-0 flex-1" durationSec={38}>
            <div className={`grid gap-2 ${gridClass}`}>
            {rest.map((ac) => {
              const b = getAirlineBrand(ac.callsign);
              const trend = getVerticalTrend(ac.verticalRateFpm);
              return (
                <div
                  key={ac.hex}
                  className="rounded-lg border border-accent/20 bg-panel p-3"
                  style={{ borderLeftWidth: 3, borderLeftColor: b.primaryColor }}
                >
                  <p className="truncate font-mono text-sm font-semibold text-accent">
                    {displayIdentifier(ac)}
                  </p>
                  <p className="truncate text-[10px] text-muted">{b.name}</p>
                  <div className="mt-2 space-y-0.5 font-mono text-[11px]">
                    <p>{formatAltitude(ac.altitudeFt)}</p>
                    <p className="text-muted">
                      {formatDistance(ac.distanceMi)} · {formatSpeed(ac.groundSpeedKt)}
                    </p>
                    <p className="capitalize text-accent/80">{trend}</p>
                  </div>
                </div>
              );
            })}
            </div>
          </KioskScrollRegion>
        )}
      </section>
      <AdminLink />
    </div>
  );
}
