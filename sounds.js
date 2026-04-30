/* =====================================================
   TIME ECHO PLATFORMER v4 — sounds.js
   Added: Custom MP3 BGM support (loop + autoplay-safe)
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

  // 🔥 NEW
  let bgmAudio = null;
  let useCustomBGM = true;

  let masterVol = 0.5;
  let bgmVol = 0.35;
  let sfxVol = 0.7;

  function tryResume() {
    if (actx && actx.state === 'suspended') actx.resume();

    // resume custom music
    if (bgmAudio && bgmAudio.paused) {
      bgmAudio.play().catch(err => {
  console.log("🔥 BGM PLAY ERROR:", err);
});
    }
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

      document.addEventListener('keydown', tryResume, { once: true });
      document.addEventListener('click', tryResume, { once: true });

    } catch(e) {
      console.warn('[Sound] Web Audio not available:', e.message);
    }
  }

  // ── CUSTOM BGM ─────────────────────────────

  function loadCustomBGM(src) {
    if (bgmAudio) {
      bgmAudio.pause();
      bgmAudio = null;
    }

    bgmAudio = new Audio(src);
    bgmAudio.loop = true;
    bgmAudio.volume = bgmVol * masterVol;
  }

  function playCustomBGM() {
    if (!bgmAudio || !bgmEnabled) return;

    bgmAudio.currentTime = 0;

    bgmAudio.play().catch(() => {
      // autoplay blocked
    });
  }

  function stopCustomBGM() {
    if (bgmAudio) {
      bgmAudio.pause();
      bgmAudio.currentTime = 0;
    }
  }

  // ── CORE SOUND ─────────────────────────────

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

    for (let i = 0; i < bufSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

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

  // ── SFX (UNCHANGED) ─────────────────────────

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

    coinCollect() {
      if (!sfxEnabled) return;
      tone(880, 'sine', 0, 0.07, 0.30);
      tone(1320, 'sine', 0.05, 0.10, 0.25);
    },

    death() {
      if (!sfxEnabled) return;
      [440, 330, 220, 165, 110].forEach((f, i) =>
        tone(f, 'square', i * 0.06, 0.10, 0.30)
      );
      noiseNode(0.4, 0.3);
      tone(40, 'sine', 0, 0.5, 0.4);
    },

    uiClick() {
      if (!sfxEnabled) return;
      tone(440, 'square', 0, 0.04, 0.20);
    }
  };

  // ── PROCEDURAL BGM (kept as fallback) ─────────

  function startBGM(theme) {
    if (useCustomBGM) {
      stopBGM();

      if (!bgmAudio) {
        loadCustomBGM('time-capsule.mp3');
      }

      playCustomBGM();
      return;
    }

    // fallback (disabled for now)
  }

  function stopBGM() {
    bgmRunning = false;

    if (bgmInterval) {
      clearTimeout(bgmInterval);
      bgmInterval = null;
    }

    bgmNodes.forEach(n => {
      try { n.stop(); } catch(e){}
    });

    bgmNodes = [];
    bgmBeat = 0;

    stopCustomBGM();
  }

  // ── PUBLIC API ─────────────────────────────

  return {
    init,
    sfx: SFX,

    startBGM,
    stopBGM,

    startMenuMusic() {
      useCustomBGM = true;
      loadCustomBGM('time-capsule.mp3');
      playCustomBGM();
    },

    setEnabled(v) {
      enabled = v;
      if (!v) stopBGM();
    },

    setBGMEnabled(v) {
      bgmEnabled = v;
      if (!v) stopBGM();
      else startBGM(currentTheme);
    },

    setSFXEnabled(v) {
      sfxEnabled = v;
    },

    setMasterVol(v) {
      masterVol = v;
      if (masterGain) masterGain.gain.value = v;
      if (bgmAudio) bgmAudio.volume = bgmVol * masterVol;
    },

    setBGMVol(v) {
      bgmVol = v;
      if (bgmGain) bgmGain.gain.value = v;
      if (bgmAudio) bgmAudio.volume = bgmVol * masterVol;
    },

    setSFXVol(v) {
      sfxVol = v;
      if (sfxGain) sfxGain.gain.value = v;
    },

    isEnabled() {
      return enabled;
    },

    tryResume,
  };
})();
