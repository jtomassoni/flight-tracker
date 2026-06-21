(function () {
  var shared = window.LegacyDisplayShared;
  if (!shared) return;

  if (window.LegacyScreen) window.LegacyScreen.start();

  function bootLed() {
    if (!window.LegacyLedWall || !window.LegacyLedDisplay) {
      var app = document.getElementById('app');
      if (app) {
        app.innerHTML =
          '<div class="legacy-error"><h2>LED display unavailable</h2>' +
          '<p>Could not load legacy-led-wall.js — run npm run build:legacy-led</p></div>';
      }
      return;
    }
    window.LegacyLedDisplay.start();
  }

  function bootFids() {
    shared.loadStylesheet('/legacy-fids.css');
    shared.loadScript('/legacy-fids-board.js', function (err) {
      if (err || !window.LegacyFidsBoard) {
        var app = document.getElementById('app');
        if (app) app.innerHTML = '<div class="legacy-error"><p>FIDS view failed to load</p></div>';
        return;
      }
      window.LegacyFidsBoard.start();
    });
  }

  function boot() {
    shared.syncServerSettings(function () {
      if (shared.getViewMode() === 'fids') {
        bootFids();
      } else {
        if (window.LegacyKiosk) window.LegacyKiosk.applyStandaloneShell();
        bootLed();
      }
    });
  }

  boot();
})();
