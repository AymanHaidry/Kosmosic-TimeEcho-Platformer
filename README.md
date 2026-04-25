# ⏳ Time Echo Platformer

> **Beat puzzles with your past self.**

A pixel-art HTML5 platformer where you record short clips of your actions and spawn **time echoes** — clones that replay your moves. Coordinate up to 3 echoes to hold switches, block enemies, or create stepping stones.

---

## 📁 File Structure

```
time-echo/
├── index.html                ← Main website entry point
├── supabase_schema.sql       ← Run this in Supabase SQL editor
├── css/
│   └── style.css             ← Full UI styling (pixel art + Bare Bones aesthetic)
└── js/
    ├── config.js             ← Constants, themes, pets, outfits, achievements
    ├── supabase-client.js    ← Thin REST wrapper for Supabase
    ├── auth.js               ← Auth: register, login, profile, coins, scores
    ├── entities.js           ← All game objects: Actor, 3 enemy types, hazards
    ├── levels.js             ← 10 hand-crafted levels + seeded random generator
    ├── renderer.js           ← Pixel-art drawing, parallax, particles, motion blur
    ├── game.js               ← Game loop, camera, echo system, state machine
    └── ui.js                 ← All HTML panels: menu, auth, shop, leaderboard
```

---

## 🚀 Quick Start (No Backend)

Open `index.html` directly in any modern browser. The game runs fully offline as a guest — no server needed.

---

## 🌐 Full Setup with Supabase (Accounts + Leaderboard)

### 1. Create a Supabase Project
- Go to [supabase.com](https://supabase.com) → New Project
- Note your **Project URL** and **anon/public API key**

### 2. Run the SQL Schema
- In Supabase dashboard → **SQL Editor**
- Paste and run the contents of `supabase_schema.sql`

### 3. Configure the Client
Edit `js/supabase-client.js`, replace the placeholders:
```js
const SUPABASE_URL  = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON = 'YOUR_ANON_KEY';
```

### 4. Enable Email Auth
- Supabase dashboard → **Authentication → Providers**
- Enable **Email** (disable "Confirm email" for instant login during dev)

### 5. Serve (for CORS)
Run any static file server, e.g.:
```bash
npx serve .
# or
python3 -m http.server 8080
```
Then open `http://localhost:8080`

---

## 🎮 Controls

| Key | Action |
|-----|--------|
| `A` / `←` | Move left |
| `D` / `→` | Move right |
| `W` / `Space` | Jump |
| `E` | Start / Stop recording echo |
| `R` | Restart level |
| `Esc` | Pause / menu |
| `Enter` | Next level (on level complete) |

---

## 👾 Enemies

| Enemy | Appears | Mechanic |
|-------|---------|----------|
| **Echo Wisp** | Level 3+ | Corrupts your recording on contact |
| **Chrono Sentinel** | Level 5+ | Rewinds itself when hit by an echo |
| **Paradox Beast** | Level 9+ | Copies your last echo as a hostile clone |

---

## 🔮 Features

- **10 hand-crafted campaign levels** with increasing complexity
- **Seeded random level generator** for endless / daily challenge modes
- **3 enemy types** with unique time-manipulation mechanics
- **Moving + crumble platforms**, spikes, lasers, pressure plates
- **Shop**: 6 outfits, 3 pets with gameplay perks
- **Achievements** with coin rewards
- **Worldwide leaderboard** via Supabase
- **Guest play** — no account required
- **Mobile touch controls**
- **Parallax scrolling background** with 8 visual themes
- **Motion blur trails** on all actors
- **Particle effects** on deaths, collections, echo spawns
- **Bare Bones shader aesthetic**: pixel art, dark neon palette

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Usernames, coins, level progress, owned items |
| `leaderboard` | Per-level scores for campaign, endless, daily modes |

RPC functions:
- `get_level_leaderboard(level, mode, limit)` — top N scores
- `get_my_best(user_id, mode)` — personal bests

---

## 🧩 Adding Levels

Edit `js/levels.js` — each level is a plain object:

```js
{
  num: 11, name: 'My Custom Level',
  theme: 'neon',        // cave|sunset|crystal|temple|neon|sky|frozen|lava|forest|paradox
  worldW: 2400, worldH: 600,
  start: [60, 490], goalPos: [2320, 440],
  platforms: [ plat(x, y, w, h, opts), movPlat(...), ... ],
  switches:   [ new Sw(x, y, 'A'), ... ],
  doors:      [ new Door(x, y, w, h, 'A'), ... ],
  enemies:    [ wisp(...), sentinel(...), beast(...) ],
  spikes:     [ spike(x, y, w), ... ],
  pressurePlates: [ new PressurePlate(x, y, 'A', required) ],
  lasers:     [],
  coins:      [ coin(x, y), ... ],
  shards:     [ shard(x, y), ... ],
  hint: 'Tip shown to player at level start',
}
```

---

## 🎨 Visual Themes

`cave` · `sunset` · `crystal` · `temple` · `neon` · `sky` · `frozen` · `lava` · `forest` · `paradox`

Each theme controls sky gradient, parallax hill colors, platform colors, and ambient glow.

---

## 📄 License

MIT — use freely, mod mercilessly, share generously.
