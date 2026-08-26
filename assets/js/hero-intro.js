/*
 * Hero load-in sequence: splits the hero title into individual
 * characters and staggers them in (blur + rise + fade), then the
 * separator, then the contact info follow in turn. Purely a visual
 * flourish — skipped entirely under prefers-reduced-motion, and the
 * title keeps a full aria-label so screen readers get the plain text
 * instead of one node per character.
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var h1 = document.querySelector('#home h1.responsive-small');
  if (!h1 || reduceMotion) { return; }

  var text = h1.textContent;
  var wrapper = document.createElement('span');
  wrapper.className = 'hero-title-intro';
  wrapper.setAttribute('aria-hidden', 'true');

  var delay = 0;
  var step = 0.028;

  // Each word is its own inline-block unit so line-wrapping only ever
  // happens between words, never mid-word between two character spans.
  var words = text.split(' ');
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
    wrapper.appendChild(wordSpan);

    if (wi < words.length - 1) {
      var spaceSpan = document.createElement('span');
      spaceSpan.className = 'hero-char space';
      spaceSpan.textContent = ' ';
      spaceSpan.style.animationDelay = delay.toFixed(3) + 's';
      wrapper.appendChild(spaceSpan);
      delay += step;
    }
  });

  h1.setAttribute('aria-label', text);
  h1.innerHTML = '';
  h1.appendChild(wrapper);
})();
