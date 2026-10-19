/* The script reader.
   - data/script.json  : the cut text, scene by scene
   - data/glossary.json: the glossary entries
   - data/annotations.json: production notes (cut, adaptation, staging, dramaturgy)
   The page address picks the scene: script.html#a1s2 means Act 1, Scene 2.
   script.html#a1s2.52 means the same scene, scrolled to line 52 (line numbers restart each scene).
   Glossed words are found when the scene is drawn, so when I change the glossary
   I never have to touch the script file. */

(function () {
  var out = document.getElementById('reader');
  var SCRIPT = null, GLOSS = null, NOTES = [], TYPES = { cut: 'Cut', adapt: 'Adaptation', stage: 'Staging', dram: 'Dramaturgy' }, rules = [];

  function store(key, val) { try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; } }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  Promise.all([
    fetch('data/script.json').then(function (r) { return r.json(); }),
    fetch('data/glossary.json').then(function (r) { return r.json(); }),
    // If annotations.json is missing or broken, the script still loads without notes.
    fetch('data/annotations.json').then(function (r) { return r.json(); }).catch(function () { return { notes: [] }; })
  ]).then(function (res) {
    SCRIPT = res[0]; GLOSS = res[1];
    NOTES = (res[2] && res[2].notes) || [];
    if (res[2] && res[2].types) Object.keys(res[2].types).forEach(function (k) { TYPES[k] = res[2].types[k]; });
    buildRules(); route();
    window.addEventListener('hashchange', route);
  }).catch(function () {
    out.innerHTML = '';
    out.appendChild(el('p', '', 'The script could not be loaded. If I opened this file straight from my computer, I need to run a local server (see the README) or view the published site.'));
  });

  // Turn each glossary entry into a regular expression.
  // Default: the term as a whole word or phrase, any case, spaces may be line breaks.
  // Override: an entry can carry a "match" pattern for words that need context. The part in the first (...) is what gets highlighted.
  function buildRules() {
    GLOSS.forEach(function (g, i) {
      if (g.noHighlight) return;
      var src = g.match || '(?<![A-Za-z])(' + g.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+') + ')(?![A-Za-z])';
      try { rules.push({ i: i, re: new RegExp(src, 'gi') }); } catch (e) { /* bad pattern in glossary.json: skip it */ }
    });
  }

  function sceneTitle(s) { return 'Act ' + s.act + ', Scene ' + s.scene; }

  function route() {
    var h = location.hash.replace('#', '');
    var parts = /^([a-z0-9]+)(?:\.(\d+))?$/.exec(h) || [];
    var id = parts[1] || '', target = parts[2] ? +parts[2] : null;
    var s = SCRIPT.filter(function (x) { return x.id === id; })[0];
    document.title = (s ? sceneTitle(s) + ' | ' : 'Script | ') + 'Twelfth Night, Key West';
    out.innerHTML = '';
    if (s) drawScene(s, target); else drawIndex();
    if (!(s && target)) window.scrollTo(0, 0);
  }

  function drawIndex() {
    var wrap = el('div', 'acts');
    var acts = {};
    SCRIPT.forEach(function (s) { (acts[s.act] = acts[s.act] || []).push(s); });
    Object.keys(acts).forEach(function (a) {
      wrap.appendChild(el('h3', '', 'Act ' + a));
      var ul = el('ul');
      acts[a].forEach(function (s) {
        var li = el('li'), link = el('a'); link.href = '#' + s.id;
        link.appendChild(document.createTextNode('Scene ' + s.scene));
        var first = s.entries[0];
        var sm = el('small', '', first && first.k === 'dir' ? first.lines[0].t.replace(/^\[|\]$/g, '') : '');
        link.appendChild(sm); li.appendChild(link); ul.appendChild(li);
      });
      wrap.appendChild(ul);
    });
    out.appendChild(wrap);
  }

  function drawScene(s, target) {
    var idx = SCRIPT.indexOf(s), prev = SCRIPT[idx - 1], next = SCRIPT[idx + 1];
    out.appendChild(el('h2', '', sceneTitle(s)));

    var tools = el('div', 'tools');
    var all = el('a', 'btn', 'All scenes'); all.href = 'script.html'; tools.appendChild(all);
    var tog = el('button', 'btn', ''); tog.type = 'button'; tog.id = 'hlTog';
    tools.appendChild(tog);
    var sceneNotes = NOTES.filter(function (n) { return n.scene === s.id; });
    var ntog = null;
    if (sceneNotes.length) { ntog = el('button', 'btn', ''); ntog.type = 'button'; tools.appendChild(ntog); }
    var who = whoPicker(s); tools.appendChild(who.wrap);
    out.appendChild(tools);
    out.appendChild(navRow(prev, next));

    var body = el('div', 'script'); body.id = 'scriptBody';
    var on = store('tn-hl') !== 'off';
    function setHl(v) { tog.setAttribute('aria-pressed', v); tog.textContent = 'Glossary highlights: ' + (v ? 'on' : 'off'); body.classList.toggle('hl-off', !v); closeCard(); store('tn-hl', v ? 'on' : 'off'); }
    tog.addEventListener('click', function () { setHl(tog.getAttribute('aria-pressed') !== 'true'); });

    s.entries.forEach(function (e) { body.appendChild(drawEntry(e, s)); });
    var sn = sceneNotes.filter(function (n) { return n.line == null; });
    if (sn.length) {
      var box = el('div', 'scenenotes'); box.appendChild(el('h3', '', 'Notes on this scene'));
      sn.forEach(function (n) { box.appendChild(noteCard(n, false)); });
      out.appendChild(box);
    }
    out.appendChild(body);
    out.appendChild(navRow(prev, next));
    setHl(on);
    if (ntog) {
      var nOn = store('tn-notes') !== 'off';
      var setNotes = function (v) { ntog.setAttribute('aria-pressed', v); ntog.textContent = 'Production notes: ' + (v ? 'on' : 'off'); out.classList.toggle('nt-off', !v); closeCard(); store('tn-notes', v ? 'on' : 'off'); };
      ntog.addEventListener('click', function () { setNotes(ntog.getAttribute('aria-pressed') !== 'true'); });
      setNotes(nOn);
    }
    attachNotes(body, s, sceneNotes);
    wireGlosses(body, s);
    who.apply(body);
    if (target) goToLine(body, target);
  }

  // Scroll to a line and mark it. A prose paragraph covers a range of line numbers, so I look for the paragraph that contains the number.
  function goToLine(body, n) {
    var hit = null;
    Array.prototype.forEach.call(body.querySelectorAll('.l'), function (p) {
      if (!hit && +p.getAttribute('data-n') <= n && n <= +p.getAttribute('data-n2')) hit = p;
    });
    if (!hit) return;
    hit.classList.add('target');
    hit.scrollIntoView({ block: 'center' });
  }

  // Character picker: dim everything except one character's speeches, or hide the rest.
  function whoPicker(s) {
    var counts = {}, all = {};
    SCRIPT.forEach(function (sc) { sc.entries.forEach(function (e) { if (e.k === 'sp') all[e.who] = (all[e.who] || 0) + 1; }); });
    s.entries.forEach(function (e) { if (e.k === 'sp') counts[e.who] = (counts[e.who] || 0) + 1; });
    var wrap = el('span', 'whopick');
    var lab = el('label', '', 'Follow '); lab.setAttribute('for', 'whoSel');
    var sel = el('select'); sel.id = 'whoSel'; sel.className = 'btn';
    var o = el('option', '', 'everyone'); o.value = ''; sel.appendChild(o);
    Object.keys(all).sort(function (a, b) { return all[b] - all[a]; }).forEach(function (w) {
      var c = counts[w] || 0, op = el('option', '', nice(w) + ' (' + c + ')'); op.value = w; if (!c) op.disabled = true; sel.appendChild(op);
    });
    var only = el('button', 'btn', ''); only.type = 'button';
    var cur = store('tn-who') || '', hide = store('tn-who-hide') === 'on';
    if (!counts[cur]) cur = '';
    sel.value = cur;
    lab.appendChild(sel); wrap.appendChild(lab); wrap.appendChild(only);
    var bodyRef = null;
    function apply(body) {
      if (body) bodyRef = body; if (!bodyRef) return;
      var v = sel.value; only.hidden = !v;
      only.setAttribute('aria-pressed', hide); only.textContent = 'Only their lines: ' + (hide ? 'on' : 'off');
      bodyRef.classList.toggle('whoOn', !!v); bodyRef.classList.toggle('whoHide', !!v && hide);
      Array.prototype.forEach.call(bodyRef.querySelectorAll('.speech'), function (sp) { sp.classList.toggle('mine', !!v && sp.getAttribute('data-who') === v); });
      store('tn-who', v); store('tn-who-hide', hide ? 'on' : 'off');
    }
    sel.addEventListener('change', function () { closeCard(); apply(); });
    only.addEventListener('click', function () { hide = !hide; apply(); });
    return { wrap: wrap, apply: apply };
  }
  function nice(w) { if (w === 'FOOL') return 'Fool (Feste)'; return w.toLowerCase().replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); }); }

  // A production note card. Used under a line (expandable) and in the scene notes box.
  function noteCard(n, withClose) {
    var card = el('div', 'card notecard'); card.setAttribute('data-type', n.type || 'dram');
    if (withClose) { var x = el('button', 'x', 'Close'); x.type = 'button'; x.setAttribute('aria-label', 'Close note'); x.addEventListener('click', function () { var bb = openBtn; closeCard(); if (bb) bb.focus(); }); card.appendChild(x); }
    card.appendChild(el('b', '', TYPES[n.type] || 'Note')); card.appendChild(document.createElement('br'));
    card.appendChild(el('span', '', n.text));
    if (n.author) card.appendChild(el('span', 'meta', n.author));
    return card;
  }

  // Put a small tag at the end of each line that has a production note.
  function attachNotes(body, scene, notes) {
    notes.filter(function (n) { return n.line != null; }).forEach(function (n) {
      var hit = null;
      Array.prototype.forEach.call(body.querySelectorAll('.l'), function (p) {
        if (!hit && +p.getAttribute('data-n') <= n.line && n.line <= +p.getAttribute('data-n2')) hit = p;
      });
      if (!hit) return;
      var b = el('button', 'nt', TYPES[n.type] || 'Note'); b.type = 'button'; b.setAttribute('data-type', n.type || 'dram'); b.setAttribute('aria-expanded', 'false');
      b._note = n; hit.appendChild(b);
    });
  }

  function navRow(prev, next) {
    var r = el('div', 'scenenav');
    var a = el('a', '', prev ? '← ' + sceneTitle(prev) : ''); if (prev) a.href = '#' + prev.id;
    var b = el('a', '', next ? sceneTitle(next) + ' →' : ''); if (next) b.href = '#' + next.id;
    r.appendChild(a); r.appendChild(b); return r;
  }

  // Find glossary matches in a whole speech so phrases can span a line break.
  function findSpans(lines) {
    var texts = lines.map(function (l) { return l.t; });
    var joined = '', offs = [];
    texts.forEach(function (t, k) { offs.push(joined.length); joined += t + (k < texts.length - 1 ? ' ' : ''); });
    // mask stage directions in [brackets] so they are never highlighted
    var depth = 0, masked = '';
    for (var c = 0; c < joined.length; c++) {
      var ch = joined[c];
      if (ch === '[') { depth++; masked += '\u0001'; }
      else if (ch === ']') { depth = Math.max(0, depth - 1); masked += '\u0001'; }
      else masked += depth > 0 ? '\u0001' : ch;
    }
    var cands = [];
    rules.forEach(function (r) {
      r.re.lastIndex = 0; var m;
      while ((m = r.re.exec(masked))) {
        if (m[0] === '') { r.re.lastIndex++; continue; }
        var hit = m[1] != null ? m[1] : m[0];
        var s0 = m.index + m[0].indexOf(hit);
        cands.push({ s: s0, e: s0 + hit.length, gi: r.i });
      }
    });
    cands.sort(function (a, b) { return a.s - b.s || (b.e - b.s) - (a.e - a.s); });
    var kept = [], end = -1;
    cands.forEach(function (c) { if (c.s >= end) { kept.push(c); end = c.e; } });
    return { offs: offs, spans: kept };
  }

  function isProse(lines) {
    if (lines.length < 3) return false;
    if (lines.some(function (l) { return /^\s/.test(l.t); })) return false;
    var lower = 0;
    for (var i = 1; i < lines.length; i++) if (/^[a-z]/.test(lines[i].t)) lower++;
    return lower / (lines.length - 1) >= 0.25;
  }

  function drawEntry(e, scene) {
    if (e.k === 'dir') {
      var d = el('p', 'dirline');
      d.textContent = e.lines.map(function (l) { return l.t; }).join(' ');
      return d;
    }
    var sp = el('div', 'speech'); sp.setAttribute('data-who', e.who);
    var lk = el('button', 'lnk', 'Link'); lk.type = 'button'; lk.setAttribute('data-id', scene.id + '.' + e.lines[0].n);
    lk.setAttribute('aria-label', 'Copy link to ' + sceneTitle(scene) + ', line ' + e.lines[0].n);
    sp.appendChild(lk);
    if (!e.cont) {
      var who = el('div', 'who', e.who);
      if (e.note) who.appendChild(el('span', 'note', e.note));
      sp.appendChild(who);
    }
    // Prose speeches are reflowed into one paragraph so they read well on a phone.
    // Verse and songs keep one line per line. Line numbers always follow the cut file.
    var lines = isProse(e.lines)
      ? [{ t: e.lines.map(function (l) { return l.t.trim(); }).join(' '), n: e.lines[0].n, n2: e.lines[e.lines.length - 1].n, prose: true }]
      : e.lines;
    var found = findSpans(lines);
    var depth = 0;
    lines.forEach(function (l, k) {
      var p = el('p', 'l' + (l.prose ? ' prose' : '') + (/^\s/.test(l.t) ? ' songline' : ''));
      p.setAttribute('data-n', l.n); p.setAttribute('data-n2', l.n2 || l.n); p.setAttribute('data-scene', scene.id);
      if (!l.prose && l.n % 5 === 0) p.appendChild(el('span', 'num', String(l.n)));
      var lo = found.offs[k], hi = lo + l.t.length, pos = 0;
      var pieces = [];
      found.spans.forEach(function (sp2) {
        if (sp2.e <= lo || sp2.s >= hi) return;
        var a = Math.max(sp2.s, lo) - lo, b = Math.min(sp2.e, hi) - lo;
        if (a > pos) pieces.push({ t: l.t.slice(pos, a) });
        pieces.push({ t: l.t.slice(a, b), gi: sp2.gi }); pos = b;
      });
      if (pos < l.t.length) pieces.push({ t: l.t.slice(pos) });
      pieces.forEach(function (pc) {
        if (pc.gi != null) {
          var btn = el('button', 'g', pc.t); btn.type = 'button'; btn.setAttribute('data-gi', pc.gi); btn.setAttribute('aria-expanded', 'false');
          p.appendChild(btn);
        } else depth = appendWithBrackets(p, pc.t, depth);
      });
      sp.appendChild(p);
    });
    return sp;
  }

  // Italicize anything inside [brackets], even if the bracket runs over to the next line.
  function appendWithBrackets(p, text, depth) {
    var buf = '';
    function flush(it) { if (!buf) return; if (it) p.appendChild(el('em', '', buf)); else p.appendChild(document.createTextNode(buf)); buf = ''; }
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === '[') { flush(depth > 0); depth++; buf += ch; }
      else if (ch === ']') { buf += ch; flush(true); depth = Math.max(0, depth - 1); }
      else buf += ch;
    }
    flush(depth > 0);
    return depth;
  }

  // Click or tap opens a gloss card under the line. Hover shows a short preview on devices with a mouse.
  var openCard = null, openBtn = null, tip = null;
  function closeCard() {
    if (openCard && openCard.parentNode) openCard.parentNode.removeChild(openCard);
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    openCard = openBtn = null;
  }
  function hideTip() { if (tip && tip.parentNode) tip.parentNode.removeChild(tip); tip = null; }

  function wireGlosses(body, scene) {
    body.addEventListener('click', function (ev) {
      var lk = ev.target.closest('button.lnk');
      if (lk) { copyLink(lk); return; }
      var nt = ev.target.closest('button.nt');
      if (nt) {
        hideTip(); var again2 = (nt === openBtn); closeCard(); if (again2) return;
        var ln = nt.closest('.l'), c2 = noteCard(nt._note, true);
        ln.parentNode.insertBefore(c2, ln.nextSibling); nt.setAttribute('aria-expanded', 'true'); openCard = c2; openBtn = nt; return;
      }
      var b = ev.target.closest('button.g'); if (!b) return;
      hideTip();
      var again = (b === openBtn); closeCard(); if (again) return;
      var g = GLOSS[+b.getAttribute('data-gi')], line = b.closest('.l');
      var card = el('div', 'card'); card.setAttribute('role', 'note');
      var x = el('button', 'x', 'Close'); x.type = 'button'; x.setAttribute('aria-label', 'Close gloss');
      x.addEventListener('click', function () { var bb = openBtn; closeCard(); if (bb) bb.focus(); });
      card.appendChild(x);
      card.appendChild(el('b', '', g.term)); card.appendChild(document.createElement('br'));
      card.appendChild(el('span', '', g.gloss));
      if (g.editorsDiffer) card.appendChild(el('span', 'meta', 'Editors differ on this one.'));
      var n1 = line.getAttribute('data-n'), n2 = line.getAttribute('data-n2');
      card.appendChild(el('span', 'meta', sceneTitle(scene) + (n1 === n2 ? ', line ' + n1 : ', lines ' + n1 + ' to ' + n2)));
      line.parentNode.insertBefore(card, line.nextSibling);
      b.setAttribute('aria-expanded', 'true'); openCard = card; openBtn = b;
    });
    if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
      body.addEventListener('mouseover', function (ev) {
        var b = ev.target.closest('button.g'); if (!b || body.classList.contains('hl-off')) return;
        hideTip();
        tip = el('div', 'tip', GLOSS[+b.getAttribute('data-gi')].gloss);
        document.body.appendChild(tip);
        var r = b.getBoundingClientRect();
        tip.style.left = Math.max(8, Math.min(r.left, window.innerWidth - tip.offsetWidth - 8)) + 'px';
        var top = r.top - tip.offsetHeight - 6; if (top < 8) top = r.bottom + 6;
        tip.style.top = top + 'px';
      });
      body.addEventListener('mouseout', function (ev) { if (ev.target.closest('button.g')) hideTip(); });
    }
  }
  // Copy a link to a line. If the browser blocks the clipboard, I put the link in the address bar so I can copy it by hand.
  function copyLink(btn) {
    var url = location.origin + location.pathname + '#' + btn.getAttribute('data-id');
    function done(msg) { var old = btn.textContent; btn.textContent = msg; setTimeout(function () { btn.textContent = 'Link'; }, 1600); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { done('Copied'); }, function () { history.replaceState(null, '', '#' + btn.getAttribute('data-id')); done('In address bar'); });
    else { history.replaceState(null, '', '#' + btn.getAttribute('data-id')); done('In address bar'); }
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var bb = openBtn; closeCard(); hideTip(); if (bb) bb.focus(); } });
})();
