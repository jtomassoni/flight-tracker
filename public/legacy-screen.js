/**
 * Screen controller for the old-iPad legacy display (ES5-safe for iOS 10).
 *
 * 1. Night dimming: a fixed black overlay that fades in during the configured
 *    window and out afterwards, re-checked every minute.
 * 2. Keep-awake: plays a muted, inline, looping micro-video (via NoSleep.js) to
 *    stop the iPad from auto-locking. iOS 10 has no Wake Lock API, so this video
 *    trick is the only web-based option — and iOS requires the first play() to
 *    happen inside a user gesture, so we (re)try on the first tap.
 *
 * Settings come from LegacyDisplayShared.loadSettings (localStorage + URL query).
 * Tip: Settings > Display & Brightness > Auto-Lock > Never is the guaranteed backup.
 */
(function (global) {
  var shared = global.LegacyDisplayShared;
  var overlay = null;
  var timer = null;
  var noSleep = null;
  var awakeArmed = false;

  function parseTimeToMinutes(value) {
    if (!value) return null;
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(value));
    if (!m) return null;
    var h = parseInt(m[1], 10);
    var min = parseInt(m[2], 10);
    if (isNaN(h) || isNaN(min) || h < 0 || h > 23 || min < 0 || min > 59) return null;
    return h * 60 + min;
  }

  function isWithinWindow(nowMin, startMin, endMin) {
    if (startMin === endMin) return false;
    if (startMin < endMin) return nowMin >= startMin && nowMin < endMin;
    return nowMin >= startMin || nowMin < endMin;
  }

  function computeOpacity(settings) {
    if (!settings || !settings.nightDimEnabled) return 0;
    var start = parseTimeToMinutes(settings.nightDimStart);
    var end = parseTimeToMinutes(settings.nightDimEnd);
    if (start === null || end === null) return 0;
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    if (!isWithinWindow(nowMin, start, end)) return 0;
    var level = typeof settings.nightDimLevel === 'number' ? settings.nightDimLevel : 60;
    if (level < 0) level = 0;
    if (level > 95) level = 95;
    return level / 100;
  }

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'legacy-night-dim';
    overlay.setAttribute('aria-hidden', 'true');
    var st = overlay.style;
    st.position = 'fixed';
    st.top = '0';
    st.left = '0';
    st.right = '0';
    st.bottom = '0';
    st.background = '#000';
    st.opacity = '0';
    st.zIndex = '9999';
    st.pointerEvents = 'none';
    st.webkitTransition = 'opacity 1.5s ease-in-out';
    st.transition = 'opacity 1.5s ease-in-out';
    document.body.appendChild(overlay);
    return overlay;
  }

  function enableNoSleep() {
    if (!noSleep) return;
    try {
      var p = noSleep.enable();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    } catch (e) {}
  }

  function armKeepAwake() {
    if (awakeArmed || !global.NoSleep) return;
    awakeArmed = true;
    try {
      noSleep = new global.NoSleep();
    } catch (e) {
      noSleep = null;
      return;
    }

    // iOS needs a user gesture for the first play(); enable on the first touch.
    function onGesture() {
      enableNoSleep();
    }
    document.addEventListener('touchstart', onGesture, false);
    document.addEventListener('touchend', onGesture, false);
    document.addEventListener('click', onGesture, false);

    // Best-effort immediate attempt (works if muted autoplay is permitted).
    enableNoSleep();

    // Re-acquire when returning to the foreground.
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) enableNoSleep();
    });
  }

  function applyKeepAwake(settings) {
    if (settings && settings.keepAwake) {
      armKeepAwake();
      enableNoSleep();
    } else if (noSleep) {
      try {
        noSleep.disable();
      } catch (e) {}
    }
  }

  function tick() {
    if (!shared) return;
    var settings = shared.loadSettings();
    ensureOverlay().style.opacity = String(computeOpacity(settings));
    applyKeepAwake(settings);
  }

  function start() {
    if (!document.body) {
      setTimeout(start, 50);
      return;
    }
    ensureOverlay();
    tick();
    if (timer) clearInterval(timer);
    timer = setInterval(tick, 60000);
    window.addEventListener('storage', function (e) {
      if (!e || !shared || e.key === shared.SETTINGS_KEY) tick();
    });
  }

  global.LegacyScreen = {
    start: start,
    tick: tick,
    computeOpacity: computeOpacity,
  };
})(window);
