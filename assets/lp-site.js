(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* Barre de progression */
  var prog = document.createElement('div'); prog.className = 'lp-prog'; prog.setAttribute('aria-hidden', 'true');
  document.body.appendChild(prog);
  var ticking = false;
  function frame() {
    ticking = false;
    var H = document.documentElement.scrollHeight - innerHeight;
    prog.style.setProperty('--s', H > 0 ? (scrollY / H).toFixed(4) : 0);
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); frame();

  /* Titres coupés mot à mot */
  function splitNode(node, st) {
    Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
      if (ch.nodeType === 3) {
        var frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(function (t) {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'lp-w'; w.setAttribute('aria-hidden', 'true');
          var s = document.createElement('span'); s.textContent = t; s.style.setProperty('--i', st.i++);
          w.appendChild(s); frag.appendChild(w);
        });
        node.replaceChild(frag, ch);
      } else if (ch.nodeType === 1 && !ch.classList.contains('sr-only') && ch.nodeName !== 'SVG') { splitNode(ch, st); }
    });
  }
  var heads = $$('main .title-wide, main .works-title, main .reviews h2');
  var pageTitle = $('.page-title');
  var label;
  heads.concat(pageTitle ? [pageTitle] : []).forEach(function (el) {
    if (el.querySelector('.trust-num')) return;
    label = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('data-lp-split', '');
    if (!el.closest('h1')) el.setAttribute('aria-label', label);
    splitNode(el, { i: 0 });
    el.classList.add('split-ready');
  });

  var io = null;
  if (reduce || !hasIO) {
    $$('[data-lp-split]').forEach(function (e) { e.classList.add('split-in'); });
    $$('.lp-eyebrow, .lp-rv, .lp-img, .lp-gallery figure').forEach(function (e) { e.classList.add('in'); });
  } else {
    if (pageTitle) {
      pageTitle.style.setProperty('--base', '250ms');
      requestAnimationFrame(function () { requestAnimationFrame(function () { pageTitle.classList.add('split-in'); }); });
    }
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target;
        t.classList.add(t.hasAttribute('data-lp-split') ? 'split-in' : 'in');
        io.unobserve(t);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    $$('[data-lp-split]:not(.page-title), .lp-eyebrow').forEach(function (e) { io.observe(e); });

    /* Éléments qui apparaissent en glissant, avec un léger décalage dans leur groupe */
    var groups = [
      'main div:has(> h3.font-cond)', 'main div:has(> p.font-cond.text-6xl)', '.rv', '.faq-item', '.work', '.about-text', '.trust-row', '.rv-link', '.seo-text p'
    ];
    groups.forEach(function (sel) {
      $$(sel).forEach(function (n, i) {
        n.classList.add('lp-rv'); n.style.setProperty('--d', (i % 4) * 120 + 'ms'); io.observe(n);
      });
    });
    $$('.about-media, .intro-img').forEach(function (n) { n.classList.add('lp-img'); io.observe(n); });
    $$('.lp-gallery figure').forEach(function (n, i) { n.style.setProperty('--d', (i % 4) * 110 + 'ms'); io.observe(n); });
  }
  window.__lpOk = true;
})();
