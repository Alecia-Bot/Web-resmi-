(() => {
  'use strict';

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
  const statusBox = document.getElementById('qrisStatus');
  const qrisResult = document.getElementById('qrisResult');
  const nextButton = document.getElementById('orderNextButton');
  const nextText = document.getElementById('orderNextText');
  const fields = ['buyerName', 'buyerPhone', 'groupLink'].map(id => document.getElementById(id));

  fields.forEach(field => field?.addEventListener('input', () => field.classList.remove('is-invalid')));

  function makeOrderId() {
    const stamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `AST-${stamp}-${random}`;
  }

  function showStatus(message, type = '') {
    if (!statusBox) return;
    statusBox.hidden = false;
    statusBox.className = `qris-status${type ? ` is-${type}` : ''}`;
    statusBox.textContent = message;
  }

  function hideStatus() {
    if (statusBox) statusBox.hidden = true;
  }

  function setLoading(loading) {
    if (nextButton) nextButton.disabled = loading;
    if (nextText) nextText.textContent = loading ? 'Membuat QRIS...' : 'Buat QRIS Pembayaran';
  }

  form?.addEventListener('submit', async event => {
    event.preventDefault();

    let valid = true;
    fields.forEach(field => {
      if (!field?.value.trim()) {
        field?.classList.add('is-invalid');
        valid = false;
      }
    });

    const link = document.getElementById('groupLink')?.value.trim() || '';
    if (link && !/^https:\/\/(chat\.)?whatsapp\.com\//i.test(link)) {
      document.getElementById('groupLink')?.classList.add('is-invalid');
      valid = false;
    }

    if (!valid) {
      form.querySelector('.is-invalid')?.focus();
      return;
    }

    const order = {
      orderId: makeOrderId(),
      packageId: packageKey,
      packageCode: selectedPackage.code,
      product: selectedPackage.title,
      duration: selectedPackage.duration,
      productPrice: selectedPackage.price,
      handlingFee: HANDLING_FEE,
      expectedTotal: selectedPackage.price + HANDLING_FEE,
      buyerName: document.getElementById('buyerName').value.trim(),
      buyerPhone: document.getElementById('buyerPhone').value.trim(),
      groupLink: link,
      createdAt: new Date().toISOString()
    };

    try { localStorage.setItem('astrobotPendingOrder', JSON.stringify(order)); }
    catch (_) {}

    ready.hidden = false;
    qrisResult.hidden = true;
    showStatus('Sedang login ke DavPay dan membuat QRIS. Proses ini bisa memakan waktu beberapa detik...', 'loading');
    setLoading(true);

    try {
      // DavPay menerima nominal produk. Biaya QRIS aktual dibaca kembali dari halaman pembayaran.
      const response = await fetch('/api/davpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.orderId,
          amount: selectedPackage.price
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.message || 'Gagal membuat QRIS DavPay.');

      hideStatus();
      const actualTotal = Number(data.totalPayment || order.expectedTotal);
      const actualHandling = Math.max(0, actualTotal - selectedPackage.price);

      setText('handlingPrice', rupiah(actualHandling));
      setText('summaryTotal', rupiah(actualTotal));
      setText('qrisOrderId', data.orderId || order.orderId);
      setText('qrisTransactionId', data.transactionId || '-');
      setText('qrisTotal', rupiah(actualTotal));
      setText('qrisExpiry', data.expiresAtText || 'Ikuti waktu pada QRIS');

      const image = document.getElementById('qrisImage');
      if (image) image.src = data.qrImage;

      order.transactionId = data.transactionId || null;
      order.total = actualTotal;
      order.handlingFee = actualHandling;
      order.paymentStatus = 'PENDING';
      try { localStorage.setItem('astrobotPendingOrder', JSON.stringify(order)); }
      catch (_) {}

      qrisResult.hidden = false;
      qrisResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
      qrisResult.hidden = true;
      showStatus(error.message || 'Terjadi kesalahan saat membuat QRIS.', 'error');
    } finally {
      setLoading(false);
    }
  });
})();
