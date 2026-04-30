/* =====================================================
   TIME ECHO PLATFORMER v3 — sounds.js
   Web Audio API: BGM, SFX, spatial audio
   All sound is procedurally generated — no files needed.
   ===================================================== */
window.TEP = window.TEP || {};

TEP.Sound = (() => {
  let actx = null;
  let masterGain = null;
  let bgmGain = null;
  let sfxGain = null;
  let bgmNodes = [];
  let bgmRunning = false;
  let bgmInterval = null;
  let enabled = true;
  let sfxEnabled = true;
  let bgmEnabled = true;
  let currentTheme = 'cave';

  // ── Volume settings ─────────────────────────────
  let masterVol = 0.5;
  let bgmVol = 0.35;
  let sfxVol = 0.7;

  function tryResume() {
    if (actx && actx.state === 'suspended') actx.resume();
  }

  function init() {
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = actx.createGain();
      masterGain.gain.value = masterVol;
      masterGain.connect(actx.destination);
      bgmGain = actx.createGain();
      bgmGain.gain.value = bgmVol;
      bgmGain.connect(masterGain);
      sfxGain = actx.createGain();
      sfxGain.gain.value = sfxVol;
      sfxGain.connect(masterGain);
      // resume on first interaction
      document.addEventListener('keydown', tryResume, { once: true });
      document.addEventListener('click', tryResume, { once: true });
    } catch(e) {
      console.warn('[Sound] Web Audio not available:', e.message);
    }
  }

  // ── Core tone helper ────────────────────────────
  function tone(freq, type, start, dur, vol = 0.3, rampEnd = 0.001, dest = null) {
    if (!actx || !enabled) return null;
    tryResume();
    const osc = actx.createOscillator();
    const g = actx.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, actx.currentTime + start);
    g.gain.setValueAtTime(vol, actx.currentTime + start);
    g.gain.exponentialRampToValueAtTime(rampEnd, actx.currentTime + start + dur);
    osc.connect(g);
    g.connect(dest || sfxGain);
    osc.start(actx.currentTime + start);
    osc.stop(actx.currentTime + start + dur);
    return osc;
  }

  function noiseNode(dur, vol = 0.2, dest = null) {
    if (!actx || !enabled) return;
    tryResume();
    const bufSize = actx.sampleRate * dur;
    const buf = actx.createBuffer(1, bufSize, actx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
    const src = actx.createBufferSource();
    src.buffer = buf;
    const g = actx.createGain();
    g.gain.setValueAtTime(vol, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
    const filter = actx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    src.connect(filter);
    filter.connect(g);
    g.connect(dest || sfxGain);
    src.start();
    src.stop(actx.currentTime + dur);
  }

  // ── SFX ─────────────────────────────────────────
  const SFX = {
    jump() {
      if (!sfxEnabled) return;
      tone(220, 'square', 0, 0.06, 0.25);
      tone(330, 'square', 0.03, 0.10, 0.18);
      tone(440, 'square', 0.07, 0.12, 0.12);
    },

    land() {
      if (!sfxEnabled) return;
      tone(80, 'square', 0, 0.08, 0.30);
      noiseNode(0.06, 0.15);
    },

    walk() {
      if (!sfxEnabled) return;
      const f = 90 + Math.random() * 30;
      tone(f, 'square', 0, 0.04, 0.10);
      noiseNode(0.04, 0.06);
    },

    death() {
      if (!sfxEnabled) return;
      // Descending arpeggio + noise burst
      [440, 330, 220, 165, 110].forEach((f, i) => tone(f, 'square', i * 0.06, 0.10, 0.30));
      noiseNode(0.4, 0.3);
      // Screen shake sound - low rumble
      tone(40, 'sine', 0, 0.5, 0.4);
    },

    coinCollect() {
      if (!sfxEnabled) return;
      tone(880, 'sine', 0, 0.07, 0.30);
      tone(1320, 'sine', 0.05, 0.10, 0.25);
    },

    shardCollect() {
      if (!sfxEnabled) return;
      [660, 880, 1100, 1320].forEach((f, i) => tone(f, 'sine', i * 0.04, 0.12, 0.25));
    },

    echoSpawn() {
      if (!sfxEnabled) return;
      // Ethereal shimmer
      [220, 440, 660, 880, 1100].forEach((f, i) => {
        tone(f, 'sine', i * 0.025, 0.15, 0.15);
        tone(f * 1.01, 'sine', i * 0.025, 0.15, 0.10); // chorus
      });
    },

    echoEnd() {
      if (!sfxEnabled) return;
      [880, 660, 440, 220].forEach((f, i) => tone(f, 'sine', i * 0.03, 0.08, 0.15));
    },

    recording() {
      if (!sfxEnabled) return;
      tone(660, 'square', 0, 0.05, 0.20);
    },

    recordingStop() {
      if (!sfxEnabled) return;
      tone(440, 'square', 0, 0.05, 0.20);
    },

    switchActivate() {
      if (!sfxEnabled) return;
      tone(330, 'square', 0, 0.06, 0.25);
      tone(550, 'square', 0.04, 0.08, 0.20);
    },

    doorOpen() {
      if (!sfxEnabled) return;
      [165, 220, 275, 330].forEach((f, i) => tone(f, 'sawtooth', i * 0.05, 0.12, 0.20));
      noiseNode(0.3, 0.12);
    },

    levelComplete() {
      if (!sfxEnabled) return;
      const melody = [523, 659, 784, 1047, 784, 1047, 1319];
      melody.forEach((f, i) => tone(f, 'sine', i * 0.1, 0.18, 0.30));
      // Harmony
      melody.forEach((f, i) => tone(f * 0.75, 'sine', i * 0.1 + 0.02, 0.18, 0.15));
    },

    // Enemy sounds
    wispHum() {
      if (!sfxEnabled) return;
      const f = 440 + Math.random() * 100;
      tone(f, 'sine', 0, 0.3, 0.06);
    },

    sentinelAlert() {
      if (!sfxEnabled) return;
      tone(220, 'sawtooth', 0, 0.10, 0.25);
      tone(330, 'sawtooth', 0.08, 0.10, 0.20);
    },

    beastRoar() {
      if (!sfxEnabled) return;
      tone(55, 'sawtooth', 0, 0.4, 0.40);
      tone(82, 'sawtooth', 0, 0.4, 0.30);
      noiseNode(0.4, 0.35);
    },

    enemyAttack() {
      if (!sfxEnabled) return;
      tone(110, 'square', 0, 0.12, 0.35);
      noiseNode(0.12, 0.20);
    },

    corruption() {
      if (!sfxEnabled) return;
      // Glitchy descending
      for (let i = 0; i < 8; i++) {
        const f = 800 - i * 60 + (Math.random() - 0.5) * 100;
        tone(f, 'sawtooth', i * 0.03, 0.05, 0.20);
      }
      noiseNode(0.3, 0.25);
    },

    hit() {
      if (!sfxEnabled) return;
      tone(120, 'square', 0, 0.08, 0.35);
      noiseNode(0.08, 0.25);
    },

    lavaHiss() {
      if (!sfxEnabled) return;
      noiseNode(0.3, 0.12);
      tone(80, 'sine', 0, 0.3, 0.15);
    },

    swoosh() {
      if (!sfxEnabled) return;
      const f = 400 + Math.random() * 200;
      tone(f, 'sine', 0, 0.08, 0.12);
      noiseNode(0.1, 0.08);
    },

    uiClick() {
      if (!sfxEnabled) return;
      tone(440, 'square', 0, 0.04, 0.20);
    },

    uiHover() {
      if (!sfxEnabled) return;
      tone(660, 'sine', 0, 0.03, 0.12);
    },
  };

  // ── BGM system ──────────────────────────────────
  // Procedural chiptune BGM per theme
  const BGM_SCALES = {
    major:    [0, 2, 4, 5, 7, 9, 11],
    minor:    [0, 2, 3, 5, 7, 8, 10],
    harmonic: [0, 2, 3, 5, 7, 8, 11],
    pentatonic:[0,2,4,7,9],
    dorian:   [0, 2, 3, 5, 7, 9, 10],
  };

  const THEME_BGM = {
    cave:         { root:55,  scale:'minor',    tempo:90, bright:false },
    neon_city:    { root:65,  scale:'dorian',   tempo:120,bright:true  },
    sunset_ruins: { root:60,  scale:'minor',    tempo:95, bright:false },
    crystal_sky:  { root:73,  scale:'major',    tempo:105,bright:true  },
    haunted_forest:{root:52,  scale:'harmonic', tempo:80, bright:false },
    frozen_peaks: { root:69,  scale:'major',    tempo:100,bright:true  },
    lava_core:    { root:48,  scale:'minor',    tempo:130,bright:false },
    temple_gold:  { root:62,  scale:'major',    tempo:95, bright:true  },
    paradox_void: { root:46,  scale:'harmonic', tempo:85, bright:false },
    sky_islands:  { root:72,  scale:'major',    tempo:110,bright:true  },
    deep_ocean:   { root:50,  scale:'dorian',   tempo:75, bright:false },
    desert_night: { root:57,  scale:'minor',    tempo:90, bright:false },
    blood_moon:   { root:44,  scale:'harmonic', tempo:100,bright:false },
    time_rift:    { root:58,  scale:'dorian',   tempo:115,bright:true  },
    ember_ruins:  { root:52,  scale:'minor',    tempo:110,bright:false },
  };

  function midiToHz(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function playBGMNote(freq, dur, vol, delay, oscType = 'square') {
    if (!actx || !bgmEnabled) return;
    const osc = actx.createOscillator();
    const g = actx.createGain();
    osc.type = oscType;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, actx.currentTime + delay);
    g.gain.linearRampToValueAtTime(vol, actx.currentTime + delay + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + delay + dur);
    osc.connect(g);
    g.connect(bgmGain);
    osc.start(actx.currentTime + delay);
    osc.stop(actx.currentTime + delay + dur + 0.05);
    bgmNodes.push(osc);
  }

  let bgmBeat = 0;
  let bgmPattern = [];

  function generatePattern(config) {
    const scale = BGM_SCALES[config.scale] || BGM_SCALES.minor;
    const root = config.root;
    const bright = config.bright;
    const len = 16;
    const pattern = [];
    let seqRng = Math.random;
    // Simple melody + bass
    for (let i = 0; i < len; i++) {
      const deg = Math.floor(seqRng() * scale.length);
      const oct = bright ? (seqRng() < 0.3 ? 1 : 0) : (seqRng() < 0.3 ? -1 : 0);
      const melNote = root + scale[deg] + oct * 12 + 12;
      const bassNote = root + scale[deg % 3] - 12;
      const rest = seqRng() < 0.2;
      pattern.push({ mel: rest ? null : melNote, bass: bassNote, accent: seqRng() < 0.15 });
    }
    return pattern;
  }

  function scheduleBGMStep() {
    if (!bgmRunning || !bgmEnabled || !actx) return;
    const cfg = THEME_BGM[currentTheme] || THEME_BGM.cave;
    const spb = 60 / cfg.tempo / 4; // seconds per 16th note
    const step = bgmPattern[bgmBeat % bgmPattern.length];
    const t = bgmBeat * spb;

    if (step.mel) {
      playBGMNote(midiToHz(step.mel), spb * 0.8, step.accent ? 0.15 : 0.10, t, 'square');
    }
    // Bass on beats 0 and 8
    if (bgmBeat % 8 === 0 || bgmBeat % 8 === 4) {
      playBGMNote(midiToHz(step.bass), spb * 1.8, 0.12, t, 'sine');
    }
    // Hi-hat
    if (bgmBeat % 2 === 0) {
      noiseNode(0.03, 0.04);
    }

    bgmBeat++;
    // Regenerate pattern every 4 bars
    if (bgmBeat % 64 === 0) {
      bgmPattern = generatePattern(THEME_BGM[currentTheme] || THEME_BGM.cave);
    }

    const delay = spb * 1000;
    bgmInterval = setTimeout(scheduleBGMStep, delay);
  }

  function startBGM(theme) {
    if (!actx || !bgmEnabled) return;
    stopBGM();
    currentTheme = theme || 'cave';
    bgmBeat = 0;
    bgmPattern = generatePattern(THEME_BGM[currentTheme] || THEME_BGM.cave);
    bgmRunning = true;
    scheduleBGMStep();
  }

  function stopBGM() {
    bgmRunning = false;
    if (bgmInterval) { clearTimeout(bgmInterval); bgmInterval = null; }
    bgmNodes.forEach(n => { try { n.stop(); } catch(e){} });
    bgmNodes = [];
    bgmBeat = 0;
  }

  // ── Public API ──────────────────────────────────
  return {
    init,
    sfx: SFX,
    startBGM,
    stopBGM,
    setTheme(theme) {
      if (theme !== currentTheme) {
        currentTheme = theme;
        if (bgmRunning) {
          stopBGM();
          startBGM(theme);
        }
      }
    },
    setEnabled(v) { enabled = v; if (!v) stopBGM(); },
    setBGMEnabled(v) { bgmEnabled = v; if (!v) stopBGM(); else if (!bgmRunning) startBGM(currentTheme); },
    setSFXEnabled(v) { sfxEnabled = v; },
    setMasterVol(v) { masterVol = v; if (masterGain) masterGain.gain.value = v; },
    setBGMVol(v) { bgmVol = v; if (bgmGain) bgmGain.gain.value = v; },
    setSFXVol(v) { sfxVol = v; if (sfxGain) sfxGain.gain.value = v; },
    isEnabled() { return enabled; },
    tryResume,
  };
})();