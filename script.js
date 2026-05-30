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

// openOrder: langsung buka, login dicek saat pencet Beli
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

  // Slide-in animation
  modal.style.display = 'block';
  modal.style.transform = 'translateX(100%)';
  document.body.style.overflow = 'hidden';
  // force reflow then animate
  modal.offsetHeight;
  modal.style.transform = 'translateX(0)';
  modal.scrollTop = 0;
}

function closeOrder() {
  const modal = document.getElementById('orderModal');
  modal.style.transform = 'translateX(100%)';
  setTimeout(() => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }, 350);
}

function handleBeli() {
  const nama  = document.getElementById('orderNama').value.trim();
  const nomor = document.getElementById('orderNomor').value.trim();
  const link  = document.getElementById('orderLink').value.trim();

  if (!nama || !nomor || !link) {
    alert('Mohon lengkapi nama, nomor WhatsApp, dan link grup!');
    return;
  }

  // Cek login
  const user = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
  if (!user) {
    const modal = document.getElementById('orderModal');
    window._pendingOrder = { name: modal.dataset.pkg, price: modal.dataset.price, duration: modal.dataset.duration };
    openAuthGate(null);
    return;
  }

  // Buka QRIS
  _openQrisPay();
}

// ===== QRIS PAYMENT =====
const QRIS_TOKEN = 'c98176b67fbd56';
const OWNER_WA   = '6289674097203';

window._qrisData = null;
window._qrisTimer = null;

function _openQrisPay() {
  const modal = document.getElementById('orderModal');
  const total = parseInt(modal.dataset.total);
  const pkg   = modal.dataset.pkg;
  const nama  = document.getElementById('orderNama').value.trim();
  const nomor = document.getElementById('orderNomor').value.trim();
  const link  = document.getElementById('orderLink').value.trim();

  window._qrisOrderInfo = { pkg, nama, nomor, link, total };

  // Tampilkan modal
  const payModal = document.getElementById('qrisPayModal');
  payModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    document.getElementById('qrisPayBox').style.transform = 'translateY(0)';
  }, 10);

  // Reset UI
  document.getElementById('qrisImg').style.display = 'none';
  document.getElementById('qrisImgLoader').style.display = 'flex';
  document.getElementById('qrisNominalAsli').textContent = '';
  document.getElementById('qrisTotalBayar').textContent = '';
  document.getElementById('qrisKodeUnik').textContent = '';
  document.getElementById('qrisIdTrx').textContent = '';
  document.getElementById('qrisTimer').textContent = '05:00';
  document.getElementById('qrisTimerBar').style.width = '100%';

  // Hit API buat QRIS
  _createQris(total);
}

async function _createQris(nominal) {
  // Generate user ID unik dari timestamp
  const userId = 'USR' + Date.now().toString(36).toUpperCase();
  const url = `https://qris.zakki.store/create?token=${QRIS_TOKEN}&nominal=${nominal}&id_user=${userId}`;

  try {
    const res  = await fetch(url);
    const data = await res.json();

    if (data.code !== 201 || data.status !== 'success') {
      alert('Gagal membuat QRIS: ' + (data.message || 'Unknown error'));
      closeQrisPay();
      return;
    }

    const d = data.data;
    window._qrisData = d;

    // Isi nominal
    document.getElementById('qrisNominalAsli').textContent =
      'Rp ' + d.rincian.nominal_request.toLocaleString('id');
    document.getElementById('qrisTotalBayar').textContent =
      'Rp ' + d.rincian.total_bayar.toLocaleString('id');
    document.getElementById('qrisKodeUnik').textContent = '+' + d.rincian.kode_unik;
    document.getElementById('qrisIdTrx').textContent = d.id_transaksi;

    // Load gambar QRIS
    const img = document.getElementById('qrisImg');
    img.onload = () => {
      document.getElementById('qrisImgLoader').style.display = 'none';
      img.style.display = 'block';
    };
    img.onerror = () => {
      document.getElementById('qrisImgLoader').innerHTML =
        '<i class="fas fa-exclamation-triangle" style="color:#f97316;font-size:2rem;"></i><span style="color:#f97316;font-size:.8rem;">Gagal load QR</span>';
    };
    img.src = d.qris_image;

    // Mulai timer 5 menit
    _startQrisTimer(300);

  } catch (err) {
    alert('Error koneksi ke server QRIS. Coba lagi.');
    closeQrisPay();
  }
}

function _startQrisTimer(seconds) {
  clearInterval(window._qrisTimer);
  let sisa = seconds;
  const timerEl = document.getElementById('qrisTimer');
  const barEl   = document.getElementById('qrisTimerBar');

  window._qrisTimer = setInterval(() => {
    sisa--;
    const m = String(Math.floor(sisa / 60)).padStart(2, '0');
    const s = String(sisa % 60).padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
    barEl.style.width = (sisa / seconds * 100) + '%';

    // Warna timer merah jika < 60 detik
    timerEl.style.color = sisa < 60 ? '#ef4444' : '#f97316';

    if (sisa <= 0) {
      clearInterval(window._qrisTimer);
      timerEl.textContent = 'EXPIRED';
      timerEl.style.color = '#ef4444';
      document.getElementById('qrisImg').style.opacity = '0.3';
      document.getElementById('btnCekStatus').disabled = true;
    }
  }, 1000);
}

