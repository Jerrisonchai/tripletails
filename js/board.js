// board.js — TripleTails v1.0
// Multi-layer grid rendering, tile DOM creation, board state management
const Board = {
  container: null,
  tiles: [],          // All tile objects
  tileElements: {},   // DOM refs by id
  tileSizePx: 52,     // Calculated from CSS variable
  gap: 3,

  // Layer configs
  LAYER_CONFIGS: {
    easy: {
      totalLayers: 4,
      baseCols: 6,
      baseRows: 6,
      densityCurve: [0.80, 0.65, 0.50, 0.35],
      offsetRange: [6, 7, 8, 8],
      brightness: [0.82, 0.88, 0.94, 1.0],
      typeCount: 6,
      totalTileTarget: 54
    },
    hard: {
      totalLayers: 7,
      baseCols: 7,
      baseRows: 7,
      densityCurve: [0.75, 0.65, 0.55, 0.45, 0.35, 0.25, 0.15],
      offsetRange: [10, 9, 8, 7, 6, 5, 4],
      brightness: [0.70, 0.76, 0.82, 0.88, 0.94, 0.97, 1.0],
      typeCount: 8,
      totalTileTarget: 120
    }
  },

  init(containerEl) {
    this.container = containerEl;
    this._readTileSize();
  },

  _readTileSize() {
    const style = getComputedStyle(document.documentElement);
    this.tileSizePx = parseInt(style.getPropertyValue('--tile-size')) || 52;
    this.gap = parseInt(style.getPropertyValue('--tile-gap')) || 3;
  },

  _rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Generate all layers from a tile pool
  generate(difficulty, tilePool) {
    this._readTileSize();
    const config = this.LAYER_CONFIGS[difficulty];
    this.tiles = [];
    this.tileElements = {};
    let poolIdx = 0;

    for (let layer = 0; layer < config.totalLayers; layer++) {
      const cols = config.baseCols - (config.totalLayers > 5 ? layer : 0);
      const rows = config.baseRows - (config.totalLayers > 5 ? layer : 0);
      const density = config.densityCurve[layer];
      const maxOff = config.offsetRange[layer];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (Math.random() > density) continue;
          if (poolIdx >= tilePool.length) break;

          const id = `t-${layer}-${row}-${col}`;
          const tile = {
            id,
            layer,
            row,
            col,
            x: col * (this.tileSizePx + this.gap) + this._rand(-maxOff, maxOff),
            y: row * (this.tileSizePx + this.gap) + this._rand(-maxOff, maxOff),
            critterType: tilePool[poolIdx++],
            color: `var(--clr-card-${tilePool[poolIdx - 1]})`,
            blocked: true,
            brightness: config.brightness[layer],
            removed: false
          };
          this.tiles.push(tile);
        }
      }
    }

    // Compute blocking after all tiles placed
    this._computeBlocking();
    return this.tiles;
  },

  _computeBlocking() {
    const sorted = [...this.tiles].sort((a, b) => b.layer - a.layer);
    for (let i = 0; i < sorted.length; i++) {
      const tile = sorted[i];
      tile.blocked = false;
      for (let j = 0; j < i; j++) {
        const above = sorted[j];
        if (above.layer <= tile.layer) continue;
        const dx = Math.abs(above.x - tile.x);
        const dy = Math.abs(above.y - tile.y);
        if (dx < this.tileSizePx * 0.55 && dy < this.tileSizePx * 0.55) {
          tile.blocked = true;
          break;
        }
      }
    }
  },

  // Recompute blocking for remaining tiles (after tile removed)
  refreshBlocking() {
    const remaining = this.tiles.filter(t => !t.removed);
    const sorted = [...remaining].sort((a, b) => b.layer - a.layer);
    for (const tile of remaining) tile.blocked = false;
    for (let i = 0; i < sorted.length; i++) {
      const tile = sorted[i];
      for (let j = 0; j < i; j++) {
        const above = sorted[j];
        if (above.layer <= tile.layer) continue;
        const dx = Math.abs(above.x - tile.x);
        const dy = Math.abs(above.y - tile.y);
        if (dx < this.tileSizePx * 0.55 && dy < this.tileSizePx * 0.55) {
          tile.blocked = true;
          break;
        }
      }
    }
    this._updateDomBlocking();
  },

  // Render all tiles to DOM
  render() {
    this.container.innerHTML = '';
    this.tileElements = {};

    // Sort by layer ASC (bottom renders first)
    const sorted = [...this.tiles].filter(t => !t.removed)
      .sort((a, b) => a.layer - b.layer);

    sorted.forEach((tile, idx) => {
      const el = document.createElement('div');
      el.className = `tile ${Tiles.getClass(tile.critterType)}`;
      if (tile.blocked) el.classList.add('tile--blocked');
      else el.classList.add('tile--free');
      el.id = tile.id;
      el.style.transform = `translate(${tile.x}px, ${tile.y}px)`;
      el.style.filter = `brightness(${tile.brightness})`;
      el.style.zIndex = tile.layer * 100 + tile.row;
      el.style.animationDelay = `${idx * 15}ms`;
      el.style.animation = 'settleIn 400ms ease-out';
      el.dataset.layer = tile.layer;
      el.dataset.critter = tile.critterType;

      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        Input.onTileTap(tile, el);
      });

      this.container.appendChild(el);
      this.tileElements[tile.id] = el;
    });

    // Center the board
    this._centerBoard(sorted);
  },

  _centerBoard(tiles) {
    if (!tiles.length) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const t of tiles) {
      if (t.x < minX) minX = t.x;
      if (t.x + this.tileSizePx > maxX) maxX = t.x + this.tileSizePx;
      if (t.y < minY) minY = t.y;
      if (t.y + this.tileSizePx > maxY) maxY = t.y + this.tileSizePx;
    }
    const bw = maxX - minX, bh = maxY - minY;
    const cw = this.container.clientWidth, ch = this.container.clientHeight;
    const ox = (cw - bw) / 2 - minX + 10;
    const oy = (ch - bh) / 2 - minY + 10;
    this.container.style.paddingLeft = `${Math.max(0, ox)}px`;
    this.container.style.paddingTop = `${Math.max(0, oy)}px`;
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

  // Get a free tile by critter type (for auto-match)
  getFreeTileOfType(type) {
    return this.tiles.find(t => !t.removed && !t.blocked && t.critterType === type) || null;
  },

  // Count remaining tiles
  remainingCount() {
    return this.tiles.filter(t => !t.removed).length;
  },

  totalCount() {
    return this.tiles.length;
  },

  // Remove tile from board
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

  // Shuffle remaining tiles
  shuffle() {
    const remaining = this.tiles.filter(t => !t.removed);
    // Reassign positions within the same layer
    for (const tile of remaining) {
      const config = this.LAYER_CONFIGS[App.currentDifficulty];
      const maxOff = config.offsetRange[Math.min(tile.layer, config.offsetRange.length - 1)];
      tile.x = tile.col * (this.tileSizePx + this.gap) + this._rand(-maxOff, maxOff);
      tile.y = tile.row * (this.tileSizePx + this.gap) + this._rand(-maxOff, maxOff);
    }
    this._computeBlocking();
    this.render();
  }
};
