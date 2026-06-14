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
    // Sembunyikan tombol history saat logout
    const heroBtn = document.getElementById('historyHeroBtn');
    const navBtn  = document.getElementById('panelHistoryBtn');
    if (heroBtn) heroBtn.style.display = 'none';
    if (navBtn)  navBtn.style.display = 'none';
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

  // Tampilkan history badge otomatis setelah login
  setTimeout(_updateHistoryBadge, 100);
}

function doLogout() {
  if (!confirm('Yakin mau keluar dari Astrobot?')) return;
  localStorage.removeItem('astrobot_session');
  location.reload();
}

/* ===== ORDER MODAL ===== */
const priceMap = {
  '6K':  { rp: 6000,  total: 6000  },
  '12K': { rp: 12000, total: 12000 },
  '20K': { rp: 20000, total: 20000 },
  '29K': { rp: 29000, total: 29000 },
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
  modal.style.visibility = 'visible';
  modal.style.transform = 'translateX(100%)';
  document.body.style.overflow = 'hidden';
  // force reflow then animate
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
  const nama  = document.getElementById('orderNama').value.trim();
  const nomor = document.getElementById('orderNomor').value.trim();
  const link  = document.getElementById('orderLink').value.trim();

  if (!nama || !nomor || !link) {
    alert('Mohon lengkapi nama, nomor WhatsApp, dan link grup!');
    return;
  }

  // Cek login
  const session = (function(){ try { return JSON.parse(localStorage.getItem('astrobot_session') || 'null'); } catch { return null; } })();
  if (!session || !session.uid) {
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
  const url = `https://qris.zakki.store/topup?token=${QRIS_TOKEN}&nominal=${nominal}&id_user=${userId}`;

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
    // Simpan ke history sebagai PENDING saat QRIS dibuat
    _savePendingToHistory(d);

    // Isi nominal
    document.getElementById('qrisNominalAsli').textContent =
      'Rp ' + d.rincian.nominal_request.toLocaleString('id');
    document.getElementById('qrisTotalBayar').textContent =
      'Rp ' + d.rincian.total_bayar.toLocaleString('id');
    document.getElementById('qrisKodeUnik').textContent = '+' + d.rincian.kode_unik;
    document.getElementById('qrisIdTrx').textContent = d.id_transaksi;

    // Isi data pembelian
    const info = window._qrisOrderInfo;
    const setPaket = document.getElementById('qrisPaket');
    const setNama  = document.getElementById('qrisNamaPembeli');
    const setNomor = document.getElementById('qrisNomorPembeli');
    const setLink  = document.getElementById('qrisLinkPembeli');
    if (setPaket) setPaket.textContent = info.pkg || '-';
    if (setNama)  setNama.textContent  = info.nama || '-';
    if (setNomor) setNomor.textContent = info.nomor || '-';
    if (setLink)  setLink.textContent  = info.link || '-';

    // Render QR dari qris_content (tidak bergantung pixhost)
    const canvasWrap = document.getElementById('qrisCanvasWrap');
    canvasWrap.innerHTML = '';
    canvasWrap.style.display = 'block';
    document.getElementById('qrisImgLoader').style.display = 'none';

    new QRCode(canvasWrap, {
      text: d.qris_content,
      width: 240,
      height: 240,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });

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

// Polling state
window._pollingActive = false;

async function cekStatusQris() {
  if (!window._qrisData) return;
  if (window._pollingActive) return; // Sudah polling, jangan dobel

  // Nonaktifkan tombol selama polling
  const btn = document.getElementById('btnCekStatus');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<svg style="animation:spin .8s linear infinite;width:18px;height:18px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Menunggu...';
  }

  // Tampil overlay loading — tetap muncul sampai SUCCESS
  const overlay = document.getElementById('qrisStatusOverlay');
  overlay.style.display = 'flex';
  _showStatusState('checking');

  window._pollingActive = true;
  _pollStatus();
}

async function _pollStatus() {
  if (!window._pollingActive || !window._qrisData) return;

  const idTrx = window._qrisData.id_transaksi;
  const url   = `https://qris.zakki.store/cektopup?idtopup=${idTrx}`;

  // Update teks loading tiap poll
  const loadingTxt = document.getElementById('statusLoadingTxt');
  const dots = ['Menunggu konfirmasi.', 'Menunggu konfirmasi..', 'Menunggu konfirmasi...'];
  let dotIdx = 0;
  const dotTimer = setInterval(() => {
    if (loadingTxt) loadingTxt.textContent = dots[dotIdx % 3];
    dotIdx++;
  }, 600);

  try {
    const res  = await fetch(url);
    const data = await res.json();

    clearInterval(dotTimer);

    if (data.status === 'found' && data.kategori_status === 'SUCCESS') {
      // ✅ SUKSES — update history jadi sukses, buka WA, tampil success card
      window._pollingActive = false;
      _updateHistoryStatus(window._qrisData?.id_transaksi, 'sukses');
      // Simpan pesanan ke localStorage owner
      _saveOrderToOwner();
      // Kirim notif Fonnte ke owner & pembeli
      _sendFonnteNotif(window._qrisOrderInfo || {}, window._qrisData || {});
      const waHref = _buildSuccessWaLink();
      const waLink = document.getElementById('successWaLink');
      if (waLink) waLink.href = waHref;
      clearInterval(window._qrisTimer);
      _showStatusState('success');
      // Reset tombol
      const btn = document.getElementById('btnCekStatus');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-search"></i> Cek Status Pembayaran'; }
      // Buka WA otomatis setelah 800ms
      setTimeout(() => window.open(waHref, '_blank'), 800);

    } else {
      // Masih PENDING — poll lagi 3 detik kemudian, overlay tetap tampil
      if (window._pollingActive) {
        setTimeout(_pollStatus, 3000);
      }
    }

  } catch (err) {
    clearInterval(dotTimer);
    // Network error — coba lagi 5 detik kemudian
    if (window._pollingActive) {
      if (loadingTxt) loadingTxt.textContent = 'Koneksi terputus, mencoba lagi...';
      setTimeout(_pollStatus, 5000);
    }
  }
}

function stopPolling() {
  window._pollingActive = false;
  const overlay = document.getElementById('qrisStatusOverlay');
  if (overlay) overlay.style.display = 'none';
  const btn = document.getElementById('btnCekStatus');
  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-search"></i> Cek Status Pembayaran'; }
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
  window._pollingActive = false;
  document.getElementById('qrisStatusOverlay').style.display = 'none';
  const btn = document.getElementById('btnCekStatus');
  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-search"></i> Cek Status Pembayaran'; }
}

function onPaymentSuccess() {
  _saveToHistory();
  const el = document.getElementById('successWaLink');
  if (el) window.open(el.href, '_blank');
}

function _buildSuccessWaLink() {
  const info  = window._qrisOrderInfo || {};
  const d     = window._qrisData || {};
  const total = d.rincian ? d.rincian.total_bayar.toLocaleString('id') : '';
  const idTrx = d.id_transaksi || '-';

  const msg =
    `Saya sudah melakukan pembayaran mohon untuk segera diproses min\n\n` +
    `Paket: ${info.pkg || '-'}\n` +
    `Nama: ${info.nama || '-'}\n` +
    `Nomor WA: ${info.nomor || '-'}\n` +
    `Link Grup: ${info.link || '-'}\n` +
    `Total Dibayar: Rp ${total}\n` +
    `ID Transaksi: ${idTrx}`;

  return 'https://wa.me/' + OWNER_WA + '?text=' + encodeURIComponent(msg);
}


// ===== FONNTE NOTIF =====
async function _sendFonnteNotif(info, d) {
  const FONNTE_TOKEN = '6RLKFXtLjqfYpDCz9RPU';
  const total = d.rincian ? d.rincian.total_bayar.toLocaleString('id') : '0';
  const idTrx = d.id_transaksi || '-';
  const waktu = new Date().toLocaleString('id-ID', {
    day:'2-digit', month:'2-digit', year:'numeric',
    hour:'2-digit', minute:'2-digit'
  });

  const msg =
    `*Transaksi Berhasil*\n\n` +
    `> Paket: ${info.pkg || '-'}\n` +
    `> Nama: ${info.nama || '-'}\n` +
    `> Nomor WA: ${info.nomor || '-'}\n` +
    `> Total Dibayar: Rp ${total}\n` +
    `> ID Transaksi: ${idTrx}\n` +
    `> Waktu: ${waktu}\n\n` +
    `> Terima kasih telah bertransaksi`;

  try {
    // Kirim ke pembeli
    await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { 'Authorization': FONNTE_TOKEN },
      body: new URLSearchParams({
        target: info.nomor,
        message: msg,
        countryCode: '62'
      })
    });

    // Kirim ke owner
    await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { 'Authorization': FONNTE_TOKEN },
      body: new URLSearchParams({
        target: OWNER_WA,
        message: msg,
        countryCode: '62'
      })
    });

    // Kirim ke Channel WhatsApp
    await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { 'Authorization': FONNTE_TOKEN },
      body: new URLSearchParams({
        target: '120363420910613920@newsletter',
        message: msg,
        sender: '6289674097203'
      })
    });
  } catch (e) {
    console.error('Fonnte error:', e);
  }
}

