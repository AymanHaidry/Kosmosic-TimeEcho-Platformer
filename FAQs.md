# ⏳ Time Echo Platformer — Comprehensive FAQ

**Last updated:** April 2026

Welcome to the Time Echo Platformer FAQ! Whether you're a new player looking to get started, a speedrunner seeking optimization tips, or a contributor curious about the codebase, you'll find answers here.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Gameplay Mechanics](#gameplay-mechanics)
3. [Enemies & Hazards](#enemies--hazards)
4. [Levels & Progression](#levels--progression)
5. [Controls & Accessibility](#controls--accessibility)
6. [Customization & Rewards](#customization--rewards)
7. [Multiplayer & Leaderboards](#multiplayer--leaderboards)
8. [Technical & Setup](#technical--setup)
9. [Troubleshooting](#troubleshooting)
10. [Development & Modding](#development--modding)

---

## Getting Started

### What is Time Echo Platformer?

Time Echo Platformer is a retro pixel-art platformer where you **record your own actions and replay them as time echoes** — autonomous clones that repeat your moves. The twist? You can coordinate up to **3 echoes simultaneously** to solve puzzles, bypass obstacles, and defeat enemies.

It's like playing chess with yourself across time.

### How do I play?

**Easiest way:** Visit **[echotime.vercel.app](https://www.echotime.vercel.app)** and click "Play as Guest" to start immediately. No account needed, no downloads, fully works offline.

**Want accounts & leaderboards?** See [Technical & Setup](#technical--setup) for self-hosting options.

### Is it free?

Yes! Time Echo Platformer is **completely free to play**. All core features — campaign, endless mode, customization — are accessible without payment. The game respects your time and skill, not your wallet.

### What platforms does it support?

- **Desktop browsers** (Chrome, Firefox, Safari, Edge)
- **Mobile browsers** (iOS Safari, Android Chrome)
- **Offline play** — works without internet
- **Touch controls** for mobile

### Can I play offline?

Absolutely! Open the `playground.html` file locally in any modern browser, and the entire game runs offline. Accounts and leaderboards require internet, but the core gameplay is completely functional without it.

### How long is the campaign?

The **10 hand-crafted campaign levels** take roughly **1–3 hours** to complete for first-time players, depending on skill and puzzle-solving approach. Veterans can speedrun it in 30+ minutes.

After the campaign, **Endless Mode** and **Daily Challenges** offer infinite replayability.

### Is there a tutorial?

Level 1 ("The First Ripple") is a guided tutorial with no enemies. It teaches echo recording, movement, and basic puzzle-solving in a relaxed cave environment. You'll learn the core mechanic in under 5 minutes.

---

## Gameplay Mechanics

### What are time echoes?

**Echoes** are recordings of your movement, jumping, and interactions. When you press **E**, the game records everything you do for up to **10 seconds**. When you press **E** again, a clone spawns that replays your exact moves on an endless loop.

**Key points:**
- You can spawn up to **3 echoes** simultaneously
- Each echo runs independently at the same speed as you
- Echoes can **hold switches, block projectiles, create platforms, and trigger hazards**
- Echoes cannot be controlled mid-playback — they replay your recording perfectly

### How do I use echoes to solve puzzles?

Here are common tactics:

1. **Switch Puzzles**: Record yourself standing on a pressure plate, spawn the echo, then move to a second plate while your echo holds the first.

2. **Stepping Stones**: Jump while recording, spawn your echo mid-air, then use its position as a platform to reach higher areas.

3. **Enemy Blocking**: Record yourself running past an enemy, spawn your echo to tank hits while you take a safe path.

4. **Timing Locks**: Some doors require multiple echoes active simultaneously. Spawn them in sequence, then coordinate your movement with their playback.

5. **Parallel Paths**: Echoes can solve alternate routes while you take another, both reaching the goal.

### Can I delete an echo?

Yes! Press **R** to restart the level, which clears all echoes and resets your position. You can also press **E** on an active echo to stop it, but it continues looping at its last known position until you restart or spawn a new recording over it.

### What happens if an echo touches a spike or lava?

**Echoes are invulnerable** to hazards. They pass through spikes, lava, lasers, and environmental dangers without taking damage. However, they can still trigger pressure plates and switches.

**You, however, die instantly.** Keep your character safe while your echoes do the dirty work.

### Can echoes defeat enemies?

Echoes can **trigger effects** that enemies respond to (like being rewind if they're a Chrono Sentinel), but they don't directly deal damage. Some enemies specifically react to echo presence:

- **Echo Wisp**: Corrupts recordings on contact
- **Chrono Sentinel**: Rewinds when touched by an echo
- **Paradox Beast**: Copies your last echo as a hostile clone

See [Enemies & Hazards](#enemies--hazards) for full details.

### What's the maximum recording length?

You have **10 seconds** per echo recording. That's roughly **80–100 pixels of horizontal movement** depending on speed, or enough time for 2–3 well-placed jumps.

### Can I extend a recording mid-playback?

No. You record, stop recording, then spawn. Once spawned, the echo replays the exact sequence you recorded.

However, you can spawn multiple echoes in **sequence** for longer-duration tasks — just restart and record a new clip when needed.

### What happens if I fall off the map?

You die and respawn at the level start. The level restarts, clearing all echoes. Your progress is **not saved** between attempts — you must complete each level in one session.

---

## Enemies & Hazards

### What enemies will I face?

There are **3 main enemy types**, each with time-manipulation mechanics:

#### Echo Wisp (Level 3+)
- **Appearance**: A flickering blue orb that darts around
- **Mechanic**: When an echo touches it, the Wisp **corrupts your recording**, turning it hostile. The corrupted echo attacks you instead of helping.
- **Counter**: Avoid exposing echoes to Wisps. Record paths that don't intersect with them, or use timing to spawn echoes after Wisps pass.

#### Chrono Sentinel (Level 5+)
- **Appearance**: A golden armored knight that patrols
- **Mechanic**: When struck by an echo, the Sentinel **rewinds in time** to a previous position, essentially reversing direction.
- **Counter**: Use this mechanic tactically! Force the Sentinel into a corner by sending echoes, then slip past while it's rewound.

#### Paradox Beast (Level 9+)
- **Appearance**: A glitching, reality-torn creature
- **Mechanic**: Every 7 seconds, it **copies your last spawned echo** and converts it to a hostile version that hunts you.
- **Counter**: Plan ahead. Spawn decoy echoes before the Beast duplicates your critical ones. Or rely on older echoes while the newest one gets corrupted.

### What other hazards exist?

- **Spikes**: Instant death. Instant death. **Instant death.**
- **Lava**: Rising or static pools that incinerate you. Echoes are safe.
- **Lasers**: Sweep patterns that deal damage on contact. Echoes pass through.
- **Moving Platforms**: Rotate, slide, or oscillate. Echoes ride them like normal.
- **Crumble Platforms**: Break after you land on them. They respawn on restart. Echoes can land on them infinitely (they don't crumble under echoes).
- **Icy Platforms**: Reduced friction. You slide; echoes walk normally.

### Can I damage enemies?

Not directly. You cannot shoot or hit enemies. Your only interaction is via echoes triggering their mechanics. The game is about **outsmarting**, not combat.

---

## Levels & Progression

### How many levels are there?

- **Campaign**: 10 hand-crafted levels (tutorial through insane difficulty)
- **Endless Mode**: Procedurally generated levels with unlimited difficulty scaling
- **Daily Challenge**: One randomly-seeded level per day with global competition
- **Custom Levels** (future): Editor planned for v4

### What's the difficulty progression?

| Level | Name | Difficulty | Key Mechanic |
|-------|------|------------|--------------|
| 1 | The First Ripple | Tutorial | Echo recording basics |
| 2 | Twin Peaks | Easy | 2-echo coordination |
| 3 | Wisp Corridor | Easy-Medium | First enemy type |
| 4 | Crumble Canyon | Medium | Fragile platforms |
| 5 | Sentinel's Watch | Medium | Rewinding mechanic |
| 6 | Crystal Cavern | Medium-Hard | Mirror echoes, reflection puzzles |
| 7 | Temple Trials | Hard | Complex switching sequences |
| 8 | Neon Descent | Hard | Timing-based hazard gauntlets |
| 9 | Frozen Throne | Hard | Icy + paradox mechanics |
| 10 | Paradox Heart | Extreme | All mechanics combined |

### Can I skip levels?

No. The campaign is **linear**. You must complete each level sequentially to unlock the next. However, you can replay any completed level from the level select menu.

### What are Endless & Daily Challenges?

- **Endless Mode**: Procedurally generated levels that get harder infinitely. How many can you beat?
- **Daily Challenge**: A fixed seeded level (same for all players) released daily. Compete for the best score on the global leaderboard.

Both require more precision and pattern recognition than the campaign.

### How do I unlock harder difficulties?

Campaign levels don't have selectable difficulties — they're fixed. But **Endless Mode** has adjustable starting difficulty (Easy, Normal, Hard, Extreme).

### Can I customize level difficulty?

In **Endless Mode**, yes. You choose your starting difficulty and the procedural generator scales from there. In the **Campaign**, no — each level is hand-tuned for its position.

### What's the scoring system?

- **Campaign**: Binary (level complete or not). Time tracked but not scored.
- **Endless Mode**: Points per level completed + time bonus.
- **Daily Challenge**: Time-based ranking against global leaderboard.

Leaderboards track your personal best times, global rankings, and regional stats.

### Are there achievements?

Yes! Over **20 achievements** unlock for various milestones:
- **Story** (beat level X)
- **Speed** (finish level X in under Y seconds)
- **Mastery** (beat all levels)
- **Collection** (find all coins in a level)
- **Challenge** (complete Endless Mode level X)
- **Custom** (unique gameplay conditions)

Each achievement grants **coins**, used to unlock cosmetics in the shop.

---

## Controls & Accessibility

### What are the controls?

| Input | Action |
|-------|--------|
| **A** or **←** | Move left |
| **D** or **→** | Move right |
| **W** or **Space** | Jump |
| **E** | Start/Stop recording echo |
| **R** | Restart level |
| **Esc** | Pause / Open menu |
| **Enter** | Next level (after completion) |
| **Tab** | Toggle HUD (UI elements) |

### Mobile controls?

- **Left side**: D-pad for movement
- **Right side**: Buttons for Jump (top), Record (left), Restart (bottom)
- **Top-right**: Pause button
- Fully responsive and touch-optimized

### Can I rebind keys?

Currently, no. Keybindings are fixed. This feature is planned for v4.

### Is there gamepad support?

Not yet. Gamepad support is on the roadmap for a future update.

### Are there accessibility options?

**Current options:**
- **Color Blind Modes**: Deuteranopia, Protanopia, Tritanopia (affects UI and visual effects)
- **Motion Sickness Mode**: Reduces parallax, motion blur, and particle effects
- **Text Scaling**: Increase/decrease UI font size
- **High Contrast**: Enhanced visibility for all UI elements

**Planned:**
- Screen reader support
- Custom difficulty mods (slower enemy speeds, longer echo duration, etc.)

### Is there a subtitle system?

No audio/dialogue in-game currently, so subtitles aren't applicable. All narrative is text-based.

---

## Customization & Rewards

### What's the shop?

The **Shop** offers cosmetic unlocks purchased with **coins** earned from achievements and level collections:

**Outfits** (appearance skins):
- Classic Pixel
- Neon Ghost
- Crystal Knight
- Temple Guardian
- Frozen Specter
- Void Walker

**Pets** (gameplay companions):
- Orbit (grants +5% jump height)
- Chrono Sprite (echoes last 20% longer)
- Echo Fox (start level with 1 free echo already spawned)

**Themes** (visual style):
- Standard dark neon
- Pastel cyberpunk
- High-contrast retro
- Plus 7 more based on level themes

### How do I earn coins?

- **Achievements**: Most grant 10–100 coins
- **Level Collection**: Find all hidden coins in a level (5 coins per level = 50 total)
- **Daily Login**: 10 coins per consecutive day logged in
- **Leaderboard Milestones**: Bonus coins for top-10 placements

### Can I buy coins with real money?

No. All cosmetics are earn-only via gameplay. We respect your time.

### Do cosmetics affect gameplay?

Only **pets** grant minor bonuses (jump, echo duration, starting echo). **Outfits** and **themes** are purely visual.

### Can I trade cosmetics or coins?

No. Cosmetics are account-bound and untradeable.

---

## Multiplayer & Leaderboards

### Is there multiplayer?

The campaign is single-player only. However, **Daily Challenges** and **Endless Mode** have **global leaderboards** where you compete against other players for time-based rankings.

No direct PvP or co-op exists (yet).

### How do leaderboards work?

- **Daily Challenge**: Global ranking by fastest time (updates in real-time)
- **Endless Mode**: Best level completed + total score
- **Personal Best**: Tracks your own records across all modes
- **Regional**: Separate leaderboards by continent/country

You need an account (via Supabase email auth) to appear on leaderboards.

### Can I play without an account?

Yes! Guest mode allows full campaign, Endless, and Daily access. You just won't be tracked on leaderboards or retain cosmetics between sessions.

### Is matchmaking available?

No. Time Echo is not competitive PvP. Leaderboards are purely score-tracking.

---

## Technical & Setup

### What engine does it use?

Time Echo is **100% vanilla JavaScript** with **HTML5 Canvas** for rendering. No frameworks, no dependencies. Just pure web tech.

This keeps file sizes tiny (~500KB total) and load times instant.

### Can I run it locally?

**Guest mode**: Download `playground.html` and open it directly in any browser. Works offline immediately.

**Full setup with accounts**: See below.

### How do I set up the full version with Supabase?

**Prerequisites:**
- A Supabase account (free tier is plenty)
- Node.js (optional, for serving locally)
- Git (optional, to clone the repo)

**Steps:**

1. **Create a Supabase project**:
   - Go to [supabase.com](https://supabase.com) → "New Project"
   - Note your **Project URL** and **anon/public API key**

2. **Initialize the database**:
   - In Supabase dashboard → **SQL Editor**
   - Open `supabase_schema.sql` from this repo
   - Paste it entirely and execute

3. **Configure the client**:
   - Open `js/supabase-client.js`
   - Replace placeholders:
     ```js
     const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
     const SUPABASE_ANON = 'YOUR_ANON_KEY';
     ```

4. **Enable email authentication**:
   - Supabase dashboard → **Authentication → Providers**
   - Click **Email**
   - Toggle "Enable Email Auth"
   - (Dev tip: Disable "Confirm Email" for instant login testing)

5. **Serve locally** (for CORS):
   ```bash
   # Using npx serve
   npx serve .
   
   # Or Python
   python3 -m http.server 8080
   
   # Or Node's http-server
   http-server -p 8080
   ```

6. **Open and test**:
   - Visit `http://localhost:8080`
   - Register a new account
   - Play and your scores will sync!

### What's the file structure?

```
time-echo/
├── index.html          ← Main game (with Supabase auth)
├── playground.html     ← Guest-only mode (works offline)
├── style.css           ← All styling (pixel art + UI)
├── supabase_schema.sql ← Database schema
├── js/
│   ├── config.js       ← Constants, themes, pets, achievements
│   ├── supabase-client.js ← REST wrapper for Supabase
│   ├── auth.js         ← Login, register, profiles, coins
│   ├── entities.js     ← Game objects (player, enemies, hazards)
│   ├── levels.js       ← 10 campaign levels + generator
│   ├── renderer.js     ← Canvas drawing, particle effects
│   ├── game.js         ← Game loop, echo system, state machine
│   └── ui.js           ← Menu, leaderboard, shop panels
```

### Do I need a database?

For **guest mode**: No.
For **accounts, leaderboards, cosmetics**: Yes. Supabase (free tier) is recommended.

### Can I deploy it?

Yes! It's a static site + Supabase backend. Deploy to:
- **Vercel** (built-in Supabase integration)
- **Netlify** (connect to Supabase)
- **GitHub Pages**
- Any static host

Just update `supabase-client.js` with production credentials.

### What browsers are supported?

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

Any modern browser with **HTML5 Canvas**, **Web Audio**, and **ES6** support.

### Does it work on iOS?

Yes! Safari on iOS supports the game fully. Touch controls are optimized for mobile.

### What's the performance?

- ~60 FPS on desktop
- ~45–60 FPS on mid-range mobile devices
- File size: ~500KB (JS + CSS, uncompressed)
- Load time: <1 second on cable/broadband

### Is the source code open?

Partially. The core game code is visible (it's browser-based, after all), but it's **not formally open-sourced**. See [Development & Modding](#development--modding).

---

## Troubleshooting

### The game won't load

**Solutions:**
1. **Clear cache**: Hard refresh with **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
2. **Try another browser**: Does it work in Chrome? Firefox?
3. **Check internet**: Do you have a connection? (Needed for accounts, not for guest play)
4. **Disable extensions**: Ad blockers or script blockers may interfere
5. **Report it**: [Open an issue][https://github.com/AymanHaidry/Kosmosic-TimeEcho-Platformer/issues] with browser/OS details

### Echoes aren't spawning

**Causes:**
- **Echo limit**: You can only have 3 echoes active. Restart to clear them.
- **Recording didn't start**: Press **E** once to start, **E** again to stop. The HUD should show a recording indicator.
- **Level requires unlock**: Some levels have echo restrictions. Check the level description.

**Fix:**
- Press **R** to restart and try again
- Check the HUD for "Recording..." text
- If still stuck, report the bug

### My score isn't saving

**Causes:**
- **Guest mode**: Scores only persist during your session in guest mode
- **No account**: You need to register to save permanently
- **Internet down**: Scores queue and sync when connection returns

**Fix:**
- Log in with an account
- Ensure your internet is stable
- Wait a moment and refresh

### I lost my progress / account

**Data locations:**
- **Campaign progress**: Stored in your browser's LocalStorage (survives across sessions)
- **Leaderboard scores**: Stored in Supabase (persists across devices if you log in)
- **Cosmetics**: Tied to your account

**Recovery:**
- If on the same device/browser: Data should still be there
- If you switched devices: Log in with your account to retrieve Supabase data
- If data is truly gone: This is a bug. Report it with details (device, browser, when it happened)

### The game is too hard

**Tips:**
1. **Replay earlier levels** to practice fundamentals
2. **Use pause** (Esc) to plan your echo placements
3. **Watch speedrun videos** to see advanced techniques
4. **Try Endless Mode on Easy** for a gentler difficulty curve
5. **Ask for hints** in Discussions — the community loves helping!

### Framerate is dropping

**Causes:**
- Too many particles on screen
- Browser running many tabs
- GPU under stress

**Fixes:**
- Close other tabs/programs
- Reduce particle density in settings (if available)
- Try a different browser
- Update your graphics drivers

### Leaderboard isn't loading

**Causes:**
- Supabase is down (rare)
- Firewall/proxy blocking requests
- Internet connectivity issue

**Fixes:**
- Refresh the page
- Check your internet connection
- Try incognito/private mode
- Check [Supabase status page](https://status.supabase.com)

### Mobile controls feel unresponsive

**Solutions:**
1. Increase touch sensitivity in settings (if available)
2. Ensure you're using landscape orientation (recommended)
3. Try in Chrome or Safari specifically
4. Update your browser
5. Check for background processes consuming CPU

---

## Development & Modding

### Can I mod the game?

**Short answer:** Mods are allowed with permission only.

**Guidelines:**
- You can inspect and study the source code
- Small personal mods (cosmetics, difficulty tweaks) for your own use are fine
- Distributing modified versions or claiming authorship is **not allowed**
- Community-created content (levels, art, music) must credit the original
- Major mods (new enemies, mechanics) require explicit permission

### How do I request a feature?

1. Check [existing discussions/issues](https://github.com/AymanHaidry/Kosmosic-TimeEcho-Platformer/) to avoid duplicates
2. Describe your idea clearly with use cases
3. Be open to feedback from the community
4. If it aligns with the game's vision, we'll consider it!

**Popular feature requests in development:**
- Gamepad support
- Level editor / custom levels
- Co-op echo sharing
- More enemies and themes
- Speedrun timer overlay

### How do I report a bug?

1. **Reproduce it**: Can you make it happen consistently?
2. **Document it**: Screenshot, browser, OS, steps to reproduce
3. **Search existing issues**: Avoid duplicates
4. **Report it**: [Open an issue](https://github.com/AymanHaidry/Kosmosic-TimeEcho-Platformer/issues) with details

**Great bug reports include:**
- Exact steps to reproduce
- What you expected vs. what happened
- Device/browser/OS info
- Console errors (F12 → Console tab)

### Where's the roadmap?

Current priorities for **v4** (Q3 2026):
- ✅ Gamepad support
- ✅ Level editor / custom levels
- ✅ Keybinding customization
- ✅ More enemy types (Temporal Slime, Void Shade)
- ✅ 5 new themes
- 🔄 Speedrun mode with global rankings
- 🔄 Co-op echo sharing (multiplayer recording)
- 🔄 Soundtrack release

### Can I contribute code?

Not currently (the game isn't formally open-sourced). However:
- **Bug reports** are always welcome
- **Design feedback** is valued
- **Art/music submissions** can be considered
- **Documentation** improvements help the community

We may open-source after v4 launch. Stay tuned!

### What's the tech stack?

- **Language**: Vanilla JavaScript (ES6+)
- **Rendering**: HTML5 Canvas 2D
- **Audio**: Web Audio API
- **Database**: Supabase (PostgreSQL + REST)
- **Auth**: Supabase email auth
- **Hosting**: Vercel (frontend) + Supabase (backend)
- **Tools**: VS Code, Git

No frameworks, no build step. Just pure web tech.

### Why no framework?

Simplicity, speed, and control. A framework would add unnecessary overhead. Canvas games benefit from direct API access, and the codebase is small enough to manage without a framework's scaffolding.

### Can I see the code?

Yes, it's viewable in the browser! Press **F12 → Sources tab** to browse the JS files. We keep the code readable and well-commented for learning.

---

## Meta

### Who made this game?

Time Echo Platformer was created by a small passionate team. We love platformers, retro pixel art, and time-loop mechanics.

### Is there a community Discord?

We're exploring Discord community options. For now, **GitHub Discussions** is our main community hub. Join us!

### Where can I stay updated?

- **GitHub**: Watch for releases and announcements
- **Website**: [echotime.vercel.app](https://echotime.vercel.app) (blog + news)

### I have a question not here!

- **Ask in Discussions**: Create a new post with your question
- **Email**: support@echotime.dev

We read everything and love answering questions.

### Can I donate?

Time Echo is free forever. If you enjoy it, the best "donations" are:
- **Sharing** with friends
- **Leaving feedback** on platforms you use
- **Reporting bugs** and suggesting features
- **Creating fan art** and speedruns

Your passion fuels us more than money.

---

## Final Thoughts

Time Echo Platformer is designed to challenge your puzzle-solving skills and creativity. The mechanic of recording and replaying actions opens up countless solutions to each level — your approach might differ from someone else's, and that's beautiful.

If you're stuck, remember: **the solution exists**. Take a break, watch how your echoes move, and think creatively about using space and time.

Welcome to the echo.

---

**Have fun, and see you on the leaderboards.** 🎮✨

