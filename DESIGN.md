# DESIGN.md — TripleTails v1.0

> Visual design system, CSS architecture, animation specs, and interaction patterns.
> **Mandatory design brain** — read before writing any CSS/JS.
> Theme: Enchanted Forest. Cute chibi animals. Dark cozy aesthetic with golden warmth.

---

## 1. DESIGN PHILOSOPHY

**Mantra:** *A hard game wrapped in a soft hug.*

The visual design contrasts with the brutal difficulty: warm, inviting, magical visuals that make you feel safe even when you're failing for the 30th time. The Enchanted Forest feels alive — fireflies drift, sunbeams filter through leaves, critters glow when they're ready to be tapped.

**Core emotions by screen:**
- Home: Cozy anticipation ("What's today's challenge?")
- Easy Game: Playful flow ("This is delightful!")
- Extreme Hard: Tense determination ("I can do this... I CAN do this...")
- Game Over: Sympathetic sigh ("The forest is still waiting. Try again?")
- Win: Euphoric release ("I DID IT! THE FOREST IS FREE!")
- Shop: Curious browsing ("Ooh, Ocean Buddies...")
- Chat: Friendly warmth ("These bots get me.")

**Golden rule:** The game is HARD. The visuals must be SOFT. This contrast keeps players coming back.

---

## 2. COLOR SYSTEM

### 2.1 CSS Custom Properties
```css
:root {
  /* ── Forest Background Palette ── */
  --clr-bg-deep:      #1a3a1a;    /* Deep forest floor — main BG */
  --clr-bg-mid:       #2d5a2d;    /* Mid canopy — cards, panels */
  --clr-bg-light:     #4a7c4a;    /* Light canopy — hover, highlights */
  --clr-grass:        #5a9e4b;    /* Bright grass — accents */
  --clr-meadow:       #8bc34a;    /* Meadow green — buttons, CTAs */
  --clr-sun:          #f9e076;    /* Soft sunbeam yellow */
  --clr-gold:         #ffd700;    /* Pure gold — coins, glow, premium */
  --clr-gold-dim:     rgba(255,215,0,0.15); /* Gold for glow effects */

  /* ── Critter Card Colors (15 animals) ── */
  --clr-card-cat:     #ffcc80;    /* Warm orange — cat */
  --clr-card-dog:     #a5d6a7;    /* Soft sage — dog */
  --clr-card-bunny:   #f8bbd0;    /* Pastel pink — bunny */
  --clr-card-panda:   #e0e0e0;    /* Light gray — panda */
  --clr-card-fox:     #ffab91;    /* Deep orange — fox */
  --clr-card-frog:    #c8e6c9;    /* Mint green — frog */
  --clr-card-bear:    #bcaaa4;    /* Warm brown — bear */
  --clr-card-owl:     #b39ddb;    /* Soft purple — owl */
  --clr-card-lion:    #ffe082;    /* Golden yellow — lion */
  --clr-card-monkey:  #ef9a9a;    /* Soft red — monkey */
  --clr-card-unicorn: #e1bee7;    /* Lavender — unicorn */
  --clr-card-penguin: #90caf9;    /* Ice blue — penguin */
  --clr-card-hamster: #ffcc02;    /* Sandy yellow — hamster */
  --clr-card-koala:   #b0bec5;    /* Blue-gray — koala */
  --clr-card-raccoon: #9e9e9e;    /* Medium gray — raccoon */

  /* ── UI Surfaces ── */
  --clr-surface:      rgba(45,90,45,0.85);  /* Card backgrounds */
  --clr-surface-lt:   rgba(74,124,74,0.7);  /* Lighter panels */
  --clr-surface-glass: rgba(26,58,26,0.92); /* Glass-morphism panels */

  /* ── Text ── */
  --clr-text:         #f5f0e0;              /* Warm off-white (primary) */
  --clr-text-bright:  #ffffff;              /* Pure white (headings) */
  --clr-text-dim:     rgba(245,240,224,0.55); /* Dimmed text */
  --clr-text-gold:    #ffd700;              /* Gold text (coins, premium) */

  /* ── Semantic ── */
  --clr-danger:       #ef5350;    /* Game over, errors, danger */
  --clr-success:      #66bb6a;    /* Match, win, success */
  --clr-warning:      #ffb74d;    /* Warnings, low resources */
  --clr-accent:       #ffb74d;    /* Accent orange — CTAs, boosters */
  --clr-link:         #64b5f6;    /* Links, info highlights */

  /* ── Holding Bar ── */
  --clr-bar-bg:       rgba(26,58,26,0.95);  /* Bar background */
  --clr-bar-slot:     rgba(255,255,255,0.06); /* Empty slot */
  --clr-bar-slot-act: rgba(255,255,255,0.12); /* Hover slot */
  --clr-bar-border:   rgba(255,255,255,0.1);  /* Bar edge */

  /* ── Typography ── */
  --font-display:     'Fredoka', 'Segoe UI', system-ui, sans-serif;
  --font-body:        'Nunito', 'Segoe UI', system-ui, sans-serif;

  /* ── Spacing (fluid) ── */
  --space-xs:         clamp(4px, 1vw, 8px);
  --space-sm:         clamp(8px, 2vw, 16px);
  --space-md:         clamp(12px, 3vw, 24px);
  --space-lg:         clamp(16px, 4vw, 32px);
  --space-xl:         clamp(24px, 5vw, 48px);

  /* ── Tile Sizing (fluid) ── */
  --tile-size:        clamp(48px, 12vw, 64px);
  --tile-size-mini:   clamp(12px, 3vw, 16px);   /* Stampede critters */
  --tile-gap:         clamp(2px, 0.5vw, 4px);
  --bar-height:       clamp(70px, 15vh, 100px);
  --bar-slot-size:    clamp(44px, 10vw, 56px);

  /* ── Animation ── */
  --ease-bounce:      cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth:      cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out-back:    cubic-bezier(0.34, 1.56, 0.64, 1);
  --dur-fast:         150ms;
  --dur-normal:       300ms;
  --dur-slow:         500ms;
  --dur-stampede:     8000ms;

  /* ── Borders & Radius ── */
  --radius-sm:        8px;
  --radius-md:        12px;
  --radius-lg:        16px;
  --radius-round:     50%;
  --radius-pill:      999px;
}
```

