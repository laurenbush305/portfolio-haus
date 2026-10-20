(function () {
 "use strict";
 var toggle = document.querySelector('.nav-toggle');
 var nav = document.getElementById('main-navigation');
 if (toggle && nav) {
  toggle.hidden = false;
  document.documentElement.classList.add('nav-enhanced');
  function close() { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
  toggle.addEventListener('click', function () { var open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); });
  nav.querySelectorAll('a').forEach(function(a) { a.addEventListener('click', close); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { close(); toggle.focus(); } });
  document.addEventListener('click', function(e) { if (!e.target.closest('.site-nav')) close(); });
 }
})();
