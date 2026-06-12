/**
 * Fullscreen / kiosk helpers for old iPad Safari (iOS 10).
 * True fullscreen = Add to Home Screen; we also try Fullscreen API + hide chrome.
 */
(function (global) {
  var helpEl = null;
  var btnEl = null;

  function isStandalone() {
    return !!(global.navigator && global.navigator.standalone);
  }

  function isFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.webkitIsFullScreen ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
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
      if (result && typeof result.then === 'function') {
        result['catch'](function () {});
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function hideSafariChrome() {
    global.scrollTo(0, 1);
    setTimeout(function () {
      global.scrollTo(0, 0);
    }, 50);
  }

  function hideHelp() {
    if (helpEl) helpEl.style.display = 'none';
  }

  function showHelp() {
    if (!helpEl) return;
    helpEl.style.display = 'block';
  }

  function updateButton() {
    if (!btnEl) return;
    if (isStandalone() || isFullscreen()) {
      btnEl.style.display = 'none';
      hideHelp();
      return;
    }
    btnEl.style.display = 'block';
    btnEl.textContent = isFullscreen() ? 'Exit fullscreen' : 'Fullscreen';
  }

  function onFullscreenChange() {
    updateButton();
  }

  function enterKiosk() {
    hideHelp();
    if (isStandalone()) return;

    if (isFullscreen()) {
      var exit =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.webkitCancelFullScreen ||
        document.mozCancelFullScreen ||
        document.msExitFullscreen;
      if (exit) {
        try {
          exit.call(document);
        } catch (e) {}
      }
      return;
    }

    hideSafariChrome();
    if (!requestFullscreen()) {
      showHelp();
    }
  }

  function mount() {
    btnEl = document.getElementById('kiosk-fullscreen-btn');
    helpEl = document.getElementById('kiosk-fullscreen-help');
    if (!btnEl) return;

    if (isStandalone()) {
      btnEl.style.display = 'none';
      return;
    }

    btnEl.style.display = 'block';
    btnEl.addEventListener('click', enterKiosk);

    if (helpEl) {
      var dismiss = helpEl.querySelector('[data-kiosk-dismiss]');
      if (dismiss) dismiss.addEventListener('click', hideHelp);
    }

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    global.addEventListener('orientationchange', function () {
      setTimeout(function () {
        updateButton();
        hideSafariChrome();
      }, 300);
    });

    setTimeout(hideSafariChrome, 400);
    updateButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  global.LegacyFullscreen = {
    mount: mount,
    enter: enterKiosk,
    isStandalone: isStandalone,
  };
})(window);