### 2.2 Color Contrast Guarantees
- All 15 critter card colors are distinct at a glance (no two colors within 30° on HSL wheel)
- Text on surfaces: AAA contrast (white on dark forest = 12:1+)
- Gold glow on free tiles: visible even on warm-colored critter cards
- Danger red: reserved for Game Over — never used elsewhere

---

## 3. TILE DESIGN SYSTEM

### 3.1 Tile Anatomy
```
    ┌────────────────────┐
    │   border-radius     │  50% (perfect circle)
    │                     │
    │  ┌──────────────┐   │
    │  │  ::before    │   │  Ears / horns / accessories going OUTSIDE circle
    │  │  (ears etc.) │   │  clip-path polygons, positioned top area
    │  │              │   │
    │  │  🎨 Face      │   │  ::after = eyes + nose + mouth + details
    │  │  (center)     │   │  radial-gradient + box-shadow combos
    │  │              │   │
    │  └──────────────┘   │
    │                     │
    │  box-shadow         │  Subtle drop shadow (depth)
    │  (outer glow if     │  Golden glow if unblocked
    │   tile is free)     │
    └────────────────────┘
```

### 3.2 Tile States (CSS)
```css
/* ── Base Tile ── */
.tile {
  width: var(--tile-size);
  height: var(--tile-size);
  border-radius: var(--radius-round);
  position: absolute;
  transition: transform var(--dur-fast) var(--ease-smooth),
              filter var(--dur-normal) var(--ease-smooth),
              box-shadow var(--dur-fast) var(--ease-smooth);
  will-change: transform;
  /* Drop shadow for depth between layers */
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

/* ── Blocked (can't tap) ── */
.tile--blocked {
  filter: brightness(0.6) saturate(0.7);
  pointer-events: none;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

/* ── Free (tappable!) ── */
.tile--free {
  cursor: pointer;
  box-shadow:
    0 0 12px var(--clr-gold),
    0 0 24px var(--clr-gold-dim),
    0 2px 8px rgba(0,0,0,0.3);
  animation: glowPulse 2s ease-in-out infinite;
}
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 8px var(--clr-gold), 0 0 16px var(--clr-gold-dim); }
  50%      { box-shadow: 0 0 16px var(--clr-gold), 0 0 32px var(--clr-gold-dim); }
}

/* ── Hover / Active ── */
.tile--free:hover {
  transform: scale(1.08);
  z-index: 100;
}
.tile--free:active {
  transform: scale(0.95);
  transition: transform 80ms ease-out;
}

/* ── Flying to bar ── */
.tile--flying {
  z-index: 9999 !important;
  transition: transform 300ms var(--ease-bounce);
  /* JS sets transform: translate(boardXY → barSlotXY) */
  box-shadow: 0 8px 32px rgba(255,215,0,0.5) !important;
}

/* ── Landed in bar ── */
.tile--in-bar {
  transform: scale(0.8);
  transition: transform 200ms var(--ease-smooth);
}

/* ── Matched (about to vanish) ── */
.tile--matched {
  animation: vanishBurst 0.4s ease-out forwards;
  pointer-events: none;
}
@keyframes vanishBurst {
  0%   { transform: scale(0.8); opacity: 1; }
  30%  { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0); opacity: 0; }
}

/* ── Newly revealed (upper tile removed) ── */
.tile--revealing {
  animation: revealGlow 0.3s ease-out;
}
@keyframes revealGlow {
  0%   { filter: brightness(0.6); }
  100% { filter: brightness(1); }
}
```

