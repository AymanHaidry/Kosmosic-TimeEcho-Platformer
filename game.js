/* =====================================================
   TIME ECHO PLATFORMER — game.js
   Core game loop, camera, echo recording/playback,
   collision handling, state machine (menu/play/pause/
   complete/endless/shop/leaderboard)
   ===================================================== */
window.TEP = window.TEP || {};

TEP.Game = (() => {
  const C   = TEP.CONFIG;
  const R   = TEP.Renderer;

  // ── Canvas / context ──────────────────────────────
  let canvas, ctx, W, H;

  // ── Game state ─────────────────────────────────────
  let state  = 'menu'; // menu|loading|play|paused|complete|dead|shop|leaderboard|endless
  let level  = null;   // current level data (built from TEP.LEVELS or generated)
  let levelNum   = 1;
  let player     = null;
  let echoes     = [];   // [{actor, frames, frameIndex, color, startX, startY}]
  let recording  = false;
  let recFrames  = [];
  let recTimer   = 0;
  let recCorrupt = false;
  let recStartX  = 0;   // where recording begins
  let recStartY  = 0;   // where recording begins
  let levelTimer = 0;   // frames elapsed in this level run
  let coinsCollected = 0;
  let shardsCollected = 0;
  let prevKeys   = {};
  let keys       = {};
  let camX = 0, camY = 0;
  let completionData = null;
  let deathTimer = 0;
  let hintTimer  = 0;
  let deathMessage = '';   // random death message
  let shakeIntensity = 0;  // screen shake after death

  // Endless mode
  let endlessScore  = 0;
  let endlessActive = false;
  let endlessSeed   = 0;

  // Input
  function isDown(k) { return !!keys[k]; }
  function pressed(k) { return !!keys[k] && !prevKeys[k]; }

  // ── Camera ─────────────────────────────────────────
  function updateCamera() {
    const targetX = player.x - W / 3;
    const targetY = player.y - H / 2;
    camX += (targetX - camX) * 0.1;
    camY += (targetY - camY) * 0.1;
    camX = Math.max(0, Math.min(level.worldW - W, camX));
    camY = Math.max(0, Math.min(level.worldH - H, camY));
  }

  // ── Level loading ──────────────────────────────────
  function loadLevel(num, generated = false, seed = null) {
    levelNum = num;
    let def;
    if (generated || num > TEP.LEVELS.length) {
      def = TEP.generateLevel(num, seed || (num * 0x9e3779b1));
    } else {
      def = TEP.LEVELS[num - 1];
    }

    // Deep-copy so original definitions stay clean
    level = {
      ...def,
      platforms:      def.platforms.map(p => Object.assign(Object.create(Object.getPrototypeOf(p)), p)),
      switches:       def.switches.map(s => Object.assign(Object.create(Object.getPrototypeOf(s)), s)),
      doors:          def.doors.map(d => Object.assign(Object.create(Object.getPrototypeOf(d)), d)),
      enemies:        def.enemies.map(e => Object.assign(Object.create(Object.getPrototypeOf(e)), {...e})),
      spikes:         def.spikes.map(s => Object.assign(Object.create(Object.getPrototypeOf(s)), s)),
      lasers:         def.lasers.map(l => Object.assign(Object.create(Object.getPrototypeOf(l)), l)),
      coins:          def.coins.map(c => Object.assign(Object.create(Object.getPrototypeOf(c)), c)),
      shards:         def.shards.map(s => Object.assign(Object.create(Object.getPrototypeOf(s)), s)),
      pressurePlates: def.pressurePlates.map(p => Object.assign(Object.create(Object.getPrototypeOf(p)), p)),
      lava:           def.lava?.map(l => Object.assign(Object.create(Object.getPrototypeOf(l)), l)) || [],
      flagObj:        new TEP.Flag(def.goalPos[0], def.goalPos[1]),
    };

    // Start BGM for this level
    if (TEP.Sound?.startBGM) {
      try { TEP.Sound.startBGM(def.theme || 'cave'); } catch(e) { console.warn('BGM start failed', e); }
    }
    
    resetLevelState();
  }

  function resetLevelState() {
    const outfit = TEP.CONFIG.OUTFITS.find(o => o.id === (TEP.Auth.getProfile()?.outfit || 'default'));
    player = new TEP.Actor(level.start[0], level.start[1], { color: outfit?.color || '#f5c842' });
    echoes = [];
    recording  = false;
    recFrames  = [];
    recTimer   = 0;
    recCorrupt = false;
    recStartX  = 0;
    recStartY  = 0;
    levelTimer = 0;
    coinsCollected = 0;
    shardsCollected = 0;
    camX = Math.max(0, level.start[0] - W / 3);
    camY = Math.max(0, level.start[1] - H / 2);
    hintTimer = 200;
    deathTimer = 0;
    deathMessage = '';
    shakeIntensity = 0;
    // Reset collectibles
    level.coins.forEach(c  => c.collected = false);
    level.shards.forEach(s => s.collected = false);
    level.switches.forEach(s => s.active = false);
    level.doors.forEach(d   => { d.open = false; d._openAnim = 0; });
    level.pressurePlates.forEach(pp => { pp.active = false; pp.count = 0; });
    level.enemies.forEach(e => {
      e.dead = false;
      if (e.history) e.history = [];
      if (e.antiEcho) e.antiEcho = null;
    });
  }

  // ── Recording ──────────────────────────────────────
  function getRecordMax() {
    const pet = TEP.Auth.getPet?.();
    const petDef = C.PETS.find(p => p.id === pet);
    return C.MAX_RECORD_FRAMES + (petDef?.perk === 'recordTime' ? petDef.value : 0);
  }

  function startRecording() {
    recording  = true;
    recFrames  = [];
    recTimer   = 0;
    recCorrupt = false;
    recStartX  = player.x;  // capture starting position
    recStartY  = player.y;
  }

  function stopRecording() {
    recording = false;
    if (recFrames.length > 5) {
      spawnEcho();
    }
    recFrames = [];
  }

  function spawnEcho() {
    if (echoes.length >= C.MAX_ECHOES) echoes.shift(); // drop oldest
    const colorIdx = echoes.length % C.ECHO_COLORS.length;
    const color = C.ECHO_COLORS[colorIdx];
    const outfit = C.OUTFITS.find(o => o.id === (TEP.Auth.getProfile()?.outfit || 'default'));
    const echoColor = outfit
      ? `hsl(${outfit.echoHue}, 80%, 65%)`
      : color;
    echoes.push({
      actor: new TEP.Actor(recStartX, recStartY, { color: echoColor }),  // spawn from recording start
      frames: recFrames.slice(),
      frameIndex: 0,
      color: echoColor,
      startX: recStartX,   // record start position
      startY: recStartY,
    });
    TEP.Renderer.spawnParticles(recStartX + 12, recStartY + 18, echoColor, 12, 4);
    // Achievement check
    if (echoes.length === 1) TEP.Auth.unlockAchievement('first_echo');
    if (echoes.length === 3) TEP.Auth.unlockAchievement('squad');
  }

  // Called by EchoWisp when it corrupts a recording
  function corruptRecording() {
    recCorrupt = true;
    // inject random junk into last 40 frames
    const junk = Math.min(40, recFrames.length);
    for (let i = 0; i < junk; i++) {
      const idx = recFrames.length - junk + i;
      if (Math.random() < 0.5) {
        recFrames[idx] = {
          left:  Math.random() < 0.5,
          right: Math.random() < 0.5,
          jump:  Math.random() < 0.4,
        };
      }
    }
    // Force-stop after corruption
    setTimeout(() => { if (recording) stopRecording(); }, 500);
  }

  // ── Input snapshot ─────────────────────────────────
  function inputSnap() {
    return {
      left:  isDown('arrowleft') || isDown('a'),
      right: isDown('arrowright') || isDown('d'),
      jump:  isDown('arrowup')   || isDown('w') || isDown(' '),
    };
  }

  // ── Switches / Doors / Plates ──────────────────────
  function updateInteractables() {
    const actors = [player, ...echoes.map(e => e.actor).filter(a => !a.dead)];

    // Wisp bird pet can perch on switches
    const pet = TEP.Auth.getPet?.();
    const hasBird = pet === 'wisp_bird';

    // Reset
    level.switches.forEach(s => s.active = false);
    level.pressurePlates.forEach(pp => { pp.count = 0; pp.active = false; });

    for (const a of actors) {
      for (const sw of level.switches) {
        if (TEP.rectsOverlap(a, sw)) {
          sw.active = true;
        }
      }
      for (const pp of level.pressurePlates) {
        if (TEP.rectsOverlap(a, pp)) pp.count++;
      }
    }

    // Wisp bird: occasionally holds a nearby switch
    if (hasBird) {
      for (const sw of level.switches) {
        const dist = Math.hypot(player.x - sw.x, player.y - sw.y);
        if (dist < 60 && Math.floor(levelTimer / 30) % 2 === 0) sw.active = true;
      }
    }

    // Pressure plates
    level.pressurePlates.forEach(pp => {
      if (pp.count >= pp.required) pp.active = true;
    });

    // Open doors
    level.doors.forEach(d => {
      const sw  = level.switches.find(s => s.id === d.id);
      const pp  = level.pressurePlates.find(p => p.id === d.id);
      const open = (sw?.active || pp?.active) || false;
      d.update(open);
    });
  }

  // ── Collectibles ───────────────────────────────────
  function updateCollectibles() {
    const pets = TEP.Auth.getPet?.();
    const hasMagnet = pets === 'chrono_cat'; // minor bonus: pulls coins slightly
    for (const c of level.coins) {
      if (c.collected) continue;
      c.update();
      const dist = Math.hypot(player.x - c.x, player.y - c.y);
      if (hasMagnet && dist < 80) {
        c.x += (player.x - c.x) * 0.05;
        c.y += (player.y - c.y) * 0.05;
      }
      if (TEP.rectsOverlap(player, c)) {
        c.collected = true;
        coinsCollected++;
        TEP.Renderer.spawnParticles(c.x + 7, c.y + 7, '#ffd700', 6, 3);
      }
    }
    for (const s of level.shards) {
      if (s.collected) continue;
      s.update();
      if (TEP.rectsOverlap(player, s)) {
        s.collected = true;
        shardsCollected++;
        TEP.Renderer.spawnParticles(s.x + 7, s.y + 7, '#a78bfa', 8, 3);
      }
    }
  }

  // ── Enemy update ───────────────────────────────────
  function updateEnemies() {
    for (const en of level.enemies) {
      if (en.dead) continue;

      if (en instanceof TEP.EchoWisp) {
        en.update();
        // Check echo collision → sentinel rewind / wisp corrupt
        for (const echo of echoes) {
          if (echo.actor.dead) continue;
          if (TEP.rectsOverlap(en, echo.actor)) {
            en.triggerCorrupt();
            echo.actor.dead = true;
            TEP.Renderer.spawnParticles(en.x + 10, en.y + 10, '#cc44ff', 10, 3);
          }
        }
        en.touchPlayer(player, { recording, corruptRecording });

      } else if (en instanceof TEP.ChronoSentinel) {
        en.update(level.platforms, level.worldW, level.worldH);
        // Echo hits sentinel → rewind
        for (const echo of echoes) {
          if (echo.actor.dead) continue;
          if (TEP.rectsOverlap(en, echo.actor)) {
            en.hitByEcho();
            echo.actor.dead = true;
            TEP.Renderer.spawnParticles(en.x + 14, en.y + 22, '#ff8833', 10, 4);
          }
        }
        en.touchPlayer(player);

      } else if (en instanceof TEP.ParadoxBeast) {
        en.update(level.platforms, echoes, level.worldW, level.worldH);
        en.checkAntiEchoSpikes(level.spikes);
        en.touchPlayer(player);
      }
    }
  }

  // ── Hazards ────────────────────────────────────────
  function updateHazards() {
    for (const sp of level.spikes) {
      sp.check(player);
      for (const e of echoes) {
        if (!e.actor.dead) sp.check(e.actor);
      }
    }
    for (const l of level.lasers) {
      l.update();
      l.check(player);
    }
    // Lava hazards
    for (const lv of level.lava || []) {
      lv.update();
      lv.check(player);
      for (const e of echoes) {
        if (!e.actor.dead) lv.check(e.actor);
      }
    }
  }

  // ── Blocking doors ─────────────────────────────────
  function checkDoorBlock() {
    for (const d of level.doors) {
      if (d.open) continue;
      if (TEP.rectsOverlap(player, d)) {
        // Push player out
        if (player.x + player.w / 2 < d.x + d.w / 2) {
          player.x = d.x - player.w;
        } else {
          player.x = d.x + d.w;
        }
        player.vx = 0;
      }
    }
  }

  // ── Paradox pup hint ──────────────────────────────
  let pupHintTimer = 0;
  let pupHintText  = '';
  function updatePupHint() {
    if (TEP.Auth.getPet?.() !== 'paradox_pup') return;
    pupHintTimer = Math.max(0, pupHintTimer - 1);
    for (const sw of level.switches) {
      const dist = Math.hypot(player.x - sw.x, player.y - sw.y);
      if (dist < 180 && !sw.active) {
        pupHintTimer = 90;
        pupHintText  = '🐶 Switch nearby!';
      }
    }
  }

  // ── Goal check ─────────────────────────────────────
  function checkGoal() {
    level.flagObj.update();
    if (TEP.rectsOverlap(player, level.flagObj)) {
      const timeSec = Math.floor(levelTimer / 60);
      const score   = Math.max(0, 10000 - timeSec * 50 - echoes.length * 100)
                    + coinsCollected * 20 + shardsCollected * 60;
      completionData = { score, timeSec, echoes: echoes.length, coins: coinsCollected };
      state = 'complete';
      TEP.Renderer.triggerFlash('#2ecc71');
      TEP.Renderer.spawnParticles(player.x + 12, player.y + 18, '#2ecc71', 20, 5);

      // Persist
      TEP.Auth.submitScore?.(levelNum, score, timeSec, echoes.length);
      TEP.Auth.addCoins?.(coinsCollected + shardsCollected * 5);
      TEP.Auth.advanceLevel?.(levelNum + 1);

      if (timeSec < 20) TEP.Auth.unlockAchievement?.('speedrun');
      if (levelNum >= 5)  TEP.Auth.unlockAchievement?.('level5');
      if (levelNum >= 10) TEP.Auth.unlockAchievement?.('level10');
    }
  }

  // ── Death ──────────────────────────────────────────
  function triggerDeath() {
    if (deathTimer > 0) return;
    deathTimer = 80;
    shakeIntensity = 12;  // start screen shake
    // Pick random death message
    const msgs = C.DEATH_MESSAGES;
    deathMessage = msgs[Math.floor(Math.random() * msgs.length)];
    TEP.Renderer.triggerFlash('#e74c3c');
    TEP.Renderer.spawnParticles(player.x + 12, player.y + 18, '#ff4444', 16, 5);
    state = 'dead';
  }

  // ── Main update (play state) ───────────────────────
  function updatePlay() {
    levelTimer++;
    hintTimer = Math.max(0, hintTimer - 1);

    // E → toggle recording
    if (pressed('e')) {
      if (!recording) startRecording();
      else            stopRecording();
    }
    // R → restart
    if (pressed('r')) { resetLevelState(); state = 'play'; return; }
    // Escape → pause
    if (pressed('escape')) { state = 'paused'; return; }

    // Recording tick
    if (recording) {
      const maxF = getRecordMax();
      recFrames.push(inputSnap());
      recTimer++;
      if (recTimer >= maxF) stopRecording();
    }

    // Player physics
    player.applyInput(inputSnap());
    level.platforms.forEach(p => p.update());
    player.physics(level.platforms, level.worldW, level.worldH);

    if (player.dead) { triggerDeath(); return; }

    // Echoes
    for (let i = echoes.length - 1; i >= 0; i--) {
      const e = echoes[i];
      if (e.actor.dead) { echoes.splice(i, 1); continue; }
      const inp = e.frames[e.frameIndex] || { left:false, right:false, jump:false };
      e.actor.applyInput(inp);
      e.actor.physics(level.platforms, level.worldW, level.worldH);
      e.frameIndex++;
    }

    updateEnemies();
    updateHazards();
    checkDoorBlock();
    updateInteractables();
    updateCollectibles();
    updatePupHint();
    checkGoal();
    updateCamera();
    TEP.Renderer.updateParticles();
  }

  // ── Endless mode update ────────────────────────────
  function updateEndless() {
    // Reuses updatePlay but tracks endlessScore
    updatePlay();
    endlessScore = Math.floor(levelTimer / 60) * 10 + coinsCollected * 5;
  }

  // ── HUD drawing ────────────────────────────────────
  function drawHUD() {
    ctx.save();
    ctx.font = 'bold 11px "Press Start 2P", monospace';

    // Coin display
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(8, 8, 140, 26);
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`COINS ${coinsCollected}`, 14, 26);

    // Echo count
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(8, 38, 160, 26);
    ctx.fillStyle = '#7efff5';
    ctx.fillText(`ECHOES ${echoes.length}/${C.MAX_ECHOES}`, 14, 56);

    // Timer
    const timeSec = Math.floor(levelTimer / 60);
    const mm = String(Math.floor(timeSec / 60)).padStart(2, '0');
    const ss = String(timeSec % 60).padStart(2, '0');
    const timerW = 120;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(W - timerW - 8, 8, timerW, 26);
    ctx.fillStyle = '#cfe8ff';
    ctx.fillText(`${mm}:${ss}`, W - timerW, 26);

    // Level name
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    const nameW = 220;
    ctx.fillRect(W/2 - nameW/2, 8, nameW, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`LEVEL ${levelNum}: ${level.name.toUpperCase()}`, W/2, 26);
    ctx.textAlign = 'left';

    // Recording bar
    TEP.Renderer.drawRecordingBar(recording, recTimer, getRecordMax(), recCorrupt);

    // Hint
    if (hintTimer > 0 && level.hint) {
      const alpha = Math.min(1, hintTimer / 60);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(W/2 - 200, H - 50, 400, 32);
      ctx.fillStyle = '#ffd166';
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(level.hint, W/2, H - 29);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }

    // Pup hint
    if (pupHintTimer > 0) {
      ctx.globalAlpha = Math.min(1, pupHintTimer / 30);
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(W/2 - 100, H - 90, 200, 28);
      ctx.fillStyle = '#a78bfa';
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(pupHintText, W/2, H - 68);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }

    // Endless score
    if (endlessActive) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(8, 70, 160, 26);
      ctx.fillStyle = '#ff7ef4';
      ctx.font = 'bold 11px "Press Start 2P", monospace';
      ctx.fillText(`SCORE ${endlessScore}`, 14, 88);
    }

    ctx.restore();
  }

  // ── Overlay screens ────────────────────────────────
  function drawDeadScreen() {
    ctx.fillStyle = 'rgba(20,0,0,0.82)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 28px "Press Start 2P", monospace';
    ctx.fillText('YOU DIED', W/2, H/2 - 50);
    ctx.fillStyle = '#ff6666';
    ctx.font = 'bold 11px "Press Start 2P", monospace';
    // Wrap death message if too long
    const maxWidth = 70;
    if (deathMessage.length > maxWidth) {
      const mid = Math.floor(maxWidth / 2);
      const part1 = deathMessage.substring(0, mid);
      const part2 = deathMessage.substring(mid);
      ctx.fillText(part1, W/2, H/2 - 10);
      ctx.fillText(part2, W/2, H/2 + 8);
    } else {
      ctx.fillText(deathMessage, W/2, H/2);
    }
    ctx.fillStyle = '#ccc';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillText('Press R to restart', W/2, H/2 + 35);
    ctx.fillText('Press Esc for menu', W/2, H/2 + 55);
    ctx.textAlign = 'left';
  }

  function drawPauseScreen() {
    ctx.fillStyle = 'rgba(0,10,30,0.80)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#7efff5';
    ctx.font = 'bold 24px "Press Start 2P", monospace';
    ctx.fillText('PAUSED', W/2, H/2 - 40);
    ctx.fillStyle = '#cfe8ff';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('Press Esc to resume', W/2, H/2);
    ctx.fillText('Press R to restart level', W/2, H/2 + 30);
    ctx.textAlign = 'left';
  }

  function drawCompleteScreen() {
    const d = completionData;
    ctx.fillStyle = 'rgba(0,30,15,0.90)';
    ctx.fillRect(W/2 - 220, H/2 - 120, 440, 240);
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 3;
    ctx.strokeRect(W/2 - 220, H/2 - 120, 440, 240);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#2ecc71';
    ctx.font = 'bold 20px "Press Start 2P", monospace';
    ctx.fillText('LEVEL CLEAR!', W/2, H/2 - 75);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px "Press Start 2P", monospace';
    ctx.fillText(`SCORE: ${d.score}`, W/2, H/2 - 40);

    ctx.fillStyle = '#cfe8ff';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(`Time: ${d.timeSec}s   Echoes: ${d.echoes}   Coins: ${d.coins}`, W/2, H/2 - 5);

    ctx.fillStyle = '#7efff5';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText('[ENTER] Next Level', W/2, H/2 + 40);
    ctx.fillText('[R] Replay   [Esc] Menu', W/2, H/2 + 65);
    ctx.textAlign = 'left';
  }

  // ── Main loop ──────────────────────────────────────
  let lastTime = 0;
  function loop(now) {
    const dt = Math.min(50, now - lastTime);
    lastTime = now;

    // State machine
    switch (state) {
      case 'play':
        updatePlay();
        TEP.Renderer.drawWorld(
          { level, player, echoes },
          camX, camY,
          C.THEMES[level.theme] || C.THEMES.cave
        );
        drawHUD();
        break;

      case 'dead':
        deathTimer--;
        // Screen shake effect
        if (shakeIntensity > 0) {
          shakeIntensity *= 0.92;  // decay
        }
        const shakeX = (Math.random() - 0.5) * shakeIntensity;
        const shakeY = (Math.random() - 0.5) * shakeIntensity;
        
        if (deathTimer <= 0 && (pressed('r') || pressed('escape'))) {
          if (pressed('escape')) { state = 'menu'; TEP.UI.showMenu(); }
          else { resetLevelState(); state = 'play'; }
        }
        TEP.Renderer.drawWorld(
          { level, player, echoes },
          camX + shakeX,
          camY + shakeY,
          C.THEMES[level.theme] || C.THEMES.cave
        );
        drawDeadScreen();
        break;

      case 'paused':
        if (pressed('escape'))  { state = 'play'; }
        if (pressed('r'))       { resetLevelState(); state = 'play'; }
        TEP.Renderer.drawWorld({ level, player, echoes }, camX, camY, C.THEMES[level.theme] || C.THEMES.cave);
        drawPauseScreen();
        break;

      case 'complete':
        if (pressed('enter') || pressed('return')) {
          loadLevel(levelNum + 1);
          state = 'play';
        }
        if (pressed('r'))       { resetLevelState(); state = 'play'; }
        if (pressed('escape'))  { state = 'menu'; TEP.UI.showMenu(); }
        TEP.Renderer.drawWorld({ level, player, echoes }, camX, camY, C.THEMES[level.theme] || C.THEMES.cave);
        drawCompleteScreen();
        break;

      case 'endless':
        updateEndless();
        TEP.Renderer.drawWorld({ level, player, echoes }, camX, camY, C.THEMES[level.theme] || C.THEMES.cave);
        drawHUD();
        if (player.dead) {
          // Submit endless score
          TEP.Auth.submitScore?.(0, endlessScore, Math.floor(levelTimer/60), echoes.length, 'endless');
          if (endlessScore >= 100) TEP.Auth.unlockAchievement?.('endless100');
          state = 'dead';
        }
        break;
    }

    prevKeys = { ...keys };
    requestAnimationFrame(loop);
  }

  // ── Public API ─────────────────────────────────────
  return {
    init(c) {
      canvas = c;
      ctx    = c.getContext('2d');
      W      = c.width;
      H      = c.height;
      R.init(c);

      window.addEventListener('keydown', e => {
        keys[e.key.toLowerCase()] = true;
        if ([' ','arrowup','arrowleft','arrowright'].includes(e.key.toLowerCase()))
          e.preventDefault();
      });
      window.addEventListener('keyup', e => {
        keys[e.key.toLowerCase()] = false;
      });

      requestAnimationFrame(loop);
    },

    startLevel(num) {
      endlessActive = false;
      loadLevel(num);
      state = 'play';
    },

    startEndless(seed) {
      endlessActive = true;
      endlessScore  = 0;
      endlessSeed   = seed || TEP.getDailySeed();
      loadLevel(11, true, endlessSeed);
      state = 'endless';
    },

    getState()       { return state; },
    setStatePaused() { if (state === 'play') state = 'paused'; },
    resumeFromPause(){ if (state === 'paused') state = 'play'; },
    goMenu()         { state = 'menu'; },
    keys,
  };
})();
