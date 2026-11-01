/*
 * The current drop. Edit this file to open, change or close a pre-order window;
 * nothing else on the site needs touching.
 *
 * OWNER TO CONFIRM BEFORE LAUNCH:
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
  productIds: ['p6', 'p2', 'p1', 'p4', 'p8', 'p3']
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
})();