### 3.3 CSS Critter Design Example — Full Cat Spec
```css
.critter-cat {
  background: var(--clr-card-cat);
  position: relative;
  overflow: visible; /* Ears go outside */
}

/* Ears — two triangles on top, slightly outside circle */
.critter-cat::before {
  content: '';
  position: absolute;
  top: -12%; left: 8%;
  width: 84%; height: 45%;
  /* Left ear */
  background:
    linear-gradient(135deg, transparent 50%, var(--clr-card-cat) 50%)
      0 0 / 42% 100% no-repeat,
    /* Right ear */
    linear-gradient(225deg, transparent 50%, var(--clr-card-cat) 50%)
      100% 0 / 42% 100% no-repeat;
  /* Inside ear pink */
  background-color: transparent;
  z-index: -1;
  pointer-events: none;
}

/* Face — eyes, nose, whiskers */
.critter-cat::after {
  content: '';
  position: absolute;
  top: 35%; left: 20%;
  width: 60%; height: 35%;
  background:
    /* Left eye */
    radial-gradient(circle at 20% 20%, white 0%, white 30%, transparent 31%),
    radial-gradient(circle at 20% 20%, #1a1a2e 40%, transparent 41%),
    radial-gradient(circle at 20% 10%, white 10%, transparent 11%),
    /* Right eye */
    radial-gradient(circle at 80% 20%, white 0%, white 30%, transparent 31%),
    radial-gradient(circle at 80% 20%, #1a1a2e 40%, transparent 41%),
    radial-gradient(circle at 80% 10%, white 10%, transparent 11%),
    /* Nose */
    radial-gradient(ellipse at 50% 70%, #e91e63 30%, transparent 31%);
  background-repeat: no-repeat;
  pointer-events: none;
}

/* Whiskers via box-shadow on a pseudo of a pseudo... */
/* Actually use an inner span or just boxes */
```

**All 15 critters follow this pattern.** Each uses `::before` for ear/accessory shapes and `::after` for facial features. Total critter CSS: ~800 lines.

---

## 4. LAYOUT SYSTEM

