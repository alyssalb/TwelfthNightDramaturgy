/* Opens a grid image large, with next and previous. I use it on the Director's Vision page and on the home page.
   It works with any ul.vision-grid. I don't need to edit this file to add or change images. */
(function () {
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.vision-grid button'));
  var box = document.getElementById('vbox');
  if (!tiles.length || !box) return;
  var img = box.querySelector('img'), count = box.querySelector('.vcount');
  var closeBtn = box.querySelector('.vclose'), prev = box.querySelector('.vprev'), next = box.querySelector('.vnext');
  var cur = 0, opener = null, startX = null;

  function show(i) {
    cur = (i + tiles.length) % tiles.length;
    var t = tiles[cur].querySelector('img');
    img.src = t.getAttribute('data-full') || t.src; img.alt = t.alt;
    count.textContent = (cur + 1) + ' of ' + tiles.length;
  }
  function open(i) {
    opener = tiles[i]; show(i); box.hidden = false; document.body.classList.add('vopen'); closeBtn.focus();
  }
  function close() {
    box.hidden = true; document.body.classList.remove('vopen'); if (opener) opener.focus();
  }
  tiles.forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
  closeBtn.addEventListener('click', close);
  prev.addEventListener('click', function () { show(cur - 1); });
  next.addEventListener('click', function () { show(cur + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'ArrowRight') show(cur + 1);
    else if (e.key === 'Tab') {   // keep keyboard focus inside the viewer
      var f = [closeBtn, prev, next], k = f.indexOf(document.activeElement);
      e.preventDefault(); f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  // Swipe on a phone
  box.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX; startX = null;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  });
})();
