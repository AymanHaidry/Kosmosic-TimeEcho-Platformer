/* =====================================================
   TIME ECHO PLATFORMER — entities.js
   Actor, Echo, EchoWisp, ChronoSentinel, ParadoxBeast,
   Platform (solid + moving), Spike, Coin, Shard, Flag
   ===================================================== */
window.TEP = window.TEP || {};

const C = TEP.CONFIG;

// ── Utility ───────────────────────────────────────────
function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}
TEP.rectsOverlap = rectsOverlap;

// ── Platform ──────────────────────────────────────────
class Platform {
  constructor(x, y, w, h, opts = {}) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.oneWay  = opts.oneWay  || false;
    this.moving  = opts.moving  || false;
    this.axis    = opts.axis    || 'x';
    this.range   = opts.range   || 80;
    this.speed   = opts.speed   || 1.2;
    this.originX = x;
    this.originY = y;
    this._t      = opts.phaseOffset || 0;
    this.vx = 0; this.vy = 0;
    this.crumble = opts.crumble || false;
    this.crumbleTimer = 0;
    this.crumbled = false;
    this.resetTimer = 0;
  }
  update() {
    if (this.crumbled) {
      this.resetTimer++;
      if (this.resetTimer > 180) { this.crumbled = false; this.crumbleTimer = 0; this.resetTimer = 0; }
      return;
    }
    if (this.crumbleTimer > 0) {
      this.crumbleTimer++;
      if (this.crumbleTimer > 60) { this.crumbled = true; return; }
    }
    if (!this.moving) { this.vx = 0; this.vy = 0; return; }
    const prev = this.axis === 'x' ? this.x : this.y;
    this._t += this.speed * 0.02;
    if (this.axis === 'x') {
      this.x = this.originX + Math.sin(this._t) * this.range;
      this.vx = this.x - prev;
      this.vy = 0;
    } else {
      this.y = this.originY + Math.sin(this._t) * this.range;
      this.vy = this.y - prev;
      this.vx = 0;
    }
  }
  triggerCrumble() {
    if (!this.crumble || this.crumbleTimer > 0) return;
    this.crumbleTimer = 1;
  }
}

// ── Actor (Player + Echoes base) ─────────────────────
class Actor {
  constructor(x, y, opts = {}) {
    this.x = x; this.y = y;
    this.w = 24; this.h = 36;
    this.vx = 0; this.vy = 0;
    this.onGround  = false;
    this.facingRight = true;
    this.dead = false;
    this.color = opts.color || '#f5c842';
    this.isGhost = opts.isGhost || false;
    this.trail   = []; // for motion blur
    this.ridingPlatform = null;
  }

  applyInput(inp) {
    const accel = this.onGround ? 0.7 : 0.35;
    const maxSpd = 5.5;
    if (inp.left)  {
      this.vx = Math.max(this.vx - accel, -maxSpd);
      this.facingRight = false;
    }
    if (inp.right) {
      this.vx = Math.min(this.vx + accel,  maxSpd);
      this.facingRight = true;
    }
    if (!inp.left && !inp.right) this.vx *= C.FRICTION;
    if (inp.jump && this.onGround) {
      this.vy = -12.5;
      this.onGround = false;
    }
  }

  physics(platforms, worldW, worldH) {
    // trail for motion blur
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > C.TRAIL_LEN) this.trail.shift();

    this.vy += C.GRAVITY;
    if (this.ridingPlatform) {
      this.x += this.ridingPlatform.vx;
      this.y += this.ridingPlatform.vy;
    }
    this.ridingPlatform = null;

    this.x += this.vx;
    this.y += this.vy;

    // world bounds
    if (this.x < 0)           { this.x = 0;            this.vx = 0; }
    if (this.x + this.w > worldW) { this.x = worldW - this.w; this.vx = 0; }
    if (this.y > worldH + 200) this.dead = true;

