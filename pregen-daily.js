// pregen-daily.js — Generate 30 days of solver-verified TripleTails boards
// Run: node pregen-daily.js
const fs = require('fs');
const path = require('path');

// ── Seeded PRNG ──
let seed = 0;
function seedRandom() {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}
function randInt(min, max) {
  return Math.floor(seedRandom() * (max - min + 1)) + min;
}
function pick(arr) { return arr[Math.floor(seedRandom() * arr.length)]; }

// ── Config ──
const TILE_SIZE = 44;
const GAP = 4;
const STEP = TILE_SIZE + GAP;
const CRITTERS = ['elephant','giraffe','hippo','monkey','panda','parrot','penguin','pig','rabbit','snake'];

const EASY_CONFIG = { totalLayers: 2, typeCount: 3, totalTileTarget: 21 };
const HARD_CONFIG = { totalLayers: 7, typeCount: 10, totalTileTarget: 120 };

// ── Patterns ──
const PATTERNS = {
  square(r, c) { const out=[]; for(let i=0;i<r;i++)for(let j=0;j<c;j++)out.push({row:i,col:j}); return out; },
  lines(n, per) { const out=[]; for(let i=0;i<n;i++)for(let j=0;j<per;j++)out.push({row:i,col:j}); return out; },
  ring(r, c) { const out=[]; for(let i=0;i<r;i++)for(let j=0;j<c;j++)if(i===0||i===r-1||j===0||j===c-1)out.push({row:i,col:j}); return out; },
  cross(r, c) { const out=[]; const mr=Math.floor(r/2),mc=Math.floor(c/2); for(let i=0;i<r;i++)out.push({row:i,col:mc}); for(let j=0;j<c;j++)if(j!==mc)out.push({row:mr,col:j}); return out; },
  diamond(w) { const out=[]; const mid=Math.floor(w/2); for(let c=0;c<w;c++){const off=Math.abs(c-mid);const n=w-off*2;const sr=mid-Math.floor(n/2);for(let r=0;r<n;r++)out.push({row:sr+r,col:c})} return out; }
};

// ── Solver ──
function aabbOverlap(ax, ay, bx, by) {
  return (ax < bx + TILE_SIZE) && (ax + TILE_SIZE > bx) && (ay < by + TILE_SIZE) && (ay + TILE_SIZE > by);
}

function solve(boardTiles, timeoutMs = 30000) {
  const startTime = Date.now();
  let nodesExplored = 0;
  const MAX_BAR = 7;

  const tiles = new Map();
  for (const t of boardTiles) tiles.set(t.id, { ...t });

  const blockedBy = new Map();
  for (const [id, tile] of tiles) blockedBy.set(id, new Set());
  for (const [id, tile] of tiles) {
    for (const [otherId, other] of tiles) {
      if (other.layer <= tile.layer) continue;
      if (aabbOverlap(tile.x, tile.y, other.x, other.y)) {
        blockedBy.get(id).add(otherId);
      }
    }
  }

  const allIds = new Set(tiles.keys());

  function getFree(removed) {
    const free = [];
    for (const id of allIds) {
      if (removed.has(id)) continue;
      let blocked = false;
      for (const blockerId of blockedBy.get(id)) {
        if (!removed.has(blockerId)) { blocked = true; break; }
      }
      if (!blocked) free.push(id);
    }
    return free;
  }

  let bestRemaining = Infinity;

  function backtrack(removed, bar) {
    nodesExplored++;
    if (nodesExplored % 10000 === 0 && Date.now() - startTime > timeoutMs) return null;
    if (removed.size === allIds.size) return [];
    const remaining = allIds.size - removed.size;
    if (remaining < bestRemaining) bestRemaining = remaining;

    const free = getFree(removed);
    if (free.length === 0) return null;

    const barCounts = {};
    for (const t of bar) barCounts[t] = (barCounts[t] || 0) + 1;

    const scored = free.map(id => ({ id, type: tiles.get(id).critterType, inBar: barCounts[tiles.get(id).critterType] || 0 }));
    scored.sort((a, b) => b.inBar - a.inBar);

    for (const { id, type } of scored) {
      const newRemoved = new Set(removed);
      newRemoved.add(id);
      const newBar = [...bar, type];
      const typeCount = newBar.filter(t => t === type).length;

      if (typeCount >= 3) {
        let d = 0;
        const afterMatch = [];
        for (const t of newBar) { if (t === type && d < 3) d++; else afterMatch.push(t); }
        const result = backtrack(newRemoved, afterMatch);
        if (result) return [id, ...result];
      } else if (newBar.length >= MAX_BAR) {
        continue;
      } else {
        const result = backtrack(newRemoved, newBar);
        if (result) return [id, ...result];
      }
    }
    return null;
  }

  const solution = backtrack(new Set(), []);
  const elapsed = Date.now() - startTime;
  if (solution) {
    console.log(`  [Solver] Solved in ${elapsed}ms, ${nodesExplored} nodes, ${solution.length} moves`);
  } else {
    console.log(`  [Solver] Unsolvable after ${elapsed}ms, ${nodesExplored} nodes (best remaining: ${bestRemaining})`);
  }
  return solution;
}

