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
import AdminLink from '../shared/AdminLink';
import FlightListState from '../shared/FlightListState';
import KioskScrollRegion from '../shared/KioskScrollRegion';

export default function RadarScopeLayout({
  displayedAircraft,
  settings,
  status,
  lastUpdated,
  featured,
}: DisplayLayoutProps) {
  const { viewport, isDeskPortrait } = useLayoutDensity();
  const blips = toRadarBlips(
    displayedAircraft,
    settings.lat,
    settings.lon,
    settings.radiusMi
  );

  return (
    <div
      className={`flex h-full bg-background font-mono text-foreground ${viewport === 'compact' || isDeskPortrait ? 'flex-col' : 'flex-row'}`}
    >
      <section
        className={`relative flex min-h-0 items-center justify-center p-3 safe-top md:p-4 ${
          viewport === 'compact' || isDeskPortrait
            ? 'flex-[1.1] border-b border-border'
            : 'flex-1 border-r border-border'
        }`}
      >
        <div className="absolute left-3 top-3 max-w-[55%] truncate text-[10px] uppercase tracking-widest text-accent sm:left-4 sm:top-4 sm:max-w-none sm:text-xs">
          ATC RADAR // {settings.locationLabel.toUpperCase()}
        </div>
        <div className="absolute right-3 top-3 text-right text-[10px] text-muted sm:right-4 sm:top-4">
          <p>RNG {settings.radiusMi}MI</p>
          <p>{lastUpdated?.toLocaleTimeString() ?? 'NO SYNC'}</p>
        </div>

        <svg
          viewBox="0 0 100 100"
          className={
            viewport === 'compact' || isDeskPortrait
              ? 'h-[min(68vw,38dvh)] w-[min(68vw,38dvh)]'
              : viewport === 'desk'
                ? 'h-[min(52vw,58dvh)] w-[min(52vw,58dvh)] max-w-lg'
                : 'h-[min(58vh,36vw)] w-[min(58vh,36vw)] max-w-2xl'
          }
        >
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
      </section>

      <aside
        className={`flex w-full flex-col ${
          viewport === 'compact' || isDeskPortrait
            ? 'max-h-[40dvh] flex-1'
            : 'min-h-0 w-72 flex-1 lg:w-96'
        }`}
      >
        <div className="border-b border-border px-4 py-3 text-xs uppercase tracking-widest text-muted">
          Target List · {displayedAircraft.length}
        </div>
        <KioskScrollRegion className="min-h-0 flex-1" durationSec={34}>
          <FlightListState status={status} count={displayedAircraft.length} />
          {displayedAircraft.map((ac, i) => (
            <div
              key={ac.hex}
              className={`border-b border-border/40 px-4 py-3 text-xs ${i === 0 ? 'bg-accent/10' : ''}`}
            >
              <div className="flex justify-between gap-2">
                <span className="font-bold text-accent">{displayIdentifier(ac)}</span>
                <span className="text-muted">{formatDistance(ac.distanceMi)}</span>
              </div>
              <div
                className={`mt-1 grid gap-1 text-[10px] text-muted ${viewport === 'desk' ? 'grid-cols-2' : 'grid-cols-3'}`}
              >
                <span>{formatAltitude(ac.altitudeFt)}</span>
                <span>{formatSpeed(ac.groundSpeedKt)}</span>
                {viewport !== 'desk' && <span>{formatHeading(ac.headingDeg)}</span>}
              </div>
              <p className="mt-1 text-[10px] capitalize text-accent/80">
                {getVerticalTrend(ac.verticalRateFpm)}
              </p>
            </div>
          ))}
        </KioskScrollRegion>
        <div className="border-t border-border px-4 py-2 text-[10px] text-muted">
          {status.toUpperCase()} · ZIP {settings.zipCode}
        </div>
      </aside>
      <AdminLink />
    </div>
  );
}
