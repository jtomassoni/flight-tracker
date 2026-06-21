/**
 * FlightWall LED display for old iPad — uses LegacyLedWall bundle.
 */
(function (global) {
  var shared = global.LegacyDisplayShared;
  var ROTATE_MS = 10000;
  var pollTimer = null;
  var rotateTimer = null;
  var lastSettingsSyncMs = 0;
  var SETTINGS_SYNC_MS = 5 * 60 * 1000;
  var aircraftList = [];
  var displayIndex = 0;
  var painter = null;
  var statusEl = null;

  function setStatus(msg) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.display = msg ? 'block' : 'none';
  }

  function showError(title, detail) {
    var app = document.getElementById('app');
    if (!app) return;
    app.innerHTML =
      '<div class="legacy-error">' +
      '<h2>' + title + '</h2>' +
      '<p>' + detail + '</p>' +
      '<p class="legacy-error__host">Server: <code>' + (window.location.host || '') + '</code></p>' +
      '</div>';
  }

  function showCanvas() {
    var app = document.getElementById('app');
    if (!app) return;
    app.innerHTML =
      '<div class="flight-wall-mini__screen">' +
      '<canvas id="led-canvas" class="flight-wall-mini__canvas"></canvas>' +
      '<div class="flight-wall-mini__overlay" aria-hidden="true">' +
      '<div class="flight-wall-mini__scanlines"></div>' +
      '<div class="flight-wall-mini__vignette"></div>' +
      '</div>' +
      '<div id="led-status" class="flight-wall-mini__status"></div>' +
      '</div>';
    statusEl = document.getElementById('led-status');
  }

  function currentAircraft() {
    return aircraftList.length ? aircraftList[displayIndex % aircraftList.length] : null;
  }

  function hasLedRoute(ac) {
    var route = ac && ac.route;
    if (!route) return false;
    return Boolean(
      (route.originIata && shared.trim(route.originIata)) ||
        (route.originIcao && shared.trim(route.originIcao)) ||
        (route.destIata && shared.trim(route.destIata)) ||
        (route.destIcao && shared.trim(route.destIcao))
    );
  }

  function sortWithRoutesFirst(list) {
    var withRoute = [];
    var withoutRoute = [];
    var i;
    for (i = 0; i < list.length; i++) {
      if (hasLedRoute(list[i])) withRoute.push(list[i]);
      else withoutRoute.push(list[i]);
    }
    return withRoute.length > 0 ? withRoute.concat(withoutRoute) : list;
  }

  function renderCurrent() {
    var wall = global.LegacyLedWall;
    var ac = currentAircraft();
    if (!wall || !painter) {
      setStatus(aircraftList.length ? 'Loading…' : emptyStatusMessage());
      return;
    }
    if (!ac) {
      setStatus(emptyStatusMessage());
      return;
    }
    var content = wall.aircraftToLedContent(ac);
    var drawn = painter.draw(content);
    if (drawn && typeof drawn.then === 'function') {
      drawn.then(function () {
        setStatus('');
      });
    } else {
      setStatus('');
    }
  }

  function emptyStatusMessage() {
    var settings = shared.loadSettings();
    var target = shared.buildTrackTarget(settings.trackAirline, settings.trackFlightNumber);
    if (target) return target.displayLabel + ' not airborne';
    return 'No flights in range';
  }

  function scheduleRotate() {
    if (rotateTimer) clearInterval(rotateTimer);
    if (aircraftList.length <= 1) return;
    rotateTimer = setInterval(function () {
      displayIndex = (displayIndex + 1) % aircraftList.length;
      renderCurrent();
    }, ROTATE_MS);
  }

  function schedulePoll(intervalSec) {
    if (pollTimer) clearTimeout(pollTimer);
    pollTimer = setTimeout(poll, intervalSec * 1000);
  }

  function pollFlights() {
    var settings = shared.loadSettings();
    if (!aircraftList.length) setStatus('Connecting…');

    shared.requestJson('/api/flights?' + shared.flightsApiParams(settings), 25000, function (err, data) {
      if (err) {
        if (!aircraftList.length) {
          showError('Cannot load flights', err.message || 'Request failed');
        } else {
          setStatus('');
          renderCurrent();
        }
        schedulePoll(settings.refreshIntervalSec);
        return;
      }

      settings = shared.applyTrackWatchPoll(data.aircraft || [], settings);
      aircraftList = sortWithRoutesFirst(
        shared.applyDisplayedAircraft(data.aircraft || [], settings)
      );
      if (displayIndex >= aircraftList.length) displayIndex = 0;

      if (!aircraftList.length) {
        setStatus(emptyStatusMessage());
      } else {
        renderCurrent();
        scheduleRotate();
      }
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

  function onResize() {
    if (painter) painter.resize();
  }

  function start() {
    if (!global.LegacyLedWall) {
      showError('LED display unavailable', 'legacy-led-wall.js failed to load. Rebuild the app.');
      return;
    }

    if (global.LegacyKiosk) global.LegacyKiosk.applyStandaloneShell();

    showCanvas();
    var canvas = document.getElementById('led-canvas');
    if (!canvas) return;

    painter = global.LegacyLedWall.createLedWallPainter(canvas);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.addEventListener('online', poll);
    window.addEventListener('storage', function (e) {
      if (e.key === shared.SETTINGS_KEY) poll();
    });

    poll();
  }

  global.LegacyLedDisplay = { start: start };
})(window);