// ── Board Generator ──
function generateBoard(config) {
  let totalTiles = config.totalTileTarget;
  if (totalTiles % 3 !== 0) totalTiles += (3 - totalTiles % 3);

  const tiles = [];
  let id = 0;

  // Build tile pool: ensure multiples of 3 per type
  const typesPool = CRITTERS.slice(0, config.typeCount);
  const tileTypes = [];
  for (let i = 0; i < totalTiles / 3; i++) {
    const type = pick(typesPool);
    tileTypes.push(type, type, type);
  }
  // Shuffle
  for (let i = tileTypes.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [tileTypes[i], tileTypes[j]] = [tileTypes[j], tileTypes[i]];
  }

  // Generate layers
  const layerData = [];
  for (let layer = 0; layer < config.totalLayers; layer++) {
    const isBottom = layer === 0;
    let pat, rows, cols;

    if (config.totalLayers === 2) {
      if (isBottom) { pat = pick(['square','lines']); rows = 5; cols = 5; }
      else { pat = 'square'; rows = 3; cols = 3; }
    } else {
      const bottomOptions = ['square', 'lines'];
      const midOptions = ['square', 'ring', 'cross'];
      const topOptions = ['square'];
      const options = isBottom ? bottomOptions : (layer === config.totalLayers - 1 ? topOptions : midOptions);
      pat = pick(options);

      switch (pat) {
        case 'square':
          if (isBottom) { rows = randInt(6, 8); cols = randInt(6, 8); }
          else if (layer === config.totalLayers - 1) { rows = randInt(2, 3); cols = randInt(2, 3); }
          else if (layer <= 2) { rows = randInt(4, 6); cols = randInt(4, 6); }
          else { rows = randInt(3, 5); cols = randInt(3, 5); }
          break;
        case 'lines': rows = randInt(3, 5); cols = randInt(5, 8); break;
        case 'ring': rows = randInt(5, 7); cols = randInt(5, 7); break;
        case 'cross': rows = randInt(5, 7); cols = randInt(5, 7); break;
        default: rows = 4; cols = 4;
      }
    }

    const cells = PATTERNS[pat](rows, cols);
    layerData.push({ cells, rows, cols });
  }

  // Calculate board bounds for centering
  let maxCols = 0, maxRows = 0;
  for (const ld of layerData) {
    if (ld.cols > maxCols) maxCols = ld.cols;
    if (ld.rows > maxRows) maxRows = ld.rows;
  }
  const boardW = maxCols * STEP;
  const boardH = maxRows * STEP;

  // Place tiles per layer
  let poolIdx = 0;
  for (let li = 0; li < layerData.length; li++) {
    const { cells, rows, cols } = layerData[li];
    const layerW = cols * STEP;
    const layerH = rows * STEP;
    // Center this layer within board bounds
    const baseX = Math.round((boardW - layerW) / 2 + seedRandom() * STEP * 0.6 - STEP * 0.3);
    const baseY = Math.round((boardH - layerH) / 2 + seedRandom() * STEP * 0.6 - STEP * 0.3);

    const shuffledCells = [...cells].sort(() => seedRandom() - 0.5);
    for (const cell of shuffledCells) {
      if (poolIdx >= tileTypes.length) break;
      tiles.push({
        id: `t${id++}`,
        critterType: tileTypes[poolIdx++],
        layer: li,
        x: Math.round(baseX + cell.col * STEP),
        y: Math.round(baseY + cell.row * STEP),
        row: cell.row,
        col: cell.col,
      });
    }
  }



  // If not all tiles placed, fill remaining on bottom layer
  while (poolIdx < tileTypes.length) {
    const extraCol = poolIdx % 10;
    const extraRow = Math.floor(poolIdx / 10);
    tiles.push({
      id: `t${id++}`,
      critterType: tileTypes[poolIdx++],
      layer: 0,
      x: Math.round(extraCol * STEP),
      y: Math.round(extraRow * STEP + boardH + STEP),
      row: extraRow + 50,
      col: extraCol,
    });
  }
    return tiles;
}