### 4.1 Global Shell
```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  -webkit-text-size-adjust: 100%;
}

body {
  width: 100%;
  height: 100%;
  font-family: var(--font-body);
  color: var(--clr-text);
  background: var(--clr-bg-deep);
  overflow: hidden;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
```

### 4.2 Screen Container
```css
.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.screen {
  position: absolute;
  inset: 0;
  display: none;
  flex-direction: column;
  overflow: hidden;
}
.screen--active {
  display: flex;
}
```

### 4.3 Game Screen Layout
```
┌─────────────────────────────────────┐
│  .game-header (48px)                │
│  [←Back] [🐣Easy] [47/60 tiles]    │
├─────────────────────────────────────┤
│                                     │
│  .board-container (flex: 1)         │
│  ┌───────────────────────────────┐  │
│  │   Multi-layer critter board   │  │
│  │   (absolutely positioned tiles)│  │
│  └───────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│  .bar-container (var(--bar-height)) │
│  [slot] [slot] [slot] [slot]       │
│  [slot] [slot] [slot]              │
├─────────────────────────────────────┤
│  .booster-bar (48px)                │
│  [🔀1] [↩️1] [📤1]                 │
└─────────────────────────────────────┘
```

### 4.4 Home Screen Layout
```
┌─────────────────────────────────────┐
│  .home-header                       │
│  🦊 TripleTails        Day 47 🔥   │
│  🪙 1,250 coins                     │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🐣 EASY GAME                   │  │
│  │ ✓ Completed!  +50🪙           │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🔥 EXTREME HARD                │  │
│  │ ⏳ 17 attempts today           │  │
│  │ 🏆 Best: 8 tiles left         │  │
│  │ [ PLAY ]                       │  │
│  └───────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│  .nav-bar (56px)                    │
│  [🏠Home] [🏆LB] [🛒Shop]          │
│  [💬Chat] [🎨Skins] [ℹ️Info]       │
└─────────────────────────────────────┘
```

---

## 5. LAYER RENDERING SYSTEM

### 5.1 Layer Configuration
```javascript
const LAYER_CONFIGS = {
  easy: {
    totalLayers: 4,
    baseCols: 6,
    baseRows: 6,
    densityCurve: [0.80, 0.65, 0.50, 0.35],
    offsetRange: [6, 7, 8, 8],
    brightness: [0.82, 0.88, 0.94, 1.0],
  },
  extreme: {
    totalLayers: 7,
    baseCols: 7,
    baseRows: 7,
    densityCurve: [0.75, 0.65, 0.55, 0.45, 0.35, 0.25, 0.15],
    offsetRange: [10, 9, 8, 7, 6, 5, 4],
    brightness: [0.70, 0.76, 0.82, 0.88, 0.94, 0.97, 1.0],
  }
};
```

### 5.2 Tile Placement (board.js)
```javascript
function generateLayer(layerIdx, config, tilePool) {
  const cols = config.baseCols - (config.totalLayers > 5 ? layerIdx : 0);
  const rows = config.baseRows - (config.totalLayers > 5 ? layerIdx : 0);
  const density = config.densityCurve[layerIdx];
  const maxOffset = config.offsetRange[layerIdx];
  
  const tiles = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (Math.random() > density) continue;
      
      tiles.push({
        layer: layerIdx,
        row, col,
        x: col * (tileSizePx + gap) + rand(-maxOffset, maxOffset),
        y: row * (tileSizePx + gap) + rand(-maxOffset, maxOffset),
        offsetX: rand(-5, 5),  // Visual micro-jitter
        offsetY: rand(-4, 4),
        critterType: tilePool.pop(),
        color: CRITTER_COLORS[tilePool.last],
        id: `tile-${layerIdx}-${row}-${col}`,
        blocked: true,         // Computed after all layers placed
        brightness: config.brightness[layerIdx],
      });
    }
  }
  return tiles;
}
```

