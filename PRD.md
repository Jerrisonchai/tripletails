# PRD: TripleTails — v1.0

> A 羊了个羊-inspired match-3 stacking game. Cute chibi animal faces. Magical forest lore. One easy game, one brutal daily challenge. Match three identical critters. Restore their lost tails. Bring the forest back to life.

---

## 1. PRODUCT OVERVIEW

### 1.1 Elevator Pitch
**TripleTails** is a daily puzzle game where players clear stacks of adorable animal tiles by matching 3 identical critters into a 7-slot holding bar. One easy warm-up round. One brutally hard challenge that only the sharpest players can conquer. Built on a rich storybook world where every critter has a tail worth saving.

### 1.2 Target Audience
- Casual mobile gamers (18–45)
- Puzzle fans who crave Wordle-style daily rituals
- Players who love cute aesthetics with depth
- Adults who enjoy "cozy challenge" games (hard but not violent)
- Monetization: cosmetic tile skin collections + booster packs

### 1.3 Core Loop
```
Open App → Play Easy Game (5 min, guaranteed win) ✅
         → Play Extreme Hard Game (many attempts) 🔥
         → Check Leaderboard (200 AI bots) 🏆
         → Chat with Alliance (20 bots) 💬
         → Browse Shop (collections, boosters) 🛒
         → Change Tile Skins (5 collections) 🎨
         → Come back tomorrow at 8:00 AM
```

---

## 2. GAME MECHANICS

### 2.1 Core Rule — 3-Tile Matching

```
┌──────────────────────────────────────┐
│  🐱 🐶 🐰 🐼 🦊 🐸    ← Layer 3 (top, fully visible)  │
│    🐻 🦉 🐱 🐶 🐰      ← Layer 2 (partially visible)    │
│      🐼 🦊 🐸 🐻        ← Layer 1 (mostly hidden)        │
├──────────────────────────────────────┤
│ [🐱] [ ] [ ] [ ] [ ] [ ] [ ]         ← 7-Slot Holding Bar │
└──────────────────────────────────────┘
```

