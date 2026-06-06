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
  const infoEl  = document.getElementById('panelUserInfo');
  const noUserEl= document.getElementById('panelNoUser');
  const avEl    = document.getElementById('panelUserAv');
  const nameEl  = document.getElementById('panelUserName');
  const emailEl = document.getElementById('panelUserEmail');
  const loginW  = document.getElementById('panelLoginWrap');
  const logoutW = document.getElementById('panelLogoutWrap');
  const heroBtn = document.getElementById('historyHeroBtn');

  if (user) {
    if (infoEl)  infoEl.style.display  = 'flex';
    if (noUserEl) noUserEl.style.display = 'none';
    if (nameEl)  nameEl.textContent  = user.displayName || user.email || 'User';
    if (emailEl) emailEl.textContent = user.email || '';
    if (avEl) {
      if (user.photoURL) {
        avEl.innerHTML = `<img src="${user.photoURL}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" referrerpolicy="no-referrer">`;
      } else {
        const initials = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
        avEl.textContent = initials;
      }
    }
    if (loginW)  loginW.style.display  = 'none';
    if (logoutW) logoutW.style.display = 'block';
    if (heroBtn) heroBtn.style.display = 'flex';
    _updateHistoryBadge();
  } else {
    if (infoEl)  infoEl.style.display  = 'none';
    if (noUserEl) noUserEl.style.display = 'block';
    if (loginW)  loginW.style.display  = 'block';
    if (logoutW) logoutW.style.display = 'none';
    const heroBtn2 = document.getElementById('historyHeroBtn');
    const histBtn  = document.getElementById('panelHistoryBtn');
    if (heroBtn2) heroBtn2.style.display = 'none';
    if (histBtn)  histBtn.style.display  = 'none';
  }
}

function doLogout() {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().signOut().then(() => { updatePanelUser(null); });
  }
}

/* ===== Order Modal ===== */
function $(id) { return document.getElementById(id); }

function openOrder(name, price, duration) {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    const user = firebase.auth().currentUser;
    if (!user) { openAuthGate({ name, price, duration }); return; }
  }
  _doOpenOrder(name, price, duration);
}

function _doOpenOrder(name, price, duration) {
  const raw = parseInt(price.replace(/[^0-9]/g,'')) * 1000;
  const formatted = 'Rp ' + raw.toLocaleString('id');
  if ($('orderPaket'))      $('orderPaket').textContent      = name;
  if ($('orderDurasi'))     $('orderDurasi').textContent     = duration;
  if ($('orderHargaBesar')) $('orderHargaBesar').textContent = formatted;
  if ($('orderHargaRingkas')) $('orderHargaRingkas').textContent = formatted;
  if ($('orderTotal'))      $('orderTotal').textContent      = formatted;
  window._orderInfo = { name, price, duration, raw };
  const modal = $('orderModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.style.transform = 'translateX(0)';
    document.body.style.overflow = 'hidden';
  }
  if ($('orderNama'))    $('orderNama').value    = '';
  if ($('orderNomor'))   $('orderNomor').value   = '';
  if ($('orderLink'))    $('orderLink').value    = '';
  if ($('orderCatatan')) $('orderCatatan').value = '';
}

function closeOrder() {
  const modal = document.getElementById('orderModal');
  if (modal) {
    modal.style.transform = 'translateX(100%)';
    setTimeout(() => { modal.style.display = 'none'; }, 350);
    document.body.style.overflow = '';
  }
}

function submitOrder() {
  const modal = document.getElementById('orderModal');
  if (!modal) return;
  const nama  = document.getElementById('orderNama').value.trim();
  const nomor = document.getElementById('orderNomor').value.trim();
  const link  = document.getElementById('orderLink').value.trim();
  const catatan = document.getElementById('orderCatatan') ? document.getElementById('orderCatatan').value.trim() : '';
  const info  = window._orderInfo || {};
  if (!nama || !nomor) { alert('Nama dan nomor WA wajib diisi.'); return; }
  window._qrisOrderInfo = { pkg: info.name, nama, nomor, link, catatan, raw: info.raw };
  modal.style.display = 'none';
  openQrisPay(info.raw, info.name);
}