### 5.3 Blocking Detection Algorithm
```javascript
function computeBlocking(allTiles) {
  // Sort by layer descending (top to bottom)
  const sorted = [...allTiles].sort((a, b) => b.layer - a.layer);
  
  for (let i = 0; i < sorted.length; i++) {
    const tile = sorted[i];
    tile.blocked = false;
    
    // Check if any tile ABOVE this one covers it
    for (let j = 0; j < i; j++) {
      const above = sorted[j];
      if (above.layer <= tile.layer) continue;
      
      const overlapX = Math.abs(above.x - tile.x);
      const overlapY = Math.abs(above.y - tile.y);
      const threshold = tileSizePx * 0.55; // 55% overlap = blocked
      
      if (overlapX < threshold && overlapY < threshold) {
        tile.blocked = true;
        tile.blockedBy = above.id;
        break;
      }
    }
  }
}
```

### 5.4 Rendering to DOM
```javascript
function renderBoard(tiles, container) {
  container.innerHTML = '';
  
  // Sort by layer ASC (bottom first) so DOM stacking is correct
  const sorted = [...tiles].sort((a, b) => a.layer - b.layer);
  
  sorted.forEach(tile => {
    const el = document.createElement('div');
    el.className = `tile critter-${tile.critterType}`;
    if (tile.blocked) el.classList.add('tile--blocked');
    else el.classList.add('tile--free');
    
    el.id = tile.id;
    el.style.transform = `translate(${tile.x}px, ${tile.y}px)`;
    el.style.filter = `brightness(${tile.brightness})`;
    el.style.zIndex = tile.layer * 100 + tile.row;
    el.dataset.layer = tile.layer;
    el.dataset.critter = tile.critterType;
    
    el.addEventListener('click', () => onTileTap(tile));
    container.appendChild(el);
  });
}
```

---

## 6. ANIMATION CATALOG

All animations in `animations.css` — no inline styles, no JS-driven CSS.

### 6.1 Gameplay Animations

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| `glowPulse` | 2s loop | ease-in-out | Free tile idle glow |
| `flyToBar` | 300ms | bounce | Tile tap → bar |
| `landInBar` | 200ms | smooth | Tile arrives in bar slot |
| `vanishBurst` | 400ms | ease-out | 3-match detected |
| `gameOverShake` | 500ms | — | 7 diff tiles in bar |
| `revealGlow` | 300ms | ease-out | Upper tile removed |
| `settleIn` | 400ms staggered | ease-out | Board first render |

### 6.2 Booster Animations

| Animation | Duration | Visual |
|-----------|----------|--------|
| `shuffleSwirl` | 600ms | All tiles lift → rotate ±15° → settle new positions |
| `undoFlyBack` | 300ms | Bar tile reverse-flies to board position |
| `ejectTriple` | 400ms | 3 bar tiles simultaneously fly back to board |
| `peekReveal` | 3s | Hidden tiles temporarily gain opacity + brightness |
| `autoMatchRapid` | 450ms | 3 rapid tap-and-vanish sequences |

### 6.3 UI Animations

| Animation | Duration | Context |
|-----------|----------|---------|
| `screenSlideIn` | 300ms | Screen transitions (slide from right) |
| `screenFadeIn` | 250ms | Overlays, modals |
| `bannerBounceIn` | 500ms | Win banner entrance |
| `buttonPress` | 100ms | Button scale feedback |
| `chatMsgIn` | 200ms | New chat message slide up |
| `coinEarned` | 500ms | Coin counter increment (+ bounce) |
| `streakFlame` | 1s loop | Streak fire icon pulse |

### 6.4 Celebration Animations

| Animation | Duration | Detail |
|-----------|----------|--------|
| `screenFlash` | 500ms | White → gold gradient |
| `stampedeRun` | 8s+ | 100+ critters crossing screen |
| `sparkleRain` | continuous | Glowing particles falling |
| `confettiBurst` | 800ms | 20 confetti pieces explode from center |
| `bannerPulse` | 2s loop | "YOU DID IT!" pulsing glow |