// ===== HISTORY =====
const HISTORY_KEY = 'astrobot_history';

function _savePendingToHistory(d) {
  const info  = window._qrisOrderInfo || {};
  const idTrx = d?.id_transaksi || ('TRX-' + Date.now());
  const waMsg =
    `Saya sudah melakukan pembayaran mohon untuk segera diproses min\n\n` +
    `Paket: ${info.pkg || '-'}\n` +
    `Nama: ${info.nama || '-'}\n` +
    `Nomor WA: ${info.nomor || '-'}\n` +
    `Link Grup: ${info.link || '-'}\n` +
    `Total Dibayar: Rp ${d?.rincian?.total_bayar?.toLocaleString('id') || info.total || '-'}\n` +
    `ID Transaksi: ${idTrx}`;

  // Cek kalau ID transaksi sudah ada, jangan duplikat
  let list = _getHistory();
  if (list.some(e => e.id === idTrx)) return;

  const entry = {
    id:     idTrx,
    pkg:    info.pkg   || '-',
    nama:   info.nama  || '-',
    nomor:  info.nomor || '-',
    link:   info.link  || '-',
    total:  d?.rincian?.total_bayar || info.total || 0,
    waktu:  new Date().toISOString(),
    status: 'pending', // ← PENDING dulu
    waMsg
  };

  list.unshift(entry);
  if (list.length > 50) list = list.slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  _updateHistoryBadge();
}

