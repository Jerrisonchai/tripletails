// board.js — TripleTails v1.0
// Multi-layer grid rendering, canvas-constrained layout, tile DOM
const Board = {
  container: null,
  canvas: null,
  tiles: [],
  tileElements: {},
  tileSizePx: 44,
  gap: 2,

  LAYER_CONFIGS: {
    easy: {
      totalLayers: 4,
      baseCols: 6,
      baseRows: 6,
      densityCurve: [0.80, 0.65, 0.50, 0.35],
      offsetRange: [4, 5, 5, 6],
      brightness: [0.82, 0.88, 0.94, 1.0],
      typeCount: 6,
      totalTileTarget: 54
    },
    hard: {
      totalLayers: 7,
      baseCols: 7,
      baseRows: 7,
      densityCurve: [0.75, 0.65, 0.55, 0.45, 0.35, 0.25, 0.15],
      offsetRange: [6, 6, 5, 5, 4, 3, 3],
      brightness: [0.70, 0.76, 0.82, 0.88, 0.94, 0.97, 1.0],
      typeCount: 8,
      totalTileTarget: 120
    }
  },

  init(containerEl) {
    this.container = containerEl;
    this._readTileSize();
    // Create canvas element
    this.canvas = document.createElement('div');
    this.canvas.className = 'board-canvas';
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
  },

  _readTileSize() {
    const style = getComputedStyle(document.documentElement);
    this.tileSizePx = parseInt(style.getPropertyValue('--tile-size')) || 44;
    this.gap = parseInt(style.getPropertyValue('--tile-gap')) || 2;
  },

  _rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  generate(difficulty, tilePool) {
    this._readTileSize();
    const config = this.LAYER_CONFIGS[difficulty];
    this.tiles = [];
    this.tileElements = {};
    let poolIdx = 0;
    const halfTile = this.tileSizePx / 2;

    for (let layer = 0; layer < config.totalLayers; layer++) {
      const cols = config.baseCols - (config.totalLayers > 5 ? layer : 0);
      const rows = config.baseRows;
      const density = config.densityCurve[layer];
      const maxOff = config.offsetRange[layer];

      // Each layer gets a slight XY shift for stagger effect
      const layerShiftX = layer * 3;
      const layerShiftY = layer * 2;

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
            // Absolute position in the virtual canvas
            x: halfTile + col * (this.tileSizePx + this.gap) + this._rand(-maxOff, maxOff) + layerShiftX,
            y: halfTile + row * (this.tileSizePx + this.gap) + this._rand(-maxOff, maxOff) + layerShiftY,
            critterType: tilePool[poolIdx++],
            blocked: true,
            brightness: config.brightness[layer],
            removed: false
          };
          this.tiles.push(tile);
        }
      }
    }

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
        if (dx < this.tileSizePx * 0.60 && dy < this.tileSizePx * 0.60) {
          tile.blocked = true;
          break;
        }
      }
    }
  },

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
        if (dx < this.tileSizePx * 0.60 && dy < this.tileSizePx * 0.60) {
          tile.blocked = true;
          break;
        }
      }
    }
    this._updateDomBlocking();
  },

  // Calculate bounding box of all visible tiles
  _getBounds(tiles) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const t of tiles) {
      if (t.x < minX) minX = t.x;
      if (t.x + this.tileSizePx > maxX) maxX = t.x + this.tileSizePx;
      if (t.y < minY) minY = t.y;
      if (t.y + this.tileSizePx > maxY) maxY = t.y + this.tileSizePx;
    }
    return {
      minX, minY,
      width: maxX - minX,
      height: maxY - minY
    };
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

    // Calculate bounds of all tiles
    const bounds = this._getBounds(sorted);
    const padding = this.tileSizePx;
    const canvasW = bounds.width + padding * 2;
    const canvasH = bounds.height + padding * 2;

    // Set canvas size
    this.canvas.style.width = canvasW + 'px';
    this.canvas.style.height = canvasH + 'px';
    this.canvas.innerHTML = '';

    // Calculate scale to fit container
    const cw = this.container.clientWidth || 360;
    const ch = this.container.clientHeight || 500;
    const scaleX = (cw - 16) / canvasW;
    const scaleY = (ch - 16) / canvasH;
    const scale = Math.min(scaleX, scaleY, 1.0); // never scale up past 1.0
    this.canvas.style.transform = `scale(${scale})`;
    this.canvas.style.transformOrigin = 'center center';

    // Render tiles
    sorted.forEach((tile, idx) => {
      const el = document.createElement('div');
      el.className = `tile ${Tiles.getClass(tile.critterType)}`;
      if (tile.blocked) el.classList.add('tile--blocked');
      else el.classList.add('tile--free');
      el.id = tile.id;
      // Offset by bounds min + padding to get canvas-relative position
      const cx = tile.x - bounds.minX + padding;
      const cy = tile.y - bounds.minY + padding;
      el.style.transform = `translate(${cx}px, ${cy}px)`;
      el.style.filter = `brightness(${tile.brightness})`;
      el.style.zIndex = tile.layer * 100 + tile.row;
      el.style.animationDelay = `${idx * 12}ms`;
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
    const config = this.LAYER_CONFIGS[App.currentDifficulty];
    const halfTile = this.tileSizePx / 2;
    for (const tile of remaining) {
      const maxOff = config.offsetRange[Math.min(tile.layer, config.offsetRange.length - 1)];
      const layerShiftX = tile.layer * 3;
      const layerShiftY = tile.layer * 2;
      tile.x = halfTile + tile.col * (this.tileSizePx + this.gap) + this._rand(-maxOff, maxOff) + layerShiftX;
      tile.y = halfTile + tile.row * (this.tileSizePx + this.gap) + this._rand(-maxOff, maxOff) + layerShiftY;
    }
    this._computeBlocking();
    this.render();
  }
};