---

## 7. SCREEN DESIGNS

### 7.1 Home Screen
```
┌─────────────────────────────────────┐
│                                     │
│        🦊 TripleTails               │  ← Fredoka 700, clamp(24,5vw,36)
│        Day 47 🔥                    │  ← Nunito 400, gold streak icon
│        🪙 1,250                      │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🐣  EASY GAME                │  │  ← Glass card, green highlight
│  │  ✓  Completed!  +50🪙        │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🔥  EXTREME HARD             │  │  ← Glass card, orange highlight
│  │  ⏳  17 attempts today        │  │
│  │  🏆  Best: 8 tiles left      │  │
│  │  ┌───────────────────────┐    │  │
│  │  │      ▶  PLAY           │    │  │  ← CTA button
│  │  └───────────────────────┘    │  │
│  └───────────────────────────────┘  │
│                                     │
│  ─────────────────────────────────  │
│  [🏠] [🏆] [🛒] [💬] [🎨] [ℹ️]     │  ← Fixed bottom nav
└─────────────────────────────────────┘
```

### 7.2 Info Screen (4 Tabs)
```
┌─────────────────────────────────────┐
│  📖 TripleTails Tales        [×]    │
│                                     │
│  [📖Story] [🎯Win] [⚡Boost] [ℹ️]   │  ← Tab bar, active=highlighted
│  ─────────────────────────────────  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │   Tab content (scrollable)    │  │  ← flex:1, overflow-y:auto
│  │                               │  │
│  │   (see PRD Section 5 for      │  │
│  │    full content of each tab)  │  │
│  │                               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Tab styling:**
```css
.info-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.info-tab {
  flex: 1;
  padding: var(--space-sm);
  text-align: center;
  font-family: var(--font-display);
  font-size: clamp(12px, 2.5vw, 14px);
  color: var(--clr-text-dim);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all var(--dur-fast);
}
.info-tab--active {
  color: var(--clr-gold);
  border-bottom-color: var(--clr-gold);
}
```

**Story tab special styling:**
- Italic text for story paragraphs
- Decorative critter silhouettes in corners (CSS pseudo-elements, low opacity)
- "Begin Your Journey →" CTA at bottom

**How to Win tab:**
- Sections with 🎯 ⚠️ 🧠 🔥 icons as visual anchors
- Numbered tips
- Bold key terms

**Boosters tab:**
- Each booster = icon + name + description inline
- Coin icon next to prices

**Info & Disclaimer tab:**
- Smaller font for disclaimer text
- Rules and limits in clean 2-column layout
- Version number at bottom

---

## 8. RESPONSIVE SYSTEM

### 8.1 Breakpoint Strategy
Use `clamp()` for fluid scaling — **no media queries needed** for most cases.

| Element | Fluid Formula | Min @320px | Max @480px |
|---------|--------------|------------|------------|
| Tile size | `clamp(44px, 12vw, 64px)` | 44px | 58px |
| Bar slot | `clamp(40px, 10vw, 56px)` | 40px | 48px |
| Title font | `clamp(20px, 5vw, 36px)` | 20px | 24px |
| Body font | `clamp(13px, 3vw, 16px)` | 13px | 14px |
| Button height | `clamp(40px, 10vh, 52px)` | 40px | 48px |

### 8.2 Special Cases
```css
/* Very small screens (< 320px) — compact mode */
@media (max-width: 319px) {
  :root {
    --tile-size: 40px;
    --bar-slot-size: 36px;
    --bar-height: 60px;
  }
}

