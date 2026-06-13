/**
 * Shared utilities for old-iPad display modes (LED wall + FIDS board).
 * ES5-safe for iOS 10.
 */
(function (global) {
  var SETTINGS_KEY = 'flight-tracker-settings-v2';
  var DEFAULT_LAT = 39.7392;
  var DEFAULT_LON = -105.0333;
  var LEGACY_MAX_AIRCRAFT = 8;

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
      mode: 'nearby',
      useMockData: true,
    };

    var stored = null;
    try {
      var raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch (e) {}

    var merged = {
      lat: stored && typeof stored.lat === 'number' ? stored.lat : defaults.lat,
      lon: stored && typeof stored.lon === 'number' ? stored.lon : defaults.lon,
      radiusMi: stored && typeof stored.radiusMi === 'number' ? stored.radiusMi : defaults.radiusMi,
      maxAircraft: Math.min(
        stored && typeof stored.maxAircraft === 'number' ? stored.maxAircraft : defaults.maxAircraft,
        LEGACY_MAX_AIRCRAFT
      ),
      refreshIntervalSec: Math.max(
        stored && typeof stored.refreshIntervalSec === 'number'
          ? stored.refreshIntervalSec
          : defaults.refreshIntervalSec,
        60
      ),
      altitudeFilter: (stored && stored.altitudeFilter) || defaults.altitudeFilter,
      hideNoCallsign: !!(stored && stored.hideNoCallsign),
      mode: (stored && stored.mode) || defaults.mode,
      useMockData: stored && stored.useMockData === false ? false : defaults.useMockData,
    };

    var fromUrl = settingsFromQuery(parseQuery());
    if (fromUrl) {
      merged = fromUrl;
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
      } catch (e) {}
    }

    // Night dimming + keep-awake — layered on independently of the coords/refresh
    // block above so they work whether or not other settings came from the URL.
    merged.nightDimEnabled =
      stored && typeof stored.nightDimEnabled === 'boolean' ? stored.nightDimEnabled : false;
    merged.nightDimStart = (stored && stored.nightDimStart) || '22:00';
    merged.nightDimEnd = (stored && stored.nightDimEnd) || '06:00';
    merged.nightDimLevel =
      stored && typeof stored.nightDimLevel === 'number' ? stored.nightDimLevel : 60;
    merged.keepAwake = stored && typeof stored.keepAwake === 'boolean' ? stored.keepAwake : true;

    var query = parseQuery();
    var dimTouched = false;
    if (query.awake != null) {
      merged.keepAwake = !(query.awake === '0' || query.awake === 'false');
      dimTouched = true;
    }
    if (query.dim != null) {
      merged.nightDimEnabled = query.dim === '1' || query.dim === 'true';
      dimTouched = true;
    }
    if (query.dimStart) {
      merged.nightDimStart = query.dimStart;
      dimTouched = true;
    }
    if (query.dimEnd) {
      merged.nightDimEnd = query.dimEnd;
      dimTouched = true;
    }
    if (query.dimLevel != null) {
      var lvl = int(query.dimLevel, 60);
      if (lvl < 0) lvl = 0;
      if (lvl > 95) lvl = 95;
      merged.nightDimLevel = lvl;
      dimTouched = true;
    }
    if (dimTouched) {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
      } catch (e) {}
    }

    return merged;
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
      if (settings.hideNoCallsign && !trim(ac.callsign)) continue;
      if (!passesAltitude(ac, settings.altitudeFilter)) continue;
      out.push(ac);
    }
    return out;
  }

  function getViewMode() {
    var query = parseQuery();
    return query.view === 'fids' ? 'fids' : 'led';
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
    getViewMode: getViewMode,
    loadScript: loadScript,
    loadStylesheet: loadStylesheet,
  };
})(window);
