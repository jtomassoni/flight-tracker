/**
 * ES5 inline script — must run on iOS 10 before React loads.
 * Toggles #admin-unsupported vs #admin-app based on user agent.
 */
export const ADMIN_BROWSER_GUARD_SCRIPT = `
(function () {
  function describeEnv(ua) {
    var ios = ua.match(/(?:CPU OS|iPhone OS|iPad OS) (\\d+)[_.](\\d+)(?:[_.](\\d+))?/i);
    if (ios) {
      var ver = ios[3] ? ios[1] + '.' + ios[2] + '.' + ios[3] : ios[1] + '.' + ios[2];
      var device = /iPad/.test(ua) ? 'iPad' : /iPhone/.test(ua) ? 'iPhone' : 'iOS device';
      return device + ' · iOS ' + ver;
    }
    if (/iPad/.test(ua)) {
      var safari = ua.match(/Version\\/(\\d+(?:\\.\\d+)?)/);
      if (safari) return 'iPad · Safari ' + safari[1];
    }
    return 'this browser';
  }

  function isUnsupported(ua) {
    var ios = ua.match(/(?:CPU OS|iPhone OS|iPad OS) (\\d+)[_.]/i);
    if (ios && parseInt(ios[1], 10) <= 11) return true;
    if (/iPad/.test(ua) && /Version\\/(?:9|10|11)\\./.test(ua)) return true;
    return false;
  }

  var ua = navigator.userAgent || '';
  if (!isUnsupported(ua)) return;

  var env = describeEnv(ua);
  var panel = document.getElementById('admin-unsupported');
  var app = document.getElementById('admin-app');
  var envEl = document.getElementById('admin-unsupported-env');

  if (envEl) envEl.textContent = env;
  if (panel) {
    panel.style.display = 'block';
  }
  if (app) app.style.display = 'none';
})();
`;
