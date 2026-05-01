/* =====================================================
   TIME ECHO PLATFORMER v3 — renderer.js (GLOW UPGRADE)
   ===================================================== */
window.TEP = window.TEP || {};

TEP.Renderer = (() => {
  const C = TEP.CONFIG;
  let canvas, ctx, W, H;
  const particles = [];

  let glowEnabled = true;

  function init(c) {
    canvas = c; ctx = c.getContext('2d');
    W = c.width; H = c.height;
    ctx.imageSmoothingEnabled = false;
  }

  function px(x) { return Math.floor(x); }
  function py(y) { return Math.floor(y); }

  // ── GLOBAL GLOW ─────────────────────────────
  function glow(x, y, w, h, color, intensity = 0.2) {
    if (!glowEnabled) return;
    ctx.globalAlpha = intensity;
    ctx.fillStyle = color;
    ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    ctx.globalAlpha = 1;
  }

  // ── BACKGROUND (NO NIGHT) ───────────────────
  function hillY(x, baseY, amp, freq) {
    return baseY + Math.sin(x * freq) * amp + Math.sin(x * freq * 2.3) * amp * 0.35;
  }

  function drawHillLayer(color, camX, parallax, baseY, amp, freq) {
    const off = camX * parallax;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W + 8; x += 4) {
      ctx.lineTo(x, hillY(x + off, baseY, amp, freq));
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
  }

  function drawStars() {} // ❌ disabled completely

  function drawBackground(camX, theme) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, theme.skyTop || '#6ec6ff');
    g.addColorStop(1, theme.skyBot || '#bfe9ff');

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    drawHillLayer(theme.far  || '#1a1a2e', camX, 0.04, H * 0.55, H * 0.12, 0.003);
    drawHillLayer(theme.mid  || '#22223b', camX, 0.12, H * 0.65, H * 0.10, 0.005);
    drawHillLayer(theme.near || '#2d2d44', camX, 0.28, H * 0.76, H * 0.09, 0.007);
  }

  // ── PLATFORM ────────────────────────────────
  function drawPlatform(p, camX, camY, theme) {
    if (p.crumbled) return;

    const sx = px(p.x - camX), sy = py(p.y - camY);

    glow(sx, sy, p.w, p.h, p.icy ? '#9ae4f5' : '#c49a20', 0.12);

    const topC  = p.icy ? '#9ae4f5' : theme.platformTop || '#7a5a10';
    const sideC = p.icy ? '#5ab0cc' : theme.platformSide || '#4a3508';

    ctx.fillStyle = sideC;
    ctx.fillRect(sx, sy + p.h, p.w, 10);

    ctx.fillStyle = topC;
    ctx.fillRect(sx, sy, p.w, p.h);
  }

  // ── LAVA (FULL GLOW) ────────────────────────
  function drawLava(lv, camX, camY) {
    const sx = px(lv.x - camX), sy = py(lv.y - camY);

    glow(sx, sy, lv.w, lv.h, '#ff4400', 0.35);

    ctx.fillStyle = '#cc3300';
    ctx.fillRect(sx, sy, lv.w, lv.h);

    ctx.fillStyle = '#ff5500';
    ctx.fillRect(sx, sy, lv.w, 4);
  }

  // ── SPIKE ────────────────────────────────────
  function drawSpike(s, camX, camY) {
    const sx = px(s.x - camX), sy = py(s.y - camY);
    const count = Math.max(1, Math.floor(s.w / 10));
    const sw2 = s.w / count;

    ctx.fillStyle = '#888fa0';
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      ctx.moveTo(px(sx + i * sw2), py(sy + s.h));
      ctx.lineTo(px(sx + i * sw2 + sw2 / 2), py(sy));
      ctx.lineTo(px(sx + i * sw2 + sw2), py(sy + s.h));
      ctx.closePath();
      ctx.fill();
    }
  }

  // ── LASER ────────────────────────────────────
  function drawLaser(l, camX, camY) {
    if (!l.active) return;
    const sx = px(l.x - camX), sy = py(l.y - camY);

    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#ff2244';
    ctx.fillRect(sx, sy, l.w, l.h);
    ctx.globalAlpha = 1;
  }

  // ── SWITCH / DOOR / FLAGS (UNCHANGED CORE) ──
  function drawSwitch(sw, camX, camY) {
    const sx = px(sw.x - camX), sy = py(sw.y - camY);
    ctx.fillStyle = sw.active ? '#88cc44' : '#6666aa';
    ctx.fillRect(sx, sy, sw.w, sw.h);
  }

  function drawDoor(d, camX, camY) {
    const sx = px(d.x - camX), sy = py(d.y - camY);
    ctx.fillStyle = d.open ? '#336633' : '#331100';
    ctx.fillRect(sx, sy, d.w, d.h);
  }

  function drawFlag(f, camX, camY) {
    const sx = px(f.x - camX), sy = py(f.y - camY);

    glow(sx, sy, f.w, f.h, '#2ecc71', 0.2);

    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(sx, sy, f.w, f.h);
  }

  // ── PLAYER + ACTOR GLOW ─────────────────────
  function drawActor(actor, camX, camY) {
    const sx = px(actor.x - camX);
    const sy = py(actor.y - camY);

    glow(sx, sy, actor.w, actor.h, actor.color || '#00d4ff', 0.05);

    ctx.fillStyle = actor.color || '#00d4ff';
    ctx.fillRect(sx, sy, actor.w, actor.h);
  }

  // ── ECHO ─────────────────────────────────────
  function drawEcho(echo, camX, camY) {
    const a = echo.actor;
    const sx = px(a.x - camX);
    const sy = py(a.y - camY);

    glow(sx, sy, a.w, a.h, echo.color, 0.22);

    ctx.globalAlpha = 0.8;
    ctx.fillStyle = echo.color;
    ctx.fillRect(sx, sy, a.w, a.h);
    ctx.globalAlpha = 1;
  }

  // ── PARTICLES (ADD LUMINOSITY) ──────────────
  function drawParticles(camX, camY) {
    ctx.globalCompositeOperation = 'lighter';

    for (const p of particles) {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.fillRect(px(p.x - camX), py(p.y - camY), p.size, p.size);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function spawnParticles(x, y, color, count = 8, speed = 3) {
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2;
      particles.push({
        x, y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        color,
        life: 60,
        maxLife: 60,
        size: 3
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawWorld(state, camX, camY, theme) {
    const { level, player, echoes } = state;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    drawBackground(camX, theme);

    for (const p of level.platforms) drawPlatform(p, camX, camY, theme);
    for (const lv of level.lava || []) drawLava(lv, camX, camY);

    for (const s of level.spikes) drawSpike(s, camX, camY);
    for (const l of level.lasers) drawLaser(l, camX, camY);

    drawFlag(level.flagObj, camX, camY);

    for (const e of echoes) drawEcho(e, camX, camY);

    drawActor(player, camX, camY);

    drawParticles(camX, camY);
  }

  return {
    init,
    drawWorld,
    drawActor,
    drawEcho,
    spawnParticles,
    updateParticles
  };
})();
