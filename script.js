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
function openScriptModal() { document.getElementById('scriptSaleModal').style.display='block'; document.body.style.overflow='hidden'; }
function closeScriptModal() { document.getElementById('scriptSaleModal').style.display='none'; document.body.style.overflow=''; }

/* ===== AUTH GATE ===== */
window._pendingOrder = null;

function openAuthGate(pendingOrderData) {
  if (pendingOrderData) window._pendingOrder = pendingOrderData;
  const gate = document.getElementById('authGate');
  gate.style.display = 'flex';
  gate.classList.add('visible');
  document.body.style.overflow = 'hidden';
  document.getElementById('loginScreen').classList.add('active');
  document.getElementById('usernameScreen').classList.remove('active');
  document.getElementById('loadingScreen').style.display = 'none';
}

function closeAuthGate() {
  const gate = document.getElementById('authGate');
  gate.style.display = 'none';
  gate.classList.remove('visible');
  document.body.style.overflow = '';
}

function onLoginSuccess(user) {
  closeAuthGate();
  updatePanelUser(user);
  if (window._pendingOrder) {
    const p = window._pendingOrder;
    window._pendingOrder = null;
    _doOpenOrder(p.name, p.price, p.duration);
  }
}

function updatePanelUser(user) {
  if (!user) {
    document.getElementById('panelUserInfo').style.display = 'none';
    document.getElementById('panelNoUser').style.display = 'block';
    document.getElementById('panelLogoutWrap').style.display = 'none';
    document.getElementById('panelLoginWrap').style.display = 'block';
    const heroBtn = document.getElementById('historyHeroBtn');
    const navBtn  = document.getElementById('panelHistoryBtn');
    if (heroBtn) heroBtn.style.display = 'flex';
    if (navBtn)  navBtn.style.display = 'block';
    return;
  }
  const panelInfo = document.getElementById('panelUserInfo');
  panelInfo.style.display = 'flex';
  document.getElementById('panelNoUser').style.display = 'none';
  document.getElementById('panelLogoutWrap').style.display = 'block';
  document.getElementById('panelLoginWrap').style.display = 'none';

  const displayName = user.displayName || user.username || 'User';
  document.getElementById('panelUserName').textContent = displayName;
  document.getElementById('panelUserEmail').textContent = user.email || '';

  const av = document.getElementById('panelUserAv');
  if (user.photoURL) {
    av.innerHTML = `<img src="${user.photoURL}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" referrerpolicy="no-referrer">`;
  } else {
    av.textContent = displayName.charAt(0).toUpperCase();
  }

  setTimeout(_updateHistoryBadge, 100);
}

function doLogout() {
  if (!confirm('Yakin mau keluar dari Astrobot?')) return;
  localStorage.removeItem('astrobot_session');
  location.reload();
}

/* ===== ORDER MODAL ===== */
const priceMap = {
  '5K':  { rp: 5000,  total: 5000  },
  '10K': { rp: 10000, total: 10000 },
  '15K': { rp: 15000, total: 15000 },
  '20K': { rp: 20000, total: 20000 },
};

function openOrder(name, price, duration) {
  _doOpenOrder(name, price, duration);
}

function _doOpenOrder(name, price, duration) {
  const $ = id => document.getElementById(id);
  const p = priceMap[price] || { rp: 0, total: 0 };
  const formatted = 'Rp ' + p.total.toLocaleString('id');

  if ($('orderHargaBesar'))    $('orderHargaBesar').textContent    = formatted;
  if ($('orderHargaRingkas'))  $('orderHargaRingkas').textContent  = formatted;
  if ($('orderTotal'))         $('orderTotal').textContent         = formatted;

  const modal = $('orderModal');
  modal.dataset.pkg      = name;
  modal.dataset.price    = price;
  modal.dataset.duration = duration;
  modal.dataset.total    = p.total;

  if ($('orderNama'))    $('orderNama').value    = '';
  if ($('orderNomor'))   $('orderNomor').value   = '';
  if ($('orderLink'))    $('orderLink').value    = '';
  if ($('orderCatatan')) $('orderCatatan').value = '';

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
  modal.style.transform = 'translateX(100%)';
  setTimeout(() => {
    modal.style.visibility = 'hidden';
    modal.style.display = '';
    document.body.style.overflow = '';
  }, 350);
}

function handleBeli() {
  // Get duration from modal
  const modal = document.getElementById('orderModal');
  const duration = modal.dataset.duration || '15 hari';
  const msg = 'hai aku ingin pesan paket sewabot ' + duration;
  const waHref = 'https://wa.me/6285748415936?text=' + encodeURIComponent(msg);
  window.open(waHref, '_blank');
}


/* ===== PRICING FILTER TABS ===== */
function filterPricing(tab) {
  ['group','script'].forEach(t => {
    const el = document.getElementById('pricing-' + t);
    const btn = document.getElementById('tab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    if (btn) {
      btn.classList.toggle('active-tab', t === tab);
    }
  });
}

/* ===== SCRIPT BOT FUNCTIONS ===== */
function openScriptModal() { document.getElementById('scriptSaleModal').style.display='block'; document.body.style.overflow='hidden'; }
function closeScriptModal() { document.getElementById('scriptSaleModal').style.display='none'; document.body.style.overflow=''; }

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