function _updateHistoryStatus(idTrx, status) {
  if (!idTrx) return;
  let list = _getHistory();
  const idx = list.findIndex(e => e.id === idTrx);
  if (idx !== -1) {
    list[idx].status = status;
    list[idx].waktuSukses = status === 'sukses' ? new Date().toISOString() : null;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    _updateHistoryBadge();
  }
}

function _saveToHistory() {
  const info  = window._qrisOrderInfo || {};
  const d     = window._qrisData || {};
  const total = d.rincian ? d.rincian.total_bayar.toLocaleString('id') : '';
  const idTrx = d.id_transaksi || '-';

  // Simpan teks WA lengkap biar bisa kirim ulang kapan aja
  const waMsg =
    `Saya sudah melakukan pembayaran mohon untuk segera diproses min\n\n` +
    `Paket: ${info.pkg || '-'}\n` +
    `Nama: ${info.nama || '-'}\n` +
    `Nomor WA: ${info.nomor || '-'}\n` +
    `Link Grup: ${info.link || '-'}\n` +
    `Total Dibayar: Rp ${total}\n` +
    `ID Transaksi: ${idTrx}`;

  const entry = {
    id:     idTrx,
    pkg:    info.pkg || '-',
    nama:   info.nama || '-',
    nomor:  info.nomor || '-',
    link:   info.link || '-',
    total:  d.rincian ? d.rincian.total_bayar : 0,
    waktu:  new Date().toISOString(),
    waMsg:  waMsg   // <-- teks lengkap tersimpan
  };

  let list = _getHistory();
  list.unshift(entry);
  if (list.length > 50) list = list.slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  _updateHistoryBadge();
}

function _getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}

