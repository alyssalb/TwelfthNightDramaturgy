/* Shared behavior for every page: the pinned bar and menu, the light/dark toggle,
   and the string lights that only show up in dark mode.

   To add, rename or reorder pages, I edit the PAGES list below. */

var SITE_NAME = 'Twelfth Night, Key West';
var PAGES = [
  { href: 'index.html',        label: 'Home' },
  { href: 'about.html',        label: 'About the play' },
  { href: 'key-west.html',     label: 'Key West' },
  { href: 'queer-themes.html', label: 'Queer themes' },
  { href: 'class-themes.html', label: 'Class themes' },
  { href: 'concept-map.html',  label: 'Concept map' },
  { href: 'script.html',       label: 'Script' },
  { href: 'glossary.html',     label: 'Glossary' },
  { href: 'notes.html',        label: 'Notes from the field' }
];

(function () {
  var root = document.documentElement;
  var current = document.body.getAttribute('data-page') || 'index.html';

  function store(key, val) { try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; } }

  // Theme: my saved choice wins, otherwise the device setting decides.
  var saved = store('tn-theme');
  if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
  function isDark() {
    var t = root.getAttribute('data-theme');
    return t === 'dark' || (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  // Build the pinned bar
  var here = PAGES.filter(function (p) { return p.href === current; })[0];
  var header = document.createElement('div');
  header.className = 'site';
  header.innerHTML =
    '<div class="in">' +
      '<button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Menu"><i></i><i></i><i></i></button>' +
      '<a class="name" href="index.html">' + SITE_NAME + '<span class="here" id="here"></span></a>' +
      '<button class="btn" id="themeBtn" type="button"></button>' +
    '</div>' +
    '<nav class="menu" id="menu" aria-label="Packet pages" hidden><ul id="menuList"></ul></nav>';
  document.body.insertBefore(header, document.body.firstChild);

  var skip = document.createElement('a');
  skip.className = 'skip'; skip.href = '#main'; skip.textContent = 'Skip to content';
  document.body.insertBefore(skip, document.body.firstChild);

  var list = header.querySelector('#menuList');
  PAGES.forEach(function (p) {
    var li = document.createElement('li'), a = document.createElement('a');
    a.href = p.href; a.textContent = p.label;
    if (p.href === current) a.setAttribute('aria-current', 'page');
    li.appendChild(a); list.appendChild(li);
  });
  if (here && current !== 'index.html') header.querySelector('#here').textContent = here.label;

  var burger = header.querySelector('#burger'), menu = header.querySelector('#menu');
  function setMenu(open) { burger.setAttribute('aria-expanded', open); menu.hidden = !open; }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('click', function (e) { if (!e.target.closest('.site')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  var themeBtn = header.querySelector('#themeBtn'); themeBtn.setAttribute('aria-label', 'Switch between light and dark mode');
  function sync() { themeBtn.textContent = isDark() ? 'Light' : 'Dark'; drawLights(); }
  themeBtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next); store('tn-theme', next); sync();
  });

  // Footer
  var f = document.createElement('footer');
  f.innerHTML = '<p>Research packet for the cast and crew of Twelfth Night, Key West.</p>';
  document.body.appendChild(f);

  // String lights: round bulbs hung in swags, drawn at true pixel size. I only let one random bulb brighten at a time so it twinkles without getting busy.
  var timer = null;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function drawLights() {
    var s = document.getElementById('lights');
    clearInterval(timer);
    if (!s || !isDark()) return;
    var w = s.clientWidth || 900, h = 72, ns = 'http://www.w3.org/2000/svg';
    var N = function (t) { return document.createElementNS(ns, t); };
    s.setAttribute('viewBox', '0 0 ' + w + ' ' + h); s.innerHTML = '';
    var span = Math.max(120, Math.min(200, w / 6)), n = Math.max(2, Math.round(w / span)), step = w / n, sag = 20, y0 = 8;
    var wire = N('path'), d = 'M0 ' + y0;
    for (var i = 0; i < n; i++) d += ' Q' + (i * step + step / 2) + ' ' + (y0 + sag * 2) + ' ' + ((i + 1) * step) + ' ' + y0;
    wire.setAttribute('d', d); wire.setAttribute('fill', 'none'); wire.setAttribute('stroke', '#8A7D63'); wire.setAttribute('stroke-width', '1.2');
    s.appendChild(wire);
    var per = 4, bulbs = [];
    for (i = 0; i < n; i++) for (var j = 1; j <= per; j++) {
      var t = j / (per + 1), x0 = i * step, x1 = x0 + step, cx = x0 + step / 2, cy = y0 + sag * 2;
      var x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
      var y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y0;
      var g = N('g'); g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
      var cap = N('rect'); cap.setAttribute('x', -2.5); cap.setAttribute('y', -1); cap.setAttribute('width', 5); cap.setAttribute('height', 5); cap.setAttribute('fill', '#8A7D63'); g.appendChild(cap);
      var halo = N('circle'); halo.setAttribute('cx', 0); halo.setAttribute('cy', 9); halo.setAttribute('r', 12); halo.setAttribute('fill', '#FFC77A'); halo.setAttribute('opacity', '.14'); g.appendChild(halo);
      var b = N('circle'); b.setAttribute('cx', 0); b.setAttribute('cy', 9); b.setAttribute('r', 5); b.setAttribute('fill', '#FFD79A');
      b.style.opacity = (0.55 + Math.random() * 0.25).toFixed(2); g.appendChild(b);
      s.appendChild(g); bulbs.push({ b: b, h: halo });
    }
    if (reduce) return;
    function flash() {
      var o = bulbs[Math.floor(Math.random() * bulbs.length)], dur = 1800 + Math.random() * 1600;
      var base = parseFloat(o.b.style.opacity);
      o.b.animate([{ opacity: base }, { opacity: 0.95, offset: 0.5 }, { opacity: base }], { duration: dur, easing: 'ease-in-out' });
      o.h.animate([{ opacity: 0.14 }, { opacity: 0.32, offset: 0.5 }, { opacity: 0.14 }], { duration: dur, easing: 'ease-in-out' });
    }
    timer = setInterval(flash, 1100); flash();
  }
  window.addEventListener('resize', drawLights);
  if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', sync);
  sync();
})();
