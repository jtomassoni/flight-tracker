import {
  DEFAULT_LAT,
  DEFAULT_LON,
  DEFAULT_LOCATION_LABEL,
  DEFAULT_ZIP,
  SETTINGS_CHANGED_EVENT,
  SETTINGS_STORAGE_KEY,
} from './constants';
import {
  DEFAULT_SKY_MAP_ZOOM,
  normalizeSkyMapZoom,
  type SkyMapZoomMode,
} from './skyMapZoom';

export type { SkyMapZoomMode };

export type RefreshInterval = 30 | 60 | 90;
export type RadiusMi = 5 | 10 | 25 | 50;
export type MaxAircraft = 8 | 12 | 20;
export type AltitudeFilter = 'all' | 'below10k' | '10k-25k' | 'above25k';
export type DisplayMode =
  | 'nearby'
  | 'den-arrivals'
  | 'den-departures'
  | 'takeoffs'
  | 'overflights';
export type ThemeId =
  | 'airport-led'
  | 'british-bus'
  | 'elegant-modern'
  | 'midnight-luxe'
  | 'radar-ops'
  | 'sky-map'
  | 'flightwall';

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
  /** Restrict the board to freight operators (FedEx, UPS, Atlas, etc.). */
  cargoOnly: boolean;
  mode: DisplayMode;
  theme: ThemeId;
  rotateThemes: boolean;
  skyMapZoom: SkyMapZoomMode;
  /** Keep the screen awake on the kiosk via the Screen Wake Lock API (iOS 16.4+). */
  keepAwake: boolean;
  /** Darken the display during the configured night-time window. */
  nightDimEnabled: boolean;
  /** Window start as a 24h "HH:MM" string (local time). */
  nightDimStart: string;
  /** Window end as a 24h "HH:MM" string (local time). May wrap past midnight. */
  nightDimEnd: string;
  /** How dark to go during the window, 0–95 (percent of black overlay). */
  nightDimLevel: number;
  /** Dev only — use deterministic mock fleet instead of live ADS-B (ignored in production). */
  useMockData: boolean;
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
  cargoOnly: false,
  mode: 'nearby',
  theme: 'airport-led',
  rotateThemes: true,
  skyMapZoom: DEFAULT_SKY_MAP_ZOOM,
  keepAwake: true,
  nightDimEnabled: false,
  nightDimStart: '22:00',
  nightDimEnd: '06:00',
  nightDimLevel: 60,
  useMockData: process.env.NODE_ENV === 'development',
};

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function normalizeTimeOfDay(value: string | undefined, fallback: string): string {
  if (typeof value === 'string' && TIME_PATTERN.test(value.trim())) {
    return value.trim();
  }
  return fallback;
}

export function clampDimLevel(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return DEFAULT_SETTINGS.nightDimLevel;
  return Math.min(95, Math.max(0, Math.round(value)));
}

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
  if (theme === 'flight-wall-mini') return 'flightwall';
  const valid: ThemeId[] = [
    'airport-led',
    'british-bus',
    'elegant-modern',
    'midnight-luxe',
    'radar-ops',
    'sky-map',
    'flightwall',
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
      cargoOnly: parsed.cargoOnly ?? DEFAULT_SETTINGS.cargoOnly,
      rotateThemes: parsed.rotateThemes ?? DEFAULT_SETTINGS.rotateThemes,
      skyMapZoom: normalizeSkyMapZoom(parsed.skyMapZoom),
      keepAwake: parsed.keepAwake ?? DEFAULT_SETTINGS.keepAwake,
      nightDimEnabled: parsed.nightDimEnabled ?? DEFAULT_SETTINGS.nightDimEnabled,
      nightDimStart: normalizeTimeOfDay(parsed.nightDimStart, DEFAULT_SETTINGS.nightDimStart),
      nightDimEnd: normalizeTimeOfDay(parsed.nightDimEnd, DEFAULT_SETTINGS.nightDimEnd),
      nightDimLevel: clampDimLevel(parsed.nightDimLevel),
      useMockData: parsed.useMockData ?? DEFAULT_SETTINGS.useMockData,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: DisplaySettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event(SETTINGS_CHANGED_EVENT));
}
