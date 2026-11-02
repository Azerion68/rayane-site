/* DA minimaliste : parallaxe (défilement + souris) */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const am = $('.about-media video');
  if (am) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { am.controls = true; }
    else if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const p = am.play(); if (p && p.catch) p.catch(() => {}); } else am.pause(); }), { threshold: .25 }).observe(am);
    else am.play().catch(() => {});
  }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hero = $('.hero4');
  const layers = $$('.sheet .cell img, .intro-img img, .work img').map(el => ({ el, box: el.closest('.cell, .intro-img, .work'), k: 'cell' }));
  const heroImg = $$('.page-hero-img').map(el => ({ el, box: el.closest('.page-hero'), k: 'hero' }));
  const titles = $$('.page-title, .page-hero .hero-sub, .panel[aria-labelledby="titre-cta"] .title-wide').map(el => ({ el, box: el.closest('.panel'), k: 'title' }));
  const stage = $('.stage-reel');
  const pxs = $$('[data-px]');
  let mx = 0, my = 0, ticking = false;
  const clamp = (v, a) => Math.max(-a, Math.min(a, v));
  const tick = () => {
    ticking = false;
    const vh = innerHeight, sy = scrollY;
    if (hero && sy < hero.offsetHeight * 1.1) {
      const s = Math.min(sy, hero.offsetHeight);
      hero.style.setProperty('--hy', (s * .38).toFixed(1) + 'px');
      $('h1', hero).style.setProperty('--hy2', (s * .2).toFixed(1) + 'px');
      stage.style.setProperty('--mx', mx.toFixed(1) + 'px'); stage.style.setProperty('--my', my.toFixed(1) + 'px');
    }
    const kx = Math.min(1, innerWidth / 1200);
    pxs.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const p = ((r.top + r.height / 2) - vh / 2) / (vh / 2); // -1 haut ... 1 bas
      const sx = +(el.dataset.sx || 0), sy = +(el.dataset.sy || 0), a = Math.abs(p);
      el.style.setProperty('--px', (p * sx * kx).toFixed(1) + 'px');
      el.style.setProperty('--py2', (p * sy).toFixed(1) + 'px');
      const f = el.hasAttribute('data-fade') ? Math.max(0, Math.min(1, (a - .55) / .6)) : 0;
      el.style.setProperty('--po', (1 - f * .85).toFixed(2));
      el.style.setProperty('--pb', (f * 5).toFixed(1) + 'px');
    });
    [...layers, ...heroImg, ...titles].forEach(({ el, box, k }) => {
      if (!box) return;
      const r = box.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      const rel = ((r.top + r.height / 2) - vh / 2) / vh;
      if (k === 'cell') el.style.setProperty('--pz', clamp(-rel * 80, r.height * .085).toFixed(1) + 'px');
      else if (k === 'hero') el.style.setProperty('--pz', clamp(Math.max(0, sy) * .28, r.height * .12).toFixed(1) + 'px');
      else el.style.setProperty('--pt', clamp(-rel * 46, 40).toFixed(1) + 'px');
    });
  };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } };
  addEventListener('scroll', req, { passive: true }); addEventListener('resize', req);
  if (hero && matchMedia('(pointer: fine)').matches) addEventListener('pointermove', e => { mx = (e.clientX / innerWidth - .5) * -24; my = (e.clientY / innerHeight - .5) * -16; req(); }, { passive: true });
  tick();
})();

/* Sous-menus : ouverture au survol (avec petite tolérance) et au clavier / toucher */
(function(){
  var items=document.querySelectorAll('.has-sub');
  items.forEach(function(li){
    var t;
    function open(){clearTimeout(t);items.forEach(function(o){if(o!==li)o.classList.remove('is-open')});li.classList.add('is-open')}
    function close(){clearTimeout(t);t=setTimeout(function(){li.classList.remove('is-open')},160)}
    li.addEventListener('mouseenter',open);
    li.addEventListener('mouseleave',close);
    li.addEventListener('focusin',open);
    li.addEventListener('focusout',close);
    var a=li.querySelector('.nav-link');
    a.addEventListener('touchend',function(e){if(!li.classList.contains('is-open')){e.preventDefault();open()}},{passive:false});
  });
  document.addEventListener('touchstart',function(e){if(!e.target.closest('.has-sub'))items.forEach(function(o){o.classList.remove('is-open')})},{passive:true});
})();

/* Menu mobile : accordéon (une seule rubrique ouverte à la fois) */
(function(){
  var m=document.getElementById('menu');if(!m)return;
  m.classList.add('js-acc');
  function closeAll(){m.querySelectorAll('li.open').forEach(function(o){o.classList.remove('open');var b=o.querySelector('.menu-link');if(b)b.setAttribute('aria-expanded','false')})}
  m.querySelectorAll('li').forEach(function(li){
    var subs=li.querySelectorAll('.menu-sub-link');if(!subs.length)return;
    var main=li.querySelector('.menu-link');
    var wrap=document.createElement('div');wrap.className='menu-sub';
    var all=document.createElement('a');all.className='menu-sub-link menu-sub-all';all.href=main.getAttribute('href');all.textContent='Voir tout';wrap.appendChild(all);
    subs.forEach(function(a){wrap.appendChild(a)});
    li.appendChild(wrap);
    main.classList.add('has-acc');main.setAttribute('aria-expanded','false');
    main.addEventListener('click',function(e){
      e.preventDefault();
      var wasOpen=li.classList.contains('open');
      closeAll();
      if(!wasOpen){li.classList.add('open');main.setAttribute('aria-expanded','true')}
    });
  });
  new MutationObserver(function(){if(m.hidden)closeAll()}).observe(m,{attributes:true,attributeFilter:['hidden']});
})();
