/* =====================================================
   TIME ECHO PLATFORMER — levels.js
   10 hand-crafted campaign levels + seeded random
   level generator for endless/post-10 play.
   ===================================================== */
window.TEP = window.TEP || {};

const { Platform, Switch: Sw, Door, Spike, EchoWisp,
        ChronoSentinel, ParadoxBeast, Collectible, Flag,
        PressurePlate, Laser } = TEP;

// ── Level factory helpers ─────────────────────────────
function plat(x, y, w, h, opts)    { return new Platform(x, y, w, h, opts); }
function ground(worldW, y = 560)   { return plat(0, y, worldW, 40); }
function movPlat(x, y, w, axis, range, speed, phase) {
  return plat(x, y, w, 16, { moving:true, axis, range, speed, phaseOffset: phase || 0 });
}
function coin(x, y)    { return new Collectible(x, y, 'coin'); }
function shard(x, y)   { return new Collectible(x, y, 'shard'); }
function spike(x, y, w) { return new Spike(x, y, w, 16, 'up'); }
function wisp(x, y, range, speed) { return new EchoWisp(x, y, { range: range||90, speed: speed||1 }); }
function sentinel(x, y, lb, rb, spd) {
  return new ChronoSentinel(x, y, { leftBound:lb, rightBound:rb, speed:spd||1.4 });
}
function beast(x, y, zl, zr, ci) {
  return new ParadoxBeast(x, y, { zoneLeft:zl, zoneRight:zr, copyInterval:ci||420 });
}

