export type NormalizedAircraft = {
  hex: string;
  callsign?: string;
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
};

export type VerticalTrend = 'descending' | 'climbing' | 'level';

export type FlightsApiResponse = {
  aircraft: NormalizedAircraft[];
  source: 'live' | 'mock' | 'cached';
  fetchedAt: string;
  provider: string;
  stale?: boolean;
};
