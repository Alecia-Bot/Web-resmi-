/* ===========================
   AUTH.JS — Astrobot Login
   Firebase Google Sign-In + Username Setup
   ===========================

   SETUP (wajib):
   1. Buka https://console.firebase.google.com
   2. Buat project baru → pilih "Web app"
   3. Aktifkan Authentication → Google provider
   4. Aktifkan Firestore Database
   5. Copy firebaseConfig di bawah & ganti dengan punya kamu
   6. Di Firestore, tambahkan rule:
      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {
          match /users/{uid} {
            allow read, write: if request.auth != null && request.auth.uid == uid;
          }
          match /usernames/{username} {
            allow read: if request.auth != null;
            allow write: if request.auth != null && request.auth.uid == request.resource.data.uid;
          }
        }
      }
*/

// ─── FIREBASE CONFIG ───────────────────────────────────────────────────────
// Ganti dengan config dari Firebase Console kamu!
const firebaseConfig = {
  apiKey:            "AIzaSyBsoZ8DizsO2DBqqq4kP6GYV8EJXX6rV2U",
  authDomain:        "astrobot-f248f.firebaseapp.com",
  projectId:         "astrobot-f248f",
  storageBucket:     "astrobot-f248f.firebasestorage.app",
  messagingSenderId: "119300956122",
  appId:             "1:119300956122:web:cd072a0d4c433a9351eae3"
};
// ───────────────────────────────────────────────────────────────────────────

// Init Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();

// DOM refs
const authGate       = document.getElementById('authGate');
const loginScreen    = document.getElementById('loginScreen');
const usernameScreen = document.getElementById('usernameScreen');
const loadingScreen  = document.getElementById('loadingScreen');
const mainContent    = document.getElementById('mainContent');
const btnGoogleLogin = document.getElementById('btnGoogleLogin');
const btnSaveUsername= document.getElementById('btnSaveUsername');
const usernameInput  = document.getElementById('usernameInput');
const usernameHint   = document.getElementById('usernameHint');
const setupAvatar    = document.getElementById('setupAvatar');
const setupName      = document.getElementById('setupName');

// ─── SHOW HELPERS ──────────────────────────────────────────────────────────
function showScreen(name) {
  [loginScreen, usernameScreen, loadingScreen].forEach(s => {
    s.classList.remove('active');
    s.style.display = '';
  });
  const map = { login: loginScreen, username: usernameScreen, loading: loadingScreen };
  const el = map[name];
  if (el) { el.style.display = 'flex'; el.classList.add('active'); }
}

// ─── AUTH STATE LISTENER ──────────────────────────────────────────────────
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    showScreen('login');
    return;
  }

  showScreen('loading');

  try {
    const userDoc = await db.collection('users').doc(user.uid).get();

    if (userDoc.exists && userDoc.data().username) {
      // Sudah punya username → masuk langsung
      enterApp(user, userDoc.data());
    } else {
      // Belum punya username → setup dulu
      prepareUsernameScreen(user);
      showScreen('username');
    }
  } catch (e) {
    console.error('Auth check error:', e);
    showScreen('login');
  }
});

// ─── GOOGLE LOGIN ─────────────────────────────────────────────────────────
btnGoogleLogin.addEventListener('click', async () => {
  btnGoogleLogin.disabled = true;
  btnGoogleLogin.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
    Menghubungkan...`;

  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
    // onAuthStateChanged will handle the rest
  } catch (e) {
    console.error('Google login error:', e);
    btnGoogleLogin.disabled = false;
    btnGoogleLogin.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
      Masuk dengan Google`;
  }
});

// ─── USERNAME SCREEN PREP ─────────────────────────────────────────────────
function prepareUsernameScreen(user) {
  setupName.textContent = user.displayName ? user.displayName.split(' ')[0] : 'Kamu';

  // Avatar
  if (user.photoURL) {
    setupAvatar.innerHTML = `<img src="${user.photoURL}" alt="avatar" referrerpolicy="no-referrer">`;
  } else {
    const initials = (user.displayName || 'U').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
    setupAvatar.textContent = initials;
  }

  // Pre-fill suggestion from Google displayName
  if (user.displayName) {
    const suggested = user.displayName.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
    usernameInput.value = suggested;
    validateUsername(suggested);
  }
}

