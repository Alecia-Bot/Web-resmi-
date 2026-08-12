
(function () {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const themeToggle = document.getElementById('themeToggle');
  const backTop = document.getElementById('backTop');
  const progress = document.getElementById('scrollProgress');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getSavedTheme() {
    try { return localStorage.getItem('astrobot-theme'); }
    catch (_) { return null; }
  }

  function saveTheme(theme) {
    try { localStorage.setItem('astrobot-theme', theme); }
    catch (_) { /* Preference remains active for this page. */ }
  }

  function updateThemeIcon() {
    if (!themeToggle) return;
    const isLight = root.dataset.theme === 'light';
    themeToggle.innerHTML = `<i class="fas ${isLight ? 'fa-sun' : 'fa-moon'}" aria-hidden="true"></i>`;
    themeToggle.setAttribute('aria-label', isLight ? 'Gunakan tema gelap' : 'Gunakan tema terang');
  }

  const savedTheme = getSavedTheme();
  if (savedTheme === 'light') root.dataset.theme = 'light';
  updateThemeIcon();

  themeToggle?.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
    if (nextTheme === 'light') root.dataset.theme = 'light';
    else delete root.dataset.theme;
    saveTheme(nextTheme);
    updateThemeIcon();
  });

  function closeMenu() {
    mobileNav?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.querySelector('i')?.classList.replace('fa-xmark', 'fa-bars');
    body.classList.remove('menu-open');
  }

  menuToggle?.addEventListener('click', () => {
    const open = !mobileNav?.classList.contains('is-open');
    mobileNav?.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    const icon = menuToggle.querySelector('i');
    if (icon) icon.className = `fas ${open ? 'fa-xmark' : 'fa-bars'}`;
    body.classList.toggle('menu-open', open);
  });

  mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 1020) closeMenu(); });

  function updateScrollUI() {
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 18);
    backTop?.classList.toggle('is-visible', y > 620);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? Math.min(100, (y / max) * 100) : 0}%`;
    }
  }

  updateScrollUI();
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -35px' });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
  }

  function initSliders() {
    if (typeof window.Swiper === 'undefined') return;

    const promoRoot = document.querySelector('.promo-swiper');
    if (promoRoot) {
      new window.Swiper(promoRoot, {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        speed: reduceMotion ? 0 : 680,
        grabCursor: true,
        followFinger: true,
        threshold: 3,
        resistanceRatio: .68,
        autoplay: reduceMotion ? false : {
          delay: 4300,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        },
        navigation: {
          prevEl: promoRoot.querySelector('.slider-prev'),
          nextEl: promoRoot.querySelector('.slider-next')
        },
        pagination: {
          el: promoRoot.querySelector('.promo-pagination'),
          clickable: true
        }
      });
    }

    const whyRoot = document.querySelector('.why-swiper');
    if (whyRoot) {
      new window.Swiper(whyRoot, {
        slidesPerView: 1,
        spaceBetween: 14,
        loop: true,
        speed: reduceMotion ? 0 : 620,
        grabCursor: true,
        followFinger: true,
        threshold: 3,
        resistanceRatio: .68,
        autoplay: reduceMotion ? false : {
          delay: 3600,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        },
        navigation: {
          prevEl: document.querySelector('.why-prev'),
          nextEl: document.querySelector('.why-next')
        },
        pagination: {
          el: whyRoot.querySelector('.why-pagination'),
          clickable: true
        }
      });
    }
  }

  initSliders();

  const serviceTabs = Array.from(document.querySelectorAll('[data-service-tab]'));
  const servicePanels = Array.from(document.querySelectorAll('[data-service-panel]'));

  function activateService(name) {
    serviceTabs.forEach(tab => {
      const active = tab.dataset.serviceTab === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    servicePanels.forEach(panel => {
      const active = panel.dataset.servicePanel === name;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  }

  serviceTabs.forEach(tab => tab.addEventListener('click', () => activateService(tab.dataset.serviceTab)));

  document.querySelectorAll('.order-button').forEach(button => {
    button.addEventListener('click', () => {
      const order = button.dataset.order || 'Layanan Astrobot';
      const message = `Halo Admin Astrobot, saya tertarik dengan ${order}. Bisa minta informasi selanjutnya?`;
      window.open(`https://wa.me/6289674097203?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    });
  });

  document.querySelectorAll('.faq-item > button').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const open = !item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('button')?.setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
    });
  });

  document.getElementById('contactForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const topic = String(data.get('topic') || '').trim();
    const message = String(data.get('message') || '').trim();
    if (!name || !message) return;
    const text = `Halo Admin Astrobot, saya ${name}.\n\nTopik: ${topic}\nPesan: ${message}`;
    window.open(`https://wa.me/6289674097203?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
})();
