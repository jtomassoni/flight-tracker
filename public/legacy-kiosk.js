/**
 * Home-screen (standalone) viewport sync for old iPad — no browser fullscreen UI.
 */
(function (global) {
  function isStandalone() {
    if (window.navigator.standalone) return true;
    try {
      return window.matchMedia('(display-mode: standalone)').matches;
    } catch (e) {
      return false;
    }
  }

  function applyStandaloneShell() {
    if (!isStandalone()) return;

    document.documentElement.className = 'standalone';

    function syncViewport() {
      var h = window.innerHeight;
      var w = window.innerWidth;
      document.documentElement.style.height = h + 'px';
      document.body.style.height = h + 'px';
      document.body.style.width = w + 'px';
      var app = document.getElementById('app');
      if (app) {
        app.style.height = h + 'px';
        app.style.width = w + 'px';
      }
    }

    syncViewport();
    window.addEventListener('resize', syncViewport);
    window.addEventListener('orientationchange', function () {
      setTimeout(syncViewport, 350);
    });
  }

  global.LegacyKiosk = {
    isStandalone: isStandalone,
    applyStandaloneShell: applyStandaloneShell,
  };
})(window);