/* Tablets (> 768px) — center with max-width */
@media (min-width: 769px) {
  .app-container {
    max-width: 500px;
    margin: 0 auto;
    border-left: 1px solid rgba(255,255,255,0.05);
    border-right: 1px solid rgba(255,255,255,0.05);
  }
}
```

---

## 9. TYPOGRAPHY

| Use | Font | Weight | Size (fluid) | Color |
|-----|------|--------|-------------|-------|
| App title | Fredoka | 700 | `clamp(24px, 5vw, 36px)` | `--clr-text-bright` |
| Screen headers | Fredoka | 600 | `clamp(18px, 4vw, 24px)` | `--clr-text-bright` |
| Card titles | Fredoka | 600 | `clamp(16px, 3.5vw, 20px)` | `--clr-text` |
| Body text | Nunito | 400 | `clamp(14px, 3vw, 16px)` | `--clr-text` |
| Secondary text | Nunito | 400 | `clamp(12px, 2.5vw, 14px)` | `--clr-text-dim` |
| Button text | Fredoka | 600 | `clamp(14px, 3vw, 16px)` | White |
| Chat name | Nunito | 700 | 12px | `--clr-text-dim` |
| Chat message | Nunito | 400 | 13px | `--clr-text` / White |
| Tab labels | Fredoka | 500 | `clamp(11px, 2.5vw, 13px)` | `--clr-text-dim` |
| Code / numbers | 'JetBrains Mono' | 400 | `clamp(12px, 2.5vw, 14px)` | `--clr-gold` |

### 9.1 Font Loading
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
```
Fallback: `system-ui, sans-serif` while fonts load.

---

## 10. INTERACTION PATTERNS

### 10.1 Touch Targets
- Minimum tap target: **44×44px** (WCAG AA)
- Tile size already exceeds this (48–64px)
- Buttons: min-height 44px, min-width 44px (or 100% width for CTAs)
- Booster icons: 44×44px
- Nav bar items: 44×44px active area
- Close (×) button: 44×44px

### 10.2 Gestures
- **Tap:** Select tile, activate booster, navigate
- **Swipe:** Not used (tiles are tapped, not swiped — simpler than Sugar Swipe)
- **Long press:** Not used in v1.0
- **Scroll:** Leaderboard, Chat history, Info tabs, Shop list

### 10.3 Feedback
- **Tap success:** Tile lifts (scale 1.08) → flies to bar
- **Tap blocked:** No response (pointer-events: none on blocked tiles)
- **Button press:** Scale 0.95 for 100ms → scale 1.0
- **Error (game over):** Holding bar shakes + turns red tint
- **Win:** See celebration design
- **Purchase:** Coin counter animates (count down + chime)
- **Insufficient coins:** Button shakes + buzzer sound

### 10.4 Screen Transitions
```css
/* Home → Game: slide up from bottom */
.screen--enter-bottom {
  animation: slideUpIn 300ms var(--ease-smooth);
}
@keyframes slideUpIn {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

/* Game → Home: slide down */
@keyframes slideDownOut {
  from { transform: translateY(0); }
  to   { transform: translateY(100%); }
}

/* Overlays: fade */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

---

## 11. ACCESSIBILITY

| Requirement | Implementation |
|-------------|---------------|
| Touch targets ≥44px | All interactive elements meet this |
| Color not only differentiator | Each critter has UNIQUE silhouette (ear shape, accessory) — not just color |
| Reduced motion | `@media (prefers-reduced-motion)` disables stampede, uses simple fade for all animations |
| High contrast | White text on dark forest = 12:1+ ratio |
| No auto-playing audio | AudioContext resumes on first user tap |
| Viewport not locked | Users can zoom if needed (no `user-scalable=no` on Android? Actually Capacitor needs it — compromise: allow zoom on web, lock on APK) |

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .stampede-container { display: none; }  /* No stampede */
  .tile--flying { transition: none !important; }  /* Instant teleport */
}
```

---

## 12. PERFORMANCE SPECS

