/**
 * Shared utilities for old-iPad display modes (LED wall + FIDS board).
 * ES5-safe for iOS 10.
 */
(function (global) {
  var SETTINGS_KEY = 'flight-tracker-settings-v2';
  var DEFAULT_LAT = 39.7392;
  var DEFAULT_LON = -105.0333;
  var LEGACY_MAX_AIRCRAFT = 8;

  /** ICAO → IATA for common Denver carriers (flight-watch + labels). */
  var AIRLINE_IATA = {
    UAL: 'UA',
    SWA: 'WN',
    DAL: 'DL',
    AAL: 'AA',
    FFT: 'F9',
    JBU: 'B6',
    ASA: 'AS',
    NKS: 'NK',
    F9: 'F9',
  };

  var EXCLUSIVE_MAINLINE = {
    ENY: 'AAL',
    PDT: 'AAL',
    JIA: 'AAL',
    EDV: 'DAL',
    QXE: 'ASA',
    AWI: 'UAL',
    LOF: 'UAL',
  };

  var MAINLINE_FLIGHT_RANGES = [
    { min: 3420, max: 3499, mainline: 'ASA' },
    { min: 2920, max: 3109, mainline: 'AAL' },
    { min: 3520, max: 3569, mainline: 'DAL' },
    { min: 4439, max: 4858, mainline: 'DAL' },
    { min: 9783, max: 9784, mainline: 'DAL' },
    { min: 3805, max: 3854, mainline: 'UAL' },
    { min: 4085, max: 4714, mainline: 'UAL' },
    { min: 4860, max: 4868, mainline: 'UAL' },
    { min: 5176, max: 6060, mainline: 'UAL' },
    { min: 5660, max: 6189, mainline: 'UAL' },
    { min: 3100, max: 3399, mainline: 'AAL' },
    { min: 4000, max: 4420, mainline: 'DAL' },
    { min: 6070, max: 6999, mainline: 'UAL' },
  ];

  var MULTI_PARTNER = { SKW: 1, RPA: 1, ASH: 1, GJS: 1 };
  var REGIONAL_OPERATORS = {
    SKW: 1,
    RPA: 1,
    ENY: 1,
    PDT: 1,
    JIA: 1,
    EDV: 1,
    QXE: 1,
    AWI: 1,
    ASH: 1,
    GJS: 1,
    LOF: 1,
  };
  var DEFAULT_MAINLINE = 'UAL';

  function trim(str) {
    return String(str || '').replace(/^\s+|\s+$/g, '');
  }

  function parseQuery() {
    var out = {};
    var search = window.location.search;
    if (!search || search.length < 2) return out;
    var parts = search.replace(/^\?/, '').split('&');
    var i;
    for (i = 0; i < parts.length; i++) {
      var pair = parts[i].split('=');
      var key = decodeURIComponent(pair[0] || '');
      var val = decodeURIComponent(pair[1] || '');
      if (key) out[key] = val;
    }
    return out;
  }

  function num(val, fallback) {
    var n = parseFloat(val);
    return isNaN(n) ? fallback : n;
  }

  function int(val, fallback) {
    var n = parseInt(val, 10);
    return isNaN(n) ? fallback : n;
  }

  function readStoredRaw() {
    try {
      var raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function persistSettings(next) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch (e) {}
  }

  function applySettingsPatch(base, patch) {
    if (!patch || typeof patch !== 'object') return base;
    var out = {};
    var k;
    for (k in base) {
      if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    }
    for (k in patch) {
      if (!Object.prototype.hasOwnProperty.call(patch, k)) continue;
      if (patch[k] === undefined) continue;
      out[k] = patch[k];
    }
    if (typeof out.maxAircraft === 'number') {
      out.maxAircraft = Math.min(out.maxAircraft, LEGACY_MAX_AIRCRAFT);
    }
    if (typeof out.refreshIntervalSec === 'number') {
      out.refreshIntervalSec = Math.max(out.refreshIntervalSec, 60);
    }
    return out;
  }

  function settingsFromQuery(query) {
    var hasCoords = query.lat != null || query.lon != null;
    if (!hasCoords && !query.radiusMi && !query.max && !query.refresh) return null;
    return {
      lat: num(query.lat, DEFAULT_LAT),
      lon: num(query.lon, DEFAULT_LON),
      radiusMi: int(query.radiusMi, 10),
      maxAircraft: Math.min(int(query.max, 8), LEGACY_MAX_AIRCRAFT),
      refreshIntervalSec: Math.max(int(query.refresh, 60), 60),
      altitudeFilter: query.altitude || 'all',
      hideNoCallsign: query.hideNoCallsign === '1',
      mode: query.mode || 'nearby',
    };
  }

  function loadSettings() {
    var defaults = {
      lat: DEFAULT_LAT,
      lon: DEFAULT_LON,
      radiusMi: 10,
      maxAircraft: LEGACY_MAX_AIRCRAFT,
      refreshIntervalSec: 60,
      altitudeFilter: 'all',
      hideNoCallsign: false,
      cargoOnly: false,
      mode: 'nearby',
      theme: 'flightwall',
      trackAirline: '',
      trackFlightNumber: '',
      nightDimEnabled: false,
      nightDimStart: '22:00',
      nightDimEnd: '06:00',
      nightDimLevel: 60,
      keepAwake: true,
    };

    var merged = applySettingsPatch(defaults, readStoredRaw() || {});

    var fromUrl = settingsFromQuery(parseQuery());
    if (fromUrl) {
      merged = applySettingsPatch(merged, fromUrl);
    }

    var query = parseQuery();
    if (query.awake != null) {
      merged.keepAwake = !(query.awake === '0' || query.awake === 'false');
    }
    if (query.dim != null) {
      merged.nightDimEnabled = query.dim === '1' || query.dim === 'true';
    }
    if (query.dimStart) merged.nightDimStart = query.dimStart;
    if (query.dimEnd) merged.nightDimEnd = query.dimEnd;
    if (query.dimLevel != null) {
      var lvl = int(query.dimLevel, 60);
      if (lvl < 0) lvl = 0;
      if (lvl > 95) lvl = 95;
      merged.nightDimLevel = lvl;
    }

    if (query.airline) {
      merged.trackAirline = trim(query.airline).toUpperCase();
    }
    if (query.flight) {
      merged.trackFlightNumber = String(query.flight).replace(/\D/g, '');
    }
    if (query.track) {
      var parsedTrack = parseTrackQuery(query.track);
      if (parsedTrack) {
        merged.trackAirline = parsedTrack.airline;
        merged.trackFlightNumber = parsedTrack.flightNumber;
      }
    }

    return merged;
  }

  function parseTrackQuery(query) {
    var compact = trim(query).replace(/\s+/g, '').toUpperCase();
    var match = compact.match(/^([A-Z0-9]{2,3})(\d+)$/);
    if (!match) return null;
    return { airline: match[1], flightNumber: match[2] };
  }

  function iataToIcao(iata) {
    var key;
    for (key in AIRLINE_IATA) {
      if (AIRLINE_IATA[key] === iata) return key;
    }
    return null;
  }

  function resolveAirlineIcao(raw) {
    var token = trim(raw).toUpperCase();
    if (!token) return null;
    if (token.length === 3 && AIRLINE_IATA[token]) return token;
    var fromIata = iataToIcao(token);
    if (fromIata) return fromIata;
    return null;
  }

  function parseFlightNumber(callsign) {
    var numPart = trim(callsign).slice(3).replace(/\D/g, '');
    if (!numPart) return null;
    var n = parseInt(numPart, 10);
    return isNaN(n) ? null : n;
  }

  function mainlineFromFlightNumber(flightNumber) {
    var i;
    for (i = 0; i < MAINLINE_FLIGHT_RANGES.length; i++) {
      var range = MAINLINE_FLIGHT_RANGES[i];
      if (flightNumber >= range.min && flightNumber <= range.max) return range.mainline;
    }
    return null;
  }

  function resolveMainlineIcao(callsign) {
    var upper = trim(callsign).toUpperCase();
    var prefix = upper.slice(0, 3);
    if (EXCLUSIVE_MAINLINE[prefix]) return EXCLUSIVE_MAINLINE[prefix];
    if (MULTI_PARTNER[prefix] || REGIONAL_OPERATORS[prefix]) {
      var flightNumber = parseFlightNumber(upper);
      if (flightNumber != null) {
        var mainline = mainlineFromFlightNumber(flightNumber);
        if (mainline) return mainline;
      }
      return DEFAULT_MAINLINE;
    }
    return prefix;
  }

  function buildTrackTarget(airline, flightNumber) {
    var airlineIcao = resolveAirlineIcao(airline);
    var digits = String(flightNumber || '').replace(/\D/g, '');
    var flightNum = digits ? parseInt(digits, 10) : NaN;
    if (!airlineIcao || isNaN(flightNum)) return null;
    var iata = AIRLINE_IATA[airlineIcao] || airlineIcao;
    return {
      airlineIcao: airlineIcao,
      flightNumber: flightNum,
      icaoCallsign: airlineIcao + String(flightNum),
      displayLabel: iata + ' ' + flightNum,
    };
  }

  function aircraftMatchesTrack(ac, target) {
    if (!trim(ac.callsign)) return false;
    var cs = trim(ac.callsign).toUpperCase();
    if (cs === target.icaoCallsign) return true;
    var acNum = parseFlightNumber(cs);
    if (acNum == null || acNum !== target.flightNumber) return false;
    return resolveMainlineIcao(cs) === target.airlineIcao;
  }

  function findTrackedAircraft(list, target) {
    var i;
    for (i = 0; i < list.length; i++) {
      if (aircraftMatchesTrack(list[i], target)) return list[i];
    }
    return null;
  }

  var SURFACE_MAX_ALT_FT = 500;

  function isAirborne(ac) {
    var alt = ac.altitudeFt;
    if (alt == null || alt <= 0) return false;
    if (alt <= SURFACE_MAX_ALT_FT && (ac.groundSpeedKt == null || ac.groundSpeedKt < 1)) {
      return false;
    }
    return true;
  }

  function normalizeTail(value) {
    if (!value) return '';
    return String(value).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  function aircraftTail(ac) {
    return normalizeTail(ac.registration) || normalizeTail(ac.callsign);
  }

  /** Public celebrity / corporate tails — always eligible when airborne. */
  var FAMOUS_TAILS = {
    N628TS: 1, N757AF: 1, N194WM: 1, N271DV: 1,
    N3200X: 1, N621MM: 1,
    N2N: 1, N68885: 1, N232G: 1, N383PA: 1, N100A: 1,
    N959RW: 1, N486RW: 1, N586RW: 1,
    N280WS: 1, N601CH: 1, N602CH: 1, N661CH: 1, N662CH: 1
  };

  /** Curated airline ICAO codes (must match lib/airlines.ts). */
  var DISPLAY_AIRLINE_ICAO = {
    UAL: 1, SWA: 1, DAL: 1, AAL: 1, FFT: 1, JBU: 1, ASA: 1, ACA: 1,
    AFR: 1, BAW: 1, DLH: 1, EIN: 1, AMX: 1, AAY: 1, MXY: 1, CAY: 1,
    CMP: 1, EDW: 1, ICE: 1, THY: 1, VIV: 1, VOI: 1, WJA: 1, SCX: 1
  };

  var CARGO_CALLSIGN_PREFIXES = {
    FDX: 1, UPS: 1, GTI: 1, GSS: 1, ABX: 1, ATN: 1,
    DHL: 1, DHX: 1, DAE: 1, AHK: 1, BCS: 1
  };

  var MILITARY_CALLSIGN_PREFIXES = [
    'RCH', 'REACH', 'EVAC', 'NAVY', 'ARMY', 'USAF', 'USN', 'USMC',
    'SPAR', 'CONDO', 'DUKE', 'IRON', 'HKY', 'MOXY', 'TOPCAT', 'TITAN',
    'VIPER', 'JAKE'
  ];

  function isNNumberTail(value) {
    var normalized = normalizeTail(value);
    if (!normalized) return false;
    return /^N[1-9][0-9]{0,4}[A-Z]{0,2}$/.test(normalized);
  }

  function isNNumberAircraft(ac) {
    return isNNumberTail(ac.registration) || isNNumberTail(ac.callsign);
  }

  function isFamousTail(ac) {
    var tail = aircraftTail(ac);
    return Boolean(tail && FAMOUS_TAILS[tail]);
  }

  function hasKnownAirlineCallsign(callsign) {
    var cs = trim(callsign).toUpperCase();
    if (!cs || cs.length < 3 || isNNumberTail(cs)) return false;
    return Boolean(DISPLAY_AIRLINE_ICAO[resolveMainlineIcao(cs)]);
  }

  function isCargoCallsign(callsign) {
    var cs = trim(callsign).toUpperCase();
    if (!cs || cs.length < 3) return false;
    return Boolean(CARGO_CALLSIGN_PREFIXES[cs.slice(0, 3)]);
  }

  function isMilitaryCallsign(callsign) {
    var cs = trim(callsign).toUpperCase();
    if (!cs) return false;
    var i;
    for (i = 0; i < MILITARY_CALLSIGN_PREFIXES.length; i++) {
      if (cs.indexOf(MILITARY_CALLSIGN_PREFIXES[i]) === 0) return true;
    }
    return false;
  }

  /** Strict allowlist — airlines, cargo, military, and famous tails only. */
  function isDisplayEligibleAircraft(ac) {
    if (isFamousTail(ac)) return true;
    var cs = trim(ac.callsign).toUpperCase();
    if (!cs || cs.length < 3 || isNNumberTail(cs)) return false;
    if (hasKnownAirlineCallsign(cs)) return true;
    if (isCargoCallsign(cs)) return true;
    if (isMilitaryCallsign(cs)) return true;
    return false;
  }

  var heldDisplay = [];
  var heldDisplayContextKey = '';
  var trackWasAirborne = false;
  var trackWatchKey = '';

  function clearTrackWatch(settings) {
    var cleared = applySettingsPatch(settings, {
      trackAirline: '',
      trackFlightNumber: '',
    });
    persistSettings(cleared);
    return cleared;
  }

  function resolveTrackWatchAfterPoll(list, settings, wasAirborne) {
    var target = buildTrackTarget(settings.trackAirline, settings.trackFlightNumber);
    if (!target) {
      return { settings: settings, wasAirborne: false, cleared: false };
    }

    var tracked = findTrackedAircraft(list, target);
    if (tracked && isAirborne(tracked)) {
      return { settings: settings, wasAirborne: true, cleared: false };
    }

    if (tracked && !isAirborne(tracked) && wasAirborne) {
      return {
        settings: clearTrackWatch(settings),
        wasAirborne: false,
        cleared: true,
      };
    }

    return { settings: settings, wasAirborne: wasAirborne, cleared: false };
  }

  function trackWatchContextKey(settings) {
    var target = buildTrackTarget(settings.trackAirline, settings.trackFlightNumber);
    return target ? target.icaoCallsign : '';
  }

  function applyTrackWatchPoll(list, settings) {
    var watchKey = trackWatchContextKey(settings);
    if (trackWatchKey !== watchKey) {
      trackWatchKey = watchKey;
      trackWasAirborne = false;
    }

    if (!watchKey) {
      return settings;
    }

    var result = resolveTrackWatchAfterPoll(list, settings, trackWasAirborne);
    trackWasAirborne = result.wasAirborne;
    if (result.cleared) {
      heldDisplay = [];
      heldDisplayContextKey = '';
      trackWatchKey = '';
      return result.settings;
    }
    return result.settings;
  }

  function displayHoldContextKey(settings) {
    var target = buildTrackTarget(settings.trackAirline, settings.trackFlightNumber);
    return (
      Number(settings.lat).toFixed(4) +
      ',' +
      Number(settings.lon).toFixed(4) +
      ',' +
      (target ? target.icaoCallsign : '')
    );
  }

  function resolveDisplayedAircraft(list, settings) {
    var target = buildTrackTarget(settings.trackAirline, settings.trackFlightNumber);
    if (target) {
      var tracked = findTrackedAircraft(list, target);
      return tracked && isAirborne(tracked) ? [tracked] : [];
    }
    return sortAircraft(filterAircraft(list, settings)).slice(0, settings.maxAircraft);
  }

  function applyDisplayedAircraft(list, settings) {
    var contextKey = displayHoldContextKey(settings);
    if (heldDisplayContextKey !== contextKey) {
      heldDisplayContextKey = contextKey;
      heldDisplay = [];
    }

    var next = resolveDisplayedAircraft(list, settings);
    if (next.length > 0) {
      heldDisplay = next;
      return next;
    }

    return heldDisplay.length > 0 ? heldDisplay : [];
  }

  function flightsApiParams(settings) {
    var params =
      'lat=' + encodeURIComponent(String(settings.lat)) +
      '&lon=' + encodeURIComponent(String(settings.lon)) +
      '&radiusMi=' + encodeURIComponent(String(settings.radiusMi));
    var target = buildTrackTarget(settings.trackAirline, settings.trackFlightNumber);
    if (target) {
      params += '&callsign=' + encodeURIComponent(target.icaoCallsign);
    }
    return params;
  }

  function requestJson(url, timeoutMs, callback) {
    var xhr = new XMLHttpRequest();
    var finished = false;

    function finish(err, data) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      callback(err, data);
    }

    var timer = setTimeout(function () {
      try {
        xhr.abort();
      } catch (e) {}
      finish(new Error('Timed out reaching ' + url));
    }, timeoutMs);

    xhr.open('GET', url, true);
    xhr.timeout = timeoutMs;
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4 || finished) return;
      if (xhr.status === 0) {
        finish(new Error('Cannot reach server — check Wi-Fi and URL host'));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          finish(null, JSON.parse(xhr.responseText));
        } catch (parseErr) {
          finish(new Error('Bad response from server'));
        }
        return;
      }
      finish(new Error('Server returned ' + xhr.status));
    };
    xhr.onerror = function () {
      finish(new Error('Network error — is the app running?'));
    };
    xhr.ontimeout = function () {
      finish(new Error('Request timed out'));
    };
    xhr.send();
  }

  function syncServerSettings(callback) {
    requestJson('/api/settings', 10000, function (err, data) {
      if (!err && data && data.settings) {
        var stored = readStoredRaw() || {};
        var merged = applySettingsPatch(stored, data.settings);
        persistSettings(merged);
      }
      if (callback) callback(err);
    });
  }

  var LOGO_MANIFEST = {};

  function logoCacheSuffix(entry) {
    if (!entry) return '';
    var fromSource = entry.source && entry.source.match(/(\d{10,})/);
    if (fromSource) return '?v=' + fromSource[1];
    if (entry.approvedAt) {
      var version = Date.parse(entry.approvedAt);
      if (!isNaN(version)) return '?v=' + version;
    }
    return '';
  }

  function approvedLogoUrl(icao) {
    if (!icao) return null;
    var key = trim(icao).toUpperCase();
    var entry = LOGO_MANIFEST[key];
    if (!entry) return null;
    if (entry.url) return entry.url;
    if (entry.file) return '/api/airline-logos/asset/' + entry.file + logoCacheSuffix(entry);
    return null;
  }

  function syncLogoManifest(callback) {
    requestJson('/api/airline-logos/manifest', 10000, function (err, data) {
      if (!err && data && data.manifest) {
        LOGO_MANIFEST = data.manifest;
        if (global.LegacyLedWall && global.LegacyLedWall.setApprovedManifest) {
          global.LegacyLedWall.setApprovedManifest(data.manifest);
        }
      }
      if (callback) callback(err);
    });
  }

  function score(ac) {
    var s = 0;
    var dist = num(ac.distanceMi, 99);
    s += dist < 50 ? 50 - dist * 2 : 0;
    if (ac.altitudeFt != null) s += ac.altitudeFt < 50000 ? 25 - ac.altitudeFt / 2000 : 0;
    var vRate = Math.abs(num(ac.verticalRateFpm, 0));
    if (vRate > 200) s += vRate / 100 < 15 ? vRate / 100 : 15;
    if (trim(ac.callsign)) s += 10;
    if (ac.seenSecondsAgo != null) s += ac.seenSecondsAgo < 5 ? 5 - ac.seenSecondsAgo : 0;
    return s;
  }

  function sortAircraft(list) {
    return list.slice().sort(function (a, b) {
      return score(b) - score(a);
    });
  }

  function passesAltitude(ac, filter) {
    var alt = ac.altitudeFt;
    if (filter === 'all') return true;
    if (alt == null) return false;
    if (filter === 'below10k') return alt < 10000;
    if (filter === '10k-25k') return alt >= 10000 && alt <= 25000;
    if (filter === 'above25k') return alt > 25000;
    return true;
  }

  function filterAircraft(list, settings) {
    var out = [];
    var i;
    for (i = 0; i < list.length; i++) {
      var ac = list[i];
      if (!isAirborne(ac)) continue;
      if (!isDisplayEligibleAircraft(ac)) continue;
      if (settings.hideNoCallsign && !trim(ac.callsign)) continue;
      if (!passesAltitude(ac, settings.altitudeFilter)) continue;
      out.push(ac);
    }
    return out;
  }

  function getViewMode() {
    var query = parseQuery();
    if (query.view === 'fids') return 'fids';
    if (query.view === 'led') return 'led';
    try {
      var raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        var stored = JSON.parse(raw);
        if (stored.theme === 'airport-led') return 'fids';
      }
    } catch (e) {}
    return 'led';
  }

  function loadScript(src, callback) {
    var script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    script.onerror = function () {
      callback(new Error('Failed to load ' + src));
    };
    document.head.appendChild(script);
  }

  function loadStylesheet(href) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  global.LegacyDisplayShared = {
    SETTINGS_KEY: SETTINGS_KEY,
    LEGACY_MAX_AIRCRAFT: LEGACY_MAX_AIRCRAFT,
    trim: trim,
    parseQuery: parseQuery,
    loadSettings: loadSettings,
    requestJson: requestJson,
    sortAircraft: sortAircraft,
    filterAircraft: filterAircraft,
    buildTrackTarget: buildTrackTarget,
    applyDisplayedAircraft: applyDisplayedAircraft,
    applyTrackWatchPoll: applyTrackWatchPoll,
    flightsApiParams: flightsApiParams,
    syncServerSettings: syncServerSettings,
    syncLogoManifest: syncLogoManifest,
    approvedLogoUrl: approvedLogoUrl,
    getViewMode: getViewMode,
    loadScript: loadScript,
    loadStylesheet: loadStylesheet,
  };
})(window);
