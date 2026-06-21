/** Default center: ZIP 80219 / southwest Denver */
export const DEFAULT_LAT = 39.7392;
export const DEFAULT_LON = -105.0333;

/** Denver International Airport — used for arrival/departure mode heuristics */
export const DEN_LAT = 39.8561;
export const DEN_LON = -104.6737;

export const MIN_POLL_INTERVAL_SEC = 30;
/** Radar scope + LED wall poll — server caches upstream longer, so this avoids 429s. */
export const LIVE_LAYOUT_POLL_INTERVAL_SEC = 30;
/** Radar sweep rotation — poll and refresh blips once per revolution. */
export const RADAR_SWEEP_DURATION_SEC = 6;
/** Sky Map — poll and refresh upstream every second for smooth marker movement. */
export const SKY_MAP_POLL_INTERVAL_SEC = 1;
/** Train Station split-flap board — faster row turnover without live-map cadence. */
export const SPLIT_FLAP_POLL_INTERVAL_SEC = 15;

export const DEFAULT_ZIP = '80219';
export const DEFAULT_LOCATION_LABEL = 'Denver, CO';

export const SETTINGS_STORAGE_KEY = 'flight-tracker-settings-v2';
/** Millisecond timestamp of the last explicit save (not server cache writes). */
export const SETTINGS_SAVED_AT_KEY = 'flight-tracker-settings-saved-at';
/** Fired on `window` when settings are saved in the same tab (storage events are cross-tab only). */
export const SETTINGS_CHANGED_EVENT = 'flight-tracker-settings-changed';