    this.onGround = false;
    for (const p of platforms) {
      if (p.crumbled) continue;
      if (!rectsOverlap(this, p)) continue;
      const prevBottom = this.y - this.vy + this.h;
      const prevTop    = this.y - this.vy;

      if (p.oneWay) {
        // only collide from above
        if (prevBottom <= p.y + 2 && this.vy >= 0) {
          this.y = p.y - this.h;
          this.vy = 0;
          this.onGround = true;
          this.ridingPlatform = p;
          p.triggerCrumble?.();
        }
      } else {
        const overlapX = Math.min(this.x + this.w, p.x + p.w) - Math.max(this.x, p.x);
        const overlapY = Math.min(this.y + this.h, p.y + p.h) - Math.max(this.y, p.y);
        if (overlapX < overlapY) {
          // side collision
          if (this.x + this.w / 2 < p.x + p.w / 2) { this.x = p.x - this.w; this.vx = 0; }
          else { this.x = p.x + p.w; this.vx = 0; }
        } else {
          if (prevBottom <= p.y + 4 && this.vy >= 0) {
            this.y = p.y - this.h;
            this.vy = 0;
            this.onGround = true;
            this.ridingPlatform = p;
            p.triggerCrumble?.();
          } else if (prevTop >= p.y + p.h - 4 && this.vy < 0) {
            this.y = p.y + p.h;
            this.vy = 0;
          }
        }
      }
    }
  }
}

// ── EchoWisp — Level 1 enemy ──────────────────────────
// Floats back and forth. Corrupts recordings on contact.
class EchoWisp {
  constructor(x, y, opts = {}) {
    this.x = x; this.y = y;
    this.w = 20; this.h = 20;
    this.originX = x; this.originY = y;
    this.range   = opts.range  || 90;
    this.speed   = opts.speed  || 1.0;
    this._t      = opts.phase  || 0;
    this.dead    = false;
    this.corrupt = false; // flashes when corruption triggered
    this.corruptTimer = 0;
    this.pulse = 0;
    this.glowRadius = 0;
  }
  update() {
    this._t += 0.025 * this.speed;
    this.x = this.originX + Math.sin(this._t)        * this.range;
    this.y = this.originY + Math.sin(this._t * 1.7)  * 25;
    this.pulse = (Math.sin(this._t * 3) + 1) * 0.5;
    this.glowRadius = 18 + this.pulse * 10;
    if (this.corruptTimer > 0) {
      this.corruptTimer--;
      this.corrupt = this.corruptTimer > 0;
    }
  }
  triggerCorrupt() {
    this.corruptTimer = 40;
    this.corrupt = true;
  }
  touchPlayer(player, game) {
    if (!rectsOverlap(this, player)) return;
    if (game.recording) {
      // inject corrupt frames
      game.corruptRecording();
      this.triggerCorrupt();
    } else {
      // just kills player
      player.dead = true;
    }
  }
}

// ── ChronoSentinel — Level 2 enemy ───────────────────
// Patrols. When hit by echo: rewinds itself 3 seconds.
class ChronoSentinel {
  constructor(x, y, opts = {}) {
    this.x = x; this.y = y;
    this.w = 28; this.h = 44;
    this.leftBound  = opts.leftBound  || x - 80;
    this.rightBound = opts.rightBound || x + 80;
    this.speed  = opts.speed || 1.4;
    this.dir    = 1;
    this.dead   = false;
    this.vx = this.dir * this.speed;
    this.vy = 0;
    this.onGround = false;
    // Position history for rewind
    this.history = [];
    this.rewinding = false;
    this.rewindTimer = 0;
    this.rewindFlash = 0;
  }
  update(platforms, worldW, worldH) {
    if (this.rewinding) {
      this.rewindFlash = Math.max(0, this.rewindFlash - 1);
      if (this.history.length > 0) {
        const snap = this.history.pop();
        this.x = snap.x; this.y = snap.y; this.dir = snap.dir;
        this.vx = snap.vx; this.vy = snap.vy;
      } else {
        this.rewinding = false;
      }
      return;
    }

    // Save history snapshot every frame, keep 3s = 180 frames
    this.history.push({ x:this.x, y:this.y, dir:this.dir, vx:this.vx, vy:this.vy });
    if (this.history.length > 180) this.history.shift();

    this.vy += C.GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    // Bounds patrol
    if (this.x < this.leftBound)  { this.dir =  1; this.vx = this.speed; }
    if (this.x + this.w > this.rightBound) { this.dir = -1; this.vx = -this.speed; }

    // Basic platform collision
    this.onGround = false;
    for (const p of platforms) {
      if (p.crumbled) continue;
      if (!rectsOverlap(this, p)) continue;
      const prevBottom = this.y - this.vy + this.h;
      if (prevBottom <= p.y + 4 && this.vy >= 0) {
        this.y = p.y - this.h; this.vy = 0; this.onGround = true;
      } else {
        // reverse direction on side hit
        this.dir *= -1; this.vx = this.dir * this.speed;
        if (this.x + this.w/2 < p.x + p.w/2) this.x = p.x - this.w;
        else this.x = p.x + p.w;
      }
    }

    if (this.x < 0)            { this.dir =  1; this.vx = this.speed; this.x = 0; }
    if (this.x + this.w > worldW) { this.dir = -1; this.vx = -this.speed; }
  }
  hitByEcho() {
    if (this.rewinding) return;
    this.rewinding = true;
    this.rewindFlash = 30;
  }
  touchPlayer(player) {
    if (rectsOverlap(this, player)) player.dead = true;
  }
}