// ── Pre-generate daily boards ──
function pregenDay(dayOffset, difficulty, config) {
  const daySeed = 20260621 + dayOffset;
  seed = (daySeed * 2654435761 + 20260620) % 2147483647;

  const maxRetries = difficulty === 'easy' ? 50 : 500;
  const solverTimeout = difficulty === 'easy' ? 10000 : 90000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Fresh seed per attempt
    seed = ((daySeed * 2654435761 + 20260620 + attempt * 999983) % 2147483647 + 2147483647) % 2147483647;

    const tiles = generateBoard(config);
    console.log(`Day +${dayOffset} ${difficulty} attempt ${attempt}: ${tiles.length} tiles`);

    const solution = solve(tiles, solverTimeout);
    if (solution) {
      // Strip out solution (just return tiles array)
      // Only keep essential fields
      const slimTiles = tiles.map(t => ({
        id: t.id,
        critterType: t.critterType,
        layer: t.layer,
        x: t.x,
        y: t.y,
        row: t.row,
        col: t.col,
      }));
      return { tiles: slimTiles, solution: null, seed: seed };
    }
    console.log(`  Attempt ${attempt}: unsolvable`);
  }

  console.error(`FAILED to generate ${difficulty} for day +${dayOffset} after ${maxRetries} attempts!`);
  return null;
}

// ── Main ──
console.log('=== TripleTails Daily Board Pre-Generator ===');
console.log(`Easy: ${EASY_CONFIG.totalLayers} layers, ${EASY_CONFIG.typeCount} types, ~${EASY_CONFIG.totalTileTarget} tiles`);
console.log(`Hard: ${HARD_CONFIG.totalLayers} layers, ${HARD_CONFIG.typeCount} types, ~${HARD_CONFIG.totalTileTarget} tiles`);
console.log('');

const daily = {};
const startDay = 20260621;
const DAYS_TO_GEN = 7;
const outPath = path.join(__dirname, 'data', 'daily.json');

// Load existing if any
if (fs.existsSync(outPath)) {
  try { Object.assign(daily, JSON.parse(fs.readFileSync(outPath, 'utf8'))); console.log('Loaded existing daily.json'); } catch(e) {}
}

for (let day = 0; day < DAYS_TO_GEN; day++) {
  const dateStr = String(startDay + day);
  const formatted = `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
  if (daily[formatted]) { console.log(`\n=== ${formatted} already exists, skipping ===`); continue; }
  console.log(`\n=== Generating ${formatted} (day ${day + 1}/${DAYS_TO_GEN}) ===`);

  const easy = pregenDay(day, 'easy', EASY_CONFIG);
  const hard = pregenDay(day, 'hard', HARD_CONFIG);

  if (easy && hard) {
    daily[formatted] = { easy: easy.tiles, hard: hard.tiles };
    fs.writeFileSync(outPath, JSON.stringify(daily, null, 2));
    console.log(`  ✅ ${formatted} DONE (saved)`);
  } else {
    console.log(`  ❌ ${formatted} FAILED`);
  }
}

console.log(`\n✅ Written ${Object.keys(daily).length} days to ${outPath}`);
