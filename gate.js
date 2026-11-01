/* Soft launch gate. Visitors without access are sent to coming-soon.html.
 * Client-side only: it keeps casual visitors out, it is not security.
 * Change the password: set HASH to the SHA-256 hex of the new one
 * (printf 'newpass' | shasum -a 256). Current password: awaken */
(function () {
  var HASH = 'cdd35a708cf7fbc0a70f4d0f7ec42dcc269a97e1894726d8e175a2d830d336cd';
  var KEY = 'awakenAccess';
  function ok() { try { return localStorage.getItem(KEY) === HASH; } catch (e) { return false; } }
  window.AWAKEN_GATE = {
    check: async function (pw) {
      var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw.trim().toLowerCase()));
      var hex = Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
      if (hex !== HASH) return false;
      try { localStorage.setItem(KEY, HASH); } catch (e) {}
      return true;
    }
  };
  if (/coming-soon\.html$/.test(location.pathname) || /eye\.html$/.test(location.pathname)) return;
  if (!ok()) location.replace('coming-soon.html');
})();
