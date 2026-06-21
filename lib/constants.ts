/** Default center: ZIP 80219 / southwest Denver */
export const DEFAULT_LAT = 39.7392;
export const DEFAULT_LON = -105.0333;

/** Denver International Airport — used for arrival/departure mode heuristics */
export const DEN_LAT = 39.8561;
export const DEN_LON = -104.6737;

export const MIN_POLL_INTERVAL_SEC = 30;
/** Radar scope + sky map poll — server caches upstream for 30s, so this avoids 429s. */
export const LIVE_LAYOUT_POLL_INTERVAL_SEC = 30;

export const DEFAULT_ZIP = '80219';
export const DEFAULT_LOCATION_LABEL = 'Denver, CO';

export const SETTINGS_STORAGE_KEY = 'flight-tracker-settings-v2';
/** Fired on `window` when settings are saved in the same tab (storage events are cross-tab only). */
export const SETTINGS_CHANGED_EVENT = 'flight-tracker-settings-changed';
