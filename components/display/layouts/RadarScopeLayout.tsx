'use client';

import { useEffect } from 'react';
import type { DisplayLayoutProps } from '@/types/display';
import { RADAR_SWEEP_DURATION_SEC } from '@/lib/constants';
import { RADAR_SWEEP_ARM_LENGTH, RADAR_SWEEP_START_BEARING } from '@/lib/radarPosition';
import { useRadarSweepBlips } from '@/hooks/useRadarSweepBlips';
import { displayIdentifier } from '@/lib/aircraftUtils';
import { getDisplayEmptyState } from '@/lib/displayEmptyState';

export default function RadarScopeLayout({
  displayedAircraft,
  settings,
  status,
  lastUpdated,
  featured,
  errorMessage,
  trackLabel,
  trackStatus,
  onRefresh,
}: DisplayLayoutProps) {
  const blips = useRadarSweepBlips(
    displayedAircraft,
    settings.lat,
    settings.lon,
    settings.radiusMi
  );

  const sweepStartRad = ((RADAR_SWEEP_START_BEARING - 90) * Math.PI) / 180;
  const sweepArmX = 50 + Math.cos(sweepStartRad) * RADAR_SWEEP_ARM_LENGTH;
  const sweepArmY = 50 + Math.sin(sweepStartRad) * RADAR_SWEEP_ARM_LENGTH;

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

  useEffect(() => {
    const id = window.setInterval(() => void onRefresh(), RADAR_SWEEP_DURATION_SEC * 1000);
    return () => window.clearInterval(id);
  }, [onRefresh]);

  return (
    <div className="flex h-full flex-col bg-background font-mono text-foreground">
      <section className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-1 md:p-2 safe-top">
        <div className="pointer-events-none absolute inset-x-2 top-2 z-10 flex items-start justify-between gap-2 sm:inset-x-3 sm:top-3">
          <div className="min-w-0">
            <p className="truncate text-[10px] uppercase tracking-widest text-accent sm:text-xs">
              ATC RADAR // {settings.locationLabel.toUpperCase()}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted sm:text-xs">
              Targets · {displayedAircraft.length}
            </p>
          </div>
          <div className="shrink-0 text-right text-[10px] text-muted">
            <p>RNG {settings.radiusMi}MI</p>
            <p>{lastUpdated?.toLocaleTimeString() ?? 'NO SYNC'}</p>
            <p className="uppercase">{status}</p>
          </div>
        </div>

        {displayedAircraft.length === 0 && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <p
              className="text-lg font-bold uppercase tracking-[0.25em] text-accent"
              style={{ textShadow: 'var(--glow)' }}
            >
              {emptyState.title}
              <span className="animate-pulse">_</span>
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              {emptyState.subtitle}
            </p>
          </div>
        )}

        <div className="aspect-square h-full max-h-full w-full max-w-full">
          <style>{`
            @keyframes radar-sweep-rotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .radar-sweep-arm {
              transform-origin: 50px 50px;
              animation: radar-sweep-rotate ${RADAR_SWEEP_DURATION_SEC}s linear infinite;
            }
          `}</style>
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
            <g className="radar-sweep-arm">
              <line
                x1="50"
                y1="50"
                x2={sweepArmX}
                y2={sweepArmY}
                stroke="var(--accent)"
                strokeWidth="0.6"
                opacity="0.7"
              />
            </g>
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
    </div>
  );
}