function _updateHistoryBadge() {
  const list    = _getHistory();
  const heroBtn = document.getElementById('historyHeroBtn');
  const badge   = document.getElementById('historyBadge');
  const navBtn  = document.getElementById('panelHistoryBtn');
  const navBadge= document.getElementById('historyNavBadge');
  const count   = list.length;
  const label   = count > 9 ? '9+' : count;
  const loggedIn = !!(function(){ try { return JSON.parse(localStorage.getItem('astrobot_session') || 'null'); } catch { return null; } })();

  // Selalu tampilkan tombol history di hero
  if (heroBtn) heroBtn.style.display = 'flex';

  if (count > 0) {
    if (badge)    { badge.style.display = 'flex'; badge.textContent = label; }
    if (navBtn)   { navBtn.style.display = 'flex'; }
    if (navBadge) { navBadge.textContent = label; }
  } else {
    if (badge)   badge.style.display = 'none';
    if (navBtn)  navBtn.style.display = 'none';
  }
}

function openOwnerDashboard() {
  const page = document.getElementById('ownerDashboard');
  if (!page) return;
  page.style.display = 'block';
  document.body.style.overflow = 'hidden';
  loadOwnerOrders();
}

function closeHistoryPage() {
  closeOwnerDashboard();
}

function clearHistory() {
  if (!confirm('Hapus semua riwayat pembelian?')) return;
  localStorage.removeItem(HISTORY_KEY);
  _updateHistoryBadge();
  _renderHistory();
}

function _renderHistory() {
  const list    = _getHistory();
  const listEl  = document.getElementById('historyList');
  const emptyEl = document.getElementById('historyEmpty');
  if (!listEl) return;

  if (list.length === 0) {
    listEl.innerHTML = '';
    emptyEl.style.display = 'flex';
    return;
  }
  emptyEl.style.display = 'none';

  listEl.innerHTML = list.slice().reverse().map((e, i) => {
    const realIdx = list.length - 1 - i;
    const tgl    = new Date(e.waktu);
    const tglStr = tgl.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
    const jamStr = tgl.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });
    const waUrl  = 'https://wa.me/' + OWNER_WA + '?text=' + encodeURIComponent(e.waMsg || '');
    const delay  = i * 0.06;

    return `
    <div class="hist-card hist-card-anim" style="animation-delay:${delay}s;">
      <!-- Header kartu -->
      <div style="padding:12px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #111111;">
        <div class="hist-status-badge" style="${e.status === 'pending' ? 'background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.2);' : ''}">
          <span class="hist-dot" style="${e.status === 'pending' ? 'background:#eab308;box-shadow:0 0 0 3px rgba(234,179,8,0.15);animation:none;' : ''}"></span>
          <span style="font-size:.65rem;font-weight:800;color:${e.status === 'pending' ? '#eab308' : '#22c55e'};letter-spacing:.04em;">${e.status === 'pending' ? 'PENDING' : 'SUKSES'}</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:1px;">
          <span style="font-size:.68rem;color:#3a3a3a;font-weight:600;">${tglStr}</span>
          <span style="font-size:.64rem;color:#2a2a2a;">${jamStr}</span>
        </div>
      </div>

      <!-- Body kartu -->
      <div style="padding:14px;display:flex;flex-direction:column;gap:12px;">

        <!-- Nama paket & harga -->
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">
          <div style="flex:1;min-width:0;">
            <div style="font-size:.92rem;font-weight:800;color:#fff;line-height:1.3;">${e.pkg}</div>
            <div style="font-size:.68rem;color:#333;margin-top:3px;font-weight:600;">Transaksi #${list.length - i}</div>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <div style="font-size:.95rem;font-weight:900;color:#22c55e;">Rp ${(e.total || 0).toLocaleString('id')}</div>
            <div style="font-size:.62rem;color:#2a2a2a;margin-top:2px;">Total dibayar</div>
          </div>
        </div>

        <!-- Divider -->
        <div style="border-top:1px solid #111;"></div>

        <!-- Info pembeli -->
        <div style="display:flex;flex-direction:column;gap:7px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:.68rem;color:#3a3a3a;font-weight:700;">Nama</span>
            <span style="font-size:.75rem;color:#ccc;font-weight:700;">${e.nama || '-'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:.68rem;color:#3a3a3a;font-weight:700;">No. WhatsApp</span>
            <span style="font-size:.75rem;color:#ccc;font-weight:700;">${e.nomor || '-'}</span>
          </div>
          ${e.link ? `<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
            <span style="font-size:.68rem;color:#3a3a3a;font-weight:700;flex-shrink:0;">Link/ID</span>
            <span style="font-size:.72rem;color:#aaa;font-weight:600;text-align:right;word-break:break-all;">${e.link}</span>
          </div>` : ''}
        </div>

        <!-- Tombol aksi: PENDING blokir & arahkan bayar, SUKSES buka WA -->
        ${e.status === 'pending'
          ? `<button onclick="_histPendingAction('${e.pkg}', ${e.total})" class="hist-wa-btn" style="background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.25);cursor:pointer;width:100%;font-family:inherit;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style="font-size:.8rem;font-weight:800;color:#eab308;">Selesaikan Pembayaran</span>
            </button>`
          : `<a href="${waUrl}" target="_blank" class="hist-wa-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              <span style="font-size:.8rem;font-weight:800;color:#22c55e;">Kirim Ulang ke Admin</span>
            </a>`
        }
      </div>
    </div>`;
  }).join('');
}