1. Tap any **unblocked** tile → it flies into the holding bar at the bottom
2. When **3 identical critters** occupy any 3 bar slots → they vanish with a chime + particles
3. Bar fills with **7 different critters** (no triple formable with what's there) → **GAME OVER**
4. Clear **all tiles from all layers** → **YOU WIN** 🎉

### 2.2 Blocking Rules — "What Can I Tap?"
A tile is **BLOCKED** (cannot be tapped) if ANY of these is true:
- Another tile sits **directly on top** of it (>50% surface overlap)
- Another tile sits **partially covering** it (>25% overlap in any corner quadrant)
- It belongs to a layer that is **underneath the current accessible layer**

A tile is **FREE** (tappable) when:
- Zero tiles above it with significant overlap
- Visual indicator: free tiles have a subtle **golden glow** (`box-shadow: 0 0 8px gold`)
- Blocked tiles are **dimmed** (`filter: brightness(0.65)`) and have `pointer-events: none`

### 2.3 Two Difficulties — Detailed Specs

| Property | Easy Game | Extreme Hard Game |
|----------|-----------|-------------------|
| **Goal** | Warm-up, teach mechanics | The real challenge |
| **Total tiles** | 48–60 | 120–150 |
| **Tile types** | 8–10 critter types | 12–15 critter types |
| **Layers** | 3–4 stacked layers | 6–8 stacked layers |
| **Layer pattern** | Simple rectangular grid | Diamond/hexagonal spiral |
| **Stacking alignment** | 80% aligned (neat) | 30–60% aligned (messy) |
| **Visible tiles at start** | ~20 tiles (35–40% visible) | ~12 tiles (8–10% visible) |
| **Guaranteed solvable** | ✅ Yes — verified by solver | ✅ Yes — verified by solver |
| **Expected attempts to win** | 1 (always first try) | 10–50+ |
| **Average completion time** | 2–4 minutes | 15–45 minutes (skilled) |
| **Boosters recommended** | Optional | Essential |
| **Coins on completion** | 50 🪙 | 200 🪙 |
| **First-ever completion** | — | 500 🪙 (one-time bonus) |

### 2.4 Why Extreme Hard is Brutal (But Fair)

**Deliberate traps in level design:**
- Early visible tiles look promising but lead to dead-end bar fills
- The correct opening sequence requires strategic bar-slot sacrifice
- Some critter types are buried 3–4 layers deep — you must dig to reach them
- The first 5–10 moves determine whether you'll win or fail

**How we guarantee solvability:**
```
ALGORITHM — Reverse Construction + Brute-Force Verification

1. Pick target tile count N (must be divisible by 3)
   Easy:   N = 48–60  (16–20 triplets)
   Hard:   N = 120–150 (40–50 triplets)

2. Create tile pool: N tiles in groups of 3 identical critters

3. Place tiles layer-by-layer, BOTTOM to TOP:
   a. For each layer L (starting from bottom):
      - Calculate grid dimensions for this layer
      - Density controls how filled this layer is
      - Every tile gets a random XY offset (±px range per layer)
   b. After placing layer L:
      VERIFY: At least one valid set of 3 matching tiles is accessible
      If verification FAILS → redo this layer placement
   c. Track which tiles block which (overlap map)

4. After ALL layers placed:
   Run brute-force backtracking solver on the complete board
   Solver tries every possible tap sequence (with pruning)
   Timeout at 30 seconds — if unsolved → regenerate entire board

5. If solver finds a path:
   Board is valid → store daily seed + solution hash
   If solver CANNOT find a path:
   Regenerate from scratch → go to Step 1

6. Daily seed = deterministic hash of date + salt
   Same seed for all players worldwide that day
```

**For Extreme Hard, we add "entanglement":**
- 2–3 critter types that ONLY appear in deep layers
- No easy first-layer triple matches — player must dig
- At least 2 "bottleneck" moments where only 1 correct move exists
- This creates the signature frustration → euphoria arc

---

## 3. THEME & WORLD-BUILDING

### 3.1 Game Name
**"TripleTails"** — Three tails together. Three critters matched. Triple the magic.

**Brand voice:** Warm, playful, slightly magical. Like a storybook you can play.

### 3.2 The Story — "The Legend of TripleTails"
The Info page in the app opens with this story:

---

> ### 🦊 **The Legend of TripleTails**
>
> *Deep in the Enchanted Forest, every critter is born with a tail — and that tail is the source of all their magic.*
>
> *The cat's tail gives her grace. The bunny's tail brings him luck. The fox's tail holds her cleverness. Without their tails, the critters are lost, wandering the forest in a sleepy daze.*
>
> *One stormy night, a great wind swept through the Enchanted Forest. The critters' tails were scattered across the meadow, buried under piles of leaves, tangled in branches, and stacked haphazardly in messy piles.*
>
> *Now the critters sleep, waiting. They can only wake up when THREE of the same kind find each other — triple tails, triple magic, triple life.*
>
> *That's where YOU come in.*
>
> *Tap the critters. Match three identical friends. Watch their tails glow as they spring back to life and scamper off into the forest. Clear every pile, and the Enchanted Forest sings again.*
>
> *But beware — the forest doesn't give up its secrets easily. Some critters are buried so deep, only the most patient and clever players can reach them.*
>
> *Are you ready to restore the forest?* 🌿

---

### 3.3 Tile Designs — CSS-Only Chibi Animal Faces
All 15 base critters drawn in pure CSS (zero images, zero emojis). Each = a colored circle with facial features via `::before` and `::after` pseudo-elements.

| # | Critter | Circle Color | Key Visual Traits | CSS Complexity |
|---|---------|-------------|-------------------|----------------|
| 1 | 🎨 Cat | Warm orange `#ffcc80` | Pointy triangular ears, whiskers, slit eyes, pink nose | ~50 rules |
| 2 | 🎨 Dog | Soft green `#a5d6a7` | Floppy round ears, tongue out, happy round eyes | ~55 rules |
| 3 | 🎨 Bunny | Pastel pink `#f8bbd0` | Long oval ears (tall), buck teeth, round eyes | ~55 rules |
| 4 | 🎨 Panda | Light gray `#e0e0e0` | Round ears, black eye patches, chubby cheeks | ~45 rules |
| 5 | 🎨 Fox | Deep orange `#ffab91` | Triangle ears, pointed nose, sly half-moon eyes | ~50 rules |
| 6 | 🎨 Frog | Mint green `#c8e6c9` | Big round eyes on top, wide curved mouth, no ears | ~40 rules |
| 7 | 🎨 Bear | Warm brown `#bcaaa4` | Round ears, big oval nose, sleepy half-lidded eyes | ~45 rules |
| 8 | 🎨 Owl | Soft purple `#b39ddb` | Ear tufts (V-shape), huge round eyes, tiny triangle beak | ~55 rules |
| 9 | 🎨 Lion | Golden yellow `#ffe082` | Mane circle (jagged border), fierce but cute eyes | ~50 rules |
| 10 | 🎨 Monkey | Soft red `#ef9a9a` | Round ears, cheeky smirk, tiny curl on top | ~45 rules |
| 11 | 🎨 Unicorn | Lavender `#e1bee7` | Spiral horn (CSS gradient), mane tuft, sparkle eyes | ~60 rules |
| 12 | 🎨 Penguin | Ice blue `#90caf9` | Tuxedo face (black/white split), orange triangle beak | ~50 rules |
| 13 | 🎨 Hamster | Sandy `#ffcc02` | Tiny round ears, chubby cheek pouches, buck teeth | ~45 rules |
| 14 | 🎨 Koala | Blue-gray `#b0bec5` | Big fuzzy round ears, large oval nose, sleepy eyes | ~45 rules |
| 15 | 🎨 Raccoon | Gray `#9e9e9e` | Bandit mask eyes, pointy ears, striped tail hint | ~50 rules |

**Total critter CSS: ~750 lines across `critter-designs.css`**

### 3.4 Background Design — Enchanted Forest Meadow

The game background is a **5-layer parallax CSS scene** behind the tile board:

```
┌─────────────────────────────────────────┐
│  ☁️  ☁️     Sky Gradient     ☁️        │  Layer 0 (CSS gradient, static)
│    light blue → soft warm yellow        │
│                                         │
│  ⛰️  ⛰️   Rolling Hills   ⛰️           │  Layer 1 (CSS pseudo-elements)
│     Distance: lighter green silhouettes │
│                                         │
│  🌸  🌿  Mid Meadow  🌿  🌸            │  Layer 2 (CSS shapes)
│     Grass + scattered tiny flowers      │
│                                         │
│  ✨  ✨  Fireflies  ✨  ✨              │  Layer 3 (CSS animations)
│     15–20 floating dots, random drift   │
│                                         │
│  ☀️  ─  Sunbeams  ─  ☀️                │  Layer 4 (Radial gradient overlay)
│     Diagonal soft light rays, low alpha │
└─────────────────────────────────────────┘
```

**Fireflies spec:**
- 15–20 absolutely-positioned CSS `.firefly` elements
- Each: `4px × 4px` circle, `background: #ffe082`, `border-radius: 50%`
- Animation: `fireflyDrift` — random `translateX(±30px)` + `translateY(-40px→+40px)`
- Duration: 3–6s (random per firefly), infinite loop, staggered start
- Opacity: oscillates 0.3 → 0.9 → 0.3 (pulsing glow)

**Sunbeams spec:**
- CSS `radial-gradient` overlay, `pointer-events: none`, `opacity: 0.08`
- Positioned diagonally from top-right corner
- Subtle — should not distract from game tiles

### 3.5 Tile Stacking Visual

**Sizing:**
```css
--tile-size: clamp(48px, 12vw, 64px);    /* Responsive circle diameter */
--tile-gap: clamp(2px, 0.5vw, 4px);      /* Gap between grid cells */
--layer-offset-max: 8px;                  /* Max random shift per tile */
```

**Stacking visual rules:**
- Tiles on lower layers: `filter: brightness(0.75)` + slightly smaller scale (0.95)
- Tiles on upper layers: full brightness, full scale
- Newly revealed tile (when covering tile removed): fades brightness 0.75 → 1 over 200ms
- Unblocked tiles: golden box-shadow glow (animated pulse)
- Blocked tiles: dim + `pointer-events: none` + no glow

**CSS state classes:**
```css
.tile                       { /* base card */ }
.tile--blocked              { filter: brightness(0.65); pointer-events: none; }
.tile--free                 { cursor: pointer; }
.tile--free .tile-glow      { opacity: 1; }           /* golden ring */
.tile--hover                { transform: scale(1.08); transition: 150ms; }
.tile--pressed              { transform: scale(0.95); transition: 100ms; }
.tile--flying               { z-index: 9999; transition: transform 300ms var(--ease-bounce); }
.tile--in-bar               { transform: scale(0.8); }
.tile--matched              { animation: vanishBurst 0.4s ease-out forwards; }
.tile--revealing            { animation: revealGlow 0.2s ease-out; }
```

### 3.6 Card Stacking Layout Algorithm

```javascript
// Pseudocode — implemented in board.js
function generateLayers(difficulty) {
  const config = difficulty === 'extreme' ? EXTREME_CONFIG : EASY_CONFIG;
  const layers = [];
  
  for (let layerIdx = 0; layerIdx < config.totalLayers; layerIdx++) {
    const cols = config.baseCols - layerIdx;     // Narrower each layer up
    const rows = config.baseRows - layerIdx;
    const density = config.densityCurve[layerIdx]; // Less dense upper layers
    
    const tiles = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (Math.random() > density) continue;    // Skip some cells
        
        tiles.push({
          row, col, layer: layerIdx,
          x: col * (tileSize + gap) + random(-offsetRange, offsetRange),
          y: row * (tileSize + gap) + random(-offsetRange, offsetRange),
          offsetX: random(-5, 5),                  // Visual scatter X
          offsetY: random(-4, 4),                  // Visual scatter Y
          critterType: pickRandomType(pool),
          blocked: true,                            // Will be updated after all placed
        });
      }
    }
    layers.push(tiles);
  }
  
  // Post-process: compute blocking relationships
  computeBlocking(layers);
  return layers;
}
```

---

## 4. FILE ARCHITECTURE

```
projects/tripletails/
│
├── PRD.md                      # This file — all requirements
├── DESIGN.md                   # Visual system, colors, typography, interaction
│
├── index.html                  # Thin shell — meta tags, viewport, script/css imports
├── manifest.json               # PWA manifest (portrait, standalone, #2d5a2d theme)
├── sw.js                       # Service Worker — cache all assets (offline play)
│
├── css/
│   ├── main.css                # CSS variables, layout grid, holding bar, responsive
│   ├── animations.css          # All @keyframes — flyToBar, vanishBurst, stampede, etc.
│   └── critter-designs.css     # 15 CSS-only critter faces + glow/state styles
│
├── js/
│   ├── storage.js              # localStorage CRUD + namespace (tt_ prefix)
│   ├── audio.js                # Procedural Web Audio API — all SFX + music
│   ├── board.js                # Multi-layer grid rendering, tile DOM creation
│   ├── tiles.js                # Tile data model, critter type definitions + colors
│   ├── input.js                # Touch/click handling, blocked-tile filtering, tap detection
│   ├── matching.js             # 7-slot holding bar logic, 3-match detection, game-over check
│   ├── solver.js               # Brute-force backtracking solver for board verification
│   ├── generator.js            # Daily board generator (reverse construction algorithm)
│   ├── boosters.js             # 5 boosters — Shuffle, Undo, Eject, Peek, Auto-Match
│   ├── shop.js                 # Shop screen — booster packs, collections, purchase flow
│   ├── collections.js          # Tile skin inventory + equip/unequip + preview
│   ├── leaderboard.js          # 200 AI bot ranking engine + player insertion + daily reset
│   ├── social.js               # Alliance chat — 20 bots + player, topic pools, message gen
│   ├── celebration.js          # Win celebration — animal stampede animation + particles
│   ├── info.js                 # Info/Story screen — lore, how to play, boosters, disclaimer
│   ├── daily.js                # Daily limits, 8am MYT reset, streak tracking
│   ├── ui.js                   # Screen manager — Home, Game, Shop, LB, Chat, Collections, Info
│   └── main.js                 # Entry point — init sequence, admin mode, screen routing
│
├── data/
│   ├── tile-sets.json          # 5 skin collection definitions (Forest, Ocean, Desert, Sky, Lunar)
│   ├── bots.json               # 200 AI bot profiles (name, group, avatar, speed_range)
│   └── chat-topics.json        # 4 topic pools for alliance chat (~50 messages per pool)
│
└── output/                     # APK build output (not committed to git)
```

**Total: 18 JS + 3 CSS + 1 HTML + 3 JSON + 3 Other = 28 files**

---

## 5. INFO PAGE — "TripleTails Tales"

### 5.1 Screen Structure
The Info screen (accessible via ℹ️ button on home screen nav bar) has **4 tabs**:

```
┌──────────────────────────────────────┐
│  📖 Info                    [×]      │
│                                      │
│  [Story] [How to Win] [Boosters] [ℹ️]│  ← Tab bar
│                                      │
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │    Tab content area            │  │
│  │    (scrollable)                │  │
│  │                                │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### 5.2 Tab 1 — 📖 The Story (see Section 3.2 above)
Full "Legend of TripleTails" story text, with gentle CSS fade-in animation.
Decorative critter icons sit in corners (non-interactive).
"Begin Your Journey →" button at bottom leads to the game.

### 5.3 Tab 2 — 🎯 How to Win

```
━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎯 HOW TO WIN
━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 THE BASICS
• Tap any glowing critter to send it to the bar
• Match 3 of the SAME critter in the bar → they vanish!
• Clear ALL critters from ALL layers → YOU WIN!

⚠️ WATCH OUT
• The bar only has 7 slots
• If 7 different critters fill the bar → GAME OVER
• You can't tap critters covered by others (dimmed = blocked)

🧠 STRATEGY TIPS
• Plan ahead! Look at what's visible before tapping
• Try to keep 1–2 bar slots open for emergencies
• If you see 2 of the same critter on the board, save them
  — don't send them to the bar unless the 3rd is reachable
• Use Shuffle when you're stuck (reshuffles all tiles)
• Use Undo if you tap the wrong critter
• Use Eject to send 3 bar critters back to the board
• The first 5 moves of Extreme Hard are the most important —
  a bad start is nearly impossible to recover from

🔥 EXTREME HARD SURVIVAL GUIDE
• Expect to fail. A lot. That's normal.
• Each attempt teaches you where critters are hidden
• The correct opening usually involves sacrificing
  bar slots to reach buried critter types
• Save your free daily boosters for deep runs,
  not the first 10 moves
• If you complete it, you're in the top <1% 🏆
```

### 5.4 Tab 3 — ⚡ Boosters & Economy

```
━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚡ BOOSTERS
━━━━━━━━━━━━━━━━━━━━━━━━━━

Every day you get 1 FREE of each:
  🔀 Shuffle   — Randomize all remaining tiles on the board
  ↩️ Undo      — Send your last tile back to the board
  📤 Eject     — Return 3 tiles from the bar to the board

Premium Boosters (buy in Shop):
  🔍 Peek      — Reveal hidden tiles under top layer for 3 seconds
  ⚡ Auto-Match — Auto-select the next 3 matching tiles

🪙 EARNING COINS
  Easy Game complete     →  50 🪙
  Extreme Hard complete  → 200 🪙
  First Hard completion  → 500 🪙 (once!)
  7-day streak bonus     → +100 🪙

🛒 SHOP
  Buy booster packs for coins (3/5/10 packs)
  Unlock themed tile skin collections
  No real money — all in-game coin economy
```

### 5.5 Tab 4 — ℹ️ Game Info & Disclaimer

```
━━━━━━━━━━━━━━━━━━━━━━━━━━
  ℹ️ GAME INFO
━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 DAILY SCHEDULE
  Reset time:    8:00 AM (Malaysia time)
  Easy game:     1 play per day
  Extreme Hard:  Unlimited attempts, 1 completion counts
  Leaderboard:   Resets daily at 8:00 AM
  Boosters:      Free daily refill at 8:00 AM

🌍 LEADERBOARD
  Compete against 200 AI players worldwide
  Your rank is based on Extreme Hard completion time
  Finish early in the morning → higher rank!

💬 ALLIANCE CHAT
  Chat with 20 fellow TripleTails players
  Share tips, fails, and daily motivation
  Your messages are visible in the chat

🎨 COLLECTIONS
  Unlock themed tile skins in the Shop
  5 collections: Forest Friends, Ocean Buddies,
  Desert Crew, Sky Squad, Lunar Lights

━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚠️ DISCLAIMER
━━━━━━━━━━━━━━━━━━━━━━━━━━

TripleTails is a single-player puzzle game. All
leaderboard rankings include AI-generated bot players
for entertainment purposes. No real-time multiplayer
functionality exists.

No personal data is collected, stored, or transmitted.
All game progress is saved locally on your device
(localStorage). Clearing your browser data will reset
your progress.

This game is designed for entertainment. The Extreme
Hard mode is intentionally difficult — frustration is
part of the experience! Take breaks if needed.

TripleTails is free to play with in-game currency
(coins). No real-money purchases are required or
supported. All items can be earned through gameplay.

© 2026 TripleTails. Made with ❤️ in Malaysia.

Version 1.0
```

---

## 6. PHASE PLAN

### Phase 1 — Skeleton + Board (Core Engine)
**Files:** `index.html`, `main.css`, `critter-designs.css`, `animations.css`, `storage.js`, `tiles.js`, `board.js`, `input.js`, `generator.js`, `ui.js`, `main.js`

**Deliverables:**
- HTML shell with viewport meta, CSS variable system, dark forest background
- All 15 CSS critter designs rendered and visually distinct
- Multi-layer board with random offset stacking
- Click/tap detection with blocked-tile filtering
- Basic board generation (easy mode, 3 layers, 48 tiles)
- `localStorage` save/load of board state
- **User sees:** A playable board with tappable critters. No game logic yet.

---

### Phase 2 — Matching + Win/Lose
**Files:** `matching.js`, `audio.js`, `daily.js` + update `ui.js`, `main.js`

**Deliverables:**
- 7-slot holding bar at bottom of game screen
- Tap → tile flies to bar (CSS transition)
- 3 identical in bar → vanish with particles + chime sound
- 7 different in bar → Game Over overlay with shake animation
- Clear all → Win overlay with stats
- Procedural audio: pick, land, match, game over sounds
- Daily tracking: easy game completed flag
- **User sees:** Fully playable easy mode. Match tiles, win or lose.

---

### Phase 3 — Solvability + Extreme Hard
**Files:** `solver.js` + update `generator.js`, `daily.js`

**Deliverables:**
- Backtracking solver (brute-force with pruning, 30s timeout)
- Reverse-construction generator for guaranteed solvable boards
- Extreme hard mode: 7 layers, 140+ tiles, 15 critter types
- Both modes guaranteed solvable (verified by solver)
- Daily seed system — same board for all players
- Two game slots: Easy + Extreme Hard
- **User sees:** Two difficulties. Extreme hard is brutal but solvable.

---

### Phase 4 — Boosters
**Files:** `boosters.js` + update `ui.js`, `animations.css`, `audio.js`

**Deliverables:**
- 5 booster types with individual logic:
  - 🔀 Shuffle — randomly repositions all remaining tiles
  - ↩️ Undo — returns last bar tile to its board position
  - 📤 Eject — moves 3 bar tiles back to random free board spots
  - 🔍 Peek — reveals hidden tiles under top layer (3s timer)
  - ⚡ Auto-Match — scans for accessible triple, auto-taps them
- Booster button bar below holding bar (3 icons with count badges)
- Animated feedback per booster type
- Free daily: 1 Shuffle + 1 Undo + 1 Eject (per game session)
- Boosters consumed on use, not carried between games
- **User sees:** Booster buttons with counts. Tap to activate.

---

### Phase 5 — Shop + Economy
**Files:** `shop.js` + update `ui.js`, `storage.js`

**Deliverables:**
- Shop screen with 3 category tabs:
  - ⚡ Boosters — 3/5/10 packs, priced per type
  - 🎨 Collections — tile skin collections for purchase
  - 🪙 Coins — coin balance display + earn info
- Coin earning: Easy (50), Hard (200), First Hard (500), Streak (+100/day)
- Purchase flow: Select pack → Confirm dialog → Deduct coins → Add to inventory
- Inventory persisted in `localStorage` (key: `tt_inventory`)
- Insufficient coins → grayed-out buy button + "Need X more 🪙"
- **User sees:** Functional shop with coin economy.

---

### Phase 6 — Collections (Tile Skins)
**Files:** `collections.js`, `tile-sets.json` + update `ui.js`, `critter-designs.css`

**Deliverables:**
- 5 skin collections:
  - 🌿 **Forest Friends** — Default critters (free, unlocked)
  - 🌊 **Ocean Buddies** — Fish, turtle, octopus, dolphin, seahorse, crab, whale, starfish, jellyfish, eel, shrimp, ray, walrus, penguin, seal
  - 🏜️ **Desert Crew** — Camel, scorpion, lizard, snake, fennec, meerkat, armadillo, gecko, vulture, jerboa, scarab, coyote, tortoise, hawk, tarantula
  - ☁️ **Sky Squad** — Bird, butterfly, dragonfly, eagle, parrot, hummingbird, bee, moth, bat, swan, peacock, flamingo, toucan, swan, dove
  - 🌙 **Lunar Lights** — Moon cat, star fox, nebula bunny, comet bear, constellation owl, galaxy frog, meteor monkey, void panda, solar lion, eclipse raccoon, aurora penguin, nova hamster, cosmos koala, stardust unicorn, quasar dog
- Collection preview grid (3×5 tiles)
- Equip/unequip toggle
- Premium collections: 500 🪙 each (Ocean, Desert, Sky)
- Lunar Lights: 1000 🪙 (special edition — sparkle CSS effects)
- Active skin persists across sessions
- **User sees:** Collection browser, preview, equip, purchase.

---

### Phase 7 — Leaderboard (200 AI Bots)
**Files:** `leaderboard.js`, `bots.json` + update `ui.js`

**Deliverables:**
- 200 AI bot profiles in `bots.json`:
  - Groups: Pro (30), Medium (50), Lazy (60), MIA (40) — remaining 20 are alliance bots
  - Each has: `name`, `group`, `avatarCritter`, `completionWindow`, `personality`
- Daily ranking engine:
  - Reset at 8:00 AM MYT
  - Bots get pre-rolled completion times within their group window
  - Player inserted at actual completion time (or "Not yet completed")
- Player ranking boost:
  - Finish before 8:30 AM → guaranteed top 3
  - Finish before 9:00 AM → guaranteed top 10
  - After that → competitive, ~top 20–50 typically
- Leaderboard UI:
  - Scrollable list showing rank, name, time, group icon
  - Player row: gold background highlight + "👈 YOU" indicator
  - Top 3: medal emojis (🥇🥈🥉) + slightly larger row
  - "Not completed yet" — player shown at bottom with "—:—" time
- **User sees:** Dynamic daily leaderboard with real-feeling competition.

---

### Phase 8 — Alliance Chat
**Files:** `social.js`, `chat-topics.json` + update `ui.js`, `audio.js`, `storage.js`

**Deliverables:**
- Alliance = player + 20 bots (from the 200 pool, assigned at first launch)
- Bot messaging engine:
  - 3–5 messages per hour, randomized timing (2–25 min gaps)
  - Pull from 4 topic pools in `chat-topics.json`:
    - 🎮 **Game Talk** (~50 messages): Strategy, board complaints, booster tips
    - 😂 **Funny Fails** (~40 messages): Self-deprecating humor about losing
    - 💪 **Daily Hype** (~30 messages): Motivation, streaks, "you got this"
    - 🌍 **Random Life** (~40 messages): Food, weather, weekend plans, casual chat
  - Rotating pool — messages marked as "used" for the day, reset at 8am
- Player interaction:
  - Chat input bar at bottom (text input + send button)
  - Player messages appear as right-aligned blue bubbles (like WhatsApp)
  - Messages stored in localStorage with timestamp (key: `tt_chat_log`)
  - Bots occasionally @mention the player (1–2 times per hour)
- Chat UI:
  - Scrollable message list (50-message buffer)
  - Bot avatars: small critter circle (24×24px) + name
  - Auto-scroll to bottom on new message
  - New message notification if scrolled up (small "▼ New messages" pill)
- Sound: Soft "ding" on new bot message (only if chat is open)
- **User sees:** Living chat room with personality.

---

### Phase 9 — Celebration + Polish + Info Page
**Files:** `celebration.js`, `info.js` + update `animations.css`, `ui.js`, `audio.js`

**Deliverables:**

**Celebration — Animal Stampede:**
- Triggered on extreme hard completion only (easy completion = simple win overlay)
- Sequence:
  1. Screen flash white → golden gradient fade-in (500ms)
  2. "🌟 YOU DID IT! 🌟" banner scales in with bouncy animation (500ms)
  3. "Extreme Hard Conquered!" subtitle fades in
  4. 100+ tiny critter icons (15×15px) spawn from left AND right edges
  5. They stampede across the screen with varied speeds
  6. Bounce off screen edges (elastic collision)
  7. Some collide with each other (simple 2D physics)
  8. Golden sparkle particles rain continuously from top
  9. Loop continues until player taps "CONTINUE" button (fades in after 3s)
- Sound: Triumphant orchestral swell (4s) → looped stampede sounds (thumps + squeaks)
- Performance: All stampede elements are CSS divs with `requestAnimationFrame` position updates

**Info Page:**
- ℹ️ button on home screen nav bar
- 4-tab layout: Story | How to Win | Boosters | Info & Disclaimer
- CSS-only decorative elements (no images)
- Scrollable tab content
- Close button (×) returns to home screen

**Polish:**
- All animations optimized for 60fps
- `will-change` hints on animated elements
- Smooth screen transitions (slide or fade between screens)
- Loading state: minimal (all assets inline, near-instant load)

**PWA:**
- `manifest.json`: name="TripleTails", short_name="TripleTails", portrait, standalone, theme=#2d5a2d
- `sw.js`: Cache-first for all 28 files, offline-ready
- **User sees:** Spectacular celebration, polished experience, info screen.

---

### Phase 10 — APK + Admin + Sanji QC
**Files:** Capacitor config, build scripts + update `main.js`, `daily.js`

**Deliverables:**

**Admin Mode:**
- Hidden ⚙️ button: bottom-right corner, 16×16px, `opacity: 0.15` (nearly invisible)
- Activate: 5 rapid taps on the gear → admin panel slides up
- Admin panel (debug overlay, dark background, gold text):
  - "🔓 Admin Mode Active"
  - "Reset Daily Limits" — play unlimited easy + hard
  - "Skip to Next Day" — advance daily seed
  - "Add 9999 🪙" — coin injection
  - "Unlock All Collections" — all skins available
  - "Force Regenerate Board" — new seed now
  - "Show Solver Debug" — overlay showing solution path
  - "Close Admin Panel"

**Daily Reset:**
- 8:00 AM MYT cutoff (`_gameDay()` helper — same pattern as Sugar Swipe)
- Reset: easy completion flag, hard completion flag, daily coin earnings cap, booster freebies, leaderboard, chat message pools

**APK Build:**
- Capacitor config: `appId: com.tripletails.match3`, `appName: TripleTails`
- Same pipeline as Sugar Swipe: `www/` folder → `cap sync` → Android Studio → Gradle
- Target: portrait only, `viewport-fit=cover`, `target-densitydpi=device-dpi`
- APK size target: <5 MB

**Sanji QC:**
- `node --check` on all 18 JS files → 0 syntax errors
- Reference check: all cross-file function calls verified
- CSS audit: no unused selectors, all critter designs distinct
- localStorage key collision check (prefix `tt_`)
- Mobile touch test: 44px minimum tap targets
- Blocked-tile detection correctness (manual test on extreme board)
- Solver verification: run solver on 10 generated boards, all must pass

**Deploy:**
- GitHub Pages: `Jerrisonchai/tripletails` repo
- APK Release: GitHub Releases with version tag
- **User sees:** Production game, APK installable, admin-hidden.

---

## 7. ECONOMY & MONETIZATION

### 7.1 Coin Economy Flow
```
          ┌──────────────────┐
          │   DAILY INCOME   │
          ├──────────────────┤
          │ Easy Complete  50 │
          │ Hard Complete 200 │
          │ 7-Day Streak +100 │
          └───────┬──────────┘
                  │
          ┌───────▼──────────┐
          │    COIN BALANCE  │
          │   (localStorage) │
          └───────┬──────────┘
                  │
     ┌────────────┼────────────┐
     │            │            │
     ▼            ▼            ▼
┌─────────┐ ┌─────────┐ ┌──────────┐
│BOOSTERS │ │SKINS    │ │SAVE FOR  │
│PACKS    │ │(500-1000│ │FUTURE    │
│(60-500) │ │  each)  │ │          │
└─────────┘ └─────────┘ └──────────┘
```

### 7.2 Coin Sources (Detailed)
| Action | Coins | Frequency |
|--------|-------|-----------|
| Complete Easy Game | 50 🪙 | Once per day |
| Complete Extreme Hard | 200 🪙 | Once per day |
| First Hard Completion Ever | 500 🪙 | Once (lifetime) |
| 7-Day Login Streak Bonus | +100 🪙 | Every 7th consecutive day |
| 14-Day Streak Bonus | +150 🪙 | Every 14th consecutive day |
| 30-Day Streak Bonus | +300 🪙 | Every 30th consecutive day |

**Daily cap:** Maximum 250 coins/day from gameplay (350 with 7-day streak).
**No cap** on total balance. **No way** to buy coins with real money.

### 7.3 Booster Prices
| Booster | Unit Price | 3-Pack | 5-Pack | 10-Pack |
|---------|-----------|--------|--------|---------|
| 🔀 Shuffle | 40 🪙 | 100 🪙 (17% off) | 150 🪙 (25% off) | 250 🪙 (38% off) |
| ↩️ Undo | 30 🪙 | 80 🪙 (11% off) | 120 🪙 (20% off) | 200 🪙 (33% off) |
| 📤 Eject | 50 🪙 | 120 🪙 (20% off) | 180 🪙 (28% off) | 300 🪙 (40% off) |
| 🔍 Peek | 25 🪙 | 60 🪙 (20% off) | 90 🪙 (28% off) | 150 🪙 (40% off) |
| ⚡ Auto-Match | 80 🪙 | 200 🪙 (17% off) | 300 🪙 (25% off) | 500 🪙 (38% off) |

### 7.4 Collections Pricing
| Collection | Price | Rarity | Visual Style |
|------------|-------|--------|-------------|
| 🌿 Forest Friends | Free | Common | Warm earth tones, default critters |
| 🌊 Ocean Buddies | 500 🪙 | Uncommon | Blue/aqua tones, sea creatures |
| 🏜️ Desert Crew | 500 🪙 | Uncommon | Sandy/warm tones, desert animals |
| ☁️ Sky Squad | 500 🪙 | Uncommon | Light blue/white tones, flying creatures |
| 🌙 Lunar Lights | 1000 🪙 | Rare | Dark purple/gold, cosmic + sparkle effects |

**Economy balance check:**
- Daily max income: 250 coins
- Cheapest premium collection: 500 coins → 2 days of full play
- All 4 premium collections: 2500 coins → 10 days
- Or: 1 Hard completion + 7-day streak = 300 coins/day → 8–9 days

### 7.5 Free Daily Boosters
Per **each** game session (Easy and Hard get separate freebies):
- 1× 🔀 Shuffle (free)
- 1× ↩️ Undo (free)
- 1× 📤 Eject (free)

Additional uses in the SAME game session cost coins from inventory.
Free boosters DO NOT accumulate — use 'em or lose 'em each game.
Purchased boosters DO carry over between games/days.

---

## 8. LEADERBOARD DESIGN (200 AI BOTS)

### 8.1 Bot Group Distribution

| Group | Count | Completion Window | Personality | Speed Rating |
|-------|-------|-------------------|-------------|-------------|
| 🏆 **Pro** | 30 | 5–15 min after 8am | Competitive, fast, skilled | 90–100 |
| 🎮 **Medium** | 50 | 15 min – 4 hours | Regular players, consistent | 50–85 |
| 🦥 **Lazy** | 60 | 4–12 hours | Procrastinators, casual | 20–60 |
| 👻 **MIA** | 40 | 12–23 hours | Barely play, might miss days | 5–30 |
| (Reserved for Alliance) | 20 | — | These 20 bots are in player's alliance chat | Mixed |
| 🧑 **Player** | 1 | Whenever they finish | Real human — inserted by actual time | Variable |

### 8.2 Daily Roll Algorithm
```javascript
function rollBotTimes(bots, daySeed) {
  const rng = seedRandom(daySeed); // Deterministic per day
  
  bots.forEach(bot => {
    const [minMin, maxMin] = bot.completionWindow;
    // Skew toward early for Pro, late for MIA
    const minutes = skewedRandom(rng, minMin, maxMin, bot.groupSkew);
    bot.todayCompletionMs = 8 * 3600 * 1000 + minutes * 60 * 1000;
  });
  
  // Sort by completion time to get rankings
  bots.sort((a, b) => a.todayCompletionMs - b.todayCompletionMs);
}
```

### 8.3 Player Insertion Logic
```javascript
function getPlayerRank(playerCompletionMs, bots) {
  if (!playerCompletionMs) return { rank: '—', display: 'Not yet completed' };
  
  // Find where player slots in
  let rank = 1;
  for (const bot of bots) {
    if (playerCompletionMs < bot.todayCompletionMs) break;
    rank++;
  }
  
  // Early bird bonuses
  const hourOfDay = new Date(playerCompletionMs).getHours();
  if (hourOfDay < 8.5) rank = Math.min(rank, 3);   // Before 8:30 → top 3
  else if (hourOfDay < 9) rank = Math.min(rank, 10); // Before 9:00 → top 10
  
  return { rank, display: formatTime(playerCompletionMs) };
}
```

### 8.4 Bot Naming Convention
All bot names are two-word combinations: `[Adjective/Verb][Animal/Feature]`

**Pro (30):** ShadowClaw, SwiftPaw, Meowster, PixelPounce, FluffyRush, FrostWhisker, BlazeTail, StormPaws, AceFang, QuickClaw, TurboPaw, DashFluff, EliteTail, RapidTrot, PeakMeow, AlphaBark, NitroPaws, SharpFang, RushTail, SonicFluff, PrimeClaw, SwiftBite, FlashPounce, ApexMeow, BoltTail, FuryPaws, ZenClaw, TopFang, ChiefFluff, UltraBark

**Medium (50):** CozyCub, ChillWhisker, NappyPaws, SunnyTail, GlimmerFur, BreezyPaw, MapleFluff, DandyPounce, MellowBark, TidyTail, WispyMeow, Dewdrop, PeppyPaws, CalmClaw, RoamFang, Saunter, GingerSnap, PetalPaws, CloverTail, Nuzzle, Thistle, Pawsitive, BambiEyes, WhimsyFur, Gingersnap, PipSqueak, PuddlePaws, Moonbeam, BumbleFluff, FlitterTail, Dapple, Twiggle, SnickerPaw, Marshmellow, TinkerPounce, GlimmerTail, PeppyWhisk, TumbleFluff, Sprinkle, CheddarChomp, MuffinPaws, WaffleTail, BiscuitBite, ToffeeTrot, NoodleFluff, PicklePaws, S'mores, CupcakeClaw, JellyBean, PuddingPop

**Lazy (60):** SlowPoke, DozyDoodle, YawnTails, SnoozeClaw, LazyPaws, Napper, DrowsyFluff, LaggyTail, ChillMode, CouchPounce, PillowPaws, SlumberFang, DreamyMeow, LazeAbout, TardyTail, SleepyBean, SlugPace, MolassesPaw, TurtleToes, AfternoonNap, LateComer, MaybeTomorrow, ProcrastiNate, SnoreFluff, DuvetBurrow, BlanketPile, PajamaPaws, RestingFluff, ComfyCozy, StillInBed, FiveMoreMin, SnoozeButton, WeekendVibes, LoafMode, HorizontalLife, VerticalLimit, AmblePaws, MeanderTail, DawdleFluff, StrollClaw, PlodAlong, SaunterSlow, MoseyMeow, RamblePaw, TardyTail, SnoozeCruise, LaggingPaws, BufferingFluff, LoadingTail, NinetyNinePct, SpinningWheelPaw, PendingFluff, TimeoutClaw, LatencyTail, SlowConnection, DialUpMeow, HamsterWheel, TheSnail, TurtlePower, Molasses

**MIA (40):** GhostWhisper, MissingMittens, LostClaws, VanishedTail, NowYouSeeMe, WhereAmI, DisappearingPaw, FoggyFluff, ExistsQuestionably, SchrodingerCat, MaybeReal, OccasionallyHere, EveryOtherDay, OnceInABlueMoon, SemiAnnual, SolsticeFluff, EclipsePaws, LunarPhase, RareSighting, MythicalTail, SasquatchPaws, NessieFluff, UrbanLegend, FolkloreFang, TallTail, SightingUnconfirmed, BlurryPhoto, CameraShy, OffTheGrid, UnpluggedPaw, AirplaneMode, DoNotDisturb, SilentWhisker, InvisibleTail, Hypothetical, TheoreticalFluff, GlitchTail, ShadowPaws, DimFluff, WispWhisker

### 8.5 Leaderboard UI Spec
- Full-screen scrollable list
- Header: "🏆 Daily Leaderboard — Day X" (streak day)
- Each row: `Rank | Avatar | Name | Completion Time | Group Badge`
- Player row: gold background `rgba(255,215,0,0.15)`, bold text
- Top 3: medal emoji + slightly larger avatar
- Scroll position saved (returns to player's rank if they've completed)
- Pull-to-refresh feel (CSS-only, no backend to refresh)

---

## 9. ALLIANCE CHAT DESIGN (20 Bots)

### 9.1 Chat Room Configuration
- **Room name:** "Tail Trackers" (player's alliance)
- **Members:** Player + 20 AI bots (drawn from the 200 pool, consistent per device)
- **Bot assignment:** Hashed from localStorage device ID → always same 20 bots
- **Chat persistence:** Last 50 messages stored in localStorage (`tt_chat_log`)

### 9.2 Message Generation Engine
```javascript
function generateMessages(hourOfDay, daySeed, chatHistory, playerName) {
  const msgsPerHour = 3 + Math.floor(seededRandom(daySeed + hourOfDay) * 3); // 3–5
  const topics = selectTopicPool(daySeed, hourOfDay);
  
  const messages = [];
  for (let i = 0; i < msgsPerHour; i++) {
    const delay = Math.floor(seededRandom() * 3600 * 1000 / msgsPerHour);
    const bot = pickRandomBot();
    const msg = pickMessage(topics, bot.personality);
    messages.push({ bot, msg, delay, time: Date.now() + delay });
  }
  
  // 1–2 @mentions of player per hour
  if (seededRandom() < 0.3) {
    const mentionIdx = Math.floor(seededRandom() * messages.length);
    messages[mentionIdx].msg = `@${playerName} ${messages[mentionIdx].msg}`;
  }
  
  return messages;
}
```

### 9.3 Topic Pools (stored in `chat-topics.json`)

**🎮 Game Talk (~50 messages):**
- "Today's board is WILD. Who put all the unicorns at the bottom?!"
- "Pro tip: Don't tap the first fox you see. Trust me."
- "I got to 14 tiles left on hard mode. SO CLOSE."
- "Is it just me or is the panda always buried 4 layers deep?"
- "Shuffle saved my run today. Best 40 coins I ever spent."
- "Day 30 streak! The forest is practically sparkling now ✨"
- "I swear the RNG hates me. Three games in a row with zero early matches."
- "Anyone tried the Lunar Lights skin? The sparkle effect is gorgeous."
- "Eject is underrated. Getting 3 slots back is basically a second life."
- "Finally cleared hard mode! Took 47 attempts but I GOT IT!"

**😂 Funny Fails (~40 messages):**
- "Had match pair ready, accidentally tapped the wrong one. Game over. I need a nap."
- "My cat walked across my phone and somehow tapped 3 tiles in a row. She's better than me."
- "7 slots, 7 different animals. The definition of pain."
- "Me: 'One more try before bed.' Also me at 3am: 😵‍💫"
- "I used Eject and the SAME three tiles came right back. The forest is mocking me."
- "When you think you're winning but the bar says otherwise..."
- "My streak ended because I fell asleep mid-game. Literally snored through a game over."

**💪 Daily Hype (~30 messages):**
- "NEW DAY, NEW BOARD! Let's get those tails back! 🌅"
- "Morning grinders rise up! Early bird gets the leaderboard spot 🐦"
- "Don't let yesterday's L define today's W. You got this!"
- "Week 2 of my streak. This game has me in a CHOKEHOLD 😤"
- "Remember: even the pros started with a game over. Keep stacking!"
- "Who else is playing during their lunch break? 🙋"

**🌍 Random Life (~40 messages):**
- "Rainy day here. Perfect weather for stacking critters 🌧️"
- "What's everyone having for dinner? I'm thinking noodles 🍜"
- "Just finished a 10k run. Now I deserve 2 hours of TripleTails 😂"
- "New job starts Monday. Gonna squeeze in games during commute!"
- "My productivity has dropped 40% since discovering this game. Worth it."
- "Weekend vibes: coffee + TripleTails + no alarms ☕"
- "Malaysian weather today: hot. As always. 🥵"

### 9.4 Player Chat
- Text input at bottom of chat screen
- Send button (paper plane icon, CSS-drawn)
- Player messages: right-aligned, blue bubble `#3b82f6`, white text
- Bot messages: left-aligned, dark bubble `rgba(255,255,255,0.1)`, white text + bot name above
- Timestamps on each message (small, dimmed, `HH:MM` format)
- New messages animate in (slide up + fade, 200ms)
- Player message stored in `tt_chat_log` with sender="player"

### 9.5 Chat UI States
- **Active:** Chat screen open, new messages appear in real-time
- **Background:** Chat closed — messages still generated at intervals, visible when chat opens
- **Scroll:** Auto-scroll to bottom when new message appears. If user scrolled up, show "▼ 3 new" pill
- **Empty:** First launch shows "Welcome to Tail Trackers! 20 tail-hunters ready to chat 💬"

---

## 10. CELEBRATION DESIGN — "The Great Unleashing"

### 10.1 Trigger Condition
Player clears **all** tiles in **extreme hard** mode.
Easy mode completion = simple overlay (no stampede).

### 10.2 Animation Sequence (Detailed Timeline)

```
t=0.0s   🎬 Board empties, final match particles still fading
t=0.2s   Screen flash: full white overlay → fades to golden gradient
t=0.5s   Banner "🌟 YOU DID IT! 🌟" scales in with bounce
         (transform: scale(0) → scale(1.3) → scale(1) over 0.5s)
t=0.8s   Subtitle "Extreme Hard Conquered!" appears below banner
t=1.0s   ⭐ First sparkle particles fall from top
t=1.2s   🦊 FIRST critter spawns from left edge, runs right
t=1.3s   🐶 SECOND critter spawns from right edge, runs left
t=1.5s   Stampede begins: critters spawn rapidly from both sides
t=1.5-7s 100+ critters cross the screen, bounce, collide
t=7.0s   Sparkle intensifies, confetti burst at center
t=3.0s   "CONTINUE" button fades in at bottom
         → Player can tap anytime after this
t=∞      Loop continues until player taps Continue
```

### 10.3 Stampede Technical Spec

```
Critter sprites:
  - 15×15px mini CSS circles with critter faces
  - Randomly selected from equipped collection
  - 20 different critter mini-types cycling

Spawn logic:
  - New critter every 80ms (random jitter ±40ms)
  - 50% spawn from left edge, 50% from right edge
  - Initial speed: random(80, 200) px/s toward center
  - Vertical starting position: random over full screen height

Physics (simple 2D):
  - Each critter: {x, y, vx, vy, size: 15, type}
  - Wall bounce: if x < 0 or x > screenW → vx *= -0.8
  - If y < 0 or y > screenH → vy *= -0.8
  - Collision with another critter: elastic 1D swap of vx component
  - No gravity (they float/bounce in zero-G)
  - Small random velocity changes over time (simulates chaos)

Particle system:
  - Gold sparkle: 2×2px gold dot, random fall speed, fade out
  - Blue sparkle: 3×3px star (CSS clip-path), slow drift
  - White confetti: 4×1px rectangles, rotate + fall
  - 5 new particles every 100ms

Performance budget:
  - Max 120 critters on screen at once
  - Oldest critters despawn after crossing both screen edges
  - Particles recycled (object pool pattern)
  - requestAnimationFrame at 60fps
```

### 10.4 Sound — Triumphant Fanfare (Procedural)
```
Layer 1 (0–2s):  Orchestra swell — multiple sine waves at C4, E4, G4, C5
                  Fade in, crescendo
Layer 2 (2–4s):  Chord progression C → F → G → C (held)
                  Add triangle wave for brightness
Layer 3 (4s+):    Loop: stampede sounds
                  Low sine thumps (simulates running)
                  High-pitched squeaks (random animal sounds)
                  Layered 3 deep, slight detune for richness
```

### 10.5 Easy Win Overlay (Minimal)
```
┌─────────────────────────────────┐
│                                 │
│         ✨ Nice Work! ✨         │
│     Easy Game Completed ✅      │
│                                 │
│      Time: 2m 34s              │
│      Boosters used: 1          │
│      +50 🪙 earned             │
│                                 │
│    ┌─────────────────────┐      │
│    │    CONTINUE           │     │
│    └─────────────────────┘      │
└─────────────────────────────────┘
```
Simple fade-in overlay, no stampede. Just stats + coin reward.

---

## 11. SOUND DESIGN

All sound procedurally generated via Web Audio API (zero audio files).

### 11.1 Audio Architecture
```javascript
class AudioEngine {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.muted = false;
  }
  // Each sound method creates oscillator → gain → master → destination
}
```

### 11.2 Sound Catalog

| Event | Method | Preset |
|-------|--------|--------|
| **Tile Pick** | Soft pop | Sine 800→400Hz, 80ms, slight pitch drop |
| **Tile Land in Bar** | Thud | Sine 200→100Hz, 100ms + pink noise burst (30ms) |
| **3-Match Vanish** | Chime | 3-note arp: C5(100ms) → E5(100ms) → G5(200ms), sine |
| **Game Over** | Sad trombone | Sawtooth 400→200Hz, 500ms, slight distortion |
| **Easy Win** | Happy jingle | Major triad arpeggio (C-E-G-C), 300ms each, 1.2s total |
| **Extreme Win** | Triumphant fanfare | Full orchestral — see celebration section |
| **Shuffle Booster** | Whoosh | White noise sweep, bandpass 500→2000Hz, 500ms |
| **Undo Booster** | Reverse pop | Sine 400→800Hz (reversed pitch), 200ms |
| **Eject Booster** | Triple pop | 3 quick pops: 600Hz/80ms, 800Hz/80ms, 1000Hz/80ms |
| **Peek Booster** | Reveal shimmer | High sine 2000→3000Hz, 200ms, tremolo |
| **Auto-Match** | Rapid chime | Fast arp C-E-G (×3), 50ms each, 450ms total |
| **Shop Purchase** | Cash register | Square wave blip 1200Hz/50ms + 800Hz/50ms, slight ring |
| **Insufficient Coins** | Buzzer | Sawtooth 200Hz/200ms, no decay |
| **Chat Message** | Soft ding | Triangle wave 1000Hz/100ms, gentle decay |
| **Stampede Running** | Thumps | Low sine 80Hz/30ms, rhythmic, layered ×3 detuned |
| **Stampede Squeaks** | Squeaks | Random high sine 2000–4000Hz/60ms, sporadic |
| **Button Tap** | Tick | Square wave 800Hz/30ms |

### 11.3 Audio States
- **Muted:** Global mute toggle (persisted in localStorage `tt_muted`)
- **Volume:** Simple on/off (no slider for v1.0)
- **AudioContext resume:** Required on first user interaction (autoplay policy)
  - First tap on game → `ctx.resume()` + brief "welcome" chime

---

## 12. ADMIN MODE

### 12.1 Activation
- ⚙️ Gear icon: absolute-positioned bottom-right corner
- Size: 16×16px, `opacity: 0.12` (barely visible on dark forest background)
- Tap detection: 5 rapid taps within 3 seconds
- Successful activation: gear spins (360° animation) + panel slides up

### 12.2 Admin Panel Features
```
┌─────────────────────────────────────┐
│  🔓 ADMIN PANEL              [×]    │
│                                     │
│  [Reset Daily Limits]               │
│    Unlimited plays for today         │
│                                     │
│  [Skip to Next Day]                 │
│    Advance daily seed + reset        │
│                                     │
│  [Add 9999 🪙]                      │
│    Instant coin injection            │
│                                     │
│  [Unlock All Collections]           │
│    All 5 skin sets available         │
│                                     │
│  [Force Regenerate Board]           │
│    New seed for current difficulty   │
│                                     │
│  [Show Solver Debug]                │
│    Overlay solution path on board    │
│                                     │
│  [Dump Game State]                  │
│    Console.log all localStorage      │
│                                     │
│  ──────────────────────────────     │
│  Version: 1.0 | Day: 47             │
│  Seed: 0x7F3A91B2                   │
└─────────────────────────────────────┘
```

### 12.3 Admin Deactivation
- Tap × button on admin panel
- OR: reload the page (admin state not persisted)

---

## 13. DAILY STRUCTURE

| Property | Value |
|----------|-------|
| Reset time | 8:00 AM MYT (Asia/Kuala_Lumpur) |
| Time zone helper | `_gameDay()` — consistent with Sugar Swipe |
| Easy game | 1 completion per day |
| Extreme Hard game | Unlimited attempts, 1 completion counted |
| Daily free boosters | 1× Shuffle + 1× Undo + 1× Eject per game session |
| Board seed | Deterministic hash of date + salt — same for all players |
| Leaderboard | Full reset at 8:00 AM (all bot times re-rolled) |
| Chat message pools | Reset at 8:00 AM (all messages available again) |
| Streak tracking | Incremented on any game completion (easy or hard) per day |
| Missed day | Streak resets to 0 |
| Coin earnings | Daily cap reset at 8:00 AM |

### 13.1 Daily Flow (Player Perspective)
```
8:00 AM  — Everything resets. New board seed generated.
8:05 AM  — Player opens app, plays Easy Game (warm-up)
8:10 AM  — Easy Game completed → +50 🪙
8:15 AM  — First attempt at Extreme Hard
8:20 AM  — Game Over (12 tiles left)
8:25 AM  — Second attempt... Game Over (8 tiles left)
8:30 AM  — Third attempt... Game Over (31 tiles left — rushed it)
         — Takes a break, lives life
12:30 PM — Lunch break, tries again with fresh eyes
12:45 PM — DOWN TO 3 TILES... Game Over (pain)
8:00 PM  — Evening session, 17th attempt
8:32 PM  — 🎉 EXTREME HARD COMPLETED! +200 🪙
8:33 PM  — Checks leaderboard → Rank #23
8:34 PM  — Opens chat, brags about completion
8:35 PM  — Browses shop, considers Ocean Buddies skin
11:59 PM — Last peek at leaderboard before tomorrow's reset
```

---

## 14. NON-SCOPE (Not in v1.0)

- ❌ No events/promotions system (daily consistency is the hook — like Wordle)
- ❌ No lives/hearts system (infinite retries on extreme hard)
- ❌ No gift/sticker interactions in chat
- ❌ No multi-language support (English only for v1.0)
- ❌ No backend/server infrastructure (all localStorage + procedural generation)
- ❌ No real-time multiplayer or live chat (bots are simulated)
- ❌ No account system or cloud sync
- ❌ No real-money purchases or IAP
- ❌ No push notifications
- ❌ No social media sharing integration (for now)

---

## 15. DEVELOPMENT CONSTRAINTS

- **Zero images** — all visuals via CSS + procedurally generated DOM
- **Zero audio files** — all sound via Web Audio API oscillators/noise
- **Zero backend** — all data in `localStorage`, all logic client-side
- **Zero hosting cost** — GitHub Pages deployment
- **Mobile-first** — `100vw × 100dvh`, touch-optimized, portrait only
- **APK via Capacitor** — same pipeline as Sugar Swipe
- **Vanilla JavaScript** — no frameworks, no build step, no npm dependencies
- **CSS-only tile designs** — no emojis, no icon fonts, no sprite sheets
- **All procedurally generated** — boards, bot behaviors, chat messages, audio

---

_Last updated: June 20, 2026 | v1.0 | Jerrison & Luffy 🏴‍☠️_
