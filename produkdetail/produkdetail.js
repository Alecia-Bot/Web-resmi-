(() => {
  'use strict';

  const OWNER_NUMBER = '6289674097203';

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

  // Product image gallery: buttons, dots, keyboard arrows, and horizontal swipe/drag.
  const gallery = document.getElementById('productGallery');
  const galleryViewport = document.getElementById('productGalleryViewport');
  const galleryTrack = document.getElementById('productGalleryTrack');
  const gallerySlides = Array.from(gallery?.querySelectorAll('[data-gallery-slide]') || []);
  const galleryDots = Array.from(gallery?.querySelectorAll('[data-gallery-dot]') || []);
  const galleryPrev = document.getElementById('productGalleryPrev');
  const galleryNext = document.getElementById('productGalleryNext');
  const galleryCounter = document.getElementById('productGalleryCounter');

  let galleryIndex = 0;
  let pointerStartX = 0;
  let pointerDeltaX = 0;
  let activePointerId = null;
  let isDraggingGallery = false;

  const clampGalleryIndex = index => {
    const count = gallerySlides.length;
    if (!count) return 0;
    return (index + count) % count;
  };

  const renderGallery = (index, { animate = true } = {}) => {
    if (!galleryTrack || !gallerySlides.length) return;

    galleryIndex = clampGalleryIndex(index);
    galleryTrack.classList.toggle('is-dragging', !animate);
    galleryTrack.style.transform = `translate3d(${-galleryIndex * 100}%, 0, 0)`;

    gallerySlides.forEach((slide, slideIndex) => {
      const active = slideIndex === galleryIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    galleryDots.forEach((dot, dotIndex) => {
      const active = dotIndex === galleryIndex;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });

    if (galleryCounter) galleryCounter.textContent = `${galleryIndex + 1} / ${gallerySlides.length}`;
  };

  const moveGallery = direction => renderGallery(galleryIndex + direction);

  galleryPrev?.addEventListener('click', () => moveGallery(-1));
  galleryNext?.addEventListener('click', () => moveGallery(1));
  galleryDots.forEach(dot => {
    dot.addEventListener('click', () => renderGallery(Number(dot.dataset.galleryDot || 0)));
  });

  galleryViewport?.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveGallery(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveGallery(1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      renderGallery(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      renderGallery(gallerySlides.length - 1);
    }
  });

  const finishGalleryDrag = () => {
    if (!galleryTrack || !isDraggingGallery) return;

    const threshold = Math.min(90, Math.max(42, (galleryViewport?.clientWidth || 0) * 0.12));
    galleryTrack.classList.remove('is-dragging');

    if (Math.abs(pointerDeltaX) >= threshold) {
      moveGallery(pointerDeltaX < 0 ? 1 : -1);
    } else {
      renderGallery(galleryIndex);
    }

    pointerDeltaX = 0;
    isDraggingGallery = false;
    activePointerId = null;
  };

  galleryViewport?.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (event.target.closest('.product-gallery-button')) return;

    activePointerId = event.pointerId;
    pointerStartX = event.clientX;
    pointerDeltaX = 0;
    isDraggingGallery = true;
    galleryTrack?.classList.add('is-dragging');
    galleryViewport.setPointerCapture?.(event.pointerId);
  });

  galleryViewport?.addEventListener('pointermove', event => {
    if (!isDraggingGallery || event.pointerId !== activePointerId || !galleryTrack) return;

    pointerDeltaX = event.clientX - pointerStartX;
    const width = galleryViewport.clientWidth || 1;
    const limitedDelta = Math.max(-width, Math.min(width, pointerDeltaX));
    galleryTrack.style.transform = `translate3d(calc(${-galleryIndex * 100}% + ${limitedDelta}px), 0, 0)`;
  });

  galleryViewport?.addEventListener('pointerup', event => {
    if (event.pointerId !== activePointerId) return;
    galleryViewport.releasePointerCapture?.(event.pointerId);
    finishGalleryDrag();
  });

  galleryViewport?.addEventListener('pointercancel', finishGalleryDrag);
  galleryViewport?.addEventListener('lostpointercapture', finishGalleryDrag);

  renderGallery(0, { animate: false });
  requestAnimationFrame(() => galleryTrack?.classList.remove('is-dragging'));

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
