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
    if (statusEl) statusEl.textContent = msg;
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
    painter.draw(content).then(function () {
      setStatus(
        aircraftList.length > 1
          ? 'Flight ' + (displayIndex + 1) + ' of ' + aircraftList.length
          : ''
      );
    });
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
    setStatus('Connecting…');

    shared.requestJson('/api/flights?' + shared.flightsApiParams(settings), 25000, function (err, data) {
      if (err) {
        if (!aircraftList.length) showError('Cannot load flights', err.message || 'Request failed');
        else setStatus(err.message || 'Update failed');
        schedulePoll(settings.refreshIntervalSec);
        return;
      }

      aircraftList = shared.applyDisplayedAircraft(data.aircraft || [], settings);
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

    if (global.LegacyKiosk) {
      global.LegacyKiosk.applyStandaloneShell();
      global.LegacyKiosk.mountButton();
    }

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