// Dipanggil saat user pencet tombol di history PENDING
function _histPendingAction(pkg, total) {
  // Cari price key dari total
  const priceKey = Object.keys(priceMap).find(k => priceMap[k].total === total);

  // Tampilkan toast / notif dulu
  _showHistToast(
    `⚠️ Selesaikan transaksi terlebih dahulu`,
    `Kamu masih punya pesanan <b>${pkg}</b> yang belum dibayar.`,
    () => {
      // Setelah toast ditutup → tutup history → buka order modal langsung
      closeHistoryPage();
      if (priceKey) {
        // Cari durasi dari nama paket
        const durMap = {
          '6K': '15 hari', '12K': '30 hari',
          '20K': '60 hari', '29K': '365 hari'
        };
        setTimeout(() => {
          openOrder(pkg, priceKey, durMap[priceKey] || '');
        }, 400);
      }
    }
  );
}

// Toast notifikasi history
function _showHistToast(title, msg, onClose) {
  // Hapus toast lama kalau ada
  const old = document.getElementById('histToast');
  if (old) old.remove();

  const el = document.createElement('div');
  el.id = 'histToast';
  el.style.cssText = `
    position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);
    z-index:99999;background:#1a1a1a;border:1px solid rgba(234,179,8,0.3);
    border-radius:14px;padding:14px 18px;max-width:320px;width:90%;
    box-shadow:0 8px 32px rgba(0,0,0,0.6);opacity:0;
    transition:opacity .25s,transform .25s;text-align:center;
  `;
  el.innerHTML = `
    <div style="font-size:.85rem;font-weight:800;color:#eab308;margin-bottom:5px;">${title}</div>
    <div style="font-size:.78rem;color:#888;line-height:1.5;margin-bottom:12px;">${msg}</div>
    <button onclick="document.getElementById('histToast').remove();${onClose ? '('+onClose.toString()+')()' : ''}"
      style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border:none;color:#fff;
      padding:8px 20px;border-radius:8px;font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit;">
      Bayar Sekarang
    </button>
  `;
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
  });
  // Auto close 8 detik
  setTimeout(() => { if (el.parentNode) { el.style.opacity='0'; setTimeout(()=>el.remove(),300); } }, 8000);
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

/* ===== OWNER DASHBOARD ===== */
const OWNER_EMAIL_CONST = 'tika13593@gmail.com';

// Simpan pesanan ke localStorage saat payment SUCCESS
const OWNER_ORDERS_KEY = 'astrobot_owner_orders';