/* ===== QRIS Pay ===== */
const QRIS_TOKEN = 'astrobot';
const OWNER_WA   = '6289674097203';

function openQrisPay(amount, label) {
  const overlay = document.getElementById('qrisPayOverlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  requestAnimationFrame(() => overlay.classList.add('visible'));
  document.body.style.overflow = 'hidden';
  showQrisLoading();
  fetchQris(amount, label);
}

function closeQrisPay() {
  const overlay = document.getElementById('qrisPayOverlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  setTimeout(() => { overlay.style.display = 'none'; }, 300);
  document.body.style.overflow = '';
  stopPolling();
}

function showQrisLoading() {
  const el = document.getElementById('qrisLoadingState');
  const el2 = document.getElementById('qrisReadyState');
  if (el)  el.style.display  = 'flex';
  if (el2) el2.style.display = 'none';
}

async function fetchQris(amount, label) {
  try {
    const url = `https://qris.zakki.store/create?token=${QRIS_TOKEN}&amount=${amount}&label=${encodeURIComponent(label || 'Astrobot')}`;
    const res  = await fetch(url);
    const data = await res.json();
    window._qrisData = data;
    showQrisReady(data, amount);
    startPolling(data.id_transaksi);
  } catch (e) {
    alert('Gagal membuat QRIS. Coba lagi.');
    closeQrisPay();
  }
}

function showQrisReady(data, amount) {
  const loadEl  = document.getElementById('qrisLoadingState');
  const readyEl = document.getElementById('qrisReadyState');
  if (loadEl)  loadEl.style.display  = 'none';
  if (readyEl) readyEl.style.display = 'flex';
  const qrImg = document.getElementById('qrisQrImg');
  if (qrImg && data.qr_url) qrImg.src = data.qr_url;
  const amtEl = document.getElementById('qrisAmount');
  if (amtEl) amtEl.textContent = 'Rp ' + amount.toLocaleString('id');
  const expEl = document.getElementById('qrisExpiry');
  if (expEl && data.expired_at) {
    const exp = new Date(data.expired_at);
    expEl.textContent = exp.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });
  }
}

let _pollingInterval = null;
function startPolling(idTrx) {
  stopPolling();
  _pollingInterval = setInterval(async () => {
    try {
      const res  = await fetch(`https://qris.zakki.store/status?token=${QRIS_TOKEN}&id_transaksi=${idTrx}`);
      const data = await res.json();
      if (data.status === 'paid' || data.status === 'success') {
        stopPolling();
        _saveToHistory();
        showStatusOverlay('success');
      } else if (data.status === 'expired' || data.status === 'failed') {
        stopPolling();
        showStatusOverlay('failed', 'Transaksi kadaluarsa atau gagal.');
      }
    } catch {}
  }, 4000);
}

function stopPolling() {
  if (_pollingInterval) { clearInterval(_pollingInterval); _pollingInterval = null; }
}

