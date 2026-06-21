/** DEN FIDS departures board — ?view=fids */
(function (global) {
  var shared = global.LegacyDisplayShared;
  var DESTINATIONS = [
    'Los Angeles', 'Montrose', 'Nashville', 'New York-LGA', 'Newark', 'Orlando',
    'Phoenix', 'Las Vegas', 'Seattle', 'Dallas', 'Chicago', 'Salt Lake City',
    'San Francisco', 'Atlanta', 'Houston', 'Minneapolis', 'Portland', 'San Diego',
    'Boston', 'Washington-Dulles',
  ];
  var AIRLINE_IATA = {
    UAL: 'UA', SWA: 'WN', DAL: 'DL', AAL: 'AA', FFT: 'F9',
    JBU: 'B6', ASA: 'AS',
  };
  var EXCLUSIVE_MAINLINE = {
    ENY: 'AAL', PDT: 'AAL', JIA: 'AAL',
    EDV: 'DAL',
    QXE: 'ASA',
    AWI: 'UAL', LOF: 'UAL',
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
    SKW: 1, RPA: 1, ENY: 1, PDT: 1, JIA: 1, EDV: 1, QXE: 1, AWI: 1, ASH: 1, GJS: 1, LOF: 1,
  };
  var DEFAULT_MAINLINE = 'UAL';

  function parseFlightNumber(callsign) {
    var numPart = shared.trim(callsign).slice(3).replace(/\D/g, '');
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

  function resolveCallsignPrefix(callsign) {
    var prefix = shared.trim(callsign).slice(0, 3).toUpperCase();
    if (EXCLUSIVE_MAINLINE[prefix]) return EXCLUSIVE_MAINLINE[prefix];
    if (MULTI_PARTNER[prefix] || REGIONAL_OPERATORS[prefix]) {
      var flightNumber = parseFlightNumber(callsign);
      if (flightNumber != null) {
        var mainline = mainlineFromFlightNumber(flightNumber);
        if (mainline) return mainline;
      }
      return DEFAULT_MAINLINE;
    }
    return prefix;
  }

  function airlineIata(callsign) {
    if (!callsign) return 'XX';
    var prefix = resolveCallsignPrefix(callsign);
    return AIRLINE_IATA[prefix] || prefix.slice(0, 2) || 'XX';
  }

  function displayId(ac) {
    var raw = shared.trim(ac.callsign);
    if (!raw) return String(ac.hex || '').toUpperCase();
    var upper = raw.toUpperCase();
    if (upper.length <= 3) return upper;
    var prefix = upper.slice(0, 3);
    var mainline = resolveCallsignPrefix(upper);
    var suffix = upper.slice(3);
    if (REGIONAL_OPERATORS[prefix]) return mainline + '(' + prefix + ')' + suffix;
    return mainline + suffix;
  }

  var pollTimer = null;
  var lastUpdated = null;
  var errorMessage = null;
  var lastSettingsSyncMs = 0;
  var SETTINGS_SYNC_MS = 5 * 60 * 1000;

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function setStatus(msg) {
    var el = document.getElementById('fids-status');
    if (el) el.textContent = msg;
  }

  function rowHtml(ac, index) {
    var icao = resolveCallsignPrefix(ac.callsign);
    var iata = airlineIata(ac.callsign);
    return (
      '<div class="fids-row">' +
      '<div class="fids-col-dest">' + DESTINATIONS[index % DESTINATIONS.length] + '</div>' +
      '<div class="fids-col-airline"><div class="fids-logo-wrap">' +
      '<img src="/airline-logos/' + icao + '.png" alt="' + iata + '" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'block\'">' +
      '<span class="fids-airline-code" style="display:none">' + iata + '</span></div></div>' +
      '<div class="fids-col-flight">' + displayId(ac) + '</div>' +
      '<div class="fids-col-gate">A' + (10 + index % 20) + '</div>' +
      '<div class="fids-col-time">' + (function () {
        var base = lastUpdated || new Date();
        var totalMin = base.getHours() * 60 + base.getMinutes() + index * 6;
        var h24 = Math.floor(totalMin / 60) % 24;
        var m = totalMin % 60;
        var suffix = h24 >= 12 ? 'P' : 'A';
        return (h24 % 12 || 12) + ':' + pad2(m) + suffix;
      })() + '</div></div>'
    );
  }

  function render(list) {
    var app = document.getElementById('app');
    if (!app) return;
    var rows = '';
    var i;
    for (i = 0; i < list.length; i++) rows += rowHtml(list[i], i);

    app.innerHTML =
      '<div class="fids-shell">' +
      '<div class="fids-panel-header"><div class="fids-brand">' +
      '<svg class="fids-brand-mark" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="none" stroke="#fff" stroke-width="1.5"/></svg>' +
      '<div class="fids-airport-name">Denver International Airport</div></div>' +
      '<div class="fids-panel-title">Departures</div></div>' +
      '<div class="fids-col-header">' +
      '<div class="fids-col-dest">Departing To</div><div class="fids-col-airline">Airline</div>' +
      '<div class="fids-col-flight">Flight</div><div class="fids-col-gate">Gate</div><div class="fids-col-time">Time</div>' +
      '</div>' +
      (list.length
        ? '<div class="fids-rows-wrap" id="fids-rows-wrap"><div class="fids-rows-track" id="fids-rows-track">' + rows + '</div></div>'
        : '<div class="fids-empty">No flights in range</div>') +
      '<div class="fids-footer">' +
      (lastUpdated ? 'Updated ' + lastUpdated.toLocaleTimeString() + ' · ' : '') +
      list.length + ' flights · FIDS view' +
      (errorMessage ? '<div class="fids-footer-error">' + errorMessage + '</div>' : '') +
      '</div></div>';

    var wrap = document.getElementById('fids-rows-wrap');
    var track = document.getElementById('fids-rows-track');
    if (wrap && track && track.scrollHeight > wrap.clientHeight + 4) {
      track.className = 'fids-rows-track scroll';
      track.innerHTML = track.innerHTML + track.innerHTML;
    }
  }

  function schedulePoll(sec) {
    if (pollTimer) clearTimeout(pollTimer);
    pollTimer = setTimeout(poll, sec * 1000);
  }

  function pollFlights() {
    var settings = shared.loadSettings();
    setStatus('Connecting…');

    shared.requestJson('/api/flights?' + shared.flightsApiParams(settings), 25000, function (err, data) {
      if (err) {
        errorMessage = err.message;
        if (!lastUpdated) render([]);
        schedulePoll(settings.refreshIntervalSec);
        return;
      }
      errorMessage = null;
      lastUpdated = new Date(data.fetchedAt);
      var displayed = shared.applyDisplayedAircraft(data.aircraft || [], settings);
      render(displayed);
      schedulePoll(settings.refreshIntervalSec);
    });
  }

  function poll() {
    var now = Date.now();
    if (now - lastSettingsSyncMs >= SETTINGS_SYNC_MS) {
      lastSettingsSyncMs = now;
      shared.syncServerSettings(function () {
        pollFlights();
      });
      return;
    }
    pollFlights();
  }

  function start() {
    document.documentElement.className = 'fids-mode';
    document.body.className = 'fids-mode';
    document.getElementById('app').innerHTML = '<div class="fids-loading" id="fids-status">Loading…</div>';
    if (global.LegacyKiosk) global.LegacyKiosk.mountButton();
    window.addEventListener('online', poll);
    poll();
  }

  global.LegacyFidsBoard = { start: start };
})(window);
