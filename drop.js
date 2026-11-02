/*
 * The current drop. Edit this file to open, change or close a pre-order window;
 * nothing else on the site needs touching.
 *
 * Owner sets these before launch (check-launch.sh flags them):
 *   closesAt   ISO timestamp with offset. 23:59 SAST on 20 Nov 2026 is '2026-11-20T23:59:00+02:00'.
 *              Leave null and the banner says PRE-ORDERS OPEN with no countdown.
 *   shipsBy    Text shown to customers, e.g. '15 December 2026'. Leave null and the
 *              site says "after the drop closes".
 *   productIds 3 to 5 hero items. Anything not listed is shown under Coming soon and cannot be bought.
 *   status     'preorder' while open, 'closed' to shut the drop early.
 */
window.AWAKEN_DROP = {
  name: 'NEW WORLD ORDER',
  status: 'preorder',
  closesAt: null,
  shipsBy: null,
  productIds: ['p6', 'p2', 'p1', 'p8', 'p4', 'p3']
};

(function () {
  const D = window.AWAKEN_DROP;

  D.isClosed = () => D.status === 'closed' || (!!D.closesAt && Date.now() >= Date.parse(D.closesAt));
  D.includes = id => D.productIds.indexOf(id) !== -1;
  D.canBuy = id => !D.isClosed() && D.includes(id);
  D.shipsByText = () => D.shipsBy || 'after the drop closes';
  D.listHref = () => (/shop\.html$/.test(location.pathname) ? '#drop-list' : 'shop.html#drop-list');

  function countdownText() {
    const ms = Math.max(0, Date.parse(D.closesAt) - Date.now());
    const mins = Math.floor(ms / 60000);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(Math.floor(mins / 1440))}D ${pad(Math.floor((mins % 1440) / 60))}H ${pad(mins % 60)}M`;
  }

  let wasClosed = D.isClosed();

  function renderBanner() {
    const header = document.querySelector('header');
    if (!header) return;
    let el = document.getElementById('drop-banner');
    if (!el) {
      el = document.createElement('div');
      el.id = 'drop-banner';
      el.className = 'drop-banner';
      el.setAttribute('role', 'status');
      header.insertAdjacentElement('afterend', el);
    }
    const closed = D.isClosed();
    let message;
    if (closed) message = 'CLOSED';
    else if (D.closesAt) message = `PRE-ORDERS CLOSE IN <span class="drop-countdown">${countdownText()}</span>`;
    else message = 'PRE-ORDERS OPEN';

    el.innerHTML = `
      <span class="drop-banner-text"><strong>${D.name}</strong> &middot; ${message}</span>
      ${closed ? `<a class="drop-banner-link" href="${D.listHref()}">Join the list</a>` : ''}
      <button type="button" class="drop-banner-cart" onclick="toggleCart()" aria-label="Open cart">
        Cart (<span data-cart-count>0</span>)
      </button>`;
    if (D.closesAt) el.title = 'Closes ' + new Date(D.closesAt).toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'short' });
    if (typeof cart !== 'undefined') {
      const count = cart.reduce((n, i) => n + i.quantity, 0);
      el.querySelectorAll('[data-cart-count]').forEach(s => { s.textContent = count; });
    }

    if (closed !== wasClosed) {
      wasClosed = closed;
      document.dispatchEvent(new CustomEvent('awaken:dropchange'));
    }
  }

  // Policy pages show the live drop terms: <span data-drop="shipsBy"></span> etc.
  function fillDropText() {
    const closes = D.closesAt
      ? new Date(D.closesAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Johannesburg" })
      : "the close date announced on the shop page";
    const values = { name: D.name, shipsBy: D.shipsByText(), closes };
    document.querySelectorAll("[data-drop]").forEach(el => { el.textContent = values[el.dataset.drop] || ""; });
  }

  // Keeps the sticky banner flush under the sticky desktop header.
  function syncHeaderHeight() {
    const header = document.querySelector('header');
    if (header) document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
  }

  // Once a second: only the countdown text changes, unless the drop just closed.
  function tick() {
    if (D.isClosed() !== wasClosed) {
      renderBanner();
      return;
    }
    const span = document.querySelector('#drop-banner .drop-countdown');
    if (span) span.textContent = countdownText();
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderBanner();
    fillDropText();
    syncHeaderHeight();
    window.addEventListener('resize', syncHeaderHeight);
    const header = document.querySelector('header');
    if (header && window.ResizeObserver) new ResizeObserver(syncHeaderHeight).observe(header);
    setInterval(tick, 1000);
  });

  // Ticker: replaces each page's old marquee with a seamless loop (two identical halves).
  const TICKER = ['ENLIGHTENMENT IS A CHOICE', 'JOIN THE CULT', 'AWAKEN', 'THE NEW WORLD ORDER IS HERE', 'WAKE UP', 'BURN THE MASK', 'REVEAL THE TRUTH',
    'CHECK BEFORE YOU SHARE', 'ASK WHO PROFITS', 'EYES OPEN', 'QUESTION EVERYTHING', 'START WITH US', 'MAKE SOMETHING', 'BE DECENT IN PERSON', 'PAY ATTENTION'];
  function buildTicker() {
    const old = document.querySelector('.marquee-container');
    if (!old) return;
    const seq = TICKER.map(t => `<span>${t}</span><i>&bull;</i>`).join('');
    const el = document.createElement('div');
    el.className = 'ticker';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<div class="ticker-track"><div class="ticker-seq">${seq}</div><div class="ticker-seq">${seq}</div></div>`;
    old.replaceWith(el);
  }

  // Browser chrome colour: AWAKEN red at the top of the page, black once scrolled.
  // The body background carries it (browsers tint from it); the page keeps its own colour via an image layer.
  let lastColour = '';
  function paintChrome() {
    const y = window.pageYOffset || document.documentElement.scrollTop || 0;
    // Some phone browsers rest a few dozen pixels down when the toolbar collapses, so "top" is generous.
    const colour = y > 60 ? '#000000' : '#d94a44';
    if (colour === lastColour) return;
    lastColour = colour;
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'theme-color'; document.head.appendChild(meta); }
    meta.content = colour;
    const b = document.body;
    if (!b.dataset.paint) {
      let c0 = getComputedStyle(b).backgroundColor;
      if (/rgba\(.*,\s*0\)$|transparent/.test(c0)) c0 = '#f3f0e7';
      b.dataset.paint = c0;
      b.style.backgroundImage = `linear-gradient(${c0},${c0})`;
    }
    b.style.backgroundColor = colour;
  }

  document.addEventListener('DOMContentLoaded', () => {
    buildTicker();
    // A refresh can restore a few pixels of scroll and clip the header: start at the very top instead.
    const reset = () => { if ((window.pageYOffset || 0) < 160 && window.pageYOffset !== 0) window.scrollTo(0, 0); };
    window.addEventListener('load', () => { reset(); setTimeout(reset, 150); });
    paintChrome();
    let queued = false;
    window.addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; paintChrome(); });
    }, { passive: true });
    window.addEventListener('pageshow', paintChrome);
  });
})();