// ─── USERNAME VALIDATION ──────────────────────────────────────────────────
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

  if (val.length < 3) {
    setHint('3–20 karakter, huruf/angka/underscore saja', '');
    return;
  }
  if (!usernameRegex.test(val)) {
    setHint('Hanya boleh huruf kecil, angka, dan underscore (_)', 'error');
    return;
  }

  setHint('Mengecek ketersediaan...', '');

  checkTimeout = setTimeout(async () => {
    try {
      const snap = await db.collection('usernames').doc(val).get();
      if (snap.exists) {
        setHint('Username sudah dipakai, coba yang lain', 'error');
      } else {
        setHint('✓ Username tersedia!', 'success');
        btnSaveUsername.disabled = false;
      }
    } catch {
      setHint('Gagal mengecek, coba lagi', 'error');
    }
  }, 500);
}

function setHint(text, type) {
  usernameHint.textContent = text;
  usernameHint.className = 'auth-input-hint' + (type ? ` ${type}` : '');
}

// ─── SAVE USERNAME ────────────────────────────────────────────────────────
btnSaveUsername.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  if (!usernameRegex.test(username)) return;

  btnSaveUsername.disabled = true;
  btnSaveUsername.textContent = 'Menyimpan...';

  const user = auth.currentUser;
  if (!user) { showScreen('login'); return; }

  try {
    const batch = db.batch();

    // Reserve username
    batch.set(db.collection('usernames').doc(username), {
      uid: user.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Save user profile
    batch.set(db.collection('users').doc(user.uid), {
      username,
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    await batch.commit();

    enterApp(user, { username, displayName: user.displayName, photoURL: user.photoURL });
  } catch (e) {
    console.error('Save username error:', e);
    btnSaveUsername.disabled = false;
    btnSaveUsername.textContent = 'Simpan & Masuk';
    setHint('Gagal menyimpan, coba lagi', 'error');
  }
});

// ─── ENTER APP ────────────────────────────────────────────────────────────
function enterApp(user, userData) {
  authGate.classList.add('hidden');
  mainContent.style.display = 'block';
  injectUserBadge(user, userData);
}

// ─── USER BADGE IN HEADER ────────────────────────────────────────────────
function injectUserBadge(user, userData) {
  const hdrRight = document.querySelector('.hdr-right');
  if (!hdrRight) return;

  // Remove live pill to make room (keep it on desktop)
  const livePill = hdrRight.querySelector('.live-pill');

  // Build badge
  const wrap = document.createElement('div');
  wrap.style.position = 'relative';

  const avatarHtml = user.photoURL
    ? `<div class="user-badge-av"><img src="${user.photoURL}" alt="av" referrerpolicy="no-referrer"></div>`
    : `<div class="user-badge-av">${(userData.username || 'U')[0].toUpperCase()}</div>`;

  wrap.innerHTML = `
    <button class="user-badge" id="userBadgeBtn" onclick="toggleUserDropdown()">
      ${avatarHtml}
      <span>@${userData.username}</span>
      <i class="fas fa-chevron-down" style="font-size:.6rem;color:#666;margin-left:2px"></i>
    </button>
    <div class="user-dropdown" id="userDropdown">
      <div class="user-dropdown-item" style="pointer-events:none;opacity:.5;font-size:.72rem;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.06)">
        <i class="fas fa-user"></i> ${user.email || user.displayName}
      </div>
      <button class="user-dropdown-item danger" onclick="logoutUser()">
        <i class="fas fa-sign-out-alt"></i> Keluar
      </button>
    </div>`;

  // Insert before menu button
  const menuBtn = hdrRight.querySelector('.menu-btn');
  hdrRight.insertBefore(wrap, menuBtn);

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) {
      document.getElementById('userDropdown')?.classList.remove('open');
    }
  });
}

window.toggleUserDropdown = function() {
  document.getElementById('userDropdown')?.classList.toggle('open');
};

window.logoutUser = async function() {
  if (!confirm('Yakin mau keluar dari Astrobot?')) return;
  await auth.signOut();
  location.reload();
};
