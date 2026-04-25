/* =====================================================
   TIME ECHO PLATFORMER — renderer.js
   Pixel-art drawing, parallax scrolling background,
   motion-blur trails, particles, all visual effects
   ===================================================== */
window.TEP = window.TEP || {};

TEP.Renderer = (() => {
  const C  = TEP.CONFIG;
  let canvas, ctx, W, H;

  // Particle pool
  const particles = [];

  function init(c) {
    canvas = c;
    ctx    = c.getContext('2d');
    W      = c.width;
    H      = c.height;
    ctx.imageSmoothingEnabled = false;
  }

  // ── Pixel helpers ──────────────────────────────────
  function px(x) { return Math.floor(x); }
  function pxRect(x, y, w, h, fill, stroke, sw = 2) {
    ctx.fillStyle = fill;
    ctx.fillRect(px(x), px(y), w, h);
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = sw;
      ctx.strokeRect(px(x) + 1, px(y) + 1, w - 2, h - 2);
    }
  }
  function pixBlock(x, y, size, color, darkColor) {
    // Bare Bones shader style: top/left lighter, bottom/right darker
    ctx.fillStyle = color;
    ctx.fillRect(px(x), px(y), size, size);
    ctx.fillStyle = darkColor || 'rgba(0,0,0,0.3)';
    ctx.fillRect(px(x), px(y) + size - 2, size, 2);
    ctx.fillRect(px(x) + size - 2, px(y), 2, size);
  }

  // ── Parallax background ────────────────────────────
  // Generates procedural hills using a seeded sine pattern
  function hillY(x, offsetX, baseY, amp, freq) {
    return baseY + Math.sin((x + offsetX) * freq) * amp
                 + Math.sin((x + offsetX) * freq * 2.3) * amp * 0.4;
  }

  function drawHillLayer(color, camX, parallax, baseY, amp, freq, tileW) {
    const off = (camX * parallax) % tileW;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-off - 4, H);
    for (let x = 0; x <= W + tileW; x += 4) {
      const wx = x - off;
      const hy = hillY(wx, 0, baseY, amp, freq);
      if (x === 0) ctx.lineTo(wx, hy);
      else         ctx.lineTo(wx, hy);
    }
    ctx.lineTo(W + tileW, H);
    ctx.closePath();
    ctx.fill();
  }

  function drawSky(theme) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, theme.skyTop);
    g.addColorStop(1, theme.skyBot);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawStars(camX) {
    // Static starfield
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    const seed = 12345;
    for (let i = 0; i < 60; i++) {
      const sx = ((seed * (i + 1) * 16807) & 0x7fffffff) % W;
      const sy = ((seed * (i + 1) * 48271) & 0x7fffffff) % (H * 0.55);
      const sz = (i % 3) + 1;
      ctx.fillRect(sx, sy, sz, sz);
    }
  }

  function drawBackground(camX, theme) {
    drawSky(theme);
    // Stars for dark themes
    if (theme.skyTop < '#444') drawStars(camX);

    // Parallax hills (4 layers)
    drawHillLayer(theme.far,  camX, 0.05, H * 0.55, H * 0.12, 0.003, W * 2);
    drawHillLayer(theme.mid,  camX, 0.15, H * 0.65, H * 0.10, 0.005, W * 2);
    drawHillLayer(theme.near, camX, 0.35, H * 0.75, H * 0.08, 0.007, W * 2);

    // Ambient glow overlay
    if (theme.ambience) {
      ctx.fillStyle = theme.ambience;
      ctx.fillRect(0, 0, W, H);
    }
  }

  // ── Platform drawing ───────────────────────────────
  function drawPlatform(p, camX, camY, theme) {
    const sx = p.x - camX;
    const sy = p.y - camY;
    if (sx + p.w < 0 || sx > W || sy + p.h < 0 || sy > H) return;

    const topC  = p.crumble
      ? (p.crumbleTimer > 0 ? '#cc6600' : p.crumbled ? 'transparent' : '#cc8800')
      : theme.platformTop;
    const sideC = theme.platformSide;
    const litC  = theme.platformLight;

    if (p.crumbled) return;

    // Side (below top surface)
    const sideH = Math.min(p.h + 8, 24);
    pxRect(sx, sy + p.h, p.w, sideH, sideC);

    // Top surface with pixel blocks
    const bSize = 8;
    for (let bx = 0; bx < p.w; bx += bSize) {
      const bw = Math.min(bSize, p.w - bx);
      ctx.fillStyle = ((bx / bSize) % 2 === 0) ? topC : litC;
      ctx.fillRect(px(sx + bx), px(sy), bw, p.h);
    }
    // Top highlight line
    ctx.fillStyle = litC;
    ctx.fillRect(px(sx), px(sy), p.w, 2);

    // Crumble shake
    if (p.crumbleTimer > 0) {
      ctx.fillStyle = 'rgba(255,150,0,0.4)';
      ctx.fillRect(px(sx), px(sy), p.w, p.h);
      // crack lines
      ctx.strokeStyle = '#ff6600';
      ctx.lineWidth = 1;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(px(sx + p.w * (i / 3)), px(sy));
        ctx.lineTo(px(sx + p.w * (i / 3) + 4), px(sy + p.h));
        ctx.stroke();
      }
    }

    // Moving platform indicator
    if (p.moving) {
      ctx.fillStyle = 'rgba(255,220,80,0.25)';
      ctx.fillRect(px(sx), px(sy), p.w, p.h);
    }
  }

  // ── Actor drawing (player & echoes) ───────────────
  function drawActor(actor, camX, camY, alpha = 1) {
    const sx = actor.x - camX;
    const sy = actor.y - camY;
    if (sx + actor.w < -10 || sx > W + 10) return;

    ctx.globalAlpha = alpha;
    const c = actor.color;

    // Body
    pxRect(sx + 2, sy + 12, actor.w - 4, actor.h - 12, c);
    // Head
    pxRect(sx + 4, sy, actor.w - 8, 14, c);
    // Visor / eye
    const eyeX = actor.facingRight ? sx + actor.w - 10 : sx + 2;
    pxRect(eyeX, sy + 4, 6, 5, '#000');
    pxRect(eyeX + 1, sy + 5, 3, 3, '#fff');
    // Legs
    pxRect(sx + 4, sy + actor.h - 10, 6, 10, c);
    pxRect(sx + actor.w - 10, sy + actor.h - 10, 6, 10, c);
    // Arms
    pxRect(sx, sy + 14, 4, 12, c);
    pxRect(sx + actor.w - 4, sy + 14, 4, 12, c);
    // Top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(px(sx + 5), px(sy + 1), actor.w - 10, 4);

    ctx.globalAlpha = 1;
  }

  function drawPet(petId, playerX, playerY, camX, camY) {
    if (!petId || petId === 'none') return;
    const petDef = C.PETS.find(p => p.id === petId);
    if (!petDef) return;

    // Draw pet emoji floating next to player
    const sx = playerX - camX;
    const sy = playerY - camY;
    const petX = sx + 30;  // offset to the right
    const petY = sy - 10;  // slightly above

    // Pet glow
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = petDef.color;
    ctx.filter = 'blur(4px)';
    ctx.fillRect(px(petX - 8), px(petY - 8), 20, 20);
    ctx.filter = 'none';
    ctx.restore();

    // Pet emoji
    ctx.globalAlpha = 1;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(petDef.emoji, px(petX), px(petY));

    // Pet name label (small)
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = petDef.color;
    ctx.fillText(petDef.name.split(' ')[0], px(petX), px(petY + 12));
  }

  function drawActorTrail(actor, camX, camY, color) {
    // Motion blur trail
    const trail = actor.trail || [];
    for (let i = 0; i < trail.length; i++) {
      const alpha = (i / trail.length) * 0.25;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      const sx = trail[i].x - camX + actor.w / 2 - 4;
      const sy = trail[i].y - camY + actor.h / 2 - 4;
      ctx.fillRect(px(sx), px(sy), 8, 8);
    }
    ctx.globalAlpha = 1;
  }

  // ── Echo drawing ───────────────────────────────────
  function drawEcho(echo, camX, camY) {
    const actor = echo.actor;
    const t     = Math.min(1, echo.frameIndex / Math.max(1, echo.frames.length));

    // Ghost glow
    const sx = actor.x - camX;
    const sy = actor.y - camY;
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = echo.color;
    ctx.filter = 'blur(6px)';
    ctx.fillRect(px(sx - 4), px(sy - 4), actor.w + 8, actor.h + 8);
    ctx.filter = 'none';
    ctx.restore();

    // Trail
    drawActorTrail(actor, camX, camY, echo.color);

    // Actor at 85% opacity
    drawActor(actor, camX, camY, 0.85);

    // Neon outline
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = echo.color;
    ctx.lineWidth   = 2;
    ctx.strokeRect(px(sx), py(sy), actor.w, actor.h);
    ctx.globalAlpha = 1;

    // Timeline bar above echo
    const bw = actor.w + 4;
    const bx = sx - 2;
    const by = sy - 8;
    pxRect(bx, by, bw, 4, 'rgba(255,255,255,0.1)');
    pxRect(bx, by, bw * t, 4, echo.color);
  }

  function py(y) { return Math.floor(y); }

  // ── EchoWisp drawing ───────────────────────────────
  function drawEchoWisp(w, camX, camY) {
    const sx = w.x - camX;
    const sy = w.y - camY;
    if (sx + w.w < 0 || sx > W) return;

    const r = w.glowRadius;
    // Glow
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = w.corrupt ? '#ff44ff' : '#aa44ff';
    ctx.filter = 'blur(8px)';
    ctx.beginPath();
    ctx.arc(sx + w.w/2, sy + w.h/2, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'none';
    ctx.restore();

    // Core orb (pixel art concentric squares)
    const cc = w.corrupt ? '#ff00ff' : '#cc44ff';
    const lc = w.corrupt ? '#ffaaff' : '#ee99ff';
    pxRect(sx + 4,  sy + 4,  12, 12, cc);
    pxRect(sx + 6,  sy + 6,  8,  8, lc);
    pxRect(sx + 8,  sy + 8,  4,  4, '#ffffff');
    // Sparkles
    for (let i = 0; i < 4; i++) {
      const ang = (Date.now() * 0.002 + i * Math.PI/2) % (Math.PI*2);
      const px2 = sx + w.w/2 + Math.cos(ang) * (r * 0.7);
      const py2 = sy + w.h/2 + Math.sin(ang) * (r * 0.7);
      ctx.fillStyle = lc;
      ctx.fillRect(Math.floor(px2), Math.floor(py2), 3, 3);
    }
  }

  // ── ChronoSentinel drawing ─────────────────────────
  function drawChronoSentinel(s, camX, camY) {
    const sx = s.x - camX;
    const sy = s.y - camY;
    if (sx + s.w < 0 || sx > W) return;

    const rewindAlpha = s.rewindFlash > 0 ? 0.6 + Math.sin(s.rewindFlash * 0.3) * 0.4 : 1;
    ctx.globalAlpha = rewindAlpha;

    const bodyC = '#e87820';
    const armorC = '#cc5500';

    // Legs
    pxRect(sx + 4,  sy + s.h - 14, 8, 14, bodyC);
    pxRect(sx + s.w - 12, sy + s.h - 14, 8, 14, bodyC);
    // Armored body
    pxRect(sx + 2,  sy + 18, s.w - 4, s.h - 32, armorC);
    pxRect(sx + 4,  sy + 20, s.w - 8, s.h - 36, '#ff8833');
    // Arms
    pxRect(sx - 4,  sy + 20, 8, 16, armorC);
    pxRect(sx + s.w - 4, sy + 20, 8, 16, armorC);
    // Head
    pxRect(sx + 4,  sy + 2, s.w - 8, 18, armorC);
    // Visor
    const vx = s.dir > 0 ? sx + s.w - 14 : sx + 4;
    pxRect(vx, sy + 7, 8, 5, '#ff4400');
    // Rewind flash effect
    if (s.rewindFlash > 0) {
      ctx.fillStyle = 'rgba(255,180,80,0.5)';
      ctx.fillRect(px(sx), px(sy), s.w, s.h);
    }

    ctx.globalAlpha = 1;
  }

  // ── ParadoxBeast drawing ───────────────────────────
  function drawParadoxBeast(b, camX, camY) {
    const sx = b.x - camX;
    const sy = b.y - camY;
    if (sx + b.w < 0 || sx > W) return;

    const roar = b.roarTimer > 0;
    const pulse = Math.sin(Date.now() * 0.005) * 0.15;

    // Glow aura
    ctx.save();
    ctx.globalAlpha = 0.2 + (roar ? 0.3 : 0);
    ctx.fillStyle = '#cc00ff';
    ctx.filter = 'blur(12px)';
    ctx.fillRect(px(sx - 8), px(sy - 8), b.w + 16, b.h + 16);
    ctx.filter = 'none';
    ctx.restore();

    // Body
    pxRect(sx + 2, sy + 14, b.w - 4, b.h - 14, '#8800cc');
    pxRect(sx + 4, sy + 16, b.w - 8, b.h - 18, '#aa22ee');
    // Head (horned)
    pxRect(sx + 6, sy, b.w - 12, 16, '#6600aa');
    // Horns
    ctx.fillStyle = '#ff44ff';
    ctx.fillRect(px(sx + 6), px(sy - 8), 4, 10);
    ctx.fillRect(px(sx + b.w - 10), px(sy - 8), 4, 10);
    // Eyes
    ctx.fillStyle = roar ? '#ffffff' : '#ff0066';
    ctx.fillRect(px(sx + 8),  px(sy + 4), 6, 6);
    ctx.fillRect(px(sx + b.w - 14), px(sy + 4), 6, 6);
    // Claws
    ctx.fillStyle = '#cc44ff';
    ctx.fillRect(px(sx - 6), px(sy + 20), 10, 8);
    ctx.fillRect(px(sx + b.w - 4), px(sy + 20), 10, 8);
    // Roar text
    if (roar) {
      ctx.fillStyle = '#ff00ff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('COPY!', px(sx + b.w/2 - 15), py(sy - 14));
    }

    // Draw anti-echo if active
    if (b.antiEcho && !b.antiEcho.actor.dead) {
      drawActorTrail(b.antiEcho.actor, camX, camY, '#ff3333');
      drawActor(b.antiEcho.actor, camX, camY, 0.85);
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = '#ff3333';
      ctx.lineWidth = 2;
      const aex = b.antiEcho.actor.x - camX;
      const aey = b.antiEcho.actor.y - camY;
      ctx.strokeRect(px(aex), py(aey), b.antiEcho.actor.w, b.antiEcho.actor.h);
      ctx.globalAlpha = 1;
    }
  }

  // ── Switch drawing ─────────────────────────────────
  function drawSwitch(sw, camX, camY) {
    const sx = sw.x - camX;
    const sy = sw.y - camY;
    pxRect(sx, sy + 6, sw.w, 6, '#334', '#1a1a33');
    const leverX = sw.active ? sx + sw.w - 8 : sx + 2;
    pxRect(leverX, sy, 8, 10, sw.active ? '#ffd166' : '#88aacc', '#1a1a33');
    if (sw.active) {
      ctx.fillStyle = 'rgba(255,210,80,0.3)';
      ctx.fillRect(px(sx - 2), py(sy - 2), sw.w + 4, sw.h + 4);
    }
  }

  // ── Door drawing ───────────────────────────────────
  function drawDoor(d, camX, camY) {
    const sx = d.x - camX;
    const sy = d.y - camY;
    const t  = d._openAnim;
    const visH = d.h * (1 - t);
    if (visH < 2) return;
    const alpha = 1 - t * 0.5;
    ctx.globalAlpha = alpha;
    pxRect(sx, sy + d.h - visH, d.w, visH,
      d.open ? 'rgba(60,200,120,0.7)' : '#3a4b6a', '#1b2430');
    if (!d.open) {
      // Door planks
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#2d3d55';
        ctx.fillRect(px(sx + 4), py(sy + d.h - visH + i * (visH/3) + 4), d.w - 8, 3);
      }
    }
    ctx.globalAlpha = 1;
  }

  // ── Spike drawing ──────────────────────────────────
  function drawSpike(sp, camX, camY) {
    const sx = sp.x - camX;
    const sy = sp.y - camY;
    ctx.fillStyle = '#e74c3c';
    const count = Math.floor(sp.w / 10);
    const sw2   = sp.w / count;
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      ctx.moveTo(px(sx + i * sw2), py(sy + sp.h));
      ctx.lineTo(px(sx + i * sw2 + sw2 / 2), py(sy));
      ctx.lineTo(px(sx + (i+1) * sw2), py(sy + sp.h));
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#ff6655';
    for (let i = 0; i < count; i++) {
      ctx.fillRect(px(sx + i * sw2 + 1), py(sy + 2), 2, 6);
    }
  }

  // ── Laser drawing ──────────────────────────────────
  function drawLaser(l, camX, camY) {
    if (!l.active) return;
    const sx = l.x - camX;
    const sy = l.y - camY;
    const flicker = Math.sin(Date.now() * 0.02) * 0.3;
    ctx.globalAlpha = 0.8 + flicker;
    ctx.fillStyle = '#ff2244';
    ctx.fillRect(px(sx), py(sy), l.w, l.h);
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#ff8899';
    ctx.fillRect(px(sx - 2), py(sy - 2), l.w + 4, l.h + 4);
    ctx.globalAlpha = 1;
  }

  // ── Lava drawing ──────────────────────────────────
  function drawLava(lava, camX, camY) {
    const sx = lava.x - camX;
    const sy = lava.y - camY;
    if (sx + lava.w < -20 || sx > W + 20 || sy + lava.h < -20 || sy > H + 20) return;

    // Lava surface with wave animation
    ctx.save();
    ctx.fillStyle = '#dd5500';
    ctx.fillRect(px(sx), py(sy), lava.w, lava.h);
    
    // Animated wave on surface
    const waveAmp = 2 + Math.sin(lava.pulse) * 1.5;
    ctx.strokeStyle = '#ff8833';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= lava.w; x += 4) {
      const waveY = sy + Math.sin((x + Date.now() * 0.005) * 0.1) * waveAmp;
      if (x === 0) ctx.moveTo(px(sx + x), py(waveY));
      else ctx.lineTo(px(sx + x), py(waveY));
    }
    ctx.stroke();

    // Glow effect
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ff4400';
    ctx.filter = 'blur(4px)';
    ctx.fillRect(px(sx - 4), py(sy - 4), lava.w + 8, lava.h + 8);
    ctx.filter = 'none';
    ctx.restore();
  }

  // ── Collectible drawing ────────────────────────────
  function drawCollectible(c, camX, camY) {
    if (c.collected) return;
    const sx = c.x - camX;
    const sy = c.y - camY + c.bobY;
    if (c.type === 'coin') {
      // Pixel coin
      ctx.fillStyle = '#ffd700';
      pxRect(sx + 2, sy, 10, 14, '#ffd700');
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(px(sx), py(sy + 2), 2, 10);
      ctx.fillRect(px(sx + 12), py(sy + 2), 2, 10);
      ctx.fillStyle = '#ffe066';
      ctx.fillRect(px(sx + 4), py(sy + 2), 6, 3);
      // Sparkle
      const sp = Math.floor(Date.now() / 300) % 4;
      if (sp === 0) ctx.fillRect(px(sx + 6), py(sy - 3), 2, 2);
    } else {
      // Shard — purple gem
      ctx.fillStyle = '#a78bfa';
      ctx.beginPath();
      ctx.moveTo(px(sx + 7), py(sy));
      ctx.lineTo(px(sx + 14), py(sy + 7));
      ctx.lineTo(px(sx + 7), py(sy + 14));
      ctx.lineTo(px(sx), py(sy + 7));
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c4b5fd';
      ctx.fillRect(px(sx + 6), py(sy + 2), 4, 4);
    }
  }

  // ── Pressure plate drawing ─────────────────────────
  function drawPressurePlate(pp, camX, camY) {
    const sx = pp.x - camX;
    const sy = pp.y - camY;
    pxRect(sx, sy + 4, pp.w, 4, pp.active ? '#ffd166' : '#6c7a96', '#333');
    pxRect(sx + 2, sy, pp.w - 4, 6, pp.active ? '#ffd166' : '#8899aa');
    if (pp.required > 1) {
      ctx.fillStyle = '#fff';
      ctx.font = '8px monospace';
      ctx.fillText(`×${pp.required}`, px(sx + pp.w/2 - 5), py(sy - 2));
    }
  }

  // ── Flag drawing ───────────────────────────────────
  function drawFlag(f, camX, camY) {
    const sx = f.x - camX;
    const sy = f.y - camY;
    // Pole
    ctx.fillStyle = '#aaa';
    ctx.fillRect(px(sx + 12), py(sy), 3, f.h);
    // Waving flag cloth
    const wave = Math.sin(f._t) * 4;
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.moveTo(px(sx + 15), py(sy + 2));
    ctx.lineTo(px(sx + 15 + wave + 18), py(sy + 6));
    ctx.lineTo(px(sx + 15 + wave + 14), py(sy + 16));
    ctx.lineTo(px(sx + 15), py(sy + 14));
    ctx.closePath();
    ctx.fill();
    // Star on flag
    ctx.fillStyle = '#fff';
    ctx.fillRect(px(sx + 20), py(sy + 7), 4, 4);
  }

  // ── Recording VHS bar ─────────────────────────────
  function drawRecordingBar(recording, frames, maxFrames, corrupt) {
    if (!recording) return;
    const barW = 180;
    const barH = 12;
    const bx = W / 2 - barW / 2;
    const by = 14;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(bx - 4, by - 4, barW + 8, barH + 8);
    ctx.fillStyle = corrupt ? '#ff00ff' : '#cc0000';
    ctx.fillRect(bx, by, barW * (frames / maxFrames), barH);
    ctx.strokeStyle = corrupt ? '#ff44ff' : '#ff4444';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, barW, barH);
    // REC indicator
    ctx.fillStyle = corrupt ? '#ff00ff' : '#ff3333';
    ctx.beginPath();
    ctx.arc(bx - 14, by + barH/2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(corrupt ? 'CORRUPT' : 'REC', bx - 38, by + 9);
  }

  // ── Particles ─────────────────────────────────────
  function spawnParticles(x, y, color, count = 8, speed = 3) {
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const spd = speed * (0.5 + Math.random() * 0.8);
      particles.push({
        x, y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 1,
        color,
        life: 40 + Math.random() * 20,
        maxLife: 60,
        size: 4 + Math.random() * 4,
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.15;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles(camX, camY) {
    for (const p of particles) {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle   = p.color;
      ctx.fillRect(Math.floor(p.x - camX), Math.floor(p.y - camY), p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  // ── Death / Respawn flash ─────────────────────────
  let flashTimer = 0;
  let flashColor = '#ffffff';
  function triggerFlash(color = '#ffffff') {
    flashTimer = 20;
    flashColor = color;
  }
  function drawFlash() {
    if (flashTimer <= 0) return;
    ctx.globalAlpha = flashTimer / 20 * 0.6;
    ctx.fillStyle   = flashColor;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    flashTimer--;
  }

  // ── Main draw call ─────────────────────────────────
  function drawWorld(state, camX, camY, theme) {
    const { level, player, echoes } = state;

    ctx.fillStyle = '#0f1724';
    ctx.fillRect(0, 0, W, H);

    drawBackground(camX, theme);

    // World elements
    for (const p of level.platforms)     drawPlatform(p, camX, camY, theme);
    for (const s of level.spikes)        drawSpike(s, camX, camY);
    for (const l of level.lasers)        drawLaser(l, camX, camY);
    for (const lv of level.lava || [])   drawLava(lv, camX, camY);
    for (const pp of level.pressurePlates) drawPressurePlate(pp, camX, camY);
    for (const c of level.coins)         drawCollectible(c, camX, camY);
    for (const sh of level.shards)       drawCollectible(sh, camX, camY);
    for (const sw of level.switches)     drawSwitch(sw, camX, camY);
    for (const d of level.doors)         drawDoor(d, camX, camY);

    drawFlag(level.flagObj, camX, camY);

    // Echoes (behind player)
    for (const e of echoes) drawEcho(e, camX, camY);

    // Enemies
    for (const en of level.enemies) {
      if (en.dead) continue;
      if (en instanceof TEP.EchoWisp)       drawEchoWisp(en, camX, camY);
      else if (en instanceof TEP.ChronoSentinel) drawChronoSentinel(en, camX, camY);
      else if (en instanceof TEP.ParadoxBeast)   drawParadoxBeast(en, camX, camY);
    }

    // Player trail + player
    drawActorTrail(player, camX, camY, TEP.Auth.getProfile()?.outfit
      ? TEP.CONFIG.OUTFITS.find(o => o.id === TEP.Auth.getProfile()?.outfit)?.color || '#f5c842'
      : '#f5c842');
    drawActor(player, camX, camY);
    // Draw pet companion
    const petId = TEP.Auth.getPet?.();
    if (petId) drawPet(petId, player.x, player.y, camX, camY);

    drawParticles(camX, camY);
    drawFlash();
  }

  return {
    init,
    drawBackground,
    drawWorld,
    drawRecordingBar,
    spawnParticles,
    updateParticles,
    triggerFlash,
    pxRect,
  };
})();
