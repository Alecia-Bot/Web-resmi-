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
  const waHref = 'https://wa.me/18763192888?text=' + encodeURIComponent(msg);
  window.open(waHref, '_blank');
}

/* ===== HISTORY =====*/
const HISTORY_KEY = 'astrobot_history';

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

function openHistoryPage() {
  const el = document.getElementById('ownerDashboard');
  if (!el) return;
  el.style.display = 'block';
  el.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  _renderHistory();
}

function closeHistoryPage() {
  const el = document.getElementById('ownerDashboard');
  if (!el) return;
  el.style.display = 'none';
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
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
    const tgl    = new Date(e.waktu);
    const tglStr = tgl.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
    const jamStr = tgl.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });
    const waUrl  = 'https://wa.me/18763192888?text=' + encodeURIComponent('Halo min mau sewa bot 15 hari');
    const delay  = i * 0.06;

    return `
    <div class="hist-card hist-card-anim" style="animation-delay:${delay}s;">
      <div style="padding:12px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #111111;">
        <div class="hist-status-badge">
          <span class="hist-dot"></span>
          <span style="font-size:.65rem;font-weight:800;color:#22c55e;letter-spacing:.04em;">AKTIF</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:1px;">
          <span style="font-size:.68rem;color:#3a3a3a;font-weight:600;">${tglStr}</span>
          <span style="font-size:.64rem;color:#2a2a2a;">${jamStr}</span>
        </div>
      </div>

      <div style="padding:14px;display:flex;flex-direction:column;gap:12px;">
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

        <div style="border-top:1px solid #111;"></div>

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

        <a href="${waUrl}" target="_blank" class="hist-wa-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          <span style="font-size:.8rem;font-weight:800;color:#22c55e;">Hubungi Owner</span>
        </a>
      </div>
    </div>`;
  }).join('');
}

/* ===== PRICING FILTER TABS ===== */
function filterPricing(tab) {
  ['group','premium','jadibot','script'].forEach(t => {
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

/* ===== SCRIPT BOT FUNCTIONS ===== */

const _scriptData = {
  update: {
    nama: 'ASTROBOT MD — Free Update Selamanya',
    harga: 50000,
    hargaFmt: 'Rp 50.000',
    hargaColor: '#fff',
    benefits: [
      'Free update selamanya selama pengembangan',
      'Mudah dikustomisasi sesuai kebutuhan',
      'Struktur plugin terpisah dan rapi',
      'Siap digunakan tanpa konfigurasi rumit',
      'Support pengembangan fitur baru',
    ]
  },
  replace: {
    nama: 'ASTROBOT MD — 1x Replace Script',
    harga: 35000,
    hargaFmt: 'Rp 35.000',
    hargaColor: '#fbbf24',
    benefits: [
      '1x Replace ke versi script terbaru',
      'Harga lebih hemat dari paket update',
      'Struktur plugin terpisah dan rapi',
      'Siap digunakan tanpa konfigurasi rumit',
      'Cocok untuk pembelian sekali pakai',
    ]
  }
}

let _currentScript = 'update'

function openScriptDetail(type) {
  _currentScript = type
  const d = _scriptData[type]

  const titleEl = document.getElementById('sdTitleMain')
  if (titleEl) titleEl.textContent = d.nama

  const hargaEl = document.getElementById('sdHargaBesar')
  if (hargaEl) { hargaEl.textContent = d.hargaFmt; hargaEl.style.color = d.hargaColor }

  const benList = document.getElementById('sdBenefitList')
  if (benList) benList.innerHTML = d.benefits.map(b =>
    `<li style="font-size:.88rem;color:#ccc;">${b}</li>`).join('')

  const modal = document.getElementById('scriptDetailModal')
  modal.style.display = 'block'
  modal.style.visibility = 'visible'
  modal.style.transform = 'translateX(100%)'
  document.body.style.overflow = 'hidden'
  void modal.offsetHeight
  modal.style.transform = 'translateX(0)'
  modal.scrollTop = 0
}

function closeScriptDetail() {
  const modal = document.getElementById('scriptDetailModal')
  modal.style.transform = 'translateX(100%)'
  setTimeout(() => {
    modal.style.visibility = 'hidden'
    modal.style.display = ''
    document.body.style.overflow = ''
  }, 350)
}

function closeDetailThenOrder() {
  const d = _scriptData[_currentScript]
  closeScriptDetail()
  setTimeout(() => openScriptOrder(d.nama, d.harga), 360)
}

function openScriptOrder(nama, harga) {
  const d = harga === 50000 ? _scriptData.update : _scriptData.replace
  _currentScript = harga === 50000 ? 'update' : 'replace'

  const hargaFmt = d.hargaFmt

  if (document.getElementById('soHargaBesar'))   document.getElementById('soHargaBesar').textContent   = hargaFmt
  if (document.getElementById('soHargaRingkas')) document.getElementById('soHargaRingkas').textContent = hargaFmt
  if (document.getElementById('soTotal'))        document.getElementById('soTotal').textContent        = hargaFmt
  if (document.getElementById('soTitle'))        document.getElementById('soTitle').textContent        = nama

  const benList = document.getElementById('soBenList')
  if (benList) benList.innerHTML = d.benefits.map(b =>
    `<li style="font-size:.9rem;color:#ccc;">${b}</li>`).join('')

  if (document.getElementById('soNama'))  document.getElementById('soNama').value  = ''
  if (document.getElementById('soNomor')) document.getElementById('soNomor').value = ''

  const orderModal = document.getElementById('orderModal')
  if (orderModal) {
    orderModal.dataset.pkg   = nama
    orderModal.dataset.total = harga
    orderModal.dataset.price = harga
    const linkEl = document.getElementById('orderLink')
    if (linkEl) linkEl.value = '-'
    const namaEl = document.getElementById('orderNama')
    if (namaEl) namaEl.value = ''
    const nomorEl = document.getElementById('orderNomor')
    if (nomorEl) nomorEl.value = ''
  }

  const modal = document.getElementById('scriptOrderModal')
  modal.style.display = 'block'
  modal.style.visibility = 'visible'
  modal.style.transform = 'translateX(100%)'
  document.body.style.overflow = 'hidden'
  void modal.offsetHeight
  modal.style.transform = 'translateX(0)'
  modal.scrollTop = 0
}

function closeScriptOrder() {
  const modal = document.getElementById('scriptOrderModal')
  modal.style.transform = 'translateX(100%)'
  setTimeout(() => {
    modal.style.visibility = 'hidden'
    modal.style.display = ''
    document.body.style.overflow = ''
  }, 350)
}

function handleScriptBeli() {
  // Direct redirect to WhatsApp with script-specific message
  const msg = 'halo min saya tertarik dengan script astrobot';
  const waHref = 'https://wa.me/18763192888?text=' + encodeURIComponent(msg);
  window.open(waHref, '_blank');
  closeScriptOrder();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeScriptOrder()
    closeScriptDetail()
  }
})
