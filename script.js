/* ===== script.js ===== */

document.addEventListener('DOMContentLoaded', () => {
  const yrEl = document.getElementById('yr');
  if (yrEl) yrEl.textContent = new Date().getFullYear();

  new Swiper('.tSwiper', {
    slidesPerView: 1, spaceBetween: 12,
    pagination: { el: '.swiper-pagination', clickable: true },
    autoplay: { delay: 5000, disableOnInteraction: false },
    breakpoints: { 600: { slidesPerView: 2 }, 960: { slidesPerView: 3 } }
  });

  document.querySelectorAll('.countup').forEach(el => {
    const t = parseInt(el.dataset.n), s = t / 60; let c = 0;
    const ti = setInterval(() => {
      c = Math.min(c + s, t);
      el.textContent = Math.floor(c).toLocaleString('id');
      if (c >= t) clearInterval(ti);
    }, 22);
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.rv').forEach(el => obs.observe(el));
  setTimeout(() => {
    document.querySelectorAll('.rv:not(.on)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) { el.classList.add('on'); obs.unobserve(el); }
    });
  }, 80);

  window.addEventListener('scroll', () => {
    const d = document.documentElement;
    document.getElementById('bar').style.width = (d.scrollTop / (d.scrollHeight - d.clientHeight) * 100) + '%';
  });
});

/* ===== Menu ===== */
function openMenu() {
  document.getElementById('pn').classList.add('on');
  document.getElementById('ov').classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  document.getElementById('pn').classList.remove('on');
  document.getElementById('ov').classList.remove('on');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); closeAuthGate(); } });

function toggleFaq(btn) {
  const body = btn.nextElementSibling;
  const isOpen = body.classList.contains('open');
  document.querySelectorAll('.faq-body.open').forEach(b => b.classList.remove('open'));
  document.querySelectorAll('.faq-btn.open').forEach(b => b.classList.remove('open'));
  if (!isOpen) { body.classList.add('open'); btn.classList.add('open'); }
}

/* ===== Script Modal ===== */
function openScriptDetail(type) {
  const modal = document.getElementById('scriptDetailModal');
  if (!modal) return;
  modal.style.display = 'block';
  modal.style.visibility = 'visible';
  modal.style.transform = 'translateX(100%)';
  document.body.style.overflow = 'hidden';
  void modal.offsetHeight;
  modal.style.transform = 'translateX(0)';
  modal.scrollTop = 0;
}

function closeScriptDetail() {
  const modal = document.getElementById('scriptDetailModal');
  if (!modal) return;
  modal.style.transform = 'translateX(100%)';
  setTimeout(() => {
    modal.style.visibility = 'hidden';
    modal.style.display = '';
    document.body.style.overflow = '';
  }, 350);
}

const priceMap = {
  '6K':  { rp: 6000,  total: 6000  },
  '12K': { rp: 12000, total: 12000 },
  '20K': { rp: 20000, total: 20000 },
  '29K': { rp: 29000, total: 29000 },
};

function openOrder(name, price, duration) {
  _doOpenOrder(name, price, duration);
}

function _doOpenOrder(name, price, duration) {
  const $ = id => document.getElementById(id);
  const p = priceMap[price] || { rp: 0, total: 0 };
  const formatted = 'Rp ' + p.total.toLocaleString('id');

  if ($('orderHargaBesar')) $('orderHargaBesar').textContent = formatted;

  const modal = $('orderModal');
  if (!modal) return;
  modal.dataset.pkg      = name;
  modal.dataset.price    = price;
  modal.dataset.duration = duration;
  modal.dataset.total    = p.total;

  modal.style.display = 'block';
  modal.style.visibility = 'visible';
  modal.style.transform = 'translateX(100%)';
  document.body.style.overflow = 'hidden';
  void modal.offsetHeight;
  modal.style.transform = 'translateX(0)';
  modal.scrollTop = 0;
}

function closeOrder() {
  const modal = document.getElementById('orderModal');
  if (!modal) return;
  modal.style.transform = 'translateX(100%)';
  setTimeout(() => {
    modal.style.visibility = 'hidden';
    modal.style.display = '';
    document.body.style.overflow = '';
  }, 350);
}

