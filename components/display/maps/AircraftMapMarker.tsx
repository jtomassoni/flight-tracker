'use client';

import { memo, useMemo } from 'react';
import { Marker } from '@react-google-maps/api';
import type { KioskViewport } from '@/hooks/useKioskViewport';
import { displayIdentifier, getVerticalTrend } from '@/lib/aircraftUtils';
import { buildAircraftMarkerIcon } from '@/lib/mapMarkers';
import type { NormalizedAircraft } from '@/types/aircraft';

const TREND_COLOR: Record<string, string> = {
  climbing: '#22d3ee',
  descending: '#f97316',
  level: '#a3e635',
};

function AircraftMapMarker({
  aircraft,
  viewport,
}: {
  aircraft: NormalizedAircraft;
  viewport: KioskViewport;
}) {
  const trend = getVerticalTrend(aircraft.verticalRateFpm);
  const color = TREND_COLOR[trend] ?? '#38bdf8';
  const heading = aircraft.headingDeg ?? 0;
  const label = displayIdentifier(aircraft);

  const icon = useMemo(() => {
    const iconDef = buildAircraftMarkerIcon(label, heading, color, viewport);
    return {
      url: iconDef.url,
      scaledSize: new google.maps.Size(iconDef.width, iconDef.height),
      anchor: new google.maps.Point(iconDef.anchorX, iconDef.anchorY),
    };
  }, [label, heading, color, viewport]);

  return (
    <Marker
      position={{ lat: aircraft.lat, lng: aircraft.lon }}
      clickable={false}
      icon={icon}
    />
  );
}

export default memo(AircraftMapMarker);