| Metric | Target | Strategy |
|--------|--------|----------|
| First Contentful Paint | < 1.0s | Inline critical CSS, deferred font loading |
| Time to Interactive | < 1.5s | Minimal JS parse, no frameworks |
| Board render (60 tiles) | < 100ms | DOM batch insert via DocumentFragment |
| Tile tap → visual response | < 50ms | Direct style manipulation, no framework overhead |
| Animation FPS | 60fps | GPU-accelerated transforms only (no `top`/`left`) |
| Stampede (120 sprites) | 60fps | Object pool, `requestAnimationFrame`, `will-change` |
| Total JS parse size | < 80 KB | Vanilla JS, no dependencies |
| Total CSS size | < 30 KB | Shared variables, no duplicate rules |
| localStorage usage | < 200 KB | JSON serialization, periodic cleanup |
| Memory (idle) | < 30 MB | Clean DOM between screens |
| Memory (stampede) | < 60 MB | Temporary object pool, cleared on dismiss |
| APK size | < 5 MB | Capacitor shell + www assets only |

### 12.1 Optimization Rules
- Always use `transform` and `opacity` for animations (GPU-composited)
- Never animate `width`, `height`, `top`, `left`, `margin`, `padding`
- Use `will-change: transform` on tiles that will animate
- Remove `will-change` after animation ends
- Batch DOM reads/writes to avoid layout thrashing
- Use `requestAnimationFrame` for the stampede loop
- Debounce resize/orientation-change handlers (200ms)

---

## 13. LOCALSTORAGE SCHEMA

All keys prefixed `tt_` to avoid collisions.

| Key | Type | Content |
|-----|------|---------|
| `tt_progress` | JSON | `{ day, easyCompleted, hardCompleted, attempts, bestRemaining, streak, lastPlayDate }` |
| `tt_coins` | Number | Current coin balance |
| `tt_inventory` | JSON | `{ shuffle: N, undo: N, eject: N, peek: N, autoMatch: N }` |
| `tt_collections` | JSON | `{ owned: ["forest","ocean"], active: "forest" }` |
| `tt_leaderboard` | JSON | `{ day, playerRank, playerTime, bots: [...] }` |
| `tt_chat_log` | JSON | `[...{sender, msg, time}]` (max 50 entries) |
| `tt_settings` | JSON | `{ muted: false, reducedMotion: false }` |
| `tt_admin` | Boolean | Admin mode active (session only — not persisted) |
| `tt_first_launch` | Boolean | Has user launched before? |
| `tt_bot_assignment` | String | Hash of assigned alliance bots |

---

## 14. COMPONENT GLOSSARY

Quick reference for phase implementation:

| Component | File | Visual Description |
|-----------|------|-------------------|
| **Tile** | `tiles.js` + `critter-designs.css` | 48–64px circle with CSS animal face, colored background, glow ring |
| **Tile Stack** | `board.js` | Multi-layer absolute-positioned tiles with random scatter offsets |
| **Holding Bar** | `matching.js` + `main.css` | 7 rounded-rect slots, dark glass background, glow on fill |
| **Booster Bar** | `boosters.js` + `main.css` | 3–5 circular icon buttons with count badges |
| **Game Card** | `ui.js` + `main.css` | Glass-morphism card for easy/hard game status on home screen |
| **Nav Bar** | `ui.js` + `main.css` | 6-icon fixed bottom nav, active state highlighted |
| **Leaderboard Row** | `leaderboard.js` + `main.css` | Rank + avatar + name + time, player row gold highlighted |
| **Chat Bubble** | `social.js` + `main.css` | Left-aligned (bot), right-aligned (player), timestamp |
| **Shop Card** | `shop.js` + `main.css` | Item image + name + price + buy button |
| **Collection Grid** | `collections.js` + `main.css` | 3×5 preview tiles, equip button |
| **Info Tabs** | `info.js` + `main.css` | 4-tab bar, scrollable content area |
| **Admin Panel** | `main.js` + `main.css` | Dark overlay panel, gold text, grid of buttons |
| **Celebration** | `celebration.js` | Full-screen overlay, stampede sprites, particle system |
| **Win Overlay** | `ui.js` | Centered card with stats, coin reward, continue button |
| **Game Over Overlay** | `ui.js` | Centered card with stats, "Try Again" button |

---

_Last updated: June 20, 2026 | v1.0 | Jerrison & Luffy 🏴‍☠️_
