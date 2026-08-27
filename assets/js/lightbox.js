/*
 * Full-browser lightbox for the project images (both featured and
 * grid). Delegated click handling so it works for the grid tiles
 * even though they're rendered later by projects-grid.js. Closes via
 * the close button, clicking the dark backdrop, or Escape, and
 * restores focus to whatever was clicked when it opened.
 */
(function () {
  "use strict";

  var lightbox = document.getElementById('lightbox');
  var img = document.getElementById('lightboxImg');
  var caption = document.getElementById('lightboxCaption');
  var closeBtn = document.getElementById('lightboxClose');
  if (!lightbox || !img || !closeBtn) { return; }

  var lastFocused = null;

  function open(src, title, triggerEl) {
    lastFocused = triggerEl || document.activeElement;
    img.src = src;
    img.alt = title || '';
    caption.textContent = title || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('noscroll');
    closeBtn.focus();
  }

  function close() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('noscroll');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
    setTimeout(function () {
      if (!lightbox.classList.contains('open')) { img.src = ''; }
    }, 300);
  }

  document.addEventListener('click', function (e) {
    var projectImg = e.target.closest && e.target.closest('.project img');
    if (!projectImg) { return; }
    e.preventDefault();
    // Grid tiles load a downscaled thumbnail and carry the full-size
    // original on data-full; open that so the lightbox is not showing a
    // 900px image blown up full-browser. The two featured images in
    // index.html have no data-full and fall through to their own src.
    var full = projectImg.getAttribute('data-full');
    open(full || projectImg.currentSrc || projectImg.src, projectImg.getAttribute('data-title'), projectImg);
  });

  closeBtn.addEventListener('click', close);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) { close(); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) { close(); }
  });
})();