function closeQrisPay() {
  clearInterval(window._qrisTimer);
  const box = document.getElementById('qrisPayBox');
  box.style.transform = 'translateY(100%)';
  setTimeout(() => {
    document.getElementById('qrisPayModal').style.display = 'none';
    document.body.style.overflow = '';
  }, 400);
}

function copyIdTrx() {
  const id = document.getElementById('qrisIdTrx').textContent;
  navigator.clipboard.writeText(id).then(() => {
    const btn = event.currentTarget;
    btn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i>'; }, 1500);
  });
}

async function cekStatusQris() {
  if (!window._qrisData) return;

  const idTrx = window._qrisData.id_transaksi;
  // Ambil kode pendek dari ID (bagian setelah "topup-XXXX-")
  const parts = idTrx.split('-');
  const idShort = parts[1] || idTrx;

  // Tampil overlay checking
  const overlay = document.getElementById('qrisStatusOverlay');
  overlay.style.display = 'flex';
  _showStatusState('checking');

  try {
    const url = `https://qris.zakki.store/cektopup?idtopup=${idShort}`;
    const res  = await fetch(url);
    const data = await res.json();

    if (data.status === 'found' && data.kategori_status === 'SUCCESS') {
      // Sukses!
      _showStatusState('success');
      const d = data.data;
      document.getElementById('statusSuccessMsg').textContent =
        `Pembayaran Rp ${(d.nominal_total || 0).toLocaleString('id')} telah diterima.`;

      if (d.reward && d.reward.message) {
        const rewardBox = document.getElementById('statusRewardBox');
        rewardBox.style.display = 'block';
        document.getElementById('statusRewardMsg').textContent = '🎁 ' + d.reward.message;
      }

      clearInterval(window._qrisTimer);

    } else if (data.kategori_status === 'PENDING' || data.status === 'found') {
      _showStatusState('pending');
    } else {
      _showStatusState('failed');
      document.getElementById('statusFailedMsg').textContent =
        data.message || 'Transaksi tidak ditemukan. Pastikan sudah membayar.';
    }
  } catch (err) {
    _showStatusState('failed');
    document.getElementById('statusFailedMsg').textContent = 'Gagal terhubung ke server. Coba lagi.';
  }
}

function _showStatusState(state) {
  ['statusChecking','statusSuccess','statusPending','statusFailed'].forEach(id => {
    const el = document.getElementById(id);
    el.style.display = 'none';
  });
  const target = document.getElementById('status' + state.charAt(0).toUpperCase() + state.slice(1));
  if (target) target.style.display = 'flex';
}

function closeStatusOverlay() {
  document.getElementById('qrisStatusOverlay').style.display = 'none';
}

function onPaymentSuccess() {
  closeStatusOverlay();
  closeQrisPay();

  // Kirim ke WA owner
  const info = window._qrisOrderInfo || {};
  const d    = window._qrisData || {};
  const total = d.rincian ? d.rincian.total_bayar.toLocaleString('id') : '';
  const idTrx = d.id_transaksi || '-';

  const msg =
    `✅ *PEMBAYARAN BERHASIL*\n\n` +
    `📦 *Paket:* ${info.pkg || '-'}\n` +
    `👤 *Nama:* ${info.nama || '-'}\n` +
    `📱 *Nomor WA:* ${info.nomor || '-'}\n` +
    `🔗 *Link Grup:* ${info.link || '-'}\n` +
    `💰 *Total Dibayar:* Rp ${total}\n` +
    `🧾 *ID Transaksi:* ${idTrx}\n\n` +
    `Mohon segera diproses ya min 🙏`;

  window.open('https://wa.me/' + OWNER_WA + '?text=' + encodeURIComponent(msg), '_blank');
}

async function cancelQris() {
  if (!window._qrisData) { closeQrisPay(); return; }
  const idTrx = window._qrisData.id_transaksi;
  try {
    await fetch(`https://qris.zakki.store/cancel?token=${QRIS_TOKEN}&id_transaksi=${idTrx}`);
  } catch(e) {}
  clearInterval(window._qrisTimer);
  closeQrisPay();
}

/* ===== PRICING FILTER TABS ===== */
function filterPricing(tab) {
  ['group','premium','jadibot'].forEach(t => {
    const el = document.getElementById('pricing-' + t);
    const btn = document.getElementById('tab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    if (btn) {
      btn.classList.toggle('active-tab', t === tab);
    }
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeOrder();
});

