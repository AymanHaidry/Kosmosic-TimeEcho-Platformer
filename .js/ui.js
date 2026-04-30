/* =====================================================
   TIME ECHO PLATFORMER — ui.js
   All HTML overlay panels: main menu, auth, shop,
   leaderboard, settings, achievements, toasts
   ===================================================== */
window.TEP = window.TEP || {};

TEP.UI = (() => {

  // ── Theme display data ─────────────────────────────
  const THEME_PRIMARY = {
    cave:          '#c49a20',
    neon_city:     '#6030ff',
    sunset_ruins:  '#e84800',
    crystal_sky:   '#55d4ff',
    haunted_forest:'#44cc22',
    frozen_peaks:  '#9ae4f5',
    lava_core:     '#dd3300',
    temple_gold:   '#d4aa55',
    paradox_void:  '#aa44ff',
    sky_islands:   '#aaccee',
    deep_ocean:    '#0099cc',
    desert_night:  '#ddaa44',
    blood_moon:    '#cc0040',
    time_rift:     '#00eecc',
    ember_ruins:   '#cc8833',
  };
  const THEME_EMOJIS = {
    cave:          '🪨',
    neon_city:     '🌆',
    sunset_ruins:  '🌅',
    crystal_sky:   '💎',
    haunted_forest:'🌲',
    frozen_peaks:  '❄️',
    lava_core:     '🌋',
    temple_gold:   '⛩️',
    paradox_void:  '🌀',
    sky_islands:   '☁️',
    deep_ocean:    '🌊',
    desert_night:  '🏜️',
    blood_moon:    '🩸',
    time_rift:     '⚡',
    ember_ruins:   '🔥',
  };
  const THEME_BG = {
    cave:          '#1a0a2e',
    neon_city:     '#060d22',
    sunset_ruins:  '#1a0533',
    crystal_sky:   '#030c1a',
    haunted_forest:'#050d05',
    frozen_peaks:  '#030d1a',
    lava_core:     '#0a0000',
    temple_gold:   '#0a0a05',
    paradox_void:  '#050010',
    sky_islands:   '#1a4aaa',
    deep_ocean:    '#000814',
    desert_night:  '#05030a',
    blood_moon:    '#0a0005',
    time_rift:     '#000a0a',
    ember_ruins:   '#100500',
  };

  // ── Toast system ──────────────────────────────────
  let toastQ = [];
  let toastActive = false;

  function showToast(msg, color = '#7efff5', duration = 2800) {
    toastQ.push({ msg, color, duration });
    if (!toastActive) processToast();
  }

  function processToast() {
    if (!toastQ.length) { toastActive = false; return; }
    toastActive = true;
    const { msg, color, duration } = toastQ.shift();
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.style.background = color;
    t.style.color = '#000';
    t.style.opacity = '1';
    t.style.transform = 'translateY(0)';
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(-16px)';
      setTimeout(processToast, 500);
    }, duration);
  }

  // ── Panel helpers ──────────────────────────────────
  function showPanel(id) {
    document.querySelectorAll('.tep-panel').forEach(p => p.classList.add('hidden'));
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  }

  function hideAll() {
    document.querySelectorAll('.tep-panel').forEach(p => p.classList.add('hidden'));
  }

  // ── Scroll to level select ─────────────────────────
  function _scrollToLevels() {
    const el = document.getElementById('level-select-title') || document.getElementById('level-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Auth panel ─────────────────────────────────────
  function showAuth(tab = 'login') {
    showPanel('auth-panel');
    switchAuthTab(tab);
  }

  function switchAuthTab(tab) {
    document.getElementById('auth-login-tab').classList.toggle('active', tab === 'login');
    document.getElementById('auth-reg-tab').classList.toggle('active',   tab === 'register');
    document.getElementById('auth-login-form').classList.toggle('hidden', tab !== 'login');
    document.getElementById('auth-reg-form').classList.toggle('hidden',   tab !== 'register');
    document.getElementById('auth-err').textContent = '';
  }

  async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-pass').value;
    const btn   = document.getElementById('login-btn');
    btn.disabled = true; btn.textContent = 'Logging in…';
    const res = await TEP.Auth.login(email, pass);
    btn.disabled = false; btn.textContent = 'LOGIN';
    if (res.ok) { hideAll(); updateNavBar(); showToast('👋 Welcome back, ' + TEP.Auth.getUsername()); showMenu(); }
    else document.getElementById('auth-err').textContent = res.msg;
  }

  async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-name').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const pass     = document.getElementById('reg-pass').value;
    const btn      = document.getElementById('reg-btn');
    btn.disabled = true; btn.textContent = 'Creating…';
    const res = await TEP.Auth.register(username, email, pass);
    btn.disabled = false; btn.textContent = 'CREATE ACCOUNT';
    if (res.ok) { hideAll(); updateNavBar(); showToast('🎉 Welcome, ' + TEP.Auth.getUsername()); showMenu(); }
    else document.getElementById('auth-err').textContent = res.msg;
  }

  // ── Nav bar ────────────────────────────────────────
  function updateNavBar() {
    const loggedIn  = TEP.Auth.isLoggedIn();
    const userArea  = document.getElementById('nav-user');
    const guestArea = document.getElementById('nav-guest');
    if (!userArea || !guestArea) return;
    if (loggedIn) {
      userArea.classList.remove('hidden');
      guestArea.classList.add('hidden');
      document.getElementById('nav-username').textContent = TEP.Auth.getUsername();
      document.getElementById('nav-coins').textContent    = '🪙 ' + TEP.Auth.getCoins();
    } else {
      userArea.classList.add('hidden');
      guestArea.classList.remove('hidden');
    }
  }

  // ── Main menu ──────────────────────────────────────
  function showMenu() {
    showPanel('main-menu');
    updateNavBar();

    const grid = document.getElementById('level-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const maxUnlocked = TEP.Auth.isLoggedIn()
      ? (TEP.Auth.getLevel() || 1)
      : (parseInt(localStorage.getItem('tep_guest_level') || '1'));
    const totalLevels = TEP.LEVELS?.length || 20;

    for (let i = 1; i <= totalLevels + 2; i++) {
      const btn = document.createElement('button');
      btn.className = 'lvl-btn';

      const lvlDef   = i <= totalLevels ? TEP.LEVELS[i - 1] : null;
      const theme    = lvlDef?.theme || 'cave';
      const color    = THEME_PRIMARY[theme]  || '#c49a20';
      const bgColor  = THEME_BG[theme]       || '#1a0a2e';
      const emoji    = THEME_EMOJIS[theme]   || '🎮';
      const isNight  = lvlDef?.isNight;
      const isLocked = i > maxUnlocked && i <= totalLevels;
      const isGen    = i > totalLevels;

      if (isLocked) btn.classList.add('locked');
      if (isGen)    btn.classList.add('generated');

      // Apply theme styling directly
      btn.style.background  = bgColor;
      btn.style.borderColor = isLocked ? 'rgba(42,42,90,0.5)' : `${color}55`;

      if (i <= totalLevels) {
        btn.innerHTML = `
          <span class="lvl-btn-stripe" style="background:${color};box-shadow:0 0 8px ${color}66"></span>
          <div class="lvl-btn-body">
            <span class="lvl-theme">${emoji}</span>
            <span class="lvl-num" style="color:${color};text-shadow:0 0 8px ${color}66">${i}</span>
            <span class="lvl-name">${lvlDef?.name || ''}</span>
            ${isNight ? '<span class="lvl-night">🌙</span>' : ''}
            ${isLocked ? '<span style="font-size:10px;opacity:0.5">🔒</span>' : ''}
          </div>`;
      } else if (i === totalLevels + 1) {
        btn.style.background  = '#050010';
        btn.style.borderColor = '#aa44ff66';
        btn.innerHTML = `
          <span class="lvl-btn-stripe" style="background:linear-gradient(90deg,#aa44ff,#6030ff);box-shadow:0 0 8px #aa44ff66"></span>
          <div class="lvl-btn-body">
            <span class="lvl-theme">♾️</span>
            <span class="lvl-num" style="color:#aa44ff;text-shadow:0 0 8px #aa44ff66;font-size:16px">∞</span>
            <span class="lvl-name">ENDLESS</span>
          </div>`;
      } else {
        btn.style.background  = '#050818';
        btn.style.borderColor = '#ffd70066';
        btn.innerHTML = `
          <span class="lvl-btn-stripe" style="background:linear-gradient(90deg,#ffd700,#ff8800);box-shadow:0 0 8px #ffd70066"></span>
          <div class="lvl-btn-body">
            <span class="lvl-theme">📅</span>
            <span class="lvl-num" style="color:#ffd700;text-shadow:0 0 8px #ffd70066;font-size:12px">DAY</span>
            <span class="lvl-name">DAILY</span>
          </div>`;
      }

      btn.onclick = () => {
        if (isLocked) { showToast('🔒 Complete earlier levels first!', '#ff7e7e'); return; }
        hideAll();
        if (i === totalLevels + 1) { TEP.Game.startEndless(); }
        else if (i === totalLevels + 2) { TEP.Game.startEndless(TEP.getDailySeed()); }
        else { TEP.Game.startLevel(i); }
      };

      grid.appendChild(btn);
    }
  }

  // ── Shop panel ─────────────────────────────────────
  function showShop() {
    showPanel('shop-panel');
    renderShop();
  }

  function renderShop() {
    const profile = TEP.Auth.getProfile();
    const coins   = TEP.Auth.getCoins();
    document.getElementById('shop-coins').textContent = `🪙 ${coins}`;

    // Outfits
    const oGrid = document.getElementById('outfit-grid');
    oGrid.innerHTML = '';
    TEP.CONFIG.OUTFITS.forEach(o => {
      const owned    = !profile || profile.owned_outfits?.includes(o.id);
      const equipped = profile?.outfit === o.id;
      const btn = document.createElement('div');
      btn.className = 'shop-item' + (equipped ? ' equipped' : '') + (owned ? '' : ' locked-item');
      btn.innerHTML = `
        <div class="item-swatch" style="background:${o.color};box-shadow:0 0 10px ${o.color}66"></div>
        <div class="item-name">${o.name}</div>
        <div class="item-cost">${owned ? (equipped ? '✅ ON' : '✔ OWNED') : '🪙 '+o.cost}</div>`;
      btn.onclick = async () => {
        if (!TEP.Auth.isLoggedIn()) { showAuth(); return; }
        if (equipped) return;
        if (!owned) {
          const ok = await TEP.Auth.spendCoins(o.cost);
          if (!ok) { showToast('Not enough coins!', '#ff7e7e'); return; }
          profile.owned_outfits.push(o.id);
          await TEP.Auth.saveProfile({ owned_outfits: profile.owned_outfits, outfit: o.id });
        } else {
          await TEP.Auth.saveProfile({ outfit: o.id });
        }
        showToast(`👕 Wearing ${o.name}!`);
        renderShop();
        updateNavBar();
      };
      oGrid.appendChild(btn);
    });

    // Pets
    const pGrid = document.getElementById('pet-grid');
    pGrid.innerHTML = '';
    TEP.CONFIG.PETS.forEach(p => {
      const owned    = profile?.owned_pets?.includes(p.id);
      const equipped = profile?.pet === p.id;
      const btn = document.createElement('div');
      btn.className = 'shop-item' + (equipped ? ' equipped' : '') + (owned ? '' : ' locked-item');
      btn.innerHTML = `
        <div class="item-emoji">${p.emoji}</div>
        <div class="item-name">${p.name}</div>
        <div class="item-desc">${p.desc}</div>
        <div class="item-cost">${owned ? (equipped ? '✅ ON' : '✔ OWNED') : '🪙 '+p.cost}</div>`;
      btn.onclick = async () => {
        if (!TEP.Auth.isLoggedIn()) { showAuth(); return; }
        if (equipped) { await TEP.Auth.saveProfile({ pet: null }); showToast('Pet unequipped'); renderShop(); return; }
        if (!owned) {
          const ok = await TEP.Auth.spendCoins(p.cost);
          if (!ok) { showToast('Not enough coins!', '#ff7e7e'); return; }
          profile.owned_pets.push(p.id);
          await TEP.Auth.saveProfile({ owned_pets: profile.owned_pets, pet: p.id });
        } else {
          await TEP.Auth.saveProfile({ pet: p.id });
        }
        showToast(`${p.emoji} ${p.name} equipped!`);
        renderShop();
      };
      pGrid.appendChild(btn);
    });
  }

  // ── Leaderboard panel ──────────────────────────────
  async function showLeaderboard() {
    showPanel('lb-panel');
    document.getElementById('lb-body').innerHTML = '<tr><td colspan="5">Loading…</td></tr>';
    const lvl    = parseInt(document.getElementById('lb-level-sel')?.value || '1');
    const mode   = document.getElementById('lb-mode-sel')?.value || 'campaign';
    const rows   = await TEP.Auth.getLeaderboard?.(lvl, mode, 15);
    const tbody  = document.getElementById('lb-body');
    if (!rows || !rows.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="color:#aaa">No scores yet — be first!</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map((r, i) => `
      <tr class="${i === 0 ? 'lb-gold' : i === 1 ? 'lb-silver' : i === 2 ? 'lb-bronze' : ''}">
        <td>${['🥇','🥈','🥉'][i] || (i+1)}</td>
        <td>${r.username}</td>
        <td>${r.score}</td>
        <td>${r.time_seconds}s</td>
        <td>${r.echoes_used}</td>
      </tr>`).join('');
  }

  // ── Achievements panel ─────────────────────────────
  function showAchievements() {
    showPanel('ach-panel');
    const profile = TEP.Auth.getProfile();
    const earned  = profile?.achievements || [];
    const grid    = document.getElementById('ach-grid');
    grid.innerHTML = '';
    TEP.CONFIG.ACHIEVEMENTS.forEach(a => {
      const done = earned.includes(a.id);
      const div  = document.createElement('div');
      div.className = 'ach-card' + (done ? ' done' : '');
      div.innerHTML = `
        <div class="ach-icon">${done ? '🏆' : '🔒'}</div>
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${a.desc}</div>
        <div class="ach-coins">+${a.coins} 🪙</div>`;
      grid.appendChild(div);
    });
  }

  // ── Controls/Help panel ────────────────────────────
  function showHelp() { showPanel('help-panel'); }

  // ── Expose ─────────────────────────────────────────
  return {
    showMenu,
    showAuth,
    switchAuthTab,
    handleLogin,
    handleRegister,
    showShop,
    showLeaderboard,
    showAchievements,
    showHelp,
    showToast,
    updateNavBar,
    hideAll,
    _scrollToLevels,
  };
})();
