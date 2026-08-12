(() => {
  'use strict';

  const OWNER_NUMBER = '6289674097203';

  const PACKAGES = {
    '1': { code: 'PAKET 01', title: 'SEWA BOT 15 HARI', duration: 'Aktif 15 hari', price: 6000 },
    '2': { code: 'PAKET 02', title: 'SEWA BOT 30 HARI', duration: 'Aktif 30 hari', price: 12000 },
    '3': { code: 'PAKET 03', title: 'SEWA BOT 60 HARI', duration: 'Aktif 60 hari', price: 20000 },
    '4': { code: 'PAKET 04', title: 'SEWA BOT 1 TAHUN', duration: 'Aktif 365 hari', price: 40000 }
  };

  const HANDLING_FEE = 300;
  const params = new URLSearchParams(window.location.search);
  const packageKey = PACKAGES[params.get('paket')] ? params.get('paket') : '1';
  const selectedPackage = PACKAGES[packageKey];

  const rupiah = value => `Rp ${new Intl.NumberFormat('id-ID').format(Number(value || 0))}`;
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText('heroPackageCode', selectedPackage.code);
  setText('packageCode', `SEWA BOT ASTROBOT • ${selectedPackage.code}`);
  setText('packageTitle', selectedPackage.title);
  setText('topPrice', rupiah(selectedPackage.price));
  setText('durationLabel', selectedPackage.duration);
  setText('summaryPrice', rupiah(selectedPackage.price));
  setText('handlingPrice', rupiah(HANDLING_FEE));
  setText('summaryTotal', rupiah(selectedPackage.price + HANDLING_FEE));
  document.title = `${selectedPackage.title} - Astrobot`;

  const root = document.documentElement;
  const themeToggle = document.getElementById('productThemeToggle');
  const themeLabel = themeToggle?.querySelector('.theme-label');

  const getSavedTheme = () => {
    try { return localStorage.getItem('astrobot-theme'); }
    catch (_) { return null; }
  };

  const saveTheme = theme => {
    try { localStorage.setItem('astrobot-theme', theme); }
    catch (_) {}
  };

  const syncThemeLabel = () => {
    if (themeLabel) themeLabel.textContent = root.dataset.theme === 'light' ? 'Light' : 'Dark';
  };

  if (getSavedTheme() === 'light') root.dataset.theme = 'light';
  syncThemeLabel();

  themeToggle?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    if (next === 'light') root.dataset.theme = 'light';
    else delete root.dataset.theme;
    saveTheme(next);
    syncThemeLabel();
  });

  const form = document.getElementById('productOrderForm');
  const ready = document.getElementById('orderReady');
  const fields = ['buyerName', 'buyerPhone', 'groupLink'].map(id => document.getElementById(id));

  fields.forEach(field => {
    field?.addEventListener('input', () => field.classList.remove('is-invalid'));
  });

  function makeOrderId() {
    const stamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `AST-${stamp}-${random}`;
  }

  form?.addEventListener('submit', event => {
    event.preventDefault();

    let valid = true;

    fields.forEach(field => {
      if (!field?.value.trim()) {
        field?.classList.add('is-invalid');
        valid = false;
      }
    });

    const groupLink = document.getElementById('groupLink')?.value.trim() || '';
    if (groupLink && !/^https:\/\/(chat\.)?whatsapp\.com\//i.test(groupLink)) {
      document.getElementById('groupLink')?.classList.add('is-invalid');
      valid = false;
    }

    if (!valid) {
      form.querySelector('.is-invalid')?.focus();
      return;
    }

    const buyerName = document.getElementById('buyerName').value.trim();
    const buyerPhone = document.getElementById('buyerPhone').value.trim();
    const orderId = makeOrderId();
    const total = selectedPackage.price + HANDLING_FEE;

    const order = {
      orderId,
      packageId: packageKey,
      packageCode: selectedPackage.code,
      product: selectedPackage.title,
      duration: selectedPackage.duration,
      productPrice: selectedPackage.price,
      handlingFee: HANDLING_FEE,
      total,
      buyerName,
      buyerPhone,
      groupLink,
      status: 'MENUNGGU PROSES OWNER',
      createdAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('astrobotPendingOrder', JSON.stringify(order));
    } catch (_) {}

    const message = [
      '*PESANAN SEWA BOT ASTROBOT*',
      '',
      `Order ID: ${orderId}`,
      `Paket: ${selectedPackage.code}`,
      `Produk: ${selectedPackage.title}`,
      `Durasi: ${selectedPackage.duration}`,
      `Harga Produk: ${rupiah(selectedPackage.price)}`,
      `Biaya Penanganan: ${rupiah(HANDLING_FEE)}`,
      `Total: ${rupiah(total)}`,
      '',
      '*DATA PEMBELI*',
      `Nama: ${buyerName}`,
      `Nomor: ${buyerPhone}`,
      `Link Grup: ${groupLink}`,
      '',
      'Mohon diproses secara manual. Terima kasih.'
    ].join('\n');

    if (ready) ready.hidden = false;

    const url = `https://wa.me/${OWNER_NUMBER}?text=${encodeURIComponent(message)}`;
    const opened = window.open(url, '_blank', 'noopener');

    if (!opened) {
      window.location.href = url;
    }
  });
})();
