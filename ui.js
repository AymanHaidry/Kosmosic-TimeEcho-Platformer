/* =====================================================
   TIME ECHO PLATFORMER — ui.js
   All HTML overlay panels: main menu, auth, shop,
   leaderboard, settings, achievements, toasts
   ===================================================== */
window.TEP = window.TEP || {};

TEP.UI = (() => {

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
    // Populate level select
    const grid = document.getElementById('level-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const maxUnlocked = TEP.Auth.isLoggedIn()
      ? (TEP.Auth.getLevel() || 1)
      : (parseInt(localStorage.getItem('tep_guest_level') || '1'));
    const totalLevels = TEP.LEVELS.length;
    for (let i = 1; i <= totalLevels + 2; i++) {
      const btn = document.createElement('button');
      btn.className = 'lvl-btn';
      if (i > maxUnlocked && i <= totalLevels) btn.classList.add('locked');
      if (i > totalLevels) btn.classList.add('generated');
      btn.innerHTML = i <= totalLevels
        ? `<span class="lvl-num">${i}</span><span class="lvl-name">${TEP.LEVELS[i-1]?.name || ''}</span>`
        : i === totalLevels + 1
          ? `<span class="lvl-num">∞</span><span class="lvl-name">ENDLESS</span>`
          : `<span class="lvl-num">📅</span><span class="lvl-name">DAILY</span>`;
      btn.onclick = () => {
        if (i <= totalLevels && i > maxUnlocked) { showToast('🔒 Complete earlier levels first!', '#ff7e7e'); return; }
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
        <div class="item-swatch" style="background:${o.color}"></div>
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
  };
})();
