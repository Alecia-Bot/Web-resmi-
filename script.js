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