function _saveOrderToOwner() {
  try {
    const info  = window._qrisOrderInfo || {};
    const d     = window._qrisData || {};
    const idTrx = d.id_transaksi || ('manual-' + Date.now());
    const total  = d.rincian ? d.rincian.total_bayar : (info.total || 0);

    // Ambil info buyer dari session localStorage
    let buyerEmail = 'guest', buyerName = 'guest';
    try {
      const sess = JSON.parse(localStorage.getItem('astrobot_session') || 'null');
      if (sess) { buyerEmail = sess.email || 'guest'; buyerName = sess.name || 'guest'; }
    } catch(e) {}

    const order = {
      id:          idTrx,
      pkg:         info.pkg   || '-',
      nama:        info.nama  || '-',
      nomor:       info.nomor || '-',
      link:        info.link  || '-',
      total:       total,
      status:      'PENDING',
      buyerEmail:  buyerEmail,
      buyerName:   buyerName,
      createdAt:   new Date().toISOString()
    };

    let orders = _getOwnerOrders();
    // Cegah duplikat ID
    if (!orders.some(o => o.id === idTrx)) {
      orders.unshift(order);
      if (orders.length > 200) orders = orders.slice(0, 200);
      localStorage.setItem(OWNER_ORDERS_KEY, JSON.stringify(orders));
    }
    // Update badge owner jika sedang login sebagai owner
    _refreshOwnerBadge();
    console.log('✅ Pesanan tersimpan ke owner dashboard (localStorage)');
  } catch (e) {
    console.warn('Gagal simpan pesanan ke owner:', e);
  }
}

function _getOwnerOrders() {
  try { return JSON.parse(localStorage.getItem(OWNER_ORDERS_KEY) || '[]'); }
  catch { return []; }
}

function _refreshOwnerBadge() {
  const orders = _getOwnerOrders();
  const pending = orders.filter(o => !o.status || o.status === 'PENDING').length;
  const badge = document.getElementById('ownerOrderBadge');
  if (badge && pending > 0) {
    badge.style.display = 'inline-block';
    badge.textContent = pending;
  }
}

// Buka owner dashboard
function openOwnerDashboard() {
  const el = document.getElementById('ownerDashboard');
  if (!el) return;
  el.style.display = 'block';
  el.scrollTop = 0; // reset ke atas
  // Lock scroll body supaya tidak tembus
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  loadOwnerOrders();
}

function closeOwnerDashboard() {
  const el = document.getElementById('ownerDashboard');
  if (el) el.style.display = 'none';
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
}

