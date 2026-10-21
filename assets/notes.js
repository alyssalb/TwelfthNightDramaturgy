/* Notes from the field: reads data/notes.json (newest first) and draws each note.
   In my notes, body text can use [link text](https://address) and *italics*. */
(function () {
  var box = document.getElementById('notes'), filters = document.getElementById('filters');
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  // Tiny formatter: builds DOM nodes, never raw HTML.
  function inline(parent, text) {
    var re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*([^*]+)\*/g, pos = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > pos) parent.appendChild(document.createTextNode(text.slice(pos, m.index)));
      if (m[1]) { var a = el('a', '', m[1]); a.href = m[2]; a.rel = 'noopener'; a.target = '_blank'; parent.appendChild(a); }
      else parent.appendChild(el('em', '', m[3]));
      pos = re.lastIndex;
    }
    if (pos < text.length) parent.appendChild(document.createTextNode(text.slice(pos)));
  }
  function nice(d) {
    var p = d.split('-'); if (p.length !== 3) return d;
    var mo = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return mo[+p[1] - 1] + ' ' + (+p[2]) + ', ' + p[0];
  }

  fetch('data/notes.json').then(function (r) { return r.json(); }).then(function (notes) {
    notes.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var tags = {}, active = null;
    notes.forEach(function (n) { (n.tags || []).forEach(function (t) { tags[t] = true; }); });
    function draw() {
      box.innerHTML = '';
      var shown = notes.filter(function (n) { return !active || (n.tags || []).indexOf(active) > -1; });
      if (!shown.length) box.appendChild(el('p', 'muted', notes.length ? 'No notes with that tag yet.' : 'Nothing here yet. Notes from rehearsal will show up here.'));
      shown.forEach(function (n) {
        var a = el('article', 'entry');
        var t = el('time', '', nice(n.date)); t.setAttribute('datetime', n.date); a.appendChild(t);
        a.appendChild(el('h2', '', n.title));
        (n.body || []).forEach(function (para) { var p = el('p'); inline(p, para); a.appendChild(p); });
        if ((n.tags || []).length) { var tg = el('div', 'tags'); n.tags.forEach(function (x) { tg.appendChild(el('span', 'tag', x)); }); a.appendChild(tg); }
        box.appendChild(a);
      });
    }
    Object.keys(tags).sort().forEach(function (t) {
      var b = el('button', 'tag', t); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        active = (active === t) ? null : t;
        filters.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x.textContent === active ? 'true' : 'false'); });
        draw();
      });
      filters.appendChild(b);
    });
    draw();
  }).catch(function () { box.textContent = 'The notes could not be loaded.'; });
})();
