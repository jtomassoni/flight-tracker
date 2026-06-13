import type { NormalizedAircraft } from '@/types/aircraft';
import { getAircraftDisplayBrand } from '@/lib/airlines';
import { formatAircraftTypeDisplay } from '@/lib/aircraftTypes';
import {
  displayIdentifier,
  formatAltitude,
  formatDistance,
  formatHeading,
  formatSpeed,
  formatVerticalRate,
  getVerticalTrend,
} from '@/lib/aircraftUtils';

const TREND_COLOR: Record<string, string> = {
  climbing: '#22d3ee',
  descending: '#f97316',
  level: '#a3e635',
};

type AircraftMapInfoProps = {
  aircraft: NormalizedAircraft;
  pinned?: boolean;
};

export default function AircraftMapInfo({ aircraft, pinned }: AircraftMapInfoProps) {
  const brand = getAircraftDisplayBrand(aircraft);
  const trend = getVerticalTrend(aircraft.verticalRateFpm);
  const trendColor = TREND_COLOR[trend] ?? '#94a3b8';

  return (
    <div className="min-w-[10.5rem] max-w-[14rem] p-0.5 font-sans text-slate-900">
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-sm font-bold leading-tight">{displayIdentifier(aircraft)}</p>
        {pinned && (
          <span className="shrink-0 rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-sky-700">
            Pinned
          </span>
        )}
      </div>
      <p className="mt-0.5 text-xs text-slate-600">{brand.name}</p>

      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        <div>
          <dt className="text-slate-500">Altitude</dt>
          <dd className="font-mono font-semibold">{formatAltitude(aircraft.altitudeFt)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Speed</dt>
          <dd className="font-mono font-semibold">{formatSpeed(aircraft.groundSpeedKt)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Heading</dt>
          <dd className="font-mono font-semibold">{formatHeading(aircraft.headingDeg)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Distance</dt>
          <dd className="font-mono font-semibold">{formatDistance(aircraft.distanceMi)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Trend</dt>
          <dd className="font-mono font-semibold capitalize" style={{ color: trendColor }}>
            {trend}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">V/S</dt>
          <dd className="font-mono font-semibold">{formatVerticalRate(aircraft.verticalRateFpm)}</dd>
        </div>
      </dl>

      {(aircraft.aircraftType || aircraft.squawk) && (
        <p className="mt-2 border-t border-slate-200 pt-2 font-mono text-[10px] text-slate-500">
          {aircraft.aircraftType && (
            <span>{formatAircraftTypeDisplay(aircraft.aircraftType)}</span>
          )}
          {aircraft.aircraftType && aircraft.squawk && <span> · </span>}
          {aircraft.squawk && <span>SQ {aircraft.squawk}</span>}
        </p>
      )}
    </div>
  );
}