// ── ParadoxBeast — Level 3 boss-style enemy ───────────
// Spawns an anti-echo mirroring the player's last echo.
class ParadoxBeast {
  constructor(x, y, opts = {}) {
    this.x = x; this.y = y;
    this.w = 36; this.h = 52;
    this.zoneLeft  = opts.zoneLeft  || x - 60;
    this.zoneRight = opts.zoneRight || x + 60;
    this.dead = false;
    this.vy = 0;
    this.onGround = false;
    this.copyTimer = 0;
    this.copyInterval = opts.copyInterval || 420; // every 7s copy last echo
    this.antiEcho = null;    // the hostile clone
    this.roarTimer = 0;      // visual roar effect
    this.shakePulse = 0;
    this._t = 0;
  }
  update(platforms, echoes, worldW, worldH) {
    this._t++;
    this.shakePulse = Math.max(0, this.shakePulse - 1);
    this.roarTimer  = Math.max(0, this.roarTimer  - 1);

    // Hover slightly
    this.vy += C.GRAVITY * 0.4;
    this.y  += this.vy;
    this.onGround = false;
    for (const p of platforms) {
      if (!rectsOverlap(this, p)) continue;
      const prevBottom = this.y - this.vy + this.h;
      if (prevBottom <= p.y + 4 && this.vy >= 0) {
        this.y = p.y - this.h; this.vy = 0; this.onGround = true;
      }
    }

    // Copy last echo
    this.copyTimer++;
    if (this.copyTimer >= this.copyInterval && echoes.length > 0) {
      this.copyTimer = 0;
      this.roarTimer = 60;
      const src = echoes[echoes.length - 1];
      this.antiEcho = {
        frames: src.frames.map(f => ({ left:f.right, right:f.left, jump:f.jump })),
        startX: src.startX,
        startY: src.startY,
        actor: new Actor(src.startX, src.startY, { color: '#ff3333', isGhost: false }),
        frameIndex: 0,
        hostile: true,
      };
    }

    // Update anti-echo
    if (this.antiEcho) {
      const ae = this.antiEcho;
      if (ae.frameIndex < ae.frames.length && !ae.actor.dead) {
        ae.actor.applyInput(ae.frames[ae.frameIndex]);
        ae.actor.physics(platforms, worldW, worldH);
        ae.frameIndex++;
      }
      if (ae.actor.dead || ae.frameIndex >= ae.frames.length + 60) {
        this.antiEcho = null;
      }
    }
  }
  touchPlayer(player) {
    if (rectsOverlap(this, player)) player.dead = true;
    if (this.antiEcho && !this.antiEcho.actor.dead) {
      if (rectsOverlap(this.antiEcho.actor, player)) player.dead = true;
    }
  }
  // Beast dies if its anti-echo lands on a spike
  checkAntiEchoSpikes(spikes) {
    if (!this.antiEcho) return;
    for (const s of spikes) {
      if (rectsOverlap(this.antiEcho.actor, s)) {
        this.antiEcho.actor.dead = true;
        this.dead = true; // beast dies when its own echo is destroyed
        return;
      }
    }
  }
}

