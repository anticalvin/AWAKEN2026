/* Draws a word so its ink fills the whole screen (edge to edge, top to bottom), centred, on any viewport. */
(function () {
  const cv = document.createElement('canvas');
  cv.id = 'fitText';
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:1;pointer-events:none';
  const old = document.getElementById('flashingText');
  if (old) old.replaceWith(cv); else document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  let word = '', ready = false;
  const PAD = 0.03;

  function size() {
    const d = window.devicePixelRatio || 1;
    cv.width = Math.round(innerWidth * d);
    cv.height = Math.round(innerHeight * d);
  }
  function draw() {
    if (!ready || !word) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.font = '400 200px Anton, Impact, sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    const m = ctx.measureText(word);
    const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    const inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    const W = cv.width * (1 - 2 * PAD), H = cv.height * (1 - 2 * PAD);
    const sx = W / inkW, sy = H / inkH;
    ctx.translate(cv.width / 2, cv.height / 2);
    ctx.scale(sx, sy);
    ctx.fillStyle = '#fff';
    ctx.fillText(word, -(inkW / 2) + m.actualBoundingBoxLeft, (inkH / 2) - m.actualBoundingBoxDescent);
  }
  window.fitWord = function (w) { word = w; draw(); };
  window.addEventListener('resize', function () { size(); draw(); });
  size();
  (document.fonts && document.fonts.load ? document.fonts.load('200px Anton', 'WAKE UP') : Promise.resolve())
    .catch(function () {}).then(function () { ready = true; draw(); });
})();
