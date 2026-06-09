/**
 * ZIP → lat/lon lookup.
 *
 * Default: Zippopotam.us (free, no API key, US 5-digit ZIP codes).
 * Optional: set GEOCODING_PROVIDER=google and GOOGLE_GEOCODING_API_KEY for
 * international postal codes or higher rate limits.
 */

import { DEFAULT_LAT, DEFAULT_LON } from './constants';

export type GeocodeResult = {
  zipCode: string;
  lat: number;
  lon: number;
  locationLabel: string;
  provider: 'zippopotam' | 'google' | 'fallback';
};

type ZippopotamResponse = {
  places?: Array<{
    latitude: string;
    longitude: string;
    'place name': string;
    'state abbreviation': string;
  }>;
};

function normalizeZip(zip: string): string {
  return zip.replace(/\D/g, '').slice(0, 5);
}

function isValidUsZip(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}

async function geocodeWithZippopotam(zip: string): Promise<GeocodeResult | null> {
  const res = await fetch(`https://api.zippopotam.us/us/${zip}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as ZippopotamResponse;
  const place = data.places?.[0];
  if (!place) return null;

  return {
    zipCode: zip,
    lat: parseFloat(place.latitude),
    lon: parseFloat(place.longitude),
    locationLabel: `${place['place name']}, ${place['state abbreviation']}`,
    provider: 'zippopotam',
  };
}

async function geocodeWithGoogle(zip: string): Promise<GeocodeResult | null> {
  const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
  if (!apiKey) return null;

  const params = new URLSearchParams({
    address: zip,
    key: apiKey,
    components: `postal_code:${zip}|country:US`,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
  );
  if (!res.ok) return null;

  const data = (await res.json()) as {
    status: string;
    results?: Array<{
      formatted_address: string;
      geometry: { location: { lat: number; lng: number } };
    }>;
  };

  if (data.status !== 'OK' || !data.results?.[0]) return null;

  const result = data.results[0];
  const label = result.formatted_address
    .replace(/,?\s*USA$/i, '')
    .replace(new RegExp(`\\b${zip}\\b,?\\s*`), '')
    .trim();

  return {
    zipCode: zip,
    lat: result.geometry.location.lat,
    lon: result.geometry.location.lng,
    locationLabel: label || `ZIP ${zip}`,
    provider: 'google',
  };
}

export async function geocodeZip(zipInput: string): Promise<GeocodeResult> {
  const zip = normalizeZip(zipInput);

  if (!isValidUsZip(zip)) {
    throw new Error('Enter a valid 5-digit US ZIP code');
  }

  const provider = process.env.GEOCODING_PROVIDER?.toLowerCase();

  if (provider === 'google') {
    const google = await geocodeWithGoogle(zip);
    if (google) return google;
  }

  const zippo = await geocodeWithZippopotam(zip);
  if (zippo) return zippo;

  if (provider !== 'google') {
    const google = await geocodeWithGoogle(zip);
    if (google) return google;
  }

  // Known default so the app still works offline during dev
  if (zip === '80219') {
    return {
      zipCode: zip,
      lat: DEFAULT_LAT,
      lon: DEFAULT_LON,
      locationLabel: 'Denver, CO',
      provider: 'fallback',
    };
  }

  throw new Error(`Could not resolve ZIP code ${zip}`);
}
