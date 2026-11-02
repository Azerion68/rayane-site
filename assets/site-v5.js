/* ==========================================================================
   Rayane Al Shouli : script commun à toutes les pages
   ========================================================================== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mq = matchMedia('(max-width: 767px)');

  /* ------------------------------------------------------------------
     CONFIGURATION : à renseigner avant la mise en ligne
     - formEndpoint : URL de votre service de formulaire (ex. Formspree :
       "https://formspree.io/f/xxxxxxx"). Tant qu'elle est vide, le
       formulaire n'envoie rien et propose le téléphone / Instagram.
     - email : facultatif, affiché dans le message de secours.
     ------------------------------------------------------------------ */
  const CONFIG = { formEndpoint: 'https://formspree.io/f/maeedwoj', email: '', phone: '07 51 24 60 39' };

  /* ---------- Vidéo du hero (accueil) : lecture auto, image fixe si mouvement réduit ---------- */
  const vid = $('.hero-video');
  if (vid) {
    if (reduce) { vid.removeAttribute('autoplay'); vid.pause(); }
    else {
      vid.muted = true;
      const play = () => { const p = vid.play(); if (p && p.catch) p.catch(() => {}); };
      play();
      document.addEventListener('visibilitychange', () => { if (!document.hidden) play(); });
      if ('IntersectionObserver' in window) {   // économie de batterie : pause hors écran
        new IntersectionObserver(([e]) => { e.isIntersecting ? play() : vid.pause(); }).observe(vid.parentElement);
      }
    }
  }

  /* ---------- En-tête : fond sombre dès qu'on quitte le haut de page ---------- */
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 40);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menu plein écran (mobile / tablette) ---------- */
  const menu = $('#menu'), openBtn = $('#menuOpen'), closeBtn = $('#menuClose');
  const setMenu = open => {
    menu.hidden = !open;
    openBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    (open ? closeBtn : openBtn).focus({ preventScroll: true });
  };
  openBtn.addEventListener('click', () => setMenu(true));
  closeBtn.addEventListener('click', () => setMenu(false));

  /* ---------- Filtres (pages Photo et Vidéo) ---------- */
  $$('.tabs').forEach(group => {
    const sheet = document.getElementById(group.dataset.sheet);
    if (!sheet) return;
    const cells = $$('.cell', sheet);
    const tabs = $$('.tab', group);
    const apply = cat => {
      tabs.forEach(t => t.setAttribute('aria-pressed', String(t.dataset.filter === cat)));
      sheet.classList.toggle('is-filtered', cat !== 'tous');
      sheet.classList.toggle('is-selection', cat === 'selection');
      cells.forEach(c => { c.hidden = !(cat === 'tous' || (cat === 'selection' ? c.hasAttribute('data-featured') : c.dataset.cat === cat)); c.classList.remove('span-all'); });
      const shown = cells.filter(c => !c.hidden);

    };
    tabs.forEach(tab => tab.addEventListener('click', () => apply(tab.dataset.filter)));
    // lien direct, ex. photographe-strasbourg.html#mariages
    const hash = location.hash.slice(1);
    if (tabs.some(t => t.dataset.filter === hash)) apply(hash); else apply('selection');
  });

  /* ---------- Lightbox (page Photo) ---------- */
  const lb = $('#lb'), photoSheet = $('#sheetPhoto');
  if (lb && photoSheet) {
    const media = $('#lbMedia'), cap = $('#lbCap');
    const list = () => $$('.cell', photoSheet).filter(c => !c.hidden);
    let items = [], current = 0, lastFocus = null;
    const show = i => {
      current = (i + items.length) % items.length;
      const c = items[current], src = $('img', c);
      const img = new Image();
      img.src = src.currentSrc || src.src; img.alt = src.alt;
      media.replaceChildren(img);
      cap.textContent = $('h3', c).firstChild.textContent + '   |   ' + (current + 1) + ' / ' + items.length;
    };
    const openLb = c => { items = list(); lastFocus = document.activeElement; lb.hidden = false; document.body.style.overflow = 'hidden'; show(items.indexOf(c)); $('#lbClose').focus(); };
    const closeLb = () => { lb.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus({ preventScroll: true }); };
    $$('.cell', photoSheet).forEach(c => $('.cell-btn', c).addEventListener('click', () => openLb(c)));
    $('#lbClose').addEventListener('click', closeLb);
    $('#lbPrev').addEventListener('click', () => show(current - 1));
    $('#lbNext').addEventListener('click', () => show(current + 1));
    lb.addEventListener('click', e => { if (e.target === lb || e.target === lb.lastElementChild) closeLb(); });
    addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') show(current - 1);
      else if (e.key === 'ArrowRight') show(current + 1);
    });
  }
  addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  /* ---------- Mobile : profondeur (pile de cartes, parallaxe, apparitions) ---------- */
  const imgs = $$('.cell img, .intro-img img').map(im => ({ im, box: im.closest('.cell, .intro-img') }));
  const rise = $$('.sheet .cell, .intro-grid > div, .intro-img, .panel > h2.title-wide, .tabs');
  rise.forEach(el => el.classList.add('rise'));
  if (!reduce) {
    if ('IntersectionObserver' in window) {
      document.documentElement.classList.add('js-rv');
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      rise.forEach(c => io.observe(c));
    }
    let ticking = false;
    const update = () => {
      ticking = false;
      if (!mq.matches) return;
      const vh = innerHeight;
      imgs.forEach(({ im, box }) => {
        if (box.hidden) return;
        const r = box.getBoundingClientRect();
        if (r.bottom < -120 || r.top > vh + 120) return;
        const p = ((r.top + r.height / 2) - vh / 2) / vh;
        im.style.setProperty('--py', (p * -4).toFixed(2) + '%');
      });
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req);
    update();
  }

  /* ---------- Formulaire de contact ---------- */
  const form = $('#contactForm');
  if (form) {
    const status = $('#formStatus');
    const say = msg => { status.textContent = msg; };

    // pré-sélection du projet : contact.html?type=Mariage
    const wanted = new URLSearchParams(location.search).get('type');
    if (wanted) { const sel = $('#type'); const opt = [...sel.options].find(o => o.value === wanted || o.text === wanted); if (opt) sel.value = opt.value; }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      if (data.site) return;                                   // robot détecté
      if (!data.nom.trim() || !/^\S+@\S+\.\S+$/.test(data.email) || !data.type_projet || !data.message.trim()) {
        say('Merci de renseigner votre nom, un e-mail valide, le projet et un message.');
        const bad = ['nom', 'email', 'type', 'message'].map(id => $('#' + id)).find(el => !el.checkValidity() || !el.value.trim());
        if (bad) bad.focus();
        return;
      }
      delete data.site;

      if (!CONFIG.formEndpoint) {
        say(CONFIG.email
          ? `L’envoi automatique n’est pas encore activé. Écrivez-moi à ${CONFIG.email} ou appelez le ${CONFIG.phone}.`
          : `L’envoi automatique n’est pas encore activé. Appelez-moi au ${CONFIG.phone} ou écrivez-moi sur Instagram.`);
        return;
      }
      const btn = $('button[type="submit"]', form);
      btn.disabled = true; say('Envoi en cours…');
      try {
        const res = await fetch(CONFIG.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        say('Merci, votre demande est bien envoyée. Je vous réponds très vite.');
      } catch (err) {
        say(`L’envoi a échoué. Appelez-moi au ${CONFIG.phone} ou réessayez dans un instant.`);
      } finally { btn.disabled = false; }
    });
  }
})();
