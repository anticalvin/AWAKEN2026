/*
 * Owner-supplied policy facts. Leave a value null and every sentence that depends on it
 * is hidden on the site; check-launch.sh does not need these, but the policy pages read thinner without them.
 *
 *   minRun             text, e.g. '20 units per product'
 *   cancelBeforeClose  text describing whether and how a customer may cancel before the window closes
 *   lateDays           text, e.g. '7 days'
 *   refundDays         text, e.g. '5 business days'
 *   faultyDays         text, e.g. '14 days'
 *   sizeExchange       text describing whether size exchanges are offered
 *   returnShipPays     text, 'customer' or 'AWAKEN' etc.
 *   measurements       null, or { headers: ['Piece', 'Chest (cm)', ...], rows: [['Hoodie', '60', ...]] }
 */
window.AWAKEN_POLICY = {
  minRun: null,
  cancelBeforeClose: null,
  lateDays: null,
  refundDays: null,
  faultyDays: null,
  sizeExchange: null,
  returnShipPays: null,
  measurements: null
};
// 1-2 sentences about who is behind the brand. Shown on About only when set.
window.ABOUT_FOUNDER = null;
// Affiliate rate and payout schedule. Shown on Join Us only when set.
window.AFFILIATE_TERMS = null;

document.addEventListener('DOMContentLoaded', function () {
  var P = window.AWAKEN_POLICY;
  document.querySelectorAll('[data-owner]').forEach(function (el) {
    var v = P[el.dataset.owner];
    if (v) el.textContent = v;
  });
  document.querySelectorAll('[data-show-if]').forEach(function (el) {
    var k = el.dataset.showIf;
    el.hidden = !(P[k] || window[k]);
  });
  var m = document.getElementById('measurements');
  if (m && P.measurements && P.measurements.rows && P.measurements.rows.length) {
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
    m.innerHTML = '<table><thead><tr>' + P.measurements.headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
      '</tr></thead><tbody>' + P.measurements.rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
  }
});
