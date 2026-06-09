import {
  DEFAULT_LAT,
  DEFAULT_LON,
  DEFAULT_LOCATION_LABEL,
  DEFAULT_ZIP,
  SETTINGS_STORAGE_KEY,
} from './constants';
import {
  DEFAULT_SKY_MAP_ZOOM,
  normalizeSkyMapZoom,
  type SkyMapZoomSettings,
} from './skyMapZoom';

export type { SkyMapZoomSettings };

export type RefreshInterval = 30 | 60 | 90;
export type RadiusMi = 5 | 10 | 25 | 50;
export type MaxAircraft = 8 | 12 | 20;
export type AltitudeFilter = 'all' | 'below10k' | '10k-25k' | 'above25k';
export type DisplayMode = 'nearby' | 'den-arrivals' | 'den-departures' | 'overflights';
export type ThemeId =
  | 'airport-led'
  | 'british-bus'
  | 'elegant-modern'
  | 'midnight-luxe'
  | 'radar-ops'
  | 'sky-map'
  | 'flight-wall-mini';

export interface DisplaySettings {
  zipCode: string;
  lat: number;
  lon: number;
  locationLabel: string;
  refreshIntervalSec: RefreshInterval;
  radiusMi: RadiusMi;
  maxAircraft: MaxAircraft;
  altitudeFilter: AltitudeFilter;
  hideNoCallsign: boolean;
  mode: DisplayMode;
  theme: ThemeId;
  rotateThemes: boolean;
  skyMapZoom: SkyMapZoomSettings;
}

export const DEFAULT_SETTINGS: DisplaySettings = {
  zipCode: DEFAULT_ZIP,
  lat: DEFAULT_LAT,
  lon: DEFAULT_LON,
  locationLabel: DEFAULT_LOCATION_LABEL,
  refreshIntervalSec: 60,
  radiusMi: 10,
  maxAircraft: 12,
  altitudeFilter: 'all',
  hideNoCallsign: false,
  mode: 'nearby',
  theme: 'airport-led',
  rotateThemes: true,
  skyMapZoom: DEFAULT_SKY_MAP_ZOOM,
};

function normalizeZip(zip: string | undefined): string {
  const digits = (zip ?? DEFAULT_ZIP).replace(/\D/g, '').slice(0, 5);
  return digits.length === 5 ? digits : DEFAULT_ZIP;
}

export function clampRefreshInterval(value: number): RefreshInterval {
  if (value <= 30) return 30;
  if (value <= 60) return 60;
  return 90;
}

function normalizeThemeId(theme?: string): ThemeId {
  if (theme === 'aurora-flight') return 'sky-map';
  const valid: ThemeId[] = [
    'airport-led',
    'british-bus',
    'elegant-modern',
    'midnight-luxe',
    'radar-ops',
    'sky-map',
    'flight-wall-mini',
  ];
  if (theme && valid.includes(theme as ThemeId)) return theme as ThemeId;
  return DEFAULT_SETTINGS.theme;
}

export function loadSettings(): DisplaySettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<DisplaySettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      theme: normalizeThemeId(parsed.theme),
      zipCode: normalizeZip(parsed.zipCode),
      lat: typeof parsed.lat === 'number' ? parsed.lat : DEFAULT_SETTINGS.lat,
      lon: typeof parsed.lon === 'number' ? parsed.lon : DEFAULT_SETTINGS.lon,
      locationLabel: parsed.locationLabel?.trim() || DEFAULT_SETTINGS.locationLabel,
      refreshIntervalSec: clampRefreshInterval(
        parsed.refreshIntervalSec ?? DEFAULT_SETTINGS.refreshIntervalSec
      ),
      rotateThemes: parsed.rotateThemes ?? DEFAULT_SETTINGS.rotateThemes,
      skyMapZoom: normalizeSkyMapZoom(parsed.skyMapZoom),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: DisplaySettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
