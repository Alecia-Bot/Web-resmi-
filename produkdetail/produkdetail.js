(() => {
  'use strict';

  const OWNER_NUMBER = '18763192888';

  const PACKAGES = {
    '1': { code: 'PAKET 01', title: 'SEWA BOT 15 HARI', duration: 'Aktif 15 hari', price: 6000 },
    '2': { code: 'PAKET 02', title: 'SEWA BOT 30 HARI', duration: 'Aktif 30 hari', price: 12000 },
    '3': { code: 'PAKET 03', title: 'SEWA BOT 60 HARI', duration: 'Aktif 60 hari', price: 20000 },
    '4': { code: 'PAKET 04', title: 'SEWA BOT 1 TAHUN', duration: 'Aktif 365 hari', price: 40000 }
  };

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
  setText('summaryTotal', rupiah(selectedPackage.price));
  document.title = `${selectedPackage.title} - Astrobot`;

  // Compact product album. Clicking a thumbnail opens the full-size swipe viewer.
  const gallery = document.getElementById('productGallery');
  const gallerySlides = Array.from(gallery?.querySelectorAll('[data-gallery-slide]') || []);

  const clampGalleryIndex = index => {
    const count = gallerySlides.length;
    if (!count) return 0;
    return (index + count) % count;
  };

  // Fullscreen image preview with buttons, keyboard navigation, and touch swipe.
  const galleryModal = document.getElementById('productGalleryModal');
  const galleryModalImage = document.getElementById('productGalleryModalImage');
  const galleryModalClose = document.getElementById('productGalleryModalClose');
  const galleryModalPrev = document.getElementById('productGalleryModalPrev');
  const galleryModalNext = document.getElementById('productGalleryModalNext');
  const galleryModalCounter = document.getElementById('productGalleryModalCounter');
  const galleryModalStage = document.getElementById('productGalleryModalStage');
  let modalIndex = 0;
  let modalPointerStartX = 0;
  let modalPointerDeltaX = 0;
  let modalPointerId = null;
  let modalDragging = false;
  let modalLastFocused = null;

  const galleryImageData = index => {
    const safeIndex = clampGalleryIndex(index);
    const img = gallerySlides[safeIndex]?.querySelector('img');
    return {
      index: safeIndex,
      src: img?.currentSrc || img?.src || '',
      alt: img?.alt || `Gambar produk Astrobot ${safeIndex + 1}`
    };
  };

  const renderGalleryModal = index => {
    if (!galleryModalImage || !gallerySlides.length) return;
    const data = galleryImageData(index);
    modalIndex = data.index;
    galleryModalImage.src = data.src;
    galleryModalImage.alt = data.alt;
    galleryModalImage.style.transform = '';
    galleryModalImage.style.opacity = '';
    if (galleryModalCounter) galleryModalCounter.textContent = `${modalIndex + 1} / ${gallerySlides.length}`;
  };

  const openGalleryModal = index => {
    if (!galleryModal || !gallerySlides.length) return;
    modalLastFocused = document.activeElement;
    renderGalleryModal(index);
    galleryModal.hidden = false;
    galleryModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('gallery-modal-open');
    requestAnimationFrame(() => galleryModalClose?.focus({ preventScroll: true }));
  };

  const closeGalleryModal = () => {
    if (!galleryModal || galleryModal.hidden) return;
    galleryModal.hidden = true;
    galleryModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('gallery-modal-open');
    if (modalLastFocused instanceof HTMLElement) modalLastFocused.focus({ preventScroll: true });
  };

  const moveGalleryModal = direction => renderGalleryModal(modalIndex + direction);

  gallerySlides.forEach((slide, index) => {
    slide.addEventListener('click', () => openGalleryModal(index));
    slide.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openGalleryModal(index);
    });
  });

  galleryModalClose?.addEventListener('click', closeGalleryModal);
  galleryModalPrev?.addEventListener('click', () => moveGalleryModal(-1));
  galleryModalNext?.addEventListener('click', () => moveGalleryModal(1));
  galleryModal?.querySelectorAll('[data-gallery-modal-close]').forEach(el => {
    el.addEventListener('click', closeGalleryModal);
  });

  document.addEventListener('keydown', event => {
    if (!galleryModal || galleryModal.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeGalleryModal();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveGalleryModal(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveGalleryModal(1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      renderGalleryModal(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      renderGalleryModal(gallerySlides.length - 1);
    }
  });

  const finishModalDrag = () => {
    if (!modalDragging) return;
    const threshold = Math.min(100, Math.max(44, (galleryModalStage?.clientWidth || 0) * 0.12));
    if (Math.abs(modalPointerDeltaX) >= threshold) {
      moveGalleryModal(modalPointerDeltaX < 0 ? 1 : -1);
    }
    galleryModalStage?.classList.remove('is-dragging');
    if (galleryModalImage) galleryModalImage.style.transform = '';
    modalPointerDeltaX = 0;
    modalDragging = false;
    modalPointerId = null;
  };

  galleryModalStage?.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    modalPointerId = event.pointerId;
    modalPointerStartX = event.clientX;
    modalPointerDeltaX = 0;
    modalDragging = true;
    galleryModalStage.classList.add('is-dragging');
    galleryModalStage.setPointerCapture?.(event.pointerId);
  });

  galleryModalStage?.addEventListener('pointermove', event => {
    if (!modalDragging || event.pointerId !== modalPointerId) return;
    modalPointerDeltaX = event.clientX - modalPointerStartX;
    if (galleryModalImage) {
      const stageWidth = galleryModalStage.clientWidth || 1;
      const limitedDelta = Math.max(-stageWidth * .72, Math.min(stageWidth * .72, modalPointerDeltaX));
      galleryModalImage.style.transform = `translate3d(${limitedDelta}px, 0, 0) scale(.985)`;
    }
  });

  galleryModalStage?.addEventListener('pointerup', event => {
    if (event.pointerId !== modalPointerId) return;
    galleryModalStage.releasePointerCapture?.(event.pointerId);
    finishModalDrag();
  });

  galleryModalStage?.addEventListener('pointercancel', finishModalDrag);
  galleryModalStage?.addEventListener('lostpointercapture', finishModalDrag);

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
    const total = selectedPackage.price;

    const order = {
      packageId: packageKey,
      packageCode: selectedPackage.code,
      product: selectedPackage.title,
      duration: selectedPackage.duration,
      productPrice: selectedPackage.price,
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
      'halo min',
      'berikut *PESANAN SEWA BOT ASTROBOT*',
      '',
      `Paket: ${selectedPackage.code}`,
      `Produk: ${selectedPackage.title}`,
      `Durasi: ${selectedPackage.duration}`,
      `Harga Produk: ${rupiah(selectedPackage.price)}`,
      `Total: ${rupiah(total)}`,
      '',
      '*DATA PEMBELI*',
      `Nama: ${buyerName}`,
      `Nomor: ${buyerPhone}`,
      `Link Grup: ${groupLink}`,
      '',
      'Mohon berikan informasi tentang metode pembayaran min'
    ].join('\n');

    if (ready) ready.hidden = false;

    const url = `https://wa.me/${OWNER_NUMBER}?text=${encodeURIComponent(message)}`;
    const opened = window.open(url, '_blank', 'noopener');

    if (!opened) {
      window.location.href = url;
    }
  });
})();
