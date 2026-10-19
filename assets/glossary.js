/* Glossary page: reads data/glossary.json and lists every entry, with search and A-Z jump links. */
(function () {
  var list = document.getElementById('gl'), q = document.getElementById('q'),
      letters = document.getElementById('letters'), count = document.getElementById('count');
  var data = [];
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function first(g) { var c = g.term.replace(/^[^A-Za-z]+/, '').charAt(0).toUpperCase(); return c || '#'; }

  function render() {
    var needle = q.value.trim().toLowerCase(), shown = 0, seen = {};
    list.innerHTML = '';
    data.forEach(function (g) {
      if (needle && (g.term + ' ' + g.gloss).toLowerCase().indexOf(needle) === -1) return;
      var li = el('li'), L = first(g);
      if (!seen[L] && !needle) { li.id = 'L' + L; seen[L] = true; }
      li.appendChild(el('b', '', g.term));
      li.appendChild(document.createTextNode(g.gloss));
      if (g.editorsDiffer) li.appendChild(el('span', 'flag', ' (editors differ)'));
      list.appendChild(li); shown++;
    });
    count.textContent = shown + (shown === 1 ? ' entry' : ' entries');
  }

  fetch('data/glossary.json').then(function (r) { return r.json(); }).then(function (d) {
    data = d.slice().sort(function (a, b) { return a.term.toLowerCase().replace(/^[^a-z]+/, '').localeCompare(b.term.toLowerCase().replace(/^[^a-z]+/, '')); });
    var have = {};
    data.forEach(function (g) { have[first(g)] = true; });
    Object.keys(have).sort().forEach(function (L) {
      var a = el('a', '', L); a.href = '#L' + L; letters.appendChild(a);
    });
    render();
    q.addEventListener('input', render);
  }).catch(function () { count.textContent = 'The glossary could not be loaded.'; });
})();
