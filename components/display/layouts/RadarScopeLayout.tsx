'use client';

import type { DisplayLayoutProps } from '@/types/display';
import { toRadarBlips } from '@/lib/radarPosition';
import {
  displayIdentifier,
  formatAltitude,
  formatDistance,
  formatHeading,
  formatSpeed,
  getVerticalTrend,
} from '@/lib/aircraftUtils';
import { useLayoutDensity } from '@/hooks/useLayoutDensity';
import FlightListState from '../shared/FlightListState';
import KioskScrollRegion from '../shared/KioskScrollRegion';

function TargetList({
  displayedAircraft,
  status,
  settings,
  featured,
  compact,
}: {
  displayedAircraft: DisplayLayoutProps['displayedAircraft'];
  status: DisplayLayoutProps['status'];
  settings: DisplayLayoutProps['settings'];
  featured: DisplayLayoutProps['featured'];
  compact: boolean;
}) {
  return (
    <aside
      className={`flex min-h-0 flex-col ${
        compact
          ? 'max-h-[38dvh] flex-1'
          : 'w-[12.5rem] shrink-0 border-r border-border sm:w-[13.5rem] lg:w-[14.5rem]'
      }`}
    >
      <div className="shrink-0 border-b border-border px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-muted">
        Targets · {displayedAircraft.length}
      </div>
      <KioskScrollRegion className="min-h-0 flex-1" durationSec={34}>
        <FlightListState status={status} count={displayedAircraft.length} />
        {displayedAircraft.map((ac, i) => {
          const isFeatured = featured?.hex === ac.hex;
          return (
            <div
              key={ac.hex}
              className={`border-b border-border/40 px-2.5 py-1.5 ${isFeatured ? 'bg-accent/10' : ''}`}
            >
              <div className="flex items-baseline justify-between gap-1.5">
                <span className="truncate text-[11px] font-bold text-accent">
                  {displayIdentifier(ac)}
                </span>
                <span className="shrink-0 text-[10px] text-muted">{formatDistance(ac.distanceMi)}</span>
              </div>
              <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0 text-[9px] leading-tight text-muted">
                <span>{formatAltitude(ac.altitudeFt)}</span>
                <span>{formatSpeed(ac.groundSpeedKt)}</span>
                <span>{formatHeading(ac.headingDeg)}</span>
                <span className="capitalize text-accent/75">{getVerticalTrend(ac.verticalRateFpm)}</span>
              </div>
            </div>
          );
        })}
      </KioskScrollRegion>
      <div className="safe-bottom shrink-0 border-t border-border px-2.5 py-1 text-[9px] text-muted">
        {status.toUpperCase()} · {settings.radiusMi}MI · ZIP {settings.zipCode}
      </div>
    </aside>
  );
}

export default function RadarScopeLayout({
  displayedAircraft,
  settings,
  status,
  lastUpdated,
  featured,
}: DisplayLayoutProps) {
  const { viewport, isDeskPortrait } = useLayoutDensity();
  const stacked = viewport === 'compact' || isDeskPortrait;
  const blips = toRadarBlips(
    displayedAircraft,
    settings.lat,
    settings.lon,
    settings.radiusMi
  );

  const targetList = (
    <TargetList
      displayedAircraft={displayedAircraft}
      status={status}
      settings={settings}
      featured={featured}
      compact={stacked}
    />
  );

  return (
    <div className={`flex h-full bg-background font-mono text-foreground ${stacked ? 'flex-col' : 'flex-row'}`}>
      {!stacked && targetList}

      <section
        className={`relative flex min-h-0 min-w-0 items-center justify-center overflow-hidden p-1 md:p-2 ${
          stacked ? 'flex-[1.2] border-b border-border safe-top' : 'flex-1'
        }`}
      >
        <div className="pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-2 sm:inset-x-3 sm:top-3">
          <p className="truncate text-[10px] uppercase tracking-widest text-accent sm:text-xs">
            ATC RADAR // {settings.locationLabel.toUpperCase()}
          </p>
          <div className="shrink-0 text-right text-[10px] text-muted">
            <p>RNG {settings.radiusMi}MI</p>
            <p>{lastUpdated?.toLocaleTimeString() ?? 'NO SYNC'}</p>
          </div>
        </div>

        <div className="aspect-square h-full max-h-full w-full max-w-full">
          <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="radarGlow">
                <stop offset="0%" stopColor="rgba(57,255,106,0.08)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#radarGlow)" stroke="var(--border)" strokeWidth="0.5" />
            {[12, 24, 36].map((r) => (
              <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="0.3" opacity="0.6" />
            ))}
            <line x1="50" y1="2" x2="50" y2="98" stroke="var(--border)" strokeWidth="0.3" opacity="0.5" />
            <line x1="2" y1="50" x2="98" y2="50" stroke="var(--border)" strokeWidth="0.3" opacity="0.5" />
            <line x1="50" y1="50" x2="92" y2="30" stroke="var(--accent)" strokeWidth="0.6" opacity="0.7">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 50 50"
                to="360 50 50"
                dur="6s"
                repeatCount="indefinite"
              />
            </line>
            <circle cx="50" cy="50" r="1.5" fill="var(--accent)" />
            {blips.map(({ aircraft, x, y }) => {
              const isFeatured = featured?.hex === aircraft.hex;
              return (
                <g key={aircraft.hex}>
                  <circle
                    cx={x * 100}
                    cy={y * 100}
                    r={isFeatured ? 2.2 : 1.4}
                    fill={isFeatured ? 'var(--accent)' : 'var(--foreground)'}
                    opacity={isFeatured ? 1 : 0.75}
                    style={isFeatured ? { filter: 'drop-shadow(0 0 4px var(--accent))' } : undefined}
                  />
                  <text
                    x={x * 100 + 2.5}
                    y={y * 100 + 1}
                    fontSize="2.5"
                    fill="var(--accent)"
                    opacity="0.9"
                  >
                    {displayIdentifier(aircraft).slice(0, 6)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      {stacked && targetList}
    </div>
  );
}
