// board.js — TripleTails v1.5
// Geometric grid layers, rectangle-intersection blocking, debug logging
// Phase 3: 7-layer hard mode with solver-verified solvability
const Board = {
  container: null,
  canvas: null,
  tiles: [],
  tileElements: {},
  tileSizePx: 44,
  gap: 4,

  LAYER_CONFIGS: {
    easy: { totalLayers: 2, typeCount: 3, totalTileTarget: 21 },
    hard: { totalLayers: 7, typeCount: 10, totalTileTarget: 120 }
  },

  // Geometric pattern generators — return array of {row,col} positions
  PATTERNS: {
    square(rows, cols) {
      const cells = [];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          cells.push({ row: r, col: c });
      return cells;
    },
    lines(numLines, cardsPerLine) {
      const cells = [];
      for (let r = 0; r < numLines; r++)
        for (let c = 0; c < cardsPerLine; c++)
          cells.push({ row: r, col: c });
      return cells;
    },
    ring(rows, cols) {
      const cells = [];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1)
            cells.push({ row: r, col: c });
      return cells;
    },
    cross(rows, cols) {
      const cells = [];
      const midRow = Math.floor(rows / 2);
      const midCol = Math.floor(cols / 2);
      for (let r = 0; r < rows; r++) cells.push({ row: r, col: midCol });
      for (let c = 0; c < cols; c++)
        if (c !== midCol) cells.push({ row: midRow, col: c });
      return cells;
    },
    diamond(width) {
      const cells = [];
      const mid = Math.floor(width / 2);
      for (let c = 0; c < width; c++) {
        const off = Math.abs(c - mid);
        const n = width - off * 2;
        const sr = mid - Math.floor(n / 2);
        for (let r = 0; r < n; r++) cells.push({ row: sr + r, col: c });
      }
      return cells;
    }
  },

  init(containerEl) {
    this.container = containerEl;
    this._readTileSize();
    this.canvas = document.createElement('div');
    this.canvas.className = 'board-canvas';
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
  },

  _readTileSize() {
    const style = getComputedStyle(document.documentElement);
    this.tileSizePx = parseInt(style.getPropertyValue('--tile-size')) || 44;
    this.gap = parseInt(style.getPropertyValue('--tile-gap')) || 4;
  },

  _rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },

  // ── Layer pattern selection ──
  _chooseLayerPattern(layerIdx, totalLayers, isBottom) {
    const bottomOptions = ['square', 'lines'];
    const midOptions = ['square', 'ring', 'cross'];
    const topOptions = ['square'];

    const options = isBottom ? bottomOptions
      : (layerIdx === totalLayers - 1 ? topOptions : midOptions);
    const pattern = this._pick(options);

    let rows, cols;
    if (totalLayers === 2) {
      // 2-layer game (easy): fixed sizes for reliable gameplay
      if (isBottom) { rows = 5; cols = 5; }
      else          { rows = 3; cols = 3; }
    } else {
      // 7-layer game (hard): bigger boards, more tiles
      switch (pattern) {
        case 'square':
          if (isBottom) { rows = this._rand(6, 8); cols = this._rand(6, 8); }
          else if (layerIdx === totalLayers - 1) { rows = this._rand(2, 3); cols = this._rand(2, 3); }
          else if (layerIdx <= 2) { rows = this._rand(4, 6); cols = this._rand(4, 6); }
          else { rows = this._rand(3, 5); cols = this._rand(3, 5); }
          break;
        case 'lines': rows = this._rand(3, 5); cols = this._rand(5, 8); break;
        case 'ring':  rows = this._rand(5, 7); cols = this._rand(5, 7); break;
        case 'cross':  rows = this._rand(5, 7); cols = this._rand(5, 7); break;
        default: rows = 4; cols = 4;
      }
    }
    return { pattern, rows, cols };
  },

  // Convert pattern cells to absolute pixel positions
  _cellsToPositions(cells, offsetX, offsetY) {
    const step = this.tileSizePx + this.gap;
    return cells.map(c => ({
      x: offsetX + c.col * step,
      y: offsetY + c.row * step
    }));
  },

  // Rectangle intersection — AABB overlap test
  _rectsOverlap(ax, ay, bx, by) {
    const s = this.tileSizePx;
    // rect A: (ax, ay, ax+s, ay+s), rect B: (bx, by, bx+s, by+s)
    return (ax < bx + s) && (ax + s > bx) && (ay < by + s) && (ay + s > by);
  },

  generate(difficulty, tilePool) {
    this._readTileSize();
    const config = this.LAYER_CONFIGS[difficulty];
    this.tiles = [];
    this.tileElements = {};
    let poolIdx = 0;
    const layerData = [];
    const step = this.tileSizePx + this.gap;

    for (let layer = 0; layer < config.totalLayers; layer++) {
      const isBottom = (layer === 0);
      const prev = layer > 0 ? layerData[layer - 1] : null;

      const { pattern, rows, cols } = this._chooseLayerPattern(
        layer, config.totalLayers, isBottom
      );

      const cells = this.PATTERNS[pattern](rows, cols);
      const patternW = cols * step - this.gap;
      const patternH = rows * step - this.gap;

      let offsetX, offsetY;
      if (isBottom) { offsetX = 0; offsetY = 0; }
      else {
        const prevW = prev.cols * step - this.gap;
        const prevH = prev.rows * step - this.gap;
        offsetX = prev.offsetX + (prevW - patternW) / 2;
        offsetY = prev.offsetY + (prevH - patternH) / 2;
        const maxShift = Math.floor(step * 0.6);
        offsetX += this._rand(-maxShift, maxShift);
        offsetY += this._rand(-maxShift, maxShift);
      }

      const positions = this._cellsToPositions(cells, offsetX, offsetY);
      const tileCount = Math.min(positions.length, tilePool.length - poolIdx);

      for (let i = 0; i < tileCount; i++) {
        const tile = {
          id: `t-${layer}-${i}`,
          layer,
          row: cells[i].row,
          col: cells[i].col,
          x: positions[i].x,
          y: positions[i].y,
          critterType: tilePool[poolIdx++],
          blocked: false,
          brightness: 1.0 - layer * 0.1,
          removed: false
        };
        this.tiles.push(tile);
      }

      layerData.push({ rows, cols, offsetX, offsetY, pattern, tileCount });
    }

    // Initial blocking computation
    try {
      this._computeBlocking();
    } catch(e) {
      console.error('[Board] _computeBlocking error during generate:', e);
    }

    this._debugPrint('generate');
    return this.tiles;
  },

  _computeBlocking() {
    if (this.tileSizePx === undefined) {
      console.error('[Board] tileSizePx is undefined!');
      this._readTileSize();
    }

    // Build layer map from remaining tiles only
    const byLayer = {};
    for (const tile of this.tiles) {
      if (tile.removed) continue;
      if (tile.layer === undefined) { console.error('[Board] tile missing layer:', tile); continue; }
      if (!byLayer[tile.layer]) byLayer[tile.layer] = [];
      byLayer[tile.layer].push(tile);
    }

    const layerKeys = Object.keys(byLayer).map(Number);
    const maxLayer = layerKeys.length > 0 ? Math.max(...layerKeys) : -1;

    // Process each tile — only non-removed tiles matter
    for (const tile of this.tiles) {
      tile.blocked = false;
      if (tile.removed) continue;

      // Check for ANY overlap from ANY higher layer
      for (let l = tile.layer + 1; l <= maxLayer; l++) {
        const aboves = byLayer[l];
        if (!aboves) continue;
        for (const above of aboves) {
          if (this._rectsOverlap(tile.x, tile.y, above.x, above.y)) {
            tile.blocked = true;
            break;
          }
        }
        if (tile.blocked) break;
      }
    }
  },

  refreshBlocking() {
    try {
      this._computeBlocking();
    } catch(e) {
      console.error('[Board] _computeBlocking error:', e);
      return;
    }
    try {
      this._updateDomBlocking();
    } catch(e) {
      console.error('[Board] _updateDomBlocking error:', e);
    }
    this._debugPrint('refreshBlocking');
  },

  _getBounds(tiles) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const t of tiles) {
      if (t.x < minX) minX = t.x;
      if (t.x + this.tileSizePx > maxX) maxX = t.x + this.tileSizePx;
      if (t.y < minY) minY = t.y;
      if (t.y + this.tileSizePx > maxY) maxY = t.y + this.tileSizePx;
    }
    if (minX === Infinity) return { minX: 0, minY: 0, width: 0, height: 0 };
    return { minX, minY, width: maxX - minX, height: maxY - minY };
  },

  render() {
    const sorted = [...this.tiles].filter(t => !t.removed)
      .sort((a, b) => a.layer - b.layer);

    if (!sorted.length) {
      this.canvas.innerHTML = '';
      this.canvas.style.width = '0px';
      this.canvas.style.height = '0px';
      this.canvas.style.transform = 'none';
      return;
    }

    const bounds = this._getBounds(sorted);
    const padding = this.tileSizePx;
    const canvasW = Math.ceil(bounds.width + padding * 2);
    const canvasH = Math.ceil(bounds.height + padding * 2);

    this.canvas.style.width = canvasW + 'px';
    this.canvas.style.height = canvasH + 'px';
    this.canvas.innerHTML = '';

    const cw = this.container.clientWidth || 360;
    const ch = this.container.clientHeight || 500;
    const scale = Math.min((cw - 16) / canvasW, (ch - 16) / canvasH, 1.0);
    this.canvas.style.transform = `scale(${scale})`;
    this.canvas.style.transformOrigin = 'center center';

    console.log(`[Board] Render: ${sorted.length} tiles, canvas ${canvasW}x${canvasH}, scale ${scale.toFixed(3)}`);
    const freeCount = sorted.filter(t => !t.blocked).length;
    console.log(`[Board] Free tiles: ${freeCount}/${sorted.length}`);

    sorted.forEach((tile, idx) => {
      const el = document.createElement('div');
      el.className = `tile ${Tiles.getClass(tile.critterType)}`;
      if (tile.blocked) el.classList.add('tile--blocked');
      else el.classList.add('tile--free');
      el.id = tile.id;

      const cx = tile.x - bounds.minX + padding;
      const cy = tile.y - bounds.minY + padding;
      el.style.transform = `translate(${cx}px, ${cy}px)`;
      el.style.filter = `brightness(${tile.brightness})`;
      el.style.zIndex = tile.layer * 100 + tile.row;
      el.style.animationDelay = `${idx * 10}ms`;
      el.style.animation = 'settleIn 400ms ease-out';
      el.dataset.layer = tile.layer;
      el.dataset.critter = tile.critterType;

      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (tile.blocked) {
          console.log(`[Board] Tap BLOCKED: ${tile.id} (${tile.critterType}, layer ${tile.layer})`);
        } else {
          console.log(`[Board] Tap FREE: ${tile.id} (${tile.critterType}, layer ${tile.layer})`);
        }
        Input.onTileTap(tile, el);
      });

      this.canvas.appendChild(el);
      this.tileElements[tile.id] = el;
    });
  },

  _updateDomBlocking() {
    let changed = 0;
    for (const tile of this.tiles) {
      if (tile.removed) continue;
      const el = this.tileElements[tile.id];
      if (!el) {
        console.warn(`[Board] Missing DOM element for tile ${tile.id}`);
        continue;
      }
      if (tile.blocked) {
        if (!el.classList.contains('tile--blocked')) {
          el.classList.add('tile--blocked');
          el.classList.remove('tile--free');
          changed++;
        }
      } else {
        if (!el.classList.contains('tile--free')) {
          el.classList.remove('tile--blocked');
          el.classList.add('tile--free');
          changed++;
        }
      }
    }
    if (changed > 0) console.log(`[Board] _updateDomBlocking: ${changed} tiles changed status`);
  },

  _debugPrint(label) {
    const summary = {};
    for (const tile of this.tiles) {
      if (tile.removed) continue;
      const key = `L${tile.layer}`;
      if (!summary[key]) summary[key] = { total: 0, blocked: 0, free: 0 };
      summary[key].total++;
      if (tile.blocked) summary[key].blocked++;
      else summary[key].free++;
    }
    console.log(`[Board] ${label}:`, summary);
  },

  getFreeTileOfType(type) {
    return this.tiles.find(t => !t.removed && !t.blocked && t.critterType === type) || null;
  },

  remainingCount() {
    return this.tiles.filter(t => !t.removed).length;
  },

  totalCount() {
    return this.tiles.length;
  },

  removeTile(tileId) {
    const tile = this.tiles.find(t => t.id === tileId);
    if (tile) {
      tile.removed = true;
      const el = this.tileElements[tileId];
      if (el) {
        el.classList.add('tile--matched');
        setTimeout(() => { if (el.parentNode) el.remove(); }, 400);
      }
      delete this.tileElements[tileId];
      Audio.match();
    }
  },

  shuffle() {
    const remaining = this.tiles.filter(t => !t.removed);
    const types = remaining.map(t => t.critterType);
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    remaining.forEach((t, i) => { t.critterType = types[i]; });
    try { this._computeBlocking(); } catch(e) { console.error('[Board] shuffle blocking error:', e); }
    this.render();
  }
};