function showStatusOverlay(state, msg) {
  const overlay = document.getElementById('statusOverlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  requestAnimationFrame(() => overlay.classList.add('visible'));
  document.body.style.overflow = 'hidden';
  ['loading','success','failed','pending'].forEach(s => {
    const el = document.getElementById('status' + s.charAt(0).toUpperCase() + s.slice(1));
    if (el) el.style.display = 'none';
  });
  const el = document.getElementById('status' + state.charAt(0).toUpperCase() + state.slice(1));
  if (el) el.style.display = 'flex';
  if (state === 'failed' && msg) {
    const msgEl = document.getElementById('statusFailedMsg');
    if (msgEl) msgEl.textContent = msg;
  }
  if (state === 'success') {
    const info   = window._qrisOrderInfo || {};
    const d      = window._qrisData || {};
    const idTrx  = d.id_transaksi || '-';
    const total  = d.rincian ? d.rincian.total_bayar.toLocaleString('id') : '-';
    const waText = `Saya sudah melakukan pembayaran mohon untuk segera diproses min\n\nPaket: ${info.pkg}\nNama: ${info.nama}\nNomor WA: ${info.nomor}\nLink Grup: ${info.link}\nTotal Dibayar: Rp ${total}\nID Transaksi: ${idTrx}`;
    const waLink = document.getElementById('successWaLink');
    if (waLink) waLink.href = 'https://wa.me/' + OWNER_WA + '?text=' + encodeURIComponent(waText);
  }
}

function closeStatusOverlay() {
  const overlay = document.getElementById('statusOverlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  setTimeout(() => { overlay.style.display = 'none'; }, 300);
  document.body.style.overflow = '';
}

/* ===== HISTORY ===== */
const HISTORY_KEY = 'astrobot_history';

function _saveToHistory() {
  const info  = window._qrisOrderInfo || {};
  const d     = window._qrisData || {};
  const total = d.rincian ? d.rincian.total_bayar.toLocaleString('id') : '';
  const idTrx = d.id_transaksi || '-';
  const waMsg =
    `Saya sudah melakukan pembayaran mohon untuk segera diproses min\n\n` +
    `Paket: ${info.pkg || '-'}\n` +
    `Nama: ${info.nama || '-'}\n` +
    `Nomor WA: ${info.nomor || '-'}\n` +
    `Link Grup: ${info.link || '-'}\n` +
    `Total Dibayar: Rp ${total}\n` +
    `ID Transaksi: ${idTrx}`;
  const entry = {
    id: idTrx, pkg: info.pkg || '-', nama: info.nama || '-',
    nomor: info.nomor || '-', link: info.link || '-',
    total: d.rincian ? d.rincian.total_bayar : 0,
    waktu: new Date().toISOString(), waMsg
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
  const list     = _getHistory();
  const heroBtn  = document.getElementById('historyHeroBtn');
  const badge    = document.getElementById('historyBadge');
  const navBtn   = document.getElementById('panelHistoryBtn');
  const navBadge = document.getElementById('historyNavBadge');
  const count    = list.length;
  const label    = count > 9 ? '9+' : count;
  if (heroBtn) heroBtn.style.display = 'flex';
  if (count > 0) {
    if (badge)    { badge.style.display = 'flex'; badge.textContent = label; }
    if (navBtn)   navBtn.style.display  = 'flex';
    if (navBadge) navBadge.textContent  = label;
  } else {
    if (badge)   badge.style.display = 'none';
    if (navBtn)  navBtn.style.display = 'none';
  }
}

function openHistoryPage() {
  const page = document.getElementById('historyPage');
  if (!page) return;
  page.style.display = 'block';
  requestAnimationFrame(() => page.classList.add('hp-visible'));
  document.body.style.overflow = 'hidden';
  _renderHistory();
}

function closeHistoryPage() {
  const page = document.getElementById('historyPage');
  if (!page) return;
  page.classList.remove('hp-visible');
  setTimeout(() => { page.style.display = 'none'; }, 280);
  // Jangan reset overflow jika ada modal lain yang masih terbuka
  const orderOpen = document.getElementById('orderModal')?.style.display !== 'none';
  const qrisOpen  = document.getElementById('qrisPayOverlay')?.style.display !== 'none';
  if (!orderOpen && !qrisOpen) document.body.style.overflow = '';
}

function clearHistory() {
  if (!confirm('Hapus semua riwayat pembelian?')) return;
  localStorage.removeItem(HISTORY_KEY);
  _updateHistoryBadge();
  _renderHistory();
}

// Toggle expand/collapse item riwayat
function toggleHistoryItem(idx) {
  const detail = document.getElementById('hist-detail-' + idx);
  const arrow  = document.getElementById('hist-arrow-' + idx);
  const card   = document.getElementById('hist-card-' + idx);
  if (!detail) return;
  const isOpen = detail.classList.contains('hist-open');
  // Tutup semua dulu
  document.querySelectorAll('.hist-detail').forEach(d => d.classList.remove('hist-open'));
  document.querySelectorAll('.hist-arrow').forEach(a => a.classList.remove('hist-arrow-open'));
  document.querySelectorAll('.hist-card').forEach(c => c.classList.remove('hist-card-active'));
  if (!isOpen) {
    detail.classList.add('hist-open');
    if (arrow) arrow.classList.add('hist-arrow-open');
    if (card)  card.classList.add('hist-card-active');
    // Scroll ke card
    setTimeout(() => card && card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 180);
  }
}

function _renderHistory() {
  const list    = _getHistory();
  const listEl  = document.getElementById('historyList');
  const emptyEl = document.getElementById('historyEmpty');
  if (!listEl) return;

  // Inject style animasi jika belum ada
  if (!document.getElementById('hist-anim-style')) {
    const s = document.createElement('style');
    s.id = 'hist-anim-style';
    s.textContent = `
      #historyPage { transform: translateY(20px); opacity: 0; transition: transform .28s cubic-bezier(.4,0,.2,1), opacity .28s ease; }
      #historyPage.hp-visible { transform: translateY(0); opacity: 1; }
      .hist-card { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 16px; overflow: hidden; cursor: pointer; transition: border-color .2s, box-shadow .2s; }
      .hist-card:hover { border-color: #2a2a2a; }
      .hist-card.hist-card-active { border-color: #2a2a2a; box-shadow: 0 4px 24px rgba(0,0,0,.5); }
      .hist-header { display: flex; align-items: center; gap: 12px; padding: 14px 16px; user-select: none; }
      .hist-detail { max-height: 0; overflow: hidden; transition: max-height .32s cubic-bezier(.4,0,.2,1), opacity .25s ease; opacity: 0; }
      .hist-detail.hist-open { max-height: 600px; opacity: 1; }
      .hist-arrow { width: 28px; height: 28px; border-radius: 8px; background: #161616; border: 1px solid #222; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: transform .25s cubic-bezier(.4,0,.2,1), background .2s; margin-left: auto; }
      .hist-arrow-open { transform: rotate(180deg); background: #1e1e1e; }
      .hist-detail-inner { padding: 0 16px 16px; display: flex; flex-direction: column; gap: 10px; }
      .hist-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
      .hist-label { font-size: .72rem; color: #444; font-weight: 600; flex-shrink: 0; padding-top: 1px; }
      .hist-val { font-size: .78rem; color: #ccc; font-weight: 600; text-align: right; word-break: break-all; }
      .hist-divider { border: none; border-top: 1px solid #161616; margin: 2px 0; }
      .hist-msg-box { background: #111; border-radius: 10px; padding: 12px; border: 1px solid #1a1a1a; }
      .hist-msg-label { font-size: .65rem; color: #333; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px; }
      .hist-msg-pre { font-size: .76rem; color: #666; line-height: 1.65; white-space: pre-wrap; word-break: break-word; margin: 0; font-family: inherit; }
      .hist-wa-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 11px; background: #0a1f0a; border: 1px solid #1a3a1a; text-decoration: none; transition: background .2s, border-color .2s; }
      .hist-wa-btn:hover { background: #0f2a0f; border-color: #22531a; }
      @keyframes histFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      .hist-card { animation: histFadeIn .25s ease both; }
    `;
    document.head.appendChild(s);
  }

  if (list.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'flex';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  listEl.innerHTML = list.map((e, i) => {
    const tgl    = new Date(e.waktu);
    const tglStr = tgl.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
    const jamStr = tgl.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });
    const waUrl  = 'https://wa.me/' + OWNER_WA + '?text=' + encodeURIComponent(e.waMsg || '');
    const delay  = Math.min(i * 0.05, 0.3);

    return `
    <div class="hist-card" id="hist-card-${i}" style="animation-delay:${delay}s">
      <div class="hist-header" onclick="toggleHistoryItem(${i})">
        <!-- Status dot -->
        <div style="width:34px;height:34px;border-radius:10px;background:#0a1f0a;border:1px solid #1a3a1a;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <!-- Info utama -->
        <div style="flex:1;min-width:0;">
          <div style="font-size:.86rem;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.pkg}</div>
          <div style="font-size:.68rem;color:#3a3a3a;margin-top:2px;">${tglStr} · ${jamStr}</div>
        </div>
        <!-- Harga -->
        <div style="text-align:right;flex-shrink:0;margin-right:8px;">
          <div style="font-size:.88rem;font-weight:800;color:#22c55e;">Rp ${(e.total||0).toLocaleString('id')}</div>
          <div style="font-size:.63rem;color:#2a2a2a;margin-top:1px;">Sukses</div>
        </div>
        <!-- Arrow -->
        <div class="hist-arrow" id="hist-arrow-${i}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      <!-- Detail (collapsed by default) -->
      <div class="hist-detail" id="hist-detail-${i}">
        <div class="hist-detail-inner">
          <hr class="hist-divider" style="margin-top:0;">

          <!-- Info transaksi -->
          <div style="display:flex;flex-direction:column;gap:7px;">
            <div class="hist-row">
              <span class="hist-label">ID Transaksi</span>
              <span class="hist-val" style="font-family:monospace;font-size:.72rem;color:#555;">${e.id}</span>
            </div>
            <div class="hist-row">
              <span class="hist-label">Nama</span>
              <span class="hist-val">${e.nama}</span>
            </div>
            <div class="hist-row">
              <span class="hist-label">Nomor WA</span>
              <span class="hist-val">${e.nomor}</span>
            </div>
            ${e.link && e.link !== '-' ? `
            <div class="hist-row">
              <span class="hist-label">Link Grup</span>
              <span class="hist-val" style="color:#7c3aed;">${e.link}</span>
            </div>` : ''}
            <div class="hist-row">
              <span class="hist-label">Total Bayar</span>
              <span class="hist-val" style="color:#22c55e;font-size:.86rem;">Rp ${(e.total||0).toLocaleString('id')}</span>
            </div>
          </div>

          <hr class="hist-divider">

          <!-- Teks pesan WA -->
          <div class="hist-msg-box">
            <div class="hist-msg-label">Teks Konfirmasi</div>
            <pre class="hist-msg-pre">${e.waMsg || '-'}</pre>
          </div>

          <!-- Tombol kirim ulang -->
          <a href="${waUrl}" target="_blank" class="hist-wa-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            <span style="font-size:.8rem;font-weight:800;color:#22c55e;">Kirim Ulang ke Admin</span>
          </a>
        </div>
      </div>
    </div>`;
  }).join('');
}

async function cancelQris() {
  if (!window._qrisData) { closeQrisPay(); return; }
  const idTrx = window._qrisData.id_transaksi;
  try { await fetch(`https://qris.zakki.store/cancel?token=${QRIS_TOKEN}&id_transaksi=${idTrx}`); } catch {}
  clearInterval(window._qrisTimer);
  closeQrisPay();
}

/* ===== PRICING FILTER TABS ===== */
function filterPricing(tab) {
  ['group','premium','jadibot'].forEach(t => {
    const el  = document.getElementById('pricing-' + t);
    const btn = document.getElementById('tab-' + t);
    if (el)  el.style.display = t === tab ? 'block' : 'none';
    if (btn) btn.classList.toggle('active-tab', t === tab);
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeOrder();
});
