/* Dropdown definitions.
   In a page, a term is written like this:
   <button type="button" class="dd" data-def="The definition." data-src="Source name" data-url="https://link">the term</button>
   data-title (a different heading for the card), data-src and data-url are optional. Clicking the term opens a card under that paragraph or bullet; clicking again (or Escape) closes it. */
(function () {
  var openCard = null, openBtn = null;
  function close() {
    if (openCard && openCard.parentNode) openCard.parentNode.removeChild(openCard);
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    openCard = openBtn = null;
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('button.dd');
    if (!b) return;
    var again = (b === openBtn); close(); if (again) return;
    var card = document.createElement('div'); card.className = 'card ddcard'; card.setAttribute('role', 'note');
    var x = document.createElement('button'); x.type = 'button'; x.className = 'x'; x.textContent = 'Close'; x.setAttribute('aria-label', 'Close definition');
    x.addEventListener('click', function () { var bb = openBtn; close(); if (bb) bb.focus(); });
    card.appendChild(x);
    var t = document.createElement('b'); t.textContent = b.getAttribute('data-title') || b.textContent; card.appendChild(t);
    card.appendChild(document.createElement('br'));
    card.appendChild(document.createTextNode(b.getAttribute('data-def') || ''));
    var url = b.getAttribute('data-url');
    if (url) {
      var m = document.createElement('span'); m.className = 'meta';
      m.appendChild(document.createTextNode('Source: '));
      var a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = b.getAttribute('data-src') || url;
      m.appendChild(a); card.appendChild(m);
    }
    var block = b.closest('li, p, td') || b.parentNode;
    block.appendChild(card);
    b.setAttribute('aria-expanded', 'true'); openCard = card; openBtn = b;
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var bb = openBtn; close(); if (bb) bb.focus(); } });
  Array.prototype.forEach.call(document.querySelectorAll('button.dd'), function (b) { b.setAttribute('aria-expanded', 'false'); });
})();
