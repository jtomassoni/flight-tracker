/**
 * Real origin/destination for a flight, resolved from the callsign via an
 * external route database. Only ever populated from live data — never inferred
 * or fabricated. Absent when the callsign has no known scheduled route.
 */
export type AircraftRoute = {
  airlineName?: string;
  originIata?: string;
  originIcao?: string;
  originName?: string;
  originMunicipality?: string;
  originLat?: number;
  originLon?: number;
  destIata?: string;
  destIcao?: string;
  destName?: string;
  destMunicipality?: string;
  destLat?: number;
  destLon?: number;
};

export type NormalizedAircraft = {
  hex: string;
  callsign?: string;
  /** Tail number when broadcast (ADS-B `r` field). */
  registration?: string;
  flightNumber?: string;
  lat: number;
  lon: number;
  altitudeFt?: number;
  groundSpeedKt?: number;
  headingDeg?: number;
  verticalRateFpm?: number;
  distanceMi: number;
  category?: string;
  aircraftType?: string;
  squawk?: string;
  seenSecondsAgo?: number;
  /** Real scheduled route resolved from the callsign (origin → destination). */
  route?: AircraftRoute;
};

export type VerticalTrend = 'descending' | 'climbing' | 'level';

export type FlightsApiResponse = {
  aircraft: NormalizedAircraft[];
  source: 'live' | 'cached';
  fetchedAt: string;
  provider: string;
  stale?: boolean;
};
