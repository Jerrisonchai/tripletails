// board.js — TripleTails v1.3
// Geometric grid layers (no random scatter), rectangle-intersection blocking
const Board = {
  container: null,
  canvas: null,
  tiles: [],
  tileElements: {},
  tileSizePx: 44,
  gap: 4,

  LAYER_CONFIGS: {
    easy: { totalLayers: 4, typeCount: 6, totalTileTarget: 54 },
    hard: { totalLayers: 5, typeCount: 8, totalTileTarget: 90 }
  },

  // Geometric pattern generators — return array of {row,col} positions
  PATTERNS: {
    // Filled rectangle: rows × cols
    square(rows, cols) {
      const cells = [];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          cells.push({ row: r, col: c });
      return cells;
    },
    // Horizontal lines: numLines lines of cardsPerLine each
    lines(numLines, cardsPerLine) {
      const cells = [];
      for (let r = 0; r < numLines; r++)
        for (let c = 0; c < cardsPerLine; c++)
          cells.push({ row: r, col: c });
      return cells;
    },
    // Hollow ring around perimeter of rows×cols
    ring(rows, cols) {
      const cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
            cells.push({ row: r, col: c });
          }
        }
      }
      return cells;
    },
    // Cross: horizontal strip + vertical strip
    cross(rows, cols) {
      const cells = [];
      const midRow = Math.floor(rows / 2);
      const midCol = Math.floor(cols / 2);
      for (let r = 0; r < rows; r++) cells.push({ row: r, col: midCol });
      for (let c = 0; c < cols; c++) {
        if (c !== midCol) cells.push({ row: midRow, col: c });
      }
      return cells;
    },
    // Diamond-ish: expanding then contracting rows
    diamond(width) {
      const cells = [];
      const mid = Math.floor(width / 2);
      for (let c = 0; c < width; c++) {
        const off = Math.abs(c - mid);
        const numInCol = width - off * 2;
        const startRow = mid - Math.floor(numInCol / 2);
        for (let r = 0; r < numInCol; r++) {
          cells.push({ row: startRow + r, col: c });
        }
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

  _pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // ── Layer pattern selection ──
  _chooseLayerPattern(layerIdx, totalLayers, prevRows, prevCols, isBottom) {
    // Each layer randomly picks a geometric pattern
    const bottomOptions = ['square', 'lines', 'diamond'];
    const midOptions = ['square', 'ring', 'cross', 'lines'];
    const topOptions = ['square', 'cross', 'ring'];

    const options = isBottom ? bottomOptions
      : (layerIdx === totalLayers - 1 ? topOptions : midOptions);

    const pattern = this._pick(options);

    // Pick dimensions that work well
    let rows, cols;
    switch (pattern) {
      case 'square':
        if (isBottom) {
          rows = this._rand(5, 7);
          cols = this._rand(5, 7);
        } else if (layerIdx === totalLayers - 1) {
          rows = this._rand(2, 3);
          cols = this._rand(2, 3);
        } else {
          rows = this._rand(3, 5);
          cols = this._rand(3, 5);
        }
        break;
      case 'lines':
        rows = this._rand(2, 4);
        cols = this._rand(5, 8);
        break;
      case 'ring':
        rows = this._rand(4, 6);
        cols = this._rand(4, 6);
        break;
      case 'cross':
        rows = this._rand(4, 6);
        cols = this._rand(4, 6);
        break;
      case 'diamond':
        cols = this._rand(5, 7);
        rows = cols;
        break;
      default:
        rows = 4; cols = 4;
    }

    return { pattern, rows, cols };
  },

  // Convert pattern cells to absolute pixel positions
  _cellsToPositions(cells, rows, cols, offsetX, offsetY) {
    const step = this.tileSizePx + this.gap;
    // Center the pattern in its own bounding box area
    const patternW = cols * step - this.gap;
    const patternH = rows * step - this.gap;
    const startX = offsetX;
    const startY = offsetY;
    return cells.map(c => ({
      x: startX + c.col * step,
      y: startY + c.row * step
    }));
  },

  // Rectangle intersection check
  _rectsOverlap(ax, ay, bx, by) {
    const s = this.tileSizePx;
    return ax < bx + s && ax + s > bx && ay < by + s && ay + by > by;
  },

  generate(difficulty, tilePool) {
    this._readTileSize();
    const config = this.LAYER_CONFIGS[difficulty];
    this.tiles = [];
    this.tileElements = {};
    let poolIdx = 0;

    // Track all placed layer info for positioning
    const layerData = [];

    // Generate each layer
    for (let layer = 0; layer < config.totalLayers; layer++) {
      const isBottom = (layer === 0);
      const prev = layer > 0 ? layerData[layer - 1] : null;

      const { pattern, rows, cols } = this._chooseLayerPattern(
        layer, config.totalLayers, prev ? prev.rows : 0, prev ? prev.cols : 0, isBottom
      );

      const cells = this.PATTERNS[pattern](rows, cols);
      const step = this.tileSizePx + this.gap;
      const patternW = cols * step - this.gap;
      const patternH = rows * step - this.gap;

      // Position: centered by default, with controlled random offset
      let offsetX, offsetY;

      if (isBottom) {
        // Bottom layer centered at origin
        offsetX = 0;
        offsetY = 0;
      } else {
        // Upper layer: center over the previous layer, then random shift
        const prevW = (prev.cols * step - this.gap);
        const prevH = (prev.rows * step - this.gap);
        // Center over previous layer
        offsetX = prev.offsetX + (prevW - patternW) / 2;
        offsetY = prev.offsetY + (prevH - patternH) / 2;
        // Random shift (so not perfectly centered — adds variety)
        const maxShift = Math.floor(step * 0.8);
        offsetX += this._rand(-maxShift, maxShift);
        offsetY += this._rand(-maxShift, maxShift);
      }

      const positions = this._cellsToPositions(cells, rows, cols, offsetX, offsetY);

      // Ensure we don't exceed pool
      const tileCount = Math.min(positions.length, tilePool.length - poolIdx);

      for (let i = 0; i < tileCount; i++) {
        const pos = positions[i];
        const id = `t-${layer}-${i}`;
        const tile = {
          id,
          layer,
          row: cells[i].row,
          col: cells[i].col,
          x: pos.x,
          y: pos.y,
          critterType: tilePool[poolIdx++],
          blocked: true,
          brightness: 1.0 - layer * 0.08,
          removed: false
        };
        this.tiles.push(tile);
      }

      layerData.push({ rows, cols, offsetX, offsetY, pattern, tileCount });
    }

    this._computeBlocking();
    return this.tiles;
  },

  _computeBlocking() {
    // Group tiles by layer
    const byLayer = {};
    for (const tile of this.tiles) {
      if (!byLayer[tile.layer]) byLayer[tile.layer] = [];
      byLayer[tile.layer].push(tile);
    }
    const maxLayer = Math.max(...Object.keys(byLayer).map(Number));

    for (const tile of this.tiles) {
      tile.blocked = false;
      // Check all tiles in ALL higher layers for rectangle overlap
      for (let l = tile.layer + 1; l <= maxLayer; l++) {
        if (!byLayer[l]) continue;
        for (const above of byLayer[l]) {
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
    this._computeBlocking();
    this._updateDomBlocking();
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
    const padding = this.tileSizePx * 0.5;
    const canvasW = Math.ceil(bounds.width + padding * 2);
    const canvasH = Math.ceil(bounds.height + padding * 2);

    this.canvas.style.width = canvasW + 'px';
    this.canvas.style.height = canvasH + 'px';
    this.canvas.innerHTML = '';

    const cw = this.container.clientWidth || 360;
    const ch = this.container.clientHeight || 500;
    const scale = Math.min(
      (cw - 16) / canvasW,
      (ch - 16) / canvasH,
      1.0
    );
    this.canvas.style.transform = `scale(${scale})`;
    this.canvas.style.transformOrigin = 'center center';

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
        Input.onTileTap(tile, el);
      });

      this.canvas.appendChild(el);
      this.tileElements[tile.id] = el;
    });
  },

  _updateDomBlocking() {
    for (const tile of this.tiles) {
      if (tile.removed) continue;
      const el = this.tileElements[tile.id];
      if (!el) continue;
      if (tile.blocked) {
        el.classList.add('tile--blocked');
        el.classList.remove('tile--free');
      } else {
        el.classList.remove('tile--blocked');
        el.classList.add('tile--free');
      }
    }
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
    // Shuffle critter types among remaining tiles (keep positions)
    const types = remaining.map(t => t.critterType);
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    remaining.forEach((t, i) => { t.critterType = types[i]; });
    this._computeBlocking();
    this.render();
  }
};
