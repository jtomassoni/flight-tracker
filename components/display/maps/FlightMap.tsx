'use client';

import { useMemo } from 'react';
import { useKioskViewport } from '@/hooks/useKioskViewport';
import { displayIdentifier, getVerticalTrend } from '@/lib/aircraftUtils';
import {
  buildAircraftMarkerIcon,
  buildCenterMarkerIcon,
  SKY_MAP_STYLES,
} from '@/lib/mapMarkers';
import { skyMapZoomForViewport, skyMapZoomLimits, type SkyMapZoomMode } from '@/lib/skyMapZoom';
import { Circle, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import type { NormalizedAircraft } from '@/types/aircraft';

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
  skyMapZoom: SkyMapZoomMode;
};

function milesToMeters(mi: number): number {
  return mi * 1609.344;
}

export default function FlightMap({
  centerLat,
  centerLon,
  radiusMi,
  aircraft,
  skyMapZoom,
}: FlightMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  const viewport = useKioskViewport();
  const mapZoom = skyMapZoomForViewport(skyMapZoom, viewport);
  const { minZoom, maxZoom } = skyMapZoomLimits();

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'flight-tracker-google-map',
    googleMapsApiKey: apiKey,
  });

  const center = useMemo(() => ({ lat: centerLat, lng: centerLon }), [centerLat, centerLon]);

  const centerIcon = useMemo(() => {
    if (!isLoaded) return null;
    const icon = buildCenterMarkerIcon();
    return {
      url: icon.url,
      scaledSize: new google.maps.Size(icon.width, icon.height),
      anchor: new google.maps.Point(icon.anchorX, icon.anchorY),
    };
  }, [isLoaded]);

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      mapTypeId: 'hybrid',
      styles: SKY_MAP_STYLES,
      disableDefaultUI: true,
      draggable: false,
      scrollwheel: false,
      disableDoubleClickZoom: true,
      gestureHandling: 'none',
      keyboardShortcuts: false,
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      minZoom,
      maxZoom,
      clickableIcons: false,
    }),
    [minZoom, maxZoom]
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
      zoom={mapZoom}
      options={mapOptions}
    >
      {centerIcon && <Marker position={center} icon={centerIcon} clickable={false} />}

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
        const iconDef = buildAircraftMarkerIcon(label, heading, color, viewport);

        return (
          <Marker
            key={ac.hex}
            position={{ lat: ac.lat, lng: ac.lon }}
            clickable={false}
            icon={{
              url: iconDef.url,
              scaledSize: new google.maps.Size(iconDef.width, iconDef.height),
              anchor: new google.maps.Point(iconDef.anchorX, iconDef.anchorY),
            }}
          />
        );
      })}
    </GoogleMap>
  );
}
