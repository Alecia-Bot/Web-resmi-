import chromiumBinary from '@sparticuz/chromium';
import { chromium as playwrightChromium } from 'playwright-core';

const BASE_URL = 'https://davpay.id';
const CHANNEL = 'QRIS';

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}

function normalizeRupiah(text = '') {
  const match = String(text).match(/Rp\s*([\d.]+(?:,\d+)?)/i);
  if (!match) return null;
  return Number(match[1].replace(/\./g, '').replace(/,\d+$/, ''));
}

async function launchBrowser() {
  chromiumBinary.setGraphicsMode = false;
  return playwrightChromium.launch({
    args: chromiumBinary.args,
    executablePath: await chromiumBinary.executablePath(),
    headless: true
  });
}

function getControlFrame(page) {
  return page.frames().find(frame => frame.url().includes('get_control.php'));
}

async function waitControlFrame(page, timeout = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const frame = getControlFrame(page);
    if (frame) {
      try {
        await frame.evaluate(() => document.body?.innerText || '');
        return frame;
      } catch (_) {}
    }
    await page.waitForTimeout(400);
  }
  throw new Error('Frame kontrol DavPay tidak muncul.');
}

async function safeGoto(page, url) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  } catch (error) {
    if (!/interrupted|ERR_ABORTED|navigat/i.test(error.message)) throw error;
  }
}

async function login(page, email, password) {
  await safeGoto(page, `${BASE_URL}/akun/login`);
  await page.waitForTimeout(1800);

  const frame = await waitControlFrame(page);
  await frame.fill('#email', email);
  await frame.fill('#password', password);
  await frame.$eval('button[type=submit]', button => button.click())
    .catch(() => frame.click('button[type=submit]', { noWaitAfter: true }));

  const started = Date.now();
  while (Date.now() - started < 25000) {
    await page.waitForTimeout(1000);
    const current = getControlFrame(page);
    if (!current) continue;
    const body = await current.evaluate(() => document.body?.innerText || '').catch(() => '');
    if (/Profil|Logout/i.test(body) || !/Belum punya akun/i.test(body) || !page.url().includes('/akun/login')) {
      return;
    }
  }
  throw new Error('Login DavPay gagal. Periksa DAVPAY_EMAIL / DAVPAY_PASSWORD.');
}

async function gotoTopup(page) {
  await safeGoto(page, `${BASE_URL}/akun/?page=topup`);
  await page.waitForTimeout(2200);
  return waitControlFrame(page);
}

async function generatePayment(page, amount) {
  let frame = await gotoTopup(page);
  const body = await frame.evaluate(() => document.body?.innerText || '').catch(() => '');

  // Untuk tahap tes, jangan batalkan transaksi pending secara otomatis.
  // Ini mencegah checkout baru membatalkan QR pembeli lain.
  if (/Batalkan TopUp/i.test(body)) {
    const error = new Error('Masih ada TopUp DavPay yang pending. Selesaikan/batalkan transaksi itu terlebih dahulu.');
    error.code = 'PENDING_TOPUP_EXISTS';
    throw error;
  }

  const input = await frame.$('input[name=jumlah_topup]');
  if (!input) throw new Error('Input nominal topup DavPay tidak ditemukan.');
  await input.fill(String(amount));

  await frame.$eval('button[type=submit]', button => button.click())
    .catch(() => frame.click('button[type=submit]', { noWaitAfter: true }));
  await page.waitForTimeout(3500);

  frame = await waitControlFrame(page);
  const overrideLink = await frame.$eval('a[href*="override_topup"]', a => a.href).catch(() => null);
  if (!overrideLink) throw new Error('Link pembayaran DavPay tidak ditemukan.');

  await safeGoto(page, overrideLink);
  await page.waitForTimeout(3200);
  frame = await waitControlFrame(page);

  const card = await frame.$(`.payment-card[data-channel-code="${CHANNEL}"]`);
  if (!card) throw new Error('Kanal QRIS DavPay tidak ditemukan.');

  const processResponse = page.waitForResponse(
    response => response.url().includes('/api/process/'),
    { timeout: 45000 }
  ).catch(() => null);

  await frame.evaluate(code => {
    document.querySelector(`.payment-card[data-channel-code="${code}"]`)?.click();
  }, CHANNEL).catch(() => card.click().catch(() => {}));

  await processResponse;
  await page.waitForTimeout(5000);

  let paymentText = '';
  let qrDataUrl = null;
  let transactionId = null;
  let expiresAtText = null;
  let totalPayment = null;

  for (const current of page.frames()) {
    if (!current.url().includes('hub.zevalpay.id/api/payment')) continue;

    const text = await current.evaluate(() => document.body?.innerText || '').catch(() => '');
    if (!text) continue;
    paymentText = text;

    const trx = text.match(/TRV[A-Z0-9]+/i);
    if (trx) transactionId = trx[0];

    const expiry = text.match(/Batas waktu transfer:\s*(.+)/i);
    if (expiry) expiresAtText = expiry[1].trim();

    const totalBlock = text.match(/TOTAL BAYAR[\s\S]{0,100}?(Rp\s*[\d.]+(?:,\d+)?)/i);
    totalPayment = normalizeRupiah(totalBlock?.[1] || text);

    let qr = await current.$('img[alt="QR"]');
    if (!qr) qr = await current.$('img[src*="generate-qris"], img[src*="qris" i], img[src*="qr" i]');
    if (qr) {
      const buffer = await qr.screenshot({ type: 'png' }).catch(() => null);
      if (buffer) qrDataUrl = `data:image/png;base64,${buffer.toString('base64')}`;
    }
  }

  if (!qrDataUrl) throw new Error('QRIS berhasil diproses tetapi gambar QR tidak ditemukan.');

  return {
    transactionId,
    expiresAtText,
    totalPayment,
    qrDataUrl,
    paymentText: paymentText.slice(0, 1200)
  };
}

export async function POST(request) {
  const email = process.env.DAVPAY_EMAIL;
  const password = process.env.DAVPAY_PASSWORD;

  if (!email || !password) {
    return json({
      ok: false,
      code: 'DAVPAY_ENV_MISSING',
      message: 'DAVPAY_EMAIL dan DAVPAY_PASSWORD belum dipasang di Environment Variables Vercel.'
    }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return json({ ok: false, message: 'Body JSON tidak valid.' }, 400);
  }

  const amount = Number(payload?.amount);
  const orderId = String(payload?.orderId || '').slice(0, 80);

  if (!Number.isInteger(amount) || amount < 1000 || amount > 10000000) {
    return json({ ok: false, message: 'Nominal pembayaran tidak valid.' }, 400);
  }

  let browser;
  try {
    browser = await launchBrowser();
    const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
    const page = await context.newPage();

    await login(page, email, password);
    const payment = await generatePayment(page, amount);

    return json({
      ok: true,
      orderId,
      requestedAmount: amount,
      transactionId: payment.transactionId,
      totalPayment: payment.totalPayment,
      expiresAtText: payment.expiresAtText,
      qrImage: payment.qrDataUrl
    });
  } catch (error) {
    const code = error?.code || 'DAVPAY_AUTOMATION_ERROR';
    const status = code === 'PENDING_TOPUP_EXISTS' ? 409 : 502;
    return json({
      ok: false,
      code,
      message: error?.message || 'Gagal membuat QRIS DavPay.'
    }, status);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

export function GET() {
  return json({
    ok: true,
    service: 'Astrobot DavPay QRIS test endpoint',
    configured: Boolean(process.env.DAVPAY_EMAIL && process.env.DAVPAY_PASSWORD)
  });
}
