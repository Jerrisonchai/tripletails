// matching.js — TripleTails v1.0
// 7-slot holding bar logic, 3-match detection, game over check
const Matching = {
  bar: [],            // Array of {critterType, tileId} objects, max 7
  MAX_SLOTS: 7,
  MATCH_COUNT: 3,

  init() {
    this.bar = [];
    this._renderBar();
  },

  addToBar(tile) {
    if (this.bar.length >= this.MAX_SLOTS) return;

    // Remove tile from board
    Board.removeTile(tile.id);
    Audio.land();

    this.bar.push({ critterType: tile.critterType, tileId: tile.id });

    // Recalculate blocking — removing this tile may unblock lower-layer tiles
    Board.refreshBlocking();

    this._renderBar();
    UI.updateTileCounter();

    // Check for 3-match
    setTimeout(() => this._checkMatches(), 200);
  },

  _checkMatches() {
    // Count each critter type in bar
    const counts = {};
    for (const item of this.bar) {
      counts[item.critterType] = (counts[item.critterType] || 0) + 1;
    }

    // Find first type with 3+
    let matchedType = null;
    for (const [type, count] of Object.entries(counts)) {
      if (count >= this.MATCH_COUNT) {
        matchedType = type;
        break;
      }
    }

    if (matchedType) {
      // Remove 3 of that type from bar
      let removed = 0;
      this.bar = this.bar.filter(item => {
        if (item.critterType === matchedType && removed < this.MATCH_COUNT) {
          removed++;
          return false;
        }
        return true;
      });

      this._renderBar();
      UI.updateTileCounter();
      Audio.match();

      // Animate match in bar slots
      setTimeout(() => this._renderBar(), 50);

      // Check win
      setTimeout(() => this._checkWin(), 100);
    } else {
      // Check game over
      this._checkGameOver();
    }
  },

  _checkWin() {
    const remaining = Board.remainingCount();
    if (remaining === 0 && this.bar.length === 0) {
      // All tiles cleared + bar cleared = WIN!
      setTimeout(() => UI.showWin(), 300);
    }
  },

  _checkGameOver() {
    if (this.bar.length >= this.MAX_SLOTS) {
      // Check if any triple is possible
      const counts = {};
      for (const item of this.bar) {
        counts[item.critterType] = (counts[item.critterType] || 0) + 1;
      }
      const hasMatch = Object.values(counts).some(c => c >= 3);
      
      if (!hasMatch) {
        // Check if there's a 3-match on board that could save us
        // (Simplified: just count free tiles per type)
        const freeTiles = Board.tiles.filter(t => !t.removed && !t.blocked);
        const boardCounts = {};
        for (const t of freeTiles) {
          boardCounts[t.critterType] = (boardCounts[t.critterType] || 0) + 1;
        }
        
        // Check if any type has 2+ in bar and 1+ free on board
        let savable = false;
        for (const [type, barCount] of Object.entries(counts)) {
          if (barCount === 2 && (boardCounts[type] || 0) >= 1) savable = true;
          if (barCount === 1 && (boardCounts[type] || 0) >= 2) savable = true;
        }
        
        if (!savable) {
          setTimeout(() => UI.showGameOver(), 400);
        }
      }
    }
  },

  _renderBar() {
    const slots = document.querySelectorAll('.bar-slot');
    slots.forEach((slot, i) => {
      slot.innerHTML = '';
      slot.classList.remove('bar-slot--filled', 'bar-slot--danger');
      
      if (i < this.bar.length) {
        slot.classList.add('bar-slot--filled');
        const item = this.bar[i];
        const el = document.createElement('div');
        el.className = `tile tile--in-bar ${Tiles.getClass(item.critterType)}`;
        el.style.position = 'relative';
        el.style.animation = 'none';
        el.style.filter = 'brightness(1)';
        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
        slot.appendChild(el);
      }
    });

    // Danger indicator (6+ filled)
    if (this.bar.length >= 6) {
      slots.forEach(s => s.classList.add('bar-slot--danger'));
    }
  },

  // Undo booster: return last tile to board
  undoLast() {
    if (this.bar.length === 0) return false;
    const last = this.bar.pop();
    const tile = Board.tiles.find(t => t.id === last.tileId);
    if (tile) {
      tile.removed = false;
      Board.refreshBlocking();
      Board.render();
    }
    this._renderBar();
    UI.updateTileCounter();
    return true;
  },

  // Eject booster: return 3 tiles from bar to board
  ejectThree() {
    if (this.bar.length === 0) return false;
    const count = Math.min(3, this.bar.length);
    for (let i = 0; i < count; i++) {
      const item = this.bar.pop();
      const tile = Board.tiles.find(t => t.id === item.tileId);
      if (tile) tile.removed = false;
    }
    Board.refreshBlocking();
    Board.render();
    this._renderBar();
    UI.updateTileCounter();
    return true;
  }
};
