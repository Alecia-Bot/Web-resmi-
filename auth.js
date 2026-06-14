/* ===========================
   AUTH.JS — Astrobot Login
   Google Identity Services (GSI) — Tanpa Firebase
=========================== */

const GOOGLE_CLIENT_ID = '659348325698-dkmt115eklqolj268mgcq32fcsim0ukj.apps.googleusercontent.com';
const USERS_KEY   = 'astrobot_users';
const SESSION_KEY = 'astrobot_session';

// DOM refs
const authGate        = document.getElementById('authGate');
const loginScreen     = document.getElementById('loginScreen');
const usernameScreen  = document.getElementById('usernameScreen');
const loadingScreen   = document.getElementById('loadingScreen');
const btnGoogleLogin  = document.getElementById('btnGoogleLogin');
const btnSaveUsername = document.getElementById('btnSaveUsername');
const usernameInput   = document.getElementById('usernameInput');
const usernameHint    = document.getElementById('usernameHint');
const setupAvatar     = document.getElementById('setupAvatar');
const setupName       = document.getElementById('setupName');

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────
function _getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); } catch { return {}; }
}
function _saveUser(uid, data) {
  const users = _getUsers();
  users[uid] = { ...users[uid], ...data };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function _getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}
function _saveSession(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}
function _clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ─── SHOW HELPERS ─────────────────────────────────────────────────────────
function showScreen(name) {
  [loginScreen, usernameScreen, loadingScreen].forEach(s => {
    if (!s) return;
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const map = { login: loginScreen, username: usernameScreen, loading: loadingScreen };
  const el = map[name];
  if (el) { el.style.display = 'flex'; el.classList.add('active'); }
}

// ─── INIT — cek session tersimpan ────────────────────────────────────────
(function initAuth() {
  // Pastikan Google One Tap tidak auto-muncul
  if (window.google && google.accounts && google.accounts.id) {
    google.accounts.id.cancel();
    google.accounts.id.disableAutoSelect();
  }

  const session = _getSession();
  if (session && session.uid) {
    const userData = _getUsers()[session.uid];
    if (userData && userData.username) {
      _onFullyLoggedIn(session, userData);
      return;
    }
  }
  updatePanelUser(null);
})();

// ─── GOOGLE LOGIN ─────────────────────────────────────────────────────────
btnGoogleLogin.addEventListener('click', () => {
  btnGoogleLogin.disabled = true;
  btnGoogleLogin.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
    Menghubungkan...`;

  google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'openid email profile',
    callback: async (resp) => {
      if (resp.error) { _resetLoginBtn(); return; }
      try {
        const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${resp.access_token}` }
        });
        const profile = await r.json();
        await _handleGoogleProfile(profile);
      } catch (e) {
        console.error('Login error:', e);
        _resetLoginBtn();
      }
    }
  }).requestAccessToken();
});

async function _handleGoogleProfile(profile) {
  const session = {
    uid:     profile.sub,
    name:    profile.name,
    email:   profile.email,
    picture: profile.picture
  };
  _saveSession(session);
  _saveUser(session.uid, {
    displayName: profile.name,
    email:       profile.email,
    photoURL:    profile.picture
  });

  const existing = _getUsers()[session.uid];
  if (existing && existing.username) {
    _onFullyLoggedIn(session, existing);
  } else {
    if (authGate.style.display !== 'flex') {
      authGate.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
    prepareUsernameScreen(session);
    showScreen('username');
  }
}

function _resetLoginBtn() {
  btnGoogleLogin.disabled = false;
  btnGoogleLogin.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
    Masuk dengan Google`;
}

// ─── FULLY LOGGED IN ──────────────────────────────────────────────────────
function _onFullyLoggedIn(session, userData) {
  closeAuthGate();
  const merged = {
    uid:         session.uid,
    name:        session.name,
    displayName: userData.displayName || session.name,
    email:       session.email        || userData.email,
    photoURL:    userData.photoURL    || session.picture,
    picture:     session.picture      || userData.photoURL,
    username:    userData.username    || ''
  };
  updatePanelUser(merged);

  // Tampilkan tombol "Pesanan Masuk" jika owner
  if (merged.email === 'tika13593@gmail.com') {
    const ownerBtn = document.getElementById('panelOwnerBtn');
    if (ownerBtn) ownerBtn.style.display = 'flex';
    // Simpan UID owner ke adminConfig agar bisa dicari saat user kirim pesanan
    try {
      db.collection('adminConfig').doc('owner').set({ uid: session.uid, email: merged.email }, { merge: true });
    } catch(e) { console.warn('adminConfig error:', e); }
  }

  if (window._pendingOrder) {
    const p = window._pendingOrder;
    window._pendingOrder = null;
    _doOpenOrder(p.name, p.price, p.duration);
  }
  if (window._pendingWa) {
    const w = window._pendingWa;
    window._pendingWa = null;
    _sendToWa(w.nama, w.nomor, w.link, w.pkg, w.total);
  }
}

// ─── USERNAME SCREEN ──────────────────────────────────────────────────────
function prepareUsernameScreen(session) {
  const firstName = (session.name || 'Kamu').split(' ')[0];
  if (setupName) setupName.textContent = firstName;

  if (setupAvatar) {
    if (session.picture) {
      setupAvatar.innerHTML = `<img src="${session.picture}" alt="avatar" referrerpolicy="no-referrer">`;
    } else {
      setupAvatar.textContent = (session.name || 'U').charAt(0).toUpperCase();
    }
  }

  if (session.name && usernameInput) {
    const suggested = session.name.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
    usernameInput.value = suggested;
    validateUsername(suggested);
  }
}

// ─── USERNAME VALIDATION ─────────────────────────────────────────────────
const usernameRegex = /^[a-z0-9_]{3,20}$/;
let checkTimeout = null;

usernameInput.addEventListener('input', () => {
  const val = usernameInput.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
  usernameInput.value = val;
  clearTimeout(checkTimeout);
  validateUsername(val);
});

function validateUsername(val) {
  btnSaveUsername.disabled = true;
  if (val.length < 3) { setHint('3–20 karakter, huruf/angka/underscore saja', ''); return; }
  if (!usernameRegex.test(val)) { setHint('Hanya boleh huruf kecil, angka, dan underscore (_)', 'error'); return; }

  checkTimeout = setTimeout(() => {
    const users = _getUsers();
    const session = _getSession();
    const taken = Object.entries(users).some(([uid, u]) => u.username === val && uid !== session?.uid);
    if (taken) {
      setHint('Username sudah dipakai, coba yang lain', 'error');
    } else {
      setHint('✓ Username tersedia!', 'success');
      btnSaveUsername.disabled = false;
    }
  }, 400);
}

function setHint(text, type) {
  usernameHint.textContent = text;
  usernameHint.className = 'auth-input-hint' + (type ? ` ${type}` : '');
}

// ─── SAVE USERNAME ────────────────────────────────────────────────────────
btnSaveUsername.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (!usernameRegex.test(username)) return;

  btnSaveUsername.disabled = true;
  btnSaveUsername.textContent = 'Menyimpan...';

  const session = _getSession();
  if (!session) { showScreen('login'); return; }

  try {
    _saveUser(session.uid, { username });
    const userData = _getUsers()[session.uid];
    _onFullyLoggedIn(session, userData);
  } catch (e) {
    console.error('Save username error:', e);
    btnSaveUsername.disabled = false;
    btnSaveUsername.textContent = 'Simpan & Masuk';
    setHint('Gagal menyimpan, coba lagi', 'error');
  }
});
