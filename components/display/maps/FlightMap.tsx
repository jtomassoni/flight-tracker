'use client';

import { useMemo } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Circle, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import type { NormalizedAircraft } from '@/types/aircraft';
import { displayIdentifier, formatAltitude, getVerticalTrend } from '@/lib/aircraftUtils';

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

const TREND_COLOR: Record<string, string> = {
  climbing: '#22d3ee',
  descending: '#f97316',
  level: '#a3e635',
};

type FlightMapProps = {
  centerLat: number;
  centerLon: number;
  radiusMi: number;
  aircraft: NormalizedAircraft[];
  locationLabel: string;
};

function milesToMeters(mi: number): number {
  return mi * 1609.344;
}

export default function FlightMap({
  centerLat,
  centerLon,
  radiusMi,
  aircraft,
  locationLabel,
}: FlightMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  const isCompact = useMediaQuery('(max-width: 1023px)');

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'flight-tracker-google-map',
    googleMapsApiKey: apiKey,
  });

  const center = useMemo(() => ({ lat: centerLat, lng: centerLon }), [centerLat, centerLon]);

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      mapTypeId: 'hybrid',
      disableDefaultUI: isCompact,
      zoomControl: !isCompact,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      gestureHandling: 'greedy',
      minZoom: 8,
      maxZoom: 14,
      clickableIcons: false,
    }),
    [isCompact]
  );

  if (!apiKey) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-slate-900 p-8 text-center text-slate-200">
        <p className="text-lg font-semibold">Google Maps API key required</p>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          Add <code className="text-cyan-300">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to{' '}
          <code className="text-cyan-300">.env.local</code> and enable Maps JavaScript API in
          Google Cloud Console.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-900 p-8 text-red-300">
        Failed to load Google Maps.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-900 text-slate-400">
        Loading map…
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={center}
      zoom={10}
      options={mapOptions}
    >
      <Marker
        position={center}
        title={locationLabel}
        label={{ text: 'ZIP', color: '#ffffff', fontWeight: '700' }}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#ffffff',
          fillOpacity: 1,
          strokeColor: '#0f172a',
          strokeWeight: 2,
        }}
      />

      <Circle
        center={center}
        radius={milesToMeters(radiusMi)}
        options={{
          strokeColor: '#38bdf8',
          strokeOpacity: 0.85,
          strokeWeight: 2,
          fillColor: '#38bdf8',
          fillOpacity: 0.08,
        }}
      />

      {aircraft.map((ac) => {
        const trend = getVerticalTrend(ac.verticalRateFpm);
        const color = TREND_COLOR[trend] ?? '#38bdf8';
        const heading = ac.headingDeg ?? 0;
        const label = displayIdentifier(ac);

        return (
          <Marker
            key={ac.hex}
            position={{ lat: ac.lat, lng: ac.lon }}
            title={`${label} · ${formatAltitude(ac.altitudeFt)} · ${trend}`}
            label={{
              text: label.slice(0, 8),
              color: '#0f172a',
              fontSize: '11px',
              fontWeight: '700',
            }}
            icon={{
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 5,
              fillColor: color,
              fillOpacity: 0.95,
              strokeColor: '#0f172a',
              strokeWeight: 1,
              rotation: heading,
            }}
          />
        );
      })}
    </GoogleMap>
  );
}
