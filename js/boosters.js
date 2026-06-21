// boosters.js — TripleTails v1.2
// Phase 4: 5 booster types — Shuffle, Undo, Eject, Peek, Auto-Match
const Boosters = {
  FREE_DAILY: { shuffle: 1, undo: 1, eject: 1 },

  init() {
    this._assignFreeDaily();
  },

  // Grant free daily boosters if new day
  _assignFreeDaily() {
    const inv = Storage.getInventory();
    const lastFreeDay = Storage.get('freeBoosterDay') || 0;
    const today = App._gameDay();
    if (today > lastFreeDay) {
      for (const [type, count] of Object.entries(this.FREE_DAILY)) {
        inv[type] = Math.max(inv[type] || 0, count);
      }
      Storage.setInventory(inv);
      Storage.set('freeBoosterDay', today);
    }
  },

  // ── Booster Logic ──

  useShuffle() {
    const remaining = Board.tiles.filter(t => !t.removed);
    if (remaining.length < 2) return false;
    Board.shuffle();
    Audio.booster();
    return true;
  },

  useUndo() {
    const result = Matching.undoLast();
    if (result) Audio.booster();
    return result;
  },

  useEject() {
    const result = Matching.ejectThree();
    if (result) Audio.booster();
    return result;
  },

  usePeek() {
    // Highlight all blocked tiles for 3 seconds with transparency
    const els = document.querySelectorAll('.tile--blocked');
    if (els.length === 0) return false;
    els.forEach(el => {
      el.classList.add('tile--peeking');
      el.style.filter = 'brightness(0.85) saturate(1.3)';
      el.style.opacity = '0.9';
      el.style.pointerEvents = 'auto';
    });
    Audio.booster();
    setTimeout(() => {
      els.forEach(el => {
        el.classList.remove('tile--peeking');
        el.style.filter = '';
        el.style.opacity = '';
        el.style.pointerEvents = '';
      });
    }, 3000);
    return true;
  },

  useAutoMatch() {
    // Find an accessible triple on the board
    const free = Board.tiles.filter(t => !t.removed && !t.blocked);
    const counts = {};
    for (const t of free) {
      if (!counts[t.critterType]) counts[t.critterType] = [];
      counts[t.critterType].push(t);
    }

    // Find first type with 3+ free tiles
    let matchGroup = null;
    for (const [type, tiles] of Object.entries(counts)) {
      if (tiles.length >= 3) { matchGroup = tiles.slice(0, 3); break; }
    }
    if (!matchGroup) return false;

    Audio.booster();
    // Auto-tap them with staggered delay
    matchGroup.forEach((tile, i) => {
      setTimeout(() => {
        if (!tile.removed) Matching.addToBar(tile);
      }, i * 250);
    });
    return true;
  },

  // ── Count Helpers ──

  getCount(type) {
    const inv = Storage.getInventory();
    return inv[type] || 0;
  },

  hasCharges(type) {
    return this.getCount(type) > 0;
  },

  // ── Dispatch ──

  dispatch(type) {
    if (!this.hasCharges(type)) return false;
    let success = false;
    switch (type) {
      case 'shuffle':   success = this.useShuffle(); break;
      case 'undo':      success = this.useUndo(); break;
      case 'eject':     success = this.useEject(); break;
      case 'peek':      success = this.usePeek(); break;
      case 'autoMatch': success = this.useAutoMatch(); break;
    }
    if (success) {
      Storage.useBooster(type);
      UI.updateBoosterBar();
      // Flash the button
      const btnId = type === 'autoMatch' ? 'btn-automatch' : `btn-${type}`;
      const btn = document.getElementById(btnId);
      if (btn) { btn.classList.add('booster-btn--activated'); setTimeout(() => btn.classList.remove('booster-btn--activated'), 500); }
    }
    return success;
  }
};
