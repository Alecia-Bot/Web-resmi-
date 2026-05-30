/* ===== script.js ===== */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('yr').textContent = new Date().getFullYear();

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
function openQ() { document.getElementById('qm').classList.add('on'); document.body.style.overflow = 'hidden'; }
function closeQ() { document.getElementById('qm').classList.remove('on'); document.body.style.overflow = ''; }
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeQ(); closeMenu(); closeAuthGate(); } });

function toggleFaq(btn) {
  const body = btn.nextElementSibling;
  const isOpen = body.classList.contains('open');
  document.querySelectorAll('.faq-body.open').forEach(b => b.classList.remove('open'));
  document.querySelectorAll('.faq-btn.open').forEach(b => b.classList.remove('open'));
  if (!isOpen) { body.classList.add('open'); btn.classList.add('open'); }
}

// Logo text alternating
;(function(){
  const el = document.getElementById('logoName')
  if (!el) return
  const words = ['Astrobot', 'Digital']
  let i = 0
  const CYCLE = 4000
  setInterval(() => {
    setTimeout(() => {
      i = (i + 1) % words.length
      el.textContent = words[i]
    }, CYCLE * 0.5)
  }, CYCLE)
})()

/* ===== Script Modal ===== */
function openScriptModal() { document.getElementById('scriptSaleModal').style.display='block'; document.body.style.overflow='hidden'; }
function closeScriptModal() { document.getElementById('scriptSaleModal').style.display='none'; document.body.style.overflow=''; }

/* ===== AUTH GATE (modal opsional - hanya muncul saat beli) ===== */
// Pending order data saat user belum login
window._pendingOrder = null;

function openAuthGate(pendingOrderData) {
  if (pendingOrderData) window._pendingOrder = pendingOrderData;
  const gate = document.getElementById('authGate');
  gate.style.display = 'flex';
  gate.classList.add('visible');
  document.body.style.overflow = 'hidden';
  // Reset to login screen
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

// Dipanggil dari auth.js saat login berhasil
function onLoginSuccess(user) {
  closeAuthGate();
  // Update panel user info
  updatePanelUser(user);
  // Jika ada pending order, langsung buka
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
    return;
  }
  // Show user info in panel
  const panelInfo = document.getElementById('panelUserInfo');
  panelInfo.style.display = 'flex';
  document.getElementById('panelNoUser').style.display = 'none';
  document.getElementById('panelLogoutWrap').style.display = 'block';
  document.getElementById('panelLoginWrap').style.display = 'none';

  // Name
  const displayName = user.displayName || user.username || 'User';
  document.getElementById('panelUserName').textContent = displayName;
  document.getElementById('panelUserEmail').textContent = user.email || '';

  // Avatar
  const av = document.getElementById('panelUserAv');
  if (user.photoURL) {
    av.innerHTML = `<img src="${user.photoURL}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" referrerpolicy="no-referrer">`;
  } else {
    av.textContent = displayName.charAt(0).toUpperCase();
  }
}

function doLogout() {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().signOut().then(() => {
      updatePanelUser(null);
    });
  }
}

/* ===== ORDER MODAL ===== */
const priceMap = {
  '5K':  { rp: 5000,  total: 5000  },
  '10K': { rp: 10000, total: 10000 },
  '18K': { rp: 18000, total: 18000 },
  '25K': { rp: 25000, total: 25000 },
};

// openOrder: cek login dulu
function openOrder(name, price, duration) {
  // Cek apakah user sudah login via Firebase
  const user = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
  if (!user) {
    // Simpan pending order, tampilkan login modal
    openAuthGate({ name, price, duration });
    return;
  }
  _doOpenOrder(name, price, duration);
}

function _doOpenOrder(name, price, duration) {
  document.getElementById('orderTitle').textContent = name;
  document.getElementById('orderDuration').textContent = duration;

  const p = priceMap[price] || { rp: 0, total: 0 };
  document.getElementById('orderTotal').textContent = 'Rp ' + p.total.toLocaleString('id');

  document.getElementById('orderModal').dataset.pkg = name;
  document.getElementById('orderModal').dataset.price = price;
  document.getElementById('orderModal').dataset.duration = duration;
  document.getElementById('orderModal').dataset.total = p.total;

  document.getElementById('orderNama').value = '';
  document.getElementById('orderNomor').value = '';
  document.getElementById('orderLink').value = '';

  document.getElementById('orderModal').style.display = 'block';
  document.body.style.overflow = 'hidden';
  document.getElementById('orderModal').scrollTop = 0;
}

function closeOrder() {
  document.getElementById('orderModal').style.display = 'none';
  document.body.style.overflow = '';
}

function buildOrderWa() {
  const nama   = document.getElementById('orderNama').value.trim();
  const nomor  = document.getElementById('orderNomor').value.trim();
  const link   = document.getElementById('orderLink').value.trim();
  const modal  = document.getElementById('orderModal');
  const pkg    = modal.dataset.pkg;
  const total  = parseInt(modal.dataset.total).toLocaleString('id');

  if (!nama || !nomor || !link) {
    alert('Mohon lengkapi semua data pesanan terlebih dahulu!');
    return false;
  }

  const msg = `Halo min, saya ingin melakukan pembelian:\n\n` +
    `📦 *Paket:* ${pkg}\n` +
    `👤 *Nama:* ${nama}\n` +
    `📱 *Nomor WA:* ${nomor}\n` +
    `🔗 *Link Grup:* ${link}\n` +
    `💰 *Total:* Rp ${total}\n\n` +
    `Mohon diproses ya min, terima kasih! 🙏`;

  document.getElementById('orderWaBtn').href =
    'https://wa.me/6289674097203?text=' + encodeURIComponent(msg);

  return true;
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeOrder();
});