// ── Spike ─────────────────────────────────────────────
class Spike {
  constructor(x, y, w, h, dir = 'up') {
    this.x = x; this.y = y; this.w = w; this.h = h; this.dir = dir;
  }
  check(actor) {
    if (rectsOverlap(this, actor)) actor.dead = true;
  }
}

// ── Laser ─────────────────────────────────────────────
class Laser {
  constructor(x, y, len, axis, id) {
    this.x = x; this.y = y;
    this.w = axis === 'x' ? len : 6;
    this.h = axis === 'x' ? 6   : len;
    this.axis = axis;
    this.id = id;
    this.active = true;
    this._t = 0;
  }
  update() { this._t++; }
  check(actor) {
    if (this.active && rectsOverlap(this, actor)) actor.dead = true;
  }
}

// ── Switch ────────────────────────────────────────────
class Switch {
  constructor(x, y, id) {
    this.x = x - 2; this.y = y - 12; this.w = 20; this.h = 12;
    this.id = id;
    this.active = false;
    this._t = 0;
  }
  update() { this._t++; }
}

// ── Door ──────────────────────────────────────────────
class Door {
  constructor(x, y, w, h, id, timed = 0) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.id = id;
    this.open = false;
    this.timed = timed; // frames door stays open after switch released
    this.timedCounter = 0;
    this._openAnim = 0;
  }
  update(open) {
    if (open) {
      this.timedCounter = this.timed || 0;
      this._openAnim = Math.min(1, this._openAnim + 0.08);
      this.open = true;
    } else if (this.timed > 0 && this.timedCounter > 0) {
      this.timedCounter--;
      this._openAnim = Math.min(1, this._openAnim + 0.08);
      this.open = true;
    } else {
      this._openAnim = Math.max(0, this._openAnim - 0.08);
      this.open = false;
    }
  }
}

// ── Coin / Shard ──────────────────────────────────────
class Collectible {
  constructor(x, y, type = 'coin') {
    this.x = x; this.y = y;
    this.w = 14; this.h = 14;
    this.type = type;  // 'coin' | 'shard'
    this.collected = false;
    this._t = Math.random() * Math.PI * 2;
    this.bobY = 0;
  }
  update() {
    this._t += 0.06;
    this.bobY = Math.sin(this._t) * 4;
  }
}

// ── Flag ──────────────────────────────────────────────
class Flag {
  constructor(x, y) {
    this.x = x; this.y = y; this.w = 28; this.h = 52;
    this._t = 0;
  }
  update() { this._t += 0.05; }
}

// ── Pressure Plate ────────────────────────────────────
class PressurePlate {
  constructor(x, y, id, required = 1) {
    this.x = x; this.y = y; this.w = 32; this.h = 8;
    this.id = id;
    this.required = required; // how many actors needed simultaneously
    this.count = 0;
    this.active = false;
  }
}

// ── Lava Pool ─────────────────────────────────────────
class Lava {
  constructor(x, y, w, h = 16) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.pulse = 0;
  }
  update() {
    this.pulse = (this.pulse + 0.05) % (Math.PI * 2);
  }
  check(actor) {
    if (rectsOverlap(actor, this)) {
      actor.dead = true;
    }
  }
}

// ── Export ────────────────────────────────────────────
TEP.Platform        = Platform;
TEP.Actor           = Actor;
TEP.EchoWisp        = EchoWisp;
TEP.ChronoSentinel  = ChronoSentinel;
TEP.ParadoxBeast    = ParadoxBeast;
TEP.Spike           = Spike;
TEP.Laser           = Laser;
TEP.Switch          = Switch;
TEP.Door            = Door;
TEP.Collectible     = Collectible;
TEP.Flag            = Flag;
TEP.PressurePlate   = PressurePlate;
TEP.Lava            = Lava;
