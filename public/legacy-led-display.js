/**
 * FlightWall LED display for old iPad — uses LegacyLedWall bundle.
 */
(function (global) {
  var shared = global.LegacyDisplayShared;
  var ROTATE_MS = 10000;
  var pollTimer = null;
  var rotateTimer = null;
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
    if (!wall || !painter || !ac) {
      setStatus(aircraftList.length ? 'Loading…' : 'No flights in range');
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

  function poll() {
    var settings = shared.loadSettings();
    setStatus('Connecting…');

    var params =
      'lat=' + encodeURIComponent(String(settings.lat)) +
      '&lon=' + encodeURIComponent(String(settings.lon)) +
      '&radiusMi=' + encodeURIComponent(String(settings.radiusMi));

    shared.requestJson('/api/flights?' + params, 25000, function (err, data) {
      if (err) {
        if (!aircraftList.length) showError('Cannot load flights', err.message || 'Request failed');
        else setStatus(err.message || 'Update failed');
        schedulePoll(settings.refreshIntervalSec);
        return;
      }

      var filtered = shared.filterAircraft(data.aircraft || [], settings);
      var sorted = shared.sortAircraft(filtered);
      aircraftList = sorted.slice(0, settings.maxAircraft);
      if (displayIndex >= aircraftList.length) displayIndex = 0;

      if (!aircraftList.length) {
        setStatus('No flights in range');
        if (painter) renderCurrent();
      } else {
        renderCurrent();
        scheduleRotate();
      }
      schedulePoll(settings.refreshIntervalSec);
    });
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
