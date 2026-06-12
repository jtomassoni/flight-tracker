/**
 * Kiosk / fullscreen for old iPad — Safari and Chrome on iOS (CriOS).
 * True fullscreen on iOS requires Add to Home Screen; browser APIs are limited.
 */
(function (global) {
  function isChromeIos() {
    return /CriOS/i.test(navigator.userAgent || '');
  }

  function isStandalone() {
    if (window.navigator.standalone) return true;
    try {
      return window.matchMedia('(display-mode: standalone)').matches;
    } catch (e) {
      return false;
    }
  }

  function isFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.webkitCurrentFullScreenElement
    );
  }

  function requestFullscreen() {
    var el = document.documentElement;
    var fn =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.webkitRequestFullScreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen;
    if (!fn) return false;
    try {
      var result = fn.call(el);
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function hideBrowserChrome() {
    window.scrollTo(0, 1);
    setTimeout(function () {
      window.scrollTo(0, 0);
    }, 60);
  }

  function helpStepsHtml() {
    if (isChromeIos()) {
      return (
        '<ol>' +
        '<li>Tap the <strong>menu (⋮)</strong> at the top right of Chrome.</li>' +
        '<li>Choose <strong>Add to Home screen</strong>.</li>' +
        '<li>Open the new icon on your home screen — it runs without browser bars.</li>' +
        '</ol>' +
        '<p>Chrome on iPad cannot hide its toolbar like desktop fullscreen. Home screen is the real kiosk mode.</p>'
      );
    }
    return (
      '<ol>' +
      '<li>Tap the <strong>Share</strong> button (box with arrow).</li>' +
      '<li>Choose <strong>Add to Home Screen</strong>.</li>' +
      '<li>Open from your home screen for fullscreen kiosk mode.</li>' +
      '</ol>'
    );
  }

  function showHelp() {
    var help = document.getElementById('kiosk-fullscreen-help');
    if (!help) {
      help = document.createElement('div');
      help.id = 'kiosk-fullscreen-help';
      help.className = 'kiosk-fullscreen-help';
      help.style.display = 'none';
      help.innerHTML =
        '<div class="kiosk-fullscreen-help__card">' +
        '<h2>Fullscreen kiosk</h2>' +
        '<p>Use your browser\'s home-screen shortcut for true fullscreen on this iPad.</p>' +
        helpStepsHtml() +
        '<button type="button" class="kiosk-fullscreen-help__dismiss">Got it</button>' +
        '</div>';
      help.addEventListener('click', function (e) {
        var t = e.target;
        if (
          t === help ||
          (t.className && String(t.className).indexOf('kiosk-fullscreen-help__dismiss') >= 0)
        ) {
          help.style.display = 'none';
        }
      });
      document.body.appendChild(help);
    }
    help.style.display = '-webkit-flex';
    help.style.display = 'flex';
  }

  function updateButton() {
    var btn = document.getElementById('kiosk-fullscreen-btn');
    if (!btn) return;
    btn.style.display = isStandalone() || isFullscreen() ? 'none' : '';
  }

  function enterKiosk() {
    hideBrowserChrome();
    if (requestFullscreen()) {
      setTimeout(updateButton, 200);
      return;
    }
    showHelp();
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

  function mountButton() {
    applyStandaloneShell();
    if (isStandalone()) return;

    if (document.getElementById('kiosk-fullscreen-btn')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'kiosk-fullscreen-btn';
    btn.className = 'kiosk-fullscreen-btn';
    btn.setAttribute('aria-label', 'Fullscreen kiosk mode');
    btn.textContent = isChromeIos() ? 'Kiosk' : 'Fullscreen';

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      enterKiosk();
    });

    document.body.appendChild(btn);

    document.addEventListener('fullscreenchange', updateButton);
    document.addEventListener('webkitfullscreenchange', updateButton);
    updateButton();
  }

  global.LegacyKiosk = {
    isChromeIos: isChromeIos,
    isStandalone: isStandalone,
    applyStandaloneShell: applyStandaloneShell,
    mountButton: mountButton,
    enterKiosk: enterKiosk,
  };
})(window);
