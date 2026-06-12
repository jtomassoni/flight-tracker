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
    JBU: 'B6', ASA: 'AS', SKW: 'OO', RPA: 'YX', NKS: 'NK',
  };

  var pollTimer = null;
  var lastUpdated = null;
  var errorMessage = null;

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function setStatus(msg) {
    var el = document.getElementById('fids-status');
    if (el) el.textContent = msg;
  }

  function airlineIata(callsign) {
    if (!callsign) return 'XX';
    var prefix = shared.trim(callsign).slice(0, 3).toUpperCase();
    return AIRLINE_IATA[prefix] || prefix.slice(0, 2) || 'XX';
  }

  function displayId(ac) {
    if (shared.trim(ac.callsign)) return shared.trim(ac.callsign).toUpperCase();
    return String(ac.hex || '').toUpperCase();
  }

  function rowHtml(ac, index) {
    var iata = airlineIata(ac.callsign);
    return (
      '<div class="fids-row">' +
      '<div class="fids-col-dest">' + DESTINATIONS[index % DESTINATIONS.length] + '</div>' +
      '<div class="fids-col-airline"><div class="fids-logo-wrap">' +
      '<img src="https://images.kiwi.com/airlines/64/' + iata + '.png" alt="' + iata + '" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'block\'">' +
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

  function poll() {
    var settings = shared.loadSettings();
    setStatus('Connecting…');
    var params =
      'lat=' + encodeURIComponent(String(settings.lat)) +
      '&lon=' + encodeURIComponent(String(settings.lon)) +
      '&radiusMi=' + encodeURIComponent(String(settings.radiusMi));

    shared.requestJson('/api/flights?' + params, 25000, function (err, data) {
      if (err) {
        errorMessage = err.message;
        if (!lastUpdated) render([]);
        schedulePoll(settings.refreshIntervalSec);
        return;
      }
      errorMessage = null;
      lastUpdated = new Date(data.fetchedAt);
      var displayed = shared.sortAircraft(shared.filterAircraft(data.aircraft || [], settings))
        .slice(0, settings.maxAircraft);
      render(displayed);
      schedulePoll(settings.refreshIntervalSec);
    });
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
