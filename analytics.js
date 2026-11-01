/*
 * Lightweight analytics. Fill in ONE of these and the right script loads on every page.
 * Leave both empty and nothing loads and no events are sent.
 *
 *   plausibleDomain  e.g. 'awakencult.com'. Cookieless, so no consent banner is needed.
 *   ga4Id            e.g. 'G-XXXXXXXXXX'. Sets cookies; check your consent obligations (POPIA) first.
 *
 * Events sent: view_item, add_to_cart, begin_checkout (plus the automatic page view).
 */
const ANALYTICS = {
  plausibleDomain: 'awakencult.com',
  ga4Id: ''
};

(function () {
  function load(src, attrs) {
    const s = document.createElement('script');
    s.async = true;
    s.src = src;
    Object.keys(attrs || {}).forEach(k => s.setAttribute(k, attrs[k]));
    document.head.appendChild(s);
  }

  if (ANALYTICS.plausibleDomain) {
    window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
    load('https://plausible.io/js/script.js', { defer: '', 'data-domain': ANALYTICS.plausibleDomain });
  }
  if (ANALYTICS.ga4Id) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS.ga4Id);
    load('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ANALYTICS.ga4Id));
  }

  // name: view_item | add_to_cart | begin_checkout
  // data: { item_id, item_name, variant, value, currency, quantity }
  window.awakenTrack = function (name, data) {
    try {
      if (window.plausible) window.plausible(name, { props: data });
      if (window.gtag) {
        const item = data.item_id ? [{ item_id: data.item_id, item_name: data.item_name, item_variant: data.variant, price: data.value, quantity: data.quantity || 1 }] : undefined;
        window.gtag('event', name, { currency: data.currency, value: data.value, items: item });
      }
    } catch (e) { /* analytics must never break the shop */ }
  };
})();