// Load semua pesanan dari localStorage
function loadOwnerOrders() {
  const loading = document.getElementById('ownerLoading');
  const list    = document.getElementById('ownerOrdersList');
  const empty   = document.getElementById('ownerEmpty');
  if (!list) return;

  if (loading) loading.style.display = 'block';
  list.innerHTML = '';
  if (empty) empty.style.display = 'none';

  // Cek apakah owner yang login
  let currentEmail = '';
  try {
    const sess = JSON.parse(localStorage.getItem('astrobot_session') || 'null');
    currentEmail = sess ? (sess.email || '') : '';
  } catch(e) {}

  if (currentEmail !== OWNER_EMAIL_CONST) {
    list.innerHTML = '<div style="text-align:center;padding:30px;color:#444;">Akses ditolak</div>';
    if (loading) loading.style.display = 'none';
    return;
  }

  if (loading) loading.style.display = 'none';

  const orders = _getOwnerOrders();

  if (orders.length === 0) {
    if (empty) empty.style.display = 'block';
    _updateOwnerStats([]);
    return;
  }

  _updateOwnerStats(orders);

  list.innerHTML = orders.map((o, idx) => {
    const tgl = o.createdAt ? new Date(o.createdAt).toLocaleString('id-ID') : '-';
    const nomor = (o.nomor || '').replace(/\D/g, '');
    const statusColor = o.status === 'SELESAI' ? '#16a34a' : '#666';
    return `
    <div style="background:#111;border:1px solid #1a1a1a;border-radius:12px;padding:16px;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
        <div style="flex:1;min-width:0;">
          <div style="font-size:.72rem;color:#555;font-family:monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${o.id}</div>
          <div style="font-size:.7rem;color:#444;margin-top:2px;">${tgl}</div>
        </div>
        <div style="padding:3px 10px;border-radius:5px;background:#1e1e1e;border:1px solid #2a2a2a;font-size:.7rem;color:${statusColor};flex-shrink:0;margin-left:8px;">${o.status || 'PENDING'}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px;">
        <div style="display:flex;gap:8px;">
          <span style="font-size:.75rem;color:#555;min-width:60px;">Paket</span>
          <span style="font-size:.82rem;color:#ccc;font-weight:700;">${o.pkg || '-'}</span>
        </div>
        <div style="display:flex;gap:8px;">
          <span style="font-size:.75rem;color:#555;min-width:60px;">Nama</span>
          <span style="font-size:.82rem;color:#ccc;">${o.nama || '-'}</span>
        </div>
        <div style="display:flex;gap:8px;">
          <span style="font-size:.75rem;color:#555;min-width:60px;">WA</span>
          <span style="font-size:.82rem;color:#ccc;">${o.nomor || '-'}</span>
        </div>
        <div style="display:flex;gap:8px;">
          <span style="font-size:.75rem;color:#555;min-width:60px;">Link</span>
          <span style="font-size:.75rem;color:#888;word-break:break-all;">${o.link || '-'}</span>
        </div>
        <div style="display:flex;gap:8px;">
          <span style="font-size:.75rem;color:#555;min-width:60px;">Bayar</span>
          <span style="font-size:.85rem;color:#fff;font-weight:800;">Rp ${(o.total || 0).toLocaleString('id')}</span>
        </div>
        <div style="display:flex;gap:8px;">
          <span style="font-size:.75rem;color:#555;min-width:60px;">Pembeli</span>
          <span style="font-size:.72rem;color:#666;">${o.buyerEmail || '-'}</span>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <a href="https://wa.me/${nomor}?text=${encodeURIComponent('Halo ' + o.nama + ', pesanan kamu sudah kami proses! Bot akan segera dimasukkan ke grup kamu.')}"
           target="_blank"
           style="flex:1;min-width:100px;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;text-decoration:none;color:#ccc;font-size:.78rem;font-weight:700;">
          <i class="fab fa-whatsapp"></i> Chat WA
        </a>
        <button onclick="navigator.clipboard.writeText('${o.link}').then(()=>alert('Link disalin!'))"
           style="flex:1;min-width:100px;padding:9px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;color:#ccc;font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit;">
          <i class="fas fa-copy"></i> Salin Link
        </button>
        <button onclick="_ownerMarkSelesai('${o.id}')"
           style="flex:1;min-width:100px;padding:9px;background:#1a1a1a;border:1px solid ${o.status==='SELESAI'?'#16a34a':'#2a2a2a'};border-radius:8px;color:${o.status==='SELESAI'?'#16a34a':'#666'};font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit;">
          <i class="fas fa-check"></i> ${o.status === 'SELESAI' ? 'Selesai ✓' : 'Tandai Selesai'}
        </button>
      </div>
    </div>`;
  }).join('');
}

// Tandai pesanan sebagai SELESAI
function _ownerMarkSelesai(idTrx) {
  let orders = _getOwnerOrders();
  const idx = orders.findIndex(o => o.id === idTrx);
  if (idx !== -1) {
    orders[idx].status = orders[idx].status === 'SELESAI' ? 'PENDING' : 'SELESAI';
    localStorage.setItem(OWNER_ORDERS_KEY, JSON.stringify(orders));
    loadOwnerOrders(); // refresh tampilan
  }
}

// Hapus semua pesanan (tombol reset opsional)
function _ownerClearOrders() {
  if (!confirm('Hapus semua data pesanan masuk?')) return;
  localStorage.removeItem(OWNER_ORDERS_KEY);
  loadOwnerOrders();
}

function _updateOwnerStats(orders) {
  const pending = orders.filter(o => !o.status || o.status === 'PENDING').length;
  const total   = orders.reduce((s, o) => s + (o.total || 0), 0);
  const el = id => document.getElementById(id);
  if (el('ownerStatTotal'))  el('ownerStatTotal').textContent  = orders.length;
  if (el('ownerStatPending')) el('ownerStatPending').textContent = pending;
  if (el('ownerStatTotal2')) el('ownerStatTotal2').textContent = 'Rp ' + total.toLocaleString('id');
  // Badge di panel nav
  const badge = el('ownerOrderBadge');
  if (badge && pending > 0) {
    badge.style.display = 'inline-block';
    badge.textContent = pending;
  }
}
