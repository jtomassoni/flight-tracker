const EARTH_RADIUS_MI = 3958.8;

/** Haversine distance in statute miles */
export function distanceMi(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_MI * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function milesToNauticalMiles(mi: number): number {
  return mi / 1.15078;
}

/** Bearing from point A to B in degrees (0–360) */
export function bearingDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Smallest angular difference between two headings */
export function headingDelta(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Cross-track distance in statute miles from point P to the great-circle path
 * from A to B. Used to reject filed routes that don't match live position.
 */
export function crossTrackDistanceMi(
  lat: number,
  lon: number,
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const angularDist = distanceMi(lat1, lon1, lat, lon) / EARTH_RADIUS_MI;
  const bearingToPoint = toRad(bearingDeg(lat1, lon1, lat, lon));
  const bearingOnLeg = toRad(bearingDeg(lat1, lon1, lat2, lon2));
  const crossTrackRad = Math.asin(
    Math.sin(angularDist) * Math.sin(bearingToPoint - bearingOnLeg)
  );
  return Math.abs(crossTrackRad) * EARTH_RADIUS_MI;
}