// ── Level definitions ─────────────────────────────────
TEP.LEVELS = [

  // ── Level 1: "The Awakening" ─ tutorial, no enemies
  {
    num: 1, name: 'The Awakening',
    theme: 'cave', worldW: 2200, worldH: 600,
    start: [60, 490], goalPos: [2120, 480],
    platforms: [
      ground(2200, 560),
      plat(180, 460, 120, 16),
      plat(360, 380, 100, 16),
      plat(500, 300, 80,  16),
      plat(650, 380, 120, 16),
      plat(820, 440, 100, 16),
      plat(960, 360, 140, 16),
      plat(1160, 280, 100, 16),
      plat(1320, 360, 120, 16, { oneWay:true }),
      plat(1500, 440, 100, 16),
      plat(1680, 360, 100, 16),
      plat(1850, 440, 120, 16),
      plat(2000, 480, 180, 16),
    ],
    switches: [
      new Sw(700, 380, 'A'),
      new Sw(1000, 360, 'B'),
    ],
    doors: [
      new Door(1400, 400, 30, 140, 'A'),
      new Door(1900, 380, 30, 180, 'B'),
    ],
    enemies: [],
    spikes: [spike(430, 544, 60), spike(870, 544, 50)],
    pressurePlates: [],
    lasers: [],
    coins: [
      coin(220, 430), coin(390, 350), coin(530, 270), coin(690, 350),
      coin(870, 410), coin(1010, 330), coin(1200, 250), coin(1360, 330),
      coin(1540, 410), coin(1720, 330), coin(1890, 410), coin(2050, 450),
    ],
    shards: [shard(660, 350)],
    hint: 'Press E to record an echo. Stand on a switch, then spawn an echo to hold it!',
  },

  // ── Level 2: "Floatlands" ─ moving platforms
  {
    num: 2, name: 'Floatlands',
    theme: 'sunset', worldW: 2600, worldH: 600,
    start: [60, 490], goalPos: [2520, 440],
    platforms: [
      ground(2600, 560),
      plat(200, 460, 120, 16),
      movPlat(370, 380, 100, 'x', 80, 1.2),
      plat(560, 440, 80,  16),
      movPlat(700, 340, 90, 'y', 50, 1.0, 1),
      plat(840, 460, 100, 16),
      movPlat(1000, 360, 100, 'x', 100, 1.4),
      plat(1200, 440, 120, 16),
      movPlat(1390, 300, 80, 'y', 60, 1.1, 0.5),
      plat(1560, 420, 100, 16),
      movPlat(1720, 360, 90, 'x', 90, 1.3),
      plat(1920, 440, 120, 16),
      movPlat(2100, 320, 100, 'x', 80, 1.0, 0.8),
      plat(2300, 460, 120, 16),
      plat(2420, 440, 160, 16),
    ],
    switches: [new Sw(850, 460, 'A')],
    doors: [new Door(2180, 380, 30, 180, 'A', 180)],
    enemies: [],
    spikes: [spike(540, 544, 40), spike(1180, 544, 40), spike(1900, 544, 40)],
    pressurePlates: [new PressurePlate(610, 552, 'A', 1)],
    lasers: [],
    coins: [
      coin(250,430), coin(410,350), coin(600,410), coin(740,310),
      coin(880,430), coin(1050,330), coin(1240,410), coin(1430,270),
      coin(1600,390), coin(1760,330), coin(1960,410), coin(2140,290),
      coin(2340,430),
    ],
    shards: [shard(1440, 270)],
    hint: 'Use echoes on moving platforms — record the journey, not just the destination!',
  },

  // ── Level 3: "Wisp Woods" ─ Echo Wisps introduced
  {
    num: 3, name: 'Wisp Woods',
    theme: 'forest', worldW: 2800, worldH: 600,
    start: [60, 490], goalPos: [2720, 440],
    platforms: [
      ground(2800, 560),
      plat(160, 460, 120, 16),
      plat(340, 380, 100, 16),
      plat(500, 440, 80,  16),
      plat(650, 360, 120, 16),
      plat(830, 440, 80,  16),
      plat(980, 360, 100, 16),
      plat(1130, 280, 100, 16),
      plat(1300, 360, 120, 16),
      plat(1480, 440, 100, 16),
      plat(1660, 360, 100, 16),
      plat(1820, 440, 120, 16),
      plat(2000, 360, 100, 16),
      plat(2160, 440, 80,  16),
      movPlat(2300, 380, 100, 'x', 70, 1.1),
      plat(2520, 460, 160, 16),
      plat(2620, 440, 160, 16),
    ],
    switches: [new Sw(690, 360, 'A'), new Sw(1170, 280, 'B')],
    doors: [
      new Door(1480, 360, 30, 180, 'A'),
      new Door(2160, 360, 30, 180, 'B'),
    ],
    enemies: [
      wisp(460, 350, 80, 0.9),
      wisp(870, 410, 70, 1.1),
      wisp(1350, 330, 85, 0.8),
      wisp(1710, 340, 75, 1.2),
    ],
    spikes: [spike(500,544,50), spike(1100,544,50), spike(1800,544,50)],
    pressurePlates: [],
    lasers: [],
    coins: [
      coin(200,430), coin(380,350), coin(540,410), coin(690,330),
      coin(870,410), coin(1020,330), coin(1170,250), coin(1340,330),
      coin(1520,410), coin(1700,330), coin(1860,410), coin(2040,330),
      coin(2200,410), coin(2360,350), coin(2560,430),
    ],
    shards: [shard(1175, 250), shard(870, 340)],
    hint: 'Echo Wisps corrupt your recordings on touch! Avoid them while recording.',
  },

  // ── Level 4: "Crystal Abyss" ─ lasers + wisps
  {
    num: 4, name: 'Crystal Abyss',
    theme: 'crystal', worldW: 3000, worldH: 640,
    start: [60, 550], goalPos: [2920, 500],
    platforms: [
      ground(3000, 600),
      plat(200, 500, 120, 16), plat(380, 420, 100, 16),
      plat(540, 500, 80,  16), plat(700, 400, 120, 16),
      plat(880, 480, 80,  16), plat(1040, 380, 100, 16),
      plat(1220, 300, 80,  16), plat(1380, 380, 120, 16),
      movPlat(1560, 420, 100, 'x', 90, 1.3),
      plat(1740, 480, 100, 16), plat(1920, 380, 100, 16),
      movPlat(2100, 320, 100, 'y', 60, 1.0),
      plat(2280, 440, 120, 16), movPlat(2460, 360, 80, 'x', 70, 1.2),
      plat(2640, 460, 120, 16), plat(2800, 500, 180, 16),
    ],
    switches: [
      new Sw(740, 400, 'A'), new Sw(1260, 300, 'B'), new Sw(1960, 380, 'C'),
    ],
    doors: [
      new Door(1040, 340, 30, 140, 'A'),
      new Door(1740, 440, 30, 160, 'B'),
      new Door(2640, 420, 30, 180, 'C'),
    ],
    enemies: [
      wisp(460, 440, 80, 1.0), wisp(920, 420, 70, 1.2),
      wisp(1450, 350, 90, 0.9),
    ],
    spikes: [spike(520,584,40), spike(860,584,50), spike(2060,584,50)],
    pressurePlates: [new PressurePlate(900, 496, 'B', 1)],
    lasers: [
      new Laser(600, 420, 80, 'x', 'L1'),
      new Laser(1650, 380, 6, 'y', 'L2'),
    ],
    coins: Array.from({length:16}, (_,i) => coin(200 + i*170, 470 - (i%3)*40)),
    shards: [shard(1265, 270), shard(2110, 290)],
    hint: 'Multi-echo puzzle: hold switches with echoes while you dodge lasers!',
  },

  // ── Level 5: "Sentinel Station" ─ Chrono Sentinels
  {
    num: 5, name: 'Sentinel Station',
    theme: 'neon', worldW: 3200, worldH: 600,
    start: [60, 490], goalPos: [3120, 420],
    platforms: [
      ground(3200, 560),
      plat(180, 460, 140, 16), plat(380, 380, 120, 16),
      plat(560, 460, 100, 16), plat(730, 360, 140, 16),
      plat(950, 440, 120, 16), plat(1130, 340, 100, 16),
      plat(1310, 420, 120, 16), plat(1500, 320, 100, 16),
      movPlat(1680, 380, 100, 'x', 100, 1.4),
      plat(1880, 440, 140, 16), plat(2080, 340, 120, 16),
      plat(2280, 440, 100, 16), movPlat(2440, 360, 100, 'y', 70, 1.1),
      plat(2640, 440, 140, 16), plat(2840, 360, 120, 16),
      plat(3020, 440, 160, 16),
    ],
    switches: [new Sw(800, 360, 'A'), new Sw(1550, 320, 'B'), new Sw(2880, 360, 'C')],
    doors: [
      new Door(1130, 300, 30, 140, 'A'),
      new Door(2080, 300, 30, 140, 'B'),
      new Door(3020, 380, 30, 180, 'C'),
    ],
    enemies: [
      sentinel(500, 430, 440, 660, 1.4),
      sentinel(1100, 410, 950, 1280, 1.6),
      sentinel(2200, 410, 2080, 2480, 1.5),
      sentinel(2900, 330, 2840, 3020, 1.3),
    ],
    spikes: [spike(540,544,40), spike(1490,544,50), spike(2270,544,50)],
    pressurePlates: [new PressurePlate(1000, 456, 'A', 1)],
    lasers: [],
    coins: Array.from({length:18}, (_,i) => coin(180 + i*160, 430 - (i%4)*30)),
    shards: [shard(800, 330), shard(2450, 330)],
    hint: 'Chrono Sentinels REWIND when hit by echoes — use echoes as distractions!',
  },

  // ── Level 6: "Sky Citadel" ─ sky theme, pressure plates
  {
    num: 6, name: 'Sky Citadel',
    theme: 'sky', worldW: 3400, worldH: 600,
    start: [60, 490], goalPos: [3320, 380],
    platforms: [
      ground(3400, 560),
      plat(160, 460, 120, 16), movPlat(330, 380, 90, 'x', 80, 1.2),
      plat(520, 440, 80, 16), plat(670, 340, 120, 16),
      movPlat(850, 400, 90, 'y', 55, 1.1, 0.5),
      plat(1040, 420, 100, 16), plat(1210, 320, 120, 16),
      movPlat(1400, 360, 90, 'x', 100, 1.5),
      plat(1600, 440, 100, 16), plat(1780, 340, 100, 16),
      plat(1960, 420, 120, 16), movPlat(2150, 300, 90, 'y', 70, 1.0),
      plat(2340, 420, 100, 16), plat(2520, 340, 120, 16),
      movPlat(2720, 380, 90, 'x', 90, 1.3, 1),
      plat(2920, 440, 100, 16), plat(3100, 360, 120, 16),
      plat(3220, 380, 160, 16),
    ],
    switches: [new Sw(710, 340, 'A'), new Sw(1250, 320, 'B'), new Sw(2560, 340, 'C')],
    doors: [
      new Door(1040, 380, 30, 140, 'A'),
      new Door(2150, 260, 30, 160, 'B'),
      new Door(3100, 300, 30, 160, 'C'),
    ],
    enemies: [
      wisp(590, 410, 70, 1.0), sentinel(1060, 390, 1040, 1240, 1.4),
      wisp(1840, 310, 80, 1.1), sentinel(2480, 390, 2340, 2680, 1.5),
    ],
    spikes: [spike(500,544,50), spike(1600,544,50), spike(2900,544,50)],
    pressurePlates: [new PressurePlate(1080, 436, 'B', 2)],
    lasers: [new Laser(1980, 380, 6, 'y', 'SL1')],
    coins: Array.from({length:20}, (_,i) => coin(160 + i*160, 430 - (i%4)*35)),
    shards: [shard(1410, 330), shard(2730, 350)],
    hint: 'Pressure plate needs 2 echoes simultaneously! Time your recordings carefully.',
  },

  // ── Level 7: "Frozen Wastes" ─ crumble platforms
  {
    num: 7, name: 'Frozen Wastes',
    theme: 'frozen', worldW: 3400, worldH: 600,
    start: [60, 490], goalPos: [3320, 400],
    platforms: [
      ground(3400, 560),
      plat(180, 460, 110, 16), plat(340, 400, 80, 16, { crumble:true }),
      plat(480, 460, 100, 16), plat(640, 380, 90, 16, { crumble:true }),
      plat(800, 440, 100, 16), movPlat(960, 360, 90, 'x', 80, 1.3),
      plat(1160, 440, 100, 16), plat(1320, 360, 80, 16, { crumble:true }),
      plat(1480, 440, 100, 16), plat(1660, 360, 100, 16),
      plat(1840, 440, 80, 16, { crumble:true }),
      movPlat(2000, 380, 90, 'y', 60, 1.1),
      plat(2200, 440, 100, 16), plat(2380, 360, 90, 16, { crumble:true }),
      plat(2540, 440, 100, 16), plat(2720, 360, 100, 16),
      plat(2900, 440, 100, 16), movPlat(3060, 360, 90, 'x', 70, 1.2),
      plat(3180, 420, 200, 16),
    ],
    switches: [new Sw(680, 380, 'A'), new Sw(1700, 360, 'B'), new Sw(2760, 360, 'C')],
    doors: [
      new Door(1160, 400, 30, 160, 'A'),
      new Door(2380, 320, 30, 160, 'B'),
      new Door(3060, 320, 30, 160, 'C'),
    ],
    enemies: [
      sentinel(840, 410, 800, 1060, 1.5),
      wisp(1410, 400, 80, 1.1),
      sentinel(2080, 410, 2000, 2360, 1.6),
      wisp(2650, 330, 75, 1.0),
    ],
    spikes: [spike(430,544,60), spike(1140,544,50), spike(2540,544,50)],
    pressurePlates: [],
    lasers: [new Laser(1800, 400, 6, 'y', 'FL1'), new Laser(2700, 320, 80, 'x', 'FL2')],
    coins: Array.from({length:20}, (_,i) => coin(180 + i*156, 430 - (i%5)*30)),
    shards: [shard(960, 330), shard(3070, 330)],
    hint: 'Crumble platforms (orange) fall after you step on them — use echoes as scouts!',
  },

  // ── Level 8: "Lava Lair" ─ intense hazards
  {
    num: 8, name: 'Lava Lair',
    theme: 'lava', worldW: 3600, worldH: 640,
    start: [60, 560], goalPos: [3520, 460],
    platforms: [
      ground(3600, 616),
      plat(180, 500, 120, 16), plat(360, 420, 100, 16),
      movPlat(530, 480, 90, 'y', 60, 1.2),
      plat(720, 500, 80, 16), plat(880, 400, 100, 16),
      plat(1060, 480, 80, 16), movPlat(1220, 380, 90, 'x', 100, 1.4),
      plat(1440, 460, 100, 16), plat(1640, 360, 100, 16),
      plat(1840, 460, 80, 16), movPlat(2020, 380, 90, 'y', 70, 1.1, 1),
      plat(2220, 440, 100, 16), plat(2420, 340, 100, 16),
      movPlat(2610, 400, 90, 'x', 90, 1.3),
      plat(2810, 460, 100, 16), plat(3010, 360, 100, 16),
      plat(3200, 440, 80, 16), movPlat(3370, 380, 90, 'x', 80, 1.5),
      plat(3430, 460, 160, 16),
    ],
    switches: [new Sw(920, 400, 'A'), new Sw(1680, 360, 'B'), new Sw(3050, 360, 'C')],
    doors: [
      new Door(1220, 340, 30, 140, 'A'),
      new Door(2420, 300, 30, 160, 'B'),
      new Door(3370, 340, 30, 140, 'C'),
    ],
    enemies: [
      sentinel(800, 470, 720, 1060, 1.6),
      wisp(1520, 430, 80, 1.2),
      sentinel(2100, 410, 2020, 2310, 1.7),
      sentinel(3100, 330, 3010, 3360, 1.5),
    ],
    spikes: [spike(520,600,50), spike(1060,600,60), spike(2200,600,60), spike(2800,600,50)],
    pressurePlates: [new PressurePlate(1480, 476, 'A', 1)],
    lasers: [
      new Laser(760, 460, 6, 'y', 'LL1'),
      new Laser(1860, 420, 80, 'x', 'LL2'),
      new Laser(2850, 420, 6, 'y', 'LL3'),
    ],
    coins: Array.from({length:22}, (_,i) => coin(180 + i*156, 480 - (i%4)*35)),
    shards: [shard(1232, 350), shard(2620, 370), shard(3380, 350)],
    hint: 'Three switches, three echoes — coordinate your squad perfectly!',
  },

  // ── Level 9: "Paradox Forest" ─ Paradox Beast
  {
    num: 9, name: 'Paradox Forest',
    theme: 'forest', worldW: 3800, worldH: 640,
    start: [60, 560], goalPos: [3720, 480],
    platforms: [
      ground(3800, 616),
      plat(180, 520, 120, 16), plat(360, 440, 100, 16),
      plat(540, 520, 80, 16),  plat(700, 420, 120, 16),
      plat(900, 500, 100, 16), plat(1080, 400, 100, 16),
      movPlat(1270, 460, 90, 'x', 90, 1.2),
      plat(1480, 500, 100, 16), plat(1680, 380, 100, 16),
      plat(1880, 480, 100, 16), plat(2080, 360, 120, 16),
      movPlat(2290, 420, 90, 'y', 60, 1.0, 0.5),
      plat(2490, 480, 100, 16), plat(2700, 360, 120, 16),
      plat(2900, 460, 100, 16), plat(3100, 360, 120, 16),
      movPlat(3310, 420, 90, 'x', 80, 1.3),
      plat(3520, 480, 100, 16), plat(3620, 480, 180, 16),
    ],
    switches: [new Sw(740, 420, 'A'), new Sw(1120, 400, 'B'), new Sw(2740, 360, 'C')],
    doors: [
      new Door(1480, 460, 30, 160, 'A'),
      new Door(2290, 380, 30, 160, 'B'),
      new Door(3520, 440, 30, 180, 'C'),
    ],
    enemies: [
      sentinel(600, 490, 540, 820, 1.4),
      wisp(1400, 450, 80, 1.1),
      beast(2100, 340, 1960, 2280, 360),
      sentinel(3000, 430, 2900, 3200, 1.6),
    ],
    spikes: [spike(440,600,60), spike(1060,600,50), spike(2480,600,60), spike(3310,600,50)],
    pressurePlates: [new PressurePlate(1520, 516, 'B', 2)],
    lasers: [new Laser(1800, 440, 6, 'y', 'PL1'), new Laser(2900, 420, 80, 'x', 'PL2')],
    coins: Array.from({length:24}, (_,i) => coin(180 + i*152, 490 - (i%5)*30)),
    shards: [shard(1680, 350), shard(2710, 330), shard(3325, 390)],
    hint: 'The Paradox Beast copies your echoes as weapons! Lure its anti-echo onto spikes.',
  },

  // ── Level 10: "Paradox Nexus" ─ boss finale
  {
    num: 10, name: 'Paradox Nexus',
    theme: 'paradox', worldW: 4000, worldH: 640,
    start: [60, 560], goalPos: [3920, 460],
    platforms: [
      ground(4000, 616),
      plat(180, 520, 120, 16), plat(380, 440, 100, 16),
      movPlat(560, 500, 90, 'x', 80, 1.2),
      plat(760, 420, 120, 16), plat(960, 500, 80, 16),
      movPlat(1120, 400, 90, 'y', 70, 1.1),
      plat(1340, 460, 100, 16), plat(1560, 360, 100, 16),
      movPlat(1760, 440, 90, 'x', 100, 1.5),
      plat(1980, 500, 100, 16), plat(2200, 380, 120, 16),
      movPlat(2420, 440, 90, 'y', 60, 1.0, 0.8),
      plat(2640, 500, 100, 16), plat(2860, 380, 120, 16),
      movPlat(3080, 440, 90, 'x', 90, 1.3),
      plat(3300, 500, 100, 16), plat(3520, 380, 120, 16),
      movPlat(3730, 420, 90, 'x', 80, 1.4),
      plat(3820, 460, 240, 16),
    ],
    switches: [
      new Sw(800, 420, 'A'), new Sw(1600, 360, 'B'),
      new Sw(2900, 380, 'C'), new Sw(3560, 380, 'D'),
    ],
    doors: [
      new Door(1340, 420, 30, 140, 'A'),
      new Door(2200, 340, 30, 140, 'B'),
      new Door(3300, 460, 30, 160, 'C'),
      new Door(3730, 380, 30, 140, 'D'),
    ],
    enemies: [
      sentinel(700, 490, 560, 960, 1.5),
      wisp(1250, 430, 80, 1.2),
      beast(2300, 360, 2100, 2560, 300),
      sentinel(2800, 350, 2640, 3070, 1.7),
      beast(3600, 360, 3400, 3800, 280),
    ],
    spikes: [spike(540,600,60), spike(1140,600,60), spike(2080,600,70), spike(3100,600,60)],
    pressurePlates: [
      new PressurePlate(2000, 516, 'C', 2),
      new PressurePlate(2660, 516, 'D', 3),
    ],
    lasers: [
      new Laser(960, 460, 6, 'y', 'NL1'),
      new Laser(1780, 400, 80, 'x', 'NL2'),
      new Laser(2440, 400, 6, 'y', 'NL3'),
      new Laser(3090, 400, 80, 'x', 'NL4'),
    ],
    coins: Array.from({length:28}, (_,i) => coin(180 + i*136, 490 - (i%5)*30)),
    shards: [
      shard(810, 390), shard(1610, 330),
      shard(2910, 350), shard(3570, 350),
    ],
    hint: 'The final paradox. Master ALL your echoes. Record, coordinate, conquer.',
  },
];

