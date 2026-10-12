/*
 * Hero load-in sequence: splits the hero title into individual
 * characters and staggers them in (blur + rise + fade), then the
 * separator, then the contact info follow in turn. Purely a visual
 * flourish - skipped entirely under prefers-reduced-motion, and the
 * title keeps a full aria-label so screen readers get the plain text
 * instead of one node per character.
 *
 * Re-runs on bfcache restoration (navigating back/forward to this
 * page): browsers restore the page without re-executing scripts, so
 * without this the title would just sit in its already-finished
 * state - no visible animation - even though a hard refresh looks
 * fine (a refresh always re-runs everything from scratch).
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var h1 = document.querySelector('#home h1.responsive-small');
  if (!h1 || reduceMotion) { return; }

  function splitTitle() {
    var text = h1.getAttribute('aria-label') || h1.textContent;
    var lineTexts = Array.prototype.map.call(
      h1.querySelectorAll('.hero-title-line'),
      function (line) { return line.textContent.trim(); }
    ).filter(Boolean);

    if (!lineTexts.length) { lineTexts = [text.trim()]; }

    var wrapper = document.createElement('span');
    wrapper.className = 'hero-title-intro';
    wrapper.setAttribute('aria-hidden', 'true');

    var delay = 0;
    var step = 0.028;

    // Preserve the deliberate line groups from the HTML while still
    // animating each character. This prevents the spans from changing
    // the title's wrapping after JavaScript runs.
    lineTexts.forEach(function (lineText) {
      var lineSpan = document.createElement('span');
      lineSpan.className = 'hero-title-line';
      var words = lineText.split(/\s+/);

      words.forEach(function (word, wi) {
        var wordSpan = document.createElement('span');
        wordSpan.className = 'hero-word';
        word.split('').forEach(function (ch) {
          var span = document.createElement('span');
          span.className = 'hero-char';
          span.textContent = ch;
          span.style.animationDelay = delay.toFixed(3) + 's';
          wordSpan.appendChild(span);
          delay += step;
        });
        lineSpan.appendChild(wordSpan);

        if (wi < words.length - 1) {
          var spaceSpan = document.createElement('span');
          spaceSpan.className = 'hero-char space';
          spaceSpan.textContent = ' ';
          spaceSpan.style.animationDelay = delay.toFixed(3) + 's';
          lineSpan.appendChild(spaceSpan);
          delay += step;
        }
      });

      wrapper.appendChild(lineSpan);
    });

    h1.setAttribute('aria-label', text);
    h1.innerHTML = '';
    h1.appendChild(wrapper);
  }

  // Restarts a CSS animation on an already-present element (used for the
  // separator/contact info, which - unlike the title - aren't rebuilt
  // from scratch, so simply existing in a restored DOM doesn't replay
  // their animation on its own).
  function restartAnimation(el) {
    if (!el) { return; }
    el.style.animation = 'none';
    void el.offsetHeight; // eslint-disable-line no-unused-expressions
    el.style.animation = '';
  }

  function runIntro() {
    splitTitle();
    restartAnimation(document.querySelector('#home .separator-container'));
    document.querySelectorAll('#home .content h5, #home .content > a.btn-social')
      .forEach(restartAnimation);
  }

  runIntro();

  window.addEventListener('pageshow', function (event) {
    if (event.persisted) { runIntro(); }
  });
})();
