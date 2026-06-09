'use client';

import dynamic from 'next/dynamic';
import type { DisplayLayoutProps } from '@/types/display';
import {
  displayIdentifier,
  formatAltitude,
  formatDistance,
  formatSpeed,
  getVerticalTrend,
} from '@/lib/aircraftUtils';
import AdminLink from '../shared/AdminLink';

const FlightMap = dynamic(() => import('../maps/FlightMap'), { ssr: false });

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
  onRefresh,
}: DisplayLayoutProps) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-950">
      <div className="absolute inset-0">
        <FlightMap
          centerLat={settings.lat}
          centerLon={settings.lon}
          radiusMi={settings.radiusMi}
          aircraft={displayedAircraft}
          locationLabel={settings.locationLabel}
        />
      </div>

      <header className="pointer-events-none relative z-10 flex flex-col gap-2 p-3 safe-top sm:flex-row sm:items-start sm:justify-between sm:p-4">
        <div className="pointer-events-auto rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2 shadow-lg backdrop-blur-md sm:px-4 sm:py-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-sky-300/80">Live Airspace</p>
          <h1 className="text-lg font-bold text-white sm:text-xl md:text-2xl">Sky Map</h1>
          <p className="truncate text-[11px] text-slate-300 sm:text-xs">
            {settings.locationLabel} · ZIP {settings.zipCode} · {settings.radiusMi} mi
          </p>
        </div>

        <div className="pointer-events-auto shrink-0 self-end rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2 text-right text-xs text-slate-300 backdrop-blur-md sm:self-auto">
          <p>{displayedAircraft.length} aircraft</p>
          <p>{lastUpdated?.toLocaleTimeString() ?? '—'}</p>
          <p className="capitalize text-slate-400">{status}</p>
          <button
            type="button"
            onClick={onRefresh}
            className="mt-1 font-semibold text-sky-300 hover:underline"
          >
            Refresh
          </button>
        </div>
      </header>

      {displayedAircraft.length > 0 && (
        <footer className="pointer-events-none relative z-10 mt-auto p-2 safe-bottom sm:p-3 md:p-4">
          <div className="pointer-events-auto overflow-x-auto rounded-xl border border-white/15 bg-slate-950/85 p-2 shadow-lg backdrop-blur-md [-webkit-overflow-scrolling:touch]">
            <div className="flex gap-2 pb-0.5">
              {displayedAircraft.map((ac) => {
                const trend = getVerticalTrend(ac.verticalRateFpm);
                return (
                  <div
                    key={ac.hex}
                    className="min-w-[8.5rem] shrink-0 rounded-lg border border-white/10 bg-slate-900/70 px-2.5 py-2 sm:min-w-[9.5rem] sm:px-3"
                  >
                    <p className="truncate font-mono text-sm font-bold text-white">
                      {displayIdentifier(ac)}
                    </p>
                    <p className={`text-[10px] capitalize ${TREND_COLOR[trend] ?? 'text-slate-300'}`}>
                      {trend}
                    </p>
                    <p className="font-mono text-[10px] text-slate-400">
                      {formatAltitude(ac.altitudeFt)} · {formatSpeed(ac.groundSpeedKt)} ·{' '}
                      {formatDistance(ac.distanceMi)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </footer>
      )}

      <AdminLink />
    </div>
  );
}
