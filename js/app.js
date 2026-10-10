/* One native motion system. No animation framework or network API dependency. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const root = document.documentElement;
  const cfg = window.PORTFOLIO;
  if (!cfg) return; // The complete static page remains usable.
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let manualPause = false;
  const motionAllowed = () => !reduce.matches && !manualPause && !document.hidden;
  root.classList.add('enhanced');

  // Intro is bounded, skippable, and confined to the hero. It never locks scrolling.
  const cinema = $('#cinema');
  const video = $('#intro-video');
  const hero = $('#home');
  let introActive = root.classList.contains('intro-pending');
  let introTimer = 0;
  let hideTimer = 0;
  const finishIntro = (fromButton = false) => {
    if (!introActive) return;
    introActive = false;
    clearTimeout(introTimer);
    clearTimeout(window.vkIntroFailSafe);
    const focusWasInside = cinema.contains(document.activeElement);
    root.classList.remove('intro-pending');
    hero.classList.add('revealing');
    cinema.classList.add('leaving');
    cinema.setAttribute('aria-hidden', 'true');
    cinema.inert = true;
    $('#skip-intro').tabIndex = -1;
    // Pause decoded media as soon as the reveal begins, even if it stalls later.
    video.pause();
    if (fromButton || focusWasInside) $('h1').focus({preventScroll:true});
    hideTimer = setTimeout(() => {
      cinema.hidden = true;
      video.removeAttribute('src');
      video.load();
      hero.classList.remove('revealing');
    }, reduce.matches ? 0 : 1200);
  };
  $('#skip-intro').addEventListener('click', () => finishIntro(true));
  if (introActive) {
    cinema.hidden = false;
    try { sessionStorage.setItem('vk-intro-seen', '1'); } catch (_) {}
    const connection = navigator.connection;
    const lightweight = innerWidth <= 760 || connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '');
    introTimer = setTimeout(finishIntro, lightweight ? 2400 : 5200);
    if (!lightweight) {
      video.muted = true;
      video.defaultMuted = true;
      video.src = cfg.video;
      video.addEventListener('playing', () => {
        if (introActive) cinema.classList.add('video-playing');
        else video.pause();
      });
      video.addEventListener('ended', () => finishIntro());
      video.addEventListener('error', () => {
        cinema.classList.remove('video-playing');
        $('#intro-status').textContent = 'SEQUENCE 01 / STILL IN MOTION';
        // Poster stays available; an unavailable video never holds the page.
      });
      const playback = video.play();
      playback?.catch(() => cinema.classList.remove('video-playing'));
    }
  }
  $('.cinema-poster').addEventListener('error', event => {
    event.currentTarget.hidden = true;
    video.removeAttribute('poster');
  });
  document.addEventListener('click', event => {
    if (event.target.closest('a[href^="#"]')) finishIntro();
  });
  addEventListener('hashchange', () => finishIntro());
  addEventListener('scroll', () => { if (scrollY > 60) finishIntro(); }, {passive:true});
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && introActive) finishIntro(true);
  });

  // Navigation: real anchors, coherent active state, accessible mobile controls.
  const menu = $('#menu');
  const burger = $('.burger');
  function setMenu(open, returnFocus = false) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (returnFocus) burger.focus();
  }
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('click', event => {
    if (!event.target.closest('header.nav')) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('open')) setMenu(false, true);
  });
  matchMedia('(min-width: 981px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

  // Tabs retain their panels in the document and support arrows, Home and End.
  const tabs = $$('#tabs [role="tab"]');
  const indicator = $('#ind');
  let activeTab = 0;
  function positionIndicator() {
    const tab = tabs[activeTab];
    indicator.style.width = tab.offsetWidth + 'px';
    indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
  }
  function selectTab(index, focus = false) {
    activeTab = index;
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      $('#' + tab.getAttribute('aria-controls')).hidden = !selected;
    });
    positionIndicator();
    if (focus) {
      tabs[index].focus({preventScroll:true});
      // Scroll only the tab rail; do not move the page on keyboard selection.
      const rail = $('#tabs');
      const tab = tabs[index];
      const left = tab.offsetLeft, right = left + tab.offsetWidth;
      if (left < rail.scrollLeft) rail.scrollLeft = left;
      else if (right > rail.scrollLeft + rail.clientWidth) rail.scrollLeft = right - rail.clientWidth;
    }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectTab(next, true); }
    });
  });
  selectTab(0);
  document.fonts?.ready.then(positionIndicator);
  if ('ResizeObserver' in window) new ResizeObserver(positionIndicator).observe($('#tabs'));
  else addEventListener('resize', positionIndicator);

  // Quiet role animation; screen readers receive the static career targets.
  const role = $('#active-role');
  let roleIndex = 0;
  let roleInterval = 0;
  let roleTimeout = 0;
  function showRole(index) {
    role.textContent = cfg.roles[index];
    $('#role-number').textContent = String(index + 1).padStart(2, '0');
  }
  function startRoles() {
    clearInterval(roleInterval);
    clearTimeout(roleTimeout);
    role.classList.remove('changing', 'entering');
    if (!motionAllowed()) return;
    roleInterval = setInterval(() => {
      if (introActive || !motionAllowed() || scrollY > hero.offsetHeight) return;
      role.classList.add('changing');
      roleTimeout = setTimeout(() => {
        roleIndex = (roleIndex + 1) % cfg.roles.length;
        showRole(roleIndex);
        role.classList.remove('changing');
        role.classList.add('entering');
        requestAnimationFrame(() => requestAnimationFrame(() => role.classList.remove('entering')));
      }, 260);
    }, 3800);
  }

  // Never replace text with a fake zero; results always finish at verified values.
  function animateResult(el) {
    if (!motionAllowed() || el.dataset.counted) return;
    el.dataset.counted = 'true';
    const target = Number(el.dataset.result), from = target * .94;
    const start = performance.now();
    function frame(now) {
      if (!motionAllowed()) { el.textContent = target.toFixed(1); return; }
      const t = Math.min(1, (now - start) / 1000);
      el.textContent = (from + (target - from) * (1 - Math.pow(1 - t, 3))).toFixed(1);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  const reveal = element => {
    element.classList.add('in');
    if (motionAllowed()) element.classList.add('arriving');
    element.addEventListener('animationend', () => element.classList.remove('arriving'), {once:true});
    $$('[data-result]', element).forEach(animateResult);
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { reveal(entry.target); observer.unobserve(entry.target); }
    }), {threshold:.08});
    $$('.rv').forEach(element => observer.observe(element));
  } else $$('.rv').forEach(reveal);

  const scenes = $$('.viz');
  const visibleScenes = new Set();
  function syncScenes() {
    scenes.forEach(scene => {
      const running = motionAllowed() && visibleScenes.has(scene);
      scene.classList.toggle('scene-paused', !running);
      const svg = $('svg', scene);
      if (running) svg?.unpauseAnimations?.();
      else svg?.pauseAnimations?.();
    });
  }
  if ('IntersectionObserver' in window) {
    const sceneObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visibleScenes.add(entry.target) : visibleScenes.delete(entry.target));
      syncScenes();
    });
    scenes.forEach(scene => sceneObserver.observe(scene));
  } else scenes.forEach(scene => visibleScenes.add(scene));

  // Throttled reading progress, navigation and naturally drawn timeline lines.
  const sectionLinks = $$('.nav a.l');
  const sections = $$('main section[id]');
  const progress = $('#prog');
  const nav = $('header.nav');
  const journey = $('.journey');
  const experience = $('.tl');
  let scrollFrame = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  function updateScroll() {
    scrollFrame = 0;
    const maxScroll = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${maxScroll > 0 ? scrollY / maxScroll : 0})`;
    nav.classList.toggle('sc', scrollY > 40);
    let current = 'home';
    sections.forEach(section => { if (section.getBoundingClientRect().top <= innerHeight * .4) current = section.id; });
    sectionLinks.forEach(link => {
      if (link.hash === '#' + current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    for (const [el, name] of [[journey,'--journey-progress'], [experience,'--experience-progress']]) {
      const rect = el.getBoundingClientRect();
      el.style.setProperty(name, reduce.matches ? 1 : clamp((innerHeight * .8 - rect.top) / Math.max(1, rect.height - 50)));
    }
  }
  const requestScrollUpdate = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); };
  addEventListener('scroll', requestScrollUpdate, {passive:true});
  addEventListener('resize', requestScrollUpdate);
  updateScroll();

  // A restrained highlight follows the pointer, with no cursor replacement.
  function addGlow(element) {
    let frame = 0, point;
    element.addEventListener('pointermove', event => {
      if (!fine.matches || !motionAllowed()) return;
      point = event;
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = element.getBoundingClientRect();
        element.style.setProperty('--mx', point.clientX - rect.left + 'px');
        element.style.setProperty('--my', point.clientY - rect.top + 'px');
        element.style.setProperty('--px', (point.clientX - rect.left) / rect.width * 100 + '%');
        element.style.setProperty('--py', (point.clientY - rect.top) / rect.height * 100 + '%');
      });
    });
  }
  [hero,$('#contact'),...scenes].forEach(addGlow);

  const motionButton = $('#motion-toggle');
  motionButton.hidden = false;
  function syncMotion() {
    root.classList.toggle('motion-paused', manualPause || document.hidden);
    motionButton.setAttribute('aria-pressed', String(manualPause));
    motionButton.innerHTML = manualPause ? 'Resume motion <span aria-hidden="true">▷</span>' : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
    startRoles();
    syncScenes();
    if (reduce.matches) {
      finishIntro();
      $$('.rv').forEach(el => { el.classList.add('in'); el.classList.remove('arriving'); });
      $$('[data-result]').forEach(el => { el.textContent = el.dataset.result; });
    }
    updateScroll();
  }
  motionButton.addEventListener('click', () => { manualPause = !manualPause; syncMotion(); });
  reduce.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', () => {
    // A backgrounded introduction is considered seen, never replayed on return.
    if (document.hidden) finishIntro();
    syncMotion();
  });
  addEventListener('pagehide', () => {
    finishIntro();
    clearTimeout(hideTimer);
    clearInterval(roleInterval);
    clearTimeout(roleTimeout);
    cinema.hidden = true;
    video.pause();
  });
  addEventListener('pageshow', event => { if (event.persisted) syncMotion(); });
  syncMotion();
})();