function handleBeli() {
  const modal = document.getElementById('orderModal');
  const duration = (modal && modal.dataset.duration) || '15 hari';
  const msg = 'hai aku ingin pesan paket sewabot ' + duration;
  const waHref = 'https://wa.me/6289674097203?text=' + encodeURIComponent(msg);
  window.open(waHref, '_blank');
}

function openScriptOrder(nama, harga) {
  const modal = document.getElementById('scriptOrderModal');
  if (!modal) return;
  modal.style.display = 'block';
  modal.style.visibility = 'visible';
  modal.style.transform = 'translateX(100%)';
  document.body.style.overflow = 'hidden';
  void modal.offsetHeight;
  modal.style.transform = 'translateX(0)';
  modal.scrollTop = 0;
}

function closeScriptOrder() {
  const modal = document.getElementById('scriptOrderModal');
  if (!modal) return;
  modal.style.transform = 'translateX(100%)';
  setTimeout(() => {
    modal.style.visibility = 'hidden';
    modal.style.display = '';
    document.body.style.overflow = '';
  }, 350);
}

function handleScriptBeli() {
  const msg = 'halo min saya tertarik dengan premium shina-ai';
  window.open('https://wa.me/6285748415936?text=' + encodeURIComponent(msg), '_blank');
  closeScriptOrder();
}

function closeDetailThenOrder() {
  closeScriptDetail();
  setTimeout(() => openScriptOrder('Premium', 0), 360);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeScriptOrder();
    closeScriptDetail();
    closeOrder();
  }
});

/* ===== SCRIPT BOT DETAIL ===== */
function openScriptBotDetail() {
  const modal = document.getElementById('scriptBotDetailModal');
  if (!modal) return;
  modal.style.display = 'block';
  modal.style.visibility = 'visible';
  modal.style.transform = 'translateX(100%)';
  document.body.style.overflow = 'hidden';
  void modal.offsetHeight;
  modal.style.transform = 'translateX(0)';
  modal.scrollTop = 0;
}

function closeScriptBotDetail() {
  const modal = document.getElementById('scriptBotDetailModal');
  if (!modal) return;
  modal.style.transform = 'translateX(100%)';
  setTimeout(() => {
    modal.style.visibility = 'hidden';
    modal.style.display = '';
    document.body.style.overflow = '';
  }, 350);
}

function filterPricing(tab) {
  ['group','script','scriptbot'].forEach(t => {
    const el = document.getElementById('pricing-' + t);
    const btn = document.getElementById('tab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    if (btn) btn.classList.toggle('active-tab', t === tab);
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeScriptBotDetail();
});

/* ===== BANNER SLIDER NEUBRUTALISM ===== */
(function() {
  let nbCurrent = 0;
  const total = 3;
  let nbTimer;
  let startX = 0;
  let isDragging = false;

  function nbGoTo(idx) {
    nbCurrent = (idx + total) % total;
    const track = document.getElementById('nbTrack');
    if (!track) return;
    track.style.transform = `translateX(-${nbCurrent * 100}%)`;
    document.querySelectorAll('.nb-dot').forEach((d, i) => {
      d.classList.toggle('active', i === nbCurrent);
    });
  }

  function nbNext() { nbGoTo(nbCurrent + 1); }
  function nbPrev() { nbGoTo(nbCurrent - 1); }

  function nbStartAuto() {
    clearInterval(nbTimer);
    nbTimer = setInterval(nbNext, 2000);
  }

  window.nbGoTo = nbGoTo;

  document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('nbTrack');
    if (!track) return;

    // Touch / drag support
    track.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      clearInterval(nbTimer);
    }, { passive: true });

    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? nbNext() : nbPrev();
      nbStartAuto();
    }, { passive: true });

    track.addEventListener('mousedown', e => {
      startX = e.clientX;
      isDragging = true;
      clearInterval(nbTimer);
    });

    document.addEventListener('mouseup', e => {
      if (!isDragging) return;
      isDragging = false;
      const diff = startX - e.clientX;
      if (Math.abs(diff) > 40) diff > 0 ? nbNext() : nbPrev();
      nbStartAuto();
    });

    nbStartAuto();
  });
})();
