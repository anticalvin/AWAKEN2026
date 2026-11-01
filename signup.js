/* Email signup: posts to the Brevo list form through a hidden iframe, then shows a thank-you. */
document.addEventListener('submit', function (e) {
  var f = e.target;
  if (!f.classList || !f.classList.contains('signup-form')) return;
  setTimeout(function () {
    var row = f.querySelector('.signup-row');
    var lab = f.querySelector('.signup-label');
    var thanks = f.querySelector('.signup-thanks');
    if (row) row.hidden = true;
    if (lab) lab.hidden = true;
    if (thanks) thanks.hidden = false;
  }, 700);
});