// ── Seeded Random Number Generator (Mulberry32) ───────
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ── Random Level Generator ─────────────────────────────
TEP.generateLevel = function(levelNum, seed) {
  const rng   = mulberry32(seed || (levelNum * 0x9e3779b1));
  const rand  = (min, max) => min + Math.floor(rng() * (max - min + 1));
  const rf    = (min, max) => min + rng() * (max - min);

  const themeKeys = Object.keys(TEP.CONFIG.THEMES);
  const theme     = themeKeys[rand(0, themeKeys.length - 1)];
  const difficulty = Math.min(1, (levelNum - 10) / 20); // 0→1 over levels 10-30

  const worldW = 2800 + rand(0, 1200);
  const worldH = 600;
  const groundY = 560;

  // Create ground as multiple segments (allows lava pits)
  const platforms = [];
  const lava = [];
  let gx = 0;
  while (gx < worldW) {
    let segW = rand(200, 600);
    if (gx + segW > worldW) segW = worldW - gx;
    // occasional gap -> lava pool
    let gapW = 0;
    if (rng() < 0.22 + difficulty * 0.25) gapW = rand(80, 220);
    platforms.push(plat(gx, groundY, segW, 40));
    if (gapW > 0 && gx + segW + gapW < worldW) {
      lava.push(new TEP.Lava(gx + segW, groundY - 16, gapW, 16));
    }
    gx += segW + gapW;
    // safety
    if (segW <= 0) break;
  }

  const spikes = [], enemies = [], coins = [], shards = [];
  const switches = [], doors = [], pressurePlates = [];

  // Generate platform chain ensuring reachable path
  let curX = 100, curY = 480;
  const segments = [];
  while (curX < worldW - 200) {
    let gap  = rand(60, 130 + difficulty * 80);
    // enforce a maximum horizontal gap based on difficulty so jumps remain reasonable
    const maxGap = 160 + Math.floor(difficulty * 120);
    if (gap > maxGap) gap = maxGap;
    const dY   = rand(-100, 80);
    const newY = Math.max(200, Math.min(500, curY + dY));
    const pw   = rand(70, 150);
    const moving = rng() < 0.25 + difficulty * 0.2;
    const crumble = rng() < 0.15 * difficulty;

    curX += gap;
    if (curX + pw > worldW - 200) break;

    const opts = {};
    if (moving) {
      opts.moving = true;
      opts.axis   = rng() < 0.5 ? 'x' : 'y';
      opts.range  = rand(50, 100);
      opts.speed  = rf(0.9, 1.6);
    }
    if (crumble) opts.crumble = true;

    platforms.push(plat(curX, newY, pw, 16, opts));
    segments.push({ x: curX, y: newY, w: pw });

    // spike between platforms (difficulty scaled)
    if (rng() < 0.3 + difficulty * 0.3) {
      const sx = Math.max(50, curX - gap / 2);
      spikes.push(spike(sx, groundY - 16, rand(30, 60)));
    }
    // coin on platform
    if (rng() < 0.7) coins.push(coin(curX + pw / 2 - 7, newY - 24));
    // shard rarely
    if (rng() < 0.1) shards.push(shard(curX + pw / 2 - 7, newY - 24));
    // enemy
    if (segments.length >= 3 && rng() < 0.2 + difficulty * 0.3) {
      const enemyType = difficulty < 0.3 ? 0 : difficulty < 0.7 ? rand(0, 1) : rand(0, 2);
      if (enemyType === 0) {
        enemies.push(wisp(curX + pw / 2, newY - 50, rand(60, 100), rf(0.8, 1.3)));
      } else if (enemyType === 1) {
        enemies.push(sentinel(curX + pw / 2, newY - 44, curX, curX + pw, rf(1.2, 1.8)));
      } else {
        enemies.push(beast(curX + pw / 2, newY - 52, curX - 30, curX + pw + 30, rand(300, 480)));
      }
    }

    curY = newY;
  }

  // Place 2–3 switches + doors along the path
  const swCount = rand(1, 3);
  const swSegments = [];
  while (swSegments.length < swCount && segments.length > swCount + 2) {
    const idx = rand(1, segments.length - 2);
    if (!swSegments.includes(idx)) swSegments.push(idx);
  }
  swSegments.sort((a,b)=>a-b);
  const ids = ['A','B','C'];
  swSegments.forEach((segIdx, i) => {
    const seg = segments[segIdx];
    const id  = ids[i];
    switches.push(new Sw(seg.x + seg.w / 2, seg.y, id));
    // door somewhere ahead
    const dSeg = segments[Math.min(segments.length - 1, segIdx + rand(1,3))];
    if (dSeg) doors.push(new Door(dSeg.x - 30, dSeg.y - 160, 30, 160, id));
  });

  const lastSeg = segments[segments.length - 1];
  const goalX = lastSeg ? lastSeg.x + rand(20, lastSeg.w - 40) : worldW - 80;
  const goalY = lastSeg ? lastSeg.y - 52 : groundY - 52;

  return {
    num: levelNum,
    name: `Sector ${levelNum}`,
    theme,
    worldW, worldH,
    start: [60, groundY - 50],
    goalPos: [goalX, goalY],
    platforms, switches, doors, enemies, spikes,
    pressurePlates, lasers: [],
    lava,
    coins, shards,
    generated: true,
    seed,
    hint: 'Generated level — master your echoes to reach the goal!',
  };
};

// Ensure we have at least 20 campaign levels (generate extras if needed)
;(function ensureLevels() {
  try {
    if (!Array.isArray(TEP.LEVELS)) return;
    const want = 20;
    const base = TEP.LEVELS.length || 0;
    for (let i = base + 1; i <= want; i++) {
      TEP.LEVELS.push(TEP.generateLevel(i, i * 0x9e3779b1));
    }
  } catch (e) { /* ignore in constrained environments */ }
})();

// ── Daily Challenge seed ──────────────────────────────
TEP.getDailySeed = function() {
  const d = new Date();
  return (d.getFullYear() * 10000 + (d.getMonth()+1) * 100 + d.getDate()) ^ 0xDEADBEEF;
};
